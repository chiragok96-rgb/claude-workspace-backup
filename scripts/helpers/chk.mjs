// Jadu Guni: one continuous ink line draws her portrait (verse); on the chorus drop, watercolour floods the drawing.
import { buildPath, headAt, posAt } from './geom.js';
import { SEGS, EYE } from './portrait.js';
import { prepare, drawLine } from './ink.js';
import { makePaper, drawPaper, vignette, makeTooth, drawTooth } from './paper.js';
import { camAt, worldToScreen, BASE } from './cam.js';
import { penShadow } from './hands.js';
import { glow } from './lightbox.js';
import { mulberry, mk, drawList, drawS, withSeed, rnd, pick, qcurve, polar, clump } from './engine_wc.js';

const W = 1080, H = 1920, DUR = 26.70;
const BEATS = [0.07, 0.63, 1.18, 1.74, 2.25, 2.86, 3.41, 3.97, 4.50, 5.06, 5.60, 6.18, 6.73, 7.27, 7.80, 8.38, 8.96, 9.52, 10.05, 10.59, 11.17, 11.73, 12.26, 12.84, 13.40, 13.96, 14.51, 15.07, 15.63, 16.16, 16.74, 17.30, 17.86, 18.39, 18.92, 19.48, 20.06, 20.64, 21.20, 21.73, 22.29, 22.83, 23.38, 23.96, 24.52, 25.05, 25.59, 26.10, 26.62];
const LINE = [0.07, 4.50, 8.96, 13.40, 17.86, 20.06, 22.29, 24.52, 26.70];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a)), ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const backE = (t, s = 1.4) => { t = clamp(t); return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
const Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mkCanvas = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const BUF = mkCanvas();
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });

// ---------------- act I · the line ----------------
const CAM = [
  { t: 0.0, x: -96, y: -96, z: 3.4, f: 0 },
  { t: 2.9, x: -98, y: -104, z: 2.7, f: .08 },
  { t: 4.5, x: -110, y: -96, z: 2.5, f: .1 },
  { t: 5.6, x: -150, y: -50, z: 2.2, f: .45 },
  { t: 6.9, x: -150, y: 10, z: 2.5, f: .12 },
  { t: 8.2, x: -70, y: 110, z: 1.8, f: .4 },
  { t: 9.6, x: 0, y: 60, z: 1.5, f: .3 },
  { t: 11.3, x: 30, y: -150, z: 1.35, f: .3 },
  { t: 13.4, x: 200, y: -330, z: 1.12, f: .25 },
  { t: 14.9, x: 150, y: -250, z: 1.0, f: .1 },
  { t: 16.4, x: 130, y: -200, z: .92, f: 0 },
  { t: 16.75, x: 122, y: -192, z: .93, f: 0 },
  { t: 17.86, x: 120, y: -200, z: .95, f: 0 },
  { t: 18.5, x: 60, y: -170, z: 1.1, f: 0 },
  { t: 19.6, x: EYE.x + 10, y: EYE.y, z: 3.4, f: 0 },
  { t: 22.0, x: EYE.x + 4, y: EYE.y, z: 3.7, f: 0 },
  { t: 23.2, x: 360, y: -420, z: 2.3, f: 0 },
  { t: 24.4, x: 370, y: -425, z: 2.45, f: 0 },
  { t: 26.5, x: 130, y: -200, z: .93, f: 0 },
].map(k => ({ r: 0, ...k }));
let P, paper, tooth;
function act1(c, t) {
  const cam = camAt(P, CAM, t, W, H), M = worldToScreen(cam, W, H);
  drawPaper(c, paper, cam, W, H);
  const head = headAt(P, t);
  paint(c, t, cam);
  if (t >= P.T[0]) drawLine(c, P, head, M, cam.k);
  // meetha: a red drop gathers on the lower lip and falls
  const dt = t - 6.9;
  if (dt > 0) {
    const g = ss(dt / .5), fall = dt > .55 ? Math.pow(dt - .55, 2) * 260 : 0, land = Math.min(fall, 72);
    const [x, y] = M(-182, 40 + land), r = (3.2 + 2.2 * g) * cam.k * (fall > 0 && land < 72 ? 1.15 : 1);
    if (land < 72) { c.save(); c.fillStyle = 'rgb(200,50,30)'; c.beginPath(); c.moveTo(x, y - r * (1.6 + Math.min(1.5, fall / 30))); c.quadraticCurveTo(x + r, y - r * .2, x, y + r); c.quadraticCurveTo(x - r, y - r * .2, x, y - r * (1.6 + Math.min(1.5, fall / 30))); c.fill(); c.restore(); }
    else { const u = ss(seg(dt, 1.35, 2.2)), [px, py] = M(-182, 112); c.save(); c.fillStyle = 'rgba(200,50,30,.92)'; c.beginPath(); c.ellipse(px, py, (4 + 9 * u) * cam.k, (2.4 + 3.2 * u) * cam.k, 0, 0, 7); c.fill(); c.restore(); }
  }
  drawTooth(c, tooth, cam, W, H); vignette(c, W, H);
  // the pen (shadow only) while drawing
  const lastT = P.T[P.N - 1];
  if (t < lastT + .6) { const tip = M(...posAt(P, head)); penShadow(c, tip, [Math.cos(.98), Math.sin(.98)], cam.k, { lift: clamp((P.T[0] - t) / .8) + clamp((t - lastT) / .6), alpha: .45 * clamp(t / .4) }); }
  // nisha: the moon glows warm
  { const n = ss(seg(t, 15.55, 16.6)), [mx, my] = M(-40, -615); if (n > 0) glow(c, mx, my, 60 * cam.k, 'rgba(255,200,120,1)', .45 * n); }
}

