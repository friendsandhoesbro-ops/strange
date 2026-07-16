// ══════════════════════════════════════════════════════════════════════════════
// ENTERPRISE PROMPT ENGINE
// ══════════════════════════════════════════════════════════════════════════════
class PromptEngine {
  constructor(data, opts = {}) {
    this.d = data;
    this.compact = !!opts.compact;   // compact mode: same outcome, ~40% fewer tokens
    this.offerOptions = opts.offerOptions !== false;  // build protocol: design-choice step (default ON)
    this.budgetMode   = opts.budgetMode   !== false;  // build protocol: free/limited-plan phasing (default ON)
    this.entityType   = data.entityType === 'individual' ? 'individual' : 'business';  // voice & framing
    this.rec = TECH_RECOMMENDATIONS[data.projectType] || TECH_RECOMMENDATIONS['default'];
    this.stack = data.useRecommended ? this.rec.stack     : (data.framework    || this.rec.stack);
    this.db    = data.useRecommended ? this.rec.db        : (data.database     || this.rec.db);
    this.auth  = data.useRecommended ? this.rec.auth      : (data.authentication || this.rec.auth);
    this.host  = data.useRecommended ? this.rec.hosting   : (data.hosting      || this.rec.hosting);
    this.cms   = data.useRecommended ? this.rec.cms       : (data.cms          || this.rec.cms);
    this.store = data.useRecommended ? this.rec.storage   : (data.storage      || this.rec.storage);
    this.ana   = data.analytics || 'Google Analytics 4 + Google Search Console';
    this.platform = data.targetPlatform || 'Universal';
    // Pull a distinct visual style from the library (auto-varies, or honours a named pick).
    this.style = (typeof StyleLibrary !== 'undefined') ? StyleLibrary.resolve(data) : null;
    // CMS / admin is asked per project; default to included for beginner-friendliness.
    this.includeCMS = data.includeCMS !== false;
  }

