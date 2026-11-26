import { describe, expect, it } from 'vitest';
import { normalize } from '../src/studio/data';

describe('logo versions and places', () => {
  it('fills in logo defaults for a saved site', () => {
    const out = normalize({ site: { brand: 'X' } });
    expect(out.site.logos.places.header.dark).toBe('auto');
    expect(out.site.logos.places.loader.width).toBe(238);
    expect(out.site.logos.silver.preset).toBe('classic');
  });

  it('moves older menu and loader logos and the header height into the Logo tab once', () => {
    const saved = { site: { logoHeight: 44 }, theme: { menu: { logo: 'm1' } }, loader: { image: 'm2' }, media: [] };
    const out = normalize(saved);
    const L = out.site.logos;
    expect(L.places.header.height).toBe(44);
    expect(L.versions.map((v: { image: string }) => v.image)).toEqual(['m1', 'm2']);
    expect(L.places.menu.dark).toBe(L.versions[0].id);
    expect(L.places.loader.light).toBe(L.versions[1].id);
    expect(out.theme.menu.logo).toBe('');
    expect(out.loader.image).toBe('');
    // a second pass keeps what the studio saved
    L.places.menu.dark = 'silver';
    expect(normalize(out).site.logos.places.menu.dark).toBe('silver');
  });
});
