/* BoardPrep service worker — offline support
   - app shell install par cache
   - baaki sab (PDF, audio, 3D models) cache-first; network par aaye to cache ho jaye
   - "offline करो" button se poora content cache ho sakta hai
*/
const CACHE = 'boardprep-v4';

const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/css/style.css',
  'assets/css/tools.css',
  'assets/js/icons.js',
  'assets/js/subjects.js',
  'assets/js/boards.js',
  'assets/js/i18n.js',
  'assets/js/app.js',
  'assets/js/tools.js',
  'assets/js/models3d-ui.js',
  'assets/js/models3d.js',
  'assets/js/scenes3d.js',
  'assets/js/_optics.js',
  'assets/data/data.js',
  'assets/data/board-bank.js',
  'assets/data/en-dict.js',
  'assets/data/important.js',
  'assets/data/formulas.js',
  'assets/data/periodic.js',
  'assets/data/lab.js',
  'assets/data/diagrams.js',
  'assets/data/timeline.js',
  'assets/data/stories.js',
  'assets/data/songs.js',
  'assets/data/brain.js',
  'assets/data/models3d.js',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/vendor/three/three.module.js',
  'assets/vendor/three/OrbitControls.js',
  'assets/vendor/three/loaders/GLTFLoader.js',
  'assets/vendor/three/environments/RoomEnvironment.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () {
    return self.skipWaiting();
  }).catch(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== self.location.origin) return;

  // HTML: network first (taaki updates dikhein), cache fallback
  if (req.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname === '/' || u.pathname.endsWith('/')) {
    e.respondWith(fetch(req).then(function (r) {
      const copy = r.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return r;
    }).catch(function () {
      return caches.match(req).then(function (r) { return r || caches.match('index.html'); });
    }));
    return;
  }

  // Baaki sab: cache first, phir network (aur cache me daal do)
  e.respondWith(caches.match(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (r) {
      if (r && r.ok) {
        const copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return r;
    }).catch(function () { return hit || Response.error(); });
  }));
});

// Page se bheja gaya poora content (PDF + songs) cache karo
self.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'CACHE_ALL') return;
  const urls = e.data.urls || [];
  const sender = e.source;
  caches.open(CACHE).then(function (cache) {
    let done = 0;
    const total = urls.length;
    return Promise.all(urls.map(function (u) {
      return fetch(u, { credentials: 'omit' }).then(function (r) {
        if (r.ok) return cache.put(u, r);
        return null;
      }).catch(function () { return null; }).then(function () {
        done++;
        if (sender) sender.postMessage({ type: 'CACHE_PROGRESS', done: done, total: total });
      });
    }));
  }).then(function () {
    if (sender) sender.postMessage({ type: 'CACHE_DONE' });
  });
});
