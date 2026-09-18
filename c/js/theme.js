/* Вариант А: анимации главной. Без библиотек, только transform/opacity/clip-path. */
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var root=document.documentElement;
var anim=!reduce;
root.classList.add('x-js');
root.classList.add(anim?'x-anim':'x-reduce');
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
var lerp=function(a,b,t){return a+(b-a)*t};
var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
var seg=function(p,a,b){return clamp((p-a)/(b-a),0,1)};
var vh=innerHeight;addEventListener('resize',function(){vh=innerHeight;measure();tick()});

/* прогресс прокрутки внутри высокой секции с липким экраном: 0 в начале, 1 в конце */
function progress(sec,off){off=off||0;var r=sec.getBoundingClientRect();var len=sec.offsetHeight-(vh-off);return len>0?clamp((off-r.top)/len,0,1):0}
function inView(el){var r=el.getBoundingClientRect();return r.bottom>-vh*.2&&r.top<vh*1.2}

/* ---------- буквы и слова ---------- */
document.querySelectorAll('[data-letters]').forEach(function(el){
  var t=el.textContent;el.setAttribute('aria-label',t);el.textContent='';
  t.split('').forEach(function(ch,i){var s=document.createElement('span');s.className='x-l';s.setAttribute('aria-hidden','true');s.style.setProperty('--i',i);s.textContent=ch;el.appendChild(s)});
});
function splitWords(el,cls){
  var nodes=[].slice.call(el.childNodes);el.innerHTML='';var n=0;
  nodes.forEach(function(node){
    if(node.nodeType===3){node.textContent.split(/(\s+)/).forEach(function(w){
      if(!w)return;if(/^\s+$/.test(w)){el.appendChild(document.createTextNode(' '));return}
      var o=document.createElement('span');o.className=cls;var i=document.createElement('span');i.textContent=w;i.style.setProperty('--i',n++);o.appendChild(i);el.appendChild(o)})}
    else{var o=document.createElement('span');o.className=cls;var i=document.createElement('span');i.appendChild(node);i.style.setProperty('--i',n++);o.appendChild(i);el.appendChild(o)}
  });
}
if(!reduce){
  document.querySelectorAll('[data-split]').forEach(function(el){splitWords(el,'x-w')});
  document.querySelectorAll('[data-scrub]').forEach(function(el){splitWords(el,'x-sw')});
}

/* ---------- появление при входе в экран ---------- */
if(!reduce&&'IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('x-in');e.target.classList.remove('rv-wait');io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px'});
  document.querySelectorAll('[data-split],[data-rv]').forEach(function(el){
    if(el.hasAttribute('data-rv')&&el.getBoundingClientRect().top>vh){el.classList.add('rv-wait');el.style.transitionDelay=(+el.dataset.rv||0)*80+'ms'}
    io.observe(el)
  });
}else{document.querySelectorAll('[data-split]').forEach(function(el){el.classList.add('x-in')})}

/* ---------- 1. первый экран: полёт сквозь слово ---------- */
var hero=document.querySelector('.x-hero'),mask=hero&&hero.querySelector('.x-mask'),word=hero&&hero.querySelector('.x-word');
var heroOrigin={x:50,y:50};
function measure(){
  if(!hero||!word)return;
  mask.style.transform='none';
  var letters=word.querySelectorAll('.x-l');var o=letters[3]||word;var r=o.getBoundingClientRect();var m=mask.getBoundingClientRect();
  // левая стенка буквы «О»: при увеличении она закрывает экран фото
  heroOrigin={x:(r.left+r.width*.2-m.left)/m.width*100,y:(r.top+r.height*.52-m.top)/m.height*100};
  mask.style.transformOrigin=heroOrigin.x+'% '+heroOrigin.y+'%';
}
function heroTick(){
  if(!hero)return;
  document.body.classList.toggle('x-on-hero',hero.getBoundingClientRect().bottom>90);
  if(!anim)return;
  var p=progress(hero);
  hero.classList.toggle('x-zoom',p>.1);
  var z=ease(seg(p,.02,.62));
  mask.style.transform='scale('+lerp(1,26,z*z)+')';
  mask.style.opacity=1-seg(p,.38,.62);
  hero.style.setProperty('--hp',p.toFixed(3));
  hero.classList.toggle('x-done',p>.62);
}

