import { LIBRARY_BASE, REPO_BRANCH, REPO_URL } from '../config';
import { flowBlock, hexOk, LANGS, isTx, plain, setDocLang, TIMING_PARTS, $, $$, ARROW_SVG, applyTheme, categoryLabel, clone, esc, fmtDate, h, libPathOk, mediaBox, mediaNode, overlayCss, overlayEl, renderFlow, revealTitle, sanitizeSvg, uid } from './core';
import { gsap } from 'gsap';
import { Store, draftDiffers, listVersions, loadDraft, media, normalize, publishDraft, restoreVersion, route, scheduleSave, signIn, signOut, signedInEmail } from './store';
import { Site, closeModal, disposePage, openModal } from './site';
import { IMPORTERS, buildIcons } from './mdimport';
import { A, OPT, OV_PRESETS, SECTION_BLANK, SECTION_TYPES, STARTER, snapshotStyle, applyStyle, resetOverrides, defaultCategory, ensureCategory, mediaSlots, mediaUsage, slotCategory } from './data';
import Sortable from 'sortablejs';
import { imageUrl, markHtml, previewLoader } from '../loader';
import { labelKey } from './jump';
import { FX, FX_OPTIONS, FX_DEFAULTS, fxPreview } from './fx';
import { previewImage, previewSection, previewModal } from './motionfx';

