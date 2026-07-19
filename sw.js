const CACHE_NAME = 'seek-ai-v1';
const urlsToCache = [
  '/seek-ai-pwa/',
  '/seek-ai-pwa/index.html',
  '/seek-ai-pwa/styles.css',
  '/seek-ai-pwa/app.js',
  '/seek-ai-pwa/voice.js',
  '/seek-ai-pwa/files.js',
  '/seek-ai-pwa/offline.html'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('✓ Service Worker: Caching app shell');
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Some assets failed to cache, continuing anyway:', err);
        return cache.addAll(urlsToCache.filter(url => !url.includes('.js')));
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('✓ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached version if fetch fails
        return caches.match(request).then(response => {
          if (response) {
            return response;
          }
          // Return offline page if neither network nor cache available
          if (request.destination === 'document') {
            return caches.match('/seek-ai-pwa/offline.html');
          }
        });
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Seek AI',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%234f46e5" width="192" height="192"/><circle cx="96" cy="96" r="70" fill="%236366f1"/><text x="96" y="115" font-size="80" font-weight="bold" fill="white" text-anchor="middle">✦</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><circle cx="48" cy="48" r="45" fill="%234f46e5"/></svg>',
      tag: 'seek-ai-notification'
    };
    self.registration.showNotification('Seek AI', options);
  }
});
