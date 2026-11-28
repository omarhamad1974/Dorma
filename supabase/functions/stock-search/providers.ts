/* Free stock photo services for the studio's "Find photos" (Library → Find photos).
   Pure code (no Deno, no network): builds each service's search request and turns its answer into one shape.
   Rules we follow (each service's API terms):
   - Pexels: free key, about 200 requests an hour and 20,000 a month; show a credit to the photographer and Pexels where possible.
   - Pixabay: free key, about 100 requests a minute; no permanent hotlinking, so pictures are copied into the Library.
   - Unsplash: free key, 50 requests an hour in demo mode; pictures must stay on Unsplash's own addresses (hotlinked),
     credited to the photographer and Unsplash, and the "download" address must be called when a picture is used. */

export type Provider = 'pexels' | 'pixabay' | 'unsplash';
export const PROVIDERS: Provider[] = ['pexels', 'pixabay', 'unsplash'];
export const PROVIDER_NAME: Record<Provider, string> = { pexels: 'Pexels', pixabay: 'Pixabay', unsplash: 'Unsplash' };
/** how a picture gets into the Library: copied into Supabase Storage, or kept as a link to the service */
export const HOW: Record<Provider, 'copy' | 'link'> = { pexels: 'copy', pixabay: 'copy', unsplash: 'link' };
export const LICENCE: Record<Provider, string> = {
  pexels: 'Pexels License: free to use, no attribution required (credit appreciated)',
  pixabay: 'Pixabay Content License: free to use, no attribution required',
  unsplash: 'Unsplash License: free to use; credit the photographer and Unsplash',
};

export type Orientation = 'any' | 'landscape' | 'portrait' | 'square';
export const COLOURS = ['any', 'red', 'orange', 'yellow', 'green', 'turquoise', 'blue', 'purple', 'pink', 'brown', 'black', 'gray', 'white', 'blackwhite'] as const;
export type Colour = typeof COLOURS[number];

export interface StockQuery { query: string; orientation: Orientation; colour: Colour; perPage: number; page: number }
export interface StockPhoto {
  provider: Provider; id: string;
  thumb: string; preview: string; full: string;
  width: number; height: number;
  alt: string; tags: string[];
  author: string; authorUrl: string; pageUrl: string;
  /** Unsplash only: the address to call when the picture is used */
  track?: string;
}

const enc = encodeURIComponent;

/** The request to send to one service (key goes in the header or the address, as each service wants). */
export function searchRequest(p: Provider, q: StockQuery, key: string): { url: string; headers: Record<string, string> } {
  const per = Math.min(Math.max(q.perPage || 24, 3), 40), page = Math.max(1, q.page || 1);
  if (p === 'pexels') {
    let u = `https://api.pexels.com/v1/search?query=${enc(q.query)}&per_page=${per}&page=${page}`;
    if (q.orientation !== 'any') u += `&orientation=${q.orientation}`;
    const c = q.colour === 'gray' ? 'gray' : q.colour === 'purple' ? 'violet' : q.colour === 'blackwhite' ? '' : q.colour;
    if (c && c !== 'any') u += `&color=${c}`;
    return { url: u, headers: { Authorization: key } };
  }
  if (p === 'pixabay') {
    let u = `https://pixabay.com/api/?key=${enc(key)}&q=${enc(q.query.slice(0, 100))}&image_type=photo&safesearch=true&per_page=${Math.max(per, 3)}&page=${page}`;
    if (q.orientation === 'landscape') u += '&orientation=horizontal';
    if (q.orientation === 'portrait') u += '&orientation=vertical';
    const c = q.colour === 'purple' ? 'lilac' : q.colour === 'blackwhite' ? 'grayscale' : q.colour;
    if (c !== 'any') u += `&colors=${c}`;
    return { url: u, headers: {} };
  }
  let u = `https://api.unsplash.com/search/photos?query=${enc(q.query)}&per_page=${Math.min(per, 30)}&page=${page}&content_filter=high`;
  if (q.orientation !== 'any') u += `&orientation=${q.orientation === 'square' ? 'squarish' : q.orientation}`;
  const c = q.colour === 'blackwhite' ? 'black_and_white' : q.colour === 'pink' ? 'magenta' : q.colour === 'turquoise' ? 'teal' : q.colour === 'gray' || q.colour === 'brown' ? '' : q.colour;
  if (c && c !== 'any') u += `&color=${c}`;
  return { url: u, headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } };
}

