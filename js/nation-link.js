/* NATION_LINK_20261015: send /nations/team/<slug>/ links to the static nation page when it exists */
(function(){
  if(location.pathname.indexOf('/nations/team/')===0)return;
  var set=null;
  fetch('/data/nations.json').then(function(r){return r.json();}).then(function(d){
    set={};((d&&d.confederations)||[]).forEach(function(c){(c.nations||[]).forEach(function(n){if(n.slug)set[n.slug]=1;});});
  }).catch(function(){});
  document.addEventListener('click',function(e){
    if(!set)return;var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var m=(a.getAttribute('href')||'').match(/^\/nations\/team\/([a-z0-9-]+)\/?$/);
    if(m&&set[m[1]])a.setAttribute('href','/nations/'+m[1]+'/');
  },true);
})();
