// Jhoti chita: rice paste drawn by a finger on a red-earth floor (Odia household art: Lakshmi's footprints at the threshold,
// lotuses, creepers, the paddy sheaf). A motif is a list of strokes; each stroke is a polyline with a width that swells where
// the finger first presses the paste and thins as it runs out, so it can be drawn on in time (p = 0..1).
// Rendering: the paste goes into its own layer (so it can be grained and lit), then onto the floor with a soft shadow and a
// highlight on its top edge: the paste stands a little proud of the floor.
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const PASTE = '#f1e9da', FLOOR = '#9a3a22';
let LAY, LC, GRAIN, FLO;
export function initJhoti(floorImg, grainImg) {
  GRAIN = grainImg; FLO = floorImg;
  LAY = document.createElement('canvas'); LAY.width = 1080; LAY.height = 1920; LC = LAY.getContext('2d');
}
// the floor: geru wash over mud plaster
export function floor(c, col = FLOOR, light = 1) {
  c.save(); c.fillStyle = col; c.fillRect(0, 0, 1080, 1920);
  c.globalCompositeOperation = 'multiply'; c.drawImage(FLO, 0, 0, 1080, 1920);
  c.globalCompositeOperation = 'source-over';
  const g = c.createRadialGradient(540, 820, 100, 540, 900, 1250); g.addColorStop(0, `rgba(255,214,160,${.10 * light})`); g.addColorStop(1, 'rgba(20,6,2,.45)');
  c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); c.restore();
}

// ---------- geometry ----------
export function bez(p0, p1, p2, p3, n = 28) { const a = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; a.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return a; }
export function chain(...segs) { const a = []; for (const s of segs) { if (a.length) s.shift(); a.push(...s); } return a; }
export function circle(cx, cy, r, a0 = -Math.PI / 2, n = 60) { const a = []; for (let i = 0; i <= n; i++) { const t = a0 + i / n * Math.PI * 2; a.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); } return a; }
export function xf(pts, x, y, s = 1, rot = 0, m = 1) { const c = Math.cos(rot), sn = Math.sin(rot); return pts.map(([px, py]) => [x + (m * px * c - py * sn) * s, y + (m * px * sn + py * c) * s]); }
function plen(pts) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return L; }

// ---------- strokes ----------
// S(pts, w): a stroke; w = width at the press; taper: how much it thins by the end; blob: the press at the start
export const S = (pts, w = 9, o = {}) => ({ pts, w, taper: o.taper ?? .45, blob: o.blob ?? 1.25, dot: false, ...o });
export const D = (x, y, r = 6) => ({ pts: [[x, y]], w: r * 2, dot: true });
// draw strokes into the paste layer; p (0..1) is how much of the whole motif has been drawn, in stroke order
function strokeInto(k, st, q) {
  if (q <= 0) return;
  if (st.dot) { const r = st.w / 2 * Math.min(1, q * 1.6); k.beginPath(); k.arc(st.pts[0][0], st.pts[0][1], r, 0, 7); k.fill(); return; }
  const P = st.pts, L = plen(P), tot = L[L.length - 1], end = tot * q;
  for (let i = 0; i < P.length - 1; i++) {
    if (L[i] > end) break;
    const a = P[i], b = P[i + 1], segL = L[i + 1] - L[i] || 1, n = Math.max(1, Math.ceil(segL / Math.max(1.6, st.w * .28)));
    for (let j = 0; j <= n; j++) {
      const d = L[i] + segL * j / n; if (d > end) break;
      const u = d / (tot || 1), x = a[0] + (b[0] - a[0]) * j / n, y = a[1] + (b[1] - a[1]) * j / n;
      const w = st.w * (1 - st.taper * u) * (1 + (st.blob - 1) * Math.exp(-d / (st.w * 1.2))) * (1 + .08 * Math.sin(d * .09));
      k.beginPath(); k.arc(x, y, w / 2, 0, 7); k.fill();
    }
  }
}
// draw a list of motifs: items = [{strokes, p, a}] → paste layer → floor
function bbox(st) { if (st.bb) return st.bb; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of st.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } const w = st.w * 1.5; return (st.bb = [x0 - w, y0 - w, x1 + w, y1 + w]); }
// o.T = [z, ox, oy]: world → screen (screen = world * z + o); o.view = [x0, y0, x1, y1] in world units, to skip what is off screen
export function jhoti(c, items, o = {}) {
  const k = LC; k.setTransform(1, 0, 0, 1, 0, 0); k.globalCompositeOperation = 'source-over'; k.globalAlpha = 1; k.clearRect(0, 0, 1080, 1920);
  if (o.T) k.setTransform(o.T[0], 0, 0, o.T[0], o.T[1], o.T[2]);
  const V = o.view;
  for (const it of items) {
    const sts = it.strokes, n = sts.length, p = it.p ?? 1; if (p <= 0) continue;
    k.globalAlpha = it.a ?? 1; k.fillStyle = it.col || PASTE;
    // stroke budget by length so drawing speed is even
    const lens = it.lens || (it.lens = sts.map(s => s.dot ? 6 : plen(s.pts).slice(-1)[0] + 4)), tot = lens.reduce((a, b) => a + b, 0); let acc = 0;
    for (let i = 0; i < n; i++) { const q = clamp((p * tot - acc) / lens[i]); acc += lens[i]; if (V) { const b = bbox(sts[i]); if (b[2] < V[0] || b[0] > V[2] || b[3] < V[1] || b[1] > V[3]) { if (q < 1) break; continue; } } strokeInto(k, sts[i], q); if (q < 1) break; }
  }
  k.globalAlpha = 1; k.setTransform(1, 0, 0, 1, 0, 0);
  // grain: the paste is rice ground with water: a little speckled, thinner (more translucent) at the edges
  k.globalCompositeOperation = 'source-atop'; k.globalAlpha = .16; k.drawImage(GRAIN, 0, 0, 1080, 1920); k.globalAlpha = 1; k.globalCompositeOperation = 'source-over';
  c.save();
  c.globalAlpha = o.a ?? 1;
  c.filter = 'blur(2.5px) brightness(0)'; c.globalAlpha = (o.a ?? 1) * .38; c.drawImage(LAY, 2.5, 3.5);   // its shadow on the floor
  c.filter = 'none'; c.globalAlpha = (o.a ?? 1) * .97; c.drawImage(LAY, 0, 0);
  c.globalCompositeOperation = 'lighter'; c.filter = 'blur(1px)'; c.globalAlpha = (o.a ?? 1) * .12; c.drawImage(LAY, -1.2, -1.6);   // light on its top edge
  c.restore();
}

