// ── PROJECT TYPES ──────────────────────────────────────────────────────────
const PROJECT_TYPES = [
  { id: 'company-website',      icon: '🏢', name: 'Company Website',          desc: 'Authority-building corporate presence' },
  { id: 'landing-page',         icon: '🎯', name: 'Landing Page',             desc: 'One focused page to capture leads or launch a product/offer' },
  { id: 'portfolio',            icon: '🖼️', name: 'Portfolio Website',        desc: 'Showcase your work to win clients — video, photo, design, freelance' },
  { id: 'construction',         icon: '🏗️', name: 'Construction Website',     desc: 'Project portfolio & lead generation' },
  { id: 'law-firm',             icon: '⚖️', name: 'Law Firm Website',         desc: 'Attorney profiles, practice areas, case intake' },
  { id: 'medical',              icon: '🏥', name: 'Medical / Healthcare',      desc: 'Patient portals, appointments, HIPAA-ready' },
  { id: 'saas',                 icon: '⚡', name: 'SaaS Platform',             desc: 'Multi-tenant, subscription, onboarding flows' },
  { id: 'marketplace',          icon: '🛒', name: 'Marketplace',              desc: 'Two-sided platform with payments & trust' },
  { id: 'crm',                  icon: '🔗', name: 'CRM System',               desc: 'Contact management, pipeline, automation' },
  { id: 'erp',                  icon: '⚙️', name: 'ERP Platform',             desc: 'Ops, finance, HR, inventory integration' },
  { id: 'customer-portal',      icon: '👤', name: 'Customer Portal',          desc: 'Self-service, documents, account management' },
  { id: 'ecommerce',            icon: '🛍️', name: 'E-Commerce Store',         desc: 'Products, checkout, inventory, fulfilment' },
  { id: 'agency',               icon: '🎨', name: 'Agency Website',           desc: 'Portfolio, case studies, service showcase' },
  { id: 'internal-tool',        icon: '🔧', name: 'Internal Tool',            desc: 'Operations dashboards, internal workflows' },
  { id: 'dashboard',            icon: '📊', name: 'Analytics Dashboard',      desc: 'Data viz, reporting, KPI monitoring' },
  { id: 'mobile-backend',       icon: '📱', name: 'Mobile App Backend',       desc: 'REST/GraphQL API, auth, push notifications' },
  { id: 'custom',               icon: '✨', name: 'Custom Platform',          desc: 'Unique requirements, hybrid solution' },
];

// ── BUSINESS GOALS ─────────────────────────────────────────────────────────
const BUSINESS_GOALS = [
  'Lead Generation', 'Brand Authority', 'E-Commerce Sales', 'Customer Retention',
  'Recruitment / Talent Attraction', 'Investor Relations', 'Community Building',
  'Appointment Booking', 'Product Demos', 'Partner / Reseller Acquisition',
  'Thought Leadership / Content', 'Event Registrations', 'Newsletter / Subscriber Growth',
  'App Downloads', 'Support Deflection', 'Upselling / Cross-selling',
  'Geographic Expansion', 'International Markets',
];

// ── FEATURES ───────────────────────────────────────────────────────────────
const FEATURES = [
  'Blog / Content Hub', 'CMS (Content Management)', 'Admin Dashboard',
  'User Accounts & Auth', 'Customer Portal', 'Project Management',
  'Analytics & Reporting', 'AI Chatbot / Copilot', 'Booking System',
  'Payments & Billing', 'CRM Integration', 'ERP Integration',
  'Email Marketing Integration', 'Live Chat', 'Document Management',
  'Search & Filtering', 'Multi-language / i18n', 'Dark Mode',
  'API / Webhooks', 'Role-Based Access Control', 'Audit Logs',
  'File Upload / Media Library', 'Social Login (OAuth)', 'Two-Factor Auth',
  'Notifications (Email/SMS/Push)', 'Maps & Location', 'Video / Media Player',
  'Review & Rating System', 'Affiliate Programme', 'Subscription Management',
];

