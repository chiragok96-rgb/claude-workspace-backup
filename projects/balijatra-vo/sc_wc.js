// Watercolour scenes: the Kalinga shore at dawn (open + loop), the earth in section, the two kendis that match.
import { W, H, clamp, lerp, seg, ss, eo, hh, bez, chain, scent, clove, caption, label, at } from './common.js';
import { drawLeaf, incise } from './sc_leaf.js';
let PL = {};
export function initWC(plates) { PL = plates; }

// the scent's path: from the far isle on the horizon, in on the breeze, curling down to the palm leaf on the sand
export const SHORE_SCENT = chain(bez([930, 905], [760, 820], [600, 760], [430, 860]), bez([430, 860], [250, 960], [320, 1120], [520, 1080]), bez([520, 1080], [700, 1040], [640, 1210], [470, 1250]));
export function wcShore(c, t, o = {}) {
  c.drawImage(PL.shore, 0, 0);
  drawLeaf(c, 220, 1210, 640, 110, 21, -.06);          // a palm-leaf manuscript lying on the sand
  const p = o.p ?? 1; scent(c, SHORE_SCENT, t, p, 1, { op: 'source-over', col: [196, 140, 52], w: 1.2, wob: .7 });
  for (let k = 0; k < 3; k++) { const u = clamp(p - .12 * k); if (u <= .02) continue; const [x, y] = at(SHORE_SCENT, u * .9); clove(c, x + (hh(k) - .5) * 30, y + (hh(k + 4) - .5) * 24, .8, t * .6 + k, .9); }
  clove(c, 492, 1252, 1.3, 1.2, ss(seg(p, .96, 1)));
}
// the earth: the stylus groove on the leaf has become a trench; the clove sinks down it, the scent trailing
export function wcStrata(c, t, o = {}) {
  c.drawImage(PL.strata, 0, 0);
  const p = o.p ?? 1, y = lerp(330, 940, p);
  incise(c, q => { q.moveTo(540, 300); q.lineTo(540, 330); }, 3, 1);
  scent(c, chain(bez([540, 120], [560, 220], [520, 300], [540, 340]), bez([540, 340], [560, 600], [520, 800], [540, y])), t, 1, .9, { op: 'source-over', col: [214, 160, 70], wob: .6 });
  clove(c, 540, y, 1.6, .4 + Math.sin(t * 2) * .2, 1);
  for (let k = 0; k < 22; k++) { const u = (k / 22 + t * .3) % 1; c.fillStyle = 'rgba(70,46,28,.6)'; c.beginPath(); c.arc(500 + hh(k) * 80, lerp(340, y, u), 1.6 + hh(k * 2) * 1.6, 0, 7); c.fill(); }
}
// the two kendis: their rouletted bands light up row by row in gold, and a gold seam joins them
const POTS = [[285, 1060], [795, 1060]], PS = 1.12;
function bands(c, cx, cy, k, t) {
  c.save(); c.globalCompositeOperation = 'lighter';
  [-60, -40, 64].forEach((yy, r) => { const kk = clamp(k * 3 - r); if (kk <= 0) return;
    for (let i = 0; i < 26; i++) { const u = (i + .5) / 26; if (u > kk) continue; const ang = (u - .5) * 2.6, x = cx + Math.sin(ang) * 138 * PS, y = cy + yy * PS + Math.cos(ang) * 10 * PS;
      const g = c.createRadialGradient(x, y, 0, x, y, 9); g.addColorStop(0, 'rgba(255,224,140,.95)'); g.addColorStop(1, 'rgba(255,190,80,0)'); c.fillStyle = g; c.fillRect(x - 9, y - 9, 18, 18); } });
  const kw = clamp(k * 3 - 1.5); if (kw > 0) { c.strokeStyle = 'rgba(255,214,120,.9)'; c.lineWidth = 2.6; c.shadowColor = 'rgba(255,190,80,.9)'; c.shadowBlur = 12; c.beginPath();
    for (let i = 0; i <= 26 * kw; i++) { const x = cx + (-130 + i * 10) * PS, y = cy + (-50 + 7 * Math.sin(i * .9)) * PS; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  c.restore();
}
export function wcPots(c, t, o = {}) {
  c.drawImage(PL.pots, 0, 0);
  const k = o.k ?? 1; bands(c, ...POTS[0], k, t); bands(c, ...POTS[1], k, t);
  const ks = clamp(k * 2 - 1);   // the seam: from one wave line to the other, over the earth between them
  if (ks > 0) { const seam = bez([285 + 140, 1004], [460, 900], [620, 900], [795 - 140, 1004]); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,214,120,.85)'; c.lineWidth = 3; c.setLineDash([2, 10]); c.lineCap = 'round';
    c.shadowColor = 'rgba(255,190,80,.9)'; c.shadowBlur = 14; c.beginPath(); seam.forEach((q, i) => { if (i / seam.length > ks) return; i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.stroke(); c.restore();
    if (ks > .98) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(540, 905, 0, 540, 905, 40); g.addColorStop(0, 'rgba(255,230,160,.9)'); g.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = g; c.fillRect(500, 865, 80, 80); c.restore(); } }
  label(c, 'ମାଣିକପାଟଣା', 285, 1290, 40, '#f6ead2', 'rgba(30,16,8,.95)', ss(seg(k, .1, .3)));
  label(c, 'ଓଡ଼ିଶା', 285, 1340, 26, '#e8d6b4', 'rgba(30,16,8,.95)', ss(seg(k, .15, .35)), 600);
  label(c, 'ବାଲି · ଜାଭା', 795, 1290, 40, '#f6ead2', 'rgba(30,16,8,.95)', ss(seg(k, .3, .5)));
  label(c, 'ଇଣ୍ଡୋନେସିଆ', 795, 1340, 26, '#e8d6b4', 'rgba(30,16,8,.95)', ss(seg(k, .35, .55)), 600);
}
