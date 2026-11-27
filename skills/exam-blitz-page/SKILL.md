---
name: exam-blitz-page
description: Build a one-page, read-top-to-bottom "blitz" study page for a student who has an exam very soon and no background in the course (missed the classes, never saw the slides). Use when someone asks for an emergency, last-minute, cram or "start from zero" revision page, or asks to make a study guide less intimidating. Covers page structure, explanation depth, worked-answer layout, plain wording, visual design, phone layout for maths, and the checks to run before calling it done.
---

# Exam blitz page

A blitz page is read from top to bottom by someone with very little time and no other material, who does the questions on it and uses nothing else.

## Who the page is for

Assume the reader knows school maths and nothing about the course. Every symbol, term and method must be explained on the page before it is used. The reader will not look anything up and will not ask a teacher.

A long multi-page guide is intimidating to someone in this position. Give them one page to read from start to finish (for example "End-sem Blitz").

## Structure

Put these sections in this order.

1. **Read this first.** List the syllabus topics in the order the page covers them, with a time budget for each that adds up correctly. Say which parts matter most if time runs out. Explain how the exam is marked (for example, a correct formula with no steps may get 0 marks). Say plainly what the page is based on and what is uncertain, such as a syllabus taken from a photo of the board, or topics with no past questions.
2. **Part 0, the basics.** Teach every background idea that the later parts use, with a tiny example for each. Put one or two "Try it" questions at the end of each basics section.
3. **One part per syllabus topic.** For each part, give:
   - a plain explanation of what the model or system is
   - a box headed "Write this in the exam" with the full derivation as numbered steps
   - a short "Remember" box with the key results
   - three or four questions, with past-paper questions marked as such
4. **Formula sheet.** One table listing each formula and the section it comes from.
5. **In the exam hall.** How to match a question to a part of the page, what to write first, and quick checks on the answer (a probability lies between 0 and 1, a sine cannot exceed 1, and so on).

Put a back-to-top button on the page.

## Explanation depth

The most common gap is a skipped step or an unexplained symbol. Aim for more detail than feels necessary.

**Explain every symbol where it first appears**, not in a later section. Watch especially for these:
- Σ (say what it adds up, and write it out as k₁ + k₂ + …)
- ∝ ("proportional to"), ~ ("grows like"), ⟺ ("if and only if"), |a|, ⟨k⟩
- Greek letters (name them: gamma, alpha, nu, lambda)
- the constants in a formula such as C k^(−γ)
- binomial notation, det, the identity matrix I, partial derivatives, arcsin and radians

**After every formula that matters, add a "Reading the formula" box.** It should:
- say what each part means: the top, the bottom, each symbol
- say why the formula has that form (for example, dividing by the total makes the probabilities add up to 1)
- work a small numeric example with three to five items
- connect the formula to how it is used later ("Step 2 of 1A uses this")

**Explain where each name comes from.** Terms like "scale-free" or "master equation" are easier to remember and use when the reason for the name is given in one or two sentences.

**Give the reason behind each rule as well as the rule.** For example, show why f′(x*) < 0 means stable. Derive the 2×2 eigenvalue shortcut instead of quoting it, and explain why the stability test is T < 0 and D > 0.

**Two levels for every derivation.** A box that both explains and shows what to write ends up with 18 to 20 steps, which is overwhelming. Split each "Write this in the exam" box in two.
- First, a short numbered list of 4 to 8 **lines**. These are what to write on the exam paper, and the reader sees the shape of the proof at once.
- Under each line, a small collapsed "Why (3 steps)" button. It opens that line's one-action-per-step explanation in place, so the reader never leaves the line. The button sits under its line, so do not repeat the line number in the label. When one explanation covers two lines, attach it to the second and say so: "Why (covers lines 1 and 2, 7 steps)". Number the small steps from 1 in each explanation. When a step depends on another line, refer to the short line ("both sides of line 3"), not to a step hidden in another explanation. Add a "Close all explanations" button to each box that appears only when one is open. Style the "Why" buttons as quiet muted text links (44px tall, no border or fill), and put the tinted background only on the opened explanation. A bordered button under every line is too much visual noise. Make the explanations open and close smoothly with CSS alone: `:root{interpolate-size:allow-keywords}`, then animate `details::details-content` from `height:0` to `height:auto` (with `overflow:clip` and `content-visibility … allow-discrete` in the transition), and turn it off under `prefers-reduced-motion`.
- Point every "Where it comes from" row at the short lines ("1A, line 6"), not at the small steps. Tell the reader on the page how to use the two levels.

**One action per step** (in the detailed level). Each numbered step does one thing: one rearrangement, one substitution, one rule applied or one fact stated. Keep it to one or two short sentences. Do not chain "Each step adds m links, and each attaches with probability Π…, so on average…, treat k as smooth, so dk/dt = …" into one step. That is four steps. A derivation with 15 or 20 short steps is easier to follow and to reproduce in an exam than one with 6 dense steps. To audit a page, list every step with four or more sentences and split each of them.

**Justify every modelling move.** Steps like "treat k as a smooth function of t" or "treat t as continuous" are the ones a beginner asks "why/how" about. Spell out what is being approximated and why it is allowed. For example, the average change per step Δk/Δt (with Δt = 1) becomes dk/dt because, once the network is large, each whole-number jump is tiny compared with k and the jumps average out. Name the idea (here, the continuum approximation). Where later sections reuse the move, point back to the steps that justify it.

