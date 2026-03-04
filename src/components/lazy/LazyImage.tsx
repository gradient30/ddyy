/**
 * 懒加载图片组件
 * 支持 Intersection Observer 和占位符
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** 图片地址 */
  src: string;
  /** 替代文本 */
  alt: string;
  /** 占位符图片 */
  placeholder?: string;
  /** 加载时的背景色 */
  backgroundColor?: string;
  /** 是否使用模糊占位符效果 */
  blurPlaceholder?: boolean;
  /** 图片加载完成回调 */
  onLoad?: () => void;
  /** 图片加载失败回调 */
  onError?: () => void;
  /** 根外边距（提前加载距离） */
  rootMargin?: string;
  /** 容器类名 */
  containerClassName?: string;
}

/**
 * 懒加载图片组件
 * 
 * 使用示例:
 * <LazyImage
 *   src="/images/game-scene.png"
 *   alt="游戏场景"
 *   placeholder="/images/placeholder.svg"
 *   className="w-full h-64 object-cover"
 * />
 */
export function LazyImage({
  src,
  alt,
  placeholder = '/placeholder.svg',
  backgroundColor = '#f0f0f0',
  blurPlaceholder = true,
  onLoad,
  onError,
  rootMargin = '50px',
  containerClassName,
  className,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer 检测图片是否进入视口
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 如果浏览器不支持 IntersectionObserver，直接加载图片
    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin,
        threshold: 0.01,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  // 预加载图片
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      onError?.();
    };

    img.src = src;

    // 如果图片已经缓存，直接标记为加载完成
    if (img.complete) {
      setIsLoaded(true);
      onLoad?.();
    }
  }, [isInView, src, onLoad, onError]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
      style={{ backgroundColor }}
    >
      {/* 占位符图片 */}
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
            blurPlaceholder && 'blur-sm',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
        />
      )}

      {/* 实际图片 */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}

      {/* 加载失败提示 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <span className="text-4xl">🖼️</span>
            <p className="mt-2 text-sm text-gray-500">图片加载失败</p>
          </div>
        </div>
      )}

      {/* 加载动画 */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#5A9B8C] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

/**
 * 懒加载背景图片组件
 */
interface LazyBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 背景图片地址 */
  src: string;
  /** 占位符图片 */
  placeholder?: string;
  /** 加载时的背景色 */
  backgroundColor?: string;
  rootMargin?: string;
}

export function LazyBackground({
  src,
  placeholder,
  backgroundColor = '#f0f0f0',
  rootMargin = '50px',
  className,
  children,
  ...props
}: LazyBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = src;

    if (img.complete) {
      setIsLoaded(true);
    }
  }, [isInView, src]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        backgroundColor,
        backgroundImage: isLoaded 
          ? `url(${src})` 
          : placeholder 
            ? `url(${placeholder})` 
            : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.5s ease',
        ...props.style,
      }}
      {...props}
    >
      {/* 加载动画层 */}
      {!isLoaded && !placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-4 border-[#5A9B8C] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {children}
    </div>
  );
}

export default LazyImage;
