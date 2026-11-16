// Harihara Besha · Pattachitra style frame (S1). Flat colour, thick black outline, patterned borders, cloth texture.
const W = 1080, H = 1920;
const P = { red: '#C8321E', ochre: '#D99A2B', indigo: '#1F2A5A', black: '#141010', white: '#F4EDE0', gold: '#E8B23A', cloth: '#EADFC8' };
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
const Q = new URLSearchParams(location.search);
const OL = 9;   // the thick black outline
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), seg = (t, a, b) => clamp((t - a) / (b - a)), eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
function shape(fill, path, lw = OL) { c.beginPath(); path(); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.lineWidth = lw; c.strokeStyle = P.black; c.lineJoin = 'round'; c.stroke(); } }
let TEX;
function makeTexture() {   // cloth: fine weave + mottling, applied by multiply
  const t = document.createElement('canvas'); t.width = W; t.height = H; const x = t.getContext('2d'); const im = x.createImageData(W, H); let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) { const k = (y * W + i) * 4, weave = ((i % 4 < 2) ^ (y % 4 < 2)) ? 6 : 0, v = 238 + weave - r() * 16; im.data[k] = v; im.data[k + 1] = v - 3; im.data[k + 2] = v - 10; im.data[k + 3] = 255; }
  x.putImageData(im, 0, 0); return t;
}
// ---- borders: black rule, vermilion band with lotus petals, ochre band with dots, indigo inner rule
function border() {
  const m = 26, b1 = 18, b2 = 46, b3 = 22;
  c.fillStyle = P.black; c.fillRect(0, 0, W, H);
  c.fillStyle = P.red; c.fillRect(m, m, W - 2 * m, H - 2 * m);
  const inA = m + b1, inB = inA + b2;
  c.fillStyle = P.ochre; c.fillRect(inA, inA, W - 2 * inA, H - 2 * inA); c.fillStyle = P.red; c.fillRect(inA + 4, inA + 4, W - 2 * inA - 8, H - 2 * inA - 8);
  // petal frieze in the vermilion band
  const petals = (x0, y0, len, horiz) => { for (let k = 0; k * 44 < len; k++) { const cx = horiz ? x0 + k * 44 + 22 : x0, cy = horiz ? y0 : y0 + k * 44 + 22; c.save(); c.translate(cx, cy); if (!horiz) c.rotate(Math.PI / 2);
      shape(P.white, () => { c.moveTo(-16, 10); c.quadraticCurveTo(0, -26, 16, 10); c.closePath(); }, 3); shape(P.ochre, () => c.arc(0, 4, 4, 0, 7), 2); c.restore(); } };
  c.save(); c.beginPath(); c.rect(inA + 4, inA + 4, W - 2 * inA - 8, H - 2 * inA - 8); c.clip();
  petals(inA + 4, inA + b2 / 2 + 4, W - 2 * inA - 8, true); petals(inA + 4, H - inA - b2 / 2 - 4, W - 2 * inA - 8, true);
  petals(inA + b2 / 2 + 4, inA + 4, H - 2 * inA - 8, false); petals(W - inA - b2 / 2 - 4, inA + 4, H - 2 * inA - 8, false); c.restore();
  c.fillStyle = P.black; c.fillRect(inB, inB, W - 2 * inB, H - 2 * inB);
  c.fillStyle = P.ochre; c.fillRect(inB + 5, inB + 5, W - 2 * inB - 10, H - 2 * inB - 10);
  for (let k = 0; k < 60; k++) { for (const [x, y] of [[inB + 16 + k * 17, inB + 15], [inB + 16 + k * 17, H - inB - 15]]) if (x < W - inB - 10) { c.fillStyle = P.black; c.beginPath(); c.arc(x, y, 3.2, 0, 7); c.fill(); } }
  for (let k = 0; k < 110; k++) { for (const [x, y] of [[inB + 15, inB + 16 + k * 17], [W - inB - 15, inB + 16 + k * 17]]) if (y < H - inB - 10) { c.fillStyle = P.black; c.beginPath(); c.arc(x, y, 3.2, 0, 7); c.fill(); } }
  const f = inB + b3 + 5; c.fillStyle = P.black; c.fillRect(f - 5, f - 5, W - 2 * f + 10, H - 2 * f + 10);
  return f;
}
function field(f) {   // vermilion ground with a sparse flowering-vine pattern in ochre
  c.fillStyle = P.red; c.fillRect(f, f, W - 2 * f, H - 2 * f);
  c.save(); c.beginPath(); c.rect(f, f, W - 2 * f, H - 2 * f); c.clip();
  for (let y = f + 40; y < H; y += 120) for (let x = f + 40 + ((y / 120) % 2) * 60; x < W; x += 120) {
    c.strokeStyle = 'rgba(217,154,43,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 14, 0, 7); c.stroke();
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .78; c.fillStyle = 'rgba(217,154,43,.55)'; c.beginPath(); c.ellipse(x + Math.cos(a) * 24, y + Math.sin(a) * 24, 8, 3.5, a, 0, 7); c.fill(); }
  }
  c.restore();
}
// ---- Lord Balabhadra, Puri iconography: the seven-hooded serpent canopy, white face, large round eyes, red lips; no arms or legs
const CX = 540, FY = 760;
function deity(t) {
  // serpent canopy (seven hoods) behind the head
  for (let k = 0; k < 7; k++) { const a = Math.PI + (k + .5) / 7 * Math.PI, hx = CX + Math.cos(a) * 330, hy = FY - 120 + Math.sin(a) * 300;
    c.save(); c.translate(hx, hy); c.rotate(a + Math.PI / 2);
    shape(P.indigo, () => { c.moveTo(-58, 70); c.quadraticCurveTo(-70, -40, 0, -78); c.quadraticCurveTo(70, -40, 58, 70); c.closePath(); });
    shape(P.white, () => { c.moveTo(-30, 50); c.quadraticCurveTo(-36, -18, 0, -40); c.quadraticCurveTo(36, -18, 30, 50); c.closePath(); }, 4);
    for (const d of [-1, 1]) shape(P.black, () => c.arc(d * 13, -46, 6, 0, 7), 0);
    shape(P.gold, () => c.arc(0, 8, 9, 0, 7), 3);
    c.restore(); }
  // the costume (body block): split white | black, the black half slides in from the right in S1
  const slide = Q.has('still') ? 1 : eio(seg(t, .3, 1.5));
  const body = () => { c.moveTo(CX - 330, 1060); c.lineTo(CX + 330, 1060); c.lineTo(CX + 360, 1330); c.lineTo(CX - 360, 1330); c.closePath(); };
  shape(P.white, body);
  c.save(); c.beginPath(); body(); c.clip(); c.fillStyle = P.black; c.fillRect(lerpX(W, CX, slide), 1000, 600, 600);
  // costume decoration (flat bands of dots), white on black and black on white
  for (let r = 0; r < 2; r++) for (let k = -8; k <= 8; k++) { const x = CX + k * 42, y = 1210 + r * 70; c.fillStyle = x > lerpX(W, CX, slide) ? P.white : P.black; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); }
  c.restore(); shape(null, body);
  // ornaments: three gold strings with pendants
  for (let r = 0; r < 3; r++) { for (const [lw, col] of [[11 - r * 2, P.black], [5 - r, P.gold]]) { c.lineWidth = lw; c.strokeStyle = col; c.beginPath(); c.ellipse(CX, 1060, 240 - r * 50, 110 - r * 22, 0, .2, Math.PI - .2); c.stroke(); }
    for (let k = 0; k <= 12; k++) { const a = .2 + k / 12 * (Math.PI - .4); shape(P.gold, () => c.arc(CX + Math.cos(a) * (240 - r * 50), 1060 + Math.sin(a) * (110 - r * 22), 11 - r * 2, 0, 7), 3); } }
  // the face
  const face = () => { c.moveTo(CX - 270, FY - 210); c.quadraticCurveTo(CX, FY - 290, CX + 270, FY - 210); c.quadraticCurveTo(CX + 300, FY + 40, CX + 250, FY + 210); c.quadraticCurveTo(CX, FY + 330, CX - 250, FY + 210); c.quadraticCurveTo(CX - 300, FY + 40, CX - 270, FY - 210); c.closePath(); };
  shape(P.white, face, 11);
  // crown band
  shape(P.gold, () => { c.moveTo(CX - 270, FY - 210); c.quadraticCurveTo(CX, FY - 290, CX + 270, FY - 210); c.lineTo(CX + 262, FY - 168); c.quadraticCurveTo(CX, FY - 246, CX - 262, FY - 168); c.closePath(); }, 6);
  for (let k = -5; k <= 5; k++) shape(P.red, () => c.arc(CX + k * 44, FY - 214 - (25 - Math.abs(k) * 4) * .9, 7, 0, 7), 3);
  // tilak
  shape(P.ochre, () => { c.moveTo(CX - 16, FY - 150); c.lineTo(CX + 16, FY - 150); c.lineTo(CX + 9, FY - 60); c.lineTo(CX - 9, FY - 60); c.closePath(); }, 4);
  shape(P.red, () => { c.moveTo(CX - 5, FY - 142); c.lineTo(CX + 5, FY - 142); c.lineTo(CX + 3, FY - 68); c.lineTo(CX - 3, FY - 68); c.closePath(); }, 0);
  // brows
  for (const d of [-1, 1]) { c.lineWidth = 12; c.lineCap = 'round'; c.strokeStyle = P.black; c.beginPath(); c.moveTo(CX + d * 40, FY - 92); c.quadraticCurveTo(CX + d * 130, FY - 140, CX + d * 225, FY - 92); c.stroke(); }
  // large round eyes: white, black ring, vermilion inner ring, black pupil
  for (const d of [-1, 1]) { const ex = CX + d * 128, ey = FY - 10;
    shape(P.white, () => c.arc(ex, ey, 98, 0, 7), 12); c.lineWidth = 6; c.strokeStyle = P.red; c.beginPath(); c.arc(ex, ey, 82, 0, 7); c.stroke();
    shape(P.black, () => c.arc(ex, ey, 50, 0, 7), 0); }
  // nose: the gentle curved line of Puri iconography
  c.lineWidth = 10; c.strokeStyle = P.black; c.lineCap = 'round'; c.beginPath(); c.moveTo(CX + 2, FY + 62); c.quadraticCurveTo(CX + 26, FY + 104, CX + 4, FY + 120); c.stroke(); c.lineWidth = 7; c.beginPath(); c.moveTo(CX + 4, FY + 120); c.lineTo(CX - 12, FY + 116); c.stroke();
  // red lips: a wide calm smile
  shape(P.red, () => { c.moveTo(CX - 120, FY + 160); c.quadraticCurveTo(CX, FY + 150, CX + 120, FY + 160); c.quadraticCurveTo(CX, FY + 245, CX - 120, FY + 160); c.closePath(); }, 9);
  c.lineWidth = 5; c.beginPath(); c.moveTo(CX - 104, FY + 168); c.quadraticCurveTo(CX, FY + 186, CX + 104, FY + 168); c.stroke();
  // ear ornaments
  for (const d of [-1, 1]) { shape(P.gold, () => c.arc(CX + d * 290, FY + 70, 34, 0, 7), 6); shape(P.red, () => c.arc(CX + d * 290, FY + 70, 12, 0, 7), 3); }
}
function lerpX(a, b, u) { return a + (b - a) * u; }
function pedestal() {   // the simhasana: a lotus-petal seat filling the bottom band (no text here)
  const y0 = 1500, y1 = 1720;
  shape(P.ochre, () => { c.moveTo(150, y0); c.lineTo(930, y0); c.lineTo(900, y1); c.lineTo(180, y1); c.closePath(); }, 8);
  shape(P.indigo, () => c.rect(170, y0 + 70, 740, 64), 6);
  for (let k = 0; k < 13; k++) { const x = 200 + k * 57; c.save(); c.translate(x, y0 + 40); shape(P.red, () => { c.moveTo(-22, 26); c.quadraticCurveTo(0, -34, 22, 26); c.closePath(); }, 4); c.restore(); }
  for (let k = 0; k < 18; k++) shape(P.white, () => c.arc(195 + k * 41, y0 + 102, 7, 0, 7), 3);
  for (let k = 0; k < 13; k++) { const x = 200 + k * 57; c.save(); c.translate(x, y1 - 30); shape(P.white, () => { c.moveTo(-20, -22); c.quadraticCurveTo(0, 30, 20, -22); c.closePath(); }, 4); c.restore(); }
}
function title(t) {
  const a = Q.has('still') ? 1 : seg(t, .9, 1.4); if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.font = '700 50px "Cinzel"'; c.letterSpacing = '3px';
  c.lineWidth = 10; c.strokeStyle = P.black; c.strokeText('HALF HARA · HALF HARI', 510, 318); c.fillStyle = P.white; c.fillText('HALF HARA · HALF HARI', 510, 318);
  c.font = '600 44px "CormorantG"'; c.letterSpacing = '1px';
  c.lineWidth = 8; c.strokeStyle = P.black; c.strokeText(CAP, 510, 1446); c.fillStyle = P.white; c.fillText(CAP, 510, 1446);
  c.restore();
}
const CAP = Q.get('cap') || 'Once a year, he wears both gods.';
window.DUR = 2;
window.render = t => {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  const f = border(); field(f); c.save(); c.translate(CX, 1000); c.scale(.95, .95); c.translate(-CX, -910); deity(t); c.restore(); pedestal(); title(t);
  c.globalCompositeOperation = 'multiply'; c.globalAlpha = .55; c.drawImage(TEX, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
};
(async () => { await document.fonts.load('700 60px "Cinzel"', 'HALF'); await document.fonts.load('600 44px "CormorantG"', 'Once'); TEX = makeTexture(); window.render(Number(Q.get('t') || 0)); window.READY = true; })();
