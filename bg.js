// ──────────────────────────────────────────────────────────────────────────────
// Cinematic background — looping HLS video behind the app (decorative only).
// Graceful: if the stream or hls.js fails, the green/cyan glow + grid still show.
// enableWorker:false keeps it stable in sandboxed/preview environments.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  var SRC = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

  function start() {
    var v = document.getElementById('bgVideo');
    if (!v) return;
    v.muted = true; v.loop = true; v.playsInline = true;

    var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    var ready = function () { document.getElementById('bgFx') && document.getElementById('bgFx').classList.add('bg-ready'); play(); };

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
