// The legend, drawn in rice paste on one red-earth floor; the camera travels over it. World units = floor pixels (x 0..2160,
// y -2400..3360: north is up). Places: the north (mountains, a river, the road) · the sanctum (540, 960) · the threshold
// (540, 1800) · the lane and Lakshmi's house (1620, 2640) · the king's palace (1620, 900).
import { jhoti, padaOutline, padaSolid, lotus, lata, rowDots, flute, feather, seat, house, temple, inlay, S, D, bez, chain, circle, xf } from './jhoti.js';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); }, eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }, eo = x => 1 - Math.pow(1 - clamp(x), 3);
const hh = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const BLUE = '#2c4f8f', ALTA = '#c32a1a';
let FLB = null;
export function initLegend(floorBig) { FLB = floorBig; build(); }

// ---------------- the camera: (t, cx, cy, z), monotone cubic per channel ----------------
function mono(keys) {
  const n = keys.length, xs = keys.map(k => k[0]), out = [];
  for (let ch = 1; ch < keys[0].length; ch++) {
    const ys = keys.map(k => k[ch]), d = [], m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : 3 * (xs[i + 1] - xs[i - 1]) / ((2 * xs[i + 1] - xs[i] - xs[i - 1]) / d[i - 1] + (xs[i + 1] + xs[i] - 2 * xs[i - 1]) / d[i]);
    out.push(t => { if (t <= xs[0]) return ys[0]; if (t >= xs[n - 1]) return ys[n - 1]; let i = 0; while (t > xs[i + 1]) i++; const h = xs[i + 1] - xs[i], u = (t - xs[i]) / h, u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1]; });
  }
  return t => out.map(f => f(t));
}
const CAM = mono([
  [16.2, 540, 1020, 1.16], [19.8, 540, 960, 1.0], [21.95, 540, 1010, 1.0], [22.9, 540, 1700, 1.0], [26.4, 540, 1720, 1.05],
  [27.4, 600, 1760, 1.0], [28.7, 1060, 2200, .95], [30.0, 1560, 2560, 1.0], [30.9, 1620, 2620, 1.08], [33.6, 1620, 2650, 1.16],
  [34.3, 1620, 2650, 1.08], [36.9, 1620, 2660, .86], [37.5, 1620, 2500, .9], [38.6, 1620, 1150, 1.0], [41.7, 1620, 1150, 1.08],
  [42.5, 820, -1250, .56], [43.2, 600, -1300, .56], [44.0, 560, -100, .7], [44.75, 540, 900, 1.0], [46.4, 540, 960, 1.0],
  [48.4, 650, 920, 1.06], [49.85, 700, 900, 1.12], [50.6, 760, 850, 4.2],
]);
const CAMC = mono([[64.6, 1620, 2620, 1.12], [67.8, 1620, 2640, .98], [69.6, 1620, 2700, .8], [70.8, 1620, 2700, .76]]);
export function legendCam(t) { return t > 60 ? CAMC(t) : CAM(t); }

