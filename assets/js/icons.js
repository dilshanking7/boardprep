// BoardPrep — inline SVG icon set (24x24, stroke based, consistent)
// Android/iOS do not render emoji glyphs reliably, so SVG is used everywhere.
(function () {
  var S = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var E = '</svg>';
  var I = {
    home: S + '<path d="M3 11.2 12 4l9 7.2"/><path d="M5.5 9.6V20h13V9.6"/><path d="M10 20v-5.5h4V20"/>' + E,
    grid: S + '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>' + E,
    pencil: S + '<path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4z"/><path d="M13.5 6.5l4 4"/>' + E,
    sliders: S + '<circle cx="7" cy="7" r="2.2"/><circle cx="16.5" cy="12" r="2.2"/><circle cx="9.5" cy="17" r="2.2"/><path d="M7 9.2v5.6M3 7h1.8M9.2 7h4.3M14.3 12h-2M18.7 12H21M9.5 14.8V12M5.7 17h1.6M11.7 17h8.3"/>' + E,
    search: S + '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>' + E,
    cube: S + '<path d="M12 3 20 7.2v9.6L12 21l-8-4.2V7.2L12 3z"/><path d="M4 7.2 12 11l8-3.8M12 11v10"/>' + E,
    star: S + '<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.6z"/>' + E,
    sigma: S + '<path d="M6 4.5h12l-6.5 7.5 6.5 7.5H6"/><path d="M9 4.5 6 6.5M18 19.5l-3-2"/>' + E,
    atom: S + '<circle cx="12" cy="12" r="2.2"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>' + E,
    flask: S + '<path d="M9.5 3.5h5"/><path d="M10.5 3.5v5.5L5.8 18a2 2 0 0 0 1.8 3h8.8a2 2 0 0 0 1.8-3l-4.7-9V3.5"/><path d="M8 15h8"/>' + E,
    calc: S + '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 8h7"/><circle cx="8.8" cy="12.5" r="1.1"/><circle cx="12" cy="12.5" r="1.1"/><circle cx="15.2" cy="12.5" r="1.1"/><circle cx="8.8" cy="16.3" r="1.1"/><circle cx="12" cy="16.3" r="1.1"/><circle cx="15.2" cy="16.3" r="1.1"/>' + E,
    target: S + '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2"/>' + E,
    timeline: S + '<circle cx="5.5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="18.5" cy="12" r="2.2"/><path d="M7.7 12h2.1M14.2 12h2.1"/>' + E,
    book: S + '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5z"/><path d="M4 18.5h15M8.5 7.5h7"/>' + E,
    music: S + '<path d="M9 18.2V6.5l10-2v11.2"/><circle cx="6.8" cy="18.2" r="2.4"/><circle cx="16.8" cy="15.7" r="2.4"/>' + E,
    bulb: S + '<path d="M9.5 18h5"/><path d="M10.5 20.5h3"/><path d="M12 3.5a6 6 0 0 0-3.4 10.9c.6.5.9 1.2.9 1.9h5c0-.7.3-1.4.9-1.9A6 6 0 0 0 12 3.5z"/>' + E,
    papers: S + '<path d="M6 3.5h8l4 4v13H6V3.5z"/><path d="M14 3.5v4h4"/><path d="M8.5 12h7M8.5 15.5h7M8.5 18.5h4"/>' + E,
    download: S + '<path d="M12 3.5v11"/><path d="M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 19.5h15"/>' + E,
    board: S + '<path d="M5 20.5V4"/><path d="M5 5h13.5l-3 4 3 4H5"/>' + E,
    clock: S + '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>' + E,
    check: S + '<path d="M5 12.5 10 17.5 19 7"/>' + E,
    chevron: S + '<path d="M9 6l6 6-6 6"/>' + E,
    phone: S + '<rect x="6.5" y="3" width="11" height="18" rx="2.5"/><path d="M10.5 18.5h3"/>' + E,
    chart: S + '<path d="M4 20.5h16"/><path d="M7 20v-6M12 20V8M17 20v-9"/><circle cx="7" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="6" r="1.4" fill="currentColor"/><circle cx="17" cy="9" r="1.4" fill="currentColor"/>' + E,
    timer: S + '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5"/><path d="M9.5 2.5h5M12 2.5v3"/>' + E,
    refresh: S + '<path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4.5v4h-4"/>' + E,
    sparkle: S + '<path d="M12 3.5l1.7 4.6 4.6 1.7-4.6 1.7L12 16.1l-1.7-4.6-4.6-1.7 4.6-1.7L12 3.5z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z"/>' + E,
    user: S + '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20c.8-3.4 3.7-5.2 7.2-5.2s6.4 1.8 7.2 5.2"/>' + E,
    library: S + '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5H4V5.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5H20V5.5z"/>' + E,
    repeat: S + '<path d="M4 9a5 5 0 0 1 5-5h7"/><path d="M20 15a5 5 0 0 1-5 5H8"/><path d="M17 4.5 20 9h-4.5"/><path d="M7 19.5 4 15h4.5"/>' + E,
    bot: S + '<rect x="5" y="8" width="14" height="10" rx="3"/><path d="M12 8V4.5M8.5 13h.01M15.5 13h.01"/><path d="M9 16.2c.8.6 1.8.9 3 .9s2.2-.3 3-.9"/>' + E,
    moon: S + '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>' + E,
    sun: S + '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>' + E,
    bell: S + '<path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z"/><path d="M10 18a2 2 0 0 0 4 0"/>' + E,
    settings: S + '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7"/>' + E,
    leaf: S + '<path d="M5 19c0-8 5-13 14-13 0 9-5 13-13 13z"/><path d="M5 19c2-5 6-8 10-9"/>' + E,
    globe: S + '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.3-3.6-8.5s1.2-6.1 3.6-8.5z"/>' + E,
    landmark: S + '<path d="M3 20h18M4 20v-8M20 20v-8M8 20v-8M16 20v-8M12 20v-8M3 12l9-6 9 6z"/>' + E,
    clipboard: S + '<rect x="5" y="4.5" width="14" height="16" rx="2.5"/><path d="M9 4.5a3 3 0 0 1 6 0"/><path d="M8.5 12h7M8.5 15.5h7M8.5 18.5h4"/>' + E
  };

  function icon(name, size) {
    var s = I[name] || I.grid;
    if (size) s = s.replace('viewBox', 'width="' + size + '" height="' + size + '" viewBox');
    return s;
  }

  window.BP_ICONS = I;
  window.BP_ICON = icon;

  // Replace <span class="bp-ico" data-icon="home"></span> with SVG
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-icon]').forEach(function (el) {
      el.innerHTML = icon(el.dataset.icon);
    });
  });
})();
