// Manabasa Gurubara — the Lakshmi Purana, told in rice. Voice-locked to audio/vo.mp3 (55.7 s). Loops.
// Every picture is made of grains — white rice, turmeric akshata, kumkum — on black stone by one lamp; each picture flows into the next.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
import { initRice, rice, sequence, slate, lampLight } from './sc_rice.js';
import { buildTargets } from './targets.js';
const Q = new URLSearchParams(location.search), cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const DUR = 55.8; const FROM = +(Q.get('from') || 0); window.DUR = Q.get('to') ? +Q.get('to') - FROM : DUR;
// a real flame: a soft orange envelope, a gold body, a white-hot core, a breath of blue at the root; it flickers and leans, and lights the air
export function flame(c, t, bx, by, h, seed = 0, glow = 1) {
  const f1 = Math.sin(t * 11.3 + seed * 7.1), f2 = Math.sin(t * 17.9 + seed * 3.3), f3 = Math.sin(t * 4.7 + seed * 1.7), f4 = Math.sin(t * 23.1 + seed * 5.9);
  const fh = h * (1 + .09 * f1 + .05 * f2 + .03 * f4), sway = (.12 * f3 + .05 * f2) * h, w = h * .3 * (1 + .05 * f2);
  c.save(); c.globalCompositeOperation = 'lighter';
  if (glow > 0) { const R = h * 4.5, g = c.createRadialGradient(bx, by - fh * .45, 0, bx, by - fh * .45, R); g.addColorStop(0, `rgba(255,190,105,${.42 * glow})`); g.addColorStop(.22, `rgba(255,150,70,${.15 * glow})`); g.addColorStop(1, 'rgba(255,120,50,0)'); c.fillStyle = g; c.fillRect(bx - R, by - fh * .45 - R, R * 2, R * 2); }
  const tear = (k, lift = 0) => { const hh2 = fh * k, ww = w * k, b = by - lift; c.beginPath(); c.moveTo(bx, b + ww * .35); c.bezierCurveTo(bx - ww * 1.15, b + ww * .3, bx - ww * .95, b - hh2 * .38, bx - ww * .25 + sway * .45, b - hh2 * .7);
    c.quadraticCurveTo(bx + sway * .8 - ww * .05, b - hh2 * .92, bx + sway, b - hh2); c.quadraticCurveTo(bx + sway * .85 + ww * .1, b - hh2 * .9, bx + ww * .3 + sway * .45, b - hh2 * .7); c.bezierCurveTo(bx + ww * .95, b - hh2 * .38, bx + ww * 1.15, b + ww * .3, bx, b + ww * .35); c.closePath(); };
  c.filter = `blur(${Math.max(.6, h * .06)}px)`; tear(1.25); c.fillStyle = 'rgba(255,110,30,.5)'; c.fill(); c.filter = 'none';   // the soft outer envelope
  tear(1); let g = c.createLinearGradient(0, by + w * .3, 0, by - fh); g.addColorStop(0, 'rgba(255,190,80,.9)'); g.addColorStop(.35, 'rgba(255,200,90,.95)'); g.addColorStop(.75, 'rgba(255,140,40,.7)'); g.addColorStop(1, 'rgba(255,90,20,0)'); c.fillStyle = g; c.fill();
  tear(.52, -fh * .02); g = c.createLinearGradient(0, by, 0, by - fh * .55); g.addColorStop(0, 'rgba(255,252,236,1)'); g.addColorStop(1, 'rgba(255,240,200,.2)'); c.fillStyle = g; c.fill();   // the white-hot core
  c.fillStyle = 'rgba(70,110,255,.35)'; c.beginPath(); c.ellipse(bx, by + w * .15, w * .55, w * .26, 0, 0, 7); c.fill();   // the blue root
  c.restore();
  c.strokeStyle = '#2a1408'; c.lineWidth = Math.max(.8, h * .05); c.beginPath(); c.moveTo(bx - w * .1, by + w * .5); c.lineTo(bx + sway * .05, by - fh * .06); c.stroke();   // the wick
}

