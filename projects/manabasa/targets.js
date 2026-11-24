// The pictures the rice makes (drawn in three inks on the mask: W white rice, G gold akshata, R red kumkum). All in frame
// coordinates (1080 × 1920); the main images sit in y 280–1360, clear of the caption band.
import { W, H, clamp, lerp, hh } from './common.js';
import { defineTarget, COL } from './sc_rice.js';
const { W: WH, G: GD, R: RD } = COL;
const ring = (m, x, y, r, col, w) => { m.strokeStyle = col; m.lineWidth = w; m.beginPath(); m.arc(x, y, r, 0, 7); m.stroke(); };
const disc = (m, x, y, r, col) => { m.fillStyle = col; m.beginPath(); m.arc(x, y, r, 0, 7); m.fill(); };
// —— Jagannath: the great round eyes, ringed in red, a gold outline of the face, the red smile, the white tilaka, the crown ——
function jagannath(m, x, y, s, wide = 0, who = 'J') {
  m.save(); m.translate(x, y); m.scale(s, s);
  m.strokeStyle = GD; m.lineWidth = 24; m.beginPath(); m.moveTo(-300, -190); m.bezierCurveTo(-330, -10, -310, 170, -210, 270); m.quadraticCurveTo(0, 360, 210, 270); m.bezierCurveTo(310, 170, 330, -10, 300, -190); m.closePath();
  if (who === 'B') { m.fillStyle = WH; m.fill(); } m.stroke();
  m.lineWidth = 20; m.beginPath(); m.moveTo(-300, -230); m.quadraticCurveTo(0, -300, 300, -230); m.stroke();   // the crown's band
  m.fillStyle = GD; for (let k = -2; k <= 2; k++) { const cx = k * 118, cy = -262 - (2 - Math.abs(k)) * 14, hgt = 120 + (2 - Math.abs(k)) * 50; m.beginPath(); m.moveTo(cx - 52, cy); m.bezierCurveTo(cx - 52, cy - hgt * .5, cx - 10, cy - hgt * .7, cx, cy - hgt); m.bezierCurveTo(cx + 10, cy - hgt * .7, cx + 52, cy - hgt * .5, cx + 52, cy); m.closePath(); m.lineWidth = 14; m.stroke(); disc(m, cx, cy - hgt * .42, 15, RD); }   // the mukuta: five pointed arches, each with a red jewel
  for (const sd of [-1, 1]) { m.save(); m.translate(sd * 135, -30);
    if (who === 'J') { disc(m, 0, 0, 125 + 10 * wide, WH); ring(m, 0, 0, 125 + 10 * wide, RD, 26); m.globalCompositeOperation = 'destination-out'; disc(m, 0, 0, 50 + 14 * wide, '#000'); m.globalCompositeOperation = 'source-over'; disc(m, -14, -16, 12, WH); }
    else { m.fillStyle = '#000'; m.globalCompositeOperation = 'destination-out'; m.beginPath(); m.ellipse(0, 0, 118, 70, 0, 0, 7); m.fill(); m.globalCompositeOperation = 'source-over'; m.strokeStyle = RD; m.lineWidth = 24; m.beginPath(); m.ellipse(0, 0, 118, 70, 0, 0, 7); m.stroke(); disc(m, 0, 0, 34, GD); }
    m.restore(); }
  m.fillStyle = RD; m.beginPath(); m.moveTo(-120, 150); m.quadraticCurveTo(0, 230, 120, 150); m.quadraticCurveTo(0, 196, -120, 150); m.fill();   // the smile
  m.fillStyle = who === 'J' ? WH : RD; m.beginPath(); m.moveTo(-26, -60); m.lineTo(0, -210); m.lineTo(26, -60); m.closePath(); m.fill(); disc(m, 0, -40, 18, RD);   // the tilaka
  m.strokeStyle = GD; m.lineWidth = 46; m.lineCap = 'round'; for (const sd of [-1, 1]) { m.beginPath(); m.moveTo(sd * 300, 170); m.quadraticCurveTo(sd * 370, 175, sd * 400, 140); m.stroke(); }   // the arms, short and rounded, held forward
  m.restore();
}
const GA = Math.PI * (3 - Math.sqrt(5));
function bowls(m, full) {   // fifty-six bowls in a golden spiral round a small Jagannath
  jagannath(m, 540, 820, .28);
  for (let i = 0; i < 56; i++) { const r = 250 + 46 * Math.sqrt(i + .5), a = i * GA, x = 540 + Math.cos(a) * r * .9, y = 820 + Math.sin(a) * r * 1.02; if (y > 1360 || y < 300) continue;
    ring(m, x, y, 28, GD, 10); if (full) disc(m, x, y, 20, i % 4 === 1 ? RD : i % 4 === 3 ? GD : WH); }
}
function door(m, x, y, w, h, shut, lit = 0) {   // a doorway in a wall: gold frame; shut → a white-rice panel with its seam; lit → filled with gold
  m.strokeStyle = GD; m.lineWidth = 14; m.beginPath(); m.moveTo(x - w / 2, y); m.lineTo(x - w / 2, y - h + w / 2); m.arc(x, y - h + w / 2, w / 2, Math.PI, 0); m.lineTo(x + w / 2, y); m.stroke();
  if (shut) { m.fillStyle = WH; m.beginPath(); m.moveTo(x - w / 2 + 12, y); m.lineTo(x - w / 2 + 12, y - h + w / 2); m.arc(x, y - h + w / 2, w / 2 - 12, Math.PI, 0); m.lineTo(x + w / 2 - 12, y); m.closePath(); m.fill(); m.globalCompositeOperation = 'destination-out'; m.fillRect(x - 4, y - h + 20, 8, h - 20); m.globalCompositeOperation = 'source-over'; }
  if (lit) { m.fillStyle = GD; m.beginPath(); m.moveTo(x - w / 2 + 12, y); m.lineTo(x - w / 2 + 12, y - h + w / 2); m.arc(x, y - h + w / 2, w / 2 - 12, Math.PI, 0); m.lineTo(x + w / 2 - 12, y); m.closePath(); m.fill(); }
  m.strokeStyle = WH; m.lineWidth = 8; m.beginPath(); m.moveTo(x - w / 2 - 30, y + 14); m.lineTo(x + w / 2 + 30, y + 14); m.stroke();   // the step
}
function lane(m, shutN, litDoor = -1, figs = true) {
  m.strokeStyle = WH; m.lineWidth = 8; m.beginPath(); m.moveTo(30, 620); m.lineTo(1050, 620); m.stroke(); m.beginPath(); m.moveTo(30, 1170); m.lineTo(1050, 1170); m.stroke();   // the wall's eave and its plinth
  [140, 340, 540, 740, 940].forEach((x, i) => door(m, x, 1156, 150, 440, i < shutN || (litDoor >= 0 && i !== litDoor), i === litDoor));
  if (figs) { jagannath(m, 600, 1290, .16); jagannath(m, 470, 1290, .16, 0, 'B'); }
}
function footprint(m, x, y, a, s, col, left) {
  m.save(); m.translate(x, y); m.rotate(a + Math.PI / 2); m.scale(s * (left ? -1 : 1), s); m.fillStyle = col;
  m.beginPath(); m.moveTo(0, 0); m.bezierCurveTo(-17, 0, -19, -22, -15, -40); m.bezierCurveTo(-12, -55, -21, -66, -12, -78); m.bezierCurveTo(-2, -88, 16, -84, 18, -68); m.bezierCurveTo(20, -48, 17, -22, 14, -8); m.bezierCurveTo(12, -1, 6, 0, 0, 0); m.fill();
  [[-11, -98, 7], [1, -103, 5.6], [11, -100, 5], [19, -93, 4.2], [-20, -89, 4.4]].forEach(([tx, ty, r]) => { m.beginPath(); m.arc(tx, ty, r, 0, 7); m.fill(); }); m.restore();
}
function steps(m, A, B, n, s, col) { const a = Math.atan2(B[1] - A[1], B[0] - A[0]), nx = -Math.sin(a), ny = Math.cos(a); for (let i = 0; i < n; i++) { const u = i / (n - 1), l = i % 2 === 0, o = (l ? -1 : 1) * 26 * s; footprint(m, lerp(A[0], B[0], u) + nx * o, lerp(A[1], B[1], u) + ny * o, a, s, col, l); } }
function hut(m, x, y, s = 1) {   // a small mud house: a deep thatched roof, white walls, a low dark doorway with a gold frame
  m.save(); m.translate(x, y); m.scale(s, s);
  m.fillStyle = WH; m.beginPath(); m.moveTo(-250, 0); m.lineTo(-250, -210); m.lineTo(250, -210); m.lineTo(250, 0); m.closePath(); m.fill();   // the walls
  m.fillStyle = GD; m.beginPath(); m.moveTo(-330, -190); m.lineTo(0, -440); m.lineTo(330, -190); m.lineTo(290, -170); m.lineTo(0, -380); m.lineTo(-290, -170); m.closePath(); m.fill();   // the roof's edge
  m.strokeStyle = GD; m.lineWidth = 8; for (let k = -5; k <= 5; k++) { m.beginPath(); m.moveTo(k * 50, -200); m.lineTo(k * 30, -400 + Math.abs(k) * 40); m.stroke(); }   // thatch
  m.globalCompositeOperation = 'destination-out'; m.beginPath(); m.moveTo(-70, 0); m.lineTo(-70, -150); m.quadraticCurveTo(0, -190, 70, -150); m.lineTo(70, 0); m.closePath(); m.fill(); m.globalCompositeOperation = 'source-over';   // the doorway
  m.strokeStyle = RD; m.lineWidth = 10; m.beginPath(); m.moveTo(-82, 0); m.lineTo(-82, -156); m.quadraticCurveTo(0, -200, 82, -156); m.lineTo(82, 0); m.stroke();
  m.restore();
}
function mandala(m, cx, cy, s) {   // the jhoti: a lotus round the Mana, in white rice paste; the Mana heaped with gold paddy; red dots
  m.save(); m.translate(cx, cy); m.scale(s, s);
  disc(m, 0, 0, 120, GD); ring(m, 0, 0, 140, RD, 10);
  m.strokeStyle = WH; m.lineWidth = 12; for (let k = 0; k < 8; k++) { m.save(); m.rotate(k * Math.PI / 4); m.beginPath(); m.moveTo(0, -170); m.quadraticCurveTo(70, -250, 0, -330); m.quadraticCurveTo(-70, -250, 0, -170); m.stroke(); m.restore(); }
  for (let k = 0; k < 16; k++) { m.save(); m.rotate((k + .5) * Math.PI / 8); m.beginPath(); m.moveTo(0, -320); m.quadraticCurveTo(38, -380, 0, -430); m.quadraticCurveTo(-38, -380, 0, -320); m.stroke(); m.restore(); }
  ring(m, 0, 0, 455, WH, 10); for (let k = 0; k < 40; k++) { const a = k / 40 * 6.283; disc(m, Math.cos(a) * 490, Math.sin(a) * 490, 9, k % 2 ? RD : WH); }
  m.restore();
}
function oText(m, txt, x, y, size, col) { m.font = `700 ${size}px "OdiaSerif"`; m.textAlign = 'center'; m.textBaseline = 'middle'; m.fillStyle = col; m.fillText(txt, x, y); }
function woman(m, x, y, s) {   // Shriya in profile, bent at the waist over her broom: sari to her ankles, the pallu over her shoulder, a bun
  m.save(); m.translate(x, y); m.scale(s, s); m.fillStyle = WH;
  m.beginPath(); m.moveTo(-70, 0); m.lineTo(-56, -190); m.bezierCurveTo(-60, -240, -50, -280, -20, -300);   // the sari's fall, her hip
  m.bezierCurveTo(30, -320, 100, -330, 150, -322); m.bezierCurveTo(176, -318, 190, -300, 186, -280); m.lineTo(150, -276); m.bezierCurveTo(110, -270, 60, -250, 40, -220);   // her back, bent forward
  m.bezierCurveTo(30, -150, 50, -70, 80, 0); m.closePath(); m.fill();
  disc(m, 214, -296, 38, WH); disc(m, 180, -330, 20, WH);   // her head, bowed, and her bun
  m.strokeStyle = WH; m.lineWidth = 22; m.beginPath(); m.moveTo(140, -300); m.quadraticCurveTo(200, -220, 236, -150); m.stroke();   // her arm reaching down
  m.strokeStyle = RD; m.lineWidth = 9; m.beginPath(); m.moveTo(218, -186); m.lineTo(234, -178); m.moveTo(222, -172); m.lineTo(238, -164); m.stroke();   // red bangles
  m.strokeStyle = RD; m.lineWidth = 12; m.beginPath(); m.moveTo(-60, -20); m.lineTo(80, -20); m.stroke();   // the sari's red border
  m.strokeStyle = GD; m.lineWidth = 14; m.beginPath(); m.moveTo(226, -190); m.lineTo(300, -10); m.stroke(); for (let k = -5; k <= 5; k++) { m.lineWidth = 7; m.beginPath(); m.moveTo(300, -10); m.lineTo(300 + k * 16, 50); m.stroke(); }   // the broom
  for (let k = 0; k < 30; k++) disc(m, 360 + hh(k) * 260, 30 - hh(k * 3) * 60, 5, WH);   // the dust she sweeps away
  m.restore();
}
function raisedHand(m, x, y, s) {   // Lakshmi's hand: gold, the palm's alta circle and fingertips in red, bangles; around it, rays of fire
  m.save(); m.translate(x, y); m.scale(s, s);
  for (let k = 0; k < 21; k++) { const a = -Math.PI / 2 + (k - 10) * .14, r0 = 330, r1 = 470 + 60 * hh(k); m.strokeStyle = k % 2 ? RD : GD; m.lineWidth = 12; m.beginPath(); m.moveTo(Math.cos(a) * r0, -120 + Math.sin(a) * r0); m.lineTo(Math.cos(a) * r1, -120 + Math.sin(a) * r1); m.stroke(); }
  m.fillStyle = GD; const F = [[-84, -10, 230, 40, -.15], [-28, -24, 268, 42, -.05], [28, -18, 252, 41, .05], [82, 4, 198, 36, .17]];
  F.forEach(([fx, fy, L, w, th]) => { m.save(); m.translate(fx, fy); m.rotate(th); m.beginPath(); m.moveTo(-w / 2, 60); m.lineTo(-w / 2, -L + w / 2); m.arc(0, -L + w / 2, w / 2, Math.PI, 0); m.lineTo(w / 2, 60); m.fill(); disc(m, 0, -L + w / 2, w / 2 - 4, RD); m.restore(); m.fillStyle = GD; });
  m.beginPath(); m.moveTo(-110, 30); m.bezierCurveTo(-118, 130, -100, 210, -74, 270); m.lineTo(80, 270); m.bezierCurveTo(112, 200, 120, 110, 106, 20); m.closePath(); m.fill();
  m.save(); m.translate(-100, 220); m.rotate(-.8); m.beginPath(); m.roundRect(-22, -170, 44, 200, 22); m.fill(); m.restore();
  ring(m, 0, 130, 46, RD, 14); disc(m, 0, 130, 14, RD);
  m.fillRect(-70, 270, 146, 200); [[300, RD], [330, WH], [360, RD], [390, GD]].forEach(([yy, col]) => { m.fillStyle = col; m.fillRect(-84, yy, 174, 20); });
  m.restore();
}
function flame(m, x, y, s, col) { m.fillStyle = col; m.beginPath(); m.moveTo(x, y); m.bezierCurveTo(x - 26 * s, y - 20 * s, x - 14 * s, y - 60 * s, x, y - 90 * s); m.bezierCurveTo(x + 14 * s, y - 60 * s, x + 26 * s, y - 20 * s, x, y); m.fill(); }
function lamps(m, lit) { for (let k = 0; k < 12; k++) { const a = Math.PI * (1.08 + k / 11 * .84), x = 540 + Math.cos(a) * 420, y = 1060 + Math.sin(a) * 380; m.fillStyle = WH; m.beginPath(); m.ellipse(x, y, 34, 14, 0, 0, Math.PI); m.fill(); if (lit) flame(m, x, y - 10, .8, GD); } }
function leaf(m, x, y, s, rot = 0) { m.save(); m.translate(x, y); m.rotate(rot); m.scale(s, s); m.strokeStyle = GD; m.lineWidth = 14;
  m.beginPath(); m.moveTo(-420, 0); m.bezierCurveTo(-400, -220, -150, -260, 120, -250); m.bezierCurveTo(300, -240, 410, -190, 430, -150); m.lineTo(430, 150); m.bezierCurveTo(410, 200, 300, 250, 120, 255); m.bezierCurveTo(-150, 260, -400, 220, -420, 0); m.closePath(); m.stroke();
  m.lineWidth = 9; m.beginPath(); m.moveTo(-420, 0); m.lineTo(430, 4); m.stroke(); m.restore(); }
