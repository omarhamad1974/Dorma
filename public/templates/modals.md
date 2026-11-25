# Dorma modals

A modal is the window that opens over the page from a button or flow item.

How to use this file:

1. Write one block per modal. Start every modal with a line of three dashes: ---
2. In the studio, open Content › Import, choose "Modals", and pick this file.
   You will see every modal before anything changes.

What each line means:

- Name: the modal's name in the studio. Buttons can open it with (modal:Name) or its id.
  Pick "Update modals with the same name" to change existing ones.
- Type: 1 (one image or video), 2 (a gallery of three) or 3 (with a flow whose items reveal detail text).
- Small label: the label above the title.
- Title / Text: the heading and short paragraph. Add "Title (Arabic):" and "Text (Arabic):" if needed.
- Media: one picture for Types 1 and 3, three for Type 2, one per line starting with "- "
  (file path, name as shown in the Library, or https:// link).
- Captions: one per line starting with "- " (for Type 2, one per gallery picture).
- Flow: for Type 3. Either the name of a flow, or its items listed underneath, as in flows.md.
- More: the button at the bottom, written as [Label](target), for example [Explore the Agency](page:agency).

Everything above the first --- line is ignored.

---
Name: Booths
Type: 1
Small label: Exhibitions & Booths
Title: Turn your space into a brand experience
Text: We connect the concept, construction, graphics, displays, and presentation materials around your exhibition objectives.
Media:
- exhibitions/booth-01.jpg
Captions:
- Concept
- Construction
- Finish
More: [See production services](page:production)

---
Name: Production gallery
Type: 2
Small label: Printing & Production
Title: Different materials. A consistent identity.
Text: Print, signage and fabrication, coordinated from one brief.
Media:
- print/brochure-01.jpg
- signage/storefront-01.jpg
- Placeholder · City
Captions:
- Print
- Signage
- Fabrication
More: [Tell us what you need produced](modal:md-contact)

---
Name: Our process
Type: 3
Small label: How we work
Title: Understand, shape, deliver
Text: Clear communication connects every stage.
Media:
- Placeholder · Ridges
Flow:
- Understand
  Detail: Clarify your objectives, audience, requirements, and budget.
- Shape
  Detail: Develop the approach and agree on the scope, materials, and schedule.
- Deliver
  Detail: Coordinate the creative work, production, and delivery required by the brief.
More: [Start the conversation](modal:md-contact)
