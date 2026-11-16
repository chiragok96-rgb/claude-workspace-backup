// The palm-leaf panji (ତାଳପତ୍ର): Odisha's manuscript craft, built on the engraving line language.
// Long golden leaves with fibre veins, threaded on a red cord over a teak board; every mark is incised with a stylus
// and blackened with soot (a dark groove with a light lip); gold leaf and hand-coloured washes are laid in afterwards.
export const W = 1080, H = 1920;
const mul = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const SOOT = '#2a1b10', LIP = 'rgba(255,240,205,.55)';
let BOARD, LEAF = {};

export function initLeaf() {
  // the red silk wrapper (bastani) palm-leaf bundles are kept in: deep red, soft folds, a fine weave
  BOARD = mk(); const c = BOARD.getContext('2d'), R = mul(5);
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#4c0f0b'); g.addColorStop(.5, '#6a1912'); g.addColorStop(1, '#3e0c08'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.save(); c.filter = 'blur(40px)';
  for (let k = 0; k < 9; k++) { const x = -300 + k * 190 + R() * 60; c.fillStyle = k % 2 ? 'rgba(255,120,90,.07)' : 'rgba(0,0,0,.22)'; c.beginPath(); c.moveTo(x, -50); c.lineTo(x + 120, -50); c.lineTo(x + 520, H + 50); c.lineTo(x + 380, H + 50); c.fill(); }
  c.restore();
  c.globalAlpha = .05; c.strokeStyle = '#000'; c.lineWidth = 1; for (let y = 0; y < H; y += 3) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } c.globalAlpha = .03; c.strokeStyle = '#ffb0a0'; for (let x = 0; x < W; x += 3) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
  c.globalAlpha = 1; const v = c.createRadialGradient(540, 880, 250, 540, 880, 1300); v.addColorStop(0, 'rgba(255,190,120,.06)'); v.addColorStop(1, 'rgba(0,0,0,.65)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}
// one palm leaf (cached): flat golden body with uneven rims, fibres, mottling, burnt ends, cord holes near both ends
function leafPath(p, w, h, seed) { const R = mul(seed), r = h * .34, N = 24, top = [], bot = [];
  for (let i = 0; i <= N; i++) { const x = r + (w - 2 * r) * i / N; top.push([x, (R() - .5) * 2.4]); bot.push([x, h + (R() - .5) * 2.4]); }
  p.beginPath(); p.moveTo(top[0][0], top[0][1]); top.forEach(q => p.lineTo(q[0], q[1])); p.bezierCurveTo(w - r * .25, -1, w + 2, h * .25, w, h * .5); p.bezierCurveTo(w + 2, h * .75, w - r * .25, h + 1, w - r, h);
  for (let i = N; i >= 0; i--) p.lineTo(bot[i][0], bot[i][1]); p.bezierCurveTo(r * .25, h + 1, -2, h * .75, 0, h * .5); p.bezierCurveTo(-2, h * .25, r * .25, -1, r, 0); p.closePath(); }
function leafCanvas(w, h, seed) {
  const key = `${w}x${h}:${seed}`; if (LEAF[key]) return LEAF[key];
  const cv = mk(w + 40, h + 40), c = cv.getContext('2d'), R = mul(seed * 7 + 1); c.translate(20, 20);
  c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 9; c.shadowOffsetY = 4; leafPath(c, w, h, seed); c.fillStyle = '#d8bd86'; c.fill(); c.restore();
  c.save(); leafPath(c, w, h, seed); c.clip();
  c.fillStyle = '#dcc28c'; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 40; k++) { const x = R() * w, y = R() * h, r = 20 + R() * 90, g = c.createRadialGradient(x, y, 0, x, y, r); const lt = R() < .5; g.addColorStop(0, lt ? 'rgba(255,244,210,.18)' : 'rgba(150,100,40,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  for (let k = 0; k < 55; k++) { const y = R() * h; c.strokeStyle = R() < .6 ? `rgba(130,86,34,${.06 + R() * .1})` : `rgba(255,240,205,${.08 + R() * .12})`; c.lineWidth = .5 + R(); c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 80) c.lineTo(x, y + Math.sin(x * .003 + k) * 1.2); c.stroke(); }
  for (let k = 0; k < 90; k++) { c.fillStyle = `rgba(110,62,20,${.05 + R() * .1})`; c.beginPath(); c.ellipse(R() * w, R() * h, .8 + R() * 3, .5 + R() * 1.4, 0, 0, 7); c.fill(); }
  for (const ex of [0, w]) { const g = c.createRadialGradient(ex, h / 2, 0, ex, h / 2, h * 1.1); g.addColorStop(0, 'rgba(96,56,18,.45)'); g.addColorStop(1, 'rgba(96,56,18,0)'); c.fillStyle = g; c.fillRect(ex - h * 1.2, -10, h * 2.4, h + 20); }
  c.lineWidth = 9; c.strokeStyle = 'rgba(120,76,28,.28)'; leafPath(c, w, h, seed); c.stroke();
  c.restore();
  c.lineWidth = 1.4; c.strokeStyle = 'rgba(70,40,14,.7)'; leafPath(c, w, h, seed); c.stroke();
  for (const hx of [70, w - 70]) { c.fillStyle = '#26140a'; c.beginPath(); c.arc(hx, h / 2, 6, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,235,190,.35)'; c.lineWidth = 1; c.beginPath(); c.arc(hx, h / 2 + 1, 7.5, .2, 2.9); c.stroke(); }
  return LEAF[key] = cv;
}
export function drawLeaf(c, x, y, w, h, seed = 1, rot = 0) { c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); c.drawImage(leafCanvas(w, h, seed), -w / 2 - 20, -h / 2 - 20); c.restore(); }
function cord(c, x, y0, y1, a = 1) { c.save(); c.globalAlpha = a; c.strokeStyle = '#cdb07a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y0); c.bezierCurveTo(x + 6, lerp(y0, y1, .3), x - 6, lerp(y0, y1, .7), x, y1); c.stroke();
  c.strokeStyle = 'rgba(80,50,20,.35)'; c.lineWidth = 1; c.setLineDash([3, 4]); c.stroke(); c.restore(); }

// incised marks: a soot groove with a pale lip below-right (the cut catches the light)
function incise(c, path, w = 2.4, a = 1) { c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.globalAlpha = a;
  c.strokeStyle = LIP; c.lineWidth = w * .9; c.translate(.9, 1.1); c.beginPath(); path(c); c.stroke(); c.translate(-.9, -1.1);
  c.strokeStyle = SOOT; c.lineWidth = w; c.beginPath(); path(c); c.stroke(); c.restore(); }
function inciseText(c, txt, x, y, font, a = 1, align = 'center') { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = font; c.textAlign = align; c.textBaseline = 'middle';
  c.fillStyle = LIP; c.fillText(txt, x + 1, y + 1.4); c.fillStyle = SOOT; c.fillText(txt, x, y); c.restore(); }
function hatchIn(c, clip, x0, y0, x1, y1, step = 4.5, ang = -.7, w = 1.1, a = 1) {
  c.save(); c.beginPath(); clip(c); c.clip(); c.globalAlpha = a; c.strokeStyle = SOOT; c.lineWidth = w; c.beginPath();
  const L = Math.hypot(x1 - x0, y1 - y0) + 40, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, ca = Math.cos(ang), sa = Math.sin(ang);
  for (let d = -L; d <= L; d += step) { c.moveTo(cx + ca * -L - sa * d, cy + sa * -L + ca * d); c.lineTo(cx + ca * L - sa * d, cy + sa * L + ca * d); } c.stroke(); c.restore();
}
// a moon mark: incised ring; the dark part hatched; lit = fraction illuminated; waxing lights the right side
function moonMark(c, x, y, r, lit, waxing, gold = 0) {
  if (gold > 0) { c.save(); const g = c.createRadialGradient(x - r * .3, y - r * .3, 1, x, y, r); g.addColorStop(0, '#fff3c0'); g.addColorStop(.5, '#e9b949'); g.addColorStop(1, '#9a6a14'); c.globalAlpha = gold; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.globalCompositeOperation = 'lighter'; const h = c.createRadialGradient(x, y, r * .5, x, y, r * 2.4); h.addColorStop(0, `rgba(255,214,120,${.35 * gold})`); h.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = h; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); c.restore(); }
  const k = 1 - lit;   // the dark fraction
  if (k > .01) {
    const dark = p => { const tw = r * Math.abs(1 - 2 * k), dir = waxing ? 1 : -1;
      p.arc(x, y, r, Math.PI / 2, 3 * Math.PI / 2, waxing ? false : true);
      if (k <= .5) p.ellipse(x, y, Math.max(.1, tw), r, 0, 3 * Math.PI / 2, Math.PI / 2, waxing ? true : false);
      else p.ellipse(x, y, Math.max(.1, tw), r, 0, 3 * Math.PI / 2, Math.PI / 2, waxing ? false : true); p.closePath(); };
    hatchIn(c, dark, x - r, y - r, x + r, y + r, 3.6, -.75, 1.05, .9);
    if (k > .55) hatchIn(c, dark, x - r, y - r, x + r, y + r, 4.2, .6, .8, .55);
  }
  incise(c, p => p.arc(x, y, r, 0, Math.PI * 2), 2.2);
}

// ---------- animation helpers ----------
const rv = (t, t0, d = .45) => clamp((t - t0) / d);
export function drawBoard(c, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.drawImage(BOARD, 0, 0); c.restore(); }
function wipeText(c, txt, x, y, font, p, a = 1) {   // a stylus cutting the word in, left to right
  if (p <= 0 || a <= 0) return; c.save(); c.font = font; const w = c.measureText(txt).width + 12; c.beginPath(); c.rect(x - w / 2 - 6, y - 60, w * p, 120); c.clip(); inciseText(c, txt, x, y, font, a); c.restore();
  if (p < 1) { c.save(); c.fillStyle = 'rgba(255,230,170,.8)'; c.beginPath(); c.arc(x - w / 2 - 6 + w * p, y + 8, 2.4, 0, 7); c.fill(); c.restore(); }
}
const XS = i => 40 + 140 + i * (1000 - 280) / 14;

// ---------- S3: Kartika on the leaves; the last five days turn to gold ----------
export function leafS3(c, t, o = {}) {
  const X0 = 40, LW = 1000, dy = o.dy || 0, la = o.la ?? 1; c.save(); c.translate(0, dy); c.globalAlpha = la;
  cord(c, X0 + 70, 300, 1330); cord(c, X0 + LW - 70, 300, 1330);
  drawLeaf(c, X0, 360, LW, 150, 3); drawLeaf(c, X0, 560, LW, 170, 7); drawLeaf(c, X0, 780, LW, 250, 11); drawLeaf(c, X0, 1080, LW, 200, 13);
  incise(c, p => { p.moveTo(X0 + 110, 384); p.lineTo(X0 + LW - 110, 384); p.moveTo(X0 + 110, 486); p.lineTo(X0 + LW - 110, 486); }, 1.6, .8 * rv(t, 9.2));
  wipeText(c, 'କାର୍ତ୍ତିକ', 540, 437, '700 70px "OdiaSerif"', rv(t, 9.35, .7));
  for (const d of [-1, 1]) { const x = 540 + d * 230; incise(c, p => { p.arc(x, 437, 22, 0, 7); p.moveTo(x + 10, 437); p.arc(x, 437, 10, 0, 7); }, 1.8, rv(t, 9.9)); }
  inciseText(c, 'କୃଷ୍ଣ ପକ୍ଷ', 540, 590, '600 26px "OdiaSerif"', .85 * rv(t, 9.6));
  for (let i = 0; i < 15; i++) { const a = rv(t, 9.7 + i * .045, .3); if (a > 0) { c.save(); c.globalAlpha = la * a; moonMark(c, XS(i), 655, 22, 1 - (i + 1) / 15, false); c.restore(); } }
  inciseText(c, 'ଶୁକ୍ଳ ପକ୍ଷ', 540, 810, '600 26px "OdiaSerif"', .85 * rv(t, 10.0));
  for (let i = 0; i < 15; i++) { const a = rv(t, 10.1 + i * .045, .3); if (a <= 0) continue; const g = i >= 10 ? rv(t, 11.12 + (i - 10) * .14, .4) : 0;
    c.save(); c.globalAlpha = la * a; moonMark(c, XS(i), 875, 22, (i + 1) / 15, true, g); c.restore(); }
  const ab = rv(t, 12.62, .4);
  incise(c, p => { p.moveTo(XS(10) - 30, 925); p.lineTo(XS(10) - 30, 940); p.lineTo(XS(14) + 30, 940); p.lineTo(XS(14) + 30, 925); }, 2, ab);
  wipeText(c, 'ବଡ଼ ଏକାଦଶୀ', XS(10) - 10, 972, '600 24px "OdiaSerif"', rv(t, 12.68, .55)); wipeText(c, 'ପୂର୍ଣ୍ଣିମା', XS(14) + 4, 972, '600 24px "OdiaSerif"', rv(t, 13.6, .45));
  wipeText(c, 'ପଞ୍ଚୁକ', (XS(10) + XS(14)) / 2, 990 + 16, '700 34px "OdiaSerif"', rv(t, 13.95, .45));
  inciseText(c, '୧୧', XS(10), 838, '600 18px "OdiaSerif"', .7 * rv(t, 11.12)); inciseText(c, '୧୫', XS(14), 838, '600 18px "OdiaSerif"', .7 * rv(t, 11.68));
  creeper(c, X0 + 120, X0 + LW - 120, 1180, .85 * rv(t, 10.4, .8));
  c.restore();
}

// ---------- S4: a chitra-pothi picture across three leaves: the fish leaps off the brass plate (ଆମିଷ); habisa on a banana leaf (ହବିଷ) ----------
let PIC = null;
function picture(k, t = 99) {   // the drawing on its own canvas (incised lines + muted washes), clipped to the leaves when placed
  const cv = PIC || (PIC = mk()), c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  const aP = rv(t, 15.0, .5), aF = rv(t, 15.3, .5), aB = rv(t, 15.8, .6), aW = rv(t, 18.3, .7);
  const wash = (col, a, path) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); path(c); c.fill(); c.restore(); };
  const px = 300, py = 972, bx = 740, by = 978;
  const leafP = p => { p.moveTo(bx - 250, by + 44); p.quadraticCurveTo(bx - 60, by - 110, bx + 240, by - 64); p.quadraticCurveTo(bx + 150, by + 84, bx - 250, by + 44); };
  const pot = p => { p.moveTo(bx + 76, by + 6); p.quadraticCurveTo(bx + 64, by - 60, bx + 114, by - 66); p.quadraticCurveTo(bx + 164, by - 60, bx + 154, by + 6); p.quadraticCurveTo(bx + 114, by + 24, bx + 76, by + 6); };
  const VEG = [[bx - 168, by + 22, 20, 11, .3], [bx - 136, by + 36, 20, 11, .3], [bx + 40, by + 30, 24, 9, -.3]];
  wash('#c8963a', .38 * aP, p => p.ellipse(px, py, 176, 64, 0, 0, 7));
  wash('#5d8a46', .5 * aW, leafP); wash('#f7efdc', .85 * aW, p => p.ellipse(bx - 40, by - 6, 80, 32, -.1, 0, 7)); wash('#a8502a', .55 * aW, pot); wash('#e2a830', .75 * aW, p => p.ellipse(bx + 114, by - 64, 28, 7, 0, 0, 7));
  wash('#d07a2c', .55 * aW, p => { p.ellipse(...VEG[0], 0, 7); p.ellipse(...VEG[1], 0, 7); }); wash('#7a9a46', .6 * aW, p => p.ellipse(...VEG[2], 0, 7));
  // the fish: lying on the plate, then leaping away up the leaves
  const fx = lerp(px + 10, 500, k), fy = lerp(py - 4, 788, k) - Math.sin(Math.PI * k) * 40, fr = lerp(0, -.42, k);
  const fishP = p => { p.moveTo(-86, 0); p.quadraticCurveTo(-24, -40, 46, -10); p.lineTo(88, -36); p.quadraticCurveTo(76, 0, 88, 36); p.lineTo(46, 10); p.quadraticCurveTo(-24, 40, -86, 0); };
  c.save(); c.translate(fx, fy); c.rotate(fr); wash('#b8452a', .55 * aF, fishP); c.restore();
  // plate
  incise(c, p => p.ellipse(px, py, 176, 64, 0, 0, 7), 2.8, aP); incise(c, p => p.ellipse(px, py, 150, 52, 0, 0, 7), 1.6, .9 * aP);
  for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; incise(c, p => { p.moveTo(px + Math.cos(a) * 155, py + Math.sin(a) * 55); p.quadraticCurveTo(px + Math.cos(a + .05) * 168, py + Math.sin(a + .05) * 61, px + Math.cos(a + .09) * 155, py + Math.sin(a + .09) * 55); }, 1.1, .8 * aP); }
  hatchIn(c, p => { p.ellipse(px, py, 176, 64, 0, 0, Math.PI); p.ellipse(px, py, 150, 52, 0, Math.PI, 0, true); }, px - 176, py, px + 176, py + 64, 4, .9, .9, .7 * aP);
  if (k > 0) for (let i = 0; i < 3; i++) incise(c, p => p.ellipse(px + 30 - i * 24, py - 4 + i * 7, 34 + i * 16, 8 + i * 4, 0, 3.4, 6.0), 1.1, (.55 - i * .12) * Math.min(1, k * 3));
  // fish lines
  c.save(); c.translate(fx, fy); c.rotate(fr);
  incise(c, fishP, 2.6, aF);
  for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) incise(c, p => p.arc(-42 + i * 12, -6 + j * 13, 7, -1.2, 1.2), 1, .75 * aF);
  incise(c, p => { p.moveTo(-6, -24); p.quadraticCurveTo(10, -46, 30, -20); }, 1.6, aF); incise(c, p => { p.moveTo(-6, 24); p.quadraticCurveTo(8, 40, 24, 18); }, 1.4, .8 * aF);
  incise(c, p => p.arc(-62, -6, 5, 0, 7), 1.8, aF); incise(c, p => { p.moveTo(-50, -14); p.quadraticCurveTo(-46, 0, -50, 14); }, 1.3, .8 * aF);
  c.restore();
  for (let i = 0; i < 5; i++) { const u = k - .1 - i * .07; if (u <= 0) continue; const tx = lerp(px + 10, 500, u), ty = lerp(py - 4, 788, u) - Math.sin(Math.PI * u) * 40; incise(c, p => p.arc(tx - 24, ty + 34, 4 + i, 0, 7), 1.1, .6 - i * .1); }
  // banana leaf, rice, the clay pot of dal, vegetables
  incise(c, leafP, 2.4, aB);
  incise(c, p => { p.moveTo(bx - 232, by + 38); p.quadraticCurveTo(bx - 10, by - 26, bx + 222, by - 60); }, 1.8, aB);
  for (let i = 1; i < 12; i++) { const u = i / 12; incise(c, p => { const x = lerp(bx - 220, bx + 200, u), y = lerp(by + 34, by - 56, u) + Math.sin(u * 3) * -10; p.moveTo(x, y); p.lineTo(x - 22, y - 34 + u * 16); p.moveTo(x, y); p.lineTo(x + 14, y + 30 - u * 20); }, .9, .5 * aB); }
  incise(c, p => p.ellipse(bx - 40, by - 6, 80, 32, -.1, 0, 7), 2.2, aB);
  const R = mul(77); for (let i = 0; i < 54; i++) { const a = R() * 6.28, r = Math.sqrt(R()); incise(c, p => { const x = bx - 40 + Math.cos(a) * r * 70, y = by - 6 + Math.sin(a) * r * 26; p.moveTo(x, y); p.lineTo(x + 4, y - 1.5); }, 1.1, .6 * aB); }
  hatchIn(c, p => p.ellipse(bx - 40, by - 6, 80, 32, -.1, .2, 2.9), bx - 120, by - 6, bx + 40, by + 26, 4, -.4, .8, .5 * aB);
  incise(c, pot, 2.2, aB); incise(c, p => p.ellipse(bx + 114, by - 64, 28, 7, 0, 0, 7), 1.8, aB);
  hatchIn(c, p => { p.moveTo(bx + 130, by - 60); p.quadraticCurveTo(bx + 164, by - 50, bx + 154, by + 6); p.quadraticCurveTo(bx + 140, by + 14, bx + 130, by + 12); }, bx + 120, by - 66, bx + 164, by + 14, 3.6, .8, .9, .7 * aB);
  for (const v of VEG) incise(c, p => p.ellipse(...v, 0, 7), 1.6, aB);
  wipeText(c, 'ଆମିଷ', px, 1146, '700 36px "OdiaSerif"', rv(t, 16.2, .5), .9); wipeText(c, 'ହବିଷ', bx, 1146, '700 36px "OdiaSerif"', rv(t, 18.45, .5));
  const sk = rv(t, 18.72, .3); if (sk > 0) incise(c, p => { p.moveTo(px - 50, 1146); p.lineTo(px - 50 + 100 * sk, 1146); }, 2.4);   // ଆମିଷ struck through, on the word
  creeper(c, 410, 640, 1150, .8 * rv(t, 16.4, .6), 10);
  return cv;
}
export function leafS4(c, t, o = {}) {
  const X0 = 40, LW = 1000, dy = o.dy || 0, LV = [[700, 170, 31], [884, 170, 37], [1068, 170, 41]];
  const k = clamp((t - 17.6) / 1.1), kk = k * k * (3 - 2 * k);
  c.save(); c.translate(0, dy);
  cord(c, X0 + 70, 380, 1300); cord(c, X0 + LW - 70, 380, 1300);
  drawLeaf(c, X0, 470, LW, 150, 11);
  if (!o.noMarks) for (let i = 0; i < 5; i++) moonMark(c, 540 + (i - 2) * 64, 545, 22, (11 + i) / 15, true, 1);
  inciseText(c, 'ପଞ୍ଚୁକ', 540, 590, '700 22px "OdiaSerif"', .8 * (o.noMarks ? 0 : 1));
  LV.forEach(([y, h, sd]) => drawLeaf(c, X0, y, LW, h, sd));
  const pic = picture(kk, t); c.save(); c.beginPath(); LV.forEach(([y, h]) => c.roundRect(X0 + 8, y + 4, LW - 16, h - 8, h * .3)); c.clip(); c.drawImage(pic, 0, 0); c.restore();
  c.restore();
}
export const S4MARKS = i => [540 + (i - 2) * 64, 545];      // where the five gold marks sit in S4 (for the flight to the medallions)

