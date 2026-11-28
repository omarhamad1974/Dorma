/* ================= SITE CONNECTIONS (pure) =================
   Everything on the site that opens something else: the menu, buttons, cards, flow items, and sections or modals
   that show a flow. Used by Studio › Outline › Connections. No DOM, so it is tested (tests/connections.test.ts).

   A link:  { id, from:{ where, go, hidden, group, groupGo }, kind, label, type, target, section, flowItems, status, note }
   - type: page | modal | post | doc | url | slide | flow
   - status: "ok" | "broken" (target gone) | "empty" (nothing chosen) | "warn" (e.g. unpublished post)
   - go: where it is edited in the studio, the shape goToSlot() takes ({ panel, sel, section }) */
import { locate, urlOk } from './health';

const ACTION_TYPES = new Set(["modal", "page", "post", "doc", "slide", "url"]);
const isTx = v => !!v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0 && Object.keys(v).every(k => k === "en" || k === "ar");
const P = v => isTx(v) ? (String(v.en ?? "").trim() ? v.en : (v.ar ?? "")) : (v == null ? "" : String(v));
const PARTS = ["site", "menu", "pages", "modals", "flows", "posts"];
const TYPE_NAME = { page: "Page", modal: "Modal", post: "Blog post", doc: "Article", url: "Link", slide: "Slide", flow: "Flow" };

function walk(v, path, fn){
  if (!v || typeof v !== "object") return;
  fn(v, path);
  if (Array.isArray(v)) v.forEach((x, i) => walk(x, [...path, { k: i, v: x }], fn));
  else Object.keys(v).forEach(k => walk(v[k], [...path, { k, v: v[k] }], fn));
}

/** Names and studio places of everything a link can point at. */
function targets(cfg){
  const t = new Map();
  const put = (type, id, name, go, extra = {}) => t.set(type + ":" + id, { type, id, name: name || id, go, ...extra });
  (cfg.pages || []).forEach(p => p && put("page", p.id, P(p.title), { panel: "pages", sel: p.id }, { nav: !!p.nav, home: p.id === (cfg.site || {}).homePage }));
  (cfg.modals || []).forEach(m => m && put("modal", m.id, P(m.name) || P(m.title), { panel: "modals", sel: m.id }));
  (cfg.posts || []).forEach(p => p && put("post", p.id, P(p.title) || p.slug, { panel: "blog", sel: p.id }, { published: !!p.published }));
  (cfg.media || []).filter(m => m && m.kind === "article").forEach(m => put("doc", m.id, P(m.label), { panel: "media", sel: m.id }));
  (cfg.flows || []).forEach(f => f && put("flow", f.id, P(f.name), { panel: "flows", sel: f.id }));
  return t;
}

/** The group a place belongs to (its page, modal, flow…), from the first part of locate().where. */
function groupOf(at){ const first = String(at.where || "").split(" › ")[0] || "Site"; return first; }
function groupGo(at){ return { ...(at.go || {}), section: undefined }; }

function linkStatus(T, type, target){
  const t = String(target ?? "").trim();
  if (type === "slide") return t ? ["ok", ""] : ["empty", "No slide number"];
  if (type === "url") return !t ? ["empty", "No web address"] : urlOk(t) ? ["ok", ""] : ["warn", "This address doesn't look right"];
  if (!t) return ["empty", "Nothing chosen yet"];
  const x = T.get(type + ":" + t);
  if (!x) return ["broken", TYPE_NAME[type] + " “" + t + "” no longer exists"];
  if (type === "post" && !x.published) return ["warn", "Blog post isn't published"];
  return ["ok", ""];
}

