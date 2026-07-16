// ══════════════════════════════════════════════════════════════════════════════
// BUILD SECTION — AI API integration + Quick Launchers
// ══════════════════════════════════════════════════════════════════════════════

const BUILD_PLATFORMS = [
  {
    id:          'claude',
    name:        'Claude API',
    badge:       'Best Results',
    icon:        `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="url(#cg)" stroke-width="1.5"/><path d="M7 10h6M10 7v6" stroke="url(#cg)" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="cg" x1="2" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse"><stop stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs></svg>`,
    desc:        'Anthropic Claude — finest code quality',
    models: [
      { id: 'claude-sonnet-4-6',         name: 'Claude Sonnet 4.6',  note: 'Recommended — fast & capable' },
      { id: 'claude-opus-4-8',           name: 'Claude Opus 4.8',    note: 'Most powerful' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5',   note: 'Fastest & cheapest' },
    ],
    keyUrl:         'https://console.anthropic.com/api-keys',
    keyHint:        'console.anthropic.com → API Keys',
    keyPlaceholder: 'sk-ant-api03-...',
    freeTip:        'New accounts receive free credits',
    videoUrl:       'https://www.youtube.com/watch?v=vgncj7MJbVU',
    steps: [
      'Go to <b>console.anthropic.com</b> and sign in (or create a free account).',
      'Click <b>API Keys</b> in the left-hand menu.',
      'Click <b>Create Key</b>, give it any name, and copy the key (it starts with <b>sk-ant-</b>).',
      'Paste it into the box above. That’s it!',
    ],
  },
  {
    id:          'openai',
    name:        'OpenAI API',
    badge:       '',
    icon:        `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3l2.5 5H7.5L10 5zm-4 7h8" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    desc:        'OpenAI GPT-4o models',
    models: [
      { id: 'gpt-4o',      name: 'GPT-4o',      note: 'Recommended' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', note: 'Faster & cheaper' },
      { id: 'o1-mini',     name: 'o1-mini',     note: 'Strong reasoning' },
    ],
    keyUrl:         'https://platform.openai.com/api-keys',
    keyHint:        'platform.openai.com → API Keys',
    keyPlaceholder: 'sk-...',
    freeTip:        'New accounts receive free trial credits',
    videoUrl:       'https://www.youtube.com/watch?v=SzPE_AE0eEo',
    steps: [
      'Go to <b>platform.openai.com</b> and sign in (or create a free account).',
      'Open the <b>API keys</b> page from your profile menu (top-right).',
      'Click <b>Create new secret key</b> and copy it (it starts with <b>sk-</b>).',
      'Paste it into the box above. That’s it!',
    ],
  },
];

const QUICK_LAUNCHERS = [
  { id: 'lovable', name: 'Lovable',   icon: '💜', url: 'https://lovable.dev',    loginUrl: 'https://lovable.dev/login',      desc: 'React + Supabase',
    hint: 'After signing in, paste the prompt into the "Ask Lovable to create..." box on the home screen.' },
  { id: 'bolt',    name: 'Bolt',      icon: '⚡', url: 'https://bolt.new',       loginUrl: 'https://bolt.new',               desc: 'Vite + React',
    hint: 'Click "Sign In" (top-right) — Bolt uses your StackBlitz account. Then paste the prompt into the main chat box.' },
  { id: 'v0',      name: 'v0',        icon: '▲',  url: 'https://v0.dev',         loginUrl: 'https://v0.dev',                 desc: 'Next.js + shadcn/ui',
    hint: 'Click "Sign In" — v0 uses your Vercel account. Then paste the prompt into the chat box.' },
  { id: 'replit',  name: 'Replit',    icon: '🔁', url: 'https://replit.com/new', loginUrl: 'https://replit.com/login',       desc: 'Node + Python',
    hint: 'After signing in, click "Create with AI" and paste the prompt into the Agent chat.' },
  { id: 'cursor',  name: 'Cursor',    icon: '🖱️', url: 'https://cursor.com',     loginUrl: 'https://cursor.com',             desc: 'AI code editor',
    hint: 'Cursor is a desktop app — download and sign in, then paste the prompt into the AI chat (Ctrl+L).' },
  { id: 'claudeai',name: 'Claude.ai', icon: '🤖', url: 'https://claude.ai/new',  loginUrl: 'https://claude.ai/login',        desc: 'Paste + build',
    hint: 'After signing in, paste the prompt into a new chat and ask Claude to build the site.' },
];

// ── Build state ───────────────────────────────────────────────────────────────
const buildState = {
  platform:  'claude',
  model:     'claude-sonnet-4-6',
  apiKey:    '',
  status:    'idle',     // idle | building | done | error
  rawOutput: '',
  files:     [],
  showKey:   false,
};

// ── Backend availability (desktop app has the Python server; web/static doesn't) ─
let BACKEND_OK = null;   // null = unknown, true = local server present, false = static
function checkBackend() {
  try {
    if (typeof fetch !== 'function') { BACKEND_OK = false; updateBackendNote(); return; }
    const url = (typeof EPA_apiUrl === 'function') ? EPA_apiUrl('/api/ping') : '/api/ping';
    fetch(url, { cache: 'no-store' })
      .then(r => { BACKEND_OK = r.ok; updateBackendNote(); })
      .catch(() => { BACKEND_OK = false; updateBackendNote(); });
  } catch (e) { BACKEND_OK = false; updateBackendNote(); }
}
function updateBackendNote() {
  const el = document.getElementById('backendNote');
  if (el) el.style.display = BACKEND_OK === false ? 'flex' : 'none';
}

// ── Inject build section into results page ─────────────────────────────────────
function injectBuildSection() {
  const existing = document.getElementById('buildSection');
  if (existing) { renderBuildSection(); return; }

  const container = document.createElement('div');
  container.id = 'buildSection';
  container.className = 'build-section';

  const auditSec = document.getElementById('auditSection');
  auditSec.parentNode.insertBefore(container, auditSec);

  renderBuildSection();
  checkBackend();   // detect desktop-app vs web/static and show the right guidance
}

function renderBuildSection() {
  const section = document.getElementById('buildSection');
  if (!section) return;

  const p = BUILD_PLATFORMS.find(x => x.id === buildState.platform) || BUILD_PLATFORMS[0];

  section.innerHTML = `
    <div class="bs-header">
      <div>
        <h2 class="bs-title">Build Your Website</h2>
        <p class="bs-sub">Turn your generated prompt into a working codebase — automatically</p>
      </div>
    </div>

    <div class="bs-backend-note" id="backendNote" style="display:none">
      <span class="bs-bn-icon">🌐</span>
      <div>You're on the web version. <strong>Quick Launch</strong> (below), <strong>Download ZIP</strong>, and <strong>CodeSandbox</strong> all work right here.
      The one-click <strong>Build with AI</strong> and <strong>Open in VS Code</strong> need the free desktop app — paste your prompt into a builder above instead.</div>
    </div>

    <!-- Quick launchers -->
    <div class="ql-wrap">
      <div class="ql-label">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v4l2-2M7 5L5 3M1 8h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Quick Launch — copy prompt &amp; open:
      </div>
      <div class="ql-grid">
        ${QUICK_LAUNCHERS.map(q => `
          <button class="ql-btn" onclick="quickLaunch('${q.id}')">
            <span class="ql-icon">${q.icon}</span>
            <div>
              <div class="ql-name">${q.name}</div>
              <div class="ql-desc">${q.desc}</div>
            </div>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="bs-divider"><span>or generate the code with an AI API</span></div>

    <!-- Platform cards -->
    <div class="bs-platforms">
      ${BUILD_PLATFORMS.map(pl => `
        <div class="bs-platform-card ${buildState.platform === pl.id ? 'selected' : ''}"
             onclick="selectBuildPlatform('${pl.id}')">
          <div class="bsp-icon">${pl.icon}</div>
          <div class="bsp-body">
            <div class="bsp-name">
              ${pl.name}
              ${pl.badge ? `<span class="bsp-badge">${pl.badge}</span>` : ''}
            </div>
            <div class="bsp-desc">${pl.desc}</div>
          </div>
          <div class="bsp-radio ${buildState.platform === pl.id ? 'checked' : ''}"></div>
        </div>
      `).join('')}
    </div>

    <!-- API config -->
    <div class="bs-config">
      <div class="bs-config-row">
        <div class="form-group" style="flex:2">
          <label class="form-label">
            API Key
            <a href="${p.keyUrl}" target="_blank" rel="noopener" class="key-link">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 10L10 1M10 1H5M10 1v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              ${p.keyHint}
            </a>
          </label>
          <div class="key-input-wrap">
            <input
              type="${buildState.showKey ? 'text' : 'password'}"
              class="form-input"
              id="buildApiKey"
              placeholder="${p.keyPlaceholder}"
              value="${buildState.apiKey}"
              oninput="buildState.apiKey = this.value"
              autocomplete="off"
            >
            <button class="key-toggle" onclick="toggleKeyVisibility()" type="button" title="${buildState.showKey ? 'Hide' : 'Show'}">
              ${buildState.showKey
                ? `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="7" r="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M2 2l10 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`
                : `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="7" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>`
              }
            </button>
          </div>
          <div class="key-tip">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" stroke-width="1"/><path d="M5.5 5v2.5M5.5 3.5v.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>
            ${p.freeTip} · Your key is only sent to ${p.name === 'Claude API' ? 'api.anthropic.com' : 'api.openai.com'} — never stored
          </div>
          ${p.steps ? `
          <details class="key-help">
            <summary>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M4.8 4.9a1.7 1.7 0 113 1.1c-.6.5-1.3.7-1.3 1.6M6.5 9.4v.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              Don’t have a key? Here’s how to get one (free)
            </summary>
            <div class="key-help-body">
              <ol class="key-steps">${p.steps.map(s => `<li>${s}</li>`).join('')}</ol>
              <a class="key-video" href="${p.videoUrl}" target="_blank" rel="noopener">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2.5" fill="#FF0000"/><path d="M6.5 5.8v4.4L10 8 6.5 5.8z" fill="#fff"/></svg>
                Watch the step-by-step video
              </a>
            </div>
          </details>` : ''}
        </div>
        <div class="form-group" style="flex:1">
          <label class="form-label">Model</label>
          <select class="form-input form-select" id="buildModel" onchange="buildState.model = this.value">
            ${p.models.map(m => `
              <option value="${m.id}" ${buildState.model === m.id ? 'selected' : ''}>
                ${m.name} — ${m.note}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- Build button -->
    <button class="btn-build ${buildState.status === 'building' ? 'loading' : ''}"
            id="buildBtn"
            onclick="startBuild()"
            ${buildState.status === 'building' ? 'disabled' : ''}>
      ${buildState.status === 'building'
        ? `<div class="btn-spinner"></div> Building...`
        : `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 7v9h5v-5h4v5h5V7L9 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
           Build My Website`
      }
    </button>

    <!-- Terminal output -->
    <div class="build-terminal" id="buildTerminal" style="display:${buildState.status !== 'idle' ? 'block' : 'none'}">
      <div class="terminal-hdr">
        <div class="t-dots">
          <span></span><span></span><span></span>
        </div>
        <span class="t-title" id="tTitle">
          ${buildState.status === 'building' ? 'Generating code...' : buildState.status === 'done' ? 'Generation complete' : buildState.status === 'error' ? 'Error' : ''}
        </span>
        <span class="t-meta" id="tMeta"></span>
      </div>
      <pre class="terminal-body" id="terminalBody">${escapeHtml(buildState.rawOutput)}</pre>
    </div>

    <!-- File tree -->
    <div id="fileTreeSection" style="display:${buildState.files.length ? 'block' : 'none'}">
      ${renderFileTree()}
    </div>
  `;
}

// ── Quick launcher: guided sign-in + build flow ───────────────────────────────
function copyBuildPrompt() {
  const prompt = state.results?.build || '';
  if (!prompt) return false;
  navigator.clipboard.writeText(prompt).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = prompt; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  });
  return true;
}

function quickLaunch(id) {
  const q = QUICK_LAUNCHERS.find(x => x.id === id);
  if (!q || !state.results?.build) return;

  // Remove any open modal
  document.getElementById('qlModal')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'qlModal';
  overlay.className = 'ql-modal-overlay';
  overlay.innerHTML = `
    <div class="ql-modal">
      <div class="ql-modal-hdr">
        <span class="ql-modal-icon">${q.icon}</span>
        <div>
          <div class="ql-modal-title">Build with ${q.name}</div>
          <div class="ql-modal-sub">${q.desc}</div>
        </div>
        <button class="ql-modal-close" onclick="document.getElementById('qlModal').remove()">✕</button>
      </div>

      <div class="ql-step" id="qlStep1">
        <div class="ql-step-num">1</div>
        <div class="ql-step-body">
          <div class="ql-step-title">Sign in to your ${q.name} account</div>
          <div class="ql-step-desc">Opens in a new tab. Create a free account if you don't have one, then come back here.</div>
          <button class="btn-build ql-step-btn" onclick="qlSignIn('${q.id}')">Sign In to ${q.name} ↗</button>
        </div>
      </div>

      <div class="ql-step ql-step-locked" id="qlStep2">
        <div class="ql-step-num">2</div>
        <div class="ql-step-body">
          <div class="ql-step-title">Open ${q.name} with your prompt</div>
          <div class="ql-step-desc">${q.hint}</div>
          <button class="btn-build ql-step-btn" onclick="qlBuild('${q.id}', this)" disabled>Copy Prompt &amp; Open ${q.name} ↗</button>
        </div>
      </div>
    </div>`;

  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function qlSignIn(id) {
  const q = QUICK_LAUNCHERS.find(x => x.id === id);
  if (!q) return;
  window.open(q.loginUrl, '_blank', 'noopener');
  // Unlock step 2
  const s2 = document.getElementById('qlStep2');
  if (s2) {
    s2.classList.remove('ql-step-locked');
    s2.querySelector('button')?.removeAttribute('disabled');
  }
}

function qlBuild(id, btn) {
  const q = QUICK_LAUNCHERS.find(x => x.id === id);
  if (!q) return;
  copyBuildPrompt();
  window.open(q.url, '_blank', 'noopener');
  if (btn) btn.innerHTML = '✓ Prompt copied — paste it in ' + q.name;
}

// ── Platform selection ────────────────────────────────────────────────────────
function selectBuildPlatform(id) {
  buildState.platform = id;
  const p = BUILD_PLATFORMS.find(x => x.id === id);
  if (p) buildState.model = p.models[0].id;
  renderBuildSection();
}

function toggleKeyVisibility() {
  buildState.showKey = !buildState.showKey;
  buildState.apiKey = document.getElementById('buildApiKey')?.value || buildState.apiKey;
  renderBuildSection();
  document.getElementById('buildApiKey')?.focus();
}

// ── Start build ───────────────────────────────────────────────────────────────
async function startBuild() {
  const apiKey = (document.getElementById('buildApiKey')?.value || buildState.apiKey || '').trim();
  const model  = document.getElementById('buildModel')?.value  || buildState.model;
  const prompt = state.results?.build || '';

  if (!apiKey) {
    alert('Please enter your API key first.');
    document.getElementById('buildApiKey')?.focus();
    return;
  }
  if (!prompt) {
    alert('Generate your prompt first (Step 1–6).');
    return;
  }

  buildState.apiKey    = apiKey;
  buildState.model     = model;
  buildState.status    = 'building';
  buildState.rawOutput = '';
  buildState.files     = [];

  // Show terminal
  const terminal = document.getElementById('buildTerminal');
  const termBody = document.getElementById('terminalBody');
  const tTitle   = document.getElementById('tTitle');
  const tMeta    = document.getElementById('tMeta');
  const buildBtn = document.getElementById('buildBtn');
  const ftSec    = document.getElementById('fileTreeSection');

  if (terminal)  { terminal.style.display = 'block'; terminal.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (termBody)  termBody.textContent = '';
  if (tTitle)    tTitle.textContent = 'Connecting to API...';
  if (tMeta)     tMeta.textContent = '';
  if (ftSec)     ftSec.style.display = 'none';
  if (buildBtn)  { buildBtn.disabled = true; buildBtn.innerHTML = `<div class="btn-spinner"></div> Building...`; }

  let charCount = 0;
  let startTime = Date.now();

  try {
    const resp = await fetch((typeof EPA_apiUrl === 'function' ? EPA_apiUrl('/api/build') : '/api/build'), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-EPA-Key': (window.EPA_SHARED || '') },
      body:    JSON.stringify({
        platform: buildState.platform,
        apiKey,
        model,
        prompt,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
      throw new Error(err.error || `Server error ${resp.status}`);
    }

    if (tTitle) tTitle.textContent = 'Generating code...';

    const reader  = resp.body.getReader();
    const decoder = new TextDecoder();
    let   buf     = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const raw = trimmed.slice(5).trim();
        if (!raw) continue;

        let msg;
        try { msg = JSON.parse(raw); } catch { continue; }

        if (msg.error) {
          buildState.status = 'error';
          if (tTitle) tTitle.textContent = 'Error';
          if (termBody) termBody.textContent += `\n\n⚠ ERROR: ${msg.error}`;
          buildState.rawOutput += `\n\n⚠ ERROR: ${msg.error}`;
          break;
        }

        if (msg.text) {
          buildState.rawOutput += msg.text;
          charCount += msg.text.length;
          if (termBody) {
            termBody.textContent = buildState.rawOutput;
            termBody.scrollTop   = termBody.scrollHeight;
          }
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          if (tMeta) tMeta.textContent = `${charCount.toLocaleString()} chars · ${elapsed}s`;
        }

        if (msg.done && !msg.error) {
          buildState.status = 'done';
        }
      }

      if (buildState.status === 'error') break;
    }

    if (buildState.status === 'done' || (buildState.rawOutput.length > 100)) {
      buildState.status = 'done';
      buildState.files  = parseFiles(buildState.rawOutput);

      const missing = findMissingImports();
      if (missing.length) {
        if (tTitle) tTitle.textContent = `Incomplete — ${missing.length} missing file${missing.length !== 1 ? 's' : ''}`;
        const warn = `\n\n⚠ INCOMPLETE BUILD — these imports point to files that were never generated:\n` +
                     missing.map(x => `   • ${x}`).join('\n') +
                     `\n\nThe site will show a BLANK SCREEN if you run it like this.\nClick "Rebuild" to regenerate — the AI will be reminded to output every file.`;
        buildState.rawOutput += warn;
        if (termBody) { termBody.textContent = buildState.rawOutput; termBody.scrollTop = termBody.scrollHeight; }
      } else if (tTitle) {
        tTitle.textContent = `Complete — ${buildState.files.length} file${buildState.files.length !== 1 ? 's' : ''} generated`;
      }

      if (ftSec && buildState.files.length > 0) {
        ftSec.style.display = 'block';
        ftSec.innerHTML = renderFileTree();
        if (!missing.length) ftSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

  } catch (err) {
    buildState.status = 'error';
    if (tTitle) tTitle.textContent = 'Failed to connect';
    const msg = err.message.includes('Failed to fetch')
      ? 'The one-click AI build needs the free desktop app (local Python server). On the web version, use the Quick Launch buttons above to paste your prompt into Lovable, v0, Bolt, etc.'
      : err.message;
    if (termBody) termBody.textContent = `Error: ${msg}`;
    buildState.rawOutput = `Error: ${msg}`;
  } finally {
    if (buildBtn) {
      buildBtn.disabled = false;
      buildBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 7v9h5v-5h4v5h5V7L9 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg> ${buildState.status === 'done' ? 'Rebuild' : 'Try Again'}`;
    }
  }
}

// ── File parsing ──────────────────────────────────────────────────────────────
function parseFiles(output) {
  const files = [];
  const regex = /<file\s+path="([^"]+)">([\s\S]*?)<\/file>/g;
  let match;
  while ((match = regex.exec(output)) !== null) {
    files.push({ path: match[1].trim(), content: match[2].trim() });
  }
  return files;
}

// ── Missing file detection ────────────────────────────────────────────────────
// Catches truncated builds: JS imports AND HTML asset references (stylesheets,
// scripts, page links) that point to files the AI never generated.
function findMissingImports() {
  const paths = new Set(buildState.files.map(f => f.path.replace(/^\.\//, '')));
  const exts  = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
  const missing = [];

  const resolve = (fromPath, spec) => {
    const parts = fromPath.split('/').slice(0, -1);
    for (const seg of spec.split('/')) {
      if (seg === '.' || seg === '') continue;
      else if (seg === '..') parts.pop();
      else parts.push(seg);
    }
    return parts.join('/');
  };

  for (const f of buildState.files) {
    // JS/TS module imports
    if (/\.(tsx?|jsx?)$/.test(f.path)) {
      const re = /(?:from|import)\s+['"](\.[^'"]+)['"]/g;
      let m;
      while ((m = re.exec(f.content)) !== null) {
        const base = resolve(f.path, m[1]);
        if (!exts.some(e => paths.has(base + e))) {
          missing.push(`${f.path}  imports missing  ${m[1]}`);
        }
      }
    }

    // HTML asset references: <link href>, <script src>, <a href> to local files
    if (/\.html?$/.test(f.path)) {
      const re = /(?:href|src)\s*=\s*["']([^"'#?]+)["']/g;
      let m;
      while ((m = re.exec(f.content)) !== null) {
        const ref = m[1].trim();
        // External, special, or anchor refs — skip
        if (/^(https?:)?\/\//.test(ref) || /^(mailto:|tel:|data:|javascript:)/.test(ref)) continue;
        // Root-absolute paths break when served from a subfolder
        if (ref.startsWith('/')) {
          missing.push(`${f.path}  uses absolute path  ${ref}  (must be relative)`);
          continue;
        }
        // Only check local css/js/html targets (images may be external placeholders)
        if (!/\.(css|js|html?)$/.test(ref)) continue;
        const base = resolve(f.path, ref);
        if (!paths.has(base)) {
          missing.push(`${f.path}  references missing  ${ref}`);
        }
      }
    }
  }
  return [...new Set(missing)];
}

// ── File tree rendering ───────────────────────────────────────────────────────
function renderFileTree() {
  if (!buildState.files.length) return '';

  return `
    <div class="ft-section">
      <div class="ft-header">
        <div class="ft-title-row">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h5l2 2h5v9H2V3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
          <span>${buildState.files.length} Files Generated</span>
        </div>
        <div class="ft-actions">
          ${(typeof EPA_isRemote === 'function' && EPA_isRemote()) ? '' : `
          <button class="tool-btn tool-btn-primary" onclick="saveAndOpen(true, this)">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9.5 1L12 3.5v7a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1h7.5zM4 1v3h5V1M6.5 7.5m-1.5 0a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>
            Open in VS Code
          </button>
          <button class="tool-btn" onclick="saveAndOpen(false, this)">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.2"/><path d="M1.5 6.5h10M6.5 1.5c1.5 1.4 2.3 3.1 2.3 5s-.8 3.6-2.3 5c-1.5-1.4-2.3-3.1-2.3-5s.8-3.6 2.3-5z" stroke="currentColor" stroke-width="1.2"/></svg>
            Preview in Browser
          </button>`}
          <button class="tool-btn ${(typeof EPA_isRemote === 'function' && EPA_isRemote()) ? 'tool-btn-primary' : ''}" onclick="downloadZip()">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v7M4 5l2.5 3L9 5M1 10h11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Download ZIP
          </button>
          <button class="tool-btn" onclick="openInCodeSandbox()">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M7.5 1.5l4 4-4 4M1.5 5.5h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            CodeSandbox ↗
          </button>
        </div>
      </div>
      <div class="ft-list">
        ${buildState.files.map((f, i) => `
          <div class="ft-file" onclick="viewFile(${i})">
            <span class="ft-file-icon">${fileIcon(f.path)}</span>
            <span class="ft-file-path">${f.path}</span>
            <span class="ft-file-size">${formatSize(f.content.length)}</span>
            <button class="ft-copy" onclick="event.stopPropagation(); copyFile(${i}, this)" title="Copy file">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M2 9V2h7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            </button>
          </div>
        `).join('')}
      </div>
      <div class="ft-viewer" id="ftViewer" style="display:none">
        <div class="ftv-header">
          <span id="ftvPath"></span>
          <button class="tool-btn" onclick="document.getElementById('ftViewer').style.display='none'">Close</button>
        </div>
        <pre class="ftv-code" id="ftvCode"></pre>
      </div>
    </div>
  `;
}

function viewFile(idx) {
  const f = buildState.files[idx];
  if (!f) return;
  const viewer = document.getElementById('ftViewer');
  const path   = document.getElementById('ftvPath');
  const code   = document.getElementById('ftvCode');
  if (!viewer || !path || !code) return;
  path.textContent = f.path;
  code.textContent = f.content;
  viewer.style.display = 'block';
  viewer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function copyFile(idx, btn) {
  const f = buildState.files[idx];
  if (!f) return;
  navigator.clipboard.writeText(f.content).catch(() => {});
  const orig = btn.innerHTML;
  btn.innerHTML = '✓';
  setTimeout(() => { btn.innerHTML = orig; }, 1500);
}

// ── Download ZIP ──────────────────────────────────────────────────────────────
function downloadZip() {
  if (!buildState.files.length) return;

  // Use JSZip if available, otherwise download raw output
  if (typeof JSZip !== 'undefined') {
    const zip  = new JSZip();
    buildState.files.forEach(f => zip.file(f.path, f.content));
    const name = (state.formData?.businessName || 'project').toLowerCase().replace(/\s+/g, '-');
    zip.generateAsync({ type: 'blob' }).then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${name}-source.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  } else {
    // Fallback: download as single text file
    const text = buildState.files.map(f => `\n${'='.repeat(60)}\nFILE: ${f.path}\n${'='.repeat(60)}\n${f.content}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'generated-code.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }
}

// ── Save locally + open in VS Code (the reliable path — no cloud needed) ──────
async function saveAndOpen(launchVSCode, btn) {
  if (!buildState.files.length) return;

  const origLabel = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = 'Saving...'; }

  try {
    const resp = await fetch('/api/export', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:   state.formData?.businessName || 'my-website',
        files:  buildState.files,
        prompt: state.results?.build || '',
      }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.ok) throw new Error(data.error || `Export failed (${resp.status})`);

    buildState.exportedFolder = data.folder;
    buildState.exportedUrl    = data.url;

    if (launchVSCode) {
      const vs = await fetch('/api/open-vscode', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ folder: data.folder }),
      });
      const vsData = await vs.json();
      if (!vs.ok) alert(`Files saved to:\n${data.folder}\n\nBut VS Code could not be launched: ${vsData.error}`);
    }

    // Open the live preview in a new browser tab
    window.open(data.url, '_blank', 'noopener');

    if (btn) btn.innerHTML = '✓ Saved';
    setTimeout(() => { if (btn) { btn.disabled = false; btn.innerHTML = origLabel; } }, 2500);
  } catch (err) {
    if (btn) { btn.disabled = false; btn.innerHTML = origLabel; }
    const msg = (err.message || '').includes('Failed to fetch')
      ? 'Saving to a folder / opening VS Code needs the free desktop app. On the web version, use “Download ZIP” or “CodeSandbox” instead — they work right here.'
      : `Export failed: ${err.message}`;
    alert(msg);
  }
}

// ── Open in CodeSandbox ───────────────────────────────────────────────────────
function openInCodeSandbox() {
  if (!buildState.files.length) return;

  const missing = findMissingImports();
  if (missing.length) {
    const go = confirm(
      `WARNING: This build is incomplete — ${missing.length} imported file(s) were never generated:\n\n` +
      missing.slice(0, 8).map(x => `• ${x}`).join('\n') +
      (missing.length > 8 ? `\n…and ${missing.length - 8} more` : '') +
      `\n\nThe preview will show a BLANK SCREEN. Click "Rebuild" first instead.\n\nOpen in CodeSandbox anyway?`
    );
    if (!go) return;
  }

  if (typeof LZString === 'undefined') {
    alert('CodeSandbox export library failed to load. Check your internet connection and reload the page.');
    return;
  }

  const files = {};
  buildState.files.forEach(f => { files[f.path] = { content: f.content }; });

  // Force a container sandbox — CodeSandbox's in-browser bundler can't run Vite
  // projects (blank preview). A container runs real node + real Vite.
  files['sandbox.config.json'] = {
    content: JSON.stringify({ template: 'node', container: { port: 5173, node: '18' } }, null, 2),
  };

  // Container sandboxes run `npm start` and need --host so the proxy can connect
  if (files['package.json']) {
    try {
      const pkg = JSON.parse(files['package.json'].content);
      pkg.scripts = pkg.scripts || {};
      if (pkg.scripts.dev && !pkg.scripts.dev.includes('--host')) pkg.scripts.dev += ' --host';
      if (!pkg.scripts.start) pkg.scripts.start = pkg.scripts.dev || 'vite --host';
      files['package.json'].content = JSON.stringify(pkg, null, 2);
    } catch (e) { /* malformed package.json — export as-is */ }
  }

  const parameters = LZString.compressToBase64(JSON.stringify({ files }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const form = document.createElement('form');
  form.method = 'post';
  form.action = 'https://codesandbox.io/api/v1/sandboxes/define';
  form.target = '_blank';
  form.style  = 'display:none';

  const inp  = document.createElement('input');
  inp.type   = 'hidden';
  inp.name   = 'parameters';
  inp.value  = parameters;
  form.appendChild(inp);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function fileIcon(path) {
  const ext = path.split('.').pop().toLowerCase();
  const map = {
    ts: '🔷', tsx: '🔷', js: '🟨', jsx: '🟨',
    json: '📋', md: '📝', css: '🎨', scss: '🎨',
    html: '🌐', env: '🔒', sh: '⚙️', py: '🐍',
    sql: '🗄️', yml: '⚙️', yaml: '⚙️', gitignore: '👁️',
  };
  return map[ext] || '📄';
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

// Shared HTML escaper — THE helper for any user-influenced text that reaches
// innerHTML anywhere in the app (build terminal, intel panel, CTO findings).
function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
