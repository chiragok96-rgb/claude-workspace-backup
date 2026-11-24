// The puppets and set pieces of the Lakshmi Purana, carved in translucent hide (white = light passes; dye = coloured light; ink = dark).
import { piece, fill, cut, cutLine, ink, within, smooth, poly, cloud, beads, beadLine, plum, lattice, coin, meander, scalesOpen, flameTongue, DYE } from './carve.js';
export const P = {};
const ring = (q, x, y, r0, r1) => { q.arc(x, y, r1, 0, 7); q.moveTo(x + r0, y); q.arc(x, y, r0, 0, 7, true); };
// —— Jagannath / Balabhadra: the sacred form, carved. J: a black face whose great round eyes are cut through (they glow); B: a pale face ——
function deity(who) {
  const J = who === 'J', face = J ? DYE.ink : DYE.hide, robe = J ? DYE.yellow : DYE.jade;
  return piece([-330, -760, 330, 40], g => {
    // the crown: a fan of carved petals in gold, scrolls cut through
    const crown = q => { q.moveTo(-232, -472); const n = 11; for (let k = 0; k <= n; k++) { const a = Math.PI * (1.04 + k / n * .92), r = 268 + (k % 2 ? -34 : 30) + (k === Math.floor(n / 2) || k === Math.ceil(n / 2) ? 46 : 0); q.lineTo(Math.cos(a) * r * .98, -470 + Math.sin(a) * r * 1.02); } q.lineTo(232, -472); q.closePath(); };
    fill(g, DYE.gold, crown);
    within(g, crown, () => {   // carved lace: rings of scrolls, a lotus at the crest, rows of beads, crescent slits
      for (let k = 0; k < 9; k++) { const a = Math.PI * (1.1 + k / 8 * .8); cloud(g, Math.cos(a) * 205, -470 + Math.sin(a) * 200, 24, a, 2.6, k % 2 ? 1 : -1); }
      for (let k = 0; k < 7; k++) { const a = Math.PI * (1.18 + k / 6 * .64); cloud(g, Math.cos(a) * 128, -470 + Math.sin(a) * 126, 17, a + 1, 2.2, k % 2 ? -1 : 1); }
      const pts = []; for (let k = 0; k <= 26; k++) { const a = Math.PI * (1.06 + k / 26 * .88); pts.push([Math.cos(a) * 250, -470 + Math.sin(a) * 252]); } beads(g, pts, 5);
      cut(g, q => { for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .28; q.moveTo(Math.cos(a) * 40, -500 + Math.sin(a) * 40); q.quadraticCurveTo(Math.cos(a + .2) * 80, -500 + Math.sin(a + .2) * 80, Math.cos(a) * 110, -500 + Math.sin(a) * 110); q.quadraticCurveTo(Math.cos(a - .2) * 80, -500 + Math.sin(a - .2) * 80, Math.cos(a) * 40, -500 + Math.sin(a) * 40); } }, 'nonzero');
      beadLine(g, -200, -488, 200, -488, 5, 18); });
    ink(g, 3, crown);
    fill(g, DYE.red, q => q.rect(-235, -480, 470, 34)); within(g, q => q.rect(-235, -480, 470, 34), () => { for (let x = -215; x < 220; x += 30) coin(g, x, -463, 10); }); ink(g, 2.5, q => q.rect(-235, -480, 470, 34));
    // the face
    const F = q => { q.moveTo(-235, -446); q.bezierCurveTo(-262, -320, -250, -190, -175, -120); q.quadraticCurveTo(0, -60, 175, -120); q.bezierCurveTo(250, -190, 262, -320, 235, -446); q.closePath(); };
    fill(g, face, F);
    for (const sd of [-1, 1]) { const ex = sd * 100, ey = -312;   // the eyes: red-dyed rims around holes cut clean through; a disc of hide left for the pupil
      if (J) { fill(g, DYE.red, q => ring(q, ex, ey, 66, 88)); cut(g, q => ring(q, ex, ey, 26, 66)); }
      else { fill(g, DYE.red, q => { q.ellipse(ex, ey, 92, 56, 0, 0, 7); q.moveTo(ex + 70, ey); q.ellipse(ex, ey, 70, 38, 0, 0, 7, true); }); cut(g, q => { q.ellipse(ex, ey, 70, 38, 0, 0, 7); q.moveTo(ex + 22, ey); q.arc(ex, ey, 22, 0, 7, true); }); } }
    fill(g, DYE.red, q => { q.moveTo(-110, -190); q.quadraticCurveTo(0, -120, 110, -190); q.quadraticCurveTo(0, -152, -110, -190); });   // the smile, red light
    if (J) { cut(g, q => { q.moveTo(-16, -260); q.lineTo(0, -420); q.lineTo(16, -260); q.closePath(); }); } else fill(g, DYE.red, q => { q.moveTo(-16, -260); q.lineTo(0, -420); q.lineTo(16, -260); q.closePath(); });   // the tilaka
    ink(g, 3.5, F);
    // the arms held forward
    for (const sd of [-1, 1]) { const A = q => { q.moveTo(sd * 200, -170); q.quadraticCurveTo(sd * 320, -175, sd * 318, -120); q.quadraticCurveTo(sd * 300, -92, sd * 180, -110); q.closePath(); }; fill(g, face, A); ink(g, 3, A); }
    // the robe: dyed, lattice-carved, a beaded hem
    const R = q => { q.moveTo(-180, -120); q.lineTo(-215, 20); q.lineTo(215, 20); q.lineTo(180, -120); q.closePath(); };
    fill(g, robe, R); within(g, R, () => { lattice(g, -210, -100, 210, -10, 30, 6); }); fill(g, DYE.red, q => q.rect(-215, -16, 430, 36)); within(g, q => q.rect(-215, -16, 430, 36), () => beadLine(g, -200, 2, 200, 2, 6, 22));
    ink(g, 3, R);
    // a garland: marigold beads
    for (let k = 0; k < 15; k++) { const u = k / 14, x = -170 + u * 340, y = -110 + Math.sin(u * Math.PI) * 60; fill(g, DYE.orange, q => q.arc(x, y, 15, 0, 7)); cut(g, q => q.arc(x, y, 5, 0, 7)); ink(g, 1.6, q => q.arc(x, y, 15, 0, 7)); }
  }, { ss: 2, seed: J ? 3 : 7 });
}
// —— an earthen pot of offering: orange dye, a band of coin holes, a carved rim, three slits of steam ——
function pot(v) {
  return piece([-46, -110, 46, 50], g => {
    const B = q => { q.moveTo(-22, -46); q.bezierCurveTo(-48, -40, -48, 30, 0, 40); q.bezierCurveTo(48, 30, 48, -40, 22, -46); q.closePath(); };
    fill(g, v % 3 === 0 ? DYE.red : v % 3 === 1 ? DYE.orange : DYE.brown, B); within(g, B, () => { for (let x = -30; x <= 30; x += 15) coin(g, x, -6, 5.5); });
    ink(g, 2.2, B); fill(g, DYE.brown, q => q.rect(-26, -54, 52, 10)); ink(g, 1.8, q => q.rect(-26, -54, 52, 10));
    for (const dx of [-12, 0, 12]) cutLine(g, 3, q => { q.moveTo(dx, -62); q.bezierCurveTo(dx + 10, -74, dx - 10, -88, dx + 4, -102); });
  }, { ss: 2, seed: v });
}
// —— a row of old Puri houses: carved walls, tiled roofs, latticed windows, doorways cut through (so they glow until a door closes) ——
export const LANE = { x0: -200, w: 2600, door: [], base: 1280 };
function lane() {
  const { x0, w, base } = LANE; LANE.door = [];
  return piece([x0, base - 760, x0 + w, base + 60], g => {
    for (let i = 0, x = x0 + 40; x < x0 + w - 300; i++) { const hw = 360 + (i % 3) * 40, hh_ = 520 + (i % 2) * 60, top = base - hh_;
      const wall = q => q.rect(x, top, hw, hh_); fill(g, i % 2 ? DYE.hide2 : DYE.hide, wall); within(g, wall, () => { lattice(g, x + 30, top + 60, x + hw - 30, top + 120, 22, 5); });
      ink(g, 3, wall);
      const roof = q => { q.moveTo(x - 30, top + 4); q.lineTo(x + hw / 2, top - 150); q.lineTo(x + hw + 30, top + 4); q.closePath(); }; fill(g, DYE.crim, roof); within(g, roof, () => scalesOpen(g, x - 30, top - 150, x + hw + 30, top + 4, 13)); ink(g, 3, roof);
      const dx = x + hw / 2, dw = 120, dh = 230; cut(g, q => { q.moveTo(dx - dw / 2, base - 10); q.lineTo(dx - dw / 2, base - dh + dw / 2); q.arc(dx, base - dh + dw / 2, dw / 2, Math.PI, 0); q.lineTo(dx + dw / 2, base - 10); q.closePath(); });   // the doorway, cut through
      ink(g, 4, q => { q.moveTo(dx - dw / 2 - 8, base - 10); q.lineTo(dx - dw / 2 - 8, base - dh + dw / 2); q.arc(dx, base - dh + dw / 2, dw / 2 + 8, Math.PI, 0); q.lineTo(dx + dw / 2 + 8, base - 10); });
      LANE.door.push([dx, base - 10, dw, dh]);
      for (const sd of [-1, 1]) { const wx = dx + sd * (hw / 2 - 70); cut(g, q => q.rect(wx - 34, top + 170, 68, 90)); for (let b = 1; b < 4; b++) fill(g, DYE.brown, q => q.rect(wx - 34 + b * 17 - 2.5, top + 170, 5, 90)); ink(g, 2.4, q => q.rect(wx - 34, top + 170, 68, 90)); }
      x += hw + 30; }
    const gr = q => q.rect(x0, base - 12, w, 70); fill(g, DYE.brown, gr); within(g, gr, () => { for (let x = x0 + 20; x < x0 + w; x += 70) cloud(g, x, base + 22, 16, 0, 2, 1); }); ink(g, 3, gr);   // the carved ground strip
  }, { ss: 1.5, seed: 21 });
}
function doorLeaf() { return piece([-62, -232, 62, 4], g => { const L = q => { q.moveTo(-60, 0); q.lineTo(-60, -170); q.arc(0, -170, 60, Math.PI, 0); q.lineTo(60, 0); q.closePath(); }; fill(g, DYE.brown, L); within(g, L, () => { for (let r = 0; r < 5; r++) for (const sx of [-24, 24]) coin(g, sx, -30 - r * 38, 7); }); ink(g, 3, L); ink(g, 2.4, q => { q.moveTo(0, 0); q.lineTo(0, -228); }); }, { ss: 2, seed: 30 }); }
// —— the jhoti: a great lotus of rice paste — here carved: a red-dyed disc whose cut petals let the light through like white paste ——
function jhoti() {
  return piece([-520, -520, 520, 520], g => {
    const D = q => q.arc(0, 0, 500, 0, 7); fill(g, DYE.crim, D);
    within(g, D, () => {
      cut(g, q => { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; q.moveTo(Math.cos(a) * 190, Math.sin(a) * 190); q.quadraticCurveTo(Math.cos(a + .32) * 280, Math.sin(a + .32) * 280, Math.cos(a) * 350, Math.sin(a) * 350); q.quadraticCurveTo(Math.cos(a - .32) * 280, Math.sin(a - .32) * 280, Math.cos(a) * 190, Math.sin(a) * 190); } }, 'nonzero');
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; fill(g, DYE.crim, q => { q.moveTo(Math.cos(a) * 225, Math.sin(a) * 225); q.quadraticCurveTo(Math.cos(a + .17) * 275, Math.sin(a + .17) * 275, Math.cos(a) * 315, Math.sin(a) * 315); q.quadraticCurveTo(Math.cos(a - .17) * 275, Math.sin(a - .17) * 275, Math.cos(a) * 225, Math.sin(a) * 225); }); }   // each petal outlined (only a rim of light)
      cut(g, q => { for (let k = 0; k < 16; k++) { const a = (k + .5) * Math.PI / 8; q.moveTo(Math.cos(a) * 365, Math.sin(a) * 365); q.quadraticCurveTo(Math.cos(a + .15) * 410, Math.sin(a + .15) * 410, Math.cos(a) * 455, Math.sin(a) * 455); q.quadraticCurveTo(Math.cos(a - .15) * 410, Math.sin(a - .15) * 410, Math.cos(a) * 365, Math.sin(a) * 365); } }, 'nonzero');
      const pts = []; for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; pts.push([Math.cos(a) * 478, Math.sin(a) * 478]); } beads(g, pts, 8);
      cutLine(g, 6, q => { q.arc(0, 0, 175, 0, 7); }); cutLine(g, 4, q => { q.arc(0, 0, 360, 0, 7); });
    });
    ink(g, 3, D);
    // the Mana at the heart: a woven paddy-measure heaped with gold paddy
    const M = q => q.arc(0, 0, 150, 0, 7); fill(g, DYE.brown, M); within(g, M, () => { for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2; cutLine(g, 2.2, q => { q.moveTo(Math.cos(a) * 128, Math.sin(a) * 128); q.lineTo(Math.cos(a) * 146, Math.sin(a) * 146); }); } });
    const Pd = q => q.arc(0, 0, 122, 0, 7); fill(g, DYE.yellow, Pd); within(g, Pd, () => { for (let k = 0; k < 160; k++) { const r = Math.sqrt((k * 0.618) % 1) * 112, a = k * 2.4; cutLine(g, 2, q => { const x = Math.cos(a) * r, y = Math.sin(a) * r; q.moveTo(x - 4 * Math.cos(k), y - 4 * Math.sin(k)); q.lineTo(x + 4 * Math.cos(k), y + 4 * Math.sin(k)); }); } });
    ink(g, 3, M); fill(g, DYE.red, q => { q.moveTo(-70, -20); q.quadraticCurveTo(0, -70, 70, -20); q.quadraticCurveTo(0, 0, -70, -20); }); ink(g, 2, q => { q.moveTo(-70, -20); q.quadraticCurveTo(0, -70, 70, -20); q.quadraticCurveTo(0, 0, -70, -20); });
  }, { ss: 1.6, seed: 40 });
}
// —— the title: a dark hide plaque on rods, its letters cut out so they shine ——
function plaque(text, w = 860, h = 200) {
  return piece([-w / 2 - 20, -h / 2 - 20, w / 2 + 20, h / 2 + 20], g => {
    const O = q => { const r = 24; q.moveTo(-w / 2 + r, -h / 2); q.lineTo(w / 2 - r, -h / 2); q.quadraticCurveTo(w / 2 + 12, -h / 2 - 12, w / 2, -h / 2 + r); q.lineTo(w / 2, h / 2 - r); q.quadraticCurveTo(w / 2 + 12, h / 2 + 12, w / 2 - r, h / 2); q.lineTo(-w / 2 + r, h / 2); q.quadraticCurveTo(-w / 2 - 12, h / 2 + 12, -w / 2, h / 2 - r); q.lineTo(-w / 2, -h / 2 + r); q.quadraticCurveTo(-w / 2 - 12, -h / 2 - 12, -w / 2 + r, -h / 2); q.closePath(); };
    fill(g, '#3a1a10', O); const band = q => { O(q); q.rect(-w / 2 + 22, -h / 2 + 22, w - 44, h - 44); }; fill(g, DYE.red, band); within(g, band, () => { for (let x = -w / 2 + 30; x < w / 2 - 20; x += 24) { coin(g, x, -h / 2 + 11, 6); coin(g, x, h / 2 - 11, 6); } });
    ink(g, 2.5, O); ink(g, 1.8, q => q.rect(-w / 2 + 22, -h / 2 + 22, w - 44, h - 44));
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 96px "OdiaSerif"'; g.fillText(text, 0, 6); g.restore();
  }, { ss: 2, seed: 50 });
}
export function buildPieces() { P.J = deity('J'); P.B = deity('B'); P.pots = Array.from({ length: 7 }, (_, v) => pot(v)); P.lane = lane(); P.leaf = doorLeaf(); P.jhoti = jhoti(); P.title = plaque('ମାଣବସା ଗୁରୁବାର'); }
