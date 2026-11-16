// PANCHUKA — the film. 55.5 s, 1080×1920, 30 fps, locked to the user's voiceover (see VOICEOVER_MAP.md).
// Four media, matched transitions (never a plain cut or fade between styles), one caption system.
import { initInk, inkWorld } from './sc_ink.js';
import { initLeaf, drawBoard, leafS3, leafS4, leafS6a, leafS6b, S4MARKS, S6MARKS, DVADASHI_BAND } from './sc_leaf.js';
import { initGold, goldBG, goldS5, goldS7, goldDisc, flakes, MED } from './sc_gold.js';
import { initLamp, lampS8, lampScreen, LIT0 } from './sc_lamp.js';

export const W = 1080, H = 1920, DUR = 55.5;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a)), ss = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }, eo = x => 1 - Math.pow(1 - clamp(x), 3), ei = x => Math.pow(clamp(x), 3);
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
let OA, OB;
export function initFilm(fibre, pulp) { initInk(); initLeaf(); initGold(); initLamp(fibre, pulp); OA = mk(); OB = mk(); }
function fill(c, col, a) { if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = clamp(a); c.fillStyle = col; c.fillRect(0, 0, W, H); c.restore(); }
function glowAt(c, x, y, r, a, col = '255,214,150') { if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); }
function off(cv) { const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.clearRect(0, 0, W, H); return c; }

// ================= the ink world over time (S1 · tilt · S2 · S9 · the loop) =================
function inkState(t) {
  if (t < 30) {   // S1 → S2
    const tilt = eio(seg(t, 3.85, 4.9));
    return {
      cam: { cx: 540, cy: lerp(960, -260, tilt), z: 1 },
      title: ss(seg(t, .35, 1.2)) * (1 - seg(t, 3.45, 3.9)), seal: ss(seg(t, .75, 1.3)) * (1 - seg(t, 3.45, 3.9)),
      branch: 1 - seg(t, 3.9, 4.5), bank: 1, river: 1, reeds: 1, refl: 1,
      heron: { x: 640, y: 1292, s: 1, look: ss(seg(t, 2.75, 3.45)), glance: 0, a: 1 },
      fish: { x: 760 - 150 * Math.min(t, 4), y: 1322, a: 1 - seg(t, 3.3, 3.9) },
      moons: [0, 1, 2, 3, 4].map(i => ({ p: seg(t, 4.55 + i * .34, 5.25 + i * .34), lit: [.86, .92, .96, .99, 1][i], gone: i === 1 ? seg(t, 7.98, 8.75) : 0 })),
      five: seg(t, 6.6, 7.1), arrow: seg(t, 7.9, 8.1), mseal: seg(t, 8.0, 8.25),
    };
  }
  // S9 → the loop back to S1(0)
  const back = ss(seg(t, 54.75, 55.05));
  return {
    cam: { cx: 540, cy: 960, z: 1 }, sun: ss(seg(t, 50.6, 51.6)) * (1 - seg(t, 54.55, 55.25)),
    diyas: ss(seg(t, 50.6, 51.4)) * (1 - seg(t, 54.6, 55.3)), diyaDx: (t - 50.5) * 10 + 90 * Math.pow(seg(t, 54.55, 55.3), 2),
    branch: 1, bank: 1, river: 1, reeds: 1, refl: 1,
    heron: { x: 640, y: 1292, s: 1, look: 1 - ss(seg(t, 54.95, 55.35)), glance: ss(seg(t, 53.0, 53.3)) * (1 - back), a: 1 },
    fish: { x: 760, y: 1322, a: ss(seg(t, 54.95, 55.4)) },
  };
}
const inkAt = (c, t) => inkWorld(c, t, inkState(t));

