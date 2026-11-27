/* ================= LIBRARY TOOLS =================
   Pure helpers behind Library › sort and duplicates, SEO file names, adding by link, "Fill missing from category"
   and the pictures' structured data on the site. Nothing here touches the page, so it is all tested in tests/libtools.test.ts. */

const P=v=>v&&typeof v==="object"&&!Array.isArray(v)?(v.en||v.ar||""):String(v??"");

/* ---------- SEO file names ---------- */
/** A file name visitors and search engines can read: lowercase latin letters, numbers and hyphens ("Dorma booth, Riyadh" → "dorma-booth-riyadh"). */
function seoSlug(s,max=70){
  return P(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"").replace(/&/g," and ")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,max).replace(/-+$/,"");
}
const extOf=p=>{ const m=String(p||"").split("?")[0].match(/\.([a-z0-9]{2,5})$/i); return m?m[1].toLowerCase():""; };
/** The file's name as it appears in its address, without the folder ("booth-01.jpg"). */
function fileNameOf(m){
  if (!m) return "";
  const p=m.path||m.assetId||(m.url||m.ext||"").split("?")[0];
  return decodeURIComponent(String(p).split("/").pop()||"");
}
/** The Supabase Storage path for a new name, in the same month folder: "2026-11/old.webp" + "Booth Riyadh" → "2026-11/booth-riyadh.webp". */
function renamedAssetPath(assetId,name){
  const dir=String(assetId||"").includes("/")?String(assetId).split("/").slice(0,-1).join("/")+"/":"";
  const ext=extOf(assetId), base=seoSlug(String(name).replace(/\.[a-z0-9]{2,5}$/i,""));
  return base?dir+base+(ext?"."+ext:""):"";
}
/** Adds -2, -3… before the extension until taken(path) is false. */
function freePath(path,taken){
  if (!taken(path)) return path;
  const ext=extOf(path), base=ext?path.slice(0,-ext.length-1):path;
  for (let n=2;n<1000;n++){ const p=base+"-"+n+(ext?"."+ext:""); if (!taken(p)) return p; }
  return base+"-"+Date.now()+(ext?"."+ext:"");
}

/* ---------- adding by link ---------- */
const IMG_EXT=["jpg","jpeg","png","webp","gif","avif","svg"], VID_EXT=["mp4","webm","mov","m4v"];
/** Reads a link pasted in the Library. Returns {kind, provider, id?, url} or {error}. Only https links are accepted. */
function parseMediaLink(raw){
  const s=String(raw||"").trim(); let u;
  try { u=new URL(s); } catch { return { error:"That doesn't look like a link. Paste the full address, starting with https://" }; }
  if (u.protocol!=="https:") return { error:"Only secure links (https://) can be shown on the site." };
  const host=u.hostname.replace(/^www\.|^m\./,"");
  let yt="";
  if (host==="youtu.be") yt=u.pathname.slice(1).split("/")[0];
  else if (host==="youtube.com"||host==="youtube-nocookie.com"){
    if (u.pathname==="/watch") yt=u.searchParams.get("v")||"";
    else { const m=u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/); if (m) yt=m[1]; } }
  if (yt){ if (!/^[\w-]{6,20}$/.test(yt)) return { error:"That YouTube link has no video in it." }; return { kind:"video", provider:"youtube", id:yt, url:"https://www.youtube.com/watch?v="+yt }; }
  if (host==="vimeo.com"||host==="player.vimeo.com"){ const m=u.pathname.match(/(\d{5,12})/); if (!m) return { error:"That Vimeo link has no video number in it." }; return { kind:"video", provider:"vimeo", id:m[1], url:"https://vimeo.com/"+m[1] }; }
  const ext=extOf(u.pathname);
  if (IMG_EXT.includes(ext)) return { kind:"image", provider:"file", url:u.href };
  if (VID_EXT.includes(ext)) return { kind:"video", provider:"file", url:u.href };
  return { kind:"image", provider:"file", url:u.href, unsure:true };
}
/** A safe https address for a linked file, or "". */
const linkOk=u=>{ try { const x=new URL(String(u)); return x.protocol==="https:"?x.href:""; } catch { return ""; } };
/** The embed address for a linked YouTube or Vimeo video, playing muted and looping like the site's own videos. */
function embedUrl(m,{autoplay=true}={}){
  const e=m&&m.embed; if (!e||!/^[\w-]{5,20}$/.test(String(e.id||""))) return "";
  const a=autoplay?1:0;
  if (e.provider==="youtube") return `https://www.youtube-nocookie.com/embed/${e.id}?autoplay=${a}&mute=1&loop=1&playlist=${e.id}&controls=0&rel=0&playsinline=1&modestbranding=1`;
  if (e.provider==="vimeo") return `https://player.vimeo.com/video/${e.id}?background=1&autoplay=${a}&muted=1&loop=1`;
  return "";
}
/** A still picture for a linked video (YouTube gives one; Vimeo needs its API, so none). */
const embedPoster=m=>m&&m.embed&&m.embed.provider==="youtube"&&/^[\w-]{5,20}$/.test(m.embed.id)?`https://i.ytimg.com/vi/${m.embed.id}/hqdefault.jpg`:"";

