// The present day, in watercolour: painted layers (plates/*.png) moved by the film, and the one red thread drawn live.
import { flame } from './sc_legend.js';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); }, eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }, eo = x => 1 - Math.pow(1 - clamp(x), 3), ei = x => Math.pow(clamp(x), 3);
const hh = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const P = (t, a, b) => ss(seg(t, a, b));
let PL, Q;
export function initWC(plates, queue) { PL = plates; Q = queue; }
function bez(p0, p1, p2, p3, n = 30) { const a = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; a.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return a; }
function partial(pts, p) { if (p >= 1) return pts; const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); const e = L[L.length - 1] * p, out = [pts[0]]; for (let i = 1; i < pts.length; i++) { if (L[i] <= e) out.push(pts[i]); else { const f = (e - L[i - 1]) / (L[i] - L[i - 1]); out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); break; } } return out; }
// the red thread: cotton dyed with alta, a soft shadow, a fine highlight
export function thread(c, pts, w = 3.4, col = '#c32a1a', a = 1) {
  if (pts.length < 2 || a <= 0) return;
  c.save(); c.globalAlpha = a; c.lineCap = 'round'; c.lineJoin = 'round';
  const path = () => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); };
  c.strokeStyle = 'rgba(20,4,2,.35)'; c.lineWidth = w + 2; c.translate(1.5, 2.5); path(); c.stroke(); c.translate(-1.5, -2.5);
  c.strokeStyle = col; c.lineWidth = w; path(); c.stroke();
  c.strokeStyle = 'rgba(255,190,170,.45)'; c.lineWidth = w * .3; c.translate(-.6, -.8); path(); c.stroke();
  c.restore();
}
function cam(c, x, y, z) { c.setTransform(z, 0, 0, z, 540 - x * z, 960 - y * z); }
function glowAt(c, x, y, r, a, col = '255,214,150') { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); }

// ---------------- S1: the hook ----------------
export const HOOK_END = [1090, 612];   // hem line, the red thread's x
export function hookLift(t) { return -300 * eo(seg(t, 2.55, 3.4)) * (1 - ei(seg(t, 4.55, 5.3))); }
export function hookThreadPts(t, lift) {   // the red thread: hanging from the fringe, then pulled taut to the right (toward S2)
  const top = [612, 1145 + lift], pull = eio(seg(t, 5.55, 6.45));
  const hang = [[612, 1090 + lift], [613, 1150 + lift * .6], [611, 1210 + lift * .3], [612, 1262]];
  const taut = [[612, 1090 + lift], [760, 1100], [940, 1112], [1080, 1120]];
  const far = [612 + (1080 - 612) * 1.6, 1120];
  const p0 = top, p3 = [lerp(612, far[0], pull), lerp(1262, 1120, pull)];
  return bez(p0, [lerp(613, 760, pull), lerp(1205 + lift * .6, 1130, pull)], [lerp(611, 940, pull), lerp(1260 + lift * .3, 1124, pull)], [p3[0], p3[1] + 40 * (1 - pull)], 40);
}
export function hook(c, t) {
  const z = 1 + .05 * seg(t, 0, 6.4), lift = hookLift(t);
  c.save(); cam(c, 540, 1010, z);
  c.drawImage(PL.hook_bg, 0, 0);
  const fl = .92 + .08 * Math.sin(t * 7.1) * Math.sin(t * 3.3);   // lamplight breathing
  c.drawImage(PL.hook_feet, 0, 0);
  glowAt(c, 540, 1060, 260, .55 * P(t, 2.9, 3.5) * (1 - P(t, 4.6, 5.2)));
  c.drawImage(PL.hook_hem, 0, lift + 55);
  // the fringe: a thread for each day of the year
  c.save(); c.lineWidth = 1.3; c.strokeStyle = 'rgba(146,104,40,.9)';
  for (let i = 0; i < 178; i++) { const x = 186 + i * 4, L = 44 + hh(i) * 10, sw = Math.sin(t * 1.3 + i * .4) * 1.5 + (lift ? Math.sin(i) * lift * -.01 : 0); if (Math.abs(x - 612) < 3) continue; c.beginPath(); c.moveTo(x, 1143 + lift); c.quadraticCurveTo(x + sw * .5, 1143 + lift + L * .5, x + sw, 1143 + lift + L); c.stroke(); }
  c.restore();
  // the one red thread: its red runs down it on "one day"
  const pts = hookThreadPts(t, lift), red = eo(seg(t, .9, 1.9));
  thread(c, pts, 2.2, 'rgb(146,104,40)', 1); thread(c, partial(pts, red), 3.2, '#c32a1a', 1);
  c.restore();
  c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = 1 - fl; c.fillStyle = '#000'; c.fillRect(0, 0, 1080, 1920); c.restore();
}

