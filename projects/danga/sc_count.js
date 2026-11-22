// Counting. The gold year dial (four syllables → four months, the Sadhabas' voyage tallied round it), and the single gold line
// that draws the mother at the ghat and then her hand — counting months on the twelve joints of her fingers, later festivals.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk, bez, chain, partial } from './common.js';
export const MONTHS = ['ବୈଶାଖ', 'ଜ୍ୟେଷ୍ଠ', 'ଆଷାଢ଼', 'ଶ୍ରାବଣ', 'ଭାଦ୍ରବ', 'ଆଶ୍ୱିନ', 'କାର୍ତ୍ତିକ', 'ମାର୍ଗଶିର', 'ପୌଷ', 'ମାଘ', 'ଫାଲ୍ଗୁନ', 'ଚୈତ୍ର'];
export const FOUR_IDX = [2, 6, 9, 0];   // ଆ→ଆଷାଢ଼, କା→କାର୍ତ୍ତିକ, ମା→ମାଘ, ବୈ→ବୈଶାଖ
export const DIAL = { x: 540, y: 820, r: 330 };
export const ang = i => -Math.PI / 2 + i * Math.PI / 6;
export const onRing = (i, r = DIAL.r) => [DIAL.x + Math.cos(ang(i)) * r, DIAL.y + Math.sin(ang(i)) * r];
const GOLD = 'rgba(244,206,130,.95)';
function glowStroke(c, draw, lw, a = 1) { c.save(); c.globalAlpha = a; c.strokeStyle = GOLD; c.lineCap = 'round'; c.lineJoin = 'round';
  c.save(); c.globalCompositeOperation = 'lighter'; c.filter = 'blur(6px)'; c.globalAlpha = a * .5; c.lineWidth = lw * 2.4; draw(); c.restore(); c.lineWidth = lw; draw(); c.restore(); }
// o: ring (0..1 drawn), names (per-month expansion 0..1 for the four), voyage (0..1), tally (0..1), a
export function dial(c, t, o) {
  const { ring = 1, names = [0, 0, 0, 0], voyage = 0, tally = 0, a = 1, others = 0 } = o; if (a <= 0) return;
  const { x, y, r } = DIAL;
  glowStroke(c, () => { c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); c.stroke(); }, 2.2, a);
  glowStroke(c, () => { c.beginPath(); c.arc(x, y, r - 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); c.stroke(); }, 1, a * .6);
  for (let i = 0; i < 12; i++) { const k = ss(seg(ring, i / 12, i / 12 + .15)); if (k <= 0) continue; const [x0, y0] = onRing(i, r - 22), [x1, y1] = onRing(i, r + 14); glowStroke(c, () => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }, 1.6, a * k); }
  c.save(); c.globalAlpha = a * others; c.font = '500 26px "OdiaSerif"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(236,210,160,.5)';
  for (let i = 0; i < 12; i++) { if (FOUR_IDX.includes(i)) continue; const [lx, ly] = onRing(i, r + 52); c.fillText(MONTHS[i], lx, ly); } c.restore();
  FOUR_IDX.forEach((mi, k) => { const e = names[k]; if (e <= 0) return; const [lx, ly] = onRing(mi, r + 66);   // the month's full name
    c.save(); c.globalAlpha = a * e; c.font = '700 44px "OdiaSerif"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = 'rgba(255,190,90,.9)'; c.shadowBlur = 20 * e; c.fillStyle = '#ffe0a0'; c.fillText(MONTHS[mi], lx, ly + (1 - eo(e)) * 10); c.restore(); });
  if (voyage > 0) {   // the Sadhabas' year: out in Kartika, round through Magha and Baisakha, home by Ashadha — tallied month by month
    const a0 = ang(6), a1 = ang(14), aN = lerp(a0, a1, eio(voyage));
    glowStroke(c, () => { c.beginPath(); c.arc(x, y, r - 60, a0, aN); c.stroke(); }, 1.6, a * .8);
    const n = Math.floor(8 * clamp(tally) + .001);
    for (let m = 0; m < n; m++) { const am = lerp(a0, a1, (m + .5) / 8); for (let s = 0; s < 4; s++) { const aa = am + (s - 1.5) * .025, x0 = x + Math.cos(aa) * (r - 92), y0 = y + Math.sin(aa) * (r - 92), x1 = x + Math.cos(aa) * (r - 118), y1 = y + Math.sin(aa) * (r - 118); glowStroke(c, () => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }, 1.8, a); } }
    const bx = x + Math.cos(aN) * (r - 60), by = y + Math.sin(aN) * (r - 60); lineBoita(c, bx, by, .5, aN + Math.PI / 2, a);
  }
}
export function lineBoita(c, x, y, s, rot, a = 1) {   // a boita drawn in one gold line
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  glowStroke(c, () => { c.beginPath(); c.moveTo(-90, -6); c.quadraticCurveTo(-60, 26, 0, 26); c.quadraticCurveTo(60, 26, 92, -10); c.lineTo(104, -30); c.moveTo(-90, -6); c.lineTo(-100, -24);
    c.moveTo(-6, 20); c.lineTo(-6, -120); c.moveTo(-60, -110); c.quadraticCurveTo(-6, -96, 48, -110); c.quadraticCurveTo(60, -70, 48, -30); c.quadraticCurveTo(-6, -18, -60, -30); c.quadraticCurveTo(-48, -70, -60, -110); c.stroke(); }, 2.2 / s, a);
  c.restore();
}

