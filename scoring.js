// ══════════════════════════════════════════════════════════════════════════════
// SCORING ENGINE
// ══════════════════════════════════════════════════════════════════════════════
class ScoringEngine {
  constructor(data) {
    this.d = data;
  }

  calculateAll() {
    const scores = {
      business:      this._scoreBusiness(),
      seo:           this._scoreSEO(),
      security:      this._scoreSecurity(),
      accessibility: this._scoreAccessibility(),
      scalability:   this._scoreScalability(),
      enterprise:    this._scoreEnterprise(),
    };
    // The engine auto-improves every score to enterprise standard (≥92) in the prompt
    // These displayed scores reflect the INPUT completeness + inherent output quality
    const raw = Object.values(scores).reduce((a, b) => a + b, 0) / 6;
    scores.overall = Math.round(raw);
    return scores;
  }

  _scoreBusiness() {
    const d = this.d;
    let s = 50; // base: prompt always includes business strategy section
    if (d.businessName)             s += 6;
    if (d.industry)                 s += 6;
    if ((d.description || '').length > 80) s += 8;
    if ((d.description || '').length > 200) s += 4;
    if (d.targetMarket)             s += 5;
    if (d.revenueModel)             s += 7;
    if (d.brandPositioning)         s += 4;
    if (d.competitors)              s += 5;
    if ((d.businessGoals || []).length >= 2) s += 5;
    if (d.projectType)              s += 6;
    // Always auto-improved — cap display at 97
    return Math.min(s, 97);
  }

  _scoreSEO() {
    const d = this.d;
    let s = 60; // base: SEO section always generated
    if (d.country)              s += 8;
    if (d.services || d.products) s += 7;
    if ((d.features || []).includes('Blog / Content Hub')) s += 8;
    if ((d.features || []).includes('CMS (Content Management)')) s += 5;
    if (d.industry)             s += 6;
    if (d.targetMarket)         s += 6;
    return Math.min(s, 97);
  }

  _scoreSecurity() {
    const d = this.d;
    const f = d.features || [];
    let s = 55; // base: security section always generated
    if ((d.compliance || []).some(c => ['gdpr','hipaa','soc2','pci','iso27001'].includes(c))) s += 12;
    if (f.includes('User Accounts & Auth'))   s += 8;
    if (f.includes('Two-Factor Auth'))        s += 6;
    if (f.includes('Role-Based Access Control')) s += 6;
    if (f.includes('Audit Logs'))             s += 5;
    if (f.includes('Payments & Billing'))     s += 4; // adds PCI section
    if (d.projectType === 'medical')          s += 6;
    if (d.projectType === 'saas')             s += 4;
    return Math.min(s, 97);
  }

  _scoreAccessibility() {
    const d = this.d;
    let s = 72; // base: WCAG section always generated
    if ((d.compliance || []).includes('wcag')) s += 14;
    if (d.projectType === 'medical')           s += 6;
    if ((d.businessGoals || []).includes('Recruitment / Talent Attraction')) s += 5;
    return Math.min(s, 97);
  }

  _scoreScalability() {
    const d = this.d;
    const f = d.features || [];
    let s = 60; // base: deployment/future expansion always generated
    if (d.useRecommended)                  s += 10;
    if (d.hosting)                         s += 5;
    if (f.includes('API / Webhooks'))      s += 8;
    if (f.includes('Analytics & Reporting')) s += 5;
    if (f.includes('Role-Based Access Control')) s += 5;
    if (d.projectType === 'saas' || d.projectType === 'marketplace') s += 9;
    if ((d.compliance || []).length > 1)   s += 5;
    return Math.min(s, 97);
  }

  _scoreEnterprise() {
    const d = this.d;
    const f = d.features || [];
    let s = 55; // base: enterprise spec always generated
    if (f.includes('Admin Dashboard'))       s += 8;
    if (f.includes('Audit Logs'))            s += 6;
    if (f.includes('Analytics & Reporting')) s += 5;
    if (f.includes('Role-Based Access Control')) s += 6;
    if ((d.compliance || []).length >= 1 && !(d.compliance || []).includes('none')) s += 8;
    if (d.useRecommended)                    s += 5;
    if ((d.businessGoals || []).length >= 3) s += 4;
    if ((d.features || []).length >= 6)      s += 5;
    return Math.min(s, 97);
  }
}

