// The ceremony: a bulb-lit Bali Jatra gate at night, an inauguration ribbon of Sambalpuri ikat (Odisha) tied to one of
// Javanese batik (Indonesia), gold scissors — and the Kartika wind, as threads of gold, which wove the ribbon and in the end unties it.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';

// ———————————————— textiles (length along x, width along y; tile 512 x 128) ————————————————
export let IKAT, BATIK;
function feather(src, amt, seed) {   // ikat's signature: every thread row shifted a little, so motif edges bleed along the warp
  const out = mk(src.width, src.height), x = out.getContext('2d');
  for (let y = 0; y < src.height; y++) { const dx = (hh(y * 1.7 + seed) - .5) * amt * 2 + Math.sin(y * .7 + seed) * amt * .4; x.drawImage(src, 0, y, src.width, 1, dx, y, src.width, 1); x.drawImage(src, 0, y, src.width, 1, dx - src.width * Math.sign(dx || 1), y, src.width, 1); }
  return out;
}
function weave(x, w, h, a) { x.save(); x.globalAlpha = a; x.fillStyle = '#000'; for (let yy = 0; yy < h; yy += 2) x.fillRect(0, yy, w, .6); x.globalAlpha = a * .6; for (let xx = 0; xx < w; xx += 3) x.fillRect(xx, 0, .5, h); x.restore(); }
export function initTextiles() {
  { // Sambalpuri bandha: red field, black-and-white borders of kumbha (temple-spire) teeth, ikat diamonds and conch-like dots
    const w = 512, h = 128, c = mk(w, h), x = c.getContext('2d');
    x.fillStyle = '#9e1424'; x.fillRect(0, 0, w, h);
    for (const [y0, dir] of [[0, 1], [h, -1]]) {
      x.fillStyle = '#140808'; x.fillRect(0, dir > 0 ? 0 : h - 30, w, 30);
      x.fillStyle = '#f2e6d0'; for (let i = 0; i < w; i += 16) { x.beginPath(); x.moveTo(i, y0 + dir * 30); x.lineTo(i + 8, y0 + dir * 14); x.lineTo(i + 16, y0 + dir * 30); x.fill(); }
      x.fillStyle = '#9e1424'; for (let i = 0; i < w; i += 16) { x.beginPath(); x.moveTo(i + 4, y0 + dir * 30); x.lineTo(i + 8, y0 + dir * 22); x.lineTo(i + 12, y0 + dir * 30); x.fill(); }
      x.fillStyle = '#e8b04a'; x.fillRect(0, dir > 0 ? 3 : h - 6, w, 3);   // a zari line
      x.fillStyle = '#f2e6d0'; for (let i = 6; i < w; i += 16) x.fillRect(i, dir > 0 ? 8 : h - 12, 4, 4);
    }
    for (let i = 0; i < w; i += 64) for (const [dy, s] of [[0, 1]]) {   // diamonds with a cross (the "kumbha" heart), white with a black core
      const cx = i + 32, cy = 64; x.fillStyle = '#f4e8d2'; x.beginPath(); x.moveTo(cx, cy - 22); x.lineTo(cx + 18, cy); x.lineTo(cx, cy + 22); x.lineTo(cx - 18, cy); x.fill();
      x.fillStyle = '#140808'; x.beginPath(); x.moveTo(cx, cy - 12); x.lineTo(cx + 9, cy); x.lineTo(cx, cy + 12); x.lineTo(cx - 9, cy); x.fill();
      x.fillStyle = '#9e1424'; x.fillRect(cx - 2, cy - 2, 4, 4);
      x.fillStyle = '#f4e8d2'; for (const ox of [-32, 0]) { const px = cx + ox + 16; if (ox) { x.beginPath(); x.arc(px, cy - 14, 3, 0, 7); x.arc(px, cy + 14, 3, 0, 7); x.fill(); } }
    }
    const f = feather(c, 2.2, 3), fx = f.getContext('2d'); weave(fx, w, h, .12);
    const sh = fx.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(255,255,255,.06)'); sh.addColorStop(.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.1)'); fx.fillStyle = sh; fx.fillRect(0, 0, w, h);
    IKAT = f;
  }
  { // Javanese batik (sogan): cream ground, kawung (four-petal palm-fruit) in brown, parang bands at the edges, wax crackle
    const w = 512, h = 128, c = mk(w, h), x = c.getContext('2d');
    x.fillStyle = '#e6d2a8'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#5a2e14'; x.fillRect(0, 0, w, 24); x.fillRect(0, h - 24, w, 24);
    x.strokeStyle = '#e6d2a8'; x.lineWidth = 3; for (let i = -24; i < w + 24; i += 12) { x.beginPath(); x.moveTo(i, 24); x.lineTo(i + 20, 0); x.stroke(); x.beginPath(); x.moveTo(i, h); x.lineTo(i + 20, h - 24); x.stroke(); }   // parang
    x.fillStyle = '#2a160c'; for (let i = 0; i < w; i += 6) { x.fillRect(i, 22, 3, 2); x.fillRect(i, h - 24, 3, 2); }
    for (let i = 0; i < w; i += 40) for (const cy of [44, 84]) { const cx = i + (cy === 84 ? 20 : 0);
      x.fillStyle = '#7a3e1a'; for (let k = 0; k < 4; k++) { x.save(); x.translate(cx, cy); x.rotate(k * Math.PI / 2 + Math.PI / 4); x.beginPath(); x.ellipse(0, -9, 5.5, 9, 0, 0, 7); x.fill(); x.restore(); }
      x.fillStyle = '#2a160c'; x.beginPath(); x.arc(cx, cy, 2.4, 0, 7); x.fill();
      x.fillStyle = '#e6d2a8'; for (let k = 0; k < 4; k++) { x.save(); x.translate(cx, cy); x.rotate(k * Math.PI / 2 + Math.PI / 4); x.beginPath(); x.arc(0, -10, 1.6, 0, 7); x.fill(); x.restore(); }
    }
    x.strokeStyle = 'rgba(60,30,12,.35)'; x.lineWidth = .7;   // the crackle where the wax broke
    for (let k = 0; k < 40; k++) { let px = hh(k) * w, py = hh(k + 7) * h; x.beginPath(); x.moveTo(px, py); for (let s = 0; s < 6; s++) { px += (hh(k * 9 + s) - .5) * 30; py += (hh(k * 5 + s) - .5) * 18; x.lineTo(px, py); } x.stroke(); }
    weave(x, w, h, .1); BATIK = c;
  }
}

