// Ink wash (Opuscar ink-wash engine + Ma Yuan's offset composition): the river, the heron, the moons.
// The egret is never painted: its body is the bare paper, held by a few contour strokes (restraint as emptiness).
// One colour only besides ink: vermilion (the fish, the seal, the dawn, the lamps).
import { mk, draw, mass, blot, TONE, reseed } from '/styles/ink-wash/demo/ink.js';
import { makeComp, layerSet } from '/styles/ink-wash/demo/comp.js';
import { reed, ripple } from '/styles/ink-wash/demo/land.js';

export const W = 1080, H = 1920;
const VERM = [176, 46, 34];
let GLC, comp, A;
export function initInk() { GLC = document.createElement('canvas'); GLC.width = W; GLC.height = H; comp = makeComp(GLC); A = layerSet(W, H); }
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const S = (pts, o) => mk(pts, o);

// ---------- the egret ----------
// pose: look 0 = beak down at the fish, 1 = beak lifted (lets it go); front 0..1 = head turned to the camera
export function heron(L, x0, y0, s, pose = {}) {
  const P = (x, y, p = 1) => [x0 + x * s, y0 + y * s, p], look = pose.look ?? 0, front = pose.front ?? 0, a = pose.a ?? 1;
  // standing leg (the other folded up under the body)
  draw(L, S([P(10, -210), P(6, -120), P(2, -40), P(0, 0)], { w: 5.2 * s, tone: TONE.jiao, dry: .15, wet: .1, prof: 'even', seed: 11 }), 1, a);
  draw(L, S([P(30, -205), P(66, -150), P(40, -128), P(20, -132)], { w: 4.6 * s, tone: TONE.jiao, dry: .2, wet: .1, prof: 'even', seed: 12 }), 1, a);
  // body: back line (heavy), belly line (pale): the white between them is paper
  draw(L, S([P(-58, -360), P(-10, -378), P(70, -346), P(132, -282), P(168, -236)], { w: 7.5 * s, tone: TONE.nong, dry: .35, wet: .35, prof: 'brush', seed: 13 }), 1, a);
  draw(L, S([P(-72, -322), P(-48, -262), P(20, -214), P(110, -212), P(158, -228)], { w: 4.2 * s, tone: TONE.dan, dry: .45, wet: .3, prof: 'tip', seed: 14 }), 1, a);
  // folded wing: long dry feather strokes toward the tail
  for (let k = 0; k < 4; k++) draw(L, S([P(10 + k * 12, -350 + k * 10), P(90 + k * 10, -300 + k * 6), P(176 - k * 6, -238 + k * 4)], { w: (4.5 - k * .6) * s, tone: TONE.zhong * (1 - k * .12), dry: .7, wet: .15, prof: 'tip', seed: 20 + k }), 1, a);
  // neck: an S curve, back of the neck heavy, throat pale
  const nx = lerp(0, 18, front);
  draw(L, S([P(-50, -364), P(-88, -412), P(-64 + nx, -470), P(-96 + nx * 1.6, -526), P(-112 + nx * 2, -560)], { w: 5.6 * s, tone: TONE.nong, dry: .3, wet: .3, prof: 'brush', seed: 30 }), 1, a);
  draw(L, S([P(-80, -330), P(-112, -392), P(-92 + nx, -456), P(-122 + nx * 1.6, -512), P(-132 + nx * 2, -546)], { w: 3.4 * s, tone: TONE.dan, dry: .5, wet: .25, prof: 'tip', seed: 31 }), 1, a);
  // head
  const hx = -122 + nx * 2, hy = -566;
  if (pose.glance) {   // a glance back over the shoulder: the head turned to face right, beak level, one eye on us
    draw(L, S([P(hx - 22, hy + 14), P(hx - 8, hy - 8), P(hx + 16, hy - 10), P(hx + 30, hy + 2)], { w: 6 * s, tone: TONE.nong, dry: .3, wet: .3, prof: 'lens', seed: 32 }), 1, a);
    draw(L, S([P(hx - 14, hy - 4), P(hx - 70, hy - 26), P(hx - 128, hy - 18)], { w: 1.6 * s, tone: TONE.zhong, dry: .6, wet: .1, prof: 'tip', seed: 33 }), 1, a);
    draw(L, S([P(hx + 26, hy - 2), P(hx + 54, hy + 6), P(hx + 86, hy + 14)], { w: 4.4 * s, tone: TONE.jiao, dry: .1, wet: .05, prof: 'cone', seed: 35 }), 1, a);
    draw(L, S([P(hx + 26, hy + 5), P(hx + 54, hy + 11), P(hx + 82, hy + 16)], { w: 2.4 * s, tone: TONE.zhong, dry: .2, wet: .05, prof: 'cone', seed: 36 }), 1, a);
    blot(L.dry, x0 + (hx + 14) * s, y0 + (hy - 1) * s, 3.4 * s, .95 * a);
    L.col.globalAlpha = .55 * a; L.col.fillStyle = 'rgb(214,170,40)'; L.col.beginPath(); L.col.ellipse(x0 + (hx + 20) * s, y0 + (hy + 1) * s, 7 * s, 3 * s, -.2, 0, 7); L.col.fill(); L.col.globalAlpha = 1;
  } else if (front < .5) {
    draw(L, S([P(hx + 22, hy + 14), P(hx + 8, hy - 8), P(hx - 16, hy - 10), P(hx - 30, hy + 2)], { w: 6 * s, tone: TONE.nong, dry: .3, wet: .3, prof: 'lens', seed: 32 }), 1, a);
    // two nuptial plumes trailing from the nape
    draw(L, S([P(hx + 14, hy - 4), P(hx + 70, hy - 26), P(hx + 128, hy - 18)], { w: 1.6 * s, tone: TONE.zhong, dry: .6, wet: .1, prof: 'tip', seed: 33 }), 1, a);
    draw(L, S([P(hx + 12, hy), P(hx + 62, hy - 10), P(hx + 112, hy + 4)], { w: 1.3 * s, tone: TONE.dan, dry: .6, wet: .1, prof: 'tip', seed: 34 }), 1, a);
    // the beak: a dagger, lowered toward the fish (look 0) or lifted level (look 1)
    const by = lerp(46, -2, look), bx = lerp(-74, -92, look);
    draw(L, S([P(hx - 26, hy - 2), P(hx + bx * .55, hy + by * .45 - 2), P(hx + bx, hy + by)], { w: 4.4 * s, tone: TONE.jiao, dry: .1, wet: .05, prof: 'cone', seed: 35 }), 1, a);
    draw(L, S([P(hx - 26, hy + 5), P(hx + bx * .55, hy + by * .45 + 3), P(hx + bx + 4, hy + by + 2)], { w: 2.4 * s, tone: TONE.zhong, dry: .2, wet: .05, prof: 'cone', seed: 36 }), 1, a);
    blot(L.dry, x0 + (hx - 14) * s, y0 + (hy - 1) * s, 3.2 * s, .95 * a);
    L.col.globalAlpha = .55 * a; L.col.fillStyle = 'rgb(214,170,40)'; L.col.beginPath(); L.col.ellipse(x0 + (hx - 20) * s, y0 + (hy + 1) * s, 7 * s, 3 * s, .2, 0, 7); L.col.fill(); L.col.globalAlpha = 1;
  } else {   // looking at us: a round head, the beak foreshortened into a short wedge, both eyes
    draw(L, S([P(hx + 20, hy + 8), P(hx + 14, hy - 14), P(hx - 10, hy - 18), P(hx - 22, hy + 4)], { w: 6 * s, tone: TONE.nong, dry: .3, wet: .3, prof: 'lens', seed: 37 }), 1, a);
    draw(L, S([P(hx - 2, hy + 6), P(hx - 3, hy + 28), P(hx - 4, hy + 46)], { w: 7.5 * s, tone: TONE.jiao, dry: .1, wet: .05, prof: 'cone', seed: 38 }), 1, a);
    blot(L.dry, x0 + (hx - 15) * s, y0 + (hy - 3) * s, 3 * s, .95 * a); blot(L.dry, x0 + (hx + 11) * s, y0 + (hy - 3) * s, 3 * s, .95 * a);
    draw(L, S([P(hx + 12, hy - 8), P(hx + 62, hy - 34), P(hx + 118, hy - 26)], { w: 1.5 * s, tone: TONE.zhong, dry: .6, wet: .1, prof: 'tip', seed: 39 }), 1, a);
  }
}
// its reflection: broken pale strokes under the feet
function reflection(L, x0, y0, s, a = 1) {
  for (let k = 0; k < 3; k++) { const y = y0 + 18 + k * 22 * s, w = (60 - k * 6) * s, ox = Math.sin(k * 1.7) * 10 * s;
    draw(L, S([[x0 - w * .5 + ox + 40 * s, y], [x0 + ox + 40 * s, y + 2], [x0 + w * .5 + ox + 40 * s, y]], { w: 3 * s, tone: TONE.dan * (1 - k * .1), dry: .6, wet: .5, prof: 'tip', seed: 70 + k }), 1, a * .8); }
}
function fish(L, x, y, s, dir = -1, a = .8) {
  const c = L.col; c.save(); c.translate(x, y); c.scale(dir * s, s); c.globalAlpha = a; c.fillStyle = `rgb(${VERM})`;
  c.beginPath(); c.moveTo(-34, 0); c.quadraticCurveTo(-8, -15, 22, -3); c.lineTo(40, -14); c.quadraticCurveTo(34, 0, 40, 14); c.lineTo(22, 3); c.quadraticCurveTo(-8, 15, -34, 0); c.fill();
  c.globalAlpha = a * .7; c.beginPath(); c.moveTo(-4, -9); c.quadraticCurveTo(6, -20, 14, -8); c.fill(); c.restore();
  ripple(L, x + 50 * s * -dir, y - 6, 26 * s, .35, 5, .25, 2.2);
}
function waterLines(L, y0, a = 1, seed = 1) {
  const R = (k) => Math.sin(k * 12.9898 + seed) * 43758.5453 % 1;
  for (let k = 0; k < 9; k++) { const y = y0 + k * 58 + (Math.abs(R(k)) * 20), x = 60 + Math.abs(R(k + 3)) * 600, w = 120 + Math.abs(R(k + 7)) * 260;
    draw(L, S([[x, y], [x + w * .5, y + 2], [x + w, y]], { w: 2.4, tone: TONE.qing * 1.6, dry: .7, wet: .3, prof: 'tip', seed: 90 + k + seed }), 1, a); }
}
function farBank(L, a = 1) {
  mass(L.wet, [[-20, 990], [60, 930], [150, 948], [230, 912], [330, 950], [440, 968], [520, 1000], [-20, 1010]], .22 * a, 6, 3, [0, 900, 520, 1000, 1, .2]);
  for (let k = 0; k < 14; k++) blot(L.dry, 30 + k * 26 + Math.sin(k) * 8, 930 + Math.cos(k * 1.3) * 14, 4 + (k % 3), .3 * a, 0, .7, k);
}
function cornerBranch(L, a = 1) {   // Ma Yuan's corner: a branch reaching in from the upper left
  draw(L, S([[-30, 210], [120, 236], [260, 228], [372, 262]], { w: 15, tone: TONE.nong, dry: .5, wet: .3, prof: 'brush', seed: 101 }), 1, a);
  draw(L, S([[150, 232], [210, 300], [236, 380]], { w: 6, tone: TONE.zhong, dry: .5, wet: .2, prof: 'tip', seed: 102 }), 1, a);
  draw(L, S([[290, 238], [340, 300], [352, 350]], { w: 5, tone: TONE.zhong, dry: .5, wet: .2, prof: 'tip', seed: 103 }), 1, a);
  for (let k = 0; k < 22; k++) { const x = 60 + k * 15 + Math.sin(k * 2.1) * 12, y = 250 + (k % 5) * 26 + Math.cos(k) * 10;
    draw(L, S([[x, y], [x + 6, y + 22], [x + 2, y + 44]], { w: 7, tone: TONE.dan + (k % 3) * .1, dry: .3, wet: .5, prof: 'lens', seed: 110 + k }), 1, a * .9); }
}
function reeds(L, a = 1) {   // a slim cluster at the lower-left edge: stems and a few short leaves, kept clear of the captions
  const R = k => Math.abs(Math.sin(k * 91.7) * 4375.5) % 1;
  [[34, 1920, 640, .1], [70, 1920, 560, .16], [104, 1920, 700, .06], [12, 1920, 480, .2]].forEach(([x, y, h, b], i) => {
    draw(L, S([[x, y], [x + b * h * .2, y - h * .5], [x + b * h * .45, y - h]], { w: 3.2, tone: TONE.nong * (.85 + R(i) * .15), dry: .35, wet: .3, prof: 'tip', seed: 400 + i }), 1, a);
    for (let k = 0; k < 2; k++) { const u = .35 + k * .25 + R(i * 3 + k) * .1, px = x + b * h * .2 * u * 2, py = y - h * u, d = (i + k) % 2 ? -1 : 1, l = 70 + R(i + k * 7) * 60;
      draw(L, S([[px, py], [px + d * l * .5, py - l * .5], [px + d * l * .8, py - l * .3]], { w: 6, tone: TONE.zhong, dry: .4, wet: .4, prof: 'lens', seed: 420 + i * 5 + k }), 1, a); }
    draw(L, S([[x + b * h * .45, y - h], [x + b * h * .45 + 8, y - h - 22], [x + b * h * .45 + 18, y - h - 8]], { w: 7, tone: TONE.dan, dry: .7, wet: .3, prof: 'lens', seed: 440 + i }), 1, a);
  });
}
function riverWash(L, y0, a = 1) {   // the river: a faint wash that deepens toward the viewer, broken by mist
  mass(L.wet, [[-40, y0], [1120, y0 - 10], [1120, 1920], [-40, 1920]], .1 * a, 10, 9, [0, y0, 0, 1920, .25, 1]);
}
function moon(L, x, y, r, lit, a = 1, seed = 1, p = 1) {
  const c0 = L.col; const hg = c0.createRadialGradient(x, y, r * .6, x, y, r * 1.9); hg.addColorStop(0, `rgba(255,248,228,${.5 * a * Math.min(1, p * 1.5)})`); hg.addColorStop(1, 'rgba(255,248,228,0)'); c0.fillStyle = hg; c0.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);   // waxing: the dark limb on the left, washed in ink; the rim drawn in one pale stroke
  const pts = []; for (let i = 0; i <= 26; i++) { const t = -1.9 + i / 26 * Math.PI * 1.96; pts.push([x + Math.cos(t) * r, y + Math.sin(t) * r]); }
  draw(L, S(pts, { w: 3.2, tone: TONE.zhong, dry: .5, wet: .4, prof: 'brush', seed }), p, a);
  if (lit < .995 && p > .6) { const k = 1 - lit, c = L.wet; c.save(); c.beginPath(); c.arc(x, y, r - 2, 0, 7); c.clip(); c.globalAlpha = .5 * a * (p - .6) / .4; c.fillStyle = '#000';
    const tw = r * Math.abs(1 - 2 * k); c.beginPath(); c.arc(x, y, r, Math.PI / 2, 3 * Math.PI / 2); c.ellipse(x, y, Math.max(.1, tw), r, 0, 3 * Math.PI / 2, Math.PI / 2, true); c.fill(); c.restore(); }
}
function bloom(L, x, y, r, a) { const c = L.wet; for (let k = 0; k < 4; k++) { c.globalAlpha = a * (.13 - k * .025); c.fillStyle = '#000'; c.beginPath(); c.ellipse(x + Math.sin(k * 2) * r * .1, y + k * r * .08, r * (1 + k * .25), r * (.9 + k * .2), k, 0, 7); c.fill(); } c.globalAlpha = 1; }

