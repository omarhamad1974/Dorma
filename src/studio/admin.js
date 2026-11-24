import { LIBRARY_BASE, REPO_BRANCH, REPO_URL } from '../config';
import { TIMING_PARTS, $, $$, ARROW_SVG, applyTheme, categoryLabel, clone, esc, fmtDate, h, libPathOk, mediaNode, renderFlow, revealTitle, sanitizeSvg, uid } from './core';
import { gsap } from 'gsap';
import { Store, draftDiffers, listVersions, loadDraft, media, normalize, publishDraft, restoreVersion, route, scheduleSave, signIn, signOut, signedInEmail } from './store';
import { Site, closeModal, disposePage, openModal } from './site';
import { A, OPT, SECTION_BLANK, SECTION_TYPES, STARTER } from './data';
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
  replay:'<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.6"/><path d="M4 4v4.6h4.6"/></svg>'
};
const PANELS=[["site","Site and titles"],["theme","Colours and type"],["motion","Animation"],["media","Library"],["icons","Icons"],["flows","Flows"],["modals","Modals"],["pages","Pages"],["blog","Blog"]];
const Admin={ panel:"pages", sel:{}, refresh:null, liveChanged(){ updateTop(); } };
let assetsApi=null;

function toast(msg){ const t=h("div",{class:"toast",role:"status",text:msg}); document.body.append(t); gsap.fromTo(t,{y:20,autoAlpha:0},{y:0,autoAlpha:1,duration:.3}); setTimeout(()=>gsap.to(t,{autoAlpha:0,duration:.3,onComplete:()=>t.remove()}),2400); }
function touch(opts={}){ scheduleSave(); if (opts.theme) applyTheme(Store.draft); if (Admin.refresh) Admin.refresh(); updateTop(); }

