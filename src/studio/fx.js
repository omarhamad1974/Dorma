import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hexOk, plain, reduce } from './core';

/* ================= SECTION BACKGROUND EFFECTS =================
   An animated SVG layer behind a section's content, chosen per section (Pages → section → Background effect)
   or for every section (Design → Global style → Every section). Each effect uses GSAP with SVG drawing, masks and
   filters, runs only while its section is on screen, and stays still for visitors who prefer reduced motion.
   Colour: the section's effect colour, else the global one, else the accent. */
const NS="http://www.w3.org/2000/svg";
let seq=0;
/* CSS variables only work in SVG through style, so colour attributes that use one become style properties. */
function S(tag,attrs={},...kids){ const e=document.createElementNS(NS,tag), st=[];
  for (const [k,v] of Object.entries(attrs)){ if (v==null) continue; if (/^(fill|stroke|stop-color)$/.test(k)&&/var\(/.test(String(v))) st.push(k+":"+v); else e.setAttribute(k,String(v)); }
  if (st.length) e.setAttribute("style",(e.getAttribute("style")?e.getAttribute("style")+";":"")+st.join(";"));
  kids.flat().forEach(k=>k&&e.append(k)); return e; }
const num=(v,d)=>v===""||v==null||isNaN(+v)?d:+v;
const BRAND=["#ed0677","#ffcb08","#00aeef","#0072bc"]; // the stripes in the Dorma D
const W=1600, H=900;

/** The effect a section uses (its own, else the global default). */
function fxFor(cfg,sec){
  const G=(cfg.theme&&cfg.theme.sections&&cfg.theme.sections.bgfx)||{}, own=(sec&&sec.bgfx)||{};
  const type=own.type&&own.type!=="default"?own.type:(G.type||"none");
  return { type, color:hexOk(own.color)?own.color:hexOk(G.color)?G.color:"", opacity:num(own.opacity,num(G.opacity,.4)), speed:Math.max(.1,num(own.speed,num(G.speed,1))) };
}

/* Each builder fills the SVG and returns {loops:[tweens that run while visible], enter:()=>timeline played once on first view}. */
const B={
  /* Topographic lines that draw themselves, then slowly turn and breathe. */
  contours(svg,o){
    const g=S("g",{fill:"none",stroke:"var(--fx)","stroke-width":1.2,"vector-effect":"non-scaling-stroke"}), paths=[];
    const cx=W*.74, cy=H*.5;
    for (let k=0;k<9;k++){ const R=70+k*58, pts=[];
      for (let a=0;a<=64;a++){ const t=a/64*Math.PI*2, r=R*(1+.12*Math.sin(t*3+k*.7)+.06*Math.sin(t*5-k)); pts.push([cx+Math.cos(t)*r*1.25,cy+Math.sin(t)*r]); }
      const p=S("path",{d:"M"+pts.map(p=>p.map(n=>n.toFixed(1)).join(" ")).join("L")+"Z",pathLength:1,opacity:(1-k/11).toFixed(2)}); paths.push(p); g.append(p); }
    svg.append(g);
    return { loops:[gsap.to(g,{rotation:360,svgOrigin:`${cx} ${cy}`,duration:180/o.speed,ease:"none",repeat:-1}),gsap.to(g,{scale:1.06,svgOrigin:`${cx} ${cy}`,duration:7/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1})],
      enter:()=>gsap.fromTo(paths,{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:2.4,ease:"power2.inOut",stagger:.12}) };
  },
  /* Concentric dashed rings turning at different speeds, with a dot travelling round one of them. */
  orbits(svg,o){
    const cx=W*.78, cy=H*.52, g=S("g",{fill:"none",stroke:"var(--fx)","stroke-width":1.2,"vector-effect":"non-scaling-stroke"}), rings=[], loops=[];
    [[110,"2 9"],[190,"60 18"],[280,"1 7"],[380,"140 40 10 40"],[500,"3 14"]].forEach(([r,d],i)=>{ const c=S("circle",{cx,cy,r,"stroke-dasharray":d,opacity:(1-i*.15).toFixed(2)}); rings.push(c); g.append(c);
      loops.push(gsap.to(c,{rotation:i%2?-360:360,svgOrigin:`${cx} ${cy}`,duration:(40+i*18)/o.speed,ease:"none",repeat:-1})); });
    const dotG=S("g"), dot=S("circle",{cx:cx+280,cy,r:6,fill:"var(--fx)"}), halo=S("circle",{cx:cx+280,cy,r:16,fill:"none",stroke:"var(--fx)",opacity:.5}); dotG.append(halo,dot); g.append(dotG);
    loops.push(gsap.to(dotG,{rotation:360,svgOrigin:`${cx} ${cy}`,duration:14/o.speed,ease:"none",repeat:-1}),gsap.fromTo(halo,{attr:{r:8},opacity:.7},{attr:{r:26},opacity:0,duration:1.6,repeat:-1,ease:"power1.out"}));
    svg.append(g);
    return { loops, enter:()=>gsap.fromTo(rings,{scale:.6,autoAlpha:0,svgOrigin:`${cx} ${cy}`},{scale:1,autoAlpha:1,duration:1.6,ease:"expo.out",stagger:.1}) };
  },
  /* A fine grid shown only inside a soft spotlight (an SVG mask) that drifts and follows the pointer, with a scan line. */
  grid(svg,o,el){
    const id="fxg"+(++seq), defs=S("defs");
    const pat=S("pattern",{id:id+"p",width:56,height:56,patternUnits:"userSpaceOnUse"},S("path",{d:"M56 0H0V56",fill:"none",stroke:"var(--fx)","stroke-width":1}));
    const grad=S("radialGradient",{id:id+"r"},S("stop",{offset:"0%","stop-color":"#fff","stop-opacity":1}),S("stop",{offset:"100%","stop-color":"#fff","stop-opacity":0}));
    const spot=S("circle",{cx:W*.7,cy:H*.4,r:420,fill:`url(#${id}r)`}), spot2=S("circle",{cx:W*.25,cy:H*.7,r:260,fill:`url(#${id}r)`,opacity:.6});
    const mask=S("mask",{id:id+"m"},S("rect",{width:W,height:H,fill:"#000"}),spot,spot2);
    defs.append(pat,grad,mask); svg.append(defs);
    const scan=S("rect",{x:0,y:0,width:W,height:2,fill:"var(--fx)",opacity:.8});
    svg.append(S("g",{mask:`url(#${id}m)`},S("rect",{width:W,height:H,fill:`url(#${id}p)`}),scan));
    const loops=[gsap.fromTo(spot,{attr:{cx:W*.62,cy:H*.35}},{attr:{cx:W*.82,cy:H*.6},duration:9/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1}),
      gsap.fromTo(spot2,{attr:{cx:W*.18}},{attr:{cx:W*.4},duration:12/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1}),
      gsap.fromTo(scan,{attr:{y:0}},{attr:{y:H},duration:6/o.speed,ease:"none",repeat:-1})];
    if (matchMedia("(pointer:fine)").matches){
      const qx=gsap.quickTo(spot2,"attr.cx",{duration:.9,ease:"power3.out"}), qy=gsap.quickTo(spot2,"attr.cy",{duration:.9,ease:"power3.out"});
      el.addEventListener("pointermove",e=>{ const r=svg.getBoundingClientRect(), k=Math.max(W/r.width,H/r.height); qx(W/2+(e.clientX-r.left-r.width/2)*k); qy(H/2+(e.clientY-r.top-r.height/2)*k); });
    }
    return { loops, enter:()=>gsap.fromTo(spot,{attr:{r:0}},{attr:{r:420},duration:1.6,ease:"expo.out"}) };
  },
  /* Liquid colour: CMYK blobs merged by an SVG "goo" filter, drifting slowly. */
  goo(svg,o){
    const id="fxo"+(++seq);
    svg.append(S("defs",{},S("filter",{id,x:"-20%",y:"-20%",width:"140%",height:"140%"},S("feGaussianBlur",{in:"SourceGraphic",stdDeviation:38,result:"b"}),S("feColorMatrix",{in:"b",mode:"matrix",values:"1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"}))));
    const g=S("g",{filter:`url(#${id})`,opacity:.9}), blobs=[...BRAND,"var(--fx)"].map((c,i)=>S("circle",{cx:W*(.2+i*.15),cy:H*(.45+(i%2?.15:-.1)),r:110+(i%3)*40,fill:c,opacity:.55}));
    g.append(...blobs); svg.append(g);
    const loops=blobs.map((b,i)=>gsap.to(b,{attr:{cx:`+=${(i%2?-1:1)*(180+i*40)}`,cy:`+=${(i%3?-1:1)*(120+i*20)}`},duration:(8+i*2.5)/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1}));
    return { loops, enter:()=>gsap.fromTo(blobs,{attr:{r:0}},{attr:{r:(i)=>110+(i%3)*40},duration:1.8,ease:"elastic.out(1,.6)",stagger:.12}) };
  },
  /* The CMYK stripes of the Dorma D, sliding diagonally; a gradient mask opens them as the section scrolls in. */
  stripes(svg,o,el){
    const id="fxs"+(++seq), lg=S("linearGradient",{id:id+"l",x1:0,y1:0,x2:1,y2:0},S("stop",{offset:0,"stop-color":"#fff","stop-opacity":0}),S("stop",{offset:".55","stop-color":"#fff","stop-opacity":1}),S("stop",{offset:1,"stop-color":"#fff","stop-opacity":.2}));
    const win=S("rect",{x:0,y:0,width:0,height:H,fill:`url(#${id}l)`});
    svg.append(S("defs",{},lg,S("mask",{id:id+"m"},win)));
    const band=S("g",{transform:`rotate(-28 ${W/2} ${H/2})`}), inner=S("g");
    for (let r=0;r<3;r++) BRAND.forEach((c,i)=>inner.append(S("rect",{x:-W+r*1200+i*72,y:-H,width:44,height:H*3,fill:c,opacity:.8})));
    band.append(inner); svg.append(S("g",{mask:`url(#${id}m)`},band));
    const loops=[gsap.fromTo(inner,{x:0},{x:1200,duration:26/o.speed,ease:"none",repeat:-1})];
    const st=reduce?null:gsap.fromTo(win,{attr:{width:0}},{attr:{width:W},ease:"none",scrollTrigger:{trigger:el,start:"top 85%",end:"center 45%",scrub:.6}});
    if (reduce) win.setAttribute("width",W);
    return { loops, enter:null, extra:st };
  },
  /* Layered waves that roll sideways at different speeds. */
  waves(svg,o){
    const g=S("g",{fill:"none",stroke:"var(--fx)","stroke-width":1.4,"vector-effect":"non-scaling-stroke"}), ws=[];
    for (let k=0;k<4;k++){ const amp=24+k*14, y0=H*(.55+k*.08), per=400+k*80; let d=`M0 ${y0}`;
      for (let x=0;x<=W*2+per;x+=per/2) d+=` Q ${x+per/4} ${y0+(Math.round(x/(per/2))%2?amp:-amp)} ${x+per/2} ${y0}`;
      const p=S("path",{d,opacity:(1-k*.2).toFixed(2)}); ws.push(p); g.append(p); }
    svg.append(g);
    return { loops:ws.map((p,k)=>gsap.fromTo(p,{x:0},{x:-(400+k*80),duration:(6+k*2)/o.speed,ease:"none",repeat:-1})),
      enter:()=>gsap.fromTo(ws,{y:60,autoAlpha:0},{y:0,autoAlpha:1,duration:1.4,ease:"expo.out",stagger:.12}) };
  },
  /* A circle mask that grows with the scroll, opening a glow of the effect colour with fine rings in it. */
  reveal(svg,o,el){
    const id="fxr"+(++seq), cx=W*.5, cy=H*.5;
    const rg=S("radialGradient",{id:id+"g"},S("stop",{offset:0,"stop-color":"var(--fx)","stop-opacity":.55}),S("stop",{offset:1,"stop-color":"var(--fx)","stop-opacity":0}));
    const hole=S("circle",{cx,cy,r:0,fill:"#fff"});
    svg.append(S("defs",{},rg,S("mask",{id:id+"m"},hole)));
    const rings=S("g",{fill:"none",stroke:"var(--fx)","stroke-width":1,opacity:.6}); for (let r=60;r<1000;r+=60) rings.append(S("circle",{cx,cy,r}));
    svg.append(S("g",{mask:`url(#${id}m)`},S("rect",{width:W,height:H,fill:`url(#${id}g)`}),rings));
    const st=reduce?null:gsap.fromTo(hole,{attr:{r:0}},{attr:{r:1000},ease:"none",scrollTrigger:{trigger:el,start:"top 90%",end:"bottom 40%",scrub:.8}});
    if (reduce) hole.setAttribute("r",1000);
    return { loops:[gsap.to(rings,{rotation:360,svgOrigin:`${cx} ${cy}`,duration:90/o.speed,ease:"none",repeat:-1})], enter:null, extra:st };
  },
  /* The section's eyebrow (or label) as a huge outline word that draws itself, with light running through it. */
  type(svg,o,el,sec){
    const id="fxt"+(++seq), word=(plain(sec.eyebrow)||plain(sec.anchor)||plain(sec.title)||"Dorma").split(/\s+/).slice(0,2).join(" ").slice(0,18);
    const lg=S("linearGradient",{id:id+"l",gradientUnits:"userSpaceOnUse",x1:-400,y1:0,x2:0,y2:0},S("stop",{offset:0,"stop-color":"#fff","stop-opacity":.25}),S("stop",{offset:.5,"stop-color":"#fff","stop-opacity":1}),S("stop",{offset:1,"stop-color":"#fff","stop-opacity":.25}));
    const mrect=S("rect",{width:W,height:H,fill:`url(#${id}l)`});
    svg.append(S("defs",{},lg,S("mask",{id:id+"m"},mrect)));
    const t=S("text",{x:W/2,y:H*.62,"text-anchor":"middle",fill:"none",stroke:"var(--fx)","stroke-width":1.5,"font-size":word.length>10?190:250,style:"font-family:var(--display);font-weight:600;letter-spacing:-.04em"});
    t.textContent=word; svg.append(S("g",{mask:`url(#${id}m)`},t));
    return { loops:[gsap.fromTo(lg,{attr:{x1:-400,x2:0}},{attr:{x1:W,x2:W+400},duration:5/o.speed,ease:"sine.inOut",repeat:-1,repeatDelay:.6})],
      enter:()=>gsap.fromTo(t,{strokeDasharray:"3000",strokeDashoffset:3000},{strokeDashoffset:0,duration:3.2,ease:"power2.inOut"}) };
  }
};
const FX_TYPES=Object.keys(B);

/** Builds the effect layer inside a section. Returns a starter (run after the page renders) or null. */
function sectionFx(cfg,sec,el){
  const o=fxFor(cfg,sec); if (!o.type||o.type==="none"||!B[o.type]||typeof document==="undefined") return null;
  const layer=document.createElement("div"); layer.className="sfx sfx-"+o.type; layer.setAttribute("aria-hidden","true");
  layer.style.opacity=String(Math.max(0,Math.min(1,o.opacity))); if (o.color) layer.style.setProperty("--fx",o.color);
  const svg=S("svg",{viewBox:`0 0 ${W} ${H}`,preserveAspectRatio:"xMidYMid slice"}); layer.append(svg);
  el.classList.add("has-fx"); el.prepend(layer);
  return ()=>{
    let r; try { r=B[o.type](svg,o,el,sec)||{}; } catch(e){ console.error("background effect",o.type,e); return; }
    const loops=(r.loops||[]).filter(Boolean);
    if (reduce){ loops.forEach(t=>{ t.progress(.35); t.pause(); }); return; }
    loops.forEach(t=>t.pause());
    let entered=false;
    ScrollTrigger.create({trigger:el,start:"top bottom",end:"bottom top",onToggle:self=>{
      if (self.isActive && !entered && r.enter){ entered=true; r.enter(); }
      loops.forEach(t=>self.isActive?t.play():t.pause()); }});
  };
}

export { sectionFx, fxFor, FX_TYPES };
