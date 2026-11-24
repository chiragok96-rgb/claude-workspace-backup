// Pattachitra: the temple's own painting, on a cloth ground of vermilion, every form ringed in black, borders of leaf-scrolls.
// The temple gate and its doors; Balabhadra's great white face; Lakshmi's hand raised in a curse; twelve cooking pots going cold;
// a fist that opens on nothing. One canvas; scenes as layers the camera moves across.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
let CLOTH;
const RED = '#b5301c', BLK = '#140c08', CREAM = '#f3e6c4', YEL = '#e0a82c', GRN = '#2e5a3a', WHT = '#f8f2e4';
export function initPatta() {
  CLOTH = mk(W, H); const x = CLOTH.getContext('2d'); x.fillStyle = RED; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 1900; i++) { x.strokeStyle = `rgba(${hh(i) > .5 ? '255,200,170' : '60,10,0'},${.035 + .03 * hh(i * 3)})`; x.lineWidth = 1; const y = hh(i * 1.7) * H; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y + (hh(i * 2) - .5) * 4); x.stroke(); }   // the weave of the cloth
  for (let i = 0; i < 1100; i++) { x.strokeStyle = `rgba(${hh(i * 5) > .5 ? '255,200,170' : '60,10,0'},${.03 + .02 * hh(i * 7)})`; const xx = hh(i * 2.9) * W; x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx + (hh(i * 4) - .5) * 4, H); x.stroke(); }
  const g = x.createRadialGradient(540, 900, 300, 540, 960, 1200); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,6,0,.45)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
}
export function cloth(c) { c.drawImage(CLOTH, 0, 0); }
const ink = (c, w = 5) => { c.strokeStyle = BLK; c.lineWidth = w; c.lineJoin = 'round'; c.lineCap = 'round'; };
export function border(c, t, a = 1, inset = 34) {   // the painted frame: a black rule, a cream band of leaf-scrolls, a yellow rule of dots
  if (a <= 0) return; c.save(); c.globalAlpha *= a;
  const L = inset, R = W - inset, T = 250 - 40, B = H - 420, bw = 46;   // the frame sits inside the safe area
  c.fillStyle = CREAM; c.fillRect(L, T, R - L, bw); c.fillRect(L, B - bw, R - L, bw); c.fillRect(L, T, bw, B - T); c.fillRect(R - bw, T, bw, B - T);
  ink(c, 4); c.strokeRect(L, T, R - L, B - T); c.strokeRect(L + bw, T + bw, R - L - 2 * bw, B - T - 2 * bw);
  const leaf = (x, y, an) => { c.save(); c.translate(x, y); c.rotate(an); c.fillStyle = RED; c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(0, -11, 12, 0); c.quadraticCurveTo(0, 11, -12, 0); c.fill(); ink(c, 2); c.stroke(); c.restore(); };
  for (let x = L + 30; x < R - 20; x += 34) { leaf(x, T + bw / 2, (x / 34 | 0) % 2 ? .6 : -.6); leaf(x, B - bw / 2, (x / 34 | 0) % 2 ? .6 : -.6); }
  for (let y = T + 60; y < B - 40; y += 34) { leaf(L + bw / 2, y, Math.PI / 2 + ((y / 34 | 0) % 2 ? .6 : -.6)); leaf(R - bw / 2, y, Math.PI / 2 + ((y / 34 | 0) % 2 ? .6 : -.6)); }
  c.fillStyle = YEL; for (let x = L + bw + 10; x < R - bw; x += 16) { c.beginPath(); c.arc(x, T + bw + 9, 3.2, 0, 7); c.fill(); c.beginPath(); c.arc(x, B - bw - 9, 3.2, 0, 7); c.fill(); }
  c.restore();
}
// the temple gate: a stepped arch, its two great doors (open → shut), a shikhara above with its wheel and flag
export function gate(c, t, o = {}) {
  const { shut = 0, x = 540, y = 1300, s = 1, a = 1, glow = 0 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s);
  c.fillStyle = CREAM; c.beginPath(); c.moveTo(-290, 0); c.lineTo(-290, -470); for (let k = 0; k < 5; k++) { c.lineTo(-290 + k * 20, -470 - k * 26); c.lineTo(-270 + k * 20, -470 - k * 26); } c.lineTo(0, -720); for (let k = 4; k >= 0; k--) { c.lineTo(270 - k * 20, -470 - k * 26); c.lineTo(290 - k * 20, -470 - k * 26); } c.lineTo(290, -470); c.lineTo(290, 0); c.closePath(); c.fill(); ink(c, 6); c.stroke();
  for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-250 + k * 26, -460 - k * 24); c.lineTo(250 - k * 26, -460 - k * 24); c.stroke(); }
  c.fillStyle = YEL; c.beginPath(); c.arc(0, -740, 26, 0, 7); c.fill(); ink(c, 4); c.stroke(); for (let k = 0; k < 8; k++) { const an = k / 8 * 6.283; c.beginPath(); c.moveTo(0, -740); c.lineTo(Math.cos(an) * 26, -740 + Math.sin(an) * 26); c.stroke(); }   // the wheel (Nilachakra)
  ink(c, 4); c.beginPath(); c.moveTo(0, -766); c.lineTo(0, -840); c.stroke(); c.fillStyle = RED; c.beginPath(); c.moveTo(0, -840); c.quadraticCurveTo(60, -830 + 6 * Math.sin(t * 3), 100, -812 + 10 * Math.sin(t * 3 + 1)); c.lineTo(0, -800); c.closePath(); c.fill(); c.stroke();   // the flag
  // the doorway and its doors
  c.fillStyle = BLK; c.beginPath(); c.moveTo(-190, 0); c.lineTo(-190, -330); c.quadraticCurveTo(0, -450, 190, -330); c.lineTo(190, 0); c.closePath(); c.fill();
  if (glow > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(0, -150, 10, 0, -150, 300); g.addColorStop(0, `rgba(255,220,150,${glow})`); g.addColorStop(1, 'rgba(255,180,100,0)'); c.fillStyle = g; c.fillRect(-190, -450, 380, 450); c.restore(); }
  const leafW = 190 * clamp(shut);
  for (const sd of [-1, 1]) { if (leafW < 2) break; c.save(); c.beginPath(); c.moveTo(-190, 0); c.lineTo(-190, -330); c.quadraticCurveTo(0, -450, 190, -330); c.lineTo(190, 0); c.closePath(); c.clip();
    const x0 = sd < 0 ? -190 : 190 - leafW; c.fillStyle = '#7a2a14'; c.fillRect(x0, -460, leafW, 460); ink(c, 5); c.strokeRect(x0, -460, leafW, 460);
    for (let r = 0; r < 4; r++) for (let q = 0; q < 2; q++) { const cx = x0 + leafW * (.3 + .4 * q), cy = -60 - r * 90; c.fillStyle = YEL; c.beginPath(); c.arc(cx, cy, 15 * leafW / 190, 0, 7); c.fill(); ink(c, 3); c.stroke(); }   // brass bosses
    c.restore(); }
  ink(c, 6); c.beginPath(); c.moveTo(-190, 0); c.lineTo(-190, -330); c.quadraticCurveTo(0, -450, 190, -330); c.lineTo(190, 0); c.stroke();
  c.restore();
}
// a deity's face in the Pattachitra manner: ringed in black, the crown worked in gold and red, earrings, the eyes
export function pattaFace(c, t, x, y, s, who, o = {}) {
  const { a = 1, look = 0, stern = 0, wide = 0 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s);
  const face = who === 'J' ? '#141012' : WHT;
  // the crown (mukuta)
  c.fillStyle = YEL; c.beginPath(); c.moveTo(-150, -230); c.lineTo(-170, -330); c.quadraticCurveTo(-120, -300, -90, -350); c.quadraticCurveTo(-50, -300, 0, -400); c.quadraticCurveTo(50, -300, 90, -350); c.quadraticCurveTo(120, -300, 170, -330); c.lineTo(150, -230); c.closePath(); c.fill(); ink(c, 6); c.stroke();
  c.fillStyle = RED; for (const [cx, cy, r] of [[0, -320, 16], [-90, -300, 11], [90, -300, 11]]) { c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill(); ink(c, 3); c.stroke(); }
  c.fillStyle = GRN; c.fillRect(-150, -252, 300, 22); ink(c, 4); c.strokeRect(-150, -252, 300, 22); c.fillStyle = CREAM; for (let k = 0; k < 13; k++) { c.beginPath(); c.arc(-138 + k * 23, -241, 4, 0, 7); c.fill(); }
  // the face
  c.fillStyle = face; c.beginPath(); c.moveTo(-150, -230); c.bezierCurveTo(-170, -120, -160, 0, -110, 60); c.quadraticCurveTo(0, 110, 110, 60); c.bezierCurveTo(160, 0, 170, -120, 150, -230); c.closePath(); c.fill(); ink(c, 7); c.stroke();
  // earrings
  for (const sd of [-1, 1]) { c.fillStyle = YEL; c.beginPath(); c.arc(sd * 172, -60, 26, 0, 7); c.fill(); ink(c, 4); c.stroke(); c.fillStyle = RED; c.beginPath(); c.arc(sd * 172, -60, 10, 0, 7); c.fill(); }
  // brows: a stern line for Balabhadra
  ink(c, 6); if (who === 'B') for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(sd * 20, -170 + 14 * stern); c.quadraticCurveTo(sd * 70, -192 + 10 * stern, sd * 120, -170 - 8 * stern); c.stroke(); }
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * 66, -110);   // the eyes: Balabhadra's long and almond, Jagannath's perfectly round
    c.fillStyle = CREAM; c.beginPath(); if (who === 'J') c.arc(0, 0, 54 * (1 + .1 * wide), 0, 7); else c.ellipse(0, 0, 58, 36 * (1 - .25 * stern), 0, 0, 7); c.fill();
    c.strokeStyle = '#c4201a'; c.lineWidth = 12; c.stroke(); ink(c, 4); c.stroke();
    c.fillStyle = BLK; c.beginPath(); c.arc(look * 16, 0, who === 'J' ? 22 + 5 * wide : 20, 0, 7); c.fill(); c.restore(); }
  c.fillStyle = '#c4201a'; c.beginPath(); c.moveTo(-60, 10); c.quadraticCurveTo(0, 40 - 20 * stern, 60, 10); c.quadraticCurveTo(0, 26 - 14 * stern, -60, 10); c.fill(); ink(c, 3); c.stroke();   // the mouth
  c.fillStyle = who === 'J' ? CREAM : '#c4201a'; c.beginPath(); c.moveTo(-12, -150); c.lineTo(0, -214); c.lineTo(12, -150); c.closePath(); c.fill(); ink(c, 3); c.stroke();   // the tilaka
  c.restore();
}
// Lakshmi's hand, painted: alta-red palm and fingertips, rings, bangles, raised — and around it the heat of her anger
export function pattaHand(c, t, x, y, s, o = {}) {
  const { a = 1, fire = 0, open = 1, rot = 0, lotus = 0 } = o; if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(x, y); c.rotate(rot); c.scale(s, s);
  if (fire > 0) { for (let k = 0; k < 18; k++) { const an = -Math.PI / 2 + (k - 8.5) * .19, L = (330 + 60 * Math.sin(t * 9 + k * 2)) * fire; c.fillStyle = k % 2 ? YEL : '#e86a1c'; c.beginPath(); c.moveTo(Math.cos(an - .07) * 120, -160 + Math.sin(an - .07) * 120); c.quadraticCurveTo(Math.cos(an) * L * .7, -160 + Math.sin(an) * L * .7 - 20, Math.cos(an) * L, -160 + Math.sin(an) * L); c.quadraticCurveTo(Math.cos(an) * L * .7 + 14, -160 + Math.sin(an) * L * .7, Math.cos(an + .07) * 120, -160 + Math.sin(an + .07) * 120); c.fill(); ink(c, 2.5); c.stroke(); } }   // a halo of flame, painted
  const skin = '#f0c29a';
  const F = [[-62, -150, 150, 30, -.16], [-22, -170, 176, 31, -.05], [20, -166, 168, 30, .05], [58, -146, 130, 26, .16]];
  F.forEach(([fx, fy, L, w, th]) => { const len = L * lerp(.38, 1, open); c.save(); c.translate(fx, fy); c.rotate(th); c.fillStyle = skin; c.beginPath(); c.moveTo(-w / 2, 20); c.lineTo(-w / 2, -len + w / 2); c.quadraticCurveTo(0, -len - w * .3, w / 2, -len + w / 2); c.lineTo(w / 2, 20); c.closePath(); c.fill(); ink(c, 4.5); c.stroke();
    c.fillStyle = '#c4201a'; c.beginPath(); c.moveTo(-w / 2 + 3, -len + w * .9); c.quadraticCurveTo(0, -len - w * .2, w / 2 - 3, -len + w * .9); c.closePath(); c.fill(); c.restore(); });   // alta on the fingertips
  c.fillStyle = skin; c.beginPath(); c.moveTo(-86, -150); c.bezierCurveTo(-96, -60, -80, 20, -60, 60); c.lineTo(60, 60); c.bezierCurveTo(84, 10, 92, -70, 82, -146); c.closePath(); c.fill(); ink(c, 5); c.stroke();
  c.save(); c.translate(-82, -40); c.rotate(-.7 - .5 * (1 - open)); c.fillStyle = skin; c.beginPath(); c.moveTo(-18, 20); c.lineTo(-18, -96); c.quadraticCurveTo(0, -118, 18, -96); c.lineTo(18, 20); c.closePath(); c.fill(); ink(c, 4.5); c.stroke(); c.restore();   // the thumb
  c.fillStyle = '#c4201a'; c.beginPath(); c.arc(0, -60, 34, 0, 7); c.fill(); c.fillStyle = skin; c.beginPath(); c.arc(0, -60, 20, 0, 7); c.fill(); c.fillStyle = '#c4201a'; c.beginPath(); c.arc(0, -60, 9, 0, 7); c.fill();   // the alta circle on the palm
  c.fillStyle = skin; c.fillRect(-58, 56, 118, 160); ink(c, 5); c.beginPath(); c.moveTo(-58, 60); c.lineTo(-58, 216); c.moveTo(60, 60); c.lineTo(60, 216); c.stroke();
  [[80, YEL], [104, '#c4201a'], [128, CREAM], [152, YEL]].forEach(([yy, col]) => { c.fillStyle = col; c.beginPath(); c.roundRect(-70, yy, 142, 18, 9); c.fill(); ink(c, 3); c.stroke(); });   // bangles
  c.restore();
}
// twelve earthen cooking pots in a ring; each, in turn, goes cold and black — twelve years
export function pots(c, t, cx, cy, R, cold, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha *= a;
  for (let k = 0; k < 12; k++) { const an = -Math.PI / 2 + k / 12 * 6.283, x = cx + Math.cos(an) * R, y = cy + Math.sin(an) * R, q = clamp(cold * 12 - k);
    c.save(); c.translate(x, y); const col = q > 0 ? `rgb(${Math.round(lerp(176, 30, q))},${Math.round(lerp(80, 22, q))},${Math.round(lerp(40, 18, q))})` : '#b05028';
    c.fillStyle = col; c.beginPath(); c.ellipse(0, 10, 44, 40, 0, 0, 7); c.fill(); ink(c, 4); c.stroke(); c.fillRect(-26, -34, 52, 14); c.strokeRect(-26, -34, 52, 14);
    if (q < 1) { c.globalAlpha *= 1 - q; c.strokeStyle = CREAM; c.lineWidth = 3; for (let j = -1; j <= 1; j++) { c.beginPath(); c.moveTo(j * 12, -40); c.bezierCurveTo(j * 12 + 10, -60, j * 12 - 10, -76, j * 12 + 4, -96 - 6 * Math.sin(t * 4 + k + j)); c.stroke(); } }   // steam, while it is warm
    c.restore(); }
  c.restore();
}
