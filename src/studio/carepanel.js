/* ================= STUDIO › SITE CARE =================
   Health check: what needs attention on the site (broken links, missing pictures, alt text, Arabic, pages nobody can
   reach, large files, settings, hidden things, unused library items), each with "Fix it" that opens the right place.
   It also shows whether the database is being kept awake and how big it is.
   Backups: download everything as one file, bring a file back, and the version history (publishes, snapshots and
   safety copies) with labels, pins, compare, download and "Put in draft". */
import './care.css';
import { h, clone } from './core';
import { Store, Social, Proposals, listVersions, versionConfig, restoreVersion, saveSnapshot, updateVersion, deleteVersion, replaceDraft, databaseSize, keepAliveLog, pingNow, backupExtras, loadProposals, saveProposal, scheduleSocialSave } from './store';
import { normalizeSocial } from './social';
import { IC, card, toast, touch, openPanel, F, confirmInline, goToSlot, updateTop } from './admin';
import { CHECKS, LEVELS, runHealth, webLinks } from './health';
import { buildBackup, backupFileName, readBackup, summaryText, missingProposals, KIND_NAME, fmtSize, clampKeep, compareConfigs } from './backup';
import { REPO_URL } from '../config';

const FREE_DB = 500 * 1024 * 1024; // Supabase free plan database size
const PAUSE_DAYS = 7;               // Supabase pauses a free project after about a week without activity
const EXPORT_KEY = "dorma.lastExport";
const when = t => { const d = typeof t === "number" ? t : Date.parse(t || ""); return isNaN(d) || !d ? "" : new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); };
const ago = t => { const ms = Date.now() - (typeof t === "number" ? t : Date.parse(t || "")); if (isNaN(ms)) return ""; const m = Math.round(ms / 60000);
  return m < 1 ? "just now" : m < 60 ? m + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : (Math.round(m / 1440) === 1 ? "1 day ago" : Math.round(m / 1440) + " days ago"); };
