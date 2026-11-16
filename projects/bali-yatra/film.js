// BALI JATRA — the film. One handful of sand lit two ways (the fair at night / the lightbox), and the Kartika night.
// 0–5.8 the fair's sand · 5.8 the light flips · 6–36.4 the lightbox (the island, the lane, the wind, the moon)
// 36.4 into the moon · 36.4–60.8 Kartika night (the boita, the boats of light, Cuttack's fair) · 60.8 back through the moon
// 60.8–68.3 the lightbox (the island sails to Cuttack) · 68.3 the light flips back · –73.72 the fair's sand (= frame 0)
import * as THREE from 'three';
import { paintSand, syncWin, WIN, FOOT, P, SEA, LAND } from './sand.js';
import * as A from './sandart.js';
import * as N from './night.js';
import { FOODS, animateFood } from './food.js';
export const DUR = 73.72;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); }, eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }, eo = x => 1 - Math.pow(1 - clamp(x), 3), ei = x => Math.pow(clamp(x), 3);
const S_ = (t, a, b) => ss(seg(t, a, b));
const hh = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };

// ---------- a camera rig: monotone cubic through keys, per channel ----------
function rig(keys) {
  const n = keys.length, ch = keys[0].length - 1, T = keys.map(k => k[0]), m = [];
  for (let c = 1; c <= ch; c++) { const y = keys.map(k => k[c]), d = [], mm = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d.push((y[i + 1] - y[i]) / (T[i + 1] - T[i]));
    for (let i = 1; i < n - 1; i++) mm[i] = d[i - 1] * d[i] <= 0 ? 0 : (3 * (T[i + 1] - T[i - 1])) / ((2 * T[i + 1] - T[i] - T[i - 1]) / d[i - 1] + (T[i + 1] + T[i] - 2 * T[i - 1]) / d[i]);
    m.push(mm); }
  return t => { if (t <= T[0]) return keys[0].slice(1); if (t >= T[n - 1]) return keys[n - 1].slice(1);
    let i = 0; while (t > T[i + 1]) i++; const h = T[i + 1] - T[i], s = (t - T[i]) / h, s2 = s * s, s3 = s2 * s;
    return keys[0].slice(1).map((_, c) => { const y0 = keys[i][c + 1], y1 = keys[i + 1][c + 1]; return (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * h * m[c][i] + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * h * m[c][i + 1]; }); };
}

// ---------- where things are ----------
const W0 = { x: WIN.x, z: WIN.z };                       // the window over Bali (the opening)
const LAND_AT = P(87.35, 19.6);                          // where the island comes to rest, off the Mahanadi's mouth
const BALI_C = [W0.x, W0.z];
function islandAt(u) {   // u: 0 at Bali .. 1 arrived off Odisha (following the sea lane backwards)
  const a = A.laneAt(1 - u).p, o0 = [BALI_C[0] - A.laneAt(1).p[0], BALI_C[1] - A.laneAt(1).p[1]], o1 = [LAND_AT[0] - A.laneAt(0).p[0], LAND_AT[1] - A.laneAt(0).p[1]], k = ss(seg(u, .55, 1));
  return [a[0] + lerp(o0[0], o1[0], k), a[1] + lerp(o0[1], o1[1], k)];
}
const BOITA0 = (() => { const p = A.laneAt(.03).p; return [p[0] + .1, p[1] + .1]; })();
let COAST, POLY = {};
export function initFilm(coast) {
  COAST = coast; A.initArt(coast);
  const area = r => { let s = 0; for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s / 2); };
  const inside = (r, [x, z]) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  for (const [k, p] of Object.entries({ bali: [W0.x, W0.z], java: A.ISLES.java, sumatra: A.ISLES.sumatra })) POLY[k] = coast.polys.filter(r => inside(r, p)).sort((a, b) => area(b) - area(a))[0];
}

