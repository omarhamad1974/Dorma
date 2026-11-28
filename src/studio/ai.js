/* ================= STUDIO › WRITE WITH AI =================
   A small "AI" button beside text boxes opens a dialog that drafts, improves, shortens or translates the text
   (English and Arabic side by side), or describes a Library picture for its alt text and SEO fields.
   Nothing changes until the editor presses "Use this", and then it saves like any other edit.
   Gemini is called by the Supabase edge function ai-write, which holds the key; the browser never sees it.
   Content → AI writing holds the on/off switch, the model, the brand notes and the one-time setup steps. */
import './ai.css';
import { h, esc, clone, fmtDate } from './core';
import { Store, callFunction, scheduleSave, listArchive, addArchive, updateArchive, deleteArchive, loadSocial, scheduleSocialSave } from './store';
import { card, fieldsFor, toast, openPanel, confirmInline } from './admin';
import { PLATFORMS, newEntry, isoDay } from './social';
import { DESCRIBE_KEYS, toText, fromText, defaultAction, translateFrom, requestBody, statusOf, STATUS_TEXT, contextLines,
  TUNE, TUNE_KEYS, tuneSummary, pickRefs, archiveEntry, filterArchive } from './aitext';

const FN = "ai-write";
const PROJECT = "uhytsroauemdkuanwdoh";
const KEY_URL = "https://aistudio.google.com/app/apikey";
const SECRETS_URL = `https://supabase.com/dashboard/project/${PROJECT}/functions/secrets`;
const SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16.4l-1.8-4.9L5 9.7l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>';
const LANG_NAME = { en:"English", ar:"العربية" };

/* ---------- status (checked once per studio visit, again on "Check again") ---------- */
const AI = { status: { state:"unknown" }, checking: null, listeners: new Set() };
export function checkAi(force=false){
  if (AI.checking && !force) return AI.checking;
  if (!force && AI.status.state!=="unknown") return Promise.resolve(AI.status);
  AI.status = { state:"unknown" }; AI.listeners.forEach(f=>f());
  AI.checking = callFunction(FN,{ action:"status" }).then(r=>{ AI.status=statusOf(r); AI.checking=null; AI.listeners.forEach(f=>f()); return AI.status; });
  return AI.checking;
}
export const aiEnabled = () => !!(Store.draft && Store.draft.ai && Store.draft.ai.enabled!==false);

/* ---------- the button beside a text box ----------
   ctx: { label, group, kind, key, langs, get()→{en,ar}, set({en?,ar?}), image()→url|null, root (the field element) } */
export function aiButton(ctx){
  return h("button",{type:"button",class:"ai-btn",title:"Write with AI","aria-label":"Write with AI: "+ctx.label,html:SPARK+"<span>AI</span>",
    onclick:e=>{ e.preventDefault(); e.stopPropagation(); openAi(ctx); }});
}

/* nearby boxes (same section, list item or card) give the AI the facts and tone of this part of the site */
function nearby(root){
  const box=root.closest("[data-sec]")||root.closest(".sub-item")||root.closest(".card-a")||root.parentElement; if (!box) return "";
  const pairs=[];
  box.querySelectorAll(".field").forEach(f=>{
    if (f===root || root.contains(f) || f.contains(root) || f.closest(".bi-row")) return;
    const lab=(f.querySelector(":scope > .bi-label, :scope > .lab-row > label, :scope > label")||{}).textContent||"";
    const vals=[...f.querySelectorAll("input[type=text], textarea")].map(i=>i.value).filter(Boolean);
    if (vals.length) pairs.push([lab.trim(), vals.join(" / ")]);
  });
  return contextLines(pairs);
}

/* a picture shrunk to 1024px JPEG, as base64, for "Describe the picture" */
function pictureData(url){
  return new Promise((ok,no)=>{
    const img=new Image(); img.crossOrigin="anonymous"; img.decoding="async";
    img.onload=()=>{ try {
      const s=Math.min(1,1024/Math.max(img.naturalWidth||1024,img.naturalHeight||1024)), w=Math.max(1,Math.round((img.naturalWidth||1024)*s)), hh=Math.max(1,Math.round((img.naturalHeight||768)*s));
      const c=document.createElement("canvas"); c.width=w; c.height=hh; const g=c.getContext("2d"); g.fillStyle="#fff"; g.fillRect(0,0,w,hh); g.drawImage(img,0,0,w,hh);
      ok({ mime:"image/jpeg", data:c.toDataURL("image/jpeg",.82).split(",")[1] });
    } catch(e){ no(e); } };
    img.onerror=()=>no(new Error("load")); img.src=url;
  });
}

/* ---------- the dialog ---------- */
const ACTIONS = [
  ["write","Write new","What should it say? For example: a short intro to our booth production, mention 3D previews."],
  ["improve","Improve","Anything to change? For example: warmer, more direct, mention delivery. (Optional)"],
  ["shorten","Shorten","Anything that must stay? (Optional)"],
  ["translate","Translate",""],
  ["describe","Describe the picture","Anything to mention? For example: the event name. (Optional)"],
  ["archive","From archive",""],
];
const touchAi=()=>scheduleSave();

