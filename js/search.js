/* 90minWaffle Search Engine v4.0 */
(function(){
"use strict";
if(window.__nmwsInit)return;window.__nmwsInit=1;

var INDEX_URL="/data/search_index.json";
var TRENDING_KEY="nmw_search_v4";
var MAX_RESULTS=35;
var CURATED_TRENDING=["Champions League","Mohamed Salah","Cristiano Ronaldo","Argentina","Brazil","England","Real Madrid","Chelsea","H. Kane","E. Haaland"];

var _index=null,_loading=false,_overlay=null,_input=null,_results=null,_pills=null;
var _activeType="all",_lastQuery="",_selectedIdx=-1,_resultItems=[];

function norm(s){
  return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
}

function wordMatch(field,token){
  var words=field.split(" ");
  for(var i=0;i<words.length;i++){
    if(words[i]===token) return "exact";
    if(words[i].indexOf(token)===0) return "starts";
  }
  if(field.indexOf(token)!==-1) return "contains";
  return null;
}

function scoreItem(item,tokens){
  var name=norm(item.name||item.home||"");
  var extra=[
    norm(item.search||""),
    norm(item.team||""),
    norm(item.league_name||""),
    norm(item.position||""),
    norm(item.nationality||""),
    norm(item.away||""),
    norm(item.group||""),
    norm(item.tournament||"")
  ].join(" ");
  var score=0;
  for(var i=0;i<tokens.length;i++){
    var t=tokens[i];
    if(!t) continue;
    var nm=wordMatch(name,t);
    var em=wordMatch(extra,t);
    if(nm==="exact") score+=12;
    else if(nm==="starts") score+=7;
    else if(nm==="contains") score+=4;
    else if(em==="exact") score+=3;
    else if(em==="starts") score+=2;
    else if(em==="contains") score+=1;
    else return 0;
  }
  // Boost clubs and nations over players for short queries
  if(tokens.length<=2){
    if(item.type==="club") score+=3;
    if(item.type==="national_team") score+=2;
    if(item.type==="fixture"&&(item.status==="1H"||item.status==="2H"||item.status==="HT")) score+=5;
  }
  // Live match boost
  if(item.type==="fixture"){
    var st=item.status||"";
    if(st==="1H"||st==="2H"||st==="HT"||st==="ET"||st==="P") score+=10;
    if((item.league||"")==="WC") score+=3;
  }
  return score;
}

function dedup(items){
  var seen={};
  return items.filter(function(item){
    var key=item.type+"|"+norm(item.name||item.home||"");
    if(seen[key]) return false;
    seen[key]=true;
    return true;
  });
}

function loadIndex(cb){
  if(_index){cb(_index);return;}
  if(_loading){var t=setInterval(function(){if(_index){clearInterval(t);cb(_index);}},80);return;}
  _loading=true;
  if(_results) _results.innerHTML='<div class="nmws-loading"><div class="nmws-spinner"></div><span>Loading...</span></div>';
  fetch(INDEX_URL+"?t="+Math.floor(Date.now()/300000)).then(function(r){return r.json();}).then(function(d){
    _index=dedup(d.index||d||[]);
    _loading=false;
    // Update hint counts from actual data
    var counts=d.counts||{};
    window.__nmwsCounts=counts;
    cb(_index);
  }).catch(function(){_loading=false;_index=[];cb(_index);});
}

function doSearch(q,typeFilter){
  if(!_index) return;
  if(!q||!q.trim()){renderTrending();return;}
  var tokens=norm(q).split(" ").filter(function(t){return t.length>0;});
  if(!tokens.length){renderTrending();return;}
  var scored=[];
  for(var i=0;i<_index.length;i++){
    var item=_index[i];
    if(typeFilter!=="all"&&item.type!==typeFilter) continue;
    var s=scoreItem(item,tokens);
    if(s>0) scored.push({item:item,score:s});
  }
  scored.sort(function(a,b){return b.score-a.score;});
  _resultItems=scored.slice(0,MAX_RESULTS).map(function(x){return x.item;});
  _selectedIdx=-1;
  renderResults(_resultItems,q);
}

function typeLabel(t){return{player:"Player",club:"Club",national_team:"Nation",fixture:"Fixture",edge:"StatIQ",analysis:"Analysis",footballiq_stat:"FootballIQ"}[t]||t;}
function typeEmoji(t){return{player:"👤",club:"⚽",national_team:"🌍",fixture:"📅",edge:"💡",analysis:"📊",footballiq_stat:"📈"}[t]||"⚽";}

function itemImage(item){
  var src=item.photo||item.badge||item.crest||"";
  if(src) return '<img src="'+src+'" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'flex\'" loading="lazy" alt=""><span style="display:none;align-items:center;justify-content:center;width:100%;height:100%">'+typeEmoji(item.type)+'</span>';
  return '<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:18px">'+typeEmoji(item.type)+'</span>';
}

function itemSubtitle(item){
  if(item.type==="player"){
    var parts=[];
    if(item.team) parts.push(item.team);
    if(item.position) parts.push(item.position);
    var stats=[];
    if(item.goals!=null&&item.goals>0) stats.push(item.goals+"G");
    if(item.assists!=null&&item.assists>0) stats.push(item.assists+"A");
    if(item.appearances!=null&&item.appearances>0) stats.push(item.appearances+" apps");
    if(stats.length) parts.push(stats.join(" "));
    return parts.join(" · ");
  }
  if(item.type==="club"){
    var sub=item.league_name||"Club";
    return sub;
  }
  if(item.type==="national_team"){
    var parts=[];
    if(item.group) parts.push("Group "+item.group);
    if(item.tournament) parts.push(item.tournament);
    return parts.join(" · ")||"International";
  }
  if(item.type==="fixture"){
    var status=item.status||"";
    var isLive=status==="1H"||status==="2H"||status==="HT"||status==="ET"||status==="P";
    var sub=(item.league_name||"")+(item.date?" · "+item.date:"");
    return sub+(isLive?' <span class="nmws-live">● LIVE</span>':"");
  }
  if(item.type==="edge"){
    var mkt=item.market||"";
    var odds=item.odds?(" · @"+item.odds):"";
    var lg=item.league||"";
    return mkt+odds+(lg?" · "+lg:"");
  }
  if(item.type==="analysis"){
    return item.description||"Analysis";
  }
  if(item.type==="footballiq_stat"){
    var cat=item.stat_category||"";
    var val=item.stat_value||"";
    var lc=item.league_code||"";
    return cat+(val?" · "+val:"")+(lc?" · "+lc:"");
  }
  return "";
}

function renderResults(items,q){
  if(!_results) return;
  if(!items||!items.length){
    _results.innerHTML='<div class="nmws-empty"><p>No results for <strong>'+escHtml(q)+'</strong></p><p class="nmws-empty-hint">Try a player name, club, or nation</p></div>';
    return;
  }
  var html='<ul class="nmws-list" id="nmws-list">';
  for(var i=0;i<items.length;i++){
    var item=items[i];
    html+='<li><a href="'+(item.url||"#")+'" class="nmws-item" data-idx="'+i+'">';
    html+='<div class="nmws-img">'+itemImage(item)+'</div>';
    html+='<div class="nmws-text"><span class="nmws-name">'+escHtml(item.name||item.home||"Unknown")+'</span>';
    html+='<span class="nmws-sub">'+itemSubtitle(item)+'</span></div>';
    html+='<span class="nmws-type-dot nmws-dot-'+item.type+'"></span>';
    html+='</a></li>';
  }
  _results.innerHTML=html+'</ul>';
}

function escHtml(s){
  return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function setSelected(idx){
  var list=_results?_results.querySelectorAll(".nmws-item"):[];
  list.forEach(function(el,i){
    el.classList.toggle("nmws-item-selected",i===idx);
    if(i===idx) el.scrollIntoView({block:"nearest"});
  });
  _selectedIdx=idx;
}

function getTrending(){try{return JSON.parse(localStorage.getItem(TRENDING_KEY)||"{}");}catch(e){return{};}}
function trackSearch(q){
  if(!q||q.length<2) return;
  try{var t=getTrending();var k=norm(q).slice(0,30);t[k]=(t[k]||0)+1;localStorage.setItem(TRENDING_KEY,JSON.stringify(t));}catch(e){}
}
function getTopTrending(n){
  var t=getTrending();
  var personal=Object.keys(t).sort(function(a,b){return t[b]-t[a];}).slice(0,3);
  // Merge with curated, personal first
  var merged=personal.slice();
  for(var i=0;i<CURATED_TRENDING.length&&merged.length<(n||8);i++){
    var c=norm(CURATED_TRENDING[i]);
    if(merged.indexOf(c)===-1) merged.push(CURATED_TRENDING[i]);
  }
  return merged.slice(0,n||8);
}

function renderTrending(){
  if(!_results) return;
  var terms=getTopTrending(8);
  var c=window.__nmwsCounts||{};
  var clubCount=c.club||550;
  var playerCount=c.player||23000;
  var nationCount=c.national_team||168;
  var fixtureCount=c.fixture||122;
  var html='<div class="nmws-trending">';
  html+='<span class="nmws-trending-label">Popular right now</span>';
  html+='<div class="nmws-chips">';
  for(var i=0;i<terms.length;i++){
    html+='<button class="nmws-chip" data-q="'+escHtml(terms[i])+'">'+escHtml(terms[i])+'</button>';
  }
  html+='</div></div>';
  html+='<div class="nmws-hint-types">';
  html+='<span class="nmws-hint-pill nmws-dot-player">👤 '+playerCount.toLocaleString()+' players</span>';
  html+='<span class="nmws-hint-pill nmws-dot-club">⚽ '+clubCount.toLocaleString()+' clubs</span>';
  html+='<span class="nmws-hint-pill nmws-dot-national_team">🌍 '+nationCount+' nations</span>';
  html+='<span class="nmws-hint-pill nmws-dot-fixture">📅 '+fixtureCount+' fixtures</span>';
  html+='</div>';
  _results.innerHTML=html;
  _results.querySelectorAll(".nmws-chip").forEach(function(btn){
    function fireChip(e){e.preventDefault();_input.value=btn.dataset.q;runSearch(btn.dataset.q);}
    btn.addEventListener("touchend",fireChip);
    btn.addEventListener("click",fireChip);
  });
}

function renderPills(){
  if(!_pills) return;
  var types=["all","player","club","national_team","fixture","edge","analysis"];
  var labels={all:"All",player:"Players",club:"Clubs",national_team:"Nations",fixture:"Fixtures",edge:"StatIQ",analysis:"Analysis"};
  var html="";
  for(var i=0;i<types.length;i++){
    var t=types[i];
    html+='<button class="nmws-pill'+(t===_activeType?" nmws-pill-active":"")+'" data-type="'+t+'">'+labels[t]+'</button>';
  }
  _pills.innerHTML=html;
  _pills.querySelectorAll(".nmws-pill").forEach(function(btn){
    function firePill(e){e.preventDefault();_activeType=btn.dataset.type;renderPills();runSearch(_lastQuery);}
    btn.addEventListener("touchend",firePill);
    btn.addEventListener("click",firePill);
  });
}

function runSearch(q){
  _lastQuery=q;
  if(!q||!q.trim()){renderTrending();return;}
  loadIndex(function(){doSearch(q,_activeType);});
}

function openSearch(){
  if(!_overlay) buildOverlay();
  _overlay.classList.add("nmws-open");
  document.body.style.overflow="hidden";
  setTimeout(function(){
    _input.focus();
    if(!_index&&!_loading) loadIndex(function(){renderTrending();});
    else renderTrending();
  },60);
}

function closeSearch(){
  if(!_overlay) return;
  var q=_input?_input.value.trim():"";
  if(q) trackSearch(q);
  _overlay.classList.remove("nmws-open");
  document.body.style.overflow="";
  _selectedIdx=-1;
}

function buildOverlay(){
  if(document.getElementById("nmws-overlay")) return;
  var style=document.createElement("style");
  style.textContent=[
    "#nmws-overlay{position:fixed;inset:0;z-index:9999;display:none;flex-direction:column;background:rgba(0,0,0,0.92);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}",
    "#nmws-overlay.nmws-open{display:flex;}",
    "#nmws-box{background:#0f0f0f;border-bottom:1px solid #1e1e1e;padding:12px 16px 0;flex-shrink:0;}",
    "#nmws-bar{display:flex;align-items:center;gap:10px;margin-bottom:10px;}",
    "#nmws-input-wrap{position:relative;flex:1;display:flex;align-items:center;}",
    "#nmws-input-icon{position:absolute;left:12px;color:#555;pointer-events:none;display:flex;}",
    "#nmws-input{width:100%;background:#1a1a1a;border:1.5px solid #2a2a2a;border-radius:10px;color:#fff;font-size:16px;padding:10px 14px 10px 40px;outline:none;font-family:inherit;transition:border-color 0.15s;box-sizing:border-box;}",
    "#nmws-input:focus{border-color:#22c55e;}",
    "#nmws-close{background:none;border:none;color:#666;font-size:22px;line-height:1;cursor:pointer;padding:6px;border-radius:8px;transition:color 0.1s,background 0.1s;flex-shrink:0;}",
    "#nmws-close:hover{color:#fff;background:#1e1e1e;}",
    "#nmws-pills{display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none;}",
    "#nmws-pills::-webkit-scrollbar{display:none;}",
    ".nmws-pill{background:#1a1a1a;border:1.5px solid #2a2a2a;border-radius:20px;color:#888;font-size:12px;font-weight:600;padding:5px 12px;cursor:pointer;white-space:nowrap;transition:all 0.15s;font-family:inherit;}",
    ".nmws-pill:hover{border-color:#444;color:#ccc;}",
    ".nmws-pill-active{background:#22c55e;border-color:#22c55e;color:#000;}",
    "#nmws-results{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;}",
    ".nmws-list{list-style:none;margin:0;padding:8px 0;}",
    ".nmws-list li{border-bottom:1px solid #111;}",
    ".nmws-item{display:flex;align-items:center;gap:12px;padding:10px 16px;text-decoration:none;color:#fff;transition:background 0.1s;position:relative;}",
    ".nmws-item:hover,.nmws-item:active,.nmws-item-selected{background:#141414;}",
    ".nmws-img{width:38px;height:38px;border-radius:50%;overflow:hidden;background:#1a1a1a;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;}",
    ".nmws-img img{width:100%;height:100%;object-fit:cover;}",
    ".nmws-text{flex:1;min-width:0;}",
    ".nmws-name{display:block;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    ".nmws-sub{display:block;font-size:12px;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px;}",
    ".nmws-live{color:#22c55e;font-weight:700;}",
    ".nmws-type-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-left:auto;}",
    ".nmws-dot-player{background:#22c55e;}.nmws-dot-club{background:#60a5fa;}.nmws-dot-national_team{background:#c084fc;}.nmws-dot-fixture{background:#fb923c;}.nmws-dot-edge{background:#facc15;}.nmws-dot-analysis{background:#38bdf8;}.nmws-dot-footballiq_stat{background:#f97316;}",
    ".nmws-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;color:#444;text-align:center;}",
    ".nmws-empty p{margin:0 0 8px;font-size:14px;}.nmws-empty strong{color:#777;}",
    ".nmws-empty-hint{color:#333;font-size:12px;}",
    ".nmws-trending{padding:16px 16px 8px;}",
    ".nmws-trending-label{font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#444;display:block;margin-bottom:10px;}",
    ".nmws-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}",
    ".nmws-chip{background:#141414;border:1.5px solid #1e1e1e;border-radius:20px;color:#888;font-size:13px;padding:6px 14px;cursor:pointer;font-family:inherit;transition:all 0.15s;}",
    ".nmws-chip:hover{border-color:#22c55e;color:#22c55e;}",
    ".nmws-hint-types{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 16px;}",
    ".nmws-hint-pill{background:#141414;border:1px solid #1e1e1e;border-radius:8px;color:#555;font-size:12px;padding:6px 10px;}",
    ".nmws-loading{display:flex;align-items:center;justify-content:center;gap:12px;padding:48px 24px;color:#444;font-size:14px;}",
    ".nmws-spinner{width:18px;height:18px;border:2px solid #222;border-top-color:#22c55e;border-radius:50%;animation:nmws-spin 0.7s linear infinite;flex-shrink:0;}",
    "@keyframes nmws-spin{to{transform:rotate(360deg);}}",
    ".gs-trigger{background:none!important;border:none!important;padding:6px!important;margin:0!important;cursor:pointer!important;color:inherit!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:8px!important;-webkit-appearance:none!important;appearance:none!important;-webkit-tap-highlight-color:transparent!important;}",
    ".gs-trigger:hover,.gs-trigger:active{background:rgba(255,255,255,0.08)!important;}",
    ".gs-trigger svg{display:block!important;stroke:currentColor!important;}"
  ].join("");
  document.head.appendChild(style);

  var overlay=document.createElement("div");
  overlay.id="nmws-overlay";
  overlay.innerHTML=
    '<div id="nmws-box">'+
    '<div id="nmws-bar">'+
    '<div id="nmws-input-wrap">'+
    '<span id="nmws-input-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>'+
    '<input id="nmws-input" type="search" placeholder="Players, clubs, nations, fixtures..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">'+
    '</div>'+
    '<button id="nmws-close" aria-label="Close">&#x2715;</button>'+
    '</div>'+
    '<div id="nmws-pills"></div>'+
    '</div>'+
    '<div id="nmws-results"></div>';
  document.body.appendChild(overlay);

  _overlay=overlay;
  _input=document.getElementById("nmws-input");
  _results=document.getElementById("nmws-results");
  _pills=document.getElementById("nmws-pills");

  document.getElementById("nmws-close").addEventListener("click",closeSearch);
  overlay.addEventListener("click",function(e){if(e.target===overlay)closeSearch();});

  var dbo;
  _input.addEventListener("input",function(){
    var q=_input.value.trim();
    clearTimeout(dbo);
    if(!q){renderTrending();_selectedIdx=-1;return;}
    dbo=setTimeout(function(){runSearch(q);},120);
  });

  _input.addEventListener("keydown",function(e){
    if(e.key==="Escape"){closeSearch();return;}
    if(e.key==="ArrowDown"){
      e.preventDefault();
      setSelected(Math.min(_selectedIdx+1,_resultItems.length-1));
    } else if(e.key==="ArrowUp"){
      e.preventDefault();
      setSelected(Math.max(_selectedIdx-1,-1));
      if(_selectedIdx===-1) _input.focus();
    } else if(e.key==="Enter"&&_selectedIdx>=0){
      e.preventDefault();
      var item=_resultItems[_selectedIdx];
      if(item&&item.url) window.location.href=item.url;
    }
  });

  renderPills();
  renderTrending();
}

function wireTriggers(){
  document.querySelectorAll(".gs-trigger").forEach(function(btn){
    btn.addEventListener("touchend",function(e){e.preventDefault();openSearch();});
    btn.addEventListener("click",function(e){e.preventDefault();openSearch();});
  });
}

window.__gsOpen=openSearch;
window.__gsClose=closeSearch;

document.addEventListener("DOMContentLoaded",function(){
  buildOverlay();
  wireTriggers();
});
})();