// ---------- the sand's state through the film ----------
function sandState(t) {
  const end = t > 60;
  const S = { hero: 1, morph: 0, others: 0, map: 0 };
  if (!end) { S.others = 1 - S_(t, 4.0, 5.6); S.morph = eio(seg(t, 6.35, 8.7)); S.map = S_(t, 8.4, 10.6); }
  else { S.morph = 1 - eio(seg(t, 68.2, 69.5)); S.map = 1 - S_(t, 68.0, 69.0); S.others = S_(t, 70.0, 71.4); }
  // the island's journey (window 1 travels with it)
  const u = end ? eio(seg(t, 66.0, 68.1)) : 0, c = islandAt(u);
  WIN.x = c[0]; WIN.z = c[1];
  const lift = end ? S_(t, 65.7, 66.2) : 0;
  S.marks = (d, toPx, k, g) => {
    // the island has left: its old place is open sea
    if (lift > 0 && POLY.bali) { d.save(); d.globalAlpha = lift; d.filter = 'blur(2px)'; d.fillStyle = g(SEA); d.beginPath(); POLY.bali.forEach((p, i) => { const [x, y] = toPx(p); i ? d.lineTo(x, y) : d.moveTo(x, y); }); d.closePath(); d.fill(); d.lineWidth = 8; d.strokeStyle = g(SEA); d.stroke(); d.restore(); }
    if (!end) {
      // the lane, drawn from Bali back to Odisha ("4,000 km from here")
      const lu = 1 - eio(seg(t, 10.8, 13.1)); if (t > 10.8) A.lane(d, toPx, k, g, lu, 1, 1 - S_(t, 30.6, 32.2));
      // a brighter fingertip retracing it from Odisha: they sailed there
      if (t > 15.3 && t < 19.4) { const v = eio(seg(t, 15.4, 18.9)); A.groove(d, lanePiece(Math.max(0, v - .07), v), toPx, k, g, .05, 1 - S_(t, 18.9, 19.4), 0); }
      // the islands light as they are named
      for (const [key, t0] of [['bali', 19.0], ['java', 19.75], ['sumatra', 20.5]]) { const a = S_(t, t0, t0 + .35) * (1 - S_(t, 22.0, 23.0)); if (a > 0 && POLY[key]) { d.save(); d.globalAlpha = a; d.filter = 'blur(2px)'; d.fillStyle = g(.04); d.beginPath(); POLY[key].forEach((p, i) => { const [x, y] = toPx(p); i ? d.lineTo(x, y) : d.moveTo(x, y); }); d.closePath(); d.fill(); d.restore(); } }
      // no engine, no GPS: drawn beside the boita, then swept away by the palm
      const gc = [BOITA0[0] + .46, BOITA0[1] - .2], pc = [BOITA0[0] + .78, BOITA0[1] - .2];
      A.gear(d, toPx, k, g, gc, .12, seg(t, 21.85, 22.45)); A.wipe(d, toPx, k, g, gc[0] - .25, gc[0] + .25, gc[1] - .25, gc[1] + .25, eio(seg(t, 22.55, 22.95)));
      A.pin(d, toPx, k, g, pc, .11, seg(t, 23.05, 23.6)); A.wipe(d, toPx, k, g, pc[0] - .22, pc[0] + .24, pc[1] - .26, pc[1] + .26, eio(seg(t, 23.7, 24.1)));
      // only the wind: raked streamlines, turning in Kartika
      const wa = S_(t, 24.3, 25.2) * (1 - S_(t, 31.0, 33.2)); const th = lerp(-1.05, 1.1, eio(seg(t, 26.3, 28.4)));
      A.wind(d, toPx, k, g, th, t * 1.6, wa);
      // the boita: drawn at the harbour, waits, then is carried out
      const ba = S_(t, 13.9, 14.9); if (ba > 0) { const bu = .03 + .27 * ei(seg(t, 28.5, 36.0)) * 1.0, bp = bu <= .03 ? BOITA0 : (() => { const q = A.laneAt(bu).p; return [q[0] + .1, q[1] + .1]; })();
        A.sandBoita(d, toPx, k, g, bp, .5, 1, S_(t, 27.7, 28.7), ba, t); }
      // the Kartika moon, waxing over the Bay while they wait
      A.sandMoon(d, toPx, k, g, eio(seg(t, 31.2, 35.7)), S_(t, 31.1, 31.6));
    } else {
      A.lane(d, toPx, k, g, 0, 1, S_(t, 61.8, 63.4) * (1 - S_(t, 67.6, 68.6)));
      A.sandMoon(d, toPx, k, g, 1, 1 - S_(t, 61.6, 63.0));
      if (t > 63.6 && t < 66.2) { const v = eio(seg(t, 63.7, 65.6)); A.groove(d, lanePiece(Math.max(0, v - .08), v), toPx, k, g, .05, 1 - S_(t, 65.6, 66.2), 0); }
    }
  };
  return S;
}
function lanePiece(u0, u1) { const o = []; for (let i = 0; i <= 24; i++) o.push(A.laneAt(lerp(u0, u1, i / 24)).p); return o; }

