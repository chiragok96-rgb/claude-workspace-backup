// What the artist's fingers draw on the lightbox (window 2, table metres): the sea lane, the boita, the wind, the moon.
import { P, SEA, LAND } from './sand.js';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const hh = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };

// the sea lane: Paradip, across the Bay, down the Malacca strait, past Singapore, the Java Sea, to Bali's north coast
const LANE_LL = [[86.7, 20.15], [87.4, 18.6], [89.2, 15.2], [91.8, 11.4], [94.6, 7.4], [97.0, 5.6], [99.2, 4.2], [100.5, 3.0], [102.3, 1.9], [103.9, 1.15], [105.3, -.4], [106.6, -2.0], [107.2, -3.3], [108.6, -5.0], [111.2, -5.8], [113.6, -6.45], [114.9, -7.55], [115.15, -8.0]];
function smooth(pts, n = 8) { const o = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[i + 1], d = pts[Math.min(pts.length - 1, i + 2)]; for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; o.push([0, 1].map(j => .5 * (2 * b[j] + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t3))); } } o.push(pts[pts.length - 1]); return o; }
export const LANE = smooth(LANE_LL.map(([a, b]) => P(a, b)), 10);
const LCUM = [0]; for (let i = 1; i < LANE.length; i++) LCUM.push(LCUM[i - 1] + Math.hypot(LANE[i][0] - LANE[i - 1][0], LANE[i][1] - LANE[i - 1][1]));
export const LANE_LEN = LCUM[LCUM.length - 1];
export function laneAt(u) {   // position and heading at fraction u of the lane (0 = Odisha, 1 = Bali)
  const d = clamp(u) * LANE_LEN; let i = 1; while (i < LCUM.length - 1 && LCUM[i] < d) i++;
  const f = (d - LCUM[i - 1]) / (LCUM[i] - LCUM[i - 1] || 1), a = LANE[i - 1], b = LANE[i];
  return { p: [lerp(a[0], b[0], f), lerp(a[1], b[1], f)], h: Math.atan2(b[1] - a[1], b[0] - a[0]) };
}
function lanePart(u0, u1) { const a = clamp(u0) * LANE_LEN, b = clamp(u1) * LANE_LEN, out = [laneAt(u0).p]; for (let i = 0; i < LANE.length; i++) if (LCUM[i] > a && LCUM[i] < b) out.push(LANE[i]); out.push(laneAt(u1).p); return out; }

