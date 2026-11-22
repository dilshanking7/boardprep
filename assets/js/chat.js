// BoardPrep AI chat — ChatGPT/Gemini जैसा चैट डैशबोर्ड (cloud worker से)
// chats save rehti hain — back se bahar aao, baad me continue ya nayi chat
(function () {
  'use strict';
  var KEY = 'bp_chats_v1';
  var IDX = 'bp_chat_active';

  function L(en, hi) { return (window.BP && window.BP.state.lang === 'en') ? en : hi; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function all() { try { var v = JSON.parse(localStorage.getItem(KEY)); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
  function saveAll(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
  function active() { try { return localStorage.getItem(IDX) || ''; } catch (e) { return ''; } }
  function setActive(id) { try { localStorage.setItem(IDX, id); } catch (e) { } }
  function mkid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  // error ko aam bhasha me — user ko tech nahi dikhta
  function friendly(e) {
    var m = String((e && e.message) || e || '');
    if (m.indexOf('no-base') >= 0) {
      return L('AI सर्वर से जुड़ नहीं पाया। इंटरनेट चालू है या नहीं देखो, फिर कोशिश करो।',
        'Could not reach the AI server. Check the internet and try again.');
    }
    if (m.indexOf('net') >= 0 || m.indexOf('fetch') >= 0 || m.indexOf('Failed') >= 0 || m.indexOf('parse') >= 0) {
      return L('इंटरनेट कमज़ोर है — बाद में फिर कोशिश करो।', 'Internet is weak — try again later.');
    }
    return m;
  }
  // screen ka bhaag — AI ko "jo dikha raha hai" ka sandarbh (screen padhna)
  function screenCtx() {
    try {
      var s = (window.BP && window.BP.lastScreen) || null;
      if (!s || !s.text || s.text.length < 40) return '';
      if (s.hash === '#/chat' || !s.hash) return '';
      return 'पेज: ' + (s.title || s.hash) + '। ' + s.text.slice(0, 700);
    } catch (e) { return ''; }
  }
  // voice commands — app ke andar ka kaam khud
  function command(q) {
    var s = (q || '').toLowerCase();
    var go = function (h) { location.hash = h; };
    if (/(कमज़|कमजोर|kamzor|weak)/.test(s)) {
      var out = [];
      try {
        var ins = (window.STUDY && window.STUDY.insights) ? window.STUDY.insights() : null;
        if (ins) {
          if (ins.weak && ins.weak.length) {
            out.push(L('तुम्हारे कमज़ोर अध्याय:', 'Your weak chapters:'));
            ins.weak.forEach(function (w) { out.push('• ' + (w.name || w.ch || w.t) + ' — ' + w.pct + '%'); });
          }
          if (ins.strong && ins.strong.length) {
            out.push(L('मज़बूत:', 'Strong:'));
            ins.strong.forEach(function (w) { out.push('• ' + (w.name || w.ch || w.t) + ' — ' + w.pct + '%'); });
          }
          out.push(L('कुल सवाल: ', 'Total questions: ') + ins.total + ', सही: ' + ins.acc + '%');
          if (ins.worstQ && ins.worstQ.length) {
            out.push(L('सबसे ज़्यादा गलती:', 'Most wrong:'));
            ins.worstQ.slice(0, 3).forEach(function (w) { out.push('• ' + String(w.q).slice(0, 45) + ' — ' + w.pct + '%'); });
          }
        }
      } catch (e) { }
      if (!out.length) out.push(L('अभी कोई क्विज़ नहीं दिया — पहले क्विज़ दो, फिर कमज़ोरी बताऊँगा।', 'No quiz taken yet — take a quiz first.'));
      var msg = out.join('\n');
      pushMsg({ role: 'assistant', content: msg, model: 'BoardPrep' });
      render();
      speak(msg);
      return true;
    }
    if (/(नोट्स|note)/.test(s) && /(खोल|khol|open|dikha)/.test(s)) { go('#/notes'); return true; }
    if (/(कैलकुलेटर|calc)/.test(s)) { go('#/calc'); return true; }
    if (/(रिवीज़न|revise|revision)/.test(s)) { go('#/revision'); return true; }
    if (/(मॉक|mock|परीक्षा|exam)/.test(s)) { go('#/exam'); return true; }
    if (/(क्विज़|quiz)/.test(s) && /(बना|bana|शुरू|start|दो)/.test(s)) { go('#/quiz?kind=weak'); return true; }
    if (/(खोज|search)/.test(s)) { go('#/search'); return true; }
    return false;
  }
  // awaaz me javab
  function speak(text) {
    try {
      if (!('speechSynthesis' in window)) return;
      if (document.getElementById('chatVoice') && !document.getElementById('chatVoice').checked) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text || '').replace(/[*/#]/g, ' '));
      u.lang = 'hi-IN'; u.rate = 1.02;
      var vs = window.speechSynthesis.getVoices();
      var pick = null;
      for (var i = 0; i < vs.length; i++) { if (/hi/i.test(vs[i].lang)) { pick = vs[i]; break; } }
      if (pick) u.voice = pick;
      window.speechSynthesis.speak(u);
    } catch (e) { }
  }
  // awaaz se sawal
  function startVoice() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert(L('इस ब्राउज़र में voice नहीं चलेगी।', 'Voice is not supported in this browser.')); return; }
    var r = new SR();
    r.lang = 'hi-IN'; r.interimResults = false; r.maxAlternatives = 1;
    var btn = document.getElementById('chatMic');
    r.onresult = function (e) {
      var t = (e.results[0] && e.results[0][0] && e.results[0][0].transcript) || '';
      if (!t) return;
      var inp = document.getElementById('chatIn');
      if (inp) inp.value = t;
      send();
    };
    r.onerror = function () { if (btn) btn.classList.remove('on'); };
    r.onend = function () { if (btn) btn.classList.remove('on'); };
    try { r.start(); if (btn) btn.classList.add('on'); } catch (e) { }
  }
  function when(ms) {
    try { var d = new Date(ms); return d.toLocaleString('hi-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return ''; }
  }

  function cur() {
    var o = all(), id = active();
    if (id && o[id]) return o[id];
    var ks = Object.keys(o).sort(function (a, b) { return (o[b].updated || 0) - (o[a].updated || 0); });
    if (ks.length) { setActive(ks[0]); return o[ks[0]]; }
    var n = { id: mkid(), title: L('Nayi chat', 'नई चैट'), msgs: [], updated: Date.now() };
    o[n.id] = n; setActive(n.id); saveAll(o);
    return n;
  }
  function newChat() {
    var o = all();
    var n = { id: mkid(), title: L('Nayi chat', 'नई चैट'), msgs: [], updated: Date.now() };
    o[n.id] = n; setActive(n.id); saveAll(o);
    return n;
  }
  function pushMsg(m) {
    var o = all(), c = o[active()];
    if (!c) return;
    c.msgs = c.msgs.concat([m]).slice(-80);
    if (c.title === L('Nayi chat', 'नई चैट') && m.role === 'user') {
      c.title = m.content.slice(0, 40) || c.title;
    }
    c.updated = Date.now();
    o[c.id] = c;
    saveAll(o);
  }

  function view() {
    var h = '<section class="section">';
    h += '<div class="section-head"><h2>' + esc(L('AI chat', 'AI चैट')) + '</h2>' +
      '<span class="note" id="cqQuota"></span></div>';
    h += '<div class="chat-top"><button class="btn btn-ghost btn-sm" id="chatList">' + esc(L('Chats', 'चैटें')) + '</button>' +
      '<button class="btn btn-ghost btn-sm" id="chatNew">+ ' + esc(L('Nayi chat', 'नई चैट')) + '</button></div>';
    h += '<div id="chatBox" class="chatbox"></div>';
    h += '<div class="chatbar"><input id="chatIn" type="text" placeholder="' + esc(L('Apna sawal likho…', 'अपना सवाल लिखो…')) + '">' +
      '<button class="btn btn-accent btn-sm" id="chatImgBtn" title="' + esc(L('Photo bhejo', 'फोटो भेजो')) + '">📷</button>' +
      '<input type="file" id="chatImg" accept="image/*" hidden>' +
      '<button class="btn btn-accent btn-sm" id="chatMic" title="' + esc(L('Bolke poocho', 'बोलकर पूछो')) + '">🎤</button>' +
      '<button class="btn btn-accent" id="chatSend">' + esc(L('Bhejo', 'भेजो')) + '</button></div>';
    h += '<div class="chatact">' +
      '<label class="link-btn"><input type="checkbox" id="chatWeb" checked> ' + esc(L('Web search', 'वेब खोज')) + '</label>' +
      '<label class="link-btn" style="margin-left:auto"><input type="checkbox" id="chatVoice" checked> ' + esc(L('Awaaz me javab', 'आवाज़ में जवाब')) + '</label></div>';
    h += '</section>';
    h += '<div id="chatSheet" class="sheet" hidden><div class="sheet-h">' +
      '<strong>' + esc(L('Meri chat', 'मेरी चैटें')) + '</strong>' +
      '<button class="btn btn-ghost btn-sm" id="chatSheetX">' + esc(L('Band', 'बंद')) + '</button></div>' +
      '<div id="chatSheetBody" class="sheet-b"></div></div>';
    return h;
  }

  function renderSheet() {
    var b = document.getElementById('chatSheetBody');
    if (!b) return;
    var o = all();
    var ks = Object.keys(o).sort(function (a, c) { return (o[c].updated || 0) - (o[a].updated || 0); });
    if (!ks.length) { b.innerHTML = '<div class="sheet-empty">' + esc(L('Abhi koi chat nahi.', 'अभी कोई चैट नहीं।')) + '</div>'; return; }
    b.innerHTML = ks.map(function (id) {
      var c = o[id];
      var on = id === active() ? ' on' : '';
      return '<div class="srow' + on + '" data-id="' + esc(id) + '">' +
        '<div class="smain"><div class="stitle">' + esc(c.title || '—') + '</div>' +
        '<div class="smeta">' + when(c.updated) + ' · ' + (c.msgs ? c.msgs.length : 0) + ' ' + esc(L('msg', 'संदेश')) + '</div></div>' +
        '<button class="sdel" data-del="' + esc(id) + '" title="' + esc(L('Delete', 'हटाओ')) + '">×</button></div>';
    }).join('');
    Array.prototype.forEach.call(b.querySelectorAll('.srow'), function (r) {
      r.addEventListener('click', function (e) {
        if (e.target.closest('.sdel')) return;
        setActive(r.getAttribute('data-id'));
        closeSheet(); render();
      });
    });
    Array.prototype.forEach.call(b.querySelectorAll('.sdel'), function (d) {
      d.addEventListener('click', function (e) {
        e.stopPropagation();
        var o2 = all(), id = d.getAttribute('data-del');
        delete o2[id];
        if (active() === id) {
          var ks2 = Object.keys(o2);
          setActive(ks2.length ? ks2[0] : newChat().id);
        }
        saveAll(o2); renderSheet(); render();
      });
    });
  }
  function openSheet() { renderSheet(); var s = document.getElementById('chatSheet'); if (s) { s.hidden = false; setTimeout(function () { s.classList.add('open'); }, 5); } }
  function closeSheet() { var s = document.getElementById('chatSheet'); if (!s) return; s.classList.remove('open'); setTimeout(function () { s.hidden = true; }, 220); }

  function renderQuota() {
    var el = document.getElementById('cqQuota');
    if (!el || !window.Cloud) return;
    window.Cloud.quota().then(function (r) {
      if (!r || !r.ok) return;
      el.textContent = (r.per > 9999) ? esc(L('Unlimited', 'असीमित')) : (r.left + '/' + r.per);
    }).catch(function () { });
  }

  function render() {
    var box = document.getElementById('chatBox');
    if (!box) return;
    var c = cur();
    if (!c || !c.msgs.length) {
      box.innerHTML = '<div class="chat-empty">' + esc(L('Kuch poocho — padhai, quiz, ya bahar ki bhi baat.', 'कुछ पूछो — पढ़ाई, क्विज़, या बाहर की भी बात।')) + '</div>';
      return;
    }
    box.innerHTML = c.msgs.map(function (m, i) {
      var who = m.role === 'user' ? 'me' : 'ai';
      var meta = (m.model ? '<div class="cmodel">' + esc(m.model) + '</div>' : '');
      var scr = m.scr ? '<div class="cmodel">' + esc(L('स्क्रीन देखी गई', 'screen seen')) + '</div>' : '';
      var fb = (m.role === 'assistant')
        ? '<div class="cfb"><button class="cfb-b" data-fb="1" data-i="' + i + '" title="अच्छा">👍</button>' +
        '<button class="cfb-b" data-fb="0" data-i="' + i + '" title="सुधारो">👎</button></div>'
        : '';
      return '<div class="cmsg ' + who + '"><div class="cbub">' + esc(m.content).replace(/\n/g, '<br>') + '</div>' + scr + meta + fb + '</div>';
    }).join('');
    Array.prototype.forEach.call(box.querySelectorAll('.cfb-b'), function (b) {
      b.addEventListener('click', function () {
        var i = Number(b.getAttribute('data-i'));
        var msg = c.msgs[i] || {};
        var topic = (String(msg.content || '').split(/[\s।]+/)[0] || 'general').slice(0, 40);
        if (window.Cloud && window.Cloud.feedback) window.Cloud.feedback(topic, b.getAttribute('data-fb') === '1').catch(function () { });
        b.parentNode.innerHTML = '<span class="cfb-ok">' + esc(L('धन्यवाद! AI इससे सीखेगा।', 'Thanks! AI will learn from this.')) + '</span>';
      });
    });
    box.scrollTop = box.scrollHeight;
  }

  function send() {
    var inp = document.getElementById('chatIn');
    var q = (inp.value || '').trim();
    if (!q) return;
    // app ke andar ka kaam — pehle command dekho
    if (command(q)) { inp.value = ''; render(); return; }
    if (!window.Cloud || !window.Cloud.ready()) {
      alert(L('Cloud API set nahi hai.', 'क्लाउड API सेट नहीं है।'));
      return;
    }
    pushMsg({ role: 'user', content: q, scr: !!screenCtx() });
    inp.value = '';
    render();
    var box = document.getElementById('chatBox');
    var thinking = document.createElement('div');
    thinking.className = 'cmsg ai';
    thinking.innerHTML = '<div class="cbub">' + esc(L('Soch raha hai…', 'सोच रहा है…')) + '</div>';
    box.appendChild(thinking);
    box.scrollTop = box.scrollHeight;

    var web = (document.getElementById('chatWeb') || {}).checked !== false;
    var c = cur();
    var hist = c.msgs.slice(-10).map(function (m) { return { role: m.role, content: m.content }; });
    // screen ka sandarbh ke saath bhejo — AI "jo dikha raha hai" samjhe
    var full = screenCtx() ? ('[स्क्रीन पर यह दिख रहा है]: ' + screenCtx() + '\n\nसवाल: ' + q) : q;
    window.Cloud.chat(full, hist, web).then(function (r) {
      thinking.remove();
      if (r && r.ok) {
        pushMsg({ role: 'assistant', content: r.answer, model: r.model });
        render(); renderQuota(); renderSheet();
        speak(r.answer);
      } else {
        var m2 = document.createElement('div');
        m2.className = 'cmsg ai';
        m2.innerHTML = '<div class="cbub">' + esc(friendly({ message: (r && r.error) || '' })) + '</div>';
        box.appendChild(m2);
        box.scrollTop = box.scrollHeight;
      }
    }).catch(function (e) {
      thinking.remove();
      var m3 = document.createElement('div');
      m3.className = 'cmsg ai';
      m3.innerHTML = '<div class="cbub">' + esc(friendly(e)) + '</div>';
      box.appendChild(m3);
    });
  }

  // photo -> AI (image samajhkar javab)
  function sendImage(dataUrl, q) {
    if (!window.Cloud || !window.Cloud.ready()) { alert(L('Cloud API set nahi hai.', 'क्लाउड API सेट नहीं है।')); return; }
    pushMsg({ role: 'user', content: (q ? q + ' ' : '') + '📷 [' + L('photo', 'फोटो') + ']', img: true });
    render();
    var box = document.getElementById('chatBox');
    var thinking = document.createElement('div');
    thinking.className = 'cmsg ai';
    thinking.innerHTML = '<div class="cbub">' + esc(L('Photo padh raha hai…', 'फोटो पढ़ रहा है…')) + '</div>';
    box.appendChild(thinking); box.scrollTop = box.scrollHeight;
    window.Cloud.vision(dataUrl, q).then(function (r) {
      thinking.remove();
      if (r && r.ok) {
        pushMsg({ role: 'assistant', content: r.answer, model: r.model || 'Vision' });
        render(); renderQuota(); renderSheet(); speak(r.answer);
      } else {
        var m = document.createElement('div'); m.className = 'cmsg ai';
        var msg = (r && r.noKey)
          ? L('फोटो समझने के लिए एक और मुफ़्त key चाहिए (OpenRouter) — settings में डालो।', 'Photo needs one more free key (OpenRouter) — add it in settings.')
          : friendly({ message: (r && r.error) || '' });
        m.innerHTML = '<div class="cbub">' + esc(msg) + '</div>';
        box.appendChild(m); box.scrollTop = box.scrollHeight;
      }
    }).catch(function (e) {
      thinking.remove();
      var m2 = document.createElement('div'); m2.className = 'cmsg ai';
      m2.innerHTML = '<div class="cbub">' + esc(friendly(e)) + '</div>';
      box.appendChild(m2);
    });
  }
  function pickImage(file, q) {
    var rd = new FileReader();
    rd.onload = function () {
      var img = new Image();
      img.onload = function () {
        var mx = 1000, w = img.width, h = img.height, sc = Math.min(1, mx / Math.max(w, h));
        var cv = document.createElement('canvas');
        cv.width = Math.round(w * sc); cv.height = Math.round(h * sc);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        sendImage(cv.toDataURL('image/jpeg', 0.72), q);
      };
      img.onerror = function () { sendImage(String(rd.result), q); };
      img.src = String(rd.result);
    };
    rd.readAsDataURL(file);
  }
  window.ChatUI = {
    view: view,
    mount: function () {
      render(); renderQuota();
      setTimeout(renderQuota, 1500); setTimeout(renderQuota, 4000);
      var s = document.getElementById('chatSend');
      if (s) s.addEventListener('click', send);
      var inp = document.getElementById('chatIn');
      if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
      var mic = document.getElementById('chatMic');
      if (mic) mic.addEventListener('click', startVoice);
      var ib = document.getElementById('chatImgBtn');
      var iin = document.getElementById('chatImg');
      if (ib && iin) {
        ib.addEventListener('click', function () { iin.click(); });
        iin.addEventListener('change', function () {
          var f = iin.files && iin.files[0];
          if (f) pickImage(f, (document.getElementById('chatIn').value || '').trim());
          iin.value = '';
        });
      }
      var spk = document.getElementById('chatVoice');
      if (spk) spk.addEventListener('change', function () { if (!spk.checked) { try { window.speechSynthesis.cancel(); } catch (e) { } } });
      var nw = document.getElementById('chatNew');
      if (nw) nw.addEventListener('click', function () { newChat(); render(); renderQuota(); });
      var ls = document.getElementById('chatList');
      if (ls) ls.addEventListener('click', openSheet);
      var sx = document.getElementById('chatSheetX');
      if (sx) sx.addEventListener('click', closeSheet);
      var sh = document.getElementById('chatSheet');
      if (sh) sh.addEventListener('click', function (e) { if (e.target === sh) closeSheet(); });
    }
  };
})();