// ---------------- the motifs (built once) ----------------
const M = {};
function arch(cx, top, w, h) {   // the sanctum's doorway: two pillars with capitals, a pointed arch, a kalasha on top, dotted rows
  const st = [], L = cx - w / 2, R = cx + w / 2, b = top + h;
  for (const x of [L, R]) { st.push(S([[x, b], [x, top + 260]], 10, { taper: .05 }), S([[x + (x < cx ? 34 : -34), b], [x + (x < cx ? 34 : -34), top + 270]], 6, { taper: .1 }));
    st.push(S(chain(bez([x - 30, top + 270], [x - 10, top + 240], [x + 10, top + 240], [x + 30, top + 270])), 7, { taper: .1 })); for (let k = 0; k < 9; k++) st.push(D(x + (x < cx ? 17 : -17), b - 40 - k * 64, 5)); }
  st.push(S(chain(bez([L, top + 260], [L, top + 80], [cx - 120, top + 10], [cx, top - 40]), bez([cx, top - 40], [cx + 120, top + 10], [R, top + 80], [R, top + 260])), 11, { taper: .05 }));
  st.push(S(chain(bez([L + 40, top + 270], [L + 44, top + 120], [cx - 100, top + 60], [cx, top + 18]), bez([cx, top + 18], [cx + 100, top + 60], [R - 44, top + 120], [R - 40, top + 270])), 6, { taper: .1 }));
  st.push(...lotus(cx, top - 100, 52, { w: 6 }));
  for (let k = 0; k < 13; k++) { const u = k / 12, [x, y] = bez([L + 20, top + 230], [L + 24, top + 100], [cx - 110, top + 40], [cx, top - 10], 12)[k]; st.push(D(x + 1, y + 30, 4.2)); const [x2, y2] = bez([R - 20, top + 230], [R - 24, top + 100], [cx + 110, top + 40], [cx, top - 10], 12)[k]; st.push(D(x2 - 1, y2 + 30, 4.2)); }
  st.push(S([[L - 60, b], [R + 60, b]], 9, { taper: 0 }), ...rowDots(L - 50, R + 50, b + 26, 22, 5));
  return st;
}
function mountains() {
  const st = [];
  for (const [x, y, w, h] of [[260, -2050, 300, 300], [520, -2120, 380, 380], [800, -2040, 300, 280], [1020, -1990, 240, 220], [80, -1990, 220, 200]]) {
    st.push(S([[x - w / 2, y + h / 2], [x, y - h / 2], [x + w / 2, y + h / 2]], 9, { taper: .1 }));
    st.push(S([[x - w * .17, y - h * .17], [x - w * .05, y - h * .08], [x + w * .06, y - h * .2], [x + w * .17, y - h * .17]], 6, { taper: .2 }));   // snow line
  }
  for (let k = 0; k < 3; k++) { const pts = []; for (let x = -100; x <= 1200; x += 6) pts.push([x, -1760 + k * 26 + Math.sin(x / 70 + k) * 18 + x * .18]); st.push(S(pts, 5, { taper: .1 })); }   // the river
  return st;
}
const ROAD = [[540, -1880], [180, -1300], [920, -800], [540, 280]];
function road() { const st = [], P = bez(...ROAD, 90); for (let i = 0; i < P.length; i += 2) { const [x, y] = P[i], [x2, y2] = P[Math.min(P.length - 1, i + 1)], a = Math.atan2(y2 - y, x2 - x) + Math.PI / 2; st.push(D(x + Math.cos(a) * 34, y + Math.sin(a) * 34, 5), D(x - Math.cos(a) * 34, y - Math.sin(a) * 34, 5)); } return st; }
function palanquin(x, y, s = 1, rot = 0) {   // a doli: a domed box on a long pole, carried
  const L = [S([[-170, 0], [170, 0]], 8, { taper: 0 }), S(chain(bez([-70, 0], [-70, -60], [-50, -90], [0, -96]), bez([0, -96], [50, -90], [70, -60], [70, 0])), 8, { taper: .05 }),
    S([[-70, -40], [70, -40]], 5, { taper: .2 }), S(circle(0, -118, 14), 6, { taper: .05 }), D(-150, 0, 7), D(150, 0, 7)];
  for (const [px, py] of [[-36, -20], [0, -20], [36, -20]]) L.push(D(px, py, 4.5));
  return L.map(st => st.dot ? D(...xf(st.pts, x, y, s, rot)[0], st.w / 2 * s) : S(xf(st.pts, x, y, s, rot), st.w * s, { taper: st.taper }));
}
function palace(x, y) {
  const st = [S([[x - 300, y], [x + 300, y]], 9, { taper: 0 })];
  for (const [cx, w, h] of [[x - 180, 110, 170], [x, 160, 250], [x + 180, 110, 170]]) {
    st.push(S([[cx - w / 2, y], [cx - w / 2, y - h]], 7, { taper: .1 }), S([[cx + w / 2, y], [cx + w / 2, y - h]], 7, { taper: .1 }));
    st.push(S(chain(bez([cx - w / 2 - 10, y - h], [cx - w / 2, y - h - w * .7], [cx - 10, y - h - w * .8], [cx, y - h - w * .95]), bez([cx, y - h - w * .95], [cx + 10, y - h - w * .8], [cx + w / 2, y - h - w * .7], [cx + w / 2 + 10, y - h])), 8, { taper: .05 }));
    st.push(S(chain(bez([cx - w * .25, y], [cx - w * .25, y - h * .45], [cx - w * .1, y - h * .55], [cx, y - h * .56]), bez([cx, y - h * .56], [cx + w * .1, y - h * .55], [cx + w * .25, y - h * .45], [cx + w * .25, y])), 6, { taper: .1 }));
    st.push(D(cx, y - h - w * .95 - 16, 6));
  }
  st.push(...rowDots(x - 290, x + 290, y + 26, 22, 5));
  return st;
}
function sunMotif(x, y, r) { const st = [S(circle(x, y, r), 6, { taper: .05 })]; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; st.push(S([[x + Math.cos(a) * (r + 10), y + Math.sin(a) * (r + 10)], [x + Math.cos(a) * (r + 30), y + Math.sin(a) * (r + 30)]], 5, { taper: .4 })); } st.push(D(x, y, r * .3)); return st; }
function crescent(x, y, r) { return [S(chain(bez([x + r * .3, y - r], [x - r * 1.1, y - r * .8], [x - r * 1.1, y + r * .8], [x + r * .3, y + r]), bez([x + r * .3, y + r], [x - r * .45, y + r * .5], [x - r * .45, y - r * .5], [x + r * .3, y - r])), 6, { taper: .1 })]; }
function dreamScroll(x0, y0, x1, y1) {   // the dream: a cloud-scroll curling from the palace window down to a round field
  const st = [S(chain(bez([x0, y0], [x0 - 120, y0 + 60], [x0 + 80, y0 + 140], [x0 - 20, y0 + 200]), bez([x0 - 20, y0 + 200], [x0 - 140, y0 + 250], [x1 - 260, y1 - 240], [x1 - 200, y1 - 190])), 6, { taper: .3 })];
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, r = 250; const cx = x1 + Math.cos(a) * r, cy = y1 + Math.sin(a) * r; st.push(S(chain(bez([cx, cy], [cx + Math.cos(a + 1.3) * 40, cy + Math.sin(a + 1.3) * 40], [cx + Math.cos(a + .4) * 60, cy + Math.sin(a + .4) * 60], [x1 + Math.cos(a + .39) * r, y1 + Math.sin(a + .39) * r])), 5, { taper: .2 })); }
  return st;
}
function build() {
  M.arch = arch(540, 420, 860, 800);
  M.seatL = seat(320, 1060, 280); M.seatR = seat(760, 1060, 280);
  M.gSign = [...feather(250, 760, .9, -.25), ...flute(150, 700, 300, -.12)];
  M.gFeet = [...padaOutline(285, 960, 1.1, -.06, -1, { inner: false }), ...padaOutline(362, 966, 1.1, .22, 1, { inner: false })];
  M.rFeet = [...padaOutline(715, 962, 1.05, -.04, -1, { inner: false }), ...padaOutline(805, 962, 1.05, .04, 1, { inner: false })];
  M.guide = rowDots(640, 880, 960, 24, 3); M.guide2 = rowDots(640, 880, 900, 24, 3);
  M.border = [...lata(60, 1020, 1252, 14, 64)];
  M.threadLine = [S([[540, 2300], [540, 1360]], 6, { taper: 0, blob: 1 })];
  M.thresh = [...lata(180, 900, 1560, 12, 60), ...rowDots(190, 890, 1600, 24, 4.5)];
  M.mount = mountains(); M.road = road();
  M.house = house(1620, 2640, 330, 170); M.houseRow = [...rowDots(1400, 1840, 2672, 22, 4.5), ...lata(1390, 1850, 2700, 10, 50)];
  M.temple = temple(540, 1520, .55);
  M.palace = palace(1620, 820); M.moonP = crescent(1930, 470, 46); M.moonN = crescent(1900, 2120, 40);
  M.dream = dreamScroll(1620, 700, 1620, 1290);
  M.lotus = lotus(1620, 1250, 200, { w: 8 });
  M.stars = Array.from({ length: 70 }, (_, i) => D(1080 * hh(i) + (i % 2) * 1080, 1900 + hh(i + 50) * 500 - (i % 3 === 0 ? 1700 : 0), 2 + hh(i + 99) * 2.4));
  M.ghagra = [S(chain(bez([680, 640], [640, 760], [620, 880], [628, 990]), bez([628, 990], [700, 1012], [820, 1012], [892, 990]), bez([892, 990], [900, 880], [880, 760], [840, 640])), 9, { taper: .05 }),
    ...[660, 712, 764, 816].map(x => S([[x + 22, 650], [x + (x - 760) * .12, 960]], 4, { taper: .3 })), ...[660, 712, 764, 816, 868].map(x => S(circle(x - 4 + (x > 760 ? -6 : 6), 960, 12), 5, { taper: .05 })), S([[640, 940], [880, 940]], 5, { taper: .05 })];
  M.night = [];
  const P = bez([540, 1720], [600, 2180], [1300, 2080], [1600, 2600], 13);   // the night walk: his footsteps from the sanctum to her door
  M.walk = P.slice(1).map(([x, y], i) => { const [px, py] = P[i], a = Math.atan2(y - py, x - px) + Math.PI / 2, o = i % 2 ? 20 : -20; return { x: x + Math.cos(a) * o, y: y + Math.sin(a) * o, rot: a, m: i % 2 ? 1 : -1 }; });
}