// ================= captions: one system =================
const CAP = [
  // ink: dark ink with a paper halo
  { t: [1.15, 3.85], txt: 'For five days,', x: 470, y: 1408, k: 'ink' }, { t: [1.95, 3.85], txt: 'even the heron spares the fish.', x: 470, y: 1462, k: 'ink' },
  { t: [4.62, 8.7], txt: 'But this year, not five days.', x: 510, y: 1392, k: 'ink' }, { t: [7.98, 8.7], txt: 'Four.', x: 510, y: 1452, k: 'ink' },
  // palm leaf: ivory on silk
  { t: [9.55, 14.4], txt: 'Panchuka: Kartika’s last five days,', x: 510, y: 1395, k: 'leaf' }, { t: [12.65, 14.4], txt: 'from Bada Ekadashi to Purnima.', x: 510, y: 1455, k: 'leaf' },
  { t: [15.0, 19.35], txt: 'Missed the month-long vow?', x: 510, y: 1395, k: 'leaf' }, { t: [17.55, 19.35], txt: 'These few days, no fish, no meat.', x: 510, y: 1455, k: 'leaf' },
  { t: [31.0, 33.8], txt: 'This year, Dvadashi', x: 510, y: 1395, k: 'leaf' }, { t: [32.1, 33.8], txt: 'is missing from the panji.', x: 510, y: 1455, k: 'leaf' },
  { t: [34.3, 38.6], txt: 'A tithi that meets no sunrise', x: 510, y: 1395, k: 'leaf' }, { t: [37.3, 38.6], txt: 'is not counted.', x: 510, y: 1455, k: 'leaf' },
  // gold: beneath the plaques, one line at a time
  { t: [39.85, 41.15], txt: 'So Dvadashi’s Bankachuda besha…', x: 510, y: 1450, k: 'gold' }, { t: [41.25, 42.4], txt: '…will not take place this year.', x: 510, y: 1450, k: 'gold' },
  // the lamp-tree: left-aligned in the night sky beside the pillar
  { t: [43.1, 44.6], txt: ['Missed the', 'whole month?'], x: 72, y: 380, k: 'night' }, { t: [44.75, 46.6], txt: ['The last few days', 'are enough.'], x: 72, y: 380, k: 'night' },
  { t: [46.95, 48.7], txt: ['It’s never too late', 'to begin.'], x: 72, y: 380, k: 'night' }, { t: [48.85, 50.15], txt: ['Only time', 'grows short.'], x: 72, y: 380, k: 'night' },
  // ink again
  { t: [50.85, 54.6], txt: 'If the heron can keep five days,', x: 470, y: 1408, k: 'ink' }, { t: [53.0, 54.6], txt: 'can’t we keep four?', x: 470, y: 1462, k: 'ink' },
];
const STY = {
  ink: { font: 'italic 500 50px "CormorantG"', fill: '#2b2420', halo: 'rgba(244,238,224,.95)', blur: 16 },
  leaf: { font: 'italic 500 50px "CormorantG"', fill: '#f4e6c8', halo: 'rgba(30,6,4,.75)', blur: 14 },
  gold: { font: 'italic 500 50px "CormorantG"', fill: '#f0dcaa', halo: 'rgba(0,0,0,.85)', blur: 14 },
  night: { font: 'italic 500 48px "CormorantG"', fill: '#f4e8cc', halo: 'rgba(10,8,30,.85)', blur: 14, align: 'left', lh: 58 },
};
function captions(c, t) {
  if (globalThis.NOCAP) return;   // ?nocap=1, for the cover still
  for (const k of CAP) { const [a, b] = k.t; if (t < a - .01 || t > b + .01) continue;
    const fi = seg(t, a, a + .5), fo = 1 - seg(t, b - .4, b), al = ss(fi) * ss(fo); if (al <= 0) continue;
    const s = STY[k.k], lines = Array.isArray(k.txt) ? k.txt : [k.txt], dy = (1 - eo(fi)) * 10;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = al; c.font = s.font; c.textAlign = s.align || 'center'; c.textBaseline = 'alphabetic';
    lines.forEach((l, i) => { const y = k.y + dy + i * (s.lh || 60); c.shadowColor = s.halo; c.shadowBlur = s.blur; c.fillStyle = s.fill; c.fillText(l, k.x, y); c.shadowBlur = s.blur * .5; c.fillText(l, k.x, y); });
    c.restore(); }
}

