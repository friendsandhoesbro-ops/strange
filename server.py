#!/usr/bin/env python3
"""
Enterprise Prompt Architect — Local server with AI API proxy
Run: python server.py
"""

import http.server
import socketserver
import json
import urllib.request
import urllib.error
import ssl
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import zipfile
import io

PORT       = 3737
DIR        = os.path.dirname(os.path.abspath(__file__))
LEARN_FILE = os.path.join(DIR, 'learning.json')  # local, non-sensitive usage log
API_URLS = {
    'claude': 'https://api.anthropic.com/v1/messages',
    'openai': 'https://api.openai.com/v1/chat/completions',
}

BUILD_SYSTEM_PROMPT = """You are a senior front-end engineer and design director. Generate a complete, stunning, production-ready STATIC website using pure HTML, CSS, and vanilla JavaScript. No build tools, no npm, no frameworks.

OUTPUT FORMAT — wrap every file in XML tags:
<file path="index.html">
...the complete HTML document...
</file>

SELF-CONTAINED RULE (critical — this is what guarantees the site is ALWAYS styled):
- Put ALL CSS inside a single <style> tag in the <head>.
- Put ALL JavaScript inside a single <script> tag just before </body>.
- DO NOT create a separate .css or .js file. DO NOT use href="css/styles.css" or src="js/main.js".
  Separate style/script files frequently get truncated and leave the page completely unstyled —
  inlining everything into index.html prevents this failure entirely.
- The result MUST render perfectly whether index.html is opened directly OR served from any folder.

DEFAULT TO ONE RICH, LONG-SCROLL PAGE:
- Build ONE polished index.html with anchored sections: sticky header/nav, hero, trust bar,
  services/features, work or case studies, about, testimonials, FAQ, and a contact section
  with a working validated form (styled success state, no backend), then footer.
- Nav links jump to sections (href="#services") with smooth scrolling and an active state.
- Only add extra .html pages if the spec genuinely requires them — and if you do, EACH page
  must also inline its own complete <style> and <script> (never link a shared external file).

TECH RULES (zero tolerance):
- Pure HTML5 + modern CSS + vanilla JavaScript ONLY. No React/Vue/TypeScript/npm/package.json.
- No CSS/JS frameworks (no Tailwind, no Bootstrap) — hand-craft the CSS inside the <style> block.
- Google Fonts via <link> in <head> are allowed (preconnect + display=swap).
- Images: https://picsum.photos/seed/<unique-word>/<w>/<h> placeholders; prefer CSS gradients,
  patterns, and inline SVG illustrations.
- Icons: inline SVG only (stroke-based) — never icon-font CDNs.

DESIGN EXECUTION (the prompt below contains the full art direction — follow it precisely):
- Define the colour system as CSS custom properties in :root.
- Fluid typography with clamp(); generous spacing; strong visual hierarchy.
- Subtle scroll-reveal animations via IntersectionObserver (run once; respect prefers-reduced-motion).
- Every interactive element has hover, focus-visible, and active states.
- Mobile-first responsive: verify mentally at 375px, 768px, 1280px, with a working hamburger menu.
- It must look hand-crafted and expensive — never a generic template.

QUALITY RULES:
- Output the COMPLETE file — no placeholders, no TODO stubs, no ellipses, no "add more here".
- Finish every tag and CSS rule you start. A complete, fully-styled page is the only acceptable result.
- Semantic HTML: header, nav, main, section, article, footer; exactly one <h1>.
- The contact form validates inline in JavaScript and shows a styled success message.

IMPORTANT — DIRECT BUILD MODE:
This is an automated code generator that streams files. The brief below may say to first
"offer 2-3 design options and ask the user to choose" — IGNORE that instruction here. Do NOT
ask questions and do NOT present options. Silently pick the single strongest design direction
and output the complete website as <file> blocks directly."""


