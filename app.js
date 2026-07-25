// ══════════════════════════════════════════════════════════════════════════════
// APP STATE
// ══════════════════════════════════════════════════════════════════════════════
const state = {
  step: 1,
  ctoMode: false,
  formData: {
    entityType: 'business',   // 'business' | 'individual' — drives voice & framing
    businessName: '', industry: '', description: '', country: '',
    targetMarket: '', services: '', products: '', existingWebsite: '',
    competitors: '', brandPositioning: '', revenueModel: '',
    projectType: '',
    businessGoals: [],
    features: [],
    framework: '', database: '', cms: '', hosting: '',
    analytics: '', authentication: '', storage: '',
    useRecommended: true,
    targetPlatform: 'Universal',
    visualStyle: 'auto',        // 'auto' (varies) or a named style from the library
    includeCMS: true,           // per-project: include a beginner CMS/admin
    compliance: [],
    additionalContext: '',
  },
  results: null,
  activeTab: 'build',
  intel: null,
  intelMode: (() => { try { return localStorage.getItem('epa_intel_mode') || 'guided'; } catch (e) { return 'guided'; } })(),
  // Compact ON by default — leaner prompt (drops ops-heavy sections, ~25-30% shorter)
  compactPrompt: (() => { try { return localStorage.getItem('epa_compact') !== '0'; } catch (e) { return true; } })(),
  // Build-protocol toggles (default ON; persisted)
  offerOptions: (() => { try { return localStorage.getItem('epa_offerOptions') !== '0'; } catch (e) { return true; } })(),
  budgetMode:   (() => { try { return localStorage.getItem('epa_budgetMode')   !== '0'; } catch (e) { return true; } })(),
};

// ══════════════════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════════════════
function init() {
  renderProjectTypes();
  renderGoals();
  renderFeatures();
  renderCompliance();
  updateStepUI();
  // Set recommended as active by default
  document.getElementById('recommendCard').classList.add('active');
  document.getElementById('techGrid').classList.add('dimmed');

  // Warm up the learning loop (best-effort; no-op on static hosting)
  if (typeof LearningCapture !== 'undefined') { try { LearningCapture.loadInsights(); } catch (e) {} }

  // Populate the Visual Style picker from the (growing) style library
  if (typeof StyleLibrary !== 'undefined') {
    try {
      const sel = document.getElementById('visualStyle');
      if (sel) StyleLibrary.names().forEach(n => {
        const o = document.createElement('option'); o.value = n; o.textContent = n; sel.appendChild(o);
      });
    } catch (e) {}
  }
}

// Per-project CMS choice (Step 5)
function setCMS(on) {
  state.formData.includeCMS = on;
  document.querySelectorAll('.entity-opt[data-cms]').forEach(el =>
    el.classList.toggle('active', el.dataset.cms === (on ? 'yes' : 'no')));
}

// ══════════════════════════════════════════════════════════════════════════════
// FIELD UPDATES
// ══════════════════════════════════════════════════════════════════════════════
function updateField(field, value) {
  state.formData[field] = value;
  if (field === 'description') {
    const count = value.length;
    const el = document.getElementById('descCount');
    if (el) el.textContent = `${count} characters${count < 150 ? ' — aim for 150+ for best results' : ' ✓'}`;
  }
}

// Individual vs Business — drives the prompt's voice and structure
function setEntityType(type) {
  state.formData.entityType = type;
  document.querySelectorAll('.entity-opt').forEach(el =>
    el.classList.toggle('active', el.dataset.entity === type));

  // Relabel the name field so individuals aren't asked for a "Business Name"
  const lbl = document.getElementById('businessNameLabel');
  if (lbl) lbl.innerHTML = (type === 'individual' ? 'Your Name' : 'Business Name') + ' <span class="required">*</span>';
  const inp = document.getElementById('businessName');
  if (inp) inp.placeholder = type === 'individual' ? 'e.g. Samson Okafor' : 'e.g. Meridian Construction Group';

  // Refresh step guidance if it's loaded (advice can adapt to the choice)
  if (typeof StepGuide !== 'undefined') { try { StepGuide.render(state.step); } catch (e) {} }
}

