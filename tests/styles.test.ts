import { describe, expect, it } from 'vitest';
import { applyStyle, normalize, resetOverrides, snapshotStyle } from '../src/studio/data';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

describe('global style layer', () => {
  it('fills in the global defaults for older saves', () => {
    const c: Any = normalize({ theme: { accent: '#123456' }, motion: { speed: 1 } });
    expect(c.theme.accent).toBe('#123456');
    expect(c.theme.header).toMatchObject({ bgAlpha: 0 });
    expect(c.motion.flow).toMatchObject({ mode: 'items', preset: 'rise' });
    expect(c.motion.slideTiming).toMatchObject({ title: 0, text: 0.5, flow: 1.5 });
    expect(c.styles.length).toBeGreaterThan(0);
  });

  it('keeps the look of flows saved before global styles', () => {
    const c: Any = normalize({ motion: { flow: { mode: 'items', preset: 'rise', duration: 0.8, stagger: 0.06, delay: 0 } }, flows: [
      { id: 'a', items: [], anim: { mode: 'items', preset: 'rise', duration: 0.8, stagger: 0.06, delay: 0 } },
      { id: 'b', items: [], anim: { mode: 'group', preset: 'pop', duration: 0.5, stagger: 0, delay: 0 } },
    ] });
    expect(c.flows[0].custom).toEqual({ anim: false, colors: false });
    expect(c.flows[1].custom).toEqual({ anim: true, colors: false });
    expect(c.flows[1].colors).toEqual({});
  });

  it('saves and applies a style without touching per-item settings', () => {
    const c: Any = normalize(null);
    c.theme.accent = '#ff0000'; c.theme.header.text = '#00ff00'; c.motion.slideTiming.text = 2;
    const st = snapshotStyle(c, 'Red');
    expect(st.name).toBe('Red');
    expect(st.theme.swatches).toBeUndefined();

    c.theme.accent = '#0000ff'; c.theme.header.text = ''; c.motion.slideTiming.text = 0.5;
    c.flows[0].custom = { anim: true, colors: true };
    applyStyle(c, st);
    expect(c.theme.accent).toBe('#ff0000');
    expect(c.theme.header.text).toBe('#00ff00');
    expect(c.motion.slideTiming.text).toBe(2);
    expect(c.flows[0].custom).toEqual({ anim: true, colors: true });
    st.theme.header.text = '#ffffff';
    expect(c.theme.header.text).toBe('#00ff00'); // applied as a copy
  });

  it('switches every flow and slide back to the global style', () => {
    const c: Any = normalize(null);
    c.flows.forEach((f: Any) => { f.custom = { anim: true, colors: true }; });
    const hc = c.pages.flatMap((p: Any) => p.sections).find((s: Any) => s.type === 'heroCarousel');
    hc.look = { custom: true, title: '#ffffff' };
    hc.slides[0].look = { custom: true };
    const n = resetOverrides(c);
    expect(n).toBe(c.flows.length + 2);
    expect(c.flows.every((f: Any) => !f.custom.anim && !f.custom.colors)).toBe(true);
    expect(hc.look).toEqual({ custom: false, title: '#ffffff' });
  });
});
