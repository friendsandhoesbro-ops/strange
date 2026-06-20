// ══════════════════════════════════════════════════════════════════════════════
// PLAIN-ENGLISH GLOSSARY — beginner help layer.
// Additive only: self-attaches a small "ⓘ" to every selectable option after load.
// Touches no render logic, no prompt engine, no intelligence layer.
// Clicking ⓘ explains: what it means · what it does for your site · pros · cons ·
// when to choose it. Built for users with zero coding/business background.
// ══════════════════════════════════════════════════════════════════════════════

const GLOSSARY = {
  // ── Concepts (reached via "See also" and field labels) ──────────────────────
  seo: {
    term: 'SEO (Search Engine Optimisation)',
    simple: 'Helping your website show up on Google when people search.',
    does: 'Structures your pages, words, and code so search engines can find and rank you — bringing free visitors who are already looking for what you offer.',
    pros: ['Free, ongoing traffic', 'Reaches people actively searching for you', 'Builds long-term trust'],
    cons: ['Takes weeks to months to work', 'Needs fresh content regularly', 'Results are not guaranteed'],
    chooseIf: 'You want customers to find you on Google without paying for ads.',
    seeAlso: ['analytics', 'blog'],
  },
  cta: {
    term: 'CTA (Call To Action)',
    simple: 'The button or link you most want visitors to click.',
    does: 'Guides visitors toward one clear next step — "Get a Quote", "Book Now", "Buy" — instead of leaving them unsure what to do.',
    pros: ['More enquiries and sales', 'Gives visitors a clear journey'],
    cons: ['Too many competing CTAs confuse people'],
    chooseIf: 'Always — every page needs one obvious action.',
    seeAlso: ['conversion'],
  },
  conversion: {
    term: 'Conversion',
    simple: 'When a visitor does what you want them to — buys, books, or enquires.',
    does: 'Measures how well your site turns visitors into customers. "Conversion rate" = the percentage who take action.',
    chooseIf: 'This is the ultimate goal of almost every business website.',
    seeAlso: ['cta', 'leadGen'],
  },

  // ── Project types (Step 2) ──────────────────────────────────────────────────
  saas: {
    term: 'SaaS Platform (Software as a Service)',
    simple: 'Software people pay to use online, usually monthly.',
    does: 'Builds an app users log into and subscribe to — like Netflix or Canva, but yours.',
    pros: ['Recurring monthly income', 'Scales to many users at once'],
    cons: ['Complex to build and maintain', 'Needs logins, billing, and support'],
    chooseIf: 'You sell ongoing access to an online tool or service.',
    labels: ['saas platform'], seeAlso: ['subscription', 'authentication'],
  },
  crm: {
    term: 'CRM (Customer Relationship Management)',
    simple: 'A system that stores your customers and tracks every conversation and sale with them.',
    does: 'Keeps every lead, contact, and deal in one place so nothing slips through the cracks. (As a "CRM Integration", it connects your site to a CRM you already use.)',
    pros: ['Never lose a lead', 'See your whole sales pipeline', 'Follow up on time'],
    cons: ['Needs initial setup', 'Your team must keep it updated'],
    chooseIf: 'You manage many leads or customers and lose track in spreadsheets or WhatsApp.',
    labels: ['crm system', 'crm integration'],
  },
  erp: {
    term: 'ERP (Enterprise Resource Planning)',
    simple: 'One big system that runs the core of a business — stock, finance, staff, and orders together.',
    does: 'Connects departments so information flows automatically instead of living in separate apps.',
    pros: ['Everything in one place', 'Fewer manual errors'],
    cons: ['Expensive and complex', 'Overkill for small businesses'],
    chooseIf: 'You are a larger operation juggling inventory, finance, and HR.',
    labels: ['erp platform', 'erp integration'],
  },
  marketplace: {
    term: 'Marketplace',
    simple: 'A website where many sellers and many buyers meet — like Jumia or Airbnb.',
    does: 'Handles listings, payments between strangers, and trust features like reviews and verification.',
    pros: ['Earn commission on other people’s sales', 'Grows as its users grow'],
    cons: ['You need both buyers AND sellers to join', 'Trust and payments are complex'],
    chooseIf: 'You connect independent sellers with buyers and take a cut.',
    labels: ['marketplace'], seeAlso: ['payments'],
  },
  customerPortal: {
    term: 'Customer Portal',
    simple: 'A private, logged-in area for your existing customers.',
    does: 'Lets customers view their account, documents, orders, or support in one secure place.',
    pros: ['Fewer support calls', 'Customers self-serve 24/7'],
    cons: ['Requires secure logins', 'More to build'],
    chooseIf: 'Your customers need to check their own info, files, or status.',
    labels: ['customer portal'], seeAlso: ['authentication'],
  },
  mobileBackend: {
    term: 'Mobile App Backend',
    simple: 'The behind-the-scenes engine that powers a phone app.',
    does: 'Stores data, handles logins, and sends notifications for an iOS or Android app.',
    pros: ['Powers your mobile app', 'Syncs data across devices'],
    cons: ['Only needed if you have an app', 'Technical to run'],
    chooseIf: 'You have, or are building, a mobile app that needs to store data online.',
    labels: ['mobile app backend'],
  },
  analyticsDashboard: {
    term: 'Analytics Dashboard',
    simple: 'A screen full of charts showing how your business or product is doing.',
    does: 'Turns raw numbers into clear graphs and key figures you can act on.',
    pros: ['See performance at a glance', 'Spot problems early'],
    cons: ['Only as useful as the data behind it'],
    chooseIf: 'You need to monitor numbers, reports, or KPIs visually.',
    labels: ['analytics dashboard'],
  },
  internalTool: {
    term: 'Internal Tool',
    simple: 'Software only your team uses, not the public.',
    does: 'Replaces messy spreadsheets with a proper tool for your staff’s daily work.',
    pros: ['Saves staff time', 'Fewer mistakes'],
    cons: ['No direct sales or marketing value'],
    chooseIf: 'Your team needs a custom dashboard or workflow tool internally.',
    labels: ['internal tool'],
  },
  ecommerce: {
    term: 'E-Commerce Store',
    simple: 'A website that sells products online with a cart and checkout.',
    does: 'Shows products, takes payments, and manages stock and orders.',
    pros: ['Sell 24/7', 'Reach customers anywhere'],
    cons: ['Needs payment and delivery setup', 'Ongoing stock management'],
    chooseIf: 'You sell physical or digital products customers buy directly.',
    labels: ['e-commerce store'], seeAlso: ['payments'],
  },

  // ── Business goals (Step 3) ─────────────────────────────────────────────────
  leadGen: {
    term: 'Lead Generation',
    simple: 'Collecting the contact details of people interested in your business.',
    does: 'A "lead" is a potential customer. Your site captures their name, email, or phone via forms so you can follow up and sell.',
    pros: ['Steady stream of potential customers', 'Builds a contact list you own'],
    cons: ['You must follow up to turn leads into sales'],
    chooseIf: 'You sell services or higher-value items where customers enquire before buying.',
    labels: ['lead generation'], seeAlso: ['cta', 'conversion'],
  },
  brandAuthority: {
    term: 'Brand Authority',
    simple: 'Becoming known as a trusted expert in your field.',
    does: 'Content, proof, and polish make visitors trust you over competitors.',
    pros: ['Lets you charge higher prices', 'Wins deals on trust'],
    cons: ['Takes time and consistent content'],
    chooseIf: 'You want to stand out as the credible, premium choice.',
    labels: ['brand authority'], seeAlso: ['seo', 'thoughtLeadership'],
  },
  ecommSales: {
    term: 'E-Commerce Sales',
    simple: 'Selling products directly on your website.',
    does: 'Drives visitors to add items to a cart and check out.',
    chooseIf: 'Your main goal is online product sales.',
    labels: ['e-commerce sales'], seeAlso: ['ecommerce', 'payments'],
  },
  customerRetention: {
    term: 'Customer Retention',
    simple: 'Keeping the customers you already have.',
    does: 'Repeat customers cost far less than new ones; the site nurtures them with accounts, offers, or helpful content.',
    pros: ['Cheaper than finding new customers', 'Steady repeat income'],
    cons: ['Needs ongoing engagement'],
    chooseIf: 'Keeping existing customers matters as much as winning new ones.',
    labels: ['customer retention'],
  },
  recruitment: {
    term: 'Recruitment / Talent Attraction',
    simple: 'Attracting people to apply for jobs with you.',
    chooseIf: 'You are hiring and want strong applicants.',
    labels: ['recruitment / talent attraction'],
  },
  investorRelations: {
    term: 'Investor Relations',
    simple: 'Sharing information for current or potential investors.',
    does: 'Presents your story, traction, and reports to people who might fund you.',
    chooseIf: 'You need to attract or update investors.',
    labels: ['investor relations'],
  },
  communityBuilding: {
    term: 'Community Building',
    simple: 'Creating a space for your audience to connect and engage.',
    chooseIf: 'You want an engaged community around your brand.',
    labels: ['community building'],
  },
  appointmentBooking: {
    term: 'Appointment Booking',
    simple: 'Letting customers book a time slot online.',
    does: 'A calendar takes bookings 24/7 without back-and-forth phone calls.',
    chooseIf: 'You run on appointments or consultations.',
    labels: ['appointment booking'], seeAlso: ['booking'],
  },
  productDemos: {
    term: 'Product Demos',
    simple: 'Showing your product in action to convince buyers.',
    does: 'Demo videos, screenshots, or trials let visitors see the value before buying.',
    chooseIf: 'Your product is best understood by seeing it work.',
    labels: ['product demos'],
  },
  partnerAcq: {
    term: 'Partner / Reseller Acquisition',
    simple: 'Recruiting other businesses to sell or promote for you.',
    does: 'A section that pitches and signs up partners, dealers, or affiliates.',
    pros: ['Others sell on your behalf', 'Faster reach'],
    cons: ['You must manage partners'],
    chooseIf: 'You grow through dealers, resellers, or affiliates.',
    labels: ['partner / reseller acquisition'], seeAlso: ['affiliate'],
  },
  thoughtLeadership: {
    term: 'Thought Leadership / Content',
    simple: 'Publishing helpful articles or videos to build trust and traffic.',
    does: 'Regular content attracts visitors from Google and positions you as an expert.',
    pros: ['Free SEO traffic', 'Builds authority'],
    cons: ['Requires consistent writing'],
    chooseIf: 'You can share useful knowledge regularly.',
    labels: ['thought leadership / content'], seeAlso: ['seo', 'blog'],
  },
  eventReg: {
    term: 'Event Registrations',
    simple: 'Letting people sign up for your events.',
    chooseIf: 'You host events, webinars, or workshops.',
    labels: ['event registrations'],
  },
  newsletter: {
    term: 'Newsletter / Subscriber Growth',
    simple: 'Getting visitors to subscribe to your emails.',
    does: 'Builds an email list you own, so you can market to people again and again for free.',
    pros: ['A direct line to your audience', 'You own it — no algorithm in the way'],
    cons: ['You need to send emails regularly'],
    chooseIf: 'You want to stay in touch and market over time.',
    labels: ['newsletter / subscriber growth'], seeAlso: ['emailMarketing'],
  },
  appDownloads: {
    term: 'App Downloads',
    simple: 'Driving people to install your mobile app.',
    chooseIf: 'Your main goal is getting app installs.',
    labels: ['app downloads'],
  },
  supportDeflection: {
    term: 'Support Deflection',
    simple: 'Answering common questions automatically so your team handles fewer.',
    does: 'FAQs, help guides, or a chatbot solve repeat issues without a human.',
    pros: ['Less time on repetitive questions', 'Customers get instant answers'],
    cons: ['Needs good help content set up'],
    chooseIf: 'You get the same customer questions over and over.',
    labels: ['support deflection'], seeAlso: ['chatbot'],
  },
  upsell: {
    term: 'Upselling / Cross-selling',
    simple: 'Encouraging customers to buy more, or buy extras.',
    does: 'Suggests upgrades ("go premium") or related items ("add a case") at the right moment.',
    pros: ['More revenue per customer'],
    cons: ['Feels pushy if overdone'],
    chooseIf: 'You have add-ons, upgrades, or related products.',
    labels: ['upselling / cross-selling'],
  },
  geoExpansion: {
    term: 'Geographic Expansion',
    simple: 'Growing into new cities or regions.',
    does: 'Dedicated location pages and local SEO help you rank and convert in new areas.',
    chooseIf: 'You are expanding to new locations.',
    labels: ['geographic expansion'], seeAlso: ['seo'],
  },
  intlMarkets: {
    term: 'International Markets',
    simple: 'Selling to customers in other countries.',
    does: 'Multiple languages, currencies, and local trust signals serve overseas buyers.',
    pros: ['A much bigger market'],
    cons: ['Translation and localisation work'],
    chooseIf: 'You target customers abroad.',
    labels: ['international markets'], seeAlso: ['i18n'],
  },

  // ── Features (Step 4) ───────────────────────────────────────────────────────
  blog: {
    term: 'Blog / Content Hub',
    simple: 'A section for articles, news, or guides.',
    does: 'Regular posts bring Google traffic and show your expertise.',
    pros: ['Free SEO traffic', 'Builds trust'],
    cons: ['Needs ongoing writing'],
    chooseIf: 'You can publish helpful content regularly.',
    labels: ['blog / content hub'], seeAlso: ['seo', 'cms'],
  },
  cms: {
    term: 'CMS (Content Management System)',
    simple: 'A simple admin area to edit your website yourself — no coding.',
    does: 'Lets you change text, images, blog posts, or prices without paying a developer every time.',
    pros: ['Update your own site anytime', 'No developer needed for edits'],
    cons: ['A little more to set up', 'One more login to manage'],
    chooseIf: 'You want to edit your own content (services, blog, team) after launch.',
    labels: ['cms (content management)'], seeAlso: ['blog'],
  },
  adminDashboard: {
    term: 'Admin Dashboard',
    simple: 'A private control panel for you to run the site.',
    does: 'Manage orders, users, and content, and see activity — all in one place.',
    pros: ['Full control', 'See everything at a glance'],
    cons: ['Adds build complexity'],
    chooseIf: 'You need to manage data, users, or orders behind the scenes.',
    labels: ['admin dashboard'], seeAlso: ['rbac'],
  },
  userAuth: {
    term: 'User Accounts & Auth',
    simple: 'Letting visitors create accounts and log in.',
    does: '"Auth" means login security. It gives users private, personalised areas.',
    pros: ['Personalised experience', 'Saves each user’s data'],
    cons: ['You take on security responsibility', 'More to build'],
    chooseIf: 'Users need to log in to access their own content.',
    labels: ['user accounts & auth'], seeAlso: ['twoFactor', 'oauth'],
  },
  projectManagement: {
    term: 'Project Management',
    simple: 'Tools to track tasks, projects, or jobs through stages.',
    chooseIf: 'You manage projects or jobs with steps and deadlines.',
    labels: ['project management'],
  },
  analyticsReporting: {
    term: 'Analytics & Reporting',
    simple: 'Built-in charts showing how things are performing.',
    does: 'Track visitors, sales, or usage and export reports.',
    pros: ['Data-driven decisions'],
    cons: ['Numbers need interpreting'],
    chooseIf: 'You want figures and reports inside your own site.',
    labels: ['analytics & reporting'], seeAlso: ['analytics'],
  },
  chatbot: {
    term: 'AI Chatbot / Copilot',
    simple: 'An automated assistant that chats with your visitors.',
    does: 'Answers questions or guides users instantly, 24/7.',
    pros: ['Instant answers', 'Handles many people at once'],
    cons: ['Can frustrate if it cannot help', 'Needs setup and good content'],
    chooseIf: 'You get repetitive questions or want to offer instant help.',
    labels: ['ai chatbot / copilot'], seeAlso: ['supportDeflection'],
  },
  booking: {
    term: 'Booking System',
    simple: 'An online calendar for appointments or reservations.',
    does: 'Customers pick a slot and book themselves, day or night.',
    pros: ['Bookings 24/7', 'Fewer no-shows with reminders'],
    cons: ['Needs calendar setup'],
    chooseIf: 'You take appointments, tables, or reservations.',
    labels: ['booking system'],
  },
  payments: {
    term: 'Payments & Billing',
    simple: 'Taking money online via card or bank transfer.',
    does: 'Securely processes payments and, if needed, recurring billing.',
    pros: ['Get paid online instantly', 'Automate invoices'],
    cons: ['Small fee per transaction', 'Security rules apply (see PCI-DSS)'],
    chooseIf: 'You sell or charge customers online.',
    labels: ['payments & billing'], seeAlso: ['pci', 'subscription'],
  },
  emailMarketing: {
    term: 'Email Marketing Integration',
    simple: 'Connecting your site to email tools like Mailchimp.',
    does: 'Automatically adds subscribers and lets you send campaigns.',
    pros: ['Grow and market to a list', 'Automated follow-ups'],
    cons: ['The email tool may cost extra'],
    chooseIf: 'You collect emails and want to market to them.',
    labels: ['email marketing integration'], seeAlso: ['newsletter'],
  },
  liveChat: {
    term: 'Live Chat',
    simple: 'A chat box for real-time conversations with visitors.',
    does: 'Lets a person (or bot) answer visitors instantly.',
    pros: ['Catch leads in the moment'],
    cons: ['Someone must be available to reply'],
    chooseIf: 'You can staff live chats or use it for sales.',
    labels: ['live chat'],
  },
  documentManagement: {
    term: 'Document Management',
    simple: 'Storing and organising files customers or staff need.',
    chooseIf: 'You share contracts, reports, or downloads.',
    labels: ['document management'],
  },
  searchFiltering: {
    term: 'Search & Filtering',
    simple: 'Letting users search and narrow down lots of items.',
    does: 'Helps visitors find the right product or page fast.',
    pros: ['Much better experience with many items'],
    cons: ['Only needed when you have lots of content'],
    chooseIf: 'You have many products, listings, or articles.',
    labels: ['search & filtering'],
  },
  i18n: {
    term: 'Multi-language / i18n',
    simple: 'Showing your site in more than one language.',
    does: '"i18n" is shorthand for internationalisation — serving content per language or region.',
    pros: ['Reach non-English speakers', 'Better for global SEO'],
    cons: ['Translation work', 'More to maintain'],
    chooseIf: 'You serve customers in multiple languages.',
    labels: ['multi-language / i18n'], seeAlso: ['intlMarkets', 'seo'],
  },
  darkMode: {
    term: 'Dark Mode',
    simple: 'A dark colour theme option for the site.',
    does: 'Lets users switch to a darker, eye-friendly look.',
    pros: ['Modern feel', 'Easier on the eyes at night'],
    cons: ['A little extra design work'],
    chooseIf: 'Your audience expects a modern, app-like feel.',
    labels: ['dark mode'],
  },
  apiWebhooks: {
    term: 'API / Webhooks',
    simple: 'Ways for your site to talk to other software automatically.',
    does: 'Lets your site send and receive data with other tools (e.g. ping Slack when a sale happens).',
    pros: ['Automate between apps', 'Easy to extend later'],
    cons: ['Technical to set up'],
    chooseIf: 'You need to connect to other systems automatically.',
    labels: ['api / webhooks'],
  },
  rbac: {
    term: 'RBAC (Role-Based Access Control)',
    simple: 'Different permission levels for different users.',
    does: 'Controls who can see or do what — admin vs staff vs customer.',
    pros: ['Security and control', 'Limit access to sensitive areas'],
    cons: ['More setup'],
    chooseIf: 'Different people need different levels of access.',
    labels: ['role-based access control'], seeAlso: ['adminDashboard'],
  },
  auditLogs: {
    term: 'Audit Logs',
    simple: 'A record of who did what, and when.',
    does: 'Tracks every important action for security and accountability.',
    pros: ['Trace mistakes or fraud', 'Useful proof for compliance'],
    cons: ['Mostly for larger or regulated sites'],
    chooseIf: 'You need accountability or must meet compliance rules.',
    labels: ['audit logs'], seeAlso: ['soc2'],
  },
  fileUpload: {
    term: 'File Upload / Media Library',
    simple: 'Letting users (or you) upload images, videos, or files.',
    chooseIf: 'You handle lots of images, videos, or documents.',
    labels: ['file upload / media library'],
  },
  oauth: {
    term: 'Social Login (OAuth)',
    simple: 'Letting users sign in with Google, Facebook, etc.',
    does: '"OAuth" lets people log in using an account they already have — no new password to remember.',
    pros: ['Faster sign-up', 'Fewer forgotten passwords'],
    cons: ['Relies on third-party providers'],
    chooseIf: 'You want quick, easy sign-ups.',
    labels: ['social login (oauth)'], seeAlso: ['userAuth'],
  },
  twoFactor: {
    term: '2FA (Two-Factor Authentication)',
    simple: 'An extra security code on top of a password.',
    does: 'Asks for a second code (by SMS or app) so a stolen password alone is not enough.',
    pros: ['Much stronger account security'],
    cons: ['One extra step for users'],
    chooseIf: 'You store sensitive accounts or data.',
    labels: ['two-factor auth'], seeAlso: ['userAuth'],
  },
  notifications: {
    term: 'Notifications (Email/SMS/Push)',
    simple: 'Automatic alerts to users by email, text, or app.',
    does: 'Sends reminders, confirmations, or updates automatically.',
    pros: ['Keep users informed', 'Reduce no-shows'],
    cons: ['SMS messages may cost money'],
    chooseIf: 'Users need confirmations or reminders.',
    labels: ['notifications (email/sms/push)'],
  },
  maps: {
    term: 'Maps & Location',
    simple: 'Showing your location or nearby places on a map.',
    chooseIf: 'You have physical locations or location-based services.',
    labels: ['maps & location'],
  },
  video: {
    term: 'Video / Media Player',
    simple: 'Playing videos or audio on your site.',
    chooseIf: 'You showcase video or audio content.',
    labels: ['video / media player'],
  },
  reviews: {
    term: 'Review & Rating System',
    simple: 'Letting customers leave star ratings and reviews.',
    does: 'Social proof that builds trust and helps new buyers decide.',
    pros: ['Builds trust', 'Boosts conversions and SEO'],
    cons: ['Risk of negative reviews'],
    chooseIf: 'You want visible customer proof on your site.',
    labels: ['review & rating system'], seeAlso: ['conversion'],
  },
  affiliate: {
    term: 'Affiliate Programme',
    simple: 'Paying others a commission for sending you customers.',
    does: 'Tracks referrals and rewards partners for each sale they bring.',
    pros: ['Others market for you', 'You pay only for results'],
    cons: ['Tracking and payouts to manage'],
    chooseIf: 'You want a referral or commission sales channel.',
    labels: ['affiliate programme'], seeAlso: ['partnerAcq'],
  },
  subscription: {
    term: 'Subscription Management',
    simple: 'Charging customers automatically on a repeating plan.',
    does: 'Handles monthly or yearly plans, upgrades, and cancellations.',
    pros: ['Predictable recurring income'],
    cons: ['Billing and cancellations to manage'],
    chooseIf: 'You sell memberships or recurring plans.',
    labels: ['subscription management'], seeAlso: ['payments', 'saas'],
  },

  // ── Compliance (Step 6) ─────────────────────────────────────────────────────
  gdpr: {
    term: 'GDPR',
    simple: 'Europe’s data-privacy law.',
    does: 'Rules for handling EU residents’ personal data — consent, and the right to be deleted.',
    pros: ['Builds trust', 'Avoids large EU fines'],
    cons: ['Cookie consent and some paperwork'],
    chooseIf: 'You have any visitors or customers in the EU.',
    labels: ['gdpr'],
  },
  hipaa: {
    term: 'HIPAA',
    simple: 'US health-data privacy law.',
    does: 'Strict rules for protecting US patients’ medical information.',
    pros: ['Legal to handle US health data'],
    cons: ['Expensive and strict requirements'],
    chooseIf: 'You handle US patients’ health information.',
    labels: ['hipaa'],
  },
  soc2: {
    term: 'SOC 2',
    simple: 'A security trust certification for software companies.',
    does: 'Proves you handle customer data securely — often required by business clients.',
    pros: ['Wins enterprise clients’ trust'],
    cons: ['Costly audit process'],
    chooseIf: 'You sell software to businesses that demand security proof.',
    labels: ['soc 2'], seeAlso: ['auditLogs'],
  },
  pci: {
    term: 'PCI-DSS',
    simple: 'The security standard for handling card payments.',
    does: 'Required rules if your site touches credit or debit card data.',
    pros: ['Safe and legal to take card payments'],
    cons: ['Compliance overhead'],
    chooseIf: 'You process card payments directly.',
    labels: ['pci-dss'], seeAlso: ['payments'],
  },
  iso27001: {
    term: 'ISO 27001',
    simple: 'An international information-security standard.',
    does: 'A formal framework proving strong security management.',
    pros: ['Globally recognised trust'],
    cons: ['Lengthy certification'],
    chooseIf: 'You need internationally recognised security credentials.',
    labels: ['iso 27001'],
  },
  wcag: {
    term: 'WCAG 2.1 AA (Accessibility)',
    simple: 'A standard so people with disabilities can use your site.',
    does: 'Ensures your site works with screen readers and keyboards and has readable contrast.',
    pros: ['Reaches everyone', 'Often legally required', 'Better SEO too'],
    cons: ['Some extra design care'],
    chooseIf: 'You want an inclusive site — recommended for everyone.',
    labels: ['wcag 2.1 aa'], seeAlso: ['seo'],
  },
  ccpa: {
    term: 'CCPA',
    simple: 'California’s data-privacy law.',
    chooseIf: 'You have customers in California, USA.',
    labels: ['ccpa'],
  },
  pipeda: {
    term: 'PIPEDA',
    simple: 'Canada’s data-privacy law.',
    chooseIf: 'You handle Canadian customers’ data.',
    labels: ['pipeda'],
  },
  lgpd: {
    term: 'LGPD',
    simple: 'Brazil’s data-privacy law.',
    chooseIf: 'You have customers in Brazil.',
    labels: ['lgpd'],
  },
  ukdpa: {
    term: 'UK DPA 2018',
    simple: 'The UK’s data-protection law.',
    chooseIf: 'You have customers in the UK.',
    labels: ['uk dpa 2018'],
  },
  localRegs: {
    term: 'Local Regulations',
    simple: 'Privacy or business rules specific to your country.',
    chooseIf: 'Your country has its own data or business rules (e.g. Nigeria’s NDPR).',
    labels: ['local regs'],
  },
  standardOnly: {
    term: 'Standard Only',
    simple: 'No special legal framework — just solid security basics.',
    does: 'Applies sensible security best practices without a formal certification.',
    chooseIf: 'You do not fall under a specific regulation yet.',
    labels: ['standard only'],
  },

  // ── Field labels (Steps 1 & 5) ──────────────────────────────────────────────
  targetMarket: {
    term: 'Target Market',
    simple: 'The specific group of people you want as customers.',
    does: 'Knowing exactly who you serve shapes your site’s words, images, and tone.',
    chooseIf: 'Pick the closest match — it sharpens everything else.',
  },
  brandPositioning: {
    term: 'Brand Positioning',
    simple: 'How you want customers to see you compared with competitors.',
    does: 'Premium? Affordable? Expert? This sets your site’s whole personality.',
    chooseIf: 'Choose the perception you want to own in customers’ minds.',
  },
  revenueModel: {
    term: 'Revenue Model',
    simple: 'How your business actually makes money.',
    does: 'Whether you sell projects, products, or subscriptions changes how the site is built to convert.',
    chooseIf: 'Pick how money mainly comes in.',
    seeAlso: ['subscription', 'ecommerce'],
  },
  frontendFramework: {
    term: 'Frontend Framework',
    simple: 'The technology used to build what visitors see.',
    does: 'The "frontend" is the visible part of your site. Frameworks like Next.js make it fast and modern.',
    chooseIf: 'Not technical? Leave it on Recommended — it picks a great default.',
  },
  database: {
    term: 'Database',
    simple: 'Where your website stores its information.',
    does: 'Holds your users, orders, posts, and more.',
    chooseIf: 'Leave on Recommended unless you have a specific preference.',
  },
  hosting: {
    term: 'Hosting / Cloud',
    simple: 'The service that keeps your website online.',
    does: 'Like rent for your site’s home on the internet.',
    chooseIf: 'Leave on Recommended unless you already use a host.',
  },
  analytics: {
    term: 'Analytics',
    simple: 'Tools that measure your visitors and your Google (SEO) performance.',
    does: 'Shows how many people visit, where they come from, and what they do — so you can improve.',
    pros: ['Know what’s working', 'Improve over time'],
    cons: ['Some privacy/cookie considerations'],
    chooseIf: 'Almost always — you can’t improve what you don’t measure.',
    seeAlso: ['seo', 'gdpr'],
  },
  authentication: {
    term: 'Authentication',
    simple: 'The login and security system for user accounts.',
    does: 'Verifies who users are and keeps their accounts safe.',
    chooseIf: 'Needed if users log in. Leave on Recommended if unsure.',
    seeAlso: ['userAuth', 'twoFactor'],
  },
  fileStorage: {
    term: 'File Storage',
    simple: 'Where uploaded files, images, and videos are kept.',
    does: 'Cloud storage for media so your site stays fast.',
    chooseIf: 'Leave on Recommended unless you have a provider in mind.',
  },
  aiPlatform: {
    term: 'Target AI Platform',
    simple: 'Which AI website builder you’ll paste the final prompt into.',
    does: 'Each builder (Lovable, v0, Bolt, Claude Code...) has different strengths — the prompt is tuned to the one you pick.',
    chooseIf: 'Pick the tool you’ll actually build with. Not sure? "Universal" works everywhere.',
  },
};

