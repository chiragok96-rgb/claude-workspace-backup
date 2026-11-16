import { DUR, W, H, SENT, CUE, CAP, PAL } from './timeline.js';
import { initLightbox, sheet, drawStack, glow, LW, LH } from './lightbox.js';
import * as M from './motifs.js';
import { mulberry } from './engine_wc.js';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a)), ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const back = (t, s = 1.4) => { t = clamp(t); return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
const Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const BUF = [mk(), mk()];
const full = m => m.fillRect(-LW / 2, -LH / 2, LW, LH);
const flick = (t, k = 0) => 1 + .05 * Math.sin(7.3 * t + k) * Math.sin(3.1 * t + k * 2);

// sheet point → screen (same maths as drawStack's place)
function scr(L, cam, x, y) { const p = .45 + .55 * L.depth, z = 1 + (cam.z - 1) * p; return [W / 2 + z * (x + (L.ox || 0) - cam.x * p), H / 2 + z * (y + (L.oy || 0) - cam.y * p), z]; }
function flame(c, x, y, z, a, t, k = 0) {
  if (a <= 0) return; const f = flick(t * 1.7, k);
  glow(c, x, y, 26 * z * f, 'rgba(255,170,80,1)', .5 * a);
  c.save(); c.globalAlpha = a; c.fillStyle = '#ffe2a8'; c.beginPath(); c.moveTo(x, y - 22 * z * f); c.quadraticCurveTo(x + 9 * z, y - 2 * z, x, y + 6 * z); c.quadraticCurveTo(x - 9 * z, y - 2 * z, x, y - 22 * z * f); c.fill(); c.restore();
}

let A, B, C, D, E, F, G, HS;
const NIGHT = ['#151a44', '#2a3a6e', '#1b2550', '#0a0d1e'], AMBER = ['#f0c890', '#c98a52', '#7a3e22', '#1e0e08'];
function build() {
  // A · the year dial
  A = [sheet('#7a5aa8', full, { depth: 0, trans: .95 }), sheet('#0a0c1c', full, { depth: .6, trans: .05, cut: M.dialCuts, rim: '#c9a0ff', rimA: .25 })];
  // B · the sanctum curtain and the feet
  const FX = 0, FY = 470, FS = 1.55;
  B = [
    sheet('#f0c48a', full, { depth: 0, trans: .95 }),
    sheet('#2a0e0a', full, { depth: .3, trans: .1, cut: m => { m.beginPath(); m.ellipse(0, 200, 470, 520, 0, 0, 7); m.fill(); } }),
    sheet('#f7cfa0', m => M.feet(m, FX, FY, FS), { depth: .45, trans: .95, rim: '#fff0d0' }),
    sheet(PAL.alta, m => M.feetAlta(m, FX, FY, FS), { depth: .46, trans: .7, cut: m => M.feetCutsAlta(m, FX, FY, FS) }),
    sheet('#e2a43c', m => M.anklets(m, FX, FY, FS), { depth: .47, trans: .6 }),
    sheet('#5a1016', m => M.hem(m, 0, 200, 1.25, 310), { depth: .55, trans: .25, cut: m => M.hemCuts(m, 0, 200, 1.25, 310) }),
    sheet('#d99a32', m => M.hemBorder(m, 0, 200, 1.25, 310), { depth: .56, trans: .55, cut: m => M.hemBorderCuts(m, 0, 200, 1.25, 310) }),
    sheet('#140706', m => { m.fillRect(-LW / 2, 560, LW, LH); for (let k = 0; k < 9; k++) { const x = -560 + k * 140; m.beginPath(); m.moveTo(x - 60, 560); m.quadraticCurveTo(x, 490, x + 60, 560); m.fill(); } }, { depth: .8, trans: .03 }),
    sheet('#3c0b10', m => m.fillRect(-LW / 2, -LH / 2, LW / 2, LH), { depth: 1, trans: .12, cut: m => { for (let k = 0; k < 40; k++) { m.beginPath(); m.arc(-40, -1150 + k * 60, 9, 0, 7); m.fill(); } } }),
    sheet('#3c0b10', m => m.fillRect(0, -LH / 2, LW / 2, LH), { depth: 1, trans: .12, cut: m => { for (let k = 0; k < 40; k++) { m.beginPath(); m.arc(40, -1150 + k * 60, 9, 0, 7); m.fill(); } } }),
  ];
  B.feet = [FX, FY - 100 * FS];
  // C · Kartika night: nine moons of the bright fortnight, diyas
  C = [
    sheet(NIGHT[0], full, { depth: 0, trans: .9 }),
    sheet(NIGHT[1], m => { m.beginPath(); m.moveTo(-LW / 2, 360); for (let x = -LW / 2; x <= LW / 2; x += 40) m.lineTo(x, 330 - 50 * Math.sin(x / 180) - 20 * Math.sin(x / 61)); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill();
      for (const [x, h] of [[-470, 260], [-380, 200], [360, 240], [470, 300]]) { M.limb(m, [[x, 340], [x + 10, 340 - h]], 9); for (let k = 0; k < 7; k++) { const a = -Math.PI + k / 6 * Math.PI; M.limb(m, [[x + 10, 340 - h], [x + 10 + Math.cos(a) * 70, 340 - h + Math.sin(a) * 30 + 26]], 7); } } }, { depth: .3, trans: .5 }),
    sheet(NIGHT[2], m => { m.fillRect(-LW / 2, 470, LW, LH); M.temple(m, 120, 480, .55); for (const x of [-420, -260, -140]) { m.beginPath(); m.moveTo(x - 70, 480); m.lineTo(x - 70, 400); m.lineTo(x, 340); m.lineTo(x + 70, 400); m.lineTo(x + 70, 480); m.fill(); } },
      { depth: .55, trans: .3, cut: m => { M.templeCuts(m, 120, 480, .55); for (const x of [-420, -260, -140]) m.fillRect(x - 14, 420, 28, 40); } }),
    sheet(NIGHT[3], m => { m.fillRect(-LW / 2, 600, LW, LH); for (let k = 0; k < 9; k++) M.diya(m, -440 + k * 110, 600, 1.1); }, { depth: 1, trans: .03 }),
  ];
  // D · the amla tree and the women
  const R = mulberry(17), R2 = mulberry(19), R3 = mulberry(23);
  const TX = 80, TB = 560, TS = 1.0, DP = {};
  D = [
    sheet('#131b46', full, { depth: 0, trans: .9 }),
    sheet('#22305e', m => { m.fillRect(-LW / 2, 420, LW, LH); M.woman(m, 470, 430, .45, -1, 'none'); M.girl(m, 540, 430, .42); M.woman(m, 410, 430, .5, -1, 'none'); }, { depth: .25, trans: .5 }),
    sheet('#132a22', m => M.amla(m, TX, TB, TS, R), { depth: .55, trans: .35, cut: m => M.amlaCuts(m, TX, TB, TS, R2) }),
    sheet('#0c0f1e', m => { DP.lampA = M.woman(m, -360, 580, 1.0, 1, 'lamp'); DP.hand = M.woman(m, -90, 580, 1.0, 1, 'thread'); DP.lampC = M.woman(m, 420, 580, 1.0, -1, 'lamp'); }, { depth: .8, trans: .05, rim: '#ffb46a', rimA: .7 }),
    sheet('#05060d', m => { m.fillRect(-LW / 2, 610, LW, LH); for (let k = 0; k < 7; k++) M.diya(m, -480 + k * 160, 612, 1); }, { depth: 1, trans: .02 }),
  ];
  Object.assign(D, DP); D.fruit = M.amlaFruit(TX, TB, TS, R3); D.trunk = [TX, TB];
  // E · Puri's sea → Sakshigopal
  E = [
    sheet('#141c44', full, { depth: 0, trans: .9 }),
    sheet('#2c3c74', m => { for (let r = 0; r < 6; r++) { const y = 260 + r * 46; m.beginPath(); m.moveTo(-LW / 2, y + 30); for (let x = -LW / 2; x <= LW / 2; x += 70) m.quadraticCurveTo(x + 35, y - 18 + r * 2, x + 70, y + 30); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill(); } }, { depth: .3, trans: .55 }),
    sheet('#121834', m => { M.temple(m, 20, 470, 1.0); m.fillRect(-LW / 2, 470, LW, LH); }, { depth: .55, trans: .3, cut: m => M.templeCuts(m, 20, 470, 1.0) }),
    sheet('#06070e', m => { m.fillRect(-LW / 2, 600, LW, LH); const R = mulberry(5); for (let k = 0; k < 22; k++) { const x = -640 + k * 60 + R() * 20, h = 70 + R() * 40; m.beginPath(); m.arc(x, 600 - h, 22, 0, 7); m.fill(); m.beginPath(); m.ellipse(x, 610 - h * .45, 36, h * .55, 0, 0, 7); m.fill(); } }, { depth: 1, trans: .02 }),
  ];
  E.win = M.templeWindows(20, 470, 1.0);
  // F · the legend sanctum (amber); HS · the same sanctum tonight (indigo)
  const sanctum = (pal, night) => {
    const yb = 230, PP = {};
    const S = [
      sheet(pal[0], full, { depth: 0, trans: .95, cut: night ? m => { m.beginPath(); m.arc(0, -560, 90, 0, 7); m.fill(); } : null }),
      sheet(pal[1], full, { depth: .25, trans: .55, cut: m => {
        m.beginPath(); m.moveTo(-420, 420); m.lineTo(-420, -300);
        for (let k = 1; k <= 7; k++) { const a = Math.PI + k / 7 * Math.PI, c = Math.PI + (k - .5) / 7 * Math.PI; m.quadraticCurveTo(Math.cos(c) * 460, -300 + Math.sin(c) * 400, Math.cos(a) * 420, -300 + Math.sin(a) * 360); }
        m.lineTo(420, 420); m.closePath(); m.fill();
        for (const sx of [-1, 1]) for (let k = 0; k < 10; k++) { const x = sx * 530, y = -620 + k * 110; m.beginPath(); m.moveTo(x, y - 30); m.lineTo(x + 20, y); m.lineTo(x, y + 30); m.lineTo(x - 20, y); m.fill(); }
      } }),
      sheet(pal[2], m => { M.pedestal(m, -165, yb, 1); M.gopinath(m, -165, yb, 1); M.pedestal(m, 165, yb, 1); }, { depth: .5, trans: .2, cut: m => { M.gopinathCuts(m, -165, yb, 1); M.pedestalCuts(m, -165, yb, 1); M.pedestalCuts(m, 165, yb, 1); } }),
      sheet('#f7cfa0', m => M.feet(m, 165, yb - 56, .36, 84), { depth: .5, trans: .95 }), 
      sheet(PAL.alta, m => M.feetAlta(m, 165, yb - 56, .36, 84), { depth: .5, trans: .7 }),
      sheet(pal[2], m => M.radhaTop(m, 165, yb, 1), { depth: .5, trans: .2, cut: m => M.radhaFaceCut(m, 165, yb, 1) }),
      sheet(night ? '#3a1c36' : '#7a2a18', m => M.ghagra(m, 165, yb, 1), { depth: .52, trans: .3, cut: m => M.ghagraCuts(m, 165, yb, 1) }),
      sheet(night ? '#6a1420' : '#8a1a1a', m => M.saree(m, 165, yb, 1), { depth: .52, trans: .3, cut: m => M.sareeCuts(m, 165, yb, 1) }),
      sheet('#e0a030', m => M.sareeBorder(m, 165, yb, 1), { depth: .53, trans: .5 }),
      sheet(night ? '#0c0f1e' : '#2a120a', m => M.girl(m, -310, 330, 1.25), { depth: .82, trans: .06, rim: '#ffb46a', rimA: .7 }),
      sheet(night ? '#0c0f1e' : '#2a120a', m => M.girlArm(m, -310, 330, 1.25), { depth: .82, trans: .06 }),
      sheet(pal[3], m => { PP.p1 = M.priest(m, -400, 360, .95, 1); PP.p2 = M.priest(m, 400, 360, .95, -1); }, { depth: .9, trans: .04, rim: '#ffb46a', rimA: .6 }),
      sheet(pal[3], m => {
        m.fillRect(-LW / 2, 330, LW, LH); m.fillRect(-LW / 2, -LH / 2, 160 + LW / 2 - 700, LH); m.fillRect(540, -LH / 2, 400, LH);
        for (const x of [-480, 480]) { m.fillRect(x - 6, 120, 12, 210); M.diya(m, x - 4, 128, 1.1); m.fillRect(x - 40, 318, 80, 14); }
        m.fillRect(-LW / 2, -LH / 2, LW, LH / 2 - 760);
        for (let k = 0; k < 15; k++) { const x = -LW / 2 + k * 100 + 50; m.beginPath(); m.moveTo(x - 50, -760); m.quadraticCurveTo(x, -680, x + 50, -760); m.fill(); }
        if (night) for (let k = 0; k < 9; k++) M.diya(m, -400 + k * 100, 332, 1);
      }, { depth: 1, trans: .03 }),
    ];
    Object.assign(S, PP); S.yb = yb; S.lampStands = [[-484, 108], [476, 108]];
    S[10].pivot = M.GIRL_SHOULDER(-310, 330, 1.25);
    return S;
  };
  F = sanctum(AMBER, false); HS = sanctum(NIGHT, true);
  // ornaments (besha) tonight: points that glint
  HS.orn = []; { const R = mulberry(41); for (let k = 0; k < 14; k++) { const a = Math.PI * (.15 + k * .05); HS.orn.push([165 + Math.cos(a) * 46, HS.yb - 70 - 350 + Math.sin(a) * 90]); } for (let k = 0; k < 7; k++) HS.orn.push([165 - 36 + k * 12, HS.yb - 70 - 430 - Math.abs(k - 3) * 4]); }
  // G · from the north: hills, river, the palanquin
  G = [
    sheet(AMBER[0], full, { depth: 0, trans: .95 }),
    sheet(AMBER[1], m => { m.beginPath(); m.moveTo(-LW / 2, 200); const R = mulberry(3); for (let x = -LW / 2; x <= LW / 2; x += 70) m.lineTo(x, -40 - R() * 220 * (1 - Math.abs(x) / LW)); m.lineTo(LW / 2, 200); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill(); }, { depth: .2, trans: .6, cut: m => { for (let k = 0; k < 9; k++) { const x = -560 + k * 140; m.beginPath(); m.moveTo(x - 20, -60); m.lineTo(x, -110); m.lineTo(x + 20, -60); m.fill(); } } }),
    sheet('#a0603a', m => { m.fillRect(-LW / 2, 250, LW, LH); for (let k = 0; k < 6; k++) { const x = -600 + k * 240; m.beginPath(); m.ellipse(x, 260, 160, 70, 0, Math.PI, 0); m.fill(); } }, { depth: .45, trans: .4, cut: m => { m.beginPath(); m.moveTo(-LW / 2, 330); for (let x = -LW / 2; x <= LW / 2; x += 50) m.lineTo(x, 330 + 12 * Math.sin(x / 70)); for (let x = LW / 2; x >= -LW / 2; x -= 50) m.lineTo(x, 372 + 12 * Math.sin(x / 70 + 1)); m.fill(); } }),
    sheet('#3a1a10', m => M.palanquin(m, 0, 400, 1.0), { depth: .75, trans: .08, cut: m => M.palanquinCuts(m, 0, 400, 1.0), rim: '#ffcf8a', rimA: .8 }),
    sheet(AMBER[3], m => { m.fillRect(-LW / 2, 560, LW, LH); const R = mulberry(9); for (let k = 0; k < 5; k++) { const x = -640 + k * 320 + R() * 60, h = 60 + R() * 60; M.limb(m, [[x, 560], [x + 6, 560 - h]], 9); m.beginPath(); m.ellipse(x + 6, 560 - h, 50, 32, 0, 0, 7); m.fill(); } }, { depth: 1, trans: .03 }),
  ];
}

// ---------------- scenes ----------------
function dial(c, t, intro) {
  // intro: 0→2.35 (lit day flares, push into it). outro: 53.2→53.7 (pull back out of it)
  const L = A[1], [hx, hy] = M.dialPos(M.DIAL.lit), p = .45 + .55 * L.depth;
  let push = intro ? eio(seg(t, CUE.pushIn, 2.35)) : 1 - eo(seg(t, CUE.loop, DUR));
  const cam = { x: lerp(0, hx / p, push), y: lerp(-40, hy / p, push), z: lerp(1.18, 9, Math.pow(push, 1.6)) };
  A.forEach(l => l.lit = 1);
  c.fillStyle = '#05040c'; c.fillRect(0, 0, W, H);
  drawStack(c, A, cam, { x: W / 2, y: H / 2 - 60, r: 1250, I: .95 * flick(t) });
  const [sx, sy, z] = scr(L, cam, hx, hy);
  const fl = intro ? (t < CUE.oneDay ? .35 : .35 + .65 * back(seg(t, CUE.oneDay, CUE.oneDay + .45), 2)) : 1;
  glow(c, sx, sy, 30 * z, 'rgba(255,190,110,1)', fl * flick(t, 3)); glow(c, W / 2, H / 2 - 60, 520, 'rgba(120,80,200,1)', .18);
  glow(c, sx, sy, 5 * z, 'rgba(255,245,215,1)', fl);
  const wash = intro ? ss(seg(t, 1.95, 2.35)) : 1 - ss(seg(t, CUE.loop, CUE.loop + .3));
  if (wash > 0) { c.save(); c.globalAlpha = wash; c.fillStyle = '#ffe2b0'; c.fillRect(0, 0, W, H); c.restore(); }
}
function curtain(c, t) {
  const u = eio(seg(t, 2.35, 5.6)), gap = t < 4.46 ? lerp(420, 360, u) : 360 * (1 - eio(seg(t, 4.5, CUE.curtainShut)));
  B[8].ox = -gap; B[9].ox = gap; B.forEach(l => l.lit = 1);
  const cam = { x: 0, y: lerp(150, 230, u), z: lerp(1.05, 1.2, u) };
  c.fillStyle = '#0a0404'; c.fillRect(0, 0, W, H);
  const I = .8 + .45 * back(seg(t, CUE.charana, CUE.charana + .5), 1.6) - .45 * seg(t, CUE.charana + .5, 4.4);
  const [fx, fy, z] = scr(B[2], cam, ...B.feet);
  drawStack(c, B, cam, { x: fx, y: fy, r: 1300, I: I * flick(t) });
  glow(c, fx, fy + 40, 120 * z, 'rgba(255,120,70,1)', .28 * seg(t, CUE.charana - .2, CUE.charana + .3) * (1 - .6 * seg(t, 4.5, 5.6)));
  // the halves meet: dark, then crickets come in under the black (sound)
  const wash = 1 - ss(seg(t, 2.35, 2.75)); if (wash > 0) { c.save(); c.globalAlpha = wash; c.fillStyle = '#ffe2b0'; c.fillRect(0, 0, W, H); c.restore(); }
  const dark = ss(seg(t, 5.55, 5.75)); if (dark > 0) { c.save(); c.globalAlpha = dark * .55; c.fillStyle = '#000'; c.fillRect(0, 0, W, H); c.restore(); }
}
function moonPhase(c, x, y, r, frac, a) {   // frac: lit fraction (waxing, lit on the right)
  if (a <= 0) return;
  c.save(); c.globalAlpha = a * .18; c.fillStyle = '#9fb0e0'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.globalAlpha = a; c.fillStyle = '#ffe9bf'; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, Math.PI / 2);
  const k = 1 - 2 * frac; c.ellipse(x, y, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, k > 0); c.fill(); c.restore();
}
function night(c, t) {
  const u = eio(seg(t, 6.13, 9.6));
  const cam = { x: 0, y: lerp(-260, 60, u), z: lerp(1.08, 1.0, u) };
  C.forEach(l => l.lit = 1);
  c.fillStyle = '#04050c'; c.fillRect(0, 0, W, H);
  drawStack(c, C, cam, { x: W / 2, y: H * .3, r: 1500, I: .65 * flick(t) }, {
    after: [(cc) => {
      cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0);
      for (let k = 0; k < 9; k++) {   // nine nights of the bright fortnight
        const a = seg(t, 6.35 + k * .2, 6.6 + k * .2) * (k < 8 ? 1 - .5 * seg(t, 8.4, 9) : 1), x0 = -400 + k * 100, y0 = -600 - 30 * Math.sin(k / 8 * Math.PI);
        const [x, y, z] = scr(C[0], cam, x0, y0);
        if (k === 8) { const g = eo(seg(t, CUE.ninthMoon, CUE.ninthMoon + .9)), X = lerp(x, W / 2, g), Y = lerp(y, scr(C[0], cam, 0, -330)[1], g), r = lerp(22, 120, g) * z;
          glow(cc, X, Y, r * 1.2, 'rgba(255,220,160,1)', .45 * a); moonPhase(cc, X, Y, r, (k + 1) / 15 + .07, a); }
        else moonPhase(cc, x, y, 22 * z, (k + 1) / 15 + .07, a);
      }
      cc.restore();
    }],
  });
  for (let k = 0; k < 9; k++) { const [x, y, z] = scr(C[3], cam, -440 + k * 110 + 34, 600 - 30); flame(c, x, y, z * 1.1, seg(t, 7.0 + k * .22, 7.25 + k * .22), t, k); }
  for (const [wx, wy, wr] of M.templeWindows(120, 480, .55)) { const [x, y, z] = scr(C[2], cam, wx, wy); glow(c, x, y, wr * z, 'rgba(255,180,100,1)', .5); }
}
function amla(c, t) {
  const u = eio(seg(t, 9.58, 14.13));
  const cam = { x: lerp(-170, 150, u), y: lerp(40, -20, u), z: 1.07 };
  D.forEach(l => l.lit = 1);
  c.fillStyle = '#04050c'; c.fillRect(0, 0, W, H);
  drawStack(c, D, cam, { x: W / 2 + 80, y: H * .42, r: 1400, I: .7 * flick(t) }, {
    after: [(cc) => { cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); const [x, y, z] = scr(D[0], cam, 330, -620); glow(cc, x, y, 70 * z, 'rgba(255,225,170,1)', .45); moonPhase(cc, x, y, 62 * z, .66, 1); cc.restore(); },
      null,
      (cc) => {   // amla fruit glowing through the leaves
        cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0);
        D.fruit.forEach(([fx, fy, r], i) => { const [x, y, z] = scr(D[2], cam, fx, fy); const a = .75 + .25 * Math.sin(t * 1.3 + i); glow(cc, x, y, r * z * .9, 'rgba(225,230,120,1)', .5 * a); cc.fillStyle = `rgba(232,236,150,${.85 * a})`; cc.beginPath(); cc.arc(x, y, r * z * .55, 0, 7); cc.fill(); });
        cc.restore();
      }],
  });
  // the thread of light wraps the trunk
  const p = seg(t, 10.9, 13.3);
  if (p > 0) {
    const [hx, hy] = scr(D[3], cam, ...D.hand), [tx, tb, z] = scr(D[2], cam, ...D.trunk);
    c.save(); c.strokeStyle = 'rgba(255,214,140,.95)'; c.lineWidth = 3.2 * z; c.shadowColor = 'rgba(255,170,80,.9)'; c.shadowBlur = 14; c.beginPath(); c.moveTo(hx, hy);
    const N = 90, n = Math.floor(N * p);
    for (let i = 0; i <= n; i++) { const q = i / N, a = q * Math.PI * 6, x = tx - 4 * z + Math.cos(a) * 30 * z, y = tb - (150 + q * 110) * z + Math.sin(a) * 8 * z; c.lineTo(x, y); }
    c.stroke(); c.restore();
  }
  for (const [pt, k] of [[D.lampA, 1], [D.lampC, 2]]) { const [x, y, z] = scr(D[3], cam, ...pt); flame(c, x, y, z, 1, t, k); }
  for (let k = 0; k < 7; k++) { const [x, y, z] = scr(D[4], cam, -480 + k * 160 + 34, 612 - 30); flame(c, x, y, z, 1, t, k + 4); }
}
function sakshi(c, t) {
  const travel = eio(seg(t, 14.13, 15.7)), rise = back(seg(t, CUE.temple - .3, CUE.temple + .8), 1.2), push = eio(seg(t, 15.7, 18.6));
  E[1].ox = -170 * eio(seg(t, 14.13, 16.2)); E[2].oy = lerp(520, 0, rise);
  const cam = { x: lerp(260, 0, travel), y: lerp(60, -40, push), z: lerp(1.0, 1.1, push) };
  E.forEach(l => l.lit = 1); E[2].lit = .5 + .5 * ss(seg(t, CUE.title, CUE.title + .8));
  c.fillStyle = '#04050c'; c.fillRect(0, 0, W, H);
  drawStack(c, E, cam, { x: W / 2, y: H * .45, r: 1400, I: .7 * flick(t) });
  E.win.forEach(([wx, wy, wr], i) => { const [x, y, z] = scr(E[2], cam, wx, wy); glow(c, x, y, wr * z * 1.1, 'rgba(255,180,100,1)', .7 * seg(t, CUE.title + i * .15, CUE.title + .4 + i * .15) * flick(t, i)); });
  for (let k = 0; k < 6; k++) { const [x, y, z] = scr(E[3], cam, -560 + k * 230, 470); flame(c, x, y, z, seg(t, 16.4 + k * .12, 16.7 + k * .12), t, k); }
  // the title: a paper strip that grows from its left edge
  const g = eo(seg(t, CUE.title + .1, CUE.title + .7)), off = ss(seg(t, 18.15, 18.45));
  if (g > 0 && off < 1) {
    c.save(); c.globalAlpha = 1 - off; c.translate(0, -60 * off);
    c.font = '600 92px "OdiaSerif"'; const w = c.measureText('ରାଧାପାଦ ଦର୍ଶନ').width + 110, x0 = W / 2 - w / 2, y0 = 330;
    c.beginPath(); c.rect(x0, y0 - 80, w * g, 210); c.clip();
    c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 22; c.shadowOffsetY = 10; c.fillStyle = '#2a100c'; c.fillRect(x0, y0 - 70, w, 190); c.shadowColor = 'transparent';
    c.fillStyle = 'rgba(255,190,120,.55)'; c.fillRect(x0, y0 - 70, w, 3);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#e8cfa8'; c.font = '500 44px "OdiaSerif"'; c.fillText('ଏହିଦିନ ହୁଏ', W / 2, y0 - 22);
    c.fillStyle = '#ffd38a'; c.shadowColor = 'rgba(255,160,70,.7)'; c.shadowBlur = 18; c.font = '700 92px "OdiaSerif"'; c.fillText('ରାଧାପାଦ ଦର୍ଶନ', W / 2, y0 + 52);
    c.restore();
  }
}
function journey(c, t) {
  const u = seg(t, CUE.journey - .3, 33.8);
  G[3].ox = lerp(-520, 330, eio(u)); G[3].oy = 5 * Math.sin(t * 9.5); G[4].ox = lerp(160, -260, u); G[1].ox = lerp(-40, 40, u);
  const cam = { x: lerp(-200, 170, eio(u)), y: 0, z: 1.12 };
  G.forEach(l => l.lit = 1);
  c.fillStyle = '#0c0604'; c.fillRect(0, 0, W, H);
  drawStack(c, G, cam, { x: W * .25, y: H * .2, r: 1600, I: .6 * flick(t) }, {
    before: [null, (cc) => { cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); glow(cc, W * .25 - cam.x * .1, H * .2, 90, 'rgba(255,220,150,1)', .45); cc.restore(); }],
  });
}
// the legend sanctum: shots 8–15
const FEET = 3, ALTA = 4, TOP = 5, GHAGRA = 6, SAREE = 7, BORDER = 8, GIRL = 9, ARM = 10, PRIEST = 11, FRAME = 12;
function legend(c, t, S, nightMode) {
  const yb = S.yb, rx = 165;
  // defaults
  S.forEach(l => { l.lit = 1; l.blur = 0; l.ox = 0; l.oy = 0; l.alpha = 1; l.rot = 0; });
  const radhaIn = nightMode || t >= CUE.radha;
  S[FEET].alpha = S[ALTA].alpha = S[TOP].alpha = radhaIn ? 1 : 0;
  if (!nightMode && t < CUE.reveal + .25) S[FEET].alpha = S[ALTA].alpha = radhaIn ? clamp((t - CUE.reveal + .04) / .29) : 0;
  // girl
  const girlIn = !nightMode && t >= CUE.lakshmi - .1 && t < 31;
  S[GIRL].alpha = S[ARM].alpha = girlIn ? 1 : 0;
  if (girlIn) {
    const e = eo(seg(t, CUE.lakshmi, CUE.lakshmi + .9)); S[GIRL].ox = S[ARM].ox = lerp(-340, 0, e); S[GIRL].oy = S[ARM].oy = -6 * Math.abs(Math.sin(t * 7)) * (1 - e);
    const g = seg(t, CUE.gesture - .35, CUE.gesture), g2 = seg(t, CUE.gesture, CUE.gesture + .55);
    S[ARM].rot = lerp(lerp(0, .25, ss(g)), -1.05, back(g2, 1.3)) + .015 * Math.sin(t * 2.3);
  }
  // skirts: ghagra until the lift, then the saree slides in
  const lift = seg(t, CUE.lift, CUE.lift + .8), slide = seg(t, CUE.saree, CUE.saree + .9);
  if (nightMode) { S[GHAGRA].alpha = 0; S[SAREE].alpha = S[BORDER].alpha = 1; }
  else {
    S[GHAGRA].alpha = radhaIn ? 1 - ss(seg(lift, .7, 1)) : 0; S[GHAGRA].oy = -(-30 * ss(seg(lift, 0, .2)) + 900 * Math.pow(seg(lift, .15, 1), 1.6));
    S[SAREE].alpha = S[BORDER].alpha = slide > 0 ? 1 : 0; S[SAREE].ox = S[BORDER].ox = 700 * (1 - back(slide, 1.0));
  }
  // priests rise with lamps
  const pr = nightMode ? 0 : eo(seg(t, 43.85, 44.6)); S[PRIEST].alpha = pr > 0 ? 1 : 0; S[PRIEST].oy = lerp(420, 0, pr);
  // focus: before the gesture the girl is sharp; then the empty pedestal
  if (girlIn) { const rk = eio(seg(t, CUE.gesture, CUE.gesture + .7)); for (const i of [2, FEET, ALTA, TOP]) S[i].blur = lerp(2.4, 0, rk); S[GIRL].blur = S[ARM].blur = lerp(0, 3, rk); }
  // camera
  let cam;
  if (nightMode) {
    const d = eio(seg(t, 46.53, 50.1)), p = eio(seg(t, CUE.push, 53.1));
    cam = { x: lerp(lerp(0, 0, d), rx * 1.6, p), y: lerp(lerp(-150, -60, d), 340, p), z: lerp(lerp(1.22, 1.0, d), 4.2, Math.pow(p, 1.3)) };
  } else if (t < CUE.lakshmi) {
    const out = eio(seg(t, CUE.alone, 24.6));
    cam = { x: lerp(0, -70, out), y: -80, z: lerp(lerp(1.3, 1.22, seg(t, 18.3, 23)), .98, out) };
  } else if (t < 31) cam = { x: -60, y: -40, z: 1.0 + .03 * seg(t, 24.7, 30) };
  else if (t < CUE.ghagra) { const u = eio(seg(t, 33.6, 37.8)); cam = { x: rx * 1.45, y: lerp(-420, 120, u), z: lerp(1.55, 1.75, u) }; }
  else if (t < CUE.lift) { const u = seg(t, CUE.ghagra, CUE.lift); cam = { x: rx * 1.55, y: lerp(60, 90, u), z: lerp(2.35, 2.5, u) }; }
  else if (t < CUE.reveal) { cam = { x: rx * 1.55, y: lerp(90, 40, eio(seg(t, CUE.lift, CUE.reveal))), z: lerp(2.5, 2.2, eio(seg(t, CUE.lift, CUE.reveal))) }; }
  else if (t < 43.85) { const u = eo(seg(t, CUE.reveal, CUE.reveal + .7)); cam = { x: rx * 1.6, y: lerp(40, 230, u), z: lerp(2.2, 3.3, u) }; }
  else { const u = eio(seg(t, 43.85, 45.2)); cam = { x: lerp(rx * 1.6, 0, u), y: lerp(230, -40, u), z: lerp(3.3, 1.0, u) }; }
  const burst = nightMode ? 0 : back(seg(t, CUE.reveal, CUE.reveal + .5), 2) * (1 - .55 * seg(t, CUE.reveal + .5, 45));
  const I = (nightMode ? .75 : .95) * flick(t) * (1 + .7 * burst);
  c.fillStyle = nightMode ? '#04050c' : '#0c0604'; c.fillRect(0, 0, W, H);
  const [lx, ly] = scr(S[2], cam, 0, yb - 300);
  drawStack(c, S, cam, { x: lx, y: ly, r: 1500, I }, nightMode ? { before: [(cc) => { const [mx, my, z] = scr(S[0], cam, 0, -560); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.fillStyle = '#ffe9bf'; cc.beginPath(); cc.arc(mx, my, 92 * z, 0, 7); cc.fill(); cc.restore(); }], after: [(cc) => { const [mx, my, z] = scr(S[0], cam, 0, -560); glow(cc, mx, my, 70 * z, 'rgba(255,225,170,1)', .45); }] } : {});
  // the empty pedestal, outlined in light
  if (!nightMode && t < CUE.radha) {
    const a = seg(t, CUE.emptyGlow, CUE.emptyGlow + .6) * (1 - .4 * seg(t, 30, 31)) * (.8 + .2 * Math.sin(t * 3)), [x, y, z] = scr(S[2], cam, rx, yb - 72);
    if (a > 0) { glow(c, x, y - 60 * z, 120 * z, 'rgba(255,200,120,1)', .45 * a); c.save(); c.strokeStyle = `rgba(255,226,170,${.9 * a})`; c.lineWidth = 3 * z; c.setLineDash([10 * z, 9 * z]); c.beginPath(); c.ellipse(x, y - 190 * z, 70 * z, 200 * z, 0, 0, 7); c.stroke(); c.restore(); }
  }
  // mirror-work glints on the ghagra
  if (!nightMode && radhaIn && S[GHAGRA].alpha > 0) { const R = mulberry(8); for (let k = 0; k < 24; k++) { const r = Math.floor(R() * 5), half = 44 + r * 24, xx = rx - half + R() * 2 * half, yy = yb - 70 - 170 + r * 38; const [x, y, z] = scr(S[GHAGRA], cam, xx, yy); const tw = Math.max(0, Math.sin(t * 3 + k * 1.7)); glow(c, x, y, 5 * z, 'rgba(255,230,180,1)', .5 * tw * S[GHAGRA].alpha); } }
  // the feet burn with light
  const feetA = nightMode ? .55 + .45 * seg(t, CUE.push, 52.6) : (t >= CUE.reveal ? burst : 0);
  if (feetA > 0) { const [x, y, z] = scr(S[FEET], cam, rx, yb - 90); glow(c, x, y + 8 * z, 30 * z, 'rgba(255,140,80,1)', .55 * feetA); glow(c, x, y - 30 * z, 60 * z, 'rgba(255,200,130,1)', .25 * feetA); }
  // ornaments (tonight)
  if (nightMode) HS.orn.forEach(([ox, oy], i) => { const [x, y, z] = scr(S[TOP], cam, ox, oy); glow(c, x, y, 4 * z, 'rgba(255,225,160,1)', .7 * (.6 + .4 * Math.sin(t * 2.5 + i))); });
  // lamp stands, and the priests' lamps lighting one by one
  S.lampStands.forEach(([x0, y0], i) => { const [x, y, z] = scr(S[FRAME], cam, x0, y0); flame(c, x, y, z * 1.1, 1, t, i); });
  if (nightMode) for (let k = 0; k < 9; k++) { const [x, y, z] = scr(S[FRAME], cam, -400 + k * 100 + 34, 300); flame(c, x, y, z, 1, t, k + 3); }
  if (!nightMode && pr > 0) [S.p1, S.p2].forEach((pt, i) => { const [x, y, z] = scr(S[PRIEST], cam, ...pt); flame(c, x, y, z * 1.2, seg(t, CUE.lamps[i * 2], CUE.lamps[i * 2] + .25), t, i + 7); });
  // flower petals after the sign
  if (!nightMode && t > 44) { const R = mulberry(77); c.save(); for (let k = 0; k < 34; k++) { const x0 = R() * W, sp = 120 + R() * 140, ph = R() * 6, u = t - 44 - R() * 1.2; if (u < 0) continue; const y = -40 + u * sp, x = x0 + 40 * Math.sin(u * 1.8 + ph); c.save(); c.translate(x, y); c.rotate(u * 2 + ph); c.fillStyle = k % 3 ? '#e8962c' : '#c8321e'; c.globalAlpha = .9; c.beginPath(); c.ellipse(0, 0, 11, 6, 0, 0, 7); c.fill(); c.restore(); } c.restore(); }
  // flash at the reveal
  if (!nightMode && t >= CUE.reveal) { const a = .55 * (1 - seg(t, CUE.reveal, CUE.reveal + .45)); if (a > 0) { c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = a; c.fillStyle = '#ffd9a0'; c.fillRect(0, 0, W, H); c.restore(); } }
  if (nightMode) { const w = ss(seg(t, 52.85, CUE.loop)); if (w > 0) { c.save(); c.globalAlpha = w; c.fillStyle = '#ffe2b0'; c.fillRect(0, 0, W, H); c.restore(); } }
}

