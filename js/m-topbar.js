(function(){
if(!window.matchMedia('(max-width:768px)').matches)return;
var BELL='<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
function onMe(){return location.pathname.indexOf('/me')===0;}
function goAlerts(n){   // NMW_BELL_20261024: open the Settings tab first
var tb=document.querySelector('[data-tab=settings]');if(tb&&!tb.__nmwb){tb.__nmwb=1;tb.click();}
var d=document.getElementById('push-info-detail');
var row=d&&(d.closest('.setting-row')||d);
if(row){row.scrollIntoView({behavior:'smooth',block:'center'});row.style.transition='box-shadow .4s';row.style.boxShadow='0 0 0 2px var(--accent)';setTimeout(function(){row.style.boxShadow='';},1800);return;}
if((n||0)<20)setTimeout(function(){goAlerts((n||0)+1);},300);
}
function fit(){
var h=document.querySelector('.header');if(!h)return;
var px=Math.ceil(h.getBoundingClientRect().height);if(!px)return;
var st=document.documentElement.style;
st.setProperty('--header-h',px+'px','important');
st.setProperty('--hdr-h',px+'px','important');
}
function init(){
var row=document.querySelector('.header .header-row');
if(row&&!row.querySelector('.m-bell')){
var a=document.createElement('a');
a.className='m-hb m-bell';a.href='/me/#alerts';a.setAttribute('aria-label','Notification settings');a.title='Notification settings';a.innerHTML=BELL;try{if(!document.getElementById('nmwb-css')){var bs=document.createElement('style');bs.id='nmwb-css';bs.textContent='.m-bell{position:relative}.m-bell.m-bell-on::after{content:"";position:absolute;top:5px;right:5px;width:8px;height:8px;border-radius:50%;background:#22d3ee;box-shadow:0 0 0 2px #0b1220}';document.head.appendChild(bs);}navigator.serviceWorker&&navigator.serviceWorker.getRegistration().then(function(r){return r&&r.pushManager&&r.pushManager.getSubscription();}).then(function(x){if(x){a.classList.add('m-bell-on');a.setAttribute('aria-label','Notifications on - settings');}}).catch(function(){});}catch(x){}
a.addEventListener('click',function(e){if(onMe()){e.preventDefault();try{history.replaceState(null,'','/me/#alerts');}catch(x){}goAlerts(0);}});
var gs=document.getElementById('gsTrigger');
if(gs&&gs.parentNode===row)gs.insertAdjacentElement('afterend',a);else row.appendChild(a);
}
fit();setTimeout(fit,300);setTimeout(fit,1200);
window.addEventListener('resize',fit);
window.addEventListener('orientationchange',function(){setTimeout(fit,200);});
if(onMe()&&location.hash==='#alerts')goAlerts(0);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
