// ══════════════════════════════════════════════════════════════════════════════
// EPA ACCESS GATE — time-based one-time access code (TOTP, RFC 6238).
//
// WHY: during the private testing phase the tool should not be usable by anyone who
// merely has the link. This shows a lock screen asking for a 6-digit code that
// ROTATES EVERY 30 SECONDS. Only someone holding the shared SECRET below can produce
// the current code — load it into any authenticator app (Google Authenticator, Authy,
// 1Password…) or open the private code-generator.html.
//
// AUTHORISE someone : give them the SECRET (or read them the current code — it only
//                     works for ~30s, then a new visitor needs a fresh one).
// REVOKE everyone   : change SECRET below, bump auth.js ?v= in index.html, redeploy.
//
// NOTE (honest): this is a static site, so the SECRET ships in this file. It is a
// strong *deterrent* for the testing phase (a normal visitor cannot get in), but a
// determined technical user could read it from the source. For hard security the
// check must move to the backend (server.py) so the secret never reaches the browser.
// ══════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var EPA_AUTH = {
    SECRET: 'OFLLSAUQ6ECAAB473FCV', // Base32. Rotate this to revoke all access.
    DIGITS: 6,
    PERIOD: 30,        // seconds per code — the "changes every 30 seconds" requirement
    SKEW: 1,           // also accept the code from ±1 window (clock-skew tolerance)
    STORAGE_KEY: 'epa_unlocked',
  };

  // Already unlocked this browser session? Skip the gate entirely.
  try { if (sessionStorage.getItem(EPA_AUTH.STORAGE_KEY) === '1') return; } catch (e) {}

  // ── TOTP core (Base32 → HMAC-SHA1 → 6 digits) ────────────────────────────────
  function base32Decode(s) {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    s = String(s).toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
    var bits = 0, value = 0, out = [], i, c;
    for (i = 0; i < s.length; i++) {
      c = alphabet.indexOf(s[i]);
      if (c === -1) continue;
      value = (value << 5) | c; bits += 5;
      if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
    }
    return new Uint8Array(out);
  }

  function codeAt(unixSeconds) {
    var key = base32Decode(EPA_AUTH.SECRET);
    var counter = Math.floor(unixSeconds / EPA_AUTH.PERIOD);
    var msg = new Uint8Array(8);
    for (var i = 7; i >= 0; i--) { msg[i] = counter % 256; counter = Math.floor(counter / 256); }
    return crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
      .then(function (ck) { return crypto.subtle.sign('HMAC', ck, msg); })
      .then(function (sig) {
        var h = new Uint8Array(sig);
        var off = h[h.length - 1] & 0x0f;
        var bin = ((h[off] & 0x7f) << 24) | ((h[off + 1] & 0xff) << 16) |
                  ((h[off + 2] & 0xff) << 8) | (h[off + 3] & 0xff);
        var mod = Math.pow(10, EPA_AUTH.DIGITS);
        var s = String(bin % mod);
        while (s.length < EPA_AUTH.DIGITS) s = '0' + s;
        return s;
      });
  }

  function isValid(input) {
    input = String(input || '').replace(/\D/g, '');
    if (input.length !== EPA_AUTH.DIGITS) return Promise.resolve(false);
    var now = Math.floor(Date.now() / 1000);
    var checks = [];
    for (var w = -EPA_AUTH.SKEW; w <= EPA_AUTH.SKEW; w++) checks.push(codeAt(now + w * EPA_AUTH.PERIOD));
    return Promise.all(checks).then(function (codes) { return codes.indexOf(input) !== -1; });
  }

  // Graceful fallback: if the browser has no Web Crypto (very old / insecure origin),
  // don't hard-lock the owner out — let the app load rather than show a dead gate.
  if (!window.crypto || !crypto.subtle) { return; }

  // ── Lock UI (self-contained styles; works even before <body> parses) ─────────
  var GREEN = '#5ed29c', BG = '#070b0a';
  var style = document.createElement('style');
  style.textContent =
    '#epaGate{position:fixed;inset:0;z-index:2147483647;background:radial-gradient(1200px 600px at 50% -10%,rgba(94,210,156,.10),transparent 60%),' + BG + ';' +
    'display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,-apple-system,sans-serif;color:#e7f3ee;padding:24px;}' +
    '#epaGate *{box-sizing:border-box;}' +
    '.epa-card{width:100%;max-width:380px;background:rgba(12,18,16,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);' +
    'border:1px solid rgba(94,210,156,.18);border-radius:20px;padding:30px 26px;box-shadow:0 30px 80px rgba(0,0,0,.55);text-align:center;}' +
    '.epa-mark{width:42px;height:42px;border-radius:12px;margin:0 auto 16px;display:grid;place-items:center;background:linear-gradient(120deg,#5ed29c,#34d8c4);}' +
    '.epa-title{font-weight:800;font-size:19px;letter-spacing:-.01em;margin:0 0 6px;}' +
    '.epa-sub{font-size:12.5px;line-height:1.5;color:#8aa39a;margin:0 0 20px;}' +
    '.epa-input{width:100%;text-align:center;font-size:30px;font-weight:700;letter-spacing:.42em;text-indent:.42em;font-family:"JetBrains Mono",ui-monospace,monospace;' +
    'background:#0a110e;border:1.5px solid rgba(94,210,156,.22);border-radius:12px;color:#fff;padding:14px 10px;outline:none;transition:border-color .15s,box-shadow .15s;}' +
    '.epa-input:focus{border-color:' + GREEN + ';box-shadow:0 0 0 3px rgba(94,210,156,.16);}' +
    '.epa-input.epa-bad{border-color:#f87171;box-shadow:0 0 0 3px rgba(248,113,113,.18);animation:epaShake .35s;}' +
    '@keyframes epaShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}' +
    '.epa-btn{width:100%;margin-top:14px;background:linear-gradient(120deg,#5ed29c,#34d8c4);color:#06100c;font-weight:800;font-size:14px;' +
    'border:0;border-radius:999px;padding:13px;cursor:pointer;transition:transform .12s,filter .12s;}' +
    '.epa-btn:hover{filter:brightness(1.06);} .epa-btn:active{transform:scale(.98);}' +
    '.epa-err{min-height:16px;margin-top:12px;font-size:12px;color:#f87171;}' +
    '.epa-meter{margin-top:18px;}' +
    '.epa-track{height:4px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden;}' +
    '.epa-fill{height:100%;width:100%;background:linear-gradient(90deg,#5ed29c,#34d8c4);transform-origin:left;transition:transform 1s linear;}' +
    '.epa-count{margin-top:8px;font-size:11px;color:#6f877e;letter-spacing:.02em;}';
  (document.head || document.documentElement).appendChild(style);

  var gate = document.createElement('div');
  gate.id = 'epaGate';
  gate.innerHTML =
    '<div class="epa-card" role="dialog" aria-modal="true" aria-label="Access code required">' +
      '<div class="epa-mark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none">' +
        '<rect x="3" y="3" width="7" height="7" rx="1.5" fill="#06100c"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="#06100c"/>' +
        '<rect x="3" y="14" width="7" height="7" rx="1.5" fill="#06100c"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="#06100c"/></svg></div>' +
      '<h1 class="epa-title">Prompt Architect — Private Access</h1>' +
      '<p class="epa-sub">This tool is in private testing. Enter your 6-digit access code to continue.</p>' +
      '<input class="epa-input" id="epaCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••" aria-label="6-digit access code" />' +
      '<button class="epa-btn" id="epaUnlock">Unlock</button>' +
      '<div class="epa-err" id="epaErr"></div>' +
      '<div class="epa-meter"><div class="epa-track"><div class="epa-fill" id="epaFill"></div></div>' +
      '<div class="epa-count" id="epaCount">Code rotates every 30 seconds</div></div>' +
    '</div>';

  function lockScroll() { try { document.documentElement.style.overflow = 'hidden'; } catch (e) {} }
  function unlockScroll() { try { document.documentElement.style.overflow = ''; if (document.body) document.body.style.overflow = ''; } catch (e) {} }

  function mount() {
    (document.body || document.documentElement).appendChild(gate);
    lockScroll();
    var input = gate.querySelector('#epaCode');
    var btn = gate.querySelector('#epaUnlock');
    var err = gate.querySelector('#epaErr');
    var fill = gate.querySelector('#epaFill');
    var count = gate.querySelector('#epaCount');
    var busy = false;

    function tick() {
      var s = EPA_AUTH.PERIOD - (Math.floor(Date.now() / 1000) % EPA_AUTH.PERIOD);
      fill.style.transform = 'scaleX(' + (s / EPA_AUTH.PERIOD) + ')';
      count.textContent = 'Code rotates in ' + s + 's';
    }
    tick(); var timer = setInterval(tick, 1000);

    function fail() {
      err.textContent = 'Incorrect or expired code. Try the current one.';
      input.classList.remove('epa-bad'); void input.offsetWidth; input.classList.add('epa-bad');
      input.select();
    }
    function succeed() {
      clearInterval(timer);
      try { sessionStorage.setItem(EPA_AUTH.STORAGE_KEY, '1'); } catch (e) {}
      gate.style.transition = 'opacity .35s'; gate.style.opacity = '0';
      setTimeout(function () { gate.parentNode && gate.parentNode.removeChild(gate); unlockScroll(); }, 360);
    }
    function attempt() {
      if (busy) return;
      var v = (input.value || '').replace(/\D/g, '');
      if (v.length !== EPA_AUTH.DIGITS) { fail(); return; }
      busy = true; err.textContent = '';
      isValid(v).then(function (ok) { busy = false; ok ? succeed() : fail(); })
                .catch(function () { busy = false; fail(); });
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') attempt(); });
    input.addEventListener('input', function () {
      input.classList.remove('epa-bad'); err.textContent = '';
      if (input.value.replace(/\D/g, '').length === EPA_AUTH.DIGITS) attempt(); // auto-submit
    });
    setTimeout(function () { input.focus(); }, 60);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
