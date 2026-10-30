/* HOME_V2_20261023 v2: live parts of the homepage: poll vote + model reveal, live score refresh, live card -> match sheet, followed-club card */
(function () {
  'use strict';
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ord(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function norm(x) { return String(x || '').toLowerCase().replace(/\b(fc|cf|afc|sc)\b/g, '').replace(/[^a-z0-9]/g, ''); }
  function ukTime(iso) { var k = new Date(iso); return isNaN(k) ? '' : k.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' }); }

  /* 1. Fans v the model (POLLVOTE_20261023): one vote per person via the vote server, live fan % back, then the model's view */
  var polls = document.querySelectorAll('.hv2-poll'), CLOSED = false;
  function uid() { var u = ls('nmw_uid'); if (!u) { u = 'v' + Math.random().toString(36).slice(2, 12); ls('nmw_uid', u); } return u; }
  function getResults(id, cb) {
    fetch('/poll/results?id=' + encodeURIComponent(id) + '&t=' + Date.now()).then(function (r) { return r.json(); }).then(cb).catch(function () { cb(null); });
  }
  function showAll(i, res) { if (CLOSED) return;
    polls.forEach(function (card) {
      var btns = card.querySelectorAll('.hv2-vote'), note = card.querySelector('.hv2-pollnote');
      var model = (card.getAttribute('data-model') || '').split('|').map(Number);
      btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      var pick = btns[i].textContent, txt = 'You picked ' + pick + '.';
      if (res && res.total_votes) {
        var hit = (res.top_answers || []).filter(function (x) { return x.answer === pick.toLowerCase().trim(); })[0];
        txt += ' ' + (hit ? hit.pct : 0) + '% of ' + res.total_votes + ' fan' + (res.total_votes === 1 ? '' : 's') + ' agree.';
      }
      if (model.length === 3 && !isNaN(model[0])) txt += ' The model: home ' + model[0] + '%, draw ' + model[1] + '%, away ' + model[2] + '%.';
      note.textContent = txt;
    });
  }
  if (polls.length) {
    var pid = polls[0].getAttribute('data-poll'), key = 'nmw_poll_vote_' + pid, prev = ls(key);
    /* VOTECLOSE_20261024: the poll closes 5 minutes before kick-off; then everyone sees the fan split and the model */
    /* HV2_POLLFT_20261025: after full time the card shows the score, your call, the fans and the model */
    var PD = null, _ft = null, FTDONE = false;
    function nm(x) { return String(x || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\b(a?fc|cf|sc)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim(); }
    function fullTime(cb) {
      if (!PD || !KO || Date.now() < KO + 105 * 60000) return cb(null);
      (_ft = _ft || fetch('/data/fixtures.json?t=' + Date.now()).then(function (r) { return r.json(); }).catch(function () { return {}; })).then(function (d) {
        var day = String(PD.kickoff_utc || '').slice(0, 10);
        var g = ((d && d.results) || []).concat((d && d.live) || []).filter(function (x) {
          return nm(x.home) === nm(PD.home) && nm(x.away) === nm(PD.away) && String(x.kickoff_utc || '').slice(0, 10) === day &&
                 /^(FINISHED|FT|AET|PEN)$/i.test(String(x.status || '')) && x.home_score != null; })[0];
        if (!g) _ft = null;
        cb(g || null);
      });
    }
    setInterval(function () { if (CLOSED && !FTDONE && KO && Date.now() > KO + 105 * 60000) closeAll(); }, 300000);
    if (!document.getElementById('hv2-ft-css')) document.head.insertAdjacentHTML('beforeend', '<style id="hv2-ft-css">.hv2-vote.hv2-win{outline:2px solid #3DDC84;outline-offset:1px}</style>');
    var KO = 0; function closedNow() { return CLOSED || (KO && Date.now() >= KO - 3e5); }
    function closeAll() {
      CLOSED = true;
      getResults(pid, function (r) {
        polls.forEach(function (card) {
          var btns = card.querySelectorAll('.hv2-vote'), note = card.querySelector('.hv2-pollnote'), mine = ls(key), opts = [].map.call(btns, function (b) { return b.textContent; }), pc = {};
          var mi = (mine !== null && mine !== '' && !isNaN(+mine)) ? +mine : -1;
          btns.forEach(function (b, j) { b.disabled = true; b.setAttribute('aria-pressed', j === mi ? 'true' : 'false'); });
          ((r && r.top_answers) || []).forEach(function (x) { pc[String(x.answer).toLowerCase().trim()] = x.pct; });
          var model = (card.getAttribute('data-model') || '').split('|').map(Number);
          var t = (mi >= 0 ? 'You picked ' + opts[mi] + '. ' : '') + 'Voting closed 5 minutes before kick-off.';
          if (r && r.total_votes) t += ' Fans (' + r.total_votes + ' vote' + (r.total_votes === 1 ? '' : 's') + '): ' + opts.map(function (o) { return o + ' ' + (pc[o.toLowerCase().trim()] || 0) + '%'; }).join(', ') + '.';
          if (model.length === 3 && !isNaN(model[0])) t += ' The model: home ' + model[0] + '%, draw ' + model[1] + '%, away ' + model[2] + '%.';
          if (note) note.textContent = t;
          (function (card, btns, mi, t, note) { fullTime(function (g) {   /* HV2_POLLFT_20261025 */
            if (!g || !note) return; FTDONE = true;
            var hs = +g.home_score, as = +g.away_score, res = hs > as ? 0 : (hs < as ? 2 : 1);
            var you = mi >= 0 ? (mi === res ? 'You called it. ' : 'Not this time. ') : '';
            note.textContent = 'Full time: ' + g.home + ' ' + hs + '\u2013' + as + ' ' + g.away + '. ' + you + t.replace(/\s*Voting closed 5 minutes before kick-off\.\s*/, ' ').replace(/^You picked/, 'You picked').trim();
            var h2 = card.querySelector('h2'); if (h2) h2.textContent = 'Fans v the model: result';
            [].forEach.call(btns, function (b, j) { b.classList.toggle('hv2-win', j === res); });
          }); })(card, btns, mi, t, note);
        });
      });
    }
    fetch('/data/poll_data.json?t=' + Date.now()).then(function (x) { return x.json(); }).then(function (d) {
      if (!d || (d.id && d.id !== pid)) return; PD = d; KO = Date.parse(d.kickoff_utc) || 0; if (!KO) return;
      if (closedNow()) closeAll(); else setTimeout(closeAll, Math.min(KO - 3e5 - Date.now(), 2147483000));
    }).catch(function () {});
    if (prev !== null && prev !== '' && !isNaN(+prev)) getResults(pid, function (r) { showAll(+prev, r); });
    polls.forEach(function (card) {
      card.querySelectorAll('.hv2-vote').forEach(function (b, i) {
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          if (closedNow()) { closeAll(); return; }
          var had = ls(key);
          if (had !== null && had !== '') { getResults(pid, function (r) { showAll(+had, r); }); return; }
          ls(key, String(i)); ls('nmw_poll_count', String((+ls('nmw_poll_count') || 0) + 1));
          fetch('/poll/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ poll_id: pid, answer: b.textContent, voter_id: uid(), kickoff_utc: KO ? new Date(KO).toISOString() : '' }) })
            .then(function (r) { return r.json(); }).then(function (r) { showAll(i, r); }).catch(function () { showAll(i, null); });
        });
      });
    });
  }

  /* 2. Live and today: refresh live scores every 60s while visible; a live card opens the match details sheet */
  var row = document.getElementById('hv2-games'), meta = document.getElementById('hv2-today-meta');
  function liveCard(m) {
    var hs = m.home_score == null ? 0 : m.home_score, as = m.away_score == null ? 0 : m.away_score;
    return '<a class="hv2-g hv2-live" href="/matches/" data-fid="' + esc(m.af_fixture_id || ('bsd-' + m.bsd_id)) + '"><span class="hv2-gt">LIVE' + (m.minute ? ' ' + esc(m.minute) + '\'' : '') + '</span>' +
      '<span class="hv2-gr"><span>' + esc(m.home) + '</span><b>' + esc(hs) + '</b></span><span class="hv2-gr"><span>' + esc(m.away) + '</span><b>' + esc(as) + '</b></span></a>';
  }
  function live() {
    if (!row || document.hidden) return;
    fetch('/data/live_now.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (d) {
      var all = (d.matches || []).filter(function (m) { return m.in_matches !== false && ['FT', 'AET', 'PEN', 'NS'].indexOf(m.status) < 0; });
      var names = {}; all.forEach(function (m) { names[m.home + '|' + m.away] = 1; });
      row.querySelectorAll('.hv2-live').forEach(function (e) { e.remove(); });
      row.querySelectorAll('.hv2-g').forEach(function (a) { var s = a.children; if (s.length === 3 && names[s[1].textContent + '|' + s[2].textContent]) a.remove(); });
      row.insertAdjacentHTML('afterbegin', all.sort(function (a, b) { return lgRank(a) - lgRank(b); }).slice(0, 4).map(liveCard).join('')); pinMine();
      if (meta) meta.textContent = meta.textContent.replace(/\d+ live/, all.length + ' live').replace(/updated \d\d:\d\d/, 'updated ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' }));
    }).catch(function () {});
  }
  setInterval(live, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) live(); });
  if (row) row.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.hv2-live[data-fid]');
    if (a && typeof window.openLivePanel === 'function') { e.preventDefault(); window.openLivePanel(a.getAttribute('data-fid')); }
  });

  /* HV2_MINE: your club (and country) first in Live and today - moved, never copied */
  function pinMine() {
    if (!row) return;
    var keys = [ls('nmw_followed_team'), ls('nmw_followed_country')].map(norm).filter(function (k) { return k.length > 2; });
    if (!keys.length) return;
    var cards = [].slice.call(row.querySelectorAll('.hv2-g')).filter(function (a) {
      return [].slice.call(a.querySelectorAll('span')).some(function (sp) { var t = norm(sp.firstChild && sp.firstChild.nodeType === 3 ? sp.firstChild.nodeValue : sp.textContent); return keys.indexOf(t) >= 0; });
    });
    cards.reverse().forEach(function (a) { a.classList.add('hv2-mine'); if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', 'Your team: ' + a.textContent.replace(/\s+/g, ' ').trim()); row.insertBefore(a, row.firstChild); });
  }
  pinMine();
  /* HV2_ORDER_20261025: big leagues first for live games; your club's game is fetched if it is not on the row */
  function lgRank(m) {
    var s = String(m.league || m.league_code || m.competition || ''), T = [/premier league|^pl$/i, /champions league|^ucl$/i, /^la ?liga|^pd$/i, /^serie a|^sa$/i, /^bundesliga|^bl1$/i,
      /^ligue 1|^fl1$/i, /europa league|^uel$/i, /championship|^elc$/i, /scottish premiership|^spl$/i, /conference league|^uecl$/i];
    for (var i = 0; i < T.length; i++) if (T[i].test(s)) return i;
    return 99;
  }
  (function addMine() {
    if (!row) return;
    var keys = [ls('nmw_followed_team'), ls('nmw_followed_country')].map(norm).filter(function (k) { return k.length > 2; });
    if (!keys.length || row.querySelector('.hv2-mine')) return;
    var today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
    fetch('/data/fixtures.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      if (row.querySelector('.hv2-mine')) return;
      var g = (d.upcoming || []).filter(function (x) {
        var k = new Date(x.kickoff_utc); if (isNaN(k) || k < new Date()) return false;
        return k.toLocaleDateString('en-CA', { timeZone: 'Europe/London' }) === today && (keys.indexOf(norm(x.home)) >= 0 || keys.indexOf(norm(x.away)) >= 0);
      })[0];
      if (!g) return;
      var t = new Date(g.kickoff_utc).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' });
      row.insertAdjacentHTML('afterbegin', '<a class="hv2-g hv2-mine" href="/matches/" aria-label="Your team: ' + esc(g.home) + ' v ' + esc(g.away) + '"><span class="hv2-gm">' + esc(t) + ' · ' + esc(g.league || '') +
        '</span><span>' + esc(g.home) + '</span><span>' + esc(g.away) + '</span></a>');
    }).catch(function () {});
  })();

  /* 3. Returning visitor: their club card from the club's own file (same data as the Me page), UK kick-off time */
  var team = ls('nmw_followed_team'), box = document.getElementById('hv2-myteam');
  function noCard() { document.documentElement.classList.remove('hv2-has-team'); }
  if (team && box) {
    fetch('/data/clubs/index.json').then(function (r) { return r.json(); }).then(function (d) {
      var list = Array.isArray(d) ? d : (d.clubs || Object.keys(d).map(function (k) { return d[k]; })), t = norm(team);
      var c = list.filter(function (x) { return x && (norm(x.name) === t || norm(x.short_name) === t || x.slug === team || norm(x.slug) === t); });
      c = c.filter(function (x) { return x.position != null; })[0] || c[0];
      if (!c) return noCard();
      return fetch('/data/clubs/' + encodeURIComponent(c.slug) + '.json').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }).then(function (f) {
        var name = f.name || c.name, st = f.standing || {}, nf = f.next_fixture || c.next_fixture || {};
        var pos = st.position != null ? st.position : c.position, pts = st.points != null ? st.points : c.points;
        var form = (f.form && f.form.last5) || [];
        var opp = nf.home ? (norm(nf.home) === norm(name) ? nf.away : nf.home) : '', when = nf.kickoff_utc ? ukTime(nf.kickoff_utc) : '';
        var line = (pos ? ord(pos) + (pts != null ? ' · ' + esc(pts) + ' pts' : '') : '') + (opp ? (pos ? ' · ' : '') + 'Next: ' + esc(opp) + (when ? ', ' + esc(when) : '') : '');
        var dots = form.length ? '<span class="hv2-dots" role="img" aria-label="Form, oldest first: ' + form.join(', ') + '">' + form.map(function (r) { return '<span class="hv2-d ' + (r === 'W' ? 'w' : r === 'L' ? 'l' : '') + '" aria-hidden="true">' + esc(r) + '</span>'; }).join('') + '</span>' : '';
        var badge = f.badge_url || c.badge_url;
        box.innerHTML = '<a class="hv2-club" href="/clubs/' + esc(c.slug) + '/">' + (badge ? '<img src="' + esc(badge) + '" alt="" width="40" height="40">' : '') +
          '<span><span class="hv2-meta">Your team</span><b>' + esc(name) + '</b><span class="hv2-meta">' + line + '</span>' + dots + '</span></a>';
        if (nf.home && nf.kickoff_utc) {   // HV2_PRED: predict your club's game from the homepage (js/predict.js, one vote per game)
          var goP = function (P) { var d = document.createElement('div'); d.className = 'hv2-pred'; d.style.marginTop = '10px'; if (P && P.render(d, { home: nf.home, away: nf.away, kickoff_utc: nf.kickoff_utc, league: f.league_code || '', fixture_id: nf.id || '' })) box.appendChild(d); };
          if (window.NMWPredict) goP(window.NMWPredict); else { var sc = document.createElement('script'); sc.src = '/js/predict.js?v=2'; sc.onload = function () { goP(window.NMWPredict); }; document.head.appendChild(sc); }
        }
      });
    }).catch(noCard);
  }
})();

