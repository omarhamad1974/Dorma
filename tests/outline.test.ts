import { describe, expect, it } from 'vitest';
import { linksTo, freeId, duplicatePage, duplicateSection, nudge, moveSection, deletePage, outlineStats, makeHistory } from '../src/studio/outlinemodel';

let n = 0;
const id = () => 's' + (++n);
const cfg = (): any => ({
  site: { homePage: 'home', header: { button: { label: 'Quote', action: { type: 'page', target: 'print', section: 'quote' } } } },
  pages: [
    { id: 'home', title: 'Home', nav: true, sections: [{ id: 'a', type: 'hero', title: 'Hi' }, { id: 'b', type: 'features', anchor: 'Services', hidden: true }] },
    { id: 'print', title: { en: 'Print', ar: 'طباعة' }, nav: true, sections: [{ id: 'c', type: 'hero' }, { id: 'd', type: 'quote', anchor: 'quote' }] }
  ],
  modals: [{ id: 'm', more: { action: { type: 'page', target: 'print' } } }]
});

describe('site outline model', () => {
  it('counts buttons that open a page or travel to a section', () => {
    const c = cfg();
    expect(linksTo(c, 'print')).toBe(2);
    expect(linksTo(c, 'print', 'Quote')).toBe(1);
    expect(linksTo(c, 'home')).toBe(0);
  });

  it('finds a free page address', () => {
    const c = cfg();
    expect(freeId(c.pages, 'print')).toBe('print-2');
    expect(freeId(c.pages, 'New Page!')).toBe('new-page');
  });

  it('duplicates a page after the original, out of the menu, with new section ids', () => {
    const c = cfg();
    const copy = duplicatePage(c, c.pages[1], id);
    expect(c.pages.map((p: any) => p.id)).toEqual(['home', 'print', 'print-copy']);
    expect(copy.nav).toBe(false);
    expect(copy.title).toEqual({ en: 'Print (copy)', ar: 'طباعة (نسخة)' });
    expect(copy.sections.map((s: any) => s.id)).not.toContain('c');
    expect(c.pages[1].sections[0].id).toBe('c');
  });

  it('duplicates a section below the original with its own label', () => {
    const c = cfg();
    const copy = duplicateSection(c.pages[0], c.pages[0].sections[1], id);
    expect(c.pages[0].sections[2]).toBe(copy);
    expect(copy.anchor).toBe('services-copy');
    expect(copy.hidden).toBe(true);
  });

  it('moves items up and down, and stops at the edges', () => {
    const a = [1, 2, 3];
    expect(nudge(a, 1, -1)).toBe(false);
    expect(nudge(a, 1, 1)).toBe(true);
    expect(a).toEqual([2, 1, 3]);
  });

  it('moves a section to another page', () => {
    const c = cfg();
    moveSection(c, 'home', 1, 'print', 1);
    expect(c.pages[0].sections.map((s: any) => s.id)).toEqual(['a']);
    expect(c.pages[1].sections.map((s: any) => s.id)).toEqual(['c', 'b', 'd']);
  });

  it('never removes the home page', () => {
    const c = cfg();
    expect(deletePage(c, c.pages[0])).toBe(false);
    expect(deletePage(c, c.pages[1])).toBe(true);
    expect(c.pages).toHaveLength(1);
  });

  it('sums pages, menu pages, sections and hidden sections', () => {
    expect(outlineStats(cfg())).toEqual({ pages: 2, inMenu: 2, sections: 4, hidden: 1 });
  });

  it('undoes a removal and keeps the same pages array', () => {
    const c = cfg(), H = makeHistory(), pages = c.pages;
    H.record(c, 'removed print', () => deletePage(c, c.pages[1]));
    expect(H.label).toBe('removed print');
    expect(H.undo(c)).toBe('removed print');
    expect(c.pages).toBe(pages);
    expect(c.pages.map((p: any) => p.id)).toEqual(['home', 'print']);
    expect(H.size).toBe(0);
  });

  it('does not record a change that did nothing', () => {
    const c = cfg(), H = makeHistory();
    H.record(c, 'move up', () => nudge(c.pages, c.pages[0], -1));
    expect(H.size).toBe(0);
  });

  it('drops the undo history when the pages were changed somewhere else', () => {
    const c = cfg(), H = makeHistory();
    H.record(c, 'hid', () => { c.pages[0].sections[0].hidden = true; });
    c.pages[0].title = 'Edited in Pages';
    expect(H.valid(c)).toBe(false);
    expect(H.undo(c)).toBe('');
    expect(c.pages[0].title).toBe('Edited in Pages');
  });
});
