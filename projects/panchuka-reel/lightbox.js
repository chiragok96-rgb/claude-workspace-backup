// Paper-cut Lightbox, Canvas 2D: flat cut sheets, warm backlight through pulp, soft cast shadows, rim + bottom shade.
import { W, H, PAL } from './timeline.js';
import { withSeed, rnd, mulberry } from './engine_wc.js';

const LW = 1400, LH = 2400;                       // sheet size (bigger than the frame: parallax and tilt margin)
const cvs = (w = LW, h = LH) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
let FIBRE, PULPA;

export function initLightbox(fibre, pulp) {
  FIBRE = fibre;
  // pulp → white with alpha = mottle (for translucency)
  const c = cvs(W, H), x = c.getContext('2d'); x.drawImage(pulp, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H);
  for (let i = 0; i < d.data.length; i += 4) { const v = d.data[i]; d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; d.data[i + 3] = 120 + v * .53; }
  x.putImageData(d, 0, 0); PULPA = c;
}

// closed Catmull-Rom path through points
export function crPath(x, P, closed = true) {
  const n = P.length, g = i => P[(i + n) % n];
  x.moveTo(P[0][0], P[0][1]);
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    x.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (closed) x.closePath();
}

// one sheet: draw(ctx) paints opaque shapes in sheet coords (origin = sheet centre); cut(ctx) punches holes
export function sheet(col, draw, o = {}) {
  const big = cvs(), bm = big.getContext('2d');
  bm.translate(LW / 2, LH / 2); bm.fillStyle = '#000'; draw(bm);
  if (o.cut) { bm.globalCompositeOperation = 'destination-out'; bm.fillStyle = '#000'; bm.strokeStyle = '#000'; o.cut(bm); }
  // crop to the painted bounding box (memory and draw cost scale with the sheet's real size)
  const a = bm.getImageData(0, 0, LW, LH).data; let x0 = LW, y0 = LH, x1 = -1, y1 = -1;
  for (let y = 0; y < LH; y += 2) { const r = y * LW * 4; for (let x = 0; x < LW; x += 2) if (a[r + x * 4 + 3] > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  if (x1 < 0) { x0 = y0 = 0; x1 = y1 = 2; }
  const P = 40; x0 = Math.max(0, x0 - P); y0 = Math.max(0, y0 - P); x1 = Math.min(LW, x1 + P); y1 = Math.min(LH, y1 + P);
  const w = x1 - x0, h = y1 - y0, mask = cvs(w, h), m = mask.getContext('2d'); m.drawImage(big, -x0, -y0);
  big.width = big.height = 1;
  const img = cvs(w, h), x = img.getContext('2d');
  x.drawImage(mask, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, w, h);
  x.globalCompositeOperation = 'source-atop'; x.globalAlpha = o.grain ?? .07;
  for (let yy = -y0; yy < h; yy += H) x.drawImage(FIBRE, -x0, yy, LW, H);
  x.globalAlpha = 1;
  const band = (dy, c, al) => {
    const t = cvs(w, h), tx = t.getContext('2d');
    tx.fillStyle = c; tx.fillRect(0, 0, w, h);
    tx.globalCompositeOperation = 'destination-out'; tx.drawImage(mask, 0, dy);
    tx.globalCompositeOperation = 'destination-in'; tx.drawImage(mask, 0, 0);
    x.globalCompositeOperation = 'source-atop'; x.globalAlpha = al; x.drawImage(t, 0, 0); x.globalAlpha = 1;
  };
  band(3, o.rim ?? '#ffc98a', o.rimA ?? .55);
  band(-5, '#000000', o.shadeA ?? .35);
  x.globalCompositeOperation = 'source-over';
  const sh = cvs(Math.ceil(w / 2), Math.ceil(h / 2)), sx = sh.getContext('2d');
  sx.filter = `blur(${o.blur ?? 9}px)`; sx.drawImage(mask, 0, 0, w / 2, h / 2);
  sx.filter = 'none'; sx.globalCompositeOperation = 'source-in'; sx.fillStyle = '#12060a'; sx.fillRect(0, 0, w, h);
  return { img, mask, sh, bx: x0 - LW / 2, by: y0 - LH / 2, bw: w, bh: h, depth: o.depth ?? 0, trans: o.trans ?? .5, lit: 0 };
}

const scratch = () => { if (!scratch.c) scratch.c = cvs(W, H); return scratch.c; };

// draw a stack: layers back → front. cam = {x, y, z}; light = {x, y, r, I, col}; each layer has .lit (0..1) and optional .blur
export function drawStack(ctx, layers, cam, light, extra = {}) {
  const place = (L, c) => {
    const p = .45 + .55 * L.depth, z = 1 + (cam.z - 1) * p;
    c.setTransform(z, 0, 0, z, W / 2 - cam.x * p * z, H / 2 - cam.y * p * z);
    if (L.ox || L.oy) c.translate(L.ox || 0, L.oy || 0);
    if (L.rot) { const [px, py] = L.pivot || [0, 0]; c.translate(px, py); c.rotate(L.rot); c.translate(-px, -py); }
  };
  layers.forEach((L, i) => {
    if (extra.before && extra.before[i]) extra.before[i](ctx, place);
    if (L.hide || (L.alpha ?? 1) <= 0) { if (extra.after && extra.after[i]) extra.after[i](ctx, place); return; }
    const LA = L.alpha ?? 1;
    // shadow of this sheet onto what is behind it
    if (i > 0) {
      ctx.save(); place(L, ctx); ctx.globalAlpha = .55 * (L.shadowA ?? 1) * LA;
      const off = 10 + 26 * (L.depth - layers[i - 1].depth);
      ctx.drawImage(L.sh, L.bx + off * .4, L.by + off, L.bw, L.bh); ctx.restore();
    }
    ctx.save(); place(L, ctx); ctx.globalAlpha = LA;
    if (L.blur) ctx.filter = `blur(${L.blur.toFixed(2)}px)`;
    ctx.drawImage(L.img, L.bx, L.by); ctx.restore();
    // light through paper: warm Gaussian falloff × pulp mottle, clipped to the sheet, screened on
    const a = L.trans * L.lit * light.I;
    if (a > .003) {
      const sc = scratch(), s = sc.getContext('2d');
      s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'source-over'; s.clearRect(0, 0, W, H);
      const g = s.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.r);
      g.addColorStop(0, light.col || '#ffd9a0'); g.addColorStop(.35, 'rgba(255,190,120,.75)'); g.addColorStop(1, 'rgba(255,150,80,0)');
      s.fillStyle = g; s.fillRect(0, 0, W, H);
      s.globalCompositeOperation = 'destination-in'; s.drawImage(PULPA, 0, 0);
      place(L, s); if (L.blur) s.filter = `blur(${L.blur.toFixed(2)}px)`;
      s.drawImage(L.mask, L.bx, L.by); s.filter = 'none';
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = Math.min(1, a) * LA;
      ctx.drawImage(sc, 0, 0); ctx.restore();
    }
    if (extra.after && extra.after[i]) extra.after[i](ctx, place);
  });
}

// analytic glow (no square edges): stacked radial gradients, additive
export function glow(ctx, x, y, r, col, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [k, aa] of [[1, .55], [2.4, .28], [5, .12]]) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * k);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = Math.min(1, a * aa); ctx.fillStyle = g; ctx.fillRect(x - r * k, y - r * k, r * k * 2, r * k * 2);
  }
  ctx.restore();
}

