/**
 * 道闸乐园 - 增强版 Service Worker
 * 版本: 2.0.0
 * 
 * 功能特性:
 * - 精细化缓存策略
 * - 离线页面支持
 * - 后台同步
 * - 缓存清理
 */

const CACHE_VERSION = 'v2';
const CACHE_NAMES = {
  static: `static-${CACHE_VERSION}`,
  dynamic: `dynamic-${CACHE_VERSION}`,
  images: `images-${CACHE_VERSION}`,
  fonts: `fonts-${CACHE_VERSION}`,
  offline: `offline-${CACHE_VERSION}`,
};

// 静态资源缓存列表（构建时生成）
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
];

// 需要预缓存的关键资源
const PRECACHE_ASSETS = [
  ...STATIC_ASSETS,
];

// 缓存策略配置
const CACHE_STRATEGIES = {
  // 静态资源: 缓存优先，离线可用
  static: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30天
    maxEntries: 100,
  },
  // 动态资源: 网络优先，离线回退缓存
  dynamic: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
    maxEntries: 200,
  },
  // 图片资源: 缓存优先
  images: {
    maxAge: 60 * 24 * 60 * 60 * 1000, // 60天
    maxEntries: 300,
  },
  // 字体资源: 长期缓存
  fonts: {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1年
    maxEntries: 50,
  },
};

// ==================== 安装阶段 ====================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    Promise.all([
      // 预缓存关键资源
      caches.open(CACHE_NAMES.static).then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      }),
      // 缓存离线页面
      caches.open(CACHE_NAMES.offline).then((cache) => {
        return cache.add('/offline.html');
      }),
    ]).then(() => {
      console.log('[SW] Pre-caching complete');
      self.skipWaiting();
    })
  );
});

// ==================== 激活阶段 ====================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    Promise.all([
      // 清理旧版本缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // 保留当前版本的缓存
              return Object.values(CACHE_NAMES).every(
                (currentName) => !name.startsWith(currentName.split('-')[0])
              ) || !Object.values(CACHE_NAMES).includes(name);
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // 获取通知权限（可选）
      self.registration.navigationPreload?.enable(),
    ]).then(() => {
      console.log('[SW] Activation complete');
      self.clients.claim();
    })
  );
});

// ==================== 请求拦截 ====================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非 GET 请求
  if (request.method !== 'GET') return;

  // 跳过 chrome-extension 和其他非 http(s) 请求
  if (!url.protocol.startsWith('http')) return;

  // 根据资源类型选择缓存策略
  const strategy = getCacheStrategy(request, url);
  
  event.respondWith(handleRequest(request, strategy));
});

/**
 * 根据请求类型确定缓存策略
 */
function getCacheStrategy(request, url) {
  const pathname = url.pathname;
  const accept = request.headers.get('accept') || '';

  // HTML 导航请求
  if (request.mode === 'navigate') {
    return 'network-first';
  }

  // JavaScript/CSS 文件
  if (pathname.match(/\.(js|css)$/)) {
    return 'cache-first';
  }

  // 图片资源
  if (pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    return 'cache-first';
  }

  // 字体文件
  if (pathname.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
    return 'cache-first';
  }

  // JSON 数据
  if (pathname.endsWith('.json') || accept.includes('application/json')) {
    return 'network-first';
  }

  // API 请求
  if (pathname.startsWith('/api/')) {
    return 'network-only';
  }

  // 默认策略
  return 'network-first';
}

/**
 * 处理请求
 */
async function handleRequest(request, strategy) {
  const cacheName = getCacheName(request);

  try {
    switch (strategy) {
      case 'cache-first':
        return await cacheFirst(request, cacheName);
      case 'network-first':
        return await networkFirst(request, cacheName);
      case 'network-only':
        return await fetch(request);
      case 'cache-only':
        return await cacheOnly(request, cacheName);
      default:
        return await networkFirst(request, cacheName);
    }
  } catch (error) {
    console.error('[SW] Request failed:', error);

    // 如果是导航请求，返回离线页面
    if (request.mode === 'navigate') {
      const offlineCache = await caches.open(CACHE_NAMES.offline);
      const offlineResponse = await offlineCache.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    // 返回友好的错误响应
    return new Response(
      JSON.stringify({ error: 'Network error', offline: true }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * 获取对应的缓存名称
 */
function getCacheName(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    return CACHE_NAMES.images;
  }
  if (pathname.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
    return CACHE_NAMES.fonts;
  }
  if (pathname.match(/\.(js|css|html)$/)) {
    return CACHE_NAMES.static;
  }
  return CACHE_NAMES.dynamic;
}

/**
 * 缓存优先策略
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    // 后台更新缓存（ stale-while-revalidate ）
    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {});

    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

/**
 * 网络优先策略
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * 仅缓存策略
 */
async function cacheOnly(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  throw new Error('Not found in cache');
}

// ==================== 后台同步 ====================

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // 处理需要后台同步的数据
  // 例如：同步游戏进度、用户操作日志等
  console.log('[SW] Processing background sync');
}

// ==================== 推送通知 ====================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || '道闸乐园有新消息！',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || '道闸乐园',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // 如果已有窗口打开，聚焦它
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // 否则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// ==================== 消息通信 ====================

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEAR_CACHE':
      event.waitUntil(clearAllCaches());
      break;
    case 'GET_CACHE_STATUS':
      event.waitUntil(
        getCacheStatus().then((status) => {
          event.ports[0]?.postMessage(status);
        })
      );
      break;
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

/**
 * 清除所有缓存
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log('[SW] All caches cleared');
}

/**
 * 获取缓存状态
 */
async function getCacheStatus() {
  const status = {};
  for (const [name, cacheName] of Object.entries(CACHE_NAMES)) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[name] = keys.length;
  }
  return status;
}

// ==================== 定期清理 ====================

// 每天清理一次过期缓存
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;

setInterval(async () => {
  console.log('[SW] Running periodic cleanup');
  await cleanupExpiredCaches();
}, CLEANUP_INTERVAL);

async function cleanupExpiredCaches() {
  const now = Date.now();

  for (const [type, config] of Object.entries(CACHE_STRATEGIES)) {
    const cacheName = CACHE_NAMES[type];
    if (!cacheName) continue;

    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (!response) continue;

      const dateHeader = response.headers.get('date');
      if (!dateHeader) continue;

      const age = now - new Date(dateHeader).getTime();
      if (age > config.maxAge) {
        console.log('[SW] Deleting expired cache:', request.url);
        await cache.delete(request);
      }
    }
  }
}

console.log('[SW] Service Worker loaded');
