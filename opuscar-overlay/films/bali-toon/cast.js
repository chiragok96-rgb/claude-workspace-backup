// The cast, drawn with the toon engine (boiling ink outline, flat fills, hard shadow shapes, big eyes, elastic mouths).
// Origin at the feet, y down. Every character takes a pose object P.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

export const C = {
  skinB: '#b9774c', skinBs: '#965a33', hair: '#231a1f', kurta: '#f4a531', kurtaS: '#d4821b', jeans: '#3d62b0', jeansS: '#2c4a8a', gam1: '#d8392f', gam2: '#f7efe2',
  skinT: '#a8693f', skinTs: '#87502c', tee: '#33b07a', teeS: '#22895c', cap: '#f0602a', capS: '#c94818', shorts: '#e8d29a', shortsS: '#c4ad72',
  frock: '#e2392f', frockS: '#b8261e', gold: '#f4c542', white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a', moon: '#ffe28a', moonS: '#f2c45a', night: '#2b2a6e',
};
const sweatDrop = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— faces ——
// mode: 'open' | 'closed' (sleep arc) | 'pop' (huge, tiny pupils) | 'spiral' | 'heart' | 'happy' (^ ^)
export function eyePair(cx, cy, rx, ry, sep, o = {}) {
  const mode = o.mode || 'open', look = o.look || [0, 0], t = o.t || 0;
  for (const s of [-1, 1]) {
    const x = cx + s * sep, k = s < 0 ? 1.08 : .96;
    if (mode === 'closed') { stroke(arc(x, cy + ry * .1, rx * .8, ry * .4, Math.PI * .1, Math.PI * .9, 14), 6); continue; }
    if (mode === 'happy') { stroke(arc(x, cy + ry * .35, rx * .75, ry * .7, Math.PI * 1.15, Math.PI * 1.85, 14), 6.5); continue; }
    if (mode === 'heart') { const h = ry * 1.05; shape(spline([[x, cy + h * .9], [x - h, cy - h * .05], [x - h * .55, cy - h * .8], [x, cy - h * .35], [x + h * .55, cy - h * .8], [x + h, cy - h * .05]]), { fill: '#ff3d6e', lw: 6 }); dot(x - h * .35, cy - h * .35, h * .14, '#fff'); continue; }
    const sc = mode === 'pop' ? 1.55 : 1;
    shape(ell(x, cy, rx * k * sc, ry * k * sc, 36), { fill: '#fff', lw: 6, shade: () => {
      if (mode === 'spiral') { const P = []; for (let i = 0; i < 60; i++) { const a = i * .42 + t * 9 * s, r = i / 60 * rx * .85; P.push([x + Math.cos(a) * r, cy + Math.sin(a) * r * ry / rx]); } stroke(P, 4); return; }
      const pr = mode === 'pop' ? 3.6 : (o.pupil ?? 7);
      dot(x + look[0] * rx * .45, cy + look[1] * ry * .45, pr); if (mode !== 'pop') dot(x + look[0] * rx * .45 + pr * .45, cy + look[1] * ry * .45 - pr * .5, pr * .35, '#fff');
      if (o.lid) { const yl = cy - ry * sc + o.lid * 2 * ry * sc; fillOnly([[x - rx * 2, cy - ry * 2], [x + rx * 2, cy - ry * 2], [x + rx * 2, yl], [x - rx * 2, yl]], o.skin || C.skinB, { boil: .4 }); stroke([[x - rx * 1.2, yl], [x + rx * 1.2, yl]], 5); }
    } });
  }
}
export function mouth(cx, cy, mw, o = {}) {
  const op = o.o ?? 0, sm = o.sm ?? .5, hw = mw * (o.w ?? 1) / 2, k = mw * .25, lc = [cx - hw, cy - sm * k], rc = [cx + hw, cy - sm * k];
  if (op < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.3], rc, 12), 6); return; }
  const h = op * mw * .7, up = quad(lc, [cx, cy - h * .2 + sm * k * .4], rc, 12), dn = quad(rc, [cx, cy + h + sm * k * .5], lc, 14);
  shape([...up, ...dn], { fill: C.mouthIn, lw: 6, shade: () => { if (op > .25) fillOnly(rect(cx - hw * 1.2, cy - h * .6, hw * 2.4, h * .45), '#fff', { boil: .3 }); fillOnly(ell(cx + hw * .1, cy + h * .95, hw * .62, h * .45, 20), C.tongue, { boil: .3 }); } });
  if (o.drool) shape(spline([[cx + hw * .5, cy + h * .6], [cx + hw * .7, cy + h + 26], [cx + hw * .45, cy + h + 34], [cx + hw * .3, cy + h + 10]]), { fill: '#bfe9ff', lw: 4 });
}
export function hand(x, y, ang, r = 18, col = C.skinB, o = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = o.fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw: 6 }); pop();
}
const arm = (sh, a, col, skin, sleeve = 34) => { const hp = [sh[0] + a.h[0], sh[1] + a.h[1]]; shape(noodle(sh, hp, a.bend ?? 0, 22, 18), { fill: skin, lw: 6 }); shape(noodle(sh, [sh[0] + a.h[0] * .38, sh[1] + a.h[1] * .38], 0, sleeve, sleeve * .85), { fill: col, lw: 6 }); hand(hp[0], hp[1], Math.atan2(a.h[1], a.h[0]), 16, skin, { fist: a.fist }); return hp; };

