// share.js — copy / Web Share API / QR modal, plus the event bindings that wire them up.
// Owns: copyToClipboard, nativeShare, openQR, closeQR, bindCardEvents, bindHeaderEvents.
// Depends on: data.js ($, ICONS, PAGE_URL, PAGE_TITLE, canShare).

async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch {}
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

    const copyBtn = ev.target.closest('.js-copy');
    if (copyBtn) { ev.preventDefault(); copyToClipboard(url, copyBtn); return; }

    const shareBtn = ev.target.closest('.js-share');
    if (shareBtn) { ev.preventDefault(); nativeShare(name, desc, url); return; }

    const qrBtn = ev.target.closest('.js-qr');
    if (qrBtn) { ev.preventDefault(); openQR(url, name); return; }
  });
}

function bindHeaderEvents() {
  $('#share-page-copy').addEventListener('click', (e) => copyToClipboard(PAGE_URL, e.currentTarget));
  const sharePageBtn = $('#share-page-share');
  if (canShare) {
    sharePageBtn.addEventListener('click', () => nativeShare(PAGE_TITLE, 'Dhruvin Soni — projects, demos, extensions.', PAGE_URL));
  } else {
    sharePageBtn.hidden = true;
  }
  $('#share-page-qr').addEventListener('click', () => openQR(PAGE_URL, PAGE_TITLE));

  $('#qr-close').addEventListener('click', closeQR);
  $('#qr-modal').addEventListener('click', (ev) => {
    if (ev.target.id === 'qr-modal') closeQR();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && $('#qr-modal').classList.contains('open')) closeQR();
  });
}
