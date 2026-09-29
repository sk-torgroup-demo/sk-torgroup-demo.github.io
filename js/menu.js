/* Меню: панели открываются при наведении с небольшой задержкой, по клику и с клавиатуры; фото справа меняется от пункта. */
(function(){
var nav=document.querySelector('.mm');if(!nav)return;
var header=nav.closest('header'),line=nav.querySelector('.mm-line'),veil=document.querySelector('.mm-veil');
if(veil)document.body.appendChild(veil);
header.appendChild(line);
var items=[].slice.call(nav.querySelectorAll('.mm-it'));
var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
var cur=null,tOpen=0,tClose=0,openY=0;

function moveLine(top){
  if(!top){line.style.opacity=0;return}
  var r=top.getBoundingClientRect(),h=header.getBoundingClientRect();
  line.style.width=(r.width-28)+'px';line.style.transform='translateX('+(r.left-h.left+14)+'px)';line.style.opacity=1;
}
function load(it){
  it.querySelectorAll('img[data-src]').forEach(function(i){i.src=i.dataset.src;i.removeAttribute('data-src')});
  if(!it.dataset.pre){it.dataset.pre=1;it.querySelectorAll('a[data-img]').forEach(function(a){var im=new Image();im.src=a.dataset.img})}
}
function setOpen(it,on){it.classList.toggle('open',on);var b=it.querySelector('.mm-top');if(b&&b.tagName==='BUTTON')b.setAttribute('aria-expanded',on?'true':'false')}
function open(it){
  clearTimeout(tClose);if(cur===it)return;
  header.classList.toggle('mm-switch',!!cur);
  if(cur)setOpen(cur,false);
  load(it);setOpen(it,true);cur=it;openY=scrollY;
  header.classList.add('mm-active');veil&&veil.classList.add('on');
  if(header.classList.contains('mm-switch'))requestAnimationFrame(function(){requestAnimationFrame(function(){header.classList.remove('mm-switch')})});
}
function closeAll(){
  clearTimeout(tOpen);
  if(cur){setOpen(cur,false);cur=null}
  header.classList.remove('mm-active');veil&&veil.classList.remove('on');moveLine(null);
}
items.forEach(function(it){
  var top=it.querySelector('.mm-top'),panel=it.querySelector('.mm-panel');
  if(fine){
    it.addEventListener('mouseenter',function(){
      clearTimeout(tClose);clearTimeout(tOpen);moveLine(top);
      if(!panel){if(cur)tOpen=setTimeout(closeAll,140);return}
      tOpen=setTimeout(function(){open(it)},cur?40:110);
    });
    it.addEventListener('mouseleave',function(){clearTimeout(tOpen);tClose=setTimeout(closeAll,220)});
  }
  if(!panel)return;
  top.addEventListener('click',function(e){e.preventDefault();if(cur===it&&!fine){closeAll()}else{open(it);moveLine(top)}});
  var fig=panel.querySelector('.mm-pic'),img=fig&&fig.querySelector('img'),cap=fig&&fig.querySelector('figcaption'),swapT=0;
  panel.querySelectorAll('a[data-img]').forEach(function(a){
    a.addEventListener('mouseenter',function(){
      if(!img||img.getAttribute('src')===a.dataset.img)return;
      clearTimeout(swapT);fig.classList.add('swap');
      swapT=setTimeout(function(){img.src=a.dataset.img;cap.textContent=a.dataset.cap||'';setTimeout(function(){fig.classList.remove('swap')},60)},180);
    });
  });
  panel.addEventListener('focusin',function(){open(it)});
});
nav.addEventListener('focusout',function(e){if(!nav.contains(e.relatedTarget))closeAll()});
veil&&veil.addEventListener('click',closeAll);
addEventListener('keydown',function(e){if(e.key==='Escape'&&cur){var t=cur.querySelector('.mm-top');closeAll();t&&t.focus()}});
addEventListener('scroll',function(){if(cur&&Math.abs(scrollY-openY)>80)closeAll()},{passive:true});
addEventListener('resize',closeAll);
})();
