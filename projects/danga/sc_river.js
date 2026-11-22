// The dawn river of Kartika Purnima: a misty gold sky, the far ghat and a temple in silhouette, a still river full of floating lamps,
// and in the foreground four banana-bark dangas — each with a diya, a betel leaf, a marigold, and a little paper sail
// on which one syllable of the song lights up as it is sung: ଆ · କା · ମା · ବୈ.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
export const HZ = 760;   // the horizon (screen px at rest)
let SKY, BARK, PAPER;
export function initRiver() {
  const c = mk(W, H), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, HZ); g.addColorStop(0, '#1c1216'); g.addColorStop(.35, '#4a2a2a'); g.addColorStop(.72, '#b8664a'); g.addColorStop(.92, '#f0a86a'); g.addColorStop(1, '#ffd6a0'); x.fillStyle = g; x.fillRect(0, 0, W, HZ);
  const sg = x.createRadialGradient(700, HZ, 10, 700, HZ, 520); sg.addColorStop(0, 'rgba(255,236,196,.9)'); sg.addColorStop(.25, 'rgba(255,196,130,.45)'); sg.addColorStop(1, 'rgba(255,170,110,0)'); x.fillStyle = sg; x.fillRect(0, 0, W, HZ + 40);   // the sun, not yet risen
  for (let i = 0; i < 9; i++) { const y = 380 + i * 42, a = .06 + .05 * hh(i); x.fillStyle = `rgba(255,${180 + 40 * hh(i * 3)},${150 + 40 * hh(i * 5)},${a})`; x.beginPath(); x.ellipse(hh(i * 7) * W, y, 380 + hh(i * 9) * 300, 10 + hh(i) * 10, 0, 0, 7); x.fill(); }   // thin cloud streaks
  // the far bank: trees, a rekha deula, the ghat steps
  x.fillStyle = '#2a1a18';
  x.beginPath(); x.moveTo(0, HZ); for (let X = 0; X <= W; X += 12) x.lineTo(X, HZ - 16 - 18 * Math.abs(Math.sin(X * .021)) - 10 * hh(Math.floor(X / 12))); x.lineTo(W, HZ); x.fill();
  const dx = 260, dw = 60, dh = 150; x.beginPath(); x.moveTo(dx - dw / 2, HZ - 14); for (let i = 0; i <= 20; i++) { const u = i / 20; x.lineTo(dx - dw / 2 * (1 - .55 * u ** 2.3), HZ - 14 - dh * u); } for (let i = 20; i >= 0; i--) { const u = i / 20; x.lineTo(dx + dw / 2 * (1 - .55 * u ** 2.3), HZ - 14 - dh * u); } x.fill();
  x.beginPath(); x.ellipse(dx, HZ - 14 - dh, dw * .26, 7, 0, 0, 7); x.fill(); x.fillRect(dx - 2, HZ - 14 - dh - 30, 4, 26);
  for (let i = 0; i < 5; i++) x.fillRect(150 + i * 6, HZ - 12 + i * 2.4, 260 - i * 12, 2.4);
  const mist = x.createLinearGradient(0, HZ - 90, 0, HZ + 30); mist.addColorStop(0, 'rgba(255,214,170,0)'); mist.addColorStop(.7, 'rgba(255,214,170,.45)'); mist.addColorStop(1, 'rgba(255,214,170,.2)'); x.fillStyle = mist; x.fillRect(0, HZ - 90, W, 120);
  // the river: the sky reflected, darker and warmer toward us
  const r = x.createLinearGradient(0, HZ, 0, H); r.addColorStop(0, '#e8a06a'); r.addColorStop(.08, '#a85e44'); r.addColorStop(.35, '#4a2a26'); r.addColorStop(1, '#140c0c'); x.fillStyle = r; x.fillRect(0, HZ, W, H - HZ);
  const rs = x.createRadialGradient(700, HZ, 10, 700, HZ + 200, 600); rs.addColorStop(0, 'rgba(255,220,170,.55)'); rs.addColorStop(1, 'rgba(255,190,130,0)'); x.fillStyle = rs; x.fillRect(0, HZ, W, H - HZ);
  SKY = c;
  const b = mk(256, 64), bx = b.getContext('2d');   // banana bark: ivory-green, fibrous
  const bg = bx.createLinearGradient(0, 0, 0, 64); bg.addColorStop(0, '#e6e0b4'); bg.addColorStop(.5, '#c8c48a'); bg.addColorStop(1, '#8a8a52'); bx.fillStyle = bg; bx.fillRect(0, 0, 256, 64);
  for (let i = 0; i < 90; i++) { bx.strokeStyle = `rgba(${90 + 60 * hh(i)},${90 + 50 * hh(i * 3)},50,${.15 + .2 * hh(i * 5)})`; bx.lineWidth = .6 + hh(i * 7); const y = hh(i * 11) * 64; bx.beginPath(); bx.moveTo(0, y); bx.bezierCurveTo(80, y + (hh(i) - .5) * 4, 170, y + (hh(i * 2) - .5) * 4, 256, y); bx.stroke(); }
  BARK = b;
  const q = mk(160, 220), qx = q.getContext('2d'); qx.fillStyle = '#f2e6cc'; qx.fillRect(0, 0, 160, 220);   // handmade paper: fibres, flecks, a soft unevenness
  for (let i = 0; i < 40; i++) { qx.fillStyle = `rgba(${hh(i) > .5 ? '255,250,236' : '200,170,120'},${.05 + .06 * hh(i * 3)})`; qx.beginPath(); qx.ellipse(hh(i * 1.3) * 160, hh(i * 2.1) * 220, 10 + 30 * hh(i * 5), 8 + 24 * hh(i * 7), hh(i) * 3, 0, 7); qx.fill(); }
  for (let i = 0; i < 260; i++) { qx.strokeStyle = `rgba(${hh(i * 3) > .5 ? '150,120,80' : '255,255,245'},${.10 + .14 * hh(i * 5)})`; qx.lineWidth = .4 + .6 * hh(i * 7); const x0 = hh(i * 1.7) * 160, y0 = hh(i * 2.9) * 220, an = hh(i * 4.1) * 6.3, L = 3 + 10 * hh(i * 6.3); qx.beginPath(); qx.moveTo(x0, y0); qx.quadraticCurveTo(x0 + Math.cos(an + 1) * L * .5, y0 + Math.sin(an + 1) * L * .5, x0 + Math.cos(an) * L, y0 + Math.sin(an) * L); qx.stroke(); }
  for (let i = 0; i < 30; i++) { qx.fillStyle = `rgba(120,80,40,${.12 + .15 * hh(i * 9)})`; qx.beginPath(); qx.arc(hh(i * 8.1) * 160, hh(i * 9.7) * 220, .5 + hh(i) * 1.1, 0, 7); qx.fill(); }
  PAPER = q;
}
// a real flame: a soft orange envelope, a gold body, a white-hot core, a breath of blue at the root; it flickers and leans, and lights the air
export function flame(c, t, bx, by, h, seed = 0, glow = 1) {
  const f1 = Math.sin(t * 11.3 + seed * 7.1), f2 = Math.sin(t * 17.9 + seed * 3.3), f3 = Math.sin(t * 4.7 + seed * 1.7), f4 = Math.sin(t * 23.1 + seed * 5.9);
  const fh = h * (1 + .09 * f1 + .05 * f2 + .03 * f4), sway = (.12 * f3 + .05 * f2) * h, w = h * .3 * (1 + .05 * f2);
  c.save(); c.globalCompositeOperation = 'lighter';
  if (glow > 0) { const R = h * 4.5, g = c.createRadialGradient(bx, by - fh * .45, 0, bx, by - fh * .45, R); g.addColorStop(0, `rgba(255,190,105,${.42 * glow})`); g.addColorStop(.22, `rgba(255,150,70,${.15 * glow})`); g.addColorStop(1, 'rgba(255,120,50,0)'); c.fillStyle = g; c.fillRect(bx - R, by - fh * .45 - R, R * 2, R * 2); }
  const tear = (k, lift = 0) => { const hh2 = fh * k, ww = w * k, b = by - lift; c.beginPath(); c.moveTo(bx, b + ww * .35); c.bezierCurveTo(bx - ww * 1.15, b + ww * .3, bx - ww * .95, b - hh2 * .38, bx - ww * .25 + sway * .45, b - hh2 * .7);
    c.quadraticCurveTo(bx + sway * .8 - ww * .05, b - hh2 * .92, bx + sway, b - hh2); c.quadraticCurveTo(bx + sway * .85 + ww * .1, b - hh2 * .9, bx + ww * .3 + sway * .45, b - hh2 * .7); c.bezierCurveTo(bx + ww * .95, b - hh2 * .38, bx + ww * 1.15, b + ww * .3, bx, b + ww * .35); c.closePath(); };
  c.filter = `blur(${Math.max(.6, h * .06)}px)`; tear(1.25); c.fillStyle = 'rgba(255,110,30,.5)'; c.fill(); c.filter = 'none';   // the soft outer envelope
  tear(1); let g = c.createLinearGradient(0, by + w * .3, 0, by - fh); g.addColorStop(0, 'rgba(255,190,80,.9)'); g.addColorStop(.35, 'rgba(255,200,90,.95)'); g.addColorStop(.75, 'rgba(255,140,40,.7)'); g.addColorStop(1, 'rgba(255,90,20,0)'); c.fillStyle = g; c.fill();
  tear(.52, -fh * .02); g = c.createLinearGradient(0, by, 0, by - fh * .55); g.addColorStop(0, 'rgba(255,252,236,1)'); g.addColorStop(1, 'rgba(255,240,200,.2)'); c.fillStyle = g; c.fill();   // the white-hot core
  c.fillStyle = 'rgba(70,110,255,.35)'; c.beginPath(); c.ellipse(bx, by + w * .15, w * .55, w * .26, 0, 0, 7); c.fill();   // the blue root
  c.restore();
  c.strokeStyle = '#2a1408'; c.lineWidth = Math.max(.8, h * .05); c.beginPath(); c.moveTo(bx - w * .1, by + w * .5); c.lineTo(bx + sway * .05, by - fh * .06); c.stroke();   // the wick
}
// a clay diya: a shallow terracotta bowl with a pinched spout, oil glinting, lit from its own flame
function diya(c, t, x, y, s = 1, seed = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const B = new Path2D(); B.moveTo(-17, -6); B.bezierCurveTo(-16, 4, -7, 8, 0, 8); B.bezierCurveTo(8, 8, 14, 4, 16, -2); B.lineTo(25, -7); B.quadraticCurveTo(22, -9.5, 16, -8.5); B.quadraticCurveTo(0, -11, -17, -6); B.closePath();
  let g = c.createLinearGradient(0, -10, 0, 9); g.addColorStop(0, '#c4703a'); g.addColorStop(.5, '#94461e'); g.addColorStop(1, '#4e200e'); c.fillStyle = g; c.fill(B);
  c.save(); c.clip(B); for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(${hh(i) > .5 ? '230,150,90' : '60,24,10'},${.18 + .2 * hh(i * 3)})`; c.beginPath(); c.arc(-17 + hh(i * 1.7 + seed) * 42, -9 + hh(i * 2.3 + seed) * 17, .5 + hh(i * 5) * .9, 0, 7); c.fill(); }
  g = c.createRadialGradient(18, -12, 0, 18, -12, 26); g.addColorStop(0, 'rgba(255,190,110,.55)'); g.addColorStop(1, 'rgba(255,160,80,0)'); c.fillStyle = g; c.fillRect(-20, -12, 46, 22); c.restore();   // flame-light on the clay
  c.fillStyle = '#3a1a0a'; c.beginPath(); c.ellipse(-1, -8, 15, 2.6, -.04, 0, 7); c.fill();   // the oil
  c.strokeStyle = 'rgba(255,214,150,.7)'; c.lineWidth = .9; c.beginPath(); c.ellipse(-1, -8, 15, 2.6, -.04, -.2, 1.4); c.stroke();
  c.strokeStyle = 'rgba(255,200,140,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-17, -6); c.quadraticCurveTo(0, -11, 16, -8.5); c.stroke();
  c.restore();
}
// a danga: banana-bark hull, a diya, a betel leaf, a marigold, a stick and a paper sail with one syllable
export function danga(c, t, x, y, s, syl, lit, o = {}) {
  const bob = Math.sin(t * 1.4 + x * .01) * 4 * s, rock = Math.sin(t * 1.1 + x) * .035;
  c.save(); c.translate(x, y + bob); c.rotate(rock); c.scale(s, s);
  // reflection first (below the waterline, flipped, rippled, dimmer)
  c.save(); c.globalAlpha *= .38; c.scale(1, -.6); c.translate(0, -8); hull(c); c.restore();
  { const rl = Math.max(lit, .55); c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 4; k++) { const yy = 14 + k * 16, w = 18 + k * 5, a = rl * (.45 - k * .05) * (.7 + .3 * Math.sin(t * 6 + k)); c.fillStyle = `rgba(255,200,120,${a * .8})`; c.beginPath(); c.ellipse(Math.sin(t * 3 + k) * 5 + 50, yy, w / 2, 2.2, 0, 0, 7); c.fill(); } c.restore(); }   // the flame's light on the water
  hull(c);
  // betel leaf and a marigold on the deck
  c.fillStyle = '#3e6a22'; c.beginPath(); c.moveTo(-60, -10); c.quadraticCurveTo(-44, -40, -14, -16); c.quadraticCurveTo(-40, -6, -60, -10); c.fill(); c.strokeStyle = 'rgba(200,230,150,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-58, -11); c.lineTo(-22, -18); c.stroke();
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; c.fillStyle = k % 2 ? '#f08a1c' : '#ffb22e'; c.beginPath(); c.ellipse(-82 + Math.cos(a) * 7, -12 + Math.sin(a) * 5, 6, 4, a, 0, 7); c.fill(); } c.fillStyle = '#c85a10'; c.beginPath(); c.arc(-82, -12, 4, 0, 7); c.fill();
  // the mast and the paper sail with its syllable
  c.strokeStyle = '#5a3a1c'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(4, -6); c.lineTo(4, -150); c.stroke(); c.strokeStyle = 'rgba(230,190,130,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(5, -8); c.lineTo(5, -148); c.stroke();   // a bamboo stick
  const sw = Math.sin(t * 2 + x) * 3;
  const SP = new Path2D(); SP.moveTo(6, -146); SP.quadraticCurveTo(52 + sw, -140, 70 + sw, -132); SP.lineTo(66 + sw, -48); SP.quadraticCurveTo(40, -54, 6, -46); SP.closePath();
  c.save(); c.clip(SP); c.drawImage(PAPER, 0, -152, 76, 110);
  let sg = c.createLinearGradient(6, 0, 72, 0); sg.addColorStop(0, 'rgba(110,70,40,.32)'); sg.addColorStop(.25, 'rgba(110,70,40,0)'); sg.addColorStop(.8, 'rgba(255,250,236,.1)'); sg.addColorStop(1, 'rgba(110,70,40,.18)'); c.fillStyle = sg; c.fillRect(0, -150, 80, 110);   // the paper's curve
  c.globalCompositeOperation = 'lighter'; sg = c.createRadialGradient(36, -30, 0, 36, -40, 90); sg.addColorStop(0, 'rgba(255,170,80,.42)'); sg.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = sg; c.fillRect(0, -150, 80, 110);   // the diya lights it from below
  if (lit > 0) { sg = c.createRadialGradient(38, -94, 0, 38, -94, 60); sg.addColorStop(0, `rgba(255,200,120,${.5 * lit})`); sg.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = sg; c.fillRect(0, -150, 80, 110); }   // and glows through like a lantern once the syllable is sung
  c.restore();
  c.strokeStyle = 'rgba(120,80,50,.45)'; c.lineWidth = 1; c.stroke(SP);
  if (syl) { c.save(); c.font = '700 52px "OdiaSerif"'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#b4281c'; c.fillText(syl, 38 + sw * .5, -94);   // written in alta red
    if (lit > 0) { c.shadowColor = `rgba(255,150,40,${lit})`; c.shadowBlur = 26 * lit; c.fillStyle = `rgb(${lerp(180, 232, lit)},${lerp(40, 70, lit)},${lerp(28, 20, lit)})`; c.fillText(syl, 38 + sw * .5, -94); c.shadowBlur = 0; c.fillText(syl, 38 + sw * .5, -94);   // the syllable ignites: the alta red burns brighter, haloed in gold
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= .45 * lit; c.filter = 'blur(10px)'; c.fillStyle = '#ffb040'; c.fillText(syl, 38 + sw * .5, -94); c.restore(); }
    c.restore(); }
  // the diya and its flame
  diya(c, t, 30, -8, 1, x); flame(c, t, 50, -16, 24, x * .01 + y * .003, 1);
  c.restore();
}
function hull(c) {   // a curved banana-stem hull with raised ends
  c.save(); const P = new Path2D(); P.moveTo(-130, -24); P.quadraticCurveTo(-120, 4, -80, 10); P.lineTo(80, 10); P.quadraticCurveTo(122, 4, 134, -28); P.lineTo(118, -16); P.quadraticCurveTo(0, -2, -114, -14); P.closePath();
  c.clip(P); c.drawImage(BARK, -140, -40, 290, 60); c.restore();
  c.strokeStyle = 'rgba(60,60,30,.6)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-114, -14); c.quadraticCurveTo(0, -2, 118, -16); c.stroke();
}
// distant floating lamps (bokeh) with their reflections
const FAR = Array.from({ length: 30 }, (_, i) => ({ x: hh(i * 3.1) * 1200 - 60, y: HZ + 20 + Math.pow(hh(i * 7.7), 1.6) * 520, s: .3 + hh(i * 5.3) * .9, ph: hh(i * 9) * 6 }));
export function river(c, t, o = {}) {
  const { push = 0, drift = 0 } = o;   // push: slow camera push (0..1); drift: boats' sideways travel
  c.save(); const z = 1 + .06 * push; c.translate(540, 900); c.scale(z, z); c.translate(-540, -900);
  c.drawImage(SKY, 0, 0);
  c.save(); c.globalCompositeOperation = 'lighter';   // ripples catching the sky, and far lamps
  for (let k = 0; k < 120; k++) { const y = HZ + 6 + Math.pow(hh(k * 1.9), 1.7) * 1100, w = 30 + 200 * ((y - HZ) / 1100) * hh(k * 4.1), x = (hh(k * 2.3) * 1300 + t * (6 + 10 * hh(k))) % 1300 - 100, a = .05 + .08 * (1 - (y - HZ) / 1200);
    c.fillStyle = `rgba(255,214,170,${a * (.6 + .4 * Math.sin(t * 2 + k))})`; c.beginPath(); c.ellipse(x + w / 2, y, w / 2, .7 + (y - HZ) / 1000, 0, 0, 7); c.fill(); }
  for (const f of FAR) { const x = f.x + t * 8 * f.s, y = f.y, r = 5 + 12 * f.s, tw = .75 + .25 * Math.sin(t * 5 + f.ph);   // far lamps, out of focus
    const g = c.createRadialGradient(x, y, 0, x, y, r * 4); g.addColorStop(0, `rgba(255,214,140,${.32 * tw})`); g.addColorStop(.35, `rgba(255,170,90,${.14 * tw})`); g.addColorStop(1, 'rgba(255,150,70,0)'); c.fillStyle = g; c.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
    const rg = c.createLinearGradient(0, y + r * .6, 0, y + r * 7); rg.addColorStop(0, `rgba(255,190,110,${.2 * tw})`); rg.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = rg; c.beginPath(); c.ellipse(x, y + r * 3.8, r * .32, r * 3.2, 0, 0, 7); c.fill(); }
  c.restore();
  kids(c, t);
  c.restore();
}
// children on the far ghat steps, small against the bright mist, setting their own lamps on the water
function kid(c, x, y, s, pose, t, k) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#2a1614';
  if (pose === 'crouch') { c.beginPath(); c.ellipse(9, -33, 6.5, 7, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(-13, -10, -6, -14); c.quadraticCurveTo(-4, -26, 4, -27); c.quadraticCurveTo(10, -26, 12, -20); c.lineTo(22, -8); c.lineTo(25, -3); c.lineTo(21, -2); c.lineTo(10, -12); c.lineTo(9, 0); c.closePath(); c.fill();
    c.strokeStyle = '#2a1614'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(4, -36); c.quadraticCurveTo(-2, -30, -2, -20); c.stroke(); }   // crouched, reaching to the water, a ponytail
  else if (pose === 'stand') { c.beginPath(); c.arc(0, -46, 7.5, 0, 7); c.fill(); c.beginPath(); c.moveTo(-9, 0); c.lineTo(-7, -18); c.lineTo(-12, -18); c.quadraticCurveTo(-8, -38, 0, -38); c.quadraticCurveTo(8, -38, 12, -18); c.lineTo(7, -18); c.lineTo(9, 0); c.closePath(); c.fill(); c.fillRect(4, -34, 10, 3.5); }   // a girl in a frock, holding out a lamp
  else { c.beginPath(); c.arc(0, -36, 6.5, 0, 7); c.fill(); c.beginPath(); c.moveTo(-7, 0); c.lineTo(-6, -28); c.quadraticCurveTo(0, -31, 6, -28); c.lineTo(7, 0); c.closePath(); c.fill(); c.save(); c.translate(4, -26); c.rotate(-.9 + .2 * Math.sin(t * 2)); c.fillRect(0, -2, 14, 3.4); c.restore(); }   // a little one, pointing
  c.restore();
}
const KIDS = [[372, 'crouch', 1.25], [410, 'stand', 1.2], [446, 'small', 1.1]];
function kids(c, t) {
  KIDS.forEach(([x, pose, s], k) => kid(c, x, HZ - 6, s, pose, t, k));
  flame(c, t, 410 + 15, HZ - 6 - 34 * 1.2 - 2, 5, 3.1, .9);   // the lamp she holds out
  for (let k = 0; k < 3; k++) { const u = ((t * .05 + k * .33) % 1), lx = 402 + u * 140 + k * 6, ly = HZ + 4 + u * 26; flame(c, t, lx, ly, 3.4 + u * 2, k + 7, .9 * Math.min(1, u * 8)); }   // the lamps they have set floating
}
// the four syllables' boats: where they ride
export const FOUR = [['ଆ', 680, 1185, 1.6], ['କା', 300, 1062, 1.05], ['ମା', 780, 962, .7], ['ବୈ', 420, 902, .48]];
export const SYL_T = [.05, .95, 2.1, 2.85];   // when the song sings each syllable
export function dangas(c, t, o = {}) {
  const { drift = 0, litK = 1, sylA = 1 } = o;
  for (let i = FOUR.length - 1; i >= 0; i--) { const [syl, x, y, s] = FOUR[i]; const lit = litK * ss(seg(t, SYL_T[i], SYL_T[i] + .35));
    danga(c, t, x + drift * s * 60, y, s * 1.35, sylA > 0 ? syl : '', lit * sylA); }
}
export function sailSylPos(i, t, drift = 0) {   // where a syllable sits on screen (for lifting it off)
  const [, x, y, s] = FOUR[i], S = s * 1.35, bob = Math.sin(t * 1.4 + (x + drift * s * 60) * .01) * 4 * S;
  return [x + drift * s * 60 + 38 * S, y + bob - 94 * S, 52 * S];
}