// [picture, the moment its grains begin to flow into it, how long the flow takes, gesture]
const SEQ = [
  ['bhoga', 1.0, 1.3, 'burst'], ['empty', 2.5, .5, 'burst'], ['doors0', 3.0, .8, 'flow'], ['doors1', 3.85, .3, 'flow'], ['doors2', 4.15, .3, 'flow'], ['doors3', 4.45, .3, 'flow'], ['doors4', 4.75, .3, 'flow'], ['doors5', 5.05, .3, 'flow'],
  ['one', 5.45, .6, 'burst'], ['mandala', 6.55, 1.7, 'gather'], ['walk', 9.2, 1.4, 'flow'], ['avoid', 11.2, 1.2, 'flow'], ['sweep', 13.4, .9, 'sweep'], ['invite', 14.3, .9, 'flow'], ['enter', 15.15, .6, 'flow'],
  ['bala', 16.2, 1.1, 'flow'], ['shut', 19.65, .5, 'gather'], ['hand', 21.4, 1.0, 'burst'], ['lamps', 22.6, .8, 'flow'], ['out', 23.45, 1.0, 'fall'], ['fist', 24.6, .8, 'flow'],
  ['dusk', 26.5, 1.4, 'blow'], ['duskLit', 28.8, .8, 'flow'], ['meal', 32.5, 1.0, 'burst'], ['jagW', 34.0, .7, 'flow'], ['goldMeal', 35.45, 1.0, 'flow'], ['open', 37.6, 1.0, 'flow'],
  ['ring', 40.2, 1.0, 'burst'], ['ringFree', 41.6, .9, 'sweep'], ['bazar', 43.2, 1.2, 'flow'], ['hands', 45.8, 1.2, 'gather'], ['palm', 49.0, 1.4, 'flow'], ['purana', 51.8, 1.4, 'flow'], ['jag', 54.55, 1.4, 'gather'],
];
const CAPS = [
  [0.1, 2.75, ['The Jagannath we offer', '*fifty-six* bhogas…'], 'dark'],
  [3.0, 5.45, ['once wandered door to door,', '*hungry*.'], 'dark'],
  [5.75, 6.6, ['*Why?*'], 'dark'],
  [6.9, 9.0, ['Margashira. Manabasa *Gurubara*.'], 'dark'],
  [9.2, 10.95, ['Lakshmi went to *Shriya’s* home—'], 'dark'],
  [11.2, 13.25, ['a woman society called', '*untouchable*.'], 'dark'],
  [13.45, 15.8, ['She swept her home clean', 'and *invited* Lakshmi in.'], 'dark'],
  [16.2, 18.15, ['On her way back,', '*Balabhadra* stopped her—'], 'dark'],
  [18.3, 19.5, ['“You come from *that* house?”'], 'dark'],
  [19.65, 21.3, ['“You shall not enter the *temple*.”'], 'dark'],
  [21.5, 23.3, ['Humiliated, Lakshmi *spoke*—'], 'dark'],
  [23.45, 26.55, ['“For twelve years, not even', 'a *fistful* of rice.”'], 'dark'],
  [26.75, 30.2, ['At last, the two brothers were fed', 'by such a *house*…'], 'dark'],
  [30.45, 32.5, ['where no one would *set foot*.'], 'dark'],
  [32.85, 35.35, ['From the first *morsel*,', 'Jagannath knew—'], 'dark'],
  [35.55, 37.45, ['this cooking was *Lakshmi’s*.'], 'dark'],
  [37.75, 40.1, ['Lakshmi returned,', 'on one *condition*—'], 'dark'],
  [40.3, 43.1, ['at Mahaprasad, there will be', 'no *caste*.'], 'dark'],
  [43.3, 45.8, ['Even today, at Srimandir’s', '*Ananda Bazar*,'], 'dark'],
  [45.85, 48.8, ['devotees of every caste', 'eat abadha *together*.'], 'dark'],
  [49.05, 51.65, ['The lesson our society', 'still *needs*…'], 'dark'],
  [51.85, 55.5, ['our Lakshmi Purana gave', '*centuries* ago.'], 'dark'],
];
function capLine(c, ln, y, sz = 1) {
  const parts = ln.split('*'), fnt = j => j % 2 ? `italic 600 ${Math.round(56 * sz)}px "CormorantG"` : `600 ${Math.round(50 * sz)}px "CormorantG"`;
  c.letterSpacing = '0.5px'; const ws = parts.map((p, j) => { c.font = fnt(j); return c.measureText(p).width; }); let x = 540 - ws.reduce((a, b) => a + b, 0) / 2;
  parts.forEach((p, j) => { if (!p) return; c.font = fnt(j); c.fillStyle = j % 2 ? '#f0c672' : '#f6ecdc'; c.shadowColor = 'rgba(8,3,2,.85)'; c.shadowBlur = 10; c.shadowOffsetY = 1.5; c.fillText(p, x, y); c.shadowBlur = 3; c.shadowOffsetY = 0; c.fillText(p, x, y); c.shadowBlur = 0; c.fillText(p, x, y); x += ws[j]; });
}
function captions(c, t) {
  if (Q.get('cap') === '0') return;
  for (const [a, b, lines] of CAPS) { const k = ss(seg(t, a - .05, a + .3)) * (1 - ss(seg(t, b - .28, b + .02))); if (k <= 0) continue;
    c.save(); c.globalAlpha = k; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; const dy = (1 - eo(seg(t, a - .05, a + .5))) * 10;
    lines.forEach((ln, i) => capLine(c, ln, 1452 - (lines.length - 1 - i) * 62 + dy, ln.length > 38 ? .92 : 1)); c.restore(); }
}

