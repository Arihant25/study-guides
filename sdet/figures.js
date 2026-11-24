/* Figures for the detection theory study guide. Every curve is computed here
   from the formula it illustrates, so the pictures match the text. Colors come
   from CSS classes so that light and dark mode both work. */
(function () {
    'use strict';

    var NS = 'http://www.w3.org/2000/svg';

    function el(tag, attrs, parent) {
        var e = document.createElementNS(NS, tag);
        for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(e);
        return e;
    }

    function svgIn(id, w, h) {
        var host = document.getElementById(id);
        if (!host) return null;
        var s = el('svg', { viewBox: '0 0 ' + w + ' ' + h, role: 'img' });
        host.appendChild(s);
        return s;
    }

    function text(svg, x, y, str, cls, anchor) {
        var t = el('text', { x: x, y: y, 'text-anchor': anchor || 'middle', class: cls || '' }, svg);
        t.textContent = str;
        return t;
    }

    var clipSeq = 0;

    /* A plotting box. xr and yr are data ranges; box is [x, y, w, h] in pixels.
       Everything drawn as data is clipped to the box, so no curve can spill
       over its own frame or over the figure next to it. */
    function Axes(svg, box, xr, yr) {
        this.svg = svg; this.box = box; this.xr = xr; this.yr = yr;
        this.clip = 'clip' + (++clipSeq);
        var cp = el('clipPath', { id: this.clip }, svg);
        el('rect', { x: box[0] - 1, y: box[1] - 1, width: box[2] + 2, height: box[3] + 2 }, cp);
    }
    /* Marks one element as data, so the box clips it. */
    Axes.prototype.cut = function (node) {
        node.setAttribute('clip-path', 'url(#' + this.clip + ')');
        return node;
    };
    Axes.prototype.x = function (v) { return this.box[0] + (v - this.xr[0]) / (this.xr[1] - this.xr[0]) * this.box[2]; };
    Axes.prototype.y = function (v) { return this.box[1] + this.box[3] - (v - this.yr[0]) / (this.yr[1] - this.yr[0]) * this.box[3]; };
    Axes.prototype.frame = function (opts) {
        opts = opts || {};
        var b = this.box;
        var x0 = this.x(Math.max(this.xr[0], Math.min(this.xr[1], 0)));
        var y0 = this.y(Math.max(this.yr[0], Math.min(this.yr[1], 0)));
        if (opts.xaxis !== false) el('line', { x1: b[0], x2: b[0] + b[2], y1: y0, y2: y0, class: 'axis' }, this.svg);
        if (opts.yaxis !== false) el('line', { x1: x0, x2: x0, y1: b[1], y2: b[1] + b[3], class: 'axis' }, this.svg);
        if (opts.xlabel) text(this.svg, b[0] + b[2] + 9, y0 + 4, opts.xlabel, 'small', 'start');
        if (opts.ylabel) text(this.svg, x0 + 4, b[1] + 9, opts.ylabel, 'small', 'start');
        if (opts.title) text(this.svg, b[0] + b[2] / 2, b[1] - 6, opts.title, 'lab');
        return this;
    };
    Axes.prototype.xticks = function (vals, labels, y) {
        var yy = (y === undefined) ? this.y(Math.max(this.yr[0], Math.min(this.yr[1], 0))) : this.y(y);
        for (var i = 0; i < vals.length; i++) {
            var px = this.x(vals[i]);
            el('line', { x1: px, x2: px, y1: yy - 3, y2: yy + 3, class: 'axis' }, this.svg);
            if (labels) text(this.svg, px, yy + 14, labels[i], 'small');
        }
    };
    Axes.prototype.yticks = function (vals, labels) {
        var xx = this.x(Math.max(this.xr[0], Math.min(this.xr[1], 0)));
        for (var i = 0; i < vals.length; i++) {
            var py = this.y(vals[i]);
            el('line', { x1: xx - 3, x2: xx + 3, y1: py, y2: py, class: 'axis' }, this.svg);
            if (labels) text(this.svg, xx - 6, py + 4, labels[i], 'small', 'end');
        }
    };
    Axes.prototype.curve = function (fn, cls, n) {
        n = n || 400;
        var pts = [];
        for (var i = 0; i <= n; i++) {
            var xv = this.xr[0] + (this.xr[1] - this.xr[0]) * i / n;
            var yv = fn(xv);
            if (!isFinite(yv)) continue;
            yv = Math.max(this.yr[0] - 4 * (this.yr[1] - this.yr[0]), Math.min(this.yr[1] + 4 * (this.yr[1] - this.yr[0]), yv));
            pts.push(this.x(xv).toFixed(2) + ',' + this.y(yv).toFixed(2));
        }
        return this.cut(el('polyline', { points: pts.join(' '), class: cls }, this.svg));
    };
    Axes.prototype.poly = function (xs, ys, cls, close) {
        var pts = [];
        for (var i = 0; i < xs.length; i++) pts.push(this.x(xs[i]).toFixed(2) + ',' + this.y(ys[i]).toFixed(2));
        return this.cut(el(close ? 'polygon' : 'polyline', { points: pts.join(' '), class: cls }, this.svg));
    };
    Axes.prototype.stems = function (ns, vals, cls, dotcls, r) {
        var y0 = this.y(0);
        for (var i = 0; i < ns.length; i++) {
            var px = this.x(ns[i]), py = this.y(vals[i]);
            this.cut(el('line', { x1: px, x2: px, y1: y0, y2: py, class: cls || 'stem' }, this.svg));
            this.cut(el('circle', { cx: px, cy: py, r: r || 3.2, class: dotcls || 'dot-a' }, this.svg));
        }
    };
    Axes.prototype.dots = function (xs, ys, cls, r) {
        for (var i = 0; i < xs.length; i++) this.cut(el('circle', { cx: this.x(xs[i]), cy: this.y(ys[i]), r: r || 3.2, class: cls }, this.svg));
    };
    Axes.prototype.vline = function (xv, cls) {
        var b = this.box;
        return el('line', { x1: this.x(xv), x2: this.x(xv), y1: b[1], y2: b[1] + b[3], class: cls }, this.svg);
    };

    var PI = Math.PI;

    /* ---------------- numerical helpers ---------------- */

    /* Complementary error function. W. J. Cody's rational approximations
       (via the Numerical Recipes erfc Chebyshev form), relative error < 1.2e-7. */
    function erfc(x) {
        var z = Math.abs(x);
        var t = 1 / (1 + 0.5 * z);
        var r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 +
            t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 +
                t * (-0.82215223 + t * 0.17087277)))))))));
        return x >= 0 ? r : 2 - r;
    }

    /* Right-tail probability of a standard Gaussian. */
    function Q(x) { return 0.5 * erfc(x / Math.SQRT2); }

    /* Inverse of Q by bisection; Q is strictly decreasing. */
    function Qinv(p) {
        var lo = -40, hi = 40;
        for (var i = 0; i < 200; i++) {
            var mid = 0.5 * (lo + hi);
            if (Q(mid) > p) lo = mid; else hi = mid;
        }
        return 0.5 * (lo + hi);
    }

    function gauss(x, mu, s2) { return Math.exp(-(x - mu) * (x - mu) / (2 * s2)) / Math.sqrt(2 * PI * s2); }

    /* log Gamma by the Lanczos approximation. */
    function lgamma(z) {
        var g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
            -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
        if (z < 0.5) return Math.log(PI / Math.sin(PI * z)) - lgamma(1 - z);
        z -= 1;
        var x = c[0];
        for (var i = 1; i < g + 2; i++) x += c[i] / (z + i);
        var t = z + g + 0.5;
        return 0.5 * Math.log(2 * PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
    }

    /* Regularised lower incomplete gamma P(a, x). */
    function gammaP(a, x) {
        if (x <= 0) return 0;
        if (x < a + 1) {
            var sum = 1 / a, del = sum, ap = a;
            for (var n = 0; n < 500; n++) { ap += 1; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-14) break; }
            return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
        }
        /* continued fraction for Q(a,x) */
        var b = x + 1 - a, cc = 1e300, d = 1 / b, h = d;
        for (var i = 1; i < 500; i++) {
            var an = -i * (i - a); b += 2;
            d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
            cc = b + an / cc; if (Math.abs(cc) < 1e-300) cc = 1e-300;
            d = 1 / d; var dl = d * cc; h *= dl;
            if (Math.abs(dl - 1) < 1e-14) break;
        }
        return 1 - Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
    }

    /* Chi-squared with nu degrees of freedom: PDF and right-tail probability. */
    function chi2pdf(x, nu) {
        if (x <= 0) return 0;
        return Math.exp((nu / 2 - 1) * Math.log(x) - x / 2 - (nu / 2) * Math.log(2) - lgamma(nu / 2));
    }
    function chi2Q(x, nu) { return 1 - gammaP(nu / 2, x / 2); }
    function chi2Qinv(p, nu) {
        var lo = 0, hi = 1000;
        for (var i = 0; i < 200; i++) { var mid = 0.5 * (lo + hi); if (chi2Q(mid, nu) > p) lo = mid; else hi = mid; }
        return 0.5 * (lo + hi);
    }

    function logChoose(n, k) { return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1); }
    function binomPmf(k, n, p) { return Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p)); }

    /* A tiny seeded generator, so the random sample paths look the same on every load. */
    function rng(seed) {
        var s = seed >>> 0;
        return function () {
            s = (s + 0x6D2B79F5) >>> 0;
            var t = s;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    function randn(u) {
        var a = u(), b = u();
        if (a < 1e-12) a = 1e-12;
        return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * PI * b);
    }

    function fmt(v, d) { return v.toFixed(d === undefined ? 1 : d).replace('-', '−'); }

    /* Tick labels on the left edge of the box (for plots whose x range includes 0). */
    Axes.prototype.yleft = function (vals, labels) {
        for (var i = 0; i < vals.length; i++) {
            var py = this.y(vals[i]);
            el('line', { x1: this.box[0] - 3, x2: this.box[0] + 3, y1: py, y2: py, class: 'axis' }, this.svg);
            text(this.svg, this.box[0] - 6, py + 4, labels[i], 'small', 'end');
        }
    };

    /* Shade the area under fn between a and b on axes ax. */
    function shade(ax, fn, a, b, cls) {
        var xs = [a], ys = [0], n = 160;
        for (var i = 0; i <= n; i++) { var x = a + (b - a) * i / n; xs.push(x); ys.push(fn(x)); }
        xs.push(b); ys.push(0);
        ax.poly(xs, ys, cls, true);
    }

    /* A small legend drawn inside the SVG: items = [[cls, label], ...]. */
    function legend(svg, x, y, items) {
        for (var i = 0; i < items.length; i++) {
            var yy = y + i * 16;
            el('line', { x1: x, x2: x + 18, y1: yy - 4, y2: yy - 4, class: items[i][0] }, svg);
            text(svg, x + 24, yy, items[i][1], 'small', 'start');
        }
    }

    /* ---------------- Figure: PDFs of the sample mean under H0 and H1 ---------------- */
    (function () {
        var s = svgIn('fig-dc-pdfs', 720, 250); if (!s) return;
        var A = 1, v = 0.16; /* sigma^2/N, so d^2 = A^2 N / sigma^2 = 6.25 */
        var f0 = function (t) { return gauss(t, 0, v); }, f1 = function (t) { return gauss(t, A, v); };
        var ymax = 1.25 * gauss(0, 0, v);

        /* Left: Neyman-Pearson view, threshold to the right of A/2. */
        var g = 0.72;
        var a = new Axes(s, [24, 36, 312, 170], [-1.3, 2.3], [-0.02 * ymax, ymax]).frame({ xlabel: 'T', yaxis: false, title: 'NP view: one threshold, two tail areas' });
        shade(a, f1, g, 2.3, 'fb');
        shade(a, f0, g, 2.3, 'fa');
        a.curve(f0, 'a'); a.curve(f1, 'b');
        a.vline(g, 'axis dash');
        a.xticks([0, A], ['0', 'A']);
        text(s, a.x(g) + 3, a.box[1] + 10, "γ′", 'lab', 'start');
        text(s, a.x(0), a.y(gauss(0, 0, v)) - 6, 'p(T; H₀)', 'small lab-a');
        text(s, a.x(A) + 8, a.y(gauss(0, 0, v)) - 6, 'p(T; H₁)', 'small lab-b');
        text(s, a.x(1.55), a.y(0.35 * ymax), 'P_D', 'small lab-b');
        text(s, a.x(0.95), a.y(0.07 * ymax), 'P_FA', 'small lab-a', 'start');

        /* Right: Bayes view with equal priors, threshold at A/2. */
        var g2 = A / 2;
        var b = new Axes(s, [384, 36, 312, 170], [-1.3, 2.3], [-0.02 * ymax, ymax]).frame({ xlabel: 'T', yaxis: false, title: 'Bayes view: γ′ = A/2, two error areas' });
        shade(b, f0, g2, 2.3, 'fa');
        shade(b, f1, -1.3, g2, 'fb');
        b.curve(f0, 'a'); b.curve(f1, 'b');
        b.vline(g2, 'axis dash');
        b.xticks([0, A / 2, A], ['0', 'A/2', 'A']);
        text(s, b.x(0.86), b.y(0.10 * ymax), 'P_FA', 'small lab-a', 'start');
        text(s, b.x(0.14), b.y(0.10 * ymax), 'P_M', 'small lab-b', 'end');
        text(s, 360, 244, 'Both panels: σ²/N = 0.16, A = 1, so d² = NA²/σ² = 6.25.', 'small');
    })();

    /* ---------------- Figure: P_D versus d^2 for several P_FA ---------------- */
    (function () {
        var s = svgIn('fig-pd-d2', 720, 300); if (!s) return;
        var a = new Axes(s, [56, 20, 560, 230], [-5, 20], [0, 1]);
        for (var gx = -5; gx <= 20; gx += 5) el('line', { x1: a.x(gx), x2: a.x(gx), y1: a.box[1], y2: a.box[1] + a.box[3], class: 'grid' }, s);
        for (var gy = 0.1; gy < 1.01; gy += 0.1) el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(gy), y2: a.y(gy), class: 'grid' }, s);
        el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(0), y2: a.y(0), class: 'axis' }, s);
        el('line', { x1: a.box[0], x2: a.box[0], y1: a.box[1], y2: a.box[1] + a.box[3], class: 'axis' }, s);
        text(s, a.box[0] + a.box[2] / 2, a.box[1] + a.box[3] + 32, '10 log₁₀ d²  (dB)', 'small');
        a.xticks([-5, 0, 5, 10, 15, 20], ['−5', '0', '5', '10', '15', '20'], 0);
        a.yleft([0, 0.2, 0.4, 0.6, 0.8, 1], ['0', '0.2', '0.4', '0.6', '0.8', '1']);
        text(s, 14, 140, 'P_D', 'lab', 'middle');
        var pfas = [1e-1, 1e-2, 1e-4, 1e-6];
        var cls = ['a', 'b', 'c', 'd'];
        var sup = ['¹', '²', '⁴', '⁶'];
        for (var i = 0; i < pfas.length; i++) {
            (function (pfa, c) {
                var qi = Qinv(pfa);
                a.curve(function (db) { return Q(qi - Math.sqrt(Math.pow(10, db / 10))); }, c);
            })(pfas[i], cls[i]);
        }
        var items = [];
        for (var j = 0; j < pfas.length; j++) items.push([cls[j], 'P_FA = 10⁻' + sup[j]]);
        legend(s, 628, 40, items);
    })();

    /* ---------------- Figure: ROC of the DC level in WGN ---------------- */
    (function () {
        var s = svgIn('fig-roc-dc', 720, 320); if (!s) return;
        var a = new Axes(s, [190, 16, 280, 270], [0, 1], [0, 1]).frame({ xlabel: 'P_FA' });
        a.xticks([0, 0.2, 0.4, 0.6, 0.8, 1], ['0', '0.2', '0.4', '0.6', '0.8', '1']);
        a.yticks([0.2, 0.4, 0.6, 0.8, 1], ['0.2', '0.4', '0.6', '0.8', '1']);
        el('line', { x1: a.x(0), y1: a.y(1), x2: a.x(1), y2: a.y(1), class: 'grid' }, s);
        el('line', { x1: a.x(1), y1: a.y(0), x2: a.x(1), y2: a.y(1), class: 'grid' }, s);
        text(s, 160, 150, 'P_D', 'lab', 'middle');
        var ds = [0, 1, 2, 3, 4], cls = ['axis dash', 'a', 'b', 'c', 'd'];
        for (var i = 0; i < ds.length; i++) {
            (function (d, c) {
                var xs = [], ys = [];
                for (var k = 0; k <= 400; k++) {
                    var g = -6 + 12 * k / 400; /* sweep the normalised threshold */
                    xs.push(Q(g)); ys.push(Q(g - d));
                }
                a.poly(xs, ys, c);
            })(ds[i], cls[i]);
        }
        legend(s, 490, 40, [['d', 'd² = 16'], ['c', 'd² = 9'], ['b', 'd² = 4'], ['a', 'd² = 1'], ['axis dash', 'd² = 0: guessing']]);
        text(s, 490, 140, 'Each curve: P_D = Q(Q⁻¹(P_FA) − √d²).', 'small', 'start');
        text(s, 490, 156, 'Moving the threshold moves the', 'small', 'start');
        text(s, 490, 172, 'operating point along one curve.', 'small', 'start');
        text(s, 490, 188, 'Raising d² moves to a higher curve.', 'small', 'start');
    })();

    /* ---------------- Figure: three SPRT sample paths ---------------- */
    (function () {
        var s = svgIn('fig-sprt-paths', 720, 300); if (!s) return;
        /* Gaussian shift: x_i ~ N(0,1) under H0 and N(1,1) under H1.
           Log-LR increment z_i = x_i - 1/2. alpha = beta = 0.01. */
        var alpha = 0.01, beta = 0.01;
        var lnA = Math.log((1 - beta) / alpha), lnB = Math.log(beta / (1 - alpha));
        var nmax = 30;
        var a = new Axes(s, [80, 16, 590, 250], [0, nmax], [-7.5, 7.5]).frame({ xlabel: 'n' });
        a.xticks([5, 10, 15, 20, 25, 30], ['5', '10', '15', '20', '25', '30']);
        a.yticks([lnB, 0, lnA], ['b = ln B', '0', 'a = ln A']);
        el('line', { x1: a.x(0), x2: a.x(nmax), y1: a.y(lnA), y2: a.y(lnA), class: 'd thin dash' }, s);
        el('line', { x1: a.x(0), x2: a.x(nmax), y1: a.y(lnB), y2: a.y(lnB), class: 'd thin dash' }, s);
        text(s, a.x(nmax) - 4, a.y(lnA) - 6, 'stop, accept H₁ when Sₙ ≥ a', 'small lab-d', 'end');
        text(s, a.x(nmax) - 4, a.y(lnB) + 14, 'stop, accept H₀ when Sₙ ≤ b', 'small lab-d', 'end');
        text(s, 14, 140, 'Sₙ', 'lab', 'middle');

        function path(seed, mean, cls, dotcls) {
            var u = rng(seed), L = 0, xs = [0], ys = [0];
            for (var n = 1; n <= nmax; n++) {
                var x = mean + randn(u);
                L += x - 0.5;
                xs.push(n); ys.push(L);
                if (L >= lnA || L <= lnB) break;
            }
            a.poly(xs, ys, cls + ' thin');
            a.dots(xs, ys, dotcls, 2.4);
            return { n: xs[xs.length - 1], L: ys[ys.length - 1] };
        }
        path(8, 1, 'b', 'dot-b');    /* data from H1 */
        path(3, 0, 'a', 'dot-a');    /* data from H0 */
        path(40, 0.5, 'c', 'dot-c'); /* mean 1/2: zero drift, a slow path */
        legend(s, 66, 286, [['b', 'data from H₁ (drift +½ per sample)']]);
        legend(s, 330, 286, [['a', 'data from H₀ (drift −½)']]);
        legend(s, 520, 286, [['c', 'mean ½: zero drift']]);
    })();

    /* ---------------- Figure 1.1: chi-squared PDFs ---------------- */
    (function () {
        var s = svgIn('fig-chi2', 720, 260); if (!s) return;
        var a = new Axes(s, [72, 16, 580, 200], [0, 30], [0, 0.2]).frame({ xlabel: 'y' });
        a.xticks([0, 5, 10, 15, 20, 25, 30], ['0', '5', '10', '15', '20', '25', '30']);
        a.yticks([0.05, 0.1, 0.15, 0.2], ['0.05', '0.10', '0.15', '0.20']);
        a.curve(function (y) { return chi2pdf(y, 4); }, 'a', 600);
        a.curve(function (y) { return chi2pdf(y, 8); }, 'b', 600);
        a.curve(function (y) { return chi2pdf(y, 16); }, 'c', 600);
        legend(s, 520, 40, [['a', 'χ²₄ (mean 4)'], ['b', 'χ²₈ (mean 8)'], ['c', 'χ²₁₆ (mean 16)']]);
        text(s, 18, 120, 'p(y)', 'lab', 'middle');
    })();

    /* ---------------- Figure 3.2: DC level in Laplacian noise ---------------- */
    (function () {
        var s = svgIn('fig-laplace', 720, 250); if (!s) return;
        var A = 2, b = 1;
        var f0 = function (x) { return Math.exp(-Math.abs(x) / b) / (2 * b); };
        var f1 = function (x) { return Math.exp(-Math.abs(x - A) / b) / (2 * b); };
        var a = new Axes(s, [24, 30, 310, 170], [-3, 5], [0, 0.6]).frame({ xlabel: 'x', yaxis: false, title: 'Laplacian PDFs, A = 2, b = 1' });
        shade(a, f0, A / 2, 5, 'fa');
        shade(a, f1, -3, A / 2, 'fb');
        a.curve(f0, 'a', 800); a.curve(f1, 'b', 800);
        a.vline(A / 2, 'axis dash');
        a.xticks([0, 1, 2], ['0', 'A/2', 'A']);
        text(s, a.x(-1.6), a.y(0.3), 'p(x; H₀)', 'small lab-a');
        text(s, a.x(3.6), a.y(0.3), 'p(x; H₁)', 'small lab-b');

        var g = function (x) { return Math.abs(x) - Math.abs(x - A); };
        var c = new Axes(s, [400, 30, 290, 170], [-3, 5], [-3.2, 3.2]).frame({ xlabel: 'x', title: 'g(x) = |x| − |x − A|' });
        c.curve(function (x) { return 2 * x - A; }, 'axis dash');
        c.curve(g, 'b', 800);
        c.xticks([2], ['A']);
        c.yticks([-2, 2], ['−A', 'A']);
        text(s, c.x(4.6), c.y(-1.9), 'dashed: Gaussian, 2x − A', 'small', 'end');
        text(s, c.x(4.4), c.y(1.4), 'Laplacian: clipped', 'small lab-b', 'end');
    })();

    /* A unit-square ROC frame shared by several figures. */
    function rocAxes(s, box) {
        var a = new Axes(s, box, [0, 1], [0, 1]).frame({ xlabel: 'P_FA' });
        a.xticks([0, 0.2, 0.4, 0.6, 0.8, 1], ['0', '0.2', '0.4', '0.6', '0.8', '1']);
        a.yticks([0.2, 0.4, 0.6, 0.8, 1], ['0.2', '0.4', '0.6', '0.8', '1']);
        el('line', { x1: a.x(0), y1: a.y(1), x2: a.x(1), y2: a.y(1), class: 'grid' }, s);
        el('line', { x1: a.x(1), y1: a.y(0), x2: a.x(1), y2: a.y(1), class: 'grid' }, s);
        a.poly([0, 1], [0, 1], 'axis dash');
        text(s, box[0] - 30, box[1] + box[3] / 2, 'P_D', 'lab', 'middle');
        return a;
    }

    /* ---------------- Figure 5.2: ROC for a change in variance, N = 2 ---------------- */
    (function () {
        var s = svgIn('fig-roc-var', 720, 320); if (!s) return;
        var a = rocAxes(s, [190, 16, 280, 270]);
        var rs = [2, 5, 10, 50], cls = ['a', 'b', 'c', 'd'];
        for (var i = 0; i < rs.length; i++) {
            (function (r, c) { a.curve(function (p) { return Math.pow(p, 1 / r); }, c, 600); })(rs[i], cls[i]);
        }
        legend(s, 490, 40, [['d', 'σ₁²/σ₀² = 50'], ['c', 'σ₁²/σ₀² = 10'], ['b', 'σ₁²/σ₀² = 5'], ['a', 'σ₁²/σ₀² = 2'], ['axis dash', 'guessing']]);
        text(s, 490, 140, 'N = 2:  P_D = P_FA^(σ₀²/σ₁²)', 'small', 'start');
    })();

    /* ---------------- Figure 5.3: discrete ROC for binomial data ---------------- */
    (function () {
        var s = svgIn('fig-roc-binom', 720, 320); if (!s) return;
        var n = 10, p0 = 0.5, p1 = 0.8;
        var a = rocAxes(s, [190, 16, 280, 270]);
        var xs = [], ys = [];
        for (var k = n + 1; k >= 0; k--) {
            var f = 0, d = 0;
            for (var j = k; j <= n; j++) { f += binomPmf(j, n, p0); d += binomPmf(j, n, p1); }
            xs.push(f); ys.push(d);
        }
        a.poly(xs, ys, 'b');
        a.dots(xs, ys, 'dot-b', 3.4);
        /* the size-0.05 randomised test */
        var c0 = (0.05 - xs[2]) / (xs[3] - xs[2]);
        var pd = ys[2] + c0 * (ys[3] - ys[2]);
        el('circle', { cx: a.x(0.05), cy: a.y(pd), r: 6, class: 'a', fill: 'none' }, s);
        text(s, a.x(0.05) + 10, a.y(pd) + 16, 'size 0.05: P_D = 0.646', 'small lab-a', 'start');
        text(s, a.x(xs[2]) + 8, a.y(ys[2]) + 4, 'X ≥ 9', 'small', 'start');
        text(s, a.x(xs[3]) + 8, a.y(ys[3]) + 10, 'X ≥ 8', 'small', 'start');
        text(s, a.x(xs[4]) + 8, a.y(ys[4]) + 10, 'X ≥ 7', 'small', 'start');
        text(s, 490, 60, 'Bin(10, 0.5) vs Bin(10, 0.8)', 'small', 'start');
        text(s, 490, 80, 'dots: decide H₁ if X ≥ k', 'small', 'start');
        text(s, 490, 96, 'segments: randomise at X = k', 'small', 'start');
    })();

    /* ---------------- Figure 6.1: three DC levels ---------------- */
    (function () {
        var s = svgIn('fig-3dc', 720, 220); if (!s) return;
        var A = 1, v = 0.12;
        var f = function (m) { return function (t) { return gauss(t, m, v); }; };
        var ymax = 1.25 * gauss(0, 0, v);
        var a = new Axes(s, [40, 20, 640, 160], [-2.2, 2.2], [0, ymax]).frame({ xlabel: 'x̄', yaxis: false });
        shade(a, f(-A), -A / 2, 2.2, 'fa');
        shade(a, f(0), -2.2, -A / 2, 'fb');
        shade(a, f(0), A / 2, 2.2, 'fb');
        shade(a, f(A), -2.2, A / 2, 'fa');
        a.curve(f(-A), 'a', 600); a.curve(f(0), 'b', 600); a.curve(f(A), 'c', 600);
        a.vline(-A / 2, 'axis dash'); a.vline(A / 2, 'axis dash');
        a.xticks([-A, -A / 2, 0, A / 2, A], ['−A', '−A/2', '0', 'A/2', 'A']);
        text(s, a.x(-A), a.y(gauss(0, 0, v)) - 6, 'H₀', 'small lab-a');
        text(s, a.x(0), a.y(gauss(0, 0, v)) - 6, 'H₁', 'small lab-b');
        text(s, a.x(A), a.y(gauss(0, 0, v)) - 6, 'H₂', 'small lab-c');
        text(s, a.x(-1.6), a.y(0.75 * ymax), 'decide H₀', 'small');
        text(s, a.x(0), a.y(0.98 * ymax), 'decide H₁', 'small');
        text(s, a.x(1.6), a.y(0.75 * ymax), 'decide H₂', 'small');
    })();

    /* ---------------- Figure 7.1: the matched filter ---------------- */
    (function () {
        var s = svgIn('fig-mf', 720, 210); if (!s) return;
        var sig = [1, 1.6, 1.2, 0.2, -0.8, -1.2, -0.6, 0.4], N = sig.length;
        var ns = [], h = [];
        for (var n = 0; n < N; n++) { ns.push(n); h.push(sig[N - 1 - n]); }
        var E = 0; for (var i = 0; i < N; i++) E += sig[i] * sig[i];
        var no = [], y = [];
        for (var m = 0; m <= 2 * N - 2; m++) {
            var acc = 0;
            for (var k = 0; k < N; k++) { var j = m - k; if (j >= 0 && j < N) acc += sig[k] * h[j]; }
            no.push(m); y.push(acc);
        }
        var a = new Axes(s, [20, 34, 190, 140], [-0.8, 8], [-2, 2]).frame({ xlabel: 'n', title: 's[n]', yaxis: false });
        a.xticks([0, 7], ['0', '7']); a.stems(ns, sig);
        var b = new Axes(s, [250, 34, 190, 140], [-0.8, 8], [-2, 2]).frame({ xlabel: 'n', title: 'h[n] = s[N−1−n]', yaxis: false });
        b.xticks([0, 7], ['0', '7']); b.stems(ns, h, 'stem', 'dot-a');
        var c = new Axes(s, [480, 34, 220, 140], [-0.8, 15], [-E * 0.55, E * 1.1]).frame({ xlabel: 'n', title: 'output y_s[n] (input s[n])', yaxis: false });
        c.xticks([0, 7, 14], ['0', 'N−1 = 7', '14']);
        c.stems(no, y, 'b', 'dot-b');
        text(s, c.x(7) + 8, c.y(E) + 4, 'peak = ℰ', 'small lab-b', 'start');
    })();

    /* ---------------- Figure 8.1: PSD of AR(1) noise ---------------- */
    (function () {
        var s = svgIn('fig-ar1', 720, 260); if (!s) return;
        var a = new Axes(s, [70, 20, 560, 200], [-0.5, 0.5], [-8, 22]);
        for (var g = -5; g <= 20; g += 5) el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(g), y2: a.y(g), class: 'grid' }, s);
        el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(-8), y2: a.y(-8), class: 'axis' }, s);
        el('line', { x1: a.x(0), x2: a.x(0), y1: a.box[1], y2: a.box[1] + a.box[3], class: 'axis' }, s);
        a.xticks([-0.5, -0.25, 0, 0.25, 0.5], ['−1/2', '−1/4', '0', '1/4', '1/2'], -8);
        for (var t = -5; t <= 20; t += 5) text(s, a.box[0] - 6, a.y(t) + 4, String(t).replace('-', '−'), 'small', 'end');
        text(s, a.box[0] + a.box[2] / 2, a.box[1] + a.box[3] + 32, 'frequency f (cycles per sample)', 'small');
        text(s, 22, 120, 'dB', 'lab', 'middle');
        var psd = function (aa) { return function (f) { return 10 * Math.log10(1 / (1 - 2 * aa * Math.cos(2 * PI * f) + aa * aa)); }; };
        a.curve(psd(0.5), 'a', 600);
        a.curve(psd(0.9), 'b', 600);
        legend(s, 520, 40, [['a', 'a = 0.5'], ['b', 'a = 0.9']]);
    })();

    /* ---------------- Figure 9.1: geometry of the minimum-distance receiver ---------------- */
    (function () {
        var s = svgIn('fig-mindist', 720, 300); if (!s) return;
        var a = new Axes(s, [180, 20, 360, 260], [-2.6, 2.6], [-1.9, 1.85]);
        el('line', { x1: a.x(-2.6), x2: a.x(2.6), y1: a.y(0), y2: a.y(0), class: 'grid' }, s);
        el('line', { x1: a.x(0), x2: a.x(0), y1: a.y(-1.9), y2: a.y(1.85), class: 'grid' }, s);
        var s0 = [-1, -0.6], s1 = [1, 0.9];
        var m = [(s0[0] + s1[0]) / 2, (s0[1] + s1[1]) / 2];
        var dx = s1[0] - s0[0], dy = s1[1] - s0[1], L = Math.sqrt(dx * dx + dy * dy);
        var ux = dx / L, uy = dy / L, px = -uy, py = ux;
        function boundary(shift, cls) {
            var cx = m[0] + shift * ux, cy = m[1] + shift * uy, t = 4;
            a.poly([cx - t * px, cx + t * px], [cy - t * py, cy + t * py], cls);
        }
        /* shade the H1 side lightly */
        var t = 6, cx = m[0], cy = m[1];
        a.poly([cx - t * px, cx + t * px, cx + t * px + t * ux, cx - t * px + t * ux], [cy - t * py, cy + t * py, cy + t * py + t * uy, cy - t * py + t * uy], 'fb', true);
        a.poly([s0[0], s1[0]], [s0[1], s1[1]], 'axis dash');
        boundary(0, 'c');
        boundary(0.45, 'c thin dash');
        a.dots([s0[0]], [s0[1]], 'dot-a', 5);
        a.dots([s1[0]], [s1[1]], 'dot-b', 5);
        a.dots([m[0]], [m[1]], 'dot-c', 3);
        text(s, a.x(s0[0]) - 8, a.y(s0[1]) + 18, 's₀', 'lab lab-a', 'end');
        text(s, a.x(s1[0]) + 8, a.y(s1[1]) - 8, 's₁', 'lab lab-b', 'start');
        text(s, a.x(-1.9), a.y(1.3), 'decide H₀', 'small', 'middle');
        text(s, a.x(1.9), a.y(-1.2), 'decide H₁', 'small lab-b', 'middle');
        text(s, 560, 120, 'solid: equal priors', 'small lab-c', 'start');
        text(s, 560, 136, '(perpendicular bisector)', 'small', 'start');
        text(s, 560, 160, 'dashed: P(H₀) > P(H₁)', 'small lab-c', 'start');
        text(s, 560, 176, '(same direction, shifted)', 'small', 'start');
    })();

    /* ---------------- Figure 9.2: Pe of three binary signal sets ---------------- */
    (function () {
        var s = svgIn('fig-pe-sets', 720, 300); if (!s) return;
        var a = new Axes(s, [70, 16, 560, 230], [0, 20], [-6, -0.3]);
        for (var dec = -6; dec <= -1; dec++) {
            el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(dec), y2: a.y(dec), class: 'grid' }, s);
            text(s, a.box[0] - 6, a.y(dec) + 4, '10' + ['⁻⁶', '⁻⁵', '⁻⁴', '⁻³', '⁻²', '⁻¹'][dec + 6], 'small', 'end');
        }
        for (var g = 0; g <= 20; g += 2) el('line', { x1: a.x(g), x2: a.x(g), y1: a.box[1], y2: a.box[1] + a.box[3], class: 'grid' }, s);
        el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(-6), y2: a.y(-6), class: 'axis' }, s);
        el('line', { x1: a.box[0], x2: a.box[0], y1: a.box[1], y2: a.box[1] + a.box[3], class: 'axis' }, s);
        a.xticks([0, 4, 8, 12, 16, 20], ['0', '4', '8', '12', '16', '20'], -6);
        text(s, a.box[0] + a.box[2] / 2, a.box[1] + a.box[3] + 32, '10 log₁₀(ℰ/σ²)  (dB)', 'small');
        text(s, 18, 130, 'P_e', 'lab', 'middle');
        var sets = [[1, 'a', 'antipodal'], [0.5, 'b', 'orthogonal'], [0.25, 'c', 'on–off']];
        for (var i = 0; i < sets.length; i++) {
            (function (k, c) { a.curve(function (db) { return Math.log10(Q(Math.sqrt(k * Math.pow(10, db / 10)))); }, c, 600); })(sets[i][0], sets[i][1]);
        }
        legend(s, 520, 36, [['a', 'antipodal: Q(√(ℰ/σ²))'], ['b', 'orthogonal: Q(√(ℰ/2σ²))'], ['c', 'on–off: Q(√(ℰ/4σ²))']]);
    })();

    /* ---------------- Figure 10.1: energy detector PD vs SNR ---------------- */
    (function () {
        var s = svgIn('fig-ed', 720, 290); if (!s) return;
        var a = new Axes(s, [60, 16, 560, 220], [-10, 20], [0, 1]);
        for (var g = -10; g <= 20; g += 5) el('line', { x1: a.x(g), x2: a.x(g), y1: a.box[1], y2: a.box[1] + a.box[3], class: 'grid' }, s);
        for (var h = 0.2; h < 1.01; h += 0.2) el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(h), y2: a.y(h), class: 'grid' }, s);
        el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(0), y2: a.y(0), class: 'axis' }, s);
        el('line', { x1: a.box[0], x2: a.box[0], y1: a.box[1], y2: a.box[1] + a.box[3], class: 'axis' }, s);
        a.xticks([-10, -5, 0, 5, 10, 15, 20], ['−10', '−5', '0', '5', '10', '15', '20'], 0);
        a.yleft([0.2, 0.4, 0.6, 0.8, 1], ['0.2', '0.4', '0.6', '0.8', '1']);
        text(s, a.box[0] + a.box[2] / 2, a.box[1] + a.box[3] + 32, 'SNR per sample, 10 log₁₀(σₛ²/σ²)  (dB)', 'small');
        text(s, 18, 126, 'P_D', 'lab', 'middle');
        var Ns = [2, 10, 50], cls = ['a', 'b', 'c'];
        for (var i = 0; i < Ns.length; i++) {
            (function (N, c) {
                var thr = chi2Qinv(0.01, N);
                a.curve(function (db) { return chi2Q(thr / (1 + Math.pow(10, db / 10)), N); }, c, 400);
            })(Ns[i], cls[i]);
        }
        legend(s, 530, 150, [['a', 'N = 2'], ['b', 'N = 10'], ['c', 'N = 50']]);
        text(s, 530, 210, 'P_FA = 0.01', 'small', 'start');
    })();

    /* ---------------- Figure 11.1: power functions for the DC level ---------------- */
    (function () {
        var s = svgIn('fig-power', 720, 290); if (!s) return;
        var al = 0.05, z = Qinv(al), z2 = Qinv(al / 2);
        var a = new Axes(s, [60, 16, 560, 220], [-3, 3], [0, 1]);
        for (var g = -3; g <= 3; g += 1) el('line', { x1: a.x(g), x2: a.x(g), y1: a.box[1], y2: a.box[1] + a.box[3], class: 'grid' }, s);
        for (var h = 0.2; h < 1.01; h += 0.2) el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(h), y2: a.y(h), class: 'grid' }, s);
        el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(0), y2: a.y(0), class: 'axis' }, s);
        el('line', { x1: a.box[0], x2: a.box[0], y1: a.box[1], y2: a.box[1] + a.box[3], class: 'axis' }, s);
        a.xticks([-3, -2, -1, 0, 1, 2, 3], ['−3', '−2', '−1', '0', '1', '2', '3'], 0);
        a.yleft([0.2, 0.4, 0.6, 0.8, 1], ['0.2', '0.4', '0.6', '0.8', '1']);
        text(s, a.box[0] + a.box[2] / 2, a.box[1] + a.box[3] + 32, 'A  (with √N/σ = 1)', 'small');
        text(s, 18, 126, 'P_D(A)', 'lab', 'middle');
        a.curve(function (A) { return Q(z - Math.abs(A)); }, 'axis dash', 600);
        a.curve(function (A) { return Q(z - A); }, 'a', 600);
        a.curve(function (A) { return Q(z + A); }, 'b', 600);
        a.curve(function (A) { return Q(z2 - A) + Q(z2 + A); }, 'c', 600);
        el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(al), y2: a.y(al), class: 'd thin dash' }, s);
        text(s, a.x(-2.95), a.y(al) - 5, 'α = 0.05', 'small lab-d', 'start');
        legend(s, 240, 40, [['a', 'x̄ > γ′ (best for A > 0)'], ['b', 'x̄ < −γ′ (best for A < 0)'], ['c', '|x̄| > γ″ (GLRT)'], ['axis dash', 'clairvoyant bound']]);
    })();

    /* ---------------- Figure 12.2: average sample number, SPRT vs fixed ---------------- */
    (function () {
        var s = svgIn('fig-asn', 720, 290); if (!s) return;
        var a = new Axes(s, [60, 16, 560, 220], [1, 6], [0, 100]);
        for (var g = 1; g <= 6; g += 1) el('line', { x1: a.x(g), x2: a.x(g), y1: a.box[1], y2: a.box[1] + a.box[3], class: 'grid' }, s);
        for (var h = 20; h <= 100; h += 20) el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(h), y2: a.y(h), class: 'grid' }, s);
        el('line', { x1: a.box[0], x2: a.box[0] + a.box[2], y1: a.y(0), y2: a.y(0), class: 'axis' }, s);
        el('line', { x1: a.box[0], x2: a.box[0], y1: a.box[1], y2: a.box[1] + a.box[3], class: 'axis' }, s);
        a.xticks([1, 2, 3, 4, 5, 6], ['10⁻¹', '10⁻²', '10⁻³', '10⁻⁴', '10⁻⁵', '10⁻⁶'], 0);
        a.yleft([20, 40, 60, 80, 100], ['20', '40', '60', '80', '100']);
        text(s, a.box[0] + a.box[2] / 2, a.box[1] + a.box[3] + 32, 'α = β (log scale)', 'small');
        text(s, 30, 126, 'samples', 'small', 'middle');
        a.curve(function (t) { var al = Math.pow(10, -t); return 4 * Math.pow(Qinv(al), 2); }, 'b', 300);
        a.curve(function (t) { var al = Math.pow(10, -t); return 2 * (1 - 2 * al) * Math.log((1 - al) / al); }, 'a', 300);
        legend(s, 90, 40, [['b', 'fixed sample size, 4[Q⁻¹(α)]²'], ['a', 'SPRT, E{N} ≈ 2(1−2α) ln((1−α)/α)']]);
    })();

})();
