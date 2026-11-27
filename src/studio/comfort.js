/* ================= STUDIO READING COMFORT =================
   Makes long studio screens easier to move around, for the editor only (never the public site):
   - every card ("group") folds open and closed; the state is remembered in this browser,
     and rarely used groups start folded
   - Open all / Close all, and Find: a jump list of the groups on screen plus a search over
     field names, items and groups
   - studio text size (A− / A+), saved in this browser; only applied while the studio is on screen
   - a pager used by long lists (pages, flows, blog, library…)
   Pure helpers are exported for tests; the DOM parts only run in the studio. */
/* Own small element builder, so this file loads without the rest of the studio (tests run it in Node). */
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v; else if (k === 'text') el.textContent = String(v); else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}

const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };

/* ---------- text size ---------- */
export const TEXT_KEY = 'dorma.studioText';
export const TEXT_STEPS = [[0.9, 'Small'], [1, 'Normal'], [1.12, 'Large'], [1.25, 'Larger'], [1.4, 'Big'], [1.6, 'Bigger'], [1.8, 'Very large'], [2, 'Huge']];
/** Index of a saved scale in TEXT_STEPS (Normal for anything unknown). */
export const textStep = v => { const i = TEXT_STEPS.findIndex(s => s[0] === +v); return i < 0 ? 1 : i; };
export const studioText = () => TEXT_STEPS[textStep(read(TEXT_KEY, 1))][0];
/** The scale one step up or down, kept within the steps. */
export const stepText = (v, dir) => TEXT_STEPS[Math.max(0, Math.min(TEXT_STEPS.length - 1, textStep(v) + dir))][0];
export const textPct = v => Math.round(v * 100) + '%';

/** Studio text is set on the root font size, so everything sized in rem grows with it.
    The site never runs at the same time in this page, and the live preview is its own frame. */
export function applyStudioText(v = studioText()) {
  const r = document.documentElement;
  r.dataset.studioText = String(v);
  r.classList.toggle('studio-big', v >= 1.25); // long button labels may wrap at big sizes
  if (v === 1) r.style.removeProperty('font-size'); else r.style.fontSize = (v * 100) + '%';
  document.dispatchEvent(new CustomEvent('studio-text', { detail: v }));
}
export function setStudioText(v) { write(TEXT_KEY, TEXT_STEPS[textStep(v)][0]); applyStudioText(studioText()); }
/** Leaving the studio for the site: back to the site's own size. */
export function leaveStudioText() {
  const r = document.documentElement; if (!('studioText' in r.dataset)) return;
  delete r.dataset.studioText; r.classList.remove('studio-big'); r.style.removeProperty('font-size');
}

/* ---------- folding groups ---------- */
export const FOLD_KEY = 'dorma.fold';
/** Groups most editors seldom open: they start folded until opened once. */
export const RARE_GROUPS = ['header on this page', 'look', 'animation', 'more button', 'backup', 'published versions', 'added versions',
  'picture optimizing', 'add files on github', 'add by link', 'categories', 'seo', 'templates', 'where this is kept', 'saved styles',
  'silver logo', 'light and dark mode', 'quote requests', 'hashtag sets', 'link back to the site'];
export const normTitle = t => String(t || '').replace(/\s+/g, ' ').trim().toLowerCase();
export const foldKey = (panel, title) => panel + '|' + normTitle(title).slice(0, 80);
export const foldedByDefault = title => { const t = normTitle(title); return RARE_GROUPS.includes(t) || /^import\b/.test(t); };
/** Folded or open: what the editor chose last in this browser, else the default. */
export function isFolded(map, panel, title) { const k = foldKey(panel, title); return map && k in map ? !!map[k] : foldedByDefault(title); }
const foldMap = () => { const m = read(FOLD_KEY, {}); return m && typeof m === 'object' && !Array.isArray(m) ? m : {}; };
function saveFold(panel, title, folded) {
  const m = foldMap(), k = foldKey(panel, title);
  if (folded === foldedByDefault(title)) delete m[k]; else m[k] = folded ? 1 : 0;
  const keys = Object.keys(m); if (keys.length > 400) keys.slice(0, keys.length - 400).forEach(x => delete m[x]); // keep it small
  write(FOLD_KEY, m);
}

