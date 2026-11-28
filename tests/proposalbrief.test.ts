import { describe, it, expect } from 'vitest';
import { normalize } from '../src/studio/data';
import { buildProposalSite, normalizeProposal, normalizeKit, kitDefaults, fillPlaceholders, placeholderValues, briefText, unknownPlaceholders, signature, applyKit, longDate, joinList, proposalDefaults, proposalPrint } from '../src/studio/proposals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

describe('proposal brief templates and signature', () => {
  it('fills placeholders in English and Arabic, with aliases and any capitals', () => {
    const vals = { client: 'Acme', date: '28 November 2026', services: 'Packaging and Signage', sender: 'Omar', company: 'Dorma Advertising' };
    expect(fillPlaceholders('Dear [Client Name], [customer name] / [CLIENT]', vals)).toBe('Dear Acme, Acme / Acme');
    expect(fillPlaceholders('عزيزنا [اسم العميل]، [الخدمات]', vals)).toBe('عزيزنا Acme، Packaging and Signage');
    expect(fillPlaceholders('[sender name] · [company] · [date]', vals)).toBe('Omar · Dorma Advertising · 28 November 2026');
    // links and unknown brackets stay as typed
    expect(fillPlaceholders('[date](https://x.y) [budget]', vals)).toBe('[date](https://x.y) [budget]');
    expect(unknownPlaceholders('Dear [client name], [budget] [date](https://x.y)')).toEqual(['[budget]']);
  });

  it('formats dates and lists per language', () => {
    expect(longDate('2026-11-28', 'en')).toBe('28 November 2026');
    expect(longDate('2026-01-05', 'ar')).toBe('5 يناير 2026');
    expect(longDate('nope')).toBe('');
    expect(joinList(['A', 'B', 'C'])).toBe('A, B and C');
    expect(joinList(['أ', 'ب', 'ج'], 'ar')).toBe('أ، ب وج');
    expect(joinList(['A'])).toBe('A');
  });

  it('builds placeholder values from the proposal and its service pages', () => {
    const cfg: Any = normalize(null);
    const d = { client: { name: { en: 'Acme', ar: 'أكمي' } }, date: '2026-11-28', services: [{ page: 'packaging' }, { page: 'booth-production' }],
      sign: { name: { en: 'Omar', ar: 'عمر' }, company: 'production' } };
    const en = placeholderValues(d, cfg, 'en'), ar = placeholderValues(d, cfg, 'ar');
    expect(en.client).toBe('Acme'); expect(ar.client).toBe('أكمي');
    expect(en.services).toMatch(/ and /);
    expect(en.company).toBe('Dorma Production'); expect(ar.company).toBe('دورما للإنتاج');
    expect(ar.sender).toBe('عمر');
    const b = briefText({ ...d, welcome: { en: 'Dear [client name],', ar: 'عزيزنا [اسم العميل]،' } }, cfg);
    expect(b).toEqual({ en: 'Dear Acme,', ar: 'عزيزنا أكمي،' });
  });

  it('keeps sign settings and defaults older proposals', () => {
    expect(normalizeProposal({}).sign).toEqual({ show: true, name: { en: '', ar: '' }, company: 'advertising', place: 'end' });
    expect(normalizeProposal({ sign: { show: false, company: 'bogus', place: 'brief', name: 'Omar' } }).sign).toEqual({ show: false, name: { en: 'Omar', ar: '' }, company: 'advertising', place: 'brief' });
    expect(signature({ sign: { show: false } })).toBeNull();
    const s: Any = signature({ sign: { name: { en: 'Omar', ar: '' }, company: 'production' }, words: { signOff: { en: 'Best,', ar: '' } } });
    expect(s.off.en).toBe('Best,'); expect(s.company.en).toBe('Dorma Production'); expect(s.place).toBe('end');
  });

  it('starts new proposals from the default template and sender', () => {
    const kit = { ...kitDefaults(), sender: { en: 'Omar', ar: 'عمر' }, company: 'production' };
    const d: Any = applyKit(proposalDefaults('2026-11-28'), kit);
    expect(d.welcome.en).toMatch(/^Dear \[client name\]/);
    expect(d.briefTemplate).toBe('tpl-standard');
    expect(d.sign).toMatchObject({ show: true, name: { en: 'Omar', ar: 'عمر' }, company: 'production' });
    expect(normalizeKit({ templates: [{ id: 'a', name: 'A', body: 'Hi' }, { name: 'no id' }], company: 'x' }))
      .toEqual({ templates: [{ id: 'a', name: 'A', body: { en: 'Hi', ar: '' } }], defaultTemplate: 'tpl-standard', sender: { en: '', ar: '' }, company: 'advertising', place: 'end' });
    expect(normalize(null).proposalKit.templates.length).toBeGreaterThan(0);
  });

  it('puts the brief after the cover and the signature under it or at the end', () => {
    const cfg: Any = normalize(null);
    const base = { client: { name: { en: 'Acme', ar: '' } }, welcome: { en: 'Dear [client name],', ar: '' }, sign: { name: { en: 'Omar', ar: '' }, company: 'advertising', place: 'brief' } };
    const ov = buildProposalSite(cfg, base, 'acme-abcd').pages[0];
    expect(ov.sections.map((s: Any) => s.type)).toEqual(['forCover', 'forBrief', 'cta']);
    expect(ov.sections[1].text.en).toBe('Dear Acme,');
    expect(ov.sections[1].sign.name.en).toBe('Omar');
    const print: Any = proposalPrint(cfg, { ...base, sign: { ...base.sign, place: 'end' } }, 'en');
    expect(print.brief).toBe('Dear Acme,');
    expect(print.sign).toMatchObject({ name: 'Omar', company: 'Dorma Advertising', place: 'end', off: 'Kind regards,' });
    expect(print.client.name).toBe('Acme');
    expect(print.forWord).toBe('Prepared for');
  });
});
