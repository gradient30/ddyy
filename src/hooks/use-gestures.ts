import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * 手势操作Hook
 * 支持滑动手势、长按、双击等
 * 
 * 使用方式：
 * const { handlers, direction, deltaX } = useSwipe({
 *   onSwipeLeft: () => navigate('/next'),
 *   onSwipeRight: () => navigate('/prev'),
 * });
 * 
 * <div {...handlers}>内容</div>
 */

interface SwipeConfig {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  preventDefault?: boolean;
}

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isSwiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

export function useSwipe(config: SwipeConfig = {}) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeStart,
    onSwipeEnd,
    preventDefault = true,
  } = config;

  const [state, setState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
    direction: null,
  });

  const touchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setState({
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      isSwiping: true,
      direction: null,
    });

    onSwipeStart?.();
  }, [onSwipeStart]);

  const touchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!state.isSwiping) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - state.startX;
    const deltaY = clientY - state.startY;

    // 判断滑动方向
    let direction: SwipeState['direction'] = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    setState(prev => ({
      ...prev,
      currentX: clientX,
      currentY: clientY,
      direction,
    }));

    if (preventDefault) {
      e.preventDefault();
    }
  }, [state.isSwiping, state.startX, state.startY, preventDefault]);

  const touchEnd = useCallback(() => {
    if (!state.isSwiping) return;

    const deltaX = state.currentX - state.startX;
    const deltaY = state.currentY - state.startY;

    // 判断是否触发滑动
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // 垂直滑动
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    setState(prev => ({
      ...prev,
      isSwiping: false,
      direction: null,
    }));

    onSwipeEnd?.();
  }, [state, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipeEnd]);

  const deltaX = state.currentX - state.startX;
  const deltaY = state.currentY - state.startY;

  return {
    handlers: {
      onTouchStart: touchStart,
      onTouchMove: touchMove,
      onTouchEnd: touchEnd,
      onMouseDown: touchStart,
      onMouseMove: touchMove,
      onMouseUp: touchEnd,
      onMouseLeave: touchEnd,
    },
    state: {
      ...state,
      deltaX,
      deltaY,
    },
  };
}

/**
 * 长按Hook
 * 
 * 使用方式：
 * const { handlers, isPressing, progress } = useLongPress({
 *   onLongPress: () => showMenu(),
 *   duration: 500,
 * });
 */
interface LongPressConfig {
  onLongPress: () => void;
  onPressStart?: () => void;
  onPressEnd?: () => void;
  duration?: number;
}

export function useLongPress(config: LongPressConfig) {
  const { onLongPress, onPressStart, onPressEnd, duration = 500 } = config;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number>(0);

  const startPress = useCallback(() => {
    setIsPressing(true);
    setProgress(0);
    startTimeRef.current = Date.now();
    onPressStart?.();

    // 更新进度
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (elapsed < duration && isPressing) {
        requestAnimationFrame(updateProgress);
      }
    };
    requestAnimationFrame(updateProgress);

    timerRef.current = setTimeout(() => {
      onLongPress();
      setIsPressing(false);
      setProgress(0);
    }, duration);
  }, [duration, onLongPress, onPressStart]);

  const endPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
    setProgress(0);
    onPressEnd?.();
  }, [onPressEnd]);

  return {
    handlers: {
      onTouchStart: startPress,
      onTouchEnd: endPress,
      onMouseDown: startPress,
      onMouseUp: endPress,
      onMouseLeave: endPress,
    },
    isPressing,
    progress,
  };
}

/**
 * 双击Hook
 * 
 * 使用方式：
 * const { handlers } = useDoubleTap({
 *   onDoubleTap: () => zoom(),
 *   delay: 300,
 * });
 */
interface DoubleTapConfig {
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  delay?: number;
}

export function useDoubleTap(config: DoubleTapConfig) {
  const { onDoubleTap, onSingleTap, delay = 300 } = config;
  const tapCountRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTap = useCallback(() => {
    tapCountRef.current++;

    if (tapCountRef.current === 1) {
      timerRef.current = setTimeout(() => {
        if (tapCountRef.current === 1) {
          onSingleTap?.();
        }
        tapCountRef.current = 0;
      }, delay);
    } else if (tapCountRef.current === 2) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      onDoubleTap();
      tapCountRef.current = 0;
    }
  }, [delay, onDoubleTap, onSingleTap]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    handlers: {
      onClick: handleTap,
      onTouchEnd: handleTap,
    },
  };
}

/**
 * 拖拽Hook
 * 
 * 使用方式：
 * const { handlers, position, isDragging } = useDrag({
 *   onDrag: (pos) => updatePosition(pos),
 *   bounds: { left: 0, right: 300, top: 0, bottom: 300 },
 * });
 */
interface DragBounds {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

interface DragConfig {
  onDrag?: (position: { x: number; y: number }) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  bounds?: DragBounds;
}

export function useDrag(config: DragConfig = {}) {
  const { onDrag, onDragStart, onDragEnd, bounds } = config;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });

  const startDrag = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    startPosRef.current = { x: clientX, y: clientY };
    currentPosRef.current = { ...position };
    setIsDragging(true);
    onDragStart?.();
  }, [position, onDragStart]);

  const doDrag = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    let newX = currentPosRef.current.x + (clientX - startPosRef.current.x);
    let newY = currentPosRef.current.y + (clientY - startPosRef.current.y);

    // 应用边界
    if (bounds) {
      newX = Math.max(bounds.left ?? -Infinity, Math.min(bounds.right ?? Infinity, newX));
      newY = Math.max(bounds.top ?? -Infinity, Math.min(bounds.bottom ?? Infinity, newY));
    }

    const newPosition = { x: newX, y: newY };
    setPosition(newPosition);
    onDrag?.(newPosition);
  }, [isDragging, bounds, onDrag]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    onDragEnd?.();
  }, [onDragEnd]);

  return {
    handlers: {
      onTouchStart: startDrag,
      onTouchMove: doDrag,
      onTouchEnd: endDrag,
      onMouseDown: startDrag,
      onMouseMove: doDrag,
      onMouseUp: endDrag,
      onMouseLeave: endDrag,
    },
    position,
    isDragging,
  };
}

/**
 * 摇一摇Hook
 * 
 * 使用方式：
 * const { isSupported, shakeCount } = useShake({
 *   onShake: () => resetGame(),
 *   threshold: 15,
 * });
 */
interface ShakeConfig {
  onShake: () => void;
  threshold?: number;
  cooldown?: number;
}

export function useShake(config: ShakeConfig) {
  const { onShake, threshold = 15, cooldown = 1000 } = config;
  const [isSupported, setIsSupported] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const lastShakeRef = useRef(0);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const lastZRef = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const { x = 0, y = 0, z = 0 } = acc;

      const deltaX = Math.abs(x - lastXRef.current);
      const deltaY = Math.abs(y - lastYRef.current);
      const deltaZ = Math.abs(z - lastZRef.current);

      if (deltaX + deltaY + deltaZ > threshold) {
        const now = Date.now();
        if (now - lastShakeRef.current > cooldown) {
          lastShakeRef.current = now;
          setShakeCount(c => c + 1);
          onShake();
        }
      }

      lastXRef.current = x;
      lastYRef.current = y;
      lastZRef.current = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isSupported, threshold, cooldown, onShake]);

  return { isSupported, shakeCount };
}

export default useSwipe;