// ---------------- the drop: watercolour floods the drawing (painted under the ink line) ----------------
let PT;
function polyWash(pts, col, a = .3, step = 9, w = 2.4) {   // soft wash: overlapping strokes in two jittered passes
  const out = [], ys = pts.map(p => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
  for (const [off, aa] of [[0, a * .55], [step * .5, a * .4]]) for (let y = y0 + 2 + off; y < y1 - 1; y += step) {
    const xs = []; for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + (y - ay) / (by - ay) * (bx - ax)); }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) out.push(mk(qcurve(xs[k] + 1, y + rnd(-2, 2), xs[k + 1] - 1, y + rnd(-2, 2), rnd(-3, 3), 8), step * w, col, { prof: 'even', nb: 1, a: aa, rough: .1 }));
  }
  return out;
}
function blob(x, y, r, col, a) { const pts = []; for (let k = 0; k < 18; k++) { const q = k / 18 * 6.283; pts.push([x + Math.cos(q) * r * (1 + .12 * Math.sin(q * 3 + x)), y + Math.sin(q) * r * .8 * (1 + .1 * Math.sin(q * 5 + y))]); } return polyWash(pts, col, a, 14, 2.6); }
const SKIN = [[-146, -236], [-160, -160], [-176, -100], [-214, -42], [-186, -24], [-196, 4], [-172, 16], [-190, 32], [-166, 86], [-140, 112], [-100, 130], [-76, 150], [-62, 200], [-52, 270], [-40, 296], [20, 300], [76, 290], [70, 220], [62, 150], [40, 86], [26, 0], [8, -120], [-30, -232]];
const HAIR = [[-146, -236], [-104, -300], [-30, -334], [60, -322], [126, -260], [150, -170], [142, -70], [96, 20], [40, 86], [26, 0], [8, -120], [-30, -232]];
const MOON = [[96, -640], [40, -690], [-30, -700], [-82, -660], [-96, -600], [-70, -548], [-10, -530], [30, -548], [-14, -556], [-48, -590], [-48, -640], [-14, -680], [40, -690]];
const LIPS = [[-190, -8], [-196, 4], [-172, 16], [-190, 32], [-180, 44], [-168, 30], [-170, 10], [-180, -6]];
const BIRD = { x: 395, y: -452 };
function buildPaint() {
  PT = withSeed(707, () => {
    const g = {};
    // sky: a warm dusk wash behind everything, heavier near the moon, rose toward the bottom
    g.sky = blob(-20, -600, 260, '#F6CF95', .35).concat(blob(380, -430, 230, '#F7D9B0', .3), blob(-120, 120, 300, '#F4CDBE', .22), blob(260, 160, 220, '#F2D3C6', .2));
    g.moon = polyWash(MOON.slice(0, 9), '#F2B83E', .55, 6, 2.6);
    g.hair = polyWash(HAIR, '#4A3550', .55, 7).concat(polyWash(HAIR.slice(2, 9), '#2E2238', .3, 9));
    g.skin = polyWash(SKIN, '#ECBD96', .5, 7).concat(polyWash(SKIN.slice(12, 22), '#CF9068', .25, 9));
    g.cheek = [mk(polar(-120, -8, 0, 4, 0, 4), 34, '#E58A78', { prof: 'leaf', nb: 0, a: .22 })];
    g.lips = polyWash(LIPS, '#C8321E', .8, 4, 2.8);
    g.jhumka = polyWash([[-12, 92], [8, 72], [28, 92], [10, 100]], '#E3A23A', .9, 4, 2.6).concat([0, 1, 2].map(k => mk(polar(-6 + k * 8, 106, 1.57, 6, 0, 3), 6, '#E3A23A', { prof: 'leaf', nb: 0, a: .9 })));
    // eye: iris (moves on the beats), kohl
    g.iris = [mk(polar(-100, -98, 0, 1, 0, 3), 22, '#5A2E1C', { prof: 'leaf', nb: 0, a: .85 }), mk(polar(-100, -98, 0, 1, 0, 3), 12, '#2a1610', { prof: 'leaf', nb: 0, a: .9 })];
    g.kajal = [mk(qcurve(-128, -100, -60, -102, -16, 14), 7, '#141012', { prof: 'even', nb: 3, a: .95 }), mk(qcurve(-62, -101, -22, -128, 4, 8), 6.5, '#141012', { prof: 'tip', nb: 2, a: .95 }), mk(qcurve(-124, -90, -72, -92, 8, 10), 2.6, '#141012', { prof: 'even', nb: 0, a: .7 })];
    // mango branch: leaves + blossoms
    g.leaves = []; for (const [x, y, a] of [[200, -312, -2.6], [270, -340, .5], [300, -360, -2.2], [360, -400, .7], [420, -470, -2.4], [450, -500, .4], [240, -330, -1.0]]) g.leaves.push(mk(polar(x, y, a, rnd(38, 52), rnd(-6, 6), 6), rnd(13, 17), pick(['#7E9A52', '#6A8A44', '#93AC62']), { prof: 'leaf', nb: 3, a: .8 }));
    g.blossom = []; for (const [x, y, a] of [[330, -380, -2.2], [400, -440, -.6], [470, -520, -1.4]]) for (let k = 0; k < 16; k++) { const u = k / 15; g.blossom.push(mk(polar(x + Math.cos(a) * 95 * u + rnd(-8, 8), y + Math.sin(a) * 95 * u + rnd(-8, 8), rnd(0, 6.28), rnd(6, 10), 2, 3), rnd(6, 9), pick(['#C8321E', '#E8962C', '#F2B83E', '#D8442A']), { prof: 'leaf', nb: 0, a: .9 })); }
    // the cuckoo, painted onto the branch (body, wing, tail, beak, a red eye)
    const B = BIRD;
    g.bird = polyWash([[B.x - 34, B.y + 6], [B.x - 22, B.y - 18], [B.x, B.y - 26], [B.x + 26, B.y - 18], [B.x + 40, B.y - 2], [B.x + 30, B.y + 14], [B.x, B.y + 18], [B.x - 22, B.y + 16]], '#2E2A3A', .9, 4, 2.6)
      .concat(polyWash([[B.x - 36, B.y - 14], [B.x - 26, B.y - 30], [B.x - 12, B.y - 30], [B.x - 6, B.y - 16], [B.x - 18, B.y - 8]], '#2E2A3A', .92, 3, 2.6))
      .concat([mk(qcurve(B.x + 30, B.y + 4, B.x + 92, B.y + 22, -6, 8), 13, '#2E2A3A', { prof: 'tip', nb: 3, a: .9 }), mk(qcurve(B.x - 36, B.y - 22, B.x - 54, B.y - 18, 2, 4), 5, '#3a3020', { prof: 'tip', nb: 0, a: .9 }), mk(polar(B.x - 4, B.y - 4, .3, 34, 4, 6), 11, '#4A4458', { prof: 'leaf', nb: 2, a: .8 })]);
    g.birdEye = [mk(polar(B.x - 24, B.y - 22, 0, 1, 0, 3), 5, '#C8321E', { prof: 'leaf', nb: 0, a: 1 })];
    g.petals = Array.from({ length: 40 }, () => ({ a: rnd(-2.6, .2), sp: rnd(60, 150), b: Math.floor(rnd(0, 4)), s: mk(polar(0, 0, rnd(0, 6.28), rnd(8, 13), 3, 4), rnd(6, 9), pick(['#C8321E', '#E8962C', '#F2B83E']), { prof: 'leaf', nb: 0, a: .9 }) }));
    return g;
  });
}
function paint(c, t, cam) {
  if (t < 17.7) return;
  c.save(); c.setTransform(cam.k, 0, 0, cam.k, W / 2 - cam.cx * cam.k, H / 2 - cam.cy * cam.k);
  const D = 17.86, P_ = (a, b) => eo(seg(t, a, b));
  // the drop: colour blooms outward from her eye
  drawList(c, PT.skin, P_(D, D + .7)); drawList(c, PT.cheek, P_(D + .3, D + .9)); drawList(c, PT.lips, P_(D + .15, D + .6));
  drawList(c, PT.hair, P_(D + .2, D + 1.0)); drawList(c, PT.jhumka, P_(D + .45, D + .9));
  drawList(c, PT.sky, P_(D + .3, D + 1.4)); drawList(c, PT.moon, P_(D + .6, D + 1.2));
  drawList(c, PT.leaves, P_(D + .5, D + 1.2)); drawList(c, PT.blossom, P_(D + .7, D + 1.5));
  // restless eye: the iris darts on every beat
  if (t > D + .2) { const bs = BEATS.filter(b => b >= 18.39 && b < 22.29 && b <= t), dx = bs.length ? (bs.length % 2 ? -6 : 5) * backE(seg(t, bs.at(-1), bs.at(-1) + .18), 1.2) : 0;
    c.save(); c.translate(dx, 0); drawList(c, PT.iris, P_(D + .2, D + .5)); c.fillStyle = 'rgba(255,248,232,.95)'; c.beginPath(); c.arc(-104, -102, 2.4, 0, 7); c.fill(); c.restore(); }
  drawList(c, PT.kajal, P_(20.06, 20.64));
  drawList(c, PT.bird, P_(22.29, 23.1)); drawList(c, PT.birdEye, P_(23.0, 23.2));
  // kuhu kuhu: petals burst from the beak on the beats
  if (t > 24.52) PT.petals.forEach((p, i) => { const b = BEATS.filter(x => x >= 24.52)[p.b]; if (!b || t < b) return; const u = t - b; c.save(); c.translate(BIRD.x - 54 + Math.cos(p.a) * u * p.sp, BIRD.y - 18 + Math.sin(p.a) * u * p.sp + u * u * 20); c.rotate(u * 2 + i); c.globalAlpha = 1 - seg(u, 1.4, 2.2); drawS(c, p.s, 1); c.restore(); });
  c.restore();
  // a soft flash of colour on the drop
  const fl = 1 - seg(t, D, D + .5); if (t >= D && fl > 0) glow(c, W / 2, H * .45, 700, 'rgba(255,190,120,1)', .3 * fl);
}

