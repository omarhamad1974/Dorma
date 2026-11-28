# -*- coding: utf-8 -*-
"""Content of the illustrated Dorma studio manual. build.py turns this into HTML and then a PDF.
Helpers: ch(title, intro) starts a chapter on a new page; sec(title) a section; p(text); steps([...]);
bullets([...]); tip(text); warn(text); fig(image, caption, legend=[...]); where(path)."""

DOC = []
def ch(title, intro=""): DOC.append(("ch", title, intro))
def sec(title): DOC.append(("sec", title))
def sub(title): DOC.append(("sub", title))
def p(t): DOC.append(("p", t))
def where(t): DOC.append(("where", t))
def steps(items): DOC.append(("steps", items))
def bullets(items): DOC.append(("bullets", items))
def tip(t): DOC.append(("tip", t))
def warn(t): DOC.append(("warn", t))
def fig(img, cap, legend=None, w=100): DOC.append(("fig", img, cap, legend or [], w))
def brk(): DOC.append(("brk",))
def table(rows, head=None): DOC.append(("table", rows, head))
def gloss(items): DOC.append(("gloss", items))

# ------------------------------------------------------------------ QUICK START
ch("Quick start", "The five things you will do every time you work on the site.")
steps([
  "<b>Open the studio.</b> Go to the site address and add <code>#admin</code> at the end, for example <code>omarhamad1974.github.io/Dorma/#admin</code>. Sign in with your editor email and password.",
  "<b>Pick a tab on the left</b> (Content, Design, Library…), then a sub-tab along the top (Pages, Carousels, Blog…).",
  "<b>Make your change.</b> There is no Save button. Every change is saved to the <b>draft</b> by itself, and the top bar says <b>Draft saved</b>.",
  "<b>Check it.</b> Press <b>Live preview</b> to see the draft next to the studio while you work, or <b>Preview draft</b> to look at the whole draft site.",
  "<b>Press Publish.</b> Only now do visitors see your changes. If anything goes wrong, Site care → Backups can put any earlier version back.",
])
fig("03-topbar", "The top bar: the buttons you will use most.", [
  "<b>＋ New…</b> adds a page, section, flow, modal or post from anywhere.",
  "<b>View site</b> goes back to the public site, on the page you came from.",
  "<b>Outline</b> shows the whole site on one screen.",
  "<b>Live preview</b> opens a small window with the draft, updating as you type.",
  "<b>Preview draft</b> shows the whole draft site (visitors don't see it).",
  "<b>Publish</b> makes the draft live. It lights up when the draft differs from the live site.",
])
tip("The golden rule: <b>Draft → Preview → Publish</b>. Nothing you do in the studio reaches visitors until you press Publish (client proposals, Inbox and Social are the exceptions: they save straight away and are never published on the site).")
warn("Download a backup file every month and before big changes: <b>Site care → Backups → Download backup</b>.")

# ------------------------------------------------------------------ 1 GETTING STARTED
ch("Getting started", "Signing in, finding your way around the studio, and making it comfortable to read.")
sec("Signing in")
fig("01-signin", "The studio sign-in page.", [
  "Type your <b>email</b>.", "Type your <b>password</b>.", "Press <b>Sign in</b>.",
], w=62)
steps([
  "Open the site and add <code>#admin</code> to the address.",
  "Enter your editor email and password, then press <b>Sign in</b>.",
  "The studio opens on the last tab you used.",
])
bullets([
  "Only <b>editor accounts</b> can open the studio. Editors are added in Supabase, not in the studio. If you see <i>This account isn't an editor</i>, ask the site owner to add you.",
  "Your name appears at the bottom of the side menu (<b>Signed in as …</b>), with <b>Sign out</b> under it.",
  "When you are signed in, the public site can show a small <b>Studio</b> button in its header that only you can see. Switch it on under <b>Design → Site and titles → Brand and header</b> and press Publish.",
])

sec("The studio at a glance")
fig("02-overview", "The studio screen.", [
  "<b>Side menu</b>: the main tabs (Outline, Content, Inbox, Design, Flows and modals, Library, Social, Site care). A yellow number shows unread messages or new proposal opens.",
  "<b>Sub-tabs</b> of the tab you are in.",
  "<b>Status</b>: Draft saved, Saving…, and whether the live site is up to date.",
  "<b>Reading tools</b>: Find, Open all, Close all and text size.",
  "<b>List</b> of items (pages, carousels, posts…). Click one to edit it.",
  "<b>Editor</b> for the selected item, in folding groups.",
])
table([
  ["Outline", "Site outline, Connections"],
  ["Content", "Pages, Carousels, Blog, Proposals, Import, AI writing, AI archive"],
  ["Inbox", "Messages, Form settings"],
  ["Design", "Global style, Colours and type, Logo, Animation, Site and titles"],
  ["Flows and modals", "Flows, Modals, Icons"],
  ["Library", "Library, Missing images, Find photos"],
  ["Social", "Create posts, Calendar, Social settings"],
  ["Site care", "Health check, Backups"],
], head=["Tab", "Sub-tabs"])
tip("Most settings follow one chain: <b>Global style → the item → one slide or one item</b>. Leave a field empty (or set it to <i>Global</i>) to follow the level above. Pick <i>Custom</i> to give one thing its own look.")
p("Every \"pick a type\" choice (section type, ＋ New, background effect, animation, modal type and so on) opens a <b>visual picker</b> with a small drawing or a moving preview of each option.")

sec("Draft, preview and publish")
bullets([
  "Every change saves to the <b>draft</b> on its own. The top bar says <b>Draft saved</b>, and <b>Draft differs from live</b> when you have something to publish.",
  "<b>Preview draft</b> shows the draft site. In Pages it opens the page you have selected. Visitors do not see it.",
  "<b>Publish</b> makes the draft live straight away. Every Publish is kept in <b>Site care → Backups</b> (the last 30 by default).",
  "Made a mistake after publishing? Open <b>Site care → Backups</b>, press <b>Put in draft</b> on an older version, check it, then Publish.",
])

