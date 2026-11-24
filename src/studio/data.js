
/* ================= STARTER TEMPLATE =================
   The site renders entirely from one settings object. This is the starter
   template the studio falls back to before anything has been saved. */
const A = (type="none",target="") => ({type,target});
const STARTER = {
  version: 1,
  site: {
    brand: "Dorma Advertising",
    homePage: "home",
    cta: { label: "Tell us your challenge", action: A("modal","md-contact") },
    footer: "© 2026 Dorma Advertising · Agency | Printing & Production",
    showStudioLink: true,
    languages: "en",
    defaultLang: "en",
    showNumbers: false,
    logoMode: "image",
    logo: "",
    logoHeight: 34
  },
  loader: { enabled: true, mark: "image", image: "", bg: "theme", text: "DORMA", sub: "ADVERTISING", logo: "", style: "reveal", exit: "wipe", minTime: 1.2 },
  theme: {
    ink: "#040915", panel: "#0b1630", fg: "#eef2fa", accent: "#ffc93c",
    mutedOpacity: 0.66, lineOpacity: 0.14,
    display: "Sora", body: "Sora", mono: "JetBrains Mono",
    radius: 4, grain: true, overlay: 1, imageBrightness: 0.8
  },
  motion: {
    speed: 1, ease: "expo",
    kenBurns: true, kbZoom: 1.18, kbDuration: 10,
    slideDuration: 7, buttonGlow: 0.45, transition: "wipe", titleReveal: "chars",
    modalOpen: "line", scrollReveal: "rise", parallax: true, counters: true
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
    { id:"i-arrow", label:"Arrow", svg:'<svg viewBox="0 0 24 24"><path d="M4 12h16M14 6l6 6-6 6"/></svg>' }
  ],
  flows: [
    { id:"f-hero", name:"Home: what's your challenge", separator:"dots3", size:"m", progress:true,
      anim:{ mode:"items", preset:"rise", duration:.8, stagger:.06, delay:.9 },
      items:[
        { id:"h1", kind:"button", label:"Your challenge", icon:"", svg:"", showIndex:true, detail:"", action:A("modal","md-intro"), anim:null },
        { id:"h2", kind:"text", label:"Agency", icon:"", svg:"", showIndex:false, detail:"", action:A("modal","md-agency"), anim:null },
        { id:"h3", kind:"icon", label:"Printing & Production", icon:"i-print", svg:"", showIndex:false, detail:"", action:A("modal","md-production"), anim:{ preset:"pop", duration:.9, delay:0 } },
        { id:"h4", kind:"button", label:"Let's talk", icon:"", svg:"", showIndex:true, detail:"", action:A("modal","md-contact"), anim:null }
      ] },
    { id:"f-agency", name:"Agency services", separator:"dots3", size:"s", progress:false,
      anim:{ mode:"items", preset:"rise", duration:.6, stagger:.05, delay:0 },
      items:[
        { id:"g1", kind:"button", label:"Concepts", icon:"", svg:"", showIndex:true, detail:"Give your idea a clear direction: creative concepts, brand storytelling, logo and visual identity.", action:A("modal","md-concepts"), anim:null },
        { id:"g2", kind:"text", label:"Content", icon:"", svg:"", showIndex:false, detail:"Design, photography, video and sound shaped around your message, audience and channels.", action:A("modal","md-content"), anim:null },
        { id:"g3", kind:"text", label:"Events", icon:"", svg:"", showIndex:false, detail:"Planning, creative development, coordination and production support for events and activations.", action:A("modal","md-events"), anim:null },
        { id:"g4", kind:"icon", label:"Exhibitions", icon:"i-booth", svg:"", showIndex:false, detail:"Booth concepts, construction, graphics and displays built around your exhibition objectives.", action:A("modal","md-booths"), anim:null },
        { id:"g5", kind:"button", label:"Digital", icon:"", svg:"", showIndex:true, detail:"Website design, content creation and social media management for a consistent presence.", action:A("modal","md-digital"), anim:null }
      ] },
    { id:"f-production", name:"Printing & Production", separator:"dots3", size:"s", progress:false,
      anim:{ mode:"items", preset:"rise", duration:.6, stagger:.05, delay:0 },
      items:[
        { id:"r1", kind:"button", label:"Print", icon:"", svg:"", showIndex:true, detail:"Digital, offset and large-format printing, stationery, brochures, labels and packaging.", action:A("page","production"), anim:null },
        { id:"r2", kind:"text", label:"Signage", icon:"", svg:"", showIndex:false, detail:"Indoor, outdoor and illuminated signs, vehicle branding, window and vinyl graphics.", action:A("page","production"), anim:null },
        { id:"r3", kind:"text", label:"Fabrication", icon:"", svg:"", showIndex:false, detail:"Acrylic and woodwork, promotional counters and desks, product displays and custom branded elements.", action:A("page","production"), anim:null },
        { id:"r4", kind:"text", label:"Booths", icon:"", svg:"", showIndex:false, detail:"Booth construction and custom fabrication, counters, displays, signage and lighting.", action:A("modal","md-booths"), anim:null },
        { id:"r5", kind:"icon", label:"Gifts & Displays", icon:"i-gift", svg:"", showIndex:false, detail:"Corporate gifts, merchandise and display products suited to your audience, occasion and budget.", action:A("modal","md-gifts"), anim:null }
      ] },
    { id:"f-process", name:"How we bring it together", separator:"dots3", size:"m", progress:false,
      anim:{ mode:"items", preset:"slideLeft", duration:.7, stagger:.08, delay:0 },
      items:[
        { id:"p1", kind:"button", label:"Understand", icon:"", svg:"", showIndex:true, detail:"Clarify your objectives, audience, requirements, and budget.", action:A(), anim:null },
        { id:"p2", kind:"button", label:"Shape", icon:"", svg:"", showIndex:true, detail:"Develop the approach and agree on the scope, materials, and schedule.", action:A(), anim:null },
        { id:"p3", kind:"button", label:"Deliver", icon:"", svg:"", showIndex:true, detail:"Coordinate the creative work, production, and delivery required by the brief.", action:A(), anim:null }
      ] },
    { id:"f-values", name:"Our values", separator:"dots3", size:"m", progress:false,
      anim:{ mode:"items", preset:"pop", duration:.7, stagger:.08, delay:0 },
      items:[
        { id:"v1", kind:"icon", label:"Understanding", icon:"i-ear", svg:"", showIndex:false, detail:"We listen, ask questions, and clarify the brief.", action:A(), anim:null },
        { id:"v2", kind:"icon", label:"Creativity", icon:"i-spark", svg:"", showIndex:false, detail:"We develop ideas with a clear purpose.", action:A(), anim:null },
        { id:"v3", kind:"icon", label:"Care", icon:"i-care", svg:"", showIndex:false, detail:"We pay attention to materials, details, and finish.", action:A(), anim:null },
        { id:"v4", kind:"icon", label:"Commitment", icon:"i-check", svg:"", showIndex:false, detail:"We work to agreed scopes, timelines, and budgets.", action:A(), anim:null },
        { id:"v5", kind:"icon", label:"Collaboration", icon:"i-link", svg:"", showIndex:false, detail:"We keep communication clear throughout the project.", action:A(), anim:null }
      ] }
  ],
  modals: [
    { id:"md-intro", name:"Introducing Dorma", type:1, kicker:"Introducing Dorma", title:"You bring the challenge. We bring it together.",
      text:"Established in 2000, Dorma Advertising brings together creative services, digital communication, event management, printing, and production. We connect the right capabilities around your brief, from a single requirement to a coordinated project.",
      media:["m-nebula-2"], caption:["Since 2000","Agency","Printing & Production"], flowId:"", more:{ label:"About Dorma", action:A("page","about") } },
    { id:"md-agency", name:"Agency", type:3, kicker:"Agency", title:"Develop the idea, shape the message, plan the experience.",
      text:"Concepts, design, content, events and digital, connected around what you want to achieve.",
      media:["m-ridges-2"], caption:["Division 01","Agency"], flowId:"f-agency", more:{ label:"Explore the Agency", action:A("page","agency") } },
    { id:"md-production", name:"Printing & Production", type:3, kicker:"Printing & Production", title:"Turn the idea into things people can see and hold.",
      text:"Printed materials, branded spaces, displays, and products, produced with attention to materials, details, and finish.",
      media:["m-city-2"], caption:["Division 02","Printing & Production"], flowId:"f-production", more:{ label:"Explore Printing & Production", action:A("page","production") } },
    { id:"md-contact", name:"Contact", type:1, kicker:"Let's bring it to life", title:"What are you planning next?",
      text:"A new identity. A product launch. An exhibition. A stronger digital presence. Or one essential item you need produced well. Tell us what you want to achieve, and we'll help bring the right ideas, services, and products together around your brief. [Phone] · [Email] · [Address]",
      media:["m-ocean-2"], caption:["[Phone]","[Email]","[Website]"], flowId:"", more:{ label:"[Email us]", action:A() } },
    { id:"md-concepts", name:"Concepts & Brand Identity", type:1, kicker:"Concepts & Brand Identity", title:"We have an idea. Where do we start?",
      text:"Give your idea a clear direction. We help define the central idea, shape its message, and develop the design language that carries it across your brand materials.",
      media:["m-nebula-2"], caption:["04","From the first thought","to a consistent visual expression"], flowId:"", more:{ label:"More about the Agency", action:A("page","agency") } },
    { id:"md-content", name:"Creative Content", type:2, kicker:"Creative Content", title:"We have something to say. How do we make it connect?",
      text:"The right image can explain. A film can tell a story. Music can set the mood. We bring design, photography, video, and sound together around your message, audience, and channels.",
      media:["m-ridges-2","m-ocean-2","m-city-2"], caption:["Photography","Video","Motion & sound"], flowId:"", more:{ label:"More about the Agency", action:A("page","agency") } },
    { id:"md-events", name:"Events & Brand Activation", type:1, kicker:"Events & Brand Activation", title:"We need to bring people together. Who connects all the details?",
      text:"People, materials, timing, and logistics all need to work in step. We bring together planning, creative development, coordination, and production support for exhibitions, conferences, launches, concerts, and promotional activations.",
      media:["m-city-2"], caption:["06","A coordinated experience","from preparation to delivery"], flowId:"", more:{ label:"More about the Agency", action:A("page","agency") } },
    { id:"md-booths", name:"Exhibitions & Booths", type:2, kicker:"Exhibitions & Booths", title:"We have a space at an exhibition. How do we make it count?",
      text:"Your booth should help visitors understand who you are, what you offer, and why they should stop and speak with you. We connect the concept, construction, graphics, displays, and presentation materials.",
      media:["m-city","m-ridges-2","m-nebula-2"], caption:["Concept","Construction","Finish"], flowId:"", more:{ label:"See production services", action:A("page","production") } },
    { id:"md-digital", name:"Digital Presence", type:1, kicker:"Digital Presence", title:"Our customers are online. How should we show up?",
      text:"Your website and social channels should help people understand your business and take the next step. We combine website design, content creation, and social media management for a clear and consistent presence.",
      media:["m-ocean-2"], caption:["08","Connected content","Consistent communication"], flowId:"", more:{ label:"More about the Agency", action:A("page","agency") } },
    { id:"md-gifts", name:"Corporate Gifts & Display Products", type:1, kicker:"Corporate Gifts & Display Products", title:"What can we give people that they'll actually use?",
      text:"A thoughtful promotional product starts with the person receiving it. We help you choose gifts, merchandise, and display products suited to your audience, occasion, and budget. Ask for our dedicated catalogues to explore available options.",
      media:["m-ridges-2"], caption:["10","Give your brand","a useful place"], flowId:"", more:{ label:"Ask for the catalogues", action:A("modal","md-contact") } }
  ],
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
    { id:"articles", label:"Articles & Guides" }
  ],
  posts: [
    { id:"p-exhibition", slug:"make-your-exhibition-space-count", title:"From an allocated space to a considered presence", date:"2026-11-24", category:"exhibitions", tags:["Exhibitions","Booths"], author:"Dorma Advertising", cover:"m-city", published:true,
      excerpt:"Your booth should help visitors understand who you are, what you offer, and why they should stop and speak with you.",
      body:"You have a space at an exhibition. How do you make it count?\n\nYour booth should help visitors understand who you are, what you offer, and why they should stop and speak with you. That only happens when the concept, construction, graphics, displays, and presentation materials are planned around the same objectives.\n\n## What a complete booth brings together\n\n- Booth concepts and graphic design\n- Booth construction and custom fabrication\n- Counters, desks, and product displays\n- Signage and lighting elements\n- Presentation films and digital content\n- Brochures, promotional materials, and giveaways\n- Team preparation\n\n[[m-city-2|Placeholder image: replace with a completed booth from the library]]\n\n## Start with the objective\n\nBefore choosing materials or layouts, agree on what the space needs to achieve: who you want to reach, what they should remember, and what the team on the stand needs to do their job well.\n\n> From an allocated space to a considered presence.\n\nTell us about your next exhibition and we'll help shape the way forward." },
    { id:"p-process", slug:"understand-shape-deliver", title:"Understand, shape, deliver: how we bring a brief together", date:"2026-11-20", category:"brand", tags:["Process"], author:"Dorma Advertising", cover:"m-ridges", published:true,
      excerpt:"Every brief has its own audience, priorities, and practical considerations. We start by understanding those differences.",
      body:"Different businesses have individual requirements. Every brief has its own audience, priorities, and practical considerations, so we start by understanding those differences.\n\n## Understand\n\nClarify your objectives, audience, requirements, and budget.\n\n## Shape\n\nDevelop the approach and agree on the scope, materials, and schedule.\n\n## Deliver\n\nCoordinate the creative work, production, and delivery required by the brief.\n\n> Clear communication connects every stage.\n\nWhether you need a single item produced well or a coordinated project across both of our divisions, the same three stages keep everyone working toward **what you want to achieve**." }
  ],
  pages: [
    { id:"home", title:"Home", nav:false, layout:"cinematic", sections:[
      { id:"s-hc", type:"heroCarousel", flowId:"f-hero", hud:true, timing:{}, replayFlow:false, slides:[
        { eyebrow:"Dorma Advertising", title:"What's your next challenge?", lede:"Let's bring it to life. Ideas, experiences, and production solutions shaped around your business.", media:"m-nebula" },
        { flowId:"f-agency", eyebrow:"Agency", title:"Give your idea a clear direction", lede:"Develop the idea, shape the message, and plan the experience: concepts, design, content, events, and digital.", media:"m-ridges" },
        { flowId:"f-production", eyebrow:"Printing & Production", title:"Put your brand where people experience it", lede:"Turn the idea into printed materials, branded spaces, displays, and products.", media:"m-city" },
        { eyebrow:"Let's talk", title:"What are you planning next?", lede:"Tell us what you want to achieve. We'll help shape the way forward.", media:"m-ocean" }
      ] },
      { id:"s-intro", type:"about", num:"01", eyebrow:"Introducing Dorma", text:"You may be launching a product, preparing for an exhibition, refreshing your brand, or looking for a better way to connect with customers. Whatever comes next, it starts with *understanding what you need*.", media:"m-ridges-2", link:{ label:"About Dorma", action:A("page","about") } },
      { id:"s-divisions", type:"chapters", items:[
        { title:"Agency", text:"Develop the idea, shape the message, and plan the experience.", bullets:["Concepts and brand identity","Creative content","Events and brand activation","Exhibitions and booths","Digital presence"], media:"m-ridges", caption:["Division 01","Concepts · Design · Content · Events · Digital"], more:{ label:"Explore the Agency", action:A("page","agency") } },
        { title:"Printing & Production", text:"Turn the idea into printed materials, branded spaces, displays, and products.", bullets:["Print and packaging","Signage and brand applications","Custom fabrication","Corporate gifts and display products"], media:"m-city", caption:["Division 02","Print · Signage · Fabrication · Booths · Gifts & Displays"], more:{ label:"Explore Printing & Production", action:A("page","production") } }
      ] },
      { id:"s-process", type:"timeline", num:"02", eyebrow:"How we bring it together", text:"Every brief has its own audience, priorities, and practical considerations. Clear communication connects every stage.", flowId:"f-process" },
      { id:"s-cta", type:"cta", title:"Tell us what you want to achieve. We'll help shape the way forward.", button:{ label:"Start the conversation", action:A("modal","md-contact") } }
    ] },
    { id:"agency", title:"Agency", nav:true, layout:"cinematic", sections:[
      { id:"a1", type:"hero", num:"01", eyebrow:"Agency", title:"Develop the idea. Shape the message. Plan the experience.", lede:"Concepts, design, content, events, and digital, connected around your brief.", media:"m-nebula", height:"tall", flowId:"f-agency" },
      { id:"a2", type:"chapters", items:[
        { title:"We have an idea. Where do we start?", text:"Give your idea a clear direction. A new business, campaign, or product needs a concept that people can understand and a visual identity they can recognize. We help define the central idea, shape its message, and develop the design language that carries it across your brand materials.", bullets:["Creative concepts and campaign themes","Brand storytelling and key messages","Logo and visual identity design","Graphic design and campaign artwork","Packaging and business material design"], media:"m-ridges", caption:["Concepts & Brand Identity","From the first thought to a consistent visual expression"], more:{ label:"More on concepts", action:A("modal","md-concepts") } },
        { title:"We have something to say. How do we make it connect?", text:"Give your message its best expression. Whether you need a product shoot, a company film, social content, or event coverage, we shape the production around its intended use.", bullets:["Graphic design","Product, corporate, and event photography","Videography and video production","Video editing and motion graphics","Music production"], media:"m-ocean", caption:["Creative Content","One message. The right creative expression."], more:{ label:"More on content", action:A("modal","md-content") } },
        { title:"We need to bring people together. Who connects all the details?", text:"Make every element work together. Events and activations depend on more than how they look: people, materials, timing, and logistics all need to work in step.", bullets:["Event and activation concepts","Planning, logistics, and coordination","Event branding and production","Promotional material and sample distribution","Activation team and usher training and supervision","Photography and video coverage"], media:"m-city", caption:["Events & Brand Activation","A coordinated experience, from preparation to delivery"], more:{ label:"More on events", action:A("modal","md-events") } },
        { title:"We have a space at an exhibition. How do we make it count?", text:"Turn your space into a brand experience. We connect the concept, construction, graphics, displays, and presentation materials around your exhibition objectives.", bullets:["Booth concepts and graphic design","Booth construction and custom fabrication","Counters, desks, and product displays","Signage and lighting elements","Presentation films and digital content","Brochures, giveaways, and team preparation"], media:"m-nebula-2", caption:["Exhibitions & Booths","From an allocated space to a considered presence"], more:{ label:"More on exhibitions", action:A("modal","md-booths") } },
        { title:"Our customers are online. How should we show up?", text:"Build a presence that feels like your brand. We combine website design, content creation, and social media management to give your brand a clear and consistent digital presence.", bullets:["Website design","Social media planning and management","Graphic content and campaign visuals","Photography and short-form video","Content adapted for different channels"], media:"m-ocean-2", caption:["Digital Presence","Connected content. Consistent communication."], more:{ label:"More on digital", action:A("modal","md-digital") } }
      ] },
      { id:"a3", type:"cta", title:"We have an idea. Where do we start? With you.", button:{ label:"Tell us your challenge", action:A("modal","md-contact") } }
    ] },
    { id:"production", title:"Printing & Production", nav:true, layout:"index", sections:[
      { id:"r1", type:"hero", num:"02", eyebrow:"Printing & Production", title:"How do we make our brand visible beyond the screen?", lede:"On a storefront, across a vehicle, inside a workplace, or in a customer's hands, every application contributes to how your brand is seen.", media:"m-city", height:"compact", flowId:"f-production" },
      { id:"r2", type:"grid", title:"Different materials. A consistent identity.", filters:true, items:[
        { code:"PR-01", tag:"Print", title:"Print & Packaging", text:"Digital and offset printing, large-format printing, stationery and brochures, labels and packaging.", media:"m-ridges-2", action:A() },
        { code:"SG-02", tag:"Signage", title:"Signage & Brand Applications", text:"Indoor and outdoor signage, illuminated signs, vehicle branding, window and vinyl graphics.", media:"m-city-2", action:A() },
        { code:"FB-03", tag:"Fabrication", title:"Custom Fabrication", text:"Acrylic and woodwork, promotional counters and desks, product displays, custom branded elements.", media:"m-nebula-2", action:A("modal","md-booths") },
        { code:"GF-04", tag:"Gifts", title:"Everyday & Office Essentials", text:"Notebooks, pens, and desk accessories.", media:"m-ocean", action:A("modal","md-gifts") },
        { code:"GF-05", tag:"Gifts", title:"Drinkware", text:"Mugs, bottles, and travel cups.", media:"m-ridges", action:A("modal","md-gifts") },
        { code:"GF-06", tag:"Gifts", title:"Apparel & Bags", text:"T-shirts, caps, and tote bags.", media:"m-city", action:A("modal","md-gifts") },
        { code:"GF-07", tag:"Gifts", title:"Gifts & Recognition", text:"Gift sets, awards, and commemorative items.", media:"m-nebula", action:A("modal","md-gifts") },
        { code:"DS-08", tag:"Displays", title:"Display Products", text:"Portable stands, roll-ups, flags, promotional counters, and related display solutions.", media:"m-ocean-2", action:A("modal","md-gifts") }
      ] },
      { id:"r3", type:"about", num:"03", eyebrow:"Corporate gifts", text:"A thoughtful promotional product starts with *the person receiving it*. Ask for our dedicated catalogues to explore available options.", media:"m-ridges-2", link:{ label:"Ask for the catalogues", action:A("modal","md-contact") } },
      { id:"r4", type:"cta", title:"Put your brand where people experience it.", button:{ label:"Tell us what you need produced", action:A("modal","md-contact") } }
    ] },
    { id:"work", title:"Selected Work", nav:true, layout:"cinematic", sections:[
      { id:"w1", type:"hero", num:"03", eyebrow:"Selected work", title:"Different businesses. Individual requirements.", lede:"Projects that show several capabilities working together. [Case studies to be completed with verified briefs and outcomes.]", media:"m-ocean", height:"compact", flowId:"" },
      { id:"w2", type:"accordion", num:"01", eyebrow:"Projects", items:[
        { title:"[Client / Project Name]: Brand launch", tags:["Launch","[Services delivered]"], text:"We're launching something new. Can you bring the pieces together? The challenge: [what was launching, who it needed to reach, the main requirement]. Our response: [the idea and how Dorma connected the creative, digital, event, or production elements]. What we delivered: [only the services and materials actually delivered]. The result: [the completed outcome; add figures only where verified].", media:"m-ridges", more:{ label:"Plan your launch", action:A("modal","md-contact") } },
        { title:"[Client / Event / Exhibition Name]: Event or exhibition", tags:["Exhibition","[Services delivered]"], text:"How do we make our presence feel complete? The challenge: [the space, audience, objectives, and practical constraints]. Our response: [the concept, layout, production approach, and coordination involved]. What we delivered: [booth, displays, signage, content, print, staffing support, or other delivered elements]. The result: [how the completed project met the brief].", media:"m-city", more:{ label:"Plan your exhibition", action:A("modal","md-booths") } }
      ] },
      { id:"w3", type:"clients", num:"02", eyebrow:"Selected clients", style:"grid", items:[
        { name:"[Client logo]", sector:"[Sector]", since:"", work:"" },{ name:"[Client logo]", sector:"[Sector]", since:"", work:"" },
        { name:"[Client logo]", sector:"[Sector]", since:"", work:"" },{ name:"[Client logo]", sector:"[Sector]", since:"", work:"" },
        { name:"[Client logo]", sector:"[Sector]", since:"", work:"" },{ name:"[Client logo]", sector:"[Sector]", since:"", work:"" },
        { name:"[Client logo]", sector:"[Sector]", since:"", work:"" },{ name:"[Client logo]", sector:"[Sector]", since:"", work:"" }
      ] },
      { id:"w4", type:"timeline", num:"03", eyebrow:"How we bring it together", text:"Every brief has its own audience, priorities, and practical considerations. We start by understanding those differences.", flowId:"f-process" }
    ] },
    { id:"blog", title:"Blog", nav:true, layout:"cinematic", sections:[
      { id:"b1", type:"hero", num:"05", eyebrow:"Blog", title:"Ideas, guides and work in progress", lede:"Notes from the Agency and the production floor.", media:"m-nebula", height:"compact", flowId:"" },
      { id:"b2", type:"blog", title:"Latest posts", category:"", limit:12, filters:true, style:"grid" }
    ] },
    { id:"about", title:"About", nav:true, layout:"console", sections:[
      { id:"c1", type:"hero", num:"04", eyebrow:"About Dorma", title:"Your objectives give our work direction.", lede:"", media:"m-ridges", height:"tall", flowId:"" },
      { id:"c2", type:"about", num:"01", eyebrow:"Mission", text:"To understand each client's needs and bring together *creative thinking and practical execution* to deliver purposeful brand solutions.", media:"", link:{ label:"", action:A() } },
      { id:"c3", type:"about", num:"02", eyebrow:"Vision", text:"To be the partner businesses turn to when they need to *connect an idea with its execution*.", media:"", link:{ label:"", action:A() } },
      { id:"c4", type:"timeline", num:"03", eyebrow:"Values", text:"Five values, and what each one means in practice.", flowId:"f-values" },
      { id:"c5", type:"stats", num:"04", eyebrow:"Dorma at a glance", style:"meters", items:[
        { label:"Years since 2000", value:26, suffix:"", decimals:0, meter:65 },
        { label:"Divisions", value:2, suffix:"", decimals:0, meter:30 },
        { label:"Agency service areas", value:5, suffix:"", decimals:0, meter:50 },
        { label:"Gift product groups", value:4, suffix:"", decimals:0, meter:40 }
      ] },
      { id:"c6", type:"accordion", num:"05", eyebrow:"Two divisions", items:[
        { title:"Agency", tags:["Concepts","Design","Content","Events","Digital"], text:"Develop the idea, shape the message, and plan the experience.", media:"m-ridges-2", more:{ label:"Explore the Agency", action:A("page","agency") } },
        { title:"Printing & Production", tags:["Print","Signage","Fabrication","Booths","Gifts & Displays"], text:"Turn the idea into printed materials, branded spaces, displays, and products.", media:"m-city-2", more:{ label:"Explore Printing & Production", action:A("page","production") } }
      ] },
      { id:"c7", type:"cta", title:"What are you planning next? Let's bring it to life.", button:{ label:"Contact Dorma", action:A("modal","md-contact") } }
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
  libKinds: [["","All"],["image","Images"],["video","Videos"],["article","Articles"],["scene","Scenes"]],
  kinds: [["button","Button"],["text","Plain text"],["icon","Icon"],["svg","Custom SVG"]],
  sizes: [["s","Small"],["m","Medium"],["l","Large"]],
  actions: [["none","Nothing"],["modal","Open modal"],["page","Go to page"],["post","Open blog post"],["doc","Open library article"],["slide","Go to slide"],["url","Open link"]],
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
    ["flowId","flow","Default flow (for slides without their own)"],
    ["hud","toggle","Show counter and timecode"],
    ["timing","timing","Timing for every slide",{parts:[["eyebrow",.05],["title",0],["text",.5],["flow",1.5],["stagger",.2]],hint:"Seconds from when each slide starts. By default the title comes first, the short paragraph 0.5s later, then the flow buttons 1s after that, one by one (Gap between flow items). Each slide can override these below."}],
    ["replayFlow","toggle","Replay the flow animation on every slide, even when it is the same flow"],
    ["slides","list","Slides",{ title:"title", fields:[["eyebrow","text","Eyebrow"],["title","text","Title"],["lede","area","Short paragraph",{wide:true}],["flowId","flow","This slide's flow (buttons under the text; empty uses the default)"],["timing","timing","This slide's timing",{parts:[["duration",null],["eyebrow",null],["title",null],["text",null],["flow",null],["stagger",null]],hint:"Seconds on screen, and when each piece starts. Empty follows the section timing and Animation → Seconds per slide."}],["media","media","Background image",{wide:true}]], blank:()=>({eyebrow:"New",title:"New slide",lede:"",media:"m-nebula"}) }]
  ]},
  hero: { label:"Hero", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["title","text","Title",{wide:true}],["lede","area","Short paragraph",{wide:true}],["height","select","Height",{options:OPT.heights}],["flowId","flow","Flow"],["media","media","Background image",{wide:true}],["timing","timing","Timing",{parts:[["eyebrow",.1],["title",.15],["text",.2],["flow",.4]],hint:"Seconds from when the page opens. Empty uses the default shown. Lower numbers come first."}]] },
  chapters: { label:"Chapters", fields:[["items","list","Chapters",{ title:"title", fields:[["title","text","Title"],["text","area","Text",{wide:true}],["bullets","strings","Bullet points (one per line)",{wide:true}],["caption","strings","Caption items (one per line)",{wide:true}],["more","button","More button"],["media","media","Image",{wide:true}]], blank:()=>({title:"New chapter",text:"",bullets:[],caption:[],media:"m-ridges",more:{label:"More",action:A()}}) }]] },
  stats: { label:"Numbers", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["style","select","Style",{options:OPT.statStyles}],["items","list","Figures",{ title:"label", fields:[["label","text","Label"],["value","number","Value"],["suffix","text","Suffix"],["decimals","number","Decimals"],["meter","range","Meter %",{min:0,max:100,step:1}]], blank:()=>({label:"New figure",value:10,suffix:"",decimals:0,meter:50}) }]] },
  about: { label:"About", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["text","area","Statement (wrap words in *stars* to highlight)",{wide:true}],["link","button","Link"],["media","media","Image (optional)",{wide:true,allowNone:true}]] },
  clients: { label:"Clients", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["style","select","Style",{options:OPT.clientStyles}],["items","list","Clients",{ title:"name", fields:[["name","text","Name"],["sector","text","Sector"],["since","text","Since"],["work","text","Work"]], blank:()=>({name:"New client",sector:"",since:"",work:""}) }]] },
  grid: { label:"Card grid", fields:[["title","text","Heading"],["filters","toggle","Show tag filters as a flow"],["items","list","Cards",{ title:"title", fields:[["code","text","Code"],["tag","text","Tag"],["title","text","Title"],["text","area","Text",{wide:true}],["action","action","On click"],["media","media","Image",{wide:true}]], blank:()=>({code:"X-00",tag:"Tag",title:"New card",text:"",media:"m-city",action:A()}) }]] },
  accordion: { label:"Accordion", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["items","list","Rows",{ title:"title", fields:[["title","text","Title"],["tags","strings","Tags (one per line)"],["text","area","Text",{wide:true}],["more","button","More button"],["media","media","Image",{wide:true}]], blank:()=>({title:"New row",tags:[],text:"",media:"m-ocean",more:{label:"More",action:A()}}) }]] },
  timeline: { label:"Timeline", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["text","area","Statement",{wide:true}],["flowId","flow","Timeline flow (each item's detail text shows on click)"],["timing","timing","Timing",{parts:[["eyebrow",0],["text",.1],["flow",.2],["detail",.5]]}]] },
  flowStrip: { label:"Flow strip", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["title","text","Heading",{wide:true}],["flowId","flow","Flow"],["timing","timing","Timing",{parts:[["eyebrow",0],["title",.1],["flow",.2]]}]] },
  banner: { label:"Wide banner", fields:[["caption","strings","Caption items (one per line)",{wide:true}],["media","media","Image",{wide:true}]] },
  cta: { label:"Call to action", fields:[["title","text","Heading",{wide:true}],["button","button","Button"]] },
  blog: { label:"Blog posts", fields:[["title","text","Heading",{wide:true}],["category","category","Only this category",{allowAll:true}],["limit","number","Most posts to show"],["filters","toggle","Show category filters as a flow"],["style","select","Style",{options:[["grid","Cards"],["list","List"]]}]] },
  article: { label:"Text article", fields:[["num","text","Number"],["eyebrow","text","Eyebrow"],["title","text","Heading",{wide:true}],["body","prose","Text",{wide:true}]] }
};
const SECTION_BLANK = {
  heroCarousel:()=>({flowId:"",hud:true,timing:{},replayFlow:false,slides:[{eyebrow:"New",title:"New slide",lede:"",media:"m-nebula"}]}),
  hero:()=>({num:"",eyebrow:"Eyebrow",title:"New hero",lede:"",media:"m-nebula",height:"tall",flowId:""}),
  chapters:()=>({items:[]}), stats:()=>({num:"",eyebrow:"",style:"band",items:[]}),
  about:()=>({num:"",eyebrow:"About",text:"A short statement.",media:"",link:{label:"",action:A()}}),
  clients:()=>({num:"",eyebrow:"Clients",style:"grid",items:[]}), grid:()=>({title:"Cards",filters:true,items:[]}),
  accordion:()=>({num:"",eyebrow:"",items:[]}), timeline:()=>({num:"",eyebrow:"Story",text:"",flowId:""}),
  flowStrip:()=>({num:"",eyebrow:"",title:"",flowId:""}), banner:()=>({caption:[],media:"m-ocean"}),
  cta:()=>({title:"Have a project in mind?",button:{label:"Get in touch",action:A()}}),
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
  return out;
}

export { normalize, A, STARTER, OPT, ACTION_FIELDS, SECTION_TYPES, SECTION_BLANK };
