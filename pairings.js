// ══════════════════════════════════════════════════════════════════════════════
// FEATURE PAIRINGS — "works well together" hints on Step 4.
// Additive only: listens to selections in #featuresGrid and suggests complementary
// features below the grid. Touches no render logic, toggleChip, or state shape.
// One click on a suggestion selects the real chip (reusing the existing flow).
// ══════════════════════════════════════════════════════════════════════════════

// Each key is a feature label (exactly as in FEATURES). Each suggestion names a
// complementary feature and a plain-English reason they pair well.
const FEATURE_PAIRINGS = {
  'Payments & Billing': [
    { feature: 'Subscription Management',           why: 'charge customers automatically on repeating plans' },
    { feature: 'User Accounts & Auth',              why: 'let customers log in to pay and track their orders' },
    { feature: 'Notifications (Email/SMS/Push)',    why: 'send instant payment confirmations and receipts' },
  ],
  'Subscription Management': [
    { feature: 'Payments & Billing',                why: 'the engine that actually takes the recurring payment' },
    { feature: 'User Accounts & Auth',              why: 'members log in to manage their plan' },
    { feature: 'Email Marketing Integration',       why: 'send renewal reminders and win-back emails' },
  ],
  'Booking System': [
    { feature: 'Notifications (Email/SMS/Push)',    why: 'automatic reminders cut down on no-shows' },
    { feature: 'Payments & Billing',                why: 'take a deposit or full payment at booking' },
    { feature: 'Maps & Location',                   why: 'show customers exactly where to come' },
  ],
  'User Accounts & Auth': [
    { feature: 'Two-Factor Auth',                   why: 'adds a second security step to protect accounts' },
    { feature: 'Social Login (OAuth)',              why: 'lets people sign up fast with Google/Facebook' },
    { feature: 'Role-Based Access Control',         why: 'give admins, staff, and customers different access' },
  ],
  'Customer Portal': [
    { feature: 'User Accounts & Auth',              why: 'a portal needs a secure login to work' },
    { feature: 'Document Management',               why: 'share invoices, contracts, and files privately' },
    { feature: 'Notifications (Email/SMS/Push)',    why: 'alert customers when something changes' },
  ],
  'Blog / Content Hub': [
    { feature: 'CMS (Content Management)',          why: 'write and edit posts yourself without a developer' },
    { feature: 'Search & Filtering',                why: 'help readers find the right article fast' },
    { feature: 'Email Marketing Integration',       why: 'turn readers into email subscribers' },
  ],
  'CMS (Content Management)': [
    { feature: 'Blog / Content Hub',                why: 'gives you somewhere to publish your content' },
    { feature: 'File Upload / Media Library',       why: 'manage your images and downloads in one place' },
    { feature: 'Search & Filtering',                why: 'makes growing content easy to navigate' },
  ],
  'Admin Dashboard': [
    { feature: 'Role-Based Access Control',         why: 'control who on your team can see or change what' },
    { feature: 'Analytics & Reporting',             why: 'see performance and activity at a glance' },
    { feature: 'Audit Logs',                        why: 'keep a record of who did what, and when' },
  ],
  'Role-Based Access Control': [
    { feature: 'User Accounts & Auth',              why: 'roles need accounts to apply to' },
    { feature: 'Admin Dashboard',                   why: 'where you assign and manage those roles' },
    { feature: 'Audit Logs',                        why: 'track sensitive actions by each role' },
  ],
  'Review & Rating System': [
    { feature: 'User Accounts & Auth',              why: 'verified reviewers build more trust' },
    { feature: 'Notifications (Email/SMS/Push)',    why: 'automatically ask happy customers for a review' },
    { feature: 'Search & Filtering',                why: 'let shoppers sort by highest rated' },
  ],
  'Search & Filtering': [
    { feature: 'Review & Rating System',            why: 'sorting by rating helps buyers decide' },
    { feature: 'CMS (Content Management)',          why: 'keeps lots of content organised and findable' },
  ],
  'AI Chatbot / Copilot': [
    { feature: 'Live Chat',                         why: 'hand off to a real person when the bot is stuck' },
    { feature: 'Analytics & Reporting',             why: 'see the questions customers ask most' },
    { feature: 'Notifications (Email/SMS/Push)',    why: 'follow up on chats that need attention' },
  ],
  'Live Chat': [
    { feature: 'AI Chatbot / Copilot',              why: 'answer common questions 24/7 when staff are away' },
    { feature: 'CRM Integration',                   why: 'save every conversation against the customer' },
    { feature: 'Notifications (Email/SMS/Push)',    why: 'alert your team when a chat comes in' },
  ],
  'CRM Integration': [
    { feature: 'Email Marketing Integration',       why: 'nurture captured leads with automated emails' },
    { feature: 'Analytics & Reporting',             why: 'track which leads turn into customers' },
    { feature: 'Live Chat',                         why: 'log chat conversations against each contact' },
  ],
  'Email Marketing Integration': [
    { feature: 'CRM Integration',                   why: 'keep your contacts and emails in sync' },
    { feature: 'Blog / Content Hub',                why: 'gives you content worth emailing about' },
    { feature: 'Analytics & Reporting',             why: 'measure opens, clicks, and conversions' },
  ],
  'Document Management': [
    { feature: 'User Accounts & Auth',              why: 'control who can access sensitive files' },
    { feature: 'Customer Portal',                   why: 'a private home for customer documents' },
    { feature: 'Two-Factor Auth',                   why: 'extra protection for confidential documents' },
  ],
  'File Upload / Media Library': [
    { feature: 'CMS (Content Management)',          why: 'organise and reuse uploaded media easily' },
    { feature: 'Video / Media Player',              why: 'play the videos you upload' },
  ],
  'Video / Media Player': [
    { feature: 'File Upload / Media Library',       why: 'somewhere to store and manage your videos' },
    { feature: 'CMS (Content Management)',          why: 'add and swap videos without coding' },
  ],
  'Maps & Location': [
    { feature: 'Booking System',                    why: 'let customers find you and book a visit' },
    { feature: 'Notifications (Email/SMS/Push)',    why: 'send directions or arrival reminders' },
  ],
  'Notifications (Email/SMS/Push)': [
    { feature: 'Booking System',                    why: 'reminders dramatically reduce no-shows' },
    { feature: 'User Accounts & Auth',              why: 'send each user their own personalised alerts' },
  ],
  'Two-Factor Auth': [
    { feature: 'User Accounts & Auth',              why: '2FA sits on top of normal account logins' },
    { feature: 'Audit Logs',                        why: 'record sign-ins for extra security' },
  ],
  'Social Login (OAuth)': [
    { feature: 'User Accounts & Auth',              why: 'social login is one way users sign into accounts' },
  ],
  'Audit Logs': [
    { feature: 'Admin Dashboard',                   why: 'view the logs in one organised place' },
    { feature: 'Role-Based Access Control',         why: 'know exactly which role did each action' },
  ],
  'Analytics & Reporting': [
    { feature: 'Admin Dashboard',                   why: 'a home for your charts and reports' },
  ],
  'Affiliate Programme': [
    { feature: 'Payments & Billing',                why: 'pay out commissions to your partners' },
    { feature: 'Analytics & Reporting',             why: 'track which partners drive real sales' },
    { feature: 'Email Marketing Integration',       why: 'keep affiliates engaged and active' },
  ],
  'Project Management': [
    { feature: 'Document Management',               why: 'attach files and deliverables to each project' },
    { feature: 'Notifications (Email/SMS/Push)',    why: 'keep everyone updated on deadlines' },
    { feature: 'Role-Based Access Control',         why: 'control who can edit each project' },
  ],
  'ERP Integration': [
    { feature: 'CRM Integration',                   why: 'connect your sales and operations data' },
    { feature: 'API / Webhooks',                    why: 'the plumbing that links these systems together' },
    { feature: 'Admin Dashboard',                   why: 'manage the connected data in one place' },
  ],
  'API / Webhooks': [
    { feature: 'ERP Integration',                   why: 'a common reason to need APIs' },
    { feature: 'CRM Integration',                   why: 'sync data automatically with your CRM' },
  ],
  'Multi-language / i18n': [
    { feature: 'CMS (Content Management)',          why: 'manage each language’s content without code' },
    { feature: 'Search & Filtering',                why: 'help visitors find content in their language' },
  ],
};

