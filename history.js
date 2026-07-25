// ──────────────────────────────────────────────────────────────────────────────
// GENERATION HISTORY — remember the last few runs so a user can compare and
// restore them. state.results only ever holds the LATEST { build, cto, sales };
// regenerating overwrites it. This module snapshots each full generation into
// localStorage ('epa_history_v1', newest-first, capped at 5) and adds a small
// "History (n)" panel to the results toolbar with Restore + delete per run.
//
// CAPTURE: we wrap the global startGeneration with a transparent pass-through —
// it calls the original exactly once, never alters its behaviour, then polls
// state.results (set asynchronously during the loading sequence) until it
// changes reference, and stores the snapshot.
//
// RESTORE: sets state.results to the stored copy and refreshes the visible pane
// through app.js's own setTab() — no app.js edits.
//
// PRIVACY: device-local only. We store prompt text + a label + timestamp — never
// an API key or the access/gate code. A single oversized run (>1.5MB) is skipped.
//
// Additive module: pure push/list/clear are exposed as window.BakeHistory and
// unit-tested; the UI + wrapper no-op gracefully when their mounts are absent.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var KEY = 'epa_history_v1';
  var CAP = 5;
  var MAX_ONE = 1.5 * 1024 * 1024;                               // skip storing an oversized run

  // ── Pure store helpers (unit-tested) ──────────────────────────────────────
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var a = raw ? JSON.parse(raw) : [];
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function writeAll(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }

  function push(entry) {
    if (!entry || typeof entry !== 'object') return list();
    try { if (JSON.stringify(entry.results || {}).length > MAX_ONE) return list(); }
    catch (e) { return list(); }
    var a = read();
    a.unshift(entry);
    if (a.length > CAP) a = a.slice(0, CAP);
    writeAll(a);
    return a;
  }
  function list() { return read(); }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} return []; }
  function removeByTs(ts) {
    var a = read().filter(function (e) { return e.ts !== ts; });
    writeAll(a);
    return a;
  }

  // ── Capture: snapshot the current state.results after a generation ────────
  function captureRun() {
    var fd = (typeof state !== 'undefined' && state.formData) || {};
    var r = (typeof state !== 'undefined' && state.results) || null;
    if (!r || !(r.build || r.cto || r.sales)) return;
    var style = (fd.visualStyle && fd.visualStyle !== 'auto') ? fd.visualStyle : 'Auto';
    push({
      ts: Date.now(),
      name: fd.businessName || 'Untitled',
      style: style,
      results: { build: r.build || '', cto: r.cto || '', sales: r.sales || '' }
    });
    refreshButton();
  }

  // ── Transparent wrapper around the global startGeneration ─────────────────
  function wrap() {
    if (window.__bakeHistoryWrapped) return;
    if (typeof window.startGeneration !== 'function') return;
    window.__bakeHistoryWrapped = true;
    var _orig = window.startGeneration;
    window.startGeneration = function () {
      var pre = (typeof state !== 'undefined') ? state.results : null;
      var ret = _orig.apply(this, arguments);                    // exactly once, unchanged
      var tries = 0, MAXT = 60;                                  // 60 × 500ms ≈ 30s
      var iv = setInterval(function () {
        tries++;
        var now = (typeof state !== 'undefined') ? state.results : null;
        if (now && now !== pre) { clearInterval(iv); captureRun(); }
        else if (tries >= MAXT) { clearInterval(iv); }
      }, 500);
      return ret;
    };
  }

  // ── Restore a stored run into the live results view ───────────────────────
  function restore(entry) {
    if (!entry || !entry.results || typeof state === 'undefined') return;
    state.results = { build: entry.results.build || '', cto: entry.results.cto || '', sales: entry.results.sales || '' };
    var tab = state.activeTab || 'build';
    if (typeof window.setTab === 'function') { try { window.setTab(tab); } catch (e) {} }
    note(entry.name + ' restored');
    closePanel();
  }

  // ── UI: toolbar button + glass dropdown panel ─────────────────────────────
  var panel = null;

  function fmtTime(ts) {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return ''; }
  }

  function refreshButton() {
    var btn = document.getElementById('bakeHistoryBtn');
    if (!btn) return;
    var n = list().length;
    var label = btn.querySelector('.bh-count');
    if (label) label.textContent = n;
  }

  function closePanel() { if (panel && panel.parentNode) { panel.remove(); panel = null; } }

  function renderPanel(anchor) {
    closePanel();
    var items = list();
    panel = document.createElement('div');
    panel.id = 'bakeHistoryPanel'; panel.setAttribute('role', 'menu');
    var rows = items.length
      ? items.map(function (e) {
          var safeName = String(e.name || 'Untitled').replace(/</g, '&lt;');
          var safeStyle = String(e.style || 'Auto').replace(/</g, '&lt;');
          return '<div class="bh-row" data-ts="' + e.ts + '">' +
            '<button type="button" class="bh-restore" data-ts="' + e.ts + '">' +
              '<span class="bh-name">' + safeName + '</span>' +
              '<span class="bh-meta">' + safeStyle + ' · ' + fmtTime(e.ts) + '</span>' +
            '</button>' +
            '<button type="button" class="bh-del" data-ts="' + e.ts + '" aria-label="Delete this run">✕</button>' +
          '</div>';
        }).join('')
      : '<div class="bh-empty">No runs yet — generate a prompt and it lands here.</div>';
    panel.innerHTML = '<div class="bh-head">Recent runs</div>' + rows;
    document.body.appendChild(panel);

    // Position under the button (right-aligned), clamped to the viewport.
    var r = anchor.getBoundingClientRect();
    var pw = panel.offsetWidth || 280;
    var left = Math.max(12, Math.min(r.right - pw, window.innerWidth - pw - 12));
    panel.style.top = (r.bottom + 8) + 'px';
    panel.style.left = left + 'px';

    panel.addEventListener('click', function (e) {
      var restoreBtn = e.target.closest && e.target.closest('.bh-restore');
      var delBtn = e.target.closest && e.target.closest('.bh-del');
      if (delBtn) {
        var dts = Number(delBtn.getAttribute('data-ts'));
        removeByTs(dts); refreshButton(); renderPanel(anchor);
        return;
      }
      if (restoreBtn) {
        var rts = Number(restoreBtn.getAttribute('data-ts'));
        var hit = list().filter(function (x) { return x.ts === rts; })[0];
        if (hit) restore(hit);
      }
    });
  }

  function togglePanel(anchor) {
    if (panel) { closePanel(); return; }
    renderPanel(anchor);
  }

  function note(text) {
    var old = document.getElementById('bakeHistoryNote'); if (old) old.remove();
    var d = document.createElement('div');
    d.id = 'bakeHistoryNote'; d.setAttribute('role', 'status');
    d.textContent = '✦ ' + text;
    document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.classList.add('bh-hide'); }, 6000);
    setTimeout(function () { if (d.parentNode) d.remove(); }, 6500);
  }

  function injectCSS() {
    if (document.getElementById('bakeHistoryCSS')) return;
    var st = document.createElement('style'); st.id = 'bakeHistoryCSS';
    st.textContent =
      '#bakeHistoryPanel{position:fixed;z-index:135;width:min(280px,calc(100vw - 24px));max-height:60vh;overflow:auto;' +
      'background:rgba(16,12,9,.97);backdrop-filter:blur(16px);border:1px solid rgba(255,90,31,.42);border-radius:14px;padding:8px;' +
      'box-shadow:0 22px 60px rgba(0,0,0,.6);}' +
      '#bakeHistoryPanel .bh-head{font-family:"JetBrains Mono",monospace;text-transform:uppercase;letter-spacing:.08em;font-size:10.5px;' +
      'color:var(--text-3,#7a7f99);padding:6px 8px 8px;}' +
      '#bakeHistoryPanel .bh-empty{font-size:12px;color:var(--text-2,#a6abc6);padding:8px 8px 12px;line-height:1.5;}' +
      '#bakeHistoryPanel .bh-row{display:flex;align-items:stretch;gap:6px;margin-bottom:4px;}' +
      '#bakeHistoryPanel .bh-restore{flex:1;min-width:0;text-align:left;display:flex;flex-direction:column;gap:2px;cursor:pointer;' +
      'padding:9px 11px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:var(--text-1,#f8f4ef);font-family:inherit;}' +
      '#bakeHistoryPanel .bh-restore:hover{border-color:rgba(255,90,31,.5);background:rgba(255,90,31,.08);}' +
      '#bakeHistoryPanel .bh-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#bakeHistoryPanel .bh-meta{font-family:"JetBrains Mono",monospace;font-size:10.5px;letter-spacing:.04em;color:#ffb454;}' +
      '#bakeHistoryPanel .bh-del{width:32px;flex:0 0 auto;border-radius:10px;cursor:pointer;font-family:inherit;font-size:12px;' +
      'border:1px solid rgba(255,255,255,.1);background:transparent;color:var(--text-3,#7a7f99);}' +
      '#bakeHistoryPanel .bh-del:hover{border-color:rgba(255,120,90,.55);color:#ff8a5c;}' +
      '#bakeHistoryNote{position:fixed;left:50%;transform:translateX(-50%);bottom:88px;z-index:130;' +
      'background:rgba(16,12,9,.94);backdrop-filter:blur(14px);border:1px solid rgba(255,90,31,.45);border-radius:14px;padding:11px 16px;' +
      'font-size:12.5px;color:var(--text-1,#f8f4ef);box-shadow:0 18px 50px rgba(0,0,0,.5);transition:opacity .5s;}' +
      '#bakeHistoryNote.bh-hide{opacity:0;}';
    document.head.appendChild(st);
  }

  function init() {
    var bar = document.querySelector('.toolbar-actions');
    if (!bar) return;                                            // tests.html — no-op
    injectCSS();
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'tool-btn'; btn.id = 'bakeHistoryBtn';
    btn.title = 'Compare & restore your recent generations (device-local)';
    btn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.3" stroke="currentColor" stroke-width="1.3"/><path d="M7 4v3l2 1.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg> History (<span class="bh-count">0</span>)';
    btn.addEventListener('click', function (e) { e.stopPropagation(); togglePanel(btn); });
    bar.appendChild(btn);
    refreshButton();

    // Close the panel on any outside click.
    document.addEventListener('click', function (e) {
      if (!panel) return;
      if (panel.contains(e.target) || btn.contains(e.target)) return;
      closePanel();
    });
  }

  wrap();                                                        // wrap now (loads after app.js)
  if (document.readyState !== 'loading') { init(); }
  else { document.addEventListener('DOMContentLoaded', function () { wrap(); init(); }); }

  window.BakeHistory = { push: push, list: list, clear: clear };
})();
