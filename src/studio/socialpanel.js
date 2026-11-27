/* ================= STUDIO › SOCIAL =================
   Create posts: pick something on the site and get LinkedIn, Facebook and Instagram captions (English and Arabic),
   hashtags, a link back, a picture cropped to each platform's size and carousel slide text, all ready to copy.
   Calendar: plan posts on the weekly rhythm and mark them drafted, scheduled or posted.
   Social settings: tones and templates per platform, hashtag sets, carousel slides and the weekly rhythm.
   Everything here is the studio's own text work: no AI service and no automatic posting (yet). */
import { $$, h, esc, plain, mediaItem, mediaUrl, mediaNode, overlayEl } from './core';
import { Store, Social, loadSocial, scheduleSocialSave } from './store';
import { Site } from './site';
import { IC, card, toast, openPanel, mediaPicker, confirmInline } from './admin';
import { PLATFORMS, PLATFORM_NAME, FORMATS, formatOf, TOPICS, TOPIC_NAME, STATUSES, PLACEHOLDERS, TONES, SOCIAL_DEFAULTS,
  inLang, socialSources, postLink, buildCaption, buildSlides, slidesText, isoDay, parseDay, weekday, calendarDays, nextRhythmDate,
  suggestSource, newEntry, weekStart } from './social';

const DAYS = ["","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const PLAT_IC = {
  linkedin:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>',
  facebook:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M15 8h-1.5A2.5 2.5 0 0 0 11 10.5V21M9 13h5"/></svg>',
  instagram:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7v.01"/></svg>'
};
const S = () => Social.data;
const save = () => scheduleSocialSave();
const hasAr = () => { const l=Store.draft&&Store.draft.site.languages; return l==="both"||l==="ar"; };
const hasEn = () => { const l=Store.draft&&Store.draft.site.languages; return l!=="ar"; };
const langs = () => [hasEn()?"en":null,hasAr()?"ar":null].filter(Boolean);
const LANG_NAME = { en:"English", ar:"العربية" };

/* ---------- small fields that save the social plan (not the site draft) ---------- */
let fid=0;
function sField(obj,key,label,{kind="text",hint="",placeholder="",min,max,step,options,wide=false,rows=3,lang=null,onChange=()=>{}}={}){
  const id="sf-"+(++fid), wrap=h("div",{class:"field"+(wide?" wide":"")});
  const set=v=>{ obj[key]=v; onChange(v); save(); };
  if (kind==="toggle"){ const i=h("input",{id,type:"checkbox"}); i.checked=!!obj[key]; i.addEventListener("change",()=>set(i.checked)); wrap.append(h("label",{class:"toggle",for:id},i,label)); }
  else {
    wrap.append(h("label",{for:id,text:label}));
    if (kind==="select"){ const s=h("select",{id}); options.forEach(([v,l])=>{ const o=h("option",{value:String(v),text:l}); if (String(obj[key])===String(v)) o.selected=true; s.append(o); });
      s.addEventListener("change",()=>set(options.find(o=>String(o[0])===s.value)[0])); wrap.append(s); }
    else if (kind==="area"){ const t=h("textarea",{id,rows}); t.value=obj[key]??""; if (placeholder) t.placeholder=placeholder; t.addEventListener("input",()=>set(t.value)); wrap.append(t); if (lang==="ar"){ t.dir="rtl"; t.lang="ar"; } }
    else { const i=h("input",{id,type:kind==="number"?"number":"text",value:obj[key]??""}); if (placeholder) i.placeholder=placeholder; if (min!=null) i.min=min; if (max!=null) i.max=max; if (step!=null) i.step=step;
      i.addEventListener("input",()=>set(kind==="number"?(i.value===""?"":+i.value):i.value)); wrap.append(i); if (lang==="ar"){ i.dir="rtl"; i.lang="ar"; } }
  }
  if (hint) wrap.append(h("span",{class:"hint",text:hint}));
  return wrap;
}
/** English and Arabic side by side (only the site's languages). The value is {en,ar}. */
function sBi(obj,key,label,opts={}){
  if (!obj[key]||typeof obj[key]!=="object") obj[key]={en:typeof obj[key]==="string"?obj[key]:"",ar:""};
  const L=langs(); if (L.length===1) return sField(obj[key],L[0],label,{...opts,lang:L[0]});
  const row=h("div",{class:"bi-row"}); L.forEach(l=>{ const f=sField(obj[key],l,LANG_NAME[l],{...opts,wide:false,hint:"",lang:l,placeholder:typeof opts.placeholder==="object"?opts.placeholder[l]:opts.placeholder}); f.classList.add("bi-"+l); row.append(f); });
  const w=h("div",{class:"field bi wide"},h("span",{class:"bi-label",text:label}),row); if (opts.hint) w.append(h("span",{class:"hint",text:opts.hint})); return w;
}
function copyText(text,what="Copied"){
  const done=()=>toast(what+".");
  if (navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done,()=>fallbackCopy(text,done)); else fallbackCopy(text,done);
}
function fallbackCopy(text,done){ const t=h("textarea",{style:"position:fixed;opacity:0"}); t.value=text; document.body.append(t); t.select(); try { document.execCommand("copy"); done(); } catch { toast("Couldn't copy. Select the text and copy it."); } t.remove(); }
const copyBtn=(get,label="Copy",what="Copied to the clipboard")=>h("button",{class:"btn sm",type:"button",html:IC.copy+esc(label),onclick:()=>copyText(typeof get==="function"?get():get,what)});

