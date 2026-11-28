/* ================= STUDIO › INBOX =================
   Messages from the site's contact and quote request forms, and from "Request a quote" on client proposals.
   Open one to read it (it is marked read), reply by email, archive, delete, or export a view as CSV.
   Messages are stored in the studio database only; visitors can send but never read them. */
import './inbox.css';
import { h, plain } from './core';
import { Store, listEnquiries, updateEnquiry, deleteEnquiries, loadBadges, loadProposals } from './store';
import { IC, card, toast, openPanel, confirmInline, Admin } from './admin';
import { KIND_NAME, STATUS_NAME, filterEnquiries, counts, subjectOf, replyLink, toCsv } from './inbox';

const V = { view: "inbox", kind: "all", q: "", open: "", sel: new Set(), rows: [], where: "db" };
const when = t => { const d = Date.parse(t || ""); return isNaN(d) ? "" : new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); };

async function panelInbox(body) {
  body.append(h("p", { class: "adm-intro", text: "Loading messages…" }));
  const r = await listEnquiries(); if (!body.isConnected) return;
  V.rows = r.rows; V.where = r.where; V.sel = new Set([...V.sel].filter(id => V.rows.some(e => e.id === id)));
  body.textContent = ""; draw(body);
}

function draw(body) {
  const C = counts(V.rows);
  body.append(h("p", { class: "adm-intro" },
    "Messages people send from the site's contact and quote request forms, and quote requests from client proposals. Only signed-in editors can read them. ",
    "Open a message to read it, then reply by email. ", h("button", { type: "button", class: "linkish", text: "Form settings", onclick: () => openPanel("inboxSet") })));
  if (V.where !== "db") body.append(h("p", { class: "pr-warn", text: "This studio saves in this browser only, so the Inbox shows test messages sent from this browser. On the online site, messages are saved in the studio database." }));

  const views = [["inbox", "Inbox", C.inbox], ["new", "Unread", C.new], ["archived", "Archived", C.archived], ["all", "All", C.all]];
  const find = h("input", { type: "search", class: "ib-find", placeholder: "Search name, email, company, message…", "aria-label": "Search messages", value: V.q });
  const kindSel = h("select", { "aria-label": "Type" }, ...[["all", "All types"], ["contact", "Contact"], ["quote", "Quote requests"], ["proposal", "From proposals"]].map(([v, l]) => h("option", { value: v, text: l, selected: V.kind === v })));
  const list = h("div", { class: "ib-list", role: "list" }), bulk = h("div", { class: "ib-bulk" });
  const redraw = () => openPanel("inbox");
  const shown = () => filterEnquiries(V.rows, V);

  const doUpdate = async (ids, patch, msg) => { if (await updateEnquiry(ids, patch, V.where)) { V.rows.forEach(e => { if (ids.includes(e.id)) Object.assign(e, patch); }); if (msg) toast(msg); return true; } toast("Couldn't save. Try again."); return false; };
  const doDelete = async ids => { if (await deleteEnquiries(ids, V.where)) { V.rows = V.rows.filter(e => !ids.includes(e.id)); ids.forEach(id => V.sel.delete(id)); toast(ids.length === 1 ? "Message deleted" : ids.length + " messages deleted"); redraw(); } else toast("Couldn't delete. Try again."); };

  const drawBulk = () => {
    bulk.textContent = "";
    const ids = [...V.sel].filter(id => shown().some(e => e.id === id));
    const all = h("input", { type: "checkbox", id: "ib-all", "aria-label": "Select all shown" }); all.checked = !!ids.length && ids.length === shown().length; all.indeterminate = !!ids.length && !all.checked;
    all.addEventListener("change", () => { V.sel = new Set(all.checked ? shown().map(e => e.id) : []); drawList(); drawBulk(); });
    bulk.append(h("label", { class: "pr-check", for: "ib-all" }, all, h("span", { text: ids.length ? ids.length + " selected" : "Select all" })));
    const b = (label, fn, cls = "") => h("button", { class: "btn sm " + cls, type: "button", disabled: !ids.length, text: label, onclick: fn });
    bulk.append(
      b("Mark read", async () => { if (await doUpdate(ids, { status: "read" })) redraw(); }),
      b("Mark unread", async () => { if (await doUpdate(ids, { status: "new" })) redraw(); }),
      V.view === "archived" ? b("Move to Inbox", async () => { if (await doUpdate(ids, { status: "read" }, "Moved to the Inbox")) redraw(); }) : b("Archive", async () => { if (await doUpdate(ids, { status: "archived" }, "Archived")) redraw(); }),
      b("Delete", e => confirmInline(e.currentTarget, "Delete " + ids.length + (ids.length === 1 ? " message" : " messages") + " for good?", () => doDelete(ids), "Delete"), "danger"),
      h("span", { class: "grow" }),
      h("button", { class: "btn sm", type: "button", html: IC.down + "Export CSV", title: "Download the messages shown as a spreadsheet file", disabled: !shown().length, onclick: () => exportCsv(ids.length ? V.rows.filter(e => ids.includes(e.id)) : shown()) }));
  };

  const drawList = () => {
    list.textContent = "";
    const rows = shown();
    if (!rows.length) { list.append(h("p", { class: "md-none", text: V.rows.length ? "No messages here." : "No messages yet. When someone sends the contact or quote request form, it appears here." })); return; }
    rows.forEach(e => {
      const id = "ib-" + e.id, cb = h("input", { type: "checkbox", id, "aria-label": "Select message from " + (e.name || e.email) }); cb.checked = V.sel.has(e.id);
      cb.addEventListener("change", () => { if (cb.checked) V.sel.add(e.id); else V.sel.delete(e.id); drawBulk(); });
      const open = V.open === e.id;
      const row = h("div", { class: "ib-row" + (e.status === "new" ? " unread" : "") + (open ? " open" : ""), role: "listitem" });
      const head = h("button", { class: "ib-head", type: "button", "aria-expanded": String(open), onclick: async () => {
        V.open = open ? "" : e.id;
        if (!open && e.status === "new") { await doUpdate([e.id], { status: "read" }); }
        drawList(); drawBulk(); } },
        h("span", { class: "ib-dot", "aria-label": e.status === "new" ? "Unread" : "" }),
        h("span", { class: "ib-who" }, h("b", { text: e.name || e.email || "No name" }), h("small", { text: subjectOf(e) })),
        h("span", { class: "ib-snip", text: (e.message || "").slice(0, 120) }),
        h("span", { class: "ib-meta mono" }, h("span", { class: "ib-kind k-" + e.kind, text: KIND_NAME[e.kind] || e.kind }), h("span", { text: when(e.created_at) })));
      row.append(h("div", { class: "ib-line" }, cb, head));
      if (open) row.append(detail(e, doUpdate, doDelete, redraw));
      list.append(row);
    });
  };

  find.addEventListener("input", () => { V.q = find.value; drawList(); drawBulk(); });
  kindSel.addEventListener("change", () => { V.kind = kindSel.value; drawList(); drawBulk(); });
  body.append(h("div", { class: "ib-tools" },
    h("div", { class: "pr-view", role: "group", "aria-label": "Show" }, ...views.map(([k, l, n]) =>
      h("button", { type: "button", class: "btn sm" + (V.view === k ? " on" : ""), "aria-pressed": String(V.view === k), text: l + " (" + n + ")", onclick: () => { V.view = k; V.sel.clear(); redraw(); } }))),
    kindSel, find,
    h("button", { class: "btn sm", type: "button", html: IC.replay + "Refresh", onclick: () => { void loadBadges(); redraw(); } })));
  body.append(bulk, list);
  drawList(); drawBulk();
}

