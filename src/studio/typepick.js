/* ================= VISUAL TYPE PICKERS =================
   Every "choose a type" dropdown in the studio (section types, modal types, flows, flow items, background effects,
   picture reveals and shapes, section/modal/menu animation, menu styles, page layouts…) gets a picker that shows a
   small drawing or a looping mini animation of each choice next to its name.
   The original <select> stays in the page (hidden) and keeps its value: picking a tile sets select.value and fires
   "change", so whatever the studio did with the dropdown before happens exactly the same way.
   Previews are drawn from code (inline SVG and CSS), so there are no image files to load. */

/* ---------- colours of the little drawings (dark stage, like the site) ---------- */
const C={ fg:"#eef2fb", mu:"rgba(238,242,251,.42)", fa:"rgba(238,242,251,.16)", ac:"#ffcb08", bl:"#2a8fe0", mg:"#ed0677", cy:"#00aeef", pic:"#1b5da6", pic2:"#0d3f7a" };
const r=(x,y,w,hh,fill,rx=1.5)=>`<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="${rx}" fill="${fill}"/>`;
const L=(x,y,w,c=C.mu)=>r(x,y,w,2.6,c,1.3);
const T=(x,y,w,s=5)=>r(x,y,w,s,C.fg,1.5);
const B=(x,y,w=22,c=C.ac)=>r(x,y,w,6.5,c,3.2);
const O=(x,y,w,hh,rx=2)=>`<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="${rx}" fill="none" stroke="${C.mu}" stroke-width="1.2"/>`;
const cir=(x,y,rr,fill)=>`<circle cx="${x}" cy="${y}" r="${rr}" fill="${fill}"/>`;
const dots3=(x,y,c=C.mu)=>cir(x,y,.9,c)+cir(x+3,y,.9,c)+cir(x+6,y,.9,c);
/** A picture: blue sky, a sun and a hill. */
const P=(x,y,w,hh,rx=2)=>`<g><rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="${rx}" fill="${C.pic}"/>`+
  `<circle cx="${x+w*.72}" cy="${y+hh*.32}" r="${Math.max(1.5,Math.min(w,hh)*.12)}" fill="${C.ac}" opacity=".9"/>`+
  `<path d="M${x} ${y+hh} L${x} ${y+hh*.72} Q${x+w*.3} ${y+hh*.42} ${x+w*.58} ${y+hh*.74} T${x+w} ${y+hh*.66} L${x+w} ${y+hh} Z" fill="${C.pic2}"/></g>`;
const svg=body=>`<svg viewBox="0 0 120 80" aria-hidden="true" focusable="false">${body}</svg>`;
const nav=(y=5)=>r(8,y,14,3,C.fg)+L(70,y+.2,9)+L(83,y+.2,9)+L(96,y+.2,9)+r(108,y-.5,5,4,C.ac,1);
const dim=`<rect width="120" height="80" fill="rgba(4,9,21,.6)"/>`;
const pageBack=svg(nav()+T(10,18,52,6)+L(10,30,70)+L(10,35,60)+P(10,44,46,28)+P(62,44,48,28));

