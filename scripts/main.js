// main.js — DOMContentLoaded entry. Wires all init functions in dependency order.
// Owns: nothing — orchestration only.
// Depends on: every other scripts/*.js (loaded before this one via <script defer>).

document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();
  // Hide native share button on header if unsupported.
  if (!canShare) $('#share-page-share').hidden = true;
  renderGrid();
  bindCardEvents();
  bindHeaderEvents();
  initTheme();
  renderProfileDeeplinks();
  initSortBar();
  initViewBar();
  initScrollBottom();
});
