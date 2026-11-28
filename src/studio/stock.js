/* ================= STUDIO › LIBRARY › FIND PHOTOS =================
   Searches free stock photo services (Pexels, Pixabay, Unsplash) through the Supabase edge function stock-search,
   which holds the keys. Optionally Gemini turns the request (English or Arabic) into good search words.
   The editor previews each photo and adds it to the Library (with its credit and licence) or rejects it;
   rejected photos stay hidden in later searches. Pexels and Pixabay pictures are copied into Supabase Storage
   (optimized like any upload); Unsplash pictures stay on Unsplash, as its rules ask, and are credited. */
import './stock.css';
import { h, uid } from './core';
import { Store, callFunction } from './store';
import { card, toast, touch, categorySelect, assetsApi, Admin, openPanel } from './admin';
import { optimizeImage } from './optimize';
import { PROVIDERS, PROVIDER_NAME, HOW, LICENCE, LICENCE_URL, COLOURS, COLOUR_NAMES, KEY_STEPS, stockKey, freshPhotos, rejectPhoto,
  stockMedia, stockLabel, sniffType, stockFileName, stockStatus, STOCK_STATUS_TEXT, inLibrary, creditLine } from './stocktext';

const FN = "stock-search";
const SECRETS_URL = "https://supabase.com/dashboard/project/uhytsroauemdkuanwdoh/functions/secrets";
const ORIENT = [["any","Any shape"],["landscape","Landscape (wide)"],["portrait","Portrait (tall)"],["square","Square"]];

/* kept while the studio is open, so switching tabs doesn't lose the results */
const ST = { status:{ state:"unknown", providers:{} }, checking:null, request:"", style:"", query:"", alternatives:[], notes:[], photos:[], page:1,
  usedAi:false, busy:false, cat:"", showAdded:false, lastRejected:null, added:new Map() };

function settings(){
  const D=Store.draft; const s=D.stock=D.stock&&typeof D.stock==="object"?D.stock:{};
  if (!Array.isArray(s.rejected)) s.rejected=[];
  s.providers={ pexels:true, pixabay:true, unsplash:true, ...(s.providers||{}) };
  if (!s.orientation) s.orientation="any"; if (!s.colour) s.colour="any"; if (s.ai==null) s.ai=true;
  return s;
}

function checkStock(force=false){
  if (ST.checking && !force) return ST.checking;
  ST.checking=callFunction(FN,{ action:"status" }).then(r=>{ ST.status=stockStatus(r); ST.checking=null; return ST.status; });
  return ST.checking;
}

