// RADHA PADA DARSHAN — the film. 74.0 s, 1080×1920, 30 fps, locked to the user's voiceover (see VOICEOVER_MAP.md).
// Three media, one red thread: watercolour (the present) · jhoti in rice paste (the legend) · the loom (the cloth that hides and
// the cloth that reveals). Every change of medium is a move, never a cut: the thread pans us from the sanctum to the amla tree,
// a crane lifts us along it to Sakshigopal, we dive through the temple door onto the floor where the legend is drawn, push
// into the drawn ghagra until it is cloth, watch it unravel into an Odia saree, tilt down past its border to her feet, and her
// feet's light blooms back into the drawing. The last frame is the first.
import { initJhoti } from './jhoti.js';
import { initLegend, legend } from './sc_legend.js';
import { initWC, hook, amla, amlaThread, queue, queueAll, besha, thread, hookLift, hookThreadPts } from './sc_wc.js';
import { initLoom, saree, ghagra } from './loom.js';

export const W = 1080, H = 1920, DUR = 74.0;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); }, eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }, eo = x => 1 - Math.pow(1 - clamp(x), 3), ei = x => Math.pow(clamp(x), 3);
const P = (t, a, b) => ss(seg(t, a, b));
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
let OA, OB, FR, TMP;
export function initFilm(A, PL, Q) { initJhoti(A.floor, A.wcpaper); initLegend(A.floor_big); initWC(PL, Q); initLoom(A.weave); OA = mk(); OB = mk(); FR = mk(); TMP = mk(); }
function off(cv) { const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.clearRect(0, 0, W, H); return c; }
function fill(c, col, a) { if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = clamp(a); c.fillStyle = col; c.fillRect(0, 0, W, H); c.restore(); }
function glow(c, x, y, r, a, col = '255,226,180') { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); }

// ================= the loom (49.8–53.6) =================
function shuttle(c, x, y) {
  c.save(); c.translate(x, y); c.fillStyle = 'rgba(0,0,0,.35)'; c.filter = 'blur(5px)'; c.beginPath(); c.ellipse(4, 10, 92, 15, 0, 0, 7); c.fill(); c.filter = 'none';
  const g = c.createLinearGradient(0, -14, 0, 14); g.addColorStop(0, '#c58b4e'); g.addColorStop(.5, '#8a5428'); g.addColorStop(1, '#4e2c12'); c.fillStyle = g;
  c.beginPath(); c.moveTo(-96, 0); c.bezierCurveTo(-60, -16, 60, -16, 96, 0); c.bezierCurveTo(60, 16, -60, 16, -96, 0); c.fill();
  c.fillStyle = '#2a1608'; c.beginPath(); c.ellipse(0, 0, 40, 6, 0, 0, 7); c.fill(); c.fillStyle = '#c32a1a'; c.fillRect(-30, -3, 60, 6);
  c.restore();
}
function loom(c, t) {
  c.fillStyle = '#120705'; c.fillRect(0, 0, W, H);
  const z = 1.3 - .3 * eo(seg(t, 49.8, 50.9)), lift = -600 * eio(seg(t, 53.0, 53.75));
  c.save(); c.translate(540, 960); c.scale(z, z); c.translate(-540, -960 + lift);
  const fray = lerp(1240, -90, eio(seg(t, 51.05, 52.55))), fell = lerp(1290, -50, eio(seg(t, 51.35, 52.9)));
  // the saree, woven upward behind the fray: bare warp between the ghagra's frayed edge and the fell
  if (t > 51.0) {
    c.save(); c.strokeStyle = 'rgba(236,224,200,.8)'; c.lineWidth = 1.3; for (let x = 2; x < W; x += 5) { c.beginPath(); c.moveTo(x, Math.max(-60, Math.min(fray, fell))); c.lineTo(x, fell); c.stroke(); } c.restore();
    saree(c, 0, W, Math.max(-50, fell), 1290, { upto: 1290, bandTop: 1080, s: 1.35 });
    c.save(); c.fillStyle = 'rgba(20,6,3,.45)'; c.fillRect(0, fell - 2, W, 4); c.restore();
    const sx = 540 + Math.sin(t * 7.5) * 470; if (fell > -40 && fell < 1290) shuttle(c, sx, fell - 18);
  }
  ghagra(c, -40, 1120, -60, 1240, { fray: Math.min(1240, fray), drift: 30 * seg(t, 51.1, 52.6) });
  c.restore();
  // the threads falling from the frayed edge settle into the warp: soft light from above
  glow(c, 540, 200, 900, .12);
  const g = c.createRadialGradient(540, 900, 300, 540, 960, 1300); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(8,2,1,.6)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
}

