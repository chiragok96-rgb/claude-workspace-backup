// The climax: dawn at the water's edge, low and close. A mother and her small daughter kneel on the ghat's last step, in profile,
// the danga between their hands; across the river the temple, and the first sun rising behind its shikhara. The mother lets go;
// the girl sets it on the water; it drifts toward the sun.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
import { danga, flame } from './sc_river.js';
import { temple } from './sc_moon.js';
import { motherKneeling, girlKneeling } from './sc_people.js';
export const DZ = { hz: 1000, step: 1236, water: 1262, temple: [640, 1000], ts: 1.35 };
let BACK;
function initBack() {   // the sky and the far bank (static)
  const c = mk(W, H), x = c.getContext('2d'), hz = DZ.hz;
  const g = x.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, '#2a181c'); g.addColorStop(.42, '#6e3632'); g.addColorStop(.75, '#c8704c'); g.addColorStop(.93, '#f4ae6e'); g.addColorStop(1, '#ffd8a2'); x.fillStyle = g; x.fillRect(0, 0, W, hz);
  x.filter = 'blur(6px)'; for (let i = 0; i < 11; i++) { const y = 300 + i * 54 + hh(i) * 20, a = .07 + .07 * hh(i * 3); x.fillStyle = `rgba(255,${190 + 40 * hh(i * 5)},${140 + 40 * hh(i * 7)},${a})`; x.beginPath(); x.ellipse(hh(i * 7) * W, y, 300 + hh(i * 9) * 340, 7 + hh(i) * 9, 0, 0, 7); x.fill(); } x.filter = 'none';
  const r = x.createLinearGradient(0, hz, 0, H); r.addColorStop(0, '#f0b07a'); r.addColorStop(.06, '#b8684a'); r.addColorStop(.3, '#5a2e28'); r.addColorStop(1, '#1a0e0c'); x.fillStyle = r; x.fillRect(0, hz, W, H - hz);
  BACK = c;
}
export function sunY(t) { return lerp(1010, 830, eio(seg(t, 43.6, 50.0))); }
export function dawnGhat(c, t, o = {}) {
  if (!BACK) initBack();
  const { release = 0, place = 0, drift = 0 } = o, hz = DZ.hz, [tx] = DZ.temple;
  c.drawImage(BACK, 0, 0);
  const sy = sunY(t), sr = 96;
  c.save(); c.globalCompositeOperation = 'lighter';   // the sun's glow, and the sun, behind the temple
  let g = c.createRadialGradient(tx, sy, 0, tx, sy, 900); g.addColorStop(0, 'rgba(255,226,170,.75)'); g.addColorStop(.18, 'rgba(255,180,110,.35)'); g.addColorStop(.5, 'rgba(255,140,80,.12)'); g.addColorStop(1, 'rgba(255,120,60,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.restore();
  c.save(); c.beginPath(); c.rect(0, 0, W, hz - 6); c.clip(); g = c.createRadialGradient(tx, sy, 0, tx, sy, sr); g.addColorStop(0, '#fffdf2'); g.addColorStop(.8, '#fff0c8'); g.addColorStop(1, '#ffd98e'); c.fillStyle = g; c.beginPath(); c.arc(tx, sy, sr, 0, 7); c.fill(); c.restore();
  // the far bank: trees and a low ghat, hazy; the temple dark against the sun
  c.fillStyle = '#4a2420'; c.beginPath(); c.moveTo(0, hz); for (let X = 0; X <= W; X += 10) c.lineTo(X, hz - 14 - 22 * Math.abs(Math.sin(X * .017 + 1)) - 9 * hh(Math.floor(X / 10))); c.lineTo(W, hz); c.fill();
  temple(c, tx, hz - 4, DZ.ts, '#241010');
  c.save(); c.globalCompositeOperation = 'lighter'; g = c.createRadialGradient(tx, sy, sr * .6, tx, sy, sr * 2.2); g.addColorStop(0, 'rgba(255,214,150,.32)'); g.addColorStop(1, 'rgba(255,190,120,0)'); c.fillStyle = g; c.fillRect(tx - 260, sy - 260, 520, 520);   // light bleeding round the shikhara
  c.filter = 'blur(14px)'; for (let k = 0; k < 9; k++) { const an = -Math.PI / 2 + (k - 4) * .26 + .04 * Math.sin(t * .3 + k), L = 420 + 300 * hh(k); c.strokeStyle = `rgba(255,214,150,${.035 + .025 * hh(k * 3)})`; c.lineWidth = 24 + 30 * hh(k * 5); c.beginPath(); c.moveTo(tx, sy); c.lineTo(tx + Math.cos(an) * L, sy + Math.sin(an) * L); c.stroke(); } c.filter = 'none';   // soft rays
  const mist = c.createLinearGradient(0, hz - 70, 0, hz + 30); mist.addColorStop(0, 'rgba(255,214,170,0)'); mist.addColorStop(.7, 'rgba(255,214,170,.32)'); mist.addColorStop(1, 'rgba(255,214,170,.12)'); c.fillStyle = mist; c.fillRect(0, hz - 70, W, 100);
  for (let i = 0; i < 150; i++) {   // the sun's path on the water
    const k = Math.pow(hh(i * 1.7), 1.4), y = hz + 4 + k * (H - hz), w = 8 + 150 * k, xx = tx + (hh(i * 3.3) - .5) * (30 + 260 * k); const tw = Math.pow(Math.max(0, Math.sin(t * (2 + hh(i) * 3) + i)), 4); if (tw < .05) continue;
    c.fillStyle = `rgba(255,232,190,${tw * (.7 - .45 * k)})`; c.beginPath(); c.ellipse(xx, y, w / 2, .8 + 1.4 * k, 0, 0, 7); c.fill(); }
  c.restore();
  for (let i = 0; i < 12; i++) { const k = hh(i * 4.3), x = hh(i * 2.9) * W, y = hz + 10 + k * k * 200; const fx = (x + t * 6 * (1 + k)) % (W + 80) - 40; flame(c, t, fx, y, 4 + 8 * k, i, .8); }   // other dangas, far out, their lamps
  // the danga: held, set down, drifting toward the sun
  const D0 = [716, 1206], D1 = [770, DZ.water + 6], pl = eio(place), dr = eio(drift);
  let dx = lerp(D0[0], D1[0], pl), dy = lerp(D0[1], D1[1], pl), ds = 1.12; const px = dx, py = dy; dx = lerp(dx, tx + 20, dr); dy = lerp(dy, hz + 30, Math.pow(dr, .7)); ds = lerp(ds, .16, Math.pow(dr, .6));
  // the step: old laterite, wet at its edge, and its reflection
  c.fillStyle = '#2a1914'; c.fillRect(0, DZ.step, 880, DZ.water - DZ.step);
  for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(${hh(i) > .5 ? '120,70,50' : '10,6,4'},${.25 + .25 * hh(i * 3)})`; c.beginPath(); c.arc(hh(i * 1.9) * 880, DZ.step + 4 + hh(i * 2.7) * (DZ.water - DZ.step - 6), .8 + 2 * hh(i * 5), 0, 7); c.fill(); }
  c.fillStyle = 'rgba(10,6,4,.6)'; for (const bx of [210, 470, 720]) c.fillRect(bx, DZ.step + 3, 2, DZ.water - DZ.step - 3);
  c.fillStyle = 'rgba(255,206,150,.34)'; c.fillRect(0, DZ.step, 880, 2.5); c.fillStyle = 'rgba(255,206,150,.16)'; c.fillRect(0, DZ.water - 3, 880, 3);
  const rf = c.createLinearGradient(0, DZ.water, 0, DZ.water + 90); rf.addColorStop(0, 'rgba(16,9,8,.6)'); rf.addColorStop(1, 'rgba(16,9,8,0)'); c.fillStyle = rf; c.fillRect(0, DZ.water, 880, 90);
  // the mother and the girl (the mother's hands on the danga, then on her daughter's back)
  const mo = [322, DZ.step], ms = 1.42, go = [540, DZ.step], gs = 1.3;
  const toM = ([X, Y]) => [(X - mo[0]) / ms, (Y - mo[1]) / ms], toG = ([X, Y]) => [(X - go[0]) / gs, (Y - go[1]) / gs];
  const rel = eio(release), girlBack = [go[0] + 4 * gs, go[1] - 196 * gs];
  const mh = [toM([girlBack[0] - 6, girlBack[1] + 10]), toM([girlBack[0] + 30, girlBack[1] + 30])];   // her hands on her daughter's shoulders
  const light = { glow: 1 - .7 * dr, glowCol: '255,176,96', rimCol: '255,222,170', rimW: 6, shade: .5 };
  motherKneeling(c, mo[0], mo[1], ms, { ...light, hands: mh, lean: .55 + .25 * pl, glowAt: toM([dx, dy - 40]) });
  girlKneeling(c, go[0], go[1], gs, { ...light, hands: [toG([lerp(px - 70, px - 120, rel), lerp(py - 8, py - 90, rel)]), toG([lerp(px - 36, px - 96, rel), lerp(py - 4, py - 70, rel)])], lean: .5 + .5 * pl - .3 * rel, glowAt: toG([px, py - 40]) });
  danga(c, t, dx, dy, ds, 'ଆ', 1);   // ଆ: the song's first syllable, and in Odia, 'come'
}
