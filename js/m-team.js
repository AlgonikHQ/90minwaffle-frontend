(function(){
if(!window.matchMedia('(max-width:768px)').matches)return;
var KEYS=[['nmw_followed_team','Club'],['nmw_followed_country','Country']];
var DATA=null,wrap=null;
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ls(k){try{return localStorage.getItem(k)||'';}catch(e){return '';}}
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\b(fc|afc|cf|sc|the)\b/g,'').replace(/[^a-z0-9]/g,'');}
function tm(n,c,loose){var a=norm(n),b=norm(c);if(!a||!b)return false;if(a===b)return true;return !!loose&&Math.min(a.length,b.length)>=6&&(a.indexOf(b)>-1||b.indexOf(a)>-1);}
function involving(l,n,loose){return (l||[]).filter(function(f){return tm(n,f.home,loose)||tm(n,f.away,loose);});}
function find(l,n){var r=involving(l,n,false);return r.length?r:involving(l,n,true);}
function isHome(f,n){return tm(n,f.home,false)||(!tm(n,f.away,false)&&tm(n,f.home,true));}
function ts(f){return Date.parse(f.kickoff_utc||f.date||'')||0;}
function ord(n){var s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}
function when(f){var d=new Date(f.kickoff_utc);if(isNaN(d))return f.date_label||'';return (f.date_label||d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',timeZone:'Europe/London'}))+' \u00b7 '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/London'});}
function crest(n){var h='';try{if(typeof window.badgeImg==='function')h=window.badgeImg(n,36);}catch(e){}if(typeof h==='string'&&h.indexOf('<img')>-1)return '<span class="mt-crest">'+h+'</span>';return '<span class="mt-crest mt-ini">'+esc(n.replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase())+'</span>';}
function standing(n){var L=(DATA&&DATA.standings)||[];for(var p=0;p<2;p++){for(var i=0;i<L.length;i++){var T=L[i].teams||[];for(var j=0;j<T.length;j++){if(tm(n,T[j].team,p===1))return {pos:T[j].position,pts:T[j].points,lg:L[i].league};}}}return null;}
function formOf(n){var F=(DATA&&DATA.form)||[];for(var p=0;p<2;p++){for(var i=0;i<F.length;i++){if(tm(n,F[i].team,p===1))return F[i].last5||[];}}return [];}
function block(key,kind,n){
var st=standing(n),fm=formOf(n).slice(-5),fx=null,last=null,live=null;
if(DATA){live=find(DATA.live,n)[0]||null;fx=find(DATA.upcoming,n).sort(function(a,b){return ts(a)-ts(b);})[0]||null;last=find(DATA.results,n).sort(function(a,b){return ts(b)-ts(a);})[0]||null;}
var h='<div class="mt-block"><div class="mt-top">'+crest(n)+'<div class="mt-id"><div class="mt-kind">'+kind+'</div><div class="mt-name">'+esc(n)+'</div>'+(st?'<div class="mt-sub">'+ord(st.pos)+' \u00b7 '+esc(st.lg)+' \u00b7 '+st.pts+' pts</div>':'')+'</div><button type="button" class="mt-unf" data-key="'+key+'" data-name="'+esc(n)+'">Unfollow</button></div>';
if(fm.length)h+='<div class="mt-form">'+fm.map(function(r){r=String(r).toUpperCase();return '<i class="mt-d '+(r==='W'||r==='D'?r:'L')+'">'+esc(r)+'</i>';}).join('')+'</div>';
var href='/matches/?team='+encodeURIComponent(n);
if(live){var lh=isHome(live,n);h+='<a class="mt-row" href="'+href+'"><span class="mt-k mt-live">Live</span><span class="mt-m">'+(lh?'vs ':'at ')+esc(lh?live.away:live.home)+'</span><span class="mt-w">'+(live.home_score||0)+'-'+(live.away_score||0)+(live.minute?' \u00b7 '+live.minute+"'":'')+'</span></a>';}
else if(fx){var fh=isHome(fx,n);h+='<a class="mt-row" href="'+href+'"><span class="mt-k">Next</span><span class="mt-m">'+(fh?'vs ':'at ')+esc(fh?fx.away:fx.home)+'</span><span class="mt-w">'+esc(when(fx))+'</span></a>';}
if(last&&last.home_score!=null){var h2=isHome(last,n),gf=h2?last.home_score:last.away_score,ga=h2?last.away_score:last.home_score,rs=gf>ga?'W':gf<ga?'L':'D';h+='<div class="mt-row"><span class="mt-k">Last</span><span class="mt-m">'+rs+' '+gf+'-'+ga+' '+(h2?'vs ':'at ')+esc(h2?last.away:last.home)+'</span></div>';}
return h+'</div>';
}
function paint(){
if(!wrap)return;
var h='';
KEYS.forEach(function(k){var n=ls(k[0]);if(n)h+=block(k[0],k[1],n);});
wrap.innerHTML=h||'<div class="mt-block mt-empty"><div class="mt-et">Follow your team</div><div class="mt-es">See their fixtures and form here, and get their news across the site.</div><a class="mt-cta" href="/?ob=reset">Choose club &amp; country</a></div>';
}
function load(){
if(DATA){paint();return;}
fetch('/data/football.json?t='+Math.floor(Date.now()/60000)).then(function(r){return r.json();}).then(function(d){DATA=d;paint();}).catch(function(){});
}
function findHdr(page){var all=page.querySelectorAll('*');for(var i=0;i<all.length;i++){var e=all[i];if(!e.children.length&&/^your club (&|and) country$/i.test(e.textContent.trim()))return e;}return null;}
function build(){
var page=document.getElementById('page');if(!page)return;
var hdr=findHdr(page);if(!hdr||hdr.getAttribute('data-mt'))return;
hdr.setAttribute('data-mt','1');hdr.textContent='My Team';
var n=hdr.nextElementSibling,anchor=hdr;
while(n&&n.classList.contains('card')){n.style.display='none';anchor=n;n=n.nextElementSibling;}
wrap=document.createElement('div');wrap.className='mt-card';
anchor.insertAdjacentElement('afterend',wrap);
wrap.addEventListener('click',function(e){
var b=e.target.closest('.mt-unf');if(!b)return;
if(confirm('Unfollow '+b.getAttribute('data-name')+'?')){try{localStorage.removeItem(b.getAttribute('data-key'));}catch(x){}if(typeof window.renderPage==='function')window.renderPage();else location.reload();}
});
paint();load();
}
var t;function sched(){clearTimeout(t);t=setTimeout(build,80);}
function init(){var page=document.getElementById('page');if(!page)return;new MutationObserver(sched).observe(page,{childList:true,subtree:true});build();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
