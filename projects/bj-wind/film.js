// "Kartika Wind" — who opens Bali Jatra? Voice-locked to audio/vo.mp3 (49.0 s); loops (the last frame is the first).
// One thread runs through it: the wind. It weaves the ribbon (Sambalpuri ikat, tied to Javanese batik), turns on the full moon over
// a real map of the Bay of Bengal, fills the Sadhabas' sails, carries the crow of the Saura wall — and in the end, unties the ribbon.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk, load, partial, at } from './common.js';
import { initTextiles, initGate, initSign, gate, ceremonyRibbon, scissors, windThreads, GATE } from './sc_gate.js';
import { initMap, drawMap, wind, m2s, camT, ll, PLACES, ROUTE_BALI, ROUTE_JAVA, ROUTE_SUMATRA, boat, routeLine, batikFlow, placeLabel, moon, compass, isLand, MP } from './sc_map.js';
import { initWord, wordScene, setTargets } from './sc_word.js';
import { initSaura, sauraScene, crowFlight, SB, STRAIGHT } from './sc_saura.js';
import { initHonour, bhavan, odisha, nightSea, silkBoita } from './sc_honour.js';
let DBG_TILE; const WL = document.createElement('canvas'); WL.width = 1080; WL.height = 1920; const WLx = WL.getContext('2d');
const OV = document.createElement('canvas'); OV.width = 1080; OV.height = 1920; const OVx = OV.getContext('2d');
const Q = new URLSearchParams(location.search), cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const DUR = 50.2, T0 = +(Q.get('from') || 0), T1 = Q.get('to') ? +Q.get('to') : DUR; window.DUR = T1 - T0;   // ?from=&to= renders a range (each chunk in a fresh browser)
function zpath(a, b, u) {   // log-zoom on a straight fixed-point path; rotation (4th) lerps
  const z = a[2] * Math.pow(b[2] / a[2], u); let x, y;
  if (Math.abs(Math.log(b[2] / a[2])) > .3) { const f = (1 / z - 1 / b[2]) / (1 / a[2] - 1 / b[2]); x = b[0] + (a[0] - b[0]) * f; y = b[1] + (a[1] - b[1]) * f; } else { x = lerp(a[0], b[0], u); y = lerp(a[1], b[1], u); }
  return a.length > 3 ? [x, y, z, lerp(a[3], b[3], u)] : [x, y, z];
}
const keys = (K, t, first) => { let c = first; for (const [a, b, p, q, e] of K) { if (t >= b) c = q; else if (t > a) return zpath(p, q, (e || eio)(seg(t, a, b))); else return c; } return c; };
const tl = t => (t < 25 ? t : t - DUR);   // the animation clock for things seen at both ends of the loop