/* ---------- static drawings ---------- */
const SECTION={
  heroCarousel:svg(P(0,0,120,80,0)+dim+T(12,28,62,7)+L(12,40,48)+B(12,48)+`<path d="M5 37 l-3 3 3 3M115 37 l3 3 -3 3" stroke="${C.fg}" stroke-width="1.3" fill="none"/>`+cir(52,72,1.6,C.fg)+cir(58,72,1.6,C.mu)+cir(64,72,1.6,C.mu)+cir(70,72,1.6,C.mu)),
  hero:svg(P(0,0,120,80,0)+dim+nav()+T(12,30,74,8)+L(12,44,56)+L(12,49,44)+B(12,58,26)),
  chapters:svg(`<text x="10" y="22" font-size="9" fill="${C.ac}" font-family="monospace">01</text>`+T(26,15,40,5)+L(26,24,44)+`<text x="10" y="44" font-size="9" fill="${C.mu}" font-family="monospace">02</text>`+L(26,38,36,C.fg)+`<text x="10" y="64" font-size="9" fill="${C.mu}" font-family="monospace">03</text>`+L(26,58,30,C.fg)+P(78,12,34,56)),
  stats:svg(T(10,10,40,4)+[10,46,82].map(x=>`<text x="${x}" y="48" font-size="17" font-weight="600" fill="${C.fg}" font-family="sans-serif">${x===10?"24":x===46?"9k":"3+"}</text>`+L(x,56,24)).join("")+r(10,64,100,1,C.fa,0)),
  about:svg(P(8,12,46,56)+T(62,16,44,5)+L(62,28,48)+L(62,33,44)+L(62,38,46)+L(62,43,30)+B(62,54)),
  clients:svg(T(10,9,44,4)+[0,1,2,3].map(c=>[0,1].map(rw=>O(10+c*26,24+rw*24,22,16)+L(15+c*26,31+rw*24,12,C.fa)).join("")).join("")),
  grid:svg(T(10,8,40,4)+[0,1,2].map(i=>P(10+i*35,18,30,26)+L(10+i*35,49,26,C.fg)+L(10+i*35,55,22)+L(10+i*35,60,18)).join("")),
  accordion:svg(T(10,8,44,4)+[0,1,2,3].map(i=>{ const y=19+i*14+(i>0?10:0); return r(10,y,100,i===0?20:10,C.fa,2)+L(14,y+3.8,46,C.fg)+`<text x="104" y="${y+7.5}" font-size="8" fill="${C.ac}" font-family="sans-serif">${i===0?"−":"+"}</text>`+(i===0?L(14,y+11,70)+L(14,y+15,52):""); }).join("")),
  timeline:svg(T(10,10,44,4)+r(10,42,100,1.4,C.mu,0)+[14,40,66,92].map((x,i)=>cir(x,42.7,3,i===0?C.ac:C.fg)+L(x-8,52,18,C.fg)+L(x-8,57,14)+`<text x="${x-6}" y="34" font-size="6" fill="${C.mu}" font-family="monospace">'0${i+1}</text>`).join("")),
  flowStrip:svg(T(10,14,50,4)+[0,1,2].map(i=>B(10+i*36,38,24,i===0?C.ac:"rgba(238,242,251,.22)")+(i<2?dots3(38+i*36,41.3):"")).join("")+L(10,56,80)),
  banner:svg(r(0,0,120,80,"none",0)+P(0,20,120,40,0)+`<rect y="20" width="120" height="40" fill="rgba(4,9,21,.45)"/>`+T(12,32,60,6)+L(12,43,40)+B(86,36,24)),
  division:svg(P(8,10,44,40)+T(58,12,46,5)+L(58,22,48)+L(58,27,40)+B(58,36)+[0,1,2,3].map(i=>O(8+i*26.5,58,22.5,14)+L(12+i*26.5,63.5,14)).join("")),
  cta:svg(r(14,14,92,52,"rgba(42,143,224,.18)",6)+T(30,26,60,6)+L(36,38,48)+B(44,48,32)),
  features:svg(T(10,8,44,4)+[0,1,2].map(c=>[0,1].map(rw=>cir(15+c*35,28+rw*24,4,rw+c===0?C.ac:C.bl)+L(22+c*35,25+rw*24,20,C.fg)+L(22+c*35,30+rw*24,16)).join("")).join("")),
  quotes:svg(`<text x="10" y="36" font-size="32" fill="${C.ac}" font-family="serif">“</text>`+T(30,22,74,4.4)+L(30,32,70)+L(30,37,60)+cir(35,56,6,C.bl)+L(45,52,30,C.fg)+L(45,58,20)),
  quote:svg(T(10,8,50,4)+O(10,20,48,10)+O(62,20,48,10)+O(10,35,100,10)+O(10,50,100,14)+B(10,69,28)),
  catalog:svg([0,1,2,3].map(i=>r(10+i*22,8,18,6,i===0?C.ac:C.fa,3)).join("")+[0,1,2].map(c=>[0,1].map(rw=>P(10+c*35,20+rw*30,30,18)+L(10+c*35,41+rw*30,20,C.fg)).join("")).join("")),
  blog:svg(T(10,8,36,4)+[0,1,2].map(i=>P(10+i*35,18,30,24)+`<text x="${10+i*35}" y="50" font-size="4.5" fill="${C.mu}" font-family="monospace">12 NOV</text>`+L(10+i*35,54,28,C.fg)+L(10+i*35,60,22)).join("")),
  photo:svg(`<defs><clipPath id="tpPhA"><path d="M20 70 V34 A40 30 0 0 1 100 34 V70Z"/></clipPath></defs><g clip-path="url(#tpPhA)" opacity=".75">`+P(20,4,80,66,0)+`</g>`+`<path d="M20 70 V34 A40 30 0 0 1 100 34 V70Z" fill="none" stroke="${C.ac}" stroke-width="1" stroke-dasharray="2 2"/>`),
  logo:svg(`<g transform="translate(36 26)"><path d="M0 0h14c11 0 18 7 18 14s-7 14-18 14H0Z" fill="${C.bl}"/><path d="M5 5h9c6 0 10 4 10 9s-4 9-10 9H5Z" fill="#0b1528"/><path d="M5 9 L14 9 M5 14 L18 14 M5 19 L14 19" stroke="${C.mg}" stroke-width="1.6"/>`+`<text x="36" y="20" font-size="11" font-weight="700" fill="${C.fg}" font-family="sans-serif">DORMA</text></g>`+L(46,62,28)),
  article:svg(T(22,10,62,6)+L(22,20,30,C.ac)+[28,33,38,43,51,56,61,66].map((y,i)=>L(22,y,i%4===3?50:76)).join("")),
};
const MODAL={
  1:svg(pageBack+dim+r(14,8,92,64,"#0d1830",3)+P(18,12,54,56)+T(77,16,24,4)+L(77,24,24)+L(77,29,20)+B(77,56,20)),
  2:svg(pageBack+dim+r(10,10,100,60,"#0d1830",3)+T(16,15,36,4)+P(16,24,28,30)+P(46,24,28,30)+P(76,24,28,30)+L(16,59,40)),
  3:svg(pageBack+dim+r(10,10,100,60,"#0d1830",3)+T(16,15,40,4)+[0,1,2].map(i=>`<text x="${17+i*31}" y="34" font-size="6" fill="${i===0?C.ac:C.mu}" font-family="monospace">0${i+1}</text>`+L(17+i*31,38,22,C.fg)+L(17+i*31,43,18)+(i<2?dots3(40+i*31,36):"")).join("")+B(16,58,22)),
  4:svg(pageBack+dim+r(10,8,100,64,"#0d1830",3)+T(16,13,40,4)+[0,1,2,3].map(i=>r(16,22+i*12,88,9,C.fa,2)+cir(21,26.5+i*12,2,C.ac)+L(26,25+i*12,40,C.fg)+`<path d="M98 ${24.5+i*12} l2 2 -2 2" stroke="${C.mu}" fill="none"/>`).join("")),
  5:svg(pageBack+dim+r(10,6,100,68,"#0d1830",3)+[0,1,2].map(i=>`<text x="16" y="${16+i*21}" font-size="4.5" fill="${C.ac}" font-family="monospace">#PART-${i+1}</text>`+T(16,19+i*21,40,3.6)+L(16,25+i*21,70)+(i<2?r(16,30+i*21,88,.8,C.fa,0):"")).join("")+r(104,10,2,22,C.mu,1)),
};
const LAYOUT={
  cinematic:svg(P(0,0,120,46,0)+dim.replace('height="80"','height="46"')+nav()+T(12,24,56,6)+L(12,34,40)+T(10,54,40,4)+L(10,62,90)+L(10,67,70)),
  index:svg(r(8,6,14,3,C.fg)+[0,1,2,3,4].map(i=>r(10,18+i*11,i===1?70:44+((i*13)%26),6,i===1?C.ac:C.fg,1.5)+`<text x="104" y="${23+i*11}" font-size="5" fill="${C.mu}" font-family="monospace">0${i+1}</text>`).join("")),
  console:svg(r(0,0,30,80,"rgba(238,242,251,.07)",0)+r(6,8,16,3,C.fg)+[0,1,2,3,4].map(i=>L(6,22+i*8,i===0?18:14,i===0?C.ac:C.mu)).join("")+T(38,10,48,5)+L(38,20,70)+P(38,30,74,40)),
};
const PAGE={
  blank:svg(P(0,0,120,52,0)+dim.replace('height="80"','height="52"')+nav()+T(12,26,60,6)+L(12,37,40)+L(10,62,90)+L(10,68,70)),
  service:svg(P(0,0,120,30,0)+nav()+T(12,15,44,5)+[0,1,2].map(i=>r(10,36+i*8,64,6,C.fa,2)+cir(14,39+i*8,1.6,C.ac)).join("")+O(80,36,30,8)+O(80,47,30,8)+B(80,58,30)),
  catalog:svg(P(0,0,120,30,0)+nav()+T(12,15,44,5)+[0,1,2].map(i=>r(10+i*16,35,13,4,i===0?C.ac:C.fa,2)).join("")+[0,1,2,3].map(c=>P(10+c*19,43,16,14,1.5)).join("")+O(88,35,24,8)+O(88,46,24,8)+B(88,58,24)),
  article:svg(P(0,0,120,30,0)+nav()+T(12,15,50,5)+[38,43,48,53,61,66,71].map((y,i)=>L(24,y,i%3===2?44:72)).join("")),
};
const FLOWDISP={
  row:svg(T(10,14,44,4)+[0,1,2].map(i=>B(10+i*36,36,24,i===0?C.ac:"rgba(238,242,251,.22)")+(i<2?dots3(38+i*36,39.3):"")).join("")+`<path d="M22 46 v10 h12" stroke="${C.ac}" fill="none" stroke-width="1.1"/>`+O(36,52,30,12)+L(40,57,18)),
  reveal:svg(T(10,10,44,4)+[0,1,2].map(i=>r(10+i*36,22,26,6,i===1?C.ac:"rgba(238,242,251,.22)",3)+(i<2?dots3(40+i*36,25):"")).join("")+r(10,38,30,30,C.fa,2)+P(45,38,30,30)+r(80,38,30,30,C.fa,2)),
  tabs:svg(T(10,10,44,4)+[0,1,2].map(i=>L(12+i*30,26,22,i===0?C.fg:C.mu)).join("")+r(10,31,24,1.4,C.ac,0)+r(10,32,100,.6,C.fa,0)+r(10,38,100,32,C.fa,3)+P(14,42,38,24)+L(58,46,44,C.fg)+L(58,52,38)+L(58,57,30)),
};
const ITEMKIND={
  button:svg(B(30,34,60)+L(44,36.4,32,"#1b1300")),
  text:svg(cir(36,40,4,C.ac)+L(44,38.7,44,C.fg)),
  icon:svg(`<circle cx="60" cy="40" r="13" fill="none" stroke="${C.ac}" stroke-width="1.6"/><path d="M54 40 l4 4 8 -8" stroke="${C.ac}" stroke-width="2" fill="none"/>`),
  note:svg(`<path d="M30 46 c6 -10 10 6 16 -2 s8 -8 12 0 s8 6 14 -3 s8 2 14 -1" stroke="${C.ac}" stroke-width="1.6" fill="none" stroke-linecap="round" class="tp-draw"/>`+`<path d="M22 30 l4 6 -6 2z" fill="${C.mg}"/>`),
  svg:svg(`<text x="38" y="48" font-size="22" fill="${C.cy}" font-family="monospace">&lt;/&gt;</text>`),
};
const MENUMODE={
  auto:svg(r(6,10,66,44,C.fa,3)+r(10,15,12,3,C.fg)+L(38,15.3,8)+L(49,15.3,8)+L(60,15.3,8)+P(10,23,58,26)+r(82,10,30,56,C.fa,4)+r(85,14,10,2.5,C.fg)+[0,1,2].map(i=>r(104,14+i*2.2,5,1,C.fg,.5)).join("")+P(85,22,24,30)),
  overlay:svg(r(6,10,66,44,C.fa,3)+r(10,15,12,3,C.fg)+[0,1,2].map(i=>r(60,14.5+i*2.4,8,1.2,C.ac,.6)).join("")+P(10,23,58,26)+r(82,10,30,56,C.fa,4)+r(85,14,10,2.5,C.fg)+[0,1,2].map(i=>r(104,14+i*2.2,5,1,C.ac,.5)).join("")+P(85,22,24,30)),
};
const LINKSTYLE=(()=>{ const base=(mark)=>svg(L(14,38,22)+L(49,38,22,C.fg)+L(84,38,22)+mark); return {
  underline:base(r(49,44,22,1.4,C.ac,0)), overline:base(r(49,32,22,1.4,C.ac,0)), dot:base(cir(60,46,1.8,C.ac)),
  pill:base(`<rect x="44" y="33" width="32" height="13" rx="6.5" fill="none" stroke="${C.ac}" stroke-width="1.3"/>`),
  bracket:base(`<text x="42" y="43" font-size="9" fill="${C.ac}" font-family="monospace">[</text><text x="73" y="43" font-size="9" fill="${C.ac}" font-family="monospace">]</text>`),
  glow:base(`<rect x="46" y="34" width="28" height="11" rx="5" fill="${C.ac}" opacity=".22"/>`), none:base("") }; })();