/* ---------- sizes, sorting and duplicates ---------- */
/** File size in bytes: what the studio stored, else the GitHub file list. 0 when unknown (linked files). */
function bytesOf(m,index){
  if (m&&+m.bytes>0) return +m.bytes;
  if (m&&m.path&&index&&Array.isArray(index.files)){ const f=index.files.find(x=>x.path===m.path); if (f&&+f.size>0) return +f.size; }
  return 0;
}
/** When the item came in: the date the studio stored, else the GitHub file's date. */
const addedOf=(m,index)=>(m&&m.added)||(m&&m.path&&index&&Array.isArray(index.files)?((index.files.find(x=>x.path===m.path)||{}).modified||""):"");
const SORTS=[["order","Library order"],["newest","Newest first"],["oldest","Oldest first"],["name","Name A–Z"],["size","Largest first"],["small","Smallest first"],["category","Category"],["dupes","Possible duplicates together"]];
function sortMedia(list,by,{index=null,dupes=null,catLabel=c=>c}={}){
  const pos=new Map(list.map((m,i)=>[m,i])), name=m=>P(m.label).toLowerCase(), size=m=>bytesOf(m,index);
  const cmp={
    order:(a,b)=>pos.get(a)-pos.get(b),
    newest:(a,b)=>String(addedOf(b,index)).localeCompare(String(addedOf(a,index)))||pos.get(b)-pos.get(a),
    oldest:(a,b)=>String(addedOf(a,index)).localeCompare(String(addedOf(b,index)))||pos.get(a)-pos.get(b),
    name:(a,b)=>name(a).localeCompare(name(b))||pos.get(a)-pos.get(b),
    size:(a,b)=>size(b)-size(a)||pos.get(a)-pos.get(b),
    small:(a,b)=>(size(a)||Infinity)-(size(b)||Infinity)||pos.get(a)-pos.get(b),
    category:(a,b)=>String(catLabel(a.category)).localeCompare(String(catLabel(b.category)))||name(a).localeCompare(name(b)),
    dupes:(a,b)=>{ const ga=dupes&&dupes.get(a.id), gb=dupes&&dupes.get(b.id);
      if (!!ga!==!!gb) return ga?-1:1; if (ga&&gb&&ga.key!==gb.key) return ga.key.localeCompare(gb.key); return size(b)-size(a)||pos.get(a)-pos.get(b); }
  }[by]||((a,b)=>pos.get(a)-pos.get(b));
  return list.slice().sort(cmp);
}
/** Base name for comparing: "Booth-01 (1).JPG", "booth_01 copy.webp" and "booth 01.png" all become "booth 01". */
const dupeName=s=>P(s).toLowerCase().replace(/\.[a-z0-9]{2,5}$/,"").replace(/\b(copy|final|edit(ed)?)\b/g," ")
  .replace(/\(\d+\)/g," ").replace(/[^a-z0-9؀-ۿ]+/g," ").trim();
/**
 * Pictures and videos that are probably the same file: exactly the same size in bytes, or the same name once
 * copy numbers and extensions are ignored. Returns Map id → {key, reason, ids} (only items that have a twin).
 */
function findDuplicates(list,{index=null}={}){
  const items=(list||[]).filter(m=>m&&(m.kind==="image"||m.kind==="video")), out=new Map();
  const group=(keyOf,reason)=>{ const by=new Map();
    items.forEach(m=>{ const k=keyOf(m); if (!k) return; if (!by.has(k)) by.set(k,[]); by.get(k).push(m); });
    by.forEach((g,k)=>{ if (g.length<2) return; const ids=g.map(m=>m.id);
      g.forEach(m=>{ const cur=out.get(m.id); if (cur){ ids.forEach(i=>{ if (!cur.ids.includes(i)) cur.ids.push(i); }); if (!cur.reason.includes(reason)) cur.reason+=" and "+reason; }
        else out.set(m.id,{key:reason[0]+":"+k,reason,ids:ids.slice()}); }); }); };
  group(m=>{ const b=bytesOf(m,index); return b?m.kind+":"+b:""; },"same size");
  group(m=>{ const n=dupeName(fileNameOf(m))||dupeName(m.label); return n.length>2?m.kind+":"+n:""; },"same name");
  group(m=>m.embed&&m.embed.id?m.embed.provider+":"+m.embed.id:(m.ext||m.url||""),"same link");
  return out;
}

