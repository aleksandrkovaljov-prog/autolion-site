(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
  const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  const M_GEN=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const M_NOM=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
  const M_SHORT=['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  const W=['вс','пн','вт','ср','чт','пт','сб'];

  const S=window.SERVICES||{groups:[],sheet_sections:[],step1_wash_items:[],incompatible:{},thanks_directions:[]};
  const getService=id=>S.services&&S.services[id]?S.services[id]:null;
  const getGroup=id=>S.groups?S.groups.find(g=>g.id===id):null;
  const serviceName=id=>getService(id)?getService(id).name:id;
  const groupName=id=>getGroup(id)?getGroup(id).name:id;

  const FORM_KEY=window.PROTO_PRESENT?'autolion_present_form_v2':'autolion_proto_form_v2';
  const VOTE_KEY='autolion_proto_votes_v2';
  const COMMENTS_KEY='autolion_proto_votes_comments_v2';
  const DONE_KEY='autolion_proto_done_v2';
  const CLIENT_ID_KEY='autolion_proto_client_id_v2';
  const PROTO_CONFIG=window.PROTO_CONFIG||{VOTE_ENDPOINT:''};

  const VOTE_SCREENS=[
    {id:'step4_upsell',screen:'step4',title:'Шаг 4 — допродажа под кнопкой данных',
     variants:[{id:'A',label:'A — Карточка «Пока машина у нас» + «Дополнительные услуги ›»'},{id:'B',label:'B — Плашка «+ Мойка или химчистка»'},{id:'C',label:'C — Карточка «…загляните в раздел «Дополнительные услуги»»'},{id:'D',label:'D — Карточка «Помыть её или убрать салон?»'}]},
    {id:'step5_save',screen:'step5',title:'Шаг 5 — текст главной кнопки',
     variants:[{id:'A',label:'A — «Сохранить»'},{id:'B',label:'B — «Сохранить данные»'}]},
    {id:'thanks_upsell',screen:'thanks',title:'«Спасибо, данные сохранены» — как предложить доп. услуги',
     variants:[{id:'A',label:'A — «Можете оставить машину подольше?», строки'},{id:'B',label:'B — «Успеем сделать ещё», плитки 2×2'},{id:'C',label:'C — «Пока машина у нас», строки'},{id:'D',label:'D — «Успеем сделать ещё», строки (сводный)'}]}
  ];

  const COUNTRIES_PHONE=[
    ['🇪🇪','Эстония','EE','+372'],['🇱🇻','Латвия','LV','+371'],['🇫🇮','Финляндия','FI','+358'],['🇱🇹','Литва','LT','+370'],
    ['🇷🇺','Россия','RU','+7'],['🇸🇪','Швеция','SE','+46'],['🇵🇱','Польша','PL','+48'],['🇩🇪','Германия','DE','+49'],
    ['🇦🇹','Австрия','AT','+43'],['🇧🇪','Бельгия','BE','+32'],['🇧🇬','Болгария','BG','+359'],
    ['🇬🇧','Великобритания','GB','+44'],['🇭🇺','Венгрия','HU','+36'],['🇬🇷','Греция','GR','+30'],
    ['🇩🇰','Дания','DK','+45'],['🇮🇪','Ирландия','IE','+353'],['🇮🇸','Исландия','IS','+354'],
    ['🇪🇸','Испания','ES','+34'],['🇮🇹','Италия','IT','+39'],['🇰🇿','Казахстан','KZ','+7'],
    ['🇨🇾','Кипр','CY','+357'],['🇱🇺','Люксембург','LU','+352'],['🇲🇹','Мальта','MT','+356'],
    ['🇳🇱','Нидерланды','NL','+31'],['🇳🇴','Норвегия','NO','+47'],['🇵🇹','Португалия','PT','+351'],
    ['🇷🇴','Румыния','RO','+40'],['🇸🇰','Словакия','SK','+421'],['🇸🇮','Словения','SI','+386'],
    ['🇺🇸','США','US','+1'],['🇹🇷','Турция','TR','+90'],['🇺🇦','Украина','UA','+380'],
    ['🇫🇷','Франция','FR','+33'],['🇭🇷','Хорватия','HR','+385'],['🇨🇿','Чехия','CZ','+420'],['🇨🇭','Швейцария','CH','+41']
  ];
  const FOREIGN_COUNTRIES=[
    ['🇱🇻','Латвия','LV'],['🇫🇮','Финляндия','FI'],['🇱🇹','Литва','LT'],['🇷🇺','Россия','RU'],
    ['🇸🇪','Швеция','SE'],['🇵🇱','Польша','PL'],['🇩🇪','Германия','DE'],
    ['🇦🇹','Австрия','AT'],['🇧🇪','Бельгия','BE'],['🇧🇬','Болгария','BG'],
    ['🇬🇧','Великобритания','GB'],['🇭🇺','Венгрия','HU'],['🇬🇷','Греция','GR'],
    ['🇩🇰','Дания','DK'],['🇮🇪','Ирландия','IE'],['🇮🇸','Исландия','IS'],
    ['🇪🇸','Испания','ES'],['🇮🇹','Италия','IT'],['🇰🇿','Казахстан','KZ'],
    ['🇨🇾','Кипр','CY'],['🇱🇺','Люксембург','LU'],['🇲🇹','Мальта','MT'],
    ['🇳🇱','Нидерланды','NL'],['🇳🇴','Норвегия','NO'],['🇵🇹','Португалия','PT'],
    ['🇷🇴','Румыния','RO'],['🇸🇰','Словакия','SK'],['🇸🇮','Словения','SI'],
    ['🇺🇸','США','US'],['🇹🇷','Турция','TR'],['🇺🇦','Украина','UA'],
    ['🇫🇷','Франция','FR'],['🇭🇷','Хорватия','HR'],['🇨🇿','Чехия','CZ'],['🇨🇭','Швейцария','CH']
  ];

  const ROUTES=['start','step1','step2','step3','step4','step5','thanks','end'];
  const BACK_MAP={step2:'step1',step3:'step2',step4:'step4',step5:'step4',thanks:'step5',end:'start',step1:'start'};
  let timers=[];
  let sheetSelection=new Set();

  function loadVotes(){try{return JSON.parse(localStorage.getItem(VOTE_KEY)||'{}');}catch(e){return{};}}
  function loadComments(){try{return JSON.parse(localStorage.getItem(COMMENTS_KEY)||'{}');}catch(e){return{};}}
  function saveVotes(){localStorage.setItem(VOTE_KEY,JSON.stringify(state.votes));localStorage.setItem(COMMENTS_KEY,JSON.stringify(state.votesComments));}
  function genId(){return Math.random().toString(36).slice(2,10);}
  function generateBookingNo(){return 'AL-'+Math.floor(1000+Math.random()*9000);}

  let state={
    screen:'start',name:'',selectedGroup:null,washItems:[],extras:[],
    selectedDate:null,selectedTime:null,phoneCountryCode:'+372',phoneDigits:'',
    email:'',emailSkipped:false,plate:'',plateSkipped:false,clientName:'',bookingNo:'',confirmedBookingNo:'',
    invoiceType:'person',foreignFirm:false,firmCountry:'',firmName:'',regCode:'',vat:'',voucherOn:false,voucherPortal:'',voucherCampaign:'',voucherDigits:'',voucherPin:'',
    city:'',zip:'',street:'',accountingEmail:'',carMake:'',carModel:'',carYear:'',
    carRadius:'',carVIN:'',previousBookings:[],currentVariant:{},
    votes:loadVotes(),votesComments:loadComments(),
    clientId:localStorage.getItem(CLIENT_ID_KEY)||genId(),
    submitted:localStorage.getItem(DONE_KEY)==='1',
    lastFormScreen:'start',demo:false
  };
  if(!localStorage.getItem(CLIENT_ID_KEY))localStorage.setItem(CLIENT_ID_KEY,state.clientId);

  try{
    const raw=sessionStorage.getItem(FORM_KEY);
    if(raw){
      const d=JSON.parse(raw);
      if(d&&d.v===2){
        delete d.v;
        if(d.selectedDate)d.selectedDate=new Date(d.selectedDate);else d.selectedDate=null;
        Object.assign(state,d);
      }
    }
  }catch(e){console.error(e);}

  function saveForm(){
    const d={
      v:2,name:state.name,selectedGroup:state.selectedGroup,washItems:state.washItems,
      extras:state.extras,selectedDate:state.selectedDate?state.selectedDate.toISOString():null,
      selectedTime:state.selectedTime,phoneCountryCode:state.phoneCountryCode,phoneDigits:state.phoneDigits,
      email:state.email,emailSkipped:state.emailSkipped,plate:state.plate,plateSkipped:state.plateSkipped,
      clientName:state.clientName,bookingNo:state.bookingNo,confirmedBookingNo:state.confirmedBookingNo,invoiceType:state.invoiceType,
      foreignFirm:state.foreignFirm,firmCountry:state.firmCountry,firmName:state.firmName,
      regCode:state.regCode,vat:state.vat,voucherOn:state.voucherOn,voucherPortal:state.voucherPortal,voucherCampaign:state.voucherCampaign,voucherDigits:state.voucherDigits,voucherPin:state.voucherPin,city:state.city,zip:state.zip,street:state.street,
      accountingEmail:state.accountingEmail,carMake:state.carMake,carModel:state.carModel,
      carYear:state.carYear,carRadius:state.carRadius,carVIN:state.carVIN,
      previousBookings:state.previousBookings,lastFormScreen:state.lastFormScreen,
      currentVariant:state.currentVariant
    };
    try{sessionStorage.setItem(FORM_KEY,JSON.stringify(d));}catch(e){console.error(e);}
  }

  function delay(fn,ms){const id=setTimeout(()=>{timers=timers.filter(x=>x!==id);fn();},ms);timers.push(id);return id;}
  function clearTimers(){timers.forEach(clearTimeout);timers=[];}
  function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');if(t._t)clearTimeout(t._t);t._t=delay(()=>t.classList.remove('show'),2500);}
  function closeOverlays(){$('#overlays').innerHTML='';document.body.style.overflow='';}
  function closeInfo(){const w=$('#info-overlay');if(w){w.remove();}if(!$('#overlays .sheet'))document.body.style.overflow='';}

  function isWashSelected(){return state.selectedGroup==='wash'&&state.washItems&&state.washItems.length>0;}
  function isAnyServiceSelected(){return isWashSelected()||(state.selectedGroup&&state.selectedGroup!=='wash');}
  function isIncompatible(id){
    for(const key of Object.keys(S.incompatible||{})){
      if(key!==id&&state.washItems.includes(key)&&S.incompatible[key].includes(id))return `Уже входит в «${serviceName(key)}»`;
    }
    return '';
  }

  function getVoteScreenForCurrent(){return VOTE_SCREENS.find(v=>v.screen===state.screen);}
  // 19.10 17:24: presentation version (proto/present/): fixed variants, no voting UI
  const PRESENT=!!window.PROTO_PRESENT;
  const PRESENT_VARIANTS={step4_upsell:'C',step5_save:'A',thanks_upsell:'A'};
  function currentVariantId(vs){if(PRESENT)return PRESENT_VARIANTS[vs.id]||vs.variants[0].id;return state.currentVariant[vs.id]||vs.variants[0].id;}
  function hasVotes(id){return (state.votes[id]||[]).length>0;}
  function voteComment(id){return state.votesComments[id]||'';}
  function setVoteComment(id,t){state.votesComments[id]=t;saveVotes();}

  function applyCss(screen){
    const map={start:'css-v4',step1:'css-v4',step3:'css-v4',end:'css-v4',step2:'css-step2',step4:'css-upsell',thanks:'css-upsell',step5:'css-steps45'};
    const want=map[screen]||'css-v4';
    ['css-v4','css-step2','css-steps45','css-upsell'].forEach(id=>{const l=document.getElementById(id);if(l)l.disabled=id!==want;});
    const htmlEl=document.documentElement;
    ['scr-start','scr-step1','scr-step2','scr-step3','scr-step4','scr-step5','scr-thanks','scr-end'].forEach(c=>htmlEl.classList.remove(c));
    htmlEl.classList.add('scr-'+screen);
    document.body.classList.remove('vD');
    if(screen==='step4'){
      const vs=VOTE_SCREENS.find(v=>v.id==='step4_upsell');
      const v=currentVariantId(vs);
      if(v==='C'||v==='D')document.body.classList.add('vD');
    }
  }

  function voteSwitcher(vs){
    if(!vs)return '';
    return `<span class="vsw">${vs.variants.map(v=>`<span data-action="variant" data-variant="${v.id}" class="${v.id===currentVariantId(vs)?'on':''}">${v.id}</span>`).join('')}</span>`;
  }
  function crumbHtml(vs){
    if(PRESENT)return '<div class="crumb">Главная › Онлайн-запись</div>';
    return `<div class="crumb">Главная › Онлайн-запись <span class="mock">ПРОТОТИП</span>${vs?' '+voteSwitcher(vs):''} <span class="ans" data-action="answers">Ответы ›</span></div>`;
  }
  function votePanelHtml(vs){
    if(!vs||PRESENT)return '';
    const selected=state.votes[vs.id]||[];
    const opts=vs.variants.map(v=>{
      const label=v.label.replace(/^[A-D] —\s*/,'');
      return `<div class="cb" data-action="vote" data-variant="${v.id}"><span class="box ${selected.includes(v.id)?'on':''}"></span><span><b>${v.id}</b> — ${label}</span></div>`;
    }).join('');
    return `<div class="vote-panel" id="vote-panel"><h4>Голосование</h4><p>Выберите один или несколько понравившихся вариантов</p>${opts}<textarea data-vote-comment="${vs.id}" placeholder="Комментарий (необязательно)">${esc(voteComment(vs.id))}</textarea></div>`;
  }

  function v4Header(){
    const tpl=window.MOCKUP_TPL['v4/chrome'];
    return tpl.split('<div class="crumb">')[0];
  }
  function stepsHtml(current){
    const names=['Услуга','Дата и время','Контакты','Готово'];
    return `<ol class="steps">${names.map((x,i)=>`<li class="${i+1<current?'done':i+1===current?'cur':''}">${i+1}. ${x}</li>`).join('')}</ol><p class="stepline">Шаг ${current} из 4 · <b>${names[current-1]}</b></p>`;
  }

  function renderStart(){
    return `<div class="panel">${v4Header()}${crumbHtml(null)}
<section class="booking"><h2>Голосование: онлайн-запись</h2>
<p class="note">Это прототип онлайн-записи Autolion. Пройдите запись как клиент — всё понарошку, ничего никуда не уходит, кроме ваших ответов. На трёх экранах с вариантами есть переключатель A/B/C/D — посмотрите каждый и внизу экрана отметьте один или несколько понравившихся. Можно оставить комментарий. В конце нажмите «Отправить ответы». Ответы других участников вам не видны.</p>
<div class="field"><label class="l">Ваше имя <span class="req">*</span></label><input class="input" id="participant-name" name="name" autocomplete="name" data-field="name" value="${esc(state.name)}" placeholder="Имя"></div>
<div class="button primary" data-action="start">Начать</div>
</section><div class="foot">Autolion · Vaari 4 (Pärnu mnt 158G), Tallinn</div></div>`;
  }

  function iconName(gid){
    if(gid==='wash')return 'i-wash'; if(gid==='tire')return 'i-tire'; if(gid==='insurance')return 'i-doc';
    if(gid==='body')return 'i-car'; if(gid==='ac')return 'i-snow'; return 'i-list';
  }
  function firstServiceInGroup(gid){
    const g=getGroup(gid);
    if(gid==='wash')return (S.step1_wash_items||[])[0];
    return g?g.id:gid;
  }

  // 19.10 11:30: subgroups inside «Мойка и чистка» (header style = mockup sheet .g)
  const WASH_SUBGROUPS=[['Комплексные услуги',['wash_in_out','full_pack']],['Мойка',['wash_2stage','wash_touchless']],['Химчистка',['dry_clean']],['Полировка и защита',['polish_light','polish_full','ceramic']]];
  function renderWashItems(){
    const all=S.step1_wash_items||[], used=new Set();
    let html='';
    WASH_SUBGROUPS.forEach(([t,ids])=>{const list=ids.filter(id=>all.includes(id));if(!list.length)return;list.forEach(id=>used.add(id));html+=`<div class="wsub"><div class="g">${t}</div>${renderWashItemList(list)}</div>`;});
    const rest=all.filter(id=>!used.has(id));
    if(rest.length)html+=`<div class="wsub">${renderWashItemList(rest)}</div>`;
    return html;
  }
  function renderWashItemList(ids){
    return ids.map(id=>{
      const svc=getService(id); if(!svc)return '';
      const inc=isIncompatible(id);
      const sel=state.washItems.includes(id)&&!inc;
      return `<div class="item${inc?' dis':''}" data-action="wash-item" data-id="${id}">
        <span class="box${sel?' on':''}"></span>
        <span>${svc.name}${inc?`<span class="why">${inc}</span>`:''}</span>
        <span class="dur">${inc?'':(id==='wash_in_out'?'<span class="optbadge">акция</span>от '+((String(svc.promo||'').match(/(\d+)\s*€/)||[])[1]||'55')+' €':(svc.price||''))}</span>
        <span class="info" data-action="info" data-id="${id}">i</span>
      </div>`;
    }).join('');
  }

  function renderGroupsHtml(){
    let html='';
    (S.groups||[]).forEach(g=>{
      const isWash=g.id==='wash';
      const isOpen=isWash&&state.selectedGroup==='wash';
      const selected=state.selectedGroup===g.id;
      const chevStyle=isOpen?' style="transform:rotate(180deg);color:var(--accent)"':'';
      const info=isWash?'':`<span class="info" data-action="info" data-group="${g.id}">i</span>`;
      html += `<div class="grp${selected?' open':''}" data-group="${g.id}">
        <div class="grp-h" data-action="toggle-group" data-group="${g.id}">
          <svg class="icon"><use href="#${iconName(g.id)}"/></svg>
          <span class="t">${g.name}<small class="et">${g.et||''}</small></span>
          ${info}
          ${isWash?`<svg class="icon chev"${chevStyle}><use href="#i-down"/></svg>`:''}
        </div>`;
      if(isWash&&isOpen){
        html += `<div class="grp-b">${renderWashItems()}
          <div class="tot"><span>Выбрано ${state.washItems.length}</span><b>Цена в описании</b></div>
          ${state.washItems.length>=2?'<div class="mnote"><svg class="icon" style="width:16px;height:16px;margin-top:1px"><use href="#i-warn"/></svg><span>Запись на несколько услуг подтверждает мастер — мы свяжемся с вами.</span></div>':''}
          <span class="link" data-action="full-list">Полный список услуг ›</span>
        </div>`;
      }
      html += `</div>`;
    });
    return html;
  }

  function renderStep1(){
    return `<div class="panel step1-panel">${v4Header()}${crumbHtml(null)}
<section class="booking"><h2>Онлайн-запись</h2>${stepsHtml(1)}
<h3>Выберите услугу</h3>
<div id="step1-groups">${renderGroupsHtml()}</div>
<div class="step1-next-bar"><div class="button primary${isAnyServiceSelected()?'':' dim'}" data-action="step1-next">Дальше: дата и время →</div></div>
</section><div class="foot">Autolion · Vaari 4 (Pärnu mnt 158G), Tallinn</div></div>`;
  }

  let step1NextObserver=null;
  let step1NextSpace=null;
  function syncStep1Next(){
    const panel=$('.step1-panel');if(!panel)return;
    const selected=isAnyServiceSelected();
    panel.classList.toggle('has-service',selected);
    panel.querySelector('[data-action="step1-next"]').classList.toggle('dim',!selected);
    if(!selected){
      if(step1NextSpace){step1NextSpace.remove();step1NextSpace=null;}
      return;
    }
    if(!step1NextSpace){
      step1NextSpace=document.createElement('div');
      step1NextSpace.className='step1-next-space';
      step1NextSpace.setAttribute('aria-hidden','true');
    }
    const scrollContent=document.documentElement.classList.contains('framed')?$('#screen'):document.body;
    if(scrollContent.lastElementChild!==step1NextSpace)scrollContent.appendChild(step1NextSpace);
    // offsetHeight is in form CSS pixels, including when the desktop frame is scaled.
    step1NextSpace.style.setProperty('--step1-next-height',panel.querySelector('.step1-next-bar').offsetHeight+'px');
  }
  window.addEventListener('resize',syncStep1Next);

  function serviceSummary(){
    if(state.selectedGroup==='wash'&&state.washItems.length)return `${groupName('wash')} · ${state.washItems.length} ${plural(state.washItems.length,'услуга','услуги','услуг')}`;
    if(state.selectedGroup)return groupName(state.selectedGroup);
    return 'Услуга не выбрана';
  }

  function renderStep2(){
    const div=document.createElement('div');
    div.innerHTML=window.MOCKUP_TPL['step2-hint/screen'];
    const crumb=div.querySelector('.crumb');
    if(crumb)crumb.outerHTML=crumbHtml(null);
    const optSpan=div.querySelector('.option.sel span:first-child');
    if(optSpan)optSpan.textContent=serviceSummary();
    const change=div.querySelector('.option.sel span:last-child');
    if(change){change.dataset.action='back';change.dataset.back='step1';}
    const btn=div.querySelector('.button.primary');
    if(btn){
      btn.dataset.action='step2-next';
      const back=document.createElement('span');
      back.className='back';back.dataset.action='back';back.dataset.back='step1';back.textContent='← Назад';
      btn.insertAdjacentElement('afterend',back);
    }
    return div.innerHTML;
  }

  function renderStep3(){
    const emailField = state.emailSkipped
      ? `<label class="l">E-mail <span class="opt">не указан</span></label><div class="input dis">—</div>
         <div class="cb" data-action="email-skip"><span class="box on"></span>Продолжить без e-mail</div><p class="small hl">Тогда подтверждение и связь — только по телефону.</p>`
      : `<label class="l">E-mail <span class="req">*</span></label><input class="input" id="email-input" type="email" autocomplete="email" data-field="email" placeholder="name@example.com" value="${esc(state.email)}">
         <div class="cb" data-action="email-skip"><span class="box"></span>Продолжить без e-mail</div><p class="small">Тогда подтверждение и связь — только по телефону.</p>`;
    const plateField = state.plateSkipped
      ? `<label class="l">Номер машины <span class="opt">не нужен</span></label><div class="input dis">—</div>
         <div class="cb" data-action="plate-skip"><span class="box on"></span>Без номера <span class="info" data-action="plate-info">i</span></div>`
      : `<label class="l">Номер машины <span class="req">*</span></label><input class="input" id="plate-input" type="text" autocomplete="off" data-field="plate" placeholder="123 ABC" value="${esc(state.plate)}">
         <div class="cb" data-action="plate-skip"><span class="box"></span>Без номера <span class="info" data-action="plate-info">i</span></div>`;
    return `<div class="panel">${v4Header()}${crumbHtml(null)}
<section class="booking"><h2>Онлайн-запись</h2>${stepsHtml(3)}
<p class="legend-req"><span class="req">*</span> — обязательное поле. Аккаунт не нужен.</p>
<div class="field"><label class="l">Телефон <span class="req">*</span></label>
 <div class="phone">
  <div class="cc" id="cc-btn" data-action="cc"><span class="flag">${flagOf(state.phoneCountryCode)}</span>${state.phoneCountryCode}<svg class="icon chev" style="width:14px;height:14px"><use href="#i-down"/></svg></div>
  <input class="input" id="phone-digits" type="tel" inputmode="tel" autocomplete="tel-national" data-field="phoneDigits" placeholder="5557 6777" value="${esc(state.phoneDigits)}">
 </div>
 <div id="cc-dropdown"></div>
</div>
<div class="field">${emailField}</div>
<div class="field">${plateField}</div>
<div class="field"><label class="l">Как к вам обращаться? <span class="opt">необязательно</span></label><input class="input" id="client-name" type="text" autocomplete="given-name" data-field="clientName" placeholder="Имя" value="${esc(state.clientName)}"></div>
<div class="sum"><div><span>Услуга</span><b>${serviceSummary()}</b></div><div><span>Когда</span><b>${formatDateShort(state.selectedDate)} · ${state.selectedTime||''}</b></div></div>
<div class="button primary" data-action="step3-next">Подтвердить запись</div>
<span class="back" data-action="back" data-back="step2">← Назад</span>
</section><div class="foot">Autolion · Vaari 4 (Pärnu mnt 158G), Tallinn</div></div>`;
  }

  function renderStep4Variant(v){
    if(v==='A')return `<div data-v="A" class="up-card"><b>Пока машина у нас</b><p>Если оставите её подольше, можно заодно помыть или почистить салон.</p><a class="lnk" data-action="upsell">Дополнительные услуги ›</a></div>`;
    if(v==='B')return `<div data-v="B" class="chip"><span class="pl">+</span><span>Мойка или химчистка,<br>пока машина у нас</span><a class="lnk" data-action="upsell">Посмотреть ›</a></div>`;
    if(v==='C')return `<div data-v="C" class="up-card"><b>Пока машина у нас</b><p>Если машина может побыть у нас подольше, загляните в раздел <a class="lnk" data-action="upsell">Дополнительные услуги ›</a></p></div>`;
    return `<div data-v="D" class="up-card"><b>Пока машина у нас</b><p>Помыть её или убрать салон? <a class="lnk" data-action="upsell">Посмотреть варианты ›</a></p></div>`;
  }

  function ensureBookingNo(){
    if(!state.bookingNo||state.bookingNo==='AL-0000'){
      const oldBookingNo=state.bookingNo;
      state.bookingNo=generateBookingNo();
      if(oldBookingNo==='AL-0000'&&state.confirmedBookingNo===oldBookingNo)state.confirmedBookingNo=state.bookingNo;
      saveForm();
    }
  }

  function renderStep4(){
    ensureBookingNo();
    const vs=getVoteScreenForCurrent();
    const div=document.createElement('div');div.innerHTML=window.MOCKUP_TPL['upsell/screen'];
    const screen=div.firstElementChild;
    const crumb=screen.querySelector('.crumb');if(crumb)crumb.outerHTML=crumbHtml(vs);
    const saved=screen.querySelector('#saved');if(saved)saved.remove();
    const step4=screen.querySelector('#step4');
    const variant=currentVariantId(vs);
    const isCD=variant==='C'||variant==='D';
    const title=step4.querySelector('.ok h3');
    const titleBlock=document.createElement('div');
    title.replaceWith(titleBlock);titleBlock.appendChild(title);
    const bookingNo=document.createElement('p');bookingNo.className='note';bookingNo.textContent=`№ ${state.bookingNo}`;
    titleBlock.appendChild(bookingNo);
    const service=state.selectedGroup==='wash'?state.washItems.map(serviceName).join(', '):serviceSummary();
    step4.querySelector('.sum').innerHTML=`<div><span>Услуга</span><b>${esc(service)}</b></div><div><span>Когда</span><b>${formatDateShort(state.selectedDate,true)} · ${esc(state.selectedTime||'')}</b></div>${isCD?'':'<div><span>Адрес</span><b>Vaari 4 (Pärnu mnt 158G)</b></div>'}`;
    const sentSpan=step4.querySelector('.sent span');
    if(isCD)sentSpan.innerHTML=`Подтверждение отправлено на <b>${esc(state.email||'e-mail')}</b>`;
    else if(state.emailSkipped||!state.email)sentSpan.innerHTML=`Подтверждение придёт по SMS на <b>${esc(state.phoneCountryCode+' '+state.phoneDigits)}</b>`;
    else sentSpan.innerHTML=`Подтверждение отправлено на e-mail <b>${esc(state.email)}</b>`;

    const ask=step4.querySelector('.ask');
    const askA=ask.querySelector('a.button.primary');
    const askDiv=document.createElement('span');askDiv.className='button primary';askDiv.dataset.action='to-step5';askDiv.textContent='Указать данные для счёта и автомобиля';
    askA.replaceWith(askDiv);

    step4.querySelectorAll('[data-v]').forEach(el=>el.remove());
    ask.insertAdjacentHTML('afterend',renderStep4Variant(variant));
    step4.querySelectorAll('a.lnk').forEach(a=>{a.removeAttribute('href');a.dataset.action='upsell';});

    const rowBtns=step4.querySelectorAll('.row2 .button');
    rowBtns[0].dataset.action='cal-btn';rowBtns[1].dataset.action='map-btn';
    step4.querySelectorAll('.grp2 .button').forEach(b=>{if(b.textContent.includes('Перенести'))b.dataset.action='reschedule';});
    const priceLink=step4.querySelector('.link');
    if(priceLink)priceLink.dataset.action='price-list';

    const grp2=document.createElement('div');grp2.className='grp2';grp2.innerHTML=`<div class="button" data-action="another-car">Записать ещё одну машину</div><div class="button" data-action="done">Готово</div>`;
    priceLink.insertAdjacentElement('afterend',grp2);

    const vp=document.createElement('div');vp.innerHTML=votePanelHtml(vs);if(vp.firstElementChild)screen.appendChild(vp.firstElementChild);
    return div.innerHTML;
  }

  function renderThanksVariant(variant){
    const div=document.createElement('div');div.innerHTML=window.MOCKUP_TPL['upsell/screen'];
    const saved=div.querySelector('#saved');
    const block=saved.querySelector(`[data-v="${variant}"]`);
    if(!block)return '';
    block.querySelectorAll('a.drow, a.tile').forEach((a,i)=>{
      a.removeAttribute('href');a.dataset.action='upsell';
      const d=(S.thanks_directions||[])[i];
      if(d)a.dataset.direction=d.id.replace('dir_','');
    });
    block.innerHTML=block.innerHTML.replace(/Осмотр кузова и расчёт стоимости/g,'Осмотр кузова и расчёт стоимости ремонта');
    return block.outerHTML;
  }

  function renderThanks(){
    ensureBookingNo();
    const vs=getVoteScreenForCurrent();
    const div=document.createElement('div');div.innerHTML=window.MOCKUP_TPL['upsell/screen'];
    const screen=div.firstElementChild;
    const crumb=screen.querySelector('.crumb');if(crumb)crumb.outerHTML=crumbHtml(vs);
    const step4=screen.querySelector('#step4');if(step4)step4.remove();
    const saved=screen.querySelector('#saved');saved.style.display='flex';

    const sums=saved.querySelectorAll('.sum div');
    sums[0].querySelector('b').textContent=`${state.bookingNo||generateBookingNo()} · ${formatDateShort(state.selectedDate)} · ${state.selectedTime||''}`;
    sums[1].querySelector('b').textContent=invoiceSummary();
    sums[2].querySelector('b').textContent=state.plateSkipped?'Без номера':state.plate||'—';

    const variant=currentVariantId(vs);
    const variantHTML=renderThanksVariant(variant);

    saved.querySelectorAll('[data-v]').forEach(el=>el.remove());
    const oldGrp=saved.querySelector('.grp2');
    oldGrp.insertAdjacentHTML('beforebegin',variantHTML);
    const newGrp=document.createElement('div');newGrp.className='grp2';
    newGrp.innerHTML=`<div class="button" data-action="another-car">Записать ещё одну машину</div><div class="button" data-action="done">Готово</div>`;
    oldGrp.replaceWith(newGrp);
    const back=document.createElement('span');back.className='back';back.dataset.action='back';back.dataset.back='step5';back.textContent='← Назад';
    newGrp.insertAdjacentElement('afterend',back);

    const vp=document.createElement('div');vp.innerHTML=votePanelHtml(vs);if(vp.firstElementChild)screen.appendChild(vp.firstElementChild);
    return div.innerHTML;
  }

  function inputHtml(id,value,mode){
    return `<input class="input" id="${id}" type="text"${value?` value="${esc(value)}"`:''} data-field="${id}"${mode?` inputmode="${mode}"`:''}>`;
  }
  function carDetailsHtml(){
    const g=state.selectedGroup;
    let html=`<div class="grid2"><div class="field"><label class="l">Марка</label>${inputHtml('car-make',state.carMake,'text')}</div><div class="field"><label class="l">Модель</label>${inputHtml('car-model',state.carModel,'text')}</div></div>`;
    if(g&&g!=='wash')html+=`<div class="field"><label class="l">Год выпуска</label>${inputHtml('car-year',state.carYear,'numeric')}</div>`;
    if(g==='tire')html+=`<div class="field"><label class="l">Радиус колёс</label><select class="input" id="car-radius" data-field="car-radius"><option>Не указано</option>${['R13','R14','R15','R16','R17','R18','R19','R20','R21','R22'].map(r=>`<option ${state.carRadius===r?'selected':''}>${r}</option>`).join('')}</select></div>`;
    if(g==='insurance'||g==='body')html+=`<div class="field"><label class="l">VIN</label>${inputHtml('car-vin',state.carVIN,'text')}</div>`;
    return html;
  }

  function renderStep5(){
    ensureBookingNo();
    const vs=getVoteScreenForCurrent();
    const div=document.createElement('div');div.innerHTML=window.MOCKUP_TPL['steps45/screen'];
    const screen=div.firstElementChild;
    const crumb=screen.querySelector('.crumb');if(crumb)crumb.outerHTML=crumbHtml(vs);
    const step4=screen.querySelector('#step4');if(step4)step4.remove();
    const form=screen.querySelector('#step5');
    form.style.display='flex';form.style.flexDirection='column';form.style.flex='1';
    form.setAttribute('novalidate',''); // checks are done in JS (save5); native validation of hidden firm fields only logged errors

    const note=form.querySelector('.note');if(note)note.innerHTML=note.innerHTML.replace('AL-0000',state.bookingNo||generateBookingNo());
    const sumB=form.querySelector('.sum b');if(sumB)sumB.textContent=state.plateSkipped?'Без номера':state.plate||'—';

    const toggles=form.querySelectorAll('.toggle > div');
    toggles[0].dataset.action='invoice';toggles[0].dataset.invoice='person';
    toggles[1].dataset.action='invoice';toggles[1].dataset.invoice='firm';
    toggles[0].className=state.invoiceType==='person'?'on':'';
    toggles[1].className=state.invoiceType==='firm'?'on':'';

    const legendReq=form.querySelector('.legend-req');
    const firmBlk=form.querySelectorAll('.blk')[1];
    if(state.invoiceType==='person'){
      legendReq.style.display='none';firmBlk.style.display='none';
    }else{
      legendReq.style.display='';firmBlk.style.display='';
    }

    const foreign=form.querySelector('#foreign');if(foreign)foreign.toggleAttribute('checked',!!state.foreignFirm); // attribute: the form is serialized via innerHTML
    const fbox=form.querySelector('#fbox');if(fbox)fbox.classList.toggle('on',state.foreignFirm);
    const countryField=form.querySelector('#countryField');if(countryField)countryField.style.display=state.foreignFirm?'':'none';

    const org=form.querySelector('#org');if(org){org.setAttribute('value',state.firmName||'');org.placeholder=state.foreignFirm?'':'… OÜ';}
    const regcode=form.querySelector('#regcode');if(regcode)regcode.setAttribute('value',state.regCode||'');
    const vat=form.querySelector('#vat');if(vat){
      // 19.10 17:24: VAT = country prefix (EE for an Estonian firm) + number; prefix shown in the mockup's .phone/.cc field style
      const pfx=vatPrefix();const wrap=document.createElement('div');wrap.className='phone';
      wrap.innerHTML=`<span class="cc" id="vat-pfx"${pfx?'':' style="display:none"'}>${pfx}</span>`;
      vat.parentNode.insertBefore(wrap,vat);wrap.appendChild(vat);
      const vr=vatRest(state.vat,pfx);vat.setAttribute('value',vr);if(pfx)state.vat=vr?pfx+vr:'';vat.inputMode=pfx==='EE'?'numeric':'text';vat.placeholder=pfx==='EE'?'123456789':'';
      const err=document.createElement('p');err.className='note vat-err';err.id='vat-err';err.style.display='none';err.textContent='Номер: EE и 9 цифр';
      wrap.insertAdjacentElement('afterend',err);
    }
    const vatLabel=form.querySelector('label[for="vat"]');if(vatLabel)vatLabel.innerHTML=state.foreignFirm?'VAT-номер <span class="opt">необязательно</span>':'НДС-номер <span class="opt">необязательно</span>';
    const city=form.querySelector('#city');if(city)city.setAttribute('value',state.city||'');
    const zip=form.querySelector('#zip');if(zip){zip.setAttribute('value',state.zip||'');zip.maxLength=state.foreignFirm?10:5;zip.inputMode=state.foreignFirm?'text':'numeric';}
    const street=form.querySelector('#street');if(street)street.setAttribute('value',state.street||'');
    const acc=form.querySelector('#acc');if(acc)acc.setAttribute('value',state.accountingEmail||'');
    const countryInput=form.querySelector('#country');if(countryInput)countryInput.setAttribute('value',state.firmCountry||'');

    // 19.10 18:09: voucher, common to «Частное лицо» and «Фирма». Mockup parts only: .cb checkbox (as «Иностранная фирма»),
    // .field + select.input (as «Радиус колёс»), .phone/.cc fixed prefix (as the VAT «EE»), .note hint (as «Сюда отправим счёт.»)
    {const carEl=form.querySelector('.car');if(carEl){const vb=document.createElement('div');vb.className='blk';vb.id='voucherBlk';
      vb.innerHTML=voucherHtml();carEl.parentNode.insertBefore(vb,carEl);}}
    const rowlink=form.querySelector('.rowlink');if(rowlink)rowlink.dataset.action='car-expander';
    const carBlk=form.querySelector('.car');
    const carDetails=document.createElement('div');carDetails.id='car-details';carDetails.style.display='none';carDetails.innerHTML=carDetailsHtml();
    rowlink.insertAdjacentElement('afterend',carDetails);

    const saveBtn=form.querySelector('.actions .button.primary');
    saveBtn.dataset.action='save5';
    saveBtn.textContent=currentVariantId(vs)==='B'?'Сохранить данные':'Сохранить';
    const back=form.querySelector('.actions .back');
    back.dataset.action='back';back.dataset.back='step4';back.textContent='Назад, заполню позже';

    const vp=document.createElement('div');vp.innerHTML=votePanelHtml(vs);if(vp.firstElementChild)screen.appendChild(vp.firstElementChild);
    return div.innerHTML;
  }

  function renderEnd(){
    const voteSummary=VOTE_SCREENS.map(vs=>{
      const selected=state.votes[vs.id]||[];
      return `<div><span>${vs.title}</span><b>${selected.length?selected.join(', '):'<span style="color:#ffb547">не отмечено</span>'}</b></div>${selected.length?'':`<span class="link" data-action="goto" data-screen="${vs.screen}">Перейти к экрану ›</span>`}`;
    }).join('');
    return `<div class="panel">${v4Header()}${crumbHtml(null)}
<section class="booking"><h2>Ответы</h2>
<div class="sum">${voteSummary}</div>
<label class="l">Общий комментарий</label><textarea class="proto-ta" id="general-comment"></textarea>
<div class="button primary" data-action="send">Отправить ответы</div>
<p class="note" id="send-status">${state.submitted?'Вы уже отправляли ответы в этом браузере.':''}</p>
<span class="back" data-action="back" data-back="${esc(state.lastFormScreen||'start')}">← Назад</span>
</section><div class="foot">Autolion · Vaari 4 (Pärnu mnt 158G), Tallinn</div></div>`;
  }

  function renderScreen(screen){
    if(step1NextObserver){step1NextObserver.disconnect();step1NextObserver=null;}
    if(step1NextSpace){step1NextSpace.remove();step1NextSpace=null;}
    clearTimers();closeOverlays();document.body.style.overflow='';
    applyCss(screen);
    const app=$('#app');app.innerHTML='';
    switch(screen){
      case 'start':app.innerHTML=renderStart();break;
      case 'step1':app.innerHTML=renderStep1();break;
      case 'step2':app.innerHTML=renderStep2();break;
      case 'step3':app.innerHTML=renderStep3();break;
      case 'step4':app.innerHTML=renderStep4();break;
      case 'step5':app.innerHTML=renderStep5();break;
      case 'thanks':app.innerHTML=renderThanks();break;
      case 'end':app.innerHTML=renderEnd();break;
      default:app.innerHTML=renderStart();
    }
    if(screen==='step1'){
      syncStep1Next();
      step1NextObserver=new ResizeObserver(syncStep1Next);
      step1NextObserver.observe(app.querySelector('.step1-next-bar'));
    }
    afterRender(screen);
  }

  function isBookingConfirmed(){return !!state.confirmedBookingNo&&state.confirmedBookingNo===state.bookingNo;}

  function go(screen,opts={}){
    if(!ROUTES.includes(screen))return;
    let target=screen;
    if(PRESENT&&(target==='start'||target==='end'))target='step1'; // no name/answers screens in the presentation
    const cur=ROUTES.indexOf(state.screen),tgt=ROUTES.indexOf(target);
    if(!isBookingConfirmed()&&!opts.allowIncomplete&&target!=='end'&&target!=='start'&&(tgt>cur||target==='step4')){
      const first=firstIncompleteStep();
      if(first&&ROUTES.indexOf(first)<tgt)target=first;
    }
    if(isBookingConfirmed()&&['start','step1','step2','step3'].includes(target))target='step4';
    if(target==='end'&&state.screen!=='end'&&cur<ROUTES.indexOf('end'))state.lastFormScreen=state.screen;
    if(opts.replace)history.replaceState({screen:target},'', '#s-'+target);
    else history.pushState({screen:target},'', '#s-'+target);
    state.screen=target;
    saveForm();
    window.scrollTo(0,0);
    renderScreen(target);
  }

  function firstIncompleteStep(){
    if(!state.name&&!PRESENT)return 'start';
    if(!isAnyServiceSelected())return 'step1';
    if(!state.selectedDate||!state.selectedTime)return 'step2';
    if(!state.phoneDigits||(!state.email&&!state.emailSkipped)||(!state.plate&&!state.plateSkipped))return 'step3';
    return null;
  }
  function proceedTo(target,opts){
    const vs=getVoteScreenForCurrent();
    if(vs&&!PRESENT&&!hasVotes(vs.id))toast('Можно вернуться и проголосовать позже');
    go(target,opts);
  }
  function backAction(target){
    const fallback=target||BACK_MAP[state.screen]||'start';
    try{
      go(fallback,{allowIncomplete:true}); // deterministic: never history.back() (could leave the prototype)
    }catch(e){go(fallback,{replace:true});}
  }

  function formatDateShort(d,padDay=false){if(!d)return 'дата';return `${W[d.getDay()]}, ${padDay?String(d.getDate()).padStart(2,'0'):d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')}`;}
  function formatDateLong(d){if(!d)return 'дата';return `${d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;}

  function getBaseDate(){
    if(state.demo)return new Date(2026,9,19);
    return new Date();
  }
  function getMonday(base){const d=new Date(base);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d;}

  function renderWeeksHTML(base){
    const start=getMonday(base);
    const baseDay=new Date(base);baseDay.setHours(0,0,0,0);
    let html='';
    for(let n=0;n<8;n++){
      html+='<div class="wk">';
      for(let i=0;i<7;i++){
        const x=new Date(start);x.setDate(start.getDate()+n*7+i);
        const closed=x<baseDay||i>4;
        const sel=state.selectedDate&&x.toDateString()===new Date(state.selectedDate).toDateString();
        html+=`<div class="d ${closed?'closed':'open'}${x.getTime()===baseDay.getTime()?' today':''}${sel?' sel':''}" data-t="${x.getTime()}" data-action="${closed?'':'select-date'}">${x.getDate()}${x.getDate()===1&&n*7+i>0?`<span class="mlab">${M_SHORT[x.getMonth()]}</span>`:''}</div>`;
      }
      html+='</div>';
    }
    return html;
  }

  function deterministicFreeSlots(date){
    const seed=date.getDate()*7+date.getMonth()*3+date.getFullYear()%10;
    const busy=new Set();
    for(let i=0;i<6;i++)busy.add((seed*3+i*5)%18);
    const free=[];
    for(let i=0;i<18;i++)if(!busy.has(i)){const h=Math.floor(i/2)+9,m=i%2?'30':'00';free.push(String(h).padStart(2,'0')+':'+m);}
    if(!free.length)free.push('09:00');
    return free;
  }
  function isSlotAllowed(date,time,base){
    const [h,m]=time.split(':').map(Number);
    const slot=new Date(date);slot.setHours(h,m,0,0);
    const min=new Date(base);min.setHours(min.getHours()+2);
    return slot>=min;
  }
  function renderSlots(){
    const tm=$('#tm'),slots=$('#slots');
    if(!tm||!slots)return;
    if(!state.selectedDate){tm.textContent='Выберите дату';slots.innerHTML='<div style="grid-column:1/-1;color:var(--muted);font-size:15px">Выберите день в календаре</div>';return;}
    const d=state.selectedDate;
    tm.textContent=`Время · ${W[d.getDay()]}, ${d.getDate()} ${M_GEN[d.getMonth()]}`;
    const free=deterministicFreeSlots(d);
    const base=getBaseDate();base.setHours(0,0,0,0);
    let html='';
    for(let mins=9*60;mins<18*60;mins+=30){
      const time=String(Math.floor(mins/60)).padStart(2,'0')+':'+(mins%60?'30':'00');
      const isFree=free.includes(time)&&isSlotAllowed(d,time,base);
      html+=`<div class="slot ${state.selectedTime===time?'sel':isFree?'':'busy'}" data-action="${isFree?'select-time':''}">${time}</div>`;
    }
    slots.innerHTML=html;
  }
  function plural(n,a,b,c){const m=n%10,h=n%100;return m===1&&h!==11?a:(m>=2&&m<=4&&(h<12||h>14))?b:c;}
  function fitCalZone(){
    const zone=$('.calzone'),stick=$('.stick'),row=$('.wk');
    if(!zone||!stick||!row)return;
    const rowH=row.offsetHeight||70;
    zone.style.setProperty('--zh',(stick.offsetHeight+70+70+20+36)+'px'); // formula verbatim from v5-step2-hint fit()
  }
  function updateCalHead(){
    const sc=$('#sc'),hd=$('#hd');
    if(!sc||!hd)return;
    const weeks=$$('.wk');if(!weeks.length)return;
    const stick=$('.stick'),top=sc.scrollTop+stick.offsetHeight,bot=sc.scrollTop+sc.clientHeight-10;
    let a=null,b=null;
    weeks.forEach((r,i)=>{
      const t=r.offsetTop+20,h=t+50;
      if(h>top+10&&t<bot-10){if(a===null)a=i;b=i;}
    });
    if(a===null){a=0;b=Math.min(weeks.length-1,3);}
    const start=getMonday(getBaseDate());
    const s=new Date(start);s.setDate(start.getDate()+a*7);
    const e=new Date(start);e.setDate(start.getDate()+b*7+6);
    if(s.getMonth()===e.getMonth())hd.textContent=`${cap(M_NOM[s.getMonth()])} ${s.getFullYear()}`;
    else if(s.getFullYear()===e.getFullYear())hd.textContent=`${cap(M_NOM[s.getMonth()])} – ${M_NOM[e.getMonth()]} ${e.getFullYear()}`;
    else hd.textContent=`${cap(M_NOM[s.getMonth()])} ${s.getFullYear()} – ${M_NOM[e.getMonth()]} ${e.getFullYear()}`;
  }

  function afterRender(screen){
    if(screen==='step2'){
      const weeks=$('#weeks');if(weeks)weeks.innerHTML=renderWeeksHTML(getBaseDate());
      renderSlots();fitCalZone();updateCalHead();
      if(document.fonts)document.fonts.ready.then(()=>{try{if(document.querySelector('.calzone'))fitCalZone();}catch(e){}});
      if(!document.documentElement.classList.contains('still')){
        const wk=$('#weeks');
        if(wk)requestAnimationFrame(()=>{wk.classList.add('nudge');wk.addEventListener('animationend',()=>wk.classList.remove('nudge'),{once:true});});
      }
      const sc=$('#sc');
      if(sc&&!sc._protoScroll){
        sc.addEventListener('scroll',()=>{
          const hint=$('#hint');
          if(hint&&sc.scrollTop>4)hint.classList.add('gone');
          updateCalHead();
        },{passive:true});
        sc._protoScroll=true;
      }
    }
    if(screen==='step5'){
      const list=$('#clist');if(list)list.innerHTML=firmCountryListHTML('');
    }
  }

  function flagOf(code){const c=COUNTRIES_PHONE.find(x=>x[3]===code);return c?c[0]:'🇪🇪';}
  function countryDropdownHtml(){
    return `<div class="dd">
      <div class="s"><input placeholder="Поиск страны или кода…" data-cc-search></div>
      <div class="list" id="cc-list">${COUNTRIES_PHONE.map(c=>`<div class="r${state.phoneCountryCode===c[3]?' on':''}" data-action="country-select" data-code="${c[3]}"><span class="flag">${c[0]}</span>${c[1]}<span class="c">${c[3]}</span></div>`).join('')}</div>
    </div>`;
  }
  function firmCountryListHTML(q){
    const query=(q||'').trim().toLowerCase();
    let list=query?FOREIGN_COUNTRIES.filter(c=>c[1].toLowerCase().includes(query)||c[2].toLowerCase()===query):FOREIGN_COUNTRIES;
    if(!query){
      const top=list.slice(0,7),rest=list.slice(7);
      return top.map(c=>firmCountryRow(c)).join('')+'<div class="sep">Все страны</div>'+rest.map(c=>firmCountryRow(c)).join('');
    }
    return list.map(c=>firmCountryRow(c,query)).join('')||'<div class="sep">Ничего не найдено</div>';
  }
  function firmCountryRow(c,hl){
    const name=hl?c[1].replace(new RegExp('('+hl.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','i'),'<mark>$1</mark>'):c[1];
    return `<div class="r" data-action="firm-country-select" data-country="${c[1]}" data-code="${c[2]}"><span class="flag">${c[0]}</span><span>${name}</span><span class="c">${c[2]}</span></div>`;
  }

  function invoiceSummary(){
    if(state.invoiceType==='person')return 'Частное лицо';
    return `Фирма · ${state.firmName||'—'}`;
  }

  function buildSheetListHTML(mode){
    let html='';
    (S.sheet_sections||[]).forEach(sec=>{
      html+=`<div class="g">${sec.title}</div>`;
      (sec.items||[]).forEach(id=>{
        const svc=getService(id);if(!svc)return;
        const sel=sheetSelection.has(id);
        const price=svc.price?`<span class="pr">${svc.price}${svc.suv?`<small>${svc.suv}</small>`:''}</span>`:'<span class="pr"></span>';
        html+=`<div class="it" data-action="sheet-toggle" data-id="${id}">${mode!=='view'?`<span class="box ${sel?'on':''}"></span>`:''}<span class="nm">${svc.name}${svc.sub?`<small>${svc.sub}</small>`:''}</span>${price}<span class="info" data-action="info" data-id="${id}">i</span></div>`;
      });
    });
    if(mode==='view'){
      const tire=getService('tire');
      if(tire&&tire.price_table){
        html+=`<div class="g">Шиномонтаж — сезонная акция</div><div class="it"><span class="nm">${tire.name}</span><span class="pr">${tire.price||''}</span><span class="info" data-action="info" data-id="tire">i</span></div>`;
        const pt=tire.price_table;
        html+=`<div class="inc"><b>Акция</b><ul>${(pt.promo||[]).map(x=>`<li>${x}</li>`).join('')}</ul><b>Доплаты</b><ul>${(pt.promo_extras||[]).map(x=>`<li>${x}</li>`).join('')}</ul>${pt.regular_title?`<b>${pt.regular_title}</b><ul>${(pt.regular||[]).map(x=>`<li>${x}</li>`).join('')}</ul>`:''}${pt.note?`<p class="note">${pt.note}</p>`:''}</div>`;
      }
    }
    return html;
  }
  function updateSheetCTA(){
    const cta=$('#sheet-cta');if(!cta)return;
    const mode=cta.dataset.mode;
    if(mode==='view')return;
    const n=sheetSelection.size;
    cta.textContent=`${mode==='select'?'Выбрать':'Добавить к записи'}${n?` (${n})`:''}`;
    cta.classList.toggle('dim',n===0);
    cta.disabled=n===0;
  }

  function openSheet(mode='add',subText){
    closeInfo();
    sheetSelection=new Set(state.extras||[]);
    const overlays=$('#overlays');
    const h3=mode==='select'?'Полный список услуг':'Дополнительные услуги';
    let sub=subText||(mode==='view'?'Цены с НДС. Окончательную стоимость и время подтвердит мастер.':((state.screen==='step4'&&['C','D'].includes(state.currentVariant&&state.currentVariant.step4_upsell))?'Если машина может побыть у нас подольше, успеем ещё и это (время подтвердит мастер)':'Успеем, если машина побудет у нас подольше. Время подтвердит мастер.'));
    const ctaText=mode==='view'?'Понятно':mode==='select'?'Выбрать':'Добавить к записи';
    const backText=mode==='select'?'← Назад':'← Назад к данным';
    overlays.innerHTML=`<div class="scrim" data-action="close-sheet"></div>
<div class="sheet" role="dialog" aria-label="Услуги"><div class="grab"></div>
<h3>${h3}</h3><p class="sub">${sub}</p>
<div class="lst">${buildSheetListHTML(mode)}</div>
<div class="button primary${mode!=='view'&&!sheetSelection.size?' dim':''}" id="sheet-cta" data-action="sheet-cta" data-mode="${mode}">${ctaText}</div>
<span class="back" data-action="close-sheet">${backText}</span></div>`;
    document.body.style.overflow='hidden';
  }

  function openInfo(id){
    const svc=getService(id);if(!svc)return;
    const prevSheet=$('#overlays .sheet');
    const wrapper=document.createElement('div');wrapper.id='info-overlay';
    const price=svc.price?` · ${svc.price}`:'';
    let inc='',exc='',note='';
    if(svc.desc){
      inc=svc.desc.includes?`<b>Что входит</b><ul>${svc.desc.includes.map(x=>`<li>${x}</li>`).join('')}</ul>`:'';
      exc=svc.desc.excludes?`<b>Что не входит</b><ul class="no">${svc.desc.excludes.map(x=>`<li>${x}</li>`).join('')}</ul>`:'';
      note=svc.desc.note?`<p class="note">${svc.desc.note}</p>`:'';
    }
    wrapper.innerHTML=`<div class="scrim" data-action="close-info"></div>
<div class="sheet" role="dialog" aria-label="${esc(svc.name)}"><div class="grab"></div>
<h3>${svc.name}</h3><p class="sub">Черновик описания${price}</p>
<div class="lst"><div class="inc">${inc}${exc}${note}</div></div>
<div class="button primary" data-action="close-sheet">Понятно</div>
<span class="back" data-action="close-sheet">← Назад</span></div>`;
    $('#overlays').appendChild(wrapper);
    document.body.style.overflow='hidden';
  }

  function vatPrefix(){
    if(!state.foreignFirm)return 'EE';
    const c=(typeof FOREIGN_COUNTRIES!=='undefined'?FOREIGN_COUNTRIES:[]).find(x=>x[1]===state.firmCountry);
    if(!c)return '';
    return c[2]==='GR'?'EL':c[2]; // Greece VAT prefix is EL
  }
  function vatRest(raw,pfx){
    let v=String(raw||'').toUpperCase().replace(/[^0-9A-Z]/g,'');
    if(pfx)while(v.startsWith(pfx))v=v.slice(pfx.length); // «EE123…», «ee 123 456 789», no double EE
    if(pfx==='EE')v=v.replace(/\D/g,'');
    return v;
  }
  function vatFull(){const el=$('#vat');const pfx=vatPrefix();const r=el?vatRest(el.value,pfx):vatRest(state.vat,pfx);return r?pfx+r:'';}
  function vatValid(){const pfx=vatPrefix();const r=vatRest(state.vat,pfx);return !r||pfx!=='EE'||r.length===9;}
  // 19.10 17:33: required firm field error = same minimal style as the VAT check (orange border + short caption)
  function reqMark(el,bad){
    el.classList.toggle('invalid',bad);
    const f=el.closest('.field');if(!f)return;
    let er=f.querySelector(':scope > .req-err');
    if(bad&&!er){er=document.createElement('p');er.className='note req-err';er.textContent='Заполните поле';f.appendChild(er);}
    if(er)er.style.display=bad?'':'none';
  }
  function vPortals(){return window.VOUCHER_PORTALS||[];}
  function vPortal(){const ps=vPortals();return ps.find(x=>x.id===state.voucherPortal)||ps[0]||null;}
  function chosenServiceIds(){return state.selectedGroup==='wash'?(state.washItems||[]).slice():(state.selectedGroup?[state.selectedGroup]:[]);}
  function vCampaign(){const p=vPortal();return p?(p.campaigns||[]).find(c=>c.code===state.voucherCampaign)||null:null;}
  function voucherAuto(){ // portal: first one preselected; campaign: auto when the chosen service matches exactly one campaign
    const p=vPortal();if(!p)return;if(!state.voucherPortal)state.voucherPortal=p.id;
    if(!state.voucherCampaign){const ids=chosenServiceIds();const m=(p.campaigns||[]).filter(c=>(c.services||[]).some(x=>ids.includes(x)));if(m.length===1)state.voucherCampaign=m[0].code;}
  }
  function voucherHtml(){
    voucherAuto();
    const on=!!state.voucherOn,p=vPortal(),c=vCampaign(),ps=vPortals();
    const pOpts=ps.map(x=>`<option value="${esc(x.id)}"${p&&x.id===p.id?' selected':''}>${esc(x.name)}</option>`).join('');
    const cOpts=`<option value=""${c?'':' selected'}>Выберите акцию</option>`+(p?(p.campaigns||[]):[]).map(x=>`<option value="${esc(x.code)}"${c&&x.code===c.code?' selected':''}>${esc(x.code)} — ${esc(x.label)}</option>`).join('');
    return `<label class="cb" for="voucher"><input type="checkbox" class="cbx" id="voucher" name="voucher"${on?' checked':''}><span class="box${on?' on':''}" id="vbox"></span>У меня есть ваучер</label>
<div id="voucherFields" style="display:${on?'flex':'none'};flex-direction:column;gap:12px">
<div class="field"><label class="l" for="voucher-portal">Портал</label><select class="input" id="voucher-portal" name="voucher_portal">${pOpts}</select></div>
<div class="field"><label class="l" for="voucher-campaign">Акция</label><select class="input" id="voucher-campaign" name="voucher_campaign">${cOpts}</select></div>
<div class="field"><label class="l" for="voucher-digits">Последние 4 цифры</label><div class="phone"><span class="cc" id="voucher-pfx"${c?'':' style="display:none"'}>${c?esc(c.code):''}</span><span class="vdash" id="voucher-dash"${c?'':' style="display:none"'}>-</span><input class="input" id="voucher-digits" name="voucher_digits" type="text" inputmode="numeric" autocomplete="off" placeholder="0000" value="${esc(state.voucherDigits||'')}"></div><p class="note vat-err" id="voucher-err" style="display:none">Нужно 4 цифры</p></div>
<div class="field"><label class="l" for="voucher-pin">PIN</label><input class="input" id="voucher-pin" name="voucher_pin" type="text" inputmode="numeric" autocomplete="off" value="${esc(state.voucherPin||'')}"></div>
<p class="note" style="margin:0;font-size:14px">(можно предъявить в сервисе)</p>
</div>`;
  }
  function voucherDigitsOk(){const d=state.voucherDigits||'';return !state.voucherOn||d.length===0||d.length===4;}
  function captureStep3(){
    state.phoneDigits=$('#phone-digits')?$('#phone-digits').value.trim():'';
    state.email=state.emailSkipped?'':($('#email-input')?$('#email-input').value.trim():'');
    state.plate=state.plateSkipped?'':($('#plate-input')?$('#plate-input').value.trim():'');
    state.clientName=$('#client-name')?$('#client-name').value.trim():'';
  }
  function captureStep5(){
    const v=s=>{const el=$(s);return el?el.value.trim():'';};
    state.firmName=v('#org');state.regCode=v('#regcode');state.vat=vatFull();
    state.city=v('#city');state.zip=v('#zip');state.street=v('#street');state.accountingEmail=v('#acc');
    if($('#voucher'))state.voucherOn=$('#voucher').checked;if($('#voucher-portal'))state.voucherPortal=$('#voucher-portal').value;if($('#voucher-campaign'))state.voucherCampaign=$('#voucher-campaign').value;
    if($('#voucher-digits'))state.voucherDigits=v('#voucher-digits').replace(/\D/g,'').slice(0,4);if($('#voucher-pin'))state.voucherPin=v('#voucher-pin').replace(/\D/g,'');
    state.carMake=v('#car-make');state.carModel=v('#car-model');state.carYear=v('#car-year');
    state.carRadius=v('#car-radius');state.carVIN=v('#car-vin');
    const c=v('#country');if(c)state.firmCountry=c;else if(state.foreignFirm)state.firmCountry=v('#firm-country-search')||'';
  }

  function handleStart(){
    const name=$('#participant-name')?$('#participant-name').value.trim():'';
    if(!name){const el=$('#participant-name');if(el){el.classList.add('invalid');el.focus();}return;}
    state.name=name;state.bookingNo=generateBookingNo();saveForm();go('step1');
  }
  function handleBookAgain(){
    state.previousBookings.push({plate:state.plate||'Без номера',date:state.selectedDate,time:state.selectedTime});
    state.confirmedBookingNo='';
    state.selectedGroup=null;state.washItems=[];state.selectedDate=null;state.selectedTime=null;
    state.plate='';state.plateSkipped=false;state.extras=[];state.bookingNo='';saveForm();go('step1');
  }

  function sendVotes(){
    try{
      const general=$('#general-comment')?$('#general-comment').value.trim():'';
      const payload={
        participant:state.name,
        submitted_at:new Date().toISOString(),
        client_id:state.clientId,
        user_agent:navigator.userAgent,
        votes:VOTE_SCREENS.map(vs=>({
          screen_id:vs.id,screen:vs.title,
          variants:(state.votes[vs.id]||[]).slice().sort(),
          variant_labels:(state.votes[vs.id]||[]).slice().sort().map(v=>{
            const variant=vs.variants.find(x=>x.id===v);
            return variant?variant.label:v;
          }),
          comment:state.votesComments[vs.id]||''
        })),
        general_comment:general
      };
      localStorage.setItem(VOTE_KEY,JSON.stringify(state.votes));
      localStorage.setItem(DONE_KEY,'1');
      state.submitted=true;
      const status=$('#send-status');
      if(!PROTO_CONFIG.VOTE_ENDPOINT){
        if(status)status.textContent='Ответ сохранён (в этом браузере)';
        return;
      }
      if(status)status.textContent='Отправка...';
      fetch(PROTO_CONFIG.VOTE_ENDPOINT,{
        method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},mode:'no-cors',body:JSON.stringify(payload)
      }).then(()=>{if(status)status.textContent='Ответ отправлен. Спасибо!';})
      .catch(()=>{if(status)status.innerHTML='Не удалось отправить, ответ сохранён в этом браузере <button class="button secondary" data-action="retry-send">Попробовать ещё раз</button>';});
    }catch(e){console.error(e);}
  }

  document.addEventListener('click',e=>{
    try{
      const variantEl=e.target.closest('[data-action="variant"]');
      if(variantEl){
        const vs=getVoteScreenForCurrent();
        if(vs){
          const y=window.scrollY;
          state.currentVariant[vs.id]=variantEl.dataset.variant;
          saveForm();
          renderScreen(state.screen);
          window.scrollTo(0,y);
        }
        return;
      }
      const voteEl=e.target.closest('.vote-panel .cb[data-action="vote"]');
      if(voteEl){
        const vs=getVoteScreenForCurrent();
        if(vs){
          const id=voteEl.dataset.variant;
          const arr=state.votes[vs.id]||[];
          if(arr.includes(id))state.votes[vs.id]=arr.filter(x=>x!==id);
          else state.votes[vs.id]=arr.concat(id);
          saveVotes();
          const box=voteEl.querySelector('.box');if(box)box.classList.toggle('on',state.votes[vs.id].includes(id));
        }
        return;
      }

      const act=e.target.closest('[data-action]');
      if(!act)return;
      const action=act.dataset.action;

      if(action==='back'){backAction(act.dataset.back);return;}
      if(action==='start'){handleStart();return;}
      if(action==='step1-next'){if(isAnyServiceSelected())proceedTo('step2');return;}
      if(action==='step2-next'){
        if(!state.selectedDate||!state.selectedTime){toast('Выберите время');return;}
        proceedTo('step3');return;
      }
      if(action==='step3-next'){
        captureStep3();
        if(!state.phoneDigits){$('#phone-digits').classList.add('invalid');return;}
        if(!state.emailSkipped&&!state.email){$('#email-input').classList.add('invalid');return;}
        if(!state.plateSkipped&&!state.plate){$('#plate-input').classList.add('invalid');return;}
        state.bookingNo=state.bookingNo||generateBookingNo();
        state.confirmedBookingNo=state.bookingNo;saveForm();proceedTo('step4');return;
      }
      if(action==='save5'){
        captureStep5();
        if(!voucherDigitsOk()){const el=$('#voucher-digits'),er=$('#voucher-err');if(el){el.classList.add('invalid');el.scrollIntoView({behavior:'smooth',block:'center'});el.focus();}if(er)er.style.display='';return;}
        if(state.invoiceType==='firm'){
          const req=['#org','#regcode','#city','#zip','#street'];
          if(state.foreignFirm)req.unshift('#country');
          req.forEach(s=>{const el=$(s);if(el)reqMark(el,!el.value.trim());});
          const empty=req.map(s=>$(s)).filter(x=>x&&!x.value.trim());
          if(empty.length){empty[0].scrollIntoView({behavior:'smooth',block:'center'});empty[0].focus();return;}
          if(!vatValid()){const el=$('#vat'),er=$('#vat-err');if(el){el.classList.add('invalid');el.scrollIntoView({behavior:'smooth',block:'center'});el.focus();}if(er)er.style.display='';return;}
        }
        saveForm();proceedTo('thanks');return;
      }
      if(action==='to-step5'){proceedTo('step5');return;}
      if(action==='done'){if(PRESENT){try{sessionStorage.removeItem(FORM_KEY);}catch(e){}location.replace(location.pathname);return;}proceedTo('end');return;}
      if(action==='another-car'){handleBookAgain();return;}
      if(action==='cal-btn'||action==='map-btn'||action==='reschedule'){toast('В боевой версии');return;}
      if(action==='upsell'){
        const dir=act.dataset.direction;
        if(dir==='body'){openInfo('body');return;}
        if(dir && S.thanks_directions){
          openSheet('add');
          const d=S.thanks_directions.find(x=>x.id==='dir_'+dir);
          if(d && d.sheet)delay(()=>{
            const secs=$$('#overlays .g');
            const target=secs.find(g=>g.textContent===d.sheet);
            if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
          },60);
        }else openSheet('add');
        return;
      }
      if(action==='price-list'){openSheet('view');return;}
      if(action==='sheet-toggle'){
        const id=act.dataset.id;
        if(id&&!act.classList.contains('dis')){
          if(sheetSelection.has(id))sheetSelection.delete(id);else sheetSelection.add(id);
          const box=act.querySelector('.box');if(box)box.classList.toggle('on',sheetSelection.has(id));
          updateSheetCTA();
        }
        return;
      }
      if(action==='sheet-cta'){
        const mode=act.dataset.mode;
        if(mode==='view'){closeOverlays();return;}
        if(!sheetSelection.size)return;
        state.extras=Array.from(sheetSelection);saveForm();
        closeOverlays();document.body.style.overflow='';
        toast('Добавлено к записи — мастер подтвердит время');
        if(mode==='select')renderScreen(state.screen);
        return;
      }
      if(action==='close-sheet'){
        const infoOverlay=act.closest('#info-overlay');
        if(infoOverlay){closeInfo();return;}
        closeOverlays();document.body.style.overflow='';
        return;
      }
      if(action==='close-info'){closeInfo();return;}
      if(action==='info'){
        if(act.dataset.id)openInfo(act.dataset.id);
        else if(act.dataset.group)openInfo(firstServiceInGroup(act.dataset.group));
        return;
      }
      if(action==='full-list'){openSheet('select');return;}
      if(action==='toggle-group'){
        const gid=act.dataset.group;
        if(gid==='wash'){
          if(state.selectedGroup==='wash')state.selectedGroup=null;else state.selectedGroup='wash';
        }else{
          state.selectedGroup=state.selectedGroup===gid?null:gid;state.washItems=[];
        }
        saveForm();
        const groups=$('#step1-groups');if(groups)groups.innerHTML=renderGroupsHtml();
        syncStep1Next();
        return;
      }
      if(action==='wash-item'){
        const id=act.dataset.id;
        if(isIncompatible(id))return;
        if(state.washItems.includes(id))state.washItems=state.washItems.filter(x=>x!==id);
        else{
          const inc=S.incompatible||{},toRemove=new Set();
          if(inc[id])inc[id].forEach(b=>{if(state.washItems.includes(b))toRemove.add(b);});
          Object.keys(inc).forEach(key=>{if(key!==id&&inc[key].includes(id)&&state.washItems.includes(key))toRemove.add(key);});
          state.washItems=state.washItems.filter(x=>!toRemove.has(x));
          state.washItems.push(id);
        }
        saveForm();
        const groups=$('#step1-groups');if(groups)groups.innerHTML=renderGroupsHtml();
        syncStep1Next();
        return;
      }
      if(action==='select-date'){
        const t=+act.dataset.t;
        if(!isNaN(t)){
          state.selectedDate=new Date(t);state.selectedTime=null;
          $$('.d.sel').forEach(el=>el.classList.remove('sel'));
          act.classList.add('sel');
          renderSlots();saveForm();
        }
        return;
      }
      if(action==='select-time'){
        const time=act.textContent.trim();
        state.selectedTime=time;
        $$('.slot.sel').forEach(el=>el.classList.remove('sel'));
        act.classList.add('sel');
        saveForm();
        return;
      }
      if(action==='cc'){
        const dd=$('#cc-dropdown');
        if(dd.innerHTML){dd.innerHTML='';return;}
        dd.innerHTML=countryDropdownHtml();
        return;
      }
      if(action==='country-select'){
        state.phoneCountryCode=act.dataset.code;saveForm();
        const btn=$('#cc-btn');if(btn)btn.innerHTML=`<span class="flag">${flagOf(state.phoneCountryCode)}</span>${state.phoneCountryCode}<svg class="icon chev" style="width:14px;height:14px"><use href="#i-down"/></svg>`;
        const dd=$('#cc-dropdown');if(dd)dd.innerHTML='';
        return;
      }
      if(action==='email-skip'){
        state.emailSkipped=!state.emailSkipped;saveForm();renderScreen('step3');return;
      }
      if(action==='plate-skip'){
        state.plateSkipped=!state.plateSkipped;saveForm();renderScreen('step3');return;
      }
      if(action==='plate-info'){
        const field=act.closest('.field');
        let tip=field.querySelector('.tip');
        if(tip){tip.remove();act.classList.remove('open');}
        else{
          tip=document.createElement('div');tip.className='tip';tip.textContent='Если у машины по какой-то причине нет номера, поставьте галочку — тогда номер можно не указывать.';
          field.appendChild(tip);act.classList.add('open');
        }
        return;
      }
      if(action==='invoice'){
        captureStep5();state.invoiceType=act.dataset.invoice;saveForm();renderScreen('step5');return;
      }
      if(action==='firm-country-select'){
        state.firmCountry=act.dataset.country;saveForm();
        const input=$('#country');if(input){input.value=state.firmCountry;}
        {const pfx=vatPrefix(),pe=$('#vat-pfx'),ve=$('#vat');if(pe){pe.textContent=pfx;pe.style.display=pfx?'':'none';}if(ve){const r=vatRest(state.vat.replace(/^[A-Z]{2}/,''),pfx);ve.value=r;ve.inputMode=pfx==='EE'?'numeric':'text';ve.placeholder=pfx==='EE'?'123456789':'';state.vat=r?pfx+r:'';saveForm();}}
        const list=$('#clist');if(list)list.innerHTML=firmCountryListHTML(input?input.value:'');
        return;
      }
      if(action==='car-expander'){
        const row=act;
        const details=$('#car-details');
        row.style.display='none';
        if(details)details.style.display='block';
        return;
      }
      if(action==='send'){sendVotes();return;}
      if(action==='retry-send'){sendVotes();return;}
      if(action==='answers'){go('end');return;}
      if(action==='goto'){go(act.dataset.screen);return;}
    }catch(err){console.error(err);}
  });

  document.addEventListener('submit',e=>{e.preventDefault();},true); // mockup form uses <button type=submit>: all saving is done by the click handler (no native submit/validation)
  document.addEventListener('input',e=>{
    try{
      const t=e.target;
      if(t.matches&&t.matches('[data-field]')&&!t.matches('[type=checkbox], [type=radio], select')){
        state[t.dataset.field]=t.value;
        if(['car-make','car-model','car-year','car-radius','car-vin'].includes(t.dataset.field))state[t.dataset.field]=t.value;
        if(t.dataset.field==='car-radius')state.carRadius=t.value;
        saveForm();
      }
      if(t.matches&&t.matches('[data-cc-search]')){
        const q=t.value.trim().toLowerCase();
        const list=$('#cc-list');
        if(list){
          const filtered=COUNTRIES_PHONE.filter(c=>c[1].toLowerCase().includes(q)||c[2].toLowerCase()===q||c[3].replace('+','')===q||c[3]===q);
          list.innerHTML=filtered.map(c=>`<div class="r${state.phoneCountryCode===c[3]?' on':''}" data-action="country-select" data-code="${c[3]}"><span class="flag">${c[0]}</span>${c[1]}<span class="c">${c[3]}</span></div>`).join('');
        }
      }
      if(t.matches&&t.matches('#org, #regcode, #city, #zip, #street, #country')&&t.classList.contains('invalid')&&t.value.trim())reqMark(t,false);
      if(t.matches&&t.matches('#voucher-digits')){const d=t.value.replace(/\D/g,'').slice(0,4);if(t.value!==d)t.value=d;state.voucherDigits=d;saveForm();if(voucherDigitsOk()){t.classList.remove('invalid');const er=$('#voucher-err');if(er)er.style.display='none';}}
      if(t.matches&&t.matches('#voucher-pin')){const d=t.value.replace(/\D/g,'');if(t.value!==d)t.value=d;state.voucherPin=d;saveForm();}
      if(t.matches&&t.matches('#vat')){
        const pfx=vatPrefix(),r=vatRest(t.value,pfx);
        if(t.value!==r){t.value=r;}
        state.vat=r?pfx+r:'';saveForm();
        if(vatValid()){t.classList.remove('invalid');const er=$('#vat-err');if(er)er.style.display='none';}
      }
      if(t.matches&&t.matches('#country')){
        const list=$('#clist');if(list)list.innerHTML=firmCountryListHTML(t.value);
      }
      if(t.matches&&t.matches('[data-vote-comment]')){
        setVoteComment(t.dataset.voteComment,t.value);
      }
    }catch(e){console.error(e);}
  });

  document.addEventListener('change',e=>{
    try{
      const t=e.target;
      if(t.matches&&t.matches('#voucher-portal')){state.voucherPortal=t.value;state.voucherCampaign='';voucherAuto();saveForm();const vb=$('#voucherBlk');if(vb)vb.innerHTML=voucherHtml();return;}
      if(t.matches&&t.matches('#voucher-campaign')){state.voucherCampaign=t.value;saveForm();const c=vCampaign(),pe=$('#voucher-pfx');if(pe){pe.textContent=c?c.code:'';pe.style.display=c?'':'none';}const de=$('#voucher-dash');if(de)de.style.display=c?'':'none';return;}
      if(t.matches&&t.matches('#voucher')){
        state.voucherOn=t.checked;saveForm();
        const b=$('#vbox'),f=$('#voucherFields');if(b)b.classList.toggle('on',t.checked);if(f)f.style.display=t.checked?'flex':'none';
        return;
      }
      if(t.matches&&t.matches('#foreign')){
        captureStep5();state.foreignFirm=t.checked;saveForm();renderScreen('step5');
        return;
      }
      if(t.matches&&t.matches('[data-field]')){
        state[t.dataset.field]=t.type==='checkbox'?t.checked:t.value;
        if(t.dataset.field==='car-radius')state.carRadius=t.value;
        saveForm();
      }
    }catch(e){console.error(e);}
  });

  window.addEventListener('resize',()=>{try{if(document.querySelector('.calzone'))fitCalZone();}catch(e){console.error(e);}});

  function handleHistoryChange(event={}){
    try{
      const h=location.hash.replace(/^#(s-)?/,'')||'start'; // '#s-' prefix: mockup sections have id=step4 etc., a plain #step4 made the browser jump
      if(h===state.screen&&event.type!=='popstate')return; // ignore a hashchange following the handled popstate
      if(isBookingConfirmed()&&['start','step1','step2','step3'].includes(h)){
        go('step4',{replace:true}); // block earlier steps without discarding post-confirmation Forward entries
        return;
      }
      if(PRESENT&&(h==='start'||h==='end')){go('step1',{replace:true});return;}
      if(ROUTES.includes(h))go(h,{replace:true,allowIncomplete:h!=='step4'});
    }catch(e){console.error(e);}
  }
  window.addEventListener('popstate',handleHistoryChange);
  window.addEventListener('hashchange',handleHistoryChange);

  function fillDemo(){
    state.name='Test';state.selectedGroup='tire';state.washItems=[];
    state.selectedDate=new Date(2026,9,21);state.selectedDate.setHours(0,0,0,0);
    state.selectedTime='10:00';
    state.phoneCountryCode='+372';state.phoneDigits='5557 6777';
    state.email='name@example.com';state.emailSkipped=false;
    state.plate='123 ABC';state.plateSkipped=false;state.clientName='Test';
    ensureBookingNo();state.extras=[];
    state.invoiceType='person';state.foreignFirm=false;state.firmCountry='';state.firmName='';
    saveForm();
  }

  function init(){
    const q=new URLSearchParams(location.search);
    const screen=q.get('screen');
    if(q.get('still')==='1')document.documentElement.classList.add('still');
    const name=q.get('name');
    if(name==='Test'){
      state.demo=true;
      fillDemo();
      if(q.get('wash')==='1'){
        state.selectedGroup='wash';state.washItems=['wash_in_out','dry_clean'];
      }
      if(q.get('firm')==='1'){
        state.invoiceType='firm';state.firmName='';state.foreignFirm=false;
      }
    }
    if(screen){
      const v=q.get('v');
      if(v){
        const vs=VOTE_SCREENS.find(x=>x.screen===screen&&x.variants.some(y=>y.id===v));
        if(vs)state.currentVariant[vs.id]=v;
      }
      if(screen==='sheet'){
        go('step4',{replace:true,allowIncomplete:true});
        openSheet('add');
        return;
      }
      if(screen==='info'){
        go('step1',{replace:true,allowIncomplete:true});
        openInfo('wash_in_out');
        return;
      }
      go(screen,{replace:true,allowIncomplete:true});
      return;
    }
    const h=location.hash.replace(/^#(s-)?/,'');
    if(h)go(h,{replace:true});else go(PRESENT?'step1':'start',{replace:true});
  }

  window.__proto={get state(){return state;},go:go};
  init();
})();