// ———————————————— the silk strip renderer ————————————————
// pts: centreline [[x,y],...] in the current transform; wid: half-width (number or fn u→w); twist: fn u→angle; tex scrolls by off
export function ribbon(c, pts, tex, wid, twist, off = 0, a = 1, sheen = 0) {
  if (a <= 0 || pts.length < 2) return;
  const n = pts.length, L = [0]; for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const texScale = tex.height / 2 / (typeof wid === 'number' ? wid : wid(0)), TW = tex.width;
  c.save(); c.globalAlpha = a;
  for (let i = 0; i < n - 1; i++) {
    const u = i / (n - 1), [x0, y0] = pts[i], [x1, y1] = pts[i + 1], dx = x1 - x0, dy = y1 - y0, sl = Math.hypot(dx, dy) || 1, nx = -dy / sl, ny = dx / sl;
    const tw = twist(u), cs = Math.cos(tw), hw = (typeof wid === 'number' ? wid : wid(u)) * Math.max(.06, Math.abs(cs));
    let u0 = ((L[i] * texScale + off) % TW + TW) % TW, du = Math.max(1, sl * texScale + .8); if (u0 + du > TW) u0 = Math.max(0, TW - du);
    c.save(); c.transform(dx / du * (sl + .9) / sl, dy / du * (sl + .9) / sl, nx * 2 * hw / tex.height, ny * 2 * hw / tex.height, x0 - nx * hw, y0 - ny * hw);
    c.drawImage(tex, u0, 0, du, tex.height, 0, 0, du, tex.height); c.restore();
    const shade = .55 + .45 * Math.abs(cs), back = cs < 0;
    c.beginPath(); c.moveTo(x0 - nx * hw, y0 - ny * hw); c.lineTo(x1 - nx * hw, y1 - ny * hw); c.lineTo(x1 + nx * hw, y1 + ny * hw); c.lineTo(x0 + nx * hw, y0 + ny * hw); c.closePath();
    if (shade < .99 || back) { c.fillStyle = `rgba(20,4,4,${(1 - shade) * .9 + (back ? .18 : 0)})`; c.fill(); }
    const sp = Math.pow(Math.max(0, Math.sin(tw * 1.3 + u * 7 + sheen)), 6) * .32 * Math.abs(cs); if (sp > .01) { c.fillStyle = `rgba(255,236,206,${sp})`; c.globalCompositeOperation = 'lighter'; c.fill(); c.globalCompositeOperation = 'source-over'; }
  }
  c.restore();
}

