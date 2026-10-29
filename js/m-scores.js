(function(){
if(!window.matchMedia('(max-width:768px)').matches)return;
var sel='';
function lg(c){var ch=c.querySelector('.chip-up,.chip-ft');if(!ch)return '';return ch.textContent.replace(/^FT\s*\u00b7?\s*/,'').trim();}
function proc(){
var cards=document.querySelectorAll('.match-card');
cards.forEach(function(c){var n=c.nextElementSibling;
if(n&&n.classList&&n.classList.contains('details-btn')){n.addEventListener('click',function(e){e.stopPropagation();});c.appendChild(n);}});
if(!cards.length)return;
var page=cards[0].parentElement;
if(!page||page.querySelector('.lpills'))return;
var list=[].slice.call(page.children).filter(function(x){return x.classList.contains('match-card');});
var leagues=[];
list.forEach(function(c){var l=lg(c);c._lg=l;if(l&&leagues.indexOf(l)<0)leagues.push(l);});
var row=page.querySelector(':scope > .m-lchips');
var key=leagues.join('|');
if(leagues.length<2){if(row)row.remove();list.forEach(function(c){c.style.display='';});return;}
if(sel&&leagues.indexOf(sel)<0)sel='';
if(!row||row.getAttribute('data-key')!==key){
if(row)row.remove();
row=document.createElement('div');row.className='m-lchips';row.setAttribute('data-key',key);
['All'].concat(leagues).forEach(function(l){
var b=document.createElement('div');b.className='m-lc';b.textContent=l;b.setAttribute('data-l',l==='All'?'':l);
b.addEventListener('click',function(){sel=b.getAttribute('data-l');proc();});
row.appendChild(b);});
page.insertBefore(row,page.firstChild);
}
[].forEach.call(row.children,function(b){b.classList.toggle('on',b.getAttribute('data-l')===sel);});
list.forEach(function(c){c.style.display=(!sel||!c._lg||c._lg===sel)?'':'none';});
[].slice.call(page.children).forEach(function(h){
if(!h.classList.contains('sec-hdr'))return;
var n=h.nextElementSibling,vis=false;
while(n&&!n.classList.contains('sec-hdr')){if(n.classList.contains('match-card')&&n.style.display!=='none')vis=true;n=n.nextElementSibling;}
h.style.display=(!sel||vis)?'':'none';});
}
var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(proc,80);}).observe(document.body,{childList:true,subtree:true});
proc();
})();
