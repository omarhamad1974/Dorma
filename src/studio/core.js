import { scenes } from './scenes';
import { gsap } from 'gsap';
import { openModal } from './site';
import { isMediaUrl } from './store';
import { LIBRARY_BASE } from '../config';

/* ================= CORE HELPERS ================= */
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
const pad = n => String(n).padStart(2,"0");
const clone = o => JSON.parse(JSON.stringify(o));
const uid = p => p+"-"+Math.random().toString(36).slice(2,8);
/* ---------- languages ----------
   Any text in the settings can be a plain string (English) or {en,ar}. The site renders a localized copy;
   an empty language falls back to the other one so a page is never blank. */
const LANGS = { en:"English", ar:"العربية" };
const LANG = { cur:"en" };
const isTx = v => !!v && typeof v==="object" && !Array.isArray(v) && Object.keys(v).length>0 && Object.keys(v).every(k=>k==="en"||k==="ar");
const blank = x => x==null || x==="" || (Array.isArray(x) && !x.filter(Boolean).length);
function txt(v,lang=LANG.cur){ if (!isTx(v)) return v; const a=v[lang], b=v[lang==="ar"?"en":"ar"]; return blank(a)?(blank(b)?"":b):a; }
/** For the studio's own lists and labels: English, else Arabic. */
const plain = v => isTx(v) ? (blank(v.en)?(v.ar??""):v.en) : v;
function siteLangs(cfg){ const l=cfg&&cfg.site&&cfg.site.languages; return l==="ar"?["ar"]:l==="both"?["en","ar"]:["en"]; }
function pickLang(cfg){ const ls=siteLangs(cfg); let p=null; try { p=localStorage.getItem("dorma.lang"); } catch(e){ /* blocked */ }
  return ls.includes(p)?p:(ls.includes(cfg.site.defaultLang)?cfg.site.defaultLang:ls[0]); }
