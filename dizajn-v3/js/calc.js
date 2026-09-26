// калькулятор

const RATE={kosm:[8,12],kap:[18,24],diz:[24,32]};
const STK={novo:1,wb:.82,vtor:1.08};
const TERM={kosm:[30,45],kap:[60,75],diz:[90,120]};
const fmt=n=>n.toLocaleString('ru-RU');
const area=document.getElementById('area'),areaN=document.getElementById('areaN');
function calc(){
  const ct=document.querySelector('input[name=ct]:checked').value;
  const st=document.querySelector('input[name=st]:checked').value;
  const wc=document.querySelector('input[name=wc]:checked').value;
  const mat=document.getElementById('mat').checked;
  const a=Math.min(st==='dom'?400:150,Math.max(20,+areaN.value||54));  // у домов площади больше квартирных
  area.value=a;areaN.value=a;
  let k=(STK[st]||1)*(wc==='2'?1.08:1)*(mat?1.7:1);
  const [r1,r2]=RATE[ct];
  const lo=Math.round(a*r1*1000*k/10000)*10000, hi=Math.round(a*r2*1000*k/10000)*10000;
  document.getElementById('out').textContent=fmt(lo)+' – '+fmt(hi)+' ₽';
  document.getElementById('outM').textContent=(mat?'работы и материалы':'только работы')+' · '+a+' м²';
  const [t1,t2]=TERM[ct];
  document.getElementById('outT').textContent='срок '+t1+'–'+t2+' дней · ≈ '+fmt(Math.round((lo+hi)/2/a/1000))+' 000 ₽/м²';
}
document.getElementById('bigCalc').addEventListener('input',calc);
area.addEventListener('input',()=>{areaN.value=area.value;calc()});
calc();
// шаг телефона
document.getElementById('smetaBtn').addEventListener('click',()=>{
  const t=document.getElementById('telStep');
  if(!t.classList.contains('on')){t.classList.add('on');t.querySelector('input').focus();}
});