// ---------------- the people's shadows (the accusation, and in the end the folded hands) ----------------
function shadow(c, fx, fy, ang, len, arm, fold) {   // feet at (fx, fy); the long low-sun shadow falls along ang toward the centre
  c.save(); c.translate(fx, fy); c.rotate(ang); c.scale(1.25, len / 430);
  c.beginPath(); c.moveTo(-15, 0); c.lineTo(-22, 196); c.lineTo(-4, 196); c.lineTo(0, 60); c.lineTo(4, 196); c.lineTo(22, 196); c.lineTo(15, 0); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-26, 190); c.lineTo(-34, 300); c.quadraticCurveTo(-56, 330, -52, 344); c.lineTo(-12, 352); c.lineTo(-10, 366); c.lineTo(10, 366); c.lineTo(12, 352); c.lineTo(52, 344); c.quadraticCurveTo(56, 330, 34, 300); c.lineTo(26, 190); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(0, 394, 23, 28, 0, 0, 7); c.fill();
  c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = c.fillStyle; c.lineWidth = 13;
  const hang = [64, 220], point = [86, 640], chest = [8, 330], h0 = [lerp(hang[0], point[0], arm), lerp(hang[1], point[1], arm)], hand = [lerp(h0[0], chest[0], fold), lerp(h0[1], chest[1], fold)];
  c.beginPath(); c.moveTo(50, 338); c.quadraticCurveTo(lerp(70, 78, arm), lerp(280, 480, arm), hand[0], hand[1]); c.stroke();
  const hl = [lerp(-64, -8, fold), lerp(220, 330, fold)]; c.beginPath(); c.moveTo(-50, 338); c.quadraticCurveTo(lerp(-70, -40, fold), 290, hl[0], hl[1]); c.stroke();
  if (fold > .4) { c.beginPath(); c.ellipse(0, 336, 9, 24 * fold, 0, 0, 7); c.fill(); }
  else if (arm > .3) { c.lineWidth = 6; c.beginPath(); c.moveTo(hand[0], hand[1]); c.lineTo(hand[0] + 4, hand[1] + 44 * arm); c.stroke(); }
  c.restore();
}
const CROWD = Array.from({ length: 7 }, (_, i) => { const a = -Math.PI - .2 + i / 6 * (Math.PI + .4) + (hh(i) - .5) * .12, r = 640 + hh(i + 7) * 80; return { a, r, len: 430 + hh(i + 3) * 70 }; });
let SHL = null;
function crowd(c, t, cx, cy, come, arm, fold) {   // all the shadows into one layer, then one blur and one multiply
  if (!SHL) { SHL = document.createElement('canvas'); SHL.width = 1080; SHL.height = 1920; }
  const k0 = SHL.getContext('2d'); k0.setTransform(1, 0, 0, 1, 0, 0); k0.clearRect(0, 0, 1080, 1920); k0.setTransform(c.getTransform()); k0.fillStyle = 'rgb(36,8,3)';
  let any = false;
  CROWD.forEach((p, i) => {
    const k = clamp(come * 1.6 - i * .07); if (k <= 0) return; any = true;
    const r = p.r + (1 - eo(k)) * 260, fx = cx + Math.cos(p.a) * r, fy = cy + Math.sin(p.a) * r;
    k0.globalAlpha = k; shadow(k0, fx, fy, p.a + Math.PI / 2, p.len, clamp(arm * 1.4 - i * .05), fold);
  });
  if (!any) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.globalAlpha = .55; c.filter = 'blur(2.5px)'; c.drawImage(SHL, 0, 0); c.restore();
}
function goldFlute(c, x, y, len, rot, glint = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = 'rgba(30,8,2,.45)'; c.filter = 'blur(6px)'; c.fillRect(6, 10, len, 20); c.filter = 'none';
  const g = c.createLinearGradient(0, -12, 0, 12); g.addColorStop(0, '#fff1b8'); g.addColorStop(.35, '#e8b83e'); g.addColorStop(.7, '#a8761c'); g.addColorStop(1, '#6e4a10');
  c.fillStyle = g; c.beginPath(); c.roundRect(0, -11, len, 22, 11); c.fill();
  for (let i = 0; i < 7; i++) { c.fillStyle = '#3a2408'; c.beginPath(); c.ellipse(len * .38 + i * len * .075, -2, 4, 3, 0, 0, 7); c.fill(); }
  for (const xx of [len * .06, len * .94]) { c.fillStyle = '#c8321e'; c.fillRect(xx - 6, -11, 12, 22); }
  if (glint > 0) { const gx = len * (.1 + .8 * glint); const gg = c.createRadialGradient(gx, -4, 0, gx, -4, 60); gg.addColorStop(0, `rgba(255,250,220,${.9 * Math.sin(Math.PI * glint)})`); gg.addColorStop(1, 'rgba(255,250,220,0)'); c.globalCompositeOperation = 'lighter'; c.fillStyle = gg; c.fillRect(gx - 60, -64, 120, 128); }
  c.restore();
}
export function flame(c, x, y, s = 1, t = 0, a = 1) {
  if (a <= 0) return; const fl = 1 + .07 * Math.sin(t * 13 + x) * Math.sin(t * 5.3 + y);
  c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(x, y - 14 * s, 2, x, y - 14 * s, 230 * s * fl); g.addColorStop(0, 'rgba(255,196,110,.5)'); g.addColorStop(1, 'rgba(255,140,60,0)'); c.fillStyle = g; c.fillRect(x - 260 * s, y - 270 * s, 520 * s, 520 * s);
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#ffd98a'; c.beginPath(); c.moveTo(x, y - 46 * s * fl); c.bezierCurveTo(x + 14 * s, y - 24 * s, x + 12 * s, y - 4 * s, x, y); c.bezierCurveTo(x - 12 * s, y - 4 * s, x - 14 * s, y - 24 * s, x, y - 46 * s * fl); c.fill();
  c.fillStyle = '#fff6dc'; c.beginPath(); c.ellipse(x, y - 10 * s, 4 * s, 9 * s, 0, 0, 7); c.fill();
  c.fillStyle = '#7a4a1e'; c.beginPath(); c.moveTo(x - 30 * s, y + 4 * s); c.quadraticCurveTo(x, y + 26 * s, x + 30 * s, y + 4 * s); c.closePath(); c.fill();
  c.restore();
}

