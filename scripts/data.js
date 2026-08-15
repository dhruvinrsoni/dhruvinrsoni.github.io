// data.js — single source of truth for projects, profile cross-links, icons, and tiny utils.
// Owns: PROJECTS, PROFILE_BASE, PROFILE_DEEPLINKS, PAGE_URL, PAGE_TITLE, ICONS, plus $/$$/escapeHtml/primaryUrlOf/canShare.
// Depends on: nothing.

// ---------- Project data ----------
// ---------- Link open behaviour (configurable framework) ----------
// Every card link (Live / Repo / Web Store / extras) is routed through openAttr()
// in render.js — there is ONE switch, so changing it here flips behaviour everywhere.
//   'tab' = FORCE a new browser tab — keeps the Launchpad open behind it (and a child
//           PWA keeps its own install identity).
//   'app' = FORCE same window — stay inside the Launchpad PWA. Only use for links that
//           ARE the Launchpad itself (e.g. the Home card); a separate app/site should be 'tab'.
// Cross-origin links (github.com, vercel, firebase, notion, chromewebstore…) ALWAYS open
// in a new tab regardless of this setting — only SAME-ORIGIN links honour the flag.
// Per-project override: add `open: 'tab'` / `open: 'app'` to a project below.
const OPEN_DEFAULT = 'tab';   // hub default: open project sites in a new tab so the Launchpad stays put

