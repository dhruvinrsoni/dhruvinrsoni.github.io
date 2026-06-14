// render.js — DOM building only. No event handling, no state mutation.
// Owns: renderActions, renderCard, renderGrid, renderProfileDeeplinks.
// Depends on: data.js (PROJECTS, ICONS, escapeHtml, primaryUrlOf, canShare, $, PROFILE_BASE, PROFILE_DEEPLINKS),
//             state.js (sortedProjects).

// Decide how a link opens (see OPEN_DEFAULT + per-project `open` in data.js).
// Cross-origin → always a new tab. Same-origin → 'app' (same window, in-app feel)
// or 'tab' (new browser tab, so a child PWA keeps its own install identity).
function openAttr(p, url) {
  let sameOrigin = false;
  try { sameOrigin = new URL(url, location.href).origin === location.origin; } catch (e) {}
  if (!sameOrigin) return ' target="_blank" rel="noopener"';
  const mode = p.open || (typeof OPEN_DEFAULT !== 'undefined' ? OPEN_DEFAULT : 'app');
  return mode === 'tab' ? ' target="_blank" rel="noopener"' : '';
}

function renderActions(p) {
  const items = [];
  const make = (key, label, iconKey, primary) => {
    if (!p[key]) return;
    items.push(
      `<a class="action-link${primary ? ' primary' : ''}" href="${escapeHtml(p[key])}"${openAttr(p, p[key])}>` +
      `${ICONS[iconKey]}<span>${label}</span></a>`
    );
  };
  make('webstore', 'Web Store', 'store', p.primary === 'webstore');
  make('live', p.liveLabel || 'Live', 'live', p.primary === 'live');
  make('repo', 'Repo', 'github', p.primary === 'repo');
  make('producthunt', 'Product Hunt', 'hunt', false);
  if (Array.isArray(p.extras)) {
    p.extras.forEach(e => {
      items.push(
        `<a class="action-link" href="${escapeHtml(e.url)}"${openAttr(p, e.url)}>` +
        `${ICONS[e.icon || 'external']}<span>${escapeHtml(e.label)}</span></a>`
      );
    });
  }
  return items.join('');
}

// DOM size note: ~45 elements per card × 14+ projects ≈ 650+ total elements. Reducing
// requires either simplifying card markup (fewer SVG icons) or virtual scrolling — both
// are significant UX changes. Acceptable at current project count; revisit if count grows past ~30.
function renderCard(p) {
  const primaryUrl = primaryUrlOf(p);
  const subHtml = p.sub ? `<span class="card-sub">${escapeHtml(p.sub)}</span>` : '';
  const featuredStar = p.featured ? '<span class="featured-star" title="Featured">★</span>' : '';
  const shareBtn =
    `<button class="icon-btn js-share" type="button" aria-label="Share ${escapeHtml(p.name)}" title="Share">${ICONS.share}<span class="copied-flash">Copied!</span></button>`;
  return `
    <article class="card${p.featured ? ' featured' : ''}" data-id="${escapeHtml(p.id)}" data-url="${escapeHtml(primaryUrl)}" data-name="${escapeHtml(p.name)}" data-desc="${escapeHtml(p.desc)}">
      <div class="card-head">
        <span class="card-emoji" aria-hidden="true">${p.emoji}</span>
        <div class="card-title-block">
          <div class="card-title">
            <h3 title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h3>
            ${featuredStar}
            ${subHtml}
          </div>
          <span class="type-pill">${escapeHtml(p.type)}</span>
        </div>
      </div>
      <p class="card-desc">${escapeHtml(p.desc)}</p>
      <div class="card-actions">${renderActions(p)}</div>
      <div class="card-share">
        <span class="card-share-label">Share</span>
        ${shareBtn}
        <button class="icon-btn js-copy" type="button" aria-label="Copy ${escapeHtml(p.name)} link" title="Copy link">
          ${ICONS.copy}<span class="copied-flash">Copied!</span>
        </button>
        <button class="icon-btn js-qr" type="button" aria-label="QR for ${escapeHtml(p.name)}" title="QR code">${ICONS.qr}</button>
      </div>
    </article>
  `;
}

function renderGrid() {
  const grid = $('#grid');
  grid.innerHTML = sortedProjects().map(renderCard).join('');
  $('#project-count').textContent = `${PROJECTS.length} repos`;
}

