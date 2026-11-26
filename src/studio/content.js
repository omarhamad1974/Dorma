/* ================= SITE CONTENT (bilingual handoff) =================
   Copy and hierarchy from the Dorma bilingual content handoff (EN/AR). Every visitor-facing text is {en,ar}.
   Service hierarchy: division summary → service modal → full service page (with a quote request at the bottom).
   Fictional clients and testimonials are flagged previewOnly: they show in the studio preview, never to visitors. */
const A = (type="none",target="",section="") => section?{type,target,section}:{type,target};
const T = (en,ar) => ({en,ar});

/* ---------- services: [id, division, name, summary, modal brief, page headline, subsections, image] ---------- */
const SV = [
  ["creative-design","agency",T("Creative & Design","الإبداع والتصميم"),
    T("Naming, copywriting, identities, and design for print and web.","التسمية وكتابة المحتوى والهوية وتصميم المطبوعات والمواقع."),
    T("Dorma develops the message and visual identity, then adapts them to the places your audience sees them.","تطوّر دورما الرسالة والهوية البصرية وتطبّقهما عبر نقاط التواصل مع جمهورك."),
    T("Give your brand a name, voice, and look that fit together.","امنح علامتك اسماً وصوتاً وهويةً متناسقة."),
    [["Naming","التسمية"],["Copywriting","كتابة المحتوى"],["Campaign concepts","أفكار الحملات"],["Brand identity and guidelines","الهوية ودليل استخدامها"],["Print design","تصميم المطبوعات"],["Web design","تصميم المواقع"]],"m-nebula-2","i-spark"],
  ["photo-video-music","agency",T("Photography, Video & Music","التصوير والفيديو والموسيقى"),
    T("Corporate films and social videos, from storyboard to final edit.","أفلام الشركات وفيديوهات التواصل، من لوحة المشاهد إلى المونتاج."),
    T("We write, storyboard, film, and edit, with photography and original music available.","نكتب السيناريو ونعدّ لوحة المشاهد ونصوّر وننفّذ المونتاج، مع توفير التصوير الفوتوغرافي والموسيقى الأصلية."),
    T("Show people how your company works.","عرّف جمهورك على عمل شركتك."),
    [["Corporate films","أفلام الشركات"],["Social media videos","فيديوهات التواصل الاجتماعي"],["Scriptwriting and storyboards","السيناريو ولوحات المشاهد"],["Photography","التصوير الفوتوغرافي"],["Editing and montage","التحرير والمونتاج"],["Music composition and production","تأليف وإنتاج الموسيقى"]],"m-ocean-2","i-camera"],
  ["digital-marketing","agency",T("Digital Marketing & Social Media","التسويق الرقمي وإدارة التواصل الاجتماعي"),
    T("Strategy, content, publishing, paid ads, and reporting.","الاستراتيجية والمحتوى والنشر والإعلانات المدفوعة والتقارير."),
    T("Dorma plans what to say, creates the content, manages publishing and responses, and reports monthly.","تخطط دورما للرسائل وتنتج المحتوى وتدير النشر والردود وتقدّم تقارير شهرية."),
    T("Give every channel a clear role.","امنح كل قناة دوراً واضحاً."),
    [["Online strategy","استراتيجية التسويق الرقمي"],["Content planning and production","تخطيط المحتوى وإنتاجه"],["Scheduling and publishing","الجدولة والنشر"],["Comments and messages","التعليقات والرسائل"],["Paid social ads","الإعلانات المدفوعة"],["Monthly reports","التقارير الشهرية"],["Social media packages","باقات التواصل الاجتماعي"]],"m-ridges-2","i-screen"],
  ["websites-apps","agency",T("Websites & Mobile Apps","المواقع الإلكترونية وتطبيقات الهواتف"),
    T("Design, development, launch, website hosting, and maintenance.","التصميم والتطوير والإطلاق واستضافة المواقع والصيانة."),
    T("Dorma plans, builds, and launches websites and apps, with website hosting and ongoing maintenance available.","تخطط دورما للمواقع والتطبيقات وتطوّرها وتطلقها، مع توفير استضافة المواقع والصيانة المستمرة."),
    T("Make the next step easy online.","سهّل الخطوة التالية لعملائك عبر الإنترنت."),
    [["Website planning and content","تخطيط المواقع ومحتواها"],["Website development and launch","تطوير المواقع وإطلاقها"],["App design and development","تصميم التطبيقات وتطويرها"],["App launch","إطلاق التطبيقات"],["Website hosting","استضافة المواقع"],["Maintenance","الصيانة"],["Website packages","باقات المواقع"]],"m-city-2","i-screen"],
  ["event-logistics","agency",T("Event & Activation Logistics","لوجستيات الفعاليات والتنشيط التسويقي"),
    T("Delivery, setup, staffing, and on-site support.","التسليم والتركيب وتوفير الفرق والدعم الميداني."),
    T("Dorma coordinates materials, crews, and equipment from delivery to teardown, based on the project scope.","تنسّق دورما المواد والفرق والمعدات من التسليم حتى الفك وفق نطاق المشروع."),
    T("Get your venue ready for event day.","جهّز موقعك ليوم الفعالية."),
    [["Delivery and distribution","التسليم والتوزيع"],["Assembly and disassembly","التركيب والفك"],["Activation staffing and training","توفير فرق التنشيط وتدريبها"],["Ushering","استقبال الضيوف وإرشادهم"],["Screens, lighting, and sound","الشاشات والإضاءة والصوت"],["Interpretation and translation","الترجمة الفورية والتحريرية"]],"m-city","i-truck"],
  ["printing-finishing","print",T("Printing & Finishing","الطباعة والتشطيبات"),
    T("In-house digital, offset, large-format, and UV printing with finishing.","طباعة رقمية وأوفست وطباعة مقاسات كبيرة وأشعة فوق بنفسجية مع تشطيبات داخلية."),
    T("Experienced staff use modern equipment to print, cut, and finish materials in-house.","ينفّذ فريقنا عمليات الطباعة والقص والتشطيب داخلياً باستخدام معدات حديثة."),
    T("Choose the right print and finish.","اختر الطباعة والتشطيب المناسبين."),
    [["Digital printing","الطباعة الرقمية"],["Offset printing","طباعة الأوفست"],["Large-format printing","طباعة المقاسات الكبيرة"],["UV printing","الطباعة بالأشعة فوق البنفسجية"],["Print & Cut","الطباعة والقص"],["Lamination","التغليف الحراري"],["Die-cutting","القص بالقوالب"],["Binding","التجليد"],["Foiling","التشطيب بالرقائق المعدنية"],["Embossing","البروز"]],"m-ridges","i-print"],
  ["giveaways","print",T("Giveaways & Branded Merchandise","الهدايا والمنتجات الدعائية"),
    T("Branded items, corporate gifts, and complete event kits.","منتجات دعائية وهدايا للشركات ومجموعات متكاملة للفعاليات."),
    T("Choose individual items or complete sets. Dorma can source or manufacture, brand, pack, and deliver them.","اختر منتجات منفردة أو مجموعات متكاملة، وتتولى دورما توفيرها أو تصنيعها ووضع العلامة عليها وتغليفها وتسليمها."),
    T("Give people something they’ll keep.","قدّم هدية يرغب الناس في الاحتفاظ بها."),
    [["Item selection","اختيار المنتجات"],["Custom manufacturing","التصنيع حسب الطلب"],["Logo branding and personalization","إضافة الشعار والتخصيص"],["Corporate gifts","هدايا الشركات"],["Event kits","مجموعات الفعاليات"],["Notebooks, bags, caps, and T-shirts","دفاتر وحقائب وقبعات وقمصان"],["Packaging and distribution","التغليف والتوزيع"]],"m-nebula","i-gift"],
  ["packaging","print",T("Packaging","التغليف"),
    T("Paper and cardboard packaging for gifts and campaign kits.","تغليف ورقي وكرتوني للهدايا ومجموعات الحملات."),
    T("Dorma makes gift boxes, sleeves, and inserts and assembles sets for delivery or distribution.","تنتج دورما علب الهدايا والأغلفة والفواصل الداخلية، وتجمع المجموعات للتسليم أو التوزيع."),
    T("Design the package around what’s inside.","صمّم العبوة بما يناسب محتواها."),
    [["Cardboard boxes","علب كرتونية"],["Paper sleeves and wraps","أغلفة ورقية"],["Cardboard inserts","فواصل كرتونية"],["Printing and finishing","الطباعة والتشطيبات"],["Kit assembly","تجميع المجموعات"]],"m-ridges-2","i-box"],
  ["signage-displays","print",T("Signage & Displays","اللافتات ووحدات العرض"),
    T("Corporate, retail, and illuminated signage with surveys and installation.","لافتات للشركات والمتاجر، بما فيها اللافتات المضيئة، مع المعاينة والتركيب."),
    T("Dorma surveys the site, produces signage and displays, and installs them where needed.","تعاين دورما الموقع وتنتج اللافتات ووحدات العرض وتركّبها حسب الحاجة."),
    T("Make your brand easy to spot.","اجعل علامتك سهلة التمييز."),
    [["Corporate and retail signage","لافتات الشركات والمتاجر"],["Wayfinding","اللافتات الإرشادية"],["Illuminated signage","اللافتات المضيئة"],["Acrylic and foam displays","وحدات عرض من الأكريليك والفوم"],["Vehicle decals and partial vinyl graphics","ملصقات المركبات وتغطية الفينيل الجزئية"],["Site surveys","معاينة المواقع"],["Permanent installation","التركيب الدائم"]],"m-city-2","i-sign"],
  ["in-store-branding","print",T("In-Store Branding","الهوية البصرية للمتاجر"),
    T("Wall graphics, façades, signage, displays, and décor.","رسومات الجدران والواجهات واللافتات ووحدات العرض والديكور."),
    T("Refresh a display or brand the full store. 3D mockups are available when required.","جدّد وحدة عرض أو طبّق الهوية على المتجر بالكامل، مع توفير تصورات ثلاثية الأبعاد عند الحاجة."),
    T("Bring your brand into the store.","طبّق هوية علامتك داخل المتجر."),
    [["Wall graphics","رسومات الجدران"],["Storefront façades","واجهات المتاجر"],["In-store signage","اللافتات الداخلية"],["Branded décor","ديكور بهوية العلامة"],["Acrylic and foam displays","وحدات عرض من الأكريليك والفوم"],["Optional 3D mockups","تصورات ثلاثية الأبعاد عند الحاجة"]],"m-city","i-store"],
  ["booth-production","print",T("Booth Production","تصميم وتنفيذ أجنحة المعارض"),
    T("Custom and reusable modular booths, from 3D design to teardown.","أجنحة مخصصة ووحدات قابلة لإعادة الاستخدام، من التصور ثلاثي الأبعاد إلى الفك."),
    T("Review your booth in 3D before Dorma builds, delivers, installs, and dismantles it.","راجع تصور جناحك ثلاثي الأبعاد قبل أن تنفّذه دورما وتسلّمه وتركّبه وتفكّه."),
    T("Give visitors a reason to stop.","امنح الزوار سبباً للتوقف عند جناحك."),
    [["Booth design and 3D visualization","تصميم الأجنحة والتصور ثلاثي الأبعاد"],["Custom booths","أجنحة حسب الطلب"],["Reusable modular booths","أجنحة بوحدات قابلة لإعادة الاستخدام"],["Graphics and signage","الرسومات واللافتات"],["Audiovisual equipment","التجهيزات السمعية والبصرية"],["Delivery, installation and dismantling","التسليم والتركيب والفك"]],"m-nebula-2","i-booth"],
  ["custom-fabrication","print",T("Custom Fabrication","التصنيع حسب الطلب"),
    T("Custom displays, mock-up stands, trophies, and activation pieces.","وحدات عرض وحوامل تجريبية وجوائز وقطع تنشيط حسب الطلب."),
    T("Dorma turns a sketch into a custom piece. Samples, prototypes, and 3D-printed models are available as required.","تحوّل دورما الرسم الأولي إلى قطعة مخصصة، مع توفير عينات ونماذج أولية ومجسمات مطبوعة ثلاثياً حسب الحاجة."),
    T("Build a piece around its purpose.","صنّع القطعة بما يناسب استخدامها."),
    [["Acrylic and foam displays and mock-up stands","وحدات عرض وحوامل تجريبية من الأكريليك والفوم"],["Trophies and activation props","الجوائز وقطع التنشيط"],["Acrylic, foam, wood, cardboard, and fabric","الأكريليك والفوم والخشب والكرتون والقماش"],["Laser engraving","الحفر بالليزر"],["Laser cutting","القطع بالليزر"],["Samples and prototypes","العينات والنماذج الأولية"],["3D-printed models","المجسمات المطبوعة ثلاثياً"]],"m-ridges","i-gear"],
  ["event-accessories","print",T("Event & Activation Accessories","تجهيزات الفعاليات والتنشيط التسويقي"),
    T("Roll-ups, pop-ups, counters, and desks for rent or purchase.","حوامل رول أب وبوب أب ومناضد ومكاتب للإيجار أو الشراء."),
    T("Choose accessories for check-in, demos, and giveaways, with branded graphics and setup available.","اختر تجهيزات التسجيل والعروض وتوزيع الهدايا، مع توفير الرسومات المطبوعة والتركيب."),
    T("Create a branded event setup.","جهّز مساحة فعالية تحمل هويتك."),
    [["Roll-up stands","حوامل رول أب"],["Pop-up stands","حوامل بوب أب"],["Pop-up counters","مناضد بوب أب"],["Event desks","مكاتب الفعاليات"],["Branded graphics","الرسومات المطبوعة بالهوية"],["Rental and purchase","الإيجار والشراء"],["Delivery and setup","التسليم والتركيب"]],"m-ocean","i-booth"]
].map(([id,div,name,summary,brief,headline,subs,media,icon])=>({id,div,name,summary,brief,headline,subs,media,icon}));

