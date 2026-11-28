import { FLOWS, MODALS, PAGES, POSTS, SITE_MAP } from './content';
import { LOGO_DEFAULTS } from './logos';
/* ================= STARTER TEMPLATE =================
   The site renders entirely from one settings object. This is the starter
   template the studio falls back to before anything has been saved. */
const A = (type="none",target="") => ({type,target});
const T2 = (en,ar) => ({en,ar});
const STARTER = {
  version: 1,
  contentVersion: 3,   // bump with a migration in normalize() when the starter structure changes
  site: {
    brand: "Dorma Advertising",
    homePage: "home",
    cta: { label: T2("Request a Quote","اطلب عرض سعر"), action: A("modal","md-quote") },
    quoteEmail: "",      // Dorma's email: shown on printable proposals, and where requests go when forms use the email app
    forms: { mode: "inbox", thanks: T2("Thank you. Your message has reached us and we'll get back to you soon.","شكراً لك. وصلتنا رسالتك وسنعود إليك قريباً.") }, // site forms: inbox (saved to Studio → Inbox) | email (visitor's email app)
    footer: T2("© 2026 Dorma Advertising · Agency | Print & Production","© 2026 دورما للإعلان · خدمات الوكالة | الطباعة والإنتاج"),
    showStudioLink: true,
    languages: "both",
    defaultLang: "en",
    showNumbers: false,
    logoMode: "image",
    logo: "",
    logoHeight: 34,
    logos: JSON.parse(JSON.stringify(LOGO_DEFAULTS))   // Design → Logo: versions (white, colour, silver, added SVGs) and where each is used
  },
  /* Studio → Content → AI writing: the "Write with AI" buttons (Gemini through the ai-write edge function).
     The notes are sent with every request so the AI writes in Dorma's voice and only uses real facts. */
  ai: {
    enabled: true,
    model: "flash",
    general: true,   // may explain general industry topics (offset, digital printing…); Dorma facts still only from the site
    brand: "Dorma Advertising, established in 2000. Two divisions under one roof:\n" +
      "- Agency: Creative & Design; Photography, Video & Music; Digital Marketing & Social Media; Websites & Mobile Apps; Event & Activation Logistics.\n" +
      "- Printing & Production: Printing & Finishing; Giveaways & Branded Merchandise; Packaging; Signage & Displays; In-Store Branding; Booth Production; Custom Fabrication; Event & Activation Accessories.\n" +
      "Dorma brings agency services and in-house print and production together, from concept and design to manufacturing, delivery, and setup.\n" +
      "Voice: clear, practical and confident. Explain what Dorma does and how it helps the client. Speak to the client as \"you\".",
    arabic: "Write Dorma as دورما. Use the same service names as the Arabic site.",
    avoid: "world-class, cutting-edge, best-in-class, unleash, elevate, synergy, one-stop shop",
    /* default length and style (choices in supabase/functions/ai-write/prompt.ts TUNE); "auto" lets the box decide */
    style: { length:"auto", words:"", tone:"auto", purpose:"auto", formality:"auto", level:"auto", sentences:"auto", arabicStyle:"auto", cta:"auto", audience:"", extra:"" },
    /* named styles to pick in the AI window */
    presets: [
      { id:"pr-social", name:"Social media post", style:{ length:"short", tone:"friendly", purpose:"social", sentences:"short", cta:"yes" } },
      { id:"pr-service", name:"Service page", style:{ length:"medium", tone:"confident", purpose:"marketing", level:"standard" } },
      { id:"pr-guide", name:"Technical guide", style:{ length:"long", tone:"calm", purpose:"technical", level:"expert", sentences:"varied", cta:"no" } },
    ],
    /* reference websites the AI reads for facts and focus: [{ url, note, on }] (on = used by default) */
    refs: [],
  },
  loader: { enabled: true, mark: "image", image: "", bg: "theme", text: "DORMA", sub: "ADVERTISING", logo: "", style: "reveal", exit: "wipe", minTime: 1.2 },
  theme: {
    ink: "#040915", panel: "#0b1630", fg: "#eef2fa", accent: "#ffc93c",
    mutedOpacity: 0.66, lineOpacity: 0.14,
    display: "Sora", body: "Sora", mono: "JetBrains Mono",
    radius: 4, grain: true, overlay: 1, imageBrightness: 0.8,
    /* Colour or gradient laid over every image. Each library item can follow this, turn it off, or use its own. */
    /* "My colours": named swatches offered in every colour picker, and palettes saved from the studio. */
    swatches: [ { name: "Dorma blue", hex: "#0072bc" }, { name: "Dorma yellow", hex: "#ffcb08" }, { name: "Dorma magenta", hex: "#ed0677" } ],
    myPalettes: [],
    imageOverlay: { mode: "none", c1: "#0072bc", a1: 0.55, c2: "#ffcb08", a2: 0.35, angle: 135, blend: "normal" },
    /* Global style (Design → Global style). An empty colour ("") follows the site colours above. */
    heading: "",                  // headings and titles; empty = Text colour
    overlayIntensity: 1,          // multiplies every colour overlay on images (0 = off)
    header: { bg: "#040915", bgAlpha: 0, text: "", link: "", accent: "" },
    flow: { text: "", accent: "", sep: "" },        // every flow unless the flow has its own colours
    slide: { title: "", text: "", accent: "", headerText: "" }, // every carousel slide unless the carousel or slide has its own
    /* Type: sizes are multipliers of the built-in sizes (1 = as designed). Empty fonts follow Headings / Body above. */
    type: { titleSize: 1, headingSize: 1, headingWeight: 500, subFont: "", subSize: 1, bodySize: 1, labelFont: "", labelSize: 1, arabic: "IBM Plex Sans Arabic", hand: "Caveat", handAr: "Aref Ruqaa" },
    /* Every section unless a section is set to Custom (Pages → section → Look). */
    sections: { pad: 1, width: 1320, bg: "", bgAlpha: 0, titleSize: 1, subSize: 1, bgfx: { type: "none", color: "", opacity: 0.4, speed: 1 } },
    /* Every modal unless a modal is set to Custom (Flows and modals → Modals → Look). */
    modals: { width: 980, bg: "", bgAlpha: 0.88, corners: true, scan: true, blur: 4, dim: 0.3, titleSize: 1 },
    /* Light mode colours (the colours above are the dark mode). Empty heading/accent follow text/Dorma blue. */
    /* Header links and the full-screen menu (Design → Global style → Menu). */
    menu: { mode: "auto", linkStyle: "underline", hover: "fade", upper: false, size: 1, gap: 30, open: "fade", items: "rise", align: "start", itemSize: 1, numbers: false, bg: "", bgAlpha: 0.96, blur: 12, fx: "none", logoBottom: true, logo: "", note: "" },
    light: { ink: "#f4f6fb", panel: "#ffffff", fg: "#0b1630", heading: "", accent: "#0072bc" }
  },
  /* Dark and light mode for visitors: the starting mode and whether the header shows a switch (their choice is remembered). */
  colorMode: { default: "auto", toggle: true },
  motion: {
    speed: 1, ease: "expo",
    kenBurns: true, kbZoom: 1.18, kbDuration: 10,
    slideDuration: 7, buttonGlow: 0.45, transition: "wipe", titleReveal: "chars",
    modalOpen: "line", scrollReveal: "rise", parallax: true, counters: true,
    /* Global flow animation: every flow follows it unless that flow is set to its own animation. */
    flow: { mode: "items", preset: "rise", duration: 0.8, stagger: 0.06, delay: 0 },
    /* Global slide timing (seconds from when a slide's text starts). Carousels and slides can override each part. */
    slideTiming: { eyebrow: 0.05, title: 0, text: 0.5, flow: 1.5, stagger: 0.2 },
    /* Pictures in sections and modals: reveal mask, shape and hover (each section can use its own). */
    imageFx: { reveal: "none", dir: "left", duration: 1.2, color: "", shape: "none", hover: "none" },
    /* Every section's entrance as it scrolls in and exit as it leaves (each section can use its own). */
    sectionFx: { in: "none", out: "none", duration: 1 },
    modalClose: "auto",
    /* Headings, icons and cards on every section (each section can use its own: Pages → section → Icon, text, logo and button). */
    deco: { headStyle: "none", headIn: "", cardHover: "none", iconAnim: "pop", iconSize: 0.9 }
  },
  /* Generated placeholder scenes. Replace them with real project photos in the studio (Images). */
  media: [
    { id:"m-nebula", label:"Placeholder · Nebula", kind:"scene", category:"backgrounds", scene:"nebula", fx:.5, fy:.5, zoom:1 },
    { id:"m-ridges", label:"Placeholder · Ridges", kind:"scene", category:"backgrounds", scene:"ridges", fx:.5, fy:.5, zoom:1 },
    { id:"m-city", label:"Placeholder · City", kind:"scene", category:"backgrounds", scene:"city", fx:.5, fy:.5, zoom:1 },
    { id:"m-ocean", label:"Placeholder · Ocean", kind:"scene", category:"backgrounds", scene:"ocean", fx:.55, fy:.5, zoom:1 },
    { id:"m-nebula-2", label:"Placeholder · Nebula detail", kind:"scene", category:"backgrounds", scene:"nebula", fx:.72, fy:.42, zoom:1.6 },
    { id:"m-ridges-2", label:"Placeholder · Ridges detail", kind:"scene", category:"backgrounds", scene:"ridges", fx:.7, fy:.56, zoom:1.6 },
    { id:"m-city-2", label:"Placeholder · City detail", kind:"scene", category:"backgrounds", scene:"city", fx:.75, fy:.6, zoom:1.6 },
    { id:"m-ocean-2", label:"Placeholder · Ocean motion", kind:"scene", category:"backgrounds", scene:"ocean", fx:.55, fy:.62, zoom:1.7, animate:true }
  ],
  icons: [
    { id:"i-idea", label:"Idea", svg:'<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>' },
    { id:"i-camera", label:"Camera", svg:'<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>' },
    { id:"i-people", label:"People", svg:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.9.4 5 2.8 5 5.8"/></svg>' },
    { id:"i-booth", label:"Booth", svg:'<svg viewBox="0 0 24 24"><path d="M3 20V6h18v14M3 10h18M8 20v-6h8v6"/></svg>' },
    { id:"i-screen", label:"Screen", svg:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg>' },
    { id:"i-print", label:"Print", svg:'<svg viewBox="0 0 24 24"><path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><path d="M7 14h10v7H7z"/></svg>' },
    { id:"i-gift", label:"Gift", svg:'<svg viewBox="0 0 24 24"><path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13"/><path d="M12 7c-2-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3-2-5 1"/></svg>' },
    { id:"i-ear", label:"Understanding", svg:'<svg viewBox="0 0 24 24"><path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5.5 1.6"/><path d="M10 9a2 2 0 0 1 4 0c0 1.5-2 2-2 3.5"/></svg>' },
    { id:"i-spark", label:"Creativity", svg:'<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>' },
    { id:"i-care", label:"Care", svg:'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>' },
    { id:"i-check", label:"Commitment", svg:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/></svg>' },
    { id:"i-link", label:"Collaboration", svg:'<svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="4.5"/><circle cx="16" cy="12" r="4.5"/></svg>' },
    { id:"i-arrow", label:"Arrow", svg:'<svg viewBox="0 0 24 24"><path d="M4 12h16M14 6l6 6-6 6"/></svg>' },
    { id:"i-truck", label:"Delivery", svg:'<svg viewBox="0 0 24 24"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>' },
    { id:"i-box", label:"Packaging", svg:'<svg viewBox="0 0 24 24"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/></svg>' },
    { id:"i-sign", label:"Signage", svg:'<svg viewBox="0 0 24 24"><path d="M12 3v18M5 6h12l2 2.5L17 11H5zM19 13H8l-2 2.5L8 18h11z"/></svg>' },
    { id:"i-store", label:"Store", svg:'<svg viewBox="0 0 24 24"><path d="M4 10v10h16V10M3 4h18l-1.5 6h-15z"/><path d="M9 20v-5h6v5"/></svg>' },
    { id:"i-gear", label:"Fabrication", svg:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/></svg>' },
    { id:"i-pen", label:"Writing", svg:'<svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="m14 7 3 3"/></svg>' }
  ],
  flows: FLOWS,
  modals: MODALS,
  /* Library and blog categories. Each one matches a folder in public/library/ on GitHub. */
  categories: [
    { id:"brand", label:"Brand & Identity" },
    { id:"content", label:"Photo & Video" },
    { id:"events", label:"Events & Activations" },
    { id:"exhibitions", label:"Exhibitions & Booths" },
    { id:"digital", label:"Digital & Social" },
    { id:"print", label:"Print & Packaging" },
    { id:"signage", label:"Signage & Fabrication" },
    { id:"gifts", label:"Gifts & Displays" },
    { id:"backgrounds", label:"Backgrounds & Textures" },
    { id:"articles", label:"Articles & Guides" },
    { id:"news", label:T2("Projects & News","المشاريع والأخبار") },
    { id:"guides", label:T2("Guides & Insights","الأدلة والمقالات") }
  ],
  posts: POSTS,
  pages: PAGES,
  /* Pictures uploaded from the studio are made smaller in the browser first (studio › Library › Picture optimizing). */
  uploads: { optimize:true, maxSide:2400, quality:0.85, format:"webp", keepPng:true },
  /* GitHub files deleted from the Library (or copied to Supabase under a new name), so Check GitHub doesn't add them back. */
  libIgnore: [],
  /* Studio › Site care › Backups: how many versions (publishes and snapshots) the database keeps; pinned ones are extra. */
  backups: { keep: 30 },
  /* Studio › Site care › Health check: problems the editor chose to ignore (by id), and the big-file warning size. */
  health: { ignore: [], bigFileKB: 1500 }
};

/* ================= FIELD SCHEMAS =================
   One generic form engine edits everything below. Field: [key, kind, label, opts] */
/* Brand overlay presets: Dorma blue #0072bc, yellow #ffcb08, magenta #ed0677 (from the logo), ink #040915. */
const OV_PRESETS = [
  ["Blue tint",       { mode:"solid",  c1:"#0072bc", a1:.5,  c2:"#0072bc", a2:.5, angle:180, blend:"multiply" }],
  ["Blue mono",       { mode:"solid",  c1:"#0072bc", a1:1,   c2:"#0072bc", a2:1,  angle:180, blend:"color" }],
  ["Yellow glow",     { mode:"solid",  c1:"#ffcb08", a1:.4,  c2:"#ffcb08", a2:.4, angle:180, blend:"soft-light" }],
  ["Blue to yellow",  { mode:"linear", c1:"#0072bc", a1:.7,  c2:"#ffcb08", a2:.45, angle:135, blend:"multiply" }],
  ["Blue fade",       { mode:"linear", c1:"#0072bc", a1:.85, c2:"#0072bc", a2:0,  angle:0,   blend:"normal" }],
  ["Night fade",      { mode:"linear", c1:"#040915", a1:.9,  c2:"#040915", a2:0,  angle:0,   blend:"normal" }],
  ["Spotlight",       { mode:"radial", c1:"#040915", a1:0,   c2:"#040915", a2:.8, angle:0,   blend:"normal" }],
  ["Magenta to blue", { mode:"linear", c1:"#ed0677", a1:.55, c2:"#0072bc", a2:.6, angle:120, blend:"screen" }]
];
const OPT = {
  overlayModes: [["none","No overlay"],["solid","Solid colour"],["linear","Linear gradient"],["radial","Radial gradient (centre to edges)"]],
  blends: [["normal","Normal"],["multiply","Multiply (darken, keep detail)"],["screen","Screen (lighten)"],["overlay","Overlay (contrast)"],["soft-light","Soft light"],["hard-light","Hard light"],["color","Colour (recolour the image)"],["luminosity","Luminosity"],["color-burn","Colour burn"],["color-dodge","Colour dodge"],["darken","Darken"],["lighten","Lighten"],["hue","Hue"],["saturation","Saturation"]],
  fonts: ["Sora","Space Grotesk","Manrope","Unbounded","Inter","Outfit","Syne","Archivo","Poppins","Fraunces","Playfair Display","DM Serif Display"],
  arabicFonts: ["IBM Plex Sans Arabic","Cairo","Tajawal","Noto Kufi Arabic","Readex Pro","Almarai","Alexandria"],
  handFonts: ["Caveat","Kalam","Reenie Beanie","Gochi Hand","Patrick Hand","Nanum Pen Script"],
  handArFonts: ["Aref Ruqaa","Marhey","Lalezar","Reem Kufi Ink"],
  flowDisplays: [["row","Row: each item runs its own action"],["reveal","Reveal: each item reveals its part of the section"],["tabs","Tabs: items switch the visible panel"]],
  bgfx: [["none","None"],["contours","Contour lines (drawn, drifting)"],["orbits","Orbits (rings and a travelling dot)"],["grid","Spotlight grid (masked, follows the pointer)"],["goo","Liquid colour (CMYK blobs)"],["stripes","CMYK stripes (masked reveal on scroll)"],["waves","Waves (layered lines)"],["reveal","Circle mask reveal on scroll"],["type","Outline word (drawn behind the section)"]],
  pads: [[.5,"Tight"],[.75,"Compact"],[1,"Normal"],[1.3,"Roomy"],[1.6,"Airy"]],
  monos: ["JetBrains Mono","IBM Plex Mono"],
  ease: [["expo","Expo (sharp, cinematic)"],["power3","Power (smooth)"],["sine","Sine (gentle)"],["back","Back (overshoot)"],["elastic","Elastic (springy)"]],
  transition: [["wipe","Light wipe"],["fade","Crossfade"],["slide","Slide"],["zoom","Zoom through"]],
  titleReveal: [["chars","Letter by letter"],["words","Word by word"],["fade","Fade up"],["blur","Blur in"]],
  modalOpen: [["line","Scan line"],["fade","Fade"],["scale","Scale up"],["slide","Slide up"],["iris","Circle from the click"],["zoom","Grow from the click"],["wipe","Wipe across"],["curtain","Open from the centre"],["unfold","Unfold (line, then open)"],["diagonal","Diagonal wipe"],["flip","Flip down (3D)"],["drop","Drop and bounce"],["blur","Blur into focus"],["blinds","Colour bars sweep"],["cmyk","CMYK print pass"]],
  modalClose: [["auto","Match the opening"],["fade","Fade"],["shrink","Shrink"],["slideDown","Slide down"],["iris","Circle into the click"],["zoomOut","Shrink into the click"],["wipe","Wipe away"],["curtain","Close to the centre"],["collapse","Collapse to a line"],["flip","Flip away (3D)"],["blur","Blur away"],["blinds","Colour bars cover"]],
  imageReveal: [["none","None (pictures just show)"],["wipe","Wipe (from a side)"],["iris","Circle (iris opens)"],["diamond","Diamond opens"],["diagonal","Diagonal cut"],["split","Split from the centre"],["bars","Opens from a line"],["curtain","Curtain (two halves slide away)"],["blinds","Blinds (horizontal slats)"],["shutters","Shutters (vertical slats)"],["tiles","Tiles (squares flip away)"],["cmyk","CMYK print pass (colour bands)"],["spot","Soft spotlight grows"],["zoom","Zoom out of a frame"],["blur","Blur into focus"]],
  imageShape: [["none","As designed (rectangle)"],["rounded","Rounded corners"],["pill","Pill"],["arch","Arch"],["circle","Circle or oval"],["hexagon","Hexagon"],["diamond","Diamond"],["slant","Slanted bottom"],["notch","Cut corners"],["leaf","Leaf"],["blob","Soft blob"]],
  imageHover: [["none","None"],["zoom","Slow zoom"],["tilt","3D tilt with the pointer"],["spot","Light follows the pointer"],["color","Black and white, colour on hover"],["lift","Lift with a glow"]],
  dirs4: [["left","From the left"],["right","From the right"],["up","From the bottom"],["down","From the top"]],
  sectionIn: [["none","None"],["rise","Rise"],["fade","Fade"],["scale","Scale up"],["zoom","Zoom in"],["blur","Blur into focus"],["slideLeft","Slide from the left"],["slideRight","Slide from the right"],["tilt","Tilt up (3D)"],["skew","Skew up"],["wipe","Wipe up (mask)"],["iris","Circle opens (mask)"],["curtain","Open from the centre (mask)"],["stagger","Each part in turn"]],
  sectionOut: [["none","None"],["fade","Fade as it leaves"],["shrink","Shrink as it leaves"],["blur","Blur as it leaves"],["parallax","Lag behind (parallax)"],["dim","Darken as it leaves"],["fold","Fold back (3D)"],["slide","Slide away"]],
  fxPalettes: [["single","One colour"],["two","Two colours"],["brand","Dorma CMYK"]],
  fxDirs: [["","Effect default"],["right","Right"],["left","Left"],["up","Up"],["down","Down"],["diag","Diagonal up"],["diag2","Diagonal down"]],
  fxPos: [["","Effect default"],["left","Left"],["center","Centre"],["right","Right"]],
  fxSoften: [["","Effect default"],["side","Fade behind the text side"],["even","Even veil"],["none","No veil (full effect)"]],
  menuModes: [["auto","Links on computers, menu button on phones"],["overlay","Menu button on every screen"]],
  menuLinkStyles: [["underline","Underline"],["overline","Line above"],["dot","Dot"],["pill","Pill"],["bracket","[ Brackets ]"],["glow","Glow"],["none","No mark"]],
  menuHover: [["fade","Brighten"],["line","Line grows"],["lift","Lift"],["glow","Glow"]],
  menuOpen: [["fade","Fade"],["slide","Slide in from the side"],["drop","Drop from the top"],["circle","Circle from the button"],["curtain","Open from the centre"],["wipe","Wipe down"],["cmyk","CMYK print pass"]],
  menuItems: [["rise","Rise one by one"],["fade","Fade one by one"],["slide","Slide in one by one"],["scale","Grow one by one"],["blur","Blur into focus"],["none","All at once"]],
  colorModes: [["auto","Follow the visitor's device"],["dark","Dark"],["light","Light"]],
  scrollReveal: [["rise","Rise"],["fade","Fade"],["none","None"]],
  presets: [["rise","Rise"],["fade","Fade"],["scale","Scale"],["blur","Blur"],["slideLeft","Slide from left"],["slideRight","Slide from right"],["flip","Flip"],["pop","Pop"],["none","None"]],
  separators: [["dots3","Three dots"],["dot","Single dot"],["line","Line"],["chevron","Chevron"],["none","None"]],
  libKinds: [["","All"],["image","Images"],["video","Videos"],["article","Articles"],["scene","Scenes"]],
  kinds: [["button","Button"],["text","Text (optional icon before it)"],["icon","Icon only"],["note","Animated note (icon and handwriting)"],["svg","Custom SVG"]],
  sizes: [["s","Small"],["m","Medium"],["l","Large"]],
  actions: [["none","Nothing"],["modal","Open modal"],["page","Go to page"],["post","Open blog post"],["doc","Open library article"],["slide","Go to slide"],["url","Open link"]],
  layouts: [["cinematic","Cinematic"],["index","Index"],["console","Console (side menu)"]],
  heights: [["full","Full screen"],["tall","Tall"],["compact","Compact"]],
  statStyles: [["band","Band"],["hud","HUD tiles"],["meters","Meters"]],
  clientStyles: [["grid","Logo grid"],["marquee","Scrolling logos"],["table","Table"]],
  modalTypes: [[1,"Type 1 · Media"],[2,"Type 2 · Gallery"],[3,"Type 3 · Flow"],[4,"Type 4 · Service list"],[5,"Type 5 · Sections (any page sections, each with a label)"]],
  scenes: [["nebula","Nebula"],["ridges","Ridges"],["city","City"],["ocean","Ocean"]],
  /* ---- section extras (extras.js): heading icons, logo and button blocks, photo sections, heading styles ---- */
  iconPos: [["before","Before the title"],["after","After the title"],["above","Above the title"]],
  iconAnim: [["none","None (just shows)"],["pop","Pop in"],["spin","Spin in"],["draw","Draw its lines"],["rise","Rise"],["float","Float (keeps moving)"],["pulse","Pulse (keeps moving)"],["glow","Glow (keeps glowing)"],["swing","Swing (keeps moving)"]],
  blockIn: [["none","None (just shows)"],["fade","Fade"],["rise","Rise"],["pop","Pop (grow with a bounce)"],["blur","Blur into focus"],["spin","Spin in"],["drop","Drop and bounce"],["wipe","Wipe across"],["flip","Flip in (3D)"]],
  blockLoop: [["none","None"],["float","Float"],["pulse","Pulse"],["glow","Glow"],["shine","Light sweeps across"],["breathe","Breathe (slow grow)"],["nudge","Nudge now and then"]],
  blockAlign: [["start","Start"],["center","Centre"],["end","End"]],
  blockPos: [["top","Above the section's content"],["bottom","Below the section's content"]],
  ctaSizes: [["s","Small"],["m","Medium"],["l","Large"],["xl","Extra large"]],
  ctaStyles: [["site","Site button (soft, glows)"],["solid","Solid accent"],["outline","Outline"],["ring","Glowing ring"],["link","Text with an arrow"]],
  headStyles: [["none","As designed"],["gradient","Gradient (text colour to accent)"],["shimmer","Shimmer (light runs through)"],["glow","Glow"],["outline","Outline letters"],["marker","Marker highlight"],["underline","Underline draws in"],["cmyk","CMYK print offset"]],
  headIn: [["","Site default (the block rises)"],["chars","Letter by letter"],["words","Word by word"],["blur","Blur in"],["type","Typewriter"],["fade","Fade up"]],
  cardHover: [["none","None"],["lift","Lift with a shadow"],["glow","Glow"],["tilt","3D tilt with the pointer"],["zoom","Picture zooms"],["border","Accent border"],["shine","Light sweeps across"]],
  photoMasks: [["none","None (rectangle)"],["rounded","Rounded corners"],["pill","Pill"],["arch","Arch"],["circle","Circle or oval"],["hexagon","Hexagon"],["diamond","Diamond"],["slant","Slanted bottom"],["notch","Cut corners"],["leaf","Leaf"],["blob","Soft blob"],["frame","Frame (hole in the middle)"],
    ["fadeBottom","Fade out at the bottom"],["fadeTop","Fade out at the top"],["fadeSides","Fade out at the sides"],["soft","Soft oval (fades at every edge)"],["wave","Wave at the bottom"],["stripes","Diagonal stripes"],["halftone","Halftone dots (print)"],["word","Inside a word"]],
  photoRatios: [["21/9","Cinema 21:9"],["16/9","Wide 16:9"],["3/2","Photo 3:2"],["4/3","Classic 4:3"],["1/1","Square"],["4/5","Portrait 4:5"],["screen","Full screen height"]],
  photoWidths: [["full","Edge to edge"],["page","Page width"],["narrow","Narrow (about two thirds)"],["small","Small (about a third)"]]
};
/* Settings every list item that has a title can use (cards, accordion rows, chapters, linked items, catalog items, slides). */
const ITEM_ICON=[["headIcon","icon","Icon by the title (optional)",{wide:true}],["headIconPos","select","Icon position",{options:OPT.iconPos}]];
const ITEM_HIDE=(sub="Hide the subtitle")=>[["hideSub","toggle",sub],["hideText","toggle","Hide the text"]];
const ACTION_FIELDS = [["action","action","Action"]];
const SECTION_TYPES = {
  heroCarousel: { label:"Hero carousel", fields:[
    ["flowId","flow","Default flow (for slides without their own)"],["defaultMedia","media","Default image (for slides without their own)",{wide:true}],
    ["autoplay","toggle","Move to next slide automatically",{hint:"Off: each slide stays until the visitor uses the arrows, dots or swipe."}],
    ["hud","toggle","Show counter and timecode"],
    ["timing","timing","Timing for every slide",{parts:[["eyebrow",.05],["title",0],["text",.5],["flow",1.5],["stagger",.2]],hint:"Seconds from when each slide starts. Empty follows the global slide timing (Design → Global style), shown in grey. Each slide can override these below."}],
    ["look","look","Colours and filter for this carousel",{level:"carousel"}],
    ["replayFlow","toggle","Replay the flow animation on every slide, even when it is the same flow"],
    ["slides","list","Slides",{ itemName:"slide", title:"title", hideable:true, fields:[["media","media","Background image",{wide:true}],["eyebrow","text","Eyebrow"],["title","text","Title"],["lede","area","Short paragraph",{wide:true}],["flowId","flow","This slide's flow (buttons under the text; empty uses the default)"],["hold","toggle","Stay on this slide until the visitor moves on",{aka:["stay on this slide"]}],["timing","timing","This slide's timing",{parts:[["duration",null],["eyebrow",null],["title",null],["text",null],["flow",null],["stagger",null]],hint:"Seconds on screen (any length, no limit), and when each piece starts. Empty follows the carousel timing, then the global slide timing."}],["look","look","This slide's colours and filter",{level:"slide"}],...ITEM_ICON,["hideSub","toggle","Hide the eyebrow"],["hideText","toggle","Hide the short paragraph"]], blank:()=>({eyebrow:"New",title:"New slide",lede:"",media:"m-nebula"}) }]
  ]},
  hero: { label:"Hero", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["title","text","Title",{wide:true}],["lede","area","Short paragraph",{wide:true}],["button","button","Button (empty label hides it)"],["height","select","Height",{options:OPT.heights}],["flowId","flow","Flow"],["media","media","Background image",{wide:true}],["timing","timing","Timing",{parts:[["eyebrow",.1],["title",.15],["text",.2],["flow",.4]],hint:"Seconds from when the page opens. Empty uses the default shown. Lower numbers come first."}]] },
  chapters: { label:"Chapters", fields:[["items","list","Chapters",{ itemName:"chapter", title:"title", fields:[["title","text","Title"],["text","area","Text",{wide:true}],["bullets","strings","Bullet points (one per line)",{wide:true}],["caption","strings","Caption items (one per line)",{wide:true}],["more","button","More button"],["media","media","Image",{wide:true}],...ITEM_ICON,...ITEM_HIDE("Hide the caption")], blank:()=>({title:"New chapter",text:"",bullets:[],caption:[],media:"m-ridges",more:{label:"More",action:A()}}) }]] },
  stats: { label:"Numbers", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["style","select","Style",{options:OPT.statStyles}],["items","list","Figures",{ title:"label", fields:[["label","text","Label"],["value","number","Value"],["suffix","text","Suffix"],["decimals","number","Decimals"],["meter","range","Meter %",{min:0,max:100,step:1}]], blank:()=>({label:"New figure",value:10,suffix:"",decimals:0,meter:50}) }]] },
  about: { label:"About", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["text","area","Statement (wrap words in *stars* to highlight)",{wide:true}],["link","button","Link"],["media","media","Image (optional)",{wide:true,allowNone:true}]] },
  clients: { label:"Clients", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["style","select","Style",{options:OPT.clientStyles}],["items","list","Clients",{ title:"name", fields:[["name","text","Name"],["sector","text","Sector"],["since","text","Since"],["work","text","Work"]], blank:()=>({name:"New client",sector:"",since:"",work:""}) }]] },
  grid: { label:"Card grid", fields:[["title","text","Heading"],["filters","toggle","Show tag filters as a flow"],["items","list","Cards",{ itemName:"card", title:"title", fields:[["code","text","Code"],["tag","text","Tag"],["title","text","Title"],["text","area","Text",{wide:true}],["action","action","On click"],["media","media","Image",{wide:true}],...ITEM_ICON,...ITEM_HIDE("Hide the code and tag")], blank:()=>({code:"X-00",tag:"Tag",title:"New card",text:"",media:"m-city",action:A()}) }]] },
  accordion: { label:"Accordion", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["items","list","Rows",{ itemName:"row", title:"title", fields:[["title","text","Title"],["tags","strings","Tags (one per line)"],["text","area","Text",{wide:true}],["more","button","More button"],["media","media","Image",{wide:true}],...ITEM_ICON,...ITEM_HIDE("Hide the tags")], blank:()=>({title:"New row",tags:[],text:"",media:"m-ocean",more:{label:"More",action:A()}}) }]] },
  timeline: { label:"Timeline", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["text","area","Statement",{wide:true}],["flowId","flow","Timeline flow (each item's detail text shows on click)"],["timing","timing","Timing",{parts:[["eyebrow",0],["text",.1],["flow",.2],["detail",.5]]}]] },
  flowStrip: { label:"Flow strip", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["title","text","Heading",{wide:true}],["flowId","flow","Flow"],["timing","timing","Timing",{parts:[["eyebrow",0],["title",.1],["flow",.2]]}]] },
  banner: { label:"Wide banner", fields:[["caption","strings","Caption items (one per line)",{wide:true}],["media","media","Image",{wide:true}]] },
  division: { label:"Division (image, text, button and linked items)", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["title","text","Title",{wide:true}],["text","area","Short paragraph",{wide:true}],["button","button","Button (e.g. open a modal; empty label hides it)"],["flip","toggle","Image on the right"],
    ["items","list","Linked items (each opens a page, modal or link)",{ title:"title", hideable:true, fields:[["title","text","Title"],["text","area","Brief",{wide:true}],["action","action","On click"],...ITEM_ICON,["hideText","toggle","Hide the brief"]], blank:()=>({title:"New item",text:"",action:A()}) }],
    ["media","media","Image",{wide:true}],["timing","timing","Timing",{parts:[["eyebrow",0],["title",.1],["text",.2],["more",.3],["flow",.4],["stagger",.08]],hint:"Seconds from when the section comes into view. \"Flow\" is the linked items, \"Gap between flow items\" the time between them."}]] },
  cta: { label:"Call to action (heading and button)", fields:[["title","text","Heading",{wide:true}],["text","area","Short line under the heading (optional)",{wide:true}],["button","button","Button"],
    ["size","select","Button size",{options:OPT.ctaSizes}],["style","select","Button style",{options:OPT.ctaStyles}],["align","select","Align",{options:OPT.blockAlign}],["in","select","Button entrance",{options:OPT.blockIn}],["loop","select","Button keeps moving",{options:OPT.blockLoop}],["delay","number","Button starts after (seconds)",{min:0,step:.1}]] },
  photo: { label:"Photo only (mask, opacity, filter)", fields:[["media","media","Photo",{wide:true}],["mask","select","Mask shape",{options:OPT.photoMasks}],["maskWord","text","Word for \"Inside a word\" (e.g. DORMA)"],
    ["opacity","range","Opacity (1 = solid, lower = see-through)",{min:0,max:1,step:.05}],["ratio","select","Height",{options:OPT.photoRatios}],["width","select","Width",{options:OPT.photoWidths}],["align","select","Align",{options:OPT.blockAlign}],
    ["fit","select","Fit",{options:[["cover","Fill the shape (crops the edges)"],["contain","Show the whole photo"]]}],["bg","color","Colour behind the photo (shows through when see-through)",{optional:true,placeholder:"None",globalLabel:"None"}],
    ["blur","range","Blur (px)",{min:0,max:20,step:1}],["gray","toggle","Black and white"],["zoom","toggle","Slow zoom as you scroll"],["parallax","range","Moves with the scroll (0 = off)",{min:0,max:30,step:1}],
    ["overlay","overlay","Colour filter over the photo"],["caption","strings","Caption (optional, one item per line)",{wide:true}]] },
  logo: { label:"Logo (size and animation)", fields:[["version","logoVersion","Logo version"],["size","number","Height in px",{min:12,step:2}],["phone","number","Height on phones in px (empty = same)",{optional:true,min:12,step:2}],
    ["align","select","Align",{options:OPT.blockAlign}],["in","select","Entrance",{options:OPT.blockIn}],["loop","select","Keeps moving",{options:OPT.blockLoop}],["delay","number","Starts after (seconds)",{min:0,step:.1}],["action","action","On click (optional)"]] },
  features: { label:"Feature list (grid of items with icons)", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["title","text","Heading",{wide:true}],["text","area","Short paragraph",{wide:true}],["cols","select","Columns",{options:[[2,"2"],[3,"3"],[4,"4"]]}],
    ["items","list","Items",{ title:"title", hideable:true, fields:[["title","text","Title"],["text","area","Text (optional)",{wide:true}],["icon","icon","Icon (optional)",{wide:true}],["hideText","toggle","Hide the text"]], blank:()=>({title:"New item",text:"",icon:""}) }]] },
  quotes: { label:"Testimonials", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["items","list","Quotes",{ title:"name", hideable:true, fields:[["quote","area","Quote",{wide:true}],["name","text","Name"],["role","text","Role or company"],["hideSub","toggle","Hide the role or company"]], blank:()=>({quote:"",name:"",role:""}) }]] },
  quote: { label:"Quote request form", fields:[["form","select","Form",{options:[["quote","Quote request (service, quantity, deadline)"],["contact","Contact message (name, email, phone, message)"]]}],["eyebrow","text","Eyebrow"],["title","text","Heading",{wide:true}],["text","area","Short paragraph",{wide:true}],["service","text","Service (filled in on the form)"],["hint","area","Note under the form (optional)",{wide:true}]] },
  contact: { label:"Contact form (messages go to Studio → Inbox)", fields:[["eyebrow","text","Eyebrow"],["title","text","Heading",{wide:true}],["text","area","Short paragraph",{wide:true}],["hint","area","Note under the form (optional)",{wide:true}]] },
  catalog: { label:"Catalog (items with filters and quote requests)", fields:[["title","text","Heading",{wide:true}],["text","area","Short paragraph",{wide:true}],["filters","strings","Filter names, one per line (1: item type, 2: package type, 3: price range)",{wide:true}],
    ["items","list","Catalog items",{ itemName:"catalog item", title:"title", hideable:true, fields:[["title","text","Title"],["text","area","Description",{wide:true}],["itemType","text","Item type"],["packageType","text","Package type"],["price","text","Price range"],["media","media","Image",{wide:true}],...ITEM_ICON,...ITEM_HIDE("Hide the type and price line")], blank:()=>({title:"New item",text:"",itemType:"",packageType:"",price:"",media:"m-nebula"}) }]] },
  blog: { label:"Blog posts", fields:[["title","text","Heading",{wide:true}],["category","category","Only this category",{allowAll:true}],["limit","number","Most posts to show"],["filters","toggle","Show category filters as a flow"],["style","select","Style",{options:[["grid","Cards"],["list","List"]]}]] },
  article: { label:"Text article", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["title","text","Heading",{wide:true}],["body","prose","Text",{wide:true}]] }
};
const SECTION_BLANK = {
  heroCarousel:()=>({flowId:"",autoplay:true,hud:true,timing:{},replayFlow:false,slides:[{eyebrow:"New",title:"New slide",lede:"",media:"m-nebula"}]}),
  hero:()=>({num:"",eyebrow:"Eyebrow",title:"New hero",lede:"",media:"m-nebula",height:"tall",flowId:""}),
  chapters:()=>({items:[]}), stats:()=>({num:"",eyebrow:"",style:"band",items:[]}),
  about:()=>({num:"",eyebrow:"About",text:"A short statement.",media:"",link:{label:"",action:A()}}),
  clients:()=>({num:"",eyebrow:"Clients",style:"grid",items:[]}), grid:()=>({title:"Cards",filters:true,items:[]}),
  accordion:()=>({num:"",eyebrow:"",items:[]}), timeline:()=>({num:"",eyebrow:"Story",text:"",flowId:""}),
  flowStrip:()=>({num:"",eyebrow:"",title:"",flowId:""}), banner:()=>({caption:[],media:"m-ocean"}),
  division:()=>({num:"",eyebrow:"Division",title:"New division",text:"",media:"m-ridges",flip:false,button:{label:"",action:A()},items:[]}),
  cta:()=>({title:"Have a project in mind?",text:"",button:{label:"Get in touch",action:A()},size:"l",style:"site",align:"start",in:"rise",loop:"none",delay:0}),
  photo:()=>({media:"",mask:"none",maskWord:"DORMA",opacity:1,ratio:"16/9",width:"page",align:"center",fit:"cover",bg:"",blur:0,gray:false,zoom:false,parallax:0,overlay:{mode:"default"},caption:[]}),
  logo:()=>({version:"auto",size:120,phone:"",align:"center",in:"pop",loop:"none",delay:0,action:A()}),
  features:()=>({num:"",eyebrow:"",title:"What's included",text:"",cols:3,items:[]}),
  quotes:()=>({num:"",eyebrow:"Testimonials",items:[]}),
  quote:()=>({anchor:"quote",form:"quote",eyebrow:"Request a Quote",title:"Request a Quote",text:"",service:"",hint:""}),
  contact:()=>({anchor:"contact",eyebrow:T2("Contact","تواصل معنا"),title:T2("Send us a message","أرسل لنا رسالة"),text:T2("",""),hint:T2("","")}),
  catalog:()=>({anchor:"catalog",title:"Catalog",text:"",filters:["Item Type","Package Type","Price Range"],items:[]}),
  blog:()=>({title:"Latest posts",category:"",limit:12,filters:true,style:"grid"}),
  article:()=>({num:"",eyebrow:"",title:"",body:"Write here. Leave an empty line between paragraphs."})
};

