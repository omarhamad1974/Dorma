import { describe, expect, it } from 'vitest';
import { normalize } from '../src/studio/data';
import { buildProposalSite, freezeSnapshot, normalizeProposal, notInFrozen, proposalPrint, withFrozen, stripMd } from '../src/studio/proposals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const clone = (x: Any) => JSON.parse(JSON.stringify(x));

describe('frozen proposals', () => {
  it('is live by default and keeps a valid frozen copy only', () => {
    expect(normalizeProposal({}).frozen).toBeNull();
    expect(normalizeProposal({ frozen: { at: 'x' } }).frozen).toBeNull();
    expect(normalizeProposal({ frozen: { at: 'x', pages: [{ id: 'a' }] } }).frozen).toMatchObject({ at: 'x', pages: [{ id: 'a' }], media: [] });
    expect(normalizeProposal({}).pdfLink).toBe(true);
    expect(normalizeProposal({ pdfLink: false }).pdfLink).toBe(false);
  });

  it('copies the chosen pages and what they point to, and later site edits do not change it', () => {
    const cfg: Any = normalize(null);
    const data: Any = { client: { name: 'Acme' }, services: [{ page: 'packaging' }] };
    const pkg = cfg.pages.find((p: Any) => p.id === 'packaging');
    const fz = freezeSnapshot(cfg, data, '2026-11-28T10:00:00Z');
    expect(fz.at).toBe('2026-11-28T10:00:00Z');
    expect(fz.pages.map((p: Any) => p.id)).toEqual(['packaging']);
    const heroMedia = pkg.sections[0].media;
    if (heroMedia) expect(fz.media.some((m: Any) => m.id === heroMedia)).toBe(true);
    expect(fz.media.length).toBeLessThan(cfg.media.length);
    // the main site changes after freezing
    const later: Any = clone(cfg);
    later.pages.find((p: Any) => p.id === 'packaging').sections[0].title = { en: 'Changed', ar: 'تغيّر' };
    const liveSite: Any = buildProposalSite(later, data, 'acme-abcd');
    expect(liveSite.pages[1].sections[0].title).toEqual({ en: 'Changed', ar: 'تغيّر' });
    const frozenSite: Any = buildProposalSite(later, { ...data, frozen: fz }, 'acme-abcd');
    expect(frozenSite.pages[1].sections[0].title).toEqual(pkg.sections[0].title);
    // a deleted page still shows from the copy
    later.pages = later.pages.filter((p: Any) => p.id !== 'packaging');
    expect(buildProposalSite(later, { ...data, frozen: fz }, 'acme-abcd').pages.map((p: Any) => p.id)).toContain('for/acme-abcd/packaging');
  });

  it('follows modals and flows the pages open', () => {
    const cfg: Any = normalize(null);
    const withModal = cfg.pages.find((p: Any) => JSON.stringify(p).includes('"md-'));
    if (!withModal) return;
    const fz = freezeSnapshot(cfg, { services: [{ page: withModal.id }] });
    expect(fz.modals.length).toBeGreaterThan(0);
    expect(fz.modals.some((m: Any) => m.id === 'md-quote')).toBe(true);
  });

  it('lists services added after freezing', () => {
    const cfg: Any = normalize(null);
    const fz = freezeSnapshot(cfg, { services: [{ page: 'packaging' }] });
    expect(notInFrozen({ services: [{ page: 'packaging' }, { page: 'booth-production' }], frozen: fz })).toEqual(['booth-production']);
    expect(notInFrozen({ services: [{ page: 'packaging' }] })).toEqual([]);
  });

  it('leaves the settings alone when live', () => {
    const cfg: Any = normalize(null);
    expect(withFrozen(cfg, normalizeProposal({}))).toBe(cfg);
  });
});

describe('printable proposal', () => {
  it('builds the document in English and Arabic', () => {
    const cfg: Any = normalize(null);
    cfg.site.quoteEmail = 'hello@example.com';
    const data: Any = { client: { name: { en: 'Acme', ar: 'أكمي' } }, date: '2026-11-28', welcome: { en: 'Hello there', ar: 'مرحباً' },
      services: [{ page: 'packaging', note: { en: 'Boxes for your launch', ar: '' } }, { page: 'booth-production' }] };
    const en: Any = proposalPrint(cfg, data, 'en');
    expect(en.dir).toBe('ltr');
    expect(en.preparedFor).toBe('Prepared for Acme');
    expect(en.welcome).toBe('Hello there');
    expect(en.email).toBe('hello@example.com');
    expect(en.services.map((s: Any) => s.id)).toEqual(['packaging', 'booth-production']);
    expect(en.services[0].summary).toBe('Boxes for your launch');
    expect(en.services[0].blocks.length).toBeGreaterThan(0);
    // forms and buttons are left out
    expect(JSON.stringify(en.services).includes('"quote"')).toBe(false);
    const ar: Any = proposalPrint(cfg, data, 'ar');
    expect(ar.dir).toBe('rtl');
    expect(ar.preparedFor).toBe('مقدَّم إلى أكمي');
    expect(ar.services[0].summary).toBe('Boxes for your launch'); // empty Arabic falls back to English
  });

  it('leaves out sections hidden for the client', () => {
    const cfg: Any = normalize(null);
    const pkg = cfg.pages.find((p: Any) => p.id === 'packaging');
    const id = pkg.sections[1].id;
    const doc: Any = proposalPrint(cfg, { services: [{ page: 'packaging', hide: [id] }] }, 'en');
    expect(doc.services[0].blocks.some((b: Any) => b.id === id)).toBe(false);
  });

  it('strips simple formatting', () => {
    expect(stripMd('## Title\n**bold** and [a link](https://x.y)')).toBe('Title\nbold and a link');
  });
});
