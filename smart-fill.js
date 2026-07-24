// ──────────────────────────────────────────────────────────────────────────────
// SMART FILL — "✨ Recommend for me". For users who don't know what to pick:
// they describe their business, click once, and Bake classifies the business,
// consults the cloud learning data of REAL similar businesses built with this
// tool (LearningCapture.insights, served by /api/insights), auto-selects every
// wizard option through the EXISTING controls (clicks + select-sets, the same
// replay pattern as draft.js — so state, visuals and ARIA all stay in sync and
// everything remains reviewable/changeable), then generates the prompt.
//
// Additive module: no architecture change, no hook edits. SmartFill.analyze()
// is pure (unit-tested); apply() only drives existing controls.
// ──────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  // ── Pure classifier: description text → recommended picks ─────────────────
  function analyze(text) {
    var t = ' ' + String(text || '').toLowerCase() + ' ';
    var has = function (re) { return re.test(t); };
    var p = { entityType: 'business', industry: 'Other', projectType: 'company-website',
              goals: [], features: [], compliance: ['wcag'], selects: {}, reasons: [] };

    // Who
    if (has(/\bi am\b|\bi'm\b|\bmy (work|portfolio|art|photography|freelanc)/) || has(/freelancer?|solo |personal brand/)) {
      p.entityType = 'individual'; p.reasons.push('Reads as one person, not a company — personal voice.');
    }

    // Industry (first match wins)
    var IND = [
      [/construct|renovat|roofing|plumb|electrician|real estate|property/, 'Construction & Real Estate'],
      [/law firm|legal|attorney|solicitor|notary/, 'Legal & Professional Services'],
      [/clinic|dental|medical|health|therap|wellness|pharma|doctor/, 'Healthcare & Medical'],
      [/fintech|bank|invest|insurance|accounting|payments?\b/, 'Financial Services & Fintech'],
      [/saas|software|app\b|platform|\bai\b|tech startup|developer/, 'Technology & Software'],
      [/shop|store|sell|cloth|fashion|retail|e-?commerce|boutique|products?\b|merch/, 'E-Commerce & Retail'],
      [/factory|manufactur|industrial|machin/, 'Manufacturing & Industrial'],
      [/agency|marketing|branding|design studio|creative studio|advertis/, 'Marketing & Creative Agency'],
      [/school|course|training|education|tutor|academy|coach/, 'Education & Training'],
      [/hotel|restaurant|caf[eé]|travel|tour|hospitality|catering/, 'Hospitality & Tourism'],
      [/logistic|shipping|delivery|freight|courier/, 'Logistics & Supply Chain'],
      [/solar|energy|utility|power\b/, 'Energy & Utilities'],
      [/non-?profit|charity|ngo|foundation|government/, 'Non-Profit & Government'],
      [/consult|advisor|strategy firm/, 'Consulting & Advisory'],
    ];
    for (var i = 0; i < IND.length; i++) if (has(IND[i][0])) { p.industry = IND[i][1]; break; }

    // Project type
    if (has(/sell|shop|store|e-?commerce|checkout|cart|products? online|boutique/)) p.projectType = 'ecommerce';
    else if (has(/marketplace|two-?sided|buyers and sellers|vendors/)) p.projectType = 'marketplace';
    else if (has(/saas|subscription software|multi-?tenant|b2b platform/)) p.projectType = 'saas';
    else if (p.entityType === 'individual' || has(/portfolio|showcase (my|our) work|photograph|videograph|illustrat/)) p.projectType = 'portfolio';
    else if (has(/law firm|attorney|legal/)) p.projectType = 'law-firm';
    else if (has(/clinic|medical|dental|patient/)) p.projectType = 'medical';
    else if (has(/construct|renovat|roofing|build(er|ing)/)) p.projectType = 'construction';
    else if (has(/agency|studio\b/)) p.projectType = 'agency';
    else if (has(/launch|waitlist|one product|single offer|landing/)) p.projectType = 'landing-page';
    p.reasons.push('Project type "' + p.projectType + '" fits how this business sells.');

    // Goals (max 3 — the intelligence layer flags 4+ as unfocused)
    if (p.projectType === 'ecommerce' || p.projectType === 'marketplace') p.goals = ['E-Commerce Sales', 'Customer Retention', 'Brand Authority'];
    else if (has(/book|appointment|schedul|reservation/)) p.goals = ['Appointment Booking', 'Lead Generation', 'Brand Authority'];
    else if (p.projectType === 'saas') p.goals = ['Lead Generation', 'Product Demos', 'Customer Retention'];
    else p.goals = ['Lead Generation', 'Brand Authority'];

    // Features (candidates — apply() skips any that don't exist as chips)
    if (p.projectType === 'ecommerce' || p.projectType === 'marketplace') p.features.push('Payments & Billing', 'User Accounts & Auth');
    if (has(/book|appointment|schedul|reservation/)) p.features.push('Booking & Scheduling');
    if (has(/blog|articles|content|tips|guides/)) p.features.push('Blog / Content Hub');
    if (p.projectType === 'portfolio' || p.projectType === 'construction' || p.projectType === 'agency') p.features.push('Image Gallery');
    if (has(/newsletter|mailing list|email list/)) p.features.push('Email Marketing Integration');
    if (has(/video|film|reel/)) p.features.push('Video / Media Player');

    // Compliance (ids match data.js COMPLIANCE)
    if (has(/europe|\beu\b|spain|germany|france|italy|netherlands|portugal|ireland/)) p.compliance.push('gdpr');
    if (has(/\buk\b|united kingdom|london|british/)) p.compliance.push('gdpr', 'dpa');
    if (has(/clinic|medical|patient|health/)) p.compliance.push('hipaa');
    if (p.projectType === 'ecommerce' || p.projectType === 'marketplace' || has(/payments?|checkout/)) p.compliance.push('pci');
    p.compliance = p.compliance.filter(function (c, idx) { return p.compliance.indexOf(c) === idx; });

    // Confirmed select values (set only if the option exists — guarded in apply)
    if (p.projectType === 'ecommerce') p.selects.targetMarket = 'Consumers (B2C) — general public';
    if (p.industry === 'Consulting & Advisory' || p.projectType === 'saas') p.selects.targetMarket = 'Small & medium businesses (B2B)';
    if (has(/premium|luxury|high-?end|bespoke|exclusive/)) p.selects.brandPositioning = 'Premium / luxury — top of the market';

    // Cloud learning data: real, similar businesses built with this tool
    try {
      var ins = (typeof LearningCapture !== 'undefined') && LearningCapture.insights;
      var byInd = ins && ins.byIndustry && ins.byIndustry[p.industry];
      if (byInd) {
        var top = Object.keys(byInd).sort(function (a, b) { return byInd[b] - byInd[a]; })[0];
        if (top) p.reasons.push('Cross-checked against ' + (ins.total || 'past') + ' real projects: similar ' + p.industry + ' businesses most often built "' + top + '".');
      }
    } catch (e) {}

    return p;
  }

  // ── Apply: drive the real controls (replay pattern), then generate ────────
  function clickChips(gridId, values, byId) {
    var g = document.getElementById(gridId);
    if (!g) return;
    var chips = g.querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) {
      var v = chips[i].getAttribute('data-value') || '';
      var hit = byId ? values.indexOf(v) !== -1 : values.indexOf(v) !== -1;
      if (hit && !chips[i].classList.contains('selected')) chips[i].click();
    }
  }
  function setSelect(id, value) {
    var el = document.getElementById(id);
    if (!el || !value) return;
    for (var i = 0; i < el.options.length; i++) {
      if (el.options[i].value === value) {
        el.value = value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
    }
  }

  function apply(p) {
    // Entity + industry (step 1)
    if (p.entityType && typeof setEntityType === 'function') { try { setEntityType(p.entityType); } catch (e) {} }
    setSelect('industry', p.industry);
    Object.keys(p.selects || {}).forEach(function (f) { setSelect(f, p.selects[f]); });
    // Project type (step 2) — via the real card so state/visuals/ARIA sync
    var card = document.getElementById('pt-' + p.projectType);
    if (card && !card.classList.contains('selected')) card.click();
    // Goals / features / compliance chips
    clickChips('goalsGrid', p.goals);
    clickChips('featuresGrid', p.features);
    clickChips('complianceGrid', p.compliance, true);
  }

  function recommendAndGenerate(btn) {
    var desc = (document.getElementById('description') || {}).value || '';
    if (desc.trim().length < 25) return;
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="sf-spin"></span> Analysing your business…'; }
    // Refresh insights (best-effort, async) then apply after a beat so the UX reads as "thinking"
    try { if (typeof LearningCapture !== 'undefined') LearningCapture.loadInsights(); } catch (e) {}
    setTimeout(function () {
      var picks = analyze(desc);
      try { apply(picks); } catch (e) {}
      if (btn) { btn.innerHTML = '✓ Options chosen — generating…'; }
      setTimeout(function () {
        try { goToStep(7); startGeneration(); } catch (e) {}
        if (btn) { btn.disabled = false; btn.innerHTML = SF_LABEL; }
      }, 650);
    }, 900);
  }

  // ── UI: button under the description, appears once there's enough text ────
  var SF_LABEL = '✨ Not sure what to pick? Recommend &amp; generate for me';

  function injectCSS() {
    if (document.getElementById('smartFillCSS')) return;
    var css =
      '.sf-btn{display:none;margin-top:10px;align-items:center;gap:8px;padding:11px 18px;border-radius:999px;border:1px solid rgba(255,90,31,0.45);' +
      'background:linear-gradient(120deg,rgba(255,90,31,0.16),rgba(255,180,84,0.10));color:#ffb454;font-family:"JetBrains Mono",ui-monospace,monospace;' +
      'font-size:12px;letter-spacing:0.06em;cursor:pointer;transition:all .2s;text-transform:uppercase;}' +
      '.sf-btn.sf-show{display:inline-flex;animation:sfIn .4s cubic-bezier(.22,1,.36,1);}' +
      '.sf-btn:hover{background:linear-gradient(120deg,rgba(255,90,31,0.28),rgba(255,180,84,0.16));transform:translateY(-1px);box-shadow:0 8px 24px rgba(255,90,31,0.25);}' +
      '.sf-btn:disabled{opacity:.7;cursor:wait;transform:none;}' +
      '@keyframes sfIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}' +
      '.sf-spin{width:12px;height:12px;border-radius:50%;border:2px solid rgba(255,180,84,.3);border-top-color:#ffb454;animation:sfSpin .7s linear infinite;display:inline-block;}' +
      '@keyframes sfSpin{to{transform:rotate(360deg)}}';
    var st = document.createElement('style'); st.id = 'smartFillCSS'; st.textContent = css;
    document.head.appendChild(st);
  }

  function init() {
    var ta = document.getElementById('description');
    if (!ta) return;                                   // (tests.html has no wizard — no-op)
    injectCSS();
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'sf-btn'; btn.id = 'smartFillBtn';
    btn.innerHTML = SF_LABEL;
    btn.addEventListener('click', function () { recommendAndGenerate(btn); });
    ta.parentNode.appendChild(btn);
    function toggle() { btn.classList.toggle('sf-show', (ta.value || '').trim().length >= 25); }
    ta.addEventListener('input', toggle);
    toggle();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  window.SmartFill = { analyze: analyze, apply: apply };
})();
