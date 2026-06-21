// ══════════════════════════════════════════════════════════════════════════════
// STYLE LIBRARY — the tool's growing "database" of distinct, modern design styles.
//
// PURPOSE: stop the generated sites from converging on one house style. Each entry
// here is a self-contained visual DNA (typography, colour, layout, motion, imagery,
// signature moment) plus optional AI-image prompts. The prompt engine pulls a style
// from here so that even identical user choices can produce genuinely different,
// industry-standard designs.
//
// HOW IT GROWS: when the owner provides a styling prompt, it gets distilled into a
// new entry below — filed by `category` and `aesthetics`. The library is the thing
// the tool "learns" from over time.
//
// ENTRY FORMAT:
//   {
//     id:         'kebab-id',
//     name:       'Human Name',                  // shown in the optional style picker
//     category:   'hero' | 'landing' | 'full-site' | 'section',
//     aesthetics: ['premium','luxury', ...],      // tags matched to brand positioning
//     industries: ['legal','fashion', ...],       // optional fit; [] = any industry
//     dna: { mood, typography, color, layout, motion, imagery, signature },
//     imagePrompts: ['art-directed AI image prompt', ...],  // optional (gpt-image-2)
//     source: 'seed' | 'user-prompt'
//   }
// ══════════════════════════════════════════════════════════════════════════════

