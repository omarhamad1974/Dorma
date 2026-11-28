import { describe, expect, test } from 'vitest';
import { normalize } from '../src/studio/data';
import { backupFileName, buildBackup, clampKeep, compareConfigs, fmtSize, missingProposals, readBackup } from '../src/studio/backup';

describe('backups', () => {
  test('a backup file reads back with everything in it', () => {
    const draft = normalize(null), live = normalize(null);
    const file = JSON.stringify(buildBackup({ draft, live, social: { a: 1 }, proposals: [{ id: 'x', slug: 'acme-k7p2', data: {} }], brand: 'Dorma Advertising', now: new Date('2026-11-28T10:00:00Z') }));
    const r = readBackup(file);
    expect(r.ok).toBe(true);
    expect(r.kind).toBe('backup');
    expect(r.draft.pages.length).toBe(draft.pages.length);
    expect(r.social).toEqual({ a: 1 });
    expect(r.proposals).toHaveLength(1);
    expect(r.summary.pages).toBe(draft.pages.length);
  });
  test('a downloaded version (bare settings) is accepted', () => {
    const r = readBackup(JSON.stringify(normalize(null)));
    expect(r.ok && r.kind).toBe('settings');
  });
  test('wrong files are refused in plain words', () => {
    expect(readBackup('nope').error).toMatch(/valid JSON/);
    expect(readBackup('{"a":1}').ok).toBe(false);
    expect(readBackup(JSON.stringify({ format: 'dorma-backup', version: 9 })).error).toMatch(/newer/);
    expect(readBackup(JSON.stringify({ format: 'dorma-backup', version: 1 })).error).toMatch(/no site settings/);
  });
  test('file name', () => {
    expect(backupFileName('Dorma Advertising', new Date(2026, 10, 28, 9, 5))).toBe('dorma-backup-2026-11-28-0905.json');
    expect(backupFileName({ en: '', ar: 'دورما' }, new Date(2026, 0, 2, 3, 4), 'version')).toBe('دورما-version-2026-01-02-0304.json');
  });
  test('import only adds proposals whose link code is free', () => {
    const add = missingProposals([{ id: 'a', slug: 'one-1111', data: {} }, { id: 'b', slug: 'two-2222', data: {} }], [{ id: 'a', slug: 'one-1111' }]);
    expect(add.map((r) => r.slug)).toEqual(['two-2222']);
    expect(missingProposals([{ id: 'a', slug: 'new-3333', data: {} }], [{ id: 'a', slug: 'old-0000' }])[0].id).toBeUndefined();
  });
  test('sizes, keep count and compare', () => {
    expect(fmtSize(500)).toBe('500 B');
    expect(fmtSize(76296)).toBe('75 KB');
    expect(clampKeep(2)).toBe(5); expect(clampKeep(500)).toBe(100); expect(clampKeep('x')).toBe(30);
    const a = normalize(null), b = normalize(null);
    b.pages.push({ id: 'new', title: 'New', sections: [] }); b.pages[0].title = 'Changed'; b.theme.accent = '#000000';
    const d = compareConfigs(a, b);
    expect(d.find((x) => x.area === 'Pages')).toEqual({ area: 'Pages', added: 1, removed: 0, changed: 1 });
    expect(d.map((x) => x.area)).toContain('Colours and type');
  });
});
