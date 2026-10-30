/* DESKTOP_NAV — v8 — NO MOBILE INTERFERENCE */
(function(){
  var IS_MOBILE = window.matchMedia('(max-width: 1023px)').matches;
  
  // EXIT EARLY ON MOBILE — let mobile-nav take over completely
  if(IS_MOBILE){
    console.log("Mobile detected — desktop nav skipped");
    return;
  }

  var ITEMS=[
    /* MENUS_20261030: 4 main links; Home is the logo; Weekend and Tournaments live under More */
    ['/matches/','Matches',function(p){return p.startsWith('/matches/');}],
    ['/edges/','StatIQ tips',function(p){return p.startsWith('/edges/');}],
    ['/footballiq/','FootballIQ stats',function(p){return p.startsWith('/footballiq/')||p.startsWith('/player/')||p.startsWith('/clubs/');}],
    ['/analysis/','Analysis',function(p){return p.startsWith('/analysis/');}]
  ];
  var SVG='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';

  function removeFloatingRail(){
    var all=document.querySelectorAll('button,div');
    all.forEach(function(el){
      var s=el.style;
      var z=parseInt(s.zIndex||'0',10);
      if((s.position==='fixed'&&s.left==='0px'&&z>=90&&z<=99)||z===95)el.remove();
    });
  }

  function build(){
    if(document.getElementById('dnav')||!document.body)return;
    removeFloatingRail();
    
    var p=location.pathname;
    var h='<nav id="dnav" aria-label="Main">'
      +'<a class="dn-brand" href="/"><b>90Min</b><i>Waffle</i><span class="dn-beta">BETA</span></a>'
      +'<div class="dn-links">';
    ITEMS.forEach(function(it){h+='<a href="'+it[0]+'"'+(it[2](p)?' class="active"':'')+'>'+it[1]+'</a>';});
 /* DNMORE_20261017: More menu - Explore + the news feeds the old side panel had */
 var EXPLORE=[['/weekend/','Weekend'],['/tournaments/','Tournaments'],['/nations/','Nations'],['/analysis/match/','Match reports'],['/analysis/league/','League stats'],['/me/','My profile'],['/about/','About'],['#','Search']];
 var FEEDS=[['internationals','International football'],['hot-takes','Hot takes'], /* NAVNEWS_20261023 */['transfers','Transfers'],['for-you','For You'],['match-day','Match Day'],['premier-league','Premier League'],['championship','Championship'],['european-cups','European Cups'],['european-leagues','European Leagues'],['scottish-football','Scottish Football'],['womens-football',"Women's Football"],['domestic-trophies','Domestic Trophies'],['injuries','Injuries'],['managers','Managers'],['stars-legends','Stars & Legends'],['off-pitch','Off Pitch']];
 h+='<div class="dn-more"><button type="button" class="dn-more-btn" aria-haspopup="true" aria-expanded="false">More <span aria-hidden="true">&#9662;</span></button><div class="dn-menu" role="menu"><div class="dn-col"><div class="dn-h">Explore</div>';
 EXPLORE.forEach(function(e){h+=e[1]==='Search'?'<a href="#" data-search="1">Search</a>':'<a href="'+e[0]+'">'+e[1]+'</a>';});
 h+='</div><div class="dn-col dn-feeds"><div class="dn-h">News feeds</div>';
 FEEDS.forEach(function(e){h+='<a href="/news/'+e[0]+'/">'+e[1]+'</a>';});
 h+='</div></div></div>';
    h+='</div><div class="dn-right">'
      +'<button class="dn-icon" id="dn-search" aria-label="Search" type="button">'+SVG+'<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg></button>'
      +'<div class="dn-ex"><button type="button" class="dn-exb" aria-expanded="false" aria-controls="dn-exp">Explore</button><nav class="dn-exp" id="dn-exp" aria-label="Explore 90minWaffle" hidden><a href="/edges/"><b>StatIQ</b><span>Betting tips at real prices, every result shown</span></a><a href="/footballiq/"><b>FootballIQ</b><span>Free match predictions, stats and tools</span></a><a href="/preview/"><b>Match previews</b><span>Win %, both teams to score and likely score for every game</span></a><a href="/matches/"><b>Scores and fixtures</b><span>Live scores, today\'s games and results</span></a><a href="/tournaments/ucl/"><b>Tournaments</b><span>Champions League table, fixtures and squads</span></a><a href="/analysis/"><b>Analysis</b><span>Data reports from live stats, every day</span></a><a href="/weekly-reports/"><b>Weekly reports</b><span>The full record and how we count it</span></a><a href="/footballiq/guides/"><b>Guides</b><span>BTTS, over 2.5, odds and xG explained</span></a><a href="/me/"><b>Your profile</b><span>Follow your club, predictions and trophies</span></a></nav></div>'  /* DN_EXPLORE_20261025 */
      +'<a class="dn-icon'+(p.startsWith('/me/')?' active':'')+'" href="/me/" aria-label="Me">'+SVG+'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></a>'
      +'</div></nav>';
    document.body.insertAdjacentHTML('afterbegin',h);
    /* DN_EXPLORE_20261025: open/close the Explore panel (click, Escape, click outside) */
    (function(){
      var b=document.querySelector('.dn-exb'), pn=document.getElementById('dn-exp'); if(!b||!pn) return;
      if(!document.getElementById('dn-ex-css')) document.head.insertAdjacentHTML('beforeend','<style id="dn-ex-css">'
        +'.dn-ex{position:relative}.dn-exb{background:none;border:1px solid rgba(34,211,238,.35);color:#e6edf5;font:inherit;font-size:14px;padding:6px 12px;border-radius:8px;cursor:pointer;min-height:36px}'
        +'.dn-exb:hover,.dn-exb[aria-expanded="true"]{border-color:#22d3ee;color:#22d3ee}.dn-exb:focus-visible{outline:2px solid #22d3ee;outline-offset:2px}'
        +'.dn-exp{position:absolute;right:0;top:calc(100% + 8px);width:520px;display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:10px;background:#0f1a2e;'
        +'border:1px solid rgba(34,211,238,.35);border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.45);z-index:9999}.dn-exp[hidden]{display:none}'
        +'.dn-exp a{display:block;padding:10px 12px;border-radius:8px;text-decoration:none;color:#e6edf5}.dn-exp a:hover,.dn-exp a:focus-visible{background:rgba(34,211,238,.1);outline:none}'
        +'.dn-exp b{display:block;font-size:14px;color:#22d3ee}.dn-exp span{display:block;font-size:12px;color:#9fb1c7;margin-top:2px;line-height:1.35}</style>');
      function set(o){ pn.hidden=!o; b.setAttribute('aria-expanded',o?'true':'false'); if(o){ var f=pn.querySelector('a'); if(f) f.focus(); } }
      b.addEventListener('click',function(e){ e.stopPropagation(); set(pn.hidden); });
      document.addEventListener('click',function(e){ if(!pn.hidden && !pn.contains(e.target)) set(false); });
      document.addEventListener('keydown',function(e){ if(e.key==='Escape' && !pn.hidden){ set(false); b.focus(); } });
    })();
 var mb=document.querySelector('#dnav .dn-more');   /* DNMORE events */
 if(mb){var bt=mb.querySelector('.dn-more-btn');
  bt.addEventListener('click',function(e){e.stopPropagation();var o=mb.classList.toggle('open');bt.setAttribute('aria-expanded',o?'true':'false');});
  document.addEventListener('click',function(e){if(!mb.contains(e.target))mb.classList.remove('open');});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')mb.classList.remove('open');});
  Array.prototype.forEach.call(mb.querySelectorAll('[data-feed]'),function(a){a.addEventListener('click',function(e){var sl=a.getAttribute('data-feed');try{localStorage.setItem('waffle_section_v1',sl);}catch(x){}
   if((location.pathname==='/'||location.pathname==='/index.html')&&typeof window.setSection==='function'){e.preventDefault();mb.classList.remove('open');window.setSection(sl);window.scrollTo(0,0);}});});
  var sb=mb.querySelector('[data-search]');if(sb)sb.addEventListener('click',function(e){e.preventDefault();mb.classList.remove('open');if(window.__gsOpen)window.__gsOpen();});
 }


    var searchBtn=document.getElementById('dn-search');
    if(searchBtn)searchBtn.addEventListener('click',function(){if(window.__gsOpen)window.__gsOpen();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);
  else build();
})();

/* MOBILE — FULLY UNTOUCHED, NO BLOCKING */
(function(){
  if(window.matchMedia('(max-width: 1023px)').matches&&!window.__mnLoad){
    window.__mnLoad=1;
    if(!document.querySelector('script[src*="mobile-nav.js"]')){
      var l=document.createElement('link');l.rel='stylesheet';l.href='/css/mobile-nav.css?v=3';document.head.appendChild(l);
      var s=document.createElement('script');s.src='/js/mobile-nav.js?v=5';document.head.appendChild(s);
    }
  }
})();
(function(){if(!document.querySelector('script[src*="nation-link.js"]')){var s=document.createElement('script');s.src='/js/nation-link.js?v=1';document.head.appendChild(s);}})();
;(function(){if(!window.matchMedia('(max-width:768px)').matches)return;var l=document.createElement('link');l.rel='stylesheet';l.href='/css/m-topbar.css?v=1';document.head.appendChild(l);var s=document.createElement('script');s.src='/js/m-topbar.js?v=1';document.head.appendChild(s);})();
;(function(){if(!window.matchMedia('(max-width:1023px)').matches)return;var l=document.createElement('link');l.rel='stylesheet';l.href='/css/m-more.css?v=1';document.head.appendChild(l);var s=document.createElement('script');s.src='/js/m-more.js?v=1';document.head.appendChild(s);})();

/* BACKFIX_20261017: card Back buttons return to the page you came from (fixed address only if opened directly) */
(function(){document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a.fxh-back,.fxh-back,a[data-back]');if(!a)return;
var r=document.referrer;if(r&&r.indexOf(location.origin)===0&&r.split('#')[0]!==location.href.split('#')[0]&&history.length>1){e.preventDefault();history.back();}},true);})();

