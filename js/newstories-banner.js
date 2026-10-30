
(function(){
  var baseline = null;
  var bannerShown = false;

  function checkNewStories(){
    fetch('/data/content_lite.json?'+Math.floor(Date.now()/60000))
      .then(function(r){return r.json();})
      .then(function(d){
        var ts = d.generated_at || '';
        if(!baseline){ baseline = ts; return; }
        if(ts !== baseline && !bannerShown){ showBanner(); }
      })
      .catch(function(){});
  }

  function showBanner(){
    bannerShown = true;
    var b = document.getElementById('nmw-new-stories-banner');
    if(b) return;
    b = document.createElement('div');
    b.id = 'nmw-new-stories-banner';
    b.style.cssText = 'position:fixed;top:56px;left:50%;transform:translateX(-50%);z-index:9999;background:var(--accent,#00c896);color:#fff;font-size:13px;font-weight:600;padding:8px 20px;border-radius:20px;box-shadow:0 2px 12px rgba(0,0,0,0.18);cursor:pointer;white-space:nowrap;';
    b.textContent = 'New stories - tap to refresh';
    b.addEventListener('click', function(){ location.reload(); });
    document.body.appendChild(b);
  }

  // Set baseline on first check, then poll every 3 mins
  checkNewStories();
  setInterval(checkNewStories, 3 * 60 * 1000);
})();
