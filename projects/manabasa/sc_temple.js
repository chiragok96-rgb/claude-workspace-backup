// The temple at night, lit only by ghee lamps: deep darkness, gold, flame. The great door of the sanctum; Balabhadra's and
// Jagannath's carved faces glowing in lamplight (their own sacred forms, crowned with flowers); Lakshmi's raised hand ringed in fire;
// the temple kitchen's earthen hearths with their towers of pots, going cold one by one; a handful of rice running out of a hand.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
const GOLD = '#e8b860';
export function dark(c, t, o = {}) {   // the night of the temple, warm at the centre
  const { cx = 540, cy = 1000, warm = 1 } = o; const g = c.createRadialGradient(cx, cy, 50, cx, cy, 1300); g.addColorStop(0, `rgb(${Math.round(40 * warm + 12)},${Math.round(20 * warm + 8)},${Math.round(10 * warm + 6)})`); g.addColorStop(1, '#040302'); c.fillStyle = g; c.fillRect(0, 0, W, H);
}
export function glow(c, x, y, r, a = 1, col = '255,190,110') { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${.55 * a})`); g.addColorStop(.3, `rgba(${col},${.18 * a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore(); }
export function lamp(c, t, x, y, s = 1, a = 1, seed = 0) {   // a tall brass lamp with its flame
  if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s);
  let g = c.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, '#5a3a10'); g.addColorStop(.4, '#f0cc78'); g.addColorStop(1, '#6a4410'); c.fillStyle = g;
  c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(0, -20, 40, 0); c.lineTo(40, 8); c.lineTo(-40, 8); c.fill(); c.fillRect(-6, -150, 12, 150); c.beginPath(); c.ellipse(0, -150, 34, 9, 0, 0, 7); c.fill();
  const fl = 1 + .1 * Math.sin(t * 13 + seed) + .06 * Math.sin(t * 23 + seed * 2), fh = 34 * fl;
  c.globalCompositeOperation = 'lighter'; g = c.createRadialGradient(0, -170, 0, 0, -170, 260); g.addColorStop(0, `rgba(255,190,100,${.5 * fl})`); g.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = g; c.fillRect(-260, -430, 520, 520);
  g = c.createLinearGradient(0, -150, 0, -150 - fh); g.addColorStop(0, '#fff6dc'); g.addColorStop(.5, '#ffc860'); g.addColorStop(1, 'rgba(255,110,30,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(-9, -154); c.quadraticCurveTo(-10, -170, Math.sin(t * 5 + seed) * 3, -154 - fh); c.quadraticCurveTo(10, -170, 9, -154); c.closePath(); c.fill();
  c.restore();
}
// the sanctum's great door: carved stone frame, two leaves of old wood studded with brass; shut 0 (open) … 1 (closed)
export function templeDoor(c, t, o = {}) {
  const { shut = 0, x = 540, y = 1380, s = 1, inner = 1, a = 1 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s);
  const dw = 520, dh = 900;
  let g = c.createLinearGradient(-dw, 0, dw, 0); g.addColorStop(0, '#120a06'); g.addColorStop(.5, '#3a2616'); g.addColorStop(1, '#120a06'); c.fillStyle = g; c.fillRect(-dw / 2 - 90, -dh - 120, dw + 180, dh + 120);   // the stone frame
  for (let k = 0; k < 9; k++) { c.fillStyle = `rgba(255,200,130,${.06 + .03 * (k % 2)})`; c.fillRect(-dw / 2 - 80, -dh - 110 + k * 12, dw + 160, 5); }   // carved bands
  for (const sd of [-1, 1]) for (let k = 0; k < 14; k++) { c.fillStyle = `rgba(255,200,130,${.07})`; c.beginPath(); c.arc(sd * (dw / 2 + 45), -dh + 40 + k * 64, 16, 0, 7); c.fill(); }   // carved roundels on the jambs
  c.fillStyle = '#0a0604'; c.fillRect(-dw / 2, -dh, dw, dh);
  if (inner > 0 && shut < 1) { c.save(); c.globalCompositeOperation = 'lighter'; g = c.createRadialGradient(0, -dh * .45, 10, 0, -dh * .45, dh * .7); g.addColorStop(0, `rgba(255,200,120,${.6 * inner * (1 - shut)})`); g.addColorStop(1, 'rgba(255,160,80,0)'); c.fillStyle = g; c.fillRect(-dw / 2, -dh, dw, dh); c.restore(); }
  const lw = dw / 2 * clamp(shut);
  for (const sd of [-1, 1]) { if (lw < 1) break; const x0 = sd < 0 ? -dw / 2 : dw / 2 - lw;
    g = c.createLinearGradient(x0, 0, x0 + lw, 0); g.addColorStop(0, '#4a2412'); g.addColorStop(.5, '#6a3418'); g.addColorStop(1, '#3a1a0c'); c.fillStyle = g; c.fillRect(x0, -dh, lw, dh);
    c.strokeStyle = 'rgba(20,8,2,.7)'; c.lineWidth = 6; c.strokeRect(x0 + lw * .1, -dh + 50, lw * .8, dh * .42); c.strokeRect(x0 + lw * .1, -dh * .5 + 20, lw * .8, dh * .42);
    for (let r = 0; r < 8; r++) for (let q = 0; q < 3; q++) { const bx = x0 + lw * (.2 + .3 * q), by = -dh + 70 + r * 108; g = c.createRadialGradient(bx - 3, by - 3, 1, bx, by, 13); g.addColorStop(0, '#fff0b0'); g.addColorStop(.5, '#c89838'); g.addColorStop(1, '#5a3a10'); c.fillStyle = g; c.beginPath(); c.arc(bx, by, 12 * Math.min(1, lw / 120), 0, 7); c.fill(); } }   // brass bosses
  if (shut >= .995) { c.fillStyle = '#100604'; c.fillRect(-3, -dh, 6, dh); }
  c.restore();
}
// a deity's carved face, lamp-lit: J (Jagannath, black), B (Balabhadra, white); a crown of flowers (tahia) and a marigold garland
export function idol(c, t, x, y, s, who, o = {}) {
  const { a = 1, stern = 0, wide = 0, look = 0, lit = 1 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s);
  // the crown of flowers fanning above
  for (let k = 0; k < 15; k++) { const an = -Math.PI / 2 + (k - 7) * .17, L = 330 + 30 * hh(k); c.save(); c.rotate(an + Math.PI / 2); for (let j = 0; j < 7; j++) { const r = 210 + j * 22; c.fillStyle = j % 2 ? '#e88a1c' : (k % 3 ? '#f4c030' : '#f6f0e0'); c.beginPath(); c.arc(0, -r, 11 + j * .8, 0, 7); c.fill(); } c.restore(); }
  c.fillStyle = '#c89838'; c.beginPath(); c.ellipse(0, -230, 170, 34, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,240,180,.5)'; c.fillRect(-150, -240, 300, 4);
  // the face, with the lamp's light from below
  const fc = who === 'J' ? ['#3a3036', '#120e10'] : ['#fffaf0', '#c8b8a0'];
  let g = c.createRadialGradient(0, 40, 20, 0, -60, 260); g.addColorStop(0, fc[0]); g.addColorStop(1, fc[1]); c.fillStyle = g;
  c.beginPath(); c.moveTo(-160, -220); c.bezierCurveTo(-176, -110, -166, 10, -116, 70); c.quadraticCurveTo(0, 120, 116, 70); c.bezierCurveTo(166, 10, 176, -110, 160, -220); c.closePath(); c.fill();
  c.strokeStyle = `rgba(255,214,150,${.35 * lit})`; c.lineWidth = 4; c.stroke();   // lamplight on the edge
  for (const sd of [-1, 1]) { g = c.createRadialGradient(sd * 178, -50, 2, sd * 178, -50, 28); g.addColorStop(0, '#fff0b0'); g.addColorStop(1, '#8a6018'); c.fillStyle = g; c.beginPath(); c.arc(sd * 178, -50, 26, 0, 7); c.fill(); }   // gold earrings
  if (who === 'B') { c.strokeStyle = '#2a1a10'; c.lineWidth = 7; c.lineCap = 'round'; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 22, -168 + 16 * stern); c.quadraticCurveTo(sd * 72, -190 + 12 * stern, sd * 124, -166 - 10 * stern); c.stroke(); } }
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * 68, -104);
    c.fillStyle = '#fbf6ea'; c.beginPath(); if (who === 'J') c.arc(0, 0, 56 * (1 + .2 * wide), 0, 7); else c.ellipse(0, 0, 60, 38 * (1 - .3 * stern), 0, 0, 7); c.fill();
    c.strokeStyle = '#b81e16'; c.lineWidth = 11; c.stroke(); c.fillStyle = '#0a0606'; c.beginPath(); c.arc(look * 16, 0, who === 'J' ? 24 + 6 * wide : 21, 0, 7); c.fill();
    c.fillStyle = `rgba(255,236,190,${.85 * lit})`; c.beginPath(); c.arc(look * 16 - 7, -8, 6 + 3 * wide, 0, 7); c.fill(); if (wide > 0) { c.fillStyle = `rgba(255,246,220,${.8 * wide})`; c.beginPath(); c.arc(look * 16 + 7, 8, 3, 0, 7); c.fill(); } c.restore(); }   // the eyes, a lamp caught in each
  c.fillStyle = '#b81e16'; c.beginPath(); c.moveTo(-64, 16); c.quadraticCurveTo(0, 44 - 22 * stern, 64, 16); c.quadraticCurveTo(0, 30 - 16 * stern, -64, 16); c.fill();
  c.fillStyle = who === 'J' ? '#f6f0e2' : '#b81e16'; c.beginPath(); c.moveTo(-12, -150); c.lineTo(0, -214); c.lineTo(12, -150); c.closePath(); c.fill();
  for (let k = 0; k < 22; k++) { const u = k / 21, gx = lerp(-200, 200, u), gy = 120 + 70 * Math.sin(u * Math.PI); c.fillStyle = k % 2 ? '#e8841a' : '#f4b62a'; c.beginPath(); c.arc(gx, gy, 17, 0, 7); c.fill(); }   // a marigold garland
  c.restore();
}
// the temple kitchen: twelve hearths, each with its tower of earthen pots, fire in its mouth — cold(k) puts them out in turn
export function hearths(c, t, cold, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha *= a;
  for (let k = 0; k < 12; k++) { const row = k < 6 ? 0 : 1, i = k % 6, x = 150 + i * 156 + (row ? 78 : 0), y = row ? 1180 : 900, s = row ? 1 : .8, q = clamp(cold * 12 - k), fire = 1 - q;
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = '#3a2418'; c.beginPath(); c.roundRect(-70, -40, 140, 90, 14); c.fill(); c.fillStyle = '#0a0604'; c.beginPath(); c.ellipse(0, 20, 34, 22, 0, Math.PI, 0); c.fill();   // the mud hearth, its mouth
    if (fire > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(0, 18, 0, 0, 18, 120); g.addColorStop(0, `rgba(255,150,50,${.9 * fire * (.85 + .15 * Math.sin(t * 11 + k))})`); g.addColorStop(1, 'rgba(255,90,20,0)'); c.fillStyle = g; c.fillRect(-120, -100, 240, 240); c.restore(); }
    for (let j = 0; j < 5; j++) { const r = 54 - j * 6, py = -70 - j * 58; const g = c.createLinearGradient(-r, 0, r, 0); g.addColorStop(0, '#3a1a0c'); g.addColorStop(.45, fire > 0 ? '#b8683a' : '#6a4030'); g.addColorStop(1, '#2a120a'); c.fillStyle = g; c.beginPath(); c.ellipse(0, py, r, 34, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(0, py - 22, r * .55, 7, 0, 0, 7); c.fill(); }   // the tower of pots
    const sm = q > 0 ? Math.min(1, q * 2) * (1 - seg(q, .6, 1) * .3) : 0, st = fire;   // steam while hot, a thread of smoke once out
    c.strokeStyle = q > 0 ? `rgba(120,110,100,${.4 * sm})` : `rgba(255,240,220,${.25 * st})`; c.lineWidth = q > 0 ? 6 : 10; c.beginPath(); c.moveTo(0, -340); for (let j = 1; j < 9; j++) c.lineTo(Math.sin(t * 2 + j + k) * 14 * j / 3, -340 - j * 30); c.stroke();
    c.restore(); }
  c.restore();
}
// a hand, raised, in silhouette ringed with gold, flames of anger around it (Lakshmi's curse)
let HM, HE;
export function raisedHand(c, t, x, y, s, o = {}) {
  const { a = 1, fire = 0 } = o; if (a <= 0) return; c.save(); const A0 = (c.globalAlpha *= a); c.translate(x, y); c.scale(s, s);
  if (fire > 0) { c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 26; k++) { const an = -Math.PI / 2 + (k - 12.5) * .12, L = (380 + 90 * Math.sin(t * 7 + k * 1.7)) * fire, g = c.createLinearGradient(0, -120, Math.cos(an) * L, -120 + Math.sin(an) * L); g.addColorStop(0, 'rgba(255,190,90,.0)'); g.addColorStop(.4, 'rgba(255,160,60,.35)'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.strokeStyle = g; c.lineWidth = 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(Math.cos(an) * 140, -120 + Math.sin(an) * 140); c.quadraticCurveTo(Math.cos(an + .1) * L * .6, -120 + Math.sin(an + .1) * L * .6, Math.cos(an) * L, -120 + Math.sin(an) * L); c.stroke(); } c.restore(); }
  const P = new Path2D(), D = Math.PI / 180;
  [[-84, -4, 236, 36, -.15], [-28, -20, 274, 38, -.05], [28, -14, 258, 37, .05], [82, 6, 202, 32, .17]].forEach(([fx, fy, L, w, th]) => { const q = new Path2D(); q.moveTo(-w / 2, 110); q.bezierCurveTo(-w * .54, -L * .35, -w * .44, -L * .78, -w * .34, -L + w * .34); q.quadraticCurveTo(-w * .18, -L - 1, 0, -L); q.quadraticCurveTo(w * .18, -L - 1, w * .34, -L + w * .34); q.bezierCurveTo(w * .44, -L * .78, w * .52, -L * .35, w / 2, 110); q.closePath(); P.addPath(q, new DOMMatrix().translate(fx, fy).rotate(th / D)); });
  P.moveTo(-108, 40); P.bezierCurveTo(-116, 120, -104, 196, -78, 262); P.bezierCurveTo(-64, 312, -62, 380, -64, 700); P.lineTo(74, 700); P.bezierCurveTo(72, 400, 74, 326, 88, 272); P.bezierCurveTo(114, 196, 118, 108, 104, 24); P.bezierCurveTo(50, 2, -50, 2, -108, 40); P.closePath();
  const T = new Path2D(); T.moveTo(-22, 34); T.bezierCurveTo(-26, -44, -22, -112, -15, -150); T.quadraticCurveTo(0, -168, 15, -150); T.bezierCurveTo(22, -104, 26, -40, 26, 34); T.closePath(); P.addPath(T, new DOMMatrix().translate(-96, 236).rotate(-.82 / D));
  c.fillStyle = '#120a06'; c.fill(P);
  if (!HM) { HM = mk(W, H); HE = mk(W, H); } const m = c.getTransform(), hx = HM.getContext('2d'), ex = HE.getContext('2d');
  for (const z of [hx, ex]) { z.setTransform(1, 0, 0, 1, 0, 0); z.globalCompositeOperation = 'source-over'; z.clearRect(0, 0, W, H); }
  hx.setTransform(m); hx.fillStyle = '#fff'; hx.fill(P); hx.setTransform(1, 0, 0, 1, 0, 0);
  const d = Math.max(2, 6 * s); ex.drawImage(HM, 0, 0); ex.globalCompositeOperation = 'destination-in'; for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) ex.drawImage(HM, dx, dy);
  hx.globalCompositeOperation = 'destination-out'; hx.drawImage(HE, 0, 0); hx.globalCompositeOperation = 'source-in'; hx.fillStyle = 'rgba(255,206,120,.85)'; hx.fillRect(0, 0, W, H);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = A0; c.filter = 'blur(1.2px)'; c.drawImage(HM, 0, 0); c.restore();   // a rim of gold
  [[420, '#e8b860', 14], [440, '#b8201a', 16], [460, '#e8b860', 10], [478, '#b8201a', 16]].forEach(([yy, col, h]) => { c.strokeStyle = col; c.lineWidth = h; c.beginPath(); c.ellipse(5, yy, 84, 14, 0, .05, Math.PI - .05); c.stroke(); });
  c.restore();
}
// a handful of rice: grains lifting off a cupped palm and falling away, catching the light (p: 0 full … 1 empty)
export function riceFall(c, t, x, y, p, o = {}) {
  const { s = 1, a = 1, wind = 0 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s);
  for (let k = 0; k < 160; k++) { const d = hh(k * 1.7), st = d * .55, u = clamp((p - st) / .45); const px = (hh(k * 2.3) - .5) * 120, py0 = -10 - hh(k * 3.1) * 40;
    const fx = px + u * u * wind * (300 + 400 * hh(k)) + u * (hh(k * 5) - .5) * 160, fy = py0 + u * u * 1100;
    if (u >= 1) continue; c.save(); c.translate(fx, fy); c.rotate(hh(k) * 6 + u * 8); c.fillStyle = `rgba(250,246,234,${1 - u * .6})`; c.beginPath(); c.ellipse(0, 0, 5.2, 2.2, 0, 0, 7); c.fill(); c.restore(); }
  c.restore();
}

