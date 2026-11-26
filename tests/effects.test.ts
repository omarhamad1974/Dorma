import { describe, expect, it } from 'vitest';
import { OPT, normalize, snapshotStyle } from '../src/studio/data';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

describe('effects, animation and colour modes', () => {
  it('gives saves made before these settings the defaults', () => {
    const c: Any = normalize({ theme: { accent: '#123456' }, motion: { speed: 1, modalOpen: 'fade' } });
    expect(c.motion.modalOpen).toBe('fade');
    expect(c.motion.modalClose).toBe('auto');
    expect(c.motion.imageFx).toMatchObject({ reveal: 'none', shape: 'none', hover: 'none' });
    expect(c.motion.sectionFx).toMatchObject({ in: 'none', out: 'none' });
    expect(c.theme.light).toMatchObject({ ink: '#f4f6fb', accent: '#0072bc' });
    expect(c.colorMode).toEqual({ default: 'auto', toggle: true });
  });

  it('keeps a saved colour mode choice', () => {
    const c: Any = normalize({ colorMode: { default: 'dark', toggle: false } });
    expect(c.colorMode).toEqual({ default: 'dark', toggle: false });
  });

  it('saves the light colours and animation defaults in a style', () => {
    const c: Any = normalize(null);
    c.theme.light.accent = '#ff0000'; c.motion.imageFx.reveal = 'iris';
    const st = snapshotStyle(c, 'X');
    expect(st.theme.light.accent).toBe('#ff0000');
    expect(st.motion.imageFx.reveal).toBe('iris');
  });

  it('offers the studio choices for every new setting', () => {
    for (const k of ['modalOpen', 'modalClose', 'imageReveal', 'imageShape', 'imageHover', 'sectionIn', 'sectionOut', 'fxPalettes', 'fxDirs', 'fxPos', 'fxSoften', 'colorModes']) {
      const list = (OPT as Any)[k];
      expect(Array.isArray(list) && list.length > 1, k).toBe(true);
      expect(new Set(list.map((o: Any) => o[0])).size, k).toBe(list.length);
    }
  });
});
