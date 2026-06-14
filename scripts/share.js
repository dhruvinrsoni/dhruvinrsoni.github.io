// share.js — copy / Web Share API / QR modal, plus the event bindings that wire them up.
// Owns: copyLink, nativeShare, openQR, closeQR, bindCardEvents, bindHeaderEvents.
// Depends on: data.js ($, ICONS, PAGE_URL, PAGE_TITLE, canShare, escapeHtml).

// copyLink writes BOTH text/html and text/plain to the clipboard.
// - Rich text targets (Teams, Outlook, Word, Notion, Slack message box):
//     see an <a href="url">title</a> — pasted as a styled clickable link.
// - Plain text targets (Notepad, terminal, URL bars):
//     see the raw URL.
// Mirrors how Edge's omnibox Ctrl+C behaves.
async function copyLink(url, title, btn) {
  const html = `<a href="${escapeHtml(url)}">${escapeHtml(title || url)}</a>`;
  const plain = url;
  let copied = false;

  // Path 1: modern dual-format Clipboard API (Chrome/Edge 76+, Safari 13.4+, Firefox 127+).
  if (navigator.clipboard && typeof window.ClipboardItem === 'function') {
    try {
      const item = new ClipboardItem({
        'text/html':  new Blob([html],  { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' })
      });
      await navigator.clipboard.write([item]);
      copied = true;
    } catch (e) { /* fall through */ }
  }

  // Path 2: plain-text-only Clipboard API (older browsers / restricted contexts).
  if (!copied && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(plain);
      copied = true;
    } catch (e) { /* fall through */ }
  }

  // Path 3: legacy textarea + execCommand (very old browsers / iOS quirks).
  if (!copied) {
    const ta = document.createElement('textarea');
    ta.value = plain;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  if (btn) {
    btn.classList.add('flash');
    setTimeout(() => btn.classList.remove('flash'), 1400);
  }
}

async function nativeShare(title, text, url) {
  if (!canShare) return false;
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch (e) {
    return false;
  }
}

function openQR(url, title) {
  const modal = $('#qr-modal');
  const img = $('#qr-img');
  const urlEl = $('#qr-url');
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=8&data=${encodeURIComponent(url)}`;
  img.alt = `QR code for ${title || url}`;
  urlEl.textContent = url;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeQR() {
  const modal = $('#qr-modal');
  modal.classList.remove('open');
  setTimeout(() => { modal.hidden = true; }, 160);
}

function bindCardEvents() {
  $('#grid').addEventListener('click', async (ev) => {
    const card = ev.target.closest('.card');
    if (!card) return;
    const url = card.dataset.url;
    const name = card.dataset.name;
    const desc = card.dataset.desc;

    const shareBtn = ev.target.closest('.js-share');
    if (shareBtn) {
      ev.preventDefault();
      if (canShare) nativeShare(name, desc, url);
      else copyLink(url, name, shareBtn);
      return;
    }

    const copyBtn = ev.target.closest('.js-copy');
    if (copyBtn) { ev.preventDefault(); copyLink(url, name, copyBtn); return; }

    const qrBtn = ev.target.closest('.js-qr');
    if (qrBtn) { ev.preventDefault(); openQR(url, name); return; }

    // List & compact views: tapping the row (outside a button/link) opens the
    // project via its already-rendered primary action link — reusing that link's
    // href + target honors the per-project open mode without duplicating it here.
    const view = document.querySelector('main')?.dataset.view;
    if (view === 'list' || view === 'compact') {
      if (ev.target.closest('a.action-link')) return;
      const primaryA = card.querySelector('a.action-link.primary') || card.querySelector('a.action-link');
      if (primaryA) {
        if (primaryA.target === '_blank') window.open(primaryA.href, '_blank', 'noopener');
        else window.location.href = primaryA.href;
      }
    }
  });
}

function bindHeaderEvents() {
  // Share takes priority over Copy and is always available: native share where
  // supported, otherwise it falls back to copying the link (never hidden).
  $('#share-page-share').addEventListener('click', (e) => {
    if (canShare) nativeShare(PAGE_TITLE, 'Dhruvin Soni — projects, demos, extensions.', PAGE_URL);
    else copyLink(PAGE_URL, PAGE_TITLE, e.currentTarget);
  });
  $('#share-page-copy').addEventListener('click', (e) => copyLink(PAGE_URL, PAGE_TITLE, e.currentTarget));
  $('#share-page-qr').addEventListener('click', () => openQR(PAGE_URL, PAGE_TITLE));

  $('#qr-close').addEventListener('click', closeQR);
  $('#qr-modal').addEventListener('click', (ev) => {
    if (ev.target.id === 'qr-modal') closeQR();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && $('#qr-modal').classList.contains('open')) closeQR();
  });
}
