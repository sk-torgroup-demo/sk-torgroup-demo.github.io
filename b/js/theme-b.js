/* Вариант Б: простые анимации. Никакой прокрутки «за пользователя»: всё листается как обычный сайт. */
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('b-js');

/* появление блоков при прокрутке */
if(!reduce&&'IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -12% 0px'});
  document.querySelectorAll('[data-rv]').forEach(function(el){
    if(el.getBoundingClientRect().top>innerHeight*.9){el.classList.add('rv');el.style.transitionDelay=(+el.dataset.rv||0)*90+'ms';io.observe(el)}
    else el.classList.add('in');
  });
}

/* первый экран: фото сменяются по кругу */
var slides=[].slice.call(document.querySelectorAll('.b-slide')),dots=[].slice.call(document.querySelectorAll('.b-dots i'));
if(slides.length>1){
  var cur=0;
  function show(n){slides[cur].classList.remove('on');dots[cur]&&dots[cur].classList.remove('on');cur=n;slides[cur].classList.add('on');if(dots[cur]){dots[cur].classList.remove('on');void dots[cur].offsetWidth;dots[cur].classList.add('on')}}
  if(!reduce)setInterval(function(){if(!document.hidden)show((cur+1)%slides.length)},6000);
}

/* личный кабинет: вкладки переключают экран телефона, сами листаются, пока человек не нажал */
var tabs=[].slice.call(document.querySelectorAll('.b-tabs [data-screen]')),scr=[].slice.call(document.querySelectorAll('.b-scr'));
var nav=[].slice.call(document.querySelectorAll('.b-app-nav i'));
if(tabs.length){
  var at=0,auto=!reduce,timer=null,phone=document.querySelector('.b-mock');
  function pick(n,user){
    at=n;
    tabs.forEach(function(t,i){t.setAttribute('aria-selected',i===n?'true':'false')});
    scr.forEach(function(s,i){s.classList.toggle('on',i===n)});
    nav.forEach(function(d,i){d.classList.toggle('on',i===Math.min(n,nav.length-1))});
    if(user){auto=false;clearInterval(timer)}
  }
  tabs.forEach(function(t,i){t.addEventListener('click',function(){pick(i,true)})});
  if(auto&&'IntersectionObserver' in window){
    new IntersectionObserver(function(es){es.forEach(function(e){
      clearInterval(timer);
      if(e.isIntersecting&&auto)timer=setInterval(function(){pick((at+1)%tabs.length)},4200);
    })},{threshold:.4}).observe(phone);
  }
}

/* живые часы камеры */
var clocks=document.querySelectorAll('[data-clock]');
if(clocks.length){var two=function(n){return(n<10?'0':'')+n};var tick=function(){var d=new Date();var t=two(d.getHours())+':'+two(d.getMinutes())+':'+two(d.getSeconds());clocks.forEach(function(c){c.textContent=t})};tick();setInterval(tick,1000)}

/* было / стало */
document.querySelectorAll('.ba').forEach(function(box){
  var r=box.querySelector('input[type=range]');
  function set(v){box.style.setProperty('--pos',v+'%')}
  r.addEventListener('input',function(){set(r.value);box.classList.add('touched')});
  set(r.value);
  // подсказка: ручка сама чуть качнётся, когда блок появится
  if(!reduce&&'IntersectionObserver' in window){
    new IntersectionObserver(function(es,o){es.forEach(function(e){if(!e.isIntersecting||box.classList.contains('touched'))return;o.disconnect();
      var t0=performance.now();(function step(now){if(box.classList.contains('touched'))return;var k=Math.min((now-t0)/1600,1);set((50+Math.sin(k*Math.PI*2)*14).toFixed(1));if(k<1)requestAnimationFrame(step);else set(50)})(t0);
    })},{threshold:.6}).observe(box);
  }
});
})();