class Handler(http.server.SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def log_message(self, *a):
        pass  # silence request logs

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Always serve fresh files — stale JS after updates breaks the app
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/ping':
            self._json_ok({'ok': True})
        elif self.path == '/api/insights':
            self._handle_insights()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/build':
            self._handle_build()
        elif self.path == '/api/export':
            self._handle_export()
        elif self.path == '/api/open-vscode':
            self._handle_open_vscode()
        elif self.path == '/api/learn':
            self._handle_learn()
        else:
            self.send_error(404)

    # ── helpers ────────────────────────────────────────────────────────────

    def _read_body(self):
        n = int(self.headers.get('Content-Length', 0))
        return json.loads(self.rfile.read(n)) if n else {}

    def _json_error(self, code, msg):
        body = json.dumps({'error': msg}).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _sse_write(self, obj):
        line = f'data: {json.dumps(obj)}\n\n'.encode()
        self.wfile.write(line)
        self.wfile.flush()

    def _json_ok(self, obj):
        body = json.dumps(obj).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # ── export handler: save generated site to a local folder ─────────────

    def _handle_export(self):
        try:
            body  = self._read_body()
            name  = (body.get('name') or 'my-website').strip()
            files = body.get('files') or []
            prompt = body.get('prompt') or ''

            if not files:
                self._json_error(400, 'No files to export')
                return

            slug = re.sub(r'[^a-z0-9-]+', '-', name.lower()).strip('-')[:50] or 'site'
            base = os.path.join(DIR, 'generated-sites', slug)

            written = 0
            for f in files:
                rel = (f.get('path') or '').replace('\\', '/').lstrip('/')
                # Path safety: stay inside the export folder
                if not rel or '..' in rel.split('/') or ':' in rel:
                    continue
                dest = os.path.normpath(os.path.join(base, rel))
                if not dest.startswith(os.path.normpath(base)):
                    continue
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                with open(dest, 'w', encoding='utf-8') as fh:
                    fh.write(f.get('content') or '')
                written += 1

            # Save the original prompt so the user can iterate on it in the IDE
            if prompt:
                with open(os.path.join(base, 'PROMPT.md'), 'w', encoding='utf-8') as fh:
                    fh.write('# Original Build Prompt\n\n'
                             'This website was generated from the specification below.\n'
                             'To make changes with an AI assistant (Claude Code, Copilot, etc.),\n'
                             'reference this file as context and describe what to change.\n\n'
                             '---\n\n' + prompt)

            with open(os.path.join(base, 'HOW-TO-EDIT.md'), 'w', encoding='utf-8') as fh:
                fh.write('# How to Edit This Website\n\n'
                         '## Live preview\n'
                         f'1. Keep Prompt Architect running\n'
                         f'2. Open: http://localhost:{PORT}/generated-sites/{slug}/index.html\n'
                         '3. Edit any file here in VS Code, save, then refresh the browser\n\n'
                         '## Editing with AI\n'
                         'PROMPT.md contains the full original specification. Open this folder\n'
                         'in VS Code with an AI assistant and say e.g.:\n'
                         '"Read PROMPT.md for context. Change the hero headline to X and\n'
                         'add a pricing section to index.html in the same design style."\n\n'
                         '## Publishing\n'
                         'This is a static site — upload the files to Netlify Drop\n'
                         '(app.netlify.com/drop), GitHub Pages, or any web host.\n')

            self._json_ok({
                'ok':     True,
                'folder': base,
                'url':    f'/generated-sites/{slug}/index.html',
                'count':  written,
            })
        except Exception as e:
            self._json_error(500, str(e))

    # ── VS Code launcher ───────────────────────────────────────────────────

    def _handle_open_vscode(self):
        try:
            body   = self._read_body()
            folder = body.get('folder') or ''
            safe_root = os.path.normpath(os.path.join(DIR, 'generated-sites'))
            if not os.path.normpath(folder).startswith(safe_root):
                self._json_error(400, 'Folder must be inside generated-sites')
                return
            if not os.path.isdir(folder):
                self._json_error(404, 'Folder does not exist — export first')
                return

            code = shutil.which('code')
            if not code:
                cand = os.path.join(os.environ.get('LOCALAPPDATA', ''),
                                    'Programs', 'Microsoft VS Code', 'bin', 'code.cmd')
                code = cand if os.path.isfile(cand) else None
            if not code:
                self._json_error(404, 'VS Code CLI not found — open the folder manually')
                return

            subprocess.Popen([code, folder], shell=False,
                             creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
            self._json_ok({'ok': True, 'folder': folder})
        except Exception as e:
            self._json_error(500, str(e))

    # ── learning loop: persist non-sensitive usage + serve aggregates ───────

    # Only these (non-sensitive, structured) keys are ever stored
    LEARN_KEYS = ('event', 'mode', 'industry', 'revenueModel', 'targetMarket', 'goal',
                  'architecture', 'archConfidence', 'builder', 'promptScore',
                  'entityType', 'projectType', 'accepted', 'field')

    def _read_learn_log(self):
        if not os.path.isfile(LEARN_FILE):
            return []
        try:
            with open(LEARN_FILE, 'r', encoding='utf-8') as fh:
                data = json.load(fh)
                return data if isinstance(data, list) else []
        except Exception:
            return []

    def _handle_learn(self):
        try:
            entry = self._read_body()
            if not isinstance(entry, dict):
                self._json_ok({'ok': True, 'count': 0})
                return
            clean = {k: entry[k] for k in self.LEARN_KEYS if k in entry}
            clean['ts'] = int(time.time() * 1000)
            log = self._read_learn_log()
            log.append(clean)
            log = log[-2000:]  # cap the file
            with open(LEARN_FILE, 'w', encoding='utf-8') as fh:
                json.dump(log, fh)
            self._json_ok({'ok': True, 'count': len(log)})
        except Exception as e:
            self._json_error(500, str(e))

    def _handle_insights(self):
        try:
            log = self._read_learn_log()
            gens = [e for e in log if e.get('event') == 'generate']
            by_industry, by_builder, scores = {}, {}, []
            for e in gens:
                arch = e.get('architecture')
                if arch:
                    ind = e.get('industry') or 'Unspecified'
                    by_industry.setdefault(ind, {})
                    by_industry[ind][arch] = by_industry[ind].get(arch, 0) + 1
                b = e.get('builder')
                if b:
                    by_builder[b] = by_builder.get(b, 0) + 1
                if isinstance(e.get('promptScore'), (int, float)):
                    scores.append(e['promptScore'])
            avg = round(sum(scores) / len(scores), 1) if scores else None
            self._json_ok({'ok': True, 'total': len(gens),
                           'byIndustry': by_industry, 'byBuilder': by_builder, 'avgScore': avg})
        except Exception as e:
            self._json_error(500, str(e))

    # ── build handler ──────────────────────────────────────────────────────

    def _handle_build(self):
        try:
            body     = self._read_body()
            platform = body.get('platform', 'claude')
            api_key  = (body.get('apiKey') or '').strip()
            model    = body.get('model', 'claude-sonnet-4-6')
            prompt   = body.get('prompt', '')

            if not api_key:
                self._json_error(400, 'API key is required')
                return
            if not prompt:
                self._json_error(400, 'Prompt is required')
                return
            if platform not in API_URLS:
                self._json_error(400, f'Unknown platform: {platform}')
                return

            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('X-Accel-Buffering', 'no')
            self.end_headers()

            if platform == 'claude':
                self._stream_claude(api_key, model, prompt)
            else:
                self._stream_openai(api_key, model, prompt)

        except Exception as e:
            try:
                self._sse_write({'error': str(e), 'done': True})
            except Exception:
                pass

    # ── Claude streaming ───────────────────────────────────────────────────

    def _stream_claude(self, api_key, model, prompt):
        # A complete multi-page site needs far more than 8k tokens of output
        max_tokens = 32000 if 'opus' in model else 64000
        payload = json.dumps({
            'model':      model,
            'max_tokens': max_tokens,
            'stream':     True,
            'system':     BUILD_SYSTEM_PROMPT,
            'messages':   [{'role': 'user', 'content': prompt}],
        }).encode()

        req = urllib.request.Request(
            API_URLS['claude'],
            data=payload,
            headers={
                'Content-Type':      'application/json',
                'x-api-key':         api_key,
                'anthropic-version': '2023-06-01',
            }
        )
        self._do_stream(req, 'claude')

    # ── OpenAI streaming ───────────────────────────────────────────────────

    def _stream_openai(self, api_key, model, prompt):
        payload = json.dumps({
            'model':      model,
            'max_tokens': 16384,
            'stream':     True,
            'messages': [
                {'role': 'system',  'content': BUILD_SYSTEM_PROMPT},
                {'role': 'user',    'content': prompt},
            ],
        }).encode()

        req = urllib.request.Request(
            API_URLS['openai'],
            data=payload,
            headers={
                'Content-Type':  'application/json',
                'Authorization': f'Bearer {api_key}',
            }
        )
        self._do_stream(req, 'openai')

    # ── core streaming loop ────────────────────────────────────────────────

    def _do_stream(self, req, platform):
        ctx = ssl.create_default_context()
        try:
            with urllib.request.urlopen(req, context=ctx) as resp:
                for raw_line in resp:
                    line = raw_line.decode('utf-8', errors='replace').strip()
                    if not line.startswith('data:'):
                        continue
                    data = line[5:].strip()
                    if data in ('[DONE]', ''):
                        continue
                    try:
                        obj  = json.loads(data)
                        text = ''
                        if platform == 'claude':
                            if obj.get('type') == 'content_block_delta':
                                text = obj.get('delta', {}).get('text', '')
                        else:  # openai
                            choices = obj.get('choices', [])
                            if choices:
                                text = choices[0].get('delta', {}).get('content') or ''
                        if text:
                            self._sse_write({'text': text, 'done': False})
                    except (json.JSONDecodeError, KeyError):
                        pass

            self._sse_write({'done': True})

        except urllib.error.HTTPError as e:
            raw  = e.read().decode('utf-8', errors='replace')
            try:
                err_obj = json.loads(raw)
                err = err_obj.get('error', {})
                msg = err.get('message', raw) if isinstance(err, dict) else str(err)
            except Exception:
                msg = raw[:300]
            self._sse_write({'error': f'API {e.code}: {msg}', 'done': True})

        except Exception as e:
            self._sse_write({'error': str(e), 'done': True})


# ── entry point ────────────────────────────────────────────────────────────

class ThreadingServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    # Handle each request on its own thread so one slow/streaming connection
    # (e.g. an AI build, or an idle browser keep-alive) can't block the others.
    daemon_threads = True


if __name__ == '__main__':
    os.chdir(DIR)
    # NOTE: never set allow_reuse_address on Windows — SO_REUSEADDR lets multiple
    # processes bind the same port simultaneously, silently breaking all connections.
    # With it off, a second instance fails fast with WSAEADDRINUSE (handled below).
    try:
        with ThreadingServer(('', PORT), Handler) as httpd:
            print(f'Enterprise Prompt Architect running on http://localhost:{PORT}')
            sys.stdout.flush()
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                pass
    except OSError as e:
        # Port already in use — another instance is running, which is fine
        if getattr(e, 'errno', None) in (98, 10048) or 'address' in str(e).lower():
            print(f'Server already running on port {PORT} — nothing to do.')
        else:
            raise
