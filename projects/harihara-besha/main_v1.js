// Harihara Besha — Lord Balabhadra, half Hari, half Hara. 44.6 s, 1080×1920, 30 fps. Voiceover-timed.
// Media: stained glass (S1, S5) · art deco (S2, S4) · shadow puppetry (S3) · paper-cut lightbox (S6, S7).
// Transitions hand the light from one medium to the next: sun → gold point → lamp flame → two lights → sun → paths.
import { initLightbox, sheet, drawStack, glow, LW, LH } from './lightbox.js';

const W = 1080, H = 1920, DUR = 44.6, Q = new URLSearchParams(location.search);
const T = { s1: 0, s2: 4.42, s3: 9.5, s4: 14.37, s5: 26.32, s6: 35.4, s7: 41.4, harihara: 25.22 };
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a)), ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const backE = (t, s = 1.4) => { t = clamp(t); return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
const mul = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const mk = (w = W, h = H) => { const x = document.createElement('canvas'); x.width = w; x.height = h; return x; };
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
const flick = (t, k = 0) => 1 + .04 * Math.sin(7.3 * t + k) * Math.sin(3.1 * t + k * 2);
const CX = 540;
const cam = (c, x, y, z) => c.setTransform(z, 0, 0, z, W / 2 - x * z, H / 2 - y * z);
function fill(c, col, a) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.fillStyle = col; c.fillRect(0, 0, W, H); c.restore(); }
function point(c, x, y, r, a, col = 'rgba(255,236,190,1)') { if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); glow(c, x, y, r, col, a); c.globalAlpha = Math.min(1, a); c.fillStyle = '#fffaf0'; c.beginPath(); c.arc(x, y, r * .12, 0, 7); c.fill(); c.restore(); }

// ============ the deity's geometry: Lord Balabhadra, Puri iconography (shared by every medium) ============
const G = {
  hood: k => { const a = Math.PI + (k + .5) / 7 * Math.PI; return { x: Math.cos(a) * 330, y: -120 + Math.sin(a) * 300, a: a + Math.PI / 2 }; },
  hoodOuter: x => { x.moveTo(-58, 70); x.quadraticCurveTo(-70, -40, 0, -78); x.quadraticCurveTo(70, -40, 58, 70); x.closePath(); },
  hoodInner: x => { x.moveTo(-30, 50); x.quadraticCurveTo(-36, -18, 0, -40); x.quadraticCurveTo(36, -18, 30, 50); x.closePath(); },
  face: x => { x.moveTo(-270, -210); x.quadraticCurveTo(0, -290, 270, -210); x.quadraticCurveTo(300, 40, 250, 210); x.quadraticCurveTo(0, 330, -250, 210); x.quadraticCurveTo(-300, 40, -270, -210); x.closePath(); },
  crown: x => { x.moveTo(-270, -210); x.quadraticCurveTo(0, -290, 270, -210); x.lineTo(262, -168); x.quadraticCurveTo(0, -246, -262, -168); x.closePath(); },
  lips: x => { x.moveTo(-120, 160); x.quadraticCurveTo(0, 150, 120, 160); x.quadraticCurveTo(0, 245, -120, 160); x.closePath(); },
  body: x => { x.moveTo(-330, 300); x.lineTo(330, 300); x.lineTo(360, 570); x.lineTo(-360, 570); x.closePath(); },
  eyes: [-128, 128],
};
// 32 ornaments: 26 necklace beads in three strings, 4 crown jewels, 2 ear ornaments
const ORN = (() => { const o = []; [[10, 0], [9, 1], [7, 2]].forEach(([n, r]) => { for (let k = 0; k < n; k++) { const a = .3 + k / (n - 1) * (Math.PI - .6); o.push({ x: Math.cos(a) * (230 - r * 50), y: 300 + Math.sin(a) * (105 - r * 22), r: 13 - r * 2, kind: 'bead' }); } });
  for (const k of [-3, -1, 1, 3]) o.push({ x: k * 44, y: -230, r: 11, kind: 'jewel' }); for (const d of [-1, 1]) o.push({ x: d * 290, y: 70, r: 30, kind: 'ear' });
  const R = mul(5); return o.map((p, i) => ({ ...p, order: i, rot: R() })).sort((a, b) => a.y - b.y || a.x - b.x); })();

