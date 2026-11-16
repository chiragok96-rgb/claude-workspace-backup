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
function fill(c, col, a) { a = clamp(a); if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a; c.fillStyle = col; c.fillRect(0, 0, W, H); c.restore(); }
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
// 32 ornaments: three necklace strings (11 + 9 + 6 beads, a ruby pendant at the centre of the first two), 4 crown jewels, 2 ear ornaments
const STR = [{ n: 11, rx: 236, ry: 128, r: 12 }, { n: 9, rx: 176, ry: 96, r: 10.5 }, { n: 6, rx: 112, ry: 62, r: 9 }];
const strPos = (s, k) => { const a = .32 + k / (s.n - 1) * (Math.PI - .64); return [Math.cos(a) * s.rx, 300 + Math.sin(a) * s.ry]; };
const ORN = (() => { const o = [];
  for (const k of [-3, -1, 1, 3]) o.push({ x: k * 44, y: -228, r: 11, kind: 'jewel' });
  for (const d of [-1, 1]) o.push({ x: d * 290, y: 70, r: 30, kind: 'ear' });
  STR.forEach((s, si) => { const seq = []; for (let k = 0; k < s.n; k++) seq.push(k); seq.sort((a, b) => Math.abs(a - (s.n - 1) / 2) - Math.abs(b - (s.n - 1) / 2) || a - b);   // from the centre outward
    for (const k of seq) { const [x, y] = strPos(s, k); o.push({ x, y, r: s.r, kind: (s.n % 2 && k === (s.n - 1) / 2) ? 'pendant' : 'bead', str: si }); } });
  return o.map((p, i) => ({ ...p, order: i })); })();

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
  for (const d of G.eyes) { glassPiece(c, GL.white, p => p.arc(d, -10, 98, 0, 7), R, 11); glassPiece(c, GL.ruby, p => { p.arc(d, -10, 86, 0, Math.PI * 2); p.moveTo(d + 72, -10); p.arc(d, -10, 72, Math.PI * 2, 0, true); }, R, 4); glassPiece(c, '#151018', p => p.arc(d, -10, 50, 0, 7), R, 5); }
  grisaille(c, p => { for (const d of [-1, 1]) { p.moveTo(d * 40, -92); p.quadraticCurveTo(d * 130, -140, d * 225, -92); } }, 11);
  grisaille(c, p => { p.moveTo(2, 62); p.quadraticCurveTo(26, 104, 4, 120); p.lineTo(-12, 116); }, 9);
  glassPiece(c, GL.ruby, G.lips, R, 8);
  c.beginPath(); G.body(c); c.lineWidth = 10; c.strokeStyle = GL.lead; c.stroke(); c.restore();
  // costume: each half is three draped glass swags (left white, right dark); WHITE_R is the right half in white (before the dark half arrives)
  const SW = [[395, 440, 362], [488, 540, 458]];   // swag curves: y at the outer edge, control y, y at the centre line
  const swag = (d, k) => p => { const top = k === 0 ? null : SW[k - 1], bot = k === 2 ? null : SW[k];
    if (top) { p.moveTo(d * 400, top[0]); p.quadraticCurveTo(d * 180, top[1], 0, top[2]); } else { p.moveTo(d * 400, 270); p.lineTo(0, 270); }
    if (bot) { p.lineTo(0, bot[2]); p.quadraticCurveTo(d * 180, bot[1], d * 400, bot[0]); } else { p.lineTo(0, 600); p.lineTo(d * 400, 600); } p.closePath(); };
  const half = (d, col, seed, k0, k1) => { const can = mk(), x = can.getContext('2d'); x.save(); x.beginPath(); winPath(x); x.clip(); DEI(x);
    x.save(); x.beginPath(); G.body(x); x.clip(); for (let k = k0; k < k1; k++) glassPiece(x, col, swag(d, k), mul(seed + k), 7); x.restore();
    x.restore(); return can; };
  COSTUME = []; for (let i = 0; i < 6; i++) COSTUME.push(i < 3 ? half(-1, GL.white, 100, i, i + 1) : half(1, GL.smoke, 100, i - 3, i - 2));
  WHITE_R = half(1, GL.white, 200, 0, 3);
}
function drawOrnament(c, o, a, t) {   // a gold glass jewel, in deity space
  if (a <= 0) return; c.save(); c.translate(o.x, o.y - 120 * (1 - eo(a))); c.globalAlpha = Math.min(1, a * 1.5);
  const R = mul(500 + o.order), TAU = Math.PI * 2;
  if (o.kind === 'pendant') { glassPiece(c, GL.gold, p => { p.moveTo(0, -16); p.lineTo(16, 6); p.lineTo(0, 30); p.lineTo(-16, 6); p.closePath(); }, R, 4); glassPiece(c, GL.ruby, p => { p.moveTo(0, -6); p.lineTo(8, 6); p.lineTo(0, 18); p.lineTo(-8, 6); p.closePath(); }, R, 3); }
  else glassPiece(c, o.kind === 'jewel' ? GL.ruby : GL.gold, p => p.arc(0, 0, o.r, 0, TAU), R, 4);
  if (o.kind === 'ear') glassPiece(c, GL.ruby, p => p.arc(0, 0, 12, 0, TAU), R, 3);
  if (o.kind !== 'pendant') { c.fillStyle = 'rgba(255,255,240,.7)'; c.beginPath(); c.arc(-o.r * .35, -o.r * .35, o.r * .22, 0, TAU); c.fill(); }
  c.restore();
}
function drawStrings(c, orn) {   // the gold threads, each appearing with its first bead
  STR.forEach((s, si) => { const a = Math.max(0, ...ORN.map((o, i) => o.str === si ? orn(i) : 0)); if (a <= 0) return;
    c.save(); c.globalAlpha = Math.min(1, a * 2); c.beginPath(); c.ellipse(0, 300, s.rx, s.ry, 0, .32, Math.PI - .32); c.lineWidth = 7; c.strokeStyle = GL.lead; c.stroke(); c.lineWidth = 3.5; c.strokeStyle = '#e9c46a'; c.stroke(); c.restore(); });
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
  { const orn = o.orn || (() => 1); x.save(); DEI(x); drawStrings(x, orn); ORN.forEach((p, i) => drawOrnament(x, p, orn(i), t)); x.restore(); }
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
  // the Sudarshana chakra: a gold rim edged with 32 flame tongues, dark field, 16 spokes, burgundy hub
  CHAKRA = mk(680, 680); let c = CHAKRA.getContext('2d'); c.translate(340, 340);
  for (let k = 0; k < 32; k++) { c.save(); c.rotate(k / 32 * Math.PI * 2); c.beginPath(); c.moveTo(-17, -232); c.bezierCurveTo(-20, -262, -4, -282, 10, -306); c.bezierCurveTo(4, -280, 16, -258, 17, -232); c.closePath(); c.fillStyle = goldGrad(c, -20, -306, 20, -232); c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#5a3a10'; c.stroke(); c.restore(); }
  c.beginPath(); c.arc(0, 0, 238, 0, Math.PI * 2); c.fillStyle = goldGrad(c, -238, -238, 238, 238); c.fill(); c.lineWidth = 2; c.strokeStyle = '#5a3a10'; c.stroke();
  c.beginPath(); c.arc(0, 0, 222, 0, Math.PI * 2); c.lineWidth = 1.5; c.strokeStyle = 'rgba(90,58,16,.7)'; c.stroke();
  c.beginPath(); c.arc(0, 0, 196, 0, Math.PI * 2); const ab = c.createLinearGradient(-196, -196, 196, 196); ab.addColorStop(0, '#2a1d10'); ab.addColorStop(1, '#0d0906'); c.fillStyle = ab; c.fill();
  for (let k = 0; k < 16; k++) { c.save(); c.rotate(k / 16 * Math.PI * 2); c.beginPath(); c.moveTo(-10, 66); c.lineTo(-4, 194); c.lineTo(4, 194); c.lineTo(10, 66); c.closePath(); c.fillStyle = goldGrad(c, -10, 66, 10, 194); c.fill(); c.restore(); }
  c.beginPath(); c.arc(0, 0, 74, 0, Math.PI * 2); const hb = c.createRadialGradient(-20, -20, 5, 0, 0, 74); hb.addColorStop(0, '#c43a50'); hb.addColorStop(1, DC.accent); c.fillStyle = hb; c.fill(); c.lineWidth = 5; c.strokeStyle = '#e9c46a'; c.stroke();
  // the trishula, as it is made: a straight central prong ending in a long leaf-shaped spear blade; two side prongs
  // that leave the collar sideways, sweep out and up, and end in their own spear blades; a lotus collar where the
  // three join; and the damaru tied to the shaft below it with a saffron cloth. (origin = the collar)
  TRISHULA = mk(560, 1360); c = TRISHULA.getContext('2d'); c.translate(280, 520);
  const steel = (x0, y0, x1, y1) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#fffaf0'); g.addColorStop(.5, '#ece2cf'); g.addColorStop(1, '#a3947a'); return g; };
  const edge = () => { c.lineWidth = 3; c.strokeStyle = '#6b4c18'; c.lineJoin = 'round'; c.stroke(); };
  const spear = (len, wid) => { c.beginPath(); c.moveTo(-9, 0); c.bezierCurveTo(-wid * 1.25, -len * .22, -wid * .7, -len * .62, 0, -len); c.bezierCurveTo(wid * .7, -len * .62, wid * 1.25, -len * .22, 9, 0); c.closePath(); c.fillStyle = steel(-wid, -len, wid, 0); c.fill(); edge();
    c.beginPath(); c.moveTo(0, -8); c.lineTo(0, -len + 14); c.lineWidth = 2.5; c.strokeStyle = 'rgba(107,76,24,.75)'; c.stroke(); };
  // side prongs
  for (const d of [-1, 1]) {
    c.beginPath(); c.moveTo(d * 18, -22); c.bezierCurveTo(d * 120, -18, d * 168, -78, d * 166, -196); c.lineTo(d * 144, -196); c.bezierCurveTo(d * 144, -100, d * 104, -50, d * 18, -50); c.closePath(); c.fillStyle = steel(0, -196, d * 170, -20); c.fill(); edge();
    c.save(); c.translate(d * 155, -190); c.rotate(d * .1); spear(150, 30); c.restore();
    c.fillStyle = goldGrad(c, d * 170, -205, d * 140, -190); c.fillRect(d * 155 - 16, -204, 32, 12); c.strokeStyle = '#6b4c18'; c.lineWidth = 2; c.strokeRect(d * 155 - 16, -204, 32, 12); }
  // central prong
  c.beginPath(); c.rect(-10, -230, 20, 210); c.fillStyle = steel(-10, -230, 10, -20); c.fill(); edge();
  c.save(); c.translate(0, -226); spear(230, 44); c.restore();
  c.fillStyle = goldGrad(c, -18, -240, 18, -224); c.fillRect(-18, -240, 36, 14); c.strokeStyle = '#6b4c18'; c.lineWidth = 2; c.strokeRect(-18, -240, 36, 14);
  // lotus collar
  for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * 15 - 10, -14); c.quadraticCurveTo(k * 15, -44 + Math.abs(k) * 4, k * 15 + 10, -14); c.closePath(); c.fillStyle = goldGrad(c, k * 15 - 10, -44, k * 15 + 10, -14); c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#5a3a10'; c.stroke(); }
  c.beginPath(); c.ellipse(0, -6, 54, 18, 0, 0, Math.PI * 2); c.fillStyle = goldGrad(c, -54, -24, 54, 12); c.fill(); c.lineWidth = 3; c.strokeStyle = '#5a3a10'; c.stroke();
  c.beginPath(); c.ellipse(0, 18, 30, 12, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  // shaft, ending in a gold ferrule
  c.fillStyle = steel(-10, 0, 10, 400); c.fillRect(-10, 28, 20, 352); c.strokeStyle = '#6b4c18'; c.lineWidth = 3; c.strokeRect(-10, 28, 20, 352);
  for (const y of [236, 330]) { c.fillStyle = goldGrad(c, -15, y, 15, y + 14); c.fillRect(-15, y, 30, 12); }
  c.beginPath(); c.moveTo(-15, 380); c.lineTo(15, 380); c.lineTo(6, 418); c.lineTo(-6, 418); c.closePath(); c.fillStyle = goldGrad(c, -15, 380, 15, 418); c.fill(); c.lineWidth = 2; c.strokeStyle = '#5a3a10'; c.stroke();
  // the damaru, tied below the collar, with a saffron cloth
  c.save(); c.translate(0, 150);
  c.strokeStyle = '#e8962c'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-6, -64); c.quadraticCurveTo(-60, -40, -70, 30); c.moveTo(6, -64); c.quadraticCurveTo(46, -30, 52, 40); c.stroke();
  c.beginPath(); c.moveTo(-56, -44); c.lineTo(56, -44); c.lineTo(9, 0); c.lineTo(56, 44); c.lineTo(-56, 44); c.lineTo(-9, 0); c.closePath(); const dg = c.createLinearGradient(-56, 0, 56, 0); dg.addColorStop(0, '#5a2a12'); dg.addColorStop(.5, '#a35c2c'); dg.addColorStop(1, '#5a2a12'); c.fillStyle = dg; c.fill(); c.lineWidth = 3; c.strokeStyle = '#2a1206'; c.stroke();
  for (const y of [-44, 44]) { c.beginPath(); c.ellipse(0, y, 56, 11, 0, 0, Math.PI * 2); c.fillStyle = '#f2e8d2'; c.fill(); c.stroke(); }
  c.lineWidth = 2; c.strokeStyle = '#2a1206'; for (const s2 of [-1, 1]) { c.beginPath(); c.moveTo(-50, s2 * 40); c.lineTo(0, s2 * 6); c.lineTo(50, s2 * 40); c.stroke(); }
  c.fillStyle = goldGrad(c, -12, -6, 12, 6); c.fillRect(-12, -6, 24, 12);
  c.restore();
}
function decoGround(c, t, a = 1, rot = 0, cy = 900, k = 1) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = DC.ground; c.fillRect(0, 0, W, H); c.restore();
  c.save(); c.globalAlpha = a; for (let i = 0; i < 48; i++) { const a0 = i / 48 * Math.PI * 2 + rot, a1 = a0 + Math.PI / 48; c.fillStyle = i % 2 ? `rgba(233,196,106,${.075 * k})` : `rgba(233,196,106,${.02 * k})`; c.beginPath(); c.moveTo(CX, cy); c.arc(CX, cy, 1700, a0, a1); c.fill(); } c.restore();
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
function S2(c, t) {   // 4.42–9.5: the wheel and the trident meet: the trident's collar comes to rest on the wheel's hub
  const u = t - T.s2, z = lerp(1.08, 1.0, eio(seg(u, 0, 5))), meet = 3.2, HY = 940;
  c.save(); cam(c, CX, 940, z);
  decoGround(c, t, ss(seg(u, 0, .8)), t * .02, HY); zig(c, eo(seg(u, .2, 1.6)));
  const m = eio(seg(u, .5, meet));
  c.save(); c.translate(lerp(-340, CX, m), HY); c.rotate(t * .22); c.drawImage(CHAKRA, -340, -340); c.restore();
  c.save(); c.translate(lerp(1420, CX, m), HY + 40 * (1 - m)); c.rotate(.12 * (1 - m)); c.drawImage(TRISHULA, -280, -520); c.restore();
  c.restore();
  { const e = 1 - ss(seg(u, 0, .9)); if (e > 0) { fill(c, '#0b0806', e * .92); point(c, CX, 900, lerp(260, 88, e), e); } }
  const sp = seg(u, meet - .1, meet + .2) * (1 - .55 * seg(u, meet + .3, meet + 1.4)); point(c, CX, H / 2 + (HY - 940) * z, 260, sp);
  decoTitle(c, 'CHAKRA  ·  TRISHULA', 300, seg(u, .8, 1.5));
  decoCard(c, 'Two gods. One form.', 1440, seg(u, meet + .3, meet + .9) * (1 - seg(u, 4.7, 5.0)));
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
  const press = (img, px, py, t0, rot = 0) => { const a = seg(u, t0, t0 + .7); if (a <= 0) return; const s = lerp(1.25, 1, eo(a)), tr = 2 * Math.sin(t * 1.7 + px);
    const soft = a < 1, d = soft ? BUF[0].getContext('2d') : x;
    if (soft) { d.setTransform(1, 0, 0, 1, 0, 0); d.globalCompositeOperation = 'source-over'; d.globalAlpha = 1; d.clearRect(0, 0, W, H); cam(d, camX, 960, camZ); }
    d.save(); d.translate(px + tr, py); d.rotate(rot + .006 * Math.sin(t * 1.3 + py)); d.scale(s, s); if (soft) d.filter = `blur(${((1 - eo(a)) * 10).toFixed(2)}px)`; d.drawImage(img, -540, -960); d.filter = 'none'; d.restore();
    if (soft) { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = .25 + .75 * eo(a); x.drawImage(BUF[0], 0, 0); x.restore(); } };
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
  { const a = seg(u, 2.0, 2.5) * (1 - seg(u, 3.0, 3.5)), [qx, qy] = sxy(300, 470); c.save(); c.globalAlpha = a; c.font = 'italic 600 54px "CormorantG"'; c.textAlign = 'center'; c.fillStyle = '#2a120a'; c.fillText('Not Jagannath…', qx, qy); c.restore(); }
  { const a = seg(u, 3.4, 3.9), [lx2, ly2] = sxy(660, 1318); if (a > 0) { c.save(); c.globalAlpha = a; c.font = '700 30px "Cinzel"'; c.letterSpacing = '4px'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText('BALABHADRA').width + 40; c.fillStyle = '#2a1a12'; c.fillRect(lx2 - w / 2, ly2 - 24, w, 48); c.fillStyle = '#ffe7b8'; c.fillText('BALABHADRA', lx2, ly2 + 2); c.restore(); } }
  { const a = seg(u, 3.6, 4.2); if (a > 0) { c.save(); c.globalAlpha = a; c.font = '600 48px "CormorantG"'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText('Why the elder Lord?').width + 90, y = 1440 + 20 * (1 - eo(a));
    c.fillStyle = '#2a0f0a'; c.fillRect(510 - w / 2, y - 42, w, 84); c.strokeStyle = '#c9963a'; c.lineWidth = 2.5; c.strokeRect(510 - w / 2 + 8, y - 34, w - 16, 68); c.fillStyle = '#c43a1e'; c.fillRect(510 + w / 2 - 34, y - 12, 18, 24); c.fillStyle = '#f6e7c8'; c.fillText('Why the elder Lord?', 500, y + 2); c.restore(); } }
  // exit: the lamp gutters down to one flame that splits into two small lights
  const g = ss(seg(u, 4.4, 4.87)); if (g > 0) { fill(c, '#0b0806', g * .96); point(c, CX, 860, 90, .7 * g); }
}

