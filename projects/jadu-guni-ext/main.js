// Jadu Guni (extended): one paper-cut lightbox film, dusk → moonlit night → dawn and spring. One metaphor per line.
import { initLightbox, sheet, drawStack, glow, LW, LH } from './lightbox.js';
import * as M from './motifs.js';
import { mulberry } from './engine_wc.js';

const W = 1080, H = 1920, DUR = 43.87;
const BEATS = [0.07, 0.63, 1.18, 1.74, 2.28, 2.86, 3.41, 3.97, 4.50, 5.06, 5.60, 6.18, 6.73, 7.27, 7.80, 8.38, 8.96, 9.52, 10.05, 10.59, 11.17, 11.73, 12.26, 12.84, 13.40, 13.96, 14.51, 15.07, 15.63, 16.16, 16.74, 17.30, 17.86, 18.39, 18.92, 19.48, 20.06, 20.64, 21.20, 21.73, 22.29, 22.83, 23.38, 23.96, 24.52, 25.05, 25.59, 26.17, 26.73, 27.31, 27.84, 28.40, 28.96, 29.51, 30.07, 30.63, 31.18, 31.74, 32.28, 32.83, 33.41, 33.97, 34.50, 35.06, 35.60, 36.18, 36.71, 37.29, 37.85, 38.41, 38.96, 39.50, 40.05, 40.63, 41.19, 41.74, 42.30, 42.85, 43.41];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a)), ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const backE = (t, s = 1.4) => { t = clamp(t); return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
const Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mkc = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const BUF = mkc();
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
const full = m => m.fillRect(-LW / 2, -LH / 2, LW, LH);
const flick = (t, k = 0) => 1 + .045 * Math.sin(7.3 * t + k) * Math.sin(3.1 * t + k * 2);
const pulse = (t, from, to, k = 3) => Math.max(0, ...BEATS.filter(b => b >= from && b < to).map(b => t >= b ? Math.exp(-(t - b) * k) : 0));
function scrOf(cam) { return (l, x, y) => { const p = .45 + .55 * l.depth, z = 1 + (cam.z - 1) * p; return [W / 2 + z * (x + (l.ox || 0) - cam.x * p), H / 2 + z * (y + (l.oy || 0) - cam.y * p), z]; }; }
const reset = L => L.forEach(l => { l.lit = 1; l.ox = 0; l.oy = 0; l.blur = 0; l.alpha = 1; l.rot = 0; });
const DEEP = '#7a2416', CREAM = '#fff2dc';
const wordSheet = (txt, size, y, col = DEEP, depth = .3) => sheet(col, m => { m.font = `${size}px "Pinyon Script"`; m.textAlign = 'center'; m.textBaseline = 'middle'; m.fillText(txt, 0, y); }, col === DEEP ? { depth, trans: .35, rim: '#ffd9a0', rimA: .9 } : { depth, trans: .95 });

// ---------- motifs ----------
function jharokha(m, w, top, bottom) {
  m.beginPath(); m.moveTo(-w, bottom); m.lineTo(-w, top + w);
  for (let k = 1; k <= 9; k++) { const a = Math.PI + k / 9 * Math.PI, c = Math.PI + (k - .5) / 9 * Math.PI; m.quadraticCurveTo(Math.cos(c) * (w + 44), top + w + Math.sin(c) * (w + 40), Math.cos(a) * w, top + w + Math.sin(a) * w); }
  m.lineTo(w, bottom); m.closePath(); m.fill();
}
function panicle(m, x, y, ang, len, r = 7) { for (let k = 0; k < 15; k++) { const u = k / 14; m.beginPath(); m.arc(x + Math.cos(ang) * len * u + (k % 2 ? 1 : -1) * Math.sin(ang) * 10 * (1 - u), y + Math.sin(ang) * len * u - (k % 2 ? 1 : -1) * Math.cos(ang) * 10 * (1 - u), r * (1 - u * .55), 0, 7); m.fill(); } }
function branch(m, pts, w, leaves) {
  m.save(); m.lineCap = 'round'; m.lineJoin = 'round'; m.strokeStyle = '#000'; m.lineWidth = w; m.beginPath(); m.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) m.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], (pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2); m.lineTo(...pts.at(-1)); m.stroke(); m.restore();
  for (const [x, y, a, l] of leaves) { m.save(); m.translate(x, y); m.rotate(a); m.beginPath(); m.moveTo(0, 0); m.quadraticCurveTo(l * .5, -l * .2, l, 0); m.quadraticCurveTo(l * .5, l * .2, 0, 0); m.fill(); m.restore(); }
}
function veins(m, leaves) { for (const [x, y, a, l] of leaves) { m.save(); m.translate(x, y); m.rotate(a); m.fillRect(l * .08, -1.2, l * .8, 2.4); m.restore(); } }
function cuckoo(m, x, y, s, d = -1) {
  m.save(); m.translate(x, y); m.scale(s * -d, s);
  m.beginPath(); m.moveTo(-70, 70); m.quadraticCurveTo(-60, 20, -20, 6); m.quadraticCurveTo(-30, -30, 0, -46); m.quadraticCurveTo(30, -60, 52, -40); m.lineTo(80, -35); m.lineTo(54, -27);
  m.quadraticCurveTo(60, 0, 40, 30); m.quadraticCurveTo(84, 60, 196, 66); m.lineTo(188, 82); m.quadraticCurveTo(84, 86, 20, 76); m.quadraticCurveTo(-30, 92, -70, 70); m.fill();
  m.fillRect(-10, 70, 6, 30); m.fillRect(12, 70, 6, 30); m.restore();
}
function lotus(m, x, y, s) { for (const [a, l] of [[-1.2, 70], [-.6, 86], [0, 92], [.6, 86], [1.2, 70]]) { m.save(); m.translate(x, y); m.rotate(a - Math.PI / 2); m.beginPath(); m.moveTo(0, 0); m.quadraticCurveTo(l * .5 * s, -26 * s, l * s, 0); m.quadraticCurveTo(l * .5 * s, 26 * s, 0, 0); m.fill(); m.restore(); } }
function lily(m, x, y, rx, ry) { m.beginPath(); m.ellipse(x, y, rx, ry, 0, .25, Math.PI * 2 - .1); m.lineTo(x, y); m.fill(); }
const cap = (m, a, b, w) => { m.save(); m.lineCap = 'round'; m.lineWidth = w; m.strokeStyle = '#000'; m.beginPath(); m.moveTo(...a); m.lineTo(...b); m.stroke(); m.restore(); };
// her open hand, palm toward us (origin = palm centre)
const FING = [[[-95, -130], [-122, -430], 62], [[-30, -150], [-36, -500], 66], [[36, -145], [50, -460], 64], [[98, -110], [134, -330], 54]];
function palm(m) {
  m.beginPath(); [[-112, 900], [-120, 380], [-130, 250], [-150, 120], [-152, -20], [-130, -112], [-96, -150], [100, -150], [132, -100], [146, 0], [140, 120], [124, 250], [114, 380], [108, 900]].forEach((p, i) => i ? m.lineTo(...p) : m.moveTo(...p)); m.closePath(); m.fill();
  m.save(); m.lineCap = 'round'; m.lineJoin = 'round'; m.lineWidth = 74; m.strokeStyle = '#000'; m.beginPath(); m.moveTo(-120, 120); m.quadraticCurveTo(-210, 40, -290, -130); m.stroke(); m.restore();
}
function mehndi(m) {   // henna as cut lace: mandala on the palm, bands and dots on the fingers, a vine, a wrist lattice
  const C = [0, 90];
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; m.save(); m.translate(C[0] + Math.cos(a) * 80, C[1] + Math.sin(a) * 80); m.rotate(a); m.beginPath(); m.ellipse(0, 0, 24, 9, 0, 0, 7); m.fill(); m.restore(); }
  for (let k = 0; k < 28; k++) { const a = k / 28 * Math.PI * 2; m.beginPath(); m.arc(C[0] + Math.cos(a) * 116, C[1] + Math.sin(a) * 116, 5, 0, 7); m.fill(); }
  m.save(); m.lineWidth = 5; m.strokeStyle = '#000'; m.beginPath(); m.arc(...C, 48, 0, 7); m.stroke(); m.restore(); m.beginPath(); m.arc(...C, 17, 0, 7); m.fill();
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + .2; m.beginPath(); m.ellipse(C[0] + Math.cos(a) * 31, C[1] + Math.sin(a) * 31, 7, 3, a, 0, 7); m.fill(); }
  fingerCuts(m, -1);
  if (false) for (const [[x0, y0], [x1, y1], w] of FING) for (const u of [.35, .62, .86]) {
    const x = lerp(x0, x1, u), y = lerp(y0, y1, u), a = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2;
    m.save(); m.translate(x, y); m.rotate(a); if (u < .8) { m.fillRect(-w * .36, -2.5, w * .72, 5); m.fillRect(-w * .3, 9, w * .6, 3); } else { for (const d of [-1, 0, 1]) { m.beginPath(); m.arc(d * w * .22, 0, 4.5, 0, 7); m.fill(); } } m.restore();
  }
  for (let k = 0; k < 7; k++) { const y = -40 - k * 30, x = -14 + (k % 2 ? 10 : -10); m.save(); m.translate(x, y); m.rotate(k % 2 ? .7 : -.7); m.beginPath(); m.ellipse(0, 0, 11, 4.5, 0, 0, 7); m.fill(); m.restore(); }
  m.save(); m.lineWidth = 4; m.strokeStyle = '#000'; m.beginPath(); for (let k = 0; k <= 12; k++) m.lineTo(-108 + k * 18, 440 + (k % 2 ? -16 : 16)); m.stroke(); m.restore();
  for (let k = 0; k < 6; k++) { m.beginPath(); m.arc(-75 + k * 30, 400, 4, 0, 7); m.fill(); }
}
function fingerCuts(m, only) {
  FING.forEach(([[x0, y0], [x1, y1], w], fi) => { if (only !== -1 && only !== fi) return; if (only === -1) return; for (const u of [.35, .62, .86]) {
    const x = lerp(x0, x1, u), y = lerp(y0, y1, u), a = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2;
    m.save(); m.translate(x, y); m.rotate(a); if (u < .8) { m.fillRect(-w * .36, -2.5, w * .72, 5); m.fillRect(-w * .3, 9, w * .6, 3); } else { for (const d of [-1, 0, 1]) { m.beginPath(); m.arc(d * w * .22, 0, 4.5, 0, 7); m.fill(); } } m.restore(); } });
}
// gold ornament (Klimt's gold period, as a medium layer): spirals, ringed circles, eyes, gold blocks
const ORN = (() => { const R = mulberry(818), out = []; while (out.length < 150) { const x = -560 + R() * 1120, y = -980 + R() * 1960; if (Math.abs(x) < 230 && y > -560) continue; if (Math.abs(x) < 420 && y > -830 && y < -560) continue; out.push({ x, y, k: Math.floor(R() * 4), r: 12 + R() * 22, ph: R() * 6.28, sp: (R() - .5) * 3 }); } return out; })();
function ornament(c, o, x, y, z, a, t) {
  if (a <= 0) return; const r = o.r * z * backE(clamp(a), 1.8); c.save(); c.globalAlpha = Math.min(1, a); c.translate(x, y);
  if (o.k === 0) { c.rotate(t * o.sp + o.ph); c.strokeStyle = '#f6d27a'; c.lineWidth = Math.max(1.5, r * .16); c.beginPath(); for (let q = 0; q < 26; q++) { const u = q / 25, rr = r * u; c.lineTo(Math.cos(u * 13) * rr, Math.sin(u * 13) * rr); } c.stroke(); c.strokeStyle = 'rgba(60,20,8,.5)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, r * 1.05, 0, 7); c.stroke(); }
  else if (o.k === 1) { for (const [rr, col] of [[1, '#f2b83e'], [.72, '#C8321E'], [.46, '#fff2dc'], [.22, '#f2b83e']]) { c.fillStyle = col; c.beginPath(); c.arc(0, 0, r * rr, 0, 7); c.fill(); } }
  else if (o.k === 2) { const bl = Math.sin(2.2 * t + o.ph) > .9 ? .15 : 1; c.fillStyle = '#f2b83e'; c.beginPath(); c.ellipse(0, 0, r * 1.3, r * .6 * bl, 0, 0, 7); c.fill(); c.fillStyle = '#3a1210'; c.beginPath(); c.arc(0, 0, r * .3 * bl, 0, 7); c.fill(); }
  else { c.rotate(o.ph * .1); c.fillStyle = '#1c0a08'; c.fillRect(-r * .35, -r, r * .7, r * 2); c.strokeStyle = '#f2b83e'; c.lineWidth = 2; c.strokeRect(-r * .35, -r, r * .7, r * 2); c.fillStyle = '#f2b83e'; c.fillRect(-r * .12, -r * .5, r * .24, r * .24); }
  c.restore();
}
// her, seen from behind: head, shoulders, saree; the braid is animated separately
const NAPE = 380;
function backFigure(m, x, y) {   // she faces away: head, low bun, slim neck, sloping shoulders, arms a little apart, saree
  const P = (pts) => { m.beginPath(); pts.forEach((p, i) => i ? m.lineTo(x + p[0], y + p[1]) : m.moveTo(x + p[0], y + p[1])); m.closePath(); m.fill(); };
  m.beginPath(); m.ellipse(x, y - 92, 60, 76, 0, 0, 7); m.fill();
  m.beginPath(); m.arc(x, y - 18, 44, 0, 7); m.fill();
  m.beginPath(); m.moveTo(x - 24, y + 10);
  [[-26, 70], [-70, 96], [-104, 118], [-118, 150], [-108, 260], [-88, 400], [-96, 520], [-140, 820], [-180, 1700], [180, 1700], [140, 820], [96, 520], [88, 400], [108, 260], [118, 150], [104, 118], [70, 96], [26, 70], [24, 10]].forEach(p => m.lineTo(x + p[0], y + p[1])); m.closePath(); m.fill();
  for (const d of [-1, 1]) P([[d * 112, 132], [d * 134, 170], [d * 146, 300], [d * 140, 430], [d * 128, 470], [d * 118, 430], [d * 122, 300], [d * 112, 190]]);
}
function backCuts(m, x, y) {
  for (let k = 0; k < 20; k++) { const q = k / 20 * Math.PI * 2, r = k % 2 ? 6.5 : 5; m.beginPath(); m.arc(x + Math.cos(q) * 34, y - 18 + Math.sin(q) * 34, r, 0, 7); m.fill(); }
  m.beginPath(); m.arc(x + 14, y - 26, 4, 0, 7); m.fill();
  for (let r = 0; r < 8; r++) for (let k = -3; k <= 3; k++) { const dx = k * 40 + (r % 2) * 20, dy = 560 + r * 80, half = 100 + r * 9; if (Math.abs(dx) > half - 12) continue; m.beginPath(); m.moveTo(x + dx, y + dy - 9); m.lineTo(x + dx + 7, y + dy); m.lineTo(x + dx, y + dy + 9); m.lineTo(x + dx - 7, y + dy); m.fill(); }
  m.fillRect(x - 92, y + 516, 184, 4); m.fillRect(x - 94, y + 526, 188, 2);
}
function palluBand(m, x, y) { m.beginPath(); [[-150, 118], [-60, 92], [176, 560], [174, 700], [120, 690]].forEach((p, i) => i ? m.lineTo(x + p[0], y + p[1]) : m.moveTo(x + p[0], y + p[1])); m.closePath(); m.fill(); }
function palluBandCuts(m, x, y) { for (let k = 0; k < 14; k++) { const u = k / 13; m.beginPath(); m.arc(x + lerp(-120, 150, u), y + lerp(118, 650, u), 4, 0, 7); m.fill(); m.beginPath(); m.arc(x + lerp(-50, 168, u) , y + lerp(100, 560, u) + 8, 3, 0, 7); m.fill(); } }
function braid(c, scr, L, t) {   // a swinging plait woven with jasmine, a gold tassel at the end
  const pts = []; let x = 0, y = NAPE - 10, a = 0;
  for (let k = 0; k < 15; k++) { a += (.022 + .03 * pulse(t, 8.96, 13.4, 2.2)) * Math.sin(t * 1.7 - k * .42); x += Math.sin(a) * 34; y += Math.cos(a) * 34; pts.push([x, y, k]); }
  c.save();
  pts.forEach(([px, py, k]) => { const [sx, sy, z] = scr(L, px + (k % 2 ? 7 : -7), py), rx = (26 - k * .9) * z, ry = 22 * z;
    c.fillStyle = '#1e0a08'; c.beginPath(); c.ellipse(sx, sy, rx, ry, (k % 2 ? .5 : -.5), 0, 7); c.fill(); c.strokeStyle = 'rgba(255,190,120,.35)'; c.lineWidth = 1.5; c.stroke();
    if (k > 1 && k < 13) for (const d of [-1, 1]) { const jx = sx + d * rx * .95, jy = sy - ry * .2; glow(c, jx, jy, 9 * z, 'rgba(255,240,210,1)', .5); c.fillStyle = '#fff6e6'; c.beginPath(); c.arc(jx, jy, 5.5 * z, 0, 7); c.fill(); } });
  const [tx, ty, z] = scr(L, ...pts.at(-1)); c.fillStyle = '#e3a23a'; c.beginPath(); c.moveTo(tx - 10 * z, ty); c.lineTo(tx + 10 * z, ty); c.lineTo(tx + 4 * z, ty + 46 * z); c.lineTo(tx - 4 * z, ty + 46 * z); c.fill();
  c.restore(); return pts;
}
// a woman walking in a saree, pallu streaming behind her
function walker(m, x, y, s) {
  M.woman(m, x, y, s, 1, 'none');
}
function pallu(m, x, y, s) { const T = ([a, b]) => [x + a * s, y + b * s]; m.beginPath(); [[-40, -420], [-110, -405], [-190, -370], [-260, -310], [-310, -250], [-334, -196], [-314, -212], [-262, -266], [-196, -328], [-122, -364], [-60, -352]].map(T).forEach((p, i) => i ? m.lineTo(...p) : m.moveTo(...p)); m.closePath(); m.fill(); }
function palluCuts(m, x, y, s) { const T = ([a, b]) => [x + a * s, y + b * s]; for (let k = 0; k < 9; k++) { const u = k / 8, [px, py] = T([lerp(-110, -318, u), lerp(-392, -214, u) + 4]); m.beginPath(); m.arc(px, py, 3.6 * s, 0, 7); m.fill(); } }
function walkerCuts(m, x, y, s) { const T = ([a, b]) => [x + a * s, y + b * s]; for (let k = 0; k < 12; k++) { const [px, py] = T([-40 + k * 9, -60 - k * 2]); m.fillRect(px - 2, py, 4 * s, 26 * s); } }
function star4(c, x, y, r, a, col = '#fff6e0') {   // a paper star with a soft cross flare
  if (a <= 0) return;
  glow(c, x, y, r * 2.2, 'rgba(255,220,160,1)', .55 * a);
  c.save(); c.globalAlpha = Math.min(1, a); c.fillStyle = col; c.beginPath();
  for (let k = 0; k < 8; k++) { const q = k / 8 * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? r * .28 : r; c.lineTo(x + Math.cos(q) * rr, y + Math.sin(q) * rr); } c.closePath(); c.fill();
  c.globalAlpha = .5 * Math.min(1, a); c.fillRect(x - r * 3, y - 1, r * 6, 2); c.fillRect(x - 1, y - r * 3, 2, r * 6); c.restore();
}
function flower(c, x, y, r, a, col) {   // a little paper blossom opening
  if (a <= 0) return; const s = backE(a, 1.6);
  glow(c, x, y, r * 2.2, 'rgba(255,210,120,1)', .5 * clamp(a));
  c.save(); c.translate(x, y); c.rotate(a * .6); c.scale(s, s);
  for (let k = 0; k < 5; k++) { c.save(); c.rotate(k / 5 * Math.PI * 2); c.fillStyle = col; c.beginPath(); c.ellipse(0, -r * .55, r * .38, r * .55, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(80,20,10,.35)'; c.lineWidth = 1.5; c.stroke(); c.restore(); }
  c.fillStyle = '#fff1c8'; c.beginPath(); c.arc(0, 0, r * .22, 0, 7); c.fill(); c.restore();
}

// ---------- stacks ----------
let SA, SB, SC, SD, S5, S6, S7;
const EW = 900, EH = 420, BR = 190;
function almond(m, w, h) { m.beginPath(); m.moveTo(-w / 2, 0); m.bezierCurveTo(-w * .2, -h * .95, w * .25, -h * 1.0, w / 2, -h * .08); m.bezierCurveTo(w * .25, h * .82, -w * .2, h * .78, -w / 2, 0); m.closePath(); }
const LB = [[480, -10, -2.3, 140], [330, 10, .8, 130], [180, -20, -1.9, 130], [10, 10, 1.0, 120], [-170, -20, -2.4, 120], [-330, 0, .9, 120]];
const BRANCH = [[700, 60], [400, -10], [100, 30], [-200, -30], [-700, 20]];
const HX = 0, HY = 80;
function build() {
  // SA · her mehndi hand in the lamplight: the spell
  SA = [
    sheet('#f4b67c', full, { depth: 0, trans: .95 }),
    sheet('#9a4026', full, { depth: .35, trans: .45, cut: m => { jharokha(m, 450, -900, 900); for (const sx of [-1, 1]) for (let k = 0; k < 11; k++) { const x = sx * 545, y = -700 + k * 120; m.beginPath(); m.moveTo(x, y - 30); m.lineTo(x + 18, y); m.lineTo(x, y + 30); m.lineTo(x - 18, y); m.fill(); } } }),
    wordSheet('Jadu Guni', 175, -690, DEEP, .5),
    sheet('#3a1210', m => { m.save(); m.translate(HX, HY); palm(m); m.restore(); }, { depth: .8, trans: .2, rim: '#ffcf8a', rimA: .9, cut: m => { m.save(); m.translate(HX, HY); mehndi(m); m.restore(); } }),
    ...FING.map(([a, b, w], fi) => sheet('#3a1210', m => { m.save(); m.translate(HX, HY); cap(m, a, b, w); m.restore(); }, { depth: .8, trans: .2, rim: '#ffcf8a', rimA: .9, cut: m => { m.save(); m.translate(HX, HY); fingerCuts(m, fi); m.restore(); } })),
    sheet('#E3A23A', m => { for (const y of [560, 612, 664]) { m.beginPath(); m.ellipse(HX, HY + y, 138, 22, 0, 0, 7); m.fill(); } }, { depth: .82, trans: .6, cut: m => { for (const y of [560, 612, 664]) for (let k = 0; k < 12; k++) { m.beginPath(); m.arc(HX - 110 + k * 20, HY + y, 3.5, 0, 7); m.fill(); } } }),
    sheet('#1c0a08', m => { m.fillRect(-LW / 2, -LH / 2, LW, LH / 2 - 900); for (let k = 0; k < 15; k++) { const x = -LW / 2 + k * 100 + 50; m.beginPath(); m.moveTo(x - 50, -900); m.quadraticCurveTo(x, -800, x + 50, -900); m.fill(); } for (const x of [-500, -430, 440, 505]) { m.fillRect(x - 2, -900, 4, 300 + Math.abs(x % 3) * 20); for (let k = 0; k < 8; k++) { m.beginPath(); m.arc(x, -870 + k * 40, 16, 0, 7); m.fill(); } } }, { depth: 1, trans: .04 }),
  ];
  // SB · the salt-silver sea that turns to honey
  const sea = (top, amp, crest) => m => { m.beginPath(); m.moveTo(-LW / 2, LH); m.lineTo(-LW / 2, top); for (let x = -LW / 2; x <= LW / 2; x += 60) m.quadraticCurveTo(x + 30, top - amp, x + 60, top); m.lineTo(LW / 2, LH); m.closePath(); m.fill(); };
  const foam = (top, n) => m => { for (let r = 0; r < n; r++) for (let k = 0; k < 9; k++) { const x = -640 + k * 160 + (r % 2) * 80, y = top + 40 + r * 70; m.beginPath(); m.ellipse(x, y, 52, 4, 0, Math.PI, 0); m.fill(); } };
  SB = [
    sheet('#d9c4d6', full, { depth: 0, trans: .95 }),
    sheet('#f2b670', full, { depth: 0, trans: .95 }),
    wordSheet('Luniya', 250, -640, DEEP, .3),
    wordSheet('Meetha', 250, -640, DEEP, .3),
    sheet('#8fa6c4', sea(150, 26), { depth: .3, trans: .6, cut: foam(150, 3) }), sheet('#e8a24c', sea(150, 26), { depth: .3, trans: .6, cut: foam(150, 3) }),
    sheet('#5d7898', sea(420, 36), { depth: .55, trans: .4, cut: foam(420, 3) }), sheet('#c8742e', sea(420, 36), { depth: .55, trans: .4, cut: foam(420, 3) }),
    sheet('#2c3f60', sea(700, 46), { depth: .85, trans: .2, cut: foam(700, 2) }), sheet('#8a3e1c', sea(700, 46), { depth: .85, trans: .2, cut: foam(700, 2) }),
  ];
  // SC · under the blossoming mango tree, the scent of her
  const LC = [[-500, -760, .4, 150], [-330, -700, 2.6, 140], [-150, -790, .7, 150], [60, -720, 2.3, 140], [260, -790, .5, 150], [440, -720, 2.7, 140], [-420, -600, 1.1, 130], [340, -600, 2.0, 130]];
  SC = [
    sheet('#f6c993', full, { depth: 0, trans: .95 }),
    sheet('#e7a37a', m => { m.fillRect(-LW / 2, 380, LW, LH); for (let k = 0; k < 7; k++) { const x = -640 + k * 210; m.fillRect(x - 10, 140, 20, 260); m.beginPath(); m.ellipse(x, 120, 120, 90, 0, 0, 7); m.fill(); } }, { depth: .2, trans: .65 }),
    wordSheet('Amba Baula', 200, -380, DEEP, .3),
    sheet('#4a2014', m => { m.fillRect(-LW / 2, -LH / 2, LW, LH / 2 - 820); branch(m, [[-700, -820], [-300, -700], [0, -760], [300, -690], [700, -800]], 30, LC); for (let k = 0; k < 16; k++) { const x = -660 + k * 90; m.beginPath(); m.ellipse(x, -830, 80, 60, 0, 0, 7); m.fill(); } }, { depth: .5, trans: .25, cut: m => veins(m, LC) }),
    sheet('#C8321E', m => { for (const [x, y, a] of [[-420, -700, 1.3], [-200, -740, 1.7], [120, -720, 1.4], [380, -730, 1.8], [-40, -770, 1.6]]) panicle(m, x, y, a, 130, 9); }, { depth: .52, trans: .75 }),
    sheet('#3e100e', m => { m.save(); m.translate(0, NAPE); m.scale(1.4, 1.4); backFigure(m, 0, 0); m.restore(); }, { depth: .75, trans: .14, rim: '#ffb46a', rimA: .9, cut: m => { m.save(); m.translate(0, NAPE); m.scale(1.4, 1.4); backCuts(m, 0, 0); m.restore(); } }),
    sheet('#8a1c14', m => palluBand(m, 0, NAPE), { depth: .76, trans: .35, rim: '#ffd08a', rimA: .8, cut: m => palluBandCuts(m, 0, NAPE) }),
    sheet('#1e0b08', m => { m.fillRect(-LW / 2, 660, LW, LH); for (let k = 0; k < 22; k++) { const x = -660 + k * 62; m.beginPath(); m.moveTo(x - 8, 662); m.quadraticCurveTo(x + (k % 3 - 1) * 14, 600 - (k % 4) * 14, x + 4, 662); m.fill(); } }, { depth: 1, trans: .03 }),
  ];
  // SD · moonrise over the lotus pond
  SD = [
    sheet('#2a120e', full, { depth: 0, trans: .9 }),
    sheet('#4a2018', m => { m.beginPath(); m.moveTo(-LW / 2, 260); for (let x = -LW / 2; x <= LW / 2; x += 40) m.lineTo(x, 230 - 70 * Math.sin(x / 230) - 26 * Math.sin(x / 70)); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill(); }, { depth: .2, trans: .55 }),
    wordSheet('Mahani', 250, -720, CREAM, .3),
    sheet('#0f1d18', m => { m.fillRect(-LW / 2, 300, LW, LH); }, { depth: .45, trans: .25, cut: m => { for (let r = 0; r < 7; r++) m.fillRect(-LW / 2, 360 + r * 70 + r * r * 6, LW, 2.5); } }),
    sheet('#1d3a2c', m => { lily(m, -330, 600, 150, 34); lily(m, 280, 680, 190, 40); lily(m, -80, 820, 130, 30); lily(m, 380, 470, 110, 24); }, { depth: .6, trans: .2 }),
    sheet('#C8321E', m => { lotus(m, -240, 590, .9); lotus(m, 200, 668, 1.1); }, { depth: .62, trans: .75 }),
    sheet('#07060f', m => { m.fillRect(-LW / 2, 900, LW, LH); for (const [x0, sgn] of [[-560, 1], [560, -1]]) for (let k = 0; k < 9; k++) { const x = x0 + sgn * k * 26; m.beginPath(); m.moveTo(x - 6, 910); m.quadraticCurveTo(x + sgn * 30, 600 - k * 30, x + sgn * (40 + k * 6), 380 + k * 22); m.quadraticCurveTo(x + sgn * 20, 600, x + 6, 910); m.fill(); } }, { depth: 1, trans: .02 }),
  ];
  // S5 · the eye (approved)
  const LV = [[520, 150, -.9, 130], [380, 90, 2.4, 120], [250, 70, -1.1, 130], [120, 80, 2.2, 110], [-40, 100, -.7, 130], [-200, 120, 2.6, 120], [-330, 100, -1.2, 120]];
  S5 = [
    sheet('#2e1610', full, { depth: 0, trans: .95 }),
    sheet('#160c0a', m => branch(m, [[700, 220], [300, 40], [-120, 110], [-300, 140], [-460, 60]], 18, LV), { depth: .35, trans: .3, cut: m => veins(m, LV) }),
    sheet('#C8321E', m => { for (const [x, y, a] of [[300, 40, -1.9], [-110, 70, -1.2], [-380, 40, -2.2], [160, 46, -1.5]]) panicle(m, x, y, a, 95, 7); }, { depth: .37, trans: .75 }),
    sheet('#2a1610', m => { m.beginPath(); m.arc(0, 0, BR, 0, 7); m.fill(); }, { depth: .6, trans: .4, cut: m => { m.beginPath(); m.arc(0, 0, 66, 0, 7); m.fill(); for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2; m.save(); m.rotate(a); m.beginPath(); m.ellipse(128, 0, 44, 3, 0, 0, 7); m.fill(); m.restore(); } } }),
    sheet('#5a2a20', full, { depth: .85, trans: .22, rim: '#ffb46a', rimA: .8, cut: m => { almond(m, EW, EH); m.fill(); } }),
    sheet('#140806', m => { m.beginPath(); m.moveTo(-460, -340); m.quadraticCurveTo(-60, -520, 440, -350); m.quadraticCurveTo(-60, -455, -460, -340); m.fill(); }, { depth: .86, trans: .05 }),
    sheet('#060509', m => {
      m.beginPath(); m.moveTo(-EW / 2 - 6, -4); m.bezierCurveTo(-EW * .2, -EH * .99, EW * .25, -EH * 1.04, EW / 2 + 4, -EH * .1);
      m.lineTo(EW / 2 + 150, -EH * .38); m.lineTo(EW / 2 + 10, -EH * .02); m.bezierCurveTo(EW * .25, -EH * .92, -EW * .2, -EH * .88, -EW / 2 + 6, 4); m.closePath(); m.fill();
      for (let k = 0; k < 13; k++) { const u = .12 + k * .065, x = lerp(-EW * .42, EW * .44, u), y = -EH * .9 * Math.sin(Math.PI * (u * .9 + .05)) - 6; m.save(); m.translate(x, y); m.rotate(-.5 + u * .9); m.beginPath(); m.moveTo(-5, 0); m.quadraticCurveTo(-4, -40, 14, -58); m.quadraticCurveTo(4, -36, 5, 0); m.fill(); m.restore(); }
    }, { depth: .9, trans: .02 }),
    wordSheet('Chagali', 190, -720, '#ffe9c8', .95),
    wordSheet('Kajala', 190, 470, '#ffe9c8', .95),
  ];
  // S6 · the full moon, the cuckoo, her on the balcony (approved) + the tiny stars
  const balcony = m => { M.profile(m, 1.0, 330, 1000); m.fillRect(-LW / 2, 1180, LW, LH); m.fillRect(-LW / 2, 1100, LW, 22); for (let k = 0; k < 13; k++) { const x = -660 + k * 110; m.fillRect(x - 10, 1100, 20, 90); } };
  S6 = [
    sheet('#22100c', full, { depth: 0, trans: .9 }),
    sheet('#5a2a1a', m => { for (const [y, x0, x1] of [[-420, -700, -60], [-300, 120, 700], [-60, -700, -200]]) { m.beginPath(); m.ellipse((x0 + x1) / 2, y, (x1 - x0) / 2, 22, 0, 0, 7); m.fill(); } }, { depth: .2, trans: .45 }),
    wordSheet('Koyili', 230, 420, CREAM, .3),
    wordSheet('Kuhu  Kuhu', 210, 420, CREAM, .3),
    sheet('#0e0806', m => branch(m, BRANCH, 22, LB), { depth: .6, trans: .2, cut: m => veins(m, LB) }),
    sheet('#C8321E', m => { for (const [x, y, a] of [[420, -10, -1.4], [-60, 10, -1.7], [-420, -10, -1.2]]) panicle(m, x, y, a, 110, 8); }, { depth: .61, trans: .75 }),
    sheet('#05050c', m => cuckoo(m, -30, -82, 1.15), { depth: .62, trans: .03, rim: '#ffe2b0', rimA: .9, cut: m => { m.beginPath(); m.arc(-30 - 30 * 1.15, -82 - 36 * 1.15, 5, 0, 7); m.fill(); } }),
    sheet('#05050c', balcony, { depth: .95, trans: .03, cut: m => M.profileCuts(m, 1.0, 330, 1000), rim: '#ffd9a0', rimA: .8 }),
    wordSheet('Kuni  Kuni', 190, -660, CREAM, .3),
  ];
  S6.beak = [-30 - 80 * 1.15, -82 - 35 * 1.15];
  // S7 · dawn: the morning star, little blossoms, the sun and the golden oriole
  S7 = [
    sheet('#e6a585', full, { depth: 0, trans: .95 }),
    sheet('#7a3a2c', m => { m.beginPath(); m.moveTo(-LW / 2, 520); for (let x = -LW / 2; x <= LW / 2; x += 40) m.lineTo(x, 470 - 80 * Math.sin(x / 260 + 1) - 24 * Math.sin(x / 80)); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill(); }, { depth: .2, trans: .5 }),
    wordSheet('Pahantiya Tara', 135, -640, DEEP, .3),
    wordSheet('Chun Muni', 150, -500, DEEP, .3),
    wordSheet('Haladi Basanta', 128, -600, DEEP, .3),
    sheet('#2a1420', m => branch(m, BRANCH, 22, LB), { depth: .6, trans: .2, cut: m => veins(m, LB) }),
    sheet('#C8321E', m => { for (const [x, y, a] of [[420, -10, -1.4], [-60, 10, -1.7], [-420, -10, -1.2]]) panicle(m, x, y, a, 110, 8); }, { depth: .61, trans: .75 }),
    sheet('#F0A818', m => cuckoo(m, 150, -100, 1.35, 1), { depth: .62, trans: .5, rim: '#fff0c0', rimA: .8 }),
    sheet('#120806', m => { m.save(); m.translate(150, -100); m.scale(-1.35, 1.35);
      m.beginPath(); m.moveTo(-14, 4); m.quadraticCurveTo(40, -14, 100, 34); m.quadraticCurveTo(140, 58, 176, 70); m.quadraticCurveTo(110, 66, 60, 48); m.quadraticCurveTo(10, 34, -14, 4); m.fill();
      m.beginPath(); m.moveTo(150, 64); m.lineTo(196, 66); m.lineTo(188, 82); m.lineTo(148, 76); m.fill();
      m.beginPath(); m.moveTo(56, -31); m.quadraticCurveTo(34, -42, 12, -40); m.quadraticCurveTo(32, -34, 52, -26); m.fill(); m.restore(); }, { depth: .63, trans: .03 }),
    sheet('#C8321E', m => { m.save(); m.translate(150, -100); m.scale(-1.35, 1.35); m.beginPath(); m.moveTo(54, -40); m.lineTo(82, -35); m.lineTo(54, -27); m.fill(); m.restore(); }, { depth: .635, trans: .6 }),
    sheet('#1a0c14', balcony, { depth: .95, trans: .03, cut: m => M.profileCuts(m, 1.0, 330, 1000), rim: '#ffd9a0', rimA: .9 }),
  ];
  S7.beak = [150 + 80 * 1.35, -100 - 35 * 1.35];
}

// ---------- style layers mixed in where they ARE the metaphor ----------
const hsh = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };
// Huashu · Klimt gold period — "Mahani": the night turns to shimmering gold leaf around the moon (intoxication)
function goldLeaf(c, t, mx, my, z, amt) {
  if (amt <= 0) return; const T = 58, R = 1500 * amt;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  for (let gy = 0; gy < H + T; gy += T) for (let gx = 0; gx < W + T; gx += T) {
    const d = Math.hypot(gx + T / 2 - mx, gy + T / 2 - my); if (d > R) continue;
    const e = clamp((R - d) / 220), n = hsh(gx, gy), sh = .5 + .5 * Math.sin(t * 2.4 + n * 12 + (gx + gy) * .004);
    const r = 150 + 90 * n + 40 * sh, g = 96 + 70 * n + 34 * sh, b = 22 + 30 * n;
    c.globalAlpha = .5 * e; c.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`; c.fillRect(gx, gy, T - 1.5, T - 1.5);
  }
  // spirals and eyes, Klimt's motifs, turning and blinking
  for (let k = 0; k < 26; k++) { const x = hsh(k, 3) * W, y = 420 + hsh(k, 7) * (H * .62 - 420), d = Math.hypot(x - mx, y - my); if (d > R - 80) continue;
    c.globalAlpha = .85 * clamp((R - d) / 260); c.save(); c.translate(x, y);
    if (k % 3) { c.rotate(t * (k % 2 ? 1.1 : -1.1)); c.strokeStyle = '#ffe3a0'; c.lineWidth = 3; c.beginPath(); for (let j = 0; j < 30; j++) { const u = j / 29; c.lineTo(Math.cos(u * 12) * 26 * u, Math.sin(u * 12) * 26 * u); } c.stroke(); }
    else { const bl = Math.sin(2.2 * t + k) > .9 ? .15 : 1; c.fillStyle = '#ffe3a0'; c.beginPath(); c.ellipse(0, 0, 30, 13 * bl, 0, 0, 7); c.fill(); c.fillStyle = '#2a120e'; c.beginPath(); c.arc(0, 0, 7 * bl, 0, 7); c.fill(); }
    c.restore(); }
  // gold flakes drifting up
  for (let k = 0; k < 40; k++) { const u = (hsh(k, 1) + t * .05 * (1 + hsh(k, 2))) % 1, x = hsh(k, 5) * W + 30 * Math.sin(t + k), y = H * (1 - u); if (Math.hypot(x - mx, y - my) > R) continue; c.globalAlpha = .8 * amt; c.save(); c.translate(x, y); c.rotate(t * 2 + k); c.fillStyle = k % 2 ? '#ffd88a' : '#e8a83a'; c.fillRect(-5, -5, 10, 10); c.restore(); }
  // the sheen sweeps across on the downbeat
  const sw = seg(t, 15.63, 16.5); if (sw > 0 && sw < 1) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = .22; c.setTransform(1, 0, -.45, 1, 0, 0); const x0 = lerp(-400, W + 1200, sw), gr = c.createLinearGradient(x0 - 240, 0, x0 + 240, 0); gr.addColorStop(0, 'rgba(255,220,140,0)'); gr.addColorStop(.5, 'rgba(255,220,140,1)'); gr.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = gr; c.fillRect(x0 - 240, 0, 480, H); }
  c.restore();
}
// Huashu · Seurat pointillism — "Kuni kuni" (tiny, tiny): around every new star the sky breaks into tiny dots of colour
const STAR_T = [27.00, 27.57, 28.12, 28.57, 29.19, 29.71];
const DOTC = ['#f2b83e', '#e8705a', '#fff2dc', '#4f8f84', '#c8321e', '#f6d27a', '#7fb3a0', '#f09a6a'];
function pointillism(c, t, scr, L0) {
  if (t < 26.9) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = eo(seg(t, 29.6, 31.2));
  STARS.forEach(([sx, sy], i) => { const b = STAR_T[i]; if (t < b) return; const age = t - b, [x, y] = scr(L0, lerp(sx, STAR.x, g), lerp(sy, STAR.y, g)), R = (80 + 360 * eo(age / 1.6)) * (1 - .5 * g);
    for (let k = 0; k < 420; k++) { const a = hsh(i, k) * 6.283, q = Math.sqrt(hsh(k, i + 9)), rr = R * q, tw = .7 + .3 * Math.sin(t * 4 + k);
      c.globalAlpha = .9 * tw * (1 - q * .45) * seg(age, 0, .25) * (1 - .55 * seg(t, 30.4, 31.2)); c.fillStyle = DOTC[k % DOTC.length]; c.beginPath(); c.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr * .85, 4.5 + 3 * hsh(k, 3), 0, 7); c.fill(); } });
  c.restore();
}
// OVH watercolor-pastoral / Opuscar watercolour — dawn and spring arrive as wet paint blooming across the sky
const BLOOMS = [[31.18, -.3, .22, 380, '#e88a6a'], [33.41, .35, .3, 340, '#f2b07a'], [35.68, -.25, .48, 260, '#f6c25a'], [36.40, .3, .4, 240, '#e8786a'], [37.33, -.1, .3, 260, '#f2b83e'], [37.92, .4, .52, 220, '#e58a78'], [38.42, -.38, .36, 230, '#f6c25a'], [38.97, .1, .44, 250, '#ec9a5a'], [40.05, 0, .55, 560, '#f6c25a'], [42.30, -.2, .3, 420, '#f2b83e']];
function watercolour(c, t) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply';
  BLOOMS.forEach(([b, fx, fy, R0, col], i) => { if (t < b) return; const u = eo((t - b) / 2.0), x = W / 2 + fx * W, y = fy * H;
    for (let pass = 0; pass < 3; pass++) { const R = R0 * (.2 + .8 * u) * (1 - pass * .12);
      c.beginPath(); for (let k = 0; k <= 64; k++) { const a = k / 64 * 6.283, rr = R * (1 + .13 * Math.sin(a * 3 + i + pass) + .07 * Math.sin(a * 8 + i * 2 + pass * 3) + .04 * Math.sin(a * 17 + pass)); k ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * .8) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * .8); } c.closePath();
      c.fillStyle = col + (pass ? '18' : '24'); c.fill(); if (pass === 0) { c.strokeStyle = col + '70'; c.lineWidth = 2.2; c.stroke(); } }
    for (let k = 0; k < 90; k++) { const a = hsh(i, k) * 6.283, q = Math.sqrt(hsh(k, i)), rr = R0 * (.2 + .8 * u) * q; c.fillStyle = col + '38'; c.beginPath(); c.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr * .8, 1.2 + 1.6 * hsh(k, 2), 0, 7); c.fill(); } });
  c.restore();
}
// ---------- particles ----------
function dust(c, t, n, fn, col = 'rgba(255,214,150,1)', a = 1, seed = 1) {
  if (a <= 0) return; const R = mulberry(seed);
  for (let i = 0; i < n; i++) { const p = fn(i, R(), R(), R()); if (!p) continue; const [x, y, s, al] = p; const A = a * al; if (A <= .01) continue; glow(c, x, y, s * 3, col, A * .45); c.save(); c.globalAlpha = Math.min(1, A); c.fillStyle = '#fff1d6'; c.beginPath(); c.arc(x, y, s * .55, 0, 7); c.fill(); c.restore(); }
}
const fireflies = (c, t, n, a, seed) => dust(c, t, n, (i, r1, r2, r3) => { const x = (r1 * W + 60 * Math.sin(t * (.3 + r2) + i)) % W, y = H * (.15 + .7 * r2) + 40 * Math.sin(t * (.5 + r3) + i * 2); return [x, y, 3 + 3 * r3, .5 + .5 * Math.sin(t * (2 + r1 * 3) + i)]; }, 'rgba(255,220,140,1)', a, seed);
function gloss(c, txt, x, y, a, col = 'rgba(255,240,220,.88)') {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.font = '500 30px Cormorant'; c.letterSpacing = '9px'; c.fillStyle = col; c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 8; c.fillText(txt.toUpperCase(), x, y); c.restore();
}
const inout = (t, a, b, f = .5) => seg(t, a, a + f) * (1 - seg(t, b - f * .6, b));
const DARKG = 'rgba(90,24,14,.9)';

// ---------- scenes ----------
const SPELL_END = [0, -640];
// her palm's mandala grows out into the world: one ring per beat, alternate rings turning opposite ways
const RINGS = [[300, 1.18, 'petal', 14], [430, 1.74, 'dot', 30], [560, 2.28, 'spiral', 12], [700, 2.86, 'petal', 20], [850, 3.41, 'dot', 44], [1000, 3.97, 'spiral', 16]];
function mandala(c, px, py, z, t) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  RINGS.forEach(([R, b, kind, n], ri) => {
    const a = seg(t, b - .05, b + .5); if (a <= 0) return; const r = R * z * (0.85 + .15 * backE(a, 1.4)), rot = (ri % 2 ? -1 : 1) * (t - b) * .08;
    c.globalAlpha = Math.min(1, a) * .95;
    c.strokeStyle = 'rgba(170,90,30,.55)'; c.lineWidth = 3.5; c.beginPath(); c.arc(px, py, r, 0, 7); c.stroke(); c.strokeStyle = 'rgba(246,210,122,.8)'; c.lineWidth = 1.6; c.beginPath(); c.arc(px, py, r + 6 * z, 0, 7); c.stroke();
    for (let k = 0; k < n; k++) { const q = rot + k / n * Math.PI * 2, x = px + Math.cos(q) * r, y = py + Math.sin(q) * r, e = seg(t, b + k / n * .35, b + k / n * .35 + .25); if (e <= 0) continue;
      c.save(); c.translate(x, y); c.rotate(q + Math.PI / 2); const sc = backE(e, 1.6) * z * 2.1; c.scale(sc, sc); c.shadowColor = 'rgba(90,30,10,.55)'; c.shadowBlur = 6;
      if (kind === 'petal') { c.fillStyle = '#e9a83a'; c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(16, 0, 0, 26); c.quadraticCurveTo(-16, 0, 0, -30); c.fill(); c.fillStyle = '#C8321E'; c.beginPath(); c.arc(0, -2, 5, 0, 7); c.fill(); }
      else if (kind === 'dot') { c.fillStyle = k % 3 ? '#f6d27a' : '#C8321E'; c.beginPath(); c.arc(0, 0, k % 3 ? 5 : 7, 0, 7); c.fill(); }
      else { c.strokeStyle = '#f6d27a'; c.lineWidth = 3; c.rotate(t * .6 * (ri % 2 ? -1 : 1)); c.beginPath(); for (let j = 0; j < 24; j++) { const u = j / 23; c.lineTo(Math.cos(u * 11) * 22 * u, Math.sin(u * 11) * 22 * u); } c.stroke(); }
      c.restore(); }
    glow(c, px, py, r * .25, 'rgba(255,200,120,1)', .06 * pulse(t, b, b + 1));
  });
  c.restore();
}
const F_CLOSED = [.2, .05, -.12, -.3], F_OPEN = [-.16, -.02, .13, .32], F_BEAT = [2.28, 1.74, 1.18, .63];
function scA(c, t) {
  reset(SA);
  [0.07, .63, 2.28, 1.18, 1.18, 1.18, 1.18, 1.18, 1.18, 1.74].forEach((t0, i) => SA[i].lit = ss(seg(t, t0, t0 + .45)));
  const rise = eo(seg(t, .07, 1.6)), bob = 6 * Math.sin(t * 1.7);
  for (let i = 3; i <= 8; i++) SA[i].oy = lerp(760, 0, rise) + bob;
  FING.forEach(([a], fi) => { const L = SA[4 + fi]; L.pivot = [HX + a[0], HY + a[1]]; L.rot = lerp(F_CLOSED[fi], F_OPEN[fi], backE(seg(t, F_BEAT[fi], F_BEAT[fi] + .42), 1.6)) + .012 * Math.sin(t * 2.1 + fi); });
  SA[2].alpha = seg(t, 2.28, 2.8);
  const cam = { x: 0, y: lerp(60, -20, eio(seg(t, 0, 4.5))), z: lerp(1.0, 1.1, eio(seg(t, 0, 4.5))) }, scr = scrOf(cam);
  const [px, py, z] = scr(SA[3], HX, HY + 90);
  // the world turns to gold ornament, spreading from her palm on each beat
  const reach = 1700 * eo(seg(t, .63, 4.3)) * (.85 + .15 * Math.min(1, pulse(t, .6, 4.5, 2)));
  c.fillStyle = '#0c0405'; c.fillRect(0, 0, W, H);
  drawStack(c, SA, cam, { x: W / 2, y: H * .42, r: 1500, I: 1.05 * flick(t) }, { after: [(cc) => { const [x, y, z] = scr(SA[0], 0, -150); glow(cc, x, y, 260 * z, 'rgba(255,214,150,1)', .6); },
    (cc) => mandala(cc, px, py, z, t) ] });
  // a diagonal sheen of gold sweeps the frame on the beat the word arrives
  const sw = seg(t, 2.28, 3.4); if (sw > 0 && sw < 1) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .22; c.setTransform(1, 0, -.45, 1, 0, 0); const x0 = lerp(-400, W + 1200, sw); const g = c.createLinearGradient(x0 - 260, 0, x0 + 260, 0); g.addColorStop(0, 'rgba(255,220,140,0)'); g.addColorStop(.5, 'rgba(255,220,140,1)'); g.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = g; c.fillRect(x0 - 260, 0, 520, H); c.restore(); }
  const on = ss(seg(t, .07, 1.9)); c.save(); c.globalAlpha = .6 * (1 - on); c.fillStyle = '#080203'; c.fillRect(0, 0, W, H); c.restore();
  // the spell: gold dust spirals up out of her palm and gathers into one drop
  const [ex, ey] = scr(SA[0], ...SPELL_END);
  glow(c, px, py, 70 * z, 'rgba(255,200,120,1)', .5 * seg(t, 1.18, 1.8) * (1 + .6 * pulse(t, 1.18, 4.5)));
  const gather = ss(seg(t, 3.6, 4.4));
  dust(c, t, 110, (i, r1, r2) => { const born = 1.18 + r1 * 2.6, u = t - born; if (u < 0) return null; const a = r2 * 6.28 + u * 2.6, r = 30 + u * 150 * (.5 + r2), h = u * 230;
    const x = px + Math.cos(a) * r, y = py - h + Math.sin(a) * r * .35; return [lerp(x, ex, gather), lerp(y, ey, gather), 2.2 + 2 * r2, seg(u, 0, .2) * (1 - .5 * seg(u, 2.2, 3))]; }, 'rgba(255,205,130,1)', 1, 7);
  if (gather > 0) { glow(c, ex, ey, 40, 'rgba(255,190,110,1)', gather); drop(c, ex, ey, 16 * gather); }
  gloss(c, 'magic', W / 2, scr(SA[2], 0, -590)[1], SA[2].alpha * (1 - seg(t, 4.2, 4.5)), DARKG);
}
function drop(c, x, y, r) { if (r <= 0) return; c.save(); c.fillStyle = '#f0a23a'; c.beginPath(); c.moveTo(x, y - r * 2.1); c.quadraticCurveTo(x + r * 1.1, y - r * .1, x, y + r); c.quadraticCurveTo(x - r * 1.1, y - r * .1, x, y - r * 2.1); c.fill(); c.fillStyle = 'rgba(255,240,200,.9)'; c.beginPath(); c.arc(x - r * .3, y - r * .3, r * .28, 0, 7); c.fill(); c.restore(); }
function scB(c, t) {
  reset(SB);
  const land = 7.27, gold = ss(seg(t, land, land + 1.3));
  SB[1].alpha = gold; for (const i of [5, 7, 9]) SB[i].alpha = gold;
  SB[2].alpha = seg(t, 4.6, 5.1) * (1 - seg(t, 6.6, 6.95)); SB[3].alpha = seg(t, 6.73, 7.2);
  for (const i of [4, 5]) SB[i].ox = 30 * Math.sin(t * .8); for (const i of [6, 7]) SB[i].ox = -40 * Math.sin(t * .9 + 1); for (const i of [8, 9]) SB[i].ox = 50 * Math.sin(t * 1.1 + 2);
  const cam = { x: 0, y: lerp(-80, 160, eio(seg(t, 4.5, 9))), z: lerp(1.04, 1.12, eio(seg(t, 4.5, 9))) }, scr = scrOf(cam);
  c.fillStyle = '#0c0405'; c.fillRect(0, 0, W, H);
  const [sx, sy, z] = scr(SB[0], 0, 120);
  drawStack(c, SB, cam, { x: W / 2, y: H * .35, r: 1500, I: 1.0 * flick(t) }, { after: [null, (cc) => glow(cc, sx, sy, 300 * z, 'rgba(255,220,170,1)', .45 + .35 * gold)] });
  // salt: crystalline glints across the silver sea
  dust(c, t, 34, (i, r1, r2) => { const [x, y] = scr(SB[6], -560 + r1 * 1120, 160 + r2 * 520); return [x, y, 1.6 + r2 * 1.5, Math.max(0, Math.sin(t * 5 + i * 2.1))]; }, 'rgba(255,255,255,1)', seg(t, 4.6, 5.0) * (1 - gold), 5);
  // sweet: the drop hangs, swells on the beat and falls into the sea
  const [dx, dy0] = scr(SB[0], ...SPELL_END), [, sea] = scr(SB[4], 0, 150);
  if (t < land) { const fall = Math.max(0, t - 6.73), y = lerp(dy0, sea, Math.min(1, fall * fall / ((land - 6.73) ** 2))); glow(c, dx, y, 42, 'rgba(255,190,110,1)', .9); drop(c, dx, y, 16 + 4 * seg(t, 5.6, 6.7)); }
  const [rx, ry, rz] = scr(SB[4], 0, 150);
  for (let k = 0; k < 4; k++) { const u = seg(t, land + k * .27, land + k * .27 + 1.5); if (u <= 0 || u >= 1) continue; c.save(); c.strokeStyle = `rgba(255,214,140,${(1 - u) * .9})`; c.lineWidth = 3.5 * rz; c.shadowColor = 'rgba(255,170,80,.9)'; c.shadowBlur = 16; c.beginPath(); c.ellipse(rx, ry, (20 + 520 * eo(u)) * rz, (5 + 70 * eo(u)) * rz, 0, 0, 7); c.stroke(); c.restore(); }
  if (t > land) glow(c, rx, ry, 200 * rz, 'rgba(255,190,100,1)', .7 * (1 - seg(t, land, land + 1.6)));
  { const [lx, ly, lz] = scr(SB[4], 0, 150), rise = eo(seg(t, 7.8, 8.9)); filigree(c, lx, ly - 90 * rise * lz, lz * 1.7, seg(t, 7.7, 8.8)); }
  const [, wy] = scr(SB[2], 0, -520);
  gloss(c, 'salty lips', W / 2, wy, SB[2].alpha, DARKG); gloss(c, 'sweetness drips', W / 2, wy, SB[3].alpha * (1 - seg(t, 8.6, 8.96)), DARKG);
}
const FIL = (() => { const S = [];   // strokes of a filigree lotus (unit ≈ px at z=1), base at (0,0)
  for (let k = -3; k <= 3; k++) { const a = k * .3, L = 230 * (1 - Math.abs(k) * .09), w = 58, tip = [Math.sin(a) * L, -Math.cos(a) * L], n = [Math.cos(a), Math.sin(a)];
    const side = sg => { const P = []; for (let i = 0; i <= 24; i++) { const u = i / 24, b = Math.sin(Math.PI * u) * w * sg; P.push([tip[0] * u + n[0] * b, tip[1] * u + n[1] * b]); } return P; };
    S.push(side(1), side(-1));
    for (const u0 of [.32, .62]) { const c0 = [tip[0] * u0, tip[1] * u0], P = []; for (let i = 0; i <= 26; i++) { const q = i / 26, r = 22 * (1 - q) + 2; P.push([c0[0] + Math.cos(q * 11 + k) * r, c0[1] + Math.sin(q * 11 + k) * r]); } S.push(P); } }
  { const P = []; for (let i = 0; i <= 30; i++) { const q = i / 30; P.push([-170 + 340 * q, 24 * Math.sin(Math.PI * q)]); } S.push(P); }
  { const P = []; for (let i = 0; i <= 20; i++) { const q = i / 20; P.push([10 * Math.sin(q * 9), 24 + q * 160]); } S.push(P); }
  return S; })();
function filigree(c, x, y, z, p) {
  if (p <= 0) return; c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [col, lw, sh] of [['#4a1e08', 6.5, 0], ['#ffe8a8', 2.4, 10]]) { c.strokeStyle = col; c.lineWidth = lw * z; c.shadowColor = 'rgba(255,190,90,.9)'; c.shadowBlur = sh;
    FIL.forEach((P, i) => { const st = i / FIL.length * .55, q = clamp((p - st) / .45); if (q <= 0) return; const n = Math.max(2, Math.floor(P.length * q)); c.beginPath(); for (let j = 0; j < n; j++) c.lineTo(x + P[j][0] * z, y + P[j][1] * z); c.stroke(); }); }
  c.restore();
}
function scC(c, t) {
  reset(SC);
  SC[6].alpha = 0; SC[7].oy = 430; SC[5].oy = 3 * Math.sin(t * 1.4); SC[5].pivot = [0, NAPE + 60]; SC[5].rot = -.1 * eio(seg(t, 9.6, 11.8)) + .015 * Math.sin(t * .9);
  SC[2].alpha = seg(t, 9.52, 10.1);
  const u = eio(seg(t, 8.96, 13.6)), cam = { x: lerp(-40, 60, u), y: lerp(520, -320, u), z: lerp(1.08, 1.0, u) }, scr = scrOf(cam);
  c.fillStyle = '#0c0405'; c.fillRect(0, 0, W, H);
  drawStack(c, SC, cam, { x: W * .55, y: H * .25, r: 1600, I: 1.0 * flick(t) }, { after: [(cc) => { const [x, y, z] = scr(SC[0], 300, 60); glow(cc, x, y, 170 * z, 'rgba(255,230,170,1)', .75); }] });
  // the scent of her: golden ribbons rising off her pallu toward the blossoms, swelling on the beats
  const [wx, wy, z] = scr(SC[5], 0, NAPE - 30), sw = 1 + .7 * pulse(t, 8.96, 13.4, 2.5);
  dust(c, t, 130, (i, r1, r2, r3) => { const u = ((t - 8.96) * (.25 + .2 * r2) + r1) % 1.6; const lane = i % 4; const x = wx + (lane - 1.5) * 50 * z + 150 * Math.sin(u * 3.2 + lane * 1.6) * z * Math.min(1, u * 2), y = wy - u * 1000 * z; return [x, y, (1.8 + 2.4 * r3) * sw, seg(u, 0, .15) * (1 - seg(u, 1.0, 1.6)) * .85]; }, 'rgba(255,214,140,1)', seg(t, 9.3, 10.0), 11);
  gloss(c, 'mango blossom · the scent of her', W / 2, scr(SC[2], 0, -260)[1], SC[2].alpha * (1 - seg(t, 13.0, 13.4)), DARKG);
}
function scD(c, t) {
  reset(SD);
  SD[2].alpha = seg(t, 14.0, 14.6) * (1 - seg(t, 16.6, 17.0));
  const sink = eio(seg(t, 16.9, 17.95)), sway = Math.sin(t * 1.1) * 30 * seg(t, 15.0, 15.8);
  const rise = eo(seg(t, 13.4, 15.2)), MX = 120, MY = lerp(320, -380, rise);
  const cam0 = { x: sway, y: lerp(40, -30, eio(seg(t, 13.4, 16.9))), z: 1.05 };
  const cam = { x: lerp(cam0.x, MX / .45, sink * .0), y: cam0.y, z: cam0.z };
  // dive into the moon: compute a camera that centres it and zooms
  const scr0 = scrOf(cam0), [mx0, my0] = scr0(SD[0], MX, MY);
  const cz = lerp(1.05, 5.5, Math.pow(sink, 1.6)), c2 = { x: cam0.x + (mx0 - W / 2) / .45 * sink / 1.1, y: cam0.y + (my0 - H / 2) / .45 * sink / 1.1, z: cz };
  const C = sink > 0 ? c2 : cam0, scr = scrOf(C), [mx, my, z] = scr(SD[0], MX, MY);
  c.fillStyle = '#04050c'; c.fillRect(0, 0, W, H);
  drawStack(c, SD, C, { x: mx, y: my, r: 1500, I: .85 * flick(t) }, {
    after: [(cc) => { goldLeaf(cc, t, mx, my, z, eo(seg(t, 14.0, 15.7)) * (1 - seg(t, 17.3, 17.9))); glow(cc, mx, my, 230 * z, 'rgba(255,226,170,1)', .5); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.fillStyle = '#fff0d4'; cc.beginPath(); cc.arc(mx, my, 150 * z, 0, 7); cc.fill(); cc.restore(); },
      null, null,
      (cc) => {   // the moon in the water, wavering (intoxicated)
        const [rx, ry, rz] = scr(SD[3], MX, 360 + (360 - MY) * .35); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0);
        for (let k = 0; k < 9; k++) { const w = (150 - k * 9) * rz * (1 + .25 * Math.sin(t * 3 + k)), y = ry + k * 24 * rz, dx = 34 * rz * Math.sin(t * 2.2 + k * .9) * (1 + seg(t, 15.0, 15.6)); cc.globalAlpha = .55 * (1 - k / 10) * seg(t, 13.8, 14.6); cc.fillStyle = '#ffe6b8'; cc.beginPath(); cc.ellipse(rx + dx, y, w, 5 * rz, 0, 0, 7); cc.fill(); }
        cc.restore(); }],
  });
  fireflies(c, t, 46, seg(t, 13.2, 13.9), 21);
  gloss(c, 'enchantment · drunk on you', W / 2, scr(SD[2], 0, -590)[1], SD[2].alpha * (1 - seg(t, 16.9, 17.3)));
}
function sc5(c, t) {
  const L = S5; reset(L);
  let ix = 0; const bs = BEATS.filter(b => b >= 17.86 && b < 22.29), pos = [-150, 130, -60, 160, -140, 90, -170, 120, 0];
  for (let i = 0; i < bs.length; i++) if (t >= bs[i]) ix = lerp(i ? pos[i - 1] : 0, pos[i], backE(seg(t, bs[i], bs[i] + .2), 1.2));
  L[3].ox = ix; L[3].oy = -16 * Math.sin(t * 1.3);
  const kj = seg(t, 20.06, 20.64); L[6].ox = 820 * (1 - backE(kj, .9)); L[6].alpha = kj > 0 ? 1 : 0;
  L[7].alpha = seg(t, 18.0, 18.4) * (1 - seg(t, 19.8, 20.1)); L[7].oy = 30 * (1 - eo(seg(t, 18.0, 18.6)));
  L[8].alpha = seg(t, 20.64, 21.1) * (1 - seg(t, 22.0, 22.29)); L[8].oy = 30 * (1 - eo(seg(t, 20.64, 21.3)));
  const rack = ss(seg(t, 20.06, 20.7)); for (const i of [0, 1, 2, 3]) L[i].blur = 2 * rack;
  const dive = eio(seg(t, 21.9, 22.4)), open = eo(seg(t, 17.86, 18.5));
  const cam = { x: 0, y: lerp(10, 0, eio(seg(t, 17.86, 22))), z: lerp(lerp(1.35, 1.0, open), 1.08, eio(seg(t, 18.5, 21.9))) * (1 + 1.6 * dive) }, scr = scrOf(cam);
  c.fillStyle = '#05050d'; c.fillRect(0, 0, W, H);
  drawStack(c, L, cam, { x: W / 2, y: H / 2 - 120, r: 1300, I: 1.0 * flick(t) }, { after: [(cc) => { const [mx, my, z] = scr(L[0], 250, -250); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); glow(cc, mx, my, 90 * z, 'rgba(255,220,160,1)', .5); cc.fillStyle = '#ffeccc'; cc.beginPath(); cc.arc(mx, my, 62 * z, 0, 7); cc.fill(); cc.restore(); }] });
  const [px, py, z] = scr(L[3], 0, 0); glow(c, px, py, 50 * z, 'rgba(255,200,130,1)', .35 + .4 * pulse(t, 17.86, 22.29)); c.save(); c.globalAlpha = .85; c.fillStyle = '#fff3dc'; c.beginPath(); c.ellipse(px - 70 * z, py - 80 * z, 22 * z, 14 * z, -.5, 0, 7); c.fill(); c.restore();
  gloss(c, 'restless eyes', W / 2, scr(L[7], 0, -600)[1], L[7].alpha);
  gloss(c, 'the kohl line', W / 2, scr(L[8], 0, 590)[1], L[8].alpha);
  const da = seg(t, 19.7, 20.0) * (1 - seg(t, 21.6, 22.0));
  if (da > 0) { const [fx0, fy0, fz0] = scr(L[5], EW / 2 - 110, EH * .6), fz = fz0 * 1.7, fx = fx0, fy = fy0, [lx, ly] = scr(L[6], -EW / 2 + L[6].ox, -EH * .5);
    c.save(); c.globalAlpha = da; c.fillStyle = '#c98a2e'; c.beginPath(); c.moveTo(fx - 46 * fz, fy + 20 * fz); c.quadraticCurveTo(fx, fy + 62 * fz, fx + 46 * fz, fy + 20 * fz); c.lineTo(fx + 60 * fz, fy + 12 * fz); c.closePath(); c.fill(); c.restore();
    glow(c, fx + 50 * fz, fy, 30 * fz, 'rgba(255,170,80,1)', .6 * da); c.save(); c.globalAlpha = da; c.fillStyle = '#ffe2a8'; c.beginPath(); c.moveTo(fx + 50 * fz, fy - 30 * fz); c.quadraticCurveTo(fx + 60 * fz, fy - 4 * fz, fx + 50 * fz, fy + 8 * fz); c.quadraticCurveTo(fx + 40 * fz, fy - 4 * fz, fx + 50 * fz, fy - 30 * fz); c.fill(); c.restore();
    const R = mulberry(61), sm = seg(t, 19.9, 20.7) * (1 - seg(t, 21.2, 21.9));
    for (let k = 0; k < 70; k++) { const u = (R() + (t - 19.9) * .6) % 1, x = lerp(fx + 50 * fz, lx, u) + (R() - .5) * 40 * fz, y = lerp(fy - 40 * fz, ly, u) - Math.sin(Math.PI * u) * 120 * fz + 14 * Math.sin(t * 3 + k) * fz; c.save(); c.globalAlpha = .1 * sm * (1 - Math.abs(u - .5) * 1.4); c.fillStyle = '#f0e0cc'; c.beginPath(); c.arc(x, y, (10 + 18 * R()) * fz, 0, 7); c.fill(); c.restore(); } }
}
const MOON = [0, -200];
function sc6(c, t) {
  const L = S6; reset(L);
  const fly = seg(t, 22.29, 22.83); L[6].ox = lerp(-760, 0, eo(fly)); L[6].oy = lerp(-420, 0, eo(fly)) - 22 * Math.sin(Math.PI * fly) + (t > 22.83 ? -7 * Math.sin(seg(t, 22.83, 23.1) * Math.PI) : 0) + (t > 24.52 ? -6 * pulse(t, 24.52, 26.73, 6) : 0);
  L[2].alpha = seg(t, 22.83, 23.3) * (1 - seg(t, 24.1, 24.45)); L[3].alpha = seg(t, 24.52, 24.95) * (1 - seg(t, 26.3, 26.7)); L[8].alpha = seg(t, 26.9, 27.5);
  L[1].ox = 40 * Math.sin(t * .3);
  const lat = eio(seg(t, 22.29, 24.6)), out = eio(seg(t, 24.52, 26.6)), lift = eio(seg(t, 26.73, 31.0));
  const cam = { x: lerp(-60, 60, lat) * (1 - out), y: lerp(-40, 250, out) - 120 * lift, z: lerp(1.18, .93, out) };
  const scr = scrOf(cam), moonSet = eio(seg(t, 27.5, 31.2)), [mx, my, z] = scr(L[0], MOON[0], MOON[1] + 520 * moonSet);
  c.fillStyle = '#04050c'; c.fillRect(0, 0, W, H);
  drawStack(c, L, cam, { x: mx, y: my, r: 1500, I: .9 * flick(t) * (1 - .25 * moonSet) }, {
    after: [(cc) => { glow(cc, mx, my, 400 * z, 'rgba(255,220,160,1)', .4 * (1 - .5 * moonSet)); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.globalAlpha = 1 - .35 * moonSet; const g = cc.createRadialGradient(mx - 60 * z, my - 60 * z, 40 * z, mx, my, 430 * z); g.addColorStop(0, '#fff6e2'); g.addColorStop(1, '#ffd9a0'); cc.fillStyle = g; cc.beginPath(); cc.arc(mx, my, 430 * z, 0, 7); cc.fill(); cc.restore(); },
      (cc) => {   // kuni kuni: tiny stars open, one on every "kuni", then drift together
        pointillism(cc, t, scr, L[0]); if (t < 26.6) return; const ks = STAR_T;
        STARS.forEach(([sx, sy], i) => { const b = ks[i]; if (b === undefined || t < b - .05) return; const g = eo(seg(t, 31.0 - 1.4, 31.2)); const [x, y] = scr(L[0], lerp(sx, STAR.x, g), lerp(sy, STAR.y, g)); star4(cc, x, y, (10 + 6 * Math.exp(-(t - b) * 4)) * (1 - .4 * g), seg(t, b - .05, b + .12) * (.75 + .25 * Math.sin(t * 6 + i))); });
      }],
  });
  if (t > 24.4 && t < 27) { const [bx, by, zz] = scr(L[6], ...S6.beak); BEATS.filter(b => b >= 24.52 && b <= t && b < 26.73).forEach(b => { const u = seg(t, b, b + 1.1); if (u >= 1) return; c.save(); c.strokeStyle = `rgba(255,214,150,${(1 - u) * .9})`; c.lineWidth = 3.5 * zz; c.shadowColor = 'rgba(255,170,90,.9)'; c.shadowBlur = 16; c.beginPath(); c.arc(bx, by, (20 + 300 * eo(u)) * zz, Math.PI * .65, Math.PI * 1.35); c.stroke(); c.restore(); }); }
  fireflies(c, t, 36, 1 - seg(t, 29, 31), 33);
  { const f = ss(seg(t, 30.55, 31.0)); if (f > 0) { const [x, y] = scr(L[0], STAR.x, STAR.y); glow(c, x, y, 500, 'rgba(255,236,200,1)', f); c.save(); c.globalAlpha = .85 * f; c.fillStyle = '#fff3e0'; c.fillRect(0, 0, W, H); c.restore(); } }
  gloss(c, 'her voice · a cuckoo', W / 2, scr(L[2], 0, 560)[1], L[2].alpha);
  gloss(c, 'sings', W / 2, scr(L[3], 0, 560)[1], L[3].alpha);
  gloss(c, 'tiny, tiny', W / 2, scr(L[8], 0, -555)[1], L[8].alpha * (1 - seg(t, 30.6, 31.1)));
}
const STARS = [[-380, -560], [300, -620], [-120, -700], [420, -420], [-460, -260], [140, -500]];
const STAR = { x: -260, y: -360 };
function sc7(c, t) {
  const L = S7; reset(L);
  const sun = eo(seg(t, 39.6, 43.0)), bloomCam = eio(seg(t, 35.3, 36.2)), finale = eio(seg(t, 40.05, 43.5));
  L[2].alpha = seg(t, 31.6, 32.2) * (1 - seg(t, 35.2, 35.6)); L[3].alpha = seg(t, 35.7, 36.2) * (1 - seg(t, 39.7, 40.05)); L[4].alpha = seg(t, 40.4, 41.0);
  const fly = seg(t, 40.05, 40.63); for (const i of [7, 8, 9]) { L[i].alpha = t >= 40.0 ? 1 : 0; L[i].ox = lerp(760, 0, eo(fly)); L[i].oy = lerp(-460, 0, eo(fly)) - 24 * Math.sin(Math.PI * fly) + (t > 40.63 ? -7 * Math.sin(seg(t, 40.63, 40.9) * Math.PI) - 5 * pulse(t, 40.63, 44, 6) : 0); }
  const crane = eio(seg(t, 31.0, 33.9)), track = eio(seg(t, 35.6, 40.0));
  const cam = { x: lerp(lerp(-120, -60, crane), lerp(-120, 120, track), bloomCam * (1 - finale)) * (1 - finale * .6), y: lerp(lerp(420, 40, crane), -60, bloomCam) + 190 * finale, z: lerp(lerp(.93, 1.05, crane), 1.28, bloomCam) - .33 * finale };
  const scr = scrOf(cam), [sx, sy, z] = scr(L[0], 160, lerp(560, 120, sun));
  c.fillStyle = '#0c0408'; c.fillRect(0, 0, W, H);
  const warm = ss(seg(t, 39.8, 42.5));
  drawStack(c, L, cam, { x: sx, y: sy - 200, r: 1700, I: (.85 + .35 * warm) * flick(t) }, {
    after: [(cc) => {
      cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0);
      watercolour(cc, t); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0);
      const g = cc.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(90,32,24,${.55 * (1 - warm)})`); g.addColorStop(.6, 'rgba(255,170,140,0)'); g.addColorStop(1, `rgba(255,190,120,${.35 + .3 * warm})`); cc.fillStyle = g; cc.fillRect(0, 0, W, H);
      if (sun > 0) { glow(cc, sx, sy, 330 * z, 'rgba(255,200,110,1)', .65 * sun); cc.fillStyle = '#ffe9b0'; cc.beginPath(); cc.arc(sx, sy, 170 * z, 0, 7); cc.fill(); }
      // the morning star
      const sa = seg(t, 31.0, 31.6) * (1 - seg(t, 40.5, 42)), [x, y, zz] = scr(L[0], STAR.x, STAR.y);
      if (sa > 0) { const pb = pulse(t, 31.18, 35.6, 2.5); cc.save(); cc.globalCompositeOperation = 'lighter'; cc.translate(x, y); cc.rotate(t * .35); for (let k = 0; k < 8; k++) { cc.rotate(Math.PI / 4); const L = (160 + 260 * pb) * zz * (k % 2 ? .55 : 1); const gr = cc.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, `rgba(255,236,200,${.5 * sa})`); gr.addColorStop(1, 'rgba(255,236,200,0)'); cc.fillStyle = gr; cc.beginPath(); cc.moveTo(0, -4 * zz); cc.lineTo(L, 0); cc.lineTo(0, 4 * zz); cc.fill(); } cc.restore(); const r = (34 + 6 * Math.sin(t * 3) + 14 * pb) * zz; glow(cc, x, y, r * 3.2, 'rgba(255,230,190,1)', .6 * sa); star4(cc, x, y, r, sa); cc.save(); cc.globalAlpha = .35 * sa; cc.fillStyle = '#fff6e0'; cc.fillRect(x - r * 7, y - 1.5, r * 14, 3); cc.fillRect(x - 1.5, y - r * 7, 3, r * 14); cc.restore(); }
      cc.restore();
    }],
  });
  // chun muni: little blossoms pop open along the branch, one per syllable
  const cb = [35.68, 36.40, 37.33, 37.92, 38.42, 38.97];
  BUDS.forEach(([bx, by, col], i) => { const b = cb[i % cb.length] + (i >= cb.length ? .27 : 0); if (t < b) return; const [x, y, zz] = scr(L[5], bx, by); flower(c, x, y, 36 * zz, seg(t, b, b + .35), col); });
  { const f = 1 - ss(seg(t, 31.0, 31.8)); if (t >= 31.0 && f > 0) { c.save(); c.globalAlpha = .85 * f; c.fillStyle = '#fff3e0'; c.fillRect(0, 0, W, H); c.restore(); } }
  // a flock crosses the dawn sky
  if (t > 31.8 && t < 36.4) for (let k = 0; k < 9; k++) { const u = seg(t, 31.8 + k * .08, 35.9 + k * .08), x = lerp(W + 120, -160, u) + (k % 3) * 46, y = H * (.2 + .03 * (k % 4)) - 70 * Math.sin(u * 3) + (k >> 1) * 22, fl = Math.sin(t * 13 + k) * 9, s = 1 + (k % 3) * .2;
    c.save(); c.globalAlpha = .82 * Math.sin(Math.PI * u); c.strokeStyle = '#3a1a14'; c.lineWidth = 3.2 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 15 * s, y - fl); c.quadraticCurveTo(x - 6 * s, y - 5, x, y + 2); c.quadraticCurveTo(x + 6 * s, y - 5, x + 15 * s, y - fl); c.stroke(); c.restore(); }
  // haladi basanta: a shower of alta and gold petals sweeps across on the downbeats
  for (const pb of [40.05, 42.30]) { if (t < pb || t > pb + 2.2) continue; const u = t - pb; for (let k = 0; k < 46; k++) { const sp = 700 + hsh(k, pb) * 700, x = W + 80 - u * sp + hsh(k, 1) * 300, y = hsh(k, 2) * H * .9 + u * 260 + 40 * Math.sin(u * 4 + k); if (x < -60) continue;
    c.save(); c.translate(x, y); c.rotate(u * 5 + k); c.fillStyle = ['#C8321E', '#F2B83E', '#E8962C', '#fff1c8'][k % 4]; c.globalAlpha = .9; c.beginPath(); c.ellipse(0, 0, 13, 7, 0, 0, 7); c.fill(); c.restore(); } }
  // sunrise rays
  if (warm > 0) { c.save(); c.globalCompositeOperation = 'screen'; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k - 4.5) * .2 + .03 * Math.sin(t * .5 + k); const gr = c.createRadialGradient(sx, sy, 0, sx, sy, 1500); gr.addColorStop(0, `rgba(255,214,150,${.22 * warm})`); gr.addColorStop(1, 'rgba(255,190,120,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(sx, sy); c.arc(sx, sy, 1600, a - .045, a + .045); c.fill(); } c.restore(); }
  dust(c, t, 40, (i, r1, r2, r3) => [((r1 + t * .02 * (r3 + .2)) % 1) * W, H * (.25 + .5 * r2) + 30 * Math.sin(t + i), 2 + 2 * r3, .35 + .35 * Math.sin(t * 2 + i)], 'rgba(255,220,150,1)', seg(t, 31.5, 32.5), 41);
  gloss(c, 'my morning star', W / 2, scr(L[2], 0, -555)[1], L[2].alpha, DARKG);
  gloss(c, 'my little darling', W / 2, scr(L[3], 0, -400)[1], L[3].alpha, DARKG);
  gloss(c, 'golden oriole · my spring', W / 2, scr(L[4], 0, -515)[1], L[4].alpha, DARKG);
}
const BUDS = [[-330, -36, '#F2B83E'], [-120, -28, '#E8962C'], [60, 18, '#F2B83E'], [250, -6, '#C8321E'], [420, -14, '#F2B83E'], [-500, -20, '#E8962C'], [-250, -10, '#C8321E'], [160, 12, '#F2B83E'], [330, 0, '#E8962C'], [-30, 22, '#F2B83E'], [520, 6, '#C8321E'], [-420, 2, '#F2B83E']];