sec("Live preview while you edit")
fig("04-livepreview", "Live preview docked beside the studio.", [
  "<b>Computer or phone width</b>.",
  "<b>Follow what I edit</b>: on, the preview jumps to what you are editing; off, it stays put and you can click around like a visitor.",
  "<b>Reload</b> the preview from scratch.",
  "<b>Dock</b> beside the studio (screens 1200 px and wider) or float it again.",
  "<b>Minimise</b> to just its bar (or double-click the bar).",
  "<b>Close</b> the preview.",
])
steps([
  "Press <b>Live preview</b> in the top bar. A small window opens with the <b>draft</b> site.",
  "Edit as usual. About half a second after each change the window updates.",
  "Drag the bar to move it, drag the bottom-right corner to resize it, or dock it on the right and drag its left edge to change the width.",
])
bullets([
  "It follows what you edit: in Pages it shows the selected page and jumps to a section when you click that section's editor; in Carousels it shows the carousel's page; in Blog the selected post; in Modals it opens the selected modal.",
  "On a phone, a <b>Preview</b> button at the bottom right opens it as a sheet from the bottom.",
  "Its place, size and settings are remembered on this browser only. While it is closed or minimised it does nothing, so the studio stays fast.",
])

sec("Find, folding groups and text size")
p("Next to the sub-tab names there is a small toolbar. It only changes how the studio looks for you, in this browser. Visitors never see it.")
fig("05-find", "Find (or press the / key) searches the groups and settings on the tab.", w=80)
bullets([
  "<b>Groups fold open and closed.</b> Every box with a title is a group. Tap its title or arrow. The studio remembers each choice. Groups most people seldom use start closed.",
  "<b>Open all / Close all</b> open or close every group on the tab.",
  "<b>Find</b> (or press <b>/</b>) lists the groups so you can jump to one, and searches setting names, items and groups as you type. Pick a result and the studio opens it, scrolls to it and makes it blink once.",
  "<b>Colour bands:</b> groups alternate in tone with a coloured edge (blue, yellow, magenta, cyan), and the item you have open has a highlighted border.",
  "<b>Long lists page:</b> lists on the left show 12 at a time, with a filter box once there are more than 8. The Library shows 48 pictures per page. <b>Show all</b> shows everything.",
  "<b>On a phone</b> the list on the left folds into one row; tap it to choose another item.",
])
fig("06-textsize", "Studio text size: from 90% up to 200%.", w=62)
steps([
  "Press <b>A+</b> to make all studio text bigger, or <b>A−</b> to make it smaller.",
  "Or tap <b>Aa</b> and pick a size from the list (Small 90% to Huge 200%).",
])
tip("Text size and <b>Dark mode / Light mode</b> (bottom of the side menu) are saved on this browser only. They never change the public site.")

# ------------------------------------------------------------------ 2 OUTLINE
ch("Outline and Connections", "The whole site on one screen, and a map of what opens what.")
sec("Site outline")
where("Outline → Site outline (or the Outline button in the top bar)")
fig("07-outline", "Every page in menu order, with its sections in the order visitors see them.", [
  "<b>Open all / Close all</b> pages.",
  "<b>Drag the dots</b> (or use the arrows) to reorder pages and sections. Page order is also the menu order.",
  "<b>In menu / Not in menu</b> for pages; <b>Shown / Hidden</b> for sections.",
  "<b>Jump to design</b> opens that page or section in Content → Pages (hero carousels open in Carousels).",
  "<b>＋ Add section</b> opens the visual picker and adds the section at the end of the page.",
])
bullets([
  "The line at the top counts pages, pages in the menu, sections and hidden sections.",
  "The <b>eye</b> previews a page, the <b>two squares</b> duplicate it (the copy gets its own address and stays out of the menu), the <b>cross</b> removes it. The home page can't be removed.",
  "Drag a section onto another open page to move it there. Duplicate puts a copy right below.",
  "<b>＋ Add page</b> at the bottom adds a page from a template (Page, Service page, Catalog page, Article page).",
  "<b>Not live yet</b> marks pages and sections that are in the draft but not published.",
])
tip("Removing asks first, and tells you if any buttons link to that page or section. After any change in Outline, an <b>Undo</b> button appears at the top.")
sec("Connections: what opens what")
where("Outline → Connections")
fig("08-connections", "Every menu link, button, card and flow item, and what it opens.", [
  "<b>What opens what</b>: grouped by page, then modals, then flows.",
  "<b>What opens this</b>: pick a page, modal, flow or post and see everything that opens it.",
  "<b>Problems</b>: links that lead nowhere, buttons with nothing chosen, odd web addresses, and things nothing opens.",
  "<b>Search</b> by any word: a button label, a page or modal name, a flow.",
  "<b>Open</b> goes to the thing it leads to. <b>Edit here</b> opens the button or item itself.",
])
fig("08b-problems", "The Problems view. Here: blog posts that no button opens.")
bullets([
  "When a section shows a flow, that flow's items are listed right under it, so you can follow a chain like <i>Home → hero carousel → flow → Printing button → Printing modal</i>.",
  "Hidden sections and items are still listed, marked <i>hidden</i>.",
])

# ------------------------------------------------------------------ 3 PAGES
ch("Pages and sections", "Each page is a stack of sections. Add, reorder, hide, duplicate and fill them in.")
where("Content → Pages")
sec("Pages")
steps([
  "Pick a page in the list on the left (or press <b>New page</b> under the list).",
  "In <b>Page</b>, set its <b>address</b> (lowercase letters, numbers and hyphens), its <b>title</b> in English and Arabic, its <b>layout</b> (Cinematic, Index, Console) and <b>Show in menu</b>.",
  "<b>Header on this page</b> lets one page have its own header colours.",
  "Press <b>Preview page</b> to see it.",
])
sec("Sections")
fig("09-sections", "The section list of a page.", [
  "<b>Drag the dots</b> to reorder.",
  "<b>Shown / Hidden</b>: hidden sections stay saved but visitors don't see them.",
  "<b>Duplicate</b> the section.",
  "<b>Remove</b> the section.",
  "Click the <b>name</b> to open the section and edit it.",
])
steps([
  "At the bottom of the list, pick a <b>section type</b> from the visual picker.",
  "Press <b>Add section</b>. It is added at the end; drag it into place.",
  "Click its name to open it and fill in the text, pictures and buttons.",
])
fig("11-typepicker", "The visual picker for section types: each type shows a small drawing.")
p("<b>Section types:</b> Hero, Hero carousel, Chapters, Numbers, About, Clients, Card grid, Accordion, Timeline, Flow strip, Wide banner, Division, Call to action, Feature list, Testimonials, Quote request form, Contact form, Catalog, Blog posts, Text article, Photo only, Logo.")
sec("Inside a section")
fig("10-section-open", "An open section: English on the left, Arabic on the right.", [
  "The <b>open section</b>. Click its bar again to close it.",
  "The <b>AI</b> button beside a text box (see the chapter Write with AI).",
])
bullets([
  "All text, pictures and buttons, and what each button does: <b>open a modal</b>, <b>go to a page</b> (and a section on it), <b>open a post or article</b>, <b>go to a slide</b>, or <b>open a link</b>.",
  "An empty button label hides the button.",
  "Pictures are picked from the Library with <b>Change from library</b> (see the Library chapter).",
])
sec("More options")
fig("13-moreoptions", "More options: label, flow, background effect, look and animation.", ["Open <b>More options</b> under the section's own settings."])
bullets([
  "<b>Label</b>: a name so any button can jump to this section (its link is <code>#page/label</code>).",
  "<b>Flow under this section</b>: any flow, as a row, tabs or reveal panels.",
  "<b>Background effect</b>: an animated drawing behind the section (it only runs while the section is on screen), with its colours, strength, speed and a veil so text stays readable.",
  "<b>Look</b> (spacing, width, background, title font and colours) and <b>Animation</b> (entrance, exit, picture reveal).",
])

