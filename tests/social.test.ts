import { describe, expect, it } from 'vitest';
import { normalize } from '../src/studio/data';
import { normalizeSocial, socialSources, buildCaption, buildSlides, hashtagsFor, suggestSource, newEntry, calendarDays, nextRhythmDate, shorten, stripMd, postLink, SOCIAL_DEFAULTS } from '../src/studio/social';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const cfg: Any = normalize(null);
const S: Any = normalizeSocial(null);
const src = (key: string) => socialSources(cfg).find((s: Any) => s.key === key);

describe('social sources', () => {
  it('lists pages, sections, posts and flows from the site', () => {
    const all = socialSources(cfg);
    const types = new Set(all.map((s: Any) => s.type));
    expect(types.has('page') && types.has('section') && types.has('post') && types.has('flow')).toBe(true);
    expect(new Set(all.map((s: Any) => s.key)).size).toBe(all.length);
  });
  it('uses the page text in both languages and sets the topic', () => {
    const p = src('page:creative-design');
    expect(p.title.en).toBe('Creative & Design');
    expect(p.title.ar).toBeTruthy();
    expect(p.summary.en).toMatch(/Naming/);
    expect(p.topic).toBe('service');
    expect(p.points.length).toBeGreaterThan(2);
    expect(src('page:business-giveaways').topic).toBe('gift');
    expect(src('page:printing-finishing')?.topic ?? 'print').toBe('print');
  });
  it('flags placeholder text and unpublished posts', () => {
    const post = socialSources(cfg).find((s: Any) => s.type === 'post');
    expect(post.placeholder).toBe(true);
    expect(post.draft).toBe(true);
  });
  it('turns a flow into carousel steps', () => {
    const f = src('flow:f-process');
    expect(f.slides.map((x: Any) => x.title.en)).toEqual(['Briefing', 'Plan', 'Resource Allocation', 'Process']);
  });
});

describe('captions', () => {
  it('fills the template with the site text, link and hashtags', () => {
    const c = buildCaption(cfg, S, src('page:creative-design'), 'linkedin', 'en');
    expect(c.text).toMatch(/^Creative & Design/);
    expect(c.text).toContain('https://omarhamad1974.github.io/Dorma/#creative-design');
    expect(c.text).toContain('#DormaAdvertising');
    expect(c.text).toContain('• Naming');
    expect(c.over).toBe(false);
    expect(c.missing).toEqual([]);
  });
  it('writes the Arabic version from the Arabic text only', () => {
    const c = buildCaption(cfg, S, src('page:creative-design'), 'facebook', 'ar');
    expect(c.text).toContain('#دورما_للإعلان');
    expect(c.text).not.toMatch(/Creative/);
  });
  it('leaves the link out on Instagram and keeps to the hashtag count', () => {
    const c = buildCaption(cfg, { ...S, platforms: { ...S.platforms, instagram: { ...S.platforms.instagram, tags: 2 } } }, src('page:creative-design'), 'instagram', 'en');
    expect(c.text).not.toContain('https://');
    expect((c.text.match(/#\S+/g) || []).length).toBe(2);
  });
  it('fits the platform length', () => {
    const s2: Any = normalizeSocial({ platforms: { linkedin: { max: 120 } } });
    const c = buildCaption(cfg, s2, src('page:creative-design'), 'linkedin', 'en');
    expect(c.length).toBeLessThanOrEqual(120);
  });
  it('adds tracking when asked', () => {
    expect(postLink({ siteUrl: 'https://x.test/', utm: true }, 'about', 'facebook')).toBe('https://x.test/?utm_source=facebook&utm_medium=social#about');
  });
  it('dedupes hashtags and adds the #', () => {
    const s2: Any = { hashtags: [{ id: 'a', topic: 'all', tags: { en: 'one #two', ar: '' } }, { id: 'b', topic: 'gift', tags: { en: '#Two three', ar: '' } }] };
    expect(hashtagsFor(s2, { topic: 'gift', lang: 'en' })).toEqual(['#one', '#two', '#three']);
  });
  it('shortens at a sentence or word', () => {
    expect(shorten('One two. Three four five.', 12)).toBe('One two.');
    expect(shorten('abcdef ghijkl mnop', 10).endsWith('…')).toBe(true);
    expect(stripMd('## Head\n**bold** [link](https://a) [[m-1|]]')).toBe('Head\nbold link');
  });
});

describe('carousel slides', () => {
  it('has a cover, one slide per step and an end slide', () => {
    const sl = buildSlides(S, src('flow:f-process'), 'en');
    expect(sl.length).toBe(6);
    expect(sl[1].title).toBe('Briefing');
    expect(sl[sl.length - 1].title).toMatch(/quote/i);
  });
  it('never passes the slide limit', () => {
    const s2: Any = normalizeSocial({ carousel: { max: 4 } });
    expect(buildSlides(s2, src('flow:f-process'), 'en').length).toBe(4);
  });
});

describe('calendar', () => {
  it('shows rhythm days and suggests unused sources first', () => {
    const days = calendarDays(S, new Date(2026, 10, 27));
    expect(days[0].iso).toBe('2026-11-23');
    expect(days.length).toBe(S.weeks * 3);
    expect(nextRhythmDate(S, 'gift', new Date(2026, 10, 28))).toBe('2026-12-04');
    const sources = socialSources(cfg);
    const first = suggestSource(sources, [], ['service']);
    expect(first.topic).toBe('service');
    const used = [newEntry({ date: '2026-11-30', platform: 'linkedin', source: first.key })];
    expect(suggestSource(sources, used, ['service']).key).not.toBe(first.key);
  });
  it('keeps old saves working', () => {
    const s2: Any = normalizeSocial({ posts: [{ id: 'x', status: 'weird' }], weeks: 99 });
    expect(s2.posts[0].status).toBe('planned');
    expect(s2.weeks).toBe(12);
    expect(s2.platforms.linkedin.max).toBe(SOCIAL_DEFAULTS.platforms.linkedin.max);
  });
});
