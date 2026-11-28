/* ================= CLIENT PROPOSAL SITE (#for/<code>) =================
   Opens one proposal by its code, then renders it with the site's own renderer: the overview and the chosen service
   pages, the same look, modals and flows. The header gets a band with the client's logo, "Prepared for …", the date
   and a link to the full website. An unknown, switched-off or expired proposal shows a short note instead.
   The first open in a visit is counted (editors' own opens never are). */
import './proposals.css';
import { $, h, mediaItem, mediaUrl, logoNode, ui, fmtDate, LANG, setDocLang, applyTheme } from './core';
import { Store, openProposal } from './store';
import { Site, renderSite, SECTIONS, disposePage, closeModal } from './site';
import { buildProposalSite, deviceOf, PR_WORDS, proposalPrint, inLang } from './proposals';

const CACHE = { slug: "", res: null, at: 0, draft: false };
const fullSiteHref = (hash = "") => location.pathname + location.search + (hash ? "#" + hash : "");

/** Search engines: a proposal set to "hide from search engines", and every unavailable proposal, get noindex. */
function robots(index) {
  let m = document.querySelector('meta[name="robots"][data-for]');
  if (index) { if (m) m.remove(); return; }
  if (!m) { m = document.createElement("meta"); m.name = "robots"; m.dataset.for = ""; document.head.append(m); }
  m.content = "noindex, nofollow";
}

function loading() {
  const app = $("#app"); if (!app || app.querySelector(".site-head")) return; // keep the current page while switching
  app.textContent = ""; app.append(h("div", { class: "denied" }, h("div", {}, h("p", { class: "lede", text: "…" }))));
}

async function fetchProposal(slug) {
  const preview = !!(Site.preview && Store.draft);
  if (CACHE.slug === slug && CACHE.res && CACHE.draft === preview && Date.now() - CACHE.at < 5 * 60e3) return CACHE.res;
  loading();
  let first = true; const key = "dorma.opened." + slug;
  try { first = !sessionStorage.getItem(key); sessionStorage.setItem(key, "1"); } catch { /* storage blocked: count it */ }
  let lang = null; try { lang = localStorage.getItem("dorma.lang"); } catch { /* blocked */ }
  const coarse = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  const res = await openProposal(slug, { count: first && !preview, lang, device: deviceOf(innerWidth, coarse) });
  if (res.ok) Object.assign(CACHE, { slug, res, at: Date.now(), draft: preview });
  return res;
}

/** Route: for/<code>[/<page id>[/<section label>]], or for/<code>/pdf[/en|ar] for the printable version. */
async function renderProposal(hash) {
  install();
  const parts = hash.split("/"), slug = (parts[1] || "").toLowerCase();
  const res = await fetchProposal(slug);
  if (location.hash.slice(1) !== hash) return; // the visitor moved on while it loaded
  const base = (Site.preview && Store.draft) || Store.live;
  if (!res.ok) { robots(false); renderSite(unavailableSite(base, slug, res.code), "for/" + slug); return; }
  if (parts[2] === "pdf") { robots(false); renderPrint(base, res, slug, parts[3]); return; }
  robots(res.searchable !== false);
  renderSite(buildProposalSite(base, res.data, res.slug || slug), hash);
}

/** The main site with one extra page: a short note that the proposal can't be opened, and a way to the full site. */
function unavailableSite(cfg, slug, code) {
  const gone = code === "off" || code === "expired", W = PR_WORDS;
  const note = { id: "for/" + slug, title: gone ? W.unavailable : W.missing, nav: false, layout: "cinematic", sections: [
    { id: "pr-gone", type: "hero", num: "", eyebrow: cfg.site.brand || "", title: gone ? W.unavailable : W.missing,
      lede: code === "unreachable" ? { en: "Couldn't load the proposal. Check your connection and try again.", ar: "تعذّر تحميل العرض. تحقّق من الاتصال وحاول مرة أخرى." } : (gone ? W.unavailableText : W.missingText),
      media: "", height: "compact", flowId: "", button: { label: W.fullSite, action: { type: "page", target: cfg.site.homePage || "home" } } }
  ] };
  return { ...cfg, pages: [note, ...(cfg.pages || [])] };
}

