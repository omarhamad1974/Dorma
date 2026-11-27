/* ================= SOCIAL POSTS =================
   Turns text that is already on the site (pages, sections, blog posts, catalog items, flows) into ready-to-copy
   posts for LinkedIn, a Facebook Page and Instagram. No AI and no outside service: templates fill in the site's own
   words, so nothing is invented. Posting stays manual for now; every planned post is one entry per platform with
   room for a later automatic poster (externalId, postedAt, url).
   This file has no DOM code, so it is tested on its own (tests/social.test.ts). */
import { SV } from './content';

const T = (en,ar) => ({en,ar});
const isObj = v => v && typeof v==="object" && !Array.isArray(v);
/* same rule as core.js isTx (kept here so this file loads without the browser) */
const isTx = v => isObj(v) && Object.keys(v).length>0 && Object.keys(v).every(k=>k==="en"||k==="ar");

/** Platforms, in the order the studio shows them. */
const PLATFORMS = [["linkedin","LinkedIn"],["facebook","Facebook Page"],["instagram","Instagram"]];
const PLATFORM_NAME = Object.fromEntries(PLATFORMS);

/** Picture sizes per platform: [key, label, width, height]. */
const FORMATS = {
  linkedin: [["landscape","Landscape",1200,627],["square","Square",1080,1080],["portrait","Portrait",1080,1350]],
  facebook: [["landscape","Landscape",1200,630],["square","Square",1080,1080],["portrait","Portrait",1080,1350],["story","Story",1080,1920]],
  instagram: [["square","Square",1080,1080],["portrait","Portrait",1080,1350],["story","Story or reel cover",1080,1920],["landscape","Landscape",1080,566]]
};
const formatOf = (plat,key) => (FORMATS[plat]||[]).find(f=>f[0]===key) || (FORMATS[plat]||[])[0];

/** What a post is about. The weekly rhythm and the hashtag sets use these. */
const TOPICS = [["service","Service"],["print","Print idea"],["gift","Gift or packaging"],["process","Project or process"],["blog","Blog post"],["other","Other"]];
const TOPIC_NAME = Object.fromEntries(TOPICS);

const STATUSES = [["planned","Planned"],["drafted","Drafted"],["scheduled","Scheduled"],["posted","Posted"]];

/** Placeholders a template can use. */
const PLACEHOLDERS = [["title","Title"],["summary","Summary"],["first","First sentence of the summary"],["points","Points as a list"],["cta","Call to action"],["link","Link to the page"],["hashtags","Hashtags"],["brand","Brand name"]];

/** Tones: each is a ready template. A platform can also have its own template, which replaces the tone's. */
const TONES = {
  professional: { label:"Professional", tpl:"{title}\n\n{summary}\n\n{points}\n\n{cta}\n{link}\n\n{hashtags}" },
  friendly:     { label:"Friendly",     tpl:"{title} ✨\n\n{summary}\n\n{points}\n\n{cta} 👉 {link}\n\n{hashtags}" },
  short:        { label:"Short",        tpl:"{title}: {first}\n\n{cta} {link}\n\n{hashtags}" }
};

