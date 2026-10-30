/* MFALLBACK_20261019: when the match page can't find a fixture, show a basic card from the live feed instead of a dead end */
(function () {
  if (window.__nmwMF) return; window.__nmwMF = 1;
  var p = new URLSearchParams(location.search);
  var raw = String(p.get('id') || decodeURIComponent((location.hash || '').replace(/^#/, '')) || '');
  if (!raw) return;
  var dig = (raw.match(/(\d{4,})$/) || [])[1] || '';
  function e(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hit(m) {
    var ids = [m.id, m.af_fixture_id, m.bsd_id, m.fixture_id, m.fid].map(function (x) { return x == null ? '' : String(x); });
    if (ids.indexOf(raw) >= 0) return true;
    return !!dig && ids.some(function (x) { return x === dig || (x.length > dig.length && x.slice(-dig.length - 1) === '_' + dig); });
  }
  function find(list) { for (var i = 0; i < list.length; i++) if (list[i] && hit(list[i])) return list[i]; return null; }
  function card(m, kind) {
    var hs = m.home_score, as = m.away_score, live = kind === 'live' || m.is_live;
    var mid = (hs != null && as != null) ? (hs + ' - ' + as) : (m.time_label || 'vs');
    var st = live ? ('&#9679; ' + (m.minute ? m.minute + '&#39; ' : '') + 'LIVE') : (kind === 'results' ? 'Full time' : e(m.date_label || ''));
    return '<div style="max-width:720px;margin:18px auto;padding:0 16px">'
      + '<div style="background:#0a1020;border:1px solid rgba(34,211,238,.35);border-radius:16px;padding:18px 14px;text-align:center">'
      + '<div style="font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;opacity:.65;margin-bottom:12px">' + e(m.league || '') + '</div>'
      + '<div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px">'
      + '<div style="font-weight:800">' + e(m.home) + '</div>'
      + '<div style="font-size:2rem;font-weight:900;color:' + (live ? '#ff5a5f' : '#e6edf6') + '">' + e(mid) + '</div>'
      + '<div style="font-weight:800">' + e(m.away) + '</div></div>'
      + (st ? '<div style="margin-top:10px;font-size:.78rem;font-weight:800;color:' + (live ? '#ff5a5f' : '#9aa7b8') + '">' + st + '</div>' : '')
      + '</div><p style="text-align:center;opacity:.7;font-size:.82rem;margin:14px 6px">Detailed stats aren\u2019t available for this competition yet. '
      + '<a href="/matches/" style="color:#22d3ee">Back to today\u2019s games</a></p></div>';
  }
  var busy = false;
  function check() {
    if (busy) return;
    var els = document.querySelectorAll('.empty'), el = null;
    for (var i = 0; i < els.length; i++) if (/Fixture not found/i.test(els[i].textContent || '')) { el = els[i]; break; }
    if (!el) return;
    busy = true;
    var j = function (u) { return fetch(u + '?t=' + Date.now()).then(function (r) { return r.json(); }).catch(function () { return {}; }); };
    Promise.all([j('/data/live_now.json'), j('/data/football.json')]).then(function (r) {
      var ln = r[0] || {}, fb = r[1] || {}, kind = 'live', m = find(ln.matches || []);
      if (!m) { m = find(fb.live || []); }
      if (!m) { m = find(fb.results || []); kind = 'results'; }
      if (!m) { m = find(fb.upcoming || []); kind = 'upcoming'; }
      el.outerHTML = m ? card(m, kind) : '<div class="empty">This match has finished and isn\u2019t covered in detail. <a href="/matches/" style="color:#22d3ee">Back to today\u2019s games</a></div>';
      setTimeout(function () { busy = false; }, 3000);
    });
  }
  if (window.MutationObserver) new MutationObserver(check).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check); else check();
})();
