# Illustrated admin manual (PDF)

The large-print, illustrated studio manual is built from these files. The finished PDF lives in the
project files as `dorma/admin-manual.pdf` (about 10 MB, so it is not kept in the repository).
`docs/admin-manual.md` is the plain-text version of the same content.

## Rebuild

1. Start the studio: `npx vite --port 5174` (normal online build).
2. Take the screenshots: from `docs/manual/screenshots/`, run `node c1.cjs`, `node c1b.cjs`, … `node c11.cjs`.
   `mock.cjs` answers every Supabase call with sample data (a signed-in editor, two sample Inbox
   messages, sample versions and keep-alive pings, the AI and Find photos services as "ready"), so no
   real data is read or changed. Pictures go to `shots/`; convert them to JPEG in `docs/manual/img/`
   (the manual uses `img/<name>.jpg` and `img/dorma-logo.png`).
3. Edit the text in `content.py` (helpers: `ch`, `sec`, `p`, `steps`, `bullets`, `tip`, `warn`, `fig`, `table`, `gloss`).
4. Build: `python3 build.py && node pdf.cjs && python3 pages.py && python3 build.py final && node pdf.cjs`.
   The second pass fills the page numbers in the contents.