function setLang(l){ try { localStorage.setItem("dorma.lang",l); } catch(e){ /* blocked */ } }
function setDocLang(lang){ const d=document.documentElement; d.lang=lang; d.dir=lang==="ar"?"rtl":"ltr"; }
/** A copy of the settings with every {en,ar} text resolved to the visitor's language. */
function localize(cfg){
  if (!cfg || cfg.__lang) return cfg;
  const lang=pickLang(cfg); LANG.cur=lang;
  const walk=v=>isTx(v)?txt(v,lang):Array.isArray(v)?v.map(walk):(v&&typeof v==="object")?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,walk(x)])):v;
  const out=walk(cfg); out.__lang=lang; setDocLang(lang); return out;
}
/** Visitor-facing words built into the site (buttons, labels), in Arabic. */
const UI_AR = {"This site has no pages yet.": "لا توجد صفحات في الموقع بعد.", "On this page": "في هذه الصفحة", "Main": "القائمة الرئيسية", "Menu": "القائمة", "Draft preview": "معاينة المسودة", "Back to studio": "العودة إلى الاستوديو", "Open studio": "فتح الاستوديو", "Featured": "مميز", "Previous slide": "الشريحة السابقة", "Next slide": "الشريحة التالية", "New posts are on the way.": "مقالات جديدة قريبًا.", "All posts": "كل المقالات", "More posts": "مقالات أخرى", "Post not found": "المقال غير موجود", "Browse the other posts": "تصفح المقالات الأخرى", "Close": "إغلاق", "Previous": "السابق", "Next": "التالي", "Pause video": "إيقاف الفيديو مؤقتًا", "Play video": "تشغيل الفيديو", "posts": "مقالات", "items": "عناصر", "Media": "وسائط", "Gallery": "معرض", "Flow": "مسار", "Step": "الخطوة", "Blog": "المدونة", "This post isn't available": "هذا المقال غير متاح", "It may have been moved or unpublished.": "ربما نُقل أو أُلغي نشره."};
const ui = s => LANG.cur==="ar" ? (UI_AR[s]||s) : s;
const esc = s => String(plain(s)??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function h(tag, attrs={}, ...kids){
  const el=document.createElement(tag);
  for (const [k,v] of Object.entries(attrs||{})){
    if (v==null || v===false) continue;
    if (k==="class") el.className=v;
    else if (k==="text") el.textContent=plain(v);
    else if (k==="html") el.innerHTML=v;           // only ever passed trusted, code-built markup
    else if (k.startsWith("on")) el.addEventListener(k.slice(2),v);
    else el.setAttribute(k, v===true?"":plain(v));
  }
  for (const k of kids.flat()) if (k!=null && k!==false) el.append(k.nodeType?k:document.createTextNode(plain(k)));
  return el;
}
const ARROW_SVG = '<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
const svgEl = markup => { const t=document.createElement("template"); t.innerHTML=markup; return t.content.firstElementChild; };

/* ---------- SVG sanitizer: only shapes and presentation attributes survive ---------- */
const SVG_TAGS = new Set(["svg","g","path","circle","ellipse","rect","line","polyline","polygon","defs","lineargradient","radialgradient","stop","title"]);
const SVG_ATTRS = new Set(["viewbox","d","cx","cy","r","rx","ry","x","y","x1","y1","x2","y2","width","height","points","fill","stroke","stroke-width","stroke-linecap","stroke-linejoin","stroke-dasharray","transform","opacity","fill-opacity","stroke-opacity","offset","stop-color","stop-opacity","id","gradientunits","gradienttransform","fill-rule","clip-rule","xmlns"]);
function sanitizeSvg(src){
  if (!src || typeof src!=="string") return "";
  let doc; try { doc=new DOMParser().parseFromString(src.trim(),"image/svg+xml"); } catch(e){ return ""; }
  const root=doc.documentElement;
  if (!root || root.nodeName.toLowerCase()!=="svg" || doc.querySelector("parsererror")) return "";
  const walk=el=>{
    [...el.children].forEach(c=>{ if (!SVG_TAGS.has(c.nodeName.toLowerCase())) c.remove(); else walk(c); });
    [...el.attributes].forEach(a=>{
      const n=a.name.toLowerCase(), v=a.value;
      if (!SVG_ATTRS.has(n) || /javascript:|data:|expression\(/i.test(v) || (/url\(/i.test(v) && !/^url\(#[\w-]+\)$/.test(v.trim()))) el.removeAttribute(a.name);
    });
  };
  walk(root);
  if (!root.getAttribute("viewBox") && !root.getAttribute("viewbox")){
    const w=parseFloat(root.getAttribute("width"))||24, hh=parseFloat(root.getAttribute("height"))||24; root.setAttribute("viewBox",`0 0 ${w} ${hh}`);
  }
  root.removeAttribute("width"); root.removeAttribute("height");
  root.setAttribute("aria-hidden","true");
  return new XMLSerializer().serializeToString(root);
}
function iconSvg(cfg, id){ const ic=(cfg.icons||[]).find(i=>i.id===id); return ic?sanitizeSvg(ic.svg):""; }

/* ---------- theme ---------- */
function hexRgb(hex){ const m=/^#?([\da-f]{6})$/i.exec(hex||""); if(!m) return [238,241,246]; const n=parseInt(m[1],16); return [n>>16&255,n>>8&255,n&255]; }
const rgba=(hex,a)=>`rgba(${hexRgb(hex).join(",")},${a})`;
function applyTheme(cfg){
  const t=cfg.theme, r=document.documentElement.style, fb='"IBM Plex Sans Arabic","Segoe UI",system-ui,sans-serif';
  r.setProperty("--ink",t.ink); r.setProperty("--panel",t.panel); r.setProperty("--fg",t.fg); r.setProperty("--accent",t.accent);
  r.setProperty("--muted",rgba(t.fg,t.mutedOpacity)); r.setProperty("--faint",rgba(t.fg,t.lineOpacity)); r.setProperty("--glass",rgba(t.fg,.05));
  r.setProperty("--accent-soft",rgba(t.accent,.12)); r.setProperty("--accent-line",rgba(t.accent,.55)); r.setProperty("--accent-glow",rgba(t.accent,.5));
  r.setProperty("--display",`"${t.display}",${fb}`); r.setProperty("--body",`"${t.body}",${fb}`); r.setProperty("--mono",`"${t.mono}","IBM Plex Sans Arabic",ui-monospace,Menlo,monospace`);
  r.setProperty("--radius",(+t.radius||0)+"px"); r.setProperty("--ov",t.overlay); r.setProperty("--img-bright",t.imageBrightness);
  document.body.style.background=t.ink;
}
const EASES={expo:"expo",power3:"power3",sine:"sine",back:"back",elastic:"elastic"};
function ease(cfg,dir="out"){ const e=EASES[cfg.motion.ease]||"expo"; if (e==="back") return `back.${dir}(1.6)`; if (e==="elastic") return dir==="out"?"elastic.out(1,.55)":"power3.in"; return `${e}.${dir}`; }
const ioEase=cfg=>{ const e=EASES[cfg.motion.ease]||"expo"; return (e==="back"||e==="elastic")?"power3.inOut":e+".inOut"; };

/* ---------- media ---------- */
const sceneCache={};
const sceneCanvas=name=>sceneCache[name]||(sceneCache[name]=(scenes[name]||scenes.nebula)());
function mediaItem(cfg,id){ return (cfg.media||[]).find(m=>m.id===id); }
/* A safe relative path inside the library folder, e.g. "exhibitions/booth-01.jpg". */
const libPathOk=p=>typeof p==="string" && /^[\w\-. ()&+,]+(\/[\w\-. ()&+,]+)*$/.test(p) && !p.split("/").some(x=>x===".."||x===".");
const libraryUrl=p=>libPathOk(p)?LIBRARY_BASE+p.split("/").map(encodeURIComponent).join("/"):"";
const BUILTIN_LOGO_WHITE = `${import.meta.env.BASE_URL}brand/dorma-logo-white.png`;
/** The header logo: a library image chosen in the studio, or the built-in white Dorma logo. */
function brandLogoUrl(cfg){ const m=cfg&&cfg.site&&cfg.site.logo?mediaItem(cfg,cfg.site.logo):null; return (m&&m.kind==="image"&&mediaUrl(m))||BUILTIN_LOGO_WHITE; }
function mediaUrl(m){ if (m.path) return libraryUrl(m.path); return isMediaUrl(m.url)?m.url:""; }
function mediaNode(cfg,id,{w=1280,hh=800}={}){
  const m=mediaItem(cfg,id); if (!m) return null;
  if (m.kind==="image"){ const u=mediaUrl(m); if(!u) return null; return h("img",{src:u,alt:m.alt||"",loading:"lazy",decoding:"async"}); }
  if (m.kind==="video"){ const u=mediaUrl(m); if(!u) return null; const v=h("video",{src:u,muted:true,loop:true,playsinline:true,autoplay:!reduce,preload:"metadata"}); v.muted=true; return v; }
  const src=sceneCanvas(m.scene), c=document.createElement("canvas"); c.width=w; c.height=hh;
  const k=Math.max(w/src.width,hh/src.height)*(+m.zoom||1), sw=w/k, sh=hh/k;
  c.getContext("2d").drawImage(src,(src.width-sw)*(+(m.fx??.5)),(src.height-sh)*(+(m.fy??.5)),sw,sh,0,0,w,hh);
  return c;
}
const isMoving=(cfg,id)=>{ const m=mediaItem(cfg,id); return !!m && (m.kind==="video"||m.animate); };
/* a framed image box; ratio sets canvas resolution */
function mediaBox(cfg,id,{ratio=1.6,badge="",cls="",bleed=false,res=1280}={}){
  const box=h("div",{class:"ph"+(bleed?" bleed":"")+(cls?" "+cls:"")});
  const node=mediaNode(cfg,id,{w:res,hh:Math.round(res/ratio)}); if (node) box.append(node);
  if (badge && NUM.on) box.append(h("span",{class:"badge",html:`<b>${isMoving(cfg,id)?"VID":"IMG"}</b> ${esc(badge)}`}));
  return box;
}

/* ---------- separators and captions ---------- */
function sepEl(style){
  if (style==="none") return null;
  const s=h("span",{class:"sep s-"+style,"aria-hidden":"true"});
  if (style==="dots3") s.innerHTML="<i></i><i></i><i></i>";
  else if (style==="chevron") s.innerHTML='<svg viewBox="0 0 10 10"><path d="M3 1.5 7 5l-4 3.5"/></svg>';
  else s.innerHTML="<i></i>";
  return s;
}
function captionEl(items,style="dots3"){
  const f=h("figcaption",{class:"cap"});
  (items||[]).filter(Boolean).forEach((t,i)=>{ if (i){ const s=sepEl(style==="none"?"dots3":style); if (s) f.append(s); } f.append(h("span",{text:t})); });
  return f;
}

/* ---------- flow ---------- */
const PRESETS={
  rise:{y:18,autoAlpha:0}, fade:{autoAlpha:0}, scale:{scale:.7,autoAlpha:0}, blur:{y:6,autoAlpha:0,filter:"blur(10px)"},
  slideLeft:{x:-34,autoAlpha:0}, slideRight:{x:34,autoAlpha:0}, flip:{rotateX:-90,autoAlpha:0,transformPerspective:500,transformOrigin:"50% 100%"},
  pop:{scale:0,autoAlpha:0}
};
const TO={y:0,x:0,scale:1,autoAlpha:1,rotateX:0,filter:"blur(0px)"};
function presetTween(target,preset,{duration=.8,delay=0,stagger=0,cfg}={}){
  if (reduce || preset==="none" || !PRESETS[preset]) { gsap.set(target,{autoAlpha:1,clearProps:"transform,filter"}); return null; }
  const from=PRESETS[preset], to={}; Object.keys(from).forEach(k=>{ if (k in TO) to[k]=TO[k]; });
  return gsap.fromTo(target,from,{...to,duration,delay,stagger,ease:preset==="pop"?"back.out(2.2)":ease(cfg),clearProps:"filter",overwrite:true});
}
function flowItemEl(cfg,flow,it,i){
  const kind=it.kind||"button";
  const b=h("button",{class:"fi k-"+kind,type:"button"});
  const iconMarkup = kind==="svg"?sanitizeSvg(it.svg):(it.icon?iconSvg(cfg,it.icon):"");
  if (kind==="icon"||kind==="svg"){
    b.innerHTML=`<span class="ic">${iconMarkup||'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>'}</span>`;
    b.setAttribute("aria-label",it.label||"Item"); b.title=it.label||"";
  } else {
    if (it.showIndex && NUM.on && kind==="button") b.append(h("span",{class:"n",text:pad(i+1)}));
    if (iconMarkup){ b.classList.add("has-ic"); b.append(h("span",{class:"ic",html:iconMarkup})); }
    b.append(document.createTextNode(it.label||""));
  }
  b.append(h("span",{class:"bar-fill"}));
  return b;
}
/* returns a controller; opts.onItem(i,item) replaces the default click action */
function renderFlow(cfg,flowId,opts={}){
  const flow=(cfg.flows||[]).find(f=>f.id===flowId);
  if (!flow) return null;
  const el=h("div",{class:"flow sz-"+(flow.size||"m"),role:"group","aria-label":flow.name||"Flow"});
  const pairs=[], btns=[], seps=[];
  flow.items.forEach((it,i)=>{
    const pr=h("span",{class:"pair"}), b=flowItemEl(cfg,flow,it,i);
    b.addEventListener("click",()=>{ if (opts.onItem) opts.onItem(i,it,b); else runAction(cfg,it.action,{flow,index:i}); });
    pr.append(b);
    if (i<flow.items.length-1){ const s=sepEl(flow.separator||"dots3"); if (s){ pr.append(s); seps.push(s); } }
    el.append(pr); pairs.push(pr); btns.push(b);
  });
  const ctl={flow,el,btns,seps,pairs,
    setActive(i,{fill=false}={}){ btns.forEach((b,j)=>{ b.classList.toggle("is-active",j===i); b.classList.toggle("static-active",fill&&j===i); b.setAttribute("aria-pressed",j===i?"true":"false"); }); seps.forEach((s,j)=>s.classList.toggle("lit",j<i)); },
    play(extraDelay=0,at=null){ return animateFlow(cfg,ctl,extraDelay,at); }
  };
  return ctl;
}
/* ---------- timing (storytelling) ----------
   Sections and modals can carry timing:{eyebrow,title,text,media,flow,more,...}: the second each piece starts,
   counted from when the section comes into view or the modal opens. Empty = the built-in default. */
const TIMING_PARTS = { eyebrow:"Eyebrow", title:"Title", text:"Text", media:"Image or video", flow:"Flow", detail:"Flow detail", more:"Button", duration:"Seconds on screen" };
function cue(t,key,def){ const v=t&&t[key]; return v===""||v==null||isNaN(+v)?def:Math.max(0,+v); }
function animateFlow(cfg,ctl,extraDelay=0,at=null){
  const a={...(ctl.flow.anim||{mode:"items",preset:"rise",duration:.8,stagger:.06,delay:0})};
  if (at!=null){ a.delay=at; extraDelay=0; }
  if (reduce) return;
  if (a.mode==="group"){ presetTween(ctl.el,a.preset,{duration:+a.duration||.8,delay:(+a.delay||0)+extraDelay,cfg}); return; }
  let seq=0;
  ctl.flow.items.forEach((it,i)=>{
    const unit=[ctl.btns[i], ctl.pairs[i].querySelector(".sep")].filter(Boolean);
    if (it.anim && it.anim.preset){
      presetTween(unit,it.anim.preset,{duration:+it.anim.duration||.8,delay:(+a.delay||0)+extraDelay+(+it.anim.delay||0)+seq*(+a.stagger||0),cfg});
    } else {
      presetTween(unit,a.preset,{duration:+a.duration||.8,delay:(+a.delay||0)+extraDelay+seq*(+a.stagger||0),cfg});
    }
    seq++;
  });
}

/* ---------- actions ---------- */
function runAction(cfg,action,ctx={}){
  if (!action || !action.type || action.type==="none") return;
  if (action.type==="modal") openModal(cfg,action.target,ctx);
  else if (action.type==="page"){ if ((cfg.pages||[]).some(p=>p.id===action.target)) location.hash=action.target; }
  else if (action.type==="slide"){ ctx.goSlide && ctx.goSlide((parseInt(action.target,10)||1)-1); }
  else if (action.type==="post"){ const p=(cfg.posts||[]).find(x=>x.id===action.target); if (p) location.hash="post/"+encodeURIComponent(p.slug||p.id); }
  else if (action.type==="doc"){ const m=mediaItem(cfg,action.target); const u=m?(/^https:\/\//i.test(m.link||"")?m.link:mediaUrl(m)):""; if (u){ const a=h("a",{href:u,target:"_blank",rel:"noopener"}); document.body.append(a); a.click(); a.remove(); } }
  else if (action.type==="url"){ const u=String(action.target||""); if (/^https:\/\//i.test(u)){ const a=h("a",{href:u,target:"_blank",rel:"noopener"}); document.body.append(a); a.click(); a.remove(); } }
}
function buttonEl(cfg,btn,cls="more"){
  if (!btn || !btn.label) return null;
  const b=h("button",{class:cls,type:"button",html:esc(btn.label)+ARROW_SVG});
  b.addEventListener("click",()=>runAction(cfg,btn.action)); return b;
}
/* Numbering (01, 02 ... counters, badges, step labels) shows only when Site → Show numbering is on. */
const NUM={on:false};
const pn=i=>NUM.on?pad(i):"";
function eyebrowEl(num,text){ if (!NUM.on) num=""; if (!num && !text) return null; const p=h("p",{class:"eyebrow"}); if (num) p.append(h("b",{text:num})); if (text) p.append(text); return p; }
function emphasize(text){ return esc(text).replace(/\*([^*]+)\*/g,"<em>$1</em>"); }

/* ---------- text reveal ---------- */
function splitTitle(el,text,mode){
  el.textContent=""; el.setAttribute("aria-label",text); el.classList.add("split-chars");
  const words=String(text).split(" ");
  words.forEach((w,wi)=>{
    const ws=h("span",{class:"w","aria-hidden":"true"});
    if (mode==="chars") for (const ch of w) ws.append(h("span",{class:"c",text:ch}));
    else ws.append(h("span",{class:"wi",text:w}));
    el.append(ws); if (wi<words.length-1) el.append(" ");
  });
  return $$(".c,.wi",el);
}
function revealTitle(cfg,el,text,delay=0){
  let mode=cfg.motion.titleReveal; if (mode==="chars" && LANG.cur==="ar") mode="words";
  if (reduce){ el.textContent=text; return gsap.timeline(); }
  if (mode==="fade"||mode==="blur"){ el.textContent=text; el.classList.remove("split-chars");
    return gsap.timeline({delay}).fromTo(el,{y:24,autoAlpha:0,filter:mode==="blur"?"blur(14px)":"blur(0px)"},{y:0,autoAlpha:1,filter:"blur(0px)",duration:1.1,ease:ease(cfg)}); }
  const parts=splitTitle(el,text,mode);
  return gsap.timeline({delay}).fromTo(parts,{yPercent:115,rotate:mode==="chars"?6:3},{yPercent:0,rotate:0,duration:1.1,ease:ease(cfg),stagger:mode==="chars"?.022:.07});
}

/* ---------- prose (blog posts and text articles) ----------
   A small, safe subset of Markdown. Everything is escaped first; only these patterns become markup:
   blank line = new paragraph, "## " / "### " headings, "- " lists, "> " quotes,
   **bold**, *italic*, [text](https://link), and [[media-id|caption]] to place a library image or video. */
function inlineMd(t){
  return esc(t)
    .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g,"<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g,(m,a,u)=>`<a href="${u}" target="_blank" rel="noopener">${a}</a>`);
}
function renderProse(cfg,text){
  const out=h("div",{class:"prose"});
  String(text||"").replace(/\r/g,"").split(/\n{2,}/).forEach(block=>{
    const b=block.trim(); if (!b) return;
    const media=/^\[\[([\w-]+)(?:\|([^\]]*))?\]\]$/.exec(b);
    if (media){ const fig=h("figure",{},mediaBox(cfg,media[1],{ratio:16/9,res:1280})); if (media[2]) fig.append(h("figcaption",{class:"mono",text:media[2]})); out.append(fig); return; }
    const head=/^(#{2,3}) (.+)$/.exec(b);
    if (head){ out.append(h(head[1].length===2?"h2":"h3",{html:inlineMd(head[2])})); return; }
    const lines=b.split("\n");
    if (lines.every(l=>/^- /.test(l))){ const ul=h("ul"); lines.forEach(l=>ul.append(h("li",{html:inlineMd(l.slice(2))}))); out.append(ul); return; }
    if (lines.every(l=>/^> ?/.test(l))){ out.append(h("blockquote",{html:inlineMd(lines.map(l=>l.replace(/^> ?/,"")).join(" "))})); return; }
    out.append(h("p",{html:lines.map(inlineMd).join("<br>")}));
  });
  return out;
}
const fmtDate=d=>{ const t=Date.parse(d); return isNaN(t)?"":new Date(t).toLocaleDateString(LANG.cur==="ar"?"ar-u-nu-latn":"en-GB",{day:"numeric",month:"short",year:"numeric"}); };
const categoryLabel=(cfg,id)=>plain(((cfg.categories||[]).find(c=>c.id===id)||{}).label)||"";

export { ui, LANGS, LANG, isTx, txt, plain, siteLangs, pickLang, setLang, setDocLang, localize, NUM, pn, TIMING_PARTS, cue, BUILTIN_LOGO_WHITE, brandLogoUrl, libPathOk, libraryUrl, inlineMd, renderProse, fmtDate, categoryLabel, $, $$, pad, clone, uid, esc, reduce, h, ARROW_SVG, svgEl, SVG_TAGS, SVG_ATTRS, sanitizeSvg, iconSvg, hexRgb, rgba, applyTheme, EASES, ease, ioEase, sceneCache, sceneCanvas, mediaItem, mediaUrl, mediaNode, isMoving, mediaBox, sepEl, captionEl, PRESETS, TO, presetTween, flowItemEl, renderFlow, animateFlow, runAction, buttonEl, eyebrowEl, emphasize, splitTitle, revealTitle };
