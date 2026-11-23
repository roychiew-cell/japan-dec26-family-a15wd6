/* Local enhancement only. All routes and source details work without JavaScript. */
'use strict';
document.documentElement.classList.add('js');
const revealPlaceRows = new WeakMap();
for (const scope of document.querySelectorAll('[data-place-list]')) {
  const rows = [...scope.querySelectorAll('.place')];
  const buttons = [...scope.querySelectorAll('[data-filter]')];
  const sort = scope.querySelector('[data-sort]');
  const more = scope.querySelector('[data-more]');
  const count = scope.querySelector('[data-result-count]');
  let category = 'all', expanded = false;
  const update = () => {
    const matches = rows.filter(row => category === 'all' || (row.dataset.category || '').split(' ').includes(category));
    rows.forEach(row => { row.hidden = !matches.includes(row) || (!expanded && matches.indexOf(row) >= 12); });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    if (more) more.hidden = expanded || matches.length <= 12;
    if (count) count.textContent = `${matches.length} places${!expanded && matches.length > 12 ? ' · first 12 shown' : ''}`;
  };
  buttons.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; expanded = false; update(); }));
  if (more) more.addEventListener('click', () => { expanded = true; update(); const first = rows.find((row, index) => index >= 12 && !row.hidden); if (first) first.querySelector('summary').focus(); });
  if (sort) sort.addEventListener('change', () => {
    const key = sort.value;
    rows.sort((a,b) => key === 'source' ? Number(a.dataset.order) - Number(b.dataset.order) : Number(b.dataset[key] || -1) - Number(a.dataset[key] || -1));
    const container = scope.querySelector('[data-rows]'); rows.forEach(row => container.append(row)); update();
  });
  rows.forEach(row => revealPlaceRows.set(row, () => { category = 'all'; expanded = true; update(); }));
  update();
}
function revealFragment() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  let node = target;
  while (node) {
    const reveal = revealPlaceRows.get(node);
    if (reveal) reveal();
    if (node.tagName === 'DETAILS') node.open = true;
    node = node.parentElement;
  }
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.scrollIntoView({block: 'start'});
  target.focus({preventScroll: true});
}
revealFragment();
window.addEventListener('hashchange', revealFragment);
// Native ticks are usable without storage. Storage failures leave them functional.
for (const box of document.querySelectorAll('[data-tick]')) {
  const key = `japan-2026:${box.dataset.tick}`;
  try { box.checked = localStorage.getItem(key) === '1'; } catch (_) { /* device storage unavailable */ }
  box.addEventListener('change', () => { try { localStorage.setItem(key, box.checked ? '1' : '0'); } catch (_) { /* native tick remains usable */ } });
}
for (const button of document.querySelectorAll('[data-print]')) button.addEventListener('click', () => window.print());
let printState = [];
window.addEventListener('beforeprint', () => {
  printState = [...document.querySelectorAll('details')].map(detail => [detail, detail.open]);
  printState.forEach(([detail]) => { detail.open = true; });
});
window.addEventListener('afterprint', () => { printState.forEach(([detail, open]) => { detail.open = open; }); });
