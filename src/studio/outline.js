/* ================= STUDIO › OUTLINE =================
   The whole site at a glance: every page in menu order with its sections in order.
   From here the admin can add, remove (with undo), hide or show, duplicate and reorder pages and sections,
   drag a section to another page, and jump to the place in the studio where that part is designed. */
import Sortable from 'sortablejs';
import { h, esc, plain, uid } from './core';
import { Store } from './store';
import { Site } from './site';
import { SECTION_TYPES, SECTION_BLANK, OPT } from './data';
import { typePicker } from './typepick';
import { IC, Admin, toast, touch, openPanel, confirmInline, makePage, PAGE_TEMPLATES, secTitle } from './admin';
import { keyOf, linksTo, duplicatePage, duplicateSection, nudge, moveSection, deletePage, outlineStats, makeHistory } from './outlinemodel';
import './outline.css';

const OIC = {
  outline:'<svg viewBox="0 0 24 24"><path d="M4 5h4M4 12h4M4 19h4M11 5h9M13 12h7M13 19h7M9 12h2M9 19h2"/></svg>',
  jump:'<svg viewBox="0 0 24 24"><path d="M5 12h12M13 6l6 6-6 6"/></svg>',
  upOne:'<svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>',
  downOne:'<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  undo:'<svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
  menu:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  chev:'<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>'
};
const HIST = makeHistory();
const OPEN = new Set();       // pages folded open in this browser session
let seeded = false;

/** Jump to design: opens the studio tab where this page or section is edited, with it selected and open. */
function jumpPage(p){ Admin.sel.pages = p.id; openPanel("pages"); }
function jumpSection(p, s){
  if (s.type === "heroCarousel"){ Admin.sel.carousels = s.id; openPanel("carousels"); return; }
  Admin.sel.pages = p.id; Admin.openSec = s.id; openPanel("pages");
}
function previewPage(p){ Site.preview = true; Admin.sel.pages = p.id; location.hash = p.id; }