/* Fills in anything missing from a saved config with the starter template, so older saves keep working. */
function normalize(c){
  const out=JSON.parse(JSON.stringify(STARTER)); if (!c || typeof c!=="object") return out;
  c=JSON.parse(JSON.stringify(c)); // never share objects with the caller (live and draft must stay separate)
  for (const k of Object.keys(out)){
    if (c[k]==null) continue;
    if (Array.isArray(out[k])) out[k]=Array.isArray(c[k])?c[k]:out[k];
    else if (typeof out[k]==="object") out[k]={...out[k],...c[k]};
    else out[k]=c[k];
  }
  (out.flows||[]).forEach(f=>migrateFlow(f,out.motion.flow));
  migrateContent(out,c);
  migrateMedia(out);
  migrateLogos(out,c);
  return out;
}
/* ================= LOGO =================
   Fills in missing logo settings. The first time a saved site meets the Logo tab, its older settings move in:
   the header logo height, and a menu or loader logo picked from the library becomes an added version used there. */
const isObj=v=>v&&typeof v==="object"&&!Array.isArray(v);
function migrateLogos(cfg,saved){
  const D=LOGO_DEFAULTS, had=isObj(saved&&saved.site&&saved.site.logos), L=isObj(cfg.site.logos)?cfg.site.logos:{};
  const places={}; Object.keys(D.places).forEach(k=>{ places[k]={...D.places[k],...(isObj(L.places)&&isObj(L.places[k])?L.places[k]:{})}; });
  cfg.site.logos={ white:typeof L.white==="string"?L.white:"", colour:typeof L.colour==="string"?L.colour:"",
    versions:Array.isArray(L.versions)?L.versions.filter(v=>isObj(v)&&typeof v.id==="string"):[],
    silver:{...D.silver,...(isObj(L.silver)?L.silver:{})}, places };
  if (had || !saved || typeof saved!=="object") return;
  const lg=cfg.site.logos;
  if (+cfg.site.logoHeight) lg.places.header.height=+cfg.site.logoHeight;
  const adopt=(id,name,place)=>{ if (!id) return; let v=lg.versions.find(x=>x.image===id); if (!v){ v={id:"lv-"+place,name,svg:"",image:id}; lg.versions.push(v); }
    lg.places[place].dark=v.id; lg.places[place].light=v.id; };
  const M=cfg.theme&&cfg.theme.menu; if (M&&M.logo){ adopt(M.logo,"Menu logo","menu"); M.logo=""; }
  const LD=cfg.loader; if (LD&&LD.image){ adopt(LD.image,"Loader logo","loader"); LD.image=""; }
}
/* ================= LIBRARY CATEGORIES =================
   Every image, video, scene and article belongs to a category the admin manages (Library › Categories).
   An item without one goes to its GitHub folder, or a sensible default for its kind; a category an item names
   but the list lacks is added back, so nothing is ever lost or left uncategorised. */
