// Manabasa Gurubara — the Lakshmi Purana as an Odia shadow play (portrait). Hook test: 0–9.2 s.
import { makeGL } from './gl.js';
import { canvas, DYE } from './carve.js';
import { W, H, clamp, lerp, seg, ss, eo, eio, hh } from './common.js';
import { P, buildPieces, LANE } from './pieces.js';
const Q = new URLSearchParams(location.search);
const [trc, tr] = canvas(W, H), [frc, fr] = canvas(W, H);
const GL = makeGL(document.getElementById('gl'));
for (const f of ['600 50px "CormorantG"', 'italic 600 56px "CormorantG"', '700 96px "OdiaSerif"']) await document.fonts.load(f, f.includes('Odia') ? 'ମାଣବସା ଗୁରୁବାର' : 'Aa');
buildPieces();
const ei = x => x * x * x;
// —— putting a piece of hide on the cloth: (x, y) its pivot in screen coordinates; press-on/lift-off as scale + blur + alpha ——
let CAM = [540, 960, 1];
function put(p, x, y, s = 1, o = {}) {
  const { rot = 0, a = 1, blur = 0, sx = 1 } = o; if (a <= 0.003) return; const [cx, cy, z] = CAM;
  tr.save(); tr.globalCompositeOperation = 'multiply'; tr.globalAlpha = clamp(a); if (blur > .3) tr.filter = `blur(${blur * z}px)`;
  tr.setTransform(z, 0, 0, z, 540 - cx * z, 960 - cy * z); tr.translate(x, y); tr.rotate(rot); tr.scale(s * sx, s);
  tr.drawImage(p.c, p.x0, p.y0, p.w, p.h); tr.restore();
}
const press = (t, t0, d = .35) => { const u = seg(t, t0, t0 + d); return { k: 1 + .9 * (1 - eo(u)), blur: 18 * (1 - eo(u)), a: .25 + .75 * eo(u), on: t >= t0 }; };   // arriving: big and soft, then sharp against the cloth
const lift = (t, t0, d = .6) => { const u = seg(t, t0, t0 + d); return { k: 1 + .8 * ei(u), blur: 26 * u, a: 1 - ei(u), gone: u >= 1 }; };
function rod(x0, y0, x1, y1, a = .6) { const [cx, cy, z] = CAM; tr.save(); tr.globalCompositeOperation = 'multiply'; tr.globalAlpha = a; tr.setTransform(z, 0, 0, z, 540 - cx * z, 960 - cy * z); tr.strokeStyle = '#4a3a2a'; tr.lineWidth = 2.4; tr.beginPath(); tr.moveTo(x0, y0); tr.lineTo(x1, y1); tr.stroke(); tr.restore(); }
const tremor = (t, k) => [Math.sin(t * 1.7 + k) * 2.2 + Math.sin(t * 3.1 + k * 2) * 1.2, Math.sin(t * 1.3 + k * 3) * 1.8];
// —— the pots of the offering: 56 around him, in two rings ——
const POTS = Array.from({ length: 56 }, (_, i) => { const ringI = i % 2, k = Math.floor(i / 2), a = -Math.PI / 2 + (k + .5 * ringI) / 28 * Math.PI * 2, rx = ringI ? 360 : 460, ry = ringI ? 400 : 500; return [540 + Math.cos(a) * rx, 800 + Math.sin(a) * ry, i % 7]; });
// —— captions ——
const CAPS = [[0.1, 2.75, ['The Jagannath we offer', '*fifty-six* bhogas…']], [3.0, 5.45, ['once wandered door to door,', '*hungry*.']], [5.75, 6.6, ['*Why?*']], [6.9, 9.0, ['Margashira. Manabasa *Gurubara*.']]];
function capLine(c, ln, y) {
  const parts = ln.split('*'), fnt = j => j % 2 ? 'italic 600 56px "CormorantG"' : '600 50px "CormorantG"';
  c.letterSpacing = '0.5px'; const ws = parts.map((p, j) => { c.font = fnt(j); return c.measureText(p).width; }); let x = 540 - ws.reduce((a, b) => a + b, 0) / 2;
  parts.forEach((p, j) => { if (!p) return; c.font = fnt(j); c.fillStyle = j % 2 ? '#f0c672' : '#f6ecdc'; c.shadowColor = 'rgba(8,3,2,.9)'; c.shadowBlur = 12; c.shadowOffsetY = 1.5; c.fillText(p, x, y); c.shadowBlur = 0; c.shadowOffsetY = 0; c.fillText(p, x, y); x += ws[j]; });
}
function captions(t) { for (const [a, b, lines] of CAPS) { const k = ss(seg(t, a - .05, a + .3)) * (1 - ss(seg(t, b - .28, b + .02))); if (k <= 0) continue; fr.save(); fr.globalAlpha = k; fr.textAlign = 'left'; fr.textBaseline = 'alphabetic'; lines.forEach((ln, i) => capLine(fr, ln, 1470 - (lines.length - 1 - i) * 62)); fr.restore(); } }
function frame(t) {   // the theatre: dark lacquered wood round the glowing cloth; the stage lip below carries the words
  const [cx, cy, z] = CAM, top = 960 + (190 - cy) * z, bot = 960 + (1360 - cy) * z;
  fr.save(); fr.fillStyle = '#140805'; fr.fillRect(0, 0, W, Math.max(0, top)); fr.fillRect(0, bot, W, H - bot);
  const g = fr.createLinearGradient(0, bot, 0, bot + 140); g.addColorStop(0, 'rgba(255,170,90,.22)'); g.addColorStop(1, 'rgba(255,170,90,0)'); fr.fillStyle = g; fr.fillRect(0, bot, W, 140);   // the cloth's glow spilling on the lip
  const g2 = fr.createLinearGradient(0, top - 90, 0, top); g2.addColorStop(0, 'rgba(255,170,90,0)'); g2.addColorStop(1, 'rgba(255,170,90,.18)'); fr.fillStyle = g2; fr.fillRect(0, top - 90, W, 90);
  fr.strokeStyle = '#8a6430'; fr.lineWidth = 2.5; fr.beginPath(); fr.moveTo(0, top - 14); fr.lineTo(W, top - 14); fr.moveTo(0, bot + 14); fr.lineTo(W, bot + 14); fr.stroke();
  fr.fillStyle = '#6a1a10'; fr.fillRect(0, bot + 18, W, 10); fr.fillRect(0, top - 28, W, 10);
  fr.strokeStyle = 'rgba(138,100,48,.6)'; fr.lineWidth = 2; for (let x = 30; x < W; x += 90) { fr.beginPath(); fr.arc(x + 45, top - 60, 20, Math.PI, 0); fr.stroke(); fr.beginPath(); fr.arc(x + 45, bot + 70, 20, 0, Math.PI); fr.stroke(); }   // carved scallops
  fr.restore();
}
// —— one frame ——
function render(t) {
  tr.setTransform(1, 0, 0, 1, 0, 0); tr.globalCompositeOperation = 'source-over'; tr.filter = 'none'; tr.fillStyle = '#fff'; tr.fillRect(0, 0, W, H);
  fr.setTransform(1, 0, 0, 1, 0, 0); fr.clearRect(0, 0, W, H);
  let lampI = 1, lampX = 540, lampY = 820, expo = 1.25, extra = [];
  // camera: still on him; a pan along the lane; back to centre; a slow push
  const pan = eio(seg(t, 2.95, 5.4)), back = eio(seg(t, 5.35, 5.8));
  CAM = [lerp(540, lerp(540, 1500, pan), 1 - back), 960, 1 + .05 * seg(t, 6.6, 9.2)];
  // 1. Jagannath, and the 56 pots pressed on around him; then everything lifts off
  if (t < 3.3) { const L = lift(t, 2.55, .6), tm = tremor(t, 1);
    POTS.forEach(([x, y, v], i) => { const t0 = .12 + i * .04, p = press(t, t0, .3); if (!p.on) return; const Lp = lift(t, 2.45 + (i % 9) * .02, .55); if (Lp.gone) return; put(P.pots[v], x + tm[0], y + tm[1], .9 * p.k * Lp.k, { blur: p.blur + Lp.blur, a: p.a * Lp.a, rot: Math.sin(t * 2 + i) * .04 }); });
    if (!L.gone) { put(P.J, 540 + tm[0], 1190 + tm[1], .92 * L.k, { blur: L.blur, a: L.a }); rod(540, 1120, 520, 1990, L.a * .7); } }
  // 2. the lane: the brothers glide along it, and every door shuts as they reach it
  if (t >= 2.9 && t < 5.9) { const ap = press(t, 2.9, .4), L = lift(t, 5.4, .5), a = ap.a * L.a;
    put(P.lane, 0, 0, 1, { a, blur: ap.blur * .6 + L.blur });
    const wx = lerp(260, 1820, seg(t, 3.0, 5.4)), hop = i => -Math.abs(Math.sin(t * 7 + i)) * 12;
    LANE.door.forEach(([dx, dy, dw], i) => { const s = ss(clamp((wx - dx + 40) / 70)); if (s > 0.02) put(P.leaf, dx, dy, 1, { sx: s, a }); });
    for (const [who, off, i] of [['B', -210, 0], ['J', 0, 1]]) { const x = wx + off, y = LANE.base - 6 + hop(i); put(P[who], x, y + 40, .52 * L.k, { a, blur: L.blur, rot: Math.sin(t * 7 + i) * .05 }); rod(x, y - 60, x - 30, 1990, a * .6); }
    lampX = CAM[0]; }
  // 3. "Why?" — one face in the dark: the lamps gutter down to a single flame behind his eyes
  if (t >= 5.5 && t < 7.4) { const p = press(t, 5.55, .4), L = lift(t, 6.75, .6); if (!L.gone) { const tm = tremor(t, 5); put(P.J, 540 + tm[0], 1340 + tm[1], 1.12 * p.k * L.k, { a: p.a * L.a, blur: p.blur + L.blur }); } }
  if (t > 5.6 && t < 6.9) { const g = ss(seg(t, 5.6, 5.95)), u = seg(t, 6.55, 6.85); lampI = lerp(1, .16, g) * (1 + .5 * Math.sin(t * 40) * g * (1 - g) * 4); if (t > 6.55) lampI = lerp(.16, 1.6, eo(u)) - .6 * ss(seg(t, 6.8, 7.1)); lampY = lerp(820, 990, g); }
  // 4. a new lamp flares; the jhoti of Manabasa is pressed on, with the Mana at its heart; the title rises on its rods
  if (t >= 6.55) { const p = press(t, 6.6, .55); put(P.jhoti, 540, 860, .86 * p.k, { a: p.a, blur: p.blur, rot: t * .02 });
    const up = eo(seg(t, 7.0, 7.7)), ty = lerp(1500, 300, up); if (t > 7.0) { put(P.title, 540, ty, .95, {}); rod(200, ty + 90, 150, 1990, .6); rod(880, ty + 90, 930, 1990, .6); } }
  frame(t);
  captions(t);
  GL.render(trc, frc, { cam: CAM, rect: [-400, 190, 2700, 1360], lamps: [[lampX, lampY, lampI, 1.0], ...extra], sigB: 620, sigC: 150, amb: .12, expo, time: t, bloom: .45, vign: .75, sat: 1.08, contrast: .14, lcol: [1, .74, .42], hotcol: [1, .88, .6] });
}
window.render = render; window.DUR = +(Q.get('dur') || 9.2);
if (Q.get('t')) render(+Q.get('t'));
window.READY = true;
