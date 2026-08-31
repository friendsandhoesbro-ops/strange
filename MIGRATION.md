# Migration cheat-sheet — moving to the permanent accounts

No vendor lock-in: the whole app is one Git repo (static frontend + a stdlib-only
Python backend). But it is **not** a one-line change any more — the security
hardening pass pinned three account-specific values, and **two of them fail
silently**: the app still loads, and the backend calls just quietly do nothing.
Work through the checklist and nothing breaks.

Current (testing) setup:
- **Code:** GitHub `friendsandhoesbro-ops/strange`
- **Frontend:** Netlify → `https://peakprompt-engine.netlify.app`
- **Backend:** Render → `https://prompt-architect-api-s8rn.onrender.com`

---

## The four things that must change

| # | What | Where | Fails how? |
|---|------|-------|-----------|
| 1 | Backend URL | `config.js` → `REMOTE_API` | Loud — calls go to the old host |
| 2 | Backend URL **again** | `netlify.toml` → CSP `connect-src` | **Silent** — browser blocks every backend call |
| 3 | Allowed frontend origins | `server.py` → `_cors_origin()` | **Silent** — only if you leave `*.netlify.app` |
| 4 | Shared access key | `EPA_SHARED_KEY` env + `config.js` → `EPA_SHARED` | Loud — backend returns 403 |

Miss #2 and the site looks perfect but "Build with AI" does nothing, with only a
CSP violation in the console to explain it. That is the one that wastes an hour.

---

## 1. Move the code

```
git remote set-url origin https://github.com/NEW-ORG/NEW-REPO.git
git push -u origin main
```

Full history comes along. If the new account needs a different commit identity:

```
git config user.email "you@company.com"
git config user.name  "Your Name"
```

## 2. Deploy the backend first

Deploy this repo to the new Render (or Railway / Fly.io / VPS) account as a
Python web service. Start command `python server.py` — it reads `$PORT` itself.
`render.yaml` already describes this for Render blueprints.

**Set these environment variables on the new backend:**

| Variable | Value |
|----------|-------|
| `EPA_SHARED_KEY` | a fresh random string — do **not** keep `epa-bake-4f2c` |
| `EPA_PUBLIC` | `1` (Render sets its own marker too, but be explicit) |

Note the new backend URL. You need it twice below.

## 3. Deploy the frontend

New Netlify (or Vercel / Cloudflare Pages) → "Import from Git" → pick the new
repo. Publish directory `.`, no build command; `netlify.toml` already sets this.

## 4. Point the frontend at the new backend — THREE edits, not one

**a. `config.js`** — the backend URL and the matching shared key:

```js
var REMOTE_API = 'https://YOUR-NEW-BACKEND-URL';   // no trailing slash
...
window.EPA_SHARED = 'the-same-value-you-set-for-EPA_SHARED_KEY';
```

**b. `netlify.toml`** — the CSP `connect-src` pins the backend by exact URL.
Replace the old Render URL with the new one:

```
connect-src 'self' https://YOUR-NEW-BACKEND-URL https://*.mux.com https://litix.io https://*.litix.io;
```

If you skip this the browser blocks every backend request and the failure is
near-invisible. Confirm in DevTools → Console that there is no CSP violation.

**c. `server.py` → `_cors_origin()`** — only needed if the frontend will NOT be
on a `*.netlify.app` domain. It currently reflects localhost and `*.netlify.app`
only, so a custom domain or a Vercel/Cloudflare host is refused:

```python
if re.match(r'^https://([a-z0-9-]+\.)?your-domain\.com$', o):
    return o
```

Staying on a `*.netlify.app` URL? Leave this alone — it already works.

**d.** Bump the cache-busters in `index.html` for whatever you touched
(`config.js?v=3` → `v=4`), commit, push.

---

## 5. Rotate the access code (do this — the old one was shared for testing)

The 6-digit access gate uses a TOTP secret that lives in **three files that must
be changed together**:

- `auth.js` — the gate itself
- `save.js` — password for the encrypted "Save My Work" zip
- `code-generator.html` — your private live-code viewer

Generate a new Base32 secret, replace it in all three, bump `auth.js?v=`, redeploy.
Anyone holding the old code loses access, which is the point when leaving a
testing account.

`code-generator.html` is **git-ignored and untracked** — it has never been
deployed and must never be. It shows the live code; publishing it removes the gate.
Keep your local copy, and copy it by hand to any new machine.

To turn the gate off entirely: remove the `auth.js` `<script>` from `index.html`
and redeploy. (The in-app 2FA toggle is per-device only — it does not affect
other visitors.)

---

## Post-migration verification

Run all five. Two of these are the silent failures.

1. Frontend loads, no console errors.
2. **DevTools → Console shows no CSP violation** (catches a missed `netlify.toml`).
3. "Build with AI" streams a response (catches a wrong `EPA_SHARED` / backend URL).
4. Access gate accepts a code from the **new** secret and rejects the old one.
5. `tests.html` → 67/67.

---

## Where every account-specific value lives

| What | Where | Notes |
|------|-------|-------|
| Git remote | `git remote` (not in code) | `git remote set-url origin …` |
| Backend URL | `config.js` → `REMOTE_API` **and** `netlify.toml` CSP `connect-src` | **two places — this is the trap** |
| Shared key | `EPA_SHARED_KEY` env + `config.js` → `EPA_SHARED` | must match; deterrence, not real auth |
| Allowed origins | `server.py` → `_cors_origin()` | localhost + `*.netlify.app` today |
| Access-gate secret | `auth.js`, `save.js`, `code-generator.html` | rotate all three together |
| Backend port | auto (`$PORT`) | no change needed |
| Commit identity | repo-local git config | `git config user.email …` |

No API keys live in the repo — users always bring their own Claude/OpenAI key at
runtime.
