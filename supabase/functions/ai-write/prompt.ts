/* Builds the Gemini request for the studio's "Write with AI" and reads its answer.
   Pure code (no Deno or network), so it runs in the edge function and in the vitest tests alike. */

export type Lang = 'en' | 'ar';
export type Action = 'write' | 'improve' | 'shorten' | 'translate' | 'describe';
export type Kind = 'text' | 'area' | 'prose' | 'strings';

export interface WriteRequest {
  action: Action;
  langs: Lang[];
  /** the text in the box now, per language */
  text: Partial<Record<Lang, string>>;
  /** translate: the language to translate from */
  from?: Lang;
  /** what the editor wants it to say */
  brief?: string;
  field: { label: string; group?: string; kind: Kind; key?: string };
  /** other text from the same part of the studio (section title, nearby fields…) */
  context?: string;
  /** Studio → Content → AI writing */
  brand?: string;
  arabic?: string;
  avoid?: string;
  /** allow general industry knowledge (printing processes, materials, marketing practice…) beyond the site's own text */
  general?: boolean;
  /** a picture to describe (describe action), base64 without the data: prefix */
  image?: { mime: string; data: string } | null;
}

export const ACTIONS: Action[] = ['write', 'improve', 'shorten', 'translate', 'describe'];
export const KINDS: Kind[] = ['text', 'area', 'prose', 'strings'];
export const GAP = '[To be supplied by Dorma]';
export const GAP_AR = '[تُضاف من دورما]';

/** Studio model choice → Gemini models to try in order (a retired name falls through to the "latest" alias). */
export const MODELS: Record<string, string[]> = {
  flash: ['gemini-2.5-flash', 'gemini-flash-latest'],
  lite: ['gemini-2.5-flash-lite', 'gemini-flash-lite-latest'],
};

const LIMITS = { text: 4000, brief: 1500, context: 4000, brand: 4000, short: 600 };
const cut = (s: unknown, n: number): string => (typeof s === 'string' ? s.slice(0, n) : '');

/** Checks and trims what the studio sent. Returns an error message, or the cleaned request. */
export function cleanRequest(body: unknown): WriteRequest | string {
  if (!body || typeof body !== 'object') return 'Nothing to write.';
  const b = body as Record<string, unknown>;
  const action = b.action as Action;
  if (!ACTIONS.includes(action)) return 'Unknown action.';
  const langs = (Array.isArray(b.langs) ? b.langs : ['en']).filter((l): l is Lang => l === 'en' || l === 'ar');
  if (!langs.length) return 'Pick a language.';
  const t = (b.text && typeof b.text === 'object' ? b.text : {}) as Record<string, unknown>;
  const text: Partial<Record<Lang, string>> = {};
  (['en', 'ar'] as Lang[]).forEach((l) => { const v = cut(t[l], LIMITS.text); if (v.trim()) text[l] = v; });
  const f = (b.field && typeof b.field === 'object' ? b.field : {}) as Record<string, unknown>;
  const kind = KINDS.includes(f.kind as Kind) ? (f.kind as Kind) : 'area';
  const req: WriteRequest = {
    action, langs, text,
    from: b.from === 'ar' ? 'ar' : b.from === 'en' ? 'en' : undefined,
    brief: cut(b.brief, LIMITS.brief).trim(),
    field: { label: cut(f.label, 200) || 'Text', group: cut(f.group, 200), kind, key: cut(f.key, 60) },
    context: cut(b.context, LIMITS.context),
    brand: cut(b.brand, LIMITS.brand),
    arabic: cut(b.arabic, LIMITS.short),
    avoid: cut(b.avoid, LIMITS.short),
    general: b.general === true,
    image: null,
  };
  const img = b.image as Record<string, unknown> | null | undefined;
  if (img && typeof img.data === 'string' && /^image\/(jpeg|png|webp)$/.test(String(img.mime))) {
    if (img.data.length > 1_500_000) return 'That picture is too large to send.';
    req.image = { mime: String(img.mime), data: img.data };
  }
  if (action === 'translate') {
    const from = req.from || (text.en ? 'en' : 'ar');
    if (!text[from]) return 'There is no text to translate yet.';
    req.from = from;
  }
  if ((action === 'improve' || action === 'shorten') && !req.langs.some((l) => text[l])) return 'There is no text to work on yet. Write something first, or use Write.';
  if (action === 'write' && !req.brief && !req.langs.some((l) => text[l]) && !req.context) return 'Say in a few words what it should be about.';
  if (action === 'describe' && !req.image) return 'There is no picture to describe.';
  return req;
}

const LANG_NAME: Record<Lang, string> = { en: 'English', ar: 'Arabic' };

