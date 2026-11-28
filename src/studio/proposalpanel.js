/* ================= STUDIO › CONTENT › PROPOSALS =================
   Client-specific mini sites. Each proposal: the client's name and logo, the date, the services (the site's own pages,
   with sections that can be left out for this client), related work, the welcome text and contact button, languages,
   on/off, an expiry date and whether search engines may list it. Proposals save as soon as they change (no Publish:
   they are not part of the site settings); the service pages they show follow the published site.
   The list shows each proposal's state and how often the client opened it. */
import './proposals.css';
import { h, esc, plain, clone, mediaItem, mediaUrl, mediaNode, fmtDate, inlineMd } from './core';
import { Store, scheduleSave, Proposals, loadProposals, scheduleProposalSave, saveProposal, deleteProposal, proposalOpens, clearProposalOpens, markOpensSeen, loadBadges } from './store';
import { Site } from './site';
import { IC, card, toast, openPanel, F, confirmInline, masterDetail, Admin, libBrowser } from './admin';
import { SECTION_TYPES } from './data';
import { PR_WORDS, STATUS_NAME, proposalDefaults, normalizeProposal, newCode, codeOk, proposalState, proposalPages, pageSummary, freezeSnapshot, notInFrozen, snapshotBytes,
  PLACEHOLDERS, normalizeKit, placeholderValues, fillPlaceholders, unknownPlaceholders, applyKit, word } from './proposals';

const today = () => new Date().toISOString().slice(0, 10);
const VIEW = { show: "active" };
const linkOf = slug => location.origin + location.pathname + location.search + "#for/" + slug;
const nameOf = r => plain(r.data && r.data.client && r.data.client.name) || "Unnamed client";
const save = r => { scheduleProposalSave(r); };
const when = t => { const d = Date.parse(t || ""); return isNaN(d) ? "" : new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); };

function copyText(text, what) {
  const done = () => toast(what);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => toast("Couldn't copy. Select the link and copy it."));
  else toast("Couldn't copy. Select the link and copy it.");
}

/** Where proposals are saved and whether the last save worked. */
function saveNote() {
  const el = h("p", { class: "soc-save mono", role: "status" });
  const draw = () => { const st = Proposals.status, where = Proposals.where === "db" ? "Saved in the studio database (only people with the link see a proposal)" : "Saved in this browser only (offline copy)";
    el.textContent = (st === "saving" || st === "pending" ? "Saving… · " : st === "error" ? (Proposals.message || "Couldn't save") + " · " : "") + where; el.classList.toggle("err", st === "error"); };
  draw(); Proposals.listeners = [draw]; return el;
}

async function panelProposals(body) {
  body.append(h("p", { class: "adm-intro", text: "Loading proposals…" }));
  await loadProposals(); if (!body.isConnected) return;
  body.textContent = ""; drawPanel(body);
}

function newRow(data, extra = {}) {
  return { id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)), slug: newCode(plain(data.client.name), (Proposals.rows || []).map(r => r.slug)),
    data, status: "off", expires_on: null, searchable: true, created_at: new Date().toISOString(), ...extra };
}

function drawPanel(body) {
  const rows = Proposals.rows, T0 = today();
  const archived = rows.filter(r => r.status === "archived"), active = rows.filter(r => r.status !== "archived");
  body.append(h("p", { class: "adm-intro" },
    "A proposal is a small website made for one client, with only the services they need. It shows their name and logo, the date, your brief (a short letter to them), the service pages you pick and your signature, in the site's look. ",
    "Send the client its link. Changes save straight away, and service pages follow what you publish on the main site."));
  body.append(saveNote());
  const add = () => { const r = newRow(applyKit(proposalDefaults(T0), Store.draft.proposalKit)); rows.unshift(r); Admin.sel.proposal = r.id; VIEW.show = "active"; void saveProposal(r); openPanel("proposals"); };
  const bar = h("div", { class: "pr-tools" },
    h("button", { class: "btn primary sm", type: "button", html: IC.plus + "New proposal", onclick: add }),
    h("div", { class: "pr-view", role: "group", "aria-label": "Show" },
      ...[["active", "Active", active.length], ["archived", "Archived", archived.length], ["kit", "Templates and signature"]].map(([k, l, n]) =>
        h("button", { type: "button", class: "btn sm" + (VIEW.show === k ? " on" : ""), "aria-pressed": String(VIEW.show === k), text: l + (n == null ? "" : " (" + n + ")"), onclick: () => { VIEW.show = k; openPanel("proposals"); } }))));
  body.append(bar);
  if (VIEW.show === "kit") { kitPanel(body); return; }
  const list = VIEW.show === "archived" ? archived : active;
  if (!list.length) {
    body.append(card(VIEW.show === "archived" ? "No archived proposals" : "No proposals yet",
      h("p", { class: "adm-intro", style: "margin:0", text: VIEW.show === "archived" ? "Archived proposals are switched off and kept here to reuse later." : "Make one with New proposal: enter the client's name, pick their logo and tick the services they're interested in." })));
    return;
  }
  const stateText = r => { const s = proposalState(r, T0), st = Proposals.stats[r.id];
    return STATUS_NAME[s] + (r.data && r.data.frozen ? " · frozen" : "") + (st && st.opens ? " · opened " + st.opens + "×" : "") + (st && st.fresh ? " · " + st.fresh + " new" : ""); };
  masterDetail(body, { items: () => (VIEW.show === "archived" ? Proposals.rows.filter(r => r.status === "archived") : Proposals.rows.filter(r => r.status !== "archived")),
    selKey: "proposal", label: nameOf, kind: stateText, detail: (r, redrawList) => detail(r, redrawList) });
}

