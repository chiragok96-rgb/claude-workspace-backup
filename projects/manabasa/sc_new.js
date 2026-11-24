// v3 scenes, in the Boita Bandana manner: lamplight, warm darkness, people in profile and in colour, rim-lit.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
import { flame } from './sc_light.js';
import { dark, glow, lamp, templeDoor, idol } from './sc_temple.js';
import { motherStanding, motherKneeling, setLook } from './sc_people.js';
import { foot } from './sc_jhoti.js';
// —— an earthen pot (kudua / handi) seen from the side, lamp-lit ——
export function kudua(c, x, y, r, warm = 1) {
  const g = c.createRadialGradient(x - r * .4, y - r * .5, r * .1, x, y, r * 1.1); g.addColorStop(0, `rgb(${Math.round(196 * warm)},${Math.round(110 * warm)},${Math.round(62 * warm)})`); g.addColorStop(.6, '#6a2c14'); g.addColorStop(1, '#2a0e06');
  c.fillStyle = g; c.beginPath(); c.ellipse(x, y, r, r * .86, 0, 0, 7); c.fill();
  c.fillStyle = '#3a160a'; c.beginPath(); c.ellipse(x, y - r * .82, r * .5, r * .14, 0, 0, 7); c.fill(); c.strokeStyle = `rgba(255,200,140,${.35 * warm})`; c.lineWidth = Math.max(1, r * .05); c.beginPath(); c.ellipse(x, y - r * .82, r * .5, r * .14, 0, Math.PI, 0); c.stroke();
  c.strokeStyle = `rgba(255,190,130,${.22 * warm})`; c.lineWidth = Math.max(1, r * .06); c.beginPath(); c.ellipse(x, y, r * .98, r * .84, 0, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
}
function steam(c, t, x, y, h, a = 1, seed = 0) { c.save(); c.globalCompositeOperation = 'screen'; for (let k = 0; k < 4; k++) { const u = (t * .3 + k / 4 + hh(seed)) % 1, px = x + Math.sin(t * 1.3 + k + seed) * 14 * (1 + u * 2), py = y - u * h, al = Math.sin(Math.PI * u) * .16 * a; const g = c.createRadialGradient(px, py, 0, px, py, 20 + 40 * u); g.addColorStop(0, `rgba(255,244,228,${al})`); g.addColorStop(1, 'rgba(255,244,228,0)'); c.fillStyle = g; c.fillRect(px - 70, py - 70, 140, 140); } c.restore(); }
// —— the aarti: a brass lamp of five flames, circling ——
export function aarti(c, t, x, y, s = 1, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s);
  const g = c.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#5a3a10'); g.addColorStop(.45, '#f4d488'); g.addColorStop(1, '#6a4410'); c.fillStyle = g;
  c.beginPath(); c.ellipse(0, 0, 90, 22, 0, 0, 7); c.fill(); c.fillRect(-8, 0, 16, 180); c.beginPath(); c.ellipse(0, 180, 30, 10, 0, 0, 7); c.fill();
  c.restore();
  for (let k = 0; k < 5; k++) { const an = k / 5 * 6.283 + .3, fx = x + Math.cos(an) * 60 * s, fy = y + Math.sin(an) * 14 * s - 6 * s; flame(c, t, fx, fy, 34 * s, k * 2.3, a); }
}
// —— 0–3.2: Jagannath in the sanctum: we begin inside the pupil of his eye, the aarti's flames turning in it; we pull back to his face, the lamps, and
// the tiers of earthen pots of the fifty-six bhogas, steaming ——
export function sanctum(c, t, o = {}) {
  const { zoom = 1, fx = 607, fy = 761, aartiA = 1, potsA = 1 } = o;
  c.save(); c.translate(fx, fy); c.scale(zoom, zoom); c.translate(-fx, -fy);
  dark(c, t, { cx: 540, cy: 900, warm: 1.2 });
  // the tiers of pots, either side and below him
  if (potsA > 0) { c.save(); c.globalAlpha *= potsA;
    for (const sd of [-1, 1]) for (let row = 0; row < 5; row++) for (let k = 0; k < 5 - row; k++) { const x = 540 + sd * (300 + k * 92 + row * 46), y = 1360 - row * 78; if (x < -60 || x > 1140) continue; kudua(c, x, y, 40, .9 - row * .06); if ((k + row) % 2) steam(c, t, x, y - 40, 160, .9, k + row * 5 + sd); }
    for (let k = 0; k < 7; k++) { kudua(c, 300 + k * 80, 1430, 44, .85); steam(c, t, 300 + k * 80, 1390, 140, .8, k * 3); }
    c.restore(); }
  idol(c, t, 540, 900, 1.38, 'J', { lit: 1, look: 0 });
  glow(c, 540, 1300, 800, .5);
  c.restore();
  // the aarti in front of him, its flames circling (and caught in his eye)
  const an = t * 2.2, ax = 540 + Math.cos(an) * 260, ay = 1080 + Math.sin(an) * 70;
  if (aartiA > 0) { const s = lerp(1.2, .85, Math.sin(an) * .5 + .5); aarti(c, t, fx + (ax - fx) * zoom, fy + (ay - fy) * zoom, s * Math.min(zoom, 2.2), aartiA); }
  if (zoom > 99) { const k = clamp((zoom - 1.5) / 4); c.save(); c.globalCompositeOperation = 'lighter'; const rx = fx + Math.cos(an) * 14 * zoom * .4, ry = fy - 6 * zoom * .3; const g = c.createRadialGradient(rx, ry, 0, rx, ry, 120 * zoom * .3); g.addColorStop(0, `rgba(255,236,190,${.9 * k})`); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }   // the aarti reflected in his pupil
}
// —— 16–21.4: Lakshmi at the temple door at night; Balabhadra's face above it; the doors slam. 21.4–24.6: her curse — she lifts her hand,
// her shadow rises huge on the temple wall, and the lamps along the wall go out one by one ——
export function templeNight(c, t, o = {}) {
  const { shut = 0, bala = 1, stern = 0, raise = 0, shadow = 0, out = 0, lakshmiA = 1, fire = 0 } = o;
  dark(c, t, { cx: 540, cy: 1000, warm: lerp(1, .5, out) });
  // the stone wall, its carved courses
  c.fillStyle = `rgba(255,190,120,${.05 * (1 - out * .7)})`; for (let k = 0; k < 18; k++) c.fillRect(0, 240 + k * 64, W, 3);
  // twelve lamps along the wall, on a ledge
  for (let k = 0; k < 12; k++) { const x = 70 + k * 85, y = 1325, q = clamp(out * 12 - k); c.fillStyle = '#3a2010'; c.beginPath(); c.ellipse(x, y + 6, 22, 8, 0, 0, 7); c.fill(); if (q < 1) flame(c, t, x + 4, y - 2, 26, k, (1 - q)); else { c.strokeStyle = 'rgba(170,160,150,.3)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 4, y - 4); for (let j = 1; j < 8; j++) c.lineTo(x + 4 + Math.sin(t * 2 + j + k) * 6 * j / 3, y - 4 - j * 22); c.stroke(); } }
  c.fillStyle = '#1a0e08'; c.fillRect(0, 1330, W, 40);
  if (shadow > 0) {   // her shadow, huge on the wall, from the lamps at her feet
    c.save(); c.globalAlpha *= shadow * .55; c.filter = 'blur(10px)'; c.translate(560, 1330); c.scale(2.6, 2.4); c.translate(-560, -1330);
    setLook({ saree: '#000', sareeD: '#000', border: '#000', crown: true, skin: '#000', skinD: '#000' }); motherStanding(c, 560, 1330, .9, { raise, rim: 0, shade: 0, t }); c.restore(); }
  templeDoor(c, t, { shut, x: 780, y: 1330, s: .62 });
  if (bala > 0) idol(c, t, 780, 600, .62, 'B', { a: bala, stern });
  if (lakshmiA > 0) { setLook({ saree: '#b01e16', sareeD: '#7c1410', border: '#e8b850', crown: true }); motherStanding(c, 300, 1330, 1.42, { t, raise, a: lakshmiA, rimCol: '255,214,140', rimW: 6, glow: .6, glowCol: '255,190,100', shade: .45 });
    if (fire > 0) glow(c, 330 + 80 * raise, 1330 - 700 * raise, 420 * fire, fire, '255,170,80'); }
  for (let k = 0; k < 4; k++) foot(c, 420 + k * 70, 1310 - (k % 2) * 14, 0, .55, k % 2 === 0, 1, '255,214,130', .5);   // her golden steps, halted at the door
}
// —— 32.6–37.6: inside the one lit house — Lakshmi, in a plain sari, at a clay hearth; a pot of rice steaming; its steam turns to gold, and her steps rise from it ——
export function hearth(c, t, o = {}) {
  const { gold = 0 } = o;
  const g = c.createRadialGradient(640, 1150, 60, 640, 1150, 1100); g.addColorStop(0, '#5a2e16'); g.addColorStop(1, '#0a0503'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 1600; i++) { c.fillStyle = `rgba(${hh(i) > .5 ? '120,70,40' : '0,0,0'},.06)`; c.fillRect(hh(i * 1.7) * W, hh(i * 2.9) * 1300, 3, 3); }   // the mud wall
  c.fillStyle = '#2a160c'; c.fillRect(0, 1300, W, 70);
  // the chula: a mud hearth with fire in its mouth
  c.fillStyle = '#4a2a16'; c.beginPath(); c.moveTo(560, 1300); c.quadraticCurveTo(570, 1170, 680, 1160); c.lineTo(800, 1160); c.quadraticCurveTo(910, 1170, 920, 1300); c.closePath(); c.fill();
  c.fillStyle = '#0a0503'; c.beginPath(); c.ellipse(740, 1270, 70, 46, 0, Math.PI, 0); c.fill();
  for (let k = 0; k < 4; k++) flame(c, t, 700 + k * 26, 1290, 40 + 10 * Math.sin(k), k + 3, .8);
  glow(c, 740, 1250, 500, .9, '255,150,60');
  kudua(c, 740, 1110, 82, 1.1); steam(c, t, 740, 1030, 520, 1.6, 1);
  if (gold > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const gg = c.createRadialGradient(740, 880, 10, 740, 880, 420); gg.addColorStop(0, `rgba(255,200,100,${.45 * gold})`); gg.addColorStop(1, 'rgba(255,170,60,0)'); c.fillStyle = gg; c.fillRect(0, 0, W, H); c.restore();
    for (let k = 0; k < 5; k++) foot(c, 740 + (k % 2 ? 26 : -26), 960 - k * 120, -Math.PI / 2, 1.0, k % 2 === 0, clamp(gold * 1.6 - k * .14), '255,214,130', .55); }
  setLook({ saree: '#a8742a', sareeD: '#7a5018', border: '#7a1a10' }); motherKneeling(c, 330, 1300, 1.25, { hands: [[260, -170], [290, -150]], lean: .5, glow: 1, glowAt: [300, -200], rimCol: '255,200,130', rimW: 5, shade: .5 });
}
// —— 43.3–49: Ananda Bazar today: a long row of devotees seated on the ground in profile, backlit by lamps, each different —— a priest with
// his tuft, a farmer in a gamuchha, a woman with her pallu, a child, an old man in a cap, a young man — eating from leaves, together ——
const SEAT = ['priest', 'woman', 'farmer', 'child', 'old', 'young', 'woman2', 'priest2'];
export function devotees(c, t, o = {}) {
  const { pan = 0, a = 1 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a;
  let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a0e0a'); g.addColorStop(.55, '#6a3018'); g.addColorStop(.7, '#c8743a'); g.addColorStop(1, '#2a140a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  // the temple's wall and the shikhara far behind
  c.fillStyle = '#2a1410'; c.beginPath(); c.moveTo(400 - pan * .2, 1000); for (let i = 0; i <= 24; i++) { const u = i / 24; c.lineTo(560 - pan * .2 - 170 * (1 - .62 * u ** 2.2), 1000 - 520 * u); } for (let i = 24; i >= 0; i--) { const u = i / 24; c.lineTo(560 - pan * .2 + 170 * (1 - .62 * u ** 2.2), 1000 - 520 * u); } c.fill();
  c.fillStyle = '#2a1410'; c.beginPath(); c.arc(560 - pan * .2, 450, 26, 0, 7); c.fill(); c.strokeStyle = '#2a1410'; c.lineWidth = 6; c.beginPath(); c.arc(560 - pan * .2, 390, 26, 0, 7); c.stroke(); c.beginPath(); c.moveTo(560 - pan * .2, 364); c.lineTo(560 - pan * .2, 290); c.stroke(); c.fillStyle = '#a82418'; c.beginPath(); c.moveTo(560 - pan * .2, 290); c.quadraticCurveTo(620 - pan * .2, 286 + 6 * Math.sin(t * 2), 680 - pan * .2, 306); c.lineTo(560 - pan * .2, 326); c.fill();
  c.fillStyle = '#1e0e0a'; c.fillRect(0, 980, W, 70);
  for (let k = 0; k < 6; k++) glow(c, 120 + k * 190 - pan * .5, 1070, 260, .55);
  // the row, in silhouette with warm rims; leaves and kudua in front
  for (let i = 0; i < SEAT.length; i++) { const x = 110 + i * 170 - pan, y = 1300; if (x < -150 || x > W + 150) continue; seated(c, t, x, y, SEAT[i], i); }
  c.fillStyle = '#1a0c08'; c.fillRect(0, 1300, W, 80);
  c.restore();
}
function seated(c, t, x, y, kind, i) {
  c.save(); c.translate(x, y); const s = kind === 'child' ? .72 : 1; c.scale(s, s);
  const P = new Path2D(), bob = Math.sin(t * 1.6 + i * 1.7) * 3;   // seated cross-legged, facing right, a hand to the leaf
  P.moveTo(-70, 0); P.bezierCurveTo(-80, -60, -60, -140, -30, -190); P.bezierCurveTo(-10, -220, 30, -228, 50, -214); P.bezierCurveTo(70, -190, 66, -150, 60, -120);
  P.bezierCurveTo(90, -100, 120, -70, 130, -40 + bob); P.lineTo(118, -30 + bob); P.bezierCurveTo(100, -60, 80, -80, 56, -90); P.bezierCurveTo(70, -50, 90, -20, 100, 0); P.closePath();
  const hx = 20, hy = -262; P.moveTo(hx + 34, hy); P.arc(hx, hy, 34, 0, 7);   // the head
  if (kind.startsWith('priest')) { P.moveTo(hx - 20, hy - 30); P.quadraticCurveTo(hx - 40, hy - 56, hx - 30, hy - 66); P.quadraticCurveTo(hx - 22, hy - 50, hx - 12, hy - 34); }   // the tuft
  if (kind.startsWith('woman')) { P.moveTo(hx + 30, hy - 20); P.quadraticCurveTo(hx + 10, hy - 50, hx - 30, hy - 30); P.quadraticCurveTo(hx - 60, hy + 20, hx - 60, hy + 80); P.lineTo(hx - 30, hy + 80); P.closePath(); }   // the pallu
  if (kind === 'farmer') { P.moveTo(hx - 40, hy - 10); P.quadraticCurveTo(hx, hy - 52, hx + 40, hy - 12); P.lineTo(hx + 30, hy - 4); P.quadraticCurveTo(hx, hy - 34, hx - 32, hy); P.closePath(); }   // a gamuchha tied round the head
  if (kind === 'old') { P.moveTo(hx - 34, hy - 8); P.quadraticCurveTo(hx, hy - 48, hx + 34, hy - 8); P.closePath(); }   // a cap
  c.fillStyle = '#120806'; c.fill(P);
  c.save(); c.clip(P); c.strokeStyle = 'rgba(255,190,110,.75)'; c.lineWidth = 8; c.translate(-4, 2); c.stroke(P); c.restore();   // the lamps behind them, on their edges
  if (kind === 'farmer') { c.strokeStyle = '#a82418'; c.lineWidth = 5; c.beginPath(); c.moveTo(-40, -200); c.quadraticCurveTo(0, -150, 50, -110); c.stroke(); }
  c.fillStyle = '#2e5a1c'; c.beginPath(); c.ellipse(170, 0, 70, 14, 0, 0, 7); c.fill(); c.fillStyle = '#f4efe2'; c.beginPath(); c.ellipse(160, -6, 26, 8, 0, 0, 7); c.fill();   // the leaf and its rice
  c.restore();
}
// —— 13.4–16.1: Shriya at her doorstep at dawn, in a plain white sari with a red border, kneeling to draw jhoti on the step she has just swept;
// her broom against the wall, a small lamp lit; then a golden light comes, and gold footprints step onto the ones she drew ——
export function shriyaDoor(c, t, o = {}) {
  const { draw = 1, gold = 0, a = 1 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a;
  let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1a16'); g.addColorStop(.6, '#7a4a30'); g.addColorStop(1, '#3a2016'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  // her mud wall, the thatch above, the low doorway
  c.fillStyle = '#8a5a3a'; c.fillRect(0, 380, W, 900); for (let i = 0; i < 2400; i++) { c.fillStyle = `rgba(${hh(i) > .5 ? '160,110,70' : '60,30,16'},.10)`; c.fillRect(hh(i * 1.7) * W, 380 + hh(i * 2.9) * 900, 3, 3); }
  c.fillStyle = '#3a2410'; c.beginPath(); c.moveTo(0, 300); c.lineTo(W, 260); c.lineTo(W, 420); c.lineTo(0, 440); c.fill(); c.strokeStyle = 'rgba(200,160,90,.25)'; c.lineWidth = 3; for (let x = 0; x < W; x += 18) { c.beginPath(); c.moveTo(x, 300 - x * .037); c.lineTo(x + 6, 430 - x * .02); c.stroke(); }
  c.fillStyle = '#140a06'; c.beginPath(); c.moveTo(640, 1240); c.lineTo(640, 760); c.quadraticCurveTo(760, 700, 880, 760); c.lineTo(880, 1240); c.fill();
  c.strokeStyle = '#c8a87a'; c.lineWidth = 8; c.beginPath(); c.moveTo(626, 1240); c.lineTo(626, 752); c.quadraticCurveTo(760, 684, 894, 752); c.lineTo(894, 1240); c.stroke();
  // the broom against the wall
  c.strokeStyle = '#c8a060'; c.lineWidth = 6; c.beginPath(); c.moveTo(960, 880); c.lineTo(1000, 1230); c.stroke(); for (let k = -6; k <= 6; k++) { c.lineWidth = 2.5; c.beginPath(); c.moveTo(1000, 1150); c.lineTo(1000 + k * 5, 1240); c.stroke(); }
  // the step, swept, smoothed; her jhoti on it
  c.fillStyle = '#5a3a26'; c.fillRect(0, 1240, W, 130); c.fillStyle = 'rgba(255,220,180,.15)'; c.fillRect(0, 1240, W, 4);
  c.strokeStyle = 'rgba(250,246,236,.95)'; c.lineWidth = 5; c.lineCap = 'round';
  for (let k = 0; k < 8; k++) { const u = clamp(draw * 8 - k); if (u <= 0) break; const x = 520 + k * 60; c.beginPath(); c.ellipse(x, 1300, 22 * u, 10, 0, 0, 7); c.stroke(); c.beginPath(); c.arc(x + 30, 1300, 3, 0, 7); c.stroke(); }
  for (let k = 0; k < 3; k++) if (draw > .4 + k * .15) foot(c, 760 + k * 4, 1262 - k * 0, -Math.PI / 2, .55, k % 2 === 0, 1, '250,246,236', .2);
  flame(c, t, 590, 1230, 30, 2, 1); c.fillStyle = '#6a2e12'; c.beginPath(); c.ellipse(586, 1236, 26, 9, 0, 0, 7); c.fill();   // her lamp
  // the golden light arriving from the left, and gold steps onto hers
  if (gold > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const gg = c.createRadialGradient(lerp(-200, 480, gold), 1000, 20, lerp(-200, 480, gold), 1000, 700); gg.addColorStop(0, `rgba(255,206,120,${.6 * gold})`); gg.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = gg; c.fillRect(0, 0, W, H); c.restore();
    for (let k = 0; k < 4; k++) foot(c, 120 + k * 150, 1300 - (k % 2) * 18, 0, .6, k % 2 === 0, clamp(gold * 4 - k), '255,214,130', .6); }
  setLook({ saree: '#e8dcc6', sareeD: '#c0b29a', border: '#a8241a' }); motherKneeling(c, 380, 1250, 1.2, { hands: [[220, -10], [250, -6]], lean: 1, glow: .6, glowAt: [220, -60], rimCol: '255,220,170', shade: .45 });
  c.restore();
}
