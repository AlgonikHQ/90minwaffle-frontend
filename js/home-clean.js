/* HOME_CLEAN_20261015: Bet of the Day reads real tips, shows settled result */
(function(){
  function key(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
  function pretty(s){return String(s||'').replace(/_/g,' ').toLowerCase().replace(/\b\w/g,function(x){return x.toUpperCase();}).replace(/\bBtts\b/,'BTTS').replace(/(\d) (\d)/g,'$1.$2');}
  function fill(m,sel,odds,res){
    var ct=document.getElementById('bet-content'),ld=document.getElementById('bet-loading'),card=document.getElementById('bet-of-day-card');
    if(!ct)return;
    document.getElementById('bet-match').textContent=m||'';
    document.getElementById('bet-selection').textContent=pretty(sel);
    var o=parseFloat(odds);document.getElementById('bet-price').textContent=isNaN(o)?'':('@ '+o.toFixed(2));
    var r=String(res||'').toLowerCase(),cls='pending',txt='&#9203; Pending';
    if(r.indexOf('win')>-1||r.indexOf('won')>-1){cls='win';txt='&#9989; Won';}
    else if(r.indexOf('los')>-1){cls='loss';txt='&#10060; Lost';}
    else if(r.indexOf('void')>-1){cls='void';txt='&#10134; Void';}
    document.getElementById('bet-status').innerHTML="<span class='bet-badge "+cls+"'>"+txt+"</span>";
    if(card)card.setAttribute('data-result',cls);
    if(ld)ld.style.display='none';ct.style.display='block';
  }
  function run(){ /* BOTD_EXPORT_20261017: the bot's own daily pick, latest settled result until the next one */
    var ct=document.getElementById('bet-content');if(!ct)return;
    fetch('/data/botd.json?t='+Math.floor(Date.now()/60000)).then(function(r){return r.ok?r.json():null;}).then(function(d){
      var b=d&&d.current;
      if(!b){var ld=document.getElementById('bet-loading');if(ld)ld.textContent='Next Bet of the Day coming soon';return;}
      var done=b.result&&b.result!=='PENDING';
      var sc=(done&&b.home_score!=null&&b.away_score!=null)?(' '+b.home_score+'-'+b.away_score+' '):' vs ';
      fill(b.home+sc+b.away,b.market_label||b.market,b.odds,done?b.result:'');
      /* BOTDKEEP_20261024: once settled, keep the result even if another script redraws the card */
      if(done&&!window.__botdKeep){window.__botdKeep=1;var st=document.getElementById('bet-status');if(st&&window.MutationObserver)new MutationObserver(function(){if(/pending/i.test(st.textContent))fill(b.home+sc+b.away,b.market_label||b.market,b.odds,b.result);}).observe(st,{childList:true,subtree:true,characterData:true});}
    }).catch(function(){});
  }
  window.loadBotd=run;
  setTimeout(run,1500);setTimeout(run,4000);
})();
