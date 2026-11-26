(function () {
  'use strict';

  var SUPABASE_URL = 'https://qssxnilqflpzlyflfoqk.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_5Kto_b2Fmp4SRww7qvPaeA_SetAlfDV';
  var SESSION_KEY = 'bp_sbs_session';
  var DISMISS_KEY = 'bp_auth_dismissed';
  var S = null;
  var listeners = [];
  var lastSyncUser = '';

  function readSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      var o = raw ? JSON.parse(raw) : null;
      if (o && o.access_token && o.user && o.user.id) S = o;
    } catch (e) { S = null; }
  }

  function hash32(s, seed) {
    var h = seed >>> 0;
    s = String(s || '');
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(16);
  }

  function applyDeviceToken(userId) {
    try { localStorage.setItem('bp_device_token', 'u' + hash32(userId, 2166136261) + hash32(userId, 2654435761)); } catch (e) { }
  }

  function returnTo() {
    return location.origin + location.pathname;
  }

  function emit() {
    listeners.forEach(function (fn) { try { fn(S); } catch (e) { } });
  }

  function saveSession(s) {
    if (!s || !s.access_token) throw new Error('सत्र नहीं मिला');
    var user = s.user || (S && S.user) || null;
    S = {
      access_token: s.access_token,
      refresh_token: s.refresh_token || (S && S.refresh_token) || '',
      expires_at: Date.now() + Number(s.expires_in || 3600) * 1000,
      user: user
    };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(S)); } catch (e) { }
    if (user) applyDeviceToken(user.id);
    emit();
    return S;
  }

  function clearSession() {
    S = null;
    lastSyncUser = '';
    try { localStorage.removeItem(SESSION_KEY); } catch (e) { }
    emit();
  }

  function api(path, opts) {
    opts = opts || {};
    var headers = { apikey: SUPABASE_KEY };
    if (opts.json !== false) headers['Content-Type'] = 'application/json';
    if (opts.headers) {
      Object.keys(opts.headers).forEach(function (k) { headers[k] = opts.headers[k]; });
    }
    var pendingToken = opts.token === undefined ? getToken() : Promise.resolve(opts.token || '');
    return pendingToken.then(function (t) {
      if (!t && opts.token === undefined) throw new Error('सत्र समाप्त, कृपया फिर से लॉगिन करें');
      if (t) headers.Authorization = 'Bearer ' + t;
      return fetch(SUPABASE_URL + path, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined
      });
    }).then(function (r) {
      return r.text().then(function (txt) {
        var j = {};
        try { j = txt ? JSON.parse(txt) : {}; } catch (e) { j = { raw: txt }; }
        if (!r.ok) throw new Error(j.msg || j.message || j.error || ('HTTP ' + r.status));
        return j;
      });
    });
  }

  function refresh() {
    if (!S || !S.refresh_token) return Promise.resolve(false);
    return api('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', body: { refresh_token: S.refresh_token }, token: ''
    }).then(function (j) { saveSession(j); return true; }).catch(function () { clearSession(); return false; });
  }

  function user() { return S && S.user ? S.user : null; }

  function token() {
    if (!S) return '';
    if (S.expires_at && Date.now() > S.expires_at - 60000 && S.refresh_token) refresh();
    return S.access_token || '';
  }

  function getToken() {
    if (!S) return Promise.resolve('');
    if (S.expires_at && Date.now() > S.expires_at - 60000 && S.refresh_token) {
      return refresh().then(function () { return (S && S.access_token) || ''; });
    }
    return Promise.resolve(S.access_token || '');
  }

  function signIn(email, password) {
    return api('/auth/v1/token?grant_type=password', {
      method: 'POST', body: { email: email, password: password }, token: ''
    }).then(function (j) { return saveSession(j); });
  }

  function signUp(email, password) {
    return api('/auth/v1/signup?redirect_to=' + encodeURIComponent(returnTo()), {
      method: 'POST', body: { email: email, password: password }, token: ''
    }).then(function (j) { if (j.access_token) saveSession(j); return j; });
  }

  function sendOtp(email) {
    return api('/auth/v1/otp?redirect_to=' + encodeURIComponent(returnTo()), {
      method: 'POST', body: { email: email, create_user: true }, token: ''
    });
  }

  function signInWithGoogle() {
    location.href = SUPABASE_URL + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(returnTo());
  }

  function signOut() {
    var t = token();
    return api('/auth/v1/logout', { method: 'POST', body: {}, token: t }).catch(function () { }).then(function () { clearSession(); });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function overlay() {
    var d = document.getElementById('bpAuthOverlay');
    if (d) return d;
    d = document.createElement('div');
    d.id = 'bpAuthOverlay';
    d.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(8,12,24,.68);z-index:100000;display:none;align-items:center;justify-content:center;padding:16px';
    d.innerHTML = '<div style="width:100%;max-width:380px;background:#fff;color:#111;border-radius:18px;padding:18px;box-shadow:0 18px 60px rgba(0,0,0,.35)">' +
      '<h2 style="margin:0 0 6px;font-size:20px">BoardPrep लॉगिन</h2>' +
      '<p style="margin:0 0 14px;font-size:13px;color:#555;line-height:1.4">प्रगति, नोट्स और चैट आपके खाते में हमेशा सहेजे जाएँगे। हर उपयोगकर्ता को रोज़ 60 AI अनुरोध मिलते हैं।</p>' +
      '<input id="bpAuthEmail" type="email" placeholder="ईमेल" style="width:100%;box-sizing:border-box;padding:11px 12px;margin-bottom:8px;border:1px solid #d7dbe5;border-radius:10px;font-size:15px">' +
      '<input id="bpAuthPass" type="password" placeholder="पासवर्ड" style="width:100%;box-sizing:border-box;padding:11px 12px;margin-bottom:12px;border:1px solid #d7dbe5;border-radius:10px;font-size:15px">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button id="bpAuthIn" style="flex:1;min-width:100px;padding:11px;border:0;border-radius:10px;background:#4f46e5;color:#fff;font-weight:800">लॉगिन</button>' +
      '<button id="bpAuthUp" style="flex:1;min-width:100px;padding:11px;border:1px solid #d7dbe5;border-radius:10px;background:#fff;font-weight:800">साइन अप</button>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' +
      '<button id="bpAuthOtp" style="flex:1;min-width:100px;padding:10px;border:1px solid #d7dbe5;border-radius:10px;background:#fff">मैजिक लिंक</button>' +
      '<button id="bpAuthGoogle" style="flex:1;min-width:100px;padding:10px;border:1px solid #d7dbe5;border-radius:10px;background:#fff">Google से लॉगिन</button>' +
      '</div>' +
      '<div id="bpAuthMsg" style="min-height:18px;margin-top:10px;font-size:12px;color:#b91c1c"></div>' +
      '<button id="bpAuthGuest" style="width:100%;margin-top:6px;padding:8px;border:0;background:none;color:#555;font-size:13px;text-decoration:underline">अतिथि मोड (केवल ऑफ़लाइन पढ़ाई)</button>' +
      '</div>';
    document.body.appendChild(d);

    var msg = function (s) { var o = d.querySelector('#bpAuthMsg'); if (o) o.textContent = s || ''; };
    var email = function () { return d.querySelector('#bpAuthEmail').value.trim(); };
    var pass = function () { return d.querySelector('#bpAuthPass').value; };
    d.querySelector('#bpAuthIn').addEventListener('click', function () {
      msg('');
      signIn(email(), pass()).then(function () { hideOverlay(); }).catch(function (e) { msg(e.message || 'लॉगिन विफल'); });
    });
    d.querySelector('#bpAuthUp').addEventListener('click', function () {
      msg('');
      signUp(email(), pass()).then(function (j) {
        if (j && j.access_token) { hideOverlay(); return; }
        msg('खाता बन गया। ईमेल सत्यापित करके लॉगिन करें।');
      }).catch(function (e) { msg(e.message || 'साइनअप विफल'); });
    });
    d.querySelector('#bpAuthOtp').addEventListener('click', function () {
      msg('');
      sendOtp(email()).then(function () { msg('मैजिक लिंक ईमेल पर भेज दिया गया।'); }).catch(function (e) { msg(e.message || 'मैजिक लिंक विफल'); });
    });
    d.querySelector('#bpAuthGoogle').addEventListener('click', function () {
      msg('Google प्रदाता सक्षम होने पर लॉगिन चलेगा।');
      setTimeout(function () { signInWithGoogle(); }, 400);
    });
    d.querySelector('#bpAuthGuest').addEventListener('click', function () { guest(); });
    d.querySelector('#bpAuthPass').addEventListener('keydown', function (e) { if (e.key === 'Enter') d.querySelector('#bpAuthIn').click(); });
    return d;
  }

  function showOverlay(force, message) {
    var d = overlay();
    var dismissed = false;
    try { dismissed = sessionStorage.getItem(DISMISS_KEY) === '1'; } catch (e) { }
    if (force || (!dismissed && !user())) d.style.display = 'flex';
    if (message) { var o = d.querySelector('#bpAuthMsg'); if (o) o.textContent = message; }
  }

  function hideOverlay() {
    var d = document.getElementById('bpAuthOverlay');
    if (d) d.style.display = 'none';
  }

  function guest() {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (e) { }
    hideOverlay();
  }

  function requireLogin() {
    if (user()) return true;
    showOverlay(true);
    return false;
  }

  var EXCLUDE = { bp_device_token: 1, bp_sbs_session: 1, bp_api_base: 1, bp_cs_auto: 1, bp_apk: 1 };

  function collectData() {
    var local = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('bp_') === 0 && !EXCLUDE[k]) local[k] = localStorage.getItem(k);
      }
    } catch (e) { }
    var out = { local: local };
    try { out.study = window.STUDY && STUDY.data ? STUDY.data() : {}; } catch (e) { out.study = {}; }
    try { out.target = window.STUDY && STUDY.targetGet ? STUDY.targetGet() : null; } catch (e) { out.target = null; }
    return out;
  }

  function applyData(d) {
    if (!d) return false;
    try {
      if (d.local) Object.keys(d.local).forEach(function (k) { localStorage.setItem(k, d.local[k]); });
    } catch (e) { }
    try { if (d.study && window.STUDY && STUDY.restore) STUDY.restore(d); } catch (e) { }
    try { if (d.target && window.STUDY && STUDY.targetSet) STUDY.targetSet(d.target); } catch (e) { }
    try { if (window.BP && BP.render) BP.render(); } catch (e) { }
    return true;
  }

  function pushData() {
    if (!user()) return Promise.reject(new Error('login required'));
    return api('/rest/v1/user_data', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: { user_id: user().id, data: collectData(), updated_at: new Date().toISOString() }
    });
  }

  function pullData() {
    if (!user()) return Promise.resolve(null);
    var q = '?select=data,updated_at&user_id=eq.' + encodeURIComponent(user().id) + '&limit=1';
    return api('/rest/v1/user_data' + q).then(function (a) { return a && a.length ? a[0] : null; });
  }

  function syncAfterLogin() {
    var u = user();
    if (!u || lastSyncUser === u.id) return Promise.resolve(null);
    lastSyncUser = u.id;
    return pullData().then(function (row) {
      if (row && row.data && Object.keys(row.data).length) {
        var hasLocal = false;
        try { hasLocal = Object.keys(collectData().local).length > 0; } catch (e) { }
        if (hasLocal && !confirm('आपके खाते में पहले से डेटा है। स्थानीय डेटा को क्लाउड डेटा से बदलें?')) return pushData().then(function () { return row; });
        applyData(row.data);
        return row;
      }
      return pushData().then(function () { return null; });
    }).catch(function () { return null; });
  }

  function finishOAuth() {
    var h = location.hash || '';
    if (h.indexOf('access_token=') < 0 && h.indexOf('error=') < 0) return false;
    var get = function (n) { var m = new RegExp('[?&#]' + n + '=([^&]+)').exec(h); return m ? decodeURIComponent(m[1]) : ''; };
    var clean = function () { try { history.replaceState(null, '', location.pathname + location.search + '#/'); } catch (e) { } };
    var t = get('access_token');
    if (t) {
      return api('/auth/v1/user', { token: t }).then(function (u) {
        saveSession({ access_token: t, refresh_token: get('refresh_token'), expires_in: get('expires_in') || 3600, user: u });
        clean();
        return true;
      });
    }
    clean();
    showOverlay(true, (get('error_description') || 'लॉगिन विफल').replace(/\+/g, ' '));
    return true;
  }

  function mountProfile() {
    if ((location.hash || '').indexOf('profile') < 0) return;
    var view = document.getElementById('view');
    if (!view || document.getElementById('bpAccountCard')) return;
    var u = user();
    var card = document.createElement('div');
    card.className = 'card';
    card.id = 'bpAccountCard';
    card.style.cssText = 'margin-bottom:12px;padding:14px';
    card.innerHTML = '<div style="font-size:13px;font-weight:800;margin-bottom:6px">' + (u ? 'खाता' : 'लॉगिन') + '</div>' +
      '<div class="t-secondary" style="font-size:13px;margin-bottom:10px">' + (u ? escapeHtml(u.email || u.id) : 'लॉगिन करके डेटा हमेशा सहेजें। रोज़ 60 AI अनुरोध।') + '</div>' +
      '<div id="bpAccQuota" class="t-small" style="margin-bottom:10px"></div>' +
      '<div class="chips"><button class="fchip" id="bpAccMain">' + (u ? 'लॉगआउट' : 'लॉगिन') + '</button>' +
      (u ? '<button class="fchip" id="bpAccSave">क्लाउड में सेव</button><button class="fchip" id="bpAccLoad">क्लाउड से लोड</button>' : '') + '</div>';
    view.insertBefore(card, view.firstChild);
    card.querySelector('#bpAccMain').addEventListener('click', function () {
      if (u) signOut().then(function () { window.BP && BP.render && BP.render(); });
      else showOverlay(true);
    });
    var save = card.querySelector('#bpAccSave');
    if (save) save.addEventListener('click', function () {
      pushData().then(function () { if (window.toast) window.toast('क्लाउड में सेव हो गया'); }).catch(function (e) { if (window.toast) window.toast(e.message || 'सेव विफल'); });
    });
    var load = card.querySelector('#bpAccLoad');
    if (load) load.addEventListener('click', function () {
      pullData().then(function (row) {
        if (!row || !row.data) { if (window.toast) window.toast('क्लाउड में डेटा नहीं मिला'); return; }
        if (applyData(row.data) && window.toast) window.toast('क्लाउड से डेटा आ गया');
      }).catch(function (e) { if (window.toast) window.toast(e.message || 'लोड विफल'); });
    });
    if (u && window.Cloud && Cloud.quota) {
      Cloud.quota().then(function (q) {
        var o = document.getElementById('bpAccQuota');
        if (o && q && q.ok) o.textContent = 'आज का कोटा: ' + q.left + '/' + q.per;
      }).catch(function () { });
    }
  }

  function startAutoSave() {
    var save = function () { if (user() && document.visibilityState !== 'hidden') pushData().catch(function () { }); };
    var flush = function () { if (user()) pushData().catch(function () { }); };
    setInterval(save, 30000);
    window.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });
    window.addEventListener('beforeunload', flush);
  }

  function init() {
    readSession();
    if (user()) applyDeviceToken(user().id);
    var oauth = finishOAuth();
    if (oauth === true) return;
    listeners.push(function (s) {
      if (s) { hideOverlay(); syncAfterLogin(); }
      setTimeout(mountProfile, 60);
    });
    if (user()) emit();
    window.addEventListener('hashchange', function () { setTimeout(mountProfile, 60); });
    setTimeout(mountProfile, 200);
    if (!user()) showOverlay(false);
    startAutoSave();
  }

  window.Auth = {
    configured: true,
    url: SUPABASE_URL,
    user: user,
    token: token,
    getToken: getToken,
    on: function (fn) { listeners.push(fn); try { fn(S); } catch (e) { } },
    showOverlay: showOverlay,
    hideOverlay: hideOverlay,
    guest: guest,
    requireLogin: requireLogin,
    signIn: signIn,
    signUp: signUp,
    sendOtp: sendOtp,
    signInWithGoogle: signInWithGoogle,
    signOut: signOut,
    pushData: pushData,
    pullData: pullData,
    syncAfterLogin: syncAfterLogin,
    collectData: collectData,
    applyData: applyData
  };

  init();
})();
