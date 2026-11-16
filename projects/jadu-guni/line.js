import { buildPath, headAt, posAt } from './geom.js';
import { SEGS, EYE } from './portrait.js';
import { prepare, drawLine } from './ink.js';
import { makePaper, drawPaper, vignette, makeTooth, drawTooth } from './paper.js';
import { camAt, worldToScreen } from './cam.js';
import { penShadow } from './hands.js';
import { glow } from './lightbox.js';
const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a)), ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
// ---------------- act I · the line ----------------
const CAM = [
  { t: 0.0, x: -96, y: -96, z: 3.4, f: 0 },
  { t: 2.9, x: -98, y: -104, z: 2.7, f: .08 },
  { t: 4.5, x: -110, y: -96, z: 2.5, f: .1 },
  { t: 5.6, x: -150, y: -50, z: 2.2, f: .45 },
  { t: 6.9, x: -150, y: 10, z: 2.5, f: .12 },
  { t: 8.2, x: -70, y: 110, z: 1.8, f: .4 },
  { t: 9.6, x: 0, y: 60, z: 1.5, f: .3 },
  { t: 11.3, x: 70, y: -150, z: 1.15, f: .3 },
  { t: 13.4, x: 180, y: -300, z: 1.02, f: .25 },
  { t: 14.9, x: 150, y: -250, z: 1.0, f: .1 },
  { t: 16.4, x: 130, y: -200, z: .92, f: 0 },
  { t: 16.75, x: 122, y: -192, z: .93, f: 0 },
  { t: 17.86, x: EYE.x, y: EYE.y - 2, z: 9.5, f: 0 },
].map(k => ({ r: 0, ...k }));
let P, paper, tooth;
function act1(c, t) {
  const cam = camAt(P, CAM, t, W, H), M = worldToScreen(cam, W, H);
  drawPaper(c, paper, cam, W, H);
  const head = headAt(P, t);
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
  // nisha: the night soaks in from the moon (≈15.6) and the edges
  const n = ss(seg(t, 15.55, 17.7));
  if (n > 0) {
    const [mx, my] = M(-40, -615);
    c.save(); c.globalCompositeOperation = 'multiply';
    const g = c.createRadialGradient(mx, my, 0, mx, my, 2600 * n + 10); g.addColorStop(0, 'rgba(38,40,92,1)'); g.addColorStop(.5, 'rgba(90,86,140,1)'); g.addColorStop(1, 'rgba(255,255,255,1)');
    c.globalAlpha = n; c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
    glow(c, mx, my, 70 * cam.k, 'rgba(255,214,150,1)', .7 * n * (1 - seg(t, 16.8, 17.5)));
  }
}

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

export function initLine() { P = prepare(buildPath(SEGS)); paper = makePaper(); tooth = makeTooth(); }
export function verseWords(c, t) {
  written(c, 'Jadu Guni', 'magic', 760, 470, 0.63, 4.3, 150, t);
  written(c, 'Meetha', 'sweet, from salty lips', 790, 830, 6.73, 8.8, 150, t);
  written(c, 'Amba Baula', 'mango blossom', 560, 1740, 9.52, 13.2, 130, t);
  written(c, 'Mahani', 'enchantment', 540, 250, 14.0, 17.3, 150, t);
}
export { act1 };
