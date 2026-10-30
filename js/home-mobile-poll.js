/* MPOLL_20261017 v2 (full-width card between the pills and What's on): on phones, the sidebar Daily Poll card moves into the home feed (above StatIQ Edges), neon card style */
(function () {
  if (window.__nmwMP) return; window.__nmwMP = 1;
  if (window.innerWidth >= 900) return;
  var st = document.createElement('style');
  st.textContent = '.nmw-mpoll{display:block!important;background:#0a1020!important;border:1px solid rgba(34,211,238,.35)!important;border-radius:16px!important;'
    + 'box-shadow:0 0 18px rgba(34,211,238,.08)!important;padding:14px!important;margin:14px 0!important}'
    + '.nmw-mpoll .sidebar-heading{color:#22d3ee!important;text-shadow:0 0 10px rgba(34,211,238,.4);font-size:15px!important;letter-spacing:.04em;margin:0 0 10px!important}'
    + '.nmw-mpoll{width:auto!important;max-width:none!important;flex:none!important}.nmw-mpoll .poll-option{display:block;width:100%;text-align:left;margin:6px 0;padding:11px 12px;border-radius:12px;background:#111a2e;border:1px solid rgba(34,211,238,.25);color:#e6edf6;font-size:14px}'
    + '.nmw-mpoll .poll-option:active{background:rgba(34,211,238,.12)}';
  document.head.appendChild(st);
  var tries = 0;
  function top(el) {   /* climb to the block that sits directly in the main column */
    var mc = document.querySelector('.main-column'); if (!mc || !el) return null;
    while (el && el.parentElement && el.parentElement !== mc) el = el.parentElement;
    return el && el.parentElement === mc ? el : null;
  }
  function find(re) {
    var els = document.querySelectorAll('.main-column *');
    for (var i = 0; i < els.length; i++) { if (els[i].children.length === 0 && re.test((els[i].textContent || '').trim())) return els[i]; }
    return null;
  }
  function place() {
    var q = document.getElementById('poll-question'); if (!q) return false;
    var card = q.closest('.sidebar-card'); if (!card) return false;
    if (card.classList.contains('nmw-mpoll') && !card.closest('.sidebar-column')) return true;
    var mc = document.querySelector('.main-column'); if (!mc) return false;
    var whats = top(find(/^what.?s on 90minwaffle$/i)), pills = top(document.getElementById('catStrip'));
    if (!whats && !pills && ++tries < 25) return false;
    card.classList.add('nmw-mpoll');
    if (whats) mc.insertBefore(card, whats);
    else if (pills) mc.insertBefore(card, pills.nextSibling);
    else mc.insertBefore(card, mc.children[2] || null);
    return true;
  }
  function go() { if (!place()) setTimeout(go, 200); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
