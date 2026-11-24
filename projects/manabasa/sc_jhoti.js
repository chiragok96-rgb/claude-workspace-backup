// Jhoti: the white rice-paste drawings Odia women make on the floor for Lakshmi on Manabasa Gurubara — seen from straight above.
// One continuous floor: the red-oxide floor of the puja room with its lotus mandala and the Mana (the paddy measure) at its heart;
// Lakshmi's golden footprints walking out over a mud lane; Shriya's doorstep, which every other foot avoids; her broom; her hand
// drawing footprints that invite the goddess in. World units: the mandala's centre is (0, 0); the lane runs toward −y.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
export const THRESH = -2700;   // Shriya's doorstep (world y)
let RED, MUD, CLEAN;
function texture(w, h, base, specks, seedK, swirl = false) {
  const c = mk(w, h), x = c.getContext('2d'); x.fillStyle = base; x.fillRect(0, 0, w, h);
  const b = mk(w, h), bx = b.getContext('2d'); for (let i = 0; i < 90; i++) { bx.fillStyle = `rgba(${hh(i * seedK) > .5 ? '255,220,190' : '40,10,0'},${.05 + .05 * hh(i * 3 + seedK)})`; for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { bx.beginPath(); bx.ellipse(hh(i * 1.3 + seedK) * w + ox, hh(i * 2.1 + seedK) * h + oy, 60 + 140 * hh(i * 5), 40 + 100 * hh(i * 7), 0, 0, 7); bx.fill(); } }
  x.filter = 'blur(20px)'; for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) x.drawImage(b, ox, oy); x.filter = 'none';   // blurred once, wrapped, so the tiles meet without a seam
  for (let i = 0; i < specks; i++) { x.fillStyle = `rgba(${hh(i + seedK) > .5 ? '255,230,200' : '30,10,0'},${.05 + .07 * hh(i * 3)})`; x.fillRect(hh(i * 1.7 + seedK) * w, hh(i * 2.3 + seedK) * h, 1 + hh(i * 5) * 2.5, 1 + hh(i * 7) * 2.5); }
  if (swirl) { x.strokeStyle = 'rgba(30,20,8,.10)'; x.lineWidth = 6; for (let i = 0; i < 40; i++) { const cx = 80 + hh(i * 3.1) * (w - 160), cy = 80 + hh(i * 4.7) * (h - 160); x.beginPath(); x.arc(cx, cy, 40 + 30 * hh(i), hh(i) * 6, hh(i) * 6 + 2.4); x.stroke(); } }   // the sweep of a hand smoothing cow-dung plaster
  return c;
}
export function initJhoti() { RED = texture(1024, 1024, '#8a3220', 14000, 1.1); MUD = texture(1024, 1024, '#8a7058', 18000, 2.3); CLEAN = texture(1024, 1024, '#6a5a3c', 9000, 3.7, true); }
function tile(c, img, x0, y0, x1, y1) { c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip(); for (let y = Math.floor(y0 / 1024) * 1024; y < y1; y += 1024) for (let x = Math.floor(x0 / 1024) * 1024; x < x1; x += 1024) c.drawImage(img, x, y); c.restore(); }
// a stroke of rice paste along pts, drawn to fraction p: a soft white line, a little uneven, a heavier blob where the finger began
export function paste(c, pts, p = 1, w = 7, col = '250,246,236', a = 1) {
  if (p <= 0 || pts.length < 2 || a <= 0) return; const n = Math.max(2, Math.ceil(pts.length * clamp(p))); c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = `rgba(${col},${.35 * a})`; c.lineWidth = w * 1.6; c.beginPath(); pts.slice(0, n).forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
  c.strokeStyle = `rgba(${col},${.92 * a})`; c.lineWidth = w; c.stroke();
  c.fillStyle = `rgba(${col},${.95 * a})`; c.beginPath(); c.arc(pts[0][0], pts[0][1], w * .85, 0, 7); c.fill(); c.restore();
}
const circ = (cx, cy, r, a0 = 0, a1 = Math.PI * 2, n = 64) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
const petal = (cx, cy, a, r0, r1, wd, n = 24) => { const pts = []; for (let i = 0; i <= n; i++) { const u = i / n, side = u < .5 ? 1 : -1, v = u < .5 ? u * 2 : 2 - u * 2, rr = lerp(r0, r1, v), ww = Math.sin(v * Math.PI) * wd * side; pts.push([cx + Math.cos(a) * rr - Math.sin(a) * ww, cy + Math.sin(a) * rr + Math.cos(a) * ww]); } return pts; };
// Lakshmi's footprint (left or right), heel at (x, y), walking toward angle `a`; toes as dots — the classic jhoti pada
export function foot(c, x, y, a, s, left, p = 1, col = '250,246,236', fill = .0) {
  if (p <= 0) return; c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2); c.scale(s * (left ? -1 : 1), s); c.globalAlpha *= clamp(p * 1.5);
  const P = new Path2D(); P.moveTo(0, 0); P.bezierCurveTo(-17, 0, -19, -22, -15, -40); P.bezierCurveTo(-12, -55, -21, -66, -12, -78); P.bezierCurveTo(-2, -88, 16, -84, 18, -68); P.bezierCurveTo(20, -48, 17, -22, 14, -8); P.bezierCurveTo(12, -1, 6, 0, 0, 0); P.closePath();
  if (fill > 0) { c.fillStyle = `rgba(${col},${fill})`; c.fill(P); }
  c.strokeStyle = `rgba(${col},.95)`; c.lineWidth = 4.5; c.stroke(P);
  c.fillStyle = `rgba(${col},.95)`; [[-11, -98, 7], [1, -103, 5.6], [11, -100, 5], [19, -93, 4.2], [-20, -89, 4.4]].forEach(([tx, ty, r], i) => { if (p > .5 + i * .08) { c.beginPath(); c.arc(tx, ty, r, 0, 7); c.fill(); } });
  c.fillStyle = `rgba(${col},.9)`; c.beginPath(); c.arc(0, -40, 3.5, 0, 7); c.fill();   // the lotus dot at the sole's heart
  c.restore();
}
// a walk of footprints from A to B (world), n steps, revealed up to fraction p
export function walk(c, A, B, n, p, s = 1, col = '250,246,236', fill = 0, wob = 0) {
  const a = Math.atan2(B[1] - A[1], B[0] - A[0]), nx = -Math.sin(a), ny = Math.cos(a);
  for (let i = 0; i < n; i++) { const u = i / (n - 1), q = clamp(p * n - i), left = i % 2 === 0, off = (left ? -1 : 1) * 22 * s; if (q <= 0) break;
    const bend = wob ? Math.sin(u * Math.PI) * wob : 0;
    foot(c, lerp(A[0], B[0], u) + nx * (off + bend), lerp(A[1], B[1], u) + ny * (off + bend), a, s, left, q, col, fill); }
}
// the Mana: a woven paddy-measure seen from above, heaped with golden paddy, a red cloth, flowers, a little brass lamp
export function mana(c, t, x, y, r, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y);
  c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.arc(8, 10, r * 1.05, 0, 7); c.fill();
  let g = c.createRadialGradient(-r * .3, -r * .3, r * .2, 0, 0, r); g.addColorStop(0, '#b8864a'); g.addColorStop(1, '#6a4420'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  c.strokeStyle = 'rgba(60,36,14,.6)'; c.lineWidth = 2; for (let k = 0; k < 48; k++) { const an = k / 48 * 6.283; c.beginPath(); c.moveTo(Math.cos(an) * r * .86, Math.sin(an) * r * .86); c.lineTo(Math.cos(an) * r, Math.sin(an) * r); c.stroke(); }   // the weave of the rim
  c.save(); c.beginPath(); c.arc(0, 0, r * .84, 0, 7); c.clip(); g = c.createRadialGradient(-r * .2, -r * .25, 2, 0, 0, r * .84); g.addColorStop(0, '#f0c860'); g.addColorStop(1, '#a87a22'); c.fillStyle = g; c.fillRect(-r, -r, 2 * r, 2 * r);
  for (let k = 0; k < 700; k++) { const rr = Math.sqrt(hh(k * 1.3)) * r * .84, an = hh(k * 2.7) * 6.283; c.save(); c.translate(Math.cos(an) * rr, Math.sin(an) * rr); c.rotate(hh(k) * 6.3); c.fillStyle = hh(k * 5) > .5 ? 'rgba(250,214,110,.9)' : 'rgba(170,120,40,.8)'; c.beginPath(); c.ellipse(0, 0, 4.2, 1.8, 0, 0, 7); c.fill(); c.restore(); }   // paddy grains
  c.restore();
  c.fillStyle = '#b01e16'; c.beginPath(); c.moveTo(-r * .5, -r * .1); c.quadraticCurveTo(0, -r * .35, r * .5, -r * .1); c.quadraticCurveTo(0, r * .05, -r * .5, -r * .1); c.fill();   // a red cloth
  for (let k = 0; k < 7; k++) { const an = k / 7 * 6.283 + .3, fx = Math.cos(an) * r * .55, fy = Math.sin(an) * r * .55; for (let j = 0; j < 8; j++) { const b = j / 8 * 6.283; c.fillStyle = j % 2 ? '#f08a1c' : '#ffb22e'; c.beginPath(); c.ellipse(fx + Math.cos(b) * 6, fy + Math.sin(b) * 6, 6, 4, b, 0, 7); c.fill(); } }   // marigolds
  c.fillStyle = '#c4201a'; for (let k = 0; k < 16; k++) { const an = k / 16 * 6.283; c.beginPath(); c.arc(Math.cos(an) * r * 1.14, Math.sin(an) * r * 1.14, 4, 0, 7); c.fill(); }   // vermilion dots around it
  c.restore();
}
export function diyaTop(c, t, x, y, s = 1, a = 1) {   // a clay lamp from above: its bowl, the flame's bright point and its light
  if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s);
  let g = c.createRadialGradient(-5, -5, 2, 0, 0, 22); g.addColorStop(0, '#c87a46'); g.addColorStop(1, '#6a2e12'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 24, 20, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(18, -8); c.lineTo(34, 0); c.lineTo(18, 8); c.fill();
  c.fillStyle = '#3a1a08'; c.beginPath(); c.ellipse(0, 0, 17, 13, 0, 0, 7); c.fill();
  c.globalCompositeOperation = 'lighter'; const fl = .9 + .1 * Math.sin(t * 13 + x);
  g = c.createRadialGradient(30, 0, 0, 30, 0, 160); g.addColorStop(0, `rgba(255,200,120,${.5 * fl})`); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(-130, -160, 320, 320);
  g = c.createRadialGradient(30, 0, 0, 30, 0, 12); g.addColorStop(0, `rgba(255,252,236,${fl})`); g.addColorStop(1, 'rgba(255,200,110,0)'); c.fillStyle = g; c.fillRect(18, -12, 24, 24);
  c.restore();
}
// a woman's hand seen from above, reaching in from the bottom-right, the index finger down (drawing), bangles at the wrist
export function handTop(c, x, y, ang, s = 1, o = {}) {
  const { skin = '#a8694a', bangles = ['#b8201a', '#1e6a3a', '#d8a838', '#b8201a'], a = 1 } = o; if (a <= 0) return;
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.rotate(ang); c.scale(s, s);   // the fingertip is at (0, 0); the arm runs toward +x
  c.fillStyle = 'rgba(0,0,0,.28)'; c.save(); c.translate(14, 16); handShape(c); c.fill(); c.restore();
  const g = c.createLinearGradient(0, -40, 0, 40); g.addColorStop(0, '#c08060'); g.addColorStop(1, '#7a4630'); c.fillStyle = g; handShape(c); c.fill();
  c.strokeStyle = 'rgba(60,24,14,.35)'; c.lineWidth = 1.4; for (const k of [-1, 1, 2]) { c.beginPath(); c.moveTo(70, k * 13); c.quadraticCurveTo(100, k * 15, 120, k * 14); c.stroke(); }   // the folded fingers
  bangles.forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.roundRect(190 + i * 11, -34, 8, 68, 4); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(191 + i * 11, -30, 2, 60); });
  c.fillStyle = '#f6efe0'; c.beginPath(); c.arc(4, 0, 8, 0, 7); c.fill();   // rice paste on the fingertip
  c.restore();
}
function handShape(c) {
  c.beginPath(); c.moveTo(0, -7); c.quadraticCurveTo(-2, 0, 0, 7); c.lineTo(66, 10); c.quadraticCurveTo(80, 30, 110, 34); c.lineTo(140, 36); c.quadraticCurveTo(170, 40, 190, 34); c.lineTo(420, 44); c.lineTo(420, -44); c.lineTo(190, -34);
  c.quadraticCurveTo(160, -44, 130, -40); c.quadraticCurveTo(96, -38, 74, -12); c.lineTo(66, -10); c.closePath();
}
// the floor world, drawn through a camera: o = {cam: [x, y], z, rot, mandala (0..1), title, lakshmi (0..1 along her walk), others,
// sweep (0..1), draw (0..1 Shriya's jhoti), gold (0..1 Lakshmi's steps into Shriya's footprints), back (0..1 walking back out)}
export function floor(c, t, o = {}) {
  const { cam = [0, 0], z = 1, rot = 0, mandala = 1, lakshmi = 0, others = 0, sweep = 0, draw = 0, gold = 0, back = 0, manaA = 1, ripple = 0 } = o;
  c.save(); c.translate(540, 960); c.scale(z, z); c.rotate(rot); c.translate(-cam[0], -cam[1]);
  const v0 = [cam[0] - 1400 / z, cam[1] - 1700 / z], v1 = [cam[0] + 1400 / z, cam[1] + 1700 / z];
  tile(c, RED, v0[0], Math.max(v0[1], -1000), v1[0], v1[1]);
  tile(c, MUD, v0[0], v0[1], v1[0], Math.min(v1[1], -900));
  if (v0[1] < -900 && v1[1] > -1000) { const g = c.createLinearGradient(0, -1000, 0, -900); g.addColorStop(0, 'rgba(138,50,32,0)'); g.addColorStop(1, 'rgba(138,50,32,1)'); c.save(); c.globalCompositeOperation = 'source-over'; c.fillStyle = g; c.fillRect(v0[0], -1000, v1[0] - v0[0], 100); c.restore(); }   // the puja room's red floor gives way to the mud of the lane
  // —— the puja room: the lotus mandala around the Mana ——
  if (mandala > 0) {
    const m = mandala;
    paste(c, circ(0, 0, 210), seg(m, 0, .25), 7); paste(c, circ(0, 0, 232, 0, 6.3, 120), seg(m, .05, .3), 3.2);
    for (let k = 0; k < 8; k++) paste(c, petal(0, 0, k * Math.PI / 4, 214, 330, 46), seg(m, .12 + k * .03, .4 + k * .03), 6.5);
    for (let k = 0; k < 16; k++) paste(c, petal(0, 0, (k + .5) * Math.PI / 8, 300, 400, 30), seg(m, .35 + k * .015, .62 + k * .015), 5.5);
    paste(c, circ(0, 0, 430, 0, 6.3, 160), seg(m, .55, .8), 6);
    for (let k = 0; k < 48; k++) { const an = k / 48 * 6.283; if (m > .7 + k * .004) { c.fillStyle = 'rgba(250,246,236,.95)'; c.beginPath(); c.arc(Math.cos(an) * 456, Math.sin(an) * 456, 6, 0, 7); c.fill(); } }
    for (let k = 0; k < 4; k++) { const an = k * Math.PI / 2 + Math.PI / 4; walk(c, [Math.cos(an) * 760, Math.sin(an) * 760], [Math.cos(an) * 500, Math.sin(an) * 500], 4, seg(m, .7, 1), 1.05); }   // footprints coming in from four sides
  }
  if (ripple > 0) { for (let k = 0; k < 3; k++) { const u = clamp(ripple * 1.4 - k * .2); if (u <= 0 || u >= 1) continue; c.strokeStyle = `rgba(250,246,236,${.8 * (1 - u)})`; c.lineWidth = 6 * (1 - u) + 1; c.beginPath(); c.arc(0, 0, 20 + 700 * eo(u), 0, 7); c.stroke(); } }   // the grain's ripple
  mana(c, t, 0, 0, 150, manaA);
  // —— the lane: others' footprints (grey, many) swerving wide of Shriya's door; Lakshmi's golden steps going straight to it ——
  if (others > 0) for (let r = 0; r < 3; r++) {   // three trails of ordinary feet come up the lane and bend wide around her doorstep
    const pts = []; for (let i = 0; i <= 15; i++) { const u = i / 15, side = r === 1 ? 1 : -1, y = lerp(-1300, THRESH + 250, Math.min(1, u * 1.35)), turn = seg(u, .55, 1);
      const x = side * (240 + r * 40) + side * 500 * Math.sin(turn * Math.PI / 2) * (u > .55 ? 1 : 0); pts.push([x, y + (u > .74 ? (u - .74) * 300 : 0)]); }
    for (let i = 0; i < pts.length - 1; i++) { const q = clamp(others * 16 - i - r * .6); if (q <= 0) break; const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; foot(c, x0, y0, Math.atan2(y1 - y0, x1 - x0), .85, i % 2 === 0, q, '52,38,28', .3); } }
  if (lakshmi > 0) walk(c, [0, -480], [0, THRESH + 120], 20, lakshmi, 1.35, '255,214,120', .5);
  // —— Shriya's house: her wall, her doorway, her swept floor, her jhoti ——
  if (v0[1] < THRESH + 200) {
    c.fillStyle = '#4a3624'; c.fillRect(v0[0], THRESH - 60, -150 - v0[0], 60); c.fillRect(150, THRESH - 60, v1[0] - 150, 60);   // her mud wall, seen from above
    c.fillStyle = 'rgba(255,230,200,.12)'; c.fillRect(v0[0], THRESH - 2, -150 - v0[0], 4); c.fillRect(150, THRESH - 2, v1[0] - 150, 4);
    c.fillStyle = '#5a4630'; c.fillRect(-150, THRESH - 40, 300, 40);   // the threshold stone
    if (sweep > 0) { c.save(); c.beginPath(); const sx = lerp(-700, 700, sweep); c.moveTo(-800, THRESH + 420); for (let k = 0; k <= 16; k++) { const xx = lerp(-800, sx, k / 16); c.lineTo(xx, THRESH + 380 + 40 * Math.sin(k * 1.7)); } c.quadraticCurveTo(sx + 120, THRESH - 300, sx, THRESH - 1500); c.lineTo(-800, THRESH - 1500); c.closePath(); c.clip(); tile(c, CLEAN, -800, THRESH - 1500, 800, THRESH + 400);
      c.fillStyle = '#4a3624'; c.fillRect(-800, THRESH - 60, 650, 60); c.fillRect(150, THRESH - 60, 650, 60); c.fillStyle = '#6a5438'; c.fillRect(-150, THRESH - 40, 300, 40); c.restore();
      if (sweep < 1) broom(c, t, sx + 60, THRESH + 60, sweep); }
    if (draw > 0) {   // her jhoti: a lotus on the threshold, a row of little footprints leading in, a lamp
      for (let k = 0; k < 6; k++) paste(c, petal(0, THRESH - 20, -Math.PI / 2 + (k - 2.5) * .42, 10, 110, 22), seg(draw, k * .05, .25 + k * .05), 5);
      walk(c, [0, THRESH + 360], [0, THRESH - 700], 9, seg(draw, .3, 1), 1.35);
      paste(c, [[-260, THRESH + 200], [-130, THRESH + 160], [0, THRESH + 150], [130, THRESH + 160], [260, THRESH + 200]], seg(draw, .2, .45), 5);
      diyaTop(c, t, -200, THRESH - 110, 1.2, ss(seg(draw, .6, .8)));
      if (draw < .99) { const u = clamp(draw), hy = lerp(THRESH + 360, THRESH - 700, seg(u, .3, 1)); handTop(c, u < .3 ? lerp(-200, 0, u / .3) : 18, u < .3 ? THRESH - 20 : hy + 60, -1.2, 1.15); } }
    if (gold > 0) walk(c, [0, THRESH + 360], [0, THRESH - 700], 9, gold, 1.35, '255,214,120', .6);   // the goddess steps into the footprints she was drawn
    if (back > 0) walk(c, [90, THRESH - 700], [90, THRESH + 900], 11, back, 1.35, '255,214,120', .6);
  }
  c.restore();
}
function broom(c, t, x, y, p) {   // a jhadu of grass, sweeping
  c.save(); c.translate(x, y); c.rotate(-.5 + .2 * Math.sin(p * 30)); c.strokeStyle = '#c8a860'; c.lineWidth = 3;
  for (let k = 0; k < 40; k++) { const a = (k / 40 - .5) * .8; c.strokeStyle = k % 3 ? '#c8a860' : '#a88a48'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(a) * 260, -Math.cos(a) * 260); c.stroke(); }
  c.fillStyle = '#7a2a1c'; c.fillRect(-14, 0, 28, 90); c.fillStyle = '#d8a838'; c.fillRect(-14, 20, 28, 6); c.restore();
}
