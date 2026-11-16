// Jadu Guni (v2): one paper-cut lightbox journey from dusk to moonlight. Every phrase = one metaphor; words are paper sheets inside the stack.
import { initLightbox, sheet, drawStack, glow, LW, LH } from './lightbox.js';
import * as M from './motifs.js';
import { mulberry } from './engine_wc.js';

const W = 1080, H = 1920, DUR = 26.70;
const BEATS = [0.07, 0.63, 1.18, 1.74, 2.25, 2.86, 3.41, 3.97, 4.50, 5.06, 5.60, 6.18, 6.73, 7.27, 7.80, 8.38, 8.96, 9.52, 10.05, 10.59, 11.17, 11.73, 12.26, 12.84, 13.40, 13.96, 14.51, 15.07, 15.63, 16.16, 16.74, 17.30, 17.86, 18.39, 18.92, 19.48, 20.06, 20.64, 21.20, 21.73, 22.29, 22.83, 23.38, 23.96, 24.52, 25.05, 25.59, 26.10, 26.62];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a)), ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const backE = (t, s = 1.4) => { t = clamp(t); return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
const Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mkc = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const BUF = mkc();
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
const full = m => m.fillRect(-LW / 2, -LH / 2, LW, LH);
const flick = (t, k = 0) => 1 + .045 * Math.sin(7.3 * t + k) * Math.sin(3.1 * t + k * 2);
const pulse = (t, from, to, k = 3) => Math.max(0, ...BEATS.filter(b => b >= from && b < to).map(b => t >= b ? Math.exp(-(t - b) * k) : 0));
function scrOf(cam) { return (l, x, y) => { const p = .45 + .55 * l.depth, z = 1 + (cam.z - 1) * p; return [W / 2 + z * (x + (l.ox || 0) - cam.x * p), H / 2 + z * (y + (l.oy || 0) - cam.y * p), z]; }; }

// ---------- motifs ----------
const word = (txt, size, x, y, font = 'Pinyon Script') => m => { m.font = `${size}px "${font}"`; m.textAlign = 'center'; m.textBaseline = 'middle'; m.fillText(txt, x, y); };
function jharokha(m, w, top, bottom) {   // cusped arch opening (cut)
  m.beginPath(); m.moveTo(-w, bottom); m.lineTo(-w, top + w);
  for (let k = 1; k <= 9; k++) { const a = Math.PI + k / 9 * Math.PI, c = Math.PI + (k - .5) / 9 * Math.PI; m.quadraticCurveTo(Math.cos(c) * (w + 44), top + w + Math.sin(c) * (w + 40), Math.cos(a) * w, top + w + Math.sin(a) * w); }
  m.lineTo(w, bottom); m.closePath(); m.fill();
}
function panicle(m, x, y, ang, len, r = 7) { for (let k = 0; k < 15; k++) { const u = k / 14; m.beginPath(); m.arc(x + Math.cos(ang) * len * u + (k % 2 ? 1 : -1) * Math.sin(ang) * 10 * (1 - u), y + Math.sin(ang) * len * u - (k % 2 ? 1 : -1) * Math.cos(ang) * 10 * (1 - u), r * (1 - u * .55), 0, 7); m.fill(); } }
function branch(m, pts, w, leaves) {
  m.save(); m.lineCap = 'round'; m.lineJoin = 'round'; m.strokeStyle = '#000'; m.lineWidth = w; m.beginPath(); m.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) m.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], (pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2); m.lineTo(...pts.at(-1)); m.stroke(); m.restore();
  for (const [x, y, a, l] of leaves) { m.save(); m.translate(x, y); m.rotate(a); m.beginPath(); m.moveTo(0, 0); m.quadraticCurveTo(l * .5, -l * .2, l, 0); m.quadraticCurveTo(l * .5, l * .2, 0, 0); m.fill(); m.restore(); }
}
function veins(m, leaves) { for (const [x, y, a, l] of leaves) { m.save(); m.translate(x, y); m.rotate(a); m.fillRect(l * .08, -1.2, l * .8, 2.4); m.restore(); } }
function cuckoo(m, x, y, s, d = -1) {   // perched, facing left by default
  m.save(); m.translate(x, y); m.scale(s * -d, s);
  m.beginPath(); m.moveTo(-70, 70); m.quadraticCurveTo(-60, 20, -20, 6); m.quadraticCurveTo(-30, -30, 0, -46); m.quadraticCurveTo(30, -60, 52, -40); m.lineTo(80, -35); m.lineTo(54, -27);
  m.quadraticCurveTo(60, 0, 40, 30); m.quadraticCurveTo(84, 60, 196, 66); m.lineTo(188, 82); m.quadraticCurveTo(84, 86, 20, 76); m.quadraticCurveTo(-30, 92, -70, 70); m.fill();
  m.fillRect(-10, 70, 6, 30); m.fillRect(12, 70, 6, 30); m.restore();
}
function lotus(m, x, y, s) { for (const [a, l] of [[-1.2, 70], [-.6, 86], [0, 92], [.6, 86], [1.2, 70]]) { m.save(); m.translate(x, y); m.rotate(a - Math.PI / 2); m.beginPath(); m.moveTo(0, 0); m.quadraticCurveTo(l * .5 * s, -26 * s, l * s, 0); m.quadraticCurveTo(l * .5 * s, 26 * s, 0, 0); m.fill(); m.restore(); } }
function lily(m, x, y, rx, ry) { m.beginPath(); m.ellipse(x, y, rx, ry, 0, .25, Math.PI * 2 - .1); m.lineTo(x, y); m.fill(); }