const INTERACTIVE = 'button,a,input,select,textarea,label,.toggle';
/** The words of a group's title, without the buttons that sit in it. */
export function cardTitle(h2) {
  let s = ''; h2.childNodes.forEach(n => { if (n.nodeType === 3) s += n.textContent; else if (n.nodeType === 1 && !n.matches(INTERACTIVE) && !n.classList.contains('fold-btn')) s += ' ' + (n.matches('.grow,span,b,strong,em') ? n.textContent : ''); });
  return s.replace(/\s+/g, ' ').trim();
}
const CHEV = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';

function setFold(card, folded, panel, save) {
  card.classList.toggle('folded', folded);
  const b = card._foldBtn; if (b) { b.setAttribute('aria-expanded', folded ? 'false' : 'true'); b.title = folded ? 'Show this group' : 'Hide this group'; }
  if (save) saveFold(panel, card._foldTitle, folded);
}
function enhanceCard(card, panel) {
  const h2 = card.querySelector(':scope > h2'); card.classList.add('fold'); if (!h2) return;
  const title = cardTitle(h2) || 'Group'; card._foldTitle = title;
  const btn = h('button', { type: 'button', class: 'fold-btn', 'aria-label': 'Show or hide: ' + title, html: CHEV });
  card._foldBtn = btn; h2.prepend(btn);
  const toggle = () => setFold(card, !card.classList.contains('folded'), panel, true);
  h2.addEventListener('click', e => { const t = e.target.closest(INTERACTIVE); if (t && t !== btn) return; toggle(); });
  setFold(card, isFolded(foldMap(), panel, title), panel, false);
}
/** Opens every folded group and closed item around an element, so it can be seen. */
export function revealEl(el, panel) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    if (n.classList.contains('card-a') && n.classList.contains('folded')) setFold(n, false, panel, true);
    if (n.classList.contains('sub-item') && n.classList.contains('closed') && n !== el) n._open?.();
    if (n.tagName === 'DETAILS' && !n.open) n.open = true;
  }
}

/* ---------- paging ---------- */
/** Which slice of a list a page shows (the page is clamped to the ones that exist). */
export function pageInfo(total, size, page) {
  const pages = Math.max(1, Math.ceil(total / size)), p = Math.min(Math.max(0, Math.floor(+page || 0)), pages - 1);
  return { pages, page: p, start: p * size, end: Math.min(total, (p + 1) * size) };
}
/** Page buttons to show: first, last and the ones around the current page, with gaps as "…" (0-based numbers). */
export function pageList(pages, cur) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i);
  const set = new Set([0, pages - 1, cur - 1, cur, cur + 1].filter(i => i >= 0 && i < pages));
  if (cur <= 2) [1, 2, 3].forEach(i => set.add(i)); if (cur >= pages - 3) [pages - 4, pages - 3, pages - 2].forEach(i => set.add(i));
  const out = []; [...set].sort((a, b) => a - b).forEach((n, i, a) => { if (i && n - a[i - 1] > 1) out.push('…'); out.push(n); });
  return out;
}
/** A pager: Previous, page numbers, Next, "21–40 of 120" and Show all / Show pages.
    Returns null when everything fits on one page and Show all is off. */
