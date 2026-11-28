import { describe, expect, it } from 'vitest';
import { cleanRequest, geminiBody, readReply, systemPrompt, userPrompt, tidy, GAP, type WriteRequest } from '../supabase/functions/ai-write/prompt';
import { defaultAction, requestBody, statusOf, contextLines, toText, fromText, translateFrom } from '../src/studio/aitext';

const base = { field: { label: 'Title', kind: 'text' }, langs: ['en', 'ar'] };
const req = (b: Record<string, unknown>): WriteRequest => {
  const r = cleanRequest({ ...base, ...b });
  if (typeof r === 'string') throw new Error(r);
  return r;
};

describe('ai-write request checks', () => {
  it('refuses unknown actions and empty work', () => {
    expect(cleanRequest({ ...base, action: 'hack' })).toBe('Unknown action.');
    expect(cleanRequest({ ...base, action: 'improve', text: {} })).toMatch(/no text/);
    expect(cleanRequest({ ...base, action: 'write' })).toMatch(/what it should be about/);
    expect(cleanRequest({ ...base, action: 'translate', text: {} })).toMatch(/nothing|no text/i);
    expect(cleanRequest({ ...base, action: 'describe' })).toMatch(/no picture/);
  });
  it('trims long input and keeps only known languages', () => {
    const r = req({ action: 'write', brief: 'x'.repeat(5000), langs: ['en', 'fr', 'ar'] });
    expect(r.brief!.length).toBe(1500);
    expect(r.langs).toEqual(['en', 'ar']);
  });
  it('translates from the language that has text', () => {
    expect(req({ action: 'translate', text: { ar: 'مرحبا' } }).from).toBe('ar');
    expect(req({ action: 'translate', text: { en: 'Hi', ar: 'مرحبا' } }).from).toBe('en');
  });
  it('accepts only small jpeg/png/webp pictures', () => {
    expect(req({ action: 'describe', image: { mime: 'image/jpeg', data: 'abc' } }).image).toBeTruthy();
    expect(cleanRequest({ ...base, action: 'describe', image: { mime: 'text/html', data: 'abc' } })).toMatch(/no picture/);
    expect(cleanRequest({ ...base, action: 'describe', image: { mime: 'image/png', data: 'a'.repeat(1_600_000) } })).toMatch(/too large/);
  });
});

describe('ai-write prompt', () => {
  it('forbids invented facts and names the gap marker', () => {
    const s = systemPrompt(req({ action: 'write', brief: 'Booth intro', brand: 'Dorma builds booths.', avoid: 'synergy' }));
    expect(s).toMatch(/Never invent clients/);
    expect(s).toContain(GAP);
    expect(s).toContain('Dorma builds booths.');
    expect(s).toContain('synergy');
    expect(s).toMatch(/"en" \(English\) and "ar" \(Arabic\)/);
  });
  it('tells the AI the box, the context and the current text', () => {
    const u = userPrompt(req({ action: 'improve', text: { en: 'We do booths' }, context: 'Section: Booths', field: { label: 'Intro', group: 'Booth page', kind: 'area' } }));
    expect(u).toContain('BOX: Booth page › Intro');
    expect(u).toContain('Section: Booths');
    expect(u).toContain('We do booths');
    expect(u).toMatch(/Where one language is empty/);
  });
  it('asks for JSON per language and turns thinking off on 2.5 Flash only', () => {
    const r = req({ action: 'write', brief: 'x' });
    const b = geminiBody(r, 'gemini-2.5-flash') as { generationConfig: Record<string, unknown> };
    expect(b.generationConfig.responseMimeType).toBe('application/json');
    expect((b.generationConfig.responseSchema as { required: string[] }).required).toEqual(['en', 'ar']);
    expect(b.generationConfig.thinkingConfig).toEqual({ thinkingBudget: 0 });
    expect((geminiBody(r, 'gemini-2.5-flash-lite') as { generationConfig: Record<string, unknown> }).generationConfig.thinkingConfig).toBeUndefined();
    expect((geminiBody(r, 'gemini-flash-latest') as { generationConfig: Record<string, unknown> }).generationConfig.thinkingConfig).toBeUndefined();
  });
  it('sends the picture inline for describe', () => {
    const b = geminiBody(req({ action: 'describe', field: { label: 'Alt', kind: 'text', key: 'alt' }, image: { mime: 'image/jpeg', data: 'QUJD' } }), 'gemini-2.5-flash') as { contents: Array<{ parts: unknown[] }> };
    expect(b.contents[0].parts[1]).toEqual({ inline_data: { mime_type: 'image/jpeg', data: 'QUJD' } });
  });
});

