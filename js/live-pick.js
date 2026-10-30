/* LIVEPICK_20261019: one shared live-game picker - every live game counts, biggest first, rotates on Home */
(function () {
  if (window.nmwPickLive) return;
  var TOP = ['Premier League', 'UEFA Champions League', 'Champions League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
             'UEFA Europa League', 'Europa League', 'Conference League', 'UEFA Conference League', 'FA Cup', 'Championship',
             'Eredivisie', 'Primeira Liga', 'Liga Portugal', 'Scottish Premiership', 'Brasileirão Serie A', 'Brasileirão Série A',
             'Liga Profesional', 'MLS', 'Saudi Pro League', 'Süper Lig'];
  function rank(m) {
    var lg = String(m.league || m.league_name || '');
    for (var i = 0; i < TOP.length; i++) if (lg === TOP[i] || lg.indexOf(TOP[i] + ' ') === 0) return i;
    if (/women|femin|nwsl|\bwsl\b/i.test(lg)) return 60;
    if (/serie b|série b|segunda|league one|league two|2\. |\b2$|\bb$/i.test(lg)) return 50;
    return 40;
  }
  function mins(m) {
    if (String(m.status) === 'HT') return 45;
    var x = parseInt(m.minute, 10); if (!isNaN(x)) return x;
    return /2H/.test(m.status || '') ? 60 : (/1H/.test(m.status || '') ? 20 : 0);
  }
  function done(m) { return /^(FT|AET|PEN|FINISHED|CANC|POSTP|ABD)/i.test(String(m.status || '')); }
  function key(m) { return (String(m.home || '') + '|' + String(m.away || '')).toLowerCase(); }
  var chosen = null;
  window.nmwPickLive = function (list, opt) {
    var by = {};
    (list || []).forEach(function (m) {
      if (!m || done(m)) return;
      var k = key(m), o = by[k];
      if (!o || mins(m) > mins(o)) by[k] = m;   /* same fixture twice: keep the latest minute */
    });
    var out = Object.keys(by).map(function (k) { return by[k]; });
    out.sort(function (a, b) {
      var r = rank(a) - rank(b); if (r) return r;
      var ga = Math.abs((+a.home_score || 0) - (+a.away_score || 0)), gb = Math.abs((+b.home_score || 0) - (+b.away_score || 0));
      if (ga !== gb) return ga - gb;
      return mins(b) - mins(a);
    });
    if (opt && opt.rotate && out.length > 1) {
      if (chosen === null) {   /* once per visit: next of the top 5 */
        var n = Math.min(5, out.length), i = 0;
        try { i = (parseInt(sessionStorage.getItem('nmw-live-rot') || '-1', 10) + 1) % n; sessionStorage.setItem('nmw-live-rot', String(i)); } catch (e) {}
        chosen = key(out[i]);
      }
      for (var j = 0; j < out.length; j++) if (key(out[j]) === chosen) { out.unshift(out.splice(j, 1)[0]); break; }
    }
    return out;
  };
})();