export function pager({ total, size, page, all = false, noun = 'items', onPage, onAll, compact = false }) {
  if (total <= size) return null;
  const I = pageInfo(total, size, page), box = h('nav', { class: 'pager' + (compact ? ' compact' : ''), 'aria-label': 'Pages of ' + noun });
  if (!all) {
    box.append(h('button', { type: 'button', class: 'pg', disabled: I.page === 0, 'aria-label': 'Previous page', text: '‹', onclick: () => onPage(I.page - 1) }));
    if (!compact) pageList(I.pages, I.page).forEach(n => box.append(n === '…' ? h('span', { class: 'pg-gap', text: '…' }) :
      h('button', { type: 'button', class: 'pg' + (n === I.page ? ' on' : ''), 'aria-current': n === I.page ? 'page' : null, text: String(n + 1), onclick: () => onPage(n) })));
    else box.append(h('span', { class: 'pg-of', text: (I.page + 1) + ' / ' + I.pages }));
    box.append(h('button', { type: 'button', class: 'pg', disabled: I.page === I.pages - 1, 'aria-label': 'Next page', text: '›', onclick: () => onPage(I.page + 1) }));
  }
  box.append(h('span', { class: 'pg-count', text: all ? 'All ' + total + ' ' + noun : (I.start + 1) + '–' + I.end + ' of ' + total }),
    onAll ? h('button', { type: 'button', class: 'pg pg-all', text: all ? 'Show pages' : 'Show all', onclick: () => onAll(!all) }) : null);
  return box;
}

/* ---------- the toolbar and popovers ---------- */
let popEl = null, popAnchor = null;
export function closePop() { if (popEl) { popEl.remove(); popEl = null; } if (popAnchor) { popAnchor.setAttribute('aria-expanded', 'false'); popAnchor = null; } }
function openPop(anchor, content, cls = '') {
  const again = popAnchor === anchor; closePop(); if (again) return null;
  const host = anchor.closest('.adm') || document.body;
  popEl = h('div', { class: 'adm-pop ' + cls, role: 'dialog' }, content); popAnchor = anchor; anchor.setAttribute('aria-expanded', 'true');
  host.append(popEl);
  const place = () => { if (!popEl) return; const r = anchor.getBoundingClientRect(), w = Math.min(popEl.offsetWidth || 320, innerWidth - 16);
    popEl.style.top = Math.round(r.bottom + 6) + 'px'; popEl.style.left = Math.round(Math.max(8, Math.min(innerWidth - w - 8, r.right - w))) + 'px'; };
  place(); requestAnimationFrame(place);
  return popEl;
}
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', e => { if (popEl && !popEl.contains(e.target) && !(popAnchor && popAnchor.contains(e.target))) closePop(); }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && popEl) { const a = popAnchor; closePop(); a && a.focus(); } });
  addEventListener('resize', () => closePop());
}

const IC = {
  find: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></svg>',
  open: '<svg viewBox="0 0 24 24"><path d="M7 9l5 5 5-5M7 4h10M7 20h10"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5M7 4h10M7 20h10"/></svg>',
};

function flash(el) { el.classList.remove('find-hit'); void el.offsetWidth; el.classList.add('find-hit'); setTimeout(() => el.classList.remove('find-hit'), 1800); }
function goTo(el, panel, focus) {
  closePop(); revealEl(el, panel);
  requestAnimationFrame(() => { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); flash(el.closest('.field,.sub-item,.card-a') || el);
    if (focus) { const f = focus.closest('.field'), c = (focus.htmlFor && document.getElementById(focus.htmlFor)) || (f && f.querySelector('input:not([type=hidden]),textarea,select')); if (c) c.focus({ preventScroll: true }); } });
}
/** Everything Find can jump to in the open tab: groups, items and field names. */
export function findTargets(body) {
  const out = [], seen = new Set();
  const groupOf = el => { const c = el.closest('.card-a'); return c ? (c._foldTitle || '') : ''; };
  body.querySelectorAll('.card-a').forEach(c => { if (c._foldTitle && !c.parentElement.closest('.card-a')) out.push({ kind: 'group', label: c._foldTitle, where: '', el: c }); });
  body.querySelectorAll('.sub-item > .sub-head .t').forEach(t => { const it = t.closest('.sub-item'); const l = t.textContent.trim(); if (l) out.push({ kind: 'item', label: l, where: groupOf(it), el: it }); });
  body.querySelectorAll('.field > label, .field > .bi-label, label.toggle').forEach(lab => { if (lab.closest('.bi-row')) return; // English / Arabic boxes are found by the field's own name
    const l = lab.textContent.replace(/\s+/g, ' ').trim(); if (!l) return; const g = groupOf(lab), k = l + '|' + g;
    if (seen.has(k)) return; seen.add(k); out.push({ kind: 'field', label: l, where: g, el: lab.closest('.field') || lab, lab }); });
  return out;
}
export const matches = (label, q) => { const t = normTitle(label); return normTitle(q).split(' ').every(w => t.includes(w)); };