// ======================================== ART DECO · the sunrise dial (S4) ========================================
// Kartika's light (blue) and Monday's light (white) each climb one side of a deco sunrise; the fan panels they pass
// take their colour; on "Harihara" they meet at the zenith and the whole sunrise turns gold.
const DIAL = { cx: CX, cy: 1160, r: 372 };
const dialPos = (a, r = DIAL.r) => [DIAL.cx + Math.cos(a) * r, DIAL.cy + Math.sin(a) * r];
function orb(c, x, y, r, col, core, a) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; for (const [k, aa] of [[3.2, .16], [1.8, .32], [1, .7]]) { const g = c.createRadialGradient(x, y, 0, x, y, r * k); g.addColorStop(0, col.replace('A', aa * a)); g.addColorStop(1, col.replace('A', 0)); c.fillStyle = g; c.fillRect(x - r * k, y - r * k, r * k * 2, r * k * 2); } c.restore(); c.save(); c.globalAlpha = a; c.fillStyle = core; c.beginPath(); c.arc(x, y, r * .3, 0, Math.PI * 2); c.fill(); c.restore(); }
function wordGlow(c, txt, y, a, col, glowCol, sz = 84) { if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = Math.min(1, a); c.font = `400 ${sz}px "Limelight"`; c.letterSpacing = '12px'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = glowCol.replace('A', .95); c.shadowBlur = 50 * a; c.fillStyle = col; c.fillText(txt, 516, y); c.shadowBlur = 18; c.fillText(txt, 516, y); c.shadowBlur = 0; c.restore(); }
function decoFrame(c, p, a) {   // a double keyline with stepped corners
  const L = 74, R = 1006, T0 = 236, B = 1500, st = (o) => { const s = 22 + o; c.moveTo(L + o + s, T0 + o); c.lineTo(R - o - s, T0 + o); c.lineTo(R - o - s, T0 + o + s / 2); c.lineTo(R - o - s / 2, T0 + o + s / 2); c.lineTo(R - o - s / 2, T0 + o + s); c.lineTo(R - o, T0 + o + s);
    c.lineTo(R - o, B - o - s); c.lineTo(R - o - s / 2, B - o - s); c.lineTo(R - o - s / 2, B - o - s / 2); c.lineTo(R - o - s, B - o - s / 2); c.lineTo(R - o - s, B - o); c.lineTo(L + o + s, B - o); c.lineTo(L + o + s, B - o - s / 2); c.lineTo(L + o + s / 2, B - o - s / 2); c.lineTo(L + o + s / 2, B - o - s); c.lineTo(L + o, B - o - s);
    c.lineTo(L + o, T0 + o + s); c.lineTo(L + o + s / 2, T0 + o + s); c.lineTo(L + o + s / 2, T0 + o + s / 2); c.lineTo(L + o + s, T0 + o + s / 2); c.closePath(); };
  c.save(); c.setLineDash([5200 * p, 9000]); gline(c, () => st(0), 3, a); gline(c, () => st(16), 1.2, a); c.restore();
}
function S4(c, t) {   // 14.37–26.32
  const u = t - T.s4, M = T.harihara - T.s4, z = lerp(1.0, 1.04, eio(seg(u, 0, M))) - .03 * eio(seg(u, M, M + 1.2));
  const travel = eio(seg(u, 4.4, M)), aL = Math.PI + travel * Math.PI / 2, aR = 2 * Math.PI - travel * Math.PI / 2, merged = seg(u, M - .05, M + .3), flare = Math.sin(Math.PI * seg(u, M - .05, M + 1.6));
  c.save(); cam(c, CX, 960, z);
  decoGround(c, t, ss(seg(u, 0, 1)), t * .012, DIAL.cy, .7 + .6 * merged);
  decoFrame(c, eo(seg(u, .2, 2.4)), 1);
  // the sunrise: 15 fan panels between two rings
  const show = eo(seg(u, .6, 2.6)), N = 15;
  for (let k = 0; k < N; k++) { const a0 = Math.PI + k / N * Math.PI, a1 = a0 + Math.PI / N, am = (a0 + a1) / 2, vis = seg(show, k / N * .6, k / N * .6 + .4); if (vis <= 0) continue;
    const blue = am < 1.5 * Math.PI && aL >= a1 - .02 && travel > 0 ? seg(aL, a0, a1) : 0, white = am > 1.5 * Math.PI && aR <= a0 + .02 && travel > 0 ? seg(-aR, -a1, -a0) : 0;
    c.save(); c.globalAlpha = vis; c.beginPath(); c.moveTo(...dialPos(a0 + .012, 92)); c.lineTo(...dialPos(a0 + .006, DIAL.r - 40)); c.arc(DIAL.cx, DIAL.cy, DIAL.r - 40, a0 + .006, a1 - .006); c.lineTo(...dialPos(a1 - .012, 92)); c.arc(DIAL.cx, DIAL.cy, 92, a1 - .012, a0 + .012, true); c.closePath();
    const g = c.createRadialGradient(DIAL.cx, DIAL.cy, 92, DIAL.cx, DIAL.cy, DIAL.r - 40); g.addColorStop(0, 'rgba(40,28,14,.95)'); g.addColorStop(1, 'rgba(20,14,8,.95)'); c.fillStyle = g; c.fill();
    const tint = (col, aa) => { if (aa <= 0) return; const g2 = c.createRadialGradient(DIAL.cx, DIAL.cy, 92, DIAL.cx, DIAL.cy, DIAL.r - 40); g2.addColorStop(0, col.replace('A', 0)); g2.addColorStop(1, col.replace('A', aa)); c.fillStyle = g2; c.fill(); };
    tint('rgba(70,130,240,A)', .55 * blue * (1 - merged)); tint('rgba(255,248,232,A)', .5 * white * (1 - merged)); tint('rgba(240,196,100,A)', .6 * merged);
    c.restore(); gline(c, () => { c.moveTo(...dialPos(a0 + .012, 92)); c.lineTo(...dialPos(a0 + .006, DIAL.r - 40)); c.arc(DIAL.cx, DIAL.cy, DIAL.r - 40, a0 + .006, a1 - .006); c.lineTo(...dialPos(a1 - .012, 92)); c.arc(DIAL.cx, DIAL.cy, 92, a1 - .012, a0 + .012, true); c.closePath(); }, 1.6, vis);
    // a small deco chevron in each panel
    gline(c, () => { const [x1, y1] = dialPos(am - .05, DIAL.r - 120), [x2, y2] = dialPos(am, DIAL.r - 92), [x3, y3] = dialPos(am + .05, DIAL.r - 120); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); }, 1.4, vis * .8); }
  c.save(); c.setLineDash([2400 * show, 4000]); gline(c, () => c.arc(DIAL.cx, DIAL.cy, DIAL.r, Math.PI, 2 * Math.PI), 4.5); gline(c, () => c.arc(DIAL.cx, DIAL.cy, DIAL.r - 26, Math.PI, 2 * Math.PI), 1.6); c.restore();
  for (let k = 0; k <= 30; k++) { const a = Math.PI + k / 30 * Math.PI, [x, y] = dialPos(a), [x2, y2] = dialPos(a, DIAL.r - 26), lit = travel > 0 && ((a <= aL + .01) || (a >= aR - .01)), v = seg(u, .8 + k * .045, 1.0 + k * .045);
    c.save(); c.globalAlpha = v; c.strokeStyle = merged > 0 ? '#ffe7a8' : lit ? (a < 1.5 * Math.PI ? '#b9d2ff' : '#ffffff') : 'rgba(233,196,106,.65)'; c.lineWidth = k % 5 ? 2 : 4.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke(); c.restore(); }
  // the hub: a half sun at the centre of the base, and a stepped plinth
  c.save(); c.globalAlpha = show; c.beginPath(); c.arc(DIAL.cx, DIAL.cy, 74, Math.PI, 2 * Math.PI); c.closePath(); c.fillStyle = goldGrad(c, DIAL.cx - 74, DIAL.cy - 74, DIAL.cx + 74, DIAL.cy); c.fill(); c.restore();
  for (let k = 0; k < 3; k++) { const w = 440 - k * 50, y = DIAL.cy + k * 16; c.save(); c.globalAlpha = show; c.fillStyle = '#0d0905'; c.fillRect(DIAL.cx - w, y, w * 2, 16); c.restore(); gline(c, () => { c.moveTo(DIAL.cx - w, y); c.lineTo(DIAL.cx + w, y); }, 1.8, show); }
  // the two lights
  const rise = eio(seg(u, 0, .8)), dropK = eio(seg(u, 1.6, 3.6)), dropM = eio(seg(u, 3.7, 4.6)), [l0x, l0y] = dialPos(Math.PI), [r0x, r0y] = dialPos(2 * Math.PI);
  const [bx, by] = travel > 0 ? dialPos(aL) : u < 1.6 ? [lerp(CX, 516, rise), lerp(860, 420, rise)] : [lerp(516, l0x, dropK), lerp(420, l0y, dropK)];
  const [wx, wy] = travel > 0 ? dialPos(aR) : [lerp(516, r0x, dropM), lerp(560, r0y, dropM)];
  if (travel > 0 && merged < 1) { c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineWidth = 7; c.strokeStyle = `rgba(90,150,255,${.5 * (1 - merged)})`; c.beginPath(); c.arc(DIAL.cx, DIAL.cy, DIAL.r, Math.PI, aL); c.stroke(); c.strokeStyle = `rgba(255,248,230,${.5 * (1 - merged)})`; c.beginPath(); c.arc(DIAL.cx, DIAL.cy, DIAL.r, aR, 2 * Math.PI); c.stroke(); c.restore(); }
  if (merged < 1) { orb(c, bx, by, 44, 'rgba(90,150,255,A)', '#d8e6ff', seg(u, .1, .6) * (1 - merged)); orb(c, wx, wy, 44, 'rgba(255,248,230,A)', '#ffffff', seg(u, 3.1, 3.6) * (1 - merged)); }
  const [tx, ty] = dialPos(1.5 * Math.PI);
  if (merged > 0) { orb(c, tx, ty, 64 + 50 * flare, 'rgba(255,226,160,A)', '#fffdf4', merged);
    c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2 + t * .06, r1 = 90, r2 = 150 + 220 * flare + (k % 2 ? 0 : 90); c.strokeStyle = `rgba(255,236,190,${.38 * merged})`; c.lineWidth = k % 2 ? 1.5 : 2.5; c.beginPath(); c.moveTo(tx + Math.cos(a) * r1, ty + Math.sin(a) * r1); c.lineTo(tx + Math.cos(a) * r2, ty + Math.sin(a) * r2); c.stroke(); } c.restore(); }
  c.restore();
  // words
  const fadeW = 1 - .55 * seg(u, 5.2, 7.2);
  wordGlow(c, 'KARTIKA', 420, seg(u, .4, 1.2) * fadeW, '#a9c8ff', 'rgba(63,127,224,A)');
  wordGlow(c, 'MONDAY', 560, seg(u, 2.9, 3.7) * fadeW, '#ffffff', 'rgba(255,250,235,A)');
  { const a = seg(u, 1.2, 2.0) * fadeW; gline(c, () => { c.moveTo(380, 490); c.lineTo(490, 490); c.moveTo(542, 490); c.lineTo(652, 490); }, 1.4, a); c.save(); c.globalAlpha = a; c.translate(516, 490); c.rotate(Math.PI / 4); c.fillStyle = '#e9c46a'; c.fillRect(-7, -7, 14, 14); c.restore(); }
  decoCard(c, 'A sacred month meets a sacred day.', 1340, seg(u, 5.4, 6.1) * (1 - seg(u, M - .9, M - .4)));
  decoTitle(c, 'HARIHARA', 1340, seg(u, M + .05, M + .6));
  // exit: the one light rises and becomes the sun behind the window
  const g = ss(seg(u, M + .5, 11.95)); if (g > 0) { fill(c, '#0b0806', g * .9); point(c, CX, lerp(H / 2 + (ty - 960) * z, 700, g), 200 + 300 * g, g); }
  { const e = 1 - ss(seg(u, 0, .7)); if (e > 0) point(c, CX, 860, 90, .7 * e); }
}

