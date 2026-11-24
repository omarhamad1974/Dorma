import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import { $, $$, ARROW_SVG, applyTheme, buttonEl, captionEl, ease, emphasize, esc, eyebrowEl, h, ioEase, isMoving, mediaBox, mediaNode, pad, reduce, renderFlow, revealTitle, runAction } from './core';
import { Store } from './store';
import { A } from './data';

/* ================= SITE RENDERER ================= */
const Site = { cfg:null, page:null, preview:false, disposers:[], triggers:[] };
function disposePage(){
  Site.disposers.splice(0).forEach(f=>{ try{ f(); }catch(e){} });
  if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(t=>t.kill());
  gsap.globalTimeline.getChildren(true,true,true).forEach(t=>t.kill());
}
function onWin(type,fn,opts){ addEventListener(type,fn,opts); Site.disposers.push(()=>removeEventListener(type,fn,opts)); }

function renderSite(cfg,pageId){
  disposePage(); closeModal(true);
  Site.cfg=cfg; applyTheme(cfg); gsap.globalTimeline.timeScale(+cfg.motion.speed||1);
  const pages=cfg.pages||[], page=pages.find(p=>p.id===pageId)||pages.find(p=>p.id===cfg.site.homePage)||pages[0];
  const app=$("#app"); app.textContent=""; scrollTo(0,0);
  if (!page){ app.append(h("div",{class:"denied"},h("div",{},h("p",{class:"lede",text:"This site has no pages yet."})))); return; }
  Site.page=page; document.title=(page.title?page.title+" · ":"")+(cfg.site.brand||"Site");
  app.append(siteHeader(cfg,page));
  const main=h("main",{id:"main"});
  const first=page.sections[0], heroFirst=first && (first.type==="heroCarousel"||first.type==="hero");
  if (page.layout==="console"){
    const wrap=h("div",{class:"wrap console"}), rail=h("aside",{class:"rail","aria-label":"On this page"}), ol=h("ol"), body=h("div",{class:"console-main"});
    let n=0;
    page.sections.forEach(sec=>{
      const el=buildSection(cfg,sec,page); if (!el) return; el.id="sec-"+sec.id; body.append(el);
      if (sec.eyebrow && sec.type!=="hero" && sec.type!=="heroCarousel"){ n++; const a=h("a",{href:"#"+page.id,"data-sec":sec.id,html:`<span>${pad(n)}</span>${esc(sec.eyebrow)}`});
        a.addEventListener("click",e=>{ e.preventDefault(); el.scrollIntoView({behavior:reduce?"auto":"smooth"}); }); ol.append(h("li",{},a)); }
    });
    rail.append(ol); wrap.append(rail,body); main.append(wrap);
  } else {
    page.sections.forEach(sec=>{ const el=buildSection(cfg,sec,page); if (el){ el.id="sec-"+sec.id; main.append(el); } });
  }
  if (!heroFirst && page.layout!=="console") main.style.paddingTop="110px";
  app.append(main, h("footer",{class:"wrap site-foot"},h("span",{class:"mono",text:cfg.site.footer||""}),h("span",{class:"mono",html:`<b>${esc(page.title||"")}</b>`})));
  if (Site.preview) app.append(studioPill(cfg));
  requestAnimationFrame(()=>afterRender(cfg,page));
}
function siteHeader(cfg,page){
  const nav=h("nav",{class:"site-nav","aria-label":"Main"});
  (cfg.pages||[]).filter(p=>p.nav).forEach(p=>{ const a=h("a",{href:"#"+p.id,text:p.title}); if (p.id===page.id) a.setAttribute("aria-current","page"); a.addEventListener("click",()=>nav.classList.remove("open")); nav.append(a); });
  const home=h("a",{class:"brand",href:"#"+(cfg.site.homePage||"home")},h("span",{class:"mark"}),cfg.site.brand||"");
  const menu=h("button",{class:"menu-btn",type:"button","aria-label":"Menu",html:'<svg viewBox="0 0 16 16"><path d="M2 5h12M2 11h12"/></svg>',onclick:()=>nav.classList.toggle("open")});
  const cta=cfg.site.cta&&cfg.site.cta.label?h("button",{class:"pill cta-pill",type:"button",text:cfg.site.cta.label,onclick:()=>runAction(cfg,cfg.site.cta.action)}):null;
  const sp=Site.preview?null:studioPill(cfg);
  return h("header",{class:"site-head"},h("div",{class:"wrap"},home,nav,h("div",{style:"display:flex;gap:10px;align-items:center"},sp,cta,menu)));
}
function studioPill(cfg){
  const box=h("div",{class:"studio-pill"+(Site.preview?" floating":"")});
  if (Site.preview){
    box.append(h("span",{class:"draft-flag",text:"Draft preview"}), h("button",{class:"pill",type:"button",text:"Back to studio",onclick:()=>{ location.hash="admin"; }}));
  } else if (Store.canEdit && cfg.site.showStudioLink!==false){
    box.append(h("button",{class:"pill",type:"button",text:"Open studio",onclick:()=>{ location.hash="admin"; }}));
  }
  return box;
}

