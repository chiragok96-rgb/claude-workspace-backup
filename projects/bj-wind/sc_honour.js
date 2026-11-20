// The President, without a face: Rashtrapati Bhavan drawn in gold line ("Rashtrapati"), which flows into the outline of Odisha,
// filled with the same Sambalpuri ikat as the ribbon ("Odishara jhia"). And the ending: time rolls back to a moonlit Kalinga sea,
// the Kartika wind unties the knot, and the two silks fill as the sails of a boita.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk, bez, chain, partial } from './common.js';
import { IKAT, BATIK } from './sc_gate.js';
let ODISHA = [];
export function initHonour(odisha) { ODISHA = odisha.pts; }
const GOLD = 'rgba(244,206,130,.95)';
function seq(c, items, p, lw) {   // draw a list of polylines progressively, in order
  const n = items.length; c.save(); c.strokeStyle = GOLD; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round';
  items.forEach((pts, i) => { const q = clamp(p * n * 1.15 - i * 1.15 / 1.15 * .95); if (q <= 0) return; const r = partial(pts, q); c.beginPath(); r.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); });
  c.restore();
}
const L = (x0, y0, x1, y1) => [[x0, y0], [x1, y1]], R = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
// Rashtrapati Bhavan, front elevation, in local units (width ±430, ground at 0, dome top at −300)
const BHAVAN = (() => {
  const P = [];
  P.push(L(-440, 0, 440, 0), L(-430, -12, 430, -12));                                   // the plinth
  P.push(R(-430, -12, -210, -92), R(210, -12, 430, -92));                               // the wings
  for (let i = 0; i < 6; i++) { const x = -410 + i * 34; P.push(R(x, -30, x + 16, -70)); P.push(R(-x - 16, -30, -x, -70)); }   // windows
  for (const sx of [-1, 1]) { const x = sx * 400; P.push(L(x - 24, -92, x - 24, -118), L(x + 24, -92, x + 24, -118)); P.push(bez([x - 30, -118], [x - 26, -150], [x + 26, -150], [x + 30, -118], 16)); P.push(L(x, -146, x, -160)); }   // chhatris
  P.push(L(-220, -92, 220, -92), L(-226, -104, 226, -104));                             // the portico's entablature
  for (let i = 0; i <= 12; i++) { const x = -200 + i * 400 / 12; P.push(L(x, -12, x, -92)); }   // the colonnade
  P.push(R(-120, -104, 120, -160));                                                     // the drum
  for (let i = 0; i <= 8; i++) { const x = -110 + i * 220 / 8; P.push(L(x, -110, x, -154)); }
  P.push(chain(bez([-118, -160], [-118, -250], [-60, -292], [0, -296], 24), bez([0, -296], [60, -292], [118, -250], [118, -160], 24)));   // the great dome
  P.push(bez([-104, -200], [-60, -214], [60, -214], [104, -200], 16));                    // its railing band
  P.push(R(-14, -296, 14, -312), L(0, -312, 0, -390));                                   // the finial, the flagstaff
  return P;
})();
function flag(c, x, y, s, t, a) {   // the national flag on the dome, gently waving
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  const band = (y0, col) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i <= 12; i++) { const u = i / 12, w = Math.sin(u * 4 - t * 5) * 2.4 * u; i ? c.lineTo(u * 54, y0 + w) : c.moveTo(0, y0); } for (let i = 12; i >= 0; i--) { const u = i / 12, w = Math.sin(u * 4 - t * 5) * 2.4 * u; c.lineTo(u * 54, y0 + 12 + w); } c.closePath(); c.fill(); };
  band(0, '#ff9933'); band(12, '#f6f2ea'); band(24, '#138808');
  c.strokeStyle = '#1a2a6c'; c.lineWidth = .9; c.beginPath(); c.arc(27 + Math.sin(2 - t * 5) * 1.2, 18, 4.6, 0, 7); c.stroke();
  c.restore();
}
export function bhavan(c, t, p, a, cx = 540, cy = 690, s = .98) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(cx, cy); c.scale(s, s);
  c.save(); c.globalCompositeOperation = 'lighter'; c.filter = 'blur(6px)'; c.globalAlpha = a * .5; seq(c, BHAVAN, p, 5); c.restore();
  seq(c, BHAVAN, p, 2.2);
  c.restore();
  flag(c, cx, cy - 388 * s, s * 1.15, t, a * ss(seg(p, .85, 1)));
}
export function odisha(c, t, p, fill, a, cx = 540, cy = 560, w = 600) {   // the real outline (datameet), drawn on, then filled with ikat
  if (a <= 0 || !ODISHA.length) return; const pts = ODISHA.map(([x, y]) => [cx + (x - .5) * w, cy + (y - .42) * w]);
  c.save(); c.globalAlpha = a;
  if (fill > 0) { c.save(); c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip();
    c.globalAlpha = a * fill * .85; const pat = c.createPattern(IKAT, 'repeat'); pat.setTransform(new DOMMatrix().translate(cx - w / 2 + t * 6, cy - w * .42).scale(.8)); c.fillStyle = pat; c.fillRect(cx - w, cy - w, w * 2, w * 2);
    const g = c.createRadialGradient(cx, cy, 20, cx, cy, w * .7); g.addColorStop(0, 'rgba(255,220,160,.0)'); g.addColorStop(1, 'rgba(20,4,4,.55)'); c.fillStyle = g; c.fillRect(cx - w, cy - w, w * 2, w * 2); c.restore(); }
  const q = partial(pts.concat([pts[0]]), p);
  c.strokeStyle = 'rgba(255,214,140,.35)'; c.lineWidth = 9; c.filter = 'blur(5px)'; c.beginPath(); q.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.filter = 'none';
  c.strokeStyle = GOLD; c.lineWidth = 2.6; c.lineJoin = 'round'; c.stroke();
  c.restore();
}

