/* LINKUP_20261017 v2 - every old player / club / match link goes to its clean address */
(function(){
  if(window.__nmwLU)return;window.__nmwLU=1;
  var MAP=null,loading=false,CV=null;
  function lk(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(' ').filter(function(w){return w&&w!=='fc'&&w!=='afc'&&w!=='cf';}).join(' ');}
  function q(h,k){var m=h.match(new RegExp('[?&]'+k+'=([^&#]+)'));return m?decodeURIComponent(m[1].replace(/\+/g,' ')):null;}
  function target(h){
    if(h.indexOf('/matches/match/#')===0){var id=h.slice(16);return id?'/matches/match/?id='+id:null;}
    if(!MAP)return null;
    if(h.indexOf('/player/?')===0){var id2=q(h,'id');if(id2&&MAP.id[id2])return MAP.id[id2];var n=q(h,'name');if(n)return MAP.n[lk(n)];}
    if(h.indexOf('/club/?')===0){
      var c=q(h,'name');if(c&&MAP.c[lk(c)])return MAP.c[lk(c)];
      var s=q(h,'slug');if(s){if(!CV){CV={};for(var k in MAP.c)CV[MAP.c[k]]=1;}var u='/clubs/'+s+'/';if(CV[u])return u;}
    }
    if(h.indexOf('/tournaments/ucl/team/')===0){var t=h.split('/')[4];if(t){var v=MAP.c[lk(decodeURIComponent(t).replace(/-/g,' '))];if(v)return v;}}
    return null;
  }
  function fix(){
    var as=document.querySelectorAll('a[href^="/player/?"],a[href^="/club/?"],a[href^="/tournaments/ucl/team/"],a[href^="/matches/match/#"]');
    if(!as.length)return;
    var need=false;
    for(var i=0;i<as.length;i++){
      var h=as[i].getAttribute('href')||'',t=target(h);
      if(t)as[i].setAttribute('href',t);else if(!MAP&&h.indexOf('/matches/match/#')!==0)need=true;
    }
    if(need)load();
  }
  function load(){
    if(loading)return;loading=true;
    fetch('/data/player_paths.json?h='+Math.floor(Date.now()/3600000)).then(function(r){return r.json();}).then(function(j){MAP=j;fix();}).catch(function(){});
  }
  var tm=null;
  function soon(){clearTimeout(tm);tm=setTimeout(fix,60);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix);else fix();
  try{new MutationObserver(soon).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
})();