// ── CTO MODE: Generate critical findings ─────────────────────────────────────
function generateCTOFindings(data) {
  const findings = [];
  const f = data.features || [];
  const c = data.compliance || [];

  if (!f.includes('User Accounts & Auth') && (data.projectType === 'saas' || data.projectType === 'marketplace')) {
    findings.push({ icon: '🔐', title: 'Missing Authentication Architecture', desc: 'A SaaS or marketplace without clearly defined user authentication is a critical gap. Specify multi-tenant auth, role separation, and session management before development begins.' });
  }
  if (!f.includes('Audit Logs') && (f.includes('Admin Dashboard') || data.projectType === 'saas')) {
    findings.push({ icon: '📋', title: 'No Audit Trail Specified', desc: 'Enterprise deployments require a complete audit log of all admin actions. Without this, you cannot meet SOC 2, GDPR accountability requirements, or diagnose security incidents.' });
  }
  if (!c.includes('gdpr') && (data.country?.toLowerCase().includes('uk') || data.country?.toLowerCase().includes('eu') || data.country?.toLowerCase().includes('europe'))) {
    findings.push({ icon: '⚖️', title: 'GDPR Not Selected for EU/UK Operation', desc: 'Your country indicates EU/UK operations but GDPR compliance was not selected. This is a legal requirement, not optional. Fines can reach €20M or 4% of global annual turnover.' });
  }
  if (!f.includes('Payments & Billing') && (data.projectType === 'ecommerce' || data.projectType === 'saas' || data.projectType === 'marketplace')) {
    findings.push({ icon: '💳', title: 'No Payment Architecture Defined', desc: `A ${data.projectType} without payment specification suggests this was overlooked. Define the full payment flow, Stripe integration, webhook handling, and refund process before build.` });
  }
  if (!f.includes('Analytics & Reporting') && data.businessGoals?.includes('Lead Generation')) {
    findings.push({ icon: '📊', title: 'Lead Generation Without Conversion Tracking', desc: 'You listed Lead Generation as a goal but have not specified analytics. Without conversion tracking, you cannot measure or optimise lead generation performance. Add GA4 + conversion events.' });
  }
  if ((data.description || '').length < 100) {
    findings.push({ icon: '✏️', title: 'Thin Business Description Reduces Prompt Specificity', desc: 'Your business description is brief. A more detailed description allows the prompt engine to generate industry-specific personas, SEO keywords, and conversion language. Consider expanding.' });
  }
  if (!f.includes('Role-Based Access Control') && f.includes('Admin Dashboard')) {
    findings.push({ icon: '👥', title: 'Admin Dashboard Without RBAC', desc: 'An admin panel with no role separation creates a security risk — all admins have the same power. Specify roles (Super Admin, Editor, Viewer) and implement least-privilege access.' });
  }
  if (!data.competitors) {
    findings.push({ icon: '🏆', title: 'No Competitive Analysis Context', desc: 'Without knowing your competitors, the prompt engine cannot generate differentiation strategies or competitive positioning. Add 2-3 competitors to sharpen your positioning language.' });
  }

  return findings;
}

// ── Audit Checklist ───────────────────────────────────────────────────────────
function generateAuditChecklist(data) {
  const f = data.features || [];
  const c = data.compliance || [];

  return [
    {
      icon: '🔒', name: 'Security',
      items: [
        'Security headers (CSP, HSTS, X-Frame-Options) verified in browser',
        'All forms: server-side validation confirmed',
        'Rate limiting active on auth and contact endpoints',
        'No API keys or secrets in client-side code or source control',
        'SSL certificate valid, auto-renewal configured',
        ...(f.includes('User Accounts & Auth')    ? ['Brute-force lockout tested (5 attempts)'] : []),
        ...(f.includes('Payments & Billing')       ? ['Stripe webhook signatures verified'] : []),
        ...(f.includes('File Upload / Media Library') ? ['File upload MIME type validation confirmed'] : []),
      ]
    },
    {
      icon: '🔍', name: 'SEO',
      items: [
        'Sitemap.xml accessible and submitted to Google Search Console',
        'Robots.txt verified — not blocking critical pages',
        'All pages have unique title tags and meta descriptions',
        'Structured data validated via Google Rich Results Test',
        'No broken internal links (Screaming Frog or Ahrefs audit)',
        'Core Web Vitals: all green in Google Search Console',
        'Google Analytics 4 verified firing on all pages',
      ]
    },
    {
      icon: '♿', name: 'Accessibility',
      items: [
        'axe DevTools: zero critical violations on all key pages',
        'Keyboard navigation: full site navigable without mouse',
        'Colour contrast verified: ≥4.5:1 for body text',
        'All images have appropriate alt text',
        'Form labels associated with all inputs',
        'Focus states visible on all interactive elements',
        ...(c.includes('wcag') ? ['Formal WCAG 2.1 AA audit report completed'] : []),
      ]
    },
    {
      icon: '⚡', name: 'Performance',
      items: [
        'Lighthouse Performance ≥90 on homepage and key landing page',
        'LCP <2.5s verified in field data (CrUX)',
        'All images in WebP format with correct dimensions',
        'No render-blocking resources in critical path',
        'JavaScript bundles under 200KB each',
        'CDN active for all static assets',
      ]
    },
    {
      icon: '📋', name: 'Compliance',
      items: [
        'Privacy Policy linked from footer of every page',
        'Terms of Use / Terms of Service accessible',
        ...(c.includes('gdpr') ? ['Cookie consent banner functional, granular opt-in/out tested', 'Data Subject Rights form accessible', 'DPAs signed with all EU data processors'] : []),
        ...(c.includes('hipaa') ? ['BAAs signed with all vendors handling PHI', 'PHI encryption verified at rest and in transit'] : []),
        ...(c.includes('pci')   ? ['Stripe Elements confirmed — no raw card data on servers'] : []),
        'Accessibility statement page published',
      ]
    },
    {
      icon: '🚀', name: 'Production Readiness',
      items: [
        'Sentry error tracking confirmed capturing errors in production',
        'Uptime monitoring active with < 5-minute alert response',
        'Daily database backup configured and tested (restore verified)',
        '404 and 500 error pages styled and branded',
        'All environment variables set in production hosting platform',
        'HTTP → HTTPS redirect confirmed',
        ...(f.includes('Admin Dashboard') ? ['Admin panel tested with each role type', 'Audit log capturing admin actions'] : []),
        'Analytics conversion events verified firing',
      ]
    },
  ];
}
