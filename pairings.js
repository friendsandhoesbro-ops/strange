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

// ── Selection analysis knowledge bases (goals + features) ─────────────────────
// SMART COMBINATIONS: both picked → they reinforce each other. [a, b, why]
const SYNERGY_RULES = [
  ['Payments & Billing', 'Subscription Management', 'recurring billing is powered by the payment engine'],
  ['User Accounts & Auth', 'Two-Factor Auth', 'accounts plus 2FA make logins genuinely secure'],
  ['User Accounts & Auth', 'Social Login (OAuth)', 'social login makes signing into accounts effortless'],
  ['Blog / Content Hub', 'CMS (Content Management)', 'publish and edit your own content, no developer needed'],
  ['Lead Generation', 'Email Marketing Integration', 'capture leads AND nurture them automatically'],
  ['Brand Authority', 'Blog / Content Hub', 'authority is built and proven through published content'],
  ['Thought Leadership / Content', 'Blog / Content Hub', 'your content goal needs a place to publish'],
  ['Appointment Booking', 'Booking System', 'the goal and the exact tool that delivers it'],
  ['E-Commerce Sales', 'Payments & Billing', 'so you can actually take the money'],
  ['E-Commerce Sales', 'Review & Rating System', 'reviews lift product conversion and trust'],
  ['Newsletter / Subscriber Growth', 'Email Marketing Integration', 'the goal and its engine, perfectly matched'],
  ['Admin Dashboard', 'Role-Based Access Control', 'control exactly who on your team can do what'],
  ['Support Deflection', 'AI Chatbot / Copilot', 'deflect repetitive questions 24/7 automatically'],
  ['International Markets', 'Multi-language / i18n', 'serve overseas buyers in their own language'],
  ['Booking System', 'Notifications (Email/SMS/Push)', 'automatic reminders dramatically cut no-shows'],
  ['Payments & Billing', 'Affiliate Programme', 'pay partner commissions automatically'],
  ['Customer Retention', 'Email Marketing Integration', 'loyalty and win-back emails keep customers coming back'],
  ['Customer Portal', 'User Accounts & Auth', 'a private portal runs on secure logins'],
  ['CRM Integration', 'Email Marketing Integration', 'captured leads flow straight into nurture campaigns'],
];

// PREREQUISITES: you picked a feature that needs another feature. [need, requires, why]
const PREREQ_RULES = [
  ['Subscription Management', 'Payments & Billing', 'subscriptions need a way to charge cards'],
  ['Two-Factor Auth', 'User Accounts & Auth', '2FA sits on top of user accounts'],
  ['Social Login (OAuth)', 'User Accounts & Auth', 'social login is a way INTO user accounts'],
  ['Role-Based Access Control', 'User Accounts & Auth', 'roles only apply to logged-in users'],
  ['Affiliate Programme', 'Payments & Billing', 'you need a way to pay commissions out'],
  ['Customer Portal', 'User Accounts & Auth', 'a portal requires a login to work'],
  ['Audit Logs', 'Admin Dashboard', 'logs need an admin area to be viewed in'],
];

// GOAL NEEDS A FEATURE: you picked a goal but not the feature that delivers it. [goal, feature, why]
const GOAL_FEATURE_RULES = [
  ['E-Commerce Sales', 'Payments & Billing', "you can't sell online without taking payment"],
  ['Appointment Booking', 'Booking System', 'the booking goal needs an actual booking tool'],
  ['Newsletter / Subscriber Growth', 'Email Marketing Integration', 'growing a list needs an email tool to manage it'],
  ['International Markets', 'Multi-language / i18n', 'international buyers expect their own language'],
  ['Support Deflection', 'AI Chatbot / Copilot', 'deflecting support needs self-serve answers'],
  ['Upselling / Cross-selling', 'Payments & Billing', 'upsells and cross-sells happen at checkout'],
];

