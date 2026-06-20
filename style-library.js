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
