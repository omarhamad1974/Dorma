/* ================= CLIENT PROPOSALS (pure logic) =================
   A proposal is a small site made for one client, at #for/<code>: an overview page ("Prepared for …" with the
   client's logo, the date, a welcome message, a card per service, related work and a contact button) and one page
   per chosen service. Service pages are the main site's own pages (by id), so editing and publishing a service page
   updates every proposal that shows it. Proposals are stored in their own table (see 0005_proposals.sql), never in
   the public site settings. Nothing here touches the page; the site and the studio import these helpers. */

const T = (en = "", ar = "") => ({ en, ar });
const isObj = v => !!v && typeof v === "object" && !Array.isArray(v);
const txOf = v => isObj(v) ? { en: String(v.en ?? ""), ar: String(v.ar ?? "") } : T(typeof v === "string" ? v : "", "");
const plainTx = v => isObj(v) ? (v.en || v.ar || "") : (v || "");
const strs = v => Array.isArray(v) ? v.filter(x => typeof x === "string" && x) : [];

/* Words the client sees around the proposal (each one can be changed per proposal in the studio). */
const PR_WORDS = {
  preparedFor: T("Prepared for", "مقدَّم إلى"),
  overview: T("Overview", "نظرة عامة"),
  services: T("Services in this proposal", "الخدمات في هذا العرض"),
  work: T("Related work", "أعمال ذات صلة"),
  fullSite: T("View the full website", "تصفّح الموقع الكامل"),
  closing: T("Let's talk about your project", "لنتحدث عن مشروعك"),
  quote: T("Request a Quote", "اطلب عرض سعر"),
  unavailable: T("This proposal is no longer available", "هذا العرض لم يعد متاحاً"),
  unavailableText: T("Contact Dorma Advertising for an updated proposal, or browse the full website.", "تواصل مع دورما للإعلان للحصول على عرض محدّث، أو تصفّح الموقع الكامل."),
  missing: T("This proposal link isn't valid", "رابط العرض غير صحيح"),
  missingText: T("Check the link you received, or browse the full website.", "تحقّق من الرابط الذي وصلك، أو تصفّح الموقع الكامل.")
};

const STATUS_NAME = { live: "Live", off: "Off", expired: "Expired", archived: "Archived" };

function proposalDefaults(today = "") {
  return {
    client: { name: T(), logo: "", logoSrc: "", logoBg: "white" },
    title: T(),          // headline on the overview; empty = "A proposal for <client>"
    date: today,         // shown in the header and on the overview
    welcome: T(),        // welcome message under the headline
    cover: "",           // overview picture (library id); empty = the first service's picture
    services: [],        // [{ page, hide:[section ids], note:{en,ar} }]
    work: { media: [], posts: [] },
    contact: { label: { ...PR_WORDS.quote }, action: { type: "modal", target: "md-quote" } },
    closing: T(),        // title of the last band; empty = "Let's talk about your project"
    words: {},           // per-proposal changes to PR_WORDS (e.g. a different "Prepared for")
    langs: "site",       // site | en | ar | both
    defaultLang: "site", // site | en | ar
    internal: ""         // studio note, never sent to the client
  };
}

/** Fills in anything missing so older or hand-made proposals always render. */
function normalizeProposal(d, today = "") {
  const base = proposalDefaults(today), src = isObj(d) ? d : {};
  const out = { ...base, ...src };
  const c = isObj(src.client) ? src.client : {};
  out.client = { name: txOf(c.name), logo: typeof c.logo === "string" ? c.logo : "", logoSrc: typeof c.logoSrc === "string" ? c.logoSrc : "", logoBg: c.logoBg === "none" ? "none" : "white" };
  ["title", "welcome", "closing"].forEach(k => { out[k] = txOf(src[k]); });
  out.date = typeof src.date === "string" ? src.date : today;
  out.cover = typeof src.cover === "string" ? src.cover : "";
  out.services = (Array.isArray(src.services) ? src.services : [])
    .map(s => typeof s === "string" ? { page: s } : s)
    .filter(s => isObj(s) && typeof s.page === "string" && s.page)
    .map(s => ({ page: s.page, hide: strs(s.hide), note: txOf(s.note) }));
  const w = isObj(src.work) ? src.work : {};
  out.work = { media: strs(w.media), posts: strs(w.posts) };
  const ct = isObj(src.contact) ? src.contact : {};
  out.contact = { label: ct.label == null ? { ...PR_WORDS.quote } : txOf(ct.label), action: isObj(ct.action) ? { type: String(ct.action.type || "none"), target: String(ct.action.target || ""), ...(ct.action.section ? { section: String(ct.action.section) } : {}) } : { type: "modal", target: "md-quote" } };
  const wd = isObj(src.words) ? src.words : {};
  out.words = Object.fromEntries(Object.keys(PR_WORDS).filter(k => wd[k] != null).map(k => [k, txOf(wd[k])]));
  out.langs = ["site", "en", "ar", "both"].includes(src.langs) ? src.langs : "site";
  out.defaultLang = ["site", "en", "ar"].includes(src.defaultLang) ? src.defaultLang : "site";
  out.internal = typeof src.internal === "string" ? src.internal : "";
  return out;
}

