# TODO — One-time setup items pending across the GitHub Pages sites

> Last updated: **2026-05-11**.
> Each item is a "yes finite, easy to complete" task that needs a real asset, a
> credential, or a tiny config edit. Check items off as they ship. New items go
> at the top of the relevant section.

---

## Cross-site (applies to all 4 sites)

- [ ] Pick a unified favicon family — all 4 sites currently use the same
      inline 🌱 SVG (sprout emoji). Replacing with a custom logo SVG/PNG set
      would unify the brand.
- [ ] Decide on a uniform OG image style (e.g. dark background + site name +
      tagline overlay). Then create per-site 1200×630 PNGs.

---

## Launchpad — https://dhruvinrsoni.github.io/

Repo: `dhruvinrsoni/dhruvinrsoni.github.io`

- [x] Create `og-image.png` (1200×630) at repo root.
      Used by: `<meta property="og:image">` and `<meta name="twitter:image">` in `index.html`.
- [x] Create `apple-touch-icon.png` (180×180) at repo root.
      Used by: `<link rel="apple-touch-icon">` in `index.html`.
- [x] PNG favicon fallback wired — reuses `icons/rocket-space/icon-192.png`
      via `<link rel="icon" type="image/png">` (no new 16/32 binaries needed).
- [x] Claimed ownership in Google Search Console + Bing Webmaster — real
      `google-site-verification` + `msvalidate.01` tags are live in `index.html`.
      (Next: submit `sitemap.xml` in each dashboard.)
- [x] Added `sitemap.xml` + `robots.txt` at repo root.
- [x] Documented the full SEO + PWA setup in `docs/seo-and-pwa.md` (plain words).
- [x] iOS install sheet — the Install button now teaches Share → Add to Home
      Screen on iPhone (Apple blocks automatic PWA install prompts).

## Portfolio — https://dhruvinrsoni.github.io/dhruvinrsoni/

Repo: `dhruvinrsoni/dhruvinrsoni`

- [x] Create `assets/og-image.png` (1200×630) in the repo, then **uncomment
      the `image:` line** in `_config.yml` to wire it into og:image / twitter:image.
- [ ] Optional: design + adopt a richer custom Jekyll theme (the "Ubuntu-OS
      style portfolio" idea). When that happens, also update the page's H1 /
      metadata to formally adopt the "Portfolio" nickname.

## power-user-scripts — https://dhruvinrsoni.github.io/power-user-scripts/

Repo: `dhruvinrsoni/power-user-scripts`

- [x] Create `og-image.png` (1200×630) in `.github/pages/docs/`.
      Referenced from `overrides/main.html` as `og-image.png`.
- [x] Create `apple-touch-icon.png` (180×180) in `.github/pages/docs/`.
- [ ] Optional: replace Material's default "M" favicon with a custom one
      (drop into `.github/pages/docs/assets/images/favicon.png`).

## agentskills-garden — https://dhruvinrsoni.github.io/agentskills-garden/

Repo: `dhruvinrsoni/agentskills-garden`

- [x] Create `og-image.png` (1200×630). Easiest spot: put it under
      `scripts/site_templates/` and extend `build_site.py` to copy it to
      `_site/og-image.png` at build time (same pattern as the manifest copy).
- [x] Create `apple-touch-icon.png` (180×180) — same approach.
- [ ] Optional: replace the inline 🌱 SVG favicon with a logo PNG/SVG.

---

## What's already done (no action needed)

All four sites now ship with:
- Comprehensive `<head>` meta block — document basics, SEO, color scheme,
  Open Graph, Twitter Cards, Apple/iOS, Microsoft Tile.
- PWA manifest (`manifest.webmanifest`) linked from the head.
- Schema.org JSON-LD structured data (`WebSite` + per-site additions).
- `theme-color` light + dark variants.
- Responsive layouts (mobile-first; phone DevTools-verified).

Site-specific:

- **Launchpad** — full SOLID file split (5 CSS + 8 JS modules), sort + view
  toolbars, share affordances (Copy / Web Share API / QR), scroll-to-bottom
  FAB, responsive grid (1/2/3/4 cols), fluid container (max-width 1400px).
- **Portfolio** — `_config.yml` enables `jekyll-seo-tag` + `jekyll-sitemap`;
  proper title / description / `sameAs` social array via Jekyll's default
  theme + the SEO plugin.
- **power-user-scripts** — responsive hero (added `@media` breakpoints for
  ≤600px and ≤380px), comprehensive meta via `overrides/main.html` Jinja2
  `extrahead` block, JSON-LD includes `SoftwareSourceCode`.
- **agentskills-garden** — comprehensive meta directly in `base.html`,
  JSON-LD includes `SoftwareSourceCode`, manifest auto-copied at build.

---

## Verification tools (for when assets are added)

| Tool | What it checks |
|---|---|
| https://metatags.io/ | Multi-platform preview (Google / X / Facebook / LinkedIn / Slack / Pinterest / Discord) |
| https://developers.facebook.com/tools/debug/ | Open Graph (Meta's official debugger) |
| https://cards-dev.twitter.com/validator | Twitter Card preview |
| https://search.google.com/test/rich-results | JSON-LD schema parses correctly |
| Chrome DevTools → Lighthouse | SEO score + PWA installability |
