import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 页面过渡动画包装组件
 * 为路由切换添加平滑的过渡效果
 * 
 * 使用方式：
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 */
interface PageTransitionProps {
  children: React.ReactNode;
  mode?: 'slide' | 'fade' | 'scale' | 'none';
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  mode = 'slide' 
}) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (children !== displayChildren) {
      // 开始退出动画
      setIsTransitioning(true);
      setAnimationClass(getExitAnimation(mode));

      // 等待退出动画完成后切换内容
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setAnimationClass(getEnterAnimation(mode));
        
        // 清除过渡状态
        setTimeout(() => {
          setIsTransitioning(false);
          setAnimationClass('');
        }, 300);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [children, location.pathname, mode]);

  const getEnterAnimation = (m: string): string => {
    switch (m) {
      case 'slide': return 'animate-slide-in-right';
      case 'fade': return 'animate-fade-in';
      case 'scale': return 'animate-scale-in';
      default: return '';
    }
  };

  const getExitAnimation = (m: string): string => {
    switch (m) {
      case 'slide': return 'animate-slide-out-left';
      case 'fade': return 'animate-fade-out';
      case 'scale': return 'animate-scale-out';
      default: return '';
    }
  };

  return (
    <div 
      className={`w-full min-h-screen ${animationClass} ${isTransitioning ? 'pointer-events-none' : ''}`}
      style={{ 
        willChange: isTransitioning ? 'transform, opacity' : 'auto',
      }}
    >
      {displayChildren}
    </div>
  );
};

/**
 * 页面加载动画
 * 页面内容加载时的进入动画
 */
export const PageLoadAnimation: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {children}
    </div>
  );
};

/**
 * 交错动画容器
 * 子元素依次出现
 */
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 100, className = '' }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <StaggerItem delay={index * staggerDelay}>
          {child}
        </StaggerItem>
      ))}
    </div>
  );
};

const StaggerItem: React.FC<{
  children: React.ReactNode;
  delay: number;
}> = ({ children, delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
      }`}
    >
      {children}
    </div>
  );
};

/**
 * 路由切换进度条
 * 类似YouTube的顶部进度条
 */
export const RouteProgressBar: React.FC = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 路由变化时开始进度条
    setIsVisible(true);
    setProgress(0);

    // 快速进度到80%
    const timer1 = setTimeout(() => setProgress(80), 100);
    
    // 完成
    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
    }, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-0 left-0 h-1 bg-primary z-[100] transition-all duration-300 ease-out"
      style={{ 
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
      }}
    />
  );
};

export default PageTransition;