// ---------------- the light over the floor ----------------
function light(t) {   // returns night (indigo amount), dawn (gold amount)
  if (t > 60) return { night: 0, dawn: .5 + .3 * seg(t, 64.6, 66) };
  const night = Math.max(ss(seg(t, 26.5, 27.3)) * (1 - ss(seg(t, 30.8, 31.6))), ss(seg(t, 36.9, 37.9)) * (1 - ss(seg(t, 41.7, 42.4))));
  const dawn = ss(seg(t, 30.9, 31.8)) * (1 - ss(seg(t, 36.9, 37.6)));
  return { night, dawn };
}

// ---------------- the whole legend, at time t ----------------
const P = (t, a, b) => ss(seg(t, a, b));
export function legend(c, t) {
  const [cx, cy, z] = legendCam(t), ox = 540 - cx * z, oy = 960 - cy * z, T = [z, ox, oy];
  const view = [cx - 560 / z, cy - 980 / z, cx + 560 / z, cy + 980 / z];
  const L = light(t);
  // floor
  c.save(); c.setTransform(z, 0, 0, z, ox, oy);
  c.fillStyle = '#9a3a22'; c.fillRect(view[0] - 10, view[1] - 10, view[2] - view[0] + 20, view[3] - view[1] + 20);
  c.globalCompositeOperation = 'multiply';
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const x0 = i * 2160, y0 = -2400 + j * 5760; if (x0 > view[2] || x0 + 2160 < view[0] || y0 > view[3] || y0 + 5760 < view[1]) continue;
    c.save(); c.translate(x0 + (i & 1 ? 2160 : 0), y0 + (j & 1 ? 5760 : 0)); c.scale(i & 1 ? -1 : 1, j & 1 ? -1 : 1); c.drawImage(FLB, 0, 0, 2160, 5760); c.restore(); }
  c.globalCompositeOperation = 'source-over';
  // colour inlays under the paste: Gopinath's indigo, Lakshmi's / Radha's alta
  const inl = (x, y, s, r, m, col, a) => { if (a > 0) inlay(c, x, y, s, r, m, col, .85 * a); };
  const coda = t > 60;
  if (!coda) {
    const g = P(t, 20.5, 21.3); inl(285, 960, 1.1, -.06, -1, BLUE, g); inl(362, 966, 1.1, .22, 1, BLUE, g);
    const r = P(t, 44.9, 45.6) * (1 - P(t, 47.7, 48.5)); inl(715, 962, 1.05, -.04, -1, ALTA, r); inl(805, 962, 1.05, .04, 1, ALTA, r);
    // Lakshmi coming every day: three days of footsteps up to the threshold, each day's fading as the next is drawn
    for (let d = 0; d < 3; d++) { const t0 = 22.55 + d * 1.35, a = P(t, t0, t0 + .25) * (1 - P(t, t0 + 1.25, t0 + 1.6) * (d < 2 ? .8 : 0)); const dx = [-150, 150, 0][d];
      for (let k = 0; k < 3; k++) { const ak = a * P(t, t0 + k * .17, t0 + k * .17 + .12); inl(540 + dx + (k % 2 ? 30 : -30), 2010 - k * 130, .72, 0, k % 2 ? 1 : -1, ALTA, ak); } }
    // the night walk: blue footsteps from the sanctum to her door
    M.walk.forEach((f, i) => inl(f.x, f.y, .66, f.rot, f.m, BLUE, P(t, 27.6 + i * .22, 27.75 + i * .22) * (1 - P(t, 41.8, 42.3))));
    // Lakshmi at her door (night: waiting; dawn: the flute beside her feet)
    const h = P(t, 28.9, 29.3) * (1 - P(t, 41.8, 42.3)); inl(1588, 2760, .78, -.05, -1, ALTA, h); inl(1652, 2760, .78, .05, 1, ALTA, h);
    // the dream: her footprint in the dream field
    const dr = P(t, 39.2, 39.7) * (1 - P(t, 41.9, 42.4)); inl(1620, 1290, 1.3, 0, 1, ALTA, dr);
  } else {
    const h = P(t, 64.7, 65.4); inl(1588, 2760, .78, -.05, -1, ALTA, h); inl(1652, 2760, .78, .05, 1, ALTA, h);
  }
  c.restore();

  // paste
  const items = [];
  const add = (strokes, p, o = {}) => { if (p > 0) items.push({ strokes, p, ...o }); };
  if (!coda) {
    add(M.threadLine, 1, { col: '#c32a1a', a: 1 - P(t, 17.4, 18.4) });   // the red thread, arrived from the temple, before the paste begins
    add(M.arch, P(t, 16.55, 18.1)); add(M.border, P(t, 17.0, 18.4));
    add(M.seatL, P(t, 18.1, 18.9)); add(M.seatR, P(t, 18.4, 19.2));
    add(M.guide, P(t, 19.0, 19.6), { a: .35 + .25 * Math.sin(t * 5) * (1 - P(t, 44.6, 45)) }); add(M.guide2, P(t, 19.2, 19.8), { a: .3 * (1 - P(t, 44.6, 45)) });
    add(M.gFeet, P(t, 20.5, 21.3)); add(M.gSign, P(t, 20.9, 21.9));
    add(M.thresh, P(t, 22.0, 22.9));
    for (let d = 0; d < 3; d++) { const t0 = 22.55 + d * 1.35, a = 1 - P(t, t0 + 1.25, t0 + 1.6) * (d < 2 ? .8 : 0), dx = [-150, 150, 0][d];
      for (let k = 0; k < 3; k++) add(padaOutline(540 + dx + (k % 2 ? 30 : -30), 2010 - k * 130, .72, 0, k % 2 ? 1 : -1, { inner: false }), P(t, t0 + k * .17, t0 + k * .17 + .14), { a }); }
    // days passing: the sun drawn, travelling over, turning to the moon; a sun counted for each day
    const arc = seg(t, 24.2, 26.6);
    if (t > 24.1 && t < 27.4) { const a = Math.PI * (1 - arc), sx = 540 + Math.cos(a) * 420, sy = 1520 - Math.sin(a) * 340; add(arc < .75 ? sunMotif(sx, sy, 36) : crescent(sx, sy, 36), 1, { a: P(t, 24.1, 24.4) * (1 - P(t, 26.9, 27.4)) }); }
    for (let k = 0; k < 6; k++) add(sunMotif(190, 1720 + k * 66, 14), P(t, 24.3 + k * .38, 24.5 + k * .38), { a: 1 - P(t, 41.8, 42.3) });
    add(M.stars, P(t, 26.7, 27.4), { a: Math.max(L.night, 0) });
    add(M.moonN, P(t, 27.0, 27.6), { a: 1 - P(t, 31, 31.8) });
    for (let i = 0; i < M.walk.length; i++) { const f = M.walk[i]; add(padaOutline(f.x, f.y, .66, f.rot, f.m, { inner: false }), P(t, 27.6 + i * .22, 27.8 + i * .22), { a: 1 - P(t, 41.8, 42.3) }); }
    add(M.house, P(t, 28.3, 29.6), { a: 1 - P(t, 41.8, 42.3) }); add(M.houseRow, P(t, 29.0, 29.9), { a: 1 - P(t, 41.8, 42.3) });
    add([...padaOutline(1588, 2760, .78, -.05, -1, { inner: false }), ...padaOutline(1652, 2760, .78, .05, 1, { inner: false })], P(t, 28.9, 29.4), { a: 1 - P(t, 41.8, 42.3) });
    // heavy feet of the village crowding in, smudging
    if (t > 33.9 && t < 42.4) { const st = []; CROWD.forEach((p, i) => { const k = P(t, 34.1 + i * .1, 34.4 + i * .1); if (k <= 0) return; const r = 330 + (i % 3) * 30, fx = 1620 + Math.cos(p.a) * r, fy = 2740 + Math.sin(p.a) * r * .8; st.push(...padaSolid(fx, fy, 1.05, p.a - Math.PI / 2, i % 2 ? 1 : -1)); }); add(st, 1, { col: '#cbbca6', a: .6 * (1 - P(t, 41.8, 42.3)) }); }
    // the dream
    add(M.palace, P(t, 37.6, 38.8), { a: 1 - P(t, 41.9, 42.4) }); add(M.moonP, P(t, 37.9, 38.4), { a: 1 - P(t, 41.9, 42.4) });
    add(M.dream, P(t, 38.5, 39.5), { a: 1 - P(t, 41.9, 42.4) });
    add(padaOutline(1620, 1290, 1.3, 0, 1, { inner: false }), P(t, 39.2, 39.7), { a: 1 - P(t, 41.9, 42.4) });
    add(M.lotus, P(t, 40.2, 41.4), { a: 1 - P(t, 41.9, 42.4) });
    // the north and the road; the palanquin comes down it to the sanctum
    add(M.mount, P(t, 41.9, 42.7)); add(M.road, P(t, 42.0, 42.9));
    const u = eio(seg(t, 42.4, 44.75)); if (t > 42.2 && t < 45.4) { const pts = bez(...ROAD, 200), i = Math.min(199, Math.floor(u * 199)), [x, y] = pts[i], [x2, y2] = pts[Math.min(199, i + 1)]; add(palanquin(x, y, 1.0, Math.atan2(y2 - y, x2 - x) * .15), 1, { a: P(t, 42.2, 42.5) * (1 - P(t, 44.8, 45.3)) }); }
    // Radha seated; then the ghagra drawn over her feet
    add(M.rFeet, P(t, 44.9, 45.7) * 1, { a: 1 - P(t, 47.7, 48.5) * .85 });
    add(M.ghagra, P(t, 46.8, 48.4));
  } else {
    add(M.house, 1); add(M.houseRow, 1);
    add([...padaOutline(1588, 2760, .78, -.05, -1, { inner: false }), ...padaOutline(1652, 2760, .78, .05, 1, { inner: false })], P(t, 64.7, 65.3));
    // the queue: footprints drawn up toward her feet along the line the film began with
    const Bq = bez([520, 3080], [1000, 3110], [1250, 2960], [1520, 2905], 30), q = []; for (let i = 0; i < 30; i++) { const [x, y] = Bq[i], [x2, y2] = Bq[i + 1], r = Math.atan2(y2 - y, x2 - x) + Math.PI / 2, nx = Math.cos(r - Math.PI / 2) * 0 + Math.cos(r) * 14, ny = Math.sin(r) * 14; q.push(...padaSolid(x - nx, y - ny, .5, r, -1), ...padaSolid(x + nx, y + ny, .5, r, 1)); }
    add(q, P(t, 68.3, 70.2), { col: '#ece2cf', a: .9 });
  }
  // the ghagra: under its lines the floor is painted over the feet (hidden)
  if (!coda && t > 47.5) {
    c.save(); c.setTransform(z, 0, 0, z, ox, oy); c.globalAlpha = P(t, 47.6, 48.5) * .92; c.fillStyle = '#7e3020';
    c.beginPath(); c.moveTo(680, 640); c.bezierCurveTo(640, 760, 620, 880, 628, 990); c.bezierCurveTo(700, 1012, 820, 1012, 892, 990); c.bezierCurveTo(900, 880, 880, 760, 840, 640); c.closePath(); c.fill(); c.restore();
  }
  jhoti(c, items, { T, view });
  // objects in the world: lamps, the flute, shadows
  c.save(); c.setTransform(z, 0, 0, z, ox, oy);
  if (!coda) {
    flame(c, 712, 1830, .8, t, P(t, 24.0, 24.4) * (1 - P(t, 41.8, 42.3)));       // Lakshmi's diya at the threshold
    flame(c, 1620, 2620, .85, t, P(t, 29.2, 29.6) * (1 - P(t, 31.6, 32.4)));    // the lamp in her door, at night
    flame(c, 120, 1040, .9, t, P(t, 16.4, 17.0)); flame(c, 960, 1040, .9, t, P(t, 16.6, 17.2));   // the sanctum's lamps
    const fa = P(t, 31.55, 32.1) * (1 - P(t, 41.8, 42.3)); if (fa > 0) { c.globalAlpha = fa; goldFlute(c, 1450 + (1 - eo(seg(t, 31.55, 32.1))) * 30, 2850, 360, -.04, seg(t, 32.4, 33.2)); c.globalAlpha = 1; }
    const come = seg(t, 33.95, 35.0) * (1 - P(t, 37.0, 37.8)), arm = P(t, 35.5, 36.5); if (come > 0) crowd(c, t, 1620, 2740, come, arm, 0);
    flame(c, 1625, 760, .7, t, P(t, 38.4, 38.9) * (1 - P(t, 41.9, 42.4)));     // the palace's lamp
  } else {
    goldFlute(c, 1450, 2850, 360, -.04, 0);
    crowd(c, t, 1620, 2740, P(t, 64.7, 65.6) * (1 - P(t, 69.0, 70.0)), 1, P(t, 67.9, 68.9));
  }
  c.restore();
  // the light: night (indigo), dawn (gold), the vignette
  if (L.night > 0) { c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = .62 * L.night; c.fillStyle = '#1d2852'; c.fillRect(0, 0, 1080, 1920); c.restore(); }
  if (L.dawn > 0) { c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = .35 * L.dawn; const g = c.createLinearGradient(0, 0, 1080, 400); g.addColorStop(0, '#ffd59a'); g.addColorStop(1, '#ff9a5a'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); c.restore(); }
  const g = c.createRadialGradient(540, 860, 240, 540, 940, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,3,1,.55)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
}