// palm-leaf wipe (near-plane occluder): leaf travels right → left, the new scene appears behind it
function palmWipe(c, t, t0, d, drawOld, drawNew) {
  const p = eio(seg(t, t0, t0 + d)), lw = 760, x = lerp(W + 40, -lw - 40, p);
  drawOld(c, t);
  const b = BUF[0], x2 = b.getContext('2d'); x2.setTransform(1, 0, 0, 1, 0, 0); drawNew(x2, t);
  c.save(); c.beginPath(); c.rect(x + lw, 0, W, H); c.clip(); c.drawImage(b, 0, 0); c.restore();
  c.save(); c.translate(x, 0); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 40;
  c.fillStyle = '#c9a060'; c.beginPath(); c.roundRect(0, -20, lw, H + 40, 60); c.fill(); c.shadowColor = 'transparent';
  c.strokeStyle = 'rgba(90,50,20,.55)'; c.lineWidth = 2; for (let k = 0; k < 40; k++) { c.beginPath(); c.moveTo(40, 60 + k * 46); for (let i = 0; i < 30; i++) c.lineTo(40 + i * 23, 60 + k * 46 + 4 * Math.sin(i * 1.7 + k)); c.stroke(); }
  for (const yy of [H * .3, H * .7]) { c.fillStyle = '#2a1408'; c.beginPath(); c.arc(lw / 2, yy, 16, 0, 7); c.fill(); }
  c.restore();
}
function dissolve(c, t, t0, d, A1, A2) {
  const a = ss(seg(t, t0, t0 + d)); if (a <= 0) return A1(c, t); if (a >= 1) return A2(c, t);
  A1(c, t); const b = BUF[0], x = b.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); A2(x, t); c.globalAlpha = a; c.drawImage(b, 0, 0); c.globalAlpha = 1;
}
// light off → light on (ladder change: legend amber → tonight indigo)
function lightChange(c, t, t0, A1, A2) {
  const u = seg(t, t0 - .35, t0 + .45); const first = u < .5;
  (first ? A1 : A2)(c, t); const dk = 1 - Math.abs(u - .5) * 2; if (dk > 0) { c.save(); c.globalAlpha = .92 * ss(dk); c.fillStyle = '#05030a'; c.fillRect(0, 0, W, H); c.restore(); }
}