function findBox(body, panel, foldAll) {
  const input = h('input', { type: 'search', class: 'find-in', placeholder: 'Find a setting, item or group…', 'aria-label': 'Find in this tab' });
  const res = h('div', { class: 'find-res', role: 'listbox' });
  const KIND = { group: 'Group', item: 'Item', field: 'Setting' };
  const draw = () => { res.textContent = ''; const q = input.value.trim(), all = findTargets(body);
    const list = q ? all.filter(x => matches(x.label, q)).sort((a, b) => (a.kind === 'group' ? 0 : 1) - (b.kind === 'group' ? 0 : 1)).slice(0, 60) : all.filter(x => x.kind === 'group');
    if (!q) res.append(h('p', { class: 'find-h', text: 'Jump to a group' }));
    if (!list.length) res.append(h('p', { class: 'find-none', text: q ? 'Nothing here matches. Closed items are only searched by their names.' : 'No groups on this tab.' }));
    list.forEach(x => res.append(h('button', { type: 'button', class: 'find-row', role: 'option', onclick: () => goTo(x.el, panel, x.lab) },
      h('span', { class: 'find-k k-' + x.kind, text: KIND[x.kind] }), h('span', { class: 'find-l', text: x.label }),
      x.kind === 'group' ? h('em', { text: x.el.classList.contains('folded') ? 'closed' : '' }) : (x.where ? h('em', { text: x.where }) : null)))); };
  input.addEventListener('input', draw);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { const b = res.querySelector('.find-row'); if (b) { e.preventDefault(); b.click(); } } if (e.key === 'ArrowDown') { const b = res.querySelector('.find-row'); if (b) { e.preventDefault(); b.focus(); } } });
  res.addEventListener('keydown', e => { const b = document.activeElement; if (!b || !b.classList.contains('find-row')) return;
    if (e.key === 'ArrowDown' && b.nextElementSibling) { e.preventDefault(); b.nextElementSibling.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (b.previousElementSibling && b.previousElementSibling.classList.contains('find-row') ? b.previousElementSibling : input).focus(); } });
  draw();
  const row = h('div', { class: 'find-all' },
    h('button', { type: 'button', class: 'btn sm', html: IC.open + 'Open all groups', onclick: () => foldAll(false) }),
    h('button', { type: 'button', class: 'btn sm', html: IC.close + 'Close all', onclick: () => foldAll(true) }));
  return { el: h('div', { class: 'find-box' }, input, row, res), input };
}

function textBox(onChange) {
  const box = h('div', { class: 'text-box' });
  const draw = () => { box.textContent = ''; const cur = studioText();
    box.append(h('p', { class: 'find-h', text: 'Studio text size · only you see it, only in the studio' }),
      h('div', { class: 'text-steps', role: 'radiogroup', 'aria-label': 'Studio text size' }, ...TEXT_STEPS.map(([v, l]) => h('button', { type: 'button', role: 'radio', 'aria-checked': v === cur ? 'true' : 'false', class: 'text-step' + (v === cur ? ' on' : ''), style: 'font-size:' + Math.min(v, 1.6) + 'em',
        onclick: () => { setStudioText(v); onChange(); draw(); } }, h('b', { text: 'A' }), h('span', { text: l + ' · ' + textPct(v) })))),
      h('p', { class: 'hint', style: 'margin:0', text: 'Saved in this browser. The public site keeps its own sizes.' })); };
  draw(); return box;
}

