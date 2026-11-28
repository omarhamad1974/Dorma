/* Supabase edge function "ai-write": the studio's "Write with AI".
   The Gemini API key lives only here, as the edge function secret GEMINI_API_KEY (never in the repo or the browser).
   Only signed-in studio editors can use it, with a daily and per-minute limit per editor (public.ai_take, migration 0003).

   Secrets (Supabase dashboard → Edge Functions → Secrets):
     GEMINI_API_KEY     required, from Google AI Studio (free)
     AI_DAILY_LIMIT     optional, uses per editor per day (default 150)
     AI_MINUTE_LIMIT    optional, uses per editor per minute (default 8)
   Deployed by the "Supabase" GitHub workflow on merge to main. */
import { createClient } from 'npm:@supabase/supabase-js@2';
import { MODELS, cleanRequest, geminiBody, readReply } from './prompt.ts';
import { readRefs } from './fetchref.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const reply = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const fail = (code: string, message: string, extra: Record<string, unknown> = {}) => reply({ ok: false, code, message, ...extra });
const num = (v: string | undefined, d: number) => (v && /^\d+$/.test(v) ? +v : d);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return fail('method', 'Use POST.');

  const auth = req.headers.get('Authorization') || '';
  const apikey = req.headers.get('apikey') || Deno.env.get('SUPABASE_ANON_KEY') || '';
  if (!/^Bearer\s+\S+/.test(auth) || !apikey) return fail('signed_out', 'Sign in to the studio to use AI writing.');
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, apikey, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail('bad_request', 'The request was not readable.'); }

  const dayLimit = num(Deno.env.get('AI_DAILY_LIMIT'), 150), minuteLimit = num(Deno.env.get('AI_MINUTE_LIMIT'), 8);
  const key = Deno.env.get('GEMINI_API_KEY') || '';

  /* status: is the key there, and how much of today's allowance is used (does not count as a use) */
  if (body?.action === 'status') {
    const { data, error } = await sb.rpc('ai_today');
    if (error) return fail(/function|schema/i.test(error.message) ? 'no_table' : 'signed_out', error.message);
    const t = data as { editor?: boolean; used?: number };
    if (!t?.editor) return fail('not_editor', 'Only studio editors can use AI writing.');
    return reply({ ok: true, ready: !!key, used: t.used || 0, limit: dayLimit });
  }

  const r = cleanRequest(body);
  if (typeof r === 'string') return fail('bad_request', r);

  /* who is asking, and are they within the limits? (counts one use) */
  const { data: take, error: takeErr } = await sb.rpc('ai_take', { p_day_limit: dayLimit, p_minute_limit: minuteLimit });
  if (takeErr) return fail('signed_out', 'Your sign-in could not be checked. Sign in again and retry.');
  const t = take as { ok: boolean; code?: string; used?: number; limit?: number };
  if (!t?.ok) {
    if (t?.code === 'not_editor') return fail('not_editor', 'Only studio editors can use AI writing.');
    if (t?.code === 'minute_limit') return fail('minute_limit', 'That was a lot of requests in a minute. Wait a moment and try again.');
    return fail('day_limit', `You have used all ${dayLimit} AI requests for today. It resets at midnight (UTC).`, { used: t?.used, limit: dayLimit });
  }
  if (!key) return fail('no_key', 'The Gemini key has not been added yet. See Content → AI writing.');

  /* reference websites: read them now (public pages only); a page that can't be read is reported, not fatal */
  let notes: string[] = [];
  if (r.refUrls?.length) { const got = await readRefs(r.refUrls); r.refs = got.pages; notes = got.notes; }

  const choice = typeof body.model === 'string' && MODELS[body.model] ? body.model : 'flash';
  const models = Deno.env.get('GEMINI_MODEL') ? [Deno.env.get('GEMINI_MODEL')!, ...MODELS[choice]] : MODELS[choice];

  for (const model of models) {
    let res: Response;
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(geminiBody(r, model)),
        signal: AbortSignal.timeout(45_000),
      });
    } catch {
      return fail('gemini_down', 'Gemini did not answer in time. Try again in a moment.');
    }
    if (res.status === 404) continue; // that model name was retired: try the next
    const json = await res.json().catch(() => null) as { error?: { message?: string; status?: string } } | null;
    if (res.status === 429) return fail('quota', "Gemini's free allowance is used up for now. Wait a minute and try again. If it keeps happening, the daily allowance resets at midnight Pacific time.");
    if (res.status === 400 && /api key/i.test(json?.error?.message || '') || res.status === 401 || res.status === 403)
      return fail('bad_key', 'Gemini did not accept the key. Check GEMINI_API_KEY in Supabase (Edge Functions → Secrets).');
    if (!res.ok) return fail('gemini_error', 'Gemini could not write this one: ' + (json?.error?.message || res.statusText));
    const out = readReply(r, json);
    if ('error' in out) return fail(out.error, out.error === 'blocked' ? 'Gemini declined to write this. Try rewording the brief.' : 'Gemini sent back an empty answer. Try again.');
    return reply({ ok: true, text: out.text, model, used: t.used, limit: dayLimit, refs: (r.refs || []).map((p) => ({ url: p.url, title: p.title })), notes });
  }
  return fail('gemini_error', 'No Gemini model was available. Set GEMINI_MODEL in the Supabase secrets to a current model name.');
});