// Features that over-complicate (or conflict with) a given project type — these are
// never SUGGESTED for that type, and are gently flagged if already selected.
const TYPE_AVOID = {
  'portfolio': [
    'User Accounts & Auth', 'Customer Portal', 'Payments & Billing', 'Subscription Management',
    'Admin Dashboard', 'Role-Based Access Control', 'Audit Logs', 'ERP Integration',
    'CRM Integration', 'API / Webhooks', 'Two-Factor Auth', 'Project Management', 'Affiliate Programme',
  ],
  'landing-page': [
    'User Accounts & Auth', 'Customer Portal', 'Subscription Management', 'Admin Dashboard',
    'Role-Based Access Control', 'Audit Logs', 'ERP Integration', 'CRM Integration',
    'API / Webhooks', 'Two-Factor Auth', 'Project Management', 'Affiliate Programme',
    'Document Management', 'Search & Filtering',
  ],
  'company-website': [
    'ERP Integration', 'Subscription Management', 'Affiliate Programme', 'Audit Logs',
    'Role-Based Access Control', 'API / Webhooks',
  ],
};

// Features inappropriate for a personal/individual site regardless of project type.
const INDIVIDUAL_AVOID = [
  'ERP Integration', 'Role-Based Access Control', 'Audit Logs', 'API / Webhooks',
  'Two-Factor Auth', 'Project Management', 'Admin Dashboard', 'Customer Portal', 'CRM Integration',
];

