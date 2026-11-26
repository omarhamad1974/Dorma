import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, ease, h, reduce } from './core';

/* ================= IMAGE MASKS, SECTION AND MODAL ANIMATION =================
   Global settings live in motion.imageFx, motion.sectionFx, motion.modalOpen and motion.modalClose
   (Design → Global style). A section can override any of them (Pages → section → More options → Animation),
   a modal can use its own opening and closing (Flows and modals → Modals → Animation). An empty value follows the global one.
   Visitors who prefer reduced motion see every picture and section at rest, with no masks moving. */
const BRAND=["#00aeef","#ed0677","#ffcb08","#0072bc"];
const num=(v,d)=>v===""||v==null||isNaN(+v)?d:+v;
const has=v=>v!==""&&v!=null&&v!=="default";

/** Image settings for a section: its own values over the global ones. */
function imageFxFor(cfg,sec){
  const G={reveal:"none",dir:"left",duration:1.2,color:"",shape:"none",hover:"none",...((cfg.motion&&cfg.motion.imageFx)||{})}, own=(sec&&sec.imgfx)||{};
  const o={}; Object.keys(G).forEach(k=>o[k]=has(own[k])?own[k]:G[k]); o.duration=Math.max(.2,num(o.duration,1.2)); return o;
}
/** Section entrance and exit for a section: its own values over the global ones. */
function sectionAnimFor(cfg,sec){
  const G={in:"none",out:"none",duration:1,...((cfg.motion&&cfg.motion.sectionFx)||{})}, own=(sec&&sec.anim)||{};
  const o={}; Object.keys(G).forEach(k=>o[k]=has(own[k])?own[k]:G[k]); o.duration=Math.max(.2,num(o.duration,1)); return o;
}

/* ---------- picture masks: a shape kept all the time ---------- */
const SHAPES={ rounded:"inset(0 round 22px)", pill:"inset(0 round 999px)", arch:"inset(0 round 999px 999px 0 0)", circle:"ellipse(50% 50% at 50% 50%)",
  hexagon:"polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)", slant:"polygon(0 0,100% 0,100% 84%,0 100%)", notch:"polygon(0 0,calc(100% - 36px) 0,100% 36px,100% 100%,36px 100%,0 calc(100% - 36px))",
  diamond:"polygon(50% 0,100% 50%,50% 100%,0 50%)", leaf:"inset(0 round 0 42% 0 42%)", blob:"inset(0 round 42% 58% 63% 37% / 45% 38% 62% 55%)", frame:"polygon(0 0,100% 0,100% 100%,0 100%,0 0,6% 8%,6% 92%,94% 92%,94% 8%,6% 8%)" };