// ================= the master render =================
export function scene(ctx, t) {
  if (t < 6.4) hook(ctx, t);
  else if (t < 7.25) {                                       // T12: the thread pans us from the sanctum to the amla tree
    const e = eio(seg(t, 6.4, 7.25)), o = off(OA); hook(o, t); const o2 = off(OB); amla(o2, t);
    ctx.drawImage(OA, -W * e, 0); ctx.drawImage(OB, W * (1 - e), 0);
    ctx.save(); ctx.translate(W * (1 - e), 0); const z = 1 + .06 * seg(t, 6.6, 12.2); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960 + 40 * seg(t, 6.6, 12.2) * 0); ctx.restore();
  }
  else if (t < 12.05) amla(ctx, t);
  else if (t < 12.8) {                                       // T23: crane up the thread to Sakshigopal
    const e = eio(seg(t, 12.05, 12.8)), o = off(OA); amla(o, t); const o2 = off(OB); queue(o2, t);
    ctx.drawImage(OA, 0, H * e); ctx.drawImage(OB, 0, -H * (1 - e));
  }
  else if (t < 16.3) { queue(ctx, t); fill(ctx, '#140806', ss(seg(t, 16.0, 16.3))); }     // S3, then the dive through the temple door
  else if (t < 50.0) { legend(ctx, t); fill(ctx, '#140806', 1 - ss(seg(t, 16.3, 16.85))); }
  else if (t < 50.6) {                                       // T_loom: the drawn ghagra becomes cloth
    const o = off(OA); legend(o, t); loom(ctx, t); ctx.save(); ctx.globalAlpha = 1 - ss(seg(t, 50.0, 50.58)); ctx.drawImage(OA, 0, 0); ctx.restore();
  }
  else if (t < 53.15) loom(ctx, t);
  else if (t < 53.7) {                                       // T_reveal: tilt down past the saree's border to her feet
    const o = off(OA); loom(o, t); besha(ctx, t); ctx.save(); ctx.globalAlpha = 1 - ss(seg(t, 53.15, 53.7)); ctx.drawImage(OA, 0, 0); ctx.restore();
  }
  else if (t < 64.6) besha(ctx, t);
  else if (t < 65.6) {                                       // T_coda: her feet's light blooms back into the drawing
    const o = off(OA); besha(o, Math.min(t, 65.3)); const b = seg(t, 64.6, 65.6);
    legend(ctx, t); ctx.save(); ctx.globalAlpha = 1 - ss(seg(t, 65.05, 65.6)); ctx.drawImage(OA, 0, 0); ctx.restore();
    glow(ctx, 540, 1000, lerp(200, 1600, b), .9 * Math.sin(Math.PI * b), '255,236,200');
  }
  else if (t < 69.95) legend(ctx, t);
  else if (t < 70.9) { const o = off(OA); legend(o, t); queueAll(ctx, t, lerp(1.12, 1.0, eo(seg(t, 69.95, 72.5)))); ctx.save(); ctx.globalAlpha = 1 - ss(seg(t, 69.95, 70.9)); ctx.drawImage(OA, 0, 0); ctx.restore(); }
  else if (t < 73.35) queueAll(ctx, t, lerp(1.12, 1.0, eo(seg(t, 69.95, 72.5))));
  else { const o = off(OA); queueAll(o, t, 1.0); hook(ctx, 0); ctx.save(); ctx.globalAlpha = 1 - ss(seg(t, 73.35, DUR - 1 / 30)); ctx.drawImage(OA, 0, 0); ctx.restore(); }
  // during T12 the thread spans both frames: draw it in the combined space
  if (t >= 6.4 && t < 7.25) {
    const e = eio(seg(t, 6.4, 7.25)), lift = hookLift(t), zA = 1 + .05 * seg(t, 0, 6.4);
    const a = hookThreadPts(t, lift).map(([x, y]) => [(x - 540) * zA + 540 - W * e, (y - 1010) * zA + 960]);
    ctx.save(); ctx.translate(W * (1 - e), 0); const z = 1 + .06 * seg(t, 6.6, 12.2); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960 + 40 * seg(t, 6.6, 12.2) * z / z);
    ctx.restore();
    thread(ctx, a);
  }
}