// ---------- stacks ----------
let S1, S2, S3, S4, S5, S6;
const EW = 900, EH = 420, BR = 190;
function almond(m, w, h) { m.beginPath(); m.moveTo(-w / 2, 0); m.bezierCurveTo(-w * .2, -h * .95, w * .25, -h * 1.0, w / 2, -h * .08); m.bezierCurveTo(w * .25, h * .82, -w * .2, h * .78, -w / 2, 0); m.closePath(); }
function build() {
  // S1 · dusk window: her profile, the spell
  S1 = [
    sheet('#f4c48c', full, { depth: 0, trans: .95 }),
    sheet('#e0946a', m => { m.fillRect(-LW / 2, 260, LW, LH); for (const [x, r] of [[-420, 150], [-250, 110], [380, 170], [520, 120]]) { m.beginPath(); m.arc(x, 250, r, Math.PI, 0); m.fill(); m.beginPath(); m.arc(x - r * .4, 200, r * .7, 0, 7); m.fill(); m.beginPath(); m.arc(x + r * .4, 190, r * .65, 0, 7); m.fill(); } }, { depth: .2, trans: .7 }),
    sheet('#7a2416', word('Jadu', 300, -40, -470), { depth: .3, trans: .35, rim: '#ffd9a0', rimA: .9 }),
    sheet('#9a4026', full, { depth: .55, trans: .4, cut: m => { jharokha(m, 420, -830, 760); for (const sx of [-1, 1]) for (let k = 0; k < 10; k++) { const x = sx * 520, y = -640 + k * 120; m.beginPath(); m.moveTo(x, y - 34); m.lineTo(x + 22, y); m.lineTo(x, y + 34); m.lineTo(x - 22, y); m.fill(); } } }),
    sheet('#3a1414', m => M.profile(m, 1.5, 250, 230), { depth: .75, trans: .1, cut: m => M.profileCuts(m, 1.5, 250, 230), rim: '#ffb46a', rimA: .85 }),
    sheet('#1c0a08', m => {
      m.fillRect(-LW / 2, -LH / 2, LW, LH / 2 - 900); for (let k = 0; k < 15; k++) { const x = -LW / 2 + k * 100 + 50; m.beginPath(); m.moveTo(x - 50, -900); m.quadraticCurveTo(x, -800, x + 50, -900); m.fill(); }
      for (const x of [-500, -430, 440, 505]) { m.fillRect(x - 2, -900, 4, 300 + (x % 3) * 20); for (let k = 0; k < 8; k++) { m.beginPath(); m.arc(x, -870 + k * 40, 16, 0, 7); m.fill(); } }
      m.fillRect(-LW / 2, 780, LW, LH);
    }, { depth: 1, trans: .04 }),
  ];
  S1.eye = [250 + -95 * 1.5, 230 - 150 * 1.5 + 2];
  // S2 · salty lips, sweet drop, lotus pond
  S2 = [
    sheet('#f2b67e', full, { depth: 0, trans: .95 }),
    sheet('#d9845a', m => { m.fillRect(-LW / 2, 900, LW, LH); }, { depth: .2, trans: .6 }),
    sheet('#7a2416', word('Meetha', 220, -120, -720), { depth: .3, trans: .35, rim: '#ffd9a0', rimA: .9 }),
    sheet('#3a1414', m => M.profile(m, 2.3, 330, 300), { depth: .6, trans: .1, cut: m => M.profileCuts(m, 2.3, 330, 300), rim: '#ffb46a', rimA: .85 }),
    sheet('#2b3a2a', m => { m.fillRect(-LW / 2, 1000, LW, LH); lily(m, -300, 1010, 170, 40); lily(m, 260, 1040, 210, 46); }, { depth: .85, trans: .2, cut: m => { for (let r = 0; r < 5; r++) m.fillRect(-LW / 2, 1080 + r * 60, LW, 3); } }),
    sheet('#C8321E', m => lotus(m, -60, 1010, 1.15), { depth: .87, trans: .75 }),
  ];
  S2.lip = [330 - 182 * 2.3, 300 + 36 * 2.3];
  // S3 · the mango orchard in blossom
  const L1 = [[-300, -330, -2.6, 120], [-160, -420, -1.9, 110], [40, -470, -1.2, 120], [200, -440, -.5, 110], [-420, -260, 2.8, 100]];
  const B1 = [[-240, -300, -2.3], [-60, -460, -1.6], [130, -470, -1.0], [300, -400, -.6]];
  S3 = [
    sheet('#f6c993', full, { depth: 0, trans: .95 }),
    sheet('#e7a37a', m => { m.fillRect(-LW / 2, 380, LW, LH); for (let k = 0; k < 7; k++) { const x = -640 + k * 210; m.fillRect(x - 10, 140, 20, 260); m.beginPath(); m.ellipse(x, 120, 120, 90, 0, 0, 7); m.fill(); } }, { depth: .2, trans: .65 }),
    sheet('#7a2416', word('Amba Baula', 170, 60, -720), { depth: .28, trans: .35, rim: '#ffd9a0', rimA: .9 }),
    sheet('#8a4430', m => { branch(m, [[-700, -150], [-400, -280], [-100, -440], [200, -470], [700, -330]], 26, L1); for (const [x, y, a] of B1) M.limb(m, [[x, y], [x + Math.cos(a) * 30, y + Math.sin(a) * 30]], 6); }, { depth: .5, trans: .3, cut: m => veins(m, L1) }),
    sheet('#C8321E', m => { for (const [x, y, a] of B1) panicle(m, x + Math.cos(a) * 30, y + Math.sin(a) * 30, a, 120, 8); }, { depth: .52, trans: .7 }),
    sheet('#2a1010', m => M.woman(m, -60, 640, 1.55, 1, 'none'), { depth: .75, trans: .05, rim: '#ffb46a', rimA: .85 }),
    sheet('#1e0b08', m => { m.fillRect(-LW / 2, 660, LW, LH); branch(m, [[700, -1080], [520, -1000], [400, -960], [300, -980]], 22, [[480, -990, 2.1, 140], [380, -960, 1.4, 130]]); panicle(m, 300, -980, 1.9, 150, 9); }, { depth: 1, trans: .03 }),
  ];
  // S4 · moonrise: she looks up, enchanted
  S4 = [
    sheet('#1c2250', full, { depth: 0, trans: .9 }),
    sheet('#2c3570', m => { m.beginPath(); m.moveTo(-LW / 2, 420); for (let x = -LW / 2; x <= LW / 2; x += 40) m.lineTo(x, 380 - 70 * Math.sin(x / 230) - 26 * Math.sin(x / 70)); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill(); }, { depth: .2, trans: .55 }),
    sheet('#fff2dc', word('Mahani', 260, -40, -690), { depth: .3, trans: .95 }),
    sheet('#120e22', m => M.profile(m, 1.8, 230, 430), { depth: .7, trans: .06, cut: m => M.profileCuts(m, 1.8, 230, 430), rim: '#ffcf9a', rimA: .9 }),
    sheet('#07060f', m => { m.fillRect(-LW / 2, 860, LW, LH); m.fillRect(-LW / 2, 760, LW, 26); for (let k = 0; k < 13; k++) { const x = -660 + k * 110; m.beginPath(); m.moveTo(x - 16, 860); m.quadraticCurveTo(x - 30, 820, x - 10, 790); m.lineTo(x + 10, 790); m.quadraticCurveTo(x + 30, 820, x + 16, 860); m.fill(); } for (let k = 0; k < 4; k++) M.diya(m, -400 + k * 110, 760, 1.1); }, { depth: 1, trans: .02 }),
  ];
  S4[3].pivot = [230, 430 + 300 * 1.8];
  // S5 · the eye
  const R = mulberry(12), LV = [[520, 150, -.9, 130], [380, 90, 2.4, 120], [250, 70, -1.1, 130], [120, 80, 2.2, 110], [-40, 100, -.7, 130], [-200, 120, 2.6, 120], [-330, 100, -1.2, 120]];
  S5 = [
    sheet('#1f2558', full, { depth: 0, trans: .95 }),
    sheet('#12152e', m => branch(m, [[700, 220], [300, 40], [-120, 110], [-300, 140], [-460, 60]], 18, LV), { depth: .35, trans: .3, cut: m => veins(m, LV) }),
    sheet('#C8321E', m => { for (const [x, y, a] of [[300, 40, -1.9], [-110, 70, -1.2], [-380, 40, -2.2], [160, 46, -1.5]]) panicle(m, x, y, a, 95, 7); }, { depth: .37, trans: .75 }),
    sheet('#2a1610', m => { m.beginPath(); m.arc(0, 0, BR, 0, 7); m.fill(); }, { depth: .6, trans: .4, cut: m => { m.beginPath(); m.arc(0, 0, 66, 0, 7); m.fill(); for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2; m.save(); m.rotate(a); m.beginPath(); m.ellipse(128, 0, 44, 3, 0, 0, 7); m.fill(); m.restore(); } } }),
    sheet('#5a2a20', full, { depth: .85, trans: .22, rim: '#ffb46a', rimA: .8, cut: m => { almond(m, EW, EH); m.fill(); } }),
    sheet('#140806', m => { m.beginPath(); m.moveTo(-460, -340); m.quadraticCurveTo(-60, -520, 440, -350); m.quadraticCurveTo(-60, -455, -460, -340); m.fill(); }, { depth: .86, trans: .05 }),
    sheet('#060509', m => {
      m.beginPath(); m.moveTo(-EW / 2 - 6, -4); m.bezierCurveTo(-EW * .2, -EH * .99, EW * .25, -EH * 1.04, EW / 2 + 4, -EH * .1);
      m.lineTo(EW / 2 + 150, -EH * .38); m.lineTo(EW / 2 + 10, -EH * .02); m.bezierCurveTo(EW * .25, -EH * .92, -EW * .2, -EH * .88, -EW / 2 + 6, 4); m.closePath(); m.fill();
      for (let k = 0; k < 13; k++) { const u = .12 + k * .065, x = lerp(-EW * .42, EW * .44, u), y = -EH * .9 * Math.sin(Math.PI * (u * .9 + .05)) - 6; m.save(); m.translate(x, y); m.rotate(-.5 + u * .9); m.beginPath(); m.moveTo(-5, 0); m.quadraticCurveTo(-4, -40, 14, -58); m.quadraticCurveTo(4, -36, 5, 0); m.fill(); m.restore(); }
    }, { depth: .9, trans: .02 }),
    sheet('#ffe9c8', word('Chagali', 190, 0, -720), { depth: .95, trans: .95 }),
    sheet('#ffe9c8', word('Kajala', 190, 0, 470), { depth: .95, trans: .95 }),
  ];
  // S6 · the full moon, the cuckoo, and her on the balcony
  const LB = [[480, -10, -2.3, 140], [330, 10, .8, 130], [180, -20, -1.9, 130], [10, 10, 1.0, 120], [-170, -20, -2.4, 120], [-330, 0, .9, 120]];
  S6 = [
    sheet('#141a40', full, { depth: 0, trans: .9 }),
    sheet('#2a3166', m => { for (const [y, x0, x1] of [[-420, -700, -60], [-300, 120, 700], [-60, -700, -200]]) { m.beginPath(); m.ellipse((x0 + x1) / 2, y, (x1 - x0) / 2, 22, 0, 0, 7); m.fill(); } }, { depth: .2, trans: .45 }),
    sheet('#fff2dc', word('Koyili', 230, 0, 420), { depth: .3, trans: .95 }),
    sheet('#fff2dc', word('Kuhu  Kuhu', 210, 0, 420), { depth: .3, trans: .95 }),
    sheet('#0a0b1c', m => branch(m, [[700, 60], [400, -10], [100, 30], [-200, -30], [-700, 20]], 22, LB), { depth: .6, trans: .2, cut: m => veins(m, LB) }),
    sheet('#C8321E', m => { for (const [x, y, a] of [[420, -10, -1.4], [-60, 10, -1.7], [-420, -10, -1.2]]) panicle(m, x, y, a, 110, 8); }, { depth: .61, trans: .75 }),
    sheet('#05050c', m => cuckoo(m, -30, -82, 1.15), { depth: .62, trans: .03, rim: '#ffe2b0', rimA: .9, cut: m => { m.beginPath(); m.arc(-30 - 30 * 1.15, -82 - 36 * 1.15, 5, 0, 7); m.fill(); } }),
    sheet('#05050c', m => { M.profile(m, 1.0, 330, 1000); m.fillRect(-LW / 2, 1180, LW, LH); m.fillRect(-LW / 2, 1100, LW, 22); for (let k = 0; k < 13; k++) { const x = -660 + k * 110; m.fillRect(x - 10, 1100, 20, 90); } }, { depth: .95, trans: .03, cut: m => M.profileCuts(m, 1.0, 330, 1000), rim: '#ffd9a0', rimA: .8 }),
  ];
  S6.beak = [-30 - 80 * 1.15, -82 - 35 * 1.15];
}

