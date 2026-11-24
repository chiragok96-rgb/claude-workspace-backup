// Old Puri, a sunlit wall of doors, tracked sideways like a frieze. A low sun; limewash, ochre stains, a red-oxide plinth; wooden doors
// with iron studs, each step painted with jhoti for Lakshmi. Along the wall glide two long shadows — the unmistakable forms of
// Jagannath and Balabhadra (the great round heads, the arms held forward) — and every door shuts as the shadows reach it.
// At dusk (o.dusk) the wall is amber, the doors are all shut but one, and that one is lit from within.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
export const WALL = { top: 330, plinth: 1300, street: 1388, doorW: 300, doorH: 620, gap: 620 };
let TEX;
function initTex() {   // limewash: soft, low-contrast mottling, faint rain-streaks, a few hairline cracks (tiled 1200 px wide), blurred to plaster
  TEX = mk(1200, 1100); const x = TEX.getContext('2d'); x.fillStyle = '#ece2cf'; x.fillRect(0, 0, 1200, 1100);
  x.filter = 'blur(28px)'; for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(${hh(i) > .5 ? '255,250,238' : '200,176,136'},${.08 + .08 * hh(i * 3)})`; x.beginPath(); x.ellipse(hh(i * 1.3) * 1200, hh(i * 2.1) * 1100, 60 + 160 * hh(i * 5), 40 + 120 * hh(i * 7), 0, 0, 7); x.fill(); }
  x.filter = 'blur(6px)'; for (let i = 0; i < 30; i++) { const sx = hh(i * 9.1) * 1200, sy = hh(i * 4.3) * 300, g = x.createLinearGradient(0, sy, 0, sy + 300 + 400 * hh(i)); g.addColorStop(0, 'rgba(160,120,70,.14)'); g.addColorStop(1, 'rgba(160,120,70,0)'); x.fillStyle = g; x.fillRect(sx, sy, 3 + 10 * hh(i * 3), 700); }
  x.filter = 'none'; for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${hh(i) > .5 ? '255,255,250' : '120,100,80'},${.04 + .04 * hh(i * 3)})`; x.fillRect(hh(i * 1.7) * 1200, hh(i * 2.3) * 1100, 1.5, 1.5); }   // the grain of lime
  x.strokeStyle = 'rgba(120,96,70,.22)'; x.lineWidth = .8; for (let i = 0; i < 12; i++) { let px = hh(i * 3.3) * 1200, py = hh(i * 5.7) * 1100; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (hh(i * 7 + k) - .5) * 30; py += 8 + 16 * hh(i + k); x.lineTo(px, py); } x.stroke(); }
}
const DOOR_COL = [[118, 52, 38], [52, 92, 88], [150, 98, 44], [92, 44, 50], [60, 80, 66]];
// o: pan (world x at the left edge), shut(i) → 0..1, shadows: [{x, who, a}], dusk, open (index of the one lit door at dusk), lit
export function wall(c, t, o = {}) {
  if (!TEX) initTex(); const { pan = 0, shut = () => 0, shadows = [], dusk = 0, openDoor = -1, lit = 0 } = o, { top, plinth, street, doorW, doorH, gap } = WALL;
  const mix = (a, b) => a.map((v, i) => Math.round(lerp(v, b[i], dusk)));
  c.save();
  let g = c.createLinearGradient(0, 0, 0, top); g.addColorStop(0, `rgb(${mix([252, 244, 226], [96, 64, 70])})`); g.addColorStop(1, `rgb(${mix([255, 236, 200], [232, 140, 86])})`); c.fillStyle = g; c.fillRect(0, 0, W, top + 2);   // the sky above the parapet
  // the wall itself
  const off = ((pan % 1200) + 1200) % 1200; for (let x = -off; x < W; x += 1200) c.drawImage(TEX, x, top);
  c.fillStyle = `rgba(${mix([255, 250, 236], [150, 70, 40])},${lerp(0, .55, dusk)})`; c.globalCompositeOperation = 'multiply'; c.fillRect(0, top, W, street - top); c.globalCompositeOperation = 'source-over';
  g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, `rgba(255,246,220,${lerp(.35, .1, dusk)})`); g.addColorStop(1, 'rgba(60,40,30,.12)'); c.fillStyle = g; c.fillRect(0, top, W, street - top);   // the low sun from the left
  c.fillStyle = `rgb(${mix([150, 62, 40], [90, 34, 26])})`; c.fillRect(0, plinth, W, street - plinth); c.fillStyle = 'rgba(255,230,200,.2)'; c.fillRect(0, plinth, W, 3);   // red-oxide plinth
  c.fillStyle = `rgb(${mix([214, 200, 176], [120, 80, 70])})`; c.fillRect(0, top - 18, W, 30); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(0, top + 12, W, 10);   // parapet and its shadow
  // doors (and small barred windows between them)
  const i0 = Math.floor((pan - 400) / gap), i1 = Math.ceil((pan + W + 400) / gap);
  for (let i = i0; i <= i1; i++) {
    const dx = i * gap - pan + 160, dy = street - doorH, s = clamp(shut(i)), col = DOOR_COL[((i % 5) + 5) % 5], cc = mix(col, col.map(v => v * .55));
    const wx = dx + doorW + (gap - doorW) / 2 - 60; c.fillStyle = `rgb(${mix([90, 60, 40], [50, 30, 26])})`; c.fillRect(wx - 8, dy + 40, 136, 156); c.fillStyle = '#1a100c'; c.fillRect(wx, dy + 48, 120, 140); c.fillStyle = `rgb(${mix([120, 84, 56], [60, 40, 32])})`; for (let b = 1; b < 6; b++) c.fillRect(wx + b * 20 - 3, dy + 48, 6, 140);   // a window with wooden bars
    c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(dx + 14, dy - 18, doorW + 40, doorH + 18);   // the frame's shadow (sun from the left)
    c.fillStyle = `rgb(${mix([96, 62, 40], [52, 32, 26])})`; c.fillRect(dx - 22, dy - 28, doorW + 44, doorH + 28);   // the frame
    c.fillStyle = `rgb(${mix([140, 100, 64], [70, 46, 34])})`; c.fillRect(dx - 22, dy - 28, doorW + 44, 8);
    c.fillStyle = `rgb(${mix([170, 120, 70], [80, 52, 36])})`; c.beginPath(); c.moveTo(dx - 34, dy - 28); c.lineTo(dx + doorW / 2, dy - 78); c.lineTo(dx + doorW + 34, dy - 28); c.closePath(); c.fill();   // a little carved pediment
    c.fillStyle = `rgba(250,244,230,${lerp(.8, .55, dusk)})`; for (let k = 0; k < 11; k++) { c.beginPath(); c.arc(dx + 6 + k * (doorW - 12) / 10, dy - 18, 2.4, 0, 7); c.fill(); }   // painted dots on the lintel
    c.fillStyle = '#c4201a'; c.beginPath(); c.arc(dx + doorW / 2, dy - 50, 7, 0, 7); c.fill();   // a sindoor mark over the door
    const inner = i === openDoor && lit > 0; c.fillStyle = '#120a08'; c.fillRect(dx, dy, doorW, doorH);   // the doorway
    if (inner) { c.save(); c.globalCompositeOperation = 'lighter'; g = c.createLinearGradient(0, dy, 0, dy + doorH); g.addColorStop(0, `rgba(255,170,80,${.55 * lit})`); g.addColorStop(1, `rgba(255,200,110,${.9 * lit})`); c.fillStyle = g; c.fillRect(dx, dy, doorW, doorH); c.restore(); }
    else { c.fillStyle = 'rgba(80,50,30,.5)'; c.fillRect(dx + doorW * .3, dy + doorH * .5, doorW * .4, doorH * .5); }   // a glimpse of a room
    const leaf = (x0, w, dark) => { c.fillStyle = `rgb(${cc.map(v => v * dark)})`; c.fillRect(x0, dy, w, doorH); if (w > 30) { c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; c.strokeRect(x0 + w * .12, dy + 40, w * .76, doorH * .38); c.strokeRect(x0 + w * .12, dy + 60 + doorH * .4, w * .76, doorH * .42);
      c.fillStyle = 'rgba(40,30,20,.7)'; for (let r = 0; r < 5; r++) for (let q = 0; q < 2; q++) { c.beginPath(); c.arc(x0 + w * (.3 + .4 * q), dy + 70 + r * doorH / 5.6, 3.2, 0, 7); c.fill(); }
      c.strokeStyle = `rgba(220,170,80,${lerp(.9, .5, dusk)})`; c.lineWidth = 4; c.beginPath(); c.arc(x0 + (x0 < dx + 10 ? w - 18 : 18), dy + doorH * .52, 12, 0, 7); c.stroke(); } };   // panels, iron studs, a brass ring
    const sw = s < 1 ? 1 - s : 0, lw = doorW / 2;
    if (!(inner)) { leaf(dx, lw * (1 - sw * .86), lerp(1, .6, sw)); leaf(dx + doorW - lw * (1 - sw * .86), lw * (1 - sw * .86), lerp(.9, .55, sw)); if (s >= .999) { c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(dx + lw - 1.5, dy, 3, doorH); } }   // the two leaves, swinging shut
    else { leaf(dx, lw * .14, .5); leaf(dx + doorW - lw * .14, lw * .14, .5); }
    c.fillStyle = `rgb(${mix([190, 176, 150], [96, 66, 58])})`; c.fillRect(dx - 40, street, doorW + 80, 26); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(dx - 40, street + 26, doorW + 80, 6);   // the step
    c.strokeStyle = `rgba(250,246,236,${lerp(.85, .7, dusk)})`; c.lineWidth = 2.4; c.lineCap = 'round';   // jhoti on the step: little lotus petals and Lakshmi's dots
    for (let k = 0; k < 9; k++) { const px = dx - 20 + k * (doorW + 40) / 8.6; c.beginPath(); c.ellipse(px, street + 13, 9, 5, 0, 0, 7); c.stroke(); c.beginPath(); c.arc(px + 17, street + 13, 1.6, 0, 7); c.stroke(); }
  }
  // the street
  g = c.createLinearGradient(0, street + 26, 0, H); g.addColorStop(0, `rgb(${mix([214, 192, 156], [110, 76, 66])})`); g.addColorStop(1, `rgb(${mix([170, 140, 104], [56, 40, 40])})`); c.fillStyle = g; c.fillRect(0, street + 32, W, H - street - 32);
  for (let i = 0; i < 260; i++) { const x = ((hh(i * 1.7) * 2400 - pan * 1.15) % 2400 + 2400) % 2400 - 200; c.fillStyle = `rgba(${hh(i) > .5 ? '255,240,210' : '90,60,40'},${.14 + .1 * hh(i * 3)})`; c.fillRect(x, street + 40 + hh(i * 2.9) * 480, 2 + hh(i * 5) * 6, 1.5 + hh(i * 7) * 2); }
  // the brothers' shadows, long on the wall, cast by a low sun behind us
  for (const sh of shadows) shadowOf(c, t, sh.x, street + 18, sh.who, sh.a ?? 1, dusk, sh.bob ?? 0);
  // dust in the light
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 50; i++) { const x = (hh(i * 3.7) * W + t * 14 * (1 + hh(i))) % W, y = top + hh(i * 5.1) * 1300 + Math.sin(t * .8 + i) * 14; c.fillStyle = `rgba(255,240,210,${(.18 + .14 * hh(i)) * (1 - dusk * .5)})`; c.beginPath(); c.arc(x, y, .8 + hh(i * 7) * 1.8, 0, 7); c.fill(); } c.restore();
  c.restore();
}
function shadowOf(c, t, x, y, who, a, dusk, bob) {   // the deity's form as a long soft shadow: the great rounded head, the crown, the arms held forward
  if (a <= 0) return; const tall = who === 'B' ? 1.05 : 1; c.save(); c.globalAlpha *= a * lerp(.62, .55, dusk); c.translate(x, y + bob); c.transform(1, 0, -.22, 1, 0, 0); c.scale(1.85 * tall, 2.1 * tall);
  c.filter = 'blur(3px)'; c.fillStyle = dusk > .5 ? '#1a0a08' : '#4a2c1c';
  c.beginPath(); c.moveTo(-46, 0); c.bezierCurveTo(-50, -60, -54, -100, -58, -128);   // the wrapped cloth
  c.lineTo(-92, -130); c.quadraticCurveTo(-104, -146, -92, -162); c.lineTo(-70, -164);   // the arm held forward (a rounded stump)
  c.bezierCurveTo(-92, -210, -90, -282, -62, -306); c.quadraticCurveTo(0, -330, 62, -306); c.bezierCurveTo(90, -282, 92, -210, 70, -164);   // the great head, broad and rounded
  c.lineTo(92, -162); c.quadraticCurveTo(104, -146, 92, -130); c.lineTo(58, -128); c.bezierCurveTo(54, -100, 50, -60, 46, 0); c.closePath(); c.fill();
  c.restore();
}
// Jagannath (J: the black face, the great round eyes) and Balabhadra (B: the white face), as they are worshipped. Used close, not walking.
export function deity(c, x, y, s, who, t, a = 1, o = {}) {
  if (a <= 0) return; const { look = 0, wide = 0, glow = 0 } = o;
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(s, s);
  const face = who === 'J' ? '#141012' : '#f4f0e6';
  c.fillStyle = face; c.beginPath(); c.moveTo(-70, -150); c.bezierCurveTo(-80, -220, -76, -290, -52, -300); c.lineTo(52, -300); c.bezierCurveTo(76, -290, 80, -220, 70, -150); c.closePath(); c.fill();
  const eyeR = who === 'J' ? 27 * (1 + .12 * wide) : 22;
  for (const ex of [-33, 33]) { c.save(); c.translate(ex, -244);
    c.fillStyle = '#fbf6ea'; c.beginPath(); if (who === 'J') c.arc(0, 0, eyeR, 0, 7); else c.ellipse(0, 0, 26, 18, 0, 0, 7); c.fill();
    c.strokeStyle = '#c4201a'; c.lineWidth = 5; c.stroke(); c.fillStyle = '#0c0808'; c.beginPath(); c.arc(look * 6, 0, who === 'J' ? 11 + 3 * wide : 9, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(look * 6 - 3, -4, 3, 0, 7); c.fill(); c.restore(); }
  c.fillStyle = '#c4201a'; c.beginPath(); c.moveTo(-26, -196); c.quadraticCurveTo(0, -178, 26, -196); c.quadraticCurveTo(0, -188, -26, -196); c.fill();
  c.restore();
}
