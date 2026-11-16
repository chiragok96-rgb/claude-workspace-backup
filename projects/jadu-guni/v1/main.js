// Jadu Guni: verse = one continuous ink line (her portrait); chorus = paper-cut lightbox inside her eye at night.
import { buildPath, headAt, posAt } from './geom.js';
import { SEGS, EYE } from './portrait.js';
import { prepare, drawLine } from './ink.js';
import { makePaper, drawPaper, vignette, makeTooth, drawTooth } from './paper.js';
import { camAt, worldToScreen, BASE } from './cam.js';
import { penShadow } from './hands.js';
import { initLightbox, sheet, drawStack, glow, LW, LH } from './lightbox.js';
import { mulberry } from './engine_wc.js';

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
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const BUF = mk();
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

// ---------------- act II · the eye at night (paper-cut lightbox) ----------------
const full = m => m.fillRect(-LW / 2, -LH / 2, LW, LH);
function almond(m, w, h) { m.beginPath(); m.moveTo(-w / 2, 0); m.bezierCurveTo(-w * .2, -h * .95, w * .25, -h * 1.0, w / 2, -h * .08); m.bezierCurveTo(w * .25, h * .82, -w * .2, h * .78, -w / 2, 0); m.closePath(); }
const EW = 900, EH = 420, BR = 190;
let L2;
function buildEye() {
  const R = mulberry(12);
  L2 = [
    sheet('#2c3066', full, { depth: 0, trans: .95 }),
    sheet('#161936', m => {                                       // mango branch with leaves
      m.save(); m.lineCap = 'round'; m.strokeStyle = '#000'; m.lineWidth = 18; m.beginPath(); m.moveTo(700, 220); m.quadraticCurveTo(300, 40, -120, 110); m.quadraticCurveTo(-300, 140, -460, 60); m.stroke(); m.restore();
      for (const [x, y, a] of [[520, 150, -.9], [380, 90, 2.4], [250, 70, -1.1], [120, 80, 2.2], [-40, 100, -.7], [-200, 120, 2.6], [-330, 100, -1.2]]) { m.save(); m.translate(x, y); m.rotate(a); m.beginPath(); m.ellipse(60, 0, 70, 18, 0, 0, 7); m.fill(); m.restore(); }
    }, { depth: .35, trans: .3, cut: m => { for (const [x, y, a] of [[520, 150, -.9], [380, 90, 2.4], [250, 70, -1.1], [120, 80, 2.2], [-40, 100, -.7], [-200, 120, 2.6], [-330, 100, -1.2]]) { m.save(); m.translate(x, y); m.rotate(a); m.fillRect(0, -1.5, 115, 3); m.restore(); } } }),
    sheet('#C8321E', m => { for (const [x, y, a] of [[300, 40, -1.9], [-110, 70, -1.2], [-380, 40, -2.2], [160, 46, -1.5]]) for (let k = 0; k < 14; k++) { const u = k / 13; m.beginPath(); m.arc(x + Math.cos(a) * 90 * u + (k % 2 ? 9 : -9), y + Math.sin(a) * 90 * u, 7 - 3 * u, 0, 7); m.fill(); } }, { depth: .37, trans: .75 }),
    sheet('#0c0e22', m => {                                       // the cuckoo (koyili), facing left, perched
      m.beginPath(); m.moveTo(-70, 70); m.quadraticCurveTo(-60, 20, -20, 6); m.quadraticCurveTo(-30, -30, 0, -46); m.quadraticCurveTo(30, -60, 52, -40); m.lineTo(78, -36); m.lineTo(54, -28);
      m.quadraticCurveTo(60, 0, 40, 30); m.quadraticCurveTo(80, 60, 190, 70); m.lineTo(180, 84); m.quadraticCurveTo(80, 84, 20, 74); m.quadraticCurveTo(-30, 90, -70, 70); m.fill();
      m.fillRect(-10, 70, 6, 34); m.fillRect(12, 70, 6, 34);
    }, { depth: .45, trans: .04, rim: '#ffcf8a', rimA: .8, cut: m => { m.beginPath(); m.arc(30, -36, 5, 0, 7); m.fill(); } }),
    sheet('#2a1610', m => { m.beginPath(); m.arc(0, 0, BR, 0, 7); m.fill(); }, { depth: .6, trans: .35,       // the iris: a paper disc, fibres cut, pupil open
      cut: m => { m.beginPath(); m.arc(0, 0, 66, 0, 7); m.fill(); for (let k = 0; k < 36; k++) { const a = k / 36 * Math.PI * 2; m.save(); m.rotate(a); m.beginPath(); m.ellipse(128, 0, 44, 3.2, 0, 0, 7); m.fill(); m.restore(); } } }),
    sheet('#3a1d18', m => { full(m); }, { depth: .85, trans: .16, rim: '#ffb46a', rimA: .7,                       // her face: the eye is a window
      cut: m => { almond(m, EW, EH); m.fill(); } }),
    sheet('#1a0c0a', m => {                                       // brow
      m.beginPath(); m.moveTo(-430, -330); m.quadraticCurveTo(-60, -470, 420, -330); m.quadraticCurveTo(-60, -430, -430, -330); m.fill(); }, { depth: .86, trans: .05 }),
    sheet('#060509', m => {                                       // kajal: the thick line along the upper lid, flicked at the outer corner
      m.beginPath(); m.moveTo(-EW / 2 - 6, -4); m.bezierCurveTo(-EW * .2, -EH * .99, EW * .25, -EH * 1.04, EW / 2 + 4, -EH * .1);
      m.lineTo(EW / 2 + 150, -EH * .38); m.lineTo(EW / 2 + 10, -EH * .02); m.bezierCurveTo(EW * .25, -EH * .92, -EW * .2, -EH * .88, -EW / 2 + 6, 4); m.closePath(); m.fill();
      for (let k = 0; k < 13; k++) { const u = .12 + k * .065, x = lerp(-EW * .42, EW * .44, u), y = -EH * .9 * Math.sin(Math.PI * (u * .9 + .05)) - 6; m.save(); m.translate(x, y); m.rotate(-.5 + u * .9); m.beginPath(); m.moveTo(-5, 0); m.quadraticCurveTo(-4, -40, 14, -58); m.quadraticCurveTo(4, -36, 5, 0); m.fill(); m.restore(); }
    }, { depth: .9, trans: .02 }),
  ];
}
const B = {};
function act2(c, t) {
  const L = L2; L.forEach(l => { l.lit = 1; l.ox = 0; l.oy = 0; l.blur = 0; l.alpha = 1; });
  // iris darts on the beats (restless eyes), then slides aside to reveal the cuckoo
  let ix = 0; const bs = BEATS.filter(b => b >= 17.86 && b < 22.29), pos = [-150, 130, -60, 160, -140, 90, -170, 120, 0];
  for (let i = 0; i < bs.length; i++) if (t >= bs[i]) ix = lerp(i ? pos[i - 1] : 0, pos[i], backE(seg(t, bs[i], bs[i] + .2), 1.2));
  const away = eio(seg(t, 22.29, 23.0)); L[4].ox = lerp(ix, 900, away); L[4].alpha = 1 - ss(seg(t, 22.7, 23.0));
  L[4].oy = -20 * Math.sin(t * 1.3);
  // kajal slides in from the outer corner and settles on the downbeat
  const kj = seg(t, 20.06, 20.64); L[7].ox = 820 * (1 - backE(kj, .9)); L[7].alpha = kj > 0 ? 1 : 0;
  // the cuckoo flies in and lands (22.29 → 22.83), then sings
  const fly = seg(t, 22.29, 22.83); L[3].alpha = t >= 22.29 ? 1 : 0; L[3].ox = lerp(-700, 0, eo(fly)); L[3].oy = lerp(-380, 0, eo(fly)) - 18 * Math.sin(Math.PI * fly) + (t > 22.83 ? -6 * Math.sin(seg(t, 22.83, 23.1) * Math.PI) : 0);
  // camera: slow push, rack to the kajal, lateral parallax inside the eye, pull out of the box
  const push = eio(seg(t, 17.86, 22.2)), lat = eio(seg(t, 22.29, 24.6)), out = eio(seg(t, 24.52, 26.6));
  const cam = { x: lerp(-70, 70, lat) * (1 - out), y: lerp(10, 0, push) - 60 * out, z: lerp(lerp(1.0, 1.08, push), .9, out) };
  const rack = ss(seg(t, 20.06, 20.7)) * (1 - ss(seg(t, 22.29, 22.8)));
  for (const i of [0, 1, 2, 3, 4]) L[i].blur = 2.2 * rack;
  c.fillStyle = '#05050d'; c.fillRect(0, 0, W, H);
  const flick = 1 + .05 * Math.sin(7.3 * t) * Math.sin(3.1 * t);
  const scr = (l, x, y) => { const p = .45 + .55 * l.depth, z = 1 + (cam.z - 1) * p; return [W / 2 + z * (x + (l.ox || 0) - cam.x * p), H / 2 + z * (y + (l.oy || 0) - cam.y * p), z]; };
  drawStack(c, L, cam, { x: W / 2, y: H / 2 - 120, r: 1300, I: 1.0 * flick }, {
    after: [(cc) => {
      cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0);
      const [mx, my, z] = scr(L[0], 250, -250); glow(cc, mx, my, 90 * z, 'rgba(255,220,160,1)', .5); cc.fillStyle = '#ffeccc'; cc.beginPath(); cc.arc(mx, my, 62 * z, 0, 7); cc.fill();
      cc.fillStyle = '#2c3066'; cc.beginPath(); cc.arc(mx + 26 * z, my - 14 * z, 56 * z, 0, 7); cc.fill();
      cc.restore();
    }],
  });
  // pupil light and catchlight (in front of the iris)
  if (L[4].alpha > 0) { const [px, py, z] = scr(L[4], 0, 0); glow(c, px, py, 50 * z, 'rgba(255,200,130,1)', .35 * L[4].alpha); c.save(); c.globalAlpha = .85 * L[4].alpha; c.fillStyle = '#fff3dc'; c.beginPath(); c.ellipse(px - 70 * z, py - 80 * z, 22 * z, 14 * z, -.5, 0, 7); c.fill(); c.restore(); }
  // the cuckoo sings: rings of light from the beak on each beat
  if (t > 24.4) { const [bx, by, z] = scr(L[3], -76, -36); BEATS.filter(b => b >= 24.52 && b <= t).forEach(b => { const u = seg(t, b, b + 1.1); if (u >= 1) return; c.save(); c.strokeStyle = `rgba(255,214,150,${(1 - u) * .9})`; c.lineWidth = 3 * z; c.shadowColor = 'rgba(255,170,90,.8)'; c.shadowBlur = 14; c.beginPath(); c.arc(bx, by, (20 + 260 * eo(u)) * z, Math.PI * .6, Math.PI * 1.4); c.stroke(); c.restore(); }); }
  const kk = seg(t, 24.45, 24.85);
  if (kk > 0) { c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '400 132px Italiana'; c.letterSpacing = '18px';
    ['KUHU', 'KUHU'].forEach((w, i) => { const lv = Math.max(0, ...BEATS.filter(b => b >= 24.52).map(b => t >= b + i * .27 ? Math.exp(-(t - b - i * .27) * 3) : 0));
      c.globalAlpha = kk * (.4 + .6 * lv) * (1 - seg(t, 26.3, 26.7)); c.fillStyle = '#ffdcae'; c.shadowColor = 'rgba(255,170,90,.9)'; c.shadowBlur = 10 + 26 * lv; c.fillText(w, W / 2 + (i ? 150 : -150), 1470 + i * 140); });
    c.restore(); }
  B.cam = cam; B.scr = scr;
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
  written(c, 'Jadu', 'a spell', 790, 470, 0.63, 4.3, 170, t);
  written(c, 'Meetha', 'sweetness, dripping', 790, 830, 6.73, 8.8, 150, t);
  written(c, 'Amba Baula', 'mango blossom', 560, 1740, 9.52, 13.2, 130, t);
  written(c, 'Mahani', 'enchantment', 540, 250, 14.0, 17.3, 150, t, { ink: 'rgba(29,26,23,.88)' });
  lit(c, 'CHAGALI', 'restless eyes', W / 2, 330, 18.0, 20.0, 104, t);
  lit(c, 'KAJAL', 'the kohl line', W / 2, 1520, 20.64, 22.2, 100, t);
  lit(c, 'KOYILI', 'her voice, a cuckoo', W / 2, 1560, 22.83, 24.45, 96, t);
}

