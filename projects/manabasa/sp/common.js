// Shared helpers: easing, the clove-scent thread (the film's through-line), clove buds, captions and in-picture Odia labels.
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); }, eo = x => 1 - Math.pow(1 - clamp(x), 3), eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const hh = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
export const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
export function bez(p0, p1, p2, p3, n = 40) { const a = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; a.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return a; }
export function chain(...segs) { const out = []; segs.forEach((s, i) => out.push(...(i ? s.slice(1) : s))); return out; }
export function partial(pts, p) { if (p >= 1) return pts; if (p <= 0) return [pts[0]]; const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const e = L[L.length - 1] * p, out = [pts[0]]; for (let i = 1; i < pts.length; i++) { if (L[i] <= e) out.push(pts[i]); else { const f = (e - L[i - 1]) / (L[i] - L[i - 1]); out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); break; } } return out; }
export function at(pts, p) { const q = partial(pts, clamp(p, .0001, 1)); return q[q.length - 1]; }

// —— the scent of cloves: three fine gold strands that braid and shimmer, with a soft glow; drawn up to fraction p ——
export function scent(c, pts, t, p = 1, a = 1, o = {}) {
  if (a <= 0 || pts.length < 2) return; const q = partial(pts, p); if (q.length < 2) return;
  const w = o.w || 1, col = o.col || [246, 206, 120], wob = o.wob ?? 1;
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const strand = (k, off, lw, al) => { c.beginPath(); for (let i = 0; i < q.length; i++) { const [x, y] = q[i], j = Math.min(i + 1, q.length - 1), i0 = Math.max(i - 1, 0);
      const dx = q[j][0] - q[i0][0], dy = q[j][1] - q[i0][1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, u = i / q.length;
      const d = off * Math.sin(u * 9 + t * 1.6 + k * 2.1) * (3 + 5 * u) * w * wob; i ? c.lineTo(x + nx * d, y + ny * d) : c.moveTo(x + nx * d, y + ny * d); }
    c.globalAlpha = a * al; c.lineWidth = lw * w; c.stroke(); };
  c.globalCompositeOperation = o.op || 'lighter';
  c.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},.16)`; c.filter = 'blur(6px)'; strand(0, 0, 16, 1); c.filter = 'none';
  c.strokeStyle = `rgb(${col[0]},${col[1]},${col[2]})`; for (let k = 0; k < 3; k++) strand(k, 1, 1.6, .55);
  c.strokeStyle = 'rgba(255,244,214,.9)'; strand(4, .35, .8, .6);
  // motes of scent along the strands
  for (let k = 0; k < 18; k++) { const u = (k / 18 + t * .05) % 1; if (u > p) continue; const [x, y] = at(pts, u), r = (1.5 + 2.5 * hh(k)) * w;
    c.globalAlpha = a * (.4 + .5 * Math.sin(t * 3 + k)); c.fillStyle = 'rgba(255,230,170,1)'; c.beginPath(); c.arc(x + (hh(k * 3) - .5) * 30 * w, y + (hh(k * 5) - .5) * 30 * w, r, 0, 7); c.fill(); }
  c.restore();
}
// a clove bud (ଲବଙ୍ଗ): a slender stem, four pointed sepals, the round unopened bud
export function clove(c, x, y, s = 1, rot = 0, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = '#5a2c18'; c.beginPath(); c.moveTo(-2.4, 0); c.quadraticCurveTo(-3, 26, -1.4, 46); c.lineTo(1.4, 46); c.quadraticCurveTo(3, 26, 2.4, 0); c.fill();
  for (let k = 0; k < 4; k++) { c.save(); c.rotate(-.9 + k * .6); c.fillStyle = k % 2 ? '#7a3a1e' : '#6a3018'; c.beginPath(); c.moveTo(-3, 0); c.lineTo(0, -11); c.lineTo(3, 0); c.fill(); c.restore(); }
  const g = c.createRadialGradient(-1.5, -9, 1, 0, -7, 7); g.addColorStop(0, '#c9875a'); g.addColorStop(1, '#6e3a1e'); c.fillStyle = g; c.beginPath(); c.arc(0, -7, 6, 0, 7); c.fill();
  c.restore();
}

// —— captions: one system, a look per medium; always in the clear band (y 1390–1470), never over the picture ——
export const LOOK = {
  ink: { col: '#2b2019', halo: 'rgba(246,238,222,.95)' },     // watercolour, day
  earth: { col: '#f6ead2', halo: 'rgba(40,22,10,.9)' },       // the dark earth section
  leaf: { col: '#f3e3c2', halo: 'rgba(30,6,4,.85)' },         // the red silk wrapper of the leaves
  screen: { col: '#f6e4c4', halo: 'rgba(10,4,2,.95)' },      // the shadow screen: under the hide sea, cream on black
  night: { col: '#f3e7cf', halo: 'rgba(10,6,20,.9)' },        // the paper lightbox at night
};
export function caption(c, lines, look, a = 1, y = 1440) {
  if (a <= 0) return; const L = LOOK[look]; c.save(); c.globalAlpha = a; c.font = 'italic 500 46px "CormorantG"'; c.textAlign = 'center'; c.textBaseline = 'middle';
  lines.forEach((ln, i) => { const yy = y + (i - (lines.length - 1)) * 56; c.shadowColor = L.halo; c.shadowBlur = 18; c.fillStyle = L.col; c.fillText(ln, 540, yy); c.shadowBlur = 0; c.fillText(ln, 540, yy); });
  c.restore();
}
// an in-picture Odia word (Noto Serif Oriya), with a halo; gold option glows
export function label(c, txt, x, y, size, col, halo, a = 1, w = 700, gold = false) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = `${w} ${size}px "OdiaSerif"`; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (gold) { c.shadowColor = 'rgba(255,190,90,.9)'; c.shadowBlur = 24; }
  else { c.shadowColor = halo; c.shadowBlur = 16; }
  c.fillStyle = col; c.fillText(txt, x, y); c.shadowBlur = 0; c.fillText(txt, x, y); c.restore();
}