/* ---------- one proposal ---------- */
function detail(r, redrawList) {
  const hadSign = !!(r.data && r.data.sign);
  const d = r.data = normalizeProposal(r.data, today());
  const changed = () => { save(r); redrawList(); };
  const st = Proposals.stats[r.id];
  /* proposals made before signatures existed get the saved default sender */
  const K = kit();
  if (!d.sign.name.en && !d.sign.name.ar && (K.sender.en || K.sender.ar)) { d.sign.name = { ...K.sender }; if (!hadSign) { d.sign.company = K.company; d.sign.place = K.place; } save(r); }
  if (st && st.fresh) setTimeout(async () => { if (await markOpensSeen(r.id)) { redrawList(); void loadBadges(); } }, 1500); // seen once the editor has looked
  return [linkCard(r, changed, redrawList), versionCard(r, d, changed), clientCard(r, d, changed), briefCard(r, d, changed), servicesCard(r, d, changed), signCard(r, d, changed), wordsCard(d, changed), workCard(d, changed), moreCard(r, d, changed)];
}

function linkCard(r, changed, redrawList) {
  const link = h("code", { class: "pr-link", text: linkOf(r.slug) });
  const codeIn = h("input", { type: "text", value: r.slug, id: "pr-code", spellcheck: "false" }), hint = h("span", { class: "hint", text: "The end of the link. Changing it stops the old link from working." });
  codeIn.addEventListener("change", () => {
    const v = codeIn.value.trim().toLowerCase();
    if (!codeOk(v) || Proposals.rows.some(x => x !== r && x.slug === v)) { hint.textContent = "Use 3 to 60 small letters, numbers and dashes, not already used by another proposal."; hint.style.color = "var(--bad)"; codeIn.value = r.slug; return; }
    r.slug = v; link.textContent = linkOf(v); hint.style.color = ""; hint.textContent = "Link changed. Send the client the new link."; changed();
  });
  const stats = h("div", { class: "pr-stats" });
  const drawStats = () => { stats.textContent = ""; const s = Proposals.stats[r.id];
    stats.append(h("span", { text: Proposals.where !== "db" ? "Opens are counted on the online site only." : s && s.opens ? "Opened " + s.opens + (s.opens === 1 ? " time" : " times") + " · last " + when(s.last) : "Not opened yet" }));
    if (s && s.fresh) stats.append(h("span", { class: "pr-new", text: s.fresh + (s.fresh === 1 ? " new open" : " new opens") + " since you last looked" }));
    if (Proposals.where === "db" && s && s.opens) {
      stats.append(h("button", { class: "btn sm", type: "button", text: "Show opens", onclick: async e => { const b = e.currentTarget; b.disabled = true; const list = await proposalOpens(r.id); const ul = h("ul", { class: "pr-opens" });
        list.forEach(o => ul.append(h("li", {}, h("span", { text: when(o.opened_at) }), h("small", { text: [o.device, o.lang === "ar" ? "Arabic" : o.lang === "en" ? "English" : ""].filter(Boolean).join(" · ") })))); b.replaceWith(ul); } }),
        h("button", { class: "btn sm", type: "button", text: "Reset count", onclick: e => confirmInline(e.currentTarget, "Clear this proposal's opens?", async () => { if (await clearProposalOpens(r.id)) { drawStats(); redrawList(); } }, "Clear") }));
    } };
  drawStats();
  const statusOpts = [["live", "Live: the link works"], ["off", "Off: the link shows that the proposal isn't available"], ["archived", "Archived: off, kept in the archive to reuse"]];
  return card(h("span", { class: "grow" }, "Link and status"),
    h("div", { class: "pr-linkrow" }, link,
      h("button", { class: "btn sm", type: "button", html: IC.copy + "Copy link", onclick: () => copyText(linkOf(r.slug), "Link copied") }),
      h("a", { class: "btn sm", href: "#for/" + r.slug, target: "_blank", rel: "noopener", html: IC.eye + "Open" }),
      h("button", { class: "btn sm", type: "button", text: "Preview with draft", title: "See it with the studio's unpublished changes", onclick: () => { Site.preview = true; location.hash = "for/" + r.slug; } }),
      ...pdfLangs(r).map(l => h("a", { class: "btn sm", href: "#for/" + r.slug + "/pdf/" + l, target: "_blank", rel: "noopener", title: "A clean printable version: use Save as PDF in the print window", html: IC.down + (l === "ar" ? "PDF (Arabic)" : "PDF (English)") }))),
    proposalState(r, today()) === "live" ? null : h("p", { class: "pr-warn", text: proposalState(r, today()) === "expired" ? "Expired: the link shows that the proposal isn't available. Clear or move the expiry date to open it again." : "This proposal is off: the client sees a short \"not available\" note. Set it to Live when it's ready." }),
    h("div", { class: "fields" },
      h("div", { class: "field" }, h("label", { for: "pr-code", text: "Link code" }), codeIn, hint),
      F(r, "status", "select", "Status", { options: statusOpts }, () => { changed(); openPanel("proposals"); }),
      F(r, "expires_on", "date", "Expires on (empty = never)", { hint: "The link stops working the day after this date." }, v => { if (!v) r.expires_on = null; changed(); }),
      F(r, "searchable", "toggle", "Search engines may list it", { hint: "Off adds a noindex tag. Links with # are rarely listed anyway." }, changed)),
    stats);
}

