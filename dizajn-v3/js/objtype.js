/* Объект расчёта: «загородный дом» считаем по своей ставке — от 7 000 ₽/м² за работы (цена заказчика, 25.09.2026).
   Показываем ориентир по площади вместо квартирной вилки. Работает и в мини-калькуляторе, и на странице калькулятора.
   ?obj=dom открывает сразу его. */
(function(){
var DOM_RATE=7000;  // ₽ за м², нижняя граница по домам
var box=document.getElementById('miniCalc')||document.getElementById('bigCalc')||document;
var sts=box.querySelectorAll('input[name=st]'); if(!sts.length)return;
var note=document.querySelector('.a-obj-note');
var res=box.querySelector('.a-res')||document.querySelector('.result');
var area=document.getElementById('area');
var areaN=document.getElementById('areaN');
var lbl=document.querySelector('label[for=area]');
var lblText=lbl?lbl.textContent:'';
var maxWas=area?area.max:'';
var maxWasN=areaN?areaN.max:'';

// свой блок с ориентиром: тот же вид, что у обычного результата
var own=document.createElement('div');
own.className=res&&res.className?res.className:'a-res';
own.hidden=true;
own.innerHTML='<div class="a-res-v" id="domOut"></div><div class="a-res-m" id="domM">от 7 000 ₽/м² · работы · точная смета после замера</div>';
if(res&&res.parentNode)res.parentNode.insertBefore(own,res.nextSibling);

function money(n){return n.toLocaleString('ru-RU').replace(/ /g,' ')+' ₽'}

var syncing=false;
function upd(){
  var v=(document.querySelector('input[name=st]:checked')||{}).value, dom=(v==='dom');
  if(note)note.hidden=!dom;
  if(res)res.style.display=dom?'none':'';
  own.hidden=!dom;
  // у домов площади больше квартирных: раздвигаем ползунок и меняем подпись.
  // При сужении браузер сам обрезает значение, поэтому сообщаем об этом странице, иначе подпись «250 м²» останется от дома.
  if(lbl)lbl.textContent=dom?'Площадь дома':lblText;
  [[area,maxWas],[areaN,maxWasN]].forEach(function(pair){
    var el=pair[0]; if(!el)return;
    var was=el.value;
    el.max=dom?'400':pair[1];
    if(el.value!==was&&!syncing){syncing=true; el.dispatchEvent(new Event('input',{bubbles:true})); syncing=false}
  });
  if(dom){
    var m=parseInt((areaN&&areaN.value)||(area&&area.value)||0,10)||0;  // на странице калькулятора главное поле — число, ползунок за ним
    var out=own.querySelector('#domOut');
    if(out)out.textContent=m?('от '+money(m*DOM_RATE)):'от 7 000 ₽/м²';
  }
}
sts.forEach(function(r){r.addEventListener('change',upd)});
if(area)area.addEventListener('input',upd);
if(areaN)areaN.addEventListener('input',upd);
var q=new URLSearchParams(location.search).get('obj');
if(q){var r=document.querySelector('input[name=st][value="'+q+'"]'); if(r){r.checked=true; r.dispatchEvent(new Event('change',{bubbles:true}))}}
upd();
})();
