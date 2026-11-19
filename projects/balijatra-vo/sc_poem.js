// The poem on palm leaves (a chitra-pothi): Kalidasa's Raghuvamsha 6.57 incised in Odia script; the king of the sea painted
// across three leaves; then a sea-chart whose route curls into a question mark.
import { W, H, clamp, lerp, seg, ss, eo, hh, bez, chain, partial, at, scent, clove, label } from './common.js';
import { initLeaf, drawLeaf, drawBoard, incise, inciseText, wipeText, hatchIn, cord, creeper, rv } from './sc_leaf.js';
export { initLeaf };
const X0 = 40, LW = 1000;
const LEAVES = [[330, 150, 3], [500, 160, 7], [680, 160, 11], [860, 160, 13], [1040, 160, 17]];
function stack(c, n = 5) { cord(c, X0 + 70, 290, 1230); cord(c, X0 + LW - 70, 290, 1230); for (let i = 0; i < n; i++) { const [y, h, s] = LEAVES[i]; drawLeaf(c, X0, y, LW, h, s); } }
function gild(c, txt, x, y, font, a = 1) {   // gold leaf laid into the incised groove
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle';
  const w = c.measureText(txt).width, g = c.createLinearGradient(x - w / 2, y - 30, x + w / 2, y + 30); g.addColorStop(0, '#9a6a14'); g.addColorStop(.45, '#ffe7a0'); g.addColorStop(.6, '#e9b949'); g.addColorStop(1, '#8a5a10');
  c.shadowColor = 'rgba(255,196,90,.75)'; c.shadowBlur = 18; c.fillStyle = g; c.fillText(txt, x, y); c.shadowBlur = 0; c.fillText(txt, x, y); c.restore();
}
// Raghuvamsha 6.57 (the Kalinga king, praised to Indumati): "… by the shores of the sea, where the palm groves rustle,
// the winds bringing clove blossoms from other islands will dry your sweat."
const VERSE = ['ଅନେନ ସାର୍ଦ୍ଧଂ ବିହରାମ୍ବୁରାଶେ-', 'ସ୍ତୀରେଷୁ ତାଳୀବନମର୍ମରେଷୁ ।', 'ଦ୍ୱୀପାନ୍ତରାନୀତ', 'ରପାକୃତସ୍ୱେଦଲବା ମରୁଦ୍ଭିଃ ॥'];
export function poemVerse(c, t, o = {}) {
  drawBoard(c); stack(c);
  const T0 = o.t0 ?? 5.0, F = '600 42px "OdiaSerif"';
  wipeText(c, 'ରଘୁବଂଶ', 540, 405, '700 72px "OdiaSerif"', rv(t, T0, .7));
  for (const d of [-1, 1]) incise(c, p => { const x = 540 + d * 250; p.arc(x, 405, 24, 0, 7); p.moveTo(x + 11, 405); p.arc(x, 405, 11, 0, 7); }, 1.8, rv(t, T0 + .5));
  wipeText(c, VERSE[0], 540, 580, F, rv(t, T0 + .7, .8)); wipeText(c, VERSE[1], 540, 760, F, rv(t, T0 + 1.3, .8));
  // the third quarter: ଦ୍ୱୀପାନ୍ତରାନୀତ + ଲବଙ୍ଗପୁଷ୍ପୈ (clove blossoms) laid in gold
  wipeText(c, VERSE[2], 360, 940, F, rv(t, T0 + 1.9, .6));
  const kg = rv(t, T0 + 2.4, .5); wipeText(c, 'ଲବଙ୍ଗପୁଷ୍ପୈ-', 700, 940, F, kg); gild(c, 'ଲବଙ୍ଗପୁଷ୍ପୈ-', 700, 940, F, ss(seg(t, T0 + 2.7, T0 + 3.1)));
  wipeText(c, VERSE[3], 540, 1120, F, rv(t, T0 + 2.6, .8));
  inciseText(c, '— ମହାକବି କାଳିଦାସ  ·  ରଘୁବଂଶ ୬.୫୭', 540, 1190, '600 24px "OdiaSerif"', .85 * rv(t, T0 + 3.2));
  // the stylus, still cutting the last line
  const sp = rv(t, T0 + 2.6, .8); if (sp < 1) { const x = 260 + 560 * sp; c.save(); c.translate(x, 1112); c.rotate(-.55); const g = c.createLinearGradient(0, -6, 0, 6); g.addColorStop(0, '#d8d2c4'); g.addColorStop(1, '#6a645a'); c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(18, -4); c.lineTo(330, -6); c.lineTo(330, 6); c.lineTo(18, 4); c.closePath(); c.fill(); c.restore(); }
  clove(c, 880, 950, 1.2, 1.3, 1);
}