const KIND_CATEGORY={ image:"content", video:"content", scene:"backgrounds", article:"articles" };
const prettyCat=id=>String(id).replace(/[-_]+/g," ").trim().replace(/^./,c=>c.toUpperCase());
function defaultCategory(m){
  if (m && typeof m.path==="string" && m.path.includes("/")) return m.path.split("/")[0];
  return KIND_CATEGORY[m&&m.kind]||"content";
}
function ensureCategory(cfg,id){
  cfg.categories=Array.isArray(cfg.categories)?cfg.categories:[];
  if (!cfg.categories.some(c=>c&&c.id===id)){ const known=STARTER.categories.find(c=>c.id===id); cfg.categories.push(known?JSON.parse(JSON.stringify(known)):{id,label:prettyCat(id)}); }
  return id;
}
function migrateMedia(cfg){
  (cfg.media||[]).forEach(m=>{ if (!m || typeof m!=="object") return;
    const c=typeof m.category==="string"&&m.category.trim()?m.category.trim():defaultCategory(m);
    m.category=ensureCategory(cfg,c); });
}

/* ================= IMAGE SLOTS =================
   Every place on the site that shows a library image, for the Missing images dashboard. Each slot says where it is
   (path of labels), how to reach it in the studio (go), and its state:
   empty (nothing picked), missing (picked item is gone from the library), placeholder (a generated scene). */