// ---------- motifs (each returns strokes; local units, then xf to place) ----------
// a footprint as jhoti draws it: the outline of the sole, a line of dots inside, five toes as dots
export function padaOutline(x, y, s = 1, rot = 0, m = 1, o = {}) {
  const sole = chain(bez([0, 64], [-28, 62], [-30, 28], [-22, 4]), bez([-22, 4], [-16, -16], [-30, -32], [-24, -50]), bez([-24, -50], [-16, -70], [18, -68], [24, -46]), bez([24, -46], [26, -30], [12, -14], [12, 8]), bez([12, 8], [14, 32], [26, 46], [0, 64]));
  const st = [S(xf(sole, x, y, s, rot, m), 8 * s, { taper: .15 })];
  if (o.inner !== false) { const inner = chain(bez([0, 40], [-12, 38], [-14, 18], [-9, 2]), bez([-9, 2], [-5, -12], [-14, -26], [-10, -38])); for (const [px, py] of inner.filter((_, i) => i % 5 === 0)) st.push(D(...xf([[px + 4, py]], x, y, s, rot, m)[0], 3.2 * s)); }
  for (const [tx, ty, r] of [[18, -84, 8.5], [0, -89, 7], [-14, -85, 6], [-25, -76, 5.2], [-32, -64, 4.4]]) st.push(D(...xf([[tx, ty]], x, y, s, rot, m)[0], r * s));
  return st;
}
// a solid footprint (a trail): the sole as one filled stroke, toes as dots
export function padaSolid(x, y, s = 1, rot = 0, m = 1) {
  const st = [S(xf(chain(bez([2, 50], [-12, 30], [-12, 6], [-8, -10]), bez([-8, -10], [-6, -26], [4, -40], [6, -48])), x, y, s, rot, m), 26 * s, { taper: .2, blob: 1.1 })];
  for (const [tx, ty, r] of [[16, -74, 7.5], [1, -78, 6], [-11, -74, 5], [-20, -66, 4.4], [-26, -56, 3.8]]) st.push(D(...xf([[tx, ty]], x, y, s, rot, m)[0], r * s));
  return st;
}
// lotus (padma): eight petals as loops round a dotted centre, a stem
export function lotus(x, y, r, o = {}) {
  const st = [], n = o.n || 8;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 - Math.PI / 2, c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
    const tip = [x + c * r, y + s * r], b0 = [x + c * r * .28 + px * r * .16, y + s * r * .28 + py * r * .16], b1 = [x + c * r * .28 - px * r * .16, y + s * r * .28 - py * r * .16];
    st.push(S(chain(bez(b0, [b0[0] + c * r * .45 + px * r * .32, b0[1] + s * r * .45 + py * r * .32], [tip[0] + px * r * .12, tip[1] + py * r * .12], tip), bez(tip, [tip[0] - px * r * .12, tip[1] - py * r * .12], [b1[0] + c * r * .45 - px * r * .32, b1[1] + s * r * .45 - py * r * .32], b1)), o.w || 7, { taper: .3 })); }
  st.push(S(circle(x, y, r * .22), o.w || 7, { taper: .1 }));
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; st.push(D(x + Math.cos(a) * r * .11, y + Math.sin(a) * r * .11, 3)); }
  st.push(D(x, y, 3.5));
  return st;
}
// a creeper (lata) along a path: a wave, a leaf loop on each crest, a dot in each trough
export function lata(x0, x1, y, amp = 16, step = 70, w = 6) {
  const wave = []; for (let x = x0; x <= x1; x += 4) wave.push([x, y + Math.sin((x - x0) / step * Math.PI) * amp]);
  const st = [S(wave, w, { taper: .1, blob: 1.1 })];
  for (let x = x0 + step / 2, k = 0; x < x1; x += step, k++) { const s = k % 2 ? 1 : -1, yy = y + s * amp; const lf = chain(bez([x, yy], [x + 10, yy - s * 18], [x + 26, yy - s * 22], [x + 30, yy - s * 6]), bez([x + 30, yy - s * 6], [x + 22, yy + s * 2], [x + 8, yy + s * 2], [x, yy]));
    st.push(S(lf, w * .8, { taper: .2 })); st.push(D(x - 14, yy + s * 14, w * .55)); }
  return st;
}
export function rowDots(x0, x1, y, step = 22, r = 5) { const st = []; for (let x = x0; x <= x1; x += step) st.push(D(x, y, r)); return st; }