function panelOutline(body){
  const D = Store.draft;
  if (!seeded){ seeded = true; if (D.pages[0]) OPEN.add(D.site.homePage || D.pages[0].id); }
  const live = Store.live || {};
  const livePages = new Set((live.pages || []).map(p => p.id)), liveSecs = new Set((live.pages || []).flatMap(p => (p.sections || []).map(s => s.id)));

  const summary = h("p", { class: "ol-sum", role: "status" });
  const undoBar = h("div", { class: "ol-undo", hidden: true });
  const tree = h("div", { class: "ol-tree" });
  body.append(
    h("p", { class: "adm-intro", text: "Your whole site on one screen: every page in menu order, with its sections in the order visitors see them. Add, remove, hide, duplicate and reorder here, or press Jump to design to edit that part. Changes go into the draft; Publish makes them live." }),
    h("div", { class: "ol-bar" }, summary),
    undoBar, tree, addPageRow());

  /* every change goes through here: remembered for Undo, saved, redrawn */
  function change(label, fn, msg){
    const out = HIST.record(D, label, fn);
    if (out === false) return out;
    touch(); draw(); if (msg) toast(msg);
    return out;
  }
  function drawUndo(){
    undoBar.textContent = "";
    if (!HIST.valid(D)){ undoBar.hidden = true; return; }
    undoBar.hidden = false;
    undoBar.append(h("span", { text: "Last change: " + HIST.label }),
      h("button", { class: "btn sm primary", type: "button", html: OIC.undo + "Undo", onclick: () => { const l = HIST.undo(D); if (l){ touch(); draw(); toast("Undone: " + l); } } }));
  }
  function drawSummary(){
    const st = outlineStats(D);
    summary.innerHTML = `<b>${st.pages}</b> ${st.pages === 1 ? "page" : "pages"} (${st.inMenu} in the menu) · <b>${st.sections}</b> sections` + (st.hidden ? ` · <span class="warn"><b>${st.hidden}</b> hidden</span>` : "");
  }

  function iconBtn(icon, label, fn, cls = ""){
    return h("button", { class: "ol-ic " + cls, type: "button", title: label, "aria-label": label, html: icon, onclick: e => { e.stopPropagation(); fn(e); } });
  }

  function pageRow(p, pi){
    const home = p.id === D.site.homePage, open = OPEN.has(p.id), secs = p.sections || [];
    const hid = secs.filter(s => s.hidden).length;
    const isNew = Store.live && !livePages.has(p.id);
    const layout = (OPT.layouts.find(l => l[0] === p.layout) || [])[1] || "";
    const box = h("div", { class: "ol-page" + (open ? " open" : ""), "data-page": p.id });
    const fold = h("button", { class: "ol-fold", type: "button", "aria-expanded": open ? "true" : "false", "aria-label": (open ? "Close " : "Open ") + (plain(p.title) || p.id), html: OIC.chev,
      onclick: () => { open ? OPEN.delete(p.id) : OPEN.add(p.id); draw(); } });
    const navPill = h("button", { class: "vis-pill ol-nav", type: "button", "aria-pressed": p.nav ? "false" : "true",
      title: p.nav ? "In the menu. Tap to take it out of the menu (the page still exists)" : "Not in the menu. Tap to add it to the menu",
      html: OIC.menu + "<span>" + (p.nav ? "In menu" : "Not in menu") + "</span>",
      onclick: e => { e.stopPropagation(); change((p.nav ? "took " : "put ") + (plain(p.title) || p.id) + (p.nav ? " out of the menu" : " in the menu"), () => { p.nav = !p.nav; }); } });
    const head = h("div", { class: "ol-phead" },
      h("span", { class: "handle ol-grip", html: IC.grip, title: "Drag to reorder pages", "aria-hidden": "true" }),
      fold,
      h("button", { class: "ol-name", type: "button", onclick: () => { open ? OPEN.delete(p.id) : OPEN.add(p.id); draw(); } },
        h("span", { class: "ol-t", text: plain(p.title) || p.id }),
        h("span", { class: "ol-meta", text: "#" + p.id + (layout ? " · " + layout : "") + " · " + secs.length + (secs.length === 1 ? " section" : " sections") + (hid ? " · " + hid + " hidden" : "") })),
      home ? h("span", { class: "ol-badge home", text: "Home" }) : null,
      isNew ? h("span", { class: "ol-badge new", text: "Not live yet", title: "Added in the draft. Publish to make it live." }) : null,
      navPill,
      h("div", { class: "ol-acts" },
        iconBtn(OIC.upOne, "Move page up", () => change("moved " + (plain(p.title) || p.id) + " up", () => nudge(D.pages, p, -1)), pi === 0 ? "off" : ""),
        iconBtn(OIC.downOne, "Move page down", () => change("moved " + (plain(p.title) || p.id) + " down", () => nudge(D.pages, p, 1)), pi === D.pages.length - 1 ? "off" : ""),
        iconBtn(IC.eye, "Preview this page", () => previewPage(p)),
        iconBtn(IC.copy, "Duplicate page", () => { const c = change("duplicated " + (plain(p.title) || p.id), () => duplicatePage(D, p, () => uid("s"))); if (c){ OPEN.add(c.id); draw(); toast("Page duplicated as #" + c.id + ". It is not in the menu until you add it."); } }),
        home ? iconBtn(IC.x, "The home page can't be removed", () => toast("This is the home page. Pick another home page under Design → Site and titles first."), "off")
          : iconBtn(IC.x, "Remove page", e => { const n = linksTo(D, p.id);
              confirmInline(head, "Remove the page “" + (plain(p.title) || p.id) + "” and its " + secs.length + " sections?" + (n ? " " + n + (n === 1 ? " button links" : " buttons link") + " to it and would lead nowhere." : "") + " You can undo this.",
                () => change("removed the page " + (plain(p.title) || p.id), () => deletePage(D, p), "Page removed. Press Undo to bring it back."), "Remove"); }, "danger"),
        h("button", { class: "btn sm ol-jump", type: "button", html: OIC.jump + "Jump to design", title: "Edit this page in Content → Pages", onclick: () => jumpPage(p) })));
    box.append(head);
    if (open){
      const list = h("ol", { class: "ol-secs", "data-page": p.id });
      secs.forEach((s, si) => list.append(sectionRow(p, s, si)));
      if (!secs.length) list.append(h("li", { class: "ol-empty", text: "No sections yet. Add one below, or drag one here from another page." }));
      box.append(list, addSectionRow(p));
      makeSortable(list);
    }
    return box;
  }

  function sectionRow(p, s, si){
    const T = SECTION_TYPES[s.type] || { label: s.type || "Section" }, secs = p.sections;
    const name = secTitle(s);
    const isNew = Store.live && !liveSecs.has(s.id);
    const slides = s.type === "heroCarousel" ? (s.slides || []).length : 0;
    const pill = h("button", { class: "vis-pill", type: "button", "aria-pressed": s.hidden ? "true" : "false",
      title: s.hidden ? "Hidden from visitors. Tap to show" : "Shown to visitors. Tap to hide",
      html: (s.hidden ? IC.eyeOff : IC.eye) + "<span>" + (s.hidden ? "Hidden" : "Shown") + "</span>",
      onclick: () => change((s.hidden ? "showed " : "hid ") + name, () => { s.hidden = !s.hidden; }) });
    const li = h("li", { class: "ol-sec" + (s.hidden ? " is-hidden" : ""), "data-id": s.id },
      h("span", { class: "handle ol-grip", html: IC.grip, title: "Drag to reorder, or onto another page", "aria-hidden": "true" }),
      h("span", { class: "ol-n", text: String(si + 1) }),
      h("span", { class: "ol-kind", text: T.label }),
      h("button", { class: "ol-name", type: "button", title: "Jump to design", onclick: () => jumpSection(p, s) },
        h("span", { class: "ol-t", text: (s.previewOnly ? "[Preview only] " : "") + name }),
        (s.anchor || slides) ? h("span", { class: "ol-meta", text: [s.anchor ? "#" + keyOf(s.anchor) : "", slides ? slides + (slides === 1 ? " slide" : " slides") : ""].filter(Boolean).join(" · ") }) : null),
      isNew ? h("span", { class: "ol-badge new", text: "Not live yet" }) : null,
      pill,
      h("div", { class: "ol-acts" },
        iconBtn(OIC.upOne, "Move section up", () => change("moved " + name + " up", () => nudge(secs, s, -1)), si === 0 ? "off" : ""),
        iconBtn(OIC.downOne, "Move section down", () => change("moved " + name + " down", () => nudge(secs, s, 1)), si === secs.length - 1 ? "off" : ""),
        iconBtn(IC.copy, "Duplicate section", () => change("duplicated " + name, () => duplicateSection(p, s, () => uid("s")), "Section duplicated. The copy is right below the original.")),
        iconBtn(IC.x, "Remove section", () => { const n = s.anchor ? linksTo(D, p.id, s.anchor) : 0;
          confirmInline(li.lastElementChild, "Remove “" + name + "”?" + (n ? " " + n + (n === 1 ? " button travels" : " buttons travel") + " to it and would stop at the top of the page." : "") + " You can undo this.",
            () => change("removed " + name, () => { secs.splice(secs.indexOf(s), 1); }, "Section removed. Press Undo to bring it back."), "Remove"); }, "danger"),
        h("button", { class: "btn sm ol-jump", type: "button", html: OIC.jump + "Jump to design", title: s.type === "heroCarousel" ? "Edit in Content → Carousels" : "Edit in Content → Pages", onclick: () => jumpSection(p, s) })));
    return li;
  }

  /* Adding a section: the visual section picker, and the choice is added straight away at the end of the page. */
  function addSectionRow(p){
    const sel = h("select", { "aria-label": "Add a section to " + (plain(p.title) || p.id) }, h("option", { value: "", text: "＋ Add section…" }),
      ...Object.entries(SECTION_TYPES).map(([k, v]) => h("option", { value: k, text: v.label })));
    sel.addEventListener("change", () => { const t = sel.value; sel.value = ""; sel._tpSync?.(); if (!t || !SECTION_BLANK[t]) return;
      change("added a " + SECTION_TYPES[t].label + " section to " + (plain(p.title) || p.id), () => { p.sections = p.sections || []; p.sections.push({ id: uid("s"), type: t, ...SECTION_BLANK[t]() }); },
        SECTION_TYPES[t].label + " added at the end of " + (plain(p.title) || p.id) + ". Drag it into place or press Jump to design to fill it in."); });
    return h("div", { class: "ol-add" }, typePicker(sel, { kind: "section", action: true }));
  }
  function addPageRow(){
    const sel = h("select", { "aria-label": "Add a page" }, h("option", { value: "", text: "＋ Add page…" }), ...PAGE_TEMPLATES.map(([v, l]) => h("option", { value: v, text: l })));
    sel.addEventListener("change", () => { const v = sel.value; sel.value = ""; sel._tpSync?.(); if (!v) return;
      const p = change("added a new page", () => makePage(D, v));
      if (p){ OPEN.add(p.id); draw(); toast("New page #" + p.id + " added at the end. Press Jump to design to set its address and title."); } });
    return h("div", { class: "ol-add ol-add-page" }, typePicker(sel, { kind: "pageTemplate", action: true }));
  }

  /* Dragging: pages reorder among themselves; sections reorder on a page or move to another open page. */
  const sorts = [];
  function makeSortable(list){
    sorts.push(Sortable.create(list, { group: "ol-secs", handle: ".ol-grip", draggable: ".ol-sec", animation: 160, ghostClass: "sortable-ghost",
      onEnd(e){ const from = e.from.dataset.page, to = e.to.dataset.page;
        if (from === to && e.oldIndex === e.newIndex) return;
        const fromP = D.pages.find(x => x.id === from), s = fromP && fromP.sections[e.oldIndex]; if (!s) return draw();
        const toP = D.pages.find(x => x.id === to);
        change(from === to ? "moved " + secTitle(s) : "moved " + secTitle(s) + " to " + (plain(toP && toP.title) || to), () => moveSection(D, from, e.oldIndex, to, e.newIndex),
          from === to ? "" : "Section moved to " + (plain(toP && toP.title) || to) + "."); } }));
  }
  function draw(){
    sorts.splice(0).forEach(s => { try { s.destroy(); } catch (e){ /* already gone */ } });
    tree.textContent = "";
    D.pages.forEach((p, i) => tree.append(pageRow(p, i)));
    sorts.push(Sortable.create(tree, { handle: ".ol-phead > .ol-grip", draggable: ".ol-page", animation: 160, ghostClass: "sortable-ghost",
      onEnd(e){ if (e.oldIndex === e.newIndex) return; const p = D.pages[e.oldIndex];
        change("moved " + (plain(p.title) || p.id), () => { D.pages.splice(e.oldIndex, 1); D.pages.splice(e.newIndex, 0, p); }); } }));
    drawSummary(); drawUndo();
  }
  Admin.refresh = () => { drawSummary(); drawUndo(); };
  /* Open all / Close all in the studio toolbar open or close every page here */
  body.addEventListener("studio:foldall", e => { if (e.detail && e.detail.folded) OPEN.clear(); else D.pages.forEach(p => OPEN.add(p.id)); draw(); });
  draw();
}

export { panelOutline, OIC, jumpPage, jumpSection };