// ---------- particles: gold dust, scent ribbons, fireflies ----------
function dust(c, t, n, fn, col = 'rgba(255,214,150,1)', a = 1, seed = 1) {
  if (a <= 0) return; const R = mulberry(seed);
  for (let i = 0; i < n; i++) { const p = fn(i, R(), R(), R()); if (!p) continue; const [x, y, s, al] = p; const A = a * al; if (A <= .01) continue; glow(c, x, y, s * 3, col, A * .45); c.save(); c.globalAlpha = Math.min(1, A); c.fillStyle = '#fff1d6'; c.beginPath(); c.arc(x, y, s * .55, 0, 7); c.fill(); c.restore(); }
}
const fireflies = (c, t, n, a, seed) => dust(c, t, n, (i, r1, r2, r3) => { const x = (r1 * W + 60 * Math.sin(t * (.3 + r2) + i)) % W, y = H * (.15 + .7 * r2) + 40 * Math.sin(t * (.5 + r3) + i * 2); return [x, y, 3 + 3 * r3, .5 + .5 * Math.sin(t * (2 + r1 * 3) + i)]; }, 'rgba(255,220,140,1)', a, seed);

// ---------- scenes ----------
function lampOn(L, t, times) { L.forEach((l, i) => l.lit = ss(seg(t, times[i] ?? 0, (times[i] ?? 0) + .45))); }
function sc1(c, t) {
  lampOn(S1, t, [0.07, 0.63, 2.25, 1.18, 1.74, 1.74]);
  const cam = { x: 0, y: lerp(20, -30, eio(seg(t, 0, 5))), z: lerp(1.0, 1.12, eio(seg(t, 0, 5))) }, scr = scrOf(cam);
  c.fillStyle = '#0c0405'; c.fillRect(0, 0, W, H);
  drawStack(c, S1, cam, { x: W / 2 - 120, y: H * .3, r: 1500, I: 1.05 * flick(t) }, { after: [(cc) => { const [x, y, z] = scr(S1[0], -130, -250); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); glow(cc, x, y, 170 * z, 'rgba(255,214,150,1)', .55); cc.fillStyle = '#ffeec8'; cc.beginPath(); cc.arc(x, y, 150 * z, 0, 7); cc.fill(); cc.restore(); }] });
  const on = ss(seg(t, 0.07, 1.9)); c.save(); c.globalAlpha = .62 * (1 - on); c.fillStyle = '#080203'; c.fillRect(0, 0, W, H); c.restore();
  // the spell: gold dust spiralling out of her eye, a new arm on every beat
  const [ex, ey, z] = scr(S1[4], ...S1.eye);
  glow(c, ex, ey, 30 * z, 'rgba(255,200,120,1)', .5 * on);
  dust(c, t, 90, (i, r1, r2) => { const born = 1.18 + r1 * 3.2; const u = t - born; if (u < 0) return null; const a = r2 * 6.28 + u * 2.4, r = 20 + u * 210 * (.6 + r2); return [ex - Math.cos(a) * r * 1.1, ey + Math.sin(a) * r * .8 - u * 40, 2.2 + 2 * r2, (1 - seg(u, 1.4, 2.6)) * seg(u, 0, .2)]; }, 'rgba(255,205,130,1)', 1, 7);
}
function sc2(c, t) {
  S2.forEach(l => l.lit = 1);
  const tilt = eio(seg(t, 7.2, 8.7)), cam = { x: 0, y: lerp(60, 520, tilt), z: lerp(1.08, 1.0, eio(seg(t, 4.5, 8.96))) }, scr = scrOf(cam);
  c.fillStyle = '#0c0405'; c.fillRect(0, 0, W, H);
  drawStack(c, S2, cam, { x: W * .45, y: H * .3, r: 1500, I: 1.0 * flick(t) });
  // salt on the lips: a few crystalline glints
  const [lx, ly, z] = scr(S2[3], ...S2.lip);
  dust(c, t, 9, (i, r1, r2) => [lx + (r1 - .3) * 70 * z, ly - 40 * z + r2 * 70 * z, 1.6, .35 + .65 * Math.max(0, Math.sin(t * 4 + i * 1.7))], 'rgba(255,255,255,1)', seg(t, 4.6, 5.2) * (1 - seg(t, 7.0, 7.4)), 3);
  // sweet: a glowing drop gathers on the beat (6.73), falls (7.27), lands in the pond (≈8.0) and rings
  const g = ss(seg(t, 6.73, 7.27)), fall = Math.max(0, t - 7.27), py = Math.min(fall * fall * 1500, 1010 - S2.lip[1]);
  const pond = scr(S2[4], S2.lip[0] + 20, 1010);
  if (g > 0 && py < 1010 - S2.lip[1] - 1) { const [x, y, zz] = scr(S2[3], S2.lip[0] + 4, S2.lip[1] + 8 + py), r = (6 + 10 * g) * zz; glow(c, x, y, r * 2.2, 'rgba(255,170,90,1)', .7); c.save(); c.fillStyle = '#e8462a'; c.beginPath(); c.moveTo(x, y - r * 2.2); c.quadraticCurveTo(x + r * 1.1, y - r * .1, x, y + r); c.quadraticCurveTo(x - r * 1.1, y - r * .1, x, y - r * 2.2); c.fill(); c.fillStyle = 'rgba(255,230,180,.85)'; c.beginPath(); c.arc(x - r * .3, y - r * .3, r * .28, 0, 7); c.fill(); c.restore(); }
  const land = 7.27 + Math.sqrt((1010 - S2.lip[1]) / 1500);
  for (let k = 0; k < 4; k++) { const u = seg(t, land + k * .28, land + k * .28 + 1.3); if (u <= 0 || u >= 1) continue; c.save(); c.strokeStyle = `rgba(255,200,130,${(1 - u) * .85})`; c.lineWidth = 3 * pond[2]; c.shadowColor = 'rgba(255,160,80,.9)'; c.shadowBlur = 14; c.beginPath(); c.ellipse(pond[0], pond[1], (20 + 300 * eo(u)) * pond[2], (6 + 60 * eo(u)) * pond[2], 0, 0, 7); c.stroke(); c.restore(); }
  if (t > land) glow(c, pond[0], pond[1], 120 * pond[2], 'rgba(255,170,90,1)', .5 * (1 - seg(t, land, land + 1.4)));
}
function sc3(c, t) {
  S3.forEach(l => l.lit = 1); S3[5].ox = lerp(-160, 120, seg(t, 8.96, 13.4)); S3[5].oy = -4 * Math.abs(Math.sin(t * 5.6));
  const u = eio(seg(t, 8.96, 13.6)), cam = { x: lerp(-170, 170, u), y: lerp(40, -30, u), z: 1.06 }, scr = scrOf(cam);
  c.fillStyle = '#0c0405'; c.fillRect(0, 0, W, H);
  drawStack(c, S3, cam, { x: W * .55, y: H * .28, r: 1600, I: 1.0 * flick(t) }, { before: [(cc) => { const [x, y, z] = scr(S3[0], 260, -120); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); glow(cc, x, y, 160 * z, 'rgba(255,230,170,1)', .8); cc.restore(); }] });
  // the scent: golden ribbons drifting toward the viewer, swelling on the beats
  const sw = 1 + .6 * pulse(t, 8.96, 13.4, 2.5);
  dust(c, t, 120, (i, r1, r2, r3) => { const lane = i % 3, x = ((r1 * 1.4 + (t - 8.96) * (.16 + .05 * lane)) % 1.4 - .2) * W, y = H * (.38 + .12 * lane) + 70 * Math.sin(x / 140 + lane * 2 + t) + r2 * 30; return [x, y, (1.8 + 2.4 * r3) * sw, .35 + .4 * r2]; }, 'rgba(255,214,140,1)', seg(t, 9.2, 9.9), 11);
}
function sc4(c, t) {
  S4.forEach(l => l.lit = 1); S4[3].rot = -.2 * eio(seg(t, 13.9, 15.7));
  const push = eio(seg(t, 16.9, 17.86)), cam = { x: lerp(0, 60, push), y: lerp(lerp(60, -40, eio(seg(t, 13.4, 16.9))), 30, push), z: lerp(1.05, 3.6, Math.pow(push, 1.5)) }, scr = scrOf(cam);
  const rise = eo(seg(t, 13.4, 15.9)), [mx, my, z] = scr(S4[0], -170, lerp(560, -380, rise));
  c.fillStyle = '#04050c'; c.fillRect(0, 0, W, H);
  drawStack(c, S4, cam, { x: mx, y: my, r: 1500, I: .85 * flick(t) }, {
    after: [(cc) => { glow(cc, mx, my, 220 * z, 'rgba(255,226,170,1)', .5); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.fillStyle = '#fff0d4'; cc.beginPath(); cc.arc(mx, my, 230 * z, 0, 7); cc.fill(); cc.restore(); }],
  });
  fireflies(c, t, 40, seg(t, 14.2, 15.2), 21);
  S4.forEach((l, i) => { if (i === 4) for (let k = 0; k < 4; k++) { const [x, y, zz] = scr(l, -400 + k * 110 + 34, 730); glow(c, x, y, 22 * zz, 'rgba(255,170,80,1)', .55 * flick(t * 1.6, k)); } });
}
function sc5(c, t) {
  const L = S5; L.forEach(l => { l.lit = 1; l.ox = 0; l.oy = 0; l.blur = 0; l.alpha = 1; });
  let ix = 0; const bs = BEATS.filter(b => b >= 17.86 && b < 22.29), pos = [-150, 130, -60, 160, -140, 90, -170, 120, 0];
  for (let i = 0; i < bs.length; i++) if (t >= bs[i]) ix = lerp(i ? pos[i - 1] : 0, pos[i], backE(seg(t, bs[i], bs[i] + .2), 1.2));
  L[3].ox = ix; L[3].oy = -16 * Math.sin(t * 1.3);
  const kj = seg(t, 20.06, 20.64); L[6].ox = 820 * (1 - backE(kj, .9)); L[6].alpha = kj > 0 ? 1 : 0;
  L[7].alpha = seg(t, 17.95, 18.4) * (1 - seg(t, 19.8, 20.1)); L[7].oy = 30 * (1 - eo(seg(t, 17.95, 18.6)));
  L[8].alpha = seg(t, 20.64, 21.1) * (1 - seg(t, 22.0, 22.29)); L[8].oy = 30 * (1 - eo(seg(t, 20.64, 21.3)));
  const rack = ss(seg(t, 20.06, 20.7)); for (const i of [0, 1, 2, 3]) L[i].blur = 2 * rack;
  const dive = eio(seg(t, 21.9, 22.4));
  const cam = { x: 0, y: lerp(10, 0, eio(seg(t, 17.86, 22))), z: lerp(lerp(1.0, 1.08, eio(seg(t, 17.86, 21.9))), 2.6, dive) }, scr = scrOf(cam);
  c.fillStyle = '#05050d'; c.fillRect(0, 0, W, H);
  drawStack(c, L, cam, { x: W / 2, y: H / 2 - 120, r: 1300, I: 1.0 * flick(t) }, { after: [(cc) => { const [mx, my, z] = scr(L[0], 250, -250); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); glow(cc, mx, my, 90 * z, 'rgba(255,220,160,1)', .5); cc.fillStyle = '#ffeccc'; cc.beginPath(); cc.arc(mx, my, 62 * z, 0, 7); cc.fill(); cc.restore(); }] });
  const [px, py, z] = scr(L[3], 0, 0); glow(c, px, py, 50 * z, 'rgba(255,200,130,1)', .35 + .4 * pulse(t, 17.86, 22.29)); c.save(); c.globalAlpha = .85; c.fillStyle = '#fff3dc'; c.beginPath(); c.ellipse(px - 70 * z, py - 80 * z, 22 * z, 14 * z, -.5, 0, 7); c.fill(); c.restore();
}
function sc6(c, t) {
  const L = S6; L.forEach(l => { l.lit = 1; l.ox = 0; l.oy = 0; l.alpha = 1; });
  const fly = seg(t, 22.29, 22.83); L[6].ox = lerp(-760, 0, eo(fly)); L[6].oy = lerp(-420, 0, eo(fly)) - 22 * Math.sin(Math.PI * fly) + (t > 22.83 ? -7 * Math.sin(seg(t, 22.83, 23.1) * Math.PI) : 0) + (t > 24.52 ? -6 * pulse(t, 24.52, 27, 6) : 0);
  L[2].alpha = seg(t, 22.83, 23.3) * (1 - seg(t, 24.1, 24.45)); L[3].alpha = seg(t, 24.52, 24.95);
  L[1].ox = 40 * Math.sin(t * .3);
  const lat = eio(seg(t, 22.29, 24.6)), out = eio(seg(t, 24.52, 26.6));
  const cam = { x: lerp(-60, 60, lat) * (1 - out), y: lerp(-40, 250, out), z: lerp(1.18, .93, out) }, scr = scrOf(cam);
  const [mx, my, z] = scr(L[0], 0, -200);
  c.fillStyle = '#04050c'; c.fillRect(0, 0, W, H);
  drawStack(c, L, cam, { x: mx, y: my, r: 1500, I: .9 * flick(t) }, {
    after: [(cc) => { glow(cc, mx, my, 400 * z, 'rgba(255,220,160,1)', .4); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); const g = cc.createRadialGradient(mx - 60 * z, my - 60 * z, 40 * z, mx, my, 430 * z); g.addColorStop(0, '#fff6e2'); g.addColorStop(1, '#ffd9a0'); cc.fillStyle = g; cc.beginPath(); cc.arc(mx, my, 430 * z, 0, 7); cc.fill(); cc.restore(); }],
  });
  if (t > 24.4) { const [bx, by, zz] = scr(L[6], ...S6.beak); BEATS.filter(b => b >= 24.52 && b <= t).forEach(b => { const u = seg(t, b, b + 1.1); if (u >= 1) return; c.save(); c.strokeStyle = `rgba(255,214,150,${(1 - u) * .9})`; c.lineWidth = 3.5 * zz; c.shadowColor = 'rgba(255,170,90,.9)'; c.shadowBlur = 16; c.beginPath(); c.arc(bx, by, (20 + 300 * eo(u)) * zz, Math.PI * .65, Math.PI * 1.35); c.stroke(); c.restore(); }); }
  fireflies(c, t, 36, 1, 33);
}

