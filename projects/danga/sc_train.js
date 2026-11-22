// Today: the night train over the Mahanadi bridge. The camera rides alongside, so the girders and the night streak past;
// in one lit window a young man's phone glows WL 47; the coaches' destination boards read Bengaluru, Pune, Hyderabad.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
const COACH = 1120, CY = 980, CH = 320;   // coach length, the coach's mid-height on screen, its height
let COV;   // the coaches' own layer, so they can be motion-blurred as one
export function train(c, t, o = {}) {   // o.pan: how far along the train the camera is (px); o.vel: px/s; o.plate(m): the board of coach m
  const { pan = 0, vel = 0, a = 1, glare = 0, plate = () => null } = o; if (a <= 0) return; c.save(); const A0 = (c.globalAlpha *= a);
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#07080c'); g.addColorStop(.5, '#141018'); g.addColorStop(.62, '#2a1c1a'); g.addColorStop(1, '#08070a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(255,248,232,.7)'; for (let i = 0; i < 90; i++) { c.globalAlpha = A0 * (.3 + .5 * hh(i * 3)); c.beginPath(); c.arc(hh(i * 1.7) * W, hh(i * 2.3) * 600, .6 + hh(i) * 1.3, 0, 7); c.fill(); } c.globalAlpha = A0;
  const bg = pan * .08 + t * 20, far = ((bg % 1400) + 1400) % 1400; c.fillStyle = '#0c0a0c'; c.beginPath(); c.moveTo(0, 760); for (let x = 0; x <= W; x += 20) c.lineTo(x, 740 - 30 * Math.abs(Math.sin((x + far) * .006)) - 12 * hh(Math.floor((x + far) / 20))); c.lineTo(W, 780); c.lineTo(0, 780); c.fill();   // the far bank, sliding slowly
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const x = ((hh(i * 3.1) * 1600 - bg * (1 + hh(i))) % 1600 + 1600) % 1600 - 200; c.fillStyle = `rgba(255,190,110,${.4 + .4 * hh(i * 5)})`; c.beginPath(); c.arc(x, 748 + hh(i * 7) * 16, 1.6 + hh(i) * 2, 0, 7); c.fill(); c.fillStyle = 'rgba(255,190,110,.12)'; c.fillRect(x - 1, 790, 2, 40 + hh(i) * 60); } c.restore();   // village lights and their reflections
  const rv = c.createLinearGradient(0, 780, 0, H); rv.addColorStop(0, '#1e1618'); rv.addColorStop(1, '#060508'); c.fillStyle = rv; c.fillRect(0, 780, W, H - 780);
  // the bridge's far truss, sliding past with the train's speed
  const span = 300, gx = pan * .9 + t * 90, off = ((gx % span) + span) % span, sp = Math.abs(vel);
  c.save(); if (sp > 900) c.filter = `blur(${Math.min(10, sp / 700)}px)`; c.strokeStyle = '#1c1616'; c.lineWidth = 16; for (let x = -span - off; x < W + span; x += span) { c.beginPath(); c.moveTo(x, CY + CH / 2 + 60); c.lineTo(x + span / 2, CY - CH / 2 - 120); c.lineTo(x + span, CY + CH / 2 + 60); c.stroke(); } c.restore();
  c.fillStyle = '#141010'; c.fillRect(0, CY - CH / 2 - 132, W, 22); c.fillRect(0, CY + CH / 2 + 50, W, 30);
  // the coaches, drawn once and smeared by their speed
  if (!COV) COV = mk(W, 640); const v = COV.getContext('2d'), Y0 = CY - 340; v.setTransform(1, 0, 0, 1, 0, 0); v.clearRect(0, 0, W, 640); v.translate(0, -Y0);
  for (let k = -1; k < 3; k++) { const x0 = k * COACH - (((pan % COACH) + COACH) % COACH); const idx = Math.floor(pan / COACH) + k; coach(v, t, x0, idx, plate(idx), pan); }
  const n = Math.max(1, Math.min(9, Math.round(sp / 260))), sh = vel / 30 * .55;
  c.save(); for (let i = 0; i < n; i++) { const dx = n > 1 ? (i / (n - 1) - .5) * sh : 0; c.globalAlpha = A0 / (i + 1); c.drawImage(COV, -dx, Y0); } c.restore();   // a running average of n positions: a true shutter smear
  if (sp > 1200) { c.save(); c.globalAlpha = A0 * Math.min(.9, (sp - 1200) / 3000); c.fillStyle = '#0a0606'; c.filter = 'blur(14px)'; const fo = ((pan * 1.8) % 900 + 900) % 900; for (let x = -fo; x < W + 900; x += 900) c.fillRect(x, CY - CH / 2 - 160, 40, CH + 260); c.restore(); }   // the near truss whipping across the lens at speed
  if (glare > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(540, CY, 0, 540, CY, 900); gl.addColorStop(0, `rgba(255,248,226,${glare})`); gl.addColorStop(.3, `rgba(255,220,170,${.5 * glare})`); gl.addColorStop(1, 'rgba(255,200,140,0)'); c.fillStyle = gl; c.fillRect(0, 0, W, H); c.restore(); }
  c.restore();
}
export const COACH_W = COACH, WIN_Y = CY + 6;
export const winX = (m, w, pan) => m * COACH - pan + 70 + w * 205;   // a coach window's left edge on screen
function coach(c, t, x0, idx, pl, pan) {
  c.fillStyle = '#3a1612'; c.beginPath(); c.roundRect(x0 + 14, CY - CH / 2, COACH - 28, CH, 20); c.fill();
  const sh = c.createLinearGradient(0, CY - CH / 2, 0, CY + CH / 2); sh.addColorStop(0, 'rgba(255,200,150,.10)'); sh.addColorStop(.2, 'rgba(255,200,150,0)'); sh.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = sh; c.beginPath(); c.roundRect(x0 + 14, CY - CH / 2, COACH - 28, CH, 20); c.fill();
  c.fillStyle = '#100808'; c.fillRect(x0 - 14, CY - CH / 2 + 40, 28, CH - 70);   // the vestibule between coaches
  c.fillStyle = '#5a2218'; c.fillRect(x0 + 14, CY - CH / 2 + 14, COACH - 28, 6); c.fillStyle = '#c8a050'; c.fillRect(x0 + 14, CY + CH / 2 - 36, COACH - 28, 6);
  for (let w = 0; w < 5; w++) { const wx = x0 + 70 + w * 205, wy = CY + 6; const lg = c.createLinearGradient(0, wy, 0, wy + 104); lg.addColorStop(0, '#ffd88a'); lg.addColorStop(1, '#e8a050'); c.fillStyle = lg; c.fillRect(wx, wy, 140, 104);
    if ((idx * 3 + w) % 4 === 1) { c.fillStyle = 'rgba(30,14,10,.85)'; c.beginPath(); c.arc(wx + 74, wy + 54, 20, 0, 7); c.fill(); c.fillRect(wx + 44, wy + 72, 60, 34); }   // passengers in silhouette
    c.strokeStyle = 'rgba(60,20,12,.9)'; c.lineWidth = 4; for (let b = 1; b < 6; b++) { c.beginPath(); c.moveTo(wx, wy + b * 17); c.lineTo(wx + 140, wy + b * 17); c.stroke(); } }   // the window bars
  for (const bx of [x0 + 170, x0 + COACH - 170]) { c.fillStyle = '#120a08'; c.fillRect(bx - 110, CY + CH / 2 - 8, 220, 34);   // bogies and turning wheels
    for (const wx of [bx - 62, bx + 62]) { c.fillStyle = '#0c0606'; c.beginPath(); c.arc(wx, CY + CH / 2 + 30, 30, 0, 7); c.fill(); c.strokeStyle = 'rgba(200,170,130,.35)'; c.lineWidth = 3; const an = -pan / 30; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(wx, CY + CH / 2 + 30); c.lineTo(wx + Math.cos(an + k * 2.09) * 26, CY + CH / 2 + 30 + Math.sin(an + k * 2.09) * 26); c.stroke(); } } }
  if (pl) { const bx = x0 + COACH / 2, by = CY - CH / 2 + 28, bw = 560, bh = 142;   // the destination board: an enamel plate, bilingual, as on Indian coaches
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(bx - bw / 2 + 4, by + 6, bw, bh, 8); c.fill();
    const bg = c.createLinearGradient(0, by, 0, by + bh); bg.addColorStop(0, '#fbf3dc'); bg.addColorStop(1, '#e8dcbc'); c.fillStyle = bg; c.beginPath(); c.roundRect(bx - bw / 2, by, bw, bh, 8); c.fill();
    c.strokeStyle = '#8a2a1c'; c.lineWidth = 3; c.beginPath(); c.roundRect(bx - bw / 2 + 8, by + 8, bw - 16, bh - 16, 5); c.stroke();
    c.fillStyle = '#6a5a48'; for (const [rx, ry] of [[-1, 0], [1, 0], [-1, 1], [1, 1]]) { c.beginPath(); c.arc(bx + rx * (bw / 2 - 18), by + 18 + ry * (bh - 36), 3.5, 0, 7); c.fill(); }
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#5a3a2a'; c.font = '600 24px "OdiaSerif"'; c.fillText('ଓଡ଼ିଶାରୁ', bx, by + 30);
    c.font = '700 58px "OdiaSerif"'; const mw = c.measureText(pl[0]).width, fs = Math.min(58, 58 * 460 / mw); c.font = `700 ${fs}px "OdiaSerif"`; c.fillStyle = '#9a1e16'; c.fillText(pl[0], bx, by + 76);
    c.font = '600 22px "InterT"'; c.letterSpacing = '7px'; c.fillStyle = '#2a1e16'; c.fillText(pl[1], bx + 3.5, by + 118); c.letterSpacing = '0px'; }
  const lw = c.createLinearGradient(0, CY + CH / 2, 0, CY + CH / 2 + 300); lw.addColorStop(0, 'rgba(255,190,110,.18)'); lw.addColorStop(1, 'rgba(255,170,90,0)');
}
// the young man in the window, his phone lit: WL 47 (a close-up on one window)
export const WL_WIN = [150, 520, 780, 640];
export function windowWL(c, t, a = 1, F = [540, 960], k = 1, bgA = 1) {
  if (a <= 0) return; c.save(); const A0 = (c.globalAlpha *= a); c.translate(F[0], F[1]); c.scale(k, k); c.translate(-F[0], -F[1]);
  if (bgA > 0) { c.save(); c.globalAlpha = A0 * bgA; c.fillStyle = '#2a100c'; c.fillRect(-W * 4, -H * 4, W * 9, H * 9); c.restore(); }
  c.save(); c.beginPath(); c.rect(150, 520, 780, 640); c.clip();
  const wx = 150, wy = 520, ww = 780, wh = 640, lg = c.createLinearGradient(0, wy, 0, wy + wh); lg.addColorStop(0, '#ffcf80'); lg.addColorStop(1, '#d88a46'); c.fillStyle = lg; c.fillRect(wx, wy, ww, wh);
  c.fillStyle = '#1a0a06'; c.beginPath(); c.ellipse(560, 760, 92, 112, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(380, wy + wh); c.bezierCurveTo(400, 900, 470, 860, 560, 860); c.bezierCurveTo(660, 860, 730, 900, 750, wy + wh); c.fill();   // him, head and shoulders
  c.fillRect(640, 880, 26, 140);
  const px = 600, py = 860, pw = 120, ph = 220; c.fillStyle = '#101418'; c.beginPath(); c.roundRect(px, py, pw, ph, 14); c.fill();
  const sc = c.createLinearGradient(0, py, 0, py + ph); sc.addColorStop(0, '#fff6e4'); sc.addColorStop(1, '#ffe2b0'); c.fillStyle = sc; c.beginPath(); c.roundRect(px + 8, py + 10, pw - 16, ph - 20, 8); c.fill();
  c.fillStyle = '#6a4a2a'; c.font = '600 13px "InterT"'; c.textAlign = 'center'; c.fillText('PNR STATUS', px + pw / 2, py + 50); c.fillStyle = '#b8281c'; c.font = '800 36px "InterT"'; c.fillText('WL 47', px + pw / 2, py + 110); c.fillStyle = '#6a4a2a'; c.font = '600 12px "InterT"'; c.fillText('CTC → SBC', px + pw / 2, py + 150);
  c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(px + pw / 2, py + ph / 2, 0, px + pw / 2, py + ph / 2, 240); gl.addColorStop(0, 'rgba(255,240,210,.35)'); gl.addColorStop(1, 'rgba(255,220,170,0)'); c.fillStyle = gl; c.fillRect(px - 200, py - 200, 520, 600); c.restore();   // the phone lights his face
  c.strokeStyle = 'rgba(40,12,8,.9)'; c.lineWidth = 10; for (let b = 1; b < 6; b++) { c.beginPath(); c.moveTo(wx, wy + b * wh / 6); c.lineTo(wx + ww, wy + b * wh / 6); c.stroke(); }   // the window bars in front of him
  c.restore(); c.restore();
}
