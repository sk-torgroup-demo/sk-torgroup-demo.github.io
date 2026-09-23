/* Заказ звонка: выпадающая форма в шапке (открыть, закрыть по Esc и клику мимо). */
(function(){
var btn=document.getElementById('cbBtn'), box=document.getElementById('cbBox');
if(!btn||!box)return;
function open(v){
  box.hidden=!v; btn.setAttribute('aria-expanded', v?'true':'false');
  if(v){var f=box.querySelector('input[name=name]')||box.querySelector('input'); if(f)setTimeout(function(){f.focus()},30)}
}
btn.addEventListener('click',function(e){e.stopPropagation(); open(box.hidden)});
var m=document.getElementById('cbBtnM');  // та же форма из мобильного меню
if(m)m.addEventListener('click',function(e){e.stopPropagation(); var nav=document.getElementById('mnav'); if(nav)nav.classList.remove('open'); open(true)});
document.addEventListener('click',function(e){ if(!box.hidden && !box.contains(e.target) && e.target!==btn) open(false) });
document.addEventListener('keydown',function(e){ if(e.key==='Escape' && !box.hidden){open(false); btn.focus()} });
})();
