/* M_HOME_20261015 */
(function(){
  if(!window.matchMedia('(max-width:1099px)').matches)return;
  var anchor=document.querySelector('.pulse-wrap');if(!anchor)return;
  var host=document.getElementById('mhHome')||document.createElement('section');host.id='mhHome';if(!host.parentNode)anchor.parentNode.insertBefore(host,anchor);/*LAYOUTGUARD*/
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function key(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
  function pretty(s){return String(s||'').replace(/_/g,' ').toLowerCase().replace(/\b\w/g,function(c){return c.toUpperCase();}).replace(/\bBtts\b/,'BTTS').replace(/(\d) (\d)/g,'$1.$2');}
  function ko(iso){var d=new Date(iso);if(isNaN(d))return '';var z={timeZone:'Europe/London'};var t=d.toLocaleTimeString('en-GB',Object.assign({hour:'2-digit',minute:'2-digit'},z));return d.toLocaleDateString('en-GB',z)===new Date().toLocaleDateString('en-GB',z)?t:d.toLocaleDateString('en-GB',Object.assign({weekday:'short'},z))+' '+t;}
  var name='Waffler';try{var u=localStorage.getItem('nmw_username');if(u)name=u;}catch(e){}
  var probs={},liveHTML='',edgesHTML='<div class="mh-note">Loading edges…</div>',note='',title='StatIQ';
  function mp(t){var f=probs[key(t.home)+'|'+key(t.away)];if(!f)return null;var m={HOME_WIN:f.p_home,DRAW:f.p_draw,AWAY_WIN:f.p_away,BTTS_YES:f.btts,BTTS:f.btts,OVER25:f.o25,OVER_2_5:f.o25,UNDER25:100-f.o25,UNDER_2_5:100-f.o25,OVER35:f.o35,OVER_3_5:f.o35}[String(t.market||'').toUpperCase()];return m==null?null:m;}
  function edge(t){var p=mp(t),o=parseFloat(t.odds);return(p!==null&&o>1)?{p:p,e:p-100/o}:null;}
  function row(t,done){var e=edge(t),r=String(t.result||'').toUpperCase();
    var right=done?'<b class="'+(r==='WIN'?'mh-w':'mh-l')+'">'+esc(r)+'</b>'+(parseFloat(t.odds)?'@ '+parseFloat(t.odds).toFixed(2):''):
      (e?'<b>'+e.p.toFixed(0)+'%</b>FootballIQ model<br><span class="mh-pos" style="opacity:.7">info only</span>':(parseFloat(t.odds)?'<b>@ '+parseFloat(t.odds).toFixed(2)+'</b>Odds':'<b>Price</b>on match day')/* ODDSLABEL_20261023 */);
    return '<a class="mh-edge" href="/edges/"><div class="mh-ic">&#8599;</div><div class="mh-ec"><div class="mh-em">'+esc(t.market_label||pretty(t.market))+'</div><div class="mh-et">'+esc(t.home)+' vs '+esc(t.away)+'</div></div><div class="mh-er">'+right+'</div></a>';}
  var QA=[['/edges/','StatIQ','<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>'],['/matches/','Scores','<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>'],['/footballiq/form/','Form','<path d="M3 17l6-6 4 4 8-8"/>'],['/footballiq/sims/','Sims','<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>']];
  function render(){
    var q='';QA.forEach(function(a){q+='<a href="'+a[0]+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+a[2]+'</svg>'+a[1]+'</a>';});
    host.innerHTML='<div class="mh-hi">Hey '+esc(name)+'! &#128075;</div><h1>Catch every <em>edge</em>.<br>Back with confidence.</h1>'+liveHTML
      +'<div class="mh-sh"><b>'+title+'</b><a href="/edges/">View all</a></div>'+(note?'<div class="mh-note">'+esc(note)+'</div>':'')+edgesHTML
      +'<div class="mh-sh" style="margin-top:16px"><b>Quick Actions</b></div><div class="mh-qa">'+q+'</div>';
  }
  function liveCard(m){
    if(m.live){var sc=(m.hs!=null&&m.as!=null)?m.hs+' - '+m.as:'v';
      return '<a class="mh-live" href="/matches/'+(m.fid?'?fx='+encodeURIComponent(m.fid):'')+'" data-fid="'+esc(m.fid||'')+'"><div class="mh-lt"><span class="mh-dot"></span>LIVE NOW'+(m.min?' &middot; '+esc(m.min):'')+'</div><div class="mh-lm"><span>'+esc(m.home)+'</span><span>'+esc(sc)+'</span><span>'+esc(m.away)+'</span></div></a>';}
    return '<a class="mh-live" href="/matches/"><div class="mh-lt"><span class="mh-dot"></span>NEXT KICK-OFF</div><div class="mh-lm"><span>'+esc(m.home)+' v '+esc(m.away)+'</span></div><div class="mh-ls">'+esc(ko(m.ko))+'</div></a>';
  }
  render();
  host.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.mh-live');if(!a)return;var f=a.getAttribute('data-fid');if(f&&typeof window.openLivePanel==='function'){e.preventDefault();window.openLivePanel(f);}});
  function loadLive(){
    Promise.all([fetch('/data/live_now.json?'+Date.now()).then(function(r){return r.json();}).catch(function(){return null;}),fetch('/data/fixtures.json?'+Date.now()).then(function(r){return r.json();}).catch(function(){return null;})]).then(function(r){
      var ln=r[0],fx=r[1],pick=null;
      var L=(window.nmwPickLive?window.nmwPickLive((ln&&ln.matches)||[],{rotate:true}):((ln&&ln.matches)||[]));  /* LIVEPICK_20261019 */
      if(L.length){var m=L[0];pick={live:1,home:m.home,away:m.away,hs:m.home_score,as:m.away_score,min:m.status==='HT'?'HT':(m.minute!=null?m.minute+"'":''),fid:(m.af_fixture_id||('bsd-'+m.bsd_id))};}
      else if(fx){var l2=(fx.live||[])[0];if(l2)pick={live:1,home:l2.home,away:l2.away,hs:l2.home_score,as:l2.away_score,min:l2.minute?l2.minute+"'":''};
        else{var now=Date.now(),up=(fx.upcoming||[]).filter(function(f){return new Date(f.kickoff_utc).getTime()>now&&!/FINISH|FT|POSTP|CANC/i.test(f.status||'');}).sort(function(a,b){return new Date(a.kickoff_utc)-new Date(b.kickoff_utc);})[0];if(up)pick={live:0,home:up.home,away:up.away,ko:up.kickoff_utc};}}
      liveHTML=pick?liveCard(pick):'';render();
    });
  }
  loadLive();setInterval(loadLive,30000);
  Promise.all([fetch('/data/enriched_bets.json?'+Date.now()).then(function(r){return r.json();}),fetch('/data/match_probs.json?'+Date.now()).then(function(r){return r.json();}).catch(function(){return null;})]).then(function(r){
    ((r[1]&&r[1].fixtures)||[]).forEach(function(f){probs[key(f.home)+'|'+key(f.away)]=f;});
    var S=((r[0]&&r[0].selections)||[]).filter(function(x){return !x.is_builder;});
    var open=S.filter(function(x){return String(x.result||'PENDING').toUpperCase()==='PENDING';});
    if(open.length){open.sort(function(a,b){var ea=edge(a),eb=edge(b);return(eb?eb.e:-99)-(ea?ea.e:-99);});edgesHTML=open.slice(0,3).map(function(t){return row(t,false);}).join('');title='StatIQ';note='';}
    else{var d=S.filter(function(x){return x.kickoff_utc;}).sort(function(a,b){return String(b.kickoff_utc).localeCompare(String(a.kickoff_utc));}).slice(0,3);
      edgesHTML=d.map(function(t){return row(t,true);}).join('')||'<div class="mh-note">No tips yet today.</div>';title='Latest Edges';note=d.length?'No open edges right now. Showing our latest settled tips.':'';}
    render();
  }).catch(function(){edgesHTML='<div class="mh-note">Edges unavailable right now.</div>';render();});
})();
