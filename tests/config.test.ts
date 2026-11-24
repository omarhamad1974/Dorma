import { describe, expect, it } from 'vitest';
import { normalize, SECTION_TYPES, STARTER } from '../src/studio/data';

type Obj = Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const S = STARTER as any;

/** Calls fn for every object nested anywhere in value. */
function walk(value: unknown, fn: (o: Obj) => void): void {
  if (Array.isArray(value)) value.forEach((v) => walk(v, fn));
  else if (value && typeof value === 'object') { fn(value as Obj); Object.values(value).forEach((v) => walk(v, fn)); }
}

describe('normalize', () => {
  it('returns the starter template when nothing is saved', () => {
    expect(normalize(null)).toEqual(STARTER);
    expect(normalize('nonsense')).toEqual(STARTER);
  });

  it('keeps saved values and fills in missing groups', () => {
    const out = normalize({ theme: { accent: '#7fd4ff' }, pages: [] });
    expect(out.theme.accent).toBe('#7fd4ff');
    expect(out.theme.ink).toBe(S.theme.ink);
    expect(out.pages).toEqual([]);
    expect(out.flows).toEqual(S.flows);
  });

  it('ignores a list saved in the wrong shape', () => {
    expect(normalize({ flows: { broken: true } }).flows).toEqual(S.flows);
  });

  it('never shares objects with the config it was given', () => {
    const live = normalize(null);
    const draft = normalize(live);
    draft.media.push({ id: 'x' });
    draft.theme.accent = '#123456';
    expect(live.media.length).toBe(S.media.length);
    expect(live.theme.accent).toBe(S.theme.accent);
  });

  it('never shares objects with the starter template', () => {
    const out = normalize(null);
    out.theme.accent = '#000000';
    expect(S.theme.accent).not.toBe('#000000');
  });
});

describe('starter template', () => {
  const ids = (list: Array<{ id: string }>) => new Set(list.map((x) => x.id));
  const pages = ids(S.pages), modals = ids(S.modals), flows = ids(S.flows), media = ids(S.media), icons = ids(S.icons);

  it('has unique ids in every library', () => {
    for (const key of ['pages', 'modals', 'flows', 'media', 'icons', 'posts', 'categories']) {
      expect(ids(S[key]).size, key).toBe(S[key].length);
    }
  });

  it('opens the home page that exists', () => {
    expect(pages.has(S.site.homePage)).toBe(true);
  });

  it('points every button and flow item at something that exists', () => {
    walk(S, (o) => {
      if (typeof o.type === 'string' && 'target' in o) {
        if (o.type === 'modal') expect(modals.has(o.target as string), `modal ${o.target}`).toBe(true);
        if (o.type === 'page') expect(pages.has(o.target as string), `page ${o.target}`).toBe(true);
        if (o.type === 'url') expect(String(o.target)).toMatch(/^https:\/\//);
        if (o.type === 'post') expect(S.posts.some((p: { id: string }) => p.id === o.target), `post ${o.target}`).toBe(true);
        if (o.type === 'doc') expect(media.has(o.target as string), `article ${o.target}`).toBe(true);
      }
      if (typeof o.flowId === 'string' && o.flowId) expect(flows.has(o.flowId), `flow ${o.flowId}`).toBe(true);
      if (typeof o.icon === 'string' && o.icon) expect(icons.has(o.icon), `icon ${o.icon}`).toBe(true);
    });
  });

  it('only uses images from the library', () => {
    walk({ ...S, media: [] }, (o) => {
      const m = o.media;
      for (const id of Array.isArray(m) ? m : typeof m === 'string' && m ? [m] : []) {
        expect(media.has(id), `media ${id}`).toBe(true);
      }
    });
  });

  it('gives every post a unique address, a known category and a library cover', () => {
    const cats = new Set(S.categories.map((c: { id: string }) => c.id));
    const slugs = S.posts.map((p: { slug: string }) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const p of S.posts) {
      expect(p.slug).toMatch(/^[a-z0-9][a-z0-9-]+$/);
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (p.category) expect(cats.has(p.category), `category ${p.category}`).toBe(true);
      if (p.cover) expect(media.has(p.cover), `cover ${p.cover}`).toBe(true);
      for (const m of String(p.body).matchAll(/\[\[([\w-]+)/g)) expect(media.has(m[1]), `embed ${m[1]}`).toBe(true);
    }
  });

  it('has a blog page and category ids that work as folder names', () => {
    expect(S.pages.some((p: { sections: Array<{ type: string }> }) => p.sections.some((s) => s.type === 'blog'))).toBe(true);
    for (const c of S.categories) expect(c.id).toMatch(/^[a-z0-9][a-z0-9-]*$/);
  });

  it('only uses known section types', () => {
    for (const p of S.pages) for (const s of p.sections) expect(SECTION_TYPES, s.type).toHaveProperty(s.type);
  });
});

describe('loader settings', () => {
  it('start with the white Dorma logo on the dark background', () => {
    const L = normalize(null).loader;
    expect(L).toMatchObject({ enabled: true, mark: 'image', bg: 'theme', style: 'reveal' });
    expect(normalize(null).site).toMatchObject({ logoMode: 'image', logo: '' });
    expect(normalize({ site: { brand: 'X' } }).site.logoMode).toBe('image');
    expect(normalize({ loader: { style: 'pulse' } }).loader.mark).toBe('image');
  });
});