/** Every link on the site, in the order the settings hold them. */
function collectLinks(cfg){
  const T = targets(cfg), out = [];
  let n = 0;
  PARTS.forEach(part => walk(cfg[part], [{ k: part, v: cfg[part] }], (o, path) => {
    if (Array.isArray(o)) return;
    const last = path[path.length - 1], parent = path.length > 1 ? path[path.length - 2].v : null;
    /* a section, slide or modal that shows a flow */
    for (const key of ["flowId"]) {
      if (typeof o[key] === "string" && o[key]) {
        const at = locate(cfg, path), [status, note] = linkStatus(T, "flow", o[key]);
        out.push({ id: "c" + (++n), from: { ...at, group: groupOf(at), groupGo: groupGo(at) }, kind: "Shows flow", label: "", type: "flow", target: o[key], section: "", status, note });
      }
    }
    if (o.flowUnder && typeof o.flowUnder === "object" && o.flowUnder.flowId){
      const at = locate(cfg, path), [status, note] = linkStatus(T, "flow", o.flowUnder.flowId);
      out.push({ id: "c" + (++n), from: { ...at, group: groupOf(at), groupGo: groupGo(at) }, kind: "Flow under it", label: "", type: "flow", target: o.flowUnder.flowId, section: "", status, note });
    }
    /* an action: {type, target} */
    if (!("target" in o) || typeof o.type !== "string" || !ACTION_TYPES.has(o.type)) return;
    const at = locate(cfg, path), inFlow = path[0] && path[0].k === "flows";
    const owner = last && last.k === "action" && parent ? parent : null;
    const label = owner ? P(owner.label) || P(owner.title) || P(owner.name) || "" : "";
    const kind = inFlow ? "Flow item" : owner && "label" in owner ? "Button" : owner ? "Card or item" : "Link";
    const [status, note] = linkStatus(T, o.type, o.target);
    out.push({ id: "c" + (++n), from: { ...at, group: groupOf(at), groupGo: groupGo(at) }, kind, label, type: o.type, target: String(o.target ?? ""), section: o.section || "", status, note });
  }));
  return out;
}

/** The whole picture: links grouped by where they are, the menu, what opens each page/modal/post/flow, and what nothing opens. */
function connections(cfg){
  const T = targets(cfg), links = collectLinks(cfg);
  const flowLinks = new Map();
  links.filter(l => l.from.go && l.from.go.panel === "flows").forEach(l => { const k = l.from.go.sel; if (!flowLinks.has(k)) flowLinks.set(k, []); flowLinks.get(k).push(l); });
  /* menu: pages shown in the menu, in order */
  const menu = (cfg.pages || []).filter(p => p && p.nav).map(p => ({ id: p.id, name: P(p.title) || p.id, go: { panel: "pages", sel: p.id } }));
  /* groups: one per page, modal, flow, post and the site-wide parts, in that order */
  const groups = new Map();
  const addGroup = (name, go, kind) => { if (!groups.has(name)) groups.set(name, { name, go, kind, links: [] }); return groups.get(name); };
  addGroup("Site and titles", { panel: "site" }, "site");
  (cfg.pages || []).forEach(p => p && addGroup("Page: " + (P(p.title) || p.id), { panel: "pages", sel: p.id }, "page"));
  (cfg.modals || []).forEach(m => m && addGroup("Modal: " + (P(m.name) || P(m.title) || m.id), { panel: "modals", sel: m.id }, "modal"));
  (cfg.flows || []).forEach(f => f && addGroup("Flow: " + (P(f.name) || f.id), { panel: "flows", sel: f.id }, "flow"));
  links.forEach(l => addGroup(l.from.group, l.from.groupGo, "other").links.push(l));
  /* reverse: everything that opens each target */
  const into = new Map();
  T.forEach((t, k) => into.set(k, { ...t, key: k, from: [], inMenu: t.type === "page" && t.nav, isHome: !!t.home }));
  links.forEach(l => { const x = into.get(l.type + ":" + l.target); if (x) x.from.push(l); });
  const reverse = [...into.values()].filter(x => x.type !== "doc" || x.from.length);
  /* published posts are listed by any shown Blog posts section, so they are reachable without a button */
  const blogList = (cfg.pages || []).some(p => p && (p.sections || []).some(s => s && s.type === "blog" && !s.hidden));
  reverse.forEach(x => { x.listed = x.type === "post" && blogList && x.published; x.orphan = !x.from.length && !x.inMenu && !x.isHome && !x.listed; });
  const problems = links.filter(l => l.status !== "ok");
  return { links, menu, groups: [...groups.values()], reverse, problems, flowLinks, targets: T };
}

/** A line of text for searching a link. */
const linkText = (l, T) => [l.from.where, l.kind, l.label, TYPE_NAME[l.type], l.target, (T.get(l.type + ":" + l.target) || {}).name, l.note].join(" ").toLowerCase();

export { connections, collectLinks, targets, linkText, TYPE_NAME };