/* ---------- picture reveals: clip-path from → to (dir decides where it opens from) ---------- */
const WIPE={left:["inset(0 100% 0 0)"],right:["inset(0 0 0 100%)"],up:["inset(100% 0 0 0)"],down:["inset(0 0 100% 0)"]};
const CLIPS={
  wipe:o=>[WIPE[o.dir]?WIPE[o.dir][0]:WIPE.left[0],"inset(0 0% 0 0%)"],
  iris:()=>["circle(0% at 50% 50%)","circle(75% at 50% 50%)"],
  diamond:()=>["polygon(50% 50%,50% 50%,50% 50%,50% 50%)","polygon(50% -50%,150% 50%,50% 150%,-50% 50%)"],
  diagonal:o=>o.dir==="right"?["polygon(100% 0,100% 0,100% 0)","polygon(100% 0,-100% 0,100% 200%)"]:["polygon(0 0,0 0,0 0)","polygon(0 0,200% 0,0 200%)"],
  split:()=>["inset(0 50% 0 50%)","inset(0 0% 0 0%)"],
  bars:()=>["inset(50% 0 50% 0)","inset(0% 0 0% 0)"],
};
/* Covers: bands laid over the picture that move away. */
function covers(box,o){
  const c=o.color||"var(--ink)", mk=(st,bg)=>{ const d=h("i",{class:"rv-cover",style:st+";background:"+(bg||c)}); box.append(d); return d; };
  const R=o.reveal;
  if (R==="blinds"||R==="shutters"){ const n=6, v=R==="shutters"; const els=[...Array(n)].map((_,i)=>mk(v?`left:${i*100/n}%;width:${100/n+.5}%;top:0;bottom:0`:`top:${i*100/n}%;height:${100/n+.5}%;left:0;right:0`));
    return tl=>tl.to(els,{[v?"scaleX":"scaleY"]:0,transformOrigin:v?"0 50%":"50% 0",duration:o.duration*.7,ease:"power3.inOut",stagger:o.duration*.06}); }
  if (R==="tiles"){ const cols=6, rows=4, els=[]; for (let r=0;r<rows;r++) for (let k=0;k<cols;k++) els.push(mk(`left:${k*100/cols}%;top:${r*100/rows}%;width:${100/cols+.5}%;height:${100/rows+.5}%`));
    return tl=>tl.to(els,{scale:0,transformOrigin:"50% 50%",duration:o.duration*.5,ease:"power2.in",stagger:{each:o.duration*.025,from:"random"}}); }
  if (R==="curtain"){ const a=mk("left:0;top:0;bottom:0;width:50.5%"), b=mk("right:0;top:0;bottom:0;width:50.5%");
    return tl=>tl.to(a,{xPercent:-101,duration:o.duration,ease:"expo.inOut"},0).to(b,{xPercent:101,duration:o.duration,ease:"expo.inOut"},0); }
  if (R==="cmyk"){ const els=BRAND.map(b=>mk("inset:0",b)).concat(mk("inset:0")); els.reverse();
    const from=o.dir==="right"?"0% 50%":o.dir==="up"?"50% 0%":o.dir==="down"?"50% 100%":"100% 50%", k=o.dir==="up"||o.dir==="down"?"scaleY":"scaleX";
    return tl=>tl.to(els,{[k]:0,transformOrigin:from,duration:o.duration*.55,ease:"expo.inOut",stagger:o.duration*.1}); }
  return null;
}
/** The pictures in a section (not the full-bleed hero backgrounds). */
const pictures=el=>$$(".ph",el).filter(b=>!b.closest(".hc")&&!(b.parentNode&&b.parentNode.classList&&b.parentNode.classList.contains("hs"))&&!b.classList.contains("bleed"));
/** Shapes and hover effects right away; reveals start when each picture scrolls into view. */
function imageFx(cfg,sec,el,{scroller=null,now=false}={}){
  const o=imageFxFor(cfg,sec), boxes=pictures(el); if (!boxes.length) return;
  boxes.forEach(b=>{
    if (SHAPES[o.shape]){ b.style.clipPath=SHAPES[o.shape]; b.classList.add("shaped"); }
    if (o.hover&&o.hover!=="none") hover(b,o.hover);
  });
  if (reduce || !o.reveal || o.reveal==="none") return;
  boxes.forEach(b=>{
    const play=revealer(b,o); if (!play) return;
    if (typeof now==="number"){ gsap.delayedCall(now,play); return; }
    if (now || !ScrollTrigger) { play(); return; }
    ScrollTrigger.create({trigger:b,scroller:scroller||undefined,start:"top 88%",once:true,onEnter:play});
  });
}
/** Sets a picture up hidden and returns a function that reveals it. */
function revealer(b,o){
  const kids=[...b.children].filter(n=>!n.classList.contains("badge")&&!n.classList.contains("rv-cover"));
  const media=b.classList.contains("kb-scrub")?null:kids.find(n=>/^(IMG|CANVAS|VIDEO)$/.test(n.tagName)); // scroll-zoom pictures keep their own zoom
  if (CLIPS[o.reveal]){ const [a,z]=CLIPS[o.reveal](o); gsap.set(kids,{clipPath:a});
    return ()=>gsap.timeline().to(kids,{clipPath:z,duration:o.duration,ease:"expo.inOut",onComplete:()=>gsap.set(kids,{clearProps:"clipPath"})})
      .fromTo(media||[],{scale:1.25},{scale:1,duration:o.duration*1.4,ease:"expo.out"},0); }
  if (o.reveal==="zoom"){ gsap.set(kids,{clipPath:"inset(18% 18% 18% 18%)"}); if (media) gsap.set(media,{scale:1.4});
    return ()=>gsap.timeline().to(kids,{clipPath:"inset(0% 0% 0% 0%)",duration:o.duration,ease:"expo.inOut",onComplete:()=>gsap.set(kids,{clearProps:"clipPath"})}).to(media||[],{scale:1,duration:o.duration*1.3,ease:"expo.out"},0); }
  if (o.reveal==="blur"){ gsap.set(kids,{autoAlpha:0,filter:"blur(24px)"});
    return ()=>gsap.to(kids,{autoAlpha:1,filter:"blur(0px)",duration:o.duration,ease:"power2.out",onComplete:()=>gsap.set(kids,{clearProps:"filter"})}); }
  if (o.reveal==="spot"){ b.style.setProperty("--rv","0%"); b.classList.add("rv-spot");
    return ()=>gsap.fromTo(b,{"--rv":"0%"},{"--rv":"160%",duration:o.duration*1.2,ease:"power2.inOut",onComplete:()=>b.classList.remove("rv-spot")}); }
  const run=covers(b,o); if (!run) return null;
  return ()=>{ const tl=gsap.timeline({onComplete:()=>$$(".rv-cover",b).forEach(n=>n.remove())}); run(tl); if (media) tl.fromTo(media,{scale:1.2},{scale:1,duration:o.duration*1.4,ease:"expo.out"},0); return tl; };
}
function hover(b,kind){
  b.classList.add("hv-"+kind);
  if (kind==="tilt" && !reduce && matchMedia("(pointer:fine)").matches){
    const rx=gsap.quickTo(b,"rotationX",{duration:.6,ease:"power3.out"}), ry=gsap.quickTo(b,"rotationY",{duration:.6,ease:"power3.out"});
    gsap.set(b,{transformPerspective:900});
    b.addEventListener("pointermove",e=>{ const r=b.getBoundingClientRect(); ry(((e.clientX-r.left)/r.width-.5)*10); rx(-((e.clientY-r.top)/r.height-.5)*8); });
    b.addEventListener("pointerleave",()=>{ rx(0); ry(0); });
  }
  if (kind==="spot") b.addEventListener("pointermove",e=>{ const r=b.getBoundingClientRect(); b.style.setProperty("--mx",((e.clientX-r.left)/r.width*100).toFixed(1)+"%"); b.style.setProperty("--my",((e.clientY-r.top)/r.height*100).toFixed(1)+"%"); });
}

