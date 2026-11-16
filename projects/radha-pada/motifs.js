// Paper motifs: every function paints opaque shapes into a sheet mask (sheet coords, y down).
import { crPath } from './lightbox.js';

const poly = (m, P) => { m.beginPath(); crPath(m, P); m.fill(); };
const limb = (m, pts, w) => { m.save(); m.lineWidth = w; m.lineCap = 'round'; m.lineJoin = 'round'; m.beginPath(); m.moveTo(...pts[0]); for (const p of pts.slice(1)) m.lineTo(...p); m.strokeStyle = '#000'; m.stroke(); m.restore(); };
const T = (x, y, s, d = 1) => ([a, b]) => [x + a * s * d, y + b * s];

// ---------- the year dial: three rings of 365 day-holes and a lotus border ----------
export const DIAL = { x: 0, y: -60, R: [300, 340, 380], lit: 309 };
export function dialPos(i) { const ring = i % 3, k = Math.floor(i / 3), a = -Math.PI / 2 + k / 122 * Math.PI * 2; const r = DIAL.R[ring]; return [DIAL.x + Math.cos(a) * r, DIAL.y + Math.sin(a) * r]; }
export function dialCuts(m) {
  for (let i = 0; i < 365; i++) { const [x, y] = dialPos(i); m.beginPath(); m.arc(x, y, 5.6, 0, 7); m.fill(); }
  for (let k = 0; k < 24; k++) {   // lotus petals
    const a = k / 24 * Math.PI * 2; m.save(); m.translate(DIAL.x + Math.cos(a) * 455, DIAL.y + Math.sin(a) * 455); m.rotate(a + Math.PI / 2);
    m.beginPath(); m.moveTo(0, -38); m.quadraticCurveTo(20, 0, 0, 34); m.quadraticCurveTo(-20, 0, 0, -38); m.fill(); m.restore();
  }
  for (let k = 0; k < 12; k++) { const a = -Math.PI / 2 + k / 12 * Math.PI * 2; m.beginPath(); m.arc(DIAL.x + Math.cos(a) * 250, DIAL.y + Math.sin(a) * 250, 9, 0, 7); m.fill(); }
  // centre: a small lotus mandala
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; m.beginPath(); m.ellipse(DIAL.x + Math.cos(a) * 60, DIAL.y + Math.sin(a) * 60, 40, 15, a, 0, 7); m.fill(); }
  m.beginPath(); m.arc(DIAL.x, DIAL.y, 22, 0, 7); m.fill();
}