function seal(L, cx, cy, sz, txt, font, a = 1) {   // vermilion seal; the characters are cut out of it (paper shows through)
  const c = L.col; c.save(); const sc = 1 + .25 * (1 - Math.min(1, a * 1.5)); c.translate(cx, cy); c.scale(sc, sc); c.translate(-cx, -cy); c.globalAlpha = .92 * Math.min(1, a); c.fillStyle = `rgb(${VERM})`;
  c.beginPath(); c.roundRect(cx - sz / 2, cy - sz / 2, sz, sz, 6); c.fill();
  c.globalCompositeOperation = 'destination-out'; c.globalAlpha = 1; c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, cx, cy + sz * .04);
  c.lineWidth = 3; c.strokeRect(cx - sz / 2 + 6, cy - sz / 2 + 6, sz - 12, sz - 12); c.restore();
}

// ---------- the animated ink world: one river, one camera (world = S1 screen coordinates) ----------
// st: { cam:{cx,cy,z}, title, seal, branch, bank, river, reeds, heron:{x,y,s,look,glance,a}, refl, fish:{x,y,a}, moons:[{p,lit,gone}],
//       mseal, sun, diyas:{a,dx}, extra }
export function inkWorld(ctx, t, st) {
  A.clear(); reseed(7);
  const cam = st.cam || { cx: 540, cy: 960, z: 1 }, z = cam.z, tx = 540 - cam.cx * z, ty = 960 - cam.cy * z;
  A.xf(z, tx, ty);
  const L = A.ink, v = (k, d = 1) => st[k] ?? d;
  if (v('sun', 0) > 0) { const a = v('sun', 0), c = L.col; c.save(); let g = c.createRadialGradient(330, 958, 30, 330, 958, 150); g.addColorStop(0, `rgba(${VERM},${.16 * a})`); g.addColorStop(1, `rgba(${VERM},0)`); c.fillStyle = g; c.fillRect(170, 800, 320, 320);
    c.fillStyle = `rgba(${VERM},${.5 * a})`; c.beginPath(); c.arc(330, 958, 46, 0, 7); c.fill();
    for (let k = 0; k < 7; k++) { const w = 54 - k * 6, y = 1030 + k * 30, ox = Math.sin(k * 2.3 + t * .8) * 8; c.globalAlpha = (.34 - k * .04) * a; c.fillStyle = `rgb(${VERM})`; c.beginPath(); c.ellipse(330 + ox, y, w, 3.2, 0, 0, 7); c.fill(); } c.restore(); }
  if (v('bank') > 0) farBank(L, v('bank'));
  if (v('branch') > 0) cornerBranch(L, v('branch'));
  if (v('river') > 0) { riverWash(L, 1010, v('river')); waterLines(L, 1240, .9 * v('river'), 1); }
  if (v('reeds') > 0) reeds(L, v('reeds'));
  // moons, brushed in one by one (p = paint progress), Dvadashi's dissolving (gone)
  (st.moons || []).forEach((m, i) => { const x = [190, 360, 540, 720, 890][i], y = [610, 560, 540, 560, 610][i] - 1220;
    if (m.p > 0) moon(L, x, y, 58, m.lit, (1 - (m.gone || 0)), 50 + i, m.p);
    if (m.gone > 0) bloom(L, x, y + 20 * m.gone, 60 + 70 * m.gone, Math.sin(Math.PI * Math.min(1, m.gone)) * .9); });
  if (v('mseal', 0) > 0) seal(L, 540, -320, 128, '୪', '700 92px "OdiaSerif"', v('mseal', 0));
  // diyas afloat (S9)
  if (v('diyas', 0) > 0) { const a = v('diyas', 0), dx = v('diyaDx', 0);
    [[230, 1128, .95], [400, 1182, 1.05], [520, 1110, .85], [330, 1250, 1.12]].forEach(([x0, y, s], i) => { const x = x0 + dx * (1 + i * .15) + Math.sin(t * .6 + i) * 6, yy = y + Math.sin(t * .9 + i * 2) * 3;
      draw(L, S([[x - 26 * s, yy - 6 * s], [x - 12 * s, yy + 9 * s], [x + 12 * s, yy + 9 * s], [x + 30 * s, yy - 8 * s]], { w: 11 * s, tone: TONE.nong, dry: .25, wet: .35, prof: 'lens', seed: 300 + i }), 1, a);
      const cc = L.col, fy = yy - 18 * s, fl = 1 + .08 * Math.sin(t * 9 + i * 3); cc.save(); cc.globalAlpha = a; let gg = cc.createRadialGradient(x, fy, 2, x, fy, 56 * s); gg.addColorStop(0, 'rgba(238,150,46,.5)'); gg.addColorStop(1, 'rgba(238,150,46,0)'); cc.fillStyle = gg; cc.fillRect(x - 60 * s, fy - 60 * s, 120 * s, 120 * s);
      cc.fillStyle = 'rgba(244,176,60,.95)'; cc.beginPath(); cc.moveTo(x, fy - 15 * s * fl); cc.quadraticCurveTo(x + 7 * s, fy - 2 * s, x, fy + 6 * s); cc.quadraticCurveTo(x - 7 * s, fy - 2 * s, x, fy - 15 * s * fl); cc.fill();
      cc.fillStyle = `rgba(${VERM},.9)`; cc.beginPath(); cc.ellipse(x, fy + s, 2.6 * s, 4.5 * s, 0, 0, 7); cc.fill();
      for (let k = 0; k < 4; k++) { cc.globalAlpha = a * (.3 - k * .06); cc.fillStyle = 'rgb(238,150,46)'; cc.beginPath(); cc.ellipse(x + Math.sin(k * 2 + i + t * 2) * 4, yy + 22 * s + k * 13 * s, (9 - k * 1.5) * s, 2.2 * s, 0, 0, 7); cc.fill(); } cc.restore(); }); }
  // the heron (two poses can be blended for a turn of the head)
  const h = st.heron; if (h && h.a > 0) {
    if (h.glance > 0 && h.glance < 1) { heron(L, h.x, h.y, h.s, { look: h.look, a: h.a * (1 - h.glance) }); heron(L, h.x, h.y, h.s, { look: h.look, glance: 1, a: h.a * h.glance }); }
    else heron(L, h.x, h.y, h.s, { look: h.look, glance: h.glance >= 1 ? 1 : 0, a: h.a });
    if (v('refl') > 0) { reflection(L, h.x, h.y, h.s, v('refl')); ripple(L, h.x + 10 * h.s, h.y + 2, 46 * h.s, .7 * v('refl'), 3, .22, 2.6); } }
  if (st.fish && st.fish.a > 0) fish(L, st.fish.x, st.fish.y, 1, -1, .82 * st.fish.a);
  if (v('seal', 0) > 0) seal(L, 520, 532, 96, 'ପଞ୍ଚୁକ', '700 25px "OdiaSerif"', v('seal', 0));
  comp(A, null, { bleed: 5, rim: .8, vig: .25, warm: .55, paper: [-540 + cam.cx * z, -960 + cam.cy * z, z] }); ctx.drawImage(GLC, 0, 0);
  if (v('title', 0) > 0) { ctx.save(); ctx.globalAlpha = v('title', 0); ctx.setTransform(z, 0, 0, z, tx, ty); ctx.font = '600 64px "Cinzel"'; ctx.letterSpacing = '16px'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(38,33,29,.92)'; ctx.fillText('PANCHUKA', 520, 440); ctx.restore(); }
  if (v('five', 0) > 0) { ctx.save(); ctx.globalAlpha = .5 * v('five', 0); ctx.setTransform(z, 0, 0, z, tx, ty); ctx.font = '400 150px "OdiaSerif"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a3430'; ctx.fillText('୫', 330, -315);
    ctx.globalAlpha = .6 * v('arrow', 0); ctx.strokeStyle = '#3a3430'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(400, -315); ctx.lineTo(452, -315); ctx.moveTo(436, -330); ctx.lineTo(452, -315); ctx.lineTo(436, -300); ctx.stroke(); ctx.restore(); }
}
function compose(ctx, o = {}) { comp(A, null, { bleed: 5, rim: .8, vig: .25, warm: .55, paper: [0, 0, 1], ...o }); ctx.drawImage(GLC, 0, 0); }
export function caption(ctx, lines, y, a = 1, col = '#2b2520') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = 'italic 500 52px "CormorantG"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  lines.forEach((l, i) => ctx.fillText(l, 510, y + (i - (lines.length - 1)) * 62)); ctx.restore();
}

