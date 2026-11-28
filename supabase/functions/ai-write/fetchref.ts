/* Reads the reference websites the editor picked, safely, for "Write with AI".
   Only public http(s) pages: every address (and every redirect) is checked so the function can't be pointed at
   private networks or cloud metadata. Small, quick and text-only: 8 s per page, 1 MB read, 6,000 characters kept. */
import { cleanUrls, type RefPage } from './prompt.ts';
import { htmlToText, publicIp } from './refs.ts';

const MAX_CHARS = 6000, MAX_BYTES = 1_000_000, TIMEOUT = 8000, MAX_REDIRECTS = 3;

/** Checks that a host name only points at public addresses. If this runtime can't look names up at all,
    the name rules in cleanUrls (no IP literals, no local names) and the per-redirect checks still apply. */
async function hostIsPublic(host: string): Promise<boolean> {
  const look = async (t: 'A' | 'AAAA') => { try { return { ips: await Deno.resolveDns(host, t), err: null }; } catch (e) { return { ips: [] as string[], err: e }; } };
  const [a, aaaa] = await Promise.all([look('A'), look('AAAA')]);
  const all = [...a.ips, ...aaaa.ips];
  if (all.length) return all.every(publicIp);
  const unusable = (e: unknown) => !!e && !(e instanceof Deno.errors.NotFound);
  return unusable(a.err) && unusable(aaaa.err); // lookups unavailable here (not "no such host")
}

async function readOne(start: string): Promise<RefPage | string> {
  let url = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const u = new URL(url);
    if (!cleanUrls([url]).length || !(await hostIsPublic(u.hostname))) return 'not a public web page';
    let res: Response;
    try {
      res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StudioReferenceReader/1.0)', Accept: 'text/html,text/plain;q=0.9' } });
    } catch { return 'did not answer in time'; }
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location'); await res.body?.cancel();
      if (!loc) return 'redirected nowhere';
      url = new URL(loc, url).href; continue;
    }
    if (!res.ok) { await res.body?.cancel(); return `answered ${res.status}`; }
    const type = res.headers.get('content-type') || '';
    if (!/text\/html|text\/plain|application\/xhtml/i.test(type)) { await res.body?.cancel(); return 'is not a text page'; }
    const reader = res.body?.getReader(); if (!reader) return 'was empty';
    const chunks: Uint8Array[] = []; let n = 0;
    while (n < MAX_BYTES) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); n += value.length; }
    await reader.cancel().catch(() => {});
    const raw = new TextDecoder().decode(concat(chunks).slice(0, MAX_BYTES));
    const { title, text } = /text\/plain/i.test(type) ? { title: '', text: raw.slice(0, MAX_CHARS) } : htmlToText(raw);
    if (text.length < 80) return 'had almost no readable text (it may need JavaScript)';
    return { url, title, text };
  }
  return 'redirected too many times';
}
const concat = (c: Uint8Array[]) => { const o = new Uint8Array(c.reduce((s, x) => s + x.length, 0)); let i = 0; c.forEach((x) => { o.set(x, i); i += x.length; }); return o; };

/** Reads up to 3 pages in parallel. Returns the pages read and a note for each one that couldn't be read. */
export async function readRefs(urls: string[]): Promise<{ pages: RefPage[]; notes: string[] }> {
  const got = await Promise.all(urls.map((u) => readOne(u).catch(() => 'could not be read')));
  const pages: RefPage[] = [], notes: string[] = [];
  got.forEach((g, i) => { if (typeof g === 'string') notes.push(`${new URL(urls[i]).hostname} ${g}`); else pages.push(g); });
  return { pages, notes };
}