// ———————————————— the ending ————————————————
// a moonlit Kalinga sea, a thousand years ago (screen space)
export function nightSea(c, t, a) {
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05070a'); g.addColorStop(.55, '#0e1416'); g.addColorStop(.62, '#1a2224'); g.addColorStop(.63, '#0a1012'); g.addColorStop(1, '#030506'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const mx = 760, my = 400; const h = c.createRadialGradient(mx, my, 40, mx, my, 520); h.addColorStop(0, 'rgba(255,240,214,.22)'); h.addColorStop(1, 'rgba(255,230,200,0)'); c.fillStyle = h; c.fillRect(0, 0, W, 1200);
  const mg = c.createRadialGradient(mx - 14, my - 14, 8, mx, my, 70); mg.addColorStop(0, '#fffaf0'); mg.addColorStop(1, '#e8d6b4'); c.fillStyle = mg; c.beginPath(); c.arc(mx, my, 70, 0, 7); c.fill();
  c.fillStyle = 'rgba(180,160,130,.25)'; for (const [ox, oy, r] of [[-20, -14, 18], [18, 12, 13], [-4, 26, 9]]) { c.beginPath(); c.arc(mx + ox, my + oy, r, 0, 7); c.fill(); }
  c.fillStyle = '#0b1113'; for (const [x0, x1, hh_] of [[-40, 260, 26], [880, 1120, 34]]) { c.beginPath(); c.moveTo(x0, 1196); c.quadraticCurveTo((x0 + x1) / 2, 1196 - hh_ * 2, x1, 1196); c.fill(); }   // far isles
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 260; i++) { const k = Math.pow(hh(i * 1.7), 1.4), y = 1200 + k * 720, w = 30 + 360 * k, x = mx + (hh(i * 3.3) - .5) * w * 1.2;   // the moon's path on the water
    const tw = Math.pow(Math.max(0, Math.sin(t * (2 + hh(i) * 4) + i)), 6); if (tw < .05) continue; c.fillStyle = `rgba(255,240,210,${tw * (.8 - .4 * k)})`; c.fillRect(x - (4 + 14 * k) / 2, y, 4 + 14 * k, 1.6 + 1.4 * k); }
  c.restore();
}
// the boita whose sails are the two silks: ikat (left, the mainsail) and batik (right, the foresail)
function sail(c, x0, y0, w, h, belly, tex, a, t) {
  const P = new Path2D(); P.moveTo(x0, y0); P.lineTo(x0 + w, y0); P.quadraticCurveTo(x0 + w + belly, y0 + h / 2, x0 + w, y0 + h); P.lineTo(x0, y0 + h); P.quadraticCurveTo(x0 + belly, y0 + h / 2, x0, y0); P.closePath();
  c.save(); c.globalAlpha = a; c.clip(P); const pat = c.createPattern(tex, 'repeat'); pat.setTransform(new DOMMatrix().translate(x0, y0).rotate(90).scale(1.15)); c.fillStyle = pat; c.fillRect(x0 - 50, y0 - 20, w + belly + 100, h + 40);
  const g = c.createLinearGradient(x0, 0, x0 + w + belly, 0); g.addColorStop(0, 'rgba(10,2,2,.45)'); g.addColorStop(.55, 'rgba(255,230,190,.12)'); g.addColorStop(1, 'rgba(10,2,2,.4)'); c.fillStyle = g; c.fillRect(x0 - 50, y0 - 20, w + belly + 100, h + 40);
  const m = c.createLinearGradient(0, y0, 0, y0 + h); m.addColorStop(0, 'rgba(255,240,210,.18)'); m.addColorStop(1, 'rgba(0,0,0,.25)'); c.fillStyle = m; c.fillRect(x0 - 50, y0 - 20, w + belly + 100, h + 40); c.restore();
  c.save(); c.globalAlpha = a; c.strokeStyle = 'rgba(240,206,140,.85)'; c.lineWidth = 2; c.stroke(P); c.restore();
}
export function silkBoita(c, t, x, y, s, open, a) {   // open: 0 → the sails are still ribbons at the knot; 1 → full
  if (a <= 0) return; c.save(); c.translate(x, y); c.scale(s, s);
  const o = eo(open), bob = Math.sin(t * 1.6) * 4;
  c.translate(0, bob);
  c.globalAlpha = a; c.fillStyle = '#120a06'; c.beginPath(); c.moveTo(-270, -20); c.quadraticCurveTo(-200, 60, 0, 62); c.quadraticCurveTo(200, 60, 280, -24); c.quadraticCurveTo(300, -70, 330, -96); c.lineTo(318, -60); c.lineTo(250, -14); c.lineTo(-240, -14); c.quadraticCurveTo(-290, -50, -300, -86); c.closePath(); c.fill();   // the hull, prow and stern raised
  c.strokeStyle = 'rgba(240,206,140,.75)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-300, -86); c.quadraticCurveTo(-290, -50, -240, -14); c.lineTo(250, -14); c.lineTo(318, -60); c.lineTo(330, -96); c.stroke();   // moonlight on the gunwale
  c.fillStyle = '#120a06'; c.fillRect(-64, -440, 9, 430); c.fillRect(150, -360, 8, 350);   // masts
  sail(c, -200, -420, 270 * lerp(.2, 1, o), 330 * lerp(.15, 1, o), 46 * o, IKAT, a * ss(seg(open, 0, .3)), t);
  sail(c, 70, -340, 180 * lerp(.2, 1, o), 260 * lerp(.15, 1, o), 36 * o, BATIK, a * ss(seg(open, .1, .4)), t);
  c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(300, -40, 0, 300, -40, 60); g.addColorStop(0, `rgba(255,214,140,${.7 * a})`); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(240, -100, 120, 120);   // the prow lamp
  c.restore();
}
