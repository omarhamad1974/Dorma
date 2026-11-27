import { describe, expect, it } from 'vitest';
import { seoSlug, renamedAssetPath, freePath, parseMediaLink, findDuplicates, sortMedia, planFill, mediaJsonLd, fileNameOf, embedUrl } from '../src/studio/libtools';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

describe('SEO file names', () => {
  it('makes readable latin names', () => {
    expect(seoSlug('Dorma Booth, Riyadh & Jeddah 2026')).toBe('dorma-booth-riyadh-and-jeddah-2026');
    expect(seoSlug({ en: 'Café Signage', ar: 'لافتة' })).toBe('cafe-signage');
    expect(seoSlug('لافتة')).toBe('');
  });
  it('renames inside the same month folder and keeps the extension', () => {
    expect(renamedAssetPath('2026-11/3f2a.webp', 'Exhibition booth')).toBe('2026-11/exhibition-booth.webp');
    expect(renamedAssetPath('2026-11/3f2a.webp', 'booth.jpg')).toBe('2026-11/booth.webp');
  });
  it('finds a free name', () => {
    const used = new Set(['a/b.jpg', 'a/b-2.jpg']);
    expect(freePath('a/b.jpg', (p: string) => used.has(p))).toBe('a/b-3.jpg');
  });
  it('reads the file name from any source', () => {
    expect(fileNameOf({ path: 'print/box%20one.png' })).toBe('box one.png');
    expect(fileNameOf({ assetId: '2026-11/x.webp' })).toBe('x.webp');
    expect(fileNameOf({ ext: 'https://cdn.test/a/pic.jpg?w=2' })).toBe('pic.jpg');
  });
});

