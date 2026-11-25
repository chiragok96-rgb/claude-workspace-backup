// The one-take film's new pieces: a perspective camera that tilts between a wall and the ground (so the camera never cuts),
// the temple kitchen's fifty-six pots (8 hearths × 7 pots), the hut where the brothers are fed (and the push into his eye),
// Ananda Bazar from above (rows of devotees eating, the temple's shadow across them), and the palm leaf whose lines they become.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk, scent } from './common.js';
import { flame } from './sc_light.js';
import { dark, glow, lamp, templeDoor, idol } from './sc_temple.js';
import { motherStanding, motherKneeling, setLook } from './sc_people.js';
import { kudua } from './sc_new.js';
import { foot } from './sc_jhoti.js';

// ———————————————— the camera that tilts: a wall (a vertical plane) and the ground in front of it ————————————————
// The wall image is seen flat-on at th = 0 with camY = wallBase - 960, camZ = d - f; the ground image is seen straight down at th = PI/2 with
// camY = f and its centre row at z = zG. Both map 1 : 1 at those ends, so the hand-over to the plain drawing is invisible.
export function pitchView(c, wallImg, groundImg, o) {
  const { th, camY, camZ, f = 1600, d = 1600, wallBase = H, zG = 1200, bg = '#1a100a', wallA = 1, gW = 1080 } = o;
  c.save(); c.fillStyle = bg; c.fillRect(0, 0, W, H); c.imageSmoothingQuality = 'high';
  const cs = Math.cos(th), sn = Math.sin(th), st = 2, wW = wallImg.width;
  for (let y = 0; y < H; y += st) {
    const v = y + st / 2 - 960, dy = -v * cs - f * sn, dz = f * cs - v * sn;
    let sW = Infinity, sG = Infinity, yW = 0, zGh = 0;
    if (dz > 1e-6) { const s = (d - camZ) / dz, yy = camY + s * dy; if (yy >= 0 && yy <= wallBase) { sW = s; yW = yy; } }
    if (dy < -1e-6) { const s = camY / -dy; sG = s; zGh = camZ + s * dz; }
    const groundFirst = sG < sW || wallA < 1;
    if (sG < Infinity && (groundFirst || zGh <= d)) { const row = 960 - (zGh - zG); if (row >= 0 && row < H) { const s = sG; c.globalAlpha = 1; c.drawImage(groundImg, gW / 2 - 540 * s + (groundImg.width - gW) / 2, row, 1080 * s, 1, 0, y, W, st); } }
    if (sW < Infinity && (sW <= sG || zGh > d) && wallA > 0) { const s = sW, row = wallBase - yW; c.globalAlpha = wallA; c.drawImage(wallImg, wW / 2 - 540 * s, row, 1080 * s, 1, 0, y, W, st); }
  }
  c.restore();
}
// the tilt's parameters, from the wall's view (k = 0) to the ground's (k = 1)
export const tiltAt = (k, wallBase = H, zG = 1200, f = 1600, d = 1600) => { const e = eio(k); return { th: e * Math.PI / 2, camY: lerp(wallBase - 960, f, e), camZ: lerp(d - f, zG, e), wallA: 1 - ss(seg(e, .55, .98)), wallBase, zG, f, d }; };

