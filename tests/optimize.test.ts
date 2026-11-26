import { describe, expect, it } from 'vitest';
import { fitSize, targetType, uploadSettings, renameFor, canOptimize, fmtBytes } from '../src/studio/optimize';
import { normalize } from '../src/studio/data';

describe('picture optimizing', () => {
  it('caps the longest side and never enlarges', () => {
    expect(fitSize(6000, 4000, 2400)).toEqual({ w: 2400, h: 1600, scaled: true });
    expect(fitSize(3000, 6000, 2400)).toEqual({ w: 1200, h: 2400, scaled: true });
    expect(fitSize(800, 600, 2400)).toEqual({ w: 800, h: 600, scaled: false });
  });
  it('keeps transparency as PNG when asked, and never writes it to JPEG', () => {
    const s = uploadSettings(null);
    expect(targetType('image/jpeg', false, s)).toBe('image/webp');
    expect(targetType('image/png', true, s)).toBe('image/png');
    expect(targetType('image/png', true, { ...s, keepPng: false })).toBe('image/webp');
    expect(targetType('image/png', true, { ...s, keepPng: false, format: 'jpeg' })).toBe('image/png');
    expect(targetType('image/jpeg', false, { ...s, format: 'same' })).toBe('image/jpeg');
    expect(targetType('image/heic', false, { ...s, format: 'same' })).toBe('image/jpeg');
  });
  it('cleans up settings typed in the studio', () => {
    const s = uploadSettings({ uploads: { maxSide: 20, quality: 3, format: 'bmp' } });
    expect(s).toMatchObject({ optimize: true, maxSide: 320, quality: 1, format: 'webp', keepPng: true });
    expect(uploadSettings({ uploads: { optimize: false } }).optimize).toBe(false);
  });
  it('leaves GIF, SVG and video alone', () => {
    expect(canOptimize('image/jpeg')).toBe(true);
    expect(canOptimize('image/gif')).toBe(false);
    expect(canOptimize('image/svg+xml')).toBe(false);
    expect(canOptimize('video/mp4')).toBe(false);
  });
  it('names and sizes files plainly', () => {
    expect(renameFor('Booth photo.JPG', 'image/webp')).toBe('Booth photo.webp');
    expect(fmtBytes(6_500_000)).toBe('6.2 MB');
    expect(fmtBytes(480_000)).toBe('469 KB');
  });
  it('gives saved sites the default settings', () => {
    expect((normalize({ site: {} }) as any).uploads).toMatchObject({ optimize: true, maxSide: 2400, format: 'webp' });
    expect((normalize({ uploads: { quality: 0.9 } }) as any).uploads).toMatchObject({ quality: 0.9, keepPng: true });
  });
});
