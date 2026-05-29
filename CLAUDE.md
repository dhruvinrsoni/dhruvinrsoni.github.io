# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Workspace Overview

This is a **multi-project workspace** — a local mirror of all `github.com/dhruvinrsoni` repositories. Each subdirectory is an independent GitHub repo with its own deployment pipeline (GitHub Pages), dependencies, and build system. There is no monorepo tooling at the root level.

---

## Project Map

| Project | Stack | Build Required | Live URL |
|---|---|---|---|
| `dhruvinrsoni.github.io/` | Vanilla HTML/CSS/JS | No | https://dhruvinrsoni.github.io/ |
| `dhruvinrsoni/` | Jekyll | GitHub Pages (auto) | https://dhruvinrsoni.github.io/dhruvinrsoni/ |
| `samvada-studio/` | React 18 + TS + Vite | Yes | https://dhruvinrsoni.github.io/samvada-studio/ |
| `smruti-cortex/` | TS + esbuild + Chrome MV3 | Yes | Chrome Web Store |
| `agentskills-garden/` | Python + Jinja2 | Yes (`build_site.py`) | https://dhruvinrsoni.github.io/agentskills-garden/ |
| `power-user-scripts/` | MkDocs + Material | Yes (`mkdocs`) | https://dhruvinrsoni.github.io/power-user-scripts/ |
| `cipher-alchemist/` | Vanilla HTML/CSS/JS | No | https://dhruvinrsoni.github.io/cipher-alchemist/ |
| `smart-logger/` | Vanilla HTML/CSS/JS | No | https://dhruvinrsoni.github.io/smart-logger/ |
| `ankura-array/` | Vanilla HTML/CSS/JS | No | https://dhruvinrsoni.github.io/ankura-array/ |
| `todolistapp/` | React 16 + CRA + Redux | Yes | https://todolist-dhruvinsoni.firebaseapp.com/ |
| `project-templates/` | Node.js generator (zero deps) | No | — |

---

## Per-Project Commands

### samvada-studio (React + Vite + TypeScript)
```bash
cd samvada-studio
npm install
npm run dev           # Vite dev server at http://localhost:5173
npm run build:clean   # rm -rf dist && tsc -b && vite build
npm run lint          # ESLint 9
npm run preview       # preview production build locally
```
Production build requires `BASE_URL=/samvada-studio/` (set automatically in `deploy.yml`). TypeScript strict mode + `noUnusedLocals` + `noUncheckedIndexedAccess`. Path alias `@/*` maps to `src/*`.

### smruti-cortex (Chrome MV3 Extension)
```bash
cd smruti-cortex
npm install           # also installs Husky pre-commit hook
npm run dev           # esbuild watch; load dist/ in chrome://extensions
npm run build         # ~30s production build (sync-version → tsc → copy-static → esbuild)
npm test              # Vitest unit tests (~60s, 1,252+ tests)
npm run e2e           # build + Playwright E2E (45 tests, 7 specs)
npm run lint          # errors block; warnings advisory
npm run verify        # full pipeline gate (lint + build + tests + coverage + E2E)
npm run ship patch    # full release: bump, changelog, tag, GitHub Release, zip
```
**See `smruti-cortex/CLAUDE.md` for the full playbook** — file map, domain skills, manifest permission discipline, release workflow, test/refactor constitution.

### agentskills-garden (Python static site)
```bash
cd agentskills-garden
pip install -r requirements.txt          # PyYAML, Jinja2, Markdown, requests
python scripts/build_site.py             # build → _site/
python scripts/build_site.py --serve     # build + serve at :8000
python scripts/validate_skills.py        # validate registry + skill frontmatter
python scripts/check-links.py            # validate internal markdown links
```
Production: `BASE_URL=/agentskills-garden` env var required.

### power-user-scripts (MkDocs)
```bash
cd power-user-scripts
pip install -r .github/pages/requirements.txt    # mkdocs-material, mkdocstrings, etc.
cd .github/pages
python scripts/prebuild.py                        # copy external markdown into docs/_imported/
mkdocs serve                                       # local preview
mkdocs build --strict --site-dir _site            # production build
```

