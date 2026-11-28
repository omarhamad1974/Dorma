/* ================= STUDIO › OUTLINE › CONNECTIONS =================
   What opens what, as a readable list: the menu, then every page, modal and flow with its buttons, cards and
   flow items and the page, modal, post or link each one opens. A section that shows a flow lists that flow's
   items right under it. "What opens this" turns it around, and Problems lists links that lead nowhere.
   Every line has Edit here (the button or item) and Open (what it opens). */
import { h, plain } from './core';
import { Store } from './store';
import { Admin, goToSlot } from './admin';
import { connections, linkText, TYPE_NAME } from './connections';
import './outline.css';

const ST = { mode: "forward", q: "" };
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M13 6l6 6-6 6"/></svg>';
const STATUS = { broken: "Leads nowhere", empty: "Nothing chosen", warn: "Check" };
const TYPE_ORDER = [["page", "Pages"], ["modal", "Modals"], ["flow", "Flows"], ["post", "Blog posts"], ["doc", "Library articles"]];

function panelConnections(body){
  const D = Store.draft;
  let C = connections(D);
  const sum = h("p", { class: "ol-sum", role: "status" });
  const modes = h("div", { class: "lib-kinds cn-modes", role: "group", "aria-label": "Show" });
  const q = h("input", { type: "search", class: "cn-q", placeholder: "Search buttons, pages, modals, flows…", "aria-label": "Search connections", value: ST.q });
  const out = h("div", { class: "cn-out" });
  body.append(
    h("p", { class: "adm-intro", text: "What opens what on your site: the menu, every button, card and flow item, and the page, modal, post or link it opens. A section that shows a flow lists that flow's items under it. Press Edit here to change the button or item, or Open to edit what it opens." }),
    h("div", { class: "ol-bar" }, sum), h("div", { class: "cn-tools" }, modes, q), out);
  q.addEventListener("input", () => { ST.q = q.value; draw(); });

  const tName = l => { const t = C.targets.get(l.type + ":" + l.target); return t ? t.name : l.type === "url" ? l.target : l.type === "slide" ? "Slide " + l.target : l.target || "—"; };
  const match = l => !ST.q.trim() || linkText(l, C.targets).includes(ST.q.trim().toLowerCase());
  const btn = (text, go, cls = "") => go && go.panel ? h("button", { class: "btn sm " + cls, type: "button", html: text === "Open" ? "Open" + ARROW : text, onclick: e => { e.stopPropagation(); goToSlot(go); } }) : null;
  const place = l => { const w = String(l.from.where || ""), g = l.from.group + " › "; return (w.startsWith(g) ? w.slice(g.length) : w === l.from.group ? "" : w).replace(/ › Button$/, ""); };

  /* one link: [kind] label · where  →  [type] target  [status]  Edit here · Open */
  function row(l, { showPlace = true, via = false } = {}){
    const t = C.targets.get(l.type + ":" + l.target), pl = showPlace ? place(l) : "";
    const li = h("li", { class: "cn-row" + (l.status !== "ok" ? " bad" : "") + (l.from.hidden ? " is-hidden" : "") },
      h("span", { class: "cn-kind", text: via ? "Flow item" : l.kind }),
      h("span", { class: "cn-from" }, h("b", { text: l.label || (l.type === "flow" ? "" : "No label") }), pl ? h("small", { text: pl }) : null, l.from.hidden ? h("small", { class: "cn-hid", text: "hidden" }) : null),
      h("span", { class: "cn-arrow", html: ARROW }),
      h("span", { class: "cn-to" }, h("span", { class: "cn-type t-" + l.type, text: TYPE_NAME[l.type] }), h("b", { text: tName(l) }), l.section ? h("small", { text: "→ #" + l.section }) : null,
        l.status !== "ok" ? h("span", { class: "cn-bad", title: l.note, text: (STATUS[l.status] || "Check") + (l.note ? ": " + l.note : "") }) : null),
      h("span", { class: "cn-acts" }, btn("Edit here", l.from.go), t ? btn("Open", t.go, "primary") : null));
    return li;
  }

  function forward(){
    /* the menu */
    if (!ST.q.trim() && C.menu.length) out.append(h("section", { class: "cn-group cn-menu" }, h("div", { class: "cn-ghead" }, h("b", { text: "Menu" }), h("small", { text: C.menu.length + " pages, in order" })),
      h("ol", { class: "cn-menu-list" }, ...C.menu.map(m => h("li", {}, h("button", { type: "button", class: "cn-chip", html: (plain(m.name) || m.id) + ARROW, title: "Open this page in Pages", onclick: () => goToSlot(m.go) }))))));
    let shown = 0;
    C.groups.forEach(g => {
      const own = g.links.filter(l => l.from.go && !(g.kind !== "flow" && l.from.go.panel === "flows"));
      const rows = []; let n = 0;
      own.forEach(l => {
        const kids = l.type === "flow" ? (C.flowLinks.get(l.target) || []).filter(x => x.type !== "flow") : [];
        const hit = match(l) || kids.some(match); if (!hit) return; n++;
        const li = row(l);
        if (kids.length){ li.append(h("ul", { class: "cn-sub" }, ...kids.map(k => row(k, { showPlace: false, via: true })))); n += kids.length; }
        rows.push(li);
      });
      if (!rows.length) return; shown++;
      const bad = own.filter(l => l.status !== "ok").length;
      const box = h("details", { class: "cn-group", open: !!ST.q.trim() || OPENED.has(g.name) || null },
        h("summary", { class: "cn-ghead" }, h("b", { text: g.name }), h("small", { text: n + (n === 1 ? " link" : " links") }), bad ? h("span", { class: "cn-bad", text: bad + " to fix" }) : null,
          h("span", { class: "grow" }), btn("Open", g.go)),
        h("ul", { class: "cn-list" }, ...rows));
      box.addEventListener("toggle", () => { box.open ? OPENED.add(g.name) : OPENED.delete(g.name); });
      out.append(box);
    });
    if (!shown) out.append(h("p", { class: "ol-empty", text: ST.q.trim() ? "Nothing matches “" + ST.q + "”." : "No buttons or flow items open anything yet." }));
  }

  function reverse(){
    const qq = ST.q.trim().toLowerCase();
    TYPE_ORDER.forEach(([type, title]) => {
      const list = C.reverse.filter(x => x.type === type && (!qq || String(x.name).toLowerCase().includes(qq) || x.from.some(match)));
      if (!list.length) return;
      out.append(h("h3", { class: "cn-h", text: title }));
      const ul = h("ul", { class: "cn-list cn-rev" });
      list.forEach(x => {
        const tags = [x.isHome ? "Home page" : "", x.inMenu ? "In the menu" : "", x.listed ? "In the blog list" : ""].filter(Boolean);
        const count = x.from.length ? "Opened from " + x.from.length + (x.from.length === 1 ? " place" : " places") : "";
        const li = h("li", { class: "cn-target" + (x.orphan ? " orphan" : "") },
          h("details", { open: !!qq || null },
            h("summary", { class: "cn-thead" }, h("span", { class: "cn-type t-" + type, text: TYPE_NAME[type] }), h("b", { text: x.name }),
              h("small", { text: [count, ...tags].filter(Boolean).join(" · ") }),
              x.orphan ? h("span", { class: "cn-bad", text: "Nothing opens this" }) : null, h("span", { class: "grow" }), btn("Open", x.go, "primary")),
            x.from.length ? h("ul", { class: "cn-sub" }, ...x.from.map(l => row(l))) : h("p", { class: "cn-none", text: x.orphan ? "No button, flow item or menu entry opens this yet." : "Reached through " + tags.join(" and ").toLowerCase() + " only." })));
        ul.append(li);
      });
      out.append(ul);
    });
  }

  function problems(){
    const list = C.problems.filter(match), orph = C.reverse.filter(x => x.orphan && x.type !== "doc");
    if (!list.length && !orph.length){ out.append(h("p", { class: "ol-empty", text: "No problems: every button and flow item leads somewhere, and everything is opened from somewhere." })); return; }
    if (list.length){ out.append(h("h3", { class: "cn-h", text: "Links that lead nowhere or need a look" }), h("ul", { class: "cn-list" }, ...list.map(l => row(l)))); }
    if (orph.length){ out.append(h("h3", { class: "cn-h", text: "Nothing opens these" }), h("ul", { class: "cn-list" }, ...orph.map(x => h("li", { class: "cn-row" },
      h("span", { class: "cn-type t-" + x.type, text: TYPE_NAME[x.type] }), h("span", { class: "cn-from" }, h("b", { text: x.name }), h("small", { text: x.type === "page" ? "Not in the menu and no button goes here" : "No button or flow item opens it" })),
      h("span", { class: "cn-acts" }, btn("Open", x.go, "primary")))))); }
  }

  function draw(){
    C = connections(D);
    const orph = C.reverse.filter(x => x.orphan && x.type !== "doc").length, bad = C.problems.length;
    sum.innerHTML = `<b>${C.links.length}</b> links · <b>${C.menu.length}</b> pages in the menu` + (bad ? ` · <span class="warn"><b>${bad}</b> to fix</span>` : " · none broken") + (orph ? ` · <span class="warn"><b>${orph}</b> nothing opens</span>` : "");
    modes.textContent = "";
    [["forward", "What opens what"], ["reverse", "What opens this"], ["problems", "Problems (" + (bad + orph) + ")"]].forEach(([k, l]) =>
      modes.append(h("button", { type: "button", class: "chip" + (ST.mode === k ? " on" : ""), "aria-pressed": ST.mode === k ? "true" : "false", text: l, onclick: () => { ST.mode = k; draw(); } })));
    out.textContent = "";
    ({ forward, reverse, problems })[ST.mode]();
  }
  Admin.refresh = draw;
  body.addEventListener("studio:foldall", e => { const fold = !!(e.detail && e.detail.folded); body.querySelectorAll("details").forEach(d => { d.open = !fold; }); if (fold) OPENED.clear(); });
  draw();
}
const OPENED = new Set();

export { panelConnections };
