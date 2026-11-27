# Dorma

A static, animated website with its own editing studio. Visitors see a full-screen hero carousel,
workflow strips, modals and content pages. Editors sign in at `#admin` and change everything without
touching code: colours, fonts, images and videos, icons, animations, flows, modals, pages and titles.

Built with Vite and plain TypeScript/JavaScript, [GSAP](https://gsap.com) for the motion, SortableJS for
drag-and-drop in the studio, and [Supabase](https://supabase.com) for sign-in, saved settings and uploads.
There is no server of our own: the build is a folder of static files.

## Run it

```bash
npm install
npm run dev      # open the printed URL; the studio is at /#admin
npm test         # checks the settings model and the starter template
npm run build    # static site in dist/
```

`VITE_OFFLINE=1 npm run dev` runs without Supabase: no sign-in, and the studio saves to your browser only.
Handy for trying layouts.

## How it works

The whole site is **one settings document** (JSON), rendered in the browser.

| Where | What |
| --- | --- |
| `site_config` row `live` | What visitors see. Anyone can read it. |
| `site_config` row `draft` | What the studio is editing. Saved automatically about a second after each change. Editors only. |
| `site_versions` | The last 30 published versions. **Site and titles → Published versions** puts one back in the draft. |
| `editors` | The accounts allowed into the studio. |
| Storage bucket `media` | Uploaded images and videos (public to view, up to 25 MB each, only editors upload). |

**Publish** in the studio copies the draft to live in one step (`publish_draft()`), so visitors never see
half-finished edits. **Preview draft** shows the draft as the site, before publishing.

Row level security in `supabase/migrations/0001_site_config.sql` enforces all of this in the database.
The key in `src/config.ts` is the public "publishable" key, which is safe in the browser. Never put the
`service_role` key or the database password in the app or the repository.

### Code map

| File | What it does |
| --- | --- |
| `src/main.ts` | Starts the app: loads the live settings, then shows the page in the address (`#home`, `#services`, `#admin`…). |
| `src/studio/data.js` | The starter template, option lists, section types and `normalize()` (fills gaps in older saves). |
| `src/studio/core.js` | Helpers, theme, media, flows (items, separators, whole or per-item animation) and button actions. |
| `src/studio/site.js` | The public site: sections, scroll animations, the hero carousel and the three modal types. |
| `src/studio/admin.js` | The studio: sign-in, every panel, the field editors and published versions. |
| `src/studio/content.js` | The bilingual site content from the content handoff: services, flows, modals, pages, catalogs and draft posts. |
| `src/studio/jump.js` | Button jumps to a labelled section on another page or inside a modal (curtain travel, scroll and lock-on). |
| `src/studio/fx.js` | Animated SVG section backgrounds with masks (contours, orbits, grid, goo, stripes, waves, reveal, type). |
| `src/studio/store.ts` | Supabase: loading, autosave, publish, sign-in and uploads. Falls back to browser storage offline. |
| `src/studio/scenes.js` | Generated placeholder images used until real photos are uploaded. |
| `scripts/library-index.mjs` | Lists the files in `public/library/` for the studio (runs before dev and build). |

## Social posts (studio → Social)

Turns the site's own text into posts for LinkedIn, a Facebook Page and Instagram. No AI and no paid service:
templates fill in words already on the site, so nothing is invented, and you post by hand.

- **Create posts**: pick a page, section, blog post, catalog item or flow. You get a caption per platform in
  English and Arabic (from the Arabic on the site), hashtags, a link back to the page, the page's picture cropped
  to each platform's size (save as JPG), and carousel slide text (a flow's steps, a page's points or a post's
  headings). Placeholder text and unpublished posts are flagged. Everything can be edited and copied.
- **Calendar**: the weekly rhythm (default Mon service, Wed project or process, Fri gift or print idea) marks the
  days; *Fill empty rhythm days* plans them with site content not posted lately. Each entry is one post on one
  platform with a status (planned, drafted, scheduled, posted) and a link to the live post.
- **Social settings**: tone, own template, call to action, length and hashtag count per platform, hashtag sets,
  carousel slides and the rhythm.

The plan lives in its own editors-only table `social_plan` (`supabase/migrations/0002_social_plan.sql`), so it
is never published with the site, never copied into `site_versions` and not touched by putting back a version.
Logic is in `src/studio/social.js` (tested in `tests/social.test.ts`), the panels in `src/studio/socialpanel.js`.
Entries keep `externalId`, `postedAt` and `url` for automatic posting through the Meta and LinkedIn APIs later.

## Flows, jumps and section effects

- **Any section can have a flow under it.** Pages → section → More options → Flow under this section. The same panel sets the section's **label** (used as a jump target), whether it is a **preview only** sample, its **background effect**, and its own **Look** (spacing, width, background, title sizes, fonts and colours).
- **Flow items** can be a button, plain text, text with an icon, an icon, or a **note**: an animated icon with handwritten text beside it (for example "Briefing…").
- **Flow display**: the usual storytelling row, **Tabs** (each item swaps a panel), or **Reveal** (each item unlocks its part of the section with a circle mask).
- **Any button** can open a modal or a page and then travel to a labelled section in it: the page slides under a curtain, scrolls to the section and marks it with corner brackets. Links look like `#agency/services`.
- **Global style → Every section / Every modal** set the defaults; each section or modal can use its own look instead. **Colours and type** sets sizes and fonts for titles, headings, subtitles, body text, labels, handwritten notes and Arabic.
- **＋ New…** in the studio top bar creates a page (blank, service, catalog or article), a modal or a flow.
- Quote forms send by email to the address in Site → Quote requests, or copy the request when that is empty. No paid service is used.

## Studio layout

The studio has four main tabs, each with sub-tabs: **Content** (Pages, Carousels, Blog), **Design** (Colours and type, Animation, Site and titles), **Flows and modals** (Flows, Modals, Icons) and **Library**. The button at the bottom of the sidebar switches the studio between light and dark mode. This only changes the studio, is remembered in that browser, and previews keep the site's own colours. Under Colours and type, **My colours** holds named swatches that appear next to every colour picker, and you can save the current colours as a palette.

## Media library

The studio's **Library** holds every image, video, background and article, sorted into categories
(Brand & Identity, Photo & Video, Events & Activations, Exhibitions & Booths, Digital & Social,
Print & Packaging, Signage & Fabrication, Gifts & Displays, Backgrounds & Textures, Articles & Guides).
Anything in it can be picked wherever the studio asks for an image; articles can be opened from any button.

Files live in the repository for now, one folder per category: `public/library/<category>/`.

1. Studio → Library → **Add files on GitHub** → **Upload files** next to a category (or open the folder on
   GitHub → Add file → Upload files) → drop files → **Commit changes**.
2. The site redeploys in about two minutes. `scripts/library-index.mjs` writes `library/index.json` at build time.
3. Open the studio's Library (or press **Check GitHub for new files**): new files are added with their
   category from the folder. Give them titles, descriptions and tags there.

Library items store paths relative to the library folder (`exhibitions/booth-01.jpg`), and
`LIBRARY_BASE` in `src/config.ts` turns them into addresses. To move the files later (a CDN, Supabase
Storage, S3), copy them with the same folder layout and set `VITE_LIBRARY_BASE`; nothing saved needs to change.
**Quick upload (Supabase)** in the Library is still there for one-off uploads from a phone.

Keep files small: GitHub's web upload takes up to 25 MB per file, and a repository should stay well under 1 GB.

## Blog

Studio → **Blog** writes posts: title, date, category, tags, cover image from the library, a short summary,
and the text. The text uses a small, safe subset of Markdown (empty line = paragraph, `## heading`,
`- list`, `> quote`, `**bold**`, `*italic*`, `[text](https://…)`), and `[[media-id|caption]]` on its
own line places a library image or video. Published posts appear on any page with a **Blog posts**
section (the Blog page by default), and each post has its own address, `#post/<address>`.

## Languages (English and Arabic)

Studio → Site and titles → **Languages and numbering** sets the site to English only, Arabic only, or both. With both, visitors get a language switch in the header, and first-time visitors see the language chosen there.

When Arabic is on, every text box in the studio shows **English and Arabic side by side**. Text is saved as `{en, ar}`, and plain strings still work as English. If one language is left empty, the site shows the other one, so a page is never blank. The Arabic site runs right to left in IBM Plex Sans Arabic. Titles reveal word by word, because Arabic letters join, and arrows are mirrored. Built-in words such as Next, Close and All posts have Arabic versions in `UI_AR` in `src/studio/core.js`.

The same card has **Show numbering**, which is off by default. It controls the 01/02 counters, step labels, badges and numbered lists.

## Hero carousel slides

Carousels have their own **Carousels** tab in the studio: settings for all carousels (transition, seconds per slide, zoom), then each carousel and its slides. Seconds on screen has no upper limit, a slide can be set to **Stay on this slide until the visitor moves on**, and a carousel can turn off **Move to next slide automatically**. Slides and sections can be duplicated, and any section can be hidden from visitors with the eye button under Pages.

Each slide has its own **flow**: the buttons under its text, which open modals, pages or links. A slide without one uses the section's default flow. Flows never move the slides. Visitors change slides with the arrows, the dots, swiping or the keyboard, and slides also advance on their own after their seconds on screen. Buttons have a soft pulsing glow instead of a progress line. Set its strength, or turn it off, under Animation → Button glow.

### Import slides from Markdown

Under Content › Carousels, **Import slides from Markdown** adds slides from a `.md` file. **Download template** gives you [`public/templates/carousel-slides.md`](public/templates/carousel-slides.md), which explains the format. Each slide has an image (a Library file path, a Library name or an https link; empty uses the carousel's **Default image**), an eyebrow, a title, a subtitle, optional Arabic title and subtitle, seconds on screen, and a flow written as a list of `[Label](modal:id)`, `[Label](page:id)`, `[Label](https://…)` or plain text items. The studio shows a preview first. You can then add the slides after the existing ones or replace them all. Each slide's flow becomes a new flow you can edit under Flows. The parser is `src/studio/mdslides.js`, with tests in `tests/mdslides.test.ts`.

### Import any content from Markdown

Content › **Import** has a template for every kind of content: carousel slides, pages and sections (every section type), blog posts, flows, modals, Library items, colours and palettes, and icons. The templates live in [`public/templates/`](public/templates/) and each one explains its lines at the top. Pick or paste a file and the studio shows a preview, made by running the import on a copy of the draft, before anything changes. Most types can add new items or update the ones with the same name or address. Blog, Flows, Modals, Icons, Library, Pages and Colours each have an **Import from a file** button that opens Import with that type picked. The parser is `src/studio/mdimport.js`, with tests in `tests/mdimport.test.ts`.

## Timing (storytelling)

Every hero, hero carousel, timeline, flow strip and modal has a **Timing** row in the studio. It gives the second each piece starts (eyebrow, title, text, image, flow, flow detail, button), counted from when the section scrolls into view, the modal opens, or the slide's text starts. Leave a box empty for the default shown, and use lower numbers to bring a piece forward. Hero carousel slides can also set their own **seconds on screen** and override the section timing. In the hero carousel the default order is title at 0s, short paragraph at 0.5s, then the flow at 1.5s with its buttons appearing one by one (**Gap between flow items**, 0.2s). Elsewhere the flow's item-by-item animation comes from the Flows panel.

## Loader

A loader shows while the site starts. Its default look (the white Dorma logo on the dark site background, wiping in over a CMYK colour line) is written into `index.html`, so it appears before any script runs. The logo files are `public/brand/dorma-logo-white.png` (header and dark loader) and `public/brand/dorma-logo.png` (colour, used on the white loader background). The header logo is set in Site and titles → Logo; the loader uses it unless another image is picked.

In the studio, **Site and titles → Loader** sets what it shows (the logo image, another library image, a typed wordmark, or an SVG logo), the animation (Reveal, Draw, Pulse), the exit, the background and the minimum time. The published settings are remembered in each visitor's browser, so returning visitors see them from the first frame. The Draw animation needs an SVG logo.

## Set up (once)

1. **Database.** Run `supabase/migrations/0001_site_config.sql` in the project's SQL Editor (done for Dorma
   on 2026-11-24). Later changes go live from GitHub, see [docs/supabase-deploy.md](docs/supabase-deploy.md).
2. **Your editor account.** In Supabase: **Authentication → Users → Add user → Create new user**, enter
   your email and a password, tick **Auto Confirm User**. Then in the SQL Editor:
   ```sql
   insert into public.editors (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
   Repeat for each editor. To remove one: `delete from public.editors where user_id = (select id from auth.users where email = '…');`
3. **Close public sign-ups** (recommended): **Authentication → Sign In / Providers → Allow new users to
   sign up** off. Editors are added by you as above, so nobody else needs to sign up.
4. **Hosting.** Pick one:
   - **GitHub Pages**: Settings → Pages → Source: **GitHub Actions**. Every push to `main` tests, builds
     and publishes. GitHub Pages on a *private* repository needs a paid GitHub plan.
   - **Cloudflare Workers** (free, works with private repositories): connect the repository in Cloudflare
     → Workers & Pages → Create → Import a repository. `wrangler.jsonc` has the settings.
5. Open the site, go to `#admin`, sign in, edit, then **Publish**. Until the first publish, visitors see
   the starter template.

The Supabase Free plan pauses a project after about a week without any visits. Restoring it from the
dashboard is free and keeps everything.