/* ================= ADMIN STUDIO ================= */
const IC={
  site:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>',
  theme:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1.3"/><circle cx="12" cy="7.5" r="1.3"/><circle cx="15.5" cy="10" r="1.3"/><path d="M12 21a3 3 0 0 1 0-6h2"/></svg>',
  motion:'<svg viewBox="0 0 24 24"><path d="M3 12c3-6 6-6 9 0s6 6 9 0"/></svg>',
  media:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/></svg>',
  icons:'<svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18"/></svg>',
  flows:'<svg viewBox="0 0 24 24"><rect x="2" y="9" width="6" height="6" rx="3"/><rect x="16" y="9" width="6" height="6" rx="3"/><path d="M10 12h.01M12 12h.01M14 12h.01"/></svg>',
  modals:'<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 9h16M15 7h2"/></svg>',
  pages:'<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/></svg>',
  blog:'<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  plus:'<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
  eye:'<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  up:'<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  x:'<svg viewBox="0 0 16 16"><path d="M3 3l10 10M13 3 3 13"/></svg>',
  grip:'<svg viewBox="0 0 16 16"><circle cx="5" cy="4" r="1.3"/><circle cx="11" cy="4" r="1.3"/><circle cx="5" cy="8" r="1.3"/><circle cx="11" cy="8" r="1.3"/><circle cx="5" cy="12" r="1.3"/><circle cx="11" cy="12" r="1.3"/></svg>',
  carousels:'<svg viewBox="0 0 24 24"><rect x="6" y="5" width="12" height="14" rx="2"/><path d="M3 8v8M21 8v8"/></svg>',
  copy:'<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
  eyeOff:'<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon:'<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  down:'<svg viewBox="0 0 24 24"><path d="M12 4v12M6 11l6 6 6-6M5 20h14"/></svg>',
  expand:'<svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>',
  upload:'<svg viewBox="0 0 24 24"><path d="M12 16V4M6 9l6-6 6 6M5 20h14"/></svg>',
  replay:'<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.6"/><path d="M4 4v4.6h4.6"/></svg>'
};
const PANELS=[["style","Global style"],["site","Site and titles"],["theme","Colours and type"],["motion","Animation"],["media","Library"],["missing","Missing images"],["icons","Icons"],["flows","Flows"],["modals","Modals"],["pages","Pages"],["carousels","Carousels"],["blog","Blog"],["import","Import"]];
/* Four main tabs; each holds related sub-tabs. The studio remembers the last sub-tab of each group. */
const GROUPS=[["content","Content","pages",["pages","carousels","blog","import"]],["design","Design","theme",["style","theme","motion","site"]],["blocks","Flows and modals","flows",["flows","modals","icons"]],["media","Library","media",["media","missing"]]];
const groupOf=k=>GROUPS.find(g=>g[3].includes(k))||GROUPS[0];
const lastSub={};
/* Studio light or dark mode: a per-person preference kept in this browser; until one is chosen it follows the device. */
const studioMode=()=>{ let v=""; try { v=localStorage.getItem("dorma.studioMode")||""; } catch { /* storage blocked */ } return v==="light"||v==="dark"?v:(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"); };
function setStudioMode(m){ try { localStorage.setItem("dorma.studioMode",m); } catch { /* storage blocked */ }
  const a=$(".adm"); if (a) a.classList.toggle("light",m==="light"); document.documentElement.style.colorScheme=m; const b=$("#admMode"); if (b) b.innerHTML=(m==="light"?IC.moon+"Dark mode":IC.sun+"Light mode"); }
const Admin={ panel:"pages", sel:{}, refresh:null, liveChanged(){ updateTop(); } };
let assetsApi=null;

function toast(msg){ const t=h("div",{class:"toast",role:"status",text:msg}); document.body.append(t); gsap.fromTo(t,{y:20,autoAlpha:0},{y:0,autoAlpha:1,duration:.3}); setTimeout(()=>gsap.to(t,{autoAlpha:0,duration:.3,onComplete:()=>t.remove()}),2400); }
function touch(opts={}){ scheduleSave(); if (opts.theme) applyTheme(Store.draft); if (Admin.refresh) Admin.refresh(); updateTop(); }

let renderTok=0;
async function renderAdmin(){
  const tok=++renderTok; setDocLang("en");
  disposePage(); closeModal(true);
  const app=$("#app");
  if (!Store.canEdit){ app.textContent=""; app.append(Store.session?notEditor():signInForm()); return; }
  await loadDraft();
  if (tok!==renderTok) return; // a newer render started while the draft was loading
  app.textContent="";
  assetsApi=media();
  applyTheme(Store.draft); document.title="Studio · "+(plain(Store.draft.site.brand)||"Site");
  const side=h("nav",{class:"adm-side","aria-label":"Studio sections"},h("a",{class:"brand",href:"#"+Store.draft.site.homePage},h("span",{class:"mark"}),"Studio"));
  const mnav=h("div",{class:"adm-mobile-nav"});
  GROUPS.forEach(([g,l,icon,subs])=>{
    const go=()=>openPanel(lastSub[g]||subs[0]);
    side.append(h("button",{type:"button","data-g":g,html:IC[icon]+esc(l),onclick:go}));
    mnav.append(h("button",{type:"button","data-g":g,text:l,onclick:go}));
  });
  side.append(h("div",{class:"grow"}),h("p",{class:"mono",style:"padding:0 10px;line-height:1.6;overflow-wrap:anywhere",html:Store.mode==="db"?"Signed in as<br>"+esc(signedInEmail()):"Saved in this<br>browser only"}),
    h("button",{type:"button",id:"admMode",onclick:()=>setStudioMode(studioMode()==="light"?"dark":"light")}),
    Store.mode==="db"?h("button",{type:"button",html:IC.x+"Sign out",onclick:async()=>{ await signOut(); route(); }}):"");
  const top=h("div",{class:"adm-top",id:"admTop"});
  const body=h("div",{class:"adm-body",id:"admBody"}), sub=h("div",{class:"adm-subtabs",id:"admSub",role:"tablist"});
  app.append(h("div",{class:"adm"},side,h("div",{class:"adm-main"},h("div",{class:"adm-head"},top,mnav,sub),body)));
  setStudioMode(studioMode());
  Store.listeners=[updateTop];
  openPanel(Admin.panel);
}
function updateTop(){
  const top=$("#admTop"); if (!top) return;
  const st=Store.status, label={saved:"Draft saved",pending:"Unsaved changes",saving:"Saving…",error:Store.statusMsg||"Couldn't save",published:"Published"}[st]||"Draft saved";
  const diff=draftDiffers();
  top.textContent="";
  top.append(h("h1",{},h("span",{class:"crumb",text:groupOf(Admin.panel)[1]}),(PANELS.find(p=>p[0]===Admin.panel)||[])[1]||"Studio"),
    h("span",{class:"status "+(st==="saving"||st==="pending"?"saving":st==="error"?"err":Store.mode==="local"?"local":""),role:"status"},h("i"),label),
    diff?h("span",{class:"mono",style:"color:var(--warn)",text:"Draft differs from live"}):h("span",{class:"mono",text:"Live is up to date"}),
    newMenu(),
    h("button",{class:"btn",type:"button",html:IC.eye+"Preview draft",onclick:previewDraft}),
    h("button",{class:"btn primary",type:"button",disabled:!diff,html:IC.up+"Publish",onclick:async()=>{ if (await publishDraft()) toast("Published. Visitors now see this version."); updateTop(); }}));
}
function previewDraft(){
  Site.preview=true;
  const target=Admin.panel==="pages"&&Admin.sel.pages?Admin.sel.pages:Store.draft.site.homePage;
  if (location.hash.slice(1)===target) route(); else location.hash=target;
}
function openPanel(k){
  if (!PANELS.some(p=>p[0]===k)) k="pages";
  if (cpClose) cpClose(); stopPreviews(); Admin.panel=k; Admin.refresh=null; const G=groupOf(k); lastSub[G[0]]=k;
  $$(".adm-side button[data-g],.adm-mobile-nav button[data-g]").forEach(b=>b.classList.toggle("on",b.dataset.g===G[0]));
  const sub=$("#admSub"); if (sub){ sub.textContent=""; sub.hidden=G[3].length<2;
    G[3].forEach(s=>sub.append(h("button",{type:"button",role:"tab","aria-selected":s===k?"true":"false",class:s===k?"on":"",text:(PANELS.find(p=>p[0]===s)||[])[1],onclick:()=>openPanel(s)}))); }
  const body=$("#admBody"); if (!body) return; body.textContent=""; body.className="adm-body p-"+k; disposePage();
  ({style:panelStyle,site:panelSite,theme:panelTheme,motion:panelMotion,media:panelMedia,missing:panelMissing,icons:panelIcons,flows:panelFlows,modals:panelModals,pages:panelPages,carousels:panelCarousels,blog:panelBlog,import:panelImport})[k](body);
  updateTop(); scrollTo(0,0);
}

/* ---------- generic field engine ---------- */
/* Bilingual entry: when the site has Arabic, every text box shows English and Arabic side by side.
   Settings that are not shown to visitors as text (ids, slugs, links, studio names, library files, the loader) stay single. */
const MONO_KEYS=new Set(["id","slug","name","path","url","target","code","homePage","logo","logoLight","image","anchor","quoteEmail","section"]);
const MEDIA_KINDS=new Set(["image","video","scene","article"]);
function bilingual(obj,key,kind){
  const D=Store.draft; if (!D || D.site.languages==="en" || !D.site.languages) return false;
  if (!["text","area","strings","prose"].includes(kind) || MONO_KEYS.has(key) || Array.isArray(obj)) return false;
  return !(obj===D.loader || (obj && MEDIA_KINDS.has(obj.kind)));
}
function F(obj,key,kind,label,opts={},onChange=()=>{}){
  if (!opts.lang && bilingual(obj,key,kind)) return biField(obj,key,kind,label,opts,onChange);
  if (!opts.lang && isTx(obj[key])){ // English-only site: edit the English text and keep any Arabic already written
    const v=obj[key], tmp={x:v.en??""}; return F(tmp,"x",kind,label,{...opts,lang:"en"},(nv)=>{ obj[key]=blankTx(v.ar)?nv:{en:nv,ar:v.ar}; onChange(obj[key],key); });
  }
  const D=Store.draft, wrap=h("div",{class:"field"+(opts.wide?" wide":"")}), id=uid("f");
  const lab=h("label",{for:id,text:label}); wrap.append(lab);
  const set=(v,extra)=>{ obj[key]=v; onChange(v,key); touch(extra); };
  switch(kind){
    case "text": case "number": {
      const i=h("input",{id,type:kind==="number"?"number":"text",value:obj[key]??"",step:opts.step||"any"});
      if (opts.placeholder) i.placeholder=opts.placeholder; if (opts.min!=null) i.min=opts.min;
      i.addEventListener("input",()=>set(kind==="number"?(i.value===""?(opts.optional?"":0):+i.value):i.value)); wrap.append(i); break; }
    case "area": case "code": {
      const t=h("textarea",{id,class:kind==="code"?"code":"",spellcheck:kind==="code"?"false":"true"}); t.value=obj[key]??"";
      t.addEventListener("input",()=>set(t.value)); wrap.append(expandable(t,opts.groupLabel?opts.groupLabel+" · "+label:label)); break; }
    case "strings": {
      const t=h("textarea",{id,rows:3}); t.value=(obj[key]||[]).join("\n");
      t.addEventListener("input",()=>set(t.value.split("\n").map(s=>s.trim()).filter(Boolean))); wrap.append(expandable(t,opts.groupLabel?opts.groupLabel+" · "+label:label)); break; }
    case "range": {
      const i=h("input",{id,type:"range",min:opts.min??0,max:opts.max??1,step:opts.step??.01,value:obj[key]??0}), o=h("output",{text:obj[key]});
      i.addEventListener("input",()=>{ o.textContent=i.value; set(+i.value,opts.theme?{theme:true}:undefined); }); wrap.append(rangeRow(i,o,label)); break; }
    case "color": {
      /* opts.optional: the value may be empty, meaning "follow the global / site colour" (opts.fallback shows which). */
      const opt=!!opts.optional, val=()=>hexOk(obj[key])?obj[key]:"", fb=()=>{ const f=typeof opts.fallback==="function"?opts.fallback():opts.fallback; return hexOk(f)?f:"#000000"; };
      /* the swatch opens the colour wheel; the hex box takes a typed code */
      const c=h("button",{id,type:"button",class:"cp-swatch",title:"Open the colour wheel","aria-label":"Colour wheel for "+label}), t=h("input",{type:"text",placeholder:opt?(opts.placeholder||"Global"):"","aria-label":label+" hex",style:"width:96px"});
      let row=null;
      const sync=()=>{ c.style.background=val()||fb(); t.value=val(); if (row) row.classList.toggle("inherit",opt&&!val()); };
      const put=v=>{ set(v,{theme:true}); sync(); };
      c.addEventListener("click",()=>colorPanel(c,{value:val()||fb(),title:label,onPick:put}));
      t.addEventListener("change",()=>{ const v=t.value.trim(); if (opt&&v==="") put(""); else if (hexOk(v)) put(v.toLowerCase()); else sync(); });
      const pick=null;
      const mine=h("div",{class:"my-sw"}); (D.theme.swatches||[]).filter(s=>hexOk(s.hex)).forEach(s=>mine.append(h("button",{type:"button",title:(s.name||s.hex)+" "+s.hex,"aria-label":"Use "+(s.name||s.hex),style:"background:"+s.hex,
        onclick:()=>put(s.hex.toLowerCase())})));
      const reset=opt?h("button",{type:"button",class:"cp-global",text:opts.globalLabel||"Use global",title:"Clear this colour so it follows the global style",onclick:()=>put("")}):null;
      row=h("div",{class:"color-row"},c,t,pick,mine.children.length?mine:null,reset); sync();
      wrap.append(row); break; }
    case "select": {
      const s=h("select",{id}); (opts.options||[]).forEach(o=>{ const [v,l]=Array.isArray(o)?o:[o,o]; const op=h("option",{value:v,text:l}); if (String(obj[key])===String(v)) op.selected=true; s.append(op); });
      s.addEventListener("change",()=>{ const v=(opts.options||[]).map(o=>Array.isArray(o)?o[0]:o).find(v=>String(v)===s.value); set(v,opts.theme?{theme:true}:undefined); }); wrap.append(s); break; }
    case "toggle": {
      wrap.textContent=""; const i=h("input",{id,type:"checkbox"}); i.checked=!!obj[key];
      i.addEventListener("change",()=>set(i.checked,opts.theme?{theme:true}:undefined)); wrap.append(h("label",{class:"toggle",for:id},i,label)); break; }
    case "flow": case "modal": case "page": {
      const list=kind==="flow"?D.flows:kind==="modal"?D.modals:D.pages;
      const s=h("select",{id},h("option",{value:"",text:"None"})); list.forEach(x=>{ const op=h("option",{value:x.id,text:plain(x.name)||plain(x.title)||x.id}); if (obj[key]===x.id) op.selected=true; s.append(op); });
      s.addEventListener("change",()=>set(s.value));
      if (kind==="flow" && !opts.noCreate){
        /* make a flow right here, or jump to the one picked */
        const mk=h("button",{class:"btn sm",type:"button",html:IC.plus+"New",title:"Make a new flow and use it here",onclick:()=>{ const f=makeFlow(D); s.append(h("option",{value:f.id,text:f.name})); s.value=f.id; set(f.id); toast("New flow made and picked. Add its items under Flows (Edit)."); }});
        const ed=h("button",{class:"btn sm",type:"button",text:"Edit",title:"Open this flow under Flows",onclick:()=>{ if (!obj[key]){ toast("Pick a flow first."); return; } Admin.sel.flows=obj[key]; openPanel("flows"); }});
        wrap.append(h("div",{class:"pick-row"},s,mk,ed));
      } else wrap.append(s); break; }
    case "category": { const s=categorySelect(obj[key]||"",v=>set(v),{allLabel:opts.allowAll?"All categories":"No category",required:!!opts.required}); s.id=id; wrap.append(s); break; }
    case "date": { const i=h("input",{id,type:"date",value:obj[key]||""}); i.addEventListener("change",()=>set(i.value)); wrap.append(i); break; }
    case "prose": wrap.classList.add("wide"); wrap.append(proseField(obj,key,id,v=>set(v),opts.groupLabel?opts.groupLabel+" · "+label:label)); break;
    case "media": { /* a section's main image can also be hidden without removing it (section.mediaHidden) */
      const secImg=key==="media"&&obj&&typeof obj.type==="string"&&SECTION_TYPES[obj.type]?{hideKey:"mediaHidden"}:{};
      wrap.append(mediaPicker(obj,key,{...opts,...secImg},()=>{ onChange(obj[key]); touch(); })); lab.removeAttribute("for"); break; }
    case "icon": wrap.append(iconPicker(obj,key,()=>{ onChange(obj[key]); touch(); })); lab.removeAttribute("for"); break;
    case "action": { obj[key]=obj[key]||A(); wrap.append(actionEditor(obj[key],()=>{ onChange(obj[key]); touch(); })); lab.removeAttribute("for"); break; }
    case "button": { obj[key]=obj[key]||{label:"",action:A()}; const b=obj[key];
      const lf=F(b,"label","text","Label (empty hides it)",{},()=>onChange(b)); lf.classList.add("wide");
      wrap.append(lf,actionEditor(b.action=b.action||A(),()=>{ onChange(b); touch(); })); wrap.classList.add("wide"); break; }
    case "timing": { lab.removeAttribute("for"); wrap.classList.add("wide"); obj[key]=obj[key]&&typeof obj[key]==="object"?obj[key]:{}; const T=obj[key];
      const g=h("div",{class:"timing-grid"});
      (opts.parts||[]).forEach(([k,def])=>{ const i=h("input",{type:"number",min:0,step:k==="duration"?.5:.05,value:T[k]??"",placeholder:def==null?"Auto":String(def),"aria-label":TIMING_PARTS[k]+" (seconds)"});
        i.addEventListener("input",()=>{ if (i.value==="") delete T[k]; else T[k]=Math.max(0,+i.value); onChange(T,key); touch(); });
        g.append(h("label",{class:"timing-cell"},h("span",{text:TIMING_PARTS[k]}),i)); });
      wrap.append(g); if (!opts.hint) wrap.append(h("span",{class:"hint",text:"Seconds from when this comes into view. Empty uses the default shown. Lower numbers come first, so you can change the order."})); break; }
    case "list": { lab.removeAttribute("for"); wrap.classList.add("wide"); wrap.append(listEditor(obj,key,opts,onChange)); break; }
    case "look": { lab.removeAttribute("for"); wrap.classList.add("wide"); wrap.append(lookEditor(obj,key,opts,onChange)); break; }
  }
  if (opts.hint) wrap.append(h("span",{class:"hint",text:opts.hint}));
  return wrap;
}
const blankTx=x=>x==null||x===""||(Array.isArray(x)&&!x.length);
/* ---------- text boxes: an expand button opens the box full screen for comfortable writing ----------
   The same textarea moves into the full-screen view, so typing, the caret and autosave carry on as they were. */
function expandable(t,label){
  const box=h("div",{class:"ta-box"});
  const btn=h("button",{type:"button",class:"ta-max",title:"Expand to write comfortably","aria-label":"Expand "+label,"aria-expanded":"false",html:IC.expand});
  const done=h("button",{type:"button",class:"btn sm primary",text:"Done"});
  const head=h("div",{class:"ta-head"},h("span",{class:"ta-title",text:label}),done);
  const onKey=e=>{ if (e.key==="Escape"){ e.preventDefault(); close(); } };
  function open(){ const a=t.selectionStart, b=t.selectionEnd; box.classList.add("is-max"); document.documentElement.classList.add("ta-lock"); btn.setAttribute("aria-expanded","true");
    addEventListener("keydown",onKey); t.focus({preventScroll:true}); try { t.setSelectionRange(a,b); } catch { /* not a text box */ } }
  function close(){ box.classList.remove("is-max"); document.documentElement.classList.remove("ta-lock"); btn.setAttribute("aria-expanded","false");
    removeEventListener("keydown",onKey); t.focus({preventScroll:true}); box.scrollIntoView({block:"nearest"}); }
  btn.addEventListener("click",open); done.addEventListener("click",close);
  box.append(head,t,btn); return box;
}
/* ---------- sliders: on touch screens a slider must be tapped first, so scrolling past it never changes it ----------
   The tapped slider stays active (with − and + for fine steps) until you tap somewhere else or leave it for a while. */
const coarse=()=>typeof matchMedia==="function"&&matchMedia("(pointer:coarse)").matches;
let activeRange=null, rangeIdle=0;
function releaseRange(){ clearTimeout(rangeIdle); if (activeRange) activeRange.classList.remove("on"); activeRange=null; }
function pokeRange(){ clearTimeout(rangeIdle); rangeIdle=setTimeout(releaseRange,15000); }
if (typeof document!=="undefined") document.addEventListener("pointerdown",e=>{ if (activeRange && !activeRange.contains(e.target)) releaseRange(); },true);
/* a focused number box ignores the mouse wheel, so scrolling the page never changes a value */
if (typeof document!=="undefined") document.addEventListener("wheel",e=>{ const a=document.activeElement; if (a&&a.type==="number"&&a===e.target&&a.closest(".adm")) a.blur(); },{passive:true});
function rangeRow(i,o,label){
  const row=h("div",{class:"range-row"});
  const step=k=>{ const st=+i.step||1, v=Math.min(+i.max,Math.max(+i.min,+i.value+k*st)); i.value=String(+v.toFixed(4)); i.dispatchEvent(new Event("input",{bubbles:true})); pokeRange(); };
  const minus=h("button",{type:"button",class:"rg-step",text:"−","aria-label":"Lower "+label,onclick:()=>step(-1)}), plus=h("button",{type:"button",class:"rg-step",text:"+","aria-label":"Raise "+label,onclick:()=>step(1)});
  row.append(minus,i,plus,o,h("span",{class:"rg-tap","aria-hidden":"true",text:"Tap to adjust"}));
  row.addEventListener("click",e=>{ if (!coarse() || row.classList.contains("on")) return; e.preventDefault(); releaseRange(); activeRange=row; row.classList.add("on"); pokeRange(); });
  i.addEventListener("input",pokeRange);
  return row;
}
function biField(obj,key,kind,label,opts,onChange){
  const v=obj[key], cur={en:isTx(v)?(v.en??(kind==="strings"?[]:"")):(v??(kind==="strings"?[]:"")), ar:isTx(v)?(v.ar??(kind==="strings"?[]:"")):(kind==="strings"?[]:"")};
  const wrap=h("div",{class:"field bi wide"},h("span",{class:"bi-label",text:label}));
  const row=h("div",{class:"bi-row"});
  ["en","ar"].forEach(l=>{ const tmp={x:cur[l]};
    const f=F(tmp,"x",kind,l==="en"?"English":"العربية",{...opts,wide:false,hint:l==="en"?opts.hint:"",lang:l,groupLabel:label},nv=>{ cur[l]=nv; obj[key]={en:cur.en,ar:cur.ar}; onChange(obj[key],key); });
    f.classList.add("bi-"+l); if (l==="ar") $$("input,textarea",f).forEach(i=>{ i.dir="rtl"; i.lang="ar"; });
    row.append(f); });
  wrap.append(row); return wrap;
}
function fieldsFor(obj,schema,onChange){ const g=h("div",{class:"fields"}); schema.forEach(([k,kind,l,o])=>g.append(F(obj,k,kind,l,o||{},onChange))); return g; }
function actionEditor(a,onChange){
  const D=Store.draft, row=h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"});
  const type=h("select",{"aria-label":"Action"}); OPT.actions.forEach(([v,l])=>{ const o=h("option",{value:v,text:l}); if (a.type===v) o.selected=true; type.append(o); });
  const tgt=h("span",{style:"flex:1;min-width:140px;display:flex"});
  const secSel=h("span",{class:"act-sec"});
  /* "Go to section": a labelled section inside the page or modal; the button travels to it with an animation */
  const drawSec=()=>{ secSel.textContent=""; if (a.type!=="page"&&a.type!=="modal"){ delete a.section; return; }
    const L=sectionLabels(D,a.type,a.target); if (!L.length && !a.section) return;
    const s=h("select",{"aria-label":"Section inside it",title:"Travel to a labelled section inside it"},h("option",{value:"",text:a.type==="page"?"Top of the page":"Start of the modal"}));
    L.forEach(([v,l])=>{ const o=h("option",{value:v,text:"Go to: "+l}); if (a.section===v) o.selected=true; s.append(o); });
    if (a.section && !L.some(x=>x[0]===a.section)) s.append(h("option",{value:a.section,text:"Go to: "+a.section+" (label not found)",selected:true}));
    s.addEventListener("change",()=>{ if (s.value) a.section=s.value; else delete a.section; onChange(); }); secSel.append(s); styleIn(secSel); };
  const styleIn=el=>$$("select,input",el).forEach(x=>x.style.cssText+=";padding:9px 11px;border-radius:7px;border:1px solid var(--faint);background:var(--field-bg);color:var(--fg)");
  const drawTarget=()=>{ tgt.textContent="";
    if (a.type==="modal"||a.type==="page"||a.type==="post"||a.type==="doc"){ const s=h("select",{"aria-label":"Target",style:"width:100%"}); const opts={modal:D.modals,page:D.pages,post:D.posts,doc:D.media.filter(m=>m.kind==="article")}[a.type]; opts.forEach(x=>{ const o=h("option",{value:x.id,text:plain(x.name)||plain(x.title)||plain(x.label)||x.id}); if (a.target===x.id) o.selected=true; s.append(o); });
      if (!a.target && s.options[0]){ a.target=s.options[0].value; } s.addEventListener("change",()=>{ a.target=s.value; delete a.section; drawSec(); onChange(); }); tgt.append(s);
      if (a.type==="modal"||a.type==="page") tgt.append(h("button",{class:"btn sm",type:"button",html:IC.plus+"New",title:"Make a new "+a.type+" and open it from here",onclick:()=>{
        const n=a.type==="modal"?makeModal(D,1):makePage(D,"blank"); a.target=n.id; delete a.section; drawTarget(); onChange(); touch(); toast("New "+a.type+" made: "+(plain(n.name)||plain(n.title))+". Edit it under "+(a.type==="modal"?"Modals":"Pages")+"."); }}));
      drawSec(); }
    else if (a.type==="slide"||a.type==="url"){ const i=h("input",{type:a.type==="slide"?"number":"text",value:a.target||"",placeholder:a.type==="url"?"https://…":"Slide number","aria-label":"Target",style:"width:100%"}); i.addEventListener("input",()=>{ a.target=i.value; onChange(); }); tgt.append(i); }
  };
  type.addEventListener("change",()=>{ a.type=type.value; a.target=""; delete a.section; drawTarget(); onChange(); });
  $$("select,input",row).forEach(x=>x.style.cssText+=";padding:9px 11px;border-radius:7px;border:1px solid var(--faint);background:rgba(0,0,0,.25)");
  row.append(type,tgt,secSel); drawTarget();
  setTimeout(()=>$$("select,input",row).forEach(x=>x.style.cssText+=";padding:9px 11px;border-radius:7px;border:1px solid var(--faint);background:var(--field-bg);color:var(--fg)"));
  return row;
}
function mediaThumb(id){ const n=mediaNode(Store.draft,id,{w:240,hh:180}); return n||h("span",{text:"Missing"}); }
/* Image picker. The field shows the current image large and clear, with a + that opens the library on the same category
   as that image (filters and search still work). Thumbnail size is remembered per browser; filters are shared by every picker. */
/* Every picker opens on "Not used yet" so each library picture tends to be used once; the admin can switch to Used or All. */
const PICK={ cat:"", q:"", use:"unused" };
const PICK_USE=[["unused","Not used yet"],["used","Already used"],["all","All images"]];
const usedText=places=>"Used in "+places.length+(places.length===1?" place":" places")+":\n"+places.slice(0,8).join("\n")+(places.length>8?"\n…":"");
const PICK_SIZES=[["s","Small",56],["m","Medium",84],["l","Large",130]];
const pickSize=()=>{ try { const v=localStorage.getItem("dorma.pickSize"); return PICK_SIZES.some(z=>z[0]===v)?v:"m"; } catch { return "m"; } };
function setPickSize(v){ try { localStorage.setItem("dorma.pickSize",v); } catch { /* storage blocked */ } }
const KIND_NAME={ image:"Image", video:"Video", scene:"Placeholder scene", article:"Article" };
/** What is wrong with the image a field points at, in words ("" when it is fine). */
function mediaState(id){ const D=Store.draft; if (!id) return "empty"; const m=D.media.find(x=>x.id===id); if (!m) return "missing"; if (m.kind==="scene") return "placeholder"; if (libMissing(m)) return "file"; return ""; }
const STATE_TEXT={ empty:"No image yet", missing:"Picked image was removed from the library", placeholder:"Placeholder: replace with a real photo", file:"File not found on GitHub" };
/** Library browser: filters, thumbnails, and either one pick (onPick) or several (multi, onAdd). */
function libBrowser({ current="", multi=false, onPick, onAdd, onClose, addLabel="Add" }={}){
  const D=Store.draft, outer=h("div",{class:"media-pick-wrap"}), g=h("div",{class:"media-pick"}), countEl=h("span",{class:"media-pick-count"}), chosen=[];
  let usage=mediaUsage(D);
  const byUse=list=>PICK.use==="all"?list:list.filter(m=>(PICK.use==="used")===usage.has(m.id)||(multi?false:m.id===current)); // the current picture always stays in view
  const pool=()=>byUse(libFilter(D.media,{kinds:["image","video","scene"]}));
  const use=h("div",{class:"media-pick-use",role:"group","aria-label":"Show"});
  const drawUse=()=>{ use.textContent=""; const all=libFilter(D.media,{kinds:["image","video","scene"]}), nUsed=all.filter(m=>usage.has(m.id)).length;
    const n={unused:all.length-nUsed,used:nUsed,all:all.length};
    PICK_USE.forEach(([v,l])=>use.append(h("button",{type:"button",class:PICK.use===v?"on":"","aria-pressed":String(PICK.use===v),title:{unused:"Pictures not on any page, section, carousel, flow, modal or post yet",used:"Pictures already placed somewhere on the site",all:"Everything in the library"}[v],onclick:()=>{ PICK.use=v; draw(); }},l+" ",h("b",{text:String(n[v])})))); };
  const applySize=v=>{ const z=PICK_SIZES.find(x=>x[0]===v)||PICK_SIZES[0]; g.style.setProperty("--pick",z[2]+"px"); g.dataset.size=z[0]; };
  const cats=h("select",{"aria-label":"Category"});
  const fillCats=()=>{ cats.textContent=""; const all=pool(); cats.append(h("option",{value:"",text:"All categories ("+all.length+")"}));
    D.categories.forEach(c=>{ const n=all.filter(m=>m.category===c.id).length; if (!n && PICK.cat!==c.id) return; const o=h("option",{value:c.id,text:plain(c.label)+" ("+n+")"}); if (c.id===PICK.cat) o.selected=true; cats.append(o); });
    if (cats.value!==PICK.cat) PICK.cat=cats.value; };
  cats.addEventListener("change",()=>{ PICK.cat=cats.value; draw(); });
  const q=h("input",{type:"search",placeholder:"Search name or tag","aria-label":"Search images",value:PICK.q}); q.addEventListener("input",()=>{ PICK.q=q.value; draw(); });
  const sizes=h("div",{class:"media-pick-size",role:"group","aria-label":"Thumbnail size"});
  const drawSizes=()=>{ sizes.textContent=""; const cur=pickSize(); PICK_SIZES.forEach(([v,l])=>sizes.append(h("button",{type:"button",class:cur===v?"on":"",text:v.toUpperCase(),title:l+" thumbnails","aria-label":l+" thumbnails","aria-pressed":String(cur===v),onclick:()=>{ setPickSize(v); applySize(v); drawSizes(); }}))); };
  const addBtn=multi?h("button",{class:"btn sm primary",type:"button",disabled:true,onclick:()=>{ if (chosen.length) onAdd(chosen.slice()); }}):null;
  const syncAdd=()=>{ if (!addBtn) return; addBtn.disabled=!chosen.length; addBtn.innerHTML=IC.plus+(chosen.length?addLabel+" ("+chosen.length+")":"Pick one or more images"); };
  outer.append(use,h("div",{class:"media-pick-filters"},cats,q,sizes,countEl));
  const draw=()=>{ g.textContent=""; usage=mediaUsage(D); drawUse(); fillCats();
    const all=pool(), found=libFilter(all,{cat:PICK.cat,q:PICK.q}), list=[...found.filter(m=>m.kind!=="scene"),...found.filter(m=>m.kind==="scene")]; // real photos first, placeholders last
    countEl.textContent=list.length===all.length?all.length+" items":list.length+" of "+all.length;
    list.forEach(m=>{ const n=chosen.indexOf(m.id), on=multi?n>=0:current===m.id, places=usage.get(m.id)||[];
      const b=h("button",{type:"button",class:(on?"on":"")+(m.kind==="scene"?" is-ph":"")+(places.length?" is-used":" is-free"),title:plain(m.label)+(m.kind==="scene"?" (placeholder)":"")+"\n"+(places.length?usedText(places):"Not used anywhere yet"),"aria-label":plain(m.label)+(places.length?", used in "+places.length+(places.length===1?" place":" places"):", not used yet"),"aria-pressed":String(on)},mediaThumb(m.id),h("span",{text:plain(m.label)}),
        places.length?h("em",{class:"pick-used",text:places.length>1?"Used ×"+places.length:"Used"}):h("em",{class:"pick-free",text:"New"}),multi&&on?h("i",{class:"pick-n",text:String(n+1)}):null);
      b.addEventListener("click",()=>{ if (!multi){ onPick(m); return; } const k=chosen.indexOf(m.id); if (k>=0) chosen.splice(k,1); else chosen.push(m.id); syncAdd(); draw(); }); g.append(b); });
    if (!list.filter(m=>m.id!==current).length) g.append(h("p",{class:"media-pick-empty"},PICK.use==="unused"?"Every picture here is already used somewhere. ":"Nothing matches. Try another category or clear the search. ",
      PICK.use!=="all"?h("button",{class:"btn sm",type:"button",text:"Show all images",onclick:()=>{ PICK.use="all"; draw(); }}):null)); };
  applySize(pickSize()); drawSizes(); syncAdd(); draw(); outer.append(h("div",{class:"media-pick-scroll"},g));
  outer.append(h("div",{class:"mp-foot"},addBtn,onClose?h("button",{class:"btn sm",type:"button",text:multi?"Cancel":"Close",onclick:onClose}):null));
  return outer;
}
function mediaPicker(obj,key,opts,onChange){
  const D=Store.draft, outer=h("div",{class:"mp"}), cur=h("div",{class:"mp-cur"}), drawer=h("div",{class:"mp-drawer",hidden:true});
  let open=false;
  const close=()=>{ open=false; drawer.hidden=true; drawer.textContent=""; drawCur(); };
  const toggle=()=>{ if (open){ close(); return; } open=true;
    const c=slotCategory(D,obj[key]); if (c) PICK.cat=c; else if (opts.cat) PICK.cat=opts.cat; PICK.q=""; PICK.use="unused";
    drawer.textContent=""; drawer.append(libBrowser({ current:obj[key], onPick:m=>{ obj[key]=m.id; onChange(); close(); }, onClose:close })); drawer.hidden=false; drawCur(); };
  const drawCur=()=>{ cur.textContent=""; const id=obj[key], m=id?D.media.find(x=>x.id===id):null, st=mediaState(id);
    const pv=h("button",{type:"button",class:"mp-pv"+(m?"":" empty")+(st?" st-"+st:""),title:"Choose from the library","aria-label":(m?"Change "+plain(m.label):"Choose an image")+" from the library","aria-expanded":String(open)});
    pv.addEventListener("click",toggle); if (opts.hideKey&&obj[opts.hideKey]) pv.classList.add("is-hidden");
    if (m){ pv.append(m.kind==="article"?docThumb(m):(mediaNode(D,m.id,{w:640,hh:360})||h("span",{class:"mp-empty",text:"Can't show this file"}))); const ov=m.kind==="article"?null:overlayEl(D,m.id); if (ov) pv.append(ov); }
    else pv.append(h("span",{class:"mp-empty",text:id?"Missing":"No image"}));
    pv.append(h("span",{class:"mp-plus",html:open?IC.x:IC.plus,"aria-hidden":"true"}));
    const info=h("div",{class:"mp-info"},
      h("b",{text:m?plain(m.label):id?"Missing image":"No image yet"}),
      h("small",{text:m?[KIND_NAME[m.kind]||m.kind,categoryLabel(D,m.category)].filter(Boolean).join(" · "):"Press + to pick one from the library"}),
      st&&st!=="empty"?h("span",{class:"mp-flag",text:STATE_TEXT[st]}):null,
      h("div",{class:"mp-actions"},
        h("button",{class:"btn sm"+(open?"":" primary"),type:"button",html:(open?IC.x:IC.plus)+(open?"Close library":m?"Change from library":"Choose from library"),"aria-expanded":String(open),onclick:toggle}),
        id?h("button",{class:"btn sm",type:"button",text:"Remove image",title:"Take this image out (the library keeps the file)",onclick:()=>{ obj[key]=""; onChange(); close(); }}):null,
        opts.hideKey&&id?h("button",{class:"btn sm"+(obj[opts.hideKey]?" primary":""),type:"button",text:obj[opts.hideKey]?"Hidden on the site · Show it":"Hide on the site",title:"Keep the image picked but don't show it to visitors",onclick:()=>{ obj[opts.hideKey]=!obj[opts.hideKey]; onChange(); drawCur(); }}):null,
        m?h("button",{class:"btn sm",type:"button",text:"Open in Library",title:"Edit its name, category and overlay",onclick:()=>{ Admin.sel.media=m.id; LIB.cat=""; LIB.kind=""; LIB.q=""; openPanel("media"); }}):null));
    cur.append(pv,info); };
  drawCur(); outer.append(cur,drawer); return outer;
}
function iconPicker(obj,key,onChange){
  const g=h("div",{class:"icon-pick"});
  const draw=()=>{ g.textContent=""; g.append(h("button",{type:"button",class:!obj[key]?"on":"",title:"No icon","aria-label":"No icon",text:"–",onclick:()=>{ obj[key]=""; draw(); onChange(); }}));
    Store.draft.icons.forEach(ic=>{ const b=h("button",{type:"button",class:obj[key]===ic.id?"on":"",title:ic.label,"aria-label":ic.label,html:sanitizeSvg(ic.svg)}); b.addEventListener("click",()=>{ obj[key]=ic.id; draw(); onChange(); }); g.append(b); }); };
  draw(); return g;
}
/* sortable list of sub-objects, each collapsible */
function listEditor(obj,key,opts,onChange){
  const arr=obj[key]=obj[key]||[], box=h("div",{class:"sub-list"});
  /* Lists whose items carry a picture (slides, chapters, catalog items, cards…) show it on each row and can be filled from the library in one go */
  const mf=(opts.fields||[]).find(f=>f[1]==="media"), mk=mf&&mf[0];
  const thumb=mk?it=>{ const st=mediaState(it[mk]); return it[mk]&&st!=="missing"?h("span",{class:"sub-thumb"+(st?" st-"+st:""),title:st?STATE_TEXT[st]:""},mediaThumb(it[mk])):h("span",{class:"sub-thumb st-"+(st||"empty"),title:STATE_TEXT[st||"empty"],html:IC.plus}); }:null;
  const addFromLib=()=>{ const tray=h("div",{class:"lib-tray"});
    const c=slotCategory(Store.draft,(arr.find(it=>it&&slotCategory(Store.draft,it[mk]))||{})[mk]); if (c) PICK.cat=c; PICK.q=""; PICK.use="unused";
    tray.append(h("p",{class:"hint",style:"margin:0",text:"Pick the pictures in the order you want them. Each one becomes a new "+(opts.itemName||"item")+" at the end of the list."}),
      libBrowser({ multi:true, addLabel:"Add as "+(opts.itemName||"item")+"s", onClose:()=>tray.remove(), onAdd:ids=>{
        ids.forEach(id=>{ const it=opts.blank?opts.blank():{}; it[mk]=id; arr.push(it); }); draw(); onChange(); touch();
        toast(ids.length===1?"Added 1 "+(opts.itemName||"item")+" from the library.":"Added "+ids.length+" "+(opts.itemName||"item")+"s from the library."); } }));
    return tray; };
  const draw=()=>{ box.textContent="";
    arr.forEach((it,i)=>box.append(subCard(it,{title:()=>plain(it[opts.title])||"Item "+(i+1),kind:opts.kindLabel?opts.kindLabel(it):"",open:false,thumb:thumb?()=>thumb(it):null,
      onToggleHidden:opts.hideable?()=>{ it.hidden=!it.hidden; onChange(); touch(); }:null,
      body:()=>fieldsFor(it,opts.fields,onChange),onRemove:()=>{ arr.splice(i,1); draw(); onChange(); touch(); },
      onDuplicate:()=>{ arr.splice(i+1,0,clone(it)); draw(); box.children[i+1]?._open?.(); onChange(); touch(); }})));
    const addRow=h("div",{class:"sub-add"},h("button",{class:"btn sm",type:"button",html:IC.plus+"Add",onclick:()=>{ arr.push(opts.blank?opts.blank():{}); draw(); const last=box.querySelectorAll(".sub-item"); last.length&&last[last.length-1]._open?.(); onChange(); touch(); }}),
      mk?h("button",{class:"btn sm primary",type:"button",html:IC.plus+"Add from library",title:"Pick several pictures; each becomes a new "+(opts.itemName||"item"),onclick:e=>{ const r=e.currentTarget.parentNode; if (r.nextSibling&&r.nextSibling.classList?.contains("lib-tray")){ r.nextSibling.remove(); return; } r.after(addFromLib()); }}):null);
    box.append(addRow);
    sortable(box,arr,()=>{ draw(); onChange(); touch(); }); };
  draw(); return box;
}
function subCard(item,{title,kind,body,onRemove,open,onDuplicate,onToggleHidden,thumb}){
  const card=h("div",{class:"sub-item"+(open?"":" closed")+(item&&item.hidden?" is-hidden":"")}), t=h("span",{class:"t",text:title()});
  /* Shown / Hidden switch: one tap, and the state is written on it */
  const hideBtn=onToggleHidden?h("button",{class:"vis-pill",type:"button"}):null;
  const syncHide=()=>{ if (!hideBtn) return; const hid=!!item.hidden; card.classList.toggle("is-hidden",hid); hideBtn.innerHTML=(hid?IC.eyeOff:IC.eye)+"<span>"+(hid?"Hidden":"Shown")+"</span>";
    hideBtn.setAttribute("aria-label",hid?"Hidden from visitors. Tap to show it":"Shown to visitors. Tap to hide it"); hideBtn.title=hid?"Hidden from visitors. Tap to show":"Shown to visitors. Tap to hide"; hideBtn.setAttribute("aria-pressed",hid?"true":"false"); };
  if (hideBtn){ hideBtn.addEventListener("click",e=>{ e.stopPropagation(); onToggleHidden(); syncHide(); }); syncHide(); card._syncHide=syncHide; }
  let th=thumb?thumb():null; const syncThumb=()=>{ if (!thumb) return; const n=thumb(); th.replaceWith(n); th=n; };
  const head=h("div",{class:"sub-head"},h("span",{class:"handle",html:IC.grip,"aria-hidden":"true"}),th,kind?h("span",{class:"k",text:kind}):null,t,
    hideBtn,
    onDuplicate?h("button",{class:"x",type:"button","aria-label":"Duplicate",title:"Duplicate",html:IC.copy,onclick:e=>{ e.stopPropagation(); onDuplicate(); }}):null,
    h("button",{class:"x",type:"button","aria-label":"Remove",title:"Remove",html:IC.x,onclick:e=>{ e.stopPropagation(); confirmInline(card,"Remove this item?",onRemove); }}));
  let built=false; const b=h("div",{class:"sub-body"});
  const build=()=>{ if (built) return; built=true; b.append(body()); b.addEventListener("input",()=>{ t.textContent=title(); }); b.addEventListener("change",()=>{ t.textContent=title(); }); b.addEventListener("click",()=>setTimeout(syncThumb)); };
  head.addEventListener("click",e=>{ if (e.target.closest(".handle")) return; card.classList.toggle("closed"); if (!card.classList.contains("closed")) build(); });
  if (open) build();
  card.append(head,b); card._open=()=>{ card.classList.remove("closed"); build(); };
  return card;
}
function confirmInline(anchor,msg,yes,yesLabel="Remove"){
  const c=h("div",{class:"confirm"},h("span",{text:msg}),h("button",{class:"btn sm"+(yesLabel==="Remove"||yesLabel==="Delete"?" danger":" primary"),type:"button",text:yesLabel,onclick:()=>{ c.remove(); yes(); }}),h("button",{class:"btn sm",type:"button",text:"Keep",onclick:()=>c.remove()}));
  anchor.after(c);
}
function sortable(box,arr,onMove){
  if (!window.Sortable) return;
  Sortable.create(box,{handle:".handle",draggable:".sub-item",animation:180,ghostClass:"sortable-ghost",onEnd(e){ if (e.oldIndex===e.newIndex) return; const [m]=arr.splice(e.oldIndex,1); arr.splice(e.newIndex,0,m); onMove(); }});
}
function card(title,...kids){ return h("section",{class:"card-a"},h("h2",{},title),...kids); }
function masterDetail(body,{items,selKey,label,kind,onAdd,addLabel,detail}){
  const list=h("div",{class:"list",role:"list"}), det=h("div",{style:"display:flex;flex-direction:column;gap:20px;min-width:0"});
  /* Editing a name only redraws the list on the left. The detail is built once per selection,
     so a text box being typed in is never replaced (that is what used to drop the focus). */
  const drawList=()=>{ list.textContent="";
    items().forEach(x=>list.append(h("button",{class:"li"+(x.id===Admin.sel[selKey]?" on":""),type:"button",onclick:()=>{ Admin.sel[selKey]=x.id; draw(); }},label(x),kind?h("small",{text:kind(x)}):null)));
    if (onAdd) list.append(h("button",{class:"btn sm",type:"button",style:"margin-top:6px",html:IC.plus+esc(addLabel),onclick:()=>{ const n=onAdd(); Admin.sel[selKey]=n.id; touch(); draw(); }}));
  };
  const draw=()=>{
    if (!items().some(x=>x.id===Admin.sel[selKey])) Admin.sel[selKey]=items()[0]?.id;
    drawList(); det.textContent=""; const cur=items().find(x=>x.id===Admin.sel[selKey]); if (cur) det.append(...[].concat(detail(cur,drawList)));
  };
  body.append(h("div",{class:"cols"},list,det)); draw(); return draw;
}
function idOk(v,list,self){ return /^[a-z][a-z0-9-]{1,30}$/.test(v) && !["admin","settings","sidebar","customize","upgrade","downloads"].includes(v) && !list.some(x=>x!==self&&x.id===v); }

/* ---------- panels ---------- */
function panelSite(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"The brand name, header button and footer appear on every page. Page titles here are the names shown in the menu and browser tab."}));
  body.append(card("Brand and header",fieldsFor(D.site,[["brand","text","Brand name"],["footer","text","Footer text"],["homePage","page","Home page"],["showStudioLink","toggle","Show the studio button to editors on the site"]]),
    h("div",{class:"fields"},F(D.site,"cta","button","Header button"))));
  body.append(card("Quote requests",h("p",{class:"adm-intro",style:"margin:0",text:"Quote request forms (service pages, catalogs and the Request a Quote modal) open the visitor's email app with the request filled in, addressed to this email. Nothing is stored on the site. Without an email, visitors can copy their request instead."}),
    fieldsFor(D.site,[["quoteEmail","text","Send quote requests to (email)",{placeholder:"name@company.com"}]])));
  body.append(card("Languages and numbering",h("p",{class:"adm-intro",text:"Choose the languages visitors can read. With both, a switch in the header lets them change language. When Arabic is on, every text box in the studio shows English and Arabic side by side. A language left empty shows the other language's text."}),
    fieldsFor(D.site,[["languages","select","Site languages",{options:[["en","English only"],["ar","Arabic only"],["both","English and Arabic"]]}],["defaultLang","select","Language for first-time visitors",{options:[["en","English"],["ar","العربية"]]}],["showNumbers","toggle","Show numbering (01, 02… counters, steps and badges)"]],(v,k)=>{ if (k==="languages") openPanel("site"); })));
  body.append(card("Logo",h("p",{class:"adm-intro",text:"The logo in the site header. Leave the image on None to use the built-in white Dorma logo, or pick any image from the Library (a transparent PNG or SVG with light colours works best on the dark header)."}),
    fieldsFor(D.site,[["logoMode","select","Header shows",{options:[["image","Logo image"],["text","Brand name as text"]]}],["logoHeight","range","Logo height (px)",{min:20,max:64,step:1}],["logo","media","Logo image (None uses the white Dorma logo)",{allowNone:true}],["logoLight","media","Logo on light pages, light mode (None uses the blue Dorma logo)",{allowNone:true}]])));
  body.append(loaderCard());
  const titles=h("div",{class:"fields"});
  D.pages.forEach(p=>{ titles.append(F(p,"title","text",p.id+" · title")); titles.append(F(p,"nav","toggle","Show "+(plain(p.title)||p.id)+" in menu")); });
  body.append(card("Page titles",titles));
  body.append(card("Backup",h("p",{class:"adm-intro",text:"Copy every setting as text to keep a backup, or paste a backup to replace the draft."}),
    h("div",{style:"display:flex;gap:10px;flex-wrap:wrap"},
      h("button",{class:"btn",type:"button",text:"Copy settings",onclick:async()=>{ const s=JSON.stringify(Store.draft); try { await navigator.clipboard.writeText(s); toast("Settings copied"); } catch(e){ area.value=s; area.select(); toast("Select all and copy the text below"); } }}),
      h("button",{class:"btn",type:"button",text:"Replace draft with pasted settings",onclick:()=>{ try { const c=JSON.parse(area.value); Store.draft=normalize(c); touch({theme:true}); toast("Draft replaced"); openPanel("site"); } catch(e){ toast("That text isn't a valid settings backup."); } }}),
      h("button",{class:"btn",type:"button",text:"Discard draft changes",onclick:e=>confirmInline(e.currentTarget.parentNode,"Go back to the live version?",()=>{ Store.draft=clone(Store.live); touch({theme:true}); openPanel("site"); })}),
      h("button",{class:"btn danger",type:"button",text:"Reset to starter template",onclick:e=>confirmInline(e.currentTarget.parentNode,"Replace the draft with the starter template?",()=>{ Store.draft=clone(STARTER); touch({theme:true}); openPanel("site"); })})),
    (area=h("textarea",{class:"code","aria-label":"Settings text",rows:4,style:"width:100%;padding:10px;border-radius:7px;border:1px solid var(--faint);background:var(--field-bg);font-family:var(--mono);font-size:.74rem"}))));
  var area;
  if (Store.mode==="db") body.append(versionsCard());
}
function loaderCard(){
  const D=Store.draft, L=D.loader;
  const thumb=h("div",{class:"ld-thumb"}), note=h("span",{class:"hint"});
  const redraw=()=>{ const bad=L.logo && !sanitizeSvg(L.logo); note.textContent=bad?"That text isn't a valid SVG, so the wordmark is shown instead.":""; thumb.dataset.bg=L.bg; thumb.innerHTML=markHtml({...L,logo:bad?"":L.logo},imageUrl(L,D)); };
  const file=h("input",{type:"file",accept:".svg,image/svg+xml",hidden:true});
  file.addEventListener("change",async()=>{ const f=file.files&&file.files[0]; if (!f) return; const txt=await f.text(); if (!sanitizeSvg(txt)){ toast("That file isn't a valid SVG."); return; } L.logo=txt; L.mark="svg"; touch(); openPanel("site"); });
  const c=card("Loader",
    h("p",{class:"adm-intro",text:"Shown while the site loads. By default it uses the header logo on the dark site background. You can also pick another library image, a typed wordmark, or an SVG logo (needed for the Draw animation). Visitors see your published choice from their second visit; the very first visit shows the white Dorma logo."}),
    thumb,
    fieldsFor(L,[["enabled","toggle","Show the loader"],["mark","select","Show",{options:[["image","Logo image"],["wordmark","Typed wordmark"],["svg","SVG logo"]]}],["bg","select","Background",{options:[["theme","Site background (dark)"],["light","White (uses the colour logo)"]]}],["style","select","Animation",{options:[["reveal","Reveal: logo wipes in, colour line sweeps"],["draw","Draw: outlines draw, then fill"],["pulse","Pulse: soft glow"]]}],["exit","select","Exit",{options:[["wipe","Wipe up"],["fade","Fade"]]}],["minTime","range","Minimum time on screen (seconds)",{min:0,max:4,step:.1}],["text","text","Wordmark"],["sub","text","Line under the wordmark (not shown with a logo image)"]],redraw),
    h("div",{class:"fields"},F(L,"image","media","Logo image (None uses the header logo)",{allowNone:true},redraw)),
    h("div",{class:"fields"},F(L,"logo","code","Logo SVG (optional, replaces the wordmark)",{wide:true,hint:"Paste SVG code, or upload a file. Simple outlined shapes work best with the Draw animation."},redraw)),
    h("div",{style:"display:flex;gap:10px;flex-wrap:wrap"},
      h("button",{class:"btn",type:"button",text:"Upload SVG logo",onclick:()=>file.click()}),
      h("button",{class:"btn primary",type:"button",text:"Preview loader",onclick:()=>previewLoader(D)}),file),note);
  redraw(); return c;
}
function versionsCard(){
  const list=h("div",{class:"fields"},h("p",{class:"mono",text:"Loading…"}));
  listVersions().then(vs=>{ list.textContent="";
    if (!vs.length){ list.append(h("p",{class:"adm-intro",text:"Nothing has been published yet."})); return; }
    vs.forEach((v,i)=>list.append(h("div",{style:"display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap"},
      h("span",{text:new Date(v.published_at).toLocaleString()+(i===0?" · live now":"")}),
      i===0?null:h("button",{class:"btn sm",type:"button",text:"Put in draft",onclick:e=>confirmInline(e.currentTarget.parentNode,"Replace the draft with this version? Publish afterwards to make it live.",async()=>{ if (await restoreVersion(v.id)){ touch({theme:true}); toast("That version is now the draft"); openPanel("site"); } else toast("Couldn't load that version."); })}))));
  });
  return card("Published versions",h("p",{class:"adm-intro",text:"The last 30 published versions. Putting one in the draft lets you check it before publishing it again."}),list);
}
function signInForm(){
  const email=h("input",{type:"email",autocomplete:"username",required:true,id:"si-email"}), pw=h("input",{type:"password",autocomplete:"current-password",required:true,id:"si-pw"});
  const msg=h("p",{class:"mono",role:"alert",style:"color:var(--bad);min-height:1.2em"}), go=h("button",{class:"btn primary",type:"submit",html:"Sign in"+ARROW_SVG});
  const form=h("form",{class:"signin"},h("span",{class:"mark"}),h("h1",{class:"h3",text:"Studio sign-in"}),h("p",{class:"lede",text:"Only editors can open the studio."}),
    h("label",{for:"si-email",text:"Email"}),email,h("label",{for:"si-pw",text:"Password"}),pw,msg,go,
    h("a",{class:"more",href:"#"+(Store.live?.site.homePage||"home"),html:"Back to the site"+ARROW_SVG}));
  form.addEventListener("submit",async e=>{ e.preventDefault(); go.disabled=true; msg.textContent=""; const err=await signIn(email.value.trim(),pw.value); go.disabled=false; if (err){ msg.textContent=err; return; } route(); });
  return h("div",{class:"denied"},form);
}
function notEditor(){
  return h("div",{class:"denied"},h("div",{},h("span",{class:"mark"}),h("h1",{class:"h3",text:"This account isn't an editor"}),
    h("p",{class:"lede",text:"You're signed in as "+signedInEmail()+". Ask the site owner to add you as an editor, then reload this page."}),
    h("div",{style:"display:flex;gap:12px;flex-wrap:wrap;justify-content:center"},
      h("button",{class:"btn",type:"button",text:"Sign out",onclick:async()=>{ await signOut(); route(); }}),
      h("a",{class:"more",href:"#"+(Store.live?.site.homePage||"home"),html:"Back to the site"+ARROW_SVG}))));
}
const PALETTES=[["Dorma","#ffc93c","#040915","#0b1630","#eef2fa"],["Ember","#ff9e5e","#05060a","#10121b","#eef1f6"],["Glacier","#7fd4ff","#04070b","#0e141c","#eaf3f8"],["Violet","#a58bff","#06050b","#120f1d","#f0eef8"],["Rose","#ff7a9c","#070507","#171018","#f6eef1"],["Brass","#e3b866","#070604","#16130d","#f3efe6"],["Mono","#f2f2f2","#050505","#121212","#f2f2f2"]];
function panelTheme(body){
  const T=Store.draft.theme;
  const sw=h("div",{class:"swatches"}); PALETTES.forEach(([n,a,ink,panel,fg])=>sw.append(h("button",{type:"button",onclick:()=>{ Object.assign(T,{accent:a,ink,panel,fg}); touch({theme:true}); openPanel("theme"); }},h("i",{style:`background:linear-gradient(135deg,${ink} 50%,${a} 50%)`}),n)));
  T.myPalettes=Array.isArray(T.myPalettes)?T.myPalettes:[]; T.swatches=Array.isArray(T.swatches)?T.swatches:[];
  T.myPalettes.forEach((pl,i)=>sw.append(h("span",{class:"saved-pal"},h("button",{type:"button",title:"Use this palette",onclick:()=>{ Object.assign(T,{accent:pl.accent,ink:pl.ink,panel:pl.panel,fg:pl.fg}); touch({theme:true}); openPanel("theme"); }},h("i",{style:`background:linear-gradient(135deg,${pl.ink} 50%,${pl.accent} 50%)`}),pl.name||"My palette"),
    h("button",{type:"button",class:"rm","aria-label":"Remove palette "+(pl.name||""),html:IC.x,onclick:()=>{ T.myPalettes.splice(i,1); touch({theme:true}); openPanel("theme"); }}))));
  const palName=h("input",{type:"text",placeholder:"Palette name","aria-label":"Name for the saved palette",class:"adm-pal-name",style:"max-width:220px"});
  const savePal=h("div",{style:"display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"},palName,h("button",{class:"btn sm",type:"button",html:IC.plus+"Save current colours as a palette",onclick:()=>{
    T.myPalettes.push({name:palName.value.trim()||"My palette "+(T.myPalettes.length+1),accent:T.accent,ink:T.ink,panel:T.panel,fg:T.fg}); touch({theme:true}); toast("Palette saved."); openPanel("theme"); }}));
  /* My colours: named swatches shown next to every colour picker in the studio */
  const myBox=h("div",{class:"my-colours"});
  const drawMine=()=>{ myBox.textContent="";
    T.swatches.forEach((s,i)=>{ const c=h("button",{type:"button",class:"cp-swatch",title:"Open the colour wheel","aria-label":"Change "+(s.name||"colour"),style:"background:"+(hexOk(s.hex)?s.hex:"#000000")}), x=h("input",{type:"text",value:s.hex||"","aria-label":"Hex code",style:"width:96px"}), n=h("input",{type:"text",value:s.name||"",placeholder:"Name","aria-label":"Colour name"});
      c.addEventListener("click",()=>colorPanel(c,{value:hexOk(s.hex)?s.hex:"#000000",title:s.name||"My colour",onPick:hex=>{ s.hex=x.value=hex; c.style.background=hex; scheduleSave(); }}));
      x.addEventListener("change",()=>{ if (/^#[\da-f]{6}$/i.test(x.value.trim())){ s.hex=x.value.trim().toLowerCase(); c.style.background=s.hex; touch(); } else x.value=s.hex; }); n.addEventListener("input",()=>{ s.name=n.value; touch(); });
      myBox.append(h("div",{class:"my-row"},c,x,n,h("button",{class:"x",type:"button","aria-label":"Remove colour",title:"Remove",html:IC.x,onclick:()=>{ T.swatches.splice(i,1); touch(); drawMine(); }}))); });
    myBox.append(h("button",{class:"btn sm",type:"button",style:"align-self:flex-start",html:IC.plus+"Add colour",title:"Pick a colour from the panel to add it",onclick:e=>colorPanel(e.currentTarget,{value:T.accent,title:"Add a colour",addMode:true,onPick:hex=>{
      if (!T.swatches.some(s=>(s.hex||"").toLowerCase()===hex)){ T.swatches.push({name:"",hex}); touch(); } drawMine(); }})})); };
  drawMine();
  const prev=h("div",{class:"preview-box"}); const drawPrev=()=>{ prev.textContent=""; const d=h("div",{class:"txt",style:"gap:14px"},h("p",{class:"eyebrow",html:"<b>01</b> Preview"}),h("h3",{class:"display",style:"font-size:clamp(2rem,4vw,3.4rem)",text:"See further than the map"}),h("p",{class:"lede",text:"Body text in the chosen font and muted colour."}));
    const fl=renderFlow(Store.draft,(Store.draft.flows[0]||{}).id); if (fl){ fl.setActive(0,{fill:true}); d.append(fl.el); } d.append(h("button",{class:"more",type:"button",html:"More"+ARROW_SVG})); prev.append(d,h("span",{class:"lbl-a",text:"Live preview"})); };
  Admin.refresh=drawPrev; drawPrev();
  body.append(card("Palettes",sw,savePal),
    card(h("span",{class:"grow"},"My colours"),importLink("colours","Import colours"),h("p",{class:"adm-intro",style:"margin:0",text:"Your own named colours. They show as small dots next to every colour picker in the studio (colours, overlays, everywhere), so one click applies them."}),myBox),
    card("Preview",prev),
    card("Background colours",fieldsFor(T,[["ink","color","Background"],["panel","color","Panels"],["lineOpacity","range","Line strength",{min:.04,max:.4,step:.01,theme:true}]])),
    card("Type",h("p",{class:"adm-intro",style:"margin:0",text:"Fonts and sizes for titles, headings, subtitles, body text and labels across the site. Sizes multiply the designed sizes (1 = as designed). Any section or modal set to Custom can change its own title and subtitle sizes and title font."}),
      fieldsFor(T,[["display","select","Titles and headings font",{options:OPT.fonts,theme:true}],["body","select","Body font",{options:OPT.fonts,theme:true}],["mono","select","Labels font",{options:OPT.monos,theme:true}],["radius","range","Corner radius",{min:0,max:16,step:1,theme:true}]]),
      fieldsFor(T.type=T.type||{},[["titleSize","range","Hero and slide titles: size",{min:.5,max:1.6,step:.05,theme:true}],["headingSize","range","Section headings: size",{min:.5,max:1.6,step:.05,theme:true}],
        ["headingWeight","select","Titles and headings: weight",{options:[[300,"Light"],[400,"Regular"],[500,"Medium"],[600,"Semibold"],[700,"Bold"]],theme:true}],
        ["subFont","select","Subtitles and short paragraphs: font",{options:[["","Same as body"],...OPT.fonts],theme:true}],["subSize","range","Subtitles and short paragraphs: size",{min:.7,max:1.6,step:.05,theme:true}],
        ["bodySize","range","Body text: size",{min:.7,max:1.5,step:.05,theme:true}],
        ["labelFont","select","Eyebrows and labels: font",{options:[["","Same as labels font"],...OPT.fonts,...OPT.monos],theme:true}],["labelSize","range","Eyebrows and labels: size",{min:.7,max:1.6,step:.05,theme:true}],
        ["arabic","select","Arabic text font",{options:OPT.arabicFonts,theme:true}],["hand","select","Handwriting (animated notes)",{options:OPT.handFonts,theme:true}],["handAr","select","Arabic handwriting (animated notes)",{options:OPT.handArFonts,theme:true}]])),
    goStyle("Text, accent, header colours, the image filter and the defaults for every flow and slide are in Global style."));
}
/* ---------- colour overlay editor ----------
   Edits holder[key] = {mode, c1,a1, c2,a2, angle, blend}. With allowDefault, "default" follows the site-wide overlay. */
const OV_CUSTOM=["solid","linear","radial"];
function overlayEditor(holder,key,{allowDefault=false,preview=false,onChange=()=>{},defaultLabel="Site default",defaultHint=null}={}){
  const D=Store.draft, wrap=h("div",{class:"ov-edit"});
  const pv=preview?h("div",{class:"ph ov-prev"}):null;
  const sampleId=()=>{ const ids=[]; D.pages.forEach(p=>(p.sections||[]).forEach(sec=>{ (sec.slides||[]).forEach(x=>ids.push(x.media)); ids.push(sec.media); })); ids.push(...D.media.map(m=>m.id));
    return ids.find(id=>{ const m=id&&D.media.find(x=>x.id===id); return m&&m.kind!=="article"&&!m.hidden; }); };
  const drawPrev=()=>{ if (!pv) return; pv.textContent=""; const id=sampleId(); const n=id?mediaNode(D,id,{w:960,hh:540}):null; if (n) pv.append(n); const o=holder[key], ov=id?(o&&o.mode==="default"?overlayEl(D,id):overlayEl(D,id,o)):null; if (ov) pv.append(ov); pv.append(h("span",{class:"lbl-a",text:"Preview"})); };
  const swatch=(label,o,onclick,on)=>{ const css=overlayCss(o,{rtl:false});
    return h("button",{type:"button",class:on?"on":"",onclick},h("i",{style:`background:${css?css.background+",":""}linear-gradient(135deg,#3a4a66,#c9b48a)`}),label); };
  const same=(a,b)=>!!a&&!!b&&["mode","c1","a1","c2","a2","angle","blend"].every(k=>a.mode==="solid"&&(k==="c2"||k==="a2"||k==="angle")?true:String(a[k])===String(b[k]));
  const draw=()=>{ wrap.textContent="";
    if (!holder[key]||typeof holder[key]!=="object"||!holder[key].mode) holder[key]={mode:allowDefault?"default":"none"};
    const o=holder[key], set=v=>{ holder[key]=v; touch(); onChange(); draw(); };
    const sw=h("div",{class:"swatches ov-presets"});
    if (allowDefault) sw.append(swatch(defaultLabel,overlayOn(D.theme.imageOverlay),()=>set({mode:"default"}),o.mode==="default"));
    sw.append(swatch("None",null,()=>set({...o,mode:"none"}),o.mode==="none"));
    OV_PRESETS.forEach(([n,p])=>sw.append(swatch(n,p,()=>set(clone(p)),same(o,p))));
    const modes=(allowDefault?[["default",defaultLabel==="Site default"?"Use the site default":defaultLabel]]:[]).concat(OPT.overlayModes);
    wrap.append(h("p",{class:"hint",text:"Dorma presets"}),sw,fieldsFor(o,[["mode","select","Overlay",{options:modes}]],()=>{
      if (OV_CUSTOM.includes(o.mode)){ const b=D.theme.imageOverlay||{}; [["c1","#0072bc"],["a1",.55],["c2","#ffcb08"],["a2",.35],["angle",135],["blend","normal"]].forEach(([k,d])=>{ if (o[k]==null) o[k]=b[k]??d; }); }
      onChange(); draw(); }));
    if (OV_CUSTOM.includes(o.mode)){
      const grad=o.mode!=="solid", schema=[["c1","color",grad?"Start colour":"Colour"],["a1","range",grad?"Start strength":"Strength",{min:0,max:1,step:.01}]];
      if (grad) schema.push(["c2","color","End colour"],["a2","range","End strength",{min:0,max:1,step:.01}]);
      if (o.mode==="linear") schema.push(["angle","range","Direction in degrees (0 = start at the bottom, 90 = start at the left)",{min:0,max:360,step:5}]);
      schema.push(["blend","select","Blend mode",{options:OPT.blends}]);
      wrap.append(fieldsFor(o,schema,()=>{ onChange(); drawPrev(); }));
      if (o.mode==="linear") wrap.append(h("p",{class:"hint",text:"On Arabic pages the direction flips left to right, so a fade behind the text stays behind the text."}));
    } else if (o.mode==="default"){
      const site=overlayOn(D.theme.imageOverlay);
      wrap.append(h("p",{class:"hint",text:defaultHint||(site?"Follows the image filter in Global style.":"The global image filter is off, so this item shows no overlay. Set one in Global style, or pick a preset here.")}));
    }
    if (pv) wrap.append(pv);
    drawPrev();
  };
  draw();
  return wrap;
}
const overlayOn=o=>o&&OV_CUSTOM.includes(o.mode)?o:null;
function panelMotion(body){
  const M=Store.draft.motion;
  const prev=h("div",{class:"preview-box",style:"flex-direction:column;align-items:flex-start;gap:18px"});
  const play=()=>{ prev.textContent=""; gsap.globalTimeline.timeScale(+M.speed||1); const t=h("h3",{class:"display",style:"font-size:clamp(2rem,4.5vw,3.6rem)"}); prev.append(t,h("span",{class:"lbl-a",text:"Title reveal"})); revealTitle(Store.draft,t,"Ship it into the light",.1);
    const fl=renderFlow(Store.draft,(Store.draft.flows[0]||{}).id); if (fl){ prev.append(fl.el); fl.play(.3); } };
  Admin.refresh=play; play();
  body.append(card(h("span",{},"Preview"),prev,h("button",{class:"btn sm",type:"button",style:"align-self:flex-start",html:IC.replay+"Replay",onclick:play})),
    card("Global",fieldsFor(M,[["speed","range","Overall speed",{min:.4,max:2,step:.05}],["ease","select","Easing",{options:OPT.ease}],["titleReveal","select","Title reveal",{options:OPT.titleReveal}],["scrollReveal","select","Sections on scroll",{options:OPT.scrollReveal}],["counters","toggle","Count numbers up"],["parallax","toggle","Mouse parallax on heroes"]])),
    card("Buttons",fieldsFor(M,[["buttonGlow","range","Button glow (0 = off)",{min:0,max:1,step:.05,theme:true}]])),
    card("Modals",fieldsFor(M,[["modalOpen","select","Opening style",{options:OPT.modalOpen}],["modalClose","select","Closing style",{options:OPT.modalClose}]])),
    h("p",{class:"adm-intro",text:"Each flow also has its own animation settings, under Flows. Carousel transitions and slide times are under Carousels."}));
}
/* ---------- colour panel ----------
   A colour wheel: drag round the ring for the hue, and in the square for how strong and how bright it is.
   Under it, shades of the current colour from dark to light (one click picks a grade), its tints from grey to full,
   the hex code, My colours and the Dorma brand colours, and the colours used most recently.
   Picking applies the colour as you drag; "Add to My colours" keeps it in the palette shown next to every colour field. */
function hslHex(hh,s,l){ s/=100; l/=100; const k=n=>(n+hh/30)%12, a=s*Math.min(l,1-l), f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));
  return "#"+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,"0")).join(""); }
