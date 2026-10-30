/* hscroll.js - desktop arrows + wheel scroll for horizontal pill bars */
(function(){
  var SELECTORS=['.filters','.me-pills','.filter-bar','.t-tabs','.lpills','.fpills','.tabs','.stats-row','.cat-strip','#pillBarDynamic'];
  var DESKTOP=window.matchMedia('(hover: hover) and (pointer: fine)');

  var css='.hs-wrap{position:relative;}'+
  '.hs-arrow{display:none;position:absolute;top:50%;transform:translateY(-50%);z-index:5;width:26px;height:26px;border-radius:50%;border:1px solid var(--border,#333);background:var(--bg-card,#111);color:var(--text,#eee);cursor:pointer;font-size:0.75rem;line-height:1;align-items:center;justify-content:center;padding:0;transition:opacity 0.15s;}'+
  '.hs-arrow.hs-left{left:2px;}.hs-arrow.hs-right{right:2px;}'+
  '.hs-arrow:hover{border-color:var(--accent,#c6ff00);color:var(--accent,#c6ff00);}'+
  '.hs-arrow.hs-dim{opacity:0.25;pointer-events:none;}'+
  '@media (hover: hover) and (pointer: fine){.hs-wrap.hs-active .hs-arrow{display:flex;}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  function enhance(el){
    if(el.dataset.hscroll)return;
    if(el.closest('.lpills-wrap'))return; /* edges bar already patched manually */
    el.dataset.hscroll='1';

    var wrap=document.createElement('div');wrap.className='hs-wrap';
    el.parentNode.insertBefore(wrap,el);wrap.appendChild(el);

    var L=document.createElement('button');L.className='hs-arrow hs-left';L.innerHTML='&#9664;';L.setAttribute('aria-label','Scroll left');
    var R=document.createElement('button');R.className='hs-arrow hs-right';R.innerHTML='&#9654;';R.setAttribute('aria-label','Scroll right');
    wrap.appendChild(L);wrap.appendChild(R);

    L.addEventListener('click',function(){el.scrollBy({left:-200,behavior:'smooth'});});
    R.addEventListener('click',function(){el.scrollBy({left:200,behavior:'smooth'});});

    el.addEventListener('wheel',function(e){
      if(!DESKTOP.matches)return;
      if(e.deltaY&&!e.deltaX&&el.scrollWidth>el.clientWidth+4){
        e.preventDefault();el.scrollBy({left:e.deltaY,behavior:'auto'});
      }
    },{passive:false});

    function update(){
      var over=el.scrollWidth>el.clientWidth+4;
      wrap.classList.toggle('hs-active',over);
      if(over){
        L.classList.toggle('hs-dim',el.scrollLeft<=2);
        R.classList.toggle('hs-dim',el.scrollLeft>=el.scrollWidth-el.clientWidth-2);
      }
    }
    el.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update);
    el._hsUpdate=update;
    update();
  }

  function scan(){
    SELECTORS.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        enhance(el);
        if(el._hsUpdate)el._hsUpdate(); /* re-check overflow as content loads */
      });
    });
  }

  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',scan);}else{scan();}
  /* re-scan for JS-rendered bars (pillBarDynamic, lpills etc.) */
  [500,1500,3000,6000].forEach(function(t){setTimeout(scan,t);});
})();
