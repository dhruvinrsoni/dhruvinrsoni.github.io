# SEO & PWA — what's on this site and why

A plain-words tour of every search/social/installability tag on the Launchpad, ordered
**easiest → deepest**. Each item: *why it exists · what we did · how*. Everything lives in
`index.html`'s `<head>` unless noted.

> TL;DR — SEO is "help search engines + social apps understand and show the page." PWA is
> "let people install the site like an app." Most of this is just `<meta>` tags; nothing here
> needs a build step.

---

## 1. Title & description
- **Why:** the title is the blue headline in Google + the browser-tab text; the description is
  the grey snippet under it. They drive whether people click.
- **What:** `<title>Dhruvin Soni — Senior Software Engineer · Apps, Projects & Profiles</title>`
  and a ~150-char `<meta name="description">` packed with real keywords (web apps, PWAs, Chrome
  extensions, open-source).
- **How:** keep title ~60 chars (Google truncates longer), description ~150. Keyword-first, honest.

## 2. Canonical URL
- **Why:** tells Google "this is THE address of this page" so the same content on different URLs
  (e.g. `?utm=...`) isn't treated as duplicates.
- **What/How:** `<link rel="canonical" href="https://dhruvinrsoni.github.io/" />` — one absolute URL.

## 3. Robots — the meta tag + `robots.txt`
- **Why:** controls what crawlers may do. The meta tag is per-page; `robots.txt` is site-wide.
- **What:** meta `index, follow, max-image-preview:large` (index me, follow my links, allow big
  image previews). `robots.txt` at the site root allows everyone and points to the sitemap.
- **How:** `robots.txt` must sit at the domain root (`/robots.txt`) — it does.

## 4. `sitemap.xml`
- **Why:** a machine-readable list of pages so crawlers find everything fast; also the file you
  submit in Search Console.
- **What/How:** `sitemap.xml` at the root lists the hub URL with `lastmod`/`changefreq`/`priority`.
  Child apps (samvada-studio, etc.) are separate repos with their *own* sitemaps, so they're not
  listed here.

## 5. theme-color & color-scheme
- **Why:** colors the mobile browser's address bar / UI to match the site; declares we support
  light + dark.
- **What/How:** two `theme-color` tags (one per `prefers-color-scheme`) + `color-scheme: light dark`.

## 6. Favicons
- **Why:** the little icon in the tab / bookmarks.
- **What:** primary is an inline SVG emoji (🌱 — crisp at any size, zero network requests); a PNG
  fallback (`icons/rocket-space/icon-192.png`) covers browsers that ignore SVG favicons.

## 7. Open Graph (OG)
- **Why:** when the link is pasted into Facebook / LinkedIn / Slack / WhatsApp / iMessage, these
  tags control the preview card (title, text, image).
- **What:** `og:title`, `og:description`, `og:url`, `og:site_name`, `og:type`, `og:locale`, and an
  `og:image` (1200×630 PNG) with `:width`/`:height`/`:alt`/`:type`.
- **How:** `og:image` **must be an absolute URL**. 1200×630 is the size every platform crops cleanly.

## 8. Twitter / X Cards
- **Why:** same idea as OG but for X. `summary_large_image` = the big-image card.
- **What/How:** `twitter:card/title/description/image/site/creator` — kept in sync with the OG values.

## 9. Apple / iOS web-app tags
- **Why:** control how the site looks once added to an iPhone Home Screen (name, status bar, icon).
- **What/How:** `apple-mobile-web-app-capable`, `-status-bar-style`, `-title`, and a 180×180
  `apple-touch-icon`.

## 10. Microsoft Tile
- **Why:** legacy Windows pinned-tile color. Tiny, harmless.
- **What/How:** `msapplication-TileColor` + `msapplication-config: none`.

## 11. Resource hints (performance)
- **Why:** open the network connection to third-party origins early so their assets load faster.
- **What/How:** `preconnect` + `dns-prefetch` for `cdn.simpleicons.org` (brand-logo pills);
  lighter `dns-prefetch` for `api.qrserver.com` (only hit when you open a QR).

## 12. Structured data (JSON-LD) — the "deep" SEO
- **Why:** gives Google *facts* (not guesses) about the page: who you are, your profiles, your
  projects. Powers rich results and the knowledge panel.
- **What:** a `@graph` in `index.html` with **WebSite** + **Person** (your `sameAs` social/profile
  links) + **ProfilePage**. Plus an **ItemList** of all projects that `scripts/render.js` builds
  from `PROJECTS` at runtime — so it can never drift from the cards.