/** Languages the printable version can be made in (the proposal's languages). */
function pdfLangs(r) {
  const d = normalizeProposal(r.data), l = d.langs === "site" ? (Store.draft.site.languages || "en") : d.langs;
  return l === "both" ? ["en", "ar"] : [l === "ar" ? "ar" : "en"];
}

/* Live or frozen: live follows the published site; frozen keeps a copy of the service pages, pictures, modals and
   flows the proposal uses, so later edits to the main site don't change what this client sees. */
function versionCard(r, d, changed) {
  const live = Store.live || Store.draft;
  const freeze = (msg) => { d.frozen = freezeSnapshot(live, d); changed(); toast(msg); openPanel("proposals"); };
  const fz = d.frozen, missing = notInFrozen(d), kb = Math.round(snapshotBytes(fz) / 1024);
  const badge = h("span", { class: "pr-mode " + (fz ? "frozen" : "live"), text: fz ? "Frozen · " + when(fz.at) : "Live · follows the published site" });
  const body = fz
    ? [h("p", { class: "adm-intro", style: "margin:0", text: "This client sees the service pages, pictures, modals and flows as they were published when you froze it. Edits to the main site don't change it. The welcome, client details and the words on this page can still be changed. Colours, fonts and the logo follow the main site." }),
       missing.length ? h("p", { class: "pr-warn", text: "Added after freezing, so shown live: " + missing.map(id => { const p = (live.pages || []).find(x => x.id === id); return p ? plain(p.title) || id : id; }).join(", ") + ". Use Update the frozen copy to include it." }) : null,
       h("p", { class: "hint", text: "Frozen copy: " + fz.pages.length + (fz.pages.length === 1 ? " page" : " pages") + ", " + fz.media.length + " library items, about " + kb + " KB." }),
       h("div", { class: "pr-actions" },
         h("button", { class: "btn sm", type: "button", text: "Update the frozen copy", title: "Take a new copy from the published site now", onclick: () => freeze("Frozen copy updated from the published site") }),
         h("button", { class: "btn sm", type: "button", text: "Go back to live", onclick: e => confirmInline(e.currentTarget.parentNode, "Show the current published pages to this client again?", () => { d.frozen = null; changed(); toast("Back to live: it follows the published site"); openPanel("proposals"); }, "Go live") }))]
    : [h("p", { class: "adm-intro", style: "margin:0", text: "Live is the default: when you edit and publish a service page, this proposal shows the new version. Freeze it once the client has the proposal, so what they agreed to stays the same." }),
       h("div", { class: "pr-actions" }, h("button", { class: "btn sm primary", type: "button", text: "Freeze this version", title: "Keep a copy of the published pages this proposal uses", onclick: () => freeze("Frozen. Later edits to the main site won't change this proposal.") }))];
  return card(h("span", { class: "grow" }, "Version ", badge), ...body);
}

/** The client's name in English and Arabic side by side ("name" is kept single-language elsewhere in the studio). */
function nameField(c, onName) {
  const hasAr = Store.draft.site.languages !== "en" || c.name.ar;
  const en = F(c.name, "en", "text", hasAr ? "English" : "Client name", { lang: "en", noAi: true }, onName);
  if (!hasAr) return en;
  const ar = F(c.name, "ar", "text", "العربية", { lang: "ar", noAi: true }, onName);
  ar.querySelectorAll("input").forEach(i => { i.dir = "rtl"; i.lang = "ar"; });
  en.classList.add("bi-en"); ar.classList.add("bi-ar");
  return h("div", { class: "field bi wide" }, h("span", { class: "bi-label", text: "Client name" }), h("div", { class: "bi-row" }, en, ar));
}
function clientCard(r, d, changed) {
  const c = d.client;
  const onName = () => { if (/^client-[a-z0-9]{4}$/.test(r.slug) && plain(c.name)) { const n = newCode(plain(c.name), Proposals.rows.map(x => x.slug)); r.slug = n; const ci = document.getElementById("pr-code"); if (ci) ci.value = n; const l = document.querySelector(".pr-link"); if (l) l.textContent = linkOf(n); } changed(); };
  return card("Client",
    h("div", { class: "fields" },
      nameField(c, onName),
      F(c, "logo", "media", "Client logo (from the Library)", { wide: true, cat: "brand" }, () => { const m = c.logo ? mediaItem(Store.draft, c.logo) : null; c.logoSrc = (m && mediaUrl(m)) || ""; changed(); }),
      F(c, "logoBg", "select", "Logo background", { options: [["white", "White tile (for colour or dark logos)"], ["none", "None (for white or light logos)"]] }, changed),
      F(d, "date", "date", "Date shown to the client", {}, changed)),
    h("p", { class: "hint", text: "Add the client's logo to the Library first (Library → Upload, Brand & Identity). Without a logo, the name is shown." }));
}

