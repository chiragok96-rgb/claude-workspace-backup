// Bali Jatra in neon (engine of styles/neon-tubes: gl.js shades real bent-glass tubes on painted boards, lights the wall with
// the blurred emission and doubles everything in the wet street). Odia lettering is traced from Baloo Bhaina 2 (data/neon_odia.json).
// A wall of signs, stacked for a portrait frame: କଟକ with a crescent moon and a sleepy Z Z Z (line 1); the big ବାଲିଯାତ୍ରା (line 2 / 16);
// ଓଡ଼ିଶାର ପ୍ରାଣ with a heart (line 16); a neon Ramdoli turning by switched frames.
import { clamp, lerp, seg, ss, hsh, tubeFromStrokes } from './lib.js';
import { makeGL } from './gl.js';

export const GAS = { neon: [1.0, 0.11, 0.035], argon: [0.24, 0.46, 1.0], green: [0.22, 1.0, 0.36], white: [0.92, 0.9, 1.0], pink: [1.0, 0.24, 0.62], purple: [0.66, 0.28, 1.0], turq: [0.12, 0.95, 0.85], yellow: [1.0, 0.72, 0.16] };
const CLEAR = { neon: true, argon: true };
export function strike(t, t0, sd = 0) { const d = t - t0; if (d < 0) return 0; const j = hsh(sd) * 0.03; if (d < 0.05 + j) return 1.0; if (d < 0.12 + j) return 0.0; if (d < 0.17 + j) return 0.7; if (d < 0.23 + j) return 0.08; return Math.min(1, 0.6 + (d - 0.23 - j) * 5); }
const hum = (t, sd) => 1 - 0.03 * hsh(Math.floor(t * 30) * 1.7 + sd);