const CAM = t => {   // a slow breath of a camera; it leans in on the lone grain ("Why?") and into the lit door
  let z = 1 + .03 * Math.sin(t * .35), x = 540, y = 900;
  z *= 1 + 2.6 * ss(seg(t, 5.55, 6.2)) * (1 - ss(seg(t, 6.45, 6.9)));
  z *= 1 + 1.8 * eio(seg(t, 31.3, 32.6)) * (1 - ss(seg(t, 32.5, 32.9))); if (t > 31 && t < 33) { x = 540; y = 1000; }
  return { x, y, z };
};
let GRAIN; function grain(c, t) {   // a fine film grain over everything, so every style sits on the same stock
  if (!GRAIN) { GRAIN = mk(512, 512); const g = GRAIN.getContext('2d'), d = g.createImageData(512, 512); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (hh(i * .25 + .5) - .5) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
  const f = Math.floor(t * 30), ox = (f * 197) % 512, oy = (f * 311) % 512; c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .07; c.fillStyle = c.createPattern(GRAIN, 'repeat'); c.translate(-ox, -oy); c.fillRect(ox, oy, W, H); c.restore();
}
// ———————————————— the frame ————————————————
const LAMP = [150, 1640];
window.render = t0 => { const t = t0 + FROM;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  try {
    slate(ctx, t, ...LAMP);
    rice(ctx, t, CAM(t));
    lampLight(ctx, t, ...LAMP);
    ctx.save(); ctx.translate(LAMP[0], LAMP[1]); ctx.fillStyle = '#5a2a12'; ctx.beginPath(); ctx.ellipse(0, 10, 46, 16, 0, 0, 7); ctx.fill(); ctx.restore(); flame(ctx, t, LAMP[0] + 30, LAMP[1] - 2, 40, 1, 1);   // the clay lamp on the stone
    { const lit = ss(seg(t, 28.9, 29.6)) * (1 - ss(seg(t, 32.4, 32.8))); if (lit > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(540, 1000, 0, 540, 1000, 420); g.addColorStop(0, `rgba(255,190,100,${.35 * lit})`); g.addColorStop(1, 'rgba(255,160,80,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); } }   // the one lit door glows
    grain(ctx, t);
    captions(ctx, t);
  } catch (e) { console.error('RENDER ' + e.stack); throw e; }
};
(async () => {
  for (const f of ['italic 600 56px "CormorantG"', '600 50px "CormorantG"', '700 110px "OdiaSerif"']) await document.fonts.load(f, f.includes('Odia') ? 'ମାଣବସା ଗୁରୁବାର ଲକ୍ଷ୍ମୀ ପୁରାଣ' : 'Aa');
  initRice(); buildTargets(); sequence(SEQ, DUR);
  if (Q.get('t')) window.render(+Q.get('t'));
  window.READY = true;
})();
