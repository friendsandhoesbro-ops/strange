// ══════════════════════════════════════════════════════════════════════════════
// INTELLIGENCE LAYER — additive modules around the existing PromptEngine.
// Safe to remove: app.js falls back to base behaviour if this file is absent.
//
// Pipeline: input audit → assumptions → recommended architecture → consistency
// check → builder adaptation → prompt quality score → validation checklist.
// ══════════════════════════════════════════════════════════════════════════════

// ── Shared helpers ────────────────────────────────────────────────────────────
const IntelUtil = {
  // Combined free-text signal from every field the user filled in
  text(d) {
    return [d.industry, d.description, d.services, d.products, d.targetMarket,
            d.revenueModel, d.brandPositioning, d.projectType]
      .filter(Boolean).join(' ').toLowerCase();
  },
  hasFeature(d, sub) {
    return (d.features || []).some(f => f.toLowerCase().includes(sub.toLowerCase()));
  },
  isB2B(d) {
    const t = this.text(d);
    if (/\bb2c\b|consumer|families|general public|young adults|shoppers/.test(d.targetMarket || '')) return false;
    return /\bb2b\b|business(es)?|enterprise|corporate|procurement|government|wholesale|supplier|vendor|companies|organisation|organization|smes?\b/.test(t);
  },
  isB2C(d) {
    const t = (d.targetMarket || '') + ' ' + (d.industry || '');
    return /\bb2c\b|consumer|families|general public|young adults|shoppers|individuals|personal/.test(t);
  },
  customPriced(d) {
    return /project-based|consult|retainer|custom|bespoke|quote|contract|tailored|made-to-order|commission|freelanc|agency/.test(this.text(d));
  },
  fixedPriced(d) {
    return /e-?commerce|transactional|subscription|saas|retail|resold|\bshop\b|\bstore\b|catalog|merch|fashion|physical product/.test(this.text(d));
  },
  localService(d) {
    return /repair|maintenance|installation|hospitality|wellness|catering|events|property|salon|barber|plumb|electric|dentist|clinic|restaurant|cafe|hotel|\bgym\b|fitness|\bspa\b|landscap|cleaning|near me|local/.test(this.text(d));
  },
  creative(d) {
    return /video|editor|\bedit\b|film|motion|animat|photo|photograph|\bdesign|graphic|portfolio|content creat|youtub|cinema|\b3d\b|vfx|illustrat|\bart\b|creative|\bstudio\b/.test(this.text(d));
  },
  premium(d) {
    return /premium|luxury|high-?end|top of the market|bespoke|exclusive|enterprise-grade|boutique/.test((d.brandPositioning || '') + ' ' + (d.description || ''));
  },
  goal(d, sub) {
    return (d.businessGoals || []).some(g => g.toLowerCase().includes(sub.toLowerCase()));
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 13 — RECOMMENDATION ENGINE (rule-based, explainable)
// ══════════════════════════════════════════════════════════════════════════════
const RecommendationEngine = {
  // Returns { name, why, confidence (0-1), alternative: {name, whenToUse} }
  recommendArchitecture(d) {
    const U = IntelUtil;
    const pt = d.projectType || '';

    // Explicit project type is the strongest signal — honour it first
    if (pt === 'portfolio' || (U.creative(d) && d.entityType === 'individual')) {
      return {
        name: 'Portfolio / showcase site',
        why: 'The work itself is the strongest selling tool — the site should showcase projects front-and-centre and turn viewers into enquiries, in a personal voice.',
        confidence: 0.85,
        alternative: { name: 'Content-led authority site', whenToUse: 'If you also want to rank on Google and grow an audience with regular content.' },
      };
    }
    if (pt === 'landing-page') {
      return {
        name: 'Single-focus landing page',
        why: 'One page, one goal — every section drives toward a single action with no distracting navigation. Ideal for a launch, campaign, or single offer.',
        confidence: 0.8,
        alternative: { name: 'Quote-driven lead generation site', whenToUse: 'If buyers need a conversation and custom pricing before they can decide.' },
      };
    }

    if (pt === 'ecommerce' || (U.fixedPriced(d) && (U.hasFeature(d, 'payment') || U.hasFeature(d, 'commerce') || U.isB2C(d)))) {
      return {
        name: 'E-commerce / catalog site',
        why: 'The business sells fixed-price products, so buyers can browse, decide, and purchase (or enquire) directly from a product catalogue.',
        confidence: 0.88,
        alternative: { name: 'Quote-driven lead generation site', whenToUse: 'If most orders are bulk or custom-configured and need a conversation before pricing.' },
      };
    }
    if (U.isB2B(d) && /procurement|government|enterprise/i.test(d.targetMarket || '')) {
      return {
        name: 'Specification-first procurement site',
        why: 'Procurement and enterprise buyers compare vendors on specs, certifications, and process clarity before ever making contact.',
        confidence: 0.75,
        alternative: { name: 'Quote-driven lead generation site', whenToUse: 'If deals usually start with a conversation rather than a formal tender process.' },
      };
    }
    if (U.isB2B(d) && U.customPriced(d)) {
      return {
        name: 'Quote-driven lead generation site',
        why: 'The business sells custom or project-priced offerings to other businesses — buyers need pricing based on their specific requirements, so every page should funnel toward a quote request.',
        confidence: 0.85,
        alternative: { name: 'Authority & case-study-driven sales site', whenToUse: 'If the sales cycle is long and buyers research extensively before reaching out.' },
      };
    }
    if (U.localService(d) && (U.isB2C(d) || !U.isB2B(d))) {
      return {
        name: 'Booking-focused local service site',
        why: 'Local consumers want to see services, trust signals, and book or call with minimal friction — local SEO plus a booking/contact funnel converts best.',
        confidence: 0.8,
        alternative: { name: 'Content-led authority site', whenToUse: 'If you compete in a crowded local market and need to out-rank rivals with helpful content.' },
      };
    }
    if (U.goal(d, 'authority') || U.goal(d, 'thought')) {
      return {
        name: 'Content-led authority site',
        why: 'Brand authority is a primary goal — consistent content, case studies, and thought-leadership pages compound into search visibility and trust.',
        confidence: 0.7,
        alternative: { name: 'Quote-driven lead generation site', whenToUse: 'If lead volume matters more than long-term brand positioning right now.' },
      };
    }
    return {
      name: 'Authority & case-study-driven sales site',
      why: 'A proof-first structure (work, results, testimonials) is the strongest general-purpose default for converting visitors who are comparing providers.',
      confidence: 0.6,
      alternative: { name: 'Quote-driven lead generation site', whenToUse: 'If you want maximum lead capture and have a sales team ready to follow up.' },
    };
  },

  recommendCTA(d, arch) {
    const map = {
      'Quote-driven lead generation site':       'Request a Quote',
      'Specification-first procurement site':    'Download Specifications / Request a Proposal',
      'Booking-focused local service site':      'Book an Appointment',
      'E-commerce / catalog site':               'Shop Now / Add to Cart',
      'Content-led authority site':              'Subscribe / Book a Consultation',
      'Authority & case-study-driven sales site':'Book a Free Consultation',
      'Dealer/partner acquisition site':         'Become a Partner',
      'Portfolio / showcase site':               d.entityType === 'individual' ? 'Hire Me / Get in Touch' : 'Start a Project',
      'Single-focus landing page':               'Get Started',
    };
    return map[arch.name] || 'Contact Us';
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 1 + 3 — INPUT AUDIT with confidence-weighted levels
// level: 'low' (silently defaulted) | 'medium' (recommended, changeable) | 'high' (ask)
// ══════════════════════════════════════════════════════════════════════════════
const InputAudit = {
  run(d) {
    const U = IntelUtil;
    const issues = [];
    const add = (level, field, step, message, recommendation) =>
      issues.push({ level, field, step, message, recommendation });

    // Vague description
    if ((d.description || '').length < 80) {
      add('medium', 'description', 1,
        'Your business description is short — the AI builder will have to guess what makes you different.',
        'Add 2–3 sentences: what you do, who it is for, and one thing competitors cannot claim.');
    }
    // Missing goals — materially changes conversion strategy
    if (!(d.businessGoals || []).length) {
      add('high', 'businessGoals', 3,
        'No business goal selected. The entire conversion strategy depends on this.',
        'Pick your single most important outcome (e.g. Lead Generation) in Step 3.');
    }
    // Lead gen without a contact path
    if (U.goal(d, 'lead') && !U.hasFeature(d, 'contact') && !U.hasFeature(d, 'booking')) {
      add('medium', 'features', 4,
        'Lead Generation is a goal but no contact form or booking feature is selected.',
        'Recommended: add "Contact Forms" in Step 4 — applied to the prompt automatically for now.');
    }
    // E-commerce without payments
    if ((d.projectType || '').includes('E-Commerce') && !U.hasFeature(d, 'payment')) {
      add('high', 'features', 4,
        'This is an e-commerce project but Payments & Billing is not selected. This decides checkout, security, and cost.',
        'If customers pay online, add "Payments & Billing" in Step 4. If orders are invoiced offline, a catalog + enquiry flow is cheaper.');
    }
    // Multi-country without localisation
    if (/multi-country|worldwide|global/i.test(d.country || '') && !d.multilingual && !U.hasFeature(d, 'multilingual')) {
      add('medium', 'country', 1,
        'You target multiple countries but no localisation strategy is set.',
        'Recommended: launch in English with hreflang-ready URL structure so languages can be added later.');
    }
    // Missing target market — inferable
    if (!d.targetMarket) {
      add('low', 'targetMarket', 1, 'Target market not set.',
        'Inferred from your industry and revenue model.');
    }
    // Missing revenue model — inferable
    if (!d.revenueModel) {
      add('low', 'revenueModel', 1, 'Revenue model not set.',
        'Inferred from your project type.');
    }
    // Premium positioning vs generic/cheap language
    if (U.premium(d) && /cheap|affordable|budget|low cost/i.test(d.description || '')) {
      add('medium', 'brandPositioning', 1,
        'Premium positioning selected, but your description uses budget language ("cheap/affordable").',
        'Pick one: premium brands sell certainty and outcomes, value brands sell price. Mixed signals weaken both.');
    }
    // Healthcare without compliance
    if (/healthcare|medical|dental/i.test(d.industry || '') && !(d.compliance || []).some(c => /hipaa|gdpr|ndpr/i.test(c))) {
      add('medium', 'compliance', 5,
        'Healthcare business with no privacy compliance selected.',
        'Recommended: add the privacy regulation for your region (GDPR/NDPR/HIPAA) in Step 5 — patient data rules apply even to contact forms.');
    }
    // High-ticket B2B without proof features
    if (U.isB2B(d) && !U.hasFeature(d, 'gallery') && !U.hasFeature(d, 'blog') && !U.hasFeature(d, 'portfolio') && !U.hasFeature(d, 'testimonial')) {
      add('medium', 'features', 4,
        'B2B buyers need proof before contacting you, but no portfolio, gallery, or content features are selected.',
        'Recommended: add an Image Gallery or Blog/News so case studies and project proof have a home.');
    }
    return issues;
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 2 — SMART ASSUMPTIONS (transparent, rule-based — no fake statistics)
// ══════════════════════════════════════════════════════════════════════════════
const SmartAssumptions = {
  derive(d, arch) {
    const U = IntelUtil;
    const out = [];
    const add = (assumption, reason, confidence, review) => out.push({ assumption, reason, confidence, review });

    add(`The site uses a ${arch.name.toLowerCase()} structure.`,
        arch.why, arch.confidence >= 0.8 ? 'High' : arch.confidence >= 0.6 ? 'Medium' : 'Low',
        arch.confidence >= 0.8 ? 'No, unless your sales process differs from the reasoning shown.' : 'Yes — confirm this matches how you actually win customers.');

    const cta = RecommendationEngine.recommendCTA(d, arch);
    add(`Primary call-to-action: "${cta}".`,
        'Matched to the recommended architecture and how buyers in this model prefer to start a conversation.',
        'High', 'No, unless you have an established CTA that already converts.');

    if (!d.targetMarket) {
      const inferred = U.isB2B(d) ? 'small & medium businesses' : 'local consumers';
      add(`Target audience assumed to be ${inferred}.`,
          'No target market was provided; inferred from industry and revenue model. (Recommended based on best-practice logic.)',
          'Medium', 'Yes — audience changes tone, imagery, and trust strategy.');
    }
    if (!d.revenueModel) {
      add('Revenue assumed to come from services/projects rather than online transactions.',
          'No revenue model selected; inferred from the project type. (Recommended based on best-practice logic.)',
          'Medium', 'Yes if you sell fixed-price products online.');
    }
    if (/nigeria|ghana|kenya/i.test(d.country || '')) {
      add('Phone and WhatsApp contact options are treated as first-class CTAs alongside forms.',
          'In this region many buyers prefer direct calls/WhatsApp over email forms.',
          'High', 'No.');
    }
    return out;
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 5 — STRATEGIC CONSISTENCY CHECK
// ══════════════════════════════════════════════════════════════════════════════
const ConsistencyCheck = {
  run(d) {
    const U = IntelUtil;
    const warnings = [];
    const add = (misaligned, why, fix) => warnings.push({ misaligned, why, fix });

    if (U.premium(d) && /cheap|affordable|budget/i.test(d.description || '')) {
      add('Premium brand positioning vs budget language in your description.',
          'Buyers price-anchor instantly — premium visuals with discount language reads as fake luxury.',
          'Rewrite the description around outcomes and certainty; remove price-led claims.');
    }
    if (U.isB2B(d) && U.goal(d, 'lead') && !U.hasFeature(d, 'contact') && !U.hasFeature(d, 'booking')) {
      add('Lead-generation goal with a weak contact path.',
          'Every page can be perfect, but without a frictionless contact mechanism leads evaporate.',
          'Add a contact form plus a visible phone number; put the primary CTA in the header.');
    }
    if (U.goal(d, 'authority') && !U.hasFeature(d, 'blog') && !U.hasFeature(d, 'cms')) {
      add('Brand-authority goal with no content mechanism.',
          'Authority compounds through published proof — without a blog/CMS there is nowhere for it to live.',
          'Add Blog/News (and CMS if you want to publish without a developer).');
    }
    if (/multi-country|worldwide|global/i.test(d.country || '') && !d.multilingual) {
      add('International target market with no localisation plan.',
          'Global visitors bounce from sites that ignore their language, currency, or context.',
          'Either narrow the launch market or plan hreflang-ready URLs and locale-aware content now.');
    }
    if (U.premium(d) && !U.hasFeature(d, 'gallery') && !U.hasFeature(d, 'portfolio')) {
      add('High-ticket positioning with no visual proof features.',
          'Premium buyers verify before they believe — claims without evidence lower conversion.',
          'Add a gallery/portfolio and plan for named testimonials and case-study numbers.');
    }
    return warnings;
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 9 — BUILDER-SPECIFIC ADAPTERS (+ Module 7 instruction priorities)
// ══════════════════════════════════════════════════════════════════════════════
const BuilderAdapters = {
  profiles: {
    'Claude Code': {
      risks: ['overbuilding architecture', 'backend complexity nobody asked for', 'broad scope over working product'],
      enforce: [
        'Build in clear phases: working pages first, enhancements second',
        'Strict scope discipline — implement ONLY what this specification requests',
        'Clean file structure with explicit acceptance criteria per page',
        'A working production app beats a theoretical architecture',
      ],
      forbid: ['Unused modules or abstractions "for later"', 'Complex systems not requested in this spec', 'Placeholder-heavy pages without real structure'],
    },
    'Lovable': {
      risks: ['template-looking layouts', 'weak brand differentiation', 'repeated card sections', 'shallow copy'],
      enforce: [
        'Strong visual hierarchy with one clear focal point per section',
        'Every section needs a stated intent — what it must make the visitor feel or do',
        'At least two unique brand moments that no template would produce',
        'Concrete, specific copy — never filler sentences',
      ],
      forbid: ['Generic SaaS-style layouts', 'The same centered section pattern repeated', 'Random icons without strategic meaning', 'Template hero sections'],
    },
    'v0': {
      risks: ['over-abstraction', 'component libraries before pages exist', 'polished UI with weak business logic'],
      enforce: [
        'Concrete pages FIRST — extract reusable components only after a pattern repeats',
        'Each layout decision maps to a stated business purpose',
        'shadcn/ui consistency, full responsive behaviour, accessible by default',
      ],
      forbid: ['An abstract design system with no real pages', 'Unused component variants', 'Dashboard-style UI for a marketing site'],
    },
    'Framer': {
      risks: ['over-animation', 'visual drift between sections', 'pretty but conversion-weak pages'],
      enforce: [
        'Exact spacing system — pick section padding values and never deviate',
        'CTA placement above the fold and repeated after proof sections',
        'Animation restraint: entrances only, subtle, never looping',
        'Conversion-first layout: every scroll depth earns the next CTA',
      ],
      forbid: ['Decorative motion with no purpose', 'Carousel heroes', 'Auto-playing effects', 'Inconsistent section padding'],
    },
    'Webflow': {
      risks: ['class-name sprawl', 'over-nested layouts', 'CMS used for static content'],
      enforce: [
        'Clean, systematic class naming (client-first or BEM-style)',
        'Reusable sections built once, instanced everywhere',
        'CMS collections ONLY for genuinely repeatable content (posts, projects, team)',
        'Proper breakpoints at 991/767/478 with semantic structure',
      ],
      forbid: ['Inline styling', 'Deep div nesting', 'CMS collections for one-off static content', 'Unclear utility class soup'],
    },
    'Bolt': {
      risks: ['MVP-depth output even when production quality is requested', 'skipped validation and error states'],
      enforce: [
        'Production quality explicitly: working forms with validation, complete routing, error states',
        'Environment variable instructions and deployment readiness',
        'Every CTA wired to a real destination',
      ],
      forbid: ['Placeholder forms that do nothing', 'Non-functional CTAs', 'Missing error/empty states', 'Incomplete routing'],
    },
    'Replit': {
      risks: ['quick runnable output over maintainability', 'under-specified architecture', 'skipped production hardening'],
      enforce: [
        'Clear project structure with separated concerns',
        'Environment variables for all secrets, error handling throughout',
        'Security basics: input validation, sanitisation, rate limiting on forms',
        'Deployment instructions included',
      ],
      forbid: ['Single-file messy architecture', 'Hardcoded secrets', 'Missing validation', 'Unstructured backend logic'],
    },
    'Universal': {
      risks: ['generic output without builder-specific guidance'],
      enforce: [
        'Follow the page structure, conversion logic, and design rules exactly as specified',
        'Ask for clarification rather than guessing on ambiguous requirements',
      ],
      forbid: ['Template-default layouts', 'Skipping any REQUIRED instruction'],
    },
  },

  aliases: { 'OpenAI Codex': 'Universal', 'Cursor': 'Claude Code', 'Bolt (StackBlitz)': 'Bolt' },

  adapt(platform, d, arch) {
    const key = this.profiles[platform] ? platform : (this.aliases[platform] || 'Universal');
    const p = this.profiles[key];
    const cta = RecommendationEngine.recommendCTA(d, arch);

    return `
${'═'.repeat(70)}
BUILDER-SPECIFIC DIRECTIVES — ${key.toUpperCase()}
${'═'.repeat(70)}

This builder's known failure modes for projects like this: ${p.risks.join('; ')}.
Counteract them as follows. Instructions are prioritised:

REQUIRED (non-negotiable):
${p.enforce.map(e => `• ${e}`).join('\n')}
• The homepage hero must answer what the business does, who it serves, and
  why buyers should care — within 5 seconds.
  FAIL CONDITION: if the hero could apply to any company after removing the
  logo, rewrite it.
• Primary CTA "${cta}" appears in the header and after every proof section.

FORBIDDEN (do not produce):
${p.forbid.map(f => `✕ ${f}`).join('\n')}

OPTIONAL (include only if this builder supports it cleanly):
• Subtle scroll-reveal animations respecting prefers-reduced-motion
• Dark-mode variant of the design system`;
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 8 — PAGE-LEVEL GUARDRAILS (generated from website type)
// ══════════════════════════════════════════════════════════════════════════════
const PageGuardrails = {
  generate(d, arch) {
    const cta = RecommendationEngine.recommendCTA(d, arch);
    const lines = [
      `${'═'.repeat(70)}`,
      `PAGE-LEVEL GUARDRAILS`,
      `${'═'.repeat(70)}`,
      ``,
      `HOMEPAGE`,
      `REQUIRED: clear hero, primary CTA ("${cta}"), trust proof immediately below the`,
      `hero, services/features, work proof, named testimonials, FAQ, conversion section.`,
      `FORBIDDEN: the generic centered-headline + three-icon-cards + centered-CTA`,
      `pattern repeated down the page.`,
      ``,
      `SERVICES PAGE`,
      `REQUIRED: service-specific copy, benefits, process, proof, FAQs, and a CTA per service.`,
      `FORBIDDEN: one vague services page with shallow one-line descriptions for everything.`,
      ``,
      ...(d.entityType === 'individual'
        ? [
          `ABOUT / BIO PAGE (one person, first-person voice)`,
          `REQUIRED: a personal bio — who I am, my experience, my approach, a real photo,`,
          `and proof (clients/projects/results). Written as one individual, not a company.`,
          `FORBIDDEN: "we/our/team" language, invented staff, or company-history framing.`,
        ]
        : [
          `ABOUT PAGE`,
          `REQUIRED: a specific story, leadership with names and faces, credibility markers,`,
          `values backed by examples, milestones with numbers.`,
          `FORBIDDEN: "we are passionate about excellence" copy without evidence.`,
        ]),
      ``,
      `CONTACT PAGE`,
      `REQUIRED: simple form, visible phone number, business email, expected response`,
      `time, and a real thank-you page.`,
      `FORBIDDEN: hiding all contact options behind a form.`,
    ];
    if (IntelUtil.isB2B(d) || /authority|case-study|procurement/i.test(arch.name)) {
      lines.push(``,
        `WORK / CASE STUDIES PAGE`,
        `REQUIRED: each case study covers problem, solution, process, result — with a`,
        `measurable outcome wherever one exists.`,
        `FORBIDDEN: image cards with no context or business result.`);
    }
    if (/procurement/i.test(arch.name)) {
      lines.push(``,
        `SPECIFICATIONS / RESOURCES`,
        `REQUIRED: downloadable spec sheets, certifications displayed with issuing body,`,
        `a clear procurement process section, and comparison-friendly product data.`,
        `FORBIDDEN: burying technical documents behind a contact form.`);
    }
    return lines.join('\n');
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 10 — PROMPT QUALITY SCORING (a real critique of the generated prompt)
// ══════════════════════════════════════════════════════════════════════════════
const PromptQualityScorer = {
  score(promptText, d, ctx) {
    const U = IntelUtil;
    const t = promptText;
    const crit = [];
    const add = (name, max, got, fix) => crit.push({ name, max, got: Math.max(0, Math.min(max, Math.round(got))), fix });

    // 1. Input clarity (15)
    let ic = 0;
    ic += Math.min(6, (d.description || '').length / 40);
    ic += t.includes('ASSUMPTIONS MADE') ? 5 : 0;
    ic += ['businessName','industry','targetMarket','revenueModel','brandPositioning'].filter(k => d[k]).length * 0.8;
    add('Input Clarity', 15, ic, 'Lengthen the business description and fill the Step 1 dropdowns.');

    // 2. Strategic alignment (20)
    add('Strategic Alignment', 20, 20 - (ctx.warnings.length * 4),
        'Resolve the strategic warnings shown above — each one is misalignment the builder will faithfully reproduce.');

    // 3. Conversion architecture (20)
    let ca = 0;
    ca += t.includes('RECOMMENDED ARCHITECTURE') ? 7 : 0;
    ca += /primary cta|call-to-action|cta/i.test(t) ? 6 : 0;
    ca += (d.businessGoals || []).length ? 7 : 0;
    add('Conversion Architecture', 20, ca, 'Select a business goal in Step 3 so the conversion path has a target.');

    // 4. Builder interpretability (15)
    let bi = 0;
    bi += t.includes('BUILDER-SPECIFIC DIRECTIVES') ? 8 : 0;
    const words = t.split(/\s+/).length;
    bi += words > 1200 && words < 12000 ? 5 : 2;
    bi += (d.targetPlatform && d.targetPlatform !== 'Universal') ? 2 : 0;
    add('Builder Interpretability', 15, bi, 'Select a specific target platform so directives match its weaknesses.');

    // 5. Anti-pattern prevention (10)
    add('Anti-Pattern Prevention', 10,
        (t.includes('ANTI-PATTERNS') ? 5 : 0) + (t.includes('FORBIDDEN') ? 5 : 0),
        'Enable Guided or Expert mode so forbidden-pattern guardrails are appended.');

    // 6. Technical & UX rigour (10)
    add('Technical & UX Rigour', 10,
        ['ACCESSIBILITY','PERFORMANCE','SEO'].filter(s => t.includes(s)).length * 3.3,
        'Keep the standard (non-compact) prompt for builds where ops depth matters.');

    // 7. Outcome accountability (10)
    add('Outcome Accountability', 10,
        (/(kpi|measur|conversion rate|lighthouse)/i.test(t) ? 6 : 0) + ((d.businessGoals || []).length ? 4 : 0),
        'Add goals with measurable outcomes in Step 3.');

    const total = crit.reduce((s, c) => s + c.got, 0);
    const status = total >= 85 ? 'READY' : total >= 70 ? 'NEEDS IMPROVEMENT' : 'NOT READY';
    const improvements = crit
      .map(c => ({ ...c, lost: c.max - c.got }))
      .filter(c => c.lost > 0)
      .sort((a, b) => b.lost - a.lost)
      .slice(0, 3)
      .map(c => `${c.name} (−${c.lost}): ${c.fix}`);

    return { total, status, criteria: crit, improvements };
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 11 — FINAL VALIDATION CHECKLIST
// ══════════════════════════════════════════════════════════════════════════════
const ValidationChecklist = {
  run(t, d, ctx) {
    const U = IntelUtil;
    const items = [
      { label: 'Business objective is clear',        ok: !!(d.businessGoals || []).length },
      { label: 'Target audience is defined',         ok: !!d.targetMarket || ctx.assumptions.some(a => /audience/i.test(a.assumption)) },
      { label: 'Primary CTA is defined',             ok: /primary cta|call-to-action/i.test(t) },
      { label: 'Buyer journey is represented',       ok: /persona|journey/i.test(t) },
      { label: 'Trust signals are included',         ok: /testimonial|trust|case stud/i.test(t) },
      { label: 'Page structure is complete',         ok: /HOMEPAGE/.test(t) && /CONTACT/.test(t) },
      { label: 'Design direction is specific',       ok: t.includes('ART DIRECTION') || t.includes('DESIGN SYSTEM') },
      { label: 'SEO requirements included',          ok: /SEO/.test(t) },
      { label: 'Accessibility requirements included',ok: /ACCESSIBILITY|WCAG/i.test(t) },
      { label: 'Performance requirements included',  ok: /PERFORMANCE|Lighthouse/i.test(t) },
      { label: 'Forms & conversion flows defined',   ok: /form/i.test(t) },
      { label: 'Assumptions are visible',            ok: t.includes('ASSUMPTIONS MADE') || !ctx.assumptions.length },
      { label: 'Builder-specific risks addressed',   ok: t.includes('BUILDER-SPECIFIC DIRECTIVES') },
      { label: 'Anti-patterns forbidden',            ok: /FORBIDDEN|ANTI-PATTERNS/.test(t) },
    ];
    return { items, risks: items.filter(i => !i.ok).map(i => i.label) };
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 12 — LEARNING CAPTURE (privacy-safe, local only — interface + hooks)
// ══════════════════════════════════════════════════════════════════════════════
const LearningCapture = {
  KEY: 'epa_learning_v1',
  insights: null,                       // populated by loadInsights() from the local backend
  record(entry) {
    try {
      const log = JSON.parse(localStorage.getItem(this.KEY) || '[]');
      log.push({ ts: Date.now(), ...entry });
      localStorage.setItem(this.KEY, JSON.stringify(log.slice(-200)));
    } catch (e) { /* storage unavailable — learning is best-effort */ }
    // Persist to the backend if one is reachable (silently ignored otherwise)
    try {
      if (typeof fetch === 'function') {
        const url = (typeof EPA_apiUrl === 'function') ? EPA_apiUrl('/api/learn') : '/api/learn';
        fetch(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        }).catch(() => {});
      }
    } catch (e) {}
  },
  recordOverride(field, from, to) { this.record({ event: 'override', field, from, to }); },
  export() { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; } },
  // Pull aggregated stats so recommendations can cite REAL data when it exists
  loadInsights() {
    try {
      if (typeof fetch !== 'function') return;
      const url = (typeof EPA_apiUrl === 'function') ? EPA_apiUrl('/api/insights') : '/api/insights';
      fetch(url)
        .then(r => (r.ok ? r.json() : null))
        .then(j => { if (j && j.ok) LearningCapture.insights = j; })
        .catch(() => {});
    } catch (e) {}
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR — Module 14 output structure, mode-gated (basic/guided/expert)
// ══════════════════════════════════════════════════════════════════════════════
const Intelligence = {
  run(d, outputs, opts = {}) {
    const mode = opts.mode || 'guided';   // 'basic' | 'guided' | 'expert'

    const audit       = InputAudit.run(d);
    const arch        = RecommendationEngine.recommendArchitecture(d);
    const assumptions = SmartAssumptions.derive(d, arch);
    const warnings    = ConsistencyCheck.run(d);
    const cta         = RecommendationEngine.recommendCTA(d, arch);

    // Real-data note from the learning loop (only when genuine usage data exists)
    const ins = LearningCapture.insights;
    if (ins && ins.byIndustry && d.industry && ins.byIndustry[d.industry]) {
      const counts = ins.byIndustry[d.industry];
      const total  = Object.values(counts).reduce((s, n) => s + n, 0);
      const top    = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (top && total >= 3) {
        assumptions.push({
          assumption: `Across ${total} past ${d.industry} project(s) built with this tool, the most-chosen architecture was "${top[0]}".`,
          reason: 'Real usage data captured by this tool — not a fabricated statistic.',
          confidence: 'Medium', review: 'No — informational only.',
        });
      }
    }

    // ── Assemble the adapted build prompt (base engine output preserved) ──
    let build = outputs.build;

    if (mode !== 'basic') {
      const summary = [
        `${'═'.repeat(70)}`,
        `STRATEGY SUMMARY`,
        `${'═'.repeat(70)}`,
        `${d.entityType === 'individual' ? 'Individual    ' : 'Business type '}: ${d.businessName || 'Client'} — ${d.industry || 'General'}`,
        `Audience      : ${d.targetMarket || assumptions.find(a => /audience/i.test(a.assumption))?.assumption || 'See personas below'}`,
        `Primary goal  : ${(d.businessGoals || [])[0] || 'Lead generation'}`,
        ``,
        `RECOMMENDED ARCHITECTURE: ${arch.name}`,
        `WHY: ${arch.why}`,
      ];
      if (mode === 'expert' && arch.alternative) {
        summary.push(``, `ALTERNATIVE OPTION: ${arch.alternative.name}`,
                         `WHEN TO USE IT: ${arch.alternative.whenToUse}`);
      }
      summary.push(``, `PRIMARY CTA: "${cta}" — use consistently across the site.`);

      if (assumptions.length) {
        summary.push(``, `ASSUMPTIONS MADE — REVIEW RECOMMENDED`);
        assumptions.forEach(a => {
          summary.push(`• ${a.assumption}`,
                       `  Reason: ${a.reason}`,
                       `  Confidence: ${a.confidence} · Review required: ${a.review}`);
        });
      }

      build = summary.join('\n') + '\n\n' + build
            + '\n\n' + PageGuardrails.generate(d, arch)
            + '\n'   + BuilderAdapters.adapt(d.targetPlatform || 'Universal', d, arch);
    }

    const adapted = { ...outputs, build };
    const quality = PromptQualityScorer.score(build, d, { warnings, assumptions });
    const checklist = ValidationChecklist.run(build, d, { assumptions });

    LearningCapture.record({
      event: 'generate', mode,
      industry: d.industry, revenueModel: d.revenueModel, targetMarket: d.targetMarket,
      goal: (d.businessGoals || [])[0], architecture: arch.name, archConfidence: arch.confidence,
      builder: d.targetPlatform, promptScore: quality.total,
    });

    return { mode, outputs: adapted, audit, assumptions, warnings, architecture: arch, cta, quality, checklist };
  },
};