// ———————————————— 0–3.3: the temple kitchen — eight hearths, seven pots on each, landing tier by tier; the count; their steam rising to him ————————————————
export const POT_T = (j, k) => .1 + j * .29 + (k % 4) * .03 + (k > 3 ? .015 : 0);   // when pot j (tier) of tower k lands
// two lines of four towers, receding toward him: depth d = 0 (near) … 3 (far); k < 4 the left line, k ≥ 4 the right
const TOWER = k => { const d = k % 4, sd = k < 4 ? -1 : 1, s = [1, .74, .56, .43][d]; return { x: 540 + sd * 400 * s, y: 800 + 560 * s, s, d }; };
const ODIA = '୦୧୨୩୪୫୬୭୮୯', odia = n => String(n).split('').map(d => ODIA[+d]).join('');
function potSide(c, x, y, r, warm, rim) {   // an earthen kudua from the side, lit from below by the fire
  kudua(c, x, y, r, warm);
  if (rim > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,150,60,${.55 * rim})`; c.lineWidth = r * .09; c.beginPath(); c.ellipse(x, y, r * .97, r * .83, 0, Math.PI * .12, Math.PI * .88); c.stroke(); c.restore(); }
}
// the count, in Odia numerals, steady in the frame: one number at a time, 1 to 56 (chhapana bhoga)
export function potCounter(c, t, n, a) {
  if (a <= 0 || n < 1) return; c.save(); c.globalAlpha *= a; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.translate(540, 372);
  c.font = '700 112px "OdiaSerif"'; c.shadowColor = 'rgba(255,150,60,.55)'; c.shadowBlur = 28; const gg = c.createLinearGradient(0, -96, 0, 0); gg.addColorStop(0, '#fff0c0'); gg.addColorStop(1, '#e0a040'); c.fillStyle = gg; c.fillText(odia(n), 0, 0);
  if (n >= 56) { c.globalCompositeOperation = 'lighter'; c.shadowBlur = 40; c.fillStyle = `rgba(255,210,130,${.35 * Math.exp(-Math.max(0, t - 1.95) * 3)})`; c.fillText(odia(n), 0, 0); c.globalCompositeOperation = 'source-over'; }
  c.shadowBlur = 0; c.font = '600 27px "InterT"'; c.letterSpacing = '10px'; c.fillStyle = `rgba(244,220,160,${ss(seg(t, 1.85, 2.25))})`; c.fillText('CHHAPANA BHOGA', 5, 50); c.restore();
}
export function rosaghara(c, t, o = {}) {
  const { face = 1, rise = 0, faceSil = 0, count = 1, fire = 1, potsA = 1 } = o;
  // the kitchen: a long soot-dark hall, its floor catching the fires
  let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a0504'); g.addColorStop(.42, '#24120a'); g.addColorStop(.6, '#3a1c0e'); g.addColorStop(1, '#0c0604'); c.fillStyle = g; c.fillRect(-W, -H, 3 * W, 3 * H);
  g = c.createRadialGradient(540, 800, 10, 540, 800, 700); g.addColorStop(0, `rgba(255,170,90,${.25 * (.4 + .6 * rise) * face})`); g.addColorStop(1, 'rgba(255,140,60,0)'); c.fillStyle = g; c.fillRect(-W, -H, 3 * W, 3 * H);
  // Jagannath at the end of the hall, lit by the fires and then by the gold of the steam
  if (face > 0) { c.save(); c.globalAlpha *= face; idol(c, t, 540, 640, .55, 'J', { lit: .45 + .55 * rise }); c.restore();
    if (faceSil > 0) { c.save(); c.globalAlpha *= faceSil * face; c.filter = 'brightness(0.06)'; idol(c, t, 540, 640, .55, 'J', { lit: 0 }); c.filter = 'none'; c.restore(); } }
  // the towers, far to near: a hearth, and seven pots landing on it tier by tier
  let n = 0; const order = [3, 7, 2, 6, 1, 5, 0, 4];
  c.save(); c.globalAlpha *= potsA;
  for (const k of order) { const { x, y, s, d } = TOWER(k), haze = 1 - d * .16;
    c.fillStyle = `rgb(${Math.round(58 * haze)},${Math.round(34 * haze)},${Math.round(20 * haze)})`; c.beginPath(); c.roundRect(x - 80 * s, y - 8 * s, 160 * s, 86 * s, 14 * s); c.fill();
    c.fillStyle = '#0a0503'; c.beginPath(); c.ellipse(x, y + 46 * s, 40 * s, 26 * s, 0, Math.PI, 0); c.fill();
    if (fire > 0) { for (let j = 0; j < 3; j++) flame(c, t, x - 18 * s + j * 18 * s, y + 52 * s, (28 + 8 * Math.sin(j + k)) * s * fire, k * 3 + j, .85 * fire); glow(c, x, y + 30 * s, 300 * s, .6 * fire * haze, '255,140,50'); }
    for (let j = 0; j < 7; j++) { const t0 = POT_T(j, k); if (t < t0 - .16) continue; const u = seg(t, t0 - .16, t0), land = t >= t0; if (land) n++;
      const r = (64 - j * 2.2) * s, yRest = y - 34 * s - j * 60 * s, yy = land ? yRest - Math.sin(Math.min(1, (t - t0) / .12) * Math.PI) * 6 * s * Math.exp(-(t - t0) * 9) : yRest - 300 * s * (1 - u * u);
      c.save(); c.globalAlpha *= land ? 1 : u; potSide(c, x, yy, r, (1.05 - j * .04) * haze * (.55 + .45 * fire), (1 - j * .12) * fire); c.restore(); } }
  c.restore();
  // steam from every tower, gathering into one golden stream that rises into him
  c.save(); c.globalCompositeOperation = 'screen';
  for (let k = 0; k < 8; k++) { const done = seg(t, POT_T(6, k), POT_T(6, k) + .4) * potsA; if (done <= 0) continue; const { x, y, s } = TOWER(k), y0 = y - 34 * s - 6 * 60 * s - 50 * s;
    for (let q = 0; q < 5; q++) { const u = (t * .45 + q / 5 + hh(k)) % 1, gx = lerp(x, 540, ss(u) * rise), gy = y0 - u * lerp(260 * s, y0 - 720, rise), al = Math.sin(Math.PI * u) * .22 * done * (1 - .4 * rise) * fire;
      const gr = c.createRadialGradient(gx, gy, 0, gx, gy, (40 + 70 * u) * (.6 + .4 * s)); gr.addColorStop(0, `rgba(255,244,228,${al})`); gr.addColorStop(1, 'rgba(255,244,228,0)'); c.fillStyle = gr; c.fillRect(gx - 130, gy - 130, 260, 260); } }
  c.restore();
  if (rise > 0) { for (const sd of [-1, 1]) { const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([540 + sd * lerp(330, 0, ss(u)) + Math.sin(u * 7 + t * 1.5) * 24 * (1 - u), lerp(880, 690, u)]); } scent(c, pts, t, eo(rise), rise, { w: 1.5 }); } glow(c, 540, 690, 380, .75 * rise, '255,200,110'); }
  return n;
}

// ———————————————— the hut where the brothers are fed (a world 2200 wide): her hearth; then the two of them, seated ————————————————
function mudWall(c, x0, x1) {
  const g = c.createLinearGradient(0, 200, 0, 1300); g.addColorStop(0, '#24120a'); g.addColorStop(1, '#4a2614'); c.fillStyle = g; c.fillRect(x0, -400, x1 - x0, 1700);
  for (let i = 0; i < 2600; i++) { const x = x0 + hh(i * 1.7) * (x1 - x0); c.fillStyle = `rgba(${hh(i) > .5 ? '120,70,40' : '0,0,0'},.07)`; c.fillRect(x, hh(i * 2.9) * 1300, 3, 3); }
}
function deitySeated(c, t, x, y, s, who, o = {}) {   // the wooden form as he is worshipped, seated in the lamplight: the great face, a silk drape falling away into the dark
  const { wide = 0, look = 0 } = o; c.save(); c.translate(x, y); c.scale(s, s);
  const silk = who === 'J' ? ['#a8641a', '#3a1c08'] : ['#7a2a1a', '#2a0c06'];
  let g = c.createLinearGradient(0, 40, 0, 700); g.addColorStop(0, silk[0]); g.addColorStop(.45, silk[1]); g.addColorStop(1, '#0a0504'); c.fillStyle = g;
  c.beginPath(); c.moveTo(-160, 50); c.bezierCurveTo(-210, 200, -270, 420, -310, 700); c.lineTo(310, 700); c.bezierCurveTo(270, 420, 210, 200, 160, 50); c.closePath(); c.fill();
  c.save(); c.clip(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 7; for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(k * 26, 110); c.quadraticCurveTo(k * 48, 400, k * 78, 700); c.stroke(); }
  c.strokeStyle = 'rgba(232,184,80,.55)'; c.lineWidth = 10; c.beginPath(); c.moveTo(-170, 80); c.bezierCurveTo(-80, 150, 80, 150, 170, 80); c.stroke(); c.restore();   // a gold border at the neck
  for (const sd of [-1, 1]) { g = c.createLinearGradient(0, 120, 0, 270); g.addColorStop(0, who === 'J' ? '#2a2024' : '#d8d0c0'); g.addColorStop(1, who === 'J' ? '#0a0608' : '#5a5040'); c.fillStyle = g;
    c.beginPath(); c.moveTo(sd * 150, 150); c.quadraticCurveTo(sd * 280, 136, sd * 300, 196); c.quadraticCurveTo(sd * 306, 246, sd * 250, 250); c.quadraticCurveTo(sd * 190, 250, sd * 150, 240); c.fill(); }   // the arms, held forward
  c.restore();
  idol(c, t, x, y, s, who, { wide, look, lit: 1 });
}
export const HUT = { J: [1480, 860], B: [1840, 900], sJ: .58, sB: .5, POT: [700, 1050] };
export function hut(c, t, o = {}) {
  const { camX = 0, gold = 0, aroma = 0, wide = 0, lakA = 1 } = o;
  c.save(); c.translate(-camX, 0);
  mudWall(c, -200, 2400); c.fillStyle = '#2a160c'; c.fillRect(-200, 1300, 2600, 700); c.fillStyle = 'rgba(255,200,150,.08)'; c.fillRect(-200, 1300, 2600, 3);
  // the chula and its fire; the pot; the steam
  c.fillStyle = '#4a2a16'; c.beginPath(); c.moveTo(520, 1300); c.quadraticCurveTo(530, 1170, 640, 1160); c.lineTo(760, 1160); c.quadraticCurveTo(870, 1170, 880, 1300); c.closePath(); c.fill();
  c.fillStyle = '#0a0503'; c.beginPath(); c.ellipse(700, 1270, 70, 46, 0, Math.PI, 0); c.fill(); for (let k = 0; k < 4; k++) flame(c, t, 660 + k * 26, 1290, 40 + 10 * Math.sin(k), k + 3, .8);
  glow(c, 700, 1250, 520, .9, '255,150,60'); kudua(c, 700, 1110, 82, 1.1);
  c.save(); c.globalCompositeOperation = 'screen'; for (let q = 0; q < 5; q++) { const u = (t * .3 + q / 5) % 1, px = 700 + Math.sin(t * 1.3 + q) * 18 * (1 + u * 2), py = 1030 - u * 420, al = Math.sin(Math.PI * u) * .16;
    const gg = c.createRadialGradient(px, py, 0, px, py, 30 + 50 * u); gg.addColorStop(0, `rgba(255,244,228,${al})`); gg.addColorStop(1, 'rgba(255,244,228,0)'); c.fillStyle = gg; c.fillRect(px - 90, py - 90, 180, 180); } c.restore();
  // a small clay lamp in a niche between her and them
  c.fillStyle = '#140a06'; c.beginPath(); c.moveTo(1080, 900); c.lineTo(1080, 760); c.quadraticCurveTo(1130, 720, 1180, 760); c.lineTo(1180, 900); c.fill(); flame(c, t, 1130, 885, 26, 4, 1); glow(c, 1130, 880, 300, .6);
  // the brothers, seated before banana leaves of rice
  for (const [who, [x, y], s] of [['B', HUT.B, HUT.sB], ['J', HUT.J, HUT.sJ]]) { deitySeated(c, t, x, y, s, who, { wide: who === 'J' ? wide : 0, look: who === 'J' ? -.4 * aroma : -.2 });
    c.fillStyle = '#2e5a1c'; c.beginPath(); c.ellipse(x - 20, 1330, 170 * s / .55, 26, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(200,230,160,.3)'; c.fillRect(x - 170 * s / .55, 1328, 340 * s / .55, 2);
    c.fillStyle = '#f6f0e2'; c.beginPath(); c.ellipse(x - 30, 1318, 60 * s / .55, 16, 0, 0, 7); c.fill(); c.fillStyle = '#e0a438'; c.beginPath(); c.ellipse(x + 60 * s / .55, 1322, 24, 9, 0, 0, 7); c.fill(); }
  glow(c, 1600, 950, 700, .3, '255,170,90');
  // her, in a plain sari, at the hearth
  if (lakA > 0) { setLook({ saree: '#a8742a', sareeD: '#7a5018', border: '#7a1a10' }); motherKneeling(c, 300, 1300, 1.25, { a: lakA, hands: [[260, -170], [290, -150]], lean: .5, glow: 1, glowAt: [300, -200], rimCol: '255,200,130', rimW: 5, shade: .5 }); }
  // the aroma: one golden thread out of her pot, across the hut, to his face
  if (aroma > 0) { const [jx, jy] = HUT.J, pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60, x = lerp(700, jx - 10, u), y = lerp(1000, jy + 10, u) - Math.sin(u * Math.PI) * 360 + Math.sin(u * 9 + t * 2) * 18 * (1 - u); pts.push([x, y]); }
    scent(c, pts, t, Math.min(aroma, 1), 1 - ss(seg(aroma, 1.05, 1.5)), { w: 1.4 }); if (aroma >= 1) glow(c, jx, jy - 20, 260, .6 * (1 - ss(seg(aroma, 1.3, 1.8))), '255,210,120'); }
  if (gold > 0) glow(c, 700, 900, 500, .8 * gold, '255,200,100');
  c.restore();
}
// the right eye of Jagannath in the hut, in screen coordinates for a given camera (camX) and zoom about that eye
export const J_EYE = (wide = 1) => [HUT.J[0] + 68 * HUT.sJ, HUT.J[1] - 104 * HUT.sJ];
export const PUPIL_R = (wide = 1) => (24 + 6 * wide) * HUT.sJ;
// what is in his eye: the fire of her hearth, and her, crowned, in gold
export function inEye(c, t, cx, cy, R, k = 1, lak = true) {
  if (k <= 0 || R < 2) return; c.save(); c.globalAlpha *= k; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip();
  c.fillStyle = '#060304'; c.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  let g = c.createRadialGradient(cx - R * .35, cy + R * .2, 0, cx - R * .35, cy + R * .2, R * .9); g.addColorStop(0, 'rgba(255,150,60,.35)'); g.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = g; c.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  const fs = Math.min(1.5, R * 1.25 / 650); c.restore();
  if (lak) lakshmiGold(c, t, cx, cy + Math.min(R * .55, 470), fs, k, [cx, cy, R]);
}
export function lakshmiGold(c, t, x, y, s, a = 1, clipC = null) {   // Lakshmi as light: crowned, her sari of gold, rim-lit
  if (a <= 0 || s < .02) return; c.save(); if (clipC) { c.beginPath(); c.arc(clipC[0], clipC[1], clipC[2], 0, 7); c.clip(); }
  glow(c, x, y - 330 * s, 700 * s, .9 * a, '255,200,110');
  setLook({ saree: '#e8b040', sareeD: '#a8701c', border: '#fff0c0', crown: true, skin: '#f0c080', skinD: '#c08848' });
  motherStanding(c, x - 20 * s, y, s, { t, a, rimCol: '255,240,200', rimW: 6, glow: 1, glowCol: '255,220,150', shade: .25 });
  c.restore();
}

// ———————————————— Ananda Bazar from above ————————————————
const LOOKS = [   // [cloth, head kind, cap/pallu colour, skin] — muted, as cloth looks in lamplight
  ['#e6dccb', 'shaved', '#e6dccb', '#a06a48'], ['#8a2a22', 'pallu', '#8a2a22', '#8a5236'], ['#d8cfb8', 'gamcha', '#a8402a', '#6a3e28'], ['#2e3c58', 'hair', '#14100c', '#7a4a30'], ['#b8873a', 'pallu', '#b8873a', '#9a6040'],
  ['#efe8dc', 'white', '#e8e4dc', '#8a5a40'], ['#5a6a44', 'pallu', '#5a6a44', '#7a4630'], ['#cfc4ac', 'hair', '#1a120c', '#5a3220'], ['#6a2a3a', 'pallu', '#6a2a3a', '#a06446'], ['#e6dccb', 'shaved', '#e6dccb', '#8a5a3c'], ['#a8582a', 'hair', '#14100c', '#6a3e28'], ['#d8cfb8', 'gamcha', '#3a5a4a', '#7a4630']];
function leaf(c, x, y, ang, s, lod) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  c.fillStyle = '#2c5a20'; c.beginPath(); c.roundRect(-64, -46, 128, 92, 20); c.fill();
  if (lod > .5) { c.strokeStyle = 'rgba(190,230,150,.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-62, 0); c.lineTo(62, 0); c.stroke(); }
  c.fillStyle = '#f4f0e4'; c.beginPath(); c.ellipse(-8, 4, 30, 22, 0, 0, 7); c.fill(); c.fillStyle = '#d89a34'; c.beginPath(); c.arc(30, -18, 12, 0, 7); c.fill(); c.fillStyle = '#4a6a2a'; c.beginPath(); c.arc(32, 20, 10, 0, 7); c.fill();
  c.restore();
}
function diner(c, t, x, y, ang, s, look, i, lod = 1, reach = 0) {   // a person seated cross-legged, seen from above, facing ang, eating from the leaf in front
  const [cloth, kind, hc, skin] = look; c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
  c.fillStyle = 'rgba(30,12,4,.3)'; c.beginPath(); c.ellipse(4, 10, 58, 78, 0, 0, 7); c.fill();   // shadow
  if (lod < .25) { c.fillStyle = cloth; c.beginPath(); c.ellipse(4, 0, 34, 60, 0, 0, 7); c.fill(); c.fillStyle = kind === 'pallu' ? hc : kind === 'white' ? '#e8e4dc' : '#16100c'; c.beginPath(); c.arc(-8, 0, 20, 0, 7); c.fill(); c.restore(); return; }
  c.translate(28 * reach, 0);   // leaning in
  // knees, crossed, in front (in the body's shadow), then the shoulders, wide across
  let g = c.createLinearGradient(-20, 0, 50, 0); g.addColorStop(0, cloth); g.addColorStop(1, shade(cloth, .62)); c.fillStyle = g; c.beginPath(); c.ellipse(26, 0, 26, 62, 0, 0, 7); c.fill();
  g = c.createRadialGradient(-14, -14, 4, -8, 0, 60); g.addColorStop(0, shade(cloth, 1.08)); g.addColorStop(1, shade(cloth, .7)); c.fillStyle = g; c.beginPath(); c.ellipse(-8, 0, 24, 50, 0, 0, 7); c.fill();
  // the eating hand: from the leaf to the mouth and back
  const u = (t * .6 + hh(i) * 3) % 1, e = u < .45 ? ss(u / .45) : u < .6 ? 1 : ss(1 - (u - .6) / .4), hx = lerp(lerp(92, 6, e), 200, reach), hy = lerp(lerp(20, 12, e), 4, reach);
  c.strokeStyle = skin; c.lineCap = 'round'; c.lineWidth = 12; c.beginPath(); c.moveTo(-4 + 20 * reach, 40 - 10 * reach); c.quadraticCurveTo(lerp(lerp(44, 22, e), 110, reach), lerp(44, 30, reach), hx, hy); c.stroke(); c.fillStyle = shade(skin, 1.1); c.beginPath(); c.arc(hx, hy, 8, 0, 7); c.fill();
  // the head
  const hx0 = -6;
  if (kind === 'pallu') { c.fillStyle = hc; c.beginPath(); c.ellipse(hx0 - 4, 0, 24, 22, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(232,192,96,.8)'; c.lineWidth = 3; c.beginPath(); c.arc(hx0 - 4, 0, 22, 2, 4.3); c.stroke(); }
  else if (kind === 'shaved') { g = c.createRadialGradient(hx0 - 4, -6, 2, hx0, 0, 20); g.addColorStop(0, shade(skin, 1.2)); g.addColorStop(1, shade(skin, .8)); c.fillStyle = g; c.beginPath(); c.arc(hx0, 0, 18, 0, 7); c.fill(); c.fillStyle = '#16100c'; c.beginPath(); c.arc(hx0 - 13, 0, 4, 0, 7); c.fill(); }
  else if (kind === 'gamcha') { c.fillStyle = '#16100c'; c.beginPath(); c.arc(hx0, 0, 18, 0, 7); c.fill(); c.strokeStyle = hc; c.lineWidth = 7; c.beginPath(); c.arc(hx0, 0, 16, 0, 7); c.stroke(); }
  else if (kind === 'white') { c.fillStyle = '#ddd8ce'; c.beginPath(); c.arc(hx0, 0, 18, 0, 7); c.fill(); }
  else { g = c.createRadialGradient(hx0 - 4, -5, 2, hx0, 0, 20); g.addColorStop(0, '#3a2a20'); g.addColorStop(1, '#0e0a08'); c.fillStyle = g; c.beginPath(); c.arc(hx0, 0, 18, 0, 7); c.fill(); }
  c.restore();
}
function shade(hex, k) { const n = parseInt(hex.slice(1), 16), r = Math.min(255, (n >> 16) * k), g = Math.min(255, ((n >> 8) & 255) * k), b = Math.min(255, (n & 255) * k); return `rgb(${r | 0},${g | 0},${b | 0})`; }
let STONE;
function stoneTex() { if (STONE) return STONE; STONE = mk(512, 512); const x = STONE.getContext('2d'); x.fillStyle = '#9a7a5a'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(${hh(i) > .5 ? '255,236,210' : '60,40,24'},${.05 + .05 * hh(i * 3)})`; x.fillRect(hh(i * 1.7) * 512, hh(i * 2.3) * 512, 2 + 3 * hh(i * 5), 2 + 3 * hh(i * 7)); }
  x.strokeStyle = 'rgba(50,30,18,.35)'; x.lineWidth = 3; for (let k = 0; k <= 4; k++) { x.beginPath(); x.moveTo(0, k * 128); x.lineTo(512, k * 128); x.stroke(); } for (let r = 0; r < 4; r++) for (let k = 0; k <= 2; k++) { const xx = k * 256 + (r % 2) * 128; x.beginPath(); x.moveTo(xx, r * 128); x.lineTo(xx, r * 128 + 128); x.stroke(); }
  return STONE; }
