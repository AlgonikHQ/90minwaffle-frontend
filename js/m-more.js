(function(){
if(!window.matchMedia('(max-width:1023px)').matches)return;
var G=[['Topics',['for_you','match_day','transfers','injuries','managers','stars_legends','off_pitch']],['Competitions',['premier_league','championship','european_cups','european_leagues','scottish_football','womens_football','domestic_trophies']]];
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function drawerEl(label){
var l=document.getElementById('drawerList');if(!l)return null;
var best=null,len=1e9;
[].forEach.call(l.querySelectorAll('*'),function(e){var t=(e.textContent||'').trim();if(t.indexOf(label)>-1&&t.length<len){best=e;len=t.length;}});
return best;
}
function fire(s,n){
if(typeof window.renderDrawer==='function'){try{window.renderDrawer();}catch(e){}}
var el=drawerEl(s.label);
if(el){el.click();setTimeout(function(){if(typeof window.closeDrawer==='function')window.closeDrawer();},60);return;}
if((n||0)<3){setTimeout(function(){fire(s,(n||0)+1);},250);return;}
location.href=s.href||'/';
}
function build(){
var sh=document.getElementById('mn-sheet');
if(!sh)return false;
if(sh.querySelector('.mn-list'))return true;
var S=window.SIDEBAR_SECTIONS;
if(!S||!S.length)return false;
var by={};S.forEach(function(s){by[s.key]=s;});
var h='';
G.forEach(function(g){
var items=g[1].map(function(k){return by[k];}).filter(Boolean);
if(!items.length)return;
h+='<div class="mn-h">'+g[0]+'</div><div class="mn-list">'+items.map(function(s){return '<button type="button" data-k="'+s.key+'">'+s.icon+'<span>'+esc(s.label)+'</span></button>';}).join('')+'</div>';
});
sh.insertAdjacentHTML('beforeend',h);
sh.addEventListener('click',function(e){
var b=e.target.closest('[data-k]');if(!b)return;
var s=by[b.getAttribute('data-k')];if(!s)return;
document.body.classList.remove('mn-open');fire(s,0);
});
return true;
}
var n=0;(function t(){if(build())return;if(++n<40)setTimeout(t,250);})();
})();
