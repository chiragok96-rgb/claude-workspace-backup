// The projector: everything it paints onto the model, as a top-down image over the plate (1536 × 2048 px = 180 m × 240 m).
// Gold = ours / safe, vermilion = the neighbour's claim / danger, cream = the record (the map). Colours only ever arrive as light.
import { PLOTS, OURS, LANE, ROAD, GATE, NEIGH, HOUSES, HOME, OD } from './layout.js';
import { clamp, lerp, seg, ss, eo, eio, hh } from './common.js';
export const PXW = 1536, PXH = 2048;
const K = PXW / 180;                                         // px per real metre
export const P = (x, z) => [(x + 90) * K, (z + 120) * K];
const GOLD = '255,184,84', VERM = '235,78,34', CREAM = '255,238,206';
function poly(g, pts) { g.beginPath(); pts.forEach(([x, z], i) => { const [a, b] = P(x, z); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.closePath(); }
function rect(g, [x0, z0, x1, z1]) { const [a, b] = P(x0, z0), [c, d] = P(x1, z1); g.rect(a, b, c - a, d - b); }
// a soft-edged wash: the area inside poly, revealed by a circle growing from (cx, cz) with a wide warm rim
function wash(g, pts, col, a, cx, cz, r, rim = 14) {
  if (a <= 0 || r <= 0) return; g.save(); poly(g, pts); g.clip();
  const [x, y] = P(cx, cz), R = r * K, gr = g.createRadialGradient(x, y, Math.max(0, R - rim * K), x, y, R + 2);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.75, `rgba(${col},${a * .9})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = `rgba(${col},${a})`; g.beginPath(); g.arc(x, y, Math.max(0, R - rim * K), 0, 7); g.fill();
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, R + 2, 0, 7); g.fill();
  // the bright leading rim
  const e = g.createRadialGradient(x, y, Math.max(0, R - 3 * K), x, y, R + 1); e.addColorStop(0, `rgba(${col},0)`); e.addColorStop(.7, `rgba(255,240,215,${a * .35})`); e.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = e; g.beginPath(); g.arc(x, y, R + 1, 0, 7); g.fill(); g.restore();
}
function outline(g, pts, col, a, w = 3, dash = null, prog = 1) {
  if (a <= 0 || prog <= 0) return; g.save(); g.strokeStyle = `rgba(${col},${a})`; g.lineWidth = w; g.lineJoin = 'round'; if (dash) g.setLineDash(dash);
  const pp = pts.concat([pts[0]]).map(([x, z]) => P(x, z)); let L = 0; const seglen = []; for (let i = 1; i < pp.length; i++) { const d = Math.hypot(pp[i][0] - pp[i - 1][0], pp[i][1] - pp[i - 1][1]); seglen.push(d); L += d; }
  let rem = L * prog; g.beginPath(); g.moveTo(...pp[0]);
  for (let i = 1; i < pp.length && rem > 0; i++) { const d = seglen[i - 1], f = Math.min(1, rem / d); g.lineTo(lerp(pp[i - 1][0], pp[i][0], f), lerp(pp[i - 1][1], pp[i][1], f)); rem -= d; }
  g.stroke(); g.restore();
}
function label(g, txt, x, z, size, col, a, font = 'OdiaSerif', w = 600) {
  if (a <= 0) return; const [px, py] = P(x, z); g.save(); g.globalAlpha = a; g.font = `${w} ${size}px "${font}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = `rgb(${col})`; g.fillText(txt, px, py); g.restore();
}
function hatch(g, pts, col, a, step = 2.2) {
  if (a <= 0) return; g.save(); poly(g, pts); g.clip(); g.strokeStyle = `rgba(${col},${a})`; g.lineWidth = 2.2;
  for (let s = -300; s < 300; s += step) { const [a1, b1] = P(-90 + s, -120), [a2, b2] = P(-90 + s + 240, 120); g.beginPath(); g.moveTo(a1, b1); g.lineTo(a2, b2); g.stroke(); } g.restore();
}
const R4 = ([x0, z0, x1, z1]) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
// a bright head running along a polyline (gold path)
function runLine(g, pts, col, a, prog, w = 10) {
  if (a <= 0 || prog <= 0) return; const pp = pts.map(([x, z]) => P(x, z)); let L = 0; const sl = []; for (let i = 1; i < pp.length; i++) { const d = Math.hypot(pp[i][0] - pp[i - 1][0], pp[i][1] - pp[i - 1][1]); sl.push(d); L += d; }
  let rem = L * clamp(prog), head = pp[0]; g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(...pp[0]); for (let i = 1; i < pp.length && rem > 0; i++) { const d = sl[i - 1], f = Math.min(1, rem / d); head = [lerp(pp[i - 1][0], pp[i][0], f), lerp(pp[i - 1][1], pp[i][1], f)]; g.lineTo(...head); rem -= d; }
  g.strokeStyle = `rgba(${col},${a * .35})`; g.lineWidth = w * 3.2; g.stroke(); g.strokeStyle = `rgba(${col},${a})`; g.lineWidth = w; g.stroke(); g.strokeStyle = `rgba(255,246,226,${a * .8})`; g.lineWidth = w * .35; g.stroke();
  if (prog < 1) { const gr = g.createRadialGradient(head[0], head[1], 0, head[0], head[1], 60); gr.addColorStop(0, `rgba(255,240,210,${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.arc(head[0], head[1], 60, 0, 7); g.fill(); }
  g.restore();
}
const PATH = [[4.5, 75], [4.5, 63.5], [4.5, 30], [4.5, -10], [5, -22]];      // main road → gate → lane → our plot
const HOMEPATH = [[7, 25], [30, 24], [52, 30], [66, 25]];

export function drawProj(g, t, D) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#000'; g.fillRect(0, 0, PXW, PXH);
  g.globalCompositeOperation = 'lighter';
  const tw = t > D - 2 ? t - D : t;                       // the loop: the last 2 s are also "before 0"
  // —— our plot: gold. At the loop every plot is lit; at 0.1–0.9 the others give their light back and only ours keeps it ——
  const allA = Math.max(ss(seg(t, 51.9, 54.6)), 1 - ss(seg(tw, .05, .9)));
  if (allA > 0) PLOTS.forEach((p, i) => { if (p.kind) return; const on = ss(seg(t, 51.9 + i * .1, 52.5 + i * .1)); const a = t > 50 ? on : allA;
    g.save(); g.globalAlpha = a; poly(g, p.poly); g.fillStyle = `rgba(${CREAM},.10)`; g.fill(); g.restore(); outline(g, p.poly, CREAM, .55 * a, 2.5); label(g, OD(p.n), ...cent(p.poly), 30, CREAM, .7 * a); });
  const oursA = 1 - ss(seg(t, 12.6, 12.9)) + ss(seg(t, 45.6, 46.4)) - (t > 46 ? 0 : 0);
  const goldFill = (.5 + .5 * Math.exp(-Math.pow((tw - 1.4) / .9, 2))) * (tw < 2.7 ? 1 : .55);
  if (t < 13 || t > 45.5) {
    const a = clamp(oursA);
    g.save(); g.globalAlpha = a; poly(g, R4(OURS)); g.fillStyle = `rgba(${GOLD},${.42 * goldFill})`; g.fill(); g.restore();
    outline(g, R4(OURS), GOLD, a, 5); outline(g, R4(OURS), '255,248,230', a * .7, 1.6);
  }
  // —— 4.84–6.2: the way in, a soft path of light from the plot down the lane to the road; at the gate it breaks ——
  const pathOn = ss(seg(t, 4.9, 5.9)) * (1 - ss(seg(t, 11.0, 11.6)));
  if (pathOn > 0) { const cut = ss(seg(t, 6.24, 6.6)); runLine(g, PATH.slice().reverse(), CREAM, pathOn * .5 * (1 - cut * .65), ss(seg(t, 4.9, 6.1)), 9);
    if (cut > 0) runLine(g, [[4.5, 63.5], [4.5, -10], [5, -22]].reverse(), CREAM, pathOn * .5 * cut, 1, 9); }
  // —— the gate: vermilion light falls on it ——
  const gateA = Math.max(Math.exp(-Math.pow((t - 6.3) / .35, 2)) * 1.4 + ss(seg(t, 6.24, 6.7)) * (1 - ss(seg(t, 11.0, 12.6))) * .55, ss(seg(t, 42.8, 43.5)) * (1 - ss(seg(t, 44.6, 45.4))) * .7);
  if (gateA > 0) { const [x, y] = P(4.5, GATE[2]), gr = g.createRadialGradient(x, y, 0, x, y, 9 * K); gr.addColorStop(0, `rgba(${VERM},${Math.min(1, gateA)})`); gr.addColorStop(1, `rgba(${VERM},0)`); g.fillStyle = gr; g.fillRect(x - 9 * K, y - 9 * K, 18 * K, 18 * K); }
  // —— 7.5–9.3: a pool of light on the neighbour; 9.2–10.5 his claim floods his land and the lane; 11.0 it crisps into the record ——
  const spot = ss(seg(t, 7.5, 8.0)) * (1 - ss(seg(t, 10.2, 10.8)));
  if (spot > 0) { const [x, y] = P(-3.2, 60.5), gr = g.createRadialGradient(x, y, 0, x, y, 5 * K); gr.addColorStop(0, `rgba(${CREAM},${.85 * spot})`); gr.addColorStop(.6, `rgba(${CREAM},${.35 * spot})`); gr.addColorStop(1, `rgba(${CREAM},0)`); g.fillStyle = gr; g.fillRect(x - 5 * K, y - 5 * K, 10 * K, 10 * K); }
  const claim = ss(seg(t, 9.15, 9.45)) * (1 - ss(seg(t, 12.6, 12.9)));
  if (claim > 0) { const r = lerp(0, 95, eo(seg(t, 9.2, 10.4))), crisp = ss(seg(t, 11.0, 11.6));
    for (const pts of [R4(NEIGH), R4(LANE)]) wash(g, pts, VERM, claim * lerp(.32, .14, crisp), -20, 40, r);
    outline(g, R4(NEIGH), VERM, claim * crisp, 4); outline(g, R4(LANE), VERM, claim * crisp, 4); hatch(g, R4(LANE), VERM, claim * crisp * .55);
    label(g, OD(341), 4.5, 20, 44, '255,220,200', claim * crisp); label(g, OD(340), -20, 8, 44, '255,220,200', claim * crisp); }
  // —— 12.7–17.5: house lights out; the record is projected: every boundary, every number ——
  const mapA = ss(seg(t, 12.7, 13.2)) * (1 - ss(seg(t, 42.95, 43.4)));
  if (mapA > 0 && t < 44) {
    PLOTS.forEach((p, i) => { const pr = ss(seg(t, 12.8 + i * .07, 13.6 + i * .07)); outline(g, p.poly, CREAM, mapA * .85, 3, null, pr); });
    PLOTS.forEach((p, i) => label(g, OD(p.n), ...cent(p.poly), p.n > 999 ? 40 : 36, CREAM, mapA * ss(seg(t, 13.6 + i * .05, 14.1 + i * .05))));
    // the road the eye sees: a dashed outline along the lane, then it breaks and the record shows through
    const seen = ss(seg(t, 12.9, 13.6)) * (1 - ss(seg(t, 14.9, 15.6)));
    outline(g, R4(LANE), '255,255,255', seen * .9, 3.5, [18, 14]);
    const truth = ss(seg(t, 14.9, 15.7));
    hatch(g, R4(LANE), VERM, mapA * truth * .7); outline(g, R4(LANE), VERM, mapA * truth, 4.5);
    g.save(); g.globalAlpha = mapA * truth; poly(g, R4(ROAD)); g.fillStyle = `rgba(${GOLD},.22)`; g.fill(); g.restore(); outline(g, R4(ROAD), GOLD, mapA * truth, 4);
  }
  // —— 45.9–48: the right of way, secured: gold runs from the road up the lane to the plot; 46.7 the seal at the lane's mouth ——
  const run = seg(t, 45.75, 46.75);
  if (t > 45.7) runLine(g, PATH, GOLD, 1 - ss(seg(t, 52.4, 53.4)) * .6, eio(run), 11);
  const seal = Math.exp(-Math.pow((t - 46.95) / .45, 2));
  if (t > 46.6 && t < 52.6) { const [x, y] = P(4.5, 70), a = ss(seg(t, 46.7, 47.0)) * (1 - ss(seg(t, 51.8, 52.6))); g.save(); g.strokeStyle = `rgba(${GOLD},${a})`; g.lineWidth = 5; g.beginPath(); g.arc(x, y, (5 + 3 * (1 - eo(seg(t, 46.7, 47.2)))) * K, 0, 7); g.stroke();
    const gr = g.createRadialGradient(x, y, 0, x, y, 14 * K); gr.addColorStop(0, `rgba(255,236,200,${seal})`); gr.addColorStop(1, `rgba(${GOLD},0)`); g.fillStyle = gr; g.fillRect(x - 14 * K, y - 14 * K, 28 * K, 28 * K); g.restore(); }
  // —— 50.5–51.4: "send it to them": a thread of gold from the lane to the home with the lit window ——
  if (t > 50.4 && t < 53.6) runLine(g, HOMEPATH, GOLD, .9 * (1 - ss(seg(t, 52.6, 53.6))), eio(seg(t, 50.5, 51.5)), 5);
}
export function cent(pts) { let x = 0, z = 0; pts.forEach(p => { x += p[0]; z += p[1]; }); return [x / pts.length, z / pts.length]; }