// Inject a JSON-LD ItemList of the projects so search engines can read the project
// list as structured data. Built from PROJECTS (the single source of truth) at runtime,
// so the markup never drifts from the cards. Google executes JS, so it's indexed.
// Notes:
//  - offers = price 0 INR: every app is free/open-source (clears the "offers" warning).
//  - aggregateRating / review are intentionally OMITTED — we never fabricate ratings
//    (Google penalises fake review markup). Those non-critical warnings stay by design.
//  - author references the Person node in index.html (#person); Google merges all JSON-LD
//    on the page, so the project's creator/origin (incl. Made in India) flows from there.
function appCategoryOf(p) {
  if (/extension/i.test(p.type)) return 'BrowserApplication';
  if (/game/i.test(p.type)) return 'GameApplication';
  return 'DeveloperApplication';
}
function renderStructuredData() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Dhruvin Soni — Projects',
    itemListElement: PROJECTS.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': /extension/i.test(p.type) ? 'BrowserApplication' : 'WebApplication',
        name: p.name,
        description: p.desc,
        url: primaryUrlOf(p),
        applicationCategory: appCategoryOf(p),
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        author: { '@type': 'Person', '@id': 'https://dhruvinrsoni.github.io/#person' }
      }
    }))
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(itemList);
  document.head.appendChild(script);
}

function renderProfileDeeplinks() {
  const link = (anchor, label) => {
    const a = document.createElement('a');
    a.href = PROFILE_BASE + anchor;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = label;
    return a;
  };

  // 1. Tagline tail — replace placeholder with the rendered link.
  const tagSlot = document.querySelector('.tagline-deeplink');
  if (tagSlot) {
    const a = link(PROFILE_DEEPLINKS.tagline.anchor, PROFILE_DEEPLINKS.tagline.label);
    a.className = 'tagline-link';
    tagSlot.replaceWith(a);
  }

  // 2. Section title — replace placeholder with the rendered link.
  const stSlot = document.querySelector('.section-title-deeplink');
  if (stSlot) {
    const a = link(PROFILE_DEEPLINKS.sectionTitle.anchor, PROFILE_DEEPLINKS.sectionTitle.label);
    a.className = 'section-title-link';
    stSlot.replaceWith(a);
  }

  // 3. Footer — append all footer entries to the existing container.
  const footerSlot = document.querySelector('.footer-deeplinks');
  if (footerSlot) {
    PROFILE_DEEPLINKS.footer.forEach(d => {
      const a = link(d.anchor, (d.icon ? d.icon + ' ' : '') + d.label);
      a.className = 'footer-chip';
      footerSlot.appendChild(a);
    });
  }
}

// ----- Brand pills (header socials + profile groups), config-driven from data.js -----
function brandLogo(item) {
  if (!item.icon) return ICONS.external; // generic glyph fallback
  // Prefer a local inline icon (accurate, offline; e.g. LinkedIn — removed from
  // simple-icons — and GitHub). Falls back to the simple-icons CDN otherwise.
  if (ICONS[item.icon]) {
    const c = item.iconColor ? '#' + item.iconColor
      : (typeof item.brand === 'string' && item.brand.charAt(0) === '#' ? item.brand : 'currentColor');
    return '<span class="pill-logo" style="color:' + c + '">' + ICONS[item.icon] + '</span>';
  }
  const color = item.iconColor ||
    (typeof item.brand === 'string' && item.brand.charAt(0) === '#' ? item.brand.slice(1) : '888888');
  const src = 'https://cdn.simpleicons.org/' + item.icon + '/' + color;
  return '<img class="pill-logo" src="' + src + '" alt="" width="15" height="15" loading="lazy" onerror="this.remove()">';
}
function brandPill(item) {
  const cls = 'pill pill--social' + (item.darkLogo ? ' is-dark-logo' : '');
  const brand = (typeof item.brand === 'string') ? item.brand : '';
  return '<a class="' + cls + '" style="--brand:' + brand + '" href="' + escapeHtml(item.url) +
    '" target="_blank" rel="noopener">' + brandLogo(item) + '<span>' + escapeHtml(item.label) + '</span></a>';
}
function renderQuicklinks() {
  const el = document.querySelector('[data-quicklinks]');
  if (el && typeof SOCIALS !== 'undefined') el.innerHTML = SOCIALS.map(brandPill).join('');
}
function renderProfiles() {
  const el = document.querySelector('[data-profiles]');
  if (!el || typeof PROFILE_GROUPS === 'undefined') return;
  el.innerHTML = PROFILE_GROUPS.map(g =>
    '<div class="profile-group"><div class="profile-group-label">' + escapeHtml(g.label) +
    '</div><div class="pills">' + g.links.map(brandPill).join('') + '</div></div>'
  ).join('');
}
