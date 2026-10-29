(function(){
  var SEL='a[href*="/player/?id="],a[href*="/player/?af_id="],a[href*="/club/?name="]', MAP=null, loading=false, timer=null;
  function apply(){
    var as=document.querySelectorAll(SEL);
    for(var i=0;i<as.length;i++){
      var a=as[i]; if(a.dataset.seoDone||a.classList.contains('cta')) continue; a.dataset.seoDone='1';
      try{
        var u=new URL(a.getAttribute('href'),location.origin), t=null;
        if(u.pathname==='/player/'){ t=MAP.p[u.searchParams.get('id')||u.searchParams.get('af_id')]; }
        else if(u.pathname==='/club/'){ var n=(u.searchParams.get('name')||'').toLowerCase().trim();
          t=MAP.c[n]||MAP.c[n.replace(/\s+(fc|afc|cf)$/,'')]; }
        if(t) a.setAttribute('href',t);
      }catch(e){}
    }
  }
  function run(){
    if(!document.querySelector(SEL)) return;
    if(MAP) return apply();
    if(loading) return; loading=true;
    fetch('/data/seo_links.json').then(function(r){return r.json();}).then(function(j){MAP=j;apply();}).catch(function(){});
  }
  function later(){ clearTimeout(timer); timer=setTimeout(run,250); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
  new MutationObserver(later).observe(document.documentElement,{childList:true,subtree:true});
})();