/* ---------- 2. ремонт на глазах ---------- */
var story=document.querySelector('.x-story');
var steps=story?[].slice.call(story.querySelectorAll('.x-steps li')):[];
var dayEl=story&&story.querySelector('[data-day]'),barEl=story&&story.querySelector('[data-bar]');
// границы этапов по прогрессу и по дням: замер, договор, черновые, чистовые, сдача
var STG=[0,.16,.32,.58,.84,1],DAYS=[1,2,3,36,68,71];
function storyTick(){
  if(!story||!anim)return;
  var p=progress(story,64);
  var st=0;for(var i=0;i<5;i++)if(p>=STG[i])st=i;
  var local=seg(p,STG[st],STG[st+1]);
  story.dataset.stage=st;
  steps.forEach(function(li,i){li.classList.toggle('on',i===st);li.classList.toggle('past',i<st)});
  var day=Math.round(lerp(DAYS[st],DAYS[st+1],local));
  if(dayEl)dayEl.textContent=day;
  if(barEl)barEl.style.transform='scaleX('+(day/75).toFixed(3)+')';
  story.style.setProperty('--m',seg(p,0,.12).toFixed(3));        // размеры рисуются
  story.style.setProperty('--wipe',ease(seg(p,.6,.82)).toFixed(3)); // было → стало
  story.style.setProperty('--sp',local.toFixed(3));
}

/* ---------- 3. работы: лента вбок ---------- */
var works=document.querySelector('.x-works'),track=works&&works.querySelector('.x-track'),wprog=works&&works.querySelector('[data-wprog]');
var wide=matchMedia('(min-width:901px)');
function worksSize(){
  if(!works||!track)return;
  if(!wide.matches||reduce){works.style.height='';track.style.transform='';return}
  var dist=track.scrollWidth-innerWidth;
  works.style.height=(dist+vh)+'px'; // липкий экран ниже шапки на 64px, высота с запасом
  works.dataset.dist=dist;
}
function worksTick(){
  if(!works||!track||!wide.matches||reduce)return;
  var p=progress(works,64);
  track.style.transform='translate3d('+(-p*(+works.dataset.dist||0))+'px,0,0)';
  if(wprog)wprog.style.transform='scaleX('+p.toFixed(3)+')';
}

/* ---------- 5. фраза проявляется словами ---------- */
var scrubs=[].slice.call(document.querySelectorAll('[data-scrub]'));
function scrubTick(){
  scrubs.forEach(function(el){
    if(!inView(el))return;
    var r=el.getBoundingClientRect();var p=clamp((vh*.85-r.top)/(vh*.55),0,1);
    var w=el.querySelectorAll('.x-sw>span');var n=w.length;
    w.forEach(function(s,i){s.style.opacity=(.14+.86*clamp(p*n-i,0,1)).toFixed(2)});
  });
}

/* ---------- параллакс телефона ---------- */
var par=[].slice.call(document.querySelectorAll('[data-parallax]'));
function parTick(){par.forEach(function(el){if(!inView(el))return;var r=el.parentElement.getBoundingClientRect();var c=(r.top+r.height/2-vh/2)/vh;el.style.transform='translate3d(0,'+(c*-60).toFixed(1)+'px,0) rotate('+(c*-3).toFixed(2)+'deg)'})}

/* ---------- общий цикл прокрутки ---------- */
var ticking=false;
function tick(){ticking=false;heroTick();storyTick();worksTick();scrubTick();parTick()}
function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(tick)}}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('load',function(){measure();worksSize();tick()});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){measure();worksSize();tick()});
wide.addEventListener&&wide.addEventListener('change',function(){worksSize();tick()});
measure();worksSize();tick();
requestAnimationFrame(function(){root.classList.add('x-ready')});