function hexHsv(hex){ const n=parseInt(hex.slice(1),16), r=(n>>16&255)/255, g=(n>>8&255)/255, b=(n&255)/255, mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn;
  let hh=0; if (d){ hh=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4; hh*=60; if (hh<0) hh+=360; }
  return {h:hh,s:mx?d/mx:0,v:mx}; }
function hsvHex(hh,s,v){ const f=n=>{ const k=(n+hh/60)%6; return v-v*s*Math.max(0,Math.min(k,4-k,1)); };
  return "#"+[f(5),f(3),f(1)].map(x=>Math.round(Math.max(0,Math.min(1,x))*255).toString(16).padStart(2,"0")).join(""); }
function hexHsl(hex){ const {h:hh,s,v}=hexHsv(hex), l=v*(1-s/2), sl=l===0||l===1?0:(v-l)/Math.min(l,1-l); return {h:hh,s:sl*100,l:l*100}; }
const CP_BRAND=[["Dorma blue","#0072bc"],["Dorma yellow","#ffcb08"],["Dorma magenta","#ed0677"],["Dorma cyan","#00aeef"],["Ink","#040915"],["Night panel","#0b1630"],["White","#ffffff"],["Black","#000000"]];
const RECENT_KEY="dorma.recentColours";
const recentColours=()=>{ try { const a=JSON.parse(localStorage.getItem(RECENT_KEY)||"[]"); return Array.isArray(a)?a.filter(hexOk).slice(0,10):[]; } catch { return []; } };
const rememberColour=hex=>{ try { localStorage.setItem(RECENT_KEY,JSON.stringify([hex,...recentColours().filter(x=>x!==hex)].slice(0,10))); } catch { /* storage blocked */ } };
let cpClose=null;
function colorPanel(anchor,{value="#ffffff",onPick=()=>{},title="Pick a colour",addMode=false}={}){
  if (cpClose) cpClose();
  const D=Store.draft, T=D.theme; T.swatches=Array.isArray(T.swatches)?T.swatches:[];
  let cur=hexOk(value)?value.toLowerCase():"#ffffff", hsv=hexHsv(cur);
  const start=cur;
  const panel=h("div",{class:"cpanel",role:"dialog","aria-label":title});
  /* wheel: hue ring + strength/brightness square */
  const ringKnob=h("i",{class:"cw-knob"}), sqKnob=h("i",{class:"cw-knob"});
  const ring=h("div",{class:"cw-ring",role:"slider","aria-label":"Hue","aria-valuemin":"0","aria-valuemax":"360",tabindex:"0"});
  const sq=h("div",{class:"cw-sq",role:"slider","aria-label":"Strength and brightness (arrow keys: left/right strength, up/down brightness)",tabindex:"0"},sqKnob);
  const wheel=h("div",{class:"cw"},ring,sq,ringKnob);
  const was=h("button",{type:"button",class:"cw-was",title:"Back to "+start,"aria-label":"Back to the starting colour",style:"background:"+start,onclick:()=>choose(start)}), now=h("span",{class:"cw-now"});
  const hx=h("input",{type:"text",value:cur,"aria-label":"Hex code",spellcheck:"false",maxlength:"7"});
  const shades=h("div",{class:"cp-grade","aria-label":"Shades"}), tints=h("div",{class:"cp-grade","aria-label":"Strength"});
  const marks=()=>$$(".cp-sw",panel).forEach(b=>b.classList.toggle("on",b.dataset.hex===cur));
  /* everything that shows the current colour */
  const paint=({fromHex=false,grades=true}={})=>{
    const a=hsv.h*Math.PI/180; ringKnob.style.left=(50+Math.cos(a)*44.5)+"%"; ringKnob.style.top=(50+Math.sin(a)*44.5)+"%";
    ringKnob.style.background=hsvHex(hsv.h,1,1); ring.setAttribute("aria-valuenow",String(Math.round(hsv.h)));
    sq.style.setProperty("--hue",hsvHex(hsv.h,1,1)); sqKnob.style.left=(hsv.s*100)+"%"; sqKnob.style.top=((1-hsv.v)*100)+"%"; sqKnob.style.background=cur;
    now.style.background=cur; if (!fromHex) hx.value=cur;
    if (grades) drawGrades(); marks(); };
  const drawGrades=()=>{ const {h:hh,s}=hexHsl(cur); shades.textContent=""; tints.textContent="";
    [8,16,26,36,46,56,66,76,86,94].forEach(l=>shades.append(sw(hslHex(Math.round(hh),Math.round(Math.max(s,8)),l),"Shade "+l+"%")));
    [0,12,24,36,48,60,72,84,100].forEach(k=>tints.append(sw(hsvHex(hsv.h,k/100,Math.max(hsv.v,.35)),"Strength "+k+"%"))); };
  const added=()=>{ rememberColour(cur); onPick(cur); close(); toast("Added to My colours."); };
  const apply=()=>{ if (!addMode) onPick(cur); };
  function choose(hex,{grades=true}={}){ cur=hex.toLowerCase(); hsv=hexHsv(cur); paint({grades}); if (addMode) added(); else { onPick(cur); rememberColour(cur); } }
  function sw(hex,name){ return h("button",{type:"button",class:"cp-sw","data-hex":hex.toLowerCase(),style:"background:"+hex,title:(name?name+" · ":"")+hex,"aria-label":(name||"Colour")+" "+hex,onclick:()=>choose(hex,{grades:!/^(Shade|Strength)/.test(name||"")})}); }
  /* dragging */
  const drag=(el,fn)=>{ el.addEventListener("pointerdown",e=>{ e.preventDefault(); el.setPointerCapture(e.pointerId); fn(e); el.focus({preventScroll:true});
    const mv=ev=>fn(ev), up=()=>{ el.removeEventListener("pointermove",mv); el.removeEventListener("pointerup",up); el.removeEventListener("pointercancel",up); if (!addMode) rememberColour(cur); drawGrades(); };
    el.addEventListener("pointermove",mv); el.addEventListener("pointerup",up); el.addEventListener("pointercancel",up); }); };
  drag(ring,e=>{ const r=ring.getBoundingClientRect(); let a=Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI; if (a<0) a+=360;
    hsv.h=a; if (hsv.s<.05&&hsv.v>.95){ hsv.s=.8; hsv.v=.9; } cur=hsvHex(hsv.h,hsv.s,hsv.v); paint({grades:false}); apply(); });
  drag(sq,e=>{ const r=sq.getBoundingClientRect(); hsv.s=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)); hsv.v=Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height));
    cur=hsvHex(hsv.h,hsv.s,hsv.v); paint({grades:false}); apply(); });
  ring.addEventListener("keydown",e=>{ const d={ArrowRight:5,ArrowUp:5,ArrowLeft:-5,ArrowDown:-5}[e.key]; if (d==null) return; e.preventDefault(); hsv.h=(hsv.h+d*(e.shiftKey?3:1)+360)%360; cur=hsvHex(hsv.h,hsv.s,hsv.v); paint(); apply(); });
  sq.addEventListener("keydown",e=>{ const k=e.shiftKey?.1:.02; if (e.key==="ArrowRight") hsv.s=Math.min(1,hsv.s+k); else if (e.key==="ArrowLeft") hsv.s=Math.max(0,hsv.s-k); else if (e.key==="ArrowUp") hsv.v=Math.min(1,hsv.v+k); else if (e.key==="ArrowDown") hsv.v=Math.max(0,hsv.v-k); else return;
    e.preventDefault(); cur=hsvHex(hsv.h,hsv.s,hsv.v); paint(); apply(); });
  hx.addEventListener("input",()=>{ let v=hx.value.trim().toLowerCase(); if (/^[\da-f]{6}$/.test(v)) v="#"+v; if (/^#[\da-f]{3}$/.test(v)) v="#"+v.slice(1).split("").map(c=>c+c).join("");
    if (hexOk(v)){ cur=v; hsv=hexHsv(cur); paint({fromHex:true}); apply(); } });
  hx.addEventListener("change",()=>{ hx.value=cur; if (!addMode) rememberColour(cur); });
  const mineRow=h("div",{class:"cp-row"});
  const drawMine=()=>{ mineRow.textContent=""; const ok=T.swatches.filter(s=>hexOk(s.hex));
    if (!ok.length) mineRow.append(h("span",{class:"hint",text:"None yet. Pick a colour and add it."})); ok.forEach(s=>mineRow.append(sw(s.hex,s.name))); marks(); };
  const brand=h("div",{class:"cp-row"}); CP_BRAND.forEach(([n,c])=>brand.append(sw(c,n)));
  const recent=recentColours(), recentRow=recent.length?h("div",{class:"cp-row"},...recent.map(c=>sw(c,"Recent"))):null;
  const addBtn=h("button",{class:"btn sm"+(addMode?" primary":""),type:"button",html:IC.plus+(addMode?"Add this colour":"Add to My colours"),onclick:()=>{
    if (addMode){ added(); return; }
    if (!T.swatches.some(s=>(s.hex||"").toLowerCase()===cur)){ T.swatches.push({name:"",hex:cur}); touch(); toast("Added to My colours."); } drawMine(); }});
  panel.append(h("div",{class:"cp-head"},h("strong",{text:title}),h("button",{class:"x",type:"button","aria-label":"Close",html:IC.x,onclick:()=>close()})),
    h("div",{class:"cw-top"},wheel,h("div",{class:"cw-side"},h("div",{class:"cw-cmp",title:"Starting colour and new colour"},was,now),h("label",{class:"cw-hex"},h("span",{class:"hint",text:"Hex"}),hx),addBtn,
      h("p",{class:"hint cw-tip",text:"Drag the ring for the colour, the square for strength (left to right) and brightness (top to bottom)."}))),
    h("p",{class:"hint",text:"Shades: dark to light"}),shades,h("p",{class:"hint",text:"Strength: grey to full colour"}),tints,
    h("p",{class:"hint",text:"My colours"}),mineRow,h("p",{class:"hint",text:"Dorma"}),brand,
    ...(recentRow?[h("p",{class:"hint",text:"Recent"}),recentRow]:[]));
  drawMine(); paint();
  const host=$(".adm")||document.body; host.append(panel);
  const place=()=>{ const r=anchor.getBoundingClientRect(), w=panel.offsetWidth, ph=panel.offsetHeight;
    const left=Math.min(Math.max(8,r.left),innerWidth-w-8); let top=r.bottom+6; if (top+ph>innerHeight-8) top=Math.max(8,r.top-ph-6);
    panel.style.left=left+"px"; panel.style.top=top+"px"; };
  place();
  const outside=e=>{ if (!panel.contains(e.target) && !anchor.contains(e.target)) close(); };
  const onKey=e=>{ if (e.key==="Escape"){ close(); anchor.focus(); } };
  function close(){ panel.parentNode&&panel.parentNode.removeChild(panel); removeEventListener("pointerdown",outside,true); removeEventListener("keydown",onKey); removeEventListener("resize",place); removeEventListener("scroll",place,true); if (cpClose===close) cpClose=null; }
  addEventListener("pointerdown",outside,true); addEventListener("keydown",onKey); addEventListener("resize",place); addEventListener("scroll",place,true);
  cpClose=close; sq.focus({preventScroll:true});
}
/* ================= EFFECT EDITORS =================
   Background effects, picture masks, section entrance/exit and modal opening/closing, each with a live preview.
   The global editors set every value; a section's or modal's editor leaves a value empty to follow the global one. */
