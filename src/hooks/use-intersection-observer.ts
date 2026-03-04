/**
 * Intersection Observer Hook
 * 用于实现无限滚动、懒加载等功能
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  /** 根元素（默认为视口） */
  root?: Element | null;
  /** 根外边距，提前触发加载的距离 */
  rootMargin?: string;
  /** 交叉比例阈值 */
  threshold?: number | number[];
  /** 是否只触发一次 */
  triggerOnce?: boolean;
  /** 初始是否可见 */
  initialInView?: boolean;
  /** 进入视口回调 */
  onEnter?: () => void;
  /** 离开视口回调 */
  onLeave?: () => void;
}

interface UseIntersectionObserverReturn {
  /** 绑定到目标元素的 ref */
  ref: React.RefObject<HTMLElement>;
  /** 是否在视口中 */
  inView: boolean;
  /** 是否已经触发过（triggerOnce 时有用） */
  hasTriggered: boolean;
}

/**
 * Intersection Observer Hook
 * 
 * 使用示例:
 * const { ref, inView } = useIntersectionObserver({
 *   rootMargin: '100px',
 *   triggerOnce: true,
 * });
 * 
 * <div ref={ref}>
 *   {inView && <HeavyComponent />}
 * </div>
 */
export function useIntersectionObserver({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  triggerOnce = false,
  initialInView = false,
  onEnter,
  onLeave,
}: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn {
  const [inView, setInView] = useState(initialInView);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      const isIntersecting = entry.isIntersecting;

      setInView(isIntersecting);

      if (isIntersecting) {
        setHasTriggered(true);
        onEnter?.();

        if (triggerOnce && observerRef.current && elementRef.current) {
          observerRef.current.unobserve(elementRef.current);
        }
      } else {
        onLeave?.();
      }
    },
    [triggerOnce, onEnter, onLeave]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 清理旧的 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 创建新的 observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold,
    });

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [root, rootMargin, threshold, handleIntersection]);

  return {
    ref: elementRef as React.RefObject<HTMLElement>,
    inView,
    hasTriggered,
  };
}

/**
 * 无限滚动 Hook
 * 
 * 使用示例:
 * const { loaderRef, hasMore, loadMore } = useInfiniteScroll({
 *   onLoadMore: async () => {
 *     const newData = await fetchMore(page + 1);
 *     setData(prev => [...prev, ...newData]);
 *     return newData.length > 0;
 *   },
 * });
 * 
 * <div>
 *   {data.map(item => <Item key={item.id} {...item} />)}
 *   {hasMore && <div ref={loaderRef}>加载中...</div>}
 * </div>
 */
interface UseInfiniteScrollOptions {
  /** 加载更多数据的回调 */
  onLoadMore: () => Promise<boolean>;
  /** 是否还有更多数据 */
  hasMore: boolean;
  /** 根外边距 */
  rootMargin?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 加载延迟（防抖） */
  delay?: number;
}

interface UseInfiniteScrollReturn {
  /** 绑定到加载触发元素的 ref */
  loaderRef: React.RefObject<HTMLElement>;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否有更多数据 */
  hasMore: boolean;
  /** 手动触发加载 */
  loadMore: () => Promise<void>;
  /** 重置状态 */
  reset: () => void;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore: initialHasMore,
  rootMargin = '100px',
  disabled = false,
  delay = 300,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const loaderRef = useRef<HTMLElement>(null);
  const loadingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || disabled) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      const result = await onLoadMore();
      setHasMore(result);
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [onLoadMore, hasMore, disabled]);

  const { ref, inView } = useIntersectionObserver({
    rootMargin,
    threshold: 0,
  });

  // 将 intersection observer 的 ref 赋值给 loaderRef
  useEffect(() => {
    if (loaderRef.current && ref.current !== loaderRef.current) {
      // 这里我们直接使用 loaderRef
    }
  }, [ref]);

  // 监听 inView 变化，触发加载
  useEffect(() => {
    if (inView && hasMore && !disabled && !loadingRef.current) {
      // 防抖处理
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        loadMore();
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inView, hasMore, disabled, loadMore, delay]);

  const reset = useCallback(() => {
    setHasMore(true);
    loadingRef.current = false;
    setIsLoading(false);
  }, []);

  return {
    loaderRef: ref as React.RefObject<HTMLElement>,
    isLoading,
    hasMore,
    loadMore,
    reset,
  };
}

/**
 * 元素可见性 Hook
 * 用于检测元素是否在视口中，支持触发一次或持续监听
 * 
 * 使用示例:
 * const { ref, inView } = useInView({
 *   threshold: 0.5,
 *   triggerOnce: true,
 * });
 */
export function useInView(options?: UseIntersectionObserverOptions): {
  ref: React.RefObject<HTMLElement>;
  inView: boolean;
} {
  const { ref, inView } = useIntersectionObserver(options);
  return { ref, inView };
}

export default useIntersectionObserver;
