const RATE={kosm:[8,12],kap:[18,24],diz:[24,32]};
const STK={novo:1,wb:.82,vtor:1.08};
const TERM={kosm:[30,45],kap:[60,75],diz:[90,120]};
const fmt=n=>n.toLocaleString('ru-RU');
function calc(){
  const ct=document.querySelector('input[name=ct]:checked').value;
  const st=document.querySelector('input[name=st]:checked').value;
  const a=+document.getElementById('area').value;
  document.getElementById('areaV').textContent=a;
  const k=STK[st]||1,[r1,r2]=RATE[ct];
  const lo=Math.round(a*r1*1000*k/10000)*10000, hi=Math.round(a*r2*1000*k/10000)*10000;
  document.getElementById('calcOut').textContent=fmt(lo)+' – '+fmt(hi)+' ₽';
  const [t1,t2]=TERM[ct];
  document.getElementById('calcM').textContent='≈ '+fmt(Math.round(r1*k))+' 000–'+fmt(Math.round(r2*k))+' 000 ₽/м² · работы · '+t1+'–'+t2+' дней';
}
document.getElementById('miniCalc').addEventListener('input',calc);calc();
