// scroll.js — round bottom-right scroll-to-bottom FAB; auto-hides near top/bottom.
// Owns: initScrollBottom.
// Depends on: data.js ($).

function initScrollBottom() {
  const btn = $('#scroll-bottom');
  if (!btn) return;
  const update = () => {
    const total = document.documentElement.scrollHeight;
    const seen = window.scrollY + window.innerHeight;
    const hasContent = total > window.innerHeight + 200;
    const nearBottom = total - seen < 120;
    btn.classList.toggle('visible', hasContent && !nearBottom);
  };
  btn.addEventListener('click', () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}
