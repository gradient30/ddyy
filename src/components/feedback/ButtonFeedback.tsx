import React, { useRef, useState, useCallback } from 'react';

/**
 * 涟漪效果按钮
 * 点击时产生涟漪动画
 * 
 * 使用方式：
 * <RippleButton onClick={handleClick}>
 *   点击我
 * </RippleButton>
 */
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string;
  children: React.ReactNode;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  className = '',
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleIdRef = useRef(0);

  const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      id: rippleIdRef.current++,
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    // 移除涟漪
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event);
      onClick?.(event);
    },
    [createRipple, onClick]
  );

  return (
    <button
      ref={buttonRef}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      style={{ position: 'relative', overflow: 'hidden' }}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: rippleColor,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      {children}
    </button>
  );
};

/**
 * 触觉反馈按钮
 * 点击时触发设备振动（如果支持）
 */
interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hapticPattern?: number | number[];
  children: React.ReactNode;
}

export const HapticButton: React.FC<HapticButtonProps> = ({
  children,
  hapticPattern = 50,
  onClick,
  ...props
}) => {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      // 触发触觉反馈
      if ('vibrate' in navigator) {
        navigator.vibrate(hapticPattern);
      }
      onClick?.(event);
    },
    [hapticPattern, onClick]
  );

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
};

/**
 * 综合反馈按钮
 * 组合涟漪、触觉、缩放动画
 */
interface FeedbackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'font-bold rounded-2xl transition-all duration-150 active:scale-95';
  
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    ghost: 'bg-transparent hover:bg-muted',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  return (
    <HapticButton
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </HapticButton>
  );
};

/**
 * 图标按钮反馈
 * 带缩放反馈的图标按钮
 */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <RippleButton
      className={`${sizeStyles[size]} rounded-2xl bg-card border-2 border-border hover:border-primary hover:shadow-lg active:scale-90 transition-all duration-150 flex items-center justify-center ${className}`}
      aria-label={label}
      {...props}
    >
      {icon}
    </RippleButton>
  );
};

/**
 * 长按按钮
 * 需要长按才能触发
 */
interface LongPressButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onLongPress: () => void;
  longPressDuration?: number;
}

export const LongPressButton: React.FC<LongPressButtonProps> = ({
  children,
  onLongPress,
  longPressDuration = 500,
  onClick,
  ...props
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);

  const startPress = React.useCallback(() => {
    setIsPressing(true);
    setProgress(0);
    
    // 开始进度动画
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / longPressDuration) * 100, 100);
      setProgress(newProgress);
      
      if (elapsed < longPressDuration) {
        requestAnimationFrame(updateProgress);
      }
    };
    requestAnimationFrame(updateProgress);

    timerRef.current = setTimeout(() => {
      onLongPress();
      setIsPressing(false);
      setProgress(0);
    }, longPressDuration);
  }, [longPressDuration, onLongPress]);

  const endPress = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
    setProgress(0);
  }, []);

  return (
    <button
      className="relative overflow-hidden"
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onClick={onClick}
      {...props}
    >
      {/* 进度条背景 */}
      {isPressing && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-primary transition-none"
          style={{ width: `${progress}%` }}
        />
      )}
      {children}
    </button>
  );
};

export default RippleButton;