// ---------- more motifs ----------
// the flute (bansi) with its holes, and the peacock feather over it: Gopinath's sign in paste
export function flute(x, y, len = 300, rot = -.12, w = 7) {
  const st = [S(xf([[0, -5], [len, -5]], x, y, 1, rot), w, { taper: 0, blob: 1 }), S(xf([[0, 5], [len, 5]], x, y, 1, rot), w, { taper: 0, blob: 1 }), S(xf([[0, -5], [0, 5]], x, y, 1, rot), w, { taper: 0 }), S(xf([[len, -5], [len, 5]], x, y, 1, rot), w, { taper: 0 })];
  for (let i = 0; i < 6; i++) st.push(D(...xf([[len * .4 + i * len * .09, 0]], x, y, 1, rot)[0], w * .45));
  return st;
}
export function feather(x, y, s = 1, rot = 0) {
  const st = [S(xf(bez([0, 0], [10, -60], [30, -120], [20, -190]), x, y, s, rot), 6 * s, { taper: .5 })];
  for (let i = 1; i < 9; i++) { const t = i / 9, [px, py] = bez([0, 0], [10, -60], [30, -120], [20, -190], 9)[i]; st.push(S(xf([[px, py], [px - 26 + t * 8, py - 14]], x, y, s, rot), 3.5 * s, { taper: .6 }), S(xf([[px, py], [px + 26 - t * 8, py - 12]], x, y, s, rot), 3.5 * s, { taper: .6 })); }
  st.push(S(xf(circle(20, -205, 22), x, y, s, rot), 6 * s, { taper: .1 }), S(xf(circle(20, -205, 11), x, y, s, rot), 5 * s, { taper: .1 }), D(...xf([[20, -205]], x, y, s, rot)[0], 4 * s));
  return st;
}
// the lotus seat (padma pitha): a low arc of petals, empty
export function seat(x, y, w = 260) {
  const st = [S([[x - w / 2, y], [x + w / 2, y]], 7, { taper: 0 })];
  for (let i = 0; i < 7; i++) { const px = x - w / 2 + (i + .5) * w / 7, pw = w / 7 / 2; st.push(S(chain(bez([px - pw, y], [px - pw, y - 26], [px - 4, y - 40], [px, y - 44]), bez([px, y - 44], [px + 4, y - 40], [px + pw, y - 26], [px + pw, y])), 6, { taper: .2 })); }
  st.push(...rowDots(x - w / 2 + 10, x + w / 2 - 10, y + 22, 20, 4));
  return st;
}
// a house in paste: a low wall, the thatch as a curved roof of lines, the door, a lamp niche
export function house(x, y, w = 300, h = 170) {
  const st = [S([[x - w / 2, y], [x + w / 2, y]], 8, { taper: 0 }), S([[x - w / 2 + 14, y], [x - w / 2 + 14, y - h]], 8, { taper: .1 }), S([[x + w / 2 - 14, y], [x + w / 2 - 14, y - h]], 8, { taper: .1 })];
  st.push(S(bez([x - w / 2 - 40, y - h], [x - w / 4, y - h - 120], [x + w / 4, y - h - 120], [x + w / 2 + 40, y - h]), 9, { taper: .1 }));
  for (let i = 1; i < 8; i++) { const t = i / 8, [px, py] = bez([x - w / 2 - 40, y - h], [x - w / 4, y - h - 120], [x + w / 4, y - h - 120], [x + w / 2 + 40, y - h], 8)[i]; st.push(S([[px, py], [px + (t - .5) * 30, y - h + 6]], 4, { taper: .4 })); }
  st.push(S(chain(bez([x - 42, y], [x - 42, y - 90], [x - 30, y - 118], [x, y - 120]), bez([x, y - 120], [x + 30, y - 118], [x + 42, y - 90], [x + 42, y])), 7, { taper: .1 }));
  return st;
}
// the temple in paste: a rekha deula's curved spire on a base, the doorway
export function temple(x, y, s = 1) {
  const sp = chain(bez([-90, 0], [-88, -160], [-60, -300], [-24, -340]), bez([-24, -340], [-12, -352], [12, -352], [24, -340]), bez([24, -340], [60, -300], [88, -160], [90, 0]));
  const st = [S(xf(sp, x, y, s), 8 * s, { taper: .05 }), S(xf([[-130, 0], [130, 0]], x, y, s), 8 * s, { taper: 0 })];
  st.push(S(xf(chain(bez([-50, -350], [-40, -372], [40, -372], [50, -350]), bez([50, -350], [40, -340], [-40, -340], [-50, -350])), x, y, s), 6 * s, { taper: .1 }));
  st.push(S(xf([[0, -372], [0, -430]], x, y, s), 5 * s, { taper: .1 }), S(xf([[0, -430], [40, -418], [0, -404]], x, y, s), 5 * s, { taper: .1 }));
  st.push(S(xf(chain(bez([-30, 0], [-30, -60], [-20, -80], [0, -82]), bez([0, -82], [20, -80], [30, -60], [30, 0])), x, y, s), 6 * s, { taper: .1 }));
  for (let k = 1; k < 7; k++) { const yy = -k * 46; st.push(S(xf([[-88 + k * 6, yy], [88 - k * 6, yy]], x, y, s), 4 * s, { taper: .3 })); }
  return st;
}
// a hand: pointing (accusing) or folded (pranam), as a paste outline
export function hand(x, y, s = 1, rot = 0, kind = 'point') {
  const pts = kind === 'point'
    ? chain(bez([0, 60], [-30, 50], [-36, 10], [-28, -10]), bez([-28, -10], [-26, -24], [-10, -26], [-4, -16]), bez([-4, -16], [2, -40], [2, -120], [10, -130]), bez([10, -130], [20, -134], [24, -124], [22, -110]), bez([22, -110], [20, -70], [22, -30], [28, -14]), bez([28, -14], [44, -10], [40, 30], [30, 50]), bez([30, 50], [20, 62], [10, 62], [0, 60]))
    : chain(bez([0, 70], [-26, 60], [-30, 10], [-20, -40]), bez([-20, -40], [-12, -90], [-4, -120], [0, -132]), bez([0, -132], [4, -120], [12, -90], [20, -40]), bez([20, -40], [30, 10], [26, 60], [0, 70]));
  const st = [S(xf(pts, x, y, s, rot), 7 * s, { taper: .1 })];
  if (kind !== 'point') st.push(S(xf([[0, -126], [0, 60]], x, y, s, rot), 4 * s, { taper: .5 }));
  return st;
}
// colour inlay: powder pressed into a footprint (indigo for Gopinath, alta for Lakshmi): drawn under the paste outline
export function inlay(c, x, y, s, rot, m, col, a = .9) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * m, s); c.globalAlpha = a; c.fillStyle = col;
  c.beginPath(); c.moveTo(0, 58); c.bezierCurveTo(-24, 56, -25, 26, -18, 4); c.bezierCurveTo(-13, -16, -26, -30, -20, -46); c.bezierCurveTo(-13, -63, 15, -62, 20, -44); c.bezierCurveTo(22, -30, 9, -14, 9, 8); c.bezierCurveTo(11, 30, 22, 44, 0, 58); c.fill();
  for (const [tx, ty, r] of [[18, -84, 6], [0, -89, 5], [-14, -85, 4.2], [-25, -76, 3.6], [-32, -64, 3.2]]) { c.beginPath(); c.arc(tx, ty, r, 0, 7); c.fill(); }
  c.restore();
}