// ———————————————— the gate: cameras ————————————————
const C0 = [505, 1096, 2.4], C1 = [540, 1150, 2.15], C2 = [540, 960, 1], C3 = [540, 560, 1.85];
const GK1 = [[5.55, 7.3, C0, C1], [7.75, 10.6, C1, C2], [10.8, 12.7, C2, C3]];
const GK2 = [[42.25, 43.9, C2, C1], [47.55, 49.3, C1, C0]];
function gateCam(t) { return t < 30 ? keys(GK1, t, C0) : keys(GK2, t, C2); }
// ———————————————— the map: cameras (map px, zoom, rotation — the map is turned so Kalinga → Bali runs down the frame) ————————————————
const R = 40 * Math.PI / 180, K = PLACES.kalinga, B = PLACES.bali, CU = PLACES.cuttack;
const MA = [B[0], B[1], 2.8, R], MB = [(K[0] + B[0]) / 2 + 60, (K[1] + B[1]) / 2 - 40, .46, R], MC = [K[0] + 330, K[1] + 330, 1.15, R], MG = [CU[0], CU[1], 3.2, R];
const ME = (() => { const sx = 330, sy = 280, z = .46, c = Math.cos(R), s = Math.sin(R); return [B[0] - (sx * c + sy * s) / z, B[1] - (-sx * s + sy * c) / z, z, R]; })();   // Bali above the subtitles, the fleet arriving from the top
const leadU = t => .02 + .2 * ss(seg(t, 22.6, 27.2));
const lead = t => at(ROUTE_BALI, leadU(t));
function followCam(t) { const [x, y] = lead(t); return [x, y, 1.7, R]; }
function mapCam(t) {
  if (t < 26.9) {
    if (t < 18.6) return zpath(MA, MB, eio(seg(t, 16.45, 18.6)));
    if (t < 20.7) return MB;
    if (t < 22.4) return zpath(MB, MC, eio(seg(t, 20.7, 22.4)));
    const f = followCam(t); return zpath(MC, f, eio(seg(t, 22.9, 24.6)));
  }
  if (t < 39.2) return ME;
  if (t < 40.6) return zpath(ME, MB2, eio(seg(t, 39.2, 40.6)));
  return zpath(MB2, MG, eio(seg(t, 40.6, 42.25)));
}
const MB2 = (() => { const sx = -330, z = MB[2], c = Math.cos(R), s = Math.sin(R); return [MB[0] + (sx * c) / z, MB[1] + (-sx * s) / z, z, R]; })();   // the route on the right, clear of the subtitles
// the fleet: boats on three routes, leaving in turn
const FLEET = Array.from({ length: 7 }, (_, i) => ({ route: [ROUTE_BALI, ROUTE_JAVA, ROUTE_SUMATRA][i % 3], t0: 22.6 + i * .24, sp: .9 + hh(i * 3) * .25, off: (hh(i * 5) - .5) * 60, lead: i === 0 }));
function fleet(c, cam, t, a, solo = 0) {
  for (const f of FLEET) { const u = clamp((t - f.t0) * .055 * f.sp); if (u <= 0) continue; const uu = f.lead ? leadU(t) : u;
    const [x, y] = at(f.route, uu), [x2, y2] = at(f.route, Math.min(1, uu + .01)); const [X, Y] = m2s(cam, x + f.off * .4, y - f.off * .4), [X2] = m2s(cam, x2, y2);
    const al = a * (f.lead ? 1 : 1 - solo) * ss(seg(t, f.t0, f.t0 + .4)); if (al <= 0) continue;
    wake(c, cam, f.route, uu, f.off, al);
    const grow = f.lead ? lerp(1, 3.0, ss(seg(t, 26.35, 27.3))) : 1, ga = f.lead ? 1 - ss(seg(t, 27.0, 27.5)) : 1;   // the lone boat grows into the painted one
    boat(c, X, Y, (1.9 + cam[2] * .35) * grow, al * ga, X2 >= X ? 1 : -1); }
}
function wake(c, cam, route, u, off, a) {   // a gold wake behind a sailing boita
  const pts = []; for (let k = 0; k <= 16; k++) { const uu = Math.max(0, u - k * .0035); const [x, y] = at(route, uu); pts.push(m2s(cam, x + off * .4, y - off * .4)); }
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; for (let k = 0; k < 16; k++) { c.strokeStyle = `rgba(255,214,150,${a * .55 * (1 - k / 16)})`; c.lineWidth = 3.4 * (1 - k / 20); c.beginPath(); c.moveTo(...pts[k]); c.lineTo(...pts[k + 1]); c.stroke(); } c.restore();
}
// ———————————————— captions: Cormorant Garamond, one gold italic word; only in calm bands (baseline ≤ 1470) ————————————————
const CAPS = [
  [.15, 1.9, ['For the first time in *history*,'], 'night'],
  [2.0, 4.3, ['Bali Jatra will be opened', 'by the *President*—'], 'night'],
  [4.35, 5.65, ['a *daughter* of Odisha.'], 'night'],
  [5.7, 7.9, ['And with her comes *Indonesia*.'], 'night'],
  [8.0, 11.0, ['Why such *honour*', 'for one fair?'], 'night'],
  [11.2, 13.2, ['The answer hides in its *name*.'], 'night'],
  [13.3, 14.6, ['Bali Jatra means—'], 'night'],
  [14.65, 16.4, ['a *journey* to the island of Bali.'], 'night'],
  [16.45, 18.0, ['A thousand years ago,'], 'map'],
  [18.0, 20.75, ['on Kartika Purnima,', 'the *wind* changed direction.'], 'map'],
  [20.85, 24.55, ['On that wind, Kalinga’s *Sadhabas*', 'set sail in their boitas.'], 'map'],
  [24.7, 27.0, ['Lost at *sea*?'], 'map'],
  [27.1, 30.6, ['It is said, a *crow*', 'was set free from the boita.'], 'wall'],
  [30.8, 32.95, ['If the crow came back—', 'the shore was *far*.'], 'wall'],
  [33.1, 35.7, ['If it didn’t…', 'the shore lay *that way*!'], 'wall'],
  [35.9, 38.75, ['The island our boitas', 'once sailed to…'], 'map'],
  [38.85, 42.1, ['today, that island’s country', 'comes to *Cuttack* itself.'], 'map'],
  [42.25, 44.45, ['This year, the *President*', 'opens the fair.'], 'night'],
  [44.55, 47.45, ['But for a thousand years,', 'Bali Jatra was opened by…'], 'night'],
  [47.55, 49.75, ['*the Kartika wind.*'], 'night'],
];
const CL = { night: ['#f6ead6', 'rgba(8,3,2,.85)', '#f0c672'], map: ['#f4ead8', 'rgba(2,6,8,.85)', '#f0c672'], wall: ['#fbf3e6', 'rgba(40,10,4,.8)', '#ffd890'] };
function capLine(c, ln, y, look, sz = 1) {
  const [col, halo, gold] = CL[look]; const parts = ln.split('*'), solo = parts.length === 3 && !parts[0] && !parts[2];
  const fnt = j => j % 2 ? `italic 600 ${Math.round((solo ? 72 : 56) * sz)}px "CormorantG"` : `600 ${Math.round(52 * sz)}px "CormorantG"`;
  c.letterSpacing = '0.5px'; const ws = parts.map((p, j) => { c.font = fnt(j); return c.measureText(p).width; }); let x = 540 - ws.reduce((a, b) => a + b, 0) / 2;
  parts.forEach((p, j) => { if (!p) return; c.font = fnt(j); c.fillStyle = j % 2 ? gold : col; c.shadowColor = halo; c.shadowBlur = 10; c.shadowOffsetY = 1.5; c.fillText(p, x, y); c.shadowBlur = 3; c.shadowOffsetY = 0; c.fillText(p, x, y); c.shadowBlur = 0; c.fillText(p, x, y); x += ws[j]; });
}
function captions(c, t) {
  if (Q.get('cap') === '0') return;
  for (const [a, b, lines, look] of CAPS) { const k = ss(seg(t, a - .05, a + .3)) * (1 - ss(seg(t, b - .28, b + .02))); if (k <= 0) continue;
    c.save(); c.globalAlpha = k; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; const dy = (1 - eo(seg(t, a - .05, a + .5))) * 10;
    lines.forEach((ln, i) => capLine(c, ln, 1452 - (lines.length - 1 - i) * 62 + dy, look)); c.restore(); }
}
function title(c, t) {   // the hook: ଇତିହାସରେ ପ୍ରଥମ ଥର, stamped in gold above the ribbon
  const k = ss(seg(t, .15, .55)) * (1 - ss(seg(t, 2.3, 2.8))); if (k <= 0) return;
  c.save(); c.globalAlpha = k; c.textAlign = 'center'; c.textBaseline = 'middle'; const dy = (1 - eo(seg(t, .15, .9))) * 16;
  c.font = '600 26px "Cinzel"'; c.letterSpacing = '9px'; c.fillStyle = 'rgba(255,226,170,.9)'; c.shadowColor = 'rgba(0,0,0,.8)'; c.shadowBlur = 12; c.fillText('FOR THE FIRST TIME', 544, 330 + dy);
  c.letterSpacing = '0px'; c.font = '700 92px "OdiaSerif"'; const g = c.createLinearGradient(0, 400, 0, 500); g.addColorStop(0, '#fff0c4'); g.addColorStop(.5, '#e8b04e'); g.addColorStop(1, '#b07a24');
  c.shadowColor = 'rgba(0,0,0,.85)'; c.shadowBlur = 18; c.fillStyle = g; c.fillText('ଇତିହାସରେ ପ୍ରଥମ ଥର', 540, 446 + dy); c.restore();
}

