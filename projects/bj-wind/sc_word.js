// "The answer is hidden in the name": ବାଲିଯାତ୍ରା as gold foil; it splits — ବାଲି becomes the island of Bali, ଯାତ୍ରା becomes the boat.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
export const FS = 173;   // the sign's letters, as large as they are on screen when the camera has pushed into the gate
let PARTS, PB, PJ;
function foil(txt) {   // gold foil, stamped: a dark bevel below, a bright edge above, a warm gradient
  const c0 = mk(10, 10).getContext('2d'); c0.font = `700 ${FS}px "OdiaSerif"`; const w = Math.ceil(c0.measureText(txt).width) + 60, h = FS * 2;
  const c = mk(w, h), x = c.getContext('2d'); x.font = `700 ${FS}px "OdiaSerif"`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = 'rgba(0,0,0,.7)'; x.fillText(txt, w / 2 + 3, h / 2 + 5);
  const g = x.createLinearGradient(0, h / 2 - FS * .55, 0, h / 2 + FS * .45); g.addColorStop(0, '#fff0c0'); g.addColorStop(.35, '#e8b450'); g.addColorStop(.6, '#a87020'); g.addColorStop(1, '#f2c86a');
  x.fillStyle = g; x.fillText(txt, w / 2, h / 2);
  x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(255,250,230,.35)'; x.fillText(txt, w / 2 - 1.5, h / 2 - 2);
  const m = mk(w, h), mx = m.getContext('2d', { willReadFrequently: true }); mx.font = x.font; mx.textAlign = 'center'; mx.textBaseline = 'middle'; mx.fillStyle = '#fff'; mx.fillText(txt, w / 2, h / 2);
  const d = mx.getImageData(0, 0, w, h).data, pts = []; for (let y = 0; y < h; y += 3) for (let xx = 0; xx < w; xx += 3) if (d[(y * w + xx) * 4 + 3] > 128) pts.push([xx - w / 2, y - h / 2]);
  return { c, w, h, pts };
}
export function initWord() {
  PB = foil('ବାଲି'); PJ = foil('ଯାତ୍ରା');
  const c0 = mk(10, 10).getContext('2d'); c0.font = `700 ${FS}px "OdiaSerif"`; const wb = c0.measureText('ବାଲି').width, wj = c0.measureText('ଯାତ୍ରା').width, tot = wb + wj;
  PARTS = { bx: 540 - tot / 2 + wb / 2, jx: 540 - tot / 2 + wb + wj / 2 };
}
// targets (screen) come from the map: the island of Bali's land pixels and a boat on the route, as the map camera will see them
let TI = [], TB = [];
export function setTargets(island, boatPts) { TI = island; TB = boatPts; }
function pick(arr, i) { return arr[Math.floor(hh(i * 7.31) * arr.length) % arr.length]; }
export function wordScene(c, t, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  const g = c.createRadialGradient(540, 960, 100, 540, 960, 1200); g.addColorStop(0, '#1c0c08'); g.addColorStop(1, '#060303'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.restore();
  const sp = eio(seg(t, 13.35, 14.3));   // "Bali Jatra mane—": the name parts
  const bX = lerp(PARTS.bx, 380, sp), bY = lerp(960, 800, sp), jX = lerp(PARTS.jx, 690, sp), jY = lerp(960, 1130, sp);
  const db = seg(t, 14.75, 15.75), dj = seg(t, 15.55, 16.5);   // dissolve into particles: ବାଲି on "Bali", ଯାତ୍ରା on "jatra"
  c.save(); c.globalAlpha = a;
  if (db < .12) { c.globalAlpha = a * (1 - db / .12); c.drawImage(PB.c, bX - PB.w / 2, bY - PB.h / 2); }
  c.globalAlpha = a; if (dj < .12) { c.globalAlpha = a * (1 - dj / .12); c.drawImage(PJ.c, jX - PJ.w / 2, jY - PJ.h / 2); }
  c.restore();
  const sh = seg(t, 12.85, 13.55); if (sh > 0 && sh < 1) { c.save(); c.globalCompositeOperation = 'lighter'; const x0 = lerp(-200, 1300, eio(sh)); const gg = c.createLinearGradient(x0 - 120, 0, x0 + 120, 0); gg.addColorStop(0, 'rgba(255,240,200,0)'); gg.addColorStop(.5, `rgba(255,246,220,${.55 * a})`); gg.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = gg; c.fillRect(0, 800, W, 320); c.restore(); }
  // particles
  c.save(); c.globalCompositeOperation = 'lighter';
  const draw = (P, X, Y, T, k, seed) => { if (k <= 0 || !T.length) return; const n = P.pts.length;
    for (let i = 0; i < n; i++) { const [px, py] = P.pts[i], s0x = X + px, s0y = Y + py, [tx, ty] = pick(T, i + seed), u = eio(clamp(k * 1.25 - hh(i * 3.3) * .25));
      const sw = Math.sin(u * Math.PI) * (40 + 60 * hh(i)), an = hh(i * 5.1) * 6.28 + t * 2;
      const x = lerp(s0x, tx, u) + Math.cos(an) * sw, y = lerp(s0y, ty, u) + Math.sin(an) * sw;
      const al = a * (.55 + .45 * hh(i * 2.2)) * (k < .12 ? k / .12 : 1); c.fillStyle = `rgba(255,${210 + 30 * hh(i)},${140 + 50 * hh(i * 4)},${al})`; c.fillRect(x - 1.3, y - 1.3, 2.6, 2.6); } };
  draw(PB, bX, bY, TI, db, 1); draw(PJ, jX, jY, TB, dj, 2);
  c.restore();
}