/* ---------- link codes ---------- */
const CODE_CHARS = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o, 1/l/i: easy to read out on the phone
const codeOk = v => typeof v === "string" && /^[a-z0-9][a-z0-9-]{2,60}$/.test(v);
const slugPart = s => String(s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32).replace(/-+$/, "");
/** A readable, hard-to-guess code for the link: the client's name and four random characters (acme-k7p2). */
function newCode(name, taken = [], rnd = Math.random) {
  const base = slugPart(name) || "client", have = new Set(taken);
  for (let n = 0; n < 50; n++) {
    let tail = ""; for (let i = 0; i < 4; i++) tail += CODE_CHARS[Math.floor(rnd() * CODE_CHARS.length) % CODE_CHARS.length];
    const c = base + "-" + tail; if (!have.has(c)) return c;
  }
  return base + "-" + Date.now().toString(36);
}

/** Live, Off, Expired or Archived. Expired = the expiry date has passed (the link stops working the next day). */
function proposalState(row, today) {
  if (!row) return "off";
  if (row.status === "archived") return "archived";
  if (row.status !== "live") return "off";
  if (row.expires_on && today && String(row.expires_on).slice(0, 10) < today) return "expired";
  return "live";
}

/* ---------- the site's pages as services ---------- */
const firstHero = page => (page && page.sections || []).find(s => s && !s.hidden && (s.type === "hero" || s.type === "heroCarousel"));
/** Short description of a page for its card on the overview: the hero's text, else the first section text. */
function pageSummary(page) {
  const hs = firstHero(page);
  if (hs && hs.type === "hero" && hs.lede) return hs.lede;
  if (hs && hs.type === "heroCarousel" && hs.slides && hs.slides[0]) return hs.slides[0].text || "";
  const s = (page && page.sections || []).find(x => x && !x.hidden && x.text && (typeof x.text === "string" ? x.text : plainTx(x.text)));
  return s ? s.text : "";
}
/** The page's main picture (its hero image), for the overview. */
function pageMedia(page) {
  const hs = firstHero(page);
  if (!hs) return "";
  if (hs.type === "hero") return hs.media || "";
  const s = (hs.slides || [])[0]; return s ? (s.media || "") : "";
}
/** Pages a proposal can show, service pages (not in the menu) first. Blog posts are not pages. */
function proposalPages(cfg) {
  const pages = (cfg && cfg.pages || []).filter(p => p && p.id && !String(p.id).startsWith("for/"));
  return [...pages.filter(p => !p.nav), ...pages.filter(p => p.nav)].map(p => ({ id: p.id, title: p.title, service: !p.nav, page: p }));
}

const word = (data, k) => { const w = data.words && data.words[k]; return w && (w.en || w.ar) ? w : PR_WORDS[k]; };
/** "Prepared for Acme" in both languages (the Arabic form uses the Arabic name, else the English one). */
function preparedFor(data) {
  const n = data.client.name, w = word(data, "preparedFor");
  return T([w.en, n.en || n.ar].filter(Boolean).join(" "), [w.ar, n.ar || n.en].filter(Boolean).join(" "));
}
function proposalTitle(data) {
  const t = data.title, n = data.client.name;
  if (t.en || t.ar) return t;
  return T(n.en || n.ar ? "A proposal for " + (n.en || n.ar) : "Your proposal", n.ar || n.en ? "عرض مقدّم إلى " + (n.ar || n.en) : "عرضك");
}

/**
 * The settings the site renders for one proposal: the published site with its pages replaced by the overview and
 * the chosen service pages (sections hidden for this client left out), the header button set to the proposal's
 * contact button, and the proposal's languages. __pageMap sends "Go to page" buttons to the proposal's copy of a page;
 * pages outside the proposal open on the full website.
 */
