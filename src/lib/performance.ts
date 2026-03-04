/**
 * 性能优化工具库
 * 包含防抖、节流、缓存等常用优化函数
 */

// ==================== 防抖 & 节流 ====================

/**
 * 防抖函数
 * 在指定时间内多次调用只执行最后一次
 * 
 * 使用场景: 搜索框输入、窗口 resize、表单验证
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const callNow = immediate && !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) {
        fn.apply(this, args);
      }
    }, delay);

    if (callNow) {
      fn.apply(this, args);
    }
  };
}

/**
 * 节流函数
 * 在指定时间内只执行一次
 * 
 * 使用场景: 滚动监听、鼠标移动、游戏循环
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 100
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 带请求动画帧的节流
 * 使用 requestAnimationFrame 优化视觉相关操作
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      fn.apply(this, args);
      rafId = null;
    });
  };
}

// ==================== 缓存 ====================

/**
 * 记忆化函数
 * 缓存函数结果，避免重复计算
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;
}

/**
 * 带过期时间的缓存
 */
interface CacheEntry<T> {
  value: T;
  expires: number;
}

export function createCache<T>(defaultTTL: number = 60000) {
  const cache = new Map<string, CacheEntry<T>>();

  return {
    get(key: string): T | undefined {
      const entry = cache.get(key);
      if (!entry) return undefined;

      if (Date.now() > entry.expires) {
        cache.delete(key);
        return undefined;
      }

      return entry.value;
    },

    set(key: string, value: T, ttl?: number): void {
      cache.set(key, {
        value,
        expires: Date.now() + (ttl ?? defaultTTL),
      });
    },

    delete(key: string): void {
      cache.delete(key);
    },

    clear(): void {
      cache.clear();
    },

    has(key: string): boolean {
      return this.get(key) !== undefined;
    },

    size(): number {
      return cache.size;
    },
  };
}

// ==================== 批量操作 ====================

/**
 * 批量处理函数
 * 将多次调用合并为一次执行
 * 
 * 使用场景: 批量更新 DOM、批量发送日志
 */
export function batch<T>(
  fn: (items: T[]) => void,
  delay: number = 0
): (item: T) => void {
  let items: T[] = [];
  let timeoutId: NodeJS.Timeout | null = null;

  return function (item: T) {
    items.push(item);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(items);
      items = [];
      timeoutId = null;
    }, delay);
  };
}

/**
 * 微任务批处理
 * 使用 Promise.resolve() 实现微任务批处理
 */
export function microtaskBatch<T>(fn: (items: T[]) => void): (item: T) => void {
  let items: T[] = [];
  let scheduled = false;

  return function (item: T) {
    items.push(item);

    if (!scheduled) {
      scheduled = true;
      Promise.resolve().then(() => {
        fn(items);
        items = [];
        scheduled = false;
      });
    }
  };
}

// ==================== 懒加载 ====================

/**
 * 动态导入包装器
 * 带重试机制
 */
export async function lazyImport<T>(
  importer: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < retries; i++) {
    try {
      return await importer();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}

// ==================== 性能测量 ====================

/**
 * 测量函数执行时间
 */
export function measurePerformance<T>(
  fn: () => T,
  label: string = 'Performance'
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`[${label}] 执行时间: ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * 异步函数性能测量
 */
export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  label: string = 'Performance'
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`[${label}] 执行时间: ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * 性能标记
 * 使用 Performance API 标记关键时间点
 */
export function mark(name: string): void {
  if ('performance' in window) {
    performance.mark(name);
  }
}

/**
 * 性能测量
 * 计算两个标记之间的时间差
 */
export function measure(name: string, startMark: string, endMark: string): void {
  if ('performance' in window) {
    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      if (entries.length > 0) {
        console.log(`[${name}] 耗时: ${entries[0].duration.toFixed(2)}ms`);
      }
    } catch (e) {
      console.warn(`测量失败: ${name}`, e);
    }
  }
}

// ==================== 资源预加载 ====================

/**
 * 预加载图片
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 预加载多个图片
 */
export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(src => preloadImage(src)));
}

/**
 * 预加载关键资源
 */
export function preloadCriticalResources(): void {
  // 预加载关键字体
  const fonts = [
    // 添加需要预加载的字体
  ];

  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = font;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// ==================== 内存管理 ====================

/**
 * 创建可释放的资源引用
 * 帮助管理大型对象的内存
 */
export function createDisposable<T extends { dispose?: () => void }>(
  factory: () => T
): { value: T; dispose: () => void } {
  const value = factory();
  
  return {
    value,
    dispose: () => {
      value.dispose?.();
    },
  };
}

/**
 * 清理事件监听器
 */
export function createEventCleanup(): {
  add: <K extends keyof WindowEventMap>(
    target: EventTarget,
    type: K,
    listener: (event: WindowEventMap[K]) => any,
    options?: AddEventListenerOptions
  ) => void;
  clean: () => void;
} {
  const cleanups: Array<() => void> = [];

  return {
    add(target, type, listener, options) {
      target.addEventListener(type, listener as EventListener, options);
      cleanups.push(() => {
        target.removeEventListener(type, listener as EventListener, options);
      });
    },
    clean() {
      cleanups.forEach(cleanup => cleanup());
      cleanups.length = 0;
    },
  };
}

export default {
  debounce,
  throttle,
  rafThrottle,
  memoize,
  createCache,
  batch,
  microtaskBatch,
  lazyImport,
  measurePerformance,
  measureAsyncPerformance,
  mark,
  measure,
  preloadImage,
  preloadImages,
  preloadCriticalResources,
  createDisposable,
  createEventCleanup,
};
