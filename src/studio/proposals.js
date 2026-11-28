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
  pdf: T("Save as PDF", "حفظ كملف PDF"),
  missingText: T("Check the link you received, or browse the full website.", "تحقّق من الرابط الذي وصلك، أو تصفّح الموقع الكامل."),
  signOff: T("Kind regards,", "مع أطيب التحيات،"),
  advertising: T("Dorma Advertising", "دورما للإعلان"),
  production: T("Dorma Production", "دورما للإنتاج")
};

/* ---------- brief templates and signature ----------
   The brief is the letter after the header ("Dear [client name], …"). The admin keeps named templates (English and
   Arabic) with a default sender name and company in Store.draft.proposalKit; a proposal copies a template's text into
   its own brief (kept in data.welcome, the older "welcome message") and can then change it freely. Placeholders in
   square brackets are filled in when the proposal is shown, in each language. */
const PLACEHOLDERS = [
  { key: "client", en: "[client name]", ar: "[اسم العميل]", label: "Client name", names: ["client name", "customer name", "client", "customer", "اسم العميل", "العميل", "اسم الزبون"] },
  { key: "date", en: "[date]", ar: "[التاريخ]", label: "Date", names: ["date", "التاريخ"] },
  { key: "services", en: "[services]", ar: "[الخدمات]", label: "Services list", names: ["services", "services list", "service list", "الخدمات", "قائمة الخدمات"] },
  { key: "sender", en: "[sender name]", ar: "[اسم المرسل]", label: "Sender name", names: ["sender name", "sender", "اسم المرسل", "المرسل"] },
  { key: "company", en: "[company]", ar: "[الشركة]", label: "Dorma Advertising / Production", names: ["company", "company name", "الشركة", "اسم الشركة"] }
];
const PH_BY_NAME = new Map(PLACEHOLDERS.flatMap(p => p.names.map(n => [n, p.key])));
const COMPANY_KEYS = ["advertising", "production"];

const STARTER_TEMPLATES = [
  { id: "tpl-standard", name: "Standard brief",
    body: T("Dear [client name],\n\nThank you for the opportunity to present this proposal. On the following pages you will find how we can help you with [services].\n\nEach service has its own page with the details. We would be glad to walk you through it and adjust anything to fit your plans.",
      "عزيزنا [اسم العميل]،\n\nنشكركم على إتاحة الفرصة لنا لتقديم هذا العرض. ستجدون في الصفحات التالية كيف يمكننا مساعدتكم في [الخدمات].\n\nلكل خدمة صفحة خاصة بها فيها التفاصيل. يسعدنا أن نشرحها لكم ونعدّل ما يلزم ليناسب خططكم.") },
  { id: "tpl-short", name: "Short note",
    body: T("Dear [client name],\n\nAs promised, here is our proposal for [services], prepared on [date]. We look forward to hearing from you.",
      "عزيزنا [اسم العميل]،\n\nكما وعدناكم، هذا عرضنا لـ[الخدمات]، أُعدّ بتاريخ [التاريخ]. نتطلع إلى التواصل معكم.") }
];
function kitDefaults() {
  return { templates: JSON.parse(JSON.stringify(STARTER_TEMPLATES)), defaultTemplate: "tpl-standard", sender: T(), company: "advertising", place: "end" };
}
/** The studio's saved templates and signature defaults, with anything missing filled in. */
function normalizeKit(k) {
  const base = kitDefaults(), src = isObj(k) ? k : {};
  const templates = Array.isArray(src.templates) ? src.templates.filter(t => isObj(t) && typeof t.id === "string" && t.id)
    .map(t => ({ id: t.id, name: typeof t.name === "string" ? t.name : "", body: txOf(t.body) })) : base.templates;
  return { templates, defaultTemplate: typeof src.defaultTemplate === "string" ? src.defaultTemplate : base.defaultTemplate,
    sender: src.sender == null ? base.sender : txOf(src.sender), company: COMPANY_KEYS.includes(src.company) ? src.company : base.company,
    place: src.place === "brief" ? "brief" : "end" };
}

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** 2026-11-28 → "28 November 2026" / "28 نوفمبر 2026". */
function longDate(iso, lang = "en") {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || "")); if (!m) return "";
  const mo = +m[2] - 1; if (mo < 0 || mo > 11) return "";
  return +m[3] + " " + (lang === "ar" ? AR_MONTHS : EN_MONTHS)[mo] + " " + m[1];
}
/** "A, B and C" / "A، B وC". */
function joinList(list, lang = "en") {
  const xs = list.filter(Boolean); if (xs.length < 2) return xs[0] || "";
  return lang === "ar" ? xs.slice(0, -1).join("، ") + " و" + xs[xs.length - 1] : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1];
}
/** What each placeholder stands for in one language, for one proposal (cfg gives the service page titles). */
function placeholderValues(rawData, cfg, lang = "en") {
  const d = normalizeProposal(rawData), L = v => inLang(v, lang), pages = (cfg && cfg.pages) || [];
  return {
    client: L(d.client.name),
    date: longDate(d.date, lang),
    services: joinList(d.services.map(s => pages.find(p => p.id === s.page)).filter(Boolean).map(p => L(p.title)), lang),
    sender: L(d.sign.name),
    company: L(word(d, d.sign.company))
  };
}
/** Replaces [client name], [date], [services], [sender name] and [company] (or their Arabic names). Links like
    [text](https://…) and unknown brackets are left as they are. */
