/* 90minWaffle scroll-keeper v1
   Remembers where you were on a page and puts you back there when you
   come back (browser back, swipe back, or the in-app back arrow to a
   parent page). Works on mobile and desktop. No dependencies. */
(function () {
  'use strict';

  var store = null;
  try {
    store = window.sessionStorage;
    store.setItem('__nmw_t', '1');
    store.removeItem('__nmw_t');
  } catch (e) { store = null; }
  if (!store) return;

  function fullKey() { return 'nmw-scroll:' + location.pathname + location.search; }
  function pathKey() { return 'nmw-scroll:' + location.pathname; }

  function read(k) {
    try { return JSON.parse(store.getItem(k) || 'null'); } catch (e) { return null; }
  }

  // Read what was saved BEFORE we start saving again on this visit.
  var saved = read(fullKey()) || read(pathKey());

  var restoring = false;

  function save() {
    if (restoring) return;
    var v = JSON.stringify({
      y: Math.round(window.scrollY || window.pageYOffset || 0),
      t: Date.now()
    });
    try { store.setItem(fullKey(), v); store.setItem(pathKey(), v); } catch (e) {}
  }

  var tmr = null;
  window.addEventListener('scroll', function () {
    if (tmr) return;
    tmr = setTimeout(function () { tmr = null; save(); }, 250);
  }, { passive: true });
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') save();
  });
  // Any tap (cards use onclick, not links) - save before the page changes.
  document.addEventListener('click', save, true);

  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}

  if (!saved || !(saved.y > 0)) return;

  function navType() {
    try {
      var n = performance.getEntriesByType('navigation');
      if (n && n[0] && n[0].type) return n[0].type;
    } catch (e) {}
    try { if (performance.navigation && performance.navigation.type === 2) return 'back_forward'; } catch (e) {}
    return 'navigate';
  }

  // True when we arrived from a page *under* this one, e.g. /matches/match/ -> /matches/
  function cameFromChild() {
    try {
      if (!document.referrer) return false;
      var r = new URL(document.referrer);
      if (r.origin !== location.origin) return false;
      var here = location.pathname.replace(/\/?$/, '/');
      return r.pathname !== location.pathname && r.pathname.indexOf(here) === 0;
    } catch (e) { return false; }
  }

  var fresh = (Date.now() - (saved.t || 0)) < 30 * 60 * 1000;
  if (!(navType() === 'back_forward' || (fresh && cameFromChild()))) return;

  var target = saved.y;
  var cancelled = false;
  var start = Date.now();
  restoring = true;

  function cancel() { cancelled = true; restoring = false; }
  ['touchmove', 'wheel', 'keydown'].forEach(function (ev) {  /* SCROLLKEEP2_20261019: a tap no longer cancels; only a real scroll after 400ms */
    window.addEventListener(ev, function () { if (Date.now() - start > 400) cancel(); }, { passive: true });
  });

  function apply() {
    window.scrollTo(0, target);
    // Keep the matches page's own per-tab memory in sync so a re-render
    // doesn't throw the user back to the top.
    try {
      if (window._scrollPos && typeof window.activeTab === 'string') {
        window._scrollPos[window.activeTab] = target;
      }
    } catch (e) {}
  }

  function finish() {
    restoring = false;
    save();
  }

  function tick() {
    if (cancelled) return;
    var h = document.documentElement.scrollHeight;
    if (h >= target + window.innerHeight - 10) {
      apply();
      // Data-driven pages sometimes re-render once more; re-assert once.
      [700, 1500, 3000].forEach(function (ms, i, a) {  /* SCROLLKEEP2_20261019: hold position through late re-renders */
        setTimeout(function () {
          if (!cancelled && Math.abs((window.scrollY || 0) - target) > 40) apply();
          if (i === a.length - 1) finish();
        }, ms);
      });
      return;
    }
    if (Date.now() - start > 6000) { apply(); finish(); return; }
    setTimeout(tick, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  } else {
    tick();
  }
})();
