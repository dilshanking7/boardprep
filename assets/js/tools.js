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
      ['#/notes', 'book', t('hub_notes'), t('hub_notes_sub')]
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

  var NOTE_SUBS = ['science', 'maths', 'sst_history', 'sst_geo', 'sst_civics', 'sst_econ', 'hindi', 'english', 'sanskrit'];

  function noteSubName(k) {
    var m = {
      science: 'विज्ञान', maths: 'गणित', sst_history: 'इतिहास', sst_geo: 'भूगोल',
      sst_civics: 'नागरिकशास्त्र', sst_econ: 'अर्थशास्त्र', hindi: 'हिंदी', english: 'English', sanskrit: 'संस्कृत'
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
      '<div class="note"><a href="downloads/BoardPrep-v2.0.apk" download style="color:var(--accent);font-weight:700">downloads/BoardPrep-v2.0.apk</a> (पूरा ऑफ़लाइन)</div></div></div>';
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
    if (offBtn) offBtn.addEventListener('click', function () {
      var urls = [];
      try {
        (window.BOARD_DATA.papers || []).forEach(function (p) { urls.push(p.url); });
        (window.SONGS || []).forEach(function (s) { urls.push(s.src); });
      } catch (e) {}
      var stat = document.getElementById('offStat');
      if (!('serviceWorker' in navigator)) {
        if (stat) stat.textContent = L('Is browser me offline support nahi hai', 'इस ब्राउज़र में ऑफ़लाइन सपोर्ट नहीं है');
        return;
      }
      if (stat) stat.textContent = L('Starting…', 'शुरू हो रहा है…');
      navigator.serviceWorker.ready.then(function (reg) {
        var ctrl = reg.active || reg.installing;
        if (!ctrl) { if (stat) stat.textContent = 'Service worker ready nahi hai'; return; }
        navigator.serviceWorker.addEventListener('message', function (ev) {
          var d = ev.data || {};
          if (d.type === 'CACHE_PROGRESS' && stat) stat.textContent = L('Ho gaya', 'हो गया') + ' ' + d.done + '/' + d.total;
          if (d.type === 'CACHE_DONE' && stat) stat.textContent = L('Done! Ab internet ke bina bhi sab chalega', 'हो गया! अब इंटरनेट के बिना भी सब चलेगा') + ' ✓';
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

  window.Tools = { route: route, bind: bind };
  // app.js boot tools.js से पहले हो जाता है — इसलिए एक बार फिर render
  if (window.BP) BP.render();
})();
