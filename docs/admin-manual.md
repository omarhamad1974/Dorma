# Dorma studio: quick admin manual

The studio is at **/#admin** on the site (for example `https://omarhamad1974.github.io/Dorma/#admin`). Sign in with your editor account.

## The golden rule: Draft, Preview, Publish

- Every change saves to the **draft** on its own ("Draft saved" at the top).
- **Preview draft** shows the draft site. Visitors do not see it.
- **Publish** makes the draft live. Visitors see it right away.
- Made a mistake after publishing? **Design → Site and titles → Published versions** keeps the last 30. Press **Put in draft** on an older one, check it, then Publish.
- **Design → Site and titles → Backup** copies all settings as text, and can paste a backup back in.

## Where things are

| Tab | Sub-tabs |
|---|---|
| **Content** | Pages, Carousels, Blog, Import |
| **Design** | Global style, Colours and type, Logo, Animation, Site and titles |
| **Flows and modals** | Flows, Modals, Icons |
| **Library** | Library, Missing images |
| **Social** | Create posts, Calendar, Social settings |

Most settings follow a simple chain: **Global style → the item → one slide or one item**. Leave a field empty (or set it to *Global*) to follow the level above. Pick *Custom* to give one thing its own look.

Every "pick a type" choice (section type, ＋ New, background effect, animation, modal type and so on) opens a **visual picker** with a small drawing or a moving preview of each option.

---

## 1. What you can edit

### Pages and sections (Content → Pages)
- Add, delete and rename pages, change their address, choose a layout (Cinematic, Index, Console) and show or hide them in the menu.
- Each page is a stack of **sections**. Add a section from the visual picker, drag to reorder, **hide** (stays saved, not shown), or **duplicate**.
- Section types: Hero, Hero carousel, Chapters, Numbers, About, Clients, Card grid, Accordion, Timeline, Flow strip, Wide banner, Division, Call to action, Feature list, Testimonials, Quote request form, Catalog, Blog posts, Text article.
- Inside each section: all text, images, buttons and what buttons do (open a modal, go to a page, open a post or article, go to a slide, open a link).
- **More options** on a section: a label (so any button can jump to it), a flow under the section, a background effect, its animation, and its own look (spacing, width, background, title font and colours).
- **Header on this page** lets one page have its own header colours.

### Carousels and slides (Content → Carousels)
- All hero carousels in one place. Add, reorder, duplicate, hide slides.
- Each slide: picture, eyebrow, title, paragraph, its own flow, its own colours and filter, and its own timing.
- **Seconds on screen has no maximum**, so a slide can act like a page. Or turn on **Stay on this slide until the visitor moves on**.
- **Move to next slide automatically** can be turned off per carousel.

### Blog (Content → Blog)
- Write posts with simple formatting (`## Heading`, `- list`, `**bold**`, links), insert pictures from the Library, add a cover, tags and summary. Untick **Published** to keep a post as a draft.

### Import (Content → Import)
- Bring in pages, sections, slides, flows, modals, posts or library names from a Markdown file, with a preview first. **Download template** gives a filled-in example.

### Flows, modals and icons (Flows and modals)
- **Flows**: the row of buttons or items under a title. Add items (Button, Text, Icon, Animated note, Custom SVG), give each an action, and choose how the flow behaves: **Row**, **Tabs** or **Reveal**.
- **Modals**: the pop-up panels. Five types: Media, Gallery, Flow, Service list, and Sections (any page sections inside a modal). Edit text, pictures, flow, look, animation and the More button.
- **Icons**: add icons and edit their SVG.

### Design (Design)
- **Global style**: the look for everything at once: text and accent colours, header, menu, image filter, every flow, every carousel and slide, every section, every modal, light and dark mode. Save it as a named **saved style** and switch between styles later.
- **Colours and type**: palettes, My colours, background colours, fonts and sizes for titles, subtitles, body, labels, Arabic and handwriting.
- **Logo**: white, colour and silver logo, your own SVG versions, and the size of the logo in the header, menu, footer and loader.
- **Animation**: overall speed, easing, title reveal, sections on scroll, number count-up, mouse parallax, button glow, modal opening and closing.
- **Site and titles**: brand name, footer, home page, header button, quote email, languages (English, Arabic or both) and numbering, the page loader, page titles, published versions and backup.

