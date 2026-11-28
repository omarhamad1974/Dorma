/* ================= FIND PHOTOS: plain helpers =================
   No DOM and no network here, so tests/stock.test.ts can check them. The panel is in stock.js. */
import { PROVIDERS, PROVIDER_NAME, HOW, LICENCE, COLOURS, creditLine } from '../../supabase/functions/stock-search/providers';
export { PROVIDERS, PROVIDER_NAME, HOW, LICENCE, COLOURS, creditLine };

export const LICENCE_URL = { pexels:"https://www.pexels.com/license/", pixabay:"https://pixabay.com/service/license-summary/", unsplash:"https://unsplash.com/license" };
export const KEY_STEPS = {
  pexels:  { secret:"PEXELS_API_KEY",      url:"https://www.pexels.com/api/",              how:"Sign in (free), press \"Your API Key\", describe the site in one line, and copy the key." },
  pixabay: { secret:"PIXABAY_API_KEY",     url:"https://pixabay.com/api/docs/",            how:"Sign in (free), open the API documentation, and copy the key shown under \"Parameters\" (key)." },
  unsplash:{ secret:"UNSPLASH_ACCESS_KEY", url:"https://unsplash.com/oauth/applications",  how:"Sign in (free), press \"New Application\", accept the terms, name it Dorma studio, and copy the \"Access Key\" (not the Secret key)." },
};
export const COLOUR_NAMES = { any:"Any colour", red:"Red", orange:"Orange", yellow:"Yellow", green:"Green", turquoise:"Turquoise", blue:"Blue", purple:"Purple", pink:"Pink", brown:"Brown", black:"Black", gray:"Grey", white:"White", blackwhite:"Black and white" };
export const MAX_REJECTED = 1500;

/** "pexels:123": how a photo is remembered (rejected, or already in the Library). */
export const stockKey = (p) => p.provider+":"+p.id;

/** Keys of photos already in the Library. */
export function inLibrary(media=[]){
  const out=new Set(); (media||[]).forEach(m=>{ if (m&&m.stock&&m.stock.provider&&m.stock.id) out.add(m.stock.provider+":"+m.stock.id); }); return out;
}

/** Search results without the rejected ones (and, unless asked, without those already in the Library). */
export function freshPhotos(photos=[], rejected=[], media=[], { showAdded=false }={}){
  const rej=new Set(rejected||[]), have=inLibrary(media);
  return (photos||[]).filter(p=>!rej.has(stockKey(p)) && (showAdded || !have.has(stockKey(p))));
}

/** Adds a key to the rejected list (newest last, capped). */
export function rejectPhoto(list=[], key){
  const out=(list||[]).filter(k=>k!==key); out.push(key); return out.slice(-MAX_REJECTED);
}

/** A readable name for the Library from the photo's description, or the search words. */
export function stockLabel(p, query=""){
  const t=String(p.alt||"").split(",")[0].replace(/\s+/g," ").trim() || String(query||"").trim() || PROVIDER_NAME[p.provider]+" photo";
  const s=t.charAt(0).toUpperCase()+t.slice(1);
  return s.length>60 ? s.slice(0,57).replace(/\s+\S*$/,"")+"…" : s;
}

/** The Library item for a stock photo. file: { assetId, url, bytes, w, h } when copied into Supabase; otherwise it stays linked.
 * @param {any} p
 * @param {{id:string, category:string, query?:string, file?:{assetId:string,url:string,bytes?:number,w?:number,h?:number}|null, now?:string}} o
 * @returns {Record<string, any>} */
export function stockMedia(p, { id, category, query="", file=null, now=new Date().toISOString() }){
  /** @type {Record<string, any>} */
  const credit={ provider:p.provider, site:PROVIDER_NAME[p.provider], author:p.author||"", authorUrl:p.authorUrl||"", pageUrl:p.pageUrl||"",
    licence:LICENCE[p.provider], licenceUrl:LICENCE_URL[p.provider], line:creditLine(p.provider,p.author) };
  const m={ id, label:stockLabel(p,query), kind:"image", category, tags:(p.tags||[]).map(t=>String(t).toLowerCase()).filter(Boolean).slice(0,8),
    alt:String(p.alt||"").trim().slice(0,200), caption:credit.line, added:now, credit, stock:{ provider:p.provider, id:String(p.id) } };
  if (file){ m.assetId=file.assetId; m.url=file.url; if (file.bytes) m.bytes=file.bytes; if (file.w){ m.w=file.w; m.h=file.h; } }
  else { m.ext=p.full; if (p.width){ m.w=p.width; m.h=p.height; } }
  return m;
}

/** A picture's real type from its first bytes (the edge function sends them as a plain download). */
export function sniffType(b){
  if (!b||b.length<12) return "";
  if (b[0]===0xFF&&b[1]===0xD8&&b[2]===0xFF) return "image/jpeg";
  if (b[0]===0x89&&b[1]===0x50&&b[2]===0x4E&&b[3]===0x47) return "image/png";
  if (b[0]===0x52&&b[1]===0x49&&b[2]===0x46&&b[3]===0x46&&b[8]===0x57&&b[9]===0x45&&b[10]===0x42&&b[11]===0x50) return "image/webp";
  if (b[0]===0x47&&b[1]===0x49&&b[2]===0x46) return "image/gif";
  return "";
}

/** A file name for the copied picture, e.g. "printing-press-pexels-123.jpg". */
export function stockFileName(p, type, query=""){
  const ext={ "image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif" }[type]||"jpg";
  const base=stockLabel(p,query).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g,"").trim().replace(/[\s_]+/g,"-").slice(0,40).replace(/-+$/,"")||"photo";
  return `${base}-${p.provider}-${p.id}.${ext}`;
}

/** Plain-language status from the function's status answer. */
export function stockStatus(r){
  if (!r) return { state:"unknown", providers:{} };
  if (r.ok){ const providers=r.providers||{}; const any=PROVIDERS.some(p=>providers[p]); return { state: any?"ready":"no_key", providers, ai:!!r.ai }; }
  const map={ offline:"offline", signed_out:"signed_out", not_editor:"not_editor", not_deployed:"not_deployed", no_table:"not_deployed" };
  return { state: map[r.code]||"error", providers:{}, message:r.message||"" };
}
export const STOCK_STATUS_TEXT = {
  unknown:"Checking…",
  ready:"Ready.",
  no_key:"Almost there: add a free key for at least one photo service (steps below).",
  not_deployed:"The photo finder isn't on Supabase yet. It goes live when this update is merged; then add a key.",
  offline:"Finding photos needs the online studio (this copy saves in the browser only).",
  signed_out:"Sign in to the studio to find photos.",
  not_editor:"Only studio editors can find photos.",
  error:"Couldn't check the photo finder right now.",
};
