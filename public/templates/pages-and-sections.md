# Dorma pages and sections

How to use this file:

1. Every block starts with a line of three dashes: ---
2. A block that starts with "Page:" makes a new page. Every "Section:" block after it adds
   a section to that page, in order, until the next Page block.
3. Sections at the top, before any Page block, go to the page you pick in the studio
   (handy for adding a few sections to a page you already have).
4. In the studio, open Content › Import, choose "Pages and sections", and pick this file.
   You will see every page and section before anything changes.

Page lines:

- Page: the page title (shown in the menu). Page (Arabic): if needed.
- Address: the end of the page's link (#agency). Empty makes it from the title.
- Layout: Cinematic, Index or Console.
- Menu: yes to show it in the menu.

Section lines:

- Section: the section type. One of: Hero carousel, Hero, Division, Chapters, Numbers, About, Clients,
  Card grid, Accordion, Timeline, Flow strip, Wide banner, Call to action, Blog posts, Text article,
  Feature list, Testimonials, Quote request form, Catalog.
- Hidden: yes adds the section hidden (you can show it later with one tap in Pages).
- Any text line can have an Arabic twin on its own line: "Title (Arabic): …".
- Images: a file path (exhibitions/booth-01.jpg), a name as shown in the Library, or an https:// link.
- Flow: the name of a flow, or the flow's items listed underneath (see flows.md).
- Buttons: [Label](target). Targets: modal:name, page:address, post:address, slide:2, https://…
- Lists (chapters, linked items, cards, rows, figures, clients, slides): one item per line starting with "- ",
  and that item's own lines indented by two spaces under it.
- Timing and colour settings are set in the studio after the import.

The example below shows every section type. Delete the ones you don't need.
Everything above the first --- line is ignored.

---
Page: Exhibitions
Page (Arabic):
Address: exhibitions
Layout: Cinematic
Menu: yes

---
Section: Hero
Number: 01
Eyebrow: Exhibitions & Booths
Title: Turn your space into a brand experience
Short paragraph: Concept, construction, graphics, displays and presentation materials, connected around your objectives.
Height: Tall
Background image: Placeholder · City
Flow:
- [See our booths](modal:md-booths)
- [Talk to us](modal:md-quote)

---
Section: Hero carousel
Default image: Placeholder · Nebula
Move to next slide automatically: yes
Show counter and timecode: yes
Slides:
- Title: Put your brand where people experience it
  Eyebrow: Exhibitions
  Short paragraph: Booth concepts, construction, graphics and displays.
  Background image: Placeholder · City
  Stay on this slide: no
  Flow:
  - [See our booths](modal:md-booths)
  - [Talk to us](page:contact)
- Title: Give your idea a clear direction
  Eyebrow: Agency
  Short paragraph: Creative concepts, brand storytelling, logo and visual identity.

---
Section: About
Number: 02
Eyebrow: Why it matters
Statement: Your booth should help visitors understand *who you are* and why they should stop.
Image: Placeholder · Ridges
Link: [More about the Agency](page:agency)

---
Section: Division
Number: 01
Eyebrow: Dorma Print & Production
Title: Turn the idea into things people can see and hold.
Short paragraph: Printed materials, giveaways, packaging, and booths.
Button: [Agency services](modal:md-agency-services)
Image on the right: no
Linked items:
- Title: Printing Services
  Brief: Digital, offset, large format, and UV printing.
  On click: page:printing
- Title: Booth Construction
  Brief: From an allocated space to a considered presence.
  On click: page:booths
Image: Placeholder · City

---
Section: Chapters
Chapters:
- Title: We have a space at an exhibition. How do we make it count?
  Text: We connect the concept, construction, graphics, displays, and presentation materials.
  Bullet points:
  - Booth design and build
  - Graphics and displays
  Caption items:
  - Concept
  - Build
  More button: [See our booths](modal:md-booths)
  Image: Placeholder · Ridges

---
Section: Numbers
Number: 03
Eyebrow: Dorma at a glance
Style: Meters
Figures:
- Label: Years since 2000
  Value: 26
  Meter: 65
- Label: Divisions
  Value: 2
  Meter: 30

---
Section: Clients
Number: 04
Eyebrow: Selected clients
Style: Logo grid
Clients:
- Name: [Client name]
  Sector: [Sector]
  Since: [Year]
  Work: [What we did]

---
Section: Card grid
Heading: Different materials. A consistent identity.
Show tag filters as a flow: yes
Cards:
- Title: Print & Packaging
  Code: PR-01
  Tag: Print
  Text: Digital and offset printing, large-format printing, labels and packaging.
  On click: modal:md-giveaways
  Image: Placeholder · Ridges detail
- Title: Signage & Brand Applications
  Code: SG-02
  Tag: Signage
  Text: Indoor and outdoor signage, illuminated signs, vehicle branding.

---
Section: Accordion
Number: 05
Eyebrow: Two divisions
Rows:
- Title: Agency
  Tags: Concepts, Design, Content
  Text: Develop the idea, shape the message, and plan the experience.
  More button: [Explore the Agency](page:agency)
  Image: Placeholder · Ridges detail

---
Section: Timeline
Number: 06
Eyebrow: How we bring it together
Statement: Every brief has its own audience, priorities, and practical considerations.
Timeline flow: Default process flow

---
Section: Flow strip
Eyebrow: Explore
Heading: Where would you like to start?
Flow:
- [Agency](page:agency)
- [Printing & Production](page:production)

---
Section: Wide banner
Caption items:
- Concept
- Construction
- Finish
Image: Placeholder · Ocean motion

---
Section: Blog posts
Heading: Latest from the production floor
Only this category: Exhibitions & Booths
Most posts to show: 6
Show category filters as a flow: no
Style: Cards

---
Section: Text article
Eyebrow: Guide
Heading: Planning your stand
Text:
A clear brief saves time on every stage that follows.

## Before you start

- Who do you want to meet?
- What should happen at the stand?

---
Section: Feature list
Eyebrow: Booth Production
Heading: Services
Columns: 3
Items:
- Booth design and 3D visualization
- Custom booths
- Reusable modular booths

---
Section: Testimonials
Eyebrow: Sample testimonials
Quotes:
- Quote: The booth was ready before the doors opened.
  Name: Sample client
  Role or company: Sample testimonial

---
Section: Quote request form
Heading: Request a Quote
Service: Booth Production

---
Section: Catalog
Heading: Business Giveaways & Packages
Short paragraph: Browse individual items and packages.
Filter names:
- Item Type
- Package Type
- Price Range

---
Section: Call to action
Heading: What are you planning next? Let's bring it to life.
Button: [Contact Dorma](modal:md-quote)
