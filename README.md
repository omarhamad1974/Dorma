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
| `src/studio/store.ts` | Supabase: loading, autosave, publish, sign-in and uploads. Falls back to browser storage offline. |
| `src/studio/scenes.js` | Generated placeholder images used until real photos are uploaded. |
| `scripts/library-index.mjs` | Lists the files in `public/library/` for the studio (runs before dev and build). |

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