// ---------- motifs ----------
// her profile, facing left; origin at the base of the neck; s = scale
export function profile(m, s = 1, ox = 0, oy = 0) {
  const P = [[200, 300], [168, 150], [150, 40], [150, -60], [135, -200], [80, -275], [0, -305], [-80, -285], [-125, -230], [-140, -165], [-150, -125], [-170, -85], [-188, -55], [-170, -42], [-152, -38], [-160, -22], [-147, -10], [-158, 4], [-146, 22], [-142, 48], [-118, 68], [-80, 78], [-60, 120], [-50, 240], [-90, 330], [-250, 410], [-330, 560], [-345, 760], [420, 760], [400, 520], [330, 400], [230, 330]]
    .map(([x, y]) => [ox + x * s, oy + y * s]);
  m.beginPath(); crPath(m, P); m.fill();
  // bun with a jasmine string, and a hair flower
  m.beginPath(); m.ellipse(ox + 205 * s, oy - 150 * s, 105 * s, 95 * s, -.3, 0, 7); m.fill();
  // nose ring (nath): a thin paper ring
  m.save(); m.lineWidth = 7 * s; m.strokeStyle = '#000'; m.beginPath(); m.arc(ox - 172 * s, oy - 28 * s, 26 * s, -1.2, 2.6); m.stroke(); m.restore();
}
export function profileCuts(m, s = 1, ox = 0, oy = 0) {
  // jasmine pearls around the bun
  for (let k = 0; k < 15; k++) { const a = -2.4 + k * .29; m.beginPath(); m.arc(ox + (205 + Math.cos(a) * 88) * s, oy + (-150 + Math.sin(a) * 78) * s, 10 * s, 0, 7); m.fill(); }
  // jhumka earring: dome + bead drops, cut as light
  const ex = ox + 70 * s, ey = oy - 10 * s;
  m.beginPath(); m.arc(ex, ey, 9 * s, 0, 7); m.fill();
  m.beginPath(); m.moveTo(ex - 30 * s, ey + 62 * s); m.quadraticCurveTo(ex, ey + 6 * s, ex + 30 * s, ey + 62 * s); m.closePath(); m.fill();
  for (let k = -2; k <= 2; k++) { m.beginPath(); m.arc(ex + k * 13 * s, ey + 74 * s, 5 * s, 0, 7); m.fill(); }
  // eye: a thin almond slit, the kohl line extends
  m.beginPath(); m.moveTo(oy * 0 + ox - 118 * s, oy - 150 * s); m.quadraticCurveTo(ox - 98 * s, oy - 162 * s, ox - 70 * s, oy - 150 * s); m.quadraticCurveTo(ox - 98 * s, oy - 144 * s, ox - 118 * s, oy - 150 * s); m.fill();
}
// a rekha-deul temple tower silhouette
export function deul(m, x, base, w, h) {
  m.beginPath(); m.moveTo(x - w / 2, base);
  m.bezierCurveTo(x - w * .52, base - h * .55, x - w * .42, base - h * .85, x - w * .16, base - h * .95);
  m.lineTo(x + w * .16, base - h * .95);
  m.bezierCurveTo(x + w * .42, base - h * .85, x + w * .52, base - h * .55, x + w / 2, base); m.closePath(); m.fill();
  m.beginPath(); m.ellipse(x, base - h * .97, w * .24, h * .045, 0, 0, 7); m.fill();          // amalaka
  m.beginPath(); m.moveTo(x - w * .05, base - h); m.quadraticCurveTo(x, base - h * 1.12, x + w * .05, base - h); m.fill(); // kalasha
  m.fillRect(x - w * .62, base - h * .08, w * 1.24, h * .08);                                   // platform
}
// the Konark wheel cut into a sheet; centre cx,cy, radius R
export function wheelCut(m, cx, cy, R) {
  const r1 = R * .8, hub = R * .17;
  // the open annulus between rim and hub, minus spokes
  m.beginPath(); m.arc(cx, cy, r1, 0, 7); m.arc(cx, cy, hub, 0, 7, true); m.fill();
  // carved beads along the rim
  for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; m.beginPath(); m.arc(cx + Math.cos(a) * R * .9, cy + Math.sin(a) * R * .9, R * .028, 0, 7); m.fill(); }
  // petals in the hub
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; m.beginPath(); m.ellipse(cx + Math.cos(a) * hub * .55, cy + Math.sin(a) * hub * .55, hub * .3, hub * .12, a, 0, 7); m.fill(); }
}
export function wheelSpokes(m, cx, cy, R) {
  const r1 = R * .8, hub = R * .17;
  for (let k = 0; k < 16; k++) {
    const a = k / 16 * Math.PI * 2, wide = k % 2 === 0, w = wide ? R * .085 : R * .035;
    m.save(); m.translate(cx, cy); m.rotate(a);
    m.beginPath(); m.moveTo(hub * .9, -w / 2); m.lineTo(r1 + 2, -w * .7); m.lineTo(r1 + 2, w * .7); m.lineTo(hub * .9, w / 2); m.fill();
    if (wide) { m.beginPath(); m.ellipse(r1 * .58, 0, R * .07, R * .07, 0, 0, 7); m.fill(); }   // medallion on the wide spoke
    m.restore();
  }
}
export { LW, LH, cvs };
