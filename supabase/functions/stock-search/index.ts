/* Supabase edge function "stock-search": the studio's Library → Find photos.
   Searches free stock photo services and, when asked, lets Gemini choose the search words.
   The keys live only here, as edge function secrets (never in the repo or the browser):
     PEXELS_API_KEY        from https://www.pexels.com/api/ (free)
     PIXABAY_API_KEY       from https://pixabay.com/api/docs/ (free, shown once signed in)
     UNSPLASH_ACCESS_KEY   from https://unsplash.com/oauth/applications (free, "Access Key")
     GEMINI_API_KEY        optional here: the same key "Write with AI" uses, for "Let AI choose search words"
   Any one service is enough. Only signed-in studio editors can use it (public.ai_today / ai_take, migration 0003);
   only the AI search words count toward the editor's daily AI allowance.

   Actions (POST JSON):
     status  → which services have a key, and whether AI search words are available
     search  → { query, request?, ai?, style?, providers?, orientation, colour, page } → photos from each service
     fetch   → { url } → the picture's bytes (Pexels and Pixabay addresses only), so the studio can copy it into the Library
     track   → { url } → tells Unsplash a picture was used (their rule), Unsplash's own address only
   Deployed by the "Supabase" GitHub workflow on merge to main. */
import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  PROVIDERS, type Provider, type StockPhoto, searchRequest, readResults, interleave, copyAllowed, trackAllowed,
  cleanQuery, termsPrompt, readTerms,
} from './providers.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const reply = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const fail = (code: string, message: string, extra: Record<string, unknown> = {}) => reply({ ok: false, code, message, ...extra });
const num = (v: string | undefined, d: number) => (v && /^\d+$/.test(v) ? +v : d);
const MAX_BYTES = 15 * 1024 * 1024;
const TERMS_MODELS = ['gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.5-flash'];

const keys = (): Record<Provider, string> => ({
  pexels: Deno.env.get('PEXELS_API_KEY') || '',
  pixabay: Deno.env.get('PIXABAY_API_KEY') || '',
  unsplash: Deno.env.get('UNSPLASH_ACCESS_KEY') || '',
});

/** Gemini picks the search words; null when it can't (the editor's own words are used then). */
async function aiTerms(key: string, request: string, style: string): Promise<{ query: string; alternatives: string[] } | null> {
  for (const model of TERMS_MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(termsPrompt(request, style)), signal: AbortSignal.timeout(20_000),
      });
      if (res.status === 404) continue;
      if (!res.ok) return null;
      return readTerms(await res.json());
    } catch { return null; }
  }
  return null;
}

/** One service's search; a service that fails is reported, not fatal. */
async function searchOne(p: Provider, key: string, q: ReturnType<typeof cleanQuery>): Promise<{ photos: StockPhoto[]; note?: string }> {
  const { url, headers } = searchRequest(p, q, key);
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(12_000) });
    if (res.status === 401 || res.status === 403) return { photos: [], note: `${p}: the key was not accepted` };
    if (res.status === 429) return { photos: [], note: `${p}: too many searches for now, try again later` };
    if (!res.ok) return { photos: [], note: `${p}: did not answer (${res.status})` };
    return { photos: readResults(p, await res.json(), q) };
  } catch {
    return { photos: [], note: `${p}: did not answer in time` };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail('method', 'Use POST.');

  const auth = req.headers.get('Authorization') || '';
  const apikey = req.headers.get('apikey') || Deno.env.get('SUPABASE_ANON_KEY') || '';
  if (!/^Bearer\s+\S+/.test(auth) || !apikey) return fail('signed_out', 'Sign in to the studio to find photos.');
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, apikey, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail('bad_request', 'The request was not readable.'); }
  const action = String(body?.action || '');

  /* every action: is this a studio editor? (does not count as an AI use) */
  const { data: today, error: todayErr } = await sb.rpc('ai_today');
  if (todayErr) return fail(/function|schema/i.test(todayErr.message) ? 'no_table' : 'signed_out', todayErr.message);
  if (!(today as { editor?: boolean })?.editor) return fail('not_editor', 'Only studio editors can find photos.');

  const k = keys(), gemini = Deno.env.get('GEMINI_API_KEY') || '';

  if (action === 'status') {
    return reply({ ok: true, providers: { pexels: !!k.pexels, pixabay: !!k.pixabay, unsplash: !!k.unsplash }, ai: !!gemini });
  }

  if (action === 'search') {
    const wanted = (Array.isArray(body.providers) ? body.providers : PROVIDERS).filter((p): p is Provider => PROVIDERS.includes(p as Provider));
    const use = wanted.filter((p) => k[p]);
    if (!use.length) return fail('no_key', 'No photo service key has been added yet. See Library → Find photos for the steps.');

    const q = cleanQuery(body);
    const request = String(body.request || '').trim().slice(0, 600);
    let terms: { query: string; alternatives: string[] } | null = null;
    if (body.ai === true && request && gemini) {
      const dayLimit = num(Deno.env.get('AI_DAILY_LIMIT'), 150), minuteLimit = num(Deno.env.get('AI_MINUTE_LIMIT'), 8);
      const { data: take } = await sb.rpc('ai_take', { p_day_limit: dayLimit, p_minute_limit: minuteLimit });
      if ((take as { ok?: boolean })?.ok) terms = await aiTerms(gemini, request, String(body.style || ''));
      if (terms) q.query = terms.query;
    }
    if (!q.query) q.query = request.slice(0, 120);
    if (!q.query) return fail('bad_request', 'Type what the picture should show.');

    const got = await Promise.all(use.map((p) => searchOne(p, k[p], q)));
    return reply({
      ok: true, query: q.query, alternatives: terms?.alternatives || [], ai: !!terms,
      photos: interleave(got.map((g) => g.photos)),
      notes: got.map((g) => g.note).filter(Boolean),
    });
  }

  if (action === 'fetch') {
    const url = String(body.url || '');
    if (!copyAllowed(url)) return fail('bad_request', 'Only Pexels and Pixabay pictures can be copied.');
    let res: Response;
    try { res = await fetch(url, { signal: AbortSignal.timeout(30_000) }); }
    catch { return fail('fetch_failed', 'The picture could not be downloaded. Try again.'); }
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !copyAllowed(res.url || url) || !/^image\//.test(type)) return fail('fetch_failed', 'The picture could not be downloaded. Try again.');
    if (num(res.headers.get('content-length') || undefined, 0) > MAX_BYTES) return fail('too_big', 'That picture is larger than 15 MB.');
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length > MAX_BYTES) return fail('too_big', 'That picture is larger than 15 MB.');
    // octet-stream so the studio's client hands back a Blob; the studio reads the real type from the bytes
    return new Response(bytes, { headers: { ...CORS, 'Content-Type': 'application/octet-stream', 'X-Image-Type': type } });
  }

  if (action === 'track') {
    const url = String(body.url || '');
    if (!trackAllowed(url) || !k.unsplash) return fail('bad_request', 'Not an Unsplash download address.');
    try { await fetch(url, { headers: { Authorization: `Client-ID ${k.unsplash}`, 'Accept-Version': 'v1' }, signal: AbortSignal.timeout(10_000) }); } catch { /* best effort */ }
    return reply({ ok: true });
  }

  return fail('bad_request', 'Unknown action.');
});
