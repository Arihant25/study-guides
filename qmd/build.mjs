// Build: node build.mjs
// Joins src/*.html in name order, draws the plots, splits long inline equations at their "=" signs
// so they can wrap on a phone, renders \( \) and \[ \] TeX to MathML with temml, and writes index.html.
import fs from 'node:fs';
import path from 'node:path';
import temml from 'temml';
import { plot, range } from './plot.mjs';

/* ---------------- plots ---------------- */
const pibPlot = (prob) => {
  const xs = range(0, 1, 120), lv = [1, 4, 9], cols = ['--c1', '--c2', '--c3'];
  const series = [], texts = [];
  lv.forEach((E, i) => {
    const n = i + 1, amp = prob ? 1.1 : 1.2;
    series.push({ pts: [[0, E], [1, E]], c: '--axis', dash: '4 4', w: 1.2 });
    series.push({ pts: xs.map(x => [x, E + amp * (prob ? Math.sin(n * Math.PI * x) ** 2 : Math.sin(n * Math.PI * x))]), c: cols[i], w: 2.4 });
    texts.push({ x: 1, y: E, dx: 8, dy: 4, t: `n = ${n}, E = ${E}E₁`, c: cols[i] });
  });
  return plot({ label: prob ? 'Probability densities of the first three states of a particle in a box' : 'Wavefunctions of the first three states of a particle in a box',
    x: [0, 1], y: [0, 10.6], w: 560, h: 330, mr: 120, ml: 44,
    xticks: [[0, '0'], [0.5, 'L/2'], [1, 'L']], yticks: [[0, '0'], [1, 'E₁'], [4, '4E₁'], [9, '9E₁']],
    xlabel: 'position x', ylabel: prob ? '|ψ|² drawn on its energy level' : 'ψ drawn on its energy level', series, texts });
};
const dosPanel = (kind) => {
  const o = { w: 260, h: 200, ml: 34, mb: 36, mr: 10, x: [0, 10], y: [0, 10], xticks: [], yticks: [], xlabel: 'energy E', ylabel: 'Z(E)' };
  if (kind === '3d') o.series = [{ pts: range(0, 10, 80).map(E => [E, 3 * Math.sqrt(E)]), c: '--c1', w: 2.6 }];
  if (kind === '2d') o.series = [{ pts: [[0, 0], [2, 0], [2, 3], [5, 3], [5, 6], [8, 6], [8, 9], [10, 9]], c: '--c2', w: 2.6 }];
  if (kind === '1d') {
    const pts = []; [1.5, 4.5, 8].forEach((En, i, a) => { const end = a[i + 1] ?? 10.01; range(En + 0.04, end - 0.01, 60).forEach(E => { let s = 0; a.forEach(e => { if (E > e) s += 1.4 / Math.sqrt(E - e); }); pts.push([E, Math.min(s, 9.8)]); }); });
    o.series = [{ pts: [[0, 0], [1.5, 0]], c: '--c3', w: 2.6 }, { pts, c: '--c3', w: 2.6 }];
  }
  if (kind === '0d') o.series = [1.5, 4, 7.5].map(E => ({ pts: [[E, 0], [E, 9]], c: '--c4', w: 3 }));
  o.label = 'Density of states in ' + kind.toUpperCase();
  return plot(o);
};
const plots = {
  'pib-psi': () => pibPlot(false),
  'pib-prob': () => pibPlot(true),
  'fd': () => {
    const kT = { 300: 0.02585, 1000: 0.0862 }, Es = range(-0.5, 0.5, 200);
    return plot({ label: 'Fermi-Dirac occupation at three temperatures', x: [-0.5, 0.5], y: [0, 1.05], w: 520, h: 280,
      xticks: [[-0.4, '−0.4'], [-0.2, '−0.2'], [0, 'μ'], [0.2, '0.2'], [0.4, '0.4']], yticks: [[0], [0.5], [1]], xlabel: 'E − μ (eV)', ylabel: 'occupation n(E)',
      series: [{ pts: [[-0.5, 1], [0, 1], [0, 0], [0.5, 0]], c: '--muted-fg', dash: '5 4', w: 1.8 },
        { pts: Es.map(E => [E, 1 / (Math.exp(E / kT[300]) + 1)]), c: '--c2', w: 2.4 },
        { pts: Es.map(E => [E, 1 / (Math.exp(E / kT[1000]) + 1)]), c: '--c1', w: 2.4 }],
      texts: [{ x: -0.48, y: 0.9, t: 'T = 0 (step)', c: '--muted-fg' }, { x: 0.06, y: 0.12, t: '300 K', c: '--c2' }, { x: 0.2, y: 0.3, t: '1000 K', c: '--c1' }] });
  },
  'dos-3d': () => dosPanel('3d'), 'dos-2d': () => dosPanel('2d'), 'dos-1d': () => dosPanel('1d'), 'dos-0d': () => dosPanel('0d'),
  'rt': () => {
    const Ts = range(0, 300, 120);
    return plot({ label: 'Resistance against temperature for a metal, a semiconductor and a superconductor', x: [0, 300], y: [0, 10], w: 540, h: 300,
      xticks: [[0, '0 K'], [40, 'Tc'], [100], [200], [300]], yticks: [], xlabel: 'temperature T (K)', ylabel: 'resistance R',
      series: [{ pts: Ts.map(T => [T, 1.2 + 0.018 * T + 3e-7 * T ** 3 / 10]), c: '--c3', w: 2.4 },
        { pts: Ts.filter(T => T > 18).map(T => [T, Math.min(10, 0.6 + 2.5 * Math.exp(400 / T) / Math.exp(400 / 60))]), c: '--c2', w: 2.4 },
        { pts: [[0, 0], [40, 0], [40, 0.25 + 0.016 * 40], ...Ts.filter(T => T > 40).map(T => [T, 0.25 + 0.016 * T])], c: '--c1', w: 2.6 }],
      vlines: [{ x: 40 }],
      texts: [{ x: 300, y: 6.9, dy: -6, a: 'end', t: 'metal: R rises with T', c: '--c3' }, { x: 70, y: 8.6, t: 'semiconductor: R falls as T rises', c: '--c2' },
        { x: 300, y: 5.05, dy: 18, a: 'end', t: 'superconductor: R = 0 below Tc', c: '--c1' }] });
  },
  'hc': () => plot({ label: 'Critical field against temperature', x: [0, 1.15], y: [0, 1.15], w: 420, h: 260, xticks: [[0, '0'], [0.5, 'Tc/2'], [1, 'Tc']], yticks: [[0, '0'], [0.75, '¾H₀'], [1, 'H₀']],
    xlabel: 'temperature T', ylabel: 'critical field Hc',
    series: [{ pts: range(0, 1, 60).map(t => [t, 1 - t * t]), c: '--c1', w: 2.6 }, { pts: [[0.5, 0], [0.5, 0.75], [0, 0.75]], c: '--muted-fg', dash: '3 4', w: 1.2 }],
    texts: [{ x: 0.08, y: 0.3, t: 'superconducting', c: '--c1' }, { x: 0.72, y: 0.85, t: 'normal', c: '--muted-fg' }] }),
  'squid': () => plot({ label: 'Voltage across a dc SQUID against the flux through it', x: [0, 3], y: [0, 1.15], w: 500, h: 240, xticks: [[0], [1, 'Φ₀'], [2, '2Φ₀'], [3, '3Φ₀']], yticks: [],
    xlabel: 'magnetic flux Φ through the loop', ylabel: 'voltage V',
    series: [{ pts: range(0, 3, 240).map(f => [f, 0.15 + 0.85 * (1 - Math.abs(Math.cos(Math.PI * f)))]), c: '--c1', w: 2.4 }],
    texts: [{ x: 1.5, y: 1.08, t: 'one period = Φ₀ = h/2e', a: 'middle', c: '--fg' }] }),
  'coulomb': () => plot({ label: 'Current through a single-electron transistor against gate voltage', x: [0, 4], y: [0, 1.1], w: 500, h: 220, xticks: [], yticks: [],
    xlabel: 'gate voltage Vg', ylabel: 'current I',
    series: [{ pts: range(0, 4, 400).map(v => { const d = v - Math.round(v - 0.5) - 0.5; return [v, Math.exp(-(d * d) / 0.006)]; }), c: '--c1', w: 2.2 }],
    texts: [{ x: 1, y: 0.55, t: 'blocked', a: 'middle', c: '--muted-fg' }, { x: 2, y: 0.55, t: 'blocked', a: 'middle', c: '--muted-fg' }, { x: 3, y: 0.55, t: 'blocked', a: 'middle', c: '--muted-fg' }] }),
  'diode': () => plot({ label: 'Current against voltage for an ideal diode', x: [-1, 0.8], y: [-0.3, 3], w: 460, h: 250, xaxisAt: 0, yaxisAt: 0, xticks: [], yticks: [],
    xlabel: 'voltage V', ylabel: 'current I',
    series: [{ pts: range(-1, 0.72, 160).map(v => [v, 0.004 * (Math.exp(v / 0.08) - 1) - 0.12 * (v < 0 ? 1 - Math.exp(v / 0.05) : 0)]), c: '--c1', w: 2.4 }],
    texts: [{ x: 0.6, y: 2.6, dx: -8, a: 'end', t: 'forward bias: I rises fast', c: '--c1' }, { x: -0.95, y: 0.35, t: 'reverse bias: tiny current', c: '--muted-fg' }] }),
  'dirac': () => plot({ label: 'A parabolic band compared with a linear Dirac cone', x: [-1, 1], y: [-1, 1], w: 460, h: 280, xaxisAt: 0, yaxisAt: 0, xticks: [], yticks: [],
    xlabel: 'momentum k', ylabel: 'energy E',
    series: [{ pts: [[-1, 1], [0, 0], [1, 1]], c: '--c1', w: 2.6 }, { pts: [[-1, -1], [0, 0], [1, -1]], c: '--c1', w: 2.6 }, { pts: range(-0.85, 0.85, 60).map(k => [k, 0.15 + 1.2 * k * k]), c: '--c2', w: 2.2, dash: '6 4' }],
    texts: [{ x: 0.95, y: 0.8, a: 'end', dy: 24, t: 'Dirac cone, E = ±ħv|k|', c: '--c1' }, { x: -0.86, y: 0.55, t: 'ordinary band, E ∝ k²', c: '--c2' }] }),
  'stm': () => plot({ label: 'Tunnelling current against tip distance', x: [0.2, 1], y: [0, 1.05], w: 460, h: 240, xticks: [[0.2, '0.2'], [0.4, '0.4'], [0.6, '0.6'], [0.8, '0.8'], [1, '1.0']], yticks: [[0], [0.5], [1]],
    xlabel: 'tip–sample distance d (nm)', ylabel: 'current I (relative)',
    series: [{ pts: range(0.2, 1, 120).map(d => [d, Math.exp(-23 * (d - 0.2))]), c: '--c1', w: 2.4 }],
    texts: [{ x: 0.32, y: 0.75, t: 'I falls about 10 times for every 0.1 nm', c: '--c1' }] }),
};

