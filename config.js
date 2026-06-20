// ──────────────────────────────────────────────────────────────────────────────
// Backend location config. Loaded first, before everything else.
//
// Desktop app / local server  → same origin ('') → talks to the local server.py.
// Deployed web version        → the hosted backend URL (set REMOTE_API below).
//
// After deploying server.py to Render, paste its URL into REMOTE_API and push.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  var REMOTE_API = '';  // e.g. 'https://prompt-architect-api.onrender.com'  (no trailing slash)

  var host = location.hostname;
  var isLocal = (host === 'localhost' || host === '127.0.0.1' || host === '' || host === '::1');

  // Local → same origin. Web → hosted backend (if configured).
  window.EPA_API_BASE = isLocal ? '' : REMOTE_API;

  // Build a backend URL for any /api/* path.
  window.EPA_apiUrl = function (path) { return (window.EPA_API_BASE || '') + path; };

  // True only on the deployed web version with a hosted backend configured.
  // Used to swap desktop-only buttons (VS Code / local save) for web-safe ones.
  window.EPA_isRemote = function () { return !isLocal && !!window.EPA_API_BASE; };
})();