/* ---------- archive cache (Content → AI archive) ---------- */
const ARCH={ items:null, where:"local", loading:null };
function loadArch(force=false){
  if (ARCH.items && !force) return Promise.resolve(ARCH.items);
  if (!ARCH.loading) ARCH.loading=listArchive().then(r=>{ ARCH.items=r.items; ARCH.where=r.where; ARCH.loading=null; return ARCH.items; });
  return ARCH.loading;
}
async function saveToArchive(entry){
  let it; try { it=await addArchive(entry); } catch { toast("Couldn't save to the archive. Check your connection and try again."); return null; } await loadArch(); ARCH.items=[it,...ARCH.items.filter(x=>x.id!==it.id)];
  toast(ARCH.where==="db"?"Saved to the AI archive (Content → AI archive).":"Saved to the AI archive in this browser.");
  return it;
}

/* ---------- style and references in the AI window ----------
   st = { tune, presetId, refs:Set, extra, open } kept while the window is open. */
function tuneBlock(st,langs,onChange){
  const D=Store.draft, d=h("details",{class:"ai-tune"}); if (st.open) d.open=true;
  d.addEventListener("toggle",()=>{ st.open=d.open; });
  const nRefs=pickRefs([...st.refs].map(url=>({url,on:true})),st.extra).length;
  d.append(h("summary",{},h("b",{text:"Style and references"}),h("span",{text:tuneSummary(st.tune)+(nRefs?" · "+nRefs+" reference"+(nRefs>1?"s":""):"")})));
  const grid=h("div",{class:"ai-tune-grid"});
  /* presets */
  const ps=h("select",{"aria-label":"Preset"}); ps.append(h("option",{value:"",text:"Default style (AI writing tab)"}));
  (D.ai.presets||[]).forEach(p=>{ const o=h("option",{value:p.id,text:p.name}); if (p.id===st.presetId) o.selected=true; ps.append(o); });
  ps.addEventListener("change",()=>{ st.presetId=ps.value; const p=(D.ai.presets||[]).find(x=>x.id===ps.value); st.tune=clone({...D.ai.style,...(p?p.style:{})}); onChange(); });
  const saveP=h("button",{type:"button",class:"btn sm",text:"Save as preset",onclick:()=>{
    const name="My style "+((D.ai.presets||[]).length+1);
    const p={ id:"pr-"+Date.now().toString(36), name, style:clone(st.tune) }; D.ai.presets=[...(D.ai.presets||[]),p]; st.presetId=p.id; touchAi(); toast("Saved as \""+name+"\". Rename it under AI writing → Saved styles."); onChange(); }});
  grid.append(h("label",{class:"ai-f wide"},h("span",{text:"Preset"}),h("div",{class:"ai-row"},ps,saveP)));
  TUNE_KEYS.forEach(k=>{
    if (k==="arabicStyle" && !langs.includes("ar")) return;
    const sel=h("select",{}); TUNE[k].options.forEach(([v,l])=>{ const o=h("option",{value:v,text:l}); if ((st.tune[k]||"auto")===v) o.selected=true; sel.append(o); });
    sel.addEventListener("change",()=>{ st.tune[k]=sel.value; if (k==="length") onChange(); else sum(); });
    const f=h("label",{class:"ai-f"},h("span",{text:TUNE[k].label}),sel); grid.append(f);
    if (k==="length" && st.tune.length==="words"){ const w=h("input",{type:"number",min:3,max:1500,step:5,value:st.tune.words||"",placeholder:"e.g. 60"}); w.addEventListener("input",()=>{ st.tune.words=w.value===""?"":+w.value; sum(); });
      grid.append(h("label",{class:"ai-f"},h("span",{text:"Words"}),w)); }
  });
  const aud=h("input",{type:"text",value:st.tune.audience||"",placeholder:"e.g. marketing managers planning an exhibition"}); aud.addEventListener("input",()=>{ st.tune.audience=aud.value; sum(); });
  const ex=h("input",{type:"text",value:st.tune.extra||"",placeholder:"e.g. mention fast turnaround, avoid technical terms"}); ex.addEventListener("input",()=>{ st.tune.extra=ex.value; });
  grid.append(h("label",{class:"ai-f wide"},h("span",{text:"Audience"}),aud),h("label",{class:"ai-f wide"},h("span",{text:"Extra instructions"}),ex));
  /* references */
  const refBox=h("div",{class:"ai-f wide ai-refs"},h("span",{text:"Reference websites (up to 3; the AI reads them for facts and focus)"}));
  (D.ai.refs||[]).filter(r=>r&&r.url).forEach(r=>{ const c=h("input",{type:"checkbox"}); c.checked=st.refs.has(r.url);
    c.addEventListener("change",()=>{ if (c.checked) st.refs.add(r.url); else st.refs.delete(r.url); sum(); });
    refBox.append(h("label",{class:"ai-ref"},c,h("span",{text:r.note?r.note+" · ":""}),h("small",{text:r.url}))); });
  const xr=h("input",{type:"url",value:st.extra||"",placeholder:"Add a link just for this time: https://…"}); xr.addEventListener("input",()=>{ st.extra=xr.value; sum(); });
  refBox.append(xr);
  if (!(D.ai.refs||[]).length) refBox.append(h("small",{class:"ai-note",text:"Save websites you use often under Content → AI writing → Reference websites."}));
  grid.append(refBox);
  d.append(grid);
  function sum(){ const n=pickRefs([...st.refs].map(url=>({url,on:true})),st.extra).length; d.querySelector("summary span").textContent=tuneSummary(st.tune)+(n?" · "+n+" reference"+(n>1?"s":""):""); }
  return d;
}
let openDlg=null;
export function openAi(ctx){
  if (openDlg) openDlg.close();
  const D=Store.draft, langs=ctx.langs, both=langs.length>1;
  const imgUrl=DESCRIBE_KEYS.includes(ctx.key)&&ctx.image?ctx.image():null;
  const start=ctx.get();
  let action=ctx.free?"write":defaultAction({ text:start, langs, canDescribe:!!imgUrl }), from=translateFrom(start), busy=false, result=null, general=D.ai.general===true, info=null;
  const st={ tune:clone(D.ai.style||{}), presetId:"", refs:new Set(pickRefs(D.ai.refs)), extra:"", open:false, q:"" };

  const back=h("div",{class:"ai-back"}), dlg=h("div",{class:"ai-dlg",role:"dialog","aria-modal":"true","aria-label":"Write with AI"});
  const close=()=>{ removeEventListener("keydown",onKey); back.remove(); openDlg=null; ctx.root?.querySelector(".ai-btn")?.focus({preventScroll:true}); };
  const onKey=e=>{ if (e.key==="Escape"){ e.preventDefault(); close(); } };
  addEventListener("keydown",onKey); back.addEventListener("pointerdown",e=>{ if (e.target===back) close(); });
  openDlg={ close };

  const head=h("div",{class:"ai-head"},h("span",{class:"ai-mark",html:SPARK}),h("div",{class:"ai-ttl"},h("b",{text:"Write with AI"}),h("span",{text:ctx.group&&ctx.group!==ctx.label?ctx.group+" · "+ctx.label:ctx.label})),
    h("button",{type:"button",class:"ai-x","aria-label":"Close",text:"×",onclick:close}));
  const body=h("div",{class:"ai-body"});
  dlg.append(head,body); back.append(dlg); (document.querySelector(".adm")||document.body).append(back); // inside the studio, so it follows light or dark mode

  function draw(){
    body.textContent="";
    const state=AI.status.state;
    if (state==="unknown"){ body.append(h("p",{class:"ai-note",text:"Checking AI writing…"})); return; }
    if (state!=="ready"){ body.append(notReady(state,close)); return; }
    /* actions */
    const tabs=h("div",{class:"ai-acts",role:"tablist"});
    const hasText=langs.some(l=>String(ctx.get()[l]||"").trim());
    ACTIONS.filter(([a])=>(a!=="describe"||imgUrl)&&(a!=="translate"||both)&&(hasText||a==="write"||a==="describe"||a==="archive")).forEach(([a,l])=>tabs.append(h("button",{type:"button",role:"tab","aria-selected":a===action?"true":"false",class:a===action?"on":"",text:l,onclick:()=>{ action=a; result=null; draw(); }})));
    body.append(tabs);
    if (action==="translate"){
      const cur=ctx.get(), row=h("div",{class:"ai-dir"});
      [["en","English → العربية"],["ar","العربية → English"]].forEach(([l,t])=>row.append(h("button",{type:"button",class:"btn sm"+(from===l?" primary":""),text:t,disabled:!String(cur[l]||"").trim(),
        onclick:()=>{ from=l; result=null; draw(); }})));
      body.append(row);
    }
    if (action==="describe" && imgUrl) body.append(h("img",{class:"ai-pic",src:imgUrl,alt:""}));
    if (action==="archive"){ body.append(archivePick(st,(it)=>{ result={}; langs.forEach(l=>{ if (it[l]) result[l]=it[l]; }); if (!Object.keys(result).length) result={en:it.en,ar:it.ar}; draw(); })); }
    const hint=(ACTIONS.find(x=>x[0]===action)||[])[2];
    const brief=hint?h("textarea",{class:"ai-brief",rows:2,placeholder:hint,"aria-label":"What should it say"}):null;
    if (brief){ brief.value=body.dataset.brief||""; brief.addEventListener("input",()=>{ body.dataset.brief=brief.value; }); body.append(brief); }
    /* general industry knowledge (offset, digital printing…) on top of the site's own facts */
    if (action!=="translate" && action!=="describe" && action!=="archive"){
      body.append(tuneBlock(st,langs,draw));
      const g=h("input",{type:"checkbox"}); g.checked=general; g.addEventListener("change",()=>{ general=g.checked; });
      body.append(h("label",{class:"ai-gen",title:"General explanations are allowed. Facts about Dorma (clients, results, numbers, what Dorma offers) still come only from your site and notes."},g,
        h("span",{},h("b",{text:"Use general industry knowledge"}),h("small",{text:" e.g. how offset or digital printing works. Facts about Dorma still come only from your site."}))));
    }
    const go=h("button",{type:"button",class:"btn primary",html:SPARK+(result?"Try again":{write:"Write",improve:"Improve",shorten:"Shorten",translate:"Translate",describe:"Describe"}[action]),disabled:busy});
    const msg=h("span",{class:"ai-msg",role:"status"});
    if (action!=="archive") body.append(h("div",{class:"ai-go"},go,msg));
    if (info && result){ const n=h("p",{class:"ai-note"});
      if (info.refs&&info.refs.length) n.append("Read: ",...info.refs.map((r,i)=>h("a",{href:r.url,target:"_blank",rel:"noopener",text:(i?", ":"")+(r.title||new URL(r.url).hostname)})),". ");
      if (info.notes&&info.notes.length) n.append(h("span",{class:"ai-warn",text:"Couldn't use: "+info.notes.join("; ")+"."}));
      if (n.childNodes.length) body.append(n); }
    go.addEventListener("click",run);
    if (brief) brief.addEventListener("keydown",e=>{ if (e.key==="Enter"&&(e.metaKey||e.ctrlKey)){ e.preventDefault(); run(); } });

    /* now and the suggestion, per language */
    const cur=ctx.get(), outLangs=action==="translate"?langs.filter(l=>l!==from):langs;
    const cols=h("div",{class:"ai-cols"+(outLangs.length>1?" two":"")}), picks={};
    outLangs.forEach(l=>{
      const col=h("div",{class:"ai-col"});
      const use=h("input",{type:"checkbox"}); use.checked=!!(result&&result[l]); use.disabled=!(result&&result[l]);
      col.append(h("div",{class:"ai-col-h"},h("b",{text:both?LANG_NAME[l]:"Suggestion"}),result&&result[l]?h("label",{class:"ai-use"},use,"Use"):null));
      const ta=h("textarea",{class:"ai-out",rows:ctx.kind==="text"?2:ctx.kind==="prose"?10:5,placeholder:busy?"Writing…":"The suggestion appears here. You can edit it before using it.","aria-label":"Suggestion "+LANG_NAME[l]});
      if (l==="ar"){ ta.dir="rtl"; ta.lang="ar"; }
      ta.value=result&&result[l]?result[l]:""; ta.readOnly=!result;
      ta.addEventListener("input",()=>{ result[l]=ta.value; });
      col.append(ta);
      const now=String(cur[l]||"").trim();
      if (!ctx.free) col.append(h("p",{class:"ai-now",dir:l==="ar"?"rtl":null,text:(l==="ar"?"الآن: ":"Now: ")+(now?(now.length>220?now.slice(0,220)+"…":now):(l==="ar"?"فارغ":"empty"))}));
      picks[l]=use; cols.append(col);
    });
    body.append(cols);
    const apply=h("button",{type:"button",class:"btn primary",text:ctx.free?"Save to archive":"Use this",disabled:!result});
    const entry=()=>archiveEntry({ result, brief:body.dataset.brief||"", label:ctx.label, group:ctx.group||"", action, tune:st.tune, refs:pickRefs([...st.refs].map(url=>({url,on:true})),st.extra), general });
    apply.addEventListener("click",async()=>{
      const val={}; Object.keys(picks).forEach(l=>{ if (picks[l].checked && result[l]!=null) val[l]=result[l]; });
      if (!Object.keys(val).length){ toast("Tick at least one language to use."); return; }
      if (ctx.free){ apply.disabled=true; const e=entry(); e.en=val.en||""; e.ar=val.ar||""; if (!(await saveToArchive(e))){ apply.disabled=false; return; } ctx.set(val); close(); return; }
      ctx.set(val); close(); toast("Added. Check it over; it saves like any other edit.");
    });
    const keep=ctx.free?null:h("button",{type:"button",class:"btn",text:"Save to archive",disabled:!result,title:"Keep this text to reuse later on the site or in a Social post",
      onclick:async()=>{ keep.disabled=true; if (await saveToArchive(entry())) keep.textContent="Saved ✓"; else keep.disabled=false; }});
    const st2=AI.status, usage=st2.limit?`Today: ${st2.used||0} of ${st2.limit} AI requests`:"";
    body.append(h("div",{class:"ai-foot"},h("p",{class:"ai-note",html:"AI can get things wrong, so read it before you publish. It doesn't make up clients or results: missing facts show as <b>[To be supplied by Dorma]</b>."+(usage?"<br>"+esc(usage):"")}),
      h("div",{class:"ai-btns"},h("button",{type:"button",class:"btn",text:"Cancel",onclick:close}),keep,apply)));
    if (brief && !result) setTimeout(()=>brief.focus({preventScroll:true}),30);

    async function run(){
      if (busy) return;
      busy=true; go.disabled=true; msg.textContent=action==="describe"?"Looking at the picture…":"Writing…"; msg.className="ai-msg busy";
      let image=null;
      if (action==="describe"){
        try { image=await pictureData(imgUrl); }
        catch { busy=false; go.disabled=false; msg.className="ai-msg err"; msg.textContent="Couldn't read this picture from here. Write the text yourself, or try a picture uploaded to Supabase."; return; }
      }
      const r=await callFunction(FN,requestBody({ action, langs, text:ctx.get(), from, brief:brief?brief.value:"",
        field:{ label:ctx.label, group:ctx.group||"", kind:ctx.kind, key:ctx.key||"" }, context:ctx.free?"":nearby(ctx.root), ai:D.ai, image, general,
        tune:(action==="translate"||action==="describe")?{}:st.tune, refs:(action==="translate"||action==="describe")?[]:pickRefs([...st.refs].map(url=>({url,on:true})),st.extra) }));
      busy=false;
      if (r.used!=null) AI.status={ ...AI.status, used:r.used, limit:r.limit||AI.status.limit };
      if (!r.ok){
        if (r.code==="no_key"||r.code==="not_deployed"){ AI.status=statusOf(r); draw(); return; }
        go.disabled=false; msg.className="ai-msg err"; msg.textContent=r.message||"Something went wrong. Try again."; return;
      }
      result={ ...(r.text||{}) }; info={ refs:r.refs||[], notes:r.notes||[] }; draw();
    }
  }
  const off=()=>{ if (!document.body.contains(back)){ AI.listeners.delete(redraw); return; } };
  const redraw=()=>{ off(); if (!busy && document.body.contains(back)) draw(); };
  AI.listeners.add(redraw);
  draw(); void checkAi();
}