// ================= captions: one voice, four looks; always in the clear band (y ≈ 1380–1470), never over the picture =========
const LOOK = {
  dark: { col: '#f2e4c6', halo: 'rgba(16,6,3,.9)' }, light: { col: '#2e2018', halo: 'rgba(247,239,224,.95)' },
  paste: { col: '#f4ecdd', halo: 'rgba(52,14,6,.92)' }, loom: { col: '#f2e4c6', halo: 'rgba(12,4,2,.92)' },
};
const CAP = [   // [t0, t1, text, look, line]
  [.2, 4.7, 'Just one day a year:', 'dark', 0], [2.5, 4.7, 'darshan of Radharani’s feet.', 'dark', 1],
  [5.15, 6.5, 'Why not the other days?', 'dark', 0],
  [7.0, 12.0, 'Aonla Navami, when Odia homes', 'light', 0], [8.25, 12.0, 'worship the amla tree.', 'light', 1],
  [12.85, 16.0, 'That day, over two lakh people', 'light', 0], [13.6, 16.0, 'line up at Sakshigopal.', 'light', 1],
  [16.65, 20.0, 'As the legend goes,', 'paste', 0], [18.1, 20.0, 'Radha was not here at first.', 'paste', 1],
  [20.5, 22.0, 'Only Gopinath.', 'paste', 0],
  [22.55, 26.7, 'Lakshmi, the priest’s daughter,', 'paste', 0], [24.2, 26.7, 'came every day just to gaze at him.', 'paste', 1],
  [27.25, 30.95, 'At night, it is said,', 'paste', 0], [28.3, 30.95, 'Gopinath himself went to her house.', 'paste', 1],
  [31.35, 33.7, 'One day, his golden flute', 'paste', 0], [32.4, 33.7, 'was left behind there.', 'paste', 1],
  [34.1, 37.15, 'The village grew suspicious…', 'paste', 0], [35.6, 37.15, 'and the priest was accused.', 'paste', 1],
  [37.5, 41.8, 'Then the king had a dream:', 'paste', 0], [40.2, 41.8, 'Lakshmi is Radha herself.', 'paste', 1],
  [41.95, 43.85, 'An idol was brought from North India', 'paste', 0], [44.75, 46.4, '…and seated at Gopinath’s left.', 'paste', 0],
  [46.75, 49.9, 'But Radha’s feet stayed hidden', 'paste', 0], [48.9, 49.9, 'under her ghagra-choli.', 'paste', 1],
  [51.15, 52.95, 'When she was draped in an Odia saree…', 'loom', 0],
  [53.15, 54.3, '…her feet were seen.', 'light', 0],
  [54.4, 56.75, 'The priests took it as a blessed sign.', 'light', 0],
  [57.05, 62.5, 'Since then, once a year on Aonla Navami,', 'light', 0], [60.45, 62.5, 'Radha wears the Odiani besha,', 'light', 1],
  [62.7, 64.6, 'and only then are her feet seen.', 'light', 0],
  [65.2, 70.6, 'The girl the village once doubted,', 'paste', 0], [67.9, 70.6, 'today, lakhs wait for her feet.', 'paste', 1],
];
function captions(c, t) {
  if (globalThis.NOCAP) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  for (const [a, b, txt, look, ln] of CAP) {
    if (t < a - .05 || t > b + .05) continue;
    const k = ss(seg(t, a, a + .4)) * (1 - ss(seg(t, b - .35, b))); if (k <= 0) continue;
    const L = LOOK[look], y = 1404 + ln * 54 + (1 - ss(seg(t, a, a + .5))) * 10;
    c.globalAlpha = k; c.font = 'italic 500 46px "CormorantG"';
    c.shadowColor = L.halo; c.shadowBlur = 20; c.fillStyle = L.col; c.fillText(txt, 500, y); c.shadowBlur = 8; c.fillText(txt, 500, y);
  }
  c.restore();
}
function odiaTitles(c, t) {
  const T = (txt, a, b, x, y, size, col, halo, w = 600) => { const k = ss(seg(t, a, a + .5)) * (1 - ss(seg(t, b - .4, b))); if (k <= 0) return; c.save(); c.globalAlpha = k; c.font = `${w} ${size}px "OdiaSerif"`; c.textAlign = 'center'; c.fillStyle = col; c.shadowColor = halo; c.shadowBlur = 18; c.fillText(txt, x, y + (1 - ss(seg(t, a, a + .6))) * 8); c.shadowBlur = 0; c.fillText(txt, x, y + (1 - ss(seg(t, a, a + .6))) * 8); c.restore(); };
  T('୩୬୪ ଦିନ ଢାଙ୍କା', 5.2, 6.4, 500, 360, 58, '#ecd9b0', 'rgba(10,3,1,.8)');
  T('ଅଁଳା ନବମୀ', 7.0, 11.9, 500, 380, 64, '#5a2414', 'rgba(250,244,230,.95)', 700);
  // the end card: the title and the day
  T('ରାଧାପାଦ ଦର୍ଶନ', 71.0, 73.5, 500, 360, 76, '#5a1a10', 'rgba(250,242,228,.95)', 700);
  T('ବୁଧବାର, ୧୮ ନଭେମ୍ବର · ସାକ୍ଷୀଗୋପାଳ', 71.4, 73.5, 500, 1404, 40, '#4a1a10', 'rgba(250,242,228,.95)');
  const k = ss(seg(t, 71.7, 72.2)) * (1 - ss(seg(t, 73.1, 73.5))); if (k > 0) { c.save(); c.globalAlpha = k; c.font = 'italic 500 34px "CormorantG"'; c.textAlign = 'center'; c.fillStyle = '#3a2018'; c.shadowColor = 'rgba(250,242,228,.95)'; c.shadowBlur = 14; c.fillText('Wednesday, 18 November · Sakshigopal', 500, 1456); c.restore(); }
}

