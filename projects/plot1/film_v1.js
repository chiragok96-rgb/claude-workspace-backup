// "Before the advance" — the first film of a premium Odisha property channel. Voice-locked to audio/vo.mp3 (55.56 s). Loops. One take.
// The chain: a white architectural model of a neighbourhood on a plinth, a projector painting the data as light → ₹20 lakh, our plot lit gold
// → the sun runs a full turn (three months) → down the lane: a gate rises and shuts → the neighbour; his claim floods his land and the lane
// → it crisps into the record (he wasn't wrong) → house lights out: only the record is projected; the dashed "road you see" breaks →
// top-down, the camera crosses to the light table beside the plinth (the lights come up on the paper) → the advance, held under a weight →
// the Bhulekh sheet, the lane's and the road's plot numbers ringed, lifted to their two pattas → the loupe: Odisha Sarkar / Kisam Rasta (good)
// → the lane: a person's name (beware) → the old sale deed: the access line is empty → the registered right-of-way deed slides in,
// sealed, the way inked in gold; the spoken promise is smoke → back over the model: the gate un-happens as the sun runs back, gold runs up
// the lane, sealed → dusk, a home's window lit: a thread of gold to its door → crane up, every plot lit → the loop.
import * as THREE from 'three';
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
import { makeWorld, S, PW, PD, TABLE } from './world.js';
import { drawProj, PXW, PXH } from './proj.js';
import { drawTable, DOCS, docXf, mapUV, CARD_ROWS, DEED_ROWS, SKETCH, skUV, regPos } from './table.js';
import { FIGS, HOUSES, HOME } from './layout.js';
const Q = new URLSearchParams(location.search), cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const DUR = 55.7; const FROM = +(Q.get('from') || 0); window.DUR = (+(Q.get('to') || DUR)) - FROM;
const PC = mk(PXW, PXH), pg = PC.getContext('2d'), TC = mk(2048, Math.round(2048 * TABLE.d / TABLE.w)), tcx = TC.getContext('2d');
const Wd = makeWorld(W, H, PC, TC), cam = Wd.camera, DEG = Math.PI / 180;

// ———————————————— the camera: one take (Hermite through keys, continuous velocity) ————————————————
// [t, tx, ty, tz, az°, el°, D, aperture]
const K3 = [
  [0, .02, 0, .0, 24, 48, 4.4, 1.5], [.95, .03, .004, -.11, 8, 16, .78, 6], [2.6, .033, .004, -.14, 2, 13, .5, 7], [3.6, .033, .004, -.15, -6, 15, .47, 7],
  [4.7, .03, .01, -.1, -25, 34, .64, 5], [5.5, .03, .01, .18, -130, 40, .78, 4], [6.25, .03, .008, .40, -175, 17, .40, 7], [7.3, .025, .008, .41, -182, 16, .36, 7],
  [7.95, .0, .012, .40, -248, 46, .58, 3], [8.45, -.02, .006, .40, -312, 12, .24, 9], [9.3, -.022, .006, .395, -318, 13, .28, 8], [10.4, -.06, 0, .25, -325, 40, 1.05, 4], [12.4, -.02, 0, .15, -345, 64, 1.7, 2.5], [14.5, 0, 0, .05, -358, 82, 2.6, 1.5],
  [16.4, 0, 0, 0, -360, 90, 3.5, 1], [17.7, 1.52, 0, 0, -360, 90, 3.6, 0], [18.2, 1.52, 0, 0, -360, 90, 3.6, 0],
  [42.55, 1.52, 0, 0, -360, 90, 3.6, 0], [43.3, .78, 0, .04, -360, 88, 5.0, 0], [44.3, .04, .006, .37, -352, 30, .72, 5], [45.4, .03, .006, .36, -352, 22, .5, 6],
  [46.6, .03, .006, .15, -356, 20, .6, 6], [48.0, .033, .006, -.08, -360, 18, .55, 7], [49.6, .25, .01, .05, -330, 26, .8, 5], [51.0, .47, .02, .15, -300, 22, .55, 6],
  [52.5, .3, 0, .08, -320, 34, 1.6, 3], [55.7, .02, 0, .0, -336, 48, 4.4, 1.5],
];
function herm(keys, t, i) {   // monotone cubic (Fritsch–Carlson) through keys: continuous velocity, no overshoot, holds stay still
  const n = keys.length; if (t <= keys[0][0]) return keys[0][i]; if (t >= keys[n - 1][0]) return keys[n - 1][i];
  let k = 0; while (k < n - 2 && t > keys[k + 1][0]) k++;
  const d = j => (keys[j + 1][i] - keys[j][i]) / (keys[j + 1][0] - keys[j][0]);
  const tan = j => { if (j <= 0 || j >= n - 1) return 0; const a = d(j - 1), b = d(j); if (a * b <= 0) return 0; const h0 = keys[j][0] - keys[j - 1][0], h1 = keys[j + 1][0] - keys[j][0]; return 3 * (h0 + h1) / ((2 * h1 + h0) / a + (h1 + 2 * h0) / b); };
  const A = keys[k], B = keys[k + 1], h = B[0] - A[0], u = (t - A[0]) / h, u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * A[i] + (u3 - 2 * u2 + u) * h * tan(k) + (-2 * u3 + 3 * u2) * B[i] + (u3 - u2) * h * tan(k + 1);
}
const shake = t => { const e = Math.exp(-Math.max(0, t - 6.27) / .12) * (t > 6.27 ? 1 : 0); return [Math.sin(t * 90) * e * .0012, Math.cos(t * 77) * e * .0008]; };
function cam3(t) {
  const v = i => herm(K3, t, i); const tg = [v(1), v(2), v(3)], az = v(4) * DEG, el = Math.min(90, v(5)) * DEG, D = v(6), [sx, sy] = shake(t);
  cam.position.set(tg[0] + D * Math.cos(el) * Math.sin(az) + sx, tg[1] + D * Math.sin(el) + sy, tg[2] + D * Math.cos(el) * Math.cos(az));
  const fh = new THREE.Vector3(-Math.sin(az), 0, -Math.cos(az)); cam.up.set(0, 1, 0).multiplyScalar(Math.cos(el)).addScaledVector(fh, Math.sin(el)).normalize();
  cam.lookAt(tg[0] + sx, tg[1] + sy, tg[2]); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  Wd.post.dof.focus = D; Wd.post.dof.aper = Math.max(0, v(7)); Wd.post.dof.maxCoc = 14; Wd.post.dof.aoAmt = Q.has('ao') ? +Q.get('ao') : 0;
}
const scr = (x, y, z) => { const p = new THREE.Vector3(x, y, z).project(cam); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z]; };
// ———————————————— the 2D camera over the light table (s = px per scene unit; matches the 3D top-down at D = 3.6) ————————————————
const S36 = 960 / (3.6 * Math.tan(13 * DEG));
const K2 = [[18.2, 1.52, 0, S36], [19.0, 1.62, -.33, 1500], [20.0, 1.33, -.31, 2300], [20.6, 1.37, -.17, 3500], [21.2, 1.39, -.15, 3300], [22.3, 1.77, -.12, 2300],
  [22.95, 1.765, -.245, 2900], [28.6, 1.775, -.205, 2950], [29.5, 1.84, .16, 2900], [31.9, 1.845, .17, 3050], [32.9, 1.36, .40, 2550], [37.6, 1.37, .42, 2700],
  [38.6, 1.55, .41, 2450], [39.5, 1.60, .41, 2600], [40.3, 1.62, .39, 3300], [41.3, 1.60, .40, 2600], [42.55, 1.52, 0, S36]];