// ======================================== STAINED GLASS ========================================
const GL = { cobalt: '#173a8c', ruby: '#a3172b', gold: '#e2a52a', white: '#eef0e2', smoke: '#241e2c', lead: '#17130f' };
function glassPiece(x, fill, path, R, lw = 8) {
  x.save(); x.beginPath(); path(x); x.fillStyle = fill; x.fill(); x.clip();
  const a = R() * Math.PI; x.globalAlpha = .1; x.strokeStyle = R() < .5 ? '#ffffff' : '#000000'; x.lineWidth = 2;
  for (let k = -12; k < 12; k++) { x.beginPath(); x.moveTo(-900 + Math.cos(a) * k * 40, -900 + Math.sin(a) * k * 40); x.lineTo(900 + Math.cos(a) * k * 40 + Math.sin(a) * 1800, Math.sin(a) * k * 40 - Math.cos(a) * 1800); x.stroke(); }
  x.globalAlpha = .18 * R(); x.fillStyle = R() < .5 ? '#ffffff' : '#000000'; x.fill(); x.restore();
  x.beginPath(); path(x); x.lineWidth = lw; x.strokeStyle = GL.lead; x.lineJoin = 'round'; x.stroke();
}
function grisaille(x, draw, w = 7) { x.save(); x.strokeStyle = 'rgba(52,30,18,.85)'; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); draw(x); x.stroke(); x.restore(); }
const WIN = { L: 160, R: 920, top: 560, bot: 1330, apex: 330 };
const winPath = x => { x.moveTo(WIN.L, WIN.bot); x.lineTo(WIN.L, WIN.top); x.quadraticCurveTo(WIN.L, WIN.apex + 40, CX, WIN.apex); x.quadraticCurveTo(WIN.R, WIN.apex + 40, WIN.R, WIN.top); x.lineTo(WIN.R, WIN.bot); x.closePath(); };
const DEI = (x) => { x.translate(CX, 860); x.scale(.82, .82); };
let STONE, QUARRY, DTOP, COSTUME, WHITE_R;   // caches
function buildGlass() {
  const R = mul(11);
  STONE = mk(); let c = STONE.getContext('2d');
  c.fillStyle = '#26211c'; c.fillRect(0, 0, W, H);
  for (let r = 0, y = 0; y < H; r++, y += 92) for (let x = -((r % 2) * 80); x < W; x += 160) { const v = 52 + R() * 10; c.fillStyle = `rgb(${v | 0},${v * .92 | 0},${v * .82 | 0})`; c.fillRect(x + 3, y + 3, 154, 86); }
  c.save(); c.lineWidth = 60; c.strokeStyle = '#4a423a'; c.beginPath(); winPath(c); c.stroke(); c.restore();
  c.fillStyle = '#4e463d'; c.fillRect(110, 1350, 860, 46); c.fillStyle = '#2e2822'; c.fillRect(110, 1396, 860, 10);
  QUARRY = mk(); c = QUARRY.getContext('2d'); c.save(); c.beginPath(); winPath(c); c.clip();
  for (let yy = WIN.apex - 60; yy < WIN.bot + 60; yy += 64) for (let xx = WIN.L - 60 + ((yy / 64) % 2) * 52; xx < WIN.R + 60; xx += 104) {
    const col = R() < .12 ? GL.ruby : R() < .08 ? GL.gold : GL.cobalt;
    glassPiece(c, col, p => { p.moveTo(xx, yy - 64); p.lineTo(xx + 52, yy); p.lineTo(xx, yy + 64); p.lineTo(xx - 52, yy); p.closePath(); }, R, 5); }
  c.restore(); c.save(); c.lineWidth = 34; c.strokeStyle = GL.ruby; c.beginPath(); winPath(c); c.stroke(); c.lineWidth = 6; c.strokeStyle = GL.lead; c.stroke();
  for (let k = 0; k < 60; k++) { const u = k / 59; const x = u < .5 ? lerp(WIN.L, CX, u * 2) : lerp(CX, WIN.R, u * 2 - 1); } c.restore();
  // the deity's head: hood, face, crown, eyes, lips (static glass)
  DTOP = mk(); c = DTOP.getContext('2d'); c.save(); c.beginPath(); winPath(c); c.clip(); DEI(c);
  for (let k = 0; k < 7; k++) { const h = G.hood(k); c.save(); c.translate(h.x, h.y); c.rotate(h.a); glassPiece(c, GL.cobalt, G.hoodOuter, R); glassPiece(c, GL.white, G.hoodInner, R, 6); glassPiece(c, GL.gold, p => p.arc(0, 8, 10, 0, 7), R, 4); c.restore(); }
  glassPiece(c, GL.white, G.face, R, 10); glassPiece(c, GL.gold, G.crown, R, 7);
  glassPiece(c, GL.gold, p => { p.moveTo(-16, -150); p.lineTo(16, -150); p.lineTo(9, -60); p.lineTo(-9, -60); p.closePath(); }, R, 5);
  for (const d of G.eyes) { glassPiece(c, GL.white, p => p.arc(d, -10, 98, 0, 7), R, 11); glassPiece(c, GL.ruby, p => { p.arc(d, -10, 86, 0, 7); p.arc(d, -10, 72, 0, 7, true); }, R, 4); glassPiece(c, '#151018', p => p.arc(d, -10, 50, 0, 7), R, 5); }
  grisaille(c, p => { for (const d of [-1, 1]) { p.moveTo(d * 40, -92); p.quadraticCurveTo(d * 130, -140, d * 225, -92); } }, 11);
  grisaille(c, p => { p.moveTo(2, 62); p.quadraticCurveTo(26, 104, 4, 120); p.lineTo(-12, 116); }, 9);
  glassPiece(c, GL.ruby, G.lips, R, 8); c.restore();
  // costume pieces: 6 white on the left, 6 dark on the right (each a cut piece with its own lead)
  COSTUME = []; const xs = [-360, -240, -120, 0, 120, 240, 360];
  for (let i = 0; i < 6; i++) { const can = mk(), x = can.getContext('2d'); x.save(); x.beginPath(); winPath(x); x.clip(); DEI(x);
    const x0 = xs[i], x1 = xs[i + 1], path = p => { p.save(); p.beginPath(); G.body(p); p.clip(); }; x.save(); x.beginPath(); G.body(x); x.clip();
    const Rp = mul(100 + i); glassPiece(x, i < 3 ? GL.white : GL.smoke, p => p.rect(x0, 290, x1 - x0, 290), Rp, 7); x.restore();
    x.beginPath(); G.body(x); x.lineWidth = 9; x.strokeStyle = GL.lead; x.stroke(); x.restore(); COSTUME.push(can); }
  WHITE_R = mk(); { const x = WHITE_R.getContext('2d'); x.save(); x.beginPath(); winPath(x); x.clip(); DEI(x); x.save(); x.beginPath(); G.body(x); x.clip();
    for (let i = 3; i < 6; i++) glassPiece(x, GL.white, p => p.rect(xs[i], 290, 120, 290), mul(200 + i), 7); x.restore(); x.beginPath(); G.body(x); x.lineWidth = 9; x.strokeStyle = GL.lead; x.stroke(); x.restore(); }
}
function drawOrnament(c, o, a, t) {   // a gold glass jewel, in deity space
  if (a <= 0) return; c.save(); c.translate(o.x, o.y - 120 * (1 - eo(a))); c.globalAlpha = Math.min(1, a * 1.5);
  const R = mul(500 + o.order); glassPiece(c, o.kind === 'jewel' ? GL.ruby : GL.gold, p => p.arc(0, 0, o.r, 0, 7), R, 4);
  if (o.kind === 'ear') glassPiece(c, GL.ruby, p => p.arc(0, 0, 12, 0, 7), R, 3);
  c.restore();
}
// the window: quarries + head + costume (white half always; dark half slides or builds) + ornaments, lit by the sun, set in stone
function glassScene(c, t, o) {
  const g = BUF[1], x = g.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
  x.drawImage(QUARRY, 0, 0);
  // costume
  for (let i = 0; i < 6; i++) { const a = o.costume ? o.costume(i) : 1; if (a <= 0) continue; x.save(); x.globalAlpha = Math.min(1, a);
    let dx = 0; if (i >= 3 && o.slide !== undefined) dx = 420 * (1 - o.slide) * .82;
    if (i >= 3 && o.slide !== undefined && o.slide < 1) { if (i === 3) x.drawImage(WHITE_R, 0, 0); x.save(); x.beginPath(); x.save(); DEI(x); G.body(x); x.restore(); x.clip(); x.drawImage(COSTUME[i], dx, 0); x.restore(); }
    else x.drawImage(COSTUME[i], 0, (1 - eo(a)) * -60); x.restore(); }
  x.drawImage(DTOP, 0, 0);
  if (o.orn) { x.save(); DEI(x); ORN.forEach((p, i) => drawOrnament(x, p, o.orn(i), t)); x.restore(); }
  else { x.save(); DEI(x); ORN.forEach(p => drawOrnament(x, p, 1, t)); x.restore(); }
  // sunlight: a slow, slightly moving warm band
  x.save(); x.globalCompositeOperation = 'source-atop'; const sx = 380 + 60 * Math.sin(t * .25), sun = x.createRadialGradient(sx, 520, 50, 540, 860, 900); sun.addColorStop(0, `rgba(255,240,200,${.16 * (o.sun ?? 1)})`); sun.addColorStop(1, 'rgba(255,220,160,0)'); x.fillStyle = sun; x.fillRect(0, 0, W, H); x.restore();
  c.save(); cam(c, o.cx ?? CX, o.cy ?? 960, o.z ?? 1);
  c.drawImage(STONE, 0, 0); c.drawImage(g, 0, 0);
  c.globalCompositeOperation = 'lighter'; c.globalAlpha = .16 * (o.sun ?? 1); c.filter = 'blur(14px)'; c.drawImage(g, 0, 0); c.filter = 'none'; c.globalAlpha = 1;
  for (let k = 0; k < 4; k++) { const gr = c.createLinearGradient(400, 600, 900, 1800); gr.addColorStop(0, 'rgba(255,220,170,0)'); gr.addColorStop(.4, `rgba(255,220,170,${.045 * (o.sun ?? 1)})`); gr.addColorStop(1, 'rgba(255,220,170,0)'); c.fillStyle = gr; c.beginPath(); const sh = 30 * Math.sin(t * .2 + k); c.moveTo(300 + k * 150 + sh, 700); c.lineTo(420 + k * 150 + sh, 700); c.lineTo(760 + k * 120, 1920); c.lineTo(560 + k * 120, 1920); c.fill(); }
  const R = mul(77); for (let k = 0; k < 90; k++) { const u = (R() + t * .015 * (R() + .3)) % 1; c.fillStyle = `rgba(255,230,190,${.25 + .25 * Math.sin(t * 2 + k)})`; c.beginPath(); c.arc(300 + R() * 700 + 20 * Math.sin(t * .5 + k), 1900 - u * 600, 1.5 + R() * 2, 0, 7); c.fill(); }
  c.restore();
}
function carved(c, t, font, x, y, a = 1) { if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = '3px'; c.fillStyle = 'rgba(0,0,0,.55)'; c.fillText(t, x + 2, y + 3); c.fillStyle = '#f1e6cf'; c.fillText(t, x, y); c.restore(); }