function fillPlaceholders(text, vals) {
  return String(text || "").replace(/\[([^\]\n]{1,40})\](?!\()/g, (m, k) => {
    const key = PH_BY_NAME.get(k.trim().toLowerCase().replace(/\s+/g, " "));
    return key ? String(vals[key] ?? "") : m;
  });
}
/** The proposal's brief with the placeholders filled in, in both languages. */
function briefText(rawData, cfg) {
  const d = normalizeProposal(rawData);
  return T(fillPlaceholders(d.welcome.en, placeholderValues(d, cfg, "en")), fillPlaceholders(d.welcome.ar, placeholderValues(d, cfg, "ar")));
}
/** Placeholders in a text that aren't known (likely typos), to warn about in the studio. */
function unknownPlaceholders(text) {
  const out = []; String(text || "").replace(/\[([^\]\n]{1,40})\](?!\()/g, (m, k) => { if (!PH_BY_NAME.has(k.trim().toLowerCase().replace(/\s+/g, " ")) && !out.includes(m)) out.push(m); return m; });
  return out;
}
/** Signature lines: "Kind regards," · sender name · Dorma Advertising (or Production). null when switched off. */
function signature(rawData) {
  const d = normalizeProposal(rawData); if (!d.sign.show) return null;
  return { off: word(d, "signOff"), name: d.sign.name, company: word(d, d.sign.company), place: d.sign.place };
}
/** A new proposal's brief and signature from the studio's defaults. */
function applyKit(data, rawKit) {
  const kit = normalizeKit(rawKit), t = kit.templates.find(x => x.id === kit.defaultTemplate);
  if (t && !(data.welcome && (data.welcome.en || data.welcome.ar))) { data.welcome = { ...t.body }; data.briefTemplate = t.id; }
  data.sign = { ...(data.sign || {}), show: true, name: { ...kit.sender }, company: kit.company, place: kit.place };
  return data;
}

const STATUS_NAME = { live: "Live", off: "Off", expired: "Expired", archived: "Archived" };

