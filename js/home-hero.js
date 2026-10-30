/* HOME_HERO_20261015 v2 */
(function(){
  var anchor=document.querySelector('.pulse-wrap');
  if(!anchor) return;
  var host=document.getElementById('mwHero')||document.createElement('section');host.id='mwHero';  /* HEROSPACE_20261019: reuse the reserved box */
  if(!host.parentNode)anchor.parentNode.insertBefore(host,anchor);
  var LG={UCL:'Champions League',UEL:'Europa League',UECL:'Conference League',PL:'Premier League',EPL:'Premier League',ELC:'Championship',DED:'Eredivisie',PD:'La Liga',BL1:'Bundesliga',SA:'Serie A',FL1:'Ligue 1',PPL:'Primeira Liga'};
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function num(v){var n=parseFloat(v);return isFinite(n)?n:null;}
  function firstOf(o,keys){for(var i=0;i<keys.length;i++){var v=o[keys[i]];if(v!==undefined&&v!==null&&v!=='')return v;}return null;}
  function pretty(s){return String(s||'').replace(/_/g,' ').toLowerCase().replace(/\b\w/g,function(c){return c.toUpperCase();});}
  function key(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
  function fmtKO(iso){
    if(!iso)return '';
    var d=new Date(iso);if(isNaN(d))return esc(iso);
    var tz={timeZone:'Europe/London'};
    var t=d.toLocaleTimeString('en-GB',Object.assign({hour:'2-digit',minute:'2-digit'},tz));
    var day=d.toLocaleDateString('en-GB',tz),today=new Date().toLocaleDateString('en-GB',tz);
    return day===today?t:d.toLocaleDateString('en-GB',Object.assign({weekday:'short'},tz))+' '+t;
  }
  var probs={};
  function modelProb(t){
    var f=probs[key(t.home)+'|'+key(t.away)];if(!f)return null;
    var m=String(t.market||'').toUpperCase();
    var map={HOME_WIN:f.p_home,DRAW:f.p_draw,AWAY_WIN:f.p_away,BTTS_YES:f.btts,BTTS:f.btts,BTTS_NO:100-f.btts,OVER_2_5:f.o25,OVER_25:f.o25,UNDER_2_5:100-f.o25,UNDER_25:100-f.o25,OVER_3_5:f.o35,UNDER_3_5:100-f.o35};
    var v=map[m];return (v===undefined||v===null||isNaN(v))?null:v;
  }
  function edgeVal(t){
    var e=num(firstOf(t,['edge','edge_pct','statiq_edge']));if(e!==null)return e;
    var p=modelProb(t),o=num(t.odds);
    return (p!==null&&o!==null&&o>1)?p-100/o:null;
  }
  function why(t){
    var r=firstOf(t,['reason','reasoning','statiq_reasoning','rationale']);if(r)return String(r);
    var L=[];try{L=JSON.parse(t.layers_json||'[]');}catch(e){}
    return L.filter(function(x){return String(x).indexOf('\u2705')!==-1;})
      .map(function(x){return String(x).replace(/\u2705/g,'').replace(/\s+/g,' ').trim();}).slice(0,2).join(' · ');
  }
  function card(t,settled){
    var res=String(t.result||'').toUpperCase(),ev=edgeVal(t),odds=num(t.odds),w=why(t);
    var lg=t.league_name||LG[t.league]||t.league||'';
    return '<a class="hh-card" href="/edges/">'
      +'<div class="hh-row"><span class="hh-lg">'+esc(lg)+' · '+fmtKO(t.kickoff_utc)+'</span>'+(settled?'<span class="hh-res hh-'+esc(res.toLowerCase())+'">'+esc(res)+'</span>':'')+'</div>'
      +'<div class="hh-tm">'+esc(t.home)+'<div class="hh-vs">vs</div>'+esc(t.away)+'</div>'
      +'<div class="hh-row"><span>Market</span><b>'+esc(t.market_label||pretty(t.market))+'</b></div>'
      +(odds!==null?'<div class="hh-row"><span>Odds</span><b>'+odds.toFixed(2)+'</b></div>':'')
      +(ev!==null?'<div class="hh-row"><span>StatIQ Edge</span><span class="hh-edge">'+(ev>0?'+':'')+ev.toFixed(1)+'%</span></div>':'')
      +(w?'<div class="hh-why">'+esc(w)+'</div>':'')
      +'</a>';
  }
  var live=null,upc=[];
  function liveStrip(){
    var ms=(window.nmwPickLive?window.nmwPickLive((live&&live.matches)||[]):((live&&live.matches)||[]));  /* LIVEPICK_20261019 */
    var h='<div class="hh-live"><div class="hh-live-h"><span class="hh-dot"></span>'+(ms.length||!upc.length?'LIVE NOW · '+ms.length+(ms.length===1?' match':' matches'):'NEXT KICK-OFFS')+'</div><div class="hh-live-l">';
    if(!ms.length&&upc.length){upc.forEach(function(f){h+='<span>'+esc(f.home)+' v '+esc(f.away)+'<small>'+fmtKO(f.kickoff_utc)+'</small></span>';});}
    else if(!ms.length)h+='<span style="color:var(--text-muted,#9CA3A0)">No matches live right now</span>';
    ms.slice(0,6).forEach(function(m){
      var hs=firstOf(m,['home_score','hs','score_home']),aw=firstOf(m,['away_score','as','score_away']);
      var sc=(hs!==null&&aw!==null)?hs+'-'+aw:(m.score||'v');
      var mn=(m.status==='HT')?'HT':(m.minute!=null?m.minute+"'":'');
      var ab=function(n){return esc(String(n||'').slice(0,3).toUpperCase());};
      h+='<span class="hh-lv" data-fid="'+esc(m.af_fixture_id||('bsd-'+m.bsd_id))+'">'+ab(m.home_abbr||m.home)+' '+esc(sc)+' '+ab(m.away_abbr||m.away)+(mn?'<small>'+esc(mn)+'</small>':'')+'</span>';
    });
    return h+'</div><a class="hh-btn" href="/matches/">View All Live Scores →</a></div>';
  }
  var cardsHTML='<div class="hh-empty">Loading today\'s edges…</div>',upd='',note='';
  function render(){
    var title=note?'Latest':'Today\'s Best';
    host.innerHTML='<div class="hh-top"><span class="hh-pill">StatIQ Edge Tracker</span>'+(upd?'<span class="hh-upd">Updated '+esc(upd)+'</span>':'')+'</div>'
      +'<h1>'+title+' <em>StatIQ</em> Edges</h1>'
      +'<p class="hh-sub">Data-driven betting edges from the StatIQ model.</p>'
      +(note?'<p class="hh-note">'+esc(note)+'</p>':'')
      +'<div class="hh-cards">'+cardsHTML+'</div>'
      +liveStrip()
      +'<div class="hh-tools">'
      +'<a class="hh-tool" href="/edges/"><b>StatIQ</b><span>Explore all StatIQ betting edges across today\'s matches.</span><u>Browse Edges →</u></a>'
      +'<a class="hh-tool" href="/matches/"><b>Scores</b><span>Live scores, fixtures and match stats in one place.</span><u>View Scores →</u></a>'
      +'<a class="hh-tool" href="/footballiq/"><b>FootballIQ</b><span>Advanced models, trends and team insights.</span><u>Launch FootballIQ →</u></a>'
      +'</div>';
  }
  host.addEventListener('click',function(e){
    var el=e.target.closest&&e.target.closest('.hh-lv');
    if(!el)return;var f=el.getAttribute('data-fid');
    if(f&&typeof window.openLivePanel==='function')window.openLivePanel(f);else location.href='/matches/';
  });
  function refreshStrip(){var el=host.querySelector('.hh-live');if(!el)return;var n=document.createElement('div');n.innerHTML=liveStrip();el.replaceWith(n.firstChild);}
  function loadLive(){
    fetch('/data/live_now.json?'+Math.floor(Date.now()/15000)).then(function(r){return r.json();}).catch(function(){return null;}).then(function(ln){
      if(ln&&ln.matches&&ln.matches.length){live=ln;refreshStrip();return;}
      return fetch('/data/fixtures.json?'+Math.floor(Date.now()/60000)).then(function(r){return r.json();}).catch(function(){return null;}).then(function(fx){
        var L=((fx&&fx.live)||[]).slice(),seen={};
        L.forEach(function(f){seen[f.id]=1;});
        ((fx&&fx.upcoming)||[]).forEach(function(f){
          if(seen[f.id])return;var on=false;
          try{
            if(typeof window.isNowLive==='function')on=window.isNowLive(f.kickoff_utc,f.status);
            else{var age=(Date.now()-new Date(f.kickoff_utc).getTime())/60000;on=age>0&&age<115&&!/FINISH|FT|POSTP|CANC/i.test(f.status||'');}
          }catch(e){}
          if(on)L.push(f);
        });
        var nowMs=Date.now();
        upc=((fx&&fx.upcoming)||[]).filter(function(f){return new Date(f.kickoff_utc).getTime()>nowMs&&!/FINISH|FT|POSTP|CANC/i.test(f.status||'');})
          .sort(function(a,b){return new Date(a.kickoff_utc)-new Date(b.kickoff_utc);}).slice(0,4);
        live={matches:L};refreshStrip();
      });
    });
  }
  render();loadLive();setInterval(loadLive,30000);
  Promise.all([
    fetch('/data/enriched_bets.json?'+Math.floor(Date.now()/60000)).then(function(r){return r.json();}),
    fetch('/data/match_probs.json?'+Math.floor(Date.now()/60000)).then(function(r){return r.json();}).catch(function(){return null;})
  ]).then(function(res){
    var d=res[0],mp=res[1];
    ((mp&&mp.fixtures)||[]).forEach(function(f){probs[key(f.home)+'|'+key(f.away)]=f;});
    var g=d&&d.generated_at;
    if(g){var gd=new Date(g);if(!isNaN(gd))upd=gd.toLocaleTimeString('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit'})+' today';}
    var S=((d&&d.selections)||[]).filter(function(x){return !x.is_builder;});
    var open=S.filter(function(x){return String(x.result||'PENDING').toUpperCase()==='PENDING';});
    if(open.length){
      open.sort(function(a,b){var ea=edgeVal(a),eb=edgeVal(b);return (eb===null?-99:eb)-(ea===null?-99:ea);});
      cardsHTML=open.slice(0,4).map(function(t){return card(t,false);}).join('');note='';
    }else{
      var done=S.filter(function(x){return x.kickoff_utc;}).sort(function(a,b){return String(b.kickoff_utc).localeCompare(String(a.kickoff_utc));}).slice(0,4);
      cardsHTML=done.length?done.map(function(t){return card(t,true);}).join(''):'<div class="hh-empty">No tips yet today. <a href="/edges/" style="color:var(--accent,#3DDC84)">See all tips</a></div>';
      note=done.length?'No open edges right now. Showing our latest settled tips.':'';
    }
    render();
  }).catch(function(){cardsHTML='<div class="hh-empty">Edges unavailable right now. <a href="/edges/" style="color:var(--accent,#3DDC84)">Open the Edges page</a></div>';render();});
})();

/* TSBUCKET_20261020_JS */
