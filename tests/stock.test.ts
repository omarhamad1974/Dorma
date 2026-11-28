import { describe, it, expect } from 'vitest';
import { searchRequest, readResults, interleave, copyAllowed, trackAllowed, cleanQuery, readTerms, termsPrompt, creditLine } from '../supabase/functions/stock-search/providers';
import { stockKey, freshPhotos, rejectPhoto, stockMedia, stockLabel, sniffType, stockFileName, stockStatus, inLibrary, MAX_REJECTED } from '../src/studio/stocktext';
import { mediaJsonLd } from '../src/studio/libtools';

const q = { query: 'offset printing press', orientation: 'landscape', colour: 'blue', perPage: 24, page: 2 } as const;

describe('stock search requests', () => {
  it('Pexels: key in the Authorization header, filters in the address', () => {
    const r = searchRequest('pexels', { ...q }, 'PK');
    expect(r.headers.Authorization).toBe('PK');
    expect(r.url).toContain('api.pexels.com/v1/search?query=offset%20printing%20press');
    expect(r.url).toContain('orientation=landscape'); expect(r.url).toContain('color=blue'); expect(r.url).toContain('page=2');
  });
  it('Pixabay: key in the address, safe search, its own words for shape and colour', () => {
    const r = searchRequest('pixabay', { ...q, colour: 'blackwhite' }, 'XK');
    expect(r.url).toContain('key=XK'); expect(r.url).toContain('safesearch=true');
    expect(r.url).toContain('orientation=horizontal'); expect(r.url).toContain('colors=grayscale');
  });
  it('Unsplash: Client-ID header, at most 30 per page, squarish', () => {
    const r = searchRequest('unsplash', { ...q, orientation: 'square', perPage: 40 }, 'UK');
    expect(r.headers.Authorization).toBe('Client-ID UK');
    expect(r.url).toContain('per_page=30'); expect(r.url).toContain('orientation=squarish');
  });
  it('cleans what the studio sends', () => {
    const c = cleanQuery({ query: '  big   banner ', orientation: 'diagonal', colour: 'neon' });
    expect(c).toMatchObject({ query: 'big banner', orientation: 'any', colour: 'any', page: 1 });
  });
});

describe('reading results', () => {
  it('Pexels photos become one shape, original resized to 2400px', () => {
    const [p] = readResults('pexels', { photos: [{ id: 7, width: 4000, height: 3000, alt: 'Printer', photographer: 'Ana', photographer_url: 'https://www.pexels.com/@ana', url: 'https://www.pexels.com/photo/7/',
      src: { medium: 'https://images.pexels.com/m.jpg', large2x: 'https://images.pexels.com/l.jpg', original: 'https://images.pexels.com/o.jpeg' } }] });
    expect(p).toMatchObject({ provider: 'pexels', id: '7', author: 'Ana', alt: 'Printer' });
    expect(p.full).toBe('https://images.pexels.com/o.jpeg?auto=compress&cs=tinysrgb&w=2400');
  });
  it('Pixabay tags and author page; square filter', () => {
    const json = { hits: [
      { id: 1, webformatURL: 'https://cdn.pixabay.com/a_640.jpg', largeImageURL: 'https://cdn.pixabay.com/a_1280.jpg', imageWidth: 1000, imageHeight: 1000, tags: 'print, ink', user: 'bob', user_id: 5, pageURL: 'https://pixabay.com/photos/a-1/' },
      { id: 2, webformatURL: 'https://cdn.pixabay.com/b_640.jpg', largeImageURL: 'https://cdn.pixabay.com/b_1280.jpg', imageWidth: 2000, imageHeight: 1000, tags: 'x', user: 'c', user_id: 6 } ] };
    const all = readResults('pixabay', json);
    expect(all[0].tags).toEqual(['print', 'ink']); expect(all[0].authorUrl).toBe('https://pixabay.com/users/bob-5/');
    expect(readResults('pixabay', json, { orientation: 'square' }).map((p) => p.id)).toEqual(['1']);
  });
  it('Unsplash keeps the download address and drops non-https pictures', () => {
    const out = readResults('unsplash', { results: [
      { id: 'abc', width: 10, height: 5, alt_description: 'ink', urls: { small: 'https://images.unsplash.com/s', regular: 'https://images.unsplash.com/r', raw: 'https://images.unsplash.com/raw?ixid=1' },
        user: { name: 'Lee', links: { html: 'https://unsplash.com/@lee' } }, links: { html: 'https://unsplash.com/photos/abc', download_location: 'https://api.unsplash.com/photos/abc/download?ixid=1' } },
      { id: 'bad', urls: { small: 'http://x/s', raw: 'http://x/r' } } ] });
    expect(out).toHaveLength(1);
    expect(out[0].full).toBe('https://images.unsplash.com/raw?ixid=1&w=2400&fit=max&q=80&auto=format');
    expect(trackAllowed(out[0].track!)).toBe(true);
  });
  it('mixes services in turn', () => {
    const a = (id: string) => ({ id } as any);
    expect(interleave([[a('p1'), a('p2'), a('p3')], [a('u1')]]).map((x) => x.id)).toEqual(['p1', 'u1', 'p2', 'p3']);
  });
});