const DIV = { agency:T("Agency","خدمات الوكالة"), print:T("Print & Production","الطباعة والإنتاج") };
const L = {
  explore:T("Explore Service","استكشف الخدمة"), quote:T("Request a Quote","اطلب عرض سعر"), services:T("Services","الخدمات"),
  about:T("About Dorma","عن دورما"), news:T("News & Insights","الأخبار والمقالات"), home:T("Home","الرئيسية")
};
const join = (a,b) => T(a.en+" "+b.en, a.ar+" "+b.ar);
const quoteSection = (id,service,text=T("","")) => ({ id, type:"quote", anchor:"quote", eyebrow:L.quote, title:L.quote, text, service, bgfx:{type:"grid"} });

/* ---------- flows ---------- */
const FLOWS = [
  { id:"f-process", name:"Default process flow", separator:"dots3", size:"m", progress:false, display:"row",
    items:[
      { id:"pf1", kind:"note", label:T("Briefing","موجز المشروع"), icon:"i-ear", svg:"", showIndex:false, detail:"", action:A(), anim:null, dots:true },
      { id:"pf2", kind:"text", label:T("Plan","التخطيط"), icon:"i-idea", svg:"", showIndex:false, detail:"", action:A(), anim:null },
      { id:"pf3", kind:"text", label:T("Resource Allocation","تخصيص الموارد"), icon:"", svg:"", showIndex:false, detail:"", action:A(), anim:null },
      { id:"pf4", kind:"button", label:T("Process","التنفيذ"), icon:"", svg:"", showIndex:false, detail:"", action:A("modal","md-quote"), anim:null }
    ] },
  { id:"f-services", name:"Sample service flow", separator:"dots3", size:"m", progress:false, display:"row",
    items:[
      { id:"sf1", kind:"button", label:T("Printing","الطباعة"), icon:"", svg:"", showIndex:false, detail:"", action:A("modal","md-printing-finishing"), anim:null },
      { id:"sf2", kind:"text", label:T("Giveaways","الهدايا"), icon:"i-gift", svg:"", showIndex:false, detail:"", action:A("modal","md-giveaways"), anim:null },
      { id:"sf3", kind:"text", label:T("Packaging","التغليف"), icon:"", svg:"", showIndex:false, detail:"", action:A("modal","md-packaging"), anim:null },
      { id:"sf4", kind:"button", label:T("Event Logistics","لوجستيات الفعاليات"), icon:"", svg:"", showIndex:false, detail:"", action:A("modal","md-event-logistics"), anim:null }
    ] },
  /* Agency page sample tabs: each tab switches the panel; the panel button opens the service modal */
  { id:"f-agency-tabs", name:"Agency tabs", separator:"dots3", size:"m", progress:false, display:"tabs",
    items:[
      { id:"at1", kind:"button", label:T("Creative Design","التصميم الإبداعي"), icon:"", svg:"", showIndex:false, detail:SV[0].summary, media:"m-nebula-2", ctaLabel:L.explore, action:A("modal","md-creative-design"), anim:null },
      { id:"at2", kind:"button", label:T("Digital Marketing","التسويق الرقمي"), icon:"", svg:"", showIndex:false, detail:SV[2].summary, media:"m-ridges-2", ctaLabel:L.explore, action:A("modal","md-digital-marketing"), anim:null },
      { id:"at3", kind:"button", label:T("Video Production","إنتاج الفيديو"), icon:"", svg:"", showIndex:false, detail:SV[1].summary, media:"m-ocean-2", ctaLabel:L.explore, action:A("modal","md-photo-video-music"), anim:null },
      { id:"at4", kind:"button", label:T("Event Logistics","لوجستيات الفعاليات"), icon:"", svg:"", showIndex:false, detail:SV[4].summary, media:"m-city", ctaLabel:L.explore, action:A("modal","md-event-logistics"), anim:null }
    ] },
  /* About: mission, vision and values, each icon reveals its part of the section */
  { id:"f-mvv", name:"Mission, vision and values", separator:"dots3", size:"m", progress:false, display:"reveal",
    items:[
      { id:"mv1", kind:"text", label:T("Mission","الرسالة"), icon:"i-check", svg:"", showIndex:false, detail:T("Carry the client's message from concept to finished work.","تحويل رسالة العميل إلى عمل متكامل، من الفكرة إلى التنفيذ."), action:A(), anim:null },
      { id:"mv2", kind:"text", label:T("Vision","الرؤية"), icon:"i-idea", svg:"", showIndex:false, detail:T("Be the partner brands turn to for design, production, and delivery.","أن نكون الشريك الذي تعتمد عليه العلامات التجارية في التصميم والإنتاج والتسليم."), action:A(), anim:null },
      { id:"mv3", kind:"text", label:T("Values","القيم"), icon:"i-care", svg:"", showIndex:false, detail:T("Attention to detail, clear communication, responsiveness, and ownership.","الاهتمام بالتفاصيل، ووضوح التواصل، وسرعة الاستجابة، وتحمل المسؤولية."), action:A(), anim:null }
    ] }
];