function mediaSlots(cfg,{all=false}={}){
  const out=[], lib=new Map((cfg.media||[]).map(m=>[m&&m.id,m])), P=v=>v&&typeof v==="object"?(v.en||v.ar||""):String(v??"");
  const add=(obj,key,where,go,o={})=>{ const id=obj[key], m=id?lib.get(id):null;
    const state=!id?(o.optional?"":"empty"):!m?"missing":m.kind==="scene"?"placeholder":"";
    if (state || (all && id)) out.push({obj,key,where,go,state,hidden:!!o.hidden,optional:!!o.optional,note:o.note||""}); };
  const walkFields=(obj,fields,where,go,hidden)=>{ (fields||[]).forEach(([key,kind,label,o={}])=>{
    if (kind==="media") add(obj,key,[...where,label],go,{optional:!!o.allowNone,hidden,note:o.note});
    else if (kind==="list" && Array.isArray(obj[key])) obj[key].forEach((it,i)=>{ if (it&&typeof it==="object")
      walkFields(it,o.fields,[...where,(P(it[o.title])||label+" "+(i+1))],go,hidden||!!it.hidden); }); }); };
  const walkSections=(list,where,go,hidden)=>(list||[]).forEach(s=>{ if (!s||typeof s!=="object") return; const T=SECTION_TYPES[s.type]; if (!T) return;
    const name=P(s.title)||P(s.eyebrow)||T.label, g={...go,section:s.id};
    if (s.type==="heroCarousel"){ const cg={panel:"carousels",sel:s.id};
      if (s.defaultMedia) add(s,"defaultMedia",[...where,name,"Default image"],cg,{hidden:hidden||s.hidden});
      (s.slides||[]).forEach((x,i)=>{ if (!x||typeof x!=="object") return; const sw=[...where,name,P(x.title)||"Slide "+(i+1)];
        if (!x.media && s.defaultMedia) return; // an empty slide shows the carousel's default image
        add(x,"media",[...sw,"Background image"],cg,{hidden:hidden||s.hidden||x.hidden}); });
      return; }
    walkFields(s,T.fields,[...where,name],g,hidden||!!s.hidden); });
  (cfg.pages||[]).forEach(p=>{ if (!p||typeof p!=="object") return; walkSections(p.sections,["Page: "+(P(p.title)||p.id)],{panel:"pages",sel:p.id},p.nav===false&&/-previous/.test(p.id)); });
  (cfg.modals||[]).forEach(m=>{ if (!m||typeof m!=="object") return; const w=["Modal: "+(m.name||P(m.title)||m.id)], go={panel:"modals",sel:m.id};
    if (m.type===4){ /* service list: no picture */ } else if (m.type===5) walkSections(m.sections,w,go,false);
    else { const n=m.type===2?3:1; m.media=Array.isArray(m.media)?m.media:[]; for (let k=0;k<n;k++){ add(m.media,k,[...w,n>1?"Gallery item "+(k+1):"Image or video"],go); } } });
  (cfg.flows||[]).forEach(f=>{ if (!f||typeof f!=="object") return; (f.items||[]).forEach((it,i)=>{ if (it&&typeof it==="object"&&it.media) add(it,"media",["Flow: "+(f.name||f.id),P(it.label)||"Item "+(i+1),"Panel image"],{panel:"flows",sel:f.id},{optional:true}); }); });
  (cfg.posts||[]).forEach(p=>{ if (!p||typeof p!=="object") return; add(p,"cover",["Blog: "+(P(p.title)||p.slug||p.id),"Cover image"],{panel:"blog",sel:p.id},{optional:!p.published,hidden:!p.published}); });
  (cfg.media||[]).forEach(m=>{ if (m&&m.kind==="article"&&m.cover) add(m,"cover",["Library article: "+P(m.label),"Cover image"],{panel:"media",sel:m.id},{optional:true}); });
  if (cfg.site&&cfg.site.logo) add(cfg.site,"logo",["Site header","Logo image"],{panel:"site"},{optional:true});
  return out;
}
/* ================= IMAGE USAGE =================
   Where each library item is used, for the "not used yet" filter in the image pickers and the Library.
   Starts from the image slots above (named places), then sweeps the rest of the site settings for any field that holds a
   library id (menu logo, loader, backgrounds…) and for [[id|caption]] written in text, so nothing that shows a picture is missed.
   Returns Map id → list of places (words). Hidden sections and draft posts count as used: the picture is still assigned there. */