// —— Bulu: Cuttack boy, curls, saffron kurta, checked gamcha ——
export function bulu(P) {
  const f = P.face ?? 1; push(); translate(P.x, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1)); rotate(P.tilt || 0);
  const lg = P.legs || [[0, 0], [0, 0]];
  for (const [i, sx] of [[0, -1], [1, 1]]) { const hip = [sx * 22, -150], ank = [sx * 26 + lg[i][0], -16 + lg[i][1]];
    shape(noodle(hip, ank, sx * -4, 34, 28), { fill: C.jeans, lw: 6, shade: () => fillOnly(rect(sx > 0 ? 6 : -60, -160, 54, 170), C.jeansS, { boil: .3 }) });
    shape(spline([[ank[0] - 22, ank[1] + 16], [ank[0] - 18, ank[1] - 2], [ank[0] + 28, ank[1] + 2], [ank[0] + 34, ank[1] + 16]]), { fill: '#7a4a2a', lw: 6 }); }
  const bel = P.belly ?? 0;
  const armL = P.armL || { h: [-30, 110], bend: -14 }, armR = P.armR || { h: [30, 110], bend: 14 };
  arm([-46, -300], armL, C.kurta, C.skinB);
  // kurta (with belly)
  const B = spline([[0, -322], [52, -306], [64 + bel * 70, -230], [60 + bel * 40, -120], [0, -108], [-60 - bel * 40, -120], [-64 - bel * 70, -230], [-52, -306]]);
  shape(B, { fill: C.kurta, lw: 7, shade: () => { fillOnly(spline([[20, -330], [80, -300], [96 + bel * 70, -200], [80, -100], [36, -100], [50 + bel * 30, -210]]), C.kurtaS, { boil: .4 }); stroke([[0, -300], [0, -232]], 4); for (const y of [-286, -266, -246]) dot(0, y, 3.5, '#8a5a1c'); } });
  // gamcha: checked scarf over the shoulders, one end hanging
  const G = spline([[-58, -318], [0, -296], [58, -318], [62, -300], [10, -276], [24, -190], [-4, -186], [-14, -276], [-62, -300]]);
  shape(G, { fill: C.gam2, lw: 6, shade: () => { for (let k = -8; k < 8; k++) { fillOnly(rect(k * 16, -340, 7, 170), C.gam1, { boil: .2, alpha: .85 }); fillOnly(rect(-140, -330 + k * 16, 280, 6), C.gam1, { boil: .2, alpha: .6 }); } } });
  // head
  push(); translate(0, -392); rotate(P.headTilt || 0);
  if (P.hairUp) for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * .28; shape(ell(Math.cos(a) * 92, -40 + Math.sin(a) * 92, 26, 30, 14), { fill: C.hair, lw: 6 }); }
  shape(ell(-62, 8, 14, 20, 14), { fill: C.skinB, lw: 6 });
  shape(spline([[-58, -60], [0, -84], [58, -60], [70, 6], [52, 64], [0, 82], [-52, 64], [-70, 6]]), { fill: C.skinB, lw: 7, shade: () => fillOnly(ell(44, 22, 40, 70, 20), C.skinBs, { boil: .3 }) });
  // curls
  const curls = [[-62, -42, 26], [-40, -74, 30], [-6, -90, 32], [30, -84, 30], [58, -56, 26], [-70, -8, 18], [70, -14, 16]];
  for (const [x, y, r] of curls) shape(ell(x, y, r, r * .9, 16), { fill: C.hair, lw: 6, shade: () => stroke(arc(x - r * .2, y - r * .2, r * .5, r * .4, Math.PI * 1.1, Math.PI * 1.7, 6), 3, { line: '#5a4650' }) });
  const ey = P.eyes || {};
  eyePair(4, -6, 20, 24, 28, { ...ey, skin: C.skinB, t: P.t });
  // brows
  const br = P.brow ?? 0; stroke([[-44, -42 - br * 8], [-14, -46 - br * 12]], 7); stroke([[14, -46 - br * 12], [46, -42 - br * 8]], 7);
  // nose, mustache, mouth
  stroke(quad([4, 4], [16, 26], [2, 32], 8), 5);
  shape(spline([[-26, 42], [0, 36], [26, 42], [24, 48], [0, 44], [-24, 48]]), { fill: C.hair, lw: 4 });
  mouth(2, 58, 34, P.mouth || {});
  pop();
  arm([46, -300], armR, C.kurta, C.skinB);
  if (P.sweat) sweatDrop(90, -470, 1);
  pop();
}