sec("Icon, text, logo and button")
fig("12-extras", "Icon, text, logo and button: the extras every section has.", ["Open <b>Icon, text, logo and button</b>."])
bullets([
  "<b>Icon by the title</b>: pick an icon, then Before, After or Above the title, its size (1 = as tall as the title), colour and animation (Pop in, Spin in, Draw its lines, Rise, Float, Pulse, Glow, Swing). On Arabic pages \"before\" is on the right.",
  "Cards, accordion rows, chapters, linked items, catalog items and slides each have their own <b>Icon by the title</b> (open the item).",
  "<b>Hide parts</b>: Hide the subtitle, Hide the title, Hide the text. Hidden text stays saved, so switching it off brings it back.",
  "<b>Logo in this section</b>: any logo version above or below the content, with height, phone height, alignment, entrance, a movement that keeps going, a delay and an optional click action.",
  "<b>Button (call to action)</b>: optional line above it, size (Small to Extra large), style (Site button, Solid accent, Outline, Glowing ring, Text with an arrow), place, alignment, entrance, movement and delay.",
  "<b>Heading style and cards</b>: Gradient, Shimmer, Glow, Outline letters, Marker highlight, Underline draws in, CMYK print offset; how the heading arrives; and what cards do under the pointer (Lift, Glow, 3D tilt, Picture zooms, Accent border, Light sweeps across).",
])
tip("The defaults for the whole site are under <b>Design → Global style → Headings, icons and cards</b>. Carousels have the same options under <b>Content → Carousels → Icon, logo, button and title style</b>.")
sec("Photo only and Logo sections")
bullets([
  "<b>Photo only</b>: one Library picture with a <b>mask</b> (Rounded, Pill, Arch, Circle, Hexagon, Diamond, Slanted bottom, Cut corners, Leaf, Soft blob, Frame, fades, Soft oval, Wave, Diagonal stripes, Halftone dots, or <b>Inside a word</b>, where the photo shows through big letters), opacity, height, width, alignment, Fill or Show the whole photo, blur, black and white, slow zoom, movement with the scroll, its own colour filter and an optional caption.",
  "<b>Logo</b>: the logo on its own, any version and height, aligned start, centre or end, with an entrance, a movement and an optional click action.",
])

# ------------------------------------------------------------------ 4 CAROUSELS
ch("Carousels and slides", "The big picture carousels at the top of pages. Each slide tells its own story.")
where("Content → Carousels")
fig("14b-slide", "A carousel's slides. Open a slide to edit its picture, texts, flow and timing.")
steps([
  "Pick the carousel in the list on the left (it shows the page it is on).",
  "Open a slide by clicking its name. Drag to reorder, or use the duplicate and hide buttons on its bar.",
  "Set the <b>background image</b>, <b>eyebrow</b>, <b>title</b> and <b>short paragraph</b> in English and Arabic.",
  "Choose <b>this slide's flow</b> (the buttons under the text). Empty uses the carousel's default.",
])
bullets([
  "<b>Seconds on screen has no maximum</b>, so a slide can act like a page. Or turn on <b>Stay on this slide until the visitor moves on</b>.",
  "<b>Move to next slide automatically</b> can be turned off per carousel.",
  "Each slide can have its own colours and image filter (set <i>This slide's colours and filter</i> to Custom), and its own timing.",
  "Default timing: title at 0 s, paragraph at 0.5 s, flow at 1.5 s, flow items 0.2 s apart (<b>Gap between flow items</b>).",
  "Transition, seconds per slide, slow zoom and slide colours for every carousel are under <b>Design → Global style → Every carousel and slide</b>.",
])
fig("14-carousels", "Image filter for every carousel, with Dorma presets.")
tip("Flows never move slides. Each slide tells its own story. <b>Replay the flow animation on every slide</b> replays it even when slides share a flow.")

# ------------------------------------------------------------------ 5 FLOWS MODALS ICONS
ch("Flows, modals and icons", "The rows of buttons under titles, the pop-up panels, and the icon set.")
sec("Flows")
where("Flows and modals → Flows")
fig("15-flows", "A flow with its live preview.", [
  "<b>New flow</b>.", "<b>Replay animation</b> in the preview.",
])
bullets([
  "A flow is a row of items: <b>Button</b>, <b>Text</b>, <b>Icon</b>, <b>Animated note</b> or <b>Custom SVG</b>. Each item can have an action.",
  "<b>How the items behave</b>: <b>Row</b> (each item runs its own action), <b>Tabs</b> (items switch the visible panel) or <b>Reveal</b> (each item reveals its own part of the section).",
  "<b>Animation and timing</b>: Use global, or Custom: animate the whole flow or each item in turn, the animation (Rise, Fade, Scale, Blur, Slide, Flip, Pop, None), duration, gap and start delay. Each item can also animate on its own.",
  "Use a flow from any section (More options → Flow under this section), any slide or a Type 3 modal.",
])
sec("Modals")
where("Flows and modals → Modals")
fig("16-modals", "A modal: its content, type and preview.", ["<b>Preview modal</b>.", "<b>Type</b>, from a visual picker."])
bullets([
  "Five types: <b>1 Media</b> (one picture or video with a caption), <b>2 Gallery</b>, <b>3 Flow</b>, <b>4 Service list</b>, and <b>5 Sections</b> (any page sections inside a modal).",
  "Edit the text, pictures, flow, look, animation, timing and the <b>More</b> button.",
  "Open a modal from any flow item, card or button with the action <b>Open modal</b>.",
])
sec("Icons")
where("Flows and modals → Icons")
fig("17-icons", "The icon set.", ["<b>New icon</b>: paste SVG code."])
p("Icons are used in flows, buttons, titles and text items. Paste any SVG code; scripts, links and styles are removed automatically. Icons draw in the current text colour.")

