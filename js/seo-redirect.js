(function(){
  try{
    var u=new URL(location.href), q=u.searchParams;
    if(q.get('full')) return;
    var ref=(document.referrer||'').replace(location.origin,'');
    if(/^\/(player\/[a-z0-9-]+|clubs\/[a-z0-9-]+)\/?(\?|#|$)/.test(ref)) return;
    var type=null, key=null;
    if(u.pathname==='/player/'){ type='p'; key=q.get('id')||q.get('af_id'); }
    else if(u.pathname==='/club/'){ type='c'; key=(q.get('name')||'').toLowerCase().trim(); }
    if(!key) return;
    fetch('/data/seo_links.json').then(function(r){return r.json();}).then(function(m){
      var t=m[type][key] || (type==='c' && m.c[key.replace(/\s+(fc|afc|cf)$/,'')]);
      if(t) location.replace(t);
    }).catch(function(){});
  }catch(e){}
})();