const cam2 = t => ({ cx: herm(K2, t, 1), cz: herm(K2, t, 2), s: herm(K2, t, 3) });
const T2S = (c, x, z) => [W / 2 + (x - c.cx) * c.s, H / 2 + (z - c.cz) * c.s];

// ———————————————— lights ————————————————
function lights(t) {
  const tw = t > DUR - 3 ? t - DUR : t;
  const sweep = eio(seg(t, 3.5, 4.95)) - eio(seg(t, 44.4, 45.55));          // the sun runs a full turn (3 months), and back
  const out = ss(seg(t, 12.68, 12.95)) * (1 - ss(seg(t, 42.6, 43.6)));    // house lights: a relay out, a slow return
  const dusk = ss(seg(t, 48.4, 49.6)) * (1 - ss(seg(t, 53.4, 55.4)));
  const az = -.75 + sweep * Math.PI * 2, el = lerp(.52, .3, dusk) + .25 * Math.sin(sweep * Math.PI);
  Wd.setKey(az, el, lerp(lerp(.85, .5, dusk), .03, out)); Wd.key.color.set(dusk > 0 ? new THREE.Color('#ffe8cf').lerp(new THREE.Color('#ff9f5a'), dusk) : '#ffe8cf');
  Wd.hemi.intensity = lerp(lerp(.16, .1, dusk), .02, out); Wd.scene.environmentIntensity = lerp(lerp(.32, .16, dusk), .03, out);
  Wd.U.uWin.value = dusk * (.6 + .4 * ss(seg(t, 49.0, 50.2)));
  Wd.U.uProjOn.value = 1;
  const lit = t < 30 ? eio(seg(t, 16.9, 17.7)) : 1 - ss(seg(t, 43.4, 44.1));
  return { lit: Math.max(.06, lit) };
}
function gateState(t) { const rise = ss(seg(t, 5.7, 6.05)) * (1 - ss(seg(t, 45.05, 45.5))), shut = eo(seg(t, 5.95, 6.27)) * (1 - eio(seg(t, 44.55, 45.2))); Wd.setGate(rise, shut); }

