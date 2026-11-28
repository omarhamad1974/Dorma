import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, h, esc, ARROW_SVG, iconSvg, hexOk, reduce, revealTitle, runAction, logoFor, logoHtml, siteMode, captionEl, mediaBox, mediaItem, mediaUrl, overlayEl } from './core';
import { SHAPES } from './motionfx';

/* ================= SECTION EXTRAS =================
   Things the admin can add to any section without code (studio: Pages → section → "Icon, text, logo and button"):
   - an icon before, after or above the section's title, and on each card, accordion row, chapter, linked item or slide;
   - hide the subtitle (eyebrow, caption, tags), the title or the text of a section, card or row, without deleting it;
   - a logo and a call-to-action button placed above or below the section's content, with size and animation;
   - heading styles (gradient, shimmer, glow, outline, marker, underline, CMYK offset), heading entrances
     (letters, words, blur, typewriter) and card hover effects.
   Two section types live here too: "Photo only" (mask shapes, opacity, filters) and "Logo".
   Every choice left empty follows Design → Global style → Headings, icons and cards (cfg.motion.deco). */

const DECO_DEFAULTS={ headStyle:"none", headIn:"", cardHover:"none", iconAnim:"pop", iconSize:.9 };
const decoFor=cfg=>({...DECO_DEFAULTS,...((cfg&&cfg.motion&&cfg.motion.deco)||{})});
const pick=(own,glob)=>own===undefined||own===null||own===""||own==="default"?glob:own;

/* ---------- hiding parts ----------
   The section is copied with the hidden parts emptied, so every section type simply has nothing to draw there.
   Grid and catalog cards keep their tag and type values for the filters; their renderers check hideSub themselves. */
const ITEM_SUB={ chapters:["caption"], accordion:["tags"], quotes:["role"] };
function hideParts(sec){
  if (!sec || typeof sec!=="object") return sec;
  const items=Array.isArray(sec.items)&&sec.items.some(it=>it&&(it.hideSub||it.hideText));
  const slides=Array.isArray(sec.slides)&&sec.slides.some(s=>s&&(s.hideSub||s.hideText));
  if (!sec.hideSub && !sec.hideTitle && !sec.hideText && !items && !slides) return sec;
  const s={...sec};
  if (s.hideSub){ s.eyebrow=""; s.num=""; if (s.type==="banner"||s.type==="photo") s.caption=[]; }
  if (s.hideTitle) s.title="";
  if (s.hideText){ s.text=""; s.lede=""; if (s.type==="article") s.body=""; }
  if (items) s.items=s.items.map(it=>{ if (!it||!(it.hideSub||it.hideText)) return it; const c={...it};
    if (c.hideSub) (ITEM_SUB[s.type]||[]).forEach(k=>{ c[k]=Array.isArray(c[k])?[]:""; });
    if (c.hideText){ c.text=""; if (s.type==="chapters") c.bullets=[]; }
    return c; });
  if (slides) s.slides=s.slides.map(sl=>sl&&(sl.hideSub||sl.hideText)?{...sl,eyebrow:sl.hideSub?"":sl.eyebrow,lede:sl.hideText?"":sl.lede}:sl);
  return s;
}

/* ---------- seeing things arrive ----------
   One observer for every entrance below: .in is added when the element scrolls into view (once). */
let IO=null;
function whenSeen(el,fn){
  if (reduce || typeof IntersectionObserver==="undefined"){ fn(); return; }
  if (!IO) IO=new IntersectionObserver(es=>es.forEach(e=>{ if (e.isIntersecting){ IO.unobserve(e.target); const fs=e.target._seen||[]; e.target._seen=null; fs.forEach(f=>f()); } }),{rootMargin:"0px 0px -8% 0px"});
  (el._seen=el._seen||[]).push(fn); IO.observe(el);
}
const arrive=(el,delay=0)=>{ if (delay) el.style.setProperty("--fx-delay",(+delay||0)+"s"); el.classList.add("fx-wait"); whenSeen(el,()=>el.classList.add("in")); };

/* ---------- icons by a title ----------
   The title is wrapped with its icon (the title element itself is untouched, so letter reveals keep working).
   The icon is sized from the title's own font size, measured as it changes with the window. */
