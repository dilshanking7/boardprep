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

    html += '<div class="stats">' +
      '<div class="stat"><b>' + total + '</b><span>' + esc(t('home_stats_q')) + '</span></div>' +
      '<div class="stat"><b>' + mcq + '</b><span>MCQ</span></div>' +
      '<div class="stat"><b>' + Object.keys(chap).length + '</b><span>' + esc(t('home_stats_chap')) + '</span></div>' +
      '<div class="stat"><b>' + BOARDS.length + '</b><span>' + esc(t('home_stats_boards')) + '</span></div></div>';

    if (storeGet('bp_apk', '0') !== '1' && location.href.indexOf('appassets.androidplatform.net') < 0) {
      html += '<a class="list-row apk-card" href="downloads/BoardPrep-v3.0.apk" download style="margin-bottom:12px;border-color:#c4b5fd;background:#f5f3ff"><div>' +
        '<div class="t">📱 ' + esc(L('Android app v3.0 — full offline', 'एंड्रॉयड ऐप v3.0 — पूरा ऑफ़लाइन')) + '</div>' +
        '<div class="s">' + esc(L('App me hi sab hai — PDF, 3D models, songs. Internet ke bina bhi.', 'ऐप में ही सब है — PDF, 3D models, songs। इंटरनेट के बिना भी।')) + '</div></div><span class="n">⬇</span></a>';
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
      '<span class="note">' + esc(b.name) + ' · ' + esc(b.pattern) + '</span></div>';
    if (b.id !== 'jac' && !bank()) {
      html += '<div class="imp-item" style="background:#fffbeb;border-color:#fcd34d"><div class="num" style="background:#fef3c7;color:#92400e">!</div><div>' +
        '<div class="iq">' + esc(L('Questions here come from the shared JAC bank, not your board papers.', 'यहाँ के प्रश्न साझा JAC bank से हैं, तुम्हारे board के अपने पेपर से नहीं।')) + '</div></div></div>';
    }

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

    html += '<div class="field"><label>' + esc(t('quiz_mode')) + '</label><div class="chips" id="qzMode">' +
      [['mix', t('mixed_practice')], ['mcq', t('mcq')], ['write', t('written')]].map(function (m, i) {
        return '<button class="fchip' + (i === 0 ? ' on' : '') + '" data-v="' + m[0] + '">' + esc(m[1]) + '</button>';
      }).join('') + '</div></div>';

    html += '<button class="btn btn-accent btn-block" id="qzStart">' + esc(t('quiz_start')) + '</button></section>';
    return html;
  }

  function vQuizRun() {
    var qz = state.quiz;
    var q = qz.items[qz.i];
    var p = Math.round((qz.i / qz.items.length) * 100);
    var html = '<div class="quiz-top"><div class="progress"><i style="width:' + p + '%"></i></div>' +
      '<div class="quiz-meta">' + (qz.i + 1) + '/' + qz.items.length + '</div></div>';
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
      state.subjChap = chapSel.value; state.shown = 40; render();
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
      state.qzSubj = 'all'; state.qzCount = 10; state.qzMode = 'mix';
      start.addEventListener('click', function () {
        var items = pickQuiz(state.qzSubj, document.getElementById('qzChap').value,
          state.qzCount, state.qzMode);
        if (!items.length) return;
        state.quiz = { items: items, i: 0, right: 0, ok: {} };
        render();
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
    var cur = h.split('/')[0] || '';
    var map = { '': 'home', 'learn': 'learn', 'subjects': 'learn', 'subject': 'learn', 'stories': 'learn', 'notes': 'learn', 'note': 'learn', 'help': 'learn',
      'practice': 'practice', 'quiz': 'practice', 'papers': 'practice', 'important': 'practice', 'exam': 'practice',
      'progress': 'progress', 'revision': 'progress', 'assistant': 'progress',
      'profile': 'profile', 'settings': 'profile' };
    var on = map[cur] || 'home';
    document.querySelectorAll('.bottomnav a').forEach(function (a) {
      a.classList.toggle('on', a.dataset.nav === on);
    });
  }

  function render() {
    view.innerHTML = route();
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
    render();
  }

  window.BP = {
    state: state, t: t, esc: esc, render: render, board: board,
    subj: subj, qsFor: qsFor, chapters: chapters, norm: norm, D: D,
    boardSubjects: boardSubjects, questionCard: questionCard
  };

  boot();
})();