const PREVIEW_STOPS=new Set();
function stopPreviews(){ PREVIEW_STOPS.forEach(f=>{ try { f(); } catch(e){ /* already gone */ } }); PREVIEW_STOPS.clear(); }
/** Runs start(box) while box is on screen, and stops it when it scrolls away or the studio tab changes. */
function whileVisible(box,start){
  let stop=null; const off=()=>{ if (stop){ stop(); PREVIEW_STOPS.delete(off); stop=null; } };
  const on=()=>{ off(); stop=start()||(()=>{}); PREVIEW_STOPS.add(off); };
  const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?on():off()),{threshold:.05}); io.observe(box);
  return { restart:()=>{ if (stop) on(); } };
}
const debounce=(fn,ms=160)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };
const ownOnly=o=>Object.fromEntries(Object.entries(o||{}).filter(([k,v])=>v!==""&&v!=null&&v!=="default"));
const fxName=v=>v==="none"?"None":(FX[v]||{}).label||v;
OPT.bgfx=FX_OPTIONS;
/** Background effect: type, colours and the controls that effect uses, with a live preview. */
function fxEditor(fx,{global=false,sec=null}={}){
  const D=Store.draft, T=D.theme, GF={...FX_DEFAULTS,...((T.sections||{}).bgfx||{})};
  const prev=h("div",{class:"fx-prev"},h("div",{class:"fx-prev-txt"},h("p",{class:"eyebrow",text:sec?plain(sec.eyebrow)||"Section":"Every section"}),h("strong",{text:sec?plain(sec.title)||"Section title":"Section title"}),h("span",{text:"Text stays readable over the effect."})));
  const eff=()=>global?{...FX_DEFAULTS,...fx}:{...GF,...ownOnly(fx)};
  const vis=whileVisible(prev,()=>fxPreview(prev,eff(),sec));
  const fields=h("div");
  const draw=()=>{ fields.textContent=""; const e=eff(), type=e.type, ctrl=(FX[type]||{}).ctrl||[], on=k=>ctrl.includes(k), G=global?"":"Global";
    const sel=(opts)=>global?opts:[["","Global"],...opts.filter(o=>o[0]!=="")];
    const amount=(k,label,min,max,step)=>global?[k,"range",label,{min,max,step}]:[k,"number",label+" (empty follows global)",{optional:true,min,step,placeholder:String(GF[k])}];
    const list=[["type","select","Background effect",{options:global?FX_OPTIONS:[["default","Use global ("+fxName(GF.type||"none")+")"],...FX_OPTIONS]}]];
    if (type&&type!=="none"){
      list.push(["color","color","Effect colour",{optional:true,placeholder:global?"Accent":G,globalLabel:global?"Use accent":"Use global",fallback:()=>hexOk(GF.color)?GF.color:T.accent}]);
      if (on("palette")) list.push(["palette","select","Colours",{options:sel(OPT.fxPalettes)}]);
      if (on("color2")&&e.palette==="two") list.push(["color2","color","Second colour",{optional:true,placeholder:global?"Dorma blue":G,globalLabel:global?"Use Dorma blue":"Use global",fallback:()=>hexOk(GF.color2)?GF.color2:"#0072bc"}]);
      list.push(amount("opacity","Strength",0,1,.05),amount("speed","Speed (1 = normal)",.2,3,.1));
      if (on("density")) list.push(amount("density","Amount (how many shapes)",.3,2.5,.1));
      if (on("size")) list.push(amount("size","Size",.4,2.5,.1));
      if (on("dir")) list.push(["dir","select","Direction",{options:sel(OPT.fxDirs)}]);
      if (on("pos")) list.push(["pos","select","Where it gathers",{options:sel(OPT.fxPos)}]);
      if (on("pointer")) list.push(global?["pointer","toggle","Reacts to the mouse"]:["pointer","select","Reacts to the mouse",{options:[["","Global"],[true,"Yes"],[false,"No"]]}]);
      list.push(["soften","select","Veil behind the text",{options:sel(OPT.fxSoften)}]);
    }
    fields.append(fieldsFor(fx,list,(v,k)=>{ if (k==="type"||k==="palette") draw(); restart(); }));
  };
  const restart=debounce(()=>vis.restart());
  draw();
  return h("div",{class:"fx-edit"},prev,fields);
}
/** A sample picture from the library for the previews. */
function samplePicture(D){ const m=(D.media||[]).find(x=>x&&x.kind==="image")||(D.media||[]).find(x=>x&&x.kind!=="article"); return mediaBox(D,m&&m.id,{ratio:1.6,res:640}); }
/** Pictures: reveal mask, direction, length, cover colour, kept shape and hover. */
function imageFxEditor(o,{global=false}={}){
  const D=Store.draft, G={reveal:"none",dir:"left",duration:1.2,color:"",shape:"none",hover:"none",...(D.motion.imageFx||{})};
  const sel=(opts,k)=>global?opts:[["","Global ("+(((opts.find(x=>x[0]===G[k])||[])[1])||G[k])+")"],...opts];
  const box=h("div",{class:"img-prev"}), pic=samplePicture(D); box.append(pic);
  const eff=()=>global?{...G,...o}:{...G,...ownOnly(o)};
  const play=()=>previewImage(pic,eff());
  const fields=h("div");
  const draw=()=>{ fields.textContent=""; const e=eff(), cover=["blinds","shutters","tiles","curtain","cmyk"].includes(e.reveal), dirs=["wipe","diagonal","cmyk"].includes(e.reveal);
    const list=[["reveal","select","Reveal as it scrolls in",{options:sel(OPT.imageReveal,"reveal")}]];
    if (dirs) list.push(["dir","select","Opens from",{options:global?OPT.dirs4:[["","Global"],...OPT.dirs4]}]);
    if (e.reveal&&e.reveal!=="none") list.push(global?["duration","range","Length (s)",{min:.3,max:3,step:.1}]:["duration","number","Length in seconds (empty follows global)",{optional:true,min:.2,step:.1,placeholder:String(G.duration)}]);
    if (cover) list.push(["color","color","Cover colour",{optional:true,placeholder:global?"Page background":"Global",globalLabel:global?"Use page background":"Use global",fallback:()=>D.theme.ink}]);
    list.push(["shape","select","Shape (mask kept on the picture)",{options:sel(OPT.imageShape,"shape")}],["hover","select","When the pointer is over it",{options:sel(OPT.imageHover,"hover")}]);
    fields.append(fieldsFor(o,list,(v,k)=>{ if (k==="reveal") draw(); play(); })); };
  draw(); setTimeout(play,300);
  return h("div",{class:"fx-edit"},h("div",{class:"img-prev-wrap"},box,h("button",{class:"btn sm",type:"button",html:IC.replay+"Replay",onclick:play})),fields);
}
/** Section entrance (once, as it scrolls in) and exit (follows the scroll as it leaves). */
function sectionAnimEditor(o,{global=false}={}){
  const D=Store.draft, G={in:"none",out:"none",duration:1,...(D.motion.sectionFx||{})};
  const lab=(opts,v)=>(opts.find(x=>x[0]===v)||[])[1]||v;
  const mock=h("div",{class:"sec-mock"},h("i",{class:"l1"}),h("i",{class:"l2"}),h("i",{class:"l3"}),h("i",{class:"l4"}));
  const stage=h("div",{class:"sec-stage"},mock);
  const eff=()=>global?{...G,...o}:{...G,...ownOnly(o)};
  const play=()=>previewSection(mock,eff());
  const list=[["in","select","Entrance",{options:global?OPT.sectionIn:[["","Global ("+lab(OPT.sectionIn,G.in)+")"],...OPT.sectionIn]}],
    ["out","select","Exit (as it scrolls away)",{options:global?OPT.sectionOut:[["","Global ("+lab(OPT.sectionOut,G.out)+")"],...OPT.sectionOut]}],
    global?["duration","range","Entrance length (s)",{min:.3,max:2.5,step:.1}]:["duration","number","Entrance length in seconds (empty follows global)",{optional:true,min:.2,step:.1,placeholder:String(G.duration)}]];
  return h("div",{class:"fx-edit"},h("div",{class:"img-prev-wrap"},stage,h("button",{class:"btn sm",type:"button",html:IC.replay+"Replay entrance",onclick:play})),
    fieldsFor(o,list,(v,k)=>{ if (k!=="out") play(); }),h("p",{class:"hint",style:"margin:0",text:"The exit shows on the site as you scroll past the section. Sections on the first screen don't use the entrance, so the page is complete when it opens."}));
}
/** Modal opening and closing with a replay on a small sample panel. */
function modalAnimEditor(o,{global=false}={}){
  const D=Store.draft, M=D.motion, lab=(opts,v)=>(opts.find(x=>x[0]===v)||[])[1]||v;
  const keyOpen=global?"modalOpen":"open", keyClose=global?"modalClose":"close";
  const mini=h("div",{class:"md-mini"},h("span",{class:"scan"}),...["a","b","c","d"].map(c=>h("span",{class:"corner "+c})),h("b",{text:"Modal"}),h("p",{text:"Opening and closing"}));
  const stage=h("div",{class:"md-stage"},mini);
  const play=()=>previewModal(D,stage,(global?o[keyOpen]:o[keyOpen]||M.modalOpen)||"line",(global?o[keyClose]:o[keyClose]||M.modalClose)||"auto");
  const list=[[keyOpen,"select","Opening",{options:global?OPT.modalOpen:[["","Global ("+lab(OPT.modalOpen,M.modalOpen||"line")+")"],...OPT.modalOpen]}],
    [keyClose,"select","Closing",{options:global?OPT.modalClose:[["","Global ("+lab(OPT.modalClose,M.modalClose||"auto")+")"],...OPT.modalClose]}]];
  return h("div",{class:"fx-edit"},h("div",{class:"img-prev-wrap"},stage,h("button",{class:"btn sm",type:"button",html:IC.replay+"Replay",onclick:play})),fieldsFor(o,list,()=>play()));
}
/* ================= GLOBAL STYLE =================
   One layer for the look of the whole site: text and accent colours, header colours, the image filter, and the defaults
   every flow and carousel slide follows. Flows, carousels, slides and pages can switch to "Custom" where they are edited.
   The whole layer can be saved as a named style and applied again later. */