const lsGet = k => { try { return localStorage.getItem(k) || ""; } catch { return ""; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };

function download(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = h("a", { href: URL.createObjectURL(blob), download: name }); document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/* ================= HEALTH CHECK ================= */
const HV = { level: "", check: "", showIgnored: false, open: {}, web: null, webBusy: false };

function panelHealth(body) {
  const D = Store.draft;
  body.append(h("p", { class: "adm-intro", text: "Everything on the site that needs attention, checked in the draft. Each row says where it is; Fix it opens that place in the studio. Hidden sections and draft blog posts are left out of the checks, except in Hidden things. Ignore a row you're happy with and it stays out of the list." }));
  const out = h("div", { class: "hc-wrap" });
  body.append(siteCard(), out);
  const draw = () => {
    out.textContent = "";
    const R = runHealth(D), list = HV.showIgnored ? R.ignored : R.issues;
    /* summary tiles: tap one to show only that level */
    const tiles = h("div", { class: "hc-tiles", role: "group", "aria-label": "Show" });
    [["error", R.counts.error], ["warn", R.counts.warn], ["info", R.counts.info]].forEach(([lv, n]) => tiles.append(
      h("button", { type: "button", class: "hc-tile lv-" + lv + (HV.level === lv ? " on" : ""), "aria-pressed": String(HV.level === lv), onclick: () => { HV.level = HV.level === lv ? "" : lv; draw(); } },
        h("b", { text: String(n) }), h("span", { text: LEVELS[lv] }))));
    const ign = h("label", { class: "toggle" }, h("input", { type: "checkbox", checked: HV.showIgnored, onchange: e => { HV.showIgnored = e.target.checked; draw(); } }), "Show ignored (" + R.ignored.length + ")");
    out.append(h("div", { class: "hc-bar" }, tiles, ign, h("button", { class: "btn sm", type: "button", html: IC.replay + "Check again", onclick: () => { draw(); toast("Checked again."); } })));
    const shown = list.filter(x => !HV.level || x.level === HV.level);
    if (!shown.length) { out.append(h("div", { class: "miss-done" }, h("b", { text: HV.showIgnored ? "Nothing ignored." : "All clear." }), h("span", { text: HV.showIgnored ? "" : HV.level ? " Nothing at this level." : " Nothing needs attention right now." }))); }
    CHECKS.forEach(([ck, name]) => {
      const rows = shown.filter(x => x.check === ck); if (!rows.length) return;
      const worst = rows.some(x => x.level === "error") ? "error" : rows.some(x => x.level === "warn") ? "warn" : "info";
      const LIMIT = 25, all = !!HV.open[ck], items = h("div", { class: "hc-list" });
      (all ? rows : rows.slice(0, LIMIT)).forEach(x => items.append(issueRow(x, draw)));
      if (rows.length > LIMIT) items.append(h("button", { class: "btn sm", type: "button", style: "align-self:flex-start", text: all ? "Show fewer" : "Show all " + rows.length, onclick: () => { HV.open[ck] = !all; draw(); } }));
      out.append(card(h("span", { class: "grow" }, h("i", { class: "hc-dot lv-" + worst }), name + " · " + rows.length), items));
    });
    out.append(webCard());
  };
  draw();
}

function issueRow(x, redraw) {
  const D = Store.draft;
  const ignore = () => { D.health = D.health || {}; const L = D.health.ignore = Array.isArray(D.health.ignore) ? D.health.ignore : [];
    const i = L.indexOf(x.id); if (i >= 0) L.splice(i, 1); else L.push(x.id); touch(); redraw(); };
  const ignored = (D.health && D.health.ignore || []).includes(x.id);
  return h("div", { class: "hc-row lv-" + x.level },
    h("span", { class: "miss-badge hc-lv lv-" + x.level, text: LEVELS[x.level] }),
    h("div", { class: "hc-text" }, h("b", { text: x.title }), h("span", { class: "hc-where", text: x.where }), x.detail ? h("span", { class: "hint", text: x.detail }) : null),
    h("div", { class: "hc-acts" },
      x.go ? h("button", { class: "btn sm primary", type: "button", text: "Fix it", onclick: () => goToSlot(x.go) }) : null,
      h("button", { class: "btn sm", type: "button", text: ignored ? "Stop ignoring" : "Ignore", title: ignored ? "Show it in the list again" : "Hide this row from the list (saved with the site settings)", onclick: ignore })));
}

/* Outside web addresses: the browser can only tell whether a server answers at all (not the page's status), so a
   failure here means "the address didn't answer" (wrong domain, site down), not a missing page. */
function webCard() {
  const D = Store.draft, links = webLinks(D), box = h("div", { class: "hc-list" });
  const draw = () => { box.textContent = "";
    if (!links.length) { box.append(h("p", { class: "hint", style: "margin:0", text: "The site has no outside web addresses." })); return; }
    const res = HV.web || {};
    const bad = links.filter(l => res[l.url] === "bad"), checked = links.filter(l => res[l.url]).length;
    box.append(h("p", { class: "hint", style: "margin:0", text: links.length + " outside address" + (links.length === 1 ? "" : "es") + " on the site" + (checked ? " · " + checked + " checked · " + bad.length + " didn't answer" : "") + "." }));
    (checked ? bad : []).forEach(l => box.append(h("div", { class: "hc-row lv-error" }, h("span", { class: "miss-badge hc-lv lv-error", text: "No answer" }),
      h("div", { class: "hc-text" }, h("b", { text: l.url }), h("span", { class: "hc-where", text: l.where + (l.count > 1 ? " and " + (l.count - 1) + " more place" + (l.count > 2 ? "s" : "") : "") })),
      h("div", { class: "hc-acts" }, h("a", { class: "btn sm", href: l.url, target: "_blank", rel: "noopener", text: "Open" }), l.go ? h("button", { class: "btn sm primary", type: "button", text: "Fix it", onclick: () => goToSlot(l.go) }) : null))));
  };
  const run = async () => {
    if (HV.webBusy) return; HV.webBusy = true; btn.disabled = true; HV.web = {};
    let i = 0; const next = async () => { while (i < links.length) { const l = links[i++];
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 9000);
      try { await fetch(l.url, { mode: "no-cors", signal: ctl.signal, cache: "no-store", redirect: "follow" }); HV.web[l.url] = "ok"; } catch { HV.web[l.url] = "bad"; }
      clearTimeout(t); btn.textContent = "Checking… " + Object.keys(HV.web).length + "/" + links.length; } };
    await Promise.all([next(), next(), next(), next()]);
    HV.webBusy = false; btn.disabled = false; btn.textContent = "Check outside links again"; draw();
  };
  const btn = h("button", { class: "btn sm", type: "button", text: HV.web ? "Check outside links again" : "Check outside links", onclick: run, disabled: !links.length });
  draw();
  return card("Outside links", h("p", { class: "adm-intro", style: "margin:0", text: "Tries each outside web address used on the site (buttons, links in text, linked library files). The browser can only tell whether the address answers, so a page that moved on a working site still shows as fine. Open a link to be sure." }), btn, box);
}

/* Supabase keep-alive and database size */
function siteCard() {
  const box = h("div", { class: "hc-list" }, h("p", { class: "mono", text: "Checking…" }));
  const draw = async () => {
    if (Store.mode !== "db") { box.replaceChildren(h("p", { class: "hint", style: "margin:0", text: "This copy of the studio saves in the browser only, so there is no database to keep awake." })); return; }
    const [log, size, vs] = await Promise.all([keepAliveLog(), databaseSize(), listVersions()]);
    box.textContent = "";
    const rows = log.rows || [], last = rows.find(r => r.source !== "studio"), lastAny = rows[0];
    const days = last ? (Date.now() - Date.parse(last.at)) / 86400000 : Infinity;
    const lv = !log.ok ? "warn" : days <= 2 ? "ok" : days <= 5 ? "warn" : "error";
    const txt = !log.ok ? "The keep-alive log isn't set up yet (it arrives with this update's database change)."
      : !last ? "No automatic ping has arrived yet. The first one comes from GitHub within a day of this update going live."
      : "Last automatic ping " + ago(last.at) + " (" + when(last.at) + ")" + (last.note ? " · " + last.note : "") + ".";
    box.append(h("div", { class: "hc-row lv-" + (lv === "ok" ? "info" : lv) },
      h("span", { class: "miss-badge hc-lv lv-" + lv, text: lv === "ok" ? "Awake" : lv === "warn" ? "Check" : "At risk" }),
      h("div", { class: "hc-text" }, h("b", { text: "Keep-alive" }), h("span", { class: "hc-where", text: txt }),
        h("span", { class: "hint", text: "The free Supabase plan pauses a project after about " + PAUSE_DAYS + " days with no visits to the database. A GitHub job pings it every day so the site and studio never go to sleep." + (days > 2 && isFinite(days) ? " Pings have stopped: open the GitHub link and check the Keep Supabase awake job (GitHub turns off scheduled jobs after 60 days without changes to the repository; press Enable workflow there)." : "") })),
      h("div", { class: "hc-acts" },
        h("a", { class: "btn sm", href: REPO_URL + "/actions/workflows/keep-alive.yml", target: "_blank", rel: "noopener", text: "Open on GitHub" }),
        h("button", { class: "btn sm", type: "button", text: "Ping now", onclick: async e => { e.currentTarget.disabled = true; toast((await pingNow()) ? "Pinged. The database is awake." : "Couldn't ping. The keep-alive isn't set up yet."); void draw(); } }))));
    if (lastAny && lastAny !== last) box.append(h("p", { class: "hint", style: "margin:0", text: "Last ping of any kind: " + ago(lastAny.at) + " from " + (lastAny.source === "studio" ? "the studio" : lastAny.source) + "." }));
    const vBytes = vs.reduce((t, v) => t + (Number(v.bytes) || 0), 0), pct = size ? Math.min(100, size / FREE_DB * 100) : 0;
    const slv = pct > 80 ? "error" : pct > 60 ? "warn" : "info";
    box.append(h("div", { class: "hc-row lv-" + slv },
      h("span", { class: "miss-badge hc-lv lv-" + (slv === "info" ? "ok" : slv), text: size ? Math.round(pct) + "%" : "?" }),
      h("div", { class: "hc-text" }, h("b", { text: "Database size" }),
        h("span", { class: "hc-where", text: size ? fmtSize(size) + " of the free plan's 500 MB. Saved versions use " + fmtSize(vBytes) + " (" + vs.length + " versions)." : "Size not available yet." }),
        size ? h("span", { class: "hc-meter" }, h("i", { style: "width:" + pct.toFixed(1) + "%" })) : null,
        h("span", { class: "hint", text: "Pictures and videos are counted separately (1 GB of free storage). Keep fewer versions under Backups if this grows." })),
      h("div", { class: "hc-acts" }, h("button", { class: "btn sm", type: "button", text: "Backups", onclick: () => openPanel("backups") }))));
    const exp = lsGet(EXPORT_KEY);
    box.append(h("div", { class: "hc-row lv-" + (exp && Date.now() - Date.parse(exp) < 30 * 86400000 ? "info" : "warn") },
      h("span", { class: "miss-badge hc-lv lv-" + (exp && Date.now() - Date.parse(exp) < 30 * 86400000 ? "ok" : "warn"), text: exp ? "Saved" : "None" }),
      h("div", { class: "hc-text" }, h("b", { text: "Backup file" }), h("span", { class: "hc-where", text: exp ? "Last downloaded on this computer " + ago(exp) + "." : "No backup file downloaded on this computer yet." }),
        h("span", { class: "hint", text: "Version history lives in the same database as the site. A backup file on your computer is the copy that survives anything. Download one every month or before big changes." })),
      h("div", { class: "hc-acts" }, h("button", { class: "btn sm primary", type: "button", html: IC.down + "Download backup", onclick: () => exportAll() }))));
  };
  void draw();
  return card("Site connection and backups", box);
}

/* ================= BACKUPS ================= */
async function exportAll() {
  const D = Store.draft; toast("Preparing the backup…");
  const extra = Store.mode === "db" ? await backupExtras() : { social: Social.data ? clone(Social.data) : null, proposals: clone(Proposals.rows || []) };
  const now = new Date();
  download(backupFileName(D.site.brand, now), buildBackup({ draft: D, live: Store.live, social: extra.social, proposals: extra.proposals, brand: D.site.brand, now }));
  lsSet(EXPORT_KEY, now.toISOString()); toast("Backup downloaded.");
}

const BV = { open: null, diff: {} };
function panelBackups(body) {
  const D = Store.draft;
  D.backups = D.backups && typeof D.backups === "object" ? D.backups : { keep: 30 };
  body.append(h("p", { class: "adm-intro", text: "Every Publish keeps a copy of the site. You can also save a snapshot of the draft at any time, and download everything as one file to keep on your computer. Putting an older version back always saves a safety copy of the current draft first, so nothing is lost." }));

  /* ---------- download and bring back ---------- */
  const exp = lsGet(EXPORT_KEY);
  const file = h("input", { type: "file", accept: ".json,application/json", hidden: true });
  const result = h("div", { class: "bk-import" });
  file.addEventListener("change", async () => {
    const f = file.files && file.files[0]; file.value = ""; if (!f) return;
    const r = readBackup(await f.text()); result.textContent = "";
    if (!r.ok) { result.append(h("p", { class: "hc-err", role: "alert", text: r.error })); return; }
    const addProps = Store.mode === "db" || Proposals.rows ? missingProposals(r.proposals, await loadProposals()) : [];
    const socialBox = h("input", { type: "checkbox", checked: false }), propBox = h("input", { type: "checkbox", checked: addProps.length > 0 });
    const useLive = h("input", { type: "checkbox", checked: false });
    result.append(h("div", { class: "bk-file" },
      h("b", { text: f.name }),
      h("span", { class: "hint", text: (r.kind === "backup" ? "Backup" + (r.exportedAt ? " from " + when(r.exportedAt) : "") : "Downloaded version") + (r.site ? " · " + r.site : "") + " · " + summaryText(r.summary) }),
      r.live ? h("label", { class: "toggle" }, useLive, "Use the published (live) site from the file instead of its draft") : null,
      r.social ? h("label", { class: "toggle" }, socialBox, "Also replace the Social plan (templates, hashtags and calendar)") : null,
      r.proposals.length ? h("label", { class: "toggle" }, propBox, addProps.length ? "Also add back " + addProps.length + " client proposal" + (addProps.length === 1 ? "" : "s") + " that aren't in the studio now (existing ones are never changed)" : "Client proposals in the file are all in the studio already") : null,
      h("div", { class: "bk-acts" },
        h("button", { class: "btn primary", type: "button", text: "Put it in the draft", onclick: async e => {
          e.currentTarget.disabled = true;
          const ok = await replaceDraft(useLive.checked && r.live ? r.live : r.draft, "Before importing " + f.name.slice(0, 60));
          if (!ok) { toast("Couldn't put it in the draft. Nothing was changed."); e.currentTarget.disabled = false; return; }
          if (socialBox.checked && r.social) { Social.data = normalizeSocial(r.social); scheduleSocialSave(); }
          let n = 0; if (propBox.checked) for (const p of addProps) { const row = { status: "off", expires_on: null, searchable: true, ...p, id: p.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + n) };
            (Proposals.rows = Proposals.rows || []).unshift(row); if (await saveProposal(row)) n++; }
          touch({ theme: true }); toast("The file is now the draft" + (n ? " and " + n + " proposal" + (n === 1 ? " was" : "s were") + " added" : "") + ". Check it with Preview draft, then Publish."); openPanel("backups"); } }),
        h("button", { class: "btn", type: "button", text: "Cancel", onclick: () => { result.textContent = ""; } }))));
  });
  body.append(card("Download and bring back",
    h("p", { class: "adm-intro", style: "margin:0", text: "The backup file holds the draft, the live site, the Social plan and the client proposals. Pictures and videos stay in the Library (GitHub and Supabase Storage); the file keeps their names and addresses." }),
    h("div", { class: "bk-acts" },
      h("button", { class: "btn primary", type: "button", html: IC.down + "Download backup", onclick: async () => { await exportAll(); openPanel("backups"); } }),
      h("button", { class: "btn", type: "button", html: IC.upload + "Bring back from a file", onclick: () => file.click() }), file),
    h("p", { class: "hint", style: "margin:0", text: exp ? "Last downloaded on this computer: " + when(exp) + "." : "No backup downloaded on this computer yet." }),
    result));

  /* ---------- versions ---------- */
  if (Store.mode !== "db") { body.append(card("Version history", h("p", { class: "hint", style: "margin:0", text: "Version history needs the online studio. This copy saves in the browser only; use Download backup to keep copies." }))); return; }
  const label = h("input", { type: "text", maxlength: "120", placeholder: "Name, for example Before the new home page", "aria-label": "Snapshot name", style: "flex:1;min-width:200px" });
  const list = h("div", { class: "bk-list" }, h("p", { class: "mono", text: "Loading…" }));
  const settings = h("div", { class: "fields" }, F(D.backups, "keep", "number", "Versions to keep (5 to 100)", { min: 5, step: 1, hint: "Publishes, snapshots and safety copies together, newest first. Pinned versions are kept on top of this number." }, v => { D.backups.keep = clampKeep(v); }));
  body.append(card("Version history",
    h("div", { class: "bk-acts" }, label, h("button", { class: "btn primary", type: "button", html: IC.plus + "Save a snapshot now", onclick: async e => {
      e.currentTarget.disabled = true; const ok = await saveSnapshot(label.value.trim() || "Snapshot");
      toast(ok ? "Snapshot saved." : "Couldn't save the snapshot. The version history update may not be live yet."); openPanel("backups"); } })),
    list, settings,
    h("p", { class: "hint", style: "margin:0", text: "The number to keep is read from the saved draft, so it applies from the next publish or snapshot. Each version of this site is about 75 KB; 30 versions use about 2 MB of the free 500 MB." })));
  void drawVersions(list);
}

