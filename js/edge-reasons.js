/* EDGEREASONS_20261019: same audit-backed reasons as the Telegram/Discord cards. */
(function(){
var PROVEN={"Home form":1,"Away form":1,"Away weakness":1,"Attack vs defence":1,"H2H home wins":1,"H2H away wins":1,"xG both":1,"Squad healthy":1};
var HIDE={"Confidence":1,"ML prob":1,"Form goals":1,"CS rates":1,"Home weakness":1,"H2H U2.5":1,"Form U2.5":1,"WC Group stage":1,"WC weight applied":1,"Form data":1,"Late midweek KO":1,"Prime time KO":1,"H2H":1};
var LABEL={"Home form":"Home side in form","Away form":"Away side in form","Away weakness":"Away side struggling","Attack vs defence":"Attack beats the defence","H2H home wins":"Home side wins this fixture","H2H away wins":"Away side wins this fixture","xG both":"Both sides create chances (xG)","Squad healthy":"Squad fit, few injuries","H2H O2.5":"Goals in recent meetings","Form O2.5 strong":"Goals in recent form","Form O2.5 rate":"High-scoring recent games","Form away strength":"Strong away record","Form BTTS":"Both teams scoring lately","Form split":"Home/away form split","xG total":"High combined xG","Home strength":"Strong home side","Away strength":"Strong away side"};
var NEG={"Form away strength":"Away record below our bar","Away strength":"Away side not strong enough","Home strength":"Home side not strong enough","Form BTTS":"Both-teams-score form below our bar","Form split":"Home/away form split unclear","Form O2.5 rate":"Recent games lower-scoring","Home form":"Home form below our bar","Away form":"Away form below our bar","H2H home wins":"Home side's record in this fixture is poor","H2H away wins":"Away side's record in this fixture is poor"};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function parse(s){s=String(s||'').trim();var det='',m=s.match(/\(([^()]*)\)\s*$/);if(m){det=m[1].trim();s=s.slice(0,m.index).trim();}
  var st=/\u274C|\u26A0/.test(s)?'fail':(/\u2705/.test(s)?'pass':(/\b(ok|weak)$/.test(s)?'weak':'pass'));
  var name=s.replace(/\s*(\u2705|\u274C|\u26A0\uFE0F|\u26A0)\s*/g,' ').replace(/\s+(ok|weak)$/,'').replace(/\s+/g,' ').trim();
  return {name:name,st:st,det:det};}
function hidden(n){return !n||HIDE[n]||/^Inj/.test(n)||/^Leg /.test(n);}
function det(d){var m=String(d||'').match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);return (m&&+m[2]<4)?d+', small sample':d;}
function rank(layers){if(typeof layers==='string'){try{layers=JSON.parse(layers);}catch(e){layers=[layers];}}
  var R={proven:[],support:[],watch:[]},seen={};
  (layers||[]).forEach(function(raw){var p=parse(raw);if(hidden(p.name)||seen[p.name])return;seen[p.name]=1;
    if(p.st==='pass')(PROVEN[p.name]?R.proven:R.support).push({t:LABEL[p.name]||p.name,d:det(p.det)});
    else if(p.st==='fail')R.watch.push({t:NEG[p.name]||((LABEL[p.name]||p.name)+': not met'),d:p.det});});
  return R;}
function li(x,c){return '<li class="'+c+'"><span>'+esc(x.t)+(x.d?' <span class="er-det">('+esc(x.d)+')</span>':'')+'</span></li>';}
function css(){if(document.getElementById('er-css'))return;var st=document.createElement('style');st.id='er-css';st.textContent=
  '.er-box{margin-top:4px}.er-sig{display:inline-flex;gap:10px;font-size:.72rem;font-weight:700;color:var(--text-dim,#94a3b8);background:var(--bg-elev,rgba(148,163,184,.08));border-radius:999px;padding:5px 12px;margin-bottom:6px}'+
  '.er-title{font-size:.66rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dim,#94a3b8);margin:12px 0 6px}'+
  '.er-list{list-style:none;margin:0;padding:0;display:grid;gap:6px}.er-list li{display:flex;gap:9px;align-items:flex-start;font-size:.84rem;line-height:1.4;padding:8px 11px;border-radius:9px;background:var(--bg-elev,rgba(148,163,184,.08))}'+
  '.er-list li:before{content:"";flex:0 0 7px;height:7px;margin-top:6px;border-radius:50%;background:var(--accent,#a3e635)}.er-list li.er-s:before{background:#38bdf8}.er-list li.er-w:before{background:var(--warn,#f59e0b)}'+
  '.er-det{color:var(--text-dim,#94a3b8)}.er-note{font-size:.66rem;color:var(--text-dim,#94a3b8);margin-top:10px}';document.head.appendChild(st);}
window.nmwReasons=rank;
window.nmwReasonsHtml=function(t){try{var R=rank(t&&t.layers_json);var main=R.proven.length?R.proven:R.support.slice(0,3);
  var rest=R.proven.length?R.support:R.support.slice(3);if(!main.length&&!R.watch.length)return '';css();
  var sig=[];if(R.proven.length)sig.push('\u2705 '+R.proven.length+' proven');if(R.support.length)sig.push('\u2795 '+R.support.length+' supporting');
  var h='<div class="er-box">'+(sig.length?'<div class="er-sig">'+sig.join('<span>\u00b7</span>')+'</div>':'');
  if(main.length)h+='<div class="er-title">Why this pick</div><ul class="er-list">'+main.slice(0,4).map(function(x){return li(x,R.proven.length?'er-p':'er-s');}).join('')+'</ul>';
  if(rest.length)h+='<div class="er-title">Also in its favour</div><ul class="er-list">'+rest.slice(0,3).map(function(x){return li(x,'er-s');}).join('')+'</ul>';
  if(R.watch.length)h+='<div class="er-title">Watch-outs</div><ul class="er-list">'+R.watch.slice(0,2).map(function(x){return li(x,'er-w');}).join('')+'</ul>';
  return h+'<div class="er-note">Reasons ranked by what our published record shows actually beats the bookmaker price.</div></div>';}catch(e){return '';}};
})();
/* SIGPILL_20261019: signals pill replacing the old x/6 score bar on tip cards. */
(function(){
  window.nmwSignalsHtml=function(t){try{
    if(!window.nmwReasons)return '';var R=window.nmwReasons(t&&t.layers_json);
    var p=R.proven.length,s=R.support.length;if(!p&&!s)return '';
    if(!document.getElementById('er-sig-css')){var st=document.createElement('style');st.id='er-sig-css';
      st.textContent='.er-sigrow{display:inline-flex;gap:8px;align-items:center;margin-top:8px;font-size:.72rem;font-weight:700;color:var(--text-muted,#9CA3A0);background:var(--bg-elev,rgba(148,163,184,.08));border:1px solid var(--border,rgba(255,255,255,.06));border-radius:999px;padding:4px 11px}.er-sigrow b{color:var(--accent,#3DDC84)}';
      document.head.appendChild(st);}
    var bits=[];if(p)bits.push('\u2705 <b>'+p+'</b> proven');if(s)bits.push('\u2795 '+s+' supporting');
    return '<div class="er-sigrow" title="Checks that passed for this pick">'+bits.join(' \u00b7 ')+'</div>';
  }catch(e){return '';}};
})();
/* INTERLINK_20261019: "Match preview" link on tip cards that have a FootballIQ preview. */
(function(){
  var map=null;
  function css(){if(document.getElementById('er-prev-css'))return;var st=document.createElement('style');st.id='er-prev-css';
    st.textContent='.er-prev{display:inline-block;margin:8px 0 2px;font-size:.74rem;font-weight:700;color:var(--accent,#3DDC84);text-decoration:none}.er-prev:hover{text-decoration:underline}';document.head.appendChild(st);}
  function apply(){if(!map)return;var els=document.querySelectorAll('[data-abid]');
    for(var i=0;i<els.length;i++){var el=els[i],p=map[el.getAttribute('data-abid')],pr=el.previousElementSibling;
      if(!p||(pr&&pr.className==='er-prev'))continue;
      var a=document.createElement('a');a.className='er-prev';a.href=p;a.textContent='Match preview \u203A';
      a.addEventListener('click',function(e){e.stopPropagation();});el.parentNode.insertBefore(a,el);}}
  try{fetch('/data/tip_previews.json?t='+Math.floor(Date.now()/600000)).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d)return;map=d;css();apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});}).catch(function(){});}catch(e){}
})();

/* TIP_PLAIN_20261025: plain-English sentences first (from /data/tip_plain.json). Off where the homepage pop-up adds its own. */
(function () {
  if (!window.nmwReasonsHtml || window.__nmwRP) return; window.__nmwRP = 1;
  var orig = window.nmwReasonsHtml;
  function e(x) { return String(x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  try { fetch('/data/tip_plain.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (d) { window.__nmwTP = window.__nmwTP || d; }).catch(function () {}); } catch (x) {}
  window.nmwReasonsHtml = function (t) {
    var h = orig.apply(this, arguments); if (window.__nmwTS) return h;
    var p = window.__nmwTP && t && window.__nmwTP[String(t.id)];
    return (p && p.all ? '<p class="er-plain" style="font-size:.9rem;line-height:1.5;margin:4px 0 8px">' + e(p.all.join(' ')) + '</p>' : '') + h;
  };
})();