/* "From archive" tab: pick a saved text to use in this box */
function archivePick(st,onPick){
  const box=h("div",{class:"ai-arch-pick"});
  const q=h("input",{type:"search",value:st.q||"",placeholder:"Search the archive…","aria-label":"Search the archive"});
  const list=h("div",{class:"ai-arch-list"});
  const paint=()=>{ list.textContent="";
    if (!ARCH.items){ list.append(h("p",{class:"ai-note",text:"Loading…"})); return; }
    const found=filterArchive(ARCH.items,st.q).slice(0,30);
    if (!found.length){ list.append(h("p",{class:"ai-note",text:ARCH.items.length?"Nothing matches.":"The archive is empty. Press Save to archive on any AI text to keep it."})); return; }
    found.forEach(it=>list.append(h("button",{type:"button",class:"ai-arch-row",onclick:()=>onPick(it)},h("b",{text:it.title}),h("span",{text:(it.en||it.ar).slice(0,140)}),h("small",{text:fmtDate(it.created_at)+((it.tags||[]).length?" · "+it.tags.join(", "):"")})))); };
  q.addEventListener("input",()=>{ st.q=q.value; paint(); });
  box.append(q,list); paint(); loadArch().then(paint);
  return box;
}

/* what to do when AI writing isn't ready yet */
function notReady(st,close){
  const box=h("div",{class:"ai-ready"});
  box.append(h("p",{text:STATUS_TEXT[st]||STATUS_TEXT.error}));
  if (AI.status.message && st==="error") box.append(h("p",{class:"ai-note",text:AI.status.message}));
  if (st==="no_key"||st==="not_deployed"||st==="error") box.append(h("div",{class:"ai-btns"},
    h("button",{type:"button",class:"btn",text:"Check again",onclick:()=>void checkAi(true)}),
    h("button",{type:"button",class:"btn primary",text:"Show me how",onclick:()=>{ close(); openPanel("ai"); }})));
  return box;
}