// ---------- cameras ----------
// sand cameras: A (relative to the window) at the two ends, B (top-down: x, z, height) in between
const camA0 = rig([[0, .05, .16, .98, 0, 0, .02, 38], [2.9, .02, .3, .5, 0, 0, 0, 40], [4.4, 0, .58, .07, 0, 0, 0, 34], [5.7, 0, .62, .002, 0, 0, 0, 30]]);
const MC = A.MOON_C;
const camB = rig([
  [5.7, W0.x, W0.z, .62], [6.4, W0.x, W0.z, .62], [8.6, W0.x, W0.z, .95], [10.5, W0.x - .25, W0.z - .25, 3.0], [13.2, .1, .35, 24.6], [17.5, .08, .33, 24.2], [21.3, .05, .3, 23.8],
  [22.5, BOITA0[0] + .5, BOITA0[1] - .1, 4.6], [24.0, BOITA0[0] + .54, BOITA0[1] - .1, 4.3], [25.9, -1.6, -1.55, 9.6], [30.8, -1.55, -1.4, 10], [33.2, -1.95, -1.25, 7.4], [35.85, MC[0], MC[1], 2.3], [36.45, MC[0], MC[1], .52]]);
const camB2 = rig([[60.8, MC[0], MC[1], 1.9], [61.7, MC[0], MC[1], 3.0], [63.5, .1, .35, 24.6], [65.9, .08, .3, 24.0], [67.9, LAND_AT[0], LAND_AT[1], 3.8], [68.8, LAND_AT[0], LAND_AT[1], 1.1], [69.9, LAND_AT[0], LAND_AT[1], .62]]);
const camA1 = rig([[69.9, 0, .62, .002, 0, 0, 0, 30], [71.1, 0, .58, .07, 0, 0, 0, 34], [72.4, .02, .3, .5, 0, 0, 0, 40], [DUR, .05, .16, .98, 0, 0, .02, 38]]);
function sandCam(t, cam) {
  const up = new THREE.Vector3();
  if (t < 5.7 || t >= 69.9) { const v = t < 5.7 ? camA0(t) : camA1(t); cam.position.set(WIN.x + v[0], v[1], WIN.z + v[2]); const tg = new THREE.Vector3(WIN.x + v[3], v[4], WIN.z + v[5]); cam.fov = v[6];
    const dir = tg.clone().sub(cam.position).normalize(), pitch = Math.max(0, -dir.y); up.set(0, 1 - pitch, -pitch).normalize(); cam.up.copy(up); cam.lookAt(tg); return; }
  const v = t < 40 ? camB(t) : camB2(t);
  if (t > 66 && t < 67.9) { const w = ss(seg(t, 66, 67.9)); v[0] = lerp(v[0], WIN.x, w * (1 - seg(t, 67.4, 67.9))); v[1] = lerp(v[1], WIN.z, w * (1 - seg(t, 67.4, 67.9))); }
  cam.fov = 30; cam.position.set(v[0], v[2], v[1] + .0004); cam.up.set(0, 0, -1); cam.lookAt(v[0], 0, v[1]);
}

// night world positions
const FX = 170, FZ = -40, HUB = new THREE.Vector3(FX + 18, 18.5, FZ - 30), FOODZ = FZ + 34, FOODX = FX - 26;
const camC = rig([
  // [t, px, py, pz, tx, ty, tz, fov, focus, aperture]
  [36.45, 0, 3.4, 30, 0, 3.4 + 137, 30 - 686, 3.4, 600, 0], [37.4, 0, 3.4, 30, 0, 90, -400, 9, 600, 0], [39.3, 0, 3.0, 26, 0, 6, -90, 32, 120, 0], [42.3, 0, 2.2, 18, 0, 4, -90, 34, 130, 0],
  [44.6, 0, .5, 8, 0, .25, -60, 36, 2.8, 2.2], [47.4, 0, .8, 6.4, 0, .1, -40, 40, 3.5, 2.5], [49.3, 2, 2.4, 2, 6, .2, -40, 44, 10, 6],
  [51.6, 40, 24, 10, FX - 10, 8, FZ - 10, 42, 90, 3], [53.6, FX - 46, 4.2, FZ + 32, FX + 20, 14, FZ - 20, 44, 40, 3], [55.4, FX - 41, 4.0, FZ + 27, FX + 20, 14, FZ - 20, 44, 40, 3]]);
