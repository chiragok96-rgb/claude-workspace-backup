// Dawn on the Mahanadi, in watercolour (styles/watercolor grammar: individual brush strokes on warm paper, washes in passes,
// paper is the white, things paint themselves in). Women float banana-stem boats with diyas; Taapoi sings on the ghat;
// then the lamps' reflections paint a great boita rising out of the river (the past, alive).
import { mk, drawS, drawList, qcurve, qctrl, withSeed, rnd, pick, clump, mixc, rgba, INK, INK2 } from './wc_engine.js';
const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), seg = (t, a, b) => clamp((t - a) / (b - a)), ss = x => { x = clamp(x); return x * x * (3 - 2 * x); };

function wash(c, poly, col, a, passes = 3, jit = 6) {   // a wash: the same polygon in 3 jittered passes (edges pool)
  for (let k = 0; k < passes; k++) { c.beginPath(); poly.forEach(([x, y], i) => { const X = x + rnd(-jit, jit), Y = y + rnd(-jit, jit); i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.closePath(); c.fillStyle = rgba(col, a / passes * 1.6); c.fill(); }
}
function hband(c, y0, y1, cols, a, n = 26) {   // horizontal brush bands (sky, water)
  const L = []; for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * (i + rnd(-.3, .3)) / n, x0 = rnd(-80, 120), x1 = W - rnd(-80, 140);
    L.push(mk(qcurve(x0, y, x1, y + rnd(-10, 10), rnd(-14, 14), 18), (y1 - y0) / n * rnd(1.4, 2.2), pick(cols), { prof: 'even', a: a * rnd(.6, 1), nb: 4 })); }
  return L;
}
// a figure in a sari, crouching to release a boat (few, sure strokes); s = scale, col = sari, border = its border colour
function woman(x, y, s, sari, border, flip = 1) {
  const L = [], f = v => v * flip;
  L.push(mk(qcurve(x, y - 150 * s, x + f(40 * s), y - 20 * s, f(30 * s), 10), 70 * s, sari, { prof: 'leaf', nb: 5, a: .9 }));        // body, bent
  L.push(mk(qcurve(x + f(10 * s), y - 30 * s, x + f(95 * s), y + 6 * s, f(-10 * s), 8), 46 * s, sari, { prof: 'brush', nb: 4, a: .85 }));   // folded legs / pleats
  L.push(mk(qcurve(x - f(20 * s), y - 130 * s, x + f(70 * s), y - 10 * s, f(26 * s), 12), 9 * s, border, { prof: 'even', nb: 0, a: .9 })); // the border along the pallu
  L.push(mk(qcurve(x + f(5 * s), y - 120 * s, x + f(70 * s), y - 50 * s, f(-12 * s), 8), 15 * s, '#8a5a3c', { prof: 'tip', nb: 0, a: .9 }));  // arm reaching to the water
  L.push(mk(qcurve(x - f(6 * s), y - 178 * s, x + f(6 * s), y - 160 * s, 0, 4), 34 * s, '#7a4a30', { prof: 'leaf', nb: 0, a: .95 }));      // head
  L.push(mk(qcurve(x - f(16 * s), y - 182 * s, x - f(30 * s), y - 150 * s, f(-6 * s), 5), 18 * s, '#2a1f1a', { prof: 'leaf', nb: 2, a: .95 })); // hair knot
  return L;
}
function taapoi(x, y, s) {   // a young girl standing, hands at her chest, singing
  const L = [];
  L.push(mk(qcurve(x, y - 120 * s, x, y, 0, 8), 64 * s, '#c8452e', { prof: 'trunk', nb: 5, a: .9 }));               // frock (red)
  L.push(mk(qcurve(x - 28 * s, y - 34 * s, x + 28 * s, y - 34 * s, 4 * s, 6), 10 * s, '#e8b03a', { prof: 'even', nb: 0, a: .9 }));   // gold border
  L.push(mk(qcurve(x, y - 10 * s, x - 6 * s, y + 40 * s, 0, 5), 9 * s, '#7a4a30', { prof: 'even', nb: 0 })); L.push(mk(qcurve(x + 8 * s, y - 10 * s, x + 12 * s, y + 40 * s, 0, 5), 9 * s, '#7a4a30', { prof: 'even', nb: 0 }));
  L.push(mk(qcurve(x - 18 * s, y - 108 * s, x + 2 * s, y - 80 * s, 6 * s, 6), 11 * s, '#8a5a3c', { prof: 'tip', nb: 0 })); L.push(mk(qcurve(x + 18 * s, y - 108 * s, x + 4 * s, y - 80 * s, -6 * s, 6), 11 * s, '#8a5a3c', { prof: 'tip', nb: 0 }));
  L.push(mk(qcurve(x - 2 * s, y - 152 * s, x + 2 * s, y - 134 * s, 0, 4), 32 * s, '#7a4a30', { prof: 'leaf', nb: 0, a: .95 }));
  L.push(mk(qcurve(x - 14 * s, y - 160 * s, x - 22 * s, y - 112 * s, -6 * s, 6), 14 * s, '#2a1f1a', { prof: 'tip', nb: 2 }));   // long plait
  return L;
}
// a banana-stem boat with a diya and a betel leaf
function lampBoat(x, y, s) {
  const L = [];
  L.push(mk(qcurve(x - 46 * s, y - 6 * s, x + 46 * s, y - 6 * s, -12 * s, 10), 20 * s, '#9aa65a', { prof: 'leaf', nb: 3, a: .9 }));
  L.push(mk(qcurve(x - 30 * s, y - 14 * s, x + 18 * s, y - 16 * s, -4 * s, 6), 14 * s, '#4f7a2e', { prof: 'leaf', nb: 0, a: .9 }));   // betel leaf
  L.push(mk(qcurve(x + 14 * s, y - 16 * s, x + 30 * s, y - 16 * s, 0, 4), 10 * s, '#a0522d', { prof: 'even', nb: 0, a: .95 }));    // clay diya
  return L;
}
function glowAt(c, x, y, r, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,214,140,${a})`); g.addColorStop(.35, `rgba(244,160,70,${a * .55})`); g.addColorStop(1, 'rgba(244,140,60,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
function flame(c, x, y, s, a = 1) { c.save(); c.globalAlpha = a; c.fillStyle = '#f6b24a'; c.beginPath(); c.moveTo(x, y - 26 * s); c.quadraticCurveTo(x + 9 * s, y - 8 * s, x, y); c.quadraticCurveTo(x - 9 * s, y - 8 * s, x, y - 26 * s); c.fill(); c.fillStyle = '#fff1c4'; c.beginPath(); c.ellipse(x, y - 7 * s, 3 * s, 6 * s, 0, 0, 7); c.fill(); c.restore(); }
// the boita, painted big and translucent out of the reflections: hull, peacock prow, two square sails, rigging
function boitaStrokes(x, y, s) {
  const L = [], ochre = '#b8743a', indigo = '#3a4a7a', saffron = '#e0a040';
  L.push(mk(qctrl(x - 330 * s, y - 40 * s, x, y + 90 * s, x + 330 * s, y - 60 * s, 18), 70 * s, indigo, { prof: 'even', nb: 7, a: .55 }));     // hull
  L.push(mk(qctrl(x - 300 * s, y - 70 * s, x, y + 30 * s, x + 300 * s, y - 92 * s, 18), 16 * s, ochre, { prof: 'even', nb: 2, a: .7 }));      // painted band
  L.push(mk(qctrl(x + 300 * s, y - 70 * s, x + 380 * s, y - 160 * s, x + 340 * s, y - 280 * s, 12), 22 * s, indigo, { prof: 'tip', nb: 3, a: .65 }));   // peacock neck
  L.push(mk(qcurve(x + 330 * s, y - 290 * s, x + 380 * s, y - 300 * s, -10 * s, 5), 26 * s, '#2a6a8a', { prof: 'leaf', nb: 0, a: .75 }));        // head
  for (let k = 0; k < 6; k++) L.push(mk(qcurve(x - 330 * s, y - 60 * s, x - 420 * s - k * 6 * s, y - 220 * s + k * 26 * s, -20 * s, 8), 18 * s, ['#2a6a8a', '#3f8a5a', saffron][k % 3], { prof: 'leaf', nb: 2, a: .6 }));   // tail fan
  for (const [mx, top, wd, h] of [[-60, -560, 300, 330], [140, -440, 210, 240]]) {
    L.push(mk(qcurve(x + mx * s, y - 30 * s, x + mx * s, y + top * s, 0, 10), 9 * s, INK2, { prof: 'even', nb: 0, a: .8 }));
    for (let r = 0; r < 7; r++) { const yy = y + (top + 20 + r * h / 7) * s; L.push(mk(qcurve(x + (mx - wd / 2) * s, yy, x + (mx + wd / 2) * s, yy + 6 * s, -18 * s, 10), h / 7 * 1.3 * s, r % 2 ? saffron : '#f0c87a', { prof: 'even', nb: 4, a: .5 })); }
  }
  return L;
}

let PAPER = null, CACHE = {};
export async function initDawn() { PAPER = new Image(); PAPER.src = 'paper.jpg'; await PAPER.decode(); }
export function drawDawn(c, t, o = {}) {
  // o.paint: 0..1 how much of the scene is painted (self-painting), o.boita: 0..1 the boita rising
  c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(PAPER, 0, 0, W, H);
  const p = o.paint ?? 1;
  const L = CACHE.L || (CACHE.L = withSeed(7, () => {
    const S = {};
    S.sky = hband(null, 0, 840, ['#f2c2a0', '#eab0a8', '#d8b8d0', '#f4d4b0'], .32, 12);
    S.sunHalo = [mk(qcurve(380, 740, 700, 740, 0, 10), 200, '#f6c890', { prof: 'leaf', nb: 0, a: .35 })];
    S.bank = []; for (let i = 0; i < 14; i++) S.bank.push(mk(qcurve(-40 + i * 84, 860 + rnd(-6, 6), 60 + i * 84, 860 + rnd(-14, 4), rnd(-10, 10), 6), rnd(46, 70), pick(['#9a8aa8', '#8a7a98', '#a898b0']), { prof: 'brush', nb: 3, a: .55 }));
    S.temple = [mk(qctrl(780, 840, 812, 700, 846, 840, 14), 52, '#7a6a88', { prof: 'trunk', nb: 3, a: .7 }), mk(qcurve(812, 700, 812, 676, 0, 4), 10, '#6a5a78', { prof: 'even', nb: 0, a: .8 })];
    for (let k = 0; k < 6; k++) S.bank.push(mk(qcurve(120 + k * 160, 852, 120 + k * 160 + rnd(-10, 10), 780 - rnd(0, 40), rnd(-8, 8), 6), rnd(18, 30), '#7a8a7a', { prof: 'tip', nb: 2, a: .55 }));
    S.water = hband(null, 880, 1500, ['#a8b8c8', '#98aac0', '#b8c4cc', '#c8c0c8', '#8ea0b8'], .45, 40);
    S.sunRefl = []; for (let k = 0; k < 16; k++) { const y = 900 + k * 32, w = 120 - k * 5; S.sunRefl.push(mk(qcurve(540 - w, y, 540 + w, y + rnd(-3, 3), rnd(-6, 6), 8), 9, '#f4d098', { prof: 'even', nb: 0, a: .55 })); }
    S.ghat = []; for (let k = 0; k < 6; k++) { const y = 1500 + k * 70; S.ghat.push(mk(qcurve(-40, y, W + 40, y + rnd(-8, 8), rnd(-6, 6), 12), 64, pick(['#c9b48e', '#bfa884', '#d4c098']), { prof: 'even', nb: 6, a: .7 })); S.ghat.push(mk(qcurve(-40, y + 30, W + 40, y + 30, 0, 12), 6, '#8a7656', { prof: 'even', nb: 0, a: .6 })); }
    S.women = [...woman(250, 1520, 1.25, '#f3ece0', '#c8452e'), ...woman(820, 1560, 1.15, '#e8b03a', '#3a7a4a', -1)];
    S.taapoi = taapoi(560, 1700, 1.25);
    S.boats = []; for (let k = 0; k < 9; k++) { const u = k / 8, x = 300 + Math.sin(u * 5.2) * 260 + u * 120, y = 1440 - u * 520, s = 1.05 - u * .65; S.boats.push({ x, y, s, L: lampBoat(x, y, s) }); }
    S.song = [mk(qctrl(600, 1520, 900, 1320, 640, 1100, 30), 7, '#c8452e', { prof: 'tip', nb: 0, a: .5 }), mk(qctrl(560, 1540, 300, 1300, 520, 1000, 30), 5, '#e8b03a', { prof: 'tip', nb: 0, a: .45 })];
    S.boita = boitaStrokes(540, 1160, 1.0);
    return S;
  }));
  const st = (a, b) => ss(seg(p, a, b));
  drawList(c, L.sky, st(0, .25)); drawList(c, L.sunHalo, st(.05, .2));
  c.save(); c.globalAlpha = st(.1, .25); c.fillStyle = '#fff4e0'; c.beginPath(); c.arc(540, 745, 62, 0, 7); c.fill(); c.restore();   // the sun: unpainted paper, a touch of light
  drawList(c, L.water, st(.1, .4)); drawList(c, L.sunRefl, st(.25, .45)); drawList(c, L.bank, st(.2, .45)); drawList(c, L.temple, st(.35, .5));
  // the boita: painted rising from the reflections (translucent)
  if ((o.boita ?? 0) > 0) { c.save(); const b = o.boita; c.globalAlpha = .9 * b; c.translate(0, (1 - b) * 180); drawList(c, L.boita, b); c.restore(); }
  drawList(c, L.ghat, st(.3, .55));
  for (const [i, B] of L.boats.entries()) { const a = st(.45 + i * .03, .6 + i * .03); if (a <= 0) continue; const dy = Math.sin(t * 1.4 + i) * 3;
    c.save(); c.translate(0, dy); glowAt(c, B.x + 22 * B.s, B.y - 30 * B.s, 70 * B.s, .55 * a);
    drawList(c, B.L, a); flame(c, B.x + 22 * B.s, B.y - 18 * B.s, B.s * (.9 + .1 * Math.sin(t * 9 + i)), a);
    for (let k = 0; k < 5; k++) { c.fillStyle = `rgba(244,170,80,${.22 * a})`; c.fillRect(B.x + 16 * B.s, B.y + (10 + k * 12) * B.s, 12 * B.s * (1 - k * .15), 5 * B.s); }   // reflection dabs
    c.restore(); }
  drawList(c, L.women, st(.55, .8)); drawList(c, L.taapoi, st(.65, .85)); drawList(c, L.song, st(.8, 1));
  // night: an indigo wash brushed down from the top (o.night 0..1 = how far the wet edge has travelled); then the moon, lamps and the boita glow back through
  const n = o.night ?? 0;
  if (n > 0) {
    const yE = -260 + n * (H + 520);
    c.save(); c.globalCompositeOperation = 'multiply';
    for (let pass = 0; pass < 4; pass++) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#16222e'); g.addColorStop(.42, '#2a3a48'); g.addColorStop(.7, '#3c4a56'); g.addColorStop(1, '#34404a');
      c.globalAlpha = .34; c.fillStyle = g; c.beginPath(); c.moveTo(-20, -20); c.lineTo(W + 20, -20);
      for (let k = 0; k <= 24; k++) { const x = W + 20 - k * (W + 40) / 24; c.lineTo(x, yE - pass * 46 + Math.sin(k * 1.7 + pass * 2.1) * 34 + Math.sin(k * .53 + pass) * 50); }
      c.closePath(); c.fill(); }
    c.restore();
    const na = ss(seg(n, .35, .8));
    c.save(); c.globalAlpha = na; const mg = c.createRadialGradient(540, 745, 0, 540, 745, 190); mg.addColorStop(0, 'rgba(240,236,220,.55)'); mg.addColorStop(1, 'rgba(240,236,220,0)'); c.fillStyle = mg; c.fillRect(300, 520, 480, 460);
    c.fillStyle = '#f3ede0'; c.beginPath(); c.arc(540, 745, 50, 0, 7); c.fill(); c.restore();
    c.save(); c.globalAlpha = na * .9; c.fillStyle = '#fff6e4'; for (let k = 0; k < 46; k++) { const x = (k * 197.3 % 1) * 0 + ((k * 0.6180339 % 1) * W), y = 40 + ((k * 0.7548776 % 1) * 640), r = 1.2 + (k % 3) * .9; c.globalAlpha = na * (.5 + .5 * Math.sin(t * 3 + k)); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.restore();
    for (const [i, B] of L.boats.entries()) { const dy = Math.sin(t * 1.4 + i) * 3; c.save(); c.translate(0, dy); c.globalCompositeOperation = 'lighter'; glowAt(c, B.x + 22 * B.s, B.y - 30 * B.s, 110 * B.s, .5 * na); c.restore(); c.save(); c.translate(0, dy); flame(c, B.x + 22 * B.s, B.y - 18 * B.s, B.s * (.9 + .1 * Math.sin(t * 9 + i)), na); c.restore(); }
    const b = o.boita ?? 0;
    if (b > 0) { c.save(); c.globalCompositeOperation = 'lighter'; glowAt(c, 540, 1120 + (1 - b) * 180, 420, .38 * b); c.restore();
      c.save(); c.globalAlpha = b; c.translate(0, (1 - b) * 180); drawList(c, L.boita, b); c.restore();
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .35 * b; c.translate(0, (1 - b) * 180); drawList(c, L.boita, b); c.restore(); }
  }
}
