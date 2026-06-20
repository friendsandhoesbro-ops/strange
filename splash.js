// ──────────────────────────────────────────────────────────────────────────────
// Launch splash — shows the app name once per browser session, animates, then
// reveals the app. Click anywhere to skip. Purely presentational; no core logic.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  var s = document.getElementById('splash');
  if (!s) return;

  // Only on a fresh session (not on every in-app reload within the same tab)
  var seen;
  try { seen = sessionStorage.getItem('epa_splash_seen'); } catch (e) { seen = null; }
  if (seen) { s.parentNode && s.parentNode.removeChild(s); return; }
  try { sessionStorage.setItem('epa_splash_seen', '1'); } catch (e) {}

  var dismissed = false;
  function dismiss() {
    if (dismissed) return; dismissed = true;
    s.classList.add('splash-out');
    setTimeout(function () { s.parentNode && s.parentNode.removeChild(s); }, 800);
  }

  s.addEventListener('click', dismiss);
  setTimeout(dismiss, 2300);
})();
