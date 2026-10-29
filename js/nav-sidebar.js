/* nav-sidebar.js — Unified sidebar v2.0
 * Single source of truth for SECTIONS, drawer logic, swipe gesture.
 * Dual icon system: emoji on social pages (home/me), SVG icons on data pages.
 * Set window._nmwSocialPage = true before this script on home/me pages.
 */
(function(){

  var SECTIONS = [ /* NAV_SYNC_V3 - order and links synced to home layout */
    {slug:'all',key:'all',label:'Home',colour:'#8a92a3',emoji:'🏠',
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>'},
    {slug:'transfers',key:'transfers',label:'Transfers',colour:'#22D3EE',emoji:'🔄',
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>'},
    {slug:'for-you',key:'for_you',label:'For You',colour:'#FACC15',emoji:'⭐',
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'},
    {slug:'footballiq',key:'footballiq',label:'FootballIQ',href:'/footballiq/',colour:'#F97316',emoji:'📊',
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'},
    {slug:'match-day',key:'match_day',label:'Match Day',colour:'#00B050',emoji:'⚽',
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M2 12h2M20 12h2M12 2v2M12 20v2"/><polygon points="12 7 14.5 10 13.5 13.5 10.5 13.5 9.5 10"/></svg>'},
    {slug:'premier-league',key:'premier_league',label:'Premier League',colour:'#37003C',emoji:'🦁',
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16l-2-9 5 3 4-7 4 7 5-3-2 9z"/><line x1="5" y1="20" x2="19" y2="20"/></svg>'},
    {slug:'european-cups',key:'european_cups',label:'European Cups',colour:'#001E62',emoji:'🌟',
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M5 4H3v2a3 3 0 0 0 3 3M19 4h2v2a3 3 0 0 1-3 3"/><line x1="12" y1="14" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/></svg>'},
    {slug:'european-leagues',key:'european_leagues',label:'European Leagues',colour:'#003366',emoji:'🌍',
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 9h18M3 15h18M9 3a14 14 0 0 0 0 18M15 3a14 14 0 0 1 0 18"/></svg>'},
    {slug:'womens-football',key:'womens_football',label:"Women's Football",colour:'#C8147F',emoji:'💜',
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M12 12v8M9 17h6"/></svg>'},
    {slug:'championship',key:'championship',label:'Championship',colour:'#002C5F',emoji:'🔵',
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V4h12v5a6 6 0 0 1-12 0z"/><path d="M6 4H3v3a3 3 0 0 0 3 3M18 4h3v3a3 3 0 0 1-3 3"/><line x1="12" y1="15" x2="12" y2="19"/><line x1="8" y1="21" x2="16" y2="21"/></svg>'},
    {slug:'scottish-football',key:'scottish_football',label:'Scottish Football',colour:'#0065BD',emoji:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="1"/><line x1="3" y1="5" x2="21" y2="19"/><line x1="21" y1="5" x2="3" y2="19"/></svg>'},
    {slug:'domestic-trophies',key:'domestic_trophies',label:'Domestic Trophies',colour:'#D4AF37',emoji:'🥇',
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v6a5 5 0 0 1-10 0z"/><path d="M12 15v4M9 21h6"/></svg>'},
    {slug:'injuries',key:'injuries',label:'Injuries',colour:'#F59E0B',emoji:'🩹',sections:['injuries'],
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M10 12h4M12 10v4"/></svg>'},
    {slug:'managers',key:'managers',label:'Managers',colour:'#1E3A5F',emoji:'🧠',sections:['managers'],
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><path d="M17 11l2 2 4-4"/></svg>'},
    {slug:'stars-legends',key:'stars_legends',label:'Stars & Legends',colour:'#7B2D8B',emoji:'👑',sections:['stars_legends'],
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'},
    {slug:'off-pitch',key:'off_pitch',label:'Off Pitch',colour:'#6B7280',emoji:'🎙️',sections:['off_pitch'],
      icon:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>'},
  ];

  // Deduplicate (transfers appeared twice in draft)
  var seen = {};
  SECTIONS = SECTIONS.filter(function(s){
    if(seen[s.slug]) return false;
    seen[s.slug] = true;
    return true;
  });

  window.SIDEBAR_SECTIONS = SECTIONS;

  function _iconFor(s){
    return window._nmwSocialPage ? '<span style="font-size:1.1rem;line-height:1;width:20px;text-align:center;flex-shrink:0;">'+s.emoji+'</span>' : s.icon;
  }

  function openDrawer(){
    var d=document.getElementById('drawer');
    var b=document.getElementById('drawerBackdrop');
    if(d) d.classList.add('open');
    if(b) b.classList.add('open');
    if(typeof window.renderDrawer==='function'){try{window.renderDrawer();}catch(e){}}
  }
  function closeDrawer(){
    var d=document.getElementById('drawer');
    var b=document.getElementById('drawerBackdrop');
    if(d) d.classList.remove('open');
    if(b) b.classList.remove('open');
  }
  window.openDrawer = openDrawer;
  window.closeDrawer = closeDrawer;

  function injectSidebarHandle(){
    if(document.getElementById('sidebarHandle')) return;
    var h=document.createElement('button');
    h.id='sidebarHandle';
    h.setAttribute('aria-label','Open sidebar');
    h.onclick=function(){if(typeof window.openDrawer==='function')window.openDrawer();};
    h.style.cssText='position:fixed;left:0;top:50%;transform:translateY(-50%);width:14px;height:64px;background:rgba(255,255,255,0.06);border:none;border-radius:0 8px 8px 0;cursor:pointer;z-index:95;display:flex;align-items:center;justify-content:center;padding:0;transition:background 0.15s,width 0.15s;color:rgba(255,255,255,0.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)';
    h.innerHTML='<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    h.addEventListener('touchstart',function(){h.style.background='rgba(255,255,255,0.15)';},{passive:true});
    h.addEventListener('touchend',function(){h.style.background='rgba(255,255,255,0.06)';},{passive:true});
    h.addEventListener('mouseenter',function(){h.style.background='rgba(255,255,255,0.12)';h.style.width='20px';});
    h.addEventListener('mouseleave',function(){h.style.background='rgba(255,255,255,0.06)';h.style.width='14px';});
    document.body.appendChild(h);
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',injectSidebarHandle);}
  else{injectSidebarHandle();}

  var _nmwCounts=null;
  function _computeCounts(items){
    var counts={};
    var ENG=['quiz','poll','fact','on_this_day','quote'];
    items.forEach(function(it){
      var sec=it.section||'general';
      counts[sec]=(counts[sec]||0)+1;
      if(it.type==='hot_take'){counts['__hot__']=(counts['__hot__']||0)+1;}
    });
    var allCount=items.filter(function(it){return ENG.indexOf(it.type)===-1;}).length;
    counts['__all__']=allCount;
    return counts;
  }
  function _countForSection(s,counts){
    if(!counts)return null;
    if(s.key==='all')return counts['__all__']||0;
    if(s.key==='for_you')return null;
    return counts[s.key]||0;
  }
  function _renderItems(counts){
    var list=document.getElementById('drawerList');
    if(!list)return;
    list.innerHTML='';
    SECTIONS.forEach(function(s){
      var el=document.createElement('a');
      var n=_countForSection(s,counts);
      var muted=(n===0&&s.slug!=='all')?' muted':'';
      el.className='drawer-item'+muted;
      el.style.cssText='text-decoration:none;color:inherit';
      var href=s.href?s.href:(s.slug==='all'?'/':'/?s='+s.slug);
      el.href=href;
      var badge='';
      el.innerHTML='<span class="drawer-item-label" style="display:flex;align-items:center;gap:8px;">'+_iconFor(s)+' '+s.label+'</span>'+badge;
      list.appendChild(el);
    });
  }
  function renderDrawerSimple(){
    var list=document.getElementById('drawerList');
    if(!list)return;
    _renderItems(_nmwCounts);
    if(_nmwCounts===null){
      fetch('/data/content_lite.json?'+Math.floor(Date.now()/60000))
        .then(function(r){return r.json();})
        .then(function(d){_nmwCounts=_computeCounts(d.items||[]);_renderItems(_nmwCounts);})
        .catch(function(){});
    }
  }
  if(!window._homeSidebarOwned){window.renderDrawer=renderDrawerSimple;}

  var touchStartX=null,touchStartY=null,swipeOpened=false;
  document.addEventListener('touchstart',function(e){
    if(!e.touches||!e.touches[0])return;
    var x=e.touches[0].clientX,y=e.touches[0].clientY;
    if(x<=24){touchStartX=x;touchStartY=y;swipeOpened=false;}else{touchStartX=null;}
  },{passive:true});
  document.addEventListener('touchmove',function(e){
    if(touchStartX===null||swipeOpened)return;
    var x=e.touches[0].clientX,y=e.touches[0].clientY;
    var dx=x-touchStartX,dy=Math.abs(y-touchStartY);
    if(dx>40&&dy<50){openDrawer();swipeOpened=true;touchStartX=null;}
  },{passive:true});
  document.addEventListener('touchend',function(){touchStartX=null;touchStartY=null;},{passive:true});

  if(!window._homeSidebarOwned){
    if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',renderDrawerSimple);}
    else{renderDrawerSimple();}
  }
})();
