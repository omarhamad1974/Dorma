import { describe, expect, test } from 'vitest';
import { normalize } from '../src/studio/data';
import { runHealth, urlOk, webLinks } from '../src/studio/health';

const base = () => {
  const c = normalize(null);
  c.site.quoteEmail = 'hello@example.com';
  return c;
};
const find = (r: ReturnType<typeof runHealth>, check: string) => r.issues.filter((i) => i.check === check);

describe('health check', () => {
  test('the starter site has nothing broken', () => {
    const r = runHealth(base());
    expect(r.counts.error).toBe(0);
    expect(find(r, 'links')).toEqual([]);
  });

  test('a button to a removed page is broken and jumps to its section', () => {
    const c = base(); const p = c.pages.find((x: any) => x.id === 'home');
    const s = p.sections.find((x: any) => x.type !== 'heroCarousel');
    s.button = { label: 'Go', action: { type: 'page', target: 'gone' } };
    const r = runHealth(c); const l = find(r, 'links');
    expect(l).toHaveLength(1);
    expect(l[0].level).toBe('error');
    expect(l[0].go).toEqual({ panel: 'pages', sel: 'home', section: s.id });
    expect(l[0].where).toMatch(/^Page: Home/);
  });

  test('buttons with no label and hidden sections are not checked', () => {
    const c = base(); const p = c.pages[0];
    const s = p.sections.find((x: any) => x.type !== 'heroCarousel');
    s.button = { label: '', action: { type: 'page', target: 'gone' } };
    expect(find(runHealth(c), 'links')).toEqual([]);
    s.button.label = 'Go'; s.hidden = true;
    expect(find(runHealth(c), 'links')).toEqual([]);
  });

  test('bad web addresses, missing flows and unknown section labels', () => {
    const c = base(); const s = c.pages[0].sections.find((x: any) => x.type !== 'heroCarousel');
    s.button = { label: 'Site', action: { type: 'url', target: 'www example' } };
    s.flowId = 'f-nope';
    const r = runHealth(c);
    expect(find(r, 'links').map((i) => i.title)).toEqual(expect.arrayContaining(['Uses a flow that no longer exists', "This web address doesn't look right"]));
    s.button.action = { type: 'page', target: 'home', section: 'no-such-label' };
    s.flowId = '';
    expect(find(runHealth(c), 'links')[0].level).toBe('warn');
  });

  test('urlOk', () => {
    ['https://dorma.example/x', 'mailto:a@b.co', 'tel:+971 4 123 4567', '#agency', '/library/x.jpg'].forEach((u) => expect(urlOk(u)).toBe(true));
    ['', 'www example', 'javascript:alert(1)', 'http://'].forEach((u) => expect(urlOk(u)).toBe(false));
  });

  test('missing Arabic is grouped per section, and only when Arabic is on', () => {
    const c = base(); const s = c.pages[0].sections.find((x: any) => x.type !== 'heroCarousel');
    s.eyebrow = 'English only'; s.title = { en: 'Title', ar: '' };
    let a = find(runHealth(c), 'arabic');
    expect(a).toHaveLength(1);
    expect(a[0].count).toBe(2);
    expect(a[0].go.section).toBe(s.id);
    s.eyebrow = 'بالعربية';
    a = find(runHealth(c), 'arabic');
    expect(a[0].count).toBe(1);
    c.site.languages = 'en';
    expect(find(runHealth(c), 'arabic')).toEqual([]);
  });

  test('alt text, unused items and large files', () => {
    const c = base();
    c.media.push({ id: 'm-a', kind: 'image', label: 'Booth', path: 'x/a.jpg', bytes: 3 * 1048576 }, { id: 'm-b', kind: 'image', label: 'Spare', path: 'x/b.jpg', alt: 'x' });
    c.pages[0].sections.find((x: any) => 'media' in x).media = 'm-a';
    const r = runHealth(c);
    expect(find(r, 'alt').map((i) => i.media)).toEqual(['m-a']);
    expect(find(r, 'files').map((i) => i.media)).toEqual(['m-a']);
    expect(find(r, 'unused').map((i) => i.media)).toContain('m-b');
    expect(find(r, 'alt')[0].go).toEqual({ panel: 'media', sel: 'm-a' });
  });

  test('pages nobody can reach, and ignored issues', () => {
    const c = base();
    c.pages.push({ id: 'lonely', title: 'Lonely', nav: false, sections: [] });
    let r = runHealth(c);
    const ids = find(r, 'pages').map((i) => i.id);
    expect(ids).toEqual(expect.arrayContaining(['orphan:lonely', 'page-empty:lonely']));
    c.health.ignore = ['orphan:lonely'];
    r = runHealth(c);
    expect(find(r, 'pages').map((i) => i.id)).not.toContain('orphan:lonely');
    expect(r.ignored.map((i) => i.id)).toContain('orphan:lonely');
  });

  test('quote email setting', () => {
    const c = base(); c.site.quoteEmail = '';
    const has = c.pages.some((p: any) => p.sections.some((s: any) => s.type === 'quote')) || c.modals.some((m: any) => (m.sections || []).some((s: any) => s.type === 'quote'));
    expect(find(runHealth(c), 'settings').length).toBe(has ? 1 : 0);
  });

  test('web links are collected once with a count', () => {
    const c = base(); const s = c.pages[0].sections.find((x: any) => x.type !== 'heroCarousel');
    s.button = { label: 'Site', action: { type: 'url', target: 'https://example.com/a' } };
    s.lede = 'See [this](https://example.com/a) and [that](https://example.org/b)';
    const w = webLinks(c);
    expect(w.find((x) => x.url === 'https://example.com/a')?.count).toBe(2);
    expect(w.map((x) => x.url)).toContain('https://example.org/b');
  });
});