// ---------- S1: the proverb ----------
export function inkS1(ctx, t, o = {}) {
  A.clear(); reseed(7);
  farBank(A.ink); cornerBranch(A.ink); riverWash(A.ink, 1010); waterLines(A.ink, 1240, .9, 1); reeds(A.ink);
  heron(A.ink, 640, 1292, 1.0, { look: o.look ?? 1 }); reflection(A.ink, 640, 1292, 1.0); ripple(A.ink, 650, 1294, 46, .7, 3, .22, 2.6);
  fish(A.ink, o.fx ?? 352, 1352, 1.0, -1, .82);
  seal(A.ink, 520, 512, 96, 'ପଞ୍ଚୁକ', '700 25px "OdiaSerif"');
  compose(ctx);
  ctx.save(); ctx.font = '600 64px "Cinzel"'; ctx.letterSpacing = '16px'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(38,33,29,.92)'; ctx.fillText('PANCHUKA', 520, 420); ctx.restore();
  caption(ctx, ['Even the heron spares the fish.'], 1450);
}
export function sealOverlay(ctx) {}   // (seals are part of the ink layer)

// ---------- S2: five moons, one dissolves ----------
export function inkS2(ctx, t, o = {}) {
  A.clear(); reseed(9);
  const xs = [190, 360, 540, 720, 890], ys = [610, 560, 540, 560, 610], lit = [.86, .92, .96, .99, 1], gone = o.gone ?? .7;
  xs.forEach((x, i) => { if (i === 1) { moon(A.ink, x, ys[i], 58, lit[i], 1 - gone, 50 + i); if (gone > 0) bloom(A.ink, x, ys[i] + 20 * gone, 60 + 70 * gone, gone * (1 - gone * .5)); } else moon(A.ink, x, ys[i], 58, lit[i], 1, 50 + i); });
  // their reflections in the river below
  riverWash(A.ink, 1150, .8); waterLines(A.ink, 1180, .7, 3);
  xs.forEach((x, i) => { const a = i === 1 ? 1 - gone : 1; for (let k = 0; k < 4; k++) draw(A.ink, S([[x - 24 + k * 3, 1240 + k * 30], [x, 1242 + k * 30], [x + 24 - k * 3, 1240 + k * 30]], { w: 3, tone: TONE.dan, dry: .6, wet: .4, prof: 'tip', seed: 200 + i * 9 + k }), 1, a * .8); });
  heron(A.ink, 900, 1420, .5, { look: 1 }); reflection(A.ink, 900, 1420, .5, .7);
  seal(A.ink, 540, 900, 128, '୪', '700 92px "OdiaSerif"');
  compose(ctx);
  ctx.save(); ctx.globalAlpha = .5; ctx.font = '400 150px "OdiaSerif"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a3430'; ctx.fillText('୫', 330, 905);
  ctx.globalAlpha = .6; ctx.strokeStyle = '#3a3430'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(400, 905); ctx.lineTo(452, 905); ctx.moveTo(436, 890); ctx.lineTo(452, 905); ctx.lineTo(436, 920); ctx.stroke(); ctx.restore();
  caption(ctx, ['This year, not five days.', 'Four.'], 1450);
}

