// BoardPrep cloud — authenticated AI, Supabase sync, and study rooms.
// Network failures never crash the app.
(function () {
  'use strict';

  // DEFAULT_BASE — ye URL app me hi baked hai (Dilshan ek baar set karta hai).
  // Users do not need to configure anything; it works automatically.
  var DEFAULT_BASE = 'https://boardprep-api.dilshan-boardprep.workers.dev';
  var FALLBACK_BASE = 'https://boardprep-api.dilshan-boardprep.workers.dev';
  var OVERRIDE_KEY = 'bp_api_base';
  var BASE = '';

  // Check the URL and reject placeholders or empty values
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

  function needLogin() {
    if (window.Auth && window.Auth.configured && !window.Auth.user()) {
      window.Auth.showOverlay(true);
      return false;
    }
    return true;
  }

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

  var TOKEN_KEY = 'bp_device_token';
  var TOKEN_HEADER = 'X-BP-Device-Token';
  var CONSENT_KEY = 'bp_privacy_consent';

  function randomToken() {
    try {
      var a = new Uint8Array(24);
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(a);
      else { for (var i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); }
      var s = '';
      for (var j = 0; j < a.length; j++) s += ('0' + a[j].toString(16)).slice(-2);
      return 't' + s;
    } catch (e) { return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2); }
  }
  function deviceToken() {
    try {
      var v = localStorage.getItem(TOKEN_KEY);
      if (!v) { v = randomToken(); localStorage.setItem(TOKEN_KEY, v); }
      return v;
    } catch (e) { return randomToken(); }
  }
  function authHeaders(extra, withJson, token) {
    var h = {};
    if (withJson) h['Content-Type'] = 'application/json';
    h[TOKEN_HEADER] = deviceToken();
    if (token) h.Authorization = 'Bearer ' + token;
    if (extra) {
      for (var k in extra) { if (Object.prototype.hasOwnProperty.call(extra, k)) h[k] = extra[k]; }
    }
    return h;
  }
  function consent(kind, msg) {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(CONSENT_KEY) || '{}') || {}; } catch (e) { }
    if (o[kind] === true) return true;
    if (o[kind] === false) return false;
    var ok = !!window.confirm(msg);
    o[kind] = ok;
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(o)); } catch (e) { }
    return ok;
  }
  function stripScreen(q) {
    var s = String(q || '');
    var marker = '[स्क्रीन पर यह दिख रहा है]:';
    var i = s.indexOf(marker);
    if (i < 0) return s;
    if (consent('screen', 'BoardPrep AI को अभी खुले पेज का text भेजना है। अनुमति दें?')) return s;
    var parts = s.slice(i + marker.length).split('\n\nसवाल: ');
    return parts.length > 1 ? ('सवाल: ' + parts[1]) : 'सवाल:';
  }

  // Check the URL on every request and fall back if it is invalid
  function url(path) {
    var b = goodUrl(BASE) ? BASE : FALLBACK_BASE;
    return b + path;
  }
  async function accessToken() {
    if (window.Auth && window.Auth.getToken) return window.Auth.getToken();
    if (window.Auth && window.Auth.token) return window.Auth.token();
    return '';
  }
  function readResponse(r) {
    return r.json().catch(function () { return { ok: false, error: 'bad response' }; }).then(function (j) {
      if (r.status === 401) {
        if (window.Auth) window.Auth.showOverlay(true);
        j.ok = false;
        j.error = j.error || 'login required';
        j.login = true;
      }
      return j;
    });
  }
  async function post(path, body, extra) {
    if (!goodUrl(BASE) && !goodUrl(FALLBACK_BASE)) return Promise.reject(new Error('no-base'));
    if (!needLogin()) return Promise.reject({ ok: false, error: 'login required', login: true });
    const token = await accessToken();
    return fetch(url(path), {
      method: 'POST',
      headers: authHeaders(extra, true, token),
      body: JSON.stringify(body || {})
    }).then(readResponse).catch(function () { throw new Error('net'); });
  }
  async function get(path, extra) {
    if (!goodUrl(BASE) && !goodUrl(FALLBACK_BASE)) return Promise.reject(new Error('no-base'));
    if (!needLogin()) return Promise.reject({ ok: false, error: 'login required', login: true });
    const token = await accessToken();
    return fetch(url(path), { headers: authHeaders(extra, false, token) })
      .then(readResponse).catch(function () { throw new Error('net'); });
  }

  // AI: notes (RAG context) + question -> free model answer
  function ask(q, notes) {
    return post('/api/ask', { q: q, notes: notes || [] });
  }

  // cloud sync — Supabase (logged-in user)
  function syncPush(data) {
    if (window.Auth && window.Auth.configured) {
      if (!window.Auth.user()) { window.Auth.showOverlay(true); return Promise.reject({ ok: false, error: 'login required', login: true }); }
      return window.Auth.pushData();
    }
    return post('/api/sync/save', { id: deviceId(), data: data || {} });
  }
  function syncPull() {
    if (window.Auth && window.Auth.configured) {
      if (!window.Auth.user()) { window.Auth.showOverlay(true); return Promise.reject({ ok: false, error: 'login required', login: true }); }
      return window.Auth.pullData().then(function (row) {
        if (!row || !row.data) return { ok: false, found: false };
        return { ok: true, t: Date.parse(row.updated_at) || Date.now(), data: row.data };
      });
    }
    return get('/api/sync/load?id=' + encodeURIComponent(deviceId()));
  }

  // study rooms
  // AI chat and quota
  function chat(q, history, web) {
    q = stripScreen(q);
    var lang = (/[\u0900-\u097F]/.test(String(q || ''))) ? 'hi' : 'en';
    return post('/api/chat', { id: deviceId(), q: q, history: history || [], web: web !== false, lang: lang });
  }
  function image(prompt) {
    return post('/api/image', { prompt: prompt });
  }
  function quota() { return get('/api/quota?id=' + encodeURIComponent(deviceId())); }
  // voice: audio (base64) -> text
  function stt(audio, mime) {
    if (!consent('voice', 'आवाज़ का audio AI सर्वर पर भेजा जाएगा। अनुमति दें?')) {
      return Promise.resolve({ ok: false, error: 'आवाज़ की अनुमति नहीं मिली — audio नहीं भेजा गया' });
    }
    return post('/api/stt', { audio: audio, mime: mime || 'audio/webm' });
  }
  // photo: image (base64) -> answer
  function vision(image, q) {
    if (!consent('photo', 'यह फोटो AI सर्वर पर भेजी जाएगी। अनुमति दें?')) {
      return Promise.resolve({ ok: false, error: 'फ़ोटो की अनुमति नहीं मिली — image नहीं भेजी गई' });
    }
    return post('/api/vision', { image: image, q: q || '' });
  }
  // feedback (AI learning)
  function feedback(topic, good) {
    return post('/api/feedback', { id: deviceId(), topic: topic, good: good });
  }
  function roomCreate(code, name) { return post('/api/room/create', { code: code, name: name }); }
  function roomJoin(code, name) { return post('/api/room/join', { code: code, name: name }); }
  function roomPost(code, name, msg) { return post('/api/room/post', { code: code, name: name, msg: msg }); }
  function roomGet(code) { return get('/api/room/get?code=' + encodeURIComponent(code)); }

  // Token owner name (for rooms and sync)
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
    // URL from version.json: memory only, not saved as override
    refreshBase: function (u) { var s = pick(u); if (s) BASE = s; },
    getBase: function () { return goodUrl(BASE) ? BASE : FALLBACK_BASE; },
    ready: function () { return goodUrl(BASE) || goodUrl(FALLBACK_BASE); },
    deviceId: deviceId,
    deviceToken: deviceToken,
    consent: consent,
    resetConsent: function () { try { localStorage.removeItem(CONSENT_KEY); } catch (e) { } },
    ask: ask,
    syncPush: syncPush,
    syncPull: syncPull,
    chat: chat, quota: quota, stt: stt, vision: vision, feedback: feedback, image: image,
    roomCreate: roomCreate, roomJoin: roomJoin, roomPost: roomPost, roomGet: roomGet,
    myName: myName
  };
})();