function iconSpec(cfg,o,base={}){
  const D=decoFor(cfg), id=o&&o.headIcon; if (!id) return null;
  const svg=iconSvg(cfg,id); if (!svg) return null;
  return { svg, pos:["before","after","above"].includes(o.headIconPos)?o.headIconPos:(base.headIconPos||"before"),
    size:Math.max(.2,Math.min(4,+pick(o.headIconSize,pick(base.headIconSize,D.iconSize))||.9)),
    color:hexOk(o.headIconColor)?o.headIconColor:(hexOk(base.headIconColor)?base.headIconColor:""),
    anim:pick(o.headIconAnim,pick(base.headIconAnim,D.iconAnim)) };
}
let RO=null;
const sizeOf=head=>{ const fs=parseFloat(getComputedStyle(head).fontSize)||32; return fs+"px"; };
function measure(wrap,head){
  const set=()=>wrap.style.setProperty("--hfs",sizeOf(head));
  if (typeof ResizeObserver==="undefined"){ requestAnimationFrame(set); return; }
  if (!RO) RO=new ResizeObserver(es=>es.forEach(e=>{ const w=e.target._hiWrap; if (w&&w.isConnected) w.style.setProperty("--hfs",sizeOf(e.target)); else RO.unobserve(e.target); }));
  head._hiWrap=wrap; RO.observe(head); requestAnimationFrame(set);
}
/** Wraps a title so an icon can sit before, after or above it. Returns {set(spec)} to change the icon later (carousel slides). */
function iconHolder(head){
  let wrap=null, ic=null;
  const ensure=()=>{ if (wrap) return; wrap=h("div",{class:"hi"}); ic=h("span",{class:"hi-ic","aria-hidden":"true"});
    if (head.hasAttribute("data-rv")){ head.removeAttribute("data-rv"); wrap.setAttribute("data-rv",""); }
    head.replaceWith(wrap); wrap.append(ic,head); measure(wrap,head); };
  return { set(spec){
    if (!spec){ if (wrap) wrap.classList.add("hi-off"); return; }
    ensure(); wrap.classList.remove("hi-off","hi-before","hi-after","hi-above"); wrap.classList.add("hi-"+spec.pos);
    wrap.style.setProperty("--hi-s",String(spec.size)); if (spec.color) wrap.style.setProperty("--hi-c",spec.color); else wrap.style.removeProperty("--hi-c");
    const fresh=ic.cloneNode(false); fresh.innerHTML=spec.svg; ic.replaceWith(fresh); ic=fresh;
    if (spec.anim==="draw") $$("path,circle,line,polyline,polygon,rect,ellipse",ic).forEach(n=>n.setAttribute("pathLength","1"));
    ic.className="hi-ic hi-a-"+(spec.anim||"none"); arrive(ic);
  } };
}
/* Where each section type draws its item titles (in the same order as its visible items). */
const ITEM_HEADS={ chapters:[".chapter .h2",false], grid:[".card .h3",false], accordion:[".acc-btn .h3",false], division:[".dv-t b",true], catalog:[".cat-card .h3",true] };
const ITEM_BOX=".card,.acc-row,.ft-item,.qt,.dv-items,.cat-card,.post-card,.chapter:not(.division .chapter)";
function mainHeading(el,type){
  if (type==="chapters") return null;
  if (type==="heroCarousel") return $(".content .title",el);
  const heads=$$("h1,h2",el).filter(n=>!n.closest(ITEM_BOX)&&!n.closest(".flow-under,.lb,.cb"));
  return heads[0]||$(".big",el)||$$(".eyebrow",el).find(n=>!n.closest(ITEM_BOX))||null;
}

