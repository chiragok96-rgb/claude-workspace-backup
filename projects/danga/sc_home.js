// Home. A lamp-lit Odia room at night: the barred window, the wall calendar, the mother at the window. Outside it, the year goes
// by without her child — Dussehra's lights, Diwali's fireworks, then the monsoon and an empty Raja swing. And at dawn, the ghat:
// she and a small child float a danga with its diya, the temple across the river.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
import { calPage, pageTurn } from './sc_modern.js';
import { temple } from './sc_moon.js';
import { motherStanding } from './sc_people.js';
export const WIN = { x: 360, y: 250, w: 600, h: 820 };   // the window, on screen
function outside(c, t, view) {   // what the window looks onto: 'night' | 'dussehra' | 'diwali' | 'rain' | 'dawn' (view: {name, k})
  const { x, y, w, h } = WIN; c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  const sky = (top, bot) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(x, y, w, h); };
  const n = view.name;
  if (n === 'dawn' && view.draw) { c.translate(x, y - 300 * (w / W)); c.scale(w / W, w / W); view.draw(c, t); c.restore(); return; }   // at dawn the window holds the very shot we are about to enter
  if (n === 'dawn') { sky('#3a2024', '#f4ae6e'); const sg = c.createRadialGradient(x + w * .7, y + h * .68, 0, x + w * .7, y + h * .68, 300); sg.addColorStop(0, 'rgba(255,236,190,.9)'); sg.addColorStop(.3, 'rgba(255,190,120,.4)'); sg.addColorStop(1, 'rgba(255,160,90,0)'); c.fillStyle = sg; c.fillRect(x, y, w, h); } else if (n === 'rain') sky('#1a1a1e', '#2a2422'); else sky('#0c0a12', '#2a1a1e');
  c.fillStyle = n === 'dawn' ? '#4a2420' : '#0a0809'; c.beginPath(); c.moveTo(x, y + h * .78); for (let X = x; X <= x + w; X += 16) c.lineTo(X, y + h * .74 - 20 * Math.abs(Math.sin(X * .02)) - 10 * hh(Math.floor(X / 16))); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.fill();   // trees, rooftops
  temple(c, x + w * .7, y + h * .76, .55, n === 'dawn' ? '#241010' : '#0a0809');
  c.save(); c.globalCompositeOperation = 'lighter';
  if (n === 'night') { for (let i = 0; i < 10; i++) { const lx = x + hh(i * 3) * w, ly = y + h * (.74 + .1 * hh(i * 5)); c.fillStyle = 'rgba(255,190,110,.6)'; c.beginPath(); c.arc(lx, ly, 2.5, 0, 7); c.fill(); }
    const tx = x + ((t * 220) % (w + 400)) - 200; for (let k = 0; k < 8; k++) { c.fillStyle = 'rgba(255,210,140,.8)'; c.fillRect(tx - k * 26, y + h * .7, 14, 5); } }   // a far train crossing
  if (n === 'dussehra') { durga(c, t, x + w * .5, y + h * .74, w); }
  if (n === 'dussehra') { for (let s = 0; s < 4; s++) for (let i = 0; i <= 24; i++) { const u = i / 24, lx = x + u * w, ly = y + h * (.3 + s * .1) + Math.sin(u * Math.PI) * 40, col = ['255,120,80', '255,200,90', '255,90,110', '160,230,120'][(i + s) % 4], tw = .6 + .4 * Math.sin(t * 6 + i + s); const g = c.createRadialGradient(lx, ly, 0, lx, ly, 14); g.addColorStop(0, `rgba(${col},${tw})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(lx - 14, ly - 14, 28, 28); }
    const pg = c.createRadialGradient(x + w * .4, y + h * .72, 10, x + w * .4, y + h * .72, 260); pg.addColorStop(0, 'rgba(255,170,90,.55)'); pg.addColorStop(1, 'rgba(255,140,60,0)'); c.fillStyle = pg; c.fillRect(x, y, w, h); }   // the pandal's glow
  if (n === 'diwali') { for (let i = 0; i < 26; i++) { const lx = x + (i + .5) / 26 * w, ly = y + h * .745 - 6 * Math.abs(Math.sin(lx * .02)); const g = c.createRadialGradient(lx, ly, 0, lx, ly, 18); g.addColorStop(0, `rgba(255,200,110,${.7 + .3 * Math.sin(t * 9 + i)})`); g.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = g; c.fillRect(lx - 18, ly - 18, 36, 36); }   // diyas on the parapets
    for (let f = 0; f < 4; f++) { const ft = (t * .9 + f * .27) % 1, fx = x + w * (.2 + .2 * f), fy = y + h * (.22 + .08 * hh(f)), col = ['255,200,110', '255,120,90', '255,230,170', '180,240,140'][f];   // fireworks
      for (let k = 0; k < 22; k++) { const an = k / 22 * Math.PI * 2, r = eo(ft) * 120, px = fx + Math.cos(an) * r, py = fy + Math.sin(an) * r + ft * ft * 40; c.fillStyle = `rgba(${col},${(1 - ft) * .9})`; c.beginPath(); c.arc(px, py, 3 * (1 - ft) + 1, 0, 7); c.fill(); } } }
  c.restore();
  if (n === 'rain') {   // the monsoon; a tree; an empty Raja swing, swaying
    c.strokeStyle = '#0a0809'; c.lineWidth = 26; c.beginPath(); c.moveTo(x + w * .3, y + h); c.bezierCurveTo(x + w * .32, y + h * .6, x + w * .26, y + h * .35, x + w * .4, y + h * .18); c.stroke();
    c.lineWidth = 14; c.beginPath(); c.moveTo(x + w * .36, y + h * .26); c.bezierCurveTo(x + w * .55, y + h * .2, x + w * .75, y + h * .22, x + w * .9, y + h * .14); c.stroke();
    c.fillStyle = '#0a0809'; for (let i = 0; i < 30; i++) { c.beginPath(); c.ellipse(x + w * (.25 + .7 * hh(i * 3)), y + h * (.05 + .22 * hh(i * 5)), 40 + 30 * hh(i), 24, hh(i) * 3, 0, 7); c.fill(); }
    const sw = Math.sin(t * 1.6) * .22, px = x + w * .66, py = y + h * .22, L = h * .42; c.strokeStyle = 'rgba(30,24,22,1)'; c.lineWidth = 4; const ex = px + Math.sin(sw) * L, ey = py + Math.cos(sw) * L;
    c.beginPath(); c.moveTo(px - 40, py); c.lineTo(ex - 40, ey); c.moveTo(px + 40, py); c.lineTo(ex + 40, ey); c.stroke(); c.fillStyle = '#3a2a22'; c.fillRect(ex - 56, ey - 4, 112, 12);   // the Raja swing, empty
    for (const sx of [-40, 40]) for (let k = 1; k < 14; k++) { const u = k / 14, fx = lerp(px + sx, ex + sx, u), fy = lerp(py, ey, u); c.fillStyle = k % 2 ? '#c8781c' : '#a8501a'; c.beginPath(); c.arc(fx, fy, 5.5, 0, 7); c.fill(); }   // marigolds tied along its ropes
    for (let k = 0; k < 7; k++) { c.fillStyle = k % 2 ? '#d8841e' : '#b8401a'; c.beginPath(); c.arc(ex - 48 + k * 16, ey - 6, 6, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(200,210,220,.35)'; c.lineWidth = 1.5; for (let i = 0; i < 160; i++) { const rx = x + hh(i * 1.3) * w, ry = y + ((hh(i * 2.1) * h + t * 1400) % h); c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 6, ry + 34); c.stroke(); }
    const fl = Math.max(0, Math.sin(t * 2.3) - .96) * 18; if (fl > 0) { c.fillStyle = `rgba(230,230,240,${fl})`; c.fillRect(x, y, w, h); } }
  c.restore();
}
export function room(c, t, o = {}) {
  const { view = { name: 'night' }, cal = null, phoneGlow = 0, a = 1, fig = 1 } = o; if (a <= 0) return; c.save(); const A0 = (c.globalAlpha *= a);
  const g = c.createRadialGradient(560, 760, 100, 560, 760, 1300); g.addColorStop(0, '#3a2418'); g.addColorStop(1, '#0c0706'); c.fillStyle = g; c.fillRect(0, 0, W, H);   // the lamp-lit wall
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${hh(i) > .5 ? '90,60,40' : '20,12,8'},${.05 + .05 * hh(i * 3)})`; c.fillRect(hh(i * 1.7) * W, hh(i * 2.9) * H, 2 + hh(i * 5) * 6, 2 + hh(i * 7) * 6); }
  if (view.prev && view.k < 1) { outside(c, t, { name: view.prev }); c.save(); c.globalAlpha *= view.k; outside(c, t, view); c.restore(); } else outside(c, t, view);   // one festival dissolves into the next
  const { x, y, w, h } = WIN; c.fillStyle = '#1a0e08'; c.fillRect(x - 30, y - 30, w + 60, 30); c.fillRect(x - 30, y + h, w + 60, 40); c.fillRect(x - 30, y, 30, h); c.fillRect(x + w, y, 30, h);   // the wooden frame
  c.fillStyle = `rgba(18,10,6,${fig})`; for (let b = 1; b < 7; b++) c.fillRect(x + b * w / 7 - 5, y, 10, h);   // iron bars
  c.fillStyle = '#2a160c'; c.fillRect(x - 50, y + h + 40, w + 100, 26);   // the sill
  if (cal) { if (cal.turn != null) pageTurn(c, t, cal.from, cal.to, cal.turn, 190, 1030, .3, cal.mFrom, cal.mTo); else calPage(c, t, cal.page, 190, 1030, .3, cal.marks || {}); }   // the calendar on the wall
  const lc = { night: '255,214,170', dussehra: '255,190,120', diwali: '255,206,140', rain: '220,214,206', dawn: '255,220,170' }[view.name] || '255,214,170';
  motherStanding(c, 868, 1350, 1.2, { flip: true, a: fig, t, phone: phoneGlow, rimCol: lc, rimW: 5, shade: .62 });   // she stands at the window, in profile, looking out
  if (phoneGlow > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const px = 868 - 2 * 1.2, py = 1350 - 506 * 1.2, pg = c.createRadialGradient(px, py, 0, px, py, 200); pg.addColorStop(0, `rgba(255,236,200,${.4 * phoneGlow * fig})`); pg.addColorStop(1, 'rgba(255,220,170,0)'); c.fillStyle = pg; c.fillRect(px - 200, py - 200, 400, 400); c.restore(); }   // the phone's light on her face
  const lamp = c.createRadialGradient(140, 1500, 0, 140, 1500, 600); lamp.addColorStop(0, 'rgba(255,170,80,.28)'); lamp.addColorStop(1, 'rgba(255,150,60,0)'); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = lamp; c.fillRect(0, 900, 900, 1020); c.restore();
  c.restore();
}
// —— dawn at the ghat: the mother kneels, a small child beside her; the danga goes onto the water ——
export function kneelingMother(c, x, y, s, reach = 1, a = 1) {   // side view, facing right, reaching down to the water
  if (a <= 0) return; c.save(); const A0 = (c.globalAlpha *= a); c.translate(x, y); c.scale(s, s); c.fillStyle = '#0b0807';
  c.beginPath(); c.moveTo(-170, 0); c.bezierCurveTo(-190, -60, -170, -130, -120, -170); c.bezierCurveTo(-110, -240, -70, -300, -20, -320);   // back, bent forward
  c.bezierCurveTo(-30, -360, -10, -398, 30, -400); c.bezierCurveTo(70, -400, 84, -366, 74, -334); c.bezierCurveTo(70, -320, 64, -310, 56, -302);   // the covered head
  c.bezierCurveTo(80, -270, 110 + 20 * reach, -200 + 60 * reach, 130 + 50 * reach, -120 + 90 * reach); c.lineTo(110 + 50 * reach, -110 + 90 * reach);   // her arm, reaching down
  c.bezierCurveTo(80, -170, 50, -200, 30, -200); c.bezierCurveTo(40, -120, 90, -60, 110, 0); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,214,160,.7)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-20, -320); c.bezierCurveTo(-30, -360, -10, -398, 30, -400); c.bezierCurveTo(70, -400, 84, -366, 74, -334); c.stroke();   // dawn on the edge of her pallu
  c.strokeStyle = 'rgba(214,96,64,.6)'; c.beginPath(); c.moveTo(-170, -4); c.bezierCurveTo(-60, -10, 40, -2, 110, -4); c.stroke();
  c.restore();
}
export function child(c, x, y, s, a = 1) {   // a small child, kneeling, hands folded
  if (a <= 0) return; c.save(); const A0 = (c.globalAlpha *= a); c.translate(x, y); c.scale(s, s); c.fillStyle = '#0b0807';
  c.beginPath(); c.arc(0, -210, 46, 0, 7); c.fill();
  c.beginPath(); c.moveTo(-60, 0); c.bezierCurveTo(-70, -80, -52, -150, -10, -164); c.bezierCurveTo(30, -164, 56, -120, 60, -70); c.lineTo(84, -110); c.lineTo(96, -100); c.lineTo(70, -40); c.bezierCurveTo(74, -20, 80, -8, 84, 0); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,214,160,.7)'; c.lineWidth = 3.5; c.beginPath(); c.arc(0, -210, 46, -2.2, .2); c.stroke();
  c.restore();
}

