import { describe, expect, it } from 'vitest';
import template from '../public/templates/carousel-slides.md?raw';
import { applySlidesImport, parseFlowLine, parseSlidesMd, resolveImage } from '../src/studio/mdslides';
import { normalize, STARTER } from '../src/studio/data';


describe('carousel Markdown import', () => {
  it('reads the downloadable template', () => {
    const { slides, warnings } = parseSlidesMd(template);
    expect(warnings).toEqual([]);
    expect(slides.length).toBe(3);
    expect(slides[0]).toMatchObject({ eyebrow: 'Exhibitions', title: 'Put your brand where people experience it', seconds: '9' });
    expect(slides[0].flow.map((f: { label: unknown }) => f.label)).toEqual(['See our booths', 'Talk to us', 'Concept to build']);
    expect(slides[1].image).toBe('');
    slides.forEach((s: { warnings: string[] }) => expect(s.warnings).toEqual([]));
  });

  it('understands every flow item form', () => {
    expect(parseFlowLine('- [Open](modal:md-x)')).toMatchObject({ kind: 'button', action: { type: 'modal', target: 'md-x' } });
    expect(parseFlowLine('- [Go](page:agency)')).toMatchObject({ action: { type: 'page', target: 'agency' } });
    expect(parseFlowLine('- [Web](https://dorma.example)')).toMatchObject({ action: { type: 'url', target: 'https://dorma.example' } });
    expect(parseFlowLine('- [Two](slide:2)')).toMatchObject({ action: { type: 'slide', target: '2' } });
    expect(parseFlowLine('- Just text')).toMatchObject({ kind: 'text', label: 'Just text', action: { type: 'none' } });
    expect(parseFlowLine('- [Concepts | مفاهيم](modal:md-c)')).toMatchObject({ label: { en: 'Concepts', ar: 'مفاهيم' } });
  });

  it('keeps Arabic text and wrapped lines', () => {
    const { slides } = parseSlidesMd('notes\n---\nTitle: Hello\nTitle (Arabic): مرحبا\nSubtitle: first part\nsecond part\n');
    expect(slides[0]).toMatchObject({ title: 'Hello', title_ar: 'مرحبا', subtitle: 'first part second part' });
  });

  it('finds library images and falls back to the default image', () => {
    const cfg = normalize(STARTER);
    expect(resolveImage(cfg, 'm-city')).toMatchObject({ id: 'm-city' });
    expect(resolveImage(cfg, 'Placeholder · City')).toMatchObject({ id: 'm-city' });
    expect(resolveImage(cfg, '')).toEqual({});
    expect(resolveImage(cfg, 'no such thing')).toEqual({ missing: true });
    expect(resolveImage(cfg, 'work/a.jpg', { knownPaths: new Set(['work/b.jpg']) })).toEqual({ missing: true });
    expect(resolveImage(cfg, 'work/a.jpg')).toMatchObject({ add: { kind: 'image', path: 'work/a.jpg' } });
  });

  it('adds slides and their flows to a carousel', () => {
    const cfg = normalize(STARTER);
    const sec = { type: 'heroCarousel', slides: [{ title: 'Old' }] } as { type: string; slides: Record<string, unknown>[] };
    const flowsBefore = cfg.flows.length;
    const { slides } = parseSlidesMd(template);
    const r = applySlidesImport(cfg, sec, slides, { mode: 'append', knownPaths: new Set() });
    expect(r).toMatchObject({ slides: 3, flows: 3, missingImages: 1 });
    expect(sec.slides.length).toBe(4);
    expect(cfg.flows.length).toBe(flowsBefore + 3);
    const s1 = sec.slides[1] as { flowId: string; media: string; timing: { duration: number } };
    expect(cfg.flows.find((f: { id: string }) => f.id === s1.flowId)).toBeTruthy();
    expect(s1.media).toBe('');
    expect(s1.timing.duration).toBe(9);
    expect((sec.slides[3] as { media: string }).media).toBe('m-city');
    applySlidesImport(cfg, sec, slides, { mode: 'replace' });
    expect(sec.slides.length).toBe(3);
  });

  it('explains an empty or wrong file', () => {
    expect(parseSlidesMd('just text').warnings[0]).toMatch(/No slides/);
  });
});