describe('adding by link', () => {
  it('reads YouTube, Vimeo and direct files', () => {
    expect(parseMediaLink('https://youtu.be/dQw4w9WgXcQ')).toMatchObject({ kind: 'video', provider: 'youtube', id: 'dQw4w9WgXcQ' });
    expect(parseMediaLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3')).toMatchObject({ provider: 'youtube', id: 'dQw4w9WgXcQ' });
    expect(parseMediaLink('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toMatchObject({ provider: 'youtube' });
    expect(parseMediaLink('https://vimeo.com/76979871')).toMatchObject({ provider: 'vimeo', id: '76979871' });
    expect(parseMediaLink('https://cdn.test/a/clip.MP4')).toMatchObject({ kind: 'video', provider: 'file' });
    expect(parseMediaLink('https://cdn.test/a/pic.webp')).toMatchObject({ kind: 'image', provider: 'file' });
  });
  it('refuses unsafe links', () => {
    expect(parseMediaLink('http://cdn.test/a.jpg').error).toBeTruthy();
    expect(parseMediaLink('javascript:alert(1)').error).toBeTruthy();
    expect(parseMediaLink('not a link').error).toBeTruthy();
  });
  it('embeds muted and looping', () => {
    expect(embedUrl({ embed: { provider: 'youtube', id: 'dQw4w9WgXcQ' } })).toContain('mute=1');
    expect(embedUrl({ embed: { provider: 'youtube', id: '"><x' } })).toBe('');
  });
});

describe('duplicates and sorting', () => {
  const media: Any[] = [
    { id: 'a', kind: 'image', label: 'Booth', path: 'content/booth.jpg' },
    { id: 'b', kind: 'image', label: 'Booth (1)', assetId: '2026-11/booth-1.webp', bytes: 5000 },
    { id: 'c', kind: 'image', label: 'Other', assetId: '2026-11/other.webp', bytes: 5000 },
    { id: 'd', kind: 'image', label: 'Booth copy', path: 'print/booth copy.jpg' },
    { id: 'e', kind: 'image', label: 'Small', assetId: '2026-11/small.webp', bytes: 10 },
    { id: 's', kind: 'scene', label: 'Placeholder', bytes: 5000 },
  ];
  const index: Any = { files: [{ path: 'content/booth.jpg', size: 9000 }, { path: 'print/booth copy.jpg', size: 9000 }] };
  it('groups same size and same name', () => {
    const d = findDuplicates(media, { index });
    expect(d.get('b')!.ids.sort()).toEqual(['b', 'c']);
    expect(d.get('a')!.reason).toContain('same size');
    expect(d.get('a')!.ids).toContain('d');
    expect(d.has('e')).toBe(false);
    expect(d.has('s')).toBe(false); // placeholders never count
  });
  it('does not call numbered series duplicates', () => {
    const d = findDuplicates([{ id: 'x', kind: 'image', label: 'Booth 01', bytes: 1 }, { id: 'y', kind: 'image', label: 'Booth 02', bytes: 2 }]);
    expect(d.size).toBe(0);
  });
  it('sorts by size', () => {
    expect(sortMedia(media, 'size', { index }).map((m: Any) => m.id).slice(0, 2)).toEqual(['a', 'd']);
    expect(sortMedia(media, 'small', { index })[0].id).toBe('e');
  });
});

describe('fill missing from category', () => {
  const cfg: Any = { media: [
    { id: 'p1', kind: 'image', category: 'print' }, { id: 'p2', kind: 'image', category: 'print' }, { id: 'p3', kind: 'image', category: 'print' },
    { id: 'v1', kind: 'video', category: 'print' }, { id: 'e1', kind: 'image', category: 'events' }, { id: 'ph', kind: 'scene', category: 'backgrounds', animate: true },
  ] };
  const slot = (obj: Any, where: string[]) => ({ obj, key: 'media', where });
  it('takes the next unused picture of the slot category, never twice', () => {
    const used = slot({ media: 'p1' }, ['Page: Print', 'Section A', 'Image']);
    const a = slot({ media: '' }, ['Page: Print', 'Section A', 'Card 2']);
    const b = slot({ media: 'gone' }, ['Page: Print', 'Section B', 'Image']);
    const c = slot({ media: 'ph' }, ['Page: Print', 'Section A', 'Card 3']);
    const usage = new Map([['p1', ['x']]]);
    const { plan, skipped } = planFill(cfg, { missing: [a, b, c], all: [used, a, b, c] }, usage);
    expect(plan.map((p: Any) => p.id)).toEqual(['p2', 'p3', 'v1']); // the moving placeholder gets the video
    expect(plan.every((p: Any) => p.cat === 'print')).toBe(true);
    expect(skipped).toHaveLength(0);
  });
  it('leaves a slot when the category runs out or is unknown', () => {
    const lone = slot({ media: '' }, ['Page: New', 'Hero', 'Image']);
    expect(planFill(cfg, { missing: [lone], all: [lone] }, new Map()).skipped).toHaveLength(1);
    expect(planFill(cfg, { missing: [lone], all: [lone] }, new Map(), { anyCategory: true }).plan).toHaveLength(1);
  });
});

describe('structured data', () => {
  it('describes shown pictures for search engines', () => {
    const cfg: Any = { media: [
      { id: 'a', kind: 'image', label: 'Booth', alt: 'A blue booth', caption: 'Riyadh 2026', w: 1600, h: 900, tags: ['booth', 'expo'] },
      { id: 'y', kind: 'video', label: 'Reel', embed: { provider: 'youtube', id: 'dQw4w9WgXcQ' } },
      { id: 'h', kind: 'image', label: 'Hidden', hidden: true },
    ] };
    const ld = mediaJsonLd(cfg, ['a', 'y', 'h', 'a'], (m: Any) => 'https://x.test/' + m.id + '.jpg');
    expect(ld).toHaveLength(2);
    expect(ld[0]).toMatchObject({ '@type': 'ImageObject', name: 'Booth', caption: 'Riyadh 2026', description: 'A blue booth', width: 1600, keywords: 'booth, expo' });
    expect(ld[1]).toMatchObject({ '@type': 'VideoObject', contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
    expect(ld[1].thumbnailUrl).toContain('ytimg');
  });
});