/* ================= Content → AI writing ================= */
export function panelAI(body){
  const D=Store.draft;
  body.append(h("p",{class:"adm-intro",text:"Write with AI adds a small AI button beside the text boxes in the studio. It drafts, improves, shortens and translates text in English and Arabic side by side, and describes Library pictures for their alt text and SEO fields. You always see the suggestion first and choose whether to use it. It uses Google's free Gemini service through your own Supabase project, so the key never appears on the site."}));

  const stBox=h("div",{class:"ai-status"});
  const setup=h("div",{});
  const paint=()=>{
    if (!document.body.contains(stBox)){ AI.listeners.delete(paint); return; }
    const s=AI.status;
    stBox.textContent="";
    stBox.append(h("p",{class:"ai-state "+s.state},h("i"),STATUS_TEXT[s.state]||STATUS_TEXT.error));
    if (s.state==="error" && s.message) stBox.append(h("p",{class:"ai-note",text:s.message}));
    if (s.state==="ready" && s.limit) stBox.append(h("p",{class:"ai-note",text:`Today you have used ${s.used||0} of ${s.limit} AI requests. The count starts again at midnight (UTC).`}));
    stBox.append(h("div",{class:"ai-btns",style:"justify-content:flex-start"},h("button",{type:"button",class:"btn sm",text:"Check again",onclick:()=>void checkAi(true)})));
    setup.textContent=""; setup.append(setupSteps(s.state!=="ready"));
  };
  AI.listeners.add(paint);
  body.append(card("Status",stBox));
  body.append(card("Set up (one time)",setup));
  body.append(card("Settings",fieldsFor(D.ai,[
    ["enabled","toggle","Show the AI buttons beside text boxes"],
    ["general","toggle","Use general industry knowledge by default (how offset or digital printing works, materials, finishing…). Facts about Dorma still come only from the site and the notes below"],
    ["model","select","Gemini model",{options:[["flash","Gemini Flash: better writing (recommended)"],["lite","Gemini Flash-Lite: lighter, more free uses per day"]],preview:false}],
  ])));
  body.append(card("What the AI should know",
    h("p",{class:"adm-intro",style:"margin:0",text:"Sent with every request. Facts about Dorma come only from these notes, the box you are writing in and the boxes around it. It never invents clients, projects, numbers or results, or says Dorma offers something the site doesn't; where a fact is missing it writes [To be supplied by Dorma] so you can fill it in. With general industry knowledge on, it may also explain topics in general terms (for example how offset printing differs from digital)."}),
    fieldsFor(D.ai,[
      ["brand","area","About Dorma: facts and voice",{wide:true,hint:"Add real facts you are happy for it to use (services, years, places you work). Leave out anything private."}],
      ["arabic","area","Notes for the Arabic",{wide:true}],
      ["avoid","text","Words and phrases to avoid",{wide:true,hint:"Separate with commas."}],
    ])));
  body.append(card("Default style",
    h("p",{class:"adm-intro",style:"margin:0",text:"How the AI writes unless you choose otherwise in the AI window. \"Fits the box\" lets it decide from the kind of box (a title stays short, a blog post is longer)."}),
    styleFields(D.ai.style)));
  body.append(card("Saved styles (presets)",presetsEditor()));
  body.append(card("Reference websites",refsEditor()));
  body.append(card("Try it",tryIt()));
  paint(); void checkAi(true);
}

