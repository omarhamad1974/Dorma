import { describe, expect, it } from 'vitest';
import { TEXT_STEPS, textStep, stepText, textPct, foldKey, foldedByDefault, isFolded, pageInfo, pageList, matches } from '../src/studio/comfort';

describe('studio text size', () => {
  it('reads unknown saved values as Normal', () => {
    expect(textStep(1)).toBe(1);
    expect(textStep('abc')).toBe(1);
    expect(textStep(1.4)).toBe(TEXT_STEPS.findIndex(s => s[0] === 1.4));
  });
  it('steps up and down and stops at the ends', () => {
    expect(stepText(1, 1)).toBe(1.12);
    expect(stepText(1, -1)).toBe(0.9);
    expect(stepText(0.9, -1)).toBe(0.9);
    expect(stepText(2, 1)).toBe(2);
    expect(textPct(1.12)).toBe('112%');
  });
  it('goes up to twice the normal size', () => {
    expect(TEXT_STEPS[TEXT_STEPS.length - 1][0]).toBe(2);
  });
});

describe('folding groups', () => {
  it('starts rarely used groups folded', () => {
    expect(foldedByDefault('Look')).toBe(true);
    expect(foldedByDefault('  Header on this page ')).toBe(true);
    expect(foldedByDefault('Import slides from Markdown')).toBe(true);
    expect(foldedByDefault('Sections · drag to reorder, hide or duplicate')).toBe(false);
  });
  it('remembers the choice per tab and title', () => {
    const m = { [foldKey('pages', 'Look')]: 0, [foldKey('pages', 'Page')]: 1 };
    expect(isFolded(m, 'pages', 'Look')).toBe(false);
    expect(isFolded(m, 'pages', 'page')).toBe(true);
    expect(isFolded(m, 'modals', 'Look')).toBe(true);
    expect(isFolded({}, 'pages', 'Page')).toBe(false);
  });
});

describe('paging', () => {
  it('clamps the page to the ones that exist', () => {
    expect(pageInfo(30, 12, 0)).toEqual({ pages: 3, page: 0, start: 0, end: 12 });
    expect(pageInfo(30, 12, 9)).toEqual({ pages: 3, page: 2, start: 24, end: 30 });
    expect(pageInfo(0, 12, 3)).toEqual({ pages: 1, page: 0, start: 0, end: 0 });
  });
  it('shows first, last and nearby pages with gaps', () => {
    expect(pageList(5, 2)).toEqual([0, 1, 2, 3, 4]);
    expect(pageList(20, 0)).toEqual([0, 1, 2, 3, '…', 19]);
    expect(pageList(20, 10)).toEqual([0, '…', 9, 10, 11, '…', 19]);
    expect(pageList(20, 19)).toEqual([0, '…', 16, 17, 18, 19]);
  });
});

describe('find', () => {
  it('matches every word, in any order, ignoring case', () => {
    expect(matches('Title size (1 = normal)', 'size title')).toBe(true);
    expect(matches('Panel colour', 'COLOUR')).toBe(true);
    expect(matches('Panel colour', 'colour blue')).toBe(false);
  });
});
