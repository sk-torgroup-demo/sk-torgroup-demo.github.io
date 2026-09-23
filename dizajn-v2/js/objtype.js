/* Объект расчёта: «загородный дом» считаем по проекту — цифры прячем, показываем подсказку. Работает и в мини-калькуляторе, и на странице калькулятора. ?obj=dom открывает сразу его. */
(function(){
var box=document.getElementById('miniCalc')||document.getElementById('bigCalc')||document;
var sts=box.querySelectorAll('input[name=st]'); if(!sts.length)return;
var note=document.querySelector('.a-obj-note');
var res=box.querySelector('.a-res')||document.querySelector('.result .rv, .result');
function upd(){
  var v=(document.querySelector('input[name=st]:checked')||{}).value, dom=(v==='dom');
  if(note)note.hidden=!dom;
  if(res)res.style.display=dom?'none':'';   // не оставляем пустое место от спрятанных цифр
}
sts.forEach(function(r){r.addEventListener('change',upd)});
var q=new URLSearchParams(location.search).get('obj');
if(q){var r=document.querySelector('input[name=st][value="'+q+'"]'); if(r){r.checked=true; r.dispatchEvent(new Event('change',{bubbles:true}))}}
upd();
})();