### Library (Library)
- All pictures, videos, articles and generated scenes, sorted into **categories** (a category is required).
- Per item: name, tags, alt text, focus point, colour overlay, hide from library.
- **Quick upload** stores files in Supabase. **Picture optimizing** shrinks photos first (resized, saved as WebP, PNG kept for transparent logos). Tick **Keep originals** to skip it once.
- **Missing images** lists every empty slot, placeholder or broken picture on the site with a **Go there** button.
- Image pickers show **pictures not used on the site yet** first.

### Social (Social)
- **Create posts**: pick any text from the site (pages, sections, blog posts, catalog items, flows) and the studio writes ready-to-copy posts for **LinkedIn, Facebook Page and Instagram**, in English and Arabic when the site has Arabic. It suggests a picture, crops it to each platform's size and saves it as a JPG, and can make carousel slides. Press **Add to calendar** to plan it.
- **Calendar**: your posting plan. **Fill empty rhythm days** adds suggestions from the site, or **Suggest a post**. Mark each post drafted, scheduled or posted, and add the link to the live post.
- **Social settings**: platforms on or off, tone and template per platform, call to action, hashtags, carousel slides, the weekly rhythm, and the site address that posts link back to (change it when the site gets its own domain). Optional tracking on links.
- The plan is saved in the studio database for editors only. It is never published on the site.

---

## 2. What you cannot edit in the studio

These need a code change or a change in GitHub or Supabase. Ask for them as a new task.

- **New kinds of things**: new section types, new background effects, new animations, new modal types, new flow behaviours, new fonts beyond the lists offered.
- **The studio itself**: its tabs, fields and layout.
- **Who can edit**: editor accounts are added in Supabase, not in the studio.
- **Library files on GitHub**: adding files to the `public/library/` folders, creating a new category folder, and deleting files is done on GitHub (the studio opens the right GitHub page for you). The site redeploys in about two minutes, then press **Check GitHub for new files**. GitHub takes up to 25 MB per file.
- **Quote requests** open the visitor's email app addressed to your quote email. Nothing is stored on the site, and there is no form inbox.
- **Translation**: the studio does not translate. Write the Arabic yourself in the box next to the English.
- **The real logo SVG**: upload it under Design → Logo once you have it. Until then the PNG is used, and the loader's **Draw** animation needs an SVG.
- **Hosting, domain and Supabase plan**: the site runs on GitHub Pages and the free Supabase plan. Supabase pauses after about a week with no use; it needs waking up in the Supabase dashboard.
- **Posting to social media**: the Social tab writes posts and pictures for you, but it does not post them. You copy the text, save the picture and post it yourself on LinkedIn, Facebook or Instagram.

---

## 3. Animation and effects, part by part

**Where to set it once for everything:** Design → Global style and Design → Animation.
**Where to change one thing:** open that item and pick *Custom*, or change a field that says *Global*.
Always check with **Preview draft** (most panels also have a **Replay** or **Preview** button).

### Timing (who appears when)
- Timing fields are in **seconds from when the slide, section or modal starts**. Lower numbers come first. Empty uses the default shown in grey.
- Found on: Hero, Hero carousel and each slide, Timeline, Flow strip, Division, and Modals.
- Carousel default: title at 0s, paragraph at 0.5s, flow at 1.5s, flow items 0.2s apart (**Gap between flow items**).
- Order of priority for slides: **slide → carousel → Global style → Every carousel and slide**.

### Hero carousel slides
- **Design → Global style → Every carousel and slide**: slide transition (Light wipe, Crossfade, Slide, Zoom through), seconds per slide (any length), slow cinematic zoom (amount and duration), the carousel image filter and slide colours.
- **Content → Carousels**: each carousel and each slide can override timing, colours and filter. **Replay the flow animation on every slide** replays it even when slides share a flow.
- Flows never move slides: each slide tells its own story.

### Titles
- **Design → Animation → Title reveal**: Letter by letter, Word by word, Fade up, Blur in.

### Flows (rows of buttons and items)
- **Design → Global style → Every flow**: animation for all flows.
- **Flows and modals → Flows → Animation and timing**: animate the whole flow at once or each item in turn, animation (Rise, Fade, Scale, Blur, Slide, Flip, Pop, None), duration, gap between items, start delay.
- Each flow item can **Animate this item on its own** with its own animation, duration and extra delay.
- Buttons glow to invite clicks: **Design → Animation → Button glow** (0 turns it off).

