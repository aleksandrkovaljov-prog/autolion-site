(function(){
  'use strict';

  // ---------- helpers ----------
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n,min,max)=>Math.min(Math.max(n,min),max);

  const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const MONTHS_NOM = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
  const MONTHS_SHORT = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  const WEEKDAYS = ['вс','пн','вт','ср','чт','пт','сб'];
  const cap = s => s ? s[0].toUpperCase()+s.slice(1) : s;

  const S = window.SERVICES || {services:{},groups:[],sheet_sections:[],step1_wash_items:[],incompatible:{},thanks_directions:[]};
  const getService = id => S.services && S.services[id] ? S.services[id] : null;
  const getGroup = id => S.groups ? S.groups.find(g=>g.id===id) : null;
  const serviceName = id => { const s=getService(id); return s ? s.name : id; };
  const groupName = id => { const g=getGroup(id); return g ? g.name : id; };

  // ---------- constants ----------
  const DRAFT_KEY = 'autolion_proto_draft_v1';
  const PAYLOAD_KEY = 'autolion_proto_vote_v1';
  const DONE_KEY = 'autolion_proto_vote_done_v1';
  const CLIENT_ID_KEY = 'autolion_proto_client_id_v1';
  const COMMENTS_KEY = 'autolion_proto_votes_comments_v1';
  const PROTO_CONFIG = window.PROTO_CONFIG || {VOTE_ENDPOINT:''};

  const VOTE_SCREENS = [
    {
      id:'step1_hint',
      screen:'step1',
      title:'Шаг 1 — подсказка, пока услуга не выбрана',
      variants:[
        {id:'A', label:'A — Подсказка над кнопкой'},
        {id:'B', label:'B — Текст на самой кнопке'}
      ]
    },
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
    ['🇪🇪','Эстония','EE','+372'],
    ['🇱🇻','Латвия','LV','+371'],
    ['🇫🇮','Финляндия','FI','+358'],
    ['🇱🇹','Литва','LT','+370'],
    ['🇷🇺','Россия','RU','+7'],
    ['🇸🇪','Швеция','SE','+46'],
    ['🇵🇱','Польша','PL','+48'],
    ['🇩🇪','Германия','DE','+49'],
    ['🇦🇹','Австрия','AT','+43'],['🇧🇪','Бельгия','BE','+32'],['🇧🇬','Болгария','BG','+359'],
    ['🇬🇧','Великобритания','GB','+44'],['🇭🇺','Венгрия','HU','+36'],['🇬🇷','Греция','GR','+30'],
    ['🇩🇰','Дания','DK','+45'],['🇮🇪','Ирландия','IE','+353'],['🇮🇸','Исландия','IS','+354'],
    ['🇪🇸','Испания','ES','+34'],['🇮🇹','Италия','IT','+39'],['🇰🇿','Казахстан','KZ','+7'],
    ['🇨🇾','Кипр','CY','+357'],['🇱🇺','Люксембург','LU','+352'],['🇲🇹','Мальта','MT','+356'],
    ['🇳🇱','Нидерланды','NL','+31'],['🇳🇴','Норвегия','NO','+47'],['🇵🇹','Португалия','PT','+351'],
    ['🇷🇴','Румыния','RO','+40'],['🇸🇰','Словакия','SK','+421'],['🇸🇮','Словения','SI','+386'],
    ['🇺🇸','США','US','+1'],['🇹🇷','Турция','TR','+90'],['🇺🇦','Украина','UA','+380'],
    ['🇫🇷','Франция','FR','+33'],['🇭🇷','Хорватия','HR','+385'],['🇨🇿','Чехия','CZ','+420'],
    ['🇨🇭','Швейцария','CH','+41']
  ];
  const FOREIGN_COUNTRIES = [
    ['🇱🇻','Латвия','LV'],['🇫🇮','Финляндия','FI'],['🇱🇹','Литва','LT'],
    ['🇷🇺','Россия','RU'],['🇸🇪','Швеция','SE'],['🇵🇱','Польша','PL'],['🇩🇪','Германия','DE'],
    ['🇦🇹','Австрия','AT'],['🇧🇪','Бельгия','BE'],['🇧🇬','Болгария','BG'],
    ['🇬🇧','Великобритания','GB'],['🇭🇺','Венгрия','HU'],['🇬🇷','Греция','GR'],
    ['🇩🇰','Дания','DK'],['🇮🇪','Ирландия','IE'],['🇮🇸','Исландия','IS'],
    ['🇪🇸','Испания','ES'],['🇮🇹','Италия','IT'],['🇰🇿','Казахстан','KZ'],
    ['🇨🇾','Кипр','CY'],['🇱🇺','Люксембург','LU'],['🇲🇹','Мальта','MT'],
    ['🇳🇱','Нидерланды','NL'],['🇳🇴','Норвегия','NO'],['🇵🇹','Португалия','PT'],
    ['🇷🇴','Румыния','RO'],['🇸🇰','Словакия','SK'],['🇸🇮','Словения','SI'],
    ['🇺🇸','США','US'],['🇹🇷','Турция','TR'],['🇺🇦','Украина','UA'],
    ['🇫🇷','Франция','FR'],['🇭🇷','Хорватия','HR'],['🇨🇿','Чехия','CZ'],
    ['🇨🇭','Швейцария','CH']
  ];

  // ---------- state ----------
  let state = {
    screen:'start',
    name:'',
    selectedGroup:null,
    washItems:[],
    extras:[],
    selectedDate:null,
    selectedTime:null,
    phoneCountryCode:'+372',
    phoneDigits:'',
    email:'',
    emailSkipped:false,
    plate:'',
    plateSkipped:false,
    clientName:'',
    bookingNo:'',
    invoiceType:'person',
    foreignFirm:false,
    firmCountry:'',
    firmName:'',
    regCode:'',
    vat:'',
    city:'',
    zip:'',
    street:'',
    accountingEmail:'',
    carMake:'',
    carModel:'',
    carYear:'',
    carRadius:'',
    carVIN:'',
    previousBookings:[],
    votes: JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}'),
    votesComments: JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}'),
    currentVariant: {},
    clientId: localStorage.getItem(CLIENT_ID_KEY) || genId(),
    submitted: localStorage.getItem(DONE_KEY) === '1'
  };
  if(!localStorage.getItem(CLIENT_ID_KEY)) localStorage.setItem(CLIENT_ID_KEY, state.clientId);

  function genId(){ return Math.random().toString(36).slice(2,10); }
  function generateBookingNo(){ return 'AL-' + Math.floor(1000 + Math.random()*9000); }
  function saveVotes(){ localStorage.setItem(DRAFT_KEY, JSON.stringify(state.votes)); localStorage.setItem(COMMENTS_KEY, JSON.stringify(state.votesComments)); }

  // ---------- service helpers ----------
  function isWashSelected(){ return state.selectedGroup === 'wash' && state.washItems && state.washItems.length>0; }
  function isAnyServiceSelected(){ return isWashSelected() || (state.selectedGroup && state.selectedGroup !== 'wash'); }

  // ---------- voting helpers ----------
  function getVariantForScreen(screenId){ return VOTE_SCREENS.find(v=>v.screen===screenId); }
  function currentVariantId(vs){ return state.currentVariant[vs.id] || vs.variants[0].id; }
  function setDisplayVariant(vs, variantId){
    state.currentVariant[vs.id] = variantId;
    const buttons = $$('.vote-switch button');
    buttons.forEach(b=>b.classList.toggle('on', b.dataset.variant === variantId));
    switch(vs.screen){
      case 'step1': updateStep1Controls(); break;
      case 'step4': refreshVariantBlock(vs); break;
      case 'step5': updateStep5SaveButton(); break;
      case 'thanks': refreshVariantBlock(vs); break;
    }
  }
  function voteChecked(vsId, variantId){ return (state.votes[vsId]||[]).includes(variantId); }
  function voteComment(vsId){ return state.votesComments[vsId] || ''; }
  function setVoteComment(vsId, text){ state.votesComments[vsId] = text; saveVotes(); }

  // ---------- router ----------
  function navigate(screen){ if(screen !== state.screen) location.hash = screen; else renderCurrent(); }
  function renderCurrent(){ showScreen(state.screen); }

  window.addEventListener('hashchange', ()=>{
    const h = location.hash.replace('#','');
    if(h && ['start','step1','step2','step3','step4','step5','thanks','end'].includes(h)){
      state.screen = h;
      showScreen(h);
    } else if(!h){
      navigate('start');
    }
  });

  function initFromQuery(){
    const q = new URLSearchParams(location.search);
    const screen = q.get('screen');
    if(screen){
      state.demo = q.get('name') === 'Test';
      if(state.demo){
        state.name = 'Test';
        state.selectedGroup = 'tire';
        state.washItems = [];
        state.selectedDate = new Date(2026,9,21);
        state.selectedTime = '10:00';
        state.phoneCountryCode = '+372';
        state.phoneDigits = '5557 6777';
        state.email = 'name@example.com';
        state.emailSkipped = false;
        state.plate = '123 ABC';
        state.plateSkipped = false;
        state.clientName = 'Test';
        state.bookingNo = 'AL-1234';
        state.invoiceType = 'person';
        state.extras = [];
        if(screen==='start') showScreen('start');
      } else {
        state.screen = screen;
      }
      const v = q.get('v');
      if(v && VOTE_SCREENS.some(vs=>vs.screen===screen && vs.variants.some(x=>x.id===v))){
        const vs = VOTE_SCREENS.find(x=>x.screen===screen && x.variants.some(y=>y.id===v));
        state.currentVariant[vs.id] = v;
      }
      const still = q.get('still') === '1';
      if(still) document.documentElement.classList.add('still');
      setTimeout(()=>{
        // Demo overlays: open on top of their natural screen (sheet over step 4, info over step 1)
        const base = screen==='sheet' ? 'step4' : screen==='info' ? 'step1' : screen;
        state.screen = base;
        history.replaceState(null, '', location.pathname + location.search + '#' + base);
        showScreen(base);
        if(screen==='sheet') openSheet('add');
        if(screen==='info') openInfo('wash_in_out');
      }, 0);
    } else {
      if(!location.hash) navigate('start');
    }
  }

  // ---------- guard ----------
  function guardVoteAction(action){
    const vs = VOTE_SCREENS.find(v=>v.screen===state.screen);
    if(!vs){ action(); return; }
    if((state.votes[vs.id]||[]).length > 0){ action(); return; }
    const panel = $('#vote-panel');
    if(panel){
      panel.scrollIntoView({behavior:'smooth', block:'center'});
      panel.classList.remove('highlight');
      void panel.offsetWidth;
      panel.classList.add('highlight');
      const msg = $('#vote-msg');
      if(msg){ msg.textContent = 'Сначала отметьте хотя бы один вариант'; msg.classList.remove('hidden'); }
      setTimeout(()=>panel.classList.remove('highlight'), 800);
    }
  }

  // ---------- render dispatch ----------
  function showScreen(screen){
    const app = $('#app');
    app.innerHTML = '';
    window.scrollTo(0,0);
    document.body.style.overflow = '';
    closeOverlays();
    switch(screen){
      case 'start': renderStart(app); break;
      case 'step1': renderStep1(app); break;
      case 'step2': renderStep2(app); break;
      case 'step3': renderStep3(app); break;
      case 'step4': renderStep4(app); break;
      case 'step5': renderStep5(app); break;
      case 'thanks': renderThanks(app); break;
      case 'end': renderEnd(app); break;
      default: navigate('start');
    }
  }

  function closeOverlays(){ const ov = $('#overlays'); if(ov) ov.innerHTML=''; }

  // ---------- overlays ----------
  function openSheet(mode='add', returnTo){
    closeOverlays();
    const ov = $('#overlays');
    ov.innerHTML = `
      <div class="scrim" data-action="close-sheet"></div>
      <section class="sheet" role="dialog" aria-modal="true" aria-label="Дополнительные услуги">
        <div class="grab"></div>
        <h3>${mode==='view' ? 'Прайс-лист' : 'Что ещё успеем сделать'}</h3>
        <p class="sub">${mode==='view' ? 'Цены с НДС. Окончательную стоимость и время подтвердит мастер.' : 'Если машина может побыть у нас подольше. Время подтвердит мастер. Цены с НДС.'}</p>
        <div class="lst" id="sheet-list"></div>
        <div class="sheet-footer">
          <button class="button primary" id="sheet-cta">${mode==='select'?'Выбрать (0)':mode==='add'?'Добавить к записи (0)':'Понятно'}</button>
          <button class="back" data-action="close-sheet">${window.state && state.screen==='step1'?'← Назад':'← Назад к данным'}</button>
        </div>
      </section>`;
    const list = $('#sheet-list');
    const cta = $('#sheet-cta');
    let selected = new Set(state.extras || []);
    let count = selected.size;
    if(mode==='view') cta.textContent = 'Понятно';
    list.innerHTML = buildSheetList(mode, selected);
    if(mode!=='view'){ cta.classList.add('dim'); cta.disabled = true; }
    list.addEventListener('click', e=>{
      const item = e.target.closest('.it');
      if(!item) return;
      const id = item.dataset.id;
      const infoBtn = e.target.closest('.i-btn');
      if(infoBtn){ e.stopPropagation(); openInfo(id); return; }
      if(id && mode!=='view' && !item.classList.contains('dis')){
        const box = item.querySelector('.box');
        if(box){
          const isSelected = box.classList.toggle('on');
          if(isSelected) selected.add(id); else selected.delete(id);
          count = selected.size;
          cta.textContent = `${mode==='select'?'Выбрать':'Добавить к записи'} (${count})`;
          cta.classList.toggle('dim', count===0);
          cta.disabled = count===0;
        }
      }
    });
    cta.addEventListener('click', ()=>{
      if(mode==='view'){ closeOverlays(); return; }
      if(selected.size===0) return;
      state.extras = Array.from(selected);
      if(mode==='add'){
        showToast('Добавлено к записи — мастер подтвердит время');
      } else {
        showToast('Выбрано — вернитесь к шагу 1');
      }
      closeOverlays();
      if(mode==='select') renderCurrent();
    });
    ov.addEventListener('click', e=>{
      if(e.target.classList.contains('scrim') || e.target.closest('[data-action="close-sheet"]')){
        closeOverlays();
        if(mode==='select') renderCurrent();
      }
    });
  }

  function buildSheetList(mode, selected){
    const sections = S.sheet_sections || [];
    let html = '';
    sections.forEach(sec=>{
      html += `<div class="g">${sec.title}</div>`;
      (sec.items||[]).forEach(id=>{
        const svc = getService(id);
        if(!svc) return;
        const incompatible = (mode==='select') ? isIncompatible(id) : '';
        const disClass = incompatible ? ' dis' : '';
        const priceHtml = svc.price ? `<span class="price">${svc.price}${svc.suv?`<small>${svc.suv}</small>`:''}${svc.promo?`<span class="promo">${svc.promo.split(' / ')[0]}</span>`:''}</span>` : '';
        const popular = svc.popular ? `<span class="popular-chip">Чаще всего выбирают</span>` : '';
        html += `<div class="it${disClass}" data-id="${id}">
          ${mode!=='view'?'<span class="box'+(selected.has(id)&&!incompatible?' on':'')+'"></span>':'<span></span>'}
          <div class="title">${popular}${svc.name}
            ${svc.sub?`<div class="small-line">${svc.sub}</div>`:''}
            ${incompatible?`<div class="small-line" style="color:#596066">${incompatible}</div>`:''}
          </div>
          ${priceHtml}
          <button class="i-btn" data-id="${id}" aria-label="Описание ${svc.name}">i</button>
        </div>`;
      });
    });
    if(mode==='view'){
      const tire = getService('tire');
      if(tire && tire.price_table){
        html += `<div class="g">Шиномонтаж — сезонная акция</div>`;
        html += `<div class="it"><div class="title">${tire.name}</div><button class="i-btn" data-id="tire">i</button></div>`;
        html += formatPriceBlock(tire);
        if(tire.price_table.tpms_i) html += `<p class="ptab-note" style="margin-top:8px"><b>Датчики давления (TPMS):</b> ${tire.price_table.tpms_i}</p>`;
      }
    }
    return html;
  }

  function openInfo(serviceId){
    closeOverlays();
    const svc = getService(serviceId);
    if(!svc) return;
    const desc = svc.desc || null;
    const ov = $('#overlays');
    let priceBlock = '';
    if(svc.price || svc.price_table) priceBlock = formatPriceBlock(svc);
    let inc = '', exc = '', note = '';
    if(desc){
      inc = desc.includes && desc.includes.length ? `<div class="inc"><h4>Что входит</h4>${desc.includes.map(x=>`<div class="inc-item"><span class="check">✓</span><span>${x}</span></div>`).join('')}</div>` : '';
      exc = desc.excludes && desc.excludes.length ? `<div class="exc"><h4>Что не входит</h4>${desc.excludes.map(x=>`<div class="exc-item"><span class="cross">✕</span><span>${x}</span></div>`).join('')}</div>` : '';
      note = desc.note ? `<p class="after">${desc.note}</p>` : '';
    }
    ov.innerHTML = `
      <div class="scrim" data-action="close-info"></div>
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
        <div class="sheet-footer">
          <button class="button secondary" data-action="close-info">Понятно</button>
        </div>
      </section>`;
    ov.addEventListener('click', e=>{
      if(e.target.classList.contains('scrim') || e.target.closest('[data-action="close-info"]')){
        closeOverlays();
      }
      if(serviceId==='body' && e.target.closest('[data-action="book-body"]')){
        state.selectedGroup = 'body';
        state.washItems = [];
        navigate('step1');
      }
    });
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
    // Tire service: seasonal campaign table + regular price (PRICES.md)
    if(svc.price_table){
      const pt = svc.price_table;
      const list = arr => (arr||[]).map(x=>`<li>${x}</li>`).join('');
      return `<div class="ptab">
        <p class="ptab-h">Сезонная акция</p><ul>${list(pt.promo)}</ul>
        <p class="ptab-h">Доплаты</p><ul>${list(pt.promo_extras)}</ul>
        ${pt.regular_title ? `<p class="ptab-h">${pt.regular_title}</p><ul>${list(pt.regular)}</ul>` : ''}
        ${pt.note ? `<p class="ptab-note">${pt.note}</p>` : ''}
      </div>`;
    }
    let rows = '';
    if(svc.price) rows += `<div><span>${svc.suv ? 'Легковая' : 'Цена'}</span><b>${svc.price}</b></div>`;
    if(svc.suv) rows += `<div><span>SUV</span><b>${formatSuv(svc.suv)}</b></div>`;
    if(svc.promo) rows += `<div><span>Акция</span><b>${formatPromo(svc.promo)}</b></div>`;
    (svc.extras||[]).forEach(ex=> rows += `<div><span>Доплата</span><b>${ex}</b></div>`);
    return rows ? `<div class="sum">${rows}</div>` : '';
  }

  function showToast(msg){
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(()=>t.classList.remove('show'), 2500);
  }

  // ---------- screens ----------
  function renderStart(app){
    app.innerHTML = `
      <section class="screen" data-screen="start">
        <h2>Старт голосования</h2>
        <div class="field">
          <label class="l" for="participant-name">Ваше имя <span class="req">*</span></label>
          <input class="input" id="participant-name" type="text" autocomplete="given-name" value="${escapeHtml(state.name)}" placeholder="Имя">
        </div>
        <p class="note" style="margin:0;font-size:var(--t-sec);color:var(--muted)">Это прототип онлайн-записи Autolion. Пройдите запись как клиент — всё понарошку, ничего никуда не уходит, кроме ваших ответов. На некоторых экранах сверху есть переключатель вариантов A / B / C — посмотрите каждый и внизу экрана отметьте один или несколько понравившихся. Можно оставить комментарий. В конце нажмите «Отправить ответы». Ответы других участников вам не видны.</p>
        ${state.submitted ? `<div class="sent ph">Вы уже отправляли ответы в этом браузере.</div>` : ''}
        <button class="button primary" id="start-btn">${state.submitted ? 'Пройти заново' : 'Начать'}</button>
      </section>`;
    $('#start-btn').addEventListener('click', ()=>{
      const name = $('#participant-name').value.trim();
      if(!name){ $('#participant-name').focus(); $('#participant-name').style.borderColor='#ff6b6b'; return; }
      state.name = name;
      state.submitted = false;
      state.bookingNo = generateBookingNo();
      navigate('step1');
    });
  }

  function renderStep1(app){
    const vs = getVariantForScreen('step1');
    const variant = currentVariantId(vs);
    app.innerHTML = `
      ${renderVoteBar(vs)}
      <section class="screen" data-screen="step1">
        <h2>Онлайн-запись</h2>
        <ol class="steps"><li class="cur"></li><li></li><li></li><li></li></ol>
        <p class="stepline">Шаг 1 из 4 · <b>Что нужно сделать?</b></p>
        ${state.previousBookings.length ? `<p class="note prev-booked">Уже записано: ${state.previousBookings.map(pb=>`${escapeHtml(pb.plate)} · ${pb.date?formatDateShort(pb.date):''} · ${pb.time||''}`).join('; ')}</p>` : ''}
        <h3>Что нужно сделать?</h3>
        <div id="step1-groups">${renderStep1Groups()}</div>
        <div id="variant-block">${renderStep1Controls()}</div>
        ${renderVotePanel(vs)}
      </section>`;
    bindStep1();
    updateStep1Controls();
  }

  function renderStep1Groups(){
    let html = '';
    (S.groups||[]).forEach(g=>{
      const isWash = g.id==='wash';
      const isOpen = isWash && state.selectedGroup==='wash';
      const icon = iconName(g.id);
      const selectedForWash = isWash && state.washItems.length>0;
      html += `<div class="grp ${isOpen?'open':''} ${selectedForWash?'sel':''}" data-group="${g.id}">
        <div class="grp-h">
          <button type="button" class="grp-main" data-action="toggle-group">
            <svg class="icon"><use href="#${icon}"/></svg>
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
    const items = S.step1_wash_items || [];
    let html = '';
    items.forEach(id=>{
      const svc = getService(id);
      if(!svc) return;
      const incompatible = isIncompatible(id);
      const selected = state.washItems.includes(id);
      html += `<div class="item ${incompatible?'dis':''}" data-wash="${id}">
        <span class="box ${selected&&!incompatible?'on':''}"></span>
        <span style="flex:1;min-width:0">${svc.name}${incompatible?`<span class="why">${incompatible}</span>`:''}</span>
        <button type="button" class="i-btn" data-action="info" data-service="${id}">i</button>
      </div>`;
    });
    return html;
  }

  function isIncompatible(id){
    for(const key of Object.keys(S.incompatible || {})){
      if(key !== id && state.washItems.includes(key) && S.incompatible[key].includes(id)){
        return `Уже входит в «${serviceName(key)}»`;
      }
    }
    return '';
  }

  function renderWashSummary(){
    const n = state.washItems.length;
    if(!n) return '';
    return `<div class="tot"><span>Выбрано ${n} услуг${n>1?'ы':''}</span><b>Цена в описании</b></div>`;
  }
  function renderWashNote(){
    if(state.washItems.length>1){
      return `<div class="mnote"><svg class="icon"><use href="#i-warn"/></svg><span>Запись на несколько услуг подтверждает мастер — мы свяжемся с вами.</span></div>`;
    }
    return '';
  }

  function renderStep1Controls(){
    const vs = getVariantForScreen('step1');
    const variant = currentVariantId(vs);
    const selected = isAnyServiceSelected();
    const label = !selected ? (variant==='B'?'Выберите услугу':'Дальше: дата и время →') : 'Дальше: дата и время →';
    const disabled = !selected ? 'disabled' : '';
    const dimClass = !selected ? 'dim' : '';
    return `${variant==='A' && !selected ? `<p class="note center" id="step1-hint" style="margin:0;color:var(--amber)">Выберите услугу, чтобы продолжить</p>` : ''}
      <button class="button primary ${dimClass}" id="step1-next" ${disabled}>${label}</button>`;
  }

  function updateStep1Controls(){
    const btn = $('#step1-next');
    if(!btn) return;
    const variant = currentVariantId(getVariantForScreen('step1'));
    const selected = isAnyServiceSelected();
    btn.disabled = !selected;
    btn.classList.toggle('dim', !selected);
    btn.textContent = !selected ? (variant==='B'?'Выберите услугу':'Дальше: дата и время →') : 'Дальше: дата и время →';
    const oldHint = $('#step1-hint');
    if(variant==='A' && !selected){
      if(!oldHint){
        const p = document.createElement('p');
        p.id='step1-hint';
        p.className='note center';
        p.style.margin='0';
        p.style.color='var(--amber)';
        p.textContent='Выберите услугу, чтобы продолжить';
        btn.parentNode.insertBefore(p, btn);
      }
    } else if(oldHint) oldHint.remove();
  }

  function bindStep1(){
    const groups = $('#step1-groups');
    groups.addEventListener('click', e=>{
      const infoBtn = e.target.closest('[data-action="info"]');
      if(infoBtn){
        e.stopPropagation();
        const sid = infoBtn.dataset.service;
        const gid = infoBtn.dataset.group;
        if(sid) openInfo(sid);
        else if(gid) openInfo(firstServiceInGroup(gid));
        return;
      }
      const fullList = e.target.closest('[data-action="full-list"]');
      if(fullList){ e.preventDefault(); openSheet('select'); return; }
      const toggle = e.target.closest('[data-action="toggle-group"]');
      if(toggle){
        const grp = toggle.closest('.grp');
        const gid = grp.dataset.group;
        if(gid==='wash'){
          if(state.selectedGroup==='wash') state.selectedGroup=null;
          else state.selectedGroup='wash';
        } else {
          state.selectedGroup = gid;
          state.washItems = [];
        }
        updateStep1Groups();
        updateStep1Controls();
        return;
      }
      const item = e.target.closest('.item[data-wash]');
      if(item){
        const id = item.dataset.wash;
        if(isIncompatible(id)) return;
        if(state.washItems.includes(id)){
          state.washItems = state.washItems.filter(x=>x!==id);
        } else {
          const incompatible = S.incompatible || {};
          const toRemove = new Set();
          if(incompatible[id]){
            incompatible[id].forEach(b => { if(state.washItems.includes(b)) toRemove.add(b); });
          }
          Object.keys(incompatible).forEach(key => {
            if(key !== id && incompatible[key].includes(id) && state.washItems.includes(key)) toRemove.add(key);
          });
          state.washItems = state.washItems.filter(x=>!toRemove.has(x));
          state.washItems.push(id);
        }
        updateStep1Groups();
        updateStep1Controls();
      }
    });
    $('#step1-next').addEventListener('click', ()=>{
      guardVoteAction(()=> navigate('step2'));
    });
  }

  function updateStep1Groups(){
    const el = $('#step1-groups');
    if(el) el.innerHTML = renderStep1Groups();
  }

  function firstServiceInGroup(gid){
    const g = getGroup(gid);
    if(!g) return gid;
    if(gid==='wash') return (S.step1_wash_items||[])[0];
    return g.id;
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

  function renderStep2(app){
    const today = getBaseDate();
    app.innerHTML = `
      <section class="screen" data-screen="step2">
        <h2>Онлайн-запись</h2>
        <ol class="steps"><li class="done"></li><li class="cur"></li><li></li><li></li></ol>
        <p class="stepline">Шаг 2 из 4 · <b>Дата и время</b></p>
        <div class="option sel"><span style="font-size:16px">${serviceSummary()}</span><span style="margin-left:auto;font-size:15px;color:var(--muted)">Изменить</span></div>
        <div class="calzone" id="calzone"><div class="zonebg"></div>
          <div class="calscroll" id="calscroll">
            <div class="stick"><div class="cal-head" id="calhead"></div>
              <div class="dowrow"><div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div></div></div>
            <div id="weeks"></div><div class="tail" style="height:14px"></div>
          </div><div class="fade"></div>
        </div>
        <div class="hint" id="calhint">Листайте вниз — следующие недели <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 6l4.5 4.5L12.5 6"/></svg></div>
        <h3 class="tm" id="tm-title">${state.selectedDate ? 'Время' : 'Выберите дату'}</h3>
        <div class="slots" id="slots">${state.selectedDate ? '' : '<div style="grid-column:1/-1;color:var(--muted);font-size:var(--t-sec)">Выберите день в календаре</div>'}</div>
        <button class="button primary" id="step2-next">Дальше: контакты →</button>
        <button class="back" id="step2-back">← Назад</button>
      </section>`;
    initCalendar(today);
    $('#step2-next').addEventListener('click', ()=>{
      if(!state.selectedDate || !state.selectedTime){
        $('#slots').scrollIntoView({behavior:'smooth',block:'center'});
        return;
      }
      navigate('step3');
    });
    $('#step2-back').addEventListener('click', ()=>navigate('step1'));
  }

  function getBaseDate(){
    const today = new Date();
    const cutoff = new Date(2026,9,19);
    if(today < cutoff) return new Date(2026,9,19);
    return today;
  }

  function serviceSummary(){
    if(state.selectedGroup==='wash' || state.washItems.length){
      const name = groupName('wash');
      if(state.washItems.length === 0) return name;
      return `${name} · ${state.washItems.length} услуг${state.washItems.length>1?'и':''}`;
    }
    if(state.selectedGroup) return groupName(state.selectedGroup);
    return 'Услуга не выбрана';
  }

  function initCalendar(baseDate){
    const sc = $('#calscroll'), weeksEl = $('#weeks'), headEl = $('#calhead');
    let n = 0;
    const start = new Date(baseDate);
    start.setHours(0,0,0,0);
    start.setDate(start.getDate() - ((start.getDay()+6)%7));
    function normalizeDate(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    if(state.selectedDate) state.selectedDate = normalizeDate(state.selectedDate);
    const base = normalizeDate(baseDate);
    function addWeeks(k){
      for(let w=0; w<k; w++, n++){
        const r = document.createElement('div'); r.className='wk';
        for(let i=0;i<7;i++){
          const x = new Date(start); x.setDate(start.getDate()+n*7+i);
          const closed = x < base || i>4;
          const c = document.createElement('div');
          c.className = 'd '+ (closed?'closed':'open') + (x.getTime()===base.getTime()?' today':'') + (state.selectedDate && x.getTime()===state.selectedDate.getTime()?' sel':'');
          c.textContent = x.getDate();
          c.dataset.t = x.getTime();
          if(x.getDate()==1 && n*7+i>0){
            const l = document.createElement('span'); l.className='mlab'; l.textContent = MONTHS_SHORT[x.getMonth()]; c.appendChild(l);
          }
          if(!closed){
            c.onclick = ()=>{
              state.selectedDate = normalizeDate(new Date(Number(c.dataset.t)));
              $$('.d.sel', weeksEl).forEach(el=>el.classList.remove('sel'));
              c.classList.add('sel');
              renderSlots(base);
            };
          }
          r.appendChild(c);
        }
        weeksEl.appendChild(r);
      }
      updateCalHead();
    }
    function updateCalHead(){
      const top = sc.scrollTop + $('.stick').offsetHeight;
      const bot = sc.scrollTop + sc.clientHeight - 10;
      let a=null,b=null;
      $$('.wk', weeksEl).forEach((r,i)=>{
        const rect = r.getBoundingClientRect();
        // approximate by offsetTop
        const t = r.offsetTop+20, h=t+50;
        if(h>top+10 && t<bot-10){ if(a===null) a=i; b=i; }
      });
      if(a===null) a=b=0;
      const s = new Date(start); s.setDate(start.getDate()+a*7);
      const e = new Date(start); e.setDate(start.getDate()+b*7+6);
      let txt;
      if(s.getMonth()===e.getMonth()) txt = `${cap(MONTHS_NOM[s.getMonth()])} ${s.getFullYear()}`;
      else if(s.getFullYear()===e.getFullYear()) txt = `${cap(MONTHS_NOM[s.getMonth()])} – ${MONTHS_NOM[e.getMonth()]} ${e.getFullYear()}`;
      else txt = `${cap(MONTHS_NOM[s.getMonth()])} ${s.getFullYear()} – ${MONTHS_NOM[e.getMonth()]} ${e.getFullYear()}`;
      headEl.textContent = txt;
    }
    function renderSlots(base){
      if(!state.selectedDate){ $('#tm-title').textContent='Выберите дату'; $('#slots').innerHTML='<div style="grid-column:1/-1;color:var(--muted);font-size:var(--t-sec)">Выберите день в календаре</div>'; return; }
      const date = state.selectedDate;
      const dname = WEEKDAYS[date.getDay()];
      const t = `${dname}, ${date.getDate()} ${MONTHS_GEN[date.getMonth()]}`;
      $('#tm-title').textContent = `Время · ${t}`;
      const slotsEl = $('#slots');
      const free = deterministicFreeSlots(date);
      let html = '';
      for(let mins=9*60; mins<18*60; mins+=30){
        const time = String(Math.floor(mins/60)).padStart(2,'0')+':'+(mins%60?'30':'00');
        const isFree = free.includes(time) && isSlotAllowed(date, time, base);
        const sel = state.selectedTime===time;
        html += `<div class="slot ${sel?'sel':isFree?'':'busy'}">${time}</div>`;
      }
      slotsEl.innerHTML = html;
      $$('.slot', slotsEl).forEach(el=>{
        el.addEventListener('click', ()=>{
          if(el.classList.contains('busy')) return;
          state.selectedTime = el.textContent;
          $$('.slot.sel', slotsEl).forEach(x=>x.classList.remove('sel'));
          el.classList.add('sel');
        });
      });
    }
    function deterministicFreeSlots(date){
      const seed = date.getDate()*7 + date.getMonth()*3 + date.getFullYear()%10;
      const busy = new Set();
      for(let i=0;i<6;i++){ const idx = (seed*3 + i*5) % 18; busy.add(idx); }
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
      if(slotDate < min) return false;
      return true;
    }
    function fitZone(){
      const stick = $('.stick');
      if(!stick) return;
      const row = $('.wk');
      const rowH = row ? row.offsetHeight : 70;
      const zh = stick.offsetHeight + rowH*2 + Math.round(rowH*0.62) + 16;
      $('.calzone').style.setProperty('--zh', zh+'px');
      updateCalHead();
    }
    addWeeks(30);
    if(state.selectedDate) renderSlots(base);
    fitZone();
    sc.addEventListener('scroll', ()=>{
      if(sc.scrollTop+sc.clientHeight > sc.scrollHeight-300) addWeeks(6);
      updateCalHead();
      if(sc.scrollTop>4 && $('#calhint')) $('#calhint').classList.add('gone');
    }, {passive:true});
    const hint = $('#calhint');
    if(!document.documentElement.classList.contains('still')){
      const wk = $('#weeks');
      setTimeout(()=>{ if(document.body.contains(wk)) wk.classList.add('nudge'); }, 500);
      wk.addEventListener('animationend', ()=>wk.classList.remove('nudge'), {once:true});
    }
    window.addEventListener('resize', fitZone);
  }

  function renderStep3(app){
    app.innerHTML = `
      <section class="screen" data-screen="step3">
        <h2>Онлайн-запись</h2>
        <ol class="steps"><li class="done"></li><li class="done"></li><li class="cur"></li><li></li></ol>
        <p class="stepline">Шаг 3 из 4 · <b>Контакты</b></p>
        <p class="legend-req"><span class="req">*</span> — обязательное поле. Аккаунт не нужен.</p>
        <div class="field">
          <label class="l">Телефон <span class="req">*</span></label>
          <div class="phone">
            <button type="button" class="cc" id="cc-btn"><span class="flag">${flagOf(state.phoneCountryCode)}</span>${state.phoneCountryCode}<svg class="icon chev" style="width:14px;height:14px"><use href="#i-down"/></svg></button>
            <input class="input" id="phone-digits" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="5557 6777" value="${escapeHtml(state.phoneDigits)}">
          </div>
          <div id="cc-dropdown"></div>
        </div>
        <div class="field">
          <label class="l">E-mail <span class="req">*</span></label>
          <input class="input" id="email-input" type="email" autocomplete="email" placeholder="name@example.com" value="${escapeHtml(state.email)}" ${state.emailSkipped?'disabled':''}>
          <label class="cb"><input type="checkbox" id="email-skip" ${state.emailSkipped?'checked':''}><span class="box ${state.emailSkipped?'on':''}"></span><span>Продолжить без e-mail</span></label>
          <p class="small">Тогда подтверждение и связь — только по телефону.</p>
        </div>
        <div class="field">
          <label class="l">Номер машины <span class="req">*</span></label>
          <input class="input" id="plate-input" type="text" autocomplete="off" placeholder="123 ABC" value="${escapeHtml(state.plate)}">
          <label class="cb"><input type="checkbox" id="plate-skip" ${state.plateSkipped?'checked':''}><span class="box ${state.plateSkipped?'on':''}"></span><span>Без номера</span> <button type="button" class="i-btn" id="plate-info" style="width:24px;height:24px;font-size:12px">i</button></label>
        </div>
        <div class="field">
          <label class="l">Как к вам обращаться? <span class="opt">необязательно</span></label>
          <input class="input" id="client-name" type="text" autocomplete="given-name" placeholder="Имя" value="${escapeHtml(state.clientName)}">
        </div>
        <div class="sum">
          <div><span>Услуга</span><b>${serviceSummary()}</b></div>
          <div><span>Когда</span><b>${formatDateShort(state.selectedDate)} · ${state.selectedTime||''}</b></div>
        </div>
        <button class="button primary" id="step3-next">Подтвердить запись</button>
        <button class="back" id="step3-back">← Назад</button>
      </section>`;
    const ccBtn = $('#cc-btn'); const dd = $('#cc-dropdown');
    ccBtn.addEventListener('click', ()=> toggleCountryDropdown());
    function toggleCountryDropdown(){
      if(dd.innerHTML){ dd.innerHTML=''; return; }
      dd.innerHTML = countryDropdownHtml(state.phoneCountryCode, COUNTRIES_PHONE);
      const inp = $('#cc-search');
      if(inp) inp.addEventListener('input', filterCountryDropdown);
      dd.querySelectorAll('.r').forEach(r=>{
        r.addEventListener('click', ()=>{
          state.phoneCountryCode = r.dataset.code;
          ccBtn.innerHTML = `<span class="flag">${flagOf(state.phoneCountryCode)}</span>${state.phoneCountryCode}<svg class="icon chev" style="width:14px;height:14px"><use href="#i-down"/></svg>`;
          dd.innerHTML='';
        });
      });
    }
    function filterCountryDropdown(){
      const q = $('#cc-search').value.trim().toLowerCase();
      const list = COUNTRIES_PHONE.filter(c=>{
        return c[1].toLowerCase().includes(q) || c[2].toLowerCase()===q || c[3].replace('+','')===q || c[3]===q;
      });
      const listEl = $('#cc-list');
      if(listEl) listEl.innerHTML = list.map(c=>countryRowHtml(c)).join('');
    }
    $('#email-skip').addEventListener('change', e=>{
      state.emailSkipped = e.target.checked;
      $('#email-input').disabled = state.emailSkipped;
      const box = e.target.parentNode.querySelector('.box');
      if(box) box.classList.toggle('on', state.emailSkipped);
    });
    $('#plate-skip').addEventListener('change', e=>{
      state.plateSkipped = e.target.checked;
      const box = e.target.parentNode.querySelector('.box');
      if(box) box.classList.toggle('on', state.plateSkipped);
    });
    $('#plate-info').addEventListener('click', ()=>{
      openInfoBodyText();
    });
    $('#step3-next').addEventListener('click', ()=>{
      const phone = $('#phone-digits').value.trim();
      const email = $('#email-input').value.trim();
      const plate = $('#plate-input').value.trim();
      if(!phone){ $('#phone-digits').style.borderColor='#ff6b6b'; return; }
      if(!state.emailSkipped && !email){ $('#email-input').style.borderColor='#ff6b6b'; return; }
      if(!state.plateSkipped && !plate){ $('#plate-input').style.borderColor='#ff6b6b'; return; }
      state.phoneDigits = phone;
      state.email = email;
      state.plate = plate;
      state.clientName = $('#client-name').value.trim();
      state.bookingNo = state.bookingNo || generateBookingNo();
      navigate('step4');
    });
    $('#step3-back').addEventListener('click', ()=>navigate('step2'));
  }

  function countryDropdownHtml(selectedCode, countries){
    const rows = countries.map(c=>countryRowHtml(c)).join('');
    return `<div class="dd">
      <div class="s"><svg class="icon"><use href="#i-search"/></svg><input id="cc-search" type="text" placeholder="Поиск страны или кода..."></div>
      <div class="list" id="cc-list">${rows}</div>
    </div>`;
  }
  function countryRowHtml(c){ return `<button type="button" role="option" class="r ${state.phoneCountryCode===c[3]?'on':''}" data-code="${c[3]}"><span class="flag">${c[0]}</span>${c[1]}<span class="c">${c[3]}</span></button>`; }
  function flagOf(code){ const c = COUNTRIES_PHONE.find(x=>x[3]===code); return c ? c[0] : '🇪🇪'; }

  function openInfoBodyText(){
    const field = $('#plate-input').closest('.field');
    const tip = document.createElement('div');
    tip.className='tip';
    tip.textContent='Если у машины по какой-то причине нет номера, поставьте галочку — тогда номер можно не указывать.';
    field.appendChild(tip);
    const btn = $('#plate-info');
    btn.classList.add('open');
    setTimeout(()=>{ tip.remove(); btn.classList.remove('open'); }, 3000);
  }

  function formatDateShort(d){
    if(!d) return 'дата';
    return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')}`;
  }

  function renderStep4(app){
    const vs = getVariantForScreen('step4');
    const hasPhoneConf = !state.emailSkipped && state.email;
    app.innerHTML = `
      ${renderVoteBar(vs)}
      <section class="screen" data-screen="step4">
        <h2>Онлайн-запись</h2>
        <ol class="steps"><li class="done"></li><li class="done"></li><li class="done"></li><li class="cur"></li></ol>
        <p class="stepline">Шаг 4 из 4 · <b>Готово</b></p>
        <div class="ok"><span class="circle"><svg class="icon"><use href="#i-check"/></svg></span><h3>Запись подтверждена</h3></div>
        <div class="sum">
          <div><span>Номер записи</span><b>${state.bookingNo}</b></div>
          <div><span>Услуга</span><b>${serviceSummary()}</b></div>
          <div><span>Когда</span><b>${formatDateLong(state.selectedDate)} · ${state.selectedTime||''}</b></div>
          <div><span>Адрес</span><b>Vaari 4 (Pärnu mnt 158G)</b></div>
        </div>
        <div class="sent ${hasPhoneConf?'':'ph'}">
          <svg class="icon"><use href="#${hasPhoneConf?'i-mail':'i-check'}"/></svg>
          <span>${hasPhoneConf ? `Подтверждение отправлено на e-mail <b>${escapeHtml(state.email)}</b>` : 'Подтверждение придёт по телефону'}</span>
        </div>
        <div class="ask"><p>Нужен счёт на фирму или хотите сэкономить время в сервисе?</p>
          <button class="button primary" id="to-step5">Указать данные для счёта и автомобиля</button>
        </div>
        <div id="variant-block">${renderUpsellStep4(currentVariantId(vs))}</div>
        <div class="row2">
          <button class="button" id="cal-btn"><svg class="icon"><use href="#i-cal"/></svg>В календарь</button>
          <button class="button" id="map-btn"><svg class="icon"><use href="#i-pin"/></svg>Как добраться</button>
        </div>
        <button class="button" id="reschedule"><svg class="icon"><use href="#i-swap"/></svg>Перенести или отменить ›</button>
        <p class="under">или позвоните <b>+372&nbsp;5557&nbsp;6777</b></p>
        <button class="link" id="price-list-link"><svg class="icon"><use href="#i-list"/></svg>Посмотреть прайс-лист ›</button>
        ${state.extras.length ? `<p class="note" style="margin:0;color:var(--muted)">Добавлено: ${state.extras.map(id=>serviceName(id)).join(', ')}</p>` : ''}
        <button class="button secondary" id="book-again">Записать ещё одну машину</button>
        <button class="button secondary" id="done-btn" style="min-height:48px;background:transparent;border:none;color:var(--muted)">Готово</button>
        ${renderVotePanel(vs)}
      </section>`;
    bindStep4();
  }

  function renderUpsellStep4(variant){
    switch(variant){
      case 'A': return `<div class="up-card"><b>Пока машина у нас</b><p>Если оставите её подольше, можно заодно помыть или почистить салон.</p><button class="lnk" id="upsell-link">Дополнительные услуги ›</button></div>`;
      case 'B': return `<div class="chip"><span class="pl">+</span><span>Мойка или химчистка,<br>пока машина у нас</span><button class="lnk" id="upsell-link">Посмотреть ›</button></div>`;
      case 'C': return `<div class="up-card"><b>Пока машина у нас</b><p>Если машина может побыть у нас подольше, успеем ещё и это (время подтвердит мастер)</p><button class="lnk" id="upsell-link">Дополнительные услуги ›</button></div>`;
      case 'D': return `<div class="up-card"><b>Пока машина у нас — помыть её или убрать салон?</b><p></p><button class="lnk" id="upsell-link">Посмотреть варианты ›</button></div>`;
      default: return '';
    }
  }

  function bindStep4(){
    $('#to-step5').addEventListener('click', ()=> guardVoteAction(()=> navigate('step5')));
    $('#price-list-link').addEventListener('click', ()=>openSheet('view'));
    $('#book-again').addEventListener('click', ()=> guardVoteAction(()=>{
      state.previousBookings.push({plate: state.plate || 'Без номера', date: state.selectedDate, time: state.selectedTime});
      state.selectedGroup=null; state.washItems=[]; state.selectedDate=null; state.selectedTime=null;
      state.plate=''; state.plateSkipped=false; state.extras=[];
      navigate('step1');
    }));
    $('#done-btn').addEventListener('click', ()=> guardVoteAction(()=> navigate('end')));
    $('#reschedule').addEventListener('click', ()=>showToast('Функция переноса будет доступна в боевой версии'));
    const upsell = $('#upsell-link');
    if(upsell) upsell.addEventListener('click', ()=>openSheet('add'));
  }

  function refreshVariantBlock(vs){
    const container = $('#variant-block');
    if(!container) return;
    if(vs.screen==='step4'){
      container.innerHTML = renderUpsellStep4(currentVariantId(vs));
      const upsell = $('#upsell-link');
      if(upsell) upsell.addEventListener('click', ()=>openSheet('add'));
    } else if(vs.screen==='thanks'){
      container.innerHTML = renderThanksUpsell(currentVariantId(vs));
      attachThanksDirection();
    }
  }

  function formatDateLong(d){
    if(!d) return 'дата';
    return `${d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
  }

  function renderStep5(app){
    const vs = getVariantForScreen('step5');
    const isForeign = state.invoiceType==='firm' && state.foreignFirm;
    app.innerHTML = `
      ${renderVoteBar(vs)}
      <section class="screen" data-screen="step5">
        <h2>Данные для счёта и автомобиля</h2>
        <div class="top"><span class="optbadge">НЕОБЯЗАТЕЛЬНО</span>
          <p class="note">Запись ${state.bookingNo} уже создана. Заполните, что знаете — остальное уточним в сервисе.</p>
        </div>
        <div class="blk">
          <h3>Счёт выставить на</h3>
          <div class="toggle" id="invoice-toggle">
            <button type="button" class="${state.invoiceType==='person'?'on':''}" data-type="person" aria-pressed="${state.invoiceType==='person'}">Частное лицо</button>
            <button type="button" class="${state.invoiceType==='firm'?'on':''}" data-type="firm" aria-pressed="${state.invoiceType==='firm'}">Фирма</button>
          </div>
        </div>
        <div id="firm-fields" style="${state.invoiceType==='firm'?'':'display:none'}">
          <label class="cb"><input type="checkbox" id="foreign-check" ${state.foreignFirm?'checked':''}><span class="box ${state.foreignFirm?'on':''}"></span><span>Иностранная фирма</span></label>
          <div class="field country" id="country-wrap" style="${isForeign?'':'display:none'}">
            <label class="l">Страна фирмы <span class="req">*</span></label>
            <div class="combo" id="firm-country-combo">
              <div class="srch"><svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
                <input id="firm-country-search" type="text" placeholder="Поиск страны или кода…" autocomplete="billing country-name">
              </div>
              <div class="list" id="firm-country-list"></div>
            </div>
          </div>
          <div class="field">
            <label class="l">Название фирмы <span class="req">*</span></label>
            <input class="input" id="firm-name" type="text" autocomplete="billing organization" placeholder="${state.foreignFirm?'':'… OÜ'}" value="${escapeHtml(state.firmName)}">
          </div>
          <div class="field">
            <label class="l">Рег. код <span class="req">*</span></label>
            <input class="input" id="reg-code" type="text" inputmode="numeric" autocomplete="off" value="${escapeHtml(state.regCode)}">
          </div>
          <div class="field">
            <label class="l">${state.foreignFirm?'VAT-номер':'НДС-номер (KMKR)'} <span class="opt">необязательно</span></label>
            <input class="input" id="vat" type="text" autocomplete="off" value="${escapeHtml(state.vat)}">
          </div>
          <div class="addr">
            <div class="field"><label class="l">Город <span class="req">*</span></label><input class="input" id="city" type="text" autocomplete="billing address-level2" value="${escapeHtml(state.city)}"></div>
            <div class="field"><label class="l">Индекс <span class="req">*</span></label><input class="input" id="zip" type="text" inputmode="${state.foreignFirm?'text':'numeric'}" maxlength="${state.foreignFirm?10:5}" autocomplete="billing postal-code" value="${escapeHtml(state.zip)}"></div>
          </div>
          <div class="field">
            <label class="l">Улица, дом, квартира <span class="req">*</span></label>
            <input class="input" id="street" type="text" autocomplete="billing street-address" value="${escapeHtml(state.street)}">
          </div>
          <div class="field">
            <label class="l">E-mail бухгалтерии <span class="opt">необязательно</span></label>
            <input class="input" id="acc-email" type="email" inputmode="email" autocomplete="work email" placeholder="arved@firma.ee" value="${escapeHtml(state.accountingEmail)}">
            <p class="note" style="margin:6px 0 0;font-size:14px;color:var(--muted)">Сюда отправим счёт.</p>
          </div>
        </div>
        <div class="car">
          <h3>Автомобиль</h3>
          <div class="sum"><div><span>Номер машины</span><b>${state.plateSkipped ? 'Без номера' : state.plate || '—'}</b></div></div>
          <p class="note" style="margin:6px 0 10px;color:var(--muted)">Номера достаточно. Подробности — по желанию.</p>
          <button type="button" class="rowlink" id="car-expander">Здесь можно указать подробные данные автомобиля ›</button>
          <div id="car-details" style="display:none">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
              <div class="field"><label class="l">Марка</label><input class="input" id="car-make" type="text" autocomplete="off" value="${escapeHtml(state.carMake)}"></div>
              <div class="field"><label class="l">Модель</label><input class="input" id="car-model" type="text" autocomplete="off" value="${escapeHtml(state.carModel)}"></div>
            </div>
            ${showField('year')}
            ${showField('radius')}
            ${showField('vin')}
          </div>
        </div>
        <div id="variant-block">${renderStep5SaveButton()}</div>
        <button class="button secondary" id="skip-step5">Назад, заполню позже</button>
        ${renderVotePanel(vs)}
      </section>`;
    function showField(name){
      const g = state.selectedGroup;
      if(name==='year') return (g && g!=='wash') ? `<div class="field"><label class="l">Год выпуска</label><input class="input" id="car-year" type="text" inputmode="numeric" value="${escapeHtml(state.carYear)}"></div>` : '';
      if(name==='radius') return (g==='tire') ? `<div class="field"><label class="l">Радиус колёс</label><select class="input" id="car-radius"><option>Не указано</option>${['R13','R14','R15','R16','R17','R18','R19','R20','R21','R22'].map(r=>`<option ${state.carRadius===r?'selected':''}>${r}</option>`).join('')}</select></div>` : '';
      if(name==='vin') return (g==='insurance'||g==='body') ? `<div class="field"><label class="l">VIN</label><input class="input" id="car-vin" type="text" maxlength="17" value="${escapeHtml(state.carVIN)}"></div>` : '';
      return '';
    }
    bindStep5();
  }

  function renderStep5SaveButton(){
    const variant = currentVariantId(getVariantForScreen('step5'));
    const label = variant==='B'?'Сохранить данные':'Сохранить';
    return `<button class="button primary" id="save-step5">${label}</button>`;
  }
  function updateStep5SaveButton(){
    const btn = $('#save-step5');
    if(!btn) return;
    const variant = currentVariantId(getVariantForScreen('step5'));
    btn.textContent = variant==='B'?'Сохранить данные':'Сохранить';
  }

  function captureStep5(){
    const v = sel => { const el=$(sel); return el ? el.value.trim() : ''; };
    if(!$('#firm-name')) return;
    state.firmName = v('#firm-name'); state.regCode = v('#reg-code'); state.vat = v('#vat');
    state.city = v('#city'); state.zip = v('#zip'); state.street = v('#street');
    state.accountingEmail = v('#acc-email');
    state.carMake = v('#car-make'); state.carModel = v('#car-model');
    state.carYear = v('#car-year'); state.carRadius = v('#car-radius'); state.carVIN = v('#car-vin');
  }

  function bindStep5(){
    $('#save-step5').addEventListener('click', ()=>{
      guardVoteAction(()=>{
        captureStep5();
        // Company: name, reg. code, city, postal code, street are required (owner decision 19.10 01:26)
        if(state.invoiceType==='firm'){
          const req = ['#firm-name','#reg-code','#city','#zip','#street'];
          if(state.foreignFirm) req.unshift('#firm-country-search');
          const empty = req.map(sel=>$(sel)).filter(el=>el && !el.value.trim());
          req.forEach(sel=>{ const el=$(sel); if(el){ el.classList.toggle('invalid', !el.value.trim()); el.setAttribute('aria-invalid', String(!el.value.trim())); } });
          if(empty.length){ empty[0].scrollIntoView({behavior:'smooth', block:'center'}); empty[0].focus({preventScroll:true}); return; }
        }
        navigate('thanks');
      });
    });
    $('#skip-step5').addEventListener('click', ()=>navigate('step4'));
    $('#invoice-toggle').addEventListener('click', e=>{
      const type = e.target.dataset.type;
      if(type){ captureStep5(); state.invoiceType = type; renderStep5($('#app')); }
    });
    $('#foreign-check').addEventListener('change', e=>{
      captureStep5();
      state.foreignFirm = e.target.checked;
      renderStep5($('#app'));
    });
    $('#car-expander').addEventListener('click', ()=>{
      const el = $('#car-details');
      el.style.display = el.style.display==='none'?'block':'none';
    });
    if(state.foreignFirm) renderFirmCountryList();
  }

  function renderFirmCountryList(){
    const list = $('#firm-country-list');
    if(!list) return;
    list.innerHTML = FOREIGN_COUNTRIES.map(c=>`<button type="button" role="option" class="r ${state.firmCountry===c[1]?'on':''}" data-country="${c[1]}">${c[0]} ${c[1]} <span class="c">${c[2]}</span></button>`).join('');
    list.querySelectorAll('.r').forEach(r=>{
      r.addEventListener('click', ()=>{
        state.firmCountry = r.dataset.country;
        const input = $('#firm-country-search');
        if(input) input.value = state.firmCountry;
        list.querySelectorAll('.r').forEach(x=>x.classList.toggle('on', x===r));
      });
    });
    const search = $('#firm-country-search');
    if(search){
      search.addEventListener('input', ()=>{
        const q = search.value.trim().toLowerCase();
        const filtered = FOREIGN_COUNTRIES.filter(c=>c[1].toLowerCase().includes(q)||c[2].toLowerCase()===q);
        list.innerHTML = filtered.map(c=>`<button type="button" role="option" class="r ${state.firmCountry===c[1]?'on':''}" data-country="${c[1]}">${c[0]} ${c[1]} <span class="c">${c[2]}</span></button>`).join('');
        list.querySelectorAll('.r').forEach(r=>{
          r.addEventListener('click', ()=>{
            state.firmCountry = r.dataset.country;
            search.value = state.firmCountry;
            list.querySelectorAll('.r').forEach(x=>x.classList.toggle('on', x===r));
          });
        });
      });
    }
  }

  function renderThanks(app){
    const vs = getVariantForScreen('thanks');
    app.innerHTML = `
      ${renderVoteBar(vs)}
      <section class="screen" data-screen="thanks">
        <div class="ok"><span class="circle"><svg class="icon"><use href="#i-check"/></svg></span><h3>Спасибо, данные сохранены</h3></div>
        <div class="sum">
          <div><span>Запись</span><b>${state.bookingNo} · ${formatDateLong(state.selectedDate)} · ${state.selectedTime||''}</b></div>
          <div><span>Счёт на</span><b>${invoiceSummary()}</b></div>
          <div><span>Автомобиль</span><b>${state.plateSkipped?'Без номера':state.plate||'—'}</b></div>
        </div>
        ${state.extras.length ? `<p class="note" style="margin:0;color:var(--muted)">Добавлено: ${state.extras.map(id=>serviceName(id)).join(', ')}</p>` : ''}
        <div id="variant-block">${renderThanksUpsell(currentVariantId(vs))}</div>
        <button class="button secondary" id="book-again-thanks">Записать ещё одну машину</button>
        <button class="button secondary" id="done-thanks" style="min-height:48px;background:transparent;border:none;color:var(--muted)">Готово</button>
        ${renderVotePanel(vs)}
      </section>`;
    $('#book-again-thanks').addEventListener('click', ()=> guardVoteAction(()=>{
      state.previousBookings.push({plate: state.plate || 'Без номера', date: state.selectedDate, time: state.selectedTime});
      state.selectedGroup=null; state.washItems=[]; state.selectedDate=null; state.selectedTime=null;
      state.plate=''; state.plateSkipped=false; state.extras=[];
      navigate('step1');
    }));
    $('#done-thanks').addEventListener('click', ()=> guardVoteAction(()=> navigate('end')));
    attachThanksDirection();
  }

  function invoiceSummary(){
    if(state.invoiceType==='person') return 'Частное лицо';
    return `Фирма · ${state.firmName||'—'}`;
  }

  function renderThanksUpsell(variant){
    const dirs = S.thanks_directions || [];
    const dirRows = dirs.map((d)=>{
      const icon = d.id==='dir_body'?'i-car':d.id==='dir_wash'?'i-wash':d.id==='dir_dry'?'i-list':'i-check';
      return `<button type="button" class="drow ${d.id==='dir_wash'?'main':''}" data-dir="${d.id}">
        <svg class="icon"><use href="#${icon}"/></svg>
        <span class="t">${d.title}<small>${d.hint||''}</small></span>
        <svg class="icon chev"><use href="#i-right"/></svg>
      </button>`;
    }).join('');
    switch(variant){
      case 'A':
        return `<div class="dir"><p class="q">Можете оставить машину подольше?</p><p class="qs">Тогда успеем сделать ещё что-нибудь. Выберите, что интересно:</p>${dirRows}<p class="qs2">Время подтвердит мастер.</p></div>`;
      case 'B':
        return `<div class="hero-up"><p class="t">Успеем сделать ещё</p><p>Если машина может побыть у нас подольше, успеем ещё и это (время подтвердит мастер)</p>
          <div class="tiles">${dirs.map((d)=>{
            const icon = d.id==='dir_body'?'i-car':d.id==='dir_wash'?'i-wash':d.id==='dir_dry'?'i-list':'i-check';
            return `<button type="button" class="tile" data-dir="${d.id}"><svg class="icon"><use href="#${icon}"/></svg><b>${d.title}</b><small>${d.hint||''}</small></button>`;
          }).join('')}</div></div>`;
      case 'C':
        return `<div class="dir"><p class="q">Пока машина у нас</p><p class="qs">Если не спешите её забирать, можно сделать ещё что-то. Например, заодно помыть:</p>${dirRows}<p class="qs2">Можно и потом, при визите. Время подтвердит мастер.</p></div>`;
      case 'D':
        return `<div class="dir"><p class="q">Успеем сделать ещё</p><p class="qs">Если машина может побыть у нас подольше, успеем ещё и это (время подтвердит мастер)</p>${dirRows}</div>`;
      default: return '';
    }
  }

  function attachThanksDirection(){
    const app = $('#app');
    app.addEventListener('click', e=>{
      const dir = e.target.closest('[data-dir]');
      if(!dir) return;
      const id = dir.dataset.dir;
      if(id==='dir_body'){
        openInfo('body');
      } else {
        const d = (S.thanks_directions||[]).find(x=>x.id===id);
        if(d && d.sheet){
          openSheet('add');
          setTimeout(()=>{
            const sections = $('#sheet-list .g');
            if(sections){
              const target = Array.from(sections).find(g=>g.textContent===d.sheet);
              if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
            }
          }, 50);
        }
      }
    });
  }

  function renderEnd(app){
    const votesSummary = VOTE_SCREENS.map(vs=>{
      const selected = state.votes[vs.id]||[];
      const missing = selected.length===0;
      return `<div class="sum" style="margin-top:0">
        <div><span>${vs.title}</span><b>${selected.length?selected.join(', '):'<span style="color:var(--amber)">не отмечено</span>'}</b></div>
        ${missing?`<button type="button" class="link" data-go="${vs.screen}">Вернуться к экрану</button>`:''}
      </div>`;
    }).join('');
    app.innerHTML = `
      <section class="screen" data-screen="end">
        <h2>Конец прототипа</h2>
        <p>Спасибо! Вы прошли запись.</p>
        <h3>Ваши отметки</h3>
        ${votesSummary}
        <div class="field">
          <label class="l" for="general-comment">Общий комментарий (необязательно)</label>
          <textarea class="vp-comment" id="general-comment" placeholder="Что понравилось или было непонятно"></textarea>
        </div>
        <button class="button primary" id="send-votes">Отправить ответы</button>
        <div id="send-status" class="note" style="margin:0;color:var(--muted)"></div>
      </section>`;
    app.addEventListener('click', e=>{
      const go = e.target.closest('[data-go]');
      if(go){ navigate(go.dataset.go); }
    });
    $('#send-votes').addEventListener('click', sendVotes);
    if(state.submitted){
      $('#send-status').textContent = 'Вы уже отправляли, но можете отправить ещё раз.';
    }
  }

  function sendVotes(){
    const general = $('#general-comment').value.trim();
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
    localStorage.setItem(PAYLOAD_KEY, JSON.stringify(payload));
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
      status.innerHTML = 'Не удалось отправить, ответ сохранён в этом браузере <button class="button secondary" id="retry-send">Попробовать ещё раз</button>';
      $('#retry-send').addEventListener('click', sendVotes);
    });
  }

  // ---------- voting UI ----------
  function renderVoteBar(vs){
    const variants = vs.variants.map(v=>{
      const active = currentVariantId(vs)===v.id;
      return `<button type="button" class="${active?'on':''}" data-variant="${v.id}" aria-pressed="${active}">${v.id}</button>`;
    }).join('');
    return `<div class="vote-bar"><p class="vt">Варианты этого экрана:</p><div class="vote-switch">${variants}</div></div>`;
  }
  function renderVotePanel(vs){
    const selected = state.votes[vs.id]||[];
    const opts = vs.variants.map(v=>{
      const checked = selected.includes(v.id);
      return `<label class="vp-option"><input type="checkbox" ${checked?'checked':''} value="${v.id}"><span class="box ${checked?'on':''}"></span><span><b>${v.id} —</b> ${v.label.replace('A — ','').replace('B — ','').replace('C — ','').replace('D — ','')}</span></label>`;
    }).join('');
    return `<div class="vote-panel" id="vote-panel"><h4>Голосование</h4><p>Выберите один или несколько понравившихся вариантов</p><div id="vote-msg" class="vote-msg hidden"></div>${opts}
      <textarea class="vp-comment" placeholder="Комментарий (необязательно)" data-vote-comment="${vs.id}">${escapeHtml(voteComment(vs.id))}</textarea></div>`;
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
    if(msg && (state.votes[vs.id]||[]).length > 0) msg.classList.add('hidden');
  }

  // global delegation
  document.addEventListener('click', e=>{
    const proto = e.target.closest('#proto-answers');
    if(proto){
      const vs = VOTE_SCREENS.find(v=>v.screen===state.screen);
      if(vs && (state.votes[vs.id]||[]).length===0){
        guardVoteAction(()=> navigate('end'));
      } else {
        navigate('end');
      }
      return;
    }
    const vb = e.target.closest('.vote-switch button');
    if(vb){
      const vs = VOTE_SCREENS.find(v=>v.screen===state.screen);
      if(vs) setDisplayVariant(vs, vb.dataset.variant);
      return;
    }
  });
  document.addEventListener('change', e=>{
    const vp = e.target.closest('.vp-option input[type=checkbox]');
    if(vp){
      const vs = VOTE_SCREENS.find(v=>v.screen===state.screen);
      if(vs){
        const arr = state.votes[vs.id] = state.votes[vs.id]||[];
        if(vp.checked){ if(!arr.includes(vp.value)) arr.push(vp.value); }
        else state.votes[vs.id] = arr.filter(x=>x!==vp.value);
        saveVotes();
        updateVotePanelUI(vs);
      }
      return;
    }
  });
  document.addEventListener('input', e=>{
    const vc = e.target.closest('[data-vote-comment]');
    if(vc){
      setVoteComment(vc.dataset.voteComment, vc.value);
    }
  });

  // ---------- bootstrap ----------
  function escapeHtml(s){
    return String(s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  window.__proto = { get state(){ return state; }, go: showScreen };

  function init(){
    const url = new URLSearchParams(location.search);
    if(url.get('screen')) initFromQuery();
    else if(!location.hash) navigate('start');
    else showScreen(location.hash.replace('#',''));
  }
  init();

})();
