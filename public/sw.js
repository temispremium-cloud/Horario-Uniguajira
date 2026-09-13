// Service Worker for UniGuajira Horario PWA
const CACHE_NAME = 'uniguajira-horario-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Pre-cache partial failure, continuing:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Static assets (images, icons, styles, fonts, scripts)
  const url = new URL(event.request.url);
  const isStatic =
    url.pathname.startsWith('/assets/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?|ttf|css|js)$/i);

  if (isStatic) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          // Revalidate in background
          fetch(event.request)
            .then((networkResp) => {
              if (networkResp && networkResp.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResp));
              }
            })
            .catch(() => {});
          return cached;
        }

        return fetch(event.request)
          .then((networkResp) => {
            if (networkResp && networkResp.status === 200) {
              const clone = networkResp.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkResp;
          })
          .catch(() => caches.match('/icon-192.svg'));
      })
    );
    return;
  }

  // General Network-First with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  let data = {
    title: 'Recordatorio de Clase - UniGuajira',
    body: 'Tienes una clase programada próximamente.',
    courseId: ''
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    vibrate: [250, 100, 250, 100, 250],
    data: {
      url: '/',
      courseId: data.courseId,
      timestamp: Date.now()
    },
    actions: [
      { action: 'view', title: 'Ver Horario' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Client message handling (Trigger notification directly from app or background sync)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, courseId, tag } = event.data;
    const options = {
      body,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      vibrate: [250, 100, 250],
      tag: tag || 'class-reminder',
      renotify: true,
      data: {
        url: '/',
        courseId,
        timestamp: Date.now()
      }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

