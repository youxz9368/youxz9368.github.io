// 棋斗士 Service Worker —— 离线缓存，让 PWA 可安装、可离线使用
const CACHE = 'qidoushi-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './content.js',
  './games.js',
  './puzzles.js',
  './qr.js',
  './app.js',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  // 导航请求：优先网络，失败回退缓存首页（保证离线可进 App）
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function () {
        return caches.match('./index.html');
      })
    );
    return;
  }

  // 其他静态资源：缓存优先，同时后台更新（stale-while-revalidate）
  e.respondWith(
    caches.match(req).then(function (cached) {
      var fetched = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || fetched;
    })
  );
});