function S1(c, t) {   // 0–4.42: half Hara, half Hari
  const u = t - T.s1;
  glassScene(c, t, { slide: eio(seg(u, .5, 2.1)), cx: CX, cy: lerp(960, 900, eio(seg(u, 0, 4.4))), z: lerp(1.0, 1.06, eio(seg(u, 0, 4.4))) });
  carved(c, 'HARIHARA BESHA', '700 54px "Cinzel"', 510, 290, ss(seg(u, .3, 1.1)) * (1 - seg(u, 3.7, 4.1)));
  carved(c, 'Half Hari · half Hara', 'italic 600 46px "CormorantG"', 510, 1448, ss(seg(u, 1.6, 2.3)) * (1 - seg(u, 3.7, 4.1)));
  // exit: the window's light gathers into one gold point
  const g = ss(seg(u, 3.7, 4.42)); if (g > 0) { fill(c, '#0b0806', g * .92); point(c, CX, 900, 220 * (1 - g * .6), g); }
}

// ======================================== ART DECO ========================================
const DC = { ground: '#15100b', ivory: '#f2e8d2', accent: '#7d1426', sapphire: '#3f7fe0' };
function goldGrad(x, x0, y0, x1, y1) { const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#6b4a14'); g.addColorStop(.3, '#e9c46a'); g.addColorStop(.5, '#fff1c0'); g.addColorStop(.7, '#e9c46a'); g.addColorStop(1, '#6b4a14'); return g; }
function gline(c, path, w = 4, a = 1) { c.save(); c.globalAlpha *= a; c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); path(); c.lineWidth = w + 2.4; c.strokeStyle = '#2a1a06'; c.stroke(); c.lineWidth = w; c.strokeStyle = goldGrad(c, 0, 0, W, H); c.stroke(); c.lineWidth = .8; c.strokeStyle = 'rgba(255,248,220,.8)'; c.stroke(); c.restore(); }
let CHAKRA, TRISHULA;
function buildDeco() {
  // the Sudarshana chakra: gold rim with flame teeth, dark field, 16 spokes, burgundy hub
  CHAKRA = mk(640, 640); let c = CHAKRA.getContext('2d'); c.translate(320, 320);
  for (let k = 0; k < 24; k++) { c.save(); c.rotate(k / 24 * Math.PI * 2); c.beginPath(); c.moveTo(-16, -232); c.quadraticCurveTo(0, -292, 16, -232); c.closePath(); c.fillStyle = goldGrad(c, -20, -290, 20, -230); c.fill(); c.restore(); }
  c.beginPath(); c.arc(0, 0, 236, 0, 7); c.fillStyle = goldGrad(c, -236, -236, 236, 236); c.fill();
  c.beginPath(); c.arc(0, 0, 196, 0, 7); const ab = c.createLinearGradient(-196, -196, 196, 196); ab.addColorStop(0, '#2a1d10'); ab.addColorStop(1, '#0d0906'); c.fillStyle = ab; c.fill();
  for (let k = 0; k < 16; k++) { c.save(); c.rotate(k / 16 * Math.PI * 2); c.beginPath(); c.moveTo(-9, 60); c.lineTo(-4, 192); c.lineTo(4, 192); c.lineTo(9, 60); c.closePath(); c.fillStyle = goldGrad(c, -9, 60, 9, 192); c.fill(); c.restore(); }
  c.beginPath(); c.arc(0, 0, 70, 0, 7); const hb = c.createRadialGradient(-20, -20, 5, 0, 0, 70); hb.addColorStop(0, '#c43a50'); hb.addColorStop(1, DC.accent); c.fillStyle = hb; c.fill(); c.lineWidth = 4; c.strokeStyle = '#e9c46a'; c.stroke();
  // the trishula: shaft; a straight central prong ending in a leaf-shaped spear blade; two side prongs that sweep
  // outward and up, each ending in its own spear blade; a collar where they join; a damaru tied below with a ribbon
  TRISHULA = mk(560, 1180); c = TRISHULA.getContext('2d'); c.translate(280, 470);
  const steel = (x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#fffaf0'); g.addColorStop(.55, '#e6dccb'); g.addColorStop(1, '#a89a82'); return g; };
  const blade = (bx, by, ang, len, wid) => { c.save(); c.translate(bx, by); c.rotate(ang); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(wid, -len * .35, 0, -len); c.quadraticCurveTo(-wid, -len * .35, 0, 0); c.closePath(); c.fillStyle = steel(-wid, -len, wid, 0); c.fill(); c.lineWidth = 3; c.strokeStyle = '#7a5a20'; c.stroke(); c.beginPath(); c.moveTo(0, -6); c.lineTo(0, -len + 10); c.lineWidth = 2; c.strokeStyle = 'rgba(120,96,50,.7)'; c.stroke(); c.restore(); };
  // side prongs: a U that leaves the collar sideways and rises
  for (const d of [-1, 1]) { c.beginPath(); c.moveTo(d * 10, -40); c.bezierCurveTo(d * 120, -40, d * 150, -110, d * 142, -200); c.lineTo(d * 128, -200); c.bezierCurveTo(d * 134, -122, d * 104, -62, d * 10, -62); c.closePath(); c.fillStyle = steel(0, -200, d * 150, -40); c.fill(); c.lineWidth = 3; c.strokeStyle = '#7a5a20'; c.stroke();
    blade(d * 135, -196, d * .12, 120, 30); }
  // central prong
  c.beginPath(); c.rect(-9, -230, 18, 190); c.fillStyle = steel(-9, -230, 9, -40); c.fill(); c.lineWidth = 3; c.strokeStyle = '#7a5a20'; c.stroke();
  blade(0, -226, 0, 190, 40);
  // collar: a gold lotus knob
  c.beginPath(); c.ellipse(0, -46, 46, 22, 0, 0, 7); c.fillStyle = goldGrad(c, -46, -60, 46, -30); c.fill(); c.lineWidth = 3; c.strokeStyle = '#5a3a10'; c.stroke();
  for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * 18 - 9, -30); c.quadraticCurveTo(k * 18, -6, k * 18 + 9, -30); c.fillStyle = '#e9c46a'; c.fill(); c.stroke(); }
  // shaft with gold bands
  c.fillStyle = steel(-10, 0, 10, 700); c.fillRect(-9, -24, 18, 720); c.strokeStyle = '#7a5a20'; c.lineWidth = 3; c.strokeRect(-9, -24, 18, 720);
  for (const y of [40, 300, 560, 690]) { c.fillStyle = goldGrad(c, -14, y, 14, y + 16); c.fillRect(-14, y, 28, 14); }
  // damaru tied just below the collar, with a saffron ribbon
  c.save(); c.translate(0, 70);
  c.beginPath(); c.moveTo(-44, -34); c.lineTo(44, -34); c.lineTo(8, 0); c.lineTo(44, 34); c.lineTo(-44, 34); c.lineTo(-8, 0); c.closePath(); c.fillStyle = '#8a4a22'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#3a1a08'; c.stroke();
  for (const y of [-34, 34]) { c.beginPath(); c.ellipse(0, y, 44, 9, 0, 0, 7); c.fillStyle = '#f2e8d2'; c.fill(); c.stroke(); }
  c.strokeStyle = '#e8962c'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(-60, 40, -46, 110); c.moveTo(12, 0); c.quadraticCurveTo(54, 50, 30, 120); c.stroke();
  c.restore();
}
function decoGround(c, t, a = 1, rot = 0) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = DC.ground; c.fillRect(0, 0, W, H); c.restore();
  c.save(); c.globalAlpha = a; for (let k = 0; k < 48; k++) { const a0 = k / 48 * Math.PI * 2 + rot, a1 = a0 + Math.PI / 48; c.fillStyle = k % 2 ? 'rgba(233,196,106,.10)' : 'rgba(233,196,106,.03)'; c.beginPath(); c.moveTo(CX, 900); c.arc(CX, 900, 1500, a0, a1); c.fill(); } c.restore();
}
function zig(c, p, a = 1) {   // stepped arch, drawn on progressively (p 0→1)
  for (let s = 0; s < 3; s++) { const o = s * 34; c.save(); c.setLineDash([3000 * p, 4000]); gline(c, () => { c.moveTo(170 + o, 1360); c.lineTo(170 + o, 640 + o); c.lineTo(250 + o, 640 + o); c.lineTo(250 + o, 540 + o); c.lineTo(350 + o, 540 + o); c.lineTo(350 + o, 440 + o); c.lineTo(730 - o, 440 + o); c.lineTo(730 - o, 540 + o); c.lineTo(830 - o, 540 + o); c.lineTo(830 - o, 640 + o); c.lineTo(910 - o, 640 + o); c.lineTo(910 - o, 1360); }, s ? 2 : 4, a); c.restore(); }
  for (let k = 0; k < 9; k++) gline(c, () => c.arc(205 + k * 84, 1360, 40, Math.PI, 0), 2.4, a * seg(p, .6, 1));
}
function decoTitle(c, txt, y, a) {
  if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; const open = eo(a);
  c.font = '400 58px "Limelight"'; c.letterSpacing = '6px'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = (c.measureText(txt).width + 90) * open;
  c.fillStyle = 'rgba(10,7,4,.9)'; c.beginPath(); c.moveTo(510 - w / 2, y - 40); c.lineTo(510 + w / 2, y - 40); c.lineTo(510 + w / 2 + 24, y); c.lineTo(510 + w / 2, y + 40); c.lineTo(510 - w / 2, y + 40); c.lineTo(510 - w / 2 - 24, y); c.closePath(); c.fill();
  gline(c, () => { c.moveTo(510 - w / 2, y - 40); c.lineTo(510 + w / 2, y - 40); }, 2); gline(c, () => { c.moveTo(510 - w / 2, y + 40); c.lineTo(510 + w / 2, y + 40); }, 2);
  c.beginPath(); c.rect(510 - w / 2, y - 40, w, 80); c.clip(); c.fillStyle = goldGrad(c, 0, y - 30, 0, y + 30); c.fillText(txt, 510, y + 2); c.restore();
}
function decoCard(c, txt, y, a) {
  if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.font = '600 40px "Josefin"'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = (c.measureText(txt).width + 80) * eo(a);
  const sh = () => { c.moveTo(510 - w / 2, y - 36); c.lineTo(510 + w / 2, y - 36); c.lineTo(510 + w / 2 + 18, y); c.lineTo(510 + w / 2, y + 36); c.lineTo(510 - w / 2, y + 36); c.lineTo(510 - w / 2 - 18, y); c.closePath(); };
  c.fillStyle = 'rgba(10,7,4,.88)'; c.beginPath(); sh(); c.fill(); gline(c, sh, 2); c.beginPath(); c.rect(510 - w / 2, y - 40, w, 80); c.clip(); c.fillStyle = DC.ivory; c.fillText(txt, 510, y + 2); c.restore();
}
function S2(c, t) {   // 4.42–9.5: the wheel and the trident meet on one axis
  const u = t - T.s2, z = lerp(1.08, 1.0, eio(seg(u, 0, 5))), meet = 3.2;
  c.save(); cam(c, CX, 900, z);
  decoGround(c, t, ss(seg(u, 0, .8)), t * .02); zig(c, eo(seg(u, .2, 1.6)));
  const m = eio(seg(u, .5, meet));
  c.save(); c.translate(lerp(-300, CX, m), 900); c.rotate(t * .25); c.drawImage(CHAKRA, -320, -320); c.restore();
  c.save(); c.translate(lerp(1380, CX, m), 900 + 40); c.drawImage(TRISHULA, -280, -470 - 130); c.restore();
  c.restore();
  { const e = 1 - ss(seg(u, 0, .9)); if (e > 0) { fill(c, '#0b0806', e * .92); point(c, CX, 900, lerp(260, 88, e), e); } }
  const sp = seg(u, meet - .1, meet + .2) * (1 - .55 * seg(u, meet + .3, meet + 1.4)); point(c, CX, 900 - 40 * z, 260, sp);
  decoTitle(c, 'WHEEL  ·  TRIDENT', 300, seg(u, .8, 1.5));
  decoCard(c, 'Two symbols. One form.', 1440, seg(u, meet + .3, meet + .9) * (1 - seg(u, 4.7, 5.0)));
  // exit: all goes dark but the meeting point, which becomes a lamp flame
  const g = ss(seg(u, 4.5, 5.08)); if (g > 0) { fill(c, '#0b0806', g * .95); point(c, CX, 900, 120, .6 + .4 * g); }
}

