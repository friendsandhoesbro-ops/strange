// ──────────────────────────────────────────────────────────────────────────────
// WELCOME — the intro screen shown right after the access gate, before the app.
// A slow, looped radial-network animation (ring of dots, chords through the
// centre, orbiting mono labels — CTO AUDIT…, SEO OPTIMIZATION…) with the
// headline "Enterprise-Grade Prompt Engineer" and a Click-to-proceed button.
// Modeled on the owner's reference composition, rendered in the Molten Ember
// identity. Sits BELOW the gate overlay (z), so it reveals when the code is
// accepted. Shows once per browser session. Purely presentational + additive.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';
  // Shows on EVERY page load / refresh (no once-per-session gate) — owner's request.

  var LABELS = ['CTO AUDIT', 'SEO OPTIMIZATION', 'MARKETING AGENCY', 'CONVERSION', 'STYLE LIBRARY', 'BRAND AUTHORITY', 'COMPLIANCE', 'ANALYTICS'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function injectCSS() {
    var st = document.createElement('style'); st.id = 'bakeWelcomeCSS';
    st.textContent =
      '#bakeWelcome{position:fixed;inset:0;z-index:500000;background:radial-gradient(60% 55% at 50% 44%,rgba(255,90,31,0.13),transparent 70%),#0b0907;' +
      'font-family:Inter,system-ui,sans-serif;overflow:hidden;transition:opacity .7s ease;}' +
      '#bakeWelcome.bw-out{opacity:0;pointer-events:none;}' +
      '#bwCanvas{position:absolute;inset:0;width:100%;height:100%;}' +
      '.bw-label{position:absolute;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:10px;letter-spacing:.14em;color:rgba(248,244,239,.82);white-space:nowrap;pointer-events:none;}' +
      '.bw-corner{position:absolute;left:clamp(18px,4vw,56px);bottom:clamp(18px,4vw,48px);max-width:min(640px,80vw);}' +
      '.bw-eyebrow{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.18em;color:#ffb454;margin-bottom:12px;}' +
      '.bw-eyebrow::before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:#ff5a1f;box-shadow:0 0 8px rgba(255,90,31,.9);margin-right:8px;vertical-align:1px;}' +
      '.bw-title{font-weight:800;font-size:clamp(30px,4.6vw,56px);line-height:1.05;letter-spacing:-0.02em;color:#f8f4ef;margin:0 0 20px;}' +
      '.bw-btn{display:inline-flex;align-items:center;gap:10px;background:#f8f4ef;color:#16100b;border:0;border-radius:6px;padding:14px 22px;' +
      'font-family:"JetBrains Mono",monospace;font-size:12.5px;letter-spacing:.09em;text-transform:uppercase;font-weight:700;cursor:pointer;transition:transform .18s,box-shadow .25s;}' +
      '.bw-btn:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(255,90,31,.35);}' +
      '.bw-btn:focus-visible{outline:2px solid #ff5a1f;outline-offset:3px;}' +
      '.bw-btn .bw-arrow{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#ff5a1f;color:#fff;border-radius:4px;font-weight:700;}' +
      '.bw-foot{position:absolute;right:clamp(18px,4vw,56px);bottom:clamp(18px,4vw,48px);font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.16em;color:rgba(248,244,239,.5);}' +
      '@media (max-width:640px){.bw-foot{display:none;}}';
    document.head.appendChild(st);
  }

  function build() {
    injectCSS();
    var w = document.createElement('div');
    w.id = 'bakeWelcome';
    w.setAttribute('role', 'dialog');
    w.setAttribute('aria-label', 'Welcome to Bake');
    w.innerHTML =
      '<canvas id="bwCanvas"></canvas>' +
      '<div id="bwLabels"></div>' +
      '<div class="bw-corner">' +
        '<div class="bw-eyebrow">BAKE</div>' +
        '<h1 class="bw-title">Enterprise-Grade<br>Prompt Engineer</h1>' +
        '<button type="button" class="bw-btn" id="bwProceed">Click to proceed <span class="bw-arrow">↗</span></button>' +
      '</div>' +
      '<div class="bw-foot">PROMPTS · AUDITS · BRIEFS</div>';
    document.body.appendChild(w);

    var canvas = w.querySelector('#bwCanvas');
    var labelsBox = w.querySelector('#bwLabels');
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, CX = 0, CY = 0, R = 0;

    function size() {
      W = w.clientWidth; H = w.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      CX = W * 0.5; CY = H * 0.44;
      R = Math.min(W, H) * 0.34;
    }
    size();
    window.addEventListener('resize', size);

    // Label DOM nodes (crisper than canvas text), orbiting just outside the ring
    var labelEls = LABELS.map(function (t, i) {
      var el = document.createElement('span');
      el.className = 'bw-label';
      el.textContent = t + ' ...';
      el.__ang = (i / LABELS.length) * Math.PI * 2 + 0.35;
      labelsBox.appendChild(el);
      return el;
    });

    var N = 110;                                       // ring dots
    var chords = [];                                   // {a,b,born,life,ph,spd}
    function spawnChord(now) {
      chords.push({ a: Math.floor(Math.random() * N), b: Math.floor(Math.random() * N),
                    born: now, life: 7000 + Math.random() * 9000,
                    ph: Math.random() * Math.PI * 2,   // per-line pulse phase (independent shimmer)
                    spd: 0.0011 + Math.random() * 0.0011 }); // per-line pulse speed (~3–6s cycle)
    }
    var t0 = performance.now();
    for (var i = 0; i < 85; i++) spawnChord(t0 - Math.random() * 8000);

    var rot = 0, last = t0;
    function frame(now) {
      var dt = Math.min(50, now - last); last = now;
      rot += dt * 0.0000225;                           // slow, but noticeable drift
      ctx.clearRect(0, 0, W, H);

      // chords — curved through the centre, fading over their life
      for (var c = chords.length - 1; c >= 0; c--) {
        var ch = chords[c], age = now - ch.born;
        if (age > ch.life) { chords.splice(c, 1); spawnChord(now); continue; }
        // Pulsing opacity: base 25%, swings the full 0–100% range (each line on its own phase).
        var pulse = 0.25 + 0.75 * Math.sin(now * ch.spd + ch.ph);
        var alpha = pulse < 0 ? 0 : (pulse > 1 ? 1 : pulse);
        var a1 = (ch.a / N) * Math.PI * 2 + rot, a2 = (ch.b / N) * Math.PI * 2 + rot;
        var x1 = CX + Math.cos(a1) * R, y1 = CY + Math.sin(a1) * R;
        var x2 = CX + Math.cos(a2) * R, y2 = CY + Math.sin(a2) * R;
        ctx.strokeStyle = 'rgba(255,176,120,' + alpha.toFixed(3) + ')';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(CX + (Math.random() * 0 ), CY, x2, y2);
        ctx.stroke();
      }

      // ring dots — gentle size pulse
      for (var d = 0; d < N; d++) {
        var ang = (d / N) * Math.PI * 2 + rot;
        var pulse = 1 + 0.35 * Math.sin(now * 0.0011 + d * 1.7);
        ctx.fillStyle = 'rgba(248,244,239,0.9)';
        ctx.beginPath();
        ctx.arc(CX + Math.cos(ang) * R, CY + Math.sin(ang) * R, 1.5 * pulse, 0, 7);
        ctx.fill();
      }

      // orbiting labels
      for (var l = 0; l < labelEls.length; l++) {
        var el = labelEls[l];
        var la = el.__ang + rot;
        var lx = CX + Math.cos(la) * (R + 34), ly = CY + Math.sin(la) * (R + 26);
        el.style.transform = 'translate(' + (lx - (Math.cos(la) < 0 ? el.offsetWidth : 0)) + 'px,' + ly + 'px)';
      }

      if (!document.hidden && w.parentNode) raf = requestAnimationFrame(frame);
    }

    var raf = null;
    if (reduce) { frame(performance.now()); cancelAnimationFrame(raf); } // one static render
    else raf = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && !reduce && w.parentNode) raf = requestAnimationFrame(frame);
    });

    function proceed() {
      w.classList.add('bw-out');
      setTimeout(function () { if (raf) cancelAnimationFrame(raf); w.remove(); }, 750);
    }
    w.querySelector('#bwProceed').addEventListener('click', proceed);
    document.addEventListener('keydown', function onKey(e) {
      if (!w.parentNode) { document.removeEventListener('keydown', onKey); return; }
      if ((e.key === 'Enter' || e.key === 'Escape') && !document.getElementById('epaGate')) proceed();
    });
  }

  if (document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);
})();