// ———————————————— the gate world (1080 x 1920 at zoom 1) ————————————————
export const GATE = { lx: 214, rx: 866, ribY: 1120, bowX: 540, bowY: 1132 };
let BOKEH;
export function initGate() {
  const c = mk(1400, 2300), x = c.getContext('2d');   // behind the gate: deep velvet night, a few far lights, nothing that competes
  const g = x.createLinearGradient(0, 0, 0, 2300); g.addColorStop(0, '#070405'); g.addColorStop(.45, '#120607'); g.addColorStop(.75, '#180806'); g.addColorStop(1, '#080403'); x.fillStyle = g; x.fillRect(0, 0, 1400, 2300);
  x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 46; i++) { const px = hh(i * 3.1) * 1400, py = 1100 + hh(i * 7.3) * 520, r = 18 + hh(i * 1.9) * 34, hue = hh(i * 5.5);
    const col = hue < .7 ? '255,170,90' : '255,214,160';
    const gg = x.createRadialGradient(px, py, r * .3, px, py, r); gg.addColorStop(0, `rgba(${col},.035)`); gg.addColorStop(.85, `rgba(${col},.06)`); gg.addColorStop(1, `rgba(${col},0)`); x.fillStyle = gg; x.fillRect(px - r, py - r, r * 2, r * 2); }
  const sp = x.createRadialGradient(700, 1310, 40, 700, 1310, 620); sp.addColorStop(0, 'rgba(150,40,24,.30)'); sp.addColorStop(1, 'rgba(120,30,18,0)'); x.fillStyle = sp; x.fillRect(0, 600, 1400, 1400);   // a pool of warm light behind the ribbon
  BOKEH = c;
}
function bulbs(c, pts, r, t, phase, B = 1, col = '255,214,150') {   // a chain of bulbs along a polyline, chasing
  for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i], on = (.72 + .28 * Math.sin(t * 7 - i * .55 + phase)) * B;
    const g = c.createRadialGradient(x, y, 0, x, y, r * 4.5); g.addColorStop(0, `rgba(${col},${.85 * on})`); g.addColorStop(.3, `rgba(${col},${.25 * on})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r * 4.5, y - r * 4.5, r * 9, r * 9);
    c.fillStyle = `rgba(255,248,232,${on})`; c.beginPath(); c.arc(x, y, r * .55, 0, 7); c.fill(); }
}
function sample(path, step) {   // path: polyline → evenly spaced points
  const out = []; let carry = 0;
  for (let i = 1; i < path.length; i++) { const [x0, y0] = path[i - 1], [x1, y1] = path[i], L = Math.hypot(x1 - x0, y1 - y0); let d = carry;
    while (d <= L) { out.push([x0 + (x1 - x0) * d / L, y0 + (y1 - y0) * d / L]); d += step; } carry = d - L; }
  return out;
}
const ARCH = (() => {   // a temple-gate outline (torana): straight pillars, an ogee arch, a crest
  const P = []; const L = GATE.lx, R = GATE.rx;
  const left = [[L, 1560], [L, 700]], right = [[R, 700], [R, 1560]];
  const arc = []; for (let i = 0; i <= 60; i++) { const u = i / 60, a = Math.PI * (1 - u); const x = 540 + Math.cos(a) * (R - L) / 2, y = 700 - Math.sin(a) * 300 - Math.pow(Math.sin(a), 8) * 90; arc.push([x, y]); }
  return { outer: [...left, ...arc, ...right], inner: (() => { const q = []; for (let i = 0; i <= 50; i++) { const u = i / 50, a = Math.PI * (1 - u); q.push([540 + Math.cos(a) * (R - L - 90) / 2, 760 - Math.sin(a) * 250]); } return [[L + 45, 1560], [L + 45, 760], ...q, [R - 45, 760], [R - 45, 1560]]; })() };
})();
let SIGN;
export function initSign() {   // ବାଲିଯାତ୍ରା in bulbs: rasterise the word, keep a grid of bulb points on its strokes
  const c = mk(700, 140), x = c.getContext('2d'); x.fillStyle = '#fff'; x.font = '700 104px "OdiaSerif"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ବାଲିଯାତ୍ରା', 350, 74);
  const d = x.getImageData(0, 0, 700, 140).data, pts = [];
  for (let y = 2; y < 140; y += 7) for (let xx = 2 + ((y / 7) % 2) * 3.5; xx < 700; xx += 7) if (d[(Math.round(y) * 700 + Math.round(xx)) * 4 + 3] > 140) pts.push([xx - 350, y - 74]);
  SIGN = { pts, img: c };
}
export const SIGN_POS = { x: 540, y: 560, s: .9 };
function fair(c, t, a) {
  c.save(); c.globalAlpha = a;
  for (const [wx, wy, R, sp, n] of [[110, 880, 330, .16, 36], [1010, 960, 230, -.2, 26]]) {   // two Ramdolis, turning
    c.strokeStyle = 'rgba(70,30,20,.9)'; c.lineWidth = 6; c.beginPath(); c.moveTo(wx - R * .6, 1330); c.lineTo(wx, wy); c.lineTo(wx + R * .6, 1330); c.stroke();
    c.lineWidth = 2; c.strokeStyle = 'rgba(120,60,36,.8)'; for (let k = 0; k < n / 2; k++) { const an = t * sp + k / (n / 2) * Math.PI * 2; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(an) * R, wy + Math.sin(an) * R); c.stroke(); }
    c.save(); c.globalCompositeOperation = 'lighter'; const rim = []; for (let k = 0; k < n; k++) { const an = t * sp + k / n * Math.PI * 2; rim.push([wx + Math.cos(an) * R, wy + Math.sin(an) * R]); } bulbs(c, rim, 5.2, t, wx, 1.25, '255,214,150');
    const hub = []; for (let k = 0; k < n; k++) { const an = t * sp + k / n * Math.PI * 2; hub.push([wx + Math.cos(an) * R * .55, wy + Math.sin(an) * R * .55]); } bulbs(c, hub, 3.6, t, wx + 3, 1, '255,150,110'); bulbs(c, [[wx, wy]], 9, t, 0, 1.2, '255,226,170'); c.restore();
    for (let k = 0; k < n / 4; k++) { const an = t * sp + k / (n / 4) * Math.PI * 2, gx = wx + Math.cos(an) * R, gy = wy + Math.sin(an) * R; c.fillStyle = 'rgba(40,16,10,.95)'; c.beginPath(); c.roundRect(gx - 14, gy, 28, 26, 5); c.fill(); }
  }
  for (const [a0, a1, y0, sag] of [[-60, 330, 1000, 70], [760, 1160, 1040, 60]]) { const pts = []; for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push([lerp(a0, a1, u), y0 + Math.sin(u * Math.PI) * sag]); } c.save(); c.globalCompositeOperation = 'lighter'; bulbs(c, pts, 3.2, t, a0, .9, '255,190,120'); c.restore(); }
  for (let x = -120, k = 0; x < 1240; x += 150, k++) {   // stalls: striped awnings, warm lit fronts
    for (let s = 0; s < 6; s++) { c.fillStyle = s % 2 ? 'rgba(150,30,26,.95)' : 'rgba(226,196,150,.9)'; c.beginPath(); c.moveTo(x + 75, 1232); c.lineTo(x + s * 25, 1296); c.lineTo(x + (s + 1) * 25, 1296); c.closePath(); c.fill(); }
    const g = c.createLinearGradient(0, 1296, 0, 1336); g.addColorStop(0, 'rgba(255,196,110,.85)'); g.addColorStop(1, 'rgba(255,150,70,.25)'); c.fillStyle = g; c.fillRect(x + 6, 1296, 138, 40);
    c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(x + 75, 1316, 0, x + 75, 1316, 110); gl.addColorStop(0, 'rgba(255,170,90,.25)'); gl.addColorStop(1, 'rgba(255,150,70,0)'); c.fillStyle = gl; c.fillRect(x - 40, 1200, 230, 230); c.restore(); }
  c.restore();
}
export function gate(c, t, B = 1, z = 1) {   // B: how lit the fair is; z: the camera's zoom (close-ups stay clean)
  c.drawImage(BOKEH, -160, -190);
  const mx = 790, my = 210; const mg = c.createRadialGradient(mx, my, 20, mx, my, 220); mg.addColorStop(0, 'rgba(255,244,220,.35)'); mg.addColorStop(1, 'rgba(255,230,190,0)'); c.fillStyle = mg; c.fillRect(mx - 220, my - 220, 440, 440);
  c.fillStyle = '#f6ecd8'; c.beginPath(); c.arc(mx, my, 56, 0, 7); c.fill(); c.fillStyle = 'rgba(200,180,150,.25)'; for (const [ox, oy, r] of [[-14, -10, 14], [16, 12, 10], [-4, 20, 8]]) { c.beginPath(); c.arc(mx + ox, my + oy, r, 0, 7); c.fill(); }   // the Kartika full moon
  const fa = 1 - ss(seg(z, 1.12, 1.55)); if (fa > 0) fair(c, t, fa * B);   // "one fair": the Ramdoli, festoons, stalls — only when the camera stands back
  // the gate's structure (dark lacquer), then its lights: a triple-lined torana, cusped inner arch, a crest, a fringe of hanging lights
  c.save(); c.lineJoin = 'round'; c.strokeStyle = '#160807'; c.lineWidth = 74; c.beginPath(); ARCH.outer.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
  c.strokeStyle = '#2e100c'; c.lineWidth = 50; c.stroke(); c.restore();
  c.fillStyle = '#160807'; c.beginPath(); c.moveTo(510, 330); c.quadraticCurveTo(540, 250, 570, 330); c.fill(); c.beginPath(); c.arc(540, 262, 22, 0, 7); c.fill();
  const pg = c.createLinearGradient(0, 500, 0, 640); pg.addColorStop(0, '#34080c'); pg.addColorStop(1, '#1e0406'); c.fillStyle = pg; c.beginPath(); c.roundRect(GATE.lx + 34, 498, GATE.rx - GATE.lx - 68, 136, 14); c.fill(); c.strokeStyle = 'rgba(214,168,90,.75)'; c.lineWidth = 2; c.beginPath(); c.roundRect(GATE.lx + 44, 508, GATE.rx - GATE.lx - 88, 116, 10); c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter';
  const off = (pts, d) => pts.map(([x, y], i) => { const [a0, b0] = pts[Math.max(0, i - 1)], [a1, b1] = pts[Math.min(pts.length - 1, i + 1)]; const dx = a1 - a0, dy = b1 - b0, l = Math.hypot(dx, dy) || 1; return [x - dy / l * d, y + dx / l * d]; });
  bulbs(c, sample(off(ARCH.outer, -28), 20), 4.2, t, 0, B, '255,200,120');
  bulbs(c, sample(ARCH.outer, 17), 5, t, 1.5, B, '255,236,190');
  bulbs(c, sample(off(ARCH.outer, 28), 20), 4.2, t, 3, B, '255,150,110');
  const inner = ARCH.inner, cusp = [];   // cusps: little lobes along the inner arch
  for (let i = 0; i < inner.length - 1; i++) { const [x0, y0] = inner[i], [x1, y1] = inner[i + 1]; if (y0 > 1300 && y1 > 1300) { cusp.push([x0, y0]); continue; } const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1; cusp.push([x0, y0], [mx + dy / l * 16, my - dx / l * 16]); }
  bulbs(c, sample(cusp, 15), 3.4, t, 2, B * .9, '255,184,110');
  const fr = 1 - ss(seg(z, 1.15, 1.6)); if (fr > 0) for (let k = 0; k < 15; k++) { const x = GATE.lx + 70 + k * (GATE.rx - GATE.lx - 140) / 14, top = 700 - Math.sin(Math.PI * (k / 14)) * 220, len = 120 + 180 * hh(k * 3.3) + Math.sin(Math.PI * k / 14) * 80;   // the fringe
    if (x > GATE.lx + 30 && x < GATE.rx - 30) bulbs(c, sample([[x, Math.max(top, 640)], [x + Math.sin(t * 1.3 + k) * 4, Math.max(top, 640) + len]], 22), 2.6, t * 1.4, k, B * .6 * fr, k % 3 ? '255,214,150' : '255,160,120'); }
  bulbs(c, sample([[510, 330], [540, 250], [570, 330]], 10), 3.4, t, 4, B, '255,236,190'); bulbs(c, [[540, 236]], 7, t, 0, B, '255,240,200');
  for (const px of [GATE.lx, GATE.rx]) { bulbs(c, sample([[px - 26, 1560], [px - 26, 690]], 22), 3.4, t, px, B * .9, '255,190,120'); bulbs(c, sample([[px + 26, 1560], [px + 26, 690]], 22), 3.4, t, px + 1, B * .9, '255,190,120'); }
  const { x: sx, y: sy, s } = SIGN_POS; c.save(); c.translate(sx, sy); c.scale(s, s); bulbs(c, SIGN.pts, 2.5, t * .3, 0, B * 1.0, '255,244,224'); c.restore();
  c.restore();
  const gr = c.createLinearGradient(0, 1500, 0, 1920); gr.addColorStop(0, 'rgba(10,4,3,0)'); gr.addColorStop(.3, 'rgba(10,4,3,.85)'); gr.addColorStop(1, 'rgba(6,2,2,1)'); c.fillStyle = gr; c.fillRect(-200, 1500, 1500, 500);   // the dark path through the gate
  const rf = c.createRadialGradient(540, 1620, 10, 540, 1620, 420); rf.addColorStop(0, `rgba(255,190,110,${.12 * B})`); rf.addColorStop(1, 'rgba(255,160,90,0)'); c.fillStyle = rf; c.fillRect(100, 1400, 880, 500);
}

// ———————————————— the ribbon across the gate, the bow, the scissors ————————————————
// state: k (0..1 how much of the ikat ribbon is woven), j (batik arrival 0..1), bow (0..1), untie (0..1), gust (0..1 wind strength)
export function ceremonyRibbon(c, t, st) {
  const { k = 1, j = 0, bow = 0, untie = 0, gust = 0, cut = 99 } = st;   // cut: seconds since the scissors closed (< 0: not yet cut)
  const fl = (u, amp) => Math.sin(u * 9 - t * 3.1) * amp + Math.sin(u * 23 - t * 5.3) * amp * .3;
  const amp = 6 + gust * 26, tw = u => .35 * Math.sin(u * 7 - t * 2.4) + gust * .9 * Math.sin(u * 12 - t * 7);
  const sag = (x, x0, x1, d) => Math.sin(clamp((x - x0) / (x1 - x0)) * Math.PI) * d;
  const blow = untie;   // once untied, the wind carries both halves off to the right and up
  // the ikat half: from the left pillar to the knot
  const bx = GATE.bowX, by = GATE.bowY;
  const XC = 516, cutOn = cut >= 0, xEnd = !cutOn ? GATE.rx : j > 0 ? lerp(XC, bx, eo(clamp(j * 1.2))) : XC;
  const ik = [];
  for (let i = 0; i <= 90; i++) { const u = i / 90, x = lerp(GATE.lx, xEnd, u); let y = GATE.ribY + sag(x, GATE.lx, xEnd, 18) + fl(u, amp) * (!cutOn || j > .99 ? Math.sin(u * Math.PI) : u) + (cutOn && j < 1 ? Math.pow(u, 3) * 26 * (1 - j) * ss(clamp(cut * 3)) : 0);
    let xo = 0; if (blow > 0) { const w = ss(seg(u, .35, 1)) * eo(blow); y -= w * (420 + 90 * Math.sin(u * 7 - t * 9)) ; xo = w * 380; } ik.push([x + xo, y]); }
  const ikP = ik.slice(0, Math.max(2, Math.round(91 * clamp(k)))), ikA = 1 - ss(seg(blow, .35, .85));
  ribbon(c, ikP, IKAT, 40, tw, -t * 4, ikA, t);
  if (cutOn && cut < 1.6) {   // the cut-away half swings down from the right pillar and out of sight
    const th = Math.PI / 2 * clamp(1 - Math.pow(1 - clamp(cut / .9), 3) * 1 + Math.sin(clamp(cut / .9) * Math.PI) * .12 * 0, 0, 1.2) + Math.sin(cut * 9) * .08 * Math.exp(-cut * 3), P = [], L = GATE.rx - XC;
    for (let i = 0; i <= 50; i++) { const u = i / 50, d = (1 - u) * L; P.push([GATE.rx - Math.cos(th) * d + Math.sin(u * 7 - t * 5) * 6 * Math.sin(th), GATE.ribY + Math.sin(th) * d + Math.sin(u * 9 - t * 4) * 8]); }
    ribbon(c, P, IKAT, 40, u => .4 * Math.sin(u * 6 - t * 3), 0, 1 - ss(seg(cut, 1.0, 1.6)), t);
  }
  if (j > 0) {   // the batik half arrives from the right pillar
    const ba = []; for (let i = 0; i <= 90; i++) { const u = i / 90, x = lerp(GATE.rx, bx, u); let y = GATE.ribY + sag(x, bx, GATE.rx, 18) + fl(1 - u, amp) * Math.sin(u * Math.PI);
      const swing = (1 - eo(j)); y -= swing * Math.sin(u * Math.PI * .9) * 380 * u; let xx = x + swing * u * 240;
      if (blow > 0) { const w = ss(seg(u, .35, 1)) * eo(blow); y -= w * (480 + 90 * Math.sin(u * 6 - t * 8)); xx += w * 300; } ba.push([xx, y]); }
    ribbon(c, ba.slice(0, Math.max(2, Math.round(91 * clamp(j * 1.4)))), BATIK, 40, u => -tw(u), t * 4, 1 - ss(seg(blow, .35, .85)), t + 2);
  }
  const bw = bow * (1 - ss(seg(untie, 0, .3)));
  if (bw > 0) {   // the bow: two loops (ikat left, batik right), two tails, a wrapped knot
    const s = backOutS(bw), fb = Math.sin(t * 3.4) * (4 + gust * 14);
    const loop = (side, tex) => { const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2; const r = 1 - Math.cos(a); pts.push([bx + side * Math.sin(a / 2) * 118 * s * (.9 + .1 * Math.cos(a)), by - 4 + Math.sin(a) * 34 * s + side * fb * Math.sin(a / 2) * .2]); } return pts; };
    const tail = (side, tex) => { const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([bx + side * (10 + u * 70 * s + Math.sin(u * 4 - t * 3) * 8 * (1 + gust * 3)), by + 10 + u * 150 * s + fb * u]); } return pts; };
    ribbon(c, tail(-1), IKAT, 34 * s, u => .3 * Math.sin(u * 6 - t * 2), 50, 1, t);
    ribbon(c, tail(1), BATIK, 34 * s, u => .3 * Math.sin(u * 6 - t * 2.2), 90, 1, t);
    ribbon(c, loop(-1), IKAT, 32 * s, u => .5 * Math.sin(u * Math.PI * 2), 10, 1, t);
    ribbon(c, loop(1), BATIK, 32 * s, u => .5 * Math.sin(u * Math.PI * 2), 30, 1, t);
    c.save(); c.translate(bx, by); c.scale(s, s); const kg = c.createLinearGradient(-20, 0, 20, 0); kg.addColorStop(0, '#7a1020'); kg.addColorStop(.5, '#c8a050'); kg.addColorStop(1, '#5a2e14'); c.fillStyle = kg; c.beginPath(); c.roundRect(-22, -30, 44, 60, 10); c.fill();
    c.strokeStyle = 'rgba(255,230,180,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-14, -24); c.quadraticCurveTo(0, -30, 14, -24); c.stroke(); c.restore();
  }
}
const backOutS = x => { x = clamp(x); const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export function scissors(c, x, y, s, rot, open, a = 1, gleam = -1) {   // gold ceremonial scissors: two blades on a pivot, looped handles
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const metal = (x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#6a4a18'); g.addColorStop(.35, '#f6dc94'); g.addColorStop(.55, '#c89a3a'); g.addColorStop(1, '#5a3a10'); return g; };
  for (const sd of [-1, 1]) { c.save(); c.rotate(sd * open * .32);
    c.fillStyle = metal(0, -10 * sd, 0, 10 * sd); c.beginPath(); c.moveTo(0, -6 * sd); c.quadraticCurveTo(-120, -14 * sd, -230, -2 * sd); c.quadraticCurveTo(-120, 4 * sd, 0, 7 * sd); c.closePath(); c.fill();   // blade
    c.strokeStyle = 'rgba(255,246,214,.7)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-20, -4 * sd); c.quadraticCurveTo(-120, -11 * sd, -220, -2 * sd); c.stroke();
    c.lineWidth = 11; c.strokeStyle = metal(20, -40 * sd, 120, -10 * sd); c.beginPath(); c.moveTo(4, 4 * sd); c.quadraticCurveTo(40, 20 * sd, 70, 30 * sd); c.stroke();   // shank
    c.beginPath(); c.ellipse(104, 38 * sd, 36, 24, .25 * sd, 0, 7); c.stroke();   // ring
    c.restore(); }
  c.fillStyle = '#f8e2a0'; c.beginPath(); c.arc(0, 0, 7, 0, 7); c.fill(); c.fillStyle = '#6a4a18'; c.beginPath(); c.arc(0, 0, 3, 0, 7); c.fill();
  if (gleam > 0 && gleam < 1) { c.globalCompositeOperation = 'lighter'; for (const sd of [-1, 1]) { c.save(); c.rotate(sd * open * .32); const gx = lerp(40, -230, gleam), g = c.createRadialGradient(gx, 0, 0, gx, 0, 40); g.addColorStop(0, 'rgba(255,250,230,.95)'); g.addColorStop(1, 'rgba(255,230,170,0)'); c.fillStyle = g; c.fillRect(gx - 40, -40, 80, 80); c.restore(); } }   // a gleam runs down the blades
  c.restore();
}

// ———————————————— the Kartika wind: threads of gold, in screen space ————————————————
// tau: time (loops: the end uses t − DUR); conv: 0..1 how far the threads have gathered into the ribbon line yR (screen), front: x of the weave
export function windThreads(c, tau, a = 1, o = {}) {
  if (a <= 0) return; const N = o.n || 30, conv = o.conv || 0, yR = o.yR || 1000, spread = o.spread || 1, gust = o.gust ?? .5;
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  for (let i = 0; i < N; i++) {
    const y0 = 160 + hh(i * 3.7) * 1600, ph = hh(i * 1.3) * 6.28, sp = .6 + hh(i * 2.2) * .8, amp = (40 + hh(i * 5.1) * 120) * spread, br = .35 + .65 * hh(i * 8.8);
    const pts = []; for (let k = 0; k <= 48; k++) { const x = -60 + k * 25;
      let y = y0 + Math.sin(x * .004 + tau * sp + ph) * amp + Math.sin(x * .011 - tau * 1.7 * sp + ph * 2) * amp * .25 * (1 + gust);
      if (conv > 0) { const f = ss(seg(conv * 1.4 - (1 - x / W) * .4, 0, 1)); y = lerp(y, yR + (hh(i * 4.4) - .5) * 70, f); }
      pts.push([x, y]); }
    const flow = (tau * (60 + 90 * sp) + ph * 100) % 1400;   // a bright pulse travelling along each thread
    for (const [lw, al] of [[6, .05], [1.6, .32]]) { c.lineWidth = lw; c.beginPath(); pts.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y));
      const g = c.createLinearGradient(-60, 0, 1140, 0); const f0 = clamp((flow - 300) / 1200), f1 = clamp(flow / 1200);
      g.addColorStop(0, `rgba(255,206,120,${al * .35 * br * a})`); g.addColorStop(f0, `rgba(255,206,120,${al * .45 * br * a})`); g.addColorStop(Math.min(1, Math.max(f0 + .001, f1)), `rgba(255,240,200,${al * 1.6 * br * a})`); g.addColorStop(Math.min(1, f1 + .05), `rgba(255,206,120,${al * .45 * br * a})`); g.addColorStop(1, `rgba(255,206,120,${al * .3 * br * a})`);
      c.strokeStyle = g; c.stroke(); }
  }
  c.restore();
}
