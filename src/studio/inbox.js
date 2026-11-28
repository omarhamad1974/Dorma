/* ================= INBOX (pure logic) =================
   Messages from the site's contact and quote request forms and from "Request a quote" on client proposals
   (table enquiries, 0007_inbox_proposal_alerts.sql). Filtering, the reply-by-email link and the CSV export.
   Nothing here touches the page; the studio's Inbox panel imports these helpers. */

const KIND_NAME = { contact: "Contact", quote: "Quote request", proposal: "Proposal" };
const STATUS_NAME = { new: "New", read: "Read", archived: "Archived" };

/** Which messages a view shows. view: inbox (new and read) | new | archived | all. kind: all | contact | quote | proposal. */
function filterEnquiries(rows, { view = "inbox", kind = "all", q = "" } = {}) {
  const words = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
  return (rows || []).filter(e => {
    if (view === "inbox" && e.status === "archived") return false;
    if (view === "new" && e.status !== "new") return false;
    if (view === "archived" && e.status !== "archived") return false;
    if (kind !== "all" && e.kind !== kind) return false;
    if (!words.length) return true;
    const hay = [e.name, e.email, e.phone, e.company, e.service, e.message, e.client, e.proposal_slug].join(" ").toLowerCase();
    return words.every(w => hay.includes(w));
  });
}

function counts(rows) {
  const c = { inbox: 0, new: 0, archived: 0, all: 0 };
  (rows || []).forEach(e => { c.all++; if (e.status === "archived") c.archived++; else c.inbox++; if (e.status === "new") c.new++; });
  return c;
}

/** One line for the list: the sender and what it's about. */
function subjectOf(e) {
  if (e.kind === "proposal") return "Quote request · proposal for " + (e.client || e.proposal_slug || "a client");
  if (e.service) return (e.kind === "quote" ? "Quote request · " : "") + e.service;
  return KIND_NAME[e.kind] || "Message";
}

/** A mailto: link that opens the editor's email app with a reply to the sender (empty without an email). */
function replyLink(e, brand = "") {
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email || "")) return "";
  const ar = e.lang === "ar";
  const subject = (ar ? "رد: " : "Re: ") + subjectOf(e) + (brand ? " · " + brand : "");
  const when = String(e.created_at || "").slice(0, 10);
  const quoted = String(e.message || "").split("\n").map(l => "> " + l).join("\n");
  const hello = ar ? "مرحباً " + (e.name || "") + "،\n\n\n\n" : "Hello " + (e.name || "") + ",\n\n\n\n";
  const body = hello + (quoted ? (ar ? "رسالتك بتاريخ " : "Your message of ") + when + ":\n" + quoted : "");
  return "mailto:" + encodeURIComponent(e.email) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}

const CSV_COLS = [["created_at", "Received"], ["status", "Status"], ["kind", "Type"], ["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["company", "Company"],
  ["service", "Service"], ["quantity", "Quantity"], ["deadline", "Deadline"], ["message", "Message"], ["client", "Proposal client"], ["proposal_slug", "Proposal code"],
  ["lang", "Language"], ["page", "Sent from"], ["replied_at", "Replied"]];
/** A cell is quoted, and a leading = + - @ is defused so spreadsheet apps never run it as a formula. */
const csvCell = v => { let s = v == null ? "" : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
/** CSV with a byte-order mark so Excel opens Arabic text correctly. */
function toCsv(rows) {
  const lines = [CSV_COLS.map(c => c[1]).join(","), ...(rows || []).map(e => CSV_COLS.map(([k]) => csvCell(e[k])).join(","))];
  return "﻿" + lines.join("\r\n") + "\r\n";
}

export { KIND_NAME, STATUS_NAME, filterEnquiries, counts, subjectOf, replyLink, toCsv, csvCell };
