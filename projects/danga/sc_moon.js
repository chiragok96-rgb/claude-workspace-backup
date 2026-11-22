// Moons. The four syllables become four full moons over the sea (lunar months, Purnima); a boita sails beneath them while
// moons rise and set (the voyage counted in moons); the shore and the ghat, a mother's silhouette; her hand against the moon,
// fingers folding as the moon wanes and waxes behind it.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk, bez, chain } from './common.js';
export const MOON_X = [210, 430, 650, 870], MOON_Y = [520, 430, 430, 520];   // the four moons' places in the sky (an arc)
let MOONTEX;
export function initMoon() {   // a moon disc with maria, rendered once
  const S = 512, c = mk(S, S), x = c.getContext('2d'), g = x.createRadialGradient(S * .42, S * .4, S * .05, S / 2, S / 2, S / 2); g.addColorStop(0, '#fffaf0'); g.addColorStop(.8, '#efe2c8'); g.addColorStop(1, '#d8c6a4');
  x.fillStyle = g; x.beginPath(); x.arc(S / 2, S / 2, S / 2 - 2, 0, 7); x.fill(); x.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 26; i++) { const px = S * (.2 + .6 * hh(i * 1.7)), py = S * (.2 + .6 * hh(i * 2.9)), r = S * (.03 + .12 * hh(i * 4.1) ** 2); x.fillStyle = `rgba(150,130,104,${.12 + .14 * hh(i * 5)})`; x.beginPath(); x.ellipse(px, py, r, r * (.7 + .3 * hh(i)), hh(i * 7) * 3, 0, 7); x.fill(); }
  for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(120,100,80,${.05 + .06 * hh(i * 3)})`; x.beginPath(); x.arc(hh(i * 1.3) * S, hh(i * 2.1) * S, 1 + hh(i * 9) * 4, 0, 7); x.fill(); }
  MOONTEX = c;
}
export function moon(c, x, y, r, a = 1, phase = 1, halo = 1) {   // phase: 1 full … 0 new (a terminator sweeps across)
  if (a <= 0 || r <= 0) return; c.save(); c.globalAlpha = a;
  if (halo > 0) { const h = c.createRadialGradient(x, y, r * .8, x, y, r * 4.2); h.addColorStop(0, `rgba(255,238,206,${.18 * halo * phase})`); h.addColorStop(1, 'rgba(255,230,196,0)'); c.fillStyle = h; c.fillRect(x - r * 4.2, y - r * 4.2, r * 8.4, r * 8.4); }
  c.drawImage(MOONTEX, x - r, y - r, r * 2, r * 2);
  if (phase < .999) { c.fillStyle = 'rgba(14,10,12,.94)'; c.beginPath(); const k = 1 - phase * 2;   // the shadow
    c.arc(x, y, r + .5, -Math.PI / 2, Math.PI / 2, false); c.ellipse(x, y, Math.abs(k) * r, r + .5, 0, Math.PI / 2, -Math.PI / 2, k > 0); c.fill(); }
  c.restore();
}
// —— night/dawn sky over the sea, with the moons ——
export function skySea(c, t, o = {}) {   // o: horizon (screen y), warm (0 night … 1 dawn), seaShift (x pan of the sea), stars
  const { hz = 1180, warm = 0, a = 1 } = o; if (a <= 0) return; c.save(); c.globalAlpha = a;
  const top = [lerp(12, 30, warm), lerp(10, 20, warm), lerp(13, 26, warm)], mid = [lerp(34, 120, warm), lerp(28, 70, warm), lerp(32, 60, warm)], low = [lerp(78, 236, warm), lerp(62, 160, warm), lerp(60, 110, warm)];   // a warm night: charcoal with a rose glow at the horizon
  const g = c.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, `rgb(${top})`); g.addColorStop(.6, `rgb(${mid})`); g.addColorStop(1, `rgb(${low})`); c.fillStyle = g; c.fillRect(0, 0, W, hz);
  c.fillStyle = 'rgba(255,250,236,.8)'; for (let i = 0; i < 160; i++) { const tw = .4 + .6 * Math.abs(Math.sin(t * (1 + hh(i) * 2) + i)); c.globalAlpha = a * tw * (1 - warm) * .8; c.beginPath(); c.arc(hh(i * 1.9) * W, hh(i * 3.7) * hz * .8, .6 + hh(i * 5) * 1.4, 0, 7); c.fill(); }
  c.globalAlpha = a;
  const sg = c.createLinearGradient(0, hz, 0, H); sg.addColorStop(0, `rgb(${low.map(v => v * .75)})`); sg.addColorStop(.25, `rgb(${mid.map(v => v * .55)})`); sg.addColorStop(1, '#06070a'); c.fillStyle = sg; c.fillRect(0, hz, W, H - hz);
  c.restore();
}
export function moonPath(c, t, x, hz, r, a) {   // a moon's light on the water
  if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 170; i++) { const k = Math.pow(hh(i * 1.7), 1.3), y = hz + 4 + k * (H - hz), w = 10 + 260 * k * (r / 70), xx = x + (hh(i * 3.3) - .5) * w * 1.3; const tw = Math.pow(Math.max(0, Math.sin(t * (2 + hh(i) * 3) + i)), 5); if (tw < .05) continue;
    c.fillStyle = `rgba(255,240,214,${a * tw * (.75 - .4 * k)})`; c.fillRect(xx - (3 + 12 * k) / 2, y, 3 + 12 * k, 1.4 + 1.6 * k); }
  c.restore();
}
// —— the boita: a dark hull, two square sails, a lamp ——
export function boita(c, x, y, s, t, a = 1, lamp = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y + Math.sin(t * 1.4) * 3 * s); c.rotate(Math.sin(t * 1.1) * .02); c.scale(s, s);
  c.fillStyle = '#0c0807';
  c.beginPath(); c.moveTo(-270, -20); c.quadraticCurveTo(-200, 60, 0, 62); c.quadraticCurveTo(200, 60, 280, -24); c.quadraticCurveTo(300, -70, 330, -96); c.lineTo(318, -60); c.lineTo(250, -14); c.lineTo(-240, -14); c.quadraticCurveTo(-290, -50, -300, -86); c.closePath(); c.fill();
  c.fillRect(-64, -440, 9, 430); c.fillRect(150, -360, 8, 350);
  const sail = (x0, y0, w, h, b) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + w, y0); c.quadraticCurveTo(x0 + w + b, y0 + h / 2, x0 + w, y0 + h); c.lineTo(x0, y0 + h); c.quadraticCurveTo(x0 + b, y0 + h / 2, x0, y0); c.fill(); };
  sail(-200, -420, 270, 330, 46); sail(70, -340, 180, 260, 36);
  c.strokeStyle = 'rgba(240,214,170,.55)'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-300, -86); c.quadraticCurveTo(-290, -50, -240, -14); c.lineTo(250, -14); c.lineTo(318, -60); c.lineTo(330, -96); c.stroke();   // moonlight on the gunwale
  c.beginPath(); c.moveTo(-200, -420); c.lineTo(70, -420); c.quadraticCurveTo(116, -255, 70, -90); c.stroke();
  if (lamp > 0) { c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(300, -40, 0, 300, -40, 80); g.addColorStop(0, `rgba(255,214,140,${.8 * lamp})`); g.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = g; c.fillRect(220, -120, 160, 160); }
  c.restore();
}
// —— the shore: the ghat, a temple, and the mother on the steps (all silhouettes, rim-lit by the moon) ——
export function mother(c, x, y, s, a = 1, rim = 1, look = 0) {   // standing, seen from behind-three-quarters: pallu over her head, the saree's border
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  const P = new Path2D();
  P.moveTo(-74, 0); P.bezierCurveTo(-70, -120, -60, -210, -52, -270); P.bezierCurveTo(-58, -330, -66, -380, -62, -420);   // left flank to shoulder
  P.bezierCurveTo(-58, -450, -40, -462, -30, -470); P.bezierCurveTo(-42, -500, -40, -548, -12, -566); P.bezierCurveTo(16, -582, 48, -566, 52, -532);   // shoulder, covered head
  P.bezierCurveTo(56, -500, 50, -478, 44, -466); P.bezierCurveTo(62, -454, 76, -436, 80, -410); P.bezierCurveTo(86, -360, 74, -300, 66, -262);   // the other shoulder, the arm
  P.bezierCurveTo(74, -200, 84, -110, 92, 0); P.closePath();
  c.fillStyle = '#0b0807'; c.fill(P);
  if (rim > 0) { c.save(); c.clip(P); c.strokeStyle = `rgba(255,226,180,${.85 * rim})`; c.lineWidth = 5; c.translate(3, -2); c.stroke(P); c.restore();
    c.strokeStyle = `rgba(214,96,64,${.55 * rim})`; c.lineWidth = 4; c.beginPath(); c.moveTo(44, -466); c.bezierCurveTo(30, -400, -10, -330, -56, -280); c.stroke(); c.beginPath(); c.moveTo(-74, -6); c.bezierCurveTo(-20, -14, 40, -2, 92, -6); c.stroke(); }   // the saree's red border
  c.restore();
}
export function temple(c, x, y, s, col = '#0d0a0a') {   // a rekha deula with its jagamohana
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-60, 0); for (let i = 0; i <= 20; i++) { const u = i / 20; c.lineTo(-60 * (1 - .58 * u ** 2.4), -200 * u); } for (let i = 20; i >= 0; i--) { const u = i / 20; c.lineTo(60 * (1 - .58 * u ** 2.4), -200 * u); } c.fill();
  c.beginPath(); c.ellipse(0, -204, 32, 9, 0, 0, 7); c.fill(); c.fillRect(-3, -250, 6, 44); c.beginPath(); c.moveTo(-6, -246); c.lineTo(28, -238); c.lineTo(-6, -230); c.fill();
  c.beginPath(); c.moveTo(60, 0); for (let i = 0; i < 6; i++) { c.lineTo(60 + i * 4, -i * 18); c.lineTo(60 + i * 4 + 6, -i * 18 - 18); } c.lineTo(132, -110); c.lineTo(140, -120); c.lineTo(150, -110); for (let i = 5; i >= 0; i--) { c.lineTo(240 - i * 4 - 6, -i * 18 - 18); c.lineTo(240 - i * 4, -i * 18); } c.lineTo(240, 0); c.fill();
  c.restore();
}
export function ghat(c, t, x0, hz, a = 1) {   // the ghat's stone steps descending into the water, a lamp post, palms (screen space, starting at x0)
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x0, 0);
  for (let k = 0; k < 7; k++) { const y = hz + 40 + k * 46, w = 900 - k * 60; c.fillStyle = k % 2 ? '#15100e' : '#1a1411'; c.fillRect(-20, y, w, 46); c.fillStyle = 'rgba(255,220,170,.10)'; c.fillRect(-20, y, w, 2); }
  c.fillStyle = '#120d0c'; c.fillRect(-20, hz - 90, 600, 132); c.fillStyle = 'rgba(255,226,190,.16)'; c.fillRect(-20, hz - 90, 600, 2);   // a low embankment, moonlight on its edge
  for (let i = 0; i < 14; i++) { c.fillStyle = 'rgba(255,214,170,.05)'; c.fillRect(-20 + i * 44, hz - 88, 2, 128); }
  temple(c, 150, hz - 88, 1.25, '#1a1312');   // the temple, behind and to the side of her
  c.save(); c.globalCompositeOperation = 'lighter'; const tg = c.createRadialGradient(150, hz - 260, 0, 150, hz - 260, 320); tg.addColorStop(0, 'rgba(255,220,180,.06)'); tg.addColorStop(1, 'rgba(255,220,180,0)'); c.fillStyle = tg; c.fillRect(-170, hz - 580, 640, 640); c.restore();
  c.strokeStyle = 'rgba(255,230,196,.22)'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20; c.lineTo(150 + 60 * 1.25 * (1 - .58 * u ** 2.4), hz - 88 - 200 * 1.25 * u); } c.stroke();   // moonlight down the shikhara's edge
  c.restore();
}
// —— her hand, raised against the moon; fingers fold as months pass ——
export function handVsMoon(c, t, mx, my, r, folded, a = 1) {   // folded: 0..4 fingers folded (fractional); a woman's hand, palm toward us, against the moon
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(mx - 20, my + r * .3 - 60); const s = r / 300; c.scale(s, s);
  c.fillStyle = '#0a0706';
  const F = [[-92, -6, 230, 46, -.13], [-30, -22, 268, 48, -.04], [34, -16, 250, 46, .05], [92, 6, 196, 40, .15]];   // [x, y, length, width, lean]
  F.forEach(([fx, fy, L, w, th], i) => { const f = eio(clamp(folded - (3 - i))), len = L * (1 - .7 * f), bend = .35 * f;   // the little finger folds first
    c.save(); c.translate(fx, fy); c.rotate(th + bend * .3);
    c.beginPath(); c.moveTo(-w / 2, 40); c.bezierCurveTo(-w * .52, -len * .4, -w * .46, -len * .8, -w * .36, -len + w * .3); c.quadraticCurveTo(-w * .2, -len - 2, 0, -len); c.quadraticCurveTo(w * .2, -len - 2, w * .36, -len + w * .3); c.bezierCurveTo(w * .46, -len * .8, w * .5, -len * .4, w / 2, 40); c.closePath(); c.fill();
    c.restore(); });
  c.beginPath(); c.moveTo(-122, 40); c.bezierCurveTo(-128, 130, -118, 220, -96, 300); c.bezierCurveTo(-88, 360, -90, 430, -92, 520); c.lineTo(108, 520);
  c.bezierCurveTo(106, 430, 104, 350, 112, 290); c.bezierCurveTo(130, 200, 132, 110, 118, 20); c.bezierCurveTo(60, -4, -60, -6, -122, 40); c.closePath(); c.fill();   // the palm, the wrist
  c.save(); c.translate(-112, 236); c.rotate(-.78 + .25 * Math.sin(t * .8)); c.beginPath(); c.moveTo(-26, 30); c.bezierCurveTo(-30, -60, -26, -130, -18, -168); c.quadraticCurveTo(0, -186, 18, -168); c.bezierCurveTo(26, -120, 30, -50, 30, 30); c.closePath(); c.fill(); c.restore();   // the thumb
  c.strokeStyle = 'rgba(255,240,214,.55)'; c.lineWidth = 6; for (const yy of [430, 456]) { c.beginPath(); c.moveTo(-94, yy); c.quadraticCurveTo(8, yy + 14, 108, yy); c.stroke(); }   // shankha and pola, catching the moonlight
  c.strokeStyle = 'rgba(255,236,200,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(118, 20); c.bezierCurveTo(132, 110, 130, 200, 112, 290); c.stroke();   // moonlight on the edge of her hand
  c.restore();
}
