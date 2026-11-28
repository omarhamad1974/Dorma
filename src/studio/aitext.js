/* ================= WRITE WITH AI: plain helpers =================
   No DOM and no network here, so tests/ai.test.ts can check them. The dialog is in ai.js. */
import { TUNE, TUNE_KEYS } from '../../supabase/functions/ai-write/prompt';
export { TUNE, TUNE_KEYS };

/** Fields whose picture can be described (Library › SEO). */
export const DESCRIBE_KEYS = ["alt","title","caption","description"];

/** A box's value as text: a list (strings) becomes one item per line. */
export const toText = (v,kind) => Array.isArray(v) ? v.join("\n") : (v==null ? "" : String(v));
/** Text back into the box's shape. */
export const fromText = (s,kind) => kind==="strings" ? String(s||"").split("\n").map(x=>x.trim()).filter(Boolean) : String(s||"");

/** Which action the dialog opens on. */
export function defaultAction({ text={}, langs=["en"], canDescribe=false }){
  const has = langs.filter(l=>String(text[l]||"").trim());
  if (canDescribe && !has.length) return "describe";
  if (!has.length) return "write";
  if (langs.length>1 && has.length===1) return "translate";
  return "improve";
}

/** Translate direction: from the language that has text (English first when both do). */
export const translateFrom = (text={}, pref) => pref && String(text[pref]||"").trim() ? pref : String(text.en||"").trim() ? "en" : "ar";

/** The body sent to the ai-write edge function. */
/** @param {{action:string, langs:string[], text:Record<string,any>, from?:string, brief?:string, field:object, context?:string, ai?:Record<string,any>, image?:any, general?:boolean, tune?:Record<string,any>, refs?:string[]}} o */
export function requestBody({ action, langs, text, from, brief="", field, context="", ai={}, image=null, general, tune, refs }){
  const t={}; ["en","ar"].forEach(l=>{ const v=String(text?.[l]||""); if (v.trim()) t[l]=v; });
  return {
    action, langs: action==="translate" ? ["en","ar"] : langs, text: t,
    from: action==="translate" ? translateFrom(t, from) : undefined,
    brief: String(brief||"").trim(), field, context: String(context||"").slice(0,4000),
    brand: ai.brand||"", arabic: ai.arabic||"", avoid: ai.avoid||"", model: ai.model==="lite"?"lite":"flash",
    general: general==null ? ai.general===true : !!general,
    image: action==="describe" ? image : null,
    tune: tune || ai.style || {},
    refs: (refs || []).filter(u=>typeof u==="string" && /^https?:\/\//i.test(u.trim())).slice(0,3),
  };
}

/** A short line describing a style, e.g. "Short · Friendly · Social media post". */
export function tuneSummary(t={}){
  const parts=[];
  TUNE_KEYS.forEach(k=>{ const v=t[k]; if (!v||v==="auto") return;
    if (k==="length"&&v==="words"){ if (t.words) parts.push(t.words+" words"); return; }
    const o=TUNE[k].options.find(x=>x[0]===v); if (o) parts.push(o[1]); });
  if (t.audience) parts.push("for "+t.audience);
  return parts.join(" · ")||"Automatic";
}

/** The reference links used by default: saved ones that are switched on, plus one typed for this time. */
export function pickRefs(saved=[], extra=""){
  const out=(saved||[]).filter(r=>r&&r.on&&r.url).map(r=>String(r.url).trim());
  const x=String(extra||"").trim(); if (x) out.push(/^https?:\/\//i.test(x)?x:"https://"+x);
  return [...new Set(out)].slice(0,3);
}

/** An archive entry from an AI result. */
export function archiveEntry({ result={}, brief="", label="", group="", action="", tune={}, refs=[], general=false }){
  const t=String(brief||"").trim().replace(/\s+/g," ");
  const first=String(result.en||result.ar||"").trim().replace(/\s+/g," ");
  const title=(t||first).slice(0,80)||label||"AI text";
  const tags=[group,label].map(x=>String(x||"").trim()).filter((x,i,a)=>x&&a.indexOf(x)===i).slice(0,3);
  return { title, tags, en:String(result.en||""), ar:String(result.ar||""), meta:{ action, box:label, where:group, brief:t, tune, refs, general } };
}

/** Archive search: words in the title, tags, text or brief; and an optional tag. */
export function filterArchive(items=[], q="", tag=""){
  const words=String(q||"").toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter(it=>{
    if (tag && !(it.tags||[]).includes(tag)) return false;
    const hay=[it.title,(it.tags||[]).join(" "),it.en,it.ar,it.meta&&it.meta.brief].join(" ").toLowerCase();
    return words.every(w=>hay.includes(w));
  });
}

/** Plain-language status for the studio, from the edge function's status answer (or an error). */
export function statusOf(r){
  if (!r) return { state:"unknown" };
  if (r.ok) return { state: r.ready ? "ready" : "no_key", used: r.used||0, limit: r.limit||0 };
  const map = { no_key:"no_key", not_deployed:"not_deployed", no_table:"not_deployed", offline:"offline", signed_out:"signed_out", not_editor:"not_editor" };
  return { state: map[r.code]||"error", message: r.message||"" };
}

export const STATUS_TEXT = {
  unknown: "Checking…",
  ready: "Ready. Gemini is connected.",
  no_key: "Almost there: add your free Gemini key (steps below).",
  not_deployed: "The AI writing service isn't on Supabase yet. It goes live when this update is merged; then add your key.",
  offline: "AI writing needs the online studio (this copy saves in the browser only).",
  signed_out: "Sign in to the studio to use AI writing.",
  not_editor: "Only studio editors can use AI writing.",
  error: "Couldn't check AI writing right now.",
};

/** Lines like "Title: Booth Production" from nearby boxes, for facts and tone. Skips empty and repeated values. */
export function contextLines(pairs, max=3000){
  const seen=new Set(), out=[]; let n=0;
  for (const [label,value] of pairs){
    const v=String(value||"").replace(/\s+/g," ").trim(); if (!v || seen.has(v)) continue; seen.add(v);
    const line=(label?label+": ":"")+v.slice(0,600); if (n+line.length>max) break;
    out.push(line); n+=line.length+1;
  }
  return out.join("\n");
}