// ---------- S6a: the panji leaf; Dvadashi's mark fades and crumbles ----------
export const S6MARKS = i => [XS(10 + i), 875];
export function leafS6a(c, t, o = {}) {
  const X0 = 40, LW = 1000, dy = o.dy || 0; c.save(); c.translate(0, dy);
  cord(c, X0 + 70, 300, 1330); cord(c, X0 + LW - 70, 300, 1330);
  drawLeaf(c, X0, 560, LW, 150, 3); inciseText(c, 'କାର୍ତ୍ତିକ · ପାଞ୍ଜି', 540, 636, '700 52px "OdiaSerif"');
  drawLeaf(c, X0, 780, LW, 250, 11);
  inciseText(c, 'ଶୁକ୍ଳ ପକ୍ଷ', 540, 810, '600 26px "OdiaSerif"', .85);
  const red = rv(t, 31.95, .4), gone = rv(t, 32.95, .7), marks = o.marks ?? 1;
  for (let i = 0; i < 15; i++) { if (i >= 10 && marks < 1) continue; if (i === 11) continue; moonMark(c, XS(i), 875, 22, (i + 1) / 15, true, i >= 10 ? 1 : 0); }
  if (marks >= 1) {   // Dvadashi: blushes vermilion when named, then its gold flakes off and the cut fills in
    const x = XS(11), y = 875; c.save(); c.globalAlpha = 1 - gone; moonMark(c, x, y, 22, 12 / 15, true, 1);
    c.globalCompositeOperation = 'source-atop'; c.fillStyle = `rgba(184,50,30,${.55 * red})`; c.beginPath(); c.arc(x, y, 24, 0, 7); c.fill(); c.restore();
    if (gone > 0) { const R = mul(12); for (let k = 0; k < 18; k++) { const a = R() * 6.28, d = gone * (20 + R() * 60), fy = gone * gone * (60 + R() * 80);
      c.save(); c.globalAlpha = (1 - gone) * .9; c.fillStyle = R() < .5 ? '#e9b949' : '#b8321e'; c.translate(x + Math.cos(a) * d, y + Math.sin(a) * d * .5 + fy); c.rotate(gone * 5 + k); c.fillRect(-3, -2, 6, 4); c.restore(); } }
    incise(c, p => p.arc(x, y, 22, 0, Math.PI * 2), 1.4, .35 * gone);
  }
  incise(c, p => { p.moveTo(XS(10) - 30, 925); p.lineTo(XS(10) - 30, 940); p.lineTo(XS(14) + 30, 940); p.lineTo(XS(14) + 30, 925); }, 2);
  wipeText(c, 'ଦ୍ୱାଦଶୀ', XS(11), 972, '700 26px "OdiaSerif"', rv(t, 32.0, .5), 1);
  incise(c, p => { p.moveTo(XS(11) - 48, 972); p.lineTo(XS(11) + 48 * (2 * clamp((t - 33.15) / .4) - 1), 972); }, 2.4, rv(t, 33.15, .1));
  drawLeaf(c, X0, 1080, LW, 200, 13); creeper(c, X0 + 120, X0 + LW - 120, 1180, .85);
  c.restore();
}

