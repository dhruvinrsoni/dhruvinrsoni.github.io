// scroll.js — round scroll FABs (top-right "go up", bottom-right "go down").
// Owns: initScrollTop, initScrollBottom.
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
    // Lazy-loaded images below the fold grow the page mid-scroll, so a single smooth
    // scroll lands short — re-assert the true bottom for a beat as the layout settles.
    let tries = 8;
    const toBottom = () => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      if (--tries > 0) setTimeout(toBottom, 150);
    };
    toBottom();
  });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  requestAnimationFrame(update);
}

function initScrollTop() {
  const btn = $('#scroll-top');
  if (!btn) return;
  const update = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  requestAnimationFrame(update);
}
