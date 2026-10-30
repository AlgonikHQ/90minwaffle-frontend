/* MATCHSHEET_20261017 - tap a game on a card: Match Detail slides up in a sheet */
(function () {
  if (window.__nmwSheet) return; window.__nmwSheet = 1;
  var CSS = '#nmw-sheet-bg{position:fixed;inset:0;background:rgba(3,7,18,.6);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);z-index:9998;opacity:0;transition:opacity .2s}'
    + '#nmw-sheet{position:fixed;left:0;right:0;bottom:0;height:88vh;max-width:760px;margin:0 auto;background:#0a1020;border:1px solid rgba(34,211,238,.3);border-bottom:0;border-radius:20px 20px 0 0;'
    + 'box-shadow:0 -10px 40px rgba(0,0,0,.6),0 0 30px rgba(34,211,238,.12);z-index:9999;transform:translateY(100%);transition:transform .25s ease;display:flex;flex-direction:column;overflow:hidden}'
    + '#nmw-sheet.on{transform:none}#nmw-sheet-bg.on{opacity:1}'
    + '#nmw-sheet .hd{display:flex;align-items:center;justify-content:center;position:relative;padding:12px 10px 8px;touch-action:none}'
    + '#nmw-sheet .grip{width:46px;height:5px;border-radius:9px;background:#22d3ee;opacity:.5}'
    + '#nmw-sheet .x{position:absolute;right:10px;top:6px;background:#0e1628;border:1px solid rgba(34,211,238,.45);color:#22d3ee;border-radius:999px;width:34px;height:34px;font-size:15px;cursor:pointer}'
    + '#nmw-sheet iframe{flex:1;width:100%;border:0;background:#0a1020}'
    + '.pc .pc-tap{cursor:pointer;transition:background .15s}.pc .pc-tap:active{background:rgba(34,211,238,.08)}'
    + '.pc .fx.pc-tap .s:after,.pc .next.pc-tap .vs:after,.pc tr.pc-tap td:last-child:after{content:" \\203A";color:#22d3ee;font-weight:700}';
  /* TCARD_TAP: Matches-page team card rows */
  CSS += '.tcard .pc-tap{cursor:pointer;transition:background .15s}.tcard .pc-tap:active{background:rgba(34,211,238,.08)}'
    + '.tcard .tc-fx.pc-tap .s:after{content:" \\203A";color:#22d3ee;font-weight:700}'
    + '.tcard .tc-next.pc-tap{position:relative;cursor:pointer}.tcard .tc-next.pc-tap:after{content:"\\203A";position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#22d3ee;font-size:24px;font-weight:700}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  function close(fromPop) {
    var s = document.getElementById('nmw-sheet'), b = document.getElementById('nmw-sheet-bg');
    if (!s) return;
    s.classList.remove('on'); if (b) b.classList.remove('on');
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); if (b && b.parentNode) b.parentNode.removeChild(b); }, 260);
    document.documentElement.style.overflow = '';
    if (!fromPop && history.state && history.state.nmwSheet) history.back();
  }
  function open(id) {
    if (document.getElementById('nmw-sheet')) return;
    var b = document.createElement('div'); b.id = 'nmw-sheet-bg';
    var s = document.createElement('div'); s.id = 'nmw-sheet';
    s.innerHTML = '<div class="hd"><span class="grip"></span><button class="x" aria-label="Close">\u2715</button></div>'
      + '<iframe title="Match details"></iframe>';
    document.body.appendChild(b); document.body.appendChild(s);
    document.documentElement.style.overflow = 'hidden';
    var fr = s.querySelector('iframe'), go = function (x) { fr.src = '/matches/match/?id=' + encodeURIComponent(x) + '&embed=1'; };
    if (/^\d+$/.test(id)) {  /* plain BSD number: ask Match Detail for its own id first */
      fetch('/api/fixture?id=' + id).then(function (r) { return r.json(); }).then(function (j) { go((j && j.fixture && j.fixture.id) || id); }).catch(function () { go(id); });
    } else { go(id); }
    requestAnimationFrame(function () { b.classList.add('on'); s.classList.add('on'); });
    try { history.pushState({ nmwSheet: 1 }, '', location.href.split('#')[0] + '#match'); } catch (e) {}
    b.addEventListener('click', function () { close(false); });
    s.querySelector('.x').addEventListener('click', function () { close(false); });
    var hd = s.querySelector('.hd'), y0 = null;
    hd.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    hd.addEventListener('touchmove', function (e) { if (y0 !== null && e.touches[0].clientY - y0 > 70) { y0 = null; close(false); } }, { passive: true });
  }
  window.nmwOpenSheet = open;  /* MLINK: other scripts can open the sheet */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.pc-tap[data-mid]');
    if (!t || (e.target.closest && e.target.closest('a'))) return;
    e.preventDefault(); open(t.getAttribute('data-mid'));
  });
  window.addEventListener('popstate', function () { if (document.getElementById('nmw-sheet')) close(true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(false); });
})();
