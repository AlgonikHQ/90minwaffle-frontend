/* MLINK_20261017: Matches page - ?fx=<id> lands on that game (highlight + match sheet), ?hl=<team> highlights that club in Tables */
(function () {
  var q = new URLSearchParams(location.search), fx = q.get('fx'), hl = q.get('hl');
  if (!fx && !hl) return;
  var st = document.createElement('style');
  st.textContent = '.nmw-hl{outline:2px solid #22d3ee!important;outline-offset:2px;box-shadow:0 0 18px rgba(34,211,238,.45)!important;border-radius:12px;animation:nmwpulse 1.2s ease 2}'
    + '@keyframes nmwpulse{50%{box-shadow:0 0 4px rgba(34,211,238,.2)}}tr.nmw-hl td{background:rgba(34,211,238,.14)!important;color:#fff}';
  document.head.appendChild(st);
  var tries = 0, done = false, tabbed = false;
  function norm(s) { return String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function find() {
    if (typeof DATA === 'undefined' || !DATA) return null;
    var f = null;
    ['live', 'upcoming', 'results'].forEach(function (k) { (DATA[k] || []).forEach(function (x) { if (!f && String(x.id) === fx) f = { x: x, k: k }; }); });
    return f;
  }
  function resultsTab() {
    var b = document.querySelector('[onclick*="\'results\'"]');
    if (!b) b = Array.prototype.filter.call(document.querySelectorAll('button,a,div,span'), function (e) { return e.children.length === 0 && /^\s*results\s*$/i.test(e.textContent); })[0];
    if (b) b.click();
  }
  function sheet() { if (window.nmwOpenSheet) window.nmwOpenSheet(fx); }
  function tick() {
    if (done) return;
    if (++tries > 18) { done = true; if (fx) sheet(); return; }
    if (fx) {
      var f = find();
      if (f && f.k === 'results' && !tabbed && q.get('t') !== 'results') { tabbed = true; resultsTab(); }
      var cards = document.querySelectorAll('.match-card'), hit = null;
      for (var i = 0; i < cards.length && !hit; i++) {
        var c = cards[i];
        if (c.outerHTML.indexOf(fx) >= 0) hit = c;
        else if (f) { var t = norm(c.textContent); if (t.indexOf(norm(f.x.home)) >= 0 && t.indexOf(norm(f.x.away)) >= 0) hit = c; }
      }
      if (hit) { done = true; hit.classList.add('nmw-hl'); hit.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(sheet, 900); return; }
    } else if (hl) {
      var rows = document.querySelectorAll('#mainPage tr'), n = norm(hl), r = null;
      for (var j = 0; j < rows.length && !r; j++) { if (norm(rows[j].textContent).indexOf(n) >= 0) r = rows[j]; }
      if (r) { done = true; r.classList.add('nmw-hl'); r.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    }
    setTimeout(tick, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(tick, 400); }); else setTimeout(tick, 400);
})();
