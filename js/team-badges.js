// 90minWaffle — Global Team Badge Resolver v2
(function(){
  window._teamBadges = null;
  window._badgeCallbacks = [];
  window._badgeLoading = false;

  function lookup(name) {
    if (!name || !window._teamBadges) return null;
    return _teamBadges[name]
      || _teamBadges[name.replace(/ FC$| AFC$| SC$| CF$| United$/,'')]
      || null;
  }

  window.getBadge = function(name, cb) {
    if (!name) { if(cb) cb(null); return null; }
    if (window._teamBadges) {
      var b = lookup(name);
      if (cb) cb(b); return b;
    }
    if (cb) window._badgeCallbacks.push({name:name, cb:cb});
    if (!window._badgeLoading) {
      window._badgeLoading = true;
      fetch('/data/team_badges.json?t='+Math.floor(Date.now()/3600000))
        .then(function(r){return r.json();})
        .then(function(d){
          window._teamBadges = d.badges || {};
          window._badgeCallbacks.forEach(function(item){
            item.cb(lookup(item.name));
          });
          window._badgeCallbacks = [];
        })
        .catch(function(){ window._teamBadges = {}; });
    }
    return null;
  };

  window.getBadgeById = function(afId, cb) {
    var key = '__af_' + afId;
    return window.getBadge(key, cb);
  };

  window.badgeImg = function(name, size, cls) {
    size = size || 20; cls = cls || 'team-badge-img';
    var b = window._teamBadges ? lookup(name) : null;
    if (b) return '<img src="'+b+'" class="'+cls+'" style="width:'+size+'px;height:'+size+'px;object-fit:contain;vertical-align:middle" onerror="this.style.display=\'none\'">';
    return '<span class="team-badge-init" style="display:inline-flex;align-items:center;justify-content:center;width:'+size+'px;height:'+size+'px;background:#1f1f1f;border-radius:3px;font-size:'+(size*0.35)+'px;font-weight:700;color:#666">'+name.substring(0,2).toUpperCase()+'</span>';
  };

  // Auto-load badges on script load
  window.getBadge('__preload__');
})();

/* A11Y_CRESTALT_20261023: decorative crests sit next to the team name */
(function(){function f(){var l=document.querySelectorAll('img.team-badge-img:not([alt])');for(var i=0;i<l.length;i++)l[i].setAttribute('alt','');}var q=0;function k(){if(q)return;q=1;requestAnimationFrame(function(){q=0;f();});}if(window.MutationObserver){new MutationObserver(k).observe(document.documentElement,{childList:true,subtree:true});}f();})();
