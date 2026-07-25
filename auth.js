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
    STORAGE_KEY: 'epa_unlocked',       // sessionStorage — unlocked for THIS tab session
    DISABLE_KEY: 'epa_2fa_disabled',   // localStorage — 2FA turned OFF for THIS device (persists)
  };

  // ── 2FA on/off toggle (per-device) ───────────────────────────────────────────
  // The owner can turn 2FA off from the lock screen, but ONLY with a valid current
  // code (so a stranger who lands on the gate can't just click their way in). The
  // "off" state lives in localStorage, so it applies to THIS browser only — anyone
  // else's browser still gets the full gate. Turning it back ON is free (a small
  // "2FA off" pill shows in-app while it's disabled). A true global off = remove
  // this <script> and redeploy.
  function is2FADisabled() { try { return localStorage.getItem(EPA_AUTH.DISABLE_KEY) === '1'; } catch (e) { return false; } }
  function set2FADisabled(off) {
    try { off ? localStorage.setItem(EPA_AUTH.DISABLE_KEY, '1') : localStorage.removeItem(EPA_AUTH.DISABLE_KEY); } catch (e) {}
  }

  // Floating pill shown while 2FA is OFF — click it to turn protection back on.
  function showReenablePill() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', showReenablePill); return; }
    if (document.getElementById('epa2faPill')) return;
    var st = document.createElement('style');
    st.textContent =
      '#epa2faPill{position:fixed;left:14px;bottom:14px;z-index:2147483646;display:flex;align-items:center;gap:8px;' +
      'background:rgba(18,13,10,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
      'border:1px solid rgba(255,90,31,.28);border-radius:999px;padding:7px 12px;cursor:pointer;' +
      'font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.02em;color:#e9ddd2;' +
      'box-shadow:0 10px 30px rgba(0,0,0,.45);transition:transform .12s,filter .12s;opacity:.9;}' +
      '#epa2faPill:hover{filter:brightness(1.08);transform:translateY(-1px);opacity:1;}' +
      '#epa2faPill:focus-visible{outline:2px solid #ff5a1f;outline-offset:2px;}' +
      '#epa2faPill .epa2faDot{width:7px;height:7px;border-radius:50%;background:#f8b34a;box-shadow:0 0 8px rgba(248,179,74,.9);}' +
      '#epa2faPill b{color:#ffb454;font-weight:700;}' +
      '#epa2faToast{position:fixed;left:14px;bottom:58px;z-index:2147483646;background:rgba(18,13,10,.94);' +
      'border:1px solid rgba(255,90,31,.28);border-radius:10px;padding:10px 13px;font-family:Inter,system-ui,sans-serif;' +
      'font-size:12px;line-height:1.45;color:#e9ddd2;max-width:260px;box-shadow:0 10px 30px rgba(0,0,0,.5);' +
      'opacity:0;transform:translateY(6px);transition:opacity .25s,transform .25s;pointer-events:none;}' +
      '#epa2faToast.show{opacity:1;transform:translateY(0);}';
    document.head.appendChild(st);
    var pill = document.createElement('div');
    pill.id = 'epa2faPill';
    pill.setAttribute('role', 'button'); pill.setAttribute('tabindex', '0');
    pill.setAttribute('aria-label', 'Two-factor access is off on this device — turn it back on');
    pill.innerHTML = '<span class="epa2faDot"></span> 2FA off · <b>turn on</b>';
    function toast(msg) {
      var t = document.getElementById('epa2faToast');
      if (!t) { t = document.createElement('div'); t.id = 'epa2faToast'; document.body.appendChild(t); }
      t.textContent = msg; void t.offsetWidth; t.classList.add('show');
      clearTimeout(t.__h); t.__h = setTimeout(function () { t.classList.remove('show'); }, 3400);
    }
    function reenable() {
      set2FADisabled(false);
      pill.parentNode && pill.parentNode.removeChild(pill);
      toast('2FA turned back on — you’ll enter a code on your next visit.');
    }
    pill.addEventListener('click', reenable);
    pill.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reenable(); } });
    document.body.appendChild(pill);
  }

  // 2FA turned OFF on this device → skip the lock entirely, offer the re-enable pill.
  if (is2FADisabled()) { showReenablePill(); return; }

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
  var EMBER = '#ff5a1f', BG = '#0b0907';
  var style = document.createElement('style');
  style.textContent =
    '#epaGate{position:fixed;inset:0;z-index:2147483647;background:radial-gradient(1200px 600px at 50% -10%,rgba(255,90,31,.10),transparent 60%),' + BG + ';' +
    'display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,-apple-system,sans-serif;color:#f4efe9;padding:24px;}' +
    '#epaGate *{box-sizing:border-box;}' +
    '.epa-card{width:100%;max-width:380px;background:rgba(18,13,10,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);' +
    'border:1px solid rgba(255,90,31,.18);border-radius:20px;padding:30px 26px;box-shadow:0 30px 80px rgba(0,0,0,.55);text-align:center;}' +
    '.epa-mark{width:42px;height:42px;border-radius:12px;margin:0 auto 16px;display:grid;place-items:center;background:linear-gradient(120deg,#ff5a1f,#ffb454);}' +
    '.epa-title{font-weight:800;font-size:19px;letter-spacing:-.01em;margin:0 0 6px;}' +
    '.epa-sub{font-size:12.5px;line-height:1.5;color:#a89a8c;margin:0 0 20px;}' +
    '.epa-input{width:100%;text-align:center;font-size:30px;font-weight:700;letter-spacing:.42em;text-indent:.42em;font-family:"JetBrains Mono",ui-monospace,monospace;' +
    'background:#120d09;border:1.5px solid rgba(255,90,31,.22);border-radius:12px;color:#fff;padding:14px 10px;outline:none;transition:border-color .15s,box-shadow .15s;}' +
    '.epa-input:focus{border-color:' + EMBER + ';box-shadow:0 0 0 3px rgba(255,90,31,.16);}' +
    '.epa-input.epa-bad{border-color:#f87171;box-shadow:0 0 0 3px rgba(248,113,113,.18);animation:epaShake .35s;}' +
    '@keyframes epaShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}' +
    '.epa-btn{width:100%;margin-top:14px;background:linear-gradient(120deg,#ff5a1f,#ffb454);color:#140b06;font-weight:800;font-size:14px;' +
    'border:0;border-radius:999px;padding:13px;cursor:pointer;transition:transform .12s,filter .12s;}' +
    '.epa-btn:hover{filter:brightness(1.06);} .epa-btn:active{transform:scale(.98);}' +
    '.epa-err{min-height:16px;margin-top:12px;font-size:12px;color:#f87171;}' +
    '.epa-meter{margin-top:18px;}' +
    '.epa-track{height:4px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden;}' +
    '.epa-fill{height:100%;width:100%;background:linear-gradient(90deg,#ff5a1f,#ffb454);transform-origin:left;transition:transform 1s linear;}' +
    '.epa-count{margin-top:8px;font-size:11px;color:#8a7d6f;letter-spacing:.02em;}' +
    '.epa-toggle{width:100%;margin-top:16px;background:transparent;border:1px solid rgba(255,255,255,.14);color:#cdbfae;' +
    'font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.04em;text-transform:uppercase;' +
    'border-radius:999px;padding:9px;cursor:pointer;transition:border-color .15s,color .15s;}' +
    '.epa-toggle:hover{border-color:rgba(255,90,31,.5);color:#ffb454;}' +
    '.epa-toggle:focus-visible{outline:2px solid #ff5a1f;outline-offset:2px;}' +
    '.epa-toggle-note{margin-top:9px;font-size:10.5px;line-height:1.45;color:#8a7d6f;}';
  (document.head || document.documentElement).appendChild(style);

  var gate = document.createElement('div');
  gate.id = 'epaGate';
  gate.innerHTML =
    '<div class="epa-card" role="dialog" aria-modal="true" aria-label="Access code required">' +
      '<div class="epa-mark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none">' +
        '<rect x="3" y="3" width="7" height="7" rx="1.5" fill="#140b06"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="#140b06"/>' +
        '<rect x="3" y="14" width="7" height="7" rx="1.5" fill="#140b06"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="#140b06"/></svg></div>' +
      '<h1 class="epa-title">Bake — Private Access</h1>' +
      '<p class="epa-sub">This tool is in private testing. Enter your 6-digit access code to continue.</p>' +
      '<input class="epa-input" id="epaCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••" aria-label="6-digit access code" />' +
      '<button class="epa-btn" id="epaUnlock">Unlock</button>' +
      '<div class="epa-err" id="epaErr"></div>' +
      '<div class="epa-meter"><div class="epa-track"><div class="epa-fill" id="epaFill"></div></div>' +
      '<div class="epa-count" id="epaCount">Code rotates every 30 seconds</div></div>' +
      '<button type="button" class="epa-toggle" id="epa2faOff">Turn off 2FA on this device</button>' +
      '<div class="epa-toggle-note">Type your current code above first, then tap this to skip the code on future visits — this browser only. A "2FA off" pill appears in-app to switch it back on.</div>' +
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

    // ── Turn 2FA OFF (per-device) — requires a valid current code so a stranger who
    //    reaches the lock can't just click their way in. ──────────────────────────
    var toggleBtn = gate.querySelector('#epa2faOff');
    function turnOff() {
      if (busy) return;
      var v = (input.value || '').replace(/\D/g, '');
      if (v.length !== EPA_AUTH.DIGITS) {
        err.textContent = 'Enter your current 6-digit code above first, then turn 2FA off.';
        input.classList.remove('epa-bad'); void input.offsetWidth; input.classList.add('epa-bad'); input.focus();
        return;
      }
      busy = true; err.textContent = '';
      isValid(v).then(function (ok) {
        busy = false;
        if (!ok) { fail(); return; }
        set2FADisabled(true);   // persist: this browser won't be prompted again
        showReenablePill();     // in-app control to turn protection back on
        succeed();              // enter the app + remember this session
      }).catch(function () { busy = false; fail(); });
    }
    if (toggleBtn) toggleBtn.addEventListener('click', turnOff);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