/* the length and style choices as studio fields (Default style, and each preset) */
function styleFields(obj,onChange=()=>{}){
  const D=Store.draft, langs=D.site.languages==="en"?["en"]:["en","ar"], wrap=h("div",{});
  const draw=()=>{ wrap.textContent="";
    const schema=TUNE_KEYS.filter(k=>k!=="arabicStyle"||langs.includes("ar")).map(k=>[k,"select",TUNE[k].label,{options:TUNE[k].options.map(([v,l])=>[v,l]),preview:false}]);
    if (obj.length==="words") schema.splice(1,0,["words","number","Words",{min:3,optional:true,placeholder:"e.g. 60"}]);
    schema.push(["audience","text","Audience",{wide:true,placeholder:"e.g. marketing managers planning an exhibition"}],["extra","text","Extra instructions",{wide:true,placeholder:"e.g. always mention delivery and installation"}]);
    wrap.append(fieldsFor(obj,schema,(v,k)=>{ onChange(); if (k==="length") draw(); }));
  };
  draw(); return wrap;
}

function presetsEditor(){
  const D=Store.draft, box=h("div",{class:"ai-presets"});
  const draw=()=>{ box.textContent="";
    box.append(h("p",{class:"adm-intro",style:"margin:0",text:"Named styles you can pick in the AI window under Style and references, for example one for LinkedIn posts and one for service pages."}));
    (D.ai.presets||[]).forEach((p,i)=>{
      const d=h("details",{class:"ai-preset"});
      const name=h("input",{type:"text",value:p.name,"aria-label":"Preset name"}); name.addEventListener("input",()=>{ p.name=name.value; touchAi(); });
      const del=h("button",{type:"button",class:"btn sm danger",text:"Remove",onclick:()=>confirmInline(del,"Remove this preset?",()=>{ D.ai.presets.splice(i,1); touchAi(); draw(); })});
      const asDef=h("button",{type:"button",class:"btn sm",text:"Use as default style",onclick:()=>{ D.ai.style={...D.ai.style,...clone(p.style)}; touchAi(); toast("Default style updated."); openPanel("ai"); }});
      d.append(h("summary",{},h("b",{text:p.name||"Untitled"}),h("span",{text:tuneSummary(p.style)})),
        h("div",{class:"ai-row"},name,asDef,del), styleFields(p.style=p.style||{},()=>{ d.querySelector("summary span").textContent=tuneSummary(p.style); }));
      box.append(d);
    });
    box.append(h("div",{class:"ai-row"},h("button",{type:"button",class:"btn sm",text:"New preset from the default style",onclick:()=>{ D.ai.presets=[...(D.ai.presets||[]),{ id:"pr-"+Date.now().toString(36), name:"New style", style:clone(D.ai.style) }]; touchAi(); draw(); }})));
  };
  draw(); return box;
}