/* ---------- the client's logo ---------- */
function clientLogo(cfg, client, cls) {
  const name = client.name || "";
  const m = client.logo ? mediaItem(cfg, client.logo) : null;
  const src = (m && mediaUrl(m)) || client.logoSrc || "";
  const box = h("span", { class: cls + (client.logoBg === "none" ? " bare" : "") });
  if (src) box.append(h("img", { src, alt: name, loading: "eager", decoding: "async" }));
  else box.append(h("b", { text: name }));
  return box;
}

/* Overview opening: the hero with the Dorma and client logos side by side and the date. */
function forCover(cfg, sec, page) {
  const el = SECTIONS.hero(cfg, sec, page);
  const inner = el.querySelector(".inner"); if (!inner) return el;
  el.classList.add("pr-cover");
  const lock = h("div", { class: "pr-lockup", "data-in": "" },
    logoNode(cfg, "header", "hero", { alt: cfg.site.brand || "", cls: "pr-dorma" }),
    h("span", { class: "pr-x", "aria-hidden": "true", text: "×" }),
    clientLogo(cfg, sec.client || {}, "pr-client"));
  inner.prepend(lock);
  const d = fmtDate(sec.date); if (d) lock.after(h("p", { class: "mono pr-date", text: d }));
  return el;
}

/* Header band and footer line on every proposal page (called by renderSite). */
function decorate(cfg, app) {
  const P = cfg.__proposal; if (!P) return;
  const date = fmtDate(P.date);
  document.title = [P.preparedFor, cfg.site.brand].filter(Boolean).join(" · ");
  const head = $(".site-head", app);
  if (head) {
    const bar = h("div", { class: "pr-bar" },
      h("a", { class: "pr-who", href: "#" + P.base }, clientLogo(cfg, P.client, "pr-mini"), h("span", { text: P.preparedFor }), date ? h("span", { class: "mono pr-when", text: date }) : null),
      h("span", { class: "pr-links" },
        P.pdf ? h("a", { class: "pr-full pr-pdf", href: "#" + P.base + "/pdf/" + (cfg.__lang || "en"), text: P.pdf }) : null,
        h("a", { class: "pr-full", href: fullSiteHref(), target: "_blank", rel: "noopener", text: P.fullSite + " ↗" })));
    head.prepend(bar); head.classList.add("has-pr");
  }
  const foot = $(".site-foot", app);
  if (foot) foot.append(h("a", { class: "mono pr-foot", href: fullSiteHref(), target: "_blank", rel: "noopener", text: P.fullSite + " ↗" }));
}
/** Pages and posts that are not part of the proposal open on the full website in a new tab. */
function openOnSite(hash) { const a = h("a", { href: fullSiteHref(hash), target: "_blank", rel: "noopener" }); document.body.append(a); a.click(); a.remove(); }
/* Hooked into the site renderer on first use (not at load: the modules import each other). */
function install() { if (SECTIONS.forCover) return; SECTIONS.forCover = forCover; Site.forDecorate = decorate; Site.forOpen = openOnSite; }

/* ---------- printable version (Save as PDF) ----------
   #for/<code>/pdf/en or /ar: a clean, white, A4 document made for the browser's Print → Save as PDF. A bar at the top
   (hidden when printing) has the language switch, Save as PDF and the way back to the proposal. */
