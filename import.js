// ──────────────────────────────────────────────────────────────────────────────
// LOAD A SAVE — the other half of save.js. save.js exports an AES-256
// password-protected .zip (or a plain .txt fallback) containing data.json =
// { v:1, savedAt, formData }. This module loads that work BACK into the wizard.
//
//   .json  → parse, validate the { v:1, formData } shape, hydrate.
//   .zip   → lazy-load zip.js (same CDN + configure({useWebWorkers:false}) as
//            save.js), ask for the 6-digit access code the file was locked with,
//            read data.json with that password, validate, hydrate.
//
// Hydration reuses the proven replay logic in draft.js via window.EPA_hydrate,
// so state, visuals and ARIA all stay consistent. Wrong code / corrupt file →
// a clear inline "Wrong code or damaged file" — never a silent failure or crash.
//
// Additive module: injects one unobtrusive "Load a save" pill on Step 1 (near
// the description) + a hidden file input. Pure, unit-tested validate() is
// exposed as window.BakeImport.validate. No architecture change.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var ZIP_CDN = 'https://cdn.jsdelivr.net/npm/@zip.js/zip.js@2.7.45/dist/zip.min.js';

  // ── Pure: a parsed data.json → { ok, formData? , error? } (unit-tested) ────
  function validate(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'This file isn’t a valid Bake save.' };
    }
    if (parsed.v !== 1) return { ok: false, error: 'Unsupported save version.' };
    var fd = parsed.formData;
    if (!fd || typeof fd !== 'object' || Array.isArray(fd)) {
      return { ok: false, error: 'Save file is missing its answers.' };
    }
    return { ok: true, formData: fd };
  }

  // ── zip.js lazy loader (identical pattern to save.js) ─────────────────────
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

  // Loading a save should REPRODUCE it, not merge with whatever is on screen
  // (a draft may have auto-restored on load). EPA_hydrate toggles the multi-select
  // chips on, so we first click any already-selected chip off — through the real
  // control, same replay pattern — giving hydrate a clean slate. Scalars/selects
  // are overwritten by value inside hydrate, so they need no pre-clear.
  function clearSelections() {
    ['goalsGrid', 'featuresGrid', 'complianceGrid'].forEach(function (id) {
      var g = document.getElementById(id);
      if (!g) return;
      var sel = g.querySelectorAll('.chip.selected');
      for (var i = 0; i < sel.length; i++) { try { sel[i].click(); } catch (e) {} }
    });
  }

  // ── Hydrate the wizard from a validated formData, then confirm ────────────
  function hydrateAndConfirm(fd) {
    if (typeof window.EPA_hydrate === 'function') {
      try { clearSelections(); window.EPA_hydrate(fd, 1); } catch (e) { /* non-destructive */ }
    } else if (typeof state !== 'undefined' && state.formData) {
      // Fallback: at least keep the data so the prompt is still correct.
      try { for (var k in fd) if (fd.hasOwnProperty(k)) state.formData[k] = fd[k]; } catch (e) {}
    }
    note('<strong>Save loaded</strong> — review and generate.', false);
  }

  // ── .json path ────────────────────────────────────────────────────────────
  function openJson(file) {
    var fr = new FileReader();
    fr.onload = function () {
      var parsed;
      try { parsed = JSON.parse(fr.result); }
      catch (e) { note('Wrong code or damaged file.', true); return; }
      var v = validate(parsed);
      if (!v.ok) { note(v.error, true); return; }
      hydrateAndConfirm(v.formData);
    };
    fr.onerror = function () { note('Could not read that file.', true); };
    fr.readAsText(file);
  }

  // ── .zip path: ask for the code, then decrypt data.json ───────────────────
  function openZip(file) {
    codeCard(function (code, ctrl) {
      loadZip().then(function (zip) {
        zip.configure({ useWebWorkers: false });                 // CSP: no worker-src
        var reader = new zip.ZipReader(new zip.BlobReader(file));
        return reader.getEntries().then(function (entries) {
          var entry = null;
          for (var i = 0; i < entries.length; i++) {
            if (/(^|\/)data\.json$/i.test(entries[i].filename)) { entry = entries[i]; break; }
          }
          if (!entry) return Promise.reject(new Error('no-data'));
          return entry.getData(new zip.TextWriter(), { password: code });
        }).then(function (text) { try { reader.close(); } catch (e) {} return text; });
      }).then(function (text) {
        var parsed;
        try { parsed = JSON.parse(text); }
        catch (e) { ctrl.fail('Wrong code or damaged file'); return; }
        var v = validate(parsed);
        if (!v.ok) { ctrl.fail(v.error); return; }
        ctrl.close();
        hydrateAndConfirm(v.formData);
      }).catch(function () {
        ctrl.fail('Wrong code or damaged file');
      });
    });
  }

  // ── File-input dispatch ────────────────────────────────────────────────────
  function onFile(input) {
    var file = input.files && input.files[0];
    input.value = '';                                            // allow re-picking the same file
    if (!file) return;
    var isZip = /\.zip$/i.test(file.name) || file.type === 'application/zip';
    if (isZip) openZip(file);
    else openJson(file);
  }

  // ── UI: confirmation / error note (reuses the draft-banner visual pattern) ─
  function note(html, isError) {
    var old = document.getElementById('bakeImportNote'); if (old) old.remove();
    var d = document.createElement('div');
    d.id = 'bakeImportNote'; d.setAttribute('role', 'status');
    if (isError) d.className = 'bin-error';
    d.innerHTML = (isError ? '⚠ ' : '✦ ') + html;
    document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.classList.add('bin-hide'); }, 9000);
    setTimeout(function () { if (d.parentNode) d.remove(); }, 9600);
  }

  // ── UI: inline 6-digit code card for encrypted .zip saves ─────────────────
  function codeCard(onSubmit) {
    var old = document.getElementById('bakeImportCode'); if (old) old.remove();
    var d = document.createElement('div');
    d.id = 'bakeImportCode'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Enter your access code');
    d.innerHTML =
      '<button type="button" class="bic-x" aria-label="Cancel">✕</button>' +
      '<div class="bic-title">Enter your 6-digit code</div>' +
      '<div class="bic-sub">This save is encrypted. Type the Bake access code it was locked with.</div>' +
      '<div class="bic-row">' +
        '<input id="bicInput" class="bic-input" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="off" aria-label="6-digit code">' +
        '<button type="button" id="bicGo" class="bic-go">Unlock</button>' +
      '</div>' +
      '<div class="bic-err" id="bicErr" role="alert"></div>';
    document.body.appendChild(d);
    var input = d.querySelector('#bicInput');
    var go = d.querySelector('#bicGo');
    var err = d.querySelector('#bicErr');
    try { input.focus(); } catch (e) {}

    function setBusy(on) { input.disabled = on; go.disabled = on; go.textContent = on ? 'Unlocking…' : 'Unlock'; }
    var ctrl = {
      close: function () { if (d.parentNode) d.remove(); },
      fail: function (m) { err.textContent = m; setBusy(false); }
    };
    function submit() {
      var code = (input.value || '').replace(/\D/g, '');
      if (code.length !== 6) { err.textContent = 'Enter all 6 digits.'; return; }
      err.textContent = ''; setBusy(true);
      onSubmit(code, ctrl);
    }
    go.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    d.querySelector('.bic-x').addEventListener('click', ctrl.close);
  }

  // ── Styling (Molten Ember; mono uppercase pill + glass cards) ─────────────
  function injectCSS() {
    if (document.getElementById('bakeImportCSS')) return;
    var st = document.createElement('style'); st.id = 'bakeImportCSS';
    st.textContent =
      '.bake-import-wrap{margin-top:12px;}' +
      '.bake-import-btn{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;' +
      'border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);color:var(--text-2,#a6abc6);' +
      'font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;' +
      'cursor:pointer;transition:all .2s;}' +
      '.bake-import-btn:hover{border-color:rgba(255,90,31,0.45);color:#ffb454;background:rgba(255,90,31,0.08);transform:translateY(-1px);}' +
      // Confirmation / error note
      '#bakeImportNote{position:fixed;left:50%;transform:translateX(-50%);bottom:88px;z-index:130;max-width:min(480px,calc(100vw - 32px));' +
      'background:rgba(16,12,9,.94);backdrop-filter:blur(14px);border:1px solid rgba(255,90,31,.45);border-radius:14px;padding:12px 16px;' +
      'font-size:12.5px;line-height:1.55;color:var(--text-1,#f8f4ef);box-shadow:0 18px 50px rgba(0,0,0,.5);transition:opacity .5s;}' +
      '#bakeImportNote.bin-error{border-color:rgba(255,120,90,.6);}' +
      '#bakeImportNote.bin-hide{opacity:0;}' +
      // Code card
      '#bakeImportCode{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:140;width:min(360px,calc(100vw - 32px));' +
      'background:rgba(16,12,9,.97);backdrop-filter:blur(16px);border:1px solid rgba(255,90,31,.5);border-radius:16px;padding:20px 20px 18px;' +
      'box-shadow:0 24px 70px rgba(0,0,0,.6);color:var(--text-1,#f8f4ef);}' +
      '#bakeImportCode .bic-x{position:absolute;top:12px;right:12px;width:24px;height:24px;padding:0;border-radius:999px;cursor:pointer;' +
      'background:transparent;border:1px solid rgba(255,255,255,.16);color:var(--text-2,#a6abc6);font-family:inherit;}' +
      '#bakeImportCode .bic-title{font-family:"JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.08em;font-size:13px;color:#ffb454;margin-bottom:6px;}' +
      '#bakeImportCode .bic-sub{font-size:12px;line-height:1.5;color:var(--text-2,#a6abc6);margin-bottom:14px;}' +
      '#bakeImportCode .bic-row{display:flex;gap:8px;}' +
      '#bakeImportCode .bic-input{flex:1;min-width:0;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.16);' +
      'background:rgba(255,255,255,.04);color:var(--text-1,#f8f4ef);font-family:"JetBrains Mono",monospace;font-size:17px;letter-spacing:.28em;text-align:center;}' +
      '#bakeImportCode .bic-input:focus{outline:none;border-color:rgba(255,90,31,.6);}' +
      '#bakeImportCode .bic-go{padding:10px 16px;border-radius:10px;border:0;cursor:pointer;font-family:"JetBrains Mono",monospace;' +
      'text-transform:uppercase;letter-spacing:.06em;font-size:12px;font-weight:700;color:#140b06;background:linear-gradient(120deg,#ff5a1f,#ffb454);}' +
      '#bakeImportCode .bic-go:disabled{opacity:.7;cursor:wait;}' +
      '#bakeImportCode .bic-err{min-height:16px;margin-top:10px;font-size:12px;color:#ff8a5c;}';
    document.head.appendChild(st);
  }

  // ── Mount the "Load a save" pill on Step 1 (after the description group) ───
  function init() {
    var desc = document.getElementById('description');
    if (!desc) return;                                           // tests.html — no wizard, no-op
    injectCSS();
    var group = (desc.closest && desc.closest('.form-group')) || desc.parentNode;

    var wrap = document.createElement('div');
    wrap.className = 'bake-import-wrap';

    var input = document.createElement('input');
    input.type = 'file'; input.id = 'bakeImportInput';
    input.accept = '.zip,.json,application/zip,application/json';
    input.style.display = 'none';
    input.addEventListener('change', function () { onFile(input); });

    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'bake-import-btn'; btn.id = 'bakeImportBtn';
    btn.title = 'Load a Bake save file (.zip or .json) back into the wizard';
    btn.innerHTML =
      '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 8.5V2M4 5l2.5 2.5L9 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 9.5v1a1 1 0 001 1h7a1 1 0 001-1v-1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg> Load a save';
    btn.addEventListener('click', function () { input.click(); });

    wrap.appendChild(btn);
    wrap.appendChild(input);
    if (group && group.parentNode) group.parentNode.insertBefore(wrap, group.nextSibling);
    else group.appendChild(wrap);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  window.BakeImport = { validate: validate };
})();
