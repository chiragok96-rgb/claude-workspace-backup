// Bali Jatra (voiceover): the film. ONE continuous camera, no cuts:
//   dawn on the Kalinga shore → the scent of cloves writes Kalidasa's verse in the sky → it settles into a carved stone on the sand →
//   push into the stone (a royal boita, ମହୋଦଧିପତି gilded as the sun climbs) → down past its broken foot into the earth →
//   the excavated kendi, drawn as an archaeologist draws a pot: one half from Manikapatna, the other from Bali·Java; they lock →
//   a lamp is lit behind the drawing paper: it becomes a shadow-play cloth (Ravana Chhaya → Wayang) → the voyage, the memory →
//   pull back: the cloth is a booth at the Bali Jatra fair at night → the two puppet traditions bow → the verse in the night sky →
//   tilt up, night washes into dawn = frame 0 (the loop). Voice-locked to audio/vo.mp3 (62.1 s).
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk, load, bez, chain, partial, at, scent, clove, label } from './common.js';
import { screen, seaHide, sadhaba, boitaHide, boitaPath, kayon, islandHide } from './sc_shadow.js';

const Q = new URLSearchParams(location.search), cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
export const DUR = 63.6; window.DUR = DUR;
const P = {};
const HIDE = '#0f0805';
const L1 = x => 1 - Math.pow(1 - clamp(x), 2);
const backOut = x => { x = clamp(x); const c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

// ———————————————— the camera (world A = the stone's own pixels; the shore and the earth are placed around it) ————————————————
const SX0 = 365, SY0 = 2284, S0 = 0.12;          // the stone stands on the shore plate at (365..495, 2284..2560), at 0.12 scale
const sw = (sx, sy) => [(sx - SX0) / S0, (sy - SY0) / S0];
const E0 = 2240;                                   // the earth section starts just under the stone's foot
const KX = 540, KY = E0 + 1560;                    // the excavated kendi
function zpath(a, b, u) {   // log-zoom with a straight fixed-point path (the push never wobbles)
  const z = a[2] * Math.pow(b[2] / a[2], u);
  if (Math.abs(Math.log(b[2] / a[2])) > .3) { const f = (1 / z - 1 / b[2]) / (1 / a[2] - 1 / b[2]); return [b[0] + (a[0] - b[0]) * f, b[1] + (a[1] - b[1]) * f, z]; }
  return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), z];
}
const A0 = [...sw(540, 960), S0], A1 = [...sw(540, 1740), S0], A2 = [540, 960, 1], A3 = [540, 985, 1.05], A4 = [480, 1711, 1.12], A5 = [540, KY - 30, 1], A6 = [540, KY - 30, 1.04];
const AK = [[0, 3.6, A0, A1, eio], [7.75, 9.3, A1, A2, eio], [9.3, 15.3, A2, A3, ss], [15.2, 16.6, A3, A4, eio], [19.95, 21.8, A4, A5, eio], [21.8, 24.8, A5, A6, ss]];
function camA(t) { let c = A0; for (const [a, b, p, q, e] of AK) { if (t >= b) c = q; else if (t > a) return zpath(p, q, e(seg(t, a, b))); else return c; } return c; }
const toS = (cam, x, y) => [(x - cam[0]) * cam[2] + 540, (y - cam[1]) * cam[2] + 960];
// the fair (its own plate's pixels); the booth's cloth is at (290, 1060, 500 × 888.9) — exactly the frame's shape
const SR = [290, 1060, 500, 500 * H / W], ZF = W / SR[2];
const F0 = [SR[0] + SR[2] / 2, SR[1] + SR[3] / 2, ZF], F1 = [540, 680 + 960, 1], F2 = [540, 200 + 960, 1], F3 = [540, 960, 1];
const FK = [[47.3, 49.4, F0, F1, eio], [50.6, 52.0, F1, F0, eio], [58.1, 59.7, F0, F2, eio], [61.9, 63.3, F2, F3, eio]];
function camF(t) { let c = F0; for (const [a, b, p, q, e] of FK) { if (t >= b) c = q; else if (t > a) return zpath(p, q, e(seg(t, a, b))); else return c; } return c; }

// ———————————————— the verse: Raghuvamsha 6.57, in Odia script ————————————————
const VERSE = ['ଅନେନ ସାର୍ଦ୍ଧଂ ବିହରାମ୍ବୁରାଶେ-', 'ସ୍ତୀରେଷୁ ତାଳୀବନମର୍ମରେଷୁ ।', ['ଦ୍ୱୀପାନ୍ତରାନୀତ', 'ଲବଙ୍ଗପୁଷ୍ପୈ-'], 'ରପାକୃତସ୍ୱେଦଲବା ମରୁଦ୍ଭିଃ ॥'];
let VW = 1; const vtxt = i => Array.isArray(VERSE[i]) ? VERSE[i].join('') : VERSE[i];
function gilt(c, y, size) { const g = c.createLinearGradient(0, y - size * .8, 0, y + size * .3); g.addColorStop(0, '#d8a548'); g.addColorStop(.5, '#a8701e'); g.addColorStop(1, '#7a4c12'); return g; }
// one line of verse at (x, y) in the current transform, revealed left→right to fraction p; hot = the clove words glow
function verseLine(c, i, x, y, size, p, a, look) {
  if (a <= 0 || p <= 0) return; c.save(); c.globalAlpha = a; c.font = `600 ${size}px "OdiaSerif"`; c.textBaseline = 'alphabetic';
  const full = vtxt(i), w = c.measureText(full).width, x0 = x - w / 2;
  c.beginPath(); c.rect(x0 - size, y - size * 1.6, (w + size * 2) * p, size * 2.4); c.clip();
  c.textAlign = 'left';
  const parts = Array.isArray(VERSE[i]) ? VERSE[i] : [VERSE[i]]; let xx = x0;
  parts.forEach((s, j) => {
    const hot = j === 1;
    if (look === 'sky') { c.shadowColor = 'rgba(255,240,214,.9)'; c.shadowBlur = size * .35; c.fillStyle = gilt(c, y, size); }
    else if (look === 'night') { c.shadowColor = hot ? 'rgba(255,196,96,1)' : 'rgba(255,190,90,.75)'; c.shadowBlur = size * (hot ? .9 : .55); c.fillStyle = hot ? '#ffe1a0' : '#f0c46e'; }
    else { c.shadowColor = 'rgba(40,20,6,.55)'; c.shadowOffsetX = size * .04; c.shadowOffsetY = size * .05; c.shadowBlur = size * .06; c.fillStyle = gilt(c, y, size); }   // inlaid in stone
    if (hot && look !== 'night') { c.fillStyle = look === 'sky' ? '#b0741a' : '#c89030'; }
    c.fillText(s, xx, y); xx += c.measureText(s).width;
  });
  c.restore();
  return [x0 + w * p, y - size * .35];
}
const VSKY = { y: 300, dy: 70, size: 40 }, VBAND = { y: 128, dy: 46, size: 28 };
function verseSky(c, t, cam) {   // 5.0–9.3: written in the dawn sky by the scent, then settles into the stone's top band
  if (t < 4.9 || t >= 9.3) return;
  const k = eio(seg(t, 7.75, 9.25));
  for (let i = 0; i < 4; i++) {
    const p = eo(seg(t, 5.05 + i * .62, 5.05 + i * .62 + .8)); if (p <= 0) continue;
    const [bx, by] = toS(cam, 540, VBAND.y + i * VBAND.dy), bs = VBAND.size * cam[2];
    const x = lerp(540, bx, k), y = lerp(VSKY.y + i * VSKY.dy, by, k), s = lerp(VSKY.size, bs, k);
    const tip = verseLine(c, i, x, y, s, p, 1, k > .6 ? 'stone' : 'sky');
    if (p < 1 && tip) { const [tx, ty] = tip; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(tx, ty, 0, tx, ty, 20); g.addColorStop(0, 'rgba(255,240,200,.75)'); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fillRect(tx - 20, ty - 20, 40, 40); c.restore(); }
  }
}

