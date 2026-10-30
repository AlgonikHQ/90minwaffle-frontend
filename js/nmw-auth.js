/* NMW_AUTH_20261024: sends this browser's private profile key with profile, leaderboard, streak, trophy and push calls, and saves a new key when the server issues one. */
(function () {
  if (window.__nmwAuth || !window.fetch) return; window.__nmwAuth = 1;
  var F = window.fetch, RX = /\/(profile\/sync|recovery\/(create|resolve)|leaderboard|streak\/update|trophy\/unlock|api\/subscribe|poll\/week)(\?|$)/;
  function key() { try { return localStorage.getItem('nmw_tok') || 'new'; } catch (e) { return 'new'; } }
  window.fetch = function (u, o) {
    try {
      var s = typeof u === 'string' ? u : (u && u.url) || '', a = document.createElement('a'); a.href = s;
      if (a.host !== location.host || !RX.test(a.pathname)) return F.apply(this, arguments);
      o = o || {}; var h = new Headers(o.headers || (typeof u !== 'string' && u.headers) || {}); h.set('X-NMW-Token', key());
      var o2 = {}; for (var k in o) o2[k] = o[k]; o2.headers = h;
      return F.call(this, u, o2).then(function (r) {
        return r.clone().json().then(function (j) { if (j && j.nmw_tok) { try { localStorage.setItem('nmw_tok', j.nmw_tok); } catch (e) {} } }, function () {}).then(function () { return r; });
      });
    } catch (e) { return F.apply(this, arguments); }
  };
})();
