// Light and fire shared by the scenes: a real layered flame.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
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
