// Storyboard frames. Each is one moment of the film, rendered with the film's own media and caption system.
import { floor, jhoti, padaOutline, padaSolid, lotus, lata, rowDots, flute, feather, seat, house, temple, hand, inlay, S, D, bez, chain, circle, xf } from './jhoti.js';
import { saree, ghagra } from './loom.js';
const W = 1080, H = 1920, A = () => window.ASSETS;
const PL = {}; export function setPlates(p) { Object.assign(PL, p); }

// ---------- captions: one system, four looks. Never over the picture: they sit in the clear band at y ≈ 1390–1470 ----------
const LOOK = {
  dark: { col: '#f3e7cf', halo: 'rgba(20,8,4,.85)' },      // watercolour night (sanctum)
  light: { col: '#2b2019', halo: 'rgba(246,238,222,.95)' }, // watercolour day
  paste: { col: '#f3ebdc', halo: 'rgba(60,18,8,.9)' },     // jhoti: the caption is the colour of the paste
  loom: { col: '#f3e7cf', halo: 'rgba(15,6,4,.9)' },
};
export function cap(c, lines, look = 'paste', y = 1412, o = {}) {
  const L = LOOK[look]; c.save(); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  lines.forEach((ln, i) => {
    const yy = y + i * 54; c.font = `italic 500 ${o.size || 46}px "CormorantG"`;
    c.shadowColor = L.halo; c.shadowBlur = 18; c.fillStyle = L.col; c.fillText(ln, o.x || 500, yy); c.shadowBlur = 0; c.fillText(ln, o.x || 500, yy);
  });
  c.restore();
}
function odia(c, txt, x, y, size, col, o = {}) { c.save(); c.font = `${o.w || 600} ${size}px "OdiaSerif"`; c.textAlign = o.align || 'center'; c.fillStyle = col; if (o.halo) { c.shadowColor = o.halo; c.shadowBlur = 16; } c.fillText(txt, x, y); c.restore(); }
function plate(c, img) { c.drawImage(img, 0, 0, W, H); }
function tint(c, col, a) { c.save(); c.globalAlpha = a; c.fillStyle = col; c.fillRect(0, 0, W, H); c.restore(); }
function vignette(c, a = .5, r0 = 300, r1 = 1300, cx = 540, cy = 860) { const g = c.createRadialGradient(cx, cy, r0, cx, cy, r1); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(8,3,2,${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function flame(c, x, y, s = 1) {
  c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(x, y - 10 * s, 2, x, y - 10 * s, 200 * s); g.addColorStop(0, 'rgba(255,200,120,.55)'); g.addColorStop(1, 'rgba(255,140,60,0)'); c.fillStyle = g; c.fillRect(x - 220 * s, y - 230 * s, 440 * s, 440 * s);
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = '#ffd98a'; c.beginPath(); c.moveTo(x, y - 46 * s); c.bezierCurveTo(x + 14 * s, y - 24 * s, x + 12 * s, y - 4 * s, x, y); c.bezierCurveTo(x - 12 * s, y - 4 * s, x - 14 * s, y - 24 * s, x, y - 46 * s); c.fill();
  c.fillStyle = '#fff6dc'; c.beginPath(); c.ellipse(x, y - 10 * s, 4 * s, 9 * s, 0, 0, 7); c.fill();
  c.fillStyle = '#7a4a1e'; c.beginPath(); c.moveTo(x - 30 * s, y + 4 * s); c.quadraticCurveTo(x, y + 26 * s, x + 30 * s, y + 4 * s); c.closePath(); c.fill();   // the clay diya
  c.restore();
}
function goldFlute(c, x, y, len, rot) {   // the one real object that enters the drawing: a gold flute
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = 'rgba(30,8,2,.45)'; c.filter = 'blur(6px)'; c.fillRect(6, 10, len, 20); c.filter = 'none';
  const g = c.createLinearGradient(0, -12, 0, 12); g.addColorStop(0, '#fff1b8'); g.addColorStop(.35, '#e8b83e'); g.addColorStop(.7, '#a8761c'); g.addColorStop(1, '#6e4a10');
  c.fillStyle = g; c.beginPath(); c.roundRect(0, -11, len, 22, 11); c.fill();
  for (let i = 0; i < 7; i++) { c.fillStyle = '#3a2408'; c.beginPath(); c.ellipse(len * .38 + i * len * .075, -2, 4, 3, 0, 0, 7); c.fill(); }
  for (const xx of [len * .06, len * .94]) { c.fillStyle = '#c8321e'; c.fillRect(xx - 6, -11, 12, 22); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(xx - 6, -9, 12, 4); }
  c.restore();
}
const pada = (x, y, s, rot, m, col) => ({ x, y, s, rot, m, col });
function padas(c, list, extra = []) {   // footprints: the coloured inlay first, then the paste outlines over them (one jhoti pass)
  for (const p of list) if (p.col) inlay(c, p.x, p.y, p.s, p.rot, p.m, p.col, .85);
  jhoti(c, [{ strokes: list.flatMap(p => padaOutline(p.x, p.y, p.s, p.rot, p.m, { inner: !p.col })) }, ...extra]);
}
const hh = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const STARS = n => Array.from({ length: n }, (_, i) => D(70 + hh(i) * 940, 280 + hh(i + 50) * 330, 2.2 + hh(i + 99) * 2.4));
const BLUE = '#2c4f8f', ALTA = '#c32a1a';

export const FRAMES = {
  // S1 0.0–6.4 · watercolour · the hem rests on the pedestal; the fringe of the year's days; one thread is alta red
  1: c => { plate(c, PL.hook); odia(c, '୩୬୪ ଦିନ', 500, 380, 64, '#efe0c0', { halo: 'rgba(0,0,0,.6)' }); cap(c, ['Once a year, Radharani’s feet are seen.', 'Why not the other days?'], 'dark'); },
  // S2 6.98–12.1 · watercolour · Aonla Navami: the thread wound round the amla tree
  2: c => { plate(c, PL.amla); cap(c, ['Aonla Navami, when Odia homes', 'worship the amla tree.'], 'light'); },
  // S3 12.35–16.0 · watercolour · the thread runs to Sakshigopal: the line of two lakh people
  3: c => { plate(c, PL.queue); c.save(); c.font = '600 54px "Cinzel"'; c.fillStyle = '#5a1a10'; c.textAlign = 'center'; c.shadowColor = 'rgba(250,240,225,.9)'; c.shadowBlur = 14; c.fillText('2,00,000+', 300, 1060); c.restore(); cap(c, ['That day, over two lakh people', 'line up at Sakshigopal.'], 'light'); },
  // S4 16.6–21.9 · jhoti · the legend is drawn on the floor: Gopinath's sign and feet; beside him an empty seat
  4: c => { floor(c);
    const ps = [pada(285, 900, 1.15, -.06, -1, BLUE), pada(365, 905, 1.15, .22, 1, BLUE)];
    padas(c, ps, [{ strokes: [...feather(250, 690, .9, -.25), ...flute(150, 640, 300, -.12)] }, { strokes: seat(320, 1010) }, { strokes: seat(760, 1010) }, { strokes: [...lata(80, 1000, 320, 14, 64), ...lata(80, 1000, 1260, 14, 64)] }, { strokes: rowDots(660, 860, 900, 28, 3.2), a: .45 }]);
    cap(c, ['Long ago, Radha was not in this temple.', 'Only Gopinath.']); },
  // S5 22.5–26.6 · jhoti · Lakshmi's small red feet come every day; the days counted as suns along the top
  5: c => { floor(c);
    const ps = []; for (let d = 0; d < 4; d++) for (const m of [-1, 1]) ps.push(pada(470 + m * 52 + d * 6, 1150 - d * 70, .82, m * .05, m, d === 0 ? ALTA : null));
    for (const p of ps) if (!p.col) p.col = 'rgba(195,42,26,.35)';
    padas(c, ps, [{ strokes: seat(500, 640, 300) }, { strokes: [...feather(470, 560, .55, -.2), ...flute(400, 520, 180, -.12, 5)] }, { strokes: Array.from({ length: 11 }, (_, i) => [...circle(140 + i * 76, 330, 14).length ? [S(circle(140 + i * 76, 330, 13), 5, { taper: .05 })] : [], ...Array.from({ length: 8 }, (_, k) => S([[140 + i * 76 + Math.cos(k * .785) * 19, 330 + Math.sin(k * .785) * 19], [140 + i * 76 + Math.cos(k * .785) * 27, 330 + Math.sin(k * .785) * 27]], 4, { taper: .3 }))]).flat() }]);
    cap(c, ['Lakshmi, the priest’s daughter,', 'came every day to gaze at him.']); },
  // S6 27.2–30.8 · jhoti at night · blue footprints leave the temple and walk the lane to her lamp-lit door
  6: c => { floor(c, '#5a2416', .3); tint(c, '#0d1630', .55);
    const path = bez([300, 760], [200, 1000], [760, 900], [700, 1170], 9), ps = [];
    path.forEach(([x, y], i) => { if (i === 0) return; const [px, py] = path[i - 1], a = Math.atan2(y - py, x - px) + Math.PI / 2; ps.push(pada(x + Math.cos(a) * (i % 2 ? 18 : -18), y + Math.sin(a) * (i % 2 ? 18 : -18), .48, a, i % 2 ? 1 : -1, BLUE)); });
    padas(c, ps, [{ strokes: temple(270, 700, .8) }, { strokes: house(720, 1260, 300, 150) }, { strokes: [...circle(880, 360, 46).slice(0, 34).length ? [S(chain(bez([900, 318], [850, 330], [840, 400], [890, 408]), bez([890, 408], [860, 390], [866, 340], [900, 318])), 6, { taper: .1 })] : []] }, { strokes: STARS(26) }]);
    flame(c, 720, 1250, .9); vignette(c, .55, 200, 1200, 600, 1000);
    cap(c, ['At night, it’s said, Gopinath himself', 'walked to her house.']); },
  // S7 31.3–33.5 · jhoti at dawn · his golden flute left at her threshold, beside the two sets of footprints
  7: c => { floor(c, '#a24326', 1.2);
    const ps = [pada(400, 1130, .9, -.1, -1, ALTA), pada(480, 1135, .9, .1, 1, ALTA), pada(640, 1080, .9, -.5, -1, BLUE), pada(712, 1040, .9, -.4, 1, BLUE)];
    padas(c, ps, [{ strokes: [...lotus(540, 620, 120), ...rowDots(120, 960, 840, 26, 5), ...lata(100, 980, 880, 12, 56)] }]);
    goldFlute(c, 300, 960, 460, -.06);
    const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(255,214,150,.18)'); g.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    cap(c, ['One morning, his golden flute', 'was found there.']); },
  // S8 34.1–37.1 · jhoti · the village's heavy feet crowd the threshold, smudging the drawing; pointing hands' shadows
  8: c => { floor(c, '#8e3620', .7);
    const ps = [pada(500, 1000, .7, -.1, -1, ALTA), pada(560, 1003, .7, .1, 1, ALTA)];
    const ring = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = 330 + (i % 3) * 40; ring.push(pada(530 + Math.cos(a) * r * 1.05, 920 + Math.sin(a) * r * .9, 1.15, a - Math.PI / 2, i % 2 ? 1 : -1, null)); }
    padas(c, ps, [{ strokes: ring.flatMap(p => padaSolid(p.x, p.y, p.s, p.rot + Math.PI, p.m)), col: '#cfc4b2', a: .75 }]);
    goldFlute(c, 380, 900, 300, .05);
    c.save(); c.filter = 'blur(10px)'; c.globalAlpha = .45; c.fillStyle = '#0b0302';
    for (const [x, y, r] of [[120, 560, .6], [960, 700, 2.4], [880, 1250, 3.6]]) { c.save(); c.translate(x, y); c.rotate(r); c.beginPath(); c.ellipse(0, 0, 70, 46, 0, 0, 7); c.fill(); c.fillRect(-14, -230, 28, 220); c.restore(); }
    c.restore(); vignette(c, .6);
    cap(c, ['The village suspected…', 'and the priest was accused.']); },
  // S9 37.4–43.8 · jhoti, indigo night · the king's dream: her footprint opens into a lotus (Lakshmi is Radha)
  9: c => { floor(c, '#4a2016', .3); tint(c, '#101a3c', .6);
    inlay(c, 540, 1010, 1.5, 0, 1, ALTA, .8);
    jhoti(c, [{ strokes: padaOutline(540, 1010, 1.5, 0, 1, { inner: false }) }, { strokes: lotus(540, 900, 210, { w: 8 }), a: .95 }, { strokes: [S(chain(bez([880, 320], [830, 334], [822, 404], [872, 412]), bez([872, 412], [842, 394], [848, 344], [880, 320])), 6)] },
      { strokes: STARS(30) }]);
    vignette(c, .5, 200, 1100, 540, 900);
    cap(c, ['Then the king dreamt:', 'Lakshmi is Radha herself.']); },
  // S10 44.1–50.8 · jhoti · Radha seated at Gopinath's left; a ghagra is drawn down over her feet
  10: c => { floor(c);
    const ps = [pada(285, 900, 1.15, -.06, -1, BLUE), pada(365, 905, 1.15, .22, 1, BLUE), pada(715, 905, 1.1, -.04, -1, ALTA), pada(805, 905, 1.1, .04, 1, ALTA)];
    padas(c, ps, [{ strokes: [...feather(250, 690, .9, -.25), ...flute(150, 640, 300, -.12)] }, { strokes: seat(320, 1010) }, { strokes: seat(760, 1010) }]);
    // the ghagra being drawn: a bell of paste lines with mirror circles, halfway over her feet
    jhoti(c, [{ strokes: [S(chain(bez([640, 560], [600, 700], [590, 800], [600, 880]), bez([600, 880], [700, 900], [820, 900], [920, 880]), bez([920, 880], [930, 800], [920, 700], [880, 560])), 8, { taper: .05 }), ...[620, 680, 740, 800, 860].map(x => S(circle(x + 30, 846, 13), 5, { taper: .05 })), ...[650, 710, 770, 830].map(x => S([[x + 20, 600], [x - 4, 820]], 4, { taper: .3 }))] }]);
    cap(c, ['But her feet stayed hidden', 'under her ghagra-choli.']); },
  // S11–12 51.2–53.0 · the loom · the ghagra frays into thread; the Odia saree is woven out of it, ikat border feathering in
  11: c => { c.fillStyle = '#140805'; c.fillRect(0, 0, W, H);
    ghagra(c, 140, 940, -40, 560, { fray: 470, drift: 10 });
    saree(c, 140, 940, 760, 1300, { upto: 1300, bandTop: 1110 });
    c.save(); const g = c.createLinearGradient(0, 700, 0, 800); g.addColorStop(0, 'rgba(20,8,5,1)'); g.addColorStop(1, 'rgba(20,8,5,0)'); c.fillStyle = g; c.fillRect(0, 700, W, 100); c.restore();
    vignette(c, .6, 260, 1200, 540, 900);
    cap(c, ['When she was dressed', 'in an Odia saree…'], 'loom'); },
  // S13 53.1–56.6 · watercolour · the feet are seen
  13: c => { plate(c, PL.reveal); cap(c, ['…her feet were seen.', 'The priests took it as a blessing.'], 'dark'); },
  // S14 57.1–64.8 · watercolour · since then, once a year: Odiani besha beside Natabara besha
  14: c => { plate(c, PL.besha); cap(c, ['Since then, once a year on Aonla Navami,', 'Radha wears the Odiani besha.'], 'dark', 1412, { size: 42 }); },
  // S15 65.2–73.5 · jhoti → end card · the accusing footprints turned into a queue, all facing her feet
  15: c => { floor(c, '#8e3620', .9);
    const q = []; for (let i = 0; i < 26; i++) { const t = i / 25, x = 540 + Math.sin(t * 7) * 220 * (1 - t * .6), y = 1320 - t * 640; q.push(pada(x - 18, y, .55 - t * .2, 0, -1, null), pada(x + 18, y + 6, .55 - t * .2, 0, 1, null)); }
    inlay(c, 500, 560, .9, 0, -1, ALTA); inlay(c, 580, 560, .9, 0, 1, ALTA);
    jhoti(c, [{ strokes: q.flatMap(p => padaSolid(p.x, p.y, p.s, 0, p.m)), a: .8, col: '#e9dfcc' }, { strokes: [...padaOutline(500, 560, .9, 0, -1, { inner: false }), ...padaOutline(580, 560, .9, 0, 1, { inner: false }), ...lotus(540, 380, 70, { w: 6 })] }]);
    odia(c, 'ବୁଧବାର, ୧୮ ନଭେମ୍ବର · ସାକ୍ଷୀଗୋପାଳ', 500, 1412, 40, '#f3ebdc', { halo: 'rgba(60,18,8,.9)', w: 600 });
    cap(c, ['Wednesday, 18 November · Sakshigopal'], 'paste', 1462, { size: 34 }); },
};