function langsOf(cfg, data) {
  const l = data && data.langs && data.langs !== "site" ? data.langs : (cfg.site && cfg.site.languages) || "en";
  return l === "both" ? ["en", "ar"] : [l === "ar" ? "ar" : "en"];
}
function renderPrint(cfg, res, slug, want) {
  disposePage(); closeModal(true);
  const langs = langsOf(cfg, res.data || {});
  const lang = langs.includes(want) ? want : (langs.includes(LANG.cur) ? LANG.cur : langs[0]);
  LANG.cur = lang; setDocLang(lang);
  applyTheme({ ...cfg, __lang: lang }, { mode: "light" });
  const P = proposalPrint(cfg, res.data, lang);
  const ar = lang === "ar", W = k => inLang(PR_WORDS[k], lang);
  document.title = [P.preparedFor, P.brand].filter(Boolean).join(" · ");
  const img = (id, cls, alt = "") => { const m = id ? mediaItem(cfg, id) : null; const u = m && m.kind !== "video" && m.kind !== "article" ? mediaUrl(m) : ""; return u ? h("img", { class: cls, src: u, alt: alt || inLang(m.alt || m.title || "", lang), loading: "eager", decoding: "async" }) : null; };
  const para = t => String(t || "").split(/\n{2,}/).filter(Boolean).map(x => h("p", { text: x }));
  const app = $("#app"); app.textContent = ""; scrollTo(0, 0);
  const bar = h("div", { class: "pp-bar" },
    h("a", { class: "pp-back", href: "#for/" + slug, text: (ar ? "→ " : "← ") + (ar ? "العودة إلى العرض" : "Back to the proposal") }),
    h("span", { class: "pp-tools" },
      langs.length > 1 ? h("span", { class: "pp-langs", role: "group", "aria-label": "Language" }, ...langs.map(l => h("a", { href: "#for/" + slug + "/pdf/" + l, class: l === lang ? "on" : "", "aria-current": l === lang ? "true" : null, text: l === "ar" ? "العربية" : "English" }))) : null,
      h("button", { class: "pp-print", type: "button", text: W("pdf"), onclick: () => print() })),
    h("p", { class: "pp-tip", text: ar ? "في نافذة الطباعة اختر «حفظ كملف PDF» كوجهة." : "In the print window, choose “Save as PDF” as the destination." }));
  const doc = h("article", { class: "pp-doc", lang, dir: P.dir });
  const coverImg = img(P.cover, "pp-cover-img");
  doc.append(h("section", { class: "pp-cover" },
    h("div", { class: "pr-lockup pp-lockup" }, logoNode(cfg, "header", "light", { alt: P.brand, cls: "pr-dorma" }), h("span", { class: "pr-x", "aria-hidden": "true", text: "×" }), clientLogo(cfg, P.client, "pr-client")),
    h("p", { class: "pp-eyebrow", text: P.preparedFor }),
    h("h1", { text: P.title }),
    P.date ? h("p", { class: "pp-date", text: fmtDate(P.date) }) : null,
    ...para(P.welcome).map(x => { x.className = "pp-lede"; return x; }),
    coverImg));
  if (P.services.length) {
    doc.append(h("section", { class: "pp-toc" }, h("h2", { text: P.servicesTitle }),
      h("ol", {}, ...P.services.map(s => h("li", {}, h("b", { text: s.title }), s.summary ? h("span", { text: s.summary }) : null)))));
  }
  P.services.forEach(s => {
    const sec = h("section", { class: "pp-svc" }, h("h2", { text: s.title }));
    if (s.summary) sec.append(h("p", { class: "pp-lede", text: s.summary }));
    const pic = img(s.media, "pp-svc-img"); if (pic) sec.append(pic);
    s.blocks.forEach(b => {
      const blk = h("div", { class: "pp-block" });
      if (b.eyebrow && b.eyebrow !== b.title) blk.append(h("p", { class: "pp-eyebrow", text: b.eyebrow }));
      if (b.title && b.title !== s.title) blk.append(h("h3", { text: b.title }));
      para(b.text).forEach(x => blk.append(x));
      if (b.items.length) blk.append(h("ul", { class: "pp-items" }, ...b.items.map(it => h("li", {}, it.title ? h("b", { text: it.title }) : null, it.text ? h("span", { text: it.text }) : null))));
      if (blk.childNodes.length) sec.append(blk);
    });
    doc.append(sec);
  });
  if (P.work.length) {
    doc.append(h("section", { class: "pp-work" }, h("h2", { text: P.workTitle }),
      h("div", { class: "pp-work-grid" }, ...P.work.map(w => h("figure", {}, img(w.media, "", w.title), w.title || w.text ? h("figcaption", {}, w.title ? h("b", { text: w.title }) : null, w.text ? h("span", { text: w.text }) : null) : null)))));
  }
  const site = location.origin + location.pathname;
  doc.append(h("section", { class: "pp-close" }, h("h2", { text: P.closing }),
    h("p", {}, P.brand ? h("b", { text: P.brand }) : null),
    P.email ? h("p", {}, h("a", { href: "mailto:" + P.email, text: P.email })) : null,
    h("p", {}, h("a", { href: site + "#for/" + slug, text: (site + "#for/" + slug).replace(/^https?:\/\//, "") }))));
  app.append(h("div", { class: "pp" }, bar, doc));
}

export { renderProposal, robots, ui };