// the food counters: a slow glide, fair lights in bokeh behind
const camFood = rig([[54.5, FOODX - 2.6, 2.75, FOODZ + 3.5, FOODX - 2.3, 1.35, FOODZ - .3, 40, 3.6, 22], [58.4, FOODX + 9.0, 2.75, FOODZ + 3.5, FOODX + 9.3, 1.35, FOODZ - .3, 40, 3.6, 22]]);
// the Ramdoli and the moon, then the push into the moon
const camWheel = rig([[57.4, FX - 7, 5.4, FZ + 30, FX + 2, HUB.y + 4, HUB.z, 50, 60, 2], [59.3, FX - 4, 5, FZ + 26, FX + 4, HUB.y + 6, HUB.z, 50, 60, 2],
  [60.25, FX - 6, 6, FZ + 22, HUB.x, HUB.y + 60, HUB.z - 220, 18, 400, 0], [60.8, FX - 6, 6, FZ + 22, HUB.x, HUB.y + 60, HUB.z - 220, 3.2, 600, 0]]);
const DIS1 = [54.6, 55.4], DIS2 = [57.5, 58.3];
// the moon must sit exactly where the camera aims at the two bridges: aim along MOON_DIR there
const AIM = new THREE.Vector3(), cam2 = new THREE.PerspectiveCamera(40, 1080 / 1920, .05, 3000);
function nightCam(t, cam, R_ = camC) {
  const v = R_(t); cam.position.set(v[0], v[1], v[2]); AIM.set(v[3], v[4], v[5]);
  const md = N.MOON_DIR, wIn = 1 - ss(seg(t, 36.45, 38.2)), wOut = ss(seg(t, 59.4, 60.4));
  const d = AIM.clone().sub(cam.position).normalize(), w = Math.max(wIn, wOut); d.lerp(md, w).normalize(); AIM.copy(cam.position).addScaledVector(d, 100);
  cam.up.set(0, 1, 0); cam.lookAt(AIM); cam.fov = v[6];
  // rack-focus bridges: the frame melts into bokeh while the camera travels, then focus pulls onto the next subject
  const D = Math.max(S_(t, 54.3, 54.85) * (1 - S_(t, 55.15, 55.8)), S_(t, 57.3, 57.8) * (1 - S_(t, 58.0, 58.7)));
  return { focus: lerp(v[7], .25, D), ap: lerp(v[8], 70, D), maxR: lerp(26, 46, D) };
}

