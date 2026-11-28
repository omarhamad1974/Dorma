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