// ======================================== SHADOW PUPPETRY ========================================
const SP = { hide: '#f3e6c8', indigo: '#2c3f86', vermilion: '#c43a1e', ochre: '#d39a36', ink: '#2a1a12' };
let CLOTH, PEYES, PX, PBALA;
function buildPuppet() {
  const R = mul(23);
  CLOTH = mk(); let s = CLOTH.getContext('2d'); s.fillStyle = '#f7ead0'; s.fillRect(0, 0, W, H);
  s.globalAlpha = .06; s.strokeStyle = '#5a3a1a'; for (let y = 0; y < H; y += 4) { s.beginPath(); s.moveTo(0, y + Math.sin(y * .02) * 2); s.lineTo(W, y); s.stroke(); } for (let x = 0; x < W; x += 4) { s.beginPath(); s.moveTo(x, 0); s.lineTo(x + Math.sin(x * .03) * 2, H); s.stroke(); }
  const piece = (dst, fill, path, cuts) => { const t = mk(), x = t.getContext('2d'); x.beginPath(); path(x); x.fillStyle = fill; x.fill(); x.lineWidth = 4; x.strokeStyle = SP.ink; x.stroke();
    x.globalCompositeOperation = 'source-atop'; x.globalAlpha = .12; for (let k = 0; k < 400; k++) { x.fillStyle = R() < .5 ? '#000' : '#fff'; x.fillRect(R() * W, R() * H, 3 + R() * 12, 1.5); } x.globalAlpha = 1;
    if (cuts) { x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.beginPath(); cuts(x); x.fill(); } dst.getContext('2d').drawImage(t, 0, 0); };
  PEYES = mk(); for (const d of [-1, 1]) piece(PEYES, SP.ink, x => x.arc(540 + d * 92, 960, 78, 0, 7), x => { x.arc(540 + d * 92, 960, 63, 0, 7); x.arc(540 + d * 92, 960, 32, 0, 7, true); });
  PX = mk(); piece(PX, SP.vermilion, x => { x.rect(540 - 200, 960 - 15, 400, 30); });
  PBALA = mk(); const T2 = (x, f) => { x.save(); x.translate(540, 960); x.scale(.66, .66); f(x); x.restore(); };
  for (let k = 0; k < 7; k++) { const h = G.hood(k); piece(PBALA, SP.indigo, x => T2(x, x => { x.translate(h.x, h.y); x.rotate(h.a); G.hoodOuter(x); }), x => T2(x, x => { x.translate(h.x, h.y); x.rotate(h.a); for (let r = 0; r < 3; r++) { x.moveTo(-26 + r * 6, 40 - r * 30); x.arc(0, 40 - r * 30, 26 - r * 6, Math.PI, 0); } })); }
  piece(PBALA, SP.ochre, x => T2(x, G.body), x => T2(x, x => { for (let r = 0; r < 3; r++) for (let k = -6; k <= -1; k++) { const xx = k * 48 + (r % 2) * 24, yy = 360 + r * 66; x.moveTo(xx, yy - 14); x.lineTo(xx + 12, yy); x.lineTo(xx, yy + 14); x.lineTo(xx - 12, yy); x.closePath(); } }));
  piece(PBALA, SP.ink, x => T2(x, x => { x.moveTo(0, 300); x.lineTo(330, 300); x.lineTo(360, 570); x.lineTo(0, 570); x.closePath(); }));
  piece(PBALA, SP.hide, x => T2(x, G.face), x => T2(x, x => { for (const d of G.eyes) { x.moveTo(d + 98, -10); x.arc(d, -10, 98, 0, 7); x.moveTo(d + 86, -10); x.arc(d, -10, 86, 0, 7, true); } x.moveTo(-16, -150); x.lineTo(16, -150); x.lineTo(9, -60); x.lineTo(-9, -60); x.closePath(); }));
  for (const d of G.eyes) piece(PBALA, SP.ink, x => T2(x, x => x.arc(d, -10, 50, 0, 7)));
  piece(PBALA, SP.ochre, x => T2(x, G.crown), x => T2(x, x => { for (let k = -5; k <= 5; k++) { x.moveTo(k * 44 + 8, -206); x.arc(k * 44, -206, 8, 0, 7); } }));
  piece(PBALA, SP.vermilion, x => T2(x, G.lips));
  for (const d of [-1, 1]) piece(PBALA, SP.ochre, x => T2(x, x => x.arc(d * 290, 70, 34, 0, 7)), x => T2(x, x => x.arc(d * 290, 70, 14, 0, 7)));
  piece(PBALA, SP.ink, x => T2(x, x => { x.moveTo(-130, -80); x.quadraticCurveTo(-128, -120, -40, -100); x.lineTo(-40, -88); x.quadraticCurveTo(-120, -106, -130, -80); x.moveTo(130, -80); x.quadraticCurveTo(128, -120, 40, -100); x.lineTo(40, -88); x.quadraticCurveTo(120, -106, 130, -80); }));
  const pb = PBALA.getContext('2d'); pb.fillStyle = SP.ink; pb.beginPath(); pb.arc(540, 960 + 300 * .66, 9, 0, 7); pb.fill(); pb.fillStyle = SP.hide; pb.beginPath(); pb.arc(540, 960 + 300 * .66, 4, 0, 7); pb.fill();
}
function S3(c, t) {   // 9.5–14.37: Jagannath's eyes, crossed out; the camera finds Balabhadra
  const u = t - T.s3, lamp = ss(seg(u, 0, .8)) * flick(t), pan = eio(seg(u, 2.4, 3.7));
  const camX = lerp(300, 650, pan), camZ = lerp(1.06, 1.0, pan);
  const L = BUF[1], x = L.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0);
  // lit cloth: lamp hotspot follows the story
  x.drawImage(CLOTH, 0, 0); const lx = lerp(360, 640, pan), lg = x.createRadialGradient(lx, 820, 40, lx, 900, 1150); lg.addColorStop(0, 'rgba(255,250,236,1)'); lg.addColorStop(.5, 'rgba(244,222,180,1)'); lg.addColorStop(1, 'rgba(110,70,40,1)');
  x.globalCompositeOperation = 'multiply'; x.fillStyle = lg; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over';
  // puppets (multiplied: dyed hide filters the lamp)
  x.save(); x.globalCompositeOperation = 'multiply'; cam(x, camX, 960, camZ);
  const press = (img, px, py, t0, rot = 0) => { const a = seg(u, t0, t0 + .45); if (a <= 0) return; const s = lerp(1.2, 1, eo(a)), tr = 2 * Math.sin(t * 1.7 + px); x.save(); x.translate(px + tr, py); x.rotate(rot + .006 * Math.sin(t * 1.3 + py)); x.scale(s, s); x.filter = a < 1 ? `blur(${(1 - a) * 8}px)` : 'none'; x.drawImage(img, -540, -960); x.restore(); };
  press(PEYES, 300, 640, .5);
  for (const [r, d] of [[.62, 0], [-.62, .25]]) { const a = seg(u, 1.6 + d, 2.0 + d); if (a > 0) { x.save(); x.translate(300, 640); x.rotate(lerp(r * 2.4, r, eo(a))); x.globalAlpha = Math.min(1, a * 2); x.drawImage(PX, -540, -960); x.restore(); } }
  press(PBALA, 660, 900, 0, 0); x.restore();
  // rod
  x.save(); cam(x, camX, 960, camZ); x.strokeStyle = 'rgba(42,26,18,.55)'; x.lineWidth = 5; x.beginPath(); x.moveTo(660, 900 + 198); x.lineTo(720, 2000); x.stroke(); x.restore();
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(L, 0, 0); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .1; c.filter = 'blur(18px)'; c.drawImage(L, 0, 0); c.restore();
  fill(c, '#0b0604', 1 - lamp);
  { const e = 1 - ss(seg(u, 0, 1.0)); if (e > 0) { const k = eio(seg(u, 0, 1.0)); point(c, lerp(CX, 360, k), lerp(900, 820, k), lerp(120, 300, k), e); } }
  // the lacquered stage frame
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#3a130c'; c.fillRect(0, 0, W, 210); c.fillRect(0, H - 300, W, 300); c.fillRect(0, 0, 60, H); c.fillRect(W - 60, 0, 60, H);
  c.strokeStyle = '#c9963a'; c.lineWidth = 3; c.strokeRect(60, 210, W - 120, H - 510); for (let k = 0; k < 14; k++) { c.fillStyle = '#2a0d08'; c.beginPath(); c.arc(80 + k * 72, 210, 30, Math.PI, 0); c.fill(); } c.restore();
  // words: a whisper by the eyes; the label on a rod; the storyteller's placard
  const sxy = (wx, wy) => [W / 2 + (wx - camX) * camZ, H / 2 + (wy - 960) * camZ];
  { const a = seg(u, 2.0, 2.5) * (1 - seg(u, 3.0, 3.5)), [qx, qy] = sxy(300, 470); c.save(); c.globalAlpha = a; c.font = '600 50px "CormorantG"'; c.textAlign = 'center'; c.fillStyle = '#3a1a10'; c.fillText('Not Jagannath…', qx, qy); c.restore(); }
  { const a = seg(u, 3.4, 3.9), [lx2, ly2] = sxy(660, 1318); if (a > 0) { c.save(); c.globalAlpha = a; c.font = '700 30px "Cinzel"'; c.letterSpacing = '4px'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText('BALABHADRA').width + 40; c.fillStyle = '#2a1a12'; c.fillRect(lx2 - w / 2, ly2 - 24, w, 48); c.fillStyle = '#ffe7b8'; c.fillText('BALABHADRA', lx2, ly2 + 2); c.restore(); } }
  { const a = seg(u, 3.6, 4.2); if (a > 0) { c.save(); c.globalAlpha = a; c.font = '600 48px "CormorantG"'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText('Why the elder Lord?').width + 90, y = 1440 + 20 * (1 - eo(a));
    c.fillStyle = '#2a0f0a'; c.fillRect(510 - w / 2, y - 42, w, 84); c.strokeStyle = '#c9963a'; c.lineWidth = 2.5; c.strokeRect(510 - w / 2 + 8, y - 34, w - 16, 68); c.fillStyle = '#c43a1e'; c.fillRect(510 + w / 2 - 34, y - 12, 18, 24); c.fillStyle = '#f6e7c8'; c.fillText('Why the elder Lord?', 500, y + 2); c.restore(); } }
  // exit: the lamp gutters down to one flame that splits into two small lights
  const g = ss(seg(u, 4.4, 4.87)); if (g > 0) { fill(c, '#0b0806', g * .96); point(c, CX, 860, 90, .7 * g); }
}

