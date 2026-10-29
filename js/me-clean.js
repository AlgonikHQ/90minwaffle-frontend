/* ME_CLEAN_20261015: two-column layout flag, only when the profile card is a direct child of #page */
(function(){
  var pg=document.getElementById('page');if(!pg)return;
  function f(){pg.classList.toggle('me-two',!!pg.querySelector(':scope > .profile-hero'));}
  f();new MutationObserver(f).observe(pg,{childList:true});setTimeout(f,800);
})();