- **How:** validate with Google's Rich Results Test (link below). `sameAs` ties all your identities
  together for the knowledge graph.
- **Free apps:** each project carries `offers` with `price: "0"` (₹0 INR) — it's free/open-source.
- **Ratings/reviews — intentionally omitted:** the Rich Results Test shows "non-critical issues" on
  the projects because they have no `aggregateRating` / `review`. That's **by design** — we never
  invent ratings (fake review markup violates Google's policy and risks a manual action). Missing
  optional fields are just warnings, never a penalty; this is the standard, honest state for apps
  without real crowd ratings. If an app later earns genuine public ratings (e.g. Chrome Web Store),
  we can add the real numbers then.

## 12b. Made in India 🇮🇳
- **Why:** the site is proudly designed & coded in India, and we want to show it — honestly, without
  keyword-stuffing.
- **What/How:** three legitimate signals — a visible **"Made in India" footer badge**; the creator
  **Person** carries `nationality: India` + `address.addressCountry: "IN"` (origin flows to every
  project via the `author` link); and the locale is Indian English (`html lang="en-IN"`,
  `og:locale="en_IN"`, `inLanguage="en-IN"`). Note: schema.org's `countryOfOrigin` is **not** valid
  on a SoftwareApplication, so origin is declared via the creator Person — the correct way.

## 13. Search-engine verification
- **Dashboards:** [Google Search Console](https://search.google.com/search-console) · [Bing Webmaster Tools](https://www.bing.com/webmasters)
- **Why:** Google Search Console & Bing Webmaster Tools are free dashboards (search traffic, which
  queries find you, indexing/crawl errors, sitemap submission). To use them you must prove you own
  the site — the simplest way is a verification `<meta>` tag.
- **What:** `<meta name="google-site-verification" ...>` and `<meta name="msvalidate.01" ...>` are
  wired in with the real codes.
- **How to get fresh codes** (if the property is ever re-added): sign in at
  `search.google.com/search-console` → **Add property** → **URL prefix** → enter
  `https://dhruvinrsoni.github.io/` → choose **HTML tag** → copy the code into the meta tag. Same at
  `bing.com/webmasters` (Bing can import from Google). After it's live, click **Verify**, then
  submit `sitemap.xml`.

---

## PWA — making the hub installable

- **Manifest** (`manifest.webmanifest`): name, icons (192/512 + maskable), colors, `display:
  standalone`. This is what makes a site "installable."
- **Service worker** (`sw.js`): caches the site so it opens offline. Pages are **network-first**
  (always fresh when online); assets are **stale-while-revalidate** (serve the cached copy instantly,
  then refetch in the background so the *next* load is up to date).
- **Why content can look stale:** a service worker keeps serving its cached copy until a *new* SW
  takes over. If the SW file itself isn't changed, old cached JS/CSS can linger. We bump the cache
  name on meaningful changes and use stale-while-revalidate so updates self-propagate within a load
  or two.
- **Update button** (`scripts/pwa.js`, the ↻ in the header): the manual escape hatch — clears all
  caches, asks the SW to check for an update, and reloads to pull the latest. It keeps your theme /
  view preferences (it refreshes code, not settings). Handy on iOS, which has no easy cache-clear UI.
- **Clearing manually on iOS** (rarely needed now): *Chrome* → ⋯ → Settings → Privacy → Clear
  Browsing Data; *Safari* → iOS Settings → Apps → Safari → Clear History and Website Data.
- **Install button** (`scripts/pwa.js`): on **Android/desktop Chrome/Edge**, the browser fires a
  `beforeinstallprompt` event — we catch it and show our own Install button so it's easy to find.
- **iPhone reality (important):** Apple does **not** support `beforeinstallprompt` in *any* iOS
  browser (Safari, Chrome, etc.). **No website can show an automatic install button on iPhone** —
  it's an OS limitation, not a bug. The only path is **Share ⎙ → "Add to Home Screen."** So on iOS
  we still show the Install button, and tapping it opens a small sheet that teaches that gesture.

---

## Test / verify tools

| Tool | Checks |
|---|---|
| https://search.google.com/test/rich-results | JSON-LD (Person / ProfilePage / ItemList) parses |
| https://metatags.io/ | Live preview across Google / X / Facebook / LinkedIn / Slack / Discord |
| https://developers.facebook.com/tools/debug/ | Open Graph (Meta's debugger) |
| Chrome DevTools → Lighthouse | SEO score + PWA installability |
| Chrome DevTools → device toolbar (iPhone) | Confirms the iOS install sheet appears |
