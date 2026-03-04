import React, { useEffect, useState } from 'react';

/**
 * 加载动画组件
 * 多种加载动画效果
 */

/**
 * 经典加载转圈
 */
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}> = ({ size = 'md', color = 'hsl(var(--primary))', className = '' }) => {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={`${sizeMap[size]} rounded-full border-transparent animate-spin ${className}`}
      style={{
        borderTopColor: color,
        borderLeftColor: `${color}66`,
      }}
    />
  );
};

/**
 * 脉冲加载
 */
export const LoadingPulse: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`relative ${sizeMap[size]} ${className}`}>
      <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
      <div className="absolute inset-2 rounded-full bg-primary/50 animate-pulse" />
      <div className="absolute inset-4 rounded-full bg-primary" />
    </div>

  );
};

/**
 * 点状加载
 */
export const LoadingDots: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
};

/**
 * 骨架屏加载
 */
export const Skeleton: React.FC<{
  className?: string;
  circle?: boolean;
}> = ({ className = '', circle = false }) => {
  return (
    <div
      className={`bg-muted animate-pulse ${circle ? 'rounded-full' : 'rounded-xl'} ${className}`}
    />
  );
};

/**
 * 卡片骨架屏
 */
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-card rounded-3xl p-6 border border-border shadow-lg space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton circle className="w-16 h-16" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
};

/**
 * 全屏加载
 */
export const FullscreenLoader: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = '加载中...', className = '' }) => {
  return (
    <div className={`fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-[100] ${className}`}>
      <LoadingPulse size="lg" />
      <p className="mt-6 text-lg font-bold text-foreground">{message}</p>
    </div>
  );
};

/**
 * 渐进加载图片
 */
export const ProgressiveImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholderColor?: string;
}> = ({ src, alt, className = '', placeholderColor = 'hsl(var(--muted))' }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundColor: placeholderColor }}
      >
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      
      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full transition-all duration-500 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

/**
 * 带重试的加载组件
 */
interface LoadingWithRetryProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  onRetry: () => void;
  children: React.ReactNode;
}

export const LoadingWithRetry: React.FC<LoadingWithRetryProps> = ({
  isLoading,
  isError,
  error,
  onRetry,
  children,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingPulse size="lg" />
        <p className="mt-4 text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <span className="text-6xl mb-4">😅</span>
        <h3 className="text-xl font-bold text-foreground mb-2">加载出错了</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {error?.message || '请检查网络连接后重试'}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 active:scale-95 transition-all"
        >
          🔄 重新加载
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * 加载进度条
 */
export const LoadingProgress: React.FC<{
  progress: number;
  className?: string;
}> = ({ progress, className = '' }) => {
  return (
    <div className={`w-full h-2 bg-muted rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};

/**
 * 模拟进度加载
 */
export const SimulatedProgress: React.FC<{
  duration?: number;
  onComplete?: () => void;
  className?: string;
}> = ({ duration = 3000, onComplete, className = '' }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime: number;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);

      if (elapsed < duration) {
        rafId = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [duration, onComplete]);

  return (
    <div className={`w-full ${className}`}>
      <LoadingProgress progress={progress} />
      <p className="text-center text-sm text-muted-foreground mt-2">
        {Math.round(progress)}%
      </p>
    </div>
  );
};

export default LoadingSpinner;
