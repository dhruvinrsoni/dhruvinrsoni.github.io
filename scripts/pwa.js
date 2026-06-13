// pwa.js — service-worker registration + the in-app "Install" button.
// Owns: initInstallButton. Depends on: data.js ($).
//
// Why a button: browsers only sometimes surface their own install affordance, and
// it's easy to miss. This shows our own button exactly when the app CAN be installed
// (the `beforeinstallprompt` event fired) and hides it once installed or already running
// as an app — so the user never has to hunt through browser menus.
//
// iOS caveat: Apple does not implement `beforeinstallprompt` in ANY iOS browser
// (Safari, Chrome, etc.), so no site can trigger an automatic install on iPhone/iPad.
// The only path there is the manual Share → "Add to Home Screen". So on iOS we show
// the button anyway and, on tap, open a small instruction sheet teaching that gesture.

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* non-fatal */ });
  });
}

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.matchMedia('(display-mode: minimal-ui)').matches ||
         window.navigator.standalone === true; // iOS Safari
}

// iPhone/iPad detection. iPadOS 13+ reports as desktop Safari, so also treat a
// touch-capable "MacIntel" as iOS.
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// The iOS "how to install" sheet — reuses the QR modal's open/close pattern.
function openIosInstall() {
  const modal = $('#ios-install-modal');
  if (!modal) return;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('open'));
}
function closeIosInstall() {
  const modal = $('#ios-install-modal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => { modal.hidden = true; }, 160);
}

function initInstallButton() {
  const btn = $('#install-app');
  if (!btn) return;

  // Already installed / launched as an app → never show the button.
  if (isAppInstalled()) { btn.hidden = true; return; }

  let deferredPrompt = null;
  const ios = isIOS();

  // iOS can't fire beforeinstallprompt, so reveal the button immediately and let the
  // click handler fall through to the instruction sheet (deferredPrompt stays null).
  if (ios) {
    btn.hidden = false;
    const closeBtn = $('#ios-install-close');
    if (closeBtn) closeBtn.addEventListener('click', closeIosInstall);
    const modal = $('#ios-install-modal');
    if (modal) modal.addEventListener('click', (ev) => { if (ev.target === modal) closeIosInstall(); });
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && modal && modal.classList.contains('open')) closeIosInstall();
    });
  }

  // Fires only when the app meets the install criteria and isn't installed yet (Android/desktop).
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();          // stop the mini-infobar; we drive it from our button
    deferredPrompt = e;
    btn.hidden = false;
  });

  btn.addEventListener('click', async () => {
    if (!deferredPrompt) {       // iOS (or prompt not yet available) → show manual steps
      if (ios) openIosInstall();
      return;
    }
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch (_) { /* dismissed */ }
    deferredPrompt = null;
    btn.hidden = true;           // the prompt is single-use
  });

  // Installed (via our button or the browser UI) → remove the button.
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    btn.hidden = true;
  });
}