/* Services: the site's pages. Ticked pages become pages of the proposal, in this order. */
function servicesCard(r, d, changed) {
  const box = h("div", { class: "pr-svc" });
  const draw = () => {
    box.textContent = "";
    const pages = proposalPages(Store.draft), byId = Object.fromEntries(pages.map(p => [p.id, p]));
    const chosen = h("ol", { class: "pr-chosen" });
    d.services.forEach((s, i) => {
      const p = byId[s.page]; if (!p) { chosen.append(h("li", { class: "pr-gone" }, h("span", { text: "Page “" + s.page + "” no longer exists" }), h("button", { class: "btn sm", type: "button", text: "Remove", onclick: () => { d.services.splice(i, 1); changed(); draw(); } }))); return; }
      const secs = (p.page.sections || []).filter(x => !x.hidden);
      const shown = secs.filter(x => !s.hide.includes(x.id)).length;
      const secBox = h("div", { class: "pr-secs" });
      secs.forEach(x => { const id = "prs-" + r.id.slice(0, 6) + "-" + p.id + "-" + x.id, i2 = h("input", { type: "checkbox", id });
        i2.checked = !s.hide.includes(x.id);
        i2.addEventListener("change", () => { s.hide = i2.checked ? s.hide.filter(y => y !== x.id) : [...s.hide, x.id]; changed(); sum.textContent = "Sections shown: " + secs.filter(y => !s.hide.includes(y.id)).length + " of " + secs.length; });
        const tl = (SECTION_TYPES[x.type] && SECTION_TYPES[x.type].label) || x.type;
        secBox.append(h("label", { class: "pr-check", for: id }, i2, h("span", { text: (plain(x.eyebrow) || plain(x.title) || tl) }), h("small", { text: tl }))); });
      const sum = h("summary", { text: "Sections shown: " + shown + " of " + secs.length });
      const move = (k) => { const j = i + k; if (j < 0 || j >= d.services.length) return; [d.services[i], d.services[j]] = [d.services[j], d.services[i]]; changed(); draw(); };
      chosen.append(h("li", { class: "pr-item" },
        h("div", { class: "pr-item-head" }, h("b", { text: plain(p.title) || p.id }),
          h("span", { class: "pr-item-btns" },
            h("button", { class: "btn sm icon", type: "button", "aria-label": "Move up", title: "Move up", disabled: i === 0, text: "↑", onclick: () => move(-1) }),
            h("button", { class: "btn sm icon", type: "button", "aria-label": "Move down", title: "Move down", disabled: i === d.services.length - 1, text: "↓", onclick: () => move(1) }),
            h("button", { class: "btn sm", type: "button", text: "Remove", onclick: () => { d.services.splice(i, 1); changed(); draw(); } }))),
        h("p", { class: "hint", text: "Card text on the overview: " + (plain(pageSummary(p.page)) || "none (write a note below)") }),
        F(s, "note", "area", "Note for this client (replaces the card text)", { wide: true, rows: 2 }, changed),
        h("details", { class: "pr-fold" }, sum, secBox)));
    });
    if (!d.services.length) chosen.append(h("li", { class: "pr-empty", text: "No services yet. Tick them below." }));
    const pick = h("div", { class: "pr-pick" });
    [["Service pages", pages.filter(p => p.service)], ["Main pages", pages.filter(p => !p.service)]].forEach(([title, list]) => {
      if (!list.length) return;
      const g = h("div", { class: "pr-pick-group" }, h("p", { class: "mono", text: title }));
      list.forEach(p => { const id = "prp-" + r.id.slice(0, 6) + "-" + p.id, i3 = h("input", { type: "checkbox", id });
        i3.checked = d.services.some(s => s.page === p.id);
        i3.addEventListener("change", () => { if (i3.checked) d.services.push({ page: p.id, hide: [], note: { en: "", ar: "" } }); else d.services = d.services.filter(s => s.page !== p.id); changed(); draw(); });
        g.append(h("label", { class: "pr-check", for: id }, i3, h("span", { text: plain(p.title) || p.id }))); });
      pick.append(g);
    });
    box.append(chosen, h("p", { class: "bi-label", text: "Choose services" }), pick);
  };
  draw();
  return card("Services", h("p", { class: "adm-intro", style: "margin:0", text: "Each ticked page becomes a page of the proposal, with the same sections, modals and flows as on the main site. Untick sections the client doesn't need. Buttons to pages outside the proposal open the full website." }), box);
}