// ======================================== ART DECO · the dial (S4) ========================================
const DIAL = { cx: CX, cy: 1080, r: 360 };
function dialPos(a) { return [DIAL.cx + Math.cos(a) * DIAL.r, DIAL.cy + Math.sin(a) * DIAL.r]; }
function orb(c, x, y, r, col, core, a) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; for (const [k, aa] of [[3.2, .16], [1.8, .32], [1, .7]]) { const g = c.createRadialGradient(x, y, 0, x, y, r * k); g.addColorStop(0, col.replace('A', aa * a)); g.addColorStop(1, col.replace('A', 0)); c.fillStyle = g; c.fillRect(x - r * k, y - r * k, r * k * 2, r * k * 2); } c.restore(); c.save(); c.globalAlpha = a; c.fillStyle = core; c.beginPath(); c.arc(x, y, r * .32, 0, 7); c.fill(); c.restore(); }
function S4(c, t) {   // 14.37–26.32: Kartika (blue) and Monday (white) travel the dial and become one on "Harihara"
  const u = t - T.s4, M = T.harihara - T.s4, z = lerp(1.0, 1.06, eio(seg(u, 0, M))) - .05 * eio(seg(u, M, M + 1.2));
  c.save(); cam(c, CX, 960, z);
  decoGround(c, t, ss(seg(u, 0, 1)), t * .015);
  // the dial: a gold half-ring with 30 day-marks of Kartika
  c.save(); c.setLineDash([2400 * eo(seg(u, .3, 2)), 4000]); gline(c, () => c.arc(DIAL.cx, DIAL.cy, DIAL.r, Math.PI, 2 * Math.PI), 4); gline(c, () => c.arc(DIAL.cx, DIAL.cy, DIAL.r - 26, Math.PI, 2 * Math.PI), 1.6); c.restore();
  const travel = eio(seg(u, 4.2, M)), aL = Math.PI + travel * Math.PI / 2, aR = 2 * Math.PI - travel * Math.PI / 2;
  for (let k = 0; k <= 30; k++) { const a = Math.PI + k / 30 * Math.PI, [x, y] = dialPos(a), [x2, y2] = [DIAL.cx + Math.cos(a) * (DIAL.r - 26), DIAL.cy + Math.sin(a) * (DIAL.r - 26)];
    const lit = (a <= aL + .01) || (a >= aR - .01) ? 1 : 0, show = seg(u, .5 + k * .04, .7 + k * .04);
    c.save(); c.globalAlpha = show; c.strokeStyle = lit && travel > 0 ? '#fff3cf' : 'rgba(233,196,106,.6)'; c.lineWidth = k % 5 ? 2 : 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke(); c.restore(); }
  // the merge: the two lights become one at the top of the dial
  const [tx, ty] = dialPos(1.5 * Math.PI), merged = seg(u, M - .05, M + .25);
  // words above, each giving off its light
  const kw = seg(u, .5, 1.3), mw = seg(u, 2.9, 3.7), fadeW = 1 - .6 * seg(u, 5, 7);
  wordGlow(c, 'KARTIKA', 390, kw * fadeW, '#7fb0ff', 'rgba(63,127,224,A)');
  wordGlow(c, 'MONDAY', 520, mw * fadeW, '#ffffff', 'rgba(255,250,235,A)');
  const [l0x, l0y] = dialPos(Math.PI), [r0x, r0y] = dialPos(2 * Math.PI);
  const dropK = eo(seg(u, 1.4, 3.4)), dropM = eo(seg(u, 3.6, 4.6));
  const rise = eio(seg(u, 0, .8));
  const [bx, by] = travel > 0 ? dialPos(aL) : u < 1.4 ? [lerp(CX, 510, rise), lerp(860, 390, rise)] : [lerp(510, l0x, dropK), lerp(390, l0y, dropK)];
  const [wx, wy] = travel > 0 ? dialPos(aR) : [lerp(510, r0x, dropM), lerp(520, r0y, dropM)];
  if (merged < 1) { orb(c, bx, by, 46, 'rgba(90,150,255,A)', '#cfe2ff', seg(u, .2, .7) * (1 - merged)); orb(c, wx, wy, 46, 'rgba(255,248,230,A)', '#ffffff', seg(u, 3.4, 4.0) * (1 - merged)); }
  // trails along the ring
  if (travel > 0 && merged < 1) { c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineWidth = 8; c.strokeStyle = 'rgba(90,150,255,.35)'; c.beginPath(); c.arc(DIAL.cx, DIAL.cy, DIAL.r, Math.PI, aL); c.stroke(); c.strokeStyle = 'rgba(255,248,230,.35)'; c.beginPath(); c.arc(DIAL.cx, DIAL.cy, DIAL.r, aR, 2 * Math.PI); c.stroke(); c.restore(); }
  if (merged > 0) { orb(c, tx, ty, 70 + 40 * (1 - merged), 'rgba(210,228,255,A)', '#ffffff', merged); c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + t * .1; c.strokeStyle = `rgba(255,240,200,${.35 * merged})`; c.lineWidth = 2; c.beginPath(); c.moveTo(tx + Math.cos(a) * 80, ty + Math.sin(a) * 80); c.lineTo(tx + Math.cos(a) * (180 + 60 * merged), ty + Math.sin(a) * (180 + 60 * merged)); c.stroke(); } c.restore(); }
  c.restore();
  decoTitle(c, 'HARIHARA', 1250, seg(u, M + .1, M + .6));
  // exit: the one light rises and becomes the sun behind the window
  const g = ss(seg(u, M + .5, 11.95)); if (g > 0) { fill(c, '#0b0806', g * .9); point(c, CX, lerp(ty, 700, g), 200 + 300 * g, g); }
  { const e = 1 - ss(seg(u, 0, .7)); if (e > 0) point(c, CX, 860, 90, .7 * e); }
}
function wordGlow(c, txt, y, a, col, glowCol) { if (a <= 0) return; c.save(); c.globalAlpha = Math.min(1, a); c.font = '400 76px "Limelight"'; c.letterSpacing = '10px'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = glowCol.replace('A', .9); c.shadowBlur = 40 * a; c.fillStyle = col; c.fillText(txt, 510, y); c.shadowBlur = 0; c.restore(); }