# ------------------------------------------------------------------ 6 BLOG IMPORT
ch("Blog and Import", "Writing posts, and bringing lots of content in at once from a file.")
sec("Blog")
where("Content → Blog")
fig("18-blog", "A blog post.", ["<b>New post</b>.", "<b>Preview post</b>."])
steps([
  "Press <b>New post</b>, or pick a post in the list.",
  "Fill in the <b>address</b>, <b>title</b>, <b>date</b>, <b>category</b>, author, tags, a short summary for the list and a cover picture.",
  "Write the body with simple formatting: <code>## Heading</code>, <code>- list</code>, <code>**bold**</code>, links, and pictures from the Library.",
  "Tick <b>Published (visible to visitors)</b> when it is ready, then Publish the site.",
])
tip("Unticked posts are drafts: they only show in Preview draft. Published posts appear on every page that has a <b>Blog posts</b> section, newest first.")
sec("Import from a file")
where("Content → Import (and the Import buttons on each tab)")
fig("19-import", "Import: pick a template, fill it in, bring it in.")
steps([
  "Open <b>Templates</b> and download the one you need (carousel slides, pages and sections, blog posts, flows, modals, library items, colours, icons). Each one is a filled-in example.",
  "Fill it in with any text editor. Keep the notes at the top; they are skipped.",
  "Pick the file. The studio shows a <b>preview</b> of everything before anything changes.",
  "Confirm. The import only changes the draft: Publish when you're happy.",
])

# ------------------------------------------------------------------ 7 DESIGN
ch("Design", "The look of the whole site: global style, colours and type, logo, animation, site settings.")
sec("Global style")
where("Design → Global style")
fig("20-globalstyle", "Global style with its live preview.")
bullets([
  "One place for the look of everything at once: text and accent colours, header, menu, image filter, every flow, every carousel and slide, every section, every modal, headings, icons and cards, pictures, section entrance and exit, and light and dark mode.",
  "Each item follows these settings unless you set it to <b>Custom</b> where you edit it.",
])
fig("20b-savedstyles", "Saved styles: keep the whole look under a name and switch back to it later.")
steps([
  "Type a name in <b>Saved styles</b> and press <b>Save current style</b>.",
  "To switch, press <b>Apply</b> next to a saved style. <b>Update</b> saves the current settings into it.",
])
tip("Applying a style never changes items set to Custom.")
sec("Image colour overlays")
fig("25-imagefilter", "Image filter: a colour or gradient over every picture, with Dorma presets.")
bullets([
  "<b>Design → Global style → Image filter</b>: pick a Dorma preset (Blue tint, Blue mono, Yellow glow, Blue to yellow, Blue fade, Night fade, Spotlight, Magenta to blue) or your own overlay, its strength, a dark shade on heroes, brightness and film grain.",
  "Override it for one picture under <b>Library → the picture → Colour overlay</b>, for every carousel, or for one slide.",
])
sec("Colours and type")
where("Design → Colours and type")
fig("21-colours", "Palettes, My colours and the type preview.")
bullets([
  "<b>Palettes</b>: one click sets the main colours. <b>Save current colours as a palette</b> keeps yours.",
  "<b>My colours</b>: your named colours (Dorma blue, yellow, magenta…). They show as small dots next to every colour picker in the studio, so one click applies them.",
  "Background colours, and the fonts and sizes for titles, subtitles, body, labels, Arabic and handwriting.",
])
sec("Logo")
where("Design → Logo")
fig("22-logo", "Which logo version shows where, and how big.")
bullets([
  "White, colour and <b>silver</b> logo, plus your own SVG versions (silver: finish, gradient angle and Shine).",
  "For each place (header, full-screen menu, footer, page loader): the version on dark and light backgrounds, and the height on computers and phones.",
  "When you have the real SVG logo, add it here and use it as the white or colour logo; it then shows everywhere, and the loader's Draw animation works.",
])
sec("Animation")
where("Design → Animation")
fig("23-animation", "Overall speed, easing, title reveal, sections on scroll, button glow and modals.")
bullets([
  "<b>Overall speed</b> and <b>Easing</b> set the character of all motion.",
  "<b>Title reveal</b>, <b>Sections on scroll</b>, <b>Count numbers up</b>, <b>Mouse parallax on heroes</b>.",
  "<b>Button glow</b> (0 turns it off). <b>Modals</b>: opening and closing style.",
])
p("The appendix <b>Animation and effects, part by part</b> lists every effect and where it is set.")
sec("Site and titles")
where("Design → Site and titles")
fig("24-site", "Brand and header, forms and enquiries.")
bullets([
  "<b>Brand and header</b>: brand name, footer text, home page, the editor-only <b>Studio button</b> in the site header, and the header button (label, and what it opens).",
  "<b>Forms and enquiries</b>: where messages go, the thank-you message and Dorma's email (same as Inbox → Form settings).",
  "<b>Languages and numbering</b>, the page <b>Loader</b> (Reveal, Draw (needs an SVG logo) or Pulse), <b>Page titles</b>, and copying or pasting all settings as text.",
])

# ------------------------------------------------------------------ 8 ARABIC
ch("Arabic and English", "Running the site in English, Arabic or both.")
where("Design → Site and titles → Languages and numbering")
fig("24b-languages", "Languages and numbering.")
steps([
  "Choose <b>Site languages</b>: English, Arabic, or English and Arabic.",
  "With both, choose the <b>language for first-time visitors</b>. A switch in the header lets visitors change language, and the site remembers their choice.",
  "Publish.",
])
bullets([
  "When Arabic is on, every text box in the studio shows <b>English and Arabic side by side</b>. The Arabic box is right-to-left.",
  "A language left empty shows the other language's text.",
  "Arabic pages are laid out right to left; things set to \"before\" (for example an icon) go on the right.",
  "Numbering (01, 02, counters, steps and badges) is off by default; switch it on here if you want it.",
  "<b>Site care → Health check → Arabic text</b> lists every text that has no Arabic yet.",
])
tip("The AI button can draft the Arabic (or the English) for you. It is a suggestion: read it and fix it before you press <b>Use this</b>.")

