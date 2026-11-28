import { describe, expect, it } from 'vitest';
import { normalize } from '../src/studio/data';
import { buildProposalSite, newCode, codeOk, normalizeProposal, proposalState, proposalPages, preparedFor, proposalTitle, proposalsUsing, deviceOf } from '../src/studio/proposals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

describe('client proposals', () => {
  it('fills in a blank or partial proposal', () => {
    const d: Any = normalizeProposal({ client: { name: 'Acme' }, services: ['packaging', { page: 'booth-production', hide: ['x', 3] }] }, '2026-11-28');
    expect(d.client.name).toEqual({ en: 'Acme', ar: '' });
    expect(d.client.logoBg).toBe('white');
    expect(d.date).toBe('2026-11-28');
    expect(d.services).toEqual([{ page: 'packaging', hide: [], note: { en: '', ar: '' } }, { page: 'booth-production', hide: ['x'], note: { en: '', ar: '' } }]);
    expect(d.contact.action).toEqual({ type: 'modal', target: 'md-quote' });
    expect(d.langs).toBe('site');
    expect(normalizeProposal(null).services).toEqual([]);
  });

  it('makes readable link codes that are hard to guess and never repeat', () => {
    let i = 0; const seq = [0, 0, 0, 0, 0.5, 0.5, 0.5, 0.5];
    const rnd = () => seq[i++ % seq.length];
    const a = newCode('Al Futtaim Group!', [], rnd);
    expect(a).toMatch(/^al-futtaim-group-[a-z2-9]{4}$/);
    const b = newCode('Al Futtaim Group!', [a], rnd);
    expect(b).not.toBe(a);
    expect(newCode('دورما')).toMatch(/^client-[a-z2-9]{4}$/);
    expect(codeOk(a)).toBe(true);
    expect(codeOk('Bad Code')).toBe(false);
    expect(codeOk('ab')).toBe(false);
  });

  it('works out live, off, expired and archived', () => {
    expect(proposalState({ status: 'live', expires_on: null }, '2026-11-28')).toBe('live');
    expect(proposalState({ status: 'live', expires_on: '2026-11-28' }, '2026-11-28')).toBe('live');
    expect(proposalState({ status: 'live', expires_on: '2026-11-27' }, '2026-11-28')).toBe('expired');
    expect(proposalState({ status: 'off' }, '2026-11-28')).toBe('off');
    expect(proposalState({ status: 'archived', expires_on: '2020-01-01' }, '2026-11-28')).toBe('archived');
  });

  it('lists service pages first', () => {
    const cfg: Any = normalize(null);
    const list = proposalPages(cfg);
    expect(list[0].service).toBe(true);
    expect(list.some((p: Any) => p.id === 'packaging' && p.service)).toBe(true);
    expect(list.some((p: Any) => p.id === 'home' && !p.service)).toBe(true);
  });

  it('builds the overview and one page per service from the published pages', () => {
    const cfg: Any = normalize(null);
    const pkg = cfg.pages.find((p: Any) => p.id === 'packaging');
    const hideId = pkg.sections[1].id;
    const site: Any = buildProposalSite(cfg, {
      client: { name: { en: 'Acme', ar: 'أكمي' }, logo: '' },
      services: [{ page: 'packaging', hide: [hideId] }, { page: 'booth-production' }, { page: 'no-such-page' }],
      work: { media: ['m-city', 'missing-id'], posts: [] },
      welcome: { en: 'Hello', ar: 'مرحباً' },
    }, 'acme-k7p2');
    expect(site.pages.map((p: Any) => p.id)).toEqual(['for/acme-k7p2', 'for/acme-k7p2/packaging', 'for/acme-k7p2/booth-production']);
    expect(site.site.homePage).toBe('for/acme-k7p2');
    expect(site.__pageMap).toEqual({ packaging: 'for/acme-k7p2/packaging', 'booth-production': 'for/acme-k7p2/booth-production' });
    const ov = site.pages[0];
    expect(ov.sections.map((s: Any) => s.type)).toEqual(['forCover', 'division', 'grid', 'cta']);
    expect(ov.sections[0].eyebrow).toEqual({ en: 'Prepared for Acme', ar: 'مقدَّم إلى أكمي' });
    expect(ov.sections[0].lede).toEqual({ en: 'Hello', ar: 'مرحباً' });
    expect(ov.sections[0].media).toBe(pkg.sections[0].media); // first service's picture
    expect(ov.sections[1].items[0]).toMatchObject({ title: pkg.title, action: { type: 'page', target: 'packaging' } });
    expect(ov.sections[2].items).toHaveLength(1);
    const pp = site.pages[1];
    expect(pp.sections.some((s: Any) => s.id === hideId)).toBe(false);
    expect(pp.sections.length).toBe(pkg.sections.length - 1);
    // the main site's own settings are untouched
    expect(cfg.pages.find((p: Any) => p.id === 'packaging').sections.length).toBe(pkg.sections.length);
    expect(cfg.site.homePage).toBe('home');
  });

  it('uses the proposal languages and contact button, and hides empty parts', () => {
    const cfg: Any = normalize(null);
    const site: Any = buildProposalSite(cfg, { langs: 'ar', defaultLang: 'ar', contact: { label: { en: '', ar: '' }, action: { type: 'none', target: '' } } }, 'x-abcd');
    expect(site.site.languages).toBe('ar');
    expect(site.site.defaultLang).toBe('ar');
    expect(site.pages[0].sections.map((s: Any) => s.type)).toEqual(['forCover']);
    expect(site.site.cta.label).toBe('');
  });

  it('switches to the menu button when the proposal has many pages', () => {
    const cfg: Any = normalize(null);
    const ids = proposalPages(cfg).filter((p: Any) => p.service).slice(0, 6).map((p: Any) => p.id);
    expect(buildProposalSite(cfg, { services: ids }, 'x-abcd').theme.menu.mode).toBe('overlay');
    expect(buildProposalSite(cfg, { services: ids.slice(0, 2) }, 'x-abcd').theme.menu.mode).toBe(cfg.theme.menu.mode);
  });

  it('writes the default headline and keeps custom words', () => {
    const d: Any = normalizeProposal({ client: { name: { en: 'Acme', ar: '' } }, words: { preparedFor: { en: 'Made for', ar: '' }, bogus: 'x' } });
    expect(proposalTitle(d)).toEqual({ en: 'A proposal for Acme', ar: 'عرض مقدّم إلى Acme' });
    expect(preparedFor(d).en).toBe('Made for Acme');
    expect(Object.keys(d.words)).toEqual(['preparedFor']);
  });

  it('finds proposals that use a page or a picture', () => {
    const rows = [{ data: { services: ['packaging'], client: { logo: 'logo-1' } } }, { data: { work: { media: ['m-city'] } } }];
    expect(proposalsUsing(rows, { page: 'packaging' })).toHaveLength(1);
    expect(proposalsUsing(rows, { media: 'm-city' })).toHaveLength(1);
    expect(proposalsUsing(rows, { media: 'logo-1' })).toHaveLength(1);
  });

  it('names the device for the open counter', () => {
    expect(deviceOf(390)).toBe('phone');
    expect(deviceOf(900, true)).toBe('tablet');
    expect(deviceOf(900, false)).toBe('computer');
    expect(deviceOf(1440, true)).toBe('computer');
  });
});
