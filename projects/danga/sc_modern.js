// Today: a waiting-list train ticket whose destination is a split-flap board; the Odia wall calendar where Maa crosses out the
// festivals her child missed and circles the next one; her phone call; and the ticket, folded into a paper boat with a diya.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
const ODIGITS = '୦୧୨୩୪୫୬୭୮୯', od = n => String(n).split('').map(d => ODIGITS[+d]).join('');
let PAPER;
export function initModern() {
  const c = mk(1000, 1300), x = c.getContext('2d'); x.fillStyle = '#f4ecdc'; x.fillRect(0, 0, 1000, 1300);
  for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${120 + 60 * hh(i)},${100 + 50 * hh(i * 3)},80,${.03 + .04 * hh(i * 7)})`; x.fillRect(hh(i * 1.3) * 1000, hh(i * 2.7) * 1300, 1 + hh(i * 5) * 2, 1 + hh(i * 9) * 2); }
  PAPER = c;
}
// ———— the split-flap: each cell flips through letters to its target ————
const ABC = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function flapCell(c, x, y, w, h, from, to, p) {   // p: 0..1 flip progress (several flips in between)
  const steps = Math.max(1, (ABC.indexOf(to) - ABC.indexOf(from) + ABC.length) % ABC.length), s = Math.min(steps, Math.floor(p * steps)), sub = p * steps - s;
  const cur = ABC[(ABC.indexOf(from) + s) % ABC.length], nxt = ABC[(ABC.indexOf(from) + Math.min(steps, s + 1)) % ABC.length], done = p >= 1;
  const card = (ch, clipTop) => { c.save(); c.beginPath(); c.rect(x, clipTop ? y : y + h / 2, w, h / 2); c.clip(); c.fillStyle = '#16120e'; c.beginPath(); c.roundRect(x, y, w, h, 6); c.fill();
    c.fillStyle = '#f6eedc'; c.font = `700 ${h * .72}px "InterT"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, x + w / 2, y + h / 2 + 2); c.restore(); };
  if (done) { card(to, true); card(to, false); }
  else { card(nxt, true); card(cur, false);   // behind: the next top, the current bottom
    const k = sub < .5 ? 1 - sub * 2 : (sub - .5) * 2; c.save(); c.translate(0, y + h / 2); c.scale(1, Math.max(.02, k)); c.translate(0, -(y + h / 2));
    if (sub < .5) card(cur, true); else card(nxt, false); c.fillStyle = `rgba(0,0,0,${.35 * (1 - k)})`; c.fillRect(x, sub < .5 ? y : y + h / 2, w, h / 2); c.restore(); }
  c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x, y + h / 2 - 1, w, 2);
}
export function flapWord(c, x, y, words, times, t, cw = 62, ch = 92) {   // flips to each word at its time
  let prev = ' '.repeat(10), cur = prev, p = 1;
  for (let k = 0; k < words.length; k++) if (t >= times[k]) { prev = k ? words[k - 1] : ' '.repeat(10); cur = words[k]; p = clamp((t - times[k]) / .55); }
  if (t < times[0]) { cur = prev; p = 1; }
  const n = 10; prev = prev.padEnd(n); cur = cur.padEnd(n);
  for (let i = 0; i < n; i++) flapCell(c, x + i * (cw + 6), y, cw, ch, prev[i], cur[i], clamp(p * 1.3 - i * .03));
}
// ———— the ticket ————
export function ticket(c, t, x, y, s, o = {}) {
  const { stamp = 0, flapT = [], a = 1 } = o; if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.35)'; c.filter = 'blur(18px)'; c.fillRect(-440, -250, 900, 540); c.filter = 'none';
  c.save(); c.beginPath(); c.roundRect(-450, -270, 900, 540, 16); c.clip(); c.drawImage(PAPER, -450, -270, 900, 540);
  c.strokeStyle = 'rgba(200,120,110,.12)'; c.lineWidth = 1; for (let k = -60; k < 60; k++) { c.beginPath(); c.moveTo(-450, k * 9); c.bezierCurveTo(-150, k * 9 - 20, 150, k * 9 + 20, 450, k * 9); c.stroke(); }   // the security guilloche
  c.restore();
  c.setLineDash([6, 6]); c.strokeStyle = 'rgba(80,60,40,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-450, -150); c.lineTo(450, -150); c.stroke(); c.setLineDash([]);
  c.fillStyle = '#2a2420'; c.font = '700 30px "InterT"'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.letterSpacing = '4px'; c.fillText('JOURNEY TICKET', -410, -196); c.letterSpacing = '0px';
  c.font = '500 22px "InterT"'; c.fillStyle = '#6a5a4a'; c.fillText('SLEEPER (SL)  ·  2 PASSENGERS  ·  NON-AC', -410, -166);
  c.fillStyle = '#6a5a4a'; c.font = '500 22px "InterT"'; c.fillText('FROM', -410, -104); c.fillText('TO', -410, 18);
  c.fillStyle = '#16120e'; c.font = '700 46px "InterT"'; c.fillText('CUTTACK (CTC)', -410, -56);
  flapWord(c, -410, 34, ['BENGALURU', 'PUNE', 'HYDERABAD'], flapT, t, 62, 92);
  c.fillStyle = '#6a5a4a'; c.font = '500 22px "InterT"'; c.fillText('STATUS', -410, 190); c.fillStyle = '#16120e'; c.font = '700 40px "InterT"'; c.fillText('WAITING LIST', -410, 236);
  if (stamp > 0) {   // the red stamp: WL 47
    const k = backOut(stamp), sc = lerp(1.8, 1, clamp(stamp * 1.4)); c.save(); c.translate(250, 170); c.rotate(-.18); c.scale(sc, sc); c.globalAlpha = a * clamp(stamp * 3);
    c.strokeStyle = '#c0281c'; c.lineWidth = 6; c.beginPath(); c.roundRect(-130, -62, 260, 124, 14); c.stroke(); c.lineWidth = 2; c.beginPath(); c.roundRect(-118, -50, 236, 100, 10); c.stroke();
    c.fillStyle = '#c0281c'; c.font = '800 70px "InterT"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WL 47', 0, 4);
    c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 60; i++) { c.beginPath(); c.arc((hh(i) - .5) * 250, (hh(i * 3) - .5) * 110, 1 + hh(i * 5) * 2.4, 0, 7); c.fill(); }   // ink gaps
    c.restore(); }
  c.restore();
}
const backOut = x => { x = clamp(x); const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
// ———— the Odia wall calendar ————
const PAGES = {
  oct: { m: 'ଅକ୍ଟୋବର', y: '୨୦୨୬', sub: 'ଆଶ୍ୱିନ · କାର୍ତ୍ତିକ', first: 4, days: 31, fest: { 20: 'ଦଶହରା', 2: 'ଗାନ୍ଧି ଜୟନ୍ତୀ' } },   // first: 0 = Sunday column
  nov: { m: 'ନଭେମ୍ବର', y: '୨୦୨୬', sub: 'କାର୍ତ୍ତିକ · ମାର୍ଗଶିର', first: 0, days: 30, fest: { 8: 'ଦୀପାବଳି' } },
  jun: { m: 'ଜୁନ', y: '୨୦୨୭', sub: 'ଜ୍ୟେଷ୍ଠ · ଆଷାଢ଼', first: 2, days: 30, fest: { 14: 'ପହିଲି ରଜ', 15: 'ରଜ ସଂକ୍ରାନ୍ତି', 16: 'ବାସି ରଜ' } },
};
const WD = ['ରବି', 'ସୋମ', 'ମଙ୍ଗଳ', 'ବୁଧ', 'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'];
export function calPage(c, t, key, x, y, s, marks = {}, a = 1) {
  if (a <= 0) return; const P = PAGES[key]; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.3)'; c.filter = 'blur(20px)'; c.fillRect(-420, -560, 860, 1140); c.filter = 'none';
  c.drawImage(PAPER, -430, -580, 860, 1140);
  const hd = c.createLinearGradient(0, -580, 0, -380); hd.addColorStop(0, '#a8201a'); hd.addColorStop(1, '#7a1412'); c.fillStyle = hd; c.fillRect(-430, -580, 860, 200);
  c.strokeStyle = '#e8b85a'; c.lineWidth = 3; c.strokeRect(-414, -566, 828, 172); for (let i = 0; i < 40; i++) { c.fillStyle = '#e8b85a'; c.beginPath(); c.arc(-400 + i * 20.5, -380, 3, 0, 7); c.fill(); }
  c.fillStyle = '#fff4dc'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 84px "OdiaSerif"'; c.fillText(P.m, -40, -500); c.font = '600 54px "OdiaSerif"'; c.fillText(P.y, 300, -500); c.font = '500 34px "OdiaSerif"'; c.fillStyle = '#f6d8a0'; c.fillText(P.sub, 0, -420);
  const cw = 118, rh = 140, gx = -413, gy = -330;
  WD.forEach((d, i) => { c.fillStyle = i === 0 ? '#a8201a' : '#3a2a20'; c.font = '600 30px "OdiaSerif"'; c.fillText(d, gx + cw * i + cw / 2, gy); });
  c.strokeStyle = 'rgba(80,50,30,.25)'; c.lineWidth = 1.4;
  for (let r = 0; r <= 6; r++) { c.beginPath(); c.moveTo(gx, gy + 30 + r * rh); c.lineTo(gx + cw * 7, gy + 30 + r * rh); c.stroke(); }
  for (let d = 1; d <= P.days; d++) { const k = P.first + d - 1, col = k % 7, row = Math.floor(k / 7); if (row > 5) continue; const cx = gx + col * cw + cw / 2, cy = gy + 30 + row * rh + rh * .42;
    const red = col === 0 || P.fest[d]; c.fillStyle = red ? '#b4261c' : '#2a1e18'; c.font = `${P.fest[d] ? 800 : 600} 62px "OdiaSerif"`; c.fillText(od(d), cx, cy);
    if (P.fest[d]) { c.font = '700 22px "OdiaSerif"'; c.fillStyle = '#b4261c'; c.fillText(P.fest[d], cx, cy + 50); }
    const mk_ = marks[d]; if (mk_) penMark(c, cx, cy + 10, mk_.type, mk_.p); }
  c.restore();
}
function penMark(c, x, y, type, p) {   // Maa's red pen: a cross for a missed festival, a circle for the next one
  if (p <= 0) return; c.save(); c.strokeStyle = 'rgba(200,24,20,.92)'; c.lineWidth = 7; c.lineCap = 'round';
  if (type === 'x') { const a = clamp(p * 2), b = clamp(p * 2 - 1); c.beginPath(); c.moveTo(x - 46, y - 46); c.lineTo(x - 46 + 92 * a, y - 46 + 92 * a); c.stroke(); if (b > 0) { c.beginPath(); c.moveTo(x + 46, y - 46); c.lineTo(x + 46 - 92 * b, y - 46 + 92 * b); c.stroke(); } }
  else { c.beginPath(); for (let i = 0; i <= 60 * p; i++) { const a = -2.2 + i / 60 * Math.PI * 2.15, r = 66 + 6 * Math.sin(i * .3); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * .86); } c.stroke(); }
  c.restore();
}
export function pageTurn(c, t, from, to, p, x, y, s, marksFrom, marksTo) {   // the top-hinged page lifts and falls away
  calPage(c, t, to, x, y, s, marksTo); if (p >= 1) return;
  c.save(); c.translate(x, y - 580 * s); const k = Math.cos(eio(p) * Math.PI / 2); c.scale(1, Math.max(.001, k)); c.translate(-x, -(y - 580 * s)); calPage(c, t, from, x, y, s, marksFrom); c.fillStyle = `rgba(0,0,0,${.35 * (1 - k)})`; c.fillRect(x - 430 * s, y - 580 * s, 860 * s, 1140 * s); c.restore();
}
// ———— Maa's call ————
export function phone(c, t, x, y, s, secs, a = 1, speaking = 0) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,.5)'; c.filter = 'blur(24px)'; c.fillRect(-250, -400, 520, 820); c.filter = 'none';
  c.fillStyle = '#0c0a0a'; c.beginPath(); c.roundRect(-260, -420, 520, 840, 60); c.fill(); c.strokeStyle = '#3a3430'; c.lineWidth = 3; c.stroke();
  const g = c.createLinearGradient(0, -400, 0, 400); g.addColorStop(0, '#2a1c16'); g.addColorStop(1, '#120c0a'); c.fillStyle = g; c.beginPath(); c.roundRect(-244, -404, 488, 808, 48); c.fill();
  c.fillStyle = '#e8b86a'; c.beginPath(); c.arc(0, -180, 86, 0, 7); c.fill(); c.fillStyle = '#2a1c16'; c.font = '700 80px "OdiaSerif"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ମା', 0, -176);
  c.fillStyle = '#fff4e4'; c.font = '700 58px "OdiaSerif"'; c.fillText("ମା'", 0, -36); c.fillStyle = 'rgba(255,240,220,.65)'; c.font = '500 28px "InterT"'; c.fillText(`${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(Math.floor(secs) % 60).padStart(2, '0')}`, 0, 16);
  for (let i = 0; i < 28; i++) { const hgt = 6 + speaking * 44 * Math.abs(Math.sin(t * 9 + i * .7) * Math.sin(t * 3.1 + i * 1.3)); c.fillStyle = 'rgba(240,200,130,.85)'; c.fillRect(-196 + i * 14.5, 120 - hgt / 2, 8, hgt); }
  c.fillStyle = '#b8281c'; c.beginPath(); c.arc(0, 300, 46, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-18, 300); c.lineTo(18, 300); c.stroke();
  c.restore();
}
// ———— the ticket folds into a paper boat ————
// keyframes of one outline (8 vertices) + its fold lines, in ticket-local units (ticket = 900 × 540)
const KF = [
  { o: [[-450, -270], [-150, -270], [150, -270], [450, -270], [450, 270], [150, 270], [-150, 270], [-450, 270]], f: [] },
  { o: [[-450, -135], [-150, -135], [150, -135], [450, -135], [450, 135], [150, 135], [-150, 135], [-450, 135]], f: [[[-450, -135], [450, -135]]] },
  { o: [[-300, 135], [-150, -40], [0, -260], [150, -40], [300, 135], [150, 135], [-150, 135], [-300, 135]], f: [[[-300, 80], [300, 80]], [[0, -260], [0, 80]]] },
  { o: [[-400, -60], [-150, -60], [0, -330], [150, -60], [400, -60], [250, 110], [-250, 110], [-400, -60]], f: [[[-150, -60], [150, -60]], [[0, -330], [0, -60]]] },
];
export function foldTicket(c, t, x, y, s, p, a = 1) {   // p: 0 ticket → 1 boat
  if (a <= 0) return; const k = clamp(p) * (KF.length - 1), i = Math.min(KF.length - 2, Math.floor(k)), u = eio(k - i), A = KF[i], B = KF[i + 1];
  const O = A.o.map((q, j) => [lerp(q[0], B.o[j][0], u), lerp(q[1], B.o[j][1], u)]);
  c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  c.save(); c.beginPath(); O.forEach(([X, Y], j) => j ? c.lineTo(X, Y) : c.moveTo(X, Y)); c.closePath(); c.clip(); c.drawImage(PAPER, -460, -320, 920, 640);
  c.fillStyle = 'rgba(200,120,110,.08)'; c.fillRect(-460, -320, 920, 640);
  const sh = c.createLinearGradient(-400, 0, 400, 0); sh.addColorStop(0, `rgba(0,0,0,${.18 * u + .05 * i})`); sh.addColorStop(.5, 'rgba(255,255,255,.08)'); sh.addColorStop(1, `rgba(0,0,0,${.22 * u + .06 * i})`); c.fillStyle = sh; c.fillRect(-460, -320, 920, 640);
  if (i === 0 && u < .5) { c.fillStyle = 'rgba(192,40,28,.8)'; c.font = '800 70px "InterT"'; c.textAlign = 'center'; c.fillText('WL 47', 250 * (1 - u), 190 * (1 - u)); }
  c.restore();
  c.strokeStyle = 'rgba(90,70,50,.55)'; c.lineWidth = 2; c.beginPath(); O.forEach(([X, Y], j) => j ? c.lineTo(X, Y) : c.moveTo(X, Y)); c.closePath(); c.stroke();
  for (const [[x0, y0], [x1, y1]] of (u > .5 ? B.f : A.f)) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  c.restore();
}
export function paperBoat(c, t, x, y, s, lit = 1, a = 1) {   // the finished boat, with a diya in it
  if (a <= 0) return; const bob = Math.sin(t * 1.3) * 5;
  c.save(); c.translate(x, y + bob); c.rotate(Math.sin(t * 1.1) * .03);
  c.save(); c.globalAlpha = a * .3; c.scale(1, -.5); foldTicket(c, t, 0, -140 * s, s, 1, 1); c.restore();
  foldTicket(c, t, 0, 0, s, 1, a);
  c.globalAlpha = a; const fl = 1 + .12 * Math.sin(t * 13) + .08 * Math.sin(t * 7.7), fh = 36 * fl;
  c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(0, -40 * s, 0, 0, -40 * s, 220); gl.addColorStop(0, `rgba(255,190,100,${.55 * lit})`); gl.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = gl; c.fillRect(-240, -260, 480, 480);
  c.globalCompositeOperation = 'source-over'; c.fillStyle = '#7a3a1c'; c.beginPath(); c.ellipse(0, 40 * s, 22, 8, 0, 0, 7); c.fill();
  if (lit > 0) { const fg = c.createRadialGradient(0, 30 * s, 0, 0, 26 * s, fh); fg.addColorStop(0, '#fffbea'); fg.addColorStop(.45, '#ffd56a'); fg.addColorStop(1, 'rgba(255,120,30,0)'); c.fillStyle = fg; c.globalAlpha = a * lit; c.beginPath(); c.moveTo(0, 36 * s); c.quadraticCurveTo(14, 26 * s, 0, 36 * s - fh); c.quadraticCurveTo(-14, 26 * s, 0, 36 * s); c.fill(); }
  c.restore();
}
