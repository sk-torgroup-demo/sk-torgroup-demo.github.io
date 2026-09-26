/* демо: заявки никуда не уходят */(function(){var f=window.fetch;window.fetch=function(u){if(String(u).indexOf('send.php')>-1){return Promise.resolve(new Response('{"ok":true}',{status:200}))}return f.apply(this,arguments)}})();
/* СК ТОР ГРУПП — формы: маска, согласия, отправка на /send.php, многошаговый квиз */
(function(){
const URL='/send.php';

/* ---------- маска телефона ---------- */
/* номер приводим к одному виду: 8..., +7..., 7..., 9... и вставка с пробелами и скобками */
function norm(v){
  var d=(v||'').replace(/\D/g,'');
  if(!d)return '';
  if(d[0]==='8')d='7'+d.slice(1);
  else if(d[0]!=='7')d='7'+d;
  return d.slice(0,11);
}
function fmt(v){
  var d=norm(v);
  if(!d)return '';
  var r='+7';
  if(d.length>1)r+=' ('+d.slice(1,4);
  if(d.length>=4)r+=') '+d.slice(4,7);
  if(d.length>=7)r+='-'+d.slice(7,9);
  if(d.length>=9)r+='-'+d.slice(9,11);
  return r;
}
function valid(v){return norm(v).length===11}
document.addEventListener('input',function(e){
  if(e.target && e.target.matches && e.target.matches('input[type=tel]')){
    e.target.value=fmt(e.target.value); e.target.style.borderColor='';
  }
});
function goal(n,p){try{if(typeof ym==='function'&&window.__ym_id)ym(window.__ym_id,'reachGoal',n,p||{})}catch(e){}}

/* ---------- согласия: кнопка активна только при отметке ---------- */
function scopeOf(el){return el.closest('form, .quiz, .kviz-box, .result, .formband, .final')||document}
/* кнопка включается, только когда заполнено всё: имя (если поле есть), телефон и галочка согласия */
function fieldsOk(sc){
  var tel=sc.querySelector('input[type=tel]');
  if(tel && !valid(tel.value))return false;
  var nm=sc.querySelector('input[name=name]');
  if(nm && nm.offsetParent!==null && nm.value.trim().length<2)return false;
  return true;
}
/* в калькуляторе первая кнопка открывает поле телефона: до этого её не блокируем */
function stepPending(sc){var t=sc.querySelector('#telStep'); return !!(t && !t.classList.contains('on'));}
function wireConsent(root){
  (root||document).querySelectorAll('.c-pd').forEach(function(cb){
    if(cb.dataset.wired)return; cb.dataset.wired='1';
    var sc=scopeOf(cb);
    var btn=sc.querySelector('button.btn-amber, button[type=submit], #smetaBtn');
    function upd(){ if(!btn)return; var hidden=(cb.offsetParent===null);  // согласие ещё не показано (шаги квиза, закрытая форма)
      if(hidden || stepPending(sc) || (cb.checked && fieldsOk(sc)))btn.removeAttribute('disabled'); else btn.setAttribute('disabled','disabled'); }
    cb.addEventListener('change',upd);
    sc.addEventListener('input',upd); sc.addEventListener('change',upd);
    upd();
  });
}
wireConsent(document);
function consentOf(el){
  var sc=scopeOf(el);
  var pd=sc.querySelector('.c-pd'), ads=sc.querySelector('.c-ads');
  return {pd: pd?!!pd.checked:true, ads: ads?!!ads.checked:false};
}

/* ---------- отправка ---------- */
function send(tel, box, note){
  if(!valid(tel.value)){tel.focus();tel.style.borderColor='#B6452C';return;}
  var c=consentOf(tel);
  if(!c.pd){alert('Отметьте согласие на обработку персональных данных');return;}
  var payload={phone:tel.value,page:location.pathname,utm:location.search,note:note||'',
    consent_pd:true,consent_ads:c.ads,policy_version:'1.0',consent_version:'1.0',ts:new Date().toISOString()};
  fetch(URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
   .then(function(r){ if(!r.ok) throw 0;
     goal('lead_submit',{page:location.pathname});
     box.innerHTML='<div class="q" style="text-align:center;padding:26px 0">Демо: заявка не отправлена<br><span style="font:300 13.5px var(--body);color:var(--muted)">Перезвоним за 15 минут в рабочее время</span></div>';
   })
   .catch(function(){ alert('Не удалось отправить. Позвоните нам: +7 (495) 256-21-11'); });
}

/* ---------- обычные формы ---------- */
document.querySelectorAll('form.formbox').forEach(function(f){
  var tel=f.querySelector('input[type=tel]');
  f.addEventListener('submit',function(e){e.preventDefault();
    var nm=f.querySelector('input[name=name]');            // форма заказа звонка: имя уходит в заявку
    if(nm && nm.offsetParent!==null && nm.value.trim().length<2){nm.focus();nm.style.borderColor='#B6452C';return;}
    if(tel)send(tel,f,nm&&nm.value.trim()?'имя: '+nm.value.trim():'');});
  f.addEventListener('input',function(e){ if(e.target&&e.target.name==='name')e.target.style.borderColor=''; });
});

/* ---------- калькулятор: детальная смета ---------- */
var smeta=document.getElementById('smetaBtn');
if(smeta){
  var box=smeta.closest('.result')||smeta.parentElement;
  smeta.addEventListener('click',function(){
    var step=document.getElementById('telStep');
    if(step && !step.classList.contains('on')){step.classList.add('on');var i=step.querySelector('input');if(i)i.focus();
      box.dispatchEvent(new Event('input',{bubbles:true}));  // теперь кнопка ждёт телефон и галочку
      return;}
    var tel=step?step.querySelector('input'):null, out=document.getElementById('out');
    if(tel)send(tel,box,'расчёт: '+(out?out.textContent.trim():''));
  });
}

/* ---------- КВИЗ: многошаговый ---------- */
var STEPS=[
 {q:'Какая у вас квартира?',o:['Новостройка без отделки / white box','Вторичка — нужен капитальный ремонт','Нужен ремонт части квартиры','Только санузел или комната']},
 {q:'Площадь квартиры',o:['до 40 м²','40–60 м²','60–90 м²','больше 90 м²']},
 {q:'Какой ремонт нужен?',o:['Косметический — освежить','Капитальный — всё заменить','Под ключ с дизайн-проектом','Пока не решили']},
 {q:'Сколько санузлов?',o:['Один','Два','Три и больше']},
 {q:'Когда планируете начать?',o:['Сейчас, ключи на руках','В ближайший месяц','Через 2–3 месяца','Просто прицениваюсь']},
 {q:'Материалы',o:['Закупаете вы, по спецификации','Куплю сам','Ещё не решил']}
];
document.querySelectorAll('.final .quiz, .kviz-box').forEach(function(q){
  var answers=[], step=0;
  var qEl=q.querySelector('.q');
  var btn=q.querySelector('button.btn-amber, .btn-amber');
  if(!qEl||!btn)return;
  var consentBlocks=q.querySelectorAll('.cbx');
  var prog=q.querySelector('[data-qprog]');
  var hint=q.querySelector('.hint');
  consentBlocks.forEach(function(c){c.style.display='none'});   // согласия показываем на последнем шаге, вместе с телефоном
  if(consentBlocks.length)q.dispatchEvent(new Event('input',{bubbles:true}));  // пересчитать кнопку: галочки теперь скрыты
  function optsHTML(i){
    return STEPS[i].o.map(function(t,k){
      return '<label class="opt"><input type="radio" name="qz'+i+'"'+(k===0?' checked':'')+'> '+t+'</label>';
    }).join('');
  }
  function render(){
    qEl.textContent='Вопрос '+(step+1)+' из '+STEPS.length+' · '+STEPS[step].q;
    var old=q.querySelectorAll('.opt'); old.forEach(function(o){o.remove()});
    btn.insertAdjacentHTML('beforebegin', optsHTML(step));
    btn.textContent = (step===STEPS.length-1) ? 'Показать расчёт →' : 'Дальше →';
    if(prog)prog.style.width=Math.round((step+1)/(STEPS.length+1)*100)+'%';
  }
  function showPhone(){
    q.querySelectorAll('.opt').forEach(function(o){o.remove()});
    qEl.textContent='Куда прислать расчёт и план работ?';
    if(!q.querySelector('input[type=tel]')){
      var inp=document.createElement('input');
      inp.type='tel'; inp.placeholder='+7 (___) ___-__-__'; inp.setAttribute('aria-label','Телефон');
      inp.style.cssText='width:100%;height:50px;border:1.5px solid var(--line);border-radius:8px;padding:0 16px;font:500 16px var(--ui);margin-bottom:10px';
      btn.parentNode.insertBefore(inp, btn);
      inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();btn.click();}});
      inp.focus();
    }
    consentBlocks.forEach(function(c){c.style.display=''});
    if(prog)prog.style.width='100%';
    btn.textContent='Получить расчёт';
    btn.dataset.final='1';
    wireConsent(q);
    q.dispatchEvent(new Event('input',{bubbles:true}));
  }
  btn.addEventListener('click',function(e){
    e.preventDefault();
    if(btn.dataset.final==='1'){
      var tel=q.querySelector('input[type=tel]');
      if(tel)send(tel,q,'квиз: '+answers.join(' | '));
      return;
    }
    var sel=q.querySelector('input[type=radio]:checked');
    answers.push(sel?sel.parentNode.textContent.trim():'—');
    if(step===0)goal('calc_use',{page:location.pathname});
    step++;
    if(step<STEPS.length){ render(); }
    else { showPhone(); }
  });
  render();
});
})();
