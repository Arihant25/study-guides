// Plot helper for static SVG charts, taken from dpcn/build.mjs. Colours come from the page's CSS tokens.
const f2 = v => (Math.round(v * 10) / 10).toString();
function plot(o) {
  const W = o.w || 520, H = o.h || 300, L = o.ml ?? 56, R = o.mr ?? 18, T = o.mt ?? 18, B = o.mb ?? 46;
  const [x0, x1] = o.x, [y0, y1] = o.y;
  const tx = v => o.logx ? Math.log10(v) : v, ty = v => o.logy ? Math.log10(v) : v;
  const sx = v => L + (tx(v) - tx(x0)) / (tx(x1) - tx(x0)) * (W - L - R);
  const sy = v => H - B - (ty(v) - ty(y0)) / (ty(y1) - ty(y0)) * (H - T - B);
  const inX = v => v >= Math.min(x0, x1) - 1e-12 && v <= Math.max(x0, x1) + 1e-12 && !(o.logx && v <= 0);
  const inY = v => v >= Math.min(y0, y1) - 1e-12 && v <= Math.max(y0, y1) + 1e-12 && !(o.logy && v <= 0);
  let s = `<svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.label || ''}">`;
  // grid + ticks
  (o.xticks || []).forEach(([v, lab]) => {
    s += `<line x1="${f2(sx(v))}" y1="${T}" x2="${f2(sx(v))}" y2="${H - B}" style="stroke:var(--grid)" stroke-width="1"/>`;
    s += `<text x="${f2(sx(v))}" y="${H - B + 17}" text-anchor="middle" class="tk">${lab ?? v}</text>`;
  });
  (o.yticks || []).forEach(([v, lab]) => {
    s += `<line x1="${L}" y1="${f2(sy(v))}" x2="${W - R}" y2="${f2(sy(v))}" style="stroke:var(--grid)" stroke-width="1"/>`;
    s += `<text x="${L - 7}" y="${f2(sy(v) + 4)}" text-anchor="end" class="tk">${lab ?? v}</text>`;
  });
  // axes
  const ax0 = o.xaxisAt !== undefined ? sy(o.xaxisAt) : H - B;
  s += `<line x1="${L}" y1="${f2(ax0)}" x2="${W - R}" y2="${f2(ax0)}" style="stroke:var(--axis)" stroke-width="1.3"/>`;
  const ay0 = o.yaxisAt !== undefined ? sx(o.yaxisAt) : L;
  s += `<line x1="${f2(ay0)}" y1="${T}" x2="${f2(ay0)}" y2="${H - B}" style="stroke:var(--axis)" stroke-width="1.3"/>`;
  if (o.xlabel) s += `<text x="${(L + W - R) / 2}" y="${H - 8}" text-anchor="middle" class="al">${o.xlabel}</text>`;
  if (o.ylabel) s += `<text x="14" y="${(T + H - B) / 2}" text-anchor="middle" class="al" transform="rotate(-90 14 ${(T + H - B) / 2})">${o.ylabel}</text>`;
  (o.vlines || []).forEach(v => {
    s += `<line x1="${f2(sx(v.x))}" y1="${T}" x2="${f2(sx(v.x))}" y2="${H - B}" style="stroke:var(${v.c || '--muted-fg'})" stroke-width="1.2" stroke-dasharray="${v.dash || '3 4'}"/>`;
    if (v.text) s += `<text x="${f2(sx(v.x) + 5)}" y="${T + 13}" class="lb" style="fill:var(${v.c || '--muted-fg'})">${v.text}</text>`;
  });
  // series
  (o.series || []).forEach(se => {
    const st = `stroke:var(${se.c || '--c1'})`;
    if (se.bars) {
      se.pts.forEach(([x, y]) => {
        const bw = se.bw || 8;
        s += `<rect x="${f2(sx(x) - bw / 2)}" y="${f2(sy(y))}" width="${bw}" height="${f2(sy(y0) - sy(y))}" style="fill:var(${se.c || '--c1'});opacity:.85" rx="1.5"/>`;
      });
      return;
    }
    if (se.pixels) { // many points: one path of 1-px squares, deduplicated on the pixel grid
      const seen = new Set(); let d = '';
      se.pts.forEach(([x, y]) => { if (!inY(y) || !inX(x)) return; const px = Math.round(sx(x) * 2) / 2, py = Math.round(sy(y) * 2) / 2, k = px + ',' + py; if (seen.has(k)) return; seen.add(k); d += `M${px} ${py}h1v1h-1z`; });
      s += `<path d="${d}" style="fill:var(${se.c || '--c1'})"/>`; return;
    }
    if (!se.dotsOnly) {
      let segs = [], cur = [];
      se.pts.forEach(([x, y]) => { if (inY(y) && inX(x)) cur.push(`${f2(sx(x))},${f2(sy(y))}`); else { if (cur.length > 1) segs.push(cur); cur = []; } });
      if (cur.length > 1) segs.push(cur);
      segs.forEach(p => s += `<polyline points="${p.join(' ')}" fill="none" style="${st}" stroke-width="${se.w || 2.4}" stroke-linecap="round" stroke-linejoin="round"${se.dash ? ` stroke-dasharray="${se.dash}"` : ''}/>`);
    }
    if (se.dots || se.dotsOnly) se.pts.forEach(([x, y]) => { if (inY(y) && inX(x)) s += `<circle cx="${f2(sx(x))}" cy="${f2(sy(y))}" r="${se.r || 3.2}" style="fill:var(${se.c || '--c1'})"/>`; });
  });
  (o.arrows || []).forEach(a => { // arrow heads on the x axis for phase lines
    const x = sx(a.x), y = ax0, d = a.dir;
    s += `<path d="M${f2(x - 6 * d)},${f2(y - 5)} L${f2(x + 6 * d)},${f2(y)} L${f2(x - 6 * d)},${f2(y + 5)} z" style="fill:var(${a.c || '--fg'})"/>`;
  });
  (o.marks || []).forEach(m => {
    const c = m.stable ? '--stable' : '--unstable';
    s += m.stable
      ? `<circle cx="${f2(sx(m.x))}" cy="${f2(sy(m.y))}" r="5.5" style="fill:var(${c});stroke:var(${c})" stroke-width="2"/>`
      : `<circle cx="${f2(sx(m.x))}" cy="${f2(sy(m.y))}" r="5.5" style="fill:var(--card);stroke:var(${c})" stroke-width="2.2"/>`;
  });
  (o.texts || []).forEach(t => s += `<text x="${f2(sx(t.x) + (t.dx || 0))}" y="${f2(sy(t.y) + (t.dy || 0))}" text-anchor="${t.a || 'start'}" class="lb" style="fill:var(${t.c || '--fg'})">${t.t}</text>`);
  return s + '</svg>';
}
const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);
const logTicks = (a, b) => { const t = []; for (let e = a; e <= b; e++) t.push([10 ** e, `10<tspan dy="-6" font-size="9">${e}</tspan>`]); return t; };
export { plot, range, logTicks };