/** The rules every answer follows: Dorma's voice, no invented facts, the field's format. */
export function systemPrompt(r: WriteRequest): string {
  const rules = [
    'You write website copy for Dorma Advertising, an advertising agency with in-house printing and production, established in 2000.',
    'You are helping the site editor fill in one box in their website studio. Your text goes into that box after the editor reads and edits it.',
    '',
    r.general ? generalRule() :
      'FACTS. Use only facts found in the brand notes, the existing text, the brief, the picture and the page context below. ' +
      'Never invent clients, brand names, project names, results, statistics, numbers, years, awards, testimonials, quotes, prices, locations, team members or contact details. ' +
      `When the text needs a fact you were not given, write ${GAP} in English and ${GAP_AR} in Arabic instead of making one up.`,
    'VOICE. Clear, practical and confident. Short sentences. Speak to the reader as "you". Say what Dorma does and how, instead of piling up adjectives. ' +
      'No hype, no clichés, no emojis, no hashtags, no exclamation marks.',
    'ARABIC. Modern Standard Arabic that reads naturally to Gulf business readers. Never translate word for word: say the same thing the way an Arabic copywriter would. ' +
      'Write Dorma as دورما. Keep the same meaning, facts and length as the English.',
  ];
  if (r.avoid) rules.push(`AVOID these words and phrases: ${r.avoid}`);
  if (r.arabic) rules.push(`ARABIC NOTES from the editor: ${r.arabic}`);
  rules.push('FORMAT. ' + formatRule(r.field.kind));
  rules.push('Answer with JSON only: ' + r.langs.map((l) => `"${l}" (${LANG_NAME[l]})`).join(' and ') + '. Each value is the finished text for the box, with nothing before or after it.');
  if (r.brand) rules.push('', 'BRAND NOTES (from the editor):', r.brand);
  return rules.join('\n');
}

/* "Use general industry knowledge": general explanations are fine, but anything about Dorma itself still needs a source. */
function generalRule(): string {
  return 'FACTS. You may use accurate, widely accepted general knowledge about the industry to explain things: printing methods ' +
    '(for example offset, digital, large-format and screen printing), paper and materials, finishing, packaging, signage, exhibitions, events, ' +
    'video, branding and marketing practice. Keep it correct and practical, and avoid exact figures, prices, lead times or statistics unless they are given. ' +
    'Facts about Dorma itself must still come only from the brand notes, the existing text, the brief, the picture and the page context below: ' +
    'never invent Dorma\'s clients, projects, results, numbers, years, awards, testimonials, quotes, prices, locations, equipment, team or contact details, ' +
    'and never say Dorma offers a service, machine or method unless that source says so. Write general knowledge as general ("Offset printing suits long runs"), not as a Dorma claim. ' +
    `When the text needs a Dorma fact you were not given, write ${GAP} in English and ${GAP_AR} in Arabic instead of making one up.`;
}

function formatRule(kind: Kind): string {
  switch (kind) {
    case 'text': return 'A single line with no line breaks, no quotation marks around it and no full stop at the end unless it is a full sentence. Keep it short: a title or label is usually 2 to 8 words.';
    case 'strings': return 'A list: one item per line, no bullets, no numbering, no blank lines.';
    case 'prose': return 'Markdown as the site uses it: a blank line between paragraphs, "## " for headings, "- " for list items, **bold** and *italic*. ' +
      'Keep every [[...]] picture token and every link exactly as it is, in the same place.';
    default: return 'Plain text: one to three short paragraphs separated by a blank line, no Markdown, no headings.';
  }
}

/** The editor's request for this one box. */
export function userPrompt(r: WriteRequest): string {
  const out: string[] = [];
  const where = r.field.group && r.field.group !== r.field.label ? `${r.field.group} › ${r.field.label}` : r.field.label;
  out.push(`BOX: ${where}`);
  if (r.context) out.push('', 'PAGE CONTEXT (other boxes near this one, for facts and tone):', r.context);
  const now = (['en', 'ar'] as Lang[]).filter((l) => r.text[l]);
  if (now.length) { out.push('', 'TEXT IN THE BOX NOW:'); now.forEach((l) => out.push(`[${LANG_NAME[l]}]`, r.text[l] as string)); }
  if (r.brief) out.push('', 'BRIEF FROM THE EDITOR:', r.brief);
  out.push('', 'TASK: ' + task(r));
  return out.join('\n');
}