describe('general industry knowledge', () => {
  it('is off unless asked, and keeps Dorma facts sourced when on', () => {
    expect(req({ action: 'write', brief: 'x' }).general).toBe(false);
    const off = systemPrompt(req({ action: 'write', brief: 'x' }));
    expect(off).toMatch(/Use only facts found/);
    const on = systemPrompt(req({ action: 'write', brief: 'Explain offset printing', general: true }));
    expect(on).toMatch(/general knowledge/);
    expect(on).toMatch(/offset/);
    expect(on).toMatch(/never say Dorma offers a service/);
    expect(on).toContain(GAP);
    expect(on).not.toMatch(/Use only facts found/);
  });
  it('follows the studio default unless the window says otherwise', () => {
    const base = { action: 'write', langs: ['en'], text: {}, brief: 'x', field: { label: 'T', kind: 'text' } };
    expect(requestBody({ ...base, ai: { general: true } }).general).toBe(true);
    expect(requestBody({ ...base, ai: { general: true }, general: false }).general).toBe(false);
    expect(requestBody({ ...base, ai: {} }).general).toBe(false);
  });
});

describe('ai-write reply', () => {
  const ok = (text: string, finishReason = 'STOP') => ({ candidates: [{ finishReason, content: { parts: [{ text }] } }] });
  it('reads the JSON answer and tidies single lines', () => {
    const r = req({ action: 'write', brief: 'x' });
    expect(readReply(r, ok('{"en":"\\"Booth Production\\"\\n","ar":"إنتاج الأجنحة"}'))).toEqual({ text: { en: 'Booth Production', ar: 'إنتاج الأجنحة' } });
  });
  it('never changes the source language when translating', () => {
    const r = req({ action: 'translate', text: { en: 'Hello' } });
    expect(readReply(r, ok('{"en":"Hi there","ar":"مرحبا"}'))).toEqual({ text: { en: 'Hello', ar: 'مرحبا' } });
  });
  it('reports blocked and empty answers', () => {
    const r = req({ action: 'write', brief: 'x' });
    expect(readReply(r, ok('', 'SAFETY'))).toEqual({ error: 'blocked' });
    expect(readReply(r, { promptFeedback: { blockReason: 'OTHER' } })).toEqual({ error: 'blocked' });
    expect(readReply(r, ok('{}'))).toEqual({ error: 'empty' });
    expect(readReply(r, {})).toEqual({ error: 'empty' });
  });
  it('cleans list answers into one item per line', () => {
    expect(tidy('- One\n\n2. Two\n• Three', 'strings')).toBe('One\nTwo\nThree');
  });
});

describe('studio helpers', () => {
  it('opens on the action that fits the box', () => {
    expect(defaultAction({ text: {}, langs: ['en', 'ar'] })).toBe('write');
    expect(defaultAction({ text: {}, langs: ['en'], canDescribe: true })).toBe('describe');
    expect(defaultAction({ text: { en: 'Hi' }, langs: ['en', 'ar'] })).toBe('translate');
    expect(defaultAction({ text: { en: 'Hi', ar: 'مرحبا' }, langs: ['en', 'ar'] })).toBe('improve');
    expect(translateFrom({ ar: 'x' })).toBe('ar');
  });
  it('builds the request with the brand notes and model', () => {
    const b = requestBody({ action: 'translate', langs: ['en'], text: { en: 'Hi', ar: '' }, from: 'ar', brief: ' ', field: { label: 'T', kind: 'text' }, context: '', ai: { brand: 'B', model: 'lite' } });
    expect(b.langs).toEqual(['en', 'ar']);
    expect(b.from).toBe('en'); // Arabic is empty, so translate from English
    expect(b.text).toEqual({ en: 'Hi' });
    expect(b.model).toBe('lite');
    expect(b.brand).toBe('B');
    expect(b.image).toBeNull();
  });
  it('reads the status answer', () => {
    expect(statusOf({ ok: true, ready: false })).toMatchObject({ state: 'no_key' });
    expect(statusOf({ ok: true, ready: true, used: 3, limit: 150 })).toEqual({ state: 'ready', used: 3, limit: 150 });
    expect(statusOf({ ok: false, code: 'not_deployed' }).state).toBe('not_deployed');
    expect(statusOf({ ok: false, code: 'weird' }).state).toBe('error');
  });
  it('collects nearby text without repeats', () => {
    expect(contextLines([['Title', 'Booths'], ['Again', 'Booths'], ['Empty', ''], ['Text', 'We  build\nbooths']])).toBe('Title: Booths\nText: We build booths');
  });
  it('turns lists into lines and back', () => {
    expect(toText(['a', 'b'], 'strings')).toBe('a\nb');
    expect(fromText('a\n\n b ', 'strings')).toEqual(['a', 'b']);
    expect(fromText('a\nb', 'area')).toBe('a\nb');
  });
});

import { cleanTune, tuneRules, cleanUrls, userPrompt as up2 } from '../supabase/functions/ai-write/prompt';
import { publicIp, htmlToText } from '../supabase/functions/ai-write/refs';
import { tuneSummary, pickRefs, archiveEntry, filterArchive } from '../src/studio/aitext';