// ———————————————— scenes ————————————————
function gateScene(c, t) {
  const tg = tl(t), cam = gateCam(t), [cx, cy, z] = cam;
  c.setTransform(z, 0, 0, z, 540 - cx * z, 960 - cy * z);
  gate(c, tg, 1, z);
  const end = t > 30;
  const k = end ? 1 : eio(seg(t, .3, 1.75));
  const j = end ? 1 : eo(seg(t, 5.8, 6.95)), bow = end ? 1 : ss(seg(t, 6.7, 7.45));
  const gust = end ? lerp(.15, 1, ss(seg(t, 44.8, 47.5))) * (1 - ss(seg(t, 48.4, 49.4))) : .15;
  const untie = end ? ss(seg(t, 47.6, 48.75)) : 0;
  const ts = end ? ss(seg(t, 44.7, 45.9)) : 0, back = end ? ss(seg(t, 49.0, 50.0)) : 0;   // time rolls back to a moonlit sea; at the very end, back to the opening dark
  const drawRibbon = () => { c.setTransform(z, 0, 0, z, 540 - cx * z, 960 - cy * z); if (!end || untie < 1) ceremonyRibbon(c, tg, { k, j, bow, untie, gust }); c.setTransform(1, 0, 0, 1, 0, 0); };
  if (!end) drawRibbon();
  // the scissors: in on "Rashtrapati", away before Indonesia arrives; in the end they come again, and wait
  let sa = 0, sx = 0, op = .5;
  if (!end) { sa = ss(seg(t, 2.55, 3.0)) * (1 - ss(seg(t, 5.6, 6.1))); sx = lerp(780, 640, eo(seg(t, 2.55, 3.4))) + ss(seg(t, 5.6, 6.1)) * 200; op = .45 + .25 * Math.sin(t * 2.4); }
  else { sa = ss(seg(t, 43.0, 43.5)) * (1 - ss(seg(t, 44.9, 45.6))); sx = lerp(820, 676, eo(seg(t, 43.0, 43.9))) + ss(seg(t, 44.9, 45.6)) * 260; op = .65 - .3 * ss(seg(t, 44.4, 45.0)); }
  if (sa > 0) scissors(c, sx, end ? 1100 : 1060, .95, -.42 + (end ? .05 * Math.sin(t * 3) * ss(seg(t, 45, 46)) : 0), op, sa);
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (end) { bhavan(c, tg, eio(seg(t, 43.1, 44.1)), ss(seg(t, 43.1, 43.4)) * (1 - ss(seg(t, 44.5, 45.1))), 540, 520, .82);   // "this year, the President"
    nightSea(c, tg, ts * (1 - back)); drawRibbon();
    const open = seg(t, 47.65, 48.7); if (open > 0) { const go = eio(seg(t, 48.45, 49.95)); silkBoita(c, tg, lerp(540, 850, go), lerp(1290, 1212, go), lerp(1, .26, go), open, ss(seg(t, 47.62, 47.95)) * (1 - ss(seg(t, 49.35, 49.95)))); } }   // the silks become sails
  // the wind, always there; in the end it rises and takes the ribbon
  const yR = (GATE.ribY - cy) * z + 960;
  const wa = end ? lerp(.22, 1, ss(seg(t, 44.8, 48.0))) : lerp(1, .22, ss(seg(t, 1.3, 2.6)));
  windThreads(c, tl(t), wa, { conv: end ? 0 : ss(seg(t, .2, 1.6)) * (1 - ss(seg(t, 1.6, 2.6))), yR, gust: end ? lerp(.5, 1.2, ss(seg(t, 45, 48))) * (1 - ss(seg(t, 48.6, 49.6))) + .5 * ss(seg(t, 48.6, 49.6)) : .5 });
  if (!end) { const f = Math.exp(-Math.pow((t - 1.75) / .2, 2)); if (f > .01) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(540, yR, 0, 540, yR, 760); g.addColorStop(0, `rgba(255,224,160,${.5 * f})`); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); } }   // the ribbon snaps into being
  if (end) { const b = Math.exp(-Math.pow((t - 47.9) / .35, 2)); if (b > .01) { c.save(); c.globalCompositeOperation = 'lighter'; const [bx, by] = [(GATE.bowX - cx) * z + 540, (GATE.bowY - cy) * z + 960]; const g = c.createRadialGradient(bx, by, 0, bx, by, 700); g.addColorStop(0, `rgba(255,220,150,${.45 * b})`); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); } }
}
function mapScene(c, t) {
  const cam = mapCam(t);
  const lost = t < 30 ? ss(seg(t, 24.6, 26.6)) : 0;
  drawMap(c, cam, 1, lost * .93);
  const turn = ss(seg(t, 19.6, 20.6));
  wind(c, cam, t, turn, (t < 30 ? (1 - lost * .35) : .55), { speed: 1 + 1.2 * Math.sin(Math.PI * seg(t, 19.6, 20.6)), chaos: lost });
  const main = c; c = OVx; c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H);   // routes, boats, labels: on their own layer, kept clear of the subtitles
  if (t < 30) {
    moon(c, 820, 330, 62, ss(seg(t, 17.85, 18.5)) * (1 - ss(seg(t, 20.8, 21.6))), 'କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମା');
    compass(c, 170, 300, 46, -R, ss(seg(t, 16.8, 17.5)) * (1 - ss(seg(t, 24.4, 25.2))) * .8);
    placeLabel(c, cam, PLACES.bali, 'ବାଲି', ss(seg(t, 16.3, 16.9)) * (1 - ss(seg(t, 20.6, 21.2))), { size: 46 });
    placeLabel(c, cam, PLACES.kalinga, 'କଳିଙ୍ଗ', ss(seg(t, 21.9, 22.5)) * (1 - ss(seg(t, 24.6, 25.4))), { size: 50, dx: -30, dy: -64, align: 'right' });
    if (t > 16.2 && t < 22.6) { const [x, y] = at(ROUTE_BALI, .972), [X, Y] = m2s(cam, x, y); boat(c, X, Y, 1.9 + cam[2] * .35, ss(seg(t, 16.25, 16.8)) * (1 - ss(seg(t, 18.4, 19.2))), 1); }   // the word's boat, now on the sea
    fleet(c, cam, t, 1, lost);
    if (t > 24.5) { const [x, y] = lead(t), [X, Y] = m2s(cam, x, y);
      c.save(); for (let k = 0; k < 9; k++) { const fx = (hh(k * 3) * 1400 - 160 + t * (30 + 40 * hh(k))) % 1400 - 160, fy = 300 + hh(k * 7) * 1300, r = 260 + hh(k * 5) * 260; const g = c.createRadialGradient(fx, fy, 0, fx, fy, r); g.addColorStop(0, `rgba(120,134,130,${.13 * lost})`); g.addColorStop(1, 'rgba(120,134,130,0)'); c.fillStyle = g; c.fillRect(fx - r, fy - r, r * 2, r * 2); } c.restore();   // fog
      compass(c, X, Y, 270, Math.sin(t * 2.3) * 1.6 + Math.sin(t * 5.3) * .5 + t * .9, lost * .85);   // a compass that will not settle
      c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(X, Y, 0, X, Y, 170); g.addColorStop(0, `rgba(255,200,120,${.22 * lost})`); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(X - 170, Y - 170, 340, 340); c.restore(); }
  } else {
    compass(c, 170, 300, 46, -R, ss(seg(t, 36.0, 36.6)) * (1 - ss(seg(t, 40.6, 41.2))) * .8);
    const rp = eio(seg(t, 35.9, 37.9));
    routeLine(c, cam, ROUTE_BALI, rp, 1 - ss(seg(t, 38.8, 39.4)) * .6); routeLine(c, cam, ROUTE_JAVA, rp, (1 - ss(seg(t, 38.6, 39.2))) * .7); routeLine(c, cam, ROUTE_SUMATRA, rp, (1 - ss(seg(t, 38.6, 39.2))) * .7);
    for (const [r, i] of [[ROUTE_BALI, 0], [ROUTE_JAVA, 1], [ROUTE_SUMATRA, 2]]) { const u = eio(seg(t, 36.0 + i * .12, 38.2 + i * .1)); if (u <= 0) continue; const [x, y] = at(r, u), [X, Y] = m2s(cam, x, y); wake(c, cam, r, u, 0, 1 - ss(seg(t, 38.7, 39.3))); boat(c, X, Y, 2.0, (1 - ss(seg(t, 38.7, 39.3))), 1); }
    placeLabel(c, cam, PLACES.bali, 'ବାଲି', ss(seg(t, 37.7, 38.2)) * (1 - ss(seg(t, 39.4, 39.9))), { size: 46, dx: -24, align: 'right' });
    placeLabel(c, cam, PLACES.java, 'ଜାଭା', ss(seg(t, 37.8, 38.3)) * (1 - ss(seg(t, 38.8, 39.3))), { size: 40, dx: -22, align: 'right' });
    placeLabel(c, cam, PLACES.sumatra, 'ସୁମାତ୍ରା', ss(seg(t, 37.5, 38.0)) * (1 - ss(seg(t, 38.8, 39.3))), { size: 40, dx: -22, align: 'right' });
    batikFlow(c, cam, ROUTE_BALI, eio(seg(t, 39.2, 41.1)), t, ss(seg(t, 39.1, 39.4)) * (1 - ss(seg(t, 41.15, 41.7))));
    placeLabel(c, cam, PLACES.bali, 'ଇଣ୍ଡୋନେସିଆ', ss(seg(t, 39.6, 40.1)) * (1 - ss(seg(t, 40.3, 40.8))), { size: 46, dx: -24, align: 'right' });
    placeLabel(c, cam, PLACES.cuttack, 'କଟକ', ss(seg(t, 40.9, 41.3)), { size: 54 });
  }
  c.save(); c.globalCompositeOperation = 'destination-out'; c.filter = 'blur(18px)'; c.fillStyle = '#000'; c.beginPath(); c.roundRect(150, 1336, 780, 146, 50); c.fill(); c.restore();
  main.drawImage(OV, 0, 0);
}
// ———————————————— the frame ————————————————
window.render = t0 => { const t = t0 + T0;
  if (Q.get('dbg')) { const step = Q.get('dbg'), cam = mapCam(t); ctx.setTransform(1, 0, 0, 1, 0, 0); if (step === 'map') drawMap(ctx, cam, 1, 0); if (step === 'wind') wind(ctx, cam, t, 0, 1, {}); if (step === 'tile') ctx.drawImage(DBG_TILE, 0, 0); return; }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  try {
    if (t < 12.95 || t >= 41.8) gateScene(ctx, t);
    if (t >= 41.8 && t < 42.6) { const k = 1 - ss(seg(t, 41.9, 42.55)); ctx.save(); ctx.globalAlpha = k; mapScene(ctx, t); ctx.restore(); }   // Cuttack's light opens into the gate
    if (t >= 12.2 && t < 17.0) { const a = ss(seg(t, 12.25, 12.9)) * (1 - ss(seg(t, 16.3, 16.95))); if (t >= 16.2) mapScene(ctx, t); wordScene(ctx, t, a); }
    if (t >= 17.0 && t < 27.95) mapScene(ctx, t);
    if (t >= 25.9 && t < 36.4) {   // the boat's lamp swells into firelight; in it, the tale is painted on a Saura wall
      const w = ss(seg(t, 26.6, 27.95)), out = ss(seg(t, 35.45, 36.3)), opts = { reveal: ss(seg(t, 26.9, 28.3)), shore: ss(seg(t, 34.4, 35.2)) };
      if (t < 26.6) { const f = Math.exp(-Math.pow((t - 27.0) / .4, 2)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createRadialGradient(SB.x, SB.y, 0, SB.x, SB.y, 900); lg.addColorStop(0, `rgba(255,200,120,${.45 * f})`); lg.addColorStop(1, 'rgba(255,160,80,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H); ctx.restore(); }   // the lamp begins to swell
      else if (t < 27.95) { const x = WLx; x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.clearRect(0, 0, W, H); sauraScene(x, t, opts); crowFlight(x, t);
        x.globalCompositeOperation = 'destination-in'; const R = lerp(20, 2000, w) * (1 + .03 * Math.sin(t * 13)), g = x.createRadialGradient(SB.x, SB.y, 0, SB.x, SB.y, R); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(clamp(1 - 460 / R, 0, .98), 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over';
        ctx.drawImage(WL, 0, 0); const f = Math.exp(-Math.pow((t - 27.0) / .4, 2)); if (f > .01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createRadialGradient(SB.x, SB.y, 0, SB.x, SB.y, 900); lg.addColorStop(0, `rgba(255,200,120,${.45 * f})`); lg.addColorStop(1, 'rgba(255,160,80,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
      else { ctx.save(); ctx.globalAlpha = 1 - out; sauraScene(ctx, t, opts); crowFlight(ctx, t); ctx.restore(); }
    }
    if (t >= 35.45 && t < 42.6) { const a = ss(seg(t, 35.45, 36.3)); ctx.save(); ctx.globalAlpha = a; if (t < 41.8) mapScene(ctx, t); ctx.restore();
      if (t < 36.6) { const m = eio(seg(t, 35.45, 36.4)), cam = mapCam(t); const pts = STRAIGHT.map(([x, y], i) => { const [rx, ry] = at(ROUTE_BALI, i / (STRAIGHT.length - 1)), [X, Y] = m2s(cam, rx, ry); return [lerp(x, X, m), lerp(y, Y, m)]; });   // the crow's line becomes the sea route
        ctx.save(); ctx.globalAlpha = 1 - ss(seg(t, 36.2, 36.6)); ctx.fillStyle = 'rgba(246,238,222,.95)'; for (const [x, y] of pts) { ctx.beginPath(); ctx.arc(x, y, 3.6, 0, 7); ctx.fill(); } ctx.restore(); }
    }
    if (t >= 41.6 && t < 42.7) { const f = Math.exp(-Math.pow((t - 42.05) / .28, 2)); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(540, 960, 0, 540, 960, 1100); g.addColorStop(0, `rgba(255,226,170,${.9 * f})`); g.addColorStop(1, `rgba(255,190,110,${.25 * f})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (t < 6.3) { bhavan(ctx, t, eio(seg(t, 3.05, 4.1)), ss(seg(t, 3.05, 3.3)) * (1 - ss(seg(t, 4.25, 4.65))), 540, 700, .98);   // "Rashtrapati"
      odisha(ctx, t, eio(seg(t, 4.3, 5.05)), ss(seg(t, 4.85, 5.4)), ss(seg(t, 4.25, 4.5)) * (1 - ss(seg(t, 5.7, 6.2))), 540, 560, 600); }   // "— Odishara jhia"
    if (t < 3) title(ctx, t);
    captions(ctx, t);
  } catch (e) { console.error('RENDER ' + e.stack); throw e; }
};
(async () => {
  for (const f of ['600 26px "Cinzel"', 'italic 600 56px "CormorantG"', '600 52px "CormorantG"', '700 92px "OdiaSerif"', '600 40px "OdiaSerif"']) await document.fonts.load(f, f.includes('Odia') ? 'ବାଲିଯାତ୍ରାଇତିହାସରେପ୍ରଥମଥରକଳିଙ୍ଗ' : 'Aa');
  const base = new URL('.', import.meta.url).href;
  const land = new Uint8Array(await (await fetch(base + 'plates/land2.bin')).arrayBuffer());
  const tl_ = await Promise.all([...Array.from({ length: 16 }, (_, i) => `plates/tiles/m_${i % 4}_${Math.floor(i / 4)}.png`)].map(p => load(base + p)));
  const map = tl_.map((im, i) => [(i % 4) * 1280, Math.floor(i / 4) * 1152, im]); DBG_TILE = tl_[5];
  initTextiles(); initGate(); initSign(); initMap(map, land); initWord(); initSaura(); initHonour(await (await fetch(base + 'geo/odisha.json')).json());
  // the word's particles land where the map will show Bali, and the boat on its route
  const isl = []; const [x0, y0] = ll(114.42, -8.06), [x1, y1] = ll(115.72, -8.86);
  for (let y = Math.floor(y0); y < y1; y += 2) for (let x = Math.floor(x0); x < x1; x += 2) if (isLand(x, y)) isl.push(m2s(MA, x, y));
  const bm = mk(400, 300), bx = bm.getContext('2d', { willReadFrequently: true }); boat(bx, 200, 220, 6, 1, 1, 0); const bd = bx.getImageData(0, 0, 400, 300).data, bp = [];
  const [rx, ry] = at(ROUTE_BALI, .972), [BX, BY] = m2s(MA, rx, ry), sc = (1.9 + MA[2] * .35) / 6;
  for (let y = 0; y < 300; y += 2) for (let x = 0; x < 400; x += 2) if (bd[(y * 400 + x) * 4 + 3] > 200) bp.push([BX + (x - 200) * sc, BY + (y - 220) * sc]);
  setTargets(isl, bp);
  if (Q.get('t')) window.render(+Q.get('t'));
  window.READY = true;
})();