/* ---------- modals: one per service (name as title, brief, optional image, link to the full page) + the quote request ---------- */
const MODALS = [
  ...SV.map(s=>({ id:"md-"+s.id, name:s.name.en, type:1, kicker:DIV[s.div], title:s.name, text:s.brief, media:[s.media], caption:[DIV[s.div],s.name], flowId:"",
    more:{ label:L.explore, action:A("page",s.id) } })),
  { id:"md-quote", name:"Request a Quote", type:5, kicker:T("Dorma Advertising","دورما للإعلان"), title:L.quote, text:T("",""), media:[], caption:[], flowId:"",
    sections:[ {...quoteSection("mq1",T("","")), eyebrow:T("",""), title:T("",""), bgfx:{type:"none"}} ], more:{ label:T("",""), action:A() } }
];

/* ---------- pages ---------- */
const svcPage = s => ({ id:s.id, title:s.name, nav:false, layout:"cinematic", sections:[
  { id:s.id+"-hero", type:"hero", num:"", eyebrow:DIV[s.div], title:s.headline, lede:join(s.summary,s.brief), media:s.media, height:"tall", flowId:"",
    button:{ label:L.quote, action:A("page",s.id,"quote") } },
  { id:s.id+"-subs", type:"features", anchor:"services", num:"", eyebrow:s.name, title:L.services, text:T("",""), cols:3,
    items:s.subs.map(([en,ar])=>({ title:T(en,ar), text:T("",""), icon:"" })), bgfx:{type:s.div==="print"?"stripes":"contours"} },
  ...(s.id==="giveaways"?[{ id:"gv-catalogs", type:"division", anchor:"catalogs", num:"", eyebrow:T("Catalogs","الكتالوجات"), title:T("Business Giveaways & Packages · Personalized Gifts","الهدايا والباقات للشركات · الهدايا المخصصة للأفراد"), text:T("",""), media:"m-ridges-2", flip:true, button:{label:T("",""),action:A()},
      items:[ { title:T("Business Giveaways & Packages","الهدايا والباقات للشركات"), text:T("Browse individual items and packages for events, campaigns, client gifts, and employee kits.","تصفّح المنتجات والباقات للفعاليات والحملات وهدايا العملاء ومجموعات الموظفين."), action:A("page","business-giveaways") },
              { title:T("Personalized Gifts","الهدايا المخصصة للأفراد"), text:T("Choose an item or gift set.","اختر منتجاً أو مجموعة هدايا."), action:A("page","personalized-gifts") } ] }]:[]),
  quoteSection(s.id+"-quote",s.name)
] });
const catalogPage = (id,title,text,media) => ({ id, title, nav:false, layout:"cinematic", sections:[
  { id:id+"-hero", type:"hero", num:"", eyebrow:SV[6].name, title, lede:text, media, height:"compact", flowId:"", button:{ label:L.quote, action:A("page",id,"quote") } },
  { id:id+"-cat", type:"catalog", anchor:"catalog", title, text:T("",""), filters:[T("Item Type","نوع المنتج"),T("Package Type","نوع الباقة"),T("Price Range","نطاق السعر")], items:[] },
  quoteSection(id+"-quote",title,text)
] });
const svcItems = div => SV.filter(s=>s.div===div).map(s=>({ title:s.name, text:s.summary, action:A("modal","md-"+s.id) }));

