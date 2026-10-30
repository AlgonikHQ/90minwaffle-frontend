/* NMW_PREDICT_20261023: one prediction strip for Matches, Home and Me. The same id everywhere, so each game is one vote.
   Shows for games in the next 24 hours, locks at kick-off, writes to nmw_pred_log so results resolve as before. */
(function () {
  'use strict';
  if (window.NMWPredict) return;
  var LS = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function core(s) { return norm(s).replace(/\b(a?fc|cf|sc)\b/g, ' ').replace(/\s+/g, ' ').trim(); }
  function short(n) { return String(n || '').replace(/\s+A?FC$/i, ''); }
  function key(f) { return core(f.home).replace(/ /g, '-') + '-v-' + core(f.away).replace(/ /g, '-') + '-' + String(f.kickoff_utc || '').slice(0, 10); }
  function open(f) { var t = Date.parse(f.kickoff_utc), now = Date.now(); return t - 3e5 > now && t - now <= 24 * 36e5;   /* VOTECLOSE_20261024: closes 5 minutes before kick-off */ }   // NMW_PRED_24H: rolling window - every game in the next 24 hours
  var CSS = '.np{display:flex;flex-direction:column;gap:8px;background:var(--bg-card,#0a1020);border:1px solid rgba(34,211,238,.3);border-radius:14px;padding:12px 14px;color:var(--text,#e6edf6);text-align:left}' +
    '.np-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.np-h b{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent,#22d3ee)}.np-h span{font-size:11px;color:var(--text-dim,#8aa0b8)}' +
    '.np-o{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}' +
    '.np-o button{min-height:44px;padding:6px 8px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:#111a2e;color:var(--text,#e6edf6);font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.np-o button.on{border-color:var(--accent,#22d3ee);background:rgba(34,211,238,.16)}.np-o button:disabled{cursor:default}.np-o button:disabled:not(.on){opacity:.55}' +
    '.np-r{font-size:12px;color:#b6c2d1;line-height:1.45}.np-r b{color:var(--text,#e6edf6)}';
  function css() { if (document.getElementById('np-css')) return; var s = document.createElement('style'); s.id = 'np-css'; s.textContent = CSS; (document.head || document.documentElement).appendChild(s); }
  var REG = [];
  function fanLine(f, res, mine) {
    var arr = res && (res.top_answers || res.results || res.answers), pct = {};
    if (Array.isArray(arr)) arr.forEach(function (x) { var k = x.answer || x.option || x.label, v = x.pct != null ? x.pct : x.percent; if (k != null && v != null) pct[String(k).toLowerCase().trim()] = Math.round(v);   /* the server keeps answers in lower case */ });
    var opts = [f.home, 'Draw', f.away], have = opts.some(function (o) { return pct[String(o).toLowerCase().trim()]; }), tv = res && res.total_votes;
    return (mine ? 'You picked <b>' + esc(mine === 'Draw' ? 'a draw' : short(mine)) + '</b>.' : 'Voting closed.') + (tv ? ' ' + tv + ' vote' + (tv === 1 ? '' : 's') + '.' : '') + (have ? ' Fans: ' + opts.map(function (o) { return esc(o === 'Draw' ? 'Draw' : short(o)) + ' <b>' + (pct[String(o).toLowerCase().trim()] || 0) + '%</b>'; }).join(' · ') : ' The fan split shows once a few more votes are in.');
  }
  function hideDup(f) {  /* ONECARD_20261030: one card per match - hide the page's own 'Who wins?' poll when 'Your prediction' shows */
    var h = String(f.home || '').toLowerCase().trim(), a = String(f.away || '').toLowerCase().trim();
    function run() { try { [].forEach.call(document.querySelectorAll('.mpoll-wrap'), function (w) {
      var t = [].map.call(w.querySelectorAll('button'), function (b) { return b.textContent.trim().toLowerCase(); });
      if (t.indexOf(h) >= 0 && t.indexOf(a) >= 0) w.style.display = 'none'; }); } catch (e) {} }
    run(); setTimeout(run, 800); setTimeout(run, 2500);
  }
  function render(el, f) {
    if (!el || !f || !f.home || !f.away || !f.kickoff_utc) return false;
    var k = key(f), mine = LS.get('nmw_pred_' + k), started = Date.parse(f.kickoff_utc) - 3e5 <= Date.now();
    if (!mine && !open(f) && !(started && Date.now() - Date.parse(f.kickoff_utc) < 3 * 36e5)) return false;   /* after voting closes, everyone sees the fan split for 3 hours */
    css(); hideDup(f);
    var opts = [f.home, 'Draw', f.away];
    el.innerHTML = '<div class="np" data-np="' + esc(k) + '"><div class="np-h"><b>Your prediction</b><span>' + (mine ? (started ? 'Locked' : 'Saved') : (started ? 'Voting closed' : 'Closes 5 min before kick-off')) + '</span></div>' +
      '<div class="np-o" role="group" aria-label="Predict ' + esc(short(f.home)) + ' v ' + esc(short(f.away)) + '">' + opts.map(function (o) {
        return '<button type="button" data-p="' + esc(o) + '" class="' + (o === mine ? 'on' : '') + '" aria-pressed="' + (o === mine) + '"' + (mine || started ? ' disabled' : '') + '>' + esc(o === 'Draw' ? 'Draw' : short(o)) + '</button>'; }).join('') + '</div>' +
      '<div class="np-r" aria-live="polite">' + (mine ? 'You picked <b>' + esc(mine === 'Draw' ? 'a draw' : short(mine)) + '</b>.' : (started ? 'Voting closed 5 minutes before kick-off.' : 'Call it up to 5 minutes before kick-off. Your picks are scored on the Me page.')) + '</div></div>';
    var box = el.querySelector('.np'), r = box.querySelector('.np-r');
    if (REG.indexOf(el) < 0) { REG.push(el); el.__npf = f; }
    if (mine || started) fetch('/poll/results?id=' + encodeURIComponent('pred_' + k)).then(function (x) { return x.json(); }).then(function (d) { r.innerHTML = fanLine(f, d, mine); }).catch(function () {});
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-p]'); if (!b) return;
      e.preventDefault(); e.stopPropagation();
      if (LS.get('nmw_pred_' + k) || Date.parse(f.kickoff_utc) - 3e5 <= Date.now()) return;
      var p = b.getAttribute('data-p'); save(k, f, p);
      r.innerHTML = 'Saving your pick...';
      fetch('/poll/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ poll_id: 'pred_' + k, answer: p, voter_id: LS.get('nmw_uid') || '', kickoff_utc: f.kickoff_utc }) })
        .then(function (x) { return x.json(); }).then(function (d) { REG.forEach(function (x) { if (x.__npf && key(x.__npf) === k && x.isConnected) { render(x, x.__npf); var rr = x.querySelector('.np-r'); if (rr) rr.innerHTML = fanLine(f, d, p); } }); })
        .catch(function () { REG.forEach(function (x) { if (x.__npf && key(x.__npf) === k && x.isConnected) render(x, x.__npf); }); });
      try { document.dispatchEvent(new CustomEvent('nmw:predicted', { detail: { key: k, pick: p } })); } catch (x) {}
    });
    return true;
  }
  function save(k, f, p) {
    LS.set('nmw_pred_' + k, p);
    try {
      var log = JSON.parse(LS.get('nmw_pred_log') || '[]'), id = 'pred_' + k;
      if (!log.some(function (e) { return e.poll_id === id; })) {
        log.unshift({ poll_id: id, home: f.home, away: f.away, league: f.league || '', kickoff_utc: f.kickoff_utc, pick: p, match_id: f.fixture_id || '', fixture_id: f.fixture_id || '', ts: new Date().toISOString(), result: null });
        LS.set('nmw_pred_log', JSON.stringify(log.slice(0, 200)));
        LS.set('nmw_trophy_prediction', String((parseInt(LS.get('nmw_trophy_prediction') || '0', 10) || 0) + 1));
      }
    } catch (e) {}
  }
  window.NMWPredict = { render: render, key: key, open: open, picked: function (f) { return LS.get('nmw_pred_' + key(f)); } };
  try { document.dispatchEvent(new Event('nmw:predict-ready')); } catch (e) {}
})();