/* ---------------- TeX → MathML ---------------- */
let errors = 0;
const render = (tex, display) => {
  try { return temml.renderToString(tex, { displayMode: display, throwOnError: true }); }
  catch (e) { errors++; console.error('TeX error:', e.message, '\n  in:', tex.slice(0, 120)); return `<span style="color:red">[TeX error]</span>`; }
};
// Inline MathML cannot wrap, so a long chain a = b = c is split at its top-level "=" signs into
// separate pieces joined by <wbr>. Each later piece starts with {}= so the sign keeps its spacing.
// Splits only outside braces and \left...\right, and never leaves an empty piece.
let splits = 0;
const splitChain = tex => {
  if (tex.length <= 30 || /\\begin/.test(tex)) return [tex];
  const parts = []; let depth = 0, start = 0;
  for (let i = 0; i < tex.length; i++) {
    const ch = tex[i];
    if (tex.startsWith('\\left', i)) { depth++; i += 4; continue; }
    if (tex.startsWith('\\right', i)) { depth--; i += 5; continue; }
    if (ch === '{') depth++; else if (ch === '}') depth--;
    else if (ch === '=' && depth === 0 && tex[i - 1] !== '\\') {
      const before = tex.slice(start, i).trim();
      if (before && before !== '{}') { parts.push(tex.slice(start, i)); start = i; }
    }
  }
  parts.push(tex.slice(start));
  return parts.map((p, i) => i ? '{}' + p : p);
};

