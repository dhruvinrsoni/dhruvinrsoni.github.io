// state.js — sort + view state, persisted in localStorage. Validates inputs via setters.
// Owns: SORTS, VIEWS, currentSort, currentView, sortedProjects(), applyView(), get/set helpers.
// Depends on: data.js (PROJECTS, primaryUrlOf).

// ---------- Sort comparators ----------
const SORTS = {
  'default':   null,
  'name-asc':  (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  'name-desc': (a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: 'base' }),
  'type':      (a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  'url':       (a, b) => primaryUrlOf(a).localeCompare(primaryUrlOf(b))
};

// ---------- View modes ----------
const VIEWS = ['grid', 'list', 'compact'];

// ---------- Persisted state (localStorage-backed) ----------
let currentSort = localStorage.getItem('sort-mode');
if (!(currentSort in SORTS)) currentSort = 'default';

let currentView = localStorage.getItem('view-mode');
if (!VIEWS.includes(currentView)) currentView = 'grid';

function getSort() { return currentSort; }
function setSort(v) {
  if (!(v in SORTS)) return;
  currentSort = v;
  localStorage.setItem('sort-mode', v);
}

function getView() { return currentView; }
function setView(v) {
  if (!VIEWS.includes(v)) return;
  currentView = v;
  localStorage.setItem('view-mode', v);
}

// ---------- Derived data ----------
function sortedProjects() {
  const cmp = SORTS[currentSort];
  return cmp ? [...PROJECTS].sort(cmp) : PROJECTS;
}

// ---------- View applier (mutates DOM attribute) ----------
function applyView() {
  document.querySelector('main').setAttribute('data-view', currentView);
}
