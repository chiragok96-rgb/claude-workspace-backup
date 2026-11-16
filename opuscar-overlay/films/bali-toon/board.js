// Storyboard key frames: one per lyric line (index 0..15), drawn with the toon engine; words are living props.
import * as T from './toon.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, bands, g } from './toon.js';
import { bulu, tuku, taapoi, moonFace, bean, hand, eyePair, mouth, C } from './cast.js';
import { word, line, shatter, width } from './words.js';
import { hash, lerp, clamp, TAU } from '/core/lib.js';
const W = 1080, H = 1920;
const QS = new URLSearchParams(location.search);
const cv = document.createElement('canvas'); cv.width = W; cv.height = H; document.getElementById('stage').appendChild(cv); T.init(cv);
for (const f of ['800 40px "Bhaina"', '800 40px "Baloo 2"']) await document.fonts.load(f, 'ଅA');
const coast = await (await fetch('data/coast.json')).json();

// ——— shared props ———
function stars(n, y0, y1, seed = 1, col = '#fff6d8') { for (let i = 0; i < n; i++) { const x = hash(i * 3.1 + seed) * W, y = lerp(y0, y1, hash(i * 7.7 + seed)), r = 1.5 + hash(i * 5.3) * 3; dot(x, y, r, col); if (hash(i) > .85) { stroke([[x - 9, y], [x + 9, y]], 3, { line: col }); stroke([[x, y - 9], [x, y + 9]], 3, { line: col }); } } }
function burst(x, y, r, cols, k = 1) { for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, r0 = r * .25 * k, r1 = r * k; stroke([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], 6, { line: cols[i % cols.length] }); dot(x + Math.cos(a) * r1 * 1.08, y + Math.sin(a) * r1 * 1.08, 6, cols[(i + 1) % cols.length]); } }
function sunburst(cx, cy, cols, n = 24, R = 2400) { for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + .5) / n * TAU; fillOnly([[cx, cy], [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R], [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R]], cols[i % cols.length], { boil: 0 }); } }
function confetti(n, seed, y0 = 0, y1 = H) { const cols = ['#ffd23f', '#ff4d6d', '#3ec1d3', '#7bd389', '#ffffff', '#ff9f1c']; for (let i = 0; i < n; i++) { const x = hash(i * 1.3 + seed) * W, y = lerp(y0, y1, hash(i * 2.9 + seed)); push(); translate(x, y); rotate(hash(i) * 6); fillOnly(rect(-9, -4, 18, 8), cols[i % cols.length], { boil: 0 }); pop(); } }
function stall(x, y, s, col, i = 0) { push(); translate(x, y); scale(s);
  shape(rr(-80, -110, 160, 110, 6), { fill: '#5a3a2a', lw: 6, shade: () => fillOnly(rect(-70, -90, 140, 50), '#ffd27a', { boil: .3 }) });
  for (let k = 0; k < 4; k++) fillOnly(ell(-48 + k * 32, -46, 11, 9, 12), ['#e0413a', '#33a46a', '#f2b632', '#2f74c8'][(k + i) % 4], { boil: .3 });
  const cn = [[-100, -110], [100, -110], [80, -190], [-80, -190]]; shape(cn, { fill: '#fff', lw: 6, shade: () => { for (let k = -5; k < 5; k++) fillOnly([[k * 40, -200], [k * 40 + 20, -200], [k * 40 + 26, -100], [k * 40 + 6, -100]], col, { boil: .2 }); } });
  for (let k = 0; k < 5; k++) shape(arc(-80 + k * 40, -110, 20, 16, 0, Math.PI, 8), { fill: k % 2 ? '#fff' : col, lw: 5 });
  for (const sx of [-1, 1]) stroke([[sx * 92, -110], [sx * 92, 0]], 6); pop(); }
function ramdoliWheel(cx, cy, R, t, o = {}) {
  const rot = t * .4;
  for (const sx of [-1, 1]) shape(noodle([cx, cy], [cx + sx * R * .55, cy + R * 1.18], 0, 26, 30), { fill: '#e8e4f5', lw: 7 });
  shape(ell(cx, cy, R, R, 90), { fill: null, lw: 12, stroke: true, closed: true });
  stroke(ell(cx, cy, R * .94, R * .94, 90).concat([ell(cx, cy, R * .94, R * .94, 90)[0]]), 7, { line: '#fff' });
  for (let k = 0; k < 16; k++) { const a = rot + k / 16 * TAU; stroke([[cx, cy], [cx + Math.cos(a) * R, cy + Math.sin(a) * R]], 5); }
  for (let k = 0; k < 64; k++) { const a = rot + k / 64 * TAU; dot(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 9, ['#ffd23f', '#ff4d6d', '#3ec1d3', '#7bd389'][(k + Math.floor(t * 8)) % 4]); }
  shape(ell(cx, cy, 34, 34, 20), { fill: '#e8e4f5', lw: 7 });
  const cars = [];
  for (let k = 0; k < 8; k++) { const a = rot + k / 8 * TAU, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; cars.push([x, y]);
    if (o.skip === k) continue; stroke([[x, y], [x, y + 36]], 5); shape(rr(x - 46, y + 30, 92, 64, 14), { fill: ['#e0413a', '#2f74c8', '#f2b632', '#33a46a'][k % 4], lw: 6 }); }
  return cars;
}
function lampBoat(x, y, s, t = 0, seed = 0) { push(); translate(x, y); scale(s);
  shape(spline([[-60, -6], [60, -6], [40, 18], [-40, 18]]), { fill: '#9fb85a', lw: 5, shade: () => fillOnly(rect(-70, 4, 140, 20), '#7a9a40', { boil: .3 }) });
  shape(spline([[-36, -10], [10, -24], [30, -12], [-10, -4]]), { fill: '#3f8a2a', lw: 4 });
  shape(ell(22, -16, 14, 7, 12), { fill: '#b8572a', lw: 4 });
  const f = 1 + .12 * Math.sin(t * 14 + seed); shape(spline([[22, -52 * f], [32, -26], [22, -18], [12, -26]]), { fill: '#ffb627', lw: 4, shade: () => fillOnly(ell(22, -26, 5, 8, 8), '#fff6c8', { boil: 0 }) });
  pop(); }
