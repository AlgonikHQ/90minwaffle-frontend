/* MX_PANEL_20261023: Matches open panel - clear model block, tidy team news, full-width details button. Phones stack, desktop side by side. */
(function () {
  'use strict';
  if (window.__mx) return; window.__mx = 1;
  var CSS = 'a.details-btn.mx-done{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:12px!important;text-align:left!important}' +
    'a.details-btn.mx-done::before,a.details-btn.mx-done::after{content:none!important;display:none!important}' +
    'a.details-btn.mx-done .mx-old{display:none}' +
    'a.details-btn.mx-done .ij{width:auto!important;max-width:none!important;flex:none!important;margin:0!important}' +
    '.mx-model{background:var(--bg-card,#0a1020);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;color:var(--text,#e6edf6)}' +
    '.mx-lab{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent,#22d3ee)}' +
    '.mx-bar{display:flex;gap:2px;height:8px;border-radius:4px;overflow:hidden;background:#1a2540}.mx-bar i{display:block;height:8px}.mx-bar i.h{background:var(--accent,#22d3ee)}.mx-bar i.d{background:#4b5a78}.mx-bar i.a{background:#94a3b8}' +
    '.mx-probs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.mx-probs div{display:flex;flex-direction:column;gap:2px;min-width:0}.mx-probs div:nth-child(2){text-align:center}.mx-probs div:nth-child(3){text-align:right}' +
    '.mx-probs span{font-size:12px;color:var(--text-dim,#8aa0b8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mx-probs b{font-size:18px;font-weight:800}' +
    '.mx-chips{display:flex;flex-wrap:wrap;gap:6px}.mx-chips span{font-size:12px;font-weight:600;padding:5px 10px;border-radius:999px;background:#111a2e;border:1px solid rgba(255,255,255,.1)}' +
    '.mx-fve{font-size:12px;color:var(--text-dim,#8aa0b8);display:flex;flex-wrap:wrap;gap:4px 12px}.mx-fve b{color:var(--text,#e6edf6)}' +
    '.mx-cta{display:flex;align-items:center;justify-content:center;min-height:44px;border-radius:10px;background:var(--accent,#22d3ee);color:#070b16;font-weight:700;font-size:14px}' +
    '@media(min-width:900px){a.details-btn.mx-done{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}a.details-btn.mx-done .mx-cta{grid-column:1/-1}}';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function txt(e) { return ((e && e.textContent) || '').replace(/\s+/g, ' ').trim(); }
  function short(n) { return n.replace(/\s+A?FC$/i, ''); }
  function fixNews(ij) {
    var w = document.createTreeWalker(ij, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (n) {
      var t = n.textContent.replace(/\b([a-z]+(?:_[a-z]+)+)\b/g, function (x) { var y = x.replace(/_/g, ' '); return y.charAt(0).toUpperCase() + y.slice(1); });
      if (/^\s*0 unavailable\s*$/i.test(t)) t = 'No reported absences';
      if (t !== n.textContent) n.textContent = t;
    });
  }
  function tidy(a) {
    if (a.getAttribute('data-mx')) return;
    var sb = a.querySelector('.simsbar'), card = a.closest('.match-card') || (a.closest('.mc-item') || a.parentElement).querySelector('.match-card') || a.parentElement;
    a.setAttribute('data-mx', '1');
    var ij = a.querySelector('.ij'); if (ij) fixNews(ij);
    if (sb) {
      var home = short(txt(card.querySelector('.team-home'))) || 'Home', away = short(txt(card.querySelector('.team-away'))) || 'Away';
      var pt = [].map.call(sb.children, txt);
      var pl = pt.filter(function (t) { return /Draw/.test(t) && /%/.test(t); })[0] || '';
      var nums = (pl.match(/\d+(?:\.\d+)?(?=%)/g) || []).map(parseFloat);
      if (nums.length >= 3) {
        var chips = (pt.filter(function (t) { return /BTTS|O2\.5|Likely/.test(t); })[0] || '').split('·').map(function (s) { return s.trim().replace(/^O2\.5/, 'Over 2.5'); }).filter(Boolean);
        var fv = ((pt.filter(function (t) { return /Form vs expected/i.test(t); })[0] || '').match(/[-+]?\d+(?:\.\d+)?/g) || []);
        var m = document.createElement('div'); m.className = 'mx-model';
        m.innerHTML = '<div class="mx-lab">The model</div>' +
          '<div class="mx-bar" role="img" aria-label="Model: ' + esc(home) + ' ' + nums[0] + '%, draw ' + nums[1] + '%, ' + esc(away) + ' ' + nums[2] + '%"><i class="h" style="width:' + nums[0] + '%"></i><i class="d" style="width:' + nums[1] + '%"></i><i class="a" style="width:' + nums[2] + '%"></i></div>' +
          '<div class="mx-probs"><div><span>' + esc(home) + '</span><b>' + nums[0] + '%</b></div><div><span>Draw</span><b>' + nums[1] + '%</b></div><div><span>' + esc(away) + '</span><b>' + nums[2] + '%</b></div></div>' +
          (chips.length ? '<div class="mx-chips">' + chips.map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div>' : '') +
          (fv.length >= 2 ? '<div class="mx-fve">Form v expected <span>' + esc(home) + ' <b>' + fv[0] + '</b></span><span>' + esc(away) + ' <b>' + fv[1] + '</b></span></div>' : '');
        sb.style.display = 'none'; sb.parentNode.insertBefore(m, sb);
      }
    }
    [].slice.call(a.childNodes).forEach(function (n) { if (n.nodeType === 3 && n.textContent.trim()) { var s = document.createElement('span'); s.className = 'mx-old'; a.replaceChild(s, n); s.appendChild(n); } });
    var cta = document.createElement('span'); cta.className = 'mx-cta'; cta.innerHTML = 'Match details &rsaquo;'; a.appendChild(cta);
    a.classList.add('mx-done');
  }
  function run() { [].forEach.call(document.querySelectorAll('a.details-btn:not([data-mx])'), function (a) { try { tidy(a); } catch (e) {} }); }
  var st = document.createElement('style'); st.id = 'mx-css'; st.textContent = CSS; (document.head || document.documentElement).appendChild(st);
  var t = null; function soon() { if (t) return; t = setTimeout(function () { t = null; run(); }, 120); }   // MX_THROTTLE: busy desktop pages never go quiet
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  new MutationObserver(soon).observe(document.documentElement, { childList: true, subtree: true });
})();

(function () { /* MX_PRED_20261023: prediction strip above the open panel for games in the next 24 hours */
  function load(cb) {
    if (window.NMWPredict) return cb(window.NMWPredict);
    if (!document.getElementById('np-js')) { var s = document.createElement('script'); s.id = 'np-js'; s.src = '/js/predict.js?v=2'; (document.head || document.documentElement).appendChild(s); }
    document.addEventListener('nmw:predict-ready', function () { cb(window.NMWPredict); }, { once: true });
  }
  function norm(s) { return String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function core(s) { return norm(s).replace(/\b(a?fc|cf|sc)\b/g, ' ').replace(/\s+/g, ' ').trim(); }
  function txt(e) { return ((e && e.textContent) || '').replace(/\s+/g, ' ').trim(); }
  function fixtures() {
    try { var D = (typeof DATA !== 'undefined') ? DATA : window.DATA, out = []; if (!D) return out;
      ['fixtures', 'matches', 'upcoming', 'today', 'tomorrow'].forEach(function (k) { if (Array.isArray(D[k])) out = out.concat(D[k]); }); return out; } catch (e) { return []; }
  }
  function pass(P) {
    var fx = fixtures(); if (!fx.length || !P) return;
    [].forEach.call(document.querySelectorAll('a.details-btn:not([data-np])'), function (a) {
      var card = a.closest('.match-card') || (a.closest('.mc-item') || a.parentElement).querySelector('.match-card'); if (!card) return;   // MX_DESKCARD: on desktop the panel sits beside the card
      a.setAttribute('data-np', '1');
      var he = card.querySelector('.team-home'), ae = card.querySelector('.team-away');   // MX_MATCH2: desktop adds extras (position etc.) beside the name
      var hl = (he ? (he.innerText || he.textContent) : '').split('\n').map(core).filter(Boolean), al = (ae ? (ae.innerText || ae.textContent) : '').split('\n').map(core).filter(Boolean);
      var hf = core(txt(he)), af = core(txt(ae));
      var same = function (x, lines, full) { return !!x && (lines.indexOf(x) >= 0 || (' ' + full + ' ').indexOf(' ' + x + ' ') >= 0); };
      var when = function (x) { return Date.parse(x.kickoff_utc || x.utc_date || x.utcDate || x.date) || 0; };
      var f = fx.filter(function (x) { return same(core(x.home || x.home_team), hl, hf) && same(core(x.away || x.away_team), al, af); })
                .sort(function (x, y) { return Math.abs(when(x) - Date.now()) - Math.abs(when(y) - Date.now()); })[0];
      if (!f) {   // MX_IDFALLBACK: find the game by the fixture id in its Match details link
        var href = a.getAttribute('href') || '', oc = a.getAttribute('onclick') || '';
        var ids = (href + ' ' + oc).match(/[A-Z]{2,4}_[A-Za-z0-9_]+|\b\d{5,}\b/g) || [];
        f = fx.filter(function (x) { var i = String(x.fixture_id || x.id || ''); return i && ids.some(function (y) { return y === i || i.indexOf(y) >= 0; }); })[0];
      }
      if (!f) return;
      var g = { home: f.home || f.home_team, away: f.away || f.away_team, kickoff_utc: f.kickoff_utc || f.utc_date || f.utcDate || f.date, league: f.league || f.league_code || f.code || '', fixture_id: f.fixture_id || f.id || '' };
      var d = document.createElement('div'); d.className = 'mx-predwrap'; d.style.margin = '10px 0';
      if (P.render(d, g)) a.parentNode.insertBefore(d, a);
    });
  }
  var t = null; function go() { if (t) return; t = setTimeout(function () { t = null; load(pass); }, 150); }   // MX_THROTTLE
  go(); new MutationObserver(go).observe(document.documentElement, { childList: true, subtree: true });
})();