// twelve brass lamps in a row, burning; out(k) puts them out one after another, each leaving a thread of smoke — twelve years
export function twelveLamps(c, t, out, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha *= a;
  for (let k = 0; k < 12; k++) { const row = k % 2, x = 120 + k * 76, y = row ? 1080 : 1010, q = clamp(out * 12 - k), s = row ? .62 : .56;
    if (q < 1) { c.save(); c.globalAlpha *= 1 - q; lamp(c, t, x, y, s, 1, k * 1.3); c.restore(); }
    if (q >= 1 || q > 0) { c.save(); c.globalAlpha *= Math.min(1, q * 2); c.translate(x, y); c.scale(s, s); let g = c.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, '#2a1a08'); g.addColorStop(.4, '#6a5028'); g.addColorStop(1, '#2a1a08'); c.fillStyle = g;
      c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(0, -20, 40, 0); c.lineTo(40, 8); c.lineTo(-40, 8); c.fill(); c.fillRect(-6, -150, 12, 150); c.beginPath(); c.ellipse(0, -150, 34, 9, 0, 0, 7); c.fill();
      const sm = clamp(q * 1.2) * (1 - seg(q, .9, 1) * 0); c.strokeStyle = `rgba(200,190,180,${.35 * Math.min(1, q * 3)})`; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -156); for (let j = 1; j < 10; j++) c.lineTo(Math.sin(t * 2 + j * .7 + k) * 10 * j / 3, -156 - j * 26 * (.4 + .6 * sm)); c.stroke(); c.restore(); } }
  c.restore();
}