# ------------------------------------------------------------------ 9 LIBRARY
ch("Library", "Every picture, video, background and article in one place, sorted into categories.")
where("Library → Library")
fig("26-library", "The Library.", [
  "<b>Check GitHub for new files</b> after adding files on GitHub.",
  "<b>Add by link</b>: a picture or video that lives elsewhere (a direct link, YouTube or Vimeo).",
  "<b>New items go into</b>: the category for uploads (required).",
  "<b>Select several</b> to move, hide or delete many at once.",
  "<b>Possible duplicates</b>: same size, name or link.",
  "<b>Sort</b>: newest first by default; also oldest, name, size, category.",
])
sec("Adding pictures")
steps([
  "Choose the category under <b>New items go into</b>.",
  "Press <b>Quick upload (Supabase)</b> and pick the files. Big photos are optimized first (see below). Tick <b>Keep originals</b> to skip that once.",
  "Or press <b>Add by link</b> to use a picture or video from another site, or <b>Find photos</b> for free stock photos.",
  "Files kept on GitHub: add them in the <code>public/library/</code> folders on GitHub (the studio opens the right page under <b>Add files on GitHub</b>), wait about two minutes, then press <b>Check GitHub for new files</b>.",
])
fig("28-optimizing", "Picture optimizing: pictures are made lighter in your browser before they are stored.")
bullets([
  "Longest side (2400 px is sharp on large screens), quality (0.85 looks the same as the original) and format (WebP is smallest).",
  "Pictures with transparency (logos, cut-outs) stay PNG. GIFs, SVGs and videos are never changed.",
  "<b>Optimize files for GitHub</b> does the same to files you will upload on GitHub yourself.",
])
sec("Editing one picture")
fig("27-libitem", "Click a picture to edit it.")
bullets([
  "<b>Name</b>, <b>category</b> (required), <b>tags</b>, and the <b>focus point</b> and crop zoom (what stays in view when the picture is cropped).",
  "<b>SEO</b>: a readable file name (<b>Rename file</b>; GitHub files are copied to Supabase under the new name), and alt text, title, caption and description in English and Arabic. The AI can <b>describe the picture</b> for you.",
  "<b>Colour overlay</b> for this picture only.",
  "<b>Used in</b> lists every place on the site that shows it. <b>Hide from library</b> or <b>Delete</b>.",
])
sec("Moving, tidying and duplicates")
bullets([
  "<b>Move</b>: drag pictures onto a category at the top, or tick several with <b>Select several</b> and press Move, Hide or Delete.",
  "<b>Possible duplicates</b> shows pictures with the same size, name or link; keep the one that's used and delete the other.",
  "<b>Read missing sizes</b> fills in sizes for older uploads and links, so sorting by size and finding duplicates covers them.",
  "The Library always opens <b>newest first</b>. Other orders in the Sort menu last for that visit.",
])
sec("Missing images and Fill missing")
where("Library → Missing images")
fig("29-missing", "Every empty slot, placeholder or broken picture on the site.", [
  "<b>Fill missing from category</b>: fills empty slots with unused pictures from the right category, with a preview and Undo.",
  "<b>Go there</b> opens that place in the studio.",
  "<b>Change from library</b> picks a picture right here.",
])
sec("Picking a picture: unused first")
fig("31-picker", "The picture picker opens on pictures not used on the site yet.", ["<b>Not used yet</b>, Already used, All images."])
p("Every picture picker in the studio opens on <b>pictures not used on the site yet</b>, newest first, in the right category. Filter by category, search by name, and switch the thumbnail size (S, M, L).")
sec("Find photos")
where("Library → Find photos")
fig("30-findphotos", "Find free photos from Pexels, Pixabay and Unsplash.")
steps([
  "Choose the category beside <b>Find photos</b> for photos you add.",
  "Describe the picture in English or Arabic, and optionally its look and feel.",
  "Leave <b>Let AI choose the search words</b> ticked to let the AI turn it into good search words (and suggest others under <b>Also try</b>).",
  "Press <b>Find photos</b>. Tap a photo to see it large with its photographer, licence and size.",
  "Press <b>Add</b> to put it in the Library with its name, alt text, tags and credit, or <b>Reject</b> to hide it from later searches.",
])
bullets([
  "One-time setup: a free key from Pexels, Pixabay or Unsplash (any one is enough), added in Supabase → Edge Functions → Secrets. The steps and Copy buttons are on the tab.",
  "Pexels and Pixabay photos are copied into your Library and optimized; Unsplash photos stay on Unsplash (their rule).",
  "Free limits: Pexels about 200 searches an hour, Pixabay 100 a minute, Unsplash 50 an hour.",
])

# ------------------------------------------------------------------ 10 AI
ch("Write with AI", "Drafting, improving, shortening and translating text, in English and Arabic side by side.")
sec("The AI button")
fig("32-aidialog", "The Write with AI window.", [
  "Choose what to do: <b>Write new</b>, <b>Improve</b>, <b>Shorten</b>, <b>Translate</b> or <b>From archive</b>.",
  "Say in a few words what it should say (or what to change).",
  "<b>Style and references</b>: tune the length, tone and purpose.",
  "<b>Use this</b> puts the text in the box. Nothing changes before that.",
], w=80)
steps([
  "Press the small <b>AI</b> button in the corner of any text box (titles, paragraphs, lists, posts, buttons, Library alt text and SEO).",
  "Pick an action and type a short brief.",
  "Press the yellow button (<b>Write</b>, <b>Improve</b>…). English and Arabic appear side by side.",
  "Edit the suggestion if you like, untick a language to keep what you had, then press <b>Use this</b>. It saves like any edit; visitors see it after Publish.",
])
warn("The AI uses only real facts: your notes, the box itself and the boxes around it. It never makes up clients, projects, numbers or results. Where a fact is missing it writes <b>[To be supplied by Dorma]</b>. Always read it before you publish.")
bullets([
  "<b>Use general industry knowledge</b> (on by default): the AI may explain general topics, such as how offset and digital printing differ. Facts about Dorma still come only from your site and notes. Untick it when the text must stick to what the site says.",
  "<b>Describe the picture</b> (Library → a picture → SEO): writes alt text, title, caption and description from the picture itself.",
])
sec("Style and references")
fig("33-aistyle", "Style and references, opened.", w=80)
bullets([
  "<b>Preset</b>: Social media post, Service page, Technical guide, or your own. <b>Save as preset</b> keeps the current choices.",
  "<b>Length</b> (fits the box, short, medium, long, or an exact number of words), <b>Tone</b>, <b>Purpose</b>, <b>Formality</b>, <b>Reading level</b>, <b>Sentences</b>, <b>Arabic style</b> and <b>Call to action</b>, plus <b>Audience</b> and <b>Extra instructions</b>.",
  "<b>Reference websites</b>: tick saved websites or paste a link (up to 3). The AI reads those pages for facts and terms, writes in its own words, and never presents another company's clients or numbers as Dorma's.",
])
sec("AI writing settings")
where("Content → AI writing")
fig("34-aitab", "The AI writing tab: status, setup, settings, notes and presets.")
bullets([
  "<b>Status</b>: Ready, or what is missing, and how many of today's 150 requests you have used.",
  "<b>Settings</b>: AI buttons on or off, general knowledge on by default, and the model (<b>Flash</b> for better writing, <b>Flash-Lite</b> for more free uses).",
  "<b>What the AI should know</b> (brand notes), Arabic notes, words to avoid, the <b>Default style</b>, <b>Saved styles</b>, <b>Reference websites</b> and a <b>Try it</b> box.",
])
p("<b>One-time setup</b> (also shown step by step on the tab):")
steps([
  "Open <b>Google AI Studio → API keys</b> (aistudio.google.com/app/apikey), press <b>Create API key</b> and copy it. No billing needed.",
  "Open <b>Supabase → Edge Functions → Secrets</b>, add a secret named <code>GEMINI_API_KEY</code> with the key as its value, and save.",
  "In the studio press <b>Check again</b>. It should say <b>Ready</b>.",
])
warn("On Google's free tier, Google may use what you send to improve its services. Don't paste private or confidential information into the AI window.")
sec("AI archive")
where("Content → AI archive")
fig("35-aiarchive", "Saved AI texts, ready to reuse.")
bullets([
  "<b>Save to archive</b> in the AI window keeps any text with its brief and style.",
  "Search and filter by tag; edit or <b>Copy</b> the text; <b>Add to Social calendar</b> as a drafted post on the platform and date you pick; or delete it.",
  "<b>Write something new with AI</b> writes text that isn't tied to a box (for example a LinkedIn post) straight into the archive.",
  "To use an archived text in a box, open the box's AI window and choose <b>From archive</b>.",
])

