/* Поиск по сайту (версии с единицей). Указатель /search.json собирает build.py: адрес, заголовок, описание, текст.
   Окно открывается по лупе в шапке или клавишей «/». Ищет по началам слов, чтобы «ванная» находила «ванной». */
(function(){
  var me=document.currentScript&&document.currentScript.src||'';
  var base=me?new URL(me).pathname.replace(/\/js\/search\.js$/,''):'';
  var data=null,box,input,list,hint,sel=-1,items=[],last=null;
  var norm=function(s){return (s||'').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9²\s-]/g,' ')};
  var stem=function(w){var n=w.length;return n<=4?w:n<=7?w.slice(0,Math.max(4,n-2)):w.slice(0,Math.max(5,n-4))};
  var esc=function(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var POP=[['Цены за м²','/ceny/'],['Ванная под ключ','/remont-vannoj-pod-klyuch/'],['Рассрочка','/remont-v-rassrochku/'],['Гарантии и договор','/garantii/'],['Отделка новостроек','/otdelka-novostroek/'],['Калькулятор','/kalkulyator-remonta/']];

  function build(){
    box=document.createElement('div');box.className='ss';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-label','Поиск по сайту');
    box.innerHTML='<div class="ss-in"><div class="ss-f"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'+
      '<input type="search" placeholder="Поиск по сайту: ванная, цены, гарантия…" aria-label="Что найти" autocomplete="off" spellcheck="false"><button type="button" class="ss-x" aria-label="Закрыть поиск">Esc</button></div>'+
      '<div class="ss-r" role="listbox"></div><div class="ss-h"></div></div>';
    document.body.appendChild(box);
    input=box.querySelector('input');list=box.querySelector('.ss-r');hint=box.querySelector('.ss-h');
    box.addEventListener('click',function(e){if(e.target===box||e.target.closest('.ss-x'))close()});
    input.addEventListener('input',run);
    input.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();move(e.key==='ArrowDown'?1:-1)}
      else if(e.key==='Enter'&&items[sel<0?0:sel]){location.href=items[sel<0?0:sel].href}
    });
  }
  function load(){
    if(data)return Promise.resolve(data);
    return fetch(base+'/search.json').then(function(r){return r.json()}).then(function(j){
      data=j.map(function(p){return {u:p.u,t:p.t,d:p.d,h:p.h||'',x:p.x,nt:' '+norm(p.t),nd:' '+norm(p.d),nh:' '+norm(p.h),nx:' '+norm(p.x)}});return data});
  }
  function open(){
    if(!box)build();
    last=document.activeElement;box.hidden=false;document.documentElement.classList.add('ss-open');
    requestAnimationFrame(function(){box.classList.add('on');input.focus();input.select()});
    load().then(run);
  }
  function close(){
    if(!box||box.hidden)return;box.classList.remove('on');document.documentElement.classList.remove('ss-open');
    setTimeout(function(){box.hidden=true},180);if(last&&last.focus)last.focus();
  }
  function move(d){
    if(!items.length)return;sel=(sel+d+items.length)%items.length;
    items.forEach(function(a,i){a.classList.toggle('on',i===sel);if(i===sel)a.scrollIntoView({block:'nearest'})});
  }
  function snippet(p,stems){
    var t=' '+p.x,n=p.nx,pos=-1;
    for(var i=0;i<stems.length&&pos<0;i++){pos=n.indexOf(' '+stems[i])}
    if(pos<0){for(var k=0;k<stems.length&&pos<0;k++){pos=p.nh.indexOf(' '+stems[k])}if(pos>=0){t=' '+p.h;n=p.nh}}
    if(pos<0)return esc(p.d||t.slice(0,140));
    var a=Math.max(0,pos-60),b=Math.min(t.length,pos+110);
    var frag=(a?'…':'')+t.slice(a,b)+(b<t.length?'…':'');
    var out=esc(frag);
    stems.forEach(function(st){var e=st.replace(/е/g,'[её]');out=out.replace(new RegExp('(^|[^а-яёa-z0-9])('+e+'[а-яёa-z]*)','gi'),'$1<mark>$2</mark>')});
    return out;
  }
  function run(){
    if(!data)return;
    var q=norm(input.value).trim();sel=-1;
    if(!q){
      list.innerHTML='<div class="ss-pop">'+POP.map(function(p){return '<a href="'+base+p[1]+'">'+esc(p[0])+'</a>'}).join('')+'</div>';
      items=[].slice.call(list.querySelectorAll('a'));hint.textContent='Часто ищут';return;
    }
    var stems=q.split(/\s+/).filter(function(w){return w.length>1}).map(stem);
    var res=data.map(function(p){
      var sc=0;
      for(var i=0;i<stems.length;i++){
        var s=' '+stems[i],inT=p.nt.indexOf(s)>=0,inD=p.nd.indexOf(s)>=0,inH=p.nh.indexOf(s)>=0,cnt=p.nx.split(s).length-1;
        if(!inT&&!inD&&!inH&&!cnt)return null;
        sc+=(inT?12:0)+(inH?6:0)+(inD?4:0)+Math.min(cnt,8);
      }
      if(p.u==='/')sc-=2;
      return {p:p,s:sc};
    }).filter(Boolean).sort(function(a,b){return b.s-a.s}).slice(0,8);
    if(!res.length){list.innerHTML='<p class="ss-none">Ничего не нашлось. Попробуйте другое слово или позвоните: <a href="tel:+74952562111">+7 (495) 256-21-11</a></p>';items=[];hint.textContent='';return}
    list.innerHTML=res.map(function(r){
      return '<a class="ss-i" role="option" href="'+base+r.p.u+'"><b>'+esc(r.p.t)+'</b><span>'+snippet(r.p,stems)+'</span></a>'}).join('');
    items=[].slice.call(list.querySelectorAll('a'));
    hint.textContent='Найдено: '+res.length+(res.length===8?' и больше':'')+' · ↑↓ выбрать, Enter открыть';
  }
  document.addEventListener('click',function(e){var b=e.target.closest('[data-search]');if(b){e.preventDefault();
    var mn=document.querySelector('#mnav.open');if(mn){var bu=document.getElementById('burger');bu&&bu.click()}open()}});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape')close();
    else if(e.key==='/'&&!/input|textarea|select/i.test((document.activeElement||{}).tagName||'')){e.preventDefault();open()}
  });
})();