const STYLE_LIBRARY = [
  {
    id: 'editorial-luxe',
    name: 'Editorial Luxe',
    category: 'full-site',
    aesthetics: ['premium', 'luxury', 'boutique', 'editorial', 'trust'],
    industries: ['legal', 'real-estate', 'fashion', 'hospitality', 'finance', 'consulting'],
    dna: {
      mood: 'Quiet, expensive confidence — a private-members-club feel rendered with Swiss restraint. Nothing shouts; everything is considered.',
      typography: 'High-contrast serif display (Playfair Display / Canela feel) at 300–500 weight for headlines, paired with a clean grotesque (Inter / Söhne) for body. Generous tracking on small caps labels.',
      color: 'Warm ivory background (#FAF7F2, never pure white), deep ink navy or charcoal text, a single restrained metallic accent (aged gold #B8924C) used on rules and hovers only — under 5% of any viewport.',
      layout: 'Asymmetric editorial grid (60/40 splits), wide margins, oversized whitespace, full-bleed photography with thin hairline rules dividing sections.',
      motion: 'A single hairline rule drawing itself in beneath headings as they scroll into view (scaleX 0→1, 600ms ease-out). Everything else is still.',
      imagery: 'Desaturated, dramatic, gallery-grade photography. Portraits in natural window light, shallow depth. Never stock handshakes.',
      signature: 'The drawing-in gold hairline beneath each section heading — the one thing visitors remember.',
    },
    imagePrompts: [
      'editorial fashion-grade photograph, single subject in natural window light, shallow depth of field, muted warm tones, gallery composition, 35mm film grain, ample negative space',
    ],
    source: 'seed',
  },
  {
    id: 'kinetic-bold',
    name: 'Kinetic Bold',
    category: 'hero',
    aesthetics: ['bold', 'modern', 'creative', 'disruptor'],
    industries: ['creative', 'media', 'agency', 'tech', 'startup', 'entertainment'],
    dna: {
      mood: 'Confident showmanship — the site IS the portfolio piece. Breaks one grid rule per viewport on purpose. Big, fast, kinetic.',
      typography: 'Massive variable grotesque (Clash Display / Bricolage) at 700–900, tight leading (0.95), animated on the weight axis. Headlines are the hero — no image needed.',
      color: 'Raw black (#0A0A0A) or raw white base — strict monochrome discipline — broken by ONE electric accent (acid lime #C8FF00, electric blue #2400FF, or hot orange #FF4D00).',
      layout: 'Oversized type that crosses section boundaries, off-grid placements, a slow marquee strip between sections, work shown full-width.',
      motion: 'Headline words animate in line-by-line with a stagger; a custom cursor dot scales over links; work rows expand on hover revealing a peeking image.',
      imagery: 'Project work shown big and in-situ; bold cropping; cursor-following preview images.',
      signature: 'Line-by-line kinetic headline reveal + the scaling custom cursor.',
    },
    imagePrompts: [
      'high-contrast studio product shot on seamless monochrome backdrop, single acid-lime accent prop, hard directional light, bold graphic composition, ultra sharp',
    ],
    source: 'seed',
  },
  {
    id: 'quiet-minimal',
    name: 'Quiet Minimal',
    category: 'full-site',
    aesthetics: ['minimal', 'corporate', 'clean', 'techy', 'approachable', 'trust'],
    industries: ['tech', 'saas', 'software', 'finance', 'consulting', 'healthcare'],
    dna: {
      mood: 'Inevitable, precise calm — Linear/Vercel lineage. The product feels like it was sent back from five years ahead. Restraint reads as confidence.',
      typography: 'Geist / Inter Display at 500–600 only (never heavier — restraint), 15–16px body tighter than marketing sites, strict 3-tier hierarchy.',
      color: 'Near-black void (#050507) panels with 1px 6% white borders, a single soft glow gradient (indigo→violet) on CTAs and key moments only, semantic green/amber for status.',
      layout: 'Centred announcement pill, gradient on one key phrase, product screenshot in browser chrome tilted into perspective with a reflective glow; faint dot-grid that brightens near the cursor.',
      motion: 'A border-beam light travelling around the announcement pill; section screenshots smoothly scale between scroll positions; reveals rise 16px + fade, once.',
      imagery: 'Product screenshots in chrome frames with subtle glow shadows; abstract gradient meshes; no people photography.',
      signature: 'The travelling border-beam pill + the cursor-reactive dot-grid.',
    },
    imagePrompts: [
      'clean SaaS dashboard UI screenshot, dark mode, soft indigo glow, floating in a minimalist browser frame, subtle perspective tilt, crisp vector-sharp',
    ],
    source: 'seed',
  },
  {
    id: '3d-creator-portfolio',
    name: '3D Creator Portfolio',
    category: 'full-site',
    aesthetics: ['bold', 'creative', 'modern', '3d', 'kinetic', 'artistic', 'dark', 'disruptor'],
    industries: ['creative', 'media', 'design', '3d', 'motion', 'animation', 'agency', 'entertainment', 'art', 'gaming'],
    fonts: "Kanit (Google Fonts, weights 300–900) for everything.",
    dna: {
      mood: 'Bold, kinetic 3D-creator showcase. Near-black, dramatic, playful-yet-premium — the WORK and the MOTION are the brand. Floating 3D objects, magnetic interactions, and scroll-driven movement everywhere.',
      typography: 'MASSIVE font-black UPPERCASE hero headline (up to ~17vw, leading-none, tracking-tight) in a silver gradient (background: linear-gradient(180deg,#646973,#BBCCD7), -webkit-background-clip:text, text-fill transparent). Uppercase nav + labels with wide tracking. Fluid clamp() typography that scales huge from mobile to ultrawide.',
      color: 'Base #0C0C0C (near-black) on html/body/wrapper; light text #D7E2EA. Headlines use the silver gradient (#646973→#BBCCD7). ONE vivid multi-stop CTA pill gradient: linear-gradient(123deg,#18011F 7%,#B600A8 37%,#7621B0 72%,#BE4C00 100%) with an inset glow and a 2px white outline (-3px offset). One full WHITE (#FFFFFF) section mid-page for hard contrast.',
      layout: 'Full-viewport hero with a centred portrait cutout; alternating dark/white sections with heavy rounded-top corners (rounded-t-[60px]); a scroll-reactive image marquee (two rows moving opposite directions); sticky-stacking project cards that scale down as you pass them; asymmetric 40/60 image grids; floating decorative 3D objects in the corners.',
      motion: 'Framer Motion throughout. Staggered FadeIn on whileInView (y/x offsets, ease [0.25,0.1,0.25,1], once). Magnetic mouse-following effect on the hero portrait. Character-by-character scroll-driven opacity reveal (0.2→1) on the about paragraph. Dual-direction scroll-driven marquee (rows translate on scrollY). Sticky card-stacking via useScroll/useTransform scale. willChange:transform + passive scroll listeners for performance.',
      imagery: '3D-rendered objects (moon, lego block, abstract groups), a portrait cutout, and glossy project mockups — all with heavy border-radius (rounded-[60px]). Dark, rendered, glossy aesthetic; lazy-loaded marquee tiles ~420×270.',
      signature: 'The magnetic hero portrait + the sticky-stacking scaling project cards + the dual-direction scroll marquee + the char-by-char text reveal + the huge silver-gradient "HI, I\'M [NAME]" hero.',
    },
    techniques: [
      'Magnetic hover (Magnet component): translate an element toward the cursor (translate3d ÷ strength) when within a padding radius; 0.3s ease-out in, 0.6s ease-in-out out; willChange:transform.',
      'Sticky card-stacking: project cards are sticky (top-24) inside tall containers and scale down via useScroll+useTransform (targetScale = 1 − (total−1−i)·0.03) so they stack as you scroll past.',
      'Scroll-reactive marquee: two rows of tripled images translate horizontally by (scrollY − sectionTop + innerHeight)·0.3 in opposite directions; passive listener.',
      'Character-by-character text reveal: each char animates opacity 0.2→1 by scroll progress (useScroll offset ["start 0.8","end 0.2"]) using an invisible placeholder + absolutely-positioned animated span.',
      'Gradient pill CTA: rounded-full button with a multi-stop diagonal gradient, inset glow box-shadow, and a 2px white outline offset −3px; uppercase, tracking-widest.',
      'Reusable staggered FadeIn wrapper (whileInView, once, margin 50px) with configurable delay/duration/x/y and ease [0.25,0.1,0.25,1].',
    ],
    imagePrompts: [
      'glossy 3D-rendered abstract object floating on a near-black (#0C0C0C) background, soft studio lighting, subtle reflections, isometric, high detail, portfolio hero asset',
      '3D-rendered character or product cutout, dramatic rim light, dark glossy backdrop, crisp clean edges for a transparent PNG, premium creative-studio look',
      'minimal 3D icon (moon / lego-style block / abstract group) in muted tones with soft shadows, transparent background, decorative corner accent',
    ],
    source: 'user-prompt',
  },
  {
    id: 'shader-glass-agency',
    name: 'Shader Glass Agency',
    category: 'full-site',
    aesthetics: ['modern', 'creative', 'premium', 'clean', 'bold', 'disruptor', 'techy', 'bright', 'agency'],
    industries: ['creative', 'agency', 'design', 'media', 'studio', 'marketing', 'tech', 'startup', 'branding'],
    fonts: "System default UI sans stack (no custom webfont) — medium weight (500) throughout for a fast, clean, contemporary feel; hierarchy carried by size and weight, not colour.",
    dna: {
      mood: 'Bright, airy, contemporary creative-studio confidence. Light backgrounds host a living, animated WebGL glass shader that IS the hero — premium yet approachable. The motion and the glass are the brand; warmth comes from a single vivid orange.',
      typography: 'No custom font — medium-weight (500) system sans everywhere. Fluid clamp() headlines scaling ~1.75rem mobile → 4.2rem desktop, very tight leading (1.08–1.12) and tight tracking (-0.03em hero / -0.02em sub-heads). Small 13px tracking-wide labels. Never heavier than 500 — restraint reads as craft.',
      color: 'Layered light neutrals — #EFEFEF hero, pure #FFFFFF "about", #F5F5F5 case studies — with near-black gray-900 (#111) text and chrome. ONE vivid orange accent family (#F26522 buttons, #FF5F03 / #E8704E shader current + partner mark) reserved for CTAs, the shader glow and the brand mark. Borders are hairline gray-200/300.',
      layout: 'A floating white pill navbar (bg-white rounded-full) inside a max-w-[1440px] frame; hero copy pinned to the BOTTOM of a full-viewport section via a flex spacer. Numbered section badges (filled circle + bordered pill). Asymmetric desktop grids (e.g. grid-cols-[26%_1fr_48%] with mixed self-start/self-end) that collapse to clean stacks on mobile. Aspect-locked rounded-2xl media tiles. Generous vertical rhythm.',
      motion: 'Layered WebGL shaders (Swirl + ChromaFlow + FlutedGlass + FilmGrain) animate continuously behind the hero. Signature TEXT-ROLL on every button: the label is duplicated in an overflow-hidden column and translated -50% on hover (500ms cubic-bezier(.25,.1,.25,1)). Arrow icons sit in a circle and rotate -45°→0° on hover. Case-study hover buttons start as a small circle and expand into a pill that reveals its label. A live London clock ticks every second; the mobile menu is a bottom sheet sliding up (cubic-bezier(.32,.72,0,1)).',
      imagery: 'Glossy rendered brand/product stills and autoplaying muted case-study videos in rounded-2xl frames. The hero carries NO photo — the animated fluted-glass shader is the hero visual. Warm-toned, high-craft, modern.',
      signature: 'The animated multi-layer fluted-glass shader hero (no photo) + the text-roll hover on every button + the circle→pill expanding case-study hover button + the floating white pill navbar with a live London clock.',
    },
    techniques: [
      'Layered WebGL shader hero: stack Swirl (colorA #fff / colorB #f0f0f0, detail 1.7) → ChromaFlow (orange #ff5f03 directional, momentum 13, radius 3.5) → FlutedGlass (aberration .61, angle 31, frequency 8, refraction 4, shape "rounded", speed .15) → FilmGrain (strength .05); absolute inset-0, z-10, pointer-events-none, over a #EFEFEF base. (e.g. the `shaders/react` package, or equivalent GLSL.)',
      'Text-roll button hover: wrap the label twice in a flex-col inside overflow-hidden h-[20px]; on group-hover translate-y -50% (duration-500, ease cubic-bezier(.25,.1,.25,1)) so the second copy rolls up into place.',
      'Arrow-in-circle: a white/dark circle holding an arrow icon that rotates -45deg→0 on group-hover with the same easing — paired with the text-roll on the same button.',
      'Expanding hover button: a ~36px circle (absolute bottom-4 left-4 on a media card) that grows to a fixed pill width on group-hover (transition-all 300ms ease-in-out), fading its label in (delay-100) and un-rotating its icon.',
      'Floating pill navbar: bg-white rounded-full with tiny inner padding inside a max-w-[1440px] p-2/p-3 frame — left logo + nav links, right side an availability note, a Clock icon + live HH:MM London time, and a CTA.',
      'Live timezone clock: setInterval every 1s formatting the date to Europe/London HH:MM, rendered in both the navbar and the mobile sheet.',
      'Numbered section badge: a filled gray-900 circle showing the section number beside a bordered rounded-full pill label (e.g. "Introducing [Brand]").',
      'Mobile bottom-sheet menu: fixed inset-0 z-50, black/60 backdrop, white rounded-2xl sheet translating translate-y-full→0 (duration-500, cubic-bezier(.32,.72,0,1)).',
      'liquid-glass utilities: rgba(255,255,255,.01) bg + backdrop-filter blur(4px) + inset shadow + a mask-composite gradient-border pseudo-element (plus a blur(50px) "strong" variant) for optional frosted panels.',
    ],
    imagePrompts: [
      'glossy rendered brand still for a design-agency case study, warm orange accent lighting, clean studio composition, soft reflections, rounded-frame crop, premium and contemporary',
      'abstract animated-glass / chromatic-flow texture in light neutrals (#EFEFEF, #FFFFFF) with a single warm orange (#FF5F03) current, fluted refraction and subtle film grain, used as a bright hero background',
      'short autoplay-style product showcase frame on a dark studio backdrop, glossy modern 3D motion piece, creative-studio case-study tile, muted-loop aesthetic',
    ],
    source: 'user-prompt',
  },
  {
    id: 'cinematic-ai-agent',
    name: 'Cinematic AI Agent',
    category: 'hero',
    aesthetics: ['creative', 'bold', 'modern', 'minimal', 'clean', 'disruptor', 'techy', 'cinematic', 'monochrome', 'agency'],
    industries: ['creative', 'agency', 'design', 'media', 'studio', 'tech', 'ai', 'startup', 'film', 'production', 'entertainment', 'branding'],
    fonts: "Helvetica Now Display — Medium for the logo/headings, Regular (W01) for body and everything else (loaded from onlinewebfonts.com); Helvetica Neue / Arial fallback. CSS vars --font-heading / --font-body.",
    dna: {
      mood: 'Cinematic, conversational, AI-studio cool. A film-grade video reacts to your mouse while an AI agent greets you and offers quick replies — the interaction IS the wow. Confident minimalism; the palette stays out of the way so the motion and the conversation lead.',
      typography: 'Helvetica Now Display — neutral Swiss grotesque, Medium for the logo, Regular (400) everywhere else. Fluid clamp(18px,4vw,26px) hero copy with generous line-height (1.3–1.35); 21–26px logo lockup, ~23px nav. No bold weights — restraint and neutrality read as taste.',
      color: 'Strictly monochrome — black (#000) text and UI on a light base, pure white (#FFF) pill buttons, and a white/95 backdrop-blur mobile overlay. NO brand accent colour at all: every bit of colour in the viewport comes from the full-screen background video itself.',
      layout: 'A full-screen FIXED cinematic video behind everything (object-cover, object-position 70% center, z-0). Fixed top navbar: "Mainframe®"-style logo + decorative ✳︎ asterisk on the left, comma-separated nav links centre, underlined "Get in touch" right, animated hamburger on mobile. Hero content lives in a max-w-xl column anchored to the bottom on mobile / vertically centred on desktop: blurred intro label → typewriter line → wrap of pill chips.',
      motion: 'THE signature is a MOUSE-SCRUB video: horizontal mouse movement seeks the video forward/backward — it never autoplays. Plus a typewriter that reveals the greeting character-by-character with a blinking step cursor, quick-reply pill chips that fade-in + slide-up 400ms after load (independent of the typing), a hamburger that morphs into an X, and a fading backdrop-blur mobile overlay.',
      imagery: 'A single full-bleed cinematic video is the ENTIRE visual — fixed, object-cover, scrub-controlled. No photos, no illustration: the footage carries all colour and atmosphere. Choose moody, filmic, abstract motion that reads cleanly behind black text and seeks smoothly in either direction.',
      signature: 'The mouse-scrub cinematic video + the AI-agent typewriter greeting ("Hey there, meet A.R.I.A…") with blinking cursor and a blurred intro label + the row of quick-reply pill chips (including a click-to-copy email outline pill).',
    },
    techniques: [
      'Mouse-scrub video: a full-screen position:fixed, muted, playsInline video that does NOT autoplay. A window "mousemove" listener tracks prevX; delta = currentX − prevX; targetTime += (delta / window.innerWidth) · 0.8 · video.duration, clamped to [0, duration]; seek via video.currentTime and re-queue the next seek inside onSeeked only if targetTime has moved (prevents seek-flooding).',
      'useTypewriter hook: after a startDelay (~600ms) an interval reveals one character every ~38ms; returns { displayed, done }. Render in a min-height line with a blinking cursor (inline 2px bar, h-[1.1em], CSS "blink 1s step-end infinite") that hides once done is true.',
      'Quick-reply pill chips: a flex-wrap row of white rounded-full pills (border-black/10, text-[13–15px], px-4/5, py-[0.3em]) that invert to bg-black / text-white on hover; the whole row fades in + slides up (translateY 8px→0, 0.4s) 400ms after load, independent of the typewriter finishing.',
      'Click-to-copy outline pill: a transparent, white-bordered rounded-full pill holding an underlined email + a 12px two-rectangle copy SVG; navigator.clipboard.writeText(email) on click; hover inverts to bg-white / text-black.',
      'Blurred intro label: a two-line preamble rendered with filter: blur(4px), pointer-events-none + select-none, sitting just above the typewriter for a soft "booting up" feel.',
      'Animated hamburger → X: three 2px bars (gap-[5px]); on toggle the top rotates 45° and translates +7px, the middle fades to opacity 0, the bottom rotates −45° and translates −7px (all duration-300). Mobile overlay: fixed inset-0 bg-white/95 backdrop-blur, links at ~32px, toggled via opacity + pointerEvents.',
      'Logo lockup: heading-font "Brand®" beside a decorative ✳︎ asterisk (letter-spacing −0.02em, select-none); comma-separated nav links each with hover:opacity-60 transition-opacity; underlined "Get in touch" CTA.',
    ],
    imagePrompts: [
      'moody cinematic abstract footage, slow drifting light and shadow, filmic grain, desaturated with deep blacks, full-bleed loopable background video for a creative-studio hero, smooth continuous motion suited to horizontal mouse-scrub seeking',
      'film-grade macro of liquid / smoke / light in motion, neutral near-monochrome palette, high dynamic range, designed as a fixed full-screen hero backdrop that reads cleanly behind black text',
      'abstract AI / data-inspired visual, elegant flowing forms, cinematic colour grade, no text, even continuous motion so it scrubs smoothly forward and backward',
    ],
    source: 'user-prompt',
  },
  {
    id: 'glassmorphism-fintech',
    name: 'Glassmorphism Fintech',
    category: 'hero',
    aesthetics: ['premium', 'modern', 'clean', 'minimal', 'techy', 'corporate', 'trust', 'glassmorphism', 'fintech'],
    industries: ['fintech', 'defi', 'crypto', 'web3', 'saas', 'finance', 'tech', 'startup', 'dashboard', 'banking', 'investing', 'software'],
    fonts: "Helvetica Regular (loaded from onlinewebfonts) — a single neutral grotesque used at NORMAL weight throughout (no bold); ui-sans-serif / system-ui fallback, exposed as the --font-helvetica Tailwind theme var.",
    dna: {
      mood: 'Premium, calm, liquid glassmorphism — a DeFi/fintech product that feels expensive and effortless. Frosted translucent panels float over a soft-moving video inside a rounded card; muted slate-blue restraint signals trust and modernity rather than crypto-hype.',
      typography: 'A single neutral grotesque (Helvetica Regular) at NORMAL weight only — never bold. Large tight-tracking display h1 (up to ~80px, leading 1.05, tracking-tight) in a muted slate-grey (#5E6470); relaxed 14–18px body at ~80% opacity. Small UPPERCASE wide-tracked micro-labels on the stat cards.',
      color: 'A light gray canvas (#f0f0f0) is the entire world. All "ink" is desaturated navy/slate — rgba(30,50,90,·) for chrome, CTAs and icons, #5E6470 for headings, navy at 60–95% opacity carrying the hierarchy. NO vivid accent colour: every bit of life comes from the muted background video. Surfaces are translucent white (white/10 → white/60) with backdrop-blur and hairline white/20 borders.',
      layout: 'The hero is a single ROUNDED CARD (rounded-[1.5rem]→[3rem], overflow-hidden) inset from the viewport (p-3/p-5) with a full-bleed autoplay video inside it. Content layers on top: a centred navbar (flex-1 spacers / centre menu with dropdown chevrons / pill CTA), a centred badge + headline + subcopy block near the top, and frosted UI cards pinned to the BOTTOM CORNERS. The bottom-right card uses faux-cutout corners so it reads as carved out of the frame.',
      motion: 'motion/react entrance choreography throughout — staggered fade + scale (0.98→1) on the headline (delay .2), fade on the subcopy (delay .4), fade-up (y 20) on the badge, slide-in (x −20) on the bottom-left card, fade-up on the bottom-right card. Buttons scale on hover/tap (1.02 / 0.98); dropdown chevrons nudge right on hover. The background video autoplays muted + looped as ambient atmosphere (NOT scrubbed).',
      imagery: 'One soft, premium, abstract background video (slow liquid / light, cool muted tones) fills the rounded card and supplies all the colour. Everything else is UI glass — no photographs. Lucide line icons (Sparkles, ArrowUpRight, ChevronRight) sit inside frosted translucent circles.',
      signature: 'Frosted-glass cards floating in the corners of a rounded video-card hero + the faux-cutout bottom-right corner (inverse-radius SVG masks) that makes a solid card look carved into the frame + the muted slate-on-#f0f0f0 palette with zero saturated accent.',
    },
    techniques: [
      'Framed video-card hero: a full-viewport wrapper (bg #f0f0f0, p-3/p-5, flex centre) holds ONE rounded-[1.5rem]→[3rem] overflow-hidden section; inside it an absolute inset-0 object-cover autoPlay muted loop playsInline video (z-0) sits under a relative z-10 content layer.',
      'Glassmorphism surfaces: translucent white panels (bg-white/30 cards, bg-white/60 badge) with backdrop-blur (md→xl) and hairline white/20 borders; pill buttons are rounded-full with an icon in a translucent circle (bg-white/20 or rgba(30,50,90,0.1)).',
      'Faux-cutout corner (inverse radius): a SOLID #f0f0f0 card pinned bottom-right with rounded-tl-[3.5rem]; two absolutely-positioned 56×56 SVG masks (quarter-circle paths filled #f0f0f0) sit just outside its top-right and bottom-left edges so the card appears carved out of the rounded frame rather than overlaid.',
      'Muted slate palette discipline: all chrome uses rgba(30,50,90,·) at varying opacity (≈0.05 fills, 0.1 borders, 0.6–0.95 text) with headings in #5E6470, on a flat #f0f0f0 canvas — zero saturated accent anywhere.',
      'motion/react entrance choreography (motion/react = the "motion" npm package, i.e. Framer Motion — install it, or achieve the same with CSS keyframes; never import it un-installed): staggered initial/animate (opacity + scale 0.98 on h1 @delay .2, opacity on subcopy @delay .4, y-20 fade-up badge, x-20 slide bottom-left, y-20 fade-up bottom-right) plus whileHover/whileTap scale (1.02 / 0.98) on every button.',
      'Stat + CTA glass card: a frosted bottom-left card pairing a big tight-tracking number ("5.2K") with an uppercase wide-tracked micro-label ("Active Yielders") above a white pill button (icon-in-circle + label).',
      'Navbar: centred menu via flex-1 spacers on both sides, dropdown items carrying a ChevronRight that translate-x nudges on group-hover, and a navy pill "Book Demo" CTA with ArrowUpRight inside a white/20 circle.',
    ],
    imagePrompts: [
      'soft premium abstract background video of slow-flowing liquid or light, cool muted blue-grey palette, calm continuous loop, designed to sit inside a rounded glassmorphism hero card and read behind frosted UI',
      'desaturated fluid motion texture (water, silk, or vapour) in pale slate-blue and white, high-end fintech mood, no text, seamless loop for a product-hero background',
      'minimal frosted-glass UI still life, translucent panels with backdrop blur over a light gray (#f0f0f0) surface, muted navy accents, premium dashboard aesthetic',
    ],
    source: 'user-prompt',
  },
  {
    id: 'boutique-studio-founder',
    name: 'Boutique Studio Founder',
    category: 'full-site',
    aesthetics: ['premium', 'minimal', 'editorial', 'boutique', 'clean', 'creative', 'warm', 'trust', 'personal'],
    industries: ['creative', 'design', 'agency', 'studio', 'portfolio', 'freelance', 'consulting', 'branding', 'media', 'advertising'],
    fonts: "PP Neue Montreal (400 Book + 500 Medium from Webflow CDN) for all body and UI text. PP Mondwest Regular (woff2) for the logo and SPECIFIC WORDS inside headlines only — the serif punctuates rather than headlines. Monospace (font-mono) for the tagline eyebrow.",
    dna: {
      mood: 'Deliberately personal boutique confidence — a solo creative director who has earned restraint. Pure white throughout, deep navy ink, no accent colour. The portfolio GIFs and a parallax portrait do all the warmth and energy; the typography does the positioning.',
      typography: 'Two fonts in tension: PP Neue Montreal grotesque for body/UI (400 normally, 500 for UI labels) and PP Mondwest serif for the logo + SPECIFIC WORDS mid-headline only ("next wave", "bold way", "builders") — the inline swap is the signature. Headlines at 32–44px, tight leading (1.1), tracking-tight. A monospace eyebrow sits above the main heading. Multi-layered staggered fade-up animations (0.1s increments) introduce each element.',
      color: 'Pure white background throughout every section. All chrome is a single deep navy family — #051A24 (primary), #0D212C (headings), #273C46 (muted), #F6FCFF/#E0EBF0 (reversed on the dark pricing card). Zero saturated accent. Depth comes entirely from multi-layered box-shadows on buttons and cards, not from colour.',
      layout: 'Narrow centred hero column (max-w-[440px]) leading into full-width bands. Sections alternate between centred-narrow, full-bleed (marquee, carousel), and right-aligned grids (pricing cards max-w-4xl md:justify-end). Projects stack vertically with text offset left (ml-20+) above full-width GIF images. A fixed floating pill nav (bottom-6, left-1/2 −translate-x-1/2) persists across the entire scroll.',
      motion: 'IntersectionObserver staggered fadeInUp (translateY 30px→0, 0.8s ease-out, once, threshold 0.1, per-element 0.1s delay increments) across all sections. Infinite horizontal GIF marquee (translateX 0→−50%, 30s linear, CSS animation). Mouse-trail GIF spawn in the Partner section: thumbnails appear at cursor (requestAnimationFrame), random ±10° rotation, fade+scale-out over 1s, 80ms minimum interval. Parallax portrait (scroll-linked translateY via IntersectionObserver + scroll listener + rAF, max ±200px offset). Auto-scrolling testimonial carousel (3s, cubic-bezier(.4,0,.2,1) 0.8s, infinite with tripled items).',
      imagery: 'Animated GIF website-preview thumbnails are the portfolio — shown in the infinite marquee (h-[280px]→500px, rounded-2xl, shadow-lg) and spawned as mouse-trail cursors in the Partner section. One parallax portrait photo. Circular Pexels avatar thumbnails inside testimonial cards. The dark pricing card holds the only non-white panel. No decorative illustration or abstract art.',
      signature: 'The inline PP Mondwest serif word-swap inside grotesque headlines + the infinite GIF marquee showcase + the mouse-trail GIF spawn on the Partner section hover + the fixed floating bottom pill nav with the PP Mondwest "V" logo.',
    },
    techniques: [
      'Inline serif accent swap: headlines render as mixed-font spans — grotesque for most words, PP Mondwest (font-family: "PP Mondwest") on specific nouns/phrases only (e.g. "next wave", "bold way", "builders"). Keeps the line in one size/weight; the typeface swap is the only visual break.',
      'Infinite horizontal GIF marquee: a flex row of 8 images duplicated (16 total); CSS animation translateX(0)→translateX(-50%), 30s linear infinite (10s mobile); images are h-[280px] md:h-[500px], rounded-2xl, shadow-lg, object-cover, mx-3.',
      'Mouse-trail GIF spawn (Partner section): mousemove listener spawns an <img> at clientX/Y with random rotation (Math.random()*20−10 deg), position: fixed, pointer-events-none, z-50; animate opacity 1→0 + scale 1→0.8 over 1000ms via requestAnimationFrame; minimum 80ms between spawns; cleanup removes elements from DOM on completion.',
      'Parallax portrait: IntersectionObserver fires once to register the element; a passive scroll listener reads window.scrollY vs element.getBoundingClientRect().top inside requestAnimationFrame, computing offset = (scrollY − sectionTop) * 0.3, clamped to ±200px, applied as translateY. Removes scroll listener on unmount.',
      'useInViewAnimation hook: IntersectionObserver (threshold 0.1, once) adds class "animate-fade-in-up" to the observed element. CSS: @keyframes fadeInUp { 0%: opacity 0 + translateY(30px); 100%: opacity 1 + translateY(0) }; animation: 0.8s ease-out forwards. Each child gets animationDelay in 0.1s steps.',
      'Multi-layered button depth (no colour): Primary shadow: 0 1px 2px rgba(5,26,36,.1), 0 4px 4px (.09), 0 9px 6px (.05), 0 17px 7px (.01), 0 26px 7px (0), inset 0 2px 8px rgba(255,255,255,.5). Secondary: 0 0 0 0.5px rgba(0,0,0,.05), 0 4px 30px rgba(0,0,0,.08). These replace accent colour as the differentiator.',
      'Fixed floating bottom pill nav: position fixed, bottom-6, left-1/2 -translate-x-1/2, bg-white, rounded-full, px-8 py-2, complex layered shadow; contains PP Mondwest "V" logo + the primary CTA button. Stays on top (z-50) across all scroll positions.',
      'Auto-scrolling testimonial carousel: testimonials array tripled for infinite illusion; setInterval 3s auto-advance, pauses on hover; prev/next circular buttons (w-12 h-12 rounded-full border); CSS transform translateX with transition cubic-bezier(.4,0,.2,1) 0.8s; cards are 427.5px wide on desktop (calc(100vw − 48px) mobile).',
    ],
    imagePrompts: [
      'editorial portrait photograph of a creative director in a minimal studio, natural window light, shallow depth of field, white walls, warm skin tones against a clean background, personal and considered rather than corporate',
      'animated website UI preview thumbnail, sleek modern design, motion graphics, dark on white, suitable as an infinite marquee tile and a mouse-trail hover GIF spawn — premium creative studio portfolio piece',
      'square avatar portrait, candid professional tone, circular crop, warm light, real-person feel — suitable for a testimonial card beside a short founder quote',
    ],
    source: 'user-prompt',
  },
  {
    id: 'liquid-glass-nature',
    name: 'Liquid Glass Nature',
    category: 'hero',
    aesthetics: ['premium', 'luxury', 'modern', 'creative', 'minimal', 'glassmorphism', 'cinematic', 'bold', 'dark'],
    industries: ['lifestyle', 'wellness', 'beauty', 'fashion', 'luxury', 'tech', 'ai', 'startup', 'creative', 'hospitality', 'food', 'nature', 'environment', 'art', 'design'],
    fonts: "Poppins (Google Fonts) — weight 500 for all headings, regular for body. Source Serif 4 (Google Fonts) — italic ONLY, used exclusively for emphasis words/phrases inside headings via <em> or .italic spans; never for full headlines or body text.",
    dna: {
      mood: 'Cinematic, premium, immersive — a full-bleed looping nature video supplies all colour and atmosphere while frosted glass panels float weightlessly above it. Zero interference from accent colours; the design trusts the footage. Quiet luxury with a technological edge.',
      typography: 'Poppins 500 for headings (text-6xl→7xl, tracking-[-0.05em]) and body; strict hierarchy via text-white opacity tiers (100/80/60/50) — no hue changes. Source Serif 4 italic is injected ONLY for specific emphatic words/phrases inside headings (the inline font-swap technique). Small-cap uppercase tracking-widest labels (text-xs) for section eyebrows.',
      color: 'Strict grayscale — ALL text is text-white at 100/80/60/50% opacity. No brand colour, no tint, no accent. The looping video background is the sole source of colour and warmth. Glass panels are rgba(255,255,255,0.01) → rgba(255,255,255,0) with opacity layering from the box-shadows and ::before gradients.',
      layout: 'Full-viewport flex-row split: LEFT panel 52% (main hero card), RIGHT panel 48% (desktop only, hidden on mobile). Left holds a liquid-glass-strong overlay card (absolute inset-4/6, rounded-3xl): nav bar at top, centred hero content (logo, h1, CTA, pills), bottom quote block. Right stacks: social pill top-right, community card, then feature card grid at bottom. A single full-screen autoplay muted looped video sits at z-0 behind all panels.',
      motion: 'hover:scale-105 transition-transform on all interactive elements; active:scale-95 on the primary CTA. Entrance animations are minimal — the video and glass do the heavy lifting. Social icon hover: text-white/80 transition-colors. No scroll-linked animations; the design is a single full-height hero, not a scrolling page.',
      imagery: 'One looping ambient nature/floral video fills the entire viewport (object-cover, z-0). Small product/lifestyle thumbnail inside the bottom feature card. No hero photography or illustration — the video is everything. Lucide line icons (Sparkles, Download, Wand2, BookOpen, ArrowRight, social icons) sit in w-8 h-8 rounded-full bg-white/10 containers.',
      signature: 'The two-tier CSS glass system (blur 4px "light" vs blur 50px "strong") with gradient-mask ::before pseudo-element borders — no border properties anywhere — floating above a full-screen nature video. Plus the strict grayscale text hierarchy and the Source Serif 4 inline italic word-swap in headings.',
    },
    techniques: [
      'Two-tier liquid glass CSS (@layer components): .liquid-glass — bg rgba(255,255,255,0.01), backdrop-filter blur(4px), inset box-shadow rgba(255,255,255,0.1). .liquid-glass-strong — same structure but blur(50px), box-shadow: 4px 4px 4px rgba(0,0,0,0.05) + inset rgba(255,255,255,0.15). Both classes: position relative, overflow hidden, no border property.',
      'Gradient-mask ::before border (no border class): ::before { content:""; position:absolute; inset:0; border-radius: inherit; padding: 1.4px (light) or 0.5px (strong); background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, transparent 40%, transparent 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%); -webkit-mask: linear-gradient(#fff,#fff) content-box, linear-gradient(#fff,#fff); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events:none; }',
      'Strict white-opacity text hierarchy: all text is text-white; hierarchy is expressed ONLY via opacity — /100 (primary), /80 (secondary headings/serif), /60 (body copy), /50 (labels/metadata). No hue, no colour.',
      'Inline Source Serif 4 italic swap: headings render as mixed-font spans — Poppins 500 for the main text, font-serif italic (Source Serif 4) injected via <em> or a .italic class on specific emphatic words. Same word-level swap technique as PP Mondwest in Boutique Studio Founder but for organic/nature tone.',
      '52/48 split-panel hero layout: flex-row min-h-screen; left panel (w-[52%]) contains main glass card with absolute inset-4 lg:inset-6 rounded-3xl liquid-glass-strong overlay; right panel (w-[48%], hidden on mobile, lg:flex) stacks social pill + community card + bottom feature grid with mt-auto flush bottom.',
      'Icon containers: all Lucide icons sit inside w-8 h-8 rounded-full bg-white/10 flex items-center justify-center wrappers — creating a consistent frosted-pill system for social links, feature indicators, and nav buttons.',
      'Bottom feature card composition (right panel): an outer liquid-glass rounded-[2.5rem] container holds two side-by-side liquid-glass rounded-3xl "mini cards" (Processing + Growth Archive) above a third wider liquid-glass card with a flower thumbnail, title/description, and a "+" action button — all glass, no backgrounds.',
    ],
    imagePrompts: [
      'slow looping aerial or macro nature footage — botanical, floral, or forest — lush greens and warm earth tones, cinematic colour grade, designed as a full-screen ambient video background behind frosted-glass UI panels',
      'macro close-up photograph of a flower or plant — rich saturated colours, soft bokeh, studio or natural light — used as a small thumbnail inside a glass feature card, 96×64px crop',
      'editorial product still of a botanical or floral AI interface, glass panels floating over a green nature background, minimal UI elements in white, premium and immersive',
    ],
    source: 'user-prompt',
  },
];

