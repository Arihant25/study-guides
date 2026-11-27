// Build: node build.mjs
// Each page of the 2026 prep guide is one file in src/2026/. This script wraps it in the shared
// head, sidebar and scripts, builds the "On this page" list from its <h2 id> headings, renders
// \( \) and \[ \] TeX to MathML with temml, and writes 2026/<slug>/index.html.
import fs from 'node:fs';
import path from 'node:path';
import temml from 'temml';

const PAGES = [
  { slug: '', src: 'start.html', n: '0', title: 'Start here', sub: 'How the course runs, what to revise, the plan' },
  { slug: 'basics', src: 'basics.html', n: 'B', title: 'Maths basics', sub: 'Vectors, matrices, eigenvectors, probability, gradients' },
  { slug: 'foundations', src: 'foundations.html', n: '1', title: 'Foundations', sub: 'L01–L07: k-NN, regression, rank, SVD, PCA, Quiz 1' },
  { slug: 'probabilistic', src: 'probabilistic.html', n: '2', title: 'Probabilistic ML', sub: 'L08–L13: LDA, LSI, Bayes, MLE, GMM, SVM, generalisation' },
  { slug: 'neural', src: 'neural.html', n: '3', title: 'Neural networks', sub: 'L14–L19: perceptron, MLP, backprop, training' },
  { slug: 'deep', src: 'deep.html', n: '4', title: 'Deep learning', sub: 'L20–L26: CNNs, RNNs, attention, transformers' },
  { slug: 'sheet', src: 'sheet.html', n: 'F', title: 'Formula sheet', sub: 'Every formula on one page, with where it comes from' },
];

const SITE = 'SMAI 2026 prep';
const css = fs.readFileSync('src/style.css', 'utf8');
const macros = { '\\R': '\\mathbb{R}', '\\T': '^{\\mathsf T}', '\\argmax': '\\operatorname*{arg\\,max}', '\\argmin': '\\operatorname*{arg\\,min}' };
let errors = 0;
const render = (tex, display) => {
  try { return temml.renderToString(tex, { displayMode: display, throwOnError: true, macros }); }
  catch (e) { errors++; console.error('TeX error:', e.message, '\n  in:', tex.slice(0, 140)); return `<span style="color:red">[TeX error]</span>`; }
};
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const strip = s => s.replace(/<[^>]+>/g, '').replace(/\\\(|\\\)/g, '').replace(/\s+/g, ' ').trim();

const built = PAGES.filter(p => fs.existsSync(path.join('src/2026', p.src)));

for (const page of built) {
  const root = page.slug ? '../' : '';       // from this page back to smai/2026/
  const href = p => root + (p.slug ? p.slug + '/' : '');
  let body = fs.readFileSync(path.join('src/2026', page.src), 'utf8');
  body = body.replace(/\{\{ASSETS\}\}/g, root + '../assets/');
  const meta = (body.match(/<!--desc:([\s\S]*?)-->/) || [, page.sub])[1].trim();

  // "On this page": every <h2 id> becomes a sidebar link. Headings may hold TeX, so strip it.
  const heads = [...body.matchAll(/<h2 id="([\w-]+)"[^>]*>([\s\S]*?)<\/h2>/g)].map(m => ({ id: m[1], text: strip(m[2].replace(/<span class="num">[\s\S]*?<\/span>/, '')) }));
  const pagesNav = `<nav class="pages" aria-label="Pages of the guide">${built.map(p =>
    `<a href="${href(p)}"${p === page ? ' aria-current="page"' : ''}><b>${p.n}</b><span>${p.title}<small>${p.sub}</small></span></a>`).join('')}</nav>`;
  const toc = heads.map(h => `<a href="#${h.id}">${esc(h.text)}</a>`).join('\n');
  const i = built.indexOf(page), prev = built[i - 1], next = built[i + 1];
  const pager = `<nav class="pager" aria-label="Previous and next page">${prev ? `<a href="${href(prev)}"><small>Previous</small>${prev.title}</a>` : '<span></span>'}${next ? `<a class="nx" href="${href(next)}"><small>Next</small>${next.title}</a>` : '<span></span>'}</nav>`;

  let html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${page.slug ? page.title + ' · ' : ''}SMAI 2026 prep · Statistical Methods in AI</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(meta)}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="${root}../../favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
${css}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to the notes</a>
<button class="themebtn" id="themebtn" type="button" aria-label="Switch colour theme (auto, light, dark)"><span class="ico" aria-hidden="true">◐</span> <span class="lbl">Auto</span></button>
<div class="wrap">
<aside class="toc">
  <div class="brand"><a href="${root}../">SMAI</a> · 2026 prep<small>Statistical Methods in AI (CS7.403)</small></div>
  ${pagesNav}
  <nav id="tocnav" aria-label="On this page">
  <div class="grp">On this page</div>
  ${toc}
  </nav>
  <a class="other" href="${root}../../">All study guides</a>
</aside>
<main id="main">
<div class="tocwrap-mobile">
<details class="mtoc"><summary><span class="here">${SITE} · ${page.title}</span><span class="mbtn">Menu</span></summary>
<div class="mpanel">
${pagesNav}
<div class="mgrp">On this page</div>
${toc}
<a href="${root}../../">All study guides</a>
</div>
</details>
</div>
${body}
${pager}
<p class="small credit">Built from the Spring 2026 offering of the course (slides by C. V. Jawahar, IIIT Hyderabad). The slides, quiz paper and solutions belong to the instructors and TAs and are used here for study. Notes under <a href="${root}../../LICENSE-CONTENT">CC BY-SA 4.0</a>. Found a mistake? <a href="https://github.com/Arihant25/study-guides/issues/new/choose">Open an issue</a>.</p>
</main>
</div>
<button class="totop" id="totop" type="button" aria-label="Back to top">↑</button>
<script>
${fs.readFileSync('src/site.js', 'utf8')}
</script>
</body>
</html>
`;
  html = html.replace(/\\\[([\s\S]+?)\\\]/g, (m, t) => render(t.trim(), true));
  html = html.replace(/\\\(([\s\S]+?)\\\)/g, (m, t) => render(t.trim(), false));
  const out = path.join('2026', page.slug, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log(`${out} written (${(html.length / 1024).toFixed(0)} KB, ${heads.length} sections)`);
}
console.log(`${errors} TeX errors`);
if (errors) process.exit(1);
