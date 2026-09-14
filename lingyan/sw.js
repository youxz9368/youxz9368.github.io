const CACHE = 'lingyan-v1';
const PRECACHE = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