/* ---------- sections ---------- */
function buildSection(cfg,sec,page){
  const f=SECTIONS[sec.type]; if (!f) return null;
  try { return f(cfg,sec,page); } catch(e){ console.error("section",sec.type,e); return null; }
}
const SECTIONS={
  heroCarousel(cfg,sec){
    const slides=(sec.slides||[]).filter(Boolean); if (!slides.length) return null;
    const M=cfg.motion, root=h("section",{class:"hc","aria-roledescription":"carousel","aria-label":"Featured"});
    const stage=h("div",{class:"stage"}), wipe=h("div",{class:"wipe"});
    root.append(stage,wipe,h("div",{class:"shade-hero"}));
    if (cfg.theme.grain) root.append(h("div",{class:"grain"}));
    const S=slides.map((s,i)=>{ const el=h("div",{class:"slide","aria-hidden":"true"}), par=h("div",{class:"par"}); const node=mediaNode(cfg,s.media,{w:1920,hh:1080}); if (node) par.append(node); el.append(par); stage.append(el); return {el,par,node}; });
    const eyeIdx=h("span",{text:"01",style:"color:var(--accent)"}), eyeTxt=h("span",{class:"txt"}), rule=h("span",{style:"width:56px;height:1px;background:var(--faint);transform-origin:left;display:inline-block"});
    const eyebrow=h("p",{class:"eyebrow",style:"--x:0"},eyeIdx,rule,eyeTxt); eyebrow.classList.add("no-after"); eyebrow.style.setProperty("gap","14px");
    const title=h("h1",{class:"title"}), lede=h("p",{class:"lede"});
    const content=h("div",{class:"content","aria-live":"polite"},eyebrow,title,lede);
    let cur=0, busy=false, prog=null, t0=performance.now();
    const fl=sec.flowId?renderFlow(cfg,sec.flowId,{onItem:(i,it,b)=>{ if (sec.flowDrivesSlides && i<S.length && i!==cur) go(i); runAction(cfg,it.action,{flow:fl.flow,index:i,goSlide:go}); }}):null;
    if (fl) content.append(fl.el);
    const curEl=h("b",{text:"01"}), tc=h("span",{text:"00:00:00:00"}), scn=h("span",{text:"SC 01"});
    const prev=h("button",{class:"arrow",type:"button","aria-label":"Previous slide",html:'<svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5"/></svg>'});
    const next=h("button",{class:"arrow",type:"button","aria-label":"Next slide",html:'<svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5"/></svg>'});
    const foot=h("div",{class:"foot"},h("div",{class:"counter"},curEl,h("span",{text:"/ "+pad(S.length)})),
      sec.hud?h("div",{class:"tc mono"},h("span",{class:"rec"}),scn," · ",tc," · 2.39:1"):h("span"), h("div",{class:"arrows"},prev,next));
    root.append(h("div",{class:"chrome"},h("div",{class:"wrap"},content,foot)));
    $(".eyebrow",root).style.cssText+=";";
    const style=document.createElement("style"); style.textContent=".hc .eyebrow::after{display:none}"; root.append(style);

    const kb=i=>{ const n=S[i].node; if (!n || reduce || !M.kenBurns) return; const z=+M.kbZoom||1.18, dirs=[[-1.5,1],[1.5,0],[1,-1],[0,1]][i%4];
      gsap.fromTo(n,{scale:i%2?1.03:z,xPercent:dirs[0],yPercent:dirs[1]},{scale:i%2?z:1.03,xPercent:-dirs[0],yPercent:-dirs[1],duration:+M.kbDuration||10,ease:"sine.inOut",overwrite:true}); };
    const setActive=i=>{ curEl.textContent=pad(i+1); scn.textContent="SC "+pad(i+1); if (fl && sec.flowDrivesSlides && i<fl.btns.length) fl.setActive(i); };
    const startProg=i=>{ prog&&prog.kill(); const dur=(+M.slideDuration||7)*(reduce?1.6:1);
      const bar=fl&&sec.flowDrivesSlides&&fl.btns[i]?$(".bar-fill",fl.btns[i]):null;
      if (fl) fl.btns.forEach(b=>gsap.set($(".bar-fill",b),{scaleX:0}));
      prog=gsap.fromTo(bar||{p:0},bar?{scaleX:0}:{p:0},bar?{scaleX:1,duration:dur,ease:"none",onComplete:()=>go((cur+1)%S.length,1)}:{p:1,duration:dur,ease:"none",onComplete:()=>go((cur+1)%S.length,1)});
      if (modalIsOpen()) prog.pause(); };
    Site.pauseHero=()=>prog&&prog.pause(); Site.resumeHero=()=>prog&&prog.resume();
    const textIn=(delay=0)=>{ const s=slides[cur]; eyeIdx.textContent=pad(cur+1); eyeTxt.textContent=s.eyebrow||""; lede.textContent=s.lede||"";
      const tl=gsap.timeline({delay}); tl.add(revealTitle(cfg,title,s.title||"",0),0);
      if (!reduce){ tl.fromTo(rule,{scaleX:0},{scaleX:1,duration:.9,ease:ease(cfg)},0).fromTo([eyeIdx,eyeTxt],{yPercent:100,autoAlpha:0},{yPercent:0,autoAlpha:1,duration:.7,ease:"power3.out",stagger:.08},.05)
        .fromTo(lede,{y:18,autoAlpha:0,filter:"blur(8px)"},{y:0,autoAlpha:1,filter:"blur(0px)",duration:1,ease:"power3.out"},.25); }
      return tl; };
    const textOut=()=>reduce?gsap.timeline():gsap.timeline().to(title.children.length?$$(".c,.wi",title):title,{yPercent:-115,autoAlpha:title.classList.contains("split-chars")?1:0,duration:.55,ease:"power3.in",stagger:.01})
      .to([eyeIdx,eyeTxt],{yPercent:-100,autoAlpha:0,duration:.4,ease:"power2.in"},0).to(lede,{y:-12,autoAlpha:0,duration:.45,ease:"power2.in"},.05);
    function go(n,dir){
      if (busy||n===cur||!S[n]) return; busy=true; prog&&prog.kill(); dir=dir??(n>cur?1:-1);
      const a=S[cur], b=S[n], T=M.transition, D=1.5, E=ioEase(cfg);
      gsap.set(b.el,{zIndex:2,visibility:"visible",clipPath:"inset(0% 0% 0% 0%)",opacity:1,scale:1,xPercent:0}); gsap.set(a.el,{zIndex:1});
      b.el.setAttribute("aria-hidden","false"); a.el.setAttribute("aria-hidden","true");
      kb(n); cur=n; setActive(n);
      const tl=gsap.timeline({onComplete(){ gsap.set(a.el,{visibility:"hidden",zIndex:0,opacity:1,scale:1,xPercent:0}); gsap.set(a.par,{xPercent:0}); busy=false; startProg(cur); }});
      tl.add(textOut(),0);
      if (reduce || T==="fade") tl.fromTo(b.el,{opacity:0},{opacity:1,duration:reduce?.6:1.4,ease:"power1.inOut"},0);
      else if (T==="slide") tl.fromTo(b.el,{xPercent:100*dir},{xPercent:0,duration:D,ease:E},0).to(a.el,{xPercent:-35*dir,duration:D,ease:E},0);
      else if (T==="zoom") tl.fromTo(b.el,{opacity:0,scale:1.25},{opacity:1,scale:1,duration:D,ease:E},0).to(a.el,{scale:.9,opacity:0,duration:D,ease:E},0);
      else tl.fromTo(b.el,{clipPath:dir>0?"inset(0% 0% 0% 100%)":"inset(0% 100% 0% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:D,ease:E},0)
            .fromTo(b.par,{xPercent:12*dir},{xPercent:0,duration:D,ease:E},0).to(a.par,{xPercent:-8*dir,duration:D,ease:E},0)
            .fromTo(wipe,{left:dir>0?"100%":"0%",opacity:1},{left:dir>0?"0%":"100%",duration:D,ease:E},0).to(wipe,{opacity:0,duration:.3},1.25);
      tl.add(()=>{ textIn(); t0=performance.now(); },.75);
    }
    prev.addEventListener("click",()=>go((cur-1+S.length)%S.length,-1));
    next.addEventListener("click",()=>go((cur+1)%S.length,1));
    onWin("keydown",e=>{ if (modalIsOpen()||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; if (e.key==="ArrowRight") next.click(); if (e.key==="ArrowLeft") prev.click(); });
    let sx=null; root.addEventListener("pointerdown",e=>{ if (e.pointerType!=="mouse") sx=e.clientX; });
    root.addEventListener("pointerup",e=>{ if (sx===null) return; const dx=e.clientX-sx; sx=null; if (Math.abs(dx)>50) (dx<0?next:prev).click(); });
    const tick=()=>{ const t=(performance.now()-t0)/1000; tc.textContent=`00:${pad(Math.floor(t/60)%60)}:${pad(Math.floor(t)%60)}:${pad(Math.floor(t*24)%24)}`; };
    gsap.ticker.add(tick); Site.disposers.push(()=>gsap.ticker.remove(tick));
    if (!reduce && M.parallax && matchMedia("(pointer:fine)").matches){
      const qx=gsap.quickTo(stage,"x",{duration:1.2,ease:"power3.out"}), qy=gsap.quickTo(stage,"y",{duration:1.2,ease:"power3.out"});
      onWin("pointermove",e=>{ qx((e.clientX/innerWidth-.5)*-18); qy((e.clientY/innerHeight-.5)*-12); });
    }
    root._after=()=>{
      gsap.set(S[0].el,{visibility:"visible"}); S[0].el.setAttribute("aria-hidden","false"); setActive(0); kb(0);
      if (!reduce) gsap.from(S[0].el,{opacity:0,duration:1.6,ease:"power2.out"});
      if (fl) fl.play(0);
      textIn(.35).eventCallback("onComplete",()=>startProg(0));
    };
    return root;
  },
  hero(cfg,sec,page){
    const root=h("section",{class:"hs h-"+(sec.height||"tall")});
    const box=mediaBox(cfg,sec.media,{ratio:16/9,bleed:true,res:1920}); root.append(box,h("div",{class:"shade-hero"}));
    if (cfg.theme.grain) root.append(h("div",{class:"grain"}));
    const inner=h("div",{class:"wrap inner"});
    const eb=eyebrowEl(sec.num,sec.eyebrow); if (eb){ eb.dataset.in=""; inner.append(eb); }
    const t=h("h1",{class:"display"}); t.textContent=sec.title||""; inner.append(t);
    if (sec.lede) inner.append(h("p",{class:"lede","data-in":"",text:sec.lede}));
    const fl=sec.flowId?renderFlow(cfg,sec.flowId):null; if (fl) inner.append(fl.el);
    root.append(inner);
    root._after=()=>{
      const n=box.firstElementChild; if (n && !reduce && cfg.motion.kenBurns) gsap.fromTo(n,{scale:+cfg.motion.kbZoom||1.16},{scale:1.02,xPercent:-1.5,duration:(+cfg.motion.kbDuration||10)*1.4,ease:"sine.inOut",repeat:-1,yoyo:true});
      revealTitle(cfg,t,sec.title||"",.15);
      if (!reduce) gsap.fromTo($$("[data-in]",root),{y:24,autoAlpha:0},{y:0,autoAlpha:1,duration:1,ease:ease(cfg),stagger:.1,delay:.1});
      if (fl) fl.play(.4);
    };
    return root;
  },
  chapters(cfg,sec){
    const w=h("div",{class:"wrap"});
    (sec.items||[]).forEach((c,i)=>{
      const fig=h("figure",{"data-rv":""},mediaBox(cfg,c.media,{ratio:1.6,badge:pad(i+1),cls:"kb-scrub"}),captionEl(c.caption));
      const txt=h("div",{class:"txt","data-rv":""},h("p",{class:"mono",html:`<b>${pad(i+1)}</b> / ${pad(sec.items.length)}`}),h("h2",{class:"h2",text:c.title||""}),h("p",{class:"lede",text:c.text||""}));
      if ((c.bullets||[]).length) txt.append(h("ul",{class:"blist"},c.bullets.map((b,j)=>h("li",{},h("span",{text:pad(j+1)}),b))));
      const mb=buttonEl(cfg,c.more); if (mb) txt.append(mb);
      w.append(h("article",{class:"chapter"+(i%2?" flip":"")},fig,txt));
    });
    return h("section",{class:"sec"},w);
  },
  stats(cfg,sec){
    const w=h("div",{class:"wrap"}), eb=eyebrowEl(sec.num,sec.eyebrow); if (eb){ eb.dataset.rv=""; eb.style.marginBottom="28px"; w.append(eb); }
    const style=sec.style||"band", grid=h("div",{class:"st-"+style});
    (sec.items||[]).forEach(it=>{
      const num=h("span",{class:"count","data-to":it.value,"data-dec":it.decimals||0,text:fmtNum(it.value,it.decimals)});
      const strong=h("strong",{},num, style==="band"&&it.suffix?h("sup",{text:it.suffix}):(it.suffix||""));
      const cell=h("div",{class:style==="hud"?"hud":"","data-rv":""},h("span",{class:"mono",text:it.label||""}),strong);
      if (style==="hud") cell.append(h("div",{class:"meter"},h("i",{style:`width:${Math.max(0,Math.min(100,+it.meter||0))}%`})));
      if (style==="meters"){ const segs=h("div",{class:"segs"}); const on=Math.round((+it.meter||0)/5); for (let k=0;k<20;k++) segs.append(h("i",{class:k<on?"on":""})); cell.append(segs); }
      grid.append(cell);
    });
    w.append(grid); return h("section",{class:"sec"},w);
  },
  about(cfg,sec){
    const left=h("div",{class:"txt","data-rv":""}); const eb=eyebrowEl(sec.num,sec.eyebrow); if (eb) left.append(eb);
    left.append(h("p",{class:"big",html:emphasize(sec.text||"")}));
    if (sec.link&&sec.link.label){ left.append(h("button",{class:"arrow-link",type:"button",html:esc(sec.link.label)+ARROW_SVG,onclick:()=>runAction(cfg,sec.link.action)})); }
    const g=h("div",{class:"wrap about"+(sec.media?"":" no-media")},left);
    if (sec.media){ const b=mediaBox(cfg,sec.media,{ratio:.75,cls:"kb-scrub",res:900}); b.dataset.rv=""; g.append(b); }
    return h("section",{class:"sec"},g);
  },
  clients(cfg,sec){
    const w=h("div",{class:"wrap"}), eb=eyebrowEl(sec.num,sec.eyebrow); if (eb){ eb.dataset.rv=""; eb.style.marginBottom="28px"; w.append(eb); }
    const items=sec.items||[], wm=(c,i)=>h("span",{class:"wm v"+(i%4),text:c.name||""});
    const s=h("section",{class:"sec"},w);
    if (sec.style==="marquee"){
      [1,-1].forEach((d,row)=>{ const t=h("div",{class:"track"}); const list=row?[...items].reverse():items; for (let k=0;k<2;k++) list.forEach((c,i)=>t.append(wm(c,i+row)));
        s.append(h("div",{class:"marquee"},t)); t._dir=d; });
    } else if (sec.style==="table"){
      w.append(h("div",{class:"tablewrap","data-rv":""},h("table",{},h("thead",{},h("tr",{},["Client","Sector","Since","Work"].map(x=>h("th",{scope:"col",text:x})))),
        h("tbody",{},items.map(c=>h("tr",{},h("td",{text:c.name||""}),h("td",{class:"m",text:c.sector||""}),h("td",{text:c.since||""}),h("td",{class:"m",text:c.work||""})))))));
    } else w.append(h("div",{class:"cl-grid","data-rv":""},items.map(wm)));
    return s;
  },
  grid(cfg,sec){
    const w=h("div",{class:"wrap"}), head=h("div",{class:"head-row","data-rv":""},h("h2",{class:"h2",text:sec.title||""}));
    const count=h("span",{class:"mono"}); head.append(count); w.append(head);
    const grid=h("div",{class:"grid-cards"}), items=sec.items||[];
    const cards=items.map(c=>{ const b=h("button",{class:"card",type:"button","data-tag":c.tag||"","data-rv":""},mediaBox(cfg,c.media,{ratio:4/3,res:800}),captionEl([c.code,c.tag]),h("h3",{class:"h3",text:c.title||""}),h("p",{text:c.text||""}));
      b.addEventListener("click",()=>runAction(cfg,c.action)); grid.append(b); return b; });
    const setCount=n=>count.innerHTML=`<b>${pad(n)}</b> items`; setCount(items.length);
    if (sec.filters){
      const tags=["All",...new Set(items.map(c=>c.tag).filter(Boolean))];
      const fake={id:"_f",name:"Filter",separator:"dots3",size:"s",anim:{mode:"items",preset:"rise",duration:.6,stagger:.05,delay:0},items:tags.map((t,i)=>({id:"t"+i,kind:i?"text":"button",label:t,showIndex:false,action:A()}))};
      const fc=renderFlow({...cfg,flows:[fake]},"_f",{onItem:(i)=>{ fc.setActive(i,{fill:true}); const tag=tags[i]; const show=cards.filter(c=>i===0||c.dataset.tag===tag); setCount(show.length);
        gsap.to(cards,{autoAlpha:0,y:10,duration:.25,ease:"power2.in",onComplete(){ cards.forEach(c=>c.hidden=!show.includes(c)); gsap.fromTo(show,{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:.6,ease:"power3.out",stagger:.06}); }}); }});
      fc.setActive(0,{fill:true}); fc.el.style.marginTop="24px"; w.append(fc.el);
    }
    w.append(grid); return h("section",{class:"sec"},w);
  },
  accordion(cfg,sec){
    const w=h("div",{class:"wrap"}), eb=eyebrowEl(sec.num,sec.eyebrow); if (eb){ eb.dataset.rv=""; eb.style.marginBottom="28px"; w.append(eb); }
    const acc=h("div",{class:"acc"});
    (sec.items||[]).forEach((it,i)=>{
      const row=h("div",{class:"acc-row"+(i===0?" open":""),"data-rv":""}), pid="acc-"+sec.id+"-"+i;
      const btn=h("button",{class:"acc-btn",type:"button","aria-expanded":i===0?"true":"false","aria-controls":pid},h("span",{class:"mono",html:`<b>${pad(i+1)}</b>`}),h("span",{class:"h3",text:it.title||""}),
        h("span",{class:"tags"},(it.tags||[]).map(t=>h("span",{text:t}))),h("span",{class:"plus",html:'<svg viewBox="0 0 12 12"><path d="M6 1v10M1 6h10"/></svg>'}));
      const left=h("div",{},h("p",{text:it.text||""})); const mb=buttonEl(cfg,it.more); if (mb) left.append(mb);
      const panel=h("div",{class:"acc-panel",id:pid,role:"region"},h("div",{class:"acc-in"},left,mediaBox(cfg,it.media,{ratio:1.6,res:900})));
      btn.addEventListener("click",()=>{
        const open=!row.classList.contains("open");
        $$(".acc-row.open",acc).forEach(r=>{ if (r!==row){ r.classList.remove("open"); $(".acc-btn",r).setAttribute("aria-expanded","false"); const p=$(".acc-panel",r); gsap.fromTo(p,{height:p.scrollHeight},{height:0,duration:reduce?0:.6,ease:ioEase(cfg),clearProps:"height"}); } });
        row.classList.toggle("open",open); btn.setAttribute("aria-expanded",open);
        gsap.fromTo(panel,{height:open?0:panel.scrollHeight},{height:open?panel.scrollHeight:0,duration:reduce?0:.65,ease:ioEase(cfg),clearProps:"height",onComplete:()=>window.ScrollTrigger&&ScrollTrigger.refresh()});
      });
      row.append(btn,panel); acc.append(row);
    });
    w.append(acc); return h("section",{class:"sec"},w);
  },
  timeline(cfg,sec){
    const w=h("div",{class:"wrap"}), eb=eyebrowEl(sec.num,sec.eyebrow); if (eb){ eb.dataset.rv=""; eb.style.marginBottom="28px"; w.append(eb); }
    const detail=h("div",{class:"detail","aria-live":"polite"});
    const right=h("div",{class:"txt","data-rv":""});
    const fl=sec.flowId?renderFlow(cfg,sec.flowId,{onItem:(i,it)=>{ show(i,true); runAction(cfg,it.action,{flow:fl.flow,index:i}); }}):null;
    const show=(i,anim)=>{ if (!fl) return; fl.setActive(i,{fill:true}); const it=fl.flow.items[i]; detail.innerHTML=`<small class="mono"><b>${esc(it.label)}</b> · ${pad(i+1)} / ${pad(fl.flow.items.length)}</small><p>${esc(it.detail||"")}</p>`;
      if (anim && !reduce) gsap.fromTo($("p",detail),{autoAlpha:0,y:8},{autoAlpha:1,y:0,duration:.45,ease:"power3.out"}); };
    if (fl){ right.append(fl.el,detail); show(fl.flow.items.length-1,false); }
    w.append(h("div",{class:"tl"},h("p",{class:"about",style:"display:block"},h("span",{class:"big",style:"display:block;margin:0;font-family:var(--display);font-size:clamp(1.3rem,2.3vw,2rem);line-height:1.3;letter-spacing:-.02em",html:emphasize(sec.text||"")})),right));
    const s=h("section",{class:"sec"},w); s._flow=fl; return s;
  },
  flowStrip(cfg,sec){
    const w=h("div",{class:"wrap txt"}), eb=eyebrowEl(sec.num,sec.eyebrow); if (eb) w.append(eb);
    if (sec.title) w.append(h("h2",{class:"h2",text:sec.title}));
    const fl=sec.flowId?renderFlow(cfg,sec.flowId):null; if (fl) w.append(fl.el);
    const s=h("section",{class:"sec"},w); s._flow=fl; return s;
  },
  banner(cfg,sec){
    return h("section",{class:"sec",style:"padding-block:0"},h("div",{class:"wrap banner","data-rv":""},mediaBox(cfg,sec.media,{ratio:2.39,res:1920,cls:"kb-scrub"}),captionEl(sec.caption)));
  },
  cta(cfg,sec){
    const w=h("div",{class:"wrap cta","data-rv":""},h("h2",{class:"display",text:sec.title||""})); const b=buttonEl(cfg,sec.button); if (b) w.append(b);
    return h("section",{class:"sec"},w);
  }
};
function fmtNum(v,dec){ v=+v||0; dec=+dec||0; return dec?v.toFixed(dec):Math.round(v).toLocaleString("en-US"); }

function afterRender(cfg,page){
  const main=$("#main"); if (!main) return;
  $$("section",main).forEach(s=>{ if (s._after) s._after(); });
  const M=cfg.motion, ST=window.ScrollTrigger;
  // scroll reveals: only for things below the first screen, so the page is complete at rest
  if (!reduce && M.scrollReveal!=="none" && ST) $$("[data-rv]",main).forEach(el=>{
    if (el.getBoundingClientRect().top<innerHeight*.9) return;
    gsap.set(el,M.scrollReveal==="fade"?{autoAlpha:0}:{y:36,autoAlpha:0});
    ST.create({trigger:el,start:"top 90%",once:true,onEnter:()=>gsap.to(el,{y:0,autoAlpha:1,duration:1,ease:ease(cfg)})});
  });
  if (!reduce && M.kenBurns && ST) $$(".kb-scrub > canvas,.kb-scrub > img,.kb-scrub > video",main).forEach(n=>gsap.fromTo(n,{scale:1.2},{scale:1,ease:"none",scrollTrigger:{trigger:n.parentNode,start:"top bottom",end:"bottom top",scrub:true}}));
  $$("section",main).forEach(s=>{ if (s._flow && ST){ const fl=s._flow; if (s.getBoundingClientRect().top<innerHeight*.9) fl.play(.2); else { gsap.set(fl.el,{autoAlpha:0}); ST.create({trigger:fl.el,start:"top 92%",once:true,onEnter:()=>{ gsap.set(fl.el,{autoAlpha:1}); fl.play(0); }}); } } });
  $$(".count",main).forEach(el=>{ if (reduce || !M.counters || !ST) return; const to=+el.dataset.to, dec=+el.dataset.dec;
    ST.create({trigger:el,start:"top 92%",once:true,onEnter:()=>{ const o={v:0}; gsap.to(o,{v:to,duration:1.8,ease:"expo.out",onUpdate:()=>el.textContent=fmtNum(o.v,dec)}); }}); });
  $$(".meter i",main).forEach(el=>{ if (reduce||!ST) return; ST.create({trigger:el,start:"top 95%",once:true,onEnter:()=>gsap.fromTo(el,{scaleX:0},{scaleX:1,duration:1.6,ease:"expo.out"})}); });
  $$(".track",main).forEach(t=>{ if (reduce) return; gsap.fromTo(t,{xPercent:t._dir<0?0:-50},{xPercent:t._dir<0?-50:0,duration:36,ease:"none",repeat:-1}); });
  if (page.layout==="console" && ST) $$(".rail a[data-sec]").forEach((a,i)=>{ const s=$("#sec-"+a.dataset.sec); if (!s) return; if (i===0) a.classList.add("on");
    ST.create({trigger:s,start:"top 45%",end:"bottom 45%",onToggle:self=>{ if (self.isActive){ $$(".rail a.on").forEach(x=>x.classList.remove("on")); a.classList.add("on"); } }}); });
  if (ST) ST.refresh();
}

/* ================= MODALS ================= */
const MS={ open:false, tl:null, tweens:[], seq:[], idx:0, opener:null, cfg:null };
const modalIsOpen=()=>MS.open;
function openModal(cfg,id,ctx={}){
  const md=(cfg.modals||[]).find(m=>m.id===id); if (!md) return;
  MS.cfg=cfg; MS.opener=document.activeElement;
  MS.seq = ctx.flow ? ctx.flow.items.filter(it=>it.action&&it.action.type==="modal"&&(cfg.modals||[]).some(m=>m.id===it.action.target)).map(it=>it.action.target) : [id];
  if (!MS.seq.includes(id)) MS.seq=[id];
  MS.idx=MS.seq.indexOf(id);
  const root=$("#modalRoot");
  if (!MS.open){
    root.textContent="";
    const panel=h("div",{class:"panel",role:"dialog","aria-modal":"true"});
    const scrim=h("div",{class:"scrim",onclick:()=>closeModal()});
    root.append(h("div",{class:"modal"},scrim,panel));
    MS.open=true; Site.pauseHero&&Site.pauseHero();
    fillModal(md,panel);
    animateModalIn(cfg,panel,scrim);
  } else { const panel=$(".panel",root); fillModal(md,panel); }
}
function fillModal(md,panel){
  const cfg=MS.cfg; MS.tweens.forEach(t=>t.kill()); MS.tweens=[];
  panel.className="panel t"+md.type; panel.textContent=""; panel.setAttribute("aria-label",(md.kicker?md.kicker+": ":"")+(md.title||""));
  panel.append(h("span",{class:"scan"}),...["a","b","c","d"].map(c=>h("span",{class:"corner "+c})));
  const multi=MS.seq.length>1;
  panel.append(h("header",{class:"m-head","data-anim":""},h("span",{html:multi?`Step <b>${pad(MS.idx+1)}</b> / ${pad(MS.seq.length)}`:`<b>${esc(md.kicker||"")}</b>`}),
    h("span",{class:"m-kind",text:["","Media","Gallery","Flow"][md.type]||""}),
    h("button",{class:"m-close",type:"button","aria-label":"Close",html:'<svg viewBox="0 0 16 16"><path d="M3 3l10 10M13 3 3 13"/></svg>',onclick:()=>closeModal()})));
  const body=h("div",{class:"m-body"});
  const head=[md.kicker?h("p",{class:"eyebrow","data-anim":"",text:md.kicker}):null,h("h2",{class:"m-title","data-anim":"",text:md.title||""})];
  const text=md.text?h("p",{class:"lede","data-anim":"",text:md.text}):null;
  const more=md.more&&md.more.label?h("button",{class:"more","data-anim":"",type:"button",style:"margin-top:6px",html:esc(md.more.label)+ARROW_SVG,onclick:()=>{ const a=md.more.action; closeModal(); setTimeout(()=>runAction(cfg,a),reduce?0:500); }}):null;
  const media=md.media||[];
  if (md.type===2){
    body.append(h("div",{class:"m-intro"},h("div",{class:"m-main"},head),h("div",{class:"m-main"},text,more)));
    const g=h("div",{class:"m-gallery"});
    media.slice(0,3).forEach((mid,k)=>g.append(modalFigure(cfg,mid,[pad(k+1),(md.caption||[])[k]].filter(Boolean),{ratio:.8,res:640,badge:pad(k+1)})));
    body.append(g);
  } else {
    const fig=modalFigure(cfg,media[0],md.caption,{ratio:1.6,res:1280,badge:pad(MS.idx+1)});
    const main=h("div",{class:"m-main"},...head,text);
    if (md.type===3 && md.flowId){
      const det=h("div",{class:"detail","data-anim":"","aria-live":"polite"});
      const fl=renderFlow(cfg,md.flowId,{onItem:(i,it)=>{ show(i,true); if (it.action&&it.action.type!=="none"&&it.action.type!=="modal") runAction(cfg,it.action); }});
      const show=(i,anim)=>{ fl.setActive(i,{fill:true}); const it=fl.flow.items[i]; det.innerHTML=`<small class="mono"><b>${pad(i+1)}</b> / ${pad(fl.flow.items.length)} · ${esc(it.label)}</small><p>${esc(it.detail||"")}</p>`;
        if (anim && !reduce) gsap.fromTo(det,{autoAlpha:0,y:8},{autoAlpha:1,y:0,duration:.45,ease:"power3.out"}); };
      if (fl){ fl.el.dataset.anim=""; main.append(fl.el,det); show(0,false); MS.subflow=fl; }
    } else MS.subflow=null;
    if (more) main.append(more);
    if (md.type===3){ body.append(main,fig); } else body.append(fig,main);
  }
  panel.append(body);
  if (multi){
    const track=h("div",{class:"m-track","aria-hidden":"true"}); MS.seq.forEach((_,k)=>track.append(h("i",{class:k<=MS.idx?"on":""})));
    panel.append(h("footer",{class:"m-foot","data-anim":""},
      h("button",{class:"m-nav",type:"button","aria-label":"Previous",html:'<svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5"/></svg><span class="lbl">Previous</span>',onclick:()=>stepModal(-1)}),track,
      h("button",{class:"m-nav",type:"button","aria-label":"Next",html:'<span class="lbl">Next</span><svg viewBox="0 0 16 16"><path d="M6 3l5 5-5 5"/></svg>',onclick:()=>stepModal(1)})));
  }
  setTimeout(()=>{ const c=$(".m-close",panel); c&&c.focus({preventScroll:true}); },reduce?30:700);
}
function modalFigure(cfg,mid,caption,{ratio,res,badge}){
  const fig=h("figure",{class:"m-fig","data-anim":""});
  const box=mediaBox(cfg,mid,{ratio,res,badge,cls:"m-media"}); fig.append(box,captionEl(caption));
  const n=box.firstElementChild;
  if (n && isMoving(cfg,mid)){
    const PLAY='<svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg>', PAUSE='<svg viewBox="0 0 16 16"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z"/></svg>';
    const btn=h("button",{class:"play",type:"button","aria-label":"Pause video",html:PAUSE}), bar=h("span",{class:"vbar"},h("i"));
    box.append(btn,bar);
    let playing=!reduce;
    if (n.tagName==="VIDEO"){ const upd=()=>{ if (n.duration) gsap.set($("i",bar),{scaleX:n.currentTime/n.duration}); }; n.addEventListener("timeupdate",upd); }
    else { const kb=gsap.fromTo(n,{scale:1},{scale:1.14,xPercent:-2,duration:6,ease:"sine.inOut",repeat:-1,yoyo:true}), pb=gsap.fromTo($("i",bar),{scaleX:0},{scaleX:1,duration:12,ease:"none",repeat:-1}); MS.tweens.push(kb,pb); if (reduce){ kb.pause(); pb.pause(); } n._ctl=[kb,pb]; }
    if (!playing) btn.innerHTML=PLAY;
    btn.addEventListener("click",()=>{ playing=!playing; btn.innerHTML=playing?PAUSE:PLAY; btn.setAttribute("aria-label",playing?"Pause video":"Play video");
      if (n.tagName==="VIDEO") playing?n.play():n.pause(); else n._ctl.forEach(t=>t.paused(!playing)); });
  }
  return fig;
}
function animateModalIn(cfg,panel,scrim){
  const items=$$("[data-anim]",panel), style=cfg.motion.modalOpen;
  MS.tl&&MS.tl.kill(); const tl=MS.tl=gsap.timeline();
  if (reduce){ tl.fromTo([scrim,panel],{autoAlpha:0},{autoAlpha:1,duration:.3}); return; }
  const app=$("#app"); tl.to(app,{autoAlpha:.3,filter:"blur(4px)",duration:.8,ease:"power3.out"},0).fromTo(scrim,{autoAlpha:0},{autoAlpha:1,duration:.6},0);
  if (style==="line"){
    tl.fromTo(panel,{clipPath:"inset(49.6% 50% 49.6% 50%)"},{clipPath:"inset(49.6% 0% 49.6% 0%)",duration:.45,ease:"expo.out"},.05)
      .to(panel,{clipPath:"inset(0% 0% 0% 0%)",duration:.75,ease:"expo.inOut"},.4)
      .fromTo($(".scan",panel),{top:"50%",opacity:1},{top:"100%",duration:.75,ease:"expo.inOut"},.4).to($(".scan",panel),{opacity:0,duration:.3},1.05)
      .fromTo($$(".corner",panel),{scale:0},{scale:1,duration:.5,ease:"back.out(3)",stagger:.05},.9);
  } else if (style==="scale") tl.fromTo(panel,{scale:.85,autoAlpha:0},{scale:1,autoAlpha:1,duration:.8,ease:ease(cfg)},.05);
  else if (style==="slide") tl.fromTo(panel,{yPercent:30,autoAlpha:0},{yPercent:0,autoAlpha:1,duration:.9,ease:ease(cfg)},.05);
  else tl.fromTo(panel,{autoAlpha:0},{autoAlpha:1,duration:.6},.05);
  tl.fromTo(items,{y:18,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,ease:"power3.out",stagger:.06},style==="line"?.75:.3);
  if (MS.subflow) tl.add(()=>MS.subflow.play(0),style==="line"?1:.5);
}
function stepModal(dir){
  if (MS.seq.length<2) return;
  MS.idx=(MS.idx+dir+MS.seq.length)%MS.seq.length;
  const md=MS.cfg.modals.find(m=>m.id===MS.seq[MS.idx]), panel=$("#modalRoot .panel"); if (!md||!panel) return;
  if (reduce){ fillModal(md,panel); return; }
  gsap.to(panel,{autoAlpha:0,x:-24*dir,duration:.25,ease:"power2.in",onComplete(){ fillModal(md,panel); gsap.set(panel,{clipPath:"none"});
    gsap.fromTo(panel,{autoAlpha:0,x:24*dir},{autoAlpha:1,x:0,duration:.45,ease:"power3.out"}); gsap.fromTo($$("[data-anim]",panel),{y:12,autoAlpha:0},{y:0,autoAlpha:1,duration:.5,ease:"power3.out",stagger:.04}); if (MS.subflow) MS.subflow.play(.1); }});
}
function closeModal(instant){
  if (!MS.open) return;
  const root=$("#modalRoot"), panel=$(".panel",root), scrim=$(".scrim",root);
  const done=()=>{ MS.tweens.forEach(t=>t.kill()); root.textContent=""; MS.open=false; gsap.set("#app",{clearProps:"filter,opacity,visibility"}); Site.resumeHero&&Site.resumeHero(); if (MS.opener&&MS.opener.focus) MS.opener.focus({preventScroll:true}); };
  MS.tl&&MS.tl.kill();
  if (instant || reduce || !panel){ done(); return; }
  MS.tl=gsap.timeline({onComplete:done}).to($$("[data-anim]",panel),{y:-10,autoAlpha:0,duration:.3,ease:"power2.in",stagger:.02},0)
    .to(panel,{autoAlpha:0,scale:.97,duration:.45,ease:"power3.in"},.15).to(scrim,{autoAlpha:0,duration:.45},.3).to("#app",{autoAlpha:1,filter:"blur(0px)",duration:.6,ease:"power3.out"},.35);
}
addEventListener("keydown",e=>{
  if (!MS.open) return;
  if (e.key==="Escape") closeModal();
  else if (e.key==="ArrowRight") stepModal(1);
  else if (e.key==="ArrowLeft") stepModal(-1);
  else if (e.key==="Tab"){ const p=$("#modalRoot .panel"); if (!p) return; const f=$$("button,a[href]",p); if (!f.length) return; const a=f[0], z=f[f.length-1];
    if (e.shiftKey && document.activeElement===a){ e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement===z){ e.preventDefault(); a.focus(); } }
});

export { Site, disposePage, onWin, renderSite, siteHeader, studioPill, buildSection, SECTIONS, fmtNum, afterRender, MS, modalIsOpen, openModal, fillModal, modalFigure, animateModalIn, stepModal, closeModal };