const s = (v: unknown) => (typeof v === 'string' ? v : '');
const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
const httpsOnly = (u: string) => (/^https:\/\//.test(u) ? u : '');
/** Pexels originals can be 6000px and 20 MB: ask Pexels for at most 2400px (their own resizer). */
const pexelsFull = (u: string) => (u ? u.split('?')[0] + '?auto=compress&cs=tinysrgb&w=2400' : '');

/** One service's answer as a list of photos (square pictures are left out for "square" on services without that filter). */
export function readResults(p: Provider, json: unknown, q?: Pick<StockQuery, 'orientation'>): StockPhoto[] {
  const j = (json || {}) as Record<string, unknown>;
  let out: StockPhoto[] = [];
  if (p === 'pexels') {
    out = ((j.photos as Record<string, any>[]) || []).map((x) => ({
      provider: p, id: String(x.id), thumb: httpsOnly(s(x.src?.medium)), preview: httpsOnly(s(x.src?.large2x) || s(x.src?.large)), full: pexelsFull(httpsOnly(s(x.src?.original))),
      width: n(x.width), height: n(x.height), alt: s(x.alt), tags: [], author: s(x.photographer), authorUrl: httpsOnly(s(x.photographer_url)), pageUrl: httpsOnly(s(x.url)),
    }));
  } else if (p === 'pixabay') {
    out = ((j.hits as Record<string, any>[]) || []).map((x) => ({
      provider: p, id: String(x.id), thumb: httpsOnly(s(x.webformatURL)), preview: httpsOnly(s(x.largeImageURL) || s(x.webformatURL)), full: httpsOnly(s(x.largeImageURL) || s(x.webformatURL)),
      width: n(x.imageWidth), height: n(x.imageHeight), alt: s(x.tags), tags: s(x.tags).split(',').map((t) => t.trim()).filter(Boolean),
      author: s(x.user), authorUrl: x.user && x.user_id ? `https://pixabay.com/users/${enc(s(x.user))}-${n(x.user_id)}/` : '', pageUrl: httpsOnly(s(x.pageURL)),
    }));
    if (q?.orientation === 'square') out = out.filter((x) => x.width && Math.abs(x.width / x.height - 1) < 0.15);
  } else {
    out = ((j.results as Record<string, any>[]) || []).map((x) => {
      const raw = httpsOnly(s(x.urls?.raw));
      return {
        provider: p, id: String(x.id), thumb: httpsOnly(s(x.urls?.small)), preview: httpsOnly(s(x.urls?.regular)),
        full: raw ? raw + (raw.includes('?') ? '&' : '?') + 'w=2400&fit=max&q=80&auto=format' : httpsOnly(s(x.urls?.full)),
        width: n(x.width), height: n(x.height), alt: s(x.alt_description) || s(x.description), tags: ((x.tags as any[]) || []).map((t) => s(t?.title)).filter(Boolean),
        author: s(x.user?.name), authorUrl: httpsOnly(s(x.user?.links?.html)), pageUrl: httpsOnly(s(x.links?.html)), track: httpsOnly(s(x.links?.download_location)),
      };
    });
  }
  return out.filter((x) => x.id && x.thumb && x.full);
}

/** Mixes the services' lists in turn (first of each, second of each…), so no service crowds out the others. */
export function interleave(lists: StockPhoto[][]): StockPhoto[] {
  const out: StockPhoto[] = []; const max = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) lists.forEach((l) => { if (l[i]) out.push(l[i]); });
  return out;
}

/** Hosts a picture may be copied from (Pexels and Pixabay only; Unsplash pictures stay linked). */
export function copyAllowed(url: string): boolean {
  try { const u = new URL(url); return u.protocol === 'https:' && ['images.pexels.com', 'cdn.pixabay.com', 'pixabay.com'].includes(u.hostname); } catch { return false; }
}
/** The Unsplash "download" address we are allowed to call. */
export function trackAllowed(url: string): boolean {
  try { const u = new URL(url); return u.protocol === 'https:' && u.hostname === 'api.unsplash.com' && /^\/photos\/[\w-]+\/download$/.test(u.pathname); } catch { return false; }
}

/** The credit line shown with a picture, e.g. "Photo by Ana Lee on Unsplash". */
export const creditLine = (p: Provider, author: string) => (author ? `Photo by ${author} on ${PROVIDER_NAME[p]}` : `Photo from ${PROVIDER_NAME[p]}`);

/** Checks and trims what the studio sent for a search. */
export function cleanQuery(b: Record<string, unknown>): StockQuery {
  const o = String(b.orientation || 'any'), c = String(b.colour || 'any');
  return {
    query: String(b.query || '').replace(/\s+/g, ' ').trim().slice(0, 120),
    orientation: (['any', 'landscape', 'portrait', 'square'].includes(o) ? o : 'any') as Orientation,
    colour: ((COLOURS as readonly string[]).includes(c) ? c : 'any') as Colour,
    perPage: Math.round(Number(b.perPage) || 24), page: Math.round(Number(b.page) || 1),
  };
}

/** Gemini: turn the editor's request (any language, with style hints) into short English search words. */
export function termsPrompt(request: string, style: string): Record<string, unknown> {
  return {
    systemInstruction: { parts: [{ text: 'You turn a website editor\'s picture request into search words for free stock photo sites (Pexels, Pixabay, Unsplash). ' +
      'Answer with JSON: "query" = the best 2 to 5 English words (concrete things that would be visible in the photo, no brand names, no quotation marks), ' +
      '"alternatives" = up to 3 other short English searches that could also work. The request may be in Arabic.' }] },
    contents: [{ role: 'user', parts: [{ text: `REQUEST: ${request.slice(0, 600)}${style ? `\nSTYLE: ${style.slice(0, 300)}` : ''}` }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 300, responseMimeType: 'application/json',
      responseSchema: { type: 'OBJECT', properties: { query: { type: 'STRING' }, alternatives: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['query'] } },
  };
}
export function readTerms(json: unknown): { query: string; alternatives: string[] } | null {
  const t = (json as any)?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
  try {
    const j = JSON.parse(t);
    const q = String(j.query || '').replace(/["“”]/g, '').trim().slice(0, 80);
    return q ? { query: q, alternatives: (Array.isArray(j.alternatives) ? j.alternatives : []).map((x: unknown) => String(x).trim().slice(0, 80)).filter(Boolean).slice(0, 3) } : null;
  } catch { return null; }
}