/** A word the client sees (e.g. "Prepared for"), filled with the default until changed. */
function wordField(d, k, label, changed) {
  const tmp = { v: d.words[k] ? { ...d.words[k] } : { ...PR_WORDS[k] } };
  return F(tmp, "v", "text", label, { noAi: true }, v => { d.words[k] = v; changed(); });
}
function wordsCard(d, changed) {
  return card("Headline and contact",
    h("div", { class: "fields" },
      F(d, "title", "text", "Headline under the client's name (empty = “Our proposal for you”)", { wide: true }, changed),
      F(d, "cover", "media", "Overview picture (empty = the first service's picture)", { wide: true }, changed),
      F(d, "contact", "button", "Contact button (header, overview and the last band)", {}, changed),
      F(d, "closing", "text", "Title of the last band (empty = “Let's talk about your project”)", { wide: true }, changed)),
    h("details", { class: "pr-fold" }, h("summary", { text: "Words around the proposal" }),
      h("div", { class: "fields" }, wordField(d, "preparedFor", "Before the client's name", changed), wordField(d, "overview", "First page in the menu", changed),
        wordField(d, "services", "Services heading", changed), wordField(d, "work", "Related work heading", changed), wordField(d, "fullSite", "Link to the full website", changed),
        wordField(d, "signOff", "Signature: line before the name", changed), wordField(d, "advertising", "Signature: Dorma Advertising", changed), wordField(d, "production", "Signature: Dorma Production", changed))));
}

/* Related work: library pictures and published blog posts shown on the overview. */
function workCard(d, changed) {
  const D = Store.draft, box = h("div", {});
  const draw = () => {
    box.textContent = "";
    const thumbs = h("div", { class: "pr-thumbs" });
    d.work.media.forEach((id, i) => { const m = mediaItem(D, id);
      thumbs.append(h("div", { class: "pr-thumb" }, (m && mediaNode(D, id, { w: 240, hh: 180, thumb: true })) || h("span", { text: "Missing" }),
        h("button", { class: "pr-x-btn", type: "button", "aria-label": "Remove " + (m ? plain(m.label) : id), html: IC.x, onclick: () => { d.work.media.splice(i, 1); changed(); draw(); } }))); });
    const drawer = h("div", { class: "mp-drawer", hidden: true });
    const addBtn = h("button", { class: "btn sm", type: "button", html: IC.plus + "Add pictures", onclick: () => {
      drawer.hidden = false; drawer.textContent = "";
      drawer.append(libBrowser({ multi: true, addLabel: "Add", onAdd: ids => { ids.forEach(id => { if (!d.work.media.includes(id)) d.work.media.push(id); }); changed(); draw(); }, onClose: () => { drawer.hidden = true; drawer.textContent = ""; } })); } });
    const posts = (D.posts || []).filter(p => p.published).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const plist = h("div", { class: "pr-pick-group" });
    posts.forEach(p => { const id = "prw-" + p.id, i = h("input", { type: "checkbox", id }); i.checked = d.work.posts.includes(p.id);
      i.addEventListener("change", () => { d.work.posts = i.checked ? [...d.work.posts, p.id] : d.work.posts.filter(x => x !== p.id); changed(); });
      plist.append(h("label", { class: "pr-check", for: id }, i, h("span", { text: plain(p.title) || p.slug }), h("small", { text: fmtDate(p.date) }))); });
    box.append(thumbs, addBtn, drawer, h("p", { class: "bi-label", text: "Blog posts" }), posts.length ? plist : h("p", { class: "hint", text: "No published blog posts yet." }));
  };
  draw();
  return card("Related work", h("p", { class: "adm-intro", style: "margin:0", text: "Optional: real project pictures and blog posts that match this client's needs, shown on the overview. Leave empty to hide the section." }), box);
}

function moreCard(r, d, changed) {
  const dup = () => {
    const nd = clone(d); nd.client = { name: { en: "", ar: "" }, logo: "", logoSrc: "", logoBg: d.client.logoBg }; nd.title = { en: "", ar: "" }; nd.date = today(); nd.internal = ""; nd.frozen = null;
    const n = newRow(nd, { searchable: r.searchable }); Proposals.rows.unshift(n); Admin.sel.proposal = n.id; VIEW.show = "active"; void saveProposal(n);
    toast("Copy made, switched off. Enter the new client's name and logo."); openPanel("proposals");
  };
  const arch = () => { r.status = r.status === "archived" ? "off" : "archived"; save(r); toast(r.status === "archived" ? "Archived and switched off" : "Back in the active list, switched off"); openPanel("proposals"); };
  return card("Languages, notes and copies",
    h("div", { class: "fields" },
      F(d, "langs", "select", "Languages", { options: [["site", "Same as the site"], ["en", "English only"], ["ar", "Arabic only"], ["both", "English and Arabic (switch in the header)"]] }, changed),
      F(d, "defaultLang", "select", "Language it opens in", { options: [["site", "Same as the site"], ["en", "English"], ["ar", "العربية"]] , hint: "A visitor who already switched language keeps their choice." }, changed),
      F(d, "pdfLink", "toggle", "“Save as PDF” link in the proposal's header", { hint: "Opens a clean printable version the client can save as a PDF." }, changed),
      F(d, "internal", "area", "Studio notes (never shown to the client)", { wide: true, rows: 2, noAi: true }, changed)),
    h("div", { class: "pr-actions" },
      h("button", { class: "btn sm", type: "button", html: IC.copy + "Duplicate for another client", onclick: dup }),
      h("button", { class: "btn sm", type: "button", text: r.status === "archived" ? "Restore from archive" : "Archive", onclick: arch }),
      h("button", { class: "btn sm danger", type: "button", text: "Delete", onclick: e => confirmInline(e.currentTarget.parentNode, "Delete this proposal and its open count? The link stops working.", async () => {
        if (await deleteProposal(r)) { toast("Proposal deleted"); openPanel("proposals"); } else toast("Couldn't delete. Try again."); }, "Delete") })));
}