export const ROWS = [-2100, -1400, -700, 0, 700, 1400, 2100], ROW_X = 6400, TEMPLE = [0, -4600];
// the circle round the one pot: 12 people, first in three groups split by red lines, then — when the lines wash away — one ring
function circleSeat(i, even) { const g = Math.floor(i / 4), m = i % 4, a0 = g * 2.094 + (m - 1.5) * .45 - Math.PI / 2 + 1.047 / 2 * 0, a1 = i / 12 * 6.283 - Math.PI / 2 + .26; return lerp(a0 + .26, a1, even); }
export function feast(c, t, o = {}) {
  const { z = 1, cy = 0, wash = 0, even = 0, linesA = 1, reach = 0, shadowA = 1, dusk = 1, light = 1, vw = 560, steps = 0 } = o;
  c.save(); c.translate(540, 960); c.scale(z, z); c.translate(0, -cy);
  const vx = vw / z + 200, vy = 1000 / z + 200;
  // the courtyard's stone
  c.fillStyle = '#1e0e06'; c.fillRect(-vx, cy - vy, 2 * vx, 2 * vy); c.save(); const pat = c.createPattern(stoneTex(), 'repeat'); c.fillStyle = pat; c.fillRect(-6800, -2600, 13600, 5200); c.fillRect(-1300, -5900, 2600, 3400); c.restore();   // the courtyard, and the temple's platform
  let g = c.createRadialGradient(0, 0, 200, 0, 0, 6000); g.addColorStop(0, `rgba(255,190,110,${.18 * light})`); g.addColorStop(1, 'rgba(40,16,8,.55)'); c.fillStyle = g; c.fillRect(-vx, cy - vy, 2 * vx, 2 * vy);
  // wet floor where the wash has passed
  const rw = 150 + 1500 * eo(wash); if (wash > 0) { c.save(); c.globalAlpha *= .22 * (1 - seg(wash, .7, 1) * .6); c.fillStyle = '#2a1408'; c.beginPath(); c.arc(0, 0, rw, 0, 7); c.fill(); c.restore(); }
  // the rows (pangat): two lines of people facing each other across a line of leaves
  const lod = clamp((z - .08) / .4);
  for (const R of ROWS) { if (Math.abs(R - cy) > vy + 300) continue;
    for (let x = -ROW_X; x <= ROW_X; x += 140) { if (Math.abs(x) > vx + 200) continue; if (R === 0 && Math.abs(x) < 700) continue; if (R < 0 && Math.abs(x - 70) < 100) continue;   // an aisle from the temple door to the circle
      for (const sd of [-1, 1]) { const i = Math.round(x / 140) * 2 + (sd > 0 ? 1 : 0) + R / 7, y = R + sd * 140, ang = sd > 0 ? -Math.PI / 2 : Math.PI / 2;
        leaf(c, x + (hh(i) - .5) * 12, R + sd * 50, 0, .6, lod); diner(c, t, x + (hh(i * 3) - .5) * 18, y, ang, .95, LOOKS[((Math.round(i * 7.3) % 12) + 12) % 12], i, lod); } } }
  // servers walking the aisles with pots of Mahaprasad on their hips
  for (let k = 0; k < 6; k++) { const R = ROWS[k % 8] + 350, x = ((t * 140 * (k % 2 ? 1 : -1) + k * 1700) % 9400 + 9400) % 9400 - 4700; if (Math.abs(x) > vx) continue;
    c.save(); c.translate(x, R); c.fillStyle = 'rgba(20,8,4,.3)'; c.beginPath(); c.ellipse(10, 10, 46, 40, 0, 0, 7); c.fill(); c.fillStyle = '#e8dcc6'; c.beginPath(); c.ellipse(0, 0, 34, 42, 0, 0, 7); c.fill(); c.fillStyle = '#14100c'; c.beginPath(); c.arc(0, 0, 20, 0, 7); c.fill();
    c.fillStyle = '#8a3a1a'; c.beginPath(); c.arc(30, 30, 30, 0, 7); c.fill(); c.fillStyle = '#f4efe2'; c.beginPath(); c.arc(30, 30, 20, 0, 7); c.fill(); c.restore(); }
  // the one pot and the ring round it
  const kd = 150; g = c.createRadialGradient(-30, -30, 10, 0, 0, kd * 1.05); g.addColorStop(0, '#c87a46'); g.addColorStop(1, '#4a1e0c'); c.fillStyle = 'rgba(20,8,4,.35)'; c.beginPath(); c.arc(16, 16, kd, 0, 7); c.fill(); c.fillStyle = g; c.beginPath(); c.arc(0, 0, kd, 0, 7); c.fill();
  g = c.createRadialGradient(-20, -20, 5, 0, 0, kd * .78); g.addColorStop(0, '#fffdf4'); g.addColorStop(1, '#d8ccb0'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, kd * .76, 0, 7); c.fill();
  for (let k = 0; k < 140; k++) { const r = Math.sqrt(hh(k * 1.7)) * kd * .72, an = hh(k * 2.9) * 6.283; c.save(); c.translate(Math.cos(an) * r, Math.sin(an) * r); c.rotate(hh(k) * 6.3); c.fillStyle = 'rgba(255,255,250,.75)'; c.beginPath(); c.ellipse(0, 0, 5, 2, 0, 0, 7); c.fill(); c.restore(); }
  for (let i = 0; i < 12; i++) { const a = circleSeat(i, even), lx = Math.cos(a) * 238, ly = Math.sin(a) * 238; leaf(c, lx, ly, a + Math.PI / 2, .66, lod); }
  for (let i = 0; i < 12; i++) { const a = circleSeat(i, even); diner(c, t, Math.cos(a) * 345, Math.sin(a) * 345, a + Math.PI, 1.05, LOOKS[i], i * 7 + 3, lod, reach); }   // facing the pot; and, once the lines are gone, every hand in the one pot
  if (steps > 0) for (let k = 0; k < 7; k++) foot(c, (k % 2 ? 26 : -26) + 70, -1500 + k * 150, Math.PI / 2, 1.0, k % 2 === 0, ss(clamp(steps * 8 - k)), '255,214,130', .6);   // her steps, in from the temple door
  // the red lines that split them, washed away from the pot outward
  if (linesA > 0) { c.save(); c.globalAlpha *= linesA; c.strokeStyle = '#c4201a'; c.lineWidth = 9; c.lineCap = 'round'; c.setLineDash([2, 16]);
    for (let k = 0; k < 3; k++) { const a = k * 2.094 - Math.PI / 2 + 1.047 + .26 - .26 + .0, r0 = Math.max(170, rw), r1 = 820; const aa = k * 2.094 + 1.047 - Math.PI / 2 + .26 - 1.047 + 1.047; if (r0 >= r1) continue;
      const an = (circleSeat(k * 4 + 3, 0) + circleSeat(((k + 1) % 3) * 4, 0) + (k === 2 ? 6.283 : 0)) / 2; c.beginPath(); c.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); c.lineTo(Math.cos(an) * r1, Math.sin(an) * r1); c.stroke(); }
    c.restore(); }
  if (wash > 0 && wash < 1) { c.save(); c.strokeStyle = `rgba(255,236,200,${.5 * (1 - wash)})`; c.lineWidth = 8 / Math.max(.3, z); c.beginPath(); c.arc(0, 0, rw, 0, 7); c.stroke(); c.restore(); }   // the wet edge
  // steam from the pot
  c.save(); c.globalCompositeOperation = 'screen'; for (let q = 0; q < 5; q++) { const u = (t * .25 + q / 5) % 1, px = Math.sin(t + q) * 40, py = -u * 300, al = Math.sin(Math.PI * u) * .2; const gg = c.createRadialGradient(px, py, 0, px, py, 80 + 80 * u); gg.addColorStop(0, `rgba(255,248,236,${al})`); gg.addColorStop(1, 'rgba(255,248,236,0)'); c.fillStyle = gg; c.fillRect(px - 170, py - 170, 340, 340); } c.restore();
  // lamps along the aisles
  c.save(); c.globalCompositeOperation = 'lighter'; for (const R of ROWS) for (let x = -ROW_X; x <= ROW_X; x += 900) { const yy = R + 350, gg = c.createRadialGradient(x, yy, 0, x, yy, 260); gg.addColorStop(0, 'rgba(255,190,100,.35)'); gg.addColorStop(1, 'rgba(255,160,70,0)'); c.fillStyle = gg; c.fillRect(x - 260, yy - 260, 520, 520); } c.restore();
  // the Srimandir's long shadow across the courtyard at dusk: the curved tower, the wheel on top, the flag
  if (shadowA > 0) templeShadow(c, t, shadowA * dusk);
  // the temple itself, top-left, above the courtyard: its tiered roof seen from the sky
  templeTop(c, t, TEMPLE[0], TEMPLE[1]);
  c.restore();
}
function templeShadow(c, t, a) {
  c.save(); c.globalAlpha *= .5 * a; c.fillStyle = '#1a0a06'; c.translate(TEMPLE[0], TEMPLE[1]); c.rotate(1.3);
  const L = 3900, w0 = 1500; c.beginPath(); c.moveTo(0, -w0 / 2); for (let i = 0; i <= 30; i++) { const u = i / 30; c.lineTo(L * u, -w0 / 2 * (1 - .62 * u ** 2.2)); } c.lineTo(L + 60, -120); c.lineTo(L + 260, -60); c.lineTo(L + 260, 60); c.lineTo(L + 60, 120);
  for (let i = 30; i >= 0; i--) { const u = i / 30; c.lineTo(L * u, w0 / 2 * (1 - .62 * u ** 2.2)); } c.closePath(); c.fill();
  c.lineWidth = 40; c.strokeStyle = '#1a0a06'; c.beginPath(); c.arc(L + 420, 0, 230, 0, 7); c.stroke(); for (let k = 0; k < 8; k++) { const an = k / 8 * 6.283; c.beginPath(); c.moveTo(L + 420, 0); c.lineTo(L + 420 + Math.cos(an) * 230, Math.sin(an) * 230); c.stroke(); }   // the Nilachakra
  c.lineWidth = 22; c.beginPath(); c.moveTo(L + 650, 0); c.lineTo(L + 1100, 0); c.stroke();
  c.beginPath(); c.moveTo(L + 1100, 0); for (let i = 0; i <= 16; i++) { const u = i / 16; c.lineTo(L + 1100 - u * 160 + Math.sin(u * 5 + t * 4) * 50 * u, u * 900); } c.lineTo(L + 900, 920); c.lineTo(L + 980, 0); c.fill();   // the flag
  c.restore();
}
function templeTop(c, t, x, y) {
  c.save(); c.translate(x, y);
  for (let k = 0; k < 9; k++) { const s = 900 - k * 80; c.fillStyle = k % 2 ? '#8a6a4a' : '#7a5a3c'; c.beginPath(); c.roundRect(-s, -s, 2 * s, 2 * s, 80 + k * 20); c.fill(); c.strokeStyle = 'rgba(30,16,8,.4)'; c.lineWidth = 6; c.stroke(); }
  c.strokeStyle = 'rgba(30,16,8,.35)'; c.lineWidth = 5; for (let k = 0; k < 48; k++) { const an = k / 48 * 6.283; c.beginPath(); c.moveTo(Math.cos(an) * 260, Math.sin(an) * 260); c.lineTo(Math.cos(an) * 800, Math.sin(an) * 800); c.stroke(); }
  let g = c.createRadialGradient(-60, -60, 10, 0, 0, 260); g.addColorStop(0, '#c8a070'); g.addColorStop(1, '#5a3a22'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 250, 0, 7); c.fill();   // the amalaka
  for (let k = 0; k < 36; k++) { const an = k / 36 * 6.283; c.strokeStyle = 'rgba(40,20,10,.4)'; c.beginPath(); c.moveTo(Math.cos(an) * 120, Math.sin(an) * 120); c.lineTo(Math.cos(an) * 250, Math.sin(an) * 250); c.stroke(); }
  g = c.createRadialGradient(-20, -20, 4, 0, 0, 110); g.addColorStop(0, '#fff0b0'); g.addColorStop(1, '#a87a20'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 100, 0, 7); c.fill();   // the gilded kalasa
  c.restore();
}