function meal(m, gold, heap = 1) { leaf(m, 540, 900, 1.15, -.06); m.fillStyle = gold ? GD : WH; m.beginPath(); m.ellipse(540, 900, 210 * heap, 165 * heap, 0, 0, 7); m.fill(); disc(m, 860, 760, 70, GD); disc(m, 870, 1040, 62, RD); disc(m, 210, 1060, 56, WH); }
function shikhara(m) { m.fillStyle = WH; m.beginPath(); m.moveTo(340, 900); for (let i = 0; i <= 30; i++) { const u = i / 30; m.lineTo(540 - 200 * (1 - .66 * u ** 2.3) + 6 * Math.sin(u * 60), 900 - 520 * u); } for (let i = 30; i >= 0; i--) { const u = i / 30; m.lineTo(540 + 200 * (1 - .66 * u ** 2.3) - 6 * Math.sin(u * 60), 900 - 520 * u); } m.fill();
  m.globalCompositeOperation = 'destination-out'; for (let k = 1; k < 12; k++) { const u = k / 12, w = 200 * (1 - .66 * u ** 2.3); m.fillRect(540 - w, 900 - 520 * u, w * 2, 6); } m.globalCompositeOperation = 'source-over';
  m.fillStyle = GD; m.beginPath(); m.ellipse(540, 372, 90, 22, 0, 0, 7); m.fill(); disc(m, 540, 340, 30, GD);
  ring(m, 540, 280, 34, GD, 10); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; m.strokeStyle = GD; m.lineWidth = 6; m.beginPath(); m.moveTo(540, 280); m.lineTo(540 + Math.cos(a) * 34, 280 + Math.sin(a) * 34); m.stroke(); }
  m.strokeStyle = GD; m.lineWidth = 8; m.beginPath(); m.moveTo(540, 246); m.lineTo(540, 170); m.stroke(); m.fillStyle = RD; m.beginPath(); m.moveTo(540, 170); m.quadraticCurveTo(620, 166, 690, 192); m.lineTo(540, 214); m.closePath(); m.fill();
  m.fillStyle = WH; m.fillRect(150, 900, 780, 30); }
