import { describe, expect, it } from 'vitest';
import { clampBox, fitFrame, lpState, previewTarget, splitWidth, LP_DEFAULT } from '../src/studio/livepreview';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const D: Any = {
  pages: [
    { id: 'home', sections: [{ id: 'hero', type: 'heroCarousel' }, { id: 's1', type: 'text' }] },
    { id: 'about', sections: [{ id: 's2', type: 'text' }] },
  ],
  posts: [{ id: 'p1', slug: 'hello' }],
};

describe('live preview window', () => {
  it('reads back broken or missing settings as the defaults', () => {
    expect(lpState(null)).toEqual(LP_DEFAULT);
    expect(lpState({ open: true, mode: 'split', device: 'phone', w: 10, x: 'a' })).toMatchObject({ open: true, mode: 'split', device: 'phone', w: 260, x: -1 });
  });
  it('starts at the bottom right and stays on screen', () => {
    const b = clampBox({ ...LP_DEFAULT }, 1400, 900);
    expect(b.x + b.w).toBeLessThanOrEqual(1400); expect(b.y + b.h).toBeLessThanOrEqual(900); expect(b.x).toBeGreaterThan(700);
    const off = clampBox({ ...LP_DEFAULT, x: 5000, y: -900 + 1000, w: 3000 }, 1000, 700);
    expect(off.w).toBe(976); expect(off.x).toBe(12);
  });
  it('lays the site out at device width and shrinks it to fit', () => {
    expect(fitFrame(640, 400, 'desktop')).toEqual({ width: 1280, height: 800, scale: 0.5, left: 0 });
    expect(fitFrame(600, 500, 'phone')).toMatchObject({ width: 390, scale: 1, left: 105 });
  });
  it('docks at no more than half the screen', () => {
    expect(splitWidth(900, 1400)).toBe(700); expect(splitWidth(100, 1400)).toBe(360);
  });
  it('follows the page, section, carousel, post or modal being edited', () => {
    expect(previewTarget(D, 'pages', { pages: 'about' }, 's2')).toEqual({ page: 'about', sec: 's2', modal: null });
    expect(previewTarget(D, 'pages', { pages: 'about' }, 's1')).toEqual({ page: 'about', sec: null, modal: null });
    expect(previewTarget(D, 'carousels', { carousels: 'hero' })).toEqual({ page: 'home', sec: 'hero', modal: null });
    expect(previewTarget(D, 'blog', { blog: 'p1' }).page).toBe('post/hello');
    expect(previewTarget(D, 'modals', { modals: 'm1' })).toEqual({ page: null, sec: null, modal: 'm1' });
    expect(previewTarget(D, 'theme', {})).toEqual({ page: null, sec: null, modal: null });
  });
});
