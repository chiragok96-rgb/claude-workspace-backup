// The sea of the Sadhabas at night: a real relief map (Terrarium elevation + bathymetry, zoom 7), the Kartika wind as living
// streamlines that turn on the full moon, the boita fleet on the old routes, and the journey reversed — Indonesia sailing to Cuttack.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk, bez, chain, partial, at } from './common.js';
import { BATIK } from './sc_gate.js';
export const MP = { Z: 7, X0: 90, Y0: 52, W: 5120, H: 4608 };
export const lon2x = lon => ((lon + 180) / 360 * 2 ** MP.Z - MP.X0) * 256;
export const lat2y = lat => { const r = lat * Math.PI / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** MP.Z - MP.Y0) * 256; };
export const ll = (lon, lat) => [lon2x(lon), lat2y(lat)];
export const PLACES = { cuttack: ll(85.88, 20.46), kalinga: ll(85.6, 19.7), bali: ll(115.19, -8.41), java: ll(110.2, -7.3), sumatra: ll(101.2, .4), lanka: ll(80.7, 7.8) };
let MAP, LAND, LANDW, TILES = [];
const TW = 1280, TH = 1152;
export function initMap(tiles, landBytes) {
  TILES = tiles;   // 16 image tiles (1282 x 1154, cut offline): only those on screen are drawn, and the browser may discard the rest
  LAND = landBytes; LANDW = MP.W / 2;   // the land mask at half resolution, raw bytes: no giant canvas
}
export const isLand = (px, py) => { const x = Math.round(px), y = Math.round(py); if (x < 0 || y < 0 || x >= MP.W || y >= MP.H) return false; return LAND[(y >> 1) * LANDW + (x >> 1)] > 0; };
// camera: [cx, cy, z, rot] in map px; screen = R(rot)·(p − c)·z + (540, 960)
export function m2s(cam, x, y) { const [cx, cy, z, r] = cam, dx = (x - cx) * z, dy = (y - cy) * z, c = Math.cos(r), s = Math.sin(r); return [dx * c - dy * s + 540, dx * s + dy * c + 960]; }
export function s2m(cam, X, Y) { const [cx, cy, z, r] = cam, dx = X - 540, dy = Y - 960, c = Math.cos(r), s = Math.sin(r); return [(dx * c + dy * s) / z + cx, (-dx * s + dy * c) / z + cy]; }
export function camT(c, cam) { const [cx, cy, z, r] = cam, co = Math.cos(r) * z, si = Math.sin(r) * z; c.setTransform(co, si, -si, co, 540 - (cx * co - cy * si), 960 - (cx * si + cy * co)); }
export function drawMap(c, cam, a = 1, dark = 0) {
  c.save(); c.fillStyle = '#060e10'; c.fillRect(0, 0, W, H); c.globalAlpha *= a; camT(c, cam); c.imageSmoothingQuality = 'high';
  { const cs = [s2m(cam, 0, 0), s2m(cam, W, 0), s2m(cam, 0, H), s2m(cam, W, H)], x0 = Math.min(...cs.map(p => p[0])), x1 = Math.max(...cs.map(p => p[0])), y0 = Math.min(...cs.map(p => p[1])), y1 = Math.max(...cs.map(p => p[1]));
    for (const [tx, ty, tc] of TILES) if (tx < x1 && tx + TW > x0 && ty < y1 && ty + TH > y0) c.drawImage(tc, tx - 1, ty - 1); }
  for (const [x0, y0, x1, y1, fx, fy, fw, fh] of [[0, MP.H, 0, MP.H - 420, 0, MP.H - 420, MP.W, 460], [0, 0, 0, 420, 0, -40, MP.W, 460], [0, 0, 420, 0, -40, 0, 460, MP.H], [MP.W, 0, MP.W - 420, 0, MP.W - 420, 0, 460, MP.H]]) { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(6,14,16,1)'); g.addColorStop(1, 'rgba(6,14,16,0)'); c.fillStyle = g; c.fillRect(fx, fy, fw, fh); }   // feather the plate's edges into the night sea
  c.restore();
  if (dark > 0) { c.save(); c.fillStyle = `rgba(4,8,9,${dark})`; c.fillRect(0, 0, W, H); c.restore(); }
  const v = c.createRadialGradient(540, 960, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}

// ———————————————— the Kartika wind: a field that turns ————————————————
// before: the wind pushes in from the south-east onto the Kalinga coast; after the turn it blows from Kalinga out to the islands
const D2 = (() => { const [x0, y0] = PLACES.kalinga, [x1, y1] = PLACES.bali, l = Math.hypot(x1 - x0, y1 - y0); return Math.atan2((y1 - y0) / l, (x1 - x0) / l); })();
export function windAngle(x, y, turn, chaos = 0, t = 0) {   // turn 0 → before, 1 → after; the field sweeps round through 180° (clockwise)
  const wob = .38 * Math.sin(x / 520 + y / 900) + .22 * Math.sin(y / 330 - x / 760) + .12 * Math.sin((x + y) / 210);
  return D2 + Math.PI * (1 - turn) + wob * (1 - .35 * Math.sin(Math.PI * turn)) + chaos * (3.2 * Math.sin(x / 150 + t * 1.3) + 2.6 * Math.sin(y / 120 - t * 1.1) + 1.8 * Math.sin((x - y) / 90 + t * 2.1));
}
// streak particles: each integrates from its seed along the (current) field; deterministic in t
const SEEDS = []; for (let i = 0; i < 9000; i++) SEEDS.push([lerp(500, 4700, hh(i * 1.31)), lerp(600, 4400, hh(i * 2.77)), hh(i * 4.13), hh(i * 5.71)]);   // fixed in map space: no swimming when the camera moves
export function wind(c, cam, t, turn, a = 1, o = {}) {
  if (a <= 0) return; const step = 9, life = 34, trail = 10, mg = 420;
  const cs = [s2m(cam, 0, 0), s2m(cam, W, 0), s2m(cam, 0, H), s2m(cam, W, H)];
  const bx0 = Math.min(...cs.map(p => p[0])) - mg, bx1 = Math.max(...cs.map(p => p[0])) + mg, by0 = Math.min(...cs.map(p => p[1])) - mg, by1 = Math.max(...cs.map(p => p[1])) + mg;
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
  const spd = o.speed || 1, lw = Math.min(2.2, .9 + cam[2] * .5);
  for (let i = 0; i < SEEDS.length; i++) {
    const [sx, sy, ph, br] = SEEDS[i]; if (sx < bx0 || sx > bx1 || sy < by0 || sy > by1) continue;
    let x = sx, y = sy; const age = ((t * 9 * spd + ph * life) % life), pts = [];
    for (let k = 0; k < age + trail; k++) { const an = windAngle(x, y, turn, o.chaos || 0, t); x += Math.cos(an) * step; y += Math.sin(an) * step; if (k >= age) pts.push(m2s(cam, x, y)); }
    const fade = Math.sin(Math.PI * age / life), land = isLand(x, y) ? .2 : 1, al = a * fade * land * (.3 + .7 * br);
    if (al < .03 || pts.length < 2) continue;
    c.strokeStyle = `rgba(255,${200 + 40 * br},${140 + 60 * br},${al * .7})`; c.lineWidth = lw * (.6 + .6 * br);
    c.beginPath(); pts.forEach(([X, Y], k) => k ? c.lineTo(X, Y) : c.moveTo(X, Y)); c.stroke();
  }
  c.restore();
}

// ———————————————— routes and the fleet ————————————————
const smooth = (P, n = 14) => { const out = []; for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
  for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
  out.push(P[P.length - 1]); return out; };
const W_BALI = [[85.7, 19.55], [87.6, 16.8], [90.4, 12.6], [93.6, 8.6], [96.6, 6.0], [99.2, 4.0], [102.4, 1.8], [105.2, -1.6], [107.6, -4.6], [110.6, -5.9], [113.6, -6.9], [115.0, -8.1]];
export const ROUTE_BALI = smooth(W_BALI.map(([a, b]) => ll(a, b)));
export const ROUTE_JAVA = smooth([[86.2, 19.9], [88.4, 16.4], [91.6, 11.6], [95.0, 7.4], [98.4, 4.6], [101.8, 2.4], [104.6, -1.0], [106.8, -4.4], [109.4, -6.2]].map(([a, b]) => ll(a, b)));
export const ROUTE_SUMATRA = smooth([[85.3, 19.3], [86.6, 15.4], [89.8, 10.4], [93.4, 6.6], [96.8, 4.6], [98.6, 3.8]].map(([a, b]) => ll(a, b)));
export function boat(c, X, Y, s, a = 1, dir = 1, glow = 1) {   // a boita at map scale: upturned prow and stern, a billowing striped sail, a lamp
  if (a <= 0) return; c.save(); c.translate(X, Y); c.scale(s * dir, s); c.globalAlpha = a;
  if (glow > 0) { c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(0, -14, 0, 0, -14, 40); g.addColorStop(0, `rgba(255,196,110,${.22 * glow})`); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(-40, -54, 80, 80); c.globalCompositeOperation = 'source-over'; }
  c.fillStyle = '#e8c27a'; c.strokeStyle = '#2a1408'; c.lineWidth = 1.4; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-26, -9); c.quadraticCurveTo(-24, 0, -14, 3); c.lineTo(14, 3); c.quadraticCurveTo(24, 0, 28, -12); c.lineTo(22, -6); c.lineTo(-20, -6); c.closePath(); c.fill(); c.stroke();   // the hull
  c.fillStyle = '#5a2c12'; c.fillRect(-18, -4, 34, 2.6);
  c.strokeStyle = '#2a1408'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, -6); c.lineTo(0, -40); c.stroke();
  c.fillStyle = '#fff1d2'; c.beginPath(); c.moveTo(-14, -36); c.lineTo(12, -36); c.quadraticCurveTo(20, -24, 12, -10); c.lineTo(-14, -10); c.quadraticCurveTo(-7, -23, -14, -36); c.closePath(); c.fill(); c.lineWidth = 1.2; c.stroke();   // the sail, full of wind
  c.strokeStyle = 'rgba(190,120,50,.85)'; c.lineWidth = 1.6; for (const yy of [-28, -19]) { c.beginPath(); c.moveTo(-11, yy); c.quadraticCurveTo(4, yy + 1, 15, yy); c.stroke(); }
  c.fillStyle = '#c0392b'; c.beginPath(); c.moveTo(0, -40); c.lineTo(9, -43); c.lineTo(0, -46); c.fill();   // pennant
  c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,236,190,.95)'; c.beginPath(); c.arc(24, -10, 2, 0, 7); c.fill();
  c.restore();
}
export function routeLine(c, cam, route, p, a = 1, o = {}) {   // a dotted gold sea-route drawn up to p
  if (a <= 0 || p <= 0) return; const q = partial(route, p).map(([x, y]) => m2s(cam, x, y)); if (q.length < 2) return;
  c.save(); c.globalAlpha = a; c.lineCap = 'round';
  c.strokeStyle = o.col || 'rgba(255,214,140,.9)'; c.lineWidth = o.w || 2.4; c.setLineDash(o.dash || [2, 9]); c.beginPath(); q.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
  c.setLineDash([]); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,190,100,.18)'; c.lineWidth = 9; c.stroke();
  c.restore();
}
// the reverse journey: a band of batik flowing along the route from Bali back up to Cuttack (u from 1 down to 1−p)
export function batikFlow(c, cam, route, p, t, a = 1) {
  if (a <= 0 || p <= 0) return; const n = route.length, i0 = Math.floor((n - 1) * (1 - p)), pts = route.slice(i0).reverse().map(([x, y]) => m2s(cam, x, y)); if (pts.length < 2) return;
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  c.save(); c.globalAlpha = a; const hw = 13, sc = BATIK.height / 2 / hw;
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], dx = x1 - x0, dy = y1 - y0, sl = Math.hypot(dx, dy) || 1, nx = -dy / sl, ny = dx / sl;
    const u0 = ((L[i] * sc - t * 60) % BATIK.width + BATIK.width) % BATIK.width, du = Math.max(1, Math.min(sl * sc + 1, BATIK.width - u0));
    c.save(); c.transform(dx / du * (sl + .8) / sl, dy / du * (sl + .8) / sl, nx * 2 * hw / BATIK.height, ny * 2 * hw / BATIK.height, x0 - nx * hw, y0 - ny * hw); c.drawImage(BATIK, u0, 0, du, BATIK.height, 0, 0, du, BATIK.height); c.restore(); }
  const [hx, hy] = pts[pts.length - 1]; c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(hx, hy, 0, hx, hy, 70); g.addColorStop(0, 'rgba(255,220,160,.6)'); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(hx - 70, hy - 70, 140, 140);
  c.restore();
}
export function placeLabel(c, cam, place, txt, a, o = {}) {   // an upright Odia label, a pin of light
  if (a <= 0) return; const [X, Y] = m2s(cam, ...place); c.save(); c.globalAlpha = a;
  c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(X, Y, 0, X, Y, 26); g.addColorStop(0, 'rgba(255,226,170,.85)'); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(X - 26, Y - 26, 52, 52); c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#fff4dc'; c.beginPath(); c.arc(X, Y, 3.4, 0, 7); c.fill();
  c.font = `600 ${o.size || 42}px "OdiaSerif"`; c.textAlign = o.align || 'left'; c.textBaseline = 'middle'; c.shadowColor = 'rgba(0,0,0,.85)'; c.shadowBlur = 12; c.fillStyle = o.col || '#f6e2b4';
  c.fillText(txt, X + (o.dx ?? 22), Y + (o.dy ?? 0)); c.restore();
}
export function moon(c, X, Y, R, a, label) {   // the Kartika full moon, as a medallion of light over the sea
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  const h = c.createRadialGradient(X, Y, R * .8, X, Y, R * 4.5); h.addColorStop(0, 'rgba(255,240,210,.28)'); h.addColorStop(1, 'rgba(255,230,190,0)'); c.fillStyle = h; c.fillRect(X - R * 4.5, Y - R * 4.5, R * 9, R * 9);
  const g = c.createRadialGradient(X - R * .3, Y - R * .3, R * .1, X, Y, R); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#ead8b6'); c.fillStyle = g; c.beginPath(); c.arc(X, Y, R, 0, 7); c.fill();
  c.fillStyle = 'rgba(180,160,130,.28)'; for (const [ox, oy, r] of [[-.3, -.2, .26], [.28, .18, .2], [-.05, .38, .14], [.2, -.35, .12]]) { c.beginPath(); c.arc(X + ox * R, Y + oy * R, r * R, 0, 7); c.fill(); }
  if (label) { c.font = '600 40px "OdiaSerif"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = 'rgba(0,0,0,.8)'; c.shadowBlur = 12; c.fillStyle = '#f6e2b4'; c.fillText(label, X, Y + R + 54); }
  c.restore();
}
export function compass(c, X, Y, R, rot, a) {   // a fine nautical rose that shows where north is on the turned map
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(X, Y); c.rotate(rot); c.strokeStyle = 'rgba(240,214,160,.7)'; c.fillStyle = 'rgba(240,214,160,.85)'; c.lineWidth = 1.2;
  c.beginPath(); c.arc(0, 0, R, 0, 7); c.stroke(); c.beginPath(); c.arc(0, 0, R * .78, 0, 7); c.stroke();
  for (let k = 0; k < 8; k++) { c.save(); c.rotate(k * Math.PI / 4); c.beginPath(); c.moveTo(0, -R * (k % 2 ? .6 : 1.08)); c.lineTo(R * .1, 0); c.lineTo(-R * .1, 0); c.closePath(); k ? c.stroke() : c.fill(); c.restore(); }
  c.rotate(-rot); c.font = '600 22px "Cinzel"'; c.textAlign = 'center'; c.textBaseline = 'middle'; const [nx, ny] = [Math.sin(rot) * R * 1.4, -Math.cos(rot) * R * 1.4]; c.fillText('N', nx, ny);
  c.restore();
}