/** Status line for the social plan: where it is saved and whether the last save worked. */
function saveNote(){
  const el=h("p",{class:"soc-save mono",role:"status"});
  const draw=()=>{ const st=Social.status, where=Social.where==="db"?"Saved in the studio database (editors only, never published)":"Saved in this browser only";
    el.textContent=(st==="saving"||st==="pending"?"Saving… · ":st==="error"?"Couldn't save to the database, kept in this browser · ":"")+where; el.classList.toggle("err",st==="error"); };
  draw(); Social.listeners=[draw]; return el;
}
async function withSocial(body,fn){
  body.append(h("p",{class:"adm-intro",text:"Loading the social plan…"}));
  await loadSocial(); if (!body.isConnected) return; body.textContent=""; fn();
}

/* ---------- picture cropped to a platform size ---------- */
const focusOf = m => ({ x:+(m&&m.fx)||.5, y:+(m&&m.fy)||.5 });
function cropPreview(D,id,plat,fmtKey){
  const [,label,w,hh]=formatOf(plat,fmtKey), m=id?mediaItem(D,id):null;
  const box=h("div",{class:"soc-crop",style:`aspect-ratio:${w}/${hh}`});
  if (!m) box.append(h("span",{class:"mp-empty",text:"No picture picked"}));
  else if (m.kind==="image"){ const u=mediaUrl(m); if (u){ const f=focusOf(m); box.append(h("img",{src:u,alt:"",loading:"lazy",style:`object-position:${f.x*100}% ${f.y*100}%`})); } }
  else { const n=mediaNode(D,id,{w:Math.round(w/3),hh:Math.round(hh/3)}); if (n) box.append(n); }
  if (m){ const ov=overlayEl(D,id); if (ov) box.append(ov); }
  box.append(h("span",{class:"soc-size mono",text:label+" · "+w+"×"+hh}));
  return box;
}
/** Draws the picture at the platform size and saves it as a JPG. Library and uploaded pictures only. */
async function downloadCrop(D,id,plat,fmtKey,name){
  const [,,w,hh]=formatOf(plat,fmtKey), m=id?mediaItem(D,id):null;
  if (!m){ toast("Pick a picture first."); return; }
  if (m.kind==="video"||m.kind==="article"){ toast("Pick a picture: videos can't be cropped here."); return; }
  const c=document.createElement("canvas"); c.width=w; c.height=hh; const g=c.getContext("2d");
  try {
    if (m.kind==="scene"){ const n=mediaNode(D,id,{w,hh}); g.drawImage(n,0,0); }
    else {
      const img=new Image(); img.crossOrigin="anonymous"; img.decoding="async";
      await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; img.src=mediaUrl(m); });
      const f=focusOf(m), k=Math.max(w/img.naturalWidth,hh/img.naturalHeight), sw=w/k, sh=hh/k;
      g.drawImage(img,(img.naturalWidth-sw)*f.x,(img.naturalHeight-sh)*f.y,sw,sh,0,0,w,hh);
    }
    const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",.9)); if (!blob) throw new Error("no blob");
    const a=h("a",{href:URL.createObjectURL(blob),download:(name||"dorma-post")+"-"+plat+"-"+w+"x"+hh+".jpg"}); document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    toast("Picture saved at "+w+"×"+hh+".");
  } catch { toast("Couldn't make the picture. Try another one, or download it from the Library."); }
}
const slug = s => String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40)||"post";

/* ================= CREATE POSTS ================= */
const COMP = { key:"", q:"", type:"", topic:"", sets:null, image:null, formats:{}, edits:{}, date:"", status:"drafted", time:"" };
const TYPE_FILTER = [["","Everything"],["page","Pages"],["section","Sections"],["post","Blog posts"],["item","Catalog items"],["flow","Flows (carousel posts)"]];
function pickSource(key,{date=""}={}){ COMP.key=key; COMP.sets=null; COMP.image=null; COMP.edits={}; COMP.formats={}; COMP.date=date; }

