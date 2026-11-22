# Design system (home page only)

Direction: **library catalogue**. Courses are entries in a printed course list, not product cards. Rows separated by hairline rules, a mono course code in the margin, a serif description you can actually read.

## Type
- Display and UI: Schibsted Grotesk 600/700
- Reading text: Source Serif 4, 17px/1.55, max 62ch
- Codes and counts: JetBrains Mono 13px
- Hierarchy comes from size and weight, never from a badge above the heading.

## Colour
Cool paper, not cream. Every course gets one ink colour, used only for its code and the hover state of its links.

| token | light | dark |
|---|---|---|
| --paper | #f5f6f8 | #111317 |
| --ink | #15181d | #e9ebef |
| --muted | #525a66 | #a3abb7 |
| --rule | #d7dbe1 | #2a2f37 |
| --link | #1d4fa8 | #8fb4ff |

Course inks (light / dark): anlp #a63a17 / #ff9a76, dpcn #0f6b55 / #5fd3b1, paa #9b2c5c / #ff8fbf, sdet #2a55a8 / #8fb0ff, sociology #7a5200 / #e9b860. All meet WCAG AA on their paper.

## Layout
- One column, max 52rem. Rows use a two-column grid (code margin + body) above 720px, stacked below.
- Spacing: 8px base. Rows 32px apart inside, 72px between term sections.
- No cards, no shadows, no gradients, no motion beyond a 120ms colour change on hover.