// —— Tuku: the friend, round, green tee, cap backwards ——
export function tuku(P) {
  const f = P.face ?? 1; push(); translate(P.x, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1)); rotate(P.tilt || 0);
  const lg = P.legs || [[0, 0], [0, 0]];
  for (const [i, sx] of [[0, -1], [1, 1]]) { const hip = [sx * 26, -96], ank = [sx * 28 + lg[i][0], -14 + lg[i][1]];
    shape(noodle(hip, ank, 0, 30, 26), { fill: C.skinT, lw: 6, shade: () => fillOnly(rect(-200, -110, 400, 46), C.shorts, { boil: .3 }) });
    shape(spline([[ank[0] - 20, ank[1] + 14], [ank[0] - 16, ank[1] - 2], [ank[0] + 26, ank[1] + 2], [ank[0] + 30, ank[1] + 14]]), { fill: '#e8e2d4', lw: 6 }); }
  const armL = P.armL || { h: [-34, 80], bend: -12 }, armR = P.armR || { h: [34, 80], bend: 12 };
  arm([-62, -210], armL, C.tee, C.skinT, 36);
  shape(spline([[0, -236], [62, -220], [86, -150], [70, -86], [0, -76], [-70, -86], [-86, -150], [-62, -220]]), { fill: C.tee, lw: 7, shade: () => { fillOnly(spline([[30, -240], [96, -210], [104, -120], [60, -80], [56, -150]]), C.teeS, { boil: .4 }); text('ODISHA', 0, -158, { font: '800 22px "Baloo 2"', fill: '#f7efe2' }); } });
  push(); translate(0, -306); rotate(P.headTilt || 0);
  for (const sx of [-1, 1]) shape(ell(sx * 80, 8, 14, 20, 14), { fill: C.skinT, lw: 6 });
  shape(ell(0, 0, 82, 78, 50), { fill: C.skinT, lw: 7, shade: () => fillOnly(ell(44, 26, 50, 60, 24), C.skinTs, { boil: .3 }) });
  // cap, backwards
  shape([...arc(0, -16, 86, 74, Math.PI * 1.02, Math.PI * 1.98, 26), [84, -14], [-84, -14]], { fill: C.cap, lw: 7, shade: () => fillOnly(ell(36, -54, 46, 34, 20), C.capS, { boil: .3 }) });
  shape(spline([[-84, -20], [-120, -30], [-126, -14], [-86, -6]]), { fill: C.capS, lw: 6 });
  const ey = P.eyes || {};
  eyePair(0, 12, 17, 20, 26, { ...ey, skin: C.skinT, t: P.t, pupil: 6 });
  stroke([[-40, -18], [-14, -22]], 6); stroke([[14, -22], [40, -18]], 6);
  shape(ell(0, 36, 9, 7, 12), { fill: C.skinTs, lw: 5 });
  mouth(0, 52, 40, P.mouth || { o: .4, sm: 1 });
  pop();
  arm([62, -210], armR, C.tee, C.skinT, 36);
  pop();
}