# ------------------------------------------------------------------ 11 PROPOSALS
ch("Client proposals", "A small website made for one client, with only the services they need, in the site's look.")
where("Content → Proposals")
p("The client gets a link like <code>…/#for/client-code</code>. Proposals save as soon as you change them (no Publish needed) and are kept in their own database table, so nobody can list your clients.")
sec("Making a proposal")
steps([
  "Press <b>New proposal</b>.",
  "Under <b>Client</b>, type the client's name in English and Arabic and pick their <b>logo</b> from the Library (upload it first under Brand &amp; Identity). Choose a white tile behind colour or dark logos.",
  "Under <b>Services</b>, tick the pages to include. Reorder with the arrows, write a <b>note for this client</b>, and untick sections they don't need.",
  "Under <b>Brief</b>, pick a template and adjust the letter for this client.",
  "Check the <b>Signature</b>, headline, related work and contact button.",
  "Under <b>Link and status</b>, set the status to <b>Live</b> and press <b>Copy link</b> to send it.",
])
fig("36-prop-link", "Link and status, and Version.", [
  "<b>Copy link</b>, <b>Open</b>, or <b>Preview with draft</b>.",
  "<b>PDF (English)</b> / <b>PDF (Arabic)</b>.",
  "<b>Status</b>: Live, Off or Archived.",
  "<b>Freeze this version</b>.",
])
bullets([
  "<b>Live</b> = the link works; <b>Off</b> = the client sees \"no longer available\"; <b>Archived</b> = off and moved to the Archived list. <b>Expires on</b> stops the link the day after that date.",
  "<b>Search engines may list it</b>: untick to add a noindex tag.",
  "<b>Opens</b>: how many times the client opened it and when (phone or computer, English or Arabic). Your own opens are not counted. <b>Reset count</b> clears them.",
  "<b>New opens</b> show as a yellow number on Content and Proposals. Open that proposal to mark them seen. The studio checks every two minutes. (There is no email alert.)",
])
sec("Version: Live or Frozen")
bullets([
  "<b>Live</b> (default) follows the published site: improve a service page, publish, and the proposal shows it.",
  "<b>Freeze this version</b> keeps a copy of the service pages, pictures, modals and flows as they are published now, so later edits don't change what the client agreed to.",
  "<b>Update the frozen copy</b> takes a fresh copy; <b>Go back to live</b> follows the site again. The brief, signature, client details and words stay editable while frozen.",
])
sec("Brief and templates")
fig("37-prop-brief", "The brief, with placeholders and a live preview.", ["<b>Use template</b>.", "<b>Insert</b> buttons put a placeholder where the cursor is."])
bullets([
  "Words in square brackets are filled in for you: <code>[client name]</code>, <code>[date]</code>, <code>[services]</code>, <code>[sender name]</code> and <code>[company]</code> (in Arabic also <code>[اسم العميل]</code>, <code>[التاريخ]</code>, <code>[الخدمات]</code>, <code>[اسم المرسل]</code>, <code>[الشركة]</code>).",
  "The preview shows the brief with the client's real name. A bracket the studio doesn't know is flagged in yellow.",
  "Simple formatting works: <code>**bold**</code>, <code>- list</code>, an empty line between paragraphs.",
])
fig("40-prop-templates", "Templates and signature: your saved briefs.")
bullets([
  "<b>New template</b>, give it a name (only you see it), write it in English and Arabic, <b>Make default</b>, <b>Duplicate</b> or <b>Remove</b>. <b>Preview with</b> shows a template with a real client's name.",
  "Changing a template never changes proposals that already used it.",
  "Below the templates are the <b>signature defaults</b>: sender name, company and where the signature goes.",
])
sec("Services and signature")
fig("38-prop-services", "Services in the proposal, each with a note for this client.")
fig("39-prop-signature", "The signature: Kind regards, the sender name, and Dorma Advertising or Dorma Production.")
bullets([
  "<b>Sign as</b> Dorma Advertising or Dorma Production. <b>Where it goes</b>: at the end of the overview, or under the brief like a letter. <b>Save as my default</b> keeps the choice for new proposals.",
  "<b>Duplicate for another client</b> copies the services, texts and work, clears the client and switches the copy off.",
])
sec("What the client sees")
fig("41-prop-site", "The proposal site: the client's name in large type, and a menu with only their services.")
fig("42-prop-pdf", "The printable PDF version (A4, white).", w=80)
bullets([
  "<b>Overview page</b>: Dorma and client logos, the date, \"Prepared for\" with the client's name, your headline, the brief, a card per service, related work and the contact button.",
  "<b>PDF</b>: press <b>Save as PDF</b> and choose <i>Save as PDF</i> in the print window. The client also gets a <b>Save as PDF</b> link in the header (switch it off under <i>Languages, notes and copies</i>).",
  "<b>Request a Quote</b> on a proposal sends the message to the Inbox, marked <i>Proposal</i> with the client's name.",
])