// ── COMPLIANCE OPTIONS ─────────────────────────────────────────────────────
const COMPLIANCE_OPTIONS = [
  { id: 'gdpr',   label: 'GDPR',          desc: 'EU General Data Protection Regulation' },
  { id: 'hipaa',  label: 'HIPAA',         desc: 'US Health Insurance Portability' },
  { id: 'soc2',   label: 'SOC 2',         desc: 'Security, availability, confidentiality' },
  { id: 'pci',    label: 'PCI-DSS',       desc: 'Payment Card Industry Data Security' },
  { id: 'iso27001',label: 'ISO 27001',    desc: 'Information security management' },
  { id: 'wcag',   label: 'WCAG 2.1 AA',  desc: 'Web Content Accessibility Guidelines' },
  { id: 'ccpa',   label: 'CCPA',          desc: 'California Consumer Privacy Act' },
  { id: 'pipeda', label: 'PIPEDA',        desc: 'Canada Personal Information Protection' },
  { id: 'lgpd',   label: 'LGPD',         desc: 'Brazil Lei Geral de Proteção de Dados' },
  { id: 'dpa',    label: 'UK DPA 2018',  desc: 'UK Data Protection Act' },
  { id: 'local',  label: 'Local Regs',   desc: 'Country-specific regulations' },
  { id: 'none',   label: 'Standard Only', desc: 'Industry best practices, no specific framework' },
];

// ── TECH RECOMMENDATIONS BY PROJECT TYPE ───────────────────────────────────
const TECH_RECOMMENDATIONS = {
  'saas':            { stack: 'Next.js 15 + TypeScript', db: 'PostgreSQL (Supabase)', auth: 'Clerk or Supabase Auth', hosting: 'Vercel', cms: 'Payload CMS', storage: 'Cloudflare R2' },
  'ecommerce':       { stack: 'Next.js 15 + TypeScript', db: 'PostgreSQL (Supabase)', auth: 'NextAuth.js', hosting: 'Vercel', cms: 'Sanity', storage: 'Cloudinary' },
  'marketplace':     { stack: 'Next.js 15 + TypeScript', db: 'PostgreSQL (Supabase)', auth: 'Clerk', hosting: 'Vercel / AWS', cms: 'Custom Admin', storage: 'AWS S3' },
  'medical':         { stack: 'Next.js 15 + TypeScript', db: 'PostgreSQL (AWS RDS)', auth: 'Auth0 (HIPAA)', hosting: 'AWS (HIPAA BAA)', cms: 'Custom Admin', storage: 'AWS S3 (encrypted)' },
  'dashboard':       { stack: 'Next.js 15 + TypeScript', db: 'PostgreSQL + TimescaleDB', auth: 'NextAuth.js', hosting: 'Vercel / Railway', cms: 'N/A', storage: 'AWS S3' },
  'portfolio':       { stack: 'Static HTML/CSS/JS or Astro', db: 'None — or a simple form backend', auth: 'Not required', hosting: 'Vercel or Netlify', cms: 'Sanity (optional, to add projects yourself)', storage: 'Cloudinary (image/video hosting)' },
  'landing-page':    { stack: 'Static HTML/CSS/JS or Next.js', db: 'None — form goes to email (Formspree/Resend)', auth: 'Not required', hosting: 'Vercel or Netlify', cms: 'None', storage: 'None' },
  'default':         { stack: 'Next.js 15 + TypeScript', db: 'PostgreSQL (Supabase)', auth: 'NextAuth.js', hosting: 'Vercel', cms: 'Sanity or Payload CMS', storage: 'Cloudflare R2' },
};