// CONTRADICTIONS: both picked but they pull against each other. [a, b, why, fix]
const CONFLICT_RULES = [
  ['Support Deflection', 'Live Chat', 'one goal reduces human support load, the other adds a human support channel — they can work against each other', 'Keep both only if Live Chat is aimed at sales, not general support. Otherwise the chatbot alone handles deflection.'],
  ['Investor Relations', 'E-Commerce Sales', 'an investor-focused site and a shopping site speak to opposite audiences in opposite tones', 'Choose the primary purpose; the other belongs on its own page, not competing on the homepage.'],
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

  // ── Selection analysis: synergies, missing prerequisites, contradictions ────
  const goalsList = () => fd().businessGoals || [];
  const picked = (label) => goalsList().includes(label) || selected().includes(label);

  // Pairs of the user's OWN picks that reinforce each other
  function synergies() {
    return SYNERGY_RULES
      .filter(([a, b]) => picked(a) && picked(b))
      .map(([a, b, why]) => ({ a, b, why }))
      .slice(0, 5);
  }

  // Picks that need another feature to actually work (prereqs + goal→feature gaps)
  function needs() {
    const feats = selected(), goals = goalsList(), out = [], seen = new Set();
    PREREQ_RULES.forEach(([need, req, why]) => {
      if (feats.includes(need) && !feats.includes(req) && !seen.has(req)) {
        out.push({ trigger: need, add: req, why, kind: 'feature' }); seen.add(req);
      }
    });
    GOAL_FEATURE_RULES.forEach(([goal, feat, why]) => {
      if (goals.includes(goal) && !feats.includes(feat) && !seen.has(feat)) {
        out.push({ trigger: goal, add: feat, why, kind: 'goal' }); seen.add(feat);
      }
    });
    return out.filter(n => FEATURES.includes(n.add)).slice(0, 5);
  }

  // Picks that pull against each other (+ a "too many goals" check)
  function conflicts() {
    const out = [];
    CONFLICT_RULES.forEach(([a, b, why, fix]) => {
      if (picked(a) && picked(b)) {
        const removable = selected().includes(b) ? b : (selected().includes(a) ? a : null);
        out.push({ a, b, why, fix, removable });
      }
    });
    if (goalsList().length > 3) out.push({ tooMany: true, count: goalsList().length });
    return out;
  }

  function noteLearning(kind) {
    try { if (typeof LearningCapture !== 'undefined') LearningCapture.record({ event: 'resolve', field: kind }); } catch (e) {}
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

  const esc = s => String(s).replace(/"/g, '&quot;');

  function render() {
    const c = ensureContainer();
    if (!c) return;
    const list = suggestions();
    const mm   = mismatches();
    const syn  = synergies();
    const nd   = needs();
    const cf   = conflicts();
    if (!list.length && !mm.length && !syn.length && !nd.length && !cf.length) {
      c.style.display = 'none'; c.innerHTML = ''; return;
    }

    const typeLabel = labelForType(fd().projectType);
    let html = '';

    // 1. Smart combinations among the user's OWN picks (positive, teaches)
    if (syn.length) {
      html += `
      <div class="pair-suggest-head pair-synergy-head">
        <span class="pair-spark">✓</span>
        Smart combinations in your build
      </div>
      <div class="pair-list">
        ${syn.map(s => `
          <div class="pair-chip pair-chip-synergy">
            <span class="pair-add pair-good">✓</span>
            <span class="pair-text">
              <span class="pair-name">${s.a} + ${s.b}</span>
              <span class="pair-why">${s.why}</span>
            </span>
          </div>`).join('')}
      </div>`;
    }

    // 2. Contradictions / tensions in the user's picks (explained, with a fix)
    if (cf.length) {
      html += `
      <div class="pair-suggest-head pair-conflict-head">
        <span class="pair-spark">⚠️</span>
        These may contradict — worth a look
      </div>
      <div class="pair-list">
        ${cf.map(c2 => c2.tooMany
          ? `<div class="pair-chip pair-chip-conflict">
               <span class="pair-add pair-warn">!</span>
               <span class="pair-text">
                 <span class="pair-name">You've picked ${c2.count} goals</span>
                 <span class="pair-why">A site that chases every goal converts poorly. Pick 1–2 primary goals and let the rest be secondary. <a class="pair-link" data-goto="3">Review goals</a></span>
               </span>
             </div>`
          : `<div class="pair-chip pair-chip-conflict" ${c2.removable ? `data-remove="${esc(c2.removable)}"` : ''}>
               <span class="pair-add ${c2.removable ? 'pair-remove' : 'pair-warn'}">${c2.removable ? '–' : '!'}</span>
               <span class="pair-text">
                 <span class="pair-name">${c2.a} &nbsp;vs&nbsp; ${c2.b}</span>
                 <span class="pair-why">${c2.why}. <b>Fix:</b> ${c2.fix}${c2.removable ? ` <em>Tap to remove ${c2.removable}.</em>` : ''}</span>
               </span>
             </div>`).join('')}
      </div>`;
    }

    // 3. Missing prerequisites / goal needs a feature (actionable: add it)
    if (nd.length) {
      html += `
      <div class="pair-suggest-head pair-need-head">
        <span class="pair-spark">➕</span>
        Add these to make your picks work
      </div>
      <div class="pair-list">
        ${nd.map(n => `
          <button class="pair-chip" data-feature="${esc(n.add)}">
            <span class="pair-add">+</span>
            <span class="pair-text">
              <span class="pair-name">${n.add}</span>
              <span class="pair-why">Your <b>${n.trigger}</b> ${n.kind === 'goal' ? 'goal' : 'feature'} needs this — ${n.why}.</span>
            </span>
            <span class="pair-tag pair-tag-need">needed</span>
          </button>`).join('')}
      </div>`;
    }

    // 4. (existing) complementary add-on suggestions
    if (list.length) {
      html += `
      <div class="pair-suggest-head">
        <span class="pair-spark">✨</span>
        Works well together — based on your project and picks
      </div>
      <div class="pair-list">
        ${list.map(s => `
          <button class="pair-chip" data-feature="${esc(s.feature)}">
            <span class="pair-add">+</span>
            <span class="pair-text">
              <span class="pair-name">${s.feature}</span>
              <span class="pair-why">${s.why}</span>
            </span>
            <span class="pair-tag">pairs with ${s.pairsWith[0]}${s.pairsWith.length > 1 ? ` +${s.pairsWith.length - 1}` : ''}</span>
          </button>`).join('')}
      </div>`;
    }

    // 5. (existing) features that don't fit the project type
    if (mm.length) {
      html += `
      <div class="pair-suggest-head pair-review-head">
        <span class="pair-spark">⚠️</span>
        May not be needed for a ${typeLabel}
      </div>
      <div class="pair-list">
        ${mm.map(f => `
          <button class="pair-chip pair-chip-review" data-remove="${esc(f)}">
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
        if (ch && !ch.classList.contains('selected')) { ch.click(); noteLearning('add'); }  // reuse toggle flow
        render();
      }));

    c.querySelectorAll('.pair-chip[data-remove]').forEach(btn =>
      btn.addEventListener('click', () => {
        const ch = chipFor(btn.dataset.remove);
        if (ch && ch.classList.contains('selected')) { ch.click(); noteLearning('remove'); } // deselect
        render();
      }));

    c.querySelectorAll('[data-goto]').forEach(el =>
      el.addEventListener('click', () => { if (typeof goToStep === 'function') goToStep(+el.dataset.goto); }));
  }

  let booted = false;
  function boot() {
    if (booted) return;
    const grid = document.getElementById('featuresGrid');
    if (!grid) return;
    booted = true;
    ensureContainer();
    grid.addEventListener('click', () => render());   // refresh on any feature change
    // Also refresh when the user arrives at the Features step (goals may have changed)
    if (typeof window.goToStep === 'function') {
      const orig = window.goToStep;
      window.goToStep = function (n) { orig.apply(this, arguments); if (n === 4) { try { render(); } catch (e) {} } };
    }
    render();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(boot, 0);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  }
  window.addEventListener('load', boot); // safety net regardless of script order

  return { render, suggestions, synergies, needs, conflicts };
})();