// Field-label text (lowercased, no asterisk) → glossary id
const GLOSSARY_FIELDS = {
  'target market': 'targetMarket',
  'brand positioning': 'brandPositioning',
  'revenue model': 'revenueModel',
  'frontend framework': 'frontendFramework',
  'database': 'database',
  'cms': 'cms',
  'hosting / cloud': 'hosting',
  'analytics': 'analytics',
  'authentication': 'authentication',
  'file storage': 'fileStorage',
  'target ai platform': 'aiPlatform',
};

// ══════════════════════════════════════════════════════════════════════════════
const Glossary = (() => {
  const norm = s => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

  // Build a length-sorted index of chip/card labels → id
  const labelIndex = [];
  Object.keys(GLOSSARY).forEach(id => {
    (GLOSSARY[id].labels || []).forEach(l => labelIndex.push({ key: norm(l), id }));
  });
  labelIndex.sort((a, b) => b.key.length - a.key.length);

  const matchId = text => {
    const n = norm(text);
    for (const e of labelIndex) {
      if (n === e.key || n.startsWith(e.key + ' ') || n.startsWith(e.key)) return e.id;
    }
    return null;
  };

  function makeInfo(id, isCard) {
    const b = document.createElement('span');
    b.className = 'gloss-info' + (isCard ? ' gloss-info-card' : '');
    b.textContent = 'i';
    b.setAttribute('role', 'button');
    b.setAttribute('tabindex', '0');
    b.setAttribute('aria-label', 'What does this mean?');
    b.title = 'What does this mean?';
    const open = ev => { ev.stopPropagation(); ev.preventDefault(); Glossary.show(id); };
    b.addEventListener('click', open);
    b.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') open(ev); });
    return b;
  }

  function attachItem(el) {
    if (el.querySelector('.gloss-info')) return;
    const isCard = el.classList.contains('project-card');
    // Cards lead with an emoji icon, so match on the name element, not the whole card
    const text = isCard ? (el.querySelector('.project-name')?.textContent || '') : el.textContent;
    const id = matchId(text);
    if (!id) return;
    el.appendChild(makeInfo(id, isCard));
  }

  function attachField(label) {
    if (label.querySelector('.gloss-info')) return;
    const key = norm(label.textContent.replace('*', ''));
    const id = GLOSSARY_FIELDS[key];
    if (!id) return;
    label.appendChild(makeInfo(id, false));
  }

  function injectHints() {
    [2, 3, 4, 5, 6].forEach(n => {
      const panel = document.getElementById('step-' + n);
      if (!panel) return;
      const desc = panel.querySelector('.step-desc');
      if (!desc || (desc.nextElementSibling && desc.nextElementSibling.classList.contains('gloss-hint'))) return;
      const h = document.createElement('div');
      h.className = 'gloss-hint';
      h.innerHTML = 'New to some of these terms? Tap the <span class="gloss-hint-i">i</span> on any option for a plain-English explanation of what it means and when to use it.';
      desc.insertAdjacentElement('afterend', h);
    });
  }

  function decorate() {
    document.querySelectorAll('.chip').forEach(attachItem);
    document.querySelectorAll('.project-card').forEach(attachItem);
    document.querySelectorAll('.form-label').forEach(attachField);
    injectHints();
  }

  function close() {
    const ov = document.getElementById('glossOverlay');
    if (ov) ov.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  function show(id) {
    const g = GLOSSARY[id];
    if (!g) return;
    close();

    const list = (arr, cls, mark) =>
      arr && arr.length
        ? `<ul class="gloss-list ${cls}">${arr.map(x => `<li><span class="gloss-mark">${mark}</span>${x}</li>`).join('')}</ul>`
        : '';

    const seeAlso = (g.seeAlso || []).filter(s => GLOSSARY[s]);

    const ov = document.createElement('div');
    ov.className = 'gloss-overlay';
    ov.id = 'glossOverlay';
    ov.innerHTML = `
      <div class="gloss-modal" role="dialog" aria-label="${g.term}">
        <button class="gloss-close" aria-label="Close">&times;</button>
        <div class="gloss-term">${g.term}</div>
        <div class="gloss-simple">${g.simple}</div>
        ${g.does ? `<div class="gloss-block"><div class="gloss-h">What it does for your website</div><p>${g.does}</p></div>` : ''}
        ${(g.pros || g.cons) ? `
          <div class="gloss-proscons">
            ${g.pros ? `<div class="gloss-col"><div class="gloss-h gloss-h-pro">Pros</div>${list(g.pros, 'pro', '✓')}</div>` : ''}
            ${g.cons ? `<div class="gloss-col"><div class="gloss-h gloss-h-con">Things to consider</div>${list(g.cons, 'con', '!')}</div>` : ''}
          </div>` : ''}
        ${g.chooseIf ? `<div class="gloss-choose"><span class="gloss-choose-tag">Choose this if</span> ${g.chooseIf}</div>` : ''}
        ${seeAlso.length ? `<div class="gloss-seealso"><span>See also:</span> ${seeAlso.map(s => `<button class="gloss-related" data-id="${s}">${GLOSSARY[s].term.split(' (')[0]}</button>`).join('')}</div>` : ''}
      </div>`;

    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    ov.querySelector('.gloss-close').addEventListener('click', close);
    ov.querySelectorAll('.gloss-related').forEach(btn =>
      btn.addEventListener('click', () => show(btn.dataset.id)));
    document.body.appendChild(ov);
    document.addEventListener('keydown', onKey);
  }

  // Self-initialise after the wizard has rendered (no app.js changes needed)
  function boot() { try { decorate(); } catch (e) { console.error('Glossary decorate failed:', e); } }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(boot, 0);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  }
  window.addEventListener('load', boot); // safety net regardless of script order

  return { show, decorate, close };
})();