function panelSocial(body){
  withSocial(body,()=>{
    const D=Store.draft, sources=socialSources(D);
    body.append(h("p",{class:"adm-intro",text:"Pick a page, section, blog post, catalog item or flow. Its own words become posts for each platform, in English and Arabic, with hashtags, a link back and a picture at the right size. Edit anything before copying. Nothing is posted for you."}),saveNote());
    const list=h("div",{class:"list soc-src",role:"list"}), det=h("div",{class:"soc-det"});
    const q=h("input",{type:"search",placeholder:"Search","aria-label":"Search the site's content",value:COMP.q});
    const ty=h("select",{"aria-label":"Kind"}); TYPE_FILTER.forEach(([v,l])=>ty.append(h("option",{value:v,text:l,selected:COMP.type===v})));
    const tp=h("select",{"aria-label":"Topic"}); [["","Every topic"],...TOPICS].forEach(([v,l])=>tp.append(h("option",{value:v,text:l,selected:COMP.topic===v})));
    const items=h("div",{class:"soc-src-items"});
    const drawList=()=>{ items.textContent=""; const qq=COMP.q.trim().toLowerCase();
      const found=sources.filter(s=>(!COMP.type||s.type===COMP.type)&&(!COMP.topic||s.topic===COMP.topic)&&(!qq||(s.label+" "+(s.page?s.page.en:"")+" "+s.title.ar).toLowerCase().includes(qq)));
      let grp=""; found.forEach(s=>{ if (s.group!==grp){ grp=s.group; items.append(h("p",{class:"soc-grp mono",text:grp})); }
        items.append(h("button",{class:"li"+(s.key===COMP.key?" on":""),type:"button",onclick:()=>{ pickSource(s.key); drawList(); drawDet(); }},
          h("span",{class:"soc-li-t"},h("span",{text:s.label}),s.page?h("em",{text:plain(s.page.en||s.page.ar)}):null),
          h("small",{text:s.placeholder?"Placeholder":s.draft?"Draft":TOPIC_NAME[s.topic]}))); });
      if (!found.length) items.append(h("p",{class:"hint",text:"Nothing matches."})); };
    q.addEventListener("input",()=>{ COMP.q=q.value; drawList(); });
    ty.addEventListener("change",()=>{ COMP.type=ty.value; drawList(); });
    tp.addEventListener("change",()=>{ COMP.topic=tp.value; drawList(); });
    list.append(h("div",{class:"soc-filters"},q,ty,tp),items);
    const drawDet=()=>{ det.textContent=""; let src=sources.find(s=>s.key===COMP.key);
      if (!src){ src=suggestSource(sources,S().posts,[])||sources[0]; if (!src){ det.append(h("p",{class:"adm-intro",text:"The site has no text to post about yet."})); return; } pickSource(src.key); drawList(); }
      det.append(...composer(D,src,()=>{ drawDet(); }));
    };
    body.append(h("div",{class:"cols soc-cols"},list,det)); drawList(); drawDet();
  });
}