// ---------- Featured ★ ----------
// `featured: true` hand-picks the flagship cards (render.js draws the ★ and a `featured` class).
// NOT computed from GitHub stars/popularity — it's a deliberate curation. A project earns ★ only if it:
//   1. is production-grade and actively maintained (not an origin/archive piece),
//   2. has a real, usable live surface (store listing, hosted app, or public launch — not repo-only), and
//   3. represents current focus (AI tooling, PWAs, or extensions).
// Keep it to ~4 so the star stays meaningful.
const PROJECTS = [
  {
    id: 'smruti-cortex', name: 'Smruti Cortex', sub: 'स्मृति', emoji: '🧠',
    type: 'Chrome Extension', featured: true,
    desc: 'Ultra-fast browser history search with optional local AI via Ollama.',
    repo: 'https://github.com/dhruvinrsoni/smruti-cortex',
    live: 'https://dhruvinrsoni.github.io/smruti-cortex/quality-report/',
    webstore: 'https://chromewebstore.google.com/detail/ecnkiihcifbfnhjblicfbppplobiicoi',
    primary: 'webstore'
  },
  {
    id: 'samvada-studio', open: 'tab', name: 'Samvada Studio', sub: 'संवाद स्टूडियो', emoji: '💬',
    type: 'Web App / PWA', featured: true,
    desc: 'Multi-provider LLM chat UI — OpenAI, Anthropic, Google, Ollama, Azure.',
    repo: 'https://github.com/dhruvinrsoni/samvada-studio',
    live: 'https://samvada-studio.vercel.app/',
    producthunt: 'https://www.producthunt.com/products/samvada-studio',
    primary: 'live',
    extras: [
      { label: 'GitHub Pages', url: 'https://dhruvinrsoni.github.io/samvada-studio/', icon: 'live' }
    ]
  },
  {
    id: 'cipher-alchemist', open: 'tab', name: 'Cipher Alchemist', emoji: '🔐',
    type: 'PWA',
    desc: 'Secure, offline-capable phrase-to-password generator with custom rules.',
    repo: 'https://github.com/dhruvinrsoni/cipher-alchemist',
    live: 'https://dhruvinrsoni.github.io/cipher-alchemist/',
    primary: 'live'
  },
  {
    id: 'smart-logger', open: 'tab', name: 'Smart Logger', emoji: '📓',
    type: 'PWA',
    desc: 'Privacy-first offline logger with dual UI (modern + classic), CSV/JSON export.',
    repo: 'https://github.com/dhruvinrsoni/smart-logger',
    live: 'https://dhruvinrsoni.github.io/smart-logger/',
    primary: 'live'
  },
  {
    id: 'ankura-array', name: 'Ankura Array', sub: 'अंकुर-Array', emoji: '🌱',
    type: 'Nano-apps Hub', featured: true,
    desc: 'Offline-first nano-apps incubator — Vaak-Smith and GenAI-Yukti-Deck inside.',
    repo: 'https://github.com/dhruvinrsoni/ankura-array',
    live: 'https://dhruvinrsoni.github.io/ankura-array/',
    primary: 'live'
  },
  {
    id: 'rangoli-royale', open: 'tab', name: 'Rangoli Royale', sub: 'रंगोली', emoji: '🪔',
    type: 'Game · PWA',
    desc: '2-team strategy on an Indian rangoli dot grid — play online multiplayer or pass-the-device offline.',
    repo: 'https://github.com/dhruvinrsoni/rangoli-royale',
    live: 'https://rangoli-royale.vercel.app/',
    liveLabel: 'Play Online',
    primary: 'live',
    extras: [
      { label: 'Offline Build', url: 'https://dhruvinrsoni.github.io/rangoli-royale/', icon: 'live' }
    ]
  },
  {
    id: 'online-pizza-ordering-system', name: 'Pizza Ordering System', emoji: '🍕',
    type: 'Web App',
    desc: 'Angular + Spring MVC ordering demo running on Tomcat.',
    repo: 'https://github.com/dhruvinrsoni/online-pizza-ordering-system',
    live: 'https://dhruvinrsoni.github.io/online-pizza-ordering-system/',
    primary: 'live'
  },
  {
    id: 'agentskills-garden', open: 'tab', name: 'Agentskills Garden', emoji: '🌿',
    type: 'AI Skill Library', featured: true,
    desc: '88 hierarchical AI-agent skills, constitution-driven (Satya · Dharma · Ahimsa · Pragya).',
    repo: 'https://github.com/dhruvinrsoni/agentskills-garden',
    live: 'https://dhruvinrsoni.github.io/agentskills-garden/',
    primary: 'live'
  },
  {
    id: 'project-templates', name: 'Project Templates', emoji: '🧱',
    type: 'Scaffolder',
    desc: '8 production-ready template flavors — Node, React PWA, Chrome ext, Spring, Python.',
    repo: 'https://github.com/dhruvinrsoni/project-templates',
    primary: 'repo'
  },
  {
    id: 'power-user-scripts', name: 'Power User Scripts', emoji: '⚡',
    type: 'Toolbox',
    desc: 'Cross-platform productivity scripts — batch, PowerShell, shell, registry tweaks.',
    repo: 'https://github.com/dhruvinrsoni/power-user-scripts',
    live: 'https://dhruvinrsoni.github.io/power-user-scripts/',
    primary: 'live'
  },
  {
    id: 'dhruvinrsoni-profile', name: '/dhruvinrsoni', emoji: '👋',
    type: 'Profile Site',
    desc: 'My personal profile site — about me, tech stack, journey, blogs, badges, and more.',
    repo: 'https://github.com/dhruvinrsoni/dhruvinrsoni',
    live: 'https://dhruvinrsoni.github.io/dhruvinrsoni/',
    primary: 'live'
  },
  {
    id: 'kaushal-forge', name: 'KaushalForge', emoji: '📄',
    type: 'Résumé Hub',
    desc: 'AI-tailored résumés, cover letters, and job-search strategy — published as a clean résumé hub.',
    repo: 'https://github.com/dhruvinrsoni/kaushal-forge',
    live: 'https://dhruvinrsoni.github.io/kaushal-forge/',
    primary: 'live'
  },
  {
    id: 'todolistapp', open: 'tab', name: 'To-Do List PWA', emoji: '✅',
    type: 'PWA',
    desc: 'Installable React to-do list — Progressive Web App hosted on Firebase.',
    repo: 'https://github.com/dhruvinrsoni/todolistapp',
    live: 'https://todolist-dhruvinsoni.firebaseapp.com/',
    primary: 'live'
  },
  {
    id: 'writing-blogs', name: 'Writing & Blogs', emoji: '✍️',
    type: 'Writing',
    desc: 'Started with a GenAI piece, now organized into two Notion indexes — Technical Blogs and General Blogs.',
    live: 'https://dhruvinrsoni.notion.site/Learning-on-the-edge-Technical-Blogs-and-Articles-2d197971458a80cabfd9c2494d3b3abe',
    liveLabel: 'Tech Blogs',
    primary: 'live',
    extras: [
      { label: 'General Blogs', url: 'https://dhruvinrsoni.notion.site/Around-and-Beyond-Horizon-Blogs-and-Articles-2d197971458a803abf7be8245577b65b', icon: 'external' },
      { label: 'GenAI · origin', url: 'https://dhruvinrsoni.notion.site/Future-with-GenAI-as-of-Aug-25-25997971458a801f8fd9e3bfa1797aa3', icon: 'external' }
    ]
  },
  {
    id: 'first-todo-app', name: 'First React App', emoji: '📜',
    type: 'Origin · React App',
    desc: "My very first React app — built following React's official docs tutorial and deployed to Firebase. The Firebase account is long gone and the source code is lost; only the live URL remains. Where the journey began.",
    live: 'https://first-todo-app-f98b3.firebaseapp.com/',
    primary: 'live'
  },
  {
    id: 'dhruvinrsoni-github-io', open: 'app', name: 'Home', emoji: '🏠',
    type: 'Project Hub',
    desc: "One-stop hub for Dhruvin Soni's projects, live demos, Chrome extensions, and profiles.",
    repo: 'https://github.com/dhruvinrsoni/dhruvinrsoni.github.io',
    live: 'https://dhruvinrsoni.github.io/',
    primary: 'live'
  }
];