// ---------------- render ----------------
window.DUR = DUR;
window.render = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  if (t < 17.55) act1(ctx, t);
  else if (t < 18.05) {   // the ink eye becomes the lit paper eye
    act1(ctx, t); const b = BUF.getContext('2d'); b.setTransform(1, 0, 0, 1, 0, 0); act2(b, t);
    ctx.globalAlpha = ss(seg(t, 17.55, 18.05)); ctx.drawImage(BUF, 0, 0); ctx.globalAlpha = 1;
  } else act2(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!Q.has('nowords')) words(ctx, t);
  const end = ss(seg(t, 26.3, 26.7)); if (end > 0) { ctx.globalAlpha = end * .85; ctx.fillStyle = '#05050d'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
};
window.TEXTS = t => [];
window.EV = LINE.map((t, i) => ({ t, type: 'line', i }));

(async () => {
  const base = new URL('.', import.meta.url).href;
  for (const f of ['170px Sacramento', '500 40px Cormorant', '400 100px Italiana', 'italic 400 30px Cormorant']) await document.fonts.load(f, 'Jadu');
  P = prepare(buildPath(SEGS)); paper = makePaper(); tooth = makeTooth();
  const [fibre, pulp] = await Promise.all([load(base + 'assets/fibre.png'), load(base + 'assets/pulp.png')]);
  initLightbox(fibre, pulp); buildEye();
  window.render(Number(Q.get('t') || 0)); window.READY = true;
})();
