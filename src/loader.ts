/* ================= PAGE LOADER =================
   The default markup and styles live inline in index.html so the loader paints before any script.
   Settings come from config.loader (studio → Site → Loader). The last published settings are cached
   in this browser so the next visit starts with the right logo, text and colours. */
import { BUILTIN_LOGO_WHITE, esc, logoFor, logoHtml, sanitizeSvg } from './studio/core';


export interface LoaderOpts {
  enabled: boolean; mark: 'image' | 'wordmark' | 'svg'; image: string; bg: 'light' | 'theme';
  text: string; sub: string; logo: string;
  style: 'reveal' | 'draw' | 'pulse'; exit: 'wipe' | 'fade'; minTime: number;
}
/** The logo the loader shows (Design → Logo → Page loader): picture, silver gradient, shine and sizes. */
export interface LogoSpec { src: string; silver: string; shine: string; shineTime: number; size: number; phone: number }
interface Cached { opts: LoaderOpts; ink: string; fg: string; accent: string; img: string; logo?: Partial<LogoSpec> }

const KEY = 'dorma.loader';
const STYLES = ['reveal', 'draw', 'pulse'];
const t0 = performance.now();

const el = (): HTMLElement | null => document.getElementById('loader');

function clean(o: Partial<LoaderOpts> | undefined): LoaderOpts {
  const x = o || {};
  return {
    enabled: x.enabled !== false,
    mark: x.mark === 'wordmark' || x.mark === 'svg' ? x.mark : 'image',
    image: typeof x.image === 'string' ? x.image : '',
    bg: x.bg === 'light' ? 'light' : 'theme',
    text: typeof x.text === 'string' ? x.text.slice(0, 24) : 'DORMA',
    sub: typeof x.sub === 'string' ? x.sub.slice(0, 40) : 'ADVERTISING',
    logo: typeof x.logo === 'string' ? x.logo : '',
    style: STYLES.includes(x.style as string) ? (x.style as LoaderOpts['style']) : 'reveal',
    exit: x.exit === 'fade' ? 'fade' : 'wipe',
    minTime: Math.min(5, Math.max(0, Number(x.minTime) || 0)),
  };
}

/** The loader's logo: Design → Logo → Page loader, using its version for the dark or the white background. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loaderLogo(o: LoaderOpts, cfg?: any): LogoSpec {
  return logoFor(cfg || {}, 'loader', o.bg === 'light' ? 'light' : 'dark');
}
export const imageUrl = (o: LoaderOpts, cfg?: unknown): string => loaderLogo(o, cfg).src;

const okUrl = (u: unknown): u is string => typeof u === 'string' && /^(https:\/\/|\.?\/|data:image\/svg\+xml)/.test(u);

/** Markup for the mark: the logo image, pasted SVG logo, or the wordmark split into letters. */
export function markHtml(o: LoaderOpts, img: string | Partial<LogoSpec> = BUILTIN_LOGO_WHITE): string {
  const spec = typeof img === 'string' ? { src: img } : img;
  const logo = o.mark === 'svg' && o.logo ? sanitizeSvg(o.logo) : '';
  const vars = [spec.size ? `--ld-w:${Math.round(+spec.size)}px` : '', spec.phone ? `--ld-w-ph:${Math.round(+spec.phone)}px` : ''].filter(Boolean).join(';');
  const word = o.mark === 'image'
    ? `<div class="ld-img"${vars ? ` style="${vars}"` : ''}>${logoHtml({ ...spec, size: 0, phone: 0 })}</div>`
    : logo
    ? `<div class="ld-logo">${logo}</div>`
    : `<div class="ld-word" aria-hidden="true">${[...o.text].map((c, i) => `<i style="--i:${i}"><b>${c === ' ' ? '&nbsp;' : esc(c)}</b></i>`).join('')}</div>`;
  return `<div class="ld-mark">${word}<span class="ld-line"></span>${o.sub && o.mark !== 'image' ? `<span class="ld-sub">${esc(o.sub)}</span>` : ''}</div>`;
}

function paint(root: HTMLElement, o: LoaderOpts, colors: { ink: string; fg: string; accent: string } | undefined, img: string | Partial<LogoSpec>): void {
  root.dataset.style = o.style; root.dataset.exit = o.exit; root.dataset.bg = o.bg;
  root.setAttribute('aria-label', [o.text, o.sub].filter(Boolean).join(' ') || 'Loading');
  if (colors) { root.style.setProperty('--ld-bg', colors.ink); root.style.setProperty('--ld-fg', colors.fg); root.style.setProperty('--ld-accent', colors.accent); }
  root.innerHTML = markHtml(o, img);
  // Stroke drawing needs every shape to report the same length.
  root.querySelectorAll('.ld-logo svg *').forEach((s) => s.setAttribute('pathLength', '1'));
}

/** Rebuild the loader from this browser's cache, if the cached settings differ from the default markup. */
export function initLoader(): void {
  const root = el(); if (!root) return;
  let c: Cached | null = null;
  try { c = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { /* blocked storage */ }
  if (!c) return;
  const o = clean(c.opts);
  if (!o.enabled) { root.remove(); return; }
  const L = c.logo && okUrl(c.logo.src) ? c.logo : null;
  paint(root, o, c, L ? { ...L, silver: typeof L.silver === 'string' && /^linear-gradient\([#\w\s.,%()-]+\)$/.test(L.silver) ? L.silver : '' } : okUrl(c.img) ? c.img : BUILTIN_LOGO_WHITE);
}

/** Remember the live settings for the next visit, then fade the loader out once the minimum time has passed. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function finishLoader(cfg: any): void {
  const o = clean(cfg?.loader), t = cfg?.theme || {};
  try { localStorage.setItem(KEY, JSON.stringify({ opts: { ...o, logo: o.logo ? sanitizeSvg(o.logo) : '' }, ink: t.ink, fg: t.fg, accent: t.accent, img: imageUrl(o, cfg), logo: loaderLogo(o, cfg) })); } catch { /* blocked storage */ }
  const root = el(); if (!root) return;
  if (!o.enabled) { root.remove(); return; }
  const wait = Math.max(0, o.minTime * 1000 - (performance.now() - t0));
  setTimeout(() => leave(root, o.exit), wait);
}

function leave(root: HTMLElement, exit: string): void {
  root.dataset.exit = exit; root.classList.add('out');
  const done = (): void => root.remove();
  root.addEventListener('transitionend', done, { once: true });
  setTimeout(done, 1400);
}

/** Studio preview: show the loader with the draft settings for a few seconds. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function previewLoader(cfg: any): void {
  el()?.remove();
  const o = clean(cfg?.loader), t = cfg?.theme || {};
  const root = document.createElement('div'); root.id = 'loader'; root.setAttribute('role', 'status');
  paint(root, o, { ink: t.ink, fg: t.fg, accent: t.accent }, loaderLogo(o, cfg));
  document.body.append(root);
  root.addEventListener('click', () => leave(root, o.exit));
  setTimeout(() => leave(root, o.exit), Math.max(2600, o.minTime * 1000));
}