const files = fs.readdirSync('src').filter(f => f.endsWith('.html')).sort();
let html = files.map(f => fs.readFileSync(path.join('src', f), 'utf8')).join('\n');
html = html.replace(/<!--plot:([\w-]+)-->/g, (m, name) => {
  if (!plots[name]) throw new Error('unknown plot ' + name);
  return plots[name]();
});
// A display equation made of parts joined by \qquad (or \quad\text{...}\quad) is too wide for a
// phone. Render it whole for wide screens (.eqw) and as stacked parts below 600px (.eqn).
const splitDisplay = tex => {
  const parts = []; let depth = 0, start = 0;
  for (let i = 0; i < tex.length; i++) {
    if (tex[i] === '{') depth++; else if (tex[i] === '}') depth--;
    if (depth) continue;
    const m = tex.slice(i).match(/^(\\qquad|\\quad\\text\{[^}]*\}\\quad)/);
    if (m) { parts.push(tex.slice(start, i)); start = i + m[0].length; i = start - 1; }
  }
  parts.push(tex.slice(start));
  return parts.map(p => p.trim().replace(/,$/, '').trim()).filter(Boolean);
};
html = html.replace(/\\\[([\s\S]+?)\\\]/g, (m, t) => {
  const parts = splitDisplay(t.trim());
  if (parts.length < 2) return render(t.trim(), true);
  return `<span class="eqw">${render(t.trim(), true)}</span><span class="eqn">${parts.map(p => render(p, true)).join('')}</span>`;
});
html = html.replace(/\\\(([\s\S]+?)\\\)/g, (m, t) => {
  const parts = splitChain(t.trim());
  if (parts.length > 1) splits++;
  return parts.map(p => render(p, false)).join('<wbr>');
});
fs.writeFileSync('index.html', html);
console.log(`index.html written (${(html.length / 1024).toFixed(0)} KB) from ${files.length} parts, ${splits} long equations split`);
console.log(`${errors} TeX errors`);
if (errors) process.exit(1);