/* ---------- heading styles and entrances ---------- */
function styleHeading(cfg,sec,head){
  const D=decoFor(cfg), st=pick(sec.headStyle,D.headStyle), how=pick(sec.headIn,D.headIn);
  if (st&&st!=="none"){ head.classList.add("hst","hst-"+st); if (st==="cmyk") head.dataset.text=head.textContent; if (st==="marker"||st==="underline") arrive(head); }
  if (!how || how==="keep" || reduce || head.closest(".hc,.hs")) return; // hero titles already have their own reveal (Design → Animation)
  const text=head.textContent; if (!text.trim()) return;
  gsap.set(head,{autoAlpha:0});
  whenSeen(head,()=>{ gsap.set(head,{autoAlpha:1});
    if (how==="type"){ typewriter(head,text); return; }
    const mode=how==="chars"||how==="words"||how==="blur"||how==="fade"?how:"words";
    revealTitle({...cfg,motion:{...cfg.motion,titleReveal:mode}},head,text,0).eventCallback("onComplete",()=>{ if (st&&st!=="none"&&mode!=="fade"&&mode!=="blur"){ head.textContent=text; head.classList.remove("split-chars"); } }); });
}
function typewriter(el,text){
  el.textContent=""; el.setAttribute("aria-label",text); el.classList.add("tw");
  const chars=[...text].map(ch=>h("span",{class:"tw-c","aria-hidden":"true",text:ch})); el.append(...chars,h("span",{class:"tw-caret","aria-hidden":"true"}));
  gsap.set(chars,{display:"none"});
  gsap.to(chars,{display:"inline",duration:0,stagger:Math.max(.018,Math.min(.07,1.6/chars.length)),ease:"none",onComplete(){ setTimeout(()=>{ el.textContent=text; el.classList.remove("tw"); el.removeAttribute("aria-label"); },1600); }});
}
/* Card hover: lift, glow, tilt, zoom, border, shine on cards, rows, chapters and items. */
const CARDS=".card,.ft-item,.qt,.dv-row,.acc-row,.chapter figure,.post-card,.cat-card,.photo-box";
function cardHover(cfg,sec,el){
  const kind=pick(sec.cardHover,decoFor(cfg).cardHover); if (!kind||kind==="none") return;
  el.classList.add("chv","chv-"+kind);
  if (kind!=="tilt" || reduce || typeof matchMedia==="undefined" || !matchMedia("(pointer:fine)").matches) return;
  $$(CARDS,el).forEach(c=>{ const rx=gsap.quickTo(c,"rotationX",{duration:.6,ease:"power3.out"}), ry=gsap.quickTo(c,"rotationY",{duration:.6,ease:"power3.out"});
    gsap.set(c,{transformPerspective:900});
    c.addEventListener("pointermove",e=>{ const r=c.getBoundingClientRect(); ry(((e.clientX-r.left)/r.width-.5)*9); rx(-((e.clientY-r.top)/r.height-.5)*7); });
    c.addEventListener("pointerleave",()=>{ rx(0); ry(0); }); });
}

/* ---------- logo and button blocks ---------- */
const ALIGNS=new Set(["start","center","end"]);
const toneOf=(cfg,host)=>host&&host.closest&&host.closest(".hc,.hs")?"hero":(siteMode(cfg)==="light"?"light":"dark");
/** A logo of any version at any size, with an entrance and an optional movement that keeps going. */
function logoBlock(cfg,o,{tone="dark",cls="lb"}={}){
  o=o||{}; const v=o.version||"auto", size=Math.max(12,Math.min(800,+o.size||120)), phone=Math.max(0,Math.min(800,+o.phone||0));
  const L=(cfg.site&&cfg.site.logos)||{}, places={...(L.places||{}),header:{dark:v,light:v,hero:v,height:size,phone}};
  const spec=logoFor({...cfg,site:{...cfg.site,logos:{...L,places}}},"header",tone);
  const t=document.createElement("template"); t.innerHTML=logoHtml(spec,{alt:(cfg.site&&cfg.site.brand)||""}); const mk=t.content.firstElementChild;
  if (o.loop==="shine"&&!mk.classList.contains("is-silver")){ mk.style.setProperty("--logo-mask",`url("${String(spec.src||"").replace(/"/g,"%22")}")`); mk.classList.add("lb-shine"); }
  const act=o.action&&o.action.type&&o.action.type!=="none";
  const inner=act?h("button",{type:"button",class:"lb-mk lb-go","aria-label":(cfg.site&&cfg.site.brand)||"Logo",onclick:()=>runAction(cfg,o.action)},mk):h("span",{class:"lb-mk"},mk);
  const box=h("div",{class:cls+" al-"+(ALIGNS.has(o.align)?o.align:"center")},h("span",{class:"fx-b fx-in-"+(o.in||"pop")+" fx-loop-"+(o.loop||"none")},inner));
  arrive(box.firstElementChild,o.delay);
  return box;
}
/** A call-to-action button with its size, style, entrance and movement, and an optional line of text above it. */
function ctaBlock(cfg,o,{cls="cb"}={}){
  o=o||{}; const btn=o.button||{}; if (!btn.label) return null;
  const style=o.style||"site", size=o.size||"m";
  const b=h("button",{type:"button",class:(style==="link"?"arrow-link":"more")+" cta-b cta-"+style+" cta-"+size,html:esc(btn.label)+ARROW_SVG,onclick:()=>runAction(cfg,btn.action)});
  const wrap=h("span",{class:"fx-b fx-in-"+(o.in||"rise")+" fx-loop-"+(o.loop||"none")},b);
  const box=h("div",{class:cls+" al-"+(ALIGNS.has(o.align)?o.align:"start")},o.text?h("p",{class:"cb-t",text:o.text}):null,wrap);
  arrive(wrap,o.delay);
  return box;
}
/** Where a section's own content is, for the logo and button blocks. */
const hostOf=el=>$(".hc .content",el)||$(".inner",el)||$(".wrap",el)||el;
function placeBlocks(cfg,sec,el){
  const host=hostOf(el), put=(node,pos)=>{ if (!node) return; if (pos==="top") host.prepend(node); else if (sec.type==="heroCarousel") host.append(node); else host.append(node); };
  const LB=sec.logoBlock, CB=sec.ctaBlock;
  if (LB&&LB.show) put(logoBlock(cfg,LB,{tone:toneOf(cfg,el.matches(".hc,.hs")?el:host)}),LB.pos||"top");
  if (CB&&CB.show) put(ctaBlock(cfg,CB),CB.pos||"bottom");
}

