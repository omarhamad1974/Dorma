import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { h, $, $$, plain, reduce } from './core';

gsap.registerPlugin(ScrollToPlugin);

/* ================= GO TO A LABELLED SECTION =================
   Any button can open a page or a modal and travel to a labelled section inside it (action.section).
   - Same page: the page glides to the section while a rail on the side fills, then corner brackets lock on to it.
   - Another page: a curtain names where you are going, the page opens behind it, the curtain lifts and the page glides down.
   - Modal: the modal opens as usual, then its panel scrolls to the section and the brackets lock on inside it.
   Addresses carry the label (#agency/services), so a section can be linked to from anywhere. */
const labelKey = v => String(plain(v) ?? "").trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-+|-+$/g,"");
const JUMP = { pending:null, curtain:null };
const drop = el => { if (el && el.parentNode) el.parentNode.removeChild(el); };

function findLabel(root,label){ const k=labelKey(label); if (!k||!root) return null; return $$("[data-label]",root).find(el=>el.dataset.label===k)||null; }

/** What the curtain says: the section's eyebrow or title, and the page's name. */
function sectionName(cfg,pageId,label){
  const p=(cfg.pages||[]).find(x=>x.id===pageId), k=labelKey(label);
  const s=p&&(p.sections||[]).find(x=>labelKey(x.anchor)===k||x.id===label);
  return { page:plain(p&&p.title)||pageId, sec:s?(plain(s.eyebrow)||plain(s.title)||label):label };
}
const currentPage = cfg => { const hs=location.hash.slice(1);
  const id=(cfg.pages||[]).map(p=>p.id).filter(i=>hs===i||hs.startsWith(i+"/")).sort((a,b)=>b.length-a.length)[0]; // proposal page ids hold "/"
  return id || hs.split("/")[0] || (cfg.site && cfg.site.homePage); };

function goSection(cfg,pageId,label){
  const key=labelKey(label);
  if (currentPage(cfg)===pageId){ try { history.replaceState(null,"","#"+pageId+"/"+key); } catch(e){ /* sandboxed */ } jumpTo(label); return; }
  if (reduce || typeof document==="undefined"){ location.hash=pageId+"/"+key; return; }
  drop(JUMP.curtain);
  const n=sectionName(cfg,pageId,label);
  const cur=h("div",{class:"travel","aria-hidden":"true"},
    h("div",{class:"tv-in"},h("span",{class:"mono tv-page",text:n.page}),h("span",{class:"tv-line"}),h("strong",{class:"tv-to",text:n.sec})),
    ...["a","b","c","d"].map(c=>h("span",{class:"corner "+c})));
  document.body.append(cur); JUMP.curtain=cur;
  gsap.timeline({onComplete:()=>{ location.hash=pageId+"/"+key; }})
    .fromTo(cur,{clipPath:"inset(100% 0% 0% 0%)"},{clipPath:"inset(0% 0% 0% 0%)",duration:.6,ease:"expo.inOut"})
    .fromTo($(".tv-line",cur),{scaleX:0},{scaleX:1,duration:.55,ease:"expo.out"},.3)
    .fromTo([$(".tv-page",cur),$(".tv-to",cur)],{yPercent:110,autoAlpha:0},{yPercent:0,autoAlpha:1,duration:.55,stagger:.07,ease:"power3.out"},.32)
    .fromTo($$(".corner",cur),{scale:0},{scale:1,duration:.4,ease:"back.out(3)",stagger:.04},.4)
    .to({}, {duration:.25});
}

/** Called once a page has rendered: lifts the curtain (if any) and travels to the pending section. */
function arrive(){
  const label=JUMP.pending, cur=JUMP.curtain; JUMP.pending=null; JUMP.curtain=null;
  if (cur){ gsap.timeline({onComplete:()=>drop(cur)}).to($$(".tv-in,.corner",cur),{autoAlpha:0,y:-12,duration:.3,ease:"power2.in"},0)
      .to(cur,{clipPath:"inset(0% 0% 100% 0%)",duration:.75,ease:"expo.inOut"},.15); }
  if (label) jumpTo(label,{delay:cur?.55:.45});
}

/** Scrolls the page (or a modal panel) to the labelled section and locks on to it. */
function jumpTo(label,{root=null,scroller=null,delay=0}={}){
  if (typeof document==="undefined") return false;
  const win=!scroller; root=root||$("#main")||document.body;
  const el=findLabel(root,label); if (!el) return false;
  const head=win?((($(".site-head")||{}).offsetHeight)||0)+12:18;
  const from=win?scrollY:scroller.scrollTop;
  const to=Math.max(0,win?el.getBoundingClientRect().top+scrollY-head:el.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop-head);
  const dur=reduce?0:Math.min(2.1,.75+Math.abs(to-from)/2600);
  const rail=win&&!reduce?h("div",{class:"jump-rail","aria-hidden":"true"},h("i")):null; if (rail) document.body.append(rail);
  const tl=gsap.timeline({delay,onComplete:()=>{ drop(rail); lockOn(el); }});
  if (rail) tl.fromTo(rail,{autoAlpha:0},{autoAlpha:1,duration:.2},0).fromTo($("i",rail),{scaleY:0},{scaleY:1,duration:dur,ease:"expo.inOut"},0).to(rail,{autoAlpha:0,duration:.3},dur);
  tl.to(win?window:scroller,{scrollTo:{y:to,autoKill:false},duration:dur,ease:"expo.inOut"},0);
  return true;
}

/** Corner brackets fly in from the corners of the screen and frame the section, then a line sweeps across its top. */
function lockOn(el){
  el.classList.add("is-target"); setTimeout(()=>el.classList.remove("is-target"),2200);
  if (reduce) return;
  const r=el.getBoundingClientRect(), W=innerWidth, H=innerHeight, S=26;
  const box={l:Math.max(10,r.left+10),t:Math.max(10,r.top+10),r:Math.min(W-10,r.right-10),b:Math.min(H-10,r.top+Math.min(r.height,H*.72))};
  const layer=h("div",{class:"lock-on","aria-hidden":"true"}), sweep=h("span",{class:"lk-sweep"});
  const spots=[["a",0,0,box.l,box.t],["b",W-S,0,box.r-S,box.t],["c",0,H-S,box.l,box.b-S],["d",W-S,H-S,box.r-S,box.b-S]];
  const cs=spots.map(([c])=>h("span",{class:"lk "+c}));
  layer.append(...cs,sweep); document.body.append(layer);
  gsap.set(sweep,{x:box.l,y:box.t,width:Math.max(0,box.r-box.l)});
  gsap.timeline({onComplete:()=>drop(layer)})
    .fromTo(cs,{x:i=>spots[i][1],y:i=>spots[i][2],autoAlpha:0},{x:i=>spots[i][3],y:i=>spots[i][4],autoAlpha:1,duration:.75,ease:"expo.out",stagger:.04},0)
    .fromTo(sweep,{scaleX:0},{scaleX:1,duration:.7,ease:"expo.inOut"},.45)
    .to(cs,{scale:1.25,duration:.25,yoyo:true,repeat:1,ease:"power2.inOut"},.8)
    .to(layer,{autoAlpha:0,duration:.6},1.7);
}

export { labelKey, JUMP, findLabel, goSection, arrive, jumpTo, lockOn };
