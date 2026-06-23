// ──────────────────────────────────────────────────────────────────────────────
// STYLE GALLERY — turns the Step-5 "Visual style" dropdown into a visual picker.
// Each library style gets a CSS-rendered mini-mockup (its real palette + type feel)
// so users can SEE what to expect. Purely presentational: tiles drive the existing
// #visualStyle <select> (set value + dispatch change), so app logic is untouched.
//
// Swatches live here (not in style-library.js, which stays pure design DNA). When a
// new style is added to the library, add a swatch below; unmatched styles fall back
// to a sensible aurora default so nothing breaks.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  // bg = page colour, ink = main text, accent/accent2 = the style's accents,
  // font = headline feel ('serif' | 'display' | 'grotesque' | 'mono').
  var SWATCHES = {
    'editorial-luxe':          { bg: '#FAF7F2', ink: '#23303f', accent: '#B8924C', accent2: '#9c7b3f', font: 'serif' },
    'kinetic-bold':            { bg: '#0A0A0A', ink: '#ffffff', accent: '#C8FF00', accent2: '#C8FF00', font: 'display' },
    'quiet-minimal':           { bg: '#070709', ink: '#F4F4F5', accent: '#8B5CF6', accent2: '#6366F1', font: 'grotesque' },
    '3d-creator-portfolio':    { bg: '#0C0C0C', ink: '#D7E2EA', accent: '#B600A8', accent2: '#BE4C00', font: 'display' },
    'shader-glass-agency':     { bg: '#EFEFEF', ink: '#141414', accent: '#F26522', accent2: '#FF5F03', font: 'grotesque' },
    'cinematic-ai-agent':      { bg: '#181818', ink: '#ffffff', accent: '#ffffff', accent2: '#9aa0a6', font: 'grotesque' },
    'glassmorphism-fintech':   { bg: '#f0f0f0', ink: '#1e325a', accent: '#5E6470', accent2: '#1e325a', font: 'grotesque' },
    'boutique-studio-founder': { bg: '#ffffff', ink: '#051A24', accent: '#0D212C', accent2: '#273C46', font: 'serif' },
    'liquid-glass-nature':     { bg: '#1b2620', ink: '#ffffff', accent: '#e6efe9', accent2: '#b8c7bd', font: 'grotesque' },
    'serene-wellness-glass':   { bg: '#2b303a', ink: '#ffffff', accent: '#f2f2f2', accent2: '#cfd2da', font: 'serif' },
    'warm-editorial-minimal':  { bg: '#F6F3EC', ink: '#1C1A17', accent: '#A9826B', accent2: '#8A9A5B', font: 'serif' },
    'industrial-brutalist':    { bg: '#d2cfc7', ink: '#0e0e0e', accent: '#ff5a1f', accent2: '#0e0e0e', font: 'mono' },
  };
  var FALLBACK = { bg: '#0d0f18', ink: '#f4f5fb', accent: '#8b5cf6', accent2: '#2dd4bf', font: 'grotesque' };

  var FONTS = {
    serif:     { family: "'Instrument Serif', Georgia, serif", weight: 500, tt: 'none',      ls: '0' },
    display:   { family: "'Inter', sans-serif",                weight: 900, tt: 'uppercase', ls: '-0.04em' },
    grotesque: { family: "'Inter', sans-serif",                weight: 700, tt: 'none',      ls: '-0.02em' },
    mono:      { family: "'JetBrains Mono', monospace",        weight: 600, tt: 'uppercase', ls: '0.04em' },
  };

  function esc(s) { return String(s).replace(/"/g, '&quot;'); }

  // One mini "website" thumbnail painted in the style's palette + type.
  function mockup(sw) {
    var f = FONTS[sw.font] || FONTS.grotesque;
    var sig = 'linear-gradient(90deg,' + sw.accent + ',' + sw.accent2 + ')';
    return (
      '<span class="stp" style="background:' + sw.bg + '">' +
        '<span class="stp-bar">' +
          '<span class="stp-dot" style="background:' + sw.accent + '"></span>' +
          '<span class="stp-pill" style="background:' + sw.ink + ';opacity:.18"></span>' +
        '</span>' +
        '<span class="stp-head" style="color:' + sw.ink + ';font-family:' + f.family + ';font-weight:' + f.weight + ';text-transform:' + f.tt + ';letter-spacing:' + f.ls + '">Aa</span>' +
        '<span class="stp-line" style="background:' + sw.ink + '"></span>' +
        '<span class="stp-line short" style="background:' + sw.ink + '"></span>' +
        '<span class="stp-foot">' +
          '<span class="stp-btn" style="background:' + sw.accent + ';color:' + sw.bg + '">Aa</span>' +
          '<span class="stp-sig" style="background:' + sig + '"></span>' +
        '</span>' +
      '</span>'
    );
  }

  function autoMockup() {
    return (
      '<span class="stp stp-auto">' +
        '<span class="stp-auto-glow"></span>' +
        '<span class="stp-auto-mark">✨</span>' +
      '</span>'
    );
  }

  function tile(value, title, sub, inner) {
    return (
      '<button type="button" class="style-tile" role="radio" aria-checked="false" data-style="' + esc(value) + '" title="' + esc(title) + '">' +
        inner +
        '<span class="st-name">' + esc(title) + '</span>' +
        (sub ? '<span class="st-sub">' + esc(sub) + '</span>' : '') +
      '</button>'
    );
  }

  function build() {
    var sel = document.getElementById('visualStyle');
    var gallery = document.getElementById('styleGallery');
    if (!sel || !gallery || typeof STYLE_LIBRARY === 'undefined') return false;

    var html = tile('auto', 'Auto', 'A fresh style each time', autoMockup());
    STYLE_LIBRARY.forEach(function (s) {
      var sw = SWATCHES[s.id] || FALLBACK;
      var cat = (s.aesthetics && s.aesthetics[0]) ? s.aesthetics[0] : 'style';
      html += tile(s.name, s.name, cat, mockup(sw));
    });
    gallery.innerHTML = html;

    var tiles = gallery.querySelectorAll('.style-tile');
    function selectTile(t) {
      for (var i = 0; i < tiles.length; i++) { tiles[i].classList.remove('selected'); tiles[i].setAttribute('aria-checked', 'false'); }
      t.classList.add('selected'); t.setAttribute('aria-checked', 'true');
      sel.value = t.getAttribute('data-style');
      sel.dispatchEvent(new Event('change', { bubbles: true })); // fires updateField('visualStyle', …)
    }
    for (var i = 0; i < tiles.length; i++) {
      (function (t) {
        t.addEventListener('click', function () { selectTile(t); });
        t.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTile(t); }
        });
      })(tiles[i]);
    }

    // Reflect the current value (defaults to 'auto').
    var cur = sel.value || 'auto';
    var active = gallery.querySelector('.style-tile[data-style="' + cur.replace(/"/g, '\\"') + '"]') || tiles[0];
    if (active) { active.classList.add('selected'); active.setAttribute('aria-checked', 'true'); }
    return true;
  }

  function injectCSS() {
    if (document.getElementById('styleGalleryCSS')) return;
    var css =
      '#visualStyle{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;}' +
      '.style-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:12px;margin-top:6px;}' +
      '.style-tile{padding:0;border:1px solid rgba(255,255,255,0.10);background:rgba(255,255,255,0.03);border-radius:16px;overflow:hidden;cursor:pointer;text-align:left;font-family:inherit;transition:transform .22s cubic-bezier(.22,1,.36,1),border-color .2s,box-shadow .3s;display:flex;flex-direction:column;}' +
      '.style-tile:hover{transform:translateY(-3px);border-color:rgba(139,92,246,0.5);box-shadow:0 14px 34px rgba(0,0,0,0.45);}' +
      '.style-tile:focus-visible{outline:none;border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,0.3);}' +
      '.style-tile.selected{border-color:rgba(139,92,246,0.85);box-shadow:0 0 0 1px rgba(139,92,246,0.7),0 14px 34px rgba(139,92,246,0.25);}' +
      '.stp{position:relative;display:block;height:96px;padding:10px 11px;overflow:hidden;}' +
      '.stp-bar{display:flex;align-items:center;gap:5px;margin-bottom:9px;}' +
      '.stp-dot{width:8px;height:8px;border-radius:50%;display:block;}' +
      '.stp-pill{flex:1;height:5px;border-radius:5px;display:block;max-width:46px;}' +
      '.stp-head{display:block;font-size:21px;line-height:1;margin-bottom:8px;}' +
      '.stp-line{display:block;height:4px;border-radius:4px;opacity:.28;margin-bottom:5px;width:78%;}' +
      '.stp-line.short{width:52%;opacity:.18;}' +
      '.stp-foot{display:flex;align-items:center;gap:7px;margin-top:8px;}' +
      '.stp-btn{font-size:9px;font-weight:700;padding:3px 8px;border-radius:999px;line-height:1;}' +
      '.stp-sig{flex:1;height:5px;border-radius:5px;display:block;}' +
      '.stp-auto{display:flex;align-items:center;justify-content:center;background:#0b0d16;}' +
      '.stp-auto-glow{position:absolute;inset:-30%;background:conic-gradient(from 0deg,#8b5cf6,#2dd4bf,#f472b6,#6366f1,#8b5cf6);filter:blur(16px);opacity:.55;animation:stpSpin 8s linear infinite;}' +
      '.stp-auto-mark{position:relative;font-size:26px;}' +
      '@keyframes stpSpin{to{transform:rotate(360deg);}}' +
      '.st-name{display:block;padding:9px 11px 1px;font-size:12.5px;font-weight:600;color:var(--text-1,#f4f5fb);}' +
      '.st-sub{display:block;padding:0 11px 10px;font-size:10.5px;color:var(--text-3,#5f6585);text-transform:capitalize;}' +
      '@media (prefers-reduced-motion: reduce){.stp-auto-glow{animation:none;}}';
    var st = document.createElement('style');
    st.id = 'styleGalleryCSS'; st.textContent = css;
    document.head.appendChild(st);
  }

  function init() {
    injectCSS();
    // The <select> is populated by app.js init; retry briefly until both are ready.
    var tries = 0;
    (function attempt() {
      if (build() || tries++ > 20) return;
      setTimeout(attempt, 60);
    })();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