// ======================================== STAINED GLASS · 32 ornaments (S5) ========================================
const ORN_T = ORN.map((o, i) => 29.6 + i * .155);
function S5(c, t) {
  const u = t - T.s5, push = eio(seg(u, 8.2, 9.08)), z = lerp(lerp(1.14, 1.0, eio(seg(u, 0, 8.2))), 2.4, push), cy = lerp(lerp(1000, 940, eio(seg(u, 0, 8.2))), 1217, push);
  glassScene(c, t, { costume: i => seg(u, .3 + [0, 3, 1, 4, 2, 5][i] * .42, .7 + [0, 3, 1, 4, 2, 5][i] * .42), orn: i => seg(t, ORN_T[i], ORN_T[i] + .35), cx: CX, cy, z, sun: .7 + .3 * ss(seg(u, 0, 1.5)) });
  // each jewel glints as it lands
  c.save(); cam(c, CX, cy, z);
  ORN.forEach((o, i) => { const g = seg(t, ORN_T[i] + .3, ORN_T[i] + .7); if (g > 0 && g < 1) { const x = CX + o.x * .82, y = 860 + o.y * .82; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.sin(Math.PI * g); c.fillStyle = '#fff6d8'; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, r = k % 2 ? 4 : 22; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.fill(); c.restore(); } });
  c.restore();
  const n = ORN_T.filter(x => t >= x + .3).length;
  carved(c, n ? `${n}  ORNAMENT${n > 1 ? 'S' : ''}` : 'PIECE BY PIECE', '700 54px "Cinzel"', 510, 1446, seg(u, 1.0, 1.6) * (1 - seg(u, 8.2, 8.6)));
  { const e = 1 - ss(seg(u, 0, 1.3)); if (e > 0) { fill(c, '#0b0806', e * .9); point(c, CX, 700, 500, e); } }
  // exit: push into the split, white and dark become two paths
  const g = ss(seg(u, 8.55, 9.08)); if (g > 0) fill(c, '#f6e7cc', g * .8);
}

