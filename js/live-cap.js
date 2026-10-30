(function () { /* LIVECAP_20261024: when lots of games are live, show 6 and put the rest behind Show all. Survives the 30-second refreshes. */
  'use strict';
  var CAP = 6, open = {}, busy = false;
  var st = document.createElement('style');
  st.textContent = '.lc-x{display:none!important}li.lc-more{list-style:none}.lc-more>button,button.lc-more{display:block;width:100%;min-height:44px;margin:8px 0;border:1px solid rgba(34,211,238,.35);border-radius:12px;background:transparent;color:#22d3ee;font:inherit;font-size:14px;font-weight:600;cursor:pointer}';
  document.head.appendChild(st);
  var LIVE = /\bLIVE\b|\b\d{1,3}(\+\d{1,2})?['\u2032]|\bHT\b/;
  function isLive(x) { return LIVE.test(x.innerText || '') && (x.matches('[class*=live],[class*=Live]') || !!x.querySelector('[class*=live],[class*=Live],[data-status]')); }
  function containers() {
    var cs = [];
    [].forEach.call(document.querySelectorAll('.mc-item'), function (m) { if (m.parentElement && cs.indexOf(m.parentElement) < 0) cs.push(m.parentElement); });
    [].forEach.call(document.querySelectorAll('ul,ol,#live-now-list'), function (u) { if (cs.indexOf(u) < 0 && !u.closest('nav,header,footer,.dn-menu,.dn-links,#bottom-nav-mount')) cs.push(u); });
    return cs;
  }
  function apply() {
    if (busy) return; busy = true;
    containers().forEach(function (c, i) {
      var all = c.id === 'live-now-list';
      var items = [].filter.call(c.children, function (x) { return !x.classList.contains('lc-more') && (all || isLive(x)); });
      var btn = [].filter.call(c.children, function (x) { return x.classList.contains('lc-more'); })[0];
      if (items.length <= CAP) { items.forEach(function (x) { x.classList.remove('lc-x'); }); if (btn) btn.remove(); return; }
      var k = (c.id || c.className || c.tagName) + ':' + i, o = !!open[k];
      items.forEach(function (x, j) { var h = !o && j >= CAP; if (x.classList.contains('lc-x') !== h) x.classList.toggle('lc-x', h); });
      if (!btn) {
        var li = /^(UL|OL)$/.test(c.tagName); btn = document.createElement(li ? 'li' : 'button'); btn.className = 'lc-more';
        if (li) btn.appendChild(document.createElement('button')); if (!li) btn.type = 'button';
        btn.addEventListener('click', function (e) { e.preventDefault(); open[k] = !open[k]; apply(); if (!open[k]) c.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
      }
      var b = btn.tagName === 'LI' ? btn.firstChild : btn, txt = o ? 'Show fewer live games' : 'Show all ' + items.length + ' live games';
      if (b.textContent !== txt) b.textContent = txt;
      var last = items[items.length - 1]; if (last.nextElementSibling !== btn) last.parentNode.insertBefore(btn, last.nextSibling);
    });
    busy = false;
  }
  var t = 0; new MutationObserver(function () { if (t) return; t = setTimeout(function () { t = 0; apply(); }, 250); }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