// land mask (for the wind: streamlines only run over water)
let MASK, MW = 512, X0 = 5.5;
export function initArt(coast) {
  const c = document.createElement('canvas'); c.width = c.height = MW; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, MW, MW); x.fillStyle = '#fff'; x.beginPath();
  for (const r of coast.polys) { r.forEach((p, i) => { const px = (p[0] + X0) / (2 * X0) * MW, py = (p[1] + X0) / (2 * X0) * MW; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.closePath(); } x.fill();
  const d = x.getImageData(0, 0, MW, MW).data; MASK = new Uint8Array(MW * MW); for (let i = 0; i < MW * MW; i++) MASK[i] = d[i * 4] > 127 ? 1 : 0;
}
const land = (x, z) => { const i = Math.floor((x + X0) / (2 * X0) * MW), j = Math.floor((z + X0) / (2 * X0) * MW); return i < 0 || j < 0 || i >= MW || j >= MW ? 0 : MASK[j * MW + i]; };

// ---------------- drawing (all take the window-2 context d, the mapping toPx, px per metre k, grey-value g) ----------------
function path(d, pts, toPx) { d.beginPath(); pts.forEach((p, i) => { const [x, y] = toPx(p); i ? d.lineTo(x, y) : d.moveTo(x, y); }); }
// a groove dragged by a fingertip: a raised ridge either side, the cleared line in the middle (it glows)
export function groove(d, pts, toPx, k, g, w = .03, a = 1, val = .02) {
  if (pts.length < 2 || a <= 0) return;
  d.save(); d.globalAlpha = a; d.lineCap = d.lineJoin = 'round';
  path(d, pts, toPx); d.strokeStyle = g(.82); d.globalAlpha = a * .45; d.lineWidth = w * 3 * k; d.stroke(); d.globalAlpha = a; d.lineWidth = w * 2.2 * k; d.stroke();
  d.strokeStyle = g(val); d.globalAlpha = a * .5; d.lineWidth = w * 1.35 * k; d.stroke(); d.globalAlpha = a; d.lineWidth = w * k; d.stroke();
  d.restore();
}
export function lane(d, toPx, k, g, u0, u1, a = 1) { if (u1 > u0) groove(d, lanePart(u0, u1), toPx, k, g, .028, a); }

// the boita, drawn in profile as sand artists do (glowing body, brighter sails), at table point p, facing dir (+1 east / -1 west)
export function sandBoita(d, toPx, k, g, p, s, dir, sail, a = 1, t = 0) {
  const [cx, cy] = toPx(p), S = s * k; d.save(); d.globalAlpha = a; d.translate(cx, cy); d.scale(dir * S, S); d.rotate(Math.sin(t * 1.7) * .03);
  // hull: a long crescent, high stern fan at the back (-x), peacock neck at the prow (+x)
  d.fillStyle = g(.14); d.beginPath(); d.moveTo(-.5, -.12); d.quadraticCurveTo(-.46, .06, -.25, .1); d.lineTo(.3, .1); d.quadraticCurveTo(.48, .06, .52, -.06); d.lineTo(.47, -.05); d.quadraticCurveTo(.4, .0, .25, .0); d.lineTo(-.28, .0); d.quadraticCurveTo(-.42, -.02, -.46, -.14); d.closePath(); d.fill();
  d.beginPath(); d.moveTo(.47, -.05); d.bezierCurveTo(.56, -.12, .55, -.24, .6, -.3); d.lineWidth = .028; d.strokeStyle = g(.14); d.stroke(); d.beginPath(); d.ellipse(.615, -.31, .03, .02, -.3, 0, 7); d.fill();
  for (let i = 0; i < 5; i++) { d.beginPath(); d.moveTo(-.47, -.12); d.lineTo(-.52 - i * .012, -.28 + i * .03); d.lineWidth = .012; d.stroke(); }
  // masts and sails: slack sails hang as narrow drapes, full sails belly forward
  d.lineWidth = .012; d.strokeStyle = g(.1); d.beginPath(); d.moveTo(-.02, .0); d.lineTo(-.02, -.62); d.moveTo(.24, .0); d.lineTo(.24, -.44); d.stroke();
  for (const [mx, top, h, wd] of [[-.02, -.6, .42, .34], [.24, -.43, .3, .22]]) {
    const b = sail * .09, sag = (1 - sail);
    d.fillStyle = g(.03); d.beginPath(); d.moveTo(mx - wd / 2 * lerp(.45, 1, sail), top);
    d.lineTo(mx + wd / 2 * lerp(.45, 1, sail), top);
    d.quadraticCurveTo(mx + wd / 2 * lerp(.4, 1, sail) + b, top + h / 2, mx + wd / 2 * lerp(.3, 1, sail), top + h * lerp(.9, 1, sail));
    d.quadraticCurveTo(mx, top + h * (1 - .08 * sag) + .02 * sag, mx - wd / 2 * lerp(.3, 1, sail), top + h * lerp(.9, 1, sail));
    d.quadraticCurveTo(mx - wd / 2 * lerp(.4, 1, sail) + b, top + h / 2, mx - wd / 2 * lerp(.45, 1, sail), top); d.fill();
  }
  d.restore();
}
// "No engine": a gear; "No GPS": a map pin. Drawn as grooves, revealed by progress r.
export function gear(d, toPx, k, g, c, R, r) {
  const pts = []; for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2, tooth = (Math.cos(a * 10) > 0.25 ? 1 : 0), rr = R * (tooth ? 1.18 : 1); pts.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]); }
  const n = Math.floor(pts.length * clamp(r)); groove(d, pts.slice(0, Math.max(2, n)), toPx, k, g, .024, r > 0 ? 1 : 0);
  if (r > .8) { const q = []; for (let i = 0; i <= 50; i++) { const a = i / 50 * Math.PI * 2; q.push([c[0] + Math.cos(a) * R * .38, c[1] + Math.sin(a) * R * .38]); } groove(d, q, toPx, k, g, .024, (r - .8) / .2); }
}
export function pin(d, toPx, k, g, c, R, r) {
  const cc = [c[0], c[1] - R * .35], tip = [c[0], c[1] + R * 1.15], all = [tip];
  for (let i = 0; i <= 90; i++) { const an = (140 + i / 90 * 260) * Math.PI / 180; all.push([cc[0] + Math.cos(an) * R, cc[1] + Math.sin(an) * R]); }
  all.push(tip);
  const n = Math.floor(all.length * clamp(r)); groove(d, all.slice(0, Math.max(2, n)), toPx, k, g, .024, r > 0 ? 1 : 0);
  if (r > .8) { const q = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2; q.push([cc[0] + Math.cos(a) * R * .38, cc[1] + Math.sin(a) * R * .38]); } groove(d, q, toPx, k, g, .022, (r - .8) / .2); }
}
// the palm sweeping sand back over a drawing: a band from x0 to x1 (table metres) moving with progress r; a ridge at its leading edge
export function wipe(d, toPx, k, g, x0, x1, z0, z1, r) {
  if (r <= 0) return; const xe = lerp(x0, x1, clamp(r)); const [a, b] = toPx([x0, z0]), [c2, e] = toPx([xe, z1]);
  d.save(); d.filter = 'blur(6px)'; d.fillStyle = g(SEA); d.fillRect(a - 20, b, c2 - a + 20, e - b);
  if (r < 1) { d.fillStyle = g(.86); d.fillRect(c2 - .05 * k, b, .05 * k, e - b); }
  d.restore();
}
// the wind as raked streamlines over the sea; th: wind heading (radians, table frame), flow: dash phase, a: presence
export function wind(d, toPx, k, g, th, flow, a, box = [-4.6, 2.2, -3.6, 1.8]) {
  if (a <= 0) return;
  const F = (x, z) => { const n1 = Math.sin(x * 1.3 + z * .7) + Math.sin(z * 1.9 - x * .4 + 1.3), n2 = Math.cos(x * .9 - z * 1.5) + Math.sin(x * 2.1 + .4); const bx = Math.cos(th), bz = Math.sin(th); return [bx + .28 * n1, bz + .28 * n2]; };
  d.save(); d.globalAlpha = a; d.lineCap = 'round';
  d.setLineDash([.09 * k, .05 * k]); d.strokeStyle = g(.3); d.lineWidth = .016 * k;
  const sp = .2, B = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
  for (let gx = box[0], i = 0; gx < box[1]; gx += sp, i++) for (let gz = box[2], j = 0; gz < box[3]; gz += sp, j++) {
    let x = gx + (hh(i * 31 + j) - .5) * sp, z = gz + (hh(i * 17 + j * 3) - .5) * sp; if (land(x, z)) continue;
    const pts = [[x, z]];
    for (let s = 0; s < 9; s++) { const [u, v] = F(x, z), L = Math.hypot(u, v); x += u / L * .03; z += v / L * .03; if (land(x, z)) break; pts.push([x, z]); }
    if (pts.length < 3) continue;
    const p = B[(i * 7 + j * 3) % 4]; pts.forEach((q, n) => { const [px, py] = toPx(q); n ? p.lineTo(px, py) : p.moveTo(px, py); });
  }
  B.forEach((p, n) => { d.lineDashOffset = -flow * k * .14 - n * .035 * k; d.stroke(p); });
  d.restore();
}
// the Kartika moon, cleared out of the sand over the Bay; phase 0 (new) .. 1 (full); grows from the right edge
export const MOON_C = P(85.0, 12.4), MOON_R = .5;
export function sandMoon(d, toPx, k, g, phase, a = 1, c = MOON_C, R = MOON_R) {
  if (a <= 0 || phase <= 0) return;
  const [x, y] = toPx(c), r = R * k;
  d.save(); d.globalAlpha = a; d.filter = 'blur(3px)';
  d.strokeStyle = g(.85); d.lineWidth = .06 * k; d.beginPath(); d.arc(x, y, r + .03 * k, 0, 7); d.globalAlpha = a * ss(phase * 3); d.stroke(); d.globalAlpha = a;
  d.filter = 'blur(1.5px)';
  // lit part: the disc minus a shadow ellipse (the terminator)
  const T = document.createElement('canvas'); T.width = T.height = Math.ceil(r * 2 + 8); const tx = T.getContext('2d'), o = r + 4;
  tx.fillStyle = g(0); tx.beginPath(); tx.arc(o, o, r, 0, 7); tx.fill();
  if (phase < 1) { tx.globalCompositeOperation = 'destination-out'; const e = Math.cos(phase * Math.PI); tx.beginPath(); tx.arc(o, o, r + 1, Math.PI / 2, Math.PI * 1.5); tx.ellipse(o, o, Math.abs(e) * r + .5, r + 1, 0, -Math.PI / 2, Math.PI / 2, e < 0); tx.fill(); }
  d.drawImage(T, x - o, y - o); d.restore();
}
// labels' anchor points
export const PL = { odisha: P(85.2, 20.6), bali: P(115.1, -8.4), java: P(110.0, -7.3), sumatra: P(101.6, -.3), cuttack: P(85.88, 20.46) };
export const ISLES = { bali: P(115.1, -8.4), java: P(110.0, -7.3), sumatra: P(101.6, -.3) };
