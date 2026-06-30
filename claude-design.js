// ──────────────────────────────────────────────────────────────────────────────
// CLAUDE DESIGN — "match a screenshot". The user uploads/drags/pastes an image of the
// look they want; we scan its styling data CLIENT-SIDE (canvas pixel analysis — no AI,
// no upload, nothing leaves the browser) and extract a real palette + theme + mood.
// That gets stored on state.formData.designRef and baked into the generated prompt by
// PromptEngine._designReference(), so the AI builder reproduces the look.
//
// Additive + presentational: mounts into #claudeDesign and writes state via the existing
// updateField(). Touches no wizard logic.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  function hex2(v) { return ('0' + (v & 255).toString(16)).slice(-2); }
  function toHex(p) { return '#' + hex2(p.r) + hex2(p.g) + hex2(p.b); }

  // Scan the image: dominant palette, light/dark theme, saturation mood, accent.
  function analyze(img) {
    var W = 64, H = Math.max(1, Math.round(64 * img.height / (img.width || 1)));
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, W, H);
    var data;
    try { data = ctx.getImageData(0, 0, W, H).data; } catch (e) { return null; }

    var buckets = {}, lumSum = 0, satSum = 0, n = 0;
    for (var i = 0; i < data.length; i += 4) {
      var r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 125) continue;
      n++;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      lumSum += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      satSum += max === 0 ? 0 : (max - min) / max;
      var key = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4);   // quantise to ~4 bits/channel
      var bk = buckets[key] || (buckets[key] = { c: 0, r: 0, g: 0, b: 0 });
      bk.c++; bk.r += r; bk.g += g; bk.b += b;
    }
    if (!n) return null;

    var arr = Object.keys(buckets).map(function (k) {
      var bk = buckets[k];
      return { c: bk.c, r: Math.round(bk.r / bk.c), g: Math.round(bk.g / bk.c), b: Math.round(bk.b / bk.c) };
    }).sort(function (a, b) { return b.c - a.c; });

    // dominant palette, de-duplicating near-identical colours
    var palette = [];
    for (var j = 0; j < arr.length && palette.length < 6; j++) {
      var col = arr[j];
      var dup = palette.some(function (p) { return Math.abs(p.r - col.r) + Math.abs(p.g - col.g) + Math.abs(p.b - col.b) < 48; });
      if (!dup) palette.push(col);
    }

    var avgLum = lumSum / n, avgSat = satSum / n;
    var mode = avgLum < 0.42 ? 'dark' : (avgLum > 0.62 ? 'light' : 'mixed');
    var mood = avgSat < 0.12 ? 'monochrome' : (avgSat < 0.30 ? 'muted' : (avgSat > 0.55 ? 'vibrant' : 'balanced'));

    // accent = most saturated palette colour that isn't near-black or near-white
    var accent = null, bestSat = -1;
    palette.forEach(function (p) {
      var max = Math.max(p.r, p.g, p.b), min = Math.min(p.r, p.g, p.b);
      var s = max === 0 ? 0 : (max - min) / max;
      var l = (0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b) / 255;
      if (l > 0.08 && l < 0.92 && s > bestSat) { bestSat = s; accent = p; }
    });

    return {
      palette: palette.map(toHex),
      bg: toHex(palette[0]),
      accent: toHex(accent || palette[Math.min(1, palette.length - 1)]),
      mode: mode + ' mode',
      mood: mood,
    };
  }

  var current = null;

  function setRef(ref, thumb) {
    current = ref;
    try { if (typeof updateField === 'function') updateField('designRef', ref); } catch (e) {}
    render(thumb);
  }

  function render(thumb) {
    var mount = document.getElementById('claudeDesign');
    if (!mount) return;
    if (!current) {
      mount.innerHTML =
        '<div class="cd-drop" id="cdDrop" tabindex="0" role="button" aria-label="Upload a reference screenshot">' +
          '<div class="cd-spark">✦</div>' +
          '<div class="cd-title">Drop a screenshot, click, or paste</div>' +
          '<div class="cd-sub">Bake scans its colours, theme &amp; mood and bakes them into your prompt — nothing leaves your browser.</div>' +
          '<input type="file" id="cdFile" accept="image/*" hidden>' +
        '</div>';
      wireDrop();
      return;
    }
    var sw = current.palette.map(function (h) { return '<span class="cd-sw" style="background:' + h + '" title="' + h + '"></span>'; }).join('');
    mount.innerHTML =
      '<div class="cd-result">' +
        '<img class="cd-thumb" src="' + (thumb || '') + '" alt="Your reference screenshot">' +
        '<div class="cd-meta">' +
          '<div class="cd-row"><span class="cd-badge">✦ Design Match</span>' +
            '<span class="cd-tags">' + current.mode + ' · ' + current.mood + '</span></div>' +
          '<div class="cd-swatches">' + sw + '</div>' +
          '<div class="cd-note">This look is baked into your prompt — the AI builder will match it.</div>' +
        '</div>' +
        '<button type="button" class="cd-remove" id="cdRemove" aria-label="Remove reference">✕</button>' +
      '</div>';
    var rm = document.getElementById('cdRemove');
    if (rm) rm.addEventListener('click', function () { setRef(null, null); });
  }

  function handleFile(file) {
    if (!file || !/^image\//.test(file.type)) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var url = e.target.result;
      var img = new Image();
      img.onload = function () {
        var ref = analyze(img);
        if (ref) setRef(ref, url);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function wireDrop() {
    var drop = document.getElementById('cdDrop');
    var file = document.getElementById('cdFile');
    if (!drop || !file) return;
    drop.addEventListener('click', function () { file.click(); });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
    file.addEventListener('change', function () { if (file.files && file.files[0]) handleFile(file.files[0]); });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('cd-over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('cd-over'); });
    });
    drop.addEventListener('drop', function (e) {
      var dt = e.dataTransfer; if (dt && dt.files && dt.files[0]) handleFile(dt.files[0]);
    });
  }

  // Paste an image anywhere while on the visual-style step.
  document.addEventListener('paste', function (e) {
    if (!document.getElementById('claudeDesign')) return;
    var items = (e.clipboardData || {}).items || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.indexOf('image') === 0) { handleFile(items[i].getAsFile()); break; }
    }
  });

  function injectCSS() {
    if (document.getElementById('claudeDesignCSS')) return;
    var css =
      '.cd-drop{display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;padding:22px 18px;border:1.5px dashed rgba(139,92,246,0.4);border-radius:16px;background:rgba(139,92,246,0.05);cursor:pointer;transition:border-color .2s,background .2s,transform .2s;}' +
      '.cd-drop:hover,.cd-drop:focus-visible,.cd-over{outline:none;border-color:#8b5cf6;background:rgba(139,92,246,0.10);transform:translateY(-2px);}' +
      '.cd-spark{font-size:22px;background:linear-gradient(120deg,#8b5cf6,#2dd4bf);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}' +
      '.cd-title{font-size:13.5px;font-weight:600;color:var(--text-1,#f4f5fb);}' +
      '.cd-sub{font-size:11.5px;color:var(--text-3,#5f6585);max-width:380px;line-height:1.5;}' +
      '.cd-result{display:flex;align-items:center;gap:14px;padding:12px;border:1px solid rgba(139,92,246,0.35);border-radius:16px;background:rgba(255,255,255,0.03);position:relative;}' +
      '.cd-thumb{width:78px;height:58px;object-fit:cover;border-radius:10px;border:1px solid rgba(255,255,255,0.12);flex-shrink:0;}' +
      '.cd-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:7px;}' +
      '.cd-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}' +
      '.cd-badge{font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;background:linear-gradient(120deg,#8b5cf6,#2dd4bf);color:#0b0712;}' +
      '.cd-tags{font-size:11.5px;color:var(--text-2,#a6abc6);text-transform:capitalize;}' +
      '.cd-swatches{display:flex;gap:6px;}' +
      '.cd-sw{width:24px;height:24px;border-radius:6px;border:1px solid rgba(255,255,255,0.14);display:block;}' +
      '.cd-note{font-size:11px;color:var(--text-3,#5f6585);}' +
      '.cd-remove{position:absolute;top:8px;right:8px;width:24px;height:24px;border-radius:50%;border:1px solid rgba(255,255,255,0.14);background:rgba(0,0,0,0.3);color:var(--text-2,#a6abc6);cursor:pointer;font-size:12px;line-height:1;transition:all .15s;}' +
      '.cd-remove:hover{background:#f87171;color:#fff;border-color:#f87171;}';
    var st = document.createElement('style'); st.id = 'claudeDesignCSS'; st.textContent = css;
    document.head.appendChild(st);
  }

  function init() {
    injectCSS();
    var tries = 0;
    (function attempt() {
      if (document.getElementById('claudeDesign')) { render(null); return; }
      if (tries++ < 20) setTimeout(attempt, 60);
    })();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
