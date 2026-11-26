/* Import content from Markdown files: blog posts, pages and sections, flows, modals, library items, colours and icons.
   Every template in public/templates/ uses the same shape as the carousel slides file:
     - Anything before the first line of three dashes (---) is notes and is skipped.
     - Each block after a --- is one thing (a post, a page, a section, a flow…), written as "Key: value" lines.
     - A key with nothing after the colon can be followed by a list ("- " lines), or by free text for Body.
     - Arabic text goes on a line of its own: "Title (Arabic): …".
     - Lines starting with ">" are comments.
   build(cfg, text, opts) changes cfg and reports what it did, so the studio runs it on a copy for the preview
   and on the draft for the real import. Pure functions, no DOM: easy to test. */
import { parseFlowLine, resolveImage, parseSlidesMd, applySlidesImport } from './mdslides';
import { OPT, SECTION_TYPES, SECTION_BLANK, A } from './data';

const rid = () => Math.random().toString(36).slice(2,8);
const norm = s => String(s??"").toLowerCase().replace(/[’'`]/g,"").replace(/[\s_]+/g," ").replace(/\s*:\s*$/,"").trim();
const slug = (s,n=40) => String(s||"").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/&/g," and ").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,n);
const bi = (en,ar) => ar ? { en:en||"", ar } : (en||"");
const plainTx = v => v && typeof v==="object" && !Array.isArray(v) ? (v.en||v.ar||"") : String(v??"");
const YES = /^(yes|y|true|on|1|show|shown|published|visible)$/i, NO = /^(no|n|false|off|0|hide|hidden|draft)$/i;
const RESERVED = ["admin","settings","sidebar","customize","upgrade","downloads","post"];

/* ---------- reading the file ---------- */
/** Splits the file into blocks (text after each --- line). */
function splitBlocks(text){
  const src = String(text||"").replace(/\r\n?/g,"\n").replace(/^﻿/,"");
  const parts = src.split(/^\s*-{3,}\s*$/m);
  return parts.length<2 ? null : parts.slice(1);
}
const ARABIC = /\s*(\(arabic\)|\barabic\b|\bar\b)\s*/;
/** Reads one block into entries [{key, value, items:[{text, sub:[]}], raw:[]}].
    known(key, first) says whether "key" is a setting here (first = the block's first entry, or null).
    rawKeys: keys whose text keeps its lines as written (Body). */
