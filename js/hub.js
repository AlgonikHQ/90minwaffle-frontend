/* STATS_HUB_20261015 */
(function(){
  function go(){
    var pg=document.querySelector('.page');
    if(!pg||document.getElementById('fsb'))return;
    var wrap=document.createElement('div');wrap.id='fcontent';
    while(pg.firstChild)wrap.appendChild(pg.firstChild);
    var t=document.createElement('div');t.id='fhub-title';
    t.innerHTML='<h1>Stats Hub</h1><p>Data tools. Smarter football insight.</p>';
    wrap.insertBefore(t,wrap.firstChild);
    var sb=document.createElement('aside');sb.id='fsb';sb.setAttribute('aria-label','Stats Hub');
    sb.innerHTML='<a class="on" href="/footballiq/">Stats Hub</a>'
      +'<a href="/me/">My Dashboard</a><a href="/me/#favourites">Favourites</a><a href="/me/#alerts">Alerts</a>'
      +'<a href="/footballiq/trends/">Data Explorer</a><a href="/footballiq/how-it-works/">Help &amp; Docs</a>'
      +'<div class="fsb-sep"></div><div class="fsb-note">Powered by data. Built for bettors, analysts and fans.</div>'
      +'<div class="fsb-upd"><b>Data updated</b><span id="fsb-when">Checking…</span></div>';
    pg.appendChild(sb);pg.appendChild(wrap);pg.classList.add('hub-on');
    pg.insertBefore(sb,wrap);
    fetch('/data/footballiq_current.json',{method:'HEAD'}).then(function(r){
      var lm=r.headers.get('last-modified');if(!lm)throw 0;
      var d=new Date(lm);document.getElementById('fsb-when').textContent=d.toLocaleString('en-GB',{timeZone:'Europe/London',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
    }).catch(function(){var e=document.getElementById('fsb-when');if(e)e.textContent='Updated daily';});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
/* STATS_HUB v2: tag pills under tool names */
(function(){
  var TAGS={'/footballiq/sims/':'Monte Carlo','/footballiq/form/':'Form analysis','/footballiq/trends/':'Hot & cold','/clubs/calculator/':'Title · Top 4 · Relegation','/clubs/':'Club profiles','/footballiq/?v=players':'23K+ players'};
  function tag(){
    document.querySelectorAll('.fiq-tools a.tool').forEach(function(a){
      if(a.querySelector('.tool-tag'))return;
      var t=TAGS[a.getAttribute('href')];var n=a.querySelector('.tool-name');
      if(!t||!n)return;
      var s=document.createElement('span');s.className='tool-tag';s.textContent=t;
      n.parentNode.insertBefore(s,n.nextSibling);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tag);else tag();
  setTimeout(tag,800);
})();
