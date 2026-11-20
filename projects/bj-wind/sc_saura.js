// "It is said…": the crow legend told as an Odisha Saura wall painting — white rice-paste lines on a red-ochre wall.
// The boat, the sailors, the moon, the waves; the crow released, circling back (the shore is far), flying on (the shore is that way).
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk, bez, chain, partial, at } from './common.js';
let WALL;
const PAINT = 'rgba(246,238,222,.95)';
export function initSaura() {
  const c = mk(), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8a3420'); g.addColorStop(.5, '#9c3e24'); g.addColorStop(1, '#7a2c1a'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { const px = hh(i * 1.7) * W, py = hh(i * 3.9) * H, r = 6 + hh(i * 2.3) * 60, l = hh(i * 7.1); x.fillStyle = l > .5 ? `rgba(196,96,58,${.05 + .06 * hh(i)})` : `rgba(70,22,12,${.05 + .07 * hh(i * 5)})`; x.beginPath(); x.ellipse(px, py, r, r * (.5 + hh(i * 9)), hh(i * 4) * 3, 0, 7); x.fill(); }   // the mud-plaster, uneven
  x.strokeStyle = 'rgba(50,14,8,.35)'; x.lineWidth = 1.2; for (let k = 0; k < 26; k++) { let px = hh(k * 3) * W, py = hh(k * 7) * H; x.beginPath(); x.moveTo(px, py); for (let s = 0; s < 8; s++) { px += (hh(k * 11 + s) - .5) * 60; py += hh(k * 13 + s) * 40; x.lineTo(px, py); } x.stroke(); }   // hairline cracks
  const im = x.getImageData(0, 0, W, H), d = im.data; for (let i = 0; i < d.length; i += 4) { const n = (hh(i * .37) - .5) * 18; d[i] += n; d[i + 1] += n * .7; d[i + 2] += n * .6; } x.putImageData(im, 0, 0);
  WALL = c;
}
function stroke(c, pts, p, lw = 6, a = 1) { const q = partial(pts, p); if (q.length < 2) return; c.save(); c.globalAlpha = a; c.strokeStyle = PAINT; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); q.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.restore(); }
function dots(c, pts, p, r = 3.2, a = 1) { c.save(); c.globalAlpha = a; c.fillStyle = PAINT; const n = Math.floor(pts.length * p); for (let i = 0; i < n; i++) { c.beginPath(); c.arc(pts[i][0], pts[i][1], r, 0, 7); c.fill(); } c.restore(); }
const line = (x0, y0, x1, y1, n = 12) => Array.from({ length: n + 1 }, (_, i) => [lerp(x0, x1, i / n), lerp(y0, y1, i / n)]);
// a Saura figure: a body of two triangles, stick limbs, a round head
function person(c, x, y, s, p, arms = 0) {
  if (p <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = clamp(p * 2);
  c.fillStyle = PAINT; c.beginPath(); c.moveTo(-12, -40); c.lineTo(12, -40); c.lineTo(0, -18); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0, -18); c.lineTo(-11, 2); c.lineTo(11, 2); c.closePath(); c.fill();
  c.beginPath(); c.arc(0, -50, 7, 0, 7); c.fill();
  c.strokeStyle = PAINT; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-6, 2); c.lineTo(-10, 24); c.moveTo(6, 2); c.lineTo(10, 24);
  const ay = lerp(-20, -66, arms); c.moveTo(-10, -38); c.lineTo(-24, ay); c.moveTo(10, -38); c.lineTo(24, ay); c.stroke(); c.restore();
}
// the crow: triangles for body and tail, a pointed beak, wings that beat
export function crow(c, x, y, s, flap, dir = 1, a = 1) {
  if (a <= 0) return; c.save(); c.translate(x, y); c.scale(s * dir, s); c.globalAlpha = a; c.fillStyle = '#16100c'; c.strokeStyle = PAINT; c.lineJoin = 'round';   // the crow is black — outlined in the wall's white
  c.beginPath(); c.moveTo(-26, 0); c.lineTo(10, -10); c.lineTo(22, -4); c.lineTo(10, 6); c.closePath(); c.fill();   // body
  c.beginPath(); c.arc(20, -8, 7, 0, 7); c.fill(); c.beginPath(); c.moveTo(25, -10); c.lineTo(38, -6); c.lineTo(25, -4); c.fill();   // head, beak
  c.beginPath(); c.moveTo(-24, -1); c.lineTo(-44, -10); c.lineTo(-42, 8); c.closePath(); c.fill();   // tail
  const wy = Math.sin(flap) * 30; c.beginPath(); c.moveTo(-8, -5); c.lineTo(4, -6); c.lineTo(-10 + Math.cos(flap) * 4, -8 - 26 - wy); c.closePath(); c.fill();   // wing
  c.lineWidth = 1.8; c.beginPath(); c.moveTo(-26, 0); c.lineTo(10, -10); c.lineTo(22, -4); c.lineTo(10, 6); c.closePath(); c.stroke(); c.beginPath(); c.arc(20, -8, 7, 0, 7); c.stroke(); c.beginPath(); c.moveTo(-24, -1); c.lineTo(-44, -10); c.lineTo(-42, 8); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(-8, -5); c.lineTo(4, -6); c.lineTo(-10 + Math.cos(flap) * 4, -8 - 26 - wy); c.closePath(); c.stroke();
  c.fillStyle = PAINT; c.beginPath(); c.arc(21, -9, 2.2, 0, 7); c.fill();
  c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, 6); c.lineTo(-2, 14); c.moveTo(6, 5); c.lineTo(6, 13); c.stroke();
  c.restore();
}
export const SB = { x: 540, y: 1000, s: 1 };   // the boat's place: where the lone boita of the map shot sits
const HULL = chain(bez([-190, -10], [-120, 70], [120, 70], [200, -14], 30), bez([200, -14], [214, -40], [206, -60], [222, -76], 8));
const MAST = line(-10, -12, -10, -250, 16), SAIL = [[-110, -230], [80, -230], [92, -110], [-122, -110], [-110, -230]];
export function sauraScene(c, t, o = {}) {
  const { reveal = 1, shore = 0 } = o;
  c.drawImage(WALL, 0, 0);
  // the border: a band of triangles and dots, like the frame of a Saura wall
  const bp = ss(seg(reveal, 0, .5)); c.save(); c.globalAlpha = bp; c.fillStyle = PAINT;
  for (let x = 30; x < W; x += 40) { c.beginPath(); c.moveTo(x - 14, 1800); c.lineTo(x, 1772); c.lineTo(x + 14, 1800); c.fill(); c.beginPath(); c.arc(x + 20, 1812, 3, 0, 7); c.fill(); }
  for (let x = 30; x < W; x += 40) { c.beginPath(); c.moveTo(x - 14, 118); c.lineTo(x, 146); c.lineTo(x + 14, 118); c.fill(); c.beginPath(); c.arc(x + 20, 106, 3, 0, 7); c.fill(); }
  c.fillRect(0, 1760, W, 4); c.fillRect(0, 154, W, 4); c.restore();
  // the full moon of Kartika: a ring of dots round a disc
  const mp = ss(seg(reveal, .4, .9)); if (mp > 0) { c.save(); c.globalAlpha = mp; c.fillStyle = PAINT; c.beginPath(); c.arc(210, 380, 62, 0, 7); c.fill(); c.fillStyle = '#9a3c22'; c.beginPath(); c.arc(210, 380, 46, 0, 7); c.fill(); c.fillStyle = PAINT; c.beginPath(); c.arc(210, 380, 30, 0, 7); c.fill();
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; c.beginPath(); c.arc(210 + Math.cos(a) * 86, 380 + Math.sin(a) * 86, 4, 0, 7); c.fill(); } c.restore(); }
  // the sea: rows of zigzag waves and a few fish
  const wp = ss(seg(reveal, .25, .85));
  for (let r = 0; r < 5; r++) { const y0 = 1090 + r * 46, pts = []; for (let x = 20, k = 0; x <= W - 20; x += 22, k++) pts.push([x + Math.sin(t * 1.5 + r) * 6, y0 + (k % 2 ? -12 : 12)]); stroke(c, pts, wp, 4.6, .9 - r * .08); }
  for (const [fx, fy, d] of [[200, 1290, 1], [820, 1250, -1], [600, 1320, 1]]) { if (wp < .7) continue; c.save(); c.globalAlpha = ss(seg(wp, .7, 1)); c.translate(fx + Math.sin(t * 2 + fx) * 10, fy); c.scale(d, 1); c.fillStyle = PAINT; c.beginPath(); c.moveTo(-26, 0); c.quadraticCurveTo(0, -16, 22, 0); c.quadraticCurveTo(0, 16, -26, 0); c.fill(); c.beginPath(); c.moveTo(-24, 0); c.lineTo(-40, -12); c.lineTo(-40, 12); c.fill(); c.restore(); }
  // the shore that appears where the crow flew: hills, palms, a hut
  if (shore > 0) { const sp = ss(shore); c.save(); c.globalAlpha = sp; c.fillStyle = PAINT;
    for (const [hx, hy, hw] of [[930, 1010, 150], [1050, 1000, 120], [860, 1040, 90]]) { c.beginPath(); c.moveTo(hx - hw, 1060); c.lineTo(hx, hy - hw * 1.1 * sp); c.lineTo(hx + hw, 1060); c.closePath(); c.fill(); c.fillStyle = '#9a3c22'; c.beginPath(); c.moveTo(hx - hw * .6, 1060); c.lineTo(hx, hy - hw * .55 * sp); c.lineTo(hx + hw * .6, 1060); c.closePath(); c.fill(); c.fillStyle = PAINT; }
    for (const [px, ph] of [[900, 230], [1000, 270]]) { stroke(c, [[px, 1000], [px - 6, 1000 - ph * .5], [px + 4, 1000 - ph]], 1, 5); for (let k = 0; k < 7; k++) { const a = -Math.PI + k * Math.PI / 6; stroke(c, [[px + 4, 1000 - ph], [px + 4 + Math.cos(a) * 52, 1000 - ph + Math.sin(a) * 30 + 18]], 1, 4); } }
    c.restore(); }
  // the boat (drawn on as the wall appears), its sailors, its sail
  const { x: bx, y: by, s } = SB; const hp = ss(seg(reveal, 0, .55));
  c.save(); c.translate(bx, by); c.scale(s, s);
  stroke(c, HULL, hp, 7); stroke(c, line(-176, 18, 186, 18, 30), hp, 3.6); dots(c, line(-160, 36, 160, 36, 26), hp, 3.2);
  stroke(c, MAST, ss(seg(reveal, .2, .6)), 6); stroke(c, SAIL, ss(seg(reveal, .3, .75)), 5);
  if (reveal > .5) { c.save(); c.globalAlpha = ss(seg(reveal, .5, .9)); c.strokeStyle = PAINT; c.lineWidth = 3; for (let k = 0; k < 6; k++) { const yy = -214 + k * 18; c.beginPath(); c.moveTo(-108 - k * .4, yy); c.lineTo(80 + k * 1.6, yy); c.stroke(); } c.restore(); }
  const joy = ss(shore); person(c, -120, -8, 1, ss(seg(reveal, .55, .9)), joy); person(c, 70, -8, 1, ss(seg(reveal, .6, .95)), joy * .8); person(c, 140, -8, .9, ss(seg(reveal, .65, 1)), 0);
  c.restore();
}
// the crow's flights (screen space): perch at the masthead; out and round and back; then straight out to the shore
export const PERCH = [SB.x - 10, SB.y - 262];
export const LOOP = chain(bez(PERCH, [640, 560], [820, 470], [880, 380], 30), bez([880, 380], [940, 280], [780, 200], [680, 300], 30), bez([680, 300], [600, 380], [560, 560], PERCH, 30));
export const STRAIGHT = line(PERCH[0], PERCH[1], 1240, 520, 40);
export function crowFlight(c, t) {
  let pos = PERCH, flying = false, dir = 1, p;
  if (t >= 29.35 && t < 31.65) { p = eio(seg(t, 29.35, 31.65)); pos = at(LOOP, p); flying = p < .985; const q = at(LOOP, Math.min(1, p + .01)); dir = q[0] >= pos[0] ? 1 : -1; }
  else if (t >= 33.15) { p = eo(seg(t, 33.15, 34.9)); pos = at(STRAIGHT, p); flying = true; }
  // the dotted trails, left in paint
  if (t > 29.4) dots(c, LOOP.filter((_, i) => i % 2 === 0), t < 31.65 ? eio(seg(t, 29.35, 31.65)) : 1, 3, t < 33 ? .75 : .75 * (1 - ss(seg(t, 33.2, 34.0))));
  if (t > 33.15) dots(c, STRAIGHT.filter((_, i) => i % 1 === 0), eo(seg(t, 33.15, 34.9)), 3.6, .9);
  const flap = flying ? t * 16 : .4;
  crow(c, pos[0], pos[1] - (flying ? 0 : 10), 1.8, flap, dir, ss(seg(t, 27.9, 28.3)) * (t > 35.2 ? 1 - ss(seg(t, 35.2, 35.6)) : 1));
}
