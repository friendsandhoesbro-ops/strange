// ──────────────────────────────────────────────────────────────────────────────
// A11Y — keyboard operability for the app's clickable non-native controls.
// The wizard's chips / cards / step tabs are divs with inline onclick (a JS hook
// we must never remove). This module makes them keyboard-equivalent the additive
// way: templates carry role="button" + tabindex="0" + aria-pressed, and ONE
// delegated listener here maps Enter/Space to .click() — so every existing and
// future decorated element works without per-element wiring.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var NATIVE = /^(button|a|input|select|textarea|summary)$/i;

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    var el = e.target;
    if (!el || NATIVE.test(el.tagName)) return;              // native controls already work
    var role = el.getAttribute && el.getAttribute('role');
    if ((role === 'button' || role === 'checkbox') && el.getAttribute('tabindex') === '0') {
      e.preventDefault();                                     // stop Space from scrolling
      el.click();                                             // fires the inline onclick hook
    }
  });

  window.A11Y_READY = true;
})();