describe('tuning', () => {
  it('keeps only known choices and sane word counts', () => {
    expect(cleanTune({ tone: 'friendly', purpose: 'hack', length: 'words', words: 60, audience: ' buyers ', cta: 'auto' })).toEqual({ tone: 'friendly', length: 'words', words: 60, audience: 'buyers' });
    expect(cleanTune({ length: 'words', words: 99999 })).toEqual({});
  });
  it('turns choices into style rules', () => {
    const r = tuneRules({ tone: 'bold', length: 'words', words: 40, arabicStyle: 'gulf', extra: 'mention delivery' }, 'area', ['en', 'ar']);
    expect(r.join(' ')).toMatch(/bold/);
    expect(r.join(' ')).toMatch(/about 40 words in each language/);
    expect(r.join(' ')).toMatch(/Gulf/);
    expect(r.join(' ')).toMatch(/mention delivery/);
    expect(tuneRules({ arabicStyle: 'gulf' }, 'area', ['en'])).toEqual([]);
    expect(tuneRules({ length: 'short' }, 'text', ['en'])).toEqual([]); // a one-line box is short anyway
  });
  it('puts the style into the system prompt', () => {
    expect(systemPrompt(req({ action: 'write', brief: 'x', tune: { purpose: 'social' } }))).toMatch(/STYLE[\s\S]*social media post/);
  });
  it('summarises a style for the studio', () => {
    expect(tuneSummary({ length: 'short', tone: 'friendly', purpose: 'social' })).toBe('Short · Friendly · Social media post');
    expect(tuneSummary({})).toBe('Automatic');
  });
});

describe('reference websites', () => {
  it('accepts only public http(s) pages', () => {
    expect(cleanUrls(['https://example.com/a#x', 'http://localhost/x', 'http://127.0.0.1/', 'ftp://example.com', 'https://user:pw@example.com', 'https://example.com:8080/', 'https://intranet.corp/'])).toEqual(['https://example.com/a']);
    expect(cleanUrls(['https://a.com', 'https://b.com', 'https://c.com', 'https://d.com'])).toHaveLength(3);
  });
  it('blocks private and special addresses', () => {
    ['10.0.0.1', '127.0.0.1', '169.254.169.254', '172.16.5.4', '192.168.1.1', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1'].forEach((ip) => expect(publicIp(ip)).toBe(false));
    ['8.8.8.8', '104.16.0.1', '2606:4700::1111'].forEach((ip) => expect(publicIp(ip)).toBe(true));
  });
  it('reads page text without menus and scripts', () => {
    const r = htmlToText('<html><head><title>Paper &amp; Print</title><script>x()</script></head><body><nav>Menu</nav><h1>Offset printing</h1><p>Plates transfer ink&nbsp;to a blanket.</p><footer>©</footer></body></html>');
    expect(r.title).toBe('Paper & Print');
    expect(r.text).toContain('Offset printing');
    expect(r.text).toContain('Plates transfer ink to a blanket.');
    expect(r.text).not.toMatch(/Menu|x\(\)|©/);
  });
  it('tells the AI how to use them', () => {
    const r = req({ action: 'write', brief: 'x' }); r.refs = [{ url: 'https://ex.com', title: 'Guide', text: 'Offset suits long runs.' }];
    const u = up2(r);
    expect(u).toMatch(/REFERENCE PAGES/);
    expect(u).toMatch(/never present them as Dorma/);
    expect(u).toContain('Offset suits long runs.');
  });
  it('picks saved defaults plus a one-off link', () => {
    expect(pickRefs([{ url: 'https://a.com', on: true }, { url: 'https://b.com', on: false }], 'c.com')).toEqual(['https://a.com', 'https://c.com']);
  });
});

describe('archive', () => {
  const items = [
    { id: '1', created_at: '', title: 'Booth intro', tags: ['Pages'], en: 'We build booths', ar: '', meta: {} },
    { id: '2', created_at: '', title: 'LinkedIn post', tags: ['Social'], en: 'Offset printing tips', ar: 'نصائح', meta: { brief: 'paper' } },
  ];
  it('makes an entry with a title, tags and what it was for', () => {
    const e = archiveEntry({ result: { en: 'Hello there', ar: 'مرحبا' }, brief: '', label: 'Title', group: 'Home', action: 'write' });
    expect(e.title).toBe('Hello there');
    expect(e.tags).toEqual(['Home', 'Title']);
    expect(e.meta.action).toBe('write');
  });
  it('searches text, brief and tags', () => {
    expect(filterArchive(items, 'offset').map((x) => x.id)).toEqual(['2']);
    expect(filterArchive(items, 'paper').map((x) => x.id)).toEqual(['2']);
    expect(filterArchive(items, '', 'Pages').map((x) => x.id)).toEqual(['1']);
  });
});