function composer(D,src,redraw){
  const SS=S(), L=langs();
  const plats=PLATFORMS.filter(([p])=>SS.platforms[p].on).map(([p])=>p);
  const sets=()=>COMP.sets||(SS.hashtags||[]).filter(x=>x.topic==="all"||x.topic===src.topic).map(x=>x.id);
  if (COMP.image==null) COMP.image={image:src.image||""};
  const out=[];
  /* --- the source --- */
  const warn=[];
  if (src.placeholder) warn.push("This text is still a placeholder on the site. Write the real text there first, then come back.");
  if (src.draft) warn.push("This blog post isn't published yet, so its link won't open for visitors.");
  if (hasAr()&&!src.title.ar&&!src.summary.ar) warn.push("This has no Arabic text on the site yet, so the Arabic posts are empty. Add the Arabic there first.");
  const chips=h("div",{class:"chips"});
  const drawChips=()=>{ chips.textContent=""; (SS.hashtags||[]).forEach(x=>{ const on=sets().includes(x.id);
    chips.append(h("button",{type:"button",class:"chip"+(on?" on":""),"aria-pressed":String(on),title:inLang(x.tags,"en")+(inLang(x.tags,"ar")?"\n"+inLang(x.tags,"ar"):""),text:x.name||"Set",
      onclick:()=>{ const cur=sets().slice(), i=cur.indexOf(x.id); if (i>=0) cur.splice(i,1); else cur.push(x.id); COMP.sets=cur; COMP.edits={}; redraw(); }})); });
    chips.append(h("button",{type:"button",class:"btn sm",text:"Edit sets",onclick:()=>openPanel("socialSet")})); };
  drawChips();
  const link=postLink(SS,src.link,"");
  out.push(card(h("span",{class:"grow"},src.label),
    h("button",{class:"btn sm",type:"button",html:IC.eye+"Preview on the site",onclick:()=>{ Site.preview=true; location.hash=src.link; }}),
    h("div",{class:"soc-meta"},
      h("span",{},h("b",{text:"Kind "}),src.group.replace(/ \(.*\)$/,"")+(src.page?" · "+plain(src.page.en||src.page.ar):"")),
      h("span",{},h("b",{text:"Topic "}),TOPIC_NAME[src.topic]),
      h("span",{class:"soc-link"},h("b",{text:"Link "}),link||"Set the site address in Social settings")),
    ...warn.map(w=>h("p",{class:"soc-warn",text:w})),
    h("div",{class:"field wide"},h("label",{text:"Hashtag sets"}),chips,h("span",{class:"hint",text:"Picked from the topic. Tap to add or remove a set for this post."})),
    h("div",{class:"field wide"},h("label",{text:"Picture"}),mediaPicker(COMP.image,"image",{},()=>redraw()),h("span",{class:"hint",text:"Suggested from the page. Each platform below shows it cropped to its size and can save it as a JPG."}))));
  if (!plats.length){ out.push(h("p",{class:"soc-warn",text:"Every platform is switched off in Social settings."})); return out; }
  /* --- one card per platform --- */
  const captions={};
  plats.forEach(p=>{
    const P=SS.platforms[p]; COMP.formats[p]=COMP.formats[p]||P.format||FORMATS[p][0][0];
    const cols=h("div",{class:"soc-caps"+(L.length>1?" two":"")});
    captions[p]={};
    L.forEach(l=>{
      const gen=buildCaption(D,SS,src,p,l,{sets:sets()}), k=p+"."+l, edited=COMP.edits[k]!=null;
      const t=h("textarea",{class:"soc-text",rows:12,"aria-label":PLATFORM_NAME[p]+" post in "+LANG_NAME[l]}); t.value=edited?COMP.edits[k]:gen.text;
      if (l==="ar"){ t.dir="rtl"; t.lang="ar"; }
      captions[p][l]=()=>t.value;
      const count=h("span",{class:"soc-count mono"});
      const sync=()=>{ const n=[...t.value].length; count.textContent=n+" / "+gen.max; count.classList.toggle("over",n>gen.max);
        if (p==="instagram"){ const first=t.value.split("\n")[0]; count.title=first.length>125?"Instagram shows about the first 125 characters before “more”.":""; } };
      t.addEventListener("input",()=>{ COMP.edits[k]=t.value; sync(); reset.hidden=false; }); sync();
      const reset=h("button",{class:"btn sm",type:"button",text:"Back to generated",hidden:!edited,onclick:()=>{ delete COMP.edits[k]; t.value=gen.text; reset.hidden=true; sync(); }});
      const miss=gen.missing.length?h("p",{class:"soc-warn sm",text:"No "+LANG_NAME[l]+" "+gen.missing.join(", ")+" on the site yet."}):null;
      cols.append(h("div",{class:"soc-cap"},h("div",{class:"soc-cap-head"},h("b",{text:LANG_NAME[l]}),count,h("span",{class:"grow"}),reset,copyBtn(()=>t.value,"Copy",PLATFORM_NAME[p]+" "+LANG_NAME[l]+" post copied")),miss,t));
    });
    const fmts=h("div",{class:"chips"}), prev=h("div",{class:"soc-crop-wrap"});
    const drawPic=()=>{ fmts.textContent=""; prev.textContent="";
      FORMATS[p].forEach(([fk,fl,w,hh])=>fmts.append(h("button",{type:"button",class:"chip"+(COMP.formats[p]===fk?" on":""),title:w+"×"+hh,text:fl,onclick:()=>{ COMP.formats[p]=fk; drawPic(); }})));
      prev.append(cropPreview(D,COMP.image.image,p,COMP.formats[p]),
        h("button",{class:"btn sm",type:"button",html:IC.down+"Save picture "+formatOf(p,COMP.formats[p]).slice(2).join("×"),onclick:()=>downloadCrop(D,COMP.image.image,p,COMP.formats[p],slug(src.title.en||src.key))})); };
    drawPic();
    out.push(card(h("span",{class:"grow soc-plat",html:PLAT_IC[p]+esc(PLATFORM_NAME[p])}),h("span",{class:"mono soc-tone",text:(TONES[P.tone]||{}).label+(inLang(P.template,"en")||inLang(P.template,"ar")?" · own template":"")}),
      cols,h("div",{class:"soc-pic"},h("div",{class:"field"},h("label",{text:"Picture size"}),fmts),prev)));
  });
  /* --- carousel slides --- */
  const slides={}; L.forEach(l=>{ slides[l]=buildSlides(SS,src,l); });
  if (L.some(l=>slides[l].length)){
    const grid=h("div",{class:"soc-caps"+(L.length>1?" two":"")});
    L.forEach(l=>{ const list=slides[l], col=h("div",{class:"soc-cap"},h("div",{class:"soc-cap-head"},h("b",{text:LANG_NAME[l]}),h("span",{class:"soc-count mono",text:list.length+" slides"}),h("span",{class:"grow"}),list.length?copyBtn(()=>slidesText(list),"Copy all","Slide text copied"):null));
      const ol=h("ol",{class:"soc-slides",dir:l==="ar"?"rtl":"ltr",lang:l});
      list.forEach((s,i)=>ol.append(h("li",{},h("div",{},h("b",{text:s.title}),s.text?h("span",{text:s.text}):null),h("button",{class:"x",type:"button",title:"Copy slide "+(i+1),"aria-label":"Copy slide "+(i+1),html:IC.copy,onclick:()=>copyText(s.title+(s.text?"\n"+s.text:""),"Slide "+(i+1)+" copied")}))));
      if (!list.length) ol.append(h("li",{class:"hint",text:"No "+LANG_NAME[l]+" text for the slides yet."}));
      col.append(ol); grid.append(col); });
    out.push(card("Carousel slides",h("p",{class:"adm-intro",style:"margin:0",text:"For a LinkedIn document post or an Instagram or Facebook carousel: a cover, one slide per "+(src.type==="flow"?"step of the flow":src.type==="post"?"heading of the post":"point")+", and an end slide. Put the text on your slide designs."}),grid));
  }
  /* --- add to calendar --- */
  if (!COMP.date) COMP.date=nextRhythmDate(SS,src.topic);
  const pick={}; plats.forEach(p=>{ pick[p]=true; });
  const platBox=h("div",{class:"chips"}); const drawPlat=()=>{ platBox.textContent=""; plats.forEach(p=>platBox.append(h("button",{type:"button",class:"chip"+(pick[p]?" on":""),"aria-pressed":String(!!pick[p]),text:PLATFORM_NAME[p],onclick:()=>{ pick[p]=!pick[p]; drawPlat(); }}))); };
  drawPlat();
  const dateI=h("input",{type:"date",value:COMP.date}); dateI.addEventListener("change",()=>{ COMP.date=dateI.value; dayHint.textContent=dayName(COMP.date); });
  const timeI=h("input",{type:"time",value:COMP.time}); timeI.addEventListener("change",()=>{ COMP.time=timeI.value; });
  const stI=h("select",{}); STATUSES.forEach(([v,l])=>stI.append(h("option",{value:v,text:l,selected:COMP.status===v}))); stI.addEventListener("change",()=>{ COMP.status=stI.value; });
  const dayHint=h("span",{class:"hint",text:dayName(COMP.date)});
  out.push(card("Plan it",
    h("div",{class:"fields"},
      h("div",{class:"field wide"},h("label",{text:"Platforms"}),platBox),
      h("div",{class:"field"},h("label",{text:"Day"}),dateI,dayHint),
      h("div",{class:"field"},h("label",{text:"Time (optional)"}),timeI),
      h("div",{class:"field"},h("label",{text:"Status"}),stI)),
    h("div",{class:"soc-actions"},
      h("button",{class:"btn primary",type:"button",html:IC.plus+"Add to calendar",onclick:()=>{
        const chosen=plats.filter(p=>pick[p]); if (!chosen.length){ toast("Pick at least one platform."); return; }
        if (!COMP.date){ toast("Pick a day."); return; }
        chosen.forEach(p=>SS.posts.push(newEntry({ date:COMP.date, time:COMP.time, platform:p, status:COMP.status, source:src.key, label:src.label, topic:src.topic,
          en:L.includes("en")?captions[p].en():"", ar:L.includes("ar")?captions[p].ar():"", image:COMP.image.image||"", format:COMP.formats[p],
          slides:L.some(l=>slides[l].length)?Object.fromEntries(L.map(l=>[l,slidesText(slides[l])])):null })));
        save(); toast(chosen.length+(chosen.length===1?" post":" posts")+" added to "+dayName(COMP.date)+".");
      }}),
      h("button",{class:"btn",type:"button",text:"Open the calendar",onclick:()=>openPanel("socialCal")}))));
  return out;
}
const dayName = iso => { if (!iso) return ""; const d=parseDay(iso); return DAYS[weekday(d)]+" "+d.getDate()+" "+d.toLocaleString("en",{month:"short"}); };