// —— the king of the sea: a chitra-pothi picture across four leaves (incised line + muted washes, clipped to the leaves) ——
function leafClip(c, n = 4) { c.beginPath(); for (let i = 0; i < n; i++) { const [y, h] = LEAVES[i]; c.roundRect(X0 + 6, y + 6, LW - 12, h - 12, h * .3); } c.clip(); }
function king(c, t, a) {
  const wash = (col, al, path) => { if (al <= 0) return; c.save(); c.globalAlpha = al; c.fillStyle = col; c.beginPath(); path(c); c.fill(); c.restore(); };
  c.save(); leafClip(c);
  const HZ = 520;
  wash('#d8b27a', .25 * a, p => p.rect(40, 330, 1000, HZ - 330));              // a pale dawn sky
  wash('#3f7d80', .5 * a, p => p.rect(40, HZ, 1000, 520));                       // the sea
  for (let r = 0; r < 7; r++) for (let i = 0; i < 10; i++) { const x = 70 + i * 104 + (r % 2) * 52, y = HZ + 34 + r * 68;
    incise(c, p => { p.moveTo(x - 46, y + 14); p.quadraticCurveTo(x - 18, y - 20, x + 16, y - 4); p.arc(x + 7, y + 4, 9, -.6, 3.2); }, 1.4, .8 * a); }
  incise(c, p => { p.moveTo(50, HZ); p.lineTo(1030, HZ); }, 1.8, a);
  for (const [bx, s] of [[170, .75], [905, .6]]) { incise(c, p => { p.moveTo(bx - 52 * s, HZ - 4); p.quadraticCurveTo(bx, HZ + 16 * s, bx + 52 * s, HZ - 4); p.moveTo(bx, HZ - 4); p.lineTo(bx, HZ - 92 * s); p.rect(bx - 28 * s, HZ - 86 * s, 56 * s, 54 * s); }, 1.6, a); wash('#b5651a', .45 * a, p => p.rect(bx - 28 * s, HZ - 86 * s, 56 * s, 54 * s)); }
  // the throne: a great wave rearing into a curl; the king sits on its crest
  const wave = p => { p.moveTo(330, 1010); p.bezierCurveTo(320, 880, 400, 820, 520, 830); p.bezierCurveTo(660, 840, 760, 900, 730, 960); p.bezierCurveTo(706, 1004, 650, 996, 656, 960); p.bezierCurveTo(662, 930, 700, 936, 700, 956); p.bezierCurveTo(712, 910, 640, 880, 560, 880); p.bezierCurveTo(470, 884, 440, 940, 450, 1010); p.closePath(); };
  wash('#1f5a66', .7 * a, wave); incise(c, wave, 2.6, a);
  for (let k = 0; k < 6; k++) incise(c, p => { p.moveTo(350 + k * 16, 1000 - k * 22); p.quadraticCurveTo(400 + k * 18, 920 - k * 14, 480 + k * 22, 870 - k * 2); }, 1.1, .7 * a);
  // lap and legs folded (yellow dhoti), torso (red jama, gold dots), shoulders
  const lap = p => { p.moveTo(430, 880); p.bezierCurveTo(440, 840, 520, 820, 600, 826); p.bezierCurveTo(660, 830, 690, 860, 676, 884); p.closePath(); };
  wash('#e0a92a', .8 * a, lap); incise(c, lap, 2.2, a);
  const torso = p => { p.moveTo(500, 836); p.bezierCurveTo(490, 790, 492, 730, 520, 700); p.lineTo(600, 700); p.bezierCurveTo(626, 730, 628, 790, 612, 836); p.closePath(); };
  wash('#b02f1c', .78 * a, torso); incise(c, torso, 2.2, a);
  for (let k = 0; k < 10; k++) wash('#f1d27a', .9 * a, p => p.arc(512 + (k % 4) * 26, 726 + Math.floor(k / 4) * 34, 3.4, 0, 7));
  // the face in profile (looking right), the long painted eye, earring, beard line
  const face = p => { p.moveTo(530, 700); p.bezierCurveTo(512, 680, 510, 636, 528, 612); p.bezierCurveTo(544, 592, 574, 590, 588, 602); p.lineTo(596, 628); p.lineTo(612, 646); p.lineTo(598, 652); p.lineTo(602, 664); p.lineTo(592, 670); p.bezierCurveTo(594, 686, 582, 698, 566, 702); p.closePath(); };
  wash('#e8b47e', .9 * a, face); incise(c, face, 2, a);
  incise(c, p => { p.moveTo(562, 628); p.quadraticCurveTo(578, 618, 594, 630); p.quadraticCurveTo(578, 636, 562, 628); p.moveTo(560, 616); p.quadraticCurveTo(578, 606, 596, 616); }, 1.4, a);
  wash('#1a1510', a, p => p.arc(579, 627, 3.6, 0, 7));
  incise(c, p => p.arc(536, 650, 9, 0, 7), 1.6, a); wash('#e0a92a', .9 * a, p => p.arc(536, 664, 6, 0, 7));
  incise(c, p => { p.moveTo(520, 706); p.quadraticCurveTo(560, 724, 604, 704); }, 2, a);   // a necklace
  // the tiered crown (mukuta) with a jewel
  const crown = p => { p.moveTo(520, 612); p.lineTo(592, 604); p.lineTo(584, 574); p.lineTo(572, 572); p.lineTo(566, 540); p.lineTo(556, 538); p.lineTo(550, 500); p.lineTo(542, 538); p.lineTo(532, 542); p.lineTo(526, 576); p.lineTo(514, 580); p.closePath(); };
  wash('#e0a92a', .9 * a, crown); incise(c, crown, 2, a); wash('#b02f1c', .9 * a, p => p.arc(552, 590, 6, 0, 7));
  // the raised arm with a lotus; the other on the knee
  incise(c, p => { p.moveTo(604, 720); p.quadraticCurveTo(660, 730, 676, 680); p.lineTo(682, 640); }, 3, a);
  const lotus = p => { p.moveTo(682, 640); p.bezierCurveTo(660, 620, 664, 596, 682, 584); p.bezierCurveTo(700, 596, 704, 620, 682, 640); p.moveTo(682, 640); p.bezierCurveTo(664, 634, 650, 618, 654, 604); p.moveTo(682, 640); p.bezierCurveTo(700, 634, 714, 618, 710, 604); };
  wash('#d47a66', .85 * a, lotus); incise(c, lotus, 1.6, a);
  incise(c, p => { p.moveTo(508, 730); p.quadraticCurveTo(470, 790, 500, 840); }, 3, a);
  // the royal parasol (chhatra)
  incise(c, p => { p.moveTo(552, 500); p.lineTo(552, 420); }, 1.8, a);
  const um = p => { p.moveTo(450, 430); p.quadraticCurveTo(552, 350, 654, 430); p.closePath(); }; wash('#b02f1c', .7 * a, um); incise(c, um, 2, a);
  for (let k = 0; k < 8; k++) incise(c, p => p.arc(462 + k * 26, 436, 5, 0, Math.PI), 1.2, a);
  c.restore();
}
export function poemKing(c, t, o = {}) {
  drawBoard(c); stack(c); king(c, t, o.a ?? 1);
  const T0 = o.t0 ?? 11.2;
  wipeText(c, 'ମହୋଦଧିପତି', 540, 1105, '700 66px "OdiaSerif"', rv(t, T0, .8)); gild(c, 'ମହୋଦଧିପତି', 540, 1105, '700 66px "OdiaSerif"', ss(seg(t, T0 + .7, T0 + 1.2)));
  inciseText(c, 'ସମୁଦ୍ରର ସମ୍ରାଟ', 540, 1168, '600 28px "OdiaSerif"', rv(t, 13.8));
  for (let k = 0; k < 4; k++) { const u = (k / 4 + t * .08) % 1; clove(c, 140 + u * 820, 400 + Math.sin(u * 7 + k) * 30, .9, u * 9, .85); }
}
// —— the question: a sea-chart incised across the leaves; the route from Kalinga curls into "?" ——
export const ROUTE = chain(bez([250, 700], [420, 600], [620, 560], [760, 640]), bez([760, 640], [900, 720], [860, 900], [700, 900]), bez([700, 900], [600, 900], [560, 960], [560, 1030]));
export function poemChart(c, t, o = {}) {
  drawBoard(c); stack(c);
  const a = 1, kr = o.k ?? 1;
  // Kalinga's coast down the left, a deul on it; the islands far right
  incise(c, p => { p.moveTo(150, 340); p.bezierCurveTo(230, 520, 160, 700, 250, 880); p.bezierCurveTo(300, 980, 200, 1100, 240, 1200); }, 2.6, a);
  hatchIn(c, p => { p.moveTo(60, 330); p.lineTo(150, 340); p.bezierCurveTo(230, 520, 160, 700, 250, 880); p.bezierCurveTo(300, 980, 200, 1100, 240, 1200); p.lineTo(60, 1210); p.closePath(); }, 60, 330, 300, 1210, 5, -.7, 1, .7);
  incise(c, p => { p.moveTo(200, 700); p.quadraticCurveTo(196, 640, 214, 620); p.quadraticCurveTo(232, 640, 228, 700); p.closePath(); p.moveTo(214, 620); p.lineTo(214, 606); }, 1.8, a);
  inciseText(c, 'କଳିଙ୍ଗ', 150, 760, '700 30px "OdiaSerif"', a);
  for (const [x, y, rx, ry] of [[860, 420, 70, 30], [940, 560, 40, 22], [820, 1090, 90, 34], [930, 1180, 50, 20]]) incise(c, p => p.ellipse(x, y, rx, ry, .2, 0, 7), 2.2, a);
  for (let r = 0; r < 9; r++) for (let i = 0; i < 6; i++) { const x = 330 + i * 110 + (r % 2) * 55, y = 380 + r * 92; incise(c, p => { p.moveTo(x - 14, y); p.quadraticCurveTo(x, y - 10, x + 14, y); }, 1.1, .5 * a); }
  // the route: dotted, then gold as it curls into the question
  const q = partial(ROUTE, kr); c.save(); c.setLineDash([2, 12]); incise(c, p => { p.moveTo(q[0][0], q[0][1]); q.forEach(v => p.lineTo(v[0], v[1])); }, 3, a); c.restore();
  scent(c, ROUTE, t, kr, .9, { w: .7 });
  if (kr > .98) { clove(c, 560, 1080, 1.6, 0, 1); c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(560, 1075, 0, 560, 1075, 60); g.addColorStop(0, 'rgba(255,220,140,.6)'); g.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = g; c.fillRect(500, 1015, 120, 120); c.restore(); }
}
