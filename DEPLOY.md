# Putting Prompt Architect online (so anyone can use it — no install)

The whole app is plain HTML/CSS/JavaScript. The prompt generator, scoring,
glossary, guidance, and all the strategy logic run **entirely in the visitor's
browser** — so you can host it as a normal static website. No server needed for
the core experience.

## Option 1 — Netlify Drop (easiest, ~1 minute, free)

1. Go to **https://app.netlify.com/drop**
2. Drag the **`enterprise-prompt-architect`** folder onto the page.
3. Done — Netlify gives you a live link like `https://your-name.netlify.app`.
   Share it with anyone.

To use your own domain later: in the Netlify dashboard → Domain settings.

## Option 2 — GitHub Pages (free, good if you use GitHub)

1. Create a new GitHub repository and upload the folder's contents to it.
2. Repo → **Settings → Pages** → Source: `main` branch, `/ (root)` → Save.
3. Your site goes live at `https://your-username.github.io/your-repo/`.

## Option 3 — Vercel (free)

1. Install the Vercel CLI or use the website, point it at this folder.
2. It auto-detects a static site (no framework) and deploys it.

---

## What works on the web version vs the desktop app

**Works everywhere (web + desktop):**
- The full 7-step wizard, prompt generation, quality score, validation checklist
- The glossary, "works well together", cross-step guidance, Individual/Business
- **Quick Launch** — copy your prompt and open Lovable, v0, Bolt, Replit, Claude.ai
- **Download ZIP** and **Open in CodeSandbox**

**Needs the free desktop app (the Python `server.py` part):**
- The one-click **Build with AI** (calls Claude/OpenAI with your key)
- **Open in VS Code** and saving to a local folder
- The learning loop's saved history (`/api/learn`, `/api/insights`)

The web version detects this automatically and shows a short note pointing people
to Quick Launch — nothing breaks.

## Want the AI build to work online too?

That needs the `server.py` backend hosted somewhere that runs Python (e.g. Render
or Railway, free tiers available), and the frontend pointed at it. That's a bigger
step — ask and I'll set it up when you're ready.