/** Everything above, for one rendered section (called from site.js decorateSection). */
function sectionExtras(cfg,sec,el){
  try {
    const head=mainHeading(el,sec.type);
    if (head){ const spec=iconSpec(cfg,sec); const hold=spec||sec.type==="heroCarousel"?iconHolder(head):null;
      if (hold){ if (spec) hold.set(spec);
        if (sec.type==="heroCarousel") el._onSlide=sl=>hold.set(iconSpec(cfg,sl,sec)||iconSpec(cfg,sec)); }
      if (sec.type!=="heroCarousel") styleHeading(cfg,sec,head); else if (pick(sec.headStyle,decoFor(cfg).headStyle)!=="none") head.classList.add("hst","hst-"+pick(sec.headStyle,decoFor(cfg).headStyle)); }
    const IH=ITEM_HEADS[sec.type];
    if (IH){ const items=(sec.items||[]).filter(it=>it&&(!IH[1]||!it.hidden)), heads=$$(IH[0],el);
      heads.forEach((hd,i)=>{ const spec=iconSpec(cfg,items[i],sec); if (spec) iconHolder(hd).set(spec); }); }
    placeBlocks(cfg,sec,el);
    cardHover(cfg,sec,el);
  } catch(e){ console.error("section extras",sec.type,e); }
}

/* ---------- Photo only section ----------
   One picture with a mask (shapes from Global style's picture masks, fades, wave, stripes, halftone dots, or the photo inside a word),
   opacity, width, height, blur, black and white, a colour filter, slow zoom and parallax. */