function refsEditor(){
  const D=Store.draft, box=h("div",{class:"ai-refs-ed"});
  const draw=()=>{ box.textContent="";
    box.append(h("p",{class:"adm-intro",style:"margin:0",text:"Websites with useful information (a supplier's guide to paper types, an exhibition's rules, a trade glossary…). Ticked ones are read with every request by default; you can change it in the AI window. The AI uses them for facts and terms, writes in its own words, and never presents another company's clients or numbers as Dorma's. Up to 3 pages are read per request; pages that need JavaScript or a login can't be read."}));
    (D.ai.refs||[]).forEach((r,i)=>{
      const on=h("input",{type:"checkbox","aria-label":"Use by default"}); on.checked=!!r.on; on.addEventListener("change",()=>{ r.on=on.checked; touchAi(); });
      const url=h("input",{type:"url",value:r.url||"",placeholder:"https://…","aria-label":"Address"}); url.addEventListener("input",()=>{ r.url=url.value.trim(); touchAi(); });
      const note=h("input",{type:"text",value:r.note||"",placeholder:"What it's about","aria-label":"What it's about"}); note.addEventListener("input",()=>{ r.note=note.value; touchAi(); });
      const del=h("button",{type:"button",class:"btn sm danger",text:"Remove",onclick:()=>{ D.ai.refs.splice(i,1); touchAi(); draw(); }});
      box.append(h("div",{class:"ai-ref-row"},h("label",{class:"ai-ref-on",title:"Use by default"},on,"Default"),url,note,del));
    });
    box.append(h("div",{class:"ai-row"},h("button",{type:"button",class:"btn sm",text:"Add a website",onclick:()=>{ D.ai.refs=[...(D.ai.refs||[]),{url:"",note:"",on:false}]; touchAi(); draw(); }})));
  };
  draw(); return box;
}

