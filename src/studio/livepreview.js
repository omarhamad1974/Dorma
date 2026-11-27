/* ================= LIVE PREVIEW WINDOW (studio) =================
   A floating window inside the studio that shows the draft site while you edit.
   - It loads this same site in a frame (?dpreview=1, see embed.js) and sends it the draft a moment after each change.
   - It follows what you are editing: the selected page, the section you click on, the carousel, blog post or modal.
   - Drag it by its bar, resize it from the corner, minimise it, switch between computer and phone width,
     or dock it beside the studio on wide screens. On phones it opens as a sheet from the bottom.
   - Where it sits, its size and its settings are kept in this browser only (localStorage "dorma.livePreview").
   Nothing is sent while the window is closed or minimised, so editing stays as fast as before. */
/* A small element helper of its own, so this file loads without the rest of the studio (and can be tested alone). */
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'text') el.textContent = v; else if (k === 'html') el.innerHTML = v;
    else if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  kids.flat().forEach((c) => { if (c != null && c !== false) el.append(c); });
  return el;
}

const KEY = 'dorma.livePreview';
/** The width the site is laid out at inside the window, before it is scaled down to fit. */
export const DEVICE_W = { desktop: 1280, phone: 390 };
export const LP_DEFAULT = { open: false, mode: 'float', device: 'desktop', sheetDevice: 'phone', min: false, follow: true, x: -1, y: -1, w: 440, h: 320, splitW: 560 };
export const LP_LIMITS = { minW: 260, minH: 180, minSplit: 360, splitFrom: 1200, phoneBelow: 900 };

const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
/** Settings read back from this browser, with anything missing or broken replaced by the defaults. */
export function lpState(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  return {
    open: r.open === true,
    mode: r.mode === 'split' ? 'split' : 'float',
    device: r.device === 'phone' ? 'phone' : 'desktop',
    sheetDevice: r.sheetDevice === 'desktop' ? 'desktop' : 'phone', // on a phone the preview starts at phone width
    min: r.min === true,
    follow: r.follow !== false,
    x: num(r.x, -1), y: num(r.y, -1),
    w: Math.max(LP_LIMITS.minW, num(r.w, LP_DEFAULT.w)), h: Math.max(LP_LIMITS.minH, num(r.h, LP_DEFAULT.h)),
    splitW: Math.max(LP_LIMITS.minSplit, num(r.splitW, LP_DEFAULT.splitW)),
  };
}

/** Keeps the floating window inside the screen. A new window (x = -1) starts at the bottom right. */
export function clampBox(s, vw, vh, margin = 12) {
  const w = Math.min(Math.max(LP_LIMITS.minW, s.w), Math.max(LP_LIMITS.minW, vw - margin * 2));
  const hh = Math.min(Math.max(LP_LIMITS.minH, s.h), Math.max(LP_LIMITS.minH, vh - margin * 2));
  let x = s.x < 0 ? vw - w - margin - 8 : s.x, y = s.y < 0 ? vh - hh - margin - 8 : s.y;
  x = Math.min(Math.max(margin, x), Math.max(margin, vw - w - margin));
  y = Math.min(Math.max(margin, y), Math.max(margin, vh - 44 - margin)); // the bar always stays reachable
  return { ...s, x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(hh) };
}

/** The docked width on a wide screen: never more than half the screen, never less than the minimum. */
export const splitWidth = (w, vw) => Math.round(Math.min(Math.max(LP_LIMITS.minSplit, w), Math.max(LP_LIMITS.minSplit, vw * 0.5)));

/** How the site is scaled to fit: laid out at the device width, shrunk (never enlarged) to the window. */
export function fitFrame(boxW, boxH, device) {
  const V = DEVICE_W[device] || DEVICE_W.desktop, scale = Math.min(1, boxW / V);
  return { width: V, height: Math.ceil(boxH / scale), scale, left: Math.max(0, Math.round((boxW - V * scale) / 2)) };
}

/** What the preview should show for the studio tab being edited. null fields mean "leave it where it is". */
export function previewTarget(D, panel, sel = {}, focusSec = '') {
  const pages = (D && D.pages) || [];
  const pageOf = (secId) => pages.find((p) => (p.sections || []).some((s) => s.id === secId));
  if (panel === 'pages') {
    const p = pages.find((x) => x.id === sel.pages) || pages[0]; if (!p) return { page: null, sec: null, modal: null };
    const sec = focusSec && (p.sections || []).some((s) => s.id === focusSec) ? focusSec : null;
    return { page: p.id, sec, modal: null };
  }
  if (panel === 'carousels') {
    const p = sel.carousels ? pageOf(sel.carousels) : pages.find((x) => (x.sections || []).some((s) => s.type === 'heroCarousel'));
    const sec = p && sel.carousels && pageOf(sel.carousels) === p ? sel.carousels : null;
    return { page: p ? p.id : null, sec, modal: null };
  }
  if (panel === 'blog') {
    const post = ((D && D.posts) || []).find((x) => x.id === sel.blog);
    return { page: post ? 'post/' + (post.slug || post.id) : null, sec: null, modal: null };
  }
  if (panel === 'modals') return { page: null, sec: null, modal: sel.modals || null };
  return { page: null, sec: null, modal: null };
}

