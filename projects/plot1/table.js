// The light table and the records on it, drawn as vectors in table space (scene units: x east, z south), so one function serves
// both the 3D table texture and the crisp 2D close-ups. Each paper is drawn in its own page space (1000 units wide).
import { PLOTS, OD, LANE, ROAD, OURS, POND } from './layout.js';
import { clamp, lerp, seg, ss, eo, eio, hh } from './common.js';
import { TABLE } from './world.js';
import { cent } from './proj.js';
const INK = '#2a2119', INK2 = '#5b4a38', GOLDI = '#b07a1c', RED = '#b3321f';
// paper placements (centre x, z; width; height/width ratio; rotation)
export const DOCS = {
  map: { x: 1.33, z: -.30, w: .50, r: 1.39, rot: -.03 },
  chq: { x: 1.80, z: -.585, w: .36, r: .43, rot: .07 },
  c1: { x: 1.765, z: -.265, w: .30, r: 1.3, rot: .02 },
  c2: { x: 1.845, z: .145, w: .30, r: 1.3, rot: .05 },
  deed: { x: 1.33, z: .38, w: .42, r: 1.38, rot: .02 },
  old1: { x: 1.30, z: .40, w: .40, r: 1.38, rot: -.09 },
  old2: { x: 1.37, z: .36, w: .40, r: 1.38, rot: .11 },
  reg: { x: 1.62, z: .40, w: .42, r: 1.38, rot: -.025 },
};
// page space → table space for a doc (optionally at an animated position)
export function docXf(d, o) { o = o || {}; const x = o.x ?? d.x, z = o.z ?? d.z, rot = o.rot ?? d.rot, s = d.w / 1000, c = Math.cos(rot), n = Math.sin(rot), h = 1000 * d.r;
  return { toT: (u, v) => [x + ((u - 500) * c - (v - h / 2) * n) * s, z + ((u - 500) * n + (v - h / 2) * c) * s], apply: g => { g.translate(x, z); g.rotate(rot); g.scale(s, s); g.translate(-500, -h / 2); }, h }; }
export function regPos(t) { const u = eo(seg(t, 37.85, 38.75)); return { x: lerp(2.55, DOCS.reg.x, u), z: lerp(.30, DOCS.reg.z, u), rot: lerp(.14, DOCS.reg.rot, u) }; }