function field(label, value, link) {
  if (!value) return null;
  return h("div", { class: "ib-f" }, h("span", { class: "mono", text: label }), link ? h("a", { href: link, text: value, target: link.startsWith("#") ? "_blank" : null, rel: "noopener" }) : h("span", { text: value }));
}

function detail(e, doUpdate, doDelete, redraw) {
  const brand = plain(Store.draft && Store.draft.site && Store.draft.site.brand) || "";
  const reply = replyLink(e, brand);
  const box = h("div", { class: "ib-detail" },
    h("div", { class: "ib-fields" },
      field("Name", e.name), field("Email", e.email, e.email ? "mailto:" + e.email : ""), field("Phone", e.phone, e.phone ? "tel:" + e.phone.replace(/[^\d+]/g, "") : ""),
      field("Company", e.company), field("Service", e.service), field("Quantity", e.quantity), field("Deadline", e.deadline),
      field("Language", e.lang === "ar" ? "Arabic" : e.lang === "en" ? "English" : ""), field("Sent from", e.page ? "#" + e.page : "", e.page ? "#" + e.page : ""),
      field("Received", when(e.created_at)), field("Status", STATUS_NAME[e.status] + (e.replied_at ? " · reply started " + when(e.replied_at) : ""))),
    e.message ? h("div", { class: "ib-msg", dir: "auto", text: e.message }) : h("p", { class: "hint", text: "No message text." }),
    e.kind === "proposal" ? h("p", { class: "ib-prop" }, "From the proposal for ", h("b", { text: e.client || e.proposal_slug }), " ",
      h("button", { type: "button", class: "linkish", text: "Open the proposal", onclick: async ev => {
        const rows = await loadProposals(), p = rows.find(r => r.id === e.proposal_id) || rows.find(r => r.slug === e.proposal_slug);
        if (p) { Admin.sel.proposal = p.id; openPanel("proposals"); } else ev.target.replaceWith(h("small", { text: "(this proposal was deleted)" })); } })) : null,
    h("div", { class: "pr-actions" },
      reply ? h("a", { class: "btn sm primary", href: reply, html: IC.up + "Reply by email", onclick: () => { void doUpdate([e.id], { replied_at: new Date().toISOString(), status: e.status === "new" ? "read" : e.status }); } })
        : h("span", { class: "hint", text: e.phone ? "No email given: call or message " + e.phone + "." : "No email given." }),
      h("button", { class: "btn sm", type: "button", text: "Copy", title: "Copy the message as text", onclick: () => { const t = [subjectOf(e), e.name, e.email, e.phone, e.company, "", e.message].filter(x => x != null).join("\n"); navigator.clipboard && navigator.clipboard.writeText(t).then(() => toast("Copied"), () => toast("Couldn't copy")); } }),
      h("button", { class: "btn sm", type: "button", text: "Mark unread", onclick: async () => { if (await doUpdate([e.id], { status: "new" })) { V.open = ""; redraw(); } } }),
      h("button", { class: "btn sm", type: "button", text: e.status === "archived" ? "Move to Inbox" : "Archive", onclick: async () => { if (await doUpdate([e.id], { status: e.status === "archived" ? "read" : "archived" }, e.status === "archived" ? "Moved to the Inbox" : "Archived")) { V.open = ""; redraw(); } } }),
      h("button", { class: "btn sm danger", type: "button", text: "Delete", onclick: ev => confirmInline(ev.currentTarget.parentNode, "Delete this message for good?", () => doDelete([e.id]), "Delete") })));
  return box;
}