// ---------------- captions ----------------
function caption(c, t) {
  const cap = CAP.find(([a, b]) => t >= a - .05 && t < b); if (!cap) return;
  const [t0, t1, raw] = cap, inn = eo(seg(t, t0, t0 + .35)), out = 1 - seg(t, t1 - .15, t1);
  const big = raw.startsWith('{') && raw.endsWith('}');
  const parts = raw.split(/(\{[^}]*\})/).filter(Boolean).map(s => s.startsWith('{') ? [s.slice(1, -1), true] : [s, false]);
  let fs = big ? 78 : 56; c.save(); c.textBaseline = 'middle';
  const width = () => parts.reduce((w, [s, g]) => (c.font = `${g ? 700 : 600} ${fs}px "OdiaSerif"`, w + c.measureText(s).width), 0);
  let w = width(); while (w > 900) { fs -= 2; w = width(); }
  const y = 1392, pad = 44, x0 = W / 2 - w / 2 - pad, bw = w + pad * 2, bh = fs * 1.75;
  c.globalAlpha = out;
  c.beginPath(); c.rect(x0, y - bh / 2 - 10, bw * inn, bh + 20); c.clip();
  c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 18; c.shadowOffsetY = 8; c.fillStyle = 'rgba(30,10,8,.92)'; c.fillRect(x0, y - bh / 2, bw, bh); c.shadowColor = 'transparent';
  c.fillStyle = 'rgba(255,190,120,.5)'; c.fillRect(x0, y - bh / 2, bw, 2.5);
  let x = W / 2 - w / 2;
  for (const [s, g] of parts) { c.font = `${g ? 700 : 600} ${fs}px "OdiaSerif"`; c.fillStyle = g ? '#ffd38a' : '#f7e6cc'; c.shadowColor = g ? 'rgba(255,160,70,.6)' : 'rgba(0,0,0,0)'; c.shadowBlur = g ? 14 : 0; c.fillText(s, x, y + 3); x += c.measureText(s).width; }
  c.restore();
}

