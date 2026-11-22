# Surface: home (index.html)

- **Mode:** Read (its job is routing to reading material).
- **Purpose:** list every guide, grouped by term, with deep links to each guide's main parts.
- **Direction chosen:** library catalogue (see ../DESIGN.md). Rejected: card grid (every guide gets equal weight and the deep links have nowhere to go), big hero (pushes the list below the fold on phones).
- **Build path:** code-led.
- **Constraints:** works without JS; no claims we can't back (no visitor counts); text follows the humanize-text rules.
- **Adding a guide:** copy one `<article class="course">` block inside the right term `<section>`.
- **Open questions:** when a second term arrives, should the newest term stay on top? (Assumed yes.)