/* ---------- sections: entrance (once, as the section arrives) and exit (follows the scroll as it leaves) ---------- */
const IN={
  rise:{y:80,autoAlpha:0}, fade:{autoAlpha:0}, scale:{scale:.9,autoAlpha:0}, blur:{filter:"blur(18px)",autoAlpha:0},
  slideLeft:{xPercent:-8,autoAlpha:0}, slideRight:{xPercent:8,autoAlpha:0}, tilt:{rotationX:-14,y:60,transformPerspective:1200,transformOrigin:"50% 0%",autoAlpha:0},
  skew:{skewY:4,y:90,autoAlpha:0}, wipe:{clipPath:"inset(100% 0% 0% 0%)"}, iris:{clipPath:"circle(0% at 50% 50%)"}, curtain:{clipPath:"inset(0% 50% 0% 50%)"},
  zoom:{scale:1.12,autoAlpha:0}
};
const IN_TO={wipe:{clipPath:"inset(0% 0% 0% 0%)"},iris:{clipPath:"circle(110% at 50% 50%)"},curtain:{clipPath:"inset(0% 0% 0% 0%)"}};
const OUT={ fade:{autoAlpha:.15}, shrink:{scale:.9,autoAlpha:.4,transformOrigin:"50% 0%"}, blur:{filter:"blur(8px)",autoAlpha:.5}, parallax:{yPercent:18},
  dim:{filter:"brightness(.35)"}, fold:{rotationX:10,transformPerspective:1200,transformOrigin:"50% 100%",autoAlpha:.3}, slide:{xPercent:-6,autoAlpha:.3} };
