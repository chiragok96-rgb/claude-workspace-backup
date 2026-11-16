// Impasto · palette knife, Canvas 2D: strokes placed from a value-planned reference, confined to shape groups,
// coarse → fine, each a slanted plane with a lit ridge, a dark lip, a dragged second colour and broken run-out.
import { mulberry } from './engine_wc.js';

const cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const LIGHT = [-.62, -.78];                      // raking light from upper left
const hx = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const sh = (c, k) => c.map(v => Math.max(0, Math.min(255, v * k)));
const toward = (c, d, k) => c.map((v, i) => v + (d[i] - v) * k);

// one knife stroke. s = {x, y, ang, len, wid, c:[r,g,b], c2, seed, alpha}
export function knife(x, s, o = {}) {
  const R = mulberry(s.seed | 0), u = [Math.cos(s.ang), Math.sin(s.ang)], n = [-u[1], u[0]];
  const L = s.len / 2, Wd = s.wid / 2, sl = s.wid * (R() * .5 - .1);
  const P = [[-L + sl, -Wd], [L + sl * .4, -Wd * .92], [L - sl * .4, Wd], [-L - sl, Wd * .96]]
    .map(([a, b]) => [s.x + u[0] * a + n[0] * b, s.y + u[1] * a + n[1] * b]);
  const grey = o.grey || 0, gr = c => { const l = c[0] * .3 + c[1] * .55 + c[2] * .15; return toward(c, [l * .97, l, l * 1.06], grey); };
  const c1 = gr(s.c), c2 = gr(s.c2 || s.c), a = (s.alpha ?? 1) * (o.alpha ?? 1);
  const g = x.createLinearGradient(s.x - n[0] * Wd, s.y - n[1] * Wd, s.x + n[0] * Wd, s.y + n[1] * Wd);
  g.addColorStop(0, css(c1, a)); g.addColorStop(.55, css(toward(c1, c2, .35), a)); g.addColorStop(1, css(c2, a));
  x.beginPath(); x.moveTo(...P[0]); for (let i = 1; i < 4; i++) x.lineTo(...P[i]); x.closePath(); x.fillStyle = g; x.fill();
  const lit = n[0] * LIGHT[0] + n[1] * LIGHT[1], ridge = o.ridge ?? 1;          // >0: edge −n faces away from light
  const edge = (p, q, col, w, al) => { x.beginPath(); x.moveTo(...p); x.lineTo(...q); x.strokeStyle = css(col, al * a); x.lineWidth = w; x.stroke(); };
  const hiE = lit > 0 ? [P[2], P[3]] : [P[0], P[1]], loE = lit > 0 ? [P[0], P[1]] : [P[2], P[3]];
  edge(...hiE, toward(c1, [255, 240, 210], .45), Math.max(1, s.wid * .06), .32 * ridge * Math.abs(lit) + .06);
  edge(...loE, sh(c1, .62), Math.max(1, s.wid * .05), .26 * ridge);
  // lifted lip at the end of the stroke
  edge(P[1], P[2], toward(c1, [255, 236, 200], .4), Math.max(1.2, s.wid * .08), .28 * ridge);
  // broken run-out streaks
  if (s.wid > 10 && !s.solid) {
    x.lineCap = 'round';
    for (let k = 0; k < 2; k++) {
      const off = (R() - .5) * s.wid * .8, st = L * (.1 + R() * .5), en = L + s.len * (.05 + R() * .18);
      edge([s.x + u[0] * st + n[0] * off, s.y + u[1] * st + n[1] * off], [s.x + u[0] * en + n[0] * off, s.y + u[1] * en + n[1] * off], toward(c1, c2, R()), 1 + R() * s.wid * .07, .32);
    }
  }
}

// reference → strokes. ref: canvas (colour plan), ids: canvas (group colour), groups: {key:'#rrggbb' → {maxR, minR, dir, jit, detail}}
export function strokesFromRef(ref, ids, groups, seed = 1) {
  const w = ref.width, h = ref.height, R = mulberry(seed);
  const rd = ref.getContext('2d').getImageData(0, 0, w, h).data, id = ids.getContext('2d').getImageData(0, 0, w, h).data;
  const gid = (x, y) => { x = Math.max(0, Math.min(w - 1, x | 0)); y = Math.max(0, Math.min(h - 1, y | 0)); const i = (y * w + x) * 4; return (id[i] << 16) | (id[i + 1] << 8) | id[i + 2]; };
  const col = (x, y) => { x = Math.max(0, Math.min(w - 1, x | 0)); y = Math.max(0, Math.min(h - 1, y | 0)); const i = (y * w + x) * 4; return [rd[i], rd[i + 1], rd[i + 2]]; };
  const G = {}; for (const k in groups) G[parseInt(k.slice(1), 16)] = groups[k];
  const out = [];
  for (const pass of [1, .55, .3]) {
    for (const key in G) {
      const g = G[key]; const r = Math.max(g.minR ?? 3, (g.maxR ?? 30) * pass); if (pass < 1 && (g.maxR ?? 30) * pass < (g.minR ?? 3)) continue;
      const step = r * .95;
      for (let y = R() * step; y < h; y += step) for (let x = R() * step; x < w; x += step) {
        const px = x + (R() - .5) * step, py = y + (R() - .5) * step;
        if (gid(px, py) !== +key) continue;
        // finer passes only near edges (or everywhere for detail groups)
        if (pass < 1 && !g.detail) { let edge = false; for (let k = 0; k < 6 && !edge; k++) { const a = k / 6 * 6.283; if (gid(px + Math.cos(a) * r * 2.2, py + Math.sin(a) * r * 2.2) !== +key) edge = true; } if (!edge) continue; }
        let ang = typeof g.dir === 'function' ? g.dir(px, py) : (g.dir ?? 0); ang += (R() - .5) * (g.jit ?? .45);
        let len = r * (2.0 + R() * 1.3), wid = r * (1.0 + R() * .5);
        // confine to the group: shorten until both ends stay inside
        for (let k = 0; k < 4; k++) { const ex = Math.cos(ang) * len / 2, ey = Math.sin(ang) * len / 2; if (gid(px + ex, py + ey) === +key && gid(px - ex, py - ey) === +key) break; len *= .65; wid *= .85; }
        const c = col(px, py).map(v => v * (1 + (R() - .5) * .12)), c2 = col(px + Math.cos(ang) * len * .6, py + Math.sin(ang) * len * .6);
        out.push({ x: px, y: py, ang, len, wid, c, c2, seed: (R() * 1e9) | 0, solid: g.solid, sweep: 0 });
      }
    }
  }
  return out;
}

// bake strokes to a plate (underpainting first: the reference blurred)
export function bake(ref, strokes, o = {}) {
  const c = cvs(ref.width, ref.height), x = c.getContext('2d');
  x.filter = 'blur(2px)'; x.drawImage(ref, 0, 0); x.filter = 'none';
  for (const s of strokes) knife(x, s, o);
  return c;
}
export { cvs, hx, css };
