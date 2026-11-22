# Contributing

Thanks for helping. Most contributions are small fixes, and those are the most useful kind.

## Reporting a mistake

[Open an issue](https://github.com/Arihant25/study-guides/issues/new?template=mistake.yml) with a link to the page and the section. Quote the wrong text and say what it should be. If you are not sure whether something is wrong, open the issue anyway.

## Fixing something yourself

1. Fork the repo and create a branch.
2. Edit the HTML in the course folder. Guides are plain HTML, so there is nothing to build, except for DPCN (see below).
3. Serve the repo root with `python -m http.server` and check the page in a browser, including at phone width.
4. Open a pull request that says what changed and why.

Keep links relative (`../lectures/2-transformers.html`, not `/anlp/...` or a full URL) so that they work both locally and on GitHub Pages.

### DPCN

The pages in `dpcn/quiz1/`, `dpcn/midsem/` and so on are generated. Edit the matching `dpcn/src-*` folder, then run:

```sh
cd dpcn
npm install
node build.mjs
```

## Adding a guide for a new course

1. Make a folder named after the course's short name in lowercase, for example `os/` or `cn/`. Put the guide's `index.html` in it, along with any CSS, JavaScript and images it needs.
2. On the home page (`index.html`), copy one `<article class="course">` block into the right term section. Fill in the code, title, one or two sentences on what the guide covers, and links to its main parts. If the term doesn't exist yet, add a new `<section class="term">` above the older ones.
3. Give the course a colour. Add a `--<name>` token for light and dark mode at the top of the `<style>` block and a `.<name> { --c: var(--<name>); }` rule. Check that the colour has at least 4.5:1 contrast against the page background in both modes.
4. Add the guide's pages to `sitemap.xml` and add a row to the table in `README.md`.

### What a guide should be like

- It assumes the reader has not attended the lectures.
- It defines each symbol and term where it first appears.
- It works through past papers when they are available, and it shows the working.
- It works on a phone and prints without losing content.
- It credits slides and papers to their source.

## Writing style

Write plain sentences that a tired student can follow the first time through. Prefer short paragraphs and worked examples to long lists. Avoid filler like "it is important to note that".

## Licensing of contributions

By contributing you agree that your notes are released under CC BY-SA 4.0 and your code under MIT, as described in the [README](README.md#license).