# ------------------------------------------------------------------ 12 INBOX
ch("Inbox and the contact form", "Messages people send from the site's forms.")
sec("Messages")
where("Inbox → Messages")
fig("43-inbox", "The Inbox with a message open. (The messages shown are samples.)", [
  "<b>Reply by email</b> opens your email app with a reply ready.",
  "<b>Archive</b> moves it to Archived.",
  "<b>Export CSV</b> downloads the messages as a spreadsheet.",
])
bullets([
  "Messages come from the <b>Contact form</b> section, the <b>Quote request form</b>, the <b>Request a Quote</b> modal and client proposals.",
  "Unread messages are bold with a yellow dot, and their number shows on the Inbox tab. Click one to read it.",
  "Views: Inbox, Unread, Archived, All. Filter by type and search names, emails, companies and text. Tick several to mark, archive or delete them together.",
  "<b>Copy</b>, <b>Mark unread</b> and <b>Delete</b> (for good). The CSV opens in Excel with Arabic intact.",
])
sec("Form settings")
where("Inbox → Form settings")
fig("44-formsettings", "Where messages go and what visitors see after sending.")
bullets([
  "Messages go to the <b>Studio Inbox</b> (recommended) or the <b>visitor's email app</b> (nothing is saved).",
  "The <b>thank-you message</b> in English and Arabic, and <b>Dorma's email</b> (used when the Inbox can't be reached and on printable proposals). Publish to apply.",
  "<b>Spam protection</b> is built in: a hidden field bots fill in, a minimum of 2.5 seconds to fill the form, and limits per visitor, per email and per day.",
  "To add a contact form: <b>Pages → Add section → Contact form</b>.",
])
tip("Only signed-in editors can read messages. New messages show in the studio only; email alerts are not set up yet.")

# ------------------------------------------------------------------ 13 SOCIAL
ch("Social", "Ready-to-copy posts from the site's own words, and a posting calendar.")
sec("Create posts")
where("Social → Create posts")
fig("45-social-create", "Pick any page, section, post, catalog item or flow on the left.")
steps([
  "Pick something from the site in the list on the left (search and filter by kind and topic).",
  "Check the suggested <b>picture</b> and the <b>hashtag sets</b>.",
  "For each platform (<b>LinkedIn, Facebook Page, Instagram</b>) the studio writes the post in English and Arabic. Edit anything, then press <b>Copy</b>.",
  "Choose the picture size and press <b>Save picture</b> to download it as a JPG cropped for that platform.",
  "Press <b>Add to calendar</b> to plan it.",
])
fig("45b-social-post", "A LinkedIn post in English and Arabic, with the picture cropped to size.")
warn("The Social tab does not post for you. Copy the text, save the picture and post it yourself on LinkedIn, Facebook or Instagram.")
sec("Calendar")
where("Social → Calendar")
fig("46-calendar", "The posting plan, filled from the weekly rhythm.")
bullets([
  "The weekly rhythm (Social settings) marks the days. <b>Fill empty rhythm days</b> adds suggestions from the site, or press <b>Suggest a post</b> on one day.",
  "Mark each post planned, drafted, scheduled or posted, and add the link to the live post. <b>Copy EN</b> copies the text.",
])
sec("Social settings")
where("Social → Social settings")
fig("47-socialsettings", "Tone, template, hashtags and call to action per platform.")
p("Platforms on or off, tone and template per platform, call to action, hashtags, carousel slides, the weekly rhythm, and the site address posts link back to (change it when the site gets its own domain). The plan is saved for editors only and never published.")

# ------------------------------------------------------------------ 14 SITE CARE
ch("Site care", "Keeping the site healthy, backed up and awake.")
sec("Health check")
where("Site care → Health check")
fig("48-health", "Site connection and backups, at the top of the Health check.")
bullets([
  "<b>Keep-alive</b>: the free Supabase plan pauses a project after about a week without use. A GitHub job pings the database every day. <i>Awake</i> means the last ping came in the last two days. If pings stop, press <b>Open on GitHub</b> and <b>Enable workflow</b> there. <b>Ping now</b> wakes it by hand.",
  "<b>Database size</b>: how much of the free 500 MB is used.",
  "<b>Backup file</b>: when a backup file was last downloaded on this computer.",
])
fig("48b-health-list", "What needs attention, checked in the draft.", ["<b>Fix it</b> opens the place in the studio.", "<b>Ignore</b> hides a row you're happy with."])
bullets([
  "The tiles count <b>Broken</b> (visitors hit a problem), <b>To fix</b> and <b>Good to know</b>; tap one to see only that level. <b>Show ignored</b> brings hidden rows back.",
  "Checks: broken links and buttons, missing pictures, alt text, Arabic text, pages nobody can reach, large files (over 1.5 MB), settings, hidden things, unused library items, and <b>Check outside links</b>.",
])
sec("Backups and versions")
where("Site care → Backups")
fig("49-backups", "Backup file and version history.", [
  "<b>Download backup</b>: one file with everything.", "<b>Bring back from a file</b>.", "<b>Save a snapshot now</b>.", "<b>Put in draft</b>: bring an older version back.",
])
bullets([
  "<b>Download backup</b>: the draft, the live site, the Social plan and the client proposals in one file. Pictures and videos stay in the Library; the file keeps their names.",
  "<b>Bring back from a file</b>: the studio shows what's in the file, then <b>Put it in the draft</b> (a safety copy of the current draft is saved first). You can also replace the Social plan and add back deleted proposals.",
  "<b>Version history</b>: every Publish, every snapshot and every safety copy. For each: a name, <b>Pin</b> (never removed), <b>Compare with the draft</b>, <b>Download</b>, <b>Put in draft</b> and <b>Delete</b>.",
  "<b>Versions to keep</b>: 5 to 100 (30 by default).",
])
steps([
  "To undo a bad publish: press <b>Put in draft</b> on the version you want.",
  "Check it with <b>Preview draft</b>.",
  "Press <b>Publish</b>.",
])