const SHAPE={ none:"", rounded:"inset(6% round 14%)", pill:"inset(14% 6% round 999px)", arch:"inset(6% 22% 6% 22% round 999px 999px 0 0)", circle:"ellipse(34% 44% at 50% 50%)",
  hexagon:"polygon(28% 8%,72% 8%,92% 50%,72% 92%,28% 92%,8% 50%)", diamond:"polygon(50% 4%,90% 50%,50% 96%,10% 50%)", slant:"polygon(8% 8%,92% 8%,92% 74%,8% 92%)",
  notch:"polygon(8% 8%,80% 8%,92% 26%,92% 92%,20% 92%,8% 74%)", leaf:"inset(8% 18% round 0 50% 0 50%)", blob:"inset(8% 14% round 42% 58% 63% 37% / 45% 38% 62% 55%)" };
const COLORMODE={
  auto:svg(`<path d="M0 0H60V80H0Z" fill="#0b1528"/><path d="M60 0H120V80H60Z" fill="#f4f6fb"/>`+T(14,30,34,5)+L(14,40,28)+r(72,30,34,5,"#151a26")+r(72,40,28,2.6,"rgba(21,26,38,.45)")),
  dark:svg(T(20,30,60,6)+L(20,42,50)+L(20,48,40)),
  light:svg(`<rect width="120" height="80" fill="#f4f6fb"/>`+r(20,30,60,6,"#151a26")+r(20,42,50,2.6,"rgba(21,26,38,.45)")+r(20,48,40,2.6,"rgba(21,26,38,.45)")),
};
const PALETTE={ single:svg(cir(60,40,14,C.ac)), two:svg(cir(50,40,14,C.ac)+cir(70,40,14,C.bl)), brand:svg(cir(36,40,10,C.cy)+cir(52,40,10,C.mg)+cir(68,40,10,C.ac)+cir(84,40,10,"#0072bc")) };
const arrow=(rot)=>svg(`<g transform="rotate(${rot} 60 40)"><path d="M36 40 H82 M72 30 L84 40 72 50" stroke="${C.ac}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`);
const DIR={ right:arrow(0), left:arrow(180), up:arrow(-90), down:arrow(90), diag:arrow(-35), diag2:arrow(35) };
const DIR4={ left:arrow(0), right:arrow(180), up:arrow(-90), down:arrow(90) }; // "opens from" a side: the arrow shows the way it travels
const POS={ left:svg(cir(30,40,16,"rgba(255,203,8,.5)")+L(70,38,30)), center:svg(cir(60,40,16,"rgba(255,203,8,.5)")), right:svg(cir(90,40,16,"rgba(255,203,8,.5)")+L(20,38,30)) };
const SOFTEN={
  side:svg(`<defs><linearGradient id="tpsv" x1="0" x2="1"><stop offset="0" stop-color="#0b1528"/><stop offset=".7" stop-color="#0b1528" stop-opacity="0"/></linearGradient></defs>`+[0,1,2,3,4,5].map(i=>`<path d="M0 ${12+i*11} Q60 ${2+i*11} 120 ${14+i*11}" stroke="${C.cy}" fill="none" opacity=".7"/>`).join("")+`<rect width="120" height="80" fill="url(#tpsv)"/>`+T(10,32,40,5)+L(10,42,30)),
  even:svg([0,1,2,3,4,5].map(i=>`<path d="M0 ${12+i*11} Q60 ${2+i*11} 120 ${14+i*11}" stroke="${C.cy}" fill="none" opacity=".7"/>`).join("")+`<rect width="120" height="80" fill="#0b1528" opacity=".55"/>`+T(10,32,40,5)+L(10,42,30)),
  none:svg([0,1,2,3,4,5].map(i=>`<path d="M0 ${12+i*11} Q60 ${2+i*11} 120 ${14+i*11}" stroke="${C.cy}" fill="none"/>`).join("")+T(10,32,40,5)+L(10,42,30)),
};
/** Background effects: a small drawing per family; the highlighted tile plays the real effect. */
const FXGROUP={
  Lines:svg([0,1,2,3,4].map(i=>`<path d="M-4 ${18+i*11} C30 ${4+i*11} 70 ${34+i*11} 124 ${14+i*11}" stroke="${C.cy}" stroke-width="1.2" fill="none" opacity="${.4+i*.12}"/>`).join("")),
  Masks:svg(`<circle cx="60" cy="40" r="24" fill="none" stroke="${C.ac}" stroke-width="1.4"/>`+[0,1,2,3,4,5,6,7].map(i=>r(i*15+2,0,.6,80,C.fa,0)+r(0,i*11+2,120,.6,C.fa,0)).join("")),
  Colour:svg(`<circle cx="44" cy="38" r="20" fill="${C.mg}" opacity=".55"/><circle cx="72" cy="46" r="20" fill="${C.cy}" opacity=".55"/><circle cx="62" cy="28" r="14" fill="${C.ac}" opacity=".5"/>`),
  Print:svg([C.cy,C.mg,C.ac,"#0072bc"].map((c,i)=>`<path d="M${18+i*22} 0 L${38+i*22} 0 L${18+i*22} 80 L${-2+i*22} 80Z" fill="${c}" opacity=".75"/>`).join("")),
  Type:svg(`<text x="16" y="54" font-size="34" font-weight="700" fill="none" stroke="${C.ac}" stroke-width="1" font-family="sans-serif">Aa</text>`),
  Points:svg([[20,20],[44,34],[70,18],[96,30],[30,58],[62,54],[90,62]].map(([x,y],i,a)=>cir(x,y,1.8,C.fg)+(i?`<path d="M${a[i-1][0]} ${a[i-1][1]} L${x} ${y}" stroke="${C.mu}" stroke-width=".6"/>`:"")).join("")),
  Shapes:svg(`<circle cx="34" cy="32" r="9" fill="none" stroke="${C.cy}" stroke-width="1.4"/><rect x="58" y="22" width="16" height="16" fill="none" stroke="${C.ac}" stroke-width="1.4" transform="rotate(15 66 30)"/><path d="M84 58 l10 -16 10 16z" fill="none" stroke="${C.mg}" stroke-width="1.4"/>`),
};
const GLOBAL=svg(`<circle cx="60" cy="36" r="14" fill="none" stroke="${C.mu}" stroke-width="1.4"/><path d="M46 36 H74 M60 22 C52 30 52 42 60 50 C68 42 68 30 60 22" stroke="${C.mu}" stroke-width="1.2" fill="none"/>`+`<text x="60" y="66" text-anchor="middle" font-size="7" fill="${C.mu}" font-family="sans-serif">GLOBAL</text>`);
const NONE=svg(`<circle cx="60" cy="40" r="14" fill="none" stroke="${C.mu}" stroke-width="1.4"/><path d="M50 50 L70 30" stroke="${C.mu}" stroke-width="1.4"/>`);
const MATCH=svg(`<path d="M38 34 h40 l-6 -6 M82 46 h-40 l6 6" stroke="${C.ac}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);

/* ---------- animated previews ----------
   Each animation is a pair of states: hidden (H) and shown (S). "in" plays H → S, "out" plays S → H,
   "loop" goes S → H → S (hover effects). Keyframes are made once, the first time a preview needs them. */
const full="inset(0% 0% 0% 0%)";
const PRIM={
  fade:["opacity:0","opacity:1"],
  scale:["opacity:0;transform:scale(.55)","opacity:1;transform:scale(1)"],
  shrink:["opacity:0;transform:scale(.6)","opacity:1;transform:scale(1)"],
  rise:["opacity:0;transform:translateY(30%)","opacity:1;transform:translateY(0)"],
  slideUp:["opacity:0;transform:translateY(60%)","opacity:1;transform:translateY(0)"],
  dropTop:["transform:translateY(-110%)","transform:translateY(0)"],
  slideLeft:["opacity:0;transform:translateX(-45%)","opacity:1;transform:translateX(0)"],
  slideRight:["opacity:0;transform:translateX(45%)","opacity:1;transform:translateX(0)"],
  fromSide:["transform:translateX(105%)","transform:translateX(0)"],
  slideAway:["opacity:0;transform:translateY(-55%)","opacity:1;transform:translateY(0)"],
  irisClick:["clip-path:circle(0% at 82% 82%)","clip-path:circle(140% at 82% 82%)"],
  irisTop:["clip-path:circle(0% at 92% 4%)","clip-path:circle(150% at 92% 4%)"],
  iris:["clip-path:circle(0% at 50% 50%)","clip-path:circle(75% at 50% 50%)"],
  spot:["clip-path:circle(0% at 50% 50%);filter:blur(4px)","clip-path:circle(75% at 50% 50%);filter:blur(0)"],
  zoomClick:["opacity:0;transform:scale(.08);transform-origin:82% 82%","opacity:1;transform:scale(1);transform-origin:82% 82%"],
  zoomIn:["opacity:0;transform:scale(1.35)","opacity:1;transform:scale(1)"],
  wipe:["clip-path:inset(0% 100% 0% 0%)","clip-path:"+full],
  wipeUp:["clip-path:inset(100% 0% 0% 0%)","clip-path:"+full],
  wipeDown:["clip-path:inset(0% 0% 100% 0%)","clip-path:"+full],
  curtain:["clip-path:inset(0% 50% 0% 50%)","clip-path:"+full],
  collapse:["clip-path:inset(50% 0% 50% 0%)","clip-path:"+full],
  diagonal:["clip-path:polygon(0% 0%,0% 0%,0% 0%)","clip-path:polygon(0% 0%,200% 0%,0% 200%)"],
  diamond:["clip-path:polygon(50% 50%,50% 50%,50% 50%,50% 50%)","clip-path:polygon(50% -50%,150% 50%,50% 150%,-50% 50%)"],
  flip:["opacity:0;transform:perspective(160px) rotateX(-75deg);transform-origin:50% 0","opacity:1;transform:perspective(160px) rotateX(0deg);transform-origin:50% 0"],
  flipItem:["opacity:0;transform:perspective(120px) rotateY(-90deg)","opacity:1;transform:perspective(120px) rotateY(0deg)"],
  fold:["opacity:.3;transform:perspective(160px) rotateX(45deg);transform-origin:50% 0","opacity:1;transform:perspective(160px) rotateX(0deg);transform-origin:50% 0"],
  tilt:["opacity:0;transform:perspective(160px) rotateX(35deg) translateY(20%)","opacity:1;transform:perspective(160px) rotateX(0deg) translateY(0)"],
  skew:["opacity:0;transform:skewY(8deg) translateY(25%)","opacity:1;transform:skewY(0deg) translateY(0)"],
  blur:["opacity:0;filter:blur(5px)","opacity:1;filter:blur(0px)"],
  dim:["filter:brightness(.25)","filter:brightness(1)"],
  parallax:["transform:translateY(-22%)","transform:translateY(0)"],
  zoomFrame:["transform:scale(1.45)","transform:scale(1)"],
  coverY:["transform:scaleY(1)","transform:scaleY(0)"],
  coverX:["transform:scaleX(1)","transform:scaleX(0)"],
  coverS:["transform:scale(1)","transform:scale(0)"],
  coverL:["transform:translateX(0)","transform:translateX(-101%)"],
  coverR:["transform:translateX(0)","transform:translateX(101%)"],
  sweep:["transform:scaleX(1);transform-origin:100% 50%","transform:scaleX(0);transform-origin:100% 50%"],
  late:["opacity:0","opacity:1"],
  grow:["transform:scaleX(0)","transform:scaleX(1)"],
  /* hover (loop): S is at rest, H is while the pointer is over it */
  hZoom:["transform:scale(1.18)","transform:scale(1)"],
  hTilt:["transform:perspective(160px) rotateY(14deg) rotateX(-6deg)","transform:perspective(160px) rotateY(0deg) rotateX(0deg)"],
  hColor:["filter:grayscale(0)","filter:grayscale(1)"],
  hLift:["transform:translateY(-8%);box-shadow:0 8px 18px rgba(255,203,8,.35)","transform:translateY(0);box-shadow:0 0 0 rgba(255,203,8,0)"],
  hSpot:["transform:translate(60%,10%)","transform:translate(-60%,-10%)"],
  hBright:["opacity:1","opacity:.45"],
  hLine:["transform:scaleX(1)","transform:scaleX(0)"],
  hRaise:["transform:translateY(-35%)","transform:translateY(0)"],
  hGlow:["box-shadow:0 0 10px 2px rgba(255,203,8,.6)","box-shadow:0 0 0 0 rgba(255,203,8,0)"],
  /* easing: the dot travels with each curve */
  ease:["left:10%","left:80%"],
};
/* moves that need more than two states */
const CUSTOM={
  unfold:"0%,12%{clip-path:inset(50% 50% 50% 50%)}32%{clip-path:inset(49% 0% 49% 0%)}56%,86%{clip-path:inset(0% 0% 0% 0%);opacity:1}100%{clip-path:inset(0% 0% 0% 0%);opacity:0}",
  drop:"0%,12%{transform:translateY(-120%)}40%{transform:translateY(7%)}47%{transform:translateY(-4%)}54%,86%{transform:translateY(0);opacity:1}100%{opacity:0}",
  pop:"0%,12%{opacity:0;transform:scale(.3)}38%{opacity:1;transform:scale(1.18)}50%,86%{opacity:1;transform:scale(1)}100%{opacity:0}",
  zoomThrough:"0%,14%{opacity:0;transform:scale(.7)}50%,86%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.25)}",
  elastic:"0%,10%{left:10%}30%{left:88%}38%{left:74%}46%{left:83%}54%,86%{left:80%;opacity:1}100%{left:80%;opacity:0}",
  scan:"0%,10%{transform:translateY(0);opacity:0}14%{opacity:1}46%{transform:translateY(calc(var(--tp-h,54px)));opacity:1}52%,100%{opacity:0;transform:translateY(calc(var(--tp-h,54px)))}",
  midIn:"0%,40%{opacity:0}52%,86%{opacity:1}100%{opacity:0}",
  midOut:"0%{opacity:0}10%,40%{opacity:1}52%,100%{opacity:0}",
  barIn:"0%,8%{transform:translateX(-102%)}38%,46%{transform:translateX(0)}78%,100%{transform:translateX(102%)}",
  draw:"0%,10%{stroke-dashoffset:120}60%,86%{stroke-dashoffset:0;opacity:1}100%{opacity:0}",
};
const EASES={ expo:"cubic-bezier(.16,1,.3,1)", power3:"cubic-bezier(.215,.61,.355,1)", sine:"cubic-bezier(.37,0,.63,1)", back:"cubic-bezier(.34,1.56,.64,1)" };
const KF=new Set();
function kf(name){
  if (KF.has(name) || typeof document==="undefined") return; KF.add(name);
  let body="";
  if (CUSTOM[name.replace(/^tpk-/,"")]) body=CUSTOM[name.replace(/^tpk-/,"")];
  else { const [,p,mode]=name.match(/^tpk-(\w+)-(in|out|loop)$/)||[]; const st=PRIM[p]; if (!st) return; const H="opacity:1;"+st[0], S="opacity:1;"+st[1]; /* opacity in every step, so the fade at the end of a loop doesn't spread over the whole loop */
    body=mode==="in"?`0%,14%{${H}}52%,86%{${S}}100%{${S};opacity:0}`:mode==="out"?`0%{${S};opacity:0}10%,34%{${S}}72%,100%{${H}}`:`0%,18%{${S}}45%,68%{${H}}95%,100%{${S}}`; }
  let st=document.getElementById("tp-kf"); if (!st){ st=document.createElement("style"); st.id="tp-kf"; document.head.append(st); }
  st.append(document.createTextNode(`@keyframes ${name}{${body}}\n`));
}
/** The CSS animation for one moving part: prim plus mode ("in", "out", "loop") or a custom name. */
const anim=(p,mode="in",extra="")=>{ const name=CUSTOM[p]?"tpk-"+p:`tpk-${p}-${mode}`; kf(name); return `animation-name:${name};--tp-d:${mode==="out"?"-.5s":"-1.7s"};${extra}`; };
const part=(cls,style="",inner="")=>`<i class="${cls}" style="${style}">${inner}</i>`;

/* scenes: little stages the moving part lives in */
const sPage=`<div class="tp-pg"><b></b><i></i><i></i><i class="s"></i></div>`;
const sPic=(style="",cls="")=>part("tp-pic "+cls,style);
const sBox=(inner)=>`<div class="tp-box-in"><b></b><i></i><i class="s"></i></div>`+(inner||"");
const BRANDC=["#00aeef","#ed0677","#ffcb08","#0072bc"];
/** Covers over a picture (blinds, shutters, tiles, curtain, CMYK) that move away. */
function covers(kind){
  if (kind==="slatsH") return [0,1,2,3,4].map(i=>part("tp-cv",`top:${i*20}%;height:20.5%;left:0;right:0;transform-origin:50% 0;--i:${i};`+anim("coverY"))).join("");
  if (kind==="slatsV") return [0,1,2,3,4].map(i=>part("tp-cv",`left:${i*20}%;width:20.5%;top:0;bottom:0;transform-origin:0 50%;--i:${i};`+anim("coverX"))).join("");
  if (kind==="tiles"){ let s=""; for (let rr=0;rr<3;rr++) for (let k=0;k<4;k++) s+=part("tp-cv",`left:${k*25}%;top:${rr*33.34}%;width:25.5%;height:33.8%;--i:${(k*3+rr*5)%7*.5};`+anim("coverS")); return s; }
  if (kind==="halves") return part("tp-cv","left:0;top:0;bottom:0;width:50.5%;"+anim("coverL"))+part("tp-cv","right:0;top:0;bottom:0;width:50.5%;"+anim("coverR"));
  if (kind==="cmyk") return [...BRANDC.map((c,i)=>part("tp-cv",`inset:0;background:${c};z-index:${6-i};--i:${i};`+anim("sweep"))),part("tp-cv",`inset:0;z-index:7;--i:-1;`+anim("sweep"))].join("");
  if (kind==="bars") return BRANDC.map((c,i)=>part("tp-cv",`top:0;bottom:0;left:${i*25}%;width:25.5%;background:${c};z-index:6;--i:${i*.4};`+anim("barIn"))).join("");
  if (kind==="cmykBands") return BRANDC.map((c,i)=>part("tp-cv",`left:0;right:0;top:${i*25}%;height:25.5%;background:${c};z-index:6;--i:${i*.4};`+anim("barIn"))).join("");
  return "";
}
const thumb=(inner,cls="")=>`<div class="tp-sc ${cls}">${inner}</div>`;
/** Modal opening/closing: the box over a dimmed page. */
function modalScene(p,mode,cov){ return thumb(sPage+`<i class="tp-dimmer"></i>`+part("tp-t tp-box",anim(p,mode),sBox())+(cov?covers(cov):"")); }
const MODAL_OPEN={ line:"scan", fade:"fade", scale:"scale", slide:"slideUp", iris:"irisClick", zoom:"zoomClick", wipe:"wipe", curtain:"curtain", unfold:"unfold", diagonal:"diagonal", flip:"flip", drop:"drop", blur:"blur", blinds:"#bars", cmyk:"#cmykBands" };
const MODAL_CLOSE={ fade:"fade", shrink:"shrink", slideDown:"slideUp", iris:"irisClick", zoomOut:"zoomClick", wipe:"wipe", curtain:"curtain", collapse:"collapse", flip:"flip", blur:"blur", blinds:"#bars" };
function modalAnim(v,mode){ const p=(mode==="in"?MODAL_OPEN:MODAL_CLOSE)[v]; if (!p) return null;
  if (p==="scan") return thumb(sPage+`<i class="tp-dimmer"></i>`+part("tp-t tp-box",anim("unfold"),sBox())+part("tp-scan",anim("scan")));
  if (p[0]==="#") return modalScene(mode==="in"?"midIn":"midOut",mode,p.slice(1));
  return modalScene(p,mode); }
const SEC_IN={ rise:"rise", fade:"fade", scale:"scale", zoom:"zoomIn", blur:"blur", slideLeft:"slideLeft", slideRight:"slideRight", tilt:"tilt", skew:"skew", wipe:"wipeUp", iris:"iris", curtain:"curtain" };
const SEC_OUT={ fade:"fade", shrink:"shrink", blur:"blur", parallax:"parallax", dim:"dim", fold:"fold", slide:"slideAway" };
function sectionAnim(v,mode){
  if (mode==="in" && v==="stagger") return thumb(`<div class="tp-pg tp-pgs">${[0,1,2,3].map(i=>part(i?"":"b",`--i:${i*1.5};`+anim("rise"))).join("")}</div>`,"tp-light");
  const p=(mode==="in"?SEC_IN:SEC_OUT)[v]; if (!p) return null;
  return thumb(part("tp-t tp-secb",anim(p,mode),`<b></b><i></i><i></i><i class="s"></i>`),"tp-light"); }
const IMG_REVEAL={ wipe:"wipe", iris:"iris", diamond:"diamond", diagonal:"diagonal", split:"curtain", bars:"unfold", curtain:"#halves", blinds:"#slatsH", shutters:"#slatsV", tiles:"#tiles", cmyk:"#cmyk", spot:"spot", zoom:"zoomFrame", blur:"blur" };
function imageReveal(v){ const p=IMG_REVEAL[v]; if (!p) return v==="none"?thumb(sPic()):null;
  if (p[0]==="#") return thumb(sPic()+covers(p.slice(1)));
  return thumb(sPic(anim(p))); }
const IMG_HOVER={ zoom:"hZoom", tilt:"hTilt", color:"hColor", lift:"hLift" };
function imageHover(v){ if (v==="none") return thumb(sPic());
  if (v==="spot") return thumb(sPic("","tp-pic-dark")+part("tp-glow",anim("hSpot","loop"))+cursor());
  const p=IMG_HOVER[v]; return p?thumb(`<div class="tp-clip">${sPic(anim(p,"loop"))}</div>`+cursor()):null; }
const cursor=()=>`<svg class="tp-cur" viewBox="0 0 10 14" style="${anim("hBright","loop")}"><path d="M1 1 L1 12 L4 9 L6 13 L8 12 L6 8 L10 8Z" fill="#fff" stroke="#000" stroke-width=".6"/></svg>`;
function imageShape(v){ const s=SHAPE[v]; if (s==null) return null; return thumb(sPic(s?`clip-path:${s};inset:0`:"inset:10% 8%")); }
const PRESET={ rise:"rise", fade:"fade", scale:"scale", blur:"blur", slideLeft:"slideLeft", slideRight:"slideRight", flip:"flipItem", pop:"pop" };
function presetAnim(v){ const p=PRESET[v]; const items=[0,1,2].map(i=>part("tp-it"+(i===0?" a":""),p?`--i:${i*2};`+anim(p):"")).join(`<i class="tp-d3"></i>`); return (p||v==="none")?thumb(`<div class="tp-row">${items}</div>`):null; }
const MENU_OPEN={ fade:"fade", slide:"fromSide", drop:"dropTop", circle:"irisTop", curtain:"curtain", wipe:"wipeDown", cmyk:"#cmyk" };
const menuPanel=(style)=>part("tp-t tp-menu",style,[0,1,2,3].map(()=>"<i></i>").join(""));
const burger=`<i class="tp-burger"><i></i><i></i><i></i></i>`;
function menuOpen(v){ const p=MENU_OPEN[v]; if (!p) return null;
  if (p[0]==="#") return thumb(sPage+burger+menuPanel(anim("midIn"))+covers("cmyk"));
  return thumb(sPage+burger+menuPanel(anim(p))); }
const MENU_ITEMS={ rise:"rise", fade:"fade", slide:"slideRight", scale:"scale", blur:"blur" };
function menuItems(v){ const p=MENU_ITEMS[v]; if (!p&&v!=="none") return null;
  return thumb(part("tp-menu tp-menu-on","",[0,1,2,3].map(i=>part("",p?`--i:${i*1.5};`+anim(p):anim("fade"))).join(""))); }
function menuHover(v){ const p={fade:"hBright",line:"hLine",lift:"hRaise",glow:"hGlow"}[v]; if (!p) return null;
  const mid=v==="line"?`<i class="tp-lk on"><i class="tp-ul" style="${anim(p,"loop")}"></i></i>`:part("tp-lk on",anim(p,"loop"));
  return thumb(`<div class="tp-links"><i class="tp-lk"></i>${mid}<i class="tp-lk"></i></div>`+cursor()); }
function transition(v){ const p={wipe:"wipe",fade:"fade",slide:"fromSide",zoom:"zoomThrough"}[v]; if (!p) return null;
  return thumb(sPic("inset:0")+sPic("inset:0;"+anim(p),"tp-pic-b")+(v==="wipe"?part("tp-wline",anim("fromSide")):"")); }
function titleReveal(v){
  if (v==="chars") return thumb(`<div class="tp-title">${[...Array(8)].map((_,i)=>part("c",`--i:${i*.6};`+anim("rise"))).join("")}</div>`,"tp-light");
  if (v==="words") return thumb(`<div class="tp-title">${[0,1,2].map(i=>part("w",`--i:${i*1.6};`+anim("rise"))).join("")}</div>`,"tp-light");
  if (v==="fade"||v==="blur") return thumb(`<div class="tp-title" style="${anim(v==="fade"?"rise":"blur")}">${[0,1,2].map(()=>part("w")).join("")}</div>`,"tp-light");
  return null; }
function scrollReveal(v){ if (v==="none") return thumb(sPage,"tp-light"); const p={rise:"rise",fade:"fade"}[v]; return p?thumb(part("tp-t tp-secb",anim(p),`<b></b><i></i><i></i><i class="s"></i>`),"tp-light"):null; }
function easeAnim(v){ const fn=EASES[v]; if (!fn&&v!=="elastic") return null;
  return thumb(`<i class="tp-track"></i>`+part("tp-dot",v==="elastic"?anim("elastic"):anim("ease","in",`animation-timing-function:${fn};`))); }
let FXG={}; // background effect → its family (Lines, Colour…), given by registerLists
function fxGlyph(v){ const g=FXG[v]; return g&&FXGROUP[g]?thumb(FXGROUP[g],"tp-fx"):null; }

/* ---------- section extras: icons by titles, logo and button blocks, heading styles, card hover, photo masks ---------- */
PRIM.spinIn=["opacity:0;transform:rotate(-180deg) scale(.4)","opacity:1;transform:rotate(0deg) scale(1)"];
PRIM.drop=["opacity:0;transform:translateY(-70%)","opacity:1;transform:translateY(0)"];
PRIM.flipX=["opacity:0;transform:perspective(120px) rotateX(-80deg)","opacity:1;transform:perspective(120px) rotateX(0deg)"];
PRIM.lFloat=["transform:translateY(-14%)","transform:translateY(0)"];
PRIM.lPulse=["transform:scale(1.14)","transform:scale(1)"];
PRIM.lGlow=["filter:drop-shadow(0 0 5px #ffcb08)","filter:drop-shadow(0 0 0 transparent)"];
PRIM.lSwing=["transform:rotate(14deg)","transform:rotate(-10deg)"];
CUSTOM.nudge="0%,60%,100%{transform:translateX(0)}66%{transform:translateX(-12%)}72%{transform:translateX(12%)}78%{transform:translateX(-6%)}84%{transform:translateX(0)}";
CUSTOM.shineRun="0%,20%{transform:translateX(-120%)}70%,100%{transform:translateX(120%)}";
CUSTOM.typeOn="0%,8%{clip-path:inset(0 100% 0 0)}60%,86%{clip-path:inset(0 0% 0 0)}100%{clip-path:inset(0 0% 0 0);opacity:0}";
const ICON_G=`<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="none" stroke="${C.ac}" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const icoPart=(style="",x=46,y=24,s=28)=>part("tp-ico",`left:${x/1.2}%;top:${y/.8}%;width:${s/1.2}%;height:${s/.8}%;${style}`,ICON_G);
const ICONPOS={ before:svg(`<g transform="translate(12 28) scale(1)">${ICON_G.replace('width="100%" height="100%"','width="22" height="22"')}</g>`+T(40,34,64,9)+L(40,52,48)),
  after:svg(T(12,34,64,9)+`<g transform="translate(82 28)">${ICON_G.replace('width="100%" height="100%"','width="22" height="22"')}</g>`+L(12,52,48)),
  above:svg(`<g transform="translate(12 10)">${ICON_G.replace('width="100%" height="100%"','width="22" height="22"')}</g>`+T(12,40,70,9)+L(12,58,50)) };
const ICONANIM={ pop:"pop", spin:"spinIn", rise:"rise", float:"~lFloat", pulse:"~lPulse", glow:"~lGlow", swing:"~lSwing" };
function iconAnim(v){ if (v==="draw") return thumb(part("tp-ico tp-ico-draw","left:38%;top:24%;width:24%;height:40%",ICON_G.replace('stroke-width="1.8"',`stroke-width="1.8" stroke-dasharray="120" style="${anim("draw")}"`)));
  const p=ICONANIM[v]; if (!p) return null; return thumb(part("tp-ico","left:38%;top:24%;width:24%;height:40%;"+(p[0]==="~"?anim(p.slice(1),"loop"):anim(p)),ICON_G)); }
const BLOCKIN={ fade:"fade", rise:"rise", pop:"pop", blur:"blur", spin:"spinIn", drop:"drop", wipe:"wipe", flip:"flipX" };
const logoGlyph=(style)=>part("tp-lg",style,`<b></b><i></i>`);
function blockIn(v){ const p=BLOCKIN[v]; return p?thumb(logoGlyph(anim(p))):null; }
const BLOCKLOOP={ float:"lFloat", pulse:"lPulse", glow:"lGlow", breathe:"lPulse" };
function blockLoop(v){ if (v==="shine") return thumb(`<div class="tp-lgwrap">${logoGlyph("")}${part("tp-shine",anim("shineRun"))}</div>`);
  if (v==="nudge") return thumb(part("tp-cb",anim("nudge")));
  const p=BLOCKLOOP[v]; return p?thumb(logoGlyph(anim(p,"loop",v==="breathe"?"animation-duration:5s;":""))):null; }
const HEADST={
  gradient:`<defs><linearGradient id="tpHg" x1="0" x2="1"><stop offset="0" stop-color="${C.fg}"/><stop offset="1" stop-color="${C.ac}"/></linearGradient></defs>`+r(12,30,96,14,"url(#tpHg)",3),
  shimmer:`<defs><linearGradient id="tpHs" x1="0" x2="1"><stop offset="0" stop-color="${C.fg}"/><stop offset=".5" stop-color="${C.ac}"/><stop offset="1" stop-color="${C.fg}"/></linearGradient></defs>`+r(12,30,96,14,"url(#tpHs)",3),
  glow:`<defs><filter id="tpHgl" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>`+r(12,30,96,14,C.ac,3).replace("/>",' filter="url(#tpHgl)" opacity=".7"/>')+r(12,30,96,14,C.fg,3),
  outline:`<rect x="12" y="30" width="96" height="14" rx="3" fill="none" stroke="${C.fg}" stroke-width="1.4"/>`,
  marker:r(10,36,100,11,"rgba(255,203,8,.55)",1)+r(12,30,96,12,C.fg,3),
  underline:r(12,28,96,13,C.fg,3)+r(12,47,96,2.4,C.ac,1),
  cmyk:r(10,29,96,14,"rgba(0,174,239,.8)",3)+r(14,31,96,14,"rgba(237,6,119,.75)",3)+r(12,30,96,14,C.fg,3),
};
function headStyle(v){ if (v==="none") return thumb(svg(r(12,30,96,14,C.fg,3)+L(12,54,70))); const b=HEADST[v]; return b?thumb(svg(b+L(12,56,70))):null; }
function headIn(v){ if (v===""||v==="keep") return scrollReveal("rise"); if (v==="type") return thumb(`<div class="tp-title" style="${anim("typeOn")}">${[0,1,2].map(()=>part("w")).join("")}</div>`,"tp-light"); return titleReveal(v); }
const CARDHOVER={ lift:"hLift", glow:"hGlow", zoom:"hZoom", border:"hGlow" };
function cardHoverPrev(v){ if (v==="tilt") return imageHover("tilt"); if (v==="shine") return thumb(`<div class="tp-clip">${sPic()}${part("tp-shine",anim("shineRun"))}</div>`+cursor());
  if (v==="zoom") return imageHover("zoom"); const p=CARDHOVER[v]; return p?thumb(`<div class="tp-clip">${sPic(anim(p,"loop")+(v==="border"?";outline:2px solid #ffcb08;outline-offset:-2px":""))}</div>`+cursor()):null; }
const FADE_MASK={ fadeBottom:"linear-gradient(#000 40%,transparent)", fadeTop:"linear-gradient(transparent,#000 60%)", fadeSides:"linear-gradient(90deg,transparent,#000 22%,#000 78%,transparent)",
  soft:"radial-gradient(ellipse 60% 60% at 50% 50%,#000 40%,transparent 100%)", stripes:"repeating-linear-gradient(115deg,#000 0 6px,transparent 6px 9px)", halftone:"radial-gradient(circle,#000 55%,transparent 60%) 0 0/6px 6px",
  wave:`url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 0H100V80C84 96 68 70 50 84S16 98 0 80Z"/></svg>')}") 0 0/100% 100% no-repeat` };
function photoMask(v){ if (v==="word") return thumb(`<div class="tp-word">DOR</div>`);
  if (v==="frame") return thumb(sPic("inset:10% 8%;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,0 0,10% 14%,10% 86%,90% 86%,90% 14%,10% 14%)"));
  if (FADE_MASK[v]) return thumb(sPic(`-webkit-mask:${FADE_MASK[v]};mask:${FADE_MASK[v]}`));
  return imageShape(v); }
const CTA_ST={ site:B(34,34,52,"rgba(255,203,8,.25)")+`<rect x="34" y="34" width="52" height="12" rx="6" fill="none" stroke="${C.ac}" stroke-width=".8"/>`, solid:r(34,34,52,12,C.ac,6), outline:`<rect x="34" y="34" width="52" height="12" rx="6" fill="none" stroke="${C.ac}" stroke-width="1.4"/>`,
  ring:`<rect x="30" y="30" width="60" height="20" rx="10" fill="none" stroke="rgba(255,203,8,.35)" stroke-width="2"/><rect x="34" y="34" width="52" height="12" rx="6" fill="none" stroke="${C.ac}" stroke-width="1"/>`,
  link:L(34,39,40,C.fg)+`<path d="M78 40.3h8 l-3 -3 M86 40.3 l-3 3" stroke="${C.ac}" stroke-width="1.3" fill="none"/>` };
const ctaStyle=v=>CTA_ST[v]?thumb(svg(CTA_ST[v]+(v==="link"?"":L(42,39.2,28,C.fg)))):null;

/* ---------- which preview goes with which list ---------- */
const st=(map)=>v=>map[v]?thumb(map[v]):null;
const KINDS={
  section:st(SECTION), modalType:st(MODAL), layout:st(LAYOUT), pageTemplate:st(PAGE), flowDisplay:st(FLOWDISP), itemKind:st(ITEMKIND),
  menuMode:st(MENUMODE), linkStyle:st(LINKSTYLE), colorMode:st(COLORMODE), palette:st(PALETTE), fxDir:st(DIR), dir4:st(DIR4), fxPos:st(POS), fxSoften:st(SOFTEN),
  modalOpen:v=>modalAnim(v,"in"), modalClose:v=>v==="auto"?thumb(MATCH):modalAnim(v,"out"),
  sectionIn:v=>sectionAnim(v,"in"), sectionOut:v=>sectionAnim(v,"out"),
  iconPos:st(ICONPOS), iconAnim, blockIn, blockLoop, headStyle, headIn, cardHover:cardHoverPrev, photoMask, ctaStyle,
  imageReveal, imageShape, imageHover, preset:presetAnim, menuOpen, menuItems, menuHover, transition, titleReveal, scrollReveal, ease:easeAnim, bgfx:fxGlyph,
  /* the studio's "New" menu: page templates, modal types and flows in one list */
  create:v=>{ const [k,x]=String(v).split(":"); return k==="page"?KINDS.pageTemplate(x):k==="modal"?KINDS.modalType(x):k==="flow"?KINDS.flowDisplay(x):null; },
};
/** The preview for one choice, as HTML (empty string when that choice has none). */
function previewHtml(kind,value){
  const v=value==null?"":String(value);
  if (v===""||v==="default") return thumb(GLOBAL);
  const f=KINDS[kind]; const out=f?f(v):null;
  if (out) return out;
  if (v==="none") return thumb(NONE);
  return "";
}
/** Lists in OPT (data.js) that get a visual picker, found by the options' own entries, so a list with
    "Global" or "Effect default" added in front is recognised too. */
const LISTS=new WeakMap();
function registerLists(OPT,{fxGroups=null,...extra}={}){
  if (fxGroups) FXG=fxGroups;
  const map={ modalTypes:"modalType", layouts:"layout", flowDisplays:"flowDisplay", kinds:"itemKind", presets:"preset", imageReveal:"imageReveal", imageShape:"imageShape", imageHover:"imageHover",
    sectionIn:"sectionIn", sectionOut:"sectionOut", modalOpen:"modalOpen", modalClose:"modalClose", menuModes:"menuMode", menuLinkStyles:"linkStyle", menuHover:"menuHover",
    menuOpen:"menuOpen", menuItems:"menuItems", transition:"transition", titleReveal:"titleReveal", scrollReveal:"scrollReveal", ease:"ease", colorModes:"colorMode",
    fxPalettes:"palette", fxDirs:"fxDir", dirs4:"dir4", fxPos:"fxPos", fxSoften:"fxSoften", bgfx:"bgfx",
    iconPos:"iconPos", iconAnim:"iconAnim", blockIn:"blockIn", blockLoop:"blockLoop", headStyles:"headStyle", headIn:"headIn", cardHover:"cardHover", photoMasks:"photoMask", ctaStyles:"ctaStyle", ...extra };
  Object.entries(map).forEach(([k,kind])=>{ const list=OPT[k]; if (Array.isArray(list)) list.forEach(o=>{ if (o&&typeof o==="object") LISTS.set(o,kind); }); });
}
/** Which preview kind fits these options (or "" for an ordinary dropdown). */
function kindOf(options){
  const n={}; let best="", hi=0;
  (options||[]).forEach(o=>{ const k=o&&typeof o==="object"?LISTS.get(o):null; if (k){ n[k]=(n[k]||0)+1; if (n[k]>hi){ hi=n[k]; best=k; } } });
  return hi>=2?best:"";
}

/* ================= THE PICKER ================= */
let OPEN=null;
/**
 * Turns a <select> into a visual picker. The select stays in the DOM (hidden) and is the source of truth.
 * opts.kind: which previews; opts.fx(box,type): plays a live background effect in a tile (returns a stop function);
 * opts.action: a menu that runs an action and goes back to its placeholder (the "New" menu).
 */
function typePicker(sel,{kind,fx=null,action=false}={}){
  const wrap=document.createElement("div"); wrap.className="tp"+(action?" tp-action":"");
  const btn=document.createElement("button"); btn.type="button"; btn.className="tp-btn"+(sel.className?" "+sel.className:"");
  btn.setAttribute("aria-haspopup","listbox"); btn.setAttribute("aria-expanded","false");
  if (sel.id){ btn.id=sel.id; sel.removeAttribute("id"); }
  const al=sel.getAttribute("aria-label"); if (al) btn.setAttribute("aria-label",al);
  if (sel.title) btn.title=sel.title;
  sel.tabIndex=-1; sel.setAttribute("aria-hidden","true"); sel.classList.add("tp-native");
  const items=()=>{ const out=[]; [...sel.children].forEach(c=>{ if (c.tagName==="OPTGROUP") [...c.children].forEach(o=>out.push({o,group:c.label})); else out.push({o:c,group:""}); }); return out; };
  const sync=()=>{ const o=sel.options[sel.selectedIndex]; const v=o?o.value:"";
    const pv=action&&v===""?"":previewHtml(kind,v);
    btn.innerHTML=(pv?`<span class="tp-mini">${pv}</span>`:"")+`<span class="tp-name"></span><svg class="tp-chev" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
    btn.querySelector(".tp-name").textContent=o?o.text:""; };
  sel._tpSync=sync; sync();
  btn.addEventListener("click",()=>{ OPEN&&OPEN.wrap===wrap?close():open(); });
  btn.addEventListener("keydown",e=>{ if (e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); open(); } });
  wrap.append(btn,sel);

  let pop=null, stopFx=null;
  function close(focus=true){ if (!pop) return; if (stopFx){ stopFx(); stopFx=null; } pop.remove(); pop=null; OPEN=null; btn.setAttribute("aria-expanded","false");
    document.removeEventListener("pointerdown",outside,true); window.removeEventListener("resize",onResize); document.removeEventListener("scroll",place,true); if (focus) btn.focus(); }
  const outside=e=>{ if (pop&&!pop.contains(e.target)&&!btn.contains(e.target)) close(false); };
  const onResize=()=>place();
  function pick(value){ const changed=sel.value!==value; sel.value=value; if (changed||action) sel.dispatchEvent(new Event("change",{bubbles:true})); sync(); close(); }
  function place(){ if (!pop) return; const vw=window.innerWidth, vh=window.innerHeight, rc=btn.getBoundingClientRect();
    if (vw<640){ Object.assign(pop.style,{left:"0px",right:"0px",top:"auto",bottom:"0px",width:"auto",maxHeight:Math.round(vh*.8)+"px"}); pop.classList.add("sheet"); return; }
    pop.classList.remove("sheet"); const w=Math.min(action?560:640,vw-24), below=vh-rc.bottom-12, above=rc.top-12, up=below<320&&above>below;
    Object.assign(pop.style,{width:w+"px",left:Math.max(12,Math.min(rc.left,vw-w-12))+"px",right:"auto",maxHeight:Math.max(220,Math.min(520,up?above:below))+"px"});
    if (up){ pop.style.top="auto"; pop.style.bottom=(vh-rc.top+6)+"px"; } else { pop.style.bottom="auto"; pop.style.top=(rc.bottom+6)+"px"; } }
  function open(){
    if (OPEN) OPEN.close(false);
    const list=items().filter(x=>!(action&&x.o.value===""));
    pop=document.createElement("div"); pop.className="tp-pop"; pop.setAttribute("role","dialog"); pop.setAttribute("aria-label",(al||btn.closest(".field")?.querySelector("label")?.textContent||"Choose")+" — choose");
    const lid="tp"+Math.random().toString(36).slice(2,8);
    const head=document.createElement("div"); head.className="tp-head";
    const q=document.createElement("input"); q.type="search"; q.placeholder="Search "+list.length+" choices"; q.className="tp-q"; q.setAttribute("aria-controls",lid); q.setAttribute("aria-label","Search the choices");
    const x=document.createElement("button"); x.type="button"; x.className="tp-x"; x.setAttribute("aria-label","Close"); x.innerHTML="&times;"; x.onclick=()=>close();
    head.append(q,x);
    const grid=document.createElement("div"); grid.className="tp-grid"; grid.id=lid; grid.setAttribute("role","listbox"); grid.tabIndex=-1;
    const empty=document.createElement("p"); empty.className="tp-empty"; empty.textContent="Nothing matches. Try another word."; empty.hidden=true;
    let lastGroup=null; const tiles=[];
    list.forEach(({o,group},i)=>{
      if (group&&group!==lastGroup){ const g=document.createElement("div"); g.className="tp-group"; g.textContent=group; g.dataset.group=group; grid.append(g); lastGroup=group; }
      const t=document.createElement("div"); t.className="tp-tile"; t.id=lid+"-"+i; t.setAttribute("role","option"); t.dataset.value=o.value; t.dataset.group=group;
      const on=!action&&o.value===sel.value; t.setAttribute("aria-selected",on?"true":"false");
      const pv=previewHtml(kind,o.value);
      t.innerHTML=`<span class="tp-th">${pv||`<span class="tp-sc tp-plain"><b>${(o.text||"?").trim().charAt(0)}</b></span>`}</span><span class="tp-lab"></span>`;
      t.querySelector(".tp-lab").textContent=o.text;
      t.addEventListener("click",()=>pick(o.value));
      t.addEventListener("pointerenter",()=>setActive(t,false));
      grid.append(t); tiles.push(t);
    });
    pop.append(head,grid,empty);
    if (list.length<=6) head.classList.add("tp-head-min");
    (wrap.closest(".adm")||document.body).append(pop); OPEN={wrap,close}; btn.setAttribute("aria-expanded","true");
    place(); document.addEventListener("pointerdown",outside,true); window.addEventListener("resize",onResize); document.addEventListener("scroll",place,true);
    let active=null;
    function setActive(t,scroll=true){ if (active===t) return; if (active) active.classList.remove("on"); active=t; if (stopFx){ stopFx(); stopFx=null; }
      if (!t){ q.removeAttribute("aria-activedescendant"); return; }
      t.classList.add("on"); q.setAttribute("aria-activedescendant",t.id); if (scroll) t.scrollIntoView({block:"nearest"});
      if (fx&&kind==="bgfx"){ const v=t.dataset.value; if (v&&v!=="none"&&v!=="default"){ const box=t.querySelector(".tp-sc"); if (box){ box.classList.add("tp-live"); const s=fx(box,v); stopFx=()=>{ try { s&&s(); } catch(e){} box.classList.remove("tp-live"); }; } } } }
    const shown=()=>tiles.filter(t=>!t.hidden);
    const filter=()=>{ const s=q.value.trim().toLowerCase(); tiles.forEach(t=>{ t.hidden=!!s&&!(t.textContent.toLowerCase().includes(s)||(t.dataset.group||"").toLowerCase().includes(s)); });
      grid.querySelectorAll(".tp-group").forEach(g=>{ g.hidden=!tiles.some(t=>!t.hidden&&t.dataset.group===g.dataset.group); });
      const vis=shown(); empty.hidden=!!vis.length; if (!vis.includes(active)) setActive(vis[0]||null); };
    q.addEventListener("input",filter);
    const cols=()=>{ const vis=shown(); if (vis.length<2) return 1; const top=vis[0].offsetTop; let n=0; for (const t of vis){ if (t.offsetTop!==top) break; n++; } return Math.max(1,n); };
    q.addEventListener("keydown",e=>{ const vis=shown(); let i=vis.indexOf(active);
      const mv=d=>{ e.preventDefault(); if (!vis.length) return; i=i<0?0:Math.max(0,Math.min(vis.length-1,i+d)); setActive(vis[i]); };
      if (e.key==="ArrowRight") { if (!q.value||q.selectionStart===q.value.length) mv(1); }
      else if (e.key==="ArrowLeft") { if (!q.value||q.selectionStart===0) mv(-1); }
      else if (e.key==="ArrowDown") mv(cols());
      else if (e.key==="ArrowUp") mv(-cols());
      else if (e.key==="Home"&&!q.value) mv(-vis.length);
      else if (e.key==="End"&&!q.value) mv(vis.length);
      else if (e.key==="Enter"){ e.preventDefault(); if (active) pick(active.dataset.value); }
      else if (e.key==="Escape"){ e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key==="Tab"){ close(false); } });
    pop.addEventListener("keydown",e=>{ if (e.key==="Escape"&&e.target!==q){ e.preventDefault(); close(); } });
    setActive(tiles.find(t=>t.getAttribute("aria-selected")==="true")||tiles[0]||null);
    /* on a phone the keyboard would cover the sheet: only put the cursor in the search box on bigger screens */
    if (window.innerWidth>=640) q.focus({preventScroll:true}); else grid.focus({preventScroll:true});
    grid.addEventListener("keydown",e=>{ if (e.target===grid&&e.key.length===1){ q.focus(); } else if (e.target===grid&&/^Arrow|Enter|Escape|Home|End/.test(e.key)){ q.dispatchEvent(new KeyboardEvent("keydown",{key:e.key,bubbles:false})); e.preventDefault(); } });
  }
  return wrap;
}

export { typePicker, previewHtml, kindOf, registerLists, KINDS };
