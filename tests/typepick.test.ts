import { describe, expect, it } from 'vitest';
import { OPT, SECTION_TYPES } from '../src/studio/data';
import { kindOf, previewHtml, registerLists } from '../src/studio/typepick';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const GROUPS = ['Lines', 'Masks', 'Colour', 'Print', 'Type', 'Points', 'Shapes'];
const bgfx = [['none', 'None'], ...GROUPS.map(g => [g.toLowerCase(), g])];
const O: Any = { ...OPT, bgfx };
registerLists(O, { fxGroups: Object.fromEntries(GROUPS.map(g => [g.toLowerCase(), g])) } as Any);

const LISTS: [string, string][] = [
  ['modalTypes', 'modalType'], ['layouts', 'layout'], ['flowDisplays', 'flowDisplay'], ['kinds', 'itemKind'], ['presets', 'preset'],
  ['imageReveal', 'imageReveal'], ['imageShape', 'imageShape'], ['imageHover', 'imageHover'], ['sectionIn', 'sectionIn'], ['sectionOut', 'sectionOut'],
  ['modalOpen', 'modalOpen'], ['modalClose', 'modalClose'], ['menuModes', 'menuMode'], ['menuLinkStyles', 'linkStyle'], ['menuHover', 'menuHover'],
  ['menuOpen', 'menuOpen'], ['menuItems', 'menuItems'], ['transition', 'transition'], ['titleReveal', 'titleReveal'], ['scrollReveal', 'scrollReveal'],
  ['ease', 'ease'], ['colorModes', 'colorMode'], ['fxPalettes', 'palette'], ['fxDirs', 'fxDir'], ['dirs4', 'dir4'], ['fxPos', 'fxPos'], ['fxSoften', 'fxSoften'], ['bgfx', 'bgfx'],
  ['iconPos', 'iconPos'], ['iconAnim', 'iconAnim'], ['blockIn', 'blockIn'], ['blockLoop', 'blockLoop'], ['headStyles', 'headStyle'], ['headIn', 'headIn'],
  ['cardHover', 'cardHover'], ['photoMasks', 'photoMask'], ['ctaStyles', 'ctaStyle'],
];

describe('visual type pickers', () => {
  it.each(LISTS)('draws a preview for every choice in %s', (list, kind) => {
    for (const [v] of O[list]) expect(previewHtml(kind, v), `${list}: ${v}`).not.toBe('');
  });

  it('draws every section type', () => {
    for (const k of Object.keys(SECTION_TYPES)) expect(previewHtml('section', k), k).toContain('<svg');
  });

  it('recognises a list with "Global" added in front', () => {
    expect(kindOf([['', 'Global (Rise)'], ...O.sectionIn])).toBe('sectionIn');
    expect(kindOf(O.modalTypes)).toBe('modalType');
    expect(kindOf([['start', 'Start'], ['center', 'Centre']])).toBe('');
    expect(previewHtml('sectionIn', '')).toContain('GLOBAL');
  });
});