// ================= the leaf / gold bands of the film =================
const LEAVES3 = [[360, 150], [560, 170], [780, 250], [1080, 200]];
function paperToLeaves(c, t) {   // T23: the rice paper splits into four strips that narrow into the palm leaves; the ink fades into incision
  drawBoard(c); leafS3(c, t);
  const k = eio(seg(t, 8.75, 9.45)), fade = ss(seg(t, 9.15, 9.75)); if (fade >= 1) return;
  const o = off(OA); inkAt(o, t);
  const bounds = [0, 535, 755, 1055, 1920];
  c.save(); c.beginPath();
  LEAVES3.forEach(([y, h], i) => { const x0 = lerp(0, 40, k), x1 = lerp(W, 1040, k), y0 = lerp(bounds[i], y, k), y1 = lerp(bounds[i + 1], y + h, k); c.roundRect(x0, y0, x1 - x0, y1 - y0, lerp(0, h * .34, k)); });
  c.clip(); c.globalAlpha = 1 - fade; c.drawImage(OA, 0, 0); c.restore();
}
function flyDiscs(c, t, t0, from, to, r0, r1) {   // the five gold marks/medallions travelling between styles
  for (let i = 0; i < 5; i++) { const u = eio(seg(t, t0 + i * .05, t0 + i * .05 + .95)); const [ax, ay] = from(i), [bx, by] = to(i);
    const x = lerp(ax, bx, u) + Math.sin(Math.PI * u) * (i - 2) * -40, y = lerp(ay, by, u) - Math.sin(Math.PI * u) * 60; goldDisc(c, x, y, lerp(r0, r1, u), 1); }
}

