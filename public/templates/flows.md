# Dorma flows

A flow is a row of items (buttons, plain text, icons) separated by small marks.
Sections, carousel slides and Type 3 modals use flows.

How to use this file:

1. Write one block per flow. Start every flow with a line of three dashes: ---
2. In the studio, open Content › Import, choose "Flows", and pick this file.
   You will see every flow before anything changes. New flows follow the global flow style.

What each line means:

- Name: the flow's name in the studio. Pick "Update flows with the same name" to change an existing one.
- Separator: Three dots, Single dot, Line, Chevron or None.
- Size: Small, Medium or Large.
- Items: one per line starting with "- ":
    - [Label](modal:modal-name)   opens a modal (its id or its name)
    - [Label](page:agency)        goes to a page
    - [Label](post:post-address)  opens a blog post
    - [Label](slide:2)            jumps to slide 2 of a carousel
    - [Label](https://...)        opens a link
    - Label                       plain text with no action
  Under an item, indented by two spaces, you can add:
      Detail: text shown when the item is clicked (timelines and Type 3 modals)
      Detail (Arabic): the same in Arabic
      Icon: an icon's name from Flows and modals › Icons (shows the icon next to the label)
      Type: Button, Plain text or Icon
      Number: yes, to show the item's number
  For an Arabic label, write both with a bar between them: [Concepts | مفاهيم](modal:md-concepts)

Everything above the first --- line is ignored.

---
Name: How we bring it together
Separator: Three dots
Size: Medium
Items:
- Understand
  Detail: Clarify your objectives, audience, requirements, and budget.
  Number: yes
- Shape
  Detail: Develop the approach and agree on the scope, materials, and schedule.
  Number: yes
- Deliver
  Detail: Coordinate the creative work, production, and delivery required by the brief.
  Number: yes

---
Name: Exhibition buttons
Separator: Single dot
Size: Small
Items:
- [See our booths](modal:md-booths)
- [Talk to us](modal:md-contact)
- [Printing & Production](page:production)
