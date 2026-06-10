// pwa.js — service-worker registration + the in-app "Install" button.
// Owns: initInstallButton. Depends on: data.js ($).
//
// Why a button: browsers only sometimes surface their own install affordance, and
// it's easy to miss. This shows our own button exactly when the app CAN be installed
// (the `beforeinstallprompt` event fired) and hides it once installed or already running
// as an app — so the user never has to hunt through browser menus.

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

function initInstallButton() {
  const btn = $('#install-app');
  if (!btn) return;

  // Already installed / launched as an app → never show the button.
  if (isAppInstalled()) { btn.hidden = true; return; }

  let deferredPrompt = null;

  // Fires only when the app meets the install criteria and isn't installed yet.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();          // stop the mini-infobar; we drive it from our button
    deferredPrompt = e;
    btn.hidden = false;
  });

  btn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
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