  // ── PUBLIC: generate all three outputs ────────────────────────────────────
  generateAll() {
    return {
      build: this._buildPrompt(),
      cto:   this._ctoAuditPrompt(),
      sales: this._clientSalesBrief(),
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BUILD PROMPT
  // ══════════════════════════════════════════════════════════════════════════
  // ENTITY & VOICE — keep a personal site personal (no "we"/team/agency framing).
  // ══════════════════════════════════════════════════════════════════════════
  _entityContext() {
    const name = this.d.businessName || (this.entityType === 'individual' ? 'this person' : 'this business');
    const tag  = this.d.industry ? ` (${this.d.industry})` : '';

    if (this.entityType === 'individual') {
      return `THIS IS A PERSONAL SITE FOR ONE INDIVIDUAL — ${name}${tag}.

Write the entire site as ONE person, never a company. This is non-negotiable:
• VOICE: all copy in FIRST-PERSON SINGULAR — "I", "my work", "me". NEVER use "we",
  "our", "us", or "the team".
• Do NOT describe ${name} as a company, agency, studio, brand, or organisation.
• Do NOT invent a team, staff, co-founders, "our values", "our culture", or company history.
• Do NOT add Team, Careers, "Meet the Team", or "Our Story (as a company)" pages or sections.
• The About section is a PERSONAL BIO: who I am, my experience, my approach, my story,
  shown with a real photo of the individual.
• Proof = my own clients, projects, testimonials, and results — framed as this person's work.
• Calls-to-action are personal: "Hire me", "Work with me", "Get in touch".
FAIL CONDITION: if any hero or section copy uses "we/our" or implies a company or agency,
rewrite it in this individual's first-person voice before continuing.`;
    }

    return `THIS IS A SITE FOR A BUSINESS / ORGANISATION — ${name}${tag}.
• VOICE: write in the brand's voice; "we / our / us" is appropriate for a company.
• Team, company-story, "about us", values, and organisational trust signals are
  appropriate where they add credibility.`;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BUILD PROTOCOL — design-option choice + free/limited-plan phasing.
  // Builder-agnostic; works in whatever AI builder the prompt is pasted into.
  // ══════════════════════════════════════════════════════════════════════════
  _buildProtocol() {
    const blocks = [];

    if (this.offerOptions) blocks.push(
`OFFER ME DESIGN OPTIONS BEFORE YOU BUILD
Start by presenting 2-3 DISTINCT hero-section design directions for this website — each with a
different layout, typography style, colour treatment, and mood. Show them as visual previews
or screenshots and ask me to choose the one I like most. Then build the ENTIRE site in that
chosen direction, keeping that style consistent across every section.
• If you cannot render image previews, describe the 2-3 options clearly in words (layout,
  fonts, colours, vibe) and ask me to pick before continuing.
• Do not build the full site until I have chosen a direction.`);

    if (this.budgetMode) blocks.push(
`BUILD IN PHASES (so it finishes even on a FREE / LIMITED plan)
If you have a limited build budget (free tier, limited credits or tokens), an over-complex
site can run out of capacity halfway and leave a broken, half-styled result. Prevent that:
• PHASE 1 — DO THIS FIRST, COMPLETELY: a fully-styled, working ONE-PAGE version of the site
  (hero, core services/features, proof/testimonials, and a working contact section). This must
  look 100% finished on its own, even if you build nothing else after it.
• PHASE 2 — only if budget remains: extra pages, secondary sections, and nice-to-haves.
• PHASE 3 — only if explicitly needed: advanced features (accounts, dashboards, integrations).
• Stay lean: no unused components, no over-engineering, no features I did not ask for.
• A finished simple site always beats an unfinished ambitious one. If you must choose, choose
  "complete and fully styled" over "more features". Never leave the site half-built or unstyled.
If I am on a paid plan with plenty of capacity, you may build all phases in one pass — but the
order above (complete core first) still applies so nothing is ever left broken.`);

    if (!blocks.length) return '';
    return blocks.map((b, i) => blocks.length > 1 ? `STEP ${i + 1} — ${b}` : b).join('\n\n');
  }

  // Build-safety contract: stops the #1 generated-site failure — "Module not found"
  // from importing a package the builder never installed. Always emitted.
  _buildSafety() {
    return (
`DEPENDENCIES & BUILD INTEGRITY — PREVENT "MODULE NOT FOUND"
This spec names third-party packages (animation, icons, UI). A build breaks the moment you
import a package that isn't installed. So:
• Install EVERY package you import (add it to package.json + run the install) BEFORE you
  import it. Never leave an unresolved import — that is the most common reason these builds
  fail to compile.
• ANIMATION LIBRARY — read carefully: "Framer Motion", the npm package "motion"
  (import { motion } from 'motion/react'), and "framer-motion"
  (import { motion } from 'framer-motion') are the SAME library under different names.
  Pick ONE, install exactly that one, and import from exactly that path. Do not mix both,
  and do not import one while installing the other.
• Icons are lucide-react; install it before importing any icon.
• If a package can't be installed, isn't available on this builder, or would risk leaving
  the build half-broken, DO NOT ship a broken import — replace it with a zero-dependency
  equivalent that gives the same result: CSS keyframes/transitions instead of a motion lib,
  IntersectionObserver for scroll reveals, inline SVG instead of an icon/shape package,
  native <video>/CSS instead of a WebGL/shader package. The design must never depend on a
  package that isn't actually present.
• After each phase, confirm the project COMPILES with zero unresolved imports and no console
  errors before continuing. A site that doesn't compile is worth nothing, however good the design.`);
  }

  // Completeness contract — graded as a finished product, not a scaffold.
  // (Distilled from the "full output enforcement" discipline: no placeholders, no stubs.)
  _completenessContract() {
    const name = this.d.businessName || 'the brand';
    return (
`This build is graded as a FINISHED PRODUCT, not a scaffold or a demo. The following are
forbidden in what you deliver — each one is an instant fail:
✕ Lorem ipsum, "Sample text", "Your headline here", or any placeholder copy. Write real,
  specific content drawn from ${name}'s actual world (services, prices, voice, locale).
✕ Placeholder links (href="#"), dead buttons, no-op handlers, or forms that don't validate
  and submit. Every interactive element must actually DO its job.
✕ Stub comments standing in for real work: "// TODO", "// implement later",
  "/* rest of code */", "// ...", "// add more here". Write the actual implementation.
✕ Broken or empty-grey images. Every <img> has a real or AI-generated source, explicit
  width/height, and descriptive alt text — never a missing asset.
✕ "Coming soon" placards in place of content this spec actually asked for.
• If the work is long, KEEP GOING until each file is complete. Do not truncate, summarise,
  or hand back a partial file with "continue from here" — finish the file, then move on.
• Wire real (or realistic seed) data through lists, cards, tables and detail pages so the
  site looks alive, not like an empty template.
• Every navigation link resolves to a real section or page; menus open and close; the cart /
  form / search actually works. A page that looks done but does nothing is not done.`);
  }

  // Analytics & event-tracking plan — instrument the funnel so the owner can see what
  // converts. (Distilled from product-analytics tracking-plan practice.) Events are derived
  // from the project type + the chosen business goals so the plan fits THIS business.
  _analyticsPlan() {
    const type = this.d.projectType;
    const goals = this.d.goals || this.d.businessGoals || [];
    const ana = this.ana || 'GA4 + a product-analytics tool (e.g. PostHog)';

    const events = ['page_view', 'cta_click', 'nav_click', 'scroll_depth_75', 'outbound_click'];
    const byType = {
      ecommerce:        ['view_item', 'add_to_cart', 'begin_checkout', 'add_payment_info', 'purchase'],
      'company-website':['lead_form_open', 'lead_form_submit', 'call_click', 'email_click'],
      portfolio:        ['project_view', 'contact_open', 'contact_submit', 'resume_download'],
      'landing-page':   ['hero_cta_click', 'signup_start', 'signup_complete'],
    };
    (byType[type] || ['lead_form_open', 'lead_form_submit', 'call_click']).forEach(e => events.push(e));
    const goalText = goals.join(' ').toLowerCase();
    if (/booking|appointment|schedul/.test(goalText)) events.push('booking_started', 'booking_confirmed');
    if (/subscription|retention|recurring/.test(goalText)) events.push('plan_selected', 'subscribe_complete');
    if (/newsletter|email|lead/.test(goalText)) events.push('newsletter_signup');
    const unique = events.filter((e, i) => events.indexOf(e) === i);

    return (
`Don't just "install analytics" and track pageviews — instrument the conversion funnel so
${this.d.businessName || 'the owner'} can see what actually drives revenue.

PROVIDER: ${ana}. Load it deferred/async; never block first paint.

EVENTS TO INSTRUMENT (object_action, snake_case, fired client-side at the moment of action):
${unique.map(e => '• ' + e).join('\n')}

EACH EVENT CARRIES PROPERTIES: page path + title, section/component, CTA label, device type,
referrer/source; and where relevant value + currency, item_id/name, plan, form_name.

IDENTITY & FUNNEL:
• Assign an anonymous visitor id on first load; on signup/login attach a stable user id so a
  visitor's sessions stitch into one journey.
• Track the WHOLE funnel — view → intent (cta_click) → start (form_open / begin_checkout) →
  complete (submit / purchase). The DROP-OFF between steps is the insight, so never skip a step.
• Mark the primary conversion (the main CTA's completion) as the headline KPI in the dashboard.

CONSENT & QUALITY:
• Fire analytics/marketing events ONLY after cookie consent is granted (see Compliance);
  strictly-necessary measurement may run without consent where local law allows.
• Before launch, verify in staging that every event fires exactly once with the correct
  properties — no duplicates, no missing conversion events on the thank-you/confirmation step.`);
  }

  // Design reference — when the user uploads a screenshot via "Design Match", the
  // client extracts its palette + theme + mood (client-side, no AI). We bake that into
  // the prompt as an authoritative look to match, overriding the auto library style.
  _designReference() {
    const r = this.d.designRef;
    if (!r || !r.palette || !r.palette.length) return '';
    const pal = r.palette.map(h => '   - ' + h).join('\n');
    return (
`DESIGN REFERENCE — MATCH THE USER'S UPLOADED SCREENSHOT
The user uploaded a screenshot of the exact look they want. Reproduce its visual language
faithfully — where it conflicts with the auto-selected style above, this REFERENCE WINS.
• Theme         : ${r.mode} — keep it ${r.mode}; a ${r.mode} reference must not become its opposite.
• Mood          : ${r.mood} — match the reference's saturation and energy.
• Background     : ${r.bg}
• Primary accent : ${r.accent}
• Extracted palette (authoritative — derive a full 50–900 scale from these, don't invent new hues):
${pal}
Match the reference's contrast, density, and overall feel. Every craft rule in this DESIGN
SYSTEM (typography, spacing, motion, accessibility, anti-slop) still applies on top of this palette.`);
  }

  // Brand assets + real content + the ANTI-INVENTION guardrail. Always emits the guardrail
  // (the core "stop generating random content" fix); enriches with whatever the user gave in
  // the "Your brand & content" intake (assets they have, brand colours, real services, socials).
  _brandAndContent() {
    const d = this.d;
    const has = (id) => Array.isArray(d.assets) && d.assets.indexOf(id) !== -1;
    let out =
`This is the trust rule — do NOT fabricate facts to fill space:
✕ Never invent statistics, metrics, counts ("10,000+ users"), revenue, or years in business.
✕ Never invent testimonials, client names, client logos, awards, certifications, or press.
✕ Never invent team members, founders, or their bios.
✕ Never invent products, services, or prices beyond what is stated in this spec.
• Use ONLY the real information provided here. For anything NOT provided, insert a CLEARLY-
  LABELLED placeholder the owner fills later — e.g. [ADD A REAL TESTIMONIAL], [ADD YOUR STAT],
  [ADD CLIENT LOGO] — never a realistic-looking fake. Placeholders must read as intentional,
  editable, and obviously not final content.\n\n`;

    const haveLines = [];
    if (has('logo')) haveLines.push('• Logo — add a labelled, swappable <img> slot (e.g. /logo.svg) wired to the Content Manager; show the brand name as a styled text fallback until it is uploaded. Do NOT design a fake logo.');
    if (has('product-photos')) haveLines.push('• Product / service photos — build real image slots / a gallery wired to the Content Manager; the owner uploads their own. Use AI images ONLY as temporary, clearly-replaceable fillers.');
    if (has('team-photos')) haveLines.push('• Team photos — real photo slots in the team/about section wired to the Content Manager; never invent stock faces.');
    if (has('video')) haveLines.push('• Video — a muted, looping <video> slot with a poster-image fallback and lazy-load, wired to the Content Manager.');
    if (has('existing-copy')) haveLines.push('• Existing copy — the owner has real text; leave clearly editable text regions and do NOT write lorem ipsum or invented marketing copy in their place.');
    if (haveLines.length) out += `ASSETS THE OWNER HAS — create real, swappable, CMS-wired slots (never a generated stand-in):\n${haveLines.join('\n')}\n\n`;

    const missing = [];
    if (!has('logo')) missing.push('logo (a clean, simple wordmark/mark as a starting point — clearly replaceable)');
    if (!has('product-photos')) missing.push('product / hero imagery');
    if (!has('team-photos')) missing.push('team / people imagery');
    if (!has('video')) missing.push('hero / background video (only if the style calls for it)');
    if (missing.length) out += `NOT PROVIDED — use art-directed AI placeholders per the imagery direction, each clearly replaceable in the Content Manager: ${missing.join(', ')}.\n\n`;

    if (Array.isArray(d.brandColors) && d.brandColors.length) {
      out += `BRAND COLOURS (authoritative — the owner's real brand colours; build the palette from these and derive the 50–900 scale, do not substitute):\n${d.brandColors.map(c => '   - ' + c).join('\n')}\n\n`;
    }
    if (Array.isArray(d.realServices) && d.realServices.length) {
      out += `REAL SERVICES / PRODUCTS (use these EXACT items — the real catalogue; invent no others):\n${d.realServices.map(s => '   - ' + s).join('\n')}\n\n`;
    }
    const socials = Array.isArray(d.socialLinks) ? d.socialLinks.join(', ') : (d.socialLinks || '');
    if (socials) out += `SOCIAL LINKS (wire these EXACT links; invent no others): ${socials}\n`;
    if (d.realContact) out += `CONTACT (use exactly as given — never invent an address, phone, or email): ${d.realContact}\n`;
    if (socials || d.realContact) out += '\n';

    out += `HOW THE OWNER ADDS THEIR FILES (make this effortless):
• In the AI builder: drop the logo/images into the labelled slots, or paste image URLs.
• Or after launch: upload everything in the Content Manager (/admin) — logo, images, video.
• EVERY media slot and editable text region must be wired to the Content Manager so a
  non-technical owner can swap it with zero code.`;
    return out;
  }

  // ══════════════════════════════════════════════════════════════════════════
  _buildPrompt() {
    const d = this.d;
    const prefix = PLATFORM_PREFIXES[this.platform] || '';
    const lines = [];
    const h1 = (t) => lines.push(`\n${'═'.repeat(70)}\n${t.toUpperCase()}\n${'═'.repeat(70)}\n`);
    const h2 = (t) => lines.push(`\n── ${t} ${'─'.repeat(Math.max(2, 65 - t.length))}\n`);
    const h3 = (t) => lines.push(`\n### ${t}\n`);

    lines.push(prefix);
    lines.push(`ENTERPRISE BUILD SPECIFICATION`);
    lines.push(`${'═'.repeat(70)}`);
    lines.push(`Project : ${this._projectLabel()}`);
    lines.push(`Client  : ${d.businessName || 'Client'}`);
    lines.push(`Industry: ${d.industry || 'Not specified'}`);
    lines.push(`Platform: ${this.platform === 'Universal' ? 'Any AI builder (Bolt · Lovable · v0 · Cursor · Claude Code · ChatGPT · Replit · Framer · Webflow …)' : this.platform}`);
    lines.push(`Stack   : ${this.stack}`);
    lines.push(`Generated: ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}`);
    lines.push(`${'═'.repeat(70)}`);

    // ── ENTITY & VOICE (individual vs business — prevents "we"/agency framing) ─
    h1('WHO THIS SITE IS FOR — VOICE & FRAMING');
    lines.push(this._entityContext());

    // ── BUILD PROTOCOL (offer design options + budget-aware phasing) ───────
    const protocol = this._buildProtocol();
    if (protocol) {
      h1('HOW TO BUILD THIS — READ FIRST');
      lines.push(protocol);
    }

    // ── BUILD SAFETY (always on — prevents missing-dependency compile errors) ─
    h1('BUILD SAFETY — DEPENDENCIES & COMPILE INTEGRITY');
    lines.push(this._buildSafety());

    // ── COMPLETENESS CONTRACT (always on — bans placeholders / half-built work) ─
    h1('REAL CONTENT & COMPLETENESS — SHIP NOTHING HALF-DONE');
    lines.push(this._completenessContract());

    // ── EXECUTIVE MANDATE ─────────────────────────────────────────────────
    h1('EXECUTIVE MANDATE');
    lines.push(`You are not building a website. You are building a revenue-generating,`);
    lines.push(`authority-establishing, conversion-optimised digital platform for:`);
    lines.push(`\n  ${d.businessName || '[Business Name]'} — ${d.industry || '[Industry]'}`);
    lines.push(`  Operating in: ${d.country || 'Global'}`);
    lines.push(`  Target Market: ${d.targetMarket || 'Not specified'}`);
    if (d.description) lines.push(`\n${d.description}`);
    lines.push(`\nThis specification must be executed with the rigour of a CTO, the design`);
    lines.push(`instinct of a Principal Product Designer, and the commercial focus of a`);
    lines.push(`Chief Revenue Officer. Every decision must serve the business objectives.`);

    // ── BUSINESS STRATEGY ─────────────────────────────────────────────────
    h1('BUSINESS STRATEGY & OBJECTIVES');
    if (d.revenueModel) {
      h2('Revenue Model');
      lines.push(this._revenueModelDesc());
    }
    if (d.businessGoals?.length) {
      h2('Strategic Objectives');
      d.businessGoals.forEach((g, i) => {
        lines.push(`${i+1}. ${g}`);
        lines.push(`   KPI: ${this._goalKPI(g)}`);
      });
    }
    h2('Conversion Architecture');
    lines.push(this._conversionStrategy());

    if (d.competitors) {
      h2('Competitive Positioning');
      lines.push(`Key competitors: ${d.competitors}`);
      lines.push(`Brand positioning: ${d.brandPositioning || 'Premium, enterprise-grade'}`);
      lines.push(`Differentiation strategy: Out-execute on quality, trust signals, UX, and`);
      lines.push(`speed-to-value. Every page must justify why this business outperforms competitors.`);
    }

    // ── USER PERSONAS ─────────────────────────────────────────────────────
    h1('TARGET USER PERSONAS');
    lines.push(this._generatePersonas());

    // ── INFORMATION ARCHITECTURE ──────────────────────────────────────────
    h1('INFORMATION ARCHITECTURE');
    h2('Site / App Structure');
    lines.push(this._generateSiteMap());
    h2('Navigation Architecture');
    lines.push(this._navArchitecture());

    // ── DESIGN SYSTEM ─────────────────────────────────────────────────────
    h1('DESIGN SYSTEM SPECIFICATION');
    const styleBlock = this._styleDirective();
    if (styleBlock) lines.push(styleBlock);
    const designRef = this._designReference();
    if (designRef) lines.push(designRef);
    lines.push(this._designSystem());

    // ── IMAGERY & MEDIA ───────────────────────────────────────────────────
    h1('IMAGERY & MEDIA DIRECTION');
    lines.push(this._imageryDirection());

    // ── BRAND ASSETS + REAL CONTENT (anti-invention guardrail; always on) ──
    h1('BRAND ASSETS, REAL CONTENT & NO INVENTION');
    lines.push(this._brandAndContent());

    // ── CONTENT MANAGEMENT (CMS / ADMIN) ──────────────────────────────────
    if (this.includeCMS) {
      h1('CONTENT MANAGEMENT — OWNER CAN EDIT EVERYTHING');
      lines.push(this._cmsSection());
    }

    // ── PAGE SPECIFICATIONS ───────────────────────────────────────────────
    h1('PAGE & SCREEN SPECIFICATIONS');
    lines.push(this._pageSpecs());

    // ── SEO ARCHITECTURE ──────────────────────────────────────────────────
    h1('SEO ARCHITECTURE');
    lines.push(this._seoStrategy());

    // ── ANALYTICS & EVENT TRACKING (instrument the funnel, not just pageviews) ─
    h1('ANALYTICS & EVENT TRACKING');
    lines.push(this._analyticsPlan());

    // ── TECHNICAL STACK ───────────────────────────────────────────────────
    h1('TECHNICAL STACK');
    lines.push(this._techStack());

    // ── DATABASE ARCHITECTURE ─────────────────────────────────────────────
    // In compact mode, only included when the site actually stores data
    const needsDb = this.d.features?.some(f => ['User Accounts & Auth','Customer Portal','Admin Dashboard','Payments & Billing','CMS (Content Management)','Booking & Scheduling','E-Commerce Store'].includes(f));
    if (!this.compact || needsDb) {
      h1('DATABASE ARCHITECTURE');
      lines.push(this._databaseStrategy());
    }

    // ── AUTHENTICATION & AUTHORIZATION ────────────────────────────────────
    if (this.d.features?.some(f => ['User Accounts & Auth','Customer Portal','Admin Dashboard','Role-Based Access Control','Social Login (OAuth)','Two-Factor Auth'].includes(f))) {
      h1('AUTHENTICATION & AUTHORIZATION');
      lines.push(this._authStrategy());
    }

    // ── SECURITY REQUIREMENTS ─────────────────────────────────────────────
    h1('SECURITY REQUIREMENTS');
    if (this.compact) {
      lines.push(`• HTTPS everywhere; security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options`);
      lines.push(`• All user input validated and sanitised (client + server); output encoded against XSS`);
      lines.push(`• Forms: CSRF protection, rate limiting, honeypot field against spam bots`);
      lines.push(`• No secrets in client code or repos; environment variables for all keys`);
      lines.push(`• Dependencies pinned and free of known CVEs`);
    } else {
      lines.push(this._securityStrategy());
    }

    // ── ADMIN ARCHITECTURE ────────────────────────────────────────────────
    if (this.d.features?.includes('Admin Dashboard') || this.d.features?.includes('Role-Based Access Control') || this.d.features?.includes('Audit Logs')) {
      h1('ADMIN ARCHITECTURE');
      lines.push(this._adminStrategy());
    }

    // ── COMPLIANCE ────────────────────────────────────────────────────────
    if (this.d.compliance?.length && !this.d.compliance.includes('none')) {
      h1('COMPLIANCE REQUIREMENTS');
      lines.push(this._complianceStrategy());
    }

    // ── ACCESSIBILITY ─────────────────────────────────────────────────────
    h1('ACCESSIBILITY REQUIREMENTS (WCAG 2.1 AA)');
    lines.push(this._accessibilityRequirements());

    // ── PERFORMANCE ───────────────────────────────────────────────────────
    h1('PERFORMANCE REQUIREMENTS');
    lines.push(this._performanceRequirements());

    // ── Sections below add operational depth but don't change what gets built.
    //    Compact mode drops them to save tokens with the same build outcome.
    if (!this.compact) {
      h1('MONITORING, RELIABILITY & OBSERVABILITY');
      lines.push(this._reliabilityStrategy());

      h1('DEPLOYMENT & DEVOPS');
      lines.push(this._deploymentStrategy());

      h1('FUTURE EXPANSION PLANNING');
      lines.push(this._futureExpansion());

      h1('BUILD SEQUENCE');
      lines.push(this._buildSequence());
    }

    // ── QUALITY GATES ─────────────────────────────────────────────────────
    h1('QUALITY GATES — DO NOT SHIP WITHOUT THESE');
    lines.push(`□ Lighthouse scores: Performance ≥90, Accessibility ≥95, SEO ≥95, Best Practices ≥95`);
    lines.push(`□ All forms validated server-side and client-side with clear error states`);
    lines.push(`□ Mobile-responsive: tested at 375px, 768px, 1024px, 1440px`);
    lines.push(`□ All images: WebP format, lazy-loaded, correct alt text`);
    lines.push(`□ Security headers present: CSP, HSTS, X-Frame-Options, X-Content-Type-Options`);
    lines.push(`□ No console errors in production`);
    lines.push(`□ Analytics tracking verified: pageviews, conversion events firing`);
    lines.push(`□ All CTAs tested end-to-end`);
    lines.push(`□ 404 and error pages implemented and styled`);
    lines.push(`□ Sitemap.xml and robots.txt generated`);
    lines.push(`□ SSL/TLS configured, HTTP → HTTPS redirect active`);
    if (this.d.compliance?.includes('gdpr')) lines.push(`□ Cookie consent banner functional, granular opt-in/out working`);
    if (this.d.compliance?.includes('hipaa')) lines.push(`□ HIPAA BAA signed with all third-party vendors`);
    if (this.d.features?.includes('Payments & Billing')) lines.push(`□ Payment flow tested with test card numbers in staging`);

    if (d.additionalContext) {
      h1('ADDITIONAL CONTEXT');
      lines.push(d.additionalContext);
    }

    lines.push(`\n${'═'.repeat(70)}`);
    lines.push(`END OF BUILD SPECIFICATION`);
    lines.push(`${'═'.repeat(70)}\n`);

    return lines.join('\n');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CTO AUDIT PROMPT
  // ══════════════════════════════════════════════════════════════════════════
  _ctoAuditPrompt() {
    const d = this.d;
    const lines = [];

    lines.push(`CTO TECHNICAL AUDIT — POST-BUILD REVIEW`);
    lines.push(`${'═'.repeat(70)}`);
    lines.push(`Project  : ${this._projectLabel()} for ${d.businessName || 'Client'}`);
    lines.push(`Auditor  : Senior CTO / Principal Engineer`);
    lines.push(`Purpose  : Rigorous pre-production technical and business review`);
    lines.push(`Standard : Enterprise production-readiness`);
    lines.push(`${'═'.repeat(70)}\n`);

    lines.push(`You are acting as a senior CTO conducting a rigorous pre-launch review of`);
    lines.push(`the ${this._projectLabel()} built for ${d.businessName || 'this client'}.`);
    lines.push(`Your mandate: find every flaw, risk, and substandard implementation before`);
    lines.push(`this goes live. Be direct, specific, and uncompromising.\n`);

    lines.push(`── SECURITY AUDIT ─────────────────────────────────────────────────────────\n`);
    lines.push(`Review every security aspect and report findings:\n`);
    lines.push(`1. Authentication implementation — JWT handling, session management, token expiry`);
    lines.push(`2. Authorization — are all routes protected? Can users access data they shouldn't?`);
    lines.push(`3. Input validation — every form field, API parameter, file upload`);
    lines.push(`4. SQL injection risk — are all database queries parameterised?`);
    lines.push(`5. XSS vulnerabilities — is user-generated content properly sanitised?`);
    lines.push(`6. CSRF protection — are state-changing requests protected?`);
    lines.push(`7. Security headers — CSP, HSTS, X-Frame-Options, Referrer-Policy present?`);
    lines.push(`8. API rate limiting — implemented on auth endpoints and public APIs?`);
    lines.push(`9. Secrets management — are API keys in environment variables, never in code?`);
    lines.push(`10. Dependency vulnerabilities — run npm audit and report critical/high issues`);
    lines.push(`\nReport: PASS / FAIL / CONCERN for each. Fix all FAILs before launch.\n`);

    lines.push(`── PERFORMANCE AUDIT ──────────────────────────────────────────────────────\n`);
    lines.push(`1. Run Lighthouse on homepage, key landing page, and most complex page`);
    lines.push(`2. Core Web Vitals: LCP must be <2.5s, CLS <0.1, FID/INP <200ms`);
    lines.push(`3. Largest Contentful Paint element — is it optimised?`);
    lines.push(`4. Image audit: all images WebP, lazy-loaded, correct dimensions`);
    lines.push(`5. JavaScript bundle size — anything over 200KB uncompressed needs code splitting`);
    lines.push(`6. Third-party scripts — are analytics/chat/marketing scripts deferred?`);
    lines.push(`7. Database query performance — are there N+1 queries? Missing indexes?`);
    lines.push(`8. API response times — all endpoints should respond under 500ms`);
    lines.push(`9. Cache strategy — what is cached, for how long, and how is it invalidated?\n`);

    lines.push(`── SEO AUDIT ───────────────────────────────────────────────────────────────\n`);
    lines.push(`1. Title tags — unique, keyword-rich, under 60 characters on every page`);
    lines.push(`2. Meta descriptions — unique, CTA-containing, 150-160 chars`);
    lines.push(`3. H1 tags — one per page, contains primary keyword`);
    lines.push(`4. Image alt text — all images have descriptive, keyword-relevant alt text`);
    lines.push(`5. Internal linking — do pages link to each other logically?`);
    lines.push(`6. Sitemap.xml — generated, accessible at /sitemap.xml, submitted to GSC`);
    lines.push(`7. Robots.txt — correctly configured, not blocking critical pages`);
    lines.push(`8. Canonical tags — present on all pages to prevent duplicate content`);
    lines.push(`9. Structured data — Organisation, LocalBusiness, or relevant schema present?`);
    lines.push(`10. Core Web Vitals — Google uses these as ranking signals\n`);

    lines.push(`── ACCESSIBILITY AUDIT ─────────────────────────────────────────────────────\n`);
    lines.push(`1. Run axe DevTools on every page — zero critical violations permitted`);
    lines.push(`2. Keyboard navigation — tab through entire site, every element reachable`);
    lines.push(`3. Screen reader test — use NVDA (Windows) or VoiceOver (Mac)`);
    lines.push(`4. Colour contrast — WCAG AA requires 4.5:1 for body text, 3:1 for large text`);
    lines.push(`5. Focus indicators — visible on all interactive elements`);
    lines.push(`6. Form labels — every input has an associated label`);
    lines.push(`7. ARIA attributes — correct use, no redundant or incorrect ARIA`);
    lines.push(`8. Skip navigation link — present and functional at top of page\n`);

    lines.push(`── CODE QUALITY AUDIT ──────────────────────────────────────────────────────\n`);
    lines.push(`1. TypeScript strictness — is strict mode enabled? No 'any' types?`);
    lines.push(`2. Error handling — are all async operations wrapped in try/catch?`);
    lines.push(`3. Loading and empty states — every data-fetching component handles these`);
    lines.push(`4. Environment variables — are all required vars documented in .env.example?`);
    lines.push(`5. Console logs — no console.log in production code`);
    lines.push(`6. Dead code — remove any unused components, functions, imports`);
    lines.push(`7. API error responses — consistent error format, correct HTTP status codes\n`);

    lines.push(`── DATABASE AUDIT ──────────────────────────────────────────────────────────\n`);
    lines.push(`1. Schema review — are relationships correct? Foreign keys enforced?`);
    lines.push(`2. Indexes — are all foreign keys and frequently-queried columns indexed?`);
    lines.push(`3. Data types — are appropriate types used (e.g., UUID not INT for IDs)?`);
    lines.push(`4. Soft deletes — are records soft-deleted to preserve audit trail?`);
    lines.push(`5. Timestamps — do all tables have created_at, updated_at?`);
    lines.push(`6. Migrations — are all schema changes in versioned migration files?`);
    lines.push(`7. Backup strategy — is automated backup configured and tested?\n`);

    if (d.compliance?.length && !d.compliance.includes('none')) {
      lines.push(`── COMPLIANCE VERIFICATION ─────────────────────────────────────────────────\n`);
      if (d.compliance.includes('gdpr')) {
        lines.push(`GDPR:`);
        lines.push(`□ Cookie consent banner: granular categories, opt-out functional`);
        lines.push(`□ Privacy Policy: complete, current, linked from footer`);
        lines.push(`□ Data Subject Rights: form available for SAR, deletion, portability`);
        lines.push(`□ Data retention: automated deletion policy implemented`);
        lines.push(`□ Third-party processors: DPAs in place with all vendors\n`);
      }
      if (d.compliance.includes('hipaa')) {
        lines.push(`HIPAA:`);
        lines.push(`□ Business Associate Agreements signed with ALL vendors touching PHI`);
        lines.push(`□ PHI encrypted at rest (AES-256) and in transit (TLS 1.3)`);
        lines.push(`□ Access logs for all PHI access`);
        lines.push(`□ Minimum necessary access principle enforced\n`);
      }
    }

    lines.push(`── PRODUCTION READINESS CHECKLIST ──────────────────────────────────────────\n`);
    lines.push(`□ Error tracking (Sentry or equivalent) configured in production`);
    lines.push(`□ Uptime monitoring active with alerting`);
    lines.push(`□ Environment variables set in production hosting environment`);
    lines.push(`□ Database connection pool configured for production load`);
    lines.push(`□ CDN configured for static assets`);
    lines.push(`□ HTTPS enforced, HTTP redirects to HTTPS`);
    lines.push(`□ Domain DNS configured, propagated, SSL certificate valid`);
    lines.push(`□ 404 and 500 error pages styled and branded`);
    lines.push(`□ Analytics verified firing on production domain`);
    lines.push(`□ Backup and disaster recovery plan documented and tested\n`);

    lines.push(`── FINAL VERDICT ────────────────────────────────────────────────────────────\n`);
    lines.push(`After completing this audit, provide:`);
    lines.push(`1. CRITICAL BLOCKERS: Issues that MUST be fixed before launch`);
    lines.push(`2. HIGH PRIORITY: Issues to fix within 2 weeks of launch`);
    lines.push(`3. MEDIUM PRIORITY: Improvements for next sprint`);
    lines.push(`4. OBSERVATIONS: Things to monitor post-launch`);
    lines.push(`\nDo not approve launch until all CRITICAL BLOCKERS are resolved.`);

    lines.push(`\n${'═'.repeat(70)}`);
    lines.push(`END OF CTO AUDIT SPECIFICATION`);
    lines.push(`${'═'.repeat(70)}\n`);

    return lines.join('\n');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CLIENT SALES BRIEF
  // ══════════════════════════════════════════════════════════════════════════
  _clientSalesBrief() {
    const d = this.d;
    const lines = [];

    lines.push(`CLIENT DELIVERY BRIEF`);
    lines.push(`${'═'.repeat(70)}`);
    lines.push(`Prepared for: ${d.businessName || 'Client'}`);
    lines.push(`Document type: Executive Project Delivery Brief`);
    lines.push(`Date: ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}`);
    lines.push(`${'═'.repeat(70)}\n`);

    lines.push(`── EXECUTIVE SUMMARY ───────────────────────────────────────────────────────\n`);
    lines.push(`We have designed and built an enterprise-grade ${this._projectLabel()} for`);
    lines.push(`${d.businessName || 'your business'} that positions you ahead of competitors in`);
    lines.push(`the ${d.industry || 'industry'} space.`);
    lines.push(`\nThis is not a standard website. It is a strategic digital asset engineered`);
    lines.push(`to ${(d.businessGoals || ['generate leads', 'build authority']).slice(0,3).join(', ').toLowerCase()}`);
    lines.push(`— with enterprise-grade security, accessibility, and performance built in from day one.\n`);

    lines.push(`── WHAT WE BUILT ────────────────────────────────────────────────────────────\n`);
    lines.push(`Platform Type : ${this._projectLabel()}`);
    lines.push(`Technology    : ${this.stack}`);
    lines.push(`Database      : ${this.db}`);
    lines.push(`Hosting       : ${this.host}`);
    lines.push(`Analytics     : ${this.ana}`);
    if (d.features?.length) {
      lines.push(`\nKey Features Delivered:`);
      d.features.forEach(f => lines.push(`  ✓ ${f}`));
    }
    lines.push('');

    lines.push(`── BUSINESS IMPACT & ROI ────────────────────────────────────────────────────\n`);
    lines.push(this._roiSection());

    lines.push(`── COMPETITIVE ADVANTAGES BUILT IN ─────────────────────────────────────────\n`);
    lines.push(`1. Enterprise SEO Architecture`);
    lines.push(`   Structured data, optimised metadata, and content architecture designed`);
    lines.push(`   to rank for your target keywords and capture organic search traffic.\n`);
    lines.push(`2. Conversion-First Design`);
    lines.push(`   Every page has a clear primary CTA. User journeys are mapped and`);
    lines.push(`   optimised to move visitors toward your key business goals.\n`);
    lines.push(`3. Mobile-First Performance`);
    lines.push(`   Built to Lighthouse ≥90 across all metrics. Fast load times reduce`);
    lines.push(`   bounce rates and improve both rankings and conversions.\n`);
    lines.push(`4. Future-Proof Architecture`);
    lines.push(`   Built with scalability in mind. Adding new features, users, or content`);
    lines.push(`   will not require a rebuild — only incremental additions.\n`);

    lines.push(`── SECURITY & COMPLIANCE ────────────────────────────────────────────────────\n`);
    lines.push(`Your platform has been built to enterprise security standards:`);
    lines.push(`  ✓ HTTPS/TLS encryption on all connections`);
    lines.push(`  ✓ Security headers (CSP, HSTS, X-Frame-Options) configured`);
    lines.push(`  ✓ All user inputs validated and sanitised server-side`);
    lines.push(`  ✓ Rate limiting on sensitive endpoints`);
    if (d.compliance?.includes('gdpr')) lines.push(`  ✓ GDPR-compliant: cookie consent, privacy policy, data rights`);
    if (d.compliance?.includes('hipaa')) lines.push(`  ✓ HIPAA: data encrypted at rest and in transit, audit logs active`);
    if (d.compliance?.includes('wcag')) lines.push(`  ✓ WCAG 2.1 AA accessibility compliance`);
    lines.push('');

    lines.push(`── ONGOING VALUE ─────────────────────────────────────────────────────────────\n`);
    lines.push(`This platform is a living asset. Recommended ongoing activities:\n`);
    lines.push(`Monthly:`);
    lines.push(`  • Review analytics: which pages convert, which need improvement`);
    lines.push(`  • Publish 2 blog articles targeting search keywords`);
    lines.push(`  • Monitor Core Web Vitals in Google Search Console\n`);
    lines.push(`Quarterly:`);
    lines.push(`  • CRO review: A/B test CTAs and landing page elements`);
    lines.push(`  • Security dependency updates (npm audit)`);
    lines.push(`  • Review and update SEO metadata as needed\n`);
    lines.push(`Annually:`);
    lines.push(`  • Full accessibility audit`);
    lines.push(`  • Technology dependency review and upgrades`);
    lines.push(`  • Review brand and positioning against competitors\n`);

    lines.push(`── WHAT'S NEXT ──────────────────────────────────────────────────────────────\n`);
    lines.push(this._nextSteps());

    lines.push(`── HANDOVER CHECKLIST ───────────────────────────────────────────────────────\n`);
    lines.push(`Before we close this project, confirm the following:\n`);
    lines.push(`□ Domain DNS transferred and SSL active`);
    lines.push(`□ Admin login credentials delivered securely`);
    lines.push(`□ Analytics access granted to your team`);
    lines.push(`□ CMS training completed`);
    lines.push(`□ Hosting & domain renewal responsibilities confirmed`);
    lines.push(`□ Backup strategy confirmed`);
    lines.push(`□ Support & maintenance agreement (if applicable) signed`);
    lines.push(`□ Project documentation / handover notes provided\n`);

    lines.push(`${'═'.repeat(70)}`);
    lines.push(`END OF CLIENT DELIVERY BRIEF`);
    lines.push(`${'═'.repeat(70)}\n`);

    return lines.join('\n');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION GENERATORS
  // ══════════════════════════════════════════════════════════════════════════

  _projectLabel() {
    const t = this.d.projectType;
    const found = PROJECT_TYPES.find(p => p.id === t);
    return found ? found.name : (t || 'Digital Platform');
  }

  _revenueModelDesc() {
    const model = this.d.revenueModel;
    const descs = {
      'B2B Services / Project-based': `Revenue is generated through project engagements and retainers. The website's primary job is to build enough trust and authority that prospects choose to initiate a conversation. Every page must justify the investment and demonstrate expertise.`,
      'SaaS / Subscription':          `Revenue is recurring and tied to product value delivery. The website must clearly communicate value, reduce friction to trial/signup, and support self-serve onboarding. Pricing page and feature comparison are critical conversion assets.`,
      'E-Commerce / Transactional':   `Revenue is driven by purchase volume. Every design and UX decision must reduce friction in the buying journey. Product discovery, trust signals, and checkout optimisation are primary concerns.`,
      'Marketplace / Commission':     `Revenue depends on liquidity — the platform must attract and retain both sides of the market. Onboarding for suppliers and buyers must be frictionless, and trust mechanisms (reviews, verification) are critical.`,
      'Freemium to Paid':             `The conversion from free to paid is the most critical journey. Free tier must deliver genuine value; the upgrade path must be contextual and frictionless. In-app prompts and email sequences drive conversion.`,
    };
    return descs[model] || `Revenue model: ${model}. Design all conversion flows to support this model's specific acquisition and retention dynamics.`;
  }

  _goalKPI(goal) {
    const kpis = {
      'Lead Generation':          'Monthly qualified inquiries, cost-per-lead, lead-to-close rate',
      'Brand Authority':          'Organic impressions, backlink growth, branded search volume',
      'E-Commerce Sales':         'Revenue, conversion rate, average order value, cart abandonment rate',
      'Customer Retention':       'NPS score, churn rate, repeat purchase rate, portal engagement',
      'Recruitment / Talent Attraction': 'Application volume, quality-of-hire, time-to-fill',
      'Investor Relations':       'Investor page sessions, document downloads, direct inquiries',
      'Appointment Booking':      'Bookings per week, no-show rate, scheduling self-service rate',
      'Product Demos':            'Demo request conversion rate, show rate, demo-to-close',
      'Community Building':       'Member growth rate, DAU/MAU, engagement rate',
    };
    return kpis[goal] || 'Define specific measurable targets in first 90 days';
  }

  _conversionStrategy() {
    const goals = this.d.businessGoals || [];
    const type  = this.d.projectType;
    let s = '';
    s += `Primary CTA: ${this._primaryCTA()}\n`;
    s += `Secondary CTA: ${this._secondaryCTA()}\n`;
    s += `Tertiary CTA: ${this._tertiaryCTA()}\n\n`;
    s += `Conversion principles:\n`;
    s += `• CTA appears above the fold on homepage\n`;
    s += `• Sticky header/nav always shows primary CTA\n`;
    s += `• Social proof (testimonials, logos, numbers) placed before each CTA\n`;
    s += `• Remove friction: minimise form fields to essential information only\n`;
    s += `• Use urgency and specificity in CTA copy (not "Contact Us", but "${this._primaryCTA()}")\n`;
    s += `• Every page has an exit-intent or scroll-triggered conversion mechanism`;
    return s;
  }

  _primaryCTA() {
    const type = this.d.projectType;
    const goals = this.d.businessGoals || [];
    if (goals.includes('Appointment Booking')) return 'Book a Free Consultation';
    if (goals.includes('Lead Generation'))     return 'Get a Free Quote';
    if (goals.includes('E-Commerce Sales'))    return 'Shop Now';
    if (goals.includes('Product Demos'))       return 'Request a Demo';
    if (type === 'saas')       return 'Start Free Trial';
    if (type === 'ecommerce')  return 'Shop Now';
    if (type === 'law-firm')   return 'Schedule a Consultation';
    if (type === 'medical')    return 'Book an Appointment';
    if (type === 'marketplace')return 'Join Free';
    if (type === 'portfolio')  return 'Get in Touch';
    if (type === 'landing-page') return 'Get Started';
    return 'Get Started Today';
  }
  _secondaryCTA() {
    const type = this.d.projectType;
    if (type === 'saas')    return 'View Pricing';
    if (type === 'medical') return 'Learn About Our Services';
    return 'View Our Work';
  }
  _tertiaryCTA() {
    return 'Download Our Capabilities Deck';
  }

  _generatePersonas() {
    const type    = this.d.projectType;
    const market  = this.d.targetMarket || 'target customers';
    const industry= this.d.industry || 'industry';
    const personas = {
      'saas': [
        { role: 'Decision Maker', title: 'VP Engineering / CTO / Head of Product', age: '35-55', needs: 'ROI clarity, security, integrations, compliance', pains: 'Switching costs, vendor lock-in, team adoption', journey: 'Google/LinkedIn → landing page → features → pricing → trial → sales call' },
        { role: 'Champion',       title: 'Senior Developer / Operations Manager',  age: '28-42', needs: 'API quality, docs, DX, support responsiveness',  pains: 'Poor docs, missing features, slow support',   journey: 'Trial → API docs → integration → internal advocacy' },
        { role: 'End User',       title: 'Team Member / Analyst',                  age: '25-40', needs: 'Simple UX, speed, mobile access',                pains: 'Complexity, slow UI, lack of training',      journey: 'Invited by admin → onboarding → daily use' },
      ],
      'ecommerce': [
        { role: 'Intent Buyer',   title: 'Online Shopper',   age: '25-55', needs: 'Price, trust, fast delivery, easy returns', pains: 'Trust uncertainty, complex checkout, hidden fees', journey: 'Google/social → product page → reviews → cart → checkout' },
        { role: 'Researcher',     title: 'Comparison Shopper', age: '30-50', needs: 'Detailed specs, comparison, policy clarity',  pains: 'Missing info, weak product content',            journey: 'Search → multiple tabs → review sites → return to buy' },
      ],
      'law-firm': [
        { role: 'Primary Client', title: 'Individual or Business Decision Maker', age: '30-60', needs: 'Expertise, trust, clear process, fees transparency', pains: 'Unclear pricing, legal jargon, uncertainty', journey: 'Google → reviews → attorney profiles → contact form' },
        { role: 'Referral',       title: 'Referred Contact',                      age: '30-60', needs: 'Validation of referred attorney',                   pains: 'Cannot find specific attorney info',          journey: 'Direct → attorney profile → contact' },
      ],
      'medical': [
        { role: 'Patient',        title: 'Patient or Caregiver', age: '25-70', needs: 'Quick appointments, clear service info, insurance clarity', pains: 'Long wait times, unclear costs, difficult booking', journey: 'Google → services → booking → registration' },
        { role: 'Referral',       title: 'Referring Physician',  age: '35-65', needs: 'Specialist credentials, referral process',                pains: 'Unclear referral pathway',                         journey: 'Direct/portal → credentials → referral form' },
      ],
    };
    const list = personas[type] || [
      { role: 'Primary',   title: `${industry} Decision Maker`, age: '30-55', needs: 'Quality, reliability, clear ROI',      pains: 'Risk, complexity, unclear value',       journey: `Search → homepage → services/about → ${this._primaryCTA()}` },
      { role: 'Evaluator', title: 'Research & Procurement',    age: '28-45', needs: 'Detailed specs, credentials, process', pains: 'Missing information, can\'t compare',   journey: `Referral → specific content → decision to engage` },
      { role: 'Partner',   title: 'Potential Partner / Vendor', age: '30-50', needs: 'Company culture, partnership process', pains: 'No clear partner pathway',              journey: 'Direct → about → contact' },
    ];

    let out = '';
    list.forEach((p, i) => {
      out += `PERSONA ${i+1}: ${p.role.toUpperCase()} — "${p.title}"\n`;
      out += `Age range   : ${p.age}\n`;
      out += `Core needs  : ${p.needs}\n`;
      out += `Pain points : ${p.pains}\n`;
      out += `Journey     : ${p.journey}\n\n`;
    });
    return out;
  }

  _generateSiteMap() {
    const type    = this.d.projectType;
    const features= this.d.features || [];
    const hasBlog = features.includes('Blog / Content Hub');
    const hasAdmin= features.includes('Admin Dashboard');
    const hasPortal = features.includes('Customer Portal');
    const hasAccounts = features.includes('User Accounts & Auth');
    const hasBooking = features.includes('Booking System');
    const hasPayments = features.includes('Payments & Billing');

    const maps = {
      'saas': `/ (Homepage)\n/features (Feature overview)\n/pricing (Pricing & plans)\n/docs (Documentation)\n/blog (Blog & resources)\n/about (Company)\n/contact (Contact)\n/login (Auth)\n/signup (Registration)\n/dashboard (App home) [auth]\n/dashboard/settings (Account settings) [auth]\n/dashboard/billing (Billing) [auth]\n/admin (Admin panel) [admin]`,

      'ecommerce': `/ (Homepage)\n/products (All products)\n/products/[category] (Category pages)\n/products/[slug] (Product detail)\n/cart (Shopping cart)\n/checkout (Checkout)\n/checkout/confirmation (Order confirmation)\n/account (My account) [auth]\n/account/orders (Order history) [auth]\n/account/addresses (Saved addresses) [auth]${hasBlog ? '\n/blog (Blog)' : ''}\n/pages/about (About us)\n/pages/contact (Contact)\n/pages/returns (Returns policy)\n/pages/privacy (Privacy policy)`,

      'default': `/ (Homepage)\n/about (About us)\n  /about/team (Leadership team)\n  /about/story (Our story)\n/services (Services overview)\n  /services/[service-slug] (Individual service pages)\n/work (Portfolio / Case studies)\n  /work/[project-slug] (Project detail)\n${hasBlog ? '/blog (Blog / Insights)\n  /blog/[slug] (Article)\n' : ''}/contact (Contact)\n  /contact/thank-you (Confirmation)${hasAdmin ? '\n/admin (Admin panel) [admin]' : ''}${hasPortal ? '\n/portal (Client portal) [auth]' : ''}${hasBooking ? '\n/book (Booking) [auth]' : ''}\n/legal/privacy (Privacy policy)\n/legal/terms (Terms of use)\n/legal/accessibility (Accessibility statement)`,
    };

    return maps[type] || maps['default'];
  }

  _navArchitecture() {
    return `Primary navigation: max 6 top-level items. Use dropdown menus only for items with 3+ children.\nMobile: Full-screen hamburger menu. All primary CTAs visible in mobile nav.\nSticky header: Visible at all times. Contains logo, primary nav, and primary CTA button.\nBreadcrumbs: All pages deeper than root level. Schema markup included.\nFooter: Full sitemap in footer (3-4 columns). Legal links, social icons, address/contact.`;
  }

  _artDirection() {
    const industry = this.d.industry || '';

    // Industry-specific art direction: mood, type pairing, palette, imagery, signature moment
    const directions = [
      {
        match: ['Legal'],
        mood: 'Quiet power. Old-money confidence rendered with modern restraint — think private bank, not courtroom drama. The site should feel like a mahogany-panelled office redesigned by a Swiss architect.',
        display: 'Playfair Display or Cormorant Garamond (serif, 500-600 weight) for H1/H2 — gravitas without stuffiness',
        body: 'Inter or Source Sans 3 — 400/500 — the serif/sans contrast IS the brand',
        palette: `Ink navy   #0E1B2C — primary surfaces, headers, footer\nWarm ivory #FAF7F2 — page background (never pure white — too clinical)\nAged gold  #B8924C — accents ONLY: rules, icons, hover states (max 5% of any viewport)\nCharcoal   #2A3441 — body text\nSlate      #64748B — captions, metadata`,
        imagery: 'Architectural photography of the city, dramatic but desaturated. Portraits: natural window light, shallow depth, subjects looking INTO the frame. Never stock handshakes, never gavels, never scales of justice.',
        hero: 'Asymmetric split — 60% editorial headline over ivory, 40% full-bleed architectural image. Headline set in the serif at clamp(2.5rem, 6vw, 4.5rem) with a single gold rule beneath.',
        signature: 'A thin gold horizontal rule (1px) that draws itself in (scaleX 0→1, 600ms ease-out) beneath section headings as they scroll into view.',
      },
      {
        match: ['Medical', 'Healthcare', 'Dental'],
        mood: 'Calm competence. The visual equivalent of a reassuring voice — clean air, morning light, nothing alarming. Clinical precision softened with human warmth.',
        display: 'Sora or Plus Jakarta Sans — 600/700 — geometric but friendly',
        body: 'Inter — 400/500 — 17px minimum (older patients read this site)',
        palette: `Deep teal   #0F6E6B — primary, headers, CTAs\nSoft aqua   #E6F4F3 — section tints, card backgrounds\nWarm white  #FBFCFC — page background\nCoral       #F2755F — single accent for primary CTA only (stands out against all the calm)\nInk         #1E3231 — text`,
        imagery: 'Real practitioners in real spaces, natural light, genuine moments — never white-coat-with-clipboard stock. Soft-focus environment shots between sections.',
        hero: 'Centred, generous: small eyebrow label, one-line promise headline, sub-line, single CTA. Behind it a very subtle radial gradient (aqua to white). No carousel. No video.',
        signature: 'Cards lift 4px with a soft teal-tinted shadow on hover; booking CTA has a gentle 2s pulse on its ring — once, on page load, never looping.',
      },
      {
        match: ['Fintech', 'Financial', 'Banking', 'Insurance'],
        mood: 'Engineered trust. Precision instruments, not marketing gloss — every pixel placed like a ledger entry. Dark, confident, data-forward.',
        display: 'Space Grotesk or Geist — 500/600 — technical without being cold',
        body: 'Inter — tabular-nums enabled everywhere numbers appear',
        palette: `Graphite    #0B0F19 — primary background (dark-first design)\nCard        #131A2A — elevated surfaces, 1px #1E293B border\nElectric    #4F7CFF — primary actions, links, focus rings\nMint        #34D399 — positive deltas, success\nSignal red  #F87171 — negative deltas only (never decorative)\nFog         #94A3B8 — secondary text`,
        imagery: 'No photography. Abstract data visualisations, fine-line grid patterns, subtle animated charts with realistic (not fake-perfect) data curves.',
        hero: 'Left-aligned headline with one keyword in Electric blue; right side shows a live-feeling product surface (dashboard card with animated counters) tilted 2deg with perspective.',
        signature: 'Numbers count up with spring easing when scrolled into view; a faint 24px grid pattern (4% white) overlays hero and footer like engineering paper.',
      },
      {
        match: ['Real Estate', 'Property', 'Architecture'],
        mood: 'Cinematic aspiration. Every property is the protagonist — the interface recedes like a gallery wall. Wide, light-flooded, editorial.',
        display: 'Fraunces or Canela-style serif — 300/400 LIGHT weights at large sizes',
        body: 'Inter or Untitled Sans — 400',
        palette: `Bone        #F7F5F1 — background\nEspresso    #2B2118 — text, footer\nClay        #A86B3C — accents, price tags\nSage        #87937B — secondary accents\nPure white  #FFFFFF — cards over imagery`,
        imagery: 'Full-bleed, golden-hour photography. 3:2 ratio cards, 16:9 heroes. Images are the design — typography sits ON them in white with subtle scrim gradients, never in boxes beside them.',
        hero: '90vh full-bleed property image with bottom-third scrim; serif headline at clamp(3rem, 8vw, 6rem) light weight; search bar floats over the fold line, white, pill-shaped, shadowed.',
        signature: 'Property images scale 1.04 over 700ms on card hover while the card itself stays still — the "gallery glass" effect. Page transitions fade through bone, not white.',
      },
      {
        match: ['Restaurant', 'Hospitality', 'Food', 'Cafe', 'Hotel'],
        mood: 'Appetite and atmosphere. The site should make you hungry or make you want to be there — sensory, warm, textured, a little theatrical.',
        display: 'A characterful serif (Fraunces, soft optical size) or high-contrast display (Bricolage Grotesque)',
        body: 'Inter or Karla — 400',
        palette: `Charcoal    #1A1714 — background (evening mood) OR Cream #FAF5EC (daytime concept — pick ONE)\nFlame       #D9622B — accents, reservation CTA\nCream       #F5EDE0 — text on dark / surface on light\nOlive       #6B6B3A — secondary\nWine        #722F37 — tertiary depth`,
        imagery: 'Macro food photography with steam, texture, imperfection. Interior shots at blue hour. People mid-laugh, slightly motion-blurred. Film grain welcome.',
        hero: 'Full-screen image or looped 6s muted video; restaurant name in display type; two CTAs only: Reserve and Menu. Address and hours visible without scrolling.',
        signature: 'Menu section headings have a hand-drawn-feeling underline SVG that draws in; subtle grain texture overlay (3% opacity) over the whole site unifies all photography.',
      },
      {
        match: ['Creative', 'Agency', 'Design', 'Marketing', 'Media'],
        mood: 'Confident showmanship. The site IS the portfolio piece — break one rule per viewport, deliberately. Bold scale jumps, kinetic type, unexpected layouts.',
        display: 'Clash Display, Bricolage Grotesque, or a variable font animated on weight axis — 700-900 at massive sizes',
        body: 'Inter — 400 — let the display type do the talking',
        palette: `Raw white  #FCFCFA or raw black #0A0A0A base — monochrome discipline\nOne electric accent: #FF4D00 (orange), #2400FF (blue), or #C8FF00 (acid) — choose ONE\nAll other colour comes from project imagery`,
        imagery: 'Project work shown big — full-width case study cards. Cursor-following preview images on the work list. Mix of mockups and in-situ photography.',
        hero: 'Typographic. The headline IS the hero: clamp(4rem, 12vw, 10rem), tight leading (0.95), words animating in line-by-line with a stagger. No image needed.',
        signature: 'Marquee text strip between sections (slow, pausable, reduced-motion-aware); work-list rows expand on hover revealing a peeking project image; custom cursor dot that scales over links.',
      },
      {
        match: ['Technology', 'SaaS', 'Software', 'Startup', 'AI'],
        mood: 'Inevitable future. Linear/Vercel lineage — dark, precise, glowing. The product feels like it was sent back from five years ahead.',
        display: 'Geist, Inter Display, or Soehne-style — 500/600 — never bolder than 600 (restraint reads as confidence)',
        body: 'Inter or Geist — 400 — 15-16px, tighter than marketing sites',
        palette: `Void        #050507 — page background\nPanel       #0F1014 — cards, 1px rgba(255,255,255,0.06) border\nPrimary glow #6366F1→#8B5CF6 gradient — CTAs, key moments only\nText high   #F4F4F5 / Text mid #A1A1AA / Text low #52525B — strict 3-tier hierarchy\nSuccess     #34D399, Amber #FBBF24 — semantic only`,
        imagery: 'Product screenshots in browser-chrome frames with subtle glow shadows; abstract gradient meshes; NO people photography.',
        hero: 'Centred: announcement pill ("Now in beta" with subtle border-beam animation), headline with gradient on ONE key phrase, muted sub-line, two CTAs (solid + ghost), product screenshot below tilted into perspective with reflective glow.',
        signature: 'A border-beam light that travels around the announcement pill; section transitions where the product screenshot smoothly morphs/scales between scroll positions; faint dot-grid background that brightens near the cursor.',
      },
      {
        match: ['E-Commerce', 'Retail', 'Fashion', 'Shop'],
        mood: 'Desire engineering. Product is hero, interface disappears. Editorial fashion-magazine confidence with frictionless utility underneath.',
        display: 'For fashion: a chic grotesque (Neue Montreal-style, e.g. Archivo) at light weights, generous tracking on labels. For general retail: Inter Display 600.',
        body: 'Inter — 400/500',
        palette: `Gallery white #FFFFFF — background (products need neutral ground)\nInk           #111111 — text, buttons\nOne brand accent used ONLY for: sale tags, cart badge, free-shipping bar\nWarm grey     #F6F5F3 — section alternation, product card backgrounds`,
        imagery: 'Consistent product photography: same background tone, same shadow direction across ALL products. Lifestyle imagery 4:5 portrait. Hover swaps to second product angle.',
        hero: 'Seasonal campaign image full-width, headline bottom-left in white, single CTA. Below: shoppable category tiles, 2-4-2 asymmetric grid.',
        signature: 'Add-to-cart button morphs into a checkmark then the cart icon nudges with a count bump; product cards cross-fade to alternate shot on hover (300ms); free-shipping progress bar slides in atop the cart drawer.',
      },
    ];

    const found = directions.find(d => d.match.some(m => industry.toLowerCase().includes(m.toLowerCase())));
    return found || {
      mood: 'Modern authority. Clean, spacious, quietly premium — the digital equivalent of a well-tailored suit. Generic-template energy is the enemy: every section must feel intentionally composed.',
      display: 'Sora or Inter Display — 600/700 — tight letter-spacing (-0.02em to -0.04em)',
      body: 'Inter — 400/500',
      palette: `Deep ink    #16203A — primary, headers, footer\nPaper       #FAFAF8 — background (slightly warm, never #FFF)\nAction      #3B5BDB — CTAs, links\nHighlight   #E8EDFF — selected states, section tints\nText        #1F2937 / #6B7280 two-tier hierarchy`,
      imagery: 'Authentic over polished: real team, real workspace, consistent colour grade across every image (slightly lifted blacks, warm highlights).',
      hero: 'Asymmetric 7/5 split: headline + sub + CTA left, layered image composition right (one main image, one offset card with a stat or testimonial overlapping its corner).',
      signature: 'Section headings rise 24px and fade in with 80ms stagger between heading/body/CTA; one stat counter animates in the social-proof bar.',
    };
  }

  // Leading visual-style directive pulled from the growing style library.
  // This is what makes two sites with the same choices come out different.
  _styleDirective() {
    const s = this.style;
    if (!s) return '';
    const dna = s.dna || {};
    let out = `SELECTED VISUAL STYLE: "${s.name}" — build this site unmistakably in this style.\n`;
    out += `This exact direction is non-negotiable; do not fall back to a generic template look.\n\n`;
    out += `• Mood        : ${dna.mood || ''}\n`;
    out += `• Typography  : ${dna.typography || ''}\n`;
    if (s.fonts) out += `• Fonts       : ${s.fonts}\n`;
    out += `• Colour      : ${dna.color || ''}\n`;
    out += `• Layout      : ${dna.layout || ''}\n`;
    out += `• Motion      : ${dna.motion || ''}\n`;
    out += `• Imagery     : ${dna.imagery || ''}\n`;
    out += `• Signature   : ${dna.signature || ''}\n`;
    if (s.techniques && s.techniques.length) {
      out += `\nSIGNATURE TECHNIQUES TO IMPLEMENT (these define the style — build them):\n`;
      s.techniques.forEach(t => { out += `• ${t}\n`; });
    }
    out += `\nCommit fully to this style across every page and section. Two different businesses\n`;
    out += `should never be guessable as coming from the same template — this style is ${s.name}.\n`;
    return out;
  }

  // AI-generated imagery prompts + an easy path for the owner to use their own media.
  _imageryDirection() {
    const s = this.style;
    const imgPrompts = (s && s.imagePrompts && s.imagePrompts.length) ? s.imagePrompts : null;
    const ind = this.d.industry || 'the business';
    let out = `Most owners are not designers and have no photography yet. Handle imagery in two layers:\n\n`;
    out += `1. AI-GENERATED PLACEHOLDERS (default)\n`;
    out += `• Generate art-directed images that match the visual style above — never generic stock.\n`;
    out += `• Use these exact, style-matched generation prompts as a starting point:\n`;
    if (imgPrompts) {
      imgPrompts.forEach(p => { out += `   - "${p}"\n`; });
    } else {
      out += `   - "art-directed hero image for a ${ind} brand, matching the selected visual style, cinematic lighting, cohesive colour grade, ample negative space"\n`;
    }
    out += `• Apply ONE consistent treatment (grade / duotone / grain) to every image — mixed image styles are the #1 amateur tell.\n`;
    out += `• Every image: correct width/height (zero layout shift), object-fit cover, lazy-loaded below the fold, descriptive alt text.\n\n`;
    out += `2. OWNER'S OWN MEDIA (must be effortless)\n`;
    out += `• Wherever an image or video appears, it MUST be replaceable by a non-technical owner — no code.\n`;
    if (this.includeCMS) {
      out += `• Wire every image/video to the content manager (see Content Management section) so the owner can upload, swap, crop, reorder, or delete media from a simple admin screen.\n`;
    } else {
      out += `• Provide a clearly documented, single place to swap images (a media folder + a short README) so a non-developer can replace them confidently.\n`;
    }
    out += `• Support common formats; auto-optimise on upload (resize + WebP). Show a friendly preview before saving.\n`;
    out += `• Videos: muted, looping, lazy hero/section backgrounds where the style calls for it, with a poster image fallback.`;
    return out;
  }

  // Beginner-friendly CMS / admin so owners can manage content themselves.
  _cmsSection() {
    const name = this.d.businessName || 'the owner';
    return `Build a simple, beginner-friendly content manager so ${name} can run the site without a developer.

WHAT THE OWNER MUST BE ABLE TO DO (no code, plain-language UI):
• Edit any text on the site (headlines, paragraphs, buttons, prices, contact details).
• Upload, replace, crop, reorder, and DELETE images and videos — with live preview.
• Add / edit / remove repeatable items (services, projects, products, team, testimonials,
  blog posts, FAQs) — whatever this site type uses.
• Toggle sections on/off and reorder them.
• Save as draft and publish; undo a recent change.

HOW TO BUILD IT (match the chosen platform & stack):
• A protected /admin area behind a simple secure login (one owner account is fine to start).
• Use the platform's native CMS where it has one (e.g. a headless CMS, Sanity/Payload, or the
  builder's built-in content editor); otherwise a lightweight admin with a media library.
• Store editable content as data (not hard-coded) so edits appear on the live site immediately.
• Media library: drag-and-drop upload, automatic resize + WebP, alt-text field, delete with confirm.
• Friendly empty states and inline help — assume the owner has never used a CMS before.

KEEP IT SIMPLE: this is for a non-technical owner. Favour clarity over power. Do not expose
database internals, code, or developer jargon anywhere in the admin UI.`;
  }

  _designSystem() {
    const art = this._artDirection();
    const name = this.d.businessName || 'the brand';

    return `Act as a design director with 30 years of experience across brand, editorial, and product design. The bar is "this should win an Awwwwards honourable mention", not "this looks professional". Execute the following art direction precisely.

ART DIRECTION — THE BIG IDEA
${art.mood}

Design test for every section: if you screenshot it and crop out the logo, could it be
any other company's website? If yes, redesign it. ${name} must be unmistakable.

COLOUR SYSTEM (60-30-10 discipline)
${art.palette}
Rules:
• 60% dominant neutral, 30% secondary surfaces, 10% accent — measured per viewport
• Accent colour appears ONLY on interactive or emphatic elements — scarcity creates power
• Every colour pair used for text must pass WCAG AA (4.5:1) — check, don't assume
• Derive a full 50-900 scale for each hue; use the scale, never ad-hoc hex values
• Define everything as CSS custom properties in :root

TYPOGRAPHY (the strongest design signal — treat it as the brand)
Display     : ${art.display}
Body        : ${art.body}
Type scale  : Fluid with clamp() — H1 clamp(2.5rem,5vw+1rem,4.5rem), H2 clamp(1.875rem,3vw+0.5rem,3rem), H3 1.5rem, body 1.0625rem, caption 0.875rem
Craft rules :
• Line-height: 1.1 for display sizes, 1.65 for body — never one value for both
• Max line length 65ch for body text — enforce with max-width, not luck
• Letter-spacing: negative on large display (-0.02em to -0.05em), positive on small caps labels (+0.08em)
• Hang punctuation and balance headlines: text-wrap: balance on all headings
• Never fake bold/italic; load real weights, font-display: swap, preload the display font

LAYOUT & COMPOSITION
• 12-col grid, 1200-1280px max content width, 24px gutters — but BREAK it deliberately once
  per page (full-bleed image, element crossing a section boundary, offset card)
• Whitespace is the luxury signal: 96-160px between sections, 24-40px inside cards.
  When in doubt, double the space.
• Hero composition: ${art.hero}
• Establish rhythm then break it: after two same-width sections, change the visual
  pattern (full-bleed, two-column, off-grid) so scrolling never feels templated
• Section transitions: alternate background tones subtly; never stack two identical
  white sections without a divider concept

IMAGERY & ART DIRECTION
${art.imagery}
• Apply one consistent treatment to ALL imagery (same grade/duotone/grain) — mixed
  image styles are the #1 amateur tell
• Every image: width/height attributes set (zero CLS), object-fit cover, lazy-loaded below fold

SIGNATURE MOMENT (what visitors remember)
${art.signature}
This is the highest-craft element on the site — implement it carefully, make it smooth
(60fps, transform/opacity only), and make it respect prefers-reduced-motion.

MOTION CHOREOGRAPHY
• Easing: cubic-bezier(0.22,1,0.36,1) ("ease-out-quint") for entrances; never linear, never default 'ease'
• Durations: micro-interactions 150-200ms, reveals 500-700ms, hero entrance up to 900ms
• Scroll reveals: elements rise 16-24px + fade, stagger siblings by 60-90ms, trigger at 20% viewport, animate ONCE (no re-trigger on scroll-up)
• Hover states are mandatory on every interactive element and must move (lift 2-4px, brighten, or underline-grow) — colour-only changes feel dead
• Animate only transform and opacity (compositor-friendly); will-change used sparingly
• prefers-reduced-motion: all movement collapses to simple opacity fades

DEPTH & SURFACE
• Shadows: layered and tinted with the dominant hue, never pure black —
  e.g. 0 1px 2px rgb(from-primary / 4%), 0 8px 24px rgb(from-primary / 8%)
• Borders: 1px at 6-10% opacity define surfaces; shadows reinforce, never replace
• Gradients: maximum one hue-shift, subtle (8-15% lightness range); mesh/radial glows
  only behind heroes and CTAs
• Border-radius scale: 6px (inputs/buttons), 12px (cards), 20px (modals/heroes) — pick from the scale, never mix arbitrary radii

CRAFT DETAILS (the 1% most sites skip — do all of these)
□ Custom ::selection colour matched to brand
□ Custom focus-visible ring: 2px accent + 2px offset — visible AND beautiful
□ Styled scrollbar on overflow areas (thin, neutral, subtle)
□ Favicon + theme-color meta matched to palette
□ Skeleton loaders shaped exactly like real content (no spinner-only loading)
□ Form inputs: visible labels (never placeholder-as-label), inline validation on blur,
  shake animation + specific message on error, success state on the button itself
□ Empty states designed (illustration + one-line copy + action), never blank
□ Tabular numbers (font-variant-numeric: tabular-nums) anywhere figures align
□ Smooth anchor scrolling with scroll-margin-top compensating for sticky header
□ Sticky header: transparent at top, gains background + blur + shadow after 24px scroll

ANTI-PATTERNS (instant template-energy — never do these)
✕ Centred-headline + 3-icon-cards + centred-CTA repeated for every section
✕ Pure #FFFFFF or #000000 anywhere
✕ Default blue links, default focus rings, browser-default form controls
✕ Stock photos of handshakes, headsets, or laptops-with-charts
✕ Carousel/slider heroes; auto-playing anything with sound
✕ More than two font families, more than one accent colour
✕ AOS-style bounce/zoom entrance animations — movement must be subtle and physical
✕ Identical padding on every section — rhythm requires variation

AVOID THE AI-DEFAULT LOOKS (these read as machine-generated regardless of the subject)
AI design currently clusters around three looks. Unless the chosen visual style or brief
explicitly asks for one, do NOT land on any of them:
✕ Warm cream (~#F4F1EA) background + high-contrast serif display + a terracotta accent
✕ Near-black background + a single acid-green / vermilion accent
✕ Broadsheet layout — hairline rules, zero border-radius, dense newspaper columns
Where an axis is left free, spend that freedom on a choice specific to ${name}'s own world —
its materials, vocabulary, and artifacts — not on one of these defaults. Self-test per section:
"would I produce this exact look for almost any other brief?" If yes, change it.

STRUCTURE IS INFORMATION (devices must encode meaning, not decorate)
• Numbered markers (01 / 02 / 03), eyebrows, dividers and labels are only justified when they
  encode something true — use 01/02/03 ONLY when the content is genuinely a sequence (a real
  process, a timeline). Otherwise drop them; decorative numbering is a tell.
• Spend boldness in ONE place: let the signature moment be the memorable thing and keep
  everything around it quiet and disciplined. Before shipping a section, remove one decorative
  element that does not serve the brief (the "take one accessory off" rule).

EDITORIAL TYPE & COMPOSITION VARIETY
• Set display copy at a wide, confident measure — never let a headline wrap into 5-6 thin
  lines; tighten max-width or size so it reads as one editorial statement.
• Do NOT default every section to left-text / right-image. Vary composition across the page
  (full-bleed, centered, asymmetric, image-led, type-led) and vary hero/section scale
  (giant / mid / minimal) so scrolling never feels like one repeated template row.
• Give the page an AIDA spine: Attention (hero) → Interest (what/proof) → Desire
  (outcomes & benefits) → Action (CTA). Every section should move the reader one step on.

INTERFACE COPY (words are design material — write them with the care of spacing)
• Real copy only — never lorem ipsum. Write specific, plain-spoken words from ${name}'s world.
• Active voice on every control; the button says exactly what happens ("Save changes", not
  "Submit"), and an action keeps its name through the flow (a "Publish" button → a "Published"
  toast).
• Name things by what the user controls, not how it's built ("Notifications", not "Webhook
  config"). Be specific rather than clever.
• Errors explain what went wrong and how to fix it — never vague, never apologetic. An empty
  state is an invitation to act, never a blank panel.`;
  }

  _pageSpecs() {
    const type = this.d.projectType;
    const goals = this.d.businessGoals || [];
    const cta   = this._primaryCTA();

    let spec = `HOMEPAGE\n`;
    spec += `□ Hero section: Headline (10 words max), sub-headline (20 words max), primary CTA\n`;
    spec += `□ Hero must answer: What do you do? Who is it for? Why should I care? — within 5 seconds\n`;
    spec += `□ Trust bar immediately below hero: logos, stats, or social proof\n`;
    spec += `□ Services/features section: 3-6 items in grid format with icons\n`;
    spec += `□ Featured work / case studies: 3 items max, strong visual, outcome-focused\n`;
    spec += `□ Testimonials: 3 named, titled, with company — not anonymous quotes\n`;
    spec += `□ CTA section: Repeat primary CTA with supporting copy\n`;
    spec += `□ FAQ section (optional): Addresses 5-6 top objections\n\n`;

    if (this.entityType === 'individual') {
      spec += `ABOUT / BIO PAGE (personal — ONE person, written in first person)\n`;
      spec += `□ Personal introduction in my own voice — who I am and what I do\n`;
      spec += `□ My experience — years in the field, my approach, my specialisms and tools\n`;
      spec += `□ Notable clients or projects I've worked on (names/logos if allowed)\n`;
      spec += `□ A real personal photo and a short, human story — why I do this work\n`;
      spec += `□ NO team section, NO company history, NO "our values" — this is one person\n\n`;
    } else {
      spec += `ABOUT PAGE\n`;
      spec += `□ Mission statement — specific, not generic\n`;
      spec += `□ Team section — named individuals with photos, titles, brief bios\n`;
      spec += `□ Company stats / milestones — specific numbers (years, projects, clients)\n`;
      spec += `□ Awards, certifications, press mentions if applicable\n`;
      spec += `□ Culture / values section\n\n`;
    }

    spec += `SERVICES / FEATURES PAGE\n`;
    spec += `□ Individual page per service/feature (not one long page)\n`;
    spec += `□ Each page: H1 with keyword, 400-600 word description, benefits list, FAQ, CTA\n`;
    spec += `□ Process section: how it works (3-5 steps)\n`;
    spec += `□ Relevant testimonial or case study for this specific service\n\n`;

    spec += `CONTACT PAGE\n`;
    spec += `□ Primary form: Name, Business Email, Phone (optional), Message, CTA: "${cta}"\n`;
    spec += `□ Phone number prominent (click-to-call on mobile)\n`;
    spec += `□ Address with Google Maps embed (if physical location)\n`;
    spec += `□ Office hours displayed\n`;
    spec += `□ Thank-you page (not just a toast) — confirms receipt, sets expectations\n\n`;

    spec += `ERROR PAGES\n`;
    spec += `□ 404: Branded, helpful, includes search and links to top pages\n`;
    spec += `□ 500: Branded, apologetic, includes contact and retry option\n`;

    return spec;
  }

  _seoStrategy() {
    const name    = this.d.businessName || 'the business';
    const country = this.d.country || 'target region';
    const industry= this.d.industry || 'industry';
    const services= this.d.services || 'services';

    return `ON-PAGE SEO\n` +
      `• Title tag format: [Primary Keyword] | ${name} — [Location]\n` +
      `• Meta description: 150-160 chars — include primary keyword, benefit, and CTA\n` +
      `• One H1 per page — primary keyword, naturally phrased\n` +
      `• H2s: Supporting topics and LSI keywords\n` +
      `• Image alt text: Descriptive with keywords where natural, never keyword-stuffed\n` +
      `• URL structure: /services/[service-name] — lowercase, hyphenated, max 3 levels deep\n\n` +
      `STRUCTURED DATA (Schema.org)\n` +
      `• Organization: name, url, logo, contactPoint, sameAs (social profiles)\n` +
      `• LocalBusiness: if physical location — address, hours, coordinates\n` +
      `• BreadcrumbList: all interior pages\n` +
      `• Service: each service page\n` +
      `• FAQPage: FAQ sections\n` +
      `• Review: aggregate rating if applicable\n\n` +
      `TECHNICAL SEO\n` +
      `• Sitemap.xml: auto-generated, submitted to Google Search Console\n` +
      `• Robots.txt: allow all crawling except /admin, /api, draft pages\n` +
      `• Canonical tags: all pages, self-referencing\n` +
      `• Hreflang: if multi-language support is included\n` +
      `• Core Web Vitals: LCP <2.5s, CLS <0.1, INP <200ms\n` +
      `• No broken internal links (implement 404 monitoring)\n\n` +
      `CONTENT STRATEGY\n` +
      `• Blog: 2 articles/month targeting long-tail ${industry} keywords\n` +
      `• Location pages: one per service area (${country})\n` +
      `• Service pages: 600+ words, targeting informational and commercial intent\n` +
      `• Internal linking: every page links to at least 3 other relevant pages\n\n` +
      `LOCAL SEO (if applicable)\n` +
      `• Google Business Profile optimisation instructions\n` +
      `• NAP consistency across all pages\n` +
      `• Local schema markup\n` +
      `• Location-specific landing pages for ${country} service areas`;
  }

  _techStack() {
    const d = this.d;
    return `FRONTEND\n` +
      `Framework   : ${this.stack}\n` +
      `Styling     : Tailwind CSS + shadcn/ui component library\n` +
      `State       : Zustand (global) + React Query / TanStack Query (server state)\n` +
      `Forms       : React Hook Form + Zod validation\n` +
      `Icons       : Lucide React (install lucide-react before importing icons)\n` +
      `Animations  : Framer Motion — the "motion" package (import { motion } from 'motion/react') OR legacy "framer-motion"; same library, install whichever you use, never both. Purposeful, not decorative; CSS transitions are fine for simple cases.\n\n` +
      `BACKEND\n` +
      `Runtime     : Node.js (via Next.js API routes or separate Express/Fastify)\n` +
      `Database    : ${this.db}\n` +
      `ORM         : Prisma (type-safe, migrations, seeding)\n` +
      `Auth        : ${this.auth}\n` +
      `File storage: ${this.store}\n` +
      `Email       : Resend or Postmark (transactional) + React Email (templates)\n` +
      `Payments    : ${d.features?.includes('Payments & Billing') ? 'Stripe (PCI-compliant, Stripe Elements for card capture)' : 'N/A'}\n\n` +
      `INFRASTRUCTURE\n` +
      `Hosting     : ${this.host}\n` +
      `CMS         : ${this.cms}\n` +
      `Analytics   : ${this.ana}\n` +
      `CDN         : Built into ${this.host} / Cloudflare\n` +
      `Monitoring  : Sentry (errors) + Uptime Robot or Checkly (uptime)\n` +
      `CI/CD       : GitHub Actions → auto-deploy to ${this.host}\n\n` +
      `DEVELOPMENT STANDARDS\n` +
      `• TypeScript strict mode — no 'any' types\n` +
      `• ESLint + Prettier enforced in CI\n` +
      `• Husky pre-commit hooks for lint + type check\n` +
      `• Environment variables: .env.local (dev), platform secrets (prod)\n` +
      `• Git branching: main (protected) → develop → feature/* → PR → review → merge`;
  }

  _databaseStrategy() {
    const features = this.d.features || [];
    const type     = this.d.projectType;

    let schema = `DATABASE: ${this.db}\n\n`;
    schema += `CORE TABLES / COLLECTIONS\n\n`;
    schema += `users\n`;
    schema += `  id          UUID PRIMARY KEY DEFAULT gen_random_uuid()\n`;
    schema += `  email       VARCHAR(255) UNIQUE NOT NULL\n`;
    schema += `  name        VARCHAR(255)\n`;
    schema += `  role        ENUM('admin','editor','user') DEFAULT 'user'\n`;
    schema += `  avatar_url  TEXT\n`;
    schema += `  created_at  TIMESTAMPTZ DEFAULT NOW()\n`;
    schema += `  updated_at  TIMESTAMPTZ DEFAULT NOW()\n`;
    schema += `  deleted_at  TIMESTAMPTZ  -- soft delete\n\n`;

    if (features.includes('Blog / Content Hub')) {
      schema += `posts\n`;
      schema += `  id           UUID PRIMARY KEY\n`;
      schema += `  title        VARCHAR(255) NOT NULL\n`;
      schema += `  slug         VARCHAR(255) UNIQUE NOT NULL\n`;
      schema += `  content      TEXT\n`;
      schema += `  excerpt      TEXT\n`;
      schema += `  author_id    UUID REFERENCES users(id)\n`;
      schema += `  status       ENUM('draft','published','archived') DEFAULT 'draft'\n`;
      schema += `  published_at TIMESTAMPTZ\n`;
      schema += `  created_at   TIMESTAMPTZ DEFAULT NOW()\n\n`;
    }

    if (type === 'ecommerce' || features.includes('Payments & Billing')) {
      schema += `orders\n`;
      schema += `  id           UUID PRIMARY KEY\n`;
      schema += `  user_id      UUID REFERENCES users(id)\n`;
      schema += `  status       ENUM('pending','paid','shipped','delivered','cancelled')\n`;
      schema += `  total_amount INTEGER  -- store in cents/pence\n`;
      schema += `  currency     CHAR(3) DEFAULT 'USD'\n`;
      schema += `  stripe_payment_intent_id VARCHAR(255)\n`;
      schema += `  created_at   TIMESTAMPTZ DEFAULT NOW()\n\n`;
    }

    if (features.includes('Booking System')) {
      schema += `bookings\n`;
      schema += `  id           UUID PRIMARY KEY\n`;
      schema += `  user_id      UUID REFERENCES users(id)\n`;
      schema += `  service_id   UUID\n`;
      schema += `  scheduled_at TIMESTAMPTZ NOT NULL\n`;
      schema += `  duration_min INTEGER\n`;
      schema += `  status       ENUM('pending','confirmed','cancelled','completed')\n`;
      schema += `  notes        TEXT\n`;
      schema += `  created_at   TIMESTAMPTZ DEFAULT NOW()\n\n`;
    }

    schema += `contact_submissions\n`;
    schema += `  id         UUID PRIMARY KEY\n`;
    schema += `  name       VARCHAR(255)\n`;
    schema += `  email      VARCHAR(255)\n`;
    schema += `  phone      VARCHAR(50)\n`;
    schema += `  message    TEXT\n`;
    schema += `  ip_address INET\n`;
    schema += `  status     ENUM('new','in_progress','resolved') DEFAULT 'new'\n`;
    schema += `  created_at TIMESTAMPTZ DEFAULT NOW()\n\n`;

    schema += `INDEXES (critical for performance)\n`;
    schema += `CREATE INDEX idx_users_email    ON users(email);\n`;
    schema += `CREATE INDEX idx_users_role     ON users(role) WHERE deleted_at IS NULL;\n`;
    if (features.includes('Blog / Content Hub')) {
      schema += `CREATE INDEX idx_posts_slug   ON posts(slug);\n`;
      schema += `CREATE INDEX idx_posts_status ON posts(status, published_at DESC);\n`;
    }
    schema += `\nSCALABILITY NOTES\n`;
    schema += `• Use UUID primary keys (not auto-increment) for distributed systems\n`;
    schema += `• Soft-delete all records (deleted_at) — preserve audit trail\n`;
    schema += `• Store monetary values as integers (cents) — never floating point\n`;
    schema += `• Add created_at/updated_at to every table — use DB triggers to auto-update\n`;
    schema += `• Plan for read replicas when single-node reaches 70% capacity`;

    return schema;
  }

  _authStrategy() {
    const features = this.d.features || [];
    const has2FA   = features.includes('Two-Factor Auth');
    const hasSocial= features.includes('Social Login (OAuth)');
    const hasRBAC  = features.includes('Role-Based Access Control');

    let s = `AUTHENTICATION\n`;
    s += `Provider   : ${this.auth}\n`;
    s += `Session    : JWT access tokens (15-min expiry) + refresh token rotation\n`;
    s += `Passwords  : bcrypt, minimum 12 rounds — never store plaintext\n`;
    s += `Lockout    : 5 failed attempts → 15-minute lockout → email notification\n`;
    if (has2FA) s += `2FA        : TOTP (authenticator app) + backup codes — required for admin roles\n`;
    if (hasSocial) s += `OAuth      : Google, GitHub, Microsoft — map to existing account by email\n`;
    s += `\nAUTHORIZATION\n`;
    if (hasRBAC) {
      s += `Roles      : Super Admin > Admin > Manager > User > Guest\n`;
      s += `Implement  : Row-level security in database + middleware route guards\n`;
      s += `Principle  : Least-privilege — default deny, explicit allow\n`;
    }
    s += `Route protection: All authenticated routes check session server-side\n`;
    s += `API protection : Bearer token validation on all protected endpoints\n`;
    s += `Admin routes   : Additional role check — admin access only`;
    return s;
  }

  _securityStrategy() {
    const features    = this.d.features || [];
    const hasPayments = features.includes('Payments & Billing');
    const hasFileUp   = features.includes('File Upload / Media Library');

    let s = `HTTP SECURITY HEADERS\n`;
    s += `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' [analytics-domain]; img-src 'self' data: blob: [cdn-domain]; font-src 'self' fonts.gstatic.com; connect-src 'self' [api-domains]\n`;
    s += `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload\n`;
    s += `X-Frame-Options: DENY\n`;
    s += `X-Content-Type-Options: nosniff\n`;
    s += `Referrer-Policy: strict-origin-when-cross-origin\n`;
    s += `Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n`;
    s += `INPUT VALIDATION\n`;
    s += `• Validate ALL inputs server-side — never trust client-side only\n`;
    s += `• Use Zod schemas for all API request bodies\n`;
    s += `• Sanitise HTML content before storage and output\n`;
    s += `• Parameterised queries for all database operations (Prisma handles this)\n\n`;
    s += `RATE LIMITING\n`;
    s += `• Auth endpoints (login/register): 5 requests/min per IP\n`;
    s += `• Contact forms: 3 submissions/hour per IP\n`;
    s += `• Public API: 100 requests/min per IP\n`;
    s += `• Implement via Upstash Redis + rate-limiter-flexible\n\n`;
    s += `CSRF PROTECTION\n`;
    s += `• SameSite=Strict cookies\n`;
    s += `• CSRF tokens for state-changing form submissions\n\n`;
    if (hasFileUp) {
      s += `FILE UPLOAD SECURITY\n`;
      s += `• Validate MIME type AND extension\n`;
      s += `• Maximum size: 10MB — enforce server-side\n`;
      s += `• Store outside web root (S3/R2 with private bucket)\n`;
      s += `• Generate signed URLs for access — never expose direct storage URLs\n\n`;
    }
    if (hasPayments) {
      s += `PAYMENT SECURITY (PCI-DSS)\n`;
      s += `• Use Stripe Elements / Stripe.js — card data NEVER touches your server\n`;
      s += `• Stripe handles PCI compliance — do not log card details\n`;
      s += `• Webhook signatures verified server-side\n\n`;
    }
    s += `SECRETS MANAGEMENT\n`;
    s += `• All secrets in environment variables — never committed to source control\n`;
    s += `• .env.example documents all required variables (with dummy values)\n`;
    s += `• Rotate secrets immediately if exposed\n`;
    s += `• Production secrets managed via hosting platform's secret manager`;
    return s;
  }

  _adminStrategy() {
    const features = this.d.features || [];
    return `ADMIN PANEL ARCHITECTURE\n\n` +
      `Access     : /admin — requires admin role\n` +
      `Auth       : MFA required for all admin accounts\n\n` +
      `DASHBOARD\n` +
      `• Key metrics overview: users, submissions, content items, recent activity\n` +
      `• Quick actions: create content, view new leads, manage users\n\n` +
      `USER MANAGEMENT\n` +
      `• List all users with role, status, last login\n` +
      `• Invite users via email\n` +
      `• Edit role, suspend, delete (soft-delete)\n` +
      `• Impersonate user (admin only, logged in audit)\n\n` +
      `CONTENT MANAGEMENT\n` +
      `• Manage all content types visible in UI\n` +
      `• Draft / Preview / Publish workflow\n` +
      `• Scheduled publishing\n` +
      `• Media library with CDN delivery\n\n` +
      `AUDIT LOGS\n` +
      `• Log every admin action: who, what, when, IP address\n` +
      `• Non-deletable, append-only audit trail\n` +
      `• Filterable by user, action type, date range\n\n` +
      `ROLES & PERMISSIONS\n` +
      `Super Admin : Full access, cannot be modified by others\n` +
      `Admin       : User management, content management, settings\n` +
      `Editor      : Content management only\n` +
      `Viewer      : Read-only access to admin panel`;
  }

  _complianceStrategy() {
    const compliance = this.d.compliance || [];
    let s = '';

    if (compliance.includes('gdpr')) {
      s += `GDPR COMPLIANCE\n`;
      s += `□ Cookie consent banner: granular categories (strictly necessary, analytics, marketing)\n`;
      s += `□ Consent stored server-side with timestamp and IP\n`;
      s += `□ Privacy Policy: comprehensive, plain English, updated date visible\n`;
      s += `□ Data Subject Rights form: SAR, right to deletion, portability, rectification\n`;
      s += `□ Data retention: contact submissions auto-deleted after 36 months\n`;
      s += `□ DPO contact details in Privacy Policy\n`;
      s += `□ Third-party processor DPAs: sign DPAs with all vendors processing EU data\n`;
      s += `□ Data breach procedure: 72-hour notification plan documented\n\n`;
    }
    if (compliance.includes('hipaa')) {
      s += `HIPAA COMPLIANCE\n`;
      s += `□ BAA required: sign Business Associate Agreement with ALL vendors touching PHI\n`;
      s += `□ Encryption: AES-256 at rest, TLS 1.3 in transit\n`;
      s += `□ Access logs: all PHI access logged with user, action, timestamp\n`;
      s += `□ Minimum necessary access: users see only PHI they need for their role\n`;
      s += `□ Auto-logoff: idle sessions terminated after 15 minutes\n`;
      s += `□ Audit controls: track all PHI reads, writes, deletions\n`;
      s += `□ Hosting: use HIPAA-eligible services (AWS, Azure, Google Cloud)\n\n`;
    }
    if (compliance.includes('pci')) {
      s += `PCI-DSS COMPLIANCE\n`;
      s += `□ Use Stripe Elements — card data never touches your servers\n`;
      s += `□ TLS 1.2+ on all payment pages\n`;
      s += `□ Never log full card numbers, CVVs, or PINs\n`;
      s += `□ Annual SAQ (Self-Assessment Questionnaire) completion\n\n`;
    }
    if (compliance.includes('wcag')) {
      s += `WCAG 2.1 AA\n`;
      s += `□ Colour contrast ≥4.5:1 body, ≥3:1 large text\n`;
      s += `□ Keyboard-only navigation for all interactive elements\n`;
      s += `□ Screen reader compatibility (VoiceOver, NVDA, JAWS)\n`;
      s += `□ Focus indicators on all interactive elements\n`;
      s += `□ Alt text on all images\n`;
      s += `□ Captions on all video content\n\n`;
    }

    s += `REQUIRED LEGAL PAGES\n`;
    s += `• Privacy Policy (required for all sites collecting any data)\n`;
    s += `• Terms of Use / Terms of Service\n`;
    s += `• Cookie Policy (if using non-essential cookies)\n`;
    s += `• Accessibility Statement (recommended for all, required if public sector)\n`;
    if (compliance.includes('gdpr') || compliance.includes('hipaa')) {
      s += `• Data Processing Agreement (for B2B customers)\n`;
    }

    return s;
  }

  _accessibilityRequirements() {
    return `WCAG 2.1 LEVEL AA — ALL items are mandatory, not optional\n\n` +
      `PERCEIVABLE\n` +
      `□ All images: meaningful alt text (not "image.png"). Decorative images: alt=""\n` +
      `□ Colour contrast: ≥4.5:1 for normal text, ≥3:1 for large text (18px+ or 14px+ bold)\n` +
      `□ Content does not rely on colour alone to convey meaning\n` +
      `□ Text can be resized to 200% without loss of content or functionality\n` +
      `□ No content flashes more than 3 times per second\n\n` +
      `OPERABLE\n` +
      `□ All functionality available via keyboard (Tab, Enter, Space, Arrow keys)\n` +
      `□ No keyboard traps — user can navigate away from any element\n` +
      `□ Skip navigation link: first focusable element on every page\n` +
      `□ Focus indicator: clearly visible, not just browser default\n` +
      `□ Page titles: unique and descriptive for every page\n\n` +
      `UNDERSTANDABLE\n` +
      `□ Language attribute on <html> element\n` +
      `□ All forms: labels associated with inputs, clear error messages, error suggestions\n` +
      `□ Consistent navigation across all pages\n` +
      `□ No content changes on focus or input without user initiation\n\n` +
      `ROBUST\n` +
      `□ Valid HTML — run W3C validator\n` +
      `□ ARIA roles, states, and properties used correctly\n` +
      `□ Interactive elements have accessible names\n` +
      `□ Status messages programmatically determinable without focus\n\n` +
      `TESTING\n` +
      `□ Automated: axe-core in CI pipeline (zero critical violations to pass)\n` +
      `□ Manual keyboard: full site navigable without mouse\n` +
      `□ Screen reader: NVDA + Chrome (Windows), VoiceOver + Safari (Mac)\n` +
      `□ Zoom: 400% zoom without horizontal scroll on 1280px viewport`;
  }

  _performanceRequirements() {
    return `CORE WEB VITALS TARGETS\n` +
      `LCP (Largest Contentful Paint) : < 2.5 seconds (good) — target < 1.8s\n` +
      `CLS (Cumulative Layout Shift)  : < 0.1 (good) — target < 0.05\n` +
      `INP (Interaction to Next Paint): < 200ms (good)\n` +
      `TTFB (Time to First Byte)      : < 800ms\n\n` +
      `IMAGE OPTIMISATION\n` +
      `□ All images served in WebP format (with JPEG/PNG fallback)\n` +
      `□ Responsive images: srcset with 3 sizes (480px, 768px, 1440px)\n` +
      `□ Lazy loading: all below-fold images use loading="lazy"\n` +
      `□ Hero images: preloaded, no lazy loading\n` +
      `□ Max dimensions: never serve 4000px image where 800px is displayed\n\n` +
      `JAVASCRIPT OPTIMISATION\n` +
      `□ Code splitting: route-based (Next.js handles automatically)\n` +
      `□ No single JS bundle exceeds 200KB (uncompressed)\n` +
      `□ Third-party scripts (analytics, chat): deferred, async\n` +
      `□ Tree-shaking: ensure unused code is eliminated in build\n\n` +
      `FONT OPTIMISATION\n` +
      `□ font-display: swap on all web fonts\n` +
      `□ Preload critical fonts: <link rel="preload" as="font">\n` +
      `□ Maximum 2 font families, 4 weight variants total\n\n` +
      `CACHING\n` +
      `□ Static assets: 1-year cache (content-hashed filenames enable this)\n` +
      `□ API responses: appropriate Cache-Control headers\n` +
      `□ CDN: all static assets served from edge CDN`;
  }

  _reliabilityStrategy() {
    return `ERROR TRACKING\n` +
      `• Sentry: capture all unhandled errors, exceptions, and rejected promises\n` +
      `• Alert threshold: >1% error rate triggers immediate notification\n` +
      `• Source maps uploaded to Sentry for production debugging\n\n` +
      `UPTIME MONITORING\n` +
      `• Target SLA: 99.9% uptime (≤8.7 hours downtime/year)\n` +
      `• Monitor: homepage, API health endpoint, auth endpoint every 5 minutes\n` +
      `• Alert: email + SMS to on-call within 2 minutes of downtime\n` +
      `• Status page: public status.${(this.d.businessName || 'company').toLowerCase().replace(/\s+/g,'-')}.com\n\n` +
      `LOGGING\n` +
      `• Structured JSON logging (not plain text)\n` +
      `• Log levels: ERROR, WARN, INFO, DEBUG\n` +
      `• Production: ERROR and WARN only (avoid logging PII)\n` +
      `• Log: all API requests (method, path, status, duration) — no request bodies\n` +
      `• Centralise logs: Vercel Log Drains → Logtail / Datadog\n\n` +
      `BACKUP & RECOVERY\n` +
      `• Database: automated daily backup, 30-day retention\n` +
      `• Backup testing: monthly restoration drill\n` +
      `• RTO (Recovery Time Objective): < 4 hours\n` +
      `• RPO (Recovery Point Objective): < 24 hours\n` +
      `• Document recovery runbook — not just backups\n\n` +
      `HEALTH CHECKS\n` +
      `• Implement GET /api/health — returns 200 with DB connectivity status\n` +
      `• Implement GET /api/health/deep — checks all external service connections`;
  }

  _deploymentStrategy() {
    return `ENVIRONMENTS\n` +
      `Production : ${this.host} — main branch\n` +
      `Staging    : ${this.host} (preview) — develop branch\n` +
      `Development: localhost:3000 — feature branches\n\n` +
      `CI/CD PIPELINE (GitHub Actions)\n` +
      `On PR open    : lint, type check, unit tests, build check\n` +
      `On merge to develop : deploy to staging, run E2E tests\n` +
      `On merge to main    : deploy to production, smoke tests\n\n` +
      `ENVIRONMENT VARIABLES\n` +
      `Required (document in .env.example):\n` +
      `DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL\n` +
      `NEXT_PUBLIC_APP_URL, RESEND_API_KEY\n` +
      `SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN\n` +
      `[Add service-specific vars as needed]\n\n` +
      `DOMAIN & SSL\n` +
      `• www → non-www (or vice versa) permanent redirect (301)\n` +
      `• HTTP → HTTPS permanent redirect (301)\n` +
      `• SSL certificate: auto-renewed via hosting provider\n` +
      `• HSTS preload submitted after confirmed stable configuration`;
  }

  _futureExpansion() {
    const type     = this.d.projectType;
    const features = this.d.features || [];

    let phases = `DESIGN PRINCIPLES FOR EXPANSION\n`;
    phases += `• API-first: all business logic exposed via API, enabling future mobile apps\n`;
    phases += `• Feature flags: use flags to deploy incrementally without separate branches\n`;
    phases += `• Modular architecture: each feature module independently replaceable\n`;
    phases += `• Event-driven: emit business events (UserSignedUp, OrderPlaced) for future integrations\n\n`;
    phases += `PHASE 2 (3-6 months after launch)\n`;

    if (type === 'saas') {
      phases += `• Mobile applications (iOS/Android via React Native + shared API)\n`;
      phases += `• Advanced analytics and usage reporting\n`;
      phases += `• API marketplace / third-party integrations\n`;
      phases += `• White-label / multi-brand support\n`;
    } else if (type === 'ecommerce') {
      phases += `• Mobile app with push notifications for order updates\n`;
      phases += `• Loyalty programme / points system\n`;
      phases += `• Subscription / recurring order functionality\n`;
      phases += `• Advanced personalisation and product recommendations\n`;
    } else {
      phases += `• Client/customer self-service portal\n`;
      phases += `• API for third-party integrations\n`;
      phases += `• Advanced analytics and business intelligence dashboard\n`;
      phases += `• Mobile app for team/field operations\n`;
    }

    phases += `\nPHASE 3 (6-12 months)\n`;
    phases += `• AI/ML integrations (personalisation, predictive analytics)\n`;
    phases += `• Advanced workflow automation\n`;
    phases += `• Enterprise SSO (SAML/OIDC) for corporate customers\n`;
    phases += `• Data export and business intelligence integrations (Segment, dbt)\n`;

    return phases;
  }

  _buildSequence() {
    return `Build in this order to enable testing and feedback at each stage:\n\n` +
      `PHASE 1 — Foundation (Days 1-3)\n` +
      `1. Project setup: repo, CI, environment variables, deployment pipeline\n` +
      `2. Design system: Tailwind config, shadcn/ui setup, colour tokens, typography\n` +
      `3. Layout components: header, footer, navigation\n` +
      `4. Authentication (if required): login, register, session management\n\n` +
      `PHASE 2 — Core Pages (Days 4-7)\n` +
      `5. Homepage with all sections\n` +
      `6. About page\n` +
      `7. Services/Features pages\n` +
      `8. Contact page + form with email notification\n\n` +
      `PHASE 3 — Features (Days 8-12)\n` +
      `9. Implement each selected feature module\n` +
      `10. Admin panel / CMS\n` +
      `11. Database models and API routes\n\n` +
      `PHASE 4 — Quality (Days 13-14)\n` +
      `12. SEO: metadata, structured data, sitemap\n` +
      `13. Accessibility: axe audit, keyboard testing\n` +
      `14. Performance: Lighthouse audit, image optimisation\n` +
      `15. Security: headers, rate limiting, input validation\n` +
      `16. Analytics: GA4 setup, conversion event tracking`;
  }

  _roiSection() {
    const goals = this.d.businessGoals || [];
    const type  = this.d.projectType;
    let s = '';

    if (goals.includes('Lead Generation') || type === 'company-website') {
      s += `Lead Generation\n`;
      s += `  A well-optimised contact form with clear CTAs typically converts 2-5% of visitors.\n`;
      s += `  At 1,000 monthly visitors, that is 20-50 qualified leads per month.\n\n`;
    }
    if (goals.includes('E-Commerce Sales') || type === 'ecommerce') {
      s += `E-Commerce Revenue\n`;
      s += `  Conversion rate optimisation can improve sales conversion by 20-40%.\n`;
      s += `  Faster load times (1s improvement) → ~7% increase in conversions (Google data).\n\n`;
    }
    s += `Brand & Trust\n`;
    s += `  88% of consumers research online before contacting a business (BrightLocal).\n`;
    s += `  A premium digital presence directly impacts close rates from inbound leads.\n\n`;
    s += `SEO Long-Term Value\n`;
    s += `  Organic search is the highest-ROI channel for most businesses.\n`;
    s += `  Pages take 3-6 months to rank — starting now means results in Q2/Q3.\n`;

    return s;
  }

  _nextSteps() {
    return `Immediate priorities after handover:\n\n` +
      `1. Domain & SSL (Day 1)\n` +
      `   Point DNS to hosting platform. Verify SSL certificate active.\n\n` +
      `2. Google Search Console (Day 1)\n` +
      `   Verify domain ownership. Submit sitemap.xml.\n\n` +
      `3. Analytics (Day 1)\n` +
      `   Verify GA4 is firing on production. Confirm conversion events.\n\n` +
      `4. Content (Week 1)\n` +
      `   Review and finalise all copy. Add real team photos. Replace placeholder images.\n\n` +
      `5. First Blog Posts (Week 2)\n` +
      `   Publish 2 SEO-targeted articles to begin building organic presence.\n\n` +
      `6. Google Business Profile (Week 1)\n` +
      `   Claim and optimise for local search (if applicable).`;
  }
}
