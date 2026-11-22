/* Tools pages — formulas, periodic, lab, mathlab, diagrams, timeline, stories, brain */
(function () {
  var BP = window.BP;
  var t = BP.t, esc = BP.esc, state = BP.state;
  function L(en, hi) { return state.lang === 'en' ? en : (hi == null ? en : hi); }
  function pick(hi, en) { return state.lang === 'en' ? (en || hi) : (hi || en); }

  function chapList(subjKey) {
    var seen = [], hit = {};
    BP.qsFor(subjKey).forEach(function (q) {
      var c = q.chap || q.part || '';
      if (c && !hit[c]) { hit[c] = 1; seen.push(c); }
    });
    return seen;
  }

  // stories ke liye sirf asli chapter/section naam (data-source categories nahi)
  function storyChapters(subjKey) {
    var bad = ['प्रश्न', 'उत्तरीय', 'Bank', 'Objective', 'MCQ', 'पुनरीक्षण', 'उद्धरण', 'मुख्य बातें'];
    return chapList(subjKey).filter(function (c) {
      return !bad.some(function (b) { return c.indexOf(b) >= 0; });
    });
  }


  function keyPoints(subjKey, chap) {
    var pts = [];
    BP.qsFor(subjKey).forEach(function (q) {
      if ((q.chap || q.part || '') !== chap) return;
      var s = String(q.q || '').trim();
      if (s.length > 120) s = s.slice(0, 118) + '…';
      if (s) pts.push(s);
      if (pts.length >= 6) return;
    });
    return pts;
  }

  function goSubjectChap(subjKey, chap) {
    state.subjKey = subjKey;
    state.subjChap = chap;
    state.subjType = 'all';
    state.shown = 200;
    location.hash = '#/subject/' + subjKey;
  }

  /* ---------------- tools hub ---------------- */

  function vTools() {
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('tools_title')) + '</h2>' +
      '<span class="note">' + esc(t('tools_sub')) + '</span></div><div class="hub">';
    var items = [
      ['#/quiz', 'pencil', t('nav_quiz'), t('hub_quiz_sub')],
      ['#/models', 'cube', '3D ' + t('models_word'), t('hub_models_sub')],
      ['#/formulas', 'sigma', t('tool_formulas'), t('tool_formulas_s')],
      ['#/periodic', 'atom', t('tool_periodic'), t('tool_periodic_s')],
      ['#/lab', 'flask', t('tool_lab'), t('tool_lab_s')],
      ['#/mathlab', 'calc', t('tool_mathlab'), t('tool_mathlab_s')],
      ['#/diagrams', 'target', t('tool_diagrams'), t('tool_diagrams_s')],
      ['#/timeline', 'timeline', t('tool_timeline'), t('tool_timeline_s')],
      ['#/stories', 'book', t('tool_stories'), t('tool_stories_s')],
      ['#/songs', 'music', t('hub_songs'), t('hub_songs_sub')],
      ['#/brain', 'bulb', t('tool_brain'), t('tool_brain_s')],
      ['#/important', 'star', t('tool_important'), t('tool_important_s')],
      ['#/papers', 'papers', t('tool_pdfs'), t('tool_pdfs_s')],
      ['#/search', 'search', t('nav_search'), t('home_search_btn')],
      ['#/help', 'check', t('hub_help'), t('hub_help_sub')],
      ['#/notes', 'book', t('hub_notes'), t('hub_notes_sub')],
      ['#/progress', 'chart', t('hub_progress'), t('hub_progress_sub')],
      ['#/exam', 'timer', t('hub_exam'), t('hub_exam_sub')],
      ['#/revision', 'refresh', t('hub_revision'), t('hub_revision_sub')],
      ['#/assistant', 'sparkle', t('hub_assistant'), t('hub_assistant_sub')]
    ];
    items.forEach(function (x) {
      var ic = (window.BP_ICONS && window.BP_ICONS[x[1]]) ? BP_ICON(x[1]) : x[1];
      html += '<a class="hub-card" href="' + x[0] + '"><span class="hub-ico">' + ic + '</span>' +
        '<span><span class="ht">' + esc(x[2]) + '</span><br><span class="hs">' + esc(x[3]) + '</span></span></a>';
    });
    html += '</div>';
    html += '<div class="imp-item" style="margin-top:12px;background:#f0fdf4;border-color:#bbf7d0">' +
      '<div class="num" style="background:#dcfce7;color:#166534">⬇</div><div>' +
      '<div class="iq">' + esc(L('Sab offline karo', 'सब ऑफ़लाइन करो')) + '</div>' +
      '<div class="note">' + esc(L('PDF + songs phone me save — internet band ho to bhi chalे', 'PDF + songs फ़ोन में सेव — इंटरनेट बंद हो तो भी चले')) + '</div>' +
      '<button class="btn btn-accent" id="offBtn" style="margin-top:8px;padding:10px 14px">' + esc(L('Offline download', 'ऑफ़लाइन डाउनलोड')) + '</button>' +
      '<div class="note" id="offStat"></div></div></div>';
    return html + '</section>';
  }

  /* ---------------- formulas ---------------- */

  function vFormulas(subj) {
    var F = window.FORMULAS || [];
    if (!F.length) return '<section class="section"><div class="empty">'+L('No formula data available.', 'सूत्र डेटा उपलब्ध नहीं है।')+'</div></section>';
    var list = subj && subj !== 'all' ? F.filter(function (x) { return x.subj === subj; }) : F;
    var subs = [];
    F.forEach(function (x) { if (subs.indexOf(x.subj) === -1) subs.push(x.subj); });
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('formulas_title')) + '</h2>' +
      '<span class="note">' + list.length + ' ' + (state.lang === 'en' ? 'chapters' : 'अध्याय') + '</span></div>';
    html += '<div class="chips"><button class="fchip' + (!subj || subj === 'all' ? ' on' : '') + '" data-fsub="all">' +
      esc(t('formulas_all')) + '</button>' + subs.map(function (s) {
        var nm = pick((BP.subj(s) || {}).name, (BP.subj(s) || {}).en) || s;
        return '<button class="fchip' + (subj === s ? ' on' : '') + '" data-fsub="' + s + '">' + esc(nm) + '</button>';
      }).join('') + '</div>';

    list.forEach(function (sec) {
      html += '<div class="board-group">' + (state.lang === 'en' ? esc(sec.en || sec.chap) : esc(sec.chap) + ' · ' + esc(sec.en || '')) + '</div>';
      sec.items.forEach(function (it) {
        html += '<div class="formula-item"><div class="fn">' + esc(it.name) + '</div>' +
          '<div class="ff">' + esc(it.f) + '</div>' +
          (it.note ? '<div class="fnote">' + esc(it.note) + '</div>' : '') +
          (it.trick ? '<div class="ftrick">💡 ' + esc(it.trick) + '</div>' : '') + '</div>';
      });
    });
    return html + '</section>';
  }

  /* ---------------- periodic ---------------- */

  function catColor(cat) {
    var m = {
      alkali: '#ef4444', alkaline: '#f97316', transition: '#eab308', 'post-transition': '#84cc16',
      metalloid: '#14b8a6', nonmetal: '#22c55e', halogen: '#06b6d4', noble: '#8b5cf6',
      lanthanide: '#ec4899', actinide: '#a855f7'
    };
    return m[cat] || '#64748b';
  }

  function ptCell(e) {
    return '<button class="pt-cell" data-el="' + e.n + '" style="border-color:' + catColor(e.cat) + '">' +
      '<span class="no">' + e.n + '</span><span class="sym">' + esc(e.s) + '</span></button>';
  }

  function stateOf(el, temp) {
    if (temp <= el.mp) return ['solid', t('p_solid')];
    if (temp <= el.bp) return ['liquid', t('p_liquid')];
    return ['gas', t('p_gas')];
  }

  function vPeriodic() {
    var P = window.PERIODIC || [];
    if (!P.length) return '<section class="section"><div class="empty">'+L('No periodic table data available.', 'आवर्त सारणी का डेटा उपलब्ध नहीं है।')+'</div></section>';
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('periodic_title')) + '</h2>' +
      '<span class="note">' + esc(t('periodic_sub')) + '</span></div>';

    html += '<div class="pt-legend">' + ['alkali', 'alkaline', 'transition', 'metalloid', 'nonmetal', 'halogen', 'noble', 'lanthanide', 'actinide'].map(function (c) {
      var nm = { alkali: L('Alkali', 'तालकीय'), alkaline: L('Alkaline', 'क्षारीय मिश्र'), transition: L('Transition metal', 'संक्रमण धातु'), metalloid: L('Metalloid', 'अर्धधातु'), nonmetal: L('Non-metal', 'अधातु'), halogen: L('Halogen', 'हैलोजन'), noble: L('Noble gas', 'कांज्य गैस'), lanthanide: L('Lanthanide', 'लैंथेनाइड'), actinide: L('Actinide', 'एक्टिनाइड') }[c] || c;
      return '<span><i style="background:' + catColor(c) + '"></i>' + nm + '</span>';
    }).join('') + '</div>';

    html += '<div class="pt-wrap"><div class="pt-grid">';
    for (var p = 1; p <= 7; p++) {
      for (var g = 1; g <= 18; g++) {
        var found = null;
        P.forEach(function (e) {
          if (e.cat === 'lanthanide' || e.cat === 'actinide') return;
          if (e.p === p && e.g === g) found = found || e;
        });
        if (!found) { html += '<div class="pt-cell gap"></div>'; continue; }
        html += ptCell(found);
      }
    }
    html += '</div>';
    var lan = P.filter(function (e) { return e.cat === 'lanthanide'; });
    var act = P.filter(function (e) { return e.cat === 'actinide'; });
    if (lan.length) {
      html += '<div style="margin-top:10px"><div class="pt-label">'+L('Lanthanides (57-71)', 'लैंथेनाइड (57-71)')+'</div>' +
        '<div class="pt-grid" style="grid-template-columns:repeat(15,34px)">' + lan.map(ptCell).join('') + '</div></div>';
    }
    if (act.length) {
      html += '<div style="margin-top:8px"><div class="pt-label">'+L('Actinides (89-103)', 'एक्टिनाइड (89-103)')+'</div>' +
        '<div class="pt-grid" style="grid-template-columns:repeat(15,34px)">' + act.map(ptCell).join('') + '</div></div>';
    }
    html += '</div>';
    html += '<div id="elPanel"><div class="empty">'+L('Tap an element — full details will appear here.', 'किसी तत्व पर टैप करें — पूरा विवरण यहाँ दिखेगा।')+'</div></div>';
    return html + '</section>';
  }

  function renderElement(n) {
    var P = window.PERIODIC || [];
    var el = P.filter(function (e) { return e.n === Number(n); })[0];
    if (!el) return;
    var panel = document.getElementById('elPanel');
    var st = stateOf(el, state.temp == null ? 30 : state.temp);
    var catNm = { alkali: L('Alkali'), alkaline: L('Alkaline'), transition: L('Transition metal'), 'post-transition': L('Post-transition'), metalloid: L('Metalloid'), nonmetal: L('Non-metal'), halogen: L('Halogen'), noble: L('Noble gas'), lanthanide: L('Lanthanide'), actinide: L('Actinide') }[el.cat] || el.cat;
    var html = '<div class="el-head"><div class="el-sym" style="background:' + catColor(el.cat) + '">' +
      esc(el.s) + '<small>' + el.n + '</small></div><div class="el-title"><h3>' + esc(el.hi || el.en) + '</h3>' +
      '<div class="en">' + esc(el.en) + '</div></div></div>';
    html += '<div class="el-grid">' +
      '<div class="el-kv"><b>' + el.m + '</b><span>' + esc(t('p_mass')) + '</span></div>' +
      '<div class="el-kv"><b>' + el.n + '</b><span>' + esc(t('p_no')) + '</span></div>' +
      '<div class="el-kv"><b>' + (el.g || '—') + '</b><span>' + esc(t('p_group')) + '</span></div>' +
      '<div class="el-kv"><b>' + el.p + '</b><span>' + esc(t('p_period')) + '</span></div>' +
      '<div class="el-kv"><b>' + esc(catNm) + '</b><span>' + esc(t('p_cat')) + '</span></div>' +
      '<div class="el-kv"><b>' + el.d + '</b><span>' + esc(t('p_density')) + ' g/cm³</span></div>' +
      '<div class="el-kv"><b>' + el.mp + '°</b><span>' + esc(t('p_melt')) + ' °C</span></div>' +
      '<div class="el-kv"><b>' + el.bp + '°</b><span>' + esc(t('p_boil')) + ' °C</span></div></div>';

    html += '<div class="temp-ctl"><label>' + esc(t('p_temp')) + '</label>' +
      '<input type="range" id="tempRange" min="-300" max="6000" step="10" value="' + (state.temp == null ? 30 : state.temp) + '">' +
      '<div class="temp-val"><span id="tempVal">' + (state.temp == null ? 30 : state.temp) + '</span> °C · <span id="tempState">' + esc(st[1]) + '</span></div>' +
      '<div class="note">' + esc(t('p_state')) + ': <b id="tempState2">' + esc(st[1]) + '</b></div></div>';

    if (el.comp) html += '<div class="el-block"><h4>' + esc(t('p_comp')) + '</h4><div>' + esc(el.comp) + '</div></div>';
    if (el.use) html += '<div class="el-block"><h4>' + esc(t('p_uses')) + '</h4><div>' + esc(el.use) + '</div></div>';
    if (el.desc) html += '<div class="el-block"><h4>' + esc(t('p_desc')) + '</h4><div>' + esc(el.desc) + '</div></div>';
    panel.innerHTML = html;

    var range = document.getElementById('tempRange');
    if (range) range.addEventListener('input', function () {
      state.temp = Number(range.value);
      var s2 = stateOf(el, state.temp);
      document.getElementById('tempVal').textContent = state.temp;
      document.getElementById('tempState').textContent = s2[1];
      document.getElementById('tempState2').textContent = s2[1];
    });
  }

  /* ---------------- chemistry lab ---------------- */

  function vLab() {
    var L = window.LAB || null;
    if (!L || !L.reagents) return '<section class="section"><div class="empty">'+L('No lab data available.', 'लैब डेटा उपलब्ध नहीं है।')+'</div></section>';
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('lab_title')) + '</h2>' +
      '<span class="note">' + esc(t('lab_sub')) + '</span></div>';
    html += '<div class="lab-bench"><div class="lab-drop" id="slotA">' + esc(t('lab_drop')) + '</div>' +
      '<div class="lab-drop" id="slotB">' + esc(t('lab_drop')) + '</div></div>';
    html += '<div style="display:flex;gap:10px;margin-top:12px">' +
      '<button class="btn btn-accent" id="labMix" style="flex:1">' + esc(t('lab_mix')) + '</button>' +
      '<button class="btn btn-ghost" id="labClear" style="flex:1">' + esc(t('lab_clear')) + '</button></div>';
    html += '<div class="lab-out" id="labOut"></div>';
    html += '<div class="board-group" style="margin-top:18px">' + esc(t('lab_reagents')) + '</div>';
    html += '<div class="lab-reagents">' + L.reagents.map(function (r) {
      return '<button class="reagent-chip" draggable="true" data-r="' + esc(r.id) + '">' + esc(pick(r.hi, r.name)) +
        ' <span style="color:var(--muted);font-weight:600">' + esc(r.f || '') + '</span></button>';
    }).join('') + '</div>';
    return html + '</section>';
  }

  function reagentById(id) {
    var L = window.LAB || { reagents: [] };
    return L.reagents.filter(function (r) { return r.id === id; })[0];
  }

  function mixReagents() {
    var a = reagentById(state.labA), b = reagentById(state.labB);
    var out = document.getElementById('labOut');
    if (!a || !b) { out.innerHTML = '<div class="empty">'+L('Pick two substances first.', 'पहले दो पदार्थ चुनो।')+'</div>'; return; }
    var L = window.LAB;
    var hit = null;
    (L.reactions || []).forEach(function (r) {
      if ((r.a === a.id && r.b === b.id) || (r.a === b.id && r.b === a.id)) hit = r;
    });
    if (!hit) {
      out.innerHTML = '<div class="empty">' + esc(t('lab_none')) + '</div>';
      return;
    }
    var eq = a.f + ' + ' + b.f + ' → ' + hit.out.map(function (o) { return o.f; }).join(' + ');
    var html = '<div class="lab-eq">' + esc(eq) + '</div>';
    html += '<div style="text-align:center"><span class="badge lab-type">' + esc(hit.type) + '</span></div>';
    html += '<div class="card" style="margin-top:12px"><div class="board-group" style="margin-top:0">'+L('Products', 'बने पदार्थ')+'</div>' +
      hit.out.map(function (o) {
        return '<div class="result-row"><span>' + esc(pick(o.hi, o.name)) + '</span><b>' + esc(o.f) + '</b></div>';
      }).join('') + '</div>';
    html += '<div class="card"><div class="board-group" style="margin-top:0">'+L('What happened', 'क्या हुआ')+'</div>' +
      '<div style="font-size:14px;line-height:1.6">' + esc(hit.desc || '') + '</div>' +
      (hit.cond ? '<div class="note">' + L('Condition: ', 'शर्त: ') + esc(hit.cond) + '</div>' : '') + '</div>';
    out.innerHTML = html;
  }

  /* ---------------- math lab ---------------- */

  function vMathLab() {
    var F = window.FORMULAS || [];
    var items = [];
    F.forEach(function (sec) { if (sec.subj === 'maths') sec.items.forEach(function (it) { items.push(it); }); });
    if (!items.length) return '<section class="section"><div class="empty">'+L('No formula data available.', 'सूत्र डेटा उपलब्ध नहीं है।')+'</div></section>';
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('mathlab_title')) + '</h2>' +
      '<span class="note">' + esc(t('mathlab_sub')) + '</span></div>';
    items.slice(0, 40).forEach(function (it, i) {
      html += '<div class="ml-q"><div class="mq">' + (i + 1) + '. ' + esc(it.name) + '</div>' +
        '<div class="mf">' + esc(it.f) + '</div>' +
        '<input type="text" inputmode="decimal" data-ml="' + i + '" placeholder="' + L('Type your answer here', 'अपना उत्तर यहाँ लिखो') + '">' +
        '<div class="note" data-mlout="' + i + '"></div></div>';
    });
    html += '<button class="btn btn-accent btn-block" id="mlCheck">' + esc(t('mathlab_check')) + '</button>';
    html += '<div class="card" style="margin-top:14px"><div class="board-group" style="margin-top:0">' + esc(t('mathlab_write')) + '</div>' +
      '<textarea class="ml-write" placeholder="' + esc(t('mathlab_write_hint')) + '"></textarea></div>';
    return html + '</section>';
  }

  /* ---------------- diagrams ---------------- */

  function dgSvg(d) {
    // simple labelled canvas; hotspots are the tappable parts
    var parts = d.parts || [];
    var shapes = '';
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var x = p.x, y = p.y;
      shapes += '<g class="dg-hot" data-part="' + esc(p.id) + '">' +
        '<circle cx="' + x + '" cy="' + y + '" r="9" fill="#38bdf8" fill-opacity=".85" stroke="#0f172a" stroke-width="1.2"/>' +
        '<text x="' + x + '" y="' + (y + 3) + '" text-anchor="middle" font-size="8" font-weight="700" fill="#0f172a">' + (i + 1) + '</text></g>';
    }
    var bg = '';
    if (d.id === 'eye') {
      bg = '<ellipse cx="50" cy="50" rx="34" ry="24" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>' +
        '<circle cx="50" cy="50" r="11" fill="#bfdbfe" stroke="#3b82f6" stroke-width="1.5"/>' +
        '<circle cx="50" cy="50" r="5" fill="#0f172a"/>';
    } else if (d.id === 'heart') {
      bg = '<path d="M50 78 C20 58 22 32 38 30 C46 29 50 36 50 40 C50 36 54 29 62 30 C78 32 80 58 50 78Z" fill="#fecaca" stroke="#ef4444" stroke-width="1.5"/>';
    } else if (d.id === 'flower') {
      bg = '<circle cx="50" cy="50" r="8" fill="#fde68a" stroke="#f59e0b"/>' +
        [0, 60, 120, 180, 240, 300].map(function (a) {
          return '<ellipse cx="' + (50 + 16 * Math.cos(a * Math.PI / 180)) + '" cy="' + (50 + 16 * Math.sin(a * Math.PI / 180)) + '" rx="9" ry="14" fill="#fbcfe8" stroke="#ec4899" transform="rotate(' + a + ' ' + (50 + 16 * Math.cos(a * Math.PI / 180)) + ' ' + (50 + 16 * Math.sin(a * Math.PI / 180)) + ')"/>';
        }).join('');
    } else if (d.id === 'circuit') {
      bg = '<rect x="18" y="30" width="64" height="40" fill="none" stroke="#94a3b8" stroke-width="2"/>' +
        '<circle cx="50" cy="30" r="4" fill="#facc15" stroke="#a16207"/>' +
        '<rect x="44" y="66" width="12" height="8" fill="#cbd5e1" stroke="#64748b"/>';
    } else {
      bg = '<rect x="18" y="22" width="64" height="56" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>' +
        '<line x1="18" y1="40" x2="82" y2="40" stroke="#cbd5e1"/>' +
        '<line x1="18" y1="60" x2="82" y2="60" stroke="#cbd5e1"/>';
    }
    return '<svg viewBox="0 0 100 100" role="img" aria-label="' + esc(d.title) + '">' + bg + shapes + '</svg>';
  }

  function vDiagrams(id) {
    var G = window.DIAGRAMS || [];
    if (!G.length) return '<section class="section"><div class="empty">'+L('No diagram data available.', 'डायग्राम डेटा उपलब्ध नहीं है।')+'</div></section>';
    if (!id) {
      var html = '<section class="section"><div class="section-head"><h2>' + esc(t('diagrams_title')) + '</h2>' +
        '<span class="note">' + esc(t('diagrams_sub')) + '</span></div>';
      G.forEach(function (d) {
        html += '<a class="list-row" href="#/diagram/' + esc(d.id) + '"><div>' +
          '<div class="t">' + esc(pick(d.hi, d.title)) + '</div>' +
          '<div class="s">' + esc(d.title) + ' · ' + (d.parts || []).length + ' ' + L('parts', 'भाग') + '</div></div>' +
          '<span class="n">→</span></a>';
      });
      return html + '</section>';
    }
    var d = G.filter(function (x) { return x.id === id; })[0];
    if (!d) return '<div class="empty">404</div>';
    var html = '<a class="backlink" href="#/diagrams">← ' + esc(t('back')) + '</a>' +
      '<div class="section-head"><h2>' + esc(pick(d.hi, d.title)) + '</h2>' +
      '<span class="note">' + esc(t('diagrams_hint')) + '</span></div>';
    html += '<div class="dg-wrap">' + dgSvg(d) + '</div>';
    if (d.desc) html += '<div class="card">' + esc(d.desc) + '</div>';
    html += '<div id="dgInfo"><div class="empty">'+L('Tap a numbered part.', 'किसी नंबर वाले हिस्से पर टैप करें।')+'</div></div>';
    html += '<div class="board-group">'+L('All parts', 'सभी भाग')+'</div>' + (d.parts || []).map(function (p, i) {
      return '<div class="chap-item" data-part="' + esc(p.id) + '"><div><div class="cn">' + (i + 1) + '. ' + esc(pick(p.hi, p.label)) + '</div>' +
        '<div class="cs">' + esc(p.label) + '</div></div></div>';
    }).join('');
    return html;
  }

  function showPart(d, pid) {
    var p = (d.parts || []).filter(function (x) { return x.id === pid; })[0];
    var box = document.getElementById('dgInfo');
    if (!p || !box) return;
    box.innerHTML = '<div class="dg-info"><h4>' + esc(pick(p.hi, p.label)) + (state.lang === 'en' ? '' : ' · ' + esc(p.label)) + '</h4>' +
      '<p>' + esc(p.desc || '') + '</p></div>';
  }

  /* ---------------- timeline ---------------- */

  function vTimeline() {
    var T = window.TIMELINE || [];
    if (!T.length) return '<section class="section"><div class="empty">'+L('No timeline data available.', 'टाइमलाइन डेटा उपलब्ध नहीं है।')+'</div></section>';
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('timeline_title')) + '</h2>' +
      '<span class="note">' + esc(t('timeline_sub')) + '</span></div>';
    T.forEach(function (era) {
      html += '<div class="board-group">' + esc(pick(era.era, era.en)) + '</div><div class="tl">';
      (era.events || []).slice().sort(function (a, b) { return String(a.year).localeCompare(String(b.year)); })
        .forEach(function (e) {
          html += '<div class="tl-item"><div class="tl-year">' + esc(e.year) + '</div>' +
            '<h4>' + esc(pick(e.hi, e.title)) + '</h4>' +
            '<p>' + esc(e.desc || '') + '</p></div>';
        });
      html += '</div>';
    });
    return html + '</section>';
  }

  /* ---------------- stories ---------------- */

  var STORY_SUBS = ['hindi', 'english', 'sanskrit'];

  function storyList(k) {
    if (window.STORIES && window.STORIES[k] && window.STORIES[k].length) return window.STORIES[k];
    return storyChapters(k).map(function (c) { return { t: c }; });
  }

  function storyBody(k, name) {
    return (window.STORIES && window.STORIES[k] || []).filter(function (x) { return x.t === name; })[0] || null;
  }

  function vStories(subjKey, chap) {
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('stories_title')) + '</h2>' +
      '<span class="note">' + esc(t('stories_sub')) + '</span></div>';
    html += '<div class="chips">' + STORY_SUBS.map(function (k) {
      var s = BP.subj(k) || {};
      return '<button class="fchip" data-story="' + k + '">' + esc(pick(s.name, s.en) || k) + '</button>';
    }).join('') + '</div>';
    var k = subjKey || STORY_SUBS[0];
    var list = storyList(k);
    var s = BP.subj(k) || {};
    html += '<div class="board-group">' + esc(pick(s.name, s.en) || k) + ' · ' + list.length + ' ' +
      (list.length === 1 ? (state.lang === 'en' ? 'chapter' : 'अध्याय') : L('chapters', 'अध्याय')) + '</div>';
    if (chap) {
      var it = storyBody(k, chap);
      var pts = keyPoints(k, chap);
      var nq = BP.qsFor(k).filter(function (q) { return (q.chap || q.part) === chap; }).length;
      html += '<div class="story"><h3>' + esc(chap) + '</h3>';
      if (it && it.a) html += '<div class="smeta">' + esc(pick(it.a, it.a)) + '</div>';
      if (it && it.hi) html += '<p>' + esc(pick(it.hi, it.en)) + '</p>';
      html += '<div class="smeta">' + pts.length + ' ' + L('key points', 'मुख्य बातें') +
        (nq ? ' · ' + nq + ' ' + L('questions', 'प्रश्न') : '') + '</div>';
      html += pts.map(function (p) { return '<p>• ' + esc(p) + '</p>'; }).join('');
      if (nq) html += '<button class="story-link" data-prac="' + esc(k) + '" data-chap="' + esc(chap) + '">▶ ' +
        esc(t('story_practice')) + ' (' + nq + ')</button>';
      html += '<button class="btn" style="margin-top:10px" onclick="location.hash=\'#/stories/' + k + '\'">← ' +
        esc(L('Back', 'वापस')) + '</button></div>';
      return html + '</section>';
    }
    list.forEach(function (it) {
      var name = it.t || it;
      var nq = BP.qsFor(k).filter(function (q) { return (q.chap || q.part) === name; }).length;
      var sub = (it.a ? it.a + ' · ' : '') +
        (it.hi ? (state.lang === 'en' ? 'summary' : 'सारांश') : (nq ? nq + ' ' + L('questions', 'प्रश्न') : ''));
      html += '<a class="list-row" href="#/story/' + k + '?c=' + encodeURIComponent(name) + '"><div>' +
        '<div class="t">' + esc(name) + '</div>' +
        '<div class="s">' + esc(sub) + '</div></div><span class="n">→</span></a>';
    });
    return html + '</section>';
  }

  /* ---------------- notes ---------------- */

  var NOTE_SUBS = ['science', 'maths', 'sst_history', 'sst_geo', 'sst_civics', 'sst_econ', 'sst_jharkhand', 'hindi', 'english', 'sanskrit'];

  function noteSubName(k) {
    var m = {
      science: 'विज्ञान', maths: 'गणित', sst_history: 'इतिहास', sst_geo: 'भूगोल',
      sst_civics: 'नागरिकशास्त्र', sst_econ: 'अर्थशास्त्र', sst_jharkhand: 'झारखंड', hindi: 'हिंदी', english: 'English', sanskrit: 'संस्कृत'
    };
    return m[k] || k;
  }

  function renderBlocks(blocks) {
    var h = '';
    blocks.forEach(function (b) {
      var t = b[0];
      if (t === 'h2') h += '<h2 class="nt-h2">' + esc(b[1]) + '</h2>';
      else if (t === 'h3') h += '<h3 class="nt-h3">' + esc(b[1]) + '</h3>';
      else if (t === 'p') h += '<p class="nt-p">' + esc(b[1]) + '</p>';
      else if (t === 'ul') h += '<ul class="nt-ul">' + b[1].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
      else if (t === 'hl') h += '<div class="nt-hl" style="border-left-color:' + (b[2] || '#7c3aed') + ';background:' + (b[2] || '#7c3aed') + '14">' + esc(b[1]) + '</div>';
      else if (t === 'box') h += '<div class="nt-box"><b>' + esc(b[1]) + '</b><p>' + esc(b[2]) + '</p></div>';
      else if (t === 'link') h += '<a class="nt-link" href="' + esc(b[2]) + '">' + esc(b[1]) + '</a>';
      else if (t === 'ten') h += '<div class="nt-ten"><b>' + esc(L('10 zaroori points', '10 ज़रूरी बातें')) + '</b><ol>' + b[1].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></div>';
      else if (t === 'qa') h += '<div class="nt-qa"><b>' + esc(L('Board-style prashn', 'बोर्ड-शैली प्रश्न')) + '</b><div class="q">' + esc(b[1]) + '</div><div class="a">' + esc(b[2]) + '</div></div>';
    });
    return h;
  }

  function vNotes(sub) {
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('notes_title')) + '</h2>' +
      '<span class="note">' + esc(t('notes_sub')) + '</span></div>';
    if (!sub) {
      html += '<div class="chips">' + NOTE_SUBS.map(function (k) {
        var n = ((window.NOTES || {})[k] || []).length;
        return '<a class="fchip" href="#/notes/' + k + '">' + esc(noteSubName(k)) + ' (' + n + ')</a>';
      }).join('') + '</div>';
      var tot = NOTE_SUBS.reduce(function (s, k) { return s + ((window.NOTES || {})[k] || []).length; }, 0);
      html += '<div class="imp-item" style="background:#f5f3ff;border-color:#c7d2fe"><div class="num" style="background:#e0e7ff;color:#3730a3">' + tot + '</div><div>' +
        '<div class="iq">' + esc(L('कुल chapter notes', 'कुल अध्याय नोट्स')) + '</div>' +
        '<div class="note">' + esc(L('हर subject → हर chapter → रंगबिरंगा notes', 'हर subject → हर chapter → रंगीले notes')) + '</div></div></div>';
      return html + '</section>';
    }
    var list = (window.NOTES || {})[sub] || [];
    html += '<div class="chips"><a class="fchip" href="#/notes">← ' + esc(t('back')) + '</a>' + NOTE_SUBS.filter(function (k) { return k !== sub; }).map(function (k) {
      return '<a class="fchip" href="#/notes/' + k + '">' + esc(noteSubName(k)) + '</a>';
    }).join('') + '</div>';
    html += '<div class="board-group">' + esc(noteSubName(sub)) + ' · ' + list.length + ' ' + L('chapters', 'अध्याय') + '</div>';
    list.forEach(function (it) {
      html += '<a class="list-row" href="#/note/' + sub + '/' + encodeURIComponent(it.ch) + '"><div>' +
        '<div class="t">' + esc(it.ch) + '</div>' +
        '<div class="s">' + (it.blocks.filter(function (b) { return b[0] === 'p'; })[0] ? esc(it.blocks.filter(function (b) { return b[0] === 'p'; })[0][1].slice(0, 60)) + '…' : '') + '</div></div>' +
        '<span class="n">→</span></a>';
    });
    return html + '</section>';
  }

  function vNoteDetail(sub, ch) {
    var it = ((window.NOTES || {})[sub] || []).filter(function (x) { return x.ch === ch; })[0];
    if (!it) return '<section class="section"><div class="empty">404</div></section>';
    var html = '<section class="section"><div class="section-head"><h2>' + esc(ch) + '</h2>' +
      '<span class="note">' + esc(noteSubName(sub)) + '</span></div>';
    html += renderBlocks(it.blocks);
    html += '<div class="chips" style="margin-top:12px">' +
      '<a class="fchip" href="#/notes/' + sub + '">← ' + esc(noteSubName(sub)) + '</a>' +
      '<a class="fchip" href="#/notes">सभी notes</a></div>';
    return html + '</section>';
  }

  /* ---------------- learn / practice / profile ---------------- */

  function hubGrid(items) {
    return '<div class="grid grid-3 hub-grid">' + items.map(function (x) {
      return '<a class="hub-card" href="' + x[0] + '"><span class="hub-ico" data-icon="' + x[1] + '"></span>' +
        '<span class="hub-tx">' + esc(x[2]) + '</span>' +
        (x[3] ? '<span class="hub-sub">' + esc(x[3]) + '</span>' : '') + '</a>';
    }).join('') + '</div>';
  }

  function vLearn() {
    var b = BP.board();
    var subs = BP.boardSubjects ? BP.boardSubjects() : (window.SUBJECTS || []);
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Seekhein', 'सीखें')) + '</h2>' +
      '<span class="note">' + esc(b.name) + ' · ' + esc(b.medium || '') + '</span></div>';
    h += '<div class="grid grid-3">' + subs.map(function (s) {
      return '<a class="subj-card card" href="#/subject/' + esc(s.key) + '" style="--sc:' + esc(s.color) + '">' +
        '<span class="subj-ic" style="background:' + esc(s.color) + '1a;color:' + esc(s.color) + '">' + esc(s.icon || s.name[0]) + '</span>' +
        '<h3>' + esc(window.BP.state.lang === 'en' ? (s.en || s.name) : s.name) + '</h3>' +
        '<p>' + esc(L('Chapters + notes + practice', 'अध्याय + नोट्स + अभ्यास')) + '</p>' +
        '<div class="count">' + (window.QS_FOR ? window.QS_FOR(s.key).length : 0) + ' ' + esc(L('questions', 'सवाल')) + '</div></a>';
    }).join('') + '</div>';
    h += '<div class="board-group">' + esc(L('Learning resources', 'सीखने के साधन')) + '</div>';
    h += hubGrid([
      ['#/notes', 'book', L('Chapter notes', 'अध्याय नोट्स'), L('131 chapters', '131 अध्याय')],
      ['#/stories', 'library', L('Textbook stories', 'पाठ्यपुस्तक कहानी'), L('81 chapters', '81 अध्याय')],
      ['#/diagrams', 'target', L('Diagrams', 'चित्र'), L('20 interactive', '20 इंटरैक्टिव')],
      ['#/models', 'cube', L('3D models', '3D मॉडल'), L('Biology + Physics', 'जीव + भौतिक')],
      ['#/formulas', 'sigma', L('Formulas', 'सूत्र'), L('127 formulas', '127 सूत्र')],
      ['#/calc', 'wrench', L('Subject tools', 'विषय टूल'), L('offline calculator', 'ऑफ़लाइन कैलकुलेटर')],
      ['#/periodic', 'atom', L('Periodic table', 'आवर्त सारणी'), L('118 elements', '118 तत्व')],
      ['#/timeline', 'timeline', L('Timeline', 'समयरेखा'), L('77 events', '77 घटनाएँ')],
      ['#/lab', 'flask', L('Chemistry lab', 'रसायन प्रयोगशाला'), L('36 reactions', '36 अभिक्रियाएँ')],
      ['#/mathlab', 'calc', L('Maths lab', 'गणित लैब'), L('tools', 'टूल')]
    ]);
    h += '<div class="note"><a href="#/help" style="color:var(--accent);font-weight:700">' + esc(L('Kaise use karein →', 'कैसे उपयोग करें →')) + '</a></div>';
    return h + '</section>';
  }

  function vPractice() {
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Abhyas', 'अभ्यास')) + '</h2>' +
      '<span class="note">' + esc(L('Practice + tests', 'अभ्यास + परीक्षण')) + '</span></div>';
    h += hubGrid([
      ['#/bank', 'library', L('Question bank', 'प्रश्न बैंक'), L('filters + bookmark', 'फ़िल्टर + बुकमार्क')],
      ['#/room', 'users', L('Study room', 'अध्ययन कक्ष'), L('saath padho', 'साथ पढ़ो')],
      ['#/subjects', 'grid', L('Subjects', 'विषय'), L('8356 questions', '8356 सवाल')],
      ['#/quiz', 'pencil', L('Quiz', 'क्विज़'), L('chapter / subject / mixed', 'अध्याय / विषय / मिक्स')],
      ['#/exam', 'timer', L('Mock exam', 'मॉक एग्ज़ाम'), L('timer + real pattern', 'टाइमर + असली पैटर्न')],
      ['#/papers', 'papers', L('Papers (PDF)', 'पेपर (PDF)'), L('PYQ + model', 'PYQ + मॉडल')],
      ['#/important', 'star', L('Important 2027', 'महत्वपूर्ण 2027'), L('NCERT practice', 'NCERT अभ्यास')],
      ['#/revision', 'repeat', L('Revision', 'रिवीज़न'), L('wrong + bookmarks', 'गलत + बुकमार्क')],
      ['#/search', 'search', L('Search', 'खोज'), L('questions + notes', 'सवाल + नोट्स')],
      ['#/brain', 'bulb', L('Brain test', 'ब्रेन टेस्ट'), L('20 questions', '20 सवाल')],
      ['#/songs', 'music', L('Focus songs', 'फ़ोकस गाने'), L('offline audio', 'ऑफ़लाइन')],
      ['#/mynotes', 'book', L('Meri notes', 'मेरी नोट्स'), L('apni notes banao', 'अपनी नोट्स बनाओ')],
      ['#/planner', 'chart', L('Planner', 'योजना'), L('goals + calendar', 'लक्ष्य + कैलेंडर')],
      ['#/timer', 'timer', L('Study timer', 'अध्ययन टाइमर'), L('focus sessions', 'फ़ोकस सत्र')],
      ['#/flash/science/all', 'repeat', L('Flashcards', 'फ़्लैशकार्ड'), L('subject / chapter', 'विषय / अध्याय')]
    ]);
    return h + '</section>';
  }

  function vProfile() {
    var b = BP.board();
    var s = window.STUDY ? window.STUDY.stats() : null;
    var theme = storeGet2('bp_theme', 'system');
    var fs = storeGet2('bp_fs', 'normal');
    var name = storeGet2('bp_name', '');
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Profile', 'प्रोफ़ाइल')) + '</h2></div>';
    h += '<div class="card profile-card">' +
      '<span class="avatar" data-icon="user"></span>' +
      '<div><div style="font-size:17px;font-weight:800">' + esc(name || L('Class 10 student', 'कक्षा 10 का विद्यार्थी')) + '</div>' +
      '<div class="t-secondary">' + esc(b.name) + ' · ' + esc(b.medium || '') + '</div>' +
      (s ? '<div class="t-secondary">' + s.total + ' ' + esc(L('attempted', 'किए')) + ' · ' + s.right + ' ' + esc(L('correct', 'सही')) + ' · ' + s.streak + ' ' + esc(L('day streak', 'दिन स्ट्रीक')) + '</div>' : '') +
      '</div></div>';

    h += '<div class="board-group">' + esc(L('Student details', 'विद्यार्थी विवरण')) + '</div>';
    h += '<div class="field"><label>' + esc(L('Your name', 'आपका नाम')) + '</label>' +
      '<input type="text" id="setName" value="' + esc(name) + '" placeholder="' + esc(L('Naam likhein', 'नाम लिखें')) + '"></div>';
    h += '<div class="setting-row"><span>' + esc(L('Board', 'बोर्ड')) + '</span><a class="setting-val" href="#/board" id="setBoard">' + esc(b.name) + ' ▾</a></div>';
    h += '<div class="setting-row"><span>' + esc(L('Medium / Language', 'माध्यम / भाषा')) + '</span><button class="setting-val" id="setLang">' + esc(window.BP.state.lang === 'en' ? 'English' : 'हिंदी') + '</button></div>';

    h += '<div class="board-group">' + esc(L('Appearance', 'दिखावट')) + '</div>';
    h += '<div class="setting-row"><span>' + esc(L('Theme', 'थीम')) + '</span>' +
      '<div class="seg" style="gap:6px">' + [['system', L('System', 'सिस्टम')], ['light', L('Light', 'लाइट')], ['dark', L('Dark', 'डार्क')]].map(function (x) {
        return '<button class="fchip' + (theme === x[0] ? ' on' : '') + '" data-theme-set="' + x[0] + '">' + esc(x[1]) + '</button>';
      }).join('') + '</div></div>';
    h += '<div class="setting-row"><span>' + esc(L('Text size', 'टेक्स्ट साइज़')) + '</span>' +
      '<div class="seg" style="gap:6px">' + [['small', L('Small', 'छोटा')], ['normal', L('Normal', 'सामान्य')], ['large', L('Large', 'बड़ा')]].map(function (x) {
        return '<button class="fchip' + (fs === x[0] ? ' on' : '') + '" data-fs-set="' + x[0] + '">' + esc(x[1]) + '</button>';
      }).join('') + '</div></div>';

    h += '<div class="board-group">' + esc(L('Downloads + data', 'डाउनलोड + डेटा')) + '</div>';
    h += '<a class="setting-row" href="#/help" style="display:flex"><span>' + esc(L('Offline content', 'ऑफ़लाइन सामग्री')) + '</span><span class="setting-val">' + esc(L('Setup →', 'सेटअप →')) + '</span></a>';
    h += '<button class="setting-row" id="bkExport" style="width:100%;text-align:left"><span>' + esc(L('Backup my data', 'मेरा डेटा बैकअप')) + '</span><span class="setting-val">↓</span></button>';
    h += '<button class="setting-row" id="bkRestore" style="width:100%;text-align:left"><span>' + esc(L('Restore backup', 'बैकअप रिस्टोर')) + '</span><span class="setting-val">↑</span></button>';
    h += '<button class="setting-row danger" id="bkClear" style="width:100%;text-align:left"><span>' + esc(L('Clear all progress', 'सारी प्रगति मिटाएँ')) + '</span><span class="setting-val">✕</span></button>';
    h += '<div class="note">' + esc(L('Board badalne se progress nahi jayega — sirf syllabus/bhasha badlega.', 'बोर्ड बदलने से प्रगति नहीं जाएगी — सिर्फ़ पाठ्यक्रम/भाषा बदलेगी।')) + '</div>';

    h += '<div class="board-group">' + esc(L('About', 'ऐप के बारे में')) + '</div>';
    h += '<div class="setting-row"><span>' + esc(L('Version', 'संस्करण')) + '</span><span class="setting-val">v3.0</span></div>';
    h += '<div class="setting-row"><span>' + esc(L('Content source', 'सामग्री स्रोत')) + '</span><span class="setting-val" style="max-width:60%;text-align:right">' + esc(L('NCERT syllabus based', 'NCERT पाठ्यक्रम आधारित')) + '</span></div>';
    h += '<div class="setting-row"><span>' + esc(L('Privacy', 'गोपनीयता')) + '</span><span class="setting-val" style="max-width:60%;text-align:right">' + esc(L('Sab data is device par', 'सारा डेटा इसी डिवाइस पर')) + '</span></div>';
    h += '<div class="board-group">' + esc(L('Licences', 'लाइसेंस')) + '</div>';
    h += '<div class="setting-row" style="align-items:flex-start;flex-direction:column;gap:4px"><span>' + esc(L('3D anatomy models', '3D एनाटॉमी मॉडल')) + '</span><span class="t-small">BodyParts3D © DBCLS (CC BY 4.0); female organs: HuBMAP (CC BY 4.0); female body: MakeHuman (CC0). Adapted by open-anatomy-3d (CC BY 4.0).</span></div>';
    h += '<div class="setting-row" style="align-items:flex-start;flex-direction:column;gap:4px"><span>' + esc(L('PDFs + audio', 'PDF + ऑडियो')) + '</span><span class="t-small">' + esc(L('NCERT/JAC material + free audio (licence verify)', 'NCERT/JAC सामग्री + मुफ़्त ऑडियो (लाइसेंस जाँचें — verify)')) + '</span></div>';
    h += '<div class="note">' + esc(L('BoardPrep ek educational aid hai — koi bhi board-specific content sirf tab kehlata hai jab source verified ho.', 'BoardPrep एक शैक्षणिक साधन है — कोई भी बोर्ड-विशिष्ट सामग्री सिर्फ़ तब कहलाती है जब स्रोत सत्यापित हो।')) + '</div>';
    h += '<div class="board-group" style="margin-top:12px">' + esc(L('Cloud sync', 'क्लाउड सिंक')) + '</div>';
    h += '<div class="note">' + esc(L('Apni pragaṭi cloud par — doosre phone se bhi. Free worker chahiye (guide).', 'अपनी प्रगति क्लाउड पर — दूसरे फ़ोन से भी। मुफ़्त worker चाहिए (गाइड)।')) + '</div>';
    h += '<div class="field"><label>' + esc(L('Cloud API URL (worker)', 'क्लाउड API URL (worker)')) + '</label>' +
      '<input id="csUrl" value="' + esc(window.Cloud ? window.Cloud.getBase() : '') + '" placeholder="https://boardprep-api.xxx.workers.dev" style="width:100%"></div>';
    h += '<div class="chips">' +
      '<button class="fchip" id="csSave">' + esc(L('Cloud par save', 'क्लाउड पर सेव')) + '</button>' +
      '<button class="fchip" id="csLoad">' + esc(L('Cloud se lao', 'क्लाउड से लाओ')) + '</button></div>';
    h += '<div id="csOut" class="note" style="margin-top:6px"></div>';
    if (window.BPApp && window.BPApp.exit) {
      h += '<div class="board-group" style="margin-top:12px">' + esc(L('App', 'ऐप')) + '</div>';
      h += '<button class="btn btn-block" id="appExit" style="border-color:var(--line)">' + esc(L('ऐप बंद करें', 'ऐप बंद करें')) + '</button>';
      h += '<div class="note" style="margin-top:6px">' + esc(L('Back button bhi kaam karta hai — home par dabao to app band ho jayega.', 'बैक बटन भी काम करता है — होम पर दबाओ तो ऐप बंद हो जाएगा।')) + '</div>';
    }
    return h + '</section>';
  }

  function storeGet2(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function storeSet2(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  /* ---------------- chapter page + mastery ---------------- */

  var MASTERY = {
    notstarted: { hi: 'शुरू नहीं हुआ', en: 'Not started', c: '#475569', bg: 'rgba(71,85,105,.12)' },
    learning: { hi: 'सीख रहे', en: 'Learning', c: '#0369a1', bg: 'rgba(3,105,161,.10)' },
    practicing: { hi: 'अभ्यास जारी', en: 'Practicing', c: '#b45309', bg: 'rgba(180,83,9,.12)' },
    testpending: { hi: 'टेस्ट बाकी', en: 'Test pending', c: '#7c3aed', bg: 'rgba(124,58,237,.12)' },
    completed: { hi: 'पूरा हुआ', en: 'Completed', c: '#15803d', bg: 'rgba(21,128,61,.12)' },
    needsrevision: { hi: 'दोबारा चाहिए', en: 'Needs revision', c: '#dc2626', bg: 'rgba(220,38,38,.12)' }
  };

  function masteryBadge(m) {
    var k = MASTERY[m.state] || MASTERY.notstarted;
    var label = (window.BP && window.BP.state.lang === 'en') ? k.en : k.hi;
    return '<span class="mast-badge" style="background:' + k.bg + ';color:' + k.c + '">' + esc(label) +
      (m.n ? ' · ' + m.n + ' ' + esc(L('sawal', 'सवाल')) : '') + '</span>';
  }

  function vChapter(subjKey, chap) {
    var m = window.STUDY ? window.STUDY.mastery(subjKey, chap) : { state: 'notstarted', n: 0, pct: 0 };
    var h = '<a class="backlink" href="#/subject/' + esc(subjKey) + '">← ' + esc(L('Back', 'वापस')) + '</a>';
    h += '<section class="section"><div class="section-head"><h2>' + esc(chap) + '</h2>' + masteryBadge(m) + '</div>';
    if (m.n) {
      h += '<div class="prog-row card" style="padding:12px"><div class="prog-top"><span>' + esc(L('Aapka prayas', 'आपका प्रयास')) + '</span><b class="t-num">' + m.pct + '% (' + (m.n - Math.round(m.n * m.pct / 100)) + '/' + m.n + ' ' + esc(L('galat', 'गलत')) + ')</b></div>' +
        '<div class="prog"><i style="width:' + m.pct + '%;background:' + (m.pct >= 80 ? 'var(--color-success)' : m.pct >= 50 ? 'var(--color-warning)' : 'var(--color-error)') + '"></i></div></div>';
    } else {
      h += '<div class="note">' + esc(L('Is chapter me abhi aapne koi sawal nahi kiya — neeche practice se shuru karo.', 'इस अध्याय में अभी आपने कोई सवाल नहीं किया — नीचे अभ्यास से शुरू करो।')) + '</div>';
    }
    h += '<div class="chips" style="margin-top:10px">' +
      '<a class="fchip" href="#/subject/' + esc(subjKey) + '">' + esc(L('Practice', 'अभ्यास')) + '</a>' +
      '<a class="fchip" href="#/quiz">' + esc(L('Chapter quiz', 'अध्याय क्विज़')) + '</a>' +
      '<a class="fchip" href="#/flash/' + esc(subjKey) + '/' + encodeURIComponent(chap) + '">' + esc(L('Flashcards', 'फ़्लैशकार्ड')) + '</a>' +
      '<a class="fchip" href="#/notes/' + esc(subjKey) + '">' + esc(L('Notes', 'नोट्स')) + '</a></div>';
    h += '</section>';

    // notes se overview / key points
    var notes = null;
    try {
      ((window.NOTES || {})[subjKey] || []).forEach(function (it) { if (!notes && it.ch === chap) notes = it; });
    } catch (e) {}
    if (notes) {
      h += '<section class="section"><div class="section-head"><h2>' + esc(L('Chapter notes', 'अध्याय नोट्स')) + '</h2></div>';
      h += renderBlocks(notes.blocks.filter(function (b) { return b[0] !== 'link'; }));
      h += '</section>';
    }

    // practice questions
    var qs = [];
    try { qs = window.QS_FOR(subjKey).filter(function (q) { return (q.chap || q.part) === chap; }); } catch (e) {}
    var mcqs = qs.filter(function (q) { return q.opts && q.ans; }).slice(0, 20);
    var wr = qs.filter(function (q) { return !q.opts || !q.ans; }).slice(0, 20);
    if (mcqs.length || wr.length) {
      h += '<section class="section"><div class="section-head"><h2>' + esc(L('Practice questions', 'अभ्यास प्रश्न')) + '</h2>' +
        '<span class="note">' + qs.length + ' ' + esc(L('kul', 'कुल')) + '</span></div>';
      h += '<div id="chQ">' + mcqs.concat(wr).map(function (q, i) { return window.BP.questionCard(q, i); }).join('') + '</div>';
      if (qs.length > 20) h += '<button class="link-btn" id="chMore">' + esc(L('Aur dikhao', 'और दिखाओ')) + '</button>';
      h += '</section>';
    }
    return h;
  }

  function vChapterList(subjKey) {
    var chaps = [];
    try { chaps = window.BP.chapters(subjKey); } catch (e) {}
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Chapters', 'अध्याय')) + '</h2>' +
      '<span class="note">' + chaps.length + '</span></div>';
    h += chaps.map(function (c) {
      var m = window.STUDY ? window.STUDY.mastery(subjKey, c) : { state: 'notstarted', n: 0 };
      return '<a class="list-row" href="#/chapter/' + esc(subjKey) + '/' + encodeURIComponent(c) + '"><div>' +
        '<div class="t">' + esc(c) + '</div><div class="s">' + masteryBadge(m) + '</div></div><span class="n">→</span></a>';
    }).join('');
    return h + '</section>';
  }

  /* ---------------- personal notes + flashcards ---------------- */

  function vMyNotes() {
    var list = window.STUDY ? window.STUDY.notes() : [];
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Meri notes', 'मेरी नोट्स')) + '</h2>' +
      '<span class="note">' + esc(L('Offline — is device par save', 'ऑफ़लाइन — इसी डिवाइस पर सहेजे')) + '</span></div>';
    h += '<div class="field"><label>' + esc(L('Nayi note', 'नयी नोट')) + '</label>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">' +
      '<select id="nnSubj" style="flex:1;min-width:120px"><option value="">— ' + esc(L('Subject', 'विषय')) + ' —</option>' +
      (window.SUBJECTS || []).filter(function (s) { return ['maths', 'science', 'sst', 'hindi', 'english', 'sanskrit'].indexOf(s.key) >= 0; })
        .map(function (s) { return '<option value="' + esc(s.key) + '">' + esc((window.BP.state.lang === 'en' ? s.en : s.name)) + '</option>'; }).join('') +
      '</select>' +
      '<input type="text" id="nnChap" placeholder="' + esc(L('Chapter (vait)', 'अध्याय (वैकल्पिक))')) + '" style="flex:1;min-width:120px">' +
      '</div>' +
      '<textarea id="nnText" placeholder="' + esc(L('Apni note likhein…', 'अपनी नोट लिखें…')) + '"></textarea>' +
      '<div class="note" id="nnStat"></div>' +
      '<button class="btn btn-accent btn-block" id="nnAdd" style="margin-top:8px">' + esc(L('Note save karo', 'नोट सहेजो')) + '</button></div>';

    h += '<div class="field" style="margin-top:14px"><input type="search" id="nnSearch" placeholder="' + esc(L('Note khojein…', 'नोट खोजें…')) + '"></div>';
    h += '<div id="nnList">';
    if (!list.length) {
      h += '<div class="empty">' + esc(L('Abhi koi note nahi — upar se pehli note banao.', 'अभी कोई नोट नहीं — ऊपर से पहली नोट बनाओ।')) + '</div>';
    } else {
      list.slice().reverse().forEach(function (n) {
        h += '<div class="card note-card" data-id="' + esc(n.id) + '" style="margin-bottom:10px">' +
          '<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">' +
          '<div class="t-small">' + esc(n.s ? ((window.SUBJECT_MAP && window.SUBJECT_MAP[n.s]) ? (window.BP.state.lang === 'en' ? window.SUBJECT_MAP[n.s].en : window.SUBJECT_MAP[n.s].name) : n.s) : '') + (n.c ? ' · ' + esc(n.c) : '') + '</div>' +
          '<button class="link-btn nt-del" style="margin:0" data-id="' + esc(n.id) + '">' + esc(L('Hatao', 'हटाओ')) + '</button></div>' +
          '<textarea class="nt-edit" data-id="' + esc(n.id) + '" style="margin-top:6px;min-height:70px">' + esc(n.t) + '</textarea>' +
          '<div class="t-small nt-stat" data-id="' + esc(n.id) + '"></div></div>';
      });
    }
    h += '</div>';
    h += '<button class="link-btn" id="nnExport">' + esc(L('Saari notes export karo (JSON)', 'सारी नोट्स एक्सपोर्ट करो (JSON)')) + '</button>';
    h += '<div class="note">' + esc(L('Notes apne aap save hote hain — app band hone par bhi safe.', 'नोट्स अपने-आप सहेजे जाते हैं — ऐप बंद होने पर भी सुरक्षित।')) + '</div>';
    return h + '</section>';
  }

  function vFlash(subjKey, chap) {
    var qs = [];
    try { qs = window.QS_FOR(subjKey).filter(function (q) { return chap === 'all' || (q.chap || q.part) === chap; }); } catch (e) {}
    var cards = qs.filter(function (q) { return q.opts && q.ans; }).slice(0, 30);
    if (!cards.length) return '<section class="section"><div class="empty">' + esc(L('Is chapter me MCQ nahi mila — flashcard ke liye kisi aur chapter ka use karo.', 'इस अध्याय में MCQ नहीं मिला — फ़्लैशकार्ड के लिए किसी और अध्याय का उपयोग करो।')) + '</div></section>';
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Flashcards', 'फ़्लैशकार्ड')) + '</h2>' +
      '<span class="note" id="fcStat">1/' + cards.length + '</span></div>';
    h += '<div class="t-secondary" style="margin-bottom:10px">' + esc(chap === 'all' ? L('Poore subject ke MCQ', 'पूरे विषय के MCQ') : chap) + ' · ' + cards.length + ' ' + esc(L('cards', 'कार्ड')) + '</div>';
    h += '<div class="fc" id="fcCard"><div class="fc-face fc-front" id="fcFace">' +
      '<div class="fc-q" id="fcQ"></div>' +
      '<div class="fc-opts" id="fcOpts"></div>' +
      '<div class="fc-hint">' + esc(L('Answer dekhne ke liye card par tap karo', 'उत्तर देखने के लिए कार्ड पर टैप करो')) + '</div></div>' +
      '<div class="fc-face fc-back" id="fcBack" hidden><div class="fc-ans" id="fcAns"></div>' +
      '<div class="fc-hint">' + esc(L('Wapas dekhne ke liye tap karo', 'वापस देखने के लिए टैप करो')) + '</div></div></div>';
    h += '<div class="chips" style="margin-top:12px">' +
      '<button class="fchip" id="fcNo">' + esc(L('Nahi aaya', 'नहीं आया')) + '</button>' +
      '<button class="fchip" id="fcYes">' + esc(L('Aaja', 'आ गया')) + '</button>' +
      '<button class="fchip" id="fcFlip">' + esc(L('Flip', 'फ़्लिप')) + '</button>' +
      '<button class="fchip" id="fcReset">' + esc(L('Dobara', 'दोबारा')) + '</button></div>';
    h += '<div class="note" id="fcMsg">' + esc(L('Tip: pehle khud socho, phir flip karke check karo.', 'टिप: पहले खुद सोचो, फिर फ़्लिप करके जाँचो।')) + '</div>';
    window.__fcCards = cards;
    window.__fcIdx = 0; window.__fcFlipped = false; window.__fcKnown = 0; window.__fcUnknown = 0;
    return h + '</section>';
  }

  /* ---------------- study timer + planner ---------------- */

  function fmtSec(s) {
    s = Math.max(0, Math.floor(s));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(ss).padStart(2, '0');
  }

  function vTimer() {
    var st = window.STUDY.stats();
    var t = st.last7[0] || { secs: 0 };
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Study timer', 'अध्ययन टाइमर')) + '</h2>' +
      '<span class="note">' + esc(L('Timer chalne se samay record hota hai', 'टाइमर चलने से समय रिकॉर्ड होता है')) + '</span></div>';
    h += '<div class="card" style="text-align:center;padding:22px">' +
      '<div class="t-small" id="tmToday">' + esc(L('Aaj ka samay', 'आज का समय')) + ': <b class="t-num">' + fmtSec(t.secs) + '</b></div>' +
      '<div class="tm-clock t-num" id="tmClock">00:00</div>' +
      '<div class="field" style="margin-top:10px"><select id="tmSubj" style="text-align:center">' +
      '<option value="">— ' + esc(L('Subject (vait)', 'विषय (वैकल्पिक)')) + ' —</option>' +
      (window.SUBJECTS || []).filter(function (s) { return ['maths', 'science', 'sst', 'hindi', 'english', 'sanskrit'].indexOf(s.key) >= 0; })
        .map(function (s) { return '<option value="' + esc(s.key) + '">' + esc((window.BP.state.lang === 'en' ? s.en : s.name)) + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="chips" style="justify-content:center;margin-top:12px">' +
      '<button class="fchip" id="tmStart">' + esc(L('Shuru', 'शुरू')) + '</button>' +
      '<button class="fchip" id="tmPause">' + esc(L('Ruko', 'रुको')) + '</button>' +
      '<button class="fchip" id="tmStop">' + esc(L('Ruk jao + save', 'रुक जाओ + सहेजो')) + '</button></div>' +
      '<div class="note" id="tmMsg"></div></div>';
    h += '<div class="note">' + esc(L('Focus ke liye: 25 minute padho, 5 minute aaram — timer pause se samay bachta hai.', 'फ़ोकस के लिए: 25 मिनट पढ़ो, 5 मिनट आराम — टाइमर पॉज़ से समय बचता है।')) + '</div>';
    return h + '</section>';
  }

  function vPlanner() {
    var st = window.STUDY.stats();
    var goal = st.goal || 5;
    var due = window.STUDY.revDueCount ? window.STUDY.revDueCount() : 0;
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Study planner', 'अध्ययन योजना')) + '</h2></div>';
    h += '<div class="card"><div class="prog-top"><span>' + esc(L('Daily goal (sawal)', 'रोज़ का लक्ष्य (सवाल)')) + '</span><b class="t-num">' + goal + '</b></div>' +
      '<div class="chips" style="margin-top:10px">' + [3, 5, 10, 20].map(function (n) {
        return '<button class="fchip' + (goal === n ? ' on' : '') + '" data-goal="' + n + '">' + n + '</button>';
      }).join('') + '</div>' +
      '<div class="note">' + esc(L('Lakshya chhota rakho — roz poora karna zaroori, pressure nahi.', 'लक्ष्य छोटा रखो — रोज़ पूरा करना ज़रूरी, दबाव नहीं।')) + '</div></div>';

    /* 7 din ka calendar */
    var max = Math.max.apply(null, st.last7.map(function (x) { return x.n; }).concat([goal, 1]));
    h += '<div class="board-group">' + esc(L('Pichle 7 din', 'पिछले 7 दिन')) + '</div>';
    h += '<div class="cal7">' + st.last7.map(function (x) {
      var pct = Math.round((x.n / max) * 100);
      var col = x.n >= goal ? 'var(--color-success)' : (x.n > 0 ? 'var(--color-warning)' : 'var(--color-surface-secondary)');
      return '<div class="cal7-cell"><div class="cal7-bar" style="height:' + Math.max(6, pct) + 'px;background:' + col + '"></div>' +
        '<div class="t-small">' + x.d.slice(8) + '</div><div class="t-small">' + x.n + '/' + goal + '</div></div>';
    }).join('') + '</div>';

    /* weekly summary */
    var weekN = st.last7.reduce(function (s, x) { return s + x.n; }, 0);
    h += '<div class="card" style="margin-top:12px"><div class="prog-top"><span>' + esc(L('Is hafte', 'इस हफ़्ते')) + '</span><b class="t-num">' + weekN + ' ' + esc(L('sawal', 'सवाल')) + '</b></div>' +
      '<div class="t-secondary">' + esc(L('Rozana ' + goal + ' maan kar ' + (goal * 7) + ' chahiye', 'रोज़ाना ' + goal + ' मान कर ' + (goal * 7) + ' चाहिए')) + '</div></div>';

    /* revision due */
    h += '<div class="board-group">' + esc(L('Revision (spaced repetition)', 'रिवीज़न (स्पेस्ड रिपीटीशन)')) + '</div>';
    h += '<a class="list-row" href="#/revision"><div><div class="t">' + esc(L('Aaj due', 'आज बाकी')) + '</div>' +
      '<div class="s">' + due + ' ' + esc(L('sawal') ) + ' · ' + esc(L('1, 3, 7, 14, 30 din ka schedule', '1, 3, 7, 14, 30 दिन का शेड्यूल')) + '</div></div><span class="n">→</span></a>';

    /* subject plan */
    h += '<div class="board-group">' + esc(L('Subject plan', 'विषय योजना')) + '</div>';
    var subs = (window.SUBJECTS || []).filter(function (s) { return ['maths', 'science', 'sst', 'hindi', 'english', 'sanskrit'].indexOf(s.key) >= 0; });
    h += subs.map(function (s) {
      var x = st.subj[s.key];
      var pct = x ? x.pct : 0;
      var nm = window.BP.state.lang === 'en' ? (s.en || s.name) : s.name;
      return '<a class="prog-row card" style="padding:12px;display:block" href="#/subject/' + esc(s.key) + '">' +
        '<div class="prog-top"><span>' + esc(nm) + '</span><b class="t-num">' + pct + '%</b></div>' +
        '<div class="prog"><i style="width:' + pct + '%;background:var(--color-primary)"></i></div></a>';
    }).join('');

    h += '<div class="note">' + esc(L('Plan sirf aapki asli activity se banta hai — koi fixed timetable nahi.', 'प्लान सिर्फ़ आपकी असली गतिविधि से बनता है — कोई तय टाइमटेबल नहीं।')) + '</div>';
    return h + '</section>';
  }

  /* ---------------- question bank (filters) ---------------- */

  function vBank() {
    var subs = (window.SUBJECTS || []).filter(function (s) { return ['maths', 'science', 'sst', 'hindi', 'english', 'sanskrit'].indexOf(s.key) >= 0; });
    var st = window.BP.state;
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Question bank', 'प्रश्न बैंक')) + '</h2>' +
      '<span class="note" id="bkCount"></span></div>';
    h += '<div class="chips" id="bkSubj">' + subs.map(function (s) {
      return '<button class="fchip' + ((st.bankSubj || 'all') === s.key ? ' on' : '') + '" data-bsub="' + esc(s.key) + '">' + esc(window.BP.state.lang === 'en' ? (s.en || s.name) : s.name) + '</button>';
    }).join('') + '</div>';
    h += '<div class="chips" id="bkType">' + [['all', L('Sab', 'सभी')], ['mcq', 'MCQ'], ['write', L('Likhit', 'लिखित')]].map(function (x) {
      return '<button class="fchip' + ((st.bankType || 'all') === x[0] ? ' on' : '') + '" data-btype="' + x[0] + '">' + esc(x[1]) + '</button>';
    }).join('') + '</div>';
    h += '<div class="chips" id="bkAns">' + [['all', L('Sab', 'सभी')], ['ans', L('Jawab sahit', 'जवाब सहित')], ['noans', L('Bina jawab', 'बिना जवाब')]].map(function (x) {
      return '<button class="fchip' + ((st.bankAns || 'all') === x[0] ? ' on' : '') + '" data-bans="' + x[0] + '">' + esc(x[1]) + '</button>';
    }).join('') + '</div>';
    h += '<div class="field"><select id="bkChap"><option value="all">' + esc(L('Sab chapters', 'सभी अध्याय')) + '</option></select></div>';
    h += '<input type="search" id="bkSearch" placeholder="' + esc(L('Sawal khojein…', 'सवाल खोजें…')) + '">';
    h += '<div id="bkList" style="margin-top:12px"></div>';
    h += '<div class="chips" style="justify-content:center;margin-top:10px">' +
      '<button class="fchip" id="bkPrev">← ' + esc(L('Pichla', 'पिछला')) + '</button>' +
      '<span class="note t-num" id="bkPage" style="align-self:center"></span>' +
      '<button class="fchip" id="bkNext">' + esc(L('Agla', 'अगला')) + ' →</button></div>';
    h += '<div class="note">' + esc(L('Bookmark ke liye card par ☆ dabao; 547 bina-jawab MCQ chhote hue bhi list me nahi (quiz unhe skip karta hai).', 'बुकमार्क के लिए कार्ड पर ☆ दबाओ; 547 बिना-जवाब MCQ छोटे हुए भी सूची में नहीं (क्विज़ उन्हें छोड़ देता है)।')) + '</div>';
    return h + '</section>';
  }

  function bankList() {
    var st = window.BP.state;
    var subj = st.bankSubj || 'all', type = st.bankType || 'all', ans = st.bankAns || 'all';
    var chap = st.bankChap || 'all', word = (st.bankWord || '').toLowerCase();
    var list = [];
    (window.BOARD_DATA.questions || []).forEach(function (q) {
      if (subj !== 'all' && q.subj !== subj) return;
      if (type !== 'all' && q.type !== type) return;
      if (ans === 'ans' && !(q.opts && q.ans)) return;
      if (ans === 'noans' && (q.opts && q.ans)) return;
      if (chap !== 'all' && (q.chap || q.part) !== chap) return;
      if (word && (window.BP.norm(q.q) + ' ' + window.BP.norm((q.opts || []).join(' '))).indexOf(window.BP.norm(word)) < 0) return;
      list.push(q);
    });
    return list;
  }

  function renderBank() {
    var list = bankList();
    var per = 20;
    var page = window.BP.state.bankPage || 0;
    var pages = Math.max(1, Math.ceil(list.length / per));
    if (page >= pages) page = pages - 1;
    var slice = list.slice(page * per, page * per + per);
    var el = document.getElementById('bkList');
    var cnt = document.getElementById('bkCount');
    if (cnt) cnt.textContent = list.length + ' ' + L('sawal', 'सवाल');
    if (!el) return;
    el.innerHTML = slice.length ? slice.map(function (q, i) { return window.BP.questionCard(q, 'bk' + (page * per + i)); }).join('') :
      '<div class="empty">' + esc(L('Kuch nahi mila', 'कुछ नहीं मिला')) + '</div>';
    var pg = document.getElementById('bkPage');
    if (pg) pg.textContent = (page + 1) + '/' + pages;
    window.BP.state.bankPage = page;
  }

  /* ---------------- study room (multi-user) ---------------- */

  function vRoom() {
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Study room', 'अध्ययन कक्ष')) + '</h2>' +
      '<span class="note">' + esc(L('free — cloud worker chahiye', 'मुफ़्त — क्लाउड worker चाहिए')) + '</span></div>';
    h += '<div class="card"><div class="board-group">' + esc(L('Apna naam', 'अपना नाम')) + '</div>' +
      '<div class="field"><input id="rmName" placeholder="' + esc(L('Naam', 'नाम')) + '" value="' + esc(window.Cloud && window.Cloud.myName() || '') + '"></div>';
    h += '<div class="board-group" style="margin-top:10px">' + esc(L('Room code', 'रूम कोड')) + '</div>' +
      '<div class="field"><input id="rmCode" placeholder="maths10" maxlength="12"></div>';
    h += '<div class="chips" style="margin-top:10px">' +
      '<button class="fchip" id="rmCreate">' + esc(L('Room banao', 'रूम बनाओ')) + '</button>' +
      '<button class="fchip" id="rmJoin">' + esc(L('Join karo', 'जुड़ो')) + '</button></div>';
    h += '<div id="rmStat" class="note" style="margin-top:8px"></div></div>';
    h += '<div id="rmChat" style="margin-top:12px"></div>';
    h += '<div class="field" style="display:flex;gap:8px;margin-top:10px">' +
      '<input id="rmMsg" placeholder="' + esc(L('Message likho…', 'संदेश लिखो…')) + '" style="flex:1">' +
      '<button class="btn btn-accent" id="rmSend">' + esc(L('Bhejo', 'भेजो')) + '</button></div>';
    h += '<div class="note" style="margin-top:8px">' + esc(L('Ek hi code sabke liye same room kholta hai (jaise "maths10")। Internet chalega tabhi.', 'एक ही कोड सबके लिए समान रूम खोलता है (जैसे "maths10")। इंटरनेट चलेगा तभी।')) + '</div>';
    h += '<div id="rmPoll" data-code="" style="display:none"></div>';
    return h + '</section>';
  }

  /* ---------------- exam target / onboarding ---------------- */

  function vTarget() {
    var T = (window.STUDY && window.STUDY.targetGet) ? window.STUDY.targetGet() : null;
    var defExam = '2027-02-05';
    try {
      var raw = ((window.IMPORTANT && window.IMPORTANT.exam) || '').toString();
      var m = raw.match(/([A-Za-z]{3,})\s*(\d{4})/);
      var mon = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }[m ? m[1].slice(0, 3).toLowerCase() : ''];
      if (mon) defExam = m[2] + '-' + String(mon).padStart(2, '0') + '-01';
    } catch (e) {}
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Apna exam target', 'अपना एग्ज़ाम टारगेट')) + '</h2>' +
      '<span class="note">' + esc(L('Ek baar set karo — countdown + daily message apne aap', 'एक बार सेट करो — काउंटडाउन + रोज़ का संदेश अपने आप')) + '</span></div>';
    h += '<div class="board-group">' + esc(L('Exam ki tareekh', 'एग्ज़ाम की तारीख')) + '</div>';
    h += '<div class="field"><input type="date" id="tgExam" value="' + esc((T && T.exam) || defExam) + '"></div>';
    h += '<div class="board-group" style="margin-top:12px">' + esc(L('Syllabus kitna karna hai (%)', 'सिलेबस कितना करना है (%)')) + '</div>';
    h += '<div class="field"><input type="range" id="tgSyl" min="10" max="100" step="5" value="' + ((T && T.syllabus) || 100) + '" style="width:100%">' +
      '<div class="note t-num" id="tgSylV">' + ((T && T.syllabus) || 100) + '%</div></div>';
    h += '<div class="board-group" style="margin-top:12px">' + esc(L('Roz kitne sawal', 'रोज़ कितने सवाल')) + '</div>';
    h += '<div class="field"><input type="number" id="tgDaily" min="1" max="500" value="' + ((T && T.daily) || 20) + '"></div>';
    h += '<div class="board-group" style="margin-top:12px">' + esc(L('Subah ka sandesh', 'सुबह का संदेश')) + '</div>';
    h += '<div class="field"><input type="time" id="tgTime" value="' + ((T && T.time) || '07:00') + '"></div>';
    h += '<button class="btn btn-accent btn-block" id="tgSave" style="margin-top:14px">' + esc(L('Sanjayein', 'सहेजें')) + '</button>';
    h += '<div id="tgOut" class="note" style="margin-top:8px"></div>';
    h += '<div style="text-align:center;margin-top:10px"><a href="#/" id="tgSkip" style="color:var(--color-primary);font-weight:700">' + esc(L('Abhi nahi — skip', 'अभी नहीं — छोड़ो')) + '</a></div>';
    return h + '</section>';
  }

  /* ---------------- reminders ---------------- */

  function vRemind() {
    var d = (window.STUDY && window.STUDY.reminderGet) ? window.STUDY.reminderGet() : {};
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Study reminder', 'अध्ययन अनुस्मारक')) + '</h2>' +
      '<span class="note">' + esc(L('offline — device par hi', 'ऑफ़लाइन — डिवाइस पर ही')) + '</span></div>';
    h += '<div class="card"><label class="setting-row"><span>' + esc(L('Reminder chalu', 'अनुस्मारक चालू')) + '</span>' +
      '<input type="checkbox" id="rmOn"' + (d.on ? ' checked' : '') + '></label>';
    h += '<label class="setting-row"><span>' + esc(L('Samay', 'समय')) + '</span>' +
      '<input type="time" id="rmTime" value="' + esc(d.time || '18:00') + '" style="background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:8px"></label>';
    h += '<label class="setting-row" style="flex-direction:column;align-items:flex-start;gap:6px"><span>' + esc(L('Sandesh', 'संदेश')) + '</span>' +
      '<input id="rmMsg" value="' + esc(d.msg || 'Abhi padho! Daily goal poora karo.') + '" style="width:100%;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px"></label>';
    h += '<button class="btn btn-accent btn-block" id="rmSave">' + esc(L('Sanjayein', 'सहेजें')) + '</button>';
    h += '<button class="btn btn-block" id="rmTest" style="margin-top:8px">' + esc(L('Test notification', 'टेस्ट सूचना')) + '</button>';
    h += '<div id="rmOut" class="note" style="margin-top:8px"></div>';
    h += '<div class="board-group" style="margin-top:12px">' + esc(L('Dhyan dein', 'ध्यान दें')) + '</div>';
    h += '<div class="note">' + esc(L('Browser/APK notification ke liye permission chahiye. Android WebView me native notification ke bina sirf in-app reminder chalega (verify).', 'ब्राउज़र/APK सूचना के लिए अनुमति चाहिए। Android WebView में नेटिव सूचना के बिना सिर्फ़ इन-ऐप अनुस्मारक चलेगा (verify)।')) + '</div></div>';
    return h + '</section>';
  }

  /* ---------------- help / kaise use karein ---------------- */

  function vHelp() {
    var steps = [
      ['board', '1. Board चुनो', 'ऊपर JAC chip पर टैप करो — अपना board चुन, pattern + भाषा अपने आप बदल जाएगी।'],
      ['pencil', '2. विषय → chapter → quiz', 'विषय पर जाओ, chapter चुनो, कितने सवाल चाहिए वो चुनो, फिर "शुरू करें"।'],
      ['cube', '3. 3D models घुमाओ', 'Tools → 3D models। हृदय, आँख, मस्तिष्क, दर्पण/लेंस — घुमाओ और हिस्सों पर टैप करो।'],
      ['sigma', '4. Formulas · periodic · lab', 'Tools में सूत्र + ट्रिक, 118 तत्व, chemistry lab, maths lab, diagrams।'],
      ['book', '5. Chapter stories + songs', 'पाठ्य पुस्तक में 81 अध्याय की कहानी, और सांग में पढ़ाई के साथ चलने वाले free songs।'],
      ['papers', '6. PDF खोलो', 'पेपर और पीडीएफ में साल ऊपर दिखते हैं — PYQ + model papers, टैप करके खोलो।'],
      ['download', '7. Offline + APK', 'Tools → "सब ऑफ़लाइन करो" से सब सेव। फ़ोन के लिए APK भी मुफ़्त है।']
    ];
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('help_title')) + '</h2>' +
      '<span class="note">' + esc(t('help_sub')) + '</span></div>';
    steps.forEach(function (s) {
      var ic = (window.BP_ICONS && window.BP_ICONS[s[0]]) ? BP_ICON(s[0]) : s[0];
      html += '<div class="imp-item"><div class="num" style="background:#eef2ff;color:#3730a3">' + ic + '</div><div>' +
        '<div class="iq">' + esc(s[1]) + '</div><div class="note">' + esc(s[2]) + '</div></div></div>';
    });
    html += '<div class="imp-item" style="background:#f5f3ff;border-color:#c7d2fe"><div class="num" style="background:#e0e7ff;color:#3730a3">' +
      (window.BP_ICONS ? BP_ICON('phone') : '📱') + '</div><div><div class="iq">' +
      esc(L('Android app (APK) — free', 'एंड्रॉयड ऐप (APK) — फ्री')) + '</div>' +
      '<div class="note"><a href="downloads/BoardPrep-v4.1.apk" download style="color:var(--accent);font-weight:700">downloads/BoardPrep-v4.1.apk</a> (पूरा ऑफ़लाइन)</div></div></div>';
    return html + '</section>';
  }

  /* ---------------- songs ---------------- */

  function vSongs() {
    var list = window.SONGS || [];
    var html = '<section class="section"><div class="section-head"><h2>' + esc(t('songs_title')) + '</h2>' +
      '<span class="note">' + esc(t('songs_sub')) + '</span></div>';
    html += '<div class="chips">' + list.map(function (s) {
      return '<button class="fchip song-card" data-song="' + s.id + '">♪ ' + esc(pick(s.t, s.t_en)) + '</button>';
    }).join('') + '</div>';
    html += '<audio id="songPlayer" controls preload="auto" style="width:100%;margin-top:6px"></audio>';
    html += '<div class="note" style="margin-top:8px">Free to use · T. Schürger / SoundHelix</div>';
    return html + '</section>';
  }

  /* ---------------- brain ---------------- */

  function vBrain() {
    var B = window.BRAIN || null;
    if (!B) return '<section class="section"><div class="empty">'+L('No brain test data available.', 'ब्रेन टेस्ट डेटा उपलब्ध नहीं है।')+'</div></section>';
    if (state.brain && state.brain.done) {
      var score = state.brain.ok;
      var lv = B.levels.filter(function (l) { return score >= l.min && score <= l.max; })[0] || B.levels[0];
      var cats = {};
      B.items.forEach(function (it, i) {
        cats[it.c] = cats[it.c] || { t: 0, ok: 0 };
        cats[it.c].t++;
        if (state.brain.ans[i] === it.a) cats[it.c].ok++;
      });
      var html = '<section class="section"><div class="section-head"><h2>' + esc(t('brain_result')) + '</h2></div>' +
        '<div class="result-ring" style="--p:' + Math.round(score / B.items.length * 100) + '"><div>' + score + '/' + B.items.length + '</div></div>' +
        '<div class="card" style="text-align:center"><div style="font-size:22px;font-weight:800;color:var(--accent)">' + esc(lv.name) + '</div>' +
        '<div class="note">' + esc(lv.hi) + '</div><p style="font-size:14px;margin-top:8px;line-height:1.6">' + esc(lv.desc) + '</p></div>';
      html += '<div class="board-group">' + esc(t('brain_cat')) + '</div>';
      Object.keys(cats).forEach(function (c) {
        var pct = Math.round(cats[c].ok / cats[c].t * 100);
        html += '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:13.5px"><span>' + esc(c) + '</span><b>' + cats[c].ok + '/' + cats[c].t + '</b></div>' +
          '<div class="bc-bar"><i style="width:' + pct + '%"></i></div></div>';
      });
      html += '<div class="board-group">'+L('Answers and explanations', 'उत्तर व व्याख्या')+'</div>';
      B.items.forEach(function (it, i) {
        var ok = state.brain.ans[i] === it.a;
        html += '<div class="imp-item"><div class="num" style="background:' + (ok ? '#dcfce7' : '#fee2e2') + ';color:' + (ok ? '#166534' : '#991b1b') + '">' + (i + 1) + '</div><div>' +
          '<div class="iq">' + esc(it.q) + '</div>' +
          '<div class="in" style="color:' + (ok ? '#166534' : '#991b1b') + '">' + (ok ? L('Correct', 'सही') : L('Wrong', 'गलत')) + ' · ' + esc(it.opts[it.a]) + '</div>' +
          '<div class="note">' + esc(it.exp || '') + '</div></div></div>';
      });
      html += '<button class="btn btn-accent btn-block" id="brainAgain">' + esc(t('brain_again')) + '</button></section>';
      return html;
    }
    if (state.brain) {
      var i2 = state.brain.i;
      var it2 = B.items[i2];
      var p2 = Math.round(i2 / B.items.length * 100);
      var html2 = '<div class="quiz-top"><div class="progress"><i style="width:' + p2 + '%"></i></div>' +
        '<div class="quiz-meta">' + (i2 + 1) + '/' + B.items.length + '</div></div>';
      html2 += '<div class="qcard"><div class="qmeta"><span class="badge">' + esc(it2.c) + '</span></div>' +
        '<div class="qtext">' + esc(it2.q) + '</div><div class="opts">' + it2.opts.map(function (o, k) {
          return '<button class="opt" data-bk="' + k + '"><span class="k">' + 'ABCD'[k] + '</span><span>' + esc(o) + '</span></button>';
        }).join('') + '</div></div>';
      return html2;
    }
    return '<section class="section"><div class="section-head"><h2>' + esc(t('brain_title')) + '</h2></div>' +
      '<div class="card"><p style="font-size:14.5px;line-height:1.6">' + esc(t('brain_sub')) + '</p>' +
      '<div class="note">'+L('No question repeats. Answer honestly — that is the real level.', 'कोई प्रश्न दोबारा नहीं आएगा। ईमानदारी से उत्तर दो — यही असली स्तर बताएगा।')+'</div>' +
      '<button class="btn btn-accent btn-block" id="brainStart" style="margin-top:14px">' + esc(t('brain_start')) + '</button></div></section>';
  }

  /* ---------------- 3D models ---------------- */

  function findItem(sec, id) {
    var list = (window.MODELS3D && window.MODELS3D[sec]) || [];
    return list.filter(function (x) { return x.id === id; })[0];
  }

  function vModels() {
    var M = window.MODELS3D || { biology: [], physics: [] };
    var html = '<section class="section"><div class="section-head"><h2>' + '3D ' + t('models_word') + '</h2>' +
      '<span class="note">' + t('hub_models_sub') + '</span></div>';
    html += '<div class="note">' + L('Real 3D anatomy models downloaded (CC BY 4.0) — 147 parts. ', 'असली 3D एनाटमी मॉडल डाउनलोड किए गए (CC BY 4.0) — 147 भाग। ') + '' +
      '<span style="opacity:.7">' + esc(M.attribution || '') + '</span></div>';
    [['biology', L('Biology', 'जीव विज्ञान'), L('18 diagrams', '18 डायग्राम')], ['physics', L('Physics', 'भौतिकी'), L('16 diagrams', '16 डायग्राम')]].forEach(function (sec) {
      var list = M[sec[0]] || [];
      html += '<div class="board-group">' + esc(sec[1]) + ' · ' + list.length + '</div>';
      html += '<div class="hub">' + list.map(function (it) {
        return '<a class="hub-card" href="#/model/' + sec[0] + '/' + it.id + '">' +
          '<span class="hub-ico">◈</span>' +
          '<span><span class="ht">' + esc(pick(it.hi, it.en)) + '</span><br><span class="hs">' + (state.lang === 'en' ? '' : esc(it.en)) + '</span></span></a>';
      }).join('') + '</div>';
    });
    return html + '</section>';
  }

  function vModel(sec, id) {
    var it = findItem(sec, id);
    if (!it) return '<div class="empty">' + L('Model not found.', 'मॉडल नहीं मिला।') + '</div>';
    return '<a class="backlink" href="#/models">← ' + esc(t('back')) + '</a>' +
      '<div class="section-head"><h2>' + esc(pick(it.hi, it.en)) + '</h2>' +
      '<span class="note">' + (state.lang === 'en' ? '' : esc(it.en)) + '</span></div>' +
      '<div class="card" style="margin-bottom:12px">' + esc(it.desc) + '</div>' +
      '<div id="modelHolder"></div>' +
      '<div class="note" id="modelHint" style="margin-top:10px">' + L('Drag to rotate, pinch or scroll to zoom. Tap any part — or press its name below.', 'घुमाने के लिए ड्रैग करो, ज़ूम के लिए पिंच/स्क्रॉल। किसी भी हिस्से पर टैप करो — नीचे उसका नाम दबाओ।') + '</div>';
  }

  /* ---------------- routing + binding ---------------- */

  function route(parts) {
    var p = parts[0];
    if (p === 'models') return vModels();
    if (p === 'model') return vModel(parts[1], parts[2]);
    if (p === 'tools') return vTools();
    if (p === 'formulas') return vFormulas(parts[1]);
    if (p === 'periodic') return vPeriodic();
    if (p === 'lab') return vLab();
    if (p === 'mathlab') return vMathLab();
    if (p === 'diagrams' || p === 'diagram') return vDiagrams(parts[1]);
    if (p === 'timeline') return vTimeline();
    if (p === 'stories') return vStories(parts[1]);
    if (p === 'songs') return vSongs();
    if (p === 'help') return vHelp();
    if (p === 'notes') return vNotes(parts[1]);
    if (p === 'note') return vNoteDetail(parts[1], decodeURIComponent(parts[2] || ''));
    if (p === 'progress') return window.vProgress ? window.vProgress() : '<section class="section"><div class="empty">…</div></section>';
    if (p === 'learn') return vLearn();
    if (p === 'chapter') return vChapter(parts[1], decodeURIComponent(parts[2] || ''));
    if (p === 'mynotes') return vMyNotes();
    if (p === 'bank') return vBank();
    if (p === 'planner') return vPlanner();
    if (p === 'timer') return vTimer();
    if (p === 'flash') return vFlash(parts[1], decodeURIComponent(parts[2] || 'all'));
    if (p === 'practice') return vPractice();
    if (p === 'profile') return vProfile();
    if (p === 'revision') return window.vRevision ? window.vRevision() : '';
    if (p === 'calc') return window.CalcTool ? window.CalcTool.view() : '';
    if (p === 'target') return vTarget();
    if (p === 'room') return vRoom();
    if (p === 'remind') return vRemind();
    if (p === 'exam') return window.vExam ? window.vExam() : '';
    if (p === 'assistant') return window.vAssistant ? window.vAssistant() : '';
    if (p === 'story') {
      var q = parseQuery(location.hash);
      return vStories(parts[1], q.c);
    }
    if (p === 'brain') return vBrain();
    return null;
  }

  function parseQuery(hash) {
    var out = {};
    var m = hash.match(/\?(.*)$/);
    if (!m) return out;
    m[1].split('&').forEach(function (kv) {
      var p = kv.split('=');
      if (p[0]) out[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
    });
    return out;
  }

  function bind() {
    if (window.Models3DUI) window.Models3DUI.unmount();
    var holder = document.getElementById('modelHolder');
    if (holder && window.Models3DUI) {
      var hp = location.hash.replace(/^#/, '').split('/').filter(Boolean);
      var it = findItem(hp[1], hp[2]);
      if (it) Models3DUI.renderInto(holder, it);
    }
    document.querySelectorAll('[data-fsub]').forEach(function (b) {
      b.addEventListener('click', function () { location.hash = '#/formulas/' + b.dataset.fsub; });
    });
    document.querySelectorAll('[data-story]').forEach(function (b) {
      b.addEventListener('click', function () { location.hash = '#/stories/' + b.dataset.story; });
    });
    document.querySelectorAll('[data-prac]').forEach(function (b) {
      b.addEventListener('click', function () { goSubjectChap(b.dataset.prac, b.dataset.chap); });
    });
    document.querySelectorAll('[data-song]').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = (window.SONGS || []).filter(function (x) { return String(x.id) === String(b.dataset.song); })[0];
        if (!s) return;
        var p = document.getElementById('songPlayer');
        if (!p) return;
        p.src = s.src;
        p.play();
        document.querySelectorAll('.song-card').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      });
    });
    var offBtn = document.getElementById('offBtn');
    if (offBtn) offBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var urls = [];
        try {
          (window.BOARD_DATA.papers || []).forEach(function (p) { urls.push(p.url); });
          (window.SONGS || []).forEach(function (s) { urls.push(s.src); });
          (window.MODELS3D || []).forEach(function (m) { if (m.src) urls.push(m.src); });
          (window.DIAGRAMS || []).forEach(function (d) { if (d.img) urls.push(d.img); });
        } catch (e) {}
        var stat = document.getElementById('offStat');
        if (!('serviceWorker' in navigator)) {
          if (stat) stat.textContent = L('Is browser me offline support nahi hai', 'इस ब्राउज़र में ऑफ़लाइन सपोर्ट नहीं है');
          return;
        }
        if (stat) stat.textContent = L('Starting…', 'शुरू हो रहा है…') + ' (0/' + urls.length + ')';
        navigator.serviceWorker.ready.then(function (reg) {
          var ctrl = reg.active || reg.installing;
          if (!ctrl) { if (stat) stat.textContent = 'Service worker ready nahi hai'; return; }
          navigator.serviceWorker.addEventListener('message', function (ev) {
            var d = ev.data || {};
            if (d.type === 'CACHE_PROGRESS' && stat) stat.textContent =
              L('Ho gaya', 'हो गया') + ' ' + d.done + '/' + d.total +
              (d.failed ? ' · ' + L('fail', 'फेल') + ' ' + d.failed : '');
            if (d.type === 'CACHE_DONE' && stat) stat.textContent =
              (d.failed ? L('Poora nahi hua — neeche dobara try karo', 'पूरा नहीं हुआ — नीचे दोबारा try करो') : L('Ho gaya! Ab internet ke bina bhi sab chalega', 'हो गया! अब इंटरनेट के बिना भी सब चलेगा')) + ' ✓ (' + urls.length + ')';
          });
          ctrl.postMessage({ type: 'CACHE_ALL', urls: urls });
        });
      });
    document.querySelectorAll('[data-el]').forEach(function (b) {
      b.addEventListener('click', function () { renderElement(b.dataset.el); });
    });
    document.querySelectorAll('.dg-hot').forEach(function (g) {
      g.addEventListener('click', function () {
        var d = (window.DIAGRAMS || []).filter(function (x) { return x.id === state.dgId; })[0];
        if (d) showPart(d, g.dataset.part);
      });
    });
    document.querySelectorAll('.chap-item[data-part]').forEach(function (g) {
      g.addEventListener('click', function () {
        var d = (window.DIAGRAMS || []).filter(function (x) { return x.id === state.dgId; })[0];
        if (d) showPart(d, g.dataset.part);
      });
    });

    // ---- study features: progress / exam / revision / assistant ----
    var exSubj = '[data-exsub]', exN = '[data-exn]', exMin = '[data-exmin]';
    document.querySelectorAll(exSubj).forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll(exSubj).forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      });
    });
    document.querySelectorAll(exN).forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll(exN).forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      });
    });
    document.querySelectorAll(exMin).forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll(exMin).forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      });
    });
    var exStart = document.getElementById('exStart');
    if (exStart) exStart.addEventListener('click', function () {
      var s = document.querySelector(exSubj + '.on');
      var n = document.querySelector(exN + '.on');
      var m = document.querySelector(exMin + '.on');
      var subj = s ? s.dataset.exsub : ((window.SUBJECTS || [])[2] || {}).key;
      var count = n ? Number(n.dataset.exn) : 20;
      var mins = m ? Number(m.dataset.exmin) : 60;
      if (window.examStart(subj, count, mins)) { window.BP && window.BP.render(); }
    });
    document.querySelectorAll('[data-pal]').forEach(function (b) {
      b.addEventListener('click', function () { if (window.EXAM()) { window.examGo(Number(b.dataset.pal)); window.BP && window.BP.render(); } });
    });
    document.querySelectorAll('[data-exopt]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (window.EXAM()) { window.examAnswer(window.EXAM().i, Number(b.dataset.exopt)); window.BP && window.BP.render(); }
      });
    });
    document.querySelectorAll('[data-exself]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (window.EXAM()) { window.examAnswer(window.EXAM().i, b.dataset.exself === '1'); window.BP && window.BP.render(); }
      });
    });
    var exPrev = document.getElementById('exPrev');
    if (exPrev) exPrev.addEventListener('click', function () { if (window.EXAM()) { window.examGo(window.EXAM().i - 1); window.BP && window.BP.render(); } });
    var exNext = document.getElementById('exNext');
    if (exNext) exNext.addEventListener('click', function () { if (window.EXAM()) { window.examGo(window.EXAM().i + 1); window.BP && window.BP.render(); } });
    var exSubmit = document.getElementById('exSubmit');
    if (exSubmit) exSubmit.addEventListener('click', function () { if (window.EXAM()) { window.examSubmit(); window.BP && window.BP.render(); } });
    var exAgain = document.getElementById('exAgain');
    if (exAgain) exAgain.addEventListener('click', function () { window.examReset(); window.BP && window.BP.render(); });
    var exBegin = document.getElementById('exBegin');
    if (exBegin) exBegin.addEventListener('click', function () { window.examBegin(); window.BP && window.BP.render(); });
    var exReview = document.getElementById('exReview');
    if (exReview) exReview.addEventListener('click', function () {
      window.examMarkReview();
      var e = window.EXAM();
      if (!e) return;
      exReview.classList.toggle('on', !!e.review[e.i]);
      var chip = document.querySelector('#view .fchip[data-pal="' + e.i + '"]');
      if (chip) chip.classList.toggle('rev', !!e.review[e.i]);
    });
    document.querySelectorAll('[data-rev]').forEach(function (b) {
      b.addEventListener('click', function () {
        window.__revTab = b.dataset.rev;
        document.querySelectorAll('[data-rev]').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        if (window.BP) window.BP.render();
      });
    });
    var assBox = document.getElementById('assBox');
    if (assBox) assBox.addEventListener('input', function () {
      clearTimeout(window.__assT);
      var v = assBox.value;
      window.__assT = setTimeout(function () { window.assistAsk(v); }, 220);
    });
    document.querySelectorAll('[data-assub]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.assub;
        var ch = null;
        try { ch = window.chapters(k)[0]; } catch (e) {}
        if (ch) { location.hash = '#/subject/' + k; }
      });
    });

    // ---- profile settings ----
    function applyPrefs() {
      var theme = 'system', fs = 'normal';
      try { theme = localStorage.getItem('bp_theme') || 'system'; } catch (e) {}
      try { fs = localStorage.getItem('bp_fs') || 'normal'; } catch (e) {}
      var dark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.documentElement.dataset.fs = fs;
      var mt = document.querySelector('meta[name="theme-color"]');
      if (mt) mt.setAttribute('content', dark ? '#0B1120' : (window.BP && window.BP.state ? (BP.board().color || '#4f46e5') : '#4f46e5'));
    }
    window.applyPrefs = applyPrefs;
    applyPrefs();
    if (window.matchMedia) {
      try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyPrefs); } catch (e) {}
    }
    function toast(msg) {
      var t = document.getElementById('toast');
      if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(window.__toastT);
      window.__toastT = setTimeout(function () { t.classList.remove('show'); }, 1800);
    }
    window.toast = toast;

    document.querySelectorAll('[data-theme-set]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-theme-set]').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        try { localStorage.setItem('bp_theme', b.dataset.themeSet); } catch (e) {}
        applyPrefs();
        toast(L('Theme badal gayi', 'थीम बदल गई'));
      });
    });
    document.querySelectorAll('[data-fs-set]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-fs-set]').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        try { localStorage.setItem('bp_fs', b.dataset.fsSet); } catch (e) {}
        applyPrefs();
        toast(L('Text size badla', 'टेक्स्ट साइज़ बदला'));
      });
    });
    var setName = document.getElementById('setName');
    if (setName) setName.addEventListener('input', function () {
      try { localStorage.setItem('bp_name', setName.value); } catch (e) {}
    });
    var setLang = document.getElementById('setLang');
    if (setLang) setLang.addEventListener('click', function () {
      window.BP.state.lang = window.BP.state.lang === 'en' ? 'hi' : 'en';
      try { localStorage.setItem('bp_lang', window.BP.state.lang); } catch (e) {}
      window.BP.render();
    });
    var setBoard = document.getElementById('setBoard');
    if (setBoard) setBoard.addEventListener('click', function (e) {
      e.preventDefault();
      var sheet = document.getElementById('boardSheet');
      if (sheet) sheet.hidden = false;
    });
    var bkExport = document.getElementById('bkExport');
    if (bkExport) bkExport.addEventListener('click', function () {
      try {
        var payload = { app: 'BoardPrep', version: 3, exported: new Date().toISOString(), study: window.STUDY ? window.STUDY.data() : null, prefs: {} };
        ['bp_board', 'bp_lang', 'bp_theme', 'bp_fs', 'bp_name'].forEach(function (k) { try { payload.prefs[k] = localStorage.getItem(k); } catch (e) {} });
        var blob = new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'boardprep-backup.json';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        toast(L('Backup download ho gaya', 'बैकअप डाउनलोड हो गया'));
      } catch (e) { toast(L('Backup nahi ho paya', 'बैकअप नहीं हो पाया')); }
    });
    var bkRestore = document.getElementById('bkRestore');
    if (bkRestore) bkRestore.addEventListener('click', function () {
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'application/json,.json';
      inp.onchange = function () {
        var f = inp.files && inp.files[0];
        if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          try {
            var d = JSON.parse(String(r.result));
            if (d && d.study) { try { localStorage.setItem('bp_study_v1', JSON.stringify(d.study)); } catch (e) {} }
            if (d && d.prefs) { Object.keys(d.prefs).forEach(function (k) { if (d.prefs[k] !== null) { try { localStorage.setItem(k, d.prefs[k]); } catch (e) {} } }); }
            window.STUDY && window.STUDY.save();
            window.BP.render();
            toast(L('Backup restore ho gaya', 'बैकअप रिस्टोर हो गया'));
          } catch (e) { toast(L('File sahi nahi hai', 'फ़ाइल सही नहीं है')); }
        };
        r.readAsText(f);
      };
      inp.click();
    });
    var bkClear = document.getElementById('bkClear');
    if (bkClear) bkClear.addEventListener('click', function () {
      if (!confirm(L('Saari progress mitayen?', 'सारी प्रगति मिटाएँ?'))) return;
      if (window.STUDY) window.STUDY.clear();
      window.BP.render();
      toast(L('Progress clear ho gayi', 'प्रगति साफ़ हो गई'));
    });

    // ---- personal notes ----
    var nnAdd = document.getElementById('nnAdd');
    if (nnAdd) nnAdd.addEventListener('click', function () {
      var subj = (document.getElementById('nnSubj') || {}).value || '';
      var chap = (document.getElementById('nnChap') || {}).value || '';
      var text = (document.getElementById('nnText') || {}).value || '';
      if (!text.trim()) { if (window.toast) window.toast(L('Pehle note likho', 'पहले नोट लिखो')); return; }
      window.STUDY.noteAdd(subj, chap, text.trim());
      window.BP && window.BP.render();
      if (window.toast) window.toast(L('Note save ho gayi', 'नोट सहेज ली गई'));
    });
    document.querySelectorAll('.nt-edit').forEach(function (ta) {
      ta.addEventListener('input', function () {
        clearTimeout(window.__ntT);
        window.__ntT = setTimeout(function () {
          window.STUDY.noteUpdate(ta.dataset.id, ta.value);
          var st = document.querySelector('.nt-stat[data-id="' + ta.dataset.id + '"]');
          if (st) st.textContent = L('Apne aap save ho gayi', 'अपने-आप सहेज हो गई') + ' ✓';
        }, 400);
      });
    });
    document.querySelectorAll('.nt-del').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!confirm(L('Note hatao?', 'नोट हटाओ?'))) return;
        window.STUDY.noteDel(b.dataset.id);
        window.BP && window.BP.render();
      });
    });
    var nnSearch = document.getElementById('nnSearch');
    if (nnSearch) nnSearch.addEventListener('input', function () {
      var w = nnSearch.value.trim().toLowerCase();
      document.querySelectorAll('.note-card').forEach(function (c) {
        var t = (c.querySelector('.nt-edit') || {}).value || '';
        c.style.display = (!w || t.toLowerCase().indexOf(w) >= 0) ? '' : 'none';
      });
    });
    var nnExport = document.getElementById('nnExport');
    if (nnExport) nnExport.addEventListener('click', function () {
      try {
        var blob = new Blob([window.STUDY.noteExport()], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'boardprep-notes.json';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        if (window.toast) window.toast(L('Notes export ho gayi', 'नोट्स एक्सपोर्ट हो गए'));
      } catch (e) { if (window.toast) window.toast(L('Export nahi ho paya', 'एक्सपोर्ट नहीं हो पाया')); }
    });

    // ---- flashcards ----
    function fcShow() {
      var cards = window.__fcCards || [];
      var i = window.__fcIdx || 0;
      if (!cards.length) return;
      var q = cards[i];
      var qEl = document.getElementById('fcQ');
      if (!qEl) return;
      qEl.textContent = q.q;
      var ai = String(q.ans || '').toUpperCase().charCodeAt(0) - 65;
      var o = document.getElementById('fcOpts');
      if (o) o.innerHTML = (q.opts || []).map(function (x, k) {
        return '<div class="fc-opt' + (window.__fcFlipped ? (k === ai ? ' ok' : ' dim') : '') + '">' + 'ABCD'[k] + '. ' + esc(x) + '</div>';
      }).join('');
      var ans = document.getElementById('fcAns');
      if (ans) ans.innerHTML = '<b>' + esc(L('Sahi uttar', 'सही उत्तर')) + ':</b> ' + esc(q.ans) +
        (q.exp ? '<div class="t-secondary" style="margin-top:6px">' + esc(q.exp) + '</div>' : '');
      var st = document.getElementById('fcStat');
      if (st) st.textContent = (i + 1) + '/' + cards.length;
      var face = document.getElementById('fcFace'), back = document.getElementById('fcBack');
      if (face) face.hidden = !!window.__fcFlipped;
      if (back) back.hidden = !window.__fcFlipped;
      var msg = document.getElementById('fcMsg');
      if (msg) msg.textContent = L('Pehle khud socho, phir flip karo — ya seedha "aaya/nahi aaya" dabao.', 'पहले खुद सोचो, फिर फ़्लिप करो — या सीधे "आ गया/नहीं आया" दबाओ।');
    }
    var fcCard = document.getElementById('fcCard');
    if (fcCard) fcCard.addEventListener('click', function () { window.__fcFlipped = !window.__fcFlipped; fcShow(); });
    var fcFlip = document.getElementById('fcFlip');
    if (fcFlip) fcFlip.addEventListener('click', function () { window.__fcFlipped = !window.__fcFlipped; fcShow(); });
    function fcNext() { window.__fcIdx = ((window.__fcIdx || 0) + 1) % ((window.__fcCards || []).length || 1); window.__fcFlipped = false; fcShow(); }
    function fcAns(know) {
      var cards = window.__fcCards || [];
      if (!cards.length) return;
      if (know) window.__fcKnown++; else window.__fcUnknown++;
      if (window.__fcIdx >= cards.length - 1) {
        var msg = document.getElementById('fcMsg');
        if (msg) msg.textContent = L('Ho gaya! Aaya ' + window.__fcKnown + ' · Nahi aaya ' + window.__fcUnknown + '. Dobara se khelo ya kisi aur chapter ka card banao.', 'हो गया! आ गया ' + window.__fcKnown + ' · नहीं आया ' + window.__fcUnknown + '। दोबारा खेलो या किसी और अध्याय का कार्ड बनाओ।');
      }
      fcNext();
    }
    var fcYes = document.getElementById('fcYes');
    if (fcYes) fcYes.addEventListener('click', function () { fcAns(true); });
    var fcNo = document.getElementById('fcNo');
    if (fcNo) fcNo.addEventListener('click', function () { fcAns(false); });
    var fcReset = document.getElementById('fcReset');
    if (fcReset) fcReset.addEventListener('click', function () { window.__fcIdx = 0; window.__fcFlipped = false; window.__fcKnown = 0; window.__fcUnknown = 0; fcShow(); });
    if (window.__fcCards && document.getElementById('fcCard')) fcShow();

    // ---- study room ----
    var rmCode = document.getElementById('rmCode');
    var rmName = document.getElementById('rmName');
    var rmStat = document.getElementById('rmStat');
    var rmChat = document.getElementById('rmChat');
    var rmPoll = document.getElementById('rmPoll');
    function rmRender(room) {
      if (!rmChat) return;
      var h = '<div class="board-group">' + esc(L('Room', 'रूम')) + ' ' + esc(room.code) + ' · ' +
        room.members.length + ' ' + esc(L('log', 'लोग')) + '</div>';
      (room.msgs || []).slice(-30).forEach(function (m) {
        h += '<div class="imp-item" style="margin-bottom:6px"><div class="num" style="background:#e0e7ff;color:#3730a3">' + esc(m.n) + '</div><div>' +
          '<div class="iq">' + esc(m.t) + '</div><div class="t-small">' + new Date(m.ts).toLocaleTimeString() + '</div></div></div>';
      });
      rmChat.innerHTML = h;
    }
    function rmRefresh() {
      var code = rmPoll && rmPoll.getAttribute('data-code');
      if (!code || !window.Cloud || !window.Cloud.ready()) return;
      window.Cloud.roomGet(code).then(function (r) { if (r && r.ok) rmRender(r.room); }).catch(function () { });
    }
    if (document.getElementById('rmCreate') || document.getElementById('rmJoin')) {
      var rmGo = function (create) {
        var code = (rmCode.value || '').trim().toLowerCase();
        var name = (rmName.value || '').trim() || 'student';
        if (!code) { rmStat.textContent = L('Code likho', 'कोड लिखो'); return; }
        if (!window.Cloud || !window.Cloud.ready()) { rmStat.textContent = L('Cloud API set nahi — worker deploy karo (guide dekho)', 'क्लाउड API सेट नहीं — worker deploy करो (गाइड देखो)'); return; }
        try { localStorage.setItem('bp_name', name); } catch (e) { }
        var p = create ? window.Cloud.roomCreate(code, name) : window.Cloud.roomJoin(code, name);
        p.then(function (r) {
          if (!r || !r.ok) { rmStat.textContent = (r && r.error) || 'fail'; return; }
          rmPoll.setAttribute('data-code', code);
          rmStat.textContent = '✓ ' + code;
          rmRender(r.room);
          clearInterval(window.__rmT);
          window.__rmT = setInterval(rmRefresh, 3000);
        }).catch(function (e) { rmStat.textContent = String(e.message || e); });
      };
      var rc = document.getElementById('rmCreate');
      if (rc) rc.addEventListener('click', function () { rmGo(true); });
      var rj = document.getElementById('rmJoin');
      if (rj) rj.addEventListener('click', function () { rmGo(false); });
      var rs = document.getElementById('rmSend');
      if (rs) rs.addEventListener('click', function () {
        var code = rmPoll.getAttribute('data-code');
        var msg = (document.getElementById('rmMsg').value || '').trim();
        var name = (rmName.value || '').trim() || 'student';
        if (!code || !msg) return;
        window.Cloud.roomPost(code, name, msg).then(function (r) {
          if (r && r.ok) { rmRender(r.room); document.getElementById('rmMsg').value = ''; }
        }).catch(function () { });
      });
    }

    var tgSkip = document.getElementById('tgSkip');
    if (tgSkip) tgSkip.addEventListener('click', function () {
      try { localStorage.setItem('bp_target_skip', '1'); } catch (e) { }
    });
    var tgSyl = document.getElementById('tgSyl');
    if (tgSyl) tgSyl.addEventListener('input', function () {
      var v = document.getElementById('tgSylV'); if (v) v.textContent = tgSyl.value + '%';
    });
    var tgSave = document.getElementById('tgSave');
    if (tgSave) tgSave.addEventListener('click', function () {
      var exam = document.getElementById('tgExam').value;
      var syl = Number(document.getElementById('tgSyl').value) || 100;
      var daily = Number(document.getElementById('tgDaily').value) || 20;
      var time = document.getElementById('tgTime').value || '07:00';
      if (!exam) { var o = document.getElementById('tgOut'); if (o) o.textContent = L('Tareekh chuno', 'तारीख चुनो'); return; }
      var p = time.split(':');
      window.STUDY.targetSet({ exam: exam, syllabus: syl, daily: daily, time: time });
      window.STUDY.reminderSet({ on: true, time: time, min: (parseInt(p[0], 10) * 60 + parseInt(p[1], 10)), last: '' });
      var c = window.STUDY.countdown();
      var o2 = document.getElementById('tgOut');
      if (o2) o2.textContent = c ? ('✓ ' + c.days + ' ' + L('din bache', 'दिन बचे') + ' · ' + c.perDay + '/' + L('din', 'दिन')) : '';
      setTimeout(function () { location.hash = '#/'; }, 600);
    });

    var appExit = document.getElementById('appExit');
    if (appExit) appExit.addEventListener('click', function () {
      if (window.BPApp && window.BPApp.exit) window.BPApp.exit();
    });

    // ---- question bank ----
    function fillBankChaps() {
      var subj = window.BP.state.bankSubj || 'all';
      var sel = document.getElementById('bkChap');
      if (!sel) return;
      var chaps = [];
      try { chaps = subj === 'all' ? [] : window.BP.chapters(subj); } catch (e) {}
      var cur = window.BP.state.bankChap || 'all';
      sel.innerHTML = '<option value="all">' + esc(L('Sab chapters', 'सभी अध्याय')) + '</option>' +
        chaps.map(function (c) { return '<option value="' + esc(c) + '"' + (cur === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('');
    }
    document.querySelectorAll('[data-bsub]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-bsub]').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        window.BP.state.bankSubj = b.dataset.bsub;
        window.BP.state.bankChap = 'all'; window.BP.state.bankPage = 0;
        fillBankChaps(); renderBank();
      });
    });
    document.querySelectorAll('[data-btype]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-btype]').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        window.BP.state.bankType = b.dataset.btype; window.BP.state.bankPage = 0; renderBank();
      });
    });
    document.querySelectorAll('[data-bans]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-bans]').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        window.BP.state.bankAns = b.dataset.bans; window.BP.state.bankPage = 0; renderBank();
      });
    });
    var bkChap = document.getElementById('bkChap');
    if (bkChap) bkChap.addEventListener('change', function () { window.BP.state.bankChap = bkChap.value; window.BP.state.bankPage = 0; renderBank(); });
    var bkSearch = document.getElementById('bkSearch');
    if (bkSearch) bkSearch.addEventListener('input', function () {
      clearTimeout(window.__bkT);
      var v = bkSearch.value;
      window.__bkT = setTimeout(function () { window.BP.state.bankWord = v; window.BP.state.bankPage = 0; renderBank(); }, 180);
    });
    var bkPrev = document.getElementById('bkPrev');
    if (bkPrev) bkPrev.addEventListener('click', function () { window.BP.state.bankPage = Math.max(0, (window.BP.state.bankPage || 0) - 1); renderBank(); });
    var bkNext = document.getElementById('bkNext');
    if (bkNext) bkNext.addEventListener('click', function () { window.BP.state.bankPage = (window.BP.state.bankPage || 0) + 1; renderBank(); });
    if (document.getElementById('bkList')) { fillBankChaps(); renderBank(); }

    var rmSave = document.getElementById('rmSave');
    if (rmSave) rmSave.addEventListener('click', function () {
      var on = document.getElementById('rmOn').checked;
      var t = document.getElementById('rmTime').value || '18:00';
      var msg = document.getElementById('rmMsg').value || 'Abhi padho! Daily goal poora karo.';
      var parts = t.split(':');
      window.STUDY.reminderSet({ on: on, time: t, min: (parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)), msg: msg });
      var o = document.getElementById('rmOut');
      if (o) o.textContent = on ? L('Sanjaya gaya — roz ' + t, 'सहेजा गया — रोज़ ' + t) : L('Band kiya gaya', 'बंद किया गया');
    });
    var rmTest = document.getElementById('rmTest');
    if (rmTest) rmTest.addEventListener('click', function () {
      var o = document.getElementById('rmOut');
      var msg = document.getElementById('rmMsg').value || 'Abhi padho!';
      if ('Notification' in window) {
        Notification.requestPermission().then(function (p) {
          if (p === 'granted') { new Notification('BoardPrep', { body: msg }); if (o) o.textContent = '✓ ' + msg; }
          else if (o) o.textContent = L('Permission nahi mili — in-app reminder kaam karega', 'अनुमति नहीं मिली — इन-ऐप अनुस्मारक काम करेगा');
        });
      } else if (o) o.textContent = L('Is device par Notification nahi (in-app reminder)', 'इस डिवाइस पर सूचना नहीं (इन-ऐप अनुस्मारक)');
    });

    var csUrl = document.getElementById('csUrl');
    if (csUrl) csUrl.addEventListener('change', function () {
      var u = csUrl.value.trim();
      try { localStorage.setItem('bp_api_base', u); } catch (e) { }
      if (window.Cloud) window.Cloud.setBase(u);
      var o = document.getElementById('csOut');
      if (o) o.textContent = u ? ('✓ ' + u) : '—';
    });
    var csSave = document.getElementById('csSave');
    if (csSave) csSave.addEventListener('click', function () {
      var out = document.getElementById('csOut');
      if (!window.Cloud || !window.Cloud.ready()) { if (out) out.textContent = L('Cloud API set nahi — worker deploy karo (guide dekho)', 'क्लाउड API सेट नहीं — worker deploy करो (गाइड देखो)'); return; }
      var data = {};
      try {
        data = {
          study: (window.STUDY && window.STUDY.data) ? window.STUDY.data() : {},
          target: (window.STUDY && window.STUDY.targetGet) ? window.STUDY.targetGet() : null
        };
      } catch (e) { }
      window.Cloud.syncPush(data).then(function (r) {
        if (out) out.textContent = (r && r.ok) ? ('✓ ' + new Date().toLocaleTimeString()) : ((r && r.error) || 'fail');
      }).catch(function (e) { if (out) out.textContent = String(e.message || e); });
    });
    var csLoad = document.getElementById('csLoad');
    if (csLoad) csLoad.addEventListener('click', function () {
      var out = document.getElementById('csOut');
      if (!window.Cloud || !window.Cloud.ready()) { if (out) out.textContent = L('Cloud API set nahi — worker deploy karo (guide dekho)', 'क्लाउड API सेट नहीं — worker deploy करो (गाइड देखो)'); return; }
      window.Cloud.syncPull().then(function (r) {
        if (!r || !r.ok || !r.data) { if (out) out.textContent = L('Cloud par kuch nahi mila', 'क्लाउड पर कुछ नहीं मिला'); return; }
        var ok = window.STUDY && window.STUDY.restore ? window.STUDY.restore(r.data) : false;
        if (out) out.textContent = ok ? ('✓ laa liya — ' + new Date(r.t).toLocaleString()) : 'load fail';
        if (ok) setTimeout(function () { window.BP && window.BP.render(); }, 500);
      }).catch(function (e) { if (out) out.textContent = String(e.message || e); });
    });

    var assAI = document.getElementById('assAI');
    if (assAI) assAI.addEventListener('click', function () {
      var q = (document.getElementById('assBox').value || '').trim();
      var out = document.getElementById('assAIOut');
      if (!q) { if (out) out.innerHTML = '<div class="empty">' + esc(L('Pehle sawal likho', 'पहले सवाल लिखो')) + '</div>'; return; }
      if (!window.Cloud || !window.Cloud.ready()) {
        if (out) out.innerHTML = '<div class="empty">' + esc(L('Cloud API set nahi — pehle worker deploy karo (guide dekho)।', 'क्लाउड API सेट नहीं — पहले worker deploy करो (गाइड देखो)।')) + '</div>';
        return;
      }
      if (out) out.innerHTML = '<div class="empty">' + esc(L('AI soch raha hai…', 'AI सोच रहा है…')) + '</div>';
      var notes = [];
      try {
        notes = window.STUDY.retrieve(q, 4).notes.map(function (n) {
          return n.ch + ' — ' + (n.blocks || []).map(btext).join(' ');
        });
      } catch (e) { }
      window.Cloud.ask(q, notes).then(function (r) {
        if (!out) return;
        out.innerHTML = (r && r.ok)
          ? '<div class="imp-item" style="border-color:#c4b5fd"><div class="iq">' + esc(r.answer) + '</div>' +
            '<div class="t-small">' + esc(L('Source: notes (RAG) + free model', 'स्रोत: नोट्स (RAG) + मुफ़्त मॉडल')) + '</div></div>'
          : '<div class="empty">' + esc((r && r.error) || 'AI nahi chala') + '</div>';
      }).catch(function (e) {
        if (out) out.innerHTML = '<div class="empty">' + esc(String(e.message || e)) + '</div>';
      });
    });

    document.querySelectorAll('[data-ct]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-ct]').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        window.BP.state.calcTab = b.dataset.ct;
        window.CalcTool.run();
      });
    });
    if (document.getElementById('calcBody')) { window.CalcTool.run(); }

    // ---- study timer ----
    function tmTick() {
      var el = document.getElementById('tmClock');
      var t = window.__tm || { acc: 0, running: false };
      if (!el) { if (window.__tmTick) { clearInterval(window.__tmTick); window.__tmTick = null; } return; }
      var cur = t.acc + (t.running ? (Date.now() - t.start) : 0);
      el.textContent = fmtSec(cur / 1000);
    }
    var tmStart = document.getElementById('tmStart');
    if (tmStart) tmStart.addEventListener('click', function () {
      var t = window.__tm || { acc: 0, running: false };
      if (t.running) return;
      t.start = Date.now(); t.running = true; window.__tm = t;
      if (!window.__tmTick) window.__tmTick = setInterval(tmTick, 500);
      tmStart.textContent = L('Chal raha hai…', 'चल रहा है…');
      var m = document.getElementById('tmMsg'); if (m) m.textContent = L('Padh rahe hain — pause dabao jab aaram chahiye.', 'पढ़ रहे हैं — पॉज़ दबाओ जब आराम चाहिए।');
    });
    var tmPause = document.getElementById('tmPause');
    if (tmPause) tmPause.addEventListener('click', function () {
      var t = window.__tm || { acc: 0, running: false };
      if (t.running) { t.acc += Date.now() - t.start; t.running = false; window.__tm = t; }
      if (window.__tmTick) { clearInterval(window.__tmTick); window.__tmTick = null; }
      tmTick();
      var m = document.getElementById('tmMsg'); if (m) m.textContent = L('Ruka hua — samay is waqt save nahi hoga.', 'रुका हुआ — समय इस वक़्त सहेजा नहीं जाएगा।');
    });
    var tmStop = document.getElementById('tmStop');
    if (tmStop) tmStop.addEventListener('click', function () {
      var t = window.__tm || { acc: 0, running: false };
      var cur = t.acc + (t.running ? (Date.now() - t.start) : 0);
      var secs = Math.floor(cur / 1000);
      if (secs > 0) {
        window.STUDY.markSec(secs);
        var m = document.getElementById('tmMsg');
        if (m) m.textContent = L('Session save: ' + fmtSec(secs) + ' record hua.', 'सत्र सहेजा: ' + fmtSec(secs) + ' रिकॉर्ड हुआ।');
        if (window.toast) window.toast(L('Samay save ho gaya', 'समय सहेज हो गया') + ' ✓');
      } else {
        var m2 = document.getElementById('tmMsg'); if (m2) m2.textContent = L('Pehle timer shuru karo.', 'पहले टाइमर शुरू करो।');
      }
      window.__tm = { acc: 0, running: false };
      if (window.__tmTick) { clearInterval(window.__tmTick); window.__tmTick = null; }
      var c = document.getElementById('tmClock'); if (c) c.textContent = '00:00';
      var s = document.getElementById('tmStart'); if (s) s.textContent = L('Shuru', 'शुरू');
      var td = document.getElementById('tmToday');
      if (td) { var st = window.STUDY.stats(); td.innerHTML = esc(L('Aaj ka samay', 'आज का समय')) + ': <b class="t-num">' + fmtSec((st.last7[0] || {}).secs || 0) + '</b>'; }
    });

    // ---- planner goal ----
    document.querySelectorAll('[data-goal]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-goal]').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        window.STUDY.setGoal(Number(b.dataset.goal));
        if (window.toast) window.toast(L('Daily goal set: ' + b.dataset.goal, 'रोज़ का लक्ष्य: ' + b.dataset.goal));
        window.BP && window.BP.render();
      });
    });

    // ---- spaced repetition answer ----
    document.querySelectorAll('[data-revans]').forEach(function (b) {
      b.addEventListener('click', function () {
        var raw = b.getAttribute('data-revans');
        var sep = raw.lastIndexOf('|');
        var id = decodeURIComponent(raw.slice(0, sep));
        var ok = raw.slice(sep + 1) === '1';
        window.STUDY.revAnswer(id, ok);
        if (window.toast) window.toast(ok ? L('Agla revision ' + window.STUDY.revIntervals[0] + ' din baad', 'अगला रिवीज़न ' + window.STUDY.revIntervals[0] + ' दिन बाद') : L('Phir se aaj', 'फिर से आज'));
        window.BP && window.BP.render();
      });
    });

    // exam live timer (1s tick) + auto submit
    if (window.__exTick) { clearInterval(window.__exTick); window.__exTick = null; }
    if (window.EXAM && window.EXAM() && !window.EXAM().done) {
      window.__exTick = setInterval(function () {
        var e = window.EXAM();
        if (!e || e.done) { clearInterval(window.__exTick); window.__exTick = null; return; }
        var left = e.end - Date.now();
        var el = document.getElementById('exTime');
        if (el) {
          var mm = Math.max(0, Math.floor(left / 60000)), ss = Math.max(0, Math.floor((left % 60000) / 1000));
          el.textContent = mm + ':' + String(ss).padStart(2, '0');
        }
        if (left <= 0) {
          clearInterval(window.__exTick); window.__exTick = null;
          if (window.examSubmit) window.examSubmit();
          if (window.BP) window.BP.render();
        }
      }, 1000);
    }

    // lab
    var mix = document.getElementById('labMix');
    if (mix) {
      state.labA = state.labA || null;
      state.labB = state.labB || null;
      var slotA = document.getElementById('slotA'), slotB = document.getElementById('slotB');
      function paintSlot(el, r) {
        if (!el) return;
        if (!r) { el.innerHTML = esc(t('lab_drop')); return; }
        el.innerHTML = '<div class="reagent"><b>' + esc(r.hi || r.name) + '</b><br><span style="color:var(--muted)">' + esc(r.f || '') + '</span></div>';
      }
      paintSlot(slotA, reagentById(state.labA));
      paintSlot(slotB, reagentById(state.labB));
      document.querySelectorAll('.reagent-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          var id = chip.dataset.r;
          if (!state.labA || state.labA === id) { state.labA = id; state.labB = state.labB === id ? null : state.labB; }
          else state.labB = id;
          paintSlot(slotA, reagentById(state.labA));
          paintSlot(slotB, reagentById(state.labB));
        });
        chip.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', chip.dataset.r); });
      });
      [slotA, slotB].forEach(function (slot, idx) {
        if (!slot) return;
        slot.addEventListener('dragover', function (e) { e.preventDefault(); slot.classList.add('over'); });
        slot.addEventListener('dragleave', function () { slot.classList.remove('over'); });
        slot.addEventListener('drop', function (e) {
          e.preventDefault(); slot.classList.remove('over');
          var id = e.dataTransfer.getData('text/plain');
          if (idx === 0) state.labA = id; else state.labB = id;
          paintSlot(slotA, reagentById(state.labA));
          paintSlot(slotB, reagentById(state.labB));
        });
      });
      mix.addEventListener('click', mixReagents);
      var clr = document.getElementById('labClear');
      if (clr) clr.addEventListener('click', function () {
        state.labA = null; state.labB = null;
        paintSlot(slotA, null); paintSlot(slotB, null);
        document.getElementById('labOut').innerHTML = '';
      });
    }

    // math lab
    var ml = document.getElementById('mlCheck');
    if (ml) {
      ml.addEventListener('click', function () {
        var F = window.FORMULAS || [];
        var items = [];
        F.forEach(function (sec) { if (sec.subj === 'maths') sec.items.forEach(function (it) { items.push(it); }); });
        document.querySelectorAll('[data-ml]').forEach(function (inp) {
          var i = Number(inp.dataset.ml);
          var it = items[i];
          if (!it) return;
          var got = BP.norm(inp.value);
          var want = BP.norm(it.f);
          var out = document.querySelector('[data-mlout="' + i + '"]');
          if (!got) { out.textContent = ''; return; }
          var ok = got === want || want.indexOf(got) !== -1;
          out.textContent = ok ? '✓ ' + esc(t('mathlab_answer')) + ': ' + it.f : '✗ ' + esc(t('mathlab_wrong')) + ' — ' + it.f;
          out.style.color = ok ? '#0f9d58' : '#dc2626';
        });
      });
    }

    // brain
    var bs = document.getElementById('brainStart');
    if (bs) bs.addEventListener('click', function () {
      state.brain = { i: 0, ans: {}, ok: 0, done: false };
      BP.render();
    });
    document.querySelectorAll('.opt[data-bk]').forEach(function (o) {
      o.addEventListener('click', function () {
        var b = window.BRAIN;
        var i = state.brain.i;
        var k = Number(o.dataset.bk);
        state.brain.ans[i] = k;
        if (k === b.items[i].a) state.brain.ok++;
        state.brain.i++;
        if (state.brain.i >= b.items.length) state.brain.done = true;
        BP.render();
      });
    });
    var ba = document.getElementById('brainAgain');
    if (ba) ba.addEventListener('click', function () { state.brain = null; BP.render(); });

    // diagrams: remember current id for hotspot lookup
    var h = location.hash.replace(/^#/, '') || '/';
    var parts = h.split('/').filter(Boolean);
    state.dgId = parts[0] === 'diagram' ? parts[1] : null;
  }

  window.Tools = { route: route, bind: bind, chapterList: vChapterList };
  // app.js boot tools.js से पहले हो जाता है — इसलिए एक बार फिर render
  if (window.BP) BP.render();
})();