describe('safety', () => {
  it('copies only from Pexels and Pixabay picture hosts', () => {
    expect(copyAllowed('https://images.pexels.com/photos/1/a.jpeg')).toBe(true);
    expect(copyAllowed('https://cdn.pixabay.com/photo/a.jpg')).toBe(true);
    expect(copyAllowed('http://images.pexels.com/a.jpg')).toBe(false);
    expect(copyAllowed('https://images.pexels.com.evil.io/a.jpg')).toBe(false);
    expect(copyAllowed('https://169.254.169.254/latest')).toBe(false);
    expect(copyAllowed('https://images.unsplash.com/a')).toBe(false);
  });
  it('tracks only Unsplash download addresses', () => {
    expect(trackAllowed('https://api.unsplash.com/photos/x-1/download?ixid=2')).toBe(true);
    expect(trackAllowed('https://api.unsplash.com/me')).toBe(false);
    expect(trackAllowed('https://evil.com/photos/x/download')).toBe(false);
  });
});

describe('AI search words', () => {
  it('asks for JSON and reads it back', () => {
    const b = termsPrompt('مطبعة أوفست', 'bright') as any;
    expect(b.generationConfig.responseMimeType).toBe('application/json');
    expect(b.contents[0].parts[0].text).toContain('STYLE: bright');
    const t = readTerms({ candidates: [{ content: { parts: [{ text: '{"query":"\\"offset press\\"","alternatives":["ink rollers","print shop","a","b"]}' }] } }] });
    expect(t).toEqual({ query: 'offset press', alternatives: ['ink rollers', 'print shop', 'a'] });
    expect(readTerms({})).toBeNull();
  });
});

describe('studio helpers', () => {
  const photo = { provider: 'pexels', id: '9', thumb: 't', preview: 'p', full: 'https://images.pexels.com/o.jpg', width: 2400, height: 1600, alt: 'Workers installing a large banner, outdoors', tags: ['Banner', 'Install'], author: 'Ana', authorUrl: 'https://a', pageUrl: 'https://pexels.com/photo/9' } as any;
  it('hides rejected photos and those already in the Library', () => {
    const media = [{ id: 'm1', stock: { provider: 'pexels', id: '1' } }];
    const list = [{ provider: 'pexels', id: '1' }, { provider: 'pexels', id: '2' }, { provider: 'unsplash', id: '2' }] as any[];
    expect(freshPhotos(list, ['unsplash:2'], media).map(stockKey)).toEqual(['pexels:2']);
    expect(freshPhotos(list, [], media, { showAdded: true })).toHaveLength(3);
    expect(inLibrary(media).has('pexels:1')).toBe(true);
  });
  it('remembers rejections, newest last, capped', () => {
    expect(rejectPhoto(['a', 'b'], 'a')).toEqual(['b', 'a']);
    const many = Array.from({ length: MAX_REJECTED }, (_, i) => 'k' + i);
    const r = rejectPhoto(many, 'new'); expect(r).toHaveLength(MAX_REJECTED); expect(r[r.length - 1]).toBe('new'); expect(r[0]).toBe('k1');
  });
  it('builds a copied Library item with credit and licence', () => {
    const m = stockMedia(photo, { id: 'm9', category: 'c1', file: { assetId: 'a/b.jpg', url: 'https://s/b.jpg', bytes: 1000, w: 1920, h: 1280 }, now: '2026-11-28T00:00:00Z' });
    expect(m).toMatchObject({ id: 'm9', label: 'Workers installing a large banner', kind: 'image', assetId: 'a/b.jpg', w: 1920, caption: 'Photo by Ana on Pexels', stock: { provider: 'pexels', id: '9' } });
    expect(m.tags).toEqual(['banner', 'install']); expect(m.credit.licenceUrl).toContain('pexels.com/license'); expect(m.ext).toBeUndefined();
  });
  it('keeps Unsplash photos linked', () => {
    const m = stockMedia({ ...photo, provider: 'unsplash', full: 'https://images.unsplash.com/raw?w=2400' }, { id: 'm1', category: 'c' });
    expect(m.ext).toBe('https://images.unsplash.com/raw?w=2400'); expect(m.assetId).toBeUndefined(); expect(m.caption).toBe('Photo by Ana on Unsplash');
  });
  it('labels and file names', () => {
    expect(stockLabel({ provider: 'pixabay', alt: '' } as any, 'print shop')).toBe('Print shop');
    expect(stockLabel({ provider: 'pixabay', alt: '' } as any)).toBe('Pixabay photo');
    expect(stockFileName(photo, 'image/png')).toBe('workers-installing-a-large-banner-pexels-9.png');
    expect(creditLine('pixabay', '')).toBe('Photo from Pixabay');
  });
  it('reads the picture type from its bytes', () => {
    expect(sniffType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe('image/jpeg');
    expect(sniffType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).toBe('image/webp');
    expect(sniffType(new Uint8Array([0x3c, 0x68, 0x74, 0x6d, 0x6c, 0, 0, 0, 0, 0, 0, 0]))).toBe('');
  });
  it('status from the function', () => {
    expect(stockStatus({ ok: true, providers: { pexels: true }, ai: false })).toMatchObject({ state: 'ready', ai: false });
    expect(stockStatus({ ok: true, providers: {} }).state).toBe('no_key');
    expect(stockStatus({ ok: false, code: 'not_deployed' }).state).toBe('not_deployed');
  });
  it('puts the credit in the pictures\' structured data', () => {
    const m = stockMedia(photo, { id: 'm9', category: 'c1', file: { assetId: 'a', url: 'https://s/b.jpg' } });
    const [o] = mediaJsonLd({ media: [m] }, ['m9'], () => 'https://s/b.jpg') as any[];
    expect(o.creditText).toBe('Photo by Ana on Pexels'); expect(o.creator.name).toBe('Ana'); expect(o.acquireLicensePage).toBe('https://pexels.com/photo/9');
  });
});
