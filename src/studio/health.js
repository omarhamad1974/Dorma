/* ================= HEALTH CHECK (pure) =================
   Reads the site settings and lists what needs attention, each with where it is and how to reach it in the studio
   (go = { panel, sel, section }, the same shape the Missing images list uses). Used by studio → Site care → Health
   check and tested in tests/health.test.ts.

   Levels: "error" = something is broken for visitors, "warn" = worth fixing, "info" = good to know.
   Every issue has a stable id, so the editor can ignore it (cfg.health.ignore) and it stays ignored. */
import { SECTION_TYPES, mediaSlots, mediaUsage } from './data';

const isTx = v => !!v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0 && Object.keys(v).every(k => k === "en" || k === "ar");
const blank = x => x == null || (typeof x === "string" && !x.trim()) || (Array.isArray(x) && !x.filter(s => typeof s === "string" ? s.trim() : s).length);
const P = v => isTx(v) ? (blank(v.en) ? (v.ar ?? "") : v.en) : (Array.isArray(v) ? v.join(", ") : String(v ?? ""));
const AR = /[؀-ۿ]/;
const pretty = k => String(k).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, c => c.toUpperCase());
const labelKey = v => String(P(v) ?? "").trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");

const CHECKS = [
  ["links", "Broken links and buttons"],
  ["images", "Missing pictures"],
  ["alt", "Alt text"],
  ["arabic", "Arabic text"],
  ["pages", "Pages nobody can reach"],
  ["files", "Large files"],
  ["settings", "Settings"],
  ["hidden", "Hidden things"],
  ["unused", "Unused library items"]
];
const LEVELS = { error: "Broken", warn: "To fix", info: "Good to know" };
const ACTION_TYPES = new Set(["modal", "page", "post", "doc", "slide", "url"]);
/* Visitor text keys checked for Arabic. Names, codes, prices and links are left alone. */
const TEXT_KEYS = new Set(["title", "eyebrow", "lede", "text", "label", "detail", "excerpt", "body", "caption", "bullets", "quote", "role", "footer", "hint", "summary", "sub", "subtitle", "brief"]);
const FIELD_NAME = { lede: "Short paragraph", text: "Text", title: "Title", eyebrow: "Eyebrow", body: "Text", excerpt: "Summary", detail: "Detail", caption: "Caption", bullets: "Bullet points", quote: "Quote", role: "Role", footer: "Footer", hint: "Note", summary: "Summary", sub: "Subtitle", subtitle: "Subtitle", brief: "Brief" };