/* ================= CALENDAR ================= */
const CAL = { offset:0, status:"", view:"weeks", open:"" };
function panelSocialCal(body){
  withSocial(body,()=>{
    const SS=S(), D=Store.draft;
    body.append(h("p",{class:"adm-intro",text:"Your posting plan. The weekly rhythm (Social settings) marks the days; fill them with suggestions from the site, or add posts from Create posts. Mark each post drafted, scheduled or posted as you go."}),saveNote());
    const bar=h("div",{class:"soc-bar"}), wrap=h("div",{class:"soc-cal"});
    body.append(bar,wrap);
    const draw=()=>{ bar.textContent=""; wrap.textContent="";
      const from=new Date(); from.setDate(from.getDate()+CAL.offset*7);
      const counts=Object.fromEntries(STATUSES.map(([s])=>[s,SS.posts.filter(e=>e.status===s).length]));
      const st=h("div",{class:"chips"}); [["","All",SS.posts.length],...STATUSES.map(([s,l])=>[s,l,counts[s]])].forEach(([v,l,n])=>st.append(h("button",{type:"button",class:"chip"+(CAL.status===v?" on":""),onclick:()=>{ CAL.status=v; draw(); }},l+" ",h("b",{text:String(n)}))));
      const vw=h("div",{class:"chips"}); [["weeks","Weeks"],["list","Every post"]].forEach(([v,l])=>vw.append(h("button",{type:"button",class:"chip"+(CAL.view===v?" on":""),text:l,onclick:()=>{ CAL.view=v; draw(); }})));
      bar.append(vw,st);
      if (CAL.view==="weeks"){
        const ws=weekStart(from), we=new Date(ws); we.setDate(ws.getDate()+SS.weeks*7-1);
        bar.append(h("div",{class:"soc-nav"},
          h("button",{class:"btn sm",type:"button",text:"‹ Earlier",onclick:()=>{ CAL.offset-=SS.weeks; draw(); }}),
          h("span",{class:"mono",text:dayName(isoDay(ws))+" – "+dayName(isoDay(we))}),
          h("button",{class:"btn sm",type:"button",text:"Later ›",onclick:()=>{ CAL.offset+=SS.weeks; draw(); }}),
          CAL.offset?h("button",{class:"btn sm",type:"button",text:"This week",onclick:()=>{ CAL.offset=0; draw(); }}):null,
          h("button",{class:"btn sm primary",type:"button",html:IC.plus+"Fill empty rhythm days",title:"Adds a planned post on every empty rhythm day from today, for each platform, from site content not posted lately",onclick:()=>{ const n=fillRhythm(D,SS,from); draw(); toast(n?"Planned "+n+(n===1?" day":" days")+" with suggestions.":"Every rhythm day already has a post."); }})));
        const today=isoDay(new Date());
        calendarDays(SS,from).forEach(day=>{
          const posts=day.posts.filter(e=>!CAL.status||e.status===CAL.status);
          if (CAL.status&&!posts.length) return;
          const topics=[...new Set(day.slots.flatMap(r=>r.topics||[]))];
          const head=h("div",{class:"soc-day-head"},h("b",{text:dayName(day.iso)}),
            ...day.slots.map(r=>h("span",{class:"soc-slot",text:inLang(r.label,"en")||topics.map(t=>TOPIC_NAME[t]).join(", ")})),
            day.iso===today?h("span",{class:"soc-today mono",text:"Today"}):null,h("span",{class:"grow"}),
            h("button",{class:"btn sm",type:"button",html:IC.plus+(posts.length?"Another post":"Suggest a post"),onclick:()=>{ const s=suggestSource(socialSources(D),SS.posts,topics); pickSource(s?s.key:"",{date:day.iso}); openPanel("social"); }}));
          const box=h("div",{class:"soc-day"+(day.iso<today?" past":"")},head);
          if (!posts.length) box.append(h("p",{class:"hint",text:day.slots.length?"Nothing planned yet.":"No posts."}));
          posts.forEach(e=>box.append(entryRow(D,SS,e,draw)));
          wrap.append(box);
        });
      } else {
        const all=SS.posts.filter(e=>!CAL.status||e.status===CAL.status).slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
        if (!all.length) wrap.append(h("p",{class:"hint",text:"No posts yet. Add them from Create posts, or use Fill empty rhythm days."}));
        let cur=""; all.forEach(e=>{ if (e.date!==cur){ cur=e.date; wrap.append(h("p",{class:"soc-grp mono",text:dayName(e.date)})); } wrap.append(entryRow(D,SS,e,draw)); });
      }
    };
    draw();
  });
}
/** Plans every empty rhythm day from today: one entry per switched-on platform, captions written from a suggested source. */
function fillRhythm(D,SS,from){
  const sources=socialSources(D), today=isoDay(new Date()), L=langs(); let n=0; const used=[];
  calendarDays(SS,from).forEach(day=>{ if (day.iso<today||day.posts.length||!day.slots.length) return;
    const topics=[...new Set(day.slots.flatMap(r=>r.topics||[]))], src=suggestSource(sources,SS.posts,topics,{skip:used}); if (!src) return;
    used.push(src.key); n++;
    PLATFORMS.filter(([p])=>SS.platforms[p].on).forEach(([p])=>{ const sl=Object.fromEntries(L.map(l=>[l,slidesText(buildSlides(SS,src,l))]));
      SS.posts.push(newEntry({ date:day.iso, platform:p, status:"planned", source:src.key, label:src.label, topic:src.topic, image:src.image||"", format:SS.platforms[p].format,
        en:L.includes("en")?buildCaption(D,SS,src,p,"en").text:"", ar:L.includes("ar")?buildCaption(D,SS,src,p,"ar").text:"", slides:Object.values(sl).some(Boolean)?sl:null })); });
  });
  if (n) save();
  return n;
}
function entryRow(D,SS,e,redraw){
  const open=CAL.open===e.id, row=h("div",{class:"soc-entry"+(open?" open":"")+" st-"+e.status});
  const stSel=h("select",{class:"soc-st","aria-label":"Status"}); STATUSES.forEach(([v,l])=>stSel.append(h("option",{value:v,text:l,selected:e.status===v})));
  stSel.addEventListener("change",()=>{ e.status=stSel.value; if (e.status==="posted"&&!e.postedAt) e.postedAt=new Date().toISOString(); save(); redraw(); });
  const L=langs(), firstLang=L.find(l=>e[l])||L[0];
  row.append(h("div",{class:"soc-entry-head"},
    h("span",{class:"soc-plat-ic",title:PLATFORM_NAME[e.platform],html:PLAT_IC[e.platform]||""}),
    h("button",{class:"soc-entry-t",type:"button","aria-expanded":String(open),onclick:()=>{ CAL.open=open?"":e.id; redraw(); }},h("b",{text:e.label||"Post"}),h("small",{text:PLATFORM_NAME[e.platform]+(e.time?" · "+e.time:"")+" · "+(TOPIC_NAME[e.topic]||"")})),
    e[firstLang]?copyBtn(()=>e[firstLang],L.length>1?"Copy "+firstLang.toUpperCase():"Copy","Post copied"):null,stSel));
  if (!open) return row;
  const ed=h("div",{class:"soc-entry-body"});
  const caps=h("div",{class:"soc-caps"+(L.length>1?" two":"")});
  L.forEach(l=>{ const t=h("textarea",{class:"soc-text",rows:10,"aria-label":LANG_NAME[l]}); t.value=e[l]||""; if (l==="ar"){ t.dir="rtl"; t.lang="ar"; }
    const max=+SS.platforms[e.platform].max||2200, count=h("span",{class:"soc-count mono"}); const sync=()=>{ const n=[...t.value].length; count.textContent=n+" / "+max; count.classList.toggle("over",n>max); };
    t.addEventListener("input",()=>{ e[l]=t.value; sync(); save(); }); sync();
    caps.append(h("div",{class:"soc-cap"},h("div",{class:"soc-cap-head"},h("b",{text:LANG_NAME[l]}),count,h("span",{class:"grow"}),copyBtn(()=>t.value)),t)); });
  const meta=h("div",{class:"fields"},
    sField(e,"date","Day",{kind:"text",onChange:()=>{}}), sField(e,"time","Time (optional)",{placeholder:"09:00"}),
    sField(e,"platform","Platform",{kind:"select",options:PLATFORMS,onChange:()=>{ e.format=formatOf(e.platform,e.format)[0]; }}),
    sField(e,"url","Link to the live post (after posting)",{placeholder:"https://…"}),
    sField(e,"note","Note",{kind:"area",wide:true,rows:2}));
  const dateIn=$$("input",meta)[0]; if (dateIn){ dateIn.type="date"; dateIn.addEventListener("change",()=>redraw()); }
  const pic=h("div",{class:"soc-pic"}); const drawPic=()=>{ pic.textContent=""; const fm=h("div",{class:"chips"});
    (FORMATS[e.platform]||[]).forEach(([fk,fl,w,hh])=>fm.append(h("button",{type:"button",class:"chip"+(formatOf(e.platform,e.format)[0]===fk?" on":""),title:w+"×"+hh,text:fl,onclick:()=>{ e.format=fk; save(); drawPic(); }})));
    pic.append(h("div",{class:"field"},h("label",{text:"Picture"}),mediaPicker(e,"image",{},()=>{ save(); drawPic(); }),h("label",{text:"Size",style:"margin-top:8px"}),fm),
      h("div",{class:"soc-crop-wrap"},cropPreview(D,e.image,e.platform,e.format),h("button",{class:"btn sm",type:"button",html:IC.down+"Save picture",onclick:()=>downloadCrop(D,e.image,e.platform,e.format,slug(e.label))}))); };
  drawPic();
  ed.append(caps);
  if (e.slides&&Object.values(e.slides).some(Boolean)){ const sc=h("div",{class:"soc-caps"+(L.length>1?" two":"")});
    L.forEach(l=>{ if (!e.slides[l]) return; const t=h("textarea",{class:"soc-text",rows:6}); t.value=e.slides[l]; if (l==="ar"){ t.dir="rtl"; t.lang="ar"; } t.addEventListener("input",()=>{ e.slides[l]=t.value; save(); });
      sc.append(h("div",{class:"soc-cap"},h("div",{class:"soc-cap-head"},h("b",{text:"Carousel slides · "+LANG_NAME[l]}),h("span",{class:"grow"}),copyBtn(()=>t.value)),t)); });
    ed.append(sc); }
  ed.append(pic,meta,h("div",{class:"soc-actions"},
    e.source?h("button",{class:"btn sm",type:"button",text:"Open in Create posts",onclick:()=>{ pickSource(e.source,{date:e.date}); openPanel("social"); }}):null,
    h("button",{class:"btn sm",type:"button",html:IC.copy+"Duplicate",onclick:()=>{ const c={...JSON.parse(JSON.stringify(e)),id:newEntry({date:e.date,platform:e.platform}).id,status:"planned",externalId:"",postedAt:"",url:""}; SS.posts.push(c); CAL.open=c.id; save(); redraw(); }}),
    h("button",{class:"btn danger sm",type:"button",text:"Delete",onclick:ev=>confirmInline(ev.currentTarget,"Delete this planned post?",()=>{ SS.posts.splice(SS.posts.indexOf(e),1); save(); redraw(); },"Delete")})));
  row.append(ed); return row;
}