const SOCIAL_DEFAULTS = {
  version: 1,
  siteUrl: "https://omarhamad1974.github.io/Dorma/",
  utm: false,                       // add ?utm_source=<platform>&utm_medium=social to links
  bullet: "•",
  platforms: {
    linkedin:  { on:true, tone:"professional", template:T("",""), cta:T("Learn more or request a quote:","لمعرفة المزيد أو طلب عرض سعر:"), max:3000, tags:3, link:true,  points:true, format:"landscape" },
    facebook:  { on:true, tone:"friendly",     template:T("",""), cta:T("Find out more:","لمعرفة المزيد:"), max:1500, tags:3, link:true,  points:true, format:"landscape" },
    instagram: { on:true, tone:"friendly",     template:T("",""), cta:T("Request a quote through the link in our bio.","اطلب عرض سعر عبر الرابط في حسابنا."), max:2200, tags:10, link:false, points:true, format:"portrait" }
  },
  /* Hashtag sets: "all" sets go on every post, the others on posts about that topic. Arabic posts use the Arabic tags. */
  hashtags: [
    { id:"h-brand",   name:"Dorma",   topic:"all",     tags:T("#DormaAdvertising","#دورما_للإعلان") },
    { id:"h-service", name:"Agency",  topic:"service", tags:T("#CreativeAgency #Branding #Marketing #Design","#وكالة_إبداعية #هوية_بصرية #تسويق #تصميم") },
    { id:"h-print",   name:"Print",   topic:"print",   tags:T("#Printing #PrintProduction #Packaging #Signage","#طباعة #إنتاج #تغليف #لافتات") },
    { id:"h-gift",    name:"Gifts",   topic:"gift",    tags:T("#CorporateGifts #Giveaways #PersonalizedGifts #Packaging","#هدايا_الشركات #هدايا_دعائية #هدايا_مخصصة #تغليف") },
    { id:"h-process", name:"Process", topic:"process", tags:T("#BehindTheScenes #HowWeWork #Production","#خلف_الكواليس #طريقة_عملنا #إنتاج") },
    { id:"h-blog",    name:"Blog",    topic:"blog",    tags:T("#Tips #Marketing #Advertising","#نصائح #تسويق #إعلان") }
  ],
  /* Carousel posts made from a flow's steps (or a page's points): a cover slide, one slide per step, an end slide. */
  carousel: { cover:true, end:T("Ready to start? Request a quote.","جاهز للبدء؟ اطلب عرض سعر."), max:10 },
  /* Suggested weekly rhythm: day 1 = Monday … 7 = Sunday. */
  rhythm: [
    { id:"r-mon", day:1, label:T("Service","خدمة"), topics:["service"] },
    { id:"r-wed", day:3, label:T("Project or process","مشروع أو مراحل العمل"), topics:["process","blog"] },
    { id:"r-fri", day:5, label:T("Gift or print idea","فكرة هدية أو طباعة"), topics:["gift","print"] }
  ],
  weeks: 4,                          // how many weeks the calendar shows
  posts: []                          // calendar entries, one per platform (see newEntry)
};

/** Fills gaps in saved social settings, so older saves keep working. */
function normalizeSocial(s){
  const out=JSON.parse(JSON.stringify(SOCIAL_DEFAULTS));
  if (!isObj(s)) return out;
  s=JSON.parse(JSON.stringify(s));
  ["siteUrl","utm","bullet","weeks"].forEach(k=>{ if (s[k]!=null) out[k]=s[k]; });
  if (isObj(s.platforms)) PLATFORMS.forEach(([p])=>{ if (isObj(s.platforms[p])) out.platforms[p]={...out.platforms[p],...s.platforms[p]}; });
  if (isObj(s.carousel)) out.carousel={...out.carousel,...s.carousel};
  ["hashtags","rhythm","posts"].forEach(k=>{ if (Array.isArray(s[k])) out[k]=s[k].filter(isObj); });
  out.posts.forEach(e=>{ if (!STATUSES.some(x=>x[0]===e.status)) e.status="planned"; });
  out.weeks=Math.min(12,Math.max(1,Math.round(+out.weeks)||4));
  return out;
}

