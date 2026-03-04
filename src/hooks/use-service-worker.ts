/**
 * Service Worker 管理 Hook
 * 提供 SW 注册、更新、消息通信等功能
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ServiceWorkerState {
  /** 是否已注册 */
  isRegistered: boolean;
  /** 是否有更新 */
  hasUpdate: boolean;
  /** 是否处于离线状态 */
  isOffline: boolean;
  /** 缓存状态 */
  cacheStatus: Record<string, number>;
  /** 错误信息 */
  error: string | null;
}

export interface ServiceWorkerActions {
  /** 检查更新 */
  checkForUpdate: () => Promise<void>;
  /** 跳过等待并激活新版本 */
  skipWaiting: () => Promise<void>;
  /** 清除所有缓存 */
  clearCache: () => Promise<void>;
  /** 获取缓存状态 */
  getCacheStatus: () => Promise<Record<string, number>>;
  /** 发送消息给 SW */
  postMessage: (type: string, payload?: any) => Promise<any>;
}

/**
 * Service Worker Hook
 * 
 * 使用示例:
 * const { state, actions } = useServiceWorker();
 * 
 * // 检查更新
 * useEffect(() => {
 *   if (state.hasUpdate) {
 *     toast.info('有新版本可用，点击更新', {
 *       action: {
 *         label: '更新',
 *         onClick: actions.skipWaiting
 *       }
 *     });
 *   }
 * }, [state.hasUpdate]);
 */
export function useServiceWorker(swPath: string = '/sw-enhanced.js'): ServiceWorkerState & ServiceWorkerActions {
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    hasUpdate: false,
    isOffline: !navigator.onLine,
    cacheStatus: {},
    error: null,
  });

  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const messageChannelRef = useRef<MessageChannel | null>(null);

  // 注册 Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setState(prev => ({ ...prev, error: '浏览器不支持 Service Worker' }));
      return;
    }

    let isMounted = true;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register(swPath, {
          scope: '/',
          updateViaCache: 'imports',
        });

        if (!isMounted) return;

        registrationRef.current = registration;

        // 监听新的 Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, hasUpdate: true }));
            }
          });
        });

        // 检查是否有等待中的更新
        if (registration.waiting && navigator.serviceWorker.controller) {
          setState(prev => ({ ...prev, hasUpdate: true }));
        }

        setState(prev => ({ ...prev, isRegistered: true }));

        // 初始化消息通道
        messageChannelRef.current = new MessageChannel();
        messageChannelRef.current.port1.onmessage = (event) => {
          console.log('[SW Hook] 收到消息:', event.data);
        };

        // 发送端口给 SW
        if (registration.active) {
          registration.active.postMessage(
            { type: 'INIT_PORT' },
            [messageChannelRef.current.port2]
          );
        }

      } catch (error) {
        console.error('[SW Hook] 注册失败:', error);
        if (isMounted) {
          setState(prev => ({ 
            ...prev, 
            error: error instanceof Error ? error.message : '注册失败' 
          }));
        }
      }
    };

    registerSW();

    // 监听网络状态
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 监听来自 SW 的消息
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      
      switch (type) {
        case 'UPDATE_AVAILABLE':
          setState(prev => ({ ...prev, hasUpdate: true }));
          break;
        case 'CACHE_STATUS':
          setState(prev => ({ ...prev, cacheStatus: payload }));
          break;
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [swPath]);

  /**
   * 检查更新
   */
  const checkForUpdate = useCallback(async () => {
    const registration = registrationRef.current;
    if (!registration) return;

    try {
      await registration.update();
      console.log('[SW Hook] 更新检查完成');
    } catch (error) {
      console.error('[SW Hook] 检查更新失败:', error);
    }
  }, []);

  /**
   * 跳过等待并激活新版本
   */
  const skipWaiting = useCallback(async () => {
    const registration = registrationRef.current;
    if (!registration?.waiting) return;

    try {
      // 发送 SKIP_WAITING 消息给新的 SW
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // 等待新的 SW 接管
      await new Promise<void>((resolve) => {
        const listener = () => {
          if (registration.active) {
            navigator.serviceWorker.removeEventListener('controllerchange', listener);
            resolve();
          }
        };
        navigator.serviceWorker.addEventListener('controllerchange', listener);
      });

      // 刷新页面以使用新版本
      window.location.reload();
    } catch (error) {
      console.error('[SW Hook] 激活失败:', error);
    }
  }, []);

  /**
   * 清除所有缓存
   */
  const clearCache = useCallback(async () => {
    const registration = registrationRef.current;
    if (!registration?.active) return;

    try {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
      setState(prev => ({ ...prev, cacheStatus: {} }));
    } catch (error) {
      console.error('[SW Hook] 清除缓存失败:', error);
    }
  }, []);

  /**
   * 获取缓存状态
   */
  const getCacheStatus = useCallback(async (): Promise<Record<string, number>> => {
    const registration = registrationRef.current;
    if (!registration?.active) return {};

    return new Promise((resolve) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        const status = event.data || {};
        setState(prev => ({ ...prev, cacheStatus: status }));
        resolve(status);
      };

      registration.active!.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [channel.port2]
      );

      // 超时处理
      setTimeout(() => resolve({}), 5000);
    });
  }, []);

  /**
   * 发送消息给 Service Worker
   */
  const postMessage = useCallback(async (type: string, payload?: any): Promise<any> => {
    const registration = registrationRef.current;
    if (!registration?.active) {
      throw new Error('Service Worker 未激活');
    }

    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      registration.active!.postMessage(
        { type, payload },
        [channel.port2]
      );

      // 超时处理
      setTimeout(() => reject(new Error('消息超时')), 5000);
    });
  }, []);

  return {
    ...state,
    checkForUpdate,
    skipWaiting,
    clearCache,
    getCacheStatus,
    postMessage,
  };
}

/**
 * 检查 Service Worker 支持
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * 检查是否处于离线状态
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * 请求后台同步
 */
export async function requestBackgroundSync(tag: string = 'background-sync'): Promise<void> {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    throw new Error('不支持后台同步');
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register(tag);
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('浏览器不支持通知');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  return await Notification.requestPermission();
}

/**
 * 显示通知
 */
export function showNotification(
  title: string, 
  options?: NotificationOptions
): Notification | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  return new Notification(title, {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    ...options,
  });
}

export default useServiceWorker;