// ———————————————— the stone: three sun angles crossfaded, the gilded name wiped in ————————————————
let GB, GM, GBx;
function relief(c, t) {   // drawn in world A (the stone's pixels)
  const s = clamp((t - 8.6) / (15.2 - 8.6)) * 2;
  const pick = arr => s < 1 ? [arr[0], arr[1], s] : [arr[1], arr[2], s - 1];
  const [A, B, f] = pick(P.L); c.drawImage(A, 0, 0); if (f > .002) { c.globalAlpha = f; c.drawImage(B, 0, 0); c.globalAlpha = 1; }
  if (t >= 9.3) for (let i = 0; i < 4; i++) verseLine(c, i, 540, VBAND.y + i * VBAND.dy, VBAND.size, 1, 1, 'stone');
  const g = eio(seg(t, 11.2, 12.4));
  if (g > 0) {   // ମହୋଦଧିପତି: gold runs into the cut letters, left to right; then a glint crosses
    const [GA, GBb, gf] = pick(P.G); GBx.setTransform(1, 0, 0, 1, 0, 0); GBx.globalCompositeOperation = 'source-over'; GBx.clearRect(0, 0, 912, 136);
    GBx.drawImage(GA, 84, 1104, 912, 136, 0, 0, 912, 136); if (gf > .002) { GBx.globalAlpha = gf; GBx.drawImage(GBb, 84, 1104, 912, 136, 0, 0, 912, 136); GBx.globalAlpha = 1; }
    GBx.globalCompositeOperation = 'destination-in'; GBx.drawImage(GM, 0, 0);
    const fx = lerp(-180, 1000, g), gr = GBx.createLinearGradient(fx, 0, fx + 180, 0); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); GBx.fillStyle = gr; GBx.fillRect(0, 0, 912, 136);
    const sh = seg(t, 12.3, 13.4); if (sh > 0 && sh < 1) { GBx.globalCompositeOperation = 'source-atop'; const sx = lerp(-200, 1100, eio(sh)), sg = GBx.createLinearGradient(sx - 90, 0, sx + 90, 0); sg.addColorStop(0, 'rgba(255,240,200,0)'); sg.addColorStop(.5, 'rgba(255,246,220,.85)'); sg.addColorStop(1, 'rgba(255,240,200,0)'); GBx.fillStyle = sg; GBx.fillRect(0, 0, 912, 136); }
    c.drawImage(GB, 84, 1104);
  }
  const w = seg(t, 13.55, 15.6);   // "emperor of the sea": the carved waves catch the sun, crest by crest
  if (w > 0 && w < 1) { c.save(); c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 46; k++) { const x = 130 + hh(k * 3.1) * 820, y = 915 + Math.floor(hh(k * 7.7) * 4) * 44, ph = clamp((w * 1.5 - x / 1100 - hh(k) * .2) * 4); const a = Math.sin(ph * Math.PI); if (a <= 0) continue;
      const g2 = c.createRadialGradient(x, y, 0, x, y, 26); g2.addColorStop(0, `rgba(255,236,190,${.75 * a})`); g2.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = g2; c.fillRect(x - 26, y - 26, 52, 52);
      c.strokeStyle = `rgba(255,248,226,${.8 * a})`; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 12 * a, y); c.lineTo(x + 12 * a, y); c.moveTo(x, y - 12 * a); c.lineTo(x, y + 12 * a); c.stroke(); }
    c.restore(); }
}

// ———————————————— the kendi, as the archaeologist draws it (and as the shadow puppet is cut) ————————————————
const LEFT = (() => { const b1 = bez([-46, -96], [-150, -86], [-160, 60], [-80, 110], 30), b2 = bez([-80, 110], [-40, 128], [40, 128], [80, 110], 30);
  return [[0, -196], [-60, -196], [-34, -170], [-46, -96], ...b1.slice(1), ...b2.slice(1, 16)]; })();
const RIGHT = LEFT.map(([x, y]) => [-x, y]);
const SPOUT = [...bez([104, -40], [150, -50], [178, -84], [196, -112], 16), [210, -104], ...bez([210, -104], [190, -64], [160, -16], [116, 6], 16).slice(1)];
const DOTS = []; for (const yy of [-60, -40, 64]) for (let k = 0; k < 26; k++) { const u = (k + .5) / 26, ang = (u - .5) * 2.6; DOTS.push([Math.sin(ang) * 138, yy + Math.cos(ang) * 10]); }
const WAVE = Array.from({ length: 27 }, (_, i) => [-130 + i * 10, -50 + 7 * Math.sin(i * .9)]);
const KS = 1.404, KC = [540, 960 + 30 * 1.04];   // where the painted kendi sits in frame once the camera settles (screen px)
function kendiPath(cx, cy, s) { const p = new Path2D(), T = ([x, y]) => [cx + x * s, cy + y * s];
  [...LEFT, ...RIGHT.slice().reverse()].forEach((q, i) => i ? p.lineTo(...T(q)) : p.moveTo(...T(q))); p.closePath();
  SPOUT.forEach((q, i) => i ? p.lineTo(...T(q)) : p.moveTo(...T(q))); p.lineTo(...T([96, -24])); p.closePath(); return p; }
