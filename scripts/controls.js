// controls.js — sort and view toolbars (UI binding only).
// Owns: initSortBar, initViewBar.
// Depends on: state.js (getSort/setSort, getView/setView, applyView), render.js (renderGrid).

function initSortBar() {
  const bar = document.querySelector('[aria-label="Sort projects"]');
  if (!bar) return;
  const sync = () => {
    const active = getSort();
    bar.querySelectorAll('button[data-sort]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sort === active);
    });
  };
  sync();
  bar.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-sort]');
    if (!btn) return;
    setSort(btn.dataset.sort);
    sync();
    renderGrid();
  });
}

function initViewBar() {
  const bar = document.querySelector('[aria-label="View mode"]');
  if (!bar) return;
  const sync = () => {
    const active = getView();
    bar.querySelectorAll('button[data-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === active);
    });
  };
  applyView();
  sync();
  bar.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-view]');
    if (!btn) return;
    setView(btn.dataset.view);
    applyView();
    sync();
  });
}