// ---------- feet, front view: sole body + five toes (big toe on the inner side) ----------
const BODY = [[-44, -212], [-52, -150], [-64, -84], [-62, -40], [-34, -26], [20, -24], [58, -38], [66, -92], [54, -158], [44, -212]];
const TOES = [[44, -8, 20, 27], [13, -2, 13, 18], [-11, -4, 12, 16], [-32, -10, 11, 14], [-51, -20, 10, 12]];
const footT = (x, y, s, d, gap) => ([a, b]) => [x + d * gap * s + a * s * -d, y + b * s];
export function feet(m, x, y, s, gap = 70) {
  for (const d of [-1, 1]) {
    const t = footT(x, y, s, d, gap); m.beginPath(); crPath(m, BODY.map(t)); m.fill();
    for (const [tx, ty, rx, ry] of TOES) { m.beginPath(); m.ellipse(...t([tx, ty]), rx * s, ry * s, 0, 0, 7); m.fill(); }
  }
}
export function feetAlta(m, x, y, s, gap = 70) {   // red toe tips, a red band along the sole edge, a ring on the top of the foot
  for (const d of [-1, 1]) {
    const t = footT(x, y, s, d, gap);
    for (const [tx, ty, rx, ry] of TOES) { m.beginPath(); m.ellipse(...t([tx, ty + ry * .45]), rx * .82 * s, ry * .5 * s, 0, 0, 7); m.fill(); }
    m.save(); m.lineWidth = 11 * s; m.lineJoin = 'round'; m.strokeStyle = '#000'; m.beginPath(); crPath(m, [[-52, -150], [-64, -84], [-62, -40], [-40, -28]].map(t), false); m.stroke();
    m.beginPath(); crPath(m, [[54, -158], [66, -92], [60, -44]].map(t), false); m.stroke(); m.restore();
    m.beginPath(); m.arc(...t([4, -110]), 17 * s, 0, 7); m.fill();
  }
}
export function feetCutsAlta(m, x, y, s, gap = 70) { for (const d of [-1, 1]) { const t = footT(x, y, s, d, gap); m.beginPath(); m.arc(...t([4, -110]), 8 * s, 0, 7); m.fill(); } }
export function anklets(m, x, y, s, gap = 70) {
  for (const d of [-1, 1]) for (let k = -3; k <= 3; k++) { m.beginPath(); m.arc(x + d * gap * s + k * 15 * s, y - 182 * s + Math.abs(k) * -2 * s, 6.5 * s, 0, 7); m.fill(); }
}
// a saree hem (pleats) above the feet; returns nothing
export function hem(m, x, y, s, w = 260) {
  m.beginPath(); m.moveTo(x - w * s, y - 900 * s); m.lineTo(x + w * s, y - 900 * s); m.lineTo(x + w * s * .98, y);
  for (let k = 8; k >= 0; k--) m.quadraticCurveTo(x + (-w + (k + .5) * 2 * w / 9) * s, y + 16 * s, x + (-w + k * 2 * w / 9) * s, y);
  m.closePath(); m.fill();
}
export function hemCuts(m, x, y, s, w = 260) { for (let k = 1; k < 9; k++) { const xx = x + (-w + k * 2 * w / 9) * s; m.fillRect(xx - 2 * s, y - 420 * s, 4 * s, 330 * s); } }
export function hemBorder(m, x, y, s, w = 260) {   // ikat-style border band
  m.fillRect(x - w * s, y - 70 * s, 2 * w * s, 58 * s);
}
export function hemBorderCuts(m, x, y, s, w = 260) {
  for (let k = 0; k < 18; k++) { const xx = x + (-w + 15 + k * (2 * w - 30) / 17) * s, yy = y - 41 * s; m.beginPath(); m.moveTo(xx, yy - 16 * s); m.lineTo(xx + 11 * s, yy); m.lineTo(xx, yy + 16 * s); m.lineTo(xx - 11 * s, yy); m.fill(); }
}

// ---------- women in saree, profile; returns the lamp flame point ----------
export function woman(m, x, y, s, d = 1, arm = 'lamp') {
  const t = T(x, y, s, d);
  poly(m, [[-62, 0], [-72, -120], [-60, -250], [-52, -350], [-44, -425], [-34, -488], [2, -514], [34, -500], [46, -470], [42, -452], [48, -444], [36, -436], [34, -424], [28, -414], [44, -370], [38, -290], [48, -200], [62, -20], [74, 0]].map(t));
  if (arm === 'lamp') { limb(m, [[14, -400], [62, -352], [100, -340]].map(t), 20 * s); m.beginPath(); m.ellipse(...t([110, -338]), 36 * s, 7 * s, 0, 0, 7); m.fill(); return t([110, -356]); }
  if (arm === 'thread') { limb(m, [[14, -400], [58, -330], [96, -300]].map(t), 20 * s); return t([100, -300]); }
  limb(m, [[14, -400], [40, -320], [42, -250]].map(t), 20 * s); return null;
}
// ---------- the priest's daughter (profile, facing right); body without the right arm ----------
export function girl(m, x, y, s) {
  const t = T(x, y, s);
  poly(m, [[-70, 0], [-58, -110], [-36, -200], [-30, -250], [-34, -300], [-30, -330], [-38, -360], [-30, -392], [-4, -406], [22, -398], [32, -378], [38, -364], [32, -356], [34, -346], [26, -338], [20, -326], [26, -300], [30, -250], [36, -200], [58, -110], [72, 0]].map(t));
  // braid down the back with a flower
  limb(m, [[-30, -372], [-48, -330], [-52, -280], [-48, -240]].map(t), 16 * s);
  m.beginPath(); m.arc(...t([-34, -382]), 13 * s, 0, 7); m.fill();
}
export function girlArm(m, x, y, s) { const t = T(x, y, s); limb(m, [[4, -312], [34, -260], [62, -226]].map(t), 15 * s); }
export const GIRL_SHOULDER = (x, y, s) => [x + 4 * s, y - 312 * s];