// ---------------- render ----------------
const legendA = (c, t) => legend(c, t, F, false), tonight = (c, t) => legend(c, t, HS, true);
const FROM = Number(Q.get('from') || 0), TO = Number(Q.get('to') || DUR);
window.DUR = TO - FROM;
window.render = t0 => {
  const t = t0 + FROM;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  if (t < 2.35) dial(ctx, t, true);
  else if (t < 6.13) curtain(ctx, t);
  else if (t < 6.55) dissolve(ctx, t, 6.13, .4, curtain, night);
  else if (t < 9.58) night(ctx, t);
  else if (t < 10.2) dissolve(ctx, t, 9.58, .6, night, amla);
  else if (t < 14.13) amla(ctx, t);
  else if (t < 14.6) dissolve(ctx, t, 14.13, .45, amla, sakshi);
  else if (t < CUE.wipe) sakshi(ctx, t);
  else if (t < CUE.wipe + .75) palmWipe(ctx, t, CUE.wipe, .75, sakshi, legendA);
  else if (t < CUE.journey) legendA(ctx, t);
  else if (t < CUE.journey + .5) dissolve(ctx, t, CUE.journey, .5, legendA, journey);
  else if (t < 33.3) journey(ctx, t);
  else if (t < 33.8) dissolve(ctx, t, 33.3, .5, journey, legendA);
  else if (t < CUE.present - .35) legendA(ctx, t);
  else if (t < CUE.present + .45) lightChange(ctx, t, CUE.present, legendA, tonight);
  else if (t < CUE.loop) tonight(ctx, t);
  else dial(ctx, t, false);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .32, W / 2, H / 2, H * .78); v.addColorStop(0, 'rgba(10,4,6,0)'); v.addColorStop(1, 'rgba(10,4,6,.42)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  if (!Q.has('nocap')) caption(ctx, t);
};
window.TEXTS = t => (t > CUE.title + .7 && t < 18.1) ? [{ id: 'title', text: 'ଏହିଦିନ ହୁଏ ରାଧାପାଦ ଦର୍ଶନ', x0: 150, y0: 250, x1: 930, y1: 450 }] : [];
window.EV = [
  { t: CUE.oneDay, type: 'shimmer' }, { t: 2.2, type: 'swell' }, { t: CUE.charana, type: 'bell', v: .6 }, { t: 4.55, type: 'cloth' }, { t: CUE.curtainShut, type: 'thud' },
  { t: 6.13, type: 'crickets_on' }, ...Array.from({ length: 9 }, (_, k) => ({ t: 7.0 + k * .22, type: 'diya', v: .35 })), { t: CUE.ninthMoon, type: 'shimmer', v: .5 },
  { t: 9.58, type: 'paper' }, { t: 10.9, type: 'thread' }, { t: 14.13, type: 'paper' }, { t: CUE.temple - .2, type: 'slide' }, { t: CUE.title, type: 'shimmer' },
  { t: CUE.wipe, type: 'leaf' }, { t: CUE.emptyGlow, type: 'shimmer', v: .5 }, { t: CUE.lakshmi, type: 'steps' }, { t: CUE.gesture, type: 'tap' },
  { t: CUE.journey, type: 'march' }, { t: 33.3, type: 'paper' }, { t: CUE.ghagra, type: 'tap', v: .4 }, { t: CUE.lift, type: 'lift' }, { t: CUE.saree, type: 'cloth' },
  { t: 42.26, type: 'silence' }, { t: CUE.reveal, type: 'reveal' }, ...CUE.lamps.map(t => ({ t, type: 'diya', v: .6 })), { t: 44.0, type: 'conch' },
  { t: CUE.present, type: 'swap' }, { t: CUE.push, type: 'swell' }, { t: CUE.loop, type: 'shimmer' },
];

(async () => {
  const base = new URL('.', import.meta.url).href;
  const [fibre, pulp] = await Promise.all([load(base + 'assets/fibre.png'), load(base + 'assets/pulp.png')]);
  await document.fonts.load('600 56px "OdiaSerif"', 'ରାଧା');
  await document.fonts.load('700 56px "OdiaSerif"', 'ରାଧା');
  initLightbox(fibre, pulp); build();
  window.render(Number(Q.get('t') || 0)); window.READY = true;
})();