function proposalDefaults(today = "") {
  return {
    client: { name: T(), logo: "", logoSrc: "", logoBg: "white" },
    title: T(),          // headline on the overview; empty = "A proposal for <client>"
    date: today,         // shown in the header and on the overview
    welcome: T(),        // the brief: letter after the header, with [placeholders] (was the welcome message)
    briefTemplate: "",   // id of the template the brief was last taken from (studio only)
    sign: { show: true, name: T(), company: "advertising", place: "end" }, // signature: sender, Dorma Advertising | Production, end | brief
    cover: "",           // overview picture (library id); empty = the first service's picture
    services: [],        // [{ page, hide:[section ids], note:{en,ar} }]
    work: { media: [], posts: [] },
    contact: { label: { ...PR_WORDS.quote }, action: { type: "modal", target: "md-quote" } },
    closing: T(),        // title of the last band; empty = "Let's talk about your project"
    words: {},           // per-proposal changes to PR_WORDS (e.g. a different "Prepared for")
    langs: "site",       // site | en | ar | both
    defaultLang: "site", // site | en | ar
    internal: "",        // studio note, never sent to the client
    pdfLink: true,       // show "Save as PDF" in the proposal's header band
    frozen: null         // null = live (follows the published site); else a snapshot (see freezeSnapshot)
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
  out.briefTemplate = typeof src.briefTemplate === "string" ? src.briefTemplate : "";
  const sg = isObj(src.sign) ? src.sign : {};
  out.sign = { show: sg.show !== false, name: txOf(sg.name), company: COMPANY_KEYS.includes(sg.company) ? sg.company : "advertising", place: sg.place === "brief" ? "brief" : "end" };
  out.pdfLink = src.pdfLink !== false;
  const fz = isObj(src.frozen) ? src.frozen : null;
  out.frozen = fz && Array.isArray(fz.pages) ? { at: String(fz.at || ""), pages: fz.pages.filter(isObj), media: (fz.media || []).filter(isObj), modals: (fz.modals || []).filter(isObj), flows: (fz.flows || []).filter(isObj), posts: (fz.posts || []).filter(isObj) } : null;
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
  const t = data.title;
  if (t.en || t.ar) return t;
  return T("Our proposal for you", "عرضنا المقدَّم لكم"); // the client's name is shown large just above it
}

/**
 * The settings the site renders for one proposal: the published site with its pages replaced by the overview and
 * the chosen service pages (sections hidden for this client left out), the header button set to the proposal's
 * contact button, and the proposal's languages. __pageMap sends "Go to page" buttons to the proposal's copy of a page;
 * pages outside the proposal open on the full website.
 */
function buildProposalSite(liveCfg, rawData, slug) {
  const data = normalizeProposal(rawData);
  const cfg = withFrozen(liveCfg, data);
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
  const hasName = !!(data.client.name.en || data.client.name.ar);
  const brief = briefText(data, cfg), sign = signature(data);
  const signSec = sign ? { off: sign.off, name: sign.name, company: sign.company } : null;
  const overview = { id: base, title: word(data, "overview"), nav: true, layout: "cinematic", isProposal: true, sections: [
    { id: "pr-cover", type: "forCover", num: "", eyebrow: hasName ? word(data, "preparedFor") : "", clientName: data.client.name, title: proposalTitle(data), lede: "", media: cover, height: "tall", flowId: "",
      button: contact || { label: "", action: { type: "none", target: "" } }, client: data.client, date: data.date },
    ...((brief.en || brief.ar) ? [{ id: "pr-brief", type: "forBrief", anchor: "brief", text: brief, sign: sign && sign.place === "brief" ? signSec : null }] : []),
    ...(items.length ? [{ id: "pr-services", type: "division", anchor: "services", num: "", eyebrow: word(data, "services"), title: "", text: "", media: "", items }] : []),
    ...(workItems.length ? [{ id: "pr-work", type: "grid", anchor: "work", title: word(data, "work"), filters: false, items: workItems }] : []),
    ...(sign && (sign.place === "end" || !(brief.en || brief.ar)) ? [{ id: "pr-sign", type: "forSign", sign: signSec }] : []),
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
    __proposal: { slug, base, client: data.client, date: data.date, preparedFor: preparedFor(data), forWord: word(data, "preparedFor"), fullSite: word(data, "fullSite"), pdf: data.pdfLink ? word(data, "pdf") : null, frozen: !!data.frozen }
  };
}

/* ---------- frozen proposals ----------
   Live (the default): service pages, pictures, modals and flows follow what is published on the main site.
   Frozen: the proposal keeps a copy of everything its pages use, taken when it was frozen, so later edits to the
   main site don't change what this client sees. The proposal's own words (welcome, client, notes) stay editable.
   The site's colours, fonts and logo still follow the main site. */
function idsIn(v, out = new Set()) {
  if (typeof v === "string") { if (v && v.length < 200) out.add(v); }
  else if (Array.isArray(v)) v.forEach(x => idsIn(x, out));
  else if (isObj(v)) Object.values(v).forEach(x => idsIn(x, out));
  return out;
}
/** A copy of what the proposal shows from the main site: its chosen pages and the library items, modals, flows and
    blog posts they point to (followed through modals and flows too). */
function freezeSnapshot(cfg, rawData, at = new Date().toISOString()) {
  const data = normalizeProposal(rawData);
  const pages = data.services.map(s => (cfg.pages || []).find(p => p.id === s.page)).filter(Boolean);
  const want = idsIn([pages, data.cover, data.client.logo, data.work, data.contact]);
  const pick = list => (list || []).filter(x => x && want.has(x.id));
  let modals = [], flows = [], n = -1;
  while (n !== modals.length + flows.length) { // modals can open flows and flows can open modals
    n = modals.length + flows.length;
    modals = pick(cfg.modals); flows = pick(cfg.flows); idsIn([modals, flows], want);
  }
  const posts = pick(cfg.posts); idsIn(posts.map(p => p.cover), want);
  return JSON.parse(JSON.stringify({ at, pages, media: pick(cfg.media), modals, flows, posts }));
}
/** The site settings with a frozen proposal's copies put back in place of the current pages, items, modals and flows. */
function withFrozen(cfg, data) {
  const fz = data && data.frozen; if (!fz) return cfg;
  const merge = (live, kept) => { const ids = new Set(kept.map(x => x.id)); return [...kept, ...(live || []).filter(x => x && !ids.has(x.id))]; };
  return { ...cfg, pages: merge(cfg.pages, fz.pages), media: merge(cfg.media, fz.media), modals: merge(cfg.modals, fz.modals), flows: merge(cfg.flows, fz.flows), posts: merge(cfg.posts, fz.posts) };
}
/** Services added after the proposal was frozen (they show the live page until the copy is updated). */
function notInFrozen(rawData) {
  const d = normalizeProposal(rawData); if (!d.frozen) return [];
  const kept = new Set(d.frozen.pages.map(p => p.id));
  return d.services.map(s => s.page).filter(id => !kept.has(id));
}
const snapshotBytes = fz => fz ? new Blob([JSON.stringify(fz)]).size : 0;

/* ---------- printable proposal (Save as PDF) ----------
   A plain, print-friendly version of the proposal in one language: the cover (Dorma and client logos, "Prepared
   for", the date, the headline and welcome), then each chosen service with its picture and the text of its
   sections, related work, and the closing with how to get in touch. Forms, buttons and animations are left out. */
const inLang = (v, lang) => { if (!isObj(v) || !("en" in v || "ar" in v)) return typeof v === "string" ? v : ""; const a = v[lang], b = v[lang === "ar" ? "en" : "ar"]; return String((a != null && a !== "") ? a : (b ?? "")); };
const stripMd = t => String(t || "").replace(/\r/g, "").replace(/^#{1,6}\s*/gm, "").replace(/\*\*?([^*]+)\*\*?/g, "$1").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/^>\s?/gm, "").trim();
const SKIP_PRINT = new Set(["quote", "contact", "cta", "photo", "logo", "blog", "banner", "forCover", "flowStrip"]);
function printBlock(sec, lang) {
  const L = v => stripMd(inLang(v, lang));
  const items = [];
  const listOf = sec.type === "heroCarousel" ? sec.slides : sec.items;
  (Array.isArray(listOf) ? listOf : []).filter(it => isObj(it) && !it.hidden).forEach(it => {
    const title = L(it.title) || L(it.label) || L(it.name) || L(it.value);
    const text = L(it.text) || L(it.detail) || L(it.quote) || L(it.caption) || L(it.role);
    if (title || text) items.push({ title, text });
  });
  const body = [L(sec.lede), L(sec.text), L(sec.body)].filter(Boolean).join("\n\n");
  return { id: sec.id, eyebrow: L(sec.eyebrow), title: L(sec.title), text: body, items, media: typeof sec.media === "string" ? sec.media : "" };
}
function proposalPrint(liveCfg, rawData, lang = "en") {
  const data = normalizeProposal(rawData), cfg = withFrozen(liveCfg, data), L = v => inLang(v, lang);
  const pages = cfg.pages || [];
  const services = data.services.map(s => ({ s, page: pages.find(p => p.id === s.page) })).filter(x => x.page).map(({ s, page }) => {
    const blocks = (page.sections || []).filter(sec => sec && !sec.hidden && !sec.previewOnly && !s.hide.includes(sec.id) && !SKIP_PRINT.has(sec.type))
      .map(sec => printBlock(sec, lang));
    const note = L(s.note), summary = note || stripMd(L(pageSummary(page)));
    blocks.forEach(b => { if (b.text === summary) b.text = ""; }); // the page's summary is already under its title
    return { id: page.id, title: L(page.title), summary, media: pageMedia(page), blocks: blocks.filter(b => b.title || b.text || b.items.length) };
  });
  const media = id => (cfg.media || []).find(m => m.id === id);
  const work = [
    ...data.work.media.map(media).filter(Boolean).map(m => ({ media: m.id, title: L(m.title) || "", text: L(m.caption) || "" })),
    ...data.work.posts.map(id => (cfg.posts || []).find(p => p.id === id && p.published)).filter(Boolean).map(p => ({ media: p.cover || "", title: L(p.title), text: L(p.excerpt) }))
  ];
  const cover = (data.cover && media(data.cover) ? data.cover : "") || services.map(x => x.media).find(Boolean) || "";
  const site = cfg.site || {};
  const brief = briefText(data, cfg), sg = signature(data);
  return {
    lang, dir: lang === "ar" ? "rtl" : "ltr",
    brand: L(site.brand), preparedFor: L(preparedFor(data)), forWord: L(word(data, "preparedFor")), title: L(proposalTitle(data)), welcome: L(brief), brief: L(brief),
    sign: sg ? { off: L(sg.off), name: L(sg.name), company: L(sg.company), place: sg.place } : null,
    date: data.date, client: { name: L(data.client.name), logo: data.client.logo, logoSrc: data.client.logoSrc, logoBg: data.client.logoBg },
    cover, services, work, workTitle: L(word(data, "work")), servicesTitle: L(word(data, "services")),
    closing: L(data.closing) || L(word(data, "closing")), email: String(site.quoteEmail || "").trim(), frozen: data.frozen ? data.frozen.at : ""
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
  proposalPages, preparedFor, proposalTitle, buildProposalSite, proposalsUsing, deviceOf, word,
  freezeSnapshot, withFrozen, notInFrozen, snapshotBytes, proposalPrint, inLang, stripMd,
  PLACEHOLDERS, COMPANY_KEYS, kitDefaults, normalizeKit, longDate, joinList, placeholderValues, fillPlaceholders, briefText, unknownPlaceholders, signature, applyKit };