// ---------- priest, profile, raising an arati plate; returns flame ----------
export function priest(m, x, y, s, d = 1) {
  const t = T(x, y, s, d);
  poly(m, [[-60, 0], [-58, -130], [-48, -240], [-56, -330], [-50, -380], [-36, -410], [-30, -440], [-6, -462], [22, -452], [30, -430], [40, -418], [30, -404], [24, -392], [30, -380], [46, -330], [42, -250], [56, -140], [64, 0]].map(t));
  limb(m, [[-28, -462], [-40, -486]].map(t), 7 * s);   // tuft (sikha)
  limb(m, [[18, -372], [70, -360], [100, -430]].map(t), 20 * s);
  m.beginPath(); m.ellipse(...t([104, -440]), 38 * s, 7 * s, 0, 0, 7); m.fill();
  return t([104, -460]);
}

// ---------- Gopinath: flute, peacock crown, on a pedestal; yb = pedestal bottom ----------
export function pedestal(m, x, yb, s) {
  m.fillRect(x - 120 * s, yb - 70 * s, 240 * s, 70 * s);
  m.beginPath(); m.ellipse(x, yb - 70 * s, 132 * s, 20 * s, 0, 0, 7); m.fill();
  m.fillRect(x - 140 * s, yb - 12 * s, 280 * s, 12 * s);
}
export function pedestalCuts(m, x, yb, s) { for (let k = 0; k < 9; k++) { const xx = x + (-100 + k * 25) * s; m.beginPath(); m.ellipse(xx, yb - 38 * s, 7 * s, 16 * s, 0, 0, 7); m.fill(); } }
export function gopinath(m, x, yb, s) {
  const t = T(x, yb - 70 * s, s);
  poly(m, [[-46, 0], [-60, -60], [-72, -120], [-56, -200], [-38, -215], [-50, -300], [-72, -330], [-18, -346], [-16, -352], [16, -352], [18, -346], [72, -330], [52, -300], [38, -215], [56, -200], [70, -120], [58, -60], [48, 0]].map(t));
  m.beginPath(); m.arc(...t([0, -388]), 36 * s, 0, 7); m.fill();
  poly(m, [[-30, -410], [-24, -470], [24, -470], [30, -410]].map(t));                     // crown
  poly(m, [[10, -462], [18, -510], [44, -556], [66, -560], [62, -532], [34, -480], [24, -456]].map(t)); // peacock feather
  limb(m, [[-72, -325], [-46, -270], [22, -372]].map(t), 22 * s);
  limb(m, [[72, -325], [112, -282], [86, -374]].map(t), 22 * s);
  limb(m, [[-20, -378], [160, -386]].map(t), 9 * s);                                       // flute
}
export function gopinathCuts(m, x, yb, s) {
  const t = T(x, yb - 70 * s, s);
  m.beginPath(); m.ellipse(...t([50, -532]), 9 * s, 13 * s, .6, 0, 7); m.fill();         // feather eye
  for (let k = 0; k < 11; k++) { const a = Math.PI * (.12 + k * .076); m.beginPath(); m.arc(...t([Math.cos(a) * 44, -350 + Math.sin(a) * 120]), 6 * s, 0, 7); m.fill(); } // vanamala
  for (let k = 0; k < 4; k++) { m.beginPath(); m.arc(...t([-14 + k * 30, -440]), 5 * s, 0, 7); m.fill(); }
}
// ---------- Radha: head, veil, torso, arms (top), and two skirts ----------
export function radhaTop(m, x, yb, s) {
  const t = T(x, yb - 70 * s, s);
  poly(m, [[-36, -205], [-48, -296], [-66, -318], [-56, -360], [-44, -404], [-20, -428], [0, -432], [20, -428], [44, -404], [56, -360], [66, -318], [48, -296], [36, -205]].map(t));
  limb(m, [[-60, -312], [-80, -250], [-44, -212]].map(t), 18 * s);
  limb(m, [[60, -312], [96, -270], [88, -330]].map(t), 18 * s);                            // right hand raised in blessing
  m.beginPath(); m.arc(...t([90, -336]), 13 * s, 0, 7); m.fill();
}
export function radhaFaceCut(m, x, yb, s) {   // the face is an open window in the veil (never detailed)
  const t = T(x, yb - 70 * s, s); m.beginPath(); m.ellipse(...t([0, -378]), 24 * s, 31 * s, 0, 0, 7); m.fill();
}
export function radhaFace(m, x, yb, s) { const t = T(x, yb - 70 * s, s); m.beginPath(); m.ellipse(...t([0, -378]), 25 * s, 32 * s, 0, 0, 7); m.fill(); }
export function ghagra(m, x, yb, s) {
  const t = T(x, yb - 70 * s, s);
  m.beginPath(); m.moveTo(...t([-38, -214])); m.lineTo(...t([38, -214])); m.quadraticCurveTo(...t([110, -120]), ...t([158, 8]));
  for (let k = 10; k >= 0; k--) m.quadraticCurveTo(...t([-158 + (k + .5) * 31.6, 22]), ...t([-158 + k * 31.6, 8]));
  m.quadraticCurveTo(...t([-110, -120]), ...t([-38, -214])); m.fill();
}
export function ghagraCuts(m, x, yb, s) {   // mirror-work: rows of round holes
  const t = T(x, yb - 70 * s, s);
  for (let r = 0; r < 5; r++) { const yy = -170 + r * 38, half = 44 + r * 24; for (let k = 0; k <= 6 + r * 2; k++) { m.beginPath(); m.arc(...t([-half + k * (2 * half) / (6 + r * 2), yy]), 5.5 * s, 0, 7); m.fill(); } }
}
export function saree(m, x, yb, s) {
  const t = T(x, yb - 70 * s, s);
  poly(m, [[-38, -216], [-60, -150], [-68, -70], [-70, -26], [70, -26], [68, -70], [60, -150], [38, -216]].map(t));
  poly(m, [[-58, -312], [-30, -320], [44, -214], [64, -150], [40, -150], [-50, -270]].map(t));   // pallu across the chest
}
export function sareeCuts(m, x, yb, s) { const t = T(x, yb - 70 * s, s); for (let k = -2; k <= 2; k++) m.fillRect(...t([k * 12 - 2, -150]), 3.5 * s, 108 * s); }
export function sareeBorder(m, x, yb, s) {
  const t = T(x, yb - 70 * s, s);
  poly(m, [[-71, -46], [71, -46], [71, -26], [-71, -26]].map(t));
  poly(m, [[-58, -312], [-46, -318], [56, -156], [44, -150]].map(t));
}
export function smallFeet(m, x, yb, s) { feet(m, x, yb - 70 * s + 1 * s, s * .2, 120); }