// ── PLATFORM PREFIXES ──────────────────────────────────────────────────────
const PLATFORM_PREFIXES = {
  'Lovable':       'You are building a production-ready web application in Lovable. Use React + TypeScript + Tailwind CSS. Backend via Supabase (auth, database, storage, edge functions). Use shadcn/ui for all UI components. Use Tanstack Router for routing. Use React Hook Form + Zod for form validation.\n\n',
  'Bolt':          'You are building in Bolt (StackBlitz WebContainer). CRITICAL — follow every rule or npm install will fail.\n\nRULE 1 — FRAMEWORK: Vite 5 + React 18 + TypeScript ONLY. Never use Next.js (it does not run in WebContainer).\n\nRULE 2 — APPROVED PACKAGE VERSIONS (use EXACTLY these, no ^ or ~, no other versions):\n  react@18.3.1  react-dom@18.3.1  react-router-dom@6.26.2\n  vite@5.4.2  @vitejs/plugin-react@4.3.1  typescript@5.5.3\n  tailwindcss@3.4.10  postcss@8.4.47  autoprefixer@10.4.20\n  react-hook-form@7.53.0  @hookform/resolvers@3.9.0  zod@3.23.8\n  lucide-react@0.439.0  date-fns@3.6.0\n  @tanstack/react-query@5.56.2  zustand@4.5.5\n  axios@1.7.7  clsx@2.1.1\n\nRULE 3 — BANNED: shadcn/ui (requires CLI), sharp, bcrypt (use bcryptjs@2.4.3), canvas, any package needing node-gyp.\n\nRULE 4 — SCRIPTS (exact):\n  "dev": "vite"  "build": "vite build"  "preview": "vite preview"\n\nRULE 5 — Only use packages from the approved list above. If you need something not listed, pick the closest approved alternative.\n\nRULE 6 — IMPORTS: Use RELATIVE imports ONLY (./components/Header, ../hooks/useX). NEVER use the "@/" path alias in any file — it breaks cloud bundlers.\n\nRULE 7 — GENERATE EVERY FILE: Every file imported anywhere MUST be created. Never import a file without also generating it. Check App.tsx imports and ensure every page, component, hook, and util file exists in your output.\n\n',
  'v0':            'You are building in v0 by Vercel. Use Next.js 15 App Router + TypeScript + Tailwind CSS. Use shadcn/ui components exclusively. Follow Vercel deployment patterns. Use server actions for mutations. Use Prisma with PostgreSQL or Neon.\n\n',
  'Framer':        'You are building in Framer. Use Framer\'s native sections, stacks, and CMS where appropriate. Maintain a strict spacing system and typography scale. Animations must be subtle entrance reveals only — no looping or decorative motion. Every page must be conversion-first: CTA above the fold and repeated after proof sections.\n\n',
  'Webflow':       'You are building in Webflow. Use clean, systematic class naming (client-first style). Build reusable sections as components. Use CMS collections only for genuinely repeatable content (blog posts, projects, team members). Set proper responsive breakpoints at 991/767/478. Keep structure semantic and shallow — no deep div nesting.\n\n',
  'Cursor':        'You are architecting a production codebase in Cursor. Apply clean architecture and SOLID principles throughout. The codebase must be maintainable, testable, and scalable from day one. Follow the file structure specified precisely.\n\n',
  'Replit':        'You are building in Replit. Use Node.js + Express backend with React frontend (Vite). Use Drizzle ORM with PostgreSQL. Structure for easy Replit deployment. Keep dependencies minimal and environment setup simple.\n\n',
  'OpenAI Codex':  'Build this application following these precise technical specifications. Implement all features as described, using industry-standard patterns and modern best practices.\n\n',
  'Claude Code':   'You are my Staff Engineer. Build this production application following the complete specification below. Use Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui. Structure the codebase for long-term maintainability.\n\n',
  'Universal':     'Build this in ANY AI website builder or coding tool (Bolt, Lovable, v0, Cursor, Replit, Framer, Webflow, Claude Code, ChatGPT, and others). This prompt is builder-agnostic: the strategy, page structure, design system, content, and conversion rules below are what matter and apply everywhere. The technology stack named later is a RECOMMENDED DEFAULT, not a requirement — if your builder needs a different stack (e.g. Vite instead of Next.js, or a no-code builder\'s native components/CMS), use the closest equivalent it supports. Never fail because a specific library or framework is unavailable — substitute the nearest option and keep going.\n\n',
};

// ── LOADING SEQUENCE ───────────────────────────────────────────────────────
const LOADING_SEQUENCE = [
  { label: 'Analysing business requirements',         weight: 8  },
  { label: 'Defining user personas & journeys',       weight: 8  },
  { label: 'Mapping information architecture',        weight: 8  },
  { label: 'Engineering conversion strategy',         weight: 8  },
  { label: 'Designing UX & content hierarchy',        weight: 8  },
  { label: 'Generating SEO architecture',             weight: 8  },
  { label: 'Specifying security requirements',        weight: 8  },
  { label: 'Designing database schema',               weight: 8  },
  { label: 'Building admin & RBAC architecture',      weight: 8  },
  { label: 'Applying compliance frameworks',          weight: 8  },
  { label: 'Generating reliability strategy',         weight: 8  },
  { label: 'Running enterprise quality scoring',      weight: 6  },
  { label: 'Auto-improving below-threshold sections', weight: 6  },
  { label: 'Composing CTO audit prompt',              weight: 5  },
  { label: 'Building client sales brief',             weight: 5  },
];
