// 灵验APP PWA Service Worker (lingyan-v3.1.18)
const CACHE = 'lingyan-v3.1.18';
const SHELL = ['./', './index.html', './manifest.json',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(function () { return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(
    caches.match(req).then(function (r) {
      return r || fetch(req).then(function (resp) {
        var cp = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(req, cp); });
        return resp;
      }).catch(function () { return r; });
    })
  );
});