let renderTok=0;
async function renderAdmin(){
  const tok=++renderTok;
  disposePage(); closeModal(true);
  const app=$("#app");
  if (!Store.canEdit){ app.textContent=""; app.append(Store.session?notEditor():signInForm()); return; }
  await loadDraft();
  if (tok!==renderTok) return; // a newer render started while the draft was loading
  app.textContent="";
  assetsApi=media();
  applyTheme(Store.draft); document.title="Studio · "+(Store.draft.site.brand||"Site");
  const side=h("nav",{class:"adm-side","aria-label":"Studio sections"},h("a",{class:"brand",href:"#"+Store.draft.site.homePage},h("span",{class:"mark"}),"Studio"));
  const mnav=h("div",{class:"adm-mobile-nav"});
  PANELS.forEach(([k,l])=>{
    side.append(h("button",{type:"button","data-p":k,class:Admin.panel===k?"on":"",html:IC[k]+esc(l),onclick:()=>openPanel(k)}));
    mnav.append(h("button",{type:"button","data-p":k,class:Admin.panel===k?"on":"",text:l,onclick:()=>openPanel(k)}));
  });
  side.append(h("div",{class:"grow"}),h("p",{class:"mono",style:"padding:0 10px;line-height:1.6;overflow-wrap:anywhere",html:Store.mode==="db"?"Signed in as<br>"+esc(signedInEmail()):"Saved in this<br>browser only"}),
    Store.mode==="db"?h("button",{type:"button",html:IC.x+"Sign out",onclick:async()=>{ await signOut(); route(); }}):"");
  const top=h("div",{class:"adm-top",id:"admTop"});
  const body=h("div",{class:"adm-body",id:"admBody"});
  app.append(h("div",{class:"adm"},side,h("div",{class:"adm-main"},top,mnav,body)));
  Store.listeners=[updateTop];
  openPanel(Admin.panel);
}
function updateTop(){
  const top=$("#admTop"); if (!top) return;
  const st=Store.status, label={saved:"Draft saved",pending:"Unsaved changes",saving:"Saving…",error:Store.statusMsg||"Couldn't save",published:"Published"}[st]||"Draft saved";
  const diff=draftDiffers();
  top.textContent="";
  top.append(h("h1",{text:(PANELS.find(p=>p[0]===Admin.panel)||[])[1]||"Studio"}),
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
  Admin.panel=k; Admin.refresh=null;
  $$(".adm-side button[data-p],.adm-mobile-nav button[data-p]").forEach(b=>b.classList.toggle("on",b.dataset.p===k));
  const body=$("#admBody"); if (!body) return; body.textContent=""; disposePage();
  ({site:panelSite,theme:panelTheme,motion:panelMotion,media:panelMedia,icons:panelIcons,flows:panelFlows,modals:panelModals,pages:panelPages,blog:panelBlog})[k](body);
  updateTop(); scrollTo(0,0);
}

/* ---------- generic field engine ---------- */
function F(obj,key,kind,label,opts={},onChange=()=>{}){
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
      t.addEventListener("input",()=>set(t.value)); wrap.append(t); break; }
    case "strings": {
      const t=h("textarea",{id,rows:3}); t.value=(obj[key]||[]).join("\n");
      t.addEventListener("input",()=>set(t.value.split("\n").map(s=>s.trim()).filter(Boolean))); wrap.append(t); break; }
    case "range": {
      const i=h("input",{id,type:"range",min:opts.min??0,max:opts.max??1,step:opts.step??.01,value:obj[key]??0}), o=h("output",{text:obj[key]});
      i.addEventListener("input",()=>{ o.textContent=i.value; set(+i.value,opts.theme?{theme:true}:undefined); }); wrap.append(h("div",{class:"range-row"},i,o)); break; }
    case "color": {
      const c=h("input",{id,type:"color",value:obj[key]||"#000000"}), t=h("input",{type:"text",value:obj[key]||"","aria-label":label+" hex"});
      c.addEventListener("input",()=>{ t.value=c.value; set(c.value,{theme:true}); });
      t.addEventListener("change",()=>{ if (/^#[\da-f]{6}$/i.test(t.value)){ c.value=t.value; set(t.value,{theme:true}); } else t.value=obj[key]; });
      wrap.append(h("div",{class:"color-row"},c,t)); break; }
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
    case "prose": wrap.classList.add("wide"); wrap.append(proseField(obj,key,id,v=>set(v))); break;
    case "media": wrap.append(mediaPicker(obj,key,opts,()=>{ onChange(obj[key]); touch(); })); lab.removeAttribute("for"); break;
    case "icon": wrap.append(iconPicker(obj,key,()=>{ onChange(obj[key]); touch(); })); lab.removeAttribute("for"); break;
    case "action": { obj[key]=obj[key]||A(); wrap.append(actionEditor(obj[key],()=>{ onChange(obj[key]); touch(); })); lab.removeAttribute("for"); break; }
    case "button": { obj[key]=obj[key]||{label:"",action:A()}; const b=obj[key];
      const i=h("input",{id,type:"text",value:b.label||"",placeholder:"Label (empty hides it)"}); i.addEventListener("input",()=>{ b.label=i.value; onChange(b); touch(); });
      wrap.append(i,actionEditor(b.action=b.action||A(),()=>{ onChange(b); touch(); })); wrap.classList.add("wide"); break; }
    case "timing": { lab.removeAttribute("for"); wrap.classList.add("wide"); obj[key]=obj[key]&&typeof obj[key]==="object"?obj[key]:{}; const T=obj[key];
      const g=h("div",{class:"timing-grid"});
      (opts.parts||[]).forEach(([k,def])=>{ const i=h("input",{type:"number",min:0,step:k==="duration"?.5:.05,value:T[k]??"",placeholder:def==null?"Auto":String(def),"aria-label":TIMING_PARTS[k]+" (seconds)"});
        i.addEventListener("input",()=>{ if (i.value==="") delete T[k]; else T[k]=Math.max(0,+i.value); onChange(T,key); touch(); });
        g.append(h("label",{class:"timing-cell"},h("span",{text:TIMING_PARTS[k]}),i)); });
      wrap.append(g); if (!opts.hint) wrap.append(h("span",{class:"hint",text:"Seconds from when this comes into view. Empty uses the default shown. Lower numbers come first, so you can change the order."})); break; }
    case "list": { lab.removeAttribute("for"); wrap.classList.add("wide"); wrap.append(listEditor(obj,key,opts,onChange)); break; }
  }
  if (opts.hint) wrap.append(h("span",{class:"hint",text:opts.hint}));
  return wrap;
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
  setTimeout(()=>$$("select,input",row).forEach(x=>x.style.cssText+=";padding:9px 11px;border-radius:7px;border:1px solid var(--faint);background:rgba(0,0,0,.25);color:var(--fg)"));
  return row;
}
function mediaThumb(id){ const n=mediaNode(Store.draft,id,{w:240,hh:180}); return n||h("span",{text:"Missing"}); }
function mediaPicker(obj,key,opts,onChange){
  const outer=h("div",{class:"media-pick-wrap"}), g=h("div",{class:"media-pick"}), st={cat:"",q:""};
  const pool=()=>libFilter(Store.draft.media,{kinds:["image","video","scene"]});
  if (pool().length>8){
    const q=h("input",{type:"search",placeholder:"Search","aria-label":"Search the library"}); q.addEventListener("input",()=>{ st.q=q.value; draw(); });
    outer.append(h("div",{class:"media-pick-filters"},categorySelect("",v=>{ st.cat=v; draw(); }),q));
  }
  const draw=()=>{ g.textContent="";
    if (opts.allowNone) g.append(h("button",{type:"button",class:"none"+(!obj[key]?" on":""),text:"None",onclick:()=>{ obj[key]=""; draw(); onChange(); }}));
    const list=libFilter(pool(),{cat:st.cat,q:st.q}); const cur=Store.draft.media.find(m=>m.id===obj[key]);
    if (cur && !list.includes(cur)) list.unshift(cur);
    list.forEach(m=>{ const b=h("button",{type:"button",class:obj[key]===m.id?"on":"",title:m.label,"aria-label":m.label},mediaThumb(m.id),h("span",{text:m.label}));
      b.addEventListener("click",()=>{ obj[key]=m.id; draw(); onChange(); }); g.append(b); }); };
  draw(); outer.append(g); return outer;
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
    arr.forEach((it,i)=>box.append(subCard(it,{title:()=>it[opts.title]||"Item "+(i+1),kind:opts.kindLabel?opts.kindLabel(it):"",open:false,
      body:()=>fieldsFor(it,opts.fields,onChange),onRemove:()=>{ arr.splice(i,1); draw(); onChange(); touch(); }})));
    box.append(h("button",{class:"btn sm",type:"button",html:IC.plus+"Add",onclick:()=>{ arr.push(opts.blank?opts.blank():{}); draw(); const last=box.children[box.children.length-2]; last&&last.classList.remove("closed"); onChange(); touch(); }}));
    sortable(box,arr,()=>{ draw(); onChange(); touch(); }); };
  draw(); return box;
}
function subCard(item,{title,kind,body,onRemove,open}){
  const card=h("div",{class:"sub-item"+(open?"":" closed")}), t=h("span",{class:"t",text:title()});
  const head=h("div",{class:"sub-head"},h("span",{class:"handle",html:IC.grip,"aria-hidden":"true"}),kind?h("span",{class:"k",text:kind}):null,t,
    h("button",{class:"x",type:"button","aria-label":"Remove",html:IC.x,onclick:e=>{ e.stopPropagation(); confirmInline(card,"Remove this item?",onRemove); }}));
  let built=false; const b=h("div",{class:"sub-body"});
  const build=()=>{ if (built) return; built=true; b.append(body()); b.addEventListener("input",()=>{ t.textContent=title(); }); b.addEventListener("change",()=>{ t.textContent=title(); }); };
  head.addEventListener("click",e=>{ if (e.target.closest(".handle")) return; card.classList.toggle("closed"); if (!card.classList.contains("closed")) build(); });
  if (open) build();
  card.append(head,b); card._open=()=>{ card.classList.remove("closed"); build(); };
  return card;
}
function confirmInline(anchor,msg,yes){
  const c=h("div",{class:"confirm"},h("span",{text:msg}),h("button",{class:"btn sm danger",type:"button",text:"Remove",onclick:()=>{ c.remove(); yes(); }}),h("button",{class:"btn sm",type:"button",text:"Keep",onclick:()=>c.remove()}));
  anchor.after(c);
}
function sortable(box,arr,onMove){
  if (!window.Sortable) return;
  Sortable.create(box,{handle:".handle",draggable:".sub-item",animation:180,ghostClass:"sortable-ghost",onEnd(e){ if (e.oldIndex===e.newIndex) return; const [m]=arr.splice(e.oldIndex,1); arr.splice(e.newIndex,0,m); onMove(); }});
}
function card(title,...kids){ return h("section",{class:"card-a"},h("h2",{},title),...kids); }
function masterDetail(body,{items,selKey,label,kind,onAdd,addLabel,detail}){
  const list=h("div",{class:"list",role:"list"}), det=h("div",{style:"display:flex;flex-direction:column;gap:20px;min-width:0"});
  const draw=()=>{ list.textContent="";
    if (!items().some(x=>x.id===Admin.sel[selKey])) Admin.sel[selKey]=items()[0]?.id;
    items().forEach(x=>list.append(h("button",{class:"li"+(x.id===Admin.sel[selKey]?" on":""),type:"button",onclick:()=>{ Admin.sel[selKey]=x.id; draw(); }},label(x),kind?h("small",{text:kind(x)}):null)));
    if (onAdd) list.append(h("button",{class:"btn sm",type:"button",style:"margin-top:6px",html:IC.plus+esc(addLabel),onclick:()=>{ const n=onAdd(); Admin.sel[selKey]=n.id; touch(); draw(); }}));
    det.textContent=""; const cur=items().find(x=>x.id===Admin.sel[selKey]); if (cur) det.append(...[].concat(detail(cur,draw)));
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
  body.append(card("Logo",h("p",{class:"adm-intro",text:"The logo in the site header. Leave the image on None to use the built-in white Dorma logo, or pick any image from the Library (a transparent PNG or SVG with light colours works best on the dark header)."}),
    fieldsFor(D.site,[["logoMode","select","Header shows",{options:[["image","Logo image"],["text","Brand name as text"]]}],["logoHeight","range","Logo height (px)",{min:20,max:64,step:1}],["logo","media","Logo image (None uses the white Dorma logo)",{allowNone:true}]])));
  body.append(loaderCard());
  const titles=h("div",{class:"fields"});
  D.pages.forEach(p=>{ titles.append(F(p,"title","text",p.id+" · title")); titles.append(F(p,"nav","toggle","Show "+(p.title||p.id)+" in menu")); });
  body.append(card("Page titles",titles));
  body.append(card("Backup",h("p",{class:"adm-intro",text:"Copy every setting as text to keep a backup, or paste a backup to replace the draft."}),
    h("div",{style:"display:flex;gap:10px;flex-wrap:wrap"},
      h("button",{class:"btn",type:"button",text:"Copy settings",onclick:async()=>{ const s=JSON.stringify(Store.draft); try { await navigator.clipboard.writeText(s); toast("Settings copied"); } catch(e){ area.value=s; area.select(); toast("Select all and copy the text below"); } }}),
      h("button",{class:"btn",type:"button",text:"Replace draft with pasted settings",onclick:()=>{ try { const c=JSON.parse(area.value); Store.draft=normalize(c); touch({theme:true}); toast("Draft replaced"); openPanel("site"); } catch(e){ toast("That text isn't a valid settings backup."); } }}),
      h("button",{class:"btn",type:"button",text:"Discard draft changes",onclick:e=>confirmInline(e.currentTarget.parentNode,"Go back to the live version?",()=>{ Store.draft=clone(Store.live); touch({theme:true}); openPanel("site"); })}),
      h("button",{class:"btn danger",type:"button",text:"Reset to starter template",onclick:e=>confirmInline(e.currentTarget.parentNode,"Replace the draft with the starter template?",()=>{ Store.draft=clone(STARTER); touch({theme:true}); openPanel("site"); })})),
    (area=h("textarea",{class:"code","aria-label":"Settings text",rows:4,style:"width:100%;padding:10px;border-radius:7px;border:1px solid var(--faint);background:rgba(0,0,0,.25);font-family:var(--mono);font-size:.74rem"}))));
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
  const prev=h("div",{class:"preview-box"}); const drawPrev=()=>{ prev.textContent=""; const d=h("div",{class:"txt",style:"gap:14px"},h("p",{class:"eyebrow",html:"<b>01</b> Preview"}),h("h3",{class:"display",style:"font-size:clamp(2rem,4vw,3.4rem)",text:"See further than the map"}),h("p",{class:"lede",text:"Body text in the chosen font and muted colour."}));
    const fl=renderFlow(Store.draft,(Store.draft.flows[0]||{}).id); if (fl){ fl.setActive(0,{fill:true}); d.append(fl.el); } d.append(h("button",{class:"more",type:"button",html:"More"+ARROW_SVG})); prev.append(d,h("span",{class:"lbl-a",text:"Live preview"})); };
  Admin.refresh=drawPrev; drawPrev();
  body.append(card("Preset palettes",sw),card("Preview",prev),
    card("Colours",fieldsFor(T,[["accent","color","Accent"],["ink","color","Background"],["panel","color","Panels"],["fg","color","Text"],["mutedOpacity","range","Secondary text strength",{min:.3,max:1,step:.01,theme:true}],["lineOpacity","range","Line strength",{min:.04,max:.4,step:.01,theme:true}]])),
    card("Type",fieldsFor(T,[["display","select","Headings",{options:OPT.fonts,theme:true}],["body","select","Body",{options:OPT.fonts,theme:true}],["mono","select","Labels",{options:OPT.monos,theme:true}],["radius","range","Corner radius",{min:0,max:16,step:1,theme:true}]])),
    card("Image treatment",fieldsFor(T,[["imageBrightness","range","Image brightness",{min:.3,max:1.1,step:.01,theme:true}],["overlay","range","Dark overlay on heroes",{min:0,max:1.4,step:.01,theme:true}],["grain","toggle","Film grain on heroes",{theme:true}]])));
}
function panelMotion(body){
  const M=Store.draft.motion;
  const prev=h("div",{class:"preview-box",style:"flex-direction:column;align-items:flex-start;gap:18px"});
  const play=()=>{ prev.textContent=""; gsap.globalTimeline.timeScale(+M.speed||1); const t=h("h3",{class:"display",style:"font-size:clamp(2rem,4.5vw,3.6rem)"}); prev.append(t,h("span",{class:"lbl-a",text:"Title reveal"})); revealTitle(Store.draft,t,"Ship it into the light",.1);
    const fl=renderFlow(Store.draft,(Store.draft.flows[0]||{}).id); if (fl){ prev.append(fl.el); fl.play(.3); } };
  Admin.refresh=play; play();
  body.append(card(h("span",{},"Preview"),prev,h("button",{class:"btn sm",type:"button",style:"align-self:flex-start",html:IC.replay+"Replay",onclick:play})),
    card("Global",fieldsFor(M,[["speed","range","Overall speed",{min:.4,max:2,step:.05}],["ease","select","Easing",{options:OPT.ease}],["titleReveal","select","Title reveal",{options:OPT.titleReveal}],["scrollReveal","select","Sections on scroll",{options:OPT.scrollReveal}],["counters","toggle","Count numbers up"],["parallax","toggle","Mouse parallax on heroes"]])),
    card("Hero carousel",fieldsFor(M,[["transition","select","Slide transition",{options:OPT.transition}],["slideDuration","range","Seconds per slide",{min:3,max:15,step:.5}],["kenBurns","toggle","Slow cinematic zoom"],["kbZoom","range","Zoom amount",{min:1,max:1.4,step:.01}],["kbDuration","range","Zoom duration (s)",{min:4,max:24,step:1}]])),
    card("Modals",fieldsFor(M,[["modalOpen","select","Opening style",{options:OPT.modalOpen}]])),
    h("p",{class:"adm-intro",text:"Each flow also has its own animation settings, under Flows."}));
}
function panelIcons(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"Icons can be used in flows, buttons and text items. Paste any SVG code; scripts, links and styles are stripped automatically. Icons draw with the current text colour."}));
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
  body.append(h("p",{class:"adm-intro",text:"A flow is a row of items separated by small marks. Draw it from buttons, plain text, icons or your own SVG, then choose how it animates: as one piece or item by item, with optional settings per item. Any page section or Type 3 modal can use a flow."}));
  masterDetail(body,{items:()=>D.flows,selKey:"flows",label:f=>f.name||f.id,kind:f=>f.items.length+" items",addLabel:"New flow",
    onAdd:()=>{ const f={id:uid("f"),name:"New flow",separator:"dots3",size:"m",progress:false,anim:{mode:"items",preset:"rise",duration:.8,stagger:.06,delay:0},items:[{id:uid("x"),kind:"button",label:"First",icon:"",svg:"",showIndex:true,detail:"",action:A(),anim:null}]}; D.flows.push(f); return f; },
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
        card("Animation",fieldsFor(f.anim,[["mode","select","Animate",{options:[["group","The whole flow at once"],["items","Each item in turn"]]}],["preset","select","Animation",{options:OPT.presets}],["duration","range","Duration (s)",{min:.1,max:3,step:.05}],["stagger","range","Gap between items (s)",{min:0,max:.6,step:.01}],["delay","range","Start delay (s)",{min:0,max:3,step:.05}]]),
          h("p",{class:"adm-intro",style:"font-size:.8rem",text:"Items with their own animation keep their settings in either mode when animating item by item."})),
        card("Items · drag to reorder",items),
        h("div",{},h("button",{class:"btn danger sm",type:"button",text:"Delete flow",onclick:e=>confirmInline(e.currentTarget,"Delete this flow? Sections using it will show no flow.",()=>{ D.flows.splice(D.flows.indexOf(f),1); touch(); openPanel("flows"); })}))
      ];
    }});
}
function panelModals(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"Type 1 shows one image or video with a caption. Type 2 shows a gallery of three. Type 3 adds a flow whose items reveal detail text. Every type has a More button. Open a modal from any flow item, card or button with the action \"Open modal\"."}));
  masterDetail(body,{items:()=>D.modals,selKey:"modals",label:m=>m.name||m.title,kind:m=>"Type "+m.type,addLabel:"New modal",
    onAdd:()=>{ const m={id:uid("md"),name:"New modal",type:1,kicker:"",title:"New modal",text:"",media:[D.media[0]?.id||""],caption:[],flowId:"",more:{label:"More",action:A()}}; D.modals.push(m); return m; },
    detail:(m,redrawList)=>{
      const mediaBoxEl=h("div");
      const drawMedia=()=>{ mediaBoxEl.textContent=""; const n=m.type===2?3:1; m.media=m.media||[]; while (m.media.length<n) m.media.push(D.media[m.media.length%D.media.length]?.id||"");
        const f=h("div",{class:"fields"}); for (let k=0;k<n;k++) f.append(F(m.media,k,"media",n>1?"Gallery item "+(k+1):"Image or video",{wide:true})); mediaBoxEl.append(f); };
      drawMedia();
      const base=[["name","text","Name in the studio"],["type","select","Type",{options:OPT.modalTypes}],["kicker","text","Small label"],["title","text","Title",{wide:true}],["text","area","Short paragraph",{wide:true}],["caption","strings",m.type===2?"Captions, one per gallery item":"Caption items, one per line (shown with the flow separators)",{wide:true}]];
      if (m.type===3) base.push(["flowId","flow","Flow inside the modal"]);
      base.push(["timing","timing","Timing",{parts:m.type===3?[["eyebrow",.75],["title",.81],["text",.87],["flow",1],["detail",.93],["media",.99],["more",1.05]]:[["eyebrow",.75],["title",.81],["text",.87],["media",.93],["more",.99]],hint:"Seconds from when the modal starts opening. Empty uses the default shown. Lower numbers come first."}]);
      return [
        card(h("span",{class:"grow"},"Content"),h("button",{class:"btn sm",type:"button",html:IC.eye+"Preview modal",onclick:()=>openModal(D,m.id)}),fieldsFor(m,base,(v,k)=>{ if (k==="type"){ openPanel("modals"); } else redrawList(); })),
        card("Media",mediaBoxEl), card("More button",h("div",{class:"fields"},F(m,"more","button","More button"))),
        h("div",{},h("button",{class:"btn danger sm",type:"button",text:"Delete modal",onclick:e=>confirmInline(e.currentTarget,"Delete this modal?",()=>{ D.modals.splice(D.modals.indexOf(m),1); touch(); openPanel("modals"); })}))
      ];
    }});
}
function panelPages(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"Each page is a stack of sections. Pick a layout, add sections and drag them into order. Preview draft shows the page you have selected."}));
  masterDetail(body,{items:()=>D.pages,selKey:"pages",label:p=>p.title||p.id,kind:p=>p.id===D.site.homePage?"Home":(OPT.layouts.find(l=>l[0]===p.layout)||[])[1],addLabel:"New page",
    onAdd:()=>{ let n=1; while (D.pages.some(p=>p.id==="page-"+n)) n++; const p={id:"page-"+n,title:"New page",nav:true,layout:"cinematic",sections:[{id:uid("s"),type:"hero",...SECTION_BLANK.hero()}]}; D.pages.push(p); return p; },
    detail:(p,redrawList)=>{
      const slug=h("input",{type:"text",value:p.id,id:uid("f")}), slugHint=h("span",{class:"hint",text:"Used in the address after #. Lowercase letters, numbers and hyphens."});
      slug.addEventListener("change",()=>{ const v=slug.value.trim(); if (!idOk(v,D.pages,p)){ slugHint.textContent="That address is taken or not allowed."; slugHint.style.color="var(--bad)"; slug.value=p.id; return; }
        const old=p.id; p.id=v; if (D.site.homePage===old) D.site.homePage=v;
        const fix=a=>{ if (a&&a.type==="page"&&a.target===old) a.target=v; }; JSON.stringify(D,(k,val)=>{ if (val&&typeof val==="object"&&val.type==="page") fix(val); return val; });
        Admin.sel.pages=v; slugHint.style.color=""; slugHint.textContent="Address updated."; touch(); redrawList(); });
      const meta=fieldsFor(p,[["title","text","Title"],["layout","select","Layout",{options:OPT.layouts}],["nav","toggle","Show in menu"]],()=>redrawList());
      meta.prepend(h("div",{class:"field"},h("label",{for:slug.id,text:"Address"}),slug,slugHint));
      const secs=h("div",{class:"sub-list"});
      const drawSecs=()=>{ secs.textContent="";
        p.sections.forEach((s,i)=>{ const T=SECTION_TYPES[s.type]; if (!T) return;
          secs.append(subCard(s,{title:()=>s.title||s.eyebrow||(s.slides&&s.slides[0]&&s.slides[0].title)||T.label,kind:T.label,open:false,body:()=>fieldsFor(s,T.fields),onRemove:()=>{ p.sections.splice(i,1); drawSecs(); touch(); }})); });
        const sel=h("select",{"aria-label":"Section type",style:"padding:8px 10px;border-radius:7px;border:1px solid var(--faint);background:rgba(0,0,0,.25);color:var(--fg)"}); Object.entries(SECTION_TYPES).forEach(([k,v])=>sel.append(h("option",{value:k,text:v.label})));
        secs.append(h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},sel,h("button",{class:"btn sm",type:"button",html:IC.plus+"Add section",onclick:()=>{ p.sections.push({id:uid("s"),type:sel.value,...SECTION_BLANK[sel.value]()}); drawSecs(); secs.children[secs.children.length-2]?._open?.(); touch(); }})));
        sortable(secs,p.sections,()=>{ drawSecs(); touch(); });
      };
      drawSecs();
      return [
        card(h("span",{class:"grow"},"Page"),h("button",{class:"btn sm",type:"button",html:IC.eye+"Preview page",onclick:previewDraft}),meta),
        card("Sections · drag to reorder",secs),
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
const slugify=s=>String(s||"").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60);
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
    h("button",{class:"btn",type:"button",html:IC.plus+"Add generated scene",onclick:()=>{ const m={id:uid("m"),label:"New scene",kind:"scene",scene:"nebula",fx:.5,fy:.5,zoom:1,category:LIB.cat||"backgrounds",tags:[]}; D.media.push(m); Admin.sel.media=m.id; touch(); draw(); }}),up);
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
      h("div",{class:"thumb"},m.kind==="article"?docThumb(m):mediaThumb(m.id)),
      h("div",{class:"meta"},h("span",{text:m.label}),h("small",{text:[{scene:"Scene",image:"Image",video:"Video",article:"Article"}[m.kind]||m.kind,categoryLabel(D,m.category)||"No category",m.path?"GitHub":m.url?"Supabase":""].filter(Boolean).join(" · ")+(libMissing(m)?" · file missing":"")})))));
  };
  const drawDetail=()=>{ det.textContent=""; const m=D.media.find(x=>x.id===Admin.sel.media); if (!m) return;
    const pv=h("div",{class:"ph",style:"aspect-ratio:16/9;max-width:560px"}); const redraw=()=>{ pv.textContent=""; const n=m.kind==="article"?docThumb(m):mediaNode(D,m.id,{w:960,hh:540}); if (n) pv.append(n); };
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
    D.categories.forEach((c,i)=>{ const inp=h("input",{type:"text",value:c.label,"aria-label":"Category name"}); inp.addEventListener("input",()=>{ c.label=inp.value; touch(); });
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
  body.append(h("p",{class:"adm-intro",text:"Write posts here. Published posts appear on every page that has a Blog posts section"+(onPage?" (now: "+onPage.title+")":"; add one under Pages")+", newest first, each at its own address. Drafts are only visible in Preview draft."}));
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
function proseField(obj,key,id,set){
  const t=h("textarea",{id,class:"prose-edit",rows:16}); t.value=obj[key]??"";
  t.addEventListener("input",()=>set(t.value));
  const pick=h("select",{"aria-label":"Insert from library"}); pick.append(h("option",{value:"",text:"Insert image or video from the library…"}));
  libFilter(Store.draft.media,{kinds:["image","video","scene"]}).forEach(m=>pick.append(h("option",{value:m.id,text:(categoryLabel(Store.draft,m.category)?categoryLabel(Store.draft,m.category)+" · ":"")+m.label})));
  pick.addEventListener("change",()=>{ if (!pick.value) return; const ins="\n\n[["+pick.value+"|]]\n\n", a=t.selectionStart??t.value.length; t.value=t.value.slice(0,a)+ins+t.value.slice(a); pick.value=""; set(t.value); t.focus(); });
  return h("div",{class:"prose-wrap"},t,h("div",{class:"prose-tools"},pick,h("span",{class:"hint",text:"Empty line = new paragraph · ## Heading · - list item · > quote · **bold** · *italic* · [text](https://…)"})));
}

export { LIB, syncLibrary, libFilter, categorySelect, githubCard, categoriesCard, panelBlog, proseField, panelMedia, slugify, prettyName, versionsCard, signInForm, notEditor, IC, PANELS, Admin, assetsApi, toast, touch, renderAdmin, updateTop, previewDraft, openPanel, F, fieldsFor, actionEditor, mediaThumb, mediaPicker, iconPicker, listEditor, subCard, confirmInline, sortable, card, masterDetail, idOk, panelSite, PALETTES, panelTheme, panelMotion, panelIcons, flowItemSchema, panelFlows, panelModals, panelPages };