/* ---------- fill missing pictures from their category ---------- */
/**
 * Plans "Fill missing from category": for each slot, the next picture that isn't used anywhere yet, from the slot's
 * category. A slot's category is its current picture's (a removed or placeholder picture tells little, so then the
 * other pictures in the same section, then the same page or modal). Each picture is given once. Videos go where a
 * video or moving placeholder was. Returns [{slot, id, cat, guessed}] and the slots left as they were, with why.
 * opts.anyCategory: a slot whose category can't be told takes from every category.
 */
function planFill(cfg,slots,usage,{anyCategory=false}={}){
  const lib=(cfg.media||[]).filter(m=>m&&(m.kind==="image"||m.kind==="video")&&!m.hidden);
  const byId=new Map((cfg.media||[]).map(m=>[m&&m.id,m]));
  const taken=new Set([...(usage?usage.keys():[])]);
  const catCount=prefix=>{ const n=new Map();
    (slots.all||[]).forEach(x=>{ if (x.where.slice(0,prefix.length).join("›")!==prefix.join("›")) return; const m=byId.get(x.obj[x.key]); if (m&&m.kind!=="scene"&&m.category) n.set(m.category,(n.get(m.category)||0)+1); });
    let best="", k=0; n.forEach((v,c)=>{ if (v>k){ k=v; best=c; } }); return best; };
  const plan=[], skipped=[];
  (slots.missing||[]).forEach(x=>{
    const curM=byId.get(x.obj[x.key]);
    let cat=curM&&curM.kind!=="scene"?curM.category:"", guessed=false;
    if (!cat){ cat=catCount(x.where.slice(0,2))||catCount(x.where.slice(0,1)); guessed=!!cat; }
    if (!cat && !anyCategory){ skipped.push({slot:x,why:"No category to take from yet"}); return; }
    const wantVideo=!!curM&&(curM.kind==="video"||!!curM.animate);
    const pool=lib.filter(m=>!taken.has(m.id)&&(!cat||m.category===cat));
    const pick=pool.find(m=>(m.kind==="video")===wantVideo)||pool[0];
    if (!pick){ skipped.push({slot:x,cat,why:"No unused pictures left in this category"}); return; }
    taken.add(pick.id); plan.push({slot:x,id:pick.id,cat:pick.category,guessed:guessed||!cat});
  });
  return { plan, skipped };
}

/* ---------- SEO on the site ---------- */
/** The words a picture shows to search engines and screen readers. */
function mediaSeo(m){
  const alt=P(m&&m.alt), title=P(m&&m.title), caption=P(m&&m.caption), description=P(m&&m.description);
  return { alt:alt||caption||title||"", title, caption, description };
}
/**
 * schema.org ImageObject / VideoObject entries for the pictures shown on a page, so search engines can read
 * their names, captions and descriptions. urlOf(m) gives the file's absolute address.
 */
function mediaJsonLd(cfg,ids,urlOf){
  const out=[];
  [...new Set(ids)].forEach(id=>{ const m=(cfg.media||[]).find(x=>x&&x.id===id); if (!m||(m.kind!=="image"&&m.kind!=="video")||m.hidden) return;
    const s=mediaSeo(m), url=m.embed?(m.embed.provider==="youtube"?"https://www.youtube.com/watch?v="+m.embed.id:"https://vimeo.com/"+m.embed.id):urlOf(m); if (!url) return;
    const name=s.title||P(m.label);
    const o={"@type":m.kind==="video"?"VideoObject":"ImageObject",name,contentUrl:url};
    if (m.embed) o.embedUrl=embedUrl(m,{autoplay:false});
    if (s.caption) o.caption=s.caption;
    if (s.description||s.alt) o.description=s.description||s.alt;
    if (m.w&&m.h){ o.width=+m.w; o.height=+m.h; }
    if (Array.isArray(m.tags)&&m.tags.length) o.keywords=m.tags.map(P).filter(Boolean).join(", ");
    if (m.added) o.uploadDate=String(m.added).slice(0,10);
    if (m.kind==="video"){ const th=embedPoster(m); if (th) o.thumbnailUrl=th; if (!o.description) o.description=name; }
    out.push(o); });
  return out;
}

export { seoSlug, extOf, fileNameOf, renamedAssetPath, freePath, parseMediaLink, linkOk, embedUrl, embedPoster, bytesOf, addedOf, SORTS, sortMedia, dupeName, findDuplicates, planFill, mediaSeo, mediaJsonLd };
