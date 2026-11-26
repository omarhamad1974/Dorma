import { LIBRARY_BASE, REPO_BRANCH, REPO_URL } from '../config';
import { hexOk, LANGS, isTx, plain, setDocLang, TIMING_PARTS, $, $$, ARROW_SVG, applyTheme, categoryLabel, clone, esc, fmtDate, h, libPathOk, mediaNode, overlayCss, overlayEl, renderFlow, revealTitle, sanitizeSvg, uid } from './core';
import { gsap } from 'gsap';
import { Store, draftDiffers, listVersions, loadDraft, media, normalize, publishDraft, restoreVersion, route, scheduleSave, signIn, signOut, signedInEmail } from './store';
import { Site, closeModal, disposePage, openModal } from './site';
import { IMPORTERS, buildIcons } from './mdimport';
import { A, OPT, OV_PRESETS, SECTION_BLANK, SECTION_TYPES, STARTER, snapshotStyle, applyStyle, resetOverrides } from './data';
import Sortable from 'sortablejs';
import { imageUrl, markHtml, previewLoader } from '../loader';

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
const PANELS=[["style","Global style"],["site","Site and titles"],["theme","Colours and type"],["motion","Animation"],["media","Library"],["icons","Icons"],["flows","Flows"],["modals","Modals"],["pages","Pages"],["carousels","Carousels"],["blog","Blog"],["import","Import"]];
/* Four main tabs; each holds related sub-tabs. The studio remembers the last sub-tab of each group. */
const GROUPS=[["content","Content","pages",["pages","carousels","blog","import"]],["design","Design","theme",["style","theme","motion","site"]],["blocks","Flows and modals","flows",["flows","modals","icons"]],["media","Library","media",["media"]]];
const groupOf=k=>GROUPS.find(g=>g[3].includes(k))||GROUPS[0];
const lastSub={};
/* Studio light or dark mode: a per-person preference kept in this browser. */
const studioMode=()=>{ try { return localStorage.getItem("dorma.studioMode")==="light"?"light":"dark"; } catch { return "dark"; } };
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
  if (cpClose) cpClose(); Admin.panel=k; Admin.refresh=null; const G=groupOf(k); lastSub[G[0]]=k;
  $$(".adm-side button[data-g],.adm-mobile-nav button[data-g]").forEach(b=>b.classList.toggle("on",b.dataset.g===G[0]));
  const sub=$("#admSub"); if (sub){ sub.textContent=""; sub.hidden=G[3].length<2;
    G[3].forEach(s=>sub.append(h("button",{type:"button",role:"tab","aria-selected":s===k?"true":"false",class:s===k?"on":"",text:(PANELS.find(p=>p[0]===s)||[])[1],onclick:()=>openPanel(s)}))); }
  const body=$("#admBody"); if (!body) return; body.textContent=""; body.className="adm-body p-"+k; disposePage();
  ({style:panelStyle,site:panelSite,theme:panelTheme,motion:panelMotion,media:panelMedia,icons:panelIcons,flows:panelFlows,modals:panelModals,pages:panelPages,carousels:panelCarousels,blog:panelBlog,import:panelImport})[k](body);
  updateTop(); scrollTo(0,0);
}

/* ---------- generic field engine ---------- */
/* Bilingual entry: when the site has Arabic, every text box shows English and Arabic side by side.
   Settings that are not shown to visitors as text (ids, slugs, links, studio names, library files, the loader) stay single. */