function seated(m, x, y, s) { m.save(); m.translate(x, y); m.scale(s, s); disc(m, 0, -118, 27, WH); m.fillStyle = WH; m.beginPath(); m.moveTo(-62, 0); m.bezierCurveTo(-64, -50, -48, -82, -14, -88); m.lineTo(14, -88); m.bezierCurveTo(48, -82, 64, -50, 62, 0); m.closePath(); m.fill(); m.strokeStyle = RD; m.lineWidth = 6; m.beginPath(); m.moveTo(-40, -84); m.quadraticCurveTo(-10, -50, 40, -20); m.stroke(); m.restore(); }   // a devotee seen from behind, a red gamuchha over one shoulder
function armIn(m, a, col) { m.save(); m.translate(540, 980); m.rotate(a); m.translate(150, 0); m.scale(1.55, 1.55); m.fillStyle = WH;   // a forearm and a hand with its fingers gathered round a morsel, reaching in to the pot
  m.beginPath(); m.moveTo(0, -10); m.quadraticCurveTo(-8, 0, 0, 10); m.bezierCurveTo(30, 22, 60, 30, 92, 34); m.bezierCurveTo(130, 40, 160, 38, 186, 30); m.lineTo(214, 29); m.bezierCurveTo(300, 34, 460, 42, 900, 56); m.lineTo(900, -56); m.bezierCurveTo(460, -42, 300, -34, 214, -29); m.lineTo(186, -30); m.bezierCurveTo(160, -44, 130, -48, 100, -44); m.bezierCurveTo(70, -40, 36, -26, 0, -10); m.closePath(); m.fill();
  m.beginPath(); m.moveTo(96, -40); m.quadraticCurveTo(70, -62, 44, -54); m.quadraticCurveTo(36, -42, 52, -36); m.quadraticCurveTo(76, -38, 100, -28); m.closePath(); m.fill();   // the thumb
  m.globalCompositeOperation = 'destination-out'; m.lineWidth = 4; m.strokeStyle = '#000'; for (const k of [-14, 0, 13]) { m.beginPath(); m.moveTo(14, k * .4); m.quadraticCurveTo(50, k * .8, 88, k * 1.4); m.stroke(); } m.globalCompositeOperation = 'source-over';   // the fingers
  m.fillStyle = col; m.fillRect(220, -36, 14, 72); m.fillRect(240, -37, 9, 74); m.restore(); }