// ---------- render ----------
function occWipe(c, t, t0, d, A, B) {   // a near-plane mango branch sweeps right→left; the next scene is behind it
  const p = eio(seg(t, t0, t0 + d)), ox = lerp(W + 520, -560, p);
  A(c, t); const b = BUF.getContext('2d'); b.setTransform(1, 0, 0, 1, 0, 0); B(b, t);
  c.save(); c.beginPath(); c.rect(ox, 0, W - ox + 10, H); c.clip(); c.drawImage(BUF, 0, 0); c.restore();
  c.save(); c.translate(ox, H / 2); c.rotate(-.12); c.fillStyle = '#140806';
  c.lineCap = 'round'; c.strokeStyle = '#140806'; c.lineWidth = 70; c.beginPath(); c.moveTo(60, -H); c.quadraticCurveTo(-40, 0, 40, H); c.stroke();
  const R = mulberry(5); for (let k = 0; k < 26; k++) { const y = -H * .55 + k * 82, x = (R() - .5) * 120, a = (k % 2 ? 1 : -1) * (1.1 + R() * .6), L = 260 + R() * 160; c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(L * .5, -L * .22, L, 0); c.quadraticCurveTo(L * .5, L * .22, 0, 0); c.fill(); c.restore(); }
  c.fillStyle = 'rgba(200,50,30,.9)'; for (let k = 0; k < 7; k++) { const y = -H * .4 + k * 260; for (let j = 0; j < 12; j++) { c.beginPath(); c.arc(80 + j * 10 + (j % 2 ? 9 : -9), y + j * 14, 11 - j * .6, 0, 7); c.fill(); } }
  c.restore();
}
function xfade(c, t, t0, d, A, B) { const a = ss(seg(t, t0, t0 + d)); if (a <= 0) return A(c, t); if (a >= 1) return B(c, t); A(c, t); const b = BUF.getContext('2d'); b.setTransform(1, 0, 0, 1, 0, 0); B(b, t); c.globalAlpha = a; c.drawImage(BUF, 0, 0); c.globalAlpha = 1; }
const SEQ = [[4.35, scA], [8.75, scB], [13.2, scC], [17.85, scD], [22.15, sc5], [31.0, sc6], [99, sc7]];
const XD = [.35, .55, .6, .35, .35, .25];
const FROM = Number(Q.get('from') || 0), TO = Number(Q.get('to') || DUR);
window.DUR = TO - FROM;
window.render = t0 => {
  const t = t0 + FROM;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  let i = 0; while (t >= SEQ[i][0]) i++;
  const prev = i > 0 ? SEQ[i - 1] : null;
  if (prev && t < prev[0] + XD[i - 1]) (i === 2 ? occWipe : xfade)(ctx, t, prev[0], XD[i - 1], SEQ[i - 1][1], SEQ[i][1]);
  else SEQ[i][1](ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .32, W / 2, H / 2, H * .78); v.addColorStop(0, 'rgba(10,4,6,0)'); v.addColorStop(1, 'rgba(10,4,6,.42)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  const end = ss(seg(t, 43.55, 43.87)); if (end > 0) { ctx.globalAlpha = end * .5; ctx.fillStyle = '#2a1006'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
};
window.TEXTS = t => [];
window.EV = [0.07, 4.5, 8.96, 13.4, 17.86, 20.06, 22.29, 24.52, 26.73, 31.18, 35.6, 40.05].map((t, i) => ({ t, type: 'line', i }));

(async () => {
  const base = new URL('.', import.meta.url).href;
  for (const f of ['200px "Pinyon Script"', '500 30px Cormorant']) await document.fonts.load(f, 'Jadu');
  const [fibre, pulp] = await Promise.all([load(base + 'assets/fibre.png'), load(base + 'assets/pulp.png')]);
  initLightbox(fibre, pulp); build();
  window.render(Number(Q.get('t') || 0)); window.READY = true;
})();
