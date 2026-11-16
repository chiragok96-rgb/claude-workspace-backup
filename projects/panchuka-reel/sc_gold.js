// The five beshas (Huashu 18 Klimt gold leaf): five gold-leaf plaques, each with an enamel medallion and its name.
// Gold leaf is per-pixel (mottling + brushed streaks + leaf seams), Klimt spirals and concentric circles in the field,
// a black-and-white Secession checker border. Each plaque opens on its spoken name.
export const W = 1080, H = 1920;
const mul = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const vn = (x, y) => { const h = (a, b) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); }; const i = Math.floor(x), j = Math.floor(y), f = x - i, g = y - j, u = f * f * (3 - 2 * f), v = g * g * (3 - 2 * g); return lerp(lerp(h(i, j), h(i + 1, j), u), lerp(h(i, j + 1), h(i + 1, j + 1), u), v); };
const fbm = (x, y) => vn(x, y) * .5 + vn(x * 2.03 + 9, y * 2.03) * .3 + vn(x * 4.1 + 3, y * 4.1 + 7) * .2;
export const BESHA = [
  { en: 'LAKSHMINARAYANA', od: 'ଲକ୍ଷ୍ମୀନାରାୟଣ', enamel: '#173d7a', t: 23.39 },
  { en: 'BANKACHUDA', od: 'ବାଙ୍କଚୂଡ଼ା', enamel: '#7a1a1a', t: 24.6 },
  { en: 'TRIVIKRAMA', od: 'ତ୍ରିବିକ୍ରମ', enamel: '#123d36', t: 25.70 },
  { en: 'LAKSHMINRUSINGHA', od: 'ଲକ୍ଷ୍ମୀନୃସିଂହ', enamel: '#5a1d4a', t: 26.73 },
  { en: 'RAJARAJESHWARA', od: 'ରାଜରାଜେଶ୍ୱର', enamel: '#1d1d3d', t: 29.16 },
];
const PW = 940, PH = 196;
let GOLDTEX, PLAQ = [], BG;
function goldTex(w, h, seed) {   // per-pixel gold leaf: mottling, brushed streaks, leaf seams, gold dust
  const cv = mk(w, h), c = cv.getContext('2d'), img = c.createImageData(w, h), d = img.data, R = mul(seed);
  const lo = [118, 76, 18], mi = [198, 150, 54], hi = [248, 220, 134];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let f = clamp(.56 + (fbm(x * .005 + seed, y * .008) - .5) * .9 + (vn(x * .004, y * .05 + seed) - .5) * .22 + (R() - .5) * .07);
    const col = f < .5 ? lo.map((v, i) => lerp(v, mi[i], f * 2)) : mi.map((v, i) => lerp(v, hi[i], (f - .5) * 2)); const i = (y * w + x) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255; }
  c.putImageData(img, 0, 0);
  c.strokeStyle = 'rgba(90,55,10,.2)'; c.lineWidth = 1; for (let y = 0; y < h; y += 64) for (let x = (y / 64 % 2) * 32; x < w; x += 64) c.strokeRect(x + .5, y + .5, 64, 64);
  for (let i = 0; i < w * h / 260; i++) { c.fillStyle = R() < .7 ? `rgba(255,234,150,${.3 + R() * .5})` : `rgba(70,40,10,${.2 + R() * .3})`; c.fillRect(R() * w, R() * h, .8 + R() * 1.6, .8 + R() * 1.6); }
  return cv;
}
function spiral(c, x, y, r, turns, col, w = 2) { c.save(); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60, a = u * turns * Math.PI * 2, rr = r * u; i ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x, y); } c.stroke(); c.restore(); }
function gstroke(c, path, w = 3) { c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); path(c); c.lineWidth = w + 2.5; c.strokeStyle = '#3a2208'; c.stroke(); c.lineWidth = w; c.strokeStyle = '#f2cf72'; c.stroke(); c.lineWidth = w * .35; c.strokeStyle = 'rgba(255,250,220,.9)'; c.stroke(); c.restore(); }
function gfill(c, path, a = 1) { c.save(); c.globalAlpha = a; c.beginPath(); path(c); const g = c.createLinearGradient(-60, -60, 60, 60); g.addColorStop(0, '#fff0b0'); g.addColorStop(.45, '#e2b148'); g.addColorStop(1, '#8a5a12'); c.fillStyle = g; c.fill(); c.lineWidth = 2; c.strokeStyle = '#3a2208'; c.stroke(); c.restore(); }
// the five emblems, drawn at the medallion's centre, radius ~70
const EMB = [
  c => {   // Lakshminarayana: a lotus held in the chakra
    gstroke(c, p => p.arc(0, 0, 60, 0, 7), 3.4); gstroke(c, p => p.arc(0, 0, 46, 0, 7), 2);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; gstroke(c, p => { p.moveTo(Math.cos(a) * 46, Math.sin(a) * 46); p.lineTo(Math.cos(a) * 60, Math.sin(a) * 60); }, 2.4); }
    for (let k = 0; k < 8; k++) { c.save(); c.rotate(k / 8 * Math.PI * 2); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(14, -18, 0, -38); c.quadraticCurveTo(-14, -18, 0, 0); c.fillStyle = k % 2 ? '#e88aa8' : '#f4b8c8'; c.fill(); c.lineWidth = 1.6; c.strokeStyle = '#5a1a2a'; c.stroke(); c.restore(); }
    gfill(c, p => p.arc(0, 0, 9, 0, 7));
  },
  c => {   // Bankachuda: the tilted crest, crowned with a golden kia (ketaki) spray
    c.save(); c.rotate(-.42);
    c.translate(0, 14);
    gfill(c, p => { p.moveTo(-30, 40); p.lineTo(30, 40); p.lineTo(24, 14); p.lineTo(18, 14); p.lineTo(14, -10); p.lineTo(8, -10); p.quadraticCurveTo(0, -36, -8, -10); p.lineTo(-14, -10); p.lineTo(-18, 14); p.lineTo(-24, 14); p.closePath(); });
    gstroke(c, p => { p.moveTo(-28, 30); p.lineTo(28, 30); p.moveTo(-20, 8); p.lineTo(20, 8); }, 1.4);
    for (let k = -1; k <= 1; k++) { c.fillStyle = k ? '#c8283a' : '#2a7ad0'; c.beginPath(); c.arc(k * 13, 20, 4.2, 0, 7); c.fill(); }
    for (let k = -2; k <= 2; k++) { const a = k * .26; c.save(); c.translate(0, -26); c.rotate(a);
      gfill(c, p => { p.moveTo(0, 0); p.quadraticCurveTo(7, -22, 0, -50 - (2 - Math.abs(k)) * 8); p.quadraticCurveTo(-7, -22, 0, 0); }); c.restore(); }
    c.restore();
  },
  c => {   // Trivikrama: three strides, earth, sky, heaven
    for (let k = 0; k < 3; k++) gstroke(c, p => p.arc(0, 30, 24 + k * 16, Math.PI * 1.05, Math.PI * 1.95), 1.4);
    [[-30, 36, -.3], [0, 4, .1], [30, -30, -.2]].forEach(([x, y, r], i) => { c.save(); c.translate(x, y); c.rotate(r + (i % 2 ? .3 : -.1));
      gfill(c, p => p.ellipse(0, 0, 9, 16, 0, 0, 7)); for (let t = 0; t < 5; t++) gfill(c, p => p.arc(-8 + t * 4, -19 - Math.abs(2 - t) * -1.5, 2.6, 0, 7)); c.restore(); });
  },
  c => {   // Lakshminrusingha: the lion, his mane in Klimt spirals; a small lotus below
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; spiral(c, Math.cos(a) * 44, Math.sin(a) * 44 - 6, 12, 1.6, '#f2cf72', 2.2); }
    gfill(c, p => { p.moveTo(-30, -26); p.quadraticCurveTo(0, -44, 30, -26); p.quadraticCurveTo(38, 4, 22, 22); p.quadraticCurveTo(0, 34, -22, 22); p.quadraticCurveTo(-38, 4, -30, -26); });
    c.strokeStyle = '#2a1608'; c.fillStyle = '#2a1608'; c.lineWidth = 2.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-24, -20); c.quadraticCurveTo(-12, -28, -3, -18); c.moveTo(24, -20); c.quadraticCurveTo(12, -28, 3, -18); c.stroke();
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 20, -12); c.quadraticCurveTo(d * 13, -18, d * 6, -12); c.quadraticCurveTo(d * 13, -8, d * 20, -12); c.fill(); }
    c.beginPath(); c.moveTo(-8, -4); c.quadraticCurveTo(0, -10, 8, -4); c.lineTo(5, 4); c.lineTo(-5, 4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-14, 12); c.quadraticCurveTo(0, 22, 14, 12); c.stroke();
    c.fillStyle = '#fff6e0'; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 9, 14); c.lineTo(d * 6, 22); c.lineTo(d * 4, 14.5); c.fill(); }
    for (let k = -2; k <= 2; k++) { c.save(); c.translate(0, 58); c.rotate(k * .4); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(6, -8, 0, -16); c.quadraticCurveTo(-6, -8, 0, 0); c.fillStyle = '#f4b8c8'; c.fill(); c.restore(); }
  },
  c => {   // Rajarajeshwara: the royal crown beneath the full moon
    c.save(); const g = c.createRadialGradient(0, -34, 2, 0, -34, 30); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e8e2cc'); c.fillStyle = g; c.beginPath(); c.arc(0, -34, 24, 0, 7); c.fill(); c.lineWidth = 2; c.strokeStyle = '#3a2208'; c.stroke(); c.restore();
    gfill(c, p => { p.moveTo(-46, 46); p.lineTo(46, 46); p.lineTo(52, 2); p.lineTo(28, 22); p.lineTo(14, -6); p.lineTo(0, 16); p.lineTo(-14, -6); p.lineTo(-28, 22); p.lineTo(-52, 2); p.closePath(); });
    gstroke(c, p => { p.moveTo(-46, 34); p.lineTo(46, 34); }, 1.6);
    [[-30, 26, '#c8283a'], [0, 28, '#2a7ad0'], [30, 26, '#c8283a']].forEach(([x, y, col]) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); });
  },
];
export function initGold() {
  GOLDTEX = goldTex(PW, PH, 11);
  BG = mk(); const c = BG.getContext('2d'), R = mul(3);
  const g = c.createRadialGradient(540, 860, 100, 540, 860, 1300); g.addColorStop(0, '#2a1a0c'); g.addColorStop(1, '#070504'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(230,190,100,${.03 + R() * .1})`; c.fillRect(R() * W, R() * H, 1 + R() * 2, 1 + R() * 2); }
  PLAQ = BESHA.map((b, i) => {   // each plaque, built once
    const cv = mk(PW + 40, PH + 40), c = cv.getContext('2d'), R = mul(40 + i); c.translate(20, 20);
    c.save(); c.shadowColor = 'rgba(0,0,0,.65)'; c.shadowBlur = 22; c.shadowOffsetY = 8; c.fillStyle = '#3a2410'; c.fillRect(0, 0, PW, PH); c.restore();
    const bz = c.createLinearGradient(0, 0, 0, PH); bz.addColorStop(0, '#6a4a1c'); bz.addColorStop(.5, '#3a2410'); bz.addColorStop(1, '#5a3c14'); c.fillStyle = bz; c.fillRect(0, 0, PW, PH);
    c.drawImage(GOLDTEX, 0, 0, PW, PH, 9, 9, PW - 18, PH - 18);
    c.save(); c.beginPath(); c.rect(9, 9, PW - 18, PH - 18); c.clip();
    // Klimt: a few dark-gold spirals in the margins only (never behind the name)
    for (const [x, y, r] of [[250, 34, 12], [262, 160, 10], [330, 26, 8], [800, 30, 9], [790, 168, 11], [860, 160, 8]]) spiral(c, x, y, r, 1.8, 'rgba(110,62,12,.4)', 1.4);
    // the terminal: a strip of black and white rectangles, as in The Kiss
    for (let y = 16; y < PH - 22; y += 22) for (let k = 0; k < 2; k++) { c.fillStyle = (Math.round(y / 22) + k) % 2 ? '#14100c' : '#f1ead8'; c.fillRect(PW - 62 + k * 22, y, 16, 16); c.strokeStyle = 'rgba(80,50,10,.6)'; c.lineWidth = 1; c.strokeRect(PW - 62 + k * 22 + .5, y + .5, 16, 16); }
    c.restore();
    c.strokeStyle = '#f0cf78'; c.lineWidth = 1.5; c.strokeRect(14.5, 14.5, PW - 29, PH - 29); c.strokeStyle = '#2a1606'; c.lineWidth = 1; c.strokeRect(9.5, 9.5, PW - 19, PH - 19);
    // the medallion: enamel disc, double gold rim, the emblem
    const mx = 120, my = PH / 2; c.save(); c.translate(mx, my);
    c.fillStyle = '#2a1608'; c.beginPath(); c.arc(0, 0, 86, 0, 7); c.fill();
    const eg = c.createRadialGradient(-20, -20, 4, 0, 0, 78); eg.addColorStop(0, b.enamel); eg.addColorStop(1, '#0a0806'); c.fillStyle = eg; c.beginPath(); c.arc(0, 0, 78, 0, 7); c.fill();
    gstroke(c, p => p.arc(0, 0, 80, 0, 7), 3); gstroke(c, p => p.arc(0, 0, 72, 0, 7), 1.2);
    EMB[i](c); c.restore();
    // the name, engraved into the gold; its Odia beneath
    const tx = 545; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `400 ${b.en.length > 13 ? 44 : 50}px "Marcellus"`; c.letterSpacing = '5px';
    c.fillStyle = 'rgba(255,240,190,.7)'; c.fillText(b.en, tx + 1.5, PH / 2 - 20 + 2); c.fillStyle = '#2a1606'; c.fillText(b.en, tx, PH / 2 - 20);
    c.letterSpacing = '0px'; c.font = '600 32px "OdiaSerif"'; c.fillStyle = 'rgba(255,240,190,.6)'; c.fillText(b.od, tx + 1, PH / 2 + 34 + 1.5); c.fillStyle = '#3a2008'; c.fillText(b.od, tx, PH / 2 + 34);
    return cv;
  });
}
export const PY = i => 330 + i * 216;
export const MED = i => [(W - PW) / 2 + 120, PY(i) + PH / 2];     // medallion centre on screen
const rv = (t, t0, d = .45) => clamp((t - t0) / d);
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
export function goldDisc(c, x, y, r, a = 1) {   // a gold-leaf disc with its glow (the moon-mark, the medallion-to-be)
  if (a <= 0) return; c.save(); c.globalAlpha = a; const g = c.createRadialGradient(x - r * .3, y - r * .3, 1, x, y, r); g.addColorStop(0, '#fff3c0'); g.addColorStop(.5, '#e9b949'); g.addColorStop(1, '#9a6a14'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.strokeStyle = 'rgba(70,40,10,.6)'; c.lineWidth = Math.max(1, r * .05); c.stroke();
  c.globalCompositeOperation = 'lighter'; const h = c.createRadialGradient(x, y, r * .5, x, y, r * 2.4); h.addColorStop(0, 'rgba(255,214,120,.35)'); h.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = h; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); c.restore();
}
// a plaque: m = medallion revealed (from a gold disc), open = unrolled to the right from its medallion
function plaque(c, i, x, y, open, lit = 0, grey = 0, m = 1) {
  const [mx, my] = [x + 120, y + PH / 2];
  if (m <= 0 && open <= 0) { goldDisc(c, mx, my, 86, 1); return; }
  c.save(); c.beginPath(); c.arc(mx, my, 88, 0, 7); if (open > 0) c.rect(x - 20, y - 20, 140 + (PW - 100) * eo(open), PH + 40); c.clip();
  c.globalAlpha = open > 0 ? 1 : clamp(m * 1.2);
  if (grey > 0) c.filter = `grayscale(${grey}) brightness(${1 - grey * .45})`;
  c.drawImage(PLAQ[i], x - 20, y - 20); c.filter = 'none';
  if (lit > 0) { c.globalCompositeOperation = 'lighter'; const p = (lit * 1.4) % 1.4 - .2, g = c.createLinearGradient(x + PW * p - 160, 0, x + PW * p + 160, 0); g.addColorStop(0, 'rgba(255,230,160,0)'); g.addColorStop(.5, 'rgba(255,230,160,.35)'); g.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = g; c.fillRect(x, y, PW, PH); }
  c.restore();
  if (m < 1) goldDisc(c, mx, my, lerp(86, 80, m), 1 - m);
}
function glint(c, x, y, r, a) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.fillStyle = '#fff6d8'; c.beginPath(); for (let k = 0; k < 8; k++) { const ang = k / 8 * Math.PI * 2, rr = k % 2 ? r * .18 : r; c.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr); } c.fill(); const g = c.createRadialGradient(x, y, 0, x, y, r * 1.4); g.addColorStop(0, 'rgba(255,230,160,.6)'); g.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = g; c.fillRect(x - r * 1.5, y - r * 1.5, r * 3, r * 3); c.restore(); }
export function goldBG(c, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.drawImage(BG, 0, 0); c.restore(); }
function title(c, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = '400 32px "Marcellus"'; c.letterSpacing = '7px'; c.textAlign = 'center'; c.fillStyle = 'rgba(240,210,140,.88)'; c.fillText('THE FIVE BESHAS OF MAHAPRABHU', 510, 290); c.restore(); }

// ---------- S5: the five beshas ----------
// close (0..1) rolls the plaques back into their medallions and the medallions back into gold discs (the exit)
export function goldS5(c, t, o = {}) {
  const close = o.close || 0, cl1 = clamp(close / .55), cl2 = clamp((close - .45) / .55);
  if (!o.noBG) goldBG(c);
  title(c, rv(t, 21.25, .7) * (1 - cl1));
  BESHA.forEach((b, i) => { const m = rv(t, 21.75 + i * .12, .6) * (1 - cl2), open = rv(t, b.t - .06, .55) * (1 - cl1);
    if (o.skipDisc && m <= 0 && open <= 0) return;
    plaque(c, (W - PW) / 2 >= 0 ? i : i, (W - PW) / 2, PY(i), open, i === 4 ? clamp((t - b.t) / 1.2) * (1 - cl1) : 0, 0, m); });
  const bk = BESHA[1]; glint(c, (W - PW) / 2 + 150, PY(1) + 50, 26, Math.sin(Math.PI * clamp((t - bk.t - .3) / .8)) * (1 - cl1));
}
// ---------- S7: no Bankachuda this year ----------
const FLAKES = (() => { const R = mul(9), o = []; for (let i = 0; i < 170; i++) o.push({ sx: (W - PW) / 2 + 20 + R() * (PW - 40), sy: PY(1) + 20 + R() * (PH - 40), d0: R() * .45, v: 700 + R() * 600, s: 4 + R() * 9, w: R() * 6.28 }); return o; })();
export function flakes(c, t, capOn = 0) {   // Bankachuda's gold leaf coming away and falling into the dark (continues into the next scene)
  const k = (t - 41.35) / 1.1; if (k <= 0) return;
  for (const f of FLAKES) { const d = (k - f.d0) * 1.5; if (d <= 0) continue; const x = f.sx + Math.sin(f.w + d * 4) * 34 * Math.min(1, d), y = f.sy + d * d * f.v * .55;
    let a = clamp(1.4 - d * .6); if (capOn > 0) a *= 1 - capOn * clamp((y - 1290) / 90); if (y > 1920 || a <= 0) continue;
    const ember = clamp((d - 1.2) / 1.2);   // late in the fall they cool from gold to ember
    c.save(); c.translate(x, y); c.rotate(d * 6 + f.w); c.scale(1, Math.cos(d * 8 + f.w)); c.globalAlpha = a; const g = c.createLinearGradient(-f.s, -f.s, f.s, f.s);
    g.addColorStop(0, ember > 0 ? `rgb(255,${Math.round(240 - 80 * ember)},${Math.round(176 - 120 * ember)})` : '#fff0b0'); g.addColorStop(1, ember > 0 ? '#8a3a10' : '#9a6a1a'); c.fillStyle = g; c.fillRect(-f.s / 2, -f.s / 2, f.s, f.s * .8); c.restore(); }
}
export function goldS7(c, t, o = {}) {
  const k = rv(t, 41.3, 1.0), zoom = o.zoom || 1, [mx, my] = MED(1);
  c.save(); if (zoom !== 1) { c.translate(mx, my); c.scale(zoom, zoom); c.translate(-mx, -my); }
  goldBG(c); title(c, .55 * (o.titleA ?? 1));
  BESHA.forEach((b, i) => { if (i !== 1) plaque(c, i, (W - PW) / 2, PY(i), 1, 0, 0, 1); });
  c.save(); c.translate(W / 2, PY(1) + PH / 2 + k * k * 40); c.rotate(k * .05); c.translate(-W / 2, -(PY(1) + PH / 2));
  plaque(c, 1, (W - PW) / 2, PY(1), 1, 0, clamp(k * 1.3), 1); c.restore();
  glint(c, (W - PW) / 2 + 150, PY(1) + 50, 30, Math.sin(Math.PI * clamp((t - 39.95) / .9)));
  c.restore();
}
