// BoardPrep v2 — Student progress, streak, exam simulator, revision, assistant
// Sab kuch localStorage me (safe helpers ke saath). Koi server/API nahi — sab offline.
(function () {
  'use strict';

  var KEY = 'bp_study_v1';
  var MAX_ATTEMPTS = 2000, MAX_WRONG = 300, MAX_BOOK = 300, MAX_EXAMS = 60;

  function today(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (d && typeof d === 'object') {
          d.days = d.days || {}; d.attempts = d.attempts || []; d.wrong = d.wrong || [];
          d.book = d.book || []; d.exams = d.exams || []; d.goal = d.goal || 5; d.srs = d.srs || {};
          return d;
        }
      }
    } catch (e) {}
    return { v: 1, days: {}, attempts: [], wrong: [], book: [], exams: [], goal: 5, srs: {} };
  }
  function save(d) {
    try {
      // size control — purane entries hatao
      if (d.attempts.length > MAX_ATTEMPTS) d.attempts = d.attempts.slice(-MAX_ATTEMPTS);
      if (d.wrong.length > MAX_WRONG) d.wrong = d.wrong.slice(-MAX_WRONG);
      if (d.book.length > MAX_BOOK) d.book = d.book.slice(-MAX_BOOK);
      if (d.exams.length > MAX_EXAMS) d.exams = d.exams.slice(-MAX_EXAMS);
      localStorage.setItem(KEY, JSON.stringify(d));
      return true;
    } catch (e) { return false; }
  }

  var D = load();

  function lang() {
    return (window.BP && window.BP.state && window.BP.state.lang) ? window.BP.state.lang : 'hi';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function L(en, hi) { return lang() === 'en' ? en : hi; }

  /* ---------------- recording ---------------- */

  function attempt(subj, chap, ok, qtext) {
    D.attempts.push({ s: subj, c: chap || '', ok: ok ? 1 : 0, q: (qtext || '').slice(0, 160), t: Date.now() });
    var day = D.days[today()] || { done: 0, secs: 0 };
    day.done += 1; D.days[today()] = day;
    save(D);
  }
  function wrongQ(q, subj, chap) {
    D.wrong.push({ q: q, s: subj, c: chap || '', t: Date.now() });
    save(D);
  }
  function toggleBook(q) {
    var id = qid(q);
    var i = D.book.findIndex(function (x) { return x.id === id; });
    if (i >= 0) { D.book.splice(i, 1); save(D); return false; }
    D.book.push({ id: id, q: q, s: q.subj, c: q.chap || q.part || '', t: Date.now() });
    save(D); return true;
  }
  function qid(q) { return (q.subj || '') + '|' + (q.chap || q.part || '') + '|' + (q.q || '').slice(0, 120); }
  function addExam(r) { D.exams.push(r); save(D); }
  function setGoal(n) { D.goal = n; save(D); }
  function markSec(ts) {
    var day = D.days[today()] || { done: 0, secs: 0 };
    day.secs += ts; D.days[today()] = day; save(D);
  }
  function clearAll() { D = load(); D.attempts = []; D.wrong = []; D.book = []; D.exams = []; D.days = {}; save(D); }

  /* ---------------- computed ---------------- */

  function subjStats() {
    var m = {};
    D.attempts.forEach(function (a) {
      var k = m[a.s] || (m[a.s] = { n: 0, ok: 0 });
      k.n++; if (a.ok) k.ok++;
    });
    Object.keys(m).forEach(function (k) {
      m[k].pct = Math.round((m[k].ok / m[k].n) * 100);
    });
    return m;
  }
  function chapStats() {
    var m = {};
    D.attempts.forEach(function (a) {
      var k = a.s + '|' + a.c;
      var v = m[k] || (m[k] = { s: a.s, c: a.c, n: 0, ok: 0 });
      v.n++; if (a.ok) v.ok++;
    });
    var arr = Object.keys(m).map(function (k) { return m[k]; });
    arr.forEach(function (x) { x.pct = Math.round((x.ok / x.n) * 100); });
    arr.sort(function (a, b) { return a.pct - b.pct; });
    return arr;
  }
  function streak() {
    var n = 0;
    var d = new Date();
    // agar aaj abhi kuch nahi kiya, to streak kal se ginna shuru karo
    if (!((D.days[today(d)] || {}).done > 0)) d.setDate(d.getDate() - 1);
    while ((D.days[today(d)] || {}).done > 0) {
      n++;
      d.setDate(d.getDate() - 1);
      if (n > 400) break;
    }
    return n;
  }
  function last7() {
    var out = [], d = new Date();
    for (var i = 6; i >= 0; i--) {
      var t = today(d);
      out.push({ d: t, n: (D.days[t] || {}).done || 0, secs: (D.days[t] || {}).secs || 0, goal: D.goal || 5 });
      d.setDate(d.getDate() - 1);
    }
    return out;
  }
  function bestDay() {
    var best = 0, t = '';
    Object.keys(D.days).forEach(function (k) { if ((D.days[k].done || 0) > best) { best = D.days[k].done; t = k; } });
    return { n: best, d: t };
  }

  /* ---------------- views ---------------- */

  /* ---------------- chapter mastery (asli activity se, fake nahi) ---------------- */

  function mastery(subjKey, chap) {
    if (!chap) return { state: 'notstarted', n: 0, pct: 0 };
    var n = 0, ok = 0;
    D.attempts.forEach(function (a) { if (a.s === subjKey && a.c === chap) { n++; if (a.ok) ok++; } });
    var pct = n ? Math.round((ok / n) * 100) : 0;
    var st;
    if (n === 0) st = 'notstarted';
    else if (n < 5) st = 'learning';
    else if (n < 10) st = (pct < 50 ? 'needsrevision' : 'practicing');
    else st = (pct >= 80 ? 'completed' : (pct < 50 ? 'needsrevision' : 'testpending'));
    return { state: st, n: n, pct: pct };
  }

  /* ---------------- study reminder (offline, local notification) ---------------- */
  var RKEY = 'bp_remind_v1';
  function remLoad() { try { return JSON.parse(localStorage.getItem(RKEY)) || {}; } catch (e) { return {}; } }
  function remSave(d) { try { localStorage.setItem(RKEY, JSON.stringify(d)); } catch (e) {} }

  window.STUDY = {
    attempt: attempt, wrong: wrongQ, book: toggleBook, addExam: addExam,
    setGoal: setGoal, markSec: markSec, clear: clearAll, save: function () { return save(D); },
    mastery: mastery,
    data: function () { return D; },
    stats: function () {
      return {
        subj: subjStats(), chap: chapStats(), streak: streak(), last7: last7(), goal: D.goal || 5,
        best: bestDay(),
        total: D.attempts.length,
        right: D.attempts.filter(function (a) { return a.ok; }).length,
        wrong: D.wrong.length, book: D.book.length, exams: D.exams.length
      };
    }
  };

  /* ---------------- spaced repetition (SM-2 lite, offline) ---------------- */
  function srsUpdate(q, ok) {
    if (!D.srs) D.srs = {};
    var id = (q && q.id) || qid(q);
    var s = D.srs[id] || { n: 0, lapses: 0, due: 0 };
    if (ok) {
      s.n = (s.n || 0) + 1;
      var iv = s.n === 1 ? 1 : s.n === 2 ? 3 : s.n === 3 ? 7 : s.n === 4 ? 14 : 30;
      s.due = Date.now() + iv * 86400000;
    } else {
      s.n = 0; s.lapses = (s.lapses || 0) + 1; s.due = Date.now();
    }
    D.srs[id] = s;
    save(D);
    return s;
  }
  function srsDue(limit) {
    var now = Date.now(), out = [], qs = (window.BOARD_DATA && window.BOARD_DATA.questions) || [];
    for (var i = 0; i < qs.length; i++) {
      var s = D.srs && D.srs[qs[i].id];
      if (s && s.due && s.due <= now) out.push(qs[i]);
      if (out.length >= (limit || 30)) break;
    }
    return out;
  }
  function srsStats() {
    var n = 0, due = 0;
    if (D.srs) { for (var k in D.srs) { n++; if (D.srs[k].due && D.srs[k].due <= Date.now()) due++; } }
    return { learned: n, due: due };
  }
  // Question-level + chapter-level deep analytics (browser me hi)
  function insights() {
    var byId = {};
    (D.attempts || []).forEach(function (a) {
      var id = (a.q || '').slice(0, 120);
      var v = byId[id] || (byId[id] = { q: a.q, s: a.s, c: a.c, n: 0, ok: 0 });
      v.n++; if (a.ok) v.ok++;
    });
    var rows = Object.keys(byId).map(function (k) { var v = byId[k]; v.pct = v.n ? Math.round((v.ok / v.n) * 100) : 0; return v; });
    var ch = chapStats();
    var practised = ch.filter(function (x) { return x.n >= 3; });
    var weak = practised.slice().sort(function (a, b) { return a.pct - b.pct; }).slice(0, 3);
    var strong = practised.slice().sort(function (a, b) { return b.pct - a.pct; }).slice(0, 3);
    var worstQ = rows.filter(function (x) { return x.n >= 2; }).sort(function (a, b) { return a.pct - b.pct; }).slice(0, 5);
    var total = D.attempts.length, right = D.attempts.filter(function (a) { return a.ok; }).length;
    return {
      total: total, right: right, acc: total ? Math.round((right / total) * 100) : 0,
      weak: weak, strong: strong, worstQ: worstQ, chapters: ch.length, rows: rows
    };
  }
  window.STUDY.insights = insights;

  window.STUDY.srsUpdate = srsUpdate;
  window.STUDY.srsDue = srsDue;
  window.STUDY.srsStats = srsStats;

  /* ---------------- exam target + countdown (student khud set karta hai) ---------------- */
  var TKEY = 'bp_target_v1';
  function targetGet() { try { return JSON.parse(localStorage.getItem(TKEY)) || null; } catch (e) { return null; } }
  function targetSet(o) { try { localStorage.setItem(TKEY, JSON.stringify(o)); } catch (e) {} }

  function countdown() {
    var t = targetGet();
    if (!t || !t.exam) return null;
    var end = new Date(t.exam + 'T23:59:59');
    var now = new Date();
    var days = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
    var totalQ = (window.BOARD_DATA && window.BOARD_DATA.questions) ? window.BOARD_DATA.questions.length : 8356;
    var syl = (t.syllabus == null ? 100 : Math.max(1, Math.min(100, Number(t.syllabus) || 100)));
    var goal = Math.max(1, Math.round(totalQ * syl / 100));
    var done = (window.STUDY && window.STUDY.stats) ? window.STUDY.stats().total : 0;
    var left = Math.max(0, goal - done);
    var perDay = days > 0 ? Math.ceil(left / days) : left;
    return {
      days: days, exam: t.exam, goal: goal, done: done, left: left, perDay: perDay,
      syllabus: syl, daily: Math.max(1, Number(t.daily) || 20), time: t.time || '07:00'
    };
  }

  window.STUDY.targetGet = targetGet;
  window.STUDY.targetSet = targetSet;
  window.STUDY.countdown = countdown;
  window.STUDY.reminderGet = remLoad;
  window.STUDY.reminderSet = function (o) { var d = remLoad(); for (var k in o) d[k] = o[k]; remSave(d); return d; };
  window.STUDY.remindCheck = function () {
    var d = remLoad();
    if (!d.on) return null;
    var now = new Date();
    var hm = now.getHours() * 60 + now.getMinutes();
    var set = parseInt(d.min || 0, 10);
    var today = now.toISOString().slice(0, 10);
    if (d.last === today) return null;            // aaj pehle ho chuka
    if (Math.abs(hm - set) > 2) return null;      // time ke ±2 min
    d.last = today; remSave(d);
    var c = countdown();
    var body;
    if (c && c.days > 0) {
      body = 'Aaj ' + c.days + ' din bache hai — ' + c.perDay + ' sawal karo! (बचा: ' + c.left + ')';
    } else if (c && c.days === 0) {
      body = 'Aaj exam ka din hai — sahi likho, best of luck!';
    } else {
      body = d.msg || 'Abhi padho! Daily goal poora karo.';
    }
    return { title: 'BoardPrep', body: body };
  };

  /* ---------------- progress dashboard ---------------- */

  window.vProgress = function () {
    var s = window.STUDY.stats();
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Progress dashboard', 'प्रगति डैशबोर्ड')) + '</h2>' +
      '<span class="note">' + esc(L('Offline — sirf is device par', 'ऑफ़लाइन — सिर्फ़ इस डिवाइस पर')) + '</span></div>';
    h += '<div class="chips" style="margin-bottom:10px">' +
      '<a class="fchip" href="#/revision">' + esc(L('Revision', 'रिवीज़न')) + '</a>' +
      '<a class="fchip" href="#/planner">' + esc(L('Planner', 'योजना')) + '</a>' +
      '<a class="fchip" href="#/timer">' + esc(L('Timer', 'टाइमर')) + '</a>' +
      '<a class="fchip" href="#/remind">' + esc(L('Reminder', 'अनुस्मारक')) + '</a>' +
      '<a class="fchip" href="#/mynotes">' + esc(L('My notes', 'मेरी नोट्स')) + '</a></div>';

    h += '<div class="stats-grid">' +
      '<div class="stat"><b>' + s.total + '</b><span>' + esc(L('questions attempted', 'सवाल किए')) + '</span></div>' +
      '<div class="stat"><b style="color:#16a34a">' + s.right + '</b><span>' + esc(L('correct', 'सही')) + '</span></div>' +
      '<div class="stat"><b style="color:#dc2626">' + (s.total - s.right) + '</b><span>' + esc(L('incorrect', 'गलत')) + '</span></div>' +
      '<div class="stat"><b style="color:#f59e0b">' + s.streak + '</b><span>' + esc(L('day streak', 'दिन की स्ट्रीक')) + '</span></div>' +
      '</div>';

    // 7-din ka chart
    var max = Math.max.apply(null, s.last7.map(function (x) { return x.n; }).concat([s.goal || 5, 1]));
    h += '<div class="board-group">' + esc(L('Last 7 days', 'पिछले 7 दिन')) + '</div>';
    h += '<div style="display:flex;gap:6px;align-items:flex-end;height:120px;margin:8px 0">';
    s.last7.forEach(function (x) {
      var pct = Math.round((x.n / max) * 100);
      var col = x.n >= (s.goal || 5) ? '#22c55e' : (x.n > 0 ? '#f59e0b' : '#e5e7eb');
      h += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">' +
        '<div style="width:100%;max-width:44px;height:' + Math.max(4, pct) + 'px;border-radius:6px 6px 2px 2px;background:' + col + '"></div>' +
        '<div style="font-size:10px;color:#64748b">' + x.d.slice(8) + '</div></div>';
    });
    h += '</div>';
    h += '<div class="note">' + esc(L('Daily goal', 'रोज़ का लक्ष्य')) + ': ' + s.goal + ' ' + esc(L('questions', 'सवाल')) +
      ' · <a href="#/exam" style="color:var(--accent);font-weight:700">' + esc(L('Mock exam →', 'मॉक एग्ज़ाम →')) + '</a></div>';

    // subject-wise
    var keys = Object.keys(s.subj);
    if (keys.length) {
      h += '<div class="board-group">' + esc(L('Subject-wise', 'विषयवार')) + '</div>';
      keys.sort(function (a, b) { return (s.subj[b].pct || 0) - (s.subj[a].pct || 0); });
      keys.forEach(function (k) {
        var x = s.subj[k];
        var nm = (window.SUBJECT_MAP && window.SUBJECT_MAP[k] ? (lang() === 'en' ? window.SUBJECT_MAP[k].en : window.SUBJECT_MAP[k].name) : k);
        h += '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px">' +
          '<span>' + esc(nm) + '</span><b>' + x.ok + '/' + x.n + ' · ' + x.pct + '%</b></div>' +
          '<div style="height:8px;border-radius:6px;background:#e5e7eb;overflow:hidden"><div style="height:100%;width:' + x.pct + '%;background:' + (x.pct >= 70 ? '#22c55e' : x.pct >= 40 ? '#f59e0b' : '#ef4444') + '"></div></div></div>';
      });
    } else {
      h += '<div class="empty">' + esc(L('Abhi koi sawal nahi kiya — quiz se shuru karo', 'अभी कोई सवाल नहीं किया — क्विज़ से शुरू करो')) + '</div>';
    }

    // deep insights (question-level + chapter-level)
    var ins = window.STUDY.insights();
    if (ins.total >= 5) {
      h += '<div class="board-group">' + esc(L('Deep analytics', 'गहरा विश्लेषण')) + '</div>';
      h += '<div class="imp-item"><div class="iq">' + esc(L('Aapki overall accuracy', 'आपकी समग्र शुद्धता')) +
        ' <b class="t-num">' + ins.acc + '%</b> (' + ins.right + '/' + ins.total + ')</div></div>';
      if (ins.weak.length) {
        ins.weak.forEach(function (w) {
          h += '<div class="imp-item" style="border-color:#fecaca"><div class="iq">' +
            esc(L('Aapka', 'आपका')) + ' <b>' + esc(w.c) + '</b> ' + esc(L('mein score', 'में स्कोर')) +
            ' <b class="t-num" style="color:#dc2626">' + w.pct + '%</b> ' + esc(L('hai (', 'है (')) + w.n +
            ' ' + esc(L('sawal) — zyada practice chahiye.', 'सवाल) — ज़्यादा अभ्यास चाहिए।')) + '</div></div>';
        });
      }
      if (ins.worstQ.length) {
        h += '<div class="board-group" style="margin-top:10px">' + esc(L('Sabse zyada galat kiye (phir se dekho)', 'सबसे ज़्यादा गलत किए (फिर से देखो)')) + '</div>';
        ins.worstQ.forEach(function (w) {
          h += '<div class="imp-item"><div class="iq">' + esc((w.q || '').slice(0, 90)) + '</div>' +
            '<div class="t-small">' + esc(w.c || '') + ' · ' + w.ok + '/' + w.n + ' · ' + w.pct + '%</div></div>';
        });
      }
    }

    // weak chapters
    var weak = s.chap.filter(function (x) { return x.n >= 3 && x.pct < 50; }).slice(0, 8);
    if (weak.length) {
      h += '<div class="board-group">' + esc(L('Weak chapters (phir se practice karo)', 'कमज़ोर अध्याय (फिर से अभ्यास करो)')) + '</div>';
      weak.forEach(function (x) {
        h += '<a class="list-row" href="#/subject/' + esc(x.s) + '"><div><div class="t">' + esc(x.c) + '</div>' +
          '<div class="s">' + x.ok + '/' + x.n + ' · ' + x.pct + '%</div></div><span class="n">→</span></a>';
      });
    }

    // exams
    if (s.exams) {
      h += '<div class="board-group">' + esc(L('Mock exams', 'मॉक एग्ज़ाम')) + '</div>';
      D.exams.slice(-6).reverse().forEach(function (e) {
        h += '<div class="result-row"><span>' + esc(e.subj) + ' · ' + new Date(e.t).toLocaleDateString() + '</span><b>' + e.right + '/' + e.total + '</b></div>';
      });
    }
    h += '<div class="chips" style="margin-top:14px"><a class="fchip" href="#/revision">⟲ ' + esc(L('Revision (wrong + saved)', 'रिवीज़न (गलत + सहेजे)')) + '</a>' +
      '<a class="fchip" href="#/exam">⏱ ' + esc(L('Mock exam', 'मॉक एग्ज़ाम')) + '</a></div>';
    return h + '</section>';
  };

  /* ---------------- revision ---------------- */

  window.vRevision = function () {
    var d = D;
    var tab = window.__revTab || 'wrong';
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Smart revision', 'स्मार्ट रिवीज़न')) + '</h2>' +
      '<span class="note">' + esc(L('Galti kiye sawal yahan save hote hain', 'गलत किए सवाल यहाँ सहेजे जाते हैं')) + '</span></div>';
    h += '<div class="chips"><button class="fchip' + (tab === 'wrong' ? ' on' : '') + '" data-rev="wrong">' + esc(L('Wrong', 'गलत')) + ' (' + d.wrong.length + ')</button>' +
      '<button class="fchip' + (tab === 'book' ? ' on' : '') + '" data-rev="book">' + esc(L('Bookmarked', 'बुकमार्क')) + ' (' + d.book.length + ')</button></div>';
    h += '<div id="revList">';
    if (tab === 'book') {
      if (!d.book.length) {
        h += '<div class="empty">' + esc(L('Abhi kuch bookmark nahi — subject page par bookmark lagao', 'अभी कुछ बुकमार्क नहीं — सब्जेक्ट पेज पर बुकमार्क लगाओ')) + '</div>';
      } else {
        d.book.slice().reverse().slice(0, 60).forEach(function (w, i) {
          h += '<div class="imp-item" style="margin-bottom:10px"><div class="num" style="background:#ede9fe;color:#4c1d95">' + (i + 1) + '</div><div>' +
            '<div class="iq">' + esc(w.q && w.q.q) + '</div><div class="note">' + esc(w.s) + (w.c ? ' · ' + esc(w.c) : '') + '</div>';
          if (w.q && w.q.opts) {
            var ai = String(w.q.ans || '').toUpperCase().charCodeAt(0) - 65;
            h += '<div class="imp-opts">' + w.q.opts.map(function (o, k) { return '<span class="' + (k === ai ? 'ok' : '') + '">' + 'ABCD'[k] + '. ' + esc(o) + '</span>'; }).join('') + '</div>';
          }
          h += '</div></div>';
        });
      }
      return h + '</div></section>';
    }
    var list = d.wrong;
    // spaced repetition — aaj due
    var due = revSchedule();
    if (due.length) {
      h += '<div class="board-group">' + esc(L('Aaj revision due', 'आज रिवीज़न बाकी')) + ' · ' + due.length + '</div>';
      due.slice(0, 8).forEach(function (x) {
        h += '<div class="imp-item" style="margin-bottom:10px"><div class="num" style="background:#ede9fe;color:#4c1d95">' + (x.stage + 1) + '</div><div>' +
          '<div class="iq">' + esc(x.q && x.q.q) + '</div>' +
          '<div class="note">' + esc(x.s) + (x.c ? ' · ' + esc(x.c) : '') + ' · ' + esc(L('agla: ' + REV_INTERVALS[x.stage] + ' din baad', 'अगला: ' + REV_INTERVALS[x.stage] + ' दिन बाद')) + '</div>';
        if (x.q && x.q.opts) {
          var ai = String(x.q.ans || '').toUpperCase().charCodeAt(0) - 65;
          h += '<div class="imp-opts">' + x.q.opts.map(function (o, k) { return '<span class="' + (k === ai ? 'ok' : '') + '">' + 'ABCD'[k] + '. ' + esc(o) + '</span>'; }).join('') + '</div>';
        }
        h += '<div class="chips" style="margin-top:6px">' +
          '<button class="fchip" data-revans="' + encodeURIComponent(x.id) + '|1">' + esc(L('Aaja', 'आ गया')) + '</button>' +
          '<button class="fchip" data-revans="' + encodeURIComponent(x.id) + '|0">' + esc(L('Nahi aaya', 'नहीं आया')) + '</button></div></div></div>';
      });
    }
    if (!list.length) {
      h += '<div class="empty">' + esc(L('Abhi koi galti nahi — quiz khelkar dekho', 'अभी कोई गलती नहीं — क्विज़ खेलकर देखो')) + '</div>';
    } else {
      list.slice().reverse().slice(0, 60).forEach(function (w, i) {
        h += '<div class="imp-item" style="margin-bottom:10px"><div class="num" style="background:#fee2e2;color:#991b1b">' + (i + 1) + '</div><div>' +
          '<div class="iq">' + esc((w.q && w.q.q) || '') + '</div>' +
          '<div class="note">' + esc(w.s) + (w.c ? ' · ' + esc(w.c) : '') + '</div>';
        if (w.q && w.q.opts) {
          var ai = String(w.q.ans || '').toUpperCase().charCodeAt(0) - 65;
          h += '<div class="imp-opts">' + w.q.opts.map(function (o, k) {
            return '<span class="' + (k === ai ? 'ok' : '') + '">' + 'ABCD'[k] + '. ' + esc(o) + '</span>';
          }).join('') + '</div>';
        }
        h += '</div></div>';
      });
    }
    h += '</div>';
    h += '<div class="note" style="margin-top:10px">' + esc(L('Tip: quiz me galti = yahan apne aap save', 'टिप: क्विज़ में गलती = यहाँ अपने-आप सहेजा')) + '</div>';
    return h + '</section>';
  };

  /* ---------------- mock exam simulator ---------------- */

  var EXAM = null;
  window.EXAM = function () { return EXAM; };

  function boardPattern() {
    try { return (window.IMPORTANT && window.IMPORTANT.pattern) || []; } catch (e) { return []; }
  }

  window.vExam = function () {
    var e = window.EXAM ? window.EXAM() : null;
    if (e) {
      if (e.stage === 'instr') return examInstr();
      return examRun();
    }
    var pat = boardPattern();
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Board exam simulator', 'बोर्ड एग्ज़ाम सिमुलेटर')) + '</h2>' +
      '<span class="note">' + esc(L('Verified board pattern', 'सत्यापित बोर्ड पैटर्न')) + '</span></div>';
    h += '<div class="board-group">' + esc(L('Subject', 'विषय')) + '</div>';
    var subs = (window.SUBJECTS || []).filter(function (s) { return ['maths', 'science', 'sst', 'hindi', 'english', 'sanskrit'].indexOf(s.key) >= 0; });
    h += '<div class="chips">' + subs.map(function (s, i) {
      return '<button class="fchip' + (i === 0 ? ' on' : '') + '" data-exsub="' + esc(s.key) + '">' + esc(lang() === 'en' ? s.en : s.name) + '</button>';
    }).join('') + '</div>';
    h += '<div class="board-group">' + esc(L('Kitne sawal', 'कितने सवाल')) + '</div>';
    h += '<div class="chips">' + [10, 20, 40, 80].map(function (n, i) {
      return '<button class="fchip' + (i === 1 ? ' on' : '') + '" data-exn="' + n + '">' + n + '</button>';
    }).join('') + '</div>';
    h += '<div class="board-group">' + esc(L('Samay (minute)', 'समय (मिनट)')) + '</div>';
    h += '<div class="chips">' + [15, 30, 60, 90].map(function (n, i) {
      return '<button class="fchip' + (i === 2 ? ' on' : '') + '" data-exmin="' + n + '">' + n + '</button>';
    }).join('') + '</div>';
    if (pat.length) {
      h += '<div class="note" style="margin-top:10px">' + esc(L('Pattern: MCQ + VSA + SA + LA (board verified)', 'पैटर्न: MCQ + VSA + SA + LA (बोर्ड सत्यापित)')) + '</div>';
    } else {
      h += '<div class="note" style="margin-top:10px">' + esc(L('Is board ka pattern verified nahi hai — general pattern use hoga', 'इस बोर्ड का पैटर्न सत्यापित नहीं — सामान्य पैटर्न उपयोग होगा')) + '</div>';
    }
    h += '<button class="btn btn-accent btn-block" id="exStart" style="margin-top:14px">' + esc(L('Exam shuru karo', 'एग्ज़ाम शुरू करो')) + '</button>';
    return h + '</section>';
  };

  function examInstr() {
    var e = window.EXAM();
    var pat = boardPattern();
    var tot = 0; e.items.forEach(function (q) { tot += q.marks; });
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Exam instructions', 'परीक्षा निर्देश')) + '</h2>' +
      '<span class="note">' + esc(e.subjName) + '</span></div>';
    h += '<div class="card"><div class="prog-top"><span>' + esc(L('Kul sawal', 'कुल सवाल')) + '</span><b class="t-num">' + e.items.length + '</b></div>' +
      '<div class="prog-top"><span>' + esc(L('Kul marks', 'कुल अंक')) + '</span><b class="t-num">' + tot + '</b></div>' +
      '<div class="prog-top"><span>' + esc(L('Samay', 'समय')) + '</span><b class="t-num">' + Math.round((e.end - Date.now()) / 60000) + ' ' + esc(L('min', 'मिनट')) + '</b></div></div>';
    h += '<div class="board-group">' + esc(L('Niyam', 'नियम')) + '</div>';
    h += '<div class="imp-item"><div class="iq">' + esc(L('1. पूरे पैटर्न/अंक किताब/बोर्ड के दिए अनुसार — (verify) tag ke bina koi board-specific claim nahi.', '1. पूरा पैटर्न/अंक किताब/बोर्ड के दिए अनुसार — (verify) टैग के बिना कोई बोर्ड-विशिष्ट दावा नहीं।')) + '</div></div>';
    h += '<div class="imp-item"><div class="iq">' + esc(L('2. हर सवाल के नीचे palette से जा/आ — jo chuno uska mark save ho jayega.', '2. हर सवाल के नीचे पैलेट से जा/आ — जो चुनो उसका मार्क सहेजा जाएगा।')) + '</div></div>';
    h += '<div class="imp-item"><div class="iq">' + esc(L('3. "Mark for review" se sawal palette me alag nishan se dikhega.', '3. "मार्क फ़ॉर रिव्यू" से सवाल पैलेट में अलग निशान से दिखेगा।')) + '</div></div>';
    h += '<div class="imp-item"><div class="iq">' + esc(L('4. समय खत्म होते ही exam apne-aap submit ho jayega.', '4. समय खत्म होते ही एग्ज़ाम अपने-आप सबमिट हो जाएगा।')) + '</div></div>';
    if (pat.length) {
      h += '<div class="board-group">' + esc(L('Pattern (verified)', 'पैटर्न (सत्यापित)')) + '</div>';
      h += pat.map(function (p) {
        return '<div class="result-row"><span>' + esc(p.subj) + '</span><b>' + p.total + ' · ' + esc(p.time) + '</b></div>';
      }).join('');
    } else {
      h += '<div class="note">' + esc(L('Is board ka verified pattern nahi mila — general pattern use hoga (verify).', 'इस बोर्ड का सत्यापित पैटर्न नहीं मिला — सामान्य पैटर्न उपयोग होगा (verify)।')) + '</div>';
    }
    h += '<button class="btn btn-accent btn-block" id="exBegin">' + esc(L('Exam shuru karo', 'एग्ज़ाम शुरू करो')) + '</button>';
    h += '<div class="note">' + esc(L('Ye ek practice simulator hai — asli board paper ke barabar nahi.', 'यह एक अभ्यास सिमुलेटर है — असली बोर्ड पेपर के बराबर नहीं।')) + '</div>';
    return h + '</section>';
  }

  function examRun() {
    var e = EXAM;
    if (e.done) return examResult();
    var q = e.items[e.i];
    var tot = e.items.length;
    var left = Math.max(0, e.end - Date.now());
    var mm = Math.floor(left / 60000), ss = Math.floor((left % 60000) / 1000);
    var h = '<section class="section"><div class="section-head"><h2>⏱ ' + esc(e.subjName) + '</h2>' +
      '<span class="note" id="exTimeWrap">' + e.i + 1 + '/' + tot + ' · ' + esc(L('Time left', 'बचा समय')) + ': <b id="exTime">' + mm + ':' + String(ss).padStart(2, '0') + '</b></span></div>';
    // palette
    h += '<div class="chips" style="flex-wrap:wrap">';
    e.items.forEach(function (it, k) {
      var cls = k === e.i ? 'fchip on' : (e.ans[k] !== undefined ? 'fchip' : 'fchip dim');
      if (e.review[k]) cls += ' rev';
      h += '<button class="' + cls + '" data-pal="' + k + '" style="min-width:38px;padding:6px 0">' + (k + 1) + '</button>';
    });
    h += '</div>';
    h += '<div class="chips" style="margin-top:8px">' +
      '<button class="fchip' + (e.review[e.i] ? ' on' : '') + '" id="exReview">' + esc(L('Mark for review', 'मार्क फ़ॉर रिव्यू')) + '</button></div>';
    h += '<div class="board-group">' + esc(L('Q', 'प्र')) + ' ' + (e.i + 1) + ' · ' + esc(L('Marks', 'अंक')) + ': ' + q.marks + '</div>';
    h += '<div class="imp-item" style="background:var(--card)"><div class="iq" style="font-size:16px;line-height:1.7">' + esc(q.q) + '</div>';
    if (q.opts) {
      h += '<div class="imp-opts" style="margin-top:10px">' + q.opts.map(function (o, k) {
        var sel = e.ans[e.i] === k;
        return '<div class="' + (sel ? 'ok' : '') + '" data-exopt="' + k + '" style="padding:9px 11px;border:1px solid var(--line);border-radius:9px;margin-bottom:7px;cursor:pointer;background:' + (sel ? '#ede9fe' : 'transparent') + '">' + 'ABCD'[k] + '. ' + esc(o) + '</div>';
      }).join('') + '</div>';
    }
    if (q.type === 'write') {
      h += '<div class="note" style="margin-top:8px">' + esc(L('Written question — khud likh kar check karo', 'लिखित सवाल — खुद लिखकर जाँचो')) + '</div>';
      h += '<div class="chips" style="margin-top:6px">' +
        '<button class="fchip" data-exself="1">' + esc(L('Maine sahi kiya', 'मैंने सही किया')) + '</button>' +
        '<button class="fchip" data-exself="0">' + esc(L('Nahi kar paya', 'नहीं कर पाया')) + '</button></div>';
    }
    h += '<div class="chips" style="margin-top:12px">' +
      '<button class="fchip" id="exPrev">' + esc(L('← Pichla', '← पिछला')) + '</button>' +
      '<button class="fchip" id="exNext">' + esc(L('Agla →', 'अगला →')) + '</button>' +
      '<button class="fchip" id="exSubmit" style="background:#fee2e2;color:#991b1b">' + esc(L('Submit exam', 'एग्ज़ाम सबमिट')) + '</button></div>';
    h += '<div class="note" style="margin-top:10px">' + esc(L('Auto-submit: samay khatam', 'ऑटो-सबमिट: समय खत्म')) + '</div>';
    return h + '</section>';
  }

  function examResult() {
    var e = EXAM;
    var right = 0, got = 0, tot = 0;
    e.items.forEach(function (q) { tot += q.marks; if (e.ans[e.items.indexOf(q)] !== undefined) { got += q.marks; if (e.ans[e.items.indexOf(q)]) right += q.marks; } });
    var pct = tot ? Math.round((right / tot) * 100) : 0;
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Result', 'परिणाम')) + '</h2></div>';
    h += '<div class="stats-grid"><div class="stat"><b>' + right + '/' + tot + '</b><span>' + esc(L('marks', 'अंक')) + '</span></div>' +
      '<div class="stat"><b>' + pct + '%</b><span>' + esc(L('score', 'स्कोर')) + '</span></div>' +
      '<div class="stat"><b>' + Object.keys(e.ans).length + '/' + e.items.length + '</b><span>' + esc(L('attempted', 'उत्तर दिए')) + '</span></div></div>';
    h += '<div class="board-group">' + esc(L('Review', 'दोबारा देखें')) + '</div>';
    e.items.forEach(function (q, k) {
      var given = e.ans[k];
      var correctIdx = q.ans !== undefined && q.opts ? String(q.ans).toUpperCase().charCodeAt(0) - 65 : null;
      h += '<div class="imp-item" style="margin-bottom:10px"><div class="num" style="background:' + (given ? '#dcfce7;color:#166534' : '#fee2e2;color:#991b1b') + '">' + (k + 1) + '</div><div>' +
        '<div class="iq">' + esc(q.q) + '</div>';
      if (q.opts) {
        h += '<div class="imp-opts">' + q.opts.map(function (o, j) {
          var cls = (j === correctIdx) ? 'ok' : ((given === j) ? 'wrong' : '');
          return '<span class="' + cls + '">' + 'ABCD'[j] + '. ' + esc(o) + '</span>';
        }).join('') + '</div>';
      }
      h += '</div></div>';
    });
    h += '<div class="chips" style="margin-top:12px"><button class="btn btn-accent" id="exAgain">' + esc(L('Phir se exam', 'फिर से एग्ज़ाम')) + '</button>' +
      '<a class="fchip" href="#/progress">' + esc(L('Progress', 'प्रगति')) + '</a></div>';
    return h + '</section>';
  }

  window.examStart = function (subjKey, n, minutes) {
    var pool = (window.QS_FOR ? window.QS_FOR(subjKey) : []) || [];
    var items = pool.filter(function (q) { return q.opts && q.ans; }).slice(0, n).map(function (q) {
      var marks = 1;
      if (q.type === 'write') marks = 3;
      return { q: q.q, opts: q.opts, ans: q.ans, type: q.type, marks: marks, chap: q.chap || q.part || '' };
    });
    if (!items.length) return false;
    var s = window.SUBJECT_MAP && window.SUBJECT_MAP[subjKey];
    EXAM = { subj: subjKey, subjName: s ? (lang() === 'en' ? s.en : s.name) : subjKey, items: items, i: 0, ans: {}, review: {}, stage: 'instr', end: Date.now() + minutes * 60000, done: false, start: Date.now() };
    window.STUDY.addExam({ subj: s ? s.name : subjKey, total: items.length, right: 0, t: Date.now(), dur: minutes });
    return true;
  };
  window.examAnswer = function (i, val) { if (EXAM) { EXAM.ans[i] = val; } };
  window.examSubmit = function () {
    if (!EXAM) return;
    EXAM.done = true;
    var right = 0, tot = 0;
    EXAM.items.forEach(function (q, k) {
      tot += q.marks;
      if (EXAM.ans[k] !== undefined && EXAM.ans[k]) right += q.marks;
    });
    var last = D.exams[D.exams.length - 1];
    if (last) { last.right = right; last.total = tot; save(D); }
    window.STUDY.markSec(1);
  };
  window.examGo = function (i) { if (EXAM) { EXAM.i = Math.max(0, Math.min(EXAM.items.length - 1, i)); } };
  window.examReset = function () { EXAM = null; };
  window.examBegin = function () { if (EXAM) { EXAM.stage = 'run'; } };
  window.examMarkReview = function () { if (EXAM) { EXAM.review[EXAM.i] = !EXAM.review[EXAM.i]; } };

  /* ---------------- study assistant (offline, rule-based) ---------------- */

  window.vAssistant = function () {
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Study assistant', 'अध्ययन सहायक')) + '</h2>' +
      '<span class="note">' + esc(L('Offline — chapter ke based par guidance (AI nahi, rules)', 'ऑफ़लाइन — अध्याय के आधार पर मार्गदर्शन (AI नहीं, नियम)')) + '</span></div>';
    h += '<div class="board-group">' + esc(L('Chapter chuno', 'अध्याय चुनो')) + '</div>';
    var chaps = [];
    try { chaps = window.CHAPTERS_LIST ? window.CHAPTERS_LIST() : []; } catch (e) {}
    if (!chaps.length) {
      var subs = (window.SUBJECTS || []).slice(0, 6);
      h += '<div class="chips">' + subs.map(function (s) {
        return '<button class="fchip" data-assub="' + esc(s.key) + '">' + esc(lang() === 'en' ? s.en : s.name) + '</button>';
      }).join('') + '</div>';
    }
    h += '<div id="assOut" style="margin-top:12px"><div class="empty">' + esc(L('Neeche apna sawal likho — main chapter ke notes/मुख्य बातें dunga', 'नीचे अपना सवाल लिखो — मैं अध्याय के नोट्स/मुख्य बातें दूँगा')) + '</div></div>';
    h += '<input id="assBox" type="search" placeholder="' + esc(L('Apna sawal likho…', 'अपना सवाल लिखो…')) + '" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--line);font-size:15px;margin-top:12px">';
    h += '<div id="assRes" style="margin-top:12px"></div>';
    h += '<div class="note" style="margin-top:10px">' + esc(L('Ye ek simple rule-based assistant hai — model nahi. Sawal Notes ya Quiz se match karta hai.', 'यह एक साधारण नियम-आधारित सहायक है — मॉडल नहीं। सवाल नोट्स या क्विज़ से मेल खाता है।')) + '</div>';
    return h + '</section>';
  };

  /* ---------------- retrieval (browser ke andar, RAG-जैसा) ---------------- */
  var STOP = { 'के': 1, 'का': 1, 'की': 1, 'को': 1, 'में': 1, 'है': 1, 'हैं': 1, 'और': 1, 'से': 1, 'एक': 1, 'यह': 1, 'वह': 1,
    'क्या': 1, 'कैसे': 1, 'कि': 1, 'पर': 1, 'भी': 1, 'तो': 1, 'था': 1, 'थी': 1, 'ने': 1, 'कर': 1, 'किया': 1, 'हो': 1,
    'जो': 1, 'इस': 1, 'उस': 1, 'तक': 1, 'लिए': 1, 'साथ': 1, 'बारे': 1, 'अपने': 1, 'गया': 1, 'दिया': 1, 'कुछ': 1,
    'the': 1, 'a': 1, 'an': 1, 'of': 1, 'to': 1, 'is': 1, 'are': 1, 'and': 1, 'in': 1, 'on': 1, 'for': 1, 'what': 1,
    'how': 1, 'why': 1, 'which': 1, 'who': 1, 'was': 1, 'were': 1, 'has': 1, 'have': 1, 'that': 1, 'this': 1, 'it': 1,
    'as': 1, 'at': 1, 'by': 1, 'from': 1, 'with': 1, 'or': 1, 'be': 1, 'been': 1, 'मैं': 1, 'हम': 1 };

  function toks(s) {
    return String(s || '').toLowerCase()
      .replace(/[^ऀ-ॿa-z0-9\s]/g, ' ')
      .split(/\s+/).filter(function (w) { return w.length > 1 && !STOP[w]; });
  }

  function btext(b) {
    if (!b) return '';
    var t = '';
    for (var i = 1; i < b.length; i++) {
      var v = b[i];
      if (typeof v === 'string') t += ' ' + v;
      else if (Array.isArray(v)) t += ' ' + v.join(' ');
    }
    return t;
  }

  var __idx = null, __idxKey = '';
  // Poora index browser me hi banta hai (TF-IDF) — koi server nahi
  function indexDocs() {
    var key = (window.BOARD_DATA ? window.BOARD_DATA.questions.length : 0) + '/' + Object.keys(window.NOTES || {}).length;
    if (__idx && __idxKey === key) return __idx;
    var docs = [], df = {};
    function add(d) {
      var ts = toks(d.text), set = {};
      ts.forEach(function (t) { set[t] = 1; });
      Object.keys(set).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
      docs.push({ d: d, toks: ts });
    }
    Object.keys(window.NOTES || {}).forEach(function (k) {
      (window.NOTES[k] || []).forEach(function (it) {
        var txt = it.ch + ' ' + (it.blocks || []).map(btext).join(' ');
        add({ type: 'note', k: k, ch: it.ch, blocks: it.blocks, text: txt });
      });
    });
    (window.BOARD_DATA.questions || []).forEach(function (q) {
      add({ type: 'q', q: q, text: (q.q || '') + ' ' + (q.opts || []).join(' ') + ' ' + (q.exp || '') });
    });
    var N = docs.length || 1;
    var idf = {};
    Object.keys(df).forEach(function (t) { idf[t] = Math.log(1 + N / df[t]); });
    __idx = { docs: docs, idf: idf };
    __idxKey = key;
    return __idx;
  }

  // Query par sabse relevant notes + sawal (ranked)
  function retrieve(query, limit) {
    var qt = toks(query);
    if (!qt.length) return { notes: [], qs: [] };
    var ix = indexDocs(), N = ix.docs.length || 1;
    var scores = [];
    for (var i = 0; i < ix.docs.length; i++) {
      var doc = ix.docs[i], s = 0, hit = 0;
      var bag = {}, j;
      for (j = 0; j < doc.toks.length; j++) bag[doc.toks[j]] = (bag[doc.toks[j]] || 0) + 1;
      for (j = 0; j < qt.length; j++) {
        var t = qt[j];
        if (bag[t]) { s += (bag[t] / doc.toks.length) * (ix.idf[t] || 0); hit++; }
      }
      if (hit) scores.push({ d: doc.d, s: s * (hit / qt.length) });
    }
    scores.sort(function (a, b) { return b.s - a.s; });
    var notes = [], qs = [];
    for (var k = 0; k < scores.length; k++) {
      var d = scores[k].d;
      if (d.type === 'note' && notes.length < (limit || 4)) notes.push(d);
      else if (d.type === 'q' && qs.length < 5) qs.push(d.q);
    }
    return { notes: notes, qs: qs, total: scores.length };
  }
  window.STUDY.retrieve = retrieve;

  window.assistAsk = function (text) {
    var out = document.getElementById('assRes');
    if (!out) return;
    var w = (text || '').trim();
    if (!w) { out.innerHTML = ''; return; }
    // notes lazy load hote hain — pehle lao, phir retrieve
    if (window.BP && window.BP.loadLazy && !window.NOTES) {
      out.innerHTML = '<div class="empty">' + esc(L('Notes load ho rahe hain…', 'नोट्स लोड हो रहे हैं…')) + '</div>';
      window.BP.loadLazy('notes').then(function () { window.assistAsk(text); }).catch(function () { });
      return;
    }
    var r;
    try { r = retrieve(w); } catch (e) { r = { notes: [], qs: [] }; }
    var h = '';
    if (r.notes.length) {
      h += '<div class="board-group">' + esc(L('Sabse mel khaane wale notes', 'सबसे मेल खाने वाले नोट्स')) + ' (' + r.total + ')</div>';
      r.notes.forEach(function (n) {
        var best = '';
        (n.blocks || []).forEach(function (b) {
          var t = btext(b);
          if (t.length > best.length && b[0] === 'p') best = t;
        });
        if (!best) best = btext((n.blocks || [])[1] || []);
        h += '<a class="list-row" href="#/note/' + esc(n.k) + '/' + encodeURIComponent(n.ch) + '"><div><div class="t">' + esc(n.ch) + '</div>' +
          '<div class="s">' + esc(best.slice(0, 120)) + '</div></div><span class="n">→</span></a>';
      });
    }
    if (r.qs.length) {
      h += '<div class="board-group">' + esc(L('Similar questions (practice)', 'मिलते-जुलते सवाल (अभ्यास)')) + '</div>';
      r.qs.forEach(function (q) {
        h += '<div class="imp-item" style="margin-bottom:8px"><div class="num">' + esc(q.subj) + '</div><div><div class="iq">' + esc(q.q) + '</div>';
        if (q.opts) {
          var ai = String(q.ans || '').toUpperCase().charCodeAt(0) - 65;
          h += '<div class="imp-opts">' + q.opts.map(function (o, k) { return '<span class="' + (k === ai ? 'ok' : '') + '">' + 'ABCD'[k] + '. ' + esc(o) + '</span>'; }).join('') + '</div>';
        }
        h += '</div></div>';
      });
    }
    if (!h) h = '<div class="empty">' + esc(L('Kuch mil naya — Notes ya Search me dekho', 'कुछ नहीं मिला — नोट्स या सर्च में देखो')) + '</div>';
    out.innerHTML = h;
  };

  /* ---------------- personal notes (autosave, offline) ---------------- */

  var NKEY = 'bp_notes_v1';
  function notesLoad() { try { var v = JSON.parse(localStorage.getItem(NKEY)); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function notesSave(n) { try { localStorage.setItem(NKEY, JSON.stringify(n)); return true; } catch (e) { return false; } }

  function noteAdd(subj, chap, text) {
    var n = notesLoad();
    n.push({ id: 'n' + Date.now() + Math.floor(Math.random() * 999), s: subj || '', c: chap || '', t: String(text || ''), ts: Date.now() });
    return notesSave(n);
  }
  function noteUpdate(id, text) {
    var n = notesLoad(); var hit = false;
    n.forEach(function (x) { if (x.id === id) { x.t = String(text || ''); x.ts = Date.now(); hit = true; } });
    if (hit) notesSave(n); return hit;
  }
  function noteDel(id) { var n = notesLoad().filter(function (x) { return x.id !== id; }); return notesSave(n); }
  function noteExport() { return JSON.stringify(notesLoad(), null, 1); }

  window.STUDY.notes = function () { return notesLoad(); };
  window.STUDY.noteAdd = noteAdd;
  window.STUDY.noteUpdate = noteUpdate;
  window.STUDY.noteDel = noteDel;
  window.STUDY.noteExport = noteExport;

  /* ---------------- spaced repetition (revision schedule) ---------------- */

  var REVKEY = 'bp_rev_v1';
  var REV_INTERVALS = [1, 3, 7, 14, 30]; // din — saaf schedule, koi mystery nahi
  function revLoad() { try { return JSON.parse(localStorage.getItem(REVKEY)) || {}; } catch (e) { return {}; } }
  function revSave(r) { try { localStorage.setItem(REVKEY, JSON.stringify(r)); return true; } catch (e) { return false; } }

  function revSchedule() {
    var r = revLoad();
    var due = [];
    (D.wrong || []).slice(-100).forEach(function (w) {
      var id = qid(w.q);
      var st = r[id];
      var dueTs = st ? st.due : 0;
      if (!st || dueTs <= Date.now()) {
        due.push({ id: id, q: w.q, s: w.s, c: w.c, stage: st ? st.stage : 0, due: dueTs });
      }
    });
    return due;
  }
  function revAnswer(id, ok) {
    var r = revLoad();
    var st = r[id] || { stage: 0, due: 0 };
    st.stage = ok ? Math.min(st.stage + 1, REV_INTERVALS.length - 1) : 0;
    st.due = Date.now() + REV_INTERVALS[st.stage] * 86400000;
    r[id] = st;
    revSave(r);
    return st;
  }

  window.STUDY.revSchedule = revSchedule;
  window.STUDY.revAnswer = revAnswer;
  window.STUDY.revDueCount = function () { return revSchedule().length; };
  window.STUDY.revIntervals = REV_INTERVALS;

})();
