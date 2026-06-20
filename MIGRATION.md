# Migration cheat-sheet (moving to company accounts later)

Everything is deliberately portable. There is **no vendor lock-in** — the whole app
is one Git repo: static frontend + a stdlib-only Python backend. Moving to new
accounts is a handful of steps, listed here so it's painless.

Current (temporary) setup:
- **Code:** GitHub repo `friendsandhoesbro-ops/strange`
- **Frontend (the website):** Netlify → `https://gem21q.netlify.app`
- **Backend (Build with AI + learning):** Render → `https://prompt-architect-api-s8rn.onrender.com`

---

## 1. Move the code to a new GitHub (or any Git host)

```
git remote set-url origin https://github.com/NEW-ORG/NEW-REPO.git
git push -u origin main
```
That's it — the new remote now has the full history.

## 2. Move the frontend to a new Netlify (or Vercel / Cloudflare Pages / GitHub Pages)

- New host → "Import from Git" → pick the new repo. Publish directory = `.`, no build command.
- `netlify.toml` already sets this. Nothing in the code is Netlify-specific.
- You'll get a new URL; no code change needed (the backend allows all origins).

## 3. Move the backend to a new Render account (or Railway / Fly.io / a VPS)

- New host → deploy this repo as a Python web service.
  - Start command: `python server.py`  (it reads `$PORT` automatically)
  - `render.yaml` already configures this for Render blueprints.
- You'll get a new backend URL.

## 4. Point the frontend at the new backend — THE ONLY CODE CHANGE

Edit **one line** in `config.js`:
```js
var REMOTE_API = 'https://YOUR-NEW-BACKEND-URL';   // no trailing slash
```
Bump the version in `index.html` (`config.js?v=2` → `v=3`), commit, push. Done.

---

## Where every account-specific value lives (single source of truth)

| What | Where | Notes |
|------|-------|-------|
| Git remote | `git remote` (not in code) | `git remote set-url origin …` |
| Backend URL | `config.js` → `REMOTE_API` | the only URL hardcoded in the app |
| Backend port | auto (`$PORT`) | `server.py` reads it; no change needed |
| CORS | `server.py` → `Access-Control-Allow-Origin: *` | accepts any frontend origin, so new frontend URLs just work |
| Commit identity | repo-local git config | `git config user.email "you@company.com"` |

Nothing else is tied to a provider. No API keys live in the repo — users always
bring their own Claude/OpenAI key at runtime.
