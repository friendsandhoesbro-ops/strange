// ──────────────────────────────────────────────────────────────────────────────
// UI ICONS — presentational only. Swaps the emoji glyphs in the project-type bento
// tiles and the entity buttons for consistent ember stroke-SVGs (the "glowing lit
// illustration" language of the reference). Reads the card id (pt-<id>) / the
// button's data-entity to pick the icon; unmapped ids keep their emoji as fallback.
// Touches no onclick, no ids, no data — additive, removable with its <script> tag.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';
  function s(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var ICONS = {
    'company-website': s('<rect x="4" y="3" width="12" height="18" rx="1"/><path d="M16 8h4v13H4"/><path d="M8 7h4M8 11h4M8 15h4"/>'),
    'landing-page':    s('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>'),
    'portfolio':       s('<rect x="3" y="4" width="18" height="14" rx="2"/><circle cx="8.5" cy="9" r="1.6"/><path d="M4 17l4.5-4 3.5 3 3-2.5L20 17"/>'),
    'construction':    s('<path d="M3 21h18M6 21V10l6-4 6 4v11"/><path d="M9.5 21v-5h5v5"/><path d="M4 10l8-5 8 5"/>'),
    'law-firm':        s('<path d="M12 3v18M7 21h10M5 7h14M5 7l-2 5a3 3 0 006 0zM19 7l2 5a3 3 0 01-6 0z"/>'),
    'medical':         s('<path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"/><path d="M12 8v6M9 11h6"/>'),
    'saas':            s('<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>'),
    'marketplace':     s('<path d="M4 8h16l-1.2 11H5.2z"/><path d="M4 8l1.5-4h13L20 8"/><path d="M9 12v3M15 12v3"/>'),
    'crm':             s('<circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="12" cy="18" r="2.4"/><path d="M7.6 7.8l3 8M16.4 7.8l-3 8M8 6h8"/>'),
    'erp':             s('<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>'),
    'customer-portal': s('<circle cx="12" cy="9" r="3.4"/><path d="M5 20a7 7 0 0114 0"/><circle cx="12" cy="12" r="9.5"/>'),
    'ecommerce':       s('<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 016 0v2"/>'),
    'agency':          s('<circle cx="12" cy="12" r="8.5"/><circle cx="8.5" cy="9.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="9.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.1" fill="currentColor" stroke="none"/><path d="M15 14.5c2 0 3-1.2 3-3"/>'),
    'internal-tool':   s('<path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.7 2.7-2.3-2.3z"/>'),
    'dashboard':       s('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 15v3M12 10v8M17 13v5"/>'),
    'mobile-backend':  s('<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/><path d="M9 6h6"/>'),
    'custom':          s('<path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z"/><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>'),
  };
  var ENTITY = {
    business:   s('<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h3M13 7h3M8 11h3M13 11h3M8 15h3M13 15h3"/><path d="M10 21v-3h4v3"/>'),
    individual: s('<circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0114 0"/>'),
  };

  function paint() {
    // project bento tiles
    var cards = document.querySelectorAll('.project-card[id^="pt-"]');
    for (var i = 0; i < cards.length; i++) {
      var id = cards[i].id.replace(/^pt-/, '');
      var zone = cards[i].querySelector('.project-icon');
      if (zone && ICONS[id] && zone.querySelector('svg') === null) zone.innerHTML = ICONS[id];
    }
    // entity buttons
    var opts = document.querySelectorAll('.entity-opt[data-entity]');
    for (var j = 0; j < opts.length; j++) {
      var t = opts[j].getAttribute('data-entity');
      var g = opts[j].querySelector('.entity-emoji');
      if (g && ENTITY[t] && g.querySelector('svg') === null) g.innerHTML = ENTITY[t];
    }
  }

  function init() {
    var tries = 0;
    (function attempt() {
      paint();
      // project grid renders at app init; retry briefly until the cards exist
      if (document.querySelector('.project-card[id^="pt-"] .project-icon svg') || tries++ > 20) return;
      setTimeout(attempt, 60);
    })();
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
