# Dorma carousel slides

How to use this file:

1. Write one block per slide. Start every slide with a line of three dashes: ---
2. Fill in the lines you need. Leave a line empty, or delete it, to skip it.
3. In the studio, open Content › Carousels, pick the carousel, and use "Import slides from Markdown".
   You will see a preview before anything changes.

What each line means:

- Image: a picture from the Library. Use its file path (for example exhibitions/booth-01.jpg),
  its name as shown in the Library, or a full https:// link. Leave it empty to use the
  carousel's default image.
- Eyebrow: the small label above the title (optional).
- Title / Subtitle: the slide's heading and short paragraph.
- Title (Arabic) / Subtitle (Arabic): only if the site shows Arabic. Leave empty otherwise.
- Seconds: how long the slide stays on screen (optional, any number).
- Flow: the buttons under the text, one per line starting with "- ":
    - [Label](modal:modal-id)     opens a modal
    - [Label](page:page-address)  goes to a page
    - [Label](post:post-slug)     opens a blog post
    - [Label](slide:2)            jumps to slide 2
    - [Label](https://...)        opens a link
    - Label                       plain text with no action
  For an Arabic label, write both with a bar between them: [Concepts | مفاهيم](modal:md-concepts)

Everything above the first --- line is ignored, so you can keep these notes.

---
Image: exhibitions/booth-01.jpg
Eyebrow: Exhibitions
Title: Put your brand where people experience it
Title (Arabic):
Subtitle: Booth concepts, construction, graphics and displays built around your exhibition objectives.
Subtitle (Arabic):
Seconds: 9
Flow:
- [See our booths](modal:md-booths)
- [Talk to us](page:contact)
- Concept to build

---
Image:
Eyebrow: Agency
Title: Give your idea a clear direction
Subtitle: Creative concepts, brand storytelling, logo and visual identity.
Flow:
- [Concepts](modal:md-concepts)
- [Content](modal:md-content)
- [Events](modal:md-events)

---
Image: Placeholder · City
Title: What are you planning next?
Subtitle: Tell us what you want to achieve.
Flow:
- [Let's talk](modal:md-quote)
