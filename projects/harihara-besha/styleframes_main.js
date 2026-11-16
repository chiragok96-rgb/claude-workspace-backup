// Harihara Besha · style frames: stained glass (S1), art deco (S2), shadow puppetry (S3). ?frame=glass|deco|puppet
const W = 1080, H = 1920, Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
const mul = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const mk = () => { const x = document.createElement('canvas'); x.width = W; x.height = H; return x; };
const CX = 540;

// ======================= the deity's geometry (shared by every medium) =======================
// Lord Balabhadra, Puri iconography: seven-hooded serpent canopy, white face, large round eyes, red lips, no arms or legs.
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

// ======================= STAINED GLASS =======================
const GL = { cobalt: '#173a8c', ruby: '#a3172b', gold: '#e2a52a', white: '#eef0e2', smoke: '#241e2c', green: '#3f7a4a', lead: '#17130f' };
function glassPiece(x, fill, path, R, lw = 8) {
  x.save(); x.beginPath(); path(x); x.fillStyle = fill; x.fill(); x.clip();
  // streaks, hue drift and darker edges: every piece is a piece of glass
  const a = R() * Math.PI; x.globalAlpha = .1; x.strokeStyle = R() < .5 ? '#ffffff' : '#000000'; x.lineWidth = 2;
  for (let k = -12; k < 12; k++) { x.beginPath(); x.moveTo(-900 + Math.cos(a) * k * 40, -900 + Math.sin(a) * k * 40); x.lineTo(900 + Math.cos(a) * k * 40 + Math.sin(a) * 1800, Math.sin(a) * k * 40 - Math.cos(a) * 1800); x.stroke(); }
  x.globalAlpha = .18 * R(); x.fillStyle = R() < .5 ? '#ffffff' : '#000000'; x.fill();
  x.restore();
  x.beginPath(); path(x); x.lineWidth = lw; x.strokeStyle = GL.lead; x.lineJoin = 'round'; x.stroke();
}
function grisaille(x, draw, w = 7) { x.save(); x.strokeStyle = 'rgba(52,30,18,.85)'; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); draw(x); x.stroke(); x.restore(); }
function frameGlass() {
  const R = mul(11);
  // stone wall: warm grey ashlar
  c.fillStyle = '#26211c'; c.fillRect(0, 0, W, H);
  for (let r = 0, y = 0; y < H; r++, y += 92) for (let x = -((r % 2) * 80); x < W; x += 160) { { const v = 52 + R() * 10; c.fillStyle = `rgb(${v | 0},${v * .92 | 0},${v * .82 | 0})`; c.fillRect(x + 3, y + 3, 154, 86); } }
  // the lancet window (pointed arch)
  const L = 160, Rt = 920, top = 560, bot = 1330, apex = 330;
  const win = x => { x.moveTo(L, bot); x.lineTo(L, top); x.quadraticCurveTo(L, apex + 40, CX, apex); x.quadraticCurveTo(Rt, apex + 40, Rt, top); x.lineTo(Rt, bot); x.closePath(); };
  c.save(); c.lineWidth = 60; c.strokeStyle = '#4a423a'; c.beginPath(); win(c); c.stroke(); c.restore();     // the splayed embrasure
  const g = mk(), x = g.getContext('2d');
  x.save(); x.beginPath(); win(x); x.clip();
  // background: cobalt lozenge quarries with small ruby and gold touches
  for (let yy = apex - 60; yy < bot + 60; yy += 64) for (let xx = L - 60 + ((yy / 64) % 2) * 52; xx < Rt + 60; xx += 104) {
    const col = R() < .12 ? GL.ruby : R() < .08 ? GL.gold : GL.cobalt;
    glassPiece(x, col, p => { p.moveTo(xx, yy - 64); p.lineTo(xx + 52, yy); p.lineTo(xx, yy + 64); p.lineTo(xx - 52, yy); p.closePath(); }, R, 5);
  }
  // the deity, in glass
  x.translate(CX, 860); x.scale(.82, .82);
  for (let k = 0; k < 7; k++) { const h = G.hood(k); x.save(); x.translate(h.x, h.y); x.rotate(h.a); glassPiece(x, GL.cobalt, G.hoodOuter, R); glassPiece(x, GL.white, G.hoodInner, R, 6); glassPiece(x, GL.gold, p => p.arc(0, 8, 10, 0, 7), R, 4); x.restore(); }
  glassPiece(x, GL.white, G.body, R); x.save(); x.beginPath(); G.body(x); x.clip(); glassPiece(x, GL.smoke, p => p.rect(0, 280, 400, 320), R); x.restore(); x.beginPath(); G.body(x); x.lineWidth = 9; x.strokeStyle = GL.lead; x.stroke();
  for (let r = 0; r < 3; r++) for (let k = 0; k <= 10; k++) { const a = .25 + k / 10 * (Math.PI - .5); glassPiece(x, GL.gold, p => p.arc(Math.cos(a) * (230 - r * 50), 300 + Math.sin(a) * (105 - r * 22), 13 - r * 2, 0, 7), R, 4); }
  glassPiece(x, GL.white, G.face, R, 10); glassPiece(x, GL.gold, G.crown, R, 7);
  for (let k = -5; k <= 5; k++) glassPiece(x, GL.ruby, p => p.arc(k * 44, -214 - (25 - Math.abs(k) * 4) * .9, 8, 0, 7), R, 3);
  glassPiece(x, GL.gold, p => { p.moveTo(-16, -150); p.lineTo(16, -150); p.lineTo(9, -60); p.lineTo(-9, -60); p.closePath(); }, R, 5);
  for (const d of G.eyes) { glassPiece(x, GL.white, p => p.arc(d, -10, 98, 0, 7), R, 11); glassPiece(x, GL.ruby, p => { p.arc(d, -10, 86, 0, 7); p.arc(d, -10, 72, 0, 7, true); }, R, 4); glassPiece(x, '#151018', p => p.arc(d, -10, 50, 0, 7), R, 5); }
  grisaille(x, p => { for (const d of [-1, 1]) { p.moveTo(d * 40, -92); p.quadraticCurveTo(d * 130, -140, d * 225, -92); } }, 11);
  grisaille(x, p => { p.moveTo(2, 62); p.quadraticCurveTo(26, 104, 4, 120); p.lineTo(-12, 116); }, 9);
  glassPiece(x, GL.ruby, G.lips, R, 8);
  for (const d of [-1, 1]) glassPiece(x, GL.gold, p => p.arc(d * 290, 70, 34, 0, 7), R, 6);
  x.restore();
  // ruby border with pearls inside the window edge
  x.save(); x.lineWidth = 34; x.strokeStyle = GL.ruby; x.beginPath(); win(x); x.stroke(); x.lineWidth = 6; x.strokeStyle = GL.lead; x.stroke(); x.restore();
  // backlight: sun from the upper left; the glass glows, bright panes bleed into the lead (irradiation)
  const lit = mk(), lx = lit.getContext('2d'); lx.drawImage(g, 0, 0);
  lx.globalCompositeOperation = 'source-atop'; const sun = lx.createRadialGradient(380, 520, 50, 540, 860, 900); sun.addColorStop(0, 'rgba(255,240,200,.16)'); sun.addColorStop(1, 'rgba(255,220,160,0)'); lx.fillStyle = sun; lx.fillRect(0, 0, W, H);
  c.drawImage(lit, 0, 0);
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .16; c.filter = 'blur(14px)'; c.drawImage(lit, 0, 0); c.restore();
  // shafts of light into the room, with dust
  c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 4; k++) { const gr = c.createLinearGradient(400, 600, 900, 1800); gr.addColorStop(0, 'rgba(255,220,170,0)'); gr.addColorStop(.4, 'rgba(255,220,170,.045)'); gr.addColorStop(1, 'rgba(255,220,170,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(300 + k * 150, 700); c.lineTo(420 + k * 150, 700); c.lineTo(760 + k * 120, 1920); c.lineTo(560 + k * 120, 1920); c.fill(); }
  for (let k = 0; k < 90; k++) { c.fillStyle = 'rgba(255,230,190,.35)'; c.beginPath(); c.arc(300 + R() * 700, 1350 + R() * 500, 1.5 + R() * 2, 0, 7); c.fill(); } c.restore();
  // sill and text carved in stone
  c.fillStyle = '#4e463d'; c.fillRect(110, 1350, 860, 46); c.fillStyle = '#2e2822'; c.fillRect(110, 1396, 860, 10);
  carved('HALF HARA · HALF HARI', '700 50px "Cinzel"', 510, 268);
  carved('Once a year, he wears both gods.', '600 42px "CormorantG"', 510, 1448);
}
function carved(t, font, x, y) { c.save(); c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = '3px'; c.fillStyle = 'rgba(0,0,0,.55)'; c.fillText(t, x + 2, y + 3); c.fillStyle = '#f1e6cf'; c.fillText(t, x, y); c.restore(); }

// ======================= ART DECO =======================
const DC = { ground: '#15100b', ivory: '#f2e8d2', accent: '#7d1426', jewel: '#14584a' };
function goldGrad(x, x0, y0, x1, y1) { const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#6b4a14'); g.addColorStop(.3, '#e9c46a'); g.addColorStop(.5, '#fff1c0'); g.addColorStop(.7, '#e9c46a'); g.addColorStop(1, '#6b4a14'); return g; }
function gline(path, w = 4) { c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.beginPath(); path(); c.lineWidth = w + 2.4; c.strokeStyle = '#2a1a06'; c.stroke(); c.lineWidth = w; c.strokeStyle = goldGrad(c, 0, 0, W, H); c.stroke(); c.lineWidth = .8; c.strokeStyle = 'rgba(255,248,220,.8)'; c.stroke(); c.restore(); }
function frameDeco() {
  c.fillStyle = DC.ground; c.fillRect(0, 0, W, H);
  const cy = 900;
  // sunburst behind everything
  for (let k = 0; k < 48; k++) { const a0 = k / 48 * Math.PI * 2, a1 = a0 + Math.PI / 48; c.fillStyle = k % 2 ? 'rgba(233,196,106,.10)' : 'rgba(233,196,106,.03)'; c.beginPath(); c.moveTo(CX, cy); c.arc(CX, cy, 1400, a0, a1); c.fill(); }
  // stepped arch (ziggurat) frames
  for (let s = 0; s < 3; s++) { const o = s * 34; gline(() => { c.moveTo(170 + o, 1360); c.lineTo(170 + o, 640 + o); c.lineTo(250 + o, 640 + o); c.lineTo(250 + o, 540 + o); c.lineTo(350 + o, 540 + o); c.lineTo(350 + o, 440 + o); c.lineTo(730 - o, 440 + o); c.lineTo(730 - o, 540 + o); c.lineTo(830 - o, 540 + o); c.lineTo(830 - o, 640 + o); c.lineTo(910 - o, 640 + o); c.lineTo(910 - o, 1360); }, s ? 2 : 4); }
  // fan / fish-scale band at the base
  for (let k = 0; k < 9; k++) gline(() => c.arc(205 + k * 84, 1360, 40, Math.PI, 0), 2.4);
  // the wheel (chakra): gold metal volume, burgundy hub, flame rim; arriving from the left
  const wx = CX - 95, tx = CX + 95;
  c.save(); c.translate(wx, cy);
  for (let k = 0; k < 24; k++) { c.save(); c.rotate(k / 24 * Math.PI * 2); c.beginPath(); c.moveTo(-16, -232); c.quadraticCurveTo(0, -290, 16, -232); c.closePath(); c.fillStyle = goldGrad(c, -20, -290, 20, -230); c.fill(); c.restore(); }
  c.beginPath(); c.arc(0, 0, 236, 0, 7); c.fillStyle = goldGrad(c, -236, -236, 236, 236); c.fill();
  c.beginPath(); c.arc(0, 0, 196, 0, 7); const ab = c.createLinearGradient(-196, -196, 196, 196); ab.addColorStop(0, '#2a1d10'); ab.addColorStop(1, '#0d0906'); c.fillStyle = ab; c.fill();
  for (let k = 0; k < 16; k++) { c.save(); c.rotate(k / 16 * Math.PI * 2); c.beginPath(); c.moveTo(-9, 60); c.lineTo(-4, 192); c.lineTo(4, 192); c.lineTo(9, 60); c.closePath(); c.fillStyle = goldGrad(c, -9, 60, 9, 192); c.fill(); c.restore(); }
  c.beginPath(); c.arc(0, 0, 70, 0, 7); const hb = c.createRadialGradient(-20, -20, 5, 0, 0, 70); hb.addColorStop(0, '#c43a50'); hb.addColorStop(1, DC.accent); c.fillStyle = hb; c.fill(); c.lineWidth = 4; c.strokeStyle = '#e9c46a'; c.stroke();
  c.restore();
  // the trident (trishula): ivory blade with gold keylines, arriving from the right; it overlaps the wheel
  c.save(); c.translate(tx, cy);
  const blade = () => { c.moveTo(-8, 430); c.lineTo(-8, -40); c.quadraticCurveTo(-120, -60, -128, -250); c.quadraticCurveTo(-90, -120, -26, -110); c.lineTo(-16, -330); c.lineTo(0, -380); c.lineTo(16, -330); c.lineTo(26, -110); c.quadraticCurveTo(90, -120, 128, -250); c.quadraticCurveTo(120, -60, 8, -40); c.lineTo(8, 430); c.closePath(); };
  c.beginPath(); blade(); const ib = c.createLinearGradient(-130, -380, 130, 430); ib.addColorStop(0, '#fff8e8'); ib.addColorStop(.6, DC.ivory); ib.addColorStop(1, '#b9ab90'); c.fillStyle = ib; c.fill();
  c.restore(); gline(() => { c.save(); c.translate(tx, cy); blade(); c.restore(); }, 3.2);
  // where they meet: a four-point sparkle
  c.save(); c.globalCompositeOperation = 'lighter'; const sp = c.createRadialGradient(CX, cy - 40, 0, CX, cy - 40, 160); sp.addColorStop(0, 'rgba(255,240,190,.9)'); sp.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = sp; c.fillRect(CX - 160, cy - 200, 320, 320);
  c.fillStyle = '#fff6d8'; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 - Math.PI / 2, r = k % 2 ? 9 : 70; c.lineTo(CX + Math.cos(a) * r, cy - 40 + Math.sin(a) * r); } c.fill(); c.restore();
  // title bar (stepped) and subtitle card
  decoTitle('WHEEL  ·  TRIDENT', 268);
  decoCard('Two symbols of two gods meet as one.', 1440);
}
function decoTitle(t, y) {
  c.save(); c.font = '400 58px "Limelight"'; c.letterSpacing = '6px'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText(t).width + 90;
  c.fillStyle = 'rgba(10,7,4,.9)'; c.beginPath(); c.moveTo(510 - w / 2, y - 40); c.lineTo(510 + w / 2, y - 40); c.lineTo(510 + w / 2 + 24, y); c.lineTo(510 + w / 2, y + 40); c.lineTo(510 - w / 2, y + 40); c.lineTo(510 - w / 2 - 24, y); c.closePath(); c.fill(); c.restore();
  gline(() => { c.moveTo(510 - 300, y - 40); c.lineTo(510 + 300, y - 40); }, 2); gline(() => { c.moveTo(510 - 300, y + 40); c.lineTo(510 + 300, y + 40); }, 2);
  c.save(); c.font = '400 58px "Limelight"'; c.letterSpacing = '6px'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = goldGrad(c, 0, y - 30, 0, y + 30); c.fillText(t, 510, y + 2); c.restore();
}
function decoCard(t, y) {
  c.save(); c.font = '600 40px "Josefin"'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText(t).width + 80;
  c.fillStyle = 'rgba(10,7,4,.88)'; c.beginPath(); c.moveTo(510 - w / 2, y - 36); c.lineTo(510 + w / 2, y - 36); c.lineTo(510 + w / 2 + 18, y); c.lineTo(510 + w / 2, y + 36); c.lineTo(510 - w / 2, y + 36); c.lineTo(510 - w / 2 - 18, y); c.closePath(); c.fill();
  c.restore(); gline(() => { c.moveTo(510 - w / 2, y - 36); c.lineTo(510 + w / 2, y - 36); c.lineTo(510 + w / 2 + 18, y); c.lineTo(510 + w / 2, y + 36); c.lineTo(510 - w / 2, y + 36); c.lineTo(510 - w / 2 - 18, y); c.closePath(); }, 2);
  c.save(); c.font = '600 40px "Josefin"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = DC.ivory; c.fillText(t, 510, y + 2); c.restore();
}

// ======================= SHADOW PUPPETRY =======================
const SP = { hide: '#f3e6c8', indigo: '#2c3f86', vermilion: '#c43a1e', ochre: '#d39a36', ink: '#2a1a12', malachite: '#3d7a5a' };
function framePuppet() {
  const R = mul(23);
  // lamp-lit cloth screen
  const scr = mk(), s = scr.getContext('2d');
  s.fillStyle = '#f7ead0'; s.fillRect(0, 0, W, H);
  const lamp = s.createRadialGradient(600, 760, 40, 600, 860, 1100); lamp.addColorStop(0, 'rgba(255,250,236,1)'); lamp.addColorStop(.5, 'rgba(244,222,180,1)'); lamp.addColorStop(1, 'rgba(110,70,40,1)'); s.globalCompositeOperation = 'multiply'; s.fillStyle = lamp; s.fillRect(0, 0, W, H);
  s.globalCompositeOperation = 'source-over'; s.globalAlpha = .06; s.strokeStyle = '#5a3a1a'; for (let y = 0; y < H; y += 4) { s.beginPath(); s.moveTo(0, y + Math.sin(y * .02) * 2); s.lineTo(W, y); s.stroke(); } for (let x = 0; x < W; x += 4) { s.beginPath(); s.moveTo(x, 0); s.lineTo(x + Math.sin(x * .03) * 2, H); s.stroke(); } s.globalAlpha = 1;
  // puppets on their own layer: dyed hide with carved holes, then multiplied onto the lit cloth
  const pu = mk(), p = pu.getContext('2d');
  const piece = (fill, path, cuts) => { const t = mk(), x = t.getContext('2d'); x.beginPath(); path(x); x.fillStyle = fill; x.fill(); x.lineWidth = 4; x.strokeStyle = SP.ink; x.stroke();
    x.globalCompositeOperation = 'source-atop'; x.globalAlpha = .12; for (let k = 0; k < 400; k++) { x.fillStyle = R() < .5 ? '#000' : '#fff'; x.fillRect(R() * W, R() * H, 3 + R() * 12, 1.5); } x.globalAlpha = 1;
    if (cuts) { x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.beginPath(); cuts(x); x.fill(); } p.drawImage(t, 0, 0); };
  // Jagannath's eyes, upper left, crossed out
  for (const d of [-1, 1]) piece(SP.ink, x => x.arc(300 + d * 88, 560, 74, 0, 7), x => { x.arc(300 + d * 88, 560, 60, 0, 7); x.arc(300 + d * 88, 560, 30, 0, 7, true); });
  piece(SP.vermilion, x => { x.save(); x.translate(300, 560); x.rotate(.62); x.rect(-190, -14, 380, 28); x.restore(); });
  piece(SP.vermilion, x => { x.save(); x.translate(300, 560); x.rotate(-.62); x.rect(-190, -14, 380, 28); x.restore(); });
  // Balabhadra, a carved hide puppet (sympathetic figure: open-cut features)
  const ox = 640, oy = 880, sc = .66;
  const T = (x, f) => { x.save(); x.translate(ox, oy); x.scale(sc, sc); f(x); x.restore(); };
  for (let k = 0; k < 7; k++) { const h = G.hood(k); piece(SP.indigo, x => T(x, x => { x.translate(h.x, h.y); x.rotate(h.a); G.hoodOuter(x); }), x => T(x, x => { x.translate(h.x, h.y); x.rotate(h.a); for (let r = 0; r < 3; r++) { x.moveTo(-26 + r * 6, 40 - r * 30); x.arc(0, 40 - r * 30, 26 - r * 6, Math.PI, 0); } })); }
  piece(SP.ochre, x => T(x, G.body), x => T(x, x => { for (let r = 0; r < 3; r++) for (let k = -6; k <= 6; k++) { const xx = k * 48 + (r % 2) * 24, yy = 360 + r * 66; x.moveTo(xx, yy - 14); x.lineTo(xx + 12, yy); x.lineTo(xx, yy + 14); x.lineTo(xx - 12, yy); x.closePath(); } }));
  piece(SP.ink, x => T(x, x => { x.moveTo(0, 300); x.lineTo(330, 300); x.lineTo(360, 570); x.lineTo(0, 570); x.closePath(); }), null);
  piece(SP.hide, x => T(x, G.face), x => T(x, x => { for (const d of G.eyes) { x.moveTo(d + 98, -10); x.arc(d, -10, 98, 0, 7); x.moveTo(d + 86, -10); x.arc(d, -10, 86, 0, 7, true); } x.moveTo(-16, -150); x.lineTo(16, -150); x.lineTo(9, -60); x.lineTo(-9, -60); x.closePath(); }));
  for (const d of G.eyes) piece(SP.ink, x => T(x, x => x.arc(d, -10, 50, 0, 7)));
  piece(SP.ochre, x => T(x, G.crown), x => T(x, x => { for (let k = -5; k <= 5; k++) { x.moveTo(k * 44 + 8, -206); x.arc(k * 44, -206, 8, 0, 7); } }));
  piece(SP.vermilion, x => T(x, G.lips));
  for (const d of [-1, 1]) piece(SP.ochre, x => T(x, x => x.arc(d * 290, 70, 34, 0, 7)), x => T(x, x => x.arc(d * 290, 70, 14, 0, 7)));
  piece(SP.ink, x => T(x, x => { x.moveTo(-130, -80); x.quadraticCurveTo(-128, -120, -40, -100); x.lineTo(-40, -88); x.quadraticCurveTo(-120, -106, -130, -80); x.moveTo(130, -80); x.quadraticCurveTo(128, -120, 40, -100); x.lineTo(40, -88); x.quadraticCurveTo(120, -106, 130, -80); }));
  // rivet + control rod
  p.fillStyle = SP.ink; p.beginPath(); p.arc(ox, oy + 300 * sc, 9, 0, 7); p.fill(); p.fillStyle = '#e9d2a6'; p.beginPath(); p.arc(ox, oy + 300 * sc, 4, 0, 7); p.fill();
  p.strokeStyle = 'rgba(42,26,18,.55)'; p.lineWidth = 5; p.beginPath(); p.moveTo(ox, oy + 300 * sc); p.lineTo(ox + 60, H); p.stroke();
  // compose: lit cloth × hide, warm bloom and vignette
  c.drawImage(scr, 0, 0); c.save(); c.globalCompositeOperation = 'multiply'; c.drawImage(pu, 0, 0); c.restore();
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .12; c.filter = 'blur(18px)'; c.drawImage(scr, 0, 0); c.restore();
  // lacquered stage frame with a carved lintel
  c.fillStyle = '#3a130c'; c.fillRect(0, 0, W, 210); c.fillRect(0, H - 300, W, 300); c.fillRect(0, 0, 60, H); c.fillRect(W - 60, 0, 60, H);
  c.strokeStyle = '#c9963a'; c.lineWidth = 3; c.strokeRect(60, 210, W - 120, H - 510);
  for (let k = 0; k < 14; k++) { c.fillStyle = '#2a0d08'; c.beginPath(); c.arc(80 + k * 72, 210, 30, Math.PI, 0); c.fill(); }
  // label on a rod (cut letters glow) and the storyteller's placard
  rodLabel('BALABHADRA', ox, oy + 600 * sc + 36);
  placard('Why the elder Lord?', 1440);
  c.save(); c.font = '600 54px "CormorantG"'; c.textAlign = 'center'; c.fillStyle = '#3a1a10'; c.globalAlpha = .9; c.fillText('Not Jagannath…', 300, 400); c.restore();
}
function rodLabel(t, x, y) { c.save(); c.font = '700 30px "Cinzel"'; c.letterSpacing = '4px'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText(t).width + 40; c.fillStyle = '#2a1a12'; c.fillRect(x - w / 2, y - 24, w, 48); c.fillStyle = '#ffe7b8'; c.fillText(t, x, y + 2); c.restore(); }
function placard(t, y) {
  c.save(); c.font = '600 48px "CormorantG"'; c.textAlign = 'center'; c.textBaseline = 'middle'; const w = c.measureText(t).width + 90;
  c.fillStyle = '#2a0f0a'; c.fillRect(510 - w / 2, y - 42, w, 84); c.strokeStyle = '#c9963a'; c.lineWidth = 2.5; c.strokeRect(510 - w / 2 + 8, y - 34, w - 16, 68);
  c.fillStyle = '#c43a1e'; c.fillRect(510 + w / 2 - 34, y - 12, 18, 24);
  c.fillStyle = '#f6e7c8'; c.fillText(t, 500, y + 2); c.restore();
}

window.DUR = 1;
window.render = () => { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  ({ glass: frameGlass, deco: frameDeco, puppet: framePuppet })[Q.get('frame') || 'glass'](); };
(async () => { for (const f of ['700 50px "Cinzel"', '600 42px "CormorantG"', '400 58px "Limelight"', '600 40px "Josefin"']) await document.fonts.load(f, 'HALF'); window.render(0); window.READY = true; })();