/* ---------- brief (letter after the header), templates and signature ---------- */
const KIT_OK = new WeakSet(); // normalized once, so editors keep working on the same object
const kit = () => { const k = Store.draft.proposalKit; if (k && KIT_OK.has(k)) return k; const n = Store.draft.proposalKit = normalizeKit(k); KIT_OK.add(n); return n; };
const LANG_NAME = { en: "English", ar: "العربية" };
const siteLangsNow = () => { const l = Store.draft.site.languages || "en"; return l === "both" ? ["en", "ar"] : [l === "ar" ? "ar" : "en"]; };

/** Buttons that put a placeholder where the cursor is, in the last text box used inside `scope`. */
function placeholderChips(scope) {
  let last = null;
  scope.addEventListener("focusin", e => { if (e.target && e.target.tagName === "TEXTAREA") last = e.target; });
  const put = p => {
    const t = last && last.isConnected ? last : scope.querySelector("textarea"); if (!t) return;
    const tok = t.dir === "rtl" ? p.ar : p.en, a = t.selectionStart ?? t.value.length, b = t.selectionEnd ?? a;
    t.value = t.value.slice(0, a) + tok + t.value.slice(b); t.focus(); t.setSelectionRange(a + tok.length, a + tok.length);
    t.dispatchEvent(new Event("input", { bubbles: true }));
  };
  return h("div", { class: "pr-chips" }, h("span", { class: "hint", text: "Insert:" }),
    ...PLACEHOLDERS.map(p => h("button", { type: "button", class: "btn sm pr-chip", title: p.label + " (" + p.en + " or " + p.ar + ")", text: p.en, onmousedown: e => e.preventDefault(), onclick: () => put(p) })));
}
/** The brief as the client will read it, in each language, with the placeholders filled in. */
function briefPreview(getText, getData, langs, { sign = null } = {}) {
  const box = h("div", { class: "pr-preview", "aria-live": "polite" });
  const draw = () => {
    box.textContent = ""; const text = getText() || {}, data = getData();
    const warn = unknownPlaceholders([text.en, text.ar].join("\n"));
    langs().forEach(l => {
      const raw = String(text[l] || ""), vals = placeholderValues(data, Store.draft, l);
      const col = h("div", { class: "pr-prev-col", lang: l, dir: l === "ar" ? "rtl" : "ltr" }, h("p", { class: "mono pr-prev-lang", text: "Preview · " + LANG_NAME[l] }));
      if (!raw.trim()) col.append(h("p", { class: "hint", text: l === "ar" ? "لا يوجد نص عربي بعد (يظهر النص الإنجليزي)." : "Nothing written yet." }));
      fillPlaceholders(raw, vals).replace(/\r/g, "").split(/\n{2,}/).filter(x => x.trim()).forEach(par => col.append(h("p", { html: par.split("\n").map(inlineMd).join("<br>") })));
      const sg = sign && sign();
      if (sg && sg.show && raw.trim()) col.append(h("div", { class: "pr-prev-sign" }, h("p", { text: plain(sg.off[l] ? sg.off[l] : sg.off.en) }), h("b", { text: (l === "ar" ? sg.name.ar || sg.name.en : sg.name.en || sg.name.ar) || "[sender name]" }), h("small", { text: sg.company[l] || sg.company.en })));
      const miss = ["client", "sender"].filter(k => !vals[k] && new RegExp("\\[(" + PLACEHOLDERS.find(p => p.key === k).names.join("|") + ")\\]", "i").test(raw));
      if (miss.length) col.append(h("p", { class: "pr-warn", text: (l === "ar" ? "فارغ: " : "Empty: ") + miss.map(k => PLACEHOLDERS.find(p => p.key === k).label).join(", ") }));
      box.append(col);
    });
    if (warn.length) box.append(h("p", { class: "pr-warn", text: "Not a placeholder, shown as typed: " + warn.join(" ") + ". Use the Insert buttons for the right spelling." }));
  };
  draw(); return { el: box, draw };
}

