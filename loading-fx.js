// ──────────────────────────────────────────────────────────────────────────────
// LOADING FX — the generation loader visual: an interactive particle-network
// canvas (drifting nodes + connecting filaments + mouse repulsion/highlight),
// rendered in the Molten Ember identity. Vanilla-JS adaptation of the "Aether
// Flow" React reference the owner supplied, recoloured ember/amber and scoped to
// the #loadingCanvas inside the step-7 loading panel (not full-window).
// Public API: window.LoadingFX.start() / .stop(). Purely decorative + additive.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var canvas = null, ctx = null, raf = null, running = false;
  var W = 0, H = 0, dpr = 1;
  var particles = [];
  var mouse = { x: null, y: null, r: 150 };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function Particle(x, y, dx, dy, s) { this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.s = s; }
  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2, false);
    ctx.fillStyle = 'rgba(255,150,80,0.85)';   // ember node
    ctx.fill();
  };
  Particle.prototype.update = function () {
    if (this.x > W || this.x < 0) this.dx = -this.dx;
    if (this.y > H || this.y < 0) this.dy = -this.dy;
    // Push away from the cursor (soft repulsion)
    if (mouse.x !== null) {
      var ddx = mouse.x - this.x, ddy = mouse.y - this.y;
      var dist = Math.sqrt(ddx * ddx + ddy * ddy);
      if (dist > 0 && dist < mouse.r + this.s) {
        var force = (mouse.r - dist) / mouse.r;
        this.x -= (ddx / dist) * force * 4;
        this.y -= (ddy / dist) * force * 4;
      }
    }
    this.x += this.dx; this.y += this.dy;
    this.draw();
  };

  function init() {
    particles = [];
    var n = Math.min(170, Math.floor((W * H) / 11000));
    for (var i = 0; i < n; i++) {
      var s = Math.random() * 2 + 1;
      var x = Math.random() * (W - s * 2) + s;
      var y = Math.random() * (H - s * 2) + s;
      var dx = (Math.random() * 0.4) - 0.2;
      var dy = (Math.random() * 0.4) - 0.2;
      particles.push(new Particle(x, y, dx, dy, s));
    }
  }

  function connect() {
    var maxSq = 130 * 130;
    var mR2 = mouse.r * mouse.r;
    for (var a = 0; a < particles.length; a++) {
      var pa = particles[a];
      var near = false;
      if (mouse.x !== null) {
        var mx = pa.x - mouse.x, my = pa.y - mouse.y;
        near = (mx * mx + my * my) < mR2;
      }
      for (var b = a + 1; b < particles.length; b++) {
        var px = pa.x - particles[b].x, py = pa.y - particles[b].y;
        var d2 = px * px + py * py;
        if (d2 < maxSq) {
          var op = 1 - d2 / maxSq;
          ctx.strokeStyle = near
            ? 'rgba(255,225,190,' + (op * 0.9).toFixed(3) + ')'   // highlighted near cursor
            : 'rgba(255,120,50,' + (op * 0.5).toFixed(3) + ')';    // ember filament
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);   // let the panel's warm backdrop show through
    for (var i = 0; i < particles.length; i++) particles[i].update();
    connect();
  }

  function loop() { render(); raf = requestAnimationFrame(loop); }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    init();
  }

  function onMove(e) { var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }
  function onLeave() { mouse.x = null; mouse.y = null; }
  function onVis() {
    if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    else if (running && !reduce && !raf) loop();
  }

  function start() {
    canvas = document.getElementById('loadingCanvas');
    if (!canvas || running) return;
    ctx = canvas.getContext('2d');
    running = true;
    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVis);
    if (reduce) render();     // one static frame, no animation
    else loop();
  }

  function stop() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVis);
    if (canvas) {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      if (ctx) ctx.clearRect(0, 0, W, H);
    }
    mouse.x = null; mouse.y = null;
  }

  window.LoadingFX = { start: start, stop: stop };
})();