function task(r: WriteRequest): string {
  const both = r.langs.length > 1 ? ' Write the English and the Arabic so they say the same thing.' : '';
  switch (r.action) {
    case 'write': return (r.brief ? 'Write new text for this box following the brief.' : 'Write text for this box that fits the page context.') +
      (Object.keys(r.text).length ? ' The text in the box now may be used as a starting point.' : '') + both;
    case 'improve': return 'Rewrite the text in the box so it reads more clearly and fits Dorma\'s voice. Keep its meaning, facts and roughly its length.' +
      (r.brief ? ' Follow the brief too.' : '') + both + missing(r);
    case 'shorten': return 'Make the text in the box about half as long. Keep the main point and every real fact; drop repetition and filler.' + both + missing(r);
    case 'translate': {
      const from = r.from || 'en', to = r.langs.filter((l) => l !== from);
      return `Translate the ${LANG_NAME[from]} text into ${to.map((l) => LANG_NAME[l]).join(' and ') || LANG_NAME[from]}, as a native copywriter would write it. ` +
        `Return the ${LANG_NAME[from]} text exactly as it is under "${from}".`;
    }
    case 'describe': return describeTask(r.field.key || '') + ' Describe only what is visible in the picture. Do not guess brands, places or people\'s names unless they are clearly written in it.' + both;
  }
}

/* improving one language and the other is empty: write the missing one from the one that exists */
const missing = (r: WriteRequest): string => (r.langs.length > 1 && r.langs.some((l) => !r.text[l]) ? ' Where one language is empty, write it from the other.' : '');

function describeTask(key: string): string {
  switch (key) {
    case 'title': return 'Write a short title for this picture (3 to 7 words).';
    case 'caption': return 'Write a one-sentence caption for this picture that a visitor would find useful.';
    case 'description': return 'Write a description of this picture for search engines: one or two plain sentences (under 160 characters) saying what it shows and how it relates to Dorma\'s work.';
    default: return 'Write alt text for this picture: one plain sentence under 125 characters saying what it shows, for people who cannot see it. Do not start with "Image of" or "Picture of".';
  }
}

/** Gemini's generateContent body for this request. */
export function geminiBody(r: WriteRequest, model: string): Record<string, unknown> {
  const parts: Record<string, unknown>[] = [{ text: userPrompt(r) }];
  if (r.image) parts.push({ inline_data: { mime_type: r.image.mime, data: r.image.data } });
  const properties: Record<string, unknown> = {};
  r.langs.forEach((l) => { properties[l] = { type: 'STRING' }; });
  const generationConfig: Record<string, unknown> = {
    temperature: r.action === 'translate' ? 0.3 : 0.7,
    maxOutputTokens: 4096,
    responseMimeType: 'application/json',
    responseSchema: { type: 'OBJECT', properties, required: r.langs },
  };
  // 2.5 models think by default; plain copywriting doesn't need it and it would eat the free allowance.
  if (/^gemini-2\.5-flash(?!-lite)/.test(model)) generationConfig.thinkingConfig = { thinkingBudget: 0 };
  return { systemInstruction: { parts: [{ text: systemPrompt(r) }] }, contents: [{ role: 'user', parts }], generationConfig };
}

/** Reads Gemini's answer. Returns the text per language, or an error code. */
export function readReply(r: WriteRequest, json: unknown): { text: Partial<Record<Lang, string>> } | { error: 'blocked' | 'empty' } {
  const j = json as { candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }>; promptFeedback?: { blockReason?: string } };
  if (j?.promptFeedback?.blockReason) return { error: 'blocked' };
  const c = j?.candidates?.[0];
  if (!c) return { error: 'empty' };
  if (c.finishReason === 'SAFETY' || c.finishReason === 'PROHIBITED_CONTENT') return { error: 'blocked' };
  const raw = (c.content?.parts || []).map((p) => p.text || '').join('').trim();
  if (!raw) return { error: 'empty' };
  let parsed: Record<string, unknown> | null = null;
  try { parsed = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch { /* not JSON */ }
  const text: Partial<Record<Lang, string>> = {};
  if (parsed && typeof parsed === 'object') r.langs.forEach((l) => { const v = parsed![l]; if (typeof v === 'string' && v.trim()) text[l] = tidy(v, r.field.kind); });
  else if (r.langs.length === 1) text[r.langs[0]] = tidy(raw, r.field.kind);
  if (r.action === 'translate' && r.from && r.text[r.from]) text[r.from] = r.text[r.from]; // the source is never changed
  return Object.keys(text).length ? { text } : { error: 'empty' };
}

export function tidy(s: string, kind: Kind): string {
  let t = s.replace(/\r\n?/g, '\n').trim();
  if (kind === 'text') t = t.replace(/\s*\n+\s*/g, ' ').replace(/^["“'«]+|["”'»]+$/g, '').trim();
  if (kind === 'strings') t = t.split('\n').map((x) => x.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim()).filter(Boolean).join('\n');
  return t;
}