async function drawVersions(list) {
  const vs = await listVersions(); list.textContent = "";
  if (!vs.length) { list.append(h("p", { class: "adm-intro", text: "Nothing has been published yet." })); return; }
  const livePub = vs.find(v => (v.kind || "publish") === "publish");
  vs.forEach(v => {
    const kind = v.kind || "publish", isLive = v === livePub;
    const row = h("div", { class: "bk-row k-" + kind + (v.pinned ? " pinned" : "") });
    const name = h("input", { type: "text", value: v.label || "", maxlength: "120", placeholder: kind === "publish" ? "Add a name" : KIND_NAME[kind], "aria-label": "Version name" });
    name.addEventListener("change", async () => { if (await updateVersion(v.id, name.value.trim(), !!v.pinned)) { v.label = name.value.trim(); toast("Name saved."); } else toast("Couldn't save the name."); });
    const pin = h("button", { class: "btn sm" + (v.pinned ? " on" : ""), type: "button", "aria-pressed": String(!!v.pinned), title: "A pinned version is never removed by the number to keep", text: v.pinned ? "Pinned" : "Pin",
      onclick: async () => { if (await updateVersion(v.id, name.value.trim(), !v.pinned)) { v.pinned = !v.pinned; void drawVersions(list); } else toast("Couldn't change the pin."); } });
    const diffBox = h("div", { class: "bk-diff" });
    const acts = h("div", { class: "bk-acts" },
      h("button", { class: "btn sm", type: "button", text: "Compare with the draft", onclick: async () => {
        if (diffBox.childNodes.length) { diffBox.textContent = ""; return; }
        const c = await versionConfig(v.id); if (!c) { toast("Couldn't load that version."); return; }
        const d = compareConfigs(c, Store.draft);
        diffBox.replaceChildren(d.length ? h("ul", {}, ...d.map(x => h("li", { text: x.area + ": " + [x.added ? x.added + " added" : "", x.removed ? x.removed + " removed" : "", x.changed ? (x.added || x.removed ? x.changed + " changed" : x.changed > 1 ? x.changed + " changed" : "changed") : ""].filter(Boolean).join(", ") + " in the draft since then" })))
          : h("p", { class: "hint", style: "margin:0", text: "The draft has the same pages, modals, flows, posts, library and design as this version." })); } }),
      h("button", { class: "btn sm", type: "button", html: IC.down + "Download", onclick: async () => { const c = await versionConfig(v.id); if (!c) { toast("Couldn't load that version."); return; }
        download(backupFileName(Store.draft.site.brand, new Date(Date.parse(v.published_at)), "version-" + v.id), c); } }),
      h("button", { class: "btn sm primary", type: "button", text: "Put in draft", onclick: e => confirmInline(e.currentTarget.parentNode, "Replace the draft with this version? A safety copy of the current draft is saved first. Publish afterwards to make it live.", async () => {
        if (await restoreVersion(v.id)) { touch({ theme: true }); updateTop(); toast("That version is now the draft. Preview it, then Publish."); openPanel("backups"); } else toast("Couldn't put that version in the draft. Nothing was changed."); }, "Put in draft") }),
      isLive || v.pinned ? null : h("button", { class: "btn sm", type: "button", text: "Delete", onclick: e => confirmInline(e.currentTarget.parentNode, "Delete this version for good?", async () => {
        if (await deleteVersion(v.id)) { toast("Version deleted."); void drawVersions(list); } else toast("Couldn't delete it."); }, "Delete") }));
    row.append(
      h("div", { class: "bk-head" },
        h("span", { class: "miss-badge bk-kind", text: isLive ? "Live now" : KIND_NAME[kind] }),
        h("b", { text: when(v.published_at) }),
        h("span", { class: "hint", text: [ago(v.published_at), v.bytes ? fmtSize(v.bytes) : "", v.mine ? "by you" : ""].filter(Boolean).join(" · ") }),
        pin),
      name, acts, diffBox);
    list.append(row);
  });
}

export { panelHealth, panelBackups, exportAll };
