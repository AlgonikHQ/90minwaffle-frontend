/* EDCOMPACT_20261019: Edges - last 10 results + "Show all", method-update note. Survives filters and refreshes. */
(function () {
  if (window.__nmwED) return; window.__nmwED = 1;
  var st = document.createElement('style');
  st.textContent = '.ed-hide{display:none!important}'
    + '.ed-more{display:block;width:100%;margin:12px 0 4px;padding:11px;border-radius:12px;border:1px solid rgba(34,211,238,.35);background:rgba(34,211,238,.06);color:#22d3ee;font-weight:800;font-size:.85rem;cursor:pointer}'
    + '.ed-note{margin:0 0 14px;padding:12px 14px;border-radius:12px;border:1px solid rgba(34,211,238,.25);background:rgba(34,211,238,.05);font-size:.82rem;line-height:1.5;color:#cbd5e1}'
    + '.ed-note b{color:#22d3ee}.ed-note a{color:#22d3ee}';
  document.head.appendChild(st);
  var LIMIT = 10;
  try { var nt = ((performance.getEntriesByType('navigation') || [])[0] || {}).type; if (nt !== 'back_forward') sessionStorage.removeItem('ed-open'); } catch (e) {}  /* EDRESET_20261019: refresh = collapsed, Back = as you left it */
  function isOpen() { try { return sessionStorage.getItem('ed-open') === '1'; } catch (e) { return false; } }
  function setOpen(v) { try { sessionStorage.setItem('ed-open', v ? '1' : '0'); } catch (e) {} }
  function note(list) {
    if (document.getElementById('ed-method-note')) return;
    var d = document.createElement('div'); d.id = 'ed-method-note'; d.className = 'ed-note';
    d.innerHTML = '<b>Method update &middot; 19 Oct 2026.</b> Following a full audit of our results: Under 2.5 singles are paused (they lost money), '
      + 'Over 2.5 is only tipped at 1.80 or bigger, and one scoring signal that didn&#39;t predict results no longer counts. '
      + 'We also cleaned the data behind team form. Every past result still stands as published. '
      + '<a href="/corrections/">See the full details &rarr;</a>';
    list.parentNode.insertBefore(d, list);
  }
  var mo = null;
  function apply() {
    var list = document.getElementById('tipsList'); if (!list) return;
    note(list);
    var old = list.querySelector(':scope > .ed-more'); if (old) old.remove();
    var items = Array.prototype.filter.call(list.children, function (x) { return !x.classList.contains('ed-more'); });
    items.forEach(function (x) { x.classList.remove('ed-hide'); });
    if (items.length <= LIMIT + 2) return;
    var open = isOpen();
    if (!open) items.slice(LIMIT).forEach(function (x) { x.classList.add('ed-hide'); });
    var b = document.createElement('button'); b.className = 'ed-more';
    b.textContent = open ? 'Show fewer \u25B4' : 'Show all ' + items.length + ' results \u25BE';
    b.addEventListener('click', function () {
      var now = !isOpen(); setOpen(now); run();
      if (!now) window.scrollTo({ top: list.getBoundingClientRect().top + window.scrollY - 120 });
    });
    list.appendChild(b);
  }
  function run() {
    var list = document.getElementById('tipsList');
    if (mo) mo.disconnect();
    try { apply(); } catch (e) {}
    if (mo && list) mo.observe(list, { childList: true });
  }
  if (window.MutationObserver) mo = new MutationObserver(function () { setTimeout(run, 30); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