/* ---------- часы камеры ---------- */
var clocks=document.querySelectorAll('[data-clock]');
if(clocks.length){var two=function(n){return(n<10?'0':'')+n};setInterval(function(){var d=new Date();var t=two(d.getHours())+':'+two(d.getMinutes())+':'+two(d.getSeconds());clocks.forEach(function(c){c.textContent=t})},1000)}

/* ---------- курсор «Смотреть» над работами ---------- */
var cur=document.querySelector('.x-cursor');
if(cur&&matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce){
  var cx=0,cy=0,tx=0,ty=0,raf=0;
  function loop(){cx+= (tx-cx)*.2;cy+=(ty-cy)*.2;cur.style.transform='translate3d('+cx+'px,'+cy+'px,0)';raf=Math.abs(tx-cx)+Math.abs(ty-cy)>.5?requestAnimationFrame(loop):0}
  document.querySelectorAll('[data-cursor]').forEach(function(a){
    a.addEventListener('mouseenter',function(){cur.classList.add('on')});
    a.addEventListener('mouseleave',function(){cur.classList.remove('on')});
  });
  addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;if(!raf)raf=requestAnimationFrame(loop)},{passive:true});
}

/* ---------- услуги: фото у курсора ---------- */
var fl=document.querySelector('.x-float'),flImg=fl&&fl.querySelector('img');
if(fl&&matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce){
  var fx=0,fy=0,gx=0,gy=0,fr=0;
  function floop(){fx+=(gx-fx)*.14;fy+=(gy-fy)*.14;fl.style.transform='translate3d('+fx+'px,'+fy+'px,0)';fr=Math.abs(gx-fx)+Math.abs(gy-fy)>.5?requestAnimationFrame(floop):0}
  document.querySelectorAll('.x-srow').forEach(function(row){
    var src=row.dataset.img;var pre=new Image();pre.src=src;
    row.addEventListener('mouseenter',function(){flImg.src=src;fl.classList.add('on')});
    row.addEventListener('mouseleave',function(){fl.classList.remove('on')});
  });
  addEventListener('mousemove',function(e){gx=e.clientX;gy=e.clientY;if(!fr)fr=requestAnimationFrame(floop)},{passive:true});
}

/* ---------- бегущая строка: копия для бесконечной прокрутки ---------- */
document.querySelectorAll('.x-mq-track').forEach(function(t){var c=t.cloneNode(true);c.setAttribute('aria-hidden','true');c.querySelectorAll('a').forEach(function(a){a.tabIndex=-1});t.parentElement.appendChild(c)});

/* ---------- калькулятор: цифры плавно докручиваются ---------- */
var out=document.getElementById('calcOut');
if(out&&!reduce&&'MutationObserver' in window){
  var shown=out.textContent,lastSet=null,craf=0;
  var nums=function(s){return(s.match(/\d[\d\s]*\d|\d/g)||[]).map(function(x){return+x.replace(/\s/g,'')})};
  var fmt=function(n){return n.toLocaleString('ru-RU')};
  new MutationObserver(function(){
    var target=out.textContent;if(target===lastSet)return;
    var a=nums(shown),b=nums(target);if(a.length!==2||b.length!==2){shown=target;return}
    cancelAnimationFrame(craf);var t0=performance.now();
    function step(now){var k=ease(clamp((now-t0)/450,0,1));
      var txt=k<1?fmt(Math.round(lerp(a[0],b[0],k)/10000)*10000)+' – '+fmt(Math.round(lerp(a[1],b[1],k)/10000)*10000)+' ₽':target;
      lastSet=txt;out.textContent=txt;shown=txt;if(k<1)craf=requestAnimationFrame(step)}
    step(t0);
  }).observe(out,{childList:true,characterData:true,subtree:true});
}
})();