// ---------- Page metadata ----------
const PAGE_URL = 'https://dhruvinrsoni.github.io/';
const PAGE_TITLE = 'Dhruvin Soni — Portfolio Dashboard';

// ---------- /dhruvinrsoni profile-site cross-links (single source of truth) ----------
// If the profile README is edited and Jekyll regenerates anchors,
// update only the slugs below; both header and footer reflect them.
const PROFILE_BASE = 'https://dhruvinrsoni.github.io/dhruvinrsoni/';
const PROFILE_DEEPLINKS = {
  tagline:      { label: 'About me →',   anchor: '#-about-me' },
  sectionTitle: { label: 'Tech Stack ↗', anchor: '#-tech-stack' },
  footer: [
    { label: 'Journey', anchor: '#-timeline-of-achievements', icon: '⏳' },
    { label: 'Blogs',   anchor: '#blogs', icon: '✍️' },
    { label: 'Badges',  anchor: '#badgescertificates', icon: '🏅' },
    { label: 'Contact', anchor: '#-how-to-reach-me', icon: '✉️' }
  ]
};

// ---------- Social + profile links (config-driven — edit here to add/remove/reorder) ----------
// brand   = platform colour, used for the pill's fill-on-hover (a CSS gradient is allowed).
// icon    = simple-icons slug; the logo is served from cdn.simpleicons.org (a bad slug just
//           falls back to the text label via onerror). Omit `icon` to use a generic glyph.
// darkLogo= true for near-black logos (GitHub, X) so they stay visible on the dark theme.
const SOCIALS = [
  { label: 'GitHub',      url: 'https://github.com/dhruvinrsoni',            brand: '#181717', icon: 'github',    darkLogo: true },
  { label: 'LinkedIn',    url: 'https://www.linkedin.com/in/dhruvinrsoni/', brand: '#0A66C2', icon: 'linkedin' },
  { label: 'X / Twitter', url: 'https://twitter.com/dhruvinrsoni',          brand: '#000000', icon: 'x',         darkLogo: true },
  { label: 'YouTube',     url: 'https://www.youtube.com/@dhruvinrsoni',     brand: '#FF0000', icon: 'youtube' },
  { label: 'Instagram',   url: 'https://www.instagram.com/dhruvinrsoni',    brand: 'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)', icon: 'instagram', iconColor: 'E4405F' },
  { label: 'Facebook',    url: 'https://www.facebook.com/dhruvinrsoni',     brand: '#1877F2', icon: 'facebook' },
  { label: 'Credly',      url: 'https://credly.com/users/dhruvinrsoni',     brand: '#FF6B00', icon: 'credly' }
];

