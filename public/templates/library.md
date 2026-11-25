# Dorma library items

Use this file to name, sort and describe many Library items at once: files on GitHub,
links to uploaded files, articles and generated scenes.

Files themselves still go on GitHub first (Library › Add files on GitHub), in
public/library/<category>/. This file only adds their names, categories, tags and descriptions.

How to use this file:

1. Write one block per item. Start every item with a line of three dashes: ---
2. In the studio, open Content › Import, choose "Library items", and pick this file.
   You will see every item before anything changes.
   "Add" skips files already in the Library; "Update" also changes them.

What each line means:

- File: the path inside public/library/, such as exhibitions/booth-01.jpg, or a full https:// link.
  Articles can leave it empty and use Link instead.
- Name: the name shown in the Library and in pickers.
- Kind: Image, Video, Article or Scene. Empty works it out from the file name.
- Category: a category name or folder, such as Exhibitions & Booths. Empty uses the file's folder.
- Tags: separated by commas (they help the search box).
- Description: what the picture shows, for screen readers.
- Summary / Link / Cover: for articles (Cover is a picture from the Library).
- Scene: for generated scenes: Nebula, Ridges, City or Ocean.
- Hidden: yes keeps it out of the pickers.

Everything above the first --- line is ignored.

---
File: exhibitions/booth-01.jpg
Name: Exhibition booth, front view
Category: Exhibitions & Booths
Tags: booth, exhibition, stand
Description: A branded exhibition booth with a counter and backlit graphics.

---
File: signage/storefront-01.jpg
Name: Illuminated storefront sign
Category: Signage & Fabrication
Tags: signage, storefront

---
Kind: Article
Name: Booth planning checklist
Category: Articles & Guides
Summary: The questions to answer before briefing an exhibition booth.
Link: https://example.com/booth-checklist.pdf
Cover: exhibitions/booth-01.jpg

---
Kind: Scene
Name: Blue nebula background
Scene: Nebula
Category: Backgrounds & Textures
