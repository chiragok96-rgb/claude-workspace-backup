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
function hand(m) {
  m.beginPath(); [[-112, 900], [-120, 380], [-130, 250], [-150, 120], [-152, -20], [-130, -112], [-96, -150], [100, -150], [132, -100], [146, 0], [140, 120], [124, 250], [114, 380], [108, 900]].forEach((p, i) => i ? m.lineTo(...p) : m.moveTo(...p)); m.closePath(); m.fill();
  for (const [a, b, w] of FING) cap(m, a, b, w);
  m.save(); m.lineCap = 'round'; m.lineJoin = 'round'; m.lineWidth = 74; m.strokeStyle = '#000'; m.beginPath(); m.moveTo(-120, 120); m.quadraticCurveTo(-210, 40, -290, -130); m.stroke(); m.restore();
}
function mehndi(m) {   // henna as cut lace: mandala on the palm, bands and dots on the fingers, a vine, a wrist lattice
  const C = [0, 90];
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; m.save(); m.translate(C[0] + Math.cos(a) * 80, C[1] + Math.sin(a) * 80); m.rotate(a); m.beginPath(); m.ellipse(0, 0, 24, 9, 0, 0, 7); m.fill(); m.restore(); }
  for (let k = 0; k < 28; k++) { const a = k / 28 * Math.PI * 2; m.beginPath(); m.arc(C[0] + Math.cos(a) * 116, C[1] + Math.sin(a) * 116, 5, 0, 7); m.fill(); }
  m.save(); m.lineWidth = 5; m.strokeStyle = '#000'; m.beginPath(); m.arc(...C, 48, 0, 7); m.stroke(); m.restore(); m.beginPath(); m.arc(...C, 17, 0, 7); m.fill();
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + .2; m.beginPath(); m.ellipse(C[0] + Math.cos(a) * 31, C[1] + Math.sin(a) * 31, 7, 3, a, 0, 7); m.fill(); }
  for (const [[x0, y0], [x1, y1], w] of FING) for (const u of [.35, .62, .86]) {
    const x = lerp(x0, x1, u), y = lerp(y0, y1, u), a = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2;
    m.save(); m.translate(x, y); m.rotate(a); if (u < .8) { m.fillRect(-w * .36, -2.5, w * .72, 5); m.fillRect(-w * .3, 9, w * .6, 3); } else { for (const d of [-1, 0, 1]) { m.beginPath(); m.arc(d * w * .22, 0, 4.5, 0, 7); m.fill(); } } m.restore();
  }
  for (let k = 0; k < 7; k++) { const y = -40 - k * 30, x = -14 + (k % 2 ? 10 : -10); m.save(); m.translate(x, y); m.rotate(k % 2 ? .7 : -.7); m.beginPath(); m.ellipse(0, 0, 11, 4.5, 0, 0, 7); m.fill(); m.restore(); }
  m.save(); m.lineWidth = 4; m.strokeStyle = '#000'; m.beginPath(); for (let k = 0; k <= 12; k++) m.lineTo(-108 + k * 18, 440 + (k % 2 ? -16 : 16)); m.stroke(); m.restore();
  for (let k = 0; k < 6; k++) { m.beginPath(); m.arc(-75 + k * 30, 400, 4, 0, 7); m.fill(); }
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
    sheet('#3a1210', m => { m.save(); m.translate(HX, HY); hand(m); m.restore(); }, { depth: .8, trans: .2, rim: '#ffcf8a', rimA: .9, cut: m => { m.save(); m.translate(HX, HY); mehndi(m); m.restore(); } }),
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
    sheet('#2a1010', m => walker(m, -20, 640, 1.5), { depth: .75, trans: .05, rim: '#ffb46a', rimA: .9, cut: m => walkerCuts(m, -20, 640, 1.5) }),
    sheet('#9a1c14', m => pallu(m, -20, 640, 1.5), { depth: .76, trans: .5, rim: '#ffd08a', rimA: .9, cut: m => palluCuts(m, -20, 640, 1.5) }),
    sheet('#1e0b08', m => { m.fillRect(-LW / 2, 660, LW, LH); for (let k = 0; k < 22; k++) { const x = -660 + k * 62; m.beginPath(); m.moveTo(x - 8, 662); m.quadraticCurveTo(x + (k % 3 - 1) * 14, 600 - (k % 4) * 14, x + 4, 662); m.fill(); } }, { depth: 1, trans: .03 }),
  ];
  // SD · moonrise over the lotus pond
  SD = [
    sheet('#1c2250', full, { depth: 0, trans: .9 }),
    sheet('#2c3570', m => { m.beginPath(); m.moveTo(-LW / 2, 260); for (let x = -LW / 2; x <= LW / 2; x += 40) m.lineTo(x, 230 - 70 * Math.sin(x / 230) - 26 * Math.sin(x / 70)); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill(); }, { depth: .2, trans: .55 }),
    wordSheet('Mahani', 250, -720, CREAM, .3),
    sheet('#121736', m => { m.fillRect(-LW / 2, 300, LW, LH); }, { depth: .45, trans: .25, cut: m => { for (let r = 0; r < 7; r++) m.fillRect(-LW / 2, 360 + r * 70 + r * r * 6, LW, 2.5); } }),
    sheet('#1d3a2c', m => { lily(m, -330, 600, 150, 34); lily(m, 280, 680, 190, 40); lily(m, -80, 820, 130, 30); lily(m, 380, 470, 110, 24); }, { depth: .6, trans: .2 }),
    sheet('#C8321E', m => { lotus(m, -240, 590, .9); lotus(m, 200, 668, 1.1); }, { depth: .62, trans: .75 }),
    sheet('#07060f', m => { m.fillRect(-LW / 2, 900, LW, LH); for (const [x0, sgn] of [[-560, 1], [560, -1]]) for (let k = 0; k < 9; k++) { const x = x0 + sgn * k * 26; m.beginPath(); m.moveTo(x - 6, 910); m.quadraticCurveTo(x + sgn * 30, 600 - k * 30, x + sgn * (40 + k * 6), 380 + k * 22); m.quadraticCurveTo(x + sgn * 20, 600, x + 6, 910); m.fill(); } }, { depth: 1, trans: .02 }),
  ];
  // S5 · the eye (approved)
  const LV = [[520, 150, -.9, 130], [380, 90, 2.4, 120], [250, 70, -1.1, 130], [120, 80, 2.2, 110], [-40, 100, -.7, 130], [-200, 120, 2.6, 120], [-330, 100, -1.2, 120]];
  S5 = [
    sheet('#1f2558', full, { depth: 0, trans: .95 }),
    sheet('#12152e', m => branch(m, [[700, 220], [300, 40], [-120, 110], [-300, 140], [-460, 60]], 18, LV), { depth: .35, trans: .3, cut: m => veins(m, LV) }),
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
    sheet('#141a40', full, { depth: 0, trans: .9 }),
    sheet('#2a3166', m => { for (const [y, x0, x1] of [[-420, -700, -60], [-300, 120, 700], [-60, -700, -200]]) { m.beginPath(); m.ellipse((x0 + x1) / 2, y, (x1 - x0) / 2, 22, 0, 0, 7); m.fill(); } }, { depth: .2, trans: .45 }),
    wordSheet('Koyili', 230, 420, CREAM, .3),
    wordSheet('Kuhu  Kuhu', 210, 420, CREAM, .3),
    sheet('#0a0b1c', m => branch(m, BRANCH, 22, LB), { depth: .6, trans: .2, cut: m => veins(m, LB) }),
    sheet('#C8321E', m => { for (const [x, y, a] of [[420, -10, -1.4], [-60, 10, -1.7], [-420, -10, -1.2]]) panicle(m, x, y, a, 110, 8); }, { depth: .61, trans: .75 }),
    sheet('#05050c', m => cuckoo(m, -30, -82, 1.15), { depth: .62, trans: .03, rim: '#ffe2b0', rimA: .9, cut: m => { m.beginPath(); m.arc(-30 - 30 * 1.15, -82 - 36 * 1.15, 5, 0, 7); m.fill(); } }),
    sheet('#05050c', balcony, { depth: .95, trans: .03, cut: m => M.profileCuts(m, 1.0, 330, 1000), rim: '#ffd9a0', rimA: .8 }),
    wordSheet('Kuni  Kuni', 190, -660, CREAM, .3),
  ];
  S6.beak = [-30 - 80 * 1.15, -82 - 35 * 1.15];
  // S7 · dawn: the morning star, little blossoms, the sun and the golden oriole
  S7 = [
    sheet('#d4909a', full, { depth: 0, trans: .95 }),
    sheet('#7a4a6a', m => { m.beginPath(); m.moveTo(-LW / 2, 520); for (let x = -LW / 2; x <= LW / 2; x += 40) m.lineTo(x, 470 - 80 * Math.sin(x / 260 + 1) - 24 * Math.sin(x / 80)); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill(); }, { depth: .2, trans: .5 }),
    wordSheet('Pahantiya Tara', 135, -640, DEEP, .3),
    wordSheet('Chun Muni', 165, -500, DEEP, .3),
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
function scA(c, t) {
  reset(SA);
  [0.07, .63, 2.28, 1.18, 1.18, 1.74].forEach((t0, i) => SA[i].lit = ss(seg(t, t0, t0 + .45)));
  const rise = eo(seg(t, .07, 1.6)); SA[3].oy = SA[4].oy = lerp(760, 0, rise) + 6 * Math.sin(t * 1.7);
  SA[2].alpha = seg(t, 2.28, 2.8);
  const cam = { x: 0, y: lerp(60, -20, eio(seg(t, 0, 4.5))), z: lerp(1.0, 1.1, eio(seg(t, 0, 4.5))) }, scr = scrOf(cam);
  c.fillStyle = '#0c0405'; c.fillRect(0, 0, W, H);
  drawStack(c, SA, cam, { x: W / 2, y: H * .42, r: 1500, I: 1.05 * flick(t) }, { after: [(cc) => { const [x, y, z] = scr(SA[0], 0, -150); glow(cc, x, y, 260 * z, 'rgba(255,214,150,1)', .6); }] });
  const on = ss(seg(t, .07, 1.9)); c.save(); c.globalAlpha = .6 * (1 - on); c.fillStyle = '#080203'; c.fillRect(0, 0, W, H); c.restore();
  // the spell: gold dust spirals up out of her palm and gathers into one drop
  const [px, py, z] = scr(SA[3], HX, HY + 90), [ex, ey] = scr(SA[0], ...SPELL_END);
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
  const [, wy] = scr(SB[2], 0, -520);
  gloss(c, 'salty lips', W / 2, wy, SB[2].alpha, DARKG); gloss(c, 'sweetness drips', W / 2, wy, SB[3].alpha * (1 - seg(t, 8.6, 8.96)), DARKG);
}
function scC(c, t) {
  reset(SC);
  SC[6].alpha = 0; SC[5].ox = SC[6].ox = lerp(-200, 140, seg(t, 8.96, 13.4)); SC[5].oy = SC[6].oy = -4 * Math.abs(Math.sin(t * 5.6));
  SC[2].alpha = seg(t, 9.52, 10.1);
  const u = eio(seg(t, 8.96, 13.6)), cam = { x: lerp(-150, 130, u), y: lerp(-40, -120, u), z: 1.05 }, scr = scrOf(cam);
  c.fillStyle = '#0c0405'; c.fillRect(0, 0, W, H);
  drawStack(c, SC, cam, { x: W * .55, y: H * .25, r: 1600, I: 1.0 * flick(t) }, { after: [(cc) => { const [x, y, z] = scr(SC[0], 300, 60); glow(cc, x, y, 170 * z, 'rgba(255,230,170,1)', .75); }] });
  // the scent of her: golden ribbons rising off her pallu toward the blossoms, swelling on the beats
  const [wx, wy, z] = scr(SC[5], -20 - 30 * 1.5, 640 - 430 * 1.5), sw = 1 + .7 * pulse(t, 8.96, 13.4, 2.5);
  dust(c, t, 130, (i, r1, r2, r3) => { const u = ((t - 8.96) * (.25 + .2 * r2) + r1) % 1.6; const lane = i % 4; const x = wx - u * 380 * z * (.6 + r3) + 40 * Math.sin(u * 5 + lane), y = wy - u * 520 * z + 50 * Math.sin(u * 4 + lane * 1.7); return [x, y, (1.8 + 2.4 * r3) * sw, seg(u, 0, .15) * (1 - seg(u, 1.0, 1.6)) * .85]; }, 'rgba(255,214,140,1)', seg(t, 9.3, 10.0), 11);
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
    after: [(cc) => { glow(cc, mx, my, 230 * z, 'rgba(255,226,170,1)', .5); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.fillStyle = '#fff0d4'; cc.beginPath(); cc.arc(mx, my, 150 * z, 0, 7); cc.fill(); cc.restore(); },
      null, null,
      (cc) => {   // the moon in the water, wavering (intoxicated)
        const [rx, ry, rz] = scr(SD[3], MX, 360 + (360 - MY) * .35); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0);
        for (let k = 0; k < 9; k++) { const w = (150 - k * 9) * rz * (1 + .25 * Math.sin(t * 3 + k)), y = ry + k * 24 * rz, dx = 34 * rz * Math.sin(t * 2.2 + k * .9) * (1 + seg(t, 15.0, 15.6)); cc.globalAlpha = .55 * (1 - k / 10) * seg(t, 13.8, 14.6); cc.fillStyle = '#ffe6b8'; cc.beginPath(); cc.ellipse(rx + dx, y, w, 5 * rz, 0, 0, 7); cc.fill(); }
        cc.restore(); }],
  });
  fireflies(c, t, 46, seg(t, 14.4, 15.4), 21);
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
        if (t < 26.6) return; const ks = BEATS.filter(b => b >= 26.73 && b < 30.1);
        STARS.forEach(([sx, sy], i) => { const b = ks[i]; if (b === undefined || t < b - .05) return; const g = eo(seg(t, 31.0 - 1.4, 31.2)); const [x, y] = scr(L[0], lerp(sx, STAR.x, g), lerp(sy, STAR.y, g)); star4(cc, x, y, (10 + 6 * Math.exp(-(t - b) * 4)) * (1 - .4 * g), seg(t, b - .05, b + .12) * (.75 + .25 * Math.sin(t * 6 + i))); });
      }],
  });
  if (t > 24.4 && t < 27) { const [bx, by, zz] = scr(L[6], ...S6.beak); BEATS.filter(b => b >= 24.52 && b <= t && b < 26.73).forEach(b => { const u = seg(t, b, b + 1.1); if (u >= 1) return; c.save(); c.strokeStyle = `rgba(255,214,150,${(1 - u) * .9})`; c.lineWidth = 3.5 * zz; c.shadowColor = 'rgba(255,170,90,.9)'; c.shadowBlur = 16; c.beginPath(); c.arc(bx, by, (20 + 300 * eo(u)) * zz, Math.PI * .65, Math.PI * 1.35); c.stroke(); c.restore(); }); }
  fireflies(c, t, 36, 1 - seg(t, 29, 31), 33);
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
  const cam = { x: lerp(lerp(-120, -60, eio(seg(t, 31.0, 35))), 110, bloomCam * (1 - finale)), y: lerp(lerp(130, 60, eio(seg(t, 31.0, 35))), -60, bloomCam) + 190 * finale, z: lerp(lerp(.93, 1.0, eio(seg(t, 31, 35))), 1.28, bloomCam) - .33 * finale };
  const scr = scrOf(cam), [sx, sy, z] = scr(L[0], 160, lerp(560, 120, sun));
  c.fillStyle = '#0c0408'; c.fillRect(0, 0, W, H);
  const warm = ss(seg(t, 39.8, 42.5));
  drawStack(c, L, cam, { x: sx, y: sy - 200, r: 1700, I: (.85 + .35 * warm) * flick(t) }, {
    after: [(cc) => {
      cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0);
      const g = cc.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(60,50,110,${.55 * (1 - warm)})`); g.addColorStop(.6, 'rgba(255,170,140,0)'); g.addColorStop(1, `rgba(255,190,120,${.35 + .3 * warm})`); cc.fillStyle = g; cc.fillRect(0, 0, W, H);
      if (sun > 0) { glow(cc, sx, sy, 330 * z, 'rgba(255,200,110,1)', .65 * sun); cc.fillStyle = '#ffe9b0'; cc.beginPath(); cc.arc(sx, sy, 170 * z, 0, 7); cc.fill(); }
      // the morning star
      const sa = seg(t, 31.0, 31.6) * (1 - seg(t, 40.5, 42)), [x, y, zz] = scr(L[0], STAR.x, STAR.y);
      if (sa > 0) { const r = (34 + 6 * Math.sin(t * 3) + 14 * pulse(t, 31.18, 35.6, 3)) * zz; glow(cc, x, y, r * 3.2, 'rgba(255,230,190,1)', .6 * sa); star4(cc, x, y, r, sa); cc.save(); cc.globalAlpha = .35 * sa; cc.fillStyle = '#fff6e0'; cc.fillRect(x - r * 7, y - 1.5, r * 14, 3); cc.fillRect(x - 1.5, y - r * 7, 3, r * 14); cc.restore(); }
      cc.restore();
    }],
  });
  // chun muni: little blossoms pop open along the branch, one per syllable
  const cb = BEATS.filter(b => b >= 35.6 && b < 39.5);
  BUDS.forEach(([bx, by, col], i) => { const b = cb[i % cb.length] + (i >= cb.length ? .27 : 0); if (t < b) return; const [x, y, zz] = scr(L[5], bx, by); flower(c, x, y, 26 * zz, seg(t, b, b + .35), col); });
  // sunrise rays
  if (warm > 0) { c.save(); c.globalCompositeOperation = 'screen'; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k - 4.5) * .2 + .03 * Math.sin(t * .5 + k); const gr = c.createRadialGradient(sx, sy, 0, sx, sy, 1500); gr.addColorStop(0, `rgba(255,214,150,${.22 * warm})`); gr.addColorStop(1, 'rgba(255,190,120,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(sx, sy); c.arc(sx, sy, 1600, a - .045, a + .045); c.fill(); } c.restore(); }
  dust(c, t, 40, (i, r1, r2, r3) => [((r1 + t * .02 * (r3 + .2)) % 1) * W, H * (.25 + .5 * r2) + 30 * Math.sin(t + i), 2 + 2 * r3, .35 + .35 * Math.sin(t * 2 + i)], 'rgba(255,220,150,1)', seg(t, 31.5, 32.5), 41);
  gloss(c, 'my morning star', W / 2, scr(L[2], 0, -555)[1], L[2].alpha, DARKG);
  gloss(c, 'my little darling', W / 2, scr(L[3], 0, -400)[1], L[3].alpha, DARKG);
  gloss(c, 'golden oriole · my spring', W / 2, scr(L[4], 0, -515)[1], L[4].alpha, DARKG);
}
const BUDS = [[-330, -36, '#F2B83E'], [-120, -28, '#E8962C'], [60, 18, '#F2B83E'], [250, -6, '#C8321E'], [420, -14, '#F2B83E'], [-500, -20, '#E8962C'], [-250, -10, '#C8321E'], [160, 12, '#F2B83E'], [330, 0, '#E8962C'], [-30, 22, '#F2B83E'], [520, 6, '#C8321E'], [-420, 2, '#F2B83E']];

// ---------- render ----------
function xfade(c, t, t0, d, A, B) { const a = ss(seg(t, t0, t0 + d)); if (a <= 0) return A(c, t); if (a >= 1) return B(c, t); A(c, t); const b = BUF.getContext('2d'); b.setTransform(1, 0, 0, 1, 0, 0); B(b, t); c.globalAlpha = a; c.drawImage(BUF, 0, 0); c.globalAlpha = 1; }
const SEQ = [[4.35, scA], [8.75, scB], [13.2, scC], [17.85, scD], [22.15, sc5], [31.0, sc6], [99, sc7]];
const XD = [.35, .5, .6, .35, .35, .9];
const FROM = Number(Q.get('from') || 0), TO = Number(Q.get('to') || DUR);
window.DUR = TO - FROM;
window.render = t0 => {
  const t = t0 + FROM;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  let i = 0; while (t >= SEQ[i][0]) i++;
  const prev = i > 0 ? SEQ[i - 1] : null;
  if (prev && t < prev[0] + XD[i - 1]) xfade(ctx, t, prev[0], XD[i - 1], SEQ[i - 1][1], SEQ[i][1]);
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
