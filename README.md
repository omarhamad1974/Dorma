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
