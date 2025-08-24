// sw.js
const CACHE = 'fel-v1';
const APP_SHELL = [
  '/', '/index.html', '/app.html',
  '/manifest.webmanifest',
  // لو عندك أصول أساسية ثابته حطها هنا:
  '/assets/user-avatar.png',
  '/assets/user-placeholder.png',
  '/players-photos/_placeholder.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))
    )
  );
  self.clients.claim();
});

// HTML => network-first، باقي الملفات => cache-first
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const accept = req.headers.get('accept') || '';

  // صفحات HTML
  if (req.mode === 'navigate' || accept.includes('text/html')) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // باقي الأنواع
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (req.method === 'GET' && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => {
        if (req.destination === 'image') {
          return caches.match('/players-photos/_placeholder.jpg');
        }
      });
    })
  );
});