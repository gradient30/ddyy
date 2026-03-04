/**
 * 懒加载路由组件
 * 支持代码分割和加载状态
 */

import { Suspense, lazy, ComponentType } from 'react';
import { LoadingPage } from '@/components/loading/LoadingStates';

/**
 * 创建懒加载页面
 * 
 * 使用示例:
 * const ColoringPage = lazyRoute(() => import('@/pages/ColoringPage'));
 * 
 * 路由配置:
 * <Route path="/coloring" element={<ColoringPage />} />
 */
export function lazyRoute<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options?: {
    /** 自定义加载组件 */
    fallback?: React.ReactNode;
    /** 预加载超时时间（毫秒） */
    timeout?: number;
  }
) {
  const LazyComponent = lazy(() => {
    const { timeout = 10000 } = options || {};
    
    return Promise.race([
      factory(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('加载超时')), timeout);
      }),
    ]);
  });

  return function LazyRouteWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={options?.fallback || <LoadingPage />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * 预加载路由组件
 * 
 * 使用示例:
 * const ColoringPage = lazyRoute(() => import('@/pages/ColoringPage'));
 * 
 * // 鼠标悬停时预加载
 * <div onMouseEnter={() => prefetchRoute(() => import('@/pages/ColoringPage'))}>
 *   道闸涂色
 * </div>
 */
export function prefetchRoute<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): void {
  // 使用 requestIdleCallback 在浏览器空闲时预加载
  const doPrefetch = () => {
    factory().catch(() => {
      // 预加载失败不抛出错误
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(doPrefetch, { timeout: 2000 });
  } else {
    setTimeout(doPrefetch, 0);
  }
}

/**
 * 懒加载组件（通用）
 * 
 * 使用示例:
 * const HeavyComponent = lazyComponent(() => import('./HeavyComponent'));
 */
export function lazyComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(factory);

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <LoadingPage />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

export default lazyRoute;
