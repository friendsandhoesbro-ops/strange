// ══════════════════════════════════════════════════════════════════════════════
// STEP GUIDE — cross-step contextual advice.
// Additive only: wraps goToStep to show a plain-English recommendation banner at
// the top of each step, based on EVERYTHING chosen in the prior steps. Touches no
// existing render logic, state shape, prompt engine, or other modules.
// ══════════════════════════════════════════════════════════════════════════════

const StepGuide = (() => {
  const d = () => (typeof state !== 'undefined' ? state.formData : {}) || {};

  const labelForType = (id) => {
    const t = (typeof PROJECT_TYPES !== 'undefined' ? PROJECT_TYPES : []).find(p => p.id === id);
    return t ? t.name : 'website';
  };

  // Read business nature from the Step-1 inputs + chosen project type
  function profile(f) {
    const text = [f.industry, f.description, f.services, f.products, f.projectType, f.targetMarket]
      .filter(Boolean).join(' ').toLowerCase();
    return {
      any:       text.trim().length > 0,
      creative:  /(video|editor|edit|film|motion|animat|photo|photograph|design|graphic|portfolio|content creat|youtub|cinema|3d|vfx|illustrat|art)/.test(text),
      ecommerce: /(shop|store|ecommerce|e-commerce|product|retail|sell|fashion|merch|catalog|boutique)/.test(text),
      saas:      /(saas|software|app\b|platform|subscription|dashboard|tech)/.test(text),
      local:     /(repair|clean|salon|barber|plumb|electric|dentist|clinic|restaurant|cafe|catering|gym|fitness|spa|landscap|construction|installation|local)/.test(text),
      services:  /(service|consult|agency|studio|firm|coach|freelanc|marketing|legal|account)/.test(text),
    };
  }

  // ── Per-step guidance (returns {heading, lead, picks:[{label,why,target}]} | null)
  function guideFor(step, f) {
    const p = profile(f);
    const type = f.projectType;
    const typeLabel = labelForType(type);

    if (step === 2) {
      let rec, recId, why, alt, altId, altWhy;
      if (p.creative)        { rec='Portfolio Website'; recId='portfolio';     why='It’s built to showcase your work (videos, photos, designs) and turn viewers into paying clients.'; alt='Landing Page'; altId='landing-page'; altWhy='Choose this instead if you want one focused page promoting a single service or offer.'; }
      else if (p.ecommerce)  { rec='E-Commerce Store'; recId='ecommerce';      why='You mentioned selling products — this gives you a catalogue, cart, and checkout.'; alt='Landing Page'; altId='landing-page'; altWhy='Better if you’re launching ONE product and want a single high-converting page.'; }
      else if (p.saas)       { rec='SaaS Platform'; recId='saas';              why='For software people log into and pay for — handles accounts, billing, and onboarding.'; alt='Landing Page'; altId='landing-page'; altWhy='Use this first if you just need a marketing page to collect signups before building the app.'; }
      else if (p.local)      { rec='Company Website'; recId='company-website';  why='A trust-building presence for a local business, with services, proof, and easy contact.'; alt='Landing Page'; altId='landing-page'; altWhy='Pick this for a single campaign page focused on calls or bookings.'; }
      else if (p.services)   { rec='Company Website'; recId='company-website';  why='Best for a services business — show what you do, prove it, and capture enquiries.'; alt='Portfolio Website'; altId='portfolio'; altWhy='Choose this if your WORK is the main selling point and you want to show it off.'; }
      else                   { rec='Company Website'; recId='company-website';  why='A solid, flexible default — services, about, proof, and a clear contact path.'; alt='Landing Page'; altId='landing-page'; altWhy='Pick this for one focused page built around a single action.'; }

      return {
        heading: 'Not sure which to pick?',
        lead: p.any
          ? `From what you told us about your business${f.industry ? ` (${f.industry})` : ''}, here’s what usually fits best — tap one to select it, or choose any card yourself:`
          : `Tip: fill in Step 1 for sharper advice. In general, here are two common choices — tap to select, or pick any card:`,
        picks: [
          { label: rec, why, target: { type: 'projectCard', id: recId } },
          { label: alt, why: altWhy, target: { type: 'projectCard', id: altId } },
        ],
      };
    }

    if (step === 3) {
      const byType = {
        'portfolio':       [['Lead Generation','so people who love your work can easily hire you'], ['Brand Authority','to be seen as a top choice in your field']],
        'landing-page':    [['Lead Generation','a landing page exists to capture one clear action'], ['Newsletter / Subscriber Growth','build an audience you can sell to later']],
        'ecommerce':       [['E-Commerce Sales','turn visitors into paying customers'], ['Customer Retention','repeat buyers are your cheapest sales']],
        'saas':            [['Product Demos','let buyers see the value before paying'], ['Lead Generation','capture trial signups and demo requests']],
        'agency':          [['Lead Generation','win new client enquiries'], ['Brand Authority','stand out from other agencies']],
        'law-firm':        [['Appointment Booking','get qualified consultations on the calendar'], ['Lead Generation','capture case enquiries']],
        'medical':         [['Appointment Booking','let patients book without phone calls'], ['Lead Generation','capture new-patient enquiries']],
        'marketplace':     [['Partner / Reseller Acquisition','you need sellers as well as buyers'], ['Community Building','keep both sides coming back']],
        'company-website': [['Lead Generation','turn visitors into enquiries'], ['Brand Authority','build trust over competitors']],
        'construction':    [['Lead Generation','win project enquiries'], ['Brand Authority','prove quality with past work']],
      };
      const recs = byType[type] || [['Lead Generation','turn visitors into enquiries'], ['Brand Authority','build trust over competitors']];
      return {
        heading: type ? `Recommended goals for a ${typeLabel}` : 'Recommended goals',
        lead: type
          ? `You chose a ${typeLabel}. For that, these goals usually matter most — tap to add them, or pick whatever fits your real priorities:`
          : `Pick a project type in Step 2 for tailored advice. Meanwhile, these are the most common goals:`,
        picks: recs.map(([label, why]) => ({ label, why, target: { type: 'chip', grid: 'goalsGrid', label } })),
      };
    }

    if (step === 4) {
      const feats = new Map();
      const add = (label, why) => { if (!feats.has(label)) feats.set(label, why); };
      const goals = f.businessGoals || [];

      if (type === 'portfolio')   { add('Video / Media Player','to play your showreel and project videos smoothly'); add('File Upload / Media Library','to organise all your images and clips'); add('Review & Rating System','client testimonials build trust fast'); }
      if (type === 'landing-page'){ add('Email Marketing Integration','capture emails so leads don’t go cold'); add('Analytics & Reporting','see what’s converting and improve it'); }
      if (type === 'ecommerce')   { add('Payments & Billing','take payments online'); add('Search & Filtering','help shoppers find products fast'); add('Review & Rating System','reviews boost sales and trust'); }
      if (type === 'saas')        { add('User Accounts & Auth','users log into their own space'); add('Subscription Management','charge on recurring plans'); add('Admin Dashboard','run the product behind the scenes'); }
      if (type === 'medical' || type === 'law-firm') { add('Booking System','let clients book without phone tag'); }

      if (goals.includes('Appointment Booking')) add('Booking System','your goal is bookings — this makes them effortless');
      if (goals.includes('Brand Authority') || goals.includes('Thought Leadership / Content')) add('Blog / Content Hub','publish content that builds authority and SEO');
      if (goals.includes('Lead Generation')) add('Email Marketing Integration','capture and follow up with every lead');
      if (goals.includes('E-Commerce Sales')) add('Payments & Billing','you can’t sell online without it');
      if (goals.includes('Newsletter / Subscriber Growth')) add('Email Marketing Integration','grow and manage your subscriber list');

      // Sensible default if nothing matched yet
      if (!feats.size) { add('Email Marketing Integration','capture visitor emails so leads don’t go cold'); add('Analytics & Reporting','measure what works'); }

      const picks = [...feats.entries()].slice(0, 5)
        .map(([label, why]) => ({ label, why, target: { type: 'chip', grid: 'featuresGrid', label } }));

      const ctx = [type ? `a ${typeLabel}` : 'your site', goals.length ? `aiming for ${goals.slice(0,2).join(' & ').toLowerCase()}` : ''].filter(Boolean).join(' ');
      return {
        heading: 'Suggested features for your build',
        lead: `Based on ${ctx}, these are the features that usually matter most — tap to add them. (Only add what you truly need; extras make the build slower and pricier.)`,
        picks,
      };
    }

    if (step === 5) {
      return {
        heading: 'Keep this simple',
        lead: type
          ? `Not technical? Leave everything on “Recommended”. For a ${typeLabel}, the tool already picks a fast, reliable setup. Only change these if a developer specifically asked you to.`
          : `Not technical? Leave everything on “Recommended” — the tool picks the best setup for you. Only change these if a developer asked you to.`,
        picks: [],
      };
    }

    if (step === 6) {
      const country = (f.country || '').toLowerCase();
      const ind = (f.industry || '').toLowerCase();
      let lead, picks = [];
      if (/medical|health|dental/.test(ind)) {
        lead = 'You’re in healthcare, so patient data needs protecting. Add the privacy law for your region:';
        picks = [{ label:'HIPAA (US health data)', why:'required if you handle US patients’ medical info', target:{type:'chip',grid:'complianceGrid',match:'HIPAA',id:'hipaa'} },
                 { label:'GDPR', why:'needed if any patients are in the EU', target:{type:'chip',grid:'complianceGrid',match:'GDPR',id:'gdpr'} }];
      } else if (/financ|fintech|bank|insur/.test(ind)) {
        lead = 'Finance handles sensitive money data. Consider:';
        picks = [{ label:'PCI-DSS', why:'required if you take card payments directly', target:{type:'chip',grid:'complianceGrid',match:'PCI-DSS',id:'pci'} },
                 { label:'GDPR', why:'protects EU customers’ personal data', target:{type:'chip',grid:'complianceGrid',match:'GDPR',id:'gdpr'} }];
      } else if (/nigeria|ghana|kenya|africa/.test(country)) {
        lead = `You’re in ${f.country}. Most local data rules (like Nigeria’s NDPR) are covered by “Local Regs”. If you also get EU visitors, add GDPR:`;
        picks = [{ label:'Local Regs', why:'covers your country’s own data rules', target:{type:'chip',grid:'complianceGrid',match:'Local Regs',id:'local'} },
                 { label:'Standard Only', why:'fine for a simple site that collects little data', target:{type:'chip',grid:'complianceGrid',match:'Standard Only',id:'none'} }];
      } else if (/europe|united kingdom|germany|france|spain|italy|netherlands/.test(country)) {
        lead = 'You target Europe, so EU privacy rules apply:';
        picks = [{ label:'GDPR', why:'legally expected for EU visitors’ data', target:{type:'chip',grid:'complianceGrid',match:'GDPR',id:'gdpr'} },
                 { label:'WCAG 2.1 AA', why:'accessibility — increasingly required and good for SEO', target:{type:'chip',grid:'complianceGrid',match:'WCAG',id:'wcag'} }];
      } else {
        lead = 'For most simple sites, “Standard Only” is enough. Add a privacy law only if you collect personal data from a specific region:';
        picks = [{ label:'Standard Only', why:'sensible security without a formal framework', target:{type:'chip',grid:'complianceGrid',match:'Standard Only',id:'none'} },
                 { label:'GDPR', why:'add it if you’ll have any EU visitors', target:{type:'chip',grid:'complianceGrid',match:'GDPR',id:'gdpr'} }];
      }
      return { heading: 'What about compliance?', lead, picks };
    }

    return null;
  }

  // ── Selection helpers ───────────────────────────────────────────────────────
  function findChip(gridId, want) {
    const w = (want || '').toLowerCase();
    return [...document.querySelectorAll('#' + gridId + ' .chip')].find(ch => {
      const c = ch.cloneNode(true);
      c.querySelectorAll('.gloss-info').forEach(n => n.remove());
      const txt = c.textContent.trim().toLowerCase();
      return txt === w || txt.startsWith(w);
    });
  }

  function isPicked(t, label) {
    const f = d();
    if (t.type === 'projectCard') return f.projectType === t.id;
    if (t.grid === 'goalsGrid')      return (f.businessGoals || []).includes(label);
    if (t.grid === 'featuresGrid')   return (f.features || []).includes(label);
    if (t.grid === 'complianceGrid') return (f.compliance || []).includes(t.id);
    return false;
  }

  function selectPick(t) {
    if (t.type === 'projectCard') {
      const card = document.getElementById('pt-' + t.id);
      if (card && !card.classList.contains('selected')) card.click();
    } else if (t.type === 'chip') {
      const chip = findChip(t.grid, t.label || t.match);
      if (chip && !chip.classList.contains('selected')) chip.click();
    }
    render(state.step);  // refresh so the pick shows as selected
  }

  // ── Render the banner into the current step panel ───────────────────────────
  function render(step) {
    document.getElementById('stepGuide')?.remove();
    if (typeof state === 'undefined') return;

    const g = guideFor(step, d());
    if (!g) return;

    const panel = document.getElementById('step-' + step);
    if (!panel) return;
    const header = panel.querySelector('.step-header');
    if (!header) return;

    const el = document.createElement('div');
    el.id = 'stepGuide';
    el.className = 'step-guide';
    el.innerHTML = `
      <div class="sg-icon">💡</div>
      <div class="sg-content">
        <div class="sg-heading">${g.heading}</div>
        <div class="sg-lead">${g.lead}</div>
        ${g.picks && g.picks.length ? `<div class="sg-picks">${g.picks.map((pk, i) => {
          const sel = isPicked(pk.target, pk.label);
          return `<button class="sg-pick ${sel ? 'selected' : ''}" data-i="${i}">
            <span class="sg-pick-mark">${sel ? '✓' : '+'}</span>
            <span class="sg-pick-text"><span class="sg-pick-label">${pk.label}</span><span class="sg-pick-why">${pk.why}</span></span>
          </button>`;
        }).join('')}</div>` : ''}
      </div>`;

    header.insertAdjacentElement('afterend', el);
    el.querySelectorAll('.sg-pick').forEach(btn =>
      btn.addEventListener('click', () => selectPick(g.picks[+btn.dataset.i].target)));
  }

  // Wrap goToStep so guidance refreshes on every navigation (nextStep/prevStep route through it)
  if (typeof window.goToStep === 'function') {
    const orig = window.goToStep;
    window.goToStep = function (n) {
      orig.apply(this, arguments);
      try { render(n); } catch (e) { console.error('StepGuide render failed:', e); }
    };
  }

  return { render, guideFor };
})();