const PROFILE_GROUPS = [
  { label: 'GitHub', links: [
    { label: 'Overview',     url: 'https://github.com/dhruvinrsoni',                  brand: '#181717', icon: 'github', darkLogo: true },
    { label: 'Repositories', url: 'https://github.com/dhruvinrsoni?tab=repositories', brand: '#181717', icon: 'github', darkLogo: true },
    { label: 'Projects',     url: 'https://github.com/dhruvinrsoni?tab=projects',     brand: '#181717', icon: 'github', darkLogo: true },
    { label: 'Packages',     url: 'https://github.com/dhruvinrsoni?tab=packages',     brand: '#181717', icon: 'github', darkLogo: true },
    { label: 'Stars',        url: 'https://github.com/dhruvinrsoni?tab=stars',        brand: '#181717', icon: 'github', darkLogo: true }
  ]},
  { label: 'Developer Profiles', links: [
    { label: 'Stack Overflow',    url: 'https://stackoverflow.com/users/15077282/dhruvinrsoni',                                          brand: '#F58025', icon: 'stackoverflow' },
    { label: 'Stack Exchange',    url: 'https://stackexchange.com/users/9085620/dhruvinrsoni?tab=accounts',                              brand: '#1E5397', icon: 'stackexchange' },
    { label: 'Super User',        url: 'https://superuser.com/users/1266803/dhruvinrsoni',                                             brand: '#1E5397', icon: 'stackexchange' },
    { label: 'Unix & Linux',      url: 'https://unix.stackexchange.com/users/586729/dhruvinrsoni',                                      brand: '#1E5397', icon: 'stackexchange' },
    { label: 'DBA',               url: 'https://dba.stackexchange.com/users/225107/dhruvinrsoni',                                       brand: '#1E5397', icon: 'stackexchange' },
    { label: 'Google Developers', url: 'https://developers.google.com/profile/u/dhruvinrsoni',                                          brand: '#4285F4', icon: 'google' },
    { label: 'GC Skills Boost',   url: 'https://www.cloudskillsboost.google/public_profiles/963de973-47b9-49f7-85c4-8cd882b597e3',      brand: '#4285F4', icon: 'googlecloud' },
    { label: 'Microsoft Learn',   url: 'https://learn.microsoft.com/en-us/users/dhruvinrsoni',                                          brand: '#0078D4', icon: 'microsoft' },
    { label: 'Credly',            url: 'https://credly.com/users/dhruvinrsoni',                                                         brand: '#FF6B00', icon: 'credly' },
    { label: 'Quora',             url: 'https://www.quora.com/profile/Dhruvin-Soni-1/',                                                 brand: '#B92B27', icon: 'quora' }
  ]},
  { label: 'Competitive Coding', links: [
    { label: 'LeetCode',      url: 'https://leetcode.com/u/dhruvinrsoni/',             brand: '#FFA116', icon: 'leetcode' },
    { label: 'HackerRank',    url: 'https://www.hackerrank.com/profile/DhruvinSoni',   brand: '#00EA64', icon: 'hackerrank' },
    { label: 'CodeChef',      url: 'https://www.codechef.com/users/dhruvinrsoni',      brand: '#5B4638', icon: 'codechef', darkLogo: true },
    { label: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/user/dhruvinrsoni/', brand: '#2F8D46', icon: 'geeksforgeeks' }
  ]},
  { label: 'Work · Zebra', links: [
    { label: 'GitHub (Zebra)',            url: 'https://github.com/dhruvinrsoni-zebra',                          brand: '#181717', icon: 'github', darkLogo: true },
    { label: 'Google Developers (Zebra)', url: 'https://developers.google.com/profile/u/dhruvinrsoni-zebra',     brand: '#4285F4', icon: 'google' }
  ]}
];

// ---------- Tiny utilities ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const primaryUrlOf = (p) => p[p.primary] || p.live || p.repo;
const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

// ---------- SVG icons (string templates used by render.js) ----------
const ICONS = {
  external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"/><path d="M20 4L10 14"/><path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/></svg>',
  github:   '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="none"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.69-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.81-.01 3.19 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="none"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>',
  live:     '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  store:    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l7.8 4.5"/><path d="M3.6 9h7.4M3.6 15h7.4M12 3l-4.5 7.8M12 21l4.5-7.8"/></svg>',
  hunt:     '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 7h4.5a3 3 0 1 1 0 6H9V7zm0 6v4"/></svg>',
  copy:     '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  share:    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  qr:       '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor" stroke="none"><path fill-rule="evenodd" d="M2 2h8v8H2V2zm2 2v4h4V4H4z"/><rect x="5" y="5" width="2" height="2"/><path fill-rule="evenodd" d="M14 2h8v8h-8V2zm2 2v4h4V4h-4z"/><rect x="17" y="5" width="2" height="2"/><path fill-rule="evenodd" d="M2 14h8v8H2v-8zm2 2v4h4v-4H4z"/><rect x="5" y="17" width="2" height="2"/><rect x="13" y="13" width="2" height="2"/><rect x="19" y="13" width="2" height="2"/><rect x="16" y="16" width="2" height="2"/><rect x="13" y="19" width="2" height="2"/><rect x="19" y="19" width="2" height="2"/></g></svg>'
};
