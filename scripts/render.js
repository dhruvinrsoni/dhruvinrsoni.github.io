// render.js — DOM building only. No event handling, no state mutation.
// Owns: renderActions, renderCard, renderGrid, renderProfileDeeplinks.
// Depends on: data.js (PROJECTS, ICONS, escapeHtml, primaryUrlOf, canShare, $, PROFILE_BASE, PROFILE_DEEPLINKS),
//             state.js (sortedProjects).

function renderActions(p) {
  const items = [];
  const make = (key, label, iconKey, primary) => {
    if (!p[key]) return;
    items.push(
      `<a class="action-link${primary ? ' primary' : ''}" href="${escapeHtml(p[key])}" target="_blank" rel="noopener">` +
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
        `<a class="action-link" href="${escapeHtml(e.url)}" target="_blank" rel="noopener">` +
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
  const shareBtn = canShare
    ? `<button class="icon-btn js-share" type="button" aria-label="Share ${escapeHtml(p.name)}" title="Share">${ICONS.share}</button>`
    : '';
  return `
    <article class="card${p.featured ? ' featured' : ''}" data-id="${escapeHtml(p.id)}" data-url="${escapeHtml(primaryUrl)}" data-name="${escapeHtml(p.name)}" data-desc="${escapeHtml(p.desc)}">
      <div class="card-head">
        <span class="card-emoji" aria-hidden="true">${p.emoji}</span>
        <div class="card-title-block">
          <div class="card-title">
            <h3>${escapeHtml(p.name)}</h3>
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
        <button class="icon-btn js-copy" type="button" aria-label="Copy ${escapeHtml(p.name)} link" title="Copy link">
          ${ICONS.copy}<span class="copied-flash">Copied!</span>
        </button>
        ${shareBtn}
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
    PROFILE_DEEPLINKS.footer.forEach(d => footerSlot.appendChild(link(d.anchor, d.label)));
  }
}
