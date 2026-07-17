// ──────────────────────────────────────────────────────────────────────────────
// UI REMIX — presentational only. Wraps the LAST word of each step headline in a
// span.hl-word so CSS can render it as the light "highlight pill" from the design
// reference (e.g. PROJECT [TYPE]). Titles are plain static text with no handlers,
// so this touches no hooks and no logic. Safe to remove with its <script> tag.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';
  function wrap() {
    var titles = document.querySelectorAll('.step-title');
    for (var i = 0; i < titles.length; i++) {
      var h = titles[i];
      if (h.querySelector('.hl-word')) continue;        // already done
      if (h.children.length) continue;                  // only pure-text titles
      var text = (h.textContent || '').trim();
      var parts = text.split(/\s+/);
      if (parts.length < 2) continue;                   // single-word titles stay plain
      var last = parts.pop();
      h.textContent = parts.join(' ') + ' ';
      var s = document.createElement('span');
      s.className = 'hl-word';
      s.textContent = last;
      h.appendChild(s);
    }
  }
  if (document.readyState !== 'loading') wrap();
  else document.addEventListener('DOMContentLoaded', wrap);
})();