// ================= the master render =================
// ================= the rostrum camera =================
// One slow camera over the finished frame (captions stay still, on top). Each scene leans toward what the voice is about; during the
// big transition moves it eases back to 1, so two motions never fight. C1-smooth (monotone cubic), z ≥ 1, and z = 1 at the loop seam.
const RIG = [   // t, z, anchor x, anchor y (the point that stays put)
  [0, 1, 640, 1150], [3.85, 1.04, 640, 1150], [4.9, 1.045, 540, 760], [8.7, 1.075, 540, 760], [9.75, 1, 540, 760],   // heron · moons and ୪
  [14.25, 1.04, 660, 860], [14.75, 1, 540, 880], [19.3, 1.04, 540, 900], [20.6, 1, 540, 760],                    // the five gold marks · the plate
  [30.1, 1.035, 540, 760], [31.1, 1, 640, 875], [33.7, 1.035, 640, 875], [34.2, 1, 432, 800],                       // the beshas · Dvadashi
  [38.6, 1.045, 432, 800], [39.12, 1.045, 432, 800], [39.8, 1, 540, 760], [42.9, 1, 540, 760], [45.6, 1, 510, 600],  // into the band
  [50.0, 1.035, 510, 600], [50.55, 1.03, 640, 1150], [55.5, 1, 640, 1150],                                          // the lit diya · dawn
];
function mono(ts, ys) {   // Fritsch–Carlson monotone cubic: no overshoot, continuous velocity
  const n = ts.length, d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (ts[i + 1] - ts[i]));
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : 3 * (ts[i + 1] - ts[i - 1]) / ((2 * ts[i + 1] - ts[i] - ts[i - 1]) / d[i - 1] + (ts[i + 1] + ts[i] - 2 * ts[i - 1]) / d[i]);
  m[0] = 0; m[n - 1] = 0;
  return t => { if (t <= ts[0]) return ys[0]; if (t >= ts[n - 1]) return ys[n - 1]; let i = 0; while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i], u = (t - ts[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1]; };
}
const RZ = mono(RIG.map(k => k[0]), RIG.map(k => k[1])), RX = mono(RIG.map(k => k[0]), RIG.map(k => k[2])), RY = mono(RIG.map(k => k[0]), RIG.map(k => k[3]));
export const rig = t => ({ z: Math.max(1, RZ(t)), ax: RX(t), ay: RY(t) });
// The fast moves (paper → leaves, the two scrolls, the discs flying down, the dive and the zoom out, the bloom) get a film camera's
// motion blur: each frame is the mean of n renders spread over a 144° shutter, so a 100 px/frame scroll glides instead of stepping.
export const BLUR = [[264, 293, 8], [430, 450, 20], [904, 953, 12], [1012, 1031, 20], [1158, 1170, 20], [1170, 1196, 36]].map(([a, b, n]) => [a / 30, b / 30, n]);   // frame-aligned
const SHUTTER = .4 / 30;
const SCROLL = 1700;   // the page travel: the incoming page starts wholly below the frame (cords included), so nothing pops in
let FR, TMP;
function compose(c, t) {   // the scene through the rostrum camera, onto c (opaque, full frame)
  const o = off(FR); scene(o, t);
  const { z, ax, ay } = rig(t);
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  if (z > 1.0005) { c.setTransform(z, 0, 0, z, ax * (1 - z), ay * (1 - z)); c.drawImage(FR, 0, 0); c.setTransform(1, 0, 0, 1, 0, 0); }
  else c.drawImage(FR, 0, 0);
}
export function film(ctx, t) {
  if (t >= DUR - 1 / 30 - 1e-6) t = 0;                                              // the last frame is the first: the reel loops
  if (!FR) { FR = mk(); TMP = mk(); }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  const b = BLUR.find(([a, e]) => t >= a - 1e-4 && t < e - 1e-4);
  if (!b) compose(ctx, t);
  else {
    const n = b[2], tc = TMP.getContext('2d');
    for (let k = 0; k < n; k++) {   // running mean: sample k goes on at alpha 1/(k+1)
      compose(tc, t + (k / (n - 1) - .5) * SHUTTER);
      ctx.globalAlpha = 1 / (k + 1); ctx.drawImage(TMP, 0, 0);
    }
    ctx.globalAlpha = 1;
  }
  captions(ctx, t);
}
function scene(ctx, t) {
  if (t < 8.75) inkAt(ctx, t);                                                      // S1 · tilt · S2
  else if (t < 9.75) paperToLeaves(ctx, t);                                         // T23 ink → palm leaf
  else if (t < 14.35) { drawBoard(ctx); leafS3(ctx, t); }                           // S3
  else if (t < 15.0) { const e = eio(seg(t, 14.35, 15.0)); drawBoard(ctx); leafS3(ctx, t, { dy: -SCROLL * e }); leafS4(ctx, t, { dy: SCROLL * (1 - e) }); }   // scroll
  else if (t < 19.35) { drawBoard(ctx); leafS4(ctx, t); }                           // S4
  else if (t < 20.6) {                                                              // T45 palm leaf → gold: marks fly up and become medallions
    const kb = ss(seg(t, 19.5, 20.35)); goldBG(ctx); drawBoard(ctx, 1 - kb);
    const o = off(OA); leafS4(o, t, { noMarks: true }); ctx.save(); ctx.globalAlpha = 1 - ss(seg(t, 19.4, 20.1)); ctx.drawImage(OA, 0, 0); ctx.restore();
    flyDiscs(ctx, t, 19.42, S4MARKS, MED, 22, 86);
  }
  else if (t < 30.6) goldS5(ctx, t, { close: seg(t, 30.15, 30.6) });                // S5 (closing at the end)
  else if (t < 31.75) {                                                             // T56 gold → palm leaf: the discs fly down into the leaf as its five marks
    const kb = ss(seg(t, 30.7, 31.4)); goldBG(ctx, 1); drawBoard(ctx, kb);
    const o = off(OA); leafS6a(o, t, { marks: 0 }); ctx.save(); ctx.globalAlpha = kb; ctx.drawImage(OA, 0, 0); ctx.restore();
    flyDiscs(ctx, t, 30.6, MED, S6MARKS, 86, 22);   // from the column the close leaves them in, so no jump at 30.6
  }
  else if (t < 33.75) { drawBoard(ctx); leafS6a(ctx, t); }                          // S6a: Dvadashi crumbles
  else if (t < 34.35) { const e = eio(seg(t, 33.75, 34.35)); drawBoard(ctx); leafS6a(ctx, t, { dy: -SCROLL * e }); leafS6b(ctx, t, { dy: SCROLL * (1 - e) }); }
  else if (t < 39.12) {                                                             // S6b, then T67: dive into the vermilion Dvadashi band
    const z = lerp(1, 8, ei(seg(t, 38.6, 39.12))), [bx, by] = DVADASHI_BAND;
    ctx.save(); ctx.translate(bx, by); ctx.scale(z, z); ctx.translate(-bx, -by); drawBoard(ctx); leafS6b(ctx, t); ctx.restore();
    fill(ctx, '#7a1a1a', ss(seg(t, 38.85, 39.12)));
  }
  else if (t < 42.95) {                                                             // S7: out of the red enamel of Bankachuda's medallion
    goldS7(ctx, t, { zoom: lerp(8, 1, eio(seg(t, 39.12, 39.8))), titleA: seg(t, 39.6, 40.0) });
    fill(ctx, '#7a1a1a', 1 - ss(seg(t, 39.12, 39.42)));
    fill(ctx, '#050308', ss(seg(t, 42.35, 42.95)));
  }
  else if (t < 50.55) {                                                             // S8: the lamp-tree, out of the dark; at the end its first diya blooms into dawn
    lampS8(ctx, t); fill(ctx, '#050308', 1 - ss(seg(t, 42.95, 43.6)));
    const b = seg(t, 50.0, 50.55); if (b > 0) { const c0 = LIT0(), [x, y] = lampScreen(t, .5, c0.x, c0.y); glowAt(ctx, x + 20, y - 20, lerp(120, 1900, b * b), Math.min(1, b * 1.6)); fill(ctx, '#f3ecdc', ss(seg(t, 50.15, 50.55)) * .97); }
  }
  else { inkAt(ctx, t); fill(ctx, '#f3ecdc', .97 * (1 - ss(seg(t, 50.55, 51.2)))); }   // S9 out of the bloom, then the loop
  if (t >= 41.3 && t < 45) flakes(ctx, t, (t < 42.45) ? 1 : 0);                     // Bankachuda's gold, falling into the next scene
}
export const EV = {   // for the sound design
  fish: 2.6, heronLift: 2.9, tilt: 3.9, moons: [4.55, 4.89, 5.23, 5.57, 5.91], dissolve: 7.98, stamp: 8.05, paper: 8.75, stylus: [9.35, 12.68, 13.6, 13.95], gold5: 11.12,
  leafScroll: 14.35, fishLeap: 17.6, strike: 18.72, flyUp: 19.42, names: [23.39, 24.6, 25.7, 26.73, 29.16], close: 30.15, flyDown: 30.2, dvadashi: 31.95, crumble: 32.95,
  scroll2: 33.75, sunrises: [34.35, 34.55, 34.75], band: 35.25, touch: 36.15, row: 37.3, stampK: 37.95, dive: 38.6, glintB: 39.95, grey: 41.3, dark: 42.35, night: 42.95, ready: 44.9, ignite: 46.92, moon: 48.8, bloom: 50.0, dawn: 50.55, glance: 53.0, back: 54.75,
};