function exportCsv(rows) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const a = h("a", { href: URL.createObjectURL(blob), download: "dorma-messages-" + new Date().toISOString().slice(0, 10) + ".csv" });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(rows.length + (rows.length === 1 ? " message" : " messages") + " exported");
}

/* Inbox → Form settings: the same card as Site and titles → Forms and enquiries, plus how spam is kept out. */
function panelInboxSettings(body, formsCard) {
  body.append(h("p", { class: "adm-intro", text: "Where the site's forms send messages, and what visitors see after sending. Publish to apply changes." }));
  body.append(formsCard(Store.draft));
  body.append(card("Spam protection", h("ul", { class: "ib-notes" },
    h("li", { text: "A hidden field that people never see: automatic form fillers that fill it in are ignored." }),
    h("li", { text: "Forms sent less than 2.5 seconds after the page opened are ignored." }),
    h("li", { text: "One visitor can send up to 5 messages in 10 minutes, one email address up to 5 an hour, and the whole site up to 300 a day." }),
    h("li", { text: "The Inbox keeps the newest 5,000 messages." }))));
  body.append(card("Adding a contact form", h("p", { class: "adm-intro", style: "margin:0" },
    "Add a Contact form section to any page (Content → Pages → Add section → Contact form). Quote request forms on service pages, catalogs and the Request a Quote modal already send to the Inbox, and a quote request sent from a client proposal shows which proposal it came from.")));
}

export { panelInbox, panelInboxSettings };