const IC = {
  pv: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2"/><rect x="11" y="10" width="8" height="5" rx="1"/><path d="M8 21h8"/></svg>',
  desk: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></svg>',
  follow: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
  reload: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.4-5.7L20 8.6"/><path d="M20 4v4.6h-4.6"/></svg>',
  dock: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M14 4v16"/></svg>',
  float: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><rect x="11" y="11" width="7" height="6" rx="1"/></svg>',
  min: '<svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg>',
  max: '<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>',
  x: '<svg viewBox="0 0 16 16"><path d="M3 3l10 10M13 3 3 13"/></svg>',
};

function load() { try { return lpState(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch { return lpState(null); } }
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage blocked */ } }

/**
 * Adds the live preview to the studio.
 * @param {HTMLElement} root  the studio (.adm); the window lives inside it, so it goes away with the studio
 * @param {{ draft: () => any, where: () => { panel: string, sel: object }, onChange?: () => void }} api
 * @returns {{ toggle(): void, changed(): void, isOpen(): boolean }}
 */
export function mountLivePreview(root, api) {
  let S = load(), ready = false, sentCfg = '', sentGo = '', focusSec = '', timer = 0;
  const phoneMq = matchMedia(`(max-width:${LP_LIMITS.phoneBelow}px)`);
  const layout = () => (phoneMq.matches ? 'sheet' : S.mode === 'split' && innerWidth >= LP_LIMITS.splitFrom ? 'split' : 'float');

  const frame = h('iframe', { class: 'lp-frame', title: 'Live preview of the draft site', tabindex: '0' });
  const stage = h('div', { class: 'lp-stage' }, frame);
  const btn = (cls, title, icon, onclick) => h('button', { class: 'lp-b ' + cls, type: 'button', title, 'aria-label': title, html: icon, onclick });
  const devKey = () => (layout() === 'sheet' ? 'sheetDevice' : 'device'), dev = () => S[devKey()];
  const bDesk = btn('dev', 'Computer width', IC.desk, () => set({ [devKey()]: 'desktop' }));
  const bPhone = btn('dev', 'Phone width', IC.phone, () => set({ [devKey()]: 'phone' }));
  const bFollow = btn('fol', 'Follow what I edit', IC.follow, () => { set({ follow: !S.follow }); if (S.follow) schedule(0); });
  const bDock = btn('dock', '', IC.dock, () => set({ mode: S.mode === 'split' ? 'float' : 'split', min: false }));
  const bMin = btn('min', '', IC.min, () => set({ min: !S.min }));
  const title = h('span', { class: 'lp-t' }, h('i'), 'Live preview', h('small', { text: 'Draft' }));
  const bar = h('div', { class: 'lp-bar' }, title,
    h('span', { class: 'lp-tools' }, bDesk, bPhone, bFollow, btn('rel', 'Reload the preview', IC.reload, reload), bDock, bMin, btn('cls', 'Close the preview', IC.x, () => set({ open: false }))));
  const grip = h('span', { class: 'lp-resize', title: 'Drag to resize', 'aria-hidden': 'true' });
  const edge = h('span', { class: 'lp-edge', title: 'Drag to change the width', 'aria-hidden': 'true' });
  const win = h('section', { class: 'lp', 'aria-label': 'Live preview' }, bar, stage, grip, edge);
  const fab = h('button', { class: 'lp-fab', type: 'button', html: IC.pv + '<span>Preview</span>', 'aria-label': 'Open the live preview', onclick: () => set({ open: true, min: false }) });
  root.append(win, fab);

  const active = () => win.isConnected && S.open && !S.min;
  function send(msg) { if (frame.contentWindow) frame.contentWindow.postMessage(msg, location.origin); }
  function push(force) {
    if (!ready || !active()) return;
    const D = api.draft(); if (!D) return;
    const cfg = JSON.stringify(D);
    const w = api.where(), t = previewTarget(D, w.panel, w.sel, focusSec), go = JSON.stringify(t);
    const msg = { type: 'dorma:preview' };
    if (force || cfg !== sentCfg) { msg.cfg = D; sentCfg = cfg; }
    if (S.follow && (force || go !== sentGo)) { msg.go = t; sentGo = go; }
    if (msg.cfg || msg.go) send(msg);
  }
  function schedule(ms = 450) { if (!active()) return; clearTimeout(timer); timer = setTimeout(() => push(false), ms); }
  function reload() { ready = false; sentCfg = ''; sentGo = ''; frame.src = location.origin + location.pathname + '?dpreview=1#' + ((api.draft() || {}).site?.homePage || ''); }
  const onMsg = (e) => {
    if (!win.isConnected) { removeEventListener('message', onMsg); return; }
    if (e.origin !== location.origin || e.source !== frame.contentWindow || !e.data || e.data.type !== 'dorma:ready') return;
    ready = true; sentCfg = ''; sentGo = ''; push(true);
  };
  addEventListener('message', onMsg);

  function fit() {
    const r = stage.getBoundingClientRect(); if (!r.width || !r.height) return;
    const f = fitFrame(r.width, r.height, dev());
    Object.assign(frame.style, { width: f.width + 'px', height: f.height + 'px', transform: `scale(${f.scale})`, left: f.left + 'px' });
  }
  new ResizeObserver(() => fit()).observe(stage);

  function apply() {
    const L = layout();
    win.dataset.layout = L; win.dataset.device = dev();
    win.hidden = !S.open; fab.hidden = S.open || L !== 'sheet';
    win.classList.toggle('is-min', S.min && L !== 'sheet');
    bDesk.setAttribute('aria-pressed', String(dev() === 'desktop')); bPhone.setAttribute('aria-pressed', String(dev() === 'phone'));
    bFollow.setAttribute('aria-pressed', String(S.follow)); bFollow.title = S.follow ? 'Following what you edit. Tap to stay on this page' : 'Staying on this page. Tap to follow what you edit';
    bDock.hidden = L === 'sheet' || innerWidth < LP_LIMITS.splitFrom;
    bDock.innerHTML = S.mode === 'split' ? IC.float : IC.dock; bDock.title = S.mode === 'split' ? 'Float the preview' : 'Show the preview beside the studio'; bDock.setAttribute('aria-label', bDock.title);
    bMin.hidden = L === 'sheet'; bMin.innerHTML = S.min ? IC.max : IC.min; bMin.title = S.min ? 'Restore the preview' : 'Minimise the preview'; bMin.setAttribute('aria-label', bMin.title);
    root.classList.toggle('lp-split', S.open && L === 'split');
    if (L === 'split') { const w = splitWidth(S.splitW, innerWidth); root.style.setProperty('--lp-w', w + 'px'); Object.assign(win.style, { left: '', top: '', width: '', height: '' }); }
    else if (L === 'float') { const b = clampBox(S, innerWidth, innerHeight); Object.assign(win.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: S.min ? '' : b.h + 'px' }); }
    else Object.assign(win.style, { left: '', top: '', width: '', height: '' });
    if (S.open && !frame.getAttribute('src')) reload(); // the frame only loads once the preview is first opened
    fit();
    if (active()) schedule(0);
  }
  function set(patch) { const was = S.open; S = { ...S, ...patch }; save(S); apply(); if (was !== S.open && api.onChange) api.onChange(); }

  /* Dragging the bar moves the window; the corner resizes it; the left edge sets the docked width.
     The frame ignores the pointer while dragging, so the drag isn't lost over it. */
  function drag(el, onMove, ok = () => true) {
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || !ok(e)) return;
      e.preventDefault(); el.setPointerCapture(e.pointerId); win.classList.add('dragging');
      const start = { x: e.clientX, y: e.clientY, s: { ...S, ...clampBox(S, innerWidth, innerHeight) } };
      const move = (ev) => onMove(ev.clientX - start.x, ev.clientY - start.y, start.s);
      const up = () => { el.removeEventListener('pointermove', move); win.classList.remove('dragging'); save(S); };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up, { once: true }); el.addEventListener('pointercancel', up, { once: true });
    });
  }
  drag(bar, (dx, dy, s) => { S = { ...S, x: s.x + dx, y: s.y + dy }; apply(); }, (e) => layout() === 'float' && !e.target.closest('button'));
  drag(grip, (dx, dy, s) => { S = { ...S, w: s.w + dx, h: s.h + dy }; apply(); }, () => layout() === 'float' && !S.min);
  drag(edge, (dx, dy, s) => { S = { ...S, splitW: splitWidth(s.splitW - dx, innerWidth) }; apply(); }, () => layout() === 'split');
  bar.addEventListener('dblclick', (e) => { if (layout() === 'float' && !e.target.closest('button')) set({ min: !S.min }); });

  /* Follow the section being edited: any click inside a section's editor points the preview at that section. */
  root.addEventListener('click', (e) => {
    if (win.contains(e.target)) return;
    const s = e.target.closest && e.target.closest('[data-sec]'); if (s && root.contains(s) && !s.closest('.site-nav')) focusSec = s.dataset.sec;
    schedule(250);
  });
  const onResize = () => { if (!win.isConnected) { removeEventListener('resize', onResize); return; } apply(); };
  addEventListener('resize', onResize);
  phoneMq.addEventListener('change', () => { if (win.isConnected) apply(); });
  apply();

  return {
    toggle() { set({ open: !S.open, min: false }); },
    changed() { schedule(); },
    panelChanged() { focusSec = ''; schedule(150); },
    isOpen: () => S.open,
  };
}
