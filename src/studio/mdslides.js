/* Import hero carousel slides from a Markdown file.
   Format (see public/templates/carousel-slides.md):
     - Anything before the first line of three dashes (---) is notes and is skipped.
     - Each block after a --- is one slide, written as "Key: value" lines.
       Keys: Image, Eyebrow, Title, Title (Arabic), Subtitle, Subtitle (Arabic), Seconds, Flow.
     - After "Flow:", each "- " line is one flow item:
         - [Label](modal:md-id)      opens a modal
         - [Label](page:agency)      goes to a page
         - [Label](post:post-slug)   opens a blog post
         - [Label](slide:2)          goes to slide 2
         - [Label](https://...)      opens a link
         - Label                     plain text, no action
       Arabic label: [English | العربية].
     - Lines starting with ">" are comments.
   Pure functions, no DOM: easy to test. */

const KEYS = {
  "image":"image", "picture":"image", "background":"image",
  "eyebrow":"eyebrow", "label":"eyebrow",
  "title":"title", "title (arabic)":"title_ar", "title ar":"title_ar", "title_ar":"title_ar", "arabic title":"title_ar",
  "subtitle":"subtitle", "sub-title":"subtitle", "text":"subtitle", "paragraph":"subtitle",
  "subtitle (arabic)":"subtitle_ar", "subtitle ar":"subtitle_ar", "subtitle_ar":"subtitle_ar", "arabic subtitle":"subtitle_ar",
  "seconds":"seconds", "duration":"seconds",
  "flow":"flow"
};
const MEDIA_EXT = { image:/\.(jpe?g|png|webp|gif|avif|svg)$/i, video:/\.(mp4|webm|mov|m4v)$/i };
const pathOk = p => typeof p==="string" && /^[\w\-. ()&+,]+(\/[\w\-. ()&+,]+)*$/.test(p) && !p.split("/").some(x=>x===".."||x===".");
const rid = () => Math.random().toString(36).slice(2,8);
const slug = s => String(s||"").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);
const bi = (en,ar) => ar ? { en:en||"", ar } : (en||"");

/** Splits "English | العربية" into a text value. */
function labelValue(raw){
  const [en,ar] = String(raw).split(/\s+\|\s+/);
  return bi((en||"").trim(), (ar||"").trim());
}

/** Reads one flow line: "- [Label](target)" or "- Label". */
function parseFlowLine(line){
  const body = line.replace(/^\s*[-*+]\s+/,"").trim();
  if (!body) return null;
  const m = body.match(/^\[([^\]]+)\]\(\s*([^)\s]*)\s*\)\s*(.*)$/);
  if (!m) return { kind:"text", label:labelValue(body), action:{type:"none",target:""} };
  const [, label, target] = m;
  let type="none", t="";
  const tm = target.match(/^(modal|page|post|slide|doc|link|url):(.*)$/i);
  if (tm){ type = tm[1].toLowerCase(); t = tm[2].trim(); if (type==="link") type="url"; }
  else if (/^https?:\/\//i.test(target) || /^mailto:|^tel:/i.test(target)){ type="url"; t=target; }
  else if (target){ type="modal"; t=target; }
  return { kind:"button", label:labelValue(label), action:{type,target:t} };
}

