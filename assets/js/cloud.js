// BoardPrep cloud — AI (RAG + free model), sync (D1), study rooms.
// Sab offline-safe: network na ho to local fallback, koi crash nahi.
(function () {
  'use strict';

  // DEFAULT_BASE — ye URL app me hi baked hai (Dilshan ek baar set karta hai).
  // Users ko kuch set nahi karna — sab apne-aap chalega.
  var DEFAULT_BASE = '';
  var OVERRIDE_KEY = 'bp_api_base';
  var BASE = '';

  function initBase() {
    try {
      var ov = localStorage.getItem(OVERRIDE_KEY);
      if (ov !== null) { BASE = ov.replace(/\/+$/, ''); return; }
    } catch (e) { }
    BASE = String(window.BP_API_BASE || DEFAULT_BASE || '').replace(/\/+$/, '');
  }
  initBase();

  function deviceId() {
    try {
      var k = 'bp_device_id';
      var v = localStorage.getItem(k);
      if (!v) {
        v = 'd' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
        localStorage.setItem(k, v);
      }
      return v;
    } catch (e) { return 'anon'; }
  }

  function post(path, body) {
    if (!BASE) return Promise.reject(new Error('no-base'));
    return fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.json(); }).catch(function (e) { throw e; });
  }
  function get(path) {
    if (!BASE) return Promise.reject(new Error('no-base'));
    return fetch(BASE + path).then(function (r) { return r.json(); }).catch(function (e) { throw e; });
  }

  // AI: notes (RAG context) + sawal -> free model ka javab
  function ask(q, notes) {
    return post('/api/ask', { q: q, notes: notes || [] });
  }

  // cloud sync
  function syncPush(data) {
    return post('/api/sync/save', { id: deviceId(), data: data || {} });
  }
  function syncPull() {
    return get('/api/sync/load?id=' + encodeURIComponent(deviceId()));
  }

  // study rooms
  function roomCreate(code, name) { return post('/api/room/create', { code: code, name: name }); }
  function roomJoin(code, name) { return post('/api/room/join', { code: code, name: name }); }
  function roomPost(code, name, msg) { return post('/api/room/post', { code: code, name: name, msg: msg }); }
  function roomGet(code) { return get('/api/room/get?code=' + encodeURIComponent(code)); }

  // token owner ka naam (rooms/sync ke liye)
  function myName() {
    try { return localStorage.getItem('bp_name') || ''; } catch (e) { return ''; }
  }

  window.Cloud = {
    DEFAULT_BASE: DEFAULT_BASE,
    BASE: BASE,
    setBase: function (u) {
      BASE = String(u || '').replace(/\/+$/, '');
      if (BASE) { try { localStorage.setItem(OVERRIDE_KEY, BASE); } catch (e) { } }
      else { try { localStorage.removeItem(OVERRIDE_KEY); } catch (e) { } }
    },
    clearOverride: function () {
      try { localStorage.removeItem(OVERRIDE_KEY); } catch (e) { }
      BASE = String(window.BP_API_BASE || DEFAULT_BASE || '').replace(/\/+$/, '');
    },
    // version.json se aaya URL — sirf memory me (override nahi likhta)
    refreshBase: function (u) { BASE = String(u || '').replace(/\/+$/, ''); },
    getBase: function () { return BASE; },
    ready: function () { return !!BASE; },
    deviceId: deviceId,
    ask: ask,
    syncPush: syncPush,
    syncPull: syncPull,
    roomCreate: roomCreate, roomJoin: roomJoin, roomPost: roomPost, roomGet: roomGet,
    myName: myName
  };
})();