// ================= motion blur on the fast moves (frame-aligned ranges, samples) =================
export const BLUR = [[192, 218, 8], [361, 384, 8], [477, 489, 8], [658, 687, 5], [1122, 1158, 6], [1251, 1343, 5], [1482, 1515, 5], [1590, 1611, 6]].map(([a, b, n]) => [a / 30, b / 30, n]);
const SHUTTER = .45 / 30;
export function film(ctx, t) {
  if (t >= DUR - 1 / 30 - 1e-6) t = 0;   // the last frame is the first
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  const b = BLUR.find(([a, e]) => t >= a - 1e-4 && t < e - 1e-4);
  if (!b) scene(ctx, t);
  else { const n = b[2], tc = TMP.getContext('2d'); for (let k = 0; k < n; k++) { const o = off(TMP); scene(o, t + (k / (n - 1) - .5) * SHUTTER); ctx.globalAlpha = 1 / (k + 1); ctx.drawImage(TMP, 0, 0); } ctx.globalAlpha = 1; }
  odiaTitles(ctx, t); captions(ctx, t);
}
export const EV = {   // for the sound design
  redThread: 1.0, lift: 2.55, feet: 3.3, fall: 4.6, odia364: 5.2, pull: 5.55, pan: 6.4, amla: 7.0, wind: [7.2, 10.8], up: 11.2, crane: 12.05, queue: 12.85, dive: 15.85,
  legend: 16.3, arch: 16.55, seats: 18.1, gopi: 20.5, flute1: 20.9, thresh: 22.0, lakshmi: [22.55, 23.9, 25.25], diya: 24.0, sun: 24.2, night: 26.6, walk: 27.6, house: 28.3, doorLamp: 29.2,
  dawn: 30.9, goldFlute: 31.55, glint: 32.4, crowd: 34.0, point: 35.5, dream: 37.0, palace: 37.6, scroll: 38.5, lotus: 40.2, north: 41.8, palanquin: 42.4, arrive: 44.75, radha: 44.9,
  ghagra: 46.8, hide: 47.6, push: 49.4, cloth: 50.2, fray: 51.05, weave: 51.35, tilt: 53.0, seen: 53.3, aarti: 54.35, pull2: 57.05, diyas: 59.25, besha: 60.45, feet2: 62.7, bloom: 64.6,
  coda: 65.2, fold: 67.9, queue2: 68.3, toQueue: 69.95, end: 71.0, loop: 73.35,
};