// ======================================== STAINED GLASS · 32 ornaments (S5) ========================================
const ORN_T = ORN.map((o, i) => 29.6 + i * .155);
function S5(c, t) {
  const u = t - T.s5, z = lerp(1.14, 1.0, eio(seg(u, 0, 8.5)));
  glassScene(c, t, { costume: i => seg(u, .3 + [0, 3, 1, 4, 2, 5][i] * .42, .7 + [0, 3, 1, 4, 2, 5][i] * .42), orn: i => seg(t, ORN_T[i], ORN_T[i] + .35), cx: CX, cy: lerp(1000, 940, eio(seg(u, 0, 8.5))), z, sun: .7 + .3 * ss(seg(u, 0, 1.5)) });
  // each jewel glints as it lands
  c.save(); cam(c, CX, lerp(1000, 940, eio(seg(u, 0, 8.5))), z);
  ORN.forEach((o, i) => { const g = seg(t, ORN_T[i] + .3, ORN_T[i] + .7); if (g > 0 && g < 1) { const x = CX + o.x * .82, y = 860 + o.y * .82; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.sin(Math.PI * g); c.fillStyle = '#fff6d8'; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, r = k % 2 ? 4 : 22; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.fill(); c.restore(); } });
  c.restore();
  const n = ORN_T.filter(x => t >= x + .3).length;
  carved(c, n ? `${n}  ORNAMENTS` : 'ONE BY ONE', '700 54px "Cinzel"', 510, 1446, seg(u, 2.8, 3.3));
  { const e = 1 - ss(seg(u, 0, 1.3)); if (e > 0) { fill(c, '#0b0806', e * .9); point(c, CX, 700, 500, e); } }
  // exit: push into the split, white and dark become two paths
  const g = ss(seg(u, 8.6, 9.08)); if (g > 0) fill(c, '#f6e7cc', g * .85);
}