// ———————————————— the single line: the mother at the ghat ↔ her counting hand ————————————————
const L = (x0, y0, x1, y1, n = 10) => Array.from({ length: n + 1 }, (_, i) => [lerp(x0, x1, i / n), lerp(y0, y1, i / n)]);
export const GHAT = (() => {   // in screen px: steps, the river, the mother from behind — pallu over her head, its border across her back, the pleats
  const S = [];
  for (let k = 0; k < 4; k++) S.push(L(0, 1200 + k * 40, 760 - k * 70, 1200 + k * 40, 20));   // the ghat's steps
  S.push(L(0, 980, W, 980, 40));                                                               // the river's far line
  S.push(chain(bez([250, 1196], [268, 1130], [280, 1090], [288, 1052], 14), bez([288, 1052], [292, 1010], [300, 980], [302, 950], 12), bez([302, 950], [292, 900], [282, 850], [286, 812], 12),
    bez([286, 812], [300, 786], [326, 772], [344, 756], 12), bez([344, 756], [338, 720], [340, 676], [362, 652], 12), bez([362, 652], [380, 630], [420, 630], [436, 656], 12),
    bez([436, 656], [454, 680], [456, 724], [448, 756], 12), bez([448, 756], [470, 772], [494, 786], [504, 816], 12), bez([504, 816], [508, 860], [494, 906], [484, 950], 12),
    bez([484, 950], [488, 990], [500, 1020], [500, 1054], 12), bez([500, 1054], [504, 1110], [514, 1160], [520, 1196], 14)));   // her outline: covered head, sloping shoulders, waist, the saree flaring to the hem
  S.push(bez([250, 1196], [330, 1184], [440, 1208], [520, 1196], 16));                          // the hem
  S.push(bez([448, 760], [430, 860], [370, 950], [296, 1010], 24)); S.push(bez([462, 790], [440, 884], [380, 972], [300, 1034], 24));   // the pallu's border, falling from her head across her back
  for (const x0 of [360, 392, 424]) S.push(bez([x0, 1080], [x0 - 4, 1120], [x0 + 4, 1160], [x0 - 6, 1194], 10));   // pleats
  S.push(bez([362, 670], [384, 656], [414, 658], [428, 676], 10));                              // the knot of her hair beneath the cloth
  return S;
})();
// the hand, palm toward us: four slender fingers fanned from the knuckles, the thumb on the left; 12 joints = 12 months
const HY = -120, FING = [[372, 900 + HY, 318, 84, -.12], [488, 878 + HY, 360, 86, -.03], [600, 888 + HY, 332, 82, .05], [700, 914 + HY, 262, 72, .14]];   // [x, knuckle y, length, width, lean]
const fpt = ([x, y, L_, w, th], u, v) => { const lx = v * w / 2 * (1 - .22 * u), ly = -u * L_; return [x + lx * Math.cos(th) - ly * Math.sin(th), y + lx * Math.sin(th) + ly * Math.cos(th)]; };   // u along the finger (0 knuckle → 1 tip), v across (−1..1)
export const SEGS = (() => { const out = []; for (let f = 3; f >= 0; f--) for (let s = 0; s < 3; s++) out.push(fpt(FING[f], (s + .5) / 3 * .92, 0)); return out; })();   // little finger base → index tip
export const HAND = (() => {
  const S = [], P = [];
  P.push([318, 1440 + HY], [324, 1260 + HY], [314, 1130 + HY], [330, 1010 + HY]);   // wrist → beside the thumb
  FING.forEach((f, i) => { const [x, y, L_, w] = f; P.push(fpt(f, i ? .02 : .0, -1)); for (let k = 0; k <= 16; k++) P.push(fpt(f, k / 16 * .9, -1 + 0 * k)); for (let k = 0; k <= 12; k++) { const a = Math.PI + k / 12 * Math.PI, u = .9 + Math.sin(a - Math.PI) * .1 * 0 - Math.sin(a) * .1; P.push(fpt(f, .9 - Math.sin(a) * .1 * (w / L_ * 4), Math.cos(a + Math.PI))); }
    for (let k = 16; k >= 0; k--) P.push(fpt(f, k / 16 * .9, 1)); });
  P.push([748, 1000 + HY], [770, 1180 + HY], [756, 1310 + HY], [740, 1440 + HY]);   // the palm's outer edge, the wrist
  S.push(P);
  FING.forEach(f => { for (let s = 1; s <= 2; s++) { const u = s / 3 * .92; S.push([fpt(f, u, -.7), fpt(f, u + .012, 0), fpt(f, u, .7)]); } });   // joint creases
  S.push(bez([338, 1060 + HY], [460, 1030 + HY], [600, 1080 + HY], [732, 1010 + HY], 24)); S.push(bez([346, 1150 + HY], [480, 1190 + HY], [580, 1150 + HY], [700, 1220 + HY], 24));   // palm lines
  S.push(L(312, 1396 + HY, 750, 1396 + HY, 20)); S.push(L(314, 1424 + HY, 746, 1424 + HY, 20));   // shankha and pola at the wrist
  return S;
})();
export function thumb(c, target, a, press = 0) {   // the thumb: from its root, curving to touch a joint
  const [tx, ty] = target, P = bez([312, 1000], [250, 860], [tx - 110, ty + 110], [tx - 24, ty + 16], 30);
  c.save(); c.globalAlpha = a; c.strokeStyle = GOLD; c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [lw, al, bl] of [[52, .12, 10], [46, 1, 0]]) { c.save(); c.globalAlpha = a * al; if (bl) { c.filter = `blur(${bl}px)`; c.globalCompositeOperation = 'lighter'; }
    c.lineWidth = lw; c.strokeStyle = bl ? GOLD : 'rgba(20,12,9,1)'; c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.restore(); }
  const edge = (side) => P.map(([x, y], i) => { const [x2, y2] = P[Math.min(P.length - 1, i + 1)], [x0, y0] = P[Math.max(0, i - 1)], dx = x2 - x0, dy = y2 - y0, l = Math.hypot(dx, dy) || 1; return [x - dy / l * 22 * side, y + dx / l * 22 * side]; });
  glowStroke(c, () => { for (const sd of [-1, 1]) { const e = edge(sd); c.beginPath(); e.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); } const [ex, ey] = P[P.length - 1]; c.beginPath(); c.arc(ex, ey, 22, 0, 7); c.stroke(); }, 2.2, 1);
  if (press > 0) { c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(tx, ty, 0, tx, ty, 70); g.addColorStop(0, `rgba(255,220,150,${.7 * press})`); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(tx - 70, ty - 70, 140, 140); }
  c.restore();
}
function resample(strokes, N) {
  const lens = strokes.map(s => { let L_ = 0; for (let i = 1; i < s.length; i++) L_ += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); return L_; }), tot = lens.reduce((a, b) => a + b, 0), out = [];
  strokes.forEach((s, k) => { const n = Math.max(2, Math.round(N * lens[k] / tot)); for (let i = 0; i < n; i++) { const q = partial(s, i / (n - 1)); out.push([...q[q.length - 1], k]); } });
  while (out.length > N) out.splice(Math.floor(out.length / 2), 1); while (out.length < N) out.push(out[out.length - 1]); return out;
}
const NM = 900; let RG, RH;
// draw = how much of the line is drawn (0..1, as one continuous gesture); m = morph ghat (0) → hand (1)
export function oneLine(c, t, draw, m, a = 1) {
  if (a <= 0) return; if (!RG) { RG = resample(GHAT, NM); RH = resample(HAND, NM); }
  const e = eio(m), P = RG.map(([x, y, k], i) => [lerp(x, RH[i][0], e), lerp(y, RH[i][1], e), e < .5 ? k : RH[i][2]]);
  const n = Math.floor(NM * clamp(draw));
  glowStroke(c, () => { c.beginPath(); for (let i = 1; i < n; i++) { if (P[i][2] !== P[i - 1][2] && (m < .02 || m > .98)) continue; c.moveTo(P[i - 1][0], P[i - 1][1]); c.lineTo(P[i][0], P[i][1]); } c.stroke(); }, 2.4, a);
  if (draw < 1 && n > 1) { const [x, y] = P[n - 1]; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, 30); g.addColorStop(0, `rgba(255,240,200,${.9 * a})`); g.addColorStop(1, 'rgba(255,210,140,0)'); c.fillStyle = g; c.fillRect(x - 30, y - 30, 60, 60); c.restore(); }   // the pen's point
}
export const FESTS = ['ଦଶହରା', 'ଦୀପାବଳି', 'କାର୍ତ୍ତିକ ପୂନେଇଁ', 'ଧନୁଯାତ୍ରା', 'ମକର', 'ସରସ୍ୱତୀ ପୂଜା', 'ଦୋଳ', 'ପଣା ସଂକ୍ରାନ୍ତି', 'ରଜ', 'ରଥଯାତ୍ରା', 'ଗଣେଶ ପୂଜା', 'ନୂଆଖାଇ'];
export function jointLabels(c, t, labels, flip, active, a = 1) {   // labels on the twelve joints; flip (0..1) flips them like a departure board
  if (a <= 0) return; c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
  SEGS.forEach(([x, y], i) => { const f = clamp(flip * 1.6 - i * .05), sq = Math.abs(Math.cos(f * Math.PI)), txt = f < .5 ? labels[0][i] : labels[1][i], on = active === i;
    c.save(); c.globalAlpha = a * (on ? 1 : .62); c.translate(x, y); c.scale(1, Math.max(.02, sq)); c.font = `${on ? 700 : 600} ${txt.length > 6 ? 20 : 24}px "OdiaSerif"`;
    if (on) { c.shadowColor = 'rgba(255,190,90,1)'; c.shadowBlur = 18; } c.fillStyle = on ? '#fff0c8' : '#f2d8a8'; c.fillText(txt, 0, 0); c.restore(); });
  c.restore();
}