function poly(c, pts, cx, cy, s, p = 1) { const q = partial(pts, p); c.beginPath(); q.forEach(([x, y], i) => i ? c.lineTo(cx + x * s, cy + y * s) : c.moveTo(cx + x * s, cy + y * s)); c.stroke(); }
function inkHalf(c, side, cx, cy, s, p, col) {   // one half: outline, lip, the rouletted bands and the incised wave (the matching pattern)
  c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
  c.lineWidth = 2.6; poly(c, side < 0 ? LEFT : RIGHT, cx, cy, s, eio(seg(p, 0, .55)));
  if (side > 0) poly(c, SPOUT, cx, cy, s, eio(seg(p, .3, .7)));
  c.lineWidth = 1.6; const lp = seg(p, .45, .6); if (lp > 0) { c.beginPath(); c.moveTo(cx, cy - 170 * s); c.lineTo(cx + side * 56 * s * lp, cy - 170 * s); c.stroke(); }
  const dp = seg(p, .55, .95); let n = 0;
  for (const [x, y] of DOTS) { if (Math.sign(x) !== side) continue; n++; const u = side < 0 ? 1 - (x + 140) / 140 : x / 140; if (u > dp * 1.05) continue; c.beginPath(); c.arc(cx + x * s, cy + y * s, 2.6, 0, 7); c.fill(); }
  const wv = WAVE.filter(([x]) => Math.sign(x || side) === side); if (side < 0) wv.reverse(); c.lineWidth = 1.5; poly(c, [[0, -50], ...wv], cx, cy, s, seg(p, .6, 1));
  c.restore();
}
function potHide(x, cx, cy, s, rot = 0) {   // the same kendi cut in hide; its stamped bands punched as light
  x.save(); x.translate(cx, cy); x.rotate(rot); x.translate(-cx, -cy); x.fillStyle = HIDE; x.fill(kendiPath(cx, cy, s));
  x.globalCompositeOperation = 'destination-out'; for (const [px, py] of DOTS) { x.beginPath(); x.arc(cx + px * s, cy + py * s, Math.max(1.6, 2.7 * s), 0, 7); x.fill(); }
  x.lineWidth = Math.max(1.2, 2.2 * s); x.strokeStyle = '#000'; x.beginPath(); WAVE.forEach(([px, py], i) => i ? x.lineTo(cx + px * s, cy + py * s) : x.moveTo(cx + px * s, cy + py * s)); x.stroke();
  x.restore();
}

// ———————————————— the Wayang puppet (Java/Bali): fine long nose, tall crown, filigree, long jointed arms ————————————————
let WAY_HOLES = [];
const KAIN = new Path2D('M -34 -136 L 36 -136 L 46 -40 L 64 120 L 60 196 L -112 196 L -96 120 L -50 -40 Z');
const BODY = new Path2D('M -10 -298 L 24 -298 L 38 -284 L 44 -228 L 32 -132 L -28 -132 L -48 -226 L -42 -282 Z');
const HEAD = new Path2D('M -6 -300 L -8 -322 L -46 -338 L -52 -350 L -66 -358 L -62 -366 L -100 -372 L -28 -436 L 30 -440 L 44 -410 L 40 -340 L 22 -300 Z');
const CROWN = new Path2D('M -30 -436 L -36 -470 L -22 -520 L 6 -552 L 30 -522 L 58 -504 L 94 -470 L 90 -430 L 64 -416 L 42 -420 L 32 -440 Z');
const TAIL = new Path2D('M 36 -60 Q 110 60 136 252 Q 112 262 96 236 Q 80 130 40 60 Z');
const HAIR = new Path2D('M 40 -344 Q 76 -330 84 -282 Q 70 -270 52 -292 Z');
function initWayang() {
  const t = mk(400, 1000).getContext('2d'); t.translate(200, 600); const out = [];
  for (let y = -130; y < 196; y += 17) for (let x = -110; x < 66; x += 17) { const px = x + ((y / 17) % 2 ? 8 : 0); if (t.isPointInPath(KAIN, px + 200, y + 600)) out.push([px, y, 3.4]); }
  for (let y = -290; y < -136; y += 15) for (let x = -44; x < 44; x += 15) if (t.isPointInPath(BODY, x + 200, y + 600)) out.push([x, y, 2.6]);
  for (let y = -540; y < -420; y += 13) for (let x = -34; x < 96; x += 13) if (t.isPointInPath(CROWN, x + 200, y + 600)) out.push([x, y, 2.6]);
  WAY_HOLES = out;
}
function wayang(x, cx, cy, s, armK = 0) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = HIDE; x.strokeStyle = HIDE; x.lineCap = 'round'; x.lineJoin = 'round';
  for (const p of [KAIN, BODY, HEAD, CROWN, TAIL, HAIR]) x.fill(p);
  x.beginPath(); x.moveTo(-70, 190); x.lineTo(-78, 292); x.lineTo(-132, 300); x.lineTo(-64, 304); x.lineTo(-60, 196); x.fill();   // the front leg and pointed foot
  x.beginPath(); x.moveTo(20, 190); x.lineTo(26, 292); x.lineTo(-24, 300); x.lineTo(40, 304); x.lineTo(44, 196); x.fill();
  x.lineWidth = 12; const hx = lerp(-84, -120, armK), hy = lerp(36, -250, armK);   // long jointed arms (the front one rises to join hands)
  x.beginPath(); x.moveTo(-36, -276); x.lineTo(lerp(-66, -96, armK), lerp(-128, -250, armK)); x.lineTo(hx, hy); x.stroke();
  x.beginPath(); x.moveTo(30, -276); x.lineTo(54, -120); x.lineTo(34, 64); x.stroke();
  x.beginPath(); x.arc(hx, hy, 9, 0, 7); x.fill();
  x.globalCompositeOperation = 'destination-out';
  for (const [px, py, r] of WAY_HOLES) { x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); }
  x.beginPath(); x.ellipse(-40, -390, 9, 3, -.35, 0, 7); x.fill();   // the almond eye
  x.lineWidth = 2.2; x.strokeStyle = '#000'; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(-34 + k * 4, -134 + k * 26); x.lineTo(40 - k * 2, -134 + k * 26); x.stroke(); }
  x.restore();
  return [cx + hx * s, cy + hy * s];
}
const rod = (c, x0, y0, x1, y1, a = 1) => { if (a <= 0) return; c.save(); c.globalAlpha = .7 * a; c.strokeStyle = '#2a1408'; c.lineWidth = 4; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.restore(); };