// ———————————————— type ————————————————
const F = { od: w => `${w} ${'%'}px "OdiaSerif"`, };
function richLine(c, parts, x, y, sz, col, gold, align = 'center') {   // parts: [[text, kind]] kind: 'o' odia, 'l' latin, 'g' gold accent odia, 'gi' gold italic latin
  const font = k => k === 'o' || k === 'g' ? `600 ${sz}px "OdiaSerif"` : k === 'gi' ? `italic 600 ${Math.round(sz * 1.22)}px "CormorantG"` : `600 ${Math.round(sz * 1.12)}px "CormorantG"`;
  const ws = parts.map(([s, k]) => { c.font = font(k); return c.measureText(s).width; }); let xx = align === 'center' ? x - ws.reduce((a, b) => a + b, 0) / 2 : x;
  parts.forEach(([s, k], j) => { c.font = font(k); c.fillStyle = k[0] === 'g' ? gold : col; c.fillText(s, xx, y); xx += ws[j]; });
}
function parseLine(s) { const out = []; s.split('*').forEach((p, j) => { if (!p) return; const latin = /^[\x00-\x7F₹≠→—–’“”·]+$/.test(p.replace(/\s/g, '')); out.push([p, j % 2 ? (latin ? 'gi' : 'g') : (latin ? 'l' : 'o')]); }); return out; }
// captions: one Odia key phrase (one gold accent) + a quiet English line; only the words that matter
const CAPS = [
  [5.95, 7.35, 'Gate *ଲାଗିଗଲା*', 'A GATE WENT UP ON THE WAY IN'],
  [9.2, 10.85, '“ଏ ରାସ୍ତା *ମୋ* ଜମି”', '“THIS ROAD IS MY LAND”'],
  [11.0, 12.55, 'ସେ *ଭୁଲ୍* କହୁନଥିଲେ', 'AND HE WASN’T WRONG'],
  [12.75, 16.7, 'ଦିଶୁଥିବା Road ≠ *ସରକାରୀ* Road', 'THE ROAD YOU SEE ISN’T ALWAYS A PUBLIC ROAD'],
  [17.75, 19.45, '*Advance* ପୂର୍ବରୁ', 'BEFORE YOU PAY ANY ADVANCE'],
  [19.6, 22.95, 'ରାସ୍ତାର Plot No. → *ପଟ୍ଟା*', 'FIND THE ROAD’S PLOT NO. ON BHULEKH · READ ITS PATTA'],
  [23.1, 28.55, 'ଓଡ଼ିଶା ସରକାର · କିସମ ରାସ୍ତା = *ବଢ଼ିଆ*', 'GOVERNMENT LAND OR “ROAD” KISAM — YOU’RE SAFE'],
  [28.8, 31.95, 'ବ୍ୟକ୍ତିଙ୍କ ନାମ? *ସାବଧାନ୍*', 'A PERSON’S NAME ON IT? BEWARE'],
  [32.3, 37.65, 'Sale Deed ରେ *Right of Way*?', 'DO THE DEED AND OLD PAPERS PROVE A RIGHT OF WAY?'],
  [37.85, 42.45, '*Registered* କାଗଜ — ମୁହଁ କଥା ନୁହେଁ', 'IF NOT, GET THE WAY REGISTERED — NOT A SPOKEN PROMISE'],
  [42.75, 48.1, 'Gate ପରେ ନୁହେଁ — Advance *ପୂର୍ବରୁ*', 'SECURE THE ROAD BEFORE THE ADVANCE, NOT AFTER THE GATE'],
  [48.4, 51.45, 'ଘରେ କେହି ଜମି କିଣୁଛନ୍ତି? *ପଠାନ୍ତୁ*', 'SOMEONE AT HOME BUYING LAND? SEND THIS TO THEM'],
];
function captions(c, t, inkMode) {
  if (Q.get('cap') === '0') return;
  for (const [a, b, od, en] of CAPS) { const k = ss(seg(t, a - .05, a + .3)) * (1 - ss(seg(t, b - .28, b + .02))); if (k <= 0) continue;
    const dy = (1 - eo(seg(t, a - .05, a + .5))) * 10, ink = inkMode(t);
    c.save(); c.globalAlpha = k; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    const col = ink ? '#211a13' : '#f6eee1', gold = ink ? '#9c6a16' : '#eec06a';
    c.shadowColor = ink ? 'rgba(255,250,240,.95)' : 'rgba(10,6,3,.85)'; c.shadowBlur = ink ? 16 : 12; c.shadowOffsetY = ink ? 0 : 1.5;
    const parts = parseLine(od), sz = od.length > 30 ? 46 : 54;
    richLine(c, parts, 540, 1392 + dy, sz, col, gold); c.shadowBlur = 0; richLine(c, parts, 540, 1392 + dy, sz, col, gold);
    c.font = '600 21px "InterT"'; c.letterSpacing = '3.2px'; c.textAlign = 'center'; c.fillStyle = ink ? 'rgba(60,46,30,.85)' : 'rgba(226,206,168,.86)';
    c.shadowColor = ink ? 'rgba(255,250,240,.9)' : 'rgba(10,6,3,.8)'; c.shadowBlur = 8; c.fillText(en, 540, 1450 + dy); c.letterSpacing = '0px'; c.restore(); }
}
function capBand(c, t, a) {   // a soft dark gradient under the captions in the model scenes (no box)
  if (a <= 0) return; const g = c.createLinearGradient(0, 1180, 0, 1600); g.addColorStop(0, 'rgba(8,6,4,0)'); g.addColorStop(.45, `rgba(8,6,4,${.55 * a})`); g.addColorStop(.75, `rgba(8,6,4,${.55 * a})`); g.addColorStop(1, 'rgba(8,6,4,0)');
  c.fillStyle = g; c.fillRect(0, 1180, W, 420);
}
// a readout in the left third: index · layer, a big figure, an Odia line
function readout(c, a, idx, figure, od, en) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  { const g = c.createRadialGradient(300, 480, 40, 300, 480, 420); g.addColorStop(0, 'rgba(10,7,4,.62)'); g.addColorStop(1, 'rgba(10,7,4,0)'); c.fillStyle = g; c.fillRect(0, 160, 760, 640); }
  c.shadowColor = 'rgba(8,5,3,.75)'; c.shadowBlur = 14;
  c.font = '600 20px "InterT"'; c.letterSpacing = '4px'; c.fillStyle = '#e9bd6a'; c.fillText(idx, 84, 372); c.letterSpacing = '0px';
  c.fillStyle = 'rgba(233,189,106,.7)'; c.fillRect(84, 386, 54 * a, 2);
  c.font = '200 118px "InterT"'; c.fillStyle = '#f7efe2'; c.fillText(figure, 76, 506);
  c.font = '600 36px "OdiaSerif"'; c.fillStyle = '#f2e6d2'; c.fillText(od, 84, 566);
  if (en) { c.font = '600 18px "InterT"'; c.letterSpacing = '3px'; c.fillStyle = 'rgba(226,206,168,.8)'; c.fillText(en, 84, 602); c.letterSpacing = '0px'; }
  c.restore();
}
const inr = n => { const s = String(Math.round(n)); if (s.length <= 3) return s; const l3 = s.slice(-3), r = s.slice(0, -3); return r.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + l3; };
// a pin: a hairline from a world point up to a tag on a dark plate
function pin(c, a, p, title, sub, col = '#e9bd6a', up = 190, side = 1) {
  if (a <= 0 || p[2] > 1) return; const [x, y] = p, ty = y - up * ss(a), tx = x + side * 30;
  c.save(); c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x, ty); c.lineTo(tx, ty); c.stroke();
  c.fillStyle = col; c.beginPath(); c.arc(x, y, 4.5, 0, 7); c.fill();
  c.font = '600 30px "OdiaSerif"'; const w1 = c.measureText(title).width; c.font = '600 16px "InterT"'; c.letterSpacing = '3px'; const w2 = c.measureText(sub).width; c.letterSpacing = '0px';
  const bw = Math.max(w1, w2) + 36, bx = side > 0 ? tx : tx - bw; c.fillStyle = 'rgba(14,11,8,.72)'; c.fillRect(bx, ty - 52, bw, 88); c.fillStyle = col; c.fillRect(side > 0 ? bx : bx + bw - 3, ty - 52, 3, 88);
  c.textAlign = 'left'; c.fillStyle = '#f6eee1'; c.font = '600 30px "OdiaSerif"'; c.fillText(title, bx + 18, ty - 8);
  c.font = '600 16px "InterT"'; c.letterSpacing = '3px'; c.fillStyle = 'rgba(226,206,168,.9)'; c.fillText(sub, bx + 18, ty + 22); c.letterSpacing = '0px'; c.restore();
}

