// ══════════════════════════════════════════════════════════════════════════════
// Automated tests for the prompt engine + intelligence layer.
// Pure logic only — no DOM/app.js needed. Run by opening /tests.html.
// ══════════════════════════════════════════════════════════════════════════════
(function () {
  // Keep tests offline & pure: stub fetch so LearningCapture never hits the network
  window.fetch = function () { return Promise.reject(new Error('disabled in tests')); };
  window.state = window.state || { formData: {} };

  const tests = [];
  const test = (name, fn) => tests.push({ name, fn });
  const assert = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
  const eq = (a, b, m) => { if (a !== b) throw new Error((m || 'eq') + ': expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a)); };
  const has = (s, sub, m) => { if (String(s).indexOf(sub) === -1) throw new Error((m || 'includes') + ': missing "' + sub + '"'); };
  const nothas = (s, sub, m) => { if (String(s).indexOf(sub) !== -1) throw new Error((m || 'excludes') + ': should not contain "' + sub + '"'); };

  const portfolioInd = {
    businessName: 'Samson', industry: 'Creative & Media',
    description: 'Freelance video editor and motion design expert with a decade of experience making cinematic brand edits.',
    projectType: 'portfolio', entityType: 'individual',
    businessGoals: ['Lead Generation', 'Brand Authority'], features: [], compliance: [], targetPlatform: 'Lovable',
  };
  const bizB2B = {
    businessName: 'GG Motors', industry: 'Manufacturing & Industrial',
    description: 'We design and build premium custom mini buses for businesses across Nigeria with full after-sales support.',
    projectType: 'company-website', entityType: 'business',
    targetMarket: 'Small & medium businesses (B2B)', revenueModel: 'B2B Services / Project-based',
    brandPositioning: 'Premium / luxury — top of the market', businessGoals: ['Lead Generation'],
    features: ['Image Gallery'], compliance: [], targetPlatform: 'Webflow',
  };

  // ── Prompt engine ────────────────────────────────────────────────────────────
  test('generateAll returns three non-empty outputs', () => {
    const o = new PromptEngine(portfolioInd).generateAll();
    assert(typeof o.build === 'string' && o.build.length > 500, 'build');
    assert(o.cto.length > 500, 'cto'); assert(o.sales.length > 500, 'sales');
  });
  test('build prompt has core sections', () => {
    const b = new PromptEngine(bizB2B).generateAll().build;
    has(b, 'EXECUTIVE MANDATE'); has(b, 'PAGE');
    assert(/ART DIRECTION|DESIGN SYSTEM/.test(b), 'design section');
  });
  test('compact mode is shorter than full', () => {
    const full = new PromptEngine(bizB2B, { compact: false }).generateAll().build;
    const comp = new PromptEngine(bizB2B, { compact: true }).generateAll().build;
    assert(comp.length < full.length, 'compact not shorter (' + comp.length + ' vs ' + full.length + ')');
  });
  test('compact keeps design + page specs', () => {
    const c = new PromptEngine(bizB2B, { compact: true }).generateAll().build;
    assert(/ART DIRECTION|DESIGN SYSTEM/.test(c), 'design'); has(c, 'HOMEPAGE');
  });
  test('compact drops ops-heavy sections', () => {
    const c = new PromptEngine(bizB2B, { compact: true }).generateAll().build;
    nothas(c, 'FUTURE EXPANSION'); nothas(c, 'DEPLOYMENT & DEVOPS');
  });
  test('individual voice: first person, bio not team', () => {
    const b = new PromptEngine(portfolioInd).generateAll().build;
    has(b, 'FIRST-PERSON SINGULAR'); has(b, 'ABOUT / BIO PAGE'); nothas(b, 'Team section');
  });
  test('business voice: team about page', () => {
    has(new PromptEngine(bizB2B).generateAll().build, 'Team section');
  });
  test('entityType defaults to business', () => {
    eq(new PromptEngine({ businessName: 'x' }).entityType, 'business');
  });
  test('build protocol toggles add/remove sections', () => {
    const both = new PromptEngine(bizB2B, { offerOptions: true, budgetMode: true }).generateAll().build;
    has(both, 'STEP 1'); has(both, 'STEP 2');
    const none = new PromptEngine(bizB2B, { offerOptions: false, budgetMode: false }).generateAll().build;
    nothas(none, 'HOW TO BUILD THIS — READ FIRST');
  });
  test('new project types exist and label correctly', () => {
    assert(PROJECT_TYPES.some(p => p.id === 'portfolio'), 'portfolio');
    assert(PROJECT_TYPES.some(p => p.id === 'landing-page'), 'landing');
    has(new PromptEngine(portfolioInd).generateAll().build, 'Portfolio Website');
  });
  test('portfolio individual CTA is personal', () => {
    const b = new PromptEngine({ businessName: 'Sam', projectType: 'portfolio', entityType: 'individual', businessGoals: [] }).generateAll().build;
    has(b, 'Get in Touch');
  });

  // ── Style library + CMS + imagery ──────────────────────────────────────────
  test('style library resolves a style and names are listed', () => {
    assert(StyleLibrary.names().length >= 2, 'library too small');
    const s = StyleLibrary.resolve({ brandPositioning: 'Premium / luxury — top of the market', industry: 'Legal Services' });
    assert(s && s.name && s.dna, 'no style resolved');
  });
  test('build prompt injects the selected visual style', () => {
    const b = new PromptEngine({ businessName: 'X', brandPositioning: 'Premium / luxury — top of the market', industry: 'Legal Services' }).generateAll().build;
    has(b, 'SELECTED VISUAL STYLE');
  });
  test('a named visual style is honoured', () => {
    const name = StyleLibrary.names()[0];
    const eng = new PromptEngine({ businessName: 'X', visualStyle: name });
    eq(eng.style.name, name);
  });
  test('imagery direction is always included', () => {
    const b = new PromptEngine({ businessName: 'X' }).generateAll().build;
    has(b, 'IMAGERY & MEDIA'); has(b, 'AI-GENERATED PLACEHOLDERS');
  });
  test('CMS section included by default, omitted when opted out', () => {
    has(new PromptEngine({ businessName: 'X' }).generateAll().build, 'CONTENT MANAGEMENT');
    nothas(new PromptEngine({ businessName: 'X', includeCMS: false }).generateAll().build, 'CONTENT MANAGEMENT — OWNER');
  });

  // ── Intelligence layer ───────────────────────────────────────────────────────
  test('Intelligence.run returns score, checklist, architecture', () => {
    const I = Intelligence.run(bizB2B, new PromptEngine(bizB2B).generateAll(), { mode: 'guided' });
    assert(typeof I.quality.total === 'number', 'score'); assert(Array.isArray(I.checklist.items), 'checklist');
    assert(I.architecture && I.architecture.name, 'arch');
  });
  test('recommend architecture: portfolio', () => {
    eq(RecommendationEngine.recommendArchitecture({ projectType: 'portfolio' }).name, 'Portfolio / showcase site');
  });
  test('recommend architecture: landing page', () => {
    eq(RecommendationEngine.recommendArchitecture({ projectType: 'landing-page' }).name, 'Single-focus landing page');
  });
  test('recommend architecture: ecommerce id', () => {
    eq(RecommendationEngine.recommendArchitecture({ projectType: 'ecommerce' }).name, 'E-commerce / catalog site');
  });
  test('recommend architecture: B2B custom → quote funnel', () => {
    eq(RecommendationEngine.recommendArchitecture({ targetMarket: 'Small & medium businesses (B2B)', revenueModel: 'B2B Services / Project-based', services: 'custom design and build' }).name, 'Quote-driven lead generation site');
  });
  test('robust: creative individual (no project type) → portfolio', () => {
    eq(RecommendationEngine.recommendArchitecture({ description: 'I am a freelance video editor and motion designer', entityType: 'individual' }).name, 'Portfolio / showcase site');
  });
  test('B2C audience is not classed as B2B', () => {
    assert(!IntelUtil.isB2B({ targetMarket: 'Consumers (B2C) — general public' }), 'b2b false');
    assert(IntelUtil.isB2C({ targetMarket: 'Consumers (B2C) — general public' }), 'b2c true');
  });
  test('builder adapters produce different prompts', () => {
    const o = new PromptEngine(bizB2B).generateAll();
    const lov = Intelligence.run({ ...bizB2B, targetPlatform: 'Lovable' }, o, { mode: 'guided' }).outputs.build;
    const web = Intelligence.run({ ...bizB2B, targetPlatform: 'Webflow' }, o, { mode: 'guided' }).outputs.build;
    assert(lov !== web, 'differ'); has(lov, 'LOVABLE'); has(web, 'WEBFLOW');
  });
  test('page guardrails: individual bio vs business leadership', () => {
    has(PageGuardrails.generate({ entityType: 'individual' }, { name: 'Portfolio / showcase site' }), 'BIO PAGE');
    has(PageGuardrails.generate({ entityType: 'business' }, { name: 'Authority & case-study-driven sales site' }), 'leadership');
  });
  test('quality score in range with valid status', () => {
    const I = Intelligence.run(bizB2B, new PromptEngine(bizB2B).generateAll(), { mode: 'guided' });
    assert(I.quality.total >= 0 && I.quality.total <= 100, 'range');
    assert(['READY', 'NEEDS IMPROVEMENT', 'NOT READY'].indexOf(I.quality.status) !== -1, 'status');
  });
  test('basic mode leaves the base prompt unchanged', () => {
    const o = new PromptEngine(bizB2B).generateAll();
    eq(Intelligence.run(bizB2B, o, { mode: 'basic' }).outputs.build, o.build);
  });
  test('input audit flags missing goals as high impact', () => {
    const issues = InputAudit.run({ businessName: 'x', description: 'short', businessGoals: [] });
    assert(issues.some(i => i.level === 'high' && /goal/i.test(i.message)), 'no high goal flag');
  });

  // ── Context-aware feature pairings ──────────────────────────────────────────
  test('pairings: portfolio drops enterprise companions', () => {
    window.state.formData = { projectType: 'portfolio', entityType: 'individual', features: ['Payments & Billing', 'Video / Media Player'] };
    const s = FeaturePairings.suggestions().map(x => x.feature);
    assert(s.indexOf('Subscription Management') === -1, 'subscription leaked');
    assert(s.indexOf('User Accounts & Auth') === -1, 'accounts leaked');
  });
  test('pairings: e-commerce keeps the same companions', () => {
    window.state.formData = { projectType: 'ecommerce', entityType: 'business', features: ['Payments & Billing'] };
    const s = FeaturePairings.suggestions().map(x => x.feature);
    assert(s.indexOf('Subscription Management') !== -1 || s.indexOf('User Accounts & Auth') !== -1, 'companions missing');
  });
  test('avoid lists are populated', () => {
    assert(TYPE_AVOID['portfolio'].indexOf('Payments & Billing') !== -1, 'portfolio avoid');
    assert(INDIVIDUAL_AVOID.indexOf('ERP Integration') !== -1, 'individual avoid');
  });

  // ── Selection analysis: synergies / needs / conflicts ──────────────────────
  test('analysis: detects a smart combination (goal + feature)', () => {
    window.state.formData = { businessGoals: ['Lead Generation'], features: ['Email Marketing Integration'], projectType: 'company-website' };
    const s = FeaturePairings.synergies();
    assert(s.some(x => /Lead Generation/.test(x.a + x.b) && /Email Marketing/.test(x.a + x.b)), 'synergy not found');
  });
  test('analysis: flags a missing prerequisite', () => {
    window.state.formData = { businessGoals: [], features: ['Subscription Management'], projectType: 'ecommerce' };
    const n = FeaturePairings.needs();
    assert(n.some(x => x.add === 'Payments & Billing'), 'prereq not flagged');
  });
  test('analysis: flags a goal that needs a feature', () => {
    window.state.formData = { businessGoals: ['E-Commerce Sales'], features: [], projectType: 'ecommerce' };
    const n = FeaturePairings.needs();
    assert(n.some(x => x.add === 'Payments & Billing' && x.kind === 'goal'), 'goal-need not flagged');
  });
  test('analysis: detects a contradiction', () => {
    window.state.formData = { businessGoals: ['Support Deflection'], features: ['Live Chat'], projectType: 'company-website' };
    assert(FeaturePairings.conflicts().some(c => !c.tooMany), 'contradiction not found');
  });
  test('analysis: flags too many goals', () => {
    window.state.formData = { businessGoals: ['Lead Generation', 'Brand Authority', 'E-Commerce Sales', 'Appointment Booking'], features: [] };
    assert(FeaturePairings.conflicts().some(c => c.tooMany && c.count === 4), 'too-many-goals not flagged');
  });

  // ── Glossary + learning ──────────────────────────────────────────────────────
  test('glossary covers key jargon and field labels', () => {
    ['cms', 'seo', 'crm'].forEach(k => assert(GLOSSARY[k], 'missing ' + k));
    eq(GLOSSARY_FIELDS['analytics'], 'analytics');
  });
  test('LearningCapture.record is safe and export returns an array', () => {
    LearningCapture.record({ event: 'test' });
    assert(Array.isArray(LearningCapture.export()), 'export');
  });

  // ── Runner ───────────────────────────────────────────────────────────────────
  const results = { total: tests.length, passed: 0, failed: 0, failures: [] };
  for (const t of tests) {
    try { t.fn(); results.passed++; }
    catch (e) { results.failed++; results.failures.push({ name: t.name, error: e.message }); }
  }
  window.TEST_RESULTS = results;

  const sum = document.getElementById('summary');
  sum.className = results.failed === 0 ? 'pass' : 'fail';
  sum.textContent = results.passed + '/' + results.total + ' passed' +
    (results.failed ? ' · ' + results.failed + ' FAILED' : ' · all green');
  document.getElementById('list').innerHTML = tests.map(t => {
    const f = results.failures.find(x => x.name === t.name);
    return '<div class="row"><span class="' + (f ? 'no' : 'ok') + '">' + (f ? '✕' : '✓') + '</span>' + t.name + '</div>' +
      (f ? '<div class="err">' + f.error + '</div>' : '');
  }).join('');
})();