// ---------- captions ----------
const CAP = [
  // t0, t1, lines [[text, style]], x, y, align, look
  [0.35, 3.25, [['The sand beneath your feet', 'it'], ['at Bali Jatra…', 'it']], 540, 600, 'center', 'night'],
  [3.65, 5.9, [['…is not where', 'it'], ['the name comes from.', 'it']], 540, 520, 'center', 'night'],
  [6.45, 8.5, [['It comes from an island —', 'it']], 540, 400, 'center', 'box'],
  [8.85, 10.7, [['BALI', 'title'], ['INDONESIA', 'small']], 540, 360, 'center', 'box'],
  [13.8, 18.7, [['A thousand years ago,', 'it'], ['the sadhabas of Kalinga', 'it'], ['set sail for it.', 'it']], 90, 1200, 'left', 'box'],
  [21.85, 22.75, [['No engine.', 'it']], 540, 360, 'center', 'box'],
  [23.1, 24.2, [['No GPS.', 'it']], 540, 360, 'center', 'box'],
  [24.45, 26.1, [['Only the wind.', 'it']], 540, 340, 'center', 'box'],
  [26.35, 30.9, [['In Kartika, the wind turns —', 'it'], ['and carries the boita out to sea.', 'it']], 540, 330, 'center', 'box'],
  [31.35, 35.5, [['They did not fight the wind.', 'it'], ['They waited for it.', 'it']], 540, 300, 'center', 'box'],
  [38.0, 39.6, [['Kartika Purnima —', 'it'], ['the day they sailed.', 'it']], 540, 740, 'center', 'night'],
  [39.85, 42.6, [['BALI JATRA', 'title'], ['ବାଲିଯାତ୍ରା', 'odia']], 540, 640, 'center', 'night'],
  [43.0, 47.5, [['Today, on the same night,', 'it'], ['little boats of light set out…', 'it']], 540, 560, 'center', 'night'],
  [47.8, 49.4, [['…in memory of the voyage.', 'it']], 540, 560, 'center', 'night'],
  [49.8, 52.4, [['CUTTACK', 'small'], ['on the banks of the Mahanadi', 'it']], 540, 380, 'center', 'night'],
  [58.3, 60.4, [['This year,', 'it'], ['for the second year running,', 'it']], 540, 330, 'center', 'night'],
  [61.6, 63.8, [['INDONESIA', 'title2'], ['partner country of Bali Jatra', 'it']], 540, 1180, 'center', 'box'],
  [63.8, 65.8, [['The island our boitas sailed to…', 'it']], 90, 1220, 'left', 'box'],
  [66.0, 68.1, [['…now sails to Cuttack.', 'it']], 90, 1220, 'left', 'box'],
  [68.4, 70.7, [['This time, when you see', 'it'], ['the sand beneath your feet…', 'it']], 540, 520, 'center', 'night'],
  [71.05, 73.55, [['…remember the Bali', 'it'], ['across the sea.', 'it']], 540, 600, 'center', 'night'],
];
const STY = { it: ['italic 500 60px "CormorantG"', 74, 0], title: ['500 112px "Cinzel"', 124, 18], title2: ['500 84px "Cinzel"', 100, 12], small: ['500 38px "Cinzel"', 60, 12], odia: ['600 64px "OdiaSerif"', 80, 0] };
function caption(c, t, [t0, t1, lines, x, y, al, look]) {
  const a = S_(t, t0, t0 + .45) * (1 - S_(t, t1 - .4, t1)); if (a <= 0) return;
  const rise = (1 - eo(seg(t, t0, t0 + .9))) * 14;
  c.save(); c.globalAlpha = a; c.textAlign = al; c.textBaseline = 'alphabetic';
  let yy = y + rise;
  for (const [txt, st] of lines) { const [font, lh, sp] = STY[st]; c.font = font; c.letterSpacing = sp + 'px';
    c.shadowColor = look === 'box' ? 'rgba(20,6,0,.9)' : 'rgba(0,0,0,.92)'; c.shadowBlur = 26;
    c.fillStyle = look === 'box' ? '#fff1d6' : '#fbefd9'; c.fillText(txt, x, yy); c.shadowBlur = 0; c.fillText(txt, x, yy); yy += lh; }
  c.restore();
}
function counter(c, t, t0, t1, x, y, val, fmt, label, a0 = 1) {
  const a = S_(t, t0, t0 + .4) * (1 - S_(t, t1 - .35, t1)) * a0; if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.shadowColor = 'rgba(0,0,0,.85)'; c.shadowBlur = 24; c.fillStyle = '#fff1d6';
  c.font = '500 96px "Cinzel"'; c.letterSpacing = '4px'; c.fillText(fmt(val), x, y); c.font = 'italic 500 50px "CormorantG"'; c.letterSpacing = '0px'; c.fillText(label, x, y + 66); c.restore();
}
function label(c, t, t0, t1, cam, p, txt, dx = 0, dy = 0) {
  const a = S_(t, t0, t0 + .35) * (1 - S_(t, t1 - .3, t1)); if (a <= 0) return;
  const v = new THREE.Vector3(p[0], 0, p[1]).project(cam), x = (v.x * .5 + .5) * 1080 + dx, y = (-v.y * .5 + .5) * 1920 + dy;
  c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.font = '500 40px "Cinzel"'; c.letterSpacing = '8px'; c.shadowColor = 'rgba(20,6,0,.9)'; c.shadowBlur = 16; c.fillStyle = '#fff1d6'; c.fillText(txt, x, y); c.restore();
}