// ---------------- S2: Aonla Navami ----------------
// the thread in S2's frame: from the left edge (and, during the pan, from S1's fringe), to the trunk, wound round it, then up and away
const WR = Array.from({ length: 10 }, (_, k) => { const y = 772 - k * 21, x0 = 404 + k * .6, x1 = 684 - k * .8; return bez([x0, y], [x0 + 70, y + 16], [x1 - 70, y + 14], [x1, y - 3], 24); });
export function amlaThread(c, t, xOff = 0) {
  const lead = [[-468, 1145], [-200, 1128], [0, 1120], [200, 1080], [330, 1010], [404, 790]];
  thread(c, lead.map(([x, y]) => [x + xOff, y]));
  const w = seg(t, 7.2, 10.8) * WR.length;
  for (let k = 0; k < WR.length; k++) { const p = clamp(w - k); if (p <= 0) break; thread(c, partial(WR[k], p).map(([x, y]) => [x + xOff, y])); }
  const up = bez([684, 562], [760, 480], [900, 260], [1000, -10], 40);
  thread(c, partial(up, eo(seg(t, 11.2, 12.0))).map(([x, y]) => [x + xOff, y]), 3.4, '#c32a1a', P(t, 11.15, 11.3));
}
export function amla(c, t, odia) {
  const z = 1 + .06 * seg(t, 6.6, 12.2);
  c.save(); cam(c, 540, 960 - 40 * seg(t, 6.6, 12.2), z);
  c.drawImage(PL.amla_bg, 0, 0);
  flame(c, 665, 1062, .55, t, 1);
  c.drawImage(PL.amla_w2, Math.sin(t * .9) * 3 - 6 * seg(t, 7, 12), -70 + Math.sin(t * 1.7) * 1.5);
  amlaThread(c, t);
  c.drawImage(PL.amla_w1, 8 * seg(t, 7, 12) + Math.sin(t * .8 + 1) * 3, -60 + Math.sin(t * 1.6 + 1) * 1.5);
  c.restore();
}

// ---------------- S3: the line to Sakshigopal ----------------
let PEOPLE_ORDER = null;
export function queueThreadPts(t) { const lead = bez([1000, 1930], [1010, 1700], [1030, 1450], [1040, 1330], 20); return [...lead, ...Q.path.slice(1)]; }
export function queue(c, t, o = {}) {
  const zIn = 1 + 1.2 * ei(seg(t, 14.6, 16.0)) + 12 * ei(seg(t, 15.85, 16.3));
  c.save(); cam(c, lerp(540, 630, ss(seg(t, 14.2, 15.9))), lerp(960, 782, ss(seg(t, 14.2, 15.9))), o.z || zIn);
  c.drawImage(PL.queue_bg, 0, 0);
  const all = o.all ? 1 : seg(t, 12.85, 15.6), n = Q.people.length;
  thread(c, partial(queueThreadPts(t), o.all ? 1 : eo(seg(t, 12.15, 13.3))));
  // the people join the line from the gate back toward us
  if (all > 0) { c.save(); c.beginPath(); const k = Math.floor(all * n); for (let i = n - 1; i >= n - k; i--) { const [x, y] = Q.people[i], s = .25 + .95 * Math.pow(Math.max(0, y - 800) / 530, 1.2); c.moveTo(x + 30 * s, y - 20 * s); c.arc(x, y - 20 * s, 34 * s + 3, 0, 7); } c.clip(); c.drawImage(PL.queue_people, 0, 0); c.restore(); }
  c.restore();
  if (!o.all) { const k = Math.round(200000 * eo(seg(t, 12.9, 15.4))), s = k.toLocaleString('en-IN') + (t > 15.4 ? '+' : '');
    c.save(); c.globalAlpha = P(t, 12.8, 13.2) * (1 - P(t, 15.8, 16.1)); c.font = '600 56px "Cinzel"'; c.textAlign = 'center'; c.fillStyle = '#5a1a10'; c.shadowColor = 'rgba(250,240,225,.9)'; c.shadowBlur = 14; c.fillText(s, 300, 1080); c.restore(); }
}

