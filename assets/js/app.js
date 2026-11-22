/* BoardPrep core — state, router, home, subjects, quiz, search, papers, important */
(function () {
  var D = window.BOARD_DATA;
  var I18N = window.I18N;
  var BOARDS = window.BOARDS;
  var MAP = window.BOARD_MAP;
  var SUBJECTS = window.SUBJECTS || [];
  var SMAP = window.SUBJECT_MAP || {};
  var IMP = window.IMPORTANT || null;
  var view = document.getElementById('view');
  var ORIG = { questions: window.BOARD_DATA.questions, subjects: window.BOARD_DATA.subjects, papers: window.BOARD_DATA.papers };
  var BANK = window.BOARD_BANK || {};
  var HI_EN = window.HI_EN || {};
  var CONTENT_KEYS = ['FORMULAS', 'PERIODIC', 'LAB', 'DIAGRAMS', 'TIMELINE', 'IMPORTANT', 'BRAIN', 'MODELS3D'];
  var ORIG_CONTENT = {};
  CONTENT_KEYS.forEach(function (k) { if (window[k]) ORIG_CONTENT[k] = window[k]; });

  // Is APK ki version — version.json se compare hoti hai (in-app update banner)
  var APP_VERSION = '5.11';
  var VER_URL = 'https://dilshanking7.github.io/boardprep/version.json';

  function cmpVer(a, b) {
    var x = String(a || '0').split('.').map(Number), y = String(b || '0').split('.').map(Number);
    for (var i = 0; i < 3; i++) { var p = x[i] || 0, q = y[i] || 0; if (p > q) return 1; if (p < q) return -1; }
    return 0;
  }

  // Naya update check — banner dikhata hai, tap karke APK khud download + install
  // ---- code-splitting: notes + calc sirf tab load hon jab chahiye ----
  var LAZY = {
    notes: ['assets/data/notes_science.js', 'assets/data/notes_maths.js', 'assets/data/notes_science2.js',
      'assets/data/notes_maths2.js', 'assets/data/notes_jharkhand.js', 'assets/data/notes_sst_history.js',
      'assets/data/notes_sst_geo.js', 'assets/data/notes_sst_civics.js', 'assets/data/notes_sst_econ.js',
      'assets/data/notes_hindi.js', 'assets/data/notes_english.js', 'assets/data/notes_sanskrit.js',
      'assets/data/notes.js'],
    calc: ['assets/js/calc.js']
  };
  var LOADED = {};
  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (LOADED[src]) return res();
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { LOADED[src] = 1; res(); };
      s.onerror = function () { rej(new Error('load: ' + src)); };
      document.head.appendChild(s);
    });
  }
  function loadLazy(kind) { return Promise.all((LAZY[kind] || []).map(loadScript)); }

  function lazyNeed() {
    var p = (location.hash.replace(/^#/, '').split('/').filter(Boolean)[0] || '');
    if (p === 'notes' || p === 'note') return 'notes';
    if (p === 'calc') return 'calc';
    return null;
  }

  function checkUpdate() {
    try {
      fetch(VER_URL + '?t=' + Date.now(), { cache: 'no-store' }).then(function (r) {
        return r.ok ? r.json() : null;
      }).then(function (j) {
        if (!j || !j.version || cmpVer(j.version, APP_VERSION) <= 0) return;
        var bar = document.getElementById('updBar');
        if (!bar) return;
        bar.hidden = false;
        bar.setAttribute('data-url', j.apk || '');
        var t = bar.querySelector('.upd-t');
        if (t) t.textContent = L('Naya update aaya: v', 'नया अपडेट आया: v') + j.version +
          (j.note ? ' · ' + j.note : '');
        // API base bhi yahin se aa sakti hai (Dilshan ek jagah set karta hai)
        if (j.api && window.Cloud && window.Cloud.refreshBase) window.Cloud.refreshBase(j.api);
      }).catch(function () { });
    } catch (e) { }
  }

  function L(en, hi) { return state.lang === 'en' ? en : (hi == null ? en : hi); }

  function trStr(s) {
    if (state.lang !== 'en' || typeof s !== 'string') return s;
    return HI_EN[s] || s;
  }
  function translateDeep(o) {
    if (typeof o === 'string') return trStr(o);
    if (Array.isArray(o)) return o.map(translateDeep);
    if (o && typeof o === 'object') {
      var r = {};
      Object.keys(o).forEach(function (k) { r[k] = translateDeep(o[k]); });
      return r;
    }
    return o;
  }
  function applyContentLang() {
    CONTENT_KEYS.forEach(function (k) {
      if (!ORIG_CONTENT[k]) return;
      window[k] = state.lang === 'en' ? translateDeep(ORIG_CONTENT[k]) : ORIG_CONTENT[k];
    });
    IMP = window.IMPORTANT || null;
  }

  // Safe storage helpers — storage unavailable hone par app crash NA ho
  function storeGet(k, d) {
    try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; }
  }
  function storeSet(k, v) {
    try { localStorage.setItem(k, v); return true; } catch (e) { return false; }
  }
  var state = {
    board: storeGet('bp_board', 'jac'),
    lang: storeGet('bp_lang', 'hi'),
    quiz: null,
    subjKey: null,
    bankSubj: 'all', bankType: 'all', bankAns: 'all', bankChap: 'all', bankWord: '', bankPage: 0,
    qzKind: 'quick',
    subjType: 'all',
    subjChap: 'all',
    shown: 40,
    paperFilter: 'all',
    impSubj: 'maths'
  };

  var FREQ = {};
  function rebuildFreq() {
    FREQ = {};
    if (bank()) {
      var seen = {};
      D.questions.forEach(function (q) {
        var nm = q.chap || q.part || '';
        var k = norm(nm);
        if (!k) return;
        if (!seen[k]) seen[k] = { topic: nm, times: 0, years: '', subj: q.subj };
        seen[k].times++;
      });
      Object.keys(seen).forEach(function (k) { FREQ[k] = seen[k]; });
    } else {
      D.freq.forEach(function (r) {
        var k = norm(r.topic);
        if (k && !FREQ[k]) FREQ[k] = r;
      });
    }
  }
  rebuildFreq();

  function norm(s) {
    return String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  }

  function t(key) {
    var v = I18N[key];
    if (!v) return key;
    return v[state.lang] || v.hi;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function board() { return MAP[state.board] || BOARDS[0]; }

  // board ke apne prashn (jaise CBSE ka apna English bank)
  function bank() { return BANK[state.board] || null; }

  function applyBoardData() {
    var b = bank();
    if (b && b.questions) {
      D.questions = b.questions;
      if (b.subjects) D.subjects = b.subjects;
      if (b.papers) D.papers = b.papers;
    } else {
      D.questions = ORIG.questions;
      D.subjects = ORIG.subjects;
      D.papers = ORIG.papers;
    }
    rebuildFreq();
  }

  function subj(key) {
    if (SMAP[key]) return SMAP[key];
    for (var i = 0; i < D.subjects.length; i++) {
      if (D.subjects[i].key === key) return D.subjects[i];
    }
    return null;
  }

  // board ke subjects (unka order aur naam)
  function boardSubjects() {
    var b = board();
    var list = [];
    if (b.subjects) {
      b.subjects.forEach(function (k) {
        var s = SMAP[k];
        if (s) list.push(s);
      });
    }
    if (!list.length) list = D.subjects.slice();
    return list;
  }

  function qsFor(key) {
    var out = [];
    for (var i = 0; i < D.questions.length; i++) {
      if (!key || key === 'all' || D.questions[i].subj === key) out.push(D.questions[i]);
    }
    return out;
  }

  function isChapName(c) {
    if (!c) return false;
    if (/bank|question|mcq|pyq|model|paper|solution|objective|sample|important|अभ्यास|प्रश्न|उत्तर|व्याकरण/i.test(c)) return false;
    if (/^chapter\s*\d+$/i.test(c)) return false;
    return true;
  }

  function chapters(key) {
    var seen = [], hit = {};
    var S = (window.STORIES && window.STORIES[key]) || null;
    qsFor(key).forEach(function (q) {
      var c = q.chap || q.part || '';
      var m = /^chapter\s*(\d+)$/i.exec(c);
      if (m && S && S[Number(m[1]) - 1]) c = S[Number(m[1]) - 1].t;
      if (isChapName(c) && !hit[c]) { hit[c] = 1; seen.push(c); }
    });
    return seen;
  }

  function freqBadge(q) {
    if (bank()) return '';
    var row = FREQ[norm(q.q)] || FREQ[norm(q.chap)];
    if (!row) return '';
    return '<span class="badge freq">' + esc(row.times) + '× · ' + esc(row.years) + '</span>';
  }

  function applyBoard() {
    var b = board();
    var r = document.documentElement.style;
    r.setProperty('--accent', b.color || '#4f46e5');
    r.setProperty('--accent-soft', b.color ? b.color + '1a' : '#eef0ff');
    var mark = document.getElementById('brandMark');
    if (mark) mark.style.background = b.color || '#4f46e5';
    document.getElementById('boardChipText').textContent = b.name;
    document.querySelector('.chip-btn .dot').style.background = b.color || '#10b981';
    document.querySelector('meta[name=theme-color]').setAttribute('content', b.color || '#4f46e5');
  }

  /* ---------------- components ---------------- */

  function subjectCard(s) {
    var n = qsFor(s.key).length;
    var mcq = qsFor(s.key).filter(function (q) { return q.type === 'mcq'; }).length;
    var nm = state.lang === 'en' ? (s.en || s.name) : s.name;
    return '<a class="card subj-card" href="#/subject/' + s.key + '" style="--sc:' + s.color + '">' +
      '<h3>' + esc(nm) + '</h3>' + (state.lang === 'en' ? '' : '<p>' + esc(s.en) + '</p>') +
      '<div class="count">' + n + ' ' + esc(n === 1 ? (state.lang === 'en' ? 'question' : 'सवाल') : t('questions_word')) + ' · ' + mcq + ' MCQ</div></a>';
  }

  function hubCard(href, icon, title, sub) {
    var ic = (window.BP_ICONS && window.BP_ICONS[icon]) ? BP_ICON(icon) : icon;
    return '<a class="hub-card" href="' + href + '">' +
      '<span class="hub-ico">' + ic + '</span>' +
      '<span><span class="ht">' + esc(title) + '</span><br><span class="hs">' + esc(sub) + '</span></span></a>';
  }

  function questionCard(q, i) {
    var opts = '';
    if (q.type === 'mcq' && q.opts && q.opts.length) {
      opts = '<div class="opts">' + q.opts.map(function (o, k) {
        var letter = 'ABCD'[k] || (k + 1);
        return '<button class="opt" data-k="' + k + '"><span class="k">' + letter + '</span>' +
          '<span>' + esc(o) + '</span></button>';
      }).join('') + '</div>';
    }
    var ansIdx = '';
    if (q.type === 'mcq' && q.opts && q.opts.length && q.ans) {
      var n = String(q.ans).toUpperCase().charCodeAt(0) - 65;
      if (n >= 0 && n < q.opts.length) ansIdx = ' data-ansidx="' + n + '"';
    }
    var ans = '';
    if (q.type === 'write') {
      ans = '<textarea class="writebox" placeholder="' + esc(t('quiz_write_hint')) + '"></textarea>' +
        '<div class="ansbox" hidden>' + (q.exp ? esc(q.exp) : '') + '</div>' +
        '<button class="link-btn" data-act="ans">' + t('show_answer') + '</button>';
      if (i === 'quiz') {
        ans += '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">' +
          '<button class="btn btn-primary" data-act="selfright" style="flex:1;min-width:120px">' + esc(t('quiz_self_right')) + '</button>' +
          '<button class="btn btn-ghost" data-act="selfwrong" style="flex:1;min-width:120px">' + esc(t('quiz_self_wrong')) + '</button></div>';
      }
    } else if (q.ans || q.exp) {
      ans = '<div class="ansbox" hidden>' +
        (q.ans ? '<b>' + esc(t('answer_label')) + '</b> ' + esc(q.ans) + '<br>' : '') +
        (q.exp ? esc(q.exp) : '') + '</div>' +
        '<button class="link-btn" data-act="ans">' + t('show_answer') + '</button>';
    }
    return '<div class="qcard" data-idx="' + i + '"' + ansIdx + '>' +
      '<div class="qmeta"><span class="badge">' + esc(q.type === 'mcq' ? t('mcq') : t('written')) + '</span>' +
      freqBadge(q) + '<button class="link-btn bm-btn" data-act="bookmark" title="bookmark" style="margin-left:auto;padding:4px 8px">☆</button></div>' +
      '<div class="qtext">' + esc(q.q) + '</div>' + opts + ans + '</div>';
  }

  /* ---------------- views ---------------- */

  /* ---------------- home dashboard (v3) ---------------- */

  function dashSec(title, body, moreHref, moreLabel) {
    return '<section class="section"><div class="section-head"><h2>' + esc(title) + '</h2>' +
      (moreHref ? '<a class="more" href="' + moreHref + '">' + esc(moreLabel || L('All', 'सभी') + ' →') + '</a>' : '') +
      '</div>' + body + '</section>';
  }

  function examCountdown() {
    var raw = ((IMP && IMP.exam) || (board() && board().exam) || '').toString();
    var m = raw.match(/([A-Za-z]{3,})\s*(\d{4})/);
    if (!m) return null;
    var mon = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }[m[1].slice(0, 3).toLowerCase()];
    var yr = Number(m[2]);
    if (!mon) return null;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var target = new Date(yr, mon - 1, 1);
    return { label: raw, days: Math.ceil((target - today) / 86400000) };
  }

  function vDash() {
    var st = window.STUDY ? window.STUDY.stats() : null;
    var goal = (st && st.goal) || 5;
    var todayN = (st && st.last7 && st.last7[0] ? st.last7[0].n : 0);
    var pct = Math.min(100, Math.round((todayN / goal) * 100));
    var h = '';

    /* B. आज का अवलोकन */
    var ring = '<div class="ring" style="--p:' + pct + '"><div class="ring-in"><b>' + pct + '%</b><span>' + esc(L('Aaj ka lakshya', 'आज का लक्ष्य')) + '</span></div></div>';
    h += '<div class="card dash-today">' + ring +
      '<div class="dash-today-nums">' +
      '<div><b>' + todayN + '</b><span>' + esc(L('aaj ke sawal', 'आज के सवाल')) + '</span></div>' +
      '<div><b>' + (st ? st.total : 0) + '</b><span>' + esc(L('kul sawal', 'कुल सवाल')) + '</span></div>' +
      '<div><b>' + (st ? st.streak : 0) + '</b><span>' + esc(L('din streak', 'दिन स्ट्रीक')) + '</span></div>' +
      '</div></div>';

    /* C. परीक्षा काउंटडाउन */
    var ec = examCountdown();
    if (ec) {
      var eco = ec.days > 0
        ? '<b class="t-num">' + ec.days + '</b> ' + esc(L('din baaki', 'दिन बाकी'))
        : (ec.days === 0 ? esc(L('Aaj!', 'आज!')) : '<b>0</b> ' + esc(L('din baaki', 'दिन बाकी')));
      h += '<div class="card dash-exam">' +
        '<div><div class="t-small">' + esc(L('Board exam', 'बोर्ड परीक्षा')) + '</div>' +
        '<div style="font-size:18px;font-weight:800">' + eco + '</div>' +
        '<div class="t-secondary">' + esc(ec.label) + '</div></div>' +
        '<span data-icon="timer" class="dash-exam-ic"></span></div>';
    }

    /* C2. Student ka apna target */
    var cd = (window.STUDY && window.STUDY.countdown) ? window.STUDY.countdown() : null;
    if (cd) {
      h += '<div class="card dash-exam" style="border-color:#c4b5fd;background:#f5f3ff">' +
        '<div><div class="t-small">' + esc(L('Mera target', 'मेरा टारगेट')) + '</div>' +
        '<div style="font-size:18px;font-weight:800">' + cd.days + ' ' + esc(L('din bache', 'दिन बचे')) + '</div>' +
        '<div class="t-secondary">' + cd.perDay + ' ' + esc(L('sawal / din', 'सवाल / दिन')) + '</div></div>' +
        '<a class="dash-exam-ic" href="#/target" aria-label="target"><span data-icon="target"></span></a></div>';
    }

    /* D. जहाँ से जारी रखें */
    var ls = storeGet('bp_last_subj', '');
    if (ls && window.SUBJECT_MAP && window.SUBJECT_MAP[ls]) {
      var sm = window.SUBJECT_MAP[ls];
      var lch = storeGet('bp_last_chap', '');
      h += dashSec(L('Continue learning', 'जहाँ से जारी रखें'),
        '<a class="list-row" href="#/subject/' + esc(ls) + '"><div>' +
        '<div class="t">' + esc(state.lang === 'en' ? (sm.en || sm.name) : sm.name) + '</div>' +
        (lch ? '<div class="s">' + esc(lch) + '</div>' : '<div class="s">' + esc(L('Chapter kholo', 'अध्याय खोलो')) + '</div>') +
        '</div><span class="n">' + esc(L('Chalu karo', 'जारी रखो')) + '</span></a>', '#/learn');
    }

    /* E. विषय प्रगति */
    if (st && st.subj && Object.keys(st.subj).length) {
      var keys = Object.keys(st.subj).sort(function (a, b) { return (st.subj[b].pct || 0) - (st.subj[a].pct || 0); });
      h += dashSec(L('Subject progress', 'विषय प्रगति'),
        keys.map(function (k) {
          var x = st.subj[k];
          var nm = (window.SUBJECT_MAP && window.SUBJECT_MAP[k] ? (state.lang === 'en' ? window.SUBJECT_MAP[k].en : window.SUBJECT_MAP[k].name) : k);
          return '<div class="prog-row"><div class="prog-top"><span>' + esc(nm) + '</span><b class="t-num">' + x.pct + '%</b></div>' +
            '<div class="prog"><i style="width:' + x.pct + '%;background:' + (x.pct >= 70 ? 'var(--color-success)' : x.pct >= 40 ? 'var(--color-warning)' : 'var(--color-error)') + '"></i></div>' +
            '<div class="t-small">' + x.ok + '/' + x.n + ' ' + esc(L('sahi', 'सही')) + '</div></div>';
        }).join(''), '#/learn');
    }

    /* F. क्विक एक्शन */
    h += dashSec(L('Quick actions', 'क्विक एक्शन'), '<div class="qa-grid">' +
      [['#/quiz', 'pencil', L('Quiz', 'क्विज़')], ['#/exam', 'timer', L('Mock exam', 'मॉक एग्ज़ाम')],
       ['#/search', 'search', L('Search', 'खोज')],
       ['#/notes', 'book', L('Notes', 'नोट्स')], ['#/revision', 'repeat', L('Revise', 'रिवीज़न')]].map(function (x) {
        return '<a class="qa" href="' + x[0] + '"><span data-icon="' + x[1] + '"></span>' + esc(x[2]) + '</a>';
      }).join('') + '</div>');

    /* G. कमज़ोर अध्याय */
    if (st && st.chap && st.chap.filter(function (x) { return x.n >= 3 && x.pct < 50; }).length) {
      var weak = st.chap.filter(function (x) { return x.n >= 3 && x.pct < 50; }).slice(0, 5);
      h += dashSec(L('Weak chapters', 'कमज़ोर अध्याय'),
        weak.map(function (x) {
          return '<a class="list-row" href="#/subject/' + esc(x.s) + '"><div><div class="t">' + esc(x.c) + '</div>' +
            '<div class="s">' + x.ok + '/' + x.n + ' · ' + x.pct + '%</div></div><span class="n">→</span></a>';
        }).join(''), '#/progress', L('Poora', 'पूरा'));
    }

    /* H. आज के कार्य */
    var tasks = [];
    if (todayN < goal) tasks.push([L('Aaj ke ' + (goal - todayN) + ' sawal baaki', 'आज के ' + (goal - todayN) + ' सवाल बाकी'), '#/quiz']);
    if (st && st.wrong > 0) tasks.push([L('Galti kiye sawal dobara', 'गलत किए सवाल दोबारा'), '#/revision']);
    if (st && st.book > 0) tasks.push([L('Bookmarked sawal', 'बुकमार्क सवाल'), '#/revision']);
    tasks.push([L('Ek chapter padho (notes)', 'एक अध्याय पढ़ो (नोट्स)'), '#/notes']);
    if (tasks.length) {
      h += dashSec(L("Aaj ke kaam", 'आज के काम'),
        tasks.map(function (x, i) { return '<a class="task" href="' + x[1] + '"><span class="task-n">' + (i + 1) + '</span>' + esc(x[0]) + '<span class="task-ar">→</span></a>'; }).join(''));
    }

    /* I. हाल की गतिविधि */
    if (st && st.exams && st.exams.length) {
      h += dashSec(L('Recent activity', 'हाल की गतिविधि'),
        st.exams.slice(-4).reverse().map(function (e) {
          return '<div class="result-row"><span>' + esc(e.subj) + ' · ' + new Date(e.t).toLocaleDateString() + '</span><b class="t-num">' + e.right + '/' + e.total + '</b></div>';
        }).join(''), '#/progress');
    }
    return h;
  }

  function vHome() {
    var total = D.questions.length;
    var mcq = D.questions.filter(function (q) { return q.type === 'mcq'; }).length;
    var chap = {};
    D.questions.forEach(function (q) { var c = q.chap || ''; if (c) chap[c] = 1; });
    var b = board();

    var html = '<section class="hero">' +
      '<div class="hero-top"><h1>' + esc(t('brand')) + '</h1>' +
      '<span class="hero-board">' + esc(b.name) + '</span></div>' +
      '<div class="sub">' + esc(t('home_board_note')) + '</div>' +
      '<div class="hero-tags">' +
      '<span class="tag">' + esc(b.exam) + '</span>' +
      '<span class="tag">' + esc(b.pattern) + '</span>' +
      '<span class="tag">' + esc(b.medium) + '</span>' +
      '<span class="tag">' + esc(b.state) + '</span>' +
      '</div>' +
      '<div class="hero-cta">' +
      '<a class="btn btn-primary" href="#/quiz">' + esc(t('home_start')) + '</a>' +
      '<a class="btn btn-ghost" href="#/search">' + esc(t('home_search_btn')) + '</a>' +
      '</div></section>';

    html += vDash();

    html += '<div class="stats">' +
      '<div class="stat"><b>' + total + '</b><span>' + esc(t('home_stats_q')) + '</span></div>' +
      '<div class="stat"><b>' + mcq + '</b><span>MCQ</span></div>' +
      '<div class="stat"><b>' + Object.keys(chap).length + '</b><span>' + esc(t('home_stats_chap')) + '</span></div>' +
      '<div class="stat"><b>' + BOARDS.length + '</b><span>' + esc(t('home_stats_boards')) + '</span></div></div>';

    html += '<a class="list-row" href="#/help" id="offRow" style="margin-bottom:12px;border-color:#bbf7d0;background:#f0fdf4"><div>' +
      '<div class="t">⬇ ' + esc(L('Sab offline karo', 'सब ऑफ़लाइन करो')) + '</div>' +
      '<div class="s" id="offStat">' + esc(L('PDF + songs phone me save — internet band ho to bhi chalे', 'PDF + songs फ़ोन में सेव — इंटरनेट बंद हो तो भी चले')) + '</div></div>' +
      '<button class="btn btn-accent" id="offBtn" style="padding:10px 14px;white-space:nowrap">' + esc(L('Offline download', 'ऑफ़लाइन डाउनलोड')) + '</button></a>';

    if (storeGet('bp_apk', '0') !== '1' && location.href.indexOf('appassets.androidplatform.net') < 0) {
      html += '<a class="list-row apk-card" href="downloads/BoardPrep-v5.11.apk" download style="margin-bottom:12px;border-color:#c4b5fd;background:#f5f3ff"><div>' +
        '<div class="t">📱 ' + esc(L('Android app v5.11 — full offline', 'एंड्रॉयड ऐप v5.11 — पूरा ऑफ़लाइन')) + '</div>' +
        '<div class="s">' + esc(L('Sab kuch app me hi hai — PDF, 3D models, songs. Internet ke bina bhi.', 'सब कुछ ऐप में ही है — PDF, 3D models, songs। इंटरनेट के बिना भी।')) + '</div></div><span class="n">⬇</span></a>';
    }

    html += '<section class="section"><div class="section-head">' +
      '<h2>' + esc(t('tools_title')) + '</h2><a class="more" href="#/tools">' + esc(t('all')) + ' →</a></div>' +
      '<div class="hub">' +
      hubCard('#/quiz', 'pencil', t('nav_quiz'), t('hub_quiz_sub')) +
      hubCard('#/models', 'cube', '3D ' + t('models_word'), t('hub_models_sub')) +
      hubCard('#/important', 'star', t('tool_important'), t('hub_important_sub')) +
      hubCard('#/formulas', 'sigma', t('tool_formulas'), t('hub_formulas_sub')) +
      hubCard('#/periodic', 'atom', t('tool_periodic'), t('hub_periodic_sub')) +
      hubCard('#/lab', 'flask', t('tool_lab'), t('hub_lab_sub')) +
      hubCard('#/mathlab', 'calc', t('tool_mathlab'), t('hub_mathlab_sub')) +
      hubCard('#/diagrams', 'target', t('tool_diagrams'), t('hub_diagrams_sub')) +
      hubCard('#/timeline', 'timeline', t('tool_timeline'), t('hub_timeline_sub')) +
      hubCard('#/stories', 'book', t('tool_stories'), t('hub_stories_sub')) +
      hubCard('#/songs', 'music', t('hub_songs'), t('hub_songs_sub')) +
      hubCard('#/brain', 'bulb', t('tool_brain'), t('hub_brain_sub')) +
      hubCard('#/papers', 'papers', t('tool_pdfs'), t('hub_pdfs_sub')) +
      hubCard('#/subjects', 'grid', t('nav_subjects'), t('hub_subjects_sub')) +
      hubCard('#/help', 'check', t('hub_help'), t('hub_help_sub')) +
      hubCard('#/notes', 'book', t('hub_notes'), t('hub_notes_sub')) +
      hubCard('#/progress', 'chart', t('hub_progress'), t('hub_progress_sub')) +
      hubCard('#/exam', 'timer', t('hub_exam'), t('hub_exam_sub')) +
      hubCard('#/revision', 'refresh', t('hub_revision'), t('hub_revision_sub')) +
      hubCard('#/assistant', 'sparkle', t('hub_assistant'), t('hub_assistant_sub')) +
      '</div></section>';

    var en = state.lang === 'en';
    html += '<section class="pattern"><h3>' + esc(t('board_pattern')) + ' — ' + esc(b.name) + '</h3>' +
      '<div class="prow"><span>' + esc(t('board_exam')) + '</span><b>' + esc(b.exam) + '</b></div>' +
      '<div class="prow"><span>' + esc(t('board_lang')) + '</span><b>' + esc(en ? b.medium_en : b.medium) + '</b></div>' +
      '<div class="prow"><span>' + esc(t('board_pass')) + '</span><b>' + esc(String(b.passMarks)) + '%</b></div>' +
      '<div class="prow"><span>' + esc(t('board_sections')) + '</span><b>' + esc(b.pattern) + '</b></div>' +
      ((en ? b.sections_en : b.sections) || []).map(function (s) {
        return '<div class="prow"><span>' + esc(s.t) + '</span><b>' + esc(s.d) + '</b></div>';
      }).join('') +
      '<div class="ptags"><span class="ptag">' + esc(b.full) + '</span></div></section>';

    html += '<section class="section"><div class="section-head">' +
      '<h2>' + esc(t('home_subjects_title')) + '</h2>' +
      '<a class="more" href="#/subjects">' + esc(t('all')) + ' →</a></div>' +
      '<div class="grid grid-3">' + boardSubjects().map(subjectCard).join('') + '</div></section>';

    var top = bank() ? [] : Object.keys(FREQ).map(function (k) { return FREQ[k]; })
      .sort(function (a, b) { return b.times - a.times; }).slice(0, 6);
    if (top.length) {
      html += '<section class="section"><div class="section-head"><h2>' + esc(t('freq_title')) + '</h2></div>';
      top.forEach(function (r) {
        html += '<div class="freq-row"><div><div>' + esc(r.topic) + '</div>' +
          '<div class="yrs">' + esc(r.years) + ' · ' + esc((function (s) { return s ? (state.lang === 'en' ? (s.en || s.name) : s.name) : ''; })(subj(r.subj))) + '</div>' +
          '<span class="xchip">' + esc(r.times) + '×</span></div></div>';
      });
      html += '</section>';
    }

    return html;
  }

  function vSubjects() {
    return '<section class="section"><div class="section-head"><h2>' + esc(t('subjects_title')) + '</h2></div>' +
      '<div class="grid grid-3">' + boardSubjects().map(subjectCard).join('') + '</div></section>';
  }

  function vSubject(key) {
    var s = subj(key);
    if (!s) return '<div class="empty">404</div>';
    state.subjKey = key;
    storeSet('bp_last_subj', key);
    var chaps = chapters(key);
    var list = qsFor(key).filter(function (q) {
      if (state.subjType !== 'all' && q.type !== state.subjType) return false;
      if (state.subjChap !== 'all' && (q.chap || q.part) !== state.subjChap) return false;
      return true;
    });
    var show = list.slice(0, state.shown);
    state.subjQs = show;

    var html = '<a class="backlink" href="#/subjects">← ' + esc(t('back')) + '</a>' +
      '<div class="section-head"><h2 style="color:' + s.color + '">' + esc(state.lang === 'en' ? (s.en || s.name) : s.name) + '</h2>' +
      '<span class="note">' + list.length + ' ' + esc(t('questions_word')) + '</span></div>';

    html += '<div class="chips">' +
      [['all', t('all')], ['mcq', t('mcq')], ['write', t('written')]].map(function (c) {
        return '<button class="fchip' + (state.subjType === c[0] ? ' on' : '') +
          '" data-type="' + c[0] + '">' + esc(c[1]) + '</button>';
      }).join('') + '</div>';

    html += '<div class="field"><select id="chapSel">' +
      '<option value="all">' + esc(t('quiz_all_chapters')) + '</option>' +
      chaps.map(function (c) {
        return '<option value="' + esc(c) + '"' + (state.subjChap === c ? ' selected' : '') + '>' + esc(c) + '</option>';
      }).join('') + '</select></div>';

    html += (window.Tools && window.Tools.chapterList) ? window.Tools.chapterList(key) : '';

    html += '<div id="qlist">' + (show.length ? show.map(questionCard).join('') :
      '<div class="empty">' + esc(t('search_none')) + '</div>') + '</div>';

    if (list.length > state.shown) {
      html += '<button class="btn btn-accent btn-block" id="moreBtn">' + esc(t('load_more')) +
        ' (' + (list.length - state.shown) + ')</button>';
    }
    return html;
  }

  function vSearch() {
    return '<section class="section"><div class="section-head"><h2>' + esc(t('nav_search')) + '</h2></div>' +
      '<input type="search" id="searchBox" placeholder="' + esc(t('search_placeholder')) + '" autocomplete="off">' +
      '<div class="note">' + esc(t('search_hint')) + '</div>' +
      '<div id="searchOut" style="margin-top:14px"></div></section>';
  }

  // Search index — ek baar banta hai, har keystroke par poora DB scan nahi
  var _sidx = null;
  function searchIndex() {
    if (_sidx) return _sidx;
    _sidx = [];
    for (var i = 0; i < D.questions.length; i++) {
      var q = D.questions[i];
      _sidx.push({ q: q, hay: norm(q.q) + ' ' + norm(q.chap) + ' ' + norm((q.opts || []).join(' ')) });
    }
    return _sidx;
  }

  function doSearch(word) {
    var out = document.getElementById('searchOut');
    var w = norm(word);
    if (!w) { out.innerHTML = ''; return; }
    var hits = [];
    var idx = searchIndex();
    for (var i = 0; i < idx.length; i++) {
      if (idx[i].hay.indexOf(w) !== -1) hits.push(idx[i].q);
      if (hits.length >= 300) break;
    }
    if (!hits.length) {
      out.innerHTML = '<div class="empty">' + esc(t('search_none')) + '</div>';
      return;
    }
    out.innerHTML = '<div class="note">' + hits.length + ' ' + esc(t('search_results')) + '</div>' +
      hits.slice(0, 120).map(function (q, i) { return questionCard(q, i); }).join('');
  }

  function vQuizSetup() {
    var b = board();
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('quiz_setup')) + '</h2>' +
      '<span class="note">' + esc(b.name) + '</span></div>';
    if (b.id !== 'jac' && !bank()) {
      html += '<div class="imp-item" style="background:#fffbeb;border-color:#fcd34d"><div class="num" style="background:#fef3c7;color:#92400e">!</div><div>' +
        '<div class="iq">' + esc(L('Questions here come from the shared JAC bank, not your board papers.', 'यहाँ के प्रश्न साझा JAC bank से हैं, तुम्हारे board के अपने पेपर से नहीं।')) + '</div></div></div>';
    }

    html += '<div class="field"><label>' + esc(L('Quiz mode', 'क्विज़ मोड')) + '</label><div class="chips" id="qzKind">' +
      [['quick', L('Quick 10', 'तेज़ 10')], ['chapter', L('Chapter', 'अध्याय')], ['subject', L('Subject', 'विषय')], ['mixed', L('Mixed', 'मिक्स')], ['weak', L('Weak', 'कमज़ोर')], ['revision', L('Revision', 'रिवीज़न')], ['random', L('Random', 'रैंडम')], ['daily', L('Daily', 'रोज़ की चुनौती')]].map(function (m, i) {
        return '<button class="fchip' + (i === 0 ? ' on' : '') + '" data-v="' + m[0] + '">' + esc(m[1]) + '</button>';
      }).join('') + '</div></div>';

    html += '<div class="field"><label>' + esc(t('quiz_subj')) + '</label><div class="chips" id="qzSubj">' +
      '<button class="fchip on" data-v="all">' + esc(t('all')) + '</button>' +
      boardSubjects().map(function (s) {
        return '<button class="fchip" data-v="' + s.key + '">' + esc(state.lang === 'en' ? (s.en || s.name) : s.name) + '</button>';
      }).join('') + '</div></div>';

    html += '<div class="field"><label>' + esc(t('quiz_chap')) + '</label><select id="qzChap">' +
      '<option value="all">' + esc(t('quiz_all_chapters')) + '</option></select></div>';

    html += '<div class="field"><label>' + esc(t('quiz_count')) + '</label><div class="chips" id="qzCount">' +
      [10, 20, 30, 50].map(function (n, i) {
        return '<button class="fchip' + (i === 0 ? ' on' : '') + '" data-v="' + n + '">' + n + '</button>';
      }).join('') + '</div></div>';

    html += '<div class="field"><label>' + esc(L('Question type', 'सवाल प्रकार')) + '</label><div class="chips" id="qzMode">' +
      [['mix', t('mixed_practice')], ['mcq', t('mcq')], ['write', t('written')]].map(function (m, i) {
        return '<button class="fchip' + (i === 0 ? ' on' : '') + '" data-v="' + m[0] + '">' + esc(m[1]) + '</button>';
      }).join('') + '</div></div>';

    html += '<div class="field"><label>' + esc(L('Timer', 'टाइमर')) + '</label><div class="chips" id="qzTimer">' +
      [[0, L('Off', 'बंद')], [10, '10 min'], [20, '20 min'], [30, '30 min']].map(function (m, i) {
        return '<button class="fchip' + (i === 0 ? ' on' : '') + '" data-v="' + m[0] + '">' + esc(m[1]) + '</button>';
      }).join('') + '</div></div>';

    html += '<button class="btn btn-accent btn-block" id="qzStart">' + esc(t('quiz_start')) + '</button></section>';
    return html;
  }

  // timer की आवाज़ (WebAudio — कोई file नहीं)
  function beep(freq, dur) {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = window.__bpAC || (window.__bpAC = new AC());
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.value = 0.12;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.stop(ctx.currentTime + dur);
    } catch (e) { }
  }

  function startQuizClock() {
    clearInterval(window.__qzT);
    var qz = state.quiz;
    if (!qz || !qz.timer) return;
    window.__qzT = setInterval(function () {
      var q = state.quiz;
      if (!q || q.done) { clearInterval(window.__qzT); return; }
      var left = Math.max(0, Math.round((q.end - Date.now()) / 1000));
      var el = document.getElementById('qzClock');
      if (el) {
        el.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
        el.classList.toggle('low', left <= 10);
      }
      if (left <= 10 && left > 0) beep(880, 0.08);
      if (left <= 0) {
        clearInterval(window.__qzT);
        beep(440, 0.5);
        q.done = true;               // समय खत्म → अपने-आप submit
        render();
      }
    }, 1000);
  }

  function vQuizRun() {
    var qz = state.quiz;
    var q = qz.items[qz.i];
    var p = Math.round((qz.i / qz.items.length) * 100);
    var html = '<div class="quiz-top"><div class="progress"><i style="width:' + p + '%"></i></div>' +
      '<div class="quiz-meta">' + (qz.i + 1) + '/' + qz.items.length + '</div>';
    if (qz.timer) {
      var left = Math.max(0, Math.round((qz.end - Date.now()) / 1000));
      html += '<div class="qz-clock" id="qzClock">' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') + '</div>';
    }
    html += '</div>';
    html += questionCard(q, 'quiz');
    html += '<button class="btn btn-primary btn-block" id="qzNext" hidden>' + esc(t('quiz_next')) + '</button>';
    html += '<div class="note">' + esc((subj(q.subj) || {}).name || '') + '</div>';
    return html;
  }

  function vQuizResult() {
    var qz = state.quiz;
    var pct = Math.round((qz.right / qz.items.length) * 100);
    var weak = {};
    qz.items.forEach(function (q, i) {
      if (!qz.ok[i]) weak[q.chap || q.subj] = (weak[q.chap || q.subj] || 0) + 1;
    });
    var weakList = Object.keys(weak).sort(function (a, b) { return weak[b] - weak[a]; }).slice(0, 5);
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('quiz_result')) + '</h2></div>' +
      '<div class="result-ring" style="--p:' + pct + '"><div>' + pct + '%</div></div>' +
      '<div class="result-row"><span>' + esc(t('quiz_correct')) + '</span><b>' + qz.right + '</b></div>' +
      '<div class="result-row"><span>' + esc(t('quiz_wrong')) + '</span><b>' + (qz.items.length - qz.right) + '</b></div>';
    if (weakList.length) {
      html += '<div class="section-head" style="margin-top:18px"><h2>' + esc(t('quiz_weak')) + '</h2></div>';
      weakList.forEach(function (c) {
        html += '<div class="result-row"><span>' + esc(c) + '</span><b>' + weak[c] + '</b></div>';
      });
    }
    // अभी नहीं खोले गए अध्याय — पढ़ने का सुझाव
    var unopened = [];
    try {
      var chMap = {};
      (window.BOARD_DATA.questions || []).forEach(function (q) {
        if (q.chap && !chMap[q.chap]) chMap[q.chap] = q.subj;
      });
      var done = {};
      (window.STUDY.data().attempts || []).forEach(function (a) { if (a.c) done[a.c] = 1; });
      Object.keys(chMap).forEach(function (c) { if (!done[c]) unopened.push({ c: c, s: chMap[c] }); });
      unopened = unopened.slice(0, 5);
    } catch (e) { }
    if (unopened.length) {
      html += '<div class="section-head" style="margin-top:18px"><h2>' + esc(L('Abhi nahi khule — padho', 'अभी नहीं खोले — पढ़ो')) + '</h2></div>';
      unopened.forEach(function (x) {
        html += '<a class="list-row" href="#/chapter/' + esc(x.s) + '/' + encodeURIComponent(x.c) + '"><div>' +
          '<div class="t">' + esc(x.c) + '</div></div><span class="n">' + esc(L('Kholo', 'खोलो')) + ' →</span></a>';
      });
    }
    html += '<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">' +
      '<a class="btn btn-accent" href="#/quiz" id="qzRetry" style="flex:1">' + esc(t('quiz_retry')) + '</a>' +
      '<a class="btn btn-primary" href="#/" style="flex:1">' + esc(t('quiz_home')) + '</a></div></section>';
    return html;
  }

  function vPapers() {
    var list = D.papers.filter(function (p) {
      if (state.paperFilter === 'all') return true;
      var k = String(p.kind || '').toLowerCase();
      if (state.paperFilter === 'pyq') return k.indexOf('pyq') >= 0;
      if (state.paperFilter === 'model') return k.indexOf('model') >= 0;
      return k === state.paperFilter;
    });
    var shared = board().id !== 'jac' && !bank();
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('papers_title')) + '</h2>' +
      '<span class="note">' + esc(board().name) + '</span></div>';
    // upar hi saal aur sankhya — kholte hi samajh aaye
    var years2 = {};
    D.papers.forEach(function (p) { years2[p.year] = (years2[p.year] || 0) + 1; });
    var ys = Object.keys(years2).sort().reverse();
    html += '<div class="imp-item" style="background:#eef2ff;border-color:#c7d2fe"><div class="num" style="background:#e0e7ff;color:#3730a3">' +
      D.papers.length + '</div><div><div class="iq">' + esc(D.papers.length + ' PDF · ' +
      ys.map(function (y) { return y + ' (' + years2[y] + ')'; }).join(' · ')) + '</div>' +
      '<div class="note">' + esc(L('PYQ aur model papers — saal ke hisaab se neeche', 'PYQ और model papers — साल के अनुसार नीचे')) + '</div></div></div>';
    if (shared) {
      html += '<div class="imp-item" style="background:#fffbeb;border-color:#fcd34d"><div class="num" style="background:#fef3c7;color:#92400e">!</div><div>' +
        '<div class="iq">' + esc(L('These are the shared JAC model papers. Your board\'s own papers may differ.', 'ये JAC के साझा मॉडल पेपर हैं। तुम्हारे board के अपने पेपर अलग हो सकते हैं।')) + '</div></div></div>';
    }
    html += '<div class="chips">' +
      [['all', t('papers_all')], ['pyq', t('papers_pyq')], ['model', t('papers_model')]].map(function (c) {
        return '<button class="fchip' + (state.paperFilter === c[0] ? ' on' : '') +
          '" data-f="' + c[0] + '">' + esc(c[1]) + '</button>';
      }).join('') + '</div>';
    if (!list.length) {
      html += '<div class="empty">' + esc(t('papers_empty')) + '</div>';
    } else {
      var years = {};
      list.forEach(function (p) { (years[p.year] = years[p.year] || []).push(p); });
      Object.keys(years).sort().reverse().forEach(function (y) {
        html += '<div class="board-group">' + esc(y) + '</div>';
        years[y].forEach(function (p) {
          var raw = String(p.name || '');
          var isM = /-Model-Paper$/.test(raw);
          var title = raw;
          if (isM) {
            title = raw.replace(/-Model-Paper$/, '') + ' — ' + t('papers_model');
          } else if (raw.indexOf('Sample Question Paper') < 0 && raw.indexOf('Marking Scheme') < 0) {
            title = raw + ' — ' + t('papers_pyq');
          }
          if (shared) title = 'JAC ' + title;
          html += '<div class="list-row"><div>' +
            '<div class="t">' + esc(title) + '</div>' +
            '<div class="s">' + esc(p.label) + ' · ' + esc(p.year) + '</div></div>' +
            '<a class="btn btn-ghost" style="background:var(--accent);color:#fff;padding:8px 14px" href="' +
            esc(p.url) + '" target="_blank" rel="noopener">' + esc(t('papers_open')) + '</a></div>';
        });
      });
    }
    return html + '</section>';
  }

  /* ---------------- important 2027 ---------------- */

  function impLabel() {
    if (!IMP) return '';
    var same = String(IMP.board || '').toLowerCase() === String(state.board || '').toLowerCase();
    if (same) {
      return board().name + ' · ' + IMP.exam + ' · ' + L('Board-specific practice (NCERT syllabus)', 'बोर्ड-विशिष्ट अभ्यास (NCERT पाठ्यक्रम)');
    }
    return L('NCERT-based General Practice Questions', 'NCERT-आधारित सामान्य अभ्यास प्रश्न') + ' · ' + IMP.exam;
  }

  function vImportant() {
    if (!IMP) return '<div class="empty">No data</div>';
    var sec = IMP.sections.filter(function (s) { return s.id === state.impSubj; })[0] || IMP.sections[0];
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('imp_title')) + '</h2>' +
      '<span class="note">' + esc(impLabel()) + '</span></div>';
    html += '<div class="chips">' + IMP.sections.map(function (s) {
      return '<button class="fchip' + (s.id === sec.id ? ' on' : '') + '" data-imp="' + s.id + '">' + esc(state.lang === 'en' ? (s.en || s.title) : s.title) + '</button>';
    }).join('') + '</div>';

    sec.groups.forEach(function (g) {
      html += '<div class="board-group">' + esc(g.title) + '</div>';
      g.items.forEach(function (it, i) {
        if (g.type === 'formula') {
          html += '<div class="imp-item"><div class="num">' + (i + 1) + '</div><div>' +
            '<div class="iq">' + esc(it.q) + '</div><div class="imp-ans">' + esc(it.f) + '</div></div></div>';
          return;
        }
        html += '<div class="imp-item"><div class="num">' + (i + 1) + '</div><div>' +
          '<div class="iq">' + esc(it.q) + '</div>';
        if (it.opts) {
          html += '<div class="imp-opts">' + it.opts.map(function (o, k) {
            var ok = String(it.ans).toUpperCase() === 'ABCD'[k];
            return '<span class="' + (ok ? 'ok' : '') + '">' + 'ABCD'[k] + '. ' + esc(o) + '</span>';
          }).join('') + '</div>';
        }
        if (it.note) html += '<div class="in">' + esc(it.note) + '</div>';
        if (it.ans && !it.opts) html += '<div class="imp-ans">' + esc(it.ans) + '</div>';
        html += '</div></div>';
      });
    });

    if (sec.id === IMP.sections[0].id) {
      html += '<div class="board-group">' + esc(t('imp_timetable')) + '</div>';
      IMP.timetable.forEach(function (r) {
        html += '<div class="result-row"><span>' + esc(r.subj) + '</span><b>' + esc(r.time) + '</b></div>';
        html += '<div class="note">' + esc(r.focus) + '</div>';
      });
    }
    html += '</section>';
    return html;
  }

  function vImportantMore() {
    if (!IMP) return '';
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('imp_strategy')) + '</h2></div>';
    IMP.strategy.forEach(function (r) {
      html += '<div class="result-row"><span>' + esc(r.week) + '</span><b>' + esc(r.work) + '</b></div>';
    });
    html += '</section>';
    html += '<section class="section"><div class="section-head"><h2>' + esc(t('imp_tips')) + '</h2></div>';
    IMP.tips.forEach(function (x) {
      html += '<div class="imp-item"><div class="num">•</div><div><div class="iq">' + esc(x) + '</div></div></div>';
    });
    html += '</section>';
    html += '<section class="section"><div class="section-head"><h2>' + esc(t('imp_faq')) + '</h2></div>';
    IMP.faq.forEach(function (f) {
      html += '<details class="block"><summary>' + esc(f.q) + '</summary><div class="body">' + esc(f.a) + '</div></details>';
    });
    return html + '</section>';
  }

  /* ---------------- quiz logic ---------------- */

  function answerable(q) {
    if (q.type === 'write') return true;
    if (!q.opts || !q.opts.length || !q.ans) return false;
    var n = String(q.ans).toUpperCase().charCodeAt(0) - 65;
    return n >= 0 && n < q.opts.length;
  }

  // Centralized quiz scoring — har question ka score SIRF EK baar count hota hai
  function quizMark(i, got) {
    var qz = state.quiz;
    if (!qz) return false;
    if (Object.prototype.hasOwnProperty.call(qz.ok, i)) return false; // already locked
    qz.ok[i] = !!got;
    if (got) qz.right++;
    // progress dashboard ke liye record (silent — koi crash nahi)
    try {
      var q = qz.items[i];
      if (q && window.STUDY) {
        window.STUDY.attempt(q.subj, q.chap || q.part || '', !!got, q.q);
        if (!got) window.STUDY.wrong(q, q.subj, q.chap || q.part || '');
        try { window.STUDY.srsUpdate(q, !!got); } catch (e) {}   // spaced repetition
      }
    } catch (e) {}
    return true;
  }

  function pickQuiz(subjKey, chap, count, mode) {
    var pool = qsFor(subjKey).filter(function (q) {
      if (mode !== 'mix' && q.type !== mode) return false;
      if (chap !== 'all' && (q.chap || q.part) !== chap) return false;
      if (!answerable(q)) return false;
      return true;
    });
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    return pool.slice(0, Math.min(count, pool.length));
  }

  // seeded shuffle — daily challenge ke liye (us din ke liye wahi set)
  function seededShuffle(arr, seed) {
    var a = arr.slice();
    var s = seed >>> 0;
    function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function pickQuizAdvanced(kind, subjKey, chap, count, mode) {
    var all = qsFor(subjKey === 'all' ? null : subjKey);
    var pool = [];
    if (kind === 'weak' && window.STUDY) {
      var st = window.STUDY.stats();
      var weakChaps = {};
      st.chap.forEach(function (c) { if (c.n >= 3 && c.pct < 50) weakChaps[c.s + '|' + c.c] = 1; });
      pool = D.questions.filter(function (q) { return weakChaps[q.subj + '|' + (q.chap || q.part)] && answerable(q); });
    } else if (kind === 'revision' && window.STUDY) {
      var seen = {};
      // pehle spaced-repetition ke due sawal (jinka time aa chuka hai)
      try {
        window.STUDY.srsDue(40).forEach(function (q) { if (answerable(q)) seen[(q.id || q.q || '').slice(0, 80)] = q; });
      } catch (e) {}
      (window.STUDY.data().wrong || []).slice(-200).forEach(function (w) { if (w.q) seen[(w.q.q || '').slice(0, 80)] = w.q; });
      (window.STUDY.data().book || []).slice(-200).forEach(function (b) { if (b.q) seen[(b.q.q || '').slice(0, 80)] = b.q; });
      pool = Object.keys(seen).map(function (k) { return seen[k]; }).filter(function (q) { return answerable(q); });
    } else {
      pool = all.filter(function (q) {
        if (mode !== 'mix' && q.type !== mode) return false;
        if (kind === 'chapter' && chap !== 'all' && (q.chap || q.part) !== chap) return false;
        if (kind === 'chapter' && (chap === 'all')) return false;
        return answerable(q);
      });
    }
    var seed = kind === 'daily' ? Number(new Date().toISOString().slice(0, 10).replace(/-/g, '')) : 0;
    var sh = kind === 'daily' ? seededShuffle(pool, seed) : seededShuffle(pool, Math.floor(Math.random() * 1e9));
    var n = (kind === 'quick') ? 10 : count;
    return sh.slice(0, Math.min(n, sh.length));
  }

  function fillChips(id, onPick) {
    var box = document.getElementById(id);
    if (!box) return;
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('.fchip');
      if (!btn) return;
      box.querySelectorAll('.fchip').forEach(function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      onPick(btn.dataset.v);
    });
  }

  /* ---------------- wiring ---------------- */

  function bindCommon() {
    var more = document.getElementById('moreBtn');
    if (more) more.addEventListener('click', function () { state.shown += 40; render(); });

    var chapSel = document.getElementById('chapSel');
    if (chapSel) chapSel.addEventListener('change', function () {
      state.subjChap = chapSel.value; state.shown = 40;
      if (chapSel.value && chapSel.value !== 'all') storeSet('bp_last_chap', chapSel.value);
      render();
    });

    var searchBox = document.getElementById('searchBox');
    if (searchBox) searchBox.addEventListener('input', function () {
      clearTimeout(window.__schT);
      var v = searchBox.value;
      window.__schT = setTimeout(function () { doSearch(v); }, 160);
    });

    document.querySelectorAll('[data-type]').forEach(function (btn) {
      btn.addEventListener('click', function () { state.subjType = btn.dataset.type; state.shown = 40; render(); });
    });

    document.querySelectorAll('[data-imp]').forEach(function (btn) {
      btn.addEventListener('click', function () { state.impSubj = btn.dataset.imp; render(); });
    });

    document.querySelectorAll('.apk-card').forEach(function (a) {
      a.addEventListener('click', function () {
        try { storeSet('bp_apk', '1'); } catch (e) {}
        a.remove();
      });
    });
  }

  function bindQuiz() {
    var start = document.getElementById('qzStart');
    if (start) {
      fillChips('qzSubj', function (v) {
        state.qzSubj = v;
        var sel = document.getElementById('qzChap');
        var chaps = v === 'all' ? [] : chapters(v);
        sel.innerHTML = '<option value="all">' + esc(t('quiz_all_chapters')) + '</option>' +
          chaps.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
      });
      fillChips('qzCount', function (v) { state.qzCount = Number(v); });
      fillChips('qzMode', function (v) { state.qzMode = v; });
      fillChips('qzKind', function (v) { state.qzKind = v; });
      fillChips('qzTimer', function (v) { state.qzTimer = Number(v); });
      state.qzSubj = 'all'; state.qzCount = 10; state.qzMode = 'mix'; state.qzKind = 'quick'; state.qzTimer = 0;
      start.addEventListener('click', function () {
        var items = pickQuizAdvanced(state.qzKind, state.qzSubj, document.getElementById('qzChap').value,
          state.qzCount, state.qzMode);
        if (!items.length) return;
        state.quiz = { items: items, i: 0, right: 0, ok: {}, timer: state.qzTimer,
                       end: state.qzTimer ? Date.now() + state.qzTimer * 60000 : 0 };
        render();
        startQuizClock();
      });
    }
    var next = document.getElementById('qzNext');
    if (next) next.addEventListener('click', function () {
      state.quiz.i++;
      if (state.quiz.i >= state.quiz.items.length) state.quiz.done = true;
      render();
    });
    var retry = document.getElementById('qzRetry');
    if (retry) retry.addEventListener('click', function () { state.quiz = null; render(); });
  }

  function bindPapers() {
    document.querySelectorAll('[data-f]').forEach(function (btn) {
      btn.addEventListener('click', function () { state.paperFilter = btn.dataset.f; render(); });
    });
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });
    document.getElementById('langBtn').textContent = state.lang === 'hi' ? 'हि' : 'EN';
    document.getElementById('boardChipText').textContent = board().name;
    document.querySelectorAll('.bottomnav a span:last-child').forEach(function (s, i) {
      var keys = ['nav_home', 'nav_learn', 'nav_practice', 'nav_progress', 'nav_profile'];
      if (keys[i]) s.textContent = t(keys[i]);
    });
  }

  function route() {
    var h = location.hash.replace(/^#/, '') || '/';
    var qi = h.indexOf('?');
    if (qi >= 0) h = h.slice(0, qi);
    var parts = h.split('/').filter(Boolean);
    if (parts[0] === 'subjects') return vSubjects();
    if (parts[0] === 'subject' && parts[1]) return vSubject(parts[1]);
    if (parts[0] === 'search') return vSearch();
    if (parts[0] === 'papers') return vPapers();
    if (parts[0] === 'important') return vImportant() + vImportantMore();
    if (parts[0] === 'quiz') {
      if (state.quiz && state.quiz.done) return vQuizResult();
      if (state.quiz) return vQuizRun();
      return vQuizSetup();
    }
    if (window.Tools && Tools.route(parts)) return Tools.route(parts);
    return vHome();
  }

  function markNav() {
    var h = location.hash.replace(/^#/, '') || '/';
    var cur = h.split('/').filter(Boolean)[0] || '';
    var map = { '': 'home', 'learn': 'learn', 'subjects': 'learn', 'subject': 'learn', 'chapter': 'learn', 'stories': 'learn', 'notes': 'learn', 'note': 'learn', 'help': 'learn',
      'practice': 'practice', 'bank': 'practice', 'quiz': 'practice', 'papers': 'practice', 'important': 'practice', 'exam': 'practice',
    'calc': 'learn',
      'progress': 'progress', 'revision': 'progress', 'assistant': 'progress', 'chat': 'learn', 'planner': 'progress', 'mynotes': 'progress', 'timer': 'progress', 'remind': 'progress', 'target': 'progress', 'room': 'practice',
      'profile': 'profile', 'settings': 'profile' };
    var on = map[cur] || 'home';
    document.querySelectorAll('.bottomnav a').forEach(function (a) {
      a.classList.toggle('on', a.dataset.nav === on);
    });
  }

  function render() {
    // lazy (code-split) modules pehle load, phir render
    var need = lazyNeed();
    if (need) {
      var missing = (LAZY[need] || []).some(function (s) { return !LOADED[s]; });
      if (missing) {
        view.innerHTML = '<section class="section"><div class="empty">' + esc(L('Load ho raha hai…', 'लोड हो रहा है…')) + '</div></section>';
        window.BP.loadLazy(need).then(render).catch(function () {
          view.innerHTML = '<section class="section"><div class="empty">' + esc(L('Load nahi hua — dobara try karo', 'लोड नहीं हुआ — दोबारा कोशिश करो')) + '</div></section>';
        });
        return;
      }
    }
    view.innerHTML = route();
    // pichla screen yaad rakho — AI "screen dekho" ke liye (chat page khud ko nahi likhta)
    try {
      var seg = location.hash.replace(/^#\//, '').split('/')[0];
      if (seg !== 'chat') {
        var hd = view.querySelector('h1, h2');
        window.BP.lastScreen = {
          hash: location.hash,
          title: hd ? String(hd.textContent || '').replace(/\s+/g, ' ').trim() : '',
          text: (view.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 900)
        };
      }
    } catch (e) { }
    applyBoard();
    applyI18n();
    bindCommon();
    bindQuiz();
    bindPapers();
    if (window.Tools) Tools.bind();
    markNav();
    window.scrollTo(0, 0);
  }

  function renderBoards() {
    var groups = {};
    BOARDS.forEach(function (b) { (groups[b.group] = groups[b.group] || []).push(b); });
    var html = '';
    ['national', 'state'].forEach(function (g) {
      if (!groups[g]) return;
      html += '<div class="board-group">' + esc(t('board_group_' + g)) + '</div>';
      groups[g].forEach(function (b) {
        html += '<button class="board-item' + (b.id === state.board ? ' on' : '') + '" data-id="' + b.id + '">' +
          '<span><span class="bn">' + esc(b.name) + '</span><br>' +
          '<span class="bf">' + esc(state.lang === 'en' ? (b.state_en || b.state) : b.state) + ' · ' + esc(b.exam) + '</span></span>' +
          '<span class="bf">' + esc(b.pattern) + '</span></button>';
      });
    });
    document.getElementById('boardList').innerHTML = html;
    document.querySelectorAll('.board-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.board = btn.dataset.id;
        var b = board();
        state.lang = b.lang || 'hi';
        storeSet('bp_board', state.board);
        storeSet('bp_lang', state.lang);
        document.getElementById('boardSheet').hidden = true;
        applyBoardData();
        applyContentLang();
        render();
      });
    });
  }

  function boot() {
    window.QS_FOR = qsFor;
    window.CHAPTERS_LIST = chapters;
    view.addEventListener('click', function (e) {
      var bmBtn = e.target.closest('[data-act="bookmark"]');
      if (bmBtn) {
        var bcard = bmBtn.closest('.qcard');
        var q = null;
        try {
          var bi = bcard && bcard.dataset.idx;
          if (state.quiz && bi === 'quiz') q = state.quiz.items[state.quiz.i];
          else if (bi !== undefined && bi !== 'quiz') q = (state.subjQs || [])[Number(bi)] || null;
        } catch (err) {}
        if (q && window.STUDY) {
          var on = window.STUDY.book(q);
          bmBtn.textContent = on ? '★' : '☆';
        }
        return;
      }
      var selfBtn = e.target.closest('[data-act="selfright"],[data-act="selfwrong"]');
      if (selfBtn) {
        var scard = selfBtn.closest('.qcard');
        if (scard && state.quiz && scard.dataset.idx === 'quiz') {
          var picked = selfBtn.dataset.act === 'selfright';
          if (quizMark(state.quiz.i, picked)) {
            scard.querySelectorAll('[data-act="selfright"],[data-act="selfwrong"]').forEach(function (b) {
              b.disabled = true;
              b.classList.toggle('on', (b.dataset.act === 'selfright') === picked);
            });
            var sn = document.getElementById('qzNext');
            if (sn) sn.hidden = false;
          }
        }
        return;
      }
      var ansBtn = e.target.closest('[data-act="ans"]');
      if (ansBtn) {
        var card = ansBtn.closest('.qcard');
        var box = card ? card.querySelector('.ansbox') : null;
        if (box) {
          box.hidden = !box.hidden;
          ansBtn.textContent = box.hidden ? t('show_answer') : t('hide_answer');
        }
        return;
      }
      var opt = e.target.closest('.opt');
      if (!opt) return;
      var card2 = opt.closest('.qcard');
      var rightIdx = Number(card2.dataset.ansidx);
      if (isNaN(rightIdx)) {
        var fb = card2.querySelector('.ansbox');
        if (fb) fb.hidden = false;
        return;
      }
      card2.querySelectorAll('.opt').forEach(function (o) {
        o.disabled = true;
        if (Number(o.dataset.k) === rightIdx) o.classList.add('right');
        else if (o === opt) o.classList.add('wrong');
        else o.classList.add('dim');
      });
      var ansBox = card2.querySelector('.ansbox');
      if (ansBox) ansBox.hidden = false;
      if (state.quiz && card2.dataset.idx === 'quiz') {
        quizMark(state.quiz.i, Number(opt.dataset.k) === rightIdx);
        var next = document.getElementById('qzNext');
        if (next) next.hidden = false;
      }
    });

    renderBoards();
    document.getElementById('boardChip').addEventListener('click', function () {
      document.getElementById('boardSheet').hidden = false;
    });
    document.getElementById('boardClose').addEventListener('click', function () {
      document.getElementById('boardSheet').hidden = true;
    });
    document.getElementById('boardSheet').addEventListener('click', function (e) {
      if (e.target === this) this.hidden = true;
    });
    document.getElementById('langBtn').addEventListener('click', function () {
      state.lang = state.lang === 'hi' ? 'en' : 'hi';
      storeSet('bp_lang', state.lang);
      applyContentLang();
      render();
    });
    window.addEventListener('hashchange', render);
    applyBoardData();
    applyContentLang();
    // ---- in-app update banner ----
    if (!document.getElementById('updBar')) {
      var bar = document.createElement('div');
      bar.id = 'updBar';
      bar.className = 'upd-bar';
      bar.hidden = true;
      bar.innerHTML = '<span class="upd-t"></span>' +
        '<button class="upd-btn" id="updBtn">' + esc(L('Update now', 'अपडेट करो')) + '</button>';
      document.body.insertBefore(bar, document.body.firstChild);
      document.getElementById('updBtn').addEventListener('click', function () {
        var u = bar.getAttribute('data-url') || '';
        if (!u) return;
        if (window.BPApp && window.BPApp.update) { window.BPApp.update(u); return; }   // APK: khud download + install
        window.location.href = u;                                                     // web: link kholo
      });
    }
    checkUpdate();
    // cloud API base (worker URL) — user khud daal sakta hai Profile se
    try {
      var ub = localStorage.getItem('bp_api_base');
      if (ub && window.Cloud) window.Cloud.setBase(ub);
    } catch (e) { }

    // ---- auto cloud sync (app background/band hone par, users ko kuch nahi karna) ----
    var cloudSave = function () {
      if (!window.Cloud || !window.Cloud.ready()) return;
      var auto = '1';
      try { auto = localStorage.getItem('bp_cs_auto'); if (auto === null) auto = '1'; } catch (e) { }
      if (auto === '0') return;
      var data = {};
      try {
        data = {
          study: (window.STUDY && window.STUDY.data) ? window.STUDY.data() : {},
          target: (window.STUDY && window.STUDY.targetGet) ? window.STUDY.targetGet() : null
        };
      } catch (e) { }
      window.Cloud.syncPush(data).catch(function () { });
    };
    window.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') cloudSave();
    });
    window.addEventListener('beforeunload', cloudSave);
    window.BP.cloudSave = cloudSave;

    // ---- pehli baar kholne par target setup (ek hi baar) ----
    try {
      var hasT = window.STUDY && window.STUDY.targetGet && window.STUDY.targetGet();
      var skipped = storeGet('bp_target_skip', '0') === '1';
      var hh = location.hash.replace(/^#/, '') || '/';
      if (!hasT && !skipped && (hh === '/' || hh === '')) {
        location.hash = '#/target';
      }
    } catch (e) { }

    // ---- reminder: har 30s check (device par hi, offline) ----
    if (window.STUDY && window.STUDY.remindCheck) {
      var remindTick = function () {
        var r = window.STUDY.remindCheck();
        if (r && window.toast) window.toast(r.body || 'Abhi padho!');
        if (r && 'Notification' in window && Notification.permission === 'granted') {
          try { new Notification(r.title || 'BoardPrep', { body: r.body }); } catch (e) {}
        }
      };
      remindTick();
      setInterval(remindTick, 30000);
    }
    render();
  }

  window.BP = {
    state: state, t: t, esc: esc, render: render, board: board,
    subj: subj, qsFor: qsFor, chapters: chapters, norm: norm, D: D,
    boardSubjects: boardSubjects, questionCard: questionCard, loadLazy: loadLazy
  };

  boot();
})();
