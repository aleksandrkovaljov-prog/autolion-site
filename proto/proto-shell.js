// Prototype harness (not part of the form): phone frame on desktop, service bars above/below the phone.
// Keeps the phone screen = ONLY the form: moves the vote switcher / vote panel out of #app and removes mockup labels.
(function(){
  'use strict';
  var root=document.documentElement, dev=document.getElementById('device'), stage=document.getElementById('stage');
  var app=document.getElementById('app'), scr=document.getElementById('screen');
  var vsw=document.getElementById('proto-vsw'), slot=document.getElementById('vote-slot'), title=document.getElementById('proto-title');
  var top=document.getElementById('proto-top');
  var DEV={p17:[402,874],p17max:[440,956],se:[375,667],android:[412,915]};
  var TITLES={step4:'Экран с вариантами 1 из 3 · Шаг 4 — допродажа:',step5:'Экран с вариантами 2 из 3 · Шаг 5 — главная кнопка:',thanks:'Экран с вариантами 3 из 3 · «Спасибо, данные сохранены»:'};
  var mq=window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:700px)');
  var q=new URLSearchParams(location.search);
  function framed(){ return q.get('frame')==='1' || (q.get('frame')!=='0' && mq.matches); }
  function setDev(id){
    if(!DEV[id]) id='p17';
    dev.setAttribute('data-dev',id);
    try{ localStorage.setItem('autolion_proto_device',id); }catch(e){}
    document.querySelectorAll('#proto-dev [data-dev]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-dev')===id); });
    fit();
  }
  function fit(){
    root.classList.toggle('framed', framed());
    if(!framed()){ dev.style.removeProperty('--k'); stage.style.height=''; return; }
    var d=DEV[dev.getAttribute('data-dev')]||DEV.p17, h=d[1]+28;
    var avail=window.innerHeight-top.offsetHeight-70;
    var k=Math.max(0.5,Math.min(1,avail/h));
    dev.style.setProperty('--k',k.toFixed(3));
    stage.style.height=Math.ceil(h*k+10)+'px';
  }
  var lastScreen=null;
  function relocate(){
    var st=window.__proto&&window.__proto.state, screen=st?st.screen:null;
    if(screen!==lastScreen){
      lastScreen=screen; vsw.textContent=''; slot.textContent='';
      if(framed()) scr.scrollTop=0;
    }
    // mockup labels («МАКЕТ», «ВАРИАНТ X», prototype tags) never inside the phone screen
    app.querySelectorAll('.crumb .mock, .crumb #vtag, .crumb .ans').forEach(function(n){ n.remove(); });
    var sw=app.querySelector('.vsw');
    if(sw){ vsw.textContent=''; while(sw.firstChild) vsw.appendChild(sw.firstChild); sw.remove(); }
    var vp=app.querySelector('#vote-panel, .vote-panel');
    if(vp){ slot.textContent=''; slot.appendChild(vp); }
    title.textContent=vsw.childNodes.length?(TITLES[screen]||'Варианты:'):'';
    title.parentNode.style.display=vsw.childNodes.length?'':'none';
    // trailing whitespace left in the crumb after removing the tags
    app.querySelectorAll('.crumb').forEach(function(c){ var l=c.lastChild; while(l&&l.nodeType===3&&!l.textContent.trim()){ var p=l.previousSibling; l.remove(); l=p; } if(l&&l.nodeType===3) l.textContent=l.textContent.replace(/\s+$/,''); });
  }
  var busy=false;
  new MutationObserver(function(){ if(busy) return; busy=true; try{ relocate(); }catch(e){ console.error(e); } busy=false; }).observe(app,{childList:true,subtree:true});
  document.getElementById('proto-dev').addEventListener('click',function(e){
    var b=e.target.closest('[data-dev]'); if(!b) return;
    var id=b.getAttribute('data-dev');
    if(id==='reload'){ location.reload(); return; }
    setDev(id);
  });
  window.addEventListener('resize',fit);
  if(mq.addEventListener) mq.addEventListener('change',fit);
  var saved=null; try{ saved=localStorage.getItem('autolion_proto_device'); }catch(e){}
  setDev(q.get('dev')||saved||'p17');
  // in the frame the form scrolls inside #screen: make window.scrollTo(0,0) from the app reset the phone screen too
  var ws=window.scrollTo.bind(window);
  window.scrollTo=function(x,y){ if(framed()&&typeof x==='number'&&y===0) scr.scrollTop=0; return ws.apply(window,arguments); };
  relocate();
})();