// ———————————————— the shadow screen, all one performance (31.2 → end) ————————————————
let SH, SHx; const LAY = [];
function lay(i) { const x = LAY[i].getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.clearRect(0, 0, W, H); return x; }
function putL(c, i, blur = 0, a = 1) { if (a <= .003) return; c.save(); c.globalAlpha = clamp(a); if (blur > .3) c.filter = `blur(${blur.toFixed(1)}px)`; c.drawImage(LAY[i], 0, 0); c.restore(); }
function goldBoita(c, cx, cy, s, p, a) {   // the voyage remembered: hull, masts and the open sails traced in gold
  if (a <= 0 || p <= 0) return; const path = boitaPath(cx, cy, s), T = (x, y) => [cx + x * s, cy + y * s];
  const sail = new Path2D(); for (const [mx, top, w, h] of [[-104, -450, 260, 330], [126, -400, 220, 290]]) { sail.moveTo(...T(mx - w / 2, top)); sail.lineTo(...T(mx + w / 2, top)); sail.quadraticCurveTo(...T(mx + w / 2 + 34, top + h / 2), ...T(mx + w / 2, top + h)); sail.lineTo(...T(mx - w / 2, top + h)); sail.quadraticCurveTo(...T(mx - w / 2 + 34, top + h / 2), ...T(mx - w / 2, top)); }
  sail.moveTo(...T(-104, -470)); sail.lineTo(...T(-104, -20)); sail.moveTo(...T(126, -420)); sail.lineTo(...T(126, -20));
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [pp, L] of [[path, 2200 * s], [sail, 3600 * s]]) { c.setLineDash([L * p, L * 2]);
    c.strokeStyle = 'rgba(255,196,96,.35)'; c.lineWidth = 9; c.filter = 'blur(5px)'; c.stroke(pp); c.filter = 'none';
    c.strokeStyle = 'rgba(255,216,140,.95)'; c.lineWidth = 2.6; c.stroke(pp); }
  c.restore();
}
const ISLES = [[220, 520, 130, 60, 40.6, 'ବାଲି'], [560, 430, 110, 50, 41.3, 'ଜାଭା'], [880, 520, 140, 64, 42.1, 'ସୁମାତ୍ରା']];
function drawSH(S, t) {
  let I = 1, cool = 0; const dim = ss(seg(t, 43.6, 45.0)), re = ss(seg(t, 50.7, 51.6));
  I = lerp(lerp(1, .3, dim), 1, re); cool = lerp(.85 * dim, 0, re);
  screen(S, t, I, cool);
  // the isles (each pressed onto the cloth on its name), and their names
  const isleOut = 1 - ss(seg(t, 43.7, 44.9));
  if (t > 40.3 && isleOut > 0) { const x = lay(0);
    for (const [cx, cy, w, h, t0] of ISLES) { const k = eo(seg(t, t0 - .15, t0 + .45)); if (k <= 0) continue; x.globalAlpha = k; islandHide(x, cx, cy + (1 - k) * 40, w, h); }
    putL(S, 0, 0, isleOut);
    for (const [cx, cy, , , t0, nm] of ISLES) { const k = eo(seg(t, t0 - .05, t0 + .45)) * isleOut; label(S, nm, cx, cy + 74 + (1 - k) * 10, 50, '#2a1406', 'rgba(255,224,170,.9)', k); }
  }
  // the boita: pressed in from soft (37.7), sails open (38.6), sails on; folds as the lamp dims; leaves its gold outline
  const bIn = ss(seg(t, 37.7, 38.6)), bOut = 1 - ss(seg(t, 50.8, 51.6));
  const bx = lerp(390, 560, ss(seg(t, 38.2, 44.0))), by = 1100 + Math.sin(t * 2) * 7 * (1 - dim), bs = .78;
  if (bIn > 0 && bOut > 0) { const x = lay(1);
    const open = lerp(eo(seg(t, 38.55, 39.6)), .25, ss(seg(t, 43.6, 44.6)));
    boitaHide(x, bx, by, bs, open);
    x.save(); x.fillStyle = HIDE; const [hx, hy] = sadhaba(x, bx - 150 * bs, by - 22 * bs - 300 * .34, .34, 1); potHide(x, hx + 6, hy - 22, .3, -.1); x.restore();
    const mem = ss(seg(t, 45.0, 46.2));
    putL(S, 1, (1 - bIn) * 14 + mem * 1.4, bIn * bOut * lerp(1, .5, mem));
  }
  goldBoita(S, bx, by, bs, eo(seg(t, 45.45, 47.0)), ss(seg(t, 45.3, 45.8)) * (1 - ss(seg(t, 50.8, 51.5))) * (1 + .06 * Math.sin(t * 9)));
  // the sea, raised by the puppeteer as the lamp catches (31.4)
  const sy = lerp(1990, 1180, eo(seg(t, 31.35, 32.3)));
  // the pot: still in the drawing's place, then it tries to swim… and sinks; the Sadhaba lifts it out
  const potOut = 1 - ss(seg(t, 37.75, 38.5));
  const sIn = eo(seg(t, 35.85, 36.75)), sx = lerp(-260, 400, sIn), lift = ss(seg(t, 36.55, 37.3));
  let hand = null;
  if (t > 35.8 && potOut > 0) { const x = lay(3); hand = sadhaba(x, sx, 1080, 1.3, lift); }
  if (potOut > 0) {
    const m = eio(seg(t, 31.9, 32.9)), swim = ss(seg(t, 32.6, 33.2)), sink = ss(seg(t, 34.8, 35.9)) * (1 - lift);
    let px = lerp(KC[0], 560 + Math.sin(t * 1.3) * 18 * swim, m), py = lerp(KC[1], 1062, m) + Math.sin(t * 5) * 14 * swim + sink * 86, ps = lerp(KS, .95, m), pr = Math.sin(t * 4) * .22 * swim * (1 - sink * .5);
    if (hand) { const g = ss(seg(t, 36.75, 37.3)); px = lerp(px, hand[0] + 24, g); py = lerp(py, hand[1] - 64, g); ps = lerp(ps, .58, g); pr = lerp(pr, -.12, g); }
    const x = lay(2); potHide(x, px, py, ps, pr); putL(S, 2, 0, potOut);
    if (swim > 0 && !hand) for (let k = 0; k < 6; k++) { const a = (t * 2 + k * .17) % 1, f = swim * (1 - sink); S.save(); S.globalAlpha = .75 * (1 - a) * f; S.fillStyle = HIDE; S.beginPath(); S.arc(px + (k % 2 ? 1 : -1) * (120 + a * 90), 1172 - a * 64 + sink * 30, 8 - a * 5, 0, 7); S.fill(); S.restore(); }
  }
  seaHide(S, t, sy, t < 31.3 ? 0 : 1);
  if (hand) { const k = potOut; putL(S, 3, (1 - sIn) * 10 + (1 - potOut) * 16, sIn * k); rod(S, hand[0], hand[1], hand[0] + 130, H, sIn * k); rod(S, sx - 40, 1060, sx - 110, H, sIn * k); }
  // "and this year?": the kayon is planted; Odisha's puppet and Java's meet and bow; one gold thread between their hands
  if (t > 52.0) {
    const kk = eo(seg(t, 52.1, 53.0)); const x = lay(0); kayon(x, 540, 860 + (1 - kk) * 420, .85); putL(S, 0, (1 - kk) * 12, kk);
    const pin = eo(seg(t, 52.7, 53.9)), bow = Math.sin(Math.PI * seg(t, 54.05, 55.6)) * .16, jn = ss(seg(t, 55.7, 56.6));
    const y = lay(1);
    y.save(); const ax = lerp(-200, 250, pin), wx = lerp(1290, 830, pin);
    y.translate(ax, 1380); y.rotate(bow); y.translate(-ax, -1380); const hA = sadhaba(y, ax, 1080, 1.0, jn * .55); y.restore();
    y.save(); y.translate(wx, 1380); y.rotate(-bow); y.translate(-wx, -1380); const hW = wayang(y, wx, 1080, 1.0, jn); y.restore();
    putL(S, 1, (1 - pin) * 10, pin);
    const tf = (u, a0, a1, b0, b1) => [lerp(a0, b0, u), lerp(a1, b1, u)];
    rod(S, hA[0], hA[1], hA[0] + 60, H, pin); rod(S, hW[0], hW[1], hW[0] - 60, H, pin);
    const th = seg(t, 56.1, 57.3); if (th > 0) { const mid = [540, Math.min(hA[1], hW[1]) - 120]; const pts = chain(bez(hA, [hA[0] + 60, mid[1]], [mid[0] - 80, mid[1] - 30], mid, 24), bez(mid, [mid[0] + 80, mid[1] + 30], [hW[0] - 60, mid[1]], hW, 24));
      scent(S, pts, t, eio(th), 1, { w: 1.1 }); }
    label(S, 'ଇଣ୍ଡୋନେସିଆ', 540, 420 + (1 - eo(seg(t, 54.05, 54.6))) * 12, 66, '#2a1406', 'rgba(255,224,170,.9)', eo(seg(t, 54.05, 54.6)));
    label(S, 'ସହଯୋଗୀ ଦେଶ', 540, 508, 42, '#3a1c08', 'rgba(255,224,170,.9)', eo(seg(t, 55.55, 56.1)), 600);
  }
}

