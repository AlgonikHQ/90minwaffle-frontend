/* ME_HUB_20261023 v1: the Me page daily hub - header, tabs and Today cards.
   Existing Me blocks are not rebuilt: they move into the Teams / Progress / Settings tabs. */
(function () {
  'use strict';
  if (window.__mh) return; window.__mh = 1;

  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  function J(k, d) { try { var v = JSON.parse(LS.get(k)); return v == null ? d : v; } catch (e) { return d; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function unesc(s) { var t = document.createElement('textarea'); t.innerHTML = String(s || ''); var a = t.value; t.innerHTML = a; return t.value; }
  function norm(s) { return String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function core(s) { return norm(s).replace(/\b(a?fc|cf|sc)\b/g, ' ').replace(/\s+/g, ' ').trim(); }
  function slug(s) { return core(s).replace(/\s+/g, '-'); }
  function ukDate(d) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(d || new Date()); }
  function ukWhen(iso) { try { return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)); } catch (e) { return ''; } }
  function getJ(u, ms) {   // ME_RETRY_20261024: never wait more than 8 seconds
    ms = ms || 8000; var c = window.AbortController ? new AbortController() : null, t = setTimeout(function () { if (c) c.abort(); }, ms);
    return Promise.race([fetch(u, c ? { cache: 'no-cache', signal: c.signal } : { cache: 'no-cache' }), new Promise(function (_, no) { setTimeout(function () { no(new Error('timeout')); }, ms + 300); })])
      .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error(r.status); return r.json(); }, function (e) { clearTimeout(t); throw e; });
  }
  function retryBox(id, msg, fn) {   // ME_RETRY_20261024
    var host = $(id); if (!host) return; var old = document.getElementById('mh-retry-' + id); if (old) old.remove();
    var b = document.createElement('div'); b.className = 'mh-box mh-retry'; b.id = 'mh-retry-' + id;
    b.innerHTML = '<span class="mh-lbl">' + msg + '</span> <button type="button" class="mh-btn ghost">Retry</button>';
    b.querySelector('button').addEventListener('click', function () { this.disabled = true; b.querySelector('.mh-lbl').textContent = 'Trying again...'; fn(); });
    host.appendChild(b);
  }
  function exists(u) { return fetch(u, { method: 'HEAD' }).then(function (r) { return r.ok; }).catch(function () { return false; }); }
  function $(id) {   // ME_OWNREF: find the hub's own boxes even while the Me page is mid-rebuild
    var e = document.getElementById(id); if (e) return e;
    var roots = [typeof hub !== 'undefined' && hub, typeof todayEl !== 'undefined' && todayEl, typeof progEl !== 'undefined' && progEl];
    for (var i = 0; i < roots.length; i++) if (roots[i]) { e = roots[i].querySelector('#' + id); if (e) return e; }
    return null;
  }

  var TODAY = ukDate();
  var TEAM = LS.get('nmw_followed_team') || '';
  var COUNTRY = LS.get('nmw_followed_country') || '';
  var UID = LS.get('nmw_uid') || '';
  var STATS = J('nmw_mh_stats', { tr: 0, tt: 0, gr: 0, gt: 0 });
  function saveStats() { LS.set('nmw_mh_stats', JSON.stringify(STATS)); }

  var DAYS = J('nmw_mh_days', []);
  if (DAYS[DAYS.length - 1] !== TODAY) { DAYS.push(TODAY); DAYS = DAYS.slice(-60); LS.set('nmw_mh_days', JSON.stringify(DAYS)); }

  var ICON = {
    q: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6M12 17h.01"/></svg>',
    p: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
    bar: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    cal: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    bulb: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg>',
    quote: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6"/></svg>',
    news: '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>',
    bell: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
    flame: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5B841" stroke-width="2" stroke-linejoin="round"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 3 3 3 3s1-3 0-7z"/></svg>'
  };

  var CSS = '' +
    '#page[data-mh-tab="today"]>[data-mh-t]:not([data-mh-t="today"]):not([data-mh-t="all"]),' +
    '#page[data-mh-tab="teams"]>[data-mh-t]:not([data-mh-t="teams"]):not([data-mh-t="all"]),' +
    '#page[data-mh-tab="progress"]>[data-mh-t]:not([data-mh-t="progress"]):not([data-mh-t="all"]),' +
    '#page[data-mh-tab="settings"]>[data-mh-t]:not([data-mh-t="settings"]):not([data-mh-t="all"]),' +
    '#page>[data-mh-t="hide"]{display:none!important}' +
    '#mh,#mh-today,#mh-progress{grid-column:1/-1;width:100%;box-sizing:border-box;color:var(--text,#e6edf6);font-family:inherit}' +
    '#mh{padding:6px 0 0}' +
    '.mh-top{display:flex;align-items:center;gap:12px}' +
    '.mh-av{width:52px;height:52px;flex:0 0 52px;border-radius:50%;background:#111a2e;border:2px solid var(--accent,#22d3ee);overflow:hidden;display:flex;align-items:center;justify-content:center}' +
    '.mh-av img{width:100%;height:100%;object-fit:cover}' +
    '.mh-hi{font-size:13px;color:var(--text-dim,#8aa0b8)}' +
    '#mh .mh-h1{margin:2px 0 0;font-size:22px;font-weight:800;letter-spacing:-.01em;line-height:1.2;color:var(--text,#e6edf6)}' +
    '.mh-chips{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}' +
    '.mh-chip{font-size:12px;font-weight:600;padding:6px 10px;border-radius:999px;background:#111a2e;border:1px solid rgba(255,255,255,.1);color:var(--text,#e6edf6);text-decoration:none}' +
    'button.mh-chip{border-style:dashed;border-color:rgba(34,211,238,.5);color:var(--accent,#22d3ee);font-family:inherit;cursor:pointer}' +
    '.mh-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}' +
    '.mh-stat{background:var(--bg-card,#0a1020);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:2px}' +
    '.mh-stat span{font-size:11px;color:var(--text-dim,#8aa0b8)}.mh-stat b{font-size:18px;font-weight:800;display:flex;align-items:center;gap:4px}' +
    '.mh-tabs{position:sticky;top:var(--hdr-h,0px);z-index:5;background:var(--bg,#070b16);padding:10px 0;margin-top:10px;border-bottom:1px solid rgba(255,255,255,.08)}' +
    '.mh-tabs>div{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;background:var(--bg-card,#0a1020);border-radius:12px;padding:4px}' +
    '.mh-tabs button{height:40px;border-radius:9px;border:0;background:transparent;color:#b6c2d1;font-weight:600;font-size:13px;font-family:inherit;cursor:pointer}' +
    '.mh-tabs button[aria-pressed="true"]{background:var(--accent,#22d3ee);color:#070b16;font-weight:700}' +
    '.mh-sec{padding:16px 0 4px;display:flex;flex-direction:column;gap:12px}' +
    '.mh-sec h2{margin:0;font-size:17px;font-weight:700;color:var(--text,#e6edf6)}' +
    '.mh-hrow{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.mh-hrow span{font-size:12px;color:var(--text-dim,#8aa0b8)}' +
    '.mh-bar{height:8px;border-radius:4px;background:#111a2e;overflow:hidden}.mh-bar i{display:block;height:8px;background:#3ddc84;border-radius:4px;transition:width .3s}' +
    '.mh-list{background:var(--bg-card,#0a1020);border:1px solid rgba(255,255,255,.08);border-radius:14px;display:flex;flex-direction:column}' +
    '.mh-li{min-height:48px;padding:8px 14px;display:flex;align-items:center;gap:12px;color:var(--text,#e6edf6);text-decoration:none;border-bottom:1px solid rgba(255,255,255,.06)}.mh-li:last-child{border-bottom:0}' +
    '.mh-dot{width:24px;height:24px;flex:0 0 24px;border-radius:50%;border:2px solid rgba(255,255,255,.22);box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800}' +
    '.mh-li.done .mh-dot{background:#3ddc84;border-color:#3ddc84;color:#070b16}.mh-li.done .mh-lt{color:var(--text-dim,#8aa0b8);text-decoration:line-through;font-weight:400}' +
    '.mh-lt{font-size:14px;font-weight:600;display:block}.mh-ls{font-size:11px;color:var(--text-dim,#8aa0b8)}' +
    '.mh-note{margin:0;font-size:12px;color:var(--text-dim,#8aa0b8)}' +
    '.mh-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}' +
    '@media(min-width:900px){.mh-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
    '.mh-card{background:var(--bg-card,#0a1020);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:12px;scroll-margin-top:90px}' +
    '.mh-lab{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--accent,#22d3ee);display:flex;align-items:center;justify-content:space-between;gap:8px;text-transform:uppercase}' +
    '.mh-lab>span:first-child{display:flex;align-items:center;gap:6px}.mh-lab small{font-size:11px;font-weight:400;letter-spacing:0;color:var(--text-dim,#8aa0b8);text-transform:none}' +
    '.mh-gold .mh-lab{color:#f5b841}' +
    '.mh-card h3{margin:0;font-size:16px;font-weight:700;line-height:1.35;color:var(--text,#e6edf6)}' +
    '.mh-card p{margin:0;font-size:15px;line-height:1.45;color:var(--text,#e6edf6)}' +
    '.mh-sub{font-size:13px!important;color:#b6c2d1!important}.mh-src{font-size:11px;color:var(--text-dim,#8aa0b8)}' +
    '.mh-year{font-size:30px;font-weight:800;letter-spacing:-.02em;color:#f5b841;line-height:1}' +
    '.mh-opts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}' +
    '.mh-btn{min-height:44px;padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:#111a2e;color:var(--text,#e6edf6);font-weight:600;font-size:14px;font-family:inherit;cursor:pointer}' +
    '.mh-btn.on{border-color:var(--accent,#22d3ee);background:rgba(34,211,238,.16)}' +
    '.mh-btn.pri{background:var(--accent,#22d3ee);border-color:var(--accent,#22d3ee);color:#070b16;font-weight:700}' +
    '.mh-btn.ghost{background:none;align-self:flex-start}' +
    '.mh-btn:disabled{cursor:default}' +
    '.mh-res{border-top:1px solid rgba(255,255,255,.08);padding-top:10px;display:flex;flex-direction:column;gap:6px;font-size:13px}' +
    '.mh-rb{display:flex;flex-direction:column;gap:3px}.mh-rb div{display:flex;justify-content:space-between}.mh-rb i{display:block;height:6px;border-radius:3px;background:var(--accent,#22d3ee)}.mh-rb s{display:block;height:6px;border-radius:3px;background:#1a2540;text-decoration:none}' +
    '.mh-ok{font-size:14px;font-weight:700;color:#3ddc84}.mh-no{font-size:14px;font-weight:700;color:#ff7a7f}' +
    '.mh-clue{display:flex;gap:10px;align-items:flex-start;background:#111a2e;border-radius:10px;padding:10px 12px;font-size:14px;line-height:1.4}' +
    '.mh-clue b{font-size:11px;font-weight:800;color:#070b16;background:var(--accent,#22d3ee);border-radius:6px;padding:2px 6px;white-space:nowrap}' +
    '.mh-row{display:flex;gap:8px}.mh-in{flex:1;min-width:0;height:44px;box-sizing:border-box;padding:0 12px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:#111a2e;color:var(--text,#e6edf6);font-weight:400;font-size:16px;font-family:inherit}' +
    '.mh-lbl{font-size:12px;color:var(--text-dim,#8aa0b8)}' +
    '.mh-alert{background:var(--bg-card,#0a1020);border:1px solid rgba(34,211,238,.35);border-radius:14px;padding:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;color:var(--accent,#22d3ee)}' +
    '.mh-alert span{flex:1 1 160px;font-size:13px;line-height:1.4;color:var(--text,#e6edf6)}' +
    '.mh-next{background:var(--bg-card,#0a1020);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;color:var(--text,#e6edf6);text-decoration:none}' +
    '.mh-vs{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:15px;font-weight:700}.mh-vs img{width:28px;height:28px;object-fit:contain}' +
    '.mh-form{display:flex;gap:4px}.mh-form b{width:20px;height:20px;border-radius:50%;font-size:11px;display:flex;align-items:center;justify-content:center;background:#1a2540;color:#8aa0b8}' +
    '.mh-form b.W{background:rgba(61,220,132,.18);color:#3ddc84}.mh-form b.L{background:rgba(255,122,127,.16);color:#ff7a7f}' +
    '.mh-link{font-size:13px;font-weight:600;color:var(--accent,#22d3ee);text-decoration:none}' +
    '.mh-story{display:flex;flex-direction:column;gap:3px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);color:var(--text,#e6edf6);text-decoration:none}.mh-story:last-of-type{border-bottom:0}' +
    '.mh-story b{font-size:14px;font-weight:600;line-height:1.3}.mh-story span{font-size:11px;color:var(--text-dim,#8aa0b8)}' +
    '.mh-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;text-align:center}' +
    '.mh-week div{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;color:var(--text-dim,#8aa0b8)}' +
    '.mh-week i{width:30px;height:30px;border-radius:50%;box-sizing:border-box;border:2px dashed rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;font-style:normal;font-size:13px;font-weight:800}' +
    '.mh-week i.y{border:0;background:rgba(61,220,132,.16);color:#3ddc84}.mh-week i.t{border:2px solid var(--accent,#22d3ee)}' +
    '.mh-g4{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}' +
    '.mh-g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.mh-g3>div{background:#111a2e;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:2px}.mh-g3 span{font-size:11px;color:var(--text-dim,#8aa0b8)}.mh-g3 b{font-size:17px;font-weight:800}' +
    '.mh-links{display:flex;flex-wrap:wrap;gap:8px}.mh-links a{min-height:40px;padding:0 12px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:#111a2e;color:var(--text,#e6edf6);font-size:13px;font-weight:600;display:inline-flex;align-items:center;text-decoration:none}.mh-links a.pri{background:var(--accent,#22d3ee);border-color:var(--accent,#22d3ee);color:#070b16}' +
    '.mh-alldone{display:flex;align-items:center;gap:10px;background:var(--bg-card,#0a1020);border:1px solid rgba(61,220,132,.35);border-radius:14px;padding:12px 14px;font-size:14px}.mh-alldone b{color:#3ddc84}' +
    '.mh-box{background:var(--bg-card,#0a1020);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:12px}';

  var state = { tab: 'today', poll: null, today: null };
  var page, hub, todayEl, progEl, teamsEl;

  function streakNow() {
    var v = LS.get('nmw_streak');
    try { var o = JSON.parse(v); if (typeof o === 'number') return o; if (o && typeof o === 'object') return o.count || o.current || o.streak || o.days || 0; } catch (e) {}
    return parseInt(v, 10) || 0;
  }
  function trophies() {
    var pc = $('me-pill-content'); var m = pc && /(\d+)\s*\/\s*(\d+)\s*earned/i.exec(pc.textContent || '');
    if (m) return m[1] + ' / ' + m[2];
    var t = J('nmw_trophies', []); return String(Array.isArray(t) ? t.length : Object.keys(t || {}).length);
  }
  function greet() { var h = +new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: 'numeric', hour12: false }).format(new Date()); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }

  // ME_ONBOARD: Follow your club opens the site's onboarding (club + country picker)
  function onboard() {
    var o = window.NMWOnboarding || window.nmwOnboarding || {};
    var fn = window.nmwOpenOnboarding || window.openOnboarding || window.showOnboarding || window.startOnboarding || o.open || o.show || o.start;
    if (typeof fn === 'function') { try { fn.call(o); return; } catch (e) {} }
    location.href = '/?ob=reset';   // ME_OB4: fallback - the homepage opens the picker straight away
  }
  function obResume() {
    var flag = null; try { flag = sessionStorage.getItem('nmw_mh_ob'); sessionStorage.removeItem('nmw_mh_ob'); } catch (e) {}
    if (!flag) return;
    var n = 0;
    (function tick() {
      if (document.getElementById('mw-ob-backdrop')) return tidy();
      var go = document.querySelector('#mw-ob-nudge-sheet .mw-nd-go, .mw-nd .mw-nd-go');
      if (go) { go.click(); return setTimeout(tidy, 500); }
      if (n++ < 60) setTimeout(tick, 200); else tidy();
    })();
    function tidy() { try { if (location.search.indexOf('ob=reset') >= 0) history.replaceState(null, '', location.pathname); } catch (e) {} }
  }

  function buildHub() {
    hub = document.createElement('div'); hub.id = 'mh'; hub.setAttribute('data-mh-t', 'all');
    var tabs = [['today', 'Today'], ['teams', 'Teams'], ['progress', 'Progress'], ['settings', 'Settings']];
    hub.innerHTML =
      '<div class="mh-top"><div class="mh-av" id="mh-av"></div><div style="flex:1;min-width:0"><div class="mh-hi">' + greet() + '</div><p class="mh-h1">Your 90minWaffle</p></div></div>' +
      '<div class="mh-chips">' + (TEAM ? '<a class="mh-chip" id="mh-chip-team" href="/clubs/">' + esc(TEAM) + '</a>' : '') + (COUNTRY ? '<a class="mh-chip" href="/nations/">' + esc(COUNTRY) + '</a>' : '') +
      (TEAM || COUNTRY ? '<button type="button" class="mh-chip" data-go="settings">+ Change teams</button>' : '<button type="button" class="mh-chip" data-ob="1">+ Follow your club</button>') + '</div>' +
      '<div class="mh-stats"><div class="mh-stat"><span>Streak</span><b id="mh-s-streak"></b></div><div class="mh-stat"><span>Trophies</span><b id="mh-s-troph"></b></div><div class="mh-stat"><span>Predictions</span><b id="mh-s-pred"></b></div></div>' +
      '<nav class="mh-tabs" aria-label="Me sections"><div>' + tabs.map(function (t) { return '<button type="button" data-tab="' + t[0] + '" aria-pressed="false">' + t[1] + '</button>'; }).join('') + '</div></nav>';
    hub.addEventListener('click', function (e) {
      if (e.target.closest('[data-ob]')) return onboard();
      var b = e.target.closest('[data-tab],[data-go]'); if (!b) return;
      setTab(b.getAttribute('data-tab') || b.getAttribute('data-go'), !!b.getAttribute('data-go'));
    });

    todayEl = document.createElement('div'); todayEl.id = 'mh-today'; todayEl.setAttribute('data-mh-t', 'today');
    todayEl.innerHTML =
      '<section class="mh-sec"><div class="mh-hrow"><h2>Today for you</h2><span id="mh-done"></span></div><div class="mh-bar"><i id="mh-barfill" style="width:0"></i></div><div class="mh-list" id="mh-list"></div><p class="mh-note" id="mh-note"></p></section>' +
      '<div id="mh-alertwrap"></div>' +
      '<section class="mh-sec" id="mh-nextsec"><h2>Next for your teams</h2><div id="mh-next" style="display:flex;flex-direction:column;gap:10px"></div></section>' +
      '<section class="mh-sec"><h2>Today\'s cards</h2><div class="mh-grid" id="mh-cards"></div></section>';

    teamsEl = document.createElement('div'); teamsEl.id = 'mh-teams'; teamsEl.setAttribute('data-mh-t', 'teams');   // ME_TEAMS2
    teamsEl.innerHTML = '<section class="mh-sec"><h2>Your club</h2><div id="mh-tm-club"><div class="mh-box"><span class="mh-lbl">Loading your club...</span></div></div></section>' +
      '<section class="mh-sec" id="mh-tm-natsec"><h2>Your country</h2><div id="mh-tm-nat"></div></section>';
    teamsEl.addEventListener('click', function (e) { if (e.target.closest('[data-ob]')) onboard(); });
    progEl = document.createElement('div'); progEl.id = 'mh-progress'; progEl.setAttribute('data-mh-t', 'progress');
    progEl.innerHTML = '<section class="mh-sec"><h2>This week</h2><div class="mh-box"><div class="mh-week" id="mh-week"></div><span class="mh-note" id="mh-streaktxt"></span></div>' +
      '<div class="mh-g4"><div class="mh-stat"><span>Trivia right</span><b id="mh-st-tr"></b></div><div class="mh-stat"><span>Players guessed</span><b id="mh-st-gp"></b></div></div></section>';
  }

  function setTab(t, scroll) {
    state.tab = t; if (page) page.setAttribute('data-mh-tab', t);
    try { sessionStorage.setItem('nmw_mh_tab', t); } catch (e) {}
    [].forEach.call(hub.querySelectorAll('[data-tab]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-tab') === t ? 'true' : 'false'); });
    if (t === 'progress') renderProgress();
    if (scroll) { var tb = hub.querySelector('.mh-tabs'); if (tb) window.scrollTo({ top: Math.max(0, tb.getBoundingClientRect().top + window.scrollY - 70), behavior: 'smooth' }); }
  }

  function classify() {
    var cur = 'teams';
    [].forEach.call(page.children, function (c) {
      if (c === hub || c === todayEl || c === progEl || c === teamsEl) return;
      var id = c.id || '', cl = (typeof c.className === 'string' ? c.className : '') || '';
      var t = (c.textContent || '').trim().slice(0, 60).toUpperCase(), tab;
      if (/profile-hero/.test(cl)) tab = 'settings';
      else if (id === 'me-settings-zone' || /^SETTINGS/.test(t)) tab = 'settings';
      else if (id === 'me-poll-card' || (c.querySelector && c.querySelector('#me-poll-card,#me-guess-community'))) tab = 'hide';
      else if (/sec-hdr/.test(cl)) { cur = /PREDICT|TROPH|LEADER|BADGE|STAT/.test(t) ? 'progress' : /TEAM|CLUB|NATION|COUNTRY/.test(t) ? 'teams' : cur; tab = cur; }
      else if (id === 'me-pill-content' || /hs-wrap|me-pills/i.test(cl) || id === 'mePills') tab = 'progress';
      else tab = cur;
      if (tab === 'teams') tab = 'hide';   // ME_TEAMS2: the hub's Teams panel replaces the old team blocks
      if (c.getAttribute('data-mh-t') !== tab) c.setAttribute('data-mh-t', tab);
    });
  }

  function ensure() {
    if (!page || !page.isConnected) { page = $('page'); if (!page) return; observe(); }
    if (page.firstElementChild !== hub) page.insertBefore(hub, page.firstChild);
    if (hub.nextElementSibling !== todayEl) page.insertBefore(todayEl, hub.nextSibling);
    if (todayEl.nextElementSibling !== teamsEl) page.insertBefore(teamsEl, todayEl.nextSibling);
    classify();
    var firstProg = page.querySelector(':scope>[data-mh-t="progress"]:not(#mh-progress)');
    if (firstProg && progEl.nextElementSibling !== firstProg) page.insertBefore(progEl, firstProg);
    else if (!firstProg && !progEl.isConnected) page.appendChild(progEl);
    if (page.getAttribute('data-mh-tab') !== state.tab) page.setAttribute('data-mh-tab', state.tab);
    renderHead();
  }
  var mo, pend;
  function observe() {
    if (mo) mo.disconnect();
    mo = new MutationObserver(function () { ensure(); });   // ME_NOFLICKER_20261024: re-tag before paint
    mo.observe(page, { childList: true });
  }

  function renderHead() {
    var s = streakNow(); $('mh-s-streak').innerHTML = ICON.flame + s + (s === 1 ? ' day' : ' days');
    $('mh-s-troph').textContent = trophies();
    $('mh-s-pred').textContent = String(J('nmw_pred_log', []).length);
    var av = $('mh-av');
    if (av && !av.firstChild) {
      var img = document.querySelector('.profile-hero img');
      if (img && img.src) av.innerHTML = '<img alt="" src="' + esc(img.src) + '">';
    }
  }

  var CHECKS = [];
  function addCheck(id, label, sub, isDone) { CHECKS.push({ id: id, label: label, sub: sub, isDone: isDone }); }
  function renderList() {   // ME_CLEAR: finished tasks drop off; all done -> one line
    var done = 0, html = '';
    CHECKS.forEach(function (c) {
      if (c.isDone()) { done++; return; }
      html += '<a class="mh-li" href="#mh-c-' + c.id + '"><span class="mh-dot" aria-hidden="true"></span><span style="flex:1"><span class="mh-lt">' + esc(c.label) + '</span><span class="mh-ls">' + esc(c.sub) + '</span></span><span aria-hidden="true" style="color:#8aa0b8">&rsaquo;</span></a>';
    });
    var all = CHECKS.length > 0 && done === CHECKS.length, list = $('mh-list'), bar = $('mh-barfill');
    list.innerHTML = all ? '<div class="mh-alldone"><span class="mh-dot" aria-hidden="true" style="background:#3ddc84;border-color:#3ddc84;color:#070b16">&#10003;</span><span><b>All done for today.</b> New cards land after midnight.</span></div>' : html;
    list.className = all ? '' : 'mh-list';
    $('mh-done').textContent = CHECKS.length && !all ? done + ' of ' + CHECKS.length + ' done' : '';
    if (bar) { bar.style.width = CHECKS.length ? (100 * done / CHECKS.length) + '%' : '0'; bar.parentNode.hidden = all; }
    var s = streakNow(), note = $('mh-note');
    note.hidden = all;
    note.textContent = s > 1 ? 'Come back tomorrow to keep your ' + s + '-day streak going.' : 'New cards every day. Come back tomorrow to start a streak.';
  }

  function card(id, cls, html) {
    var a = document.createElement('article'); a.className = 'mh-card' + (cls ? ' ' + cls : ''); a.id = 'mh-c-' + id; a.innerHTML = html;
    $('mh-cards').appendChild(a); return a;
  }
  function label(icon, text, small) { return '<div class="mh-lab"><span>' + icon + esc(text) + '</span>' + (small ? '<small>' + esc(small) + '</small>' : '') + '</div>'; }

  function pollKeyA() { return 'nmw_poll_vote_daily-' + TODAY; }
  function pollVoted(p) { var v = LS.get('nmw_mh_poll_' + p.id); if (v) return v; if (!/^daily-/.test(String(p.id))) return ''; v = LS.get(pollKeyA()); return (v !== null && v !== undefined && /^\d+$/.test(String(v))) ? ((p.options || [])[+v] || '') : (v || ''); }  /* VOTE_SYNC_20261025 */
  function renderPollRes(p, res, mine) {
    var opts = p.options || [], pct = {};
    var arr = res && (res.top_answers || res.results || res.answers);
    if (Array.isArray(arr)) arr.forEach(function (x) { var k = x.answer || x.option || x.label; var v = x.pct != null ? x.pct : x.percent; if (k != null && v != null) pct[String(k).toLowerCase()] = Math.round(v); });   // ME_POLLRESULT_20261025: server stores answers in lower case
    else if (res && Array.isArray(res.votes)) { var tot = res.votes.reduce(function (a, b) { return a + (+b || 0); }, 0); if (tot) opts.forEach(function (o, i) { pct[String(o).toLowerCase()] = Math.round(100 * (+res.votes[i] || 0) / tot); }); }
    var bars = opts.map(function (o) { var v = pct[String(o).toLowerCase()] || 0; return '<div class="mh-rb"><div><span>' + esc(o) + (o === mine ? ' (you)' : '') + '</span><b>' + v + '%</b></div><s><i style="width:' + v + '%"></i></s></div>'; }).join('');
    return '<span>You picked <b>' + esc(mine) + '</b></span>' + (Object.keys(pct).length ? bars + (res && res.total_votes ? '<span class="mh-sub">' + res.total_votes + ' fan vote' + (res.total_votes === 1 ? '' : 's') + '</span>' : '') : '<span class="mh-sub">Fan results show once a few more votes are in.</span>');
  }
  function topPoll(p) {   // ME_CLUBPRED2_20261025: the top game of the day sits first, even when it arrives after the other cards
    pollCard(p); var r = document.getElementById('mh-poll-res'), c = r && r.closest('#mh-cards > *');
    if (c && c.parentNode && c.parentNode.firstChild !== c) c.parentNode.insertBefore(c, c.parentNode.firstChild);
  }
  function clubOrPoll(p) {   // ME_CLUBPRED_20261025: your club's game when they play in the next 24h, otherwise the top game of the day
    if (!TEAM) return pollCard(p);
    var t = core(TEAM), sh = function (n) { return String(n || '').replace(/\s+A?FC$/i, ''); };
    getJ('/data/fixtures.json').then(function (fx) {
      var now = Date.now();
      var g = (fx.live || []).concat(fx.upcoming || []).filter(function (x) { var k = Date.parse(x.kickoff_utc); return (core(x.home) === t || core(x.away) === t) && k - now < 864e5 && now - k < 3 * 36e5; })
        .sort(function (a, b) { return Date.parse(a.kickoff_utc) - Date.parse(b.kickoff_utc); })[0];
      if (!g || (p && core(p.home) === core(g.home) && core(p.away) === core(g.away))) return topPoll(p);
      function show() {
        var a = card('poll', '', label(ICON.bar, 'Your club', ukWhen(g.kickoff_utc)) + '<h3>' + esc(sh(g.home)) + ' v ' + esc(sh(g.away)) + '</h3><div id="mh-club-pred"></div>' +
          '<span class="mh-sub">Your pick counts towards your record and This week: you v the model.</span>');
        if (a && a.parentNode) a.parentNode.insertBefore(a, a.parentNode.firstChild);
        var ok = false; try { ok = window.NMWPredict && NMWPredict.render(a.querySelector('#mh-club-pred'), { home: g.home, away: g.away, kickoff_utc: g.kickoff_utc, league: g.league || '', fixture_id: g.id || '' }); } catch (e) {}
        if (!ok) { if (a) a.remove(); return topPoll(p); }
        var k = core(g.home).replace(/ /g, '-') + '-v-' + core(g.away).replace(/ /g, '-') + '-' + String(g.kickoff_utc).slice(0, 10);
        addCheck('poll', 'Predict: ' + sh(g.home) + ' v ' + sh(g.away), 'Your club', function () { return !!LS.get('nmw_pred_' + k); });
        renderList();
      }
      if (window.NMWPredict) return show();
      var sc = document.createElement('script'); sc.src = '/js/predict.js?v=2'; sc.onload = show; sc.onerror = function () { topPoll(p); }; document.head.appendChild(sc);
    }).catch(function () { topPoll(p); });
  }
  function pollCard(p) {
    if (!p || !p.question || !(p.options || []).length) return;
    var mine = pollVoted(p);
    var KO = p.kickoff_utc ? Date.parse(p.kickoff_utc) - 300000 : 0, shut = !!(KO && Date.now() >= KO);   // ME_VOTECLOSE_20261024
    var a = card('poll', '', label(ICON.bar, 'Fans v the model', p.kickoff_utc ? ukWhen(p.kickoff_utc) : '') +
      '<h3>' + esc(p.question) + '</h3><div class="mh-opts">' + p.options.map(function (o) { return '<button type="button" class="mh-btn' + (o === mine ? ' on' : '') + '" data-o="' + esc(o) + '"' + (mine || shut ? ' disabled' : '') + '>' + esc(o.replace(/\s+FC$/i, '')) + '</button>'; }).join('') + '</div>' +
      '<div class="mh-res" id="mh-poll-res"' + (mine || shut ? '' : ' hidden') + '></div><span class="mh-sub" id="mh-poll-model"></span>');
    var res = a.querySelector('#mh-poll-res');
    if (KO && Date.now() > KO + 300000 + 9e6) {   // ME_POLLRESULT_20261025: game over - show the result, not yesterday's question as if it were live
      var q = a.querySelector('h3'), hn = String(p.home || '').replace(/\s+FC$/i, ''), an = String(p.away || '').replace(/\s+FC$/i, '');
      if (q) q.textContent = hn + ' v ' + an + ': how the fans called it';
      var nxt = ukDate(new Date(p.kickoff_utc)) === TODAY ? 'tomorrow morning' : 'this morning';
      getJ('/data/fixtures.json').then(function (fx) {
        var g = (fx.results || []).concat(fx.live || []).filter(function (x) { return core(x.home) === core(p.home) && core(x.away) === core(p.away) && /FINISHED|^FT$|AET|PEN/i.test(String(x.status || '')) && x.home_score != null; })[0];
        var box = document.createElement('div'); box.className = 'mh-sub'; box.style.margin = '4px 0 8px';
        box.innerHTML = (g ? '<b>Full time: ' + esc(hn) + ' ' + g.home_score + '-' + g.away_score + ' ' + esc(an) + '</b> &middot; ' : '') + 'The next vote opens ' + nxt + '.';
        if (q) q.insertAdjacentElement('afterend', box);
      }).catch(function () {});
    }
    function closedRes(r) { var h = renderPollRes(p, r, mine || '').replace(/^<span>You picked <b><\/b><\/span>/, '<span><b>Voting closed</b> at kick-off</span>');   // ME_NOVOTES_20261024
      return (/%/.test(h) && !/[1-9]\d*%/.test(h)) ? (mine ? '<span>You picked <b>' + esc(mine) + '</b> · voting closed, no other fan votes were cast.</span>' : '<span><b>Voting closed</b> at kick-off · no fan votes were cast.</span>') : h; }
    if (mine || shut) getJ('/poll/results?id=' + encodeURIComponent(p.id)).then(function (r) { res.innerHTML = closedRes(r); }).catch(function () { res.innerHTML = closedRes(null); });
    if (KO && !shut && KO - Date.now() < 864e5) setTimeout(function () {
      [].forEach.call(a.querySelectorAll('[data-o]'), function (x) { x.disabled = true; });
      if (!pollVoted(p)) { res.hidden = false; getJ('/poll/results?id=' + encodeURIComponent(p.id)).then(function (r) { res.innerHTML = closedRes(r); }).catch(function () { res.innerHTML = closedRes(null); }); }
    }, KO - Date.now());
    a.addEventListener('click', function (e) {
      var b = e.target.closest('[data-o]'); if (!b || pollVoted(p) || (KO && Date.now() >= KO)) return;
      var o = b.getAttribute('data-o'); LS.set('nmw_mh_poll_' + p.id, o);
      [].forEach.call(a.querySelectorAll('[data-o]'), function (x) { x.disabled = true; x.classList.toggle('on', x === b); });
      res.hidden = false; res.innerHTML = '<span>Saving your vote...</span>';
      fetch('/poll/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ poll_id: p.id, answer: o, voter_id: UID }) })
        .then(function (r) { return r.json(); }).then(function (r) { if (r && /closed/i.test(String(r.error || ''))) { LS.set(pollKeyA(), ''); LS.set('nmw_mh_poll_' + p.id, ''); res.innerHTML = '<span><b>Voting closed</b> at kick-off, so this vote wasn\'t counted.</span>'; return; } res.innerHTML = renderPollRes(p, r, o); }).catch(function () { res.innerHTML = renderPollRes(p, null, o); });
      renderList();
    });
    if (!(shut && !mine)) addCheck('poll', 'Vote: ' + (p.home && p.away ? p.home.replace(/\s+FC$/i, '') + ' v ' + p.away.replace(/\s+FC$/i, '') : 'today\'s poll'), 'Fans v the model', function () { return pollVoted(p); });
    modelLine(p);
  }
  function modelLine(p) {
    getJ('/data/match_probs.json').then(function (d) {
      var hit = null, n = 0;
      (function walk(o, depth) {
        if (hit || !o || typeof o !== 'object' || depth > 4 || n++ > 20000) return;
        if (!Array.isArray(o) && ((p.fixture_id && (o.fixture_id === p.fixture_id || o.id === p.fixture_id)) || (o.home && o.away && core(o.home) === core(p.home) && core(o.away) === core(p.away)))) { hit = o; return; }
        for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) walk(o[k], depth + 1);
      })(d, 0);
      if (!hit) return;
      function val(keys) { for (var i = 0; i < keys.length; i++) { var v = hit[keys[i]]; if (typeof v === 'number') return v <= 1 ? Math.round(v * 100) : Math.round(v); } return null; }
      var h = val(['home_win', 'p_home', 'pH', 'home_pct', 'prob_home', 'H']), dr = val(['draw', 'p_draw', 'pD', 'draw_pct', 'prob_draw', 'D']), aw = val(['away_win', 'p_away', 'pA', 'away_pct', 'prob_away', 'A']);
      if (h == null || aw == null) return;
      var el = $('mh-poll-model'); if (el) el.textContent = 'The model: ' + p.home.replace(/\s+FC$/i, '') + ' ' + h + '%' + (dr != null ? ' · Draw ' + dr + '%' : '') + ' · ' + p.away.replace(/\s+FC$/i, '') + ' ' + aw + '%. Vote first, then compare.';
    }).catch(function () {});
  }

  // ME_TRIV2: type an answer, auto-check where possible, else reveal + self-mark
  function triviaCard(t) {
    if (!t || !t.q) return;
    var CD = (state.today && state.today.date) || TODAY, key = 'nmw_mh_triv_' + CD, tries = 0; /* ME_ANSWERS_20261025 */ (function () { var k = LS.get(key + '_k'); if ((k && k !== t.key) || (!k && LS.get(key) != null && CD === '2026-10-25')) { try { localStorage.removeItem(key); } catch (e) {} } })();
    var accept = (t.accept || []).map(norm).filter(Boolean);
    function right(v) { v = norm(v); if (!v) return false; return accept.some(function (x) { if (v === x) return true; if (x.indexOf(' ') > 0) return v.indexOf(x) >= 0; return x.length >= 4 && v.split(' ').pop() === x; }); }
    var a = card('triv', '', label(ICON.q, 'Trivia of the day', 'New every day') + '<h3>' + esc(t.q) + '</h3><div id="mh-tr-play"></div><div id="mh-tr-end"></div>');
    function save(v) { if (LS.get(key) != null) return; LS.set(key, v); LS.set(key + '_k', t.key || ''); STATS.tt++; if (v === '1') STATS.tr++; saveStats(); renderList(); }
    function draw(msg) {
      var g = LS.get(key), play = a.querySelector('#mh-tr-play'), end = a.querySelector('#mh-tr-end');
      if (g == null) {
        play.innerHTML = '<label class="mh-lbl" for="mh-tr-in">Your answer</label><div class="mh-row" style="margin-top:6px"><input class="mh-in" id="mh-tr-in" autocomplete="off" enterkeyhint="go" placeholder="Type your answer"><button type="button" class="mh-btn pri" id="mh-tr-go">Check</button></div>' +
          '<div class="mh-sub" id="mh-tr-msg" aria-live="polite" style="margin-top:6px;font-size:13px">' + esc(msg || '') + '</div><button type="button" class="mh-btn ghost" id="mh-tr-give" style="margin-top:8px">Show me the answer</button>';
        end.innerHTML = '';
      } else {
        play.innerHTML = '';
        end.innerHTML = '<div class="mh-res"><span class="' + (g === '1' ? 'mh-ok' : 'mh-no') + '">' + (g === '1' ? 'Correct' : 'Not this time') + '</span><p>' + esc(t.a) + '</p>' +
          (g === '0' && accept.length ? '<button type="button" class="mh-btn ghost" id="mh-tr-fix">I had it right, count it</button>' : '') + '</div>';
      }
    }
    function selfMark(v) {
      a.querySelector('#mh-tr-play').innerHTML = '<div class="mh-res"><span class="mh-lbl">You said: ' + esc(v) + '</span><p>' + esc(t.a) + '</p><span class="mh-lbl">Did you get it?</span><div class="mh-row"><button type="button" class="mh-btn" data-tr="1">I got it</button><button type="button" class="mh-btn" data-tr="0">Not this time</button></div></div>';
    }
    function check() {
      var inp = $('mh-tr-in'); if (!inp || !inp.value.trim()) return;
      if (!accept.length) return selfMark(inp.value);
      if (right(inp.value)) { save('1'); return draw(); }
      tries++;
      if (tries < 2) { draw('Not quite. One more go.'); var i2 = $('mh-tr-in'); if (i2) i2.focus(); return; }
      save('0'); draw();
    }
    a.addEventListener('click', function (e) {
      if (e.target.id === 'mh-tr-go') check();
      else if (e.target.id === 'mh-tr-give') { save('0'); draw(); }
      else if (e.target.id === 'mh-tr-fix') { LS.set(key, '1'); STATS.tr++; saveStats(); draw(); renderList(); }
      else { var b = e.target.closest('[data-tr]'); if (b) { save(b.getAttribute('data-tr')); draw(); } }
    });
    a.addEventListener('keydown', function (e) { if (e.target.id === 'mh-tr-in' && e.key === 'Enter') { e.preventDefault(); check(); } });
    draw();
    addCheck('triv', 'Answer today\'s trivia', '1 question', function () { return LS.get(key) != null; });
  }

  function gtpCard(g) {
    if (!g || !(g.clues || []).length) return;
    var CD = (state.today && state.today.date) || TODAY, key = 'nmw_mh_gtp_' + CD, st = J(key, { n: 1, done: false, right: false }); /* ME_ANSWERS_20261025 */ if ((st.k && st.k !== g.key) || (!st.k && st.done && CD === '2026-10-25')) st = { n: 1, done: false, right: false }; st.k = g.key;
    var accept = (g.accept || [g.answer || '']).map(norm).filter(Boolean);
    function ok(v) { v = norm(v); if (!v) return false; return accept.some(function (x) { return v === x || (v.length >= 4 && (x.split(' ').pop() === v || x.indexOf(v) >= 0 && v.length >= x.length - 2)); }); }
    var a = card('gtp', '', label(ICON.p, 'Guess the player', 'Fewer clues, more points') + '<div id="mh-g-clues" style="display:flex;flex-direction:column;gap:8px"></div><div id="mh-g-play"></div><div id="mh-g-end"></div>');
    function draw() {
      var shown = st.done ? g.clues.length : st.n;
      a.querySelector('#mh-g-clues').innerHTML = g.clues.slice(0, shown).map(function (c, i) { return '<div class="mh-clue"><b>Clue ' + (i + 1) + '</b><span>' + esc(c) + '</span></div>'; }).join('');
      a.querySelector('#mh-g-play').innerHTML = st.done ? '' :
        '<label class="mh-lbl" for="mh-g-in">Your guess</label><div class="mh-row" style="margin-top:6px"><input class="mh-in" id="mh-g-in" autocomplete="off" enterkeyhint="go" placeholder="Type a player"><button type="button" class="mh-btn pri" id="mh-g-go">Guess</button></div>' +
        '<div id="mh-g-msg" class="mh-sub" style="margin-top:6px;font-size:13px" aria-live="polite"></div>' +
        (st.n < g.clues.length ? '<button type="button" class="mh-btn ghost" id="mh-g-next" style="margin-top:8px">Show next clue</button>' : '');
      a.querySelector('#mh-g-end').innerHTML = !st.done ? '' : '<div class="mh-res"><span class="' + (st.right ? 'mh-ok' : 'mh-no') + '">' + (st.right ? 'Got it on clue ' + st.n : 'Out of clues') + '</span><p>' + esc(g.answer) + '</p><span class="mh-sub" id="mh-g-comm"></span></div>';
      if (st.done) community();
    }
    function finish(right) {
      st.done = true; st.right = right; LS.set(key, JSON.stringify(st)); STATS.gt++; if (right) STATS.gr++; saveStats();
      var result = right ? 'clue' + st.n : 'miss';
      fetch('/community/guess/' + encodeURIComponent(g.key), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ result: result, voter_id: UID }) }).catch(function () {}).then(function () { draw(); });
      draw(); renderList();
    }
    function community() {
      getJ('/community/guess/' + encodeURIComponent(g.key)).then(function (r) {
        var c = r && (r.counts || r.results || r); if (!c || typeof c !== 'object') return;
        var k = ['clue1', 'clue2', 'clue3', 'miss'], tot = k.reduce(function (s, x) { return s + (+c[x] || 0); }, 0); if (tot < 3) return;
        var el = $('mh-g-comm'); if (el) el.textContent = Math.round(100 * (+c.clue1 || 0) / tot) + '% of fans got it on clue 1 · ' + Math.round(100 * (tot - (+c.miss || 0)) / tot) + '% got it in the end';
      }).catch(function () {});
    }
    function go() {
      var inp = $('mh-g-in'); if (!inp || !inp.value.trim()) return;
      if (ok(inp.value)) return finish(true);
      if (st.n >= g.clues.length) return finish(false);
      st.n++; LS.set(key, JSON.stringify(st)); draw(); var m = $('mh-g-msg'); if (m) m.textContent = 'Not quite. Here is another clue.'; var i2 = $('mh-g-in'); if (i2) i2.focus();
    }
    a.addEventListener('click', function (e) {
      if (e.target.id === 'mh-g-go') go();
      if (e.target.id === 'mh-g-next') { st.n = Math.min(g.clues.length, st.n + 1); LS.set(key, JSON.stringify(st)); draw(); }
    });
    a.addEventListener('keydown', function (e) { if (e.target.id === 'mh-g-in' && e.key === 'Enter') { e.preventDefault(); go(); } });
    draw();
    addCheck('gtp', 'Guess the player', 'Up to ' + g.clues.length + ' clues', function () { return J(key, {}).done; });
  }

  function otdCard(list, lab) {
    if (!list || !list.length) return;
    var i = 0, a = card('otd', 'mh-gold', '');
    function draw() {
      var e = list[i], y = (/\b(18|19|20)\d{2}\b/.exec(e.event || '') || [''])[0];
      a.innerHTML = label(ICON.cal, lab || 'On this day', '') + (y ? '<span class="mh-year">' + y + '</span>' : '') + '<p>' + esc(e.event) + '</p>' +
        '<div class="mh-hrow"><span class="mh-src">From the 90minWaffle archive</span>' + (list.length > 1 ? '<button type="button" class="mh-btn ghost" id="mh-otd-more">More from this day</button>' : '') + '</div>';
    }
    a.addEventListener('click', function (e) { if (e.target.id === 'mh-otd-more') { i = (i + 1) % list.length; draw(); } });
    draw();
  }

  function dykCard(list) {
    if (!list || !list.length) return;
    var words = [TEAM, COUNTRY].map(core).filter(function (w) { return w.length > 2; });
    var mine = list.filter(function (d) { var t = norm(d.fact); return words.some(function (w) { return t.indexOf(w) >= 0; }); });
    var pool = mine.concat(list.filter(function (d) { return mine.indexOf(d) < 0; }));
    var i = 0, a = card('dyk', 'mh-gold', '');
    function draw() {
      a.innerHTML = label(ICON.bulb, 'Did you know?', (i + 1) + ' of ' + pool.length) + '<p>' + esc(pool[i].fact) + '</p>' +
        '<div class="mh-hrow"><span class="mh-src">From the 90minWaffle archive</span><button type="button" class="mh-btn ghost" id="mh-dyk-more">Another fact</button></div>';
    }
    a.addEventListener('click', function (e) { if (e.target.id === 'mh-dyk-more') { i = (i + 1) % pool.length; draw(); var b = $('mh-dyk-more'); if (b) b.focus(); } });
    draw();
  }

  function quoteCard(q) {
    if (!q || !q.quote) return;
    card('quote', 'mh-gold', label(ICON.quote, 'Monday motivation', '') + '<p style="font-size:17px;font-style:italic">' + esc(q.quote) + '</p><span class="mh-sub">' + esc(q.author || '') + '</span>');
  }

  function storiesCard() {
    var words = [TEAM, COUNTRY].map(core).filter(function (w) { return w.length > 2; });
    if (!words.length) return;
    getJ('/data/content_lite.json').then(function (cl) {
      var items = Array.isArray(cl) ? cl : (cl.stories || cl.items || []);
      var hits = items.filter(function (it) { var t = norm(unesc(it.title || it.hook || '')); return words.some(function (w) { return new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(t); }); }).slice(0, 4);
      if (!hits.length) return;
      var html = label(ICON.news, 'Picked for you', '') + hits.map(function (it) {
        var href = it.url || it.link || it.permalink || (it.slug ? '/story/' + it.slug + '/' : '/news/for-you/');
        return '<a class="mh-story" href="' + esc(href) + '"><b>' + esc(unesc(it.title || it.hook)) + '</b><span>' + esc(it.source || it.source_name || '') + '</span></a>';
      }).join('') + '<a class="mh-link" href="/news/for-you/">All your news &rsaquo;</a>';
      card('news', '', html);
    }).catch(function () {});
  }

  function clubSlug() {
    var want = core(TEAM);
    return getJ('/data/clubs/index.json').then(function (idx) {
      var best = null;
      (function walk(o, d) {
        if (!o || typeof o !== 'object' || d > 3) return;
        if (Array.isArray(o)) { o.forEach(function (x) { if (x && x.slug && (core(x.name) === want || core(x.short_name) === want)) { if (!best || (x.position != null && best.position == null) || (x.standing && !best.standing)) best = x; } else walk(x, d + 1); }); return; }
        for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) walk(o[k], d + 1);
      })(idx, 0);
      return best ? best.slug : slug(TEAM) + '-fc';
    }).catch(function () { return slug(TEAM) + '-fc'; });
  }
  function ord(n) { var v = n % 100; return n + (['th', 'st', 'nd', 'rd'][(v > 10 && v < 14) ? 0 : (n % 10 < 4 ? n % 10 : 0)]); }
  function formRow(f) { return f.length ? '<div style="display:flex;align-items:center;gap:8px"><span class="mh-lbl">Form</span><span class="mh-form" role="img" aria-label="Last ' + f.length + ' results, oldest first: ' + f.join(', ') + '">' + f.map(function (r) { return '<b class="' + esc(r) + '">' + esc(r) + '</b>'; }).join('') + '</span></div>' : ''; }
  function tmClub(c, s) {
    var st = c.standing || {}, nf = c.next_fixture, form = (c.form && c.form.last5) || [];
    $('mh-tm-club').innerHTML = '<div class="mh-box">' +
      '<div class="mh-top"><div class="mh-av" style="width:44px;height:44px;flex-basis:44px">' + (c.badge_url ? '<img alt="" src="' + esc(c.badge_url) + '">' : '') + '</div><div style="flex:1;min-width:0"><b style="font-size:17px">' + esc(c.name || TEAM) + '</b><div class="mh-lbl">' + esc(c.league_name || '') + '</div></div></div>' +
      '<div class="mh-g3"><div><span>Position</span><b>' + (st.position ? ord(st.position) : '-') + '</b></div><div><span>Points</span><b>' + (st.points != null ? st.points : '-') + '</b></div><div><span>Played</span><b>' + (st.played != null ? st.played : '-') + '</b></div></div>' +
      formRow(form) +
      (nf && nf.home ? '<div><span class="mh-lbl">Next match</span><div class="mh-vs" style="margin-top:4px"><span>' + esc(nf.home.replace(/\s+A?FC$/i, '')) + '</span><span class="mh-lbl">' + esc(ukWhen(nf.kickoff_utc)) + '</span><span style="text-align:right">' + esc(nf.away.replace(/\s+A?FC$/i, '')) + '</span></div></div>' : '') +
      '<div class="mh-links"><a class="pri" href="/clubs/' + s + '/">Club page</a><a id="mh-tm-prev" href="/preview/" hidden>Match preview</a><a href="/news/for-you/">Your news</a><a href="/news/injuries/">Injuries</a></div></div>';
  }
  function tmNat(t) {
    var f = Array.isArray(t.form) ? t.form : (typeof t.form === 'string' ? t.form.replace(/[^WDL]/g, '').split('') : ((t.form && t.form.last5) || []));
    var flag = t.flag || t.flag_url || t.crest || t.badge_url || '', n = t.next;
    $('mh-tm-nat').innerHTML = '<div class="mh-box">' +
      '<div class="mh-top">' + (flag ? '<div class="mh-av" style="width:44px;height:44px;flex-basis:44px;border-radius:10px"><img alt="" src="' + esc(flag) + '"></div>' : '') + '<div style="flex:1;min-width:0"><b style="font-size:17px">' + esc(t.name || COUNTRY) + '</b><div class="mh-lbl">' + esc((n && (n.competition || n.league)) || '') + '</div></div></div>' +
      formRow(f.slice(-5)) +
      (n && n.home ? '<div><span class="mh-lbl">Next match</span><div class="mh-vs" style="margin-top:4px"><span>' + esc(n.home) + '</span><span class="mh-lbl">' + esc(ukWhen(n.kickoff_utc)) + '</span><span style="text-align:right">' + esc(n.away) + '</span></div></div>' : '') +
      '<div class="mh-links"><a class="pri" href="/nations/' + slug(t.name || COUNTRY) + '/">Nation page</a></div></div>';
  }
  function withPredict(cb) {   // ME_PRED: shared prediction strip (js/predict.js)
    if (window.NMWPredict) return cb(window.NMWPredict);
    if (!document.getElementById('np-js')) { var sc = document.createElement('script'); sc.id = 'np-js'; sc.src = '/js/predict.js?v=2'; document.head.appendChild(sc); }
    document.addEventListener('nmw:predict-ready', function () { cb(window.NMWPredict); }, { once: true });
  }
  function nextTeams() {
    if (!TEAM) $('mh-tm-club').innerHTML = '<div class="mh-box"><span class="mh-sub">Follow your club to see its table position, form, next match and news here.</span><button type="button" class="mh-btn pri" data-ob="1" style="align-self:flex-start">Follow your club</button></div>';
    if (!COUNTRY) $('mh-tm-natsec').hidden = true;
    var box = $('mh-next');
    if (!TEAM && !COUNTRY) { box.innerHTML = '<p class="mh-note" style="font-size:13px">Pick your club and country to get their next games, news and facts here every day.</p><button type="button" class="mh-btn pri" data-ob="1" style="align-self:flex-start">Follow your club</button>'; box.onclick = function (e) { if (e.target.closest('[data-ob]')) onboard(); }; return; }
    if (TEAM) {
      clubSlug().then(function (s) {
        return getJ('/data/clubs/' + s + '.json').then(function (c) {
          var chip = $('mh-chip-team'); if (chip) chip.href = '/clubs/' + s + '/';
          var av = $('mh-av'); if (av && !av.firstChild && c.badge_url) av.innerHTML = '<img alt="" src="' + esc(c.badge_url) + '">';
          var nf = c.next_fixture, st = c.standing || {}, form = (c.form && c.form.last5) || [];
          var head = esc(c.name || TEAM) + (st.position ? ' · ' + st.position + (['th', 'st', 'nd', 'rd'][(st.position % 100 > 10 && st.position % 100 < 14) ? 0 : (st.position % 10 < 4 ? st.position % 10 : 0)]) + (c.league_name ? ' in the ' + esc(c.league_name) : '') + (st.points != null ? ' · ' + st.points + ' pts' : '') : '');
          var html = '<div class="mh-lab"><span>' + head + '</span></div>';
          if (form.length) html += '<div style="display:flex;align-items:center;gap:8px"><span class="mh-lbl">Form</span><span class="mh-form" role="img" aria-label="Last ' + form.length + ' results, oldest first: ' + form.join(', ') + '">' + form.map(function (r) { return '<b class="' + esc(r) + '">' + esc(r) + '</b>'; }).join('') + '</span></div>';
          if (nf && nf.home) {
            html += '<div class="mh-vs"><span>' + esc(nf.home.replace(/\s+A?FC$/i, '')) + '</span><span class="mh-lbl">' + esc(ukWhen(nf.kickoff_utc)) + '</span><span style="text-align:right">' + esc(nf.away.replace(/\s+A?FC$/i, '')) + '</span></div>';
            html += '<a class="mh-link" id="mh-prev" href="/clubs/' + s + '/">Club page &rsaquo;</a>';
          }
          tmClub(c, s);
          var el = document.createElement('div'); el.className = 'mh-next'; el.id = 'mh-c-next'; el.innerHTML = html; box.appendChild(el);
          if (nf && nf.home && nf.kickoff_utc) withPredict(function (P) {
            var f = { home: nf.home, away: nf.away, kickoff_utc: nf.kickoff_utc, league: c.league_code || '', fixture_id: nf.id || '' };
            var d1 = document.createElement('div');
            if (!P.render(d1, f)) return;
            el.appendChild(d1);
            var tb = $('mh-tm-club'), bx = tb && tb.querySelector('.mh-box'), lk = bx && bx.querySelector('.mh-links');
            if (bx) { var d2 = document.createElement('div'); if (P.render(d2, f)) bx.insertBefore(d2, lk); }
            CHECKS.unshift({ id: 'next', label: 'Predict ' + nf.home.replace(/\s+A?FC$/i, '') + ' v ' + nf.away.replace(/\s+A?FC$/i, ''), sub: 'Before kick-off · ' + ukWhen(nf.kickoff_utc), isDone: function () { return P.picked(f); } });
            renderList();
            document.addEventListener('nmw:predicted', function () { renderList(); });
          });
          if (nf && nf.home && nf.kickoff_utc) {
            var pu = '/preview/' + slug(nf.home) + '-vs-' + slug(nf.away) + '-' + nf.kickoff_utc.slice(0, 10) + '/';
            exists(pu).then(function (yes) {
              var tp = $('mh-tm-prev'); if (yes && tp) { tp.href = pu; tp.hidden = false; }
              var a = $('mh-prev'); if (!yes || !a) return;
              a.href = pu; a.innerHTML = 'Read the preview &rsaquo;';
              var pk = 'nmw_mh_prev_' + pu, pkOld = 'nmw_mh_prev_' + TODAY;  /* PREV_ONCE_20261030: read once = done for good */
              a.addEventListener('click', function () { LS.set(pk, '1'); });
              CHECKS.push({ id: 'next', label: 'Read the ' + nf.home.replace(/\s+A?FC$/i, '') + ' v ' + nf.away.replace(/\s+A?FC$/i, '') + ' preview', sub: ukWhen(nf.kickoff_utc), isDone: function () { var r = false; try { r = !!(LS.get(pk) || LS.get(pkOld) || localStorage.getItem(pk)); } catch (e) {} return r; } });
              renderList();
            });
          }
        });
      }).catch(function () {});
    }
    if (COUNTRY) {
      getJ('/data/nations_current.json').then(function (d) {
        var t = (d.teams || {})[slug(COUNTRY)] || null;
        if (!t) for (var k in (d.teams || {})) if (core(d.teams[k].name) === core(COUNTRY)) t = d.teams[k];
        if (t) tmNat(t);
        if (!t || !t.next) return;
        var n = t.next, el = document.createElement('a'); el.className = 'mh-next'; el.href = '/nations/' + slug(COUNTRY) + '/';
        el.innerHTML = '<div class="mh-lab"><span>' + esc(t.name || COUNTRY) + '</span><small>' + esc(n.competition || n.league || '') + '</small></div><div class="mh-vs"><span>' + esc(n.home) + '</span><span class="mh-lbl">' + esc(ukWhen(n.kickoff_utc)) + '</span><span style="text-align:right">' + esc(n.away) + '</span></div>';
        box.appendChild(el);
      }).catch(function () {});
    }
    setTimeout(function () { if (!box.children.length) $('mh-nextsec').hidden = true; }, 5000);
  }

  function alertsPrompt() {
    var w = $('mh-alertwrap');
    if (!('Notification' in window) || !('serviceWorker' in navigator) || Notification.permission !== 'default') return;
    var snooze = +(LS.get('nmw_mh_alert_snooze') || 0); if (Date.now() < snooze) return;
    w.innerHTML = '<div class="mh-alert">' + ICON.bell + '<span>' + (TEAM ? 'Get a nudge at ' + esc(TEAM) + ' kick-off and full time' : 'Get a nudge when the day\'s big games kick off') + '</span>' +
      '<button type="button" class="mh-btn pri" id="mh-al-on">Turn on</button><button type="button" class="mh-btn ghost" id="mh-al-no" style="align-self:center">Not now</button></div>';
    w.onclick = function (e) {
      if (e.target.id === 'mh-al-no') { LS.set('nmw_mh_alert_snooze', String(Date.now() + 7 * 864e5)); w.innerHTML = ''; return; }
      if (e.target.id !== 'mh-al-on') return;
      var fn = window.nmwPushSubscribe || window.subscribePush || window.pushSubscribe || (window.PushManagerNMW && window.PushManagerNMW.subscribe) || (window.NMWPush && window.NMWPush.subscribe);
      if (typeof fn === 'function') { try { fn(); } catch (x) {} w.innerHTML = ''; return; }
      var zone = $('me-settings-zone'), btn = zone && [].filter.call(zone.querySelectorAll('button,[role=switch],input[type=checkbox]'), function (b) { return /notif|alert|push/i.test((b.textContent || '') + ' ' + (b.id || '') + ' ' + (b.getAttribute('aria-label') || '') + ' ' + ((b.closest('label') || {}).textContent || '')); })[0];
      if (btn) { btn.click(); w.innerHTML = ''; return; }
      setTab('settings', true);
    };
  }

  function renderProgress() {
    var now = new Date(TODAY + 'T12:00:00Z'), dow = (now.getUTCDay() + 6) % 7, html = '';
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(function (d, i) {
      var day = new Date(now.getTime() + (i - dow) * 864e5).toISOString().slice(0, 10), seen = DAYS.indexOf(day) >= 0;
      html += '<div>' + d + '<i class="' + (seen ? 'y' : '') + (i === dow ? ' t' : '') + '">' + (seen ? '&#10003;' : '') + '</i></div>';
    });
    $('mh-week').innerHTML = html;
    $('mh-week').setAttribute('role', 'img'); $('mh-week').setAttribute('aria-label', 'Days visited this week: ' + DAYS.filter(function (d) { return d >= new Date(now.getTime() - dow * 864e5).toISOString().slice(0, 10); }).length);
    var s = streakNow(), best = parseInt(LS.get('nmw_longest_streak'), 10) || s;
    $('mh-streaktxt').textContent = s + '-day streak · your best is ' + Math.max(best, s);
    $('mh-st-tr').textContent = STATS.tr + ' of ' + STATS.tt;
    $('mh-st-gp').textContent = STATS.gr + ' of ' + STATS.gt;
  }

  function weekCard() {   // ME_WEEK_20261024: this week, you v the model - scored on the server from real votes
    if (!UID) return;
    getJ('/poll/week?uid=' + encodeURIComponent(UID)).then(function (w) {
      if (!w || !w.ok) return;
      var t = label(ICON.bar, 'This week: you v the model', w.week ? 'since ' + esc(w.week) : '');
      if (!w.n) {
        card('week', '', t + '<p class="mh-sub">' + (w.pending ? 'You have ' + w.pending + ' pick' + (w.pending > 1 ? 's' : '') + ' waiting on a result. ' : 'Pick the result of any game in the next 24 hours. ') +
          'Each pick is scored against what the model predicted when you voted.</p>' + (w.pending ? '' : '<a class="mh-link" href="/">Make a pick &rsaquo;</a>'));
        return;
      }
      var d = w.you - w.model, msg = d > 0 ? 'You\'re ahead of the model by ' + d : d < 0 ? 'The model is ahead by ' + (-d) : 'Level with the model';
      card('week', '', t + '<div class="mh-g4"><div class="mh-stat"><span>You</span><b>' + w.you + '/' + w.n + '</b></div><div class="mh-stat"><span>The model</span><b>' + w.model + '/' + w.n + '</b></div></div>' +
        '<p class="mh-sub">' + msg + (w.pending ? ' &middot; ' + w.pending + ' still to play' : '') + '. Same games, scored on full-time results.</p>');
    }).catch(function () {});
  }
  function start() {
    page = $('page'); if (!page) return;
    var st = document.createElement('style'); st.id = 'mh-css'; st.textContent = CSS; document.head.appendChild(st);
    buildHub();
    try { var t = sessionStorage.getItem('nmw_mh_tab'); if (t) state.tab = t; } catch (e) {}
    ensure(); observe(); setTab(state.tab); obResume();
    setInterval(function () {   // ME_ALIVE: if the Me page rebuilds its main block, put the hub back
      var p = $('page'); if (!p) return;
      if (p !== page) { page = p; observe(); }
      if (!hub.isConnected || !todayEl.isConnected || !teamsEl.isConnected || page.getAttribute('data-mh-tab') !== state.tab) ensure();
    }, 1000);
    alertsPrompt(); nextTeams();
    setTimeout(function () {   // ME_RETRY_20261024
      var c = $('mh-tm-club'); if (!c || !/Loading your club/.test(c.textContent)) return;
      c.innerHTML = TEAM ? '<div class="mh-box mh-retry"><span class="mh-lbl">Your club couldn\'t load right now.</span> <button type="button" class="mh-btn ghost" onclick="location.reload()">Retry</button></div>'
        : '<div class="mh-box"><span class="mh-lbl">No club followed yet.</span> <button type="button" class="mh-btn" data-ob="1">Choose your club</button></div>';
    }, 10000);
    (function loadCards(n) {   // ME_RETRY_20261024
    var failed = false;
    Promise.all([getJ('/data/me_today.json').catch(function () { failed = true; return {}; }), getJ('/data/poll_data.json').catch(function () { return null; })]).then(function (r) {
      if (failed) { if (n < 2) return setTimeout(function () { loadCards(n + 1); }, 1500 * (n + 1)); return retryBox('mh-cards', 'Today\'s games couldn\'t load right now.', function () { loadCards(0); }); }
      var rb = document.getElementById('mh-retry-mh-cards'); if (rb) rb.remove();
      var d = r[0] || {}; state.today = d;
      clubOrPoll(r[1]); triviaCard(d.trivia); gtpCard(d.guess_player); weekCard();
      otdCard(d.on_this_day, d.on_this_day_label); dykCard(d.did_you_know); quoteCard(d.monday_quote); storiesCard();
      renderList();
    });
    })(0);
    todayEl.addEventListener('click', function (e) {
      var a = e.target.closest('a.mh-li'); if (!a) return; var el = document.querySelector(a.getAttribute('href'));
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); var f = el.querySelector('button,input,a'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 400); }
    });
  }
  var tries = 0;
  (function wait() {
    var p = $('page');
    if (p && (p.children.length > 2 || tries > 40)) return start();
    tries++; setTimeout(wait, 200);
  })();
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
