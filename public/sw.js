// Service Worker for Instagram/Threads分析アプリ
const CACHE_NAME = 'sns-analysis-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// キャッシュする静的ファイル
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // CSS, JSファイルはビルド時に自動追加
];

// インストール時の処理
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache installation failed:', error);
      })
  );
});

// アクティベート時の処理
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 古いキャッシュを削除
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// フェッチ時の処理
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // APIリクエストはネットワークファースト（GETリクエストのみキャッシュ）
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // GETリクエストのみキャッシュに保存
          if (response.status === 200 && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // ネットワークエラー時はキャッシュから取得（GETリクエストのみ）
          if (request.method === 'GET') {
            return caches.match(request);
          }
          return new Response('Network error', { status: 503 });
        })
    );
    return;
  }

  // 静的ファイルはキャッシュファースト
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // 成功したレスポンスをキャッシュに保存
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            });
        })
    );
  }
});

// バックグラウンド同期（オフライン時のデータ同期）
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // オフライン時の分析データを同期
      syncOfflineData()
    );
  }
});

// プッシュ通知の処理
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : '新しい分析結果が利用可能です',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '確認する',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SNS分析アプリ', options)
  );
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// オフラインデータ同期関数
async function syncOfflineData() {
  try {
    // IndexedDBからオフライン分析データを取得
    const offlineData = await getOfflineData();
    
    if (offlineData.length > 0) {
      // オンライン時にデータを同期
      for (const data of offlineData) {
        await syncAnalysisData(data);
      }
      
      // 同期完了後、オフラインデータを削除
      await clearOfflineData();
    }
  } catch (error) {
    console.error('Service Worker: Sync failed:', error);
  }
}

// IndexedDBからオフラインデータを取得
async function getOfflineData() {
  // 実装は後で追加
  return [];
}

// 分析データを同期
async function syncAnalysisData(data) {
  // 実装は後で追加
  console.log('Syncing analysis data:', data);
}

// オフラインデータを削除
async function clearOfflineData() {
  // 実装は後で追加
  console.log('Clearing offline data');
}

// エラーハンドリング
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled rejection:', event.reason);
}); 