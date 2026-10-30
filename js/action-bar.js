/* NMW_ACTIONS_20261024: one like / dislike / save / share bar for the whole site (replaces the two older copies).
   Like + Dislike: instant fill + pop, only one at a time, tap again to undo, real fan counts from the server.
   Save: keeps the item's own link + title -> toast "Saved · View saved · Undo"; Saved list on the Me page grouped, each opens where it sits.
   Share: the item's own clean link (share sheet on phones, copy + "Link copied" elsewhere). */
(function () {
  var W = window, D = document, REG = W.__nmwReg = W.__nmwReg || {};
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function q(s) { return W.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&'); }
  function fmt(n) { n = +n || 0; return !n ? '' : n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n); }
  function counts(id) { return (W.REACT_COUNTS && W.REACT_COUNTS[id]) || {}; }
  function bump(id, k, n) { W.REACT_COUNTS = W.REACT_COUNTS || {}; var c = W.REACT_COUNTS[id] = W.REACT_COUNTS[id] || {}; c[k] = Math.max(0, (+c[k] || 0) + n); }
  var SV = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" viewBox="0 0 24 24" width="16" height="16"';
  var I = {
    like: '<svg class="ico-like" ' + SV + '><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>',
    dislike: '<svg class="ico-dislike" ' + SV + '><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>',
    save: '<svg class="ico-fav" ' + SV + '><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    share: '<svg class="ico-share" ' + SV + '><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
  };
  var CSSTXT = '.nmwa{display:flex;gap:6px;flex-wrap:wrap}.nmwa .action-btn{min-height:36px;display:inline-flex;align-items:center;gap:6px}' +
    '.nmwa .action-btn.pop svg{animation:nmwapop .32s ease}@keyframes nmwapop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}' +
    '.nmwa .action-btn.liked{color:#22d3ee}.nmwa .action-btn.liked svg{fill:#22d3ee;stroke:#22d3ee}' +
    '.nmwa .action-btn.disliked{color:var(--text,#e6edf6)}.nmwa .action-btn.disliked svg{fill:currentColor;stroke:currentColor}' +
    '.nmwa .action-btn.faved{color:#22d3ee}.nmwa .action-btn.faved svg{fill:#22d3ee;stroke:#22d3ee}' +
    '.nmwa-toast{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translate(-50%,16px);opacity:0;pointer-events:none;display:flex;gap:14px;align-items:center;max-width:calc(100vw - 32px);background:#0f1a2e;border:1px solid rgba(34,211,238,.45);color:#e6edf6;padding:10px 16px;border-radius:999px;font-size:.86rem;font-weight:600;z-index:10000;box-shadow:0 6px 24px rgba(0,0,0,.45);transition:opacity .2s,transform .2s}' +
    '.nmwa-toast.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}.nmwa-toast a,.nmwa-toast button{color:#22d3ee;background:none;border:0;font:inherit;font-weight:700;padding:6px 0;cursor:pointer;text-decoration:none;white-space:nowrap}' +
    '@media(min-width:900px){.nmwa-toast{bottom:28px}}@media(prefers-reduced-motion:reduce){.nmwa .action-btn.pop svg{animation:none}.nmwa-toast{transition:none}}' +
    '.nmwa-sg{margin:0 0 12px}.nmwa-sh{font-size:.72rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#22d3ee;margin:0 4px 6px}.nmwa-sh span{color:var(--text-dim,#94a3b8)}' +
    '.nmwa-sl{padding:0!important;overflow:hidden}.nmwa-si{display:flex;align-items:center;border-top:1px solid var(--border,rgba(255,255,255,.08))}.nmwa-si:first-child{border-top:0}' +
    '.nmwa-sa{flex:1;min-width:0;display:block;padding:12px 14px;color:var(--text,#e6edf6);text-decoration:none}.nmwa-sa b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.9rem;line-height:1.3}' +
    '.nmwa-compact{margin-top:6px}.nmwa-compact .nmwa{gap:4px}.nmwa-compact .action-btn{min-height:32px;padding:4px 10px;font-size:.78rem}' +
    '.nmwa-sa small{display:block;margin-top:3px;color:var(--text-dim,#94a3b8);font-size:.75rem}.nmwa-sx{background:none;border:0;color:var(--text-dim,#94a3b8);font-size:1.35rem;width:44px;height:44px;cursor:pointer;flex:none}';
  function css() { if (D.getElementById('nmwa-css')) return; var s = D.createElement('style'); s.id = 'nmwa-css'; s.textContent = CSSTXT; (D.head || D.documentElement).appendChild(s); }
  css();

  W.actionBar = function (id, label, type) {
    var s = String(id); if (label != null) REG[s] = { label: String(label), type: type || (REG[s] || {}).type || '' };
    var c = counts(s), on = { like: !!ls('nmw_like_' + s), dislike: !!ls('nmw_dislike_' + s), save: !!ls('nmw_fav_' + s) }, e = esc(s);
    function b(act, txt, aria) {
      var cls = { like: 'liked', dislike: 'disliked', save: 'faved' }[act];
      return '<button type="button" class="action-btn' + (on[act] ? ' ' + cls : '') + '" data-nmwa="' + act + '" data-id="' + e + '" aria-label="' + aria + '"' +
        (act === 'share' ? '' : ' aria-pressed="' + !!on[act] + '"') + '>' + I[act] + (txt ? '<span>' + txt + '</span>' : '') + '</button>';
    }
    return '<div class="action-bar nmwa">' + b('like', fmt(c.likes), on.like ? 'Unlike' : 'Like') + b('dislike', '', on.dislike ? 'Remove dislike' : 'Dislike') +
      b('save', on.save ? 'Saved' : 'Save', on.save ? 'Remove from saved' : 'Save') + b('share', 'Share', 'Share') + '</div>';
  };
  function redraw(id, popAct) {
    [].forEach.call(D.querySelectorAll('[data-abid="' + q(id) + '"]'), function (el) {
      el.innerHTML = W.actionBar(id);
      var b = popAct && el.querySelector('[data-nmwa="' + popAct + '"]'); if (b) b.classList.add('pop');
    });
  }
  function post(id, reaction, on) {
    var body = { content_id: id, reaction: reaction, voter_id: ls('nmw_uid') || 'anon' }; if (typeof on === 'boolean') body.on = on;
    return fetch('/api/react', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); }).then(function (d) { if (d && typeof d === 'object' && 'likes' in d) { W.REACT_COUNTS = W.REACT_COUNTS || {}; W.REACT_COUNTS[id] = d; redraw(id); } })
      .catch(function () {});
  }
  var tEl, tT;
  function hide() { if (tEl) tEl.classList.remove('on'); }
  function toast(msg, act, fn, link) {
    if (!tEl) { tEl = D.createElement('div'); tEl.className = 'nmwa-toast'; tEl.setAttribute('role', 'status'); tEl.setAttribute('aria-live', 'polite'); D.body.appendChild(tEl); }
    tEl.innerHTML = '<span>' + esc(msg) + '</span>' + (link ? '<a href="' + esc(link[0]) + '">' + esc(link[1]) + '</a>' : '') + (act ? '<button type="button">' + esc(act) + '</button>' : '');
    var b = tEl.querySelector('button'); if (b) b.onclick = function () { hide(); if (fn) fn(); };
    tEl.classList.add('on'); clearTimeout(tT); tT = setTimeout(hide, 4500);
  }
  W.nmwToast = toast;
  function clean(u) {
    try {
      var x = new URL(u, location.href), drop = [];
      x.searchParams.forEach(function (v, k) { if (/^utm_|^(fbclid|gclid|igshid|mc_cid|mc_eid|ref)$/.test(k)) drop.push(k); });
      drop.forEach(function (k) { x.searchParams.delete(k); });
      if (!/\/matches\/match\//.test(x.pathname)) x.hash = '';
      return x.href;
    } catch (e) { return u; }
  }
  function item(id) {
    var r = REG[id] || {}, el = D.querySelector('[data-abid="' + q(id) + '"]'), url = '', title = r.label || '', type = r.type === 'edge' ? 'tip' : (r.type || '');
    if (el) {
      var card = el.closest('[data-card-id],article,a[href],[onclick],.card,.card-link,li');   // NMW_ACTIONS2_20261024
      var a = card && (card.matches('a[href]') ? card : card.querySelector('a[href]:not([href^="#"]):not([href^="javascript"])'));
      if (a) url = a.href;
      else if (card && card.getAttribute('onclick')) { var m = card.getAttribute('onclick').match(/location(?:\.href)?\s*=\s*['"]([^'"]+)/); if (m) url = new URL(m[1], location.href).href; }
      if (!title && card) { var h = card.querySelector('.hv2-stt,h1,h2,h3,h4,.title,.take-text,b,strong') || card.querySelector('img[alt]'); if (h) title = (h.getAttribute('alt') && !h.textContent ? h.getAttribute('alt') : h.textContent).trim(); }
    }
    if (!url && type === 'match') url = location.origin + '/matches/match/#' + encodeURIComponent(id);
    url = clean(url || location.href);
    if (!type) type = /\/(preview|matches)\//.test(url) ? 'match' : /\/edges\//.test(url) ? 'tip' : 'story';
    title = title.replace(/\s+/g, ' ').trim().slice(0, 140);
    return { id: id, label: title || 'Saved item', title: title, type: type, url: url, page: location.pathname, ts: Date.now() };
  }
  function like(id) {
    var on = !ls('nmw_like_' + id);
    if (on && ls('nmw_dislike_' + id)) { ls('nmw_dislike_' + id, null); post(id, 'dislike', false); }
    ls('nmw_like_' + id, on ? '1' : null); bump(id, 'likes', on ? 1 : -1); redraw(id, 'like'); post(id, 'like', on);
  }
  function dislike(id) {
    var on = !ls('nmw_dislike_' + id);
    if (on && ls('nmw_like_' + id)) { ls('nmw_like_' + id, null); bump(id, 'likes', -1); post(id, 'like', false); }
    ls('nmw_dislike_' + id, on ? '1' : null); redraw(id, 'dislike'); post(id, 'dislike', on);
  }
  function save(id) {
    var k = 'nmw_fav_' + id, old = ls(k);
    if (old) {
      ls(k, null); bump(id, 'saves', -1); redraw(id, 'save'); post(id, 'save', false);
      toast('Removed from Saved', 'Undo', function () { ls(k, old); bump(id, 'saves', 1); redraw(id, 'save'); post(id, 'save', true); });
      return;
    }
    ls(k, JSON.stringify(item(id))); bump(id, 'saves', 1); redraw(id, 'save'); post(id, 'save', true);
    toast('Saved', 'Undo', function () { ls(k, null); bump(id, 'saves', -1); redraw(id, 'save'); post(id, 'save', false); }, ['/me/#saved', 'View saved']);
  }
  function copy(t) {
    if (navigator.clipboard && W.isSecureContext) return navigator.clipboard.writeText(t);
    return new Promise(function (ok, no) { var x = D.createElement('textarea'); x.value = t; x.style.cssText = 'position:fixed;opacity:0'; D.body.appendChild(x); x.select(); try { D.execCommand('copy') ? ok() : no(); } catch (e) { no(e); } x.remove(); });
  }
  function share(id) {
    var it = item(id), t = (it.title || D.title.replace(/\s*[|·–-]\s*90minWaffle.*$/i, '')).replace(/^[A-Z][A-Z \-]{2,24}:\s*/, '').trim();
    function done() { bump(id, 'shares', 1); post(id, 'share'); }
    if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) { navigator.share({ title: t, text: t + ' | 90minWaffle', url: it.url }).then(done).catch(function () {}); return; }
    copy(it.url).then(function () { toast('Link copied'); done(); }, function () { W.prompt('Copy this link:', it.url); });
  }
  D.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-nmwa]');
    if (b) { e.preventDefault(); e.stopPropagation(); ({ like: like, dislike: dislike, save: save, share: share })[b.getAttribute('data-nmwa')](b.getAttribute('data-id')); return; }
    var x = e.target.closest && e.target.closest('[data-unsave]');
    if (x) { e.preventDefault(); e.stopPropagation(); unsave(x); }
  }, true);

  // old names still work for any page that calls them directly
  W.nmwLike = function (id, label) { if (label != null && !REG[id]) REG[id] = { label: label }; like(String(id)); };
  W.nmwDislike = function (id, label) { if (label != null && !REG[id]) REG[id] = { label: label }; dislike(String(id)); };
  W.nmwFav = function (id, label, type) { if (label != null) REG[id] = { label: label, type: type || (REG[id] || {}).type }; save(String(id)); };
  W.nmwShare = function (label, id, type) { if (id != null && label != null && !REG[id]) REG[id] = { label: label, type: type }; share(String(id || '')); };
  W.getFavourites = function () {
    var f = [];
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('nmw_fav_') === 0) { try { var v = JSON.parse(localStorage.getItem(k)); if (v) { v.id = v.id || k.slice(8); f.push(v); } } catch (e) {} } } } catch (e) {}
    return f.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  };

  // Saved list (Me page)
  function ago(ts) {
    if (!ts) return ''; var d = Math.floor((Date.now() - ts) / 864e5);
    return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d < 7 ? d + ' days ago' : new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  W.nmwSavedHTML = function () {
    var f = W.getFavourites();
    if (!f.length) return '<div class="card"><div class="empty-state">Nothing saved yet.<br>Tap <b>Save</b> on any story, match or tip and it will be kept here.</div></div>';
    var G = { story: ['Stories', []], match: ['Matches', []], tip: ['Tips', []] }, today = new Date().toISOString().slice(0, 10), h = '';
    f.forEach(function (x) { var t = x.type === 'edge' ? 'tip' : (G[x.type] ? x.type : 'story'); G[t][1].push(x); });
    Object.keys(G).forEach(function (k) {
      var L = G[k][1]; if (!L.length) return;
      h += '<div class="nmwa-sg"><div class="nmwa-sh">' + G[k][0] + ' <span>' + L.length + '</span></div><div class="card nmwa-sl">' + L.map(function (x) {
        var d = (x.url || '').match(/(\d{4}-\d{2}-\d{2})/), played = k === 'match' && d && d[1] < today, t = String(x.title || x.label || 'Saved item').replace(/^[A-Z][A-Z \-]{2,24}:\s*/, '');
        return '<div class="nmwa-si"><a class="nmwa-sa" data-fid="' + esc(x.id) + '" href="' + esc(x.url || '/') + '"><b>' + esc(t) + '</b><small>' + (played ? 'Played &middot; ' : '') + 'Saved ' + ago(x.ts) + '</small></a>' +
          '<button type="button" class="nmwa-sx" data-unsave="' + esc(x.id) + '" aria-label="Remove from saved">&times;</button></div>';
      }).join('') + '</div></div>';
    });
    setTimeout(fixOld, 0);
    return h;
  };
  function unsave(btn) {
    var id = btn.getAttribute('data-unsave'), k = 'nmw_fav_' + id, old = ls(k), row = btn.closest('.nmwa-si'), par = row && row.parentNode, nx = row && row.nextSibling;
    var grp = par && par.closest('.nmwa-sg');
    ls(k, null); post(id, 'save', false); if (row) row.remove(); if (grp && !par.children.length) grp.hidden = true;
    toast('Removed from Saved', 'Undo', function () { ls(k, old); post(id, 'save', true); if (row && par) { par.insertBefore(row, nx); if (grp) grp.hidden = false; } });
  }
  function fixOld() {   // items saved before 24 Oct kept the page they were saved from - point stories at their own page
    var bad = [].filter.call(D.querySelectorAll('a.nmwa-sa[data-fid]'), function (a) { try { var u = new URL(a.href); return u.origin === location.origin && /^\/(news\/?)?$/.test(u.pathname); } catch (e) { return false; } });
    if (!bad.length) return;
    fetch('/data/content_lite.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (cl) {
      var items = Array.isArray(cl) ? cl : (cl.stories || cl.items || []), by = {};
      items.forEach(function (it) { [it.id, it.slug, it.story_id].forEach(function (v) { if (v != null) by[String(v)] = it; }); });
      bad.forEach(function (a) {
        var id = a.getAttribute('data-fid'), it = by[id]; if (!it) return;
        var u = it.url || it.link || it.permalink || (it.slug ? '/story/' + it.slug + '/' : ''); if (!u) return;
        a.href = u; try { var k = 'nmw_fav_' + id, v = JSON.parse(ls(k)); if (v) { v.url = new URL(u, location.href).href; ls(k, JSON.stringify(v)); } } catch (e) {}
      });
    }).catch(function () {});
  }
  // /me/#saved opens the Saved list
  function openSaved(n) {
    if (!/^\/me\/?$/.test(location.pathname) || location.hash !== '#saved') return;
    var t = D.querySelector('[data-tab=progress]'); if (t && t.getAttribute('aria-selected') !== 'true' && !t.__nmwa) { t.__nmwa = 1; t.click(); }
    if (typeof W.setMePill === 'function' && D.getElementById('me-pill-content')) { W.setMePill('saved'); setTimeout(function () { var c = D.getElementById('me-pill-content'); if (c && c.offsetParent) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 350); return; }
    var s = [].filter.call(D.querySelectorAll('button,a,[role=tab]'), function (x) { return /^\s*Saved\s*$/i.test(x.textContent) && x.offsetParent; })[0];
    if (s) { s.click(); setTimeout(function () { var h = [].filter.call(D.querySelectorAll('.nmwa-sg,.fav-list,.empty-state'), function (x) { return x.offsetParent; })[0]; if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 350); return; }
    if ((n || 0) < 25) setTimeout(function () { openSaved((n || 0) + 1); }, 300);
  }
  W.addEventListener('hashchange', function () { var t = D.querySelector('[data-tab=progress]'); if (t) t.__nmwa = 0; openSaved(0); });
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function () { openSaved(0); }); else openSaved(0);

  // main homepage stories (article.hv2-st) get a compact bar of their own
  function hid(u) { var h = 5381; for (var i = 0; i < u.length; i++) h = ((h << 5) + h + u.charCodeAt(i)) >>> 0; return 'st_' + h.toString(36); }
  function attach() {
    var ids = [];
    [].forEach.call(D.querySelectorAll('article.hv2-st'), function (art) {
      if (art.querySelector('[data-abid]')) return;
      var a = art.querySelector('a.hv2-stt[href]'); if (!a) return;
      var id = hid(a.href); REG[id] = { label: a.textContent.trim(), type: 'story' };
      var box = D.createElement('div'); box.className = 'nmwa-compact'; box.setAttribute('data-abid', id); box.innerHTML = W.actionBar(id);
      (a.parentNode || art).appendChild(box); ids.push(id);
    });
    if (ids.length) fetch('/api/react/bulk?ids=' + encodeURIComponent(ids.join(',')), { cache: 'no-cache' }).then(function (r) { return r.json(); })
      .then(function (d) { W.REACT_COUNTS = W.REACT_COUNTS || {}; ids.forEach(function (i) { if (d && d[i]) { W.REACT_COUNTS[i] = d[i]; redraw(i); } }); }).catch(function () {});
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', attach); else attach();
  setTimeout(attach, 1500);

  /* A11Y_BTNLABEL_20261023: icon-only buttons get a spoken name */
  (function(){var N={nmwLike:'Like',nmwDislike:'Dislike',nmwShare:'Share',nmwSave:'Save',nmwComment:'Comments',nmwReact:'React'};function f(){var l=document.querySelectorAll('button:not([aria-label])');for(var i=0;i<l.length;i++){var b=l[i];if((b.textContent||'').trim())continue;var m=(b.getAttribute('onclick')||'').match(/(nmw\w+)\(/);var t=b.getAttribute('title')||b.getAttribute('data-label')||(m?(N[m[1]]||m[1].replace(/^nmw/,'')):'');if(t)b.setAttribute('aria-label',t);}}var q=0;function k(){if(q)return;q=1;requestAnimationFrame(function(){q=0;f();});}if(window.MutationObserver){new MutationObserver(k).observe(document.documentElement,{childList:true,subtree:true});}f();})();
})();
