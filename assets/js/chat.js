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
      '<button class="btn btn-accent" id="chatSend">' + esc(L('Bhejo', 'भेजो')) + '</button></div>';
    h += '<div class="chatact">' +
      '<label class="link-btn"><input type="checkbox" id="chatWeb" checked> ' + esc(L('Web search', 'वेब खोज')) + '</label></div>';
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
    box.innerHTML = c.msgs.map(function (m) {
      var who = m.role === 'user' ? 'me' : 'ai';
      var meta = (m.model ? '<div class="cmodel">' + esc(m.model) + '</div>' : '');
      return '<div class="cmsg ' + who + '"><div class="cbub">' + esc(m.content).replace(/\n/g, '<br>') + '</div>' + meta + '</div>';
    }).join('');
    box.scrollTop = box.scrollHeight;
  }

  function send() {
    var inp = document.getElementById('chatIn');
    var q = (inp.value || '').trim();
    if (!q) return;
    if (!window.Cloud || !window.Cloud.ready()) {
      alert(L('Cloud API set nahi hai.', 'क्लाउड API सेट नहीं है।'));
      return;
    }
    pushMsg({ role: 'user', content: q });
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
    window.Cloud.chat(q, hist, web).then(function (r) {
      thinking.remove();
      if (r && r.ok) {
        pushMsg({ role: 'assistant', content: r.answer, model: r.model });
        render(); renderQuota(); renderSheet();
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

  window.ChatUI = {
    view: view,
    mount: function () {
      render(); renderQuota();
      var s = document.getElementById('chatSend');
      if (s) s.addEventListener('click', send);
      var inp = document.getElementById('chatIn');
      if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
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
