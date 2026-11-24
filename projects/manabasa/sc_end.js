// The meal, the temple's market, the shared leaf, the palm-leaf book.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
import { foot } from './sc_jhoti.js';
import { glow, lamp } from './sc_temple.js';
// —— a meal on a banana leaf, from above, lamp-lit: a heap of rice, dalma, saga, a pinch of salt, a little clay lamp ——
export function leafMeal(c, t, o = {}) {
  const { x = 540, y = 960, s = 1, rot = -.08, steam = 1, gold = 0, a = 1 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a;
  let g = c.createRadialGradient(x, y, 80, x, y, 1100); g.addColorStop(0, '#3a2414'); g.addColorStop(1, '#070403'); c.fillStyle = g; c.fillRect(0, 0, W, H);   // a dark floor
  c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(16, 26, 470, 300, 0, 0, 7); c.fill();
  g = c.createLinearGradient(0, -300, 0, 300); g.addColorStop(0, '#2e5a1c'); g.addColorStop(.5, '#3e7224'); g.addColorStop(1, '#244a14'); c.fillStyle = g;
  c.beginPath(); c.moveTo(-470, -40); c.quadraticCurveTo(-460, -280, -100, -290); c.quadraticCurveTo(300, -300, 470, -200); c.lineTo(470, 220); c.quadraticCurveTo(300, 290, -100, 290); c.quadraticCurveTo(-460, 280, -470, 40); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(200,230,160,.3)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-470, 0); c.lineTo(470, 10); c.stroke(); c.lineWidth = 1.2; for (let k = -22; k <= 22; k++) { if (!k) continue; c.strokeStyle = `rgba(200,230,160,${.1 + .05 * hh(k)})`; c.beginPath(); c.moveTo(k * 21, 5); c.lineTo(k * 21 + 60, k > 0 ? 290 : -290); c.stroke(); }
  // the rice: a soft heap of grains, glowing gold as the goddess is recognised
  g = c.createRadialGradient(-50, -40, 10, 0, 0, 200); g.addColorStop(0, '#fffdf4'); g.addColorStop(1, '#d8ccb0'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 190, 150, 0, 0, 7); c.fill();
  for (let k = 0; k < 520; k++) { const r = Math.sqrt(hh(k * 1.7)) * 180, an = hh(k * 2.9) * 6.283; c.save(); c.translate(Math.cos(an) * r, Math.sin(an) * r * .8); c.rotate(hh(k) * 6.3); c.fillStyle = `rgba(255,255,250,${.5 + .4 * hh(k * 3)})`; c.beginPath(); c.ellipse(0, 0, 6, 2.4, 0, 0, 7); c.fill(); c.restore(); }
  if (gold > 0) { c.save(); c.globalCompositeOperation = 'lighter'; g = c.createRadialGradient(0, 0, 10, 0, 0, 240); g.addColorStop(0, `rgba(255,200,90,${.55 * gold})`); g.addColorStop(1, 'rgba(255,170,60,0)'); c.fillStyle = g; c.fillRect(-260, -260, 520, 520); c.restore(); }
  const side = (px, py, r, col, tex) => { const gg = c.createRadialGradient(px - r * .3, py - r * .3, 2, px, py, r); gg.addColorStop(0, col[0]); gg.addColorStop(1, col[1]); c.fillStyle = gg; c.beginPath(); c.ellipse(px, py, r, r * .8, 0, 0, 7); c.fill();
    for (let k = 0; k < 14; k++) { c.fillStyle = tex; c.beginPath(); c.arc(px + (hh(k * 3 + px) - .5) * r * 1.4, py + (hh(k * 5 + px) - .5) * r, 2 + 2 * hh(k), 0, 7); c.fill(); } };
  side(290, -110, 90, ['#f0b440', '#a86a14'], 'rgba(255,240,200,.5)'); side(300, 120, 80, ['#4a7a2a', '#1e3a10'], 'rgba(180,220,120,.5)'); side(-300, 150, 70, ['#e8a05a', '#8a4a1a'], 'rgba(90,40,10,.5)');
  c.fillStyle = '#fff'; c.beginPath(); c.arc(-310, -150, 14, 0, 7); c.fill();   // salt
  c.restore();
  if (steam > 0) { c.save(); c.globalCompositeOperation = 'screen'; for (let k = 0; k < 7; k++) { const u = (t * .22 + k / 7) % 1, px = x + (hh(k) - .5) * 260 + Math.sin(t * .9 + k) * 40, py = y - 40 - u * 560, al = Math.sin(Math.PI * u) * .14 * steam;
      g = c.createRadialGradient(px, py, 0, px, py, 90 + 90 * u); g.addColorStop(0, `rgba(255,248,236,${al})`); g.addColorStop(1, 'rgba(255,248,236,0)'); c.fillStyle = g; c.fillRect(px - 200, py - 200, 400, 400); } c.restore(); }
  if (gold > 0) { for (let k = 0; k < 6; k++) { const u = clamp(gold * 1.6 - k * .12), py = y - 140 - k * 120; foot(c, x + (k % 2 ? 26 : -26), py, -Math.PI / 2, 1.2, k % 2 === 0, u, '255,214,130', .55); } }   // out of the steam, her footprints
  c.restore();
}
// —— Ananda Bazar at dusk: the temple rising against the sky, its wheel and flag; rows of earthen pots of Mahaprasad, lamps, steam ——
export function anandaBazar(c, t, o = {}) {
  const { a = 1, push = 0 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a;
  let g = c.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, '#2a1820'); g.addColorStop(.6, '#a8503a'); g.addColorStop(1, '#f0a060'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.save(); c.translate(540, 1100); c.scale(1 + .06 * push, 1 + .06 * push);
  c.fillStyle = '#1c0e0c'; c.beginPath(); c.moveTo(-200, 0); for (let i = 0; i <= 24; i++) { const u = i / 24; c.lineTo(-200 * (1 - .62 * u ** 2.2), -760 * u); } for (let i = 24; i >= 0; i--) { const u = i / 24; c.lineTo(200 * (1 - .62 * u ** 2.2), -760 * u); } c.fill();   // the Srimandir's shikhara
  for (let k = 1; k < 14; k++) { const u = k / 14, w = 200 * (1 - .62 * u ** 2.2); c.fillStyle = 'rgba(255,190,130,.06)'; c.fillRect(-w, -760 * u, w * 2, 4); }
  c.beginPath(); c.ellipse(0, -770, 80, 20, 0, 0, 7); c.fill(); c.beginPath(); c.arc(0, -805, 30, 0, 7); c.fill();
  c.strokeStyle = '#1c0e0c'; c.lineWidth = 6; c.beginPath(); c.arc(0, -870, 34, 0, 7); c.stroke(); for (let k = 0; k < 8; k++) { const an = k / 8 * 6.283; c.beginPath(); c.moveTo(0, -870); c.lineTo(Math.cos(an) * 34, -870 + Math.sin(an) * 34); c.stroke(); }   // the Nilachakra
  c.lineWidth = 4; c.beginPath(); c.moveTo(0, -904); c.lineTo(0, -1000); c.stroke(); c.fillStyle = '#c0281c'; c.beginPath(); c.moveTo(0, -1000); c.quadraticCurveTo(70, -990 + 8 * Math.sin(t * 2.5), 130, -968 + 12 * Math.sin(t * 2.5 + 1)); c.lineTo(0, -950); c.closePath(); c.fill();   // the Patitapabana flag
  c.fillStyle = '#1c0e0c'; c.fillRect(-540, -120, 1080, 130); for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(k * 140 - 60, -120); c.lineTo(k * 140, -200); c.lineTo(k * 140 + 60, -120); c.fill(); }   // the outer wall and gateway roofs
  c.restore();
  g = c.createLinearGradient(0, 1100, 0, H); g.addColorStop(0, '#2a160e'); g.addColorStop(1, '#0a0504'); c.fillStyle = g; c.fillRect(0, 1100, W, H - 1100);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) { const x = 70 + k * 120 + (r % 2) * 60, y = 1180 + r * 70, s = .7 + r * .15; c.save(); c.translate(x, y); c.scale(s, s);   // rows of kudua (earthen pots of Mahaprasad)
    g = c.createLinearGradient(-40, 0, 40, 0); g.addColorStop(0, '#4a1e0c'); g.addColorStop(.45, '#b8683a'); g.addColorStop(1, '#3a160a'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 42, 32, 0, 0, 7); c.fill(); c.fillStyle = '#2a0e06'; c.beginPath(); c.ellipse(0, -24, 26, 7, 0, 0, 7); c.fill(); c.restore(); }
  for (const [lx, ly] of [[120, 1150], [960, 1150], [540, 1135]]) glow(c, lx, ly, 300, .7);
  c.save(); c.globalCompositeOperation = 'screen'; for (let k = 0; k < 8; k++) { const u = (t * .2 + k / 8) % 1, px = 80 + k * 130, py = 1160 - u * 300; g = c.createRadialGradient(px, py, 0, px, py, 70); g.addColorStop(0, `rgba(255,240,220,${Math.sin(Math.PI * u) * .12})`); g.addColorStop(1, 'rgba(255,240,220,0)'); c.fillStyle = g; c.fillRect(px - 80, py - 80, 160, 160); } c.restore();
  c.restore();
}
// —— many hands, one meal: a ring of banana leaves around a great kudua of rice, and hands reaching in from every side ——
const ARMS = [   // [angle, skin, wrist adornment]
  [0, '#b07050', ['#b8201a', '#d8a838', '#b8201a']], [.8, '#6a3e28', ['thread']], [1.55, '#c88a64', ['#2a7a4a', '#2a7a4a', '#d8a838']], [2.35, '#8a5236', ['watch']],
  [3.14, '#5a3220', ['thread', 'copper']], [3.95, '#d0a080', ['#f4ecdc', '#b8201a']], [4.7, '#a06446', ['kada']], [5.5, '#7a4630', ['#1e5a9a', '#d8a838', '#1e5a9a']]];