// the sea's swell, as the water shader computes it (things ride on it)
function wave(x, z, t, calm) { const a = 1 - calm; return a * (.35 * Math.sin(x * .12 + z * .05 + t * .9) + .22 * Math.sin(-x * .07 + z * .16 + t * 1.3) + .12 * Math.sin(x * .25 + z * .21 + t * 1.9)); }
// ---------- the night world's state ----------
export function nightState(t, W_) {
  const { boita, dboats, ramdoli, crowd, food, fair, bank } = W_;
  // the boita sails off toward the moon, and becomes a boat of light
  const bz = -70 - 9 * (t - 36.45) - 3.2 * Math.max(0, t - 41.5) ** 2;
  boita.position.set(-4 + .9 * (t - 36.45), -.55 + wave(-4 + .9 * (t - 36.45), bz, t, 0) * .8, bz); boita.rotation.y = Math.PI / 2 + .55; N.billow(boita, 1, t);
  const calm = S_(t, 42.4, 44.6);
  const bf = 1 - S_(t, 44.6, 45.6); boita.visible = bf > 0.01;
  boita.traverse(o => { if (o.material && o.material.opacity !== undefined) { o.material.transparent = true; o.material.opacity = bf * (o.userData.op ?? 1); } });
  // boats of light: the hero drifts into the boita's place; then the river lights up outward
  dboats.forEach((b, i) => { const r = b.userData.r; const on = i === 0 ? S_(t, 44.4, 45.4) : S_(t, 45.2 + r * 2.6, 45.7 + r * 2.6);
    b.visible = on > 0.01 && t < 60.8; if (!b.visible) return;
    if (i === 0) { b.position.set(.1 + .05 * Math.sin(t * .7), 0, 5.4 - (t - 44) * .12); b.rotation.y = Math.PI / 2 + .5; }
    else { b.position.z = b.userData.z0 - (t - 44) * .12 * (1 + b.userData.r); }
    b.position.y = wave(b.position.x, b.position.z, t, calm) + Math.sin(t * 1.3 + i) * .008;
    N.flicker(b, t, on); });
  bank.position.y = lerp(-7, -.65, S_(t, 43.5, 46.5)); bank.visible = t > 43.4; fair.visible = t > 44;
  N.spinRamdoli(ramdoli, t); animateFood(t); N.moveCrowd(crowd, t, lerp(.08, 1, eo(seg(t, 52.8, 55.2))) * (t < 52.8 ? 1 / .08 * .08 : 1));
  return { calm };
}
// ---------- the frame ----------
export function frame(t, G) {
  const { renderer, sandScene, nightScene, cam, U, cap, post, fairLights, placeBokeh, W_ } = G;
  const c = cap.getContext('2d'); c.clearRect(0, 0, 1080, 1920);
  const night = t >= 36.45 && t < 60.8;
  let white = 0;
  if (!night) {
    const S = sandState(t); paintSand(S); syncWin();
    // the light: from above (the fair) or from below (the lightbox)
    const top = t < 30 ? 1 - S_(t, 5.55, 6.35) : S_(t, 69.45, 70.35), back = t < 30 ? S_(t, 5.6, 6.5) : 1 - S_(t, 69.5, 70.4);
    U.topW.value = top; U.backW.value = back; U.ripple.value = top; fairLights(top); placeBokeh(t, top);
    U.backO.value.set(WIN.x, WIN.z); U.backR.value = t < 30 ? lerp(.02, 30, ei(seg(t, 5.6, 9.5))) : 30; U.backF.value = t < 30 ? lerp(.12, 3, seg(t, 5.6, 9.5)) : 3;
    sandCam(t, cam); cam.aspect = 1080 / 1920; cam.updateProjectionMatrix(); U.camP.value.copy(cam.position); U.time.value = t;
    // into / out of the moon: the lightbox's open disc burns to white
    white = t < 40 ? S_(t, 35.95, 36.45) : .55 * (1 - S_(t, 60.8, 61.1));
    U.exposure.value = 1 + 2.5 * white;
    renderer.toneMapping = THREE.NoToneMapping; renderer.setRenderTarget(null); renderer.render(sandScene, cam);
    if (white > 0) { c.fillStyle = `rgba(255,246,228,${white * .85})`; c.fillRect(0, 0, 1080, 1920); }
    // words on the sand
    if (t > 10.7 && t < 13.7) counter(c, t, 10.95, 13.5, 360, 1250, Math.round(4000 * eio(seg(t, 10.9, 13.1)) / 10) * 10, v => v.toLocaleString('en-IN') + (t > 13.1 ? '+' : ''), 'kilometres away');
    label(c, t, 19.0, 21.4, cam, A.ISLES.bali, 'BALI', 0, 80); label(c, t, 19.75, 21.4, cam, A.ISLES.java, 'JAVA', -40, 70); label(c, t, 20.5, 21.4, cam, A.ISLES.sumatra, 'SUMATRA', -60, 0);
    label(c, t, 13.9, 15.2, cam, A.PL.odisha, 'KALINGA', -10, -40);
    label(c, t, 66.4, 68.2, cam, A.PL.cuttack, 'CUTTACK', 40, -50);
  } else {
    const st = nightState(t, W_);
    // which shot(s): the lane, the food glide, the wheel; dissolves between them under the defocus
    const shotA = t < DIS1[1] ? camC : t < DIS2[1] ? camFood : camWheel, shotB = t >= DIS1[0] && t < DIS1[1] ? camFood : t >= DIS2[0] && t < DIS2[1] ? camWheel : null;
    const kB = shotB ? ss(seg(t, ...(t < DIS1[1] ? DIS1 : DIS2))) : 0;
    const o = nightCam(t, cam, shotA); cam.aspect = 1080 / 1920; cam.near = .05; cam.far = 3000; cam.updateProjectionMatrix();
    let o2 = null; if (shotB) { o2 = nightCam(t, cam2, shotB); cam2.aspect = 1080 / 1920; cam2.near = .05; cam2.far = 3000; cam2.updateProjectionMatrix(); }
    N.placeMoon(cam, 40, 700); N.setWater(cam, t, st.calm); N.setStars(cam.fov); nightScene.children[0].position.copy(cam.position);
    { const q = new URLSearchParams(location.search); if (q.get('hide')) for (const nm of q.get('hide').split(',')) { const o = { sky: nightScene.children[0], halo: nightScene.children[1], moon: nightScene.children[2], water: N.water }[nm]; if (o) o.visible = false; } }
    white = (1 - S_(t, 36.45, 37.0)) + .6 * S_(t, 60.35, 60.8);
    renderer.toneMapping = THREE.NoToneMapping;
    const PO = { bloom: .55, th: 1.3, expo: 1.05 + 1.5 * white, vig: .4, white: white * .8, time: t };
    if (shotB) G.blend(nightScene, cam, { ...PO, focus: o.focus, ap: o.ap, maxR: o.maxR }, cam2, { ...PO, focus: o2.focus, ap: o2.ap, maxR: o2.maxR }, kB);
    else post(nightScene, cam, { focus: o.focus, ap: o.ap, maxR: o.maxR, bloom: +(new URLSearchParams(location.search).get("bl") ?? .55), th: 1.3, expo: 1.05 + 1.5 * white, vig: .4, white: white * .8, time: t });
    if (t > 52.7 && t < 55.4) counter(c, t, 52.8, 55.35, 540, 400, Math.round(6500000 * eo(seg(t, 52.8, 54.9)) / 1000) * 1000, v => v.toLocaleString('en-IN'), 'came last year');
    // the food counters: names as the camera passes each
    const fc = (shotA === camFood) ? cam : cam2;
    FOODS.forEach((F, i) => { const x = FOODX + F.x, v = new THREE.Vector3(x, 2.75, FOODZ + .8).project(fc), sx = (v.x * .5 + .5) * 1080;
      const a = (t > 55.0 && t < 58.2 && v.z < 1) ? clamp(1 - Math.abs(sx - 540) / 520) * S_(t, 55.5, 55.9) * (1 - S_(t, 57.5, 57.85)) : 0; if (a <= 0) return;
      c.save(); c.globalAlpha = ss(a) * (1 - S_(t, 57.8, 58.2)); c.textAlign = 'center'; c.shadowColor = 'rgba(0,0,0,.85)'; c.shadowBlur = 20; c.fillStyle = '#fff1d6';
      const lx = clamp(sx, 330, 750); c.font = '600 64px "OdiaSerif"'; c.fillText(F.odia, lx, 520); c.font = '500 36px "Cinzel"'; c.letterSpacing = '8px'; c.fillText(F.en, lx, 580); c.restore(); });
  }
  for (const k of CAP) caption(c, t, k);
}