// —— Taapoi: a little girl in a red frock with gold border, two plaits ——
export function taapoi(P) {
  const f = P.face ?? 1; push(); translate(P.x, P.y); scale((P.s ?? 1) * f, P.s ?? 1);
  for (const sx of [-1, 1]) shape(noodle([sx * 14, -70], [sx * 16, -10], 0, 16, 14), { fill: C.skinB, lw: 5 });
  arm([-30, -160], P.armL || { h: [10, -40], bend: -10 }, C.frock, C.skinB, 26);
  shape(spline([[0, -176], [34, -160], [62, -64], [0, -56], [-62, -64], [-34, -160]]), { fill: C.frock, lw: 6, shade: () => { fillOnly(rect(-80, -86, 160, 20), C.gold, { boil: .3 }); fillOnly(spline([[20, -180], [70, -70], [40, -60]]), C.frockS, { boil: .3 }); } });
  push(); translate(0, -228);
  for (const sx of [-1, 1]) shape(noodle([sx * 40, -10], [sx * 54, 74], sx * 6, 18, 12), { fill: C.hair, lw: 5 });
  shape(ell(0, 0, 52, 54, 36), { fill: C.skinB, lw: 6 });
  shape([...arc(0, -6, 56, 54, Math.PI * 1.05, Math.PI * 1.95, 20), [50, -14], [0, -30], [-50, -14]], { fill: C.hair, lw: 6 });
  dot(0, -26, 4, '#d8392f');
  eyePair(0, 6, 11, 13, 18, { mode: P.eyesMode || 'closed', skin: C.skinB });
  mouth(0, 30, 18, P.mouth || { o: .5, sm: .6 });
  pop(); arm([30, -160], P.armR || { h: [-10, -40], bend: 10 }, C.frock, C.skinB, 26);
  pop();
}

// —— the Moon: a sleepy crescent-moon friend with a nightcap ——
export function moonFace(x, y, r, o = {}) {
  push(); translate(x, y);
  shape(ell(0, 0, r, r, 60), { fill: C.moon, lw: 7, shade: () => { fillOnly(ell(r * .35, r * .3, r * .8, r * .8, 30), C.moonS, { boil: .3 }); for (const [cx, cy, rr_] of [[-.4, -.3, .14], [.3, -.45, .1], [-.1, .5, .12]]) shape(ell(cx * r, cy * r, rr_ * r, rr_ * r * .8, 14), { fill: C.moonS, lw: 4 }); } });
  if (o.cap !== false) { const cp = spline([[-r * .85, -r * .45], [-r * .2, -r * 1.25], [r * .9, -r * 1.55], [r * .6, -r * 1.1], [r * .85, -r * .5]]); shape(cp, { fill: '#3f5fc8', lw: 7, shade: () => { for (let k = 0; k < 4; k++) dot(-r * .4 + k * r * .35, -r * .9 + (k % 2) * 20, 8, '#f7efe2'); } }); shape(ell(r * .95, -r * 1.55, r * .16, r * .16, 16), { fill: '#f7efe2', lw: 6 }); }
  eyePair(0, -r * .02, r * .17, r * .2, r * .3, { mode: o.eyes || 'closed', look: o.look, skin: C.moon });
  if (o.eyes !== 'pop') stroke(quad([-r * .2, r * .38], [0, r * .48], [r * .2, r * .38], 10), 6); else mouth(0, r * .42, r * .3, { o: .9, sm: 0 });
  pop();
}
// —— crowd person: a simple bean with a head, colour by seed ——
const CROWD = ['#e0413a', '#f2b632', '#2f74c8', '#e45d9b', '#33a46a', '#7a4fc0', '#f07a2c', '#17a5a8', '#f7efe2'];
export function bean(x, y, s, seed, o = {}) {
  push(); translate(x, y); scale(s); const c = CROWD[Math.floor(hash(seed) * CROWD.length)], sk = ['#b9774c', '#a8693f', '#8a5636', '#c88a5e'][Math.floor(hash(seed * 3) * 4)];
  shape(spline([[0, -150], [40, -132], [46, -40], [0, -4], [-46, -40], [-40, -132]]), { fill: c, lw: 6 });
  shape(ell(0, -186, 34, 34, 24), { fill: sk, lw: 6 }); shape([...arc(0, -190, 36, 34, Math.PI * 1.05, Math.PI * 1.95, 14), [32, -196], [-32, -196]], { fill: C.hair, lw: 5 });
  eyePair(0, -184, 7, 8, 12, { mode: o.eyes || (hash(seed * 7) > .5 ? 'happy' : 'open'), skin: sk, pupil: 3.5 });
  if (o.laugh) mouth(0, -164, 24, { o: .9, sm: 1 }); else stroke(quad([-10, -166], [0, -160], [10, -166], 6), 4);
  pop();
}
export { sweatDrop };