/** Entrance and exit for one section. Only sections below the first screen enter, so the page is complete at rest. */
function sectionMotion(cfg,sec,el,{scroller=null}={}){
  if (reduce || !ScrollTrigger) return;
  const o=sectionAnimFor(cfg,sec);
  if (IN[o.in] || o.in==="stagger"){
    const below=el.getBoundingClientRect().top>innerHeight*.9;
    if (below){
      if (o.in==="stagger"){ const inner=el.querySelector(".wrap")||el, kids=[...inner.children].filter(n=>!n.classList.contains("sfx")); gsap.set(kids,{y:50,autoAlpha:0});
        ScrollTrigger.create({trigger:el,scroller:scroller||undefined,start:"top 85%",once:true,onEnter:()=>gsap.to(kids,{y:0,autoAlpha:1,duration:o.duration,ease:ease(cfg),stagger:o.duration*.12,clearProps:"transform"})}); }
      else { gsap.set(el,IN[o.in]);
        const to={...(IN_TO[o.in]||{}),autoAlpha:1,y:0,xPercent:0,scale:1,rotationX:0,skewY:0,filter:"blur(0px)",duration:o.duration,ease:o.in==="iris"||o.in==="wipe"||o.in==="curtain"?"expo.inOut":ease(cfg),
          onComplete:()=>gsap.set(el,{clearProps:"transform,filter,clipPath"})};
        ScrollTrigger.create({trigger:el,scroller:scroller||undefined,start:"top 85%",once:true,onEnter:()=>gsap.to(el,to)}); }
    }
  }
  if (OUT[o.out]) gsap.to(el,{...OUT[o.out],ease:"none",immediateRender:false,scrollTrigger:{trigger:el,scroller:scroller||undefined,start:"bottom 75%",end:"bottom top",scrub:.4}});
}

/* ---------- modals: opening and closing ---------- */
let LAST={x:innerWidth/2,y:innerHeight/2,t:0};
addEventListener("pointerdown",e=>{ LAST={x:e.clientX,y:e.clientY,t:Date.now()}; },true);
/** Where the click that opened the modal was, as a position on the panel (centre when opened by keyboard). */
function origin(panel){ const r=panel.getBoundingClientRect(); if (Date.now()-LAST.t>1500||!r.width) return "50% 50%";
  const x=Math.max(0,Math.min(100,(LAST.x-r.left)/r.width*100)), y=Math.max(0,Math.min(100,(LAST.y-r.top)/r.height*100)); return x.toFixed(1)+"% "+y.toFixed(1)+"%"; }
