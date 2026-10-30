/* NMW_PREVSTRIP_20261024: prediction strip on preview pages. Reads names + kick-off from the page's SportsEvent data. */
(function () {
  'use strict';
  var slot = document.getElementById('np-slot'); if (!slot) return;
  var ev = null;
  document.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) {
    try { var d = JSON.parse(s.textContent); (Array.isArray(d) ? d : [d]).forEach(function (x) { if (x && x['@type'] === 'SportsEvent') ev = x; }); } catch (e) {}
  });
  if (!ev || !ev.homeTeam || !ev.awayTeam || !ev.startDate) return;
  var lg = document.querySelector('.ko a');
  var f = { home: ev.homeTeam.name, away: ev.awayTeam.name, kickoff_utc: ev.startDate, league: lg ? lg.textContent : '', fixture_id: slot.getAttribute('data-fx') || '' };
  function go(P) { if (P.render(slot, f)) slot.style.margin = '12px 0'; }
  if (window.NMWPredict) return go(window.NMWPredict);
  var sc = document.createElement('script'); sc.src = '/js/predict.js?v=2';
  sc.onload = function () { if (window.NMWPredict) go(window.NMWPredict); };
  document.head.appendChild(sc);
})();