// ———————————————— the palm leaf: the rows of people become the lines of the Lakshmi Purana ————————————————
export const LEAF_LINES = ['॥ ଲକ୍ଷ୍ମୀ ପୁରାଣ ॥ ମାର୍ଗଶିର ଗୁରୁବାର ॥', 'ଶ୍ରିୟା ଘରେ ପାଦ ଦେଲେ ମାତା ଲକ୍ଷ୍ମୀ', 'ମହାପ୍ରସାଦେ ନାହିଁ ଜାତିଭେଦ', 'ସମସ୍ତେ ଖାଇବେ ଏକ ପଙ୍କ୍ତିରେ', '॥ ଇତି ॥'];
let LEAFTEX;
function leafTex() { if (LEAFTEX) return LEAFTEX; LEAFTEX = mk(1200, 320); const x = LEAFTEX.getContext('2d'); let g = x.createLinearGradient(0, 0, 0, 320); g.addColorStop(0, '#c8a468'); g.addColorStop(.5, '#e4c78c'); g.addColorStop(1, '#b48e56'); x.fillStyle = g; x.fillRect(0, 0, 1200, 320);
  for (let j = 0; j < 90; j++) { const y = hh(j * 1.3) * 320; x.strokeStyle = `rgba(${hh(j) > .5 ? '255,240,200' : '110,74,36'},${.12 + .1 * hh(j * 3)})`; x.lineWidth = .6 + hh(j * 5) * 1.4; x.beginPath(); x.moveTo(0, y); x.lineTo(1200, y + (hh(j * 2) - .5) * 4); x.stroke(); }
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(90,56,24,${.05 + .08 * hh(i)})`; x.beginPath(); x.ellipse(hh(i * 3.1) * 1200, hh(i * 4.7) * 320, 20 + 60 * hh(i * 7), 4 + 8 * hh(i * 9), 0, 0, 7); x.fill(); }
  return LEAFTEX; }
// one leaf: centre (cx, cy), width w, height h; k = how much of the writing is there; gold = the middle line lit
export function palmLeafOne(c, t, cx, cy, w, h, o = {}) {
  const { write = 1, gold = 0, a = 1, holes = 1 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a;
  c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.beginPath(); c.roundRect(cx - w / 2, cy - h / 2, w, h, h * .42); c.fillStyle = '#c8a468'; c.fill(); c.restore();
  c.save(); c.beginPath(); c.roundRect(cx - w / 2, cy - h / 2, w, h, h * .42); c.clip(); c.drawImage(leafTex(), cx - w / 2, cy - h / 2, w, h);
  const lh = h / 5.6, fs = lh * .74; c.textAlign = 'center'; c.textBaseline = 'middle';
  LEAF_LINES.forEach((ln, i) => { const y = cy + (i - 2) * lh * 1.0, p = clamp(write * 5 - i * .8); if (p <= 0) return; c.save(); c.beginPath(); c.rect(cx - w / 2, y - lh / 2, w * p, lh); c.clip();
    c.font = `600 ${fs}px "OdiaSerif"`; c.fillStyle = 'rgba(255,240,210,.45)'; c.fillText(ln, cx + 1, y + 1.5);
    if (i === 2 && gold > 0) { c.shadowColor = `rgba(255,170,60,${.9 * gold})`; c.shadowBlur = 22; }
    c.fillStyle = i === 2 && gold > 0 ? `rgb(${Math.round(lerp(42, 150, gold))},${Math.round(lerp(22, 86, gold))},${Math.round(lerp(8, 6, gold))})` : '#2a1608'; c.fillText(ln, cx, y); c.shadowBlur = 0;
    c.restore(); });
  c.restore();
  if (holes) { c.fillStyle = '#2a1608'; for (const hx of [cx - w * .44, cx + w * .44]) { c.beginPath(); c.arc(hx, cy, h * .045, 0, 7); c.fill(); } }
  c.restore();
}
