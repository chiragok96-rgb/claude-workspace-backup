// Chhapan Bhoga, seen from above: fifty-six bowls of kansa (bell-metal) and terracotta laid in a golden spiral on banana leaves
// around a ghee lamp, lit like a still life. They bloom in, one after another, as the line is spoken — and then they empty.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
const N = 56, GA = Math.PI * (3 - Math.sqrt(5));
// what is in each bowl: [name, base colour, texture]
const FOOD = [['anna', '#f4efe2', 'grain'], ['dali', '#e8a83a', 'smooth'], ['khiri', '#f2e2c0', 'fleck'], ['saga', '#3c5a22', 'leaf'], ['besara', '#d8a030', 'chunk'],
  ['mahura', '#c8782a', 'chunk'], ['khechudi', '#e2c068', 'grain'], ['dalma', '#c89a40', 'chunk'], ['rasabali', '#f0d8a8', 'balls'], ['khaja', '#e8c890', 'layers'],
  ['laddu', '#e8902a', 'balls'], ['pitha', '#c48a52', 'crescent'], ['khatta', '#a82a1e', 'smooth'], ['ghia anna', '#f2d890', 'grain'], ['magaja', '#d89a50', 'balls'], ['dahi', '#faf6ec', 'smooth']];
let LEAF, FLOOR;
export function initBhoga() {
  FLOOR = mk(W, H); const f = FLOOR.getContext('2d');   // dark polished stone, a few marigold petals and tulasi leaves
  const g = f.createRadialGradient(540, 900, 50, 540, 900, 1300); g.addColorStop(0, '#2a1a12'); g.addColorStop(1, '#0a0605'); f.fillStyle = g; f.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { f.fillStyle = `rgba(${hh(i) > .5 ? '80,56,40' : '0,0,0'},${.05 + .06 * hh(i * 3)})`; f.fillRect(hh(i * 1.3) * W, hh(i * 2.7) * H, 1 + hh(i * 5) * 3, 1 + hh(i * 7) * 3); }
  for (let i = 0; i < 70; i++) { const x = hh(i * 4.1) * W, y = hh(i * 6.3) * H, r = Math.hypot(x - 540, y - 900); if (r < 560) continue; f.save(); f.translate(x, y); f.rotate(hh(i) * 6.3); f.fillStyle = i % 3 ? `rgba(${230 + 20 * hh(i)},${120 + 40 * hh(i * 2)},20,.85)` : 'rgba(60,96,40,.8)'; f.beginPath(); f.ellipse(0, 0, 9 + 6 * hh(i * 3), 5, 0, 0, 7); f.fill(); f.restore(); }
  LEAF = mk(1200, 1200); const l = LEAF.getContext('2d'); l.translate(600, 600);   // eight banana-leaf petals under the spiral
  for (let k = 0; k < 8; k++) { l.save(); l.rotate(k * Math.PI / 4 + .2);
    const lg = l.createLinearGradient(0, 0, 560, 0); lg.addColorStop(0, '#1e3c12'); lg.addColorStop(.55, '#2c5418'); lg.addColorStop(1, '#16300c'); l.fillStyle = lg;
    l.beginPath(); l.moveTo(0, 0); l.bezierCurveTo(160, -190, 470, -170, 590, 0); l.bezierCurveTo(470, 170, 160, 190, 0, 0); l.fill();
    const sh = l.createLinearGradient(0, -120, 0, 120); sh.addColorStop(0, 'rgba(255,255,230,0)'); sh.addColorStop(.42, 'rgba(255,255,230,.08)'); sh.addColorStop(.5, 'rgba(255,255,230,0)'); l.fillStyle = sh; l.fill();
    l.strokeStyle = 'rgba(190,220,150,.25)'; l.lineWidth = 3; l.beginPath(); l.moveTo(0, 0); l.lineTo(575, 0); l.stroke();
    l.lineWidth = 1.2; for (let j = 1; j < 30; j++) { const x = j * 19; l.strokeStyle = `rgba(190,220,150,${.08 + .05 * hh(j + k)})`; l.beginPath(); l.moveTo(x, 0); l.quadraticCurveTo(x + 30, -60, x + 46, -Math.min(140, 150 * Math.sin(x / 580 * Math.PI))); l.moveTo(x, 0); l.quadraticCurveTo(x + 30, 60, x + 46, Math.min(140, 150 * Math.sin(x / 580 * Math.PI))); l.stroke(); }
    l.restore(); }
}
export const bowlPos = i => { const r = 108 + 58 * Math.sqrt(i + .4), a = i * GA; return [Math.cos(a) * r, Math.sin(a) * r]; };
function bowl(c, x, y, R, i, fill, t) {   // a bowl seen from above: rim, shadow, the food inside
  const brass = i % 3 !== 1, [nm, col, tex] = FOOD[i % FOOD.length];
  c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(x + R * .12, y + R * .16, R * 1.04, R * 1.04, 0, 0, 7); c.fill();   // its shadow on the leaf
  let g = c.createLinearGradient(x - R, y - R, x + R, y + R);
  if (brass) { g.addColorStop(0, '#f6d890'); g.addColorStop(.35, '#c8963c'); g.addColorStop(.7, '#8a5e1e'); g.addColorStop(1, '#5a3a12'); } else { g.addColorStop(0, '#d0784a'); g.addColorStop(.5, '#9a4626'); g.addColorStop(1, '#5a2410'); }
  c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill();
  const ir = R * .8; g = c.createRadialGradient(x - ir * .2, y - ir * .2, ir * .2, x, y, ir); g.addColorStop(0, brass ? '#6a4818' : '#4a1e0c'); g.addColorStop(1, brass ? '#3a240a' : '#2a0e06'); c.fillStyle = g; c.beginPath(); c.arc(x, y, ir, 0, 7); c.fill();   // the inside, in shade
  if (fill > 0) { c.save(); c.globalAlpha *= fill; c.beginPath(); c.arc(x, y, ir * .96, 0, 7); c.clip();
    g = c.createRadialGradient(x - ir * .3, y - ir * .35, 1, x, y, ir); g.addColorStop(0, col); g.addColorStop(1, shade(col, .62)); c.fillStyle = g; c.fillRect(x - ir, y - ir, ir * 2, ir * 2);
    const s = i * 13.7;
    if (tex === 'grain') for (let k = 0; k < 60; k++) { c.fillStyle = `rgba(255,255,250,${.35 + .4 * hh(s + k)})`; c.save(); c.translate(x + (hh(s + k * 2) - .5) * ir * 1.8, y + (hh(s + k * 3) - .5) * ir * 1.8); c.rotate(hh(k) * 3); c.fillRect(-2.2, -.8, 4.4, 1.6); c.restore(); }
    if (tex === 'fleck' || tex === 'smooth') for (let k = 0; k < 18; k++) { c.fillStyle = tex === 'fleck' ? 'rgba(120,80,30,.5)' : `rgba(${hh(k) > .5 ? '255,255,240,.3' : '90,40,10,.35'})`; c.beginPath(); c.arc(x + (hh(s + k * 2) - .5) * ir * 1.6, y + (hh(s + k * 3) - .5) * ir * 1.6, .8 + hh(k) * 1.6, 0, 7); c.fill(); }
    if (tex === 'leaf') for (let k = 0; k < 14; k++) { c.fillStyle = `rgba(${90 + 50 * hh(k)},${130 + 40 * hh(k * 2)},60,.6)`; c.beginPath(); c.ellipse(x + (hh(s + k * 2) - .5) * ir * 1.5, y + (hh(s + k * 3) - .5) * ir * 1.5, 5, 2.4, hh(k) * 3, 0, 7); c.fill(); }
    if (tex === 'chunk') for (let k = 0; k < 9; k++) { c.fillStyle = ['#e8c070', '#8a4a1e', '#f0d8a0', '#5a7a2a'][k % 4]; c.beginPath(); c.roundRect(x + (hh(s + k * 2) - .5) * ir * 1.4 - 4, y + (hh(s + k * 3) - .5) * ir * 1.4 - 4, 8, 7, 2); c.fill(); }
    if (tex === 'balls' || tex === 'crescent' || tex === 'layers') { const n = tex === 'balls' ? 5 : 3; for (let k = 0; k < n; k++) { const a = k / n * 6.28 + s, rr = tex === 'balls' ? ir * .42 : ir * .36, px = x + Math.cos(a) * ir * (n > 3 ? .45 : .35), py = y + Math.sin(a) * ir * (n > 3 ? .45 : .35);
      g = c.createRadialGradient(px - rr * .35, py - rr * .4, 1, px, py, rr); g.addColorStop(0, shade(col, 1.25)); g.addColorStop(1, shade(col, .7)); c.fillStyle = g; c.beginPath();
      if (tex === 'crescent') c.ellipse(px, py, rr, rr * .6, a, 0, 7); else if (tex === 'layers') c.roundRect(px - rr, py - rr * .6, rr * 2, rr * 1.2, 4); else c.arc(px, py, rr, 0, 7); c.fill(); } }
    if (tex === 'smooth' || tex === 'chunk' || tex === 'fleck') { g = c.createRadialGradient(x - ir * .35, y - ir * .4, 0, x - ir * .35, y - ir * .4, ir * .5); g.addColorStop(0, 'rgba(255,255,245,.45)'); g.addColorStop(1, 'rgba(255,255,245,0)'); c.fillStyle = g; c.fillRect(x - ir, y - ir, ir * 2, ir * 2); }
    c.restore(); }
  c.strokeStyle = brass ? 'rgba(255,240,200,.75)' : 'rgba(255,190,150,.45)'; c.lineWidth = Math.max(1, R * .06); c.beginPath(); c.arc(x, y, R * .9, Math.PI * 1.05, Math.PI * 1.6); c.stroke();   // the light on the rim
}
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); const r = Math.min(255, (n >> 16) * k), g = Math.min(255, (n >> 8 & 255) * k), b = Math.min(255, (n & 255) * k); return `rgb(${r | 0},${g | 0},${b | 0})`; }
// o: bloom (0..1 how many bowls have come), empty (0..1 how many have emptied, in reverse), rot, z, lamp (flame strength)
let LAY, BLR;
export function bhoga(c0, t, o = {}) {
  const { bloom = 1, empty = 0, rot = 0, z = 1, cx = 540, cy = 900, lamp = 1 } = o;
  if (!LAY) { LAY = mk(W, H); BLR = mk(W, H); } const c = LAY.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.save(); c.drawImage(FLOOR, 0, 0);
  c.translate(cx, cy); c.scale(z, z); c.rotate(rot);
  c.save(); c.globalAlpha *= ss(bloom * 3); c.drawImage(LEAF, -600 * 1.02, -600 * 1.02, 1224, 1224); c.restore();
  for (let i = N - 1; i >= 0; i--) { const b = eo(clamp(bloom * N * 1.15 - i * 1.0, 0, 1)); if (b <= 0) continue;   // in spiral order, outward
    const [x, y] = bowlPos(i), R = (40 + 8 * Math.sqrt(i / N)) * (.6 + .4 * b) * (1 + .15 * Math.sin(Math.PI * b)), fill = 1 - ss(clamp(empty * N * 1.2 - (N - 1 - i), 0, 1));
    c.save(); c.globalAlpha *= b; c.translate(x, y); c.rotate(-rot); bowl(c, 0, 0, R, i, fill, t); c.restore(); }
  // the ghee lamp at the centre: a brass dish, the flame seen from above as a burning point, its light on everything
  let g = c.createRadialGradient(-6, -6, 2, 0, 0, 40); g.addColorStop(0, '#f8dc94'); g.addColorStop(.6, '#b07a28'); g.addColorStop(1, '#5a3a10'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 40, 0, 7); c.fill();
  c.fillStyle = '#3a2408'; c.beginPath(); c.arc(0, 0, 30, 0, 7); c.fill();
  c.restore();
  if (lamp > 0) { const fl = lamp * (.9 + .1 * Math.sin(t * 13) + .05 * Math.sin(t * 29)); c.save(); c.globalCompositeOperation = 'lighter';
    g = c.createRadialGradient(cx, cy, 0, cx, cy, 700 * z); g.addColorStop(0, `rgba(255,200,120,${.5 * fl})`); g.addColorStop(.25, `rgba(255,170,90,${.18 * fl})`); g.addColorStop(1, 'rgba(255,150,70,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    g = c.createRadialGradient(cx, cy, 0, cx, cy, 26 * z); g.addColorStop(0, `rgba(255,252,236,${fl})`); g.addColorStop(.4, `rgba(255,220,140,${.8 * fl})`); g.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = g; c.fillRect(cx - 30 * z, cy - 30 * z, 60 * z, 60 * z); c.restore(); }
  // steam, drifting up off the hot dishes
  c.save(); c.globalCompositeOperation = 'screen'; for (let k = 0; k < 9; k++) { const i = (k * 6 + 3) % N, [bx, by] = bowlPos(i), a = rot, px = cx + (bx * Math.cos(a) - by * Math.sin(a)) * z, py = cy + (bx * Math.sin(a) + by * Math.cos(a)) * z, u = (t * .25 + hh(k)) % 1, al = Math.sin(Math.PI * u) * .1 * ss(bloom * 2) * (1 - empty);
    if (al <= 0) continue; g = c.createRadialGradient(px + 20 * Math.sin(t + k), py - 80 * u, 0, px + 20 * Math.sin(t + k), py - 80 * u, 60 + 40 * u); g.addColorStop(0, `rgba(255,246,230,${al})`); g.addColorStop(1, 'rgba(255,246,230,0)'); c.fillStyle = g; c.fillRect(px - 120, py - 220, 240, 300); }
  c.restore();
  c.restore();
  const b = BLR.getContext('2d'); b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, W, H); b.filter = 'blur(7px)'; b.drawImage(LAY, 0, 0); b.filter = 'none';
  b.globalCompositeOperation = 'destination-out'; const m = b.createRadialGradient(cx, cy, 260 * z, cx, cy, 640 * z); m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)'); b.fillStyle = m; b.fillRect(0, 0, W, H);
  c0.save(); c0.drawImage(LAY, 0, 0); c0.drawImage(BLR, 0, 0);   // shallow focus: sharp at the lamp, softening outward
  const v = c0.createRadialGradient(540, 900, 420, 540, 960, 1200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.75)'); c0.fillStyle = v; c0.fillRect(0, 0, W, H);   // a vignette, like a still life
  c0.restore();
}
