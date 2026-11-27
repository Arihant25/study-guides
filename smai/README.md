# SMAI study guide

Notes for **Statistical Methods in AI (CS7.403)** at IIIT Hyderabad.

- `index.html` is the landing page. The Spring 2027 guide is coming soon and will be built from the 2027 slides.
- `2026/` is a prep guide built from the Spring 2026 offering (C. V. Jawahar): all 26 lectures, the Quiz 1 paper with its rubric, and the course's short videos. It is generated, so do not edit it by hand.

## Building the 2026 prep guide

The pages are written in `src/2026/*.html`. The shared CSS and script are in `src/style.css` and `src/site.js`.

```sh
cd smai
npm install
node build.mjs
```

`build.mjs` adds the sidebar and page navigation, builds the "On this page" list from each `<h2 id>`, renders `\( \)` and `\[ \]` TeX to MathML with temml, and writes `2026/<page>/index.html`. It must report `0 TeX errors`.

Slides shown in the guide are WebP files in `assets/slides/Lxx/`. `tools/slide.sh L06 12 13` renders pages 12 and 13 of the L06 deck (it reads the PDFs from a local folder, so edit `SRC` in the script to point at yours).

The pages follow `skills/exam-blitz-page/SKILL.md` at the repo root.
