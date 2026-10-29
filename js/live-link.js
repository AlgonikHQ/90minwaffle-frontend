/* LIVELINK_20261017: live cards (home + Matches) open the match sheet with the match centre, not the old live panel */
(function () {
  if (window.__nmwLL) return; window.__nmwLL = 1;
  var map = null;
  function load() {
    if (map) return Promise.resolve(map);
    return fetch('/data/live_now.json?'+Math.floor(Date.now()/15000)).then(function (r) { return r.json(); }).then(function (d) {
      map = {}; (d.matches || []).forEach(function (m) { if (m.af_fixture_id != null && m.bsd_id) map[String(m.af_fixture_id)] = String(m.bsd_id); });
      setTimeout(function () { map = null; }, 60000); return map;
    }).catch(function () { return {}; });
  }
  function sheet(cb) {
    if (window.nmwOpenSheet) return cb();
    var s = document.createElement('script'); s.src = '/js/match-sheet.js?v=4'; s.onload = cb; s.onerror = cb; document.head.appendChild(s);
  }
  function wrap() {
    var orig = window.openLivePanel;
    if (typeof orig !== 'function') return false;
    if (orig.__nmw) return true;
    var w = function (id) {
      var s = (id && typeof id === 'object') ? String(id.bsd_id ? 'bsd-' + id.bsd_id : (id.id || id.fixture_id || id.af_fixture_id || '')) : String(id == null ? '' : id), m = s.match(/(?:^bsd-|BSD_)(\d+)$/);  /* HOMESHEET_20261019: accepts a game object (Home) */
      var go = function (eid) {
        if (!eid) eid = s;  /* SHEETLINKS_20261019: always the new sheet - unknown games get the fallback card */
        sheet(function () { if (window.nmwOpenSheet) window.nmwOpenSheet(eid); else orig(id); });
      };
      if (m) { go(m[1]); return; }
      load().then(function (mp) { go(mp[s]); });
    };
    w.__nmw = 1; window.openLivePanel = w; return true;
  }
  if (typeof window.openLivePanel !== 'function') window.openLivePanel = function (id) { var x = (id && typeof id === 'object') ? (id.bsd_id || id.id || id.af_fixture_id) : id; sheet(function () { if (window.nmwOpenSheet) window.nmwOpenSheet(String(x)); }); };  /* HOMESHEET_20261019: Home has no live panel - open the sheet */
  wrap(); load(); setInterval(wrap, 1000);  /* MCONLY_20261018: preload + re-wrap if the page replaces the handler */
})();

/* SHEETLINKS_20261019: "Match Details" / "Full-Time Stats" links open the match sheet over the page, so Back keeps your place */
(function () {
  if (window.__nmwSL) return; window.__nmwSL = 1;
  var gm = function (id) { if (id == null || id === '') return; sheet(function () { if (window.nmwOpenSheet) window.nmwOpenSheet(String(id)); else location.href = '/matches/match/#' + encodeURIComponent(id); }); };  /* GOMATCH_20261019: card taps open the sheet, never the old page */
  window.goMatch = gm; document.addEventListener('DOMContentLoaded', function () { window.goMatch = gm; }); window.addEventListener('load', function () { window.goMatch = gm; });
  function sheet(cb) { if (window.nmwOpenSheet) return cb(); var s = document.createElement('script'); s.src = '/js/match-sheet.js?v=4'; s.onload = cb; s.onerror = cb; document.head.appendChild(s); }
  document.addEventListener('click', function (ev) {
    if (ev.defaultPrevented || ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target && ev.target.closest && ev.target.closest('a[href]');
    if (!a || a.closest('#nmw-sheet')) return;
    var u; try { u = new URL(a.getAttribute('href'), location.href); } catch (x) { return; }
    if (u.origin !== location.origin || !/^\/matches\/match\/?$/.test(u.pathname)) return;
    var id = u.searchParams.get('id') || decodeURIComponent((u.hash || '').replace(/^#/, ''));
    if (!id) return;
    ev.preventDefault();
    var href = a.href;
    sheet(function () { if (window.nmwOpenSheet) window.nmwOpenSheet(id); else location.href = href; });
  }, true);
})();
