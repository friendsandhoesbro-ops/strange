// ──────────────────────────────────────────────────────────────────────────────
// BRAND INTAKE — "Your brand & content". Lets users tell the tool what real assets &
// content they already have (logo, photos, video, brand colours, existing copy) and
// supply real specifics (services/products, social links, contact). This feeds the
// engine so the generated prompt uses REAL content + labelled CMS-wired slots instead
// of inventing random stats/testimonials/products.
//
// Additive + presentational: mounts into #brandIntake, writes state via updateField().
// Touches no wizard logic.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var ASSETS = [
    { id: 'logo',           label: 'Logo' },
    { id: 'product-photos', label: 'Product / service photos' },
    { id: 'team-photos',    label: 'Team photos' },
    { id: 'video',          label: 'Video' },
    { id: 'brand-colors',   label: 'Brand colours' },
    { id: 'existing-copy',  label: 'Existing copy / text' },
  ];
  var selected = {};

  function set(field, value) { try { if (typeof updateField === 'function') updateField(field, value); } catch (e) {} }

  function commitAssets() {
    set('assets', Object.keys(selected).filter(function (k) { return selected[k]; }));
    var cr = document.getElementById('biColors');
    if (cr) cr.style.display = selected['brand-colors'] ? 'grid' : 'none';
  }
  function commitColors() {
    var hexes = [];
    ['biColor1', 'biColor2', 'biColor3'].forEach(function (id) {
      var el = document.getElementById(id); if (!el) return;
      var v = el.value.trim(); if (!v) return;
      if (v[0] !== '#') v = '#' + v;
      if (/^#[0-9a-fA-F]{6}$/.test(v)) hexes.push(v);
    });
    set('brandColors', hexes);
  }
  function commitList(field, el) {
    set(field, el.value.split(/\n|,/).map(function (s) { return s.trim(); }).filter(Boolean));
  }

  function build() {
    var mount = document.getElementById('brandIntake');
    if (!mount) return false;

    var chips = ASSETS.map(function (a) {
      return '<button type="button" class="chip bi-chip" data-id="' + a.id + '">' + a.label + '</button>';
    }).join('');

    mount.innerHTML =
      '<div class="bi-sublabel">What do you already have? (tap all that apply — we’ll build real slots for these, not fakes)</div>' +
      '<div class="chip-grid bi-chips">' + chips + '</div>' +
      '<div id="biColors" class="bi-colors" style="display:none">' +
        '<input type="text" class="form-input" id="biColor1" placeholder="#5B5BF5 (primary)" maxlength="7">' +
        '<input type="text" class="form-input" id="biColor2" placeholder="#0E1116 (secondary)" maxlength="7">' +
        '<input type="text" class="form-input" id="biColor3" placeholder="#F7F8FA (accent)" maxlength="7">' +
      '</div>' +
      '<div class="bi-field">' +
        '<label class="form-label">Your real services / products <span class="bi-opt">(one per line — used exactly, none invented)</span></label>' +
        '<textarea class="form-input form-textarea" id="biServices" placeholder="e.g.&#10;Bridal hair styling&#10;On-location makeup&#10;Group bookings" style="height:84px"></textarea>' +
      '</div>' +
      '<div class="bi-field">' +
        '<label class="form-label">Social links <span class="bi-opt">(comma-separated — wired exactly)</span></label>' +
        '<input type="text" class="form-input" id="biSocials" placeholder="instagram.com/yourbrand, tiktok.com/@you">' +
      '</div>' +
      '<div class="bi-field">' +
        '<label class="form-label">Contact <span class="bi-opt">(email / phone / address — used exactly, never invented)</span></label>' +
        '<input type="text" class="form-input" id="biContact" placeholder="hello@brand.com · +1 555 0100 · City, Country">' +
      '</div>';

    // wire asset chips
    var chipEls = mount.querySelectorAll('.bi-chip');
    for (var i = 0; i < chipEls.length; i++) {
      (function (el) {
        el.addEventListener('click', function () {
          var id = el.getAttribute('data-id');
          selected[id] = !selected[id];
          el.classList.toggle('selected', selected[id]);
          commitAssets();
        });
      })(chipEls[i]);
    }
    // wire colours
    ['biColor1', 'biColor2', 'biColor3'].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.addEventListener('input', commitColors);
    });
    // wire text fields
    var sv = document.getElementById('biServices'); if (sv) sv.addEventListener('input', function () { commitList('realServices', sv); });
    var so = document.getElementById('biSocials');  if (so) so.addEventListener('input', function () { commitList('socialLinks', so); });
    var ct = document.getElementById('biContact');  if (ct) ct.addEventListener('input', function () { set('realContact', ct.value.trim()); });
    return true;
  }

  function injectCSS() {
    if (document.getElementById('brandIntakeCSS')) return;
    var css =
      '.bi-sublabel{font-size:12.5px;color:var(--text-2,#a6abc6);margin-bottom:9px;}' +
      '.bi-chips{margin-bottom:12px;}' +
      '.bi-colors{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;}' +
      '.bi-field{margin-bottom:12px;}' +
      '.bi-field .form-label{margin-bottom:6px;display:block;}' +
      '.bi-opt{font-weight:500;color:var(--text-3,#5f6585);}';
    var st = document.createElement('style'); st.id = 'brandIntakeCSS'; st.textContent = css;
    document.head.appendChild(st);
  }

  function init() {
    injectCSS();
    var tries = 0;
    (function attempt() {
      if (build()) return;
      if (tries++ < 20) setTimeout(attempt, 60);
    })();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