// ══════════════════════════════════════════════════════════════════════════════
const FeaturePairings = (() => {
  // `state` is a global lexical binding from app.js (a top-level const is NOT on
  // window, so reference it directly rather than via window.state).
  const fd = () => (typeof state !== 'undefined' && state.formData) ? state.formData : {};
  const selected = () => fd().features || [];

  const labelForType = (id) => {
    const t = (typeof PROJECT_TYPES !== 'undefined' ? PROJECT_TYPES : []).find(p => p.id === id);
    return t ? t.name : 'this kind of site';
  };

  // Set of features that don't fit the prior selections (project type + entity)
  function avoidSet() {
    const f = fd();
    const set = new Set(TYPE_AVOID[f.projectType] || []);
    if (f.entityType === 'individual') INDIVIDUAL_AVOID.forEach(x => set.add(x));
    return set;
  }

  // Already-selected features that don't fit — gently flagged for review
  function mismatches() {
    const avoid = avoidSet();
    if (!avoid.size) return [];
    return selected().filter(x => avoid.has(x));
  }

  function chipFor(name) {
    return [...document.querySelectorAll('#featuresGrid .chip')].find(ch => {
      const clone = ch.cloneNode(true);
      clone.querySelectorAll('.gloss-info').forEach(n => n.remove());
      return clone.textContent.trim() === name;
    });
  }

  function suggestions() {
    const chosen = selected();
    if (!chosen.length) return [];
    const avoid = avoidSet();                             // context: project type + entity
    const byFeature = {};
    chosen.forEach(f => {
      (FEATURE_PAIRINGS[f] || []).forEach(s => {
        if (chosen.includes(s.feature)) return;          // already selected
        if (!FEATURES.includes(s.feature)) return;        // must be a real option
        if (avoid.has(s.feature)) return;                 // doesn't fit the chosen project — skip
        if (!byFeature[s.feature]) {
          byFeature[s.feature] = { feature: s.feature, why: s.why, pairsWith: [f], score: 1 };
        } else {
          byFeature[s.feature].score++;
          byFeature[s.feature].pairsWith.push(f);
        }
      });
    });
    return Object.values(byFeature)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  function ensureContainer() {
    let c = document.getElementById('pairSuggest');
    if (c) return c;
    const grid = document.getElementById('featuresGrid');
    if (!grid) return null;
    c = document.createElement('div');
    c.id = 'pairSuggest';
    c.className = 'pair-suggest';
    c.style.display = 'none';
    grid.insertAdjacentElement('afterend', c);
    return c;
  }

  function render() {
    const c = ensureContainer();
    if (!c) return;
    const list = suggestions();
    const mm   = mismatches();
    if (!list.length && !mm.length) { c.style.display = 'none'; c.innerHTML = ''; return; }

    const typeLabel = labelForType(fd().projectType);
    let html = '';

    if (list.length) {
      html += `
      <div class="pair-suggest-head">
        <span class="pair-spark">✨</span>
        Works well together — based on your project and picks
      </div>
      <div class="pair-list">
        ${list.map(s => `
          <button class="pair-chip" data-feature="${s.feature.replace(/"/g, '&quot;')}">
            <span class="pair-add">+</span>
            <span class="pair-text">
              <span class="pair-name">${s.feature}</span>
              <span class="pair-why">${s.why}</span>
            </span>
            <span class="pair-tag">pairs with ${s.pairsWith[0]}${s.pairsWith.length > 1 ? ` +${s.pairsWith.length - 1}` : ''}</span>
          </button>`).join('')}
      </div>`;
    }

    if (mm.length) {
      html += `
      <div class="pair-suggest-head pair-review-head">
        <span class="pair-spark">⚠️</span>
        May not be needed for a ${typeLabel}
      </div>
      <div class="pair-list">
        ${mm.map(f => `
          <button class="pair-chip pair-chip-review" data-remove="${f.replace(/"/g, '&quot;')}">
            <span class="pair-add pair-remove">–</span>
            <span class="pair-text">
              <span class="pair-name">${f}</span>
              <span class="pair-why">Usually unnecessary for a ${typeLabel} — it adds complexity that can confuse the build and cause errors. Tap to remove.</span>
            </span>
          </button>`).join('')}
      </div>`;
    }

    c.style.display = 'block';
    c.innerHTML = html;

    c.querySelectorAll('.pair-chip[data-feature]').forEach(btn =>
      btn.addEventListener('click', () => {
        const ch = chipFor(btn.dataset.feature);
        if (ch && !ch.classList.contains('selected')) ch.click();   // reuse existing toggle flow
        render();
      }));

    c.querySelectorAll('.pair-chip[data-remove]').forEach(btn =>
      btn.addEventListener('click', () => {
        const ch = chipFor(btn.dataset.remove);
        if (ch && ch.classList.contains('selected')) ch.click();    // deselect via existing flow
        render();
      }));
  }

  function boot() {
    const grid = document.getElementById('featuresGrid');
    if (!grid) return;
    ensureContainer();
    // After any selection change in the grid, refresh suggestions.
    grid.addEventListener('click', () => render());
    render();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(boot, 0);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  }
  window.addEventListener('load', boot); // safety net regardless of script order

  return { render, suggestions };
})();