function toggleCTOMode() {
  state.ctoMode = !state.ctoMode;
  const btn = document.getElementById('ctoToggle');
  btn.classList.toggle('active', state.ctoMode);
}

function toggleRecommended() {
  state.formData.useRecommended = !state.formData.useRecommended;
  document.getElementById('recommendCard').classList.toggle('active', state.formData.useRecommended);
  document.getElementById('techGrid').classList.toggle('dimmed', state.formData.useRecommended);
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDER DYNAMIC GRIDS
// ══════════════════════════════════════════════════════════════════════════════
function renderProjectTypes() {
  const grid = document.getElementById('projectTypeGrid');
  grid.innerHTML = PROJECT_TYPES.map(p => `
    <div class="project-card" id="pt-${p.id}" onclick="selectProjectType('${p.id}')" role="button" tabindex="0" aria-pressed="false">
      <div class="project-icon">${p.icon}</div>
      <div>
        <div class="project-name">${p.name}</div>
        <div class="project-desc">${p.desc}</div>
      </div>
    </div>
  `).join('');
}

function selectProjectType(id) {
  state.formData.projectType = id;
  document.querySelectorAll('.project-card').forEach(c => { c.classList.remove('selected'); c.setAttribute('aria-pressed', 'false'); });
  const el = document.getElementById(`pt-${id}`);
  if (el) { el.classList.add('selected'); el.setAttribute('aria-pressed', 'true'); }
}

function renderGoals() {
  const grid = document.getElementById('goalsGrid');
  grid.innerHTML = BUSINESS_GOALS.map(g => `
    <div class="chip" onclick="toggleChip(this, 'businessGoals', '${g.replace(/'/g, "\\'")}')" data-value="${g}" role="button" tabindex="0" aria-pressed="false">
      ${g}
    </div>
  `).join('');
}

function renderFeatures() {
  const grid = document.getElementById('featuresGrid');
  grid.innerHTML = FEATURES.map(f => `
    <div class="chip" onclick="toggleChip(this, 'features', '${f.replace(/'/g, "\\'")}')" data-value="${f}" role="button" tabindex="0" aria-pressed="false">
      ${f}
    </div>
  `).join('');
}

function renderCompliance() {
  const grid = document.getElementById('complianceGrid');
  grid.innerHTML = COMPLIANCE_OPTIONS.map(c => `
    <div class="chip" onclick="toggleChip(this, 'compliance', '${c.id}')" title="${c.desc}" data-value="${c.id}" role="button" tabindex="0" aria-pressed="false">
      <strong>${c.label}</strong>&nbsp;<span style="opacity:0.6;font-size:11px">${c.desc}</span>
    </div>
  `).join('');
}

function toggleChip(el, field, value) {
  const arr = state.formData[field];
  const idx = arr.indexOf(value);
  if (idx === -1) { arr.push(value); el.classList.add('selected'); el.setAttribute('aria-pressed', 'true'); }
  else            { arr.splice(idx, 1); el.classList.remove('selected'); el.setAttribute('aria-pressed', 'false'); }
}

// ══════════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════════════════════════
function goToStep(n) {
  const prev = document.getElementById(`step-${state.step}`);
  if (prev) prev.classList.remove('active');
  state.step = n;
  const next = document.getElementById(`step-${state.step}`);
  if (next) next.classList.add('active');
  updateStepUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function jumpToStep(n) {
  if (n > 7) return;
  goToStep(n);
}

function nextStep() {
  if (state.step < 6) {
    goToStep(state.step + 1);
  } else if (state.step === 6) {
    goToStep(7);
    startGeneration();
  }
}

function prevStep() {
  if (state.step > 1) goToStep(state.step - 1);
}

function updateStepUI() {
  const n = state.step;

  // Step bar highlights
  document.querySelectorAll('.step-item').forEach(el => {
    if (parseInt(el.dataset.step, 10) === state.step) el.setAttribute('aria-current', 'step');
    else el.removeAttribute('aria-current');
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'completed');
    if (s === n) el.classList.add('active');
    else if (s < n) el.classList.add('completed');
  });

  // Footer nav
  const footerNav = document.getElementById('footerNav');
  const backBtn   = document.getElementById('backBtn');
  const nextBtn   = document.getElementById('nextBtn');

  if (n === 7) {
    footerNav.style.display = 'none';
    document.getElementById('stepBar').style.display = 'none';
  } else {
    footerNav.style.display = '';
    document.getElementById('stepBar').style.display = '';
    backBtn.style.display = n === 1 ? 'none' : '';
    nextBtn.textContent = n === 6 ? '' : 'Continue';
    if (n === 6) {
      nextBtn.innerHTML = `Generate Prompt <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    } else {
      nextBtn.innerHTML = `Continue <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
  }

  // Step dots
  const dots = document.getElementById('stepDots');
  if (dots && n < 7) {
    dots.innerHTML = [1,2,3,4,5,6].map(i =>
      `<div class="step-dot ${i === n ? 'active' : i < n ? 'done' : ''}"></div>`
    ).join('');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// GENERATION
// ══════════════════════════════════════════════════════════════════════════════
function startGeneration() {
  const loadingEl = document.getElementById('loadingState');
  const resultsEl = document.getElementById('resultsState');
  loadingEl.style.display = 'flex';
  resultsEl.style.display = 'none';
  if (window.LoadingFX) window.LoadingFX.start();   // ember particle-network backdrop

  const stepsEl = document.getElementById('loadingSteps');
  const bar     = document.getElementById('loadingBar');
  const status  = document.getElementById('loadingStatus');

  stepsEl.innerHTML = '';
  let progress = 0;
  let stepIdx  = 0;
  const totalWeight = LOADING_SEQUENCE.reduce((a, s) => a + s.weight, 0);
  let accumulated = 0;

  function tick() {
    if (stepIdx >= LOADING_SEQUENCE.length) {
      bar.style.width = '100%';
      status.textContent = 'Finalising enterprise specification...';
      setTimeout(showResults, 400);
      return;
    }

    const step = LOADING_SEQUENCE[stepIdx];

    // Mark previous step done
    const prevEl = stepsEl.querySelector('.loading-step.active');
    if (prevEl) { prevEl.classList.remove('active'); prevEl.classList.add('done'); prevEl.querySelector('.step-icon').textContent = '✓'; }

    // Add current step
    const el = document.createElement('div');
    el.className = 'loading-step active';
    el.innerHTML = `<span class="step-icon">→</span><span>${step.label}</span>`;
    stepsEl.appendChild(el);
    if (stepsEl.children.length > 7) stepsEl.children[0].remove();

    accumulated += step.weight;
    const targetPct = Math.round((accumulated / totalWeight) * 100);
    bar.style.width = targetPct + '%';
    status.textContent = step.label + '...';

    stepIdx++;
    const delay = 300 + Math.random() * 400;
    setTimeout(tick, delay);
  }

  tick();
}

// Regenerate prompts through the base engine, then (if available) the
// intelligence layer. Falls back to base behaviour if intelligence.js is absent.
function regenerateResults() {
  const engine  = new PromptEngine(state.formData, {
    compact:      !!state.compactPrompt,
    offerOptions: state.offerOptions,
    budgetMode:   state.budgetMode,
  });
  const outputs = engine.generateAll();

  if (typeof Intelligence !== 'undefined') {
    try {
      state.intel   = Intelligence.run(state.formData, outputs, { mode: state.intelMode || 'guided' });
      state.results = state.intel.outputs;
    } catch (e) {
      console.error('Intelligence layer failed — using base output:', e);
      state.intel   = null;
      state.results = outputs;
    }
  } else {
    state.intel   = null;
    state.results = outputs;
  }
}

function showResults() {
  regenerateResults();
  const scores  = new ScoringEngine(state.formData).calculateAll();
  const audit   = generateAuditChecklist(state.formData);
  const ctoFinds= state.ctoMode ? generateCTOFindings(state.formData) : [];

  state.scores = scores;

  if (window.LoadingFX) window.LoadingFX.stop();
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('resultsState').style.display = 'block';

  renderScores(scores);
  renderCTOFindings(ctoFinds);
  renderAuditChecklist(audit);
  renderIntelligence();
  syncPromptOptButtons();
  setTab('build');
  injectBuildSection();
}

function setIntelMode(mode) {
  state.intelMode = mode;
  try { localStorage.setItem('epa_intel_mode', mode); } catch (e) {}
  const activeTab = state.activeTab || 'build';
  regenerateResults();
  renderIntelligence();
  setTab(activeTab);
}

// ── Intelligence panel rendering ──────────────────────────────────────────────
function renderIntelligence() {
  let section = document.getElementById('intelSection');
  if (!state.intel) { if (section) section.remove(); return; }

  if (!section) {
    section = document.createElement('div');
    section.id = 'intelSection';
    section.className = 'intel-section';
    const anchor = document.getElementById('buildSection') || document.getElementById('auditSection');
    anchor.parentNode.insertBefore(section, anchor);
  }

  const I = state.intel;
  const mode = I.mode;
  const pill = (m, label) =>
    `<button class="intel-pill ${mode === m ? 'active' : ''}" onclick="setIntelMode('${m}')">${label}</button>`;

  let html = `
    <div class="intel-header">
      <div>
        <h2 class="intel-title">Strategy Intelligence</h2>
        <p class="intel-sub">Audit, recommendations, and quality scoring for your prompt</p>
      </div>
      <div class="intel-pills">
        ${pill('basic', 'Basic')}${pill('guided', 'Guided')}${pill('expert', 'Expert')}
      </div>
    </div>`;

  // Prompt quality score — all modes
  const q = I.quality;
  const statusClass = q.status === 'READY' ? 'ok' : q.status === 'NEEDS IMPROVEMENT' ? 'warn' : 'bad';
  html += `
    <div class="intel-card">
      <div class="intel-score-row">
        <div class="intel-score-num ${statusClass}">${q.total}<span>/100</span></div>
        <div>
          <div class="intel-score-status ${statusClass}">${q.status}</div>
          <div class="intel-score-label">Prompt Quality Score</div>
        </div>
      </div>
      ${q.improvements.length && mode !== 'basic' ? `
        <div class="intel-improvements">
          <div class="intel-card-label">Top improvements</div>
          ${q.improvements.map(i => `<div class="intel-item">→ ${i}</div>`).join('')}
        </div>` : ''}
      ${mode === 'expert' ? `
        <div class="intel-criteria">
          ${q.criteria.map(c => `<div class="intel-crit"><span>${c.name}</span><span>${c.got}/${c.max}</span></div>`).join('')}
        </div>` : ''}
    </div>`;

  if (mode !== 'basic') {
    // Recommended architecture
    const a = I.architecture;
    html += `
      <div class="intel-card">
        <div class="intel-card-label">Recommended website strategy</div>
        <div class="intel-arch-name">${a.name} <span class="intel-badge">Recommended</span></div>
        <div class="intel-item">${a.why}</div>
        <div class="intel-item intel-muted">Primary call-to-action: "${I.cta}" · You can change any of this — it's a recommendation, not a rule.</div>
        ${mode === 'expert' && a.alternative ? `
          <div class="intel-alt">
            <div class="intel-card-label">Alternative option</div>
            <div class="intel-item"><strong>${a.alternative.name}</strong> — ${a.alternative.whenToUse}</div>
          </div>` : ''}
      </div>`;

    // High-impact questions + medium recommendations
    const high = I.audit.filter(x => x.level === 'high');
    const med  = I.audit.filter(x => x.level === 'medium');
    if (high.length) {
      html += `<div class="intel-card intel-card-high">
        <div class="intel-card-label">Worth answering — these change the build</div>
        ${high.map(x => `
          <div class="intel-issue">
            <div class="intel-item">${escapeHtml(x.message)}</div>
            <div class="intel-item intel-muted">${escapeHtml(x.recommendation)}</div>
            <button class="intel-fix-btn" onclick="goToStep(${x.step})">Update answer →</button>
          </div>`).join('')}
      </div>`;
    }
    if (med.length) {
      html += `<div class="intel-card">
        <div class="intel-card-label">Recommendations applied — change if wrong</div>
        ${med.map(x => `
          <div class="intel-issue">
            <div class="intel-item">${escapeHtml(x.message)}</div>
            <div class="intel-item intel-muted">${escapeHtml(x.recommendation)} <a class="intel-link" onclick="goToStep(${x.step})">Change</a></div>
          </div>`).join('')}
      </div>`;
    }

    // Assumptions
    if (I.assumptions.length) {
      html += `<div class="intel-card">
        <div class="intel-card-label">Assumptions made — review recommended</div>
        ${I.assumptions.map(a => `
          <div class="intel-issue">
            <div class="intel-item">${escapeHtml(a.assumption)}</div>
            <div class="intel-item intel-muted">${escapeHtml(a.reason)}</div>
            <div class="intel-meta">Confidence: <strong>${a.confidence}</strong> · Review: ${a.review}</div>
          </div>`).join('')}
      </div>`;
    }

    // Strategic warnings — expert (and guided if any exist)
    if (I.warnings.length) {
      html += `<div class="intel-card intel-card-warn">
        <div class="intel-card-label">Strategic warnings</div>
        ${I.warnings.map(w => `
          <div class="intel-issue">
            <div class="intel-item"><strong>${escapeHtml(w.misaligned)}</strong></div>
            <div class="intel-item intel-muted">${escapeHtml(w.why)}</div>
            <div class="intel-item">Fix: ${escapeHtml(w.fix)}</div>
          </div>`).join('')}
      </div>`;
    }
  }

  // Validation checklist — all modes
  const c = I.checklist;
  html += `
    <div class="intel-card">
      <div class="intel-card-label">Final validation checklist</div>
      <div class="intel-checklist">
        ${c.items.map(i => `<div class="intel-check ${i.ok ? 'ok' : 'miss'}">${i.ok ? '✓' : '—'} ${i.label}</div>`).join('')}
      </div>
      ${c.risks.length ? `
        <div class="intel-risks">
          <div class="intel-card-label">Final risks before generation</div>
          ${c.risks.map(r => `<div class="intel-item">• ${escapeHtml(r)}</div>`).join('')}
        </div>` : ''}
    </div>`;

  section.innerHTML = html;
}

// ══════════════════════════════════════════════════════════════════════════════
// RESULTS RENDERING
// ══════════════════════════════════════════════════════════════════════════════
function renderScores(scores) {
  const grid = document.getElementById('scoresGrid');
  const overall = document.getElementById('overallScore');

  overall.innerHTML = `<div class="score-num">${scores.overall}</div><div class="score-label">Overall Score</div>`;

  const items = [
    { key: 'business',      label: 'Business Readiness' },
    { key: 'seo',           label: 'SEO Readiness' },
    { key: 'security',      label: 'Security Readiness' },
    { key: 'accessibility', label: 'Accessibility Readiness' },
    { key: 'scalability',   label: 'Scalability Readiness' },
    { key: 'enterprise',    label: 'Enterprise Readiness' },
  ];

  grid.innerHTML = items.map(item => {
    const val = scores[item.key];
    const color = val >= 90 ? '#9fd77a' : val >= 75 ? '#f59e0b' : '#ef4444';
    return `
      <div class="score-card">
        <div class="score-card-name">${item.label}</div>
        <div class="score-card-value" style="color:${color}">${val}</div>
        <div class="score-bar-track">
          <div class="score-bar-fill" style="width:0%;background:${color}" data-target="${val}"></div>
        </div>
      </div>
    `;
  }).join('');

  // Animate bars after paint
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('.score-bar-fill').forEach(el => {
        el.style.width = el.dataset.target + '%';
      });
    }, 100);
  });
}

