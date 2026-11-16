// Paper-cut lightbox (Opuscar paper-lantern): Kartika, the month of lamps. A temple wall with thirty niches, one per day.
// The month's niches are dark (missed); Dvadashi's niche is sealed this year; four diyas wait; the first one catches flame.
import { initLightbox, sheet, drawStack, glow, LW, LH } from './lightbox.js';
export const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
let LB;
// the deepa stambha: six tiers of five brackets (30 days); tier 6 is Panchuka; Dvadashi's bracket is broken off this year
const PX = 170, TIER = k => 520 - k * 160, HW = y => lerp(80, 45, (640 - y) / 1200);
export const CUPS = (() => { const o = []; for (let k = 0; k < 6; k++) { const y = TIER(k), hw = HW(y); [-(hw + 150), -(hw + 70), 0, hw + 70, hw + 150].forEach((x, j) => o.push({ x: x + PX, y, k, j, i: k * 5 + j })); } return o; })();
const MISSING = 26;                         // day 27, Dvadashi
export const LAMPS = [25, 27, 28, 29];       // Ekadashi, Trayodashi, Chaturdashi, Purnima
export function initLamp(fibre, pulp) {
  initLightbox(fibre, pulp);
  const MX = 320, MY = -800;
  LB = [
    sheet('#2a2e62', m => m.fillRect(-LW / 2, -LH / 2, LW, LH), { depth: 0, trans: .85 }),   // the night sky (the moon and stars are light, drawn over it)
    sheet('#22204a', m => { const x0 = -330, base = 760, h = 520;   // a far temple spire (rekha deul) with its wheel and flag
      m.beginPath(); m.moveTo(x0 - 110, base); m.bezierCurveTo(x0 - 116, base - h * .6, x0 - 90, base - h * .9, x0 - 44, base - h); m.lineTo(x0 + 44, base - h); m.bezierCurveTo(x0 + 90, base - h * .9, x0 + 116, base - h * .6, x0 + 110, base); m.closePath(); m.fill();
      m.beginPath(); m.ellipse(x0, base - h - 12, 60, 14, 0, 0, Math.PI * 2); m.fill(); m.beginPath(); m.arc(x0, base - h - 52, 22, 0, Math.PI * 2); m.fill(); m.fillRect(x0 - 2, base - h - 140, 4, 90);
      m.beginPath(); m.moveTo(x0 + 2, base - h - 140); m.lineTo(x0 + 60, base - h - 128); m.lineTo(x0 + 2, base - h - 112); m.fill(); m.fillRect(-LW / 2, base - 10, LW, 600); }, { depth: .2, trans: .45 }),
    sheet('#3a1c14', m => {   // the lamp pillar (a deepa vriksha), right of centre
      m.translate(PX, 0); m.fillRect(-170, 700, 340, 70); m.fillRect(-140, 650, 280, 56);
      m.beginPath(); m.moveTo(-80, 650); m.lineTo(-45, -560); m.lineTo(45, -560); m.lineTo(80, 650); m.closePath(); m.fill();
      m.fillRect(-82, -600, 164, 44); m.beginPath(); m.moveTo(-60, -600); m.quadraticCurveTo(-58, -660, 0, -676); m.quadraticCurveTo(58, -660, 60, -600); m.fill(); m.beginPath(); m.arc(0, -690, 14, 0, Math.PI * 2); m.fill(); m.fillRect(-3, -740, 6, 50);
      for (let k = 0; k < 6; k++) { const y = TIER(k) + 34; m.fillRect(-HW(y) - 10, y - 4, (HW(y) + 10) * 2, 14); }   // a moulding band per tier
      m.lineCap = 'round';
      for (const c of CUPS) { if (c.j === 2) { m.fillRect(-26, c.y + 6, 52, 12); continue; }
        const cx = c.x - PX, sx = Math.sign(cx) * HW(c.y), broken = c.i === MISSING;
        m.lineWidth = 12; m.beginPath(); m.moveTo(sx, c.y + 40); m.quadraticCurveTo((sx + cx) / 2, c.y + 46, broken ? (sx + cx) / 2 : cx, broken ? c.y + 30 : c.y + 10); m.stroke();
        if (!broken) { m.beginPath(); m.ellipse(cx, c.y + 12, 30, 7, 0, 0, Math.PI * 2); m.fill(); } } },
      { depth: .5, trans: .12, rim: '#ffb46a', rimA: .75 }),
    sheet('#1e0c08', m => {   // foreground: a ledge; the tulasi chaura with its lamp niche; tulasi leaves
      m.fillRect(-LW / 2, 760, LW, 600);
      m.beginPath(); m.moveTo(-430, 770); m.lineTo(-430, 600); m.lineTo(-452, 600); m.lineTo(-452, 572); m.lineTo(-248, 572); m.lineTo(-248, 600); m.lineTo(-270, 600); m.lineTo(-270, 770); m.closePath(); m.fill();
      m.lineWidth = 5; m.lineCap = 'round';
      for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .3, l = 80 + (k % 3) * 20; m.beginPath(); m.moveTo(-350, 572); m.quadraticCurveTo(-350 + Math.cos(a) * l * .4, 572 + Math.sin(a) * l * .7, -350 + Math.cos(a) * l, 572 + Math.sin(a) * l); m.stroke();
        for (let j = 2; j <= 5; j++) { const u = j / 5, px = -350 + Math.cos(a) * l * u, py = 572 + Math.sin(a) * l * u; m.beginPath(); m.ellipse(px + 8, py + 1, 8, 5, a + 1, 0, Math.PI * 2); m.ellipse(px - 8, py + 1, 8, 5, a - 1, 0, Math.PI * 2); m.fill(); }
        m.beginPath(); m.ellipse(-350 + Math.cos(a) * l, 572 + Math.sin(a) * l - 6, 5, 12, a + Math.PI / 2, 0, Math.PI * 2); m.fill(); } },
      { depth: 1, trans: .03, cut: m => { m.beginPath(); m.moveTo(-374, 740); m.lineTo(-374, 668); m.quadraticCurveTo(-350, 640, -326, 668); m.lineTo(-326, 740); m.closePath(); m.fill(); } }),
  ];
}
function diya(c, x, y, s, lit, ready = 0, t = 0) {   // a clay lamp: bowl, a spout; flame and halo when lit
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  if (lit > 0) { glow(c, x, y - 26 * s, 60 * s, 'rgba(255,170,70,1)', .9 * lit); }
  c.fillStyle = '#2a1408'; c.beginPath(); c.moveTo(x - 28 * s, y - 6 * s); c.quadraticCurveTo(x - 20 * s, y + 14 * s, x, y + 14 * s); c.quadraticCurveTo(x + 22 * s, y + 14 * s, x + 30 * s, y - 8 * s); c.lineTo(x + 40 * s, y - 14 * s); c.lineTo(x + 26 * s, y - 4 * s); c.closePath(); c.fill();
  if (ready > 0) { c.strokeStyle = `rgba(255,190,110,${.55 * ready})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 28 * s, y - 6 * s); c.lineTo(x + 30 * s, y - 8 * s); c.stroke(); }
  if (lit > 0) { const fl = 1 + .06 * Math.sin(t * 13) * Math.sin(t * 5.3), fy = y - 14 * s;
    c.globalAlpha = lit; const g = c.createLinearGradient(x, fy - 34 * s, x, fy + 4 * s); g.addColorStop(0, 'rgba(255,240,190,0)'); g.addColorStop(.3, '#ffe6a0'); g.addColorStop(1, '#ff8a2a');
    c.fillStyle = g; c.beginPath(); c.moveTo(x + 32 * s, fy - 34 * s * fl); c.quadraticCurveTo(x + 42 * s, fy - 8 * s, x + 32 * s, fy + 2 * s); c.quadraticCurveTo(x + 22 * s, fy - 8 * s, x + 32 * s, fy - 34 * s * fl); c.fill();
    c.fillStyle = '#fff6dc'; c.beginPath(); c.ellipse(x + 32 * s, fy - 6 * s, 3 * s, 7 * s, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
// ---------- S8: the missed month, the last days, never too late ----------
const rv = (t, t0, d = .45) => clamp((t - t0) / d);
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export function lampCam(t) { const up = eio((t - 43.0) / 2.6), drift = eio((t - 48.7) / 1.6);
  return { x: 0, y: lerp(260, -180, up) - 80 * drift, z: lerp(1.12, 1.0, up) + .04 * drift }; }
export const LIT0 = () => CUPS[LAMPS[0]];
export function lampScreen(t, d, x, y) { const cam = lampCam(t), p = .45 + .55 * d, z = 1 + (cam.z - 1) * p; return [W / 2 + z * (x - cam.x * p), H / 2 + z * (y - cam.y * p), z]; }
export function lampS8(ctx, t, o = {}) {
  const cam = lampCam(t), ign = rv(t, 46.92, .3), lit = [ign, 0, 0, 0], ready = rv(t, 44.9, .9), moonPh = lerp(.86, .94, eio((t - 48.8) / 1.3));
  LB.forEach(l => { l.lit = 1; });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#05030a'; ctx.fillRect(0, 0, W, H); ctx.restore();
  const scr = (d, x, y) => { const p = .45 + .55 * d, z = 1 + (cam.z - 1) * p; return [W / 2 + z * (x - cam.x * p), H / 2 + z * (y - cam.y * p), z]; };
  const top = CUPS[LAMPS[0]], [lx, ly] = scr(.5, top.x, top.y), flare = Math.sin(Math.PI * clamp((t - 46.92) / .7));
  drawStack(ctx, LB, cam, { x: lx, y: ly - 120, r: 1300, I: .42 + .45 * ign + .25 * flare }, {
    after: [
      cc => { cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0);
        for (let k = 0; k < 46; k++) { const [x, y, z] = scr(0, Math.sin(k * 91.7) * 680, -1150 + Math.abs(Math.cos(k * 13.3)) * 760); cc.fillStyle = `rgba(255,248,230,${.45 + .4 * Math.abs(Math.sin(t * 1.3 + k))})`; cc.beginPath(); cc.arc(x, y, (1.2 + (k % 3) * .7) * z, 0, Math.PI * 2); cc.fill(); }
        const [mx, my, mz] = scr(0, 320, -800), r = 62 * mz;
        glow(cc, mx, my, 110 * mz, 'rgba(210,220,255,1)', .5 + .15 * eio((t - 48.8) / 1.3));
        cc.fillStyle = '#f6f1e0'; cc.beginPath(); cc.arc(mx, my, r, 0, Math.PI * 2); cc.fill();
        cc.save(); cc.beginPath(); cc.arc(mx, my, r, 0, Math.PI * 2); cc.clip(); cc.fillStyle = 'rgba(42,46,98,.92)'; const k = 1 - moonPh, tw = r * Math.abs(1 - 2 * k);
        cc.beginPath(); cc.arc(mx, my, r + 1, Math.PI / 2, 3 * Math.PI / 2); cc.ellipse(mx, my, Math.max(.1, tw), r + 1, 0, 3 * Math.PI / 2, Math.PI / 2, true); cc.fill(); cc.restore();
        cc.fillStyle = 'rgba(180,170,150,.25)'; for (const [dx, dy, rr] of [[18, -14, 10], [30, 14, 7], [6, 22, 6]]) { cc.beginPath(); cc.arc(mx + dx * mz, my + dy * mz, rr * mz, 0, Math.PI * 2); cc.fill(); }
        cc.restore(); },
      null,
      cc => { for (const c of CUPS) { if (c.i === MISSING) continue; const [x, y, z] = scr(.5, c.x, c.y), L = LAMPS.indexOf(c.i);
        if (L >= 0) { diya(cc, x - 6 * z, y + 2 * z, .8 * z, lit[L], ready, t + L); if (L === 0 && flare > 0) glow(cc, x + 20 * z, y - 18 * z, 90 * z, 'rgba(255,200,120,1)', .6 * flare); }
        else { cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.fillStyle = '#1a0c06'; cc.beginPath(); cc.ellipse(x, y + 4 * z, 20 * z, 6 * z, 0, 0, Math.PI * 2); cc.fill(); cc.restore(); } } },
      cc => { const [x, y, z] = scr(1, -350, 740); diya(cc, x - 22 * z, y - 4 * z, 1 * z, 1, 0, t + 7); },
    ] });
}
