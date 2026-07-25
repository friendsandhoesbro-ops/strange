// ──────────────────────────────────────────────────────────────────────────────
// Cinematic background — a single looping HLS clip behind the app (decorative).
// Graceful: if the stream or hls.js fails, the ember glow + grid still show.
// enableWorker:false keeps it stable in sandboxed/preview environments.
//
// MOBILE: the video is skipped entirely on phones/tablets. Full-screen video
// decode + the ember CSS filter is a heavy battery/heat cost on mobile GPUs, so
// touch devices get the static ember glow/grid instead (styles.css also
// display:none's #bgVideo on mobile as a belt-and-suspenders).
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  var SRC = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

  var mobile = window.matchMedia &&
    (window.matchMedia('(max-width: 820px)').matches || window.matchMedia('(pointer: coarse)').matches);

  function start() {
    var v = document.getElementById('bgVideo');
    if (!v || mobile) return;   // no background video on mobile
    v.muted = true; v.loop = true; v.playsInline = true;

    var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    var ready = function () { var fx = document.getElementById('bgFx'); fx && fx.classList.add('bg-ready'); play(); };

    // Some desktop browsers still gate muted autoplay until a gesture — retry once.
    var resume = function () { play(); };
    document.addEventListener('click', resume, { once: true });

    // Stop decoding the video while the tab is hidden (saves battery/CPU); resume on return.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { try { v.pause(); } catch (e) {} }
      else { play(); }
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