function briefCard(r, d, changed) {
  const K = kit(), tpls = K.templates;
  const sel = h("select", { id: "pr-tpl", "aria-label": "Template" }, h("option", { value: "", text: tpls.length ? "Choose a template…" : "No templates yet" }),
    ...tpls.map(t => h("option", { value: t.id, text: (t.name || "Untitled") + (t.id === K.defaultTemplate ? " (default)" : ""), selected: t.id === d.briefTemplate })));
  const holder = h("div", { class: "pr-brief-edit" });
  const sigNow = () => ({ show: d.sign.show, off: word(d, "signOff"), name: d.sign.name, company: word(d, d.sign.company) });
  const prev = briefPreview(() => d.welcome, () => d, () => pdfLangs(r), { sign: () => d.sign.place === "brief" ? sigNow() : null });
  const drawField = () => { holder.textContent = ""; holder.append(F(d, "welcome", "area", "Brief (shown right after the header)", { wide: true, rows: 8 }, () => { changed(); prev.draw(); })); };
  drawField();
  const use = () => {
    const t = tpls.find(x => x.id === sel.value); if (!t) { toast("Pick a template first."); return; }
    const apply = () => { d.welcome = { ...t.body }; d.briefTemplate = t.id; changed(); drawField(); prev.draw(); toast("Template “" + (t.name || "Untitled") + "” used. Edit the text for this client as you like."); };
    const cur = d.welcome, same = cur.en === t.body.en && cur.ar === t.body.ar;
    if ((cur.en || cur.ar) && !same) confirmInline(useBtn, "Replace this proposal's brief with the template?", apply, "Replace"); else apply();
  };
  const useBtn = h("button", { class: "btn sm primary", type: "button", text: "Use template", onclick: use });
  const scope = card(h("span", { class: "grow" }, "Brief"),
    h("p", { class: "adm-intro", style: "margin:0", text: "The letter the client reads first, right after the header with their name. Start from one of your templates, then change it for this client. Words in square brackets are filled in for you." }),
    h("div", { class: "pr-tpl-row" }, sel, useBtn, h("button", { class: "btn sm", type: "button", text: "Edit templates", onclick: () => { VIEW.show = "kit"; openPanel("proposals"); } })),
    holder, prev.el);
  scope.querySelector(".pr-brief-edit").after(placeholderChips(scope));
  return scope;
}

/** A name in English and Arabic side by side (or English only when the site is English only). */
function biName(obj, key, label, onChange) {
  const v = obj[key] = obj[key] && typeof obj[key] === "object" ? obj[key] : { en: "", ar: "" };
  const hasAr = Store.draft.site.languages !== "en" || v.ar;
  const en = F(v, "en", "text", hasAr ? "English" : label, { lang: "en", noAi: true }, onChange);
  if (!hasAr) return en;
  const ar = F(v, "ar", "text", "العربية", { lang: "ar", noAi: true }, onChange);
  ar.querySelectorAll("input").forEach(i => { i.dir = "rtl"; i.lang = "ar"; });
  en.classList.add("bi-en"); ar.classList.add("bi-ar");
  return h("div", { class: "field bi wide" }, h("span", { class: "bi-label", text: label }), h("div", { class: "bi-row" }, en, ar));
}
const companyOpts = d => [["advertising", plain(word(d || {}, "advertising"))], ["production", plain(word(d || {}, "production"))]];
const placeOpts = [["end", "At the end of the overview, before the contact band"], ["brief", "Under the brief, like a letter"]];

function signCard(r, d, changed) {
  const sg = d.sign, prevBox = h("div", { class: "pr-sign-prev" });
  const drawPrev = () => { prevBox.textContent = ""; if (!sg.show) { prevBox.append(h("p", { class: "hint", text: "No signature on this proposal." })); return; }
    pdfLangs(r).forEach(l => { const L = v => (v && (v[l] || v.en || v.ar)) || "";
      prevBox.append(h("div", { lang: l, dir: l === "ar" ? "rtl" : "ltr" }, h("p", { text: L(word(d, "signOff")) }), h("b", { text: L(sg.name) || (l === "ar" ? "[اسم المرسل]" : "[sender name]") }), h("small", { text: L(word(d, sg.company)) }))); }); };
  const ch = () => { changed(); drawPrev(); };
  drawPrev();
  const K = kit();
  const saveDefault = () => { K.sender = { ...sg.name }; K.company = sg.company; K.place = sg.place; scheduleSave(); toast("Saved as the default for new proposals"); };
  return card("Signature",
    h("p", { class: "adm-intro", style: "margin:0", text: "Shown on the proposal and in the PDF: the sender's name, then Dorma Advertising or Dorma Production." }),
    h("div", { class: "fields" },
      F(sg, "show", "toggle", "Show a signature", {}, () => { ch(); openPanel("proposals"); }),
      sg.show ? biName(sg, "name", "Sender name", ch) : null,
      sg.show ? F(sg, "company", "select", "Sign as", { options: companyOpts(d), preview: false }, ch) : null,
      sg.show ? F(sg, "place", "select", "Where it goes", { options: placeOpts, preview: false }, ch) : null),
    prevBox,
    sg.show ? h("div", { class: "pr-actions" }, h("button", { class: "btn sm", type: "button", text: "Save as my default", title: "New proposals start with this sender, company and place", onclick: saveDefault })) : null);
}