function renderCTOFindings(findings) {
  const container = document.getElementById('ctoFindings');
  const list      = document.getElementById('ctoFindingsList');

  if (!findings || findings.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  list.innerHTML = findings.map(f => `
    <div class="cto-finding">
      <div class="cto-finding-icon">${f.icon}</div>
      <div>
        <div class="cto-finding-title">${escapeHtml(f.title)}</div>
        <div class="cto-finding-desc">${escapeHtml(f.desc)}</div>
      </div>
    </div>
  `).join('');
}

function renderAuditChecklist(audit) {
  const grid = document.getElementById('auditGrid');
  grid.innerHTML = audit.map(cat => `
    <div class="audit-category">
      <div class="audit-cat-header">
        <span class="audit-cat-icon">${cat.icon}</span>
        <span>${cat.name}</span>
      </div>
      <div class="audit-items">
        ${cat.items.map(item => `
          <div class="audit-item">
            <span class="audit-check">□</span>
            <span>${item}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function setTab(tab) {
  state.activeTab = tab;
  ['build','cto','sales'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('active', t === tab);
  });

  const content = state.results?.[tab] || '';
  const el = document.getElementById('outputContent');
  el.textContent = content;

  const labels = { build: 'Build Prompt', cto: 'CTO Audit Prompt', sales: 'Client Sales Brief' };
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  document.getElementById('outputMeta').textContent =
    `${labels[tab]} · ${wordCount.toLocaleString()} words · ${charCount.toLocaleString()} characters`;
}

function toggleCompact(btn) {
  state.compactPrompt = !state.compactPrompt;
  try { localStorage.setItem('epa_compact', state.compactPrompt ? '1' : '0'); } catch (e) {}

  // Regenerate all outputs (through the intelligence layer), keep the active tab
  const activeTab = state.activeTab || 'build';
  regenerateResults();
  renderIntelligence();
  setTab(activeTab);

  if (btn) {
    const s = btn.querySelector('.tg-state');
    if (s) s.textContent = state.compactPrompt ? 'On' : 'Off';
    btn.classList.toggle('copied', state.compactPrompt); // reuse green highlight style
  }
}

// Build-protocol toggles (Design options / Budget mode) — same flow as compact
function togglePromptOpt(key, btn) {
  state[key] = !state[key];
  try { localStorage.setItem('epa_' + key, state[key] ? '1' : '0'); } catch (e) {}

  const activeTab = state.activeTab || 'build';
  regenerateResults();
  renderIntelligence();
  setTab(activeTab);

  if (btn) {
    const s = btn.querySelector('.tg-state');
    if (s) s.textContent = state[key] ? 'On' : 'Off';
    btn.classList.toggle('copied', state[key]);   // reuse green "active" highlight
  }
}

// Reflect persisted toggle state on the toolbar buttons when results render
function syncPromptOptButtons() {
  const set = (id, on) => {
    const b = document.getElementById(id);
    if (!b) return;
    const s = b.querySelector('.tg-state');
    if (s) s.textContent = on ? 'On' : 'Off';
    b.classList.toggle('copied', !!on);
  };
  set('optOffer', state.offerOptions);
  set('optBudget', state.budgetMode);
  set('compactBtn', state.compactPrompt);
}

function copyOutput(btn) {
  const text = state.results?.[state.activeTab] || '';
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Copied!`;
    setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = orig; }, 2200);
  }).catch(() => {
    // Fallback for environments without clipboard API
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

function downloadOutput() {
  const text = state.results?.[state.activeTab] || '';
  if (!text) return;
  const labels = { build: 'build-prompt', cto: 'cto-audit-prompt', sales: 'client-sales-brief' };
  const name = `${state.formData.businessName || 'project'}-${labels[state.activeTab]}.txt`.toLowerCase().replace(/\s+/g,'-');
  const blob = new Blob([text], { type: 'text/plain' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ══════════════════════════════════════════════════════════════════════════════
// START
// ══════════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