// ———————————————— the earth: field notes; then the drawing paper; then the lamp ————————————————
function fieldNotes(c, t, cam) {   // world A: a depth rod, layer numbers, the find ringed
  const p = seg(t, 21.7, 23.4); if (p <= 0) return; c.save();
  c.strokeStyle = 'rgba(244,230,204,.75)'; c.fillStyle = 'rgba(244,230,204,.85)'; c.lineWidth = 2 / cam[2];
  const y0 = E0 + 70, y1 = E0 + 2500, ye = lerp(y0, y1, eo(p));
  c.beginPath(); c.moveTo(66, y0); c.lineTo(66, ye); c.stroke();
  c.font = 'italic 500 26px "CormorantG"'; c.textAlign = 'left'; c.textBaseline = 'middle';
  for (let y = y0, k = 0; y <= ye; y += 100, k++) { const big = k % 5 === 0; c.beginPath(); c.moveTo(66, y); c.lineTo(66 + (big ? 26 : 12), y); c.stroke(); if (big && k) c.fillText(`${k / 10} m`, 100, y); }
  ['I', 'II', 'III', 'IV', 'V'].forEach((n, i) => { const a = eo(seg(t, 21.9 + i * .22, 22.4 + i * .22)); if (a <= 0) return; const y = E0 + 380 + i * 500; c.globalAlpha = a; c.beginPath(); c.arc(1010, y, 22, 0, 7); c.stroke(); c.textAlign = 'center'; c.fillText(n, 1010, y + 1); c.globalAlpha = 1; });
  const r = eo(seg(t, 22.7, 23.9)); if (r > 0) { c.setLineDash([14, 10]); c.beginPath(); c.ellipse(KX, KY - 40, 270, 310, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r); c.stroke(); c.setLineDash([]); }
  c.restore();
}
function paper(c, t) {   // the drafting sheet, slid up over the section; faint sepia graph rules
  const k = eio(seg(t, 24.8, 25.7)); if (k <= 0) return 0; const top = lerp(H + 40, 0, k);
  c.save(); c.fillStyle = 'rgba(20,10,4,.25)'; c.filter = 'blur(14px)'; c.fillRect(-40, top - 10, W + 80, 40); c.filter = 'none';
  c.fillStyle = 'rgba(244,236,220,.86)'; c.fillRect(0, top, W, H - top + 60);
  c.beginPath(); c.rect(0, top, W, H); c.clip();
  c.strokeStyle = 'rgba(150,110,70,.10)'; c.lineWidth = 1; for (let x = 0; x <= W; x += 24) { c.beginPath(); c.moveTo(x, top); c.lineTo(x, H); c.stroke(); } for (let y = 0; y <= H; y += 24) { if (y < top) continue; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  c.strokeStyle = 'rgba(150,110,70,.2)'; for (let x = 0; x <= W; x += 120) { c.beginPath(); c.moveTo(x, top); c.lineTo(x, H); c.stroke(); } for (let y = 0; y <= H; y += 120) { if (y < top) continue; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(0, top, W, 2);
  c.restore(); return k;
}
function drawing(c, t) {   // the two halves; they lock; the scent becomes the gold seam
  const [cx, cy] = KC, s = KS, INK = '#2a1c12', INK2 = '#5a2414';
  c.save();
  const ax = seg(t, 25.55, 26.1); if (ax > 0) { c.strokeStyle = 'rgba(42,28,18,.55)'; c.lineWidth = 1.4; c.setLineDash([10, 6, 2, 6]); c.beginPath(); c.moveTo(cx, cy - 250 * s); c.lineTo(cx, lerp(cy - 250 * s, cy + 160 * s, eo(ax))); c.stroke(); c.setLineDash([]); }
  inkHalf(c, -1, cx, cy, s, seg(t, 25.8, 27.1), INK);
  const r = seg(t, 26.95, 28.05); if (r > 0) { const dx = (1 - backOut(r)) * 520; c.globalAlpha = ss(seg(t, 26.95, 27.4)); inkHalf(c, 1, cx + dx, cy, s, 1, INK2); c.globalAlpha = 1; }
  const lock = Math.exp(-Math.pow((t - 28.05) / .12, 2)); if (lock > .02) { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(120,70,30,${.15 * lock})`; c.fillRect(cx - 4, cy - 200 * s, 8, 330 * s); c.restore(); }
  label(c, 'ମାଣିକପାଟଣା', cx - 200, cy + 252, 40, INK, 'rgba(246,238,222,.9)', eo(seg(t, 26.8, 27.3)), 600);
  label(c, 'ବାଲି · ଜାଭା', cx + 200, cy + 252, 40, INK2, 'rgba(246,238,222,.9)', eo(seg(t, 28.1, 28.6)), 600);
  c.save(); c.globalAlpha = eo(seg(t, 26.8, 27.3)) * .85; c.font = 'italic 500 26px "CormorantG"'; c.textAlign = 'center'; c.fillStyle = INK; c.fillText('Odisha', cx - 200, cy + 300); c.globalAlpha = eo(seg(t, 28.1, 28.6)) * .85; c.fillStyle = INK2; c.fillText('Indonesia', cx + 200, cy + 300); c.restore();
  const sm = seg(t, 30.15, 30.9); if (sm > 0) { const pts = [[cx, cy - 196 * s], [cx, cy + 124 * s]].map(([x, y]) => [x, y]);
    const line = Array.from({ length: 30 }, (_, i) => [cx, lerp(cy - 196 * s, cy + 124 * s, i / 29)]); scent(c, line, t, eio(sm), 1, { w: .9, op: 'source-over', col: [196, 140, 46], wob: .25 });
    c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(cx, cy, 0, cx, cy, 320 * s); const pk = Math.exp(-Math.pow((t - 30.6) / .35, 2)); g.addColorStop(0, `rgba(255,214,140,${.32 * pk})`); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
  c.restore();
}

// ———————————————— the fair at night ————————————————
const FEST = [[[180, 930], [-60, 1130], 70], [[900, 930], [1140, 1130], 70], [[-30, 1215], [262, 1085], 60], [[818, 1085], [1110, 1215], 60], [[262, 1220], [-40, 1420], 50], [[818, 1220], [1120, 1420], 50]];
const BULB = ['255,206,120', '255,226,170', '255,170,110', '255,214,140', '250,150,120'];
function bulb(c, x, y, r, col, a) { if (a <= 0) return; const g = c.createRadialGradient(x, y, 0, x, y, r * 5); g.addColorStop(0, `rgba(${col},${.9 * a})`); g.addColorStop(.25, `rgba(${col},${.35 * a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r * 5, y - r * 5, r * 10, r * 10); c.fillStyle = `rgba(255,246,226,${a})`; c.beginPath(); c.arc(x, y, r * .6, 0, 7); c.fill(); }
function fairGlow(c, B, I) {   // the screen's own light spilling onto the booth and the crowd, and the fair's haze (behind the cloth)
  c.save(); c.globalCompositeOperation = 'lighter';
  const sp = c.createRadialGradient(540, 1500, 100, 540, 1500, 760); sp.addColorStop(0, `rgba(255,170,90,${.26 * I})`); sp.addColorStop(1, 'rgba(255,150,80,0)'); c.fillStyle = sp; c.fillRect(-200, 700, 1480, 1700);
  if (B > 0) { const hz = c.createRadialGradient(540, 1560, 50, 540, 1560, 900); hz.addColorStop(0, `rgba(240,140,60,${.22 * B})`); hz.addColorStop(1, 'rgba(240,120,60,0)'); c.fillStyle = hz; c.fillRect(-300, 600, 1680, 1800); }
  c.restore();
}
function fairLights(c, t, B, I) {
  c.save(); c.globalCompositeOperation = 'lighter';
  if (B > 0) {
    for (let xx = -60, k = 0; xx < 1100; xx += 128, k++) { const f = .75 + .25 * Math.sin(t * 3 + k * 1.7); const g = c.createRadialGradient(xx + 64, 1640, 0, xx + 64, 1640, 150); g.addColorStop(0, `rgba(255,190,100,${.45 * B * f})`); g.addColorStop(1, 'rgba(255,160,80,0)'); c.fillStyle = g; c.fillRect(xx - 90, 1490, 310, 300); }
    FEST.forEach(([a, b, sag], j) => { const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 34);
      c.strokeStyle = `rgba(255,190,110,${.18 * B})`; c.lineWidth = 1.5; c.beginPath();
      for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * sag; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + Math.sin(u * Math.PI) * sag + 6; const on = clamp(B * 1.6 - (j * .1 + Math.abs(u - .5) * .6)); const tw = .78 + .22 * Math.sin(t * 6 + i * 2.1 + j); bulb(c, x, y, 4.2, BULB[(i + j) % 5], on * tw); } });
    const rot = t * .22; for (let k = 0; k < 28; k++) { const a = rot + k / 28 * Math.PI * 2, on = clamp(B * 1.5 - k / 28 * .5); bulb(c, 150 + Math.cos(a) * 200, 1330 + Math.sin(a) * 200, 4.6, BULB[k % 3], on * (.8 + .2 * Math.sin(t * 5 + k))); }
    for (let k = 0; k < 14; k++) { const a = rot + k / 14 * Math.PI * 2; c.strokeStyle = `rgba(255,200,120,${.12 * B})`; c.lineWidth = 2; c.beginPath(); c.moveTo(150, 1330); c.lineTo(150 + Math.cos(a) * 200, 1330 + Math.sin(a) * 200); c.stroke(); }
    bulb(c, 150, 1330, 8, '255,220,150', B);
  }
  c.restore();
  if (B > 0) {   // the booth's lit sign: ବାଲିଯାତ୍ରା
    c.save(); c.globalAlpha = clamp(B * 1.2); c.font = '700 60px "OdiaSerif"'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.shadowColor = 'rgba(255,186,80,1)'; c.shadowBlur = 30; c.fillStyle = '#ffe2a4'; c.fillText('ବାଲିଯାତ୍ରା', 540, 962); c.shadowBlur = 10; c.fillText('ବାଲିଯାତ୍ରା', 540, 962); c.restore();
  }
}
function fairScene(c, t, cam) {
  const [cx, cy, z] = cam; c.setTransform(z, 0, 0, z, 540 - cx * z, 960 - cy * z);
  c.drawImage(P.fair, 0, 0);
  const B = clamp(ss(seg(t, 48.95, 49.55)) + .35 * Math.exp(-Math.pow((t - 49.4) / .3, 2)) + .3 * Math.exp(-Math.pow((t - 61.35) / .45, 2)) * (t > 60 ? 1 : 0), 0, 1.35);
  const I = lerp(lerp(1, .3, ss(seg(t, 43.6, 45.0))), 1, ss(seg(t, 50.7, 51.6)));
  fairGlow(c, B, I);
  c.drawImage(SH, SR[0], SR[1], SR[2], SR[3]);
  fairLights(c, t, B, I);
  c.drawImage(SH, SR[0], SR[1], SR[2], SR[3]);   // the cloth is in front of every lamp behind it
  if (t > 58.2) for (let i = 0; i < 4; i++) verseLine(c, i, 540, 520 + i * 70, 40, eo(seg(t, 58.35 + i * .45, 58.35 + i * .45 + .8)), 1, 'night');
  if (t > 60.9) { c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 60; k++) { const u = seg(t, 60.95 + hh(k) * .5, 62.6 + hh(k) * .6); if (u <= 0 || u >= 1) continue; const x = 540 + (hh(k * 3) - .5) * 900 * eo(u), y = 960 - 600 * eo(u) + 160 * u * u; bulb(c, x, y, 2.4, '255,214,140', Math.sin(u * Math.PI)); } c.restore(); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
let WASH;
function dawnWash(c, t) {   // night → dawn: a wet wash runs down from the top and leaves the shore's sky (= frame 0)
  const u = eio(seg(t, 62.0, 63.4)); if (u <= 0) return; if (u >= 1) { c.drawImage(P.shore, 0, 0); return; }
  const x = WASH.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, W, H); x.drawImage(P.shore, 0, 0);
  const e = lerp(-350, H + 350, u); x.globalCompositeOperation = 'destination-in'; const g = x.createLinearGradient(0, e - 340, 0, e); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over';
  c.drawImage(WASH, 0, 0);
  c.save(); c.globalAlpha = .22 * Math.sin(u * Math.PI); c.strokeStyle = '#b88c78'; c.lineWidth = 3; c.filter = 'blur(2px)'; c.beginPath(); for (let i = 0; i <= 60; i++) { const xx = i * 18, yy = e - 170 + Math.sin(i * .7 + t) * 10 + (hh(i) - .5) * 14; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); c.restore();   // the wash's tide-line
}

// ———————————————— captions: a premium sans with one gold italic word; only in calm bands (y 1340–1470) ————————————————
const CAPS = [
  [2.15, 4.9, ['On Kalinga’s *shore*…', 'the scent of cloves from distant isles!'], 'ink'],
  [5.0, 7.75, ['So Kalidasa describes it', 'in his *Raghuvamsha*.'], 'ink'],
  [9.4, 11.15, ['There the great poet calls', 'the king of *Kalinga*'], 'stone'],
  [11.2, 12.8, ['*Mahodadhipati*'], 'stone'],
  [12.85, 15.25, ['that is, the *emperor* of the sea.'], 'stone'],
  [16.45, 19.85, ['But what ties that island', 'to our *Bali Jatra*?'], 'stone'],
  [21.45, 22.65, ['The answer isn’t only in *poetry*…'], 'earth'],
  [22.7, 24.75, ['it lies under the *earth*, too.'], 'earth'],
  [25.15, 29.1, ['Pots that match the ancient ware', 'of *Bali* and Java'], 'ink'],
  [29.2, 31.45, ['were found at *Manikapatna*, Odisha.'], 'ink'],
  [31.95, 34.65, ['A pot couldn’t have *swum*', 'the sea by itself!'], 'screen'],
  [34.7, 36.2, ['So who *carried* it?'], 'screen'],
  [36.25, 37.95, ['Our *Sadhabas*.'], 'screen'],
  [38.0, 41.15, ['Sails open on their *boitas*,', 'they sailed to Bali,'], 'screen'],
  [41.2, 43.25, ['*Java* and Sumatra.'], 'screen'],
  [43.3, 45.35, ['Those voyages *ended*…'], 'screen'],
  [45.4, 47.75, ['but never left Odia *memory*.'], 'screen'],
  [48.0, 50.5, ['That memory itself is *Bali Jatra*.'], 'night'],
  [50.6, 52.2, ['And *this* year?'], 'night'],
  [52.3, 55.4, ['Indonesia, the land of *Bali*,'], 'night'],
  [55.45, 58.0, ['is Cuttack Bali Jatra’s', '*partner* country.'], 'night'],
  [58.1, 60.3, ['Kalidasa kept it in *poetry*…'], 'night'],
  [60.35, 63.0, ['we keep it in a *fair*!'], 'night'],
];
const CL = { ink: ['#2a1d14', 'rgba(248,241,228,.92)', '#94621a'], stone: ['#26160c', 'rgba(240,222,198,.8)', '#86561a'], earth: ['#f6ead6', 'rgba(26,14,6,.85)', '#ebc06c'],
  screen: ['#f4e6cc', 'rgba(8,3,1,.92)', '#ebb866'], night: ['#f3e8d4', 'rgba(8,4,14,.9)', '#efc571'] };
function capLine(c, ln, y, look) {
  const [col, halo, gold] = CL[look]; const parts = ln.split('*'), solo = parts.length === 3 && !parts[0] && !parts[2];
  const fnt = j => j % 2 ? `italic 600 ${solo ? 64 : 50}px "CormorantG"` : '400 39px "InterT"';
  c.letterSpacing = '0.3px'; const ws = parts.map((p, j) => { c.font = fnt(j); return c.measureText(p).width; }); let x = 540 - ws.reduce((a, b) => a + b, 0) / 2;
  parts.forEach((p, j) => { if (!p) return; c.font = fnt(j); c.fillStyle = j % 2 ? gold : col; c.shadowColor = halo; c.shadowBlur = 18; c.fillText(p, x, y); c.shadowBlur = 0; c.fillText(p, x, y); x += ws[j]; });
}
function captions(c, t) {
  if (Q.get('cap') === '0') return;
  for (const [a, b, lines, look] of CAPS) { const k = ss(seg(t, a - .05, a + .3)) * (1 - ss(seg(t, b - .28, b + .02))); if (k <= 0) continue;
    c.save(); c.globalAlpha = k; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; const dy = (1 - eo(seg(t, a - .05, a + .5))) * 10;
    lines.forEach((ln, i) => capLine(c, ln, 1452 - (lines.length - 1 - i) * 60 + dy, look)); c.restore(); }
}

// ———————————————— the opening scent and its later threads (world A points, drawn in screen space) ————————————————
const SC1 = chain(bez(sw(930, 1592), sw(900, 1300), sw(700, 1060), sw(470, 1110), 40), bez(sw(470, 1110), sw(250, 1160), sw(260, 1700), sw(330, 1950), 40), bez(sw(330, 1950), sw(380, 2120), sw(430, 2200), sw(430, 2276), 30));
const SC2 = chain(bez([330, 1728], [450, 1690], [600, 1745], [700, 1716], 30), bez([700, 1716], [740, 1700], [736, 1660], [744, 1640], 16), bez([744, 1640], [756, 1574], [850, 1566], [860, 1630], 28), bez([860, 1630], [868, 1690], [800, 1688], [800, 1740], 24), [[800, 1760], [800, 1782]]);
const SC3 = chain(bez([800, 1850], [840, 2100], [700, 2500], [640, 2900], 40), bez([640, 2900], [600, 3200], [520, 3300], [540, KY - 196 * 1.35], 40));
function threadS(c, t, cam, pts, p, a, o) { scent(c, pts.map(([x, y]) => toS(cam, x, y)), t, p, a, o); }

// ———————————————— the frame ————————————————
window.render = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.imageSmoothingQuality = 'high';
  try {
    if (t < 32.3) {
      const cam = camA(t), [cx, cy, z] = cam;
      ctx.fillStyle = '#2a1a10'; ctx.fillRect(0, 0, W, H);
      ctx.setTransform(z, 0, 0, z, 540 - cx * z, 960 - cy * z);
      ctx.drawImage(P.shore, -SX0 / S0, -SY0 / S0, W / S0, 2700 / S0);
      const sb = ss(seg(z, .25, .6)); if (sb > 0) { ctx.globalAlpha = sb; ctx.drawImage(P.sandBG, (260 - SX0) / S0, (2160 - SY0) / S0, 300 / S0, 540 / S0); ctx.globalAlpha = 1; }
      if (z > .95) ctx.drawImage(P.earthF, 0, E0);
      relief(ctx, t);
      fieldNotes(ctx, t, cam);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      threadS(ctx, t, cam, SC1, eio(seg(t, .5, 4.7)), 1 - ss(seg(t, 4.9, 6.2)), { w: 1, op: 'source-over', col: [184, 124, 40], wob: .7 });
      verseSky(ctx, t, cam);
      if (t > 16.4 && t < 23.5) {
        threadS(ctx, t, cam, SC2, eio(seg(t, 16.6, 19.0)), 1 - ss(seg(t, 21.0, 22.6)), { w: 2.8, op: 'source-over', col: [214, 156, 52], wob: .25 });
        const dk = ss(seg(t, 18.85, 19.25)); if (dk > 0) { const [x, y] = toS(cam, 800, 1838); clove(ctx, x, y - 20, 1.25 * cam[2], .2, dk * (1 - ss(seg(t, 21.2, 22.4)))); }
        threadS(ctx, t, cam, SC3, eio(seg(t, 19.95, 21.9)), 1 - ss(seg(t, 22.6, 23.5)), { w: 1.1, wob: .6 });
      }
      const pk = paper(ctx, t);
      if (pk > 0) {
        drawing(ctx, t);
        const fill = ss(seg(t, 31.05, 31.5)); if (fill > 0) { ctx.save(); ctx.globalAlpha = fill; ctx.fillStyle = '#1a0e08'; ctx.fill(kendiPath(KC[0], KC[1], KS)); ctx.restore(); }
      }
      if (t > 31.0) {   // a lamp is lit behind the paper: it glows, becomes the cloth; the drawing is now a puppet's shadow
        const g = ss(seg(t, 31.0, 31.6)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const rg = ctx.createRadialGradient(540, 860, 30, 540, 860, 1200); rg.addColorStop(0, `rgba(255,190,110,${.55 * g})`); rg.addColorStop(1, `rgba(200,90,30,${.18 * g})`); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); ctx.restore();
        drawSH(SHx, t); ctx.globalAlpha = ss(seg(t, 31.35, 31.9)); ctx.drawImage(SH, 0, 0); ctx.globalAlpha = 1;
        const fl = Math.exp(-Math.pow((t - 31.6) / .2, 2)) * (t < 31.6 ? 1 : 1); if (fl > .01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const f2 = ctx.createRadialGradient(540, 860, 0, 540, 860, 900); f2.addColorStop(0, `rgba(255,220,160,${.5 * fl})`); f2.addColorStop(1, 'rgba(255,180,100,0)'); ctx.fillStyle = f2; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      }
    } else if (t < 47.3) { drawSH(SHx, t); ctx.drawImage(SH, 0, 0); }
    else {
      const cam = camF(t); drawSH(SHx, t);
      if (cam[2] >= ZF - 1e-4) ctx.drawImage(SH, 0, 0); else { ctx.fillStyle = '#05030a'; ctx.fillRect(0, 0, W, H); fairScene(ctx, t, cam); }
      dawnWash(ctx, t);
    }
    captions(ctx, t);
  } catch (e) { console.error('RENDER ' + e.stack); throw e; }
};

(async () => {
  for (const f of ['600 64px "Cinzel"', 'italic 600 50px "CormorantG"', 'italic 500 26px "CormorantG"', '400 39px "InterT"', '700 40px "OdiaSerif"', '600 26px "OdiaSerif"']) await document.fonts.load(f, f.includes('Odia') ? 'ବାଲିଯାତ୍ରାକଳିଙ୍ଗଦ୍ୱୀପ' : 'Aa');
  const base = new URL('.', import.meta.url).href, get = p => load(base + p);
  const [shore, earth, fair, ...rel] = await Promise.all(['plates/shore2.png', 'plates/earth2.png', 'plates/fair.png', ...[0, 1, 2].map(i => `plates/relief_L${i}.png`), ...[0, 1, 2].map(i => `plates/relief_G${i}.png`)].map(get));
  Object.assign(P, { shore, earth, fair, L: rel.slice(0, 3), G: rel.slice(3) });
  const ef = mk(1080, 2600), ex = ef.getContext('2d'); ex.drawImage(earth, 0, 0); ex.globalCompositeOperation = 'destination-in'; const eg = ex.createLinearGradient(0, 0, 0, 260); eg.addColorStop(0, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(0,0,0,1)'); ex.fillStyle = eg; ex.fillRect(0, 0, 1080, 2600); P.earthF = ef;
  const sbc = mk(1200, 2160), sbx = sbc.getContext('2d'); sbx.filter = 'blur(10px)'; sbx.drawImage(shore, 260, 2160, 300, 540, -40, -40, 1280, 2240); P.sandBG = sbc;   // a soft-focus sand for behind the stone
  // the gold letters' mask: where the gilded stone differs from the plain one
  const a = mk(912, 136), ax = a.getContext('2d', { willReadFrequently: true }); ax.drawImage(P.G[1], 84, 1104, 912, 136, 0, 0, 912, 136); const dg = ax.getImageData(0, 0, 912, 136);
  ax.clearRect(0, 0, 912, 136); ax.drawImage(P.L[1], 84, 1104, 912, 136, 0, 0, 912, 136); const dl = ax.getImageData(0, 0, 912, 136);
  const m = ax.createImageData(912, 136); for (let i = 0; i < m.data.length; i += 4) { const d = Math.abs(dg.data[i] - dl.data[i]) + Math.abs(dg.data[i + 1] - dl.data[i + 1]) + Math.abs(dg.data[i + 2] - dl.data[i + 2]); m.data[i + 3] = clamp(d / 40) * 255; }
  GM = mk(912, 136); GM.getContext('2d').putImageData(m, 0, 0); GB = mk(912, 136); GBx = GB.getContext('2d');
  SH = mk(); SHx = SH.getContext('2d'); for (let i = 0; i < 4; i++) LAY.push(mk()); WASH = mk();
  initWayang();
  if (Q.get('t')) window.render(+Q.get('t'));
  window.READY = true;
})();
