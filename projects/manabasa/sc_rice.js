// Rice on black stone. Every picture in the film is made of grains of rice — white rice, turmeric-gold akshata, kumkum-red —
// lying on a dark slate lit by one ghee lamp. A picture never cuts to the next: its grains get up and flow into the next one.
// targets: drawing functions painted (in three colours) onto a mask; the mask is sampled into grain positions; the same N grains
// travel from target to target, matched by a space-filling order so neighbours stay neighbours.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
export const N = 72000;
const MS = .5, MW = W * MS, MH = H * MS;   // the mask is painted at half resolution
export const COL = { W: '#ffffff', G: '#ffd000', R: '#ff2000' };   // the mask's three inks: white rice, gold akshata, red kumkum
let SPR = [], SLATE;
const NA = 16;
function sprites() {   // a grain of each kind at 16 angles: a soft contact shadow, the body lit from the lamp, a glint
  const kinds = [['#f6f1e4', '#cfc5ae', '#fffdf6'], ['#f2be3a', '#a8741a', '#fff0b0'], ['#c8281a', '#6a0e08', '#ff8a70']];
  SPR = kinds.map(([mid, dark, hi]) => Array.from({ length: NA }, (_, k) => { const s = mk(40, 40), x = s.getContext('2d'); x.translate(20, 20); x.rotate(k / NA * Math.PI);
    x.fillStyle = 'rgba(0,0,0,.55)'; x.filter = 'blur(1.4px)'; x.beginPath(); x.ellipse(1.6, 2.2, 10.5, 4.4, 0, 0, 7); x.fill(); x.filter = 'none';
    const g = x.createLinearGradient(0, -4, 0, 4); g.addColorStop(0, hi); g.addColorStop(.35, mid); g.addColorStop(1, dark); x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, 10, 3.9, 0, 0, 7); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = .9; x.beginPath(); x.ellipse(-1, -1.2, 6.5, 1.6, 0, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
    return s; }));
  SLATE = mk(W, H); const x = SLATE.getContext('2d'); x.fillStyle = '#0d0b0a'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 26000; i++) { x.fillStyle = `rgba(${hh(i) > .5 ? '70,62,56' : '0,0,0'},${.05 + .07 * hh(i * 3)})`; x.fillRect(hh(i * 1.7) * W, hh(i * 2.3) * H, 1 + hh(i * 5) * 2, 1 + hh(i * 7) * 2); }
  x.filter = 'blur(30px)'; for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${hh(i) > .5 ? '40,34,30' : '0,0,0'},.25)`; x.beginPath(); x.ellipse(hh(i * 3.1) * W, hh(i * 4.7) * H, 160 + 200 * hh(i), 90 + 120 * hh(i * 2), hh(i) * 3, 0, 7); x.fill(); } x.filter = 'none';
}
// —— sampling a target ——
const TG = {};   // name → { x: Float32Array, y, k: Uint8Array }
let MASK;
function morton(x, y) { let z = 0; x = clamp(Math.round((x + 600) / 2400 * 1023), 0, 1023); y = clamp(Math.round((y + 600) / 3200 * 1023), 0, 1023); for (let b = 0; b < 10; b++) z |= ((x >> b) & 1) << (2 * b) | ((y >> b) & 1) << (2 * b + 1); return z; }
export function defineTarget(name, draw, o = {}) {
  const { dens = .2, scatter = 700, seed = 1 } = o;
  if (!MASK) MASK = mk(MW, MH); const m = MASK.getContext('2d', { willReadFrequently: true }); m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, MW, MH); m.scale(MS, MS); m.lineCap = 'round'; m.lineJoin = 'round'; draw(m); m.setTransform(1, 0, 0, 1, 0, 0);
  const d = m.getImageData(0, 0, MW, MH).data, P = [];
  for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) { const q = (j * MW + i) * 4, a = d[q + 3] / 255; if (a < .05) continue; const r = d[q], g = d[q + 1], b = d[q + 2];
    const k = (r > 180 && g > 180 && b > 180) ? 0 : (r > 180 && g > 120 && b < 100) ? 1 : 2; const p = a * dens * 2.6 * (k === 0 ? 1 : 1.1);
    let n = Math.floor(p), f = p - n; if (hh(q * .37 + seed) < f) n++; for (let s = 0; s < n; s++) P.push([(i + hh(q + s * 7.1 + seed)) / MS, (j + hh(q * 1.3 + s * 3.3 + seed)) / MS, k]); }
  // the rest of the grains: a few loose on the stone, the others swept off past the edges of the frame
  while (P.length > N) P.splice(Math.floor(hh(P.length + seed) * P.length), 1);
  let e = 0; while (P.length < N) { const i = P.length + seed * 977; if (e++ < scatter) P.push([hh(i * 1.7) * W, hh(i * 2.9) * H, 0]); else { const side = Math.floor(hh(i * 4.1) * 4), u = hh(i * 5.3), dd = 40 + 260 * hh(i * 6.7);
      P.push(side === 0 ? [-dd, u * H, 0] : side === 1 ? [W + dd, u * H, 0] : side === 2 ? [u * W, -dd, 0] : [u * W, H + dd, 0]); } }
  if (o.log !== false) console.log('TARGET', name, P.length - e);
  P.sort((a, b) => morton(a[0], a[1]) - morton(b[0], b[1]));
  const T = { x: new Float32Array(N), y: new Float32Array(N), k: new Uint8Array(N) }; P.forEach(([x, y, k], i) => { T.x[i] = x; T.y[i] = y; T.k[i] = k; }); TG[name] = T; return T;
}
// —— the timeline of pictures: [name, start of the flow into it, its duration, gesture] ——
// gestures: 'flow' (each grain glides on a gentle curve), 'sweep' (a wave from left to right, like a broom), 'burst' (from the centre out),
// 'gather' (from the outside in), 'fall' (top to bottom), 'blow' (scattered by wind, then settling)
let SEQ = [], DURATION = 1;
export function sequence(seq, dur) { SEQ = seq; DURATION = dur; }
const ROT = new Float32Array(N), SZ = new Float32Array(N), JIT = new Float32Array(N);
export function initRice() { sprites(); for (let i = 0; i < N; i++) { ROT[i] = hh(i * 1.31) * NA; SZ[i] = .8 + .4 * hh(i * 2.17); JIT[i] = hh(i * 3.7); } }
function delayOf(g, x0, y0, x1, y1, i) {
  const j = JIT[i] * .25;
  if (g === 'sweep') return clamp((x0 + 200) / 1500) * .65 + j * .4;
  if (g === 'burst') return clamp(Math.hypot(x1 - 540, y1 - 900) / 1300) * .6 + j * .3;
  if (g === 'gather') return (1 - clamp(Math.hypot(x0 - 540, y0 - 900) / 1300)) * .55 + j * .3;
  if (g === 'fall') return clamp(y1 / H) * .55 + j * .35;
  if (g === 'blow') return clamp(x0 / W) * .3 + j * .5;
  return j * 1.6;
}
// draw all the grains at time t; cam: {x, y, z} (zoom about a point), recolour(i, kFrom, kTo, u) can be ignored
export function rice(c, t, cam = { x: 540, y: 960, z: 1 }) {
  let tt = t; if (tt < SEQ[0][1]) tt += DURATION;   // before the first flow begins, we are still in the last one (the loop)
  let cur = 0; for (let s = 0; s < SEQ.length; s++) if (SEQ[s][1] <= tt) cur = s;
  const [nm, t0, du, ges] = SEQ[cur], prev = SEQ[(cur - 1 + SEQ.length) % SEQ.length][0], A = TG[prev], B = TG[nm], P = (tt - t0) / du;
  c.save(); c.translate(cam.x, cam.y); c.scale(cam.z, cam.z); c.translate(-cam.x, -cam.y);
  const span = ges === 'flow' ? .6 : .55;
  for (let i = 0; i < N; i++) {
    let x, y, ang = ROT[i], k;
    if (P >= 1) { x = B.x[i]; y = B.y[i]; k = B.k[i]; }
    else { const x0 = A.x[i], y0 = A.y[i], x1 = B.x[i], y1 = B.y[i], dl = delayOf(ges, x0, y0, x1, y1, i), u = clamp((P - dl) / Math.max(.2, 1 - dl - (ges === 'flow' ? .0 : .05)) * (ges === 'flow' ? 1 : 1));
      const e = ges === 'fall' ? u * u : eio(u), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, bend = (JIT[i] - .5) * Math.min(260, L * .5) + (ges === 'sweep' ? -L * .25 : 0) + (ges === 'blow' ? 220 : 0);
      x = x0 + dx * e - dy / L * bend * Math.sin(Math.PI * e); y = y0 + dy * e + dx / L * bend * Math.sin(Math.PI * e);
      if (ges === 'blow') { x += Math.sin(Math.PI * e) * (300 + 500 * JIT[i]); y -= Math.sin(Math.PI * e) * 160 * JIT[i]; }
      k = u < .5 ? A.k[i] : B.k[i];
      if (u > 0 && u < 1) ang = ((Math.atan2(dy + dx / L * bend * Math.PI * Math.cos(Math.PI * e), dx - dy / L * bend * Math.PI * Math.cos(Math.PI * e)) / Math.PI) * NA % NA + NA) % NA; }
    if (x < -30 || x > W + 30 || y < -30 || y > H + 30) continue;
    const s = SZ[i] * 11.5; c.drawImage(SPR[k][Math.floor(ang) % NA], x - s, y - s, s * 2, s * 2);
  }
  c.restore();
  return { cur, nm, P };
}
export function slate(c, t, lampX = 140, lampY = 1660) {   // the dark stone, the lamp's pool of light
  c.drawImage(SLATE, 0, 0);
  c.save(); c.globalCompositeOperation = 'lighter'; const fl = .9 + .07 * Math.sin(t * 11) + .04 * Math.sin(t * 23);
  const g = c.createRadialGradient(lampX, lampY, 20, lampX + 300, lampY - 500, 1500); g.addColorStop(0, `rgba(255,170,90,${.32 * fl})`); g.addColorStop(.4, `rgba(200,120,60,${.12 * fl})`); g.addColorStop(1, 'rgba(120,70,30,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}
export function lampLight(c, t, lampX = 140, lampY = 1660, a = 1) {   // warm light falling on the grains (over them), and a vignette
  c.save(); c.globalCompositeOperation = 'multiply'; const v = c.createRadialGradient(lampX + 360, lampY - 760, 300, lampX + 360, lampY - 760, 1450); v.addColorStop(0, 'rgba(255,236,206,1)'); v.addColorStop(1, 'rgba(70,50,40,1)'); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore();
}
