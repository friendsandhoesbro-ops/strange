// ──────────────────────────────────────────────────────────────────────────────
// Aurora motion — additive, presentational only. Drives the cursor-reactive
// background glow and the magnetic primary/build buttons. Wires purely by class;
// touches no app state, IDs, or handlers. Safe to remove (delete the <script>).
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) Cursor-reactive aurora glow — eased follow via CSS vars --mx / --my (px).
  if (!reduce) {
    var px = window.innerWidth / 2, py = window.innerHeight * 0.12;
    var tx = px, ty = py, raf = null;
    function loop() {
      px += (tx - px) * 0.12; py += (ty - py) * 0.12;
      root.style.setProperty('--mx', px.toFixed(1) + 'px');
      root.style.setProperty('--my', py.toFixed(1) + 'px');
      if (Math.abs(tx - px) > 0.4 || Math.abs(ty - py) > 0.4) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  }

  // 2) Magnetic buttons — primary + build pull gently toward the cursor.
  function magnetize(el) {
    if (el.__mag) return; el.__mag = true;
    var strength = 0.28;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var mx = e.clientX - (r.left + r.width / 2);
      var my = e.clientY - (r.top + r.height / 2);
      el.style.transform = 'translate(' + (mx * strength).toFixed(1) + 'px,' + (my * strength).toFixed(1) + 'px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  }
  function wire() {
    if (reduce) return;
    var els = document.querySelectorAll('.btn-build, .btn-primary');
    for (var i = 0; i < els.length; i++) magnetize(els[i]);
  }

  // Wire now + again as the wizard reveals later steps (build/output buttons mount late).
  if (document.readyState !== 'loading') wire();
  else document.addEventListener('DOMContentLoaded', wire);
  document.addEventListener('click', function () { setTimeout(wire, 120); }, { passive: true });
})();