// ---------- glosses (tiny, classy, English) ----------
function gloss(c, txt, t0, t1, y, t, col = 'rgba(255,240,220,.85)') {
  const a = seg(t, t0, t0 + .6) * (1 - seg(t, t1 - .3, t1)); if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.font = '500 30px Cormorant'; c.letterSpacing = '9px'; c.fillStyle = col; c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 8; c.fillText(txt.toUpperCase(), W / 2, y); c.restore();
}

// ---------- render ----------
function xfade(c, t, t0, d, A, B) { const a = ss(seg(t, t0, t0 + d)); if (a <= 0) return A(c, t); if (a >= 1) return B(c, t); A(c, t); const b = BUF.getContext('2d'); b.setTransform(1, 0, 0, 1, 0, 0); B(b, t); c.globalAlpha = a; c.drawImage(BUF, 0, 0); c.globalAlpha = 1; }
window.DUR = DUR;
window.render = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  if (t < 4.30) sc1(ctx, t);
  else if (t < 4.75) xfade(ctx, t, 4.30, .45, sc1, sc2);
  else if (t < 8.75) sc2(ctx, t);
  else if (t < 9.25) xfade(ctx, t, 8.75, .5, sc2, sc3);
  else if (t < 13.15) sc3(ctx, t);
  else if (t < 13.75) xfade(ctx, t, 13.15, .6, sc3, sc4);
  else if (t < 17.55) sc4(ctx, t);
  else if (t < 18.0) xfade(ctx, t, 17.55, .45, sc4, sc5);
  else if (t < 22.15) sc5(ctx, t);
  else if (t < 22.5) xfade(ctx, t, 22.15, .35, sc5, sc6);
  else sc6(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .78); v.addColorStop(0, 'rgba(10,4,6,0)'); v.addColorStop(1, 'rgba(10,4,6,.45)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  if (!Q.has('nowords')) {
    gloss(ctx, 'magic', 2.6, 4.3, 640, t, 'rgba(90,24,14,.85)');
    gloss(ctx, 'sweet · from salty lips', 5.0, 7.3, 410, t, 'rgba(90,24,14,.85)');
    gloss(ctx, 'mango blossom', 9.8, 13.1, 400, t, 'rgba(90,24,14,.85)');
    gloss(ctx, 'enchantment', 14.2, 17.4, 420, t);
    gloss(ctx, 'restless eyes', 18.3, 20.0, 360, t);
    gloss(ctx, 'the kohl line', 21.0, 22.2, 1625, t);
    gloss(ctx, 'her voice · a cuckoo', 23.1, 24.4, 1575, t);
    gloss(ctx, 'sings', 25.0, 26.5, 1500, t);
  }
  const end = ss(seg(t, 26.35, 26.7)); if (end > 0) { ctx.globalAlpha = end * .9; ctx.fillStyle = '#04050c'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
};
window.TEXTS = t => [];
window.EV = [0.07, 4.5, 8.96, 13.4, 17.86, 20.06, 22.29, 24.52].map((t, i) => ({ t, type: 'line', i }));

(async () => {
  const base = new URL('.', import.meta.url).href;
  for (const f of ['200px "Pinyon Script"', '500 30px Cormorant']) await document.fonts.load(f, 'Jadu');
  const [fibre, pulp] = await Promise.all([load(base + 'assets/fibre.png'), load(base + 'assets/pulp.png')]);
  initLightbox(fibre, pulp); build();
  window.render(Number(Q.get('t') || 0)); window.READY = true;
})();
