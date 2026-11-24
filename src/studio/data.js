
/* ================= STARTER TEMPLATE =================
   The site renders entirely from one settings object. This is the starter
   template the studio falls back to before anything has been saved. */
const A = (type="none",target="") => ({type,target});
const STARTER = {
  version: 1,
  site: {
    brand: "Meridian",
    homePage: "home",
    cta: { label: "Start a project", action: A("page","services") },
    footer: "© 2026 Meridian",
    showStudioLink: true
  },
  theme: {
    ink: "#05060a", panel: "#10121b", fg: "#eef1f6", accent: "#ff9e5e",
    mutedOpacity: 0.64, lineOpacity: 0.14,
    display: "Sora", body: "Sora", mono: "JetBrains Mono",
    radius: 4, grain: true, overlay: 1, imageBrightness: 0.8
  },
  motion: {
    speed: 1, ease: "expo",
    kenBurns: true, kbZoom: 1.18, kbDuration: 10,
    slideDuration: 7, transition: "wipe", titleReveal: "chars",
    modalOpen: "line", scrollReveal: "rise", parallax: true, counters: true
  },
  media: [
    { id:"m-nebula", label:"Nebula", kind:"scene", scene:"nebula", fx:.5, fy:.5, zoom:1 },
    { id:"m-ridges", label:"Ridges at dusk", kind:"scene", scene:"ridges", fx:.5, fy:.5, zoom:1 },
    { id:"m-city", label:"Night city", kind:"scene", scene:"city", fx:.5, fy:.5, zoom:1 },
    { id:"m-ocean", label:"Ocean sunrise", kind:"scene", scene:"ocean", fx:.55, fy:.5, zoom:1 },
    { id:"m-nebula-2", label:"Nebula detail", kind:"scene", scene:"nebula", fx:.72, fy:.42, zoom:1.6 },
    { id:"m-ridges-2", label:"Ridges detail", kind:"scene", scene:"ridges", fx:.7, fy:.56, zoom:1.6 },
    { id:"m-city-2", label:"City detail", kind:"scene", scene:"city", fx:.75, fy:.6, zoom:1.6 },
    { id:"m-ocean-2", label:"Ocean motion", kind:"scene", scene:"ocean", fx:.55, fy:.62, zoom:1.7, animate:true }
  ],
  icons: [
    { id:"i-code", label:"Code", svg:'<svg viewBox="0 0 24 24"><path d="M8 7 3 12l5 5M16 7l5 5-5 5M13.5 5l-3 14"/></svg>' },
    { id:"i-check", label:"Check", svg:'<svg viewBox="0 0 24 24"><path d="M5 12.5 10 17l9-10"/></svg>' },
    { id:"i-spark", label:"Spark", svg:'<svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18"/></svg>' },
    { id:"i-play", label:"Play", svg:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/></svg>' },
    { id:"i-arrow", label:"Arrow", svg:'<svg viewBox="0 0 24 24"><path d="M4 12h16M14 6l6 6-6 6"/></svg>' },
    { id:"i-globe", label:"Globe", svg:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>' },
    { id:"i-layers", label:"Layers", svg:'<svg viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/></svg>' },
    { id:"i-compass", label:"Compass", svg:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>' },
    { id:"i-bolt", label:"Bolt", svg:'<svg viewBox="0 0 24 24"><path d="M13 3 5 14h6l-1 7 8-11h-6z"/></svg>' },
    { id:"i-chart", label:"Chart", svg:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>' },
    { id:"i-eye", label:"Eye", svg:'<svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>' },
    { id:"i-meridian", label:"Meridian", svg:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 2v20"/></svg>' }
  ],
  flows: [
    { id:"f-hero", name:"Home workflow", separator:"dots3", size:"m", progress:true,
      anim:{ mode:"items", preset:"rise", duration:.8, stagger:.06, delay:.9 },
      items:[
        { id:"a1", kind:"button", label:"Discover", icon:"", svg:"", showIndex:true, detail:"", action:A("modal","md-discover"), anim:null },
        { id:"a2", kind:"text", label:"Design", icon:"", svg:"", showIndex:false, detail:"", action:A("modal","md-design"), anim:null },
        { id:"a3", kind:"icon", label:"Build", icon:"i-code", svg:"", showIndex:false, detail:"", action:A("modal","md-build"), anim:{ preset:"pop", duration:.9, delay:0 } },
        { id:"a4", kind:"button", label:"Launch", icon:"", svg:"", showIndex:true, detail:"", action:A("modal","md-launch"), anim:null }
      ] },
    { id:"f-build", name:"Build sub-steps", separator:"dots3", size:"s", progress:false,
      anim:{ mode:"items", preset:"rise", duration:.6, stagger:.05, delay:0 },
      items:[
        { id:"b1", kind:"button", label:"Architecture", icon:"", svg:"", showIndex:true, detail:"Stack, hosting and data model agreed in week one, documented in a single decision log.", action:A(), anim:null },
        { id:"b2", kind:"text", label:"Front end", icon:"", svg:"", showIndex:false, detail:"Components built against the design system, each one previewed in isolation.", action:A(), anim:null },
        { id:"b3", kind:"icon", label:"Testing", icon:"i-check", svg:"", showIndex:false, detail:"Automated checks on every merge: accessibility, visual changes and a 1.5 s load budget.", action:A(), anim:null },
        { id:"b4", kind:"button", label:"Release", icon:"", svg:"", showIndex:true, detail:"Weekly staging releases you can click through, then a planned production cutover.", action:A(), anim:null }
      ] },
    { id:"f-services", name:"Services shortcuts", separator:"dots3", size:"m", progress:false,
      anim:{ mode:"group", preset:"blur", duration:1, stagger:.06, delay:.5 },
      items:[
        { id:"c1", kind:"button", label:"Strategy", icon:"", svg:"", showIndex:true, detail:"", action:A("modal","md-discover"), anim:null },
        { id:"c2", kind:"text", label:"Product design", icon:"", svg:"", showIndex:false, detail:"", action:A("modal","md-design"), anim:null },
        { id:"c3", kind:"icon", label:"Engineering", icon:"i-code", svg:"", showIndex:false, detail:"", action:A("modal","md-build"), anim:null }
      ] },
    { id:"f-time", name:"Studio timeline", separator:"dots3", size:"m", progress:false,
      anim:{ mode:"items", preset:"slideLeft", duration:.7, stagger:.08, delay:0 },
      items:[
        { id:"t1", kind:"button", label:"2014", icon:"", svg:"", showIndex:false, detail:"Two designers open a studio above a print shop. First client: a local logistics firm.", action:A(), anim:null },
        { id:"t2", kind:"text", label:"2017", icon:"", svg:"", showIndex:false, detail:"Engineering joins. We start building and running the products we design.", action:A(), anim:null },
        { id:"t3", kind:"svg", label:"2020", icon:"", svg:'<svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18"/></svg>', showIndex:false, detail:"Fully remote across three time zones. The team grows to 20.", action:A(), anim:null },
        { id:"t4", kind:"text", label:"2023", icon:"", svg:"", showIndex:false, detail:"Harbor CMS and Signal launch as products in their own right.", action:A(), anim:null },
        { id:"t5", kind:"button", label:"2026", icon:"", svg:"", showIndex:false, detail:"38 people, 140 projects shipped, and the next chapter in progress.", action:A(), anim:null }
      ] }
  ],
  modals: [
    { id:"md-discover", name:"Discover", type:1, kicker:"Discover", title:"Research before the first sketch",
      text:"Two to three weeks of interviews, market scans and analytics review. We leave with a clear brief and the riskiest assumptions named.",
      media:["m-nebula-2"], caption:["Fig. 01","Field research","2026"], flowId:"", more:{ label:"More about Discover", action:A("page","services") } },
    { id:"md-design", name:"Design", type:2, kicker:"Design", title:"From wireframe to motion system",
      text:"Structure first, then the visual language and the motion that ties it together. Every screen is tested with real people.",
      media:["m-ridges-2","m-ocean-2","m-nebula-2"], caption:["Moodboard","Motion study","Type and colour"], flowId:"", more:{ label:"More about Design", action:A("page","services") } },
    { id:"md-build", name:"Build", type:3, kicker:"Build", title:"Production code that stays fast",
      text:"Front end, CMS and infrastructure built together, with performance budgets enforced on every merge.",
      media:["m-city-2"], caption:["Fig. 03","Staging build 42"], flowId:"f-build", more:{ label:"More about Build", action:A("page","products") } },
    { id:"md-launch", name:"Launch", type:1, kicker:"Launch", title:"Launch day and the weeks after",
      text:"We plan the release, watch it live and stay on to tune what the data shows. Your team owns it from day one.",
      media:["m-ocean-2"], caption:["Vid. 04","Launch recap","0:48"], flowId:"", more:{ label:"More about Launch", action:A("page","about") } }
  ],
  pages: [
    { id:"home", title:"Home", nav:false, layout:"cinematic", sections:[
      { id:"s-hc", type:"heroCarousel", flowId:"f-hero", flowDrivesSlides:true, hud:true, slides:[
        { eyebrow:"Discover", title:"See further than the map", lede:"We map the terrain before anyone draws a line: research, signals and the questions your market hasn't asked yet.", media:"m-nebula" },
        { eyebrow:"Design", title:"Shape what comes next", lede:"Systems, interfaces and motion drafted in layers, tested against real people until every edge feels inevitable.", media:"m-ridges" },
        { eyebrow:"Build", title:"Engineered to run all night", lede:"Production code, performance budgets and infrastructure that stays quiet under load.", media:"m-city" },
        { eyebrow:"Launch", title:"Ship it into the light", lede:"Release, measure, refine. We stay on through launch day and well past the first sunrise.", media:"m-ocean" }
      ] }
    ] },
    { id:"services", title:"Services", nav:true, layout:"cinematic", sections:[
      { id:"s1", type:"hero", num:"01", eyebrow:"Services", title:"What we make, end to end", lede:"Three disciplines under one roof, so strategy, design and code never lose the thread between them.", media:"m-nebula", height:"tall", flowId:"f-services" },
      { id:"s2", type:"chapters", items:[
        { title:"Strategy", text:"We start with your market, your numbers and your people, then agree on what winning looks like before anything gets drawn.", bullets:["Market and competitor research","Positioning and roadmap","Success metrics"], media:"m-ridges", caption:["Ch. 01","Strategy","2–3 weeks"], more:{ label:"More on strategy", action:A("modal","md-discover") } },
        { title:"Product design", text:"Interfaces, design systems and motion, prototyped early and tested with real people every week.", bullets:["UX architecture and flows","Design system","Motion specs"], media:"m-ocean", caption:["Ch. 02","Product design","4–6 weeks"], more:{ label:"More on design", action:A("modal","md-design") } },
        { title:"Engineering", text:"Web platforms, apps and the infrastructure under them, built to a performance budget and shipped weekly.", bullets:["Front end and CMS","Cloud infrastructure","Quality and accessibility"], media:"m-city", caption:["Ch. 03","Engineering","6–10 weeks"], more:{ label:"More on engineering", action:A("modal","md-build") } }
      ] },
      { id:"s3", type:"stats", style:"band", items:[
        { label:"Projects shipped", value:140, suffix:"+", decimals:0, meter:70 },
        { label:"Years running", value:12, suffix:"", decimals:0, meter:60 },
        { label:"People in studio", value:38, suffix:"", decimals:0, meter:40 },
        { label:"Clients who return", value:94, suffix:"%", decimals:0, meter:94 }
      ] },
      { id:"s4", type:"about", num:"02", eyebrow:"About", text:"Meridian is a studio of strategists, designers and engineers. We work in small teams, *ship every week*, and stay on long after launch.", media:"m-ridges-2", link:{ label:"Read about the studio", action:A("page","about") } },
      { id:"s5", type:"clients", num:"03", eyebrow:"Clients", style:"grid", items:[
        { name:"Northwind", sector:"Logistics", since:"2016", work:"Fleet platform" },{ name:"kestrel/", sector:"Retail", since:"2017", work:"Storefront" },
        { name:"Halcyon", sector:"Health", since:"2018", work:"Patient app" },{ name:"Atlas & Co", sector:"Finance", since:"2019", work:"Advisor portal" },
        { name:"Volta", sector:"Energy", since:"2021", work:"Charging map" },{ name:"orbis", sector:"Travel", since:"2022", work:"Booking flow" },
        { name:"Lumen Labs", sector:"Research", since:"2023", work:"Data suite" },{ name:"Parallax", sector:"Media", since:"2025", work:"Streaming site" }
      ] },
      { id:"s6", type:"cta", title:"Have a project in mind?", button:{ label:"Start a conversation", action:A("modal","md-discover") } }
    ] },
    { id:"products", title:"Products", nav:true, layout:"index", sections:[
      { id:"p1", type:"hero", num:"04", eyebrow:"Products", title:"Products built to ship", lede:"Platforms and tools we build and run ourselves, plus the studio services that come with them.", media:"m-ocean", height:"compact", flowId:"" },
      { id:"p2", type:"grid", title:"The catalogue", filters:true, items:[
        { code:"P-01", tag:"Platform", title:"Harbor CMS", text:"Headless publishing with a visual editor your team will enjoy.", media:"m-city-2", action:A("modal","md-build") },
        { code:"T-02", tag:"Tool", title:"Signal", text:"Live analytics that turn launch-day noise into decisions.", media:"m-nebula-2", action:A("modal","md-launch") },
        { code:"S-03", tag:"Studio", title:"Brand systems", text:"Identity, type and motion guidelines delivered as a living site.", media:"m-ridges-2", action:A("modal","md-design") },
        { code:"P-04", tag:"Platform", title:"Tide Commerce", text:"Storefronts that load in under a second on a mid-range phone.", media:"m-ocean-2", action:A() },
        { code:"T-05", tag:"Tool", title:"Relay", text:"Release checklists and rollbacks wired into your pipeline.", media:"m-city", action:A() },
        { code:"S-06", tag:"Studio", title:"Product sprints", text:"Five-day sprints that end in a clickable prototype.", media:"m-nebula", action:A() }
      ] },
      { id:"p3", type:"stats", style:"hud", items:[
        { label:"Active installs", value:2400, suffix:"", decimals:0, meter:82 },
        { label:"Median load", value:0.9, suffix:"s", decimals:1, meter:91 },
        { label:"Uptime", value:99.98, suffix:"%", decimals:2, meter:99 },
        { label:"Countries", value:31, suffix:"", decimals:0, meter:48 }
      ] },
      { id:"p4", type:"clients", num:"05", eyebrow:"Clients", style:"marquee", items:[
        { name:"Northwind" },{ name:"kestrel/" },{ name:"Halcyon" },{ name:"Atlas & Co" },{ name:"Volta" },{ name:"orbis" },{ name:"Lumen Labs" },{ name:"Parallax" }
      ] },
      { id:"p5", type:"about", num:"06", eyebrow:"About", text:"Every product here started as client work. We kept running it, which is why our services come with *real operating experience*.", media:"m-ridges", link:{ label:"More about us", action:A("page","about") } }
    ] },
    { id:"about", title:"About", nav:true, layout:"console", sections:[
      { id:"c1", type:"hero", num:"07", eyebrow:"About Meridian", title:"We build what comes next", lede:"", media:"m-city", height:"tall", flowId:"" },
      { id:"c2", type:"timeline", num:"01", eyebrow:"Story", text:"Founded in 2014 as a two-person design shop, Meridian is now a 38-person studio working across strategy, product and engineering.", flowId:"f-time" },
      { id:"c3", type:"stats", num:"02", eyebrow:"Numbers", style:"meters", items:[
        { label:"Projects shipped", value:140, suffix:"+", decimals:0, meter:70 },
        { label:"Clients who return", value:94, suffix:"%", decimals:0, meter:94 },
        { label:"Average project", value:14, suffix:" wks", decimals:0, meter:45 },
        { label:"Awards", value:27, suffix:"", decimals:0, meter:55 }
      ] },
      { id:"c4", type:"accordion", num:"03", eyebrow:"Services", items:[
        { title:"Strategy", tags:["Research","Roadmaps"], text:"Market research, positioning and a roadmap everyone signs off on before design starts.", media:"m-ridges-2", more:{ label:"More on strategy", action:A("modal","md-discover") } },
        { title:"Product design", tags:["UX","Systems","Motion"], text:"Flows, interfaces and design systems, prototyped early and tested every week.", media:"m-ocean-2", more:{ label:"More on design", action:A("modal","md-design") } },
        { title:"Engineering", tags:["Web","Cloud"], text:"Production front ends, CMS and infrastructure built to a performance budget.", media:"m-city-2", more:{ label:"More on engineering", action:A("modal","md-build") } }
      ] },
      { id:"c5", type:"clients", num:"04", eyebrow:"Clients", style:"table", items:[
        { name:"Northwind", sector:"Logistics", since:"2016", work:"Fleet platform, design system" },
        { name:"Halcyon", sector:"Health", since:"2018", work:"Patient app, brand" },
        { name:"Atlas & Co", sector:"Finance", since:"2019", work:"Advisor portal" },
        { name:"Volta", sector:"Energy", since:"2021", work:"Charging network map" },
        { name:"Parallax", sector:"Media", since:"2025", work:"Streaming site relaunch" }
      ] }
    ] }
  ]
};

/* ================= FIELD SCHEMAS =================
   One generic form engine edits everything below. Field: [key, kind, label, opts] */
const OPT = {
  fonts: ["Sora","Space Grotesk","Manrope","Unbounded","Inter"],
  monos: ["JetBrains Mono","IBM Plex Mono"],
  ease: [["expo","Expo (sharp, cinematic)"],["power3","Power (smooth)"],["sine","Sine (gentle)"],["back","Back (overshoot)"],["elastic","Elastic (springy)"]],
  transition: [["wipe","Light wipe"],["fade","Crossfade"],["slide","Slide"],["zoom","Zoom through"]],
  titleReveal: [["chars","Letter by letter"],["words","Word by word"],["fade","Fade up"],["blur","Blur in"]],
  modalOpen: [["line","Scan line"],["fade","Fade"],["scale","Scale up"],["slide","Slide up"]],
  scrollReveal: [["rise","Rise"],["fade","Fade"],["none","None"]],
  presets: [["rise","Rise"],["fade","Fade"],["scale","Scale"],["blur","Blur"],["slideLeft","Slide from left"],["slideRight","Slide from right"],["flip","Flip"],["pop","Pop"],["none","None"]],
  separators: [["dots3","Three dots"],["dot","Single dot"],["line","Line"],["chevron","Chevron"],["none","None"]],
  kinds: [["button","Button"],["text","Plain text"],["icon","Icon"],["svg","Custom SVG"]],
  sizes: [["s","Small"],["m","Medium"],["l","Large"]],
  actions: [["none","Nothing"],["modal","Open modal"],["page","Go to page"],["slide","Go to slide"],["url","Open link"]],
  layouts: [["cinematic","Cinematic"],["index","Index"],["console","Console (side menu)"]],
  heights: [["full","Full screen"],["tall","Tall"],["compact","Compact"]],
  statStyles: [["band","Band"],["hud","HUD tiles"],["meters","Meters"]],
  clientStyles: [["grid","Logo grid"],["marquee","Scrolling logos"],["table","Table"]],
  modalTypes: [[1,"Type 1 · Media"],[2,"Type 2 · Gallery"],[3,"Type 3 · Flow"]],
  scenes: [["nebula","Nebula"],["ridges","Ridges"],["city","City"],["ocean","Ocean"]]
};
const ACTION_FIELDS = [["action","action","Action"]];
const SECTION_TYPES = {
  heroCarousel: { label:"Hero carousel", fields:[
    ["flowId","flow","Flow under the title"],
    ["flowDrivesSlides","toggle","Flow items switch slides"],
    ["hud","toggle","Show counter and timecode"],
    ["slides","list","Slides",{ title:"title", fields:[["eyebrow","text","Eyebrow"],["title","text","Title"],["lede","area","Short paragraph",{wide:true}],["media","media","Background image",{wide:true}]], blank:()=>({eyebrow:"New",title:"New slide",lede:"",media:"m-nebula"}) }]
  ]},
  hero: { label:"Hero", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["title","text","Title",{wide:true}],["lede","area","Short paragraph",{wide:true}],["height","select","Height",{options:OPT.heights}],["flowId","flow","Flow"],["media","media","Background image",{wide:true}]] },
  chapters: { label:"Chapters", fields:[["items","list","Chapters",{ title:"title", fields:[["title","text","Title"],["text","area","Text",{wide:true}],["bullets","strings","Bullet points (one per line)",{wide:true}],["caption","strings","Caption items (one per line)",{wide:true}],["more","button","More button"],["media","media","Image",{wide:true}]], blank:()=>({title:"New chapter",text:"",bullets:[],caption:[],media:"m-ridges",more:{label:"More",action:A()}}) }]] },
  stats: { label:"Numbers", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["style","select","Style",{options:OPT.statStyles}],["items","list","Figures",{ title:"label", fields:[["label","text","Label"],["value","number","Value"],["suffix","text","Suffix"],["decimals","number","Decimals"],["meter","range","Meter %",{min:0,max:100,step:1}]], blank:()=>({label:"New figure",value:10,suffix:"",decimals:0,meter:50}) }]] },
  about: { label:"About", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["text","area","Statement (wrap words in *stars* to highlight)",{wide:true}],["link","button","Link"],["media","media","Image (optional)",{wide:true,allowNone:true}]] },
  clients: { label:"Clients", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["style","select","Style",{options:OPT.clientStyles}],["items","list","Clients",{ title:"name", fields:[["name","text","Name"],["sector","text","Sector"],["since","text","Since"],["work","text","Work"]], blank:()=>({name:"New client",sector:"",since:"",work:""}) }]] },
  grid: { label:"Card grid", fields:[["title","text","Heading"],["filters","toggle","Show tag filters as a flow"],["items","list","Cards",{ title:"title", fields:[["code","text","Code"],["tag","text","Tag"],["title","text","Title"],["text","area","Text",{wide:true}],["action","action","On click"],["media","media","Image",{wide:true}]], blank:()=>({code:"X-00",tag:"Tag",title:"New card",text:"",media:"m-city",action:A()}) }]] },
  accordion: { label:"Accordion", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["items","list","Rows",{ title:"title", fields:[["title","text","Title"],["tags","strings","Tags (one per line)"],["text","area","Text",{wide:true}],["more","button","More button"],["media","media","Image",{wide:true}]], blank:()=>({title:"New row",tags:[],text:"",media:"m-ocean",more:{label:"More",action:A()}}) }]] },
  timeline: { label:"Timeline", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["text","area","Statement",{wide:true}],["flowId","flow","Timeline flow (each item's detail text shows on click)"]] },
  flowStrip: { label:"Flow strip", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["title","text","Heading",{wide:true}],["flowId","flow","Flow"]] },
  banner: { label:"Wide banner", fields:[["caption","strings","Caption items (one per line)",{wide:true}],["media","media","Image",{wide:true}]] },
  cta: { label:"Call to action", fields:[["title","text","Heading",{wide:true}],["button","button","Button"]] }
};
const SECTION_BLANK = {
  heroCarousel:()=>({flowId:"",flowDrivesSlides:false,hud:true,slides:[{eyebrow:"New",title:"New slide",lede:"",media:"m-nebula"}]}),
  hero:()=>({num:"",eyebrow:"Eyebrow",title:"New hero",lede:"",media:"m-nebula",height:"tall",flowId:""}),
  chapters:()=>({items:[]}), stats:()=>({num:"",eyebrow:"",style:"band",items:[]}),
  about:()=>({num:"",eyebrow:"About",text:"A short statement.",media:"",link:{label:"",action:A()}}),
  clients:()=>({num:"",eyebrow:"Clients",style:"grid",items:[]}), grid:()=>({title:"Cards",filters:true,items:[]}),
  accordion:()=>({num:"",eyebrow:"",items:[]}), timeline:()=>({num:"",eyebrow:"Story",text:"",flowId:""}),
  flowStrip:()=>({num:"",eyebrow:"",title:"",flowId:""}), banner:()=>({caption:[],media:"m-ocean"}),
  cta:()=>({title:"Have a project in mind?",button:{label:"Get in touch",action:A()}})
};

/* Fills in anything missing from a saved config with the starter template, so older saves keep working. */
function normalize(c){
  const out=JSON.parse(JSON.stringify(STARTER)); if (!c || typeof c!=="object") return out;
  for (const k of Object.keys(out)){
    if (c[k]==null) continue;
    if (Array.isArray(out[k])) out[k]=Array.isArray(c[k])?c[k]:out[k];
    else if (typeof out[k]==="object") out[k]={...out[k],...c[k]};
    else out[k]=c[k];
  }
  return out;
}

export { normalize, A, STARTER, OPT, ACTION_FIELDS, SECTION_TYPES, SECTION_BLANK };
