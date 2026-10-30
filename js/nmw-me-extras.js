/* NMW_MEX_20261024: Me page extras.
   1. Your picks: All / Won / Lost / Waiting filters + a league picker (built on the existing list).
   2. Notification choices: one switch per notification the site really sends. Saved on this phone and sent to the server at once. */
(function () {
  var W = window, D = document;
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function log() { try { return JSON.parse(ls('nmw_pred_log') || '[]') || []; } catch (e) { return []; } }
  var css = D.createElement('style'); css.id = 'nmwmx-css';
  css.textContent = '.nmwmx-bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px}.nmwmx-bar .pred-tab-btn{flex:1 1 auto;min-width:64px;padding:8px 10px;border-radius:10px;border:1px solid var(--border);background:var(--bg-elev);color:var(--text-dim);font-weight:700;font-size:.8rem;cursor:pointer}' +
    '.nmwmx-bar .pred-tab-btn.active{background:var(--accent-dim);color:#22d3ee;border-color:#22d3ee}.nmwmx-bar select{flex:1 1 100%;padding:8px 10px;border-radius:10px;border:1px solid var(--border);background:var(--bg-elev);color:var(--text);font-size:.85rem}' +
    '.nmwn{display:block!important;padding-top:4px}.nmwn h4{margin:10px 0 4px;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;color:#22d3ee}.nmwn p.nmwn-note{margin:0 0 6px;font-size:.78rem;color:var(--text-dim)}' +
    '.nmwn-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--border)}.nmwn-row:first-of-type{border-top:0}.nmwn-row div{flex:1;min-width:0}.nmwn-row b{display:block;font-size:.88rem}.nmwn-row small{display:block;color:var(--text-dim);font-size:.75rem;margin-top:2px}' +
    '.nmwn-sw{flex:none;width:46px;height:28px;border-radius:999px;border:1px solid var(--border);background:var(--bg-elev);position:relative;cursor:pointer;padding:0}.nmwn-sw::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#94a3b8;transition:left .15s,background .15s}' +
    '.nmwn-sw[aria-checked="true"]{background:rgba(34,211,238,.18);border-color:#22d3ee}.nmwn-sw[aria-checked="true"]::after{left:21px;background:#22d3ee}';
  (D.head || D.documentElement).appendChild(css);

  // ---------- 1. picks filters ----------
  var F = { tab: 'all', lg: '' };
  function res(p) { return p.result === 'W' ? 'wins' : p.result === 'L' ? 'losses' : 'pending'; }
  function lgName(p) { return String(p.league || '').trim() || 'Other'; }
  W.renderPredTab = function (tab) {
    var rows = D.getElementById('predRowsList'), wb = D.getElementById('predTabWins'); if (!rows) return;
    var fresh = !(wb && wb.parentNode && wb.parentNode.className === 'nmwmx-bar');   // the page redraws its list with 'wins' - keep the fan's own filter
    if (tab) F.tab = fresh && tab === 'wins' ? F.tab : tab;
    var all = log().slice().reverse(), bar = wb && wb.parentNode;
    var lgs = {}; all.forEach(function (p) { lgs[lgName(p)] = 1; });
    var inLg = all.filter(function (p) { return !F.lg || lgName(p) === F.lg; });
    var n = { all: inLg.length, wins: 0, losses: 0, pending: 0 }; inLg.forEach(function (p) { n[res(p)]++; });
    if (bar) {
      bar.className = 'nmwmx-bar'; bar.removeAttribute('style');
      var L = Object.keys(lgs).sort();
      bar.innerHTML = [['all', 'All'], ['wins', 'Won'], ['losses', 'Lost'], ['pending', 'Waiting']].map(function (t) {
        return '<button type="button" class="pred-tab-btn' + (F.tab === t[0] ? ' active' : '') + '" ' + (t[0] === 'wins' ? 'id="predTabWins" ' : t[0] === 'losses' ? 'id="predTabLosses" ' : '') +
          'aria-pressed="' + (F.tab === t[0]) + '" onclick="renderPredTab(\'' + t[0] + '\')">' + t[1] + ' ' + n[t[0]] + '</button>';
      }).join('') + (L.length > 1 ? '<select aria-label="League" onchange="renderPredLeague(this.value)"><option value="">All leagues</option>' +
        L.map(function (x) { return '<option value="' + esc(x) + '"' + (F.lg === x ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select>' : '');
    }
    var list = inLg.filter(function (p) { return F.tab === 'all' || res(p) === F.tab; });
    W.__nmwPredN = list.length;
    rows.innerHTML = list.length ? list.map(W.mwPredRowHtml || function (p) { return '<div>' + esc(p.home + ' v ' + p.away) + '</div>'; }).join('')
      : '<div class="empty-state" style="padding:18px 0;">' + ({ all: 'No picks yet' + (F.lg ? ' in ' + esc(F.lg) : '') + '.', wins: 'No wins yet - keep going.', losses: 'No losses. Nice.', pending: 'Nothing waiting on a result.' })[F.tab] + '</div>';
    rows.style.maxHeight = '220px'; W._predExpanded = false;
    var sm = D.getElementById('predShowMore'), btn = D.getElementById('predExpandBtn');
    if (sm) sm.style.display = list.length > 3 ? 'block' : 'none'; if (btn) btn.textContent = 'Show all (' + list.length + ')';
  };
  W.renderPredLeague = function (v) { F.lg = v; W.renderPredTab(); };
  W.togglePredExpand = function () {
    var rows = D.getElementById('predRowsList'), btn = D.getElementById('predExpandBtn'); if (!rows || !btn) return;
    W._predExpanded = !W._predExpanded; rows.style.maxHeight = W._predExpanded ? rows.scrollHeight + 'px' : '220px';
    btn.textContent = W._predExpanded ? 'Show less' : 'Show all (' + (W.__nmwPredN || 0) + ')';
  };

  // ---------- 2. notification choices ----------
  var T = [
    ['ft', ['ft'], 'Your team at full time', 'The final score when your club or country finishes'],
    ['predictions', ['predictions', 'prediction_result'], 'Your picks', 'Voting closes soon, and whether you called it'],
    ['motm', ['motm', 'motm_open', 'motm_result'], 'Man of the Match', 'When voting opens, and the winner'],
    ['trophies', ['trophies'], 'Trophies', 'When you unlock one'],
    ['news', ['news'], 'Breaking news', 'The biggest football stories']
  ];
  function prefs() { try { return JSON.parse(ls('nmw_push_prefs') || '{}') || {}; } catch (e) { return {}; } }
  function isOn(p, t) { return p[t[1][0]] !== false; }
  function sub() { try { return navigator.serviceWorker ? navigator.serviceWorker.getRegistration().then(function (r) { return r && r.pushManager ? r.pushManager.getSubscription() : null; }).catch(function () { return null; }) : Promise.resolve(null); } catch (e) { return Promise.resolve(null); } }
  function say(m) { if (W.nmwToast) W.nmwToast(m); }
  function draw(box) {
    var p = prefs();
    box.innerHTML = '<h4>Choose what you get</h4><p class="nmwn-note" id="nmwn-note"></p>' + T.map(function (t) {
      return '<div class="nmwn-row"><div><b>' + t[2] + '</b><small>' + t[3] + '</small></div><button type="button" class="nmwn-sw" role="switch" data-nmwn="' + t[0] + '" aria-checked="' + isOn(p, t) + '" aria-label="' + t[2] + '"></button></div>';
    }).join('');
    sub().then(function (s) { var n = D.getElementById('nmwn-note'); if (n) n.textContent = s ? 'Changes save straight away.' : 'Turn on push notifications above, then these choices apply. You can set them now.'; });
  }
  function mount() {
    var st = D.getElementById('push-status'); if (!st) return;
    var row = st.closest('.setting-row'); if (!row || (row.nextElementSibling && row.nextElementSibling.id === 'nmwn')) return;
    var old = D.getElementById('nmwn'); if (old) old.remove();
    var box = D.createElement('div'); box.id = 'nmwn'; box.className = 'setting-row nmwn'; row.insertAdjacentElement('afterend', box); draw(box);
  }
  D.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-nmwn]'); if (!b) return;
    e.preventDefault();
    var t = T.filter(function (x) { return x[0] === b.getAttribute('data-nmwn'); })[0], p = prefs(), on = b.getAttribute('aria-checked') !== 'true';
    t[1].forEach(function (k) { p[k] = on; }); ls('nmw_push_prefs', JSON.stringify(p)); b.setAttribute('aria-checked', String(on));
    sub().then(function (s) {
      if (!s) { say(t[2] + (on ? ' on' : ' off') + ' - applies when notifications are on'); return; }
      if (typeof W.subscribeToPush !== 'function') { say('Saved on this phone'); return; }
      W.subscribeToPush(p).then(function (ok) { say(ok ? t[2] + (on ? ' on' : ' off') : 'Could not save - try again'); }, function () { say('Could not save - try again'); });
    });
  });
  setInterval(mount, 1000); if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', mount); else mount();
})();