export function panelStock(body){
  const D=Store.draft, S=settings();
  body.append(h("p",{class:"adm-intro",text:"Find free photos on Pexels, Pixabay and Unsplash without leaving the studio. Describe the picture you need (in English or Arabic), let the AI choose good search words if you like, then preview the suggestions and add the ones you like to the Library, or reject the rest so they don't come back. Each photo keeps its photographer's credit and licence."}));

  const stBox=h("div",{class:"ai-status"}), setup=h("div",{}), finder=h("div",{class:"sk-finder"}), results=h("div",{class:"sk-results"});
  const paint=()=>{
    const s=ST.status; stBox.textContent="";
    stBox.append(h("p",{class:"ai-state "+s.state},h("i"),STOCK_STATUS_TEXT[s.state]||STOCK_STATUS_TEXT.error));
    if (s.state==="error"&&s.message) stBox.append(h("p",{class:"ai-note",text:s.message}));
    if (s.state==="ready"||s.state==="no_key") stBox.append(h("div",{class:"sk-chips"},...PROVIDERS.map(p=>h("span",{class:"sk-chip"+(s.providers[p]?" on":""),text:PROVIDER_NAME[p]+(s.providers[p]?": key added":": no key yet")})),
      h("span",{class:"sk-chip"+(s.ai?" on":""),text:s.ai?"AI search words: on":"AI search words: add the Gemini key (Content › AI writing)"})));
    stBox.append(h("div",{class:"ai-btns",style:"justify-content:flex-start"},h("button",{type:"button",class:"btn sm",text:"Check again",onclick:()=>{ ST.status={state:"unknown",providers:{}}; paint(); void checkStock(true).then(paint); }})));
    setup.textContent=""; setup.append(setupSteps(s));
    finder.textContent=""; finder.append(searchForm());
    drawResults();
  };

  /* ---------- the search form ---------- */
  function searchForm(){
    const s=ST.status, ready=s.state==="ready";
    const req=h("textarea",{class:"ai-brief",rows:2,placeholder:"e.g. a large format printer printing a colourful banner in a workshop · مطبعة أوفست حديثة","aria-label":"What should the picture show?"});
    req.value=ST.request; req.addEventListener("input",()=>{ ST.request=req.value; });
    req.addEventListener("keydown",e=>{ if (e.key==="Enter"&&(e.ctrlKey||e.metaKey)){ e.preventDefault(); void run(1); } });
    const style=h("input",{type:"text",placeholder:"Look and feel (optional), e.g. bright, modern, real people at work","aria-label":"Look and feel"});
    style.value=ST.style; style.addEventListener("input",()=>{ ST.style=style.value; });
    const aiOn=h("label",{class:"ai-gen"},h("input",{type:"checkbox",checked:S.ai!==false&&!!s.ai,disabled:!s.ai,onchange:e=>{ S.ai=e.target.checked; touch(); }}),
      h("span",{},"Let AI choose the search words ",h("small",{text:s.ai?"(Gemini turns your description into short English search words; one AI use)":"(needs the Gemini key from Content › AI writing)"})));
    const orient=h("select",{"aria-label":"Shape"},...ORIENT.map(([v,l])=>h("option",{value:v,text:l,selected:S.orientation===v})));
    orient.addEventListener("change",()=>{ S.orientation=orient.value; touch(); });
    const colour=h("select",{"aria-label":"Main colour"},...COLOURS.map(c=>h("option",{value:c,text:COLOUR_NAMES[c]||c,selected:S.colour===c})));
    colour.addEventListener("change",()=>{ S.colour=colour.value; touch(); });
    const provs=h("div",{class:"sk-provs",role:"group","aria-label":"Services"},...PROVIDERS.map(p=>h("label",{class:"sk-prov-t"+(s.providers[p]?"":" off"),title:s.providers[p]?"":"No key yet: see Set up"},
      h("input",{type:"checkbox",checked:S.providers[p]!==false&&!!s.providers[p],disabled:!s.providers[p],onchange:e=>{ S.providers[p]=e.target.checked; touch(); }}),PROVIDER_NAME[p])));
    if (!ST.cat || !D.categories.some(c=>c.id===ST.cat)) ST.cat=D.categories.some(c=>c.id===S.category)?S.category:"";
    const cat=categorySelect(ST.cat,v=>{ ST.cat=v; S.category=v; touch(); },{required:true}); cat.setAttribute("aria-label","Category for added photos");
    const go=h("button",{class:"btn primary",type:"button",disabled:!ready,html:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l5 5" stroke="currentColor" stroke-width="2" fill="none"/></svg>Find photos',onclick:()=>void run(1)});
    return h("div",{class:"sk-form"},
      h("label",{class:"sk-lab",text:"What should the picture show?"}),req,style,aiOn,
      h("div",{class:"sk-row"},orient,colour,provs),
      h("div",{class:"sk-row"},h("span",{class:"mono sk-small",text:"Add to"}),cat,go,ST.busy?h("span",{class:"ai-msg busy",text:"Searching…"}):null),
      ready?null:h("p",{class:"ai-note",text:"Add a key for at least one service under Set up first."}));
  }

  /* ---------- searching ---------- */
  async function run(page=1, words=""){
    const s=ST.status, request=ST.request.trim();
    if (!request && !words && page===1){ toast("Describe the picture first."); return; }
    const providers=PROVIDERS.filter(p=>s.providers[p]&&S.providers[p]!==false);
    if (!providers.length){ toast("Tick at least one service."); return; }
    const useAi=page===1&&!words&&S.ai!==false&&!!s.ai;
    ST.busy=true; finder.textContent=""; finder.append(searchForm());
    const r=await callFunction(FN,{ action:"search", request, query: words || (page>1?ST.query:(useAi?"":request)), ai:useAi, style:ST.style.trim(),
      providers, orientation:S.orientation, colour:S.colour, page, perPage:24 });
    ST.busy=false;
    if (!r||!r.ok){ toast((r&&r.message)||"The search didn't work. Try again."); finder.textContent=""; finder.append(searchForm()); return; }
    if (page===1){ ST.photos=[]; ST.added=new Map(); ST.alternatives=r.alternatives||[]; ST.usedAi=!!r.ai; }
    const seen=new Set(ST.photos.map(stockKey));
    ST.photos=ST.photos.concat((r.photos||[]).filter(p=>!seen.has(stockKey(p))));
    ST.query=r.query||words||request; ST.page=page; ST.notes=r.notes||[];
    finder.textContent=""; finder.append(searchForm()); drawResults();
    if (page===1 && results.scrollIntoView) results.scrollIntoView({behavior:"smooth",block:"start"});
  }

  /* ---------- results ---------- */
  function visible(){ return freshPhotos(ST.photos,S.rejected,D.media,{showAdded:true}).filter(p=>ST.showAdded||ST.added.has(stockKey(p))||!inLibrary(D.media).has(stockKey(p))); }
  function drawResults(){
    results.textContent="";
    if (!ST.photos.length && !ST.query) return;
    const list=visible(), hiddenRej=ST.photos.filter(p=>S.rejected.includes(stockKey(p))).length;
    const head=h("div",{class:"sk-head"},
      h("p",{class:"sk-q"},ST.usedAi?"The AI searched for ":"Searched for ",h("b",{text:"“"+ST.query+"”"}),list.length?` · ${list.length} photo${list.length===1?"":"s"}`:""),
      ST.alternatives.length?h("div",{class:"sk-alts"},h("span",{class:"mono sk-small",text:"Also try"}),...ST.alternatives.map(a=>h("button",{type:"button",class:"btn sm",text:a,onclick:()=>void run(1,a)}))):null,
      ST.lastRejected?h("p",{class:"sk-undo"},"Rejected 1 photo. ",h("button",{type:"button",class:"linkish",text:"Undo",onclick:()=>{ S.rejected=S.rejected.filter(k=>k!==ST.lastRejected); ST.lastRejected=null; touch(); drawResults(); }})):null,
      hiddenRej?h("p",{class:"ai-note",text:`${hiddenRej} photo${hiddenRej===1?" you rejected is":"s you rejected are"} hidden.`}):null,
      ...ST.notes.map(n=>h("p",{class:"ai-note ai-warn",text:noteText(n)})));
    results.append(head);
    if (!list.length){ results.append(h("p",{class:"ai-note",text:"Nothing new for these words. Try other words, another shape or colour, or tick more services."})); return; }
    const grid=h("div",{class:"sk-grid"});
    list.forEach((p,i)=>grid.append(tile(p,i,list)));
    results.append(grid,h("div",{class:"ai-btns",style:"justify-content:center"},h("button",{type:"button",class:"btn",text:ST.busy?"Loading…":"More photos",disabled:ST.busy,onclick:()=>void run(ST.page+1, ST.query)})));
  }
  const noteText=n=>{ const [p,...rest]=String(n).split(": "); return (PROVIDER_NAME[p]||p)+": "+rest.join(": "); };

  function tile(p,i,list){
    const key=stockKey(p), added=ST.added.get(key)||(inLibrary(D.media).has(key)?"yes":"");
    const img=h("img",{src:p.thumb,alt:p.alt||"",loading:"lazy",decoding:"async",referrerpolicy:"no-referrer"});
    return h("figure",{class:"sk-tile"+(added?" added":"")},
      h("button",{type:"button",class:"sk-img",title:"Preview","aria-label":"Preview: "+(p.alt||stockLabel(p)),onclick:()=>preview(list,i)},img,h("span",{class:"sk-badge",text:PROVIDER_NAME[p.provider]})),
      h("figcaption",{},h("small",{text:(p.author?"by "+p.author:"")+(p.width?` · ${p.width}×${p.height}`:"")}),
        h("div",{class:"sk-acts"},added?h("button",{type:"button",class:"btn sm",text:"In Library ✓",title:"Open it in the Library",onclick:()=>openInLibrary(key)})
          :h("button",{type:"button",class:"btn sm primary",text:"Add",onclick:e=>void add(p,e.currentTarget)}),
          added?null:h("button",{type:"button",class:"btn sm",text:"Reject",onclick:()=>reject(p)}))));
  }

  function openInLibrary(key){ const m=D.media.find(x=>x.stock&&stockKey(x.stock)===key); if (m) Admin.sel.media=m.id; closePreview(); openPanel("media"); }

  function reject(p){ const key=stockKey(p); S.rejected=rejectPhoto(S.rejected,key); ST.lastRejected=key; touch(); drawResults(); }

  /* ---------- adding to the Library ---------- */
  async function add(p,btn){
    const key=stockKey(p);
    if (!ST.cat || !D.categories.some(c=>c.id===ST.cat)){ toast("Choose the category for added photos first (beside Find photos)."); return false; }
    if (btn){ btn.disabled=true; btn.textContent="Adding…"; }
    try {
      let m;
      if (HOW[p.provider]==="link"){
        m=stockMedia(p,{ id:uid("m"), category:ST.cat, query:ST.query });
        if (p.track) void callFunction(FN,{ action:"track", url:p.track }); // Unsplash asks to be told when a photo is used
      } else {
        if (!assetsApi) throw new Error("Copying pictures needs the online studio.");
        const r=await callFunction(FN,{ action:"fetch", url:p.full });
        if (!(r instanceof Blob)) throw new Error((r&&r.message)||"The picture could not be downloaded.");
        const type=sniffType(new Uint8Array(await r.slice(0,16).arrayBuffer()));
        if (!type) throw new Error("That download wasn't a picture.");
        const file=new File([r],stockFileName(p,type,ST.query),{type});
        const o=await optimizeImage(file,D.uploads);
        const up=await assetsApi.upload(o.file,stockLabel(p,ST.query));
        m=stockMedia(p,{ id:uid("m"), category:ST.cat, query:ST.query, file:{ assetId:up.id, url:up.url, bytes:o.file.size, w:o.width||p.width, h:o.height||p.height } });
        if (o.changed) m.origBytes=o.before;
      }
      D.media.push(m); ST.added.set(key,m.id); touch(); drawResults();
      toast("Added “"+m.label+"” to the Library. "+m.caption+".");
      return true;
    } catch(e){
      toast("Couldn't add it: "+((e&&e.message)||"try again")); if (btn){ btn.disabled=false; btn.textContent="Add"; } return false;
    }
  }

  /* ---------- the big preview ---------- */
  let pv=null;
  function closePreview(){ if (pv){ pv.remove(); pv=null; document.removeEventListener("keydown",onKey); } }
  function onKey(e){ if (!pv) return; if (e.key==="Escape") closePreview(); if (e.key==="ArrowRight") pv._go(1); if (e.key==="ArrowLeft") pv._go(-1); }
  function preview(list,i){
    closePreview();
    let idx=i;
    pv=h("div",{class:"sk-back",role:"dialog","aria-modal":"true","aria-label":"Photo preview",onclick:e=>{ if (e.target===pv) closePreview(); }});
    const box=h("div",{class:"sk-pv"}); pv.append(box);
    const draw=()=>{ const p=list[idx]; box.textContent=""; if (!p) { closePreview(); return; }
      const key=stockKey(p), added=ST.added.has(key)||inLibrary(D.media).has(key);
      const big=h("img",{src:p.preview||p.thumb,alt:p.alt||"",referrerpolicy:"no-referrer"});
      box.append(
        h("div",{class:"sk-pv-img"},big,
          h("button",{type:"button",class:"sk-nav prev","aria-label":"Previous photo",disabled:idx===0,onclick:()=>pv._go(-1),text:"‹"}),
          h("button",{type:"button",class:"sk-nav next","aria-label":"Next photo",disabled:idx>=list.length-1,onclick:()=>pv._go(1),text:"›"})),
        h("div",{class:"sk-pv-info"},
          h("div",{class:"sk-pv-text"},
            h("b",{text:stockLabel(p,ST.query)}),
            h("p",{},creditLine(p.provider,p.author)+" · ",p.pageUrl?h("a",{href:p.pageUrl,target:"_blank",rel:"noopener noreferrer",text:"open on "+PROVIDER_NAME[p.provider]}):null),
            h("p",{class:"ai-note"},LICENCE[p.provider]+". ",h("a",{href:LICENCE_URL[p.provider],target:"_blank",rel:"noopener noreferrer",text:"Licence"}),
              p.width?` · ${p.width}×${p.height} px`:"", HOW[p.provider]==="link"?" · stays on Unsplash (linked), as Unsplash asks":" · copied into your Library and optimized")),
          h("div",{class:"ai-btns"},
            added?h("button",{type:"button",class:"btn",text:"Open in Library",onclick:()=>openInLibrary(key)})
              :h("button",{type:"button",class:"btn primary",text:"Add to Library",onclick:async e=>{ if (await add(p,e.currentTarget)) draw(); }}),
            added?null:h("button",{type:"button",class:"btn",text:"Reject",onclick:()=>{ reject(p); list=visible(); if (idx>=list.length) idx=list.length-1; draw(); }}),
            h("button",{type:"button",class:"btn",text:"Close",onclick:closePreview}))));
    };
    pv._go=d=>{ const n=idx+d; if (n<0||n>=list.length) return; idx=n; draw(); };
    (document.querySelector(".adm")||document.body).append(pv); document.addEventListener("keydown",onKey); draw(); // inside the studio, so it follows light or dark mode
  }

  body.append(card("Status",stBox));
  body.append(card("Set up (one time)",setup));
  body.append(card("Find photos",finder));
  body.append(results);
  body.append(card("Hidden photos",hiddenCard()));
  paint();
  void checkStock(ST.status.state==="unknown"||ST.status.state==="error").then(()=>{ if (document.body.contains(stBox)) paint(); });

  function hiddenCard(){
    const wrap=h("div",{});
    const draw=()=>{ wrap.textContent="";
      const n=S.rejected.length;
      wrap.append(h("p",{class:"ai-note",text:n?`${n} rejected photo${n===1?" is":"s are"} hidden from searches. The list keeps the newest 1,500.`:"Photos you reject are hidden from later searches. None yet."}),
        n?h("button",{type:"button",class:"btn sm",text:"Show rejected photos again",onclick:()=>{ S.rejected=[]; ST.lastRejected=null; touch(); draw(); drawResults(); }}):null);
    };
    draw(); return wrap;
  }
}

/* ---------- the one-time setup: a free key for each service ---------- */
function setupSteps(s){
  const ready=s.state==="ready";
  const d=h("details",{class:"ai-steps",open:!ready});
  d.append(h("summary",{text:ready?"Keys and how to add more":"How to add the free keys (about 3 minutes each)"}));
  const copy=t=>h("button",{type:"button",class:"btn sm",text:"Copy",onclick:async e=>{ try { await navigator.clipboard.writeText(t); e.currentTarget.textContent="Copied"; } catch { toast(t); } }});
  const ol=h("ol",{});
  ol.append(h("li",{},"Get a key from one or more services (any one is enough):",
    h("ul",{class:"sk-keys"},...PROVIDERS.map(p=>{ const k=KEY_STEPS[p];
      return h("li",{},h("b",{text:PROVIDER_NAME[p]+(s.providers&&s.providers[p]?" ✓ ":" ")}),h("a",{href:k.url,target:"_blank",rel:"noopener noreferrer",text:"get a free key"}),". "+k.how+" Secret name: ",h("code",{text:k.secret}),copy(k.secret)); }))));
  ol.append(h("li",{},"Open ",h("a",{href:SECRETS_URL,target:"_blank",rel:"noopener noreferrer",text:"Supabase › Edge Functions › Secrets"}),", press Add new secret, paste the name above as the Name and the key as the Value, and Save. Repeat for each key."));
  ol.append(h("li",{},"Come back here and press Check again."));
  d.append(ol,h("p",{class:"ai-note",text:"The keys stay on Supabase and never appear on the site. Free limits: Pexels about 200 searches an hour, Pixabay 100 a minute, Unsplash 50 an hour. Pexels and Pixabay photos are copied into your Library; Unsplash photos stay on Unsplash and show their credit. \"Let AI choose the search words\" uses the Gemini key from Content › AI writing."}));
  return d;
}
