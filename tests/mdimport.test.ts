import { describe, expect, it } from 'vitest';
import posts from '../public/templates/blog-posts.md?raw';
import flows from '../public/templates/flows.md?raw';
import modals from '../public/templates/modals.md?raw';
import library from '../public/templates/library.md?raw';
import pages from '../public/templates/pages-and-sections.md?raw';
import colours from '../public/templates/colours.md?raw';
import icons from '../public/templates/icons.md?raw';
import slides from '../public/templates/carousel-slides.md?raw';
import { IMPORTERS, buildColours, buildFlows, buildIcons, buildLibrary, buildModals, buildPages, buildPosts, parseBlock, typeOf } from '../src/studio/mdimport';
import { normalize, SECTION_TYPES, STARTER } from '../src/studio/data';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const fresh = (): Any => normalize(STARTER);
const allWarnings = (r: Any) => [...r.warnings, ...r.records.flatMap((x: Any) => x.warnings || [])];
const KNOWN = { knownPaths: null };

describe('content import templates', () => {
  it('has a template file for every importer', () => {
    const files: Record<string, string> = { 'blog-posts.md': posts, 'flows.md': flows, 'modals.md': modals, 'library.md': library, 'pages-and-sections.md': pages, 'colours.md': colours, 'icons.md': icons, 'carousel-slides.md': slides };
    IMPORTERS.forEach((t) => expect(files[t.file], t.file).toBeTruthy());
  });

  it('imports blog posts with their body and Arabic-free fields', () => {
    const cfg = fresh(), before = cfg.posts.length;
    const r = buildPosts(cfg, posts, KNOWN);
    expect(allWarnings(r)).toEqual([]);
    expect(cfg.posts.length).toBe(before + 2);
    const p = cfg.posts.find((x: Any) => x.slug === 'booth-brief-questions');
    expect(p).toMatchObject({ title: 'Five questions to answer before you brief a booth', published: false, category: 'exhibitions', tags: ['Exhibitions', 'Booths', 'Planning'], date: '2026-11-25' });
    expect(p.body).toContain('## Who do you want to meet?');
    expect(p.body).toContain('- Product demonstrations');
    expect(p.body.split('\n\n').length).toBeGreaterThan(4);
    expect(p.cover).toMatch(/^m-/);
  });

  it('updates a post with the same address without touching other fields', () => {
    const cfg = fresh(); const old = cfg.posts[0];
    buildPosts(cfg, `---\nAddress: ${old.slug}\nTitle: New title\n`, { mode: 'update' });
    expect(cfg.posts.find((x: Any) => x.id === old.id)).toMatchObject({ title: 'New title', body: old.body, cover: old.cover });
  });

  it('imports flows with details and numbers', () => {
    const cfg = fresh(), before = cfg.flows.length;
    const r = buildFlows(cfg, flows, KNOWN);
    expect(allWarnings(r)).toEqual([]);
    expect(cfg.flows.length).toBe(before + 2);
    const f = cfg.flows[cfg.flows.length - 2];
    expect(f.items.map((i: Any) => i.label)).toEqual(['Understand', 'Shape', 'Deliver']);
    expect(f.items[0]).toMatchObject({ kind: 'text', showIndex: true, detail: 'Clarify your objectives, audience, requirements, and budget.' });
    expect(cfg.flows[cfg.flows.length - 1]).toMatchObject({ separator: 'dot', size: 's' });
    expect(cfg.flows[cfg.flows.length - 1].items[2].action).toEqual({ type: 'page', target: 'production' });
  });

  it('imports modals of every type, with inline flows', () => {
    const cfg = fresh(), before = cfg.modals.length, flowsBefore = cfg.flows.length;
    const r = buildModals(cfg, modals, { knownPaths: new Set(['exhibitions/booth-01.jpg']) });
    expect(cfg.modals.length).toBe(before + 3);
    const [a, b, c] = cfg.modals.slice(-3);
    expect(a).toMatchObject({ name: 'Booths', type: 1, kicker: 'Exhibitions & Booths', caption: ['Concept', 'Construction', 'Finish'], more: { label: 'See production services', action: { type: 'page', target: 'production' } } });
    expect(a.media.length).toBe(1);
    expect(b.type).toBe(2);
    expect(c.type).toBe(3); expect(c.flowId).toBeTruthy();
    expect(cfg.flows.length).toBe(flowsBefore + 1);
    // two gallery files are not on GitHub in this test
    expect(allWarnings(r).filter((w: string) => /isn't in the Library/.test(w)).length).toBe(2);
  });

  it('imports library items and skips files already there', () => {
    const cfg = fresh(), before = cfg.media.length;
    const r = buildLibrary(cfg, library, KNOWN);
    expect(allWarnings(r)).toEqual([]);
    expect(cfg.media.length).toBe(before + 4);
    expect(cfg.media.find((m: Any) => m.path === 'exhibitions/booth-01.jpg')).toMatchObject({ kind: 'image', category: 'exhibitions', tags: ['booth', 'exhibition', 'stand'] });
    expect(cfg.media.find((m: Any) => m.label === 'Booth planning checklist')).toMatchObject({ kind: 'article', link: 'https://example.com/booth-checklist.pdf' });
    expect(cfg.media.find((m: Any) => m.label === 'Blue nebula background')).toMatchObject({ kind: 'scene', scene: 'nebula' });
    const again = buildLibrary(cfg, library, KNOWN);
    expect(cfg.media.length).toBe(before + 4);
    expect(again.records.filter((x: Any) => /Skipped/.test(x.meta)).length).toBe(4);
  });

  it('imports a page with every section type', () => {
    const cfg = fresh(), before = cfg.pages.length;
    const r = buildPages(cfg, pages, KNOWN);
    expect(allWarnings(r)).toEqual([]);
    expect(cfg.pages.length).toBe(before + 1);
    const p = cfg.pages[cfg.pages.length - 1];
    expect(p).toMatchObject({ id: 'exhibitions', title: 'Exhibitions', layout: 'cinematic', nav: true });
    expect(new Set(p.sections.map((s: Any) => s.type))).toEqual(new Set(Object.keys(SECTION_TYPES)));
    const hc = p.sections.find((s: Any) => s.type === 'heroCarousel');
    expect(hc.slides.length).toBe(2);
    expect(hc.slides[0]).toMatchObject({ title: 'Put your brand where people experience it', hold: false });
    expect(hc.slides[0].flowId).toBeTruthy();
    const ch = p.sections.find((s: Any) => s.type === 'chapters');
    expect(ch.items[0]).toMatchObject({ bullets: ['Booth design and build', 'Graphics and displays'], caption: ['Concept', 'Build'], more: { label: 'See our booths' } });
    expect(p.sections.find((s: Any) => s.type === 'stats').items[0]).toMatchObject({ label: 'Years since 2000', value: 26, meter: 65 });
    expect(p.sections.find((s: Any) => s.type === 'grid').items[0].action).toEqual({ type: 'modal', target: 'md-gifts' });
    expect(p.sections.find((s: Any) => s.type === 'timeline').flowId).toBe('f-process');
    expect(p.sections.find((s: Any) => s.type === 'article').body).toContain('## Before you start');
    expect(p.sections.find((s: Any) => s.type === 'blog')).toMatchObject({ category: 'exhibitions', limit: 6, filters: false, style: 'grid' });
  });

  it('adds loose sections to the chosen page, hidden when asked', () => {
    const cfg = fresh(); const home = cfg.pages[0], n = home.sections.length;
    buildPages(cfg, '---\nSection: Call to action\nHidden: yes\nHeading: Hi\nButton: [Go](page:agency)\n', { targetPage: home.id });
    expect(home.sections.length).toBe(n + 1);
    expect(home.sections[n]).toMatchObject({ type: 'cta', hidden: true, title: 'Hi', button: { label: 'Go', action: { type: 'page', target: 'agency' } } });
  });

  it('imports colours and palettes', () => {
    const cfg = fresh();
    const r = buildColours(cfg, colours, KNOWN);
    expect(allWarnings(r)).toEqual([]);
    expect(cfg.theme.swatches).toContainEqual({ name: 'Dorma blue', hex: '#0072bc' });
    expect(cfg.theme.myPalettes.find((p: Any) => p.name === 'Dorma night')).toMatchObject({ accent: '#ffcb08', ink: '#040915', panel: '#0b1630', fg: '#eef2fa' });
  });

  it('imports icons from fenced SVG code', () => {
    const cfg = fresh(), before = cfg.icons.length;
    const r = buildIcons(cfg, icons, KNOWN);
    expect(allWarnings(r)).toEqual([]);
    expect(cfg.icons.length).toBe(before + 2);
    expect(cfg.icons[cfg.icons.length - 1].svg).toMatch(/^<svg viewBox/);
  });

  it('reads Arabic text and section types by label', () => {
    expect(typeOf('Call to action')).toBe('cta');
    expect(typeOf('hero carousel')).toBe('heroCarousel');
    const cfg = fresh();
    buildPosts(cfg, '---\nTitle: Hello\nTitle (Arabic): مرحبا\n');
    expect(cfg.posts[cfg.posts.length - 1].title).toEqual({ en: 'Hello', ar: 'مرحبا' });
    const { entries } = parseBlock('Name: x\nItems:\n- a\n  Detail: d\n- b\n');
    expect(entries[1].items).toEqual([{ text: 'a', sub: ['Detail: d'] }, { text: 'b', sub: [] }]);
  });
});
