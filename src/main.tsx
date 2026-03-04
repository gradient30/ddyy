import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ==================== Service Worker 注册 ====================

/**
 * 注册增强版 Service Worker
 * 支持离线访问、缓存策略、后台同步等功能
 */
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] 浏览器不支持 Service Worker');
    return;
  }

  try {
    // 使用增强版 Service Worker
    const registration = await navigator.serviceWorker.register('/sw-enhanced.js', {
      scope: '/',
      updateViaCache: 'imports',
    });

    console.log('[SW] 注册成功:', registration.scope);

    // 监听更新
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[SW] 新版本可用');
          // 可以在这里触发更新提示
        }
      });
    });

    // 检查是否需要更新
    await registration.update();

  } catch (error) {
    console.error('[SW] 注册失败:', error);
    // 降级到基础版 Service Worker
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('[SW] 已降级到基础版');
    } catch (fallbackError) {
      console.error('[SW] 基础版也注册失败:', fallbackError);
    }
  }
}

// 延迟注册 Service Worker，确保页面先加载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // 使用 requestIdleCallback 在浏览器空闲时注册
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => registerServiceWorker(), { timeout: 2000 });
    } else {
      setTimeout(registerServiceWorker, 1000);
    }
  });
} else {
  registerServiceWorker();
}

// ==================== 应用渲染 ====================

createRoot(document.getElementById("root")!).render(<App />);

// ==================== 性能监控 ====================

/**
 * 性能指标收集（开发环境）
 */
if (import.meta.env.DEV && 'performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('[Performance] 页面加载时间:', {
          DNS: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
          TCP: Math.round(navigation.connectEnd - navigation.connectStart),
          TTFB: Math.round(navigation.responseStart - navigation.requestStart),
          DOM: Math.round(navigation.domComplete - navigation.domInteractive),
          Load: Math.round(navigation.loadEventEnd - navigation.startTime),
        });
      }
    }, 0);
  });
}