# ------------------------------------------------------------------ 15 CANNOT
ch("What needs help outside the studio", "These need a code change, or a change in GitHub or Supabase. Ask for them as a new task.")
bullets([
  "<b>New kinds of things</b>: new section types, background effects, animations, modal types, flow behaviours, or fonts beyond the lists offered.",
  "<b>The studio itself</b>: its tabs, fields and layout.",
  "<b>Who can edit</b>: editor accounts are added in Supabase.",
  "<b>Library files on GitHub</b>: adding files to <code>public/library/</code>, new category folders and deleting files is done on GitHub (the studio opens the right page). GitHub takes up to 25 MB per file.",
  "<b>Email alerts</b> for new messages or proposal opens: they need an email service and a small server function. Until then, watch the Inbox and Proposals badges.",
  "<b>The Gemini key and AI limits</b>: the key is a Supabase secret; the daily limit per editor is a Supabase setting (<code>AI_DAILY_LIMIT</code>).",
  "<b>Hosting, domain and Supabase plan</b>: the site runs on GitHub Pages and the free Supabase plan. If Supabase ever pauses, restore it in the Supabase dashboard.",
  "<b>Posting to social media</b>: the Social tab prepares posts; you post them yourself.",
])

# ------------------------------------------------------------------ APPENDIX ANIMATION
ch("Appendix: animation and effects", "Where each effect is set. Set it once for everything in Design → Global style and Design → Animation; change one thing by opening it and picking Custom.")
table([
  ["Timing (who appears when)", "Seconds from when the slide, section or modal starts; lower comes first. On Hero, Hero carousel and each slide, Timeline, Flow strip, Division and Modals."],
  ["Carousel slides", "Global style → Every carousel and slide: transition (Light wipe, Crossfade, Slide, Zoom through), seconds per slide, slow zoom, filter and colours. Override per carousel and slide in Content → Carousels."],
  ["Titles", "Animation → Title reveal: Letter by letter, Word by word, Fade up, Blur in."],
  ["Flows", "Global style → Every flow, or Flows → Animation and timing: Rise, Fade, Scale, Blur, Slide, Flip, Pop, None; duration, gap, start delay. Each item can animate on its own."],
  ["Buttons", "Animation → Button glow (0 = off)."],
  ["Sections on scroll", "Global style → Section entrance and exit, or a section's More options → Animation. Entrance: Rise, Fade, Scale up, Zoom in, Blur, Slide, Tilt, Skew, Wipe, Circle opens, Open from the centre, Each part in turn. Exit: Fade, Shrink, Blur, Parallax, Darken, Fold back, Slide away."],
  ["Headings, icons, logo, buttons", "Global style → Headings, icons and cards, or a section's Icon, text, logo and button. Heading styles and entrances, icon animations, logo and button entrances and movements, card hover."],
  ["Pictures", "Global style → Pictures: masks, reveals and hover. Reveal as it scrolls in (Wipe, Circle, Curtain, Blinds, Tiles, CMYK print pass…), a shape kept on the picture, and pointer effects."],
  ["Colour filters", "Global style → Image filter; override per Library item, carousel or slide."],
  ["Background effects", "Global style → Every section → Background effect, or a section's More options. 26 effects; colours, strength, speed, amount, size, direction, mouse reaction and a veil."],
  ["Modals", "Global style → Every modal, Animation → Modals, or one modal's Animation. Opening (Scan line, Fade, Scale up, Circle from the click, Curtain, CMYK print pass…) and closing."],
  ["Menu", "Global style → Header and Menu: link style, hover, full-screen menu opening, how links arrive, background, logo."],
  ["Logo and loader", "Logo → Silver logo (Shine); Site and titles → Loader: Reveal, Draw (needs SVG) or Pulse."],
  ["Light and dark mode", "Global style → Light and dark mode: what visitors start in, the sun and moon switch, light mode colours."],
  ["Overall feel", "Animation → Overall speed, Easing, Mouse parallax on heroes."],
], head=["Part of the site", "Where and what"])
tip("Visitors who prefer reduced motion see all of these at rest. Always check with Preview draft before you Publish.")

# ------------------------------------------------------------------ GLOSSARY
ch("Glossary", "Words used in the studio and in this manual.")
gloss([
  ("Draft", "Your working copy of the site. Every change saves here by itself. Visitors don't see it."),
  ("Live site", "What visitors see. It changes only when you press Publish."),
  ("Publish", "Copies the draft to the live site. Every publish is kept as a version."),
  ("Preview draft", "Shows the whole draft site in the browser, without publishing."),
  ("Live preview", "A small window beside the studio that shows the draft and updates as you edit."),
  ("Page", "One address on the site (for example #agency), made of sections."),
  ("Section", "One block of a page: a hero, a card grid, a call to action, a photo…"),
  ("Hero carousel", "The large picture slideshow at the top of a page. Each picture is a slide."),
  ("Slide", "One screen of a carousel, with its own picture, texts, flow and timing."),
  ("Flow", "A row of buttons, text or icons under a title, separated by small marks. It can behave as a row, tabs or reveal panels."),
  ("Modal", "A panel that opens over the page when a visitor clicks something."),
  ("Label", "A short name for a section, so buttons can jump to it (#page/label)."),
  ("Global style", "The look for the whole site. Items follow it unless set to Custom."),
  ("Custom", "Gives one item its own setting instead of following Global style."),
  ("Library", "All pictures, videos, articles and scenes, sorted into categories."),
  ("Placeholder", "A generated picture that holds a place until a real photo is added."),
  ("Alt text", "A short description of a picture, read by screen readers and search engines."),
  ("SEO", "Search engine optimisation: names and descriptions that help search engines understand the site."),
  ("Overlay / filter", "A colour or gradient laid over pictures."),
  ("RTL", "Right to left, the direction Arabic is written in."),
  ("Proposal", "A small website for one client at #for/client-code."),
  ("Frozen", "A proposal that keeps a fixed copy of its service pages instead of following the site."),
  ("Snapshot", "A version of the draft saved by hand in Backups, without publishing."),
  ("Backup file", "One file on your computer with the draft, live site, Social plan and proposals."),
  ("Keep-alive", "A daily GitHub job that stops the free Supabase project from pausing."),
  ("Supabase", "The online database that stores the site settings, uploads, messages and proposals."),
  ("GitHub", "Where the site's code and some library files are kept, and from where the site is published."),
  ("Gemini", "Google's AI service used by Write with AI, on its free plan."),
  ("Edge function / secret", "A small server program in Supabase, and a private key stored there (for example GEMINI_API_KEY)."),
  ("WebP", "A picture format that is smaller than JPG at the same quality."),
])
