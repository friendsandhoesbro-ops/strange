// ──────────────────────────────────────────────────────────────────────────────
// Progressive disclosure for the Business Information step (Step 1).
// Shows one field at a time so new users aren't overwhelmed: the next field
// appears after the current one is answered (or skipped past). The fixed
// "Continue" button is always available, so users are never trapped.
// Additive only — reads the existing form, never changes values or core logic.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  function init() {
    var grid = document.querySelector('#step-1 .form-grid');
    if (!grid) return;

    var groups = [];
    for (var i = 0; i < grid.children.length; i++) {
      if (grid.children[i].classList.contains('form-group')) groups.push(grid.children[i]);
    }
    if (groups.length < 2) return;

    var frontier = 0;                       // highest-index group currently shown
    for (var k = 1; k < groups.length; k++) groups[k].classList.add('reveal-hidden');

    function reveal(target) {
      if (target <= frontier || target >= groups.length) return;
      for (var j = frontier + 1; j <= target; j++) {
        groups[j].classList.remove('reveal-hidden');
        groups[j].classList.add('reveal-in');
      }
      frontier = target;
      try { groups[target].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
    }
    function advanceFrom(idx) { reveal(idx + 1); }

    groups.forEach(function (g, idx) {
      // Entity selector (buttons) → advance on choice
      g.querySelectorAll('.entity-opt').forEach(function (btn) {
        btn.addEventListener('click', function () { advanceFrom(idx); });
      });
      // Inputs / selects / textareas
      var required = !!g.querySelector('.required');
      g.querySelectorAll('input, select, textarea').forEach(function (ctrl) {
        ctrl.addEventListener('change', function () { advanceFrom(idx); });
        ctrl.addEventListener('blur', function () {
          var val = ('' + (ctrl.value || '')).trim();
          if (!required || val) advanceFrom(idx);   // optional fields advance on leave; required need a value
        });
      });
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
