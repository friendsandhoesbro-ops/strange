// ──────────────────────────────────────────────────────────────────────────────
// SAVE MY WORK — encrypted local export. One button on the results page bundles
// EVERYTHING (every wizard answer, cleanly labelled, + all three generated
// prompts + machine-readable data.json) into an AES-256 password-protected ZIP
// downloaded to the user's machine. No cloud. WinRAR / 7-Zip / any modern
// archiver extracts it with the password.
//
// PASSWORD = the user's 6-digit access code AT THE MOMENT OF SAVING (shown in a
// confirmation card — an offline file can't rotate its password, so it locks to
// the code it was saved with; only someone holding that code can extract it).
// NOTE: a 6-digit password is deterrence-grade, consistent with the app's gate.
//
// Additive module: injects one button into the existing .toolbar-actions; zip.js
// is lazy-loaded from cdn.jsdelivr.net (already allowed by the CSP) on first
// use, workers disabled (CSP has no worker-src). If zip.js can't load (offline),
// falls back to a plain labelled .txt bundle and says so honestly.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  // Keep in sync with auth.js EPA_AUTH (rotate both together).
  var SECRET = 'OFLLSAUQ6ECAAB473FCV', DIGITS = 6, PERIOD = 30;
  var ZIP_CDN = 'https://cdn.jsdelivr.net/npm/@zip.js/zip.js@2.7.45/dist/zip.min.js';

  // ── TOTP (same maths as the gate) ─────────────────────────────────────────
  function base32Decode(s) {
    var a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; s = String(s).toUpperCase().replace(/=+$/, '');
    var bits = 0, v = 0, out = [], i, c;
    for (i = 0; i < s.length; i++) { c = a.indexOf(s[i]); if (c === -1) continue; v = (v << 5) | c; bits += 5; if (bits >= 8) { out.push((v >>> (bits - 8)) & 255); bits -= 8; } }
    return new Uint8Array(out);
  }
  function currentCode() {
    var counter = Math.floor(Date.now() / 1000 / PERIOD), msg = new Uint8Array(8);
    for (var i = 7; i >= 0; i--) { msg[i] = counter % 256; counter = Math.floor(counter / 256); }
    return crypto.subtle.importKey('raw', base32Decode(SECRET), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
      .then(function (k) { return crypto.subtle.sign('HMAC', k, msg); })
      .then(function (sig) {
        var h = new Uint8Array(sig), off = h[h.length - 1] & 15;
        var bin = ((h[off] & 127) << 24) | ((h[off + 1] & 255) << 16) | ((h[off + 2] & 255) << 8) | (h[off + 3] & 255);
        var s = String(bin % Math.pow(10, DIGITS));
        while (s.length < DIGITS) s = '0' + s;
        return s;
      });
  }

  // ── Pure: formData → clean, labelled answers text (unit-tested) ───────────
  function formatAnswers(fd) {
    fd = fd || {};
    var L = [];
    var line = function (label, v) {
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) return;
      L.push('  ' + label.padEnd(26, ' ') + ': ' + (Array.isArray(v) ? v.join(', ') : String(v)));
    };
    var head = function (t) { L.push('', '═══ ' + t + ' ' + '═'.repeat(Math.max(3, 46 - t.length)), ''); };

    L.push('BAKE — SAVED PROJECT');
    L.push('Saved: ' + new Date().toLocaleString());
    head('STEP 1 · BUSINESS');
    line('For', fd.entityType === 'individual' ? 'An individual (personal site)' : 'A business / organisation');
    line('Name', fd.businessName);
    line('Industry', fd.industry);
    line('Country', fd.country);
    line('Description', fd.description);
    line('Target market', fd.targetMarket);
    line('Services', fd.services);
    line('Products', fd.products);
    line('Existing website', fd.existingWebsite);
    line('Competitors', fd.competitors);
    line('Brand positioning', fd.brandPositioning);
    line('Revenue model', fd.revenueModel);
    head('STEP 2 · PROJECT');
    line('Project type', fd.projectType);
    head('STEP 3 · GOALS');
    line('Business goals', fd.businessGoals);
    head('STEP 4 · FEATURES');
    line('Features', fd.features);
    head('STEP 5 · TECHNICAL & STYLE');
    line('Use recommended stack', fd.useRecommended === false ? 'No — custom' : 'Yes');
    line('Framework', fd.framework);
    line('Database', fd.database);
    line('Hosting', fd.hosting);
    line('CMS', fd.cms);
    line('Auth', fd.authentication);
    line('Storage', fd.storage);
    line('Analytics', fd.analytics);
    line('Target AI platform', fd.targetPlatform);
    line('Visual style', fd.visualStyle === 'auto' ? 'Auto (library picks a unique style)' : fd.visualStyle);
    line('Content manager (CMS)', fd.includeCMS === false ? 'No' : 'Yes');
    line('Assets owned', fd.assets);
    line('Brand colours', fd.brandColors);
    line('Real services list', fd.realServices);
    line('Social links', fd.socialLinks);
    line('Contact', fd.realContact);
    if (fd.designRef && fd.designRef.palette) {
      line('Design Match palette', fd.designRef.palette);
      line('Design Match theme', fd.designRef.mode + ' · ' + fd.designRef.mood);
    }
    head('STEP 6 · COMPLIANCE');
    line('Compliance', fd.compliance);
    line('Additional context', fd.additionalContext);
    L.push('', 'The generated prompts are in the prompts/ folder of this archive.', '');
    return L.join('\n');
  }

  // ── zip.js lazy loader ────────────────────────────────────────────────────
  var zipReady = null;
  function loadZip() {
    if (window.zip) return Promise.resolve(window.zip);
    if (zipReady) return zipReady;
    zipReady = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = ZIP_CDN;
      s.onload = function () { window.zip ? res(window.zip) : rej(new Error('zip.js missing')); };
      s.onerror = function () { rej(new Error('zip.js failed to load')); };
      document.head.appendChild(s);
    });
    return zipReady;
  }

  function download(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  function gatherFiles() {
    var fd = (typeof state !== 'undefined' && state.formData) || {};
    var r = (typeof state !== 'undefined' && state.results) || {};
    var files = [
      { name: 'README.txt', content:
        'BAKE — ENCRYPTED PROJECT SAVE\n\nThis archive was saved from Bake and is protected with AES-256.\n' +
        'The password is the 6-digit Bake access code that was current at the\nmoment of saving (it was shown on screen when you downloaded this file).\n' +
        'Open with WinRAR, 7-Zip, or any modern archiver.\n\nContents:\n  answers.txt   — every option you chose, labelled by step\n' +
        '  data.json     — machine-readable copy of your answers\n  prompts/      — your generated prompts\n' },
      { name: 'answers.txt', content: formatAnswers(fd) },
      { name: 'data.json', content: JSON.stringify({ v: 1, savedAt: new Date().toISOString(), formData: fd }, null, 2) },
    ];
    if (r.build) files.push({ name: 'prompts/build-prompt.txt', content: r.build });
    if (r.cto) files.push({ name: 'prompts/cto-audit-prompt.txt', content: r.cto });
    if (r.sales) files.push({ name: 'prompts/client-sales-brief.txt', content: r.sales });
    return files;
  }

  function confirmCard(code, fallbackTxt) {
    var old = document.getElementById('bakeSaveNote'); if (old) old.remove();
    var d = document.createElement('div');
    d.id = 'bakeSaveNote'; d.setAttribute('role', 'status');
    d.innerHTML = fallbackTxt
      ? '<strong>Saved as plain .txt</strong> — the encryption library could not load (offline?), so this copy is NOT password-protected.'
      : '<strong>Saved &amp; encrypted.</strong> Archive password (your access code right now): <span class="bsn-code">' + code + '</span><br>Keep it — the file stays locked to THIS code. Open with WinRAR / 7-Zip.';
    document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.classList.add('bsn-hide'); }, 14000);
    setTimeout(function () { if (d.parentNode) d.remove(); }, 15000);
  }

  function saveAll(btn) {
    var fd = (typeof state !== 'undefined' && state.formData) || {};
    var name = (fd.businessName || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
    var stamp = new Date().toISOString().slice(0, 10);
    var files = gatherFiles();
    if (btn) { btn.disabled = true; btn.textContent = 'Encrypting…'; }

    Promise.all([loadZip(), currentCode()]).then(function (rz) {
      var zip = rz[0], code = rz[1];
      zip.configure({ useWebWorkers: false });                    // CSP: no worker-src
      var writer = new zip.ZipWriter(new zip.BlobWriter('application/zip'),
        { password: code, encryptionStrength: 3 });               // AES-256
      var chain = Promise.resolve();
      files.forEach(function (f) {
        chain = chain.then(function () { return writer.add(f.name, new zip.TextReader(f.content)); });
      });
      return chain.then(function () { return writer.close(); }).then(function (blob) {
        download(blob, 'bake-' + name + '-' + stamp + '.zip');
        confirmCard(code, false);
      });
    }).catch(function () {
      // Honest fallback: plain text bundle, clearly flagged as unencrypted.
      var txt = files.map(function (f) { return '\n' + '='.repeat(60) + '\nFILE: ' + f.name + '\n' + '='.repeat(60) + '\n' + f.content; }).join('\n');
      download(new Blob([txt], { type: 'text/plain' }), 'bake-' + name + '-' + stamp + '.txt');
      confirmCard(null, true);
    }).finally(function () {
      if (btn) { btn.disabled = false; btn.innerHTML = BTN_LABEL; }
    });
  }

  var BTN_LABEL =
    '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="5.5" width="9" height="6" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M4 5.5V4a2.5 2.5 0 015 0v1.5" stroke="currentColor" stroke-width="1.2"/></svg> Save My Work (.zip)';

  function injectCSS() {
    if (document.getElementById('bakeSaveCSS')) return;
    var st = document.createElement('style'); st.id = 'bakeSaveCSS';
    st.textContent =
      '#bakeSaveNote{position:fixed;left:50%;transform:translateX(-50%);bottom:88px;z-index:130;max-width:min(520px,calc(100vw - 32px));' +
      'background:rgba(16,12,9,.94);backdrop-filter:blur(14px);border:1px solid rgba(255,90,31,.45);border-radius:14px;padding:13px 16px;' +
      'font-size:12.5px;line-height:1.6;color:var(--text-1,#f8f4ef);box-shadow:0 18px 50px rgba(0,0,0,.5);transition:opacity .5s;}' +
      '#bakeSaveNote.bsn-hide{opacity:0;}' +
      '.bsn-code{font-family:"JetBrains Mono",monospace;font-weight:700;font-size:15px;letter-spacing:.18em;color:#ffb454;}';
    document.head.appendChild(st);
  }

  function init() {
    var bar = document.querySelector('.toolbar-actions');
    if (!bar) return;                                    // tests.html — no-op
    injectCSS();
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'tool-btn'; btn.id = 'bakeSaveBtn';
    btn.title = 'Download everything (answers + prompts) as an encrypted .zip';
    btn.innerHTML = BTN_LABEL;
    btn.addEventListener('click', function () { saveAll(btn); });
    bar.appendChild(btn);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  window.BakeSave = { formatAnswers: formatAnswers, save: saveAll };
})();
