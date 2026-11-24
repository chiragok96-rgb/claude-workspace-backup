// The final film's new set pieces: the fifty-six lamps of the hook, the shadow play of Lakshmi's curse, Ananda Bazar at dusk.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
import { flame } from './sc_light.js';
import { dark, glow, idol } from './sc_temple.js';
import { motherStanding, setLook } from './sc_people.js';
import { kudua } from './sc_new.js';
// —— the hook: Jagannath in the dark; on "chhapana bhoga" fifty-six diyas ignite one after another in a golden spiral round him —
// one lamp for each offering — and on "door to door" a single gust blows them all out ——
const GA = Math.PI * (3 - Math.sqrt(5));
export const DIYAS = Array.from({ length: 56 }, (_, i) => { const r = 330 + 300 * Math.sqrt((i + .5) / 56), a = i * GA - Math.PI / 2; return [540 + Math.cos(a) * r * .8, 860 + Math.sin(a) * r * .86, .75 + .35 * Math.sqrt(i / 56)]; });
export const IGNITE = i => -.5 + i * .05, BLOW = x => 2.72 + clamp(x / W) * .38;
function diyaSide(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); const g = c.createLinearGradient(0, -6, 0, 12); g.addColorStop(0, '#c8743e'); g.addColorStop(1, '#4a1c0a'); c.fillStyle = g; c.beginPath(); c.moveTo(-22, -4); c.quadraticCurveTo(-20, 12, 0, 13); c.quadraticCurveTo(20, 12, 24, -4); c.lineTo(32, -8); c.lineTo(22, -8); c.quadraticCurveTo(0, -10, -22, -4); c.fill(); c.fillStyle = '#2a1006'; c.beginPath(); c.ellipse(0, -5, 21, 3.4, 0, 0, 7); c.fill(); c.restore(); }
export function fiftySix(c, t, o = {}) {
  const { zoom = 1 } = o; let lit = 0;
  const st = DIYAS.map(([x, y], i) => { const on = seg(t, IGNITE(i), IGNITE(i) + .18), off = seg(t, BLOW(x), BLOW(x) + .22); const v = on * (1 - off); lit += v; return { on, off, v }; });
  c.save(); c.translate(540, 880); c.scale(zoom, zoom); c.translate(-540, -880);
  dark(c, t, { cx: 540, cy: 880, warm: .4 + 1.1 * lit / 56 });
  idol(c, t, 540, 960, 1.22, 'J', { lit: .4 + .6 * lit / 56 });
  c.fillStyle = `rgba(6,3,2,${.78 * (1 - lit / 56)})`; c.fillRect(-W, -H, 3 * W, 3 * H);   // he is lit only by the lamps
  glow(c, 540, 880, 900, .7 * lit / 56, '255,180,100');
  DIYAS.forEach(([x, y, s], i) => { const { on, off, v } = st[i]; diyaSide(c, x, y, s);
    if (v > .01) { const fl = on < 1 ? 1 + .6 * Math.sin(on * Math.PI) : 1; c.save(); if (off > 0) { c.translate(x, y); c.transform(1, 0, off * 1.2, 1, 0, 0); c.translate(-x, -y); } flame(c, t, x + 22 * s, y - 9 * s, 26 * s * fl * (1 - off * .8), i * 1.7, v); c.restore(); }
    if (off > 0 && off < 1) { const k = Math.sin(off * Math.PI); c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x + 22 * s, y - 14 * s, 0, x + 22 * s, y - 14 * s, 30 * s); g.addColorStop(0, `rgba(255,190,110,${.5 * k})`); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(x - 40 * s, y - 60 * s, 120 * s, 100 * s); c.restore(); }
    const sm = seg(t, BLOW(x) + .1, BLOW(x) + 1.4); if (sm > 0 && sm < 1) { c.strokeStyle = `rgba(200,190,180,${.45 * Math.sin(sm * Math.PI)})`; c.lineWidth = 2.4 * s; c.beginPath(); c.moveTo(x + 22 * s, y - 12 * s); for (let j = 1; j < 9; j++) c.lineTo(x + 22 * s + Math.sin(t * 3 + j + i) * 5 * j / 3 + j * 4 * sm * 6, y - 12 * s - j * 16 * (.3 + sm)); c.stroke(); } });   // a thread of smoke from each
  c.restore();
  return lit;
}
// —— the shadow play: the curse, told as Odia storytellers told it — a glowing cloth, lamps behind it, Lakshmi a carved puppet of dyed hide ——
let CLOTH, PUP;
function cloth() { if (CLOTH) return CLOTH; CLOTH = mk(W, H); const x = CLOTH.getContext('2d'); x.fillStyle = '#f2d7a6'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 1600; i++) { x.strokeStyle = `rgba(${hh(i) > .5 ? '255,240,210' : '150,100,50'},${.05 + .04 * hh(i * 3)})`; x.lineWidth = 1; const y = hh(i * 1.7) * H; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y + (hh(i * 2) - .5) * 3); x.stroke(); }
  for (let i = 0; i < 900; i++) { x.strokeStyle = `rgba(${hh(i * 5) > .5 ? '255,240,210' : '150,100,50'},${.04 + .03 * hh(i * 7)})`; const xx = hh(i * 2.9) * W; x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx + (hh(i * 4) - .5) * 3, H); x.stroke(); }
  return CLOTH; }
