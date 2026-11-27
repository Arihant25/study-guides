// Layout check for the built pages (the checks from skills/exam-blitz-page/SKILL.md).
// node check.mjs [shotsDir]   Opens every <details>, then at 360, 390 and 1100 px wide reports:
// page scrollWidth wider than the viewport, li/p in main that overflow sideways, display maths that
// overflows, broken images, and h2s without ids. With shotsDir, also saves a 390px full-page screenshot.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const shots = process.argv[2];
const pages = ['index.html'];
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
let problems = 0;
for (const file of pages) {
  for (const width of [360, 390, 1100]) {
    const p = await b.newPage();
    await p.setViewport({ width, height: 900 });
    await p.goto(pathToFileURL(path.resolve(file)).href, { waitUntil: 'load' });
    const r = await p.evaluate(async () => {
      document.querySelectorAll('details').forEach(d => d.open = true);
      document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager');
      await new Promise(r => setTimeout(r, 400));
      await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
      const vw = document.documentElement.clientWidth;
      const out = { page: document.documentElement.scrollWidth - vw, items: [], maths: [], imgs: [], noid: [] };
      document.querySelectorAll('main li, main p').forEach(e => {
        if (e.scrollWidth > e.clientWidth + 1) out.items.push(e.textContent.trim().slice(0, 70));
      });
      document.querySelectorAll('main math[display="block"], main .eq').forEach(e => {
        const cs = getComputedStyle(e);
        if (/auto|scroll/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1) out.maths.push(e.textContent.trim().slice(0, 50));
      });
      document.querySelectorAll('main img').forEach(i => { if (!i.naturalWidth) out.imgs.push(i.getAttribute('src')); });
      document.querySelectorAll('main h2').forEach(h => { if (!h.id) out.noid.push(h.textContent.slice(0, 40)); });
      return out;
    });
    const bad = r.page > 0 || r.items.length || r.maths.length || r.imgs.length || r.noid.length;
    if (bad) {
      problems++;
      console.log(`\n${file} @ ${width}px: page overflow ${r.page}px`);
      for (const [k, v] of Object.entries(r)) if (Array.isArray(v) && v.length) console.log(`  ${k} (${v.length}):`, v);
    }
    if (shots && width === 390) {
      fs.mkdirSync(shots, { recursive: true });
      await p.screenshot({ path: path.join(shots, file.replace(/[\\/]/g, '_') + '.png'), fullPage: false });
    }
    await p.close();
  }
}
await b.close();
console.log(`\n${pages.length} pages checked, ${problems} page/width combinations with problems`);
