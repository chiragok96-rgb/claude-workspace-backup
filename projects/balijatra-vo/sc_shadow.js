// The shadow theatre: Odisha's Ravana Chhaya (punched deer-hide silhouettes on a lamp-lit cloth), turning into Java and Bali's
// Wayang (filigree, the kayon) as the boita arrives. Puppets are cut on their own layer: black hide, holes punched with light.
import { W, H, clamp, lerp, seg, ss, eo, hh, mk, label } from './common.js';
const HIDE = '#0f0805';
let LAY;
function layer() { if (!LAY) LAY = mk(); const x = LAY.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); return x; }
function put(c, blur = 0, a = 1) { c.save(); c.globalAlpha = a; if (blur) c.filter = `blur(${blur}px)`; c.drawImage(LAY, 0, 0); c.restore(); }
const holes = (x, pts, r) => { x.save(); x.globalCompositeOperation = 'destination-out'; for (const [px, py] of pts) { x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); } x.restore(); };
const along = (path, n) => { const out = []; for (let i = 0; i < n; i++) out.push(path(i / (n - 1))); return out; };

// the cloth screen, lit from behind by an oil lamp: I = brightness, cool = 0..1 (dimmed, cold), flick = flicker phase
export function screen(c, t, I = 1, cool = 0) {
  const f = 1 + .04 * Math.sin(t * 13) + .03 * Math.sin(t * 7.3);
  c.fillStyle = '#120804'; c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(540, 860, 40, 540, 860, 1250);
  const L = I * f, mix = (a, b) => Math.round(lerp(a, b, cool));
  g.addColorStop(0, `rgba(${mix(255, 120)},${mix(214, 140)},${mix(150, 190)},${clamp(L)})`);
  g.addColorStop(.45, `rgba(${mix(236, 70)},${mix(150, 86)},${mix(70, 130)},${clamp(L * .95)})`);
  g.addColorStop(1, `rgba(${mix(70, 16)},${mix(30, 20)},${mix(14, 40)},${clamp(L)})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.save(); c.globalAlpha = .06 * I; c.strokeStyle = '#000'; c.lineWidth = 1; for (let y = 0; y < H; y += 4) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } for (let x = 0; x < W; x += 4) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } c.restore();
  c.save(); c.globalAlpha = .1 * I; c.fillStyle = '#3a1a08'; for (let k = 0; k < 14; k++) { c.beginPath(); c.ellipse(hh(k) * W, hh(k + 9) * H, 120 + hh(k * 3) * 200, 60 + hh(k * 5) * 90, hh(k * 7) * 3, 0, 7); c.fill(); } c.restore();   // stains on old cloth
  c.fillStyle = '#1a0c06'; c.fillRect(0, 0, W, 60); c.fillRect(0, H - 60, W, 60);   // the frame's bamboo rails
}
// silhouette sea: rows of curled waves, cut along their tops with holes
export function seaHide(c, t, y0 = 1180, a = 1) {
  const x = layer(); x.fillStyle = HIDE; x.beginPath(); x.moveTo(0, H);
  for (let i = 0; i <= 12; i++) { const px = i * 90, py = y0 + Math.sin(i * 1.3 + t * 1.6) * 10; x.lineTo(px - 30, py + 18); x.quadraticCurveTo(px - 10, py - 30, px + 28, py - 10); x.quadraticCurveTo(px + 10, py + 4, px + 40, py + 20); }
  x.lineTo(W, H); x.closePath(); x.fill();
  holes(x, along(u => [u * W, y0 + 60 + Math.sin(u * 30) * 8], 40), 3.2); holes(x, along(u => [u * W, y0 + 110], 32), 4);
  put(c, 0, a);
}
// the kendi in silhouette, with its rouletted band punched out as light
export function kendiHide(x, cx, cy, s, rot = 0) {
  x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(s, s); x.fillStyle = HIDE;
  x.beginPath(); x.moveTo(-40, -86); x.bezierCurveTo(-130, -76, -140, 54, -70, 96); x.bezierCurveTo(-36, 112, 36, 112, 70, 96); x.bezierCurveTo(140, 54, 130, -76, 40, -86); x.lineTo(30, -150); x.lineTo(52, -172); x.lineTo(-52, -172); x.lineTo(-30, -150); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(92, -36); x.bezierCurveTo(132, -44, 156, -74, 172, -98); x.lineTo(184, -90); x.bezierCurveTo(166, -56, 140, -14, 100, 6); x.closePath(); x.fill();
  x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 18; i++) { const a = (i / 17 - .5) * 2.3; x.beginPath(); x.arc(Math.sin(a) * 112, -40 + Math.cos(a) * 8, 4.2, 0, 7); x.fill(); }
  for (let i = 0; i < 14; i++) { const a = (i / 13 - .5) * 2.1; x.beginPath(); x.arc(Math.sin(a) * 104, 50 + Math.cos(a) * 8, 3.6, 0, 7); x.fill(); }
  x.restore();
}
// the sadhaba puppet (Ravana Chhaya style): profile facing right, tall turban, moustache, dhoti; arms on rods
export function sadhaba(x, cx, cy, s, liftK = 1) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = HIDE;
  x.beginPath();   // the head in profile, facing right: brow, a strong nose, moustache, a short beard, the neck
  x.moveTo(-30, -300); x.bezierCurveTo(-60, -320, -62, -380, -40, -410); x.lineTo(40, -412); x.lineTo(52, -392); x.lineTo(58, -372); x.lineTo(84, -348);
  x.lineTo(62, -342); x.lineTo(66, -330); x.lineTo(84, -326); x.lineTo(60, -318); x.bezierCurveTo(62, -296, 40, -286, 20, -296); x.lineTo(20, -280); x.lineTo(-30, -280); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(-58, -404); x.bezierCurveTo(-70, -470, 20, -490, 54, -440); x.bezierCurveTo(64, -424, 56, -408, 44, -404); x.closePath(); x.fill();   // the wound turban
  x.beginPath(); x.moveTo(-50, -420); x.quadraticCurveTo(-120, -430, -130, -360); x.quadraticCurveTo(-100, -396, -56, -396); x.fill();   // its tail falling behind
  x.beginPath(); x.moveTo(-60, -300); x.bezierCurveTo(-100, -200, -90, -60, -60, 20); x.lineTo(70, 20); x.bezierCurveTo(90, -80, 90, -220, 40, -300); x.closePath(); x.fill();   // torso
  x.beginPath(); x.moveTo(-70, 10); x.bezierCurveTo(-110, 120, -90, 220, -80, 300); x.lineTo(-40, 300); x.lineTo(-10, 120); x.lineTo(20, 300); x.lineTo(70, 300); x.bezierCurveTo(80, 200, 100, 110, 70, 10); x.closePath(); x.fill();   // dhoti and legs
  x.lineCap = 'round'; x.strokeStyle = HIDE; x.lineWidth = 26;
  const hx = lerp(150, 90, liftK), hy = lerp(-120, -400, liftK);   // the raised arm (it lifts the kendi)
  x.beginPath(); x.moveTo(40, -260); x.quadraticCurveTo(140, -230, hx, hy); x.stroke();
  x.beginPath(); x.moveTo(-40, -250); x.quadraticCurveTo(-120, -120, -80, -40); x.stroke();
  x.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 16; i++) { x.beginPath(); x.arc(-50 + i * 7, -250 + Math.sin(i * .8) * 6, 3, 0, 7); x.fill(); }   // a punched necklace
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(-60 + i * 24 + (r % 2) * 12, 60 + r * 46, 4.5, 0, 7); x.fill(); }   // the dhoti's border
  x.beginPath(); x.ellipse(34, -376, 8, 3.6, 0, 0, 7); x.fill();   // the eye
  for (let i = 0; i < 8; i++) { x.beginPath(); x.arc(-44 + i * 12, -434 + Math.sin(i) * 6, 3.2, 0, 7); x.fill(); }
  x.restore();
  return [cx + hx * s, cy + hy * s];
}
const rod = (c, x0, y0, x1, y1, a = 1) => { c.save(); c.globalAlpha = .75 * a; c.strokeStyle = '#2a1408'; c.lineWidth = 5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.restore(); };

// the boita: a curved hull with a raised makara prow, two masts, great square sails with Wayang filigree
export function boitaPath(cx, cy, s) {
  const P = new Path2D(), T = (x, y) => [cx + x * s, cy + y * s];
  const m = (x, y) => P.moveTo(...T(x, y)), l = (x, y) => P.lineTo(...T(x, y)), q = (a, b, x, y) => P.quadraticCurveTo(...T(a, b), ...T(x, y)), b3 = (a, b, c2, d, x, y) => P.bezierCurveTo(...T(a, b), ...T(c2, d), ...T(x, y));
  m(-300, -20); b3(-260, 70, 240, 80, 300, -20); q(330, -60, 350, -120); b3(380, -140, 400, -110, 380, -90); q(360, -70, 330, -40); l(320, 10); b3(200, 60, -200, 60, -290, 10); q(-340, -40, -360, -100); q(-330, -90, -300, -20); P.closePath();
  return P;
}
function sails(x, cx, cy, s, open = 1) {
  const T = (px, py) => [cx + px * s, cy + py * s];
  x.fillStyle = HIDE; x.fillRect(...T(-66, -470), 12 * s, 460 * s); x.fillRect(...T(164, -420), 12 * s, 410 * s);
  for (const [mx, top, w, h] of [[-60, -450, 240, 330], [170, -400, 200, 290]]) {
    const hh_ = h * open; x.beginPath(); x.moveTo(...T(mx - w / 2, top)); x.lineTo(...T(mx + w / 2, top)); x.quadraticCurveTo(...T(mx + w / 2 + 34 * open, top + hh_ / 2), ...T(mx + w / 2, top + hh_)); x.lineTo(...T(mx - w / 2, top + hh_)); x.quadraticCurveTo(...T(mx - w / 2 + 34 * open, top + hh_ / 2), ...T(mx - w / 2, top)); x.fill();
    if (open > .5) { x.save(); x.globalCompositeOperation = 'destination-out';   // filigree: a lattice of punched diamonds and rings
      for (let r = 1; r < 7; r++) for (let i = 1; i < 6; i++) { const px = mx - w / 2 + i * w / 6, py = top + r * hh_ / 7; const [X, Y] = T(px, py); x.beginPath(); if ((r + i) % 2) { x.moveTo(X, Y - 9 * s); x.lineTo(X + 7 * s, Y); x.lineTo(X, Y + 9 * s); x.lineTo(X - 7 * s, Y); x.closePath(); } else x.arc(X, Y, 5 * s, 0, 7); x.fill(); }
      x.restore(); } }
  x.beginPath(); x.moveTo(...T(-60, -470)); x.lineTo(...T(-16, -500)); x.lineTo(...T(-60, -490)); x.fill();   // a pennant
}
export function boitaHide(x, cx, cy, s, open = 1) {
  sails(x, cx, cy, s, open); x.fillStyle = HIDE; x.fill(boitaPath(cx, cy, s));
  x.save(); x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 22; i++) { const u = i / 21; x.beginPath(); x.arc(cx + lerp(-260, 260, u) * s, cy + (8 + Math.sin(u * Math.PI) * 24) * s, 5 * s, 0, 7); x.fill(); }
  x.beginPath(); x.arc(cx + 372 * s, cy - 112 * s, 5 * s, 0, 7); x.fill(); x.restore();   // the makara's eye
}
// the Wayang kayon (gunungan): the tree-of-life leaf that opens and closes every Javanese shadow play
export function kayon(x, cx, cy, s) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = HIDE;
  x.beginPath(); x.moveTo(0, -300); x.bezierCurveTo(90, -180, 160, -40, 150, 120); x.lineTo(-150, 120); x.bezierCurveTo(-160, -40, -90, -180, 0, -300); x.fill(); x.fillRect(-12, 120, 24, 120);
  x.globalCompositeOperation = 'destination-out'; x.lineCap = 'round';
  x.lineWidth = 7; x.beginPath(); x.moveTo(0, 100); x.lineTo(0, -230); x.stroke();
  for (let k = 0; k < 7; k++) { const y = 70 - k * 40, w = 110 - k * 12; for (const d of [-1, 1]) { x.beginPath(); x.moveTo(0, y); x.quadraticCurveTo(d * w * .6, y - 20, d * w, y - 46); x.stroke(); x.beginPath(); x.arc(d * w, y - 50, 8, 0, 7); x.fill(); } }
  x.beginPath(); x.arc(0, 60, 22, 0, 7); x.fill();
  x.restore();
}
export function islandHide(x, cx, cy, w, h) {
  x.fillStyle = HIDE; x.beginPath(); x.moveTo(cx - w, cy); x.bezierCurveTo(cx - w * .6, cy - h, cx + w * .6, cy - h * 1.1, cx + w, cy); x.closePath(); x.fill();
  x.strokeStyle = HIDE; x.lineWidth = 8; x.beginPath(); x.moveTo(cx + w * .2, cy - h * .8); x.quadraticCurveTo(cx + w * .3, cy - h * 1.6, cx + w * .45, cy - h * 2); x.stroke();
  for (let k = 0; k < 6; k++) { const a = -2.8 + k * .5; x.beginPath(); x.moveTo(cx + w * .45, cy - h * 2); x.quadraticCurveTo(cx + w * .45 + Math.cos(a) * 50, cy - h * 2 - 30, cx + w * .45 + Math.cos(a) * 90, cy - h * 2 + Math.sin(a) * 40 + 30); x.stroke(); }
}

// —— frames ——
export function shPot(c, t) {   // the pot tries to swim the sea on its own… and sinks
  screen(c, t, 1); seaHide(c, t, 1180);
  const x = layer(); const bob = Math.sin(t * 5) * 14, sink = ss(seg(t % 4, 1.6, 3.2)) * 90; kendiHide(x, 540, 1080 + bob + sink, .95, Math.sin(t * 4) * .25); put(c);
  for (let k = 0; k < 6; k++) { const a = (t * 2 + k) % 1; c.save(); c.globalAlpha = .7 * (1 - a); c.fillStyle = HIDE; c.beginPath(); c.arc(540 + (k % 2 ? 1 : -1) * (120 + a * 90), 1170 - a * 60, 8 - a * 5, 0, 7); c.fill(); c.restore(); }   // flailing splashes
  label(c, '?', 700, 870, 120, '#2a1406', 'rgba(255,214,150,.8)', 1, 700);
}
export function shSadhaba(c, t) {   // who carried it? our Sadhaba
  screen(c, t, 1); seaHide(c, t, 1250);
  const x = layer(); const [hx, hy] = sadhaba(x, 470, 1080, 1.35, 1); kendiHide(x, hx + 20, hy - 70, .5, -.15); put(c);
  rod(c, hx, hy, hx + 120, H); rod(c, 420, 1060, 360, H);
  label(c, 'ସାଧବ', 820, 560, 78, '#2a1406', 'rgba(255,220,160,.9)', 1);
}
export function shVoyage(c, t) {   // sails open; to Bali, Java and Sumatra — the puppets take on Wayang filigree
  screen(c, t, 1); const x = layer();
  islandHide(x, 220, 520, 130, 60); islandHide(x, 560, 430, 110, 50); islandHide(x, 880, 520, 140, 64); kayon(x, 960, 940, .9);
  boitaHide(x, 470, 1090 + Math.sin(t * 2) * 8, 1.05, 1); put(c);
  seaHide(c, t, 1180);
  label(c, 'ବାଲି', 220, 600, 48, '#2a1406', 'rgba(255,220,160,.9)'); label(c, 'ଜାଭା', 560, 505, 48, '#2a1406', 'rgba(255,220,160,.9)'); label(c, 'ସୁମାତ୍ରା', 880, 600, 48, '#2a1406', 'rgba(255,220,160,.9)');
}
export function shMemory(c, t) {   // the lamp dims, the voyage ends… but its outline stays lit: memory
  screen(c, t, .35, .8); const x = layer(); boitaHide(x, 470, 1090, 1.05, .25); put(c, 1.2, .55); seaHide(c, t, 1180, .6);
  c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,206,110,.95)'; c.lineWidth = 3; c.shadowColor = 'rgba(255,190,80,1)'; c.shadowBlur = 26;
  c.stroke(boitaPath(470, 1090, 1.05)); c.shadowBlur = 50; c.globalAlpha = .5; c.stroke(boitaPath(470, 1090, 1.05)); c.restore();
}