// ---------- the temple tower (rekha deul + pidha porch), flag; returns window points ----------
export function temple(m, x, base, s) {
  const deul = (cx, w, h) => {
    m.beginPath(); m.moveTo(cx - w / 2, base); m.bezierCurveTo(cx - w * .52, base - h * .55, cx - w * .42, base - h * .85, cx - w * .16, base - h * .95);
    m.lineTo(cx + w * .16, base - h * .95); m.bezierCurveTo(cx + w * .42, base - h * .85, cx + w * .52, base - h * .55, cx + w / 2, base); m.closePath(); m.fill();
    m.beginPath(); m.ellipse(cx, base - h * .97, w * .25, h * .045, 0, 0, 7); m.fill();
    m.beginPath(); m.moveTo(cx - w * .06, base - h); m.quadraticCurveTo(cx, base - h * 1.12, cx + w * .06, base - h); m.fill();
  };
  deul(x + 80 * s, 230 * s, 560 * s);
  m.beginPath(); m.moveTo(x - 260 * s, base);                                                // pidha porch: stepped tiers
  for (let k = 0; k < 5; k++) { const w = 150 - k * 22, yy = base - 120 * s - k * 46 * s; m.lineTo(x - 90 * s - w * s, yy + 20 * s); m.lineTo(x - 90 * s - w * s + 14 * s, yy); m.lineTo(x - 90 * s + w * s - 14 * s, yy); m.lineTo(x - 90 * s + w * s, yy + 20 * s); }
  m.lineTo(x - 90 * s, base - 380 * s); m.lineTo(x + 60 * s, base); m.closePath(); m.fill();
  m.fillRect(x - 300 * s, base - 30 * s, 560 * s, 30 * s);
  m.save(); m.lineWidth = 5 * s; m.strokeStyle = '#000'; m.beginPath(); m.moveTo(x + 80 * s, base - 600 * s); m.lineTo(x + 80 * s, base - 690 * s); m.stroke(); m.restore();
  m.beginPath(); m.moveTo(x + 80 * s, base - 690 * s); m.quadraticCurveTo(x + 130 * s, base - 680 * s, x + 160 * s, base - 660 * s); m.lineTo(x + 80 * s, base - 650 * s); m.fill();
}
export function templeWindows(x, base, s) { return [[x + 80 * s, base - 120 * s, 26], [x + 80 * s, base - 300 * s, 16], [x - 90 * s, base - 80 * s, 30], [x - 190 * s, base - 70 * s, 14], [x + 10 * s, base - 70 * s, 14]].map(([a, b, r]) => [a, b, r * s]); }
export function templeCuts(m, x, base, s) { for (const [a, b, r] of templeWindows(x, base, s)) { m.beginPath(); m.moveTo(a - r, b + r * 1.4); m.lineTo(a - r, b - r * .4); m.quadraticCurveTo(a, b - r * 1.8, a + r, b - r * .4); m.lineTo(a + r, b + r * 1.4); m.fill(); } }

