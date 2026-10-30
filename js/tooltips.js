/**
 * tooltips.js — 90minWaffle ⓘ tap tooltips v1.0
 * Inject ⓘ icons next to football terms, show plain-English popup on tap
 */
(function(){
  var TIPS = {
    'xg':         {term:'xG',          text:'Expected Goals — measures the quality of chances created, not just goals scored. Higher xG = better chances.'},
    'btts':       {term:'BTTS',        text:'Both Teams To Score — a bet/stat on whether both sides will get at least one goal each.'},
    'o25':        {term:'O2.5',        text:'Over 2.5 Goals — backing 3 or more goals in the match total.'},
    'u25':        {term:'U2.5',        text:'Under 2.5 Goals — backing 2 or fewer goals in the match total.'},
    'form':       {term:'Form',        text:'Last 5 results — W = Win, D = Draw, L = Loss. Read left to right, most recent last.'},
    'cs':         {term:'Clean Sheet', text:'When a team keeps the opposition from scoring — zero goals conceded.'},
    'edge':       {term:'Edge',        text:'A pick where our stats suggest it is more likely to land than the bookmaker\'s price implies. Not a guarantee: some edges lose, and every result is shown.'}, /* TIPS_20261030 */
    'roi':        {term:'ROI', text:'Return on investment: profit as a share of everything staked. +11% means about 11p back for every £1 staked. Only tips with a real bookmaker price count.'},
    'possession': {term:'Possession',  text:'The share of time each team controlled the ball, shown as a percentage.'},
    'ontarget':   {term:'On Target',   text:'Shots that would have gone in without the keeper — a better measure of attacking threat than total shots.'},
    'winrate':    {term:'Win Rate',    text:'Percentage of matches won out of all played this season.'},
    'units':      {term:'Units',       text:'One unit is your normal stake, whatever that is for you. Counting in units lets anyone compare results fairly.'},
    'void':       {term:'Void',        text:'A match that did not produce a result, for example postponed. The stake is returned, so it counts as neither a win nor a loss.'},
    'verified':   {term:'Verified record', text:'Only tips with a real bookmaker price recorded before kick-off. These are the ones counted in profit and ROI.'},
    'price':      {term:'Price (odds)', text:'What the bookmaker pays. A price of 2.00 returns £2 for every £1 staked, including your stake back.'},
    'allcalls':   {term:'All calls',   text:'Every tip, including stats edges with no bookmaker price and early beta tips. Those count as a win or a loss, but never in profit or ROI.'},
  };

  var activeTooltip = null;

  function injectStyles(){
    if(document.getElementById('tt-styles'))return;
    var s = document.createElement('style');
    s.id = 'tt-styles';
    s.textContent =
      '.tt-icon{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.4);font-size:9px;font-weight:700;cursor:pointer;margin-left:4px;flex-shrink:0;vertical-align:middle;-webkit-tap-highlight-color:transparent;transition:all 0.15s;font-style:normal;line-height:1;}'
      +'.tt-icon:hover,.tt-icon:active{background:var(--accent-dim);border-color:var(--accent);color:var(--accent);}'
      +'.tt-popup{position:fixed;z-index:9500;background:var(--bg-elev,#14191A);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:10px 13px;max-width:240px;box-shadow:0 4px 24px rgba(0,0,0,0.5);pointer-events:none;opacity:0;transform:translateY(4px);transition:opacity 0.15s,transform 0.15s;}'
      +'.tt-popup.tt-show{opacity:1;transform:translateY(0);}'
      +'.tt-term{font-size:0.72rem;font-weight:800;color:var(--accent,#F97316);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;}'
      +'.tt-text{font-size:0.78rem;color:rgba(255,255,255,0.7);line-height:1.5;}';
    document.head.appendChild(s);
  }

  function getOrCreatePopup(){
    var el = document.getElementById('tt-popup');
    if(!el){
      el = document.createElement('div');
      el.id = 'tt-popup';
      el.className = 'tt-popup';
      el.innerHTML = '<div class="tt-term" id="tt-term"></div><div class="tt-text" id="tt-text"></div>';
      document.body.appendChild(el);
    }
    return el;
  }

  function showTooltip(icon, key){
    var tip = TIPS[key];
    if(!tip) return;
    var popup = getOrCreatePopup();
    document.getElementById('tt-term').textContent = tip.term;
    document.getElementById('tt-text').textContent = tip.text;
    // Position
    var rect = icon.getBoundingClientRect();
    var popW = 240;
    var left = rect.left + rect.width/2 - popW/2;
    if(left < 10) left = 10;
    if(left + popW > window.innerWidth - 10) left = window.innerWidth - popW - 10;
    var top = rect.top - 8;
    // Show above or below
    if(top - 80 < 0) top = rect.bottom + 8;
    else top = rect.top - 90;
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    popup.style.pointerEvents = 'auto';
    popup.classList.add('tt-show');
    activeTooltip = key;
  }

  function hideTooltip(){
    var popup = document.getElementById('tt-popup');
    if(popup){popup.classList.remove('tt-show');popup.style.pointerEvents='none';}
    activeTooltip = null;
  }

  // Dismiss on tap outside
  document.addEventListener('click', function(e){
    if(!e.target.classList.contains('tt-icon')) hideTooltip();
  });

  // Public: create an ⓘ icon for a given key
  window.ttIcon = function(key){
    return '<i class="tt-icon" onclick="event.stopPropagation();window.ttShow(this,\''+key+'\')" title="">i</i>';
  };

  window.ttShow = function(el, key){
    if(activeTooltip === key){ hideTooltip(); return; }
    showTooltip(el, key);
  };

  // Auto-inject into existing DOM elements after page load
  function autoInject(){
    // Inject into stat labels that already exist in DOM (live panel, match cards)
    var map = [
      {sel:'.lmp-stat-label', terms:{xG:'xg', BTTS:'btts', 'Possession %':'possession', 'On Target':'ontarget'}},
      {sel:'.fstat', terms:{BTTS:'btts', 'Win rate':'winrate', 'Clean sheets':'cs', 'xG for':'xg'}},
      {sel:'.stat-lbl', terms:{ROI:'roi','ROI (priced)':'roi'}},
    ];
    var EXACT={'Voids':'void','Void':'void','Yield (ROI)':'roi','Verified ROI':'roi','Return (ROI)':'roi','Profit':'units','StatIQ verified record':'verified','Verified real bookmaker odds':'verified','Average odds (last 200)':'price','All calls':'allcalls'};
    document.querySelectorAll('main span,main div,main td,main th,main dt,main b,main h2,main h3,aside span,aside div,aside h2').forEach(function(el){if(el.children.length)return;var k=EXACT[(el.textContent||'').trim()];if(k)el.innerHTML=el.innerHTML+window.ttIcon(k);});
    map.forEach(function(m){
      document.querySelectorAll(m.sel).forEach(function(el){
        var txt = el.textContent||'';
        Object.keys(m.terms).forEach(function(label){
          if(txt.indexOf(label)!==-1 && !el.querySelector('.tt-icon')){
            el.innerHTML = el.innerHTML + window.ttIcon(m.terms[label]);
          }
        });
      });
    });
  }

  injectStyles();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', autoInject);
  } else {
    setTimeout(autoInject, 800);
  }
  // Re-run after dynamic content loads (live panel opens etc)
  window.ttRefresh = autoInject;
})();
