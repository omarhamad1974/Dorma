import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hexOk, plain, reduce } from './core';

/* ================= SECTION BACKGROUND EFFECTS =================
   An animated SVG layer behind a section's content, chosen per section (Pages → section → Background effect)
   or for every section (Design → Global style → Every section). Each effect uses GSAP with SVG drawing, masks and
   filters, runs only while its section is on screen, and stays still for visitors who prefer reduced motion.

   Every effect takes the same settings; the studio shows the ones that matter for the chosen effect (FX[type].ctrl):
     color, color2 (second colour), palette (one colour | two colours | Dorma CMYK), opacity (strength), speed,
     density (how many shapes), size, dir (direction of travel), pos (where it gathers), pointer (reacts to the mouse),
     soften (the veil that keeps text readable: auto | side | even | none).
   A section's own value wins; an empty one follows the global effect settings. */
const NS="http://www.w3.org/2000/svg";
let seq=0;
/* CSS variables only work in SVG through style, so colour attributes that use one become style properties. */
function S(tag,attrs={},...kids){ const e=document.createElementNS(NS,tag), st=[];
  for (const [k,v] of Object.entries(attrs)){ if (v==null) continue; if (/^(fill|stroke|stop-color)$/.test(k)&&/var\(/.test(String(v))) st.push(k+":"+v); else e.setAttribute(k,String(v)); }
  if (st.length) e.setAttribute("style",(e.getAttribute("style")?e.getAttribute("style")+";":"")+st.join(";"));
  kids.flat().forEach(k=>k&&e.append(k)); return e; }
const num=(v,d)=>v===""||v==null||isNaN(+v)?d:+v;
const BRAND=["#ed0677","#ffcb08","#00aeef","#0072bc"]; // the stripes in the Dorma D
const W=1600, H=900, D=Math.ceil(Math.hypot(W,H));
const rnd=(a,b)=>a+Math.random()*(b-a);
const f1=n=>(+n).toFixed(1);

/* What each effect is called in the studio and which of the shared controls it uses. */
const C_ALL=["palette","color2","density","size"];
const FX={
  contours:{label:"Contour lines (drawn, drifting)",group:"Lines",ctrl:["density","size","pos"]},
  orbits:{label:"Orbits (rings and a travelling dot)",group:"Lines",ctrl:["size","pos","dir"]},
  grid:{label:"Spotlight grid (masked, follows the pointer)",group:"Masks",ctrl:["size","pointer"]},
  goo:{label:"Liquid colour (CMYK blobs)",group:"Colour",ctrl:["palette","color2","size"]},
  stripes:{label:"CMYK stripes (masked reveal on scroll)",group:"Print",ctrl:["palette","color2","size","dir"]},
  waves:{label:"Waves (layered lines)",group:"Lines",ctrl:["palette","color2","density","size","dir"]},
  reveal:{label:"Circle mask reveal on scroll",group:"Masks",ctrl:["size","pos"]},
  type:{label:"Outline word (drawn behind the section)",group:"Type",ctrl:["size"]},
  constellation:{label:"Constellation (linked points, follows the pointer)",group:"Points",ctrl:[...C_ALL,"pointer"]},
  halftone:{label:"Halftone (print dots in a moving light)",group:"Print",ctrl:["palette","color2","size","pointer"]},
  rays:{label:"Sunburst rays (turning)",group:"Lines",ctrl:[...C_ALL,"pos","dir"]},
  spiral:{label:"Spiral (draws and turns)",group:"Lines",ctrl:["palette","color2","size","pos","dir"]},
  bubbles:{label:"Bubbles (rising rings)",group:"Points",ctrl:[...C_ALL,"dir"]},
  streaks:{label:"Light streaks (fast lines)",group:"Lines",ctrl:[...C_ALL,"dir"]},
  hexagons:{label:"Honeycomb (cells light up)",group:"Shapes",ctrl:[...C_ALL]},
  tiles:{label:"Tile wave (squares turn in a wave)",group:"Shapes",ctrl:[...C_ALL,"pos"]},
  aurora:{label:"Aurora (soft glowing ribbons)",group:"Colour",ctrl:["palette","color2","size"]},
  ink:{label:"Ink in water (turbulent colour)",group:"Colour",ctrl:["palette","color2","size","pos"]},
  registration:{label:"Print registration marks (CMYK align)",group:"Print",ctrl:["density","size"]},
  zigzag:{label:"Zigzag chevrons (sliding)",group:"Lines",ctrl:[...C_ALL,"dir"]},
  ripples:{label:"Ripples (rings spread out, follow the pointer)",group:"Points",ctrl:[...C_ALL,"pointer"]},
  starfield:{label:"Starfield (twinkling, pointer parallax)",group:"Points",ctrl:[...C_ALL,"dir","pointer"]},
  dotwave:{label:"Dot wave (a grid of dots rolling)",group:"Points",ctrl:[...C_ALL,"dir"]},
  beams:{label:"Light beams (sweeping)",group:"Colour",ctrl:[...C_ALL,"dir"]},
  morph:{label:"Morphing blob (shape changes)",group:"Shapes",ctrl:["palette","color2","size","pos"]},
  shapes:{label:"Floating shapes (circles, squares, triangles)",group:"Shapes",ctrl:[...C_ALL]},
};
const FX_TYPES=Object.keys(FX);
const FX_OPTIONS=[["none","None"],...FX_TYPES.map(k=>[k,FX[k].label])];
const FX_DEFAULTS={ type:"none", color:"", color2:"", palette:"single", opacity:.4, speed:1, density:1, size:1, dir:"", pos:"", pointer:true, soften:"" };
const FX_KEYS=Object.keys(FX_DEFAULTS);

/** The effect a section uses: its own values, falling back to the global effect, falling back to the defaults. */
function fxFor(cfg,sec){
  const G={...FX_DEFAULTS,...((cfg.theme&&cfg.theme.sections&&cfg.theme.sections.bgfx)||{})}, own=(sec&&sec.bgfx)||{};
  const pick=k=>own[k]!==""&&own[k]!=null&&!(k==="type"&&own[k]==="default")?own[k]:G[k];
  const o={}; FX_KEYS.forEach(k=>o[k]=pick(k));
  o.type=o.type||"none";
  o.color=hexOk(o.color)?o.color:""; o.color2=hexOk(o.color2)?o.color2:"";
  o.opacity=num(o.opacity,.4); o.speed=Math.max(.1,num(o.speed,1));
  o.density=Math.max(.2,Math.min(3,num(o.density,1))); o.size=Math.max(.3,Math.min(3,num(o.size,1)));
  o.pointer=o.pointer!==false&&o.pointer!=="false";
  return o;
}
/* Colour for shape i: one colour, two alternating, or the CMYK stripes of the Dorma D. */
const col=(o,i=0)=>o.palette==="brand"?BRAND[i%4]:o.palette==="two"&&i%2?"var(--fx2)":"var(--fx)";
/* Where an effect gathers (Left / Centre / Right), else its own default. */
const posX=(o,d=.74)=>({left:.24,center:.5,right:.76})[o.pos]??d;
/* Direction of travel as an angle; effects that move draw in a big square and turn it. */
const ANG={right:0,left:180,up:-90,down:90,diag:-28,diag2:28};
const angle=(o,d="right")=>ANG[o.dir]??ANG[d];
const turned=(o,d)=>S("g",{transform:`rotate(${angle(o,d)} ${W/2} ${H/2})`});
const pointerOn=(o,el,svg,fn)=>{ if (!o.pointer || !matchMedia("(pointer:fine)").matches) return;
  const h=e=>{ const r=svg.getBoundingClientRect(), k=Math.max(W/r.width,H/r.height); fn(W/2+(e.clientX-r.left-r.width/2)*k,H/2+(e.clientY-r.top-r.height/2)*k,e); };
  el.addEventListener("pointermove",h); return h; };
/** Plays forever, starting at a random point so many shapes don't move in step. */
const offset=t=>{ t.progress(Math.random()); return t; };

/* Each builder fills the SVG and returns {loops:[tweens that run while visible], enter:()=>timeline played once on first view}. */
const B={
  /* Topographic lines that draw themselves, then slowly turn and breathe. */
  contours(svg,o){
    const g=S("g",{fill:"none",stroke:"var(--fx)","stroke-width":1.2,"vector-effect":"non-scaling-stroke"}), paths=[];
    const cx=W*posX(o,.74), cy=H*.5, n=Math.round(9*o.density), step=58*o.size;
    for (let k=0;k<n;k++){ const R=70*o.size+k*step, pts=[];
      for (let a=0;a<=64;a++){ const t=a/64*Math.PI*2, r=R*(1+.12*Math.sin(t*3+k*.7)+.06*Math.sin(t*5-k)); pts.push([cx+Math.cos(t)*r*1.25,cy+Math.sin(t)*r]); }
      const p=S("path",{d:"M"+pts.map(p=>p.map(f1).join(" ")).join("L")+"Z",pathLength:1,opacity:(1-k/(n+2)).toFixed(2)}); paths.push(p); g.append(p); }
    svg.append(g);
    return { loops:[gsap.to(g,{rotation:360,svgOrigin:`${cx} ${cy}`,duration:180/o.speed,ease:"none",repeat:-1}),gsap.to(g,{scale:1.06,svgOrigin:`${cx} ${cy}`,duration:7/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1})],
      enter:()=>gsap.fromTo(paths,{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:2.4,ease:"power2.inOut",stagger:.12}) };
  },
  /* Concentric dashed rings turning at different speeds, with a dot travelling round one of them. */
  orbits(svg,o){
    const cx=W*posX(o,.78), cy=H*.52, z=o.size, sgn=o.dir==="left"?-1:1, g=S("g",{fill:"none",stroke:"var(--fx)","stroke-width":1.2,"vector-effect":"non-scaling-stroke"}), rings=[], loops=[];
    [[110,"2 9"],[190,"60 18"],[280,"1 7"],[380,"140 40 10 40"],[500,"3 14"]].forEach(([r,d],i)=>{ const c=S("circle",{cx,cy,r:r*z,"stroke-dasharray":d,opacity:(1-i*.15).toFixed(2)}); rings.push(c); g.append(c);
      loops.push(gsap.to(c,{rotation:(i%2?-360:360)*sgn,svgOrigin:`${cx} ${cy}`,duration:(40+i*18)/o.speed,ease:"none",repeat:-1})); });
    const dotG=S("g"), dot=S("circle",{cx:cx+280*z,cy,r:6,fill:"var(--fx)"}), halo=S("circle",{cx:cx+280*z,cy,r:16,fill:"none",stroke:"var(--fx)",opacity:.5}); dotG.append(halo,dot); g.append(dotG);
    loops.push(gsap.to(dotG,{rotation:360*sgn,svgOrigin:`${cx} ${cy}`,duration:14/o.speed,ease:"none",repeat:-1}),gsap.fromTo(halo,{attr:{r:8},opacity:.7},{attr:{r:26},opacity:0,duration:1.6,repeat:-1,ease:"power1.out"}));
    svg.append(g);
    return { loops, enter:()=>gsap.fromTo(rings,{scale:.6,autoAlpha:0,svgOrigin:`${cx} ${cy}`},{scale:1,autoAlpha:1,duration:1.6,ease:"expo.out",stagger:.1}) };
  },
  /* A fine grid shown only inside a soft spotlight (an SVG mask) that drifts and follows the pointer, with a scan line. */
  grid(svg,o,el){
    const id="fxg"+(++seq), defs=S("defs"), c=Math.round(56*o.size);
    const pat=S("pattern",{id:id+"p",width:c,height:c,patternUnits:"userSpaceOnUse"},S("path",{d:`M${c} 0H0V${c}`,fill:"none",stroke:"var(--fx)","stroke-width":1}));
    const grad=S("radialGradient",{id:id+"r"},S("stop",{offset:"0%","stop-color":"#fff","stop-opacity":1}),S("stop",{offset:"100%","stop-color":"#fff","stop-opacity":0}));
    const spot=S("circle",{cx:W*.7,cy:H*.4,r:420,fill:`url(#${id}r)`}), spot2=S("circle",{cx:W*.25,cy:H*.7,r:260,fill:`url(#${id}r)`,opacity:.6});
    const mask=S("mask",{id:id+"m"},S("rect",{width:W,height:H,fill:"#000"}),spot,spot2);
    defs.append(pat,grad,mask); svg.append(defs);
    const scan=S("rect",{x:0,y:0,width:W,height:2,fill:"var(--fx)",opacity:.8});
    svg.append(S("g",{mask:`url(#${id}m)`},S("rect",{width:W,height:H,fill:`url(#${id}p)`}),scan));
    const loops=[gsap.fromTo(spot,{attr:{cx:W*.62,cy:H*.35}},{attr:{cx:W*.82,cy:H*.6},duration:9/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1}),
      gsap.fromTo(spot2,{attr:{cx:W*.18}},{attr:{cx:W*.4},duration:12/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1}),
      gsap.fromTo(scan,{attr:{y:0}},{attr:{y:H},duration:6/o.speed,ease:"none",repeat:-1})];
    const qx=gsap.quickTo(spot2,"attr.cx",{duration:.9,ease:"power3.out"}), qy=gsap.quickTo(spot2,"attr.cy",{duration:.9,ease:"power3.out"});
    pointerOn(o,el,svg,(x,y)=>{ qx(x); qy(y); });
    return { loops, enter:()=>gsap.fromTo(spot,{attr:{r:0}},{attr:{r:420},duration:1.6,ease:"expo.out"}) };
  },
  /* Liquid colour: blobs merged by an SVG "goo" filter, drifting slowly. */
  goo(svg,o){
    const id="fxo"+(++seq), z=o.size;
    svg.append(S("defs",{},S("filter",{id,x:"-20%",y:"-20%",width:"140%",height:"140%"},S("feGaussianBlur",{in:"SourceGraphic",stdDeviation:38,result:"b"}),S("feColorMatrix",{in:"b",mode:"matrix",values:"1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"}))));
    const cols=o.palette==="single"?["var(--fx)","var(--fx)","var(--fx)","var(--fx)","var(--fx)"]:o.palette==="two"?["var(--fx)","var(--fx2)","var(--fx)","var(--fx2)","var(--fx)"]:[...BRAND,"var(--fx)"];
    const g=S("g",{filter:`url(#${id})`,opacity:.9}), R=i=>(110+(i%3)*40)*z, blobs=cols.map((c,i)=>S("circle",{cx:W*(.2+i*.15),cy:H*(.45+(i%2?.15:-.1)),r:R(i),fill:c,opacity:.55}));
    g.append(...blobs); svg.append(g);
    const loops=blobs.map((b,i)=>gsap.to(b,{attr:{cx:`+=${(i%2?-1:1)*(180+i*40)}`,cy:`+=${(i%3?-1:1)*(120+i*20)}`},duration:(8+i*2.5)/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1}));
    return { loops, enter:()=>gsap.fromTo(blobs,{attr:{r:0}},{attr:{r:i=>R(i)},duration:1.8,ease:"elastic.out(1,.6)",stagger:.12}) };
  },
  /* The CMYK stripes of the Dorma D, sliding; a gradient mask opens them as the section scrolls in. */
  stripes(svg,o,el){
    const id="fxs"+(++seq), lg=S("linearGradient",{id:id+"l",x1:0,y1:0,x2:1,y2:0},S("stop",{offset:0,"stop-color":"#fff","stop-opacity":0}),S("stop",{offset:".55","stop-color":"#fff","stop-opacity":1}),S("stop",{offset:1,"stop-color":"#fff","stop-opacity":.2}));
    const win=S("rect",{x:0,y:0,width:0,height:H,fill:`url(#${id}l)`});
    svg.append(S("defs",{},lg,S("mask",{id:id+"m"},win)));
    const band=turned(o,"diag"), inner=S("g"), w=44*o.size, gap=72*o.size, set=4*gap+300, cols=o.palette==="single"?[0,0,0,0].map(()=>"var(--fx)"):o.palette==="two"?["var(--fx)","var(--fx2)","var(--fx)","var(--fx2)"]:BRAND;
    for (let r=-1;r<Math.ceil(D*1.6/set)+1;r++) cols.forEach((c,i)=>inner.append(S("rect",{x:W/2-D+r*set+i*gap,y:H/2-D,width:w,height:D*2,fill:c,opacity:.8})));
    band.append(inner); svg.append(S("g",{mask:`url(#${id}m)`},band));
    const loops=[gsap.fromTo(inner,{x:0},{x:set,duration:26/o.speed,ease:"none",repeat:-1})];
    let st=null;
    if (reduce) win.setAttribute("width",W);
    else if (o.preview) loops.push(gsap.fromTo(win,{attr:{width:0}},{attr:{width:W},duration:2.4,ease:"power2.inOut",repeat:-1,yoyo:true,repeatDelay:1.5}));
    else st=gsap.fromTo(win,{attr:{width:0}},{attr:{width:W},ease:"none",scrollTrigger:{trigger:el,start:"top 85%",end:"center 45%",scrub:.6}});
    return { loops, enter:null, extra:st };
  },
  /* Layered waves that roll at different speeds. */
  waves(svg,o){
    const g=turned(o,"left"), ws=[], n=Math.max(2,Math.round(4*o.density));
    for (let k=0;k<n;k++){ const amp=(24+k*14)*o.size, y0=H/2+H*(.05+k*.32/n), per=(400+k*80)*o.size; let d=`M${W/2-D} ${y0}`;
      for (let x=W/2-D;x<=W/2+D+per;x+=per/2) d+=` Q ${f1(x+per/4)} ${f1(y0+(Math.round((x-(W/2-D))/(per/2))%2?amp:-amp))} ${f1(x+per/2)} ${y0}`;
      const p=S("path",{d,fill:"none",stroke:col(o,k),"stroke-width":1.4,"vector-effect":"non-scaling-stroke",opacity:(1-k*.7/n).toFixed(2)}); ws.push(p); g.append(p); }
    svg.append(g);
    return { loops:ws.map((p,k)=>gsap.fromTo(p,{x:0},{x:(400+k*80)*o.size,duration:(6+k*2)/o.speed,ease:"none",repeat:-1})),
      enter:()=>gsap.fromTo(ws,{y:60,autoAlpha:0},{y:0,autoAlpha:1,duration:1.4,ease:"expo.out",stagger:.12}) };
  },
  /* A circle mask that grows with the scroll, opening a glow of the effect colour with fine rings in it. */
  reveal(svg,o,el){
    const id="fxr"+(++seq), cx=W*posX(o,.5), cy=H*.5, step=60*o.size;
    const rg=S("radialGradient",{id:id+"g"},S("stop",{offset:0,"stop-color":"var(--fx)","stop-opacity":.55}),S("stop",{offset:1,"stop-color":"var(--fx)","stop-opacity":0}));
    const hole=S("circle",{cx,cy,r:0,fill:"#fff"});
    svg.append(S("defs",{},rg,S("mask",{id:id+"m"},hole)));
    const rings=S("g",{fill:"none",stroke:"var(--fx)","stroke-width":1,opacity:.6}); for (let r=step;r<1100;r+=step) rings.append(S("circle",{cx,cy,r}));
    svg.append(S("g",{mask:`url(#${id}m)`},S("rect",{width:W,height:H,fill:`url(#${id}g)`}),rings));
    const loops=[gsap.to(rings,{rotation:360,svgOrigin:`${cx} ${cy}`,duration:90/o.speed,ease:"none",repeat:-1})];
    let st=null;
    if (reduce) hole.setAttribute("r",1100);
    else if (o.preview) loops.push(gsap.fromTo(hole,{attr:{r:0}},{attr:{r:1100},duration:2.6,ease:"power2.inOut",repeat:-1,yoyo:true,repeatDelay:1.2}));
    else st=gsap.fromTo(hole,{attr:{r:0}},{attr:{r:1100},ease:"none",scrollTrigger:{trigger:el,start:"top 90%",end:"bottom 40%",scrub:.8}});
    return { loops, enter:null, extra:st };
  },
  /* The section's eyebrow (or label) as a huge outline word that draws itself, with light running through it. */
  type(svg,o,el,sec){
    const id="fxt"+(++seq), word=(plain(sec&&sec.eyebrow)||plain(sec&&sec.anchor)||plain(sec&&sec.title)||"Dorma").split(/\s+/).slice(0,2).join(" ").slice(0,18);
    const lg=S("linearGradient",{id:id+"l",gradientUnits:"userSpaceOnUse",x1:-400,y1:0,x2:0,y2:0},S("stop",{offset:0,"stop-color":"#fff","stop-opacity":.25}),S("stop",{offset:.5,"stop-color":"#fff","stop-opacity":1}),S("stop",{offset:1,"stop-color":"#fff","stop-opacity":.25}));
    const mrect=S("rect",{width:W,height:H,fill:`url(#${id}l)`});
    svg.append(S("defs",{},lg,S("mask",{id:id+"m"},mrect)));
    const t=S("text",{x:W/2,y:H*.62,"text-anchor":"middle",fill:"none",stroke:"var(--fx)","stroke-width":1.5,"font-size":Math.round((word.length>10?190:250)*o.size),style:"font-family:var(--display);font-weight:600;letter-spacing:-.04em"});
    t.textContent=word; svg.append(S("g",{mask:`url(#${id}m)`},t));
    return { loops:[gsap.fromTo(lg,{attr:{x1:-400,x2:0}},{attr:{x1:W,x2:W+400},duration:5/o.speed,ease:"sine.inOut",repeat:-1,repeatDelay:.6})],
      enter:()=>gsap.fromTo(t,{strokeDasharray:"3000",strokeDashoffset:3000},{strokeDashoffset:0,duration:3.2,ease:"power2.inOut"}) };
  },

  /* Points drifting about, linked by lines that fade with distance; the pointer joins in as one more point. */
  constellation(svg,o,el){
    const n=Math.round(34*o.density), reach=240*o.size, P=[], lines=S("g",{stroke:"var(--fx)","stroke-width":1,"vector-effect":"non-scaling-stroke"}), dots=S("g");
    for (let i=0;i<n;i++){ const p={x:rnd(0,W),y:rnd(0,H)}; p.c=S("circle",{r:f1(rnd(1.8,4)*o.size),fill:col(o,i)}); dots.append(p.c); P.push(p); }
    const pairs=[]; for (let i=0;i<n;i++) for (let j=i+1;j<n;j++){ if (Math.hypot(P[i].x-P[j].x,P[i].y-P[j].y)<reach*1.3 && pairs.length<160){ const l=S("line"); lines.append(l); pairs.push([P[i],P[j],l]); } }
    const cur={x:-999,y:-999}, cl=P.map(()=>{ const l=S("line",{opacity:0}); lines.append(l); return l; });
    svg.append(lines,dots);
    const draw=()=>{ P.forEach(p=>{ p.c.setAttribute("cx",f1(p.x)); p.c.setAttribute("cy",f1(p.y)); });
      pairs.forEach(([a,b,l])=>{ const d=Math.hypot(a.x-b.x,a.y-b.y); l.setAttribute("x1",f1(a.x)); l.setAttribute("y1",f1(a.y)); l.setAttribute("x2",f1(b.x)); l.setAttribute("y2",f1(b.y)); l.setAttribute("opacity",Math.max(0,1-d/reach).toFixed(2)); });
      P.forEach((p,i)=>{ const d=Math.hypot(p.x-cur.x,p.y-cur.y), l=cl[i]; l.setAttribute("opacity",Math.max(0,1-d/(reach*1.2)).toFixed(2)); if (d<reach*1.2){ l.setAttribute("x1",f1(p.x)); l.setAttribute("y1",f1(p.y)); l.setAttribute("x2",f1(cur.x)); l.setAttribute("y2",f1(cur.y)); } }); };
    const loops=P.map(p=>offset(gsap.to(p,{x:`+=${rnd(-140,140)}`,y:`+=${rnd(-90,90)}`,duration:rnd(6,12)/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1})));
    loops.push(gsap.to({},{duration:1,repeat:-1,onUpdate:draw})); draw();
    pointerOn(o,el,svg,(x,y)=>{ cur.x=x; cur.y=y; });
    return { loops, enter:()=>gsap.fromTo(P.map(p=>p.c),{scale:0,transformOrigin:"50% 50%"},{scale:1,duration:.8,ease:"back.out(3)",stagger:{each:.02,from:"random"}}) };
  },
  /* Two screens of print dots (like CMYK halftone) shown through soft lights that wander, one following the pointer. */
  halftone(svg,o,el){
    const id="fxh"+(++seq), step=Math.round(22*o.size), r=f1(step*.3);
    const pat=(k,a,c)=>S("pattern",{id:id+k,width:step,height:step,patternUnits:"userSpaceOnUse",patternTransform:`rotate(${a})`},S("circle",{cx:step/2,cy:step/2,r,fill:c}));
    const c1=o.palette==="brand"?BRAND[2]:"var(--fx)", c2=o.palette==="brand"?BRAND[0]:o.palette==="two"?"var(--fx2)":"var(--fx)";
    const grad=S("radialGradient",{id:id+"r"},S("stop",{offset:"0%","stop-color":"#fff","stop-opacity":1}),S("stop",{offset:"100%","stop-color":"#fff","stop-opacity":0}));
    const lights=[[.72,.4,460],[.3,.7,320],[.55,.2,260]].map(([x,y,rr])=>S("circle",{cx:W*x,cy:H*y,r:rr,fill:`url(#${id}r)`}));
    svg.append(S("defs",{},pat("a",15,c1),pat("b",75,c2),grad,S("mask",{id:id+"m"},S("rect",{width:W,height:H,fill:"#000"}),...lights)));
    const g=S("g",{mask:`url(#${id}m)`},S("rect",{width:W,height:H,fill:`url(#${id}a)`,opacity:.85}),S("rect",{width:W,height:H,fill:`url(#${id}b)`,opacity:.65,x:step/3}));
    svg.append(g);
    const qx=gsap.quickTo(lights[1],"attr.cx",{duration:.8,ease:"power3.out"}), qy=gsap.quickTo(lights[1],"attr.cy",{duration:.8,ease:"power3.out"});
    const follow=!!pointerOn(o,el,svg,(x,y)=>{ qx(x); qy(y); });
    const loops=lights.map((l,i)=>follow&&i===1?null:gsap.to(l,{attr:{cx:`+=${(i%2?1:-1)*rnd(220,380)}`,cy:`+=${(i?-1:1)*rnd(120,220)}`},duration:rnd(7,11)/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1}));
    return { loops, enter:()=>gsap.fromTo(lights,{attr:{r:0}},{attr:{r:i=>[460,320,260][i]},duration:1.6,ease:"expo.out",stagger:.15}) };
  },
  /* A sunburst of thin wedges turning slowly, fading out towards the edges. */
  rays(svg,o){
    const id="fxy"+(++seq), cx=W*posX(o,.7), cy=H*.55, n=Math.max(6,Math.round(24*o.density)), R=1400, half=Math.PI/n*.35*o.size;
    const rg=S("radialGradient",{id:id+"g",gradientUnits:"userSpaceOnUse",cx,cy,r:900},S("stop",{offset:0,"stop-color":"#fff","stop-opacity":1}),S("stop",{offset:.15,"stop-color":"#fff","stop-opacity":.9}),S("stop",{offset:1,"stop-color":"#fff","stop-opacity":0}));
    svg.append(S("defs",{},rg,S("mask",{id:id+"m"},S("rect",{width:W,height:H,fill:`url(#${id}g)`}))));
    const g=S("g"); for (let i=0;i<n;i++){ const a=i/n*Math.PI*2; g.append(S("path",{d:`M${cx} ${cy}L${f1(cx+Math.cos(a-half)*R)} ${f1(cy+Math.sin(a-half)*R)}L${f1(cx+Math.cos(a+half)*R)} ${f1(cy+Math.sin(a+half)*R)}Z`,fill:col(o,i),opacity:i%2?.5:.8})); }
    svg.append(S("g",{mask:`url(#${id}m)`},g));
    return { loops:[gsap.to(g,{rotation:o.dir==="left"?-360:360,svgOrigin:`${cx} ${cy}`,duration:120/o.speed,ease:"none",repeat:-1})],
      enter:()=>gsap.fromTo(g,{scale:.2,autoAlpha:0,svgOrigin:`${cx} ${cy}`},{scale:1,autoAlpha:1,duration:2,ease:"expo.out"}) };
  },
  /* A spiral that draws itself, then keeps turning. */
  spiral(svg,o){
    const cx=W*posX(o,.72), cy=H*.5, arms=o.palette==="single"?1:2, g=S("g",{fill:"none","stroke-width":1.4,"vector-effect":"non-scaling-stroke"}), ps=[];
    for (let a=0;a<arms;a++){ const pts=[]; for (let t=0;t<=8*Math.PI;t+=.12){ const r=(8+t*26)*o.size, q=t+a*Math.PI; pts.push(f1(cx+Math.cos(q)*r)+" "+f1(cy+Math.sin(q)*r)); }
      const p=S("path",{d:"M"+pts.join("L"),stroke:col(o,a),pathLength:1}); ps.push(p); g.append(p); }
    svg.append(g);
    return { loops:[gsap.to(g,{rotation:o.dir==="left"?-360:360,svgOrigin:`${cx} ${cy}`,duration:60/o.speed,ease:"none",repeat:-1}),gsap.to(g,{scale:1.08,svgOrigin:`${cx} ${cy}`,duration:6/o.speed,yoyo:true,repeat:-1,ease:"sine.inOut"})],
      enter:()=>gsap.fromTo(ps,{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:3,ease:"power2.inOut"}) };
  },
  /* Rings rising (or falling) with a gentle sideways sway. */
  bubbles(svg,o){
    const n=Math.round(24*o.density), down=o.dir==="down", g=S("g"), loops=[], bs=[];
    for (let i=0;i<n;i++){ const r=rnd(6,34)*o.size, x=rnd(0,W), fill=i%4===0;
      const c=S("circle",{cx:x,cy:0,r:f1(r),fill:fill?col(o,i):"none",stroke:col(o,i),"stroke-width":1.2,opacity:f1(rnd(.35,.9)),"vector-effect":"non-scaling-stroke"}); g.append(c); bs.push(c);
      loops.push(offset(gsap.fromTo(c,{attr:{cy:down?-r:H+r}},{attr:{cy:down?H+r:-r},duration:rnd(9,18)/o.speed,ease:"none",repeat:-1})),
        offset(gsap.to(c,{attr:{cx:x+rnd(-40,40)},duration:rnd(2.5,4.5)/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1}))); }
    svg.append(g);
    return { loops, enter:()=>gsap.fromTo(bs,{scale:0,transformOrigin:"50% 50%"},{scale:1,duration:.9,ease:"back.out(2)",stagger:{each:.03,from:"random"}}) };
  },
  /* Thin streaks of light shooting across. */
  streaks(svg,o){
    const g=turned(o,"right"), n=Math.round(30*o.density), loops=[];
    for (let i=0;i<n;i++){ const L=rnd(80,280)*o.size, y=H/2+rnd(-D/2,D/2);
      const l=S("line",{x1:0,y1:y,x2:L,y2:y,stroke:col(o,i),"stroke-width":f1(rnd(.8,2.2)),"stroke-linecap":"round",opacity:f1(rnd(.3,1)),"vector-effect":"non-scaling-stroke"}); g.append(l);
      loops.push(offset(gsap.fromTo(l,{x:W/2-D/2-L},{x:W/2+D/2,duration:rnd(2.5,6)/o.speed,ease:"none",repeat:-1,repeatDelay:rnd(0,2)}))); }
    svg.append(g);
    return { loops, enter:null };
  },
  /* A honeycomb of fine cells; some light up and fade in turn. */
  hexagons(svg,o){
    const R=46*o.size, w=Math.sqrt(3)*R, cells=[]; let d="";
    for (let row=-1;row*R*1.5<H+R;row++) for (let c=-1;c*w<W+w;c++){ const cx=c*w+(row%2?w/2:0), cy=row*R*1.5;
      const pts=[0,1,2,3,4,5].map(k=>{ const a=Math.PI/3*k+Math.PI/6; return f1(cx+Math.cos(a)*R*.94)+" "+f1(cy+Math.sin(a)*R*.94); }); d+="M"+pts.join("L")+"Z"; cells.push(pts); }
    const lit=S("g"), on=[]; cells.forEach((p,i)=>{ if (Math.random()<.12*o.density){ const e=S("path",{d:"M"+p.join("L")+"Z",fill:col(o,on.length),opacity:0}); lit.append(e); on.push(e); } });
    svg.append(S("path",{d,fill:"none",stroke:"var(--fx)","stroke-width":1,opacity:.35,"vector-effect":"non-scaling-stroke"}),lit);
    return { loops:on.length?[gsap.to(on,{opacity:.6,duration:1.4/o.speed,ease:"sine.inOut",stagger:{each:.35/o.speed,repeat:-1,yoyo:true,from:"random"}})]:[],
      enter:()=>gsap.fromTo(svg.firstElementChild,{opacity:0},{opacity:.35,duration:1.6}) };
  },
  /* A grid of squares that turn and shrink in a wave from one point. */
  tiles(svg,o){
    const cols=Math.max(6,Math.round(16*o.density)), cell=W/cols, rows=Math.ceil(H/cell), s=cell*.42*o.size, g=S("g"), rs=[];
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++){ const e=S("rect",{x:f1(c*cell+(cell-s)/2),y:f1(r*cell+(cell-s)/2),width:f1(s),height:f1(s),fill:"none",stroke:col(o,r+c),"stroke-width":1.2,"vector-effect":"non-scaling-stroke"}); g.append(e); rs.push(e); }
    svg.append(g); const from={left:"start",right:"end",center:"center"}[o.pos]||"center";
    return { loops:[gsap.to(rs,{rotation:90,scale:.35,transformOrigin:"50% 50%",duration:1.2/o.speed,ease:"sine.inOut",stagger:{grid:[rows,cols],from,each:.08/o.speed,repeat:-1,yoyo:true}})],
      enter:()=>gsap.fromTo(rs,{autoAlpha:0},{autoAlpha:1,duration:.4,stagger:{grid:[rows,cols],from,each:.02}}) };
  },
  /* Soft ribbons of light that bend and glow, like an aurora. */
  aurora(svg,o){
    const id="fxa"+(++seq), z=o.size;
    svg.append(S("defs",{},S("filter",{id,x:"-30%",y:"-30%",width:"160%",height:"160%"},S("feGaussianBlur",{stdDeviation:50*z}))));
    const shape=(k,ph)=>{ let d=`M${-200} ${H*(.3+k*.18)}`; for (let i=0;i<=6;i++){ const x=-200+i*(W+400)/6, y=H*(.3+k*.18)+Math.sin(i*1.3+ph+k)*120*z; d+=` S ${f1(x-60)} ${f1(y)} ${f1(x)} ${f1(y)}`; } return d; };
    const cols=o.palette==="brand"?[BRAND[2],BRAND[0],BRAND[1]]:["var(--fx)",o.palette==="two"?"var(--fx2)":"var(--fx)","var(--fx)"];
    const g=S("g",{filter:`url(#${id})`,fill:"none","stroke-linecap":"round"}), ps=[0,1,2].map(k=>S("path",{d:shape(k,0),stroke:cols[k],"stroke-width":f1(120*z),opacity:.55}));
    g.append(...ps); svg.append(g);
    return { loops:ps.map((p,k)=>gsap.to(p,{attr:{d:shape(k,2.4)},duration:(9+k*3)/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1})).concat(gsap.to(g,{x:-120,duration:14/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1})),
      enter:()=>gsap.fromTo(ps,{opacity:0},{opacity:.55,duration:2.4,stagger:.3}) };
  },
  /* Colour clouds pushed about by turbulence, like ink dropped in water. */
  ink(svg,o){
    const id="fxi"+(++seq), turb=S("feTurbulence",{type:"fractalNoise",baseFrequency:.007,numOctaves:2,seed:Math.round(rnd(1,99))});
    svg.append(S("defs",{},S("filter",{id,x:"-20%",y:"-20%",width:"140%",height:"140%"},turb,S("feDisplacementMap",{in:"SourceGraphic",scale:160*o.size,xChannelSelector:"R",yChannelSelector:"G"}),S("feGaussianBlur",{stdDeviation:6}))));
    const cx=W*posX(o,.7), cols=o.palette==="brand"?BRAND:["var(--fx)",o.palette==="two"?"var(--fx2)":"var(--fx)","var(--fx)"];
    const g=S("g",{filter:`url(#${id})`}), bl=cols.map((c,i)=>S("circle",{cx:cx+(i-1)*140*o.size,cy:H*(.4+(i%2)*.2),r:f1(170*o.size),fill:c,opacity:.6}));
    g.append(...bl); svg.append(g);
    const proxy={f:.007};
    return { loops:[gsap.to(proxy,{f:.013,duration:10/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1,onUpdate:()=>turb.setAttribute("baseFrequency",proxy.f.toFixed(4))}),
      gsap.to(g,{rotation:360,svgOrigin:`${cx} ${H/2}`,duration:60/o.speed,ease:"none",repeat:-1})],
      enter:()=>gsap.fromTo(bl,{attr:{r:0}},{attr:{r:170*o.size},duration:2.2,ease:"expo.out",stagger:.2}) };
  },
  /* Printer's registration marks in cyan, magenta and yellow that drift out of line and snap back, with crop marks. */
  registration(svg,o){
    const n=Math.max(2,Math.round(6*o.density)), loops=[], marks=[], CMY=[BRAND[2],BRAND[0],BRAND[1]];
    for (let i=0;i<n;i++){ const x=W*(.45+.5*((i*.618)%1)), y=H*(.15+.7*((i*.382+.2)%1)), R=rnd(22,46)*o.size, mk=S("g");
      CMY.forEach((c,k)=>{ const m=S("g",{fill:"none",stroke:c,"stroke-width":1.4,"vector-effect":"non-scaling-stroke",style:"mix-blend-mode:screen"},S("circle",{cx:x,cy:y,r:f1(R)}),S("circle",{cx:x,cy:y,r:f1(R*.45)}),S("path",{d:`M${f1(x-R*1.6)} ${y}H${f1(x+R*1.6)}M${x} ${f1(y-R*1.6)}V${f1(y+R*1.6)}`}));
        mk.append(m); loops.push(offset(gsap.fromTo(m,{x:0,y:0},{x:rnd(-10,10)*(k+1),y:rnd(-8,8)*(k+1),duration:rnd(1.6,3)/o.speed,ease:"power2.inOut",yoyo:true,repeat:-1,repeatDelay:rnd(.4,1.5)}))); });
      svg.append(mk); marks.push(mk); }
    const crop=S("path",{d:`M${W*.4} ${H*.1}h-40M${W*.4} ${H*.1}v-40M${W*.96} ${H*.1}h40M${W*.96} ${H*.1}v-40M${W*.4} ${H*.9}h-40M${W*.4} ${H*.9}v40M${W*.96} ${H*.9}h40M${W*.96} ${H*.9}v40`,fill:"none",stroke:"var(--fx)","stroke-width":1.2,"vector-effect":"non-scaling-stroke",pathLength:1});
    const bar=S("g"); [...BRAND,"#000","#fff"].forEach((c,i)=>bar.append(S("rect",{x:W*.42+i*34,y:H*.93,width:28,height:12,fill:c,opacity:.8})));
    svg.append(crop,bar);
    return { loops, enter:()=>gsap.timeline().fromTo(crop,{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,duration:1.6,ease:"power2.inOut"}).fromTo(marks,{scale:0,transformOrigin:"50% 50%"},{scale:1,duration:.8,ease:"back.out(2)",stagger:.1},.3).fromTo(bar.children,{scaleY:0,transformOrigin:"50% 100%"},{scaleY:1,stagger:.05,duration:.4},.6) };
  },
  /* Rows of chevrons sliding along. */
  zigzag(svg,o){
    const g=turned(o,"right"), per=60*o.size, amp=18*o.size, n=Math.min(40,Math.max(3,Math.round(D/(120*o.size)*o.density))), loops=[];
    for (let k=0;k<n;k++){ const y=H/2-D/2+(k+.5)*D/n; let d=`M${f1(W/2-D/2-per*2)} ${f1(y)}`;
      for (let x=W/2-D/2-per*2,i=0;x<W/2+D/2+per;x+=per/2,i++) d+=`L${f1(x+per/2)} ${f1(y+(i%2?-amp:amp))}`;
      const p=S("path",{d,fill:"none",stroke:col(o,k),"stroke-width":1.4,"vector-effect":"non-scaling-stroke",opacity:f1(.4+.6*((k%3)/2))}); g.append(p);
      loops.push(gsap.fromTo(p,{x:0},{x:per,duration:(1.5+(k%3)*.6)/o.speed,ease:"none",repeat:-1})); }
    svg.append(g);
    return { loops, enter:()=>gsap.fromTo(g.children,{autoAlpha:0},{autoAlpha:1,duration:.8,stagger:.08}) };
  },
  /* Rings spreading out from a few points (one follows the pointer). */
  ripples(svg,o,el){
    const n=Math.max(1,Math.round(4*o.density)), loops=[], srcs=[];
    for (let i=0;i<n;i++){ const g=S("g",{transform:`translate(${f1(rnd(W*.35,W*.95))} ${f1(rnd(H*.15,H*.85))})`}), Rm=rnd(160,280)*o.size; srcs.push(g);
      const cs=[0,1,2].map(()=>S("circle",{r:0,fill:"none",stroke:col(o,i),"stroke-width":1.4,"vector-effect":"non-scaling-stroke"})); g.append(...cs); svg.append(g);
      loops.push(offset(gsap.fromTo(cs,{attr:{r:0},opacity:.9},{attr:{r:Rm},opacity:0,duration:3.2/o.speed,ease:"power1.out",stagger:{each:1.05/o.speed,repeat:-1}}))); }
    const p=srcs[0], qx=gsap.quickTo(p,"x",{duration:1,ease:"power3.out"}), qy=gsap.quickTo(p,"y",{duration:1,ease:"power3.out"});
    if (pointerOn(o,el,svg,(x,y)=>{ qx(x); qy(y); })){ p.removeAttribute("transform"); gsap.set(p,{x:W*.7,y:H*.5}); }
    return { loops, enter:null };
  },
  /* Small stars that twinkle and drift; with the pointer on, they shift a little for depth. */
  starfield(svg,o,el){
    const n=Math.round(110*o.density), g=S("g"), far=S("g"), ss=[];
    for (let i=0;i<n;i++){ const s=S("circle",{cx:f1(rnd(-60,W+60)),cy:f1(rnd(-60,H+60)),r:f1(rnd(.6,2.4)*o.size),fill:col(o,i),opacity:f1(rnd(.3,1))}); (i%3?far:g).append(s); ss.push(s); }
    svg.append(far,g); const a=angle(o,"left")*Math.PI/180;
    const loops=[gsap.to(ss,{opacity:.1,duration:1.2/o.speed,ease:"sine.inOut",stagger:{each:.05,repeat:-1,yoyo:true,from:"random"}}),
      gsap.to(g,{x:Math.cos(a)*60,y:Math.sin(a)*60,duration:12/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1}),gsap.to(far,{x:Math.cos(a)*25,y:Math.sin(a)*25,duration:12/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1})];
    const px=gsap.quickTo(svg,"x",{duration:1.2,ease:"power3.out"}), py=gsap.quickTo(svg,"y",{duration:1.2,ease:"power3.out"});
    pointerOn(o,el,svg,(x,y)=>{ px((x-W/2)/W*-30); py((y-H/2)/H*-20); });
    return { loops, enter:()=>gsap.fromTo(ss,{opacity:0},{opacity:i=>f1(rnd(.3,1)),duration:1.4,stagger:{each:.005,from:"random"}}) };
  },
  /* A grid of dots rolling like a wave. */
  dotwave(svg,o){
    const cols=Math.max(10,Math.round(30*o.density)), gap=W/cols, rows=Math.ceil(H/gap), ds=[], g=S("g");
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++){ const d=S("circle",{cx:f1((c+.5)*gap),cy:f1((r+.5)*gap),r:f1(2.2*o.size),fill:col(o,r+c)}); g.append(d); ds.push(d); }
    svg.append(g); const from={left:"end",right:"start",up:"end",down:"start"}[o.dir]||"start", axis=o.dir==="up"||o.dir==="down"?"y":"x";
    return { loops:[gsap.to(ds,{y:-16*o.size,scale:1.6,transformOrigin:"50% 50%",duration:.9/o.speed,ease:"sine.inOut",stagger:{grid:[rows,cols],axis,from,each:.06/o.speed,repeat:-1,yoyo:true}})],
      enter:()=>gsap.fromTo(ds,{opacity:0},{opacity:1,duration:.5,stagger:{grid:[rows,cols],from:"center",each:.01}}) };
  },
  /* Wide soft beams of light sweeping across. */
  beams(svg,o){
    const id="fxb"+(++seq), g=turned(o,"right"), n=Math.max(1,Math.round(4*o.density)), loops=[], defs=S("defs");
    for (let i=0;i<n;i++){ const gid=id+"g"+i, w=rnd(120,260)*o.size, c=col(o,i);
      defs.append(S("linearGradient",{id:gid},S("stop",{offset:0,"stop-color":c,"stop-opacity":0}),S("stop",{offset:.5,"stop-color":c,"stop-opacity":.55}),S("stop",{offset:1,"stop-color":c,"stop-opacity":0})));
      const r=S("rect",{x:0,y:H/2-D/2,width:f1(w),height:D,fill:`url(#${gid})`}); g.append(r);
      loops.push(offset(gsap.fromTo(r,{x:W/2-D/2-w},{x:W/2+D/2,duration:rnd(6,11)/o.speed,ease:"sine.inOut",repeat:-1,repeatDelay:rnd(0,1.5)}))); }
    svg.append(defs,g);
    return { loops, enter:null };
  },
  /* A soft blob that keeps changing shape (path points tweened between shapes of the same build). */
  morph(svg,o){
    const cx=W*posX(o,.72), cy=H*.5, R=230*o.size, K=8;
    const shape=()=>{ const p=[...Array(K)].map((_,i)=>{ const a=i/K*Math.PI*2, r=R*rnd(.72,1.18); return [cx+Math.cos(a)*r,cy+Math.sin(a)*r]; });
      let d=`M${f1(p[0][0])} ${f1(p[0][1])}`; for (let i=0;i<K;i++){ const p0=p[(i-1+K)%K], p1=p[i], p2=p[(i+1)%K], p3=p[(i+2)%K];
        d+=`C${f1(p1[0]+(p2[0]-p0[0])/6)} ${f1(p1[1]+(p2[1]-p0[1])/6)} ${f1(p2[0]-(p3[0]-p1[0])/6)} ${f1(p2[1]-(p3[1]-p1[1])/6)} ${f1(p2[0])} ${f1(p2[1])}`; } return d+"Z"; };
    const layers=(o.palette==="single"?[0]:[0,1,2]).map(i=>S("path",{d:shape(),fill:o.palette==="brand"?BRAND[i]:col(o,i),opacity:o.palette==="single"?.55:.35,style:o.palette==="single"?"":"mix-blend-mode:screen"}));
    svg.append(...layers);
    const loops=layers.map((p,i)=>{ const tl=gsap.timeline({repeat:-1,yoyo:true}); for (let k=0;k<3;k++) tl.to(p,{attr:{d:shape()},duration:(4+i)/o.speed,ease:"sine.inOut"}); return tl; });
    loops.push(gsap.to(layers,{rotation:360,svgOrigin:`${cx} ${cy}`,duration:50/o.speed,ease:"none",repeat:-1}));
    return { loops, enter:()=>gsap.fromTo(layers,{scale:0,svgOrigin:`${cx} ${cy}`},{scale:1,duration:1.6,ease:"elastic.out(1,.5)",stagger:.12}) };
  },
  /* Outline circles, squares, triangles and plus signs floating and turning. */
  shapes(svg,o){
    const n=Math.round(20*o.density), loops=[], all=[];
    for (let i=0;i<n;i++){ const x=rnd(W*.05,W*.98), y=rnd(H*.05,H*.95), s=rnd(12,34)*o.size, c=col(o,i), k=i%4, at={fill:"none",stroke:c,"stroke-width":1.5,"vector-effect":"non-scaling-stroke"};
      const e=k===0?S("circle",{cx:x,cy:y,r:f1(s/2),...at}):k===1?S("rect",{x:f1(x-s/2),y:f1(y-s/2),width:f1(s),height:f1(s),...at}):k===2?S("path",{d:`M${f1(x)} ${f1(y-s/2)}L${f1(x+s/2)} ${f1(y+s/2)}L${f1(x-s/2)} ${f1(y+s/2)}Z`,...at}):S("path",{d:`M${f1(x-s/2)} ${f1(y)}H${f1(x+s/2)}M${f1(x)} ${f1(y-s/2)}V${f1(y+s/2)}`,...at});
      svg.append(e); all.push(e);
      loops.push(offset(gsap.to(e,{y:rnd(-50,50),x:rnd(-30,30),duration:rnd(4,8)/o.speed,ease:"sine.inOut",yoyo:true,repeat:-1})),gsap.to(e,{rotation:(i%2?-1:1)*360,transformOrigin:"50% 50%",duration:rnd(14,30)/o.speed,ease:"none",repeat:-1})); }
    return { loops, enter:()=>gsap.fromTo(all,{scale:0,transformOrigin:"50% 50%"},{scale:1,duration:.9,ease:"back.out(2.4)",stagger:{each:.04,from:"random"}}) };
  }
};

