// theme.js — manual light/dark override (overrides prefers-color-scheme).
// Owns: applyTheme, initTheme.
// Depends on: data.js ($).

function applyTheme(t) {
  if (t) document.documentElement.setAttribute('data-theme', t);
  else document.documentElement.removeAttribute('data-theme');
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') applyTheme(saved);
  $('#theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = current === 'dark' ? 'light' : current === 'light' ? 'dark' : (sysDark ? 'light' : 'dark');
    applyTheme(next);
    localStorage.setItem('theme', next);
  });
}