export async function makeNeon(canvas, W, H) {
  const S = W / 1920, F = 1.3 * W;
  const OD = await (await fetch('data/neon_odia.json')).json();
  const T = (strokes, gas, circ, opt = {}) => tubeFromStrokes(strokes, { col: GAS[gas], coat: !CLEAR[gas], circ, gas, fil: .02, D: opt.D ?? .022, z: .05, ...opt });
  // an Odia word as tubes: one tube per traced stroke; s = metres per unit, (x0, y0) = left baseline
  const word = (w, x0, y0, s, gas, circ, opt) => OD[w].strokes.map(st => T([st.map(([x, y]) => [x0 + x * s, y0 + y * s])], gas, circ, opt));
  const ring = (cx, cy, r, a0 = 0, a1 = 360, n = 72) => { const P = []; for (let k = 0; k <= n; k++) { const a = (a0 + (a1 - a0) * k / n) * Math.PI / 180; P.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return P; };
  const signs = [];
  // —— କଟକ + crescent moon + Z Z Z (top)
  { const s = .6, w = OD['କଟକ'].w * s, x0 = -w / 2 + .2, y0 = 6.05;
    const moonA = ring(-1.45, 6.65, .38, 60, 300), moonB = ring(-1.3, 6.72, .3, 300, 60).reverse();
    const tubes = [...word('କଟକ', x0, y0, s, 'argon', 'kat'), T([[...moonA, ...moonB, moonA[0]]], 'yellow', 'moon', { D: .02 })];
    const Z = (x, y, h) => T([[[x, y + h], [x + h * .8, y + h], [x, y], [x + h * .8, y]]], 'white', 'zzz', { D: .014, fil: .01 });
    tubes.push(Z(-.75, 7.25, .16), Z(-.45, 7.5, .22), Z(-.07, 7.8, .28));
    signs.push({ id: 'kat', tubes, backer: { x0: x0 - .25, y0: y0 - .32, x1: x0 + w + .25, y1: y0 + .95, col: '#0a1424', trim: '#27384e' } }); }
  // —— ବାଲିଯାତ୍ରା, big, in pink with a yellow frame (centre)
  { const s = .98, w = OD['ବାଲିଯାତ୍ରା'].w * s, x0 = 7 - w / 2, y0 = 5.8;
    const tubes = word('ବାଲିଯାତ୍ରା', x0, y0, s, 'pink', 'bj', { D: .028 });
    const fx0 = x0 - .22, fx1 = x0 + w + .22, fy0 = y0 - .55, fy1 = y0 + 1.25;
    tubes.push(T([[[fx0 + .1, fy0], [fx1, fy0], [fx1, fy1], [fx0, fy1], [fx0, fy0 + .12]]], 'yellow', 'bjf', { D: .018, fil: .06 }));
    signs.push({ id: 'bj', tubes, backer: { x0: fx0 - .12, y0: fy0 - .12, x1: fx1 + .12, y1: fy1 + .12, col: '#1c0818', trim: '#4a2440' } }); }
  // —— ଓଡ଼ିଶାର ପ୍ରାଣ + a heart (below)
  { const s = .5, w1 = OD['ଓଡ଼ିଶାର'].w * s, w2 = OD['ପ୍ରାଣ'].w * s, gap = .22, tot = w1 + gap + w2 + .8, x0 = 13.2 - tot / 2, y0 = 6.0;
    const tubes = [...word('ଓଡ଼ିଶାର', x0, y0, s, 'turq', 'od'), ...word('ପ୍ରାଣ', x0 + w1 + gap, y0, s, 'turq', 'od')];
    const hx = x0 + w1 + gap + w2 + .45, hy = y0 + .28, H_ = []; for (let k = 0; k <= 60; k++) { const a = k / 60 * Math.PI * 2; H_.push([hx + .016 * 16 * Math.sin(a) ** 3, hy + .016 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))]); }
    tubes.push(T([H_], 'neon', 'heart', { D: .024 }));
    signs.push({ id: 'od', tubes, backer: { x0: x0 - .2, y0: y0 - .3, x1: x0 + tot + .1, y1: y0 + .78, col: '#06161a', trim: '#1f3c40' }, heart: [hx, hy] }); }
  // —— a neon Ramdoli (right of ବାଲିଯାତ୍ରା, higher): rim + spokes + 8 cars, two switched frames (rotate by half a spoke)
  const RD = [-3.6, 5.9, .9]; const rd = [0, 1].map(f => { const [cx, cy, r] = RD, tb = [T([ring(cx, cy, r)], 'white', 'rd' + f, { D: .016 })];
    for (let k = 0; k < 8; k++) { const a = (k + f * .5) / 8 * Math.PI * 2; tb.push(T([[[cx, cy], [cx + r * Math.cos(a), cy + r * Math.sin(a)]]], 'white', 'rd' + f, { D: .01, fil: .005, ends: false })); tb.push(T([ring(cx + r * Math.cos(a), cy + r * Math.sin(a) - .07, .055)], ['pink', 'yellow', 'turq', 'green'][k % 4], 'rd' + f, { D: .012 })); }
    tb.push(T([[[cx - .38, cy - r - .5], [cx, cy], [cx + .38, cy - r - .5]]], 'argon', 'rdLeg', { D: .016 })); return tb; });
  for (const s of signs) s.tubes.forEach(t => t.z = .05);

  // —— layers (as in the demo) ——
  const TOP = 2 * H, CHT = H + TOP, EW = W >> 1, EH = CHT >> 1;
  const mkc = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const C = { prof: mkc(W, CHT), tcol: mkc(W, CHT), ovl: mkc(W, CHT), add: mkc(W, CHT), emit: mkc(EW, EH), rain: mkc(W, H) };
  const X = Object.fromEntries(Object.entries(C).map(([k, c]) => [k, c.getContext('2d')]));
  const rgb = (c, m = 1) => `rgb(${Math.round(clamp(c[0] * m) * 255)},${Math.round(clamp(c[1] * m) * 255)},${Math.round(clamp(c[2] * m) * 255)})`;
  const tfStreet = (c, z) => { const d = c.D - z; if (d < .15) return null; const Kz = F / d; return { m: [Kz, 0, 0, -Kz, W / 2 - c.lx * Kz, TOP + H / 2 + c.K * (c.ly - c.E) + Kz * c.E], K: Kz }; };
  const setT = (ctx, tf) => { const m = tf.m; ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]); };
  const setE = tf => { const m = tf.m; X.emit.setTransform(m[0] / 2, m[1] / 2, m[2] / 2, m[3] / 2, m[4] / 2, m[5] / 2); };
  const MAT = { clear: 0, coat: 85, paint: 170, metal: 255 };
  function bands(ctx, path, D, K, mat) { const N = clamp(Math.round(D * K / 2.2), 2, 28); for (let i = 0; i < N; i++) { const f = 1 - i / N, r = 1 - (i + .5) / N, h = Math.sqrt(Math.max(0, 1 - r * r)); ctx.strokeStyle = `rgb(${Math.round((.1 + .9 * h) * 255)},${mat},0)`; ctx.lineWidth = Math.max(D * f, (i ? .6 : 1.3) / K); ctx.stroke(path); } }
  function dome(ctx, x, y, R, K, mat) { const N = clamp(Math.round(R * 2 * K / 2.2), 2, 24); for (let i = 0; i < N; i++) { const f = 1 - i / N, r = 1 - (i + .5) / N, h = Math.sqrt(Math.max(0, 1 - r * r)); ctx.fillStyle = `rgb(${Math.round((.1 + .9 * h) * 255)},${mat},0)`; ctx.beginPath(); ctx.arc(x, y, Math.max(R * f, .7 / K), 0, 6.2832); ctx.fill(); } }
  function drawTube(Tb, tf, st, pass) {
    const K = tf.K, D = Tb.D, P = X.prof, Cc = X.tcol, E = X.emit, p = st.p, col = st.col || Tb.col, lit1 = Tb.len * (st.fill ?? 1);
    setT(P, tf); setT(Cc, tf); setE(tf); P.lineCap = Cc.lineCap = E.lineCap = 'round'; P.lineJoin = Cc.lineJoin = E.lineJoin = 'round';
    for (const g of Tb.paths) {
      if (g.paint !== (pass === 0)) continue;
      const mat = g.paint ? MAT.paint : Tb.coat ? MAT.coat : MAT.clear;
      bands(P, g.path, D, K, mat); Cc.setLineDash([]); Cc.strokeStyle = '#000'; Cc.lineWidth = D + 1 / K; Cc.stroke(g.path);
      if (g.paint) continue;
      const a = g.a, b = Math.min(g.b, lit1); if (b <= a || p < .003) continue;
      const dash = b < g.b ? [0, 0, b - a, 1e4] : [];
      Cc.setLineDash(dash); Cc.strokeStyle = rgb(col, p); Cc.lineWidth = D + .5 / K; Cc.stroke(g.path);
      E.setLineDash(dash); E.globalAlpha = p; E.strokeStyle = rgb(col, .55); E.lineWidth = Math.max(D * 1.9, 2.4 / K); E.stroke(g.path); E.strokeStyle = rgb(col); E.lineWidth = Math.max(D * .8, 1.2 / K); E.stroke(g.path); E.globalAlpha = 1;
    }
    Cc.setLineDash([]); E.setLineDash([]);
    if (pass === 1) {
      if (Tb.ties) { P.strokeStyle = 'rgb(150,255,0)'; P.lineWidth = Math.max(D * .11, .7 / K); P.lineCap = 'butt'; P.beginPath(); for (const [x, y, tx, ty] of Tb.tiesAt) { P.moveTo(x - ty * D * .62, y + tx * D * .62); P.lineTo(x + ty * D * .62, y - tx * D * .62); } P.stroke(); P.lineCap = 'round'; }
      if (Tb.ends) [Tb.pts[0], Tb.pts[Tb.pts.length - 1]].forEach(q => { const cr = D * .78; dome(P, q[0], q[1], cr, K, MAT.paint); Cc.fillStyle = '#000'; Cc.beginPath(); Cc.arc(q[0], q[1], cr * 1.02, 0, 6.2832); Cc.fill(); });
    }
  }
  const rect = (ctx, x0, y0, x1, y1) => ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  function clearLayers() {
    for (const k of ['prof', 'tcol', 'add']) { const x = X[k]; x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.fillStyle = '#000'; x.fillRect(0, 0, W, CHT); }
    X.ovl.setTransform(1, 0, 0, 1, 0, 0); X.ovl.clearRect(0, 0, W, CHT);
    X.emit.setTransform(1, 0, 0, 1, 0, 0); X.emit.globalCompositeOperation = 'source-over'; X.emit.fillStyle = '#000'; X.emit.fillRect(0, 0, EW, EH); X.emit.globalCompositeOperation = 'lighter';
    X.rain.setTransform(1, 0, 0, 1, 0, 0); X.rain.clearRect(0, 0, W, H);
  }
  // the wall: plaster facades, fair stalls at street level (shutters, a lit stall, strings of bulbs)
  const BLD = [[-20, -2.6, 2, 3], [-2.6, 2.6, 0, 4], [2.6, 20, 0, 5], [20, 30, 2, 6], [30, 40, 2, 7], [40, 50, 2, 8], [50, 60, 2, 9], [60, 70, 2, 10]];
  const BLDC = [[.30, .26, .24], [.26, .16, .14], [.32, .36, .40], [.3, .3, .3], [.3, .3, .3], [.3, .3, .3], [.3, .3, .3], [.3, .3, .3]];
  const bldU = new Float32Array(32), bldC = new Float32Array(24); BLD.forEach((b, i) => { bldU.set(b, i * 4); bldC.set(BLDC[i], i * 3); });
  const FRONTS = [[-2.4, 0, -.2, 2.3, 'shutter'], [.2, 0, 2.4, 2.3, 'shutter'], [2.8, 0, 4.8, 2.3, 'stall', [.55, .32, .12]], [5.2, 0, 6.8, 2.3, 'stall', [.5, .2, .3]], [7.2, 0, 8.8, 2.3, 'stall', [.2, .4, .5]], [9.2, 0, 11.2, 2.3, 'stall', [.55, .4, .12]], [11.6, 0, 13.6, 2.3, 'shutter'], [-4.8, 0, -2.8, 2.3, 'shutter']];
  function drawFacade(c, t, lights) {
    const tf = tfStreet(c, 0); if (!tf) return; const O = X.ovl, Ad = X.add; setT(O, tf); setT(Ad, tf); setE(tf);
    for (const [x0, y0, x1, y1, kind, lc] of FRONTS) {
      O.fillStyle = '#26262a'; rect(O, x0 - .06, y0 - .02, x1 + .06, y1 + .06);
      if (kind === 'shutter') { O.fillStyle = '#4a4a4c'; rect(O, x0, 0, x1, y1); for (let y = .04; y < y1; y += .075) { O.fillStyle = 'rgba(20,20,22,.55)'; rect(O, x0, y, x1, y + .012); O.fillStyle = 'rgba(160,160,165,.22)'; rect(O, x0, y + .014, x1, y + .022); } continue; }
      O.fillStyle = '#050608'; rect(O, x0, y0, x1, y1);
      const on = lights; if (on > 0) { const gr = Ad.createLinearGradient(0, y1, 0, y0); gr.addColorStop(0, rgb(lc, .5 * on)); gr.addColorStop(.4, rgb(lc, .22 * on)); gr.addColorStop(1, rgb(lc, .06 * on)); Ad.fillStyle = gr; rect(Ad, x0 + .03, y0 + .03, x1 - .03, y1 - .03);
        // goods in silhouette on the counter
        Ad.fillStyle = '#000'; rect(Ad, x0, .0, x1, .9); for (let k = 0; k < 7; k++) { const xx = x0 + .15 + k * (x1 - x0 - .3) / 6; Ad.beginPath(); Ad.arc(xx, .98, .07 + hsh(k + x0) * .05, 0, 7); Ad.fill(); }
        X.emit.fillStyle = rgb(lc, .3 * on); rect(X.emit, x0, y0, x1, y1); }
      // a striped awning
      for (let k = 0; k < 10; k++) { O.fillStyle = k % 2 ? '#e8e2d4' : (x0 < 0 ? '#b8302a' : '#2a62a8'); rect(O, x0 + k * (x1 - x0) / 10, 2.3, x0 + (k + 1) * (x1 - x0) / 10, 2.62); }
    }
    for (const sg of signs) { const b = sg.backer; if (!b) continue; O.fillStyle = b.trim; rect(O, b.x0 - .035, b.y0 - .035, b.x1 + .035, b.y1 + .035); O.fillStyle = b.col; rect(O, b.x0, b.y0, b.x1, b.y1);
      O.fillStyle = 'rgba(200,200,200,.35)'; for (const [rx, ry] of [[b.x0 + .05, b.y0 + .05], [b.x1 - .05, b.y0 + .05], [b.x0 + .05, b.y1 - .05], [b.x1 - .05, b.y1 - .05]]) { O.beginPath(); O.arc(rx, ry, .012, 0, 6.3); O.fill(); } }
    // festoon of bulbs across the stalls
    for (let k = 0; k < 52; k++) { const u = k / 51, x = 2.6 + u * 11, y = 2.95 - Math.abs(Math.sin(u * Math.PI * 3)) * .22, col = [[1, .8, .4], [1, .35, .3], [.4, .8, 1], [.5, 1, .5]][k % 4];
      const lt = lights * (.7 + .3 * Math.sin(t * 6 - k)); Ad.fillStyle = rgb(col, lt); Ad.beginPath(); Ad.arc(x, y, .035, 0, 7); Ad.fill(); X.emit.fillStyle = rgb(col, .8 * lt); X.emit.beginPath(); X.emit.arc(x, y, .06, 0, 7); X.emit.fill(); }
  }
  const gl = makeGL(canvas, W, H, TOP);
  // power: o.on = {circuit: [t0 strike, t1 off]}; o.lights = stall lights 0..1
  function render(t, c, o = {}) {
    clearLayers();
    drawFacade(c, t, o.lights ?? 1);
    X.emit.globalCompositeOperation = 'lighter';
    const tf = tfStreet(c, .05);
    const power = circ => { const w = (o.on || {})[circ]; if (!w) return 1; const [t0, t1 = 1e9] = w; return t < t1 ? strike(t, t0, circ.length) : 0; };
    const all = [...signs.flatMap(s => s.tubes), ...rd[Math.floor(t * 4) % 2]];
    for (const pass of [0, 1]) for (const tb of all) { let p = power(tb.circ) * hum(t, tb.circ.length);
      if (tb.circ === 'heart' && o.beat) p *= .55 + .45 * Math.pow(Math.max(0, Math.cos((t - o.beat) / .522 * Math.PI)), 6);
      drawTube(tb, tf, { p, fill: 1 }, pass); }
    const u = { mode: 0, K: c.K, t, F, gain: 2.5, envC: [.1, .11, .14], bld: bldU, bldC, exposure: o.exposure ?? 1, lift: [0, 0, 0], vig: .5, bloomGain: 1.1, lightGain: 1.5, tubeD: .015,
      drop: [0, 0, -9, 0], floorAmb: [.008, .01, .016], pud1: [.3, .9, 3.5, .8], pud2: [0, -99, 1, 1], wet: .75, rain: 0, calm: 1, amb: [.014, .016, .03], mT: [0, 0], mS: 0, mR: 0 };
    u.A = [1 / c.K, 0, 0, -1 / c.K]; u.B = [c.lx - W / 2 / c.K, c.ly + (TOP + H / 2) / c.K]; u.lx = c.lx; u.ly = c.ly; u.E = c.E;
    gl.frame(C, u);
  }
  const cam = (lx, ly, K, E) => ({ lx, ly, K: K * S, E, D: F / (K * S) });
  return { render, cam, signs };
}
