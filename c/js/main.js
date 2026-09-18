const tb=document.getElementById('topbar');tb&&addEventListener('scroll',()=>{tb.classList.toggle('compact',scrollY>60)},{passive:true});
const burger=document.getElementById('burger'),mnav=document.getElementById('mnav');burger&&burger.addEventListener('click',()=>{const o=mnav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
const mbar=document.getElementById('mbar');const fb=document.querySelector('.formband, .final');
mbar&&addEventListener('scroll',()=>{const past=scrollY>innerHeight*1.5;const nf=fb?fb.getBoundingClientRect().top<innerHeight:true;mbar.classList.toggle('on',past&&!nf)},{passive:true});
document.querySelectorAll('.clist').forEach(cl=>{const upd=()=>{const n=cl.querySelectorAll('summary input:checked').length;const p=cl.parentElement.querySelector('.cprog');if(p)p.textContent='Проверено: '+n+' из '+cl.querySelectorAll('summary input').length;};cl.addEventListener('change',upd);upd();});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;io.unobserve(el);if(el.dataset.static)return;const end=+el.dataset.count,suf=el.dataset.suffix||'';if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=end+suf;return}let t0=null;const step=ts=>{if(!t0)t0=ts;const p=Math.min((ts-t0)/900,1);el.textContent=Math.round(end*p)+suf;if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step);}),{threshold:.6});
document.querySelectorAll('.num b[data-count]').forEach(el=>io.observe(el));

// --- Цели Метрики (карта событий v1). Работает при подключённом счётчике. ---
function goal(name,params){try{if(typeof ym==='function'&&window.__ym_id)ym(window.__ym_id,'reachGoal',name,params||{})}catch(e){}}
document.addEventListener('click',e=>{
  const a=e.target.closest('a,button'); if(!a) return;
  const href=a.getAttribute('href')||'';
  if(href.startsWith('tel:')) goal('phone_click',{page:location.pathname});
  if(href.includes('/kalkulyator-remonta/')) goal('calc_open',{from:location.pathname});
  if(a.closest('.magnet')) goal('magnet_click',{page:location.pathname});
  if(a.closest('.cam-link')||href.includes('/obekty-online/')) goal('objects_view');
  if(a.classList.contains('btn-amber')&&a.closest('.formband,.final')) goal('lead_button');
});
document.querySelectorAll('#bigCalc,#miniCalc').forEach(f=>{let fired=false;f.addEventListener('input',()=>{if(!fired){fired=true;goal('calc_use',{page:location.pathname})}})});

/* ================= Cookie-баннер (152-ФЗ) ================= */
(function(){
  function getCk(n){var m=document.cookie.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):''}
  function setCk(n,v){var d=new Date();d.setTime(d.getTime()+365*864e5);document.cookie=n+'='+encodeURIComponent(v)+';expires='+d.toUTCString()+';path=/;SameSite=Lax'}
  window.__ckConsent=function(){return getCk('ck_consent')};
  var html='<div id="ckb" role="dialog" aria-label="Использование файлов cookie">'+
    '<b>Мы используем файлы cookie</b>'+
    '<p>Технические cookie нужны для работы сайта. Аналитические и маркетинговые помогают нам понимать, какие страницы полезны, и оценивать рекламу. Вы можете принять все или оставить только необходимые. Подробнее — в <a href="/c/politika/">политике обработки данных</a>.</p>'+
    '<div class="row"><button class="btn btn-amber" id="ck-all">Принять все</button>'+
    '<button class="btn-line" id="ck-need">Только необходимые</button>'+
    '<button class="lnk" id="ck-set">Настроить</button></div>'+
    '<div id="ckp"><label><input type="checkbox" checked disabled> <span><b>Технические</b> — работа сайта и форм. Отказ невозможен.</span></label>'+
    '<label><input type="checkbox" id="ck-an"> <span><b>Аналитические</b> — статистика посещаемости и поведение на страницах (Яндекс Метрика).</span></label>'+
    '<label><input type="checkbox" id="ck-mk"> <span><b>Маркетинговые</b> — оценка эффективности рекламы (Яндекс Директ).</span></label>'+
    '<button class="btn btn-teal" id="ck-save" style="margin-top:6px">Сохранить выбор</button></div></div>';
  function show(){
    if(!document.getElementById('ckb')) document.body.insertAdjacentHTML('beforeend', html);
    var box=document.getElementById('ckb'); box.classList.add('on');
    document.getElementById('ck-all').onclick=function(){setCk('ck_consent','all');if(window.ymLoad)ymLoad();box.classList.remove('on')};
    document.getElementById('ck-need').onclick=function(){setCk('ck_consent','necessary');box.classList.remove('on')};
    document.getElementById('ck-set').onclick=function(){document.getElementById('ckp').classList.toggle('on')};
    document.getElementById('ck-save').onclick=function(){
      var an=document.getElementById('ck-an').checked, mk=document.getElementById('ck-mk').checked;
      setCk('ck_consent', (an||mk)?'all':'necessary');
      if((an||mk)&&window.ymLoad)ymLoad();
      box.classList.remove('on');
    };
  }
  window.cookiePrefs=function(){show();document.getElementById('ckp').classList.add('on');return false};
  if(!getCk('ck_consent')) { if(document.readyState!=='loading') show(); else document.addEventListener('DOMContentLoaded',show); }
})();
