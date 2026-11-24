// Lists every file under public/library/ in public/library/index.json, so the studio can show
// files added on GitHub. Runs before `npm run dev` and `npm run build`; index.json is not committed.
// Each top-level folder is a category: public/library/<category>/<file>.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const ROOT = 'public/library';
const KIND = {
  image: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg'],
  video: ['.mp4', '.webm'],
  article: ['.pdf'],
};
const kindOf = (f) => Object.keys(KIND).find((k) => KIND[k].includes(extname(f).toLowerCase()));

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir).sort()) {
    if (name.startsWith('.') || name === 'index.json' || /^readme\.md$/i.test(name)) continue;
    const p = join(dir, name), st = statSync(p);
    if (st.isDirectory()) { walk(p); continue; }
    const kind = kindOf(name);
    if (!kind) continue;
    const path = relative(ROOT, p).split(sep).join('/');
    files.push({ path, kind, category: path.includes('/') ? path.split('/')[0] : '', size: st.size, modified: st.mtime.toISOString().slice(0, 10) });
  }
};
const folders = readdirSync(ROOT).filter((n) => !n.startsWith('.') && statSync(join(ROOT, n)).isDirectory()).sort();
walk(ROOT);
writeFileSync(join(ROOT, 'index.json'), JSON.stringify({ generated: new Date().toISOString(), folders, files }, null, 1));
console.log(`library: ${files.length} file(s) in ${folders.length} folder(s)`);
