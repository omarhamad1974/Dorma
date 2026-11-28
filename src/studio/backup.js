/* ================= BACKUPS (pure helpers) =================
   One JSON file with everything the studio edits: the draft, the live site, the social plan and the client proposals.
   Pictures and videos are not inside the file: they stay in the Library (GitHub repo and Supabase Storage); the file
   keeps their names and addresses. Used by studio → Site care → Backups and tested in tests/backup.test.ts. */

const FORMAT = "dorma-backup";
const FORMAT_VERSION = 1;

const plainText = v => v && typeof v === "object" ? (v.en || v.ar || "") : String(v ?? "");

/** The backup file's content.
    @param {{ draft: any, live: any, social?: any, proposals?: any[], brand?: any, now?: Date }} o */
function buildBackup({ draft, live, social = null, proposals = [], brand = "", now = new Date() }) {
  return {
    format: FORMAT, version: FORMAT_VERSION, exportedAt: now.toISOString(), site: plainText(brand) || "Site",
    note: "Pictures and videos are not in this file. They stay in the Library (GitHub and Supabase Storage); this file keeps their names and addresses.",
    draft: draft || null, live: live || null, social: social || null, proposals: Array.isArray(proposals) ? proposals : []
  };
}

/** A file name such as dorma-backup-2026-11-28-1042.json */
function backupFileName(brand, now = new Date(), what = "backup") {
  const slug = plainText(brand).toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").split("-")[0] || "site";
  const p = n => String(n).padStart(2, "0");
  return `${slug}-${what}-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}.json`;
}

const looksLikeConfig = c => !!c && typeof c === "object" && !Array.isArray(c) && Array.isArray(c.pages) && !!c.site && typeof c.site === "object";

/** @returns {any} Reads a backup file's text. Accepts a Dorma backup file, or a bare settings object (a downloaded version).
    Returns { ok, error } or { ok, kind, draft, live, social, proposals, exportedAt, summary }. */
function readBackup(text) {
  let j;
  try { j = JSON.parse(String(text || "").replace(/^﻿/, "")); } catch { return { ok: false, error: "This file isn't a backup: it isn't valid JSON." }; }
  if (!j || typeof j !== "object") return { ok: false, error: "This file isn't a backup." };
  if (j.format === FORMAT) {
    if (Number(j.version) > FORMAT_VERSION) return { ok: false, error: "This backup was made by a newer studio. Update the site first." };
    const draft = looksLikeConfig(j.draft) ? j.draft : looksLikeConfig(j.live) ? j.live : null;
    if (!draft) return { ok: false, error: "This backup has no site settings in it." };
    const live = looksLikeConfig(j.live) ? j.live : null;
    const proposals = Array.isArray(j.proposals) ? j.proposals.filter(p => p && typeof p === "object" && typeof p.slug === "string" && p.data) : [];
    const social = j.social && typeof j.social === "object" ? j.social : null;
    return { ok: true, kind: "backup", draft, live, social, proposals, exportedAt: j.exportedAt || "", site: j.site || "", summary: summarize(draft) };
  }
  if (looksLikeConfig(j)) return { ok: true, kind: "settings", draft: j, live: null, social: null, proposals: [], exportedAt: "", site: plainText(j.site.brand), summary: summarize(j) };
  return { ok: false, error: "This file isn't a Dorma backup or a downloaded version." };
}

/** Counts for the "what's in this file" line. */
function summarize(c) {
  const n = a => Array.isArray(a) ? a.length : 0;
  const sections = (c.pages || []).reduce((t, p) => t + n(p && p.sections), 0);
  return { pages: n(c.pages), sections, modals: n(c.modals), flows: n(c.flows), posts: n(c.posts), media: n(c.media) };
}
function summaryText(s) {
  const part = (k, one, many) => s[k] ? s[k] + " " + (s[k] === 1 ? one : many) : "";
  return [part("pages", "page", "pages"), part("sections", "section", "sections"), part("modals", "modal", "modals"), part("flows", "flow", "flows"), part("posts", "blog post", "blog posts"), part("media", "library item", "library items")].filter(Boolean).join(", ") || "empty";
}

/** Proposals in the backup whose link code isn't used yet (import adds these and never overwrites).
    @param {any[]} fromFile @param {any[]} existing @returns {any[]} */
function missingProposals(fromFile, existing) {
  const have = new Set((existing || []).map(r => r && r.slug)), ids = new Set((existing || []).map(r => r && r.id));
  return (fromFile || []).filter(r => r && r.slug && !have.has(r.slug)).map(r => ({ ...r, id: r.id && !ids.has(r.id) ? r.id : undefined }));
}

/** Version history: the plain-words kind and the size. */
const KIND_NAME = { publish: "Published", snapshot: "Snapshot", auto: "Safety copy" };
function fmtSize(b) {
  b = Number(b) || 0;
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(b < 10240 ? 1 : 0) + " KB";
  return (b / 1048576).toFixed(b < 10485760 ? 1 : 0) + " MB";
}
const clampKeep = v => Math.min(100, Math.max(5, Math.round(Number(v) || 30)));

/** What changed between two settings objects, in counts per area (for "Compare with the draft"). */
function compareConfigs(a, b) {
  const out = [];
  const byId = list => new Map((Array.isArray(list) ? list : []).filter(x => x && x.id).map(x => [x.id, JSON.stringify(x)]));
  [["pages", "Pages"], ["modals", "Modals"], ["flows", "Flows"], ["posts", "Blog posts"], ["media", "Library items"]].forEach(([k, name]) => {
    const A = byId(a && a[k]), B = byId(b && b[k]); let added = 0, removed = 0, changed = 0;
    B.forEach((v, id) => { if (!A.has(id)) added++; else if (A.get(id) !== v) changed++; });
    A.forEach((_, id) => { if (!B.has(id)) removed++; });
    if (added || removed || changed) out.push({ area: name, added, removed, changed });
  });
  [["site", "Site and titles"], ["theme", "Colours and type"], ["motion", "Animation"], ["loader", "Loader"], ["menu", "Menu"]].forEach(([k, name]) => {
    if (JSON.stringify((a || {})[k]) !== JSON.stringify((b || {})[k])) out.push({ area: name, added: 0, removed: 0, changed: 1 });
  });
  return out;
}

export { FORMAT, FORMAT_VERSION, buildBackup, backupFileName, readBackup, summarize, summaryText, missingProposals, KIND_NAME, fmtSize, clampKeep, compareConfigs };