// ---------- S9: dawn, four lamps, the heron looks at us ----------
export function inkS9(ctx, t, o = {}) {
  A.clear(); reseed(11);
  // a low dawn sun: a pale vermilion disc in the mist, its reflection broken into short strokes
  const c = A.ink.col; c.save(); let g = c.createRadialGradient(330, 958, 30, 330, 958, 150); g.addColorStop(0, `rgba(${VERM},.16)`); g.addColorStop(1, `rgba(${VERM},0)`); c.fillStyle = g; c.fillRect(170, 800, 320, 320);
  c.fillStyle = `rgba(${VERM},.5)`; c.beginPath(); c.arc(330, 958, 46, 0, 7); c.fill(); c.restore();
  for (let k = 0; k < 7; k++) { const w = 54 - k * 6, y = 1030 + k * 30, ox = Math.sin(k * 2.3) * 8; c.globalAlpha = .34 - k * .04; c.fillStyle = `rgb(${VERM})`; c.beginPath(); c.ellipse(330 + ox, y, w, 3.2, 0, 0, 7); c.fill(); } c.globalAlpha = 1;
  farBank(A.ink, .9); cornerBranch(A.ink, .9); riverWash(A.ink, 1010, .9); waterLines(A.ink, 1180, .8, 5); reeds(A.ink);
  // four clay diyas afloat: a dark bowl, a flame, a warm halo and a wavering reflection
  [[300, 1168, .95], [470, 1222, 1.05], [610, 1150, .85], [400, 1300, 1.12]].forEach(([x, y, s], i) => {
    draw(A.ink, S([[x - 26 * s, y - 6 * s], [x - 12 * s, y + 9 * s], [x + 12 * s, y + 9 * s], [x + 30 * s, y - 8 * s]], { w: 11 * s, tone: TONE.nong, dry: .25, wet: .35, prof: 'lens', seed: 300 + i }));
    const cc = A.ink.col, fy = y - 18 * s; let gg = cc.createRadialGradient(x, fy, 2, x, fy, 56 * s); gg.addColorStop(0, 'rgba(238,150,46,.5)'); gg.addColorStop(1, 'rgba(238,150,46,0)'); cc.fillStyle = gg; cc.fillRect(x - 60 * s, fy - 60 * s, 120 * s, 120 * s);
    cc.fillStyle = 'rgba(244,176,60,.95)'; cc.beginPath(); cc.moveTo(x, fy - 15 * s); cc.quadraticCurveTo(x + 7 * s, fy - 2 * s, x, fy + 6 * s); cc.quadraticCurveTo(x - 7 * s, fy - 2 * s, x, fy - 15 * s); cc.fill();
    cc.fillStyle = `rgba(${VERM},.9)`; cc.beginPath(); cc.ellipse(x, fy + 1 * s, 2.6 * s, 4.5 * s, 0, 0, 7); cc.fill();
    for (let k = 0; k < 4; k++) { cc.globalAlpha = .3 - k * .06; cc.fillStyle = 'rgb(238,150,46)'; cc.beginPath(); cc.ellipse(x + Math.sin(k * 2 + i) * 4, y + 22 * s + k * 13 * s, (9 - k * 1.5) * s, 2.2 * s, 0, 0, 7); cc.fill(); } cc.globalAlpha = 1;
  });
  heron(A.ink, 760, 1292, .92, { look: .6, glance: 1 }); reflection(A.ink, 760, 1292, .92);
  compose(ctx);
  caption(ctx, ['If the heron can keep five days…', 'can’t we keep four?'], 1455);
}
