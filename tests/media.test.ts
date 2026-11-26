import { describe, expect, it } from 'vitest';
import { normalize, mediaSlots, mediaUsage, defaultCategory, STARTER } from '../src/studio/data';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

describe('library categories', () => {
  it('gives every saved item a category without losing anything', () => {
    const out: Any = normalize({
      media: [
        { id: 'a', kind: 'image', path: 'exhibitions/booth.jpg', category: '' },
        { id: 'b', kind: 'image', url: 'https://x.test/b.jpg' },
        { id: 'c', kind: 'video', path: 'clip.mp4' },
        { id: 'd', kind: 'article', label: 'Guide' },
        { id: 'e', kind: 'scene', scene: 'city' },
        { id: 'f', kind: 'image', path: 'misc/f.jpg', category: 'my-own' },
      ],
    });
    const cat = (id: string) => out.media.find((m: Any) => m.id === id).category;
    expect(cat('a')).toBe('exhibitions');
    expect(cat('b')).toBe('content');
    expect(cat('c')).toBe('content');
    expect(cat('d')).toBe('articles');
    expect(cat('e')).toBe('backgrounds');
    expect(cat('f')).toBe('my-own');
    expect(out.media).toHaveLength(6);
    // a category an item names is added back to the list, so it can be renamed in the studio
    expect(out.categories.some((c: Any) => c.id === 'my-own')).toBe(true);
    expect(out.media.every((m: Any) => out.categories.some((c: Any) => c.id === m.category))).toBe(true);
  });

  it('restores a removed starter category with its own label', () => {
    const out: Any = normalize({ categories: [], media: [{ id: 'x', kind: 'article' }] });
    expect(out.categories).toEqual([STARTER.categories.find((c: Any) => c.id === 'articles')]);
  });

  it('uses the GitHub folder first', () => {
    expect(defaultCategory({ kind: 'image', path: 'print/a.png' })).toBe('print');
    expect(defaultCategory({ kind: 'scene' })).toBe('backgrounds');
  });
});

describe('mediaSlots (Missing images)', () => {
  const cfg = (): Any => normalize({
    media: [{ id: 'real', kind: 'image', path: 'print/a.jpg', category: 'print' }, { id: 'ph', kind: 'scene', scene: 'city', category: 'backgrounds' }],
    pages: [{ id: 'home', title: 'Home', sections: [
      { id: 's1', type: 'banner', media: '' },
      { id: 's2', type: 'banner', media: 'ph' },
      { id: 's3', type: 'banner', media: 'gone' },
      { id: 's4', type: 'banner', media: 'real' },
      { id: 's5', type: 'heroCarousel', defaultMedia: '', slides: [{ title: 'One', media: 'ph' }, { title: 'Two', media: 'real' }] },
    ] }],
    contentVersion: 3,
  });

  it('finds empty, placeholder and removed pictures with where they are', () => {
    const slots = mediaSlots(cfg()).filter((x: Any) => x.where[0] === 'Page: Home');
    expect(slots.map((x: Any) => x.state)).toEqual(['empty', 'placeholder', 'missing', 'placeholder']);
    expect(slots[0].go).toEqual({ panel: 'pages', sel: 'home', section: 's1' });
    expect(slots[3].go).toEqual({ panel: 'carousels', sel: 's5' });
    expect(slots[3].where).toContain('One');
  });

  it('writes the chosen picture back into the site config', () => {
    const c = cfg(); const slot = mediaSlots(c).find((x: Any) => x.state === 'empty');
    slot.obj[slot.key] = 'real';
    expect(c.pages[0].sections[0].media).toBe('real');
  });
});

describe('mediaUsage (unused filter in the image pickers)', () => {
  const cfg = (): Any => {
    const c: Any = normalize(JSON.parse(JSON.stringify(STARTER)));
    c.media.push(
      { id: 'u-free', kind: 'image', path: 'misc/free.jpg', category: 'misc' },
      { id: 'u-menu', kind: 'image', path: 'misc/menu.jpg', category: 'misc' },
      { id: 'u-text', kind: 'image', path: 'misc/text.jpg', category: 'misc' },
      { id: 'u-sec', kind: 'image', path: 'misc/sec.jpg', category: 'misc' },
    );
    return c;
  };
  it('finds images in sections, in fields outside the named slots, and in [[id]] text', () => {
    const c = cfg();
    const sec = c.pages[0].sections.find((s: Any) => 'media' in s && s.type !== 'heroCarousel');
    sec.media = 'u-sec';
    c.theme.menu = { ...(c.theme.menu || {}), logo: 'u-menu' };
    c.posts[0].body = 'Intro\n[[u-text|A caption]]\nMore';
    const u = mediaUsage(c);
    expect(u.get('u-sec')[0]).toMatch(/^Page: /);
    expect(u.get('u-sec').length).toBe(1);
    expect(u.get('u-menu')).toEqual(['Colours and type › Menu › Logo']);
    expect(u.get('u-text')[0]).toMatch(/^Blog: .*\(in the text\)$/);
    expect(u.has('u-free')).toBe(false);
  });
  it('ignores strings that are not library ids', () => {
    const c = cfg();
    c.site.brand = 'u-nothing';
    expect(mediaUsage(c).has('u-nothing')).toBe(false);
  });
});
