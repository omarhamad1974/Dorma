/* ================= CLIENT PROPOSAL SITE (#for/<code>) =================
   Opens one proposal by its code, then renders it with the site's own renderer: the overview and the chosen service
   pages, the same look, modals and flows. The header gets a band with the client's logo, "Prepared for …", the date
   and a link to the full website. An unknown, switched-off or expired proposal shows a short note instead.
   The first open in a visit is counted (editors' own opens never are). */
import './proposals.css';
import { $, h, mediaItem, mediaUrl, logoNode, ui, fmtDate } from './core';
import { Store, openProposal } from './store';
import { Site, renderSite, SECTIONS } from './site';
import { buildProposalSite, deviceOf, PR_WORDS } from './proposals';

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

/** Route: for/<code>[/<page id>[/<section label>]] */
async function renderProposal(hash) {
  install();
  const slug = (hash.split("/")[1] || "").toLowerCase();
  const res = await fetchProposal(slug);
  if (location.hash.slice(1) !== hash) return; // the visitor moved on while it loaded
  const base = (Site.preview && Store.draft) || Store.live;
  if (!res.ok) { robots(false); renderSite(unavailableSite(base, slug, res.code), "for/" + slug); return; }
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
      h("a", { class: "pr-full", href: fullSiteHref(), target: "_blank", rel: "noopener", text: P.fullSite + " ↗" }));
    head.prepend(bar); head.classList.add("has-pr");
  }
  const foot = $(".site-foot", app);
  if (foot) foot.append(h("a", { class: "mono pr-foot", href: fullSiteHref(), target: "_blank", rel: "noopener", text: P.fullSite + " ↗" }));
}
/** Pages and posts that are not part of the proposal open on the full website in a new tab. */
function openOnSite(hash) { const a = h("a", { href: fullSiteHref(hash), target: "_blank", rel: "noopener" }); document.body.append(a); a.click(); a.remove(); }
/* Hooked into the site renderer on first use (not at load: the modules import each other). */
function install() { if (SECTIONS.forCover) return; SECTIONS.forCover = forCover; Site.forDecorate = decorate; Site.forOpen = openOnSite; }

export { renderProposal, robots, ui };