// ---------- amla tree: trunk, feathery crown, fruit points ----------
export function amla(m, x, base, s, R) {
  limb(m, [[x, base], [x - 8 * s, base - 260 * s], [x + 6 * s, base - 420 * s]], 46 * s);
  limb(m, [[x - 4 * s, base - 300 * s], [x - 150 * s, base - 470 * s]], 22 * s); limb(m, [[x + 4 * s, base - 340 * s], [x + 160 * s, base - 500 * s]], 22 * s);
  for (let k = 0; k < 70; k++) { const a = R() * Math.PI * 2, q = Math.sqrt(R()); m.beginPath(); m.ellipse(x + Math.cos(a) * q * 300 * s, base - 560 * s + Math.sin(a) * q * 200 * s, (60 + R() * 50) * s, (40 + R() * 30) * s, R(), 0, 7); m.fill(); }
}
export function amlaCuts(m, x, base, s, R) {   // leaflet slits (lace)
  for (let k = 0; k < 260; k++) { const a = R() * Math.PI * 2, q = Math.sqrt(R()), cx = x + Math.cos(a) * q * 330 * s, cy = base - 560 * s + Math.sin(a) * q * 220 * s; m.save(); m.translate(cx, cy); m.rotate(R() * 3); m.beginPath(); m.ellipse(0, 0, 13 * s, 3.2 * s, 0, 0, 7); m.fill(); m.restore(); }
}
export function amlaFruit(x, base, s, R) { const out = []; for (let k = 0; k < 26; k++) { const a = R() * Math.PI * 2, q = Math.sqrt(R()) * .9; out.push([x + Math.cos(a) * q * 300 * s, base - 560 * s + Math.sin(a) * q * 200 * s, (11 + R() * 6) * s]); } return out; }

// ---------- palanquin with four bearers (facing right) ----------
export function palanquin(m, x, y, s) {
  const t = T(x, y, s);
  limb(m, [[-330, -250], [330, -250]].map(t), 12 * s);                                        // poles
  poly(m, [[-120, -230], [-120, -380], [-100, -420], [0, -470], [100, -420], [120, -380], [120, -230]].map(t)); // box + dome
  limb(m, [[0, -470], [0, -510]].map(t), 7 * s); m.beginPath(); m.arc(...t([0, -515]), 10 * s, 0, 7); m.fill();
  for (const bx of [-290, -200, 200, 290]) {
    poly(m, [[-24, 0], [-14, -120], [-22, -200], [-18, -238], [0, -262], [18, -238], [22, -200], [14, -120], [30, 0]].map(([a, b]) => t([bx + a, b])));
    m.beginPath(); m.arc(...t([bx + 4, -280]), 18 * s, 0, 7); m.fill();
    limb(m, [[bx - 26, -110], [bx - 50, 0]].map(t), 14 * s); limb(m, [[bx + 16, -110], [bx + 46, 0]].map(t), 14 * s);
  }
}
export function palanquinCuts(m, x, y, s) { const t = T(x, y, s); for (let k = 0; k < 4; k++) { m.beginPath(); m.ellipse(...t([-75 + k * 50, -310]), 15, 40, 0, 0, 7); m.fill(); } }

// ---------- diya ----------
export function diya(m, x, y, s) { m.beginPath(); m.moveTo(x - 34 * s, y - 12 * s); m.quadraticCurveTo(x, y + 26 * s, x + 34 * s, y - 12 * s); m.quadraticCurveTo(x + 40 * s, y - 20 * s, x + 46 * s, y - 24 * s); m.lineTo(x + 30 * s, y - 14 * s); m.closePath(); m.fill(); }
export { poly, limb };
