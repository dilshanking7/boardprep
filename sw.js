/* BoardPrep service worker — offline support
   - app shell install par cache
   - baaki sab (PDF, audio, 3D models) cache-first; network par aaye to cache ho jaye
   - "offline करो" button se poora content cache ho sakta hai
*/
const CACHE = 'boardprep-v35';

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
  'assets/js/study.js',
  'assets/js/cloud.js',
  'assets/js/chat.js',
  'assets/js/calc.js',
  'assets/js/models3d-ui.js',
  'assets/js/models3d.js',
  'assets/js/scenes3d.js',
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
  'assets/data/notes.js',
  'assets/data/notes_science.js',
  'assets/data/notes_maths.js',
  'assets/data/notes_science2.js',
  'assets/data/notes_maths2.js',
  'assets/data/notes_jharkhand.js',
  'assets/data/notes_sst_history.js',
  'assets/data/notes_sst_geo.js',
  'assets/data/notes_sst_civics.js',
  'assets/data/notes_sst_econ.js',
  'assets/data/notes_hindi.js',
  'assets/data/notes_english.js',
  'assets/data/notes_sanskrit.js',
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
  // Har file alag se cache hoti hai — koi ek fail ho to poora install fail NA ho
  e.waitUntil(caches.open(CACHE).then(function (cache) {
    var failed = [];
    return Promise.all(SHELL.map(function (u) {
      return cache.add(u).then(function () {}, function () { failed.push(u); });
    })).then(function () {
      self.__shellFailed = failed;
      return self.skipWaiting();
    });
  }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// App shell ki cached status report (missing resources ke liye)
self.addEventListener('message', function (e) {
  if (!e.data) return;
  if (e.data.type === 'SHELL_STATUS') {
    caches.open(CACHE).then(function (cache) {
      return Promise.all(SHELL.map(function (u) {
        return cache.match(u).then(function (r) { return { u: u, ok: !!r }; });
      }));
    }).then(function (list) {
      if (e.source) e.source.postMessage({ type: 'SHELL_STATUS', list: list });
    });
    return;
  }
  if (e.data.type !== 'CACHE_ALL') return;
  var urls = e.data.urls || [];
  var sender = e.source;
  caches.open(CACHE).then(function (cache) {
    var done = 0, failed = [];
    var total = urls.length;
    function work(idx) {
      if (idx >= total) {
        if (sender) sender.postMessage({ type: 'CACHE_DONE', failed: failed.length, failedUrls: failed });
        return null;
      }
      var u = urls[idx];
      function attempt(n) {
        return fetch(u, { credentials: 'omit' }).then(function (r) {
          if (!r.ok) throw new Error('bad');
          return cache.put(u, r);
        }).catch(function () {
          if (n > 0) return attempt(n - 1);
          failed.push(u);
          return null;
        });
      }
      return attempt(1).then(function () {
        done++;
        if (sender) sender.postMessage({ type: 'CACHE_PROGRESS', done: done, total: total, failed: failed.length });
        return work(idx + 1);
      });
    }
    return work(0);
  });
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

  // version.json hamesha network se (taaki naya update turant dikhe)
  if (u.pathname.endsWith('/version.json')) {
    e.respondWith(fetch(req, { cache: 'no-store' }).catch(function () { return caches.match(req); }));
    return;
  }

  // Baaki sab: stale-while-revalidate — pehle cache (turant), phir network se update
  // (cache-first nahi, warna purana data hamesha dikhta jab tak CACHE na badle)
  e.respondWith(caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (r) {
      if (r && r.ok) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return r;
    }).catch(function () { return hit || Response.error(); });
    return hit || net;
  }));
});