const goStyle=text=>h("div",{class:"go-style"},h("p",{class:"adm-intro",style:"margin:0",text}),h("button",{class:"btn sm",type:"button",html:IC.theme+"Open Global style",onclick:()=>openPanel("style")}));
/** "Use global" / "Custom" switch. The flag lives in holder.custom[key], or in holder[key][flag] when flag is given. */
function globalOrCustom(holder,key,{what="settings",flag=null,body,onChange=()=>{}}){
  const get=()=>flag?!!(holder[key]&&holder[key][flag]):!!(holder.custom&&holder.custom[key]);
  const put=v=>{ if (flag){ if (!holder[key]||typeof holder[key]!=="object") holder[key]={}; holder[key][flag]=v; } else { if (!holder.custom||typeof holder.custom!=="object") holder.custom={}; holder.custom[key]=v; } };
  const wrap=h("div",{class:"goc"});
  const draw=()=>{ wrap.textContent=""; const on=get(), opt=(v,l)=>h("button",{type:"button",role:"radio","aria-checked":String(on===v),class:on===v?"on":"",text:l,onclick:()=>{ if (on===v) return; put(v); onChange(); touch({theme:true}); draw(); }});
    wrap.append(h("div",{class:"seg",role:"radiogroup","aria-label":what},opt(false,"Use global"),opt(true,"Custom")));
    if (on) wrap.append(...[].concat(body()));
    else wrap.append(h("p",{class:"hint",style:"margin:0"},`Follows the ${what}. `,h("button",{type:"button",class:"linkish",text:"Edit the global style",onclick:()=>openPanel("style")})));
  };
  draw(); return wrap;
}
const ANIM_FIELDS=[["mode","select","Animate",{options:[["group","The whole flow at once"],["items","Each item in turn"]]}],["preset","select","Animation",{options:OPT.presets}],["duration","range","Duration (s)",{min:.1,max:3,step:.05}],["stagger","range","Gap between items (s)",{min:0,max:.6,step:.01}],["delay","range","Start delay (s)",{min:0,max:3,step:.05}]];
const flowAnimFields=(anim,onChange)=>fieldsFor(anim,ANIM_FIELDS,onChange);
/** Flow colours. Global flow colours fall back to the site colours; a flow's own fall back to the global ones. */
function flowColorFields(c,onChange,{global=false}={}){
  const T=Store.draft.theme, g=global?{}:(T.flow||{}), ph=global?"Site":"Global";
  const fb=(k,site)=>()=>hexOk(g[k])?g[k]:site();
  return fieldsFor(c,[["text","color","Item text",{optional:true,placeholder:ph,globalLabel:global?"Use site":"Use global",fallback:fb("text",()=>T.fg)}],
    ["accent","color","Accent (active item and glow)",{optional:true,placeholder:ph,globalLabel:global?"Use site":"Use global",fallback:fb("accent",()=>T.accent)}],
    ["sep","color","Separators (the small dots)",{optional:true,placeholder:ph,globalLabel:global?"Use site":"Use global",fallback:fb("sep",()=>hexOk(c.text)?c.text:T.fg)}]],onChange);
}
/** Header colours. On a page, every value is optional and an empty one follows the global header. */
function headerFields(hd,{optional=false}={}){
  const T=Store.draft.theme, G=T.header||{}, ph=optional?"Global":"Site", gl=optional?"Use global":"Use site";
  const fb=(k,site)=>()=>optional&&hexOk(G[k])?G[k]:site();
  const f=[["bg","color","Background",{optional,placeholder:ph,globalLabel:gl,fallback:fb("bg",()=>T.ink)}],
    optional?["bgAlpha","number","Background strength (0 to 1, empty follows global)",{min:0,step:.05,optional:true,placeholder:String(G.bgAlpha??0)}]:["bgAlpha","range","Background strength (0 = see-through)",{min:0,max:1,step:.05,theme:true}],
    ["text","color","Logo and text",{optional:true,placeholder:ph,globalLabel:gl,fallback:fb("text",()=>T.fg)}],
    ["link","color","Menu links",{optional:true,placeholder:ph,globalLabel:gl,fallback:fb("link",()=>T.fg)}],
    ["accent","color","Current page underline",{optional:true,placeholder:ph,globalLabel:gl,fallback:fb("accent",()=>T.accent)}]];
  return fieldsFor(hd,f,()=>touch({theme:true}));
}
/** A carousel's or slide's own colours and image filter (holder[key] = {custom, title, text, accent, headerText, overlay, intensity, shade}). */
function lookEditor(obj,key,opts={},onChange=()=>{}){
  const slide=opts.level==="slide";
  return globalOrCustom(obj,key,{flag:"custom",what:slide?"carousel's colours, then the global slide style":"global slide style",onChange:()=>onChange(obj[key],key),body:()=>{
    const L=obj[key], T=Store.draft.theme, S=T.slide||{}, ph="Global";
    const fb=(k,site)=>()=>hexOk(S[k])?S[k]:site();
    const colours=fieldsFor(L,[["title","color","Title",{optional:true,placeholder:ph,fallback:fb("title",()=>hexOk(T.heading)?T.heading:T.fg)}],["text","color","Paragraph and eyebrow",{optional:true,placeholder:ph,fallback:fb("text",()=>T.fg)}],
      ["accent","color","Accent (flow and glow)",{optional:true,placeholder:ph,fallback:fb("accent",()=>T.accent)}],["headerText","color","Header text while this shows",{optional:true,placeholder:ph,fallback:fb("headerText",()=>(T.header&&T.header.text)||T.fg)}],
      ["intensity","number","Colour filter strength (0 to 1.5, empty follows global)",{min:0,step:.05,optional:true,placeholder:String(T.overlayIntensity??1)}],
      ["shade","number","Dark shade (0 to 1.4, empty follows global)",{min:0,step:.05,optional:true,placeholder:String(T.overlay??1)}]],onChange);
    return [colours,h("p",{class:"hint",style:"margin:4px 0 0",text:"Image filter for this "+(slide?"slide":"carousel")+". Pick a preset or your own colours; \"Use the carousel filter\" follows "+(slide?"the carousel, then ":"")+"the filter for every carousel."}),
      overlayEditor(L,"overlay",{allowDefault:true,onChange,defaultLabel:"Use the carousel filter",defaultHint:"Follows "+(slide?"this carousel's filter when it has one, then ":"")+"the filter for every carousel (Global style or the top of Carousels)."})];
  }});
}
function styleCounts(D){
  const flows=(D.flows||[]).filter(f=>f.custom&&(f.custom.anim||f.custom.colors)).length;
  let slides=0; (D.pages||[]).forEach(p=>(p.sections||[]).forEach(s=>{ if (s.type!=="heroCarousel") return; if (s.look&&s.look.custom) slides++; (s.slides||[]).forEach(x=>{ if (x&&x.look&&x.look.custom) slides++; }); }));
  return {flows,slides};
}
function stylePreview(D){
  const box=h("div",{class:"style-prev"});
  const draw=()=>{ box.textContent=""; const T=D.theme, S=T.slide||{};
    const id=(()=>{ for (const p of D.pages) for (const s of p.sections||[]) for (const x of [...(s.slides||[]),s]) { const m=x&&x.media&&D.media.find(y=>y.id===x.media); if (m&&m.kind!=="article") return m.id; } return (D.media.find(m=>m.kind!=="article")||{}).id; })();
    const bg=h("div",{class:"sp-bg"}); const n=id?mediaNode(D,id,{w:960,hh:540}):null; if (n) bg.append(n); const so=S.overlay&&S.overlay.mode&&S.overlay.mode!=="default"?S.overlay:null, ov=id?(so?(so.mode==="none"?null:overlayEl(D,id,so)):overlayEl(D,id)):null; if (ov) bg.append(ov); bg.append(h("div",{class:"shade-hero"}));
    const nav=h("nav",{class:"site-nav"},h("a",{href:"#",onclick:e=>e.preventDefault(),"aria-current":"page",text:"Home"}),h("a",{href:"#",onclick:e=>e.preventDefault(),text:"Agency"}),h("a",{href:"#",onclick:e=>e.preventDefault(),text:"Contact"}));
    const head=h("header",{class:"site-head"},h("div",{class:"wrap"},h("span",{class:"brand"},h("span",{class:"mark"}),plain(D.site.brand)||"Dorma"),nav));
    const content=h("div",{class:"sp-content"},h("p",{class:"eyebrow sp-eb",text:"Global style"}),h("h3",{class:"display",style:"font-size:clamp(1.8rem,3.4vw,2.8rem)",text:"Every slide, one look"}),h("p",{class:"lede",text:"Paragraph text in the slide colour. Change anything on the left and it shows here."}));
    const fl=renderFlow(D,(D.flows.find(f=>!(f.custom&&f.custom.colors))||D.flows[0]||{}).id); if (fl){ fl.setActive(0,{fill:true}); content.append(fl.el); }
    const hc=h("div",{class:"sp-hc"},bg,head,content);
    const st=hc.style; if (hexOk(S.title)) st.setProperty("--heading",S.title); if (hexOk(S.text)) st.setProperty("--slide-text",S.text);
    if (hexOk(S.accent)){ st.setProperty("--accent",S.accent); }
    box.append(hc,h("span",{class:"lbl-a",text:"Live preview"})); };
  draw(); return {el:box,draw};
}
/** The image filter for every carousel (the home carousel and any other). Slides and carousels set to Custom can use their own. */
function carouselFilterFields(){
  const T=Store.draft.theme; T.slide=T.slide&&typeof T.slide==="object"?T.slide:{};
  if (!T.slide.overlay||typeof T.slide.overlay!=="object") T.slide.overlay={mode:"default"};
  const box=h("div",{class:"ov-carousel"});
  box.append(overlayEditor(T.slide,"overlay",{allowDefault:true,preview:true,defaultLabel:"Same as every image",
      defaultHint:"Carousel pictures use the global image filter (Global style › Image filter), or a picture's own filter from the Library. Pick a preset to give every carousel its own look."}),
    fieldsFor(T.slide,[["intensity","number","Filter strength on carousel slides (0 to 1.5, empty follows every image)",{min:0,step:.05,optional:true,placeholder:String(T.overlayIntensity??1)}]],()=>touch({theme:true})));
  return box;
}
function countOwn(D){ let sections=0, fx=0; const all=[...D.pages.flatMap(p=>p.sections||[]),...D.modals.flatMap(m=>m.sections||[])];
  all.forEach(x=>{ if (x&&x.style&&x.style.custom) sections++; if (x&&x.bgfx&&x.bgfx.type&&x.bgfx.type!=="default") fx++; }); return {sections,fx}; }
