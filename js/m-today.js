/* MTODAY_20261019: Matches > Today - honest "Last updated"; on phones: top games per section + "Show all", sticky jump chips */
(function () {
  if (window.__nmwMT) return; window.__nmwMT = 1;
  var phone = !!(window.matchMedia && window.matchMedia('(max-width:768px)').matches);
  var st = document.createElement('style');
  st.textContent = '.mt-hide{display:none!important}'
    + '.mt-more{display:block;width:calc(100% - 28px);margin:6px 14px 18px;padding:11px;border-radius:12px;border:1px solid rgba(34,211,238,.35);background:rgba(34,211,238,.06);color:#22d3ee;font-weight:800;font-size:.85rem;text-align:center;cursor:pointer}'
    + '.mt-jump{position:sticky;top:0;z-index:20;display:flex;gap:8px;overflow-x:auto;padding:8px 14px;background:rgba(5,10,20,.94);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border-bottom:1px solid rgba(255,255,255,.06);scrollbar-width:none}'
    + '.mt-jump::-webkit-scrollbar{display:none}'
    + '.mt-jump button{flex:0 0 auto;padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#cbd5e1;font-size:.78rem;font-weight:700;white-space:nowrap;cursor:pointer}'
    + '.mt-jump button.live{border-color:rgba(255,90,95,.55);color:#ff5a5f}';
  document.head.appendChild(st);
  try { var nt = ((performance.getEntriesByType('navigation') || [])[0] || {}).type; if (nt !== 'back_forward') { for (var i = sessionStorage.length - 1; i >= 0; i--) { var k = sessionStorage.key(i); if (k && k.indexOf('mt-open:') === 0) sessionStorage.removeItem(k); } } } catch (e) {}  /* MTRESET_20261019 */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function isOpen(k) { try { return sessionStorage.getItem('mt-open:' + k) === '1'; } catch (e) { return false; } }
  function setOpen(k, v) { try { sessionStorage.setItem('mt-open:' + k, v ? '1' : '0'); } catch (e) {} }
  var stampText = null, stampLate = false;
  function paintStamp() {
    var el = document.getElementById('last-refresh'); if (!el || stampText === null) return;
    if (el.textContent !== stampText) el.textContent = stampText;
    el.style.color = stampLate ? '#f59e0b' : '';
  }
  function stamp() {
    fetch('/data/live_now.json?'+Math.floor(Date.now()/15000)).then(function (r) { return r.json(); }).then(function (d) {
      var g = new Date(d.generated_at), age = (Date.now() - g.getTime()) / 1000;
      if (isNaN(age)) throw 0;
      stampLate = age > 150;
      stampText = g.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' }) + (stampLate ? ' \u00b7 delayed' : '');
      paintStamp();
    }).catch(function () { stampText = 'live data unavailable'; stampLate = true; paintStamp(); });
  }
  function filtered() { return Array.prototype.some.call(document.querySelectorAll('.match-card'), function (c) { return c.style.display === 'none'; }); }
  function apply() {
    paintStamp();
    if (!phone) return;
    var hdrs = document.querySelectorAll('.sec-hdr');
    if (!hdrs.length) return;
    var skip = filtered(), chips = [];
    Array.prototype.forEach.call(hdrs, function (h) {
      var name = (h.textContent || '').trim(), key = name.toLowerCase().replace(/[^a-z]+/g, '-');
      if (!h.id) h.id = 'mt-' + key;
      var cards = [], n = h.nextElementSibling;
      while (n && !(n.classList && n.classList.contains('sec-hdr'))) {
        if (n.classList && n.classList.contains('match-card')) cards.push(n);
        n = n.nextElementSibling;
      }
      var old = h.parentNode.querySelector('.mt-more[data-k="' + key + '"]'); if (old) old.remove();
      cards.forEach(function (c) { c.classList.remove('mt-hide'); });
      if (!cards.length) return;
      var live = /live/i.test(name), lim = live ? 5 : 6;
      chips.push({ id: h.id, label: name + ' (' + cards.length + ')', live: live });
      if (skip || cards.length <= lim) return;
      var open = isOpen(key);
      if (!open) cards.slice(lim).forEach(function (c) { c.classList.add('mt-hide'); });
      var b = document.createElement('button'); b.className = 'mt-more'; b.setAttribute('data-k', key);
      b.textContent = open ? 'Show fewer \u25B4' : 'Show all ' + (live ? 'live ' : '') + '(' + cards.length + ') \u25BE';
      b.addEventListener('click', function () {
        var nowOpen = !isOpen(key); setOpen(key, nowOpen); run();
        if (!nowOpen) window.scrollTo({ top: h.getBoundingClientRect().top + window.scrollY - 120 });
      });
      var last = cards[cards.length - 1]; last.parentNode.insertBefore(b, last.nextSibling);
    });
    var bar = document.querySelector('.mt-jump');
    if (chips.length > 1) {
      if (!bar) { bar = document.createElement('div'); bar.className = 'mt-jump'; hdrs[0].parentNode.insertBefore(bar, hdrs[0]); }
      else if (bar.nextElementSibling !== hdrs[0] && hdrs[0].parentNode) hdrs[0].parentNode.insertBefore(bar, hdrs[0]);
      bar.innerHTML = chips.map(function (c) { return '<button data-to="' + esc(c.id) + '" class="' + (c.live ? 'live' : '') + '">' + esc(c.label) + '</button>'; }).join('');
      Array.prototype.forEach.call(bar.querySelectorAll('button'), function (x) {
        x.addEventListener('click', function () { var t = document.getElementById(x.getAttribute('data-to')); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' }); });
      });
    } else if (bar) bar.remove();
  }
  var mo = null, tm = null;
  function run() { if (mo) mo.disconnect(); try { apply(); } catch (e) {} if (mo) mo.observe(document.body, { childList: true, subtree: true }); }
  if (window.MutationObserver) mo = new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(run, 80); });
  function boot() { stamp(); run(); setInterval(stamp, 30000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