export function sharedMeal(c, t, o = {}) {
  const { a = 1, reach = 1, rot = 0, z = 1 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a;
  let g = c.createRadialGradient(540, 960, 80, 540, 960, 1200); g.addColorStop(0, '#3a2414'); g.addColorStop(1, '#060403'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.translate(540, 960); c.scale(z, z); c.rotate(rot);
  for (let k = 0; k < 8; k++) { c.save(); c.rotate(k * Math.PI / 4 + .39); const lg = c.createLinearGradient(160, 0, 470, 0); lg.addColorStop(0, '#2e5a1c'); lg.addColorStop(1, '#22461a'); c.fillStyle = lg; c.beginPath(); c.moveTo(150, 0); c.bezierCurveTo(220, -110, 400, -120, 480, 0); c.bezierCurveTo(400, 120, 220, 110, 150, 0); c.fill();
    c.fillStyle = '#f4efe2'; c.beginPath(); c.ellipse(320, 0, 60, 40, 0, 0, 7); c.fill(); c.fillStyle = '#e8a83a'; c.beginPath(); c.ellipse(410, -20, 26, 20, 0, 0, 7); c.fill(); c.restore(); }   // each leaf with its rice and dalma
  g = c.createRadialGradient(-30, -30, 10, 0, 0, 150); g.addColorStop(0, '#c87a46'); g.addColorStop(1, '#4a1e0c'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 140, 0, 7); c.fill();   // the great kudua, from above
  g = c.createRadialGradient(-20, -20, 5, 0, 0, 110); g.addColorStop(0, '#fffdf4'); g.addColorStop(1, '#d8ccb0'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 108, 0, 7); c.fill();
  for (let k = 0; k < 200; k++) { const r = Math.sqrt(hh(k * 1.7)) * 104, an = hh(k * 2.9) * 6.283; c.save(); c.translate(Math.cos(an) * r, Math.sin(an) * r); c.rotate(hh(k) * 6.3); c.fillStyle = 'rgba(255,255,250,.7)'; c.beginPath(); c.ellipse(0, 0, 5, 2, 0, 0, 7); c.fill(); c.restore(); }
  if (reach > 0) ARMS.forEach(([an, skin, adorn], i) => { const r = lerp(900, 150 + 40 * (i % 2), eo(clamp(reach * 1.3 - i * .04))) + 8 * Math.sin(t * 1.3 + i); c.save(); c.rotate(an + .39); c.translate(r, 0); c.rotate(Math.PI); arm(c, skin, adorn); c.restore(); });
  c.restore();
}
function arm(c, skin, adorn) {   // a forearm and a hand, fingers gathered to take rice; fingertips at (0,0), the arm running toward −x
  c.save(); c.scale(-1, 1);
  c.fillStyle = 'rgba(0,0,0,.32)'; c.beginPath(); c.ellipse(300, 26, 320, 58, 0, 0, 7); c.fill();
  const P = new Path2D();   // fingers bunched → knuckles → palm → wrist → forearm
  P.moveTo(0, -10); P.quadraticCurveTo(-8, 0, 0, 10); P.bezierCurveTo(30, 22, 60, 30, 92, 34); P.bezierCurveTo(130, 40, 160, 38, 186, 30); P.lineTo(214, 29); P.bezierCurveTo(300, 34, 460, 42, 1200, 56);
  P.lineTo(1200, -56); P.bezierCurveTo(460, -42, 300, -34, 214, -29); P.lineTo(186, -30); P.bezierCurveTo(160, -44, 130, -48, 100, -44); P.bezierCurveTo(70, -40, 36, -26, 0, -10); P.closePath();
  const g = c.createLinearGradient(0, -46, 0, 46); g.addColorStop(0, skin); g.addColorStop(.55, skin); g.addColorStop(1, '#2a160c'); c.fillStyle = g; c.fill(P);
  c.save(); c.clip(P); const hl = c.createLinearGradient(0, -46, 0, 0); hl.addColorStop(0, 'rgba(255,220,190,.25)'); hl.addColorStop(1, 'rgba(255,220,190,0)'); c.fillStyle = hl; c.fillRect(0, -46, 640, 46); c.restore();
  c.strokeStyle = 'rgba(30,14,6,.35)'; c.lineWidth = 1.6; for (const k of [-16, -5, 6]) { c.beginPath(); c.moveTo(6, k * .35); c.quadraticCurveTo(46, k * .8, 92, k * 1.4); c.stroke(); }   // the gathered fingers
  c.fillStyle = 'rgba(255,235,215,.35)'; for (const k of [-10, 0, 9]) { c.beginPath(); c.ellipse(10, k * .5, 6, 3, 0, 0, 7); c.fill(); }   // fingernails
  c.fillStyle = skin; c.beginPath(); c.moveTo(96, -40); c.quadraticCurveTo(70, -58, 46, -50); c.quadraticCurveTo(40, -42, 52, -36); c.quadraticCurveTo(76, -40, 100, -30); c.closePath(); c.fill();   // the thumb
  c.fillStyle = '#f6f0e2'; c.beginPath(); c.ellipse(4, 0, 13, 10, 0, 0, 7); c.fill();   // the morsel of rice
  let x = 206; for (const ad of adorn) { if (ad === 'thread') { c.fillStyle = '#c4201a'; c.fillRect(x, -34, 4, 68); c.fillStyle = '#e8b030'; c.fillRect(x + 5, -34, 3, 68); x += 12; }
    else if (ad === 'watch') { c.fillStyle = '#2a2a2a'; c.fillRect(x, -32, 22, 64); c.fillStyle = '#c8c8c0'; c.beginPath(); c.arc(x + 11, 0, 17, 0, 7); c.fill(); x += 28; }
    else if (ad === 'kada' || ad === 'copper') { c.fillStyle = ad === 'kada' ? '#c8c8c8' : '#b8703a'; c.fillRect(x, -36, 10, 72); x += 14; }
    else { c.fillStyle = ad; c.beginPath(); c.roundRect(x, -35, 8, 70, 4); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x + 1, -31, 2, 62); x += 11; } }
  c.restore();
}
// —— the palm-leaf book: leaves of talapatra, lines of Odia engraved and inked with soot, a drawing of footprints and a lotus; a lamp ——
const LINES = ['ମାର୍ଗଶିର ମାସ ଗୁରୁବାର ଦିନେ', 'ଲକ୍ଷ୍ମୀ ଗଲେ ଶ୍ରିୟାଙ୍କ ଘରକୁ', 'ବାର ବର୍ଷ ଅନ୍ନ ମୁଠାଏ ନାହିଁ', 'ମହାପ୍ରସାଦ ଖାଇବାବେଳେ', 'ଜାତିଭେଦ ଚଳିବନି'];
export function palmLeaf(c, t, o = {}) {
  const { a = 1, write = 1, z = 1, cy = 960, lampA = 1 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a;
  let g = c.createRadialGradient(540, 900, 60, 540, 960, 1200); g.addColorStop(0, '#2a1a10'); g.addColorStop(1, '#050302'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.translate(540, cy); c.scale(z, z); c.translate(-540, -cy);
  for (let k = 3; k >= 0; k--) { const y = 300 + k * 178 + (k ? 8 : 0), x0 = 40 + k * 6, x1 = 1040 - k * 6; c.save(); c.translate(0, k * 4);
    g = c.createLinearGradient(0, y, 0, y + 170); g.addColorStop(0, '#d8b878'); g.addColorStop(.5, '#e8cc90'); g.addColorStop(1, '#b8945a'); c.fillStyle = g; c.beginPath(); c.roundRect(x0, y, x1 - x0, 170, 30); c.fill();
    c.strokeStyle = 'rgba(120,80,40,.25)'; c.lineWidth = 1; for (let j = 0; j < 22; j++) { const yy = y + 8 + j * 7.4; c.beginPath(); c.moveTo(x0 + 20, yy); c.lineTo(x1 - 20, yy + (hh(j + k) - .5) * 2); c.stroke(); }   // the leaf's grain
    c.fillStyle = '#3a2410'; for (const hx of [x0 + 170, x1 - 170]) { c.beginPath(); c.arc(hx, y + 85, 9, 0, 7); c.fill(); }   // the string holes
    if (k === 0 || k === 1) { const line = LINES[k === 0 ? 4 : 3], p = clamp(write * 2 - (k === 0 ? 1 : 0)); c.save(); c.beginPath(); c.rect(x0 + 200, y, (x1 - x0 - 400) * p, 170); c.clip();
      c.font = '600 46px "OdiaSerif"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(255,240,200,.5)'; c.fillText(line, 541, y + 87); c.fillStyle = '#2a1608'; c.fillText(line, 540, y + 85); c.restore(); }   // engraved, inked with soot
    if (k === 2) { const p = clamp(write * 1.5); c.globalAlpha *= p; for (let s = 0; s < 4; s++) foot(c, 380 + s * 100, y + 130, -Math.PI / 2 + .02, .62, s % 2 === 0, 1, '42,22,8', 0); c.font = '600 40px "OdiaSerif"'; c.fillStyle = '#2a1608'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ଲକ୍ଷ୍ମୀ ପୁରାଣ', 540, y + 50); }
    c.restore(); }
  c.strokeStyle = '#8a1e12'; c.lineWidth = 5; for (const hx of [216, 864]) { c.beginPath(); c.moveTo(hx, 230); c.bezierCurveTo(hx + 20, 600, hx - 20, 800, hx, 1060); c.stroke(); }   // the binding string
  c.restore();
  if (lampA > 0) { lamp(c, t, 540, 1250, 1.0, lampA); }
}