/* ================= Content → AI archive =================
   Every AI text saved with "Save to archive": search it, edit it, copy it, use it in a box (AI window → From archive)
   or send it to the Social calendar as a drafted post. */
export function panelArchive(body){
  const D=Store.draft, langs=D.site.languages==="en"?["en"]:D.site.languages==="ar"?["ar"]:["en","ar"];
  const S={ q:"", tag:"", n:30 };
  body.append(h("p",{class:"adm-intro",text:"AI texts you saved to reuse later. Use one in any text box through the AI button (From archive), copy it, or send it to the Social calendar as a drafted post. Write something new here for social media or anything that isn't tied to a box yet."}));
  const free=h("button",{type:"button",class:"btn primary",html:SPARK+"Write something new with AI",onclick:()=>openAi({ free:true, label:"Free text", group:"AI archive", kind:"area", key:"", langs, root:body,
    get:()=>({}), set:()=>{ paint(); } })});
  const q=h("input",{type:"search",placeholder:"Search titles, tags and text…","aria-label":"Search the archive"});
  const tagSel=h("select",{"aria-label":"Tag"});
  const where=h("span",{class:"ai-note"});
  const list=h("div",{class:"ai-arch"});
  body.append(h("div",{class:"ai-arch-bar"},free,q,tagSel,where),list);
  q.addEventListener("input",()=>{ S.q=q.value; S.n=30; paint(); });
  tagSel.addEventListener("change",()=>{ S.tag=tagSel.value; S.n=30; paint(); });
  function paint(){
    if (!document.body.contains(list)) return;
    list.textContent="";
    if (!ARCH.items){ list.append(h("p",{class:"ai-note",text:"Loading the archive…"})); return; }
    where.textContent=ARCH.where==="db"?ARCH.items.length+" saved":"Saved in this browser only ("+ARCH.items.length+")";
    const tags=[...new Set(ARCH.items.flatMap(x=>x.tags||[]))].sort();
    tagSel.textContent=""; tagSel.append(h("option",{value:"",text:"All tags"})); tags.forEach(t=>{ const o=h("option",{value:t,text:t}); if (t===S.tag) o.selected=true; tagSel.append(o); });
    const found=filterArchive(ARCH.items,S.q,S.tag);
    if (!found.length){ list.append(h("p",{class:"ai-note",text:ARCH.items.length?"Nothing matches.":"Nothing saved yet. In the AI window, press Save to archive to keep a text here."})); return; }
    found.slice(0,S.n).forEach(it=>list.append(archiveCard(it,langs,paint)));
    if (found.length>S.n) list.append(h("button",{type:"button",class:"btn",text:"Show more ("+(found.length-S.n)+")",onclick:()=>{ S.n+=30; paint(); }}));
  }
  paint(); loadArch(true).then(paint);
}

