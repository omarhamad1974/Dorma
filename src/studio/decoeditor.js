import { h } from './core';
import { F, fieldsFor } from './admin';
import { OPT, A } from './data';
import { DECO_DEFAULTS } from './extras';

/* ================= STUDIO: ICON, TEXT, LOGO AND BUTTON =================
   The editor under every section (Pages → section → "Icon, text, logo and button"), carousel (Carousels) and the global
   defaults (Design → Global style → Headings, icons and cards). The site side is extras.js. */
const nameOf=(list,v)=>((list.find(o=>String(o[0])===String(v))||[])[1])||"";
const globalOpt=(list,v)=>[["","Global ("+(nameOf(list,v)||"none")+")"],...list.filter(o=>o[0]!=="")];
const LOGO_BLOCK=()=>({show:false,version:"auto",size:90,phone:"",align:"start",pos:"top",in:"pop",loop:"none",delay:0,action:A()});
const CTA_BLOCK=()=>({show:false,button:{label:"Get in touch",action:A()},text:"",size:"m",style:"site",align:"start",pos:"bottom",in:"rise",loop:"none",delay:0});

/** What is switched on, in a few words, for the folded summary. */
function decoSummary(s){
  const on=[];
  if (s.headIcon) on.push("icon "+(s.headIconPos||"before"));
  const hid=[s.hideSub&&"subtitle",s.hideTitle&&"title",s.hideText&&"text"].filter(Boolean); if (hid.length) on.push(hid.join(", ")+" hidden");
  if (s.logoBlock&&s.logoBlock.show) on.push("logo");
  if (s.ctaBlock&&s.ctaBlock.show&&s.ctaBlock.button&&s.ctaBlock.button.label) on.push("button");
  if (s.headStyle) on.push(nameOf(OPT.headStyles,s.headStyle).toLowerCase());
  if (s.cardHover) on.push("card hover");
  return on.length?" · "+on.join(" · "):" · icon by the title, hide parts, logo, button, heading style";
}

/** The editor for one section or carousel. */
function decoEditor(s,{carousel=false,G=DECO_DEFAULTS}={}){
  G={...DECO_DEFAULTS,...G};
  const sum=h("span",{text:decoSummary(s)});
  const box=h("details",{class:"sec-more sec-deco"},h("summary",{},h("b",{text:"Icon, text, logo and button"}),sum));
  const body=h("div",{class:"deco-body"}); box.append(body);
  const upd=()=>{ sum.textContent=decoSummary(s); };
  const draw=()=>{ body.textContent="";
    s.logoBlock={...LOGO_BLOCK(),...(s.logoBlock&&typeof s.logoBlock==="object"?s.logoBlock:{})};
    s.ctaBlock={...CTA_BLOCK(),...(s.ctaBlock&&typeof s.ctaBlock==="object"?s.ctaBlock:{})};
    const L=s.logoBlock, C=s.ctaBlock;
    body.append(
      h("p",{class:"deco-h",text:"Icon by the title"}),
      h("p",{class:"hint",text:carousel?"Shows by every slide's title. A slide can use its own icon (Slides → Icon by the title). Icons are added under Design → Icons.":"Pick an icon to show before, after or above this section's title. Cards, rows and items can have their own (open each one). Icons are added under Design → Icons."}),
      fieldsFor(s,[["headIcon","icon","Icon",{wide:true}],["headIconPos","select","Position",{options:OPT.iconPos}],
        ["headIconSize","number","Size (1 = as tall as the title)",{optional:true,min:.2,step:.05,placeholder:"Global "+G.iconSize}],
        ["headIconColor","color","Colour",{optional:true,placeholder:"Accent",globalLabel:"Use accent"}],["headIconAnim","select","Animation",{options:globalOpt(OPT.iconAnim,G.iconAnim)}]],()=>upd()),
      carousel?h("p",{class:"hint",text:"Hide a slide's eyebrow or paragraph on that slide (Slides → Hide the eyebrow, Hide the short paragraph)."}):h("p",{class:"deco-h",text:"Hide parts (they stay saved, so you can bring them back)"}),
      carousel?null:fieldsFor(s,[["hideSub","toggle","Hide the subtitle (eyebrow and small labels)"],["hideTitle","toggle","Hide the title"],["hideText","toggle","Hide the text (paragraph)"]],()=>upd()),
      carousel?null:h("p",{class:"hint",text:"Each card, accordion row, chapter or item has its own Hide the subtitle and Hide the text switches."}),
      h("p",{class:"deco-h",text:"Logo in this "+(carousel?"carousel":"section")}),
      F(L,"show","toggle","Show the logo here",{},()=>{ upd(); draw(); }),
      L.show?fieldsFor(L,[["version","logoVersion","Version"],["size","number","Height in px",{min:12,step:2}],["phone","number","Height on phones (empty = same)",{optional:true,min:12,step:2}],
        ["pos","select","Place",{options:OPT.blockPos}],["align","select","Align",{options:OPT.blockAlign}],["in","select","Entrance",{options:OPT.blockIn}],["loop","select","Keeps moving",{options:OPT.blockLoop}],["delay","number","Starts after (seconds)",{min:0,step:.1}],["action","action","On click (optional)"]]):null,
      h("p",{class:"deco-h",text:"Button (call to action)"}),
      F(C,"show","toggle","Show a button here",{},()=>{ upd(); draw(); }),
      C.show?fieldsFor(C,[["button","button","Button"],["text","text","Short line above it (optional)",{wide:true}],["size","select","Size",{options:OPT.ctaSizes}],["style","select","Style",{options:OPT.ctaStyles}],
        ["pos","select","Place",{options:OPT.blockPos}],["align","select","Align",{options:OPT.blockAlign}],["in","select","Entrance",{options:OPT.blockIn}],["loop","select","Keeps moving",{options:OPT.blockLoop}],["delay","number","Starts after (seconds)",{min:0,step:.1}]],()=>upd()):null,
      h("p",{class:"deco-h",text:"Heading style and cards"}),
      fieldsFor(s,carousel?[["headStyle","select","Title style",{options:globalOpt(OPT.headStyles,G.headStyle)}]]:
        [["headStyle","select","Heading style",{options:globalOpt(OPT.headStyles,G.headStyle)}],["headIn","select","Heading entrance",{options:[["","Global ("+(nameOf(OPT.headIn,G.headIn)||"site default")+")"],...OPT.headIn.filter(o=>o[0]!=="").concat([["keep","Site default (the block rises)"]])]}],
         ["cardHover","select","Card hover (cards, rows, items, chapters)",{options:globalOpt(OPT.cardHover,G.cardHover)}]],()=>upd()),
      h("p",{class:"hint",text:"Global means Design → Global style → Headings, icons and cards."})
    );
  };
  draw();
  return box;
}
/** Design → Global style → Headings, icons and cards. */
function decoGlobal(M){
  M.deco={...DECO_DEFAULTS,...(M.deco||{})};
  return fieldsFor(M.deco,[["headStyle","select","Heading style",{options:OPT.headStyles}],["headIn","select","Heading entrance",{options:OPT.headIn}],["cardHover","select","Card hover",{options:OPT.cardHover}],
    ["iconAnim","select","Icon animation",{options:OPT.iconAnim}],["iconSize","range","Icon size (1 = as tall as the title)",{min:.3,max:3,step:.05}]]);
}
export { decoEditor, decoGlobal, decoSummary };