/* BETALINK_20261024 v2: BETA in either header opens /beta/, plus a footer link next to About */
(function () {
  function link(el) { if (el.getAttribute('data-bl')) return; el.setAttribute('data-bl', '1'); el.title = 'What BETA means'; el.style.cursor = 'pointer';
    el.setAttribute('role', 'link'); el.tabIndex = 0; function o(e) { e.preventDefault(); e.stopPropagation(); location.href = '/beta/'; }
    el.addEventListener('click', o); el.addEventListener('keydown', function (e) { if (e.key === 'Enter') o(e); }); }
  function go() {
    [].forEach.call(document.querySelectorAll('.staging-badge,.nmw-beta'), link);
    [].forEach.call(document.querySelectorAll('header *, nav *, [class*=header] *, [class*=dn-] *, [class*=brand] *'), function (e) { if (!e.children.length && (e.textContent || '').trim() === 'BETA') link(e); });  // BETALINK_ANY
    [].forEach.call(document.querySelectorAll('.header-center,.header-row,header'), function (h) {   // the phone header writes BETA as plain text
      [].forEach.call(h.childNodes, function (n) { if (n.nodeType === 3 && /\bBETA\b/.test(n.textContent)) {
        var parts = n.textContent.split('BETA'), sp = document.createElement('span'); sp.className = 'beta-text-link'; sp.textContent = 'BETA'; sp.style.color = 'inherit';
        n.parentNode.insertBefore(document.createTextNode(parts[0]), n); n.parentNode.insertBefore(sp, n); n.textContent = parts.slice(1).join('BETA'); link(sp); } });
    });
    if (false) {  /* footer link now lives in social-footer.js */
      var a = [].filter.call(document.querySelectorAll('footer a[href="/about/"], .site-footer a[href="/about/"], [class*=footer] a[href="/about/"]'), function (x) { return x.offsetParent !== null || true; })[0];
      if (a) { var c = a.cloneNode(false); c.href = '/beta/'; c.className = (a.className ? a.className + ' ' : '') + 'beta-foot'; c.textContent = 'What BETA means'; a.parentNode.insertBefore(c, a.nextSibling);
        if (a.nextSibling && a.previousSibling && a.previousSibling.nodeType === 3 && /[·|]/.test(a.previousSibling.textContent)) a.parentNode.insertBefore(document.createTextNode(a.previousSibling.textContent), c); }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  setTimeout(go, 1500); setTimeout(go, 4000);
})();

/* BETALINK_TAP: on phones the header row sits on top of the badge, so catch taps by position instead */
document.addEventListener('click', function (e) {
  var hit = [].some.call(document.querySelectorAll('[data-bl]'), function (b) { var r = b.getBoundingClientRect();
    return r.width && e.clientX >= r.left - 4 && e.clientX <= r.right + 4 && e.clientY >= r.top - 4 && e.clientY <= r.bottom + 4; });
  if (hit) { e.preventDefault(); e.stopPropagation(); location.href = '/beta/'; }
}, true);

/* BETALINK_FOOTLI: the footer link gets its own line under About */
(function () { function fix() { [].forEach.call(document.querySelectorAll('a.beta-foot'), function (a) { var li = a.parentNode;
  if (!li || li.tagName !== 'LI' || li.children.length < 2) return;
  var n = document.createElement('li'); n.className = li.className; li.parentNode.insertBefore(n, li.nextSibling); n.appendChild(a);
  [].forEach.call(li.childNodes, function (t) { if (t.nodeType === 3 && /^[\s·|]*$/.test(t.textContent)) t.textContent = ''; }); }); }
  setTimeout(fix, 1600); setTimeout(fix, 4100); })();

/* VITALS_20261025: real-visitor page speed -> Umami events (LCP, INP, CLS). No library, nothing personal. */
(function(){
  if(window.__nmwVitals||!('PerformanceObserver' in window))return; window.__nmwVitals=1;
  var V={}, sent=0, T={LCP:[2500,4000],INP:[200,500],CLS:[0.1,0.25]};
  function obs(type,cb,x){try{var o=new PerformanceObserver(function(l){l.getEntries().forEach(cb);});var opt={type:type,buffered:true};if(x)for(var k in x)opt[k]=x[k];o.observe(opt);return 1;}catch(e){return 0;}}
  var fh=document.visibilityState==='hidden'?0:Infinity;/* VITALS2_20261030: ignore time the page sat hidden in a background tab (Google's rule) */addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')fh=Math.min(fh,performance.now());},true);var act=((performance.getEntriesByType&&performance.getEntriesByType('navigation')[0])||{}).activationStart||0;obs('largest-contentful-paint',function(e){if(e.startTime<fh)V.LCP=Math.max(0,e.startTime-act);});
  var cls=0,ses=0,last=0,first=0;
  if(obs('layout-shift',function(e){if(e.hadRecentInput)return;if(ses&&e.startTime-last<1000&&e.startTime-first<5000){ses+=e.value;}else{ses=e.value;first=e.startTime;}last=e.startTime;if(ses>cls)cls=ses;V.CLS=cls;}))V.CLS=0;
  obs('event',function(e){if(e.interactionId&&(!V.INP||e.duration>V.INP))V.INP=e.duration;},{durationThreshold:40});
  function send(){
    if(sent)return; var u=window.umami; if(!u||!u.track)return; sent=1;
    var sec=(location.pathname.split('/')[1]||'home'), dev=(window.innerWidth<768?'mobile':'desktop');
    for(var m in V){var v=V[m]; if(v==null)continue; var r=v<=T[m][0]?'good':(v<=T[m][1]?'ok':'poor');
      try{u.track('vitals-'+m,{value:Math.round(m==='CLS'?v*1000:v),rating:r,section:sec,device:dev,ver:2});}catch(e){}}
  }
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')send();});
  addEventListener('pagehide',send);
})();

/* NOTIF_DEEPLINK_20261025: notification taps land on the exact page; #section links wait for script-built sections */
(function(){
  if('serviceWorker' in navigator){navigator.serviceWorker.addEventListener('message',function(e){var d=e.data||{};if(d.type==='nmw-open'&&d.url){try{var u=new URL(d.url,location.origin);if(u.origin===location.origin&&u.href!==location.href)location.href=u.href;}catch(x){}}});}
  var h=location.hash;if(!h||h.length<2||!/^#[A-Za-z][\w-]*$/.test(h))return;var n=0;
  var t=setInterval(function(){var el=document.querySelector(h);if(el){clearInterval(t);if(el.tagName==='DETAILS')el.open=true;if(!el.offsetParent&&el.parentElement)el=el.parentElement;el.scrollIntoView({block:'start'});}else if(++n>30)clearInterval(t);},150);
})();

/* PREV_ONCE_20261030: opening a match preview from anywhere marks it read for the Me page to-do */
(function(){try{var m=location.pathname.match(/^\/preview\/[^\/]+\/$/);if(m)localStorage.setItem('nmw_mh_prev_'+m[0],'1');}catch(e){}})();

/* NAVBAR_20261030: thin progress bar the moment a link is tapped, so a page change never feels like nothing happened */
(function(){
  if(window.__nmwBar)return;window.__nmwBar=1;
  var b=document.createElement('div');b.setAttribute('aria-hidden','true');
  b.style.cssText='position:fixed;top:0;left:0;height:3px;width:0;background:#22D3EE;z-index:99999;opacity:0;transition:width 8s cubic-bezier(.1,.7,.1,1),opacity .2s;pointer-events:none';
  function go(){if(!b.parentNode)document.body.appendChild(b);b.style.transition='none';b.style.width='0';b.style.opacity='1';void b.offsetWidth;b.style.transition='width 8s cubic-bezier(.1,.7,.1,1),opacity .2s';b.style.width='85%';}
  function stop(){b.style.opacity='0';b.style.width='0';}
  document.addEventListener('click',function(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
    var h=a.getAttribute('href');if(!h||h.charAt(0)==='#'||/^(mailto|tel|javascript):/i.test(h))return;
    try{var u=new URL(h,location.href);if(u.origin!==location.origin||(u.pathname===location.pathname&&u.search===location.search))return;}catch(x){return;}go();},false);
  addEventListener('pageshow',stop);addEventListener('pagehide',stop);
})();

/* MAILPANEL_20261030: email links open a small panel with the address + Copy, so Contact works without an email app */
(function(){
  if(window.__nmwMail)return;window.__nmwMail=1;
  function panel(addr,href){
    var o=document.getElementById('nmw-mail');if(o)o.remove();
    o=document.createElement('div');o.id='nmw-mail';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Contact 90minWaffle');
    o.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(5,9,18,.7);display:flex;align-items:center;justify-content:center;padding:16px';
    o.innerHTML='<div style="background:#111A2E;border:1px solid #1E2A44;border-radius:16px;padding:22px;max-width:380px;width:100%;color:#E8EDF5;font:16px/1.5 Inter,system-ui,sans-serif">'+
      '<div style="font-weight:700;font-size:18px;margin-bottom:6px">Contact us</div><div style="color:#A9B4C6;font-size:15px;margin-bottom:14px">Email us at</div>'+
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b id="nmw-mail-a" style="font-size:17px;word-break:break-all">'+addr+'</b>'+
      '<button type="button" id="nmw-mail-c" style="min-height:44px;padding:0 16px;border-radius:10px;border:0;background:#22D3EE;color:#062029;font-weight:700;cursor:pointer">Copy</button></div>'+
      '<div style="display:flex;justify-content:space-between;margin-top:16px;gap:12px"><a href="'+href+'" style="color:#7FE3F2;font-weight:600;min-height:44px;display:inline-flex;align-items:center">Open email app</a>'+
      '<button type="button" id="nmw-mail-x" style="min-height:44px;padding:0 14px;border-radius:10px;border:1px solid #2A3756;background:transparent;color:#E8EDF5;cursor:pointer">Close</button></div></div>';
    document.body.appendChild(o);
    var c=document.getElementById('nmw-mail-c');c.focus();
    c.onclick=function(){var done=function(){c.textContent='Copied';};try{navigator.clipboard.writeText(addr).then(done,function(){prompt('Copy the address:',addr);});}catch(e){prompt('Copy the address:',addr);}};
    function close(){o.remove();}document.getElementById('nmw-mail-x').onclick=close;o.addEventListener('click',function(e){if(e.target===o)close();});
    o.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  }
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="mailto:"]');if(!a)return;
    var href=a.getAttribute('href'),addr=decodeURIComponent(href.slice(7).split('?')[0]);if(!addr)return;e.preventDefault();panel(addr,href);},true);
})();
