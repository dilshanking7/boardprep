// BoardPrep — subject tools / calculators (offline, free)
// Rasayan: molar mass, pH; Bhautik: Ohm, darpan/lens; Jeev: Punnett; Ganit: quadratic, stats, HCF/LCM
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function num(v) { return parseFloat(v); }
  function f2(x) { return Math.round(x * 100) / 100; }
  function L(h, e) { return (window.BP && window.BP.state.lang === 'en') ? e : h; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  var MASS = {};
  (window.PERIODIC || []).forEach(function (e) { MASS[e.s] = e.m; });

  // formula parser: H2SO4, Ca(OH)2, CuSO4.5H2O, [Cu(NH3)4]SO4
  function molarMass(formula) {
    var s = formula.replace(/\s+/g, '');
    var i = 0;

    function readElement() {
      var c = s[i];
      var sym = c; i++;
      while (i < s.length && /[a-z]/.test(s[i])) { sym += s[i]; i++; }
      if (!MASS[sym]) throw new Error('Unknown element: ' + sym);
      var cnt = '';
      while (i < s.length && /\d/.test(s[i])) { cnt += s[i]; i++; }
      return { sym: sym, n: parseInt(cnt || '1', 10) };
    }

    function multPart(s, k) {
      var m = /^(\d+)?(.*)$/.exec(s);
      var n = m[1] ? parseInt(m[1], 10) : 1;
      return (n * k) + m[2];
    }

    function readGroup(end) {
      var t = 0, p = [];
      while (i < s.length) {
        var c = s[i];
        if (end && c === end) { i++; break; }
        if (c === '(' || c === '[') {
          var close = c === '(' ? ')' : ']';
          i++;
          var inner = readGroup(close);
          var cnt = '';
          while (i < s.length && /\d/.test(s[i])) { cnt += s[i]; i++; }
          var n = parseInt(cnt || '1', 10);
          t += inner.t * n; p = p.concat(inner.p.map(function (x) { return multPart(x, n); }));
        } else if (c === '.') {
          i++;
          var coef = '';
          while (i < s.length && /\d/.test(s[i])) { coef += s[i]; i++; }
          var m2 = parseInt(coef || '1', 10);
          var t2 = 0, p2 = [];
          while (i < s.length && s[i] !== '.') {
            var c2 = s[i];
            if (c2 === '(' || c2 === '[') {
              var cl2 = c2 === '(' ? ')' : ']';
              i++;
              var in2 = readGroup(cl2);
              var c3 = '';
              while (i < s.length && /\d/.test(s[i])) { c3 += s[i]; i++; }
              var n3 = parseInt(c3 || '1', 10);
              t2 += in2.t * n3; p2 = p2.concat(in2.p);
            } else if (/[A-Z]/.test(c2)) {
              var e2 = readElement();
              t2 += MASS[e2.sym] * e2.n;
              p2.push(e2.n + e2.sym);
            } else { i++; }
          }
          t += t2 * m2;
          p = p.concat(p2.map(function (x) { return multPart(x, m2); }));
        } else if (/[A-Z]/.test(c)) {
          var e = readElement();
          t += MASS[e.sym] * e.n;
          p.push(e.n + e.sym);
        } else { i++; }
      }
      return { t: t, p: p };
    }

    var r = readGroup(null);
    if (!r.t) throw new Error('empty');
    return { mass: f2(r.t), parts: r.p.join(' ') };
  }

  function punnett(a, b) {
    var ga = a.split(''), gb = b.split('');
    var cells = [];
    ga.forEach(function (x) { gb.forEach(function (y) { cells.push(x + y); }); });
    var count = {};
    cells.forEach(function (c) { var k = c.split('').sort().join(''); count[k] = (count[k] || 0) + 1; });
    var rows = Object.keys(count).map(function (k) { return [k, count[k] + '/4']; });
    return { cells: cells, rows: rows };
  }

  function vCalc() {
    var h = '<section class="section"><div class="section-head"><h2>' + esc(L('Subject tools', 'विषय टूल')) + '</h2>' +
      '<span class="note">' + esc(L('offline calculator', 'ऑफ़लाइन कैलकुलेटर')) + '</span></div>';
    h += '<div class="chips" id="calcTabs">' + [['chem', L('Rasayan', 'रसायन')], ['phys', L('Bhautik', 'भौतिक')], ['bio', L('Jeev', 'जीव')], ['math', L('Ganit', 'गणित')]].map(function (t, i) {
      return '<button class="fchip' + (i === 0 ? ' on' : '') + '" data-ct="' + t[0] + '">' + esc(t[1]) + '</button>';
    }).join('') + '</div>';
    h += '<div id="calcBody"></div>';
    h += '<div class="note">' + esc(L('Sirf practice ke liye — asli exam me calculator use nahi hota (verify).', 'सिर्फ अभ्यास के लिए — असली परीक्षा में कैलकुलेटर काम में नहीं (verify)।')) + '</div>';
    return h + '</section>';
  }

  function calcBody(tab) {
    var h = '';
    if (tab === 'chem') {
      h += '<div class="board-group">' + esc(L('Molar mass (यौगिक का द्रव्यमान)', 'मोलर द्रव्यमान')) + '</div>';
      h += '<div class="field"><input id="cmF" placeholder="H2SO4 / Ca(OH)2 / CuSO4.5H2O"></div>';
      h += '<button class="btn btn-accent btn-block" id="cmGo">' + esc(L('Nikalo', 'निकालो')) + '</button><div id="cmOut" class="imp-item" style="margin-top:8px"></div>';
      h += '<div class="board-group" style="margin-top:14px">' + esc(L('pH ↔ [H+]', 'pH ↔ [H+]')) + '</div>';
      h += '<div class="field"><input id="phF" type="number" step="0.1" placeholder="' + esc(L('pH (0-14)', 'pH (0-14)')) + '"></div>';
      h += '<button class="btn btn-accent btn-block" id="phGo">' + esc(L('[H+] nikalo', '[H+] निकालो')) + '</button><div id="phOut" class="imp-item" style="margin-top:8px"></div>';
      h += '<div class="board-group" style="margin-top:14px">' + esc(L('pH se nirnay (उदाहरण)', 'pH से निर्णय (उदाहरण)')) + '</div>';
      h += '<div class="note">pH &lt; 7 = ' + esc(L('acidic', 'अम्लीय')) + ' · pH = 7 = ' + esc(L('neutral', 'उदासीन')) + ' · pH &gt; 7 = ' + esc(L('basic', 'क्षारीय')) + '</div>';
    } else if (tab === 'phys') {
      h += '<div class="board-group">' + esc(L('Ohm / Shakti', 'ओम / शक्ति')) + '</div>';
      h += '<div class="field"><input id="ohV" type="number" step="0.1" placeholder="V (volt)"></div>';
      h += '<div class="field"><input id="ohI" type="number" step="0.1" placeholder="I (ampere)"></div>';
      h += '<button class="btn btn-accent btn-block" id="ohGo">' + esc(L('R aur P nikalo', 'R और P निकालो')) + '</button><div id="ohOut" class="imp-item" style="margin-top:8px"></div>';
      h += '<div class="board-group" style="margin-top:14px">' + esc(L('Darpan / Lens formula', 'दर्पण / लेंस सूत्र')) + '</div>';
      h += '<div class="field"><input id="lfF" type="number" step="0.1" placeholder="f (cm)"></div>';
      h += '<div class="field"><input id="lfU" type="number" step="0.1" placeholder="u (cm)"></div>';
      h += '<button class="btn btn-accent btn-block" id="lfGo">' + esc(L('v nikalo', 'v निकालो')) + '</button><div id="lfOut" class="imp-item" style="margin-top:8px"></div>';
      h += '<div class="note">1/f = 1/v + 1/u · ' + esc(L('m = v/u = h\'/h', 'm = v/u = h\'/h')) + '</div>';
    } else if (tab === 'bio') {
      h += '<div class="board-group">' + esc(L('Punnett square (Mendel)', 'पुनेट वर्ग (मेंडल)')) + '</div>';
      h += '<div class="field"><input id="puA" value="Tt" maxlength="4" placeholder="' + esc(L('Parent 1', 'जनक 1')) + '"></div>';
      h += '<div class="field"><input id="puB" value="Tt" maxlength="4" placeholder="' + esc(L('Parent 2', 'जनक 2')) + '"></div>';
      h += '<button class="btn btn-accent btn-block" id="puGo">' + esc(L('Banavo', 'बनाओ')) + '</button><div id="puOut" class="imp-item" style="margin-top:8px"></div>';
      h += '<div class="note">' + esc(L('Udaharan: Tt x Tt → 1 TT : 2 Tt : 1 tt (3:1)', 'उदाहरण: Tt x Tt → 1 TT : 2 Tt : 1 tt (3:1)')) + '</div>';
    } else {
      h += '<div class="board-group">' + esc(L('Vargmool (ax²+bx+c=0)', 'वर्गमूल (ax²+bx+c=0)')) + '</div>';
      h += '<div class="field"><input id="qdA" type="number" step="0.1" value="1"></div>';
      h += '<div class="field"><input id="qdC" type="number" step="0.1" value="-3"></div>';
      h += '<div class="field"><input id="qdB" type="number" step="0.1" value="-2"></div>';
      h += '<button class="btn btn-accent btn-block" id="qdGo">' + esc(L('Mool nikalo', 'मूल निकालो')) + '</button><div id="qdOut" class="imp-item" style="margin-top:8px"></div>';
      h += '<div class="board-group" style="margin-top:14px">' + esc(L('HCF / LCM', 'मह. समा / ल. समा')) + '</div>';
      h += '<div class="field"><input id="hcA" type="number" value="12"></div>';
      h += '<div class="field"><input id="hcB" type="number" value="18"></div>';
      h += '<button class="btn btn-accent btn-block" id="hcGo">' + esc(L('Nikalo', 'निकालो')) + '</button><div id="hcOut" class="imp-item" style="margin-top:8px"></div>';
      h += '<div class="board-group" style="margin-top:14px">' + esc(L('Mean / Median / Mode', 'माध्य / माध्यिका / बहुलक')) + '</div>';
      h += '<div class="field"><input id="stN" placeholder="4, 8, 6, 5, 7"></div>';
      h += '<button class="btn btn-accent btn-block" id="stGo">' + esc(L('Nikalo', 'निकालो')) + '</button><div id="stOut" class="imp-item" style="margin-top:8px"></div>';
    }
    return h;
  }

  function run() {
    var tab = (window.BP.state.calcTab || 'chem');
    var b = $('calcBody');
    if (b) b.innerHTML = calcBody(tab);

    function out(id, html) { var e = $(id); if (e) e.innerHTML = html; }

    var cmGo = $('cmGo');
    if (cmGo) cmGo.onclick = function () {
      try {
        var r = molarMass($('cmF').value || '');
        out('cmOut', '<b>' + esc($('cmF').value) + '</b> → ' + r.mass + ' g/mol<div class="t-small">' + esc(L('Bibhajya: ' + r.parts, 'भाग: ' + r.parts)) + '</div>');
      } catch (e) { out('cmOut', '<span style="color:var(--color-accent)">' + esc(e.message) + '</span>'); }
    };
    var phGo = $('phGo');
    if (phGo) phGo.onclick = function () {
      var p = num($('phF').value);
      if (isNaN(p)) return out('phOut', '—');
      var h = Math.pow(10, -p);
      out('phOut', '[H+] = 10^-' + p + ' = ' + h.toExponential(3) + ' M');
    };
    var ohGo = $('ohGo');
    if (ohGo) ohGo.onclick = function () {
      var V = num($('ohV').value), I = num($('ohI').value);
      if (isNaN(V) || isNaN(I) || I === 0) return out('ohOut', '—');
      out('ohOut', 'R = V/I = ' + f2(V / I) + ' Ω · P = VI = ' + f2(V * I) + ' W');
    };
    var lfGo = $('lfGo');
    if (lfGo) lfGo.onclick = function () {
      var f = num($('lfF').value), u = num($('lfU').value);
      if (isNaN(f) || isNaN(u) || (f === 0) || (u + f === 0)) return out('lfOut', '—');
      var v = (f * u) / (u + f);
      out('lfOut', '1/v = 1/f - 1/u → v = ' + f2(v) + ' cm');
    };
    var puGo = $('puGo');
    if (puGo) puGo.onclick = function () {
      var a = ($('puA').value || '').trim(), b2 = ($('puB').value || '').trim();
      if (!a || !b2) return out('puOut', '—');
      var r = punnett(a, b2);
      out('puOut', 'Cells: ' + r.cells.join(' ') + '<div class="t-small">' + esc(L('Anupat: ', 'अनुपात: ')) + r.rows.map(function (x) { return x[0] + ' → ' + x[1]; }).join(' · ') + '</div>');
    };
    var qdGo = $('qdGo');
    if (qdGo) qdGo.onclick = function () {
      var a = num($('qdA').value), b2 = num($('qdB').value), c = num($('qdC').value);
      if (isNaN(a) || isNaN(b2) || isNaN(c)) return out('qdOut', '—');
      var D = b2 * b2 - 4 * a * c;
      if (D < 0) return out('qdOut', 'D = ' + f2(D) + ' → ' + esc(L('koi vastvik mool nahi', 'कोई वास्तविक मूल नहीं')));
      out('qdOut', 'D = ' + f2(D) + ' → mool: ' + f2((-b2 + Math.sqrt(D)) / (2 * a)) + ', ' + f2((-b2 - Math.sqrt(D)) / (2 * a)));
    };
    var hcGo = $('hcGo');
    if (hcGo) hcGo.onclick = function () {
      var a = Math.abs(parseInt($('hcA').value, 10)), b2 = Math.abs(parseInt($('hcB').value, 10));
      if (!a || !b2) return out('hcOut', '—');
      function g(x, y) { return y ? g(y, x % y) : x; }
      var g2 = g(a, b2);
      out('hcOut', 'HCF = ' + g2 + ' · LCM = ' + (a * b2 / g2));
    };
    var stGo = $('stGo');
    if (stGo) stGo.onclick = function () {
      var arr = ($('stN').value || '').split(',').map(function (x) { return parseFloat(x); }).filter(function (x) { return !isNaN(x); });
      if (!arr.length) return out('stOut', '—');
      var s = arr.slice().sort(function (x, y) { return x - y; });
      var mean = arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
      var med = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
      var cnt = {};
      arr.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; });
      var mode = Object.keys(cnt).map(function (k) { return [k, cnt[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
      out('stOut', esc(L('Mean ', 'माध्य ')) + f2(mean) + ' · ' + esc(L('Median ', 'माध्यिका ')) + med +
        ' · ' + esc(L('Mode ', 'बहुलक ')) + (mode[0][1] > 1 ? mode[0][0] + ' (' + mode[0][1] + '×)' : esc(L('nahi', 'नहीं'))));
    };
  }

  window.CalcTool = {
    view: vCalc,
    run: run
  };
})();
