// Check every relative link and #anchor in the built SMAI pages, and list slide images no page uses.
// node tools/links.mjs   (run from smai/)
import fs from 'node:fs';
import path from 'node:path';

const files = ['index.html', ...fs.readdirSync('2026', { recursive: true }).filter(f => f.endsWith('.html')).map(f => path.join('2026', f))];
const ids = new Map();
const idsOf = f => {
  if (!ids.has(f)) ids.set(f, fs.existsSync(f) ? new Set([...fs.readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map(m => m[1])) : null);
  return ids.get(f);
};
let bad = 0;
const used = new Set();
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(href)) continue;
    let [p, hash] = href.split('#');
    let target = p ? path.normalize(path.join(path.dirname(f), p)) : f;
    if (p && (p.endsWith('/') || (fs.existsSync(target) && fs.statSync(target).isDirectory()))) target = path.join(target, 'index.html');
    if (/slides[\\/]/.test(target)) used.add(path.relative('.', target).replace(/\\/g, '/'));
    if (!fs.existsSync(target)) { bad++; console.log(`${f}: missing ${href}`); continue; }
    if (hash && target.endsWith('.html')) {
      const s = idsOf(target);
      if (s && !s.has(hash)) { bad++; console.log(`${f}: no #${hash} in ${target}`); }
    }
  }
}
const all = fs.readdirSync('assets/slides', { recursive: true }).filter(f => f.endsWith('.webp')).map(f => 'assets/slides/' + f.replace(/\\/g, '/'));
const unused = all.filter(f => !used.has(f));
console.log(`${bad} broken links or anchors. ${all.length} slide images, ${unused.length} unused${unused.length ? ':\n  ' + unused.join('\n  ') : ''}`);