/* ================= SETTINGS ================= */
function panelSocialSet(body){
  withSocial(body,()=>{
    const SS=S();
    body.append(h("p",{class:"adm-intro",text:"How posts are written: the tone and template of each platform, the call to action, hashtags, carousel slides and the weekly rhythm. Arabic boxes appear when the site has Arabic (Design → Site and titles)."}),saveNote());
    body.append(card("Link back to the site",h("div",{class:"fields"},
      sField(SS,"siteUrl","Site address",{wide:true,placeholder:SOCIAL_DEFAULTS.siteUrl,hint:"Every post links to its page on this address. Change it when the site moves to its own domain."}),
      sField(SS,"utm","Add tracking to links (utm_source = platform), to see visits from each platform in analytics",{kind:"toggle"}),
      sField(SS,"bullet","Bullet for points",{placeholder:"•"}))));
    PLATFORMS.forEach(([p,name])=>{
      const P=SS.platforms[p];
      const tplBox=h("div",{class:"field wide"});
      const drawTpl=()=>{ tplBox.textContent=""; const ph2=(TONES[P.tone]||TONES.professional).tpl; tplBox.append(sBi(P,"template","Own template (empty uses the tone)",{kind:"area",rows:7,placeholder:{en:ph2,ar:ph2},
        hint:"Placeholders: "+PLACEHOLDERS.map(([k,l])=>"{"+k+"} "+l.toLowerCase()).join(" · ")+". Empty lines left by empty parts are removed."})); };
      body.append(card(h("span",{class:"grow soc-plat",html:PLAT_IC[p]+esc(name)}),
        h("div",{class:"fields"},
          sField(P,"on","Make posts for "+name,{kind:"toggle"}),
          sField(P,"tone","Tone",{kind:"select",options:Object.entries(TONES).map(([k,v])=>[k,v.label]),onChange:drawTpl}),
          sField(P,"max","Most characters",{kind:"number",min:100,step:50,hint:p==="linkedin"?"LinkedIn allows 3,000.":p==="facebook"?"Facebook allows much more, but short posts read better.":"Instagram allows 2,200."}),
          sField(P,"tags","Most hashtags",{kind:"number",min:0,max:30,step:1}),
          sField(P,"link","Put the page link in the post",{kind:"toggle",hint:p==="instagram"?"Links in Instagram captions can't be tapped, so the call to action points to the link in your bio.":""}),
          sField(P,"points","List the page's points",{kind:"toggle"}),
          sField(P,"format","Picture size to start with",{kind:"select",options:FORMATS[p].map(([k,l,w,hh])=>[k,l+" "+w+"×"+hh])}),
          sBi(P,"cta","Call to action",{}),
          tplBox)));
      drawTpl();
    });
    /* hashtag sets */
    const setsBox=h("div",{class:"soc-sets"});
    const drawSets=()=>{ setsBox.textContent="";
      SS.hashtags.forEach((x,i)=>{ x.tags=x.tags&&typeof x.tags==="object"?x.tags:{en:String(x.tags||""),ar:""};
        setsBox.append(h("div",{class:"soc-set"},h("div",{class:"fields"},
          sField(x,"name","Name"),
          sField(x,"topic","Used on",{kind:"select",options:[["all","Every post"],...TOPICS.map(([k,l])=>[k,"Posts about: "+l])]}),
          sBi(x,"tags","Hashtags (space between them)",{})),
          h("button",{class:"btn danger sm",type:"button",text:"Remove set",onclick:ev=>confirmInline(ev.currentTarget,"Remove this hashtag set?",()=>{ SS.hashtags.splice(i,1); save(); drawSets(); })}))); });
      setsBox.append(h("div",{class:"soc-actions"},
        h("button",{class:"btn sm",type:"button",html:IC.plus+"Add a set",onclick:()=>{ SS.hashtags.push({id:"h-"+Date.now().toString(36),name:"New set",topic:"all",tags:{en:"",ar:""}}); save(); drawSets(); }}),
        h("button",{class:"btn sm",type:"button",text:"Back to the suggested sets",onclick:ev=>confirmInline(ev.currentTarget,"Replace your sets with the suggested ones?",()=>{ SS.hashtags=JSON.parse(JSON.stringify(SOCIAL_DEFAULTS.hashtags)); save(); drawSets(); },"Replace")})));
    };
    drawSets();
    body.append(card("Hashtag sets",h("p",{class:"adm-intro",style:"margin:0",text:"Sets used on every post go first, then the set for the post's topic. Each platform keeps only its most hashtags. Arabic posts use the Arabic tags (or the English ones when a set has none)."}),setsBox));
    body.append(card("Carousel slides",h("div",{class:"fields"},
      sField(SS.carousel,"cover","Start with a cover slide (title and first sentence)",{kind:"toggle"}),
      sField(SS.carousel,"max","Most slides",{kind:"number",min:2,max:20,step:1,hint:"Instagram and LinkedIn take up to 10 or more; 10 is a safe default."}),
      sBi(SS.carousel,"end","End slide (empty: no end slide)",{}))));
    /* weekly rhythm */
    const rh=h("div",{class:"soc-sets"});
    const drawRh=()=>{ rh.textContent="";
      SS.rhythm.slice().sort((a,b)=>a.day-b.day).forEach(r=>{ r.topics=Array.isArray(r.topics)?r.topics:[];
        const tps=h("div",{class:"chips"}); const drawT=()=>{ tps.textContent=""; TOPICS.forEach(([k,l])=>{ const on=r.topics.includes(k); tps.append(h("button",{type:"button",class:"chip"+(on?" on":""),"aria-pressed":String(on),text:l,onclick:()=>{ if (on) r.topics=r.topics.filter(x=>x!==k); else r.topics.push(k); save(); drawT(); }})); }); };
        drawT();
        rh.append(h("div",{class:"soc-set"},h("div",{class:"fields"},
          sField(r,"day","Day",{kind:"select",options:DAYS.slice(1).map((d,i)=>[i+1,d]),onChange:drawRh}),
          sBi(r,"label","Name",{}),
          h("div",{class:"field wide"},h("label",{text:"Topics suggested on this day"}),tps)),
          h("button",{class:"btn danger sm",type:"button",text:"Remove day",onclick:()=>{ SS.rhythm.splice(SS.rhythm.indexOf(r),1); save(); drawRh(); }}))); });
      rh.append(h("div",{class:"soc-actions"},
        h("button",{class:"btn sm",type:"button",html:IC.plus+"Add a day",onclick:()=>{ SS.rhythm.push({id:"r-"+Date.now().toString(36),day:2,label:{en:"",ar:""},topics:[]}); save(); drawRh(); }}),
        h("button",{class:"btn sm",type:"button",text:"Back to the suggested rhythm",onclick:ev=>confirmInline(ev.currentTarget,"Replace your rhythm with Monday service, Wednesday project or process, Friday gift or print idea?",()=>{ SS.rhythm=JSON.parse(JSON.stringify(SOCIAL_DEFAULTS.rhythm)); save(); drawRh(); },"Replace")})));
    };
    drawRh();
    body.append(card("Weekly rhythm",h("p",{class:"adm-intro",style:"margin:0",text:"The days you post on and what each day is about. The calendar marks these days and suggests site content with these topics, starting with what hasn't been posted lately."}),
      sField(SS,"weeks","Weeks the calendar shows",{kind:"number",min:1,max:12,step:1}),rh));
    body.append(card("Where this is kept",h("p",{class:"adm-intro",style:"margin:0",text:Social.where==="db"
      ?"In the studio database, in its own editors-only table. It is never published with the site and Publish doesn't touch it. Posting is done by you: copy the text, save the picture and post it on each platform. The calendar is ready for automatic posting later (each entry is one post on one platform)."
      :Store.mode==="db"?"In this browser for now: the database table for the social plan arrives when this update is merged. Everything here moves to the database automatically the next time the studio opens after that."
      :"In this browser only (offline studio)."})));
  });
}

export { panelSocial, panelSocialCal, panelSocialSet, PLAT_IC };