/* Content → Proposals → Templates and signature: the brief templates and the defaults for new proposals. */
function kitPanel(body) {
  const K = kit(), touchKit = () => scheduleSave();
  body.append(h("p", { class: "adm-intro" }, "Templates are ready-made briefs. A new proposal starts with the default one, and any proposal can switch to another under Brief → Use template, then edit its own copy. Changing a template here doesn't change proposals that already used it. Templates are saved with the site settings, like the AI writing presets."));
  /* preview with a real client */
  const rows = (Proposals.rows || []).filter(x => x.status !== "archived");
  const SAMPLE = { client: { name: { en: "Sample client", ar: "عميل تجريبي" } }, date: today(), services: [], sign: { name: K.sender, company: K.company } };
  const pv = { id: rows[0] ? rows[0].id : "" };
  const sampleData = () => { const x = rows.find(y => y.id === pv.id); return x ? { ...normalizeProposal(x.data), sign: { ...normalizeProposal(x.data).sign, name: (x.data.sign && x.data.sign.name && (x.data.sign.name.en || x.data.sign.name.ar)) ? x.data.sign.name : K.sender } } : SAMPLE; };
  const pvSel = h("select", { "aria-label": "Preview with" }, ...rows.map(x => h("option", { value: x.id, text: nameOf(x) })), h("option", { value: "", text: "Sample client", selected: !rows.length }));
  const previews = [];
  pvSel.addEventListener("change", () => { pv.id = pvSel.value; previews.forEach(p => p.draw()); });
  const list = h("div", { class: "pr-chosen" });
  const draw = () => {
    list.textContent = ""; previews.length = 0;
    K.templates.forEach((t, i) => {
      const prev = briefPreview(() => t.body, sampleData, siteLangsNow);
      previews.push(prev);
      const isDef = K.defaultTemplate === t.id;
      const item = h("div", { class: "pr-item" },
        h("div", { class: "pr-item-head" }, h("b", { text: (t.name || "Untitled") + (isDef ? " · default" : "") }),
          h("span", { class: "pr-item-btns" },
            h("button", { class: "btn sm", type: "button", disabled: isDef, text: isDef ? "Default" : "Make default", title: "New proposals start with this brief", onclick: () => { K.defaultTemplate = t.id; touchKit(); draw(); } }),
            h("button", { class: "btn sm", type: "button", html: IC.copy + "Duplicate", onclick: () => { K.templates.splice(i + 1, 0, { id: "tpl-" + Date.now().toString(36), name: (t.name || "Untitled") + " (copy)", body: { ...t.body } }); touchKit(); draw(); } }),
            h("button", { class: "btn sm danger", type: "button", text: "Remove", onclick: e => confirmInline(e.currentTarget.parentNode, "Remove this template? Proposals that used it keep their text.", () => { K.templates.splice(i, 1); if (isDef) K.defaultTemplate = K.templates[0] ? K.templates[0].id : ""; touchKit(); draw(); }, "Remove") }))),
        h("div", { class: "fields" }, F(t, "name", "text", "Template name (only you see it)", { wide: true, noAi: true }, () => { touchKit(); item.querySelector(".pr-item-head b").textContent = (t.name || "Untitled") + (isDef ? " · default" : ""); }),
          F(t, "body", "area", "Brief", { wide: true, rows: 7 }, () => { touchKit(); prev.draw(); })));
      item.append(placeholderChips(item), prev.el);
      list.append(item);
    });
    if (!K.templates.length) list.append(h("p", { class: "pr-empty", text: "No templates. Add one with New template." }));
  };
  draw();
  body.append(card(h("span", { class: "grow" }, "Brief templates"),
    h("div", { class: "pr-tpl-row" },
      h("button", { class: "btn sm primary", type: "button", html: IC.plus + "New template", onclick: () => { K.templates.push({ id: "tpl-" + Date.now().toString(36), name: "New template", body: { en: "Dear [client name],\n\n", ar: Store.draft.site.languages === "en" ? "" : "عزيزنا [اسم العميل]،\n\n" } }); touchKit(); draw(); } }),
      h("label", { class: "pr-pv" }, h("span", { class: "hint", text: "Preview with" }), pvSel)),
    list));
  /* placeholders */
  body.append(card("Placeholders", h("p", { class: "adm-intro", style: "margin:0", text: "Type these in a brief (English or Arabic name, any capitals). They are filled in for each client and each language." }),
    h("table", { class: "pr-ph" }, h("tbody", {}, ...PLACEHOLDERS.map(p => h("tr", {}, h("td", {}, h("code", { text: p.en })), h("td", {}, h("code", { text: p.ar, dir: "rtl" })), h("td", { text: p.label + (p.key === "client" ? " ([customer name] works too)" : p.key === "services" ? " (the proposal's service pages, “A, B and C”)" : p.key === "date" ? " (the proposal's date, “28 November 2026”)" : "") })))))));
  /* signature defaults */
  const def = h("div", { class: "fields" },
    biName(K, "sender", "Default sender name", touchKit),
    F(K, "company", "select", "Default sign as", { options: companyOpts(null), preview: false }, touchKit),
    F(K, "place", "select", "Where the signature goes", { options: placeOpts, preview: false }, touchKit));
  body.append(card("Signature defaults", h("p", { class: "adm-intro", style: "margin:0", text: "New proposals start with these. Each proposal can change its own sender and company under Signature. Proposals without a sender name get this one when you open them." }), def));
}

export { panelProposals, esc };