function parseBlock(block,{known=()=>true,rawKeys=new Set()}={}){
  const entries=[], warnings=[]; let cur=null, fence=false, raw=false;
  const isRaw=typeof rawKeys==="function"?k=>rawKeys(k,entries[0]||null):k=>rawKeys.has(k);
  const keyOf=line=>{ const m=line.match(/^(?:#+\s*)?([A-Za-z؀-ۿ][^:]{0,60}?)\s*:\s*(.*)$/); return m && !/^https?$|^mailto$|^tel$/i.test(m[1]) ? [norm(m[1]),m[2].trim()] : null; };
  for (const line0 of block.split("\n")){
    const line=line0.replace(/\s+$/,"");
    if (raw){ const k=!/^\s/.test(line)&&keyOf(line); if (k && isRaw(k[0]) && !k[1]){ cur={key:k[0],value:"",items:[],raw:[],isRaw:true}; entries.push(cur); continue; } cur.raw.push(line); continue; }
    if (fence){ if (/^\s*```/.test(line)) fence=false; else cur.raw.push(line); continue; }
    if (!line.trim() || /^\s*>/.test(line) || /^\s*<!--.*-->\s*$/.test(line)) continue;
    if (/^\s*```/.test(line) && cur){ fence=true; cur.fenced=true; continue; }
    const k=!/^\s/.test(line) && keyOf(line);
    if (k && known(k[0], entries[0]||null)){ cur={key:k[0],value:k[1],items:[],raw:[]}; entries.push(cur); if (isRaw(k[0]) && !k[1]){ raw=true; cur.isRaw=true; } continue; }
    const b=line.match(/^(\s*)[-*+]\s+(.*)$/);
    if (b && cur){ const ind=b[1].replace(/\t/g,"  ").length;
      if (ind<2 || !cur.items.length) cur.items.push({text:b[2].trim(),sub:[]}); else cur.items[cur.items.length-1].sub.push("- "+b[2].trim()); continue; }
    if (cur && cur.items.length && /^\s/.test(line)){ cur.items[cur.items.length-1].sub.push(line.trim()); continue; }
    if (cur && !cur.items.length){ cur.value=(cur.value+" "+line.trim()).trim(); continue; }
    warnings.push(`Skipped a line it didn't understand: "${line.trim().slice(0,60)}"`);
  }
  entries.forEach(e=>{ if (e.raw.length){ const t=e.raw.join("\n").replace(/^\n+|\s+$/g,""); e.value=e.value?e.value+"\n"+t:t; } });
  return { entries, warnings };
}
/** Reads the "Key: value" lines inside one list item (indented lines under "- "). */
function parseItem(item,known){
  const entries=[]; let cur=null;
  const first=item.text.match(/^([A-Za-z][^:]{0,40}?)\s*:\s*(.*)$/);
  const lines=[...(first&&known(norm(first[1]))?[item.text]:[]), ...item.sub];
  const head=first&&known(norm(first[1]))?null:item.text;
  lines.forEach(l=>{
    const b=l.match(/^[-*+]\s+(.*)$/);
    if (b && cur){ cur.items.push({text:b[1].trim(),sub:[]}); return; }
    const m=l.match(/^([A-Za-z][^:]{0,40}?)\s*:\s*(.*)$/);
    if (m && known(norm(m[1]))){ cur={key:norm(m[1]),value:m[2].trim(),items:[],raw:[]}; entries.push(cur); return; }
    if (cur) cur.value=(cur.value+" "+l).trim();
  });
  return { head, entries };
}

/* ---------- matching keys to settings ---------- */
/** Names a setting answers to: its key, its label, and the label without the part in brackets. */
function names(f){
  const [key,,label,o]=f, out=new Set([norm(key)]);
  if (label){ out.add(norm(label)); out.add(norm(String(label).replace(/\s*\(.*?\)\s*/g," "))); }
  (o&&o.aka||[]).forEach(a=>out.add(norm(a)));
  if (/Id$/.test(key)) out.add(norm(key.replace(/Id$/,"")));
  [...out].forEach(n=>{ const bare=n.replace(/[^a-z0-9\u0600-\u06ff ]+/g,"").replace(/\s+/g," ").trim(); if (bare) out.add(bare); const short=bare.replace(/^this (slides |carousels )?/,""); if (short) out.add(short); });
  return out;
}
const arNames = f => new Set([...names(f)].flatMap(n=>[n+" (arabic)",n+" arabic",n+" ar","arabic "+n]));
const TEXTY = new Set(["text","area","prose","strings"]);
function keyTest(fields){
  const all=new Set(); fields.forEach(f=>{ names(f).forEach(n=>all.add(n)); if (TEXTY.has(f[1])) arNames(f).forEach(n=>all.add(n)); });
  return k=>all.has(k);
}
const findEntry=(entries,set)=>entries.find(e=>set.has(e.key));
/** The settings a block actually wrote (so an update leaves the others alone). */
const present=(entries,fields)=>fields.filter(f=>findEntry(entries,names(f))||(TEXTY.has(f[1])&&findEntry(entries,arNames(f)))).map(f=>f[0]);
const assignGiven=(target,src,keys)=>keys.forEach(k=>{ if (src[k]!==undefined) target[k]=src[k]; });

/* ---------- turning values into settings ---------- */
function findBy(list,ref,keys){ const r=norm(ref); if (!r) return null; return (list||[]).find(x=>x.id===ref) || (list||[]).find(x=>keys.some(k=>norm(plainTx(x[k]))===r)) || null; }
/** Points modal/page/post/doc actions written with a name at the right id. */
function fixAction(cfg,a){
  if (!a || !a.target) return a;
  const pool={modal:[cfg.modals,["name","title"]],page:[cfg.pages,["title"]],post:[cfg.posts,["slug","title"]],doc:[(cfg.media||[]).filter(m=>m.kind==="article"),["label"]]}[a.type];
  if (pool){ const x=findBy(pool[0],a.target,pool[1]); if (x) a.target=x.id; }
  return a;
}
const actionOf=(cfg,target)=>{ const t=String(target||"").trim(); if (!t) return A(); return fixAction(cfg,{...parseFlowLine(`- [x](${t})`).action}); };
function buttonOf(cfg,v){
  const m=String(v||"").trim().match(/^\[([^\]]+)\]\(\s*([^)\s]*)\s*\)$/);
  if (!m) return { label:labelOf(v), action:A() };
  return { label:labelOf(m[1]), action:actionOf(cfg,m[2]) };
}
const labelOf=raw=>{ const [en,ar]=String(raw||"").split(/\s+\|\s+/); return bi((en||"").trim(),(ar||"").trim()); };
function listOf(e){ if (!e) return []; if (e.items.length) return e.items.map(i=>i.text).filter(Boolean); const v=e.value.trim(); if (!v) return []; return v.split(v.includes("|")?/\s*\|\s*/:/\s*,\s*/).filter(Boolean); }
/** A new flow from "- [Label](target)" lines. Each line can have "Detail:" and "Icon:" lines under it. */
function flowFromItems(cfg,items,name){
  const fid="f-"+(slug(name,20)||"flow")+"-"+rid();
  const f={ id:fid, name, separator:"dots3", size:"m", progress:false, anim:{ ...(cfg.motion&&cfg.motion.flow||{ mode:"items", preset:"rise", duration:.8, stagger:.06, delay:0 }) }, custom:{ anim:false, colors:false }, colors:{},
    items:items.map((it,j)=>flowItem(cfg,it,j)).filter(Boolean) };
  (cfg.flows=cfg.flows||[]).push(f); return f;
}
function flowItem(cfg,it,j){
  const p=parseFlowLine("- "+it.text); if (!p) return null;
  const sub={}; it.sub.forEach(l=>{ const m=l.match(/^([A-Za-z][^:]{0,30}?)\s*:\s*(.*)$/); if (m) sub[norm(m[1])]=m[2].trim(); });
  const icon=sub.icon?findBy(cfg.icons,sub.icon,["label"]):null;
  let kind=p.kind; const k=norm(sub.type||sub.kind||""); if (/^(text|plain)/.test(k)) kind="text"; else if (/^icon/.test(k)) kind="icon"; else if (/^button/.test(k)) kind="button";
  return { id:"i"+(j+1)+rid().slice(0,3), kind, label:p.label, icon:icon?icon.id:"", svg:"", showIndex:YES.test(sub.number||sub["show number"]||""), detail:bi(sub.detail||"",sub["detail (arabic)"]||""), action:fixAction(cfg,p.action), anim:null };
}
/** Sets obj[field] from the matching entry. Returns a warning or "". ctx: {cfg, knownPaths, name, counts}. */
function setField(obj,f,entries,ctx){
  const [key,kind,label,o={}]=f, e=findEntry(entries,names(f)), ar=TEXTY.has(kind)?findEntry(entries,arNames(f)):null;
  if (!e && !ar) return "";
  const v=e?e.value:"", cfg=ctx.cfg, lab=String(label||key).replace(/\s*\(.*?\)\s*/g," ").trim();
  switch(kind){
    case "text": case "area": case "prose": obj[key]=bi(v,ar&&ar.value); return "";
    case "strings": { const en=listOf(e), a=listOf(ar); obj[key]=a.length?{en,ar:a}:en; return ""; }
    case "number": case "range": { if (v==="") return ""; const n=parseFloat(v); if (isNaN(n)) return `"${lab}: ${v}" is not a number, so it was skipped.`; obj[key]=o.max!=null?Math.min(+o.max,Math.max(+(o.min??0),n)):n; return ""; }
    case "toggle": if (YES.test(v)) obj[key]=true; else if (NO.test(v)) obj[key]=false; else if (v) return `"${lab}" should be yes or no.`; return "";
    case "select": { if (!v) return ""; const opts=(o.options||[]).map(x=>Array.isArray(x)?x:[x,x]);
      const hit=opts.find(([val])=>norm(val)===norm(v))||opts.find(([,l])=>norm(l)===norm(v))||opts.find(([,l])=>norm(l).startsWith(norm(v)));
      if (!hit) return `"${lab}: ${v}" isn't one of the choices (${opts.map(x=>x[1]).join(", ")}).`; obj[key]=hit[0]; return ""; }
    case "date": { if (!v) return ""; const d=/^\d{4}-\d{2}-\d{2}$/.test(v)?v:(isNaN(Date.parse(v))?"":new Date(Date.parse(v)).toISOString().slice(0,10)); if (!d) return `"${lab}: ${v}" isn't a date (use 2026-11-25).`; obj[key]=d; return ""; }
    case "flow": {
      if (e && e.items.length){ obj[key]=flowFromItems(cfg,e.items,(ctx.name||"Imported")).id; ctx.counts.flows=(ctx.counts.flows||0)+1; return ""; }
      if (!v){ obj[key]=""; return ""; } const x=findBy(cfg.flows,v,["name"]); if (!x) return `No flow called "${v}". Add it under Flows or write its items as a list.`; obj[key]=x.id; return ""; }
    case "modal": case "page": { if (!v){ obj[key]=""; return ""; } const x=findBy(kind==="modal"?cfg.modals:cfg.pages,v,["name","title"]); if (!x) return `No ${kind} called "${v}".`; obj[key]=x.id; return ""; }
    case "category": { if (!v){ obj[key]=""; return ""; } obj[key]=categoryOf(cfg,v,ctx); return ""; }
    case "media": { if (!v){ if (o.allowNone) obj[key]=""; return ""; } const id=mediaOf(cfg,v,ctx); if (!id) return `Image "${v}" isn't in the Library yet, so the default is kept. Add it to the Library and import again, or pick it later.`; obj[key]=id; return ""; }
    case "button": obj[key]=buttonOf(cfg,v); return "";
    case "action": obj[key]=actionOf(cfg,v); return "";
    case "list": {
      if (!e || !e.items.length) return "";
      const sub=o.fields||[], test=keyTest(sub), titleF=sub.find(x=>x[0]===o.title)||sub[0];
      const out=e.items.map(it=>{ const item=o.blank?o.blank():{}, p=parseItem(it,test);
        if (p.head && titleF) p.entries.unshift({key:[...names(titleF)][0],value:p.head,items:[],raw:[]});
        sub.forEach(sf=>{ const w=setField(item,sf,p.entries,{...ctx,name:(ctx.name||"")+" · "+plainTx(item[o.title]||"")}); if (w) ctx.warn(w); });
        return item; });
      obj[key]=out; return ""; }
    default: return `"${lab}" is set in the studio, so it was skipped.`;
  }
}
function categoryOf(cfg,v,ctx){
  cfg.categories=cfg.categories||[];
  const hit=findBy(cfg.categories,v,["label"]); if (hit) return hit.id;
  const id=slug(v); if (!id) return ""; if (!cfg.categories.some(c=>c.id===id)){ cfg.categories.push({id,label:v.trim()}); ctx.counts.categories=(ctx.counts.categories||0)+1; }
  return id;
}
function mediaOf(cfg,ref,ctx){
  const r=resolveImage(cfg,ref,{knownPaths:ctx.knownPaths});
  if (r.id) return r.id;
  if (r.add){ const id="m-"+(slug(r.add.label,20)||"img")+"-"+rid(); (cfg.media=cfg.media||[]).push({ id, tags:[], alt:"", ...r.add }); ctx.counts.media=(ctx.counts.media||0)+1; return id; }
  return "";
}

/* ---------- the content types ---------- */
const uniqueId=(base,taken,max=30)=>{ let id=base.slice(0,max)||"item", n=2; while (taken(id)) id=(base.slice(0,max-3)+"-"+n++); return id; };
/** Runs fn over every block with a fresh warning list; collects records for the preview. */
function eachBlock(text,parse,fn){
  const blocks=splitBlocks(text); if (!blocks) return { records:[], warnings:["Nothing to import. Start each item with a line of three dashes (---), as in the template."] };
  const records=[], warnings=[];
  blocks.forEach((b,i)=>{ const p=parse(b); if (!p.entries.length) return; const w=[...p.warnings]; const r=fn(p.entries,w,i); if (r){ r.warnings=[...(r.warnings||[]),...w]; records.push(r); } });
  if (!records.length) warnings.push("No items found after the --- lines.");
  return { records, warnings };
}
const ctxFor=(cfg,opts,counts,w)=>({ cfg, knownPaths:opts.knownPaths??null, counts, warn:m=>w.push(m) });
const fill=(obj,fields,entries,ctx,w)=>fields.forEach(f=>{ const m=setField(obj,f,entries,ctx); if (m) w.push(m); });
const unknownKeys=(entries,test,w,what)=>entries.forEach(e=>{ if (!test(e.key)) w.push(`"${e.key}" isn't a ${what} setting, so it was skipped.`); });

/* Blog posts */
const POST_FIELDS=[["title","text","Title"],["slug","text","Address",{aka:["slug","url"]}],["date","date","Date"],["published","toggle","Published"],["category","category","Category"],["author","text","Author"],
  ["tags","strings","Tags"],["cover","media","Cover",{allowNone:true,aka:["cover image","image"]}],["excerpt","area","Summary",{aka:["excerpt","short summary"]}],["body","prose","Body",{aka:["text"]}]];
function buildPosts(cfg,text,opts={}){
  cfg.posts=cfg.posts||[]; const counts={added:0,updated:0}, test=keyTest(POST_FIELDS), raw=new Set(["body","body (arabic)","body arabic","text","text (arabic)"]);
  const r=eachBlock(text,b=>parseBlock(b,{known:test,rawKeys:raw}),(entries,w)=>{
    const ctx={...ctxFor(cfg,opts,counts,w),name:"Post"};
    const p={ id:"p-"+rid(), slug:"", title:"", date:new Date().toISOString().slice(0,10), category:"", tags:[], author:plainTx(cfg.site&&cfg.site.brand)||"", cover:"", excerpt:"", body:"", published:false };
    fill(p,POST_FIELDS,entries,ctx,w); unknownKeys(entries,test,w,"post");
    if (!plainTx(p.title)) w.push("No title.");
    const want=slug(p.slug||plainTx(p.title),60)||"post";
    const same=opts.mode==="update"&&cfg.posts.find(x=>x.slug===want);
    if (same){ assignGiven(same,p,present(entries,POST_FIELDS).filter(k=>k!=="slug")); counts.updated++; }
    else { p.slug=uniqueId(want,s=>cfg.posts.some(x=>x.slug===s),60); cfg.posts.push(p); counts.added++; }
    return { title:plainTx(p.title)||"(no title)", meta:[same?"Updates the post":"New post","#post/"+want,p.published?"Published":"Draft",p.date].join(" · "), text:plainTx(p.excerpt), image:p.cover, chips:(Array.isArray(p.tags)?p.tags:[]).slice(0,6) };
  });
  return { ...r, summary:sumUp(counts,"post") };
}

/* Flows */
const FLOW_FIELDS=[["name","text","Name",{aka:["flow"]}],["separator","select","Separator",{options:OPT.separators}],["size","select","Size",{options:OPT.sizes}],["items","list","Items"]];
function buildFlows(cfg,text,opts={}){
  cfg.flows=cfg.flows||[]; const counts={added:0,updated:0}, test=keyTest(FLOW_FIELDS);
  const r=eachBlock(text,b=>parseBlock(b,{known:test}),(entries,w)=>{
    const ctx=ctxFor(cfg,opts,counts,w); const f={ name:"", separator:"dots3", size:"m" };
    fill(f,FLOW_FIELDS.slice(0,3),entries,ctx,w); unknownKeys(entries,test,w,"flow");
    const name=plainTx(f.name)||"Imported flow", it=findEntry(entries,names(FLOW_FIELDS[3]));
    const items=(it?it.items:[]).map((x,j)=>flowItem(cfg,x,j)).filter(Boolean);
    if (!items.length) w.push("No items. List them under Items:, one per line starting with \"- \".");
    const same=opts.mode==="update"&&cfg.flows.find(x=>norm(x.name)===norm(name));
    if (same){ Object.assign(same,{separator:f.separator,size:f.size,items}); counts.updated++; }
    else { const nf=flowFromItems(cfg,[],name); Object.assign(nf,{separator:f.separator,size:f.size,items}); counts.added++; }
    return { title:name, meta:(same?"Updates the flow":"New flow")+" · "+items.length+" items", chips:items.map(x=>plainTx(x.label)) };
  });
  return { ...r, summary:sumUp(counts,"flow") };
}

/* Modals */
const MODAL_FIELDS=[["name","text","Name",{aka:["modal","name in the studio"]}],["type","select","Type",{options:OPT.modalTypes}],["kicker","text","Small label",{aka:["kicker","eyebrow"]}],["title","text","Title"],["text","area","Text",{aka:["paragraph","short paragraph"]}],
  ["media","media","Media",{aka:["image","images","video","gallery"]}],["caption","strings","Captions",{aka:["caption","caption items"]}],["flowId","flow","Flow"],["more","button","More",{aka:["more button","button"]}],
  ["services","list","Services",{ title:"title", fields:[["title","text","Title"],["text","area","Brief",{aka:["text"]}],["link","button","Link"]], blank:()=>({title:"",text:"",link:{label:"",action:A()}}) }]];
function buildModals(cfg,text,opts={}){
  cfg.modals=cfg.modals||[]; const counts={added:0,updated:0}, test=keyTest(MODAL_FIELDS);
  const r=eachBlock(text,b=>parseBlock(b,{known:test}),(entries,w)=>{
    const ctx=ctxFor(cfg,opts,counts,w); const pre=findEntry(entries,names(MODAL_FIELDS[0]));
    ctx.name="Modal: "+(pre&&pre.value||"imported");
    const m={ id:"md-"+rid(), name:"", type:1, kicker:"", title:"", text:"", media:[], caption:[], flowId:"", more:{label:"More",action:A()} };
    fill(m,MODAL_FIELDS.filter(f=>f[0]!=="media"),entries,ctx,w); unknownKeys(entries,test,w,"modal");
    const me=findEntry(entries,names(MODAL_FIELDS[5])), refs=listOf(me);
    m.media=refs.map(ref=>{ const id=mediaOf(cfg,ref,ctx); if (!id) w.push(`Image "${ref}" isn't in the Library yet. Pick it on the modal later.`); return id; }).filter(Boolean);
    const need=+m.type===2?3:1; if (m.media.length<need) w.push(+m.type===2?"Type 2 shows three images; the studio fills the missing ones from the Library.":"No image yet; the studio uses the first Library image.");
    if (+m.type===3 && !m.flowId) w.push("Type 3 needs a flow. Add Flow: with its items.");
    if (+m.type===4 && !(m.services||[]).length) w.push("Type 4 lists services. Add Services: with one item per service.");
    m.name=plainTx(m.name)||plainTx(m.title)||"Imported modal";
    const same=opts.mode==="update"&&cfg.modals.find(x=>norm(x.name)===norm(m.name));
    if (same){ assignGiven(same,m,[...present(entries,MODAL_FIELDS),"name"]); counts.updated++; } else { cfg.modals.push(m); counts.added++; }
    return { title:m.name, meta:(same?"Updates the modal":"New modal")+" · Type "+m.type+(m.kicker?" · "+plainTx(m.kicker):""), text:plainTx(m.title), image:m.media[0], chips:(Array.isArray(m.caption)?m.caption:[]).map(plainTx) };
  });
  return { ...r, summary:sumUp(counts,"modal") };
}

/* Library items */
const LIB_FIELDS=[["label","text","Name",{aka:["title"]}],["file","text","File",{aka:["path","url","link to file"]}],["kind","select","Kind",{options:[["image","Image"],["video","Video"],["article","Article"],["scene","Scene"]],aka:["type"]}],
  ["category","category","Category"],["tags","strings","Tags"],["alt","text","Description",{aka:["alt","alt text"]}],["summary","area","Summary"],["link","text","Link"],["cover","media","Cover",{allowNone:true}],
  ["scene","select","Scene",{options:OPT.scenes}],["hidden","toggle","Hidden"]];
function buildLibrary(cfg,text,opts={}){
  cfg.media=cfg.media||[]; const counts={added:0,updated:0}, test=keyTest(LIB_FIELDS);
  const r=eachBlock(text,b=>parseBlock(b,{known:test}),(entries,w)=>{
    const ctx=ctxFor(cfg,opts,counts,w); const m={ id:"", label:"", kind:"", category:"", tags:[], alt:"", file:"" };
    fill(m,LIB_FIELDS,entries,ctx,w); unknownKeys(entries,test,w,"library");
    const file=String(m.file||"").trim(); delete m.file;
    const isUrl=/^https:\/\//i.test(file), path=isUrl?"":file.replace(/^\/?(public\/)?library\//,"");
    if (!m.kind) m.kind=/\.(mp4|webm|mov|m4v)$/i.test(file)?"video":/\.pdf$/i.test(file)?"article":file?"image":"article";
    if (path){ if (!/^[\w\-. ()&+,]+(\/[\w\-. ()&+,]+)*$/.test(path)||path.split("/").some(x=>x===".."||x==="."||!x)){ w.push(`"${file}" isn't a usable file path.`); return null; } m.path=path;
      if (opts.knownPaths && !opts.knownPaths.has(path)) w.push(`public/library/${path} isn't on GitHub yet. Upload it there (Library → Add files on GitHub) so it shows.`);
      if (!m.category && path.includes("/")) m.category=categoryOf(cfg,path.split("/")[0],ctx); }
    else if (isUrl){ if (m.kind==="article") m.link=m.link||file; else m.url=file; }
    if (m.kind==="scene" && !m.scene) m.scene="nebula";
    if (m.kind==="article"){ m.summary=m.summary||""; m.link=m.link||""; m.cover=m.cover||""; }
    m.label=plainTx(m.label)||(path||file).split("/").pop()||"Imported item";
    const same=cfg.media.find(x=>(path&&x.path===path)||(m.url&&x.url===m.url)||(((!path&&!m.url)||opts.mode==="update")&&x.kind===m.kind&&norm(x.label)===norm(m.label)));
    if (same && opts.mode!=="update"){ w.push("Already in the Library, so it was skipped. Choose \"Update\" to change it."); return { title:m.label, meta:"Skipped · already in the Library", image:same.id }; }
    if (same){ assignGiven(same,m,[...present(entries,LIB_FIELDS).filter(k=>k!=="file"),"label","kind",...(m.path?["path"]:[]),...(m.url?["url"]:[])]); counts.updated++; }
    else { m.id="m-"+(slug(m.label,20)||"item")+"-"+rid(); cfg.media.push(m); counts.added++; }
    return { title:m.label, meta:[same?"Updates":"New",m.kind,m.path?"GitHub: "+m.path:m.url?"Link":""].filter(Boolean).join(" · "), text:plainTx(m.alt||m.summary), image:same?same.id:m.id, chips:m.tags||[] };
  });
  return { ...r, summary:sumUp(counts,"library item") };
}

/* Pages and sections */
const PAGE_FIELDS=[["title","text","Page",{aka:["title","page title"]}],["id","text","Address",{aka:["slug","url"]}],["layout","select","Layout",{options:OPT.layouts}],["nav","toggle","Menu",{aka:["show in menu","in menu"]}]];
const typeOf=v=>{ const n=norm(v); return Object.keys(SECTION_TYPES).find(k=>norm(k)===n||norm(SECTION_TYPES[k].label)===n)||Object.keys(SECTION_TYPES).find(k=>norm(SECTION_TYPES[k].label).startsWith(n)); };
const SECTION_KEY=new Set(["section","section type"]);
function buildPages(cfg,text,opts={}){
  cfg.pages=cfg.pages||[]; const counts={added:0,updated:0,sections:0}, pageTest=keyTest(PAGE_FIELDS);
  const secTest=t=>{ const T=SECTION_TYPES[t]; return T?keyTest(T.fields):()=>false; };
  const proseOf=t=>{ const T=SECTION_TYPES[t], out=new Set(); if (T) T.fields.filter(f=>f[1]==="prose").forEach(f=>[...names(f),...arNames(f)].forEach(n=>out.add(n))); return out; };
  const sectionRaw=(k,first)=>!!first&&SECTION_KEY.has(first.key)&&proseOf(typeOf(first.value)).has(k);
  let page=opts.targetPage?cfg.pages.find(p=>p.id===opts.targetPage)||null:null, pageRec=null;
  const r=eachBlock(text,b=>parseBlock(b,{rawKeys:sectionRaw,known:(k,first)=>{
      if (!first) return SECTION_KEY.has(k)||pageTest(k);
      if (SECTION_KEY.has(first.key)){ const t=typeOf(first.value); return k==="hidden"||(t?secTest(t)(k):true); }
      return pageTest(k); }}),
    (entries,w)=>{
      const ctx=ctxFor(cfg,opts,counts,w), first=entries[0];
      if (SECTION_KEY.has(first.key)){
        const t=typeOf(first.value);
        if (!t){ w.push(`"${first.value}" isn't a section type. Use one of: ${Object.values(SECTION_TYPES).map(x=>x.label).join(", ")}.`); return { title:first.value||"(no type)", meta:"Skipped section" }; }
        if (!page){ w.push("This section has no page. Put a Page: block above it, or choose a page to add it to."); return { title:SECTION_TYPES[t].label, meta:"Skipped section" }; }
        const T=SECTION_TYPES[t], s={ id:"s-"+rid(), type:t, ...SECTION_BLANK[t]() };
        const body=entries.slice(1), te=secTest(t); ctx.name=(plainTx(page.title)||page.id)+": "+T.label;
        const hid=body.find(e=>e.key==="hidden"); if (hid){ s.hidden=YES.test(hid.value); }
        fill(s,T.fields,body.filter(e=>e.key!=="hidden"),ctx,w); unknownKeys(body.filter(e=>e.key!=="hidden"),te,w,T.label.toLowerCase()+" section");
        page.sections.push(s); counts.sections++;
        if (pageRec) pageRec.chips.push(T.label);
        const lst=T.fields.find(f=>f[1]==="list"), n=lst&&Array.isArray(s[lst[0]])?s[lst[0]].length:0;
        return { title:T.label+(plainTx(s.title||s.eyebrow)?": "+plainTx(s.title||s.eyebrow):""), meta:"Section on "+(plainTx(page.title)||page.id)+(n?" · "+n+" "+String(lst[2]).toLowerCase():"")+(s.hidden?" · hidden":""), text:plainTx(s.lede||s.text||""), image:s.media, sub:true };
      }
      const p={ id:"", title:"", nav:true, layout:"cinematic", sections:[] };
      fill(p,PAGE_FIELDS,entries,ctx,w); unknownKeys(entries,pageTest,w,"page");
      const want=slug(p.id||plainTx(p.title),30)||"page";
      const same=opts.mode==="update"&&cfg.pages.find(x=>x.id===want);
      if (same){ Object.assign(same,{title:p.title||same.title,layout:p.layout,nav:p.nav}); same.sections=[]; page=same; counts.updated++; }
      else { p.id=uniqueId(/^[a-z]/.test(want)?want:"p-"+want,id=>cfg.pages.some(x=>x.id===id)||RESERVED.includes(id)); cfg.pages.push(p); page=p; counts.added++; }
      pageRec={ title:plainTx(page.title)||page.id, meta:(same?"Replaces the sections of":"New page")+" #"+page.id+" · "+(OPT.layouts.find(l=>l[0]===page.layout)||[])[1], chips:[] };
      return pageRec;
    });
  const s=sumUp(counts,"page"); return { ...r, summary:(s?s+", ":"")+counts.sections+" section"+(counts.sections===1?"":"s") };
}

/* Colours: My colours and palettes */
const PAL_FIELDS=[["name","text","Palette"],["accent","text","Accent"],["ink","text","Background"],["panel","text","Panels",{aka:["panel"]}],["fg","text","Text"]];
const hex=v=>{ const m=String(v||"").match(/#([\da-f]{6}|[\da-f]{3})\b/i); if (!m) return ""; const x=m[1].length===3?m[1].split("").map(c=>c+c).join(""):m[1]; return "#"+x.toLowerCase(); };
function buildColours(cfg,text,opts={}){
  const T=cfg.theme=cfg.theme||{}; T.swatches=Array.isArray(T.swatches)?T.swatches:[]; T.myPalettes=Array.isArray(T.myPalettes)?T.myPalettes:[];
  const counts={added:0,updated:0}, MY=new Set(["my colours","my colors","colours","colors"]), palTest=keyTest(PAL_FIELDS);
  const r=eachBlock(text,b=>parseBlock(b,{known:k=>MY.has(k)||palTest(k)}),(entries,w)=>{
    const my=entries.find(e=>MY.has(e.key));
    if (my){ const got=[];
      my.items.forEach(it=>{ const hx=hex(it.text); if (!hx){ w.push(`"${it.text}" has no colour code like #0072bc.`); return; }
        const name=it.text.replace(/#[\da-f]{3,6}\b/i,"").replace(/[:\-–]\s*$|^\s*[:\-–]/g,"").trim();
        const same=T.swatches.find(s=>(s.hex||"").toLowerCase()===hx);
        if (same){ if (name) same.name=name; counts.updated++; } else { T.swatches.push({name,hex:hx}); counts.added++; } got.push((name?name+" ":"")+hx); });
      return { title:"My colours", meta:got.length+" colours", chips:got, swatches:my.items.map(i=>hex(i.text)).filter(Boolean) };
    }
    const p={}; fill(p,PAL_FIELDS,entries,ctxFor(cfg,opts,counts,w),w);
    const pal={ name:plainTx(p.name)||"Imported palette", accent:hex(p.accent), ink:hex(p.ink), panel:hex(p.panel), fg:hex(p.fg) };
    const miss=["accent","ink","panel","fg"].filter(k=>!pal[k]); if (miss.length){ w.push("A palette needs four colours: Accent, Background, Panels and Text."); return { title:pal.name, meta:"Skipped palette" }; }
    const same=T.myPalettes.find(x=>norm(x.name)===norm(pal.name));
    if (same){ Object.assign(same,pal); counts.updated++; } else { T.myPalettes.push(pal); counts.added++; }
    return { title:pal.name, meta:(same?"Updates the palette":"New palette"), swatches:[pal.ink,pal.panel,pal.accent,pal.fg] };
  });
  return { ...r, summary:sumUp(counts,"colour or palette","colours and palettes") };
}

/* Icons */
const ICON_FIELDS=[["label","text","Name",{aka:["icon"]}],["svg","text","SVG",{aka:["svg code","code"]}]];
function buildIcons(cfg,text,opts={},clean=s=>s){
  cfg.icons=cfg.icons||[]; const counts={added:0,updated:0}, test=keyTest(ICON_FIELDS);
  const r=eachBlock(text,b=>parseBlock(b,{known:test}),(entries,w)=>{
    const ic={ label:"", svg:"" }; fill(ic,ICON_FIELDS,entries,ctxFor(cfg,opts,counts,w),w);
    const e=findEntry(entries,names(ICON_FIELDS[1])); ic.svg=String(e&&e.value||"").trim(); ic.label=plainTx(ic.label)||"Imported icon";
    if (!/^<svg[\s>]/i.test(ic.svg) || !clean(ic.svg)){ w.push("No usable SVG. Put the code under SVG: between ``` lines."); return { title:ic.label, meta:"Skipped icon" }; }
    const same=opts.mode==="update"&&cfg.icons.find(x=>norm(x.label)===norm(ic.label));
    if (same){ same.svg=ic.svg; counts.updated++; } else { cfg.icons.push({ id:"i-"+(slug(ic.label,16)||"icon")+"-"+rid(), ...ic }); counts.added++; }
    return { title:ic.label, meta:same?"Updates the icon":"New icon", svg:ic.svg };
  });
  return { ...r, summary:sumUp(counts,"icon") };
}

/* Carousel slides (the original importer, shown here with the others) */
function buildSlides(cfg,text,opts={}){
  const { slides, warnings }=parseSlidesMd(text), sec=findSection(cfg,opts.targetCarousel);
  if (!sec) return { records:[], warnings:["Pick a carousel to add the slides to."], summary:"" };
  const kp=opts.knownPaths??null;
  const records=slides.map((x,i)=>{ const img=resolveImage(cfg,x.image,{knownPaths:kp}); const w=[...x.warnings]; if (img.missing) w.push(`Image "${x.image}" isn't in the Library yet, so the default image is used.`);
    return { title:x.title||"(no title)", meta:`Slide ${i+1}`+(x.eyebrow?" · "+x.eyebrow:"")+(x.seconds?` · ${x.seconds}s`:""), text:x.subtitle, image:img.id||"", chips:x.flow.map(f=>plainTx(f.label)), warnings:w }; });
  if (!slides.length) return { records, warnings, summary:"" };
  const res=applySlidesImport(cfg,sec,slides,{mode:opts.mode==="replace"?"replace":"append",knownPaths:kp});
  return { records, warnings, summary:`${res.slides} slide${res.slides===1?"":"s"}`+(res.flows?`, ${res.flows} flow${res.flows===1?"":"s"}`:"") };
}
function findSection(cfg,id){ for (const p of cfg.pages||[]) for (const s of p.sections||[]) if (s.id===id) return s; return null; }

function sumUp(c,one,many=one+"s"){
  const part=(n,verb)=>n?`${verb} ${n} ${n===1?one:many}`:"";
  const out=[part(c.added,"add"),part(c.updated,"update")].filter(Boolean).join(", ");
  const extra=[c.flows?`${c.flows} new flow${c.flows===1?"":"s"}`:"",c.media?`${c.media} new library item${c.media===1?"":"s"}`:"",c.categories?`${c.categories} new categor${c.categories===1?"y":"ies"}`:""].filter(Boolean).join(", ");
  return [out,extra].filter(Boolean).join(", ").replace(/^./,x=>x.toUpperCase());
}

/** Every importable content type. modes: [value, label]; the first is the default. */
const IMPORTERS=[
  { key:"slides", label:"Carousel slides", file:"carousel-slides.md", build:buildSlides, needs:"carousel",
    modes:[["append","Add after the current slides"],["replace","Replace all slides"]], about:"One block per slide: image, title, subtitle, seconds and the flow buttons under the text." },
  { key:"pages", label:"Pages and sections", file:"pages-and-sections.md", build:buildPages, needs:"page",
    modes:[["add","Add as new pages (a taken address gets a number)"],["update","Replace the sections of pages with the same address"]], about:"A Page block starts a page; each Section block after it adds a section. Every section type and its settings are in the template. Sections with no page above them go to the page you pick." },
  { key:"posts", label:"Blog posts", file:"blog-posts.md", build:buildPosts,
    modes:[["add","Add as new posts"],["update","Update posts with the same address"]], about:"One block per post: title, date, category, tags, cover, summary and the full text under Body." },
  { key:"flows", label:"Flows", file:"flows.md", build:buildFlows,
    modes:[["add","Add as new flows"],["update","Update flows with the same name"]], about:"One block per flow: its name, separator, size and items (buttons, plain text, icons) with optional detail text." },
  { key:"modals", label:"Modals", file:"modals.md", build:buildModals,
    modes:[["add","Add as new modals"],["update","Update modals with the same name"]], about:"One block per modal: type, title, text, images, captions, a flow for Type 3 and the More button." },
  { key:"library", label:"Library items", file:"library.md", build:buildLibrary,
    modes:[["add","Add new items (skip files already in the Library)"],["update","Add new items and update existing ones"]], about:"Names, categories, tags and descriptions for files on GitHub, links to uploads, articles and scenes." },
  { key:"colours", label:"Colours and palettes", file:"colours.md", build:buildColours,
    modes:[["add","Add (a colour or palette that exists is updated)"]], about:"Your named colours (shown next to every colour picker) and saved palettes." },
  { key:"icons", label:"Icons", file:"icons.md", build:buildIcons,
    modes:[["add","Add as new icons"],["update","Update icons with the same name"]], about:"One block per icon: a name and its SVG code." }
];

export { IMPORTERS, splitBlocks, parseBlock, buildPosts, buildFlows, buildModals, buildLibrary, buildPages, buildColours, buildIcons, buildSlides, typeOf, hex };