/** The small toolbar next to the tab names: Find, Open all, Close all, A− / size / A+. */
export function comfortTools({ body, panel }) {
  const wrap = h('span', { class: 'adm-tools' });
  const sizeBtn = h('button', { type: 'button', class: 'tl tl-size', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', title: 'Studio text size' });
  const syncSize = () => { sizeBtn.innerHTML = '<b>Aa</b><span>' + textPct(studioText()) + '</span>'; };
  const bump = dir => { setStudioText(stepText(studioText(), dir)); syncSize(); };
  const findBtn = h('button', { type: 'button', class: 'tl', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', title: 'Find a setting or jump to a group (press / )', html: IC.find + '<span>Find</span>' });
  const all = folded => { closePop(); const b = body(), p = panel();
    b.querySelectorAll('.card-a.fold').forEach(c => setFold(c, folded, p, true));
    if (folded) b.querySelectorAll('.sub-item:not(.closed)').forEach(s => s.classList.add('closed')); };
  findBtn.addEventListener('click', () => { const b = findBox(body(), panel(), all); if (openPop(findBtn, b.el, 'pop-find')) b.input.focus(); });
  sizeBtn.addEventListener('click', () => openPop(sizeBtn, textBox(syncSize), 'pop-text'));
  syncSize();
  wrap.append(findBtn,
    h('button', { type: 'button', class: 'tl tl-wide', title: 'Open every group on this tab', html: IC.open + '<span>Open all</span>', onclick: () => all(false) }),
    h('button', { type: 'button', class: 'tl tl-wide', title: 'Close every group and item on this tab', html: IC.close + '<span>Close all</span>', onclick: () => all(true) }),
    h('span', { class: 'tl-sizes', role: 'group', 'aria-label': 'Studio text size' },
      h('button', { type: 'button', class: 'tl tl-a tl-wide', title: 'Smaller studio text', 'aria-label': 'Smaller studio text', html: '<small>A</small>−', onclick: () => bump(-1) }),
      sizeBtn,
      h('button', { type: 'button', class: 'tl tl-a tl-wide', title: 'Bigger studio text', 'aria-label': 'Bigger studio text', html: 'A+', onclick: () => bump(1) })));
  wrap._find = () => findBtn.click();
  return wrap;
}

/* ---------- wiring ---------- */
/** Watches the studio body: folds new groups as they appear and keeps the sticky offset right. */
export function mountComfort(root, { body, panel }) {
  let queued = false;
  const pass = () => { queued = false; const b = body(); if (!b) return; const p = panel(); b.querySelectorAll('.card-a:not(.fold)').forEach(c => enhanceCard(c, p)); };
  const mo = new MutationObserver(() => { if (!queued) { queued = true; queueMicrotask(pass); } });
  mo.observe(root, { childList: true, subtree: true });
  /* Sticky group titles sit just under whatever part of the studio head stays on screen */
  const head = root.querySelector('.adm-head'), sub = root.querySelector('.adm-subtabs');
  const measure = () => { let px = 0;
    if (head && getComputedStyle(head).position === 'sticky') px = head.getBoundingClientRect().height; // on a phone the head scrolls away
    root.style.setProperty('--adm-stick', Math.round(px) + 'px'); };
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null; if (ro) { if (head) ro.observe(head); if (sub) ro.observe(sub); }
  addEventListener('resize', measure); document.addEventListener('studio-text', () => requestAnimationFrame(measure));
  /* "/" opens Find when the editor is not typing */
  const key = e => { if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return; const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const tools = root.querySelector('.adm-tools'); if (!tools || !root.isConnected) return; e.preventDefault(); tools._find(); };
  document.addEventListener('keydown', key);
  measure(); pass();
  return { measure, stop() { mo.disconnect(); ro && ro.disconnect(); removeEventListener('resize', measure); document.removeEventListener('keydown', key); closePop(); } };
}
