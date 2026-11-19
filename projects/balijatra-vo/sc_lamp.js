// The paper-cut lightbox: the memory become a festival. Night on the Mahanadi; lamp-boats; Cuttack's fair; the partner gate
// (a Balinese split gate joined by a Kalinga torana); and the poem's leaf whose lines light up as the fair's festoons.
import { W, H, clamp, lerp, seg, ss, hh, scent, clove, label, bez, chain } from './common.js';
import { initLightbox, sheet, drawStack, glow, wheelCut, wheelSpokes, profile, profileCuts, LW, LH } from './lightbox.js';
export { initLightbox };
const lit = (L, v = 1) => (L.lit = v, L);
let S = {};
function ramdoli(m, cx, cy, R) {   // the giant wheel: rim, spokes, gondolas
  m.save(); m.lineWidth = 9; m.strokeStyle = '#000'; m.beginPath(); m.arc(cx, cy, R, 0, 7); m.stroke(); m.beginPath(); m.arc(cx, cy, R * .18, 0, 7); m.stroke();
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; m.beginPath(); m.moveTo(cx, cy); m.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); m.lineWidth = 5; m.stroke(); m.fillRect(cx + Math.cos(a) * R - 14, cy + Math.sin(a) * R + 4, 28, 22); }
  m.lineWidth = 12; m.beginPath(); m.moveTo(cx - R * .7, cy + R * 1.35); m.lineTo(cx, cy); m.lineTo(cx + R * .7, cy + R * 1.35); m.stroke(); m.restore();
}
function stalls(m, x0, x1, base) { for (let x = x0; x < x1; x += 120) { m.beginPath(); m.moveTo(x, base); m.lineTo(x, base - 80); m.lineTo(x + 50, base - 120); m.lineTo(x + 100, base - 80); m.lineTo(x + 100, base); m.fill(); } m.fillRect(x0 - 40, base - 4, x1 - x0 + 80, 300); }
function build11() {
  if (S.b11) return S.b11;
  const sky = lit(sheet('#1d2152', m => m.fillRect(-LW / 2, -LH / 2, LW, LH), { depth: 0, trans: .8 }));
  const title = lit(sheet('#2a1830', m => m.fillRect(-470, -820, 940, 210), { depth: .1, trans: .2, cut: m => { m.font = '700 150px "OdiaSerif"'; m.textAlign = 'center'; m.textBaseline = 'middle'; m.fillText('ବାଲିଯାତ୍ରା', 0, -705); } }));
  const bank = lit(sheet('#160c18', m => { stalls(m, -560, 560, -160); ramdoli(m, 250, -420, 170); m.fillRect(-560, -260, 300, 110); for (let k = 0; k < 8; k++) m.fillRect(-560 + k * 40, -290, 24, 34); }, { depth: .25, trans: .3, cut: m => { for (let x = -520; x < 560; x += 120) m.fillRect(x + 20, -150, 60, 30); } }));
  const river = lit(sheet('#0f1a2e', m => m.fillRect(-LW / 2, -170, LW, 1200), { depth: .45, trans: .35, cut: m => { for (let k = 0; k < 60; k++) { const y = -140 + hh(k) * 760, x = -560 + hh(k * 3) * 1120, w = 40 + hh(k * 5) * 120; m.fillRect(x, y, w, 3); } } }));
  const ghat = lit(sheet('#0a0608', m => {   // the ghat steps, and a woman (in profile) watching the lamp-boats she has set afloat
    for (let k = 0; k < 4; k++) m.fillRect(-LW / 2, 600 + k * 70, LW, 300);
    profile(m, .62, -300, 300); m.beginPath(); m.moveTo(-430, 560); m.bezierCurveTo(-420, 470, -340, 430, -290, 440); m.bezierCurveTo(-200, 456, -160, 520, -150, 620); m.lineTo(-460, 620); m.fill();
  }, { depth: .9, trans: .15, cut: m => profileCuts(m, .62, -300, 300) }));
  return (S.b11 = [sky, title, bank, river, ghat]);
}
export const BOATS = Array.from({ length: 26 }, (_, k) => [-500 + hh(k * 7) * 1000, -90 + Math.pow(hh(k * 3), 1.6) * 560, .5 + hh(k * 3) * .9]);
function boat(c, x, y, s) { c.save(); c.fillStyle = '#0a0608'; c.beginPath(); c.moveTo(x - 34 * s, y); c.quadraticCurveTo(x, y + 18 * s, x + 34 * s, y); c.lineTo(x + 22 * s, y + 6 * s); c.lineTo(x - 22 * s, y + 6 * s); c.closePath(); c.fill(); c.restore(); }
export function lampMemory(c, t) {
  const L = build11(); drawStack(c, L, { x: 0, y: 0, z: 1 }, { x: 540, y: 820, r: 1400, I: .9 }, {
    after: { 3: (ctx) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); for (const [bx, by, s] of BOATS) { const X = 540 + bx, Y = 960 + by + Math.sin(t * 1.3 + bx) * 3; boat(ctx, X, Y, s); glow(ctx, X, Y - 10 * s, 9 * s, 'rgba(255,190,100,1)', .9); ctx.fillStyle = 'rgba(255,170,80,.35)'; ctx.fillRect(X - 3, Y + 6 * s, 6, 26 * s); } ctx.restore(); } } });
  glow(c, 540 + 250, 960 - 420, 30, 'rgba(255,210,140,1)', .5);
  for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2; glow(c, 540 + 250 + Math.cos(a + t * .2) * 170, 960 - 420 + Math.sin(a + t * .2) * 170, 4, ['rgba(255,120,120,1)', 'rgba(255,220,120,1)', 'rgba(140,200,255,1)'][k % 3], .7); }
}
// —— the partner gate: two halves of a Balinese candi bentar, joined above by a Kalinga torana; a garland of ikat and kawung ——
function candiHalf(m, x, base, w, h, d) {   // one half of a Balinese split gate: stepped tiers, crisp inner face, ornamented outer edge
  m.beginPath(); m.moveTo(x, base); m.lineTo(x, base - h);
  const tiers = 8; for (let k = 0; k < tiers; k++) { const y0 = base - h + k * h / tiers, ww = w * (.32 + .68 * k / tiers); m.lineTo(x + d * ww * .86, y0); m.lineTo(x + d * ww * .86, y0 + h / tiers * .35); m.lineTo(x + d * ww, y0 + h / tiers * .35); m.lineTo(x + d * ww, y0 + h / tiers); }
  m.lineTo(x + d * w, base); m.closePath(); m.fill();
  m.beginPath(); m.moveTo(x, base - h); m.lineTo(x + d * 30, base - h - 70); m.lineTo(x + d * 60, base - h); m.fill();   // the finial
}
function torana(m, cx, base, w, h) {   // Mukteswar's torana: two pillars, an arch springing in curls, a kirtimukha at its crown
  for (const d of [-1, 1]) { m.fillRect(cx + d * w / 2 - 24, base - h, 48, h); m.fillRect(cx + d * w / 2 - 36, base - 20, 72, 20); m.fillRect(cx + d * w / 2 - 34, base - h - 14, 68, 18); }
  m.save(); m.lineWidth = 26; m.strokeStyle = '#000'; m.beginPath(); m.arc(cx, base - h, w / 2, Math.PI, 0); m.stroke();
  for (const d of [-1, 1]) { m.beginPath(); m.arc(cx + d * (w / 2 - 34), base - h - 30, 22, 0, 7); m.fill(); }
  m.beginPath(); m.ellipse(cx, base - h - w / 2 - 6, 30, 26, 0, 0, 7); m.fill(); m.restore();
}
function build12() {
  if (S.b12) return S.b12;
  const sky = lit(sheet('#20193f', m => m.fillRect(-LW / 2, -LH / 2, LW, LH), { depth: 0, trans: .8 }));
  const fair = lit(sheet('#170f1d', m => { stalls(m, -620, 620, 220); ramdoli(m, -260, -60, 150); }, { depth: .2, trans: .3, cut: m => { for (let x = -580; x < 620; x += 120) m.fillRect(x + 20, 220, 60, 26); } }));
  const tor = lit(sheet('#120a16', m => torana(m, 0, 520, 300, 420), { depth: .45, trans: .25, cut: m => { for (let k = 0; k < 9; k++) { const a = Math.PI + k / 8 * Math.PI; m.beginPath(); m.arc(Math.cos(a) * 150, 100 + Math.sin(a) * 150, 7, 0, 7); m.fill(); } } }));
  const gate = lit(sheet('#0a0610', m => { candiHalf(m, -230, 760, 330, 1100, -1); candiHalf(m, 230, 760, 330, 1100, 1); m.fillRect(-LW / 2, 760, LW, 400); },
    { depth: .75, trans: .15, cut: m => { for (const d of [-1, 1]) for (let k = 0; k < 7; k++) { m.beginPath(); m.arc(d * (300 + k * 18), 640 - k * 140, 12, 0, 7); m.fill(); } } }));
  const garland = lit(sheet('#2a0d10', m => {
    for (let i = 0; i < 9; i++) { const u = i / 8, x = lerp(-210, 210, u), y = -270 + Math.sin(u * Math.PI) * 90;
      if (i % 2) { m.beginPath(); m.moveTo(x, y - 34); m.lineTo(x + 26, y); m.lineTo(x, y + 34); m.lineTo(x - 26, y); m.closePath(); m.fill(); } else { m.beginPath(); m.arc(x, y, 30, 0, 7); m.fill(); } }
  }, { depth: .8, trans: .45, cut: m => { for (let i = 0; i < 9; i++) { const u = i / 8, x = lerp(-210, 210, u), y = -270 + Math.sin(u * Math.PI) * 90;
      if (i % 2) { m.beginPath(); m.moveTo(x, y - 17); m.lineTo(x + 12, y); m.lineTo(x, y + 17); m.lineTo(x - 12, y); m.closePath(); m.fill(); }
      else for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; m.beginPath(); m.ellipse(x + Math.cos(a) * 13, y + Math.sin(a) * 13, 11, 6, a, 0, 7); m.fill(); } } } }));
  return (S.b12 = [sky, fair, tor, gate, garland]);
}
export function lampGate(c, t) {
  drawStack(c, build12(), { x: 0, y: 0, z: 1 }, { x: 540, y: 760, r: 1400, I: .95 });
  for (let k = 0; k < 30; k++) { const a = k / 30 * Math.PI * 2; glow(c, 280 + Math.cos(a + t * .2) * 150, 900 + Math.sin(a + t * .2) * 150, 4, ['rgba(255,120,120,1)', 'rgba(255,220,120,1)', 'rgba(140,200,255,1)'][k % 3], .6); }
  label(c, 'ଇଣ୍ଡୋନେସିଆ', 540, 1200, 64, '#fff0d4', 'rgba(255,170,90,.9)', 1, 700, true);
  label(c, 'ସହଯୋଗୀ ଦେଶ', 540, 1270, 38, '#f3e1c0', 'rgba(20,8,10,.9)', 1, 600);
}
// —— poetry and the fair: the cut-paper leaf of verse; its lines light up and run on as the fair's festoons ——
function build13() {
  if (S.b13) return S.b13;
  const sky = lit(sheet('#1d2152', m => m.fillRect(-LW / 2, -LH / 2, LW, LH), { depth: 0, trans: .8 }));
  const leaf = lit(sheet('#3a2212', m => { m.beginPath(); m.moveTo(-460, -700); m.lineTo(460, -700); m.quadraticCurveTo(500, -640, 460, -580); m.lineTo(-460, -580); m.quadraticCurveTo(-500, -640, -460, -700); m.fill(); },
    { depth: .15, trans: .35, cut: m => { m.font = '700 58px "OdiaSerif"'; m.textAlign = 'center'; m.textBaseline = 'middle'; m.fillText('ଲବଙ୍ଗପୁଷ୍ପୈଃ', 0, -640); for (const x of [-400, 400]) { m.beginPath(); m.arc(x, -640, 12, 0, 7); m.fill(); } } }));
  const fair = lit(sheet('#130c18', m => { stalls(m, -620, 620, 300); ramdoli(m, 200, 0, 190); for (let k = 0; k < 7; k++) m.fillRect(-560 + k * 50, -20, 30, 320); }, { depth: .4, trans: .3, cut: m => { for (let x = -580; x < 620; x += 120) m.fillRect(x + 20, 300, 60, 28); } }));
  const front = lit(sheet('#08050a', m => { m.fillRect(-LW / 2, 520, LW, 500); for (let k = 0; k < 14; k++) { const x = -520 + k * 80 + hh(k) * 30; m.beginPath(); m.arc(x, 480 - hh(k * 3) * 40, 26, 0, 7); m.fill(); m.fillRect(x - 30, 500 - hh(k * 3) * 40, 60, 100); } }, { depth: .85, trans: .1 }));
  return (S.b13 = [sky, leaf, fair, front]);
}
export function lampFair(c, t, o = {}) {
  drawStack(c, build13(), { x: 0, y: 0, z: 1 }, { x: 540, y: 700, r: 1500, I: .95 });
  const k = o.k ?? 1;   // the leaf's lines run down into festoons strung across the fair
  for (let s = 0; s < 3; s++) { const pts = bez([100, 330 + s * 4], [300, 620 + s * 90], [780, 520 + s * 110], [980, 330 + s * 4], 60);
    for (let i = 0; i < pts.length; i += 2) { if (i / pts.length > k) break; glow(c, pts[i][0], pts[i][1] + s * 150, 5, ['rgba(255,214,120,1)', 'rgba(255,130,120,1)', 'rgba(150,210,255,1)'][(i + s) % 3], .85); } }
  for (let n = 0; n < 36; n++) { const a = n / 36 * Math.PI * 2 + t * .3; glow(c, 740 + Math.cos(a) * 190, 960 + Math.sin(a) * 190, 4, ['rgba(255,120,120,1)', 'rgba(255,220,120,1)', 'rgba(140,200,255,1)'][n % 3], .7); }
  scent(c, chain(bez([540, 330], [700, 420], [860, 300], [1000, 360]), bez([1000, 360], [1080, 390], [1110, 330], [1160, 300])), t, 1, .9);
}