const USE_TOP={ site:"Site and titles", theme:"Colours and type", motion:"Animation", style:"Global style", loader:"Loader", colorMode:"Colours and type", ai:"AI writing" };
function mediaUsage(cfg){
  const ids=new Set((cfg.media||[]).map(m=>m&&m.id).filter(Boolean)), use=new Map(), seen=new WeakMap();
  const P=v=>v&&typeof v==="object"?(v.en||v.ar||""):String(v??"");
  const put=(id,where)=>{ if (!ids.has(id)) return; const a=use.get(id)||[]; if (!a.includes(where)) a.push(where); use.set(id,a); };
  mediaSlots(cfg,{all:true}).forEach(x=>{ const id=x.obj[x.key]; if (!id) return; put(id,x.where.join(" › "));
    let k=seen.get(x.obj); if (!k) seen.set(x.obj,k=new Set()); k.add(String(x.key)); });
  const pretty=k=>String(k).replace(/([a-z])([A-Z])/g,"$1 $2").replace(/^./,c=>c.toUpperCase());
  const label=path=>{ const [top,...rest]=path; let head;
    if (["pages","modals","flows","posts"].includes(top.k) && rest.length){ const it=rest[0].v||{}, t=P(it.title)||it.name||it.slug||it.id||"";
      head={pages:"Page: ",modals:"Modal: ",flows:"Flow: ",posts:"Blog: "}[top.k]+t; rest.shift(); }
    else head=USE_TOP[top.k]||pretty(top.k);
    return [head,...rest.filter(x=>!/^\d+$/.test(String(x.k))).map(x=>pretty(x.k))].join(" › "); };
  const walk=(v,path,parent,key)=>{
    if (typeof v==="string"){
      if (ids.has(v) && !(seen.get(parent)&&seen.get(parent).has(String(key)))) put(v,label(path));
      if (v.includes("[[")) for (const m of v.matchAll(/\[\[([^\]|\s]+)/g)) put(m[1],label(path)+" (in the text)");
      return; }
    if (!v || typeof v!=="object") return;
    if (Array.isArray(v)) v.forEach((x,i)=>walk(x,[...path,{k:i,v:x}],v,i));
    else Object.keys(v).forEach(k=>walk(v[k],[...path,{k,v:v[k]}],v,k)); };
  Object.keys(cfg).forEach(k=>{ if (k==="media"||k==="categories"||k==="icons") return; walk(cfg[k],[{k,v:cfg[k]}],cfg,k); });
  /* Articles in the library can carry a cover picture, and their summaries can hold [[id]] too */
  (cfg.media||[]).forEach(m=>{ if (m&&m.kind==="article"&&typeof m.summary==="string") for (const x of m.summary.matchAll(/\[\[([^\]|\s]+)/g)) put(x[1],"Library article: "+P(m.label)); });
  return use;
}
/** The category a slot's picker opens on: the current image's, else the category most used by its neighbours. */
function slotCategory(cfg,id){ const m=(cfg.media||[]).find(x=>x&&x.id===id); return m&&m.kind!=="scene"?m.category||"":""; }
/* Content updates for sites saved before a new starter structure. Nothing is deleted.
   v3 (the bilingual content handoff): the new site map (Home, About Dorma, Agency, Print & Production, News & Insights), the service
   pages, catalogs, service modals, quote request, flows and posts. A saved page with the same address as a new one is kept as
   "<address>-previous" (out of the menu, still editable under Pages); every other earlier page stays, out of the menu. */
function migrateContent(out,saved){
  const from=+saved.contentVersion||1;
  if (from<3 && Array.isArray(saved.pages) && saved.pages.length){
    const S=JSON.parse(JSON.stringify(STARTER)), has=(list,id)=>list.some(x=>x&&x.id===id);
    const taken=new Set([...out.pages.map(p=>p&&p.id),...S.pages.map(p=>p.id)]);
    const kept=out.pages.filter(p=>p&&typeof p==="object").map(p=>{
      if (has(S.pages,p.id)){ let id=p.id+"-previous", k=2; while (taken.has(id)) id=p.id+"-previous-"+(k++); taken.add(id); p.id=id;
        const t=p.title; p.title=t&&typeof t==="object"?{en:(t.en||"")+" (previous)",ar:t.ar||""}:String(t||p.id)+" (previous)"; }
      p.nav=false; return p; });
    out.pages=[...S.pages,...kept];
    out.site.homePage=S.site.homePage;
    S.modals.forEach(m=>{ if (!has(out.modals,m.id)) out.modals.push(m); });
    S.flows.forEach(f=>{ if (!has(out.flows,f.id)) out.flows.push(f); });
    S.posts.forEach(x=>{ if (!has(out.posts,x.id)) out.posts.push(x); });
    S.icons.forEach(x=>{ if (!has(out.icons,x.id)) out.icons.push(x); });
    S.categories.forEach(x=>{ if (!has(out.categories,x.id)) out.categories.push(x); });
    const sv=saved.site||{}, lbl=sv.cta&&sv.cta.label;
    if (!sv.cta || lbl==="Tell us your challenge" || (sv.cta.action&&sv.cta.action.target==="md-contact")) out.site.cta=S.site.cta;
    if (!sv.languages || sv.languages==="en") out.site.languages=S.site.languages;
    if (!sv.footer || sv.footer==="© 2026 Dorma Advertising · Agency | Printing & Production") out.site.footer=S.site.footer;
  }
  out.contentVersion=Math.max(from,STARTER.contentVersion);
}
/* Flows made before global styles keep their look: a flow whose animation differs from the global one becomes "custom". */
function migrateFlow(f,g={}){
  if (!f || typeof f!=="object") return;
  if (!f.custom || typeof f.custom!=="object") f.custom={ anim:!!f.anim && ["mode","preset","duration","stagger","delay"].some(k=>String(f.anim[k])!==String(g[k])), colors:false };
  if (!f.colors || typeof f.colors!=="object") f.colors={};
  if (!f.anim) f.anim={...g};
}

/* ================= SAVED STYLES =================
   A saved style is a snapshot of the global layer (colours, type, header, image filter, flow and slide defaults, animation).
   Per-item custom settings are not part of it, so applying a style never wipes a flow or slide that has its own look. */
const STYLE_THEME=["accent","ink","panel","fg","heading","mutedOpacity","lineOpacity","display","body","mono","radius","grain","overlay","imageBrightness","imageOverlay","overlayIntensity","header","flow","slide","type","sections","modals","light","menu"];
const STYLE_MOTION=["speed","ease","titleReveal","scrollReveal","modalOpen","buttonGlow","transition","slideDuration","kenBurns","kbZoom","kbDuration","parallax","counters","flow","slideTiming","imageFx","sectionFx","modalClose","deco"];
const pickKeys=(o,ks)=>JSON.parse(JSON.stringify(Object.fromEntries(ks.filter(k=>o&&o[k]!==undefined).map(k=>[k,o[k]]))));
function snapshotStyle(cfg,name){ return { id:"st-"+Math.random().toString(36).slice(2,8), name:name||"My style", savedAt:new Date().toISOString(), theme:pickKeys(cfg.theme,STYLE_THEME), motion:pickKeys(cfg.motion,STYLE_MOTION) }; }
function applyStyle(cfg,st){
  if (!st) return; const th=pickKeys(st.theme,STYLE_THEME), mo=pickKeys(st.motion,STYLE_MOTION);
  // nested groups merge over the current ones so a style saved before a setting existed still leaves a full object
  for (const [k,v] of Object.entries(th)) cfg.theme[k]=v&&typeof v==="object"&&!Array.isArray(v)?{...(cfg.theme[k]||{}),...v}:v;
  for (const [k,v] of Object.entries(mo)) cfg.motion[k]=v&&typeof v==="object"&&!Array.isArray(v)?{...(cfg.motion[k]||{}),...v}:v;
}
/** Every flow and carousel slide back on the global style (their own custom values are kept, just switched off). */
function resetOverrides(cfg,{flows=true,slides=true}={}){
  let n=0;
  if (flows) (cfg.flows||[]).forEach(f=>{ f.custom=f.custom||{}; if (f.custom.anim||f.custom.colors) n++; f.custom.anim=false; f.custom.colors=false; });
  if (slides) (cfg.pages||[]).forEach(p=>(p.sections||[]).forEach(s=>{ if (s.type!=="heroCarousel") return;
    if (s.look&&s.look.custom){ s.look.custom=false; n++; }
    (s.slides||[]).forEach(x=>{ if (x&&x.look&&x.look.custom){ x.look.custom=false; n++; } }); }));
  return n;
}
STARTER.flows.forEach(f=>migrateFlow(f,STARTER.motion.flow));
STARTER.styles=[{ ...snapshotStyle(STARTER,"Dorma starter"), id:"st-starter", savedAt:"" }];

export { migrateLogos, SITE_MAP, normalize, defaultCategory, ensureCategory, migrateMedia, mediaSlots, mediaUsage, slotCategory, KIND_CATEGORY, snapshotStyle, applyStyle, resetOverrides, STYLE_THEME, STYLE_MOTION, A, STARTER, OPT, OV_PRESETS, ACTION_FIELDS, SECTION_TYPES, SECTION_BLANK };