const FADES={
  fadeBottom:"linear-gradient(to bottom,#000 45%,transparent 100%)", fadeTop:"linear-gradient(to top,#000 45%,transparent 100%)",
  fadeSides:"linear-gradient(to right,transparent 0%,#000 20%,#000 80%,transparent 100%)", soft:"radial-gradient(ellipse 70% 65% at 50% 50%,#000 45%,transparent 100%)",
  stripes:"repeating-linear-gradient(115deg,#000 0 26px,transparent 26px 36px)", halftone:"radial-gradient(circle at 50% 50%,#000 58%,transparent 62%) 0 0/12px 12px",
  wave:`url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 0H100V84C84 96 68 74 50 86S16 98 0 84Z"/></svg>')}") 0 0/100% 100% no-repeat`
};
const RATIOS=new Set(["21/9","16/9","3/2","4/3","1/1","4/5","screen"]);
function photoSection(cfg,sec){
  const id=sec.media||"", ratio=RATIOS.has(sec.ratio)?sec.ratio:"16/9", width=["full","page","narrow","small"].includes(sec.width)?sec.width:"page";
  const op=Math.max(0,Math.min(1,sec.opacity==null||sec.opacity===""?1:+sec.opacity));
  const r=ratio==="screen"?16/9:ratio.split("/").reduce((a,b)=>+a/+b);
  const own=sec.overlay&&typeof sec.overlay==="object"&&sec.overlay.mode&&sec.overlay.mode!=="default"?sec.overlay:null;
  const box=h("div",{class:"photo-box al-"+(ALIGNS.has(sec.align)?sec.align:"center")+" pw-"+width});
  if (hexOk(sec.bg)) box.style.background=sec.bg;
  let frame;
  if (sec.mask==="word"){
    const m=mediaItem(cfg,id); let url=m&&m.kind==="image"?mediaUrl(m):"";
    if (!url){ const ph=mediaBox(cfg,id,{ratio:r,res:1600}), c=ph.querySelector("canvas"); try { url=c?c.toDataURL("image/jpeg",.82):""; } catch { url=""; } }
    frame=h("div",{class:"photo-word",role:"img","aria-label":sec.maskWord||""},h("span",{text:sec.maskWord||"DORMA"}));
    if (url) frame.firstElementChild.style.backgroundImage=`url("${url.replace(/"/g,"%22")}")`;
  } else {
    const ph=mediaBox(cfg,id,{ratio:r,res:width==="full"?2400:1800,cls:"photo-ph"+(sec.zoom?" kb-scrub":"")});
    if (own){ $$(".img-ov",ph).forEach(n=>n.remove()); const ov=own.mode==="none"?null:overlayEl(cfg,id,own); if (ov) ph.append(ov); }
    ph.style.aspectRatio=ratio==="screen"?"auto":ratio; if (ratio==="screen") ph.style.height="100svh";
    if (sec.fit==="contain") ph.classList.add("fit-contain");
    frame=h("div",{class:"photo-mask"},ph);
    if (SHAPES[sec.mask]) frame.style.clipPath=SHAPES[sec.mask];
    else if (FADES[sec.mask]){ frame.style.webkitMask=FADES[sec.mask]; frame.style.mask=FADES[sec.mask]; }
    if (sec.mask&&sec.mask!=="none") ph.classList.add("shaped");
  }
  const filt=[+sec.blur>0?`blur(${Math.min(20,+sec.blur)}px)`:"",sec.gray?"grayscale(1)":""].filter(Boolean).join(" ");
  if (filt) frame.style.setProperty("--ph-filter",filt);
  frame.style.opacity=String(op);
  box.append(frame);
  const cap=(sec.caption||[]).length?captionEl(sec.caption):null;
  const s=h("section",{class:"sec photo-sec"+(width==="full"?" photo-full":"")},width==="full"?h("div",{class:"photo-bleed"},box,cap?h("div",{class:"wrap"},cap):null):h("div",{class:"wrap"},box,cap));
  if (+sec.parallax>0 && !reduce) s._after=()=>{ const n=frame.querySelector(".ph > img,.ph > canvas,.ph > video,.photo-word span"); if (!n||!ScrollTrigger) return; const amt=Math.min(30,+sec.parallax);
    gsap.set(n,{scale:1+amt/60}); gsap.fromTo(n,{yPercent:-amt/2},{yPercent:amt/2,ease:"none",scrollTrigger:{trigger:s,start:"top bottom",end:"bottom top",scrub:true}}); };
  return s;
}
/* ---------- Logo section ---------- */
function logoSection(cfg,sec){
  const s=h("section",{class:"sec logo-sec"}), w=h("div",{class:"wrap"}); s.append(w);
  w.append(logoBlock(cfg,sec,{tone:siteMode(cfg)==="light"?"light":"dark",cls:"lb lb-sec"}));
  return s;
}
/* ---------- Call to action section: heading, optional line and a button with size, style and animation ---------- */
function ctaSection(cfg,sec){
  const al=ALIGNS.has(sec.align)?sec.align:"start";
  const w=h("div",{class:"wrap cta cta-al-"+al,"data-rv":""});
  const txt=h("div",{class:"cta-txt"}); if (sec.title) txt.append(h("h2",{class:"display",text:sec.title})); if (sec.text) txt.append(h("p",{class:"lede",text:sec.text}));
  w.append(txt);
  const b=ctaBlock(cfg,{button:sec.button,size:sec.size||"m",style:sec.style||"site",align:al,in:sec.in||"none",loop:sec.loop||"none",delay:sec.delay},{cls:"cb cb-sec"}); if (b) w.append(b);
  return h("section",{class:"sec"},w);
}

export { DECO_DEFAULTS, decoFor, hideParts, iconSpec, iconHolder, sectionExtras, logoBlock, ctaBlock, photoSection, logoSection, ctaSection, FADES, whenSeen };