### Sections (on scroll)
- **Design → Global style → Section entrance and exit** sets it for all sections.
- One section: **Pages → section → More options → Animation**.
- **Entrance**: Rise, Fade, Scale up, Zoom in, Blur, Slide left or right, Tilt, Skew, Wipe, Circle opens, Open from the centre, Each part in turn.
- **Exit** (as it scrolls away): Fade, Shrink, Blur, Parallax, Darken, Fold back, Slide away.
- Set the entrance length, and **Replay entrance** to play it each time it scrolls into view.
- **Design → Animation → Sections on scroll** and **Count numbers up** are the simple site-wide switches.

### Pictures: reveals, masks and hover
- **Design → Global style → Pictures: masks, reveals and hover**, or per section under **More options → Animation**.
- **Reveal as it scrolls in**: Wipe, Circle, Diamond, Diagonal, Split, Opens from a line, Curtain, Blinds, Shutters, Tiles, CMYK print pass, Soft spotlight, Zoom out of a frame, Blur. Choose the direction, length and cover colour.
- **Shape (mask kept on the picture)**: Rounded, Pill, Arch, Circle, Hexagon, Diamond, Slanted bottom, Cut corners, Leaf, Soft blob.
- **When the pointer is over it**: Slow zoom, 3D tilt, Light follows the pointer, Black and white to colour, Lift with a glow.

### Colour filters on pictures
- **Design → Global style → Image filter**: a colour or gradient over every picture, its strength, dark shade on heroes, brightness and film grain.
- Override per Library item (**Colour overlay**), per carousel or per slide.

### Background effects (animated, behind a section)
- Global: **Design → Global style → Every section → Background effect**. One section: **More options → Background effect**.
- 26 effects, for example Contour lines, Orbits, Spotlight grid, Liquid colour, CMYK stripes, Waves, Halftone, Aurora, Ink in water, Print registration marks, Starfield, Ripples, Floating shapes. The picker plays each one.
- Settings: colours (one, two, or Dorma CMYK), strength, speed, amount, size, direction, where it gathers, reacts to the mouse, and a veil so text stays readable.
- They only run while the section is on screen.

### Modals (pop-ups)
- **Design → Global style → Every modal**, or **Design → Animation → Modals**: opening and closing for all modals.
- One modal: **Flows and modals → Modals → Animation**.
- **Opening**: Scan line, Fade, Scale up, Slide up, Circle from the click, Grow from the click, Wipe, Curtain, Unfold, Diagonal, Flip down, Drop and bounce, Blur, Colour bars, CMYK print pass.
- **Closing**: Match the opening, or Fade, Shrink, Slide down, Circle into the click, and more.
- Look: width, panel colour and strength, blur and page brightness behind, corner marks, scan lines. Modals also have their own **timing**.

### Menu
- **Design → Global style → Header** and **Menu**.
- Header link style (Underline, Line above, Dot, Pill, Brackets, Glow) and hover (Brighten, Line grows, Lift, Glow).
- Full-screen menu **Opening** (Fade, Slide in, Drop, Circle from the button, Curtain, Wipe down, CMYK print pass), how **links arrive** (Rise, Fade, Slide, Grow, Blur, All at once), an animated background, logo and a line at the bottom.
- Tip: preview with a narrow window, or set the menu button to show on every screen.

### Logo and loader
- **Design → Logo → Silver logo**: finish, gradient angle and **Shine** (one sweep, or now and then).
- **Design → Site and titles → Loader**: Reveal, Draw (needs an SVG logo) or Pulse; exit by wipe or fade; minimum time on screen.

### Light and dark mode
- **Design → Global style → Light and dark mode**: what visitors start in (their device, dark or light), show the sun and moon switch, and the light mode colours. Heroes and carousels stay dark.

### Overall feel
- **Design → Animation → Overall speed** speeds up or slows down everything; **Easing** sets the character (sharp, smooth, gentle, overshoot, springy). **Mouse parallax on heroes** adds depth.

---

*Keep it storytelling: flows tell the slide's story, they are not slide navigation. When in doubt, Preview draft before you Publish.*