function panelStyle(body){
  const D=Store.draft, T=D.theme, M=D.motion;
  T.sections={pad:1,width:1320,bg:"",bgAlpha:0,titleSize:1,subSize:1,...(T.sections||{})}; T.sections.bgfx={...FX_DEFAULTS,...(T.sections.bgfx||{})};
  M.imageFx={reveal:"none",dir:"left",duration:1.2,color:"",shape:"none",hover:"none",...(M.imageFx||{})}; M.sectionFx={in:"none",out:"none",duration:1,...(M.sectionFx||{})}; if (!M.modalClose) M.modalClose="auto";
  D.colorMode={default:"auto",toggle:true,...(D.colorMode||{})}; T.menu={mode:"auto",linkStyle:"underline",hover:"fade",upper:false,size:1,gap:30,open:"fade",items:"rise",align:"start",itemSize:1,numbers:false,bg:"",bgAlpha:.96,blur:12,fx:"none",logoBottom:true,logo:"",note:"",...(T.menu||{})}; T.light={ink:"#f4f6fb",panel:"#ffffff",fg:"#0b1630",heading:"",accent:"#0072bc",...(T.light||{})};
  T.modals={width:980,bg:"",bgAlpha:.88,corners:true,scan:true,blur:4,dim:.3,titleSize:1,...(T.modals||{})};
  T.header={bg:"#040915",bgAlpha:0,text:"",link:"",accent:"",...(T.header||{})}; T.flow={...(T.flow||{})}; T.slide={...(T.slide||{})};
  M.flow={mode:"items",preset:"rise",duration:.8,stagger:.06,delay:0,...(M.flow||{})}; M.slideTiming={...(M.slideTiming||{})}; D.styles=Array.isArray(D.styles)?D.styles:[];
  const pv=stylePreview(D); Admin.refresh=pv.draw;
  const cnt=styleCounts(D);
  /* saved styles */
  const list=h("div",{class:"styles-list"});
  const drawList=()=>{ list.textContent="";
    if (!D.styles.length) list.append(h("p",{class:"hint",style:"margin:0",text:"No saved styles yet."}));
    D.styles.forEach((st,i)=>{ const t=st.theme||{}, chips=[t.ink,t.panel,t.accent,t.fg,t.heading,(t.header||{}).bg,(t.imageOverlay||{}).c1].filter(hexOk);
      const nm=h("input",{type:"text",value:st.name||"","aria-label":"Style name"}); nm.addEventListener("input",()=>{ st.name=nm.value; scheduleSave(); });
      const row=h("div",{class:"style-row"},h("span",{class:"chips","aria-hidden":"true"},...chips.map(c=>h("i",{style:"background:"+c}))),nm,
        h("small",{class:"mono",text:st.savedAt?fmtDate(st.savedAt.slice(0,10)):"Starter"}),
        h("button",{class:"btn sm primary",type:"button",text:"Apply",onclick:e=>confirmInline(row,"Apply \""+(st.name||"this style")+"\"? It replaces the global style. Flows and slides set to Custom keep their own look.",()=>{ applyStyle(D,st); touch({theme:true}); openPanel("style"); toast("Style applied. Publish to show it to visitors."); },"Apply")}),
        h("button",{class:"btn sm",type:"button",text:"Update",title:"Save the current global style into this one",onclick:()=>confirmInline(row,"Overwrite \""+(st.name||"this style")+"\" with the current global style?",()=>{ Object.assign(st,snapshotStyle(D,st.name),{id:st.id}); scheduleSave(); drawList(); toast("Style updated."); },"Overwrite")}),
        h("button",{class:"x",type:"button","aria-label":"Delete style "+(st.name||""),title:"Delete",html:IC.x,onclick:()=>confirmInline(row,"Delete this saved style?",()=>{ D.styles.splice(i,1); scheduleSave(); drawList(); },"Delete")}));
      list.append(row); }); };
  drawList();
  const nmNew=h("input",{type:"text",placeholder:"Style name, e.g. Dorma night","aria-label":"Name for the new style",style:"max-width:260px"});
  const saveRow=h("div",{class:"style-save",style:"display:flex;gap:8px;flex-wrap:wrap"},nmNew,h("button",{class:"btn sm",type:"button",html:IC.plus+"Save current style",onclick:()=>{
    D.styles.push(snapshotStyle(D,nmNew.value.trim()||"My style "+(D.styles.length+1))); nmNew.value=""; scheduleSave(); drawList(); toast("Style saved."); }}));
  /* slide timing as a timing field over motion.slideTiming */
  const timingF=F(M,"slideTiming","timing","Timing for every slide",{parts:[["eyebrow",.05],["title",0],["text",.5],["flow",1.5],["stagger",.2]],hint:"Seconds from when each slide starts. A carousel or a slide can override any of these where you edit it."});
  const resetBtn=(label,opts)=>h("button",{class:"btn sm",type:"button",text:label,onclick:e=>confirmInline(e.currentTarget,"Switch them all to Use global? Their custom values are kept, so you can switch one back.",()=>{ const n=resetOverrides(D,opts); touch({theme:true}); openPanel("style"); toast(n?n+" switched to the global style.":"Everything already follows the global style."); },"Switch")});
  body.append(
    h("p",{class:"adm-intro",text:"One place for the look of the whole site. Every flow, carousel, slide and page header follows these settings unless it is set to Custom where you edit it. Save the whole set as a style to switch back to it later."}),
    card("Preview",pv.el),
    card("Saved styles",h("p",{class:"adm-intro",style:"margin:0",text:"A style keeps every setting on this page plus the fonts, background colours and animation. Applying one never changes items set to Custom."}),list,saveRow),
    card("Text and accent",fieldsFor(T,[["fg","color","Text"],["heading","color","Headings and titles",{optional:true,placeholder:"Text",globalLabel:"Same as text",fallback:()=>T.fg}],["accent","color","Accent (buttons, glow, highlights)"],["mutedOpacity","range","Secondary text strength",{min:.3,max:1,step:.01,theme:true}]])),
    card("Header",h("p",{class:"adm-intro",style:"margin:0",text:"The bar with the logo and menu. Each page can use its own colours (Pages → Header on this page), and each carousel slide can change the header text while it shows."}),headerFields(T.header)),
    card("Menu",h("p",{class:"adm-intro",style:"margin:0",text:"The menu links in the header and the full-screen menu that opens from the menu button (on phones, or on every screen). The logo and a short line can sit at the bottom of the full-screen menu."}),
      h("p",{class:"hint",style:"margin:0",text:"Header links"}),
      fieldsFor(T.menu,[["mode","select","Menu",{options:OPT.menuModes}],["linkStyle","select","Current page mark",{options:OPT.menuLinkStyles}],["hover","select","Hover",{options:OPT.menuHover}],["upper","toggle","Capital letters"],["size","range","Link size",{min:.7,max:1.6,step:.05}],["gap","range","Space between links (px)",{min:8,max:64,step:1}]]),
      h("p",{class:"hint",style:"margin:0",text:"Full-screen menu"}),
      fieldsFor(T.menu,[["open","select","Opening",{options:OPT.menuOpen}],["items","select","Links arrive",{options:OPT.menuItems}],["align","select","Align",{options:[["start","Start"],["center","Centre"]]}],["itemSize","range","Link size",{min:.6,max:1.8,step:.05}],["numbers","toggle","Numbers before links"],
        ["bg","color","Background",{optional:true,placeholder:"Page",globalLabel:"Use page background",fallback:()=>T.ink}],["bgAlpha","range","Background strength",{min:0,max:1,step:.02}],["blur","range","Blur behind (px)",{min:0,max:30,step:1}],
        ["fx","select","Animated background",{options:FX_OPTIONS}],["logoBottom","toggle","Logo at the bottom"],["logo","media","Logo at the bottom (None uses the header logo)",{allowNone:true}],["note","text","Line at the bottom (e.g. phone or tagline)"]]),
      h("p",{class:"hint",style:"margin:0",text:"Preview draft and press the menu button to see it (make the window narrow, or choose Menu button on every screen)."})),
    card("Image filter",h("p",{class:"adm-intro",style:"margin:0",text:"A colour or gradient over every image and video. Any Library item, carousel or slide can turn it off or use its own."}),
      overlayEditor(T,"imageOverlay",{preview:true}),
      fieldsFor(T,[["overlayIntensity","range","Filter strength on every image (0 = off)",{min:0,max:1.5,step:.05,theme:true}],["overlay","range","Dark shade on heroes",{min:0,max:1.4,step:.01,theme:true}],["imageBrightness","range","Image brightness",{min:.3,max:1.1,step:.01,theme:true}],["grain","toggle","Film grain on heroes",{theme:true}]])),
    card("Every flow",h("p",{class:"adm-intro",style:"margin:0",text:cnt.flows?`${cnt.flows} of ${D.flows.length} flows use their own colours or animation (set under Flows).`:`All ${D.flows.length} flows follow these settings.`}),
      h("p",{class:"hint",style:"margin:0",text:"Colours"}),flowColorFields(T.flow,()=>touch({theme:true}),{global:true}),
      h("p",{class:"hint",style:"margin:0",text:"Animation and timing"}),flowAnimFields(M.flow),
      cnt.flows?resetBtn("Make every flow use the global style",{flows:true,slides:false}):null),
    card("Every carousel and slide",h("p",{class:"adm-intro",style:"margin:0",text:cnt.slides?`${cnt.slides} carousels or slides use their own colours (set under Carousels).`:"All carousels and slides follow these settings."}),
      fieldsFor(M,[["transition","select","Slide transition",{options:OPT.transition}],["slideDuration","number","Seconds per slide (any length)",{min:1,step:.5}],["kenBurns","toggle","Slow cinematic zoom"],["kbZoom","range","Zoom amount",{min:1,max:1.4,step:.01}],["kbDuration","range","Zoom duration (s)",{min:4,max:24,step:1}]]),
      timingF,
      h("p",{class:"hint",style:"margin:0",text:"Carousel image filter (the home carousel and any other)"}),carouselFilterFields(),
      h("p",{class:"hint",style:"margin:0",text:"Slide colours"}),
      fieldsFor(T.slide,[["title","color","Title",{optional:true,placeholder:"Site",globalLabel:"Use site",fallback:()=>hexOk(T.heading)?T.heading:T.fg}],["text","color","Paragraph and eyebrow",{optional:true,placeholder:"Site",globalLabel:"Use site",fallback:()=>T.fg}],
        ["accent","color","Accent (flow and glow)",{optional:true,placeholder:"Site",globalLabel:"Use site",fallback:()=>T.accent}],["headerText","color","Header text over slides",{optional:true,placeholder:"Header",globalLabel:"Use header",fallback:()=>hexOk(T.header.text)?T.header.text:T.fg}]],()=>touch({theme:true})),
      cnt.slides?resetBtn("Make every carousel and slide use the global style",{flows:false,slides:true}):null),
    card("Every section",h("p",{class:"adm-intro",style:"margin:0",text:`Spacing, width, background, title sizes and the background effect for every section. ${countOwn(D).sections} sections use their own look (Pages → section → More options → Look), ${countOwn(D).fx} their own background effect.`}),
      fieldsFor(T.sections,[["pad","select","Spacing above and below",{options:OPT.pads,theme:true}],["width","number","Content width in px",{min:640,step:20,theme:true}],["bg","color","Background colour",{optional:true,placeholder:"None",globalLabel:"None",fallback:()=>T.ink}],["bgAlpha","range","Background strength",{min:0,max:1,step:.05,theme:true}]]),
      h("p",{class:"hint",style:"margin:0"},"Title, subtitle and body sizes and fonts for the whole site are under ",h("button",{type:"button",class:"linkish",text:"Colours and type → Type",onclick:()=>openPanel("theme")}),"."),
      h("p",{class:"hint",style:"margin:0",text:"Background effect for every section that has none of its own"}),
      fxEditor(T.sections.bgfx,{global:true})),
    card("Section entrance and exit",h("p",{class:"adm-intro",style:"margin:0",text:"How every section arrives as it scrolls into view and how it leaves. A section can use its own (Pages → section → More options → Animation)."}),
      sectionAnimEditor(M.sectionFx,{global:true})),
    card("Pictures: masks, reveals and hover",h("p",{class:"adm-intro",style:"margin:0",text:"Every picture in sections and modals (not the full-screen hero backgrounds). Reveal plays once as the picture scrolls in; the shape stays on as a mask. A section can use its own."}),
      imageFxEditor(M.imageFx,{global:true})),
    card("Every modal",h("p",{class:"adm-intro",style:"margin:0",text:"Width, panel colour, title size, corner marks and the blur behind every modal. Each modal can use its own (Modals → Look)."}),
      fieldsFor(T.modals,[["width","number","Width in px",{min:420,step:20,theme:true}],["bg","color","Panel colour",{optional:true,placeholder:"Panels",globalLabel:"Use panels",fallback:()=>T.panel}],["bgAlpha","range","Panel strength",{min:0,max:1,step:.02,theme:true}],
        ["titleSize","range","Title size",{min:.5,max:1.6,step:.05,theme:true}],["blur","range","Blur behind (px)",{min:0,max:16,step:1}],["dim","range","Page brightness behind",{min:0,max:1,step:.05}],["corners","toggle","Corner marks"],["scan","toggle","Scan lines"]]),
      h("p",{class:"hint",style:"margin:0",text:"Opening and closing for every modal (each modal can use its own under Modals → Animation)"}),
      modalAnimEditor(M,{global:true})),
    card("Light and dark mode",h("p",{class:"adm-intro",style:"margin:0",text:"The colours above are the dark mode. Visitors can switch with the sun and moon button in the header, and their choice is remembered. Heroes and carousels stay dark in light mode because their text sits on pictures."}),
      fieldsFor(D.colorMode,[["default","select","Visitors start in",{options:OPT.colorModes}],["toggle","toggle","Show the switch in the header"]]),
      h("p",{class:"hint",style:"margin:0",text:"Light mode colours"}),
      fieldsFor(T.light,[["ink","color","Page background"],["panel","color","Panels and modals"],["fg","color","Text"],["heading","color","Headings",{optional:true,placeholder:"Text",globalLabel:"Same as text",fallback:()=>T.light.fg}],["accent","color","Accent (buttons, glow, highlights)"]]),
      h("p",{class:"hint",style:"margin:0"},"The header logo on light pages is set under ",h("button",{type:"button",class:"linkish",text:"Site and titles",onclick:()=>openPanel("site")}),". ",
        h("button",{type:"button",class:"linkish",text:"Preview the site in light mode",onclick:()=>{ try { localStorage.setItem("dorma.siteMode","light"); } catch(e){ /* storage blocked */ } previewDraft(); }}),"."))
  );
}
function panelIcons(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"Icons can be used in flows, buttons and text items. Paste any SVG code; scripts, links and styles are stripped automatically. Icons draw with the current text colour."}),h("div",{class:"imp-links"},importLink("icons","Import icons from a file")));
  const grid=h("div",{class:"lib-grid",style:"grid-template-columns:repeat(auto-fill,minmax(110px,1fr))"}), det=h("div");
  const draw=()=>{ grid.textContent=""; if (!D.icons.some(i=>i.id===Admin.sel.icons)) Admin.sel.icons=D.icons[0]?.id;
    D.icons.forEach(ic=>grid.append(h("button",{class:"icon-tile"+(ic.id===Admin.sel.icons?" on":""),type:"button",onclick:()=>{ Admin.sel.icons=ic.id; draw(); },html:sanitizeSvg(ic.svg)+`<span>${esc(ic.label)}</span>`})));
    grid.append(h("button",{class:"icon-tile",type:"button",html:IC.plus.replace("16 16","16 16")+"<span>New icon</span>",onclick:()=>{ const n={id:uid("i"),label:"New icon",svg:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>'}; D.icons.push(n); Admin.sel.icons=n.id; touch(); draw(); }}));
    det.textContent=""; const ic=D.icons.find(x=>x.id===Admin.sel.icons); if (!ic) return;
    const pv=h("div",{class:"preview-box",style:"gap:28px;justify-content:center"}); const redraw=()=>{ pv.textContent=""; const clean=sanitizeSvg(ic.svg);
      pv.append(clean?h("span",{class:"fi k-icon",html:`<span class="ic">${clean}</span>`}):h("span",{class:"mono",style:"color:var(--bad)",text:"This SVG couldn't be read"}), h("span",{class:"fi has-ic",html:`<span class="ic">${clean}</span>${esc(ic.label)}`})); };
    det.append(card("Edit icon",pv,fieldsFor(ic,[["label","text","Name"],["svg","code","SVG code",{wide:true,hint:"Use a viewBox and stroke or fill shapes. Colour comes from the theme."}]],()=>{ redraw(); draw2(); }),
      h("div",{},h("button",{class:"btn danger sm",type:"button",text:"Delete icon",onclick:e=>confirmInline(e.currentTarget,"Delete this icon?",()=>{ D.icons.splice(D.icons.indexOf(ic),1); touch(); draw(); })}))));
    redraw();
  };
  const draw2=()=>{ const on=grid.querySelector(".icon-tile.on"), ic=D.icons.find(x=>x.id===Admin.sel.icons); if (on&&ic) on.innerHTML=sanitizeSvg(ic.svg)+`<span>${esc(ic.label)}</span>`; };
  body.append(grid,det); draw();
}
function flowItemSchema(it){
  const s=[["kind","select","Type",{options:OPT.kinds}],["label","text",it.kind==="icon"||it.kind==="svg"?"Label (screen readers and hover)":it.kind==="note"?"Words written by hand (e.g. analysing, challenge accepted)":"Label"]];
  if (it.kind==="button") s.push(["showIndex","toggle","Show number"]);
  if (it.kind==="note") s.push(["dots","toggle","Animated dots after the words (analysing…)"]);
  if (it.kind==="svg") s.push(["svg","code","SVG code",{wide:true}]);
  else s.push(["icon","icon",it.kind==="icon"?"Icon":it.kind==="note"?"Icon (draws itself; empty uses a pen)":"Icon before the text (optional)",{wide:true}]);
  s.push(["action","action","On click (in Tabs and Reveal flows, the panel's button runs this)",{wide:true}],["detail","area","Panel text (Tabs and Reveal flows, timelines and Type 3 modals)",{wide:true}],
    ["ctaLabel","text","Panel button label (when the item has an action; empty shows Explore)"],["media","media","Panel image (Tabs and Reveal flows, optional)",{wide:true,allowNone:true}]);
  return s;
}
function panelFlows(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"A flow is a row of items separated by small marks. Draw it from buttons, plain text, icons or your own SVG, then choose how it animates: as one piece or item by item, with optional settings per item. Any page section or Type 3 modal can use a flow."}),h("div",{class:"imp-links"},importLink("flows","Import flows from a file")));
  masterDetail(body,{items:()=>D.flows,selKey:"flows",label:f=>f.name||f.id,kind:f=>f.items.length+" items",addLabel:"New flow",
    onAdd:()=>makeFlow(D),
    detail:(f,redrawList)=>{
      const prev=h("div",{class:"preview-box fb-prev"}); const drawPrev=()=>{ prev.textContent=""; const show=f.display==="tabs"||f.display==="reveal";
        const fl=show?flowBlock(D,f.id,{onAction:()=>toast("In the site this runs the item's action.")}):renderFlow(D,f.id,{onItem:(i)=>fl.setActive(i,{fill:true})});
        if (fl){ if (!show) fl.setActive(0,{fill:true}); prev.append(fl.el); fl.play(0); } prev.append(h("span",{class:"lbl-a",text:"Preview · click items"})); };
      Admin.refresh=drawPrev; drawPrev();
      const items=h("div",{class:"sub-list"});
      const drawItems=()=>{ items.textContent="";
        f.items.forEach((it,i)=>{
          const c=subCard(it,{title:()=>it.label||"Untitled",kind:(OPT.kinds.find(k=>k[0]===it.kind)||[])[1],open:false,
            body:()=>{ const w=h("div",{style:"display:flex;flex-direction:column;gap:14px;padding-top:10px"});
              const drawBody=()=>{ w.textContent=""; w.append(fieldsFor(it,flowItemSchema(it),(v,k)=>{ if (k==="kind"){ drawBody(); $(".k",c).textContent=(OPT.kinds.find(x=>x[0]===it.kind)||[])[1]; } }));
                const own=h("div",{class:"fields"}); const tog={on:!!it.anim};
                own.append(F(tog,"on","toggle","Animate this item on its own",{},v=>{ it.anim=v?{preset:"pop",duration:.8,delay:0}:null; drawBody(); }));
                if (it.anim) own.append(...fieldsFor(it.anim,[["preset","select","Animation",{options:OPT.presets}],["duration","range","Duration (s)",{min:.1,max:3,step:.05}],["delay","range","Extra delay (s)",{min:0,max:3,step:.05}]]).children);
                w.append(own); };
              drawBody(); return w; },
            onRemove:()=>{ f.items.splice(i,1); drawItems(); touch(); }});
          items.append(c);
        });
        const add=h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"}); OPT.kinds.forEach(([k,l])=>add.append(h("button",{class:"btn sm",type:"button",html:IC.plus+esc(l),onclick:()=>{
          f.items.push({id:uid("x"),kind:k,label:k==="icon"||k==="svg"?"Icon":k==="note"?"analysing":"New item",icon:k==="icon"?(D.icons[0]?.id||""):"",svg:k==="svg"?'<svg viewBox="0 0 24 24"><path d="M4 12h16M12 4v16"/></svg>':"",showIndex:k==="button",dots:k==="note",detail:"",action:A(),anim:null});
          drawItems(); items.children[items.children.length-2]?._open?.(); touch(); }})));
        items.append(add); sortable(items,f.items,()=>{ drawItems(); touch(); });
      };
      drawItems();
      return [
        card(h("span",{class:"grow"},"Preview"),prev,h("button",{class:"btn sm",type:"button",style:"align-self:flex-start",html:IC.replay+"Replay animation",onclick:drawPrev})),
        card("Flow settings",fieldsFor(f,[["name","text","Name"],["display","select","How the items behave",{options:OPT.flowDisplays,hint:"Row: each item runs its own action. Tabs: items switch the visible panel. Reveal: each item reveals its own part of the section. A section can override this where the flow is used."}],["separator","select","Separator",{options:OPT.separators}],["size","select","Size",{options:OPT.sizes}]],(v,k)=>{ redrawList(); if (k==="display") drawPrev(); })),
        card("Animation and timing",globalOrCustom(f,"anim",{what:"global flow animation (Design → Global style)",onChange:drawPrev,body:()=>[flowAnimFields(f.anim=f.anim||{...D.motion.flow})]}),
          h("p",{class:"adm-intro",style:"font-size:.8rem",text:"Items with their own animation keep their settings in either mode when animating item by item."})),
        card("Colours",globalOrCustom(f,"colors",{what:"global flow colours (Design → Global style)",onChange:drawPrev,body:()=>[flowColorFields(f.colors=f.colors||{},drawPrev)]})),
        card("Items · drag to reorder",items),
        h("div",{},h("button",{class:"btn danger sm",type:"button",text:"Delete flow",onclick:e=>confirmInline(e.currentTarget,"Delete this flow? Sections using it will show no flow.",()=>{ D.flows.splice(D.flows.indexOf(f),1); touch(); openPanel("flows"); })}))
      ];
    }});
}
function panelModals(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"Type 1 shows one image or video with a caption. Type 2 shows a gallery of three. Type 3 adds a flow whose items reveal detail text. Type 4 lists services, each with a short brief and a link to its page. Every type has a More button. Open a modal from any flow item, card or button with the action \"Open modal\"."}),h("div",{class:"imp-links"},importLink("modals","Import modals from a file")));
  masterDetail(body,{items:()=>D.modals,selKey:"modals",label:m=>m.name||m.title,kind:m=>"Type "+m.type,addLabel:"New modal",
    onAdd:()=>makeModal(D,1),
    detail:(m,redrawList)=>{
      const mediaBoxEl=h("div");
      const drawMedia=()=>{ mediaBoxEl.textContent=""; const n=m.type===2?3:1; m.media=m.media||[]; while (m.media.length<n) m.media.push(D.media[m.media.length%D.media.length]?.id||"");
        const f=h("div",{class:"fields"}); for (let k=0;k<n;k++) f.append(F(m.media,k,"media",n>1?"Gallery item "+(k+1):"Image or video",{wide:true})); mediaBoxEl.append(f); };
      drawMedia();
      const base=[["name","text","Name in the studio"],["type","select","Type",{options:OPT.modalTypes}],["kicker","text","Small label"],["title","text","Title",{wide:true}],["text","area","Short paragraph",{wide:true}],["caption","strings",m.type===2?"Captions, one per gallery item":"Caption items, one per line (shown with the flow separators)",{wide:true}]];
      if (m.type===3) base.push(["flowId","flow","Flow inside the modal"]);
      if (m.type===4) base.push(["services","list","Services (each with a short brief and a link)",{ title:"title", hideable:true, fields:[["title","text","Title"],["anchor","text","Label (buttons can open this modal at this service; empty uses the title)"],["text","area","Brief",{wide:true}],["link","button","Link (e.g. go to the service page)"]], blank:()=>({title:"New service",text:"",link:{label:"Learn more",action:A()}}) }]);
      if (m.type===5){ const i=base.findIndex(x=>x[0]==="caption"); if (i>=0) base.splice(i,1); }
      base.push(["timing","timing","Timing",{parts:m.type===3?[["eyebrow",.75],["title",.81],["text",.87],["flow",1],["detail",.93],["media",.99],["more",1.05]]:[["eyebrow",.75],["title",.81],["text",.87],["media",.93],["more",.99]],hint:"Seconds from when the modal starts opening. Empty uses the default shown. Lower numbers come first."}]);
      if (m.type===5) m.sections=Array.isArray(m.sections)?m.sections:[];
      const lookFields=()=>[fieldsFor(m.look,[["width","number","Width in px (empty follows global)",{optional:true,min:420,step:20,placeholder:String((D.theme.modals||{}).width??980)}],["bg","color","Panel colour",{optional:true,placeholder:"Global"}],["bgAlpha","range","Panel strength",{min:0,max:1,step:.02}],
        ["titleSize","number","Title size (1 = normal, empty follows global)",{optional:true,min:.4,step:.05}],["blur","number","Blur behind the modal in px (empty follows global)",{optional:true,min:0,step:1}],["dim","number","Page brightness behind (0 to 1, empty follows global)",{optional:true,min:0,step:.05}],
        ["corners","select","Corner marks",{options:[["","Global"],[true,"Show"],[false,"Hide"]]}],["scan","select","Scan lines",{options:[["","Global"],[true,"Show"],[false,"Hide"]]}]])];
      return [
        card(h("span",{class:"grow"},"Content"),h("button",{class:"btn sm",type:"button",html:IC.eye+"Preview modal",onclick:()=>openModal(D,m.id)}),fieldsFor(m,base,(v,k)=>{ if (k==="type"){ openPanel("modals"); } else redrawList(); })),
        m.type===5?card(h("span",{class:"grow"},"Sections inside this modal · drag to reorder"),h("p",{class:"adm-intro",style:"margin:0",text:"Any page section can go in a modal. Give a section a label (More options) and any button can open this modal straight at it."}),sectionsEditor(m.sections,{inModal:true})):card("Media",mediaBoxEl),
        card("Look",globalOrCustom(m,"look",{flag:"custom",what:"global modal look (Design → Global style → Every modal)",body:lookFields})),
        card("Animation",h("p",{class:"adm-intro",style:"margin:0",text:"How this modal opens and closes. Global follows Design → Global style → Every modal."}),modalAnimEditor(m.anim=m.anim&&typeof m.anim==="object"?m.anim:{open:"",close:""})),
        card("More button",h("div",{class:"fields"},F(m,"more","button","More button"))),
        h("div",{},h("button",{class:"btn danger sm",type:"button",text:"Delete modal",onclick:e=>confirmInline(e.currentTarget,"Delete this modal?",()=>{ D.modals.splice(D.modals.indexOf(m),1); touch(); openPanel("modals"); })}))
      ];
    }});
}
const secTitle=s=>plain(s.title)||plain(s.eyebrow)||(s.slides&&s.slides[0]&&plain(s.slides[0].title))||(SECTION_TYPES[s.type]||{}).label||"Section";
/* ---------- importing content from Markdown files ----------
   Every content type has a template in public/templates/. Pick or paste a file, check the preview, then import.
   The preview runs the import on a copy of the draft, so it shows exactly what will change. */
