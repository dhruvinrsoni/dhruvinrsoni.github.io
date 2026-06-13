// sw.js — service worker for the Launchpad PWA.
// Two jobs: (1) offline support via caching, (2) provide a `fetch` handler, which
// (together with PNG icons in the manifest) is what lets Android install this as a
// real app/WebAPK instead of a plain home-screen bookmark.
const CACHE = 'launchpad-v3';
const CORE = [
  '/', '/index.html', '/manifest.webmanifest',
  '/styles/tokens.css', '/styles/base.css', '/styles/layout.css',
  '/styles/components.css', '/styles/views.css',
  '/scripts/data.js', '/scripts/state.js', '/scripts/render.js',
  '/scripts/share.js', '/scripts/controls.js', '/scripts/theme.js',
  '/scripts/scroll.js', '/scripts/version.js', '/scripts/pwa.js', '/scripts/main.js',
  '/icons/rocket-space/icon-192.png', '/icons/rocket-space/icon-512.png',
  '/icons/rocket-space/apple-touch-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // best-effort: cache what we can, never fail the install over one missing file
    await Promise.allSettled(CORE.map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (QR API, fonts) hit the network

  // Pages: network-first so content stays fresh; fall back to the cached shell offline.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/index.html')));
    return;
  }
  // Same-origin static assets: stale-while-revalidate. Serve the cached copy instantly
  // (fast, offline-friendly) but ALWAYS refetch in the background and update the cache,
  // so the next load picks up a new deploy. (Cache-first would serve stale forever.)
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const network = fetch(req).then((res) => {
      cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    return cached || (await network) || Response.error();
  })());
});