// ======================================== PAPER-CUT LIGHTBOX (S6, S7) ========================================
// Sheets, back to front: sky · far hills · the rekha tower · jagamohana, wall and gate on their hill · two cloud
// sheets (curtains that part in S7) · near hills (the paths are laid on these) · foreground trees.
let LB;
const PATHW = [[-95, 1150], [-95, 1040], [-160, 920], [-330, 800], [-390, 660], [-300, 520], [-170, 400], [-90, 260], [-40, 120], [-12, 30], [0, -14]];
const PATHD = [[95, 1150], [95, 1040], [170, 930], [340, 820], [400, 690], [330, 560], [210, 430], [110, 300], [45, 150], [12, 40], [0, -14]];
const pw = u => 4 + 91 * Math.pow(1 - u, 2.2);
function catmull(P, u) { const n = P.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), l = f - i, p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)];
  const q = (a, b, c2, d) => .5 * (2 * b + (-a + c2) * l + (2 * a - 5 * b + 4 * c2 - d) * l * l + (-a + 3 * b - 3 * c2 + d) * l * l * l); return [q(p0[0], p1[0], p2[0], p3[0]), q(p0[1], p1[1], p2[1], p3[1])]; }
const TB = -90, TH = 480, halfW = y => 126 - 66 * Math.pow(clamp((TB - y) / TH), 2.6);
function buildLightbox() {
  const full = m => m.fillRect(-LW / 2, -LH / 2, LW, LH), TAU = Math.PI * 2;
  const tower = m => {   // rekha deul: curvilinear tower, amalaka, kalasha, Nilachakra, flagstaff
    m.beginPath(); m.moveTo(-120, TB + 40); m.lineTo(-120, TB); for (let k = 0; k <= 24; k++) { const y = TB - TH * k / 24; m.lineTo(-halfW(y), y); } for (let k = 24; k >= 0; k--) { const y = TB - TH * k / 24; m.lineTo(halfW(y), y); } m.lineTo(120, TB + 40); m.closePath(); m.fill();
    const top = TB - TH; m.fillRect(-46, top - 10, 92, 12);
    m.beginPath(); m.ellipse(0, top - 24, 92, 20, 0, 0, TAU); m.fill();
    m.fillRect(-30, top - 50, 60, 20); m.beginPath(); m.ellipse(0, top - 58, 40, 14, 0, 0, TAU); m.fill();
    m.beginPath(); m.arc(0, top - 80, 20, 0, TAU); m.fill(); m.fillRect(-6, top - 106, 12, 16);
    m.beginPath(); m.arc(0, top - 140, 36, 0, TAU); m.fill();
    m.fillRect(-3, top - 270, 6, 100);
  };
  const towerCuts = m => {
    const top = TB - TH;
    m.lineWidth = 3; m.lineCap = 'round'; for (let k = 0; k < 9; k++) { const y = TB - TH * (.3 + k * .075); m.beginPath(); m.moveTo(-halfW(y) + 8, y); m.quadraticCurveTo(0, y + 4, halfW(y) - 8, y); m.stroke(); }
    m.lineWidth = 4; m.beginPath(); m.moveTo(0, TB - TH * .3); m.lineTo(0, TB - TH * .93); m.stroke();
    for (let k = -6; k <= 6; k++) { m.fillRect(k * 13 - 2, top - 34, 4, 20); }
    for (let k = 0; k < 8; k++) { const a0 = k / 8 * TAU + .1, a1 = (k + 1) / 8 * TAU - .1; m.beginPath(); m.arc(0, top - 140, 28, a0, a1); m.arc(0, top - 140, 9, a1, a0, true); m.closePath(); m.fill(); }
  };
  const temple = m => {   // jagamohana (pidha roof in tiers) behind the wall; the Singhadwara gate; the hill they stand on
    m.beginPath(); m.moveTo(-700, 700); m.lineTo(-700, 260); m.bezierCurveTo(-620, 60, -560, -14, -480, -20); m.lineTo(480, -20); m.bezierCurveTo(560, -14, 620, 60, 700, 260); m.lineTo(700, 700); m.closePath(); m.fill();
    m.fillRect(-170, -190, 340, 110);
    for (let k = 0; k < 7; k++) { const w = 196 - k * 21, y = -200 - k * 19; m.fillRect(-w, y, w * 2, 14); m.fillRect(-w + 14, y + 12, (w - 14) * 2, 8); }
    m.beginPath(); m.moveTo(-58, -336); m.quadraticCurveTo(-62, -380, 0, -394); m.quadraticCurveTo(62, -380, 58, -336); m.closePath(); m.fill();
    m.beginPath(); m.arc(0, -404, 13, 0, Math.PI * 2); m.fill(); m.fillRect(-2, -436, 4, 24);
    m.fillRect(-480, -104, 960, 86); m.fillRect(-490, -112, 980, 10);
    m.fillRect(-92, -170, 184, 160); for (let k = 0; k < 3; k++) { const w = 104 - k * 22, y = -186 - k * 16; m.fillRect(-w, y, w * 2, 12); }
    m.beginPath(); m.arc(0, -238, 16, 0, Math.PI * 2); m.fill();
  };
  const templeCuts = m => {
    m.beginPath(); m.moveTo(-34, -18); m.lineTo(-34, -96); m.quadraticCurveTo(0, -142, 34, -96); m.lineTo(34, -18); m.closePath(); m.fill();
    for (const x of [-300, -180, 180, 300]) { m.beginPath(); m.moveTo(x - 10, -40); m.lineTo(x - 10, -70); m.quadraticCurveTo(x, -84, x + 10, -70); m.lineTo(x + 10, -40); m.closePath(); m.fill(); }
    for (let k = 0; k < 6; k++) { const w = 186 - k * 21, y = -186 - k * 19; m.fillRect(-w + 6, y, (w - 6) * 2, 2.5); }
  };
  const cloud = d => m => { const R = mul(d > 0 ? 41 : 42), TAU = Math.PI * 2; m.fillRect(d > 0 ? 70 : -700, -1200, 630, 1180);
    for (let y = -1150; y < -40; y += 95) { const r = 70 + R() * 45; m.beginPath(); m.arc(d * (70 + r * .35) - d * R() * 30, y, r, 0, TAU); m.fill(); }
    for (let x = 90; x < 720; x += 105) { const r = 62 + R() * 50; m.beginPath(); m.arc(d * x, -30 + R() * 30, r, 0, TAU); m.fill(); }
    m.beginPath(); m.arc(d * 120, -40, 110, 0, TAU); m.fill(); };
  LB = [
    sheet('#eaa878', full, { depth: 0, trans: .95 }),
    sheet('#d99a70', m => { m.beginPath(); m.moveTo(-LW / 2, 40); for (let x = -LW / 2; x <= LW / 2; x += 40) m.lineTo(x, -40 - 60 * Math.sin(x / 260 + .6) - 18 * Math.sin(x / 90)); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill(); }, { depth: .2, trans: .7 }),
    sheet('#5a2216', tower, { depth: .36, trans: .35, rim: '#ffd29a', rimA: .9, cut: towerCuts }),
    sheet('#8a4430', temple, { depth: .42, trans: .3, rim: '#ffc98a', rimA: .8, cut: templeCuts }),
    sheet('#f8e2c6', cloud(-1), { depth: .46, trans: .9, rim: '#fff4e0', rimA: .6, shadeA: .2, blur: 14 }),
    sheet('#f4dabb', cloud(1), { depth: .47, trans: .9, rim: '#fff4e0', rimA: .6, shadeA: .2, blur: 14 }),
    sheet('#9a5232', m => { const crest = x => 320 - 60 * Math.sin(x / 300 + 1) - 16 * Math.sin(x / 70); m.beginPath(); m.moveTo(-LW / 2, 360); for (let x = -LW / 2; x <= LW / 2; x += 40) m.lineTo(x, crest(x)); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill();
      for (const [x, h] of [[-610, 1], [-540, .7], [-250, .8], [300, .9], [560, 1.1], [630, .75]]) { const y = crest(x) + 6; m.fillRect(x - 4, y - 46 * h, 8, 46 * h); m.beginPath(); m.ellipse(x, y - 60 * h, 30 * h, 36 * h, 0, 0, Math.PI * 2); m.fill(); m.beginPath(); m.ellipse(x - 16 * h, y - 44 * h, 20 * h, 20 * h, 0, 0, Math.PI * 2); m.ellipse(x + 17 * h, y - 46 * h, 20 * h, 20 * h, 0, 0, Math.PI * 2); m.fill(); } }, { depth: .5, trans: .4 }),
    sheet('#3a1a12', m => { m.beginPath(); m.moveTo(-LW / 2, 1080); for (let x = -LW / 2; x <= LW / 2; x += 30) m.lineTo(x, 1060 - 30 * Math.abs(Math.sin(x / 47)) - 18 * Math.sin(x / 13)); m.lineTo(LW / 2, LH); m.lineTo(-LW / 2, LH); m.fill();
      for (const [x, sgn] of [[-600, 1], [610, -1]]) { m.save(); m.translate(x, 1080); m.scale(sgn, 1); m.fillRect(-10, -440, 20, 440); for (let k = 0; k < 7; k++) { m.beginPath(); m.ellipse(-10 + k * 7, -440 + k * 34, 120 - k * 10, 30, -.35 + k * .12, 0, Math.PI * 2); m.fill(); } m.restore(); } }, { depth: 1, trans: .04 }),
  ];
}
function ribbon(c, P, u1, fillCol, edge, toScr) {   // a path, as a tapering cut-paper ribbon, from its start to u1
  if (u1 <= .001) return; const N = Math.max(8, Math.round(90 * u1)), left = [], right = [];
  for (let i = 0; i <= N; i++) { const u = u1 * i / N, [x, y] = catmull(P, u), [x2, y2] = catmull(P, Math.min(1, u + .004)), [x1, y1] = catmull(P, Math.max(0, u - .004)), dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, w = pw(u) * (i === N ? .6 : 1);
    left.push(toScr(x - dy / l * w, y + dx / l * w)); right.push(toScr(x + dy / l * w, y - dx / l * w)); }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.beginPath(); left.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); right.reverse().forEach(p => c.lineTo(p[0], p[1])); c.closePath();
  c.shadowColor = 'rgba(40,10,6,.5)'; c.shadowBlur = 12; c.shadowOffsetY = 7; c.fillStyle = fillCol; c.fill(); c.restore();
}
function lightboxScene(c, t, camv, prog, o = {}) {
  const part = o.part || 0;
  LB.forEach(l => { l.lit = 1; l.ox = 0; l.oy = 0; l.alpha = 1; });
  LB[4].ox = -760 * eio(part); LB[5].ox = 760 * eio(part); LB[7].oy = o.fgUp ?? 0;
  const scr = (l, x, y) => { const p = .45 + .55 * l.depth, z = 1 + (camv.z - 1) * p; return [W / 2 + z * (x + (l.ox || 0) - camv.x * p), H / 2 + z * (y + (l.oy || 0) - camv.y * p), z]; };
  const [sx, sy, sz] = scr(LB[0], 0, TB - TH - 40);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0c0405'; c.fillRect(0, 0, W, H); c.restore();
  const hills = LB[6], toH = (x, y) => scr(hills, x, y);
  drawStack(c, LB, camv, { x: sx, y: sy + 260, r: 1800, I: (o.I ?? 1) * flick(t) }, {
    after: [
      cc => { cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); glow(cc, sx, sy, 230 * sz, 'rgba(255,214,150,1)', .5 + .3 * (o.temple || 0)); cc.fillStyle = '#fff3d6'; cc.beginPath(); cc.arc(sx, sy, 96 * sz, 0, Math.PI * 2); cc.fill(); cc.restore(); },
      cc => { cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.fillStyle = '#5a2a1c';
        for (let i = 0; i < 6; i++) { const bx = -760 + ((t - 35) * (34 + i * 3) + i * 70) % 1600, by = -260 + i * 34 + 14 * Math.sin(t * .7 + i), [x, y, z] = scr({ depth: .3 }, bx, by), sc = (.8 + .07 * i) * z, f = Math.sin(t * 7 + i * 1.7);
          cc.beginPath(); cc.moveTo(x, y); cc.quadraticCurveTo(x - 10 * sc, y - (6 + 8 * f) * sc, x - 22 * sc, y - (2 + 10 * f) * sc); cc.quadraticCurveTo(x - 10 * sc, y - (1 + 3 * f) * sc, x, y + 3 * sc); cc.quadraticCurveTo(x + 10 * sc, y - (1 + 3 * f) * sc, x + 22 * sc, y - (2 + 10 * f) * sc); cc.quadraticCurveTo(x + 10 * sc, y - (6 + 8 * f) * sc, x, y); cc.fill(); } cc.restore(); },
      cc => { const k = o.temple || 0; if (k <= 0) return; cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); const top = TB - TH; const [nx, ny, nz] = scr(LB[2], 0, top - 140); glow(cc, nx, ny, 70 * nz, 'rgba(255,226,160,1)', .9 * k);
        for (const f of [-.42, 0, .42]) { const [gx, gy, gz] = scr(LB[2], f * 90, TB - TH * .5); glow(cc, gx, gy, 60 * gz, 'rgba(255,200,120,1)', .35 * k); } cc.restore(); },
      cc => { const k = o.temple || 0; cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0);
        // the flag on the Nilachakra, waving
        const top = TB - TH, [fx, fy, fz] = scr(LB[2], 3, top - 268); cc.fillStyle = '#6a2a1c'; cc.beginPath(); cc.moveTo(fx, fy); for (let i = 0; i <= 10; i++) { const q = i / 10; cc.lineTo(fx + q * 96 * fz, fy + (q * 22 + 7 * Math.sin(t * 5 - q * 5) * q) * fz); } for (let i = 10; i >= 0; i--) { const q = i / 10; cc.lineTo(fx + q * 96 * fz, fy + (58 - q * 22 + 7 * Math.sin(t * 5 - q * 5) * q) * fz); } cc.closePath(); cc.fill();
        if (k > 0) { const [gx, gy, gz] = scr(LB[3], 0, -60); glow(cc, gx, gy, 80 * gz, 'rgba(255,214,140,1)', k); } cc.restore(); },
      null, null,
      cc => {   // the two paths and their pilgrims' lamps
        ribbon(cc, PATHW, prog, 'rgba(253,247,232,.97)', 'rgba(150,100,60,.55)', toH);
        ribbon(cc, PATHD, prog, 'rgba(30,24,38,.97)', 'rgba(233,196,106,.8)', toH);
        for (const [P, ph] of [[PATHW, 0], [PATHD, .5]]) for (let k = 0; k < 9; k++) { const u = ((k + ph) / 9 + t * .012) % 1; if (u > prog - .015) continue; const [x, y] = catmull(P, u), [gx, gy, gz] = toH(x, y), r = (3 + pw(u) * .05) * gz;
          glow(cc, gx, gy, r * 4, 'rgba(255,206,130,1)', .55 * flick(t, k)); cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.fillStyle = '#fff4d8'; cc.beginPath(); cc.arc(gx, gy, r, 0, Math.PI * 2); cc.fill(); cc.restore(); }
        if (o.meet > 0) { const [gx, gy, gz] = toH(0, -14); glow(cc, gx, gy, 70 * gz, 'rgba(255,226,170,1)', o.meet); }
      }, null],
  });
}
function paperStrip(c, txt, y, a) { if (a <= 0) return; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.font = 'italic 600 52px "CormorantG"'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText(txt).width + 100, x0 = 510 - w / 2;
  c.beginPath(); c.rect(x0 - 20, y - 60, (w + 40) * eo(a), 120); c.clip(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 16; c.shadowOffsetY = 7; c.fillStyle = '#2a100c'; c.fillRect(x0, y - 44, w, 88); c.shadowColor = 'transparent';
  c.strokeStyle = 'rgba(233,196,106,.7)'; c.lineWidth = 2; c.strokeRect(x0 + 8, y - 36, w - 16, 72); c.fillStyle = '#f7e6cc'; c.fillText(txt, 510, y + 3); c.restore(); }
function S6(c, t) {   // 35.4–41.4: two paths drift apart
  const u = t - T.s6, k = eio(seg(u, 0, 6)), camv = { x: 0, y: lerp(800, 380, k), z: lerp(1.8, 1.45, k) };
  lightboxScene(c, t, camv, lerp(.24, .6, ss(seg(u, 0, 6))), { fgUp: 520 * (1 - eo(seg(u, .3, 2.6))) });
  paperStrip(c, 'Two paths…', 1430, seg(u, 1.2, 1.9) * (1 - seg(u, 5.3, 5.8)));
  const g = 1 - ss(seg(u, 0, .7)); if (g > 0) fill(c, '#f6e7cc', g * .8);
}
function S7(c, t) {   // 41.4–44.6: the clouds part; the paths meet at the gate of the Srimandir
  const u = t - T.s7, b = eio(seg(u, 0, 2.3)), camv = { x: 0, y: lerp(380, 0, b), z: lerp(1.45, 1.0, b) };
  const meet = seg(u, 1.9, 2.4);
  lightboxScene(c, t, camv, lerp(.6, 1, eio(seg(u, 0, 2.0))), { part: seg(u, .15, 2.1), temple: seg(u, 1.9, 2.6), meet: meet * (1 - .4 * seg(u, 2.6, 3.2)), I: 1 + .15 * seg(u, 1.9, 2.6) });
  paperStrip(c, '…one home.', 1430, seg(u, 2.0, 2.6));
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
