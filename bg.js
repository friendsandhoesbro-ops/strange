// ──────────────────────────────────────────────────────────────────────────────
// Cinematic background — looping video behind the app (decorative only).
//   • #bgVideo  : the base HLS clip (shown on step 1 / Business).
//   • #bgVideo2 : per-step futuristic-AI clips for steps 2–7 (project, goals,
//                 features, technical, compliance, generate) — Higgsfield-
//                 generated, stored in assets/bg/. Crossfades in over the base
//                 clip at the SAME opacity + ember grade (0.10; see .bg-step-on
//                 in styles.css — matched to the base clip's Molten Ember layer).
// Graceful: if a stream/clip or hls.js fails, the ember glow + grid still show.
// enableWorker:false keeps HLS stable in sandboxed/preview environments.
// Public: window.setStepBackground(n) — called by goToStep() in app.js.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  var SRC = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

  // Step → per-step clip. Step 1 (Business) intentionally keeps the base HLS clip.
  var STEP_CLIPS = {
    2: 'assets/bg/step2-project.mp4',
    3: 'assets/bg/step3-goals.mp4',
    4: 'assets/bg/step4-features.mp4',
    5: 'assets/bg/step5-technical.mp4',
    6: 'assets/bg/step6-compliance.mp4',
    7: 'assets/bg/step7-generate.mp4'
  };

  var fx, v, v2;
  var activeVid = null;       // the clip that should currently be playing
  var curClip = '';           // src currently loaded into v2

  function play(el) { if (!el) return; var p = el.play(); if (p && p.catch) p.catch(function () {}); }

  // Swap the background to match the active wizard step.
  function setStepBackground(n) {
    if (!v2) return;
    var clip = STEP_CLIPS[n];
    if (clip) {
      if (curClip !== clip) {
        curClip = clip;
        v2.src = clip;
        try { v2.load(); } catch (e) {}
      }
      fx && fx.classList.add('bg-step-on');
      activeVid = v2;
      play(v2);
    } else {
      // Step 1 (or anything without a clip): reveal the base HLS clip again.
      fx && fx.classList.remove('bg-step-on');
      activeVid = v;
      play(v);
    }
  }
  window.setStepBackground = setStepBackground;

  function start() {
    fx = document.getElementById('bgFx');
    v  = document.getElementById('bgVideo');
    v2 = document.getElementById('bgVideo2');
    if (!v) return;
    [v, v2].forEach(function (el) { if (el) { el.muted = true; el.loop = true; el.playsInline = true; } });
    activeVid = v;

    var ready = function () { fx && fx.classList.add('bg-ready'); play(v); };

    // Mobile browsers often block muted autoplay until a user gesture — retry the
    // currently-active clip on the first touch/click.
    var resume = function () { play(activeVid); };
    document.addEventListener('touchstart', resume, { once: true, passive: true });
    document.addEventListener('click', resume, { once: true });

    // Stop decoding while the tab is hidden (saves battery/CPU); resume on return.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { try { v.pause(); } catch (e) {} try { v2 && v2.pause(); } catch (e) {} }
      else { play(activeVid); }
    });

    try {
      if (v.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari)
        v.src = SRC;
        v.addEventListener('loadeddata', ready, { once: true });
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: false, lowLatencyMode: false });
        hls.loadSource(SRC);
        hls.attachMedia(v);
        hls.on(Hls.Events.MANIFEST_PARSED, ready);
        hls.on(Hls.Events.ERROR, function (_e, data) { if (data && data.fatal) { try { hls.destroy(); } catch (e) {} } });
      }
      // If neither path works, the glow/grid background remains — nothing breaks.
    } catch (e) { /* decorative only */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
