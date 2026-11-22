// "And you — how far from home today?": India at night from the real state outlines (datameet), Odisha glowing,
// the cities where Odia children work, and a gold thread from each back to Cuttack, its distance counting up.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
let ST = {};
export function initIndia(states) { ST = states; }
const K = 34.6, LON0 = 82.5, MY0 = 23.0, CX = 540, CY = 760;   // px per degree; the map's centre
const merc = la => Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360)) * 180 / Math.PI;
export const P = (lon, my) => [CX + (lon - LON0) * K, CY - (my - MY0) * K];
export const city = (lon, lat) => P(lon, merc(lat));
export const CUTTACK = [85.88, 20.46];
export const CITIES = [['Bengaluru', 'ବେଙ୍ଗାଲୁରୁ', 77.59, 12.97, 28.0], ['Pune', 'ପୁଣେ', 73.86, 18.52, 28.88], ['Hyderabad', 'ହାଇଦ୍ରାବାଦ', 78.49, 17.39, 29.55], ['Mumbai', 'ମୁମ୍ବାଇ', 72.88, 19.08, 0], ['Delhi', 'ଦିଲ୍ଲୀ', 77.21, 28.61, 0], ['Chennai', 'ଚେନ୍ନାଇ', 80.27, 13.08, 0], ['Surat', 'ସୁରଟ', 72.83, 21.17, 0], ['Kolkata', 'କୋଲକାତା', 88.36, 22.57, 0]];
export const km = (a, b) => { const r = Math.PI / 180, dl = (b[1] - a[1]) * r, dn = (b[0] - a[0]) * r, h = Math.sin(dl / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dn / 2) ** 2; return 6371 * 2 * Math.asin(Math.sqrt(h)); };
const od = n => String(n).replace(/\d/g, d => '୦୧୨୩୪୫୬୭୮୯'[+d]);
export function india(c, t, o = {}) {
  const { a = 1, threads = 0, odisha = 1, labels = 0, z = 1 } = o; if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.fillStyle = '#0b0807'; c.fillRect(0, 0, W, H);
  c.translate(CX, CY); c.scale(z, z); c.translate(-CX, -CY);
  for (const [nm, rings] of Object.entries(ST)) { const isO = nm === 'Odisha';
    for (const r of rings) { c.beginPath(); r.forEach(([lo, my], i) => { const [x, y] = P(lo, my); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath();
      c.fillStyle = isO ? `rgba(${lerp(40, 150, odisha)},${lerp(28, 70, odisha)},${lerp(22, 30, odisha)},1)` : '#1a1412'; c.fill();
      c.strokeStyle = isO ? `rgba(255,200,120,${.4 + .5 * odisha})` : 'rgba(220,180,120,.22)'; c.lineWidth = isO ? 2.4 / z : 1 / z; c.stroke(); } }
  c.save(); c.globalCompositeOperation = 'lighter';   // the lights of a country at night
  for (let i = 0; i < 420; i++) { const lo = 69 + hh(i * 1.7) * 27, la = 8 + hh(i * 3.3) * 26, [x, y] = city(lo, la); if (!inIndia(lo, merc(la))) continue; const r = .8 + 2.2 * hh(i * 5); c.fillStyle = `rgba(255,200,130,${.18 + .3 * hh(i * 7)})`; c.beginPath(); c.arc(x, y, r / z, 0, 7); c.fill(); }
  const [cx, cy] = city(...CUTTACK), g = c.createRadialGradient(cx, cy, 0, cx, cy, 90 / z); g.addColorStop(0, `rgba(255,214,150,${.9 * odisha})`); g.addColorStop(1, 'rgba(255,180,100,0)'); c.fillStyle = g; c.fillRect(cx - 90 / z, cy - 90 / z, 180 / z, 180 / z);
  c.restore();
  CITIES.forEach(([en, orName, lo, la, tt], i) => {   // a thread home from each city, and how far it is
    const k = ss(seg(threads, i * .06, i * .06 + .5)); if (k <= 0) return; const [x, y] = city(lo, la), d = Math.hypot(cx - x, cy - y), mx = (x + cx) / 2, my = (y + cy) / 2 - d * .35;
    const pts = []; for (let j = 0; j <= 40; j++) { const u = j / 40 * k; pts.push([(1 - u) ** 2 * x + 2 * (1 - u) * u * mx + u * u * cx, (1 - u) ** 2 * y + 2 * (1 - u) * u * my + u * u * cy]); }
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,206,130,.85)'; c.lineWidth = 2.2 / z; c.beginPath(); pts.forEach(([X, Y], j) => j ? c.lineTo(X, Y) : c.moveTo(X, Y)); c.stroke();
    const hd = pts[pts.length - 1], gg = c.createRadialGradient(hd[0], hd[1], 0, hd[0], hd[1], 16 / z); gg.addColorStop(0, 'rgba(255,240,200,.9)'); gg.addColorStop(1, 'rgba(255,210,140,0)'); c.fillStyle = gg; c.fillRect(hd[0] - 16 / z, hd[1] - 16 / z, 32 / z, 32 / z);
    c.fillStyle = 'rgba(255,230,180,.95)'; c.beginPath(); c.arc(x, y, 5 / z, 0, 7); c.fill(); c.restore();
    if (labels > 0 && i < 3) { const dist = Math.round(km([lo, la], CUTTACK) * k / 10) * 10; c.save(); c.globalAlpha = a * labels; c.font = `600 ${30 / z}px "OdiaSerif"`; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillStyle = '#f4dcae'; c.shadowColor = 'rgba(0,0,0,.9)'; c.shadowBlur = 10;
      c.fillText(orName, x - 14 / z, y - 16 / z); c.font = `500 ${24 / z}px "InterT"`; c.fillStyle = '#e8c27a'; c.fillText(`${dist.toLocaleString('en-IN')} km`, x - 14 / z, y + 16 / z); c.restore(); } });
  c.restore();
}
function inIndia(lo, my) { for (const rings of Object.values(ST)) for (const r of rings) if (pip(r, lo, my)) return true; return false; }
function pip(r, x, y) { let ins = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; } return ins; }
