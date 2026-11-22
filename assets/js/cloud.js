// BoardPrep cloud — AI (RAG + free model), sync (D1), study rooms.
// Sab offline-safe: network na ho to local fallback, koi crash nahi.
(function () {
  'use strict';

  // Worker deploy hone ke baad ye URL aa jayega. Jab tak empty ho, sab local rahta hai.
  var BASE = '';

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
    BASE: BASE,
    setBase: function (u) { BASE = u.replace(/\/+$/, ''); },
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
