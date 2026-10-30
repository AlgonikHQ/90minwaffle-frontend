(function(){ /* LEAGUE_V2_PRED: model chances on upcoming fixtures, plus the 24-hour vote (shared predict.js) */
var sec=[].filter.call(document.querySelectorAll('section.c'),function(s){var h=s.querySelector('h2');return h&&/Upcoming fixtures/i.test(h.textContent)})[0]; if(!sec) return;
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\b(a?fc|cf)\b/g,'').replace(/[^a-z0-9]/g,'')}
fetch('/data/match_probs.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(d){ if(!d) return;
 var ms=Array.isArray(d)?d:(d.matches||d.fixtures||Object.keys(d).map(function(k){return d[k]}).filter(Array.isArray).sort(function(a,b){return b.length-a.length})[0]||[]), now=Date.now(), todo=[];
 [].forEach.call(sec.querySelectorAll('.ev'),function(ev){ if(ev.querySelector('.lg2-p')) return; var t=norm(ev.textContent);
  var g=ms.filter(function(m){var h=norm(m.home),a=norm(m.away);return h.length>2&&a.length>2&&t.indexOf(h)>-1&&t.indexOf(a)>-1})[0]; if(!g) return;
  var p=document.createElement('div'); p.className='lg2-p'; p.style.cssText='grid-column:1/-1;font-size:12px;color:#8aa0b8;margin-top:4px';
  p.textContent='Model: '+g.home+' '+Math.round(g.p_home)+'% · Draw '+Math.round(g.p_draw)+'% · '+g.away+' '+Math.round(g.p_away)+'%'; ev.appendChild(p);
  var k=Date.parse(g.kickoff_utc); if(k>now&&k-now<864e5) todo.push([ev,g]); });
 if(!todo.length) return;
 function go(P){ todo.forEach(function(x){ var v=document.createElement('div'); v.className='lg2-v'; v.style.cssText='grid-column:1/-1;margin-top:6px';
  if(P.render(v,{home:x[1].home,away:x[1].away,kickoff_utc:x[1].kickoff_utc,league:x[1].league,fixture_id:x[1].fixture_id})) x[0].appendChild(v); }); }
 if(window.NMWPredict) go(window.NMWPredict); else { var sc=document.createElement('script'); sc.src='/js/predict.js?v=2'; sc.onload=function(){ if(window.NMWPredict) go(window.NMWPredict); }; document.head.appendChild(sc); }
}).catch(function(){}); })();