### Vanilla no-build projects (dhruvinrsoni.github.io, cipher-alchemist, smart-logger, ankura-array)
```bash
# Open index.html directly, or for PWA/service-worker testing:
python -m http.server 8000
# or: npx live-server --port=8000
```
No install step. Deploy by pushing `main` to GitHub Pages.

Add or edit a Launchpad card with `node tools/add-card.mjs` (zero-dep generator; `--update <id>`, `--validate`, `--dry-run`) — see `dhruvinrsoni.github.io/tools/README.md`.

### todolistapp (Create React App — legacy)
```bash
cd todolistapp
npm install
npm start        # CRA dev server
npm run build    # production build
npm test         # CRA/Jest tests
```

### project-templates (scaffolding generator)
```bash
cd project-templates
# No install needed
node scripts/init-project.mjs --flavor react-vite-pwa --name my-app --description "..."
node scripts/init-project.mjs --flavor vanilla-pwa --name my-pwa --dry-run
python scripts/validate-templates.py    # validate all 8 template flavors
```
Available flavors: `vanilla-pwa`, `node-typescript`, `react-vite-pwa`, `chrome-extension`, `spring-boot`, `scripts-toolbox`, `nano-app-collection`, `python-tool`.

---

## Architecture Patterns

### Vanilla PWA pattern (cipher-alchemist, smart-logger, ankura-array, dhruvinrsoni.github.io)

All follow the same pattern:
- `index.html` — entry point, inline SVG favicon as data-URI (currently 🌱 emoji), comprehensive `<head>` meta block (OG, Twitter Cards, Apple/iOS, JSON-LD schema)
- `manifest.json` / `manifest.webmanifest` — PWA config
- `sw.js` — service worker (cache-first strategy)
- `js/` or `scripts/` — one feature per file, no cross-imports unless strictly necessary, no build step, no frameworks, **no comments**

The Launchpad (`dhruvinrsoni.github.io`) uses a SOLID file split: `styles/tokens.css` defines all design tokens; 4 more CSS files layer on top. `scripts/data.js` is the single source of project data; `scripts/render.js` consumes it.

### Cross-site design tokens (dhruvinrsoni.github.io/styles/tokens.css)

All four GitHub Pages sites share this palette:
- Background dark: `#0d1117` | Elevated: `#11161d` | Card: `#161b22`
- Accent blue: `#0a84ff` (light) / `#58a6ff` (dark)
- Text: `#e6edf3` | Muted: `#8b949e` | Border: `#2a313c`
- Theme color (manifest + meta): `#0a84ff`

### samvada-studio state architecture

- Global state via React Context + `useReducer` in `src/contexts/ChatContext.tsx`
- Multi-provider LLM abstraction in `src/utils/llmService.ts` — add new providers here
- All conversation data persisted in `localStorage` via `idb`
- No backend required for cloud LLM providers; optional CORS proxy in `cors-proxy-server.js` (Vite plugin handles proxy in dev)
- IST timestamps baked into build via `vite.config.ts` define plugin

### agentskills-garden build pipeline

Source of truth is `registry.yaml` + per-skill `SKILL.md` files under `skills/`. `build_site.py` reads the registry, renders Jinja2 templates from `scripts/site_templates/`, and writes to `_site/`. Static assets (`manifest.webmanifest`, `og-image.png`, `apple-touch-icon.png`) are copied from `scripts/site_templates/` to `_site/` at build time.

---

## Shared Conventions Across Projects

- **No comments** in JS/HTML/CSS (vanilla projects) — code should be self-explanatory via naming
- **No frameworks or npm** in vanilla PWA projects — stays zero-dependency
- **Deploy = push `main`** — GitHub Actions CI/CD handles the rest for all GitHub Pages sites
- **Commit message prefixes** (used by smruti-cortex release automation, adopted broadly): `fix:`, `feat:`, `docs:`, `chore:`, `refactor:`, `test:`

---

## Cross-Site Tracker

`dhruvinrsoni.github.io/TODO.md` tracks one-time setup tasks across all four active GitHub Pages sites. Check it before assuming a feature is complete.