function swanBoita(x, y, s, o = {}) {   // the Bali Jatra boita: a swan / peacock prow, painted hull, two square sails
  push(); translate(x, y); scale(s * (o.flip ? -1 : 1), s * (o.vflip ? -1 : 1));
  const gold = o.ghost ? '#ffe6a0' : '#f2b632';
  shape(spline([[-300, -40], [280, -40], [230, 60], [-250, 60]]), { fill: o.ghost ? '#f4d27a' : '#8a3a22', lw: 8, shade: () => { fillOnly(rect(-320, -30, 640, 22), gold, { boil: .2 }); for (let k = -5; k < 6; k++) dot(k * 50, 20, 8, o.ghost ? '#fff3c8' : '#e8c070'); } });
  shape(noodle([270, -36], [360, -230], -60, 34, 22), { fill: o.ghost ? '#fff3d0' : '#f7efe2', lw: 8 });                     // the swan's neck
  shape(ell(372, -246, 34, 26, 20), { fill: o.ghost ? '#fff3d0' : '#f7efe2', lw: 7 }); shape([[400, -250], [446, -238], [402, -230]], { fill: '#ff9f1c', lw: 6 }); dot(380, -254, 5);
  for (let k = 0; k < 6; k++) shape(noodle([-290, -36], [-380 - k * 8, -220 + k * 34], -30, 26, 14), { fill: ['#2f74c8', '#33a46a', gold][k % 3], lw: 6 });   // tail plumes
  for (const [mx, h, w] of [[-60, 330, 210], [130, 250, 150]]) { stroke([[mx, -40], [mx, -40 - h]], 8); shape(spline([[mx - w / 2, -40 - h], [mx + w / 2, -40 - h], [mx + w / 2 + 26 * (o.wind ?? 1), -40 - h * .55], [mx + w / 2, -60], [mx - w / 2, -60], [mx - w / 2 + 26 * (o.wind ?? 1), -40 - h * .55]]), { fill: o.ghost ? '#fff6e0' : '#f7e3b0', lw: 7, shade: () => fillOnly(rect(mx - w / 2, -40 - h * .62, w + 40, 34), o.ghost ? '#ffe6a0' : '#e0413a', { boil: .3 }) }); }
  pop(); }
function phoneProp(x, y, s, a, caller = 'ସାଙ୍ଗ', o = {}) { push(); translate(x, y); rotate(a); scale(s);
  shape(rr(-90, -170, 180, 340, 30), { fill: '#24212e', lw: 8 }); shape(rr(-76, -150, 152, 300, 18), { fill: o.screen || '#3a2f7a', lw: 5, shade: () => { fillOnly(ell(0, -60, 44, 44, 24), '#33b07a', { boil: .3 }); fillOnly(ell(-40, 100, 28, 28, 16), '#33b07a', { boil: .3 }); fillOnly(ell(40, 100, 28, 28, 16), '#e0413a', { boil: .3 }); } });
  pop(); word(caller, x + Math.sin(a) * 0, y + 36 * s, 54 * s, { fill: '#fff', shadow: false }); }
// the map (top-down, toon): land khaki with ink coasts, the sea turquoise; proj from table metres (coast.json) to screen
function mapDraw(cx, cy, k) { T.screenRect('#4fb3c9'); for (let i = 0; i < 9; i++) stroke([[0, 120 + i * 220], [W, 140 + i * 220]], 3, { line: 'rgba(255,255,255,.35)', boil: .5 });
  for (const r of coast.polys) { let x0 = 1e9, x1 = -1e9; for (const p of r) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); } if ((x1 - x0) * k < 6) continue;
    const pts = r.filter((_, i) => i % 2 === 0).map(([x, z]) => [cx + x * k, cy + z * k]); shape(pts, { fill: '#efd9a0', lw: 5, shade: () => fillOnly(pts.map(([x, y]) => [x + 10, y + 12]), '#e0c37f', { boil: .2 }) }); } }
const mapPt = (lon, lat, cx, cy, k) => [cx + (lon - 100) * 111.32 * Math.cos(7 * Math.PI / 180) / 540 * k, cy - (lat - 7) * 110.57 / 540 * k];