/** A web address the site can open: https/http, mailto:, tel:, an in-site #address or a path. */
function urlOk(u) {
  const s = String(u || "").trim();
  if (!s) return false;
  if (/^https?:\/\/[^\s/$.?#][^\s]*$/i.test(s)) { try { new URL(s); return true; } catch { return false; } }
  return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+/i.test(s) || /^tel:\+?[\d\s()-]{5,}$/i.test(s) || /^#\S+/.test(s) || /^\/[^\s]*$/.test(s);
}

/* ---------- walking the settings with a path ---------- */
function sectionName(s) { const T = SECTION_TYPES[s.type]; return P(s.title) || P(s.eyebrow) || (T ? T.label : "Section"); }
const itemName = x => x && typeof x === "object" ? (P(x.title) || P(x.label) || P(x.name) || "") : "";

/** Where a path is in the studio (go) and in words (where), and whether visitors can see it. */
function locate(cfg, path) {
  const [top, ...rest] = path; const words = []; let go = { panel: "site" }, hidden = false;
  const k = top && top.k;
  if (k === "pages" && rest[0]) {
    const p = rest[0].v || {}; words.push("Page: " + (P(p.title) || p.id)); go = { panel: "pages", sel: p.id };
    if (rest[1] && rest[1].k === "sections" && rest[2]) {
      const s = rest[2].v || {}; words.push(sectionName(s)); hidden = hidden || !!s.hidden;
      go = s.type === "heroCarousel" ? { panel: "carousels", sel: s.id } : { panel: "pages", sel: p.id, section: s.id };
      rest.splice(0, 3);
    } else rest.splice(0, 1);
  } else if (k === "modals" && rest[0]) {
    const m = rest[0].v || {}; words.push("Modal: " + (m.name || P(m.title) || m.id)); go = { panel: "modals", sel: m.id };
    if (rest[1] && rest[1].k === "sections" && rest[2]) { const s = rest[2].v || {}; words.push(sectionName(s)); hidden = hidden || !!s.hidden; rest.splice(0, 3); }
    else rest.splice(0, 1);
  } else if (k === "flows" && rest[0]) {
    const f = rest[0].v || {}; words.push("Flow: " + (f.name || f.id)); go = { panel: "flows", sel: f.id }; rest.splice(0, 1);
  } else if (k === "posts" && rest[0]) {
    const p = rest[0].v || {}; words.push("Blog: " + (P(p.title) || p.slug || p.id)); go = { panel: "blog", sel: p.id }; hidden = !p.published; rest.splice(0, 1);
  } else if (k === "media" && rest[0]) {
    const m = rest[0].v || {}; words.push("Library: " + (P(m.label) || m.id)); go = { panel: "media", sel: m.id }; rest.splice(0, 1);
  } else if (k === "site") { words.push("Site and titles"); if (rest[0] && rest[0].k === "logos") go = { panel: "logo" }; }
  else if (k === "menu") words.push("Menu");
  else if (k) words.push(pretty(k));
  rest.forEach(x => {
    if (typeof x.k === "number") { const n = itemName(x.v); if (n) words.push(n); if (x.v && x.v.hidden) hidden = true; }
    else if (!["action", "items", "slides", "sections", "services"].includes(x.k)) words.push(FIELD_NAME[x.k] || pretty(x.k));
  });
  return { go, where: words.join(" › "), hidden };
}

function walk(v, path, fn) {
  if (!v || typeof v !== "object") return;
  if (fn(v, path) === false) return;
  if (Array.isArray(v)) v.forEach((x, i) => walk(x, [...path, { k: i, v: x }], fn));
  else Object.keys(v).forEach(k => walk(v[k], [...path, { k, v: v[k] }], fn));
}
/* Only the parts of the settings visitors see (not the studio's own settings). */
const SITE_PARTS = ["pages", "modals", "flows", "posts", "site", "menu"];

/* ---------- the checks ---------- */
function checkLinks(cfg, add) {
  const pages = new Map((cfg.pages || []).map(p => [p && p.id, p])), modals = new Map((cfg.modals || []).map(m => [m && m.id, m]));
  const posts = new Map((cfg.posts || []).map(p => [p && p.id, p])), docs = new Set((cfg.media || []).filter(m => m && m.kind === "article").map(m => m.id));
  const flows = new Set((cfg.flows || []).map(f => f && f.id));
  const pageLabels = p => new Set((p.sections || []).map(s => labelKey(s.anchor) || s.id));
  const modalLabels = m => new Set(m.type === 5 ? (m.sections || []).map(s => labelKey(s.anchor) || s.id) : m.type === 4 ? (m.services || []).map(s => labelKey(s.anchor || s.title)) : []);
  SITE_PARTS.forEach(part => walk(cfg[part], [{ k: part, v: cfg[part] }], (o, path) => {
    if (Array.isArray(o)) return;
    if (o.hidden && path.length > 1) return false; // hidden sections, slides and items are not shown
    if (typeof o.flowId === "string" && o.flowId && !flows.has(o.flowId)) {
      const at = locate(cfg, path); add({ id: "flow:" + o.flowId + ":" + at.where, check: "links", level: "error", title: "Uses a flow that no longer exists", detail: "Flow “" + o.flowId + "”. Pick another flow or none.", ...at });
    }
    if (!("target" in o) || typeof o.type !== "string" || !ACTION_TYPES.has(o.type)) return;
    const last = path[path.length - 1], parent = path.length > 1 ? path[path.length - 2].v : null;
    if (last && last.k === "action" && parent && "label" in parent && blank(P(parent.label)) && !("media" in parent) && !("title" in parent)) return; // a button with no label isn't shown
    const at = locate(cfg, path), t = String(o.target ?? "").trim(), id = "link:" + o.type + ":" + t + ":" + at.where;
    const issue = (level, title, detail) => add({ id, check: "links", level, title, detail, ...at });
    if (o.type === "url") { if (!t) issue("warn", "“Open link” has no address", "Type the web address, or set the button to Nothing."); else if (!urlOk(t)) issue("warn", "This web address doesn't look right", t); return; }
    if (o.type === "slide") return;
    if (!t) { issue("warn", "No " + { page: "page", modal: "modal", post: "blog post", doc: "article" }[o.type] + " chosen", "The button does nothing until one is picked."); return; }
    if (o.type === "page") {
      const p = pages.get(t); if (!p) { issue("error", "Goes to a page that no longer exists", "Page “" + t + "”."); return; }
      if (o.section && !pageLabels(p).has(o.section)) issue("warn", "Goes to a section label that isn't on the page", "Label “" + o.section + "” on " + (P(p.title) || p.id) + ".");
    } else if (o.type === "modal") {
      const m = modals.get(t); if (!m) { issue("error", "Opens a modal that no longer exists", "Modal “" + t + "”."); return; }
      if (o.section && !modalLabels(m).has(o.section)) issue("warn", "Goes to a section label that isn't in the modal", "Label “" + o.section + "”.");
    } else if (o.type === "post") {
      const p = posts.get(t); if (!p) issue("error", "Opens a blog post that no longer exists", "Post “" + t + "”.");
      else if (!p.published) issue("warn", "Opens a blog post that isn't published", P(p.title) || t);
    } else if (o.type === "doc" && !docs.has(t)) issue("error", "Opens a library article that no longer exists", "Article “" + t + "”.");
  }));
}

/** Every outside web address on the site (buttons, links in text, linked library files), for the optional reachability test. */
function webLinks(cfg) {
  const out = new Map();
  const put = (url, at) => { const u = String(url || "").trim(); if (!/^https?:\/\//i.test(u) || !urlOk(u)) return; if (!out.has(u)) out.set(u, { url: u, where: at.where, go: at.go, count: 0 }); out.get(u).count++; };
  SITE_PARTS.forEach(part => walk(cfg[part], [{ k: part, v: cfg[part] }], (o, path) => {
    if (Array.isArray(o)) { o.forEach((s, i) => { if (typeof s === "string" && s.includes("](")) for (const m of s.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) put(m[1], locate(cfg, [...path, { k: i, v: s }])); }); return; }
    if (o.hidden && path.length > 1) return false;
    if (o.type === "url" && "target" in o) put(o.target, locate(cfg, path));
    Object.keys(o).forEach(k => { const s = o[k]; const strs = typeof s === "string" ? [s] : isTx(s) ? [s.en, s.ar] : [];
      strs.forEach(x => { if (typeof x === "string" && x.includes("](")) for (const m of x.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) put(m[1], locate(cfg, [...path, { k, v: s }])); }); });
  }));
  (cfg.media || []).forEach((m, i) => { if (m && m.ext) put(m.ext, locate(cfg, [{ k: "media", v: cfg.media }, { k: i, v: m }])); });
  return [...out.values()];
}

function checkImages(cfg, add) {
  const slots = mediaSlots(cfg).filter(x => !x.hidden);
  const n = st => slots.filter(x => x.state === st && !(x.optional && st === "empty"));
  slots.filter(x => x.state === "missing").forEach(x => add({ id: "img:missing:" + x.where.join("›"), check: "images", level: "error", title: "Picture removed from the library", detail: "Pick another picture.", where: x.where.join(" › "), go: x.go }));
  const empty = n("empty"), ph = n("placeholder");
  if (empty.length) add({ id: "img:empty", check: "images", level: "warn", title: empty.length + (empty.length === 1 ? " place has" : " places have") + " no picture", detail: "Open Missing images to fill them, one by one or from a category.", where: "Library › Missing images", go: { panel: "missing" }, count: empty.length });
  if (ph.length) add({ id: "img:placeholder", check: "images", level: "info", title: ph.length + (ph.length === 1 ? " place still shows" : " places still show") + " a placeholder scene", detail: "Generated scenes are fine as backgrounds; swap them for real work where it matters.", where: "Library › Missing images", go: { panel: "missing" }, count: ph.length });
}

function checkMedia(cfg, add, usage, langs) {
  const bigKB = Math.max(100, Number(cfg.health && cfg.health.bigFileKB) || 1500);
  (cfg.media || []).forEach((m, i) => {
    if (!m || !m.id) return;
    const used = usage.get(m.id), at = locate(cfg, [{ k: "media", v: cfg.media }, { k: i, v: m }]), name = P(m.label) || m.id;
    if (!used) { if (m.kind !== "scene") add({ id: "unused:" + m.id, check: "unused", level: "info", title: "Not used anywhere", detail: name + (m.category ? " · " + m.category : ""), ...at, media: m.id }); return; }
    if (m.kind === "image" || (!m.kind && !m.embed)) {
      const alt = m.alt;
      if (blank(P(alt)) || (isTx(alt) && blank(alt.en) && langs.includes("en"))) add({ id: "alt:" + m.id, check: "alt", level: "warn", title: "No alt text", detail: name + ". Describe the picture for search engines and screen readers (Library → SEO).", ...at, media: m.id });
      else if (langs.includes("ar") && !(isTx(alt) ? !blank(alt.ar) : AR.test(String(alt || "")))) add({ id: "alt-ar:" + m.id, check: "arabic", level: "warn", title: "Alt text has no Arabic", detail: name, ...at, media: m.id });
    }
    const bytes = Number(m.bytes) || 0;
    if (bytes > bigKB * 1024 && m.kind !== "video") add({ id: "big:" + m.id, check: "files", level: "warn", title: "Large file: " + (bytes / 1048576).toFixed(1) + " MB", detail: name + " is used on the site and makes pages slow on phones. Upload a smaller copy (Library → Picture optimizing does this for new uploads).", ...at, media: m.id });
  });
}

function checkArabic(cfg, add, langs) {
  if (!langs.includes("ar")) return;
  const groups = new Map();
  const need = (v) => {
    if (isTx(v)) return !blank(v.en) && blank(v.ar);
    if (typeof v === "string") return !!v.trim() && !AR.test(v);
    if (Array.isArray(v)) return v.some(s => typeof s === "string" && s.trim()) && !v.some(s => typeof s === "string" && AR.test(s));
    return false;
  };
  const parts = { pages: cfg.pages, modals: cfg.modals, flows: cfg.flows, posts: (cfg.posts || []).filter(p => p && p.published), menu: null };
  const visit = (root, part) => walk(root, [{ k: part, v: root }], (o, path) => {
    if (Array.isArray(o)) return;
    if (o.hidden && path.length > 1) return false;
    if (isTx(o)) return false;
    Object.keys(o).forEach(k => {
      if (!TEXT_KEYS.has(k) || !need(o[k])) return;
      const parentKey = path[path.length - 1] && path[path.length - 1].k;
      if (k === "label" && typeof parentKey === "string" && ["button", "more", "link", "cta"].includes(parentKey) && blank(P(o[k]))) return;
      const at = locate(cfg, path), key = JSON.stringify(at.go) + "|" + at.where.split(" › ").slice(0, 2).join(" › ");
      const field = k === "label" && typeof parentKey === "string" ? (FIELD_NAME[parentKey] || pretty(parentKey)) + " label" : (FIELD_NAME[k] || pretty(k));
      if (!groups.has(key)) groups.set(key, { at: { ...at, where: at.where.split(" › ").slice(0, 2).join(" › ") }, fields: [] });
      const g = groups.get(key); const leaf = at.where.split(" › ").slice(2).concat(field).join(" › ");
      if (!g.fields.includes(leaf)) g.fields.push(leaf);
    });
  });
  Object.entries(parts).forEach(([k, v]) => { if (v) visit(v, k); });
  // the site-wide texts
  const S = cfg.site || {};
  [["footer", S.footer, "Footer"], ["cta", S.cta && S.cta.label, "Header button"]].forEach(([k, v, name]) => {
    if (need(v)) groups.set("site:" + k, { at: { go: { panel: "site" }, where: "Site and titles", hidden: false }, fields: [name] });
  });
  groups.forEach((g, key) => add({ id: "ar:" + key, check: "arabic", level: "warn", title: g.fields.length + (g.fields.length === 1 ? " text has" : " texts have") + " no Arabic", detail: g.fields.slice(0, 6).join(", ") + (g.fields.length > 6 ? " and " + (g.fields.length - 6) + " more" : ""), ...g.at, count: g.fields.length }));
}

function checkPages(cfg, add) {
  const linked = new Set([cfg.site && cfg.site.homePage]);
  SITE_PARTS.forEach(part => walk(cfg[part], [], o => { if (!Array.isArray(o) && o.type === "page" && "target" in o && o.target) linked.add(String(o.target)); }));
  (cfg.pages || []).forEach((p, i) => {
    if (!p || !p.id) return;
    const at = locate(cfg, [{ k: "pages", v: cfg.pages }, { k: i, v: p }]), old = p.nav === false && /-previous/.test(p.id);
    const shown = (p.sections || []).filter(s => s && !s.hidden);
    if (!shown.length) add({ id: "page-empty:" + p.id, check: "pages", level: old ? "info" : "warn", title: "Page has nothing to show", detail: (p.sections || []).length ? "Every section on it is hidden." : "It has no sections yet.", ...at });
    if (p.nav === false && !linked.has(p.id)) add({ id: "orphan:" + p.id, check: "pages", level: old ? "info" : "warn", title: old ? "Old page kept for reference" : "Not in the menu and no button goes to it", detail: old ? "Visitors only reach it by its address." : "Add it to the menu, link a button to it, or remove it.", ...at });
  });
}

function checkHidden(cfg, add) {
  (cfg.pages || []).forEach((p, i) => (p && p.sections || []).forEach((s, j) => {
    if (!s) return;
    const base = [{ k: "pages", v: cfg.pages }, { k: i, v: p }, { k: "sections", v: p.sections }, { k: j, v: s }];
    if (s.hidden) add({ id: "hid:" + p.id + ":" + s.id, check: "hidden", level: "info", title: "Hidden section", detail: "Not shown to visitors.", ...locate(cfg, base), hidden: false });
    else if (s.type === "heroCarousel") (s.slides || []).forEach((x, k) => { if (x && x.hidden) add({ id: "hid-slide:" + s.id + ":" + k, check: "hidden", level: "info", title: "Hidden slide", detail: P(x.title) || "Slide " + (k + 1), ...locate(cfg, base), hidden: false }); });
  }));
  (cfg.posts || []).forEach((p, i) => { if (p && !p.published) add({ id: "draft-post:" + p.id, check: "hidden", level: "info", title: "Blog post not published", detail: "Saved as a draft.", ...locate(cfg, [{ k: "posts", v: cfg.posts }, { k: i, v: p }]), hidden: false }); });
}

function checkSettings(cfg, add) {
  const S = cfg.site || {};
  const hasQuote = (cfg.pages || []).some(p => (p && p.sections || []).some(s => s && s.type === "quote" && !s.hidden)) || (cfg.modals || []).some(m => m && (m.sections || []).some(s => s && s.type === "quote"));
  if (hasQuote && !String(S.quoteEmail || "").trim()) add({ id: "set:quoteEmail", check: "settings", level: "warn", title: "Quote requests have nowhere to go", detail: "Set the email for quote requests under Site and titles.", where: "Site and titles", go: { panel: "site" } });
  if (S.homePage && !(cfg.pages || []).some(p => p && p.id === S.homePage)) add({ id: "set:home", check: "settings", level: "error", title: "The home page doesn't exist", detail: "Choose the home page under Site and titles.", where: "Site and titles", go: { panel: "site" } });
}

/** All issues, newest rules first in each check. ignored = issues the editor chose to ignore. */
function runHealth(cfg) {
  const all = [], seen = new Set();
  const add = x => { if (seen.has(x.id)) { const o = all.find(y => y.id === x.id); if (o) o.count = (o.count || 1) + 1; return; } seen.add(x.id); all.push({ hidden: false, ...x }); };
  const l = cfg && cfg.site && cfg.site.languages, langs = l === "ar" ? ["ar"] : l === "both" ? ["en", "ar"] : ["en"];
  if (!cfg || typeof cfg !== "object") return { issues: [], ignored: [], counts: { error: 0, warn: 0, info: 0 } };
  checkLinks(cfg, add); checkImages(cfg, add); checkMedia(cfg, add, mediaUsage(cfg), langs); checkArabic(cfg, add, langs);
  checkPages(cfg, add); checkSettings(cfg, add); checkHidden(cfg, add);
  const ign = new Set(cfg.health && Array.isArray(cfg.health.ignore) ? cfg.health.ignore : []);
  const visible = all.filter(x => !x.hidden);
  const issues = visible.filter(x => !ign.has(x.id)), ignored = visible.filter(x => ign.has(x.id));
  const counts = { error: 0, warn: 0, info: 0 }; issues.forEach(x => counts[x.level]++);
  return { issues, ignored, counts };
}

export { CHECKS, LEVELS, runHealth, webLinks, urlOk, locate };
