// ──────────────────────────────────────────────────────────────────────────────
// DRAFT — autosave & restore the wizard so a refresh / accidental back never wipes
// the user's answers. Persists state.formData + current step to localStorage and,
// on load, RE-PLAYS the selections through the existing handlers (so state, visuals
// and ARIA all stay consistent). Non-destructive: any restore error leaves a clean
// form. Additive; mutates nothing in app.js — it only calls existing globals.
//
// PRIVACY: state.formData holds wizard answers only. The AI API key lives in a
// separate buildState (never in formData), so it is never persisted here.
// The draft DOES include the user's own wizard answers (contact, socials, brand
// notes) in this browser's localStorage — same-origin, single device, removed by
// "Start fresh". A deliberate, documented trade-off for refresh-proofing.
//
// EXPORTS: window.EPA_clearDraft = clearDraft (wipe the stored draft) and
// window.EPA_hydrate = hydrate(formData, step) — the proven replay logic that
// re-plays a saved answer-set through the real controls. import.js reuses
// EPA_hydrate to load an encrypted/JSON save back into the wizard.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';
  var KEY = 'epa_draft_v1';
  var t = null;

  function save() {
    try {
      if (typeof state === 'undefined') return;
      localStorage.setItem(KEY, JSON.stringify({ v: 1, step: state.step, formData: state.formData, ts: Date.now() }));
    } catch (e) {}
  }
  function debouncedSave() { clearTimeout(t); t = setTimeout(save, 400); }
  function clearDraft() { try { localStorage.removeItem(KEY); } catch (e) {} }

  function hasContent(fd) {
    if (!fd) return false;
    return !!(fd.businessName || fd.description || fd.industry || fd.projectType || fd.services || fd.products ||
      (fd.businessGoals && fd.businessGoals.length) || (fd.features && fd.features.length) || (fd.compliance && fd.compliance.length));
  }

  // Autosave on any wizard edit or selection (capture phase, so it also catches
  // programmatic dispatches). Debounced.
  document.addEventListener('input', debouncedSave, true);
  document.addEventListener('change', debouncedSave, true);
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.chip,.project-card,.entity-opt,.recommend-card,.bi-chip,.style-tile'))
      setTimeout(debouncedSave, 60);
  }, true);

  function clickWhere(container, sel, pred) {
    if (!container) return;
    var els = container.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (pred(els[i])) els[i].click();
  }

  var SCALARS = ['businessName', 'industry', 'description', 'country', 'targetMarket', 'services',
    'products', 'existingWebsite', 'competitors', 'brandPositioning', 'revenueModel', 'additionalContext',
    'framework', 'database', 'cms', 'hosting', 'analytics', 'authentication', 'storage'];

  function hydrate(fd, step) {
    // 1) Text / select / textarea fields whose element id === field name.
    SCALARS.forEach(function (f) {
      if (fd[f] == null || fd[f] === '') return;
      var el = document.getElementById(f);
      if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA')) {
        el.value = fd[f];
        el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
      } else {
        state.formData[f] = fd[f];   // no control — keep data so the prompt is still correct
      }
    });

    // 2) Selections — replay through the real handlers (rebuilds state + visuals + ARIA).
    if (fd.entityType && fd.entityType !== state.formData.entityType && typeof setEntityType === 'function') { try { setEntityType(fd.entityType); } catch (e) {} }
    if (fd.projectType) { var pc = document.getElementById('pt-' + fd.projectType); if (pc) pc.click(); }
    if (fd.businessGoals && fd.businessGoals.length) clickWhere(document.getElementById('goalsGrid'), '.chip', function (c) { return fd.businessGoals.indexOf(c.dataset.value) !== -1; });
    if (fd.features && fd.features.length) clickWhere(document.getElementById('featuresGrid'), '.chip', function (c) { return fd.features.indexOf(c.dataset.value) !== -1; });
    if (fd.compliance && fd.compliance.length) clickWhere(document.getElementById('complianceGrid'), '.chip', function (c) { return fd.compliance.indexOf(c.dataset.value) !== -1; });
    if (fd.useRecommended === false && typeof toggleRecommended === 'function') { try { toggleRecommended(); } catch (e) {} }
    if (typeof fd.includeCMS === 'boolean' && typeof setCMS === 'function') { try { setCMS(fd.includeCMS); } catch (e) {} }

    // Visual style: click the matching gallery tile (restores state + select + highlight).
    // Data-only fallback if the tile isn't found, so the prompt stays correct regardless.
    if (fd.visualStyle && fd.visualStyle !== 'auto') {
      var g = document.getElementById('styleGallery');
      var tile = g && g.querySelector('.style-tile[data-style="' + String(fd.visualStyle).replace(/"/g, '\\"') + '"]');
      if (tile) tile.click();
      else state.formData.visualStyle = fd.visualStyle;
    }
    // Target AI platform select (id is aiPlatform, not the field name) — same fallback.
    if (fd.targetPlatform) {
      var ap = document.getElementById('aiPlatform');
      if (ap) { ap.value = fd.targetPlatform; ap.dispatchEvent(new Event('change', { bubbles: true })); }
      else state.formData.targetPlatform = fd.targetPlatform;
    }

    // 3) Advanced-module fields (Design Match / brand intake): restore the DATA so the
    //    generated prompt is correct. Their custom widgets don't repaint — acceptable.
    ['designRef', 'realServices', 'assets', 'brandColors', 'socialLinks', 'realContact'].forEach(function (f) {
      if (fd[f] != null) state.formData[f] = fd[f];
    });

    // 4) Land on the step the user was on.
    if (step && step >= 1 && step <= 7 && typeof goToStep === 'function') { try { goToStep(step); } catch (e) {} }
  }

  function banner(ts) {
    if (document.getElementById('epaDraftBanner')) return;
    if (!document.getElementById('epaDraftCSS')) {
      var st = document.createElement('style'); st.id = 'epaDraftCSS';
      st.textContent =
        '#epaDraftBanner{position:fixed;left:50%;transform:translateX(-50%);bottom:88px;z-index:120;display:flex;align-items:center;gap:12px;' +
        'background:rgba(16,12,9,.9);backdrop-filter:blur(14px);border:1px solid rgba(255,90,31,.4);border-radius:14px;padding:11px 14px;' +
        'box-shadow:0 18px 50px rgba(0,0,0,.5);font-size:13px;color:var(--text-1,#f4f5fb);max-width:calc(100vw - 32px);transition:opacity .4s,transform .4s;}' +
        '#epaDraftBanner.epa-draft-hide{opacity:0;transform:translateX(-50%) translateY(10px);pointer-events:none;}' +
        '#epaDraftBanner button{font-family:inherit;cursor:pointer;border-radius:999px;font-size:12px;font-weight:600;}' +
        '#epaDraftFresh{background:linear-gradient(120deg,#ff5a1f,#ffb454);color:#140b06;border:0;padding:6px 12px;}' +
        '#epaDraftDismiss{background:transparent;border:1px solid rgba(255,255,255,.16);color:var(--text-2,#a6abc6);width:24px;height:24px;padding:0;}';
      document.head.appendChild(st);
    }
    var b = document.createElement('div');
    b.id = 'epaDraftBanner'; b.setAttribute('role', 'status');
    b.innerHTML = '<span>✦ Draft restored — your previous answers are back.</span>' +
      '<button type="button" id="epaDraftFresh">Start fresh</button>' +
      '<button type="button" id="epaDraftDismiss" aria-label="Dismiss">✕</button>';
    document.body.appendChild(b);
    document.getElementById('epaDraftFresh').addEventListener('click', function () { clearDraft(); location.reload(); });
    document.getElementById('epaDraftDismiss').addEventListener('click', function () { b.remove(); });
    setTimeout(function () { if (b.parentNode) b.classList.add('epa-draft-hide'); }, 10000);
  }

  function restore() {
    var raw; try { raw = localStorage.getItem(KEY); } catch (e) { return; }
    if (!raw) return;
    var d; try { d = JSON.parse(raw); } catch (e) { return; }
    if (!d || d.v !== 1 || !hasContent(d.formData)) return;   // schema-gate: never mis-restore a stale shape
    try { hydrate(d.formData, d.step); banner(d.ts); } catch (e) { /* non-destructive */ }
  }

  // Runs after app.js init() (this script is loaded after it); small delay lets the
  // dynamic grids + gallery finish rendering so replays have targets to click.
  function boot() { setTimeout(restore, 120); }
  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);

  window.EPA_clearDraft = clearDraft;
  window.EPA_hydrate = hydrate;   // additive: import.js replays a loaded save through the real controls
})();