// ---------------- words ----------------
function written(c, word, gloss, x, y, t0, t1, size, t, o = {}) {
  if (t < t0 || t > t1 + .4) return;
  const w = seg(t, t0, t0 + .25 + word.length * .07), out = 1 - seg(t, t1 - .1, t1 + .4);
  c.save(); c.globalAlpha = out; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.font = `${size}px Sacramento`; const tw = c.measureText(word).width;
  c.save(); c.beginPath(); c.rect(x - tw / 2 - 30, y - size, (tw + 60) * w, size * 1.5); c.clip();
  c.fillStyle = o.ink || 'rgba(29,26,23,.9)'; c.fillText(word, x, y); c.restore();
  if (gloss) { c.globalAlpha = out * seg(t, t0 + .5, t0 + 1); c.font = `500 ${Math.round(size * .2)}px Cormorant`; c.letterSpacing = `${Math.round(size * .06)}px`; c.fillStyle = o.gl || 'rgba(29,26,23,.55)'; c.fillText(gloss.toUpperCase(), x, y + size * .42); }
  c.restore();
}
function lit(c, word, gloss, x, y, t0, t1, size, t, rot = 0) {
  if (t < t0 || t > t1 + .4) return;
  const a = seg(t, t0, t0 + .5) * (1 - seg(t, t1 - .1, t1 + .4));
  c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha = a; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `400 ${size}px Italiana`; c.letterSpacing = `${Math.round(size * .14)}px`;
  c.shadowColor = 'rgba(255,170,90,.75)'; c.shadowBlur = 22; c.fillStyle = '#ffdcae'; c.fillText(word, 0, 0);
  if (gloss) { c.shadowBlur = 0; c.font = `italic 400 ${Math.round(size * .3)}px Cormorant`; c.letterSpacing = '2px'; c.fillStyle = 'rgba(255,226,190,.75)'; c.fillText(gloss, 0, size * .78); }
  c.restore();
}
function words(c, t) {
  written(c, 'Jadu Guni', 'magic', 760, 470, 0.63, 4.3, 150, t);
  written(c, 'Meetha', 'sweet, from salty lips', 790, 830, 6.73, 8.8, 150, t);
  written(c, 'Amba Baula', 'mango blossom', 560, 1740, 9.52, 13.2, 130, t);
  written(c, 'Mahani', 'enchantment', 540, 250, 14.0, 17.3, 150, t);
  written(c, 'Chagali', 'restless eyes', 540, 330, 18.9, 20.0, 160, t, { ink: 'rgba(170,40,24,.92)', gl: 'rgba(60,30,20,.6)' });
  written(c, 'Kajala', 'the kohl line', 540, 1560, 20.64, 22.2, 160, t);
  written(c, 'Koyili', 'her voice, a cuckoo', 540, 1500, 22.9, 24.4, 160, t, { ink: 'rgba(170,40,24,.92)', gl: 'rgba(60,30,20,.6)' });
  written(c, 'Kuhu Kuhu', '', 540, 1640, 24.6, 26.4, 150, t);
}

// ---------------- render ----------------
window.DUR = DUR;
window.render = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  act1(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!Q.has('nowords')) words(ctx, t);
  const end = ss(seg(t, 26.45, 26.7)); if (end > 0) { ctx.globalAlpha = end * .35; ctx.fillStyle = '#f4efe4'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
};
window.TEXTS = t => [];
window.EV = LINE.map((t, i) => ({ t, type: 'line', i }));

(async () => {
  const base = new URL('.', import.meta.url).href;
  for (const f of ['170px Sacramento', '500 40px Cormorant', '400 100px Italiana', 'italic 400 30px Cormorant']) await document.fonts.load(f, 'Jadu');
  P = prepare(buildPath(SEGS)); paper = makePaper(); tooth = makeTooth();
  buildPaint();
  window.render(Number(Q.get('t') || 0)); window.READY = true;
})();
