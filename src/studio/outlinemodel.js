/* ================= SITE OUTLINE · MODEL =================
   Pure helpers behind Studio › Outline: no DOM, so they can be tested.
   They change the draft in place (pages and their sections) and keep an undo history. */

const keyOf = v => String(v && typeof v === "object" ? (v.en ?? v.ar ?? "") : (v ?? "")).trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-+|-+$/g,"");

/** Every button/link action in the settings object: anything shaped like {type:"page", target}. */
function eachAction(cfg, fn){
  const seen = new Set();
  const walk = v => {
    if (!v || typeof v !== "object" || seen.has(v)) return; seen.add(v);
    if (Array.isArray(v)){ v.forEach(walk); return; }
    if (v.type === "page" && typeof v.target === "string") fn(v);
    Object.values(v).forEach(walk);
  };
  walk(cfg);
}

/** How many buttons open this page (or travel to one labelled section on it). Pages themselves are not counted. */
function linksTo(cfg, pageId, sectionLabel){
  const want = sectionLabel ? keyOf(sectionLabel) : "";
  let n = 0;
  eachAction(cfg, a => { if (a.target !== pageId) return; if (!want || keyOf(a.section) === want) n++; });
  return n;
}

/** A page address not used yet: base, base-2, base-3… */
function freeId(pages, base){
  const b = String(base || "page").toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"") || "page";
  if (!pages.some(p => p.id === b)) return b;
  let n = 2; while (pages.some(p => p.id === b + "-" + n)) n++;
  return b + "-" + n;
}

const copyJson = v => JSON.parse(JSON.stringify(v));
const withCopyTitle = t => t && typeof t === "object"
  ? Object.fromEntries(Object.entries(t).map(([k,v]) => [k, v ? v + (k === "ar" ? " (نسخة)" : " (copy)") : v]))
  : (t || "Page") + " (copy)";

/** A copy of a section with a fresh id (and a label that doesn't clash with the original). */
function copySection(s, newId){
  const c = copyJson(s); c.id = newId();
  if (c.anchor) c.anchor = keyOf(c.anchor) + "-copy";
  return c;
}

/** Duplicates a page right after the original. The copy gets its own address, is left out of the menu, and every section gets a new id. */
function duplicatePage(cfg, page, newId){
  const c = copyJson(page);
  c.id = freeId(cfg.pages, page.id + "-copy");
  c.title = withCopyTitle(page.title);
  c.nav = false;
  c.sections = (c.sections || []).map(s => ({ ...s, id: newId() }));
  cfg.pages.splice(cfg.pages.indexOf(page) + 1, 0, c);
  return c;
}

/** Duplicates a section right below the original. */
function duplicateSection(page, s, newId){
  const c = copySection(s, newId);
  page.sections.splice(page.sections.indexOf(s) + 1, 0, c);
  return c;
}

/** Moves an item inside an array by d places (−1 up, +1 down). Returns false at the edge. */
function nudge(arr, item, d){
  const i = arr.indexOf(item), j = i + d;
  if (i < 0 || j < 0 || j >= arr.length) return false;
  arr.splice(i, 1); arr.splice(j, 0, item); return true;
}

/** Moves a section to another page (or another place on the same page). */
function moveSection(cfg, fromPageId, fromIndex, toPageId, toIndex){
  const from = cfg.pages.find(p => p.id === fromPageId), to = cfg.pages.find(p => p.id === toPageId);
  if (!from || !to || fromIndex < 0 || fromIndex >= (from.sections || []).length) return null;
  const [s] = from.sections.splice(fromIndex, 1);
  to.sections = to.sections || [];
  to.sections.splice(Math.max(0, Math.min(toIndex, to.sections.length)), 0, s);
  return s;
}

/** Removes a page. The home page can't be removed. */
function deletePage(cfg, page){
  if (!page || page.id === cfg.site.homePage) return false;
  const i = cfg.pages.indexOf(page); if (i < 0) return false;
  cfg.pages.splice(i, 1); return true;
}

/** Counts for the summary line. */
function outlineStats(cfg){
  const pages = cfg.pages || [];
  const secs = pages.flatMap(p => p.sections || []);
  return { pages: pages.length, inMenu: pages.filter(p => p.nav).length, sections: secs.length, hidden: secs.filter(s => s.hidden).length };
}

/* ---------- undo ----------
   Each step keeps the pages (and home page) as they were before and after the change.
   Undo only runs while the pages still look exactly as this tab left them, so it never
   throws away edits made somewhere else in the studio. */
const snapPages = cfg => JSON.stringify({ pages: cfg.pages, home: cfg.site.homePage });

function makeHistory(limit = 30){
  const steps = [];
  return {
    get size(){ return steps.length; },
    get label(){ return steps.length ? steps[steps.length - 1].label : ""; },
    /** Runs change(); if it returned anything but false, remembers how to undo it. */
    record(cfg, label, change){
      const before = snapPages(cfg);
      const out = change();
      if (out === false) return out;
      const after = snapPages(cfg);
      if (after !== before){ steps.push({ label, before, after }); if (steps.length > limit) steps.shift(); }
      return out;
    },
    /** True when the newest step can still be undone safely. Clears the history when the pages changed elsewhere. */
    valid(cfg){
      if (!steps.length) return false;
      if (steps[steps.length - 1].after !== snapPages(cfg)){ steps.length = 0; return false; }
      return true;
    },
    undo(cfg){
      if (!this.valid(cfg)) return "";
      const s = steps.pop(), v = JSON.parse(s.before);
      cfg.pages.splice(0, cfg.pages.length, ...v.pages);
      cfg.site.homePage = v.home;
      return s.label;
    },
    clear(){ steps.length = 0; }
  };
}

export { keyOf, linksTo, freeId, copySection, duplicatePage, duplicateSection, nudge, moveSection, deletePage, outlineStats, makeHistory };