// Dussehra in Cuttack: a puja pandal across the lane, the Goddess in her silver medha (filigree arch), lamps and string lights
function durga(c, t, cx, by, w) {
  c.save(); const s = w / 600;
  c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(cx, by - 200 * s, 10, cx, by - 200 * s, 330 * s); g.addColorStop(0, 'rgba(255,214,150,.55)'); g.addColorStop(.5, 'rgba(255,170,90,.2)'); g.addColorStop(1, 'rgba(255,150,70,0)'); c.fillStyle = g; c.fillRect(cx - 340 * s, by - 540 * s, 680 * s, 560 * s);
  for (let ring = 0; ring < 4; ring++) { const R = (250 - ring * 34) * s; for (let k = 0; k <= 46; k++) { const an = Math.PI + k / 46 * Math.PI, px = cx + Math.cos(an) * R, py = by - 60 * s + Math.sin(an) * R * 1.18; const tw = .55 + .45 * Math.sin(t * 3 + k * .7 + ring);   // the silver filigree arch (chandi medha)
    c.fillStyle = `rgba(236,232,226,${(.5 - ring * .08) * tw})`; c.beginPath(); c.arc(px, py, (3.2 - ring * .5) * s, 0, 7); c.fill(); } }
  c.restore();
  c.save(); c.fillStyle = '#1a0c08'; c.translate(cx, by - 60 * s); c.scale(s, s);   // the Goddess, ten-armed, in silhouette against her own light
  c.beginPath(); c.moveTo(-70, 60); c.bezierCurveTo(-60, -10, -30, -70, -24, -96); c.lineTo(24, -96); c.bezierCurveTo(30, -70, 60, -10, 70, 60); c.closePath(); c.fill();
  c.beginPath(); c.arc(0, -120, 24, 0, 7); c.fill(); c.beginPath(); c.moveTo(-20, -136); c.lineTo(-16, -176); c.lineTo(-6, -158); c.lineTo(0, -186); c.lineTo(6, -158); c.lineTo(16, -176); c.lineTo(20, -136); c.closePath(); c.fill();   // the crown
  for (let k = 0; k < 10; k++) { const side = k < 5 ? -1 : 1, j = k % 5, an = (-.95 + j * .38) * side + (side < 0 ? Math.PI : 0) + .03 * Math.sin(t * 1.2 + k); c.save(); c.translate(side * 16, -84); c.rotate(an); c.beginPath(); c.moveTo(0, -5); c.lineTo(78, -3); c.lineTo(78, 3); c.lineTo(0, 6); c.fill(); c.beginPath(); c.arc(82, 0, 6, 0, 7); c.fill(); c.restore(); }   // ten arms
  c.save(); c.translate(42, -84); c.rotate(-1.25); c.fillRect(0, -2.5, 150, 5); c.beginPath(); c.moveTo(150, -14); c.lineTo(168, 0); c.lineTo(150, 14); c.lineTo(156, 0); c.fill(); c.restore();   // the trident
  c.restore();
  c.save(); c.globalCompositeOperation = 'lighter'; const h = c.createRadialGradient(cx, by - 180 * s, 0, cx, by - 180 * s, 70 * s); h.addColorStop(0, 'rgba(255,230,170,.5)'); h.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = h; c.fillRect(cx - 70 * s, by - 250 * s, 140 * s, 140 * s); c.restore();   // her halo
}
