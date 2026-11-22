// BoardPrep cloud — AI (RAG + free model), sync (D1), study rooms.
// Sab offline-safe: network na ho to local fallback, koi crash nahi.
(function () {
  'use strict';

  // DEFAULT_BASE — ye URL app me hi baked hai (Dilshan ek baar set karta hai).
  // Users ko kuch set nahi karna — sab apne-aap chalega.
  var DEFAULT_BASE = 'https://boardprep-api.dilshan-boardprep.workers.dev';
  var FALLBACK_BASE = 'https://boardprep-api.dilshan-boardprep.workers.dev';
  var OVERRIDE_KEY = 'bp_api_base';
  var BASE = '';

  // URL sahi hai ya nahi (purana placeholder <subdomain> ya khaali)
  function goodUrl(u) {
    var s = String(u || '').trim();
    return /^https?:\/\/[a-z0-9][a-z0-9.\-]*\.[a-z]{2,}/i.test(s) && s.indexOf('<') === -1;
  }

  function pick(u) {
    var s = String(u || '').replace(/\/+$/, '');
    return goodUrl(s) ? s : '';
  }

  function initBase() {
    try {
      var ov = localStorage.getItem(OVERRIDE_KEY);
      if (ov !== null) { BASE = pick(ov); }
    } catch (e) { }
    if (!BASE) BASE = pick(window.BP_API_BASE) || pick(DEFAULT_BASE) || pick(FALLBACK_BASE);
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

  // request ke waqt bhi URL check — galat/placeholder ho to sahi URL
  function url(path) {
    var b = goodUrl(BASE) ? BASE : FALLBACK_BASE;
    return b + path;
  }
  function post(path, body) {
    if (!goodUrl(BASE) && !goodUrl(FALLBACK_BASE)) return Promise.reject(new Error('no-base'));
    return fetch(url(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.json(); }).catch(function () { throw new Error('net'); });
  }
  function get(path) {
    if (!goodUrl(BASE) && !goodUrl(FALLBACK_BASE)) return Promise.reject(new Error('no-base'));
    return fetch(url(path)).then(function (r) { return r.json(); }).catch(function () { throw new Error('net'); });
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
  // AI chat (ChatGPT/Gemini jaisa) + quota
  function chat(q, history, web) {
    return post('/api/chat', { id: deviceId(), q: q, history: history || [], web: web !== false });
  }
  function quota() { return get('/api/quota?id=' + encodeURIComponent(deviceId())); }
  // voice: audio (base64) -> text
  function stt(audio, mime) {
    return post('/api/stt', { audio: audio, mime: mime || 'audio/webm' });
  }
  // photo: image (base64) -> javab
  function vision(image, q) {
    return post('/api/vision', { image: image, q: q || '' });
  }
  // feedback (AI khud seekhe)
  function feedback(topic, good) {
    return post('/api/feedback', { id: deviceId(), topic: topic, good: good });
  }
  function roomCreate(code, name) { return post('/api/room/create', { code: code, name: name }); }  function roomJoin(code, name) { return post('/api/room/join', { code: code, name: name }); }
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
      BASE = pick(u);
      if (BASE) { try { localStorage.setItem(OVERRIDE_KEY, BASE); } catch (e) { } }
      else { try { localStorage.removeItem(OVERRIDE_KEY); } catch (e) { } }
    },
    clearOverride: function () {
      try { localStorage.removeItem(OVERRIDE_KEY); } catch (e) { }
      BASE = pick(window.BP_API_BASE) || pick(DEFAULT_BASE) || pick(FALLBACK_BASE);
    },
    // version.json se aaya URL — sirf memory me (override nahi likhta)
    refreshBase: function (u) { var s = pick(u); if (s) BASE = s; },
    getBase: function () { return goodUrl(BASE) ? BASE : FALLBACK_BASE; },
    ready: function () { return goodUrl(BASE) || goodUrl(FALLBACK_BASE); },
    deviceId: deviceId,
    ask: ask,
    syncPush: syncPush,
    syncPull: syncPull,
    chat: chat, quota: quota, stt: stt, vision: vision, feedback: feedback,
    roomCreate: roomCreate, roomJoin: roomJoin, roomPost: roomPost, roomGet: roomGet,
    myName: myName
  };
})();
