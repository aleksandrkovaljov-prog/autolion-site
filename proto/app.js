(function(){
  'use strict';

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n,min,max)=>Math.min(Math.max(n,min),max);
  const cap = s => s ? s[0].toUpperCase()+s.slice(1) : s;

  const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const MONTHS_NOM = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
  const MONTHS_SHORT = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  const WEEKDAYS = ['вс','пн','вт','ср','чт','пт','сб'];

  const S = window.SERVICES || {services:{},groups:[],sheet_sections:[],step1_wash_items:[],incompatible:{},thanks_directions:[]};
  const getService = id => S.services && S.services[id] ? S.services[id] : null;
  const getGroup = id => S.groups ? S.groups.find(g=>g.id===id) : null;
  const serviceName = id => { const s=getService(id); return s ? s.name : id; };
  const groupName = id => { const g=getGroup(id); return g ? g.name : id; };

  const FORM_KEY = 'autolion_proto_form_v2';
  const VOTE_KEY = 'autolion_proto_votes_v2';
  const COMMENTS_KEY = 'autolion_proto_votes_comments_v2';
  const DONE_KEY = 'autolion_proto_done_v2';
  const CLIENT_ID_KEY = 'autolion_proto_client_id_v2';
  const PROTO_CONFIG = window.PROTO_CONFIG || {VOTE_ENDPOINT:''};

  const VOTE_SCREENS = [
    {
      id:'step4_upsell',
      screen:'step4',
      title:'Шаг 4 — допродажа под кнопкой данных',
      variants:[
        {id:'A', label:'A — Карточка «Пока машина у нас» + «Дополнительные услуги ›»'},
        {id:'B', label:'B — Плашка «+ Мойка или химчистка»'},
        {id:'C', label:'C — Карточка «…успеем ещё и это (время подтвердит мастер)»'},
        {id:'D', label:'D — Карточка «Помыть её или убрать салон?»'}
      ]
    },
    {
      id:'step5_save',
      screen:'step5',
      title:'Шаг 5 — текст главной кнопки',
      variants:[
        {id:'A', label:'A — «Сохранить»'},
        {id:'B', label:'B — «Сохранить данные»'}
      ]
    },
    {
      id:'thanks_upsell',
      screen:'thanks',
      title:'«Спасибо, данные сохранены» — как предложить доп. услуги',
      variants:[
        {id:'A', label:'A — «Можете оставить машину подольше?», строки'},
        {id:'B', label:'B — «Успеем сделать ещё», плитки 2×2'},
        {id:'C', label:'C — «Пока машина у нас», строки'},
        {id:'D', label:'D — «Успеем сделать ещё», строки (сводный)'}
      ]
    }
  ];

  const COUNTRIES_PHONE = [
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
  const FOREIGN_COUNTRIES = [
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

  const ROUTES = ['start','step1','step2','step3','step4','step5','thanks','end'];
  const BACK_MAP = {step2:'step1', step3:'step2', step4:'step3', step5:'step4', thanks:'step5', end:'start', step1:'start'};
  let timers = [];
  let sheetSelection = new Set();

  function loadVotes(){ try { return JSON.parse(localStorage.getItem(VOTE_KEY) || '{}'); } catch(e){ console.error(e); return {}; } }
  function loadComments(){ try { return JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}'); } catch(e){ console.error(e); return {}; } }
  function saveVotes(){ localStorage.setItem(VOTE_KEY, JSON.stringify(state.votes)); localStorage.setItem(COMMENTS_KEY, JSON.stringify(state.votesComments)); }

  function genId(){ return Math.random().toString(36).slice(2,10); }
  function generateBookingNo(){ return 'AL-' + Math.floor(1000 + Math.random()*9000); }

  function defaultState(){
    return {
      screen:'start', name:'', selectedGroup:null, washItems:[], extras:[],
      selectedDate:null, selectedTime:null, phoneCountryCode:'+372', phoneDigits:'',
      email:'', emailSkipped:false, plate:'', plateSkipped:false, clientName:'', bookingNo:'',
      invoiceType:'person', foreignFirm:false, firmCountry:'', firmName:'', regCode:'', vat:'',
      city:'', zip:'', street:'', accountingEmail:'', carMake:'', carModel:'', carYear:'',
      carRadius:'', carVIN:'', previousBookings:[], currentVariant:{},
      votes: loadVotes(), votesComments: loadComments(),
      clientId: localStorage.getItem(CLIENT_ID_KEY) || genId(),
      submitted: localStorage.getItem(DONE_KEY) === '1',
      lastFormScreen:'start'
    };
  }

  function loadForm(){
    try{
      const raw = sessionStorage.getItem(FORM_KEY);
      if(!raw) return null;
      const d = JSON.parse(raw);
      if(!d || d.v !== 2) return null;
      delete d.v;
      if(d.selectedDate) d.selectedDate = new Date(d.selectedDate); else d.selectedDate = null;
      return d;
    }catch(e){ console.error(e); return null; }
  }

  let state = defaultState();
  const savedForm = loadForm();
  if(savedForm) state = Object.assign(state, savedForm);
  if(!localStorage.getItem(CLIENT_ID_KEY)) localStorage.setItem(CLIENT_ID_KEY, state.clientId);

  function saveForm(){
    const d = {
      v:2,
      name: state.name, selectedGroup: state.selectedGroup, washItems: state.washItems,
      extras: state.extras, selectedDate: state.selectedDate ? state.selectedDate.toISOString() : null,
      selectedTime: state.selectedTime, phoneCountryCode: state.phoneCountryCode, phoneDigits: state.phoneDigits,
      email: state.email, emailSkipped: state.emailSkipped, plate: state.plate, plateSkipped: state.plateSkipped,
      clientName: state.clientName, bookingNo: state.bookingNo, invoiceType: state.invoiceType,
      foreignFirm: state.foreignFirm, firmCountry: state.firmCountry, firmName: state.firmName,
      regCode: state.regCode, vat: state.vat, city: state.city, zip: state.zip, street: state.street,
      accountingEmail: state.accountingEmail, carMake: state.carMake, carModel: state.carModel,
      carYear: state.carYear, carRadius: state.carRadius, carVIN: state.carVIN,
      previousBookings: state.previousBookings, lastFormScreen: state.lastFormScreen
    };
    sessionStorage.setItem(FORM_KEY, JSON.stringify(d));
  }

  function delay(fn, ms){
    const id = setTimeout(()=>{ timers = timers.filter(x=>x!==id); fn(); }, ms);
    timers.push(id); return id;
  }
  function clearTimers(){ timers.forEach(clearTimeout); timers = []; }
  function escapeHtml(s){ return String(s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function showToast(msg){
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    if(t._timer) clearTimeout(t._timer);
    t._timer = delay(()=>t.classList.remove('show'), 2500);
  }
  function closeOverlays(){
    const ov = $('#overlays');
    if(ov) ov.innerHTML = '';
    document.body.style.overflow = '';
  }

  function isWashSelected(){ return state.selectedGroup === 'wash' && state.washItems && state.washItems.length>0; }
  function isAnyServiceSelected(){ return isWashSelected() || (state.selectedGroup && state.selectedGroup !== 'wash'); }
  function isIncompatible(id){
    for(const key of Object.keys(S.incompatible || {})){
      if(key !== id && state.washItems.includes(key) && S.incompatible[key].includes(id)) return `Уже входит в «${serviceName(key)}»`;
    }
    return '';
  }

  function getVoteScreenForCurrent(){ return VOTE_SCREENS.find(v=>v.screen===state.screen); }
  function currentVariantId(vs){ return state.currentVariant[vs.id] || vs.variants[0].id; }
  function hasVotes(vsId){ return (state.votes[vsId]||[]).length>0; }
  function voteComment(vsId){ return state.votesComments[vsId] || ''; }
  function setVoteComment(vsId, text){ state.votesComments[vsId] = text; saveVotes(); }

  function firstIncompleteStep(){
    if(!state.name) return 'start';
    if(!isAnyServiceSelected()) return 'step1';
    if(!state.selectedDate || !state.selectedTime) return 'step2';
    if(!state.phoneDigits || (!state.email && !state.emailSkipped) || (!state.plate && !state.plateSkipped)) return 'step3';
    return null;
  }

  function renderScreen(screen){
    clearTimers();
    closeOverlays();
    document.body.style.overflow = '';
    const app = $('#app');
    app.innerHTML = '';
    switch(screen){
      case 'start': app.innerHTML = renderStart(); break;
      case 'step1': app.innerHTML = renderStep1(); break;
      case 'step2': app.innerHTML = renderStep2(); break;
      case 'step3': app.innerHTML = renderStep3(); break;
      case 'step4': app.innerHTML = renderStep4(); break;
      case 'step5': app.innerHTML = renderStep5(); break;
      case 'thanks': app.innerHTML = renderThanks(); break;
      case 'end': app.innerHTML = renderEnd(); break;
      default: app.innerHTML = renderStart();
    }
    afterRender(screen);
  }

  function go(screen, opts={}){
    try{
      if(!ROUTES.includes(screen)) return;
      let target = screen;
      const cur = ROUTES.indexOf(state.screen);
      const tgt = ROUTES.indexOf(target);
      if(!opts.allowIncomplete && target !== 'end' && target !== 'start' && tgt > cur){
        const min = firstIncompleteStep();
        if(min && ROUTES.indexOf(min) < tgt) target = min;
      }
      if(target === 'end' && state.screen !== 'end' && cur < ROUTES.indexOf('end')){
        state.lastFormScreen = state.screen;
      }
      if(opts.replace) history.replaceState({screen: target}, '', '#'+target);
      else history.pushState({screen: target}, '', '#'+target);
      state.screen = target;
      saveForm();
      window.scrollTo(0,0);
      renderScreen(target);
    }catch(e){ console.error(e); }
  }

  function proceedTo(target, opts){
    const vs = getVoteScreenForCurrent();
    if(vs && !hasVotes(vs.id)) showToast('Можно вернуться и проголосовать позже');
    go(target, opts);
  }

  function backAction(target){
    const fallback = target || BACK_MAP[state.screen] || 'start';
    try{
      if(history.length > 1 && location.hash.replace('#','') !== 'start') history.back();
      else go(fallback, {replace:true});
    }catch(e){ go(fallback, {replace:true}); }
  }

  function updateVoteSwitchUI(vs){
    const buttons = $$('.vote-switch button');
    buttons.forEach(b=>{
      const on = b.dataset.variant === currentVariantId(vs);
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
    });
  }
  function updateVotePanelUI(vs){
    const panel = $('#vote-panel');
    if(!panel) return;
    panel.querySelectorAll('.vp-option').forEach(opt=>{
      const input = opt.querySelector('input');
      const box = opt.querySelector('.box');
      if(input && box) box.classList.toggle('on', input.checked);
    });
    const msg = $('#vote-msg');
    if(msg && hasVotes(vs.id)) msg.classList.add('hidden');
  }

  function renderVoteBar(vs){
    const variants = vs.variants.map(v=>`<button type="button" class="${currentVariantId(vs)===v.id?'on':''}" data-variant="${v.id}" aria-pressed="${currentVariantId(vs)===v.id}">${v.id}</button>`).join('');
    return `<div class="vote-bar"><p class="vt">Варианты экрана:</p><div class="vote-switch">${variants}</div></div>`;
  }
  function renderVotePanel(vs){
    const selected = state.votes[vs.id]||[];
    const opts = vs.variants.map(v=>{
      const checked = selected.includes(v.id);
      const label = v.label.replace(/^[A-D] —\s*/, '');
      return `<label class="vp-option"><input type="checkbox" ${checked?'checked':''} value="${v.id}"><span class="box ${checked?'on':''}"></span><span><b>${v.id} —</b> ${label}</span></label>`;
    }).join('');
    return `<div class="vote-panel" id="vote-panel"><h4>Голосование</h4><p>Выберите один или несколько понравившихся вариантов</p><div id="vote-msg" class="vote-msg hidden"></div>${opts}<textarea class="vp-comment" placeholder="Комментарий (необязательно)" data-vote-comment="${vs.id}">${escapeHtml(voteComment(vs.id))}</textarea></div>`;
  }

  function refreshVariantBlock(vs){
    if(!vs) return;
    updateVoteSwitchUI(vs);
    if(vs.screen === 'step4'){
      const block = $('#variant-block');
      if(block) block.innerHTML = renderUpsellStep4(currentVariantId(vs));
    } else if(vs.screen === 'step5'){
      const btn = $('#save-step5');
      if(btn) btn.textContent = currentVariantId(vs)==='B'?'Сохранить данные':'Сохранить';
    } else if(vs.screen === 'thanks'){
      const block = $('#variant-block');
      if(block) block.innerHTML = renderThanksUpsell(currentVariantId(vs));
    }
  }

  function renderStart(){
    return `<section class="screen" data-screen="start">
      <h2>Старт голосования</h2>
      <div class="field">
        <label class="l" for="participant-name">Ваше имя <span class="req">*</span></label>
        <input class="input" id="participant-name" type="text" autocomplete="given-name" data-field="name" value="${escapeHtml(state.name)}" placeholder="Имя">
      </div>
      <p style="margin:0;font-size:var(--t-sec);color:var(--muted)">Это прототип онлайн-записи Autolion. Пройдите запись как клиент — всё понарошку, ничего никуда не уходит, кроме ваших ответов. На трёх экранах с вариантами есть переключатель A/B/C/D — посмотрите каждый и внизу экрана отметьте один или несколько понравившихся. Можно оставить комментарий. В конце нажмите «Отправить ответы». Ответы других участников вам не видны.</p>
      ${state.submitted ? `<div class="sent ph">Вы уже отправляли ответы в этом браузере.</div>` : ''}
      <button class="button primary" data-action="start-btn">${state.submitted ? 'Пройти заново' : 'Начать'}</button>
    </section>`;
  }

  function iconName(gid){
    switch(gid){
      case 'wash': return 'i-wash';
      case 'tire': return 'i-tire';
      case 'insurance': return 'i-doc';
      case 'body': return 'i-car';
      case 'ac': return 'i-snow';
      default: return 'i-list';
    }
  }
  function firstServiceInGroup(gid){
    const g = getGroup(gid);
    if(gid==='wash') return (S.step1_wash_items||[])[0];
    return g ? g.id : gid;
  }

  function renderStep1Groups(){
    let html = '';
    (S.groups||[]).forEach(g=>{
      const isWash = g.id==='wash';
      const isOpen = isWash && state.selectedGroup==='wash';
      const selectedNonWash = !isWash && state.selectedGroup===g.id;
      const selectedForWash = isWash && state.washItems.length>0;
      html += `<div class="grp ${isOpen?'open':''} ${selectedForWash||selectedNonWash?'sel':''}" data-group="${g.id}">
        <div class="grp-h">
          <button type="button" class="grp-main" data-action="toggle-group" data-group="${g.id}">
            <svg class="icon"><use href="#${iconName(g.id)}"/></svg>
            <span class="t">${g.name}<small class="et">${g.et||''}</small>${g.multi?'<small>несколько услуг</small>':''}</span>
            <svg class="icon chev" style="${isOpen?'transform:rotate(180deg);color:var(--accent)':''}"><use href="#i-down"/></svg>
          </button>
          <button type="button" class="i-btn" data-action="info" data-group="${g.id}">i</button>
        </div>
        ${isWash && isOpen ? `<div class="grp-b">${renderWashItems()}${renderWashSummary()}${renderWashNote()}<button type="button" class="link" data-action="full-list">Полный список услуг ›</button></div>` : ''}
      </div>`;
    });
    return html;
  }

  function renderWashItems(){
    let html = '';
    (S.step1_wash_items||[]).forEach(id=>{
      const svc = getService(id);
      if(!svc) return;
      const incompatible = isIncompatible(id);
      const selected = state.washItems.includes(id);
      html += `<div class="item ${incompatible?'dis':''}" data-action="toggle-wash-item" data-item="${id}">
        <span class="box ${selected&&!incompatible?'on':''}"></span>
        <span style="flex:1;min-width:0">${svc.name}${svc.sub?`<span class="why">${svc.sub}</span>`:''}${incompatible?`<span class="why">${incompatible}</span>`:''}</span>
        <button type="button" class="i-btn" data-action="info" data-service="${id}">i</button>
      </div>`;
    });
    return html;
  }
  function renderWashSummary(){
    const n = state.washItems.length;
    if(!n) return '';
    return `<div class="tot"><span>Выбрано ${n} услуг${n>1?'ы':''}</span><b>Цена в описании</b></div>`;
  }
  function renderWashNote(){
    if(state.washItems.length>1) return `<div class="mnote"><svg class="icon"><use href="#i-warn"/></svg><span>Запись на несколько услуг подтверждает мастер — мы свяжемся с вами.</span></div>`;
    return '';
  }

  function renderStep1(){
    return `<section class="screen" data-screen="step1">
      <div class="crumb">Главная › Онлайн-запись</div>
      <h2>Онлайн-запись</h2>
      <ol class="steps"><li class="cur"></li><li></li><li></li><li></li></ol>
      <p class="stepline">Шаг 1 из 4 · <b>Услуга</b></p>
      ${state.previousBookings.length ? `<p class="prev-booked">Уже записано: ${state.previousBookings.map(pb=>`${escapeHtml(pb.plate)} · ${pb.date?formatDateShort(pb.date):''} · ${pb.time||''}`).join('; ')}</p>` : ''}
      <h3>Выберите услугу</h3>
      <div id="step1-groups">${renderStep1Groups()}</div>
      <button class="button primary ${isAnyServiceSelected()?'':'dim'}" id="step1-next" data-action="step1-next" ${isAnyServiceSelected()?'':'disabled'}>Дальше: дата и время →</button>
    </section>`;
  }

  function renderStep2(){
    const base = getBaseDate();
    const hasDateTime = state.selectedDate && state.selectedTime;
    return `<section class="screen" data-screen="step2">
      <button class="back" data-action="back" data-back="step1">← Назад</button>
      <div class="crumb">Главная › Онлайн-запись</div>
      <h2>Онлайн-запись</h2>
      <ol class="steps"><li class="done"></li><li class="cur"></li><li></li><li></li></ol>
      <p class="stepline">Шаг 2 из 4 · <b>Дата и время</b></p>
      <button class="option sel" data-action="back" data-back="step1" style="margin-bottom:10px"><span style="font-size:16px">${serviceSummary()}</span><span style="margin-left:auto;font-size:15px;color:var(--muted)">Изменить</span></button>
      <div class="calzone" id="calzone"><div class="zonebg"></div>
        <div class="calscroll" id="calscroll">
          <div class="stick"><div class="cal-head" id="calhead"></div>
            <div class="dowrow"><div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div></div></div>
          <div id="weeks">${renderWeeksHTML(base)}</div><div class="tail" style="height:14px"></div>
        </div><div class="fade"></div>
      </div>
      <div class="hint" id="calhint">Листайте вниз — следующие недели <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 6l4.5 4.5L12.5 6"/></svg></div>
      <h3 class="tm" id="tm-title">${state.selectedDate ? 'Время' : 'Выберите дату'}</h3>
      <div class="slots" id="slots"></div>
      <button class="button primary" data-action="step2-next">Дальше: контакты →</button>
    </section>`;
  }

  function getBaseDate(){
    const today = new Date();
    const cutoff = new Date(2026,9,19);
    if(today < cutoff) return new Date(2026,9,19);
    return today;
  }
  function getMonday(base){
    const d = new Date(base); d.setHours(0,0,0,0); d.setDate(d.getDate() - ((d.getDay()+6)%7)); return d;
  }
  function renderWeeksHTML(base){
    const start = getMonday(base);
    const baseDay = new Date(base); baseDay.setHours(0,0,0,0);
    let html = '';
    for(let n=0; n<8; n++){
      html += '<div class="wk">';
      for(let i=0;i<7;i++){
        const x = new Date(start); x.setDate(start.getDate()+n*7+i);
        const closed = x < baseDay || i>4;
        const sel = state.selectedDate && x.toDateString() === new Date(state.selectedDate).toDateString();
        html += `<div class="d ${closed?'closed':'open'} ${x.getTime()===baseDay.getTime()?'today':''} ${sel?'sel':''}" data-t="${x.getTime()}" data-action="${closed?'':'select-date'}">${x.getDate()}${x.getDate()==1&&n*7+i>0?`<span class="mlab">${MONTHS_SHORT[x.getMonth()]}</span>`:''}</div>`;
      }
      html += '</div>';
    }
    return html;
  }

  function serviceSummary(){
    if(state.selectedGroup==='wash' && state.washItems.length){
      return `${groupName('wash')} · ${state.washItems.length} услуг`;
    }
    if(state.selectedGroup) return groupName(state.selectedGroup);
    return 'Услуга не выбрана';
  }

  function renderSlots(){
    const tm = $('#tm-title');
    const slots = $('#slots');
    if(!tm || !slots) return;
    if(!state.selectedDate){
      tm.textContent = 'Выберите дату';
      slots.innerHTML = '<div style="grid-column:1/-1;color:var(--muted);font-size:var(--t-sec)">Выберите день в календаре</div>';
      return;
    }
    const d = state.selectedDate;
    tm.textContent = `Время · ${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
    const free = deterministicFreeSlots(d);
    const base = getBaseDate();
    base.setHours(0,0,0,0);
    let html = '';
    for(let mins=9*60; mins<18*60; mins+=30){
      const time = String(Math.floor(mins/60)).padStart(2,'0')+':'+(mins%60?'30':'00');
      const isFree = free.includes(time) && isSlotAllowed(d, time, base);
      const sel = state.selectedTime === time;
      html += `<div class="slot ${sel?'sel':isFree?'':'busy'}" data-action="${isFree?'select-time':''}">${time}</div>`;
    }
    slots.innerHTML = html;
  }

  function deterministicFreeSlots(date){
    const seed = date.getDate()*7 + date.getMonth()*3 + date.getFullYear()%10;
    const busy = new Set();
    for(let i=0;i<6;i++) busy.add((seed*3 + i*5) % 18);
    const free = [];
    for(let i=0;i<18;i++){
      if(!busy.has(i)){
        const h = Math.floor(i/2)+9, m = i%2 ? '30':'00';
        free.push(String(h).padStart(2,'0')+':'+m);
      }
    }
    if(free.length===0) free.push('09:00');
    return free;
  }
  function isSlotAllowed(date, time, base){
    const [h,m] = time.split(':').map(Number);
    const slotDate = new Date(date); slotDate.setHours(h,m,0,0);
    const min = new Date(base); min.setHours(min.getHours()+2);
    return slotDate >= min;
  }

  function fitCalZone(){
    const zone = $('.calzone');
    const stick = $('.stick');
    const row = $('.wk');
    if(!zone || !stick || !row) return;
    const rowH = row.offsetHeight || 70;
    const zh = stick.offsetHeight + rowH*2 + Math.round(rowH*0.62) + 16;
    zone.style.setProperty('--zh', zh+'px');
  }
  function updateCalHead(){
    const sc = $('#calscroll');
    const hd = $('#calhead');
    if(!sc || !hd) return;
    const weeks = $$('.wk');
    if(!weeks.length) return;
    const stick = $('.stick');
    const top = sc.scrollTop + stick.offsetHeight;
    const bot = sc.scrollTop + sc.clientHeight - 10;
    let a=null,b=null;
    weeks.forEach((r,i)=>{
      const t = r.offsetTop + 20;
      const h = t + 50;
      if(h > top + 10 && t < bot - 10){
        if(a === null) a = i;
        b = i;
      }
    });
    if(a === null){ a = 0; b = Math.min(weeks.length-1, 3); }
    const start = getMonday(getBaseDate());
    const s = new Date(start); s.setDate(start.getDate()+a*7);
    const e = new Date(start); e.setDate(start.getDate()+b*7+6);
    if(s.getMonth()===e.getMonth()) hd.textContent = `${cap(MONTHS_NOM[s.getMonth()])} ${s.getFullYear()}`;
    else if(s.getFullYear()===e.getFullYear()) hd.textContent = `${cap(MONTHS_NOM[s.getMonth()])} – ${MONTHS_NOM[e.getMonth()]} ${e.getFullYear()}`;
    else hd.textContent = `${cap(MONTHS_NOM[s.getMonth()])} ${s.getFullYear()} – ${MONTHS_NOM[e.getMonth()]} ${e.getFullYear()}`;
  }

  function renderStep3(){
    return `<section class="screen" data-screen="step3">
      <button class="back" data-action="back" data-back="step2">← Назад</button>
      <div class="crumb">Главная › Онлайн-запись</div>
      <h2>Онлайн-запись</h2>
      <ol class="steps"><li class="done"></li><li class="done"></li><li class="cur"></li><li></li></ol>
      <p class="stepline">Шаг 3 из 4 · <b>Контакты</b></p>
      <p class="legend-req"><span class="req">*</span> — обязательное поле. Аккаунт не нужен.</p>
      <div class="field">
        <label class="l">Телефон <span class="req">*</span></label>
        <div class="phone">
          <button type="button" class="cc" id="cc-btn" data-action="cc-toggle"><span class="flag">${flagOf(state.phoneCountryCode)}</span>${state.phoneCountryCode}<svg class="icon chev" style="width:14px;height:14px"><use href="#i-down"/></svg></button>
          <input class="input" id="phone-digits" type="tel" inputmode="tel" autocomplete="tel-national" data-field="phoneDigits" placeholder="5557 6777" value="${escapeHtml(state.phoneDigits)}">
        </div>
        <div id="cc-dropdown"></div>
      </div>
      <div class="field">
        <label class="l">E-mail <span class="req">*</span></label>
        <input class="input" id="email-input" type="email" autocomplete="email" data-field="email" placeholder="name@example.com" value="${escapeHtml(state.email)}" ${state.emailSkipped?'disabled':''}>
        <label class="cb"><input type="checkbox" id="email-skip" data-field="emailSkipped" ${state.emailSkipped?'checked':''}><span class="box ${state.emailSkipped?'on':''}"></span><span>Продолжить без e-mail</span></label>
        <p class="small">Тогда подтверждение и связь — только по телефону.</p>
      </div>
      <div class="field">
        <label class="l">Номер машины <span class="req">*</span></label>
        <input class="input" id="plate-input" type="text" autocomplete="off" data-field="plate" placeholder="123 ABC" value="${escapeHtml(state.plate)}">
        <label class="cb"><input type="checkbox" id="plate-skip" data-field="plateSkipped" ${state.plateSkipped?'checked':''}><span class="box ${state.plateSkipped?'on':''}"></span><span>Без номера</span> <button type="button" class="i-btn" id="plate-info" data-action="plate-info" style="width:24px;height:24px;font-size:12px">i</button></label>
      </div>
      <div class="field">
        <label class="l">Как к вам обращаться? <span class="opt">необязательно</span></label>
        <input class="input" id="client-name" type="text" autocomplete="given-name" data-field="clientName" placeholder="Имя" value="${escapeHtml(state.clientName)}">
      </div>
      <div class="sum">
        <div><span>Услуга</span><b>${serviceSummary()}</b></div>
        <div><span>Когда</span><b>${formatDateShort(state.selectedDate)} · ${state.selectedTime||''}</b></div>
      </div>
      <button class="button primary" data-action="step3-next">Подтвердить запись</button>
    </section>`;
  }

  function countryDropdownHtml(selectedCode){
    const rows = COUNTRIES_PHONE.map(c=>phoneCountryRowHtml(c)).join('');
    return `<div class="dd">
      <div class="s"><svg class="icon"><use href="#i-search"/></svg><input id="cc-search" type="text" placeholder="Поиск страны или кода..." data-cc-search></div>
      <div class="list" id="cc-list">${rows}</div>
    </div>`;
  }
  function phoneCountryRowHtml(c){
    return `<button type="button" class="r ${state.phoneCountryCode===c[3]?'on':''}" data-action="country-select" data-code="${c[3]}"><span class="flag">${c[0]}</span>${c[1]}<span class="c">${c[3]}</span></button>`;
  }
  function flagOf(code){
    const c = COUNTRIES_PHONE.find(x=>x[3]===code);
    return c ? c[0] : '🇪🇪';
  }

  function renderStep4(){
    const vs = getVoteScreenForCurrent();
    const hasEmail = !state.emailSkipped && state.email;
    return `<section class="screen" data-screen="step4">
      <button class="back" data-action="back" data-back="step3">← Назад</button>
      <div class="crumb">Главная › Онлайн-запись</div>
      <h2>Онлайн-запись</h2>
      <ol class="steps"><li class="done"></li><li class="done"></li><li class="done"></li><li class="cur"></li></ol>
      <p class="stepline">Шаг 4 из 4 · <b>Готово</b></p>
      ${renderVoteBar(vs)}
      <div class="ok"><span class="circle"><svg class="icon"><use href="#i-check"/></svg></span><h3>Запись подтверждена</h3></div>
      <div class="sum">
        <div><span>Номер записи</span><b>${state.bookingNo || generateBookingNo()}</b></div>
        <div><span>Услуга</span><b>${serviceSummary()}</b></div>
        <div><span>Когда</span><b>${formatDateLong(state.selectedDate)} · ${state.selectedTime||''}</b></div>
        <div><span>Адрес</span><b>Vaari 4 (Pärnu mnt 158G)</b></div>
      </div>
      <div class="sent ${hasEmail?'':'ph'}"><svg class="icon"><use href="#${hasEmail?'i-mail':'i-check'}"/></svg><span>${hasEmail ? `Подтверждение отправлено на e-mail <b>${escapeHtml(state.email)}</b>` : 'Подтверждение придёт по телефону'}</span></div>
      <div class="ask"><p>Нужен счёт на фирму или хотите сэкономить время в сервисе?</p><button class="button primary" data-action="to-step5">Указать данные для счёта и автомобиля</button></div>
      <div id="variant-block">${renderUpsellStep4(currentVariantId(vs))}</div>
      <div class="row2">
        <button class="button" data-action="cal-btn"><svg class="icon"><use href="#i-cal"/></svg>В календарь</button>
        <button class="button" data-action="map-btn"><svg class="icon"><use href="#i-pin"/></svg>Как добраться</button>
      </div>
      <button class="button" data-action="reschedule"><svg class="icon"><use href="#i-swap"/></svg>Перенести или отменить ›</button>
      <p class="under">или позвоните <b>+372&nbsp;5557&nbsp;6777</b></p>
      <button class="link" data-action="price-list-link"><svg class="icon"><use href="#i-list"/></svg>Посмотреть прайс-лист ›</button>
      ${state.extras.length ? `<p style="margin:0;color:var(--muted)">Добавлено: ${state.extras.map(id=>serviceName(id)).join(', ')}</p>` : ''}
      <button class="button secondary" data-action="book-again">Записать ещё одну машину</button>
      <button class="button secondary" data-action="done-btn" style="min-height:48px;background:transparent;border:none;color:var(--muted)">Готово</button>
      ${renderVotePanel(vs)}
    </section>`;
  }

  function renderUpsellStep4(variant){
    switch(variant){
      case 'A': return `<div class="up-card"><b>Пока машина у нас</b><p>Если оставите её подольше, можно заодно помыть или почистить салон.</p><button class="lnk" data-action="upsell-link">Дополнительные услуги ›</button></div>`;
      case 'B': return `<div class="chip"><span class="pl">+</span><span>Мойка или химчистка,<br>пока машина у нас</span><button class="lnk" data-action="upsell-link">Посмотреть ›</button></div>`;
      case 'C': return `<div class="up-card"><b>Пока машина у нас</b><p>Если машина может побыть у нас подольше, успеем ещё и это (время подтвердит мастер)</p><button class="lnk" data-action="upsell-link">Дополнительные услуги ›</button></div>`;
      case 'D': return `<div class="up-card"><b>Пока машина у нас — помыть её или убрать салон?</b><p></p><button class="lnk" data-action="upsell-link">Посмотреть варианты ›</button></div>`;
      default: return '';
    }
  }

  function renderStep5(){
    const vs = getVoteScreenForCurrent();
    const isForeign = state.invoiceType==='firm' && state.foreignFirm;
    const showField = (name)=>{
      const g = state.selectedGroup;
      if(name==='year') return (g && g!=='wash') ? `<div class="field"><label class="l">Год выпуска</label><input class="input" id="car-year" type="text" inputmode="numeric" data-field="carYear" value="${escapeHtml(state.carYear)}"></div>` : '';
      if(name==='radius') return (g==='tire') ? `<div class="field"><label class="l">Радиус колёс</label><select class="input" id="car-radius" data-field="carRadius"><option>Не указано</option>${['R13','R14','R15','R16','R17','R18','R19','R20','R21','R22'].map(r=>`<option ${state.carRadius===r?'selected':''}>${r}</option>`).join('')}</select></div>` : '';
      if(name==='vin') return (g==='insurance'||g==='body') ? `<div class="field"><label class="l">VIN</label><input class="input" id="car-vin" type="text" maxlength="17" data-field="carVIN" value="${escapeHtml(state.carVIN)}"></div>` : '';
      return '';
    };
    return `<section class="screen" data-screen="step5">
      <button class="back" data-action="back" data-back="step4">← Назад</button>
      <div class="crumb">Главная › Онлайн-запись</div>
      <h2>Данные для счёта и автомобиля</h2>
      ${renderVoteBar(vs)}
      <div class="top"><span class="optbadge">НЕОБЯЗАТЕЛЬНО</span><p class="note">Запись ${state.bookingNo || generateBookingNo()} уже создана. Заполните, что знаете — остальное уточним в сервисе.</p></div>
      <div class="blk">
        <h3>Счёт выставить на</h3>
        <div class="toggle" id="invoice-toggle">
          <button type="button" class="${state.invoiceType==='person'?'on':''}" data-action="invoice-person">Частное лицо</button>
          <button type="button" class="${state.invoiceType==='firm'?'on':''}" data-action="invoice-firm">Фирма</button>
        </div>
      </div>
      <div id="firm-fields" style="${state.invoiceType==='firm'?'':'display:none'}">
        <label class="cb"><input type="checkbox" id="foreign-check" data-field="foreignFirm" ${state.foreignFirm?'checked':''}><span class="box ${state.foreignFirm?'on':''}"></span><span>Иностранная фирма</span></label>
        <div class="field country" id="country-wrap" style="${isForeign?'':'display:none'}">
          <label class="l">Страна фирмы <span class="req">*</span></label>
          <div class="combo">
            <div class="srch"><svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="firm-country-search" type="text" placeholder="Поиск страны или кода…" autocomplete="billing country-name" data-firm-country-search value="${escapeHtml(state.firmCountry)}"></div>
            <div class="list" id="firm-country-list">${firmCountryListHTML('')}</div>
          </div>
        </div>
        <div class="field"><label class="l">Название фирмы <span class="req">*</span></label><input class="input" id="firm-name" type="text" autocomplete="billing organization" data-field="firmName" placeholder="${state.foreignFirm?'':'… OÜ'}" value="${escapeHtml(state.firmName)}"></div>
        <div class="field"><label class="l">Рег. код <span class="req">*</span></label><input class="input" id="reg-code" type="text" inputmode="numeric" autocomplete="off" data-field="regCode" value="${escapeHtml(state.regCode)}"></div>
        <div class="field"><label class="l">${state.foreignFirm?'VAT-номер':'НДС-номер (KMKR)'} <span class="opt">необязательно</span></label><input class="input" id="vat" type="text" autocomplete="off" data-field="vat" value="${escapeHtml(state.vat)}"></div>
        <div class="addr">
          <div class="field"><label class="l">Город <span class="req">*</span></label><input class="input" id="city" type="text" autocomplete="billing address-level2" data-field="city" value="${escapeHtml(state.city)}"></div>
          <div class="field"><label class="l">Индекс <span class="req">*</span></label><input class="input" id="zip" type="text" inputmode="${state.foreignFirm?'text':'numeric'}" maxlength="${state.foreignFirm?10:5}" autocomplete="billing postal-code" data-field="zip" value="${escapeHtml(state.zip)}"></div>
        </div>
        <div class="field"><label class="l">Улица, дом, квартира <span class="req">*</span></label><input class="input" id="street" type="text" autocomplete="billing street-address" data-field="street" value="${escapeHtml(state.street)}"></div>
        <div class="field"><label class="l">E-mail бухгалтерии <span class="opt">необязательно</span></label><input class="input" id="acc-email" type="email" inputmode="email" autocomplete="work email" data-field="accountingEmail" placeholder="arved@firma.ee" value="${escapeHtml(state.accountingEmail)}"><p style="margin:6px 0 0;font-size:14px;color:var(--muted)">Сюда отправим счёт.</p></div>
      </div>
      <div class="car">
        <h3>Автомобиль</h3>
        <div class="sum"><div><span>Номер машины</span><b>${state.plateSkipped ? 'Без номера' : state.plate || '—'}</b></div></div>
        <p style="margin:6px 0 10px;color:var(--muted)">Номера достаточно. Подробности — по желанию.</p>
        <button type="button" class="rowlink" data-action="car-expander">Здесь можно указать подробные данные автомобиля ›</button>
        <div id="car-details" style="display:none">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
            <div class="field"><label class="l">Марка</label><input class="input" id="car-make" type="text" autocomplete="off" data-field="carMake" value="${escapeHtml(state.carMake)}"></div>
            <div class="field"><label class="l">Модель</label><input class="input" id="car-model" type="text" autocomplete="off" data-field="carModel" value="${escapeHtml(state.carModel)}"></div>
          </div>
          ${showField('year')}
          ${showField('radius')}
          ${showField('vin')}
        </div>
      </div>
      <div id="variant-block">${renderStep5SaveButton()}</div>
      <button class="button secondary" data-action="step5-skip">Назад, заполню позже</button>
      ${renderVotePanel(vs)}
    </section>`;
  }

  function renderStep5SaveButton(){
    const label = currentVariantId(getVoteScreenForCurrent())==='B'?'Сохранить данные':'Сохранить';
    return `<button class="button primary" id="save-step5" data-action="save-step5">${label}</button>`;
  }

  function firmCountryListHTML(q){
    const query = (q || '').trim().toLowerCase();
    let list = query ? FOREIGN_COUNTRIES.filter(c=>c[1].toLowerCase().includes(query) || c[2].toLowerCase() === query) : FOREIGN_COUNTRIES;
    if(!query){
      const top = list.slice(0,7);
      const rest = list.slice(7);
      return top.map(c=>firmCountryRow(c)).join('') + '<div class="sep">Все страны</div>' + rest.map(c=>firmCountryRow(c)).join('');
    }
    return list.map(c=>firmCountryRow(c, query)).join('') || '<div class="sep">Ничего не найдено</div>';
  }
  function firmCountryRow(c, hl){
    const name = hl ? c[1].replace(new RegExp('('+hl.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','i'),'<mark>$1</mark>') : c[1];
    return `<button type="button" class="r ${state.firmCountry===c[1]?'on':''}" data-action="firm-country-select" data-country="${c[1]}" data-code="${c[2]}"><span class="flag">${c[0]}</span><span>${name}</span><span class="c">${c[2]}</span></button>`;
  }

  function renderThanks(){
    const vs = getVoteScreenForCurrent();
    return `<section class="screen" data-screen="thanks">
      <button class="back" data-action="back" data-back="step5">← Назад</button>
      <div class="crumb">Главная › Онлайн-запись</div>
      ${renderVoteBar(vs)}
      <div class="ok"><span class="circle"><svg class="icon"><use href="#i-check"/></svg></span><h3>Спасибо, данные сохранены</h3></div>
      <div class="sum">
        <div><span>Запись</span><b>${state.bookingNo} · ${formatDateLong(state.selectedDate)} · ${state.selectedTime||''}</b></div>
        <div><span>Счёт на</span><b>${invoiceSummary()}</b></div>
        <div><span>Автомобиль</span><b>${state.plateSkipped?'Без номера':state.plate||'—'}</b></div>
      </div>
      ${state.extras.length ? `<p style="margin:0;color:var(--muted)">Добавлено: ${state.extras.map(id=>serviceName(id)).join(', ')}</p>` : ''}
      <div id="variant-block">${renderThanksUpsell(currentVariantId(vs))}</div>
      <button class="button secondary" data-action="book-again">Записать ещё одну машину</button>
      <button class="button secondary" data-action="done-btn" style="min-height:48px;background:transparent;border:none;color:var(--muted)">Готово</button>
      ${renderVotePanel(vs)}
    </section>`;
  }

  function invoiceSummary(){
    if(state.invoiceType==='person') return 'Частное лицо';
    return `Фирма · ${state.firmName||'—'}`;
  }

  function renderThanksUpsell(variant){
    const dirs = S.thanks_directions || [];
    const dirRows = dirs.map(d=>{
      const icon = d.id==='dir_body'?'i-car':d.id==='dir_wash'?'i-wash':d.id==='dir_dry'?'i-list':'i-check';
      return `<button type="button" class="drow ${d.id==='dir_wash'?'main':''}" data-action="thanks-dir" data-dir="${d.id}">
        <svg class="icon"><use href="#${icon}"/></svg>
        <span class="t">${d.title}<small>${d.hint||''}</small></span>
        <svg class="icon chev"><use href="#i-right"/></svg>
      </button>`;
    }).join('');
    switch(variant){
      case 'A':
        return `<div class="dir"><p class="q">Можете оставить машину подольше?</p><p class="qs">Тогда успеем сделать ещё что-нибудь. Выберите, что интересно:</p>${dirRows}<p class="qs2">Время подтвердит мастер.</p></div>`;
      case 'B':
        return `<div class="hero-up"><p class="t">Успеем сделать ещё</p><p>Если машина может побыть у нас подольше, успеем ещё и это (время подтвердит мастер)</p><div class="tiles">${dirs.map(d=>{
          const icon = d.id==='dir_body'?'i-car':d.id==='dir_wash'?'i-wash':d.id==='dir_dry'?'i-list':'i-check';
          return `<button type="button" class="tile" data-action="thanks-dir" data-dir="${d.id}"><svg class="icon"><use href="#${icon}"/></svg><b>${d.title}</b><small>${d.hint||''}</small></button>`;
        }).join('')}</div></div>`;
      case 'C':
        return `<div class="dir"><p class="q">Пока машина у нас</p><p class="qs">Если не спешите её забирать, можно сделать ещё что-то. Например, заодно помыть:</p>${dirRows}<p class="qs2">Можно и потом, при визите. Время подтвердит мастер.</p></div>`;
      case 'D':
        return `<div class="dir"><p class="q">Успеем сделать ещё</p><p class="qs">Если машина может побыть у нас подольше, успеем ещё и это (время подтвердит мастер)</p>${dirRows}</div>`;
      default: return '';
    }
  }

  function renderEnd(){
    const votesSummary = VOTE_SCREENS.map(vs=>{
      const selected = state.votes[vs.id]||[];
      const missing = selected.length===0;
      return `<div class="sum" style="margin-top:0">
        <div><span>${vs.title}</span><b>${selected.length?selected.join(', '):'<span style="color:var(--amber)">не отмечено</span>'}</b></div>
        ${missing?`<button type="button" class="link" data-go="${vs.screen}">Перейти к экрану ›</button>`:''}
      </div>`;
    }).join('');
    return `<section class="screen" data-screen="end">
      <button class="back" data-action="back" data-back="${escapeHtml(state.lastFormScreen || 'start')}">← Назад</button>
      <div class="crumb">Главная › Онлайн-запись</div>
      <h2>Ответы</h2>
      <p style="margin:0;font-size:var(--t-sec);color:var(--muted)">Спасибо! Вы прошли запись.</p>
      <h3>Ваши отметки</h3>
      ${votesSummary}
      <div class="field">
        <label class="l" for="general-comment">Общий комментарий (необязательно)</label>
        <textarea class="vp-comment" id="general-comment" placeholder="Что понравилось или было непонятно"></textarea>
      </div>
      <button class="button primary" data-action="send-votes">Отправить ответы</button>
      <div id="send-status" style="margin:0;color:var(--muted)"></div>
    </section>`;
  }

  function formatDateShort(d){
    if(!d) return 'дата';
    return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')}`;
  }
  function formatDateLong(d){
    if(!d) return 'дата';
    return `${d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  }

  function openSheet(mode='add'){
    clearTimers();
    closeOverlays();
    sheetSelection = new Set(state.extras || []);
    const ov = $('#overlays');
    ov.innerHTML = `<div class="scrim" data-action="close-sheet"></div>
      <section class="sheet" role="dialog" aria-modal="true" aria-label="Дополнительные услуги">
        <div class="grab"></div>
        <h3>${mode==='view' ? 'Прайс-лист' : 'Что ещё успеем сделать'}</h3>
        <p class="sub">${mode==='view' ? 'Цены с НДС. Окончательную стоимость и время подтвердит мастер.' : 'Если машина может побыть у нас подольше. Время подтвердит мастер. Цены с НДС.'}</p>
        <div class="lst" id="sheet-list">${buildSheetListHTML(mode)}</div>
        <div class="sheet-footer">
          <button class="button primary" id="sheet-cta" data-action="sheet-cta" data-mode="${mode}" ${mode==='view'?'':'disabled'}>${mode==='view'?'Понятно':mode==='add'?'Добавить к записи (0)':'Выбрать (0)'}</button>
          <button class="back" data-action="close-sheet">← Назад к данным</button>
        </div>
      </section>`;
    document.body.style.overflow = 'hidden';
    if(mode!=='view'){
      const cta = $('#sheet-cta');
      cta.classList.add('dim');
    }
  }

  function buildSheetListHTML(mode){
    const sections = S.sheet_sections || [];
    let html = '';
    sections.forEach(sec=>{
      html += `<div class="g">${sec.title}</div>`;
      (sec.items||[]).forEach(id=>{
        const svc = getService(id);
        if(!svc) return;
        const selected = sheetSelection.has(id);
        const priceHtml = svc.price ? `<span class="price">${svc.price}${svc.suv?`<small>${svc.suv}</small>`:''}${svc.promo?`<span class="promo">${svc.promo.split(' / ')[0]}</span>`:''}</span>` : '';
        const popular = svc.popular ? `<span class="popular-chip">Чаще всего выбирают</span>` : '';
        html += `<div class="it" data-action="sheet-toggle" data-id="${id}">
          ${mode!=='view'?'<span class="box '+(selected?'on':'')+'"></span>':'<span></span>'}
          <div class="title">${popular}${svc.name}${svc.sub?`<div class="small-line">${svc.sub}</div>`:''}</div>
          ${priceHtml}
          <button type="button" class="i-btn" data-action="info" data-service="${id}">i</button>
        </div>`;
      });
    });
    if(mode==='view'){
      const tire = getService('tire');
      if(tire && tire.price_table){
        html += `<div class="g">Шиномонтаж — сезонная акция</div>`;
        html += `<div class="it"><div class="title">${tire.name}</div><button type="button" class="i-btn" data-action="info" data-service="tire">i</button></div>`;
        html += formatPriceBlock(tire);
        if(tire.price_table.tpms_i) html += `<p class="ptab-note" style="margin-top:8px"><b>Датчики давления (TPMS):</b> ${tire.price_table.tpms_i}</p>`;
      }
    }
    return html;
  }

  function updateSheetCTA(){
    const cta = $('#sheet-cta');
    if(!cta) return;
    const mode = cta.dataset.mode;
    if(mode==='view') return;
    const n = sheetSelection.size;
    cta.textContent = `${mode==='add'?'Добавить к записи':'Выбрать'} (${n})`;
    cta.classList.toggle('dim', n===0);
    cta.disabled = n===0;
  }

  function handleSheetCTA(mode){
    if(mode==='view'){
      closeOverlays();
      return;
    }
    if(!sheetSelection.size) return;
    state.extras = Array.from(sheetSelection);
    saveForm();
    closeOverlays();
    document.body.style.overflow = '';
    showToast('Добавлено к записи — мастер подтвердит время');
    if(mode==='select') renderScreen(state.screen);
  }

  function openInfo(serviceId){
    clearTimers();
    closeOverlays();
    const svc = getService(serviceId);
    if(!svc) return;
    const desc = svc.desc || null;
    const priceBlock = (svc.price || svc.price_table) ? formatPriceBlock(svc) : '';
    let inc='', exc='', note='';
    if(desc){
      inc = desc.includes && desc.includes.length ? `<div class="inc"><h4>Что входит</h4>${desc.includes.map(x=>`<div class="inc-item"><span class="check">✓</span><span>${x}</span></div>`).join('')}</div>` : '';
      exc = desc.excludes && desc.excludes.length ? `<div class="exc"><h4>Что не входит</h4>${desc.excludes.map(x=>`<div class="exc-item"><span class="cross">✕</span><span>${x}</span></div>`).join('')}</div>` : '';
      note = desc.note ? `<p class="after">${desc.note}</p>` : '';
    }
    const ov = $('#overlays');
    ov.innerHTML = `<div class="scrim" data-action="close-info"></div>
      <section class="sheet info-sheet" role="dialog" aria-modal="true" aria-label="${svc.name}">
        <div class="grab"></div>
        <div class="sheet-body">
          <h3>${svc.name}</h3>
          <div class="badge-row"><span class="badge">Черновик описания</span></div>
          ${svc.sub?`<p class="sub">${svc.sub}</p>`:''}
          ${priceBlock}
          ${desc? inc+exc+note : '<p class="after">Описание готовится</p>'}
          ${serviceId==='tire' && svc.price_table && svc.price_table.tpms_i ? `<div class="tip">${svc.price_table.tpms_i}</div>`:''}
          ${serviceId==='body' ? `<button class="button primary" data-action="book-body">Записаться на осмотр</button>`:''}
        </div>
        <div class="sheet-footer"><button class="button secondary" data-action="close-info">Понятно</button></div>
      </section>`;
    document.body.style.overflow = 'hidden';
  }

  function formatSuv(suv){
    if(typeof suv !== 'string') return suv;
    return suv.replace(/^SUV\s+/i,'');
  }
  function formatPromo(promo){
    if(typeof promo !== 'string') return promo;
    return promo.replace(/^акция\s+/i,'');
  }
  function formatPriceBlock(svc){
    if(svc.price_table){
      const pt = svc.price_table;
      const list = arr => (arr||[]).map(x=>`<li>${x}</li>`).join('');
      return `<div class="ptab"><p class="ptab-h">Сезонная акция</p><ul>${list(pt.promo)}</ul><p class="ptab-h">Доплаты</p><ul>${list(pt.promo_extras)}</ul>${pt.regular_title ? `<p class="ptab-h">${pt.regular_title}</p><ul>${list(pt.regular)}</ul>` : ''}${pt.note ? `<p class="ptab-note">${pt.note}</p>` : ''}</div>`;
    }
    let rows = '';
    if(svc.price) rows += `<div><span>${svc.suv ? 'Легковая' : 'Цена'}</span><b>${svc.price}</b></div>`;
    if(svc.suv) rows += `<div><span>SUV</span><b>${formatSuv(svc.suv)}</b></div>`;
    if(svc.promo) rows += `<div><span>Акция</span><b>${formatPromo(svc.promo)}</b></div>`;
    (svc.extras||[]).forEach(ex=> rows += `<div><span>Доплата</span><b>${ex}</b></div>`);
    return rows ? `<div class="sum">${rows}</div>` : '';
  }

  function captureStep3(){
    state.phoneDigits = $('#phone-digits').value.trim();
    state.email = state.emailSkipped ? '' : $('#email-input').value.trim();
    state.plate = state.plateSkipped ? '' : $('#plate-input').value.trim();
    state.clientName = $('#client-name').value.trim();
  }
  function captureStep5(){
    const val = sel => { const el=$(sel); return el ? el.value.trim() : ''; };
    state.firmName = val('#firm-name');
    state.regCode = val('#reg-code');
    state.vat = val('#vat');
    state.city = val('#city');
    state.zip = val('#zip');
    state.street = val('#street');
    state.accountingEmail = val('#acc-email');
    state.carMake = val('#car-make');
    state.carModel = val('#car-model');
    state.carYear = val('#car-year');
    state.carRadius = val('#car-radius');
    state.carVIN = val('#car-vin');
    const fcs = $('#firm-country-search');
    if(fcs) state.firmCountry = fcs.value.trim();
  }

  function afterRender(screen){
    if(screen==='step2'){
      renderSlots();
      fitCalZone();
      updateCalHead();
      if(!document.documentElement.classList.contains('still')){
        const wk = $('#weeks');
        if(wk) requestAnimationFrame(()=>{ wk.classList.add('nudge'); wk.addEventListener('animationend', ()=>wk.classList.remove('nudge'), {once:true}); });
      }
    }
    if(screen==='step5'){
      const list = $('#firm-country-list');
      if(list) list.innerHTML = firmCountryListHTML('');
    }
    if(screen==='end'){
      const status = $('#send-status');
      if(status && state.submitted) status.textContent = 'Вы уже отправляли, но можете отправить ещё раз.';
    }
  }

  function handleStart(){
    const name = $('#participant-name').value.trim();
    if(!name){
      const el = $('#participant-name');
      el.classList.add('invalid');
      el.focus();
      return;
    }
    state.name = name;
    state.bookingNo = generateBookingNo();
    saveForm();
    go('step1');
  }

  function handleBookAgain(){
    state.previousBookings.push({plate: state.plate || 'Без номера', date: state.selectedDate, time: state.selectedTime});
    state.selectedGroup=null;
    state.washItems=[];
    state.selectedDate=null;
    state.selectedTime=null;
    state.plate='';
    state.plateSkipped=false;
    state.extras=[];
    state.bookingNo='';
    saveForm();
    go('step1');
  }

  function sendVotes(){
    try{
      const general = $('#general-comment') ? $('#general-comment').value.trim() : '';
      const payload = {
        participant: state.name,
        submitted_at: new Date().toISOString(),
        client_id: state.clientId,
        user_agent: navigator.userAgent,
        votes: VOTE_SCREENS.map(vs=>({
          screen_id: vs.id,
          screen: vs.title,
          variants: (state.votes[vs.id]||[]).slice().sort(),
          variant_labels: (state.votes[vs.id]||[]).slice().sort().map(v=>{
            const variant = vs.variants.find(x=>x.id===v);
            return variant ? variant.label : v;
          }),
          comment: state.votesComments[vs.id]||''
        })),
        general_comment: general
      };
      localStorage.setItem(VOTE_KEY, JSON.stringify(state.votes));
      localStorage.setItem(DONE_KEY, '1');
      state.submitted = true;
      const status = $('#send-status');
      if(!PROTO_CONFIG.VOTE_ENDPOINT){
        status.textContent = 'Ответ сохранён (в этом браузере)';
        return;
      }
      status.textContent = 'Отправка...';
      fetch(PROTO_CONFIG.VOTE_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type':'text/plain;charset=utf-8'},
        mode: 'no-cors',
        body: JSON.stringify(payload)
      }).then(()=>{
        status.textContent = 'Ответ отправлен. Спасибо!';
      }).catch(()=>{
        status.innerHTML = 'Не удалось отправить, ответ сохранён в этом браузере <button class="button secondary" data-action="retry-send">Попробовать ещё раз</button>';
      });
    }catch(e){ console.error(e); }
  }

  document.addEventListener('click', e => {
    try{
      const proto = e.target.closest('#proto-answers');
      if(proto){
        state.lastFormScreen = state.screen === 'end' ? (state.lastFormScreen || 'start') : state.screen;
        go('end');
        return;
      }
      const vb = e.target.closest('.vote-switch button');
      if(vb){
        const vs = getVoteScreenForCurrent();
        if(vs){
          state.currentVariant[vs.id] = vb.dataset.variant;
          saveForm();
          refreshVariantBlock(vs);
        }
        return;
      }
      const act = e.target.closest('[data-action]');
      if(!act) return;
      const action = act.dataset.action;
      if(action === 'back'){ backAction(act.dataset.back); return; }
      if(action === 'start-btn'){ handleStart(); return; }
      if(action === 'step1-next'){ if(isAnyServiceSelected()) proceedTo('step2'); return; }
      if(action === 'step2-next'){
        if(!state.selectedDate || !state.selectedTime){
          const slots = $('#slots');
          if(slots) slots.scrollIntoView({behavior:'smooth', block:'center'});
          return;
        }
        proceedTo('step3'); return;
      }
      if(action === 'step3-next'){
        captureStep3();
        if(!state.phoneDigits){ $('#phone-digits').classList.add('invalid'); $('#phone-digits').focus(); return; }
        if(!state.emailSkipped && !state.email){ $('#email-input').classList.add('invalid'); $('#email-input').focus(); return; }
        if(!state.plateSkipped && !state.plate){ $('#plate-input').classList.add('invalid'); $('#plate-input').focus(); return; }
        state.bookingNo = state.bookingNo || generateBookingNo();
        saveForm();
        proceedTo('step4'); return;
      }
      if(action === 'save-step5'){
        captureStep5();
        if(state.invoiceType === 'firm'){
          const req = ['#firm-name','#reg-code','#city','#zip','#street'];
          if(state.foreignFirm) req.unshift('#firm-country-search');
          req.forEach(sel=>{
            const el = $(sel);
            if(el){ el.classList.toggle('invalid', !el.value.trim()); el.setAttribute('aria-invalid', String(!el.value.trim())); }
          });
          const empty = req.map(sel=>$(sel)).filter(el=>el && !el.value.trim());
          if(empty.length){
            empty[0].scrollIntoView({behavior:'smooth', block:'center'});
            empty[0].focus({preventScroll:true});
            return;
          }
        }
        saveForm();
        proceedTo('thanks'); return;
      }
      if(action === 'step5-skip'){ proceedTo('step4'); return; }
      if(action === 'to-step5'){ proceedTo('step5'); return; }
      if(action === 'book-again'){ handleBookAgain(); return; }
      if(action === 'done-btn'){ proceedTo('end'); return; }
      if(action === 'cal-btn'){ showToast('Добавим в календарь в боевой версии'); return; }
      if(action === 'map-btn'){ showToast('Откроем карту в боевой версии'); return; }
      if(action === 'reschedule'){ showToast('Функция переноса будет доступна в боевой версии'); return; }
      if(action === 'upsell-link'){ openSheet('add'); return; }
      if(action === 'price-list-link'){ openSheet('view'); return; }
      if(action === 'sheet-toggle'){
        const id = act.dataset.id;
        if(id && !act.classList.contains('dis')){
          if(sheetSelection.has(id)) sheetSelection.delete(id); else sheetSelection.add(id);
          const box = act.querySelector('.box');
          if(box) box.classList.toggle('on', sheetSelection.has(id));
          updateSheetCTA();
        }
        return;
      }
      if(action === 'sheet-cta'){ handleSheetCTA(act.dataset.mode); return; }
      if(action === 'close-sheet' || action === 'close-info'){ closeOverlays(); document.body.style.overflow=''; return; }
      if(action === 'info'){
        if(act.dataset.service) openInfo(act.dataset.service);
        else if(act.dataset.group) openInfo(firstServiceInGroup(act.dataset.group));
        return;
      }
      if(action === 'full-list'){ openSheet('select'); return; }
      if(action === 'toggle-group'){
        const gid = act.dataset.group;
        if(gid === 'wash'){
          if(state.selectedGroup === 'wash') state.selectedGroup = null;
          else state.selectedGroup = 'wash';
        } else {
          state.selectedGroup = gid;
          state.washItems = [];
        }
        saveForm();
        const groups = $('#step1-groups');
        if(groups) groups.innerHTML = renderStep1Groups();
        const btn = $('#step1-next');
        if(btn){ btn.disabled = !isAnyServiceSelected(); btn.classList.toggle('dim', !isAnyServiceSelected()); }
        return;
      }
      if(action === 'toggle-wash-item'){
        const id = act.dataset.item;
        if(isIncompatible(id)) return;
        if(state.washItems.includes(id)) state.washItems = state.washItems.filter(x=>x!==id);
        else {
          const incompatible = S.incompatible || {};
          const toRemove = new Set();
          if(incompatible[id]) incompatible[id].forEach(b=>{ if(state.washItems.includes(b)) toRemove.add(b); });
          Object.keys(incompatible).forEach(key=>{
            if(key !== id && incompatible[key].includes(id) && state.washItems.includes(key)) toRemove.add(key);
          });
          state.washItems = state.washItems.filter(x=>!toRemove.has(x));
          state.washItems.push(id);
        }
        saveForm();
        const groups = $('#step1-groups');
        if(groups) groups.innerHTML = renderStep1Groups();
        const btn = $('#step1-next');
        if(btn){ btn.disabled = !isAnyServiceSelected(); btn.classList.toggle('dim', !isAnyServiceSelected()); }
        return;
      }
      if(action === 'select-date'){
        const t = Number(act.dataset.t);
        if(!isNaN(t)){
          state.selectedDate = new Date(t);
          state.selectedTime = null;
          $$('.d.sel').forEach(el=>el.classList.remove('sel'));
          act.classList.add('sel');
          renderSlots();
          saveForm();
        }
        return;
      }
      if(action === 'select-time'){
        const time = act.textContent.trim();
        state.selectedTime = time;
        $$('.slot.sel').forEach(el=>el.classList.remove('sel'));
        act.classList.add('sel');
        saveForm();
        return;
      }
      if(action === 'cc-toggle'){
        const dd = $('#cc-dropdown');
        if(dd.innerHTML){ dd.innerHTML = ''; return; }
        dd.innerHTML = countryDropdownHtml(state.phoneCountryCode);
        return;
      }
      if(action === 'country-select'){
        state.phoneCountryCode = act.dataset.code;
        saveForm();
        const btn = $('#cc-btn');
        if(btn) btn.innerHTML = `<span class="flag">${flagOf(state.phoneCountryCode)}</span>${state.phoneCountryCode}<svg class="icon chev" style="width:14px;height:14px"><use href="#i-down"/></svg>`;
        const dd = $('#cc-dropdown');
        if(dd) dd.innerHTML = '';
        return;
      }
      if(action === 'firm-country-select'){
        state.firmCountry = act.dataset.country;
        saveForm();
        const input = $('#firm-country-search');
        if(input){ input.value = state.firmCountry; input.classList.remove('invalid'); }
        const list = $('#firm-country-list');
        if(list) list.innerHTML = firmCountryListHTML(input ? input.value : '');
        return;
      }
      if(action === 'invoice-person'){
        state.invoiceType = 'person';
        saveForm();
        renderScreen('step5');
        return;
      }
      if(action === 'invoice-firm'){
        state.invoiceType = 'firm';
        saveForm();
        renderScreen('step5');
        return;
      }
      if(action === 'car-expander'){
        const el = $('#car-details');
        if(el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
        return;
      }
      if(action === 'thanks-dir'){
        const id = act.dataset.dir;
        if(id === 'dir_body'){
          openInfo('body');
        } else {
          const d = (S.thanks_directions||[]).find(x=>x.id===id);
          if(d && d.sheet){
            openSheet('add');
            delay(()=>{
              const sections = $$('#sheet-list .g');
              const target = sections.find(g=>g.textContent===d.sheet);
              if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
            }, 60);
          }
        }
        return;
      }
      if(action === 'book-body'){
        state.selectedGroup = 'body';
        state.washItems = [];
        saveForm();
        closeOverlays();
        document.body.style.overflow = '';
        go('step1', {replace:true});
        return;
      }
      if(action === 'plate-info'){
        const field = $('#plate-input').closest('.field');
        const tip = document.createElement('div');
        tip.className='tip';
        tip.textContent='Если у машины по какой-то причине нет номера, поставьте галочку — тогда номер можно не указывать.';
        field.appendChild(tip);
        act.classList.add('open');
        delay(()=>{ tip.remove(); act.classList.remove('open'); }, 3000);
        return;
      }
      if(action === 'send-votes'){ sendVotes(); return; }
      if(action === 'retry-send'){ sendVotes(); return; }
      if(act.dataset.go){ go(act.dataset.go); return; }
    }catch(err){ console.error(err); }
  });

  document.addEventListener('input', e => {
    try{
      const t = e.target;
      if(t.matches && t.matches('[data-field]') && !t.matches('[type=checkbox], [type=radio], select')){
        state[t.dataset.field] = t.value;
        saveForm();
      }
      if(t.matches && t.matches('[data-cc-search]')){
        const q = t.value.trim().toLowerCase();
        const listEl = $('#cc-list');
        if(listEl){
          const list = COUNTRIES_PHONE.filter(c=>c[1].toLowerCase().includes(q) || c[2].toLowerCase()===q || c[3].replace('+','')===q || c[3]===q);
          listEl.innerHTML = list.map(c=>phoneCountryRowHtml(c)).join('');
        }
      }
      if(t.matches && t.matches('[data-firm-country-search]')){
        const listEl = $('#firm-country-list');
        if(listEl) listEl.innerHTML = firmCountryListHTML(t.value);
      }
      if(t.matches && t.matches('[data-vote-comment]')){
        setVoteComment(t.dataset.voteComment, t.value);
      }
    }catch(err){ console.error(err); }
  });

  document.addEventListener('change', e => {
    try{
      const t = e.target;
      if(t.matches && t.matches('[data-field]')){
        state[t.dataset.field] = t.type === 'checkbox' ? t.checked : t.value;
        saveForm();
        const box = t.closest('.cb') ? t.closest('.cb').querySelector('.box') : null;
        if(box) box.classList.toggle('on', t.checked);
        if(t.dataset.field === 'emailSkipped'){
          const email = $('#email-input');
          if(email) email.disabled = state.emailSkipped;
        }
      }
      const vp = e.target.closest('.vp-option input[type=checkbox]');
      if(vp){
        const vs = getVoteScreenForCurrent();
        if(vs){
          const arr = state.votes[vs.id] = state.votes[vs.id] || [];
          if(vp.checked){ if(!arr.includes(vp.value)) arr.push(vp.value); }
          else state.votes[vs.id] = arr.filter(x=>x!==vp.value);
          saveVotes();
          updateVotePanelUI(vs);
        }
        return;
      }
    }catch(err){ console.error(err); }
  });

  document.addEventListener('scroll', e => {
    try{
      const sc = e.target;
      if(sc && sc.id === 'calscroll'){
        updateCalHead();
        const hint = $('#calhint');
        if(hint && sc.scrollTop > 4) hint.classList.add('gone');
      }
    }catch(err){ console.error(err); }
  }, true);

  window.addEventListener('resize', () => {
    try{ if(document.querySelector('.calzone')) fitCalZone(); }catch(err){ console.error(err); }
  });

  window.addEventListener('popstate', () => {
    try{
      const h = location.hash.replace('#','') || 'start';
      if(ROUTES.includes(h)){
        clearTimers();
        closeOverlays();
        document.body.style.overflow = '';
        state.screen = h;
        saveForm();
        window.scrollTo(0,0);
        renderScreen(h);
      }
    }catch(err){ console.error(err); }
  });

  window.addEventListener('load', () => {
    try{ if(document.querySelector('.calzone')) fitCalZone(); }catch(err){ console.error(err); }
  });

  function fillDemo(){
    state.name = 'Test';
    state.selectedGroup = 'tire';
    state.washItems = [];
    const d = getBaseDate();
    do{ d.setDate(d.getDate()+1); } while(d.getDay()%6===0);
    d.setHours(0,0,0,0);
    state.selectedDate = new Date(d);
    state.selectedTime = '10:00';
    state.phoneCountryCode = '+372';
    state.phoneDigits = '5557 6777';
    state.email = 'name@example.com';
    state.emailSkipped = false;
    state.plate = '123 ABC';
    state.plateSkipped = false;
    state.clientName = 'Test';
    state.bookingNo = 'AL-1234';
    state.extras = [];
    saveForm();
  }

  function init(){
    const q = new URLSearchParams(location.search);
    const screen = q.get('screen');
    if(screen){
      const name = q.get('name');
      if(name === 'Test') fillDemo();
      const v = q.get('v');
      if(v){
        const vs = VOTE_SCREENS.find(x=>x.screen===screen && x.variants.some(y=>y.id===v));
        if(vs) state.currentVariant[vs.id] = v;
      }
      if(q.get('still') === '1') document.documentElement.classList.add('still');
      if(screen === 'sheet'){
        go('step4', {replace:true});
        openSheet('add');
        return;
      }
      if(screen === 'info'){
        go('step1', {replace:true});
        openInfo('wash_in_out');
        return;
      }
      go(screen, {replace:true});
      return;
    }
    const h = location.hash.replace('#','');
    if(h) go(h, {replace:true});
    else go('start', {replace:true});
  }

  window.__proto = { get state(){ return state; }, go: go };

  init();

})();