/** Parses the Markdown text into slides, with a list of problems for each. */
function parseSlidesMd(text){
  const src = String(text||"").replace(/\r\n?/g,"\n").replace(/^﻿/,"");
  const blocks = src.split(/^\s*-{3,}\s*$/m);
  if (blocks.length<2) return { slides:[], warnings:["No slides found. Start each slide with a line of three dashes (---), as in the template."] };
  const slides=[];
  blocks.slice(1).forEach(block=>{
    const s={ image:"", eyebrow:"", title:"", title_ar:"", subtitle:"", subtitle_ar:"", seconds:"", flow:[], warnings:[] };
    let inFlow=false, any=false, last=null;
    block.split("\n").forEach(raw=>{
      const line=raw.replace(/\s+$/,"");
      if (!line.trim() || /^\s*>/.test(line) || /^\s*<!--.*-->\s*$/.test(line)) return;
      if (inFlow && /^\s*[-*+]\s+/.test(line)){ const it=parseFlowLine(line); if (it){ s.flow.push(it); any=true; } return; }
      const km=line.match(/^\s*(?:#+\s*)?([A-Za-z][A-Za-z _()-]*?)\s*:\s*(.*)$/);
      const key=km && KEYS[km[1].trim().toLowerCase()];
      if (key){ inFlow = key==="flow"; last=key; if (key!=="flow"){ s[key]=km[2].trim(); if (s[key]) any=true; } return; }
      // a line that continues the previous value (long subtitles can wrap)
      if (last && last!=="flow" && !inFlow){ s[last]=(s[last]+" "+line.trim()).trim(); any=true; return; }
      s.warnings.push(`Skipped a line it didn't understand: "${line.trim().slice(0,60)}"`);
    });
    if (!any) return;
    if (!s.title) s.warnings.push("No title.");
    if (s.seconds && !(+s.seconds>0)) { s.warnings.push(`"Seconds: ${s.seconds}" is not a number, so it was ignored.`); s.seconds=""; }
    slides.push(s);
  });
  return { slides, warnings: slides.length?[]:["No slides found after the --- lines."] };
}

/** Finds a library item for "Image:", or describes one to add. Returns {id} | {add:{...}} | {missing:true} | {} (empty = default image). */
/** @param {any} cfg @param {string} ref @param {{knownPaths?: Set<string>|null}} [opts] */
function resolveImage(cfg,ref,{knownPaths=null}={}){
  const r=String(ref||"").trim(); if (!r) return {};
  const media=cfg.media||[], low=r.toLowerCase();
  const hit=media.find(m=>m.id===r) || media.find(m=>m.path && (m.path===r || m.path.toLowerCase()===low.replace(/^\/?(public\/)?library\//,""))) ||
    media.find(m=>m.url && m.url===r) || media.find(m=>typeof m.label==="string" && m.label.toLowerCase()===low);
  if (hit) return { id:hit.id, label:hit.label||hit.id };
  const kind = MEDIA_EXT.video.test(r) ? "video" : MEDIA_EXT.image.test(r) ? "image" : "";
  if (/^https:\/\//i.test(r) && kind) return { add:{ kind, url:r, label:r.split("/").pop() } };
  const p=r.replace(/^\/?(public\/)?library\//,"");
  if (kind && pathOk(p) && (!knownPaths || knownPaths.has(p))) return { add:{ kind, path:p, label:p.split("/").pop(), category:p.includes("/")?p.split("/")[0]:"" } };
  return { missing:true };
}

/** Adds the parsed slides to a carousel section. mode: "append" | "replace". Returns a short summary. */
/** @param {any} cfg @param {any} sec @param {any[]} slides @param {{mode?: string, knownPaths?: Set<string>|null}} [opts] */
function applySlidesImport(cfg,sec,slides,{mode="append",knownPaths=null}={}){
  cfg.flows=cfg.flows||[]; cfg.media=cfg.media||[];
  const out=[]; let flows=0, added=0, missing=0;
  slides.forEach((s,i)=>{
    const slide={ eyebrow:s.eyebrow||"", title:bi(s.title,s.title_ar), lede:bi(s.subtitle,s.subtitle_ar), media:"" };
    const img=resolveImage(cfg,s.image,{knownPaths});
    if (img.id) slide.media=img.id;
    else if (img.add){ const id="m-"+(slug(img.add.label)||"img")+"-"+rid(); cfg.media.push({ id, ...img.add }); slide.media=id; added++; }
    else if (img.missing) missing++;
    if (+s.seconds>0) slide.timing={ duration:+s.seconds };
    if (s.flow.length){
      const fid="f-"+(slug(s.title)||"slide")+"-"+rid();
      cfg.flows.push({ id:fid, name:"Slide: "+(s.title||"Slide "+(i+1)), separator:"dots3", size:"m", progress:false,
        anim:{ mode:"items", preset:"rise", duration:.8, stagger:.06, delay:0 }, custom:{ anim:false, colors:false }, colors:{},
        items:s.flow.map((it,j)=>({ id:"i"+(j+1)+rid().slice(0,3), kind:it.kind, label:it.label, icon:"", svg:"", showIndex:false, detail:"", action:it.action, anim:null })) });
      slide.flowId=fid; flows++;
    }
    out.push(slide);
  });
  sec.slides = mode==="replace" ? out : [...(sec.slides||[]), ...out];
  return { slides:out.length, flows, addedMedia:added, missingImages:missing };
}

export { parseSlidesMd, parseFlowLine, resolveImage, applySlidesImport };