export function buildTargets() {
  defineTarget('jag', m => jagannath(m, 540, 800, 1), { dens: .22, seed: 1 });
  defineTarget('jagW', m => jagannath(m, 540, 800, 1, 1), { dens: .22, seed: 2 });
  defineTarget('bhoga', m => bowls(m, true), { dens: .24, seed: 3 });
  defineTarget('empty', m => bowls(m, false), { dens: .24, seed: 4 });
  for (let k = 0; k <= 5; k++) defineTarget('doors' + k, m => lane(m, k), { dens: .2, seed: 5 + k });
  defineTarget('one', m => { disc(m, 540, 900, 7, GD); }, { dens: .5, scatter: 300, seed: 12 });
  defineTarget('mandala', m => { mandala(m, 540, 860, .9); oText(m, 'ମାଣବସା ଗୁରୁବାର', 540, 330, 104, GD); }, { dens: .24, seed: 13 });
  defineTarget('walk', m => { hut(m, 540, 520, .8); steps(m, [540, 1360], [540, 600], 9, 1.15, GD); }, { dens: .26, seed: 14 });
  defineTarget('avoid', m => { hut(m, 540, 520, .8); steps(m, [540, 1360], [540, 600], 9, 1.15, GD);
    for (const sd of [-1, 1]) { for (let i = 0; i < 9; i++) { const u = i / 8, y = lerp(1360, 520, u), x = 540 + sd * (190 + 260 * Math.sin(Math.min(1, u * 1.3) * Math.PI / 2)); footprint(m, x + (i % 2 ? 12 : -12), y, -Math.PI / 2 + sd * .3 * Math.cos(u * 2), .75, WH, i % 2 === 0); } } }, { dens: .26, seed: 15 });
  defineTarget('sweep', m => { hut(m, 600, 560, .8); woman(m, 360, 1250, 1.25); }, { dens: .24, seed: 16 });
  defineTarget('invite', m => { hut(m, 540, 520, .8); for (let k = 0; k < 5; k++) { m.save(); m.translate(540, 560); m.rotate((k - 2) * .4); m.strokeStyle = WH; m.lineWidth = 10; m.beginPath(); m.moveTo(0, 0); m.quadraticCurveTo(40, -60, 0, -120); m.quadraticCurveTo(-40, -60, 0, 0); m.stroke(); m.restore(); } steps(m, [540, 1320], [540, 640], 8, 1.05, WH); flame(m, 330, 560, 1, GD); m.fillStyle = WH; m.beginPath(); m.ellipse(330, 570, 50, 18, 0, 0, Math.PI); m.fill(); }, { dens: .26, seed: 17 });
  defineTarget('enter', m => { hut(m, 540, 520, .8); for (let k = 0; k < 5; k++) { m.save(); m.translate(540, 560); m.rotate((k - 2) * .4); m.strokeStyle = WH; m.lineWidth = 10; m.beginPath(); m.moveTo(0, 0); m.quadraticCurveTo(40, -60, 0, -120); m.quadraticCurveTo(-40, -60, 0, 0); m.stroke(); m.restore(); } steps(m, [540, 1320], [540, 640], 8, 1.05, GD); flame(m, 330, 560, 1, GD); m.fillStyle = WH; m.beginPath(); m.ellipse(330, 570, 50, 18, 0, 0, Math.PI); m.fill(); }, { dens: .26, seed: 18 });
  const temple = (m, shut, foots) => { door(m, 540, 1300, 380, 640, shut); if (foots) steps(m, [540, 1700], [540, 1330], 4, .9, GD); };
  defineTarget('bala', m => { jagannath(m, 540, 740, .92, 0, 'B'); steps(m, [540, 1380], [540, 1200], 3, .9, GD); m.strokeStyle = WH; m.lineWidth = 10; m.beginPath(); m.moveTo(240, 1160); m.lineTo(840, 1160); m.stroke(); }, { dens: .24, seed: 19 });
  const bigDoors = (m, shut) => { m.strokeStyle = GD; m.lineWidth = 18; m.beginPath(); m.moveTo(200, 1250); m.lineTo(200, 560); m.quadraticCurveTo(540, 300, 880, 560); m.lineTo(880, 1250); m.stroke();
    if (shut) { m.fillStyle = WH; for (const sd of [-1, 1]) { m.beginPath(); m.moveTo(540 + sd * 6, 1240); m.lineTo(540 + sd * 6, 420); m.quadraticCurveTo(540 + sd * 200, 450, 540 + sd * 322, 570); m.lineTo(540 + sd * 322, 1240); m.closePath(); m.fill(); } m.globalCompositeOperation = 'destination-out'; for (let r = 0; r < 6; r++) for (const q of [-1, 1]) for (const z of [100, 230]) { m.beginPath(); m.arc(540 + q * z, 560 + r * 120, 14, 0, 7); m.fill(); } m.globalCompositeOperation = 'source-over'; for (let r = 0; r < 6; r++) for (const q of [-1, 1]) for (const z of [100, 230]) disc(m, 540 + q * z, 560 + r * 120, 10, GD); }
    else steps(m, [540, 1380], [540, 1270], 2, .9, GD); m.strokeStyle = WH; m.lineWidth = 10; m.beginPath(); m.moveTo(140, 1262); m.lineTo(940, 1262); m.stroke(); };
  defineTarget('shut', m => bigDoors(m, true), { dens: .24, seed: 20 });
  defineTarget('hand', m => raisedHand(m, 540, 820, 1.05), { dens: .24, seed: 21 });
  defineTarget('lamps', m => { raisedHand(m, 540, 760, .62); lamps(m, true); }, { dens: .24, seed: 22 });
  defineTarget('out', m => { lamps(m, false); }, { dens: .24, seed: 23 });
  defineTarget('fist', m => { m.strokeStyle = WH; m.lineWidth = 16; m.beginPath(); m.moveTo(330, 520); m.quadraticCurveTo(540, 700, 750, 520); m.stroke(); m.fillStyle = WH; m.beginPath(); m.ellipse(540, 560, 150, 50, 0, 0, Math.PI); m.fill(); for (let k = 0; k < 40; k++) disc(m, 540 + (hh(k) - .5) * 50, 640 + k * 18, 7, WH); }, { dens: .26, seed: 24 });
  defineTarget('dusk', m => lane(m, 5, -1, true), { dens: .2, seed: 25 });
  defineTarget('duskLit', m => lane(m, 5, 2, true), { dens: .2, seed: 26 });
  defineTarget('meal', m => meal(m, false), { dens: .24, seed: 27 });
  defineTarget('goldMeal', m => { meal(m, true); for (let k = 0; k < 4; k++) footprint(m, 540 + (k % 2 ? 26 : -26), 640 - k * 100, -Math.PI / 2, .9, GD, k % 2 === 0); }, { dens: .24, seed: 28 });
  defineTarget('open', m => { bigDoors(m, false); steps(m, [540, 1240], [540, 640], 6, .85, GD); }, { dens: .26, seed: 29 });
  const ringT = (m, div) => { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + .39; leaf(m, 540 + Math.cos(a) * 330, 900 + Math.sin(a) * 330, .34, a); } disc(m, 540, 900, 120, WH); ring(m, 540, 900, 140, GD, 12); if (div) { m.strokeStyle = RD; m.lineWidth = 12; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; m.beginPath(); m.moveTo(540 + Math.cos(a) * 170, 900 + Math.sin(a) * 170); m.lineTo(540 + Math.cos(a) * 520, 900 + Math.sin(a) * 520); m.stroke(); } } };
  defineTarget('ring', m => ringT(m, true), { dens: .24, seed: 30 });
  defineTarget('ringFree', m => ringT(m, false), { dens: .24, seed: 31 });
  defineTarget('bazar', m => { shikhara(m); for (let r = 0; r < 3; r++) for (let k = 0; k < 8; k++) seated(m, 110 + k * 122 + (r % 2) * 61, 1050 + r * 105, .6 + r * .08); }, { dens: .24, seed: 32 });
  defineTarget('hands', m => { [[0, RD], [.8, GD], [1.6, WH], [2.35, RD], [3.14, GD], [3.95, RD], [4.7, GD], [5.5, RD]].forEach(([a, col]) => armIn(m, a, col)); disc(m, 540, 980, 120, WH); ring(m, 540, 980, 140, GD, 12); }, { dens: .24, seed: 33 });
  defineTarget('palm', m => { m.strokeStyle = GD; m.lineWidth = 12; for (let k = 0; k < 3; k++) { m.beginPath(); m.roundRect(90, 560 + k * 190, 900, 150, 40); m.stroke(); } for (let s = 0; s < 6; s++) footprint(m, 300 + s * 95, 1040, -Math.PI / 2, .7, RD, s % 2 === 0); }, { dens: .24, seed: 34 });
  defineTarget('purana', m => { m.strokeStyle = GD; m.lineWidth = 12; for (let k = 0; k < 3; k++) { m.beginPath(); m.roundRect(90, 560 + k * 190, 900, 150, 40); m.stroke(); } oText(m, 'ଲକ୍ଷ୍ମୀ', 540, 640, 110, WH); oText(m, 'ପୁରାଣ', 540, 830, 110, WH); for (let s = 0; s < 6; s++) footprint(m, 300 + s * 95, 1040, -Math.PI / 2, .7, RD, s % 2 === 0); }, { dens: .26, seed: 35 });
}