function archiveCard(it,langs,repaint){
  const c=h("div",{class:"ai-arch-card"});
  const save=(patch)=>{ Object.assign(it,patch); clearTimeout(c._t); c._t=setTimeout(()=>void updateArchive(it.id,patch),600); };
  const title=h("input",{type:"text",class:"ai-arch-title",value:it.title,"aria-label":"Title"}); title.addEventListener("input",()=>save({title:title.value}));
  const tags=h("input",{type:"text",value:(it.tags||[]).join(", "),placeholder:"Tags, separated by commas","aria-label":"Tags"});
  tags.addEventListener("change",()=>save({tags:tags.value.split(",").map(x=>x.trim()).filter(Boolean)}));
  const m=it.meta||{}, info=[fmtDate(it.created_at), m.box&&m.box!=="Free text"?"for "+(m.where&&m.where!==m.box?m.where+" › ":"")+m.box:"", m.tune?tuneSummary(m.tune):""].filter(x=>x&&x!=="Automatic").join(" · ");
  c.append(h("div",{class:"ai-row"},title),h("div",{class:"ai-row"},tags),h("small",{class:"ai-note",text:info+(m.brief?" · Brief: "+m.brief:"")}));
  const cols=h("div",{class:"ai-cols"+(langs.length>1?" two":"")});
  langs.forEach(l=>{ const ta=h("textarea",{class:"ai-out",rows:4,"aria-label":l==="ar"?"Arabic":"English"}); ta.value=it[l]||""; if (l==="ar"){ ta.dir="rtl"; ta.lang="ar"; }
    ta.addEventListener("input",()=>save({[l]:ta.value}));
    cols.append(h("div",{class:"ai-col"},h("div",{class:"ai-col-h"},h("b",{text:LANG_NAME[l]}),h("button",{type:"button",class:"btn sm",text:"Copy",onclick:async()=>{ try { await navigator.clipboard.writeText(ta.value); toast("Copied."); } catch { ta.select(); } }})),ta)); });
  c.append(cols);
  /* send to Social */
  const plat=h("select",{"aria-label":"Platform"}); PLATFORMS.forEach(([v,l])=>plat.append(h("option",{value:v,text:l})));
  const day=h("input",{type:"date",value:isoDay(new Date()),"aria-label":"Date"});
  const send=h("button",{type:"button",class:"btn sm",text:"Add to Social calendar",onclick:async()=>{
    const S=await loadSocial(); S.posts=S.posts||[];
    S.posts.push(newEntry({ date:day.value||isoDay(new Date()), platform:plat.value, label:it.title, en:it.en, ar:it.ar, status:"drafted", source:"ai-archive:"+it.id }));
    scheduleSocialSave(); toast("Added to the Social calendar as a drafted post."); }});
  const del=h("button",{type:"button",class:"btn sm danger",text:"Delete",onclick:()=>confirmInline(del,"Delete this text from the archive?",async()=>{ await deleteArchive(it.id); ARCH.items=ARCH.items.filter(x=>x.id!==it.id); repaint(); },"Delete")});
  c.append(h("div",{class:"ai-row ai-arch-actions"},plat,day,send,h("span",{class:"grow"}),del));
  return c;
}

function setupSteps(open){
  const d=h("details",{class:"ai-steps"}); if (open) d.open=true;
  d.append(h("summary",{text:open?"Three short steps, about two minutes":"Steps (done). Open to see them again or change the key"}));
  const copy=(txt)=>h("button",{type:"button",class:"btn sm",text:"Copy",onclick:async()=>{ try { await navigator.clipboard.writeText(txt); toast("Copied "+txt); } catch { toast(txt); } }});
  const ol=h("ol",{});
  ol.append(h("li",{},h("b",{text:"Get a free Gemini key. "}),"Open ",h("a",{href:KEY_URL,target:"_blank",rel:"noopener",text:"Google AI Studio → API keys"}),", sign in with your Google account and press ",h("b",{text:"Create API key"}),". Copy the key. No card or billing is needed; leave billing off to stay free."));
  ol.append(h("li",{},h("b",{text:"Add it to Supabase. "}),"Open ",h("a",{href:SECRETS_URL,target:"_blank",rel:"noopener",text:"Supabase → Edge Functions → Secrets"}),". Add a secret named ",h("code",{text:"GEMINI_API_KEY"})," ",copy("GEMINI_API_KEY")," and paste the key as its value, then press ",h("b",{text:"Save"}),"."));
  ol.append(h("li",{},h("b",{text:"Check. "}),"Come back here and press ",h("b",{text:"Check again"}),". When it says Ready, the AI buttons work."));
  d.append(ol);
  d.append(h("p",{class:"ai-note",text:"Good to know: on Google's free tier, Google may use what you send to improve its services, so don't paste private or confidential information. The free allowance has daily and per-minute limits; if you reach them, the studio says so and you can try again later. The studio also stops at 150 requests per editor per day."}));
  return d;
}

function tryIt(){
  const wrap=h("div",{class:"fields"}), D=Store.draft;
  const langs=D.site.languages==="both"?["en","ar"]:D.site.languages==="ar"?["ar"]:["en"];
  const brief=h("input",{type:"text",value:"One sentence that introduces Dorma to a new visitor.","aria-label":"Brief"});
  const out=h("div",{class:"ai-try"}), go=h("button",{type:"button",class:"btn primary",html:SPARK+"Write a test sentence"});
  go.addEventListener("click",async()=>{
    go.disabled=true; out.textContent="Writing…";
    const r=await callFunction(FN,requestBody({ action:"write", langs, text:{}, brief:brief.value, field:{label:"Test sentence",kind:"text"}, ai:D.ai }));
    go.disabled=false; out.textContent="";
    if (!r.ok){ out.append(h("p",{class:"ai-msg err",text:r.message||"Something went wrong."})); if (r.code==="no_key"||r.code==="not_deployed"){ AI.status=statusOf(r); AI.listeners.forEach(f=>f()); } return; }
    if (r.used!=null){ AI.status={...AI.status,used:r.used,limit:r.limit||AI.status.limit}; AI.listeners.forEach(f=>f()); }
    langs.forEach(l=>{ if (r.text&&r.text[l]) out.append(h("p",{dir:l==="ar"?"rtl":null,lang:l,text:r.text[l]})); });
  });
  wrap.append(h("div",{class:"field wide"},h("label",{text:"Ask for"}),brief),h("div",{class:"field wide"},h("div",{class:"ai-btns",style:"justify-content:flex-start"},go),out));
  return wrap;
}

export { toText, fromText };