// ——— the 16 key frames ———
const S = [];
S[0] = t => {   // କିଏ କହେ କଟକ — ରାତିରେ ଶୁଏ?  Cuttack asleep: the moon in a nightcap, Bulu snoring in his room
  bands(['#141842', '#1c2257', '#252b6b', '#2f3680'], 0, 1100); stars(70, 40, 900, 1);
  moonFace(790, 400, 125, { eyes: 'closed' });
  for (let i = 0; i < 9; i++) { const x = -40 + i * 140, h = 260 + hash(i) * 200; shape(rect(x, 1100 - h, 130, h + 40), { fill: '#1a1d4a', lw: 6 }); for (let w = 0; w < 3; w++) dot(x + 30 + w * 34, 1100 - h + 50, 7, '#2a2f66'); }
  // Bulu's room (cut-away)
  shape(rr(170, 600, 740, 560, 14), { fill: '#3a3f86', lw: 8, shade: () => { fillOnly(rect(170, 1040, 740, 140), '#2c3070', { boil: .3 }); } });
  shape(rr(590, 650, 230, 200, 10), { fill: '#141842', lw: 7, shade: () => { stars(10, 650, 850, 4); } }); stroke([[705, 650], [705, 850]], 6); stroke([[590, 750], [820, 750]], 6);
  shape(rr(200, 980, 680, 110, 18), { fill: '#7a4a2a', lw: 7 }); shape(rr(210, 880, 190, 100, 34), { fill: '#f7efe2', lw: 6 });
  bulu({ x: 610, y: 912, s: .82, tilt: -Math.PI / 2, eyes: { mode: 'closed' }, mouth: { o: .25, sm: .2 }, t });
  shape(spline([[380, 905], [860, 890], [880, 990], [360, 1000]]), { fill: '#e45d9b', lw: 7, shade: () => { for (let k = 0; k < 9; k++) fillOnly(ell(420 + k * 52, 950, 13, 13, 10), '#ffd23f', { boil: .3 }); } });
  word('Z', 330, 760, 56, { fill: '#cfe3ff', rot: -.2 }); word('Z', 390, 700, 72, { fill: '#cfe3ff', rot: -.2 }); word('Z', 460, 625, 92, { fill: '#cfe3ff', rot: -.2 });
  fillOnly(rect(0, 1180, W, 740), '#11143a', { boil: 0 });
  line(['କିଏ', 'କହେ', 'କଟକ'], 540, 1300, 104, i => ({ fill: i === 2 ? '#ffd23f' : '#fff' }));
  word('ରାତିରେ', 430, 1440, 96, { fill: '#cfe3ff' });
  // ଶୁଏ? lies down on a pillow, asleep
  shape(rr(640, 1392, 230, 70, 30), { fill: '#f7efe2', lw: 6 }); word('ଶୁଏ', 750, 1388, 92, { fill: '#cfe3ff', rot: -.18, sy: .9 }); word('?', 872, 1440, 120, { fill: '#ffd23f', rot: .3 });
};
S[1] = t => {   // ବାଲିଯାତ୍ରା ଆସିଲେ — ନିଦ କାହାକୁ ହୁଏ!  BOOM: the fair's first firework; eyes pop; sleep shatters
  sunburst(705, 760, ['#ff4d6d', '#ff9f1c'], 22);
  shape(rr(170, 600, 740, 560, 14), { fill: '#ffcf6a', lw: 8, shade: () => fillOnly(rect(170, 1040, 740, 140), '#f2b632', { boil: .3 }) });
  shape(rr(590, 650, 230, 200, 10), { fill: '#2b1a5a', lw: 7, shade: () => { burst(705, 750, 90, ['#ffd23f', '#ff4d6d', '#3ec1d3'], 1); } });
  moonFace(990, 300, 90, { eyes: 'pop' });
  shape(rr(220, 960, 560, 110, 18), { fill: '#7a4a2a', lw: 7 });
  shape(spline([[520, 820], [860, 700], [900, 780], [560, 900]]), { fill: '#e45d9b', lw: 7 });   // blanket flying
  bulu({ x: 420, y: 1040, s: .78, eyes: { mode: 'pop' }, hairUp: true, mouth: { o: 1, sm: -.3 }, armL: { h: [-110, -70], bend: 30 }, armR: { h: [110, -80], bend: -30 }, legs: [[-10, -20], [20, -30]], t });
  shatter('ନିଦ', 700, 520, 150, .45, '#cfe3ff');
  fillOnly(rect(0, 1180, W, 740), '#2b1a5a', { boil: 0 });
  line(['ବାଲିଯାତ୍ରା', 'ଆସିଲେ'], 540, 1300, 98, i => ({ fill: i ? '#fff' : '#ffd23f', rot: i ? 0 : -.04, k: i ? 1 : 1.08 }));
  line(['ନିଦ', 'କାହାକୁ', 'ହୁଏ!'], 540, 1440, 92, i => ({ fill: i === 0 ? '#cfe3ff' : '#fff', rot: (i - 1) * .06 }));
};
S[2] = t => {   // ମହାନଦୀ ପଠା — ରଙ୍ଗିନ ଦୋକାନ  The Mahanadi's sandy bed: stalls pop up where Bulu's feet land
  bands(['#2b1a5a', '#43237a', '#6a2c8a', '#9a3a8a'], 0, 760); stars(40, 30, 600, 3);
  fillOnly(rect(0, 760, W, 260), '#2f5fb0', { boil: 0 }); for (let i = 0; i < 12; i++) stroke([[hash(i) * W, 800 + i * 18], [hash(i) * W + 120, 800 + i * 18]], 4, { line: '#7fb0ff' });
  fillOnly(rect(0, 1020, W, 900), '#f2c86e', { boil: 0 }); for (let i = 0; i < 40; i++) dot(hash(i * 3) * W, 1040 + hash(i * 5) * 140, 3, '#d9a94a');
  const cols = ['#e0413a', '#2f74c8', '#33a46a', '#e45d9b', '#f07a2c'];
  for (let i = 0; i < 6; i++) { const x = 90 + i * 170, k = clamp(1.2 - i * .08); stall(x, 1050 - (i % 2) * 18, .62 * k, cols[i % 5], i); if (i > 3) { burst(x, 880, 50, ['#fff', '#ffd23f'], .8); } }
  for (let i = 0; i < 4; i++) shape(ell(200 + i * 90, 1150 - i * 6, 22, 9, 12), { fill: '#d9a94a', lw: 3 });   // footprints in the sand
  bulu({ x: 640, y: 1150, s: .72, eyes: { mode: 'open', look: [.6, 0] }, mouth: { o: .6, sm: 1 }, armL: { h: [-80, 40], bend: 20 }, armR: { h: [90, -60], bend: -20 }, legs: [[-50, -20], [60, -40]], tilt: .12, t });
  word('ମହାନଦୀ', 330, 1300, 100, { fill: '#7fb0ff' }); word('ପଠା', 760, 1300, 100, { fill: '#f2c86e', shadowCol: '#8a5a1c' });
  const L = ['ର', 'ଙ୍ଗି', 'ନ'], fills = ['#e0413a', '#33a46a', '#2f74c8'];
  let x = 220; L.forEach((s, i) => { const w = width(s, 112); word(s, x + w / 2, 1450 - (i % 2) * 18, 112, { fill: fills[i], rot: (i - 1) * .08 }); x += w + 4; });
  word('ଦୋକାନ', 760, 1450, 108, { fill: '#ffd23f', rot: .04 });
};
S[3] = t => {   // କଟକିଆ ହସ — ଗୁଞ୍ଜେ ମଇଦାନ  Killa Maidan: laughter rings ripple across the ground like water
  bands(['#1e2a6a', '#284080', '#30529a'], 0, 700); stars(30, 30, 500, 5);
  // the fort wall with a gate
  shape(rect(-20, 520, 1120, 200), { fill: '#b9a68a', lw: 7, shade: () => { for (let k = 0; k < 8; k++) fillOnly(rect(k * 150, 560, 70, 28), '#a08c70', { boil: .3 }); } });
  for (let k = 0; k < 14; k++) shape(rect(-20 + k * 82, 480, 46, 50), { fill: '#b9a68a', lw: 6 });
  shape([...arc(540, 720, 110, 150, Math.PI, TAU, 16), [650, 720], [430, 720]], { fill: '#3a2a2a', lw: 7 });
  fillOnly(rect(0, 700, W, 1220), '#4f9a4a', { boil: 0 });
  for (let r = 0; r < 5; r++) { const R = 120 + r * 150 + (t * 120) % 150; stroke(ell(540, 960, R * 1.6, R * .45, 70).concat([ell(540, 960, R * 1.6, R * .45, 70)[0]]), 8 - r, { line: `rgba(255,236,160,${.9 - r * .16})` }); }
  for (let i = 0; i < 9; i++) bean(110 + i * 105 + (i % 2) * 20, 880 + (i % 3) * 30, .62, i + 11, { laugh: true });
  bulu({ x: 540, y: 1120, s: .8, eyes: { mode: 'happy' }, mouth: { o: .95, sm: 1.2 }, armL: { h: [-70, 30], fist: true }, armR: { h: [70, -20], bend: -10 }, headTilt: -.15, t });
  word('ହା', 230, 760, 70, { fill: '#ffe9a0', rot: -.2 }); word('ହା', 880, 740, 80, { fill: '#ffe9a0', rot: .2 }); word('ହା', 170, 1050, 60, { fill: '#ffe9a0', rot: .1, alpha: .8 });
  line(['କଟକିଆ', 'ହସ'], 540, 1300, 100, i => ({ fill: i ? '#ffd23f' : '#fff' }));
  for (let e = 3; e >= 0; e--) word('ଗୁଞ୍ଜେ', 320 - e * 34, 1445, 104 * (1 + e * .14), { fill: '#ffe9a0', alpha: e ? .18 + .1 * (3 - e) : 1, shadow: !e, outline: e ? 'rgba(27,20,34,.3)' : INK });
  word('ମଇଦାନ', 760, 1445, 104, { fill: '#a8e68a', sy: .82 });
};
S[4] = t => {   // ରାମଦୋଳି ଚଢ଼ି — ତଳକୁ ଚାହେଁ  ride up the Ramdoli; from the top car, look down
  bands(['#2a1a6a', '#3a2088', '#56289a', '#7a3aa8'], 0, H); stars(50, 20, 1400, 7);
  const cars = ramdoliWheel(540, 880, 470, .62, { skip: 6 });
  const [cx, cy] = [540 + Math.cos(.62 * .4 - Math.PI / 2) * 0, 410];
  stroke([[540, 410], [540, 446]], 5);
  bulu({ x: 540, y: 520, s: .55, eyes: { mode: 'pop', look: [0, 1] }, mouth: { o: .7, sm: .4 }, armL: { h: [-60, 60], fist: true }, armR: { h: [60, 60], fist: true }, headTilt: .25, t });
  shape(rr(470, 440, 140, 96, 18), { fill: '#33a46a', lw: 7 });
  for (let k = 0; k < 6; k++) stroke([[300 + k * 90, 300 - k * 10], [360 + k * 90, 290 - k * 10]], 4, { line: 'rgba(255,255,255,.6)' });   // wind
  // the words ride up the rim, and look down
  const R = 520, txt = ['ରା', 'ମ', 'ଦୋ', 'ଳି'];
  txt.forEach((s, i) => { const a = -Math.PI * .95 + i * .23; word(s, 540 + Math.cos(a) * R, 880 + Math.sin(a) * R, 92, { fill: '#ffd23f', rot: a + Math.PI / 2 }); });
  word('ଚଢ଼ି', 880, 300, 92, { fill: '#fff', rot: .5 });
  fillOnly(rect(0, 1380, W, 540), '#1a1240', { boil: 0 });
  ['ତଳକୁ', 'ଚାହେଁ'].forEach((s, i) => word(s, 540, 1290 + i * 150, 104 - i * 6, { fill: i ? '#cfe3ff' : '#fff', sy: 1 - i * .08 }));
};
S[5] = t => {   // ଆଲୁଅର ନଦୀ — ପଡ଼ିଆରେ ବହେ  from the top: the fair's lanes flow like a river of light
  T.screenRect('#151238');
  fillOnly(spline([[700, -50], [1200, -50], [1200, 1950], [860, 1950], [820, 1400], [900, 900], [780, 400]]), '#1f3d8a', { boil: .5 });   // the Mahanadi
  for (let i = 0; i < 14; i++) lampBoat(880 + hash(i) * 180 - (i * 30 % 120), 120 + i * 130, .45, t, i);
  // stall roofs from above
  for (let r = 0; r < 6; r++) for (let k = 0; k < 4; k++) { const x = 70 + k * 160 + (r % 2) * 30, y = 120 + r * 230; shape(rr(x, y, 110, 120, 10), { fill: ['#e0413a', '#2f74c8', '#33a46a', '#e45d9b', '#f07a2c'][(r + k) % 5], lw: 6, shade: () => { for (let j = 0; j < 4; j++) fillOnly(rect(x + j * 30, y, 14, 120), 'rgba(255,255,255,.55)', { boil: .2 }); } }); }
  // the lanes: streams of light dots flowing
  for (let r = 0; r < 6; r++) for (let j = 0; j < 40; j++) { const u = ((j / 40 + t * .25) % 1), y = 225 + r * 230 + Math.sin(u * 9 + r) * 14, x = 20 + u * 660; dot(x, y, 5 + hash(j + r) * 4, ['#ffd23f', '#fff6c8', '#ff9f1c'][j % 3]); }
  // Bulu's feet dangling at the top (POV)
  for (const sx of [-1, 1]) { shape(noodle([540 + sx * 40, -40], [540 + sx * 50, 90], 0, 50, 42), { fill: C.jeans, lw: 7 }); shape(ell(540 + sx * 50, 110, 40, 30, 18), { fill: '#7a4a2a', lw: 6 }); }
  fillOnly(rect(0, 1250, 760, 260), 'rgba(21,18,56,.0)', { boil: 0 });
  // letters made of the flowing light, along a curve
  const A = 'ଆଲୁଅର'; word(A, 300, 1290, 104, { fill: '#ffd23f', rot: -.06 }); word('ନଦୀ', 640, 1270, 104, { fill: '#7fb0ff', rot: .06 });
  ['ପଡ଼ିଆରେ', 'ବହେ'].forEach((s, i) => word(s, 280 + i * 380, 1440 + Math.sin(t * 3 + i) * 18, 98, { fill: '#fff', rot: Math.sin(i * 2) * .06 }));
};
S[6] = t => {   // ଦହିବରା ଆଳୁଦମ — ଠୁଙ୍କାପୁରୀ ଥାଳି  the food orbits his head; heart eyes
  sunburst(540, 620, ['#ffd23f', '#ffb627'], 26);
  // dahibara-aludum in a sal-leaf khali (left halo), thunka puri thali (right halo)
  push(); translate(270, 470); scale(1.45); shape(ell(0, 0, 150, 60, 40), { fill: '#6e8a34', lw: 7 }); shape(ell(0, -12, 128, 44, 40), { fill: '#f3e6c4', lw: 6, shade: () => { for (let k = 0; k < 3; k++) shape(ell(-60 + k * 60, -14, 42, 18, 20), { fill: '#c68a3a', lw: 5 }); fillOnly(ell(10, -26, 46, 16, 20), '#9a3a12', { boil: .3 }); for (let k = 0; k < 14; k++) stroke([[-70 + hash(k) * 140, -30 + hash(k + 3) * 22], [-60 + hash(k) * 140, -36 + hash(k + 3) * 22]], 3, { line: '#e8a830' }); } }); pop();
  push(); translate(810, 470); scale(1.3); shape(ell(0, 30, 170, 56, 40), { fill: '#d8dde4', lw: 7, shade: () => fillOnly(ell(0, 30, 140, 40, 30), '#eef1f4', { boil: .3 }) }); shape(spline([[-110, 20], [-100, -70], [0, -110], [100, -70], [110, 20], [0, 40]]), { fill: '#e8a43a', lw: 7, shade: () => { fillOnly(ell(-30, -60, 40, 24, 16), '#f6cf7a', { boil: .3 }); for (let k = 0; k < 9; k++) dot(-70 + hash(k) * 140, -60 + hash(k + 2) * 70, 6, '#b8701e'); } }); shape(ell(120, 10, 46, 22, 20), { fill: '#d8dde4', lw: 6, shade: () => fillOnly(ell(120, 6, 36, 14, 16), '#e08a2a', { boil: .3 }) }); pop();
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + t; push(); translate(540 + Math.cos(a) * 330, 520 + Math.sin(a) * 120); shape(ell(0, 0, 26, 22, 14), { fill: '#e8b060', lw: 5 }); pop(); }   // gupchup orbiting
  bulu({ x: 540, y: 1190, s: 1.05, eyes: { mode: 'heart' }, mouth: { o: .95, sm: .9 }, armL: { h: [-80, -40], bend: 20 }, armR: { h: [80, -40], bend: -20 }, t });
  fillOnly(rect(0, 1190, W, 730), '#c84a1a', { boil: 0 });
  word('ଦହିବରା', 320, 1300, 104, { fill: '#f7efe2' }); word('ଆଳୁଦମ', 780, 1300, 98, { fill: '#e08a2a' });
  word('ଠୁଙ୍କାପୁରୀ', 380, 1445, 112, { fill: '#ffcf5a', sy: 1.12 }); word('ଥାଳି', 820, 1445, 104, { fill: '#e8ebef' });
};
S[7] = t => {   // ଖାଇଖାଇ ଭୁଲିଗଲୁ — ପକେଟ୍ ହେଲା ଖାଲି!  food coma; the pocket comes out empty
  bands(['#3a2a7a', '#4a2f8a', '#5a3a9a'], 0, 1200);
  for (let k = 0; k < 5; k++) { const a = t * 3 + k / 5 * TAU; word('★', 540 + Math.cos(a) * 160, 300 + Math.sin(a) * 40, 50, { fill: '#ffd23f', shadow: false }); }
  bulu({ x: 540, y: 1150, s: 1.0, eyes: { mode: 'spiral' }, belly: 1, mouth: { o: .35, sm: .6, drool: true }, armL: { h: [-60, 70], bend: -10 }, armR: { h: [150, 20], bend: -30 }, headTilt: .2, t });
  // the pocket pulled out, empty; a moth flies out
  shape(spline([[700, 990], [800, 960], [830, 1040], [760, 1080], [690, 1050]]), { fill: '#f7efe2', lw: 6 });
  push(); translate(880, 880); shape(ell(0, 0, 10, 16, 12), { fill: '#a89880', lw: 4 }); for (const s of [-1, 1]) shape(ell(s * 26, -6, 24, 16, 14), { fill: '#d8c8a8', lw: 4 }); pop();
  fillOnly(rect(0, 1200, W, 720), '#241a50', { boil: 0 });
  ['ଖାଇ', 'ଖାଇ', 'ଭୁଲିଗଲୁ'].forEach((s, i) => word(s, [230, 420, 740][i], 1300 + Math.sin(i * 2 + t * 6) * 16, 96, { fill: '#fff', rot: Math.sin(i * 3 + t * 5) * .14 }));
  line(['ପକେଟ୍', 'ହେଲା'], 400, 1440, 92, () => ({ fill: '#cfe3ff' }));
  ['ଖା', 'ଲି'].forEach((s, i) => word(s, 800 + i * 90, 1440 + i * 110, 104, { fill: '#ffd23f', rot: i * .7 }));
};
S[8] = t => {   // ସାଙ୍ଗଟା ହଜିଲା — ଫୋନ୍‌ଟା ବାଜିଲା  the friend's empty dotted outline; the phone buzzes
  T.screenRect('#2a1f5a'); for (let i = 0; i < 22; i++) { const a = i * .75 + t, r = 140 + i * 18; bean(540 + Math.cos(a) * r, 760 + Math.sin(a) * r * .45, .62 + i * .008, i, { eyes: 'open' }); }
  bulu({ x: 330, y: 1150, s: .9, eyes: { mode: 'open', look: [-.8, 0] }, mouth: { o: .3, sm: -.6 }, armR: { h: [120, -60], bend: -20, fist: true }, sweat: true, t });
  // Tuku's missing outline, dotted
  g.save(); g.setLineDash([14, 14]); push(); translate(720, 1150); scale(.9); stroke(spline([[0, -236], [62, -220], [86, -150], [70, -86], [0, -76], [-70, -86], [-86, -150], [-62, -220]]).concat([[0, -236]]), 6, { line: '#cfe3ff' }); stroke(ell(0, -306, 82, 78, 40).concat([[82, -306]]), 6, { line: '#cfe3ff' }); pop(); g.restore();
  word('?', 720, 760, 130, { fill: '#cfe3ff' });
  phoneProp(470, 880, .9, -.25 + Math.sin(t * 60) * .05);
  for (let k = 0; k < 3; k++) { stroke(arc(470, 880, 150 + k * 30, 150 + k * 30, -2.4, -1.6, 8), 6, { line: '#ffd23f' }); stroke(arc(470, 880, 150 + k * 30, 150 + k * 30, -.6, .2, 8), 6, { line: '#ffd23f' }); }
  fillOnly(rect(0, 1200, W, 720), '#1a1340', { boil: 0 });
  word('ସାଙ୍ଗଟା', 330, 1300, 100, { fill: '#fff' });
  g.save(); g.setLineDash([10, 10]); g.font = '800 100px "Bhaina"'; g.textAlign = 'center'; g.lineWidth = 6; g.strokeStyle = '#cfe3ff'; g.strokeText('ହଜିଲା', 760, 1300); g.restore();
  for (const dx of [-6, 6]) word('ବାଜିଲା', 720 + dx, 1445, 100, { fill: dx < 0 ? '#ff4d6d' : '#3ec1d3', shadow: false, alpha: .5 });
  word('ଫୋନ୍‌ଟା', 300, 1445, 100, { fill: '#fff' }); word('ବାଜିଲା', 720, 1445, 100, { fill: '#ffd23f' });
};
S[9] = t => {   // ପୁଣି ମିଳିଗଲା — ମେଳାଟା ଜମିଲା!  Tuku bursts out of the phone; the two halves of the word hug; the fair goes wild
  sunburst(540, 700, ['#ff4d6d', '#ff7aa2'], 24); burst(220, 260, 110, ['#ffd23f', '#fff', '#3ec1d3'], 1); burst(860, 340, 90, ['#7bd389', '#fff', '#ffd23f'], 1); confetti(80, 3, 0, 1150);
  phoneProp(540, 1020, .8, 0, '');
  bulu({ x: 280, y: 1180, s: .85, eyes: { mode: 'happy' }, mouth: { o: .9, sm: 1.2 }, armR: { h: [120, -90], bend: -30 }, armL: { h: [-60, -80], bend: 20 }, t });
  tuku({ x: 640, y: 930, s: .95, sq: 1.06, eyes: { mode: 'happy' }, mouth: { o: .9, sm: 1.2 }, armL: { h: [-110, -50], bend: 20 }, armR: { h: [90, -110], bend: -20 }, tilt: -.15, t });
  fillOnly(rect(0, 1200, W, 720), '#a8235a', { boil: 0 });
  word('ପୁଣି', 220, 1300, 100, { fill: '#fff' }); word('ମିଳି', 520, 1300, 104, { fill: '#ffd23f', rot: .06 }); word('ଗଲା', 735, 1300, 104, { fill: '#3ec1d3', rot: -.06 });
  word('✦', 628, 1230, 56, { fill: '#fff', shadow: false });
  line(['ମେଳାଟା', 'ଜମିଲା!'], 540, 1445, 110, i => ({ fill: i ? '#7bd389' : '#fff', dy: i ? -14 : 0, rot: i ? -.05 : .03 }));
};
S[10] = t => {   // ଡଙ୍ଗା ଭସା ଭୋର — ତଅପୋଇର ଗୀତ  dawn: boats of light set afloat; Taapoi sings
  bands(['#ffc8a8', '#ffb3b8', '#e6b3d6', '#c8b8e8'], 0, 760);
  shape([...arc(540, 760, 150, 150, Math.PI, TAU, 20)], { fill: '#fff1c8', lw: 7 });
  fillOnly(rect(0, 760, W, 400), '#8fb8d8', { boil: 0 }); for (let i = 0; i < 10; i++) stroke([[540 - 120 + i * 8, 790 + i * 30], [540 + 120 - i * 8, 790 + i * 30]], 5, { line: '#fff1c8' });
  for (let i = 0; i < 7; i++) lampBoat(150 + i * 130, 880 + (i % 3) * 70, .7 - (i % 3) * .1, t, i);
  for (let s = 0; s < 3; s++) fillOnly(rect(0, 1100 + s * 30, W, 30), ['#d8c098', '#c8b088', '#b8a078'][s], { boil: .3 });
  bean(160, 1130, .7, 41, { eyes: 'happy' }); bean(900, 1140, .72, 44, { eyes: 'happy' });
  taapoi({ x: 560, y: 1150, s: 1.15, eyesMode: 'closed', mouth: { o: .5, sm: .7 }, armL: { h: [20, -30], bend: -10 }, armR: { h: [-20, -30], bend: 10 } });
  for (let k = 0; k < 5; k++) word('♪', 640 + k * 70, 940 - k * 50 + Math.sin(t * 4 + k) * 12, 54, { fill: '#e2392f', shadow: false });
  bulu({ x: 330, y: 1150, s: .62, eyes: { mode: 'open', lid: .55 }, mouth: { o: .1, sm: .3 }, t }); tuku({ x: 800, y: 1150, s: .62, eyes: { mode: 'open', lid: .6 }, mouth: { o: .1, sm: .3 }, t });
  fillOnly(rect(0, 1190, W, 730), '#a8907a', { boil: 0 });
  ['ଡଙ୍ଗା', 'ଭସା', 'ଭୋର'].forEach((s, i) => word(s, 230 + i * 300, 1300 + Math.sin(t * 2 + i) * 10, 100, { fill: '#fff6e8', rot: Math.sin(t * 2 + i) * .05 }));
  word('ତଅପୋଇର', 360, 1445, 100, { fill: '#e2392f' }); word('ଗୀତ', 760, 1445, 104, { fill: '#ffd23f' });
};
S[11] = t => {   // ବାଲିଯାତ୍ରା ରାତି — ଜୀଅନ୍ତା ଅତୀତ  night again: the little boat's reflection is the great swan boita, rising
  bands(['#0f1036', '#171a4a', '#20255e'], 0, 700); stars(60, 20, 650, 9);
  fillOnly(rect(0, 700, W, 520), '#152a5e', { boil: 0 });
    g.save(); g.globalAlpha = .82; swanBoita(560, 640, 1.0, { ghost: true }); g.restore(); for (let k = 0; k < 6; k++) stroke(ell(540, 740, 120 + k * 70, 18 + k * 9, 40).concat([[660 + k * 70, 740]]), 4, { line: `rgba(255,230,160,${.6 - k * .09})` });
  for (let i = 0; i < 16; i++) stroke([[hash(i) * W, 780 + i * 26], [hash(i) * W + 160, 780 + i * 26]], 4, { line: 'rgba(255,230,160,.5)' }); lampBoat(540, 745, 1.15, t, 3);
  for (let k = 0; k < 5; k++) { push(); translate(380 + k * 70, 1020 - (k % 2) * 20); g.globalAlpha = .55; shape(ell(0, 0, 18, 30, 12), { fill: '#ffe6a0', lw: 4 }); shape(ell(0, -44, 14, 14, 10), { fill: '#ffe6a0', lw: 4 }); g.globalAlpha = 1; pop(); }   // ghostly sadhabas
  fillOnly(rect(0, 1220, W, 700), '#0f1036', { boil: 0 });
  word('ବାଲିଯାତ୍ରା', 330, 1310, 100, { fill: '#ffd23f' }); word('ରାତି', 780, 1310, 100, { fill: '#cfe3ff' });
  for (const a of [.25, .5]) { word('ଜୀଅନ୍ତା', 330, 1450, 104 * (1 + a * .15), { fill: '#ffe6a0', alpha: .25, shadow: false }); word('ଅତୀତ', 770, 1450, 104 * (1 + a * .15), { fill: '#ffe6a0', alpha: .25, shadow: false }); }
  word('ଜୀଅନ୍ତା', 330, 1450, 104, { fill: '#fff3d0' }); word('ଅତୀତ', 770, 1450, 104, { fill: '#fff3d0' });
};
S[12] = t => {   // ଦିନେ ବୋଇତ ଗଲା — ଦୂର ବାଲି ଦେଶ  the boita races across the map from Odisha to Bali (production: a 3D ship on this 2.5D map)
  const k = 150, cx = 520, cy = 640; mapDraw(cx, cy, k);
  const path = [[86.7, 20], [89, 15], [92, 11], [95, 7], [99, 4], [103, 1.2], [107, -3], [111, -5.8], [115.1, -8]].map(([a, b]) => mapPt(a, b, cx, cy, k));
  g.save(); g.setLineDash([18, 14]); stroke(path, 7, { line: '#fff' }); g.restore();
  const B = mapPt(115.1, -8.4, cx, cy, k); shape(ell(B[0], B[1], 60, 30, 20), { fill: '#7bd389', lw: 6 }); word('ବାଲି', B[0] - 20, B[1] - 50, 70, { fill: '#7bd389' });
  const O = mapPt(85.9, 20.4, cx, cy, k); dot(O[0], O[1], 14, '#e0413a'); word('କଟକ', O[0] + 40, O[1] - 26, 56, { fill: '#fff' });
  const p = path[5]; for (let i = 0; i < 9; i++) stroke([[p[0] - 330 + i * 4, p[1] - 220 + i * 26], [p[0] - 120, p[1] - 100 + i * 12]], 6, { line: 'rgba(255,255,255,.85)' });
  swanBoita(p[0], p[1], .38, { wind: 1.6 });
  fillOnly(rect(0, 1210, W, 710), '#1f5f8a', { boil: 0 });
  line(['ଦିନେ', 'ବୋଇତ', 'ଗଲା'], 540, 1310, 100, i => ({ fill: i === 1 ? '#ffd23f' : '#fff' }));
  ['ଦୂର', 'ବାଲି', 'ଦେଶ'].forEach((s, i) => word(s, 250 + i * 290, 1450 - i * 6, 104 - i * 10, { fill: i === 1 ? '#7bd389' : '#e8f6ff', alpha: 1 - i * .12, rot: -.05 }));
};
S[13] = t => {   // ଆଜି କଟକ ସାଜିଛି — ରଙ୍ଗିନ ନୂଆ ବେଶ  Cuttack dresses up: the buildings wear garlands of lights
  sunburst(540, 900, ['#3a1f7a', '#46258a'], 28); burst(200, 230, 100, ['#ffd23f', '#ff4d6d', '#fff'], 1); burst(880, 300, 80, ['#3ec1d3', '#fff', '#7bd389'], 1);
  const B = [[60, 520, 170, '#f5c2b0'], [240, 420, 180, '#a9cbe8'], [430, 300, 210, '#f7df8f'], [650, 450, 170, '#b5dccb'], [830, 380, 200, '#e9c9e6']];
  for (const [x, y, w, c] of B) { shape(rect(x, y, w, 1160 - y), { fill: c, lw: 7, shade: () => { for (let r = 0; r < 4; r++) for (let q = 0; q < 2; q++) fillOnly(rect(x + 30 + q * (w - 90), y + 60 + r * 120, 40, 60), '#ffd27a', { boil: .3 }); } });
    eyePair(x + w / 2, y + 120, 18, 20, 30, { mode: 'happy' }); mouth(x + w / 2, y + 170, 40, { o: .5, sm: 1 });
    for (let j = 0; j < 12; j++) { const u = j / 11, xx = x + u * w, yy = y + 30 + Math.sin(u * Math.PI) * 40; dot(xx, yy, 8, ['#ffd23f', '#ff4d6d', '#3ec1d3', '#7bd389'][j % 4]); } }
  shape(spline([[430, 300], [535, 160], [640, 300]]), { fill: '#e0413a', lw: 7 });   // a temple-spire crown on the middle building
  bulu({ x: 540, y: 1180, s: .7, eyes: { mode: 'happy' }, mouth: { o: .6, sm: 1 }, armR: { h: [80, -90], bend: -20 }, t });
  fillOnly(rect(0, 1190, W, 730), '#2a1a6a', { boil: 0 });
  line(['ଆଜି', 'କଟକ', 'ସାଜିଛି'], 540, 1310, 100, i => ({ fill: i === 1 ? '#ffd23f' : '#fff' }));
  const ws = ['ରଙ୍ଗିନ', 'ନୂଆ', 'ବେଶ']; const W2 = line(ws, 540, 1450, 104, i => ({ fill: ['#ff7aa2', '#7bd389', '#3ec1d3'][i] }));
  for (let j = 0; j < 30; j++) dot(540 - W2 / 2 + j * W2 / 29, 1380 + Math.sin(j * .9) * 10, 7, ['#ffd23f', '#ff4d6d', '#fff'][j % 3]);
};
S[14] = t => {   // ଏସିଆର ବଡ଼ ମେଳା — କଟକର ଶାନ୍  the map of Asia; a crown lands on Cuttack
  const k = 70, cx = 540, cy = 560; mapDraw(cx, cy, k);
  const O = mapPt(85.9, 20.4, cx, cy, k);
  for (let r = 0; r < 4; r++) stroke(ell(O[0], O[1], 40 + r * 40, 18 + r * 18, 40).concat([[O[0] + 40 + r * 40, O[1]]]), 6, { line: `rgba(255,214,90,${.9 - r * .2})` });
  push(); translate(O[0], O[1] - 120); shape([[-90, 40], [-100, -50], [-45, 0], [0, -70], [45, 0], [100, -50], [90, 40]], { fill: '#ffd23f', lw: 8, shade: () => { dot(0, 10, 12, '#e0413a'); dot(-50, 20, 9, '#3ec1d3'); dot(50, 20, 9, '#3ec1d3'); } }); pop();
  bulu({ x: O[0] - 60, y: O[1] + 30, s: .3, eyes: { mode: 'happy' }, mouth: { o: .4, sm: 1 }, armR: { h: [60, -80] }, t }); tuku({ x: O[0] + 60, y: O[1] + 30, s: .3, eyes: { mode: 'happy' }, armL: { h: [-60, -80] }, t });
  fillOnly(rect(0, 1210, W, 710), '#1f5f8a', { boil: 0 });
  word('ଏସିଆର', 230, 1320, 96, { fill: '#fff' }); word('ବଡ଼', 540, 1340, 170, { fill: '#ffd23f' }); word('ମେଳା', 860, 1320, 96, { fill: '#fff' });
  word('କଟକର', 380, 1460, 100, { fill: '#e8f6ff' }); word('ଶାନ୍', 760, 1460, 108, { fill: '#ffd23f' });
  push(); translate(760, 1350); scale(.42); shape([[-90, 40], [-100, -50], [-45, 0], [0, -70], [45, 0], [100, -50], [90, 40]], { fill: '#ffd23f', lw: 8 }); pop();
};
S[15] = t => {   // ବାଲିଯାତ୍ରା! ବାଲିଯାତ୍ରା! — ଓଡ଼ିଶାର ପ୍ରାଣ!  everyone dances; the Ramdoli beats as a heart
  sunburst(540, 620, ['#ff4d6d', '#ff2e63'], 24);
  const bt = 1 + .07 * Math.pow(Math.max(0, Math.cos(t * TAU * 1.91)), 8);
  const HT = (s0) => { const P = []; for (let k = 0; k < 80; k++) { const a = k / 80 * TAU; P.push([s0 * 16 * Math.sin(a) ** 3, -s0 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))]); } return P; };
  push(); translate(540, 600); scale(bt); shape(HT(24), { fill: '#ffd23f', lw: 9, shade: () => { fillOnly(HT(19), '#ff9f1c', { boil: .3 }); } }); for (const p of HT(24).filter((_, k) => k % 2 === 0)) dot(p[0], p[1], 11, ['#fff', '#ff4d6d', '#3ec1d3'][Math.floor(hash(p[0]) * 3)]); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; stroke([[0, -20], [Math.cos(a) * 200, -20 + Math.sin(a) * 170]], 5); } pop();
  moonFace(900, 200, 70, { eyes: 'happy' });
  for (let i = 0; i < 7; i++) bean(80 + i * 160, 1150 + (i % 2) * 10, .55, i + 60, { laugh: true });
  bulu({ x: 330, y: 1170, s: .72, eyes: { mode: 'happy' }, mouth: { o: .9, sm: 1.2 }, armL: { h: [-90, -110], bend: 20 }, armR: { h: [90, -110], bend: -20 }, legs: [[-30, -10], [20, 0]], t });
  tuku({ x: 760, y: 1170, s: .72, eyes: { mode: 'happy' }, mouth: { o: .9, sm: 1.2 }, armL: { h: [-90, -100], bend: 20 }, armR: { h: [90, -100], bend: -20 }, t });
  taapoi({ x: 545, y: 1170, s: .8, eyesMode: 'happy', mouth: { o: .7, sm: 1 }, armL: { h: [-30, -60] }, armR: { h: [30, -60] } });
  fillOnly(rect(0, 1190, W, 730), '#7a1240', { boil: 0 });
  line(['ବାଲିଯାତ୍ରା!', 'ବାଲିଯାତ୍ରା!'], 540, 1310, 94, i => ({ fill: '#ffd23f', rot: i ? .05 : -.05, dy: i ? -10 : 8 }));
  word('ଓଡ଼ିଶାର', 340, 1460, 100, { fill: '#fff' });
  push(); translate(760, 1428); scale(bt); shape(HT(7.4), { fill: '#ff2e63', lw: 7 }); pop();
  word('ପ୍ରାଣ!', 760, 1460, 100, { fill: '#fff' });
};
function groundTex(i) { for (let k = 0; k < 26; k++) { const x = hash(k * 3.3 + i) * W, y = 1490 + hash(k * 5.1 + i) * 400; stroke([[x, y], [x + 30 + hash(k) * 40, y + 4]], 4, { line: 'rgba(255,255,255,.08)' }); } }
window.render = tt => { T.frame(tt); const i = +(QS.get('i') ?? 0); S[i](tt); groundTex(i); };
window.DUR = 1; window.render(+(QS.get('t') ?? .4)); window.READY = true;