/* ---------- reading the site's text ---------- */
/** Text in one language. A plain string counts as English; Arabic never falls back to English. */
function inLang(v,lang){
  if (isTx(v)) return String(v[lang]??"").trim();
  if (typeof v==="string") return lang==="en"?v.trim():"";
  return "";
}
/** Markdown and studio markup to plain text. */
function stripMd(s){
  return String(s||"")
    .replace(/\[\[[^\]]*\]\]/g,"")                // library embeds
    .replace(/!\[[^\]]*\]\([^)]*\)/g,"")
    .replace(/\[([^\]]+)\]\([^)]*\)/g,"$1")      // links keep their text
    .replace(/^\s{0,3}#{1,6}\s+/gm,"")
    .replace(/^\s*>\s?/gm,"")
    .replace(/^\s*[-*+]\s+/gm,"")
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g,"$1$2")
    .replace(/\*([^*]+)\*|_([^_]+)_/g,"$1$2")
    .replace(/[ \t]+/g," ").trim();
}
const paras = s => String(s||"").split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
/** First paragraph of a Markdown body that is not a heading or an embed. */
function firstPara(md){ return stripMd(paras(md).find(p=>!/^\s{0,3}#/.test(p)&&!/^\[\[/.test(p))||""); }
/** "## Heading" + the paragraph under it, for carousel slides made from a post. */
function headingSlides(md){
  const out=[]; let cur=null;
  paras(md).forEach(p=>{ const m=/^\s{0,3}#{2,3}\s+(.+)$/.exec(p.split("\n")[0]);
    if (m){ cur={title:stripMd(m[1]),text:stripMd(p.split("\n").slice(1).join(" "))}; out.push(cur); }
    else if (cur&&!cur.text) cur.text=stripMd(p); });
  return out;
}
const PLACEHOLDER_RX = /\[to be supplied|placeholder:|^placeholder\b|يُستبدل|نص مؤقت/i;
const isPlaceholder = s => PLACEHOLDER_RX.test(String(s||""));
/** Both languages of a value, each as plain text. */
const both = (v,fn=x=>x) => ({ en:fn(inLang(v,"en")), ar:fn(inLang(v,"ar")) });
const bothMd = v => isTx(v)?{en:v.en||"",ar:v.ar||""}:{en:typeof v==="string"?v:"",ar:""};
const emptyTx = t => !t || (!t.en && !t.ar);
const labelKey = v => String(isTx(v)?(v.en||v.ar||""):(v??"")).trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-+|-+$/g,"");

/** What a page is about, from its content: catalogs are gifts, service pages follow their division. */
function pageTopic(p){
  const secs=p.sections||[];
  if (secs.some(s=>s.type==="catalog")) return "gift";
  const sv=SV.find(s=>s.id===p.id);
  if (sv) return /gift|giveaway|packag/.test(p.id)?"gift":sv.div==="print"?"print":"service";
  if (p.id==="print") return "print";
  if (p.id==="agency") return "service";
  if (p.id==="about") return "process";
  return "other";
}

const TEXT_SECTIONS = new Set(["hero","about","division","features","chapters","accordion","article","grid","cta","flowStrip","timeline","catalog"]);
const ITEM_POINT = it => it&&(it.title||it.label||it.name);

/** Flow steps as slides: label + detail text. */
function flowSlides(f){ return (f&&f.items||[]).filter(it=>!it.hidden).map(it=>({ title:both(it.label), text:both(it.detail) })).filter(x=>x.title.en||x.title.ar); }

/**
 * Everything on the site a post can be made from. Each source:
 * { key, type, group, label, topic, title{en,ar}, summary{en,ar}, points[{en,ar}], slides[{title,text}], image, link, draft, placeholder }
 */
function socialSources(cfg){
  const out=[], flows=new Map((cfg.flows||[]).map(f=>[f.id,f]));
  const push=src=>{ src.points=(src.points||[]).filter(x=>x&&(x.en||x.ar));
    src.placeholder=[src.title,src.summary].some(t=>t&&(isPlaceholder(t.en)||isPlaceholder(t.ar)));
    src.label=src.label||src.title.en||src.title.ar||"Untitled"; out.push(src); };
  (cfg.pages||[]).forEach(p=>{
    const secs=(p.sections||[]).filter(s=>s&&!s.hidden&&!s.previewOnly), topic=pageTopic(p);
    const hero=secs.find(s=>s.type==="hero")||secs.find(s=>s.type==="heroCarousel");
    const slide0=hero&&hero.type==="heroCarousel"?(hero.slides||[])[0]||{}:hero||{};
    const feat=secs.find(s=>s.type==="features");
    const pageFlow=flows.get((hero&&hero.flowId)||"")||null;
    push({ key:"page:"+p.id, type:"page", group:"Pages", topic, title:both(p.title),
      summary:both(slide0.lede||slide0.text||slide0.title,stripMd), points:feat?(feat.items||[]).filter(i=>!i.hidden).map(i=>both(ITEM_POINT(i))):[],
      slides:feat?(feat.items||[]).filter(i=>!i.hidden).map(i=>({title:both(ITEM_POINT(i)),text:both(i.text,stripMd)})):flowSlides(pageFlow),
      image:slide0.media||"", link:p.id, draft:false });
    secs.forEach(s=>{
      if (!TEXT_SECTIONS.has(s.type) || s===hero) return;
      const title=emptyTx(both(s.title))?both(s.eyebrow):both(s.title);
      const summary=s.type==="article"?{en:firstPara(bothMd(s.body).en),ar:firstPara(bothMd(s.body).ar)}:both(s.text||s.lede,stripMd);
      const items=(s.items||[]).filter(i=>i&&!i.hidden&&ITEM_POINT(i));
      const f=flows.get(s.flowId||(s.flowUnder&&s.flowUnder.flowId)||"");
      const slides=s.type==="article"?["en","ar"].reduce((acc,l)=>{ headingSlides(bothMd(s.body)[l]).forEach((x,i)=>{ acc[i]=acc[i]||{title:{en:"",ar:""},text:{en:"",ar:""}}; acc[i].title[l]=x.title; acc[i].text[l]=x.text; }); return acc; },[])
        :items.length?items.map(i=>({title:both(ITEM_POINT(i)),text:both(i.text,stripMd)})):flowSlides(f);
      if (emptyTx(title)&&emptyTx(summary)&&!items.length) return;
      push({ key:"sec:"+p.id+":"+s.id, type:"section", group:"Sections", topic:f&&!items.length?"process":topic, title, summary,
        points:items.map(i=>both(ITEM_POINT(i))), slides,
        image:s.media||(items.find(i=>i.media)||{}).media||slide0.media||"", link:p.id+(s.anchor?"/"+labelKey(s.anchor):""), page:both(p.title), draft:false });
      if (s.type==="catalog") items.forEach(it=>push({ key:"item:"+p.id+":"+s.id+":"+(it.id||labelKey(it.title)), type:"item", group:"Catalog items", topic:"gift",
        title:both(it.title), summary:both(it.text,stripMd), points:[both(it.itemType),both(it.packageType)], slides:[],
        image:it.media||"", link:p.id+(s.anchor?"/"+labelKey(s.anchor):""), page:both(p.title), draft:false }));
    });
  });
  (cfg.posts||[]).forEach(po=>{
    const md=bothMd(po.body), ex=both(po.excerpt,stripMd);
    const slides=["en","ar"].reduce((acc,l)=>{ headingSlides(md[l]).forEach((x,i)=>{ acc[i]=acc[i]||{title:{en:"",ar:""},text:{en:"",ar:""}}; acc[i].title[l]=x.title; acc[i].text[l]=x.text; }); return acc; },[]);
    push({ key:"post:"+(po.id||po.slug), type:"post", group:"Blog posts", topic:"blog", title:both(po.title),
      summary:{ en:ex.en||firstPara(md.en), ar:ex.ar||firstPara(md.ar) }, points:slides.map(x=>x.title), slides,
      image:po.cover||"", link:"post/"+(po.slug||po.id), draft:!po.published });
  });
  (cfg.flows||[]).forEach(f=>{
    const slides=flowSlides(f); if (!slides.length) return;
    /* the page that shows this flow gives the link and picture */
    let where=null;
    (cfg.pages||[]).some(p=>(p.sections||[]).some(s=>{ const ids=[s.flowId,s.flowUnder&&s.flowUnder.flowId,...(s.slides||[]).map(x=>x.flowId)];
      if (ids.includes(f.id)){ where={p,s}; return true; } return false; }));
    const sl0=where&&where.s.type==="heroCarousel"?(where.s.slides||[]).find(x=>x.flowId===f.id)||(where.s.slides||[])[0]||{}:where?where.s:{};
    push({ key:"flow:"+f.id, type:"flow", group:"Flows (carousel posts)", topic:"process",
      title:emptyTx(both(sl0.title))?both(f.name):both(sl0.title), summary:both(sl0.lede||sl0.text,stripMd),
      points:slides.map(x=>x.title), slides, image:sl0.media||"", link:where?where.p.id:(cfg.site&&cfg.site.homePage)||"", draft:false, flowName:typeof f.name==="string"?f.name:inLang(f.name,"en") });
  });
  return out;
}

/* ---------- writing a post ---------- */
/** The page's full address, with optional tracking for the platform. */
function postLink(S,link,plat){
  const base=String(S.siteUrl||"").trim(); if (!base) return "";
  const q=S.utm&&plat?(base.includes("?")?"&":"?")+"utm_source="+plat+"&utm_medium=social":"";
  const b=base.split("#")[0];
  return b+q+(link?"#"+link:"");
}
/** Hashtags for a post: every "all" set plus the sets for its topic (or the sets picked), in one language. */
function hashtagsFor(S,{topic,sets=null,lang,limit=null}){
  const pick=(S.hashtags||[]).filter(h=>sets?sets.includes(h.id):(h.topic==="all"||h.topic===topic));
  const seen=new Set(), out=[];
  pick.forEach(h=>{ const raw=inLang(h.tags,lang)||(lang==="ar"?inLang(h.tags,"en"):"");
    raw.split(/[\s,]+/).map(t=>t.trim()).filter(Boolean).forEach(t=>{ const tag=t.startsWith("#")?t:"#"+t, k=tag.toLowerCase(); if (!seen.has(k)){ seen.add(k); out.push(tag); } }); });
  return limit!=null&&limit>=0?out.slice(0,limit):out;
}
const sentences = s => String(s||"").match(/[^.!?؟。]+[.!?؟。]*\s*/g)||[];
const firstSentence = s => (sentences(s)[0]||"").trim();
/** Shortens text to n characters at a sentence, then a word, ending with an ellipsis. */
function shorten(s,n){
  s=String(s||"").trim(); if (s.length<=n) return s; if (n<=1) return "";
  let out=""; for (const x of sentences(s)){ if ((out+x).trim().length>n) break; out+=x; }
  out=out.trim(); if (out) return out;
  const cut=s.slice(0,n-1); const sp=cut.lastIndexOf(" "); return (sp>n*.5?cut.slice(0,sp):cut).replace(/[\s,;:،-]+$/,"")+"…";
}
const fillTpl = (tpl,v) => String(tpl||"").replace(/\{(\w+)\}/g,(m,k)=>k in v?v[k]:m);
/** Tidies a filled template: empty lines left by empty placeholders, stray arrows and spaces. */
function tidy(s){
  return s.split("\n").map(l=>l.replace(/[ \t]+/g," ").replace(/\s*👉\s*$/,"").replace(/^[ :–-]+(?=\S)/,"").trimEnd()).join("\n")
    .replace(/\n{3,}/g,"\n\n").trim();
}
const templateFor = (S,plat,lang) => { const P=S.platforms[plat]||{}; return inLang(P.template,lang)||(TONES[P.tone]||TONES.professional).tpl; };

/**
 * One caption for one platform in one language.
 * Returns { text, length, max, over, missing:[...] } — missing names the parts with no text in this language.
 */
function buildCaption(cfg,S,src,plat,lang,{sets=null}={}){
  const P=S.platforms[plat]||SOCIAL_DEFAULTS.platforms[plat], max=+P.max||2200;
  const title=src.title[lang]||"", summary0=src.summary[lang]||"";
  const pts=P.points?src.points.map(x=>x[lang]).filter(Boolean):[];
  const missing=[]; if (!title) missing.push("title"); if (!summary0) missing.push("summary");
  if (P.points&&src.points.length&&pts.length<src.points.length) missing.push("points");
  const brand=inLang(cfg.site&&cfg.site.brand,lang)||(lang==="en"?"":inLang(cfg.site&&cfg.site.brand,"en"));
  const v={ title, summary:summary0, first:firstSentence(summary0), points:pts.map(p=>(S.bullet?S.bullet+" ":"")+p).join("\n"),
    cta:inLang(P.cta,lang), link:P.link?postLink(S,src.link,plat):"", hashtags:hashtagsFor(S,{topic:src.topic,sets,lang,limit:+P.tags}).join(" "), brand };
  const tpl=templateFor(S,plat,lang);
  let text=tidy(fillTpl(tpl,v));
  /* too long: drop points from the end, then shorten the summary */
  let n=pts.length;
  while (text.length>max&&n>0){ n--; v.points=pts.slice(0,n).map(p=>(S.bullet?S.bullet+" ":"")+p).join("\n"); text=tidy(fillTpl(tpl,v)); }
  if (text.length>max){ const room=Math.max(0,summary0.length-(text.length-max)); v.summary=shorten(summary0,room); v.first=shorten(v.first,room); text=tidy(fillTpl(tpl,v)); }
  if (text.length>max) text=shorten(text,max);
  return { text, length:text.length, max, over:text.length>max, missing };
}

/** Carousel slides for one language: cover, steps, end. Each slide is {title, text}. */
function buildSlides(S,src,lang){
  const steps=(src.slides||[]).map(x=>({title:x.title[lang]||"",text:x.text[lang]||""})).filter(x=>x.title);
  if (!steps.length) return [];
  const C=S.carousel||SOCIAL_DEFAULTS.carousel, max=Math.max(2,+C.max||10);
  const out=[];
  if (C.cover) out.push({title:src.title[lang]||"",text:firstSentence(src.summary[lang]||"")});
  const end=inLang(C.end,lang);
  const room=max-out.length-(end?1:0);
  out.push(...steps.slice(0,Math.max(1,room)));
  if (end) out.push({title:end,text:postLink(S,src.link,"").replace(/^https?:\/\//,"")});
  return out.filter(x=>x.title);
}
const slidesText = slides => slides.map((s,i)=>`${i+1}/${slides.length} ${s.title}${s.text?"\n"+s.text:""}`).join("\n\n");

/* ---------- calendar ---------- */
const isoDay = d => { const z=new Date(d.getTime()-d.getTimezoneOffset()*60000); return z.toISOString().slice(0,10); };
const parseDay = s => { const [y,m,d]=String(s).split("-").map(Number); return new Date(y,(m||1)-1,d||1); };
/** Monday of the week that holds this day. */
function weekStart(d){ const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()); const wd=(x.getDay()+6)%7; x.setDate(x.getDate()-wd); return x; }
/** ISO weekday: Monday 1 … Sunday 7. */
const weekday = d => ((d.getDay()+6)%7)+1;
/** The days the calendar shows: every day of the next weeks that has a rhythm slot or a post. */
function calendarDays(S,from=new Date()){
  const start=weekStart(from), out=[];
  for (let i=0;i<S.weeks*7;i++){ const d=new Date(start); d.setDate(start.getDate()+i); const iso=isoDay(d);
    const slots=(S.rhythm||[]).filter(r=>+r.day===weekday(d)), posts=(S.posts||[]).filter(e=>e.date===iso);
    if (slots.length||posts.length) out.push({iso,date:d,slots,posts}); }
  return out;
}
/** Next date on or after `from` whose rhythm slot covers this topic (or the next rhythm day). */
function nextRhythmDate(S,topic,from=new Date()){
  const d=new Date(from.getFullYear(),from.getMonth(),from.getDate());
  for (let i=0;i<14;i++){ const wd=weekday(d); if ((S.rhythm||[]).some(r=>+r.day===wd&&(!topic||(r.topics||[]).includes(topic)))) return isoDay(d); d.setDate(d.getDate()+1); }
  return isoDay(from);
}
/** The next source to post about for these topics: never-used first, then the one used longest ago. Placeholders are skipped. */
function suggestSource(sources,entries,topics,{skip=[]}={}){
  const last=new Map(); (entries||[]).forEach(e=>{ if (e.source&&(!last.has(e.source)||last.get(e.source)<e.date)) last.set(e.source,e.date); });
  const cand=sources.map((s,i)=>({s,i})).filter(({s})=>(!topics||!topics.length||topics.includes(s.topic))&&!s.placeholder&&!s.draft&&!skip.includes(s.key)&&(s.summary.en||s.summary.ar));
  cand.sort((a,b)=>{ const la=last.get(a.s.key)||"", lb=last.get(b.s.key)||""; return la===lb?a.i-b.i:la<lb?-1:1; });
  return cand[0]?cand[0].s:null;
}
let seq=0;
const entryId = () => "sp-"+Date.now().toString(36)+"-"+(seq++).toString(36)+Math.random().toString(36).slice(2,5);
/** A calendar entry: one post on one platform. Fields after `note` are kept for a later automatic poster. */
function newEntry({date,platform,source="",label="",topic="other",status="planned",en="",ar="",image="",format="",slides=null,time=""}){
  return { id:entryId(), date, time, platform, status, topic, source, label, en, ar, image, format, slides, note:"", externalId:"", postedAt:"", url:"" };
}

export { PLATFORMS, PLATFORM_NAME, FORMATS, formatOf, TOPICS, TOPIC_NAME, STATUSES, PLACEHOLDERS, TONES, SOCIAL_DEFAULTS, normalizeSocial,
  inLang, stripMd, firstPara, headingSlides, isPlaceholder, pageTopic, socialSources, postLink, hashtagsFor, shorten, firstSentence, templateFor,
  buildCaption, buildSlides, slidesText, isoDay, parseDay, weekStart, weekday, calendarDays, nextRhythmDate, suggestSource, newEntry };