// ======================================== PAPER-CUT LIGHTBOX (S6, S7) ========================================
let LB;
const PATHW = [[0, 1150], [-60, 1000], [-260, 820], [-470, 620], [-500, 380], [-330, 170], [-120, 60], [0, 30]];
const PATHD = PATHW.map(([x, y]) => [-x, y]);
function catmull(P, u) { const n = P.length - 1, f = u * n, i = Math.min(n - 1, Math.floor(f)), l = f - i, p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)];
  const q = (a, b, c2, d) => .5 * (2 * b + (-a + c2) * l + (2 * a - 5 * b + 4 * c2 - d) * l * l + (-a + 3 * b - 3 * c2 + d) * l * l * l); return [q(p0[0], p1[0], p2[0], p3[0]), q(p0[1], p1[1], p2[1], p3[1])]; }
function buildLightbox() {
  const full = m => m.fillRect(-LW / 2, -LH / 2, LW, LH);
  const temple = m => {   // Srimandir: rekha deul with amalaka, kalasha, Nilachakra and flag; pidha porch; temple wall
    const base = -20, x0 = 0, w = 210, h = 470;
    m.beginPath(); m.moveTo(x0 - w / 2, base); m.bezierCurveTo(x0 - w * .52, base - h * .55, x0 - w * .42, base - h * .85, x0 - w * .16, base - h * .95); m.lineTo(x0 + w * .16, base - h * .95); m.bezierCurveTo(x0 + w * .42, base - h * .85, x0 + w * .52, base - h * .55, x0 + w / 2, base); m.closePath(); m.fill();
    m.beginPath(); m.ellipse(x0, base - h * .97, w * .26, h * .04, 0, 0, 7); m.fill(); m.fillRect(x0 - 8, base - h * 1.06, 16, h * .07);
    m.beginPath(); m.arc(x0, base - h * 1.12, 26, 0, 7); m.fill(); m.fillRect(x0 - 2.5, base - h * 1.32, 5, h * .2);
    m.beginPath(); m.moveTo(x0 + 2, base - h * 1.32); m.lineTo(x0 + 70, base - h * 1.28); m.lineTo(x0 + 2, base - h * 1.22); m.fill();
    m.beginPath(); m.moveTo(-300, base); for (let k = 0; k < 5; k++) { const ww = 110 - k * 18, yy = base - 60 - k * 40; m.lineTo(-170 - ww, yy + 18); m.lineTo(-170 - ww + 12, yy); m.lineTo(-170 + ww - 12, yy); m.lineTo(-170 + ww, yy + 18); } m.lineTo(-170, base - 300); m.lineTo(-40, base); m.closePath(); m.fill();
    m.fillRect(-420, base - 40, 840, 40); for (let k = 0; k < 15; k++) m.fillRect(-420 + k * 60, base - 56, 30, 18);
  };
  LB = [
    sheet('#e9b48c', full, { depth: 0, trans: .95 }),
    sheet('#d38c64', m => { m.beginPath(); m.moveTo(-LW / 2, 120); for (let x = -LW / 2; x <= LW / 2; x += 40) m.lineTo(x, 90 - 60 * Math.sin(x / 260) - 22 * Math.sin(x / 90)); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill(); }, { depth: .2, trans: .7 }),
    sheet('#7a3424', temple, { depth: .38, trans: .3, rim: '#ffc98a', rimA: .9, cut: m => { const base = -20, h = 470; m.beginPath(); m.arc(0, base - h * 1.12, 18, 0, 7); m.fill(); m.globalCompositeOperation = 'source-over'; m.beginPath(); m.arc(0, base - h * 1.12, 6, 0, 7); m.fill(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; m.fillRect(Math.cos(a) * 12 - 1.5, base - h * 1.12 + Math.sin(a) * 12 - 1.5, 3, 3); } m.globalCompositeOperation = 'destination-out'; for (const [x, y, r] of [[0, -150, 24], [0, -300, 14], [-170, -110, 22]]) { m.beginPath(); m.moveTo(x - r, y + r * 1.4); m.lineTo(x - r, y - r * .4); m.quadraticCurveTo(x, y - r * 1.8, x + r, y - r * .4); m.lineTo(x + r, y + r * 1.4); m.fill(); } } }),
    sheet('#9a5232', m => { m.beginPath(); m.moveTo(-LW / 2, 360); for (let x = -LW / 2; x <= LW / 2; x += 40) m.lineTo(x, 330 - 80 * Math.sin(x / 300 + 1) - 20 * Math.sin(x / 70)); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill(); }, { depth: .5, trans: .4 }),
    sheet('#3a1a12', m => { m.beginPath(); m.moveTo(-LW / 2, 1080); for (let x = -LW / 2; x <= LW / 2; x += 30) m.lineTo(x, 1060 - 30 * Math.abs(Math.sin(x / 47)) - 18 * Math.sin(x / 13)); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill(); for (const [x, s] of [[-560, 1], [580, -1]]) { m.save(); m.translate(x, 1080); m.scale(s, 1); m.fillRect(-10, -420, 20, 420); for (let k = 0; k < 6; k++) { m.beginPath(); m.ellipse(-10 + k * 6, -420 + k * 30, 110 - k * 10, 34, -.3 + k * .12, 0, 7); m.fill(); } m.restore(); } }, { depth: 1, trans: .04 }),
  ];
}
function ribbon(c, P, u0, u1, w0, w1, fillCol, edge, scr, L) {   // a path drawn as a tapered ribbon from u0 to u1
  if (u1 <= u0) return; const N = 60, left = [], right = [];
  for (let i = 0; i <= N; i++) { const u = lerp(u0, u1, i / N), [x, y] = catmull(P, u), [x2, y2] = catmull(P, Math.min(1, u + .01)), [x1, y1] = catmull(P, Math.max(0, u - .01)), dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, u);
    const [sx, sy, z] = scr(L, x - dy / l * w, y + dx / l * w), [tx, ty] = scr(L, x + dy / l * w, y - dx / l * w); left.push([sx, sy]); right.push([tx, ty]); }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.beginPath(); left.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); right.reverse().forEach(p => c.lineTo(...p)); c.closePath(); c.fillStyle = fillCol; c.fill(); c.lineWidth = 3; c.strokeStyle = edge; c.stroke(); c.restore();
}
function lightboxScene(c, t, camv, pw, pd, opts = {}) {
  LB.forEach(l => { l.lit = 1; l.ox = 0; l.oy = 0; l.alpha = 1; });
  const scr = (l, x, y) => { const p = .45 + .55 * l.depth, z = 1 + (camv.z - 1) * p; return [W / 2 + z * (x - camv.x * p), H / 2 + z * (y - camv.y * p), z]; };
  const [sx, sy, sz] = scr(LB[0], 0, -560);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0c0405'; c.fillRect(0, 0, W, H); c.restore();
  drawStack(c, LB, camv, { x: sx, y: sy + 300, r: 1700, I: 1.0 * flick(t) }, {
    after: [(cc) => { cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); glow(cc, sx, sy, 220 * sz, 'rgba(255,214,150,1)', .55); cc.fillStyle = '#fff0cc'; cc.beginPath(); cc.arc(sx, sy, 90 * sz, 0, 7); cc.fill(); cc.restore(); },
      null,
      (cc) => { if (opts.templeGlow > 0) { for (const [x, y, r] of [[0, -150, 24], [0, -300, 14], [-170, -110, 22]]) { const [gx, gy, gz] = scr(LB[2], x, y); glow(cc, gx, gy, r * 2.2 * gz, 'rgba(255,190,110,1)', opts.templeGlow); } const [nx, ny, nz] = scr(LB[2], 0, -20 - 470 * 1.12); glow(cc, nx, ny, 60 * nz, 'rgba(255,220,150,1)', .7 * opts.templeGlow); } },
      (cc) => {   // the two paths, on the mid hills
        ribbon(cc, PATHW, 0, pw, 70, 14, 'rgba(252,244,226,.96)', 'rgba(150,100,60,.6)', scr, LB[3]);
        ribbon(cc, PATHD, 0, pd, 70, 14, 'rgba(34,26,40,.96)', 'rgba(233,196,106,.75)', scr, LB[3]);
        for (const [P, pr, col] of [[PATHW, pw, 'rgba(255,214,150,1)'], [PATHD, pd, 'rgba(255,214,150,1)']]) for (let k = 0; k < 3; k++) { const u = pr - .04 - k * .08; if (u < .02) continue; const [x, y] = catmull(P, u), [gx, gy, gz] = scr(LB[3], x, y); glow(cc, gx, gy, 18 * gz, col, .8); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.fillStyle = '#fff4d8'; cc.beginPath(); cc.arc(gx, gy, 4 * gz, 0, 7); cc.fill(); cc.restore(); }
      }],
  });
}
function paperStrip(c, txt, y, a) { if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.font = '600 50px "CormorantG"'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText(txt).width + 90, x0 = 510 - w / 2;
  c.beginPath(); c.rect(x0, y - 50, w * eo(a), 100); c.clip(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 14; c.shadowOffsetY = 6; c.fillStyle = '#2a100c'; c.fillRect(x0, y - 42, w, 84); c.shadowColor = 'transparent'; c.fillStyle = 'rgba(255,190,120,.45)'; c.fillRect(x0, y - 42, w, 2.5); c.fillStyle = '#f7e6cc'; c.fillText(txt, 510, y + 3); c.restore(); }
function S6(c, t) {   // 35.4–41.4: two paths drift apart
  const u = t - T.s6, camv = { x: 0, y: lerp(760, 640, eio(seg(u, 0, 6))), z: lerp(1.75, 1.6, eio(seg(u, 0, 6))) };
  const p = .05 + .5 * eio(seg(u, .2, 5.8)); lightboxScene(c, t, camv, p, p);
  paperStrip(c, 'Two paths…', 1430, seg(u, 1.0, 1.6) * (1 - seg(u, 5.4, 5.9)));
  const g = 1 - ss(seg(u, 0, .6)); if (g > 0) fill(c, '#f6e7cc', g * .85);
}
function S7(c, t) {   // 41.4–44.6: they meet at the Srimandir
  const u = t - T.s7, b = eio(seg(u, 0, 2.2)), camv = { x: 0, y: lerp(640, 120, b), z: lerp(1.6, 1.0, b) };
  const p = lerp(.55, 1, eio(seg(u, .1, 2.0))); lightboxScene(c, t, camv, p, p, { templeGlow: seg(u, 1.8, 2.4) });
  const meet = seg(u, 1.95, 2.35) * (1 - .5 * seg(u, 2.4, 3)); if (meet > 0) { const scr = (x, y) => { const pp = .45 + .55 * .5, z = 1 + (camv.z - 1) * pp; return [W / 2 + z * (x - camv.x * pp), H / 2 + z * (y - camv.y * pp)]; }; const [mx, my] = scr(0, 30); point(c, mx, my, 160, meet); }
  paperStrip(c, '…one home.', 1430, seg(u, 2.1, 2.6));
}

// ======================================== render ========================================
let BUF;
const SEQ = [[T.s2, S1], [T.s3, S2], [T.s4, S3], [T.s5, S4], [T.s6, S5], [T.s7, S6], [DUR, S7]];
const FROM = Number(Q.get('from') || 0), TO = Number(Q.get('to') || DUR);
window.DUR = TO - FROM;
window.render = t0 => {
  const t = t0 + FROM;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  // the last frames are S1's first frame exactly: the reel loops
  if (t >= DUR - 1 / 30 - 1e-6) { S1(ctx, 0); return; }
  let i = 0; while (t >= SEQ[i][0]) i++; SEQ[i][1](ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};
window.EV = [{ t: 0, type: 'conch' }, { t: .1, type: 'damaru' }, ...ORN_T.map(t => ({ t: t + .3, type: 'chime' })), { t: T.harihara, type: 'bell' }, { t: 42.4, type: 'conch' }, { t: 42.9, type: 'damaru' }];
(async () => {
  for (const f of ['700 50px "Cinzel"', '600 42px "CormorantG"', '400 58px "Limelight"', '600 40px "Josefin"']) await document.fonts.load(f, 'HALF');
  const base = new URL('.', import.meta.url).href, [fibre, pulp] = await Promise.all([load(base + 'assets/fibre.png'), load(base + 'assets/pulp.png')]);
  BUF = [mk(), mk()]; initLightbox(fibre, pulp); buildGlass(); buildDeco(); buildPuppet(); buildLightbox();
  window.render(Number(Q.get('t') || 0)); window.READY = true;
})();