function bars(panel,colors){ const els=colors.map((c,i)=>{ const d=h("i",{class:"md-bar",style:`background:${c};z-index:${20+colors.length-i}`}); panel.append(d); return d; }); return els; }
/** Adds the panel's opening to the timeline. Returns when the content inside should start (seconds). */
function modalIn(cfg,tl,panel,style){
  const at=.05, E=ease(cfg);
  switch(style){
    case "line":
      tl.fromTo(panel,{clipPath:"inset(49.6% 50% 49.6% 50%)"},{clipPath:"inset(49.6% 0% 49.6% 0%)",duration:.45,ease:"expo.out"},at)
        .to(panel,{clipPath:"inset(0% 0% 0% 0%)",duration:.75,ease:"expo.inOut"},.4)
        .fromTo($(".scan",panel),{top:"50%",opacity:1},{top:"100%",duration:.75,ease:"expo.inOut"},.4).to($(".scan",panel),{opacity:0,duration:.3},1.05)
        .fromTo($$(".corner",panel),{scale:0},{scale:1,duration:.5,ease:"back.out(3)",stagger:.05},.9);
      return .75;
    case "scale": tl.fromTo(panel,{scale:.85,autoAlpha:0},{scale:1,autoAlpha:1,duration:.8,ease:E},at); return .3;
    case "slide": tl.fromTo(panel,{yPercent:30,autoAlpha:0},{yPercent:0,autoAlpha:1,duration:.9,ease:E},at); return .3;
    case "iris": { const o=origin(panel); tl.fromTo(panel,{clipPath:`circle(0% at ${o})`},{clipPath:`circle(150% at ${o})`,duration:1,ease:"expo.inOut"},at); return .45; }
    case "zoom": { const o=origin(panel); tl.fromTo(panel,{scale:.08,autoAlpha:0,transformOrigin:o},{scale:1,autoAlpha:1,duration:.9,ease:"expo.out"},at); return .4; }
    case "wipe": tl.fromTo(panel,{clipPath:"inset(0% 100% 0% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.9,ease:"expo.inOut"},at); return .45;
    case "curtain": tl.fromTo(panel,{clipPath:"inset(0% 50% 0% 50%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.9,ease:"expo.inOut"},at); return .45;
    case "unfold": tl.fromTo(panel,{clipPath:"inset(49.6% 49.6% 49.6% 49.6%)"},{clipPath:"inset(0% 49.6% 0% 49.6%)",duration:.45,ease:"expo.out"},at).to(panel,{clipPath:"inset(0% 0% 0% 0%)",duration:.75,ease:"expo.inOut"},.4); return .75;
    case "diagonal": tl.fromTo(panel,{clipPath:"polygon(0% 0%,0% 0%,0% 0%,0% 0%)"},{clipPath:"polygon(0% 0%,200% 0%,200% 0%,0% 200%)",duration:1,ease:"expo.inOut"},at); return .5;
    case "flip": tl.fromTo(panel,{rotationX:-75,transformPerspective:1400,transformOrigin:"50% 0%",autoAlpha:0},{rotationX:0,autoAlpha:1,duration:1,ease:E},at); return .35;
    case "drop": tl.fromTo(panel,{yPercent:-60,autoAlpha:0},{yPercent:0,autoAlpha:1,duration:1,ease:"bounce.out"},at); return .5;
    case "blur": tl.fromTo(panel,{filter:"blur(24px)",scale:1.06,autoAlpha:0},{filter:"blur(0px)",scale:1,autoAlpha:1,duration:.8,ease:"power2.out",clearProps:"filter"},at); return .3;
    case "blinds": case "cmyk": { const els=bars(panel,style==="cmyk"?[...BRAND,"var(--ink)"]:["var(--accent)","var(--ink)"]);
      tl.fromTo(panel,{autoAlpha:0},{autoAlpha:1,duration:.01},at).fromTo(els,{scaleX:1},{scaleX:0,transformOrigin:"100% 50%",duration:.6,ease:"expo.inOut",stagger:.09,onComplete:()=>els.forEach(e=>e.remove())},at+.05); return .45; }
    default: tl.fromTo(panel,{autoAlpha:0},{autoAlpha:1,duration:.6},at); return .3;
  }
}
const CLOSE_FOR={line:"collapse",scale:"shrink",slide:"slideDown",iris:"iris",zoom:"zoomOut",wipe:"wipe",curtain:"curtain",unfold:"collapse",diagonal:"wipe",flip:"flip",drop:"slideDown",blur:"blur",blinds:"blinds",cmyk:"blinds",fade:"fade"};
/** Adds the panel's closing to the timeline (from 0.15s, after the content fades). "auto" mirrors the opening. */
function modalOut(cfg,tl,panel,style,openStyle){
  const s=style&&style!=="auto"?style:(CLOSE_FOR[openStyle]||"shrink"), at=.15;
  switch(s){
    case "fade": tl.to(panel,{autoAlpha:0,duration:.4,ease:"power2.in"},at); break;
    case "collapse": tl.to(panel,{clipPath:"inset(49.6% 0% 49.6% 0%)",duration:.45,ease:"expo.in"},at).to(panel,{clipPath:"inset(49.6% 50% 49.6% 50%)",duration:.3,ease:"expo.in"},at+.42); break;
    case "slideDown": tl.to(panel,{yPercent:25,autoAlpha:0,duration:.5,ease:"power3.in"},at); break;
    case "iris": { const o=origin(panel); tl.fromTo(panel,{clipPath:`circle(150% at ${o})`},{clipPath:`circle(0% at ${o})`,duration:.7,ease:"expo.in"},at); break; }
    case "zoomOut": { const o=origin(panel); tl.to(panel,{scale:.08,autoAlpha:0,transformOrigin:o,duration:.6,ease:"expo.in"},at); break; }
    case "wipe": tl.fromTo(panel,{clipPath:"inset(0% 0% 0% 0%)"},{clipPath:"inset(0% 0% 0% 100%)",duration:.6,ease:"expo.in"},at); break;
    case "curtain": tl.fromTo(panel,{clipPath:"inset(0% 0% 0% 0%)"},{clipPath:"inset(0% 50% 0% 50%)",duration:.6,ease:"expo.in"},at); break;
    case "flip": tl.to(panel,{rotationX:75,transformPerspective:1400,transformOrigin:"50% 100%",autoAlpha:0,duration:.6,ease:"power3.in"},at); break;
    case "blur": tl.to(panel,{filter:"blur(20px)",scale:1.05,autoAlpha:0,duration:.5,ease:"power2.in"},at); break;
    case "blinds": { const els=bars(panel,["var(--ink)","var(--accent)"]); tl.fromTo(els,{scaleX:0},{scaleX:1,transformOrigin:"0% 50%",duration:.45,ease:"expo.in",stagger:.08},at).to(panel,{autoAlpha:0,duration:.2},at+.55); break; }
    default: tl.to(panel,{autoAlpha:0,scale:.95,duration:.45,ease:"power3.in"},at);
  }
  return tl;
}

/* ---------- studio previews: replay a picture reveal, a section entrance or a modal opening on a sample ---------- */
function previewImage(box,o){
  $$(".rv-cover",box).forEach(n=>n.remove()); box.classList.remove("rv-spot"); box.style.clipPath="";
  [...box.classList].filter(c=>c.startsWith("hv-")).forEach(c=>box.classList.remove(c));
  gsap.killTweensOf([box,...box.children]); gsap.set([...box.children],{clearProps:"all"});
  const opts={reveal:"none",dir:"left",duration:1.2,color:"",shape:"none",hover:"none",...o}; opts.duration=Math.max(.2,num(opts.duration,1.2));
  if (SHAPES[opts.shape]) box.style.clipPath=SHAPES[opts.shape];
  if (opts.hover&&opts.hover!=="none") box.classList.add("hv-"+opts.hover);
  if (reduce||!opts.reveal||opts.reveal==="none") return;
  const play=revealer(box,opts); if (play) play();
}
function previewSection(box,o){
  gsap.killTweensOf(box); gsap.set(box,{clearProps:"all"});
  const s={in:"rise",duration:1,...o}; if (reduce) return;
  if (s.in==="stagger"){ gsap.fromTo([...box.children],{y:30,autoAlpha:0},{y:0,autoAlpha:1,duration:s.duration,stagger:s.duration*.12,ease:"expo.out"}); return; }
  if (!IN[s.in]) return;
  gsap.fromTo(box,IN[s.in],{...(IN_TO[s.in]||{}),autoAlpha:1,y:0,xPercent:0,scale:1,rotationX:0,skewY:0,filter:"blur(0px)",duration:num(s.duration,1),ease:"expo.out",onComplete:()=>gsap.set(box,{clearProps:"all"})});
}
function previewModal(cfg,box,open,close){
  const panel=box.querySelector(".md-mini"); if (!panel) return; gsap.killTweensOf(panel); gsap.set(panel,{clearProps:"all"}); $$(".md-bar",panel).forEach(n=>n.remove());
  if (reduce) return;
  const tl=gsap.timeline(); const at=modalIn(cfg,tl,panel,open);
  tl.fromTo($$("p,b",panel),{y:10,autoAlpha:0},{y:0,autoAlpha:1,duration:.5,stagger:.06},at);
  const out=gsap.timeline({paused:true}); out.to($$("p,b",panel),{autoAlpha:0,duration:.2},0); modalOut(cfg,out,panel,close,open);
  tl.add(()=>out.play(),"+=1.1"); tl.add(()=>{},"+=1.6");
}

export { imageFxFor, sectionAnimFor, imageFx, sectionMotion, modalIn, modalOut, previewImage, previewSection, previewModal, SHAPES };