// ── Query / selection helpers ─────────────────────────────────────────────────
const StyleLibrary = (() => {
  function aestheticTags(d) {
    var p = (d.brandPositioning || '').toLowerCase();
    var ind = (d.industry || '').toLowerCase();
    var t = [];
    if (/premium|luxury|top of the market/.test(p)) t.push('premium', 'luxury');
    if (/boutique|personal/.test(p)) t.push('boutique', 'warm');
    if (/disruptor|innovative|challenger/.test(p)) t.push('bold', 'modern', 'disruptor');
    if (/affordable|value|accessible/.test(p)) t.push('approachable', 'minimal');
    if (/enterprise|scale/.test(p)) t.push('corporate', 'minimal');
    if (/trusted|expert|authority/.test(p)) t.push('editorial', 'trust');
    if (/local|community/.test(p)) t.push('warm', 'local');
    if (/fast|reliable|speed/.test(p)) t.push('clean', 'techy');
    if (/creative|media|design|agency|fashion|entertain/.test(ind)) t.push('bold', 'editorial', 'creative');
    if (/legal|financ|consult|insur/.test(ind)) t.push('editorial', 'corporate', 'trust');
    if (/tech|saas|software|startup/.test(ind)) t.push('techy', 'modern', 'minimal');
    if (!t.length) t.push('modern');
    return t;
  }

  function match(d, category) {
    var tags = aestheticTags(d);
    return STYLE_LIBRARY.filter(function (s) {
      if (category && s.category !== category && s.category !== 'full-site') return false;
      return s.aesthetics.some(function (a) { return tags.indexOf(a) !== -1; });
    });
  }

  function byName(name) {
    if (!name) return null;
    return STYLE_LIBRARY.find(function (s) { return s.name === name || s.id === name; }) || null;
  }

  // Resolve the style for a generation: a user-named style wins; otherwise auto-vary
  // (random among matches, avoiding an immediate repeat) so similar choices differ.
  function resolve(d) {
    if (d && d.visualStyle && d.visualStyle !== 'auto') {
      var named = byName(d.visualStyle);
      if (named) return named;
    }
    var pool = match(d || {});
    if (!pool.length) pool = STYLE_LIBRARY.slice();
    if (!pool.length) return null;
    var lastId = null;
    try { lastId = localStorage.getItem('epa_last_style'); } catch (e) {}
    if (pool.length > 1 && lastId) {
      var filtered = pool.filter(function (s) { return s.id !== lastId; });
      if (filtered.length) pool = filtered;
    }
    var pick = pool[Math.floor(Math.random() * pool.length)];
    try { localStorage.setItem('epa_last_style', pick.id); } catch (e) {}
    return pick;
  }

  function names() { return STYLE_LIBRARY.map(function (s) { return s.name; }); }

  return { resolve: resolve, match: match, byName: byName, names: names, aestheticTags: aestheticTags };
})();
