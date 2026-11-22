// People, in profile and in colour, lit like a painting: the mother (red saree, gold border, pallu over her head, shankha-pola,
// a nose ring) standing or kneeling, and her small daughter (marigold silk, a braid with jasmine). Each figure is drawn on its own
// layer, shaded from the back, and rim-lit on its front edge by whatever light is ahead of it (the moon, a festival window, dawn).
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
const S = 1200, OX = 600, OY = 1120;   // the figure layer, and where a figure's feet go on it
let FIG, FX, RIM, RX;
function layers() { if (FIG) return; FIG = mk(S, S); FX = FIG.getContext('2d'); RIM = mk(S, S); RX = RIM.getContext('2d'); }
// draw(fx) paints the figure in its own units (feet at 0,0, facing +x); then it is shaded, rim-lit and put on c
export function figure(c, x, y, s, draw, o = {}) {
  const { a = 1, flip = false, shade = .55, rim = 1, rimCol = '255,226,182', rimW = 5, glow = 0, glowCol = '255,170,90', glowAt = [200, -300] } = o; if (a <= 0) return; layers();
  FX.setTransform(1, 0, 0, 1, 0, 0); FX.globalCompositeOperation = 'source-over'; FX.globalAlpha = 1; FX.filter = 'none'; FX.clearRect(0, 0, S, S);
  FX.translate(OX, OY); FX.scale(s, s); FX.lineCap = 'round'; FX.lineJoin = 'round'; draw(FX);
  FX.setTransform(1, 0, 0, 1, 0, 0); FX.globalCompositeOperation = 'source-atop';   // shade: dark at the back and below, lighter at the front
  const g = FX.createLinearGradient(OX - 260 * s, 0, OX + 260 * s, 0); g.addColorStop(0, `rgba(10,5,6,${shade})`); g.addColorStop(1, `rgba(10,5,6,${shade * .35})`); FX.fillStyle = g; FX.fillRect(0, 0, S, S);
  const v = FX.createLinearGradient(0, OY - 600 * s, 0, OY); v.addColorStop(0, 'rgba(10,5,6,0)'); v.addColorStop(1, `rgba(10,5,6,${shade * .6})`); FX.fillStyle = v; FX.fillRect(0, 0, S, S);
  if (glow > 0) { FX.globalCompositeOperation = 'source-atop'; const gx = OX + glowAt[0] * s, gy = OY + glowAt[1] * s, gg = FX.createRadialGradient(gx, gy, 0, gx, gy, 420 * s); gg.addColorStop(0, `rgba(${glowCol},${.55 * glow})`); gg.addColorStop(.5, `rgba(${glowCol},${.18 * glow})`); gg.addColorStop(1, `rgba(${glowCol},0)`); FX.fillStyle = gg; FX.fillRect(0, 0, S, S); }   // a warm light held in front (a diya)
  FX.globalCompositeOperation = 'source-over';
  c.save(); c.globalAlpha *= a; c.translate(x, y); if (flip) c.scale(-1, 1); c.drawImage(FIG, -OX, -OY);
  if (rim > 0) {   // the rim: the figure minus itself nudged back, on its front edge
    RX.setTransform(1, 0, 0, 1, 0, 0); RX.globalCompositeOperation = 'source-over'; RX.clearRect(0, 0, S, S); RX.drawImage(FIG, 0, 0);
    RX.globalCompositeOperation = 'source-in'; RX.fillStyle = `rgba(${rimCol},1)`; RX.fillRect(0, 0, S, S);
    RX.globalCompositeOperation = 'destination-out'; RX.drawImage(FIG, -rimW, rimW * .25);
    c.globalCompositeOperation = 'lighter'; c.globalAlpha *= rim; c.filter = 'blur(1.2px)'; c.drawImage(RIM, -OX, -OY); c.filter = 'none'; }
  c.restore();
}
// —— colours ——
const SKIN = '#a8694a', SKIN_D = '#7a4630', SAREE = '#a51e18', SAREE_D = '#7c1410', GOLD = '#dcae4e', HAIR = '#16100c';
function ik(sx, sy, hx, hy, L1, L2, bend = 1) {   // two-bone reach: the elbow, given a shoulder and a hand
  const dx = hx - sx, dy = hy - sy, d = Math.min(Math.hypot(dx, dy), L1 + L2 - .01), a0 = Math.atan2(dy, dx), k = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  return [sx + Math.cos(a0 + bend * k) * L1, sy + Math.sin(a0 + bend * k) * L1];
}
function limb(c, pts, w0, w1, col) {   // a tapered limb along a polyline
  c.fillStyle = col; const n = pts.length; for (let i = 0; i < n - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], wa = lerp(w0, w1, i / (n - 1)), wb = lerp(w0, w1, (i + 1) / (n - 1));
    const an = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(an), ny = Math.cos(an); c.beginPath(); c.moveTo(x0 + nx * wa / 2, y0 + ny * wa / 2); c.lineTo(x1 + nx * wb / 2, y1 + ny * wb / 2); c.lineTo(x1 - nx * wb / 2, y1 - ny * wb / 2); c.lineTo(x0 - nx * wa / 2, y0 - ny * wa / 2); c.fill();
    c.beginPath(); c.arc(x1, y1, wb / 2, 0, 7); c.fill(); }
  c.beginPath(); c.arc(pts[0][0], pts[0][1], w0 / 2, 0, 7); c.fill();
}
function arm(c, S0, E, Hd, wU = 26, wF = 20, skin = SKIN, bangles = true, sleeve = SAREE_D) {   // shoulder → elbow → hand, with a blouse sleeve and bangles
  limb(c, [S0, E], wU, wF + 2, skin); limb(c, [E, Hd], wF + 1, wF * .8, skin);
  limb(c, [S0, [lerp(S0[0], E[0], .38), lerp(S0[1], E[1], .38)]], wU + 4, wU + 2, sleeve);
  const an = Math.atan2(Hd[1] - E[1], Hd[0] - E[0]);
  c.save(); c.translate(Hd[0], Hd[1]); c.rotate(an); c.fillStyle = skin; const u = wF;   // the hand: palm, fingers together, thumb
  c.beginPath(); c.moveTo(0, -u * .45); c.bezierCurveTo(u * .8, -u * .55, u * 1.6, -u * .4, u * 2.1, -u * .05); c.quadraticCurveTo(u * 2.2, u * .2, u * 1.9, u * .3); c.bezierCurveTo(u * 1.3, u * .5, u * .6, u * .55, 0, u * .45); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(u * .5, -u * .4); c.quadraticCurveTo(u * 1.1, -u * .95, u * 1.4, -u * .7); c.quadraticCurveTo(u * 1.1, -u * .4, u * .9, -u * .3); c.fill();
  c.strokeStyle = 'rgba(70,30,20,.45)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(u * 1.2, -u * .05); c.lineTo(u * 2, u * .02); c.moveTo(u * 1.2, u * .17); c.lineTo(u * 1.9, u * .2); c.stroke(); c.restore();
  if (bangles) { const bx = lerp(E[0], Hd[0], .84), by = lerp(E[1], Hd[1], .84); c.save(); c.translate(bx, by); c.rotate(an + Math.PI / 2);
    [['#f4ecdc', 0], ['#c0281c', 5.5], ['#e2b04a', 10]].forEach(([col, o]) => { c.fillStyle = col; c.beginPath(); c.ellipse(0, o - 6, wF * .62, 3, 0, 0, 7); c.fill(); }); c.restore(); }   // shankha, pola, a gold bangle
}
// —— the mother's head, in its own units (the skull's centre at 0,0; facing +x). tilt: radians, looking down ——
function motherHead(c, o = {}) {
  const { eye = 'open' } = o;
  // neck and face
  c.fillStyle = SKIN; c.beginPath(); c.moveTo(30, -26); c.quadraticCurveTo(36, -18, 36, -8); c.quadraticCurveTo(38, 2, 40, 8); c.quadraticCurveTo(39, 13, 38, 16); c.quadraticCurveTo(44, 26, 47.5, 33); c.quadraticCurveTo(46.5, 38, 40.5, 39.5);
  c.quadraticCurveTo(42, 43, 42, 45); c.quadraticCurveTo(45, 47, 44, 50); c.quadraticCurveTo(41, 53, 40, 54); c.quadraticCurveTo(43, 56, 42, 59); c.quadraticCurveTo(39, 62, 38, 64); c.quadraticCurveTo(41, 68, 40, 74);
  c.quadraticCurveTo(36, 82, 26, 82); c.quadraticCurveTo(19, 84, 18, 92); c.lineTo(20, 124); c.lineTo(-18, 124); c.quadraticCurveTo(-16, 90, -16, 72); c.quadraticCurveTo(-40, 40, -36, 10); c.quadraticCurveTo(-34, -36, 0, -44); c.quadraticCurveTo(20, -42, 30, -26); c.fill();
  c.fillStyle = 'rgba(70,30,20,.5)'; c.beginPath(); c.moveTo(18, 30); c.quadraticCurveTo(28, 52, 26, 80); c.lineTo(10, 80); c.quadraticCurveTo(14, 50, 18, 30); c.fill();   // the cheek's shadow
  c.fillStyle = '#7a2a22'; c.beginPath(); c.moveTo(44, 50); c.quadraticCurveTo(41, 53, 40, 54); c.quadraticCurveTo(43, 56, 42, 59); c.quadraticCurveTo(38, 56, 37, 54); c.quadraticCurveTo(39, 51, 44, 50); c.fill();   // lips
  c.strokeStyle = HAIR; c.lineWidth = 2.2; c.beginPath(); c.moveTo(22, 2); c.quadraticCurveTo(31, -2, 38, 4); c.stroke();   // brow
  c.lineWidth = 1.8; c.beginPath(); if (eye === 'down') { c.moveTo(26, 14); c.quadraticCurveTo(31, 18, 37, 15); } else { c.moveTo(27, 11); c.quadraticCurveTo(32, 9, 37, 12); } c.stroke();   // the eye, lashes
  if (eye !== 'down') { c.fillStyle = HAIR; c.beginPath(); c.ellipse(34, 13, 2.2, 2.6, 0, 0, 7); c.fill(); }
  c.fillStyle = HAIR; c.beginPath(); c.moveTo(14, -36); c.quadraticCurveTo(34, -32, 36, -12); c.quadraticCurveTo(30, -22, 14, -26); c.fill();   // hair at the parting, under the pallu
  c.fillStyle = '#c4201a'; c.fillRect(20, -38, 6, 10);   // sindoor in the parting
  c.strokeStyle = GOLD; c.lineWidth = 1.6; c.beginPath(); c.arc(42, 39.5, 4.5, -1.2, 2.6); c.stroke();   // nose ring
  // the pallu over her head and behind her neck, its gold border framing her face
  const P = new Path2D(); P.moveTo(36, -22); P.quadraticCurveTo(44, -42, 18, -54); P.quadraticCurveTo(-22, -64, -48, -30); P.quadraticCurveTo(-62, 4, -62, 50); P.quadraticCurveTo(-64, 96, -60, 140); P.lineTo(-6, 140); P.quadraticCurveTo(2, 104, 6, 76); P.quadraticCurveTo(8, 40, 12, 12); P.quadraticCurveTo(18, -12, 36, -22); P.closePath();
  c.fillStyle = SAREE; c.fill(P);
  c.save(); c.clip(P); c.strokeStyle = 'rgba(60,8,6,.22)'; c.lineWidth = 2; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-40 + k * 8, -40 + k * 4); c.quadraticCurveTo(-54 + k * 10, 40, -46 + k * 9, 140); c.stroke(); } c.restore();   // folds
  c.strokeStyle = GOLD; c.lineWidth = 7; c.beginPath(); c.moveTo(36, -22); c.quadraticCurveTo(18, -12, 12, 12); c.quadraticCurveTo(8, 40, 6, 76); c.quadraticCurveTo(2, 104, -6, 140); c.stroke();
  c.strokeStyle = '#7a1210'; c.lineWidth = 2; c.beginPath(); c.moveTo(30, -18); c.quadraticCurveTo(14, -8, 8, 14); c.quadraticCurveTo(4, 40, 1, 76); c.stroke();
}
// —— the mother standing (the ghat, the window), facing +x ——
export function motherStanding(c, x, y, s, o = {}) {
  const { phone = 0, t = 0, wind = 0 } = o;
  figure(c, x, y, s, f => {
    const sw = Math.sin(t * 1.3) * 6 * wind;
    // the saree: pleats falling to her feet
    const B = new Path2D(); B.moveTo(20, -430); B.bezierCurveTo(50, -418, 62, -380, 54, -350); B.bezierCurveTo(46, -334, 42, -318, 44, -300); B.bezierCurveTo(50, -268, 54, -236, 54, -200); B.bezierCurveTo(58, -130, 64, -60, 78, 0);
    B.lineTo(-62, 0); B.bezierCurveTo(-62, -80, -68, -160, -72, -232); B.bezierCurveTo(-76, -300, -62, -380, -42, -420); B.bezierCurveTo(-32, -432, -24, -436, -18, -440); B.closePath();
    f.fillStyle = SAREE; f.fill(B);
    f.save(); f.clip(B); f.strokeStyle = 'rgba(60,8,6,.45)'; f.lineWidth = 3; for (let k = 0; k < 7; k++) { f.beginPath(); f.moveTo(20 + k * 3, -240); f.quadraticCurveTo(26 + k * 6, -120, 6 + k * 11, 0); f.stroke(); }   // the pleats
    f.fillStyle = GOLD; f.fillRect(-80, -22, 180, 14); f.fillStyle = '#7a1210'; f.fillRect(-80, -8, 180, 4); f.restore();   // the gold border at the hem
    // the pallu down her back
    const D = new Path2D(); D.moveTo(-62, -440); D.bezierCurveTo(-76 + sw * .3, -390, -86 + sw * .6, -320, -88 + sw, -250); D.bezierCurveTo(-90 + sw, -210, -88 + sw, -180, -84 + sw, -150); D.bezierCurveTo(-60, -160, -40, -172, -26, -186); D.bezierCurveTo(-16, -270, -8, -360, -6, -440); D.closePath();
    f.fillStyle = SAREE; f.fill(D); f.save(); f.clip(D); f.strokeStyle = 'rgba(60,8,6,.45)'; f.lineWidth = 3; for (let k = 0; k < 5; k++) { f.beginPath(); f.moveTo(-58 + k * 9, -430); f.bezierCurveTo(-66 + k * 10, -330, -70 + k * 11, -250, -74 + k * 12, -150); f.stroke(); }
    f.fillStyle = GOLD; f.beginPath(); f.moveTo(-100, -168); f.bezierCurveTo(-70, -176, -44, -186, -20, -204); f.lineTo(-20, -186); f.bezierCurveTo(-44, -168, -70, -156, -100, -150); f.fill(); f.restore();
    // her arm
    const p = eio(phone), hd = [lerp(26, 6, p) + 40 * Math.sin(Math.PI * p), lerp(-200, -500, p)], el0 = ik(4, -404, 26, -200, 112, 104, 1), el = [lerp(el0[0], 64, p) + 20 * Math.sin(Math.PI * p), lerp(el0[1], -380, p)];
    f.save(); f.translate(0, -548); motherHead(f); f.restore();
    if (p > .5) { f.save(); f.globalAlpha = ss((p - .5) / .3); f.fillStyle = '#16181c'; f.translate(2, -522); f.rotate(-.18); f.beginPath(); f.roundRect(-9, -36, 18, 66, 5); f.fill(); f.restore(); }   // her phone at her ear
    arm(f, [4, -404], el, hd, 26, 20);
  }, o);
}
// —— the mother kneeling at the water's edge, reaching forward with both hands (hands: [[x,y],[x,y]] in her units) ——
export function motherKneeling(c, x, y, s, o = {}) {
  const { hands = [[250, -150], [270, -140]], lean = 0 } = o;
  figure(c, x, y, s, f => {
    const piv = [-60, -100], rot = lean * .32;
    const R = ([px, py]) => { const dx = px - piv[0], dy = py - piv[1], cs = Math.cos(rot), sn = Math.sin(rot); return [piv[0] + dx * cs - dy * sn, piv[1] + dx * sn + dy * cs]; };
    // the lap and legs (not leaning)
    const L = new Path2D(); L.moveTo(-60, -150); L.bezierCurveTo(10, -150, 70, -120, 120, -64); L.bezierCurveTo(146, -40, 150, -10, 140, 0); L.lineTo(-104, 0); L.bezierCurveTo(-110, -40, -100, -110, -60, -150); L.closePath();
    f.fillStyle = SAREE; f.fill(L); f.save(); f.clip(L); f.fillStyle = GOLD; f.fillRect(-120, -16, 280, 12); f.restore();
    f.save(); f.translate(piv[0], piv[1]); f.rotate(rot); f.translate(-piv[0], -piv[1]);
    // the torso, bent a little forward
    const T = new Path2D(); T.moveTo(30, -338); T.bezierCurveTo(70, -330, 96, -300, 96, -268); T.bezierCurveTo(96, -246, 80, -234, 76, -222); T.bezierCurveTo(72, -190, 70, -150, 64, -118); T.lineTo(-90, -100); T.bezierCurveTo(-100, -170, -70, -270, -20, -340); T.closePath();
    f.fillStyle = SAREE; f.fill(T);
    // the pallu over her back
    const D = new Path2D(); D.moveTo(-30, -350); D.bezierCurveTo(-70, -300, -96, -220, -102, -140); D.lineTo(-56, -146); D.bezierCurveTo(-40, -220, -10, -300, 10, -340); D.closePath(); f.fillStyle = SAREE_D; f.fill(D);
        f.restore();
    // her arms reach forward to her hands (the far arm first, darker)
    const sh = R([34, -318]), sh2 = R([46, -326]);
    const [h1, h2] = hands, e2 = ik(sh2[0], sh2[1], h2[0], h2[1], 158, 150, 1), e1 = ik(sh[0], sh[1], h1[0], h1[1], 158, 150, 1);
    arm(f, sh2, e2, h2, 24, 19, SKIN_D);
    f.save(); f.translate(piv[0], piv[1]); f.rotate(rot); f.translate(-piv[0], -piv[1]); f.translate(62, -420); f.rotate(.42); motherHead(f, { eye: 'down' }); f.restore();
    arm(f, sh, e1, h1, 26, 20);
  }, o);
}
// —— the daughter (about six), kneeling beside her, facing +x; a braid with jasmine, marigold silk with a red-gold border ——
const FROCK = '#d8921c', FROCK_D = '#a86a12', BORDER = '#b0241a';
function girlHead(c) {
  c.fillStyle = SKIN; c.beginPath(); c.moveTo(24, -30); c.quadraticCurveTo(34, -18, 34, -4); c.quadraticCurveTo(34, 2, 33, 4); c.quadraticCurveTo(40, 12, 41, 16); c.quadraticCurveTo(39, 19, 34, 19); c.quadraticCurveTo(37, 22, 36, 25);
  c.quadraticCurveTo(34, 27, 34, 28); c.quadraticCurveTo(36, 30, 34, 33); c.quadraticCurveTo(33, 40, 26, 43); c.quadraticCurveTo(18, 46, 12, 46); c.lineTo(12, 76); c.lineTo(-14, 76); c.lineTo(-14, 46); c.quadraticCurveTo(-40, 30, -38, 0); c.quadraticCurveTo(-34, -40, 0, -42); c.quadraticCurveTo(16, -40, 24, -30); c.fill();
  c.fillStyle = 'rgba(200,90,70,.35)'; c.beginPath(); c.ellipse(16, 22, 10, 7, 0, 0, 7); c.fill();   // a warm cheek
  c.fillStyle = '#8a3428'; c.beginPath(); c.moveTo(36, 25); c.quadraticCurveTo(33, 27, 34, 28); c.quadraticCurveTo(36, 30, 34, 31); c.quadraticCurveTo(31, 29, 31, 27); c.fill();
  c.strokeStyle = HAIR; c.lineWidth = 1.8; c.beginPath(); c.moveTo(22, 6); c.quadraticCurveTo(27, 10, 32, 7); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(18, -4); c.quadraticCurveTo(26, -8, 32, -3); c.stroke();
  // hair: a centre parting, pulled back into a braid
  c.fillStyle = HAIR; c.beginPath(); c.moveTo(26, -28); c.quadraticCurveTo(8, -48, -20, -40); c.quadraticCurveTo(-44, -26, -42, 6); c.quadraticCurveTo(-40, 30, -24, 44); c.lineTo(-16, 30); c.quadraticCurveTo(-8, 0, 2, -14); c.quadraticCurveTo(14, -24, 26, -28); c.fill();
  c.strokeStyle = 'rgba(255,220,180,.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(18, -34); c.quadraticCurveTo(-8, -44, -30, -24); c.stroke();
  for (let k = 0; k < 7; k++) { const by = 30 + k * 16, bx = -34 - k * 2.4; c.fillStyle = HAIR; c.beginPath(); c.ellipse(bx, by, 8.5 - k * .5, 9, .3 * (k % 2 ? 1 : -1), 0, 7); c.fill(); }   // the braid
  for (let k = 0; k < 6; k++) { c.fillStyle = '#f6f0e0'; c.beginPath(); c.arc(-46 + Math.cos(k) * 4, 20 + k * 9, 4, 0, 7); c.fill(); }   // jasmine
  c.fillStyle = '#e8a020'; c.beginPath(); c.arc(-40, 10, 6, 0, 7); c.fill();   // a marigold in her hair
  c.fillStyle = '#c4201a'; c.beginPath(); c.arc(30, -6, 2.2, 0, 7); c.fill();   // a tiny bindi
}
export function girlKneeling(c, x, y, s, o = {}) {
  const { hands = [[150, -120], [160, -112]], lean = 0 } = o;
  figure(c, x, y, s, f => {
    const rot = lean * .25, piv = [-40, -70];
    const L = new Path2D(); L.moveTo(-40, -110); L.bezierCurveTo(10, -100, 60, -80, 90, -44); L.bezierCurveTo(104, -26, 104, -8, 98, 0); L.lineTo(-74, 0); L.bezierCurveTo(-80, -40, -70, -86, -40, -110); L.closePath();
    f.fillStyle = FROCK; f.fill(L); f.save(); f.clip(L); f.fillStyle = BORDER; f.fillRect(-90, -24, 200, 16); f.fillStyle = GOLD; f.fillRect(-90, -24, 200, 4); f.restore();
    f.save(); f.translate(piv[0], piv[1]); f.rotate(rot); f.translate(-piv[0], -piv[1]);
    const T = new Path2D(); T.moveTo(12, -226); T.bezierCurveTo(34, -224, 48, -206, 48, -184); T.bezierCurveTo(48, -150, 50, -116, 52, -84); T.lineTo(-58, -76); T.bezierCurveTo(-60, -130, -46, -196, -26, -216); T.bezierCurveTo(-14, -226, 0, -228, 12, -226); T.closePath();
    f.fillStyle = FROCK; f.fill(T); f.save(); f.clip(T); f.fillStyle = BORDER; f.fillRect(-70, -98, 140, 12); f.fillStyle = GOLD; f.fillRect(-70, -98, 140, 3); f.restore();
    f.restore();
    const R = ([px, py]) => { const dx = px - piv[0], dy = py - piv[1], cs = Math.cos(rot), sn = Math.sin(rot); return [piv[0] + dx * cs - dy * sn, piv[1] + dx * sn + dy * cs]; };
    const sh = R([10, -206]), sh2 = R([20, -212]), [h1, h2] = hands;
    arm(f, sh2, ik(sh2[0], sh2[1], h2[0], h2[1], 92, 88, 1), h2, 17, 14, SKIN_D, false, FROCK_D);
    f.save(); f.translate(piv[0], piv[1]); f.rotate(rot); f.translate(-piv[0], -piv[1]); f.translate(26, -290); f.rotate(.18); girlHead(f); f.restore();
    arm(f, sh, ik(sh[0], sh[1], h1[0], h1[1], 92, 88, 1), h1, 18, 15, SKIN, false, FROCK_D);
    f.fillStyle = GOLD; const wr = [lerp(h1[0], sh[0], .12), lerp(h1[1], sh[1], .12)]; f.beginPath(); f.arc(wr[0], wr[1], 7, 0, 7); f.fill();   // a little gold bangle
  }, o);
}
