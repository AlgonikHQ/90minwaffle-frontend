/* MATCHCENTRE_20261017 v2: line-ups, injuries, timeline, momentum, shot map, xG race, stats, forecast + tips, fans' vote, form, H2H - full-neon style */
(function () {
  if (window.__nmwMC) return; window.__nmwMC = 1;
  var p = new URLSearchParams(location.search);
  var raw = p.get('id') || decodeURIComponent((location.hash || '').replace(/^#/, ''));
  var mm = String(raw || '').match(/(\d{4,})$/);  /* MCRESOLVE_20261019: no number in the id? look it up instead of giving up */
  var strong = String(raw || '').match(/^bsd-(\d+)$|BSD_(\d+)$/);  /* MCRESOLVE2_20261019: only trust ids that are clearly ours */
  var eid = strong ? (strong[1] || strong[2]) : null, guess = mm ? mm[1] : null, tries = 0, timer = null, looked = false;
  function resolve(cb) {
    if (eid || looked) return cb(); looked = true;
    var j = function (u) { return fetch(u + '?t=' + Date.now()).then(function (r) { return r.json(); }).catch(function () { return {}; }); };
    Promise.all([j('/data/live_now.json'), j('/data/football.json')]).then(function (r) {
      var all = [].concat(r[0].matches || [], r[1].live || [], r[1].upcoming || [], r[1].results || []), s = String(raw || '');
      for (var i = 0; i < all.length && !eid; i++) { var m = all[i]; if (!m) continue;
        if ([m.id, m.af_fixture_id, m.fixture_id, m.bsd_id].map(function (x) { return String(x); }).indexOf(s) < 0) continue;
        var b = m.bsd_id || (String(m.id || '').match(/BSD_(\d+)$/) || [])[1]; if (b) eid = String(b); }
      if (!eid) eid = guess;
      cb();
    });
  }
  var CSS = '#nmw-mc{margin:14px 0}#nmw-mc .mc-card{background:#0a1020;border:1px solid rgba(34,211,238,.35);border-radius:16px;padding:14px;margin:12px 0;box-shadow:0 0 18px rgba(34,211,238,.08)}'
    + '#nmw-mc h2{color:#22d3ee;font-size:15px;letter-spacing:.06em;text-transform:uppercase;margin:0 0 10px;text-shadow:0 0 10px rgba(34,211,238,.4)}'
    + '#nmw-mc .mc-sub{color:#8aa0b8;font-size:12px}#nmw-mc .mc-tag{display:inline-block;font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid rgba(34,211,238,.5);color:#22d3ee;margin-left:8px;vertical-align:2px;text-shadow:none;letter-spacing:0;text-transform:none}'
    + '#nmw-mc .ev{display:grid;grid-template-columns:1fr 46px 1fr;align-items:center;gap:6px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13.5px;color:#e6edf6}'
    + '#nmw-mc .ev .mn{text-align:center;color:#a3e635;font-weight:800}#nmw-mc .ev .h{text-align:right}#nmw-mc .ev .a{text-align:left}'
    + '#nmw-mc .gl{color:#a3e635;font-weight:700}#nmw-mc .as{color:#22d3ee;font-size:12px}#nmw-mc .cy{display:inline-block;width:9px;height:12px;border-radius:2px;background:#facc15;vertical-align:-1px;margin:0 5px}#nmw-mc .cr{background:#ef4444}'
    + '#nmw-mc .per{text-align:center;color:#22d3ee;font-size:12px;font-weight:700;padding:7px 0;letter-spacing:.08em;border-bottom:1px solid rgba(34,211,238,.15)}'
    + '#nmw-mc .st{margin:10px 0}#nmw-mc .st .lb{display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;color:#e6edf6}#nmw-mc .st .lb span{color:#8aa0b8}'
    + '#nmw-mc .bar{display:flex;height:7px;border-radius:9px;overflow:hidden;background:#111a2e}#nmw-mc .bar i{display:block;background:#22d3ee;box-shadow:0 0 8px rgba(34,211,238,.6)}#nmw-mc .bar u{display:block;background:#a3e635;opacity:.85}'
    + '#nmw-mc .lu{display:grid;grid-template-columns:1fr 1fr;gap:14px}#nmw-mc h3{font-size:14px;margin:0 0 4px;font-style:italic;font-weight:800;color:#fff}#nmw-mc .lu ol{list-style:none;padding:0;margin:6px 0 0}'
    + '#nmw-mc .lu li{font-size:13px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);color:#e6edf6}#nmw-mc .lu li b{display:inline-block;min-width:24px;color:#22d3ee}'
    + '#nmw-mc .ld{color:#8aa0b8;font-size:13px;text-align:center;padding:10px}#nmw-mc .ft{text-align:right;margin-top:4px}'
    + '#nmw-mc .fm{display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:6px;font-weight:800;font-size:12px;margin-right:4px}#nmw-mc .fm-W{background:#a3e635;color:#06120a}#nmw-mc .fm-D{background:#334155;color:#e6edf6}#nmw-mc .fm-L{background:#ef4444;color:#fff}'
    + '#nmw-mc .fr{margin:6px 0 12px}#nmw-mc .fr .mc-sub{margin-top:5px}#nmw-mc .hh{display:flex;justify-content:space-between;gap:8px;font-size:13px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);color:#e6edf6}#nmw-mc .hh b{color:#22d3ee}'
    + '#nmw-mc .h2s{font-size:13.5px;margin-bottom:6px;color:#e6edf6}#nmw-mc .h2s b{color:#a3e635}'
    + '#nmw-mc .pb{display:flex;gap:5px}#nmw-mc .pbi{background:#111a2e;border:1px solid rgba(34,211,238,.2);border-radius:10px;padding:8px 4px;text-align:center;min-width:0}#nmw-mc .pbi b{display:block;font-size:17px;color:#fff}'
    + '#nmw-mc .pbi span{font-size:11px;color:#8aa0b8;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#nmw-mc .pbi.fav{border-color:#22d3ee;box-shadow:0 0 10px rgba(34,211,238,.35)}#nmw-mc .pbi.hit{background:rgba(163,230,53,.15);border-color:#a3e635}'
    + '#nmw-mc .vd{margin-top:9px;font-weight:700;font-size:13.5px}#nmw-mc .vd.ok{color:#a3e635}#nmw-mc .vd.no{color:#f87171}'
    + '#nmw-mc .tp{display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);color:#e6edf6}#nmw-mc .rs{font-size:11px;font-weight:800;padding:2px 9px;border-radius:999px}'
    + '#nmw-mc .rs-w{background:#a3e635;color:#06120a}#nmw-mc .rs-l{background:#ef4444;color:#fff}#nmw-mc .rs-p{border:1px solid #8aa0b8;color:#8aa0b8}#nmw-mc .lg2{display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:6px}';
  CSS += '.nmw-old{display:none!important}'   /* TIDY: old duplicate sections hidden, kept old cards restyled */
    + '.page .card:not(.mc-card),.pred-card{background:#0a1020!important;border:1px solid rgba(34,211,238,.35)!important;border-radius:16px!important;box-shadow:0 0 18px rgba(34,211,238,.08)!important}'
    + '.nmw-lbl{color:#22d3ee!important;text-shadow:0 0 10px rgba(34,211,238,.35);letter-spacing:.06em}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  function e(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function val(x) { if (x && typeof x === 'object') return x.value != null ? x.value : (x.pct != null ? x.pct : null); return x; }
  function card(t, inner, tag) { return '<div class="mc-card"><h2>' + t + (tag ? '<span class="mc-tag">' + tag + '</span>' : '') + '</h2>' + inner + '</div>'; }
  function box() {
    var b = document.getElementById('nmw-mc'); if (b) return b;
    b = document.createElement('div'); b.id = 'nmw-mc';
    var a = document.getElementById('live-stats-section');
    if (a && a.parentNode) a.parentNode.insertBefore(b, a); else (document.getElementById('page') || document.body).appendChild(b);
    return b;
  }
  function score(d) {
    var best = null;
    (d.incidents || []).forEach(function (i) { if (i.home_score != null && i.away_score != null && (!best || (+i.minute || 0) >= (+best.minute || 0))) best = i; });
    return best ? [+best.home_score, +best.away_score] : null;
  }
  function side(t) {
    if (!t) return '<div></div>';
    var P = t.players || [], s = P.filter(function (x) { return x.substitute === false || x.is_starter === true || x.starter === true; }), b;
    if (s.length >= 11) b = P.filter(function (x) { return s.indexOf(x) < 0; }); else { s = P.slice(0, 11); b = P.slice(11); }
    var li = function (x) { return '<li><b>' + e(x.jersey_number != null ? x.jersey_number : '') + '</b>' + e(x.name || x.short_name || '') + (x.captain ? ' <span class="as">(C)</span>' : '') + ' <span class="mc-sub">' + e(x.position || '') + '</span></li>'; };
    return '<div><h3>' + e(t.team_name || '') + '</h3><div class="mc-sub">' + e(t.formation || '') + '</div><ol>' + s.map(li).join('') + '</ol>'
      + (b.length ? '<div class="mc-sub" style="margin-top:10px">Bench</div><ol>' + b.map(li).join('') + '</ol>' : '') + '</div>';
  }
  function lineups(d) {
    var L = d.lineups || {}; if (!L.home && !L.away) return '';
    return card('Line-ups', '<div class="lu">' + side(L.home) + side(L.away) + '</div>', /confirm|official/i.test(String(d.lineup_status || '')) ? 'Confirmed' : 'Predicted');
  }
  function outList(d) {
    var U = d.unavailable || [], L = d.lineups || {}, hs = [], as = [];
    var hid = (L.home || {}).team_id, aid = (L.away || {}).team_id;
    var arr = function (x) { return Array.isArray(x) ? x : (x && (x.players || x.list)) || []; };
    if (Array.isArray(U)) U.forEach(function (x) { if (x && (x.is_home === true || x.side === 'home' || (hid && x.team_id === hid))) hs.push(x); else if (x && (x.is_home === false || x.side === 'away' || (aid && x.team_id === aid))) as.push(x); });
    else if (U && typeof U === 'object') { hs = arr(U.home); as = arr(U.away); }
    if (!hs.length && !as.length) return '';
    var li = function (x) { if (typeof x !== 'object') return '<li>' + e(x) + '</li>'; return '<li>' + e(x.name || x.player_name || x.short_name || '') + ' <span class="mc-sub">' + e(x.reason || x.type || x.status || x.injury || x.description || '') + '</span></li>'; };
    var none = '<li class="mc-sub">None reported</li>';
    return card('Injuries &amp; suspensions', '<div class="lu"><div><h3>' + e((L.home || {}).team_name || d.home || 'Home') + '</h3><ol>' + (hs.map(li).join('') || none)
      + '</ol></div><div><h3>' + e((L.away || {}).team_name || d.away || 'Away') + '</h3><ol>' + (as.map(li).join('') || none) + '</ol></div></div>');
  }
  function tl(d) {
    var k = function (i) { return (+i.minute || 0) + (+(i.added_time || i.extra_minute || 0)) / 100 + (String(i.type) === 'period' ? 0.99 : 0); };
    var I = (d.incidents || []).slice().sort(function (x, y) { return k(x) - k(y); }), out = '';
    I.forEach(function (i) {
      var t = String(i.type || '').toLowerCase(), ad = i.added_time || i.extra_minute;
      var mn = i.minute != null ? i.minute + (ad ? '+' + ad : '') + "'" : '';
      if (t === 'period') { out += '<div class="per">' + e(i.text || '') + (i.home_score != null ? ' \u00b7 ' + e(i.home_score) + '-' + e(i.away_score) : '') + '</div>'; return; }
      var body;
      if (t === 'goal') body = '<span class="gl">\u26BD ' + e(i.player || 'Goal') + '</span>' + (/pen/i.test(String(i.goal_type || i.detail || '')) ? ' <span class="as">(pen)</span>' : '') + (/own/i.test(String(i.goal_type || i.detail || '')) ? ' <span class="as">(og)</span>' : '') + (i.assist ? '<br><span class="as">assist ' + e(i.assist) + '</span>' : '');
      else if (t === 'card') { var red = /red/i.test(String(i.card_type || i.card || i.color || i.detail || i['class'] || '')); body = '<span class="cy' + (red ? ' cr' : '') + '"></span>' + e(i.player || ''); }
      else if (t.indexOf('sub') === 0) body = '<span class="as">\u2191 ' + e(i.player_in || i.player || '') + '</span><br><span class="mc-sub">\u2193 ' + e(i.player_out || '') + '</span>';
      else return;
      var h = i.is_home === true || i.is_home === 1;
      out += '<div class="ev"><div class="h">' + (h ? body : '') + '</div><div class="mn">' + mn + '</div><div class="a">' + (h ? '' : body) + '</div></div>';
    });
    return out ? card('Timeline', out) : '';
  }
  var STATS = [['Possession', 'ball_possession', '%'], ['Expected goals (xG)', 'expected_goals', ''], ['Shots', 'total_shots', ''], ['Shots on target', 'shots_on_target', ''],
    ['Big chances', 'big_chances', ''], ['Corners', 'corner_kicks', ''], ['Passes', 'passes', ''], ['Pass accuracy', 'pass_accuracy_pct', '%'], ['Tackles', 'total_tackles', ''],
    ['Fouls', 'fouls', ''], ['Offsides', 'offsides', ''], ['Saves', 'goalkeeper_saves', ''], ['Yellow cards', 'yellow_cards', ''], ['Red cards', 'red_cards', '']];
  function stats(d) {
    var S = d.stats || {}, h = S.home || {}, a = S.away || {}, out = '';
    STATS.forEach(function (r) {
      var x = val(h[r[1]]), y = val(a[r[1]]);
      if (r[1] === 'expected_goals' && x == null) { x = val(h.xg); y = val(a.xg); }
      if (x == null && y == null) return;
      x = +x || 0; y = +y || 0; var t = x + y, pw = t ? Math.round(100 * x / t) : 50;
      var fx = function (v) { return r[1] === 'expected_goals' ? v.toFixed(2) : String(Math.round(v * 10) / 10); };
      out += '<div class="st"><div class="lb"><b>' + fx(x) + r[2] + '</b><span>' + r[0] + '</span><b>' + fx(y) + r[2] + '</b></div><div class="bar"><i style="width:' + pw + '%"></i><u style="width:' + (100 - pw) + '%"></u></div></div>';
    });
    return out ? card('Match stats', out) : '';
  }
  function legend(d) { return '<div class="lg2"><span style="color:#22d3ee">\u25B2 ' + e(d.home || 'Home') + '</span><span style="color:#a3e635">' + e(d.away || 'Away') + ' \u25BC</span></div>'; }
  function momCard(d) {
    var M = d.momentum || []; if (M.length < 5) return '';
    var W = Math.max(90, +M[M.length - 1].m || 90), mx = 1; M.forEach(function (q) { mx = Math.max(mx, Math.abs(+q.v || 0)); });
    var bw = 300 / W, s = '<svg viewBox="0 0 300 84" width="100%" height="84" preserveAspectRatio="none" style="display:block">'
      + '<line x1="0" y1="42" x2="300" y2="42" stroke="rgba(255,255,255,.18)"/><line x1="' + (45 * bw).toFixed(1) + '" y1="0" x2="' + (45 * bw).toFixed(1) + '" y2="84" stroke="rgba(34,211,238,.3)" stroke-dasharray="2 3"/>';
    M.forEach(function (q) { var v = +q.v || 0, h = Math.abs(v) / mx * 36, x = ((+q.m || 1) - 1) * bw; s += '<rect x="' + x.toFixed(1) + '" y="' + (v >= 0 ? 42 - h : 42).toFixed(1) + '" width="' + Math.max(bw - 0.6, 0.8).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + (v >= 0 ? '#22d3ee' : '#a3e635') + '" opacity=".9"/>'; });
    (d.incidents || []).forEach(function (i) { if (String(i.type) === 'goal' && i.minute != null) { var x = ((+i.minute) - 0.5) * bw, h = i.is_home === true || i.is_home === 1; s += '<circle cx="' + x.toFixed(1) + '" cy="' + (h ? 3 : 81) + '" r="2.6" fill="#fff" style="filter:drop-shadow(0 0 2px #a3e635)"/>'; } });
    return card('Momentum', legend(d) + s + '</svg><div class="mc-sub" style="margin-top:4px">Bars show who was on top each minute \u00b7 white dots are goals</div>');
  }
  function xgCard(d) {
    var X = d.xg_min || []; if (X.length < 2) return '';
    var W = Math.max(90, +X[X.length - 1].m || 90), mx = 0.5; X.forEach(function (q) { mx = Math.max(mx, +q.cum_home || 0, +q.cum_away || 0); });
    var Y = function (v) { return (80 - v / mx * 72).toFixed(1); };
    var pts = function (k) { var a = ['0,80'], last = 0; X.forEach(function (q) { var x = ((+q.m || 0) / W * 300).toFixed(1); a.push(x + ',' + Y(last)); last = +q[k] || 0; a.push(x + ',' + Y(last)); }); a.push('300,' + Y(last)); return a.join(' '); };
    var z = X[X.length - 1];
    return card('xG race', '<div class="lg2"><span style="color:#22d3ee">' + e(d.home || '') + ' ' + (+z.cum_home || 0).toFixed(2) + '</span><span style="color:#a3e635">' + (+z.cum_away || 0).toFixed(2) + ' ' + e(d.away || '') + '</span></div>'
      + '<svg viewBox="0 0 300 84" width="100%" height="84" preserveAspectRatio="none" style="display:block"><polyline fill="none" stroke="#22d3ee" stroke-width="2.2" points="' + pts('cum_home') + '" style="filter:drop-shadow(0 0 2px #22d3ee)"/>'
      + '<polyline fill="none" stroke="#a3e635" stroke-width="2.2" points="' + pts('cum_away') + '"/></svg><div class="mc-sub" style="margin-top:4px">Running total of chance quality (xG) through the match</div>');
  }
  function shotCard(d) {
    var S = d.shots || []; if (!S.length) return '';
    var names = {}, L = d.lineups || {};
    ['home', 'away'].forEach(function (k) { ((L[k] || {}).players || []).forEach(function (q) { names[q.id] = q.short_name || q.name; }); });
    var ln = 'fill="none" stroke="rgba(255,255,255,.35)" stroke-width=".35"';
    var s = '<svg viewBox="0 0 105 68" width="100%" style="display:block;background:linear-gradient(180deg,#0d2c1c,#0a2015);border-radius:10px;border:1px solid rgba(34,211,238,.35)">'
      + '<rect x=".5" y=".5" width="104" height="67" ' + ln + '/><line x1="52.5" y1=".5" x2="52.5" y2="67.5" ' + ln + '/><circle cx="52.5" cy="34" r="9.15" ' + ln + '/>'
      + '<rect x=".5" y="13.84" width="16" height="40.32" ' + ln + '/><rect x="88.5" y="13.84" width="16" height="40.32" ' + ln + '/><rect x=".5" y="24.84" width="5" height="18.32" ' + ln + '/><rect x="99.5" y="24.84" width="5" height="18.32" ' + ln + '/>';
    var tally = { h: [0, 0], a: [0, 0] };
    S.forEach(function (t) {
      var q = t.pos || {}, px = Math.max(0, Math.min(100, +q.x || 0)), py = Math.max(0, Math.min(100, +q.y || 0));
      var X = (t.home ? 100 - px : px) * 1.05, Yy = py * 0.68, r = (1.1 + Math.sqrt(+t.xg || 0) * 3.2).toFixed(2), ty = String(t.type || '');
      var goal = ty === 'goal', on = goal || ty === 'save', col = t.home ? '#22d3ee' : '#a3e635';
      tally[t.home ? 'h' : 'a'][0]++; if (on) tally[t.home ? 'h' : 'a'][1]++;
      s += '<circle cx="' + X.toFixed(1) + '" cy="' + Yy.toFixed(1) + '" r="' + r + '" fill="' + (goal ? '#ffffff' : on ? col : 'none') + '" fill-opacity="' + (goal ? 1 : .7) + '" stroke="' + col + '" stroke-width="' + (goal ? .9 : .5) + '"'
        + (goal ? ' style="filter:drop-shadow(0 0 1.6px ' + col + ')"' : '') + '><title>' + e((t.min != null ? t.min + "' " : '') + (names[t.player_id] || '') + ' \u00b7 ' + ty + ' \u00b7 xG ' + (+t.xg || 0).toFixed(2)) + '</title></circle>';
    });
    return card('Shot map', '<div class="lg2"><span style="color:#22d3ee">' + e(d.home || '') + ' ' + tally.h[0] + ' shots (' + tally.h[1] + ' on target) \u2192</span><span style="color:#a3e635">\u2190 ' + e(d.away || '') + ' ' + tally.a[0] + ' (' + tally.a[1] + ')</span></div>' + s
      + '</svg><div class="mc-sub" style="margin-top:5px">White = goal \u00b7 filled = on target \u00b7 ring = off target or blocked \u00b7 bigger = higher xG</div>');
  }
  function formCard(d) {
    var F = d.form || {}; if (!(F.home || []).length && !(F.away || []).length) return '';
    var row = function (n, L) {
      return '<div class="fr"><h3>' + e(n) + '</h3><div>' + L.slice().reverse().map(function (x) { return '<span class="fm fm-' + e(x.r) + '" title="' + e(x.ha + ' ' + x.opp + ' ' + x.score + ' \u00b7 ' + x.date) + '">' + e(x.r) + '</span>'; }).join('')
        + '</div><div class="mc-sub">' + L.slice(0, 3).map(function (x) { return e(x.r + ' ' + x.score + ' ' + (x.ha === 'H' ? 'v' : 'at') + ' ' + x.opp); }).join(' \u00b7 ') + '</div></div>';
    };
    return card('Form \u00b7 last 5', row(d.home || 'Home', F.home || []) + row(d.away || 'Away', F.away || []));
  }
  function h2hCard(d) {
    var H = d.h2h || []; if (!H.length) return '';
    var w = 0, dr = 0, l = 0;
    H.forEach(function (x) { var g = x.h_is_home ? x.hs : x['as'], o = x.h_is_home ? x['as'] : x.hs; if (g > o) w++; else if (g < o) l++; else dr++; });
    return card('Head to head', '<div class="h2s"><b>' + w + '</b> ' + e(d.home || '') + ' \u00b7 <b>' + dr + '</b> draws \u00b7 <b>' + l + '</b> ' + e(d.away || '') + ' <span class="mc-sub">(last ' + H.length + ')</span></div>'
      + H.map(function (x) { return '<div class="hh"><span class="mc-sub">' + e(x.date) + '</span><span>' + e(x.home) + ' <b>' + e(x.hs) + '-' + e(x['as']) + '</b> ' + e(x.away) + '</span></div>'; }).join(''));
  }
  function calledCard(d, fin) {
    var P = d.probs || {}, T = d.tips || []; if (P.p_home == null && !T.length) return '';
    var out = '';
    if (P.p_home != null) {
      var A = [['H', d.home || 'Home', +P.p_home], ['D', 'Draw', +P.p_draw], ['A', d.away || 'Away', +P.p_away]];
      var fav = A.slice().sort(function (x, y) { return y[2] - x[2]; })[0][0], sc = score(d), res = sc ? (sc[0] > sc[1] ? 'H' : sc[0] < sc[1] ? 'A' : 'D') : null;
      out += '<div class="pb">' + A.map(function (x) { return '<div class="pbi' + (x[0] === fav ? ' fav' : '') + (fin && res === x[0] ? ' hit' : '') + '" style="flex:' + Math.max(x[2], 12) + '"><b>' + Math.round(x[2]) + '%</b><span>' + e(x[1]) + '</span></div>'; }).join('') + '</div>';
      if (fin && res) {
        var nm = function (k) { return k === 'D' ? 'a draw' : e(k === 'H' ? (d.home || 'home') : (d.away || 'away')) + ' win'; };
        out += '<div class="vd ' + (res === fav ? 'ok' : 'no') + '">' + (res === fav ? '\u2713 Called it \u2014 the model had ' + nm(fav) + ' as most likely' : '\u2717 Missed \u2014 the model favoured ' + nm(fav) + ', it finished ' + sc[0] + '-' + sc[1]) + '</div>';
      }
      if (P.btts != null) { var bt = +P.btts, yes = sc && sc[0] > 0 && sc[1] > 0; out += '<div class="mc-sub" style="margin-top:7px">Both teams to score: ' + Math.round(bt) + '%' + (fin && sc ? (((bt >= 50) === yes) ? ' \u00b7 \u2713' : ' \u00b7 \u2717') : '') + '</div>'; }
    }
    if (T.length) out += '<div style="margin-top:10px"><div class="mc-sub">Our tips</div>' + T.map(function (t) {
      var r = String(t.result || '').toUpperCase(), c = r === 'WIN' || r === 'WON' ? 'w' : (r === 'LOSS' || r === 'LOSE' || r === 'LOST') ? 'l' : 'p';
      return '<div class="tp"><span>' + e(t.label || '') + (t.odds ? ' <span class="mc-sub">@ ' + e(t.odds) + '</span>' : '') + '</span><span class="rs rs-' + c + '">' + e(r || 'Pending') + '</span></div>';
    }).join('') + '</div>';
    return card(fin ? 'How we called it' : 'Our forecast', out, 'Model forecast');
  }
  function vote() {
    fetch('/poll/results?id=' + encodeURIComponent(raw)).then(function (r) { return r.json(); }).then(function (j) {
      var A = j.top_answers || [], tot = +j.total_votes || 0; if (!tot || !A.length) return;
      var h = A.map(function (a) { var lab = a.answer || a.label || a[0], n = +(a.count || a.votes || a[1] || 0), pc = a.pct != null ? Math.round(+a.pct) : Math.round(100 * n / tot); return '<div class="st"><div class="lb"><span>' + e(lab) + '</span><b>' + pc + '%</b></div><div class="bar"><i style="width:' + pc + '%"></i></div></div>'; }).join('');
      var c = document.getElementById('nmw-mc-vote'); if (!c) { c = document.createElement('div'); c.id = 'nmw-mc-vote'; box().appendChild(c); }
      c.innerHTML = card("Fans' vote", h + '<div class="mc-sub">' + tot + ' votes</div>');
    }).catch(function () {});
  }
  var SECT = /^(community prediction|recent form|head[ -]to[ -]head|line-?ups|injuries\s*(&|and)\s*(absences|suspensions)|man of the match|motm|match stats|live stats|key stats|prediction|team news)$/i;
  function leafs(root) {
    return Array.prototype.slice.call(root.querySelectorAll('h1,h2,h3,h4,h5,h6,div,span,p,strong,b')).filter(function (el) {
      var kids = Array.prototype.every.call(el.children, function (c) { return /^(SVG|I|IMG|BR)$/i.test(c.tagName) || !(c.textContent || '').trim(); });
      var t = (el.textContent || '').trim(); return kids && t.length < 40 && SECT.test(t);
    });
  }
  function heads(el) { var o = {}; leafs(el).forEach(function (x) { o[x.textContent.trim().toLowerCase()] = 1; }); return Object.keys(o).length; }
  function tidy(d) {
    var mc = document.getElementById('nmw-mc');  /* MCKEEP_20261019: page redraws can wipe the box - put it back so old sections stay hidden */
    if (mc && mc.innerHTML) window.__mcKeep = mc.innerHTML;
    if (!mc) { mc = box(); if (window.__mcKeep) mc.innerHTML = window.__mcKeep; }
    var L = d.lineups || {}, F = d.form || {}, hide = [/^community prediction$/i];  /* MCONLY_20261018 */
    if ((F.home || []).length || (F.away || []).length) hide.push(/^recent form$/i);
    if ((d.h2h || []).length) hide.push(/^head[ -]to[ -]head$/i);
    if (L.home || L.away) { hide.push(/^line-?ups$/i); hide.push(/^injuries\s*(&|and)\s*(absences|suspensions)$/i); Array.prototype.forEach.call(document.querySelectorAll('[id^="lineup-section-"]'), function (x) { if (!mc.contains(x)) x.classList.add('nmw-old'); }); }
    leafs(document.body).forEach(function (el) {
      if (mc.contains(el)) return;
      var t = el.textContent.trim();
      if (!hide.some(function (r) { return r.test(t); })) { el.classList.add('nmw-lbl'); return; }
      var node = el;
      while (node.parentElement && node.parentElement !== document.body && !node.parentElement.contains(mc) && heads(node.parentElement) <= 1) node = node.parentElement;
      node.classList.add('nmw-old');
      var nx = node.nextElementSibling;
      if (nx && !nx.contains(mc) && heads(nx) === 0 && !/nav|footer/i.test(nx.className + ' ' + nx.id)) nx.classList.add('nmw-old');
    });
  }
  function when(iso) { try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch (x) { return String(iso || '').slice(11, 16); } }
  function load() {
    if (!eid) { box().innerHTML = card('Match centre', '<div class="ld">Detailed stats aren\u2019t available for this match. The score above is live.</div>');
      window.__mcD = { form: { home: [1] }, h2h: [1], lineups: { home: 1 } }; tidy(window.__mcD); if (!window.__mcObs && window.MutationObserver) { window.__mcObs = new MutationObserver(function () { clearTimeout(window.__mcT); window.__mcT = setTimeout(function () { if (window.__mcD) tidy(window.__mcD); }, 60); }); window.__mcObs.observe(document.body, { childList: true, subtree: true }); } return; }  /* MCRESOLVE_20261019 */
    fetch('/data/match_centre/' + eid + '.json?' + Date.now()).then(function (r) { if (!r.ok) throw r.status; return r.json(); }).then(function (d) {
      var fin = !!d.final, on = (d.incidents || []).length > 0;
      var parts = on ? [tl(d), momCard(d), shotCard(d), xgCard(d), stats(d), lineups(d), outList(d), calledCard(d, fin), formCard(d), h2hCard(d)]
                     : [calledCard(d, false), formCard(d), h2hCard(d), lineups(d), outList(d)];
      var h = parts.join('');
      box().innerHTML = h ? h + '<div class="mc-sub ft">Updated ' + e(when(d.updated_at)) + ' \u00b7 data: BSD</div>' : '';
      if (fin) { fetch('/data/match_reports_map.json?h=' + Math.floor(Date.now() / 600000)).then(function (r) { return r.json(); }).then(function (mp) {   /* INTERLINK_20261017 */
        var u = mp && mp[eid]; if (!u || document.getElementById('nmw-mc-rep')) return;
        var x = document.createElement('a'); x.id = 'nmw-mc-rep'; x.href = u; x.className = 'mc-card'; x.style.cssText = 'display:block;text-decoration:none;color:#22d3ee;font-weight:800';
        x.innerHTML = '&#128196; Read the full match report &rsaquo;<div class="mc-sub" style="font-weight:400;margin-top:4px">Summary, every stat, momentum, shot map and how we called it</div>';
        box().insertBefore(x, box().firstChild); }).catch(function () {}); }
      vote(); window.__mcD = d; tidy(d); if (!window.__mcObs && window.MutationObserver) { window.__mcObs = new MutationObserver(function () { clearTimeout(window.__mcT); window.__mcT = setTimeout(function () { if (window.__mcD) tidy(window.__mcD); }, 60); }); window.__mcObs.observe(document.body, { childList: true, subtree: true }); }  /* MCONLY_20261018 */
      if (!fin) { clearTimeout(timer); timer = setTimeout(load, 60000); }
    }).catch(function () {
      if (++tries <= 8) { box().innerHTML = card('Match centre', '<div class="ld">Detailed stats for this match aren\u2019t ready yet \u2013 we\u2019ll load them automatically. The score above is live.</div>'); window.__mcD = window.__mcD || { form: { home: [1] }, h2h: [1], lineups: { home: 1 } }; tidy(window.__mcD); if (!window.__mcObs && window.MutationObserver) { window.__mcObs = new MutationObserver(function () { clearTimeout(window.__mcT); window.__mcT = setTimeout(function () { if (window.__mcD) tidy(window.__mcD); }, 60); }); window.__mcObs.observe(document.body, { childList: true, subtree: true }); }  /* MCONLY_20261018 */ clearTimeout(timer); timer = setTimeout(load, 30000); }
      else { box().innerHTML = ''; if (window.__mcObs) window.__mcObs.disconnect(); window.__mcD = null; Array.prototype.forEach.call(document.querySelectorAll('.nmw-old'), function (x) { x.classList.remove('nmw-old'); }); }  /* MCONLY_20261018 */
    });
  }
  var start = function () { resolve(load); };  /* MCRESOLVE_20261019 */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