function paper(g, w, h, tone, edge = 'rgba(120,96,70,.35)', shadow = true) {
  if (shadow) { g.save(); g.shadowColor = 'rgba(40,30,20,.22)'; g.shadowBlur = 30; g.shadowOffsetY = 6; g.fillStyle = tone; g.fillRect(0, 0, w, h); g.restore(); }
  g.fillStyle = tone; g.fillRect(0, 0, w, h);
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(120,90,50,.06)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = edge; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
}
function txt(g, s, x, y, size, col = INK, font = 'OdiaSerif', w = 500, al = 'left', ls = 0) { g.font = `${w} ${size}px "${font}"`; g.fillStyle = col; g.textAlign = al; g.textBaseline = 'alphabetic'; g.letterSpacing = ls + 'px'; g.fillText(s, x, y); g.letterSpacing = '0px'; }
function bars(g, x, y, w, n, step, seed, col = 'rgba(60,46,32,.38)', th = 7) { g.fillStyle = col; for (let i = 0; i < n; i++) { let xx = x; const L = i === n - 1 ? w * (.3 + .4 * hh(seed + i)) : w; while (xx < x + L) { const ww = 18 + 60 * hh(seed * 3 + i * 17 + xx); g.fillRect(xx, y + i * step, Math.min(ww, x + L - xx), th); xx += ww + 9; } } }
function rosette(g, cx, cy, R, col) { g.save(); g.strokeStyle = col; g.lineWidth = 1; for (let k = 0; k < 18; k++) { g.beginPath(); for (let i = 0; i <= 240; i++) { const a = i / 240 * Math.PI * 2, r = R * (.62 + .38 * Math.sin(a * 7 + k * .35)); const x = cx + r * Math.cos(a + k * .17), y = cy + r * Math.sin(a + k * .17); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } g.restore(); }
function guilloche(g, x, y, w, h, col) { g.save(); g.strokeStyle = col; g.lineWidth = 1; for (let k = 0; k < 7; k++) { g.beginPath(); for (let i = 0; i <= 400; i++) { const u = i / 400, xx = x + u * w, yy = y + h / 2 + Math.sin(u * 46 + k * .9) * h * .32 * Math.cos(u * 7 + k); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); } g.restore(); }

// —— the Bhulekh map sheet: the same plan as the model ——
export const MAPBOX = [60, 92, 940, 1265];     // the map area on the sheet (page units), 3:4 like the plate
export const mapUV = (x, z) => [MAPBOX[0] + (x + 90) / 180 * (MAPBOX[2] - MAPBOX[0]), MAPBOX[1] + (z + 120) / 240 * (MAPBOX[3] - MAPBOX[1])];
function mapSheet(g, t) {
  const h = 1390; paper(g, 1000, h, '#f6efe0');
  g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(36, 36, 928, h - 72); g.lineWidth = 1; g.strokeRect(46, 46, 908, h - 92);
  txt(g, 'ଭୂଲେଖ ନକ୍ସା', 62, 80, 30, INK, 'OdiaSerif', 700); txt(g, 'BHULEKH MAP  ·  CADASTRAL SHEET 4', 938, 76, 17, INK2, 'InterT', 600, 'right', 3);
  const P = (x, z) => mapUV(x, z);
  // washes: the public road, the pond
  const fillR = ([x0, z0, x1, z1], col) => { const [a, b] = P(x0, z0), [c, d] = P(x1, z1); g.fillStyle = col; g.fillRect(a, b, c - a, d - b); };
  fillR(ROAD, 'rgba(206,170,96,.32)'); fillR(LANE, 'rgba(206,170,96,.16)'); fillR(POND, 'rgba(110,140,130,.22)');
  g.strokeStyle = INK; g.lineWidth = 1.6;
  for (const p of PLOTS) { g.beginPath(); p.poly.forEach(([x, z], i) => { const [a, b] = P(x, z); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.closePath(); g.stroke(); }
  for (const p of PLOTS) { const [a, b] = P(...cent(p.poly)); g.font = `600 ${p.kind === 'lane' ? 17 : 21}px "OdiaSerif"`; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (p.kind === 'lane') { g.save(); g.translate(a, b + 70); g.rotate(-Math.PI / 2); g.fillText(OD(p.n), 0, 0); g.restore(); } else if (p.kind === 'road') g.fillText(OD(p.n), P(26, 75)[0], b); else g.fillText(OD(p.n), a, b); }
  // north arrow, scale bar, title block
  g.save(); g.translate(890, 150); g.fillStyle = INK; g.beginPath(); g.moveTo(0, -34); g.lineTo(11, 14); g.lineTo(0, 6); g.lineTo(-11, 14); g.closePath(); g.fill(); txt(g, 'N', 0, -42, 18, INK, 'InterT', 700, 'center'); g.restore();
  g.fillStyle = INK; for (let i = 0; i < 4; i++) { if (i % 2 === 0) g.fillRect(80 + i * 50, 1300, 50, 9); } g.strokeStyle = INK; g.lineWidth = 1.2; g.strokeRect(80, 1300, 200, 9); txt(g, '0        25        50 m', 80, 1334, 15, INK2, 'InterT', 500);
  g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(640, 1286, 300, 74); txt(g, 'ମୌଜା ନକ୍ସା', 656, 1316, 20, INK, 'OdiaSerif', 700); txt(g, 'PLOT BOUNDARIES · NOT TO BE USED AS A DEED', 656, 1344, 11, INK2, 'InterT', 600, 'left', 1.5);
}
// —— the advance: a cheque with the amount written, signature line empty ——
function cheque(g, t) {
  const h = 430; paper(g, 1000, h, '#f3ecdc'); guilloche(g, 20, 20, 960, 70, 'rgba(150,120,70,.35)'); rosette(g, 870, 290, 80, 'rgba(160,128,80,.25)');
  txt(g, 'ADVANCE', 40, 150, 40, INK, 'CormorantG', 700, 'left', 8); txt(g, 'PAY', 40, 215, 20, INK2, 'InterT', 600, 'left', 3); g.strokeStyle = INK2; g.lineWidth = 1; g.beginPath(); g.moveTo(100, 215); g.lineTo(640, 215); g.stroke();
  txt(g, 'Rupees two lakh only', 110, 268, 34, '#3a4a6a', 'CormorantG', 500); g.beginPath(); g.moveTo(40, 280); g.lineTo(640, 280); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(680, 170, 280, 70); txt(g, '₹ 2,00,000', 700, 222, 40, INK, 'CormorantG', 700);
  g.beginPath(); g.moveTo(640, 380); g.lineTo(960, 380); g.stroke(); txt(g, 'SIGNATURE', 800, 404, 15, INK2, 'InterT', 600, 'center', 3);
}
// —— a record of rights (patta) card ——
export const CARD_ROWS = { plot: 470, kisam: 640, owner: 980 };
function card(g, t, v) {
  const h = 1300; paper(g, 1000, h, '#fbf6ea');
  g.fillStyle = 'rgba(176,122,28,.10)'; g.fillRect(0, 0, 1000, 150); txt(g, 'ଖତିୟାନ', 60, 100, 52, INK, 'OdiaSerif', 700); txt(g, 'RECORD OF RIGHTS · PATTA', 940, 92, 20, INK2, 'InterT', 600, 'right', 3);
  const rows = [['ଖାତା ନଂ', 'KHATA', v.khata], ['ପ୍ଲଟ୍ ନଂ', 'PLOT', v.plot], ['କିସମ', 'KISAM', v.kisam], ['ରକବା', 'AREA', v.area], ['ମାଲିକ', 'RECORDED OWNER', v.owner]];
  rows.forEach(([o, e, val], i) => { const y = 250 + i * 170; g.strokeStyle = 'rgba(42,33,25,.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(60, y + 80); g.lineTo(940, y + 80); g.stroke();
    txt(g, o, 60, y + 40, 30, INK2, 'OdiaSerif', 600); txt(g, e, 60, y + 66, 13, INK2, 'InterT', 600, 'left', 2.5); txt(g, val, 340, y + 50, val.length > 12 ? 44 : 50, INK, 'OdiaSerif', 700); });
  bars(g, 60, 1150, 880, 3, 30, v.seed, 'rgba(60,46,32,.22)', 6);
}
const C1 = { khata: '୧୨', plot: '୧୦୨୪', kisam: 'ରାସ୍ତା', area: '୧.୪୪୦ ଏକର', owner: 'ଓଡ଼ିଶା ସରକାର', seed: 3 };
const C2 = { khata: '୧୧୮', plot: '୩୪୧', kisam: 'ଘରବାଡ଼ି', area: '୦.୦୯୯ ଏକର', owner: 'ଶ୍ରୀ ହରିହର ମହାନ୍ତି', seed: 7 };
// —— the old sale deed: the schedule, the boundaries — and an empty line where the right of way should be ——
export const DEED_ROWS = { sched: 720, bounds: 800, access: 880 };
function deed(g, t) {
  const h = 1380; paper(g, 1000, h, '#efe2c8', 'rgba(120,90,50,.45)');
  g.fillStyle = 'rgba(120,140,110,.18)'; g.fillRect(0, 0, 1000, 240); guilloche(g, 30, 30, 940, 90, 'rgba(70,100,80,.35)'); rosette(g, 500, 170, 60, 'rgba(70,100,80,.3)');
  txt(g, 'ବିକ୍ରୀ କବଲା', 60, 320, 44, INK, 'OdiaSerif', 700); txt(g, 'SALE DEED · 1998', 940, 314, 20, INK2, 'InterT', 600, 'right', 3);
  bars(g, 60, 370, 880, 9, 34, 11);
  txt(g, 'SCHEDULE — Plot No. 342  ·  Khata No. 118', 60, DEED_ROWS.sched, 30, INK, 'CormorantG', 600);
  txt(g, 'Bounded by: N 336  ·  S 341  ·  E 344  ·  W 335', 60, DEED_ROWS.bounds, 30, INK, 'CormorantG', 600);
  txt(g, 'Access / Right of Way:', 60, DEED_ROWS.access, 30, INK, 'CormorantG', 700); g.strokeStyle = 'rgba(42,33,25,.5)'; g.setLineDash([6, 7]); g.beginPath(); g.moveTo(350, DEED_ROWS.access + 4); g.lineTo(940, DEED_ROWS.access + 4); g.stroke(); g.setLineDash([]);
  bars(g, 60, 940, 880, 7, 34, 23);
  g.strokeStyle = 'rgba(60,70,110,.7)'; g.lineWidth = 2.5; sig(g, 120, 1290, 5); sig(g, 640, 1290, 9);
  g.strokeStyle = 'rgba(120,90,50,.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, h / 2); g.lineTo(1000, h / 2); g.moveTo(500, 0); g.lineTo(500, h); g.stroke();   // fold lines
}
function oldPaper(g, t, seed, tone) { const h = 1380; paper(g, 1000, h, tone, 'rgba(110,80,45,.45)'); txt(g, seed > 40 ? 'ପୁରୁଣା ପଟ୍ଟା · 1974' : 'ମୂଳ କବଲା · 1986', 60, 110, 34, INK, 'OdiaSerif', 700); bars(g, 60, 170, 880, 30, 36, seed, 'rgba(70,50,30,.32)'); }
function sig(g, x, y, s) { g.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60; const xx = x + u * 220, yy = y - 18 * Math.sin(u * 14 + s) * Math.exp(-u * 1.2) - 10 * Math.sin(u * 5 + s * 2); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
// —— the registered right-of-way deed ——
export const SKETCH = [100, 470, 900, 920];      // the site sketch box (page units)
export const skUV = (x, z) => { const [a, b, c, d] = SKETCH, cx = (a + c) / 2, cy = (b + d) / 2, k = 5.2; return [cx + (x - 4) * k, cy + (z - 26) * k]; };
function regDeed(g, t) {
  const h = 1380; paper(g, 1000, h, '#fcf9f2');
  g.strokeStyle = 'rgba(176,122,28,.6)'; g.lineWidth = 2; g.strokeRect(30, 30, 940, h - 60);
  txt(g, 'ରାସ୍ତା ଅଧିକାର ଚୁକ୍ତିପତ୍ର', 60, 120, 44, INK, 'OdiaSerif', 700); txt(g, 'RIGHT OF WAY DEED  ·  REGISTERED', 60, 160, 19, GOLDI, 'InterT', 700, 'left', 4);
  bars(g, 60, 210, 880, 6, 34, 41, 'rgba(60,46,32,.3)');
  // the site sketch: road, lane, our plot, north
  const [a, b, c, d] = SKETCH; g.strokeStyle = 'rgba(42,33,25,.35)'; g.lineWidth = 1.5; g.strokeRect(a, b, c - a, d - b); g.save(); g.beginPath(); g.rect(a, b, c - a, d - b); g.clip();
  const R = ([x0, z0, x1, z1]) => { const [p, q] = skUV(x0, z0), [r, s] = skUV(x1, z1); return [p, q, r - p, s - q]; };
  g.fillStyle = 'rgba(206,170,96,.25)'; g.fillRect(...R(ROAD)); g.fillStyle = 'rgba(206,170,96,.14)'; g.fillRect(...R(LANE));
  g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(...R(ROAD)); g.strokeRect(...R(LANE)); g.lineWidth = 3; g.strokeRect(...R(OURS));
  g.lineWidth = 1.2; g.strokeStyle = 'rgba(42,33,25,.55)'; for (const p of PLOTS) if (!p.kind) { const [x0, z0] = p.poly[0], [x1, z1] = p.poly[2]; g.strokeRect(...R([x0, z0, x1, z1])); }
  g.font = '600 20px "OdiaSerif"'; g.fillStyle = INK; g.textAlign = 'center'; g.fillText('୩୪୨', ...skUV(5, -20)); g.fillText('୧୦୨୪', ...skUV(30, 76)); g.save(); g.translate(...skUV(4.5, 40)); g.rotate(-Math.PI / 2); g.fillText('୩୪୧', 0, 7); g.restore();
  g.restore(); txt(g, 'SITE SKETCH — not to scale', a, d + 30, 14, INK2, 'InterT', 600, 'left', 2);
  // the way, inked in gold (39.8 → 40.9)
  const pr = eio(seg(t, 39.75, 40.9)); if (pr > 0) { const pts = [[4.5, 74], [4.5, 30], [4.5, -10], [5, -20]].map(p => skUV(...p)); g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(214,150,40,.95)'; g.lineWidth = 9;
    g.beginPath(); g.moveTo(...pts[0]); let L = 0; const sl = []; for (let i = 1; i < pts.length; i++) { sl.push(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); L += sl[i - 1]; } let rem = L * pr;
    for (let i = 1; i < pts.length && rem > 0; i++) { const f = Math.min(1, rem / sl[i - 1]); g.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); rem -= sl[i - 1]; } g.stroke(); g.restore(); }
  bars(g, 60, 990, 880, 4, 34, 57, 'rgba(60,46,32,.3)');
  txt(g, 'GRANTOR', 120, 1300, 14, INK2, 'InterT', 700, 'left', 3); txt(g, 'GRANTEE', 560, 1300, 14, INK2, 'InterT', 700, 'left', 3);
  g.strokeStyle = 'rgba(42,33,25,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(120, 1275); g.lineTo(400, 1275); g.moveTo(560, 1275); g.lineTo(840, 1275); g.stroke();
  const sg = ss(seg(t, 40.2, 40.9)); if (sg > 0) { g.save(); g.globalAlpha *= sg; g.strokeStyle = 'rgba(40,50,100,.8)'; g.lineWidth = 2.5; sig(g, 140, 1262, 3); sig(g, 580, 1262, 8); g.restore(); }
  txt(g, 'Regd. No. ୨୦୨୬ / ୪୧୮୭', 940, 1340, 18, INK2, 'OdiaSerif', 600, 'right');
  // the embossed seal (pressed at 39.22)
  if (t > 39.2) seal(g, 800, 1150, 88, ss(seg(t, 39.2, 39.4)));
}
export function seal(g, x, y, R, a) {
  g.save(); g.globalAlpha *= a; g.translate(x, y);
  const gr = g.createRadialGradient(-R * .3, -R * .3, R * .1, 0, 0, R); gr.addColorStop(0, '#f6dc94'); gr.addColorStop(.6, '#d3a248'); gr.addColorStop(1, '#a8741f');
  g.fillStyle = gr; g.beginPath(); for (let i = 0; i <= 64; i++) { const ang = i / 64 * Math.PI * 2, r = R * (i % 2 ? .93 : 1); i ? g.lineTo(r * Math.cos(ang), r * Math.sin(ang)) : g.moveTo(r, 0); } g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,244,210,.8)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * .78, 0, 7); g.stroke(); g.strokeStyle = 'rgba(110,70,15,.6)'; g.beginPath(); g.arc(0, 0, R * .74, 0, 7); g.stroke();
  g.font = '700 13px "InterT"'; g.fillStyle = 'rgba(90,55,10,.85)'; g.textAlign = 'center'; g.textBaseline = 'middle'; const s = 'REGISTERED · ପଞ୍ଜୀକୃତ · REGISTERED · ପଞ୍ଜୀକୃତ · ';
  for (let i = 0; i < s.length; i++) { const ang = i / s.length * Math.PI * 2 - Math.PI / 2; g.save(); g.rotate(ang + Math.PI / 2); g.fillText(s[i], 0, -R * .86); g.restore(); }
  g.font = '700 30px "OdiaSerif"'; g.fillStyle = 'rgba(90,55,10,.9)'; g.fillText('✓', 0, 2); g.restore();
}

// —— the table: light from below, aluminium frame, the papers ——
export function drawTable(g, t, lit = 1) {
  const { x, z, w, d } = TABLE;
  const gr = g.createRadialGradient(x, z, .05, x, z, .95); gr.addColorStop(0, `rgb(${Math.round(lerp(28, 250, lit))},${Math.round(lerp(24, 245, lit))},${Math.round(lerp(20, 236, lit))})`); gr.addColorStop(1, `rgb(${Math.round(lerp(22, 226, lit))},${Math.round(lerp(19, 219, lit))},${Math.round(lerp(16, 206, lit))})`);
  g.fillStyle = gr; g.fillRect(x - w / 2, z - d / 2, w, d);
  const place = (d0, fn, o) => { const X = docXf(d0, o); g.save(); X.apply(g); fn(g, t); g.restore(); };
  place(DOCS.old1, (g, t) => oldPaper(g, t, 47, '#e9dcc0')); place(DOCS.old2, (g, t) => oldPaper(g, t, 31, '#eee3cb'));
  place(DOCS.deed, deed); place(DOCS.map, mapSheet); place(DOCS.chq, cheque);
  place(DOCS.c1, (g, t) => card(g, t, C1)); place(DOCS.c2, (g, t) => card(g, t, C2));
  if (t > 37.8) place(DOCS.reg, regDeed, regPos(t));
  // backlight: the papers glow at their edges where the light leaks; the room dims everything when the table is off
  if (lit < 1) { g.fillStyle = `rgba(8,6,4,${(1 - lit) * .8})`; g.fillRect(x - w / 2, z - d / 2, w, d); }
}