**Never skip a step in a derivation or a worked answer.** Show:
- each rearrangement ("Divide both sides by k", "Square both sides")
- each log or exponent rule as you use it
- each substitution and each piece of arithmetic
- each cancellation, saying which factors cancel
- a check at the end (substitute the answer back, or recompute it a second way)

Never write "write out the steps above" or "these mostly cancel". Phrases like "try k = at" or "the general solution is" need the working that justifies them, so substitute the trial solution and show that it satisfies the equation.

When a derivation gains or loses steps, update every reference that points to its step numbers. That includes "Where it comes from" rows, the "Reading the formula" boxes ("Step 6 of 1A uses this") and references between derivations ("1A, steps 2 and 6"). Keep a list of old-to-new references and print how many times each one was replaced, so you notice any that matched nothing.

## Worked-answer layout

Every answer to a question has three labelled rows:

| Label | Content |
|---|---|
| Formula | the formula to use |
| Where it comes from | the exact derivation and step, for example "1A, step 7" |
| Working | numbered steps that put the numbers in, ending with a check |

With this layout, a similar question in the exam can be done by following the same three steps. Put answers inside collapsible `<details>` blocks so the reader tries the question on paper first.

Write the questions yourself for any topic with no past paper, in the style of the real papers, and say on the page that you wrote them. Check all the arithmetic by hand.

## Wording

- Say things plainly. Do not personify. Nodes do not "prefer", "grab" or "take" links, and oscillators do not "ignore" or "follow" each other. Avoid analogies that make objects act like people, such as runners on a track or a pacemaker. Write what the equation does: "a link is more likely to attach to a node of high degree".
- Follow normal readable-prose rules:
  - no semicolons or em dashes, and no colons in the middle of a sentence
  - no rule-of-three lists
  - sentence-case headings and labels
  - plain verbs
- Do not use "iff" or other shorthand on the page. Write "if and only if".

## Visual design

Follow the ui-skills.com design rules:
- `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs
- `font-variant-numeric: tabular-nums` in tables
- sentence-case tags (no all-caps labels)
- touch targets at least 44px
- a small `scale(.98)` effect on `:active`
- one accent colour
- light and dark themes from CSS tokens

**Do not give cards a coloured left strip** (`border-left: 4px solid …`). It reads as a sign of AI-generated design.

**Do not put a scroll box on every equation.** `overflow-x: auto` on inline maths makes Windows draw scroll arrows on almost every formula, because MathML is often a pixel or two taller than its box. Allow scrolling only on display (block) maths, with `overflow-y: hidden`, and make sure nothing actually needs to scroll.

## Maths on a phone

Inline MathML does not wrap, so long equation chains spill off a phone screen. These fixes worked:
- Give grid and flex items `min-width: 0` so that columns can shrink.
- Split long inline chains at their top-level "=" signs into separate inline maths joined by `<wbr>`. Start each piece after the first with `{}=` so the relation keeps its spacing. Do this only outside braces, and only for chains longer than about 30 characters. Make the splitter safe to run twice: skip an "=" when the text before it is empty or only `{}`. Otherwise a second pass leaves empty `\({}\)` pieces behind. After any rerun, search for `\({}\)`.
- Do not use `aligned` environments. Chrome's MathML spreads the columns far apart, so a two-line aligned equation reads as floating pieces. Shorten the equation instead (for example, move a term to the left: N(k,t+1) − N(k,t) = …). If it still cannot fit a phone, write a one-line version and a two-line version, and show each one only at its screen width (`.eqw` / `.eqn` with a 600px media query).
- Give a long point or matrix a short name first ("write c = √(β(ρ−1))"), then display the shorter form.
- Show matrices as display maths, not inline.
- Write √(t/5) on one line rather than as the square root of a stacked fraction.
- Shrink display maths slightly below 600px wide (`font-size: .88em`).

## Checks before finishing

Use headless Chrome (Puppeteer) with every `<details>` opened, at 360, 390 and 1100px wide. The page is finished when all of these hold:
- the page's `scrollWidth` equals the viewport width
- no `li` or `p` in `main` has `scrollWidth > clientWidth`
- no maths element with an overflow setting has horizontal overflow
- the build reports 0 TeX errors

Also take screenshots of a few answers and derivation boxes and look at them. This is how the stray scrollbars, the clipped lines and the awkward square root were found.

## Workflow notes

- Open the page locally as soon as there is something to read, so the student can start while you keep working, and tell them to refresh.
- Build, commit and push after each change. If the site exists in more than one repo, sync every copy and check the copies match.
- If the network is down, commit locally and retry the push in the background. Tell the student that the live site is behind but their local copy is up to date.
- Generate long HTML edits from a Python script written to a file. Do not pipe the script through a shell heredoc, because that removed backslashes from TeX and regex patterns and corrupted the output. In Python, keep TeX in raw strings, and watch for `\'` inside raw strings, which stays as two characters.
- When the student reports one problem, such as a skipped step or an unexplained formula, treat it as an example of a class of problem and audit the whole page for that class. They will ask about the rest anyway.