export const SP_RECT = [60, 250, 1020, 1350];   // the cloth, inside the theatre's dark frame
export function shadowPlay(c, t, o = {}) {
  const { press = 1, raise = 0, out = 0, a = 1, fire = 0 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a;
  const [x0, y0, x1, y1] = SP_RECT;
  c.fillStyle = '#120806'; c.fillRect(0, 0, W, H);
  c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip();
  // the light on the cloth: twelve lamps behind it, going out one by one
  c.fillStyle = '#0c0604'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  let tot = 0; c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 12; k++) { const q = clamp(out * 12 - k), I = (1 - ss(q)) * (1 + .06 * Math.sin(t * 13 + k * 2) + .04 * Math.sin(t * 29 + k)) * (q > 0 && q < 1 ? .7 + .3 * Math.sin(q * 60) : 1); tot += I;
    const lx = 150 + (k % 6) * 156, ly = k < 6 ? 760 : 1060, g = c.createRadialGradient(lx, ly, 0, lx, ly, 560); g.addColorStop(0, `rgba(255,214,150,${.42 * I})`); g.addColorStop(.35, `rgba(255,170,90,${.2 * I})`); g.addColorStop(1, 'rgba(255,140,60,0)'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0); }
  c.restore();
  c.globalCompositeOperation = 'multiply'; c.drawImage(cloth(), 0, 0); c.globalCompositeOperation = 'source-over';
  // Lakshmi, a carved puppet pressed against the cloth: her dyes glow where the light comes through; lace cut through her sari
  if (!PUP) PUP = mk(W, H); const p = PUP.getContext('2d'); p.setTransform(1, 0, 0, 1, 0, 0); p.clearRect(0, 0, W, H); p.globalCompositeOperation = 'source-over'; p.globalAlpha = 1; p.filter = 'none';
  setLook({ saree: '#c8281c', sareeD: '#8a1810', border: '#e8b040', crown: true, skin: '#e8a868', skinD: '#c07840' });
  motherStanding(p, 470, 1330, 1.55, { t, raise, rim: 0, shade: 0, a: 1 });
  p.globalCompositeOperation = 'destination-out'; p.lineWidth = 2.2; p.lineCap = 'round';   // carved through her sari: rows of fine crescents, a band of lotus holes at the hem
  for (let r = 0; r < 30; r++) for (let q = 0; q < 16; q++) { const px = 300 + q * 20 + (r % 2) * 10, py = 760 + r * 17; p.beginPath(); p.arc(px, py, 7, .15 * Math.PI, .85 * Math.PI); p.stroke(); }
  for (let q = 0; q < 12; q++) { const px = 330 + q * 26, py = 1290; p.beginPath(); p.arc(px, py, 5, 0, 7); p.fill(); }
  p.globalCompositeOperation = 'source-atop'; p.fillStyle = 'rgba(40,14,6,.35)'; for (const [jx, jy] of [[474, 703], [520, 650]]) { p.beginPath(); p.arc(jx, jy, 7, 0, 7); p.fill(); }   // rivets at her joints
  const k = 1 + .7 * (1 - eo(press)), bl = 16 * (1 - eo(press));
  c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha *= .25 + .75 * eo(press); c.translate(540, 1000); c.scale(k, k); c.translate(-540, -1000); c.filter = `blur(${bl + 1.6}px) brightness(0.25)`; c.drawImage(PUP, 0, 0); c.filter = bl > .4 ? `blur(${bl}px)` : 'none'; c.drawImage(PUP, 0, 0); c.restore();   // the hide's dark edge, then the dyed hide itself
  c.strokeStyle = 'rgba(60,40,30,.5)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(470 + 60, 1330 - 560 - 380 * raise); c.lineTo(560, y1); c.moveTo(470, 1330 - 400); c.lineTo(430, y1); c.stroke();   // the rods
  if (fire > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const fx = 470 + 112 * 1.55 * raise * .7, fy = 1330 - 640 * 1.55 * raise; const g = c.createRadialGradient(fx, fy, 0, fx, fy, 380); g.addColorStop(0, `rgba(255,200,110,${.5 * fire})`); g.addColorStop(1, 'rgba(255,140,60,0)'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0); c.restore(); }
  c.restore();
  // the theatre's carved frame and the stage lip
  c.strokeStyle = '#6a4a28'; c.lineWidth = 3; c.strokeRect(x0 - 8, y0 - 8, x1 - x0 + 16, y1 - y0 + 16); c.fillStyle = '#5a170d'; c.fillRect(0, y1 + 14, W, 10); c.fillRect(0, y0 - 26, W, 8);
  c.strokeStyle = 'rgba(138,100,48,.55)'; c.lineWidth = 2; for (let x = 20; x < W; x += 90) { c.beginPath(); c.arc(x + 45, y0 - 60, 20, Math.PI, 0); c.stroke(); c.beginPath(); c.arc(x + 45, y1 + 70, 20, 0, Math.PI); c.stroke(); }
  const sp = c.createLinearGradient(0, y1, 0, y1 + 160); sp.addColorStop(0, `rgba(255,170,90,${.25 * tot / 12})`); sp.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = sp; c.fillRect(0, y1, W, 160);
  c.restore();
  return tot;
}
// —— Ananda Bazar today, at dusk: devotees of every kind sitting cross-legged on the temple floor, each before a banana leaf of rice, eating with their
// hands; kudua of Mahaprasad between them; lamps behind; the shikhara beyond ——
const PEOPLE = [['priest', '#e8e0cc'], ['woman', '#b8282a'], ['farmer', '#d8cfb8'], ['child', '#d89a2a'], ['old', '#cfc6b0'], ['woman2', '#2a6a4a'], ['young', '#e8e0cc']];
export function anandaRow(c, t, o = {}) {
  const { pan = 0, a = 1 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a;
  let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#24121a'); g.addColorStop(.38, '#8a4026'); g.addColorStop(.52, '#e8944a'); g.addColorStop(.56, '#5a2a18'); g.addColorStop(1, '#1a0c08'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const sx = 700 - pan * .25; c.fillStyle = '#3a1c18'; c.beginPath(); c.moveTo(sx - 230, 1010); for (let i = 0; i <= 24; i++) { const u = i / 24; c.lineTo(sx - 200 * (1 - .62 * u ** 2.2), 1010 - 600 * u); } for (let i = 24; i >= 0; i--) { const u = i / 24; c.lineTo(sx + 200 * (1 - .62 * u ** 2.2), 1010 - 600 * u); } c.lineTo(sx + 230, 1010); c.fill();
  c.beginPath(); c.ellipse(sx, 404, 78, 18, 0, 0, 7); c.fill(); c.beginPath(); c.arc(sx, 372, 26, 0, 7); c.fill(); c.strokeStyle = '#3a1c18'; c.lineWidth = 7; c.beginPath(); c.arc(sx, 312, 30, 0, 7); c.stroke(); for (let k = 0; k < 8; k++) { const an = k / 8 * 6.283; c.beginPath(); c.moveTo(sx, 312); c.lineTo(sx + Math.cos(an) * 30, 312 + Math.sin(an) * 30); c.stroke(); }
  c.beginPath(); c.moveTo(sx, 282); c.lineTo(sx, 200); c.stroke(); c.fillStyle = '#c42a1c'; c.beginPath(); c.moveTo(sx, 200); c.quadraticCurveTo(sx + 70, 194 + 8 * Math.sin(t * 2.4), sx + 130, 220 + 10 * Math.sin(t * 2.4 + 1)); c.lineTo(sx, 244); c.fill();   // the Nilachakra and the flag
  c.fillStyle = '#2a1410'; c.fillRect(0, 960, W, 110); for (let k = -2; k < 12; k++) { const x = k * 130 - (pan * .4) % 130; c.beginPath(); c.moveTo(x, 960); c.lineTo(x + 65, 900); c.lineTo(x + 130, 960); c.fill(); }   // the courtyard's roofs
  g = c.createLinearGradient(0, 1060, 0, 1400); g.addColorStop(0, '#6a3a24'); g.addColorStop(1, '#2a160e'); c.fillStyle = g; c.fillRect(0, 1060, W, 340);   // the stone floor, warm in the lamplight
  for (let k = 0; k < 7; k++) glow(c, 80 + k * 180 - (pan * .7) % 180, 1080, 300, .5);
  for (let i = 0; i < PEOPLE.length; i++) { const x = 140 + i * 230 - pan; if (x < -200 || x > W + 220) continue; eater(c, t, x, 1330, PEOPLE[i][0], PEOPLE[i][1], i); if (i < PEOPLE.length - 1) kudua(c, x + 120, 1320, 26, 1); }
  c.restore();
}
function eater(c, t, x, y, kind, cloth, i) {   // seated cross-legged, facing right; eats: the right hand goes from the leaf to the mouth and back
  const s = kind === 'child' ? .74 : 1, u = (t * .55 + i * .37) % 1, e = u < .5 ? ss(u * 2) : ss(2 - u * 2);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#3a6a26'; c.beginPath(); c.ellipse(150, 6, 84, 16, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(70, 4, 160, 2);
  c.fillStyle = '#f6f0e2'; c.beginPath(); c.ellipse(140, -2, 34, 11, 0, 0, 7); c.fill(); c.fillStyle = '#e0a438'; c.beginPath(); c.ellipse(188, 0, 16, 7, 0, 0, 7); c.fill();   // a leaf of rice and dalma
  const P = new Path2D(); P.moveTo(-86, 0); P.bezierCurveTo(-90, -40, -70, -70, -40, -78); P.bezierCurveTo(-50, -130, -40, -190, -10, -214); P.bezierCurveTo(14, -232, 44, -230, 56, -214); P.bezierCurveTo(66, -190, 64, -150, 58, -118); P.bezierCurveTo(70, -90, 84, -50, 96, -30); P.lineTo(110, 0); P.closePath();
  const hx = 20, hy = -262; P.moveTo(hx + 32, hy); P.arc(hx, hy, 32, 0, 7);
  if (kind.startsWith('woman')) { P.moveTo(hx + 30, hy - 18); P.quadraticCurveTo(hx + 8, hy - 50, hx - 30, hy - 30); P.quadraticCurveTo(hx - 60, hy + 20, hx - 64, hy + 110); P.lineTo(hx - 30, hy + 100); P.closePath(); }
  if (kind === 'priest') { P.moveTo(hx - 22, hy - 26); P.quadraticCurveTo(hx - 44, hy - 56, hx - 32, hy - 66); P.quadraticCurveTo(hx - 22, hy - 50, hx - 12, hy - 32); }
  if (kind === 'farmer') { P.moveTo(hx - 38, hy - 8); P.quadraticCurveTo(hx, hy - 50, hx + 38, hy - 10); P.lineTo(hx + 30, hy - 2); P.quadraticCurveTo(hx, hy - 32, hx - 30, hy); P.closePath(); }
  if (kind === 'old') { P.moveTo(hx - 32, hy - 8); P.quadraticCurveTo(hx, hy - 46, hx + 32, hy - 8); P.closePath(); }
  c.fillStyle = '#140a07'; c.fill(P);
  c.save(); c.clip(P); c.fillStyle = cloth; c.globalAlpha *= .22; c.fillRect(-100, -200, 220, 210); c.restore();   // a hint of their clothes' colour in the dusk
  c.save(); c.clip(P); c.strokeStyle = 'rgba(255,186,110,.8)'; c.lineWidth = 7; c.translate(-4, 2); c.stroke(P); c.restore();
  // the eating arm: shoulder → elbow → hand, from the leaf up to the mouth
  const sh = [30, -170], hand = [lerp(126, 58, e), lerp(-8, -236, e)], el = [lerp(96, 92, e), lerp(-80, -150, e)];
  c.strokeStyle = '#140a07'; c.lineCap = 'round'; c.lineWidth = 24; c.beginPath(); c.moveTo(...sh); c.lineTo(...el); c.lineTo(...hand); c.stroke();
  c.strokeStyle = 'rgba(255,186,110,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(sh[0] + 8, sh[1] - 8); c.lineTo(el[0] + 10, el[1] - 6); c.lineTo(hand[0] + 8, hand[1] - 6); c.stroke();
  if (e > .1 && e < .9) { c.fillStyle = '#f6f0e2'; c.beginPath(); c.arc(hand[0] + 8, hand[1] - 4, 6, 0, 7); c.fill(); }   // a morsel
  if (kind === 'farmer') { c.strokeStyle = '#b82418'; c.lineWidth = 6; c.beginPath(); c.moveTo(-40, -200); c.quadraticCurveTo(0, -150, 52, -112); c.stroke(); }
  c.restore();
}