const PAGES = [
  { id:"home", title:L.home, nav:true, layout:"cinematic", sections:[
    { id:"s-hc", type:"heroCarousel", flowId:"f-process", hud:true, timing:{}, replayFlow:false, autoplay:true, slides:[
      { eyebrow:T("Dorma Advertising","دورما للإعلان"), title:T("From idea to installation","من الفكرة إلى التركيب"), lede:T("Creative, digital, and in-house production under one roof.","الإبداع والتسويق الرقمي والإنتاج الداخلي تحت سقف واحد."), media:"m-nebula", flowId:"f-process" },
      { eyebrow:DIV.print, title:T("Your event deadline is tight","موعد فعاليتك يقترب"), lede:T("We plan, produce, and deliver around your event date.","نخطط وننتج ونسلّم وفق موعد فعاليتك."), media:"m-city", flowId:"f-services" },
      { eyebrow:DIV.agency, title:T("One campaign, consistent everywhere","حملة واحدة بهوية موحدة"), lede:T("Carry your message across digital channels, print, and events.","قدّم رسالتك بهوية موحدة عبر القنوات الرقمية والمطبوعات والفعاليات."), media:"m-ridges", flowId:"f-process" },
      { eyebrow:DIV.print, title:T("Your launch materials, ready on time","تجهيزات إطلاقك في موعدها"), lede:T("We print, pack, and deliver to one schedule.","نطبع ونغلّف ونسلّم وفق جدول واحد."), media:"m-ocean", flowId:"f-services" }
    ] },
    { id:"h-about", type:"division", anchor:"about", num:"01", eyebrow:L.about, title:T("An agency and in-house production house, with 20 years of experience.","وكالة ودار إنتاج داخلي بخبرة تمتد إلى 20 عاماً."), text:T("",""),
      media:"m-nebula-2", flip:false, button:{ label:L.about, action:A("page","about") }, items:[], bgfx:{type:"contours"} },
    { id:"h-agency", type:"division", anchor:"agency", num:"02", eyebrow:DIV.agency, title:T("Strategy, design, digital content, and event logistics.","الاستراتيجية والتصميم والمحتوى الرقمي ولوجستيات الفعاليات."), text:T("",""),
      media:"m-ridges", flip:true, button:{ label:DIV.agency, action:A("page","agency") }, items:svcItems("agency"), bgfx:{type:"orbits"} },
    { id:"h-print", type:"division", anchor:"print", num:"03", eyebrow:DIV.print, title:T("Printing, packaging, signage, giveaways, booths, and custom fabrication.","الطباعة والتغليف واللافتات والهدايا وأجنحة المعارض والتصنيع حسب الطلب."), text:T("",""),
      media:"m-city", flip:false, button:{ label:DIV.print, action:A("page","print") }, items:svcItems("print"), bgfx:{type:"stripes"} },
    { id:"h-news", type:"division", anchor:"news", num:"04", eyebrow:L.news, title:T("Explore recent work and practical guides for your next project.","اطّلع على أحدث الأعمال والأدلة العملية لمشروعك المقبل."), text:T("",""),
      media:"m-ocean-2", flip:true, button:{ label:L.news, action:A("page","news") }, items:[], bgfx:{type:"grid"} },
    { id:"h-cta", type:"cta", title:T("From idea to installation","من الفكرة إلى التركيب"), button:{ label:L.quote, action:A("modal","md-quote") }, bgfx:{type:"goo"} }
  ] },
  { id:"about", title:L.about, nav:true, layout:"cinematic", sections:[
    { id:"ab-hero", type:"hero", num:"", eyebrow:L.about, title:T("From the first brief to finished work.","من موجز المشروع إلى العمل الجاهز."),
      lede:T("Dorma brings agency services and in-house print and production together, from concept and design to manufacturing, delivery, and setup.","تجمع دورما بين خدمات الوكالة والطباعة والإنتاج الداخلي، من الفكرة والتصميم إلى التصنيع والتسليم والتركيب."), media:"m-ridges", height:"tall", flowId:"" },
    { id:"ab-numbers", type:"stats", anchor:"numbers", num:"", eyebrow:T("Dorma in numbers","دورما بالأرقام"), style:"band", bgfx:{type:"waves"}, items:[
      { label:T("Years of experience","عاماً من الخبرة"), value:20, suffix:"", decimals:0, meter:60 },
      { label:T("Team members","عضواً في الفريق"), value:150, suffix:"+", decimals:0, meter:80 },
      { label:T("Clients served","عميلاً"), value:50, suffix:"+", decimals:0, meter:50 } ] },
    { id:"ab-mvv", type:"flowStrip", anchor:"mission", num:"", eyebrow:T("Mission · Vision · Values","الرسالة · الرؤية · القيم"), title:T("",""), flowId:"f-mvv", bgfx:{type:"orbits"} },
    { id:"ab-clients", type:"clients", anchor:"clients", previewOnly:true, num:"", eyebrow:T("Clients and testimonials","العملاء وآراؤهم"), style:"table", items:[
      { name:"Northline Retail", sector:"", since:"", work:T("Storefront and window branding","هوية الواجهات وواجهات العرض") },
      { name:"Arden Foods", sector:"", since:"", work:T("Launch kits and packaging","مجموعات الإطلاق والتغليف") },
      { name:"Fieldstone Technologies", sector:"", since:"", work:T("Exhibition booth","جناح معرض") } ] },
    { id:"ab-quotes", type:"quotes", previewOnly:true, num:"", eyebrow:T("Sample testimonials","شهادات تجريبية"), items:[
      { quote:T("Dorma coordinated the booth, signage, and delivery around our opening time.","نسّقت دورما الجناح واللافتات والتسليم وفق موعد الافتتاح."), name:"Fieldstone Technologies", role:T("Sample testimonial","شهادة تجريبية") },
      { quote:T("The packaging and branded items felt like one set.","جاء التغليف والمنتجات الدعائية في مجموعة متناسقة."), name:"Arden Foods", role:T("Sample testimonial","شهادة تجريبية") } ] },
    { id:"ab-cta", type:"cta", title:T("From the first brief to finished work.","من موجز المشروع إلى العمل الجاهز."), button:{ label:L.quote, action:A("modal","md-quote") }, bgfx:{type:"goo"} }
  ] },
  { id:"agency", title:DIV.agency, nav:true, layout:"cinematic", sections:[
    { id:"ag-hero", type:"hero", num:"", eyebrow:DIV.agency, title:T("Give your brand a clear direction.","امنح علامتك اتجاهاً واضحاً."),
      lede:T("Dorma develops the idea, message, and design, then carries them into digital channels, print, and live events.","تطوّر دورما الفكرة والرسالة والتصميم، ثم تطبّقها عبر القنوات الرقمية والمطبوعات والفعاليات."), media:"m-nebula", height:"tall", flowId:"",
      button:{ label:L.services, action:A("page","agency","services") } },
    { id:"ag-tabs", type:"flowStrip", anchor:"tabs", num:"", eyebrow:DIV.agency, title:T("",""), flowId:"f-agency-tabs", bgfx:{type:"contours"} },
    { id:"ag-services", type:"division", anchor:"services", num:"", eyebrow:L.services, title:T("Strategy, design, digital content, and event logistics.","الاستراتيجية والتصميم والمحتوى الرقمي ولوجستيات الفعاليات."), text:T("",""),
      media:"m-ridges", flip:false, button:{label:T("",""),action:A()}, items:svcItems("agency"), bgfx:{type:"orbits"} },
    { id:"ag-cta", type:"cta", title:T("Give your brand a clear direction.","امنح علامتك اتجاهاً واضحاً."), button:{ label:L.quote, action:A("modal","md-quote") }, bgfx:{type:"goo"} }
  ] },
  { id:"print", title:DIV.print, nav:true, layout:"cinematic", sections:[
    { id:"pp-hero", type:"hero", num:"", eyebrow:DIV.print, title:T("From artwork to finished pieces.","من التصميم إلى القطعة الجاهزة."),
      lede:T("In-house printing, finishing, and production, with delivery and installation when needed.","طباعة وتشطيبات وإنتاج داخلي، مع التسليم والتركيب عند الحاجة."), media:"m-city", height:"tall", flowId:"f-services",
      button:{ label:L.services, action:A("page","print","services") } },
    { id:"pp-services", type:"division", anchor:"services", num:"", eyebrow:L.services, title:T("Printing, packaging, signage, giveaways, booths, and custom fabrication.","الطباعة والتغليف واللافتات والهدايا وأجنحة المعارض والتصنيع حسب الطلب."), text:T("",""),
      media:"m-city-2", flip:true, button:{label:T("",""),action:A()}, items:svcItems("print"), bgfx:{type:"stripes"} },
    { id:"pp-cta", type:"cta", title:T("From artwork to finished pieces.","من التصميم إلى القطعة الجاهزة."), button:{ label:L.quote, action:A("modal","md-quote") }, bgfx:{type:"goo"} }
  ] },
  { id:"news", title:L.news, nav:true, layout:"cinematic", sections:[
    { id:"nw-hero", type:"hero", num:"", eyebrow:L.news, title:T("Recent projects and practical advice.","أحدث المشاريع ونصائح عملية."),
      lede:T("Explore Dorma’s work and find guides for your next print, production, or event brief.","تعرّف على أعمال دورما واطّلع على أدلة تساعدك في إعداد مشروعك المقبل في الطباعة أو الإنتاج أو الفعاليات."), media:"m-ocean", height:"compact", flowId:"" },
    { id:"nw-posts", type:"blog", anchor:"posts", title:L.news, category:"", limit:12, filters:true, style:"grid" }
  ] },
  ...SV.map(svcPage),
  catalogPage("business-giveaways",T("Business Giveaways & Packages","الهدايا والباقات للشركات"),
    T("Browse individual items and packages for events, campaigns, client gifts, and employee kits. Tell us what you need, the quantity, and the deadline.","تصفّح المنتجات والباقات للفعاليات والحملات وهدايا العملاء ومجموعات الموظفين. حدّد المنتجات والكمية والموعد المطلوب."),"m-nebula"),
  catalogPage("personalized-gifts",T("Personalized Gifts","الهدايا المخصصة للأفراد"),
    T("Choose an item or gift set. Tell us the name, message, or artwork you want to add.","اختر منتجاً أو مجموعة هدايا، وحدّد الاسم أو الرسالة أو التصميم المطلوب إضافته."),"m-ridges-2")
];