const TPL=f=>`${import.meta.env.BASE_URL}templates/${f}`;
const IMP={ type:"slides" };
const impType=k=>IMPORTERS.find(t=>t.key===k)||IMPORTERS[0];
const IMP_GO={ slides:"carousels", pages:"pages", posts:"blog", flows:"flows", modals:"modals", library:"media", colours:"theme", icons:"icons" };
/** A small button that opens Import with this content type picked. */
const importLink=(type,label="Import from a file")=>h("button",{class:"btn sm",type:"button",html:IC.upload+esc(label),title:"Import from a Markdown file, with a preview first",onclick:()=>{ IMP.type=type; if (type==="pages"&&Admin.sel.pages) IMP.page=Admin.sel.pages; openPanel("import"); }});
const knownPaths=()=>libIndex?new Set(libIndex.files.map(f=>f.path)):null; // null: the file list couldn't be read, so every path is accepted
/** The import box. fixed: {carousel} locks it to one carousel's slides (used under Carousels). */
function importBox(type,{fixed=null,done=null}={}){
  const D=Store.draft, t=impType(type), box=h("div",{class:"imp-box"});
  const file=h("input",{type:"file",accept:".md,.markdown,.txt,text/markdown,text/plain",class:"imp-file","aria-label":"Markdown file"});
  const paste=h("textarea",{rows:8,class:"imp-paste",placeholder:"Or paste the Markdown here","aria-label":"Paste Markdown",spellcheck:"false"});
  const prev=h("div",{class:"imp-prev"}), result=h("div",{class:"imp-result"});
  const mode=h("select",{"aria-label":"How to import",class:"imp-mode"}); t.modes.forEach(([v,l])=>mode.append(h("option",{value:v,text:l})));
  const go=h("button",{class:"btn primary sm",type:"button",disabled:true,html:IC.up+"<span>Import</span>"});
  /* where it goes: a carousel for slides, a page for loose sections */
  let target=null;
  if (t.needs==="carousel" && !fixed){ const cars=D.pages.flatMap(p=>(p.sections||[]).filter(s=>s.type==="heroCarousel").map(s=>[s.id,(plain(p.title)||p.id)+" · "+secTitle(s)]));
    target=h("select",{"aria-label":"Carousel",class:"imp-mode"}); cars.forEach(([v,l])=>target.append(h("option",{value:v,text:"Add to: "+l}))); if (IMP.carousel&&cars.some(c=>c[0]===IMP.carousel)) target.value=IMP.carousel; }
  if (t.needs==="page"){ target=h("select",{"aria-label":"Page for loose sections",class:"imp-mode"}); D.pages.forEach(p=>target.append(h("option",{value:p.id,text:"Loose sections go to: "+(plain(p.title)||p.id)})));
    target.value=IMP.page&&D.pages.some(p=>p.id===IMP.page)?IMP.page:(Admin.sel.pages||D.site.homePage); }
  const opts=()=>({ mode:mode.value, knownPaths:knownPaths(), targetCarousel:fixed?fixed.carousel:(target&&t.needs==="carousel"?target.value:null), targetPage:target&&t.needs==="page"?target.value:null });
  const run=(cfg,text)=>t.key==="icons"?buildIcons(cfg,text,opts(),sanitizeSvg):t.build(cfg,text,opts());
  let last=null;
  const show=()=>{ const text=paste.value; prev.textContent=""; result.textContent="";
    if (!text.trim()){ go.disabled=true; go.lastChild.textContent="Import"; return; }
    const copy=clone(D), r=run(copy,text); last=r;
    r.warnings.forEach(w=>prev.append(h("p",{class:"imp-warn",text:w})));
    r.records.forEach(x=>{
      let thumb=null;
      if (x.swatches) thumb=h("div",{class:"imp-thumb imp-sw"},...x.swatches.slice(0,6).map(c=>h("i",{style:"background:"+c})));
      else if (x.svg) thumb=h("div",{class:"imp-thumb imp-svg",html:sanitizeSvg(x.svg)});
      else if (x.image!==undefined){ const n=x.image?mediaNode(copy,x.image,{w:240,hh:180}):null; thumb=h("div",{class:"imp-thumb"},n||h("span",{text:x.image?"New":"None"})); }
      prev.append(h("div",{class:"imp-row"+(x.sub?" sub":"")+(thumb?"":" no-thumb")},thumb,h("div",{class:"imp-txt"},
        h("small",{class:"mono",text:x.meta||""}),h("b",{text:x.title}),x.text?h("span",{class:"sub",text:String(x.text).slice(0,220)}):null,
        x.chips&&x.chips.length?h("div",{class:"imp-flow"},...x.chips.slice(0,12).map(c=>h("span",{class:"chip b",text:String(c)}))):null,
        ...(x.warnings||[]).map(w=>h("span",{class:"imp-warn",text:w})))));
    });
    const ok=r.records.length&&r.summary;
    go.disabled=!ok; go.lastChild.textContent=ok?"Import: "+r.summary:"Import";
    if (ok) prev.prepend(h("p",{class:"imp-sum",text:"Preview: "+r.summary+". Nothing changes until you press Import."})); };
  file.addEventListener("change",async()=>{ const f=file.files&&file.files[0]; if (!f) return; if (f.size>2e6){ prev.textContent="That file is too large. Split it into smaller files."; return; } paste.value=await f.text(); show(); });
  let tm=0; paste.addEventListener("input",()=>{ clearTimeout(tm); tm=setTimeout(show,250); });
  mode.addEventListener("change",show); if (target) target.addEventListener("change",()=>{ if (t.needs==="carousel") IMP.carousel=target.value; else IMP.page=target.value; show(); });
  go.addEventListener("click",()=>{ if (!last||!last.records.length) return;
    const doIt=()=>{ const before=new Set(D.pages.map(p=>p.id)), r=run(D,paste.value); touch({theme:t.key==="colours"}); const newPage=D.pages.find(p=>!before.has(p.id));
      toast("Imported: "+(r.summary||"nothing")+".");
      if (done) { done(); return; }
      paste.value=""; file.value=""; prev.textContent=""; go.disabled=true; go.lastChild.textContent="Import";
      result.textContent=""; result.append(h("p",{class:"imp-sum",text:"Imported: "+r.summary+". It is in the draft; publish when you're happy with it."}),
        h("button",{class:"btn sm",type:"button",text:"Open "+((PANELS.find(p=>p[0]===IMP_GO[t.key])||[])[1]||"it"),onclick:()=>{ if (t.key==="pages"){ const pg=newPage?newPage.id:opts().targetPage; if (pg) Admin.sel.pages=pg; } openPanel(IMP_GO[t.key]); }})); };
    if (mode.value==="replace"||(t.key==="pages"&&mode.value==="update")) confirmInline(go,mode.value==="replace"?"Replace all slides in this carousel?":"Replace the sections of pages with the same address?",doIt,"Replace"); else doIt(); });
  box.append(h("div",{class:"imp-head"},h("p",{class:"adm-intro",style:"margin:0",text:t.about}),h("a",{class:"btn sm",href:TPL(t.file),download:t.file,html:IC.down+"Download template"})),
    h("div",{class:"imp-in"},file,paste),prev,h("div",{class:"imp-go"},target,mode,go),result);
  if (!libIndex) syncLibrary(true).then(()=>{ if (paste.value.trim()) show(); });
  return box;
}
function panelImport(body){
  body.append(h("p",{class:"adm-intro",text:"Write content in a Markdown file, from a template, and bring it in all at once. Download a template, fill it in with any text editor, then pick the file here. You see everything before anything changes, and the import only changes the draft: publish when you're happy."}));
  const grid=h("div",{class:"tpl-grid"}), slot=h("div");
  const draw=()=>{ grid.textContent="";
    IMPORTERS.forEach(t=>grid.append(h("div",{class:"tpl"+(t.key===IMP.type?" on":"")},
      h("button",{type:"button",class:"tpl-pick","aria-pressed":String(t.key===IMP.type),onclick:()=>{ IMP.type=t.key; draw(); }},h("b",{text:t.label}),h("span",{text:t.about})),
      h("a",{class:"tpl-dl",href:TPL(t.file),download:t.file,title:"Download "+t.file,"aria-label":"Download the "+t.label+" template",html:IC.down+"<span>"+esc(t.file)+"</span>"}))));
    slot.textContent=""; slot.append(card(h("span",{class:"grow"},"Import "+impType(IMP.type).label.toLowerCase()),importBox(IMP.type))); };
  body.append(card("Templates",h("p",{class:"adm-intro",style:"margin:0",text:"Pick what to import, or download its template. Each template explains every line and shows a filled-in example; keep the notes at the top, they are skipped."}),grid),slot);
  draw();
}
/* Carousels: every hero carousel on every page, with its slides, in one place. */
function panelCarousels(body){
  const D=Store.draft, M=D.motion;
  const all=()=>D.pages.flatMap(p=>p.sections.filter(s=>s.type==="heroCarousel").map(s=>({id:s.id,s,p})));
  body.append(h("p",{class:"adm-intro",text:"Settings for every carousel, then each carousel and its slides. A slide can stay up as long as you like, like a page: set its seconds on screen to any number, or turn on \"Stay on this slide\"."}),
    goStyle("Transition, seconds per slide, zoom, the default slide timing and slide colours for every carousel are in Global style. Each carousel and slide below can follow them or use its own."));
  body.append(card(h("span",{class:"grow"},"Image filter for every carousel"),h("p",{class:"adm-intro",style:"margin:0",text:"A colour or gradient over the pictures of the home carousel and any other carousel. To give one slide its own filter, open the slide below, set \"This slide's colours and filter\" to Custom and pick a preset."}),carouselFilterFields()));
  if (!all().length){ body.append(h("p",{class:"adm-intro",text:"No carousels yet. Add a Hero carousel section to a page under Pages."})); return; }
  // Timing boxes show the global slide timing in grey, so an empty box says what it will use.
  const G=M.slideTiming||{}, withGlobal=f=>f[1]!=="timing"?f:[f[0],f[1],f[2],{...f[3],parts:f[3].parts.map(([k,d])=>[k,k==="duration"?(+M.slideDuration||7):(G[k]??d)])}];
  const T=SECTION_TYPES.heroCarousel, setF=T.fields.filter(f=>f[0]!=="slides").map(withGlobal), sf=T.fields.find(f=>f[0]==="slides"), slidesF=[sf[0],sf[1],sf[2],{...sf[3],fields:sf[3].fields.map(withGlobal)}];
  masterDetail(body,{items:all,selKey:"carousels",label:x=>secTitle(x.s),kind:x=>(plain(x.p.title)||x.p.id)+(x.s.hidden?" · hidden":""),
    detail:({s,p},redraw)=>{
      if (s.autoplay===undefined) s.autoplay=true;
      return [
        card(h("span",{class:"grow"},"Carousel on "+(plain(p.title)||p.id)),h("button",{class:"btn sm",type:"button",html:IC.eye+"Preview page",onclick:()=>{ Admin.sel.pages=p.id; Site.preview=true; if (location.hash.slice(1)===p.id) route(); else location.hash=p.id; }}),
          F(s,"hidden","toggle","Hide this carousel from visitors",{},()=>redraw()),fieldsFor(s,setF,()=>redraw())),
        card("Slides · drag to reorder or duplicate",F(s,"slides",slidesF[1],slidesF[2],slidesF[3],()=>redraw())),
        card(h("span",{class:"grow"},"Import slides from Markdown"),importBox("slides",{fixed:{carousel:s.id},done:()=>openPanel("carousels")}))
      ];
    }});
}
function panelPages(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"Each page is a stack of sections. Pick a layout, add sections and drag them into order. Preview draft shows the page you have selected."}),h("div",{class:"imp-links"},importLink("pages","Import pages and sections from a file")));
  masterDetail(body,{items:()=>D.pages,selKey:"pages",label:p=>plain(p.title)||p.id,kind:p=>{ const hid=(p.sections||[]).filter(s=>s.hidden).length; return (p.id===D.site.homePage?"Home":(OPT.layouts.find(l=>l[0]===p.layout)||[])[1])+(hid?" · "+hid+" hidden":""); },addLabel:"New page",
    onAdd:()=>makePage(D,"blank"),
    detail:(p,redrawList)=>{
      const slug=h("input",{type:"text",value:p.id,id:uid("f")}), slugHint=h("span",{class:"hint",text:"Used in the address after #. Lowercase letters, numbers and hyphens."});
      slug.addEventListener("change",()=>{ const v=slug.value.trim(); if (!idOk(v,D.pages,p)){ slugHint.textContent="That address is taken or not allowed."; slugHint.style.color="var(--bad)"; slug.value=p.id; return; }
        const old=p.id; p.id=v; if (D.site.homePage===old) D.site.homePage=v;
        const fix=a=>{ if (a&&a.type==="page"&&a.target===old) a.target=v; }; JSON.stringify(D,(k,val)=>{ if (val&&typeof val==="object"&&val.type==="page") fix(val); return val; });
        Admin.sel.pages=v; slugHint.style.color=""; slugHint.textContent="Address updated."; touch(); redrawList(); });
      const meta=fieldsFor(p,[["title","text","Title"],["layout","select","Layout",{options:OPT.layouts}],["nav","toggle","Show in menu"]],()=>redrawList());
      meta.prepend(h("div",{class:"field"},h("label",{for:slug.id,text:"Address"}),slug,slugHint));
      const sx=sectionsEditor(p.sections,{onVis:()=>redrawList()}), visBar=sx.visBar, secs=sx.el;
      return [
        card(h("span",{class:"grow"},"Page"),h("button",{class:"btn sm",type:"button",html:IC.eye+"Preview page",onclick:previewDraft}),meta),
        card("Header on this page",globalOrCustom(p,"header",{what:"global header colours",flag:"custom",body:()=>[headerFields(p.header,{optional:true})]})),
        card(h("span",{class:"grow"},"Sections · drag to reorder, hide or duplicate"),importLink("pages","Import sections"),visBar,secs),
        p.id===D.site.homePage?h("p",{class:"adm-intro",text:"This is the home page, so it can't be deleted. Pick another home page under Site and titles first."}):
          h("div",{},h("button",{class:"btn danger sm",type:"button",text:"Delete page",onclick:e=>confirmInline(e.currentTarget,"Delete this page?",()=>{ D.pages.splice(D.pages.indexOf(p),1); touch(); openPanel("pages"); })}))
      ];
    }});
}

/* ================= LIBRARY =================
   Three sources share one list (Store.draft.media):
   - files committed to public/library/<category>/ on GitHub (item.path), found through library/index.json
   - quick uploads to Supabase Storage (item.url)
   - generated scenes and articles written in the studio */
const LIB={ cat:"", kind:"", q:"", hidden:false, use:"" };
const NEWCAT={ id:"" }; // category for new uploads, articles and scenes, chosen in the Library
let libIndex=null;
const prettyName=p=>p.split("/").pop().replace(/\.[^.]+$/,"").replace(/[-_]+/g," ").replace(/\s+/g," ").trim().replace(/^./,c=>c.toUpperCase());
const slugify=s=>String(plain(s)||"").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60);
const ghUpload=cat=>`${REPO_URL}/upload/${REPO_BRANCH}/public/library/${encodeURIComponent(cat)}`;
const ghNewFolder=cat=>`${REPO_URL}/new/${REPO_BRANCH}/public/library/${encodeURIComponent(cat)}?filename=.gitkeep`;
const ghFile=path=>`${REPO_URL}/blob/${REPO_BRANCH}/public/library/${path.split("/").map(encodeURIComponent).join("/")}`;
const libMissing=m=>!!(m.path&&libIndex&&!libIndex.files.some(f=>f.path===m.path));

/* Adds files and folders found on GitHub that the library doesn't know yet. Returns how many were added. */
async function syncLibrary(quiet){
  const D=Store.draft;
  try { const r=await fetch(LIBRARY_BASE+"index.json",{cache:"no-store"}); if (!r.ok) throw new Error(String(r.status)); libIndex=await r.json(); }
  catch(e){ if (!quiet) toast("Couldn't read the library list from the site."); return 0; }
  let files=0;
  (libIndex.folders||[]).forEach(f=>{ if (/^[a-z0-9][a-z0-9-]{0,40}$/.test(f) && !D.categories.some(c=>c.id===f)) D.categories.push({id:f,label:prettyName(f)}); });
  (libIndex.files||[]).forEach(f=>{ if (!libPathOk(f.path) || D.media.some(m=>m.path===f.path)) return;
    D.media.push({id:uid("m"),label:prettyName(f.path),kind:f.kind,path:f.path,category:ensureCategory(D,f.category||defaultCategory({kind:f.kind})),tags:[],alt:"",summary:"",link:"",cover:""}); files++; });
  if (files){ scheduleSave(); toast(files===1?"1 new file from GitHub added to the library":files+" new files from GitHub added to the library"); }
  else if (!quiet) toast("The library is up to date with GitHub.");
  return files;
}
function libFilter(list,{kinds,cat,q,hidden}){
  const qq=(q||"").trim().toLowerCase();
  return list.filter(m=>(!kinds||kinds.includes(m.kind))&&(!cat||m.category===cat)&&(hidden||!m.hidden)
    &&(!qq||[m.label,m.alt,m.summary,m.path,...(m.tags||[])].join(" ").toLowerCase().includes(qq)));
}
function categorySelect(value,onChange,{allLabel="All categories",style="",required=false,placeholder="Choose a category…"}={}){
  const s=h("select",{"aria-label":"Category",style});
  if (!required) s.append(h("option",{value:"",text:allLabel}));
  else if (!value) s.append(h("option",{value:"",text:placeholder,disabled:true,selected:true}));
  Store.draft.categories.forEach(c=>{ const o=h("option",{value:c.id,text:plain(c.label)}); if (c.id===value) o.selected=true; s.append(o); });
  s.addEventListener("change",()=>onChange(s.value)); return s;
}
const DOC_ICON='<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/></svg>';
function docThumb(m){ const D=Store.draft; if (m.cover){ const n=mediaNode(D,m.cover,{w:240,hh:180}); if (n) return n; } return h("span",{class:"doc-thumb",html:DOC_ICON}); }

function panelMedia(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"Every image, video, background and article in one place, sorted into categories. Anything here can be picked wherever the studio asks for an image, and articles can be opened from any button."}));
  /* Every new item needs a category: uploads, articles and scenes go into the one chosen here (the GitHub folder decides for GitHub files). */
  const newCat=h("span",{class:"cat-new"});
  const drawNewCat=()=>{ newCat.textContent=""; const sel=categorySelect(NEWCAT.id,v=>{ NEWCAT.id=v; },{required:true}); sel.setAttribute("aria-label","Category for new items"); newCat.append(h("span",{class:"mono",text:"New items go into"}),sel); };
  const needCat=()=>{ if (NEWCAT.id && D.categories.some(c=>c.id===NEWCAT.id)) return NEWCAT.id; toast("Choose a category for the new item first."); const s=$("select",newCat); if (s){ s.focus(); s.classList.add("need"); setTimeout(()=>s.classList.toggle("need",false),1600); } return ""; };
  const up=h("input",{type:"file",accept:"image/*,video/mp4,video/webm",multiple:true,hidden:true});
  up.addEventListener("change",async()=>{ const cat=needCat(); if (!cat){ up.value=""; return; } for (const f of up.files){ try { toast("Uploading "+f.name); const r=await assetsApi.upload(f); const m={id:uid("m"),label:prettyName(f.name),kind:f.type.startsWith("video")?"video":"image",assetId:r.id,url:r.url,category:cat,tags:[],alt:""}; D.media.push(m); Admin.sel.media=m.id; touch(); draw(); toast("Uploaded "+f.name); } catch(e){ toast("Upload failed: "+(e&&e.message||"try a smaller file")); } } up.value=""; });
  const bar=h("div",{style:"display:flex;gap:10px;flex-wrap:wrap;align-items:center"},
    h("button",{class:"btn primary",type:"button",html:IC.up+"Check GitHub for new files",onclick:async()=>{ await syncLibrary(false); touch(); draw(); }}),
    assetsApi?h("button",{class:"btn",type:"button",html:IC.up+"Quick upload (Supabase)",title:"Stored in Supabase Storage instead of GitHub",onclick:()=>{ if (needCat()) up.click(); }}):null,
    h("button",{class:"btn",type:"button",html:IC.plus+"Add article",onclick:()=>{ const cat=needCat(); if (!cat) return; const m={id:uid("m"),label:"New article",kind:"article",category:cat,tags:[],summary:"",link:"",cover:""}; D.media.push(m); Admin.sel.media=m.id; LIB.kind=""; touch(); draw(); }}),
    importLink("library","Import names and tags from a file"),h("button",{class:"btn",type:"button",html:IC.plus+"Add generated scene",onclick:()=>{ const cat=needCat(); if (!cat) return; const m={id:uid("m"),label:"New scene",kind:"scene",scene:"nebula",fx:.5,fy:.5,zoom:1,category:cat,tags:[]}; D.media.push(m); Admin.sel.media=m.id; touch(); draw(); }}),up,newCat);
  const kinds=h("div",{class:"lib-kinds",role:"group","aria-label":"Type"});
  const search=h("input",{type:"search",placeholder:"Search titles, tags, files","aria-label":"Search the library",value:LIB.q});
  search.addEventListener("input",()=>{ LIB.q=search.value; drawGrid(); });
  const hiddenT=h("label",{class:"toggle"},h("input",{type:"checkbox",checked:LIB.hidden,onchange:e=>{ LIB.hidden=e.target.checked; drawGrid(); }}),"Show hidden");
  const useSel=h("select",{"aria-label":"Used on the site"},...[["","Used or not"],["unused","Not used yet"],["used","Already used"]].map(([v,l])=>h("option",{value:v,text:l,selected:LIB.use===v})));
  useSel.addEventListener("change",()=>{ LIB.use=useSel.value; drawGrid(); });
  const filters=h("div",{class:"lib-filters"},kinds,h("span",{class:"cat-slot"}),useSel,search,hiddenT);
  const grid=h("div",{class:"lib-grid"}), det=h("div"), countEl=h("p",{class:"mono"});
  const drawFilters=()=>{ kinds.textContent=""; OPT.libKinds.forEach(([v,l])=>kinds.append(h("button",{type:"button",class:"chip"+(LIB.kind===v?" on":""),text:l,onclick:()=>{ LIB.kind=v; drawFilters(); drawGrid(); }})));
    $(".cat-slot",filters).replaceWith(Object.assign(categorySelect(LIB.cat,v=>{ LIB.cat=v; drawGrid(); }),{className:"cat-slot"})); };
  let usage=mediaUsage(D);
  const drawGrid=()=>{ grid.textContent=""; usage=mediaUsage(D);
    const list=libFilter(D.media,{kinds:LIB.kind?[LIB.kind]:null,cat:LIB.cat,q:LIB.q,hidden:LIB.hidden}).filter(m=>!LIB.use||(LIB.use==="used")===usage.has(m.id));
    const free=D.media.filter(m=>m.kind!=="article"&&!m.hidden&&!usage.has(m.id)).length;
    countEl.textContent=list.length+" of "+D.media.length+" items · "+free+" pictures not used on the site yet";
    if (!list.length) grid.append(h("p",{class:"adm-intro",text:"Nothing matches. Add files on GitHub (below), or change the filters."}));
    list.forEach(m=>grid.append(h("button",{class:"lib-card"+(m.id===Admin.sel.media?" on":"")+(m.hidden?" is-hidden":""),type:"button",onclick:()=>{ Admin.sel.media=m.id; drawGrid(); drawDetail(); det.scrollIntoView({behavior:"smooth",block:"nearest"}); }},
      h("div",{class:"thumb"},m.kind==="article"?docThumb(m):mediaThumb(m.id),m.kind==="article"?null:overlayEl(D,m.id)),
      h("div",{class:"meta"},h("span",{text:m.label}),h("small",{text:[{scene:"Scene",image:"Image",video:"Video",article:"Article"}[m.kind]||m.kind,categoryLabel(D,m.category)||"No category",m.path?"GitHub":m.url?"Supabase":""].filter(Boolean).join(" · ")+(libMissing(m)?" · file missing":"")+(m.kind==="article"?"":usage.has(m.id)?" · used"+(usage.get(m.id).length>1?" ×"+usage.get(m.id).length:""):" · not used yet")})))));
  };
  const drawDetail=()=>{ det.textContent=""; const m=D.media.find(x=>x.id===Admin.sel.media); if (!m) return;
    const pv=h("div",{class:"ph",style:"aspect-ratio:16/9;max-width:560px"}); const redraw=()=>{ pv.textContent=""; const n=m.kind==="article"?docThumb(m):mediaNode(D,m.id,{w:960,hh:540}); if (n) pv.append(n); const ov=m.kind==="article"?null:overlayEl(D,m.id); if (ov) pv.append(ov); };
    const common=[["label","text",m.kind==="article"?"Title":"Name"],["category","category","Category (required)",{required:true}],["tags","strings","Tags (one per line)"]];
    let schema=common;
    if (m.kind==="scene") schema=common.concat([["scene","select","Scene",{options:OPT.scenes}],["fx","range","Focus left–right",{min:0,max:1,step:.01}],["fy","range","Focus top–bottom",{min:0,max:1,step:.01}],["zoom","range","Crop zoom",{min:1,max:3,step:.05}],["animate","toggle","Plays as a video (slow motion loop)"]]);
    else if (m.kind==="article") schema=common.concat([["summary","area","Summary",{wide:true}],["link","text","Link (https://…), if it lives on another site",{wide:true}],["cover","media","Cover image",{wide:true,allowNone:true}]]);
    else schema=common.concat([["alt","text","Description for screen readers",{wide:true}]]);
    const src=m.path?h("p",{class:"mono",style:"overflow-wrap:anywhere"},"GitHub: public/library/"+m.path+" · ",h("a",{href:ghFile(m.path),target:"_blank",rel:"noopener",text:"open on GitHub"}),libMissing(m)?h("b",{style:"color:var(--bad)",text:" · not found in the latest site build"}):null)
      :m.url?h("p",{class:"mono",text:"Stored in Supabase Storage"}):null;
    const del=m.path
      ?h("button",{class:"btn sm",type:"button",text:m.hidden?"Show in library again":"Hide from library",onclick:()=>{ m.hidden=!m.hidden; touch(); drawGrid(); drawDetail(); }})
      :h("button",{class:"btn danger sm",type:"button",text:"Delete",onclick:e=>confirmInline(e.currentTarget,"Remove this from the library? Places that use it will show nothing.",()=>{ D.media.splice(D.media.indexOf(m),1); touch(); drawGrid(); drawDetail(); })});
    det.append(card(h("span",{class:"grow"},"Edit "+({article:"article",scene:"scene",video:"video"}[m.kind]||"image")),pv,src,
      fieldsFor(m,schema,()=>{ redraw(); drawGrid(); }),
      h("p",{class:"hint",text:"Use it in a blog post by writing [["+m.id+"|caption]] on its own line."}),
      usage.has(m.id)?h("div",{class:"lib-used"},h("b",{text:"Used in "+usage.get(m.id).length+(usage.get(m.id).length===1?" place":" places")}),h("ul",{},...usage.get(m.id).map(w=>h("li",{text:w}))))
        :h("p",{class:"lib-used is-free",text:"Not used anywhere on the site yet. Image pickers show it first."}),
      h("div",{style:"display:flex;gap:10px;flex-wrap:wrap"},del)));
    if (m.kind!=="article") det.append(card("Colour overlay",h("p",{class:"adm-intro",text:"Lay a colour or gradient over this "+(m.kind==="video"?"video":"image")+" wherever it appears. The preview above updates as you change it."}),
      overlayEditor(m,"overlay",{allowDefault:true,onChange:()=>{ redraw(); drawGrid(); }})));
    redraw();
  };
  const draw=()=>{ if (LIB.cat && !NEWCAT.id) NEWCAT.id=LIB.cat; drawNewCat(); drawFilters(); drawGrid(); drawDetail(); };
  body.append(bar,filters,countEl,grid,det,githubCard(),categoriesCard(()=>draw()));
  draw();
  syncLibrary(true).then(n=>{ if (n){ touch(); draw(); } });
}
/* ================= MISSING IMAGES =================
   One list of every place on the site whose picture still needs attention: nothing picked, a placeholder scene,
   an item removed from the library, or a GitHub file that isn't there. Each row is fixed right here with the
   same + picker (opening on the same category), or "Go there" opens the page, carousel, modal, flow or post. */