// ———————————————— the 2D table scene: papers, marks, the loupe, the weight, the seal press, smoke ————————————————
const LENS_MAG = 1.9;
function lensPath(t) {   // where the loupe sits (table coords), its radius (px) and presence
  const C1 = docXf(DOCS.c1), C2 = docXf(DOCS.c2), DD = docXf(DOCS.deed);
  const P = [[22.2, C1.toT(520, 960)], [24.2, C1.toT(520, 960)], [24.85, C1.toT(470, 625)], [27.8, C1.toT(480, 625)], [29.4, C2.toT(600, 965)], [32.2, C2.toT(605, 965)],
    [33.3, DD.toT(380, 760)], [34.8, DD.toT(420, 790)], [35.45, DD.toT(400, 870)], [36.35, DD.toT(700, 860)], [37.8, DD.toT(710, 860)]];
  const K = P.map(([tt, [x, z]]) => [tt, x, z]);
  const p = [herm(K, t, 1), herm(K, t, 2)], on = ss(seg(t, 22.1, 22.55)) * (1 - ss(seg(t, 37.15, 37.7)));
  return { x: p[0], z: p[1], on, lift: 1 + .35 * (1 - ss(seg(t, 22.1, 22.55))) + .1 * Math.sin(seg(t, 27.8, 29.4) * Math.PI) + .1 * Math.sin(seg(t, 32.2, 33.3) * Math.PI) + .35 * ss(seg(t, 37.15, 37.7)) };
}
function ring(c, x, y, r, prog, col, w = 3) { if (prog <= 0) return; c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r, -Math.PI / 2 - .3, -Math.PI / 2 - .3 + Math.PI * 2.1 * prog); c.stroke(); c.restore(); }
function inDoc(c, d, o, fn) { const X = docXf(d, o); c.save(); X.apply(c); fn(X); c.restore(); }
function uline(c, u0, u1, v, prog, col, w = 7) { if (prog <= 0) return; c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(u0, v); c.lineTo(lerp(u0, u1, prog), v); c.stroke(); c.restore(); }
function ellipseMark(c, x, y, rx, ry, prog, col, w = 7) { if (prog <= 0) return; c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.ellipse(x, y, rx, ry, -.03, -Math.PI / 2 - .4, -Math.PI / 2 - .4 + Math.PI * 2.08 * prog); c.stroke(); c.restore(); }
const GOLDM = '#c4841d', REDM = '#b3321f';
function marksT(c, t) {   // marks in page space of each paper (drawn with the papers, so they are also magnified inside the loupe)
  if (t > 20.1 && t < 23) inDoc(c, DOCS.map, null, () => { c.globalAlpha *= 1 - ss(seg(t, 22.2, 22.8)); const [lx, ly] = mapUV(4.5, 30), [rx, ry] = mapUV(26, 75);
    ellipseMark(c, lx, ly + 70, 30, 44, eo(seg(t, 20.2, 20.6)), GOLDM, 6); ellipseMark(c, rx, ry, 50, 30, eo(seg(t, 20.55, 20.95)), GOLDM, 6); });
  if (t > 23) inDoc(c, DOCS.c1, null, () => {
    uline(c, 340, 720, CARD_ROWS.owner + 14, eo(seg(t, 23.25, 24.0)), GOLDM); uline(c, 340, 500, CARD_ROWS.kisam + 14, eo(seg(t, 24.7, 25.3)), GOLDM);
    if (t > 26.85) { const p = eo(seg(t, 26.85, 27.25)), A = [530, 600], B = [575, 652], C = [680, 520]; c.strokeStyle = GOLDM; c.lineWidth = 12; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(...A);
      if (p < .35) c.lineTo(lerp(A[0], B[0], p / .35), lerp(A[1], B[1], p / .35)); else { c.lineTo(...B); const q = (p - .35) / .65; c.lineTo(lerp(B[0], C[0], q), lerp(B[1], C[1], q)); } c.stroke(); } });
  if (t > 29.4) inDoc(c, DOCS.c2, null, () => {
    uline(c, 340, 880, CARD_ROWS.owner + 14, eo(seg(t, 29.5, 30.5)), REDM); ellipseMark(c, 610, CARD_ROWS.owner - 14, 300, 62, eo(seg(t, 31.12, 31.5)), REDM, 6);
    if (t > 31.15) { const a = ss(seg(t, 31.15, 31.25)), sc = lerp(1.35, 1, eo(seg(t, 31.15, 31.32))); c.save(); c.translate(770, 820); c.rotate(-.12); c.scale(sc, sc); c.globalAlpha *= a * .9;
      c.strokeStyle = REDM; c.lineWidth = 6; c.strokeRect(-170, -48, 340, 96); c.lineWidth = 2.5; c.strokeRect(-160, -38, 320, 76);
      c.font = '700 54px "OdiaSerif"'; c.fillStyle = REDM; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ସାବଧାନ୍', 0, 4); c.restore(); } });
  if (t > 33.5 && t < 37.95) inDoc(c, DOCS.deed, null, () => {
    for (const [v, a, b, u1] of [[DEED_ROWS.sched, 33.6, 34.25, 700], [DEED_ROWS.bounds, 34.25, 34.85, 760], [DEED_ROWS.access, 34.85, 35.45, 345]]) if (t > a) { const p = eo(seg(t, a, b));
      c.fillStyle = `rgba(214,150,40,${t > b ? .16 : .3})`; c.fillRect(55, v - 34, lerp(0, u1 - 55, p), 46); }
    if (t > 35.5) { const p = eo(seg(t, 35.5, 36.3)); c.fillStyle = 'rgba(179,50,31,.85)'; c.beginPath(); c.arc(lerp(360, 930, p), DEED_ROWS.access - 8, 7, 0, 7); c.fill();
      if (t > 36.3) { c.globalAlpha *= ss(seg(t, 36.3, 36.6)); c.font = 'italic 700 46px "CormorantG"'; c.fillStyle = REDM; c.textAlign = 'right'; c.fillText('— none', 880, DEED_ROWS.access - 26); } } });
}
function weight(c, t) {   // a brass weight is set on the advance cheque (18.0–18.3)
  if (t < 17.95) return; const p = docXf(DOCS.chq).toT(860, 300), land = eo(seg(t, 17.98, 18.28)), sc = lerp(1.45, 1, land), off = lerp(.03, .004, land), r = .036;
  c.save(); c.globalAlpha *= ss(seg(t, 17.95, 18.1));
  c.fillStyle = 'rgba(30,20,10,.28)'; c.filter = 'blur(6px)'; c.beginPath(); c.arc(p[0] + off, p[1] + off, r * sc * 1.02, 0, 7); c.fill(); c.filter = 'none';
  const g = c.createRadialGradient(p[0] - r * .35, p[1] - r * .4, r * .05, p[0], p[1], r * sc); g.addColorStop(0, '#f7e3a8'); g.addColorStop(.45, '#c79a4a'); g.addColorStop(1, '#6e4a1c');
  c.fillStyle = g; c.beginPath(); c.arc(p[0], p[1], r * sc, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,238,200,.5)'; c.lineWidth = .0015; c.beginPath(); c.arc(p[0], p[1], r * sc * .7, 0, 7); c.stroke(); c.restore();
}
function press(c, t) {    // the registration seal press comes down on the deed (38.9–39.5)
  if (t < 38.85 || t > 39.75) return; const [x, z] = docXf(DOCS.reg, regPos(t)).toT(800, 1150), down = eio(seg(t, 38.9, 39.22)), up = eio(seg(t, 39.42, 39.72)), h = down - up;
  const sc = 1 + (1 - h) * .55, r = .05 * sc, off = (1 - h) * .05 + .006;
  c.save(); c.globalAlpha *= ss(seg(t, 38.85, 39.0)) * (1 - ss(seg(t, 39.6, 39.75)));
  c.fillStyle = 'rgba(30,20,10,.3)'; c.filter = 'blur(8px)'; c.beginPath(); c.arc(x + off, z + off, .05 * 1.05, 0, 7); c.fill(); c.filter = 'none';
  const g = c.createRadialGradient(x - r * .3, z - r * .35, r * .05, x, z, r); g.addColorStop(0, '#5a4636'); g.addColorStop(.6, '#2e221a'); g.addColorStop(1, '#140e0a'); c.fillStyle = g; c.beginPath(); c.arc(x, z, r, 0, 7); c.fill();
  const g2 = c.createRadialGradient(x - r * .2, z - r * .25, 0, x, z, r * .55); g2.addColorStop(0, '#f7e3a8'); g2.addColorStop(1, '#9a6a26'); c.fillStyle = g2; c.beginPath(); c.arc(x, z, r * .5, 0, 7); c.fill(); c.restore();
}
// the spoken promise: Odia words made of smoke, which hold for a breath and blow away
let SMOKE = null;
function smokeInit() { const cv = mk(900, 260), g = cv.getContext('2d'); g.font = '700 150px "OdiaSerif"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000'; g.fillText('ମୁହଁ କଥା', 450, 135);
  const d = g.getImageData(0, 0, 900, 260).data, pts = []; for (let y = 0; y < 260; y += 3) for (let x = 0; x < 900; x += 3) if (d[(y * 900 + x) * 4 + 3] > 128) pts.push([x - 450, y - 130, hh(x * 7.1 + y * 3.3), hh(x * 1.7 + y * 9.1)]); SMOKE = pts; }
const SMC = mk(W, H), smx = SMC.getContext('2d');
function smoke(c, t) {
  if (t < 41.0 || t > 42.6) return; if (!SMOKE) smokeInit();
  const form = eo(seg(t, 41.05, 41.55)), go = seg(t, 41.72, 42.45), cx = 560, cy = 700;
  smx.setTransform(1, 0, 0, 1, 0, 0); smx.clearRect(0, 0, W, H);
  for (const [x, y, r1, r2] of SMOKE) { const g0 = clamp((go - r1 * .35) / .65), dx = (1 - form) * (r1 - .5) * 260 + g0 * (160 + 280 * r2) + Math.sin(y * .05 + t * 3) * g0 * 50, dy = (1 - form) * (r2 - .3) * 160 - g0 * (240 + 220 * r1);
    const wx = Math.sin(y * .09 + t * 5 + r1 * 6) * 5 * (.4 + g0), wy = Math.cos(x * .07 + t * 4 + r2 * 6) * 4 * (.4 + g0); const a = form * (1 - g0) * .12; if (a <= .005) continue; smx.fillStyle = `rgba(96,86,78,${a})`; smx.beginPath(); smx.arc(cx + x * .62 + dx + wx, cy + y * .62 + dy + wy, 4.5 + g0 * 12 * r2 + (1 - form) * 7, 0, 7); smx.fill(); }
  c.save(); c.filter = 'blur(4px)'; c.drawImage(SMC, 0, 0); c.filter = 'blur(1.5px)'; c.globalAlpha = .5; c.drawImage(SMC, 0, 0); c.filter = 'none'; c.restore();
}
function lens(c, t, c2, draw) {
  const L = lensPath(t); if (L.on <= 0) return; const wide = ss(seg(t, 28.9, 29.5)) * (1 - ss(seg(t, 32.2, 33.0))), [x, y] = T2S(c2, L.x, L.z), R = (250 + 70 * wide) * L.lift, a = L.on;
  const redRim = Math.max(Math.exp(-Math.pow((t - 31.35) / .35, 2)), t > 31.2 && t < 32.3 ? .5 : 0);
  c.save(); c.globalAlpha = a;
  c.fillStyle = 'rgba(30,20,10,.25)'; c.filter = 'blur(14px)'; c.beginPath(); c.arc(x + 18 * L.lift, y + 26 * L.lift, R + 10, 0, 7); c.fill(); c.filter = 'none';
  c.save(); c.beginPath(); c.arc(x, y, R, 0, 7); c.clip(); const m = lerp(LENS_MAG, 1.55, wide) * (1 + (L.lift - 1) * .4);
  c.setTransform(c2.s * m, 0, 0, c2.s * m, x - L.x * c2.s * m, y - L.z * c2.s * m); draw(c);
  c.setTransform(1, 0, 0, 1, 0, 0); const gl = c.createRadialGradient(x - R * .35, y - R * .4, 0, x, y, R); gl.addColorStop(0, 'rgba(255,255,255,.10)'); gl.addColorStop(.7, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(60,40,20,.18)'); c.fillStyle = gl; c.fillRect(x - R, y - R, 2 * R, 2 * R); c.restore();
  c.lineWidth = 16; c.strokeStyle = '#17120e'; c.beginPath(); c.arc(x, y, R + 8, 0, 7); c.stroke();
  c.lineWidth = 3; c.strokeStyle = redRim > .05 ? `rgba(220,70,45,${.5 + .5 * redRim})` : 'rgba(214,170,90,.9)'; c.beginPath(); c.arc(x, y, R + 1, 0, 7); c.stroke();
  c.lineWidth = 2; c.strokeStyle = 'rgba(255,240,210,.35)'; c.beginPath(); c.arc(x, y, R + 15, Math.PI * 1.05, Math.PI * 1.6); c.stroke(); c.restore();
}
function flyNumbers(c, t, c2) {   // 20.9–22.4: the two plot numbers lift off the map and fly to their pattas
  if (t < 20.85 || t > 22.6) return; const M = docXf(DOCS.map);
  const lanePt = M.toT(...mapUV(4.5, 30)).map((v, i) => v + (i ? 70 * DOCS.map.w / 1000 : 0)), roadPt = M.toT(...mapUV(26, 75));
  const dst2 = docXf(DOCS.c2).toT(400, CARD_ROWS.plot - 16), dst1 = docXf(DOCS.c1).toT(420, CARD_ROWS.plot - 16);
  for (const [s, a, b, d] of [['୩୪୧', lanePt, dst2, 0], ['୧୦୨୪', roadPt, dst1, .12]]) { const u = eio(seg(t, 20.95 + d, 22.2 + d)), lift = Math.sin(u * Math.PI);
    const x = lerp(a[0], b[0], u), z = lerp(a[1], b[1], u) - lift * .05; const [sx, sy] = T2S(c2, x, z), sz = 34 + 26 * lift, al = ss(seg(t, 20.9 + d, 21.05 + d)) * (1 - ss(seg(t, 22.25 + d, 22.45 + d)));
    c.save(); c.globalAlpha = al; c.font = `700 ${sz}px "OdiaSerif"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = 'rgba(214,150,40,.9)'; c.shadowBlur = 24 * lift; c.fillStyle = '#b8781a'; c.fillText(s, sx, sy); c.restore(); }
}
function scene2D(c, t) {
  const c2 = cam2(t); const draw = g => { drawTable(g, t, 1); marksT(g, t); };
  c.save(); c.fillStyle = '#0c0a08'; c.fillRect(0, 0, W, H); c.setTransform(c2.s, 0, 0, c2.s, W / 2 - c2.cx * c2.s, H / 2 - c2.cz * c2.s); draw(c); weight(c, t); press(c, t); c.restore();
  lens(c, t, c2, g => { draw(g); });
  flyNumbers(c, t, c2); smoke(c, t);
  // vignette + a soft warm falloff of the table light
  const g = c.createRadialGradient(540, 900, 300, 540, 960, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,24,10,.35)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
}

// ———————————————— the 3D scene ————————————————
let tableStamp = -1, lastLit = -1;
function scene3D(c, t) {
  const L = lights(t); gateState(t); cam3(t);
  drawProj(pg, t, DUR); Wd.projTex.needsUpdate = true;
  if ((t > 15.8 && t < 18.2) || (t > 42.3 && t < 44.5) || tableStamp < 0 || Math.abs(L.lit - lastLit) > .01) { lastLit = L.lit; tcx.setTransform(TC.width / TABLE.w, 0, 0, TC.height / TABLE.d, -(TABLE.x - TABLE.w / 2) * TC.width / TABLE.w, -(TABLE.z - TABLE.d / 2) * TC.height / TABLE.d); drawTable(tcx, t, L.lit); Wd.tableTex.needsUpdate = true; tableStamp = t; }
  Wd.tableGlow.intensity = L.lit * 1.2;
  Wd.post.composer.render(); c.drawImage(Wd.renderer.domElement, 0, 0);
}
function overlays3D(c, t) {
  // readouts
  readout(c, ss(seg(t, .3, .7)) * (1 - ss(seg(t, 2.65, 3.0))), '01  ·  THE PLOT', '₹' + inr(2000000 * eo(seg(t, .45, 1.9))), 'କୋଡ଼ିଏ ଲକ୍ଷରେ Plot କିଣିଲେ', 'TWENTY LAKH, ONE PLOT');
  readout(c, ss(seg(t, 3.4, 3.7)) * (1 - ss(seg(t, 5.0, 5.35))), '02  ·  TIME', Math.round(90 * eio(seg(t, 3.5, 4.95))) + ' days', 'ତିନି ମାସ ପରେ', 'THREE MONTHS LATER');
  readout(c, ss(seg(t, 44.3, 44.55)) * (1 - ss(seg(t, 45.6, 45.95))), '03  ·  REWIND', Math.round(90 * (1 - eio(seg(t, 44.4, 45.55)))) + ' days', 'Advance ଦେବା ପୂର୍ବରୁ', 'BEFORE THE ADVANCE');
  // pins
  const f = FIGS[1]; pin(c, ss(seg(t, 7.7, 8.1)) * (1 - ss(seg(t, 10.6, 10.95))), scr(f[0] * S, 1.9 * S, f[1] * S), 'ପାଖ ଜମି ମାଲିକ', 'THE NEIGHBOUR', '#e9bd6a', 210, -1);
  pin(c, ss(seg(t, 11.05, 11.4)) * (1 - ss(seg(t, 12.45, 12.75))), scr(4.5 * S, .2 * S, 20 * S), 'Plot ୩୪୧ · ନିଜସ୍ୱ', 'THE LANE IS A PRIVATE PLOT', '#ff7a55', 170, -1);
  pin(c, ss(seg(t, 46.9, 47.25)) * (1 - ss(seg(t, 48.1, 48.4))), scr(4.5 * S, .2 * S, 66 * S), 'ରାସ୍ତା ଅଧିକାର ✓', 'RIGHT OF WAY · REGISTERED', '#e9bd6a', 220, 1);
  const hs = HOUSES[HOME]; pin(c, ss(seg(t, 49.7, 50.1)) * (1 - ss(seg(t, 51.4, 51.7))), scr(hs[0] * S, 7.4 * S, (hs[1] + hs[3]) / 2 * S), 'ଘର', 'HOME', '#e9bd6a', 200, -1);
  // the end card
  const e = ss(seg(t, 52.3, 52.9)) * (1 - ss(seg(t, 55.0, 55.55)));
  if (e > 0) { c.save(); c.globalAlpha = e; c.textAlign = 'center'; c.shadowColor = 'rgba(8,5,3,.8)'; c.shadowBlur = 18;
    c.font = '200 92px "InterT"'; c.letterSpacing = '18px'; c.fillStyle = '#f7efe2'; c.fillText('FOLLOW', 549, 520); c.letterSpacing = '0px';
    c.fillStyle = 'rgba(233,189,106,.85)'; c.fillRect(540 - 60 * e, 548, 120 * e, 2);
    c.font = '600 40px "OdiaSerif"'; c.fillStyle = '#f2e6d2'; c.fillText('Property ବିଷୟରେ ଜରୁରୀ ତଥ୍ୟ', 540, 612);
    c.font = '600 19px "InterT"'; c.letterSpacing = '5px'; c.fillStyle = 'rgba(226,206,168,.85)'; c.fillText('ODISHA  ·  LAND  ·  PROPERTY', 540, 656); c.letterSpacing = '0px'; c.restore(); }
}

// ———————————————— grain ————————————————
let GRAIN; function grain(c, t) {
  if (!GRAIN) { GRAIN = mk(512, 512); const g = GRAIN.getContext('2d'), d = g.createImageData(512, 512); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (hh(i * .25 + .5) - .5) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
  const f = Math.floor(t * 30), ox = (f * 197) % 512, oy = (f * 311) % 512; c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .06; c.fillStyle = c.createPattern(GRAIN, 'repeat'); c.translate(-ox, -oy); c.fillRect(ox, oy, W, H); c.restore();
}
// ———————————————— the frame ————————————————
const TWO_A = 17.85, TWO_B = 42.55;   // the light table is drawn in 2D between these (the hand-overs are frame-exact at the same top-down view)
window.render = t0 => {
  const t = t0 + FROM;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  try {
    const in2 = t >= TWO_A + .3 && t <= TWO_B - .1, x2 = !in2 && t > TWO_A - .1 && t < TWO_B + .02;
    if (!in2) scene3D(ctx, t);
    if (in2 || x2) { ctx.save(); ctx.globalAlpha = in2 ? 1 : (t < 30 ? ss(seg(t, TWO_A - .1, TWO_A + .3)) : 1 - ss(seg(t, TWO_B - .1, TWO_B + .02))); scene2D(ctx, t); ctx.restore(); }
    if (!in2) overlays3D(ctx, t);
    const inkMode = tt => tt > 17.75 && tt < 42.75;
    const capA = CAPS.reduce((m, [a, b]) => Math.max(m, ss(seg(t, a - .2, a + .2)) * (1 - ss(seg(t, b - .2, b + .2)))), 0);
    if (!inkMode(t)) capBand(ctx, t, capA); else if (capA > 0) { const g = ctx.createLinearGradient(0, 1250, 0, 1560); g.addColorStop(0, 'rgba(250,246,238,0)'); g.addColorStop(.4, `rgba(250,246,238,${.82 * capA})`); g.addColorStop(.72, `rgba(250,246,238,${.82 * capA})`); g.addColorStop(1, 'rgba(250,246,238,0)'); ctx.fillStyle = g; ctx.fillRect(0, 1250, W, 310); }
    captions(ctx, t, inkMode);
    grain(ctx, t);
  } catch (e) { console.error('RENDER ' + e.stack); throw e; }
};
(async () => {
  for (const f of ['600 30px "OdiaSerif"', '700 30px "OdiaSerif"', 'italic 600 56px "CormorantG"', '600 50px "CormorantG"', '700 40px "CormorantG"', '200 100px "InterT"', '600 20px "InterT"', '700 20px "InterT"', '500 20px "InterT"'])
    await document.fonts.load(f, f.includes('Odia') ? 'ଭୂଲେଖ ନକ୍ସା ଖତିୟାନ ମାଲିକ ଓଡ଼ିଶା ସରକାର ୦୧୨୩୪୫୬୭୮୯ ମୁହଁ କଥା ଶ୍ରୀ ହରିହର ମହାନ୍ତି' : 'Aa₹');
  if (Q.get('t')) window.render(+Q.get('t'));
  window.READY = true;
})();
