/* MOBILE_NAV_20261015 */ /* NAVME_20261023: Me in the bottom bar; everything from More moves to a menu button in the header */
(function(){
  if(!window.matchMedia('(max-width:1023px)').matches)return;
  function ic(d){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';}
  var p=location.pathname.replace(/\/+$/,'')||'/';
  var TABS=[
    ['/','Home',/^\/(index\.html)?$/,'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'],
    ['/edges/','Tips',/^\/edges/,'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>'],
    ['/matches/','Scores',/^\/matches/,'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'],
    ['/footballiq/','Stats',/^\/(footballiq|player|clubs?)(\/|$)/,'<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>'],
    ['/me/','Me',/^\/me(\/|$)/,'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>']
  ];
  var MORE=[ /* NAVNEWS_20261023: News group first, then Explore */
    ['#News'],
    ['Latest news','/news/','<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><line x1="8" y1="8" x2="13" y2="8"/><line x1="8" y1="12" x2="13" y2="12"/>'],
    ['For you','/news/for-you/','<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><line x1="8" y1="8" x2="13" y2="8"/><line x1="8" y1="12" x2="13" y2="12"/>'],
    ['Transfers','/news/transfers/','<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><line x1="8" y1="8" x2="13" y2="8"/><line x1="8" y1="12" x2="13" y2="12"/>'],
    ['Injuries','/news/injuries/','<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><line x1="8" y1="8" x2="13" y2="8"/><line x1="8" y1="12" x2="13" y2="12"/>'],
    ['Match day','/news/match-day/','<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><line x1="8" y1="8" x2="13" y2="8"/><line x1="8" y1="12" x2="13" y2="12"/>'],
    ['Premier League','/news/premier-league/','<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><line x1="8" y1="8" x2="13" y2="8"/><line x1="8" y1="12" x2="13" y2="12"/>'],
    ['Scottish football','/news/scottish-football/','<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><line x1="8" y1="8" x2="13" y2="8"/><line x1="8" y1="12" x2="13" y2="12"/>'],
    ['Women\'s football','/news/womens-football/','<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><line x1="8" y1="8" x2="13" y2="8"/><line x1="8" y1="12" x2="13" y2="12"/>'],
    ['Off the pitch','/news/off-pitch/','<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><line x1="8" y1="8" x2="13" y2="8"/><line x1="8" y1="12" x2="13" y2="12"/>'],
    ['All sections','/news/#sections','<path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><line x1="8" y1="8" x2="13" y2="8"/><line x1="8" y1="12" x2="13" y2="12"/>'],
    ['#Explore'],
    ['Search',null,'<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>'],
    ['Tournaments','/tournaments/','<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/>'],
    ['Analysis','/analysis/','<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'],
    ['Match reports','/analysis/match/','<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>'],
    ['League stats','/analysis/league/','<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>'],
    ['Nations','/nations/','<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>'],
    ['Weekend','/weekend/','<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'],  // WEEKEND_HUB_20261018
    ['Corrections','/corrections/','<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'],
    ['About','/about/','<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'],
    ['Free Telegram alerts','https://t.me/ninetyminwafflebets','<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>']
  ];
  function openSearch(){
    if(typeof window.__gsOpen==='function'){window.__gsOpen();return;}
    var t=document.getElementById('gsTrigger')||document.getElementById('dn-search');
    if(t){t.click();return;}
    var j=document.createElement('script');j.src='/js/search.js';
    j.onload=function(){setTimeout(function(){if(typeof window.__gsOpen==='function')window.__gsOpen();},200);};
    document.head.appendChild(j);
  }
  var trig=null;
  function close(){document.body.classList.remove('mn-open');if(trig){trig.setAttribute('aria-expanded','false');}}
  function open(){document.body.classList.add('mn-open');if(trig)trig.setAttribute('aria-expanded','true');var f=document.querySelector('#mn-sheet a,#mn-sheet button');if(f)setTimeout(function(){f.focus();},60);}
  function toggle(e){if(e){e.preventDefault();e.stopImmediatePropagation();}if(document.body.classList.contains('mn-open')){close();if(trig)trig.focus();}else open();}
  function todayKey(){try{return 'nmw_poll_vote_daily-'+new Date().toLocaleDateString('en-CA',{timeZone:'Europe/London'});}catch(e){return '';}}
  function waiting(){try{var k=todayKey();return !!k&&!localStorage.getItem(k);}catch(e){return false;}}
  function topRow(){
    var c=document.querySelectorAll('header,[class*="header"],[class*="topbar"],[class*="-top"],[class*="hd"]');
    for(var i=0;i<c.length;i++){var e=c[i];if(e.closest('#mn-sheet,nav.bottom-nav')||e.offsetParent===null)continue;
      var r=e.getBoundingClientRect(),cs=getComputedStyle(e);
      if(r.top>=-1&&r.top<100&&r.height>=28&&r.height<=170&&r.width>=200&&cs.display.indexOf('flex')>=0&&cs.flexDirection.indexOf('row')===0&&cs.flexWrap!=='wrap')return e;}
    return null;
  }
  function menuButton(){
    var bb=document.getElementById('burgerBtn');
    if(bb&&bb.offsetParent!==null){bb.addEventListener('click',toggle,true);bb.setAttribute('aria-label','Menu');bb.setAttribute('aria-controls','mn-sheet');bb.setAttribute('aria-expanded','false');return bb;}
    var b=document.createElement('button');b.type='button';b.className='mn-burger';b.setAttribute('aria-label','Menu');b.setAttribute('aria-controls','mn-sheet');b.setAttribute('aria-expanded','false');
    b.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    var host=document.querySelector('.header .header-row')||document.querySelector('header.fxh')||topRow(); /* NAVME_HOST2: any row-style header at the top of the page */
    if(host){b.style.cssText='width:44px;height:44px;flex:0 0 44px;display:inline-flex;align-items:center;justify-content:center;background:none;border:0;color:inherit;padding:0;margin-right:4px;cursor:pointer';host.insertBefore(b,host.firstChild);}
    else{b.style.cssText='position:fixed;top:10px;left:10px;z-index:1000;width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;background:#0A1020;border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#E6EDF6;cursor:pointer';document.body.appendChild(b);}
    b.addEventListener('click',toggle);return b;
  }
  function build(){
    var nav=document.querySelector('nav.bottom-nav');
    if(!nav||nav.getAttribute('data-m'))return !!(nav&&nav.getAttribute('data-m'));
    var h='';
    TABS.forEach(function(t){
      var on=t[2].test(p),dot=(t[0]==='/me/'&&waiting());
      h+='<a class="nav-item'+(on?' active':'')+'" href="'+t[0]+'" style="position:relative"'+(on?' aria-current="page"':'')+(dot?' aria-label="Me, today\'s poll is waiting"':'')+'>'+ic(t[3])+'<span>'+t[1]+'</span>'+
        (dot?'<span class="mn-dot" aria-hidden="true" style="position:absolute;top:6px;left:calc(50% + 6px);width:8px;height:8px;border-radius:50%;background:#3DDC84"></span>':'')+'</a>';
    });
    nav.innerHTML=h;nav.setAttribute('data-m','1');nav.setAttribute('aria-label','Main');document.body.classList.add('has-mn');
    var back=document.createElement('div');back.id='mn-back';
    var sh=document.createElement('div');sh.id='mn-sheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-label','Menu');
    var g='<div class="mn-grab"></div><div class="mn-grid">';
    MORE.forEach(function(m){if(m[0].charAt(0)==='#'){g+='<div class="mn-h" role="heading" aria-level="2" style="grid-column:1/-1;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#94A3B8;padding:10px 4px 2px">'+m[0].slice(1)+'</div>';return;}g+=m[1]?'<a href="'+m[1]+'"'+(m[1].indexOf('http')===0?' rel="noopener"':'')+'>'+ic(m[2])+m[0]+'</a>':'<button type="button" data-s="1">'+ic(m[2])+m[0]+'</button>';});
    sh.innerHTML=g+'</div>';
    document.body.appendChild(back);document.body.appendChild(sh);
    trig=menuButton();
    back.addEventListener('click',close);
    sh.addEventListener('click',function(e){var b=e.target.closest('[data-s]');if(b){close();setTimeout(openSearch,260);}});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('mn-open')){close();if(trig)trig.focus();}});
    return true;
  }
  function go(){var n=0;(function t(){if(build())return;if(n++>8&&!document.querySelector('nav.bottom-nav')&&document.body){var x=document.createElement('nav');x.className='bottom-nav';document.body.appendChild(x);}if(n>25)return;setTimeout(t,150);})();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
/* MENUS_20261030 phone bar: Tips, Stats */