// ---------- S6b: a tithi that touches no sunrise is not counted ----------
export function leafS6b(c, t, o = {}) {
  const X0 = 40, LW = 1000, SR = [230, 560, 890], dy = o.dy || 0; c.save(); c.translate(0, dy);
  cord(c, X0 + 70, 320, 1330); cord(c, X0 + LW - 70, 320, 1330);
  drawLeaf(c, X0, 380, LW, 220, 19);
  incise(c, p => { p.moveTo(X0 + 110, 540); p.lineTo(X0 + LW - 110, 540); }, 2, rv(t, 34.15, .4));
  SR.forEach((x, i) => { const a = rv(t, 34.35 + i * .2, .35); if (a <= 0) return;
    incise(c, p => { p.arc(x, 540, 34, Math.PI, 0); }, 2.4, a); for (let k = 0; k < 7; k++) { const an = Math.PI + (k + .5) / 7 * Math.PI; incise(c, p => { p.moveTo(x + Math.cos(an) * 44, 540 + Math.sin(an) * 44); p.lineTo(x + Math.cos(an) * 62, 540 + Math.sin(an) * 62); }, 1.8, a); }
    hatchIn(c, p => p.arc(x, 540, 34, Math.PI, 0), x - 34, 506, x + 34, 540, 4, -.7, 1, .5 * a);
    inciseText(c, ['ସୂର୍ଯ୍ୟୋଦୟ ୧', 'ସୂର୍ଯ୍ୟୋଦୟ ୨', 'ସୂର୍ଯ୍ୟୋଦୟ ୩'][i], x, 572, '600 22px "OdiaSerif"', .9 * a); });
  drawLeaf(c, X0, 640, LW, 230, 23);
  const band = (x0, x1, y, lbl, a, hot = 0) => { if (a <= 0) return; c.save(); c.beginPath(); c.rect(x0 - 4, y - 70, (x1 - x0 + 8) * a, 110); c.clip();
    incise(c, p => { p.moveTo(x0, y - 22); p.lineTo(x0, y + 22); p.moveTo(x1, y - 22); p.lineTo(x1, y + 22); p.moveTo(x0, y); p.lineTo(x1, y); }, 2);
    if (hot) { c.globalAlpha = .55 * hot; c.fillStyle = '#b8321e'; c.fillRect(x0 + 3, y - 14, x1 - x0 - 6, 28); c.globalAlpha = 1; } inciseText(c, lbl, (x0 + x1) / 2, y - 40, '600 24px "OdiaSerif"'); c.restore(); };
  const hot = rv(t, 35.25, .5);
  band(X0 + 110, 330, 760, 'ଏକାଦଶୀ', rv(t, 34.95, .45)); band(345, 520, 800, 'ଦ୍ୱାଦଶୀ', rv(t, 35.15, .45), hot); band(535, 760, 760, 'ତ୍ରୟୋଦଶୀ', rv(t, 35.35, .45)); band(775, X0 + LW - 110, 800, 'ଚତୁର୍ଦ୍ଦଶୀ', rv(t, 35.55, .45));
  SR.forEach((x, i) => { const a = rv(t, 35.7 + i * .12, .5); for (let y = 600; y < 1140; y += 26) if ((y - 600) / 540 < a) incise(c, p => { p.moveTo(x, y); p.lineTo(x, y + 12); }, 1.6, .75); });
  // the band touches neither sunrise: two small gaps glow on "does not touch"
  const gl = Math.sin(Math.PI * clamp((t - 36.15) / .8)); if (gl > 0) { c.save(); c.globalCompositeOperation = 'lighter'; for (const [x0, x1] of [[SR[0], 345], [520, SR[1]]]) { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(255,200,120,0)'); g.addColorStop(.5, `rgba(255,200,120,${.5 * gl})`); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fillRect(x0, 786, x1 - x0, 28); } c.restore(); }
  drawLeaf(c, X0, 1010, LW, 200, 29);
  ['ଏକାଦଶୀ', 'ତ୍ରୟୋଦଶୀ', 'ଚତୁର୍ଦ୍ଦଶୀ'].forEach((l, i) => wipeText(c, l, SR[i], 1110, '700 32px "OdiaSerif"', rv(t, 37.3 + i * .22, .4)));
  incise(c, p => { p.moveTo(SR[0] + 100, 1110); p.lineTo(SR[1] - 110, 1110); }, 1.2, .35 * rv(t, 37.75, .4));
  // the vermilion stamp: tithi kshaya
  const st = rv(t, 37.95, .25); if (st > 0) { c.save(); c.translate(432, 870); c.rotate(-.06); const sc = 1 + .3 * (1 - st); c.scale(sc, sc); c.globalAlpha = .9 * st; c.fillStyle = '#a82c1c'; c.beginPath(); c.roundRect(-92, -26, 184, 52, 6); c.fill();
    c.font = '700 30px "OdiaSerif"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#f3dfb4'; c.fillText('ତିଥି କ୍ଷୟ', 0, 2); c.restore(); }
  c.restore();
}
export const DVADASHI_BAND = [432, 800];

function creeper(c, x0, x1, y, a = 1, amp = 14) {
  incise(c, p => { p.moveTo(x0, y); for (let x = x0; x <= x1; x += 6) p.lineTo(x, y + Math.sin((x - x0) / 38) * amp); }, 1.6, a);
  for (let x = x0 + 19; x < x1 - 10; x += 38) { const k = Math.round((x - x0 - 19) / 38) % 2 ? 1 : -1, yy = y + Math.sin((x - x0) / 38) * amp;
    incise(c, p => { p.moveTo(x, yy); p.quadraticCurveTo(x + 8, yy + k * 18, x + 20, yy + k * 20); p.quadraticCurveTo(x + 8, yy + k * 8, x, yy); }, 1.2, a * .9);
    incise(c, p => p.arc(x - 6, yy - k * 12, 3, 0, 7), 1, a * .8); }
}
export function capLight(ctx, lines, y, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = 'italic 500 50px "CormorantG"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 10; ctx.fillStyle = '#f3e3c2';
  lines.forEach((l, i) => ctx.fillText(l, 510, y + (i - (lines.length - 1)) * 60)); ctx.restore();
}