/* VOTE_SYNC_20261025: the homepage poll and the Me page card for the same game share one "voted" state */
(function () {
  if (window.__nmwVS) return; window.__nmwVS = 1;
  var JSONV = false;
  function g(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function s(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function core(x) { x = String(x || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    return x.replace(/\b(a?fc|cf|sc)\b/g, ' ').replace(/\s+/g, ' ').trim().replace(/ /g, '-'); }
  function txt(v) { if (v == null) return ''; v = String(v); if (/^".*"$/.test(v)) { try { v = JSON.parse(v); } catch (e) {} } return v; }
  function mh(v) { return JSONV ? JSON.stringify(v) : v; }
  var P = window.fetch('/data/poll_data.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
    if (!d || !d.id || !d.home || !d.away) return null;
    d._k = 'pred_' + core(d.home) + '-v-' + core(d.away) + '-' + String(d.kickoff_utc || '').slice(0, 10);
    d._day = 'nmw_poll_vote_' + d.id;
    d._o = (d.options || [d.home, 'Draw', d.away]).map(String);
    var lo = d._o.map(function (o) { return o.toLowerCase(); }); d._i = function (a) { return lo.indexOf(String(a || '').toLowerCase()); };
    var day = txt(g(d._day)), mine = txt(g('nmw_mh_poll_' + d._k)) || txt(g('nmw_mh_poll_' + d.id));
    if (day && !/^\d+$/.test(day) && d._i(day) >= 0) { s(d._day, String(d._i(day))); day = String(d._i(day)); }   // repair: club name stored where a number belongs
    if (/^\d+$/.test(day) && !mine && d._o[+day]) { s('nmw_mh_poll_' + d._k, mh(d._o[+day])); s('nmw_mh_poll_' + d.id, mh(d._o[+day])); }
    else if (mine && !day && d._i(mine) >= 0) s(d._day, String(d._i(mine)));
    return d; }).catch(function () { return null; });
  function sync(pid, ans) { P.then(function (d) {
    if (!d || (pid !== d.id && pid !== d._k)) return;
    if (d._i(ans) >= 0) s(d._day, String(d._i(ans)));
    s('nmw_mh_poll_' + d.id, mh(ans)); s('nmw_mh_poll_' + d._k, mh(ans)); }); }
  var F = window.fetch;
  window.fetch = function (u, o) { var r = F.apply(this, arguments);
    try { if (o && String(o.method || '').toUpperCase() === 'POST' && /\/poll\/vote/.test(String((u && u.url) || u))) {
      var b = JSON.parse(o.body || '{}'); if (b.poll_id && b.answer) r.then(function (x) { if (x && x.ok) sync(b.poll_id, b.answer); }).catch(function () {}); } } catch (e) {}
    return r; };
})();

/* TIP_SHEET_20261025: "Why this pick" opens the tip and its reasons in a pop-up instead of a new page */
(function () {
  if (window.__nmwTS) return; window.__nmwTS = 1;
  var tipsP = null, last = null;
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tips() { return tipsP || (tipsP = fetch('/data/enriched_bets.json?t=' + Date.now()).then(function (r) { return r.json(); })
    .then(function (d) { return Array.isArray(d) ? d : (d.selections || d.bets || []); }).catch(function () { tipsP = null; return []; })); }
  function lib() { if (window.nmwReasonsHtml) return Promise.resolve(); return new Promise(function (ok) {
    var s = document.createElement('script'); s.src = '/js/edge-reasons.js'; s.onload = s.onerror = function () { ok(); }; document.head.appendChild(s); }); }
  function css() { if (document.getElementById('nmw-ts-css')) return; document.head.insertAdjacentHTML('beforeend', '<style id="nmw-ts-css">'
    + '.nmw-ts-bg{position:fixed;inset:0;background:rgba(3,8,20,.6);z-index:10000}'
    + '.nmw-ts{position:fixed;left:0;right:0;bottom:0;max-height:85vh;overflow:auto;background:#0f1a2e;color:#e6edf5;border:1px solid rgba(34,211,238,.35);border-radius:16px 16px 0 0;padding:18px 16px 24px;z-index:10001;box-shadow:0 -12px 32px rgba(0,0,0,.45)}'
    + '@media(min-width:760px){.nmw-ts{left:50%;right:auto;bottom:auto;top:50%;transform:translate(-50%,-50%);width:520px;border-radius:16px}}'
    + '.nmw-ts-x{position:absolute;top:8px;right:8px;width:44px;height:44px;background:none;border:0;color:#e6edf5;font-size:26px;cursor:pointer;border-radius:8px}.nmw-ts-x:focus-visible{outline:2px solid #22d3ee}'
    + '.nmw-ts-k{font-size:12px;color:#9fb1c7}.nmw-ts h2{margin:4px 44px 8px 0;font-size:19px}.nmw-ts-m{margin:0 0 12px}.nmw-ts-m b{color:#22d3ee}'
    + '.nmw-ts-s{display:inline-block;margin-left:8px;font-size:12px;padding:2px 8px;border-radius:10px;border:1px solid rgba(255,255,255,.2)}.nmw-ts-s.w{color:#3DDC84;border-color:#3DDC84}.nmw-ts-s.l{color:#ff7a7f;border-color:#ff7a7f}'
    + '.nmw-ts-r{border-top:1px solid rgba(255,255,255,.1);padding-top:10px}.nmw-ts-n{font-size:12px;color:#9fb1c7;margin:14px 0 10px}.nmw-ts a.nmw-ts-l{color:#22d3ee}</style>'); }
  function close() { var a = document.querySelector('.nmw-ts'), b = document.querySelector('.nmw-ts-bg'); if (a) a.remove(); if (b) b.remove();
    document.removeEventListener('keydown', key); if (last && last.focus) last.focus(); }
  function key(e) { if (e.key === 'Escape') close(); }
  function when(k) { var d = new Date(k); return isNaN(d) ? '' : d.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' }); }
  function open(t, fallback) {
    css(); close();
    var rs = String(t.result || '').toUpperCase(), st = rs.indexOf('W') === 0 ? ['Won', 'w'] : rs.indexOf('L') === 0 ? ['Lost', 'l'] : rs.indexOf('V') === 0 ? ['Void', ''] : ['Awaiting result', ''];
    var mk = t.market_label || String(t.market || '').replace(/_/g, ' '), pr = t.odds ? '@ ' + (+t.odds).toFixed(2) : 'price on match day';
    var why = ''; try { why = (window.nmwReasonsHtml ? window.nmwReasonsHtml(t) : '') + (window.nmwSignalsHtml ? window.nmwSignalsHtml(t) : ''); } catch (e) {}
    if (!why) why = '<p>' + esc(fallback || 'The full reasoning is on the StatIQ page.') + '</p>';
    document.body.insertAdjacentHTML('beforeend', '<div class="nmw-ts-bg"></div><div class="nmw-ts" role="dialog" aria-modal="true" aria-labelledby="nmw-ts-h">'
      + '<button type="button" class="nmw-ts-x" aria-label="Close">\u00d7</button><span class="nmw-ts-k">' + esc(t.league || '') + ' \u00b7 ' + esc(when(t.kickoff_utc)) + '</span>'
      + '<h2 id="nmw-ts-h">' + esc(t.home) + ' v ' + esc(t.away) + '</h2><p class="nmw-ts-m">' + esc(mk) + ' <b>' + esc(pr) + '</b><span class="nmw-ts-s ' + st[1] + '">' + st[0] + '</span></p>'
      + ((window.__nmwTP || {})[String(t.id)] ? '<p style="font-size:15px;line-height:1.5;margin:0 0 12px">' + esc(window.__nmwTP[String(t.id)].all.join(' ')) + '</p>' : '') + '<div class="nmw-ts-r">' + why + '</div><p class="nmw-ts-n">Every tip is logged when it fires and settled from the final score. Info only, 18+. Please gamble responsibly.</p>'
      + '<a class="nmw-ts-l" href="/edges/">Full record on StatIQ \u203a</a></div>');
    document.querySelector('.nmw-ts-bg').addEventListener('click', close); document.querySelector('.nmw-ts-x').addEventListener('click', close);
    document.addEventListener('keydown', key); document.querySelector('.nmw-ts-x').focus();
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a'); if (!a || !/why this pick/i.test(a.textContent)) return;
    var card = a.closest('[data-tid], .hv2-botd, .hv3-e'); if (!card) return;
    e.preventDefault(); last = a;
    var tid = card.getAttribute('data-tid'), fb = (card.querySelector('.hv3-why') ? '' : '');
    var idP = tid ? Promise.resolve(tid) : fetch('/data/botd.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (d) { return (d.current || {}).selection_id; }).catch(function () { return null; });
    Promise.all([idP, tips(), lib(), (window.__nmwTP ? Promise.resolve() : fetch('/data/tip_plain.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (d) { window.__nmwTP = d; }).catch(function () {}))]).then(function (v) {
      var t = v[1].filter(function (x) { return String(x.id) === String(v[0]); })[0];
      if (!t) { location.href = a.href; return; }
      open(t, fb);
    });
  });
})();