const MONO_KEYS=new Set(["id","slug","name","path","url","target","code","homePage","logo","image"]);
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
      const c=h("input",{id,type:"color"}), t=h("input",{type:"text",placeholder:opt?(opts.placeholder||"Global"):"","aria-label":label+" hex",style:"width:96px"});
      let row=null;
      const sync=()=>{ c.value=val()||fb(); t.value=val(); if (row) row.classList.toggle("inherit",opt&&!val()); };
      const put=v=>{ set(v,{theme:true}); sync(); };
      c.addEventListener("input",()=>{ t.value=c.value; set(c.value,{theme:true}); row.classList.remove("inherit"); });
      t.addEventListener("change",()=>{ const v=t.value.trim(); if (opt&&v==="") put(""); else if (hexOk(v)) put(v.toLowerCase()); else sync(); });
      const pick=h("button",{type:"button",class:"cp-btn",title:"Open the colour panel","aria-label":"Colour panel for "+label,html:IC.theme,onclick:e=>colorPanel(e.currentTarget,{value:val()||fb(),onPick:put})});
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
      const s=h("select",{id},h("option",{value:"",text:"None"})); list.forEach(x=>{ const op=h("option",{value:x.id,text:x.name||x.title||x.id}); if (obj[key]===x.id) op.selected=true; s.append(op); });
      s.addEventListener("change",()=>set(s.value)); wrap.append(s); break; }
    case "category": { const s=categorySelect(obj[key]||"",v=>set(v),{allLabel:opts.allowAll?"All categories":"No category"}); s.id=id; wrap.append(s); break; }
    case "date": { const i=h("input",{id,type:"date",value:obj[key]||""}); i.addEventListener("change",()=>set(i.value)); wrap.append(i); break; }
    case "prose": wrap.classList.add("wide"); wrap.append(proseField(obj,key,id,v=>set(v),opts.groupLabel?opts.groupLabel+" · "+label:label)); break;
    case "media": wrap.append(mediaPicker(obj,key,opts,()=>{ onChange(obj[key]); touch(); })); lab.removeAttribute("for"); break;
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
  const drawTarget=()=>{ tgt.textContent="";
    if (a.type==="modal"||a.type==="page"||a.type==="post"||a.type==="doc"){ const s=h("select",{"aria-label":"Target",style:"width:100%"}); const opts={modal:D.modals,page:D.pages,post:D.posts,doc:D.media.filter(m=>m.kind==="article")}[a.type]; opts.forEach(x=>{ const o=h("option",{value:x.id,text:x.name||x.title||x.label}); if (a.target===x.id) o.selected=true; s.append(o); });
      if (!a.target && s.options[0]){ a.target=s.options[0].value; } s.addEventListener("change",()=>{ a.target=s.value; onChange(); }); tgt.append(s); }
    else if (a.type==="slide"||a.type==="url"){ const i=h("input",{type:a.type==="slide"?"number":"text",value:a.target||"",placeholder:a.type==="url"?"https://…":"Slide number","aria-label":"Target",style:"width:100%"}); i.addEventListener("input",()=>{ a.target=i.value; onChange(); }); tgt.append(i); }
  };
  type.addEventListener("change",()=>{ a.type=type.value; a.target=""; drawTarget(); onChange(); });
  $$("select,input",row).forEach(x=>x.style.cssText+=";padding:9px 11px;border-radius:7px;border:1px solid var(--faint);background:rgba(0,0,0,.25)");
  row.append(type,tgt); drawTarget();
  setTimeout(()=>$$("select,input",row).forEach(x=>x.style.cssText+=";padding:9px 11px;border-radius:7px;border:1px solid var(--faint);background:var(--field-bg);color:var(--fg)"));
  return row;
}
function mediaThumb(id){ const n=mediaNode(Store.draft,id,{w:240,hh:180}); return n||h("span",{text:"Missing"}); }
/* Image picker: compact thumbnails (size remembered per browser), category + search filters shared by every picker this session */
const PICK={ cat:"", q:"" };
const PICK_SIZES=[["s","Small",56],["m","Medium",84],["l","Large",130]];
const pickSize=()=>{ try { const v=localStorage.getItem("dorma.pickSize"); return PICK_SIZES.some(z=>z[0]===v)?v:"s"; } catch { return "s"; } };
function setPickSize(v){ try { localStorage.setItem("dorma.pickSize",v); } catch { /* storage blocked */ } }
function mediaPicker(obj,key,opts,onChange){
  const D=Store.draft, outer=h("div",{class:"media-pick-wrap"}), g=h("div",{class:"media-pick"}), countEl=h("span",{class:"media-pick-count"});
  const pool=()=>libFilter(D.media,{kinds:["image","video","scene"]});
  const applySize=v=>{ const z=PICK_SIZES.find(x=>x[0]===v)||PICK_SIZES[0]; g.style.setProperty("--pick",z[2]+"px"); g.dataset.size=z[0]; };
  const cats=h("select",{"aria-label":"Category"});
  const fillCats=()=>{ cats.textContent=""; const all=pool(); cats.append(h("option",{value:"",text:"All categories ("+all.length+")"}));
    D.categories.forEach(c=>{ const n=all.filter(m=>m.category===c.id).length; if (!n && PICK.cat!==c.id) return; const o=h("option",{value:c.id,text:c.label+" ("+n+")"}); if (c.id===PICK.cat) o.selected=true; cats.append(o); });
    const un=all.filter(m=>!m.category).length; if (un){ const o=h("option",{value:"_none",text:"No category ("+un+")"}); if (PICK.cat==="_none") o.selected=true; cats.append(o); }
    if (cats.value!==PICK.cat) PICK.cat=cats.value; };
  cats.addEventListener("change",()=>{ PICK.cat=cats.value; draw(); });
  const q=h("input",{type:"search",placeholder:"Search name or tag","aria-label":"Search images",value:PICK.q}); q.addEventListener("input",()=>{ PICK.q=q.value; draw(); });
  const sizes=h("div",{class:"media-pick-size",role:"group","aria-label":"Thumbnail size"});
  const drawSizes=()=>{ sizes.textContent=""; const cur=pickSize(); PICK_SIZES.forEach(([v,l])=>sizes.append(h("button",{type:"button",class:cur===v?"on":"",text:v.toUpperCase(),title:l+" thumbnails","aria-label":l+" thumbnails","aria-pressed":String(cur===v),onclick:()=>{ setPickSize(v); applySize(v); drawSizes(); }}))); };
  outer.append(h("div",{class:"media-pick-filters"},cats,q,sizes,countEl));
  const draw=()=>{ g.textContent=""; fillCats();
    if (opts.allowNone) g.append(h("button",{type:"button",class:"none"+(!obj[key]?" on":""),text:"None",title:"No image",onclick:()=>{ obj[key]=""; draw(); onChange(); }}));
    const all=pool(), list=PICK.cat==="_none"?libFilter(all.filter(m=>!m.category),{q:PICK.q}):libFilter(all,{cat:PICK.cat,q:PICK.q});
    countEl.textContent=list.length===all.length?all.length+" items":list.length+" of "+all.length;
    const cur=D.media.find(m=>m.id===obj[key]); if (cur && !list.includes(cur)) list.unshift(cur);
    list.forEach(m=>{ const b=h("button",{type:"button",class:obj[key]===m.id?"on":"",title:m.label,"aria-label":m.label},mediaThumb(m.id),h("span",{text:m.label}));
      b.addEventListener("click",()=>{ obj[key]=m.id; draw(); onChange(); }); g.append(b); });
    if (!list.length) g.append(h("p",{class:"media-pick-empty",text:"Nothing matches. Try another category or clear the search."})); };
  applySize(pickSize()); drawSizes(); draw(); outer.append(h("div",{class:"media-pick-scroll"},g)); return outer;
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
  const draw=()=>{ box.textContent="";
    arr.forEach((it,i)=>box.append(subCard(it,{title:()=>plain(it[opts.title])||"Item "+(i+1),kind:opts.kindLabel?opts.kindLabel(it):"",open:false,
      onToggleHidden:opts.hideable?()=>{ it.hidden=!it.hidden; onChange(); touch(); }:null,
      body:()=>fieldsFor(it,opts.fields,onChange),onRemove:()=>{ arr.splice(i,1); draw(); onChange(); touch(); },
      onDuplicate:()=>{ arr.splice(i+1,0,clone(it)); draw(); box.children[i+1]?._open?.(); onChange(); touch(); }})));
    box.append(h("button",{class:"btn sm",type:"button",html:IC.plus+"Add",onclick:()=>{ arr.push(opts.blank?opts.blank():{}); draw(); const last=box.children[box.children.length-2]; last&&last.classList.remove("closed"); onChange(); touch(); }}));
    sortable(box,arr,()=>{ draw(); onChange(); touch(); }); };
  draw(); return box;
}
function subCard(item,{title,kind,body,onRemove,open,onDuplicate,onToggleHidden}){
  const card=h("div",{class:"sub-item"+(open?"":" closed")+(item&&item.hidden?" is-hidden":"")}), t=h("span",{class:"t",text:title()});
  /* Shown / Hidden switch: one tap, and the state is written on it */
  const hideBtn=onToggleHidden?h("button",{class:"vis-pill",type:"button"}):null;
  const syncHide=()=>{ if (!hideBtn) return; const hid=!!item.hidden; card.classList.toggle("is-hidden",hid); hideBtn.innerHTML=(hid?IC.eyeOff:IC.eye)+"<span>"+(hid?"Hidden":"Shown")+"</span>";
    hideBtn.setAttribute("aria-label",hid?"Hidden from visitors. Tap to show it":"Shown to visitors. Tap to hide it"); hideBtn.title=hid?"Hidden from visitors. Tap to show":"Shown to visitors. Tap to hide"; hideBtn.setAttribute("aria-pressed",hid?"true":"false"); };
  if (hideBtn){ hideBtn.addEventListener("click",e=>{ e.stopPropagation(); onToggleHidden(); syncHide(); }); syncHide(); card._syncHide=syncHide; }
  const head=h("div",{class:"sub-head"},h("span",{class:"handle",html:IC.grip,"aria-hidden":"true"}),kind?h("span",{class:"k",text:kind}):null,t,
    hideBtn,
    onDuplicate?h("button",{class:"x",type:"button","aria-label":"Duplicate",title:"Duplicate",html:IC.copy,onclick:e=>{ e.stopPropagation(); onDuplicate(); }}):null,
    h("button",{class:"x",type:"button","aria-label":"Remove",title:"Remove",html:IC.x,onclick:e=>{ e.stopPropagation(); confirmInline(card,"Remove this item?",onRemove); }}));
  let built=false; const b=h("div",{class:"sub-body"});
  const build=()=>{ if (built) return; built=true; b.append(body()); b.addEventListener("input",()=>{ t.textContent=title(); }); b.addEventListener("change",()=>{ t.textContent=title(); }); };
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
  body.append(card("Languages and numbering",h("p",{class:"adm-intro",text:"Choose the languages visitors can read. With both, a switch in the header lets them change language. When Arabic is on, every text box in the studio shows English and Arabic side by side. A language left empty shows the other language's text."}),
    fieldsFor(D.site,[["languages","select","Site languages",{options:[["en","English only"],["ar","Arabic only"],["both","English and Arabic"]]}],["defaultLang","select","Language for first-time visitors",{options:[["en","English"],["ar","العربية"]]}],["showNumbers","toggle","Show numbering (01, 02… counters, steps and badges)"]],(v,k)=>{ if (k==="languages") openPanel("site"); })));
  body.append(card("Logo",h("p",{class:"adm-intro",text:"The logo in the site header. Leave the image on None to use the built-in white Dorma logo, or pick any image from the Library (a transparent PNG or SVG with light colours works best on the dark header)."}),
    fieldsFor(D.site,[["logoMode","select","Header shows",{options:[["image","Logo image"],["text","Brand name as text"]]}],["logoHeight","range","Logo height (px)",{min:20,max:64,step:1}],["logo","media","Logo image (None uses the white Dorma logo)",{allowNone:true}]])));
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
    T.swatches.forEach((s,i)=>{ const c=h("input",{type:"color",value:/^#[\da-f]{6}$/i.test(s.hex||"")?s.hex:"#000000","aria-label":"Colour"}), x=h("input",{type:"text",value:s.hex||"","aria-label":"Hex code",style:"width:96px"}), n=h("input",{type:"text",value:s.name||"",placeholder:"Name","aria-label":"Colour name"});
      c.addEventListener("input",()=>{ s.hex=x.value=c.value; touch(); }); x.addEventListener("change",()=>{ if (/^#[\da-f]{6}$/i.test(x.value.trim())){ s.hex=c.value=x.value.trim().toLowerCase(); touch(); } else x.value=s.hex; }); n.addEventListener("input",()=>{ s.name=n.value; touch(); });
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
    card("Type",fieldsFor(T,[["display","select","Headings",{options:OPT.fonts,theme:true}],["body","select","Body",{options:OPT.fonts,theme:true}],["mono","select","Labels",{options:OPT.monos,theme:true}],["radius","range","Corner radius",{min:0,max:16,step:1,theme:true}]])),
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
    card("Modals",fieldsFor(M,[["modalOpen","select","Opening style",{options:OPT.modalOpen}]])),
    h("p",{class:"adm-intro",text:"Each flow also has its own animation settings, under Flows. Carousel transitions and slide times are under Carousels."}));
}
/* ---------- colour panel ----------
   A popover grid of colours: My colours, the Dorma brand colours, a full spectrum and greys, plus any custom colour.
   Picking applies the colour; "Add to My colours" keeps it in the palette shown next to every colour picker. */
function hslHex(hh,s,l){ s/=100; l/=100; const k=n=>(n+hh/30)%12, a=s*Math.min(l,1-l), f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));
  return "#"+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,"0")).join(""); }
const CP_BRAND=[["Dorma blue","#0072bc"],["Dorma yellow","#ffcb08"],["Dorma magenta","#ed0677"],["Dorma cyan","#00aeef"],["Ink","#040915"],["Night panel","#0b1630"],["White","#ffffff"],["Black","#000000"]];
const CP_GRID=(()=>{ const hues=[0,15,30,45,55,75,120,155,180,195,210,235,265,290,320,340];
  const rows=[[92,70],[80,75],[66,78],[52,80],[40,78],[28,70],[16,60]].map(([l,s])=>hues.map(x=>hslHex(x,s,l)));
  rows.push(hues.map((_,i)=>hslHex(0,0,Math.round(100-i*100/(hues.length-1)))));
  return rows; })();
let cpClose=null;
function colorPanel(anchor,{value="#ffffff",onPick=()=>{},title="Pick a colour",addMode=false}={}){
  if (cpClose) cpClose();
  const D=Store.draft, T=D.theme; T.swatches=Array.isArray(T.swatches)?T.swatches:[];
  let cur=hexOk(value)?value.toLowerCase():"#ffffff";
  const panel=h("div",{class:"cpanel",role:"dialog","aria-label":title});
  const nat=h("input",{type:"color",value:cur,"aria-label":"Any colour"}), hx=h("input",{type:"text",value:cur,"aria-label":"Hex code",style:"width:96px"});
  const marks=()=>$$(".cp-sw",panel).forEach(b=>b.classList.toggle("on",b.dataset.hex===cur));
  const added=()=>{ onPick(cur); close(); toast("Added to My colours."); };
  const choose=hex=>{ cur=hex.toLowerCase(); nat.value=hx.value=cur; marks(); if (addMode) added(); else onPick(cur); };
  const sw=(hex,name)=>h("button",{type:"button",class:"cp-sw","data-hex":hex.toLowerCase(),style:"background:"+hex,title:(name?name+" · ":"")+hex,"aria-label":name||hex,onclick:()=>choose(hex)});
  nat.addEventListener("input",()=>{ cur=nat.value; hx.value=cur; marks(); if (!addMode) onPick(cur); });
  hx.addEventListener("change",()=>{ const v=hx.value.trim().toLowerCase(); if (hexOk(v)){ cur=v; nat.value=v; marks(); if (!addMode) onPick(cur); } else hx.value=cur; });
  const mineRow=h("div",{class:"cp-row"});
  const drawMine=()=>{ mineRow.textContent=""; const ok=T.swatches.filter(s=>hexOk(s.hex));
    if (!ok.length) mineRow.append(h("span",{class:"hint",text:"None yet. Pick a colour and add it."})); ok.forEach(s=>mineRow.append(sw(s.hex,s.name))); marks(); };
  const grid=h("div",{class:"cp-grid"}); CP_GRID.forEach(r=>r.forEach(c=>grid.append(sw(c))));
  const brand=h("div",{class:"cp-row"}); CP_BRAND.forEach(([n,c])=>brand.append(sw(c,n)));
  const addBtn=h("button",{class:"btn sm"+(addMode?" primary":""),type:"button",html:IC.plus+"Add to My colours",onclick:()=>{
    if (addMode){ added(); return; }
    if (!T.swatches.some(s=>(s.hex||"").toLowerCase()===cur)){ T.swatches.push({name:"",hex:cur}); touch(); toast("Added to My colours."); } drawMine(); }});
  panel.append(h("div",{class:"cp-head"},h("strong",{text:title}),h("button",{class:"x",type:"button","aria-label":"Close",html:IC.x,onclick:()=>close()})),
    h("p",{class:"hint",text:"My colours"}),mineRow,h("p",{class:"hint",text:"Dorma"}),brand,h("p",{class:"hint",text:addMode?"Click a colour to add it":"All colours"}),grid,
    h("div",{class:"cp-custom"},nat,hx,addBtn));
  drawMine();
  const host=$(".adm")||document.body; host.append(panel);
  const place=()=>{ const r=anchor.getBoundingClientRect(), w=panel.offsetWidth, ph=panel.offsetHeight;
    const left=Math.min(Math.max(8,r.left),innerWidth-w-8); let top=r.bottom+6; if (top+ph>innerHeight-8) top=Math.max(8,r.top-ph-6);
    panel.style.left=left+"px"; panel.style.top=top+"px"; };
  place();
  const outside=e=>{ if (!panel.contains(e.target) && !anchor.contains(e.target)) close(); };
  const onKey=e=>{ if (e.key==="Escape"){ close(); anchor.focus(); } };
  function close(){ panel.parentNode&&panel.parentNode.removeChild(panel); removeEventListener("pointerdown",outside,true); removeEventListener("keydown",onKey); removeEventListener("resize",place); removeEventListener("scroll",place,true); if (cpClose===close) cpClose=null; }
  addEventListener("pointerdown",outside,true); addEventListener("keydown",onKey); addEventListener("resize",place); addEventListener("scroll",place,true);
  cpClose=close; (panel.querySelector(".cp-sw.on")||panel.querySelector(".cp-sw"))?.focus();
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
function panelStyle(body){
  const D=Store.draft, T=D.theme, M=D.motion;
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
      cnt.slides?resetBtn("Make every carousel and slide use the global style",{flows:false,slides:true}):null)
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
  const s=[["kind","select","Type",{options:OPT.kinds}],["label","text",it.kind==="icon"||it.kind==="svg"?"Label (screen readers and hover)":"Label"]];
  if (it.kind==="button") s.push(["showIndex","toggle","Show number"]);
  if (it.kind==="svg") s.push(["svg","code","SVG code",{wide:true}]);
  else s.push(["icon","icon",it.kind==="icon"?"Icon":"Icon (optional)",{wide:true}]);
  s.push(["action","action","On click",{wide:true}],["detail","area","Detail text (used by timelines and Type 3 modals)",{wide:true}]);
  return s;
}
function panelFlows(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"A flow is a row of items separated by small marks. Draw it from buttons, plain text, icons or your own SVG, then choose how it animates: as one piece or item by item, with optional settings per item. Any page section or Type 3 modal can use a flow."}),h("div",{class:"imp-links"},importLink("flows","Import flows from a file")));
  masterDetail(body,{items:()=>D.flows,selKey:"flows",label:f=>f.name||f.id,kind:f=>f.items.length+" items",addLabel:"New flow",
    onAdd:()=>{ const f={id:uid("f"),name:"New flow",separator:"dots3",size:"m",progress:false,anim:{...D.motion.flow},custom:{anim:false,colors:false},colors:{},items:[{id:uid("x"),kind:"button",label:"First",icon:"",svg:"",showIndex:true,detail:"",action:A(),anim:null}]}; D.flows.push(f); return f; },
    detail:(f,redrawList)=>{
      const prev=h("div",{class:"preview-box"}); const drawPrev=()=>{ prev.textContent=""; const fl=renderFlow(D,f.id,{onItem:(i)=>fl.setActive(i,{fill:true})}); if (fl){ fl.setActive(0,{fill:true}); prev.append(fl.el); fl.play(0); } prev.append(h("span",{class:"lbl-a",text:"Preview · click items"})); };
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
          f.items.push({id:uid("x"),kind:k,label:k==="icon"||k==="svg"?"Icon":"New item",icon:k==="icon"?(D.icons[0]?.id||""):"",svg:k==="svg"?'<svg viewBox="0 0 24 24"><path d="M4 12h16M12 4v16"/></svg>':"",showIndex:k==="button",detail:"",action:A(),anim:null});
          drawItems(); items.children[items.children.length-2]?._open?.(); touch(); }})));
        items.append(add); sortable(items,f.items,()=>{ drawItems(); touch(); });
      };
      drawItems();
      return [
        card(h("span",{class:"grow"},"Preview"),prev,h("button",{class:"btn sm",type:"button",style:"align-self:flex-start",html:IC.replay+"Replay animation",onclick:drawPrev})),
        card("Flow settings",fieldsFor(f,[["name","text","Name"],["separator","select","Separator",{options:OPT.separators}],["size","select","Size",{options:OPT.sizes}]],()=>redrawList())),
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
    onAdd:()=>{ const m={id:uid("md"),name:"New modal",type:1,kicker:"",title:"New modal",text:"",media:[D.media[0]?.id||""],caption:[],flowId:"",more:{label:"More",action:A()}}; D.modals.push(m); return m; },
    detail:(m,redrawList)=>{
      const mediaBoxEl=h("div");
      const drawMedia=()=>{ mediaBoxEl.textContent=""; const n=m.type===2?3:1; m.media=m.media||[]; while (m.media.length<n) m.media.push(D.media[m.media.length%D.media.length]?.id||"");
        const f=h("div",{class:"fields"}); for (let k=0;k<n;k++) f.append(F(m.media,k,"media",n>1?"Gallery item "+(k+1):"Image or video",{wide:true})); mediaBoxEl.append(f); };
      drawMedia();
      const base=[["name","text","Name in the studio"],["type","select","Type",{options:OPT.modalTypes}],["kicker","text","Small label"],["title","text","Title",{wide:true}],["text","area","Short paragraph",{wide:true}],["caption","strings",m.type===2?"Captions, one per gallery item":"Caption items, one per line (shown with the flow separators)",{wide:true}]];
      if (m.type===3) base.push(["flowId","flow","Flow inside the modal"]);
      if (m.type===4) base.push(["services","list","Services (each with a short brief and a link)",{ title:"title", hideable:true, fields:[["title","text","Title"],["text","area","Brief",{wide:true}],["link","button","Link (e.g. go to the service page)"]], blank:()=>({title:"New service",text:"",link:{label:"Learn more",action:A()}}) }]);
      base.push(["timing","timing","Timing",{parts:m.type===3?[["eyebrow",.75],["title",.81],["text",.87],["flow",1],["detail",.93],["media",.99],["more",1.05]]:[["eyebrow",.75],["title",.81],["text",.87],["media",.93],["more",.99]],hint:"Seconds from when the modal starts opening. Empty uses the default shown. Lower numbers come first."}]);
      return [
        card(h("span",{class:"grow"},"Content"),h("button",{class:"btn sm",type:"button",html:IC.eye+"Preview modal",onclick:()=>openModal(D,m.id)}),fieldsFor(m,base,(v,k)=>{ if (k==="type"){ openPanel("modals"); } else redrawList(); })),
        card("Media",mediaBoxEl), card("More button",h("div",{class:"fields"},F(m,"more","button","More button"))),
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
  masterDetail(body,{items:all,selKey:"carousels",label:x=>secTitle(x.s),kind:x=>(x.p.title||x.p.id)+(x.s.hidden?" · hidden":""),
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
    onAdd:()=>{ let n=1; while (D.pages.some(p=>p.id==="page-"+n)) n++; const p={id:"page-"+n,title:"New page",nav:true,layout:"cinematic",sections:[{id:uid("s"),type:"hero",...SECTION_BLANK.hero()}]}; D.pages.push(p); return p; },
    detail:(p,redrawList)=>{
      const slug=h("input",{type:"text",value:p.id,id:uid("f")}), slugHint=h("span",{class:"hint",text:"Used in the address after #. Lowercase letters, numbers and hyphens."});
      slug.addEventListener("change",()=>{ const v=slug.value.trim(); if (!idOk(v,D.pages,p)){ slugHint.textContent="That address is taken or not allowed."; slugHint.style.color="var(--bad)"; slug.value=p.id; return; }
        const old=p.id; p.id=v; if (D.site.homePage===old) D.site.homePage=v;
        const fix=a=>{ if (a&&a.type==="page"&&a.target===old) a.target=v; }; JSON.stringify(D,(k,val)=>{ if (val&&typeof val==="object"&&val.type==="page") fix(val); return val; });
        Admin.sel.pages=v; slugHint.style.color=""; slugHint.textContent="Address updated."; touch(); redrawList(); });
      const meta=fieldsFor(p,[["title","text","Title"],["layout","select","Layout",{options:OPT.layouts}],["nav","toggle","Show in menu"]],()=>redrawList());
      meta.prepend(h("div",{class:"field"},h("label",{for:slug.id,text:"Address"}),slug,slugHint));
      const secs=h("div",{class:"sub-list"}), visBar=h("div",{class:"vis-bar",role:"status"});
      const drawVis=()=>{ visBar.textContent=""; redrawList(); const hid=p.sections.filter(s=>s.hidden).length, all=p.sections.length;
        visBar.append(...[h("span",{class:"vis-count"},h("b",{text:String(all-hid)})," shown",hid?h("span",{class:"warn"}," · ",h("b",{text:String(hid)})," hidden"):" · none hidden"),
          hid?h("button",{class:"btn sm",type:"button",html:IC.eye+"Show all",onclick:()=>{ p.sections.forEach(s=>{ s.hidden=false; }); drawSecs(); touch(); toast("Every section on this page is shown."); }}):null,
          h("span",{class:"hint",text:"Tap Shown or Hidden on a section to switch it. Hidden sections stay here and are not shown to visitors."})].filter(Boolean)); };
      const drawSecs=()=>{ secs.textContent=""; drawVis();
        p.sections.forEach((s,i)=>{ const T=SECTION_TYPES[s.type]; if (!T) return;
          secs.append(subCard(s,{title:()=>secTitle(s),kind:T.label,open:false,
            body:()=>s.type==="heroCarousel"?h("div",{class:"fields"},h("p",{class:"adm-intro",style:"margin:0",text:"Carousel and slide settings have their own tab."}),
                h("button",{class:"btn sm",type:"button",style:"align-self:flex-start",html:IC.carousels+"Edit in Carousels",onclick:()=>{ Admin.sel.carousels=s.id; openPanel("carousels"); }})):fieldsFor(s,T.fields),
            onRemove:()=>{ p.sections.splice(i,1); drawSecs(); touch(); },
            onToggleHidden:()=>{ s.hidden=!s.hidden; touch(); drawVis(); },
            onDuplicate:()=>{ const c=clone(s); c.id=uid("s"); c.hidden=!!s.hidden; p.sections.splice(i+1,0,c); drawSecs(); touch(); toast("Section duplicated. The copy is right below the original."); }})); });
        const sel=h("select",{"aria-label":"Section type",style:"padding:8px 10px;border-radius:7px;border:1px solid var(--faint);background:var(--field-bg);color:var(--fg)"}); Object.entries(SECTION_TYPES).forEach(([k,v])=>sel.append(h("option",{value:k,text:v.label})));
        secs.append(h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},sel,h("button",{class:"btn sm",type:"button",html:IC.plus+"Add section",onclick:()=>{ p.sections.push({id:uid("s"),type:sel.value,...SECTION_BLANK[sel.value]()}); drawSecs(); secs.children[secs.children.length-2]?._open?.(); touch(); }})));
        sortable(secs,p.sections,()=>{ drawSecs(); touch(); });
      };
      drawSecs();
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
const LIB={ cat:"", kind:"", q:"", hidden:false };
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
    D.media.push({id:uid("m"),label:prettyName(f.path),kind:f.kind,path:f.path,category:f.category||"",tags:[],alt:"",summary:"",link:"",cover:""}); files++; });
  if (files){ scheduleSave(); toast(files===1?"1 new file from GitHub added to the library":files+" new files from GitHub added to the library"); }
  else if (!quiet) toast("The library is up to date with GitHub.");
  return files;
}
function libFilter(list,{kinds,cat,q,hidden}){
  const qq=(q||"").trim().toLowerCase();
  return list.filter(m=>(!kinds||kinds.includes(m.kind))&&(!cat||m.category===cat)&&(hidden||!m.hidden)
    &&(!qq||[m.label,m.alt,m.summary,m.path,...(m.tags||[])].join(" ").toLowerCase().includes(qq)));
}
function categorySelect(value,onChange,{allLabel="All categories",style=""}={}){
  const s=h("select",{"aria-label":"Category",style}); s.append(h("option",{value:"",text:allLabel}));
  Store.draft.categories.forEach(c=>{ const o=h("option",{value:c.id,text:c.label}); if (c.id===value) o.selected=true; s.append(o); });
  s.addEventListener("change",()=>onChange(s.value)); return s;
}
const DOC_ICON='<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/></svg>';
function docThumb(m){ const D=Store.draft; if (m.cover){ const n=mediaNode(D,m.cover,{w:240,hh:180}); if (n) return n; } return h("span",{class:"doc-thumb",html:DOC_ICON}); }

function panelMedia(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"Every image, video, background and article in one place, sorted into categories. Anything here can be picked wherever the studio asks for an image, and articles can be opened from any button."}));
  const up=h("input",{type:"file",accept:"image/*,video/mp4,video/webm",multiple:true,hidden:true});
  up.addEventListener("change",async()=>{ for (const f of up.files){ try { toast("Uploading "+f.name); const r=await assetsApi.upload(f); const m={id:uid("m"),label:prettyName(f.name),kind:f.type.startsWith("video")?"video":"image",assetId:r.id,url:r.url,category:LIB.cat||"",tags:[],alt:""}; D.media.push(m); Admin.sel.media=m.id; touch(); draw(); toast("Uploaded "+f.name); } catch(e){ toast("Upload failed: "+(e&&e.message||"try a smaller file")); } } up.value=""; });
  const bar=h("div",{style:"display:flex;gap:10px;flex-wrap:wrap"},
    h("button",{class:"btn primary",type:"button",html:IC.up+"Check GitHub for new files",onclick:async()=>{ await syncLibrary(false); touch(); draw(); }}),
    assetsApi?h("button",{class:"btn",type:"button",html:IC.up+"Quick upload (Supabase)",title:"Stored in Supabase Storage instead of GitHub",onclick:()=>up.click()}):null,
    h("button",{class:"btn",type:"button",html:IC.plus+"Add article",onclick:()=>{ const m={id:uid("m"),label:"New article",kind:"article",category:LIB.cat||"articles",tags:[],summary:"",link:"",cover:""}; D.media.push(m); Admin.sel.media=m.id; LIB.kind=""; touch(); draw(); }}),
    importLink("library","Import names and tags from a file"),h("button",{class:"btn",type:"button",html:IC.plus+"Add generated scene",onclick:()=>{ const m={id:uid("m"),label:"New scene",kind:"scene",scene:"nebula",fx:.5,fy:.5,zoom:1,category:LIB.cat||"backgrounds",tags:[]}; D.media.push(m); Admin.sel.media=m.id; touch(); draw(); }}),up);
  const kinds=h("div",{class:"lib-kinds",role:"group","aria-label":"Type"});
  const search=h("input",{type:"search",placeholder:"Search titles, tags, files","aria-label":"Search the library",value:LIB.q});
  search.addEventListener("input",()=>{ LIB.q=search.value; drawGrid(); });
  const hiddenT=h("label",{class:"toggle"},h("input",{type:"checkbox",checked:LIB.hidden,onchange:e=>{ LIB.hidden=e.target.checked; drawGrid(); }}),"Show hidden");
  const filters=h("div",{class:"lib-filters"},kinds,h("span",{class:"cat-slot"}),search,hiddenT);
  const grid=h("div",{class:"lib-grid"}), det=h("div"), countEl=h("p",{class:"mono"});
  const drawFilters=()=>{ kinds.textContent=""; OPT.libKinds.forEach(([v,l])=>kinds.append(h("button",{type:"button",class:"chip"+(LIB.kind===v?" on":""),text:l,onclick:()=>{ LIB.kind=v; drawFilters(); drawGrid(); }})));
    $(".cat-slot",filters).replaceWith(Object.assign(categorySelect(LIB.cat,v=>{ LIB.cat=v; drawGrid(); }),{className:"cat-slot"})); };
  const drawGrid=()=>{ grid.textContent="";
    const list=libFilter(D.media,{kinds:LIB.kind?[LIB.kind]:null,cat:LIB.cat,q:LIB.q,hidden:LIB.hidden});
    countEl.textContent=list.length+" of "+D.media.length+" items";
    if (!list.length) grid.append(h("p",{class:"adm-intro",text:"Nothing matches. Add files on GitHub (below), or change the filters."}));
    list.forEach(m=>grid.append(h("button",{class:"lib-card"+(m.id===Admin.sel.media?" on":"")+(m.hidden?" is-hidden":""),type:"button",onclick:()=>{ Admin.sel.media=m.id; drawGrid(); drawDetail(); det.scrollIntoView({behavior:"smooth",block:"nearest"}); }},
      h("div",{class:"thumb"},m.kind==="article"?docThumb(m):mediaThumb(m.id),m.kind==="article"?null:overlayEl(D,m.id)),
      h("div",{class:"meta"},h("span",{text:m.label}),h("small",{text:[{scene:"Scene",image:"Image",video:"Video",article:"Article"}[m.kind]||m.kind,categoryLabel(D,m.category)||"No category",m.path?"GitHub":m.url?"Supabase":""].filter(Boolean).join(" · ")+(libMissing(m)?" · file missing":"")})))));
  };
  const drawDetail=()=>{ det.textContent=""; const m=D.media.find(x=>x.id===Admin.sel.media); if (!m) return;
    const pv=h("div",{class:"ph",style:"aspect-ratio:16/9;max-width:560px"}); const redraw=()=>{ pv.textContent=""; const n=m.kind==="article"?docThumb(m):mediaNode(D,m.id,{w:960,hh:540}); if (n) pv.append(n); const ov=m.kind==="article"?null:overlayEl(D,m.id); if (ov) pv.append(ov); };
    const common=[["label","text",m.kind==="article"?"Title":"Name"],["category","category","Category"],["tags","strings","Tags (one per line)"]];
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
      h("div",{style:"display:flex;gap:10px;flex-wrap:wrap"},del)));
    if (m.kind!=="article") det.append(card("Colour overlay",h("p",{class:"adm-intro",text:"Lay a colour or gradient over this "+(m.kind==="video"?"video":"image")+" wherever it appears. The preview above updates as you change it."}),
      overlayEditor(m,"overlay",{allowDefault:true,onChange:()=>{ redraw(); drawGrid(); }})));
    redraw();
  };
  const draw=()=>{ drawFilters(); drawGrid(); drawDetail(); };
  body.append(bar,filters,countEl,grid,det,githubCard(),categoriesCard(()=>draw()));
  draw();
  syncLibrary(true).then(n=>{ if (n){ touch(); draw(); } });
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
  const used=id=>D.media.some(m=>m.category===id)||D.posts.some(p=>p.category===id);
  const draw=()=>{ rows.textContent="";
    D.categories.forEach((c,i)=>{ const inp=F(c,"label","text","Name"); inp.style.flex="1";
      rows.append(h("div",{class:"field wide",style:"flex-direction:row;align-items:center;gap:10px"},inp,h("code",{class:"mono",text:c.id}),
        used(c.id)?h("span",{class:"mono",text:"in use"}):h("button",{class:"btn sm danger",type:"button",text:"Remove",onclick:()=>{ D.categories.splice(i,1); touch(); draw(); onChange(); }}))); });
    const name=h("input",{type:"text",placeholder:"New category name","aria-label":"New category name"});
    rows.append(h("div",{class:"field wide",style:"flex-direction:row;gap:10px"},name,h("button",{class:"btn sm",type:"button",html:IC.plus+"Add category",onclick:()=>{ const id=slugify(name.value); if (!id||D.categories.some(c=>c.id===id)){ toast("Pick a new, different name."); return; } D.categories.push({id,label:name.value.trim()}); touch(); draw(); onChange(); toast("Added. Create its folder on GitHub from the list above."); }})));
  };
  draw();
  return card("Categories",h("p",{class:"adm-intro",text:"Categories sort the library and the blog. Each one matches a folder on GitHub with the name shown in grey; renaming here changes only the label."}),rows);
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

export { overlayEditor, LIB, syncLibrary, libFilter, categorySelect, githubCard, categoriesCard, panelBlog, proseField, panelMedia, slugify, prettyName, versionsCard, signInForm, notEditor, IC, PANELS, Admin, assetsApi, toast, touch, renderAdmin, updateTop, previewDraft, openPanel, F, fieldsFor, actionEditor, mediaThumb, mediaPicker, iconPicker, listEditor, subCard, confirmInline, sortable, card, masterDetail, idOk, panelSite, PALETTES, panelTheme, panelMotion, panelIcons, flowItemSchema, panelFlows, panelModals, panelPages };