function buildProposalSite(cfg, rawData, slug) {
  const data = normalizeProposal(rawData);
  const base = "for/" + slug, pages = cfg.pages || [];
  const chosen = data.services.map(s => ({ s, page: pages.find(p => p.id === s.page) })).filter(x => x.page);
  const pageMap = {}; chosen.forEach(({ page }) => { pageMap[page.id] = base + "/" + page.id; });
  const media = id => (cfg.media || []).find(m => m.id === id);
  const cover = (data.cover && media(data.cover) ? data.cover : "") || chosen.map(x => pageMedia(x.page)).find(Boolean) || "";
  const contact = data.contact.label && (data.contact.label.en || data.contact.label.ar) && data.contact.action.type !== "none" ? { label: data.contact.label, action: data.contact.action } : null;

  const items = chosen.map(({ s, page }) => ({ title: page.title, text: (s.note.en || s.note.ar) ? s.note : pageSummary(page), action: { type: "page", target: page.id } }));
  const workItems = [
    ...data.work.media.map(media).filter(Boolean).map(m => ({ media: m.id, title: m.title || "", text: m.caption || "", tag: "", action: m.kind === "article" ? { type: "doc", target: m.id } : { type: "none", target: "" } })),
    ...data.work.posts.map(id => (cfg.posts || []).find(p => p.id === id && p.published)).filter(Boolean)
      .map(p => ({ media: p.cover || "", title: p.title || "", text: p.excerpt || "", tag: "", action: { type: "post", target: p.id } }))
  ];
  const overview = { id: base, title: word(data, "overview"), nav: true, layout: "cinematic", isProposal: true, sections: [
    { id: "pr-cover", type: "forCover", num: "", eyebrow: preparedFor(data), title: proposalTitle(data), lede: data.welcome, media: cover, height: "tall", flowId: "",
      button: contact || { label: "", action: { type: "none", target: "" } }, client: data.client, date: data.date },
    ...(items.length ? [{ id: "pr-services", type: "division", anchor: "services", num: "", eyebrow: word(data, "services"), title: "", text: "", media: "", items }] : []),
    ...(workItems.length ? [{ id: "pr-work", type: "grid", anchor: "work", title: word(data, "work"), filters: false, items: workItems }] : []),
    ...(contact ? [{ id: "pr-cta", type: "cta", title: (data.closing.en || data.closing.ar) ? data.closing : word(data, "closing"), button: contact, bgfx: { type: "goo" } }] : [])
  ] };
  const servicePages = chosen.map(({ s, page }) => ({ ...page, id: pageMap[page.id], nav: true, isProposal: true, sourceId: page.id,
    sections: (page.sections || []).filter(sec => !s.hide.includes(sec.id)) }));
  const langs = data.langs === "site" ? cfg.site.languages : data.langs;
  const defaultLang = data.defaultLang === "site" ? cfg.site.defaultLang : data.defaultLang;
  const navCount = 1 + servicePages.length;
  return {
    ...cfg,
    pages: [overview, ...servicePages],
    site: { ...cfg.site, homePage: base, languages: langs, defaultLang, cta: contact || { label: "", action: { type: "none", target: "" } } },
    theme: navCount > 5 ? { ...cfg.theme, menu: { ...(cfg.theme && cfg.theme.menu || {}), mode: "overlay" } } : cfg.theme,
    __pageMap: pageMap,
    __proposal: { slug, base, client: data.client, date: data.date, preparedFor: preparedFor(data), fullSite: word(data, "fullSite") }
  };
}

/** Which proposals show a page or a library item (the studio warns before such a page is deleted). */
function proposalsUsing(rows, { page = "", media = "" } = {}) {
  return (rows || []).filter(r => { const d = normalizeProposal(r.data);
    return (page && d.services.some(s => s.page === page)) || (media && (d.client.logo === media || d.cover === media || d.work.media.includes(media))); });
}

/** Device type for the open counter: phone, tablet or computer (from the screen width only). */
const deviceOf = (w, coarse = false) => w < 700 ? "phone" : (w < 1100 && coarse) ? "tablet" : "computer";

export { PR_WORDS, STATUS_NAME, proposalDefaults, normalizeProposal, newCode, codeOk, slugPart, proposalState, pageSummary, pageMedia,
  proposalPages, preparedFor, proposalTitle, buildProposalSite, proposalsUsing, deviceOf, word };