/* ---------- News & Insights: suggested titles only. Bodies are placeholders until Dorma supplies approved details, so they stay unpublished. ---------- */
const projectBody = T("## Client Need\n\n[To be supplied by Dorma]\n\n## Services Involved\n\n[To be supplied by Dorma]\n\n## What Dorma Delivered\n\n[To be supplied by Dorma]",
  "## احتياج العميل\n\n[تزوّدنا به دورما]\n\n## الخدمات المشاركة\n\n[تزوّدنا به دورما]\n\n## ما نفّذته دورما\n\n[تزوّدنا به دورما]");
const guideBody = T("## Question\n\n[To be supplied by Dorma]\n\n## Practical Steps\n\n[To be supplied by Dorma]\n\n## Related Services\n\n[To be supplied by Dorma]",
  "## السؤال\n\n[تزوّدنا به دورما]\n\n## الخطوات العملية\n\n[تزوّدنا به دورما]\n\n## الخدمات ذات الصلة\n\n[تزوّدنا به دورما]");
const POSTS = [
  ["empty-floor-to-booth","news",T("From Empty Floor Space to Exhibition Booth","من مساحة فارغة إلى جناح معرض"),"m-city",projectBody],
  ["how-a-launch-kit-came-together","news",T("How a Launch Kit Came Together","كيف أُعدّت مجموعة الإطلاق"),"m-ridges-2",projectBody],
  ["booth-brief-checklist","guides",T("What to Include in Your Booth Brief","ماذا يتضمن موجز تصميم جناحك؟"),"m-nebula-2",guideBody],
  ["giveaways-people-keep","guides",T("How to Choose Giveaways People Keep","كيف تختار هدايا يرغب الناس في الاحتفاظ بها؟"),"m-nebula",guideBody],
  ["lamination-foiling-embossing","guides",T("Lamination, Foiling, or Embossing?","التغليف الحراري أم الرقائق المعدنية أم البروز؟"),"m-ridges",guideBody],
  ["event-logistics-checklist","guides",T("Event Logistics Checklist","قائمة تجهيزات الفعالية"),"m-ocean",guideBody]
].map(([slug,category,title,cover,body],i)=>({ id:"p-"+slug, slug, title, date:"2026-11-"+String(26-i).padStart(2,"0"), category, tags:[], author:"Dorma Advertising", cover, published:false,
  excerpt:T("Placeholder: replace with approved project details before publishing.","نص مؤقت: يُستبدل بتفاصيل معتمدة قبل النشر."), body }));

/* Pages in the site map (in this order); everything else is kept but taken out of the menu by the v3 content update. */
const SITE_MAP = ["home","about","agency","print","news"];
export { SV, DIV, FLOWS, MODALS, PAGES, POSTS, SITE_MAP };
