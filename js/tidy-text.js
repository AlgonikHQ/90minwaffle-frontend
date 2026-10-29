(function () { /* TIDYTEXT_20261024: plain words on every page - no emoji, no raw market codes. Close, tick, star and arrow symbols are kept. */
  'use strict';
  var EMO = /(?:[\u{1F300}-\u{1FAFF}]|[\u2600-\u27BF])\uFE0F?\s?/gu, KEEP = /[\u2713-\u2716\u2605\u2606\u2794\u2798-\u27BE\u276E-\u2771]/;
  var MAP = [[/\bO2\.5\b/g, 'Over 2.5'], [/\bU2\.5\b/g, 'Under 2.5'], [/\bO1\.5\b/g, 'Over 1.5'], [/\bU3\.5\b/g, 'Under 3.5'],
             [/BUILDER:[A-Z0-9_+\-]*/g, 'Bet builder'], [/\bHOME_WIN\b/g, 'Home win'], [/\bAWAY_WIN\b/g, 'Away win'], [/@ ---/g, 'no price']];
  function fix(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { var p = n.parentElement; return p && !p.closest('script,style,textarea,input,[contenteditable]') ? 1 : 2; } }), n, todo = [];
    while ((n = w.nextNode())) todo.push(n);
    todo.forEach(function (n) { var t = n.textContent, o = t;
      t = t.replace(EMO, function (m) { return KEEP.test(m) ? m : ''; });
      MAP.forEach(function (r) { t = t.replace(r[0], r[1]); });
      if (t !== o) n.textContent = t; });
  }
  function nations() {  // World Cup is history only: no live-looking filter or badges on the nation browser
    if (!/^\/nations\/?$/.test(location.pathname)) return;
    [].forEach.call(document.querySelectorAll('.nation-wc'), function (e) { e.style.display = 'none'; });
    [].forEach.call(document.querySelectorAll('#filters button, .filter-btn'), function (b) { if (/World Cup|\bWC\b/.test(b.textContent)) b.style.display = 'none'; });
  }
  function labels() {  /* QC_LABELS_20261024: every answer box has a name screen readers can read */
    [].forEach.call(document.querySelectorAll('input:not([type=hidden]):not([aria-label]),select:not([aria-label]),textarea:not([aria-label])'), function (e) {
      try { if ((e.id && document.querySelector('label[for="' + CSS.escape(e.id) + '"]')) || e.closest('label') || e.getAttribute('aria-labelledby')) return; } catch (x) {}
      e.setAttribute('aria-label', (e.getAttribute('placeholder') || 'Your answer').replace(/[.\u2026]+$/, '')); }); }
  function run() { fix(document.body); nations(); labels(); }
  var t = 0; new MutationObserver(function () { if (t) return; t = setTimeout(function () { t = 0; run(); }, 300); }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
