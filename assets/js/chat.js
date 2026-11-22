// BoardPrep AI chat — ChatGPT/Gemini जैसा चैट डैशबोर्ड (cloud worker से)
(function () {
  'use strict';
  var KEY = 'bp_chat_v1';

  function L(en, hi) { return (window.BP && window.BP.state.lang === 'en') ? en : hi; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function load() { try { var v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a.slice(-60))); } catch (e) { } }
  function fmtTime(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    var m = Math.floor(s / 60);
    return m > 0 ? (m + ' ' + L('min', 'मिनट')) : (s + ' ' + L('sec', 'सेकंड'));
  }

  function view() {
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('AI chat', 'AI चैट')) + '</h2>' +
      '<span class="note" id="cqQuota"></span></div>';
    h += '<div id="chatBox" class="chatbox"></div>';
    h += '<div class="chatbar"><input id="chatIn" type="text" placeholder="' + esc(L('Apna sawal likho…', 'अपना सवाल लिखो…')) + '">' +
      '<button class="btn btn-accent" id="chatSend">' + esc(L('Bhejo', 'भेजो')) + '</button></div>';
    h += '<div class="chatact"><button class="link-btn" id="chatClear">' + esc(L('Nayi chat', 'नई चैट')) + '</button>' +
      '<label class="link-btn" style="margin-left:auto"><input type="checkbox" id="chatWeb" checked> ' + esc(L('Web search', 'वेब खोज')) + '</label></div>';
    return h + '</section>';
  }

  function renderQuota() {
    var el = document.getElementById('cqQuota');
    if (!el || !window.Cloud) return;
    window.Cloud.quota().then(function (r) {
      if (!r || !r.ok) return;
      el.textContent = r.left + '/' + r.per + (r.windowH ? ' · ' + r.windowH + 'h' : '');
    }).catch(function () { });
  }

  function render() {
    var box = document.getElementById('chatBox');
    if (!box) return;
    var msgs = load();
    if (!msgs.length) {
      box.innerHTML = '<div class="chat-empty">' + esc(L('Kuch poocho — padhai, quiz, ya bahar ki bhi baat.', 'कुछ पूछो — पढ़ाई, क्विज़, या बाहर की भी बात।')) + '</div>';
      return;
    }
    box.innerHTML = msgs.map(function (m) {
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
    var msgs = load();
    msgs.push({ role: 'user', content: q });
    save(msgs);
    inp.value = '';
    render();
    var box = document.getElementById('chatBox');
    var thinking = document.createElement('div');
    thinking.className = 'cmsg ai';
    thinking.innerHTML = '<div class="cbub">' + esc(L('Soch raha hai…', 'सोच रहा है…')) + '</div>';
    box.appendChild(thinking);
    box.scrollTop = box.scrollHeight;

    var web = (document.getElementById('chatWeb') || {}).checked !== false;
    var hist = msgs.slice(-10).map(function (m) { return { role: m.role, content: m.content }; });
    window.Cloud.chat(q, hist, web).then(function (r) {
      thinking.remove();
      if (r && r.ok) {
        msgs.push({ role: 'assistant', content: r.answer, model: r.model });
        save(msgs);
        render();
        renderQuota();
      } else if (r && r.limit) {
        var el = document.getElementById('cqQuota');
        if (el) el.textContent = '0/' + (r.per || '');
        var m2 = document.createElement('div');
        m2.className = 'cmsg ai';
        m2.innerHTML = '<div class="cbub">' + esc(L('Limit khatam — ', 'लिमिट खत्म — ')) +
          fmtTime(r.retryMs || 0) + ' ' + esc(L('baad phir try karo.', 'बाद फिर कोशिश करो।')) + '</div>';
        box.appendChild(m2);
        box.scrollTop = box.scrollHeight;
      } else {
        var m3 = document.createElement('div');
        m3.className = 'cmsg ai';
        m3.innerHTML = '<div class="cbub">' + esc((r && r.error) || L(' jawab nahi aaya.', 'जवाब नहीं आया।')) + '</div>';
        box.appendChild(m3);
      }
    }).catch(function (e) {
      thinking.remove();
      var m4 = document.createElement('div');
      m4.className = 'cmsg ai';
      m4.innerHTML = '<div class="cbub">' + esc(String(e.message || e)) + '</div>';
      box.appendChild(m4);
    });
  }

  window.ChatUI = {
    view: view,
    mount: function () {
      render();
      renderQuota();
      var s = document.getElementById('chatSend');
      if (s) s.addEventListener('click', send);
      var inp = document.getElementById('chatIn');
      if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
      var c = document.getElementById('chatClear');
      if (c) c.addEventListener('click', function () { try { localStorage.removeItem(KEY); } catch (e) { } render(); });
    }
  };
})();