// ---------------- S13–14: the besha (Radha's feet seen; Odiani beside Natabara) ----------------
const BCAM = (t) => {   // the camera over the besha plates
  const k = [[53.0, 728, 1110, 1.6], [56.6, 726, 1080, 1.55], [59.0, 540, 960, 1.0], [60.4, 540, 960, 1.0], [62.4, 720, 940, 1.15], [64.7, 726, 1060, 1.55], [65.3, 732, 1080, 1.7]];
  let i = 0; while (i < k.length - 2 && t > k[i + 1][0]) i++; const a = k[i], b = k[i + 1], u = eio(seg(t, a[0], b[0]));
  return [lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u)];
};
export function besha(c, t) {
  let [x, y, z] = BCAM(t); const hw = 540 / z, hh2 = 960 / z; x = Math.min(1080 - hw, Math.max(hw, x)); y = Math.min(1920 - hh2, Math.max(hh2, y));
  c.save(); cam(c, x, y, z);
  c.drawImage(PL.besha_bg, 0, 0);
  // the diyas along the pedestal, lit one by one on "Aonla Navami"
  for (let i = 0; i < 6; i++) { const a = P(t, 59.25 + i * .16, 59.45 + i * .16); if (a > 0) flame(c, 150 + i * 156, 1236, .55, t + i, a); }
  c.drawImage(PL.besha_gopi, 0, 0);
  c.drawImage(PL.besha_rfeet, 0, 0);
  glowAt(c, 760, 1060, 240, .5 * P(t, 53.2, 53.9) * (1 - .5 * P(t, 56, 58)) + .25 * P(t, 62.8, 64.2));
  c.drawImage(PL.besha_saree, 0, 0);
  c.restore();
  // aarti: three flames waved round her feet (screen space, in front)
  const aa = P(t, 54.35, 54.8) * (1 - P(t, 56.4, 57.1));
  if (aa > 0) for (let i = 0; i < 3; i++) { const ph = t * 1.9 + i * 2.09, fx = 540 + Math.cos(ph) * 330, fy = 990 + Math.sin(ph) * 120; flame(c, fx, fy, .85, t + i, aa * (.6 + .4 * (Math.sin(ph) * .5 + .5))); }
  // marigold petals drifting down
  const pa = P(t, 54.2, 54.8) * (1 - P(t, 58.5, 59.5));
  if (pa > 0) { c.save(); c.globalAlpha = pa; for (let i = 0; i < 26; i++) { const st = 54.2 + hh(i) * 2.5, u = (t - st) / 3.4; if (u < 0 || u > 1) continue; const px = 120 + hh(i + 9) * 840 + Math.sin(u * 6 + i) * 40, py = -40 + u * 1300, r = 9 + hh(i + 3) * 6;
    c.save(); c.translate(px, py); c.rotate(u * 5 + i); c.fillStyle = i % 3 ? '#e9a12a' : '#d9761c'; c.beginPath(); c.ellipse(0, 0, r, r * .55, 0, 0, 7); c.fill(); c.restore(); } c.restore(); }
}
export function queueAll(c, t, z) { queue(c, t, { all: true, z }); }