const MISS={ state:"", hidden:false };
const MISS_STATES=[["","Everything"],["empty","No image"],["placeholder","Placeholders"],["missing","Removed from library"],["file","File not on GitHub"]];
function missingSlots(){ return mediaSlots(Store.draft,{all:true}).map(x=>({...x,state:x.state==="empty"?"empty":mediaState(x.obj[x.key])})).filter(x=>x.state&&!(x.optional&&x.state==="empty")); }
function goToSlot(go){ if (go.sel) Admin.sel[go.panel]=go.sel; Admin.openSec=go.section||""; openPanel(go.panel); }
function panelMissing(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"Every place on the site where a picture is still missing or is a placeholder: pages, sections, carousel slides, modals, flows, blog posts and the logo. Press + on a row to choose from the library (it opens on the right category), or Go there to edit it in place."}));
  const chips=h("div",{class:"lib-kinds",role:"group","aria-label":"Show"}), sum=h("p",{class:"mono"}), list=h("div",{class:"miss-list"});
  const hid=h("label",{class:"toggle"},h("input",{type:"checkbox",checked:MISS.hidden,onchange:e=>{ MISS.hidden=e.target.checked; draw(); }}),"Include hidden sections, drafts and old pages");
  const draw=()=>{ const all=missingSlots(), shown=all.filter(x=>MISS.hidden||!x.hidden);
    chips.textContent=""; MISS_STATES.forEach(([v,l])=>{ const n=v?shown.filter(x=>x.state===v).length:shown.length; if (v&&!n&&MISS.state!==v) return;
      chips.append(h("button",{type:"button",class:"chip"+(MISS.state===v?" on":""),text:l+" ("+n+")",onclick:()=>{ MISS.state=v; draw(); }})); });
    const rows=shown.filter(x=>!MISS.state||x.state===MISS.state), off=all.length-shown.length;
    sum.textContent=rows.length?rows.length+" to complete"+(off&&!MISS.hidden?" · "+off+" more in hidden places":""):"";
    list.textContent="";
    if (!rows.length){ list.append(h("div",{class:"miss-done"},h("b",{text:"Nothing missing here."}),h("span",{text:off&&!MISS.hidden?" "+off+" more in hidden sections, drafts or old pages. Tick the box above to see them.":" Every picture on the site comes from the library."}))); return; }
    const groups=new Map(); rows.forEach(x=>{ const g=x.where[0]; if (!groups.has(g)) groups.set(g,[]); groups.get(g).push(x); });
    groups.forEach((items,g)=>{ const go=items[0].go;
      list.append(card(h("span",{class:"grow"},g+" · "+items.length),h("button",{class:"btn sm",type:"button",html:IC.eye+"Go there",onclick:()=>goToSlot({panel:go.panel,sel:go.sel})}),
        ...items.map(x=>{ const badge=h("span",{class:"miss-badge st-"+x.state,text:{empty:"No image",placeholder:"Placeholder",missing:"Removed",file:"File missing"}[x.state]});
          const row=h("div",{class:"miss-row"+(x.hidden?" is-hidden":"")},
            h("div",{class:"miss-where"},h("b",{text:x.where.slice(1).join(" › ")||g}),h("span",{},badge,x.hidden?h("span",{class:"mono",text:" · hidden from visitors"}):null),
              h("button",{class:"btn sm",type:"button",text:"Go there",onclick:()=>goToSlot(x.go)})),
            mediaPicker(x.obj,x.key,{allowNone:x.optional},()=>{ touch(); const st=mediaState(x.obj[x.key]); const ok=!st||(x.optional&&st==="empty");
              badge.className="miss-badge "+(ok?"st-ok":"st-"+st); badge.textContent=ok?"Done":{empty:"No image",placeholder:"Placeholder",missing:"Removed",file:"File missing"}[st]; row.classList.toggle("is-done",ok); updateTop(); }));
          return row; })));
    });
  };
  body.append(h("div",{class:"lib-filters"},chips,hid),sum,list);
  draw();
  if (!libIndex) syncLibrary(true).then(()=>{ if (Admin.panel==="missing") draw(); });
}

function githubCard(){
  const D=Store.draft, rows=h("div",{class:"gh-rows"});
  D.categories.forEach(c=>{ const has=!libIndex||libIndex.folders.includes(c.id);
    rows.append(h("div",{class:"gh-row"},h("span",{text:c.label}),h("code",{text:"public/library/"+c.id}),
      h("a",{class:"btn sm",href:has?ghUpload(c.id):ghNewFolder(c.id),target:"_blank",rel:"noopener",html:has?IC.up+"Upload files":IC.plus+"Create folder"}))); });
  return card("Add files on GitHub",
    h("p",{class:"adm-intro",text:"Pick a category, drop your files on the GitHub page that opens, and press Commit changes. The site redeploys in about two minutes; then press Check GitHub for new files (or reopen the studio) and they appear above with the right category."}),
    h("p",{class:"hint",text:"Images: jpg, png, webp, gif, avif, svg. Video: mp4 or webm. Articles: pdf. GitHub takes up to 25 MB per file, so compress videos first."}),rows);
}
function categoriesCard(onChange){
  const D=Store.draft, rows=h("div",{class:"fields"});
  const count=id=>D.media.filter(m=>m.category===id).length, posts=id=>D.posts.filter(p=>p.category===id).length;
  const draw=()=>{ rows.textContent="";
    D.categories.forEach(c=>{ const inp=F(c,"label","text","Name",{},()=>onChange()); inp.style.flex="1";
      const n=count(c.id), np=posts(c.id), row=h("div",{class:"field wide cat-row"},inp,h("code",{class:"mono",text:c.id}),h("span",{class:"mono",text:n+" item"+(n===1?"":"s")+(np?" · "+np+" post"+(np===1?"":"s"):"")}));
      const others=D.categories.filter(x=>x!==c);
      row.append(h("button",{class:"btn sm danger",type:"button",text:"Remove",onclick:e=>{
        if (!n && !np){ confirmInline(e.currentTarget,"Remove the category "+plain(c.label)+"?",()=>{ D.categories.splice(D.categories.indexOf(c),1); touch(); draw(); onChange(); }); return; }
        if (!others.length){ toast("Add another category first, so its items have somewhere to go."); return; }
        // In use: every item keeps a category, so its items move to another one first
        const to=h("select",{"aria-label":"Move to"}); others.forEach(x=>to.append(h("option",{value:x.id,text:plain(x.label)})));
        const box=h("div",{class:"confirm"},h("span",{text:"Move its "+(n?n+" library item"+(n===1?"":"s"):"")+(n&&np?" and ":"")+(np?np+" post"+(np===1?"":"s"):"")+" to"}),to,
          h("button",{class:"btn sm danger",type:"button",text:"Move and remove",onclick:()=>{ const t=to.value; if (!t) return;
            D.media.forEach(m=>{ if (m.category===c.id) m.category=t; }); D.posts.forEach(p=>{ if (p.category===c.id) p.category=t; });
            D.categories.splice(D.categories.indexOf(c),1); if (NEWCAT.id===c.id) NEWCAT.id=t; if (LIB.cat===c.id) LIB.cat=""; if (PICK.cat===c.id) PICK.cat="";
            touch(); draw(); onChange(); toast("Moved to "+categoryLabel(D,t)+" and removed "+plain(c.label)+"."); }}),
          h("button",{class:"btn sm",type:"button",text:"Keep",onclick:()=>box.replaceWith()}));
        row.after(box); }}));
      rows.append(row); });
    const name=h("input",{type:"text",placeholder:"New category name","aria-label":"New category name"});
    rows.append(h("div",{class:"field wide",style:"flex-direction:row;gap:10px"},name,h("button",{class:"btn sm",type:"button",html:IC.plus+"Add category",onclick:()=>{ const id=slugify(name.value); if (!id||D.categories.some(c=>c.id===id)){ toast("Pick a new, different name."); return; } D.categories.push({id,label:name.value.trim()}); NEWCAT.id=id; touch(); draw(); onChange(); toast("Added. Create its folder on GitHub from the list above."); }})));
  };
  draw();
  return card("Categories",h("p",{class:"adm-intro",text:"Every image, video and article belongs to one of these, and the image pickers open on the category of the picture you're replacing. Add or rename categories here (with Arabic when the site has it). Each one matches a folder on GitHub, shown in grey; renaming changes only the label. A category in use can be removed after moving its items to another."}),rows);
}

/* ================= BLOG ================= */
const todayIso=()=>new Date().toISOString().slice(0,10);
function panelBlog(body){
  const D=Store.draft;
  const onPage=D.pages.find(p=>p.sections.some(s=>s.type==="blog"));
  body.append(h("p",{class:"adm-intro",text:"Write posts here. Published posts appear on every page that has a Blog posts section"+(onPage?" (now: "+plain(onPage.title)+")":"; add one under Pages")+", newest first, each at its own address. Drafts are only visible in Preview draft."}),h("div",{class:"imp-links"},importLink("posts","Import posts from a file")));
  const sorted=()=>D.posts.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  masterDetail(body,{items:sorted,selKey:"blog",label:p=>p.title||"Untitled",kind:p=>(p.published?"":"Draft · ")+(fmtDate(p.date)||"No date"),addLabel:"New post",
    onAdd:()=>{ let n=1; while (D.posts.some(p=>p.slug==="new-post-"+n)) n++; const p={id:uid("p"),slug:"new-post-"+n,title:"New post",date:todayIso(),category:"",tags:[],author:D.site.brand||"",cover:"",excerpt:"",body:"",published:false}; D.posts.push(p); return p; },
    detail:(p,redrawList)=>{
      const slug=h("input",{type:"text",value:p.slug||"",id:uid("f")}), hint=h("span",{class:"hint",text:"The post's address: #post/"+(p.slug||"")});
      slug.addEventListener("change",()=>{ const v=slugify(slug.value); if (!v||D.posts.some(x=>x!==p&&x.slug===v)){ hint.textContent="That address is taken or empty."; hint.style.color="var(--bad)"; slug.value=p.slug; return; } p.slug=v; slug.value=v; hint.style.color=""; hint.textContent="The post's address: #post/"+v; touch(); });
      const meta=fieldsFor(p,[["title","text","Title",{wide:true}],["published","toggle","Published (visible to visitors)"],["date","date","Date"],["category","category","Category"],["author","text","Author"],["tags","strings","Tags (one per line)"],["excerpt","area","Short summary for the list",{wide:true}],["cover","media","Cover image",{wide:true,allowNone:true}]],
        (v,k)=>{ if (k==="title"&&/^new-post-\d+$/.test(p.slug||"")){ const s=slugify(p.title); if (s&&!D.posts.some(x=>x!==p&&x.slug===s)){ p.slug=s; slug.value=s; hint.textContent="The post's address: #post/"+s; } } redrawList(); });
      meta.prepend(h("div",{class:"field"},h("label",{for:slug.id,text:"Address"}),slug,hint));
      return [
        card(h("span",{class:"grow"},"Post"),h("button",{class:"btn sm",type:"button",html:IC.eye+"Preview post",onclick:()=>{ Site.preview=true; location.hash="post/"+encodeURIComponent(p.slug||p.id); }}),meta),
        card("Text",fieldsFor(p,[["body","prose","Body",{wide:true}]])),
        h("div",{},h("button",{class:"btn danger sm",type:"button",text:"Delete post",onclick:e=>confirmInline(e.currentTarget,"Delete this post? This can't be undone after publishing.",()=>{ D.posts.splice(D.posts.indexOf(p),1); touch(); openPanel("blog"); })}))
      ];
    }});
}
/* Large text editor with a formatting guide and an "insert from library" helper. */
function proseField(obj,key,id,set,label="Text"){
  const t=h("textarea",{id,class:"prose-edit",rows:16}); t.value=obj[key]??"";
  t.addEventListener("input",()=>set(t.value));
  const pick=h("select",{"aria-label":"Insert from library"}); pick.append(h("option",{value:"",text:"Insert image or video from the library…"}));
  libFilter(Store.draft.media,{kinds:["image","video","scene"]}).forEach(m=>pick.append(h("option",{value:m.id,text:(categoryLabel(Store.draft,m.category)?categoryLabel(Store.draft,m.category)+" · ":"")+m.label})));
  pick.addEventListener("change",()=>{ if (!pick.value) return; const ins="\n\n[["+pick.value+"|]]\n\n", a=t.selectionStart??t.value.length; t.value=t.value.slice(0,a)+ins+t.value.slice(a); pick.value=""; set(t.value); t.focus(); });
  return h("div",{class:"prose-wrap"},expandable(t,label),h("div",{class:"prose-tools"},pick,h("span",{class:"hint",text:"Empty line = new paragraph · ## Heading · - list item · > quote · **bold** · *italic* · [text](https://…)"})));
}


/* ================= QUICK CREATE =================
   New flows, modals and pages can be made from the "New" menu at the top of the studio, from any flow picker,
   and from any button's action (Open modal / Go to page → New). Pages come from simple templates. */
function makeFlow(D,name="New flow"){
  const f={id:uid("f"),name,separator:"dots3",size:"m",progress:false,display:"row",anim:{...D.motion.flow},custom:{anim:false,colors:false},colors:{},
    items:[{id:uid("x"),kind:"button",label:"First",icon:"",svg:"",showIndex:false,detail:"",action:A(),anim:null},{id:uid("x"),kind:"text",label:"Second",icon:"",svg:"",showIndex:false,detail:"",action:A(),anim:null}]};
  D.flows.push(f); return f;
}
function makeModal(D,type=1){
  const m={id:uid("md"),name:type===5?"New modal with sections":"New modal",type,kicker:"",title:"New modal",text:"",media:type===5?[]:[D.media[0]?.id||""],caption:[],flowId:"",more:{label:type===5?"":"More",action:A()}};
  if (type===5) m.sections=[{id:uid("s"),type:"article",anchor:"start",...SECTION_BLANK.article()}];
  D.modals.push(m); return m;
}
const PAGE_TEMPLATES=[["blank","Page (hero)"],["service","Service page (hero, services list, quote form)"],["catalog","Catalog page (hero, catalog, quote form)"],["article","Article page (hero and text)"]];
function makePage(D,kind="blank"){
  let n=1; while (D.pages.some(p=>p.id==="page-"+n)) n++; const id="page-"+n;
  const hero={id:uid("s"),type:"hero",...SECTION_BLANK.hero(),height:kind==="blank"?"tall":"compact"};
  const quote=()=>({id:uid("s"),type:"quote",...SECTION_BLANK.quote()});
  if (kind==="service"||kind==="catalog") hero.button={label:"Request a Quote",action:{type:"page",target:id,section:"quote"}};
  const sections=kind==="service"?[hero,{id:uid("s"),type:"features",anchor:"services",...SECTION_BLANK.features(),items:[{title:"First service",text:"",icon:""},{title:"Second service",text:"",icon:""},{title:"Third service",text:"",icon:""}]},quote()]
    :kind==="catalog"?[hero,{id:uid("s"),type:"catalog",...SECTION_BLANK.catalog()},quote()]
    :kind==="article"?[hero,{id:uid("s"),type:"article",...SECTION_BLANK.article()}]:[hero];
  const p={id,title:"New page",nav:kind==="blank",layout:"cinematic",sections}; D.pages.push(p); return p;
}
/** The "New" menu in the studio's top bar. */
function newMenu(){
  const s=h("select",{class:"new-menu","aria-label":"Make something new"},h("option",{value:"",text:"＋ New…"}),
    h("optgroup",{label:"Page"},...PAGE_TEMPLATES.map(([v,l])=>h("option",{value:"page:"+v,text:l}))),
    h("optgroup",{label:"Modal"},...OPT.modalTypes.map(([v,l])=>h("option",{value:"modal:"+v,text:l}))),
    h("optgroup",{label:"Flow"},h("option",{value:"flow:row",text:"Flow (row of items)"}),h("option",{value:"flow:tabs",text:"Flow as tabs"}),h("option",{value:"flow:reveal",text:"Flow that reveals parts of a section"})));
  s.addEventListener("change",()=>{ const [k,v]=s.value.split(":"); s.value=""; const D=Store.draft; if (!k) return;
    if (k==="page"){ const p=makePage(D,v); Admin.sel.pages=p.id; touch(); openPanel("pages"); toast("New page made. Change its address and title at the top."); }
    else if (k==="modal"){ const m=makeModal(D,+v); Admin.sel.modals=m.id; touch(); openPanel("modals"); toast("New modal made."); }
    else { const f=makeFlow(D,v==="tabs"?"New tabs":v==="reveal"?"New reveal flow":"New flow"); f.display=v; Admin.sel.flows=f.id; touch(); openPanel("flows"); toast("New flow made. Use it from any section (More options → Flow under this section)."); } });
  return s;
}
/** Labelled sections a button can travel to: a page's sections, a modal's sections (Type 5) or services (Type 4). */
function sectionLabels(D,type,id){
  const sec=x=>[labelKey(x.anchor)||x.id,(plain(x.anchor)?plain(x.anchor)+" · ":"")+secTitle(x)];
  if (type==="page"){ const p=D.pages.find(x=>x.id===id); return p?(p.sections||[]).filter(x=>x.type!=="heroCarousel").map(sec):[]; }
  const m=D.modals.find(x=>x.id===id); if (!m) return [];
  if (m.type===5) return (m.sections||[]).map(sec);
  if (m.type===4) return (m.services||[]).map(x=>[labelKey(x.anchor||x.title),plain(x.title)||"Service"]);
  return [];
}
/* ================= SECTION LIST =================
   Pages and Type 5 modals share one editor: sections in order, each with Shown / Hidden, duplicate and remove,
   its own settings, and "More options" for what every section can have. */
function sectionsEditor(list,{inModal=false,onVis=()=>{}}={}){
  const D=Store.draft, secs=h("div",{class:"sub-list"}), visBar=h("div",{class:"vis-bar",role:"status"});
  const drawVis=()=>{ visBar.textContent=""; onVis(); const hid=list.filter(s=>s.hidden).length, all=list.length;
    visBar.append(...[h("span",{class:"vis-count"},h("b",{text:String(all-hid)})," shown",hid?h("span",{class:"warn"}," · ",h("b",{text:String(hid)})," hidden"):" · none hidden"),
      hid?h("button",{class:"btn sm",type:"button",html:IC.eye+"Show all",onclick:()=>{ list.forEach(s=>{ s.hidden=false; }); drawSecs(); touch(); toast("Every section is shown."); }}):null,
      h("span",{class:"hint",text:"Tap Shown or Hidden on a section to switch it. Hidden sections stay here and are not shown to visitors."})].filter(Boolean)); };
  const drawSecs=()=>{ secs.textContent=""; drawVis();
    list.forEach((s,i)=>{ const T=SECTION_TYPES[s.type]; if (!T) return;
      secs.append(subCard(s,{title:()=>(s.previewOnly?"[Preview only] ":"")+secTitle(s),kind:T.label+(s.anchor?" · #"+plain(s.anchor):""),open:false,
        body:()=>s.type==="heroCarousel"?h("div",{class:"fields"},h("p",{class:"adm-intro",style:"margin:0",text:"Carousel and slide settings have their own tab."}),
            h("button",{class:"btn sm",type:"button",style:"align-self:flex-start",html:IC.carousels+"Edit in Carousels",onclick:()=>{ Admin.sel.carousels=s.id; openPanel("carousels"); }})):
          h("div",{class:"sec-body"},fieldsFor(s,T.fields),sectionExtras(s)),
        onRemove:()=>{ list.splice(i,1); drawSecs(); touch(); },
        onToggleHidden:()=>{ s.hidden=!s.hidden; touch(); drawVis(); },
        onDuplicate:()=>{ const c=clone(s); c.id=uid("s"); c.hidden=!!s.hidden; if (c.anchor) c.anchor=plain(c.anchor)+"-copy"; list.splice(i+1,0,c); drawSecs(); touch(); toast("Section duplicated. The copy is right below the original."); }})); });
    const sel=h("select",{"aria-label":"Section type",style:"padding:8px 10px;border-radius:7px;border:1px solid var(--faint);background:var(--field-bg);color:var(--fg)"});
    Object.entries(SECTION_TYPES).filter(([k])=>!(inModal&&k==="heroCarousel")).forEach(([k,v])=>sel.append(h("option",{value:k,text:v.label})));
    secs.append(h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},sel,h("button",{class:"btn sm",type:"button",html:IC.plus+"Add section",onclick:()=>{ list.push({id:uid("s"),type:sel.value,...SECTION_BLANK[sel.value]()}); drawSecs(); secs.children[secs.children.length-2]?._open?.(); touch(); }})));
    sortable(secs,list,()=>{ drawSecs(); touch(); });
  };
  drawSecs();
  /* Arriving from Missing images: open that section and bring it into view */
  if (Admin.openSec){ const i=list.findIndex(s=>s.id===Admin.openSec); Admin.openSec=""; const el=i>=0?[...secs.querySelectorAll(":scope > .sub-item")][i]:null;
    if (el){ el._open?.(); setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"start"}),60); } }
  return {el:secs,visBar,draw:drawSecs};
}
/** What every section can have: a label, a flow under it, its own look, a background effect, preview only. */
function sectionExtras(s){
  const D=Store.draft, T=D.theme, G=T.sections||{}, GF=G.bgfx||{};
  s.flowUnder=s.flowUnder&&typeof s.flowUnder==="object"?s.flowUnder:{flowId:"",display:"",align:"start"};
  s.bgfx=s.bgfx&&typeof s.bgfx==="object"?s.bgfx:{type:"default"};
  s.anim=s.anim&&typeof s.anim==="object"?s.anim:{}; s.imgfx=s.imgfx&&typeof s.imgfx==="object"?s.imgfx:{};
  const own=Object.keys(ownOnly(s.anim)).length+Object.keys(ownOnly(s.imgfx)).length;
  const box=h("details",{class:"sec-more"},h("summary",{},h("b",{text:"More options"}),h("span",{text:" · label, flow under it, look, background effect"+(s.bgfx.type&&s.bgfx.type!=="default"?" ("+fxName(s.bgfx.type)+")":"")+", animation"+(own?" (own)":"")})));
  box.append(
    h("p",{class:"hint",text:"Label: buttons anywhere can open this page or modal and travel to this section (Action → Go to: label). It is also its link: #page/label."}),
    fieldsFor(s,[["anchor","text","Label (e.g. quote, services)"],["previewOnly","toggle","Preview only: a fictional sample shown in the draft preview, never to visitors"]]),
    h("p",{class:"hint",text:"Flow under this section: any flow, as a row, tabs or reveal panels."}),
    fieldsFor(s.flowUnder,[["flowId","flow","Flow under this section"],["display","select","Behaviour",{options:[["","As set on the flow"],...OPT.flowDisplays]}],["align","select","Align",{options:[["start","Start"],["center","Centre"]]}]]),
    h("p",{class:"hint",text:"Background effect: animated SVG behind the section (it runs only while the section is on screen)."}),
    fxEditor(s.bgfx,{sec:s}),
    h("p",{class:"hint",text:"Animation: how this section enters and leaves, and how its pictures are masked and revealed. Empty values follow Design → Global style."}),
    sectionAnimEditor(s.anim),imageFxEditor(s.imgfx),
    h("p",{class:"hint",text:"Look: spacing, width, background, title and subtitle size and font for this section only."}),
    globalOrCustom(s,"style",{flag:"custom",what:"global section look (Design → Global style → Every section)",body:()=>[fieldsFor(s.style,[["pad","select","Spacing above and below",{options:[["","Global"],...OPT.pads]}],["width","number","Content width in px (empty follows global)",{optional:true,min:640,step:20,placeholder:String(G.width??1320)}],
      ["bg","color","Background colour",{optional:true,placeholder:"None"}],["bgAlpha","range","Background strength",{min:0,max:1,step:.05}],
      ["titleSize","number","Title size (1 = normal)",{optional:true,min:.4,step:.05,placeholder:"1"}],["subSize","number","Subtitle size (1 = normal)",{optional:true,min:.4,step:.05,placeholder:"1"}],
      ["titleFont","select","Title font",{options:[["","Global"],...OPT.fonts]}],["title","color","Title colour",{optional:true,placeholder:"Global"}],["text","color","Text colour",{optional:true,placeholder:"Global"}],["accent","color","Accent",{optional:true,placeholder:"Global"}]])]}));
  return box;
}
export { panelMissing, missingSlots, libBrowser, mediaState, makeFlow, makeModal, makePage, sectionsEditor, sectionExtras, sectionLabels, overlayEditor, LIB, syncLibrary, libFilter, categorySelect, githubCard, categoriesCard, panelBlog, proseField, panelMedia, slugify, prettyName, versionsCard, signInForm, notEditor, IC, PANELS, Admin, assetsApi, toast, touch, renderAdmin, updateTop, previewDraft, openPanel, F, fieldsFor, actionEditor, mediaThumb, mediaPicker, iconPicker, listEditor, subCard, confirmInline, sortable, card, masterDetail, idOk, panelSite, PALETTES, panelTheme, panelMotion, panelIcons, flowItemSchema, panelFlows, panelModals, panelPages };