/** The effect layer (div + svg) for a set of settings; the caller places it. */
function fxLayer(o){
  const layer=document.createElement("div"); layer.className="sfx sfx-"+o.type+(o.soften?" sfx-soft-"+o.soften:""); layer.setAttribute("aria-hidden","true");
  layer.style.opacity=String(Math.max(0,Math.min(1,o.opacity))); if (o.color) layer.style.setProperty("--fx",o.color); if (o.color2) layer.style.setProperty("--fx2",o.color2);
  const svg=S("svg",{viewBox:`0 0 ${W} ${H}`,preserveAspectRatio:"xMidYMid slice"}); layer.append(svg);
  return {layer,svg};
}
/** Builds the effect layer inside a section. Returns a starter (run after the page renders) or null. */
function sectionFx(cfg,sec,el){
  const o=fxFor(cfg,sec); if (!o.type||o.type==="none"||!B[o.type]||typeof document==="undefined") return null;
  const {layer,svg}=fxLayer(o);
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
/** A live preview of an effect in a studio box. Returns a function that stops and clears it. */
function fxPreview(box,settings,sec){
  const o={...fxFor({theme:{sections:{bgfx:settings}}},null),preview:true};
  box.querySelectorAll(":scope > .sfx-host").forEach(n=>n.remove());
  if (!o.type||o.type==="none"||!B[o.type]) return ()=>{};
  const {layer,svg}=fxLayer(o), host=document.createElement("div"); host.className="sfx-host"; host.append(layer); box.prepend(host);
  const ctx=gsap.context(()=>{ let r={}; try { r=B[o.type](svg,o,host,sec||{eyebrow:"Dorma"})||{}; } catch(e){ console.error("effect preview",e); }
    const loops=(r.loops||[]).filter(Boolean); if (reduce){ loops.forEach(t=>{ t.progress(.35); t.pause(); }); return; } if (r.enter) r.enter(); });
  return ()=>{ ctx.revert(); host.remove(); };
}

export { sectionFx, fxFor, fxPreview, FX, FX_TYPES, FX_OPTIONS, FX_DEFAULTS, BRAND };
