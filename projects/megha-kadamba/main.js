import { DUR, W, H, DB, BEATS, PAL, SHOTS, LYR } from './timeline.js';
import { initLightbox, sheet, drawStack, glow, profile, profileCuts, deul, wheelCut, wheelSpokes, crPath, LW, LH } from './lightbox.js';
import { mk, drawS, drawList, withSeed, rnd, pick, qcurve, polar, clump, edgeOf, rgba, mixc, mulberry } from './engine_wc.js';
import { knife, strokesFromRef, bake, cvs, hx } from './impasto.js';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a)), ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const Q = new URLSearchParams(location.search);

const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });

let PAPER, LB1, LB2, WC, IA, IB, IC;

// ======================= LIGHTBOX (shots 1–2) =======================
function buildLightbox() {
  const full = m => m.fillRect(-LW / 2, -LH / 2, LW, LH);
  LB1 = [
    sheet('#E6B183', full, { depth: 0, trans: .95, cut: m => { m.beginPath(); m.arc(0, -430, 150, 0, 7); m.fill(); } }),
    sheet('#CC7E50', m => {
      m.beginPath(); m.moveTo(-LW / 2, 330);
      for (let x = -LW / 2; x <= LW / 2; x += 50) m.lineTo(x, 300 - 60 * Math.sin(x / 260) - 30 * Math.sin(x / 97 + 1));
      m.lineTo(LW / 2, LH / 2); m.lineTo(-LW / 2, LH / 2); m.fill();
      deul(m, -300, 300, 150, 360); deul(m, 330, 290, 110, 250); deul(m, -470, 310, 70, 150);
    }, { depth: .25, trans: .75 }),
    sheet('#8E3F29', full, {
      depth: .5, trans: .45,
      cut: m => {
        // cusped arch opening (mandapa doorway)
        m.beginPath(); m.moveTo(-430, 760); m.lineTo(-430, -330);
        for (let k = 0; k <= 7; k++) { const a = Math.PI + k / 7 * Math.PI, x = Math.cos(a) * 430, y = -330 + Math.sin(a) * 380; const c = Math.PI + (k - .5) / 7 * Math.PI; if (k) m.quadraticCurveTo(Math.cos(c) * 470, -330 + Math.sin(c) * 420, x, y); }
        m.lineTo(430, 760); m.closePath(); m.fill();
        for (const sx of [-1, 1]) for (let k = 0; k < 9; k++) { const x = sx * 545, y = -560 + k * 120; m.beginPath(); m.moveTo(x, y - 34); m.lineTo(x + 22, y); m.lineTo(x, y + 34); m.lineTo(x - 22, y); m.fill(); }
      }
    }),
    sheet('#46191A', m => profile(m, 1.15, 150, 90), { depth: .72, trans: .12, cut: m => profileCuts(m, 1.15, 150, 90), rim: '#ffb46a', rimA: .8 }),
    sheet('#160707', m => {
      // lotus-and-leaf front band (lyrics sit on it) + a hanging toran at the top
      m.beginPath(); m.moveTo(-LW / 2, 640);
      for (let k = 0; k <= 14; k++) { const x = -LW / 2 + k * LW / 14; m.quadraticCurveTo(x - LW / 28, 520 + (k % 2) * 70, x, 640); }
      m.lineTo(LW / 2, LH / 2); m.lineTo(-LW / 2, LH / 2); m.fill();
      for (let k = 0; k < 5; k++) { const x = -480 + k * 240; m.beginPath(); m.moveTo(x - 70, 640); m.quadraticCurveTo(x - 60, 470, x, 420); m.quadraticCurveTo(x + 60, 470, x + 70, 640); m.fill(); }
      m.fillRect(-LW / 2, -LH / 2, LW, LH / 2 - 860);
      for (let k = 0; k < 15; k++) { const x = -LW / 2 + k * 100 + 50; m.beginPath(); m.moveTo(x - 50, -860); m.quadraticCurveTo(x, -760, x + 50, -860); m.fill(); }
      for (const x of [-520, -380, 380, 520]) { m.fillRect(x - 3, -860, 6, 260 + (x > 0 ? 40 : 0)); for (let k = 0; k < 7; k++) { m.beginPath(); m.arc(x, -820 + k * 42, 15, 0, 7); m.fill(); } }
    }, { depth: 1, trans: .04, cut: m => { for (let k = 0; k < 5; k++) { const x = -480 + k * 240; m.beginPath(); m.ellipse(x, 560, 14, 60, 0, 0, 7); m.fill(); } } }),
  ];
  const WC0 = 0, WCY = -170, WR = 560;
  LB2 = [
    sheet('#E59A62', full, { depth: 0, trans: .95 }),
    sheet('#BF6A40', m => {
      // sea bands and the stepped temple on the shore
      m.fillRect(-LW / 2, 470, LW, LH);
      const base = 470; m.beginPath(); m.moveTo(-330, base);
      for (let k = 0; k < 5; k++) { const w = 330 - k * 60, y = base - 70 - k * 70; m.lineTo(-w, y + 22); m.lineTo(-w + 20, y); m.lineTo(w - 20, y); m.lineTo(w, y + 22); }
      m.lineTo(0, base - 470); m.lineTo(330, base); m.closePath(); m.fill(); m.lineTo(0, 0);
      deul(m, 0, base - 400, 70, 120);
    }, { depth: .3, trans: .7, cut: m => { for (let r = 0; r < 4; r++) for (let k = 0; k < 9; k++) { const y = 540 + r * 55, x = -620 + k * 150 + (r % 2) * 75; m.beginPath(); m.ellipse(x, y, 48, 6, 0, Math.PI, 0); m.fill(); } } }),
    sheet('#57221D', m => profile(m, 1.3, 150, -20), { depth: .62, trans: .12, cut: m => profileCuts(m, 1.3, 150, -20), rim: '#ffb46a', rimA: .8 }),
    sheet('#1B0A08', full, {
      depth: 1, trans: .03, cut: m => {
        wheelCut(m, WC0, WCY, WR);
        m.globalCompositeOperation = 'source-over'; wheelSpokes(m, WC0, WCY, WR);
      }
    }),
  ];
  LB2.wheel = { x: WC0, y: WCY, R: WR };
}
function lightboxCam(L, cam) { return (p => ({ x: W / 2 + (L.x - cam.x * p) * (1 + (cam.z - 1) * p), y: H / 2 + (L.y - cam.y * p) * (1 + (cam.z - 1) * p) }))(1); }

function shot1(c, t) {
  const on = ss(seg(t, 1.86, 3.4));
  LB1[0].lit = ss(seg(t, 1.86, 2.3)); LB1[1].lit = ss(seg(t, 2.37, 2.8)); LB1[2].lit = ss(seg(t, 2.86, 3.3)); LB1[3].lit = ss(seg(t, 3.37, 3.8)); LB1[4].lit = 1;
  const cam = { x: 0, y: lerp(30, -30, eio(seg(t, 0, 4.4))), z: lerp(1.0, 1.1, eio(seg(t, 0, 4.4))) + .0006 * Math.sin(t * 1.3) };
  const sun = { x: W / 2 + (0 - cam.x * .45) * (1 + (cam.z - 1) * .45), y: H / 2 + (-430 - cam.y * .45) * (1 + (cam.z - 1) * .45) };
  const sunR = lerp(7, 150, eo(seg(t, 1.86, 2.75)));
  const flick = 1 + .05 * Math.sin(7.3 * t) * Math.sin(3.1 * t);
  c.fillStyle = '#0c0405'; c.fillRect(0, 0, W, H);
  drawStack(c, LB1, cam, { x: sun.x, y: sun.y + 120, r: 1500, I: flick }, {
    before: [(cc) => { cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.fillStyle = '#ffd890'; cc.beginPath(); cc.arc(sun.x, sun.y, sunR * 1.06, 0, 7); cc.fill(); cc.restore(); }],
  });
  // the lamp is off until the first downbeat
  c.save(); c.globalAlpha = .9 * (1 - on); c.fillStyle = '#080203'; c.fillRect(0, 0, W, H); c.restore();
  glow(c, sun.x, sun.y, Math.max(14, sunR * .8), 'rgba(255,190,110,1)', (.55 + .3 * on) * flick);
  glow(c, sun.x, sun.y, 6, 'rgba(255,240,200,1)', .9 * (1 - on * .5));
}
function shot2(c, t) {
  const lt = t - 3.87;
  LB2.forEach(L => L.lit = 1);
  const rack = eio(seg(t, 5.5, 6.3));
  LB2[2].blur = lerp(5, 0, rack); LB2[3].blur = lerp(0, 3.5, rack);
  const cam = { x: 0, y: lerp(260, -40, eio(seg(t, 3.87, 7.87))), z: lerp(1.07, 1.0, eio(seg(t, 3.87, 7.87))) };
  const p = 1, z = 1 + (cam.z - 1) * p, hubx = W / 2 + (LB2.wheel.x - cam.x * p) * z, huby = H / 2 + (LB2.wheel.y - cam.y * p) * z;
  const flick = 1 + .05 * Math.sin(7.3 * t) * Math.sin(3.1 * t);
  const rot = .05 * lt + Math.PI / 8 * eio(seg(t, 5.87, 6.9));
  c.fillStyle = '#0c0405'; c.fillRect(0, 0, W, H);
  drawStack(c, LB2, cam, { x: hubx, y: huby, r: 1250, I: flick }, {
    after: [(cc) => {   // light rays through the sky paper, turning by one spoke on the downbeat
      cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.globalCompositeOperation = 'screen';
      for (let k = 0; k < 16; k++) {
        const a = rot + k / 16 * Math.PI * 2, g = cc.createRadialGradient(hubx, huby, 0, hubx, huby, 1300);
        g.addColorStop(0, 'rgba(255,214,150,.42)'); g.addColorStop(1, 'rgba(255,170,90,0)');
        cc.fillStyle = g; cc.beginPath(); cc.moveTo(hubx, huby); cc.arc(hubx, huby, 1400, a - .07, a + .07); cc.fill();
      }
      cc.restore();
    }],
  });
  glow(c, hubx, huby, 90, 'rgba(255,180,100,1)', .35 * flick);
  // the lamp goes to full: light → paper
  const wo = ss(seg(t, 7.4, 7.87));
  if (wo > 0) { glow(c, hubx, huby, 260 + 900 * wo, 'rgba(255,226,180,1)', wo * 1.4); c.save(); c.globalAlpha = wo; c.fillStyle = PAL.cream; c.fillRect(0, 0, W, H); c.restore(); }
}

// ======================= WATERCOLOR (shots 3–4) =======================
const FOOT = [[200, 0], [60, 4], [-90, 6], [-170, 2], [-212, -10], [-222, -30], [-205, -44], [-150, -50], [-60, -82], [40, -132], [108, -190], [128, -262], [126, -340], [212, -340], [214, -262], [232, -150], [236, -60], [222, -14]];
function polyWash(S, pts, col, a = .3) {   // a wash: the polygon in jittered passes, as wide strokes sweeping across it
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const step = 10; const out = [];
  for (let y = y0 + 6; y < y1; y += step) {
    // horizontal span of the polygon at y
    const xsAt = []; for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= y && by > y) || (by <= y && ay > y)) xsAt.push(ax + (y - ay) / (by - ay) * (bx - ax)); }
    xsAt.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xsAt.length; k += 2) out.push(mk(qcurve(xsAt[k] + 3, y + rnd(-2, 2), xsAt[k + 1] - 3, y + rnd(-2, 2), rnd(-4, 4), 8), step * 2.6, col, { prof: 'brush', nb: 2, a: a * .62, rough: .12 }));
  }
  S.push(...out);
}
function footStrokes(ox, oy, rot, sc, light) {
  const T = ([x, y]) => [ox + (x * Math.cos(rot) - y * Math.sin(rot)) * sc, oy + (x * Math.sin(rot) + y * Math.cos(rot)) * sc];
  const P = FOOT.map(T);
  const skin = [], shade = [], alta = [], ink = [], gold = [];
  polyWash(skin, P, light ? '#D9A07A' : '#C98B62', .62); polyWash(skin, P, light ? '#E2B08A' : '#CF9670', .3);
  polyWash(skin, P.slice(0, 9).concat([T([-60, -30]), T([100, -30])]), '#B87650', .16);
  // shadow side under the instep and the heel
  shade.push(mk(qcurve(...T([170, -30]), ...T([-120, -24]), 8, 10), 26 * sc, '#9E5E3E', { prof: 'even', a: .35 }));
  shade.push(mk(qcurve(...T([220, -250]), ...T([226, -40]), -6, 10), 22 * sc, '#9E5E3E', { prof: 'even', a: .3 }));
  // ink edges along the outline
  for (let i = 0; i < P.length - 1; i++) if (i !== 11 && i !== 12) ink.push(mk(qcurve(...P[i], ...P[i + 1], rnd(-3, 3), 6), 3.2 * sc, '#4a2e22', { prof: 'even', nb: 0, a: .7, rough: .3 }));
  // alta: the red border along the sole, the toe tips, a dot circle on the top of the foot
  const sole = [[222, -14], [200, 0], [60, 4], [-90, 6], [-170, 2], [-212, -10], [-222, -30]].map(T);
  for (let i = 0; i < sole.length - 1; i++) alta.push(mk(qcurve(...sole[i], ...sole[i + 1], 0, 6), 20 * sc, PAL.alta, { prof: 'even', nb: 3, a: .82, rough: .2 }));
  alta.push(mk(qcurve(...T([-222, -30]), ...T([-195, -46]), -6, 6), 18 * sc, PAL.alta, { prof: 'even', a: .82 }));
  const cc = T([-40, -62]); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; alta.push(mk(polar(cc[0] + Math.cos(a) * 14 * sc, cc[1] + Math.sin(a) * 8 * sc, a, 6 * sc, 0, 3), 7 * sc, PAL.alta, { prof: 'leaf', nb: 0, a: .9 })); }
  // anklet: gold beads on an ink line
  const a0 = T([124, -300]), a1 = T([216, -300]);
  ink.push(mk(qcurve(...a0, ...a1, -8, 8), 3 * sc, '#3a2a20', { prof: 'even', nb: 0, a: .8 }));
  for (let k = 0; k <= 6; k++) { const x = lerp(a0[0], a1[0], k / 6), y = lerp(a0[1], a1[1], k / 6) + 4 * sc * Math.sin(k / 6 * Math.PI); gold.push(mk(polar(x - 5, y + 7, 1.57, 10 * sc, 0, 3), 11 * sc, PAL.gold, { prof: 'leaf', nb: 0, a: .9 })); }
  return { skin, shade, ink, alta, gold };
}
function hibiscus(S, x, y, r, ang) {
  for (let k = 0; k < 5; k++) {
    const a = ang + k / 5 * 6.283;
    S.push(mk(qcurve(x, y, x + Math.cos(a) * r, y + Math.sin(a) * r * .62, rnd(-r * .3, r * .3), 8), r * .95, pick([PAL.alta, '#D8442A', '#B82A1C']), { prof: 'leaf', nb: 5, a: rnd(.62, .8), rough: .3 }));
  }
  S.push(mk(polar(x, y, ang + .4, r * .25, 0, 4), r * .38, '#7E1A12', { prof: 'leaf', nb: 0, a: .7 }));
  const sa = ang - 1.9; S.push(mk(polar(x, y, sa, r * 1.15, r * .1, 8), 3, '#E3A23A', { prof: 'even', nb: 0, a: .9 }));
  for (let k = 0; k < 5; k++) S.push(mk(polar(x + Math.cos(sa) * r * 1.15 + rnd(-6, 6), y + Math.sin(sa) * r * .7 + rnd(-6, 6), rnd(0, 6), 5, 0, 3), 7, PAL.gold, { prof: 'leaf', nb: 0, a: .95 }));
}
function buildWatercolor() {
  WC = {};
  withSeed(311, () => {
    // shot 3: ground wash, two feet, mandar burst
    const g = [];
    for (let k = 0; k < 26; k++) { const y = 1560 + k * 26 + rnd(-6, 6); g.push(mk(qcurve(-60, y, 1140, y + rnd(-14, 14), rnd(-20, 20), 14), rnd(40, 70), pick(['#E2B98A', '#D9A070', '#E8C79C', '#CFA27A']), { prof: 'even', nb: 5, a: rnd(.18, .32), rough: .3 })); }
    for (let k = 0; k < 5; k++) { const y = 1520 + k * 14; g.push(mk(qcurve(-40, y, 1120, y + rnd(-8, 8), rnd(-6, 6), 14), rnd(8, 18), '#C99268', { prof: 'even', nb: 3, a: .2 })); }
    WC.ground = g;
    WC.footB = footStrokes(640, 1530, -.32, .95, true);
    WC.footA = footStrokes(380, 1640, 0, 1.08, false);
    const fl = [], spots = [[150, 1830, 70], [330, 1950, 56], [560, 1890, 80], [800, 1970, 62], [960, 1820, 74], [90, 2080, 60], [440, 2110, 66], [700, 2140, 72], [930, 2090, 58], [250, 1750, 44], [870, 1700, 46], [1010, 2010, 50], [620, 1760, 40]];
    WC.flowers = spots.map(([x, y, r]) => { const S = []; hibiscus(S, x, y, r, rnd(0, 6.28)); clump(S, x + rnd(-r, r), y + r * .5, r * .5, 5, ['#6E8A4A', '#56743A', '#8AA060'], { l0: r * .3, l1: r * .6, w0: r * .2, w1: r * .32 }); return S; });
    // shot 4: palash tree of spring, painted structure first
    const trunk = [], br = [], fl4 = [], gr4 = [];
    const tr = mk([[560, 2420], [552, 2200], [540, 1900], [528, 1600], [520, 1350], [530, 1150]], 74, '#5A3A28', { prof: 'trunk', nb: 7, a: .9 });
    trunk.push(tr, edgeOf(tr, 1, 6, '#3a2418', .8), edgeOf(tr, -1, 4, '#3a2418', .5));
    const tips = [];
    const branch = (x, y, a, len, w, d) => {
      const s = mk(polar(x, y, a, len, rnd(-len * .15, len * .15), 8), w, '#5A3A28', { prof: 'tip', nb: w > 10 ? 4 : 0, a: .88 }); br.push(s);
      const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
      if (d > 0) { branch(ex, ey, a - rnd(.25, .55), len * rnd(.6, .78), w * .62, d - 1); branch(ex, ey, a + rnd(.25, .55), len * rnd(.6, .78), w * .62, d - 1); }
      else tips.push([ex, ey]);
    };
    branch(530, 1180, -2.1, 330, 36, 3); branch(530, 1180, -1.2, 340, 34, 3); branch(526, 1300, -2.7, 260, 26, 2); branch(530, 1260, -.45, 270, 26, 2); branch(530, 1150, -1.62, 300, 30, 3);
    for (const [x, y] of tips) {
      for (let k = 0; k < 13; k++) { const a = rnd(-3.4, .3), r = rnd(22, 50); fl4.push(mk(polar(x + rnd(-24, 24), y + rnd(-20, 20), a, r, rnd(-12, 12), 6), rnd(12, 20), pick([PAL.mari, PAL.alta, '#E0702A', '#D85A24']), { prof: 'tip', nb: 3, a: rnd(.7, .9) })); }
      fl4.push(mk(polar(x, y, -1.2, 18, 0, 3), 9, '#3a2418', { prof: 'leaf', nb: 0, a: .7 }));
    }
    for (let k = 0; k < 18; k++) { const y = 2250 + k * 9; gr4.push(mk(qcurve(-60, y, 1140, y + rnd(-8, 8), 10, 12), rnd(30, 50), pick(['#E2B98A', '#D9A070']), { prof: 'even', nb: 4, a: .22 })); }
    for (let k = 0; k < 40; k++) { const x = rnd(40, 1040), y = rnd(2240, 2390); gr4.push(mk(polar(x, y, rnd(0, 6.28), rnd(14, 24), 4, 4), rnd(8, 12), pick([PAL.mari, PAL.alta]), { prof: 'leaf', nb: 0, a: .8 })); }
    // sky wash behind the tree, warm
    const sky = [];
    for (let k = 0; k < 30; k++) { const y = 120 + k * 60 + rnd(-10, 10); sky.push(mk(qcurve(-80, y, 1160, y + rnd(-20, 20), rnd(-30, 30), 14), rnd(60, 90), mixc('#F2C98E', '#F4DDB8', k / 30), { prof: 'even', nb: 4, a: rnd(.12, .2) })); }
    Object.assign(WC, { trunk, br, fl4, gr4, sky, tips });
    WC.petals = Array.from({ length: 26 }, (_, k) => ({ x: rnd(80, 1000), y0: rnd(300, 1300), sp: rnd(70, 140), ph: rnd(0, 6.28), s: mk(polar(0, 0, rnd(0, 6.28), 22, 6, 4), 12, pick([PAL.mari, PAL.alta]), { prof: 'leaf', nb: 0, a: .85 }) }));
  });
}
function paper(c, oy) { c.drawImage(PAPER, 0, -oy); }
function shot3(c, t) {
  const push = eio(seg(t, 7.87, 11.9)), oy = lerp(220, 300, push), z = lerp(1.0, 1.06, push);
  c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
  paper(c, oy); c.translate(0, -oy);
  drawList(c, WC.ground, eo(seg(t, 7.9, 8.8)));
  for (const [f, d] of [[WC.footB, .25], [WC.footA, 0]]) {
    drawList(c, f.skin, seg(t, 8.0 + d, 8.9 + d)); drawList(c, f.shade, seg(t, 8.7 + d, 9.1 + d));
    drawList(c, f.ink, seg(t, 8.5 + d, 9.3 + d)); drawList(c, f.alta, eo(seg(t, 9.0 + d, 9.75 + d))); drawList(c, f.gold, seg(t, 9.3 + d, 9.7 + d));
  }
  // paper mist dissolves the legs above the ankles
  { const g = c.createLinearGradient(0, 1150, 0, 1330); g.addColorStop(0, rgba('#F1E1C5', 1)); g.addColorStop(1, rgba('#F1E1C5', 0)); c.fillStyle = g; c.fillRect(0, 1000, W, 420); }
  // mandar burst on the downbeat
  WC.flowers.forEach((S, k) => drawList(c, S, eo(seg(t, 9.85 + k * .055, 10.45 + k * .055))));
  c.restore();
}
function shot4(c, t) {
  const tilt = eio(seg(t, 11.85, 14.6)), oy = lerp(480, 40, tilt);
  c.save(); paper(c, oy); c.translate(0, -oy);
  drawList(c, WC.sky, 1); drawList(c, WC.gr4, eo(seg(t, 11.9, 12.6)));
  drawList(c, WC.trunk, eo(seg(t, 11.95, 12.7))); drawList(c, WC.br, seg(t, 12.4, 13.5));
  drawList(c, WC.fl4, eo(seg(t, 13.84, 14.5)));
  // drifting petals after the burst
  if (t > 14.3) for (const p of WC.petals) {
    const u = t - 14.3, y = p.y0 + u * p.sp + oy * .2, x = p.x + 30 * Math.sin(u * 1.6 + p.ph);
    c.save(); c.translate(x, y); c.rotate(u * .9 + p.ph); c.globalAlpha = ss(seg(t, 14.3, 14.7)); drawS(c, p.s, 1); c.restore();
  }
  c.restore();
  // breath: paper-coloured mist rising from the bottom
  const mist = ss(seg(t, 14.0, 14.9)) * (1 - ss(seg(t, 15.3, 15.7)));
  if (mist > 0) { const g = c.createLinearGradient(0, H, 0, H * .35); g.addColorStop(0, rgba(PAL.cream, .92 * mist)); g.addColorStop(1, rgba(PAL.cream, 0)); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  // red pigment pools and floods the sheet → the chorus paint
  const pool = seg(t, 15.15, 15.88);
  if (pool > 0) {
    const R = lerp(10, 1350, Math.pow(pool, 1.6)), cx = W / 2, cy = H * .5;
    c.save(); c.beginPath();
    for (let k = 0; k <= 64; k++) { const a = k / 64 * 6.283, rr = R * (1 + .08 * Math.sin(a * 5 + 1) + .05 * Math.sin(a * 11 + 3)); k ? c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : c.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    c.closePath(); c.fillStyle = rgba(PAL.alta, .9); c.fill(); c.lineWidth = 10; c.strokeStyle = rgba('#8E1E12', .5); c.stroke(); c.restore();
  }
}

// ======================= IMPASTO (shots 5–8) =======================
const PW = 1350, PH = 2400;
function plate(draw, groups, seed) {
  const ref = cvs(PW, PH), ids = cvs(PW, PH), r = ref.getContext('2d'), d = ids.getContext('2d');
  r.imageSmoothingEnabled = d.imageSmoothingEnabled = true;
  draw(r, d);
  const strokes = strokesFromRef(ref, ids, groups, seed);
  return { ref, strokes, img: bake(ref, strokes) };
}
// paint the same shape in the reference (fill) and in the id map (group key)
const dual = (r, d, key, fill, path) => { r.fillStyle = fill; d.fillStyle = key; r.beginPath(); path(r); r.fill(); d.beginPath(); path(d); d.fill(); };
function buildImpasto() {
  const R = mulberry(77), rr = (a, b) => a + (b - a) * R();
  // ---- plate A: monsoon kadamba, umbrella
  const blossoms = [];
  IA = plate((r, d) => {
    const sky = r.createLinearGradient(0, 0, 0, 1500);
    sky.addColorStop(0, '#2A2540'); sky.addColorStop(.42, '#55607E'); sky.addColorStop(.72, '#B47A62'); sky.addColorStop(.9, PAL.mari); sky.addColorStop(1, PAL.gold);
    r.fillStyle = sky; d.fillStyle = '#000001'; r.fillRect(0, 0, PW, 1520); d.fillRect(0, 0, PW, 1520);
    // cloud masses, gold-lit underneath
    for (const [cx, cy, w, h] of [[300, 420, 520, 230], [980, 300, 600, 260], [700, 760, 640, 210], [150, 980, 420, 170], [1150, 1000, 380, 160]]) {
      const blob = (c, dy) => { for (let k = 0; k < 6; k++) { const ex = cx + (k - 2.5) * w * .17, ey = cy + dy + Math.sin(k * 1.7) * h * .18; c.moveTo(ex + w * .26, ey); c.ellipse(ex, ey, w * .26, h * .5, 0, 0, 7); } };
      dual(r, d, '#000003', '#E9A24C', c => blob(c, 20));
      dual(r, d, '#000002', '#3B3550', c => blob(c, 0));
    }
    // horizon break of light
    dual(r, d, '#000004', '#F6CF7A', c => c.ellipse(1050, 1440, 420, 70, 0, 0, 7));
    // fields
    dual(r, d, '#000005', '#4E4A26', c => { c.moveTo(0, 1500); for (let x = 0; x <= PW; x += 60) c.lineTo(x, 1490 + 14 * Math.sin(x / 90)); c.lineTo(PW, 1720); c.lineTo(0, 1720); });
    // wet ground with a gold reflection path
    dual(r, d, '#000006', '#3A2A22', c => c.rect(0, 1700, PW, 700));
    dual(r, d, '#000007', '#C98A44', c => { c.moveTo(1000, 1700); c.quadraticCurveTo(820, 1980, 640, 2400); c.lineTo(980, 2400); c.quadraticCurveTo(1060, 1980, 1100, 1700); });
    // kadamba: trunk and crown
    dual(r, d, '#000008', '#3A2418', c => { c.moveTo(500, 1880); c.quadraticCurveTo(520, 1500, 540, 1160); c.lineTo(600, 1160); c.quadraticCurveTo(590, 1500, 600, 1880); });
    dual(r, d, '#000009', '#2F3B22', c => { for (const [x, y, a, b] of [[560, 900, 430, 300], [330, 1020, 260, 190], [800, 1010, 260, 190], [560, 700, 300, 200], [420, 820, 220, 170], [720, 820, 220, 170]]) c.ellipse(x, y, a, b, 0, 0, 7); });
    dual(r, d, '#00000a', '#56682E', c => { for (const [x, y, a, b] of [[480, 720, 200, 110], [700, 760, 170, 100], [330, 930, 140, 90], [820, 930, 150, 90]]) c.ellipse(x, y, a, b, 0, 0, 7); });
    for (let k = 0; k < 46; k++) {
      const a = rr(0, 6.283), q = Math.sqrt(R()), x = 560 + Math.cos(a) * q * 520, y = 880 + Math.sin(a) * q * 330, s = rr(15, 24);
      if (y > 1150) continue; blossoms.push([x, y, s]);
      dual(r, d, '#00000b', PAL.gold, c => c.arc(x, y, s, 0, 7));
    }
    // her: a vermilion umbrella and a figure under the tree
    // her: a vermilion umbrella and a figure in a saree under the tree (scaled about her feet)
    const F = (c, fn) => { c.save(); c.translate(830, 1900); c.scale(1.7, 1.7); c.translate(-830, -1900); fn(c); c.restore(); };
    dual(r, d, '#00000d', '#3A1A1A', c => F(c, c => { c.moveTo(810, 1655); c.lineTo(842, 1655); c.quadraticCurveTo(858, 1760, 870, 1900); c.lineTo(786, 1900); c.quadraticCurveTo(800, 1760, 810, 1655); }));
    dual(r, d, '#00000e', PAL.mari, c => F(c, c => { c.moveTo(818, 1740); c.lineTo(852, 1730); c.lineTo(870, 1900); c.lineTo(842, 1900); }));
    dual(r, d, '#00000c', PAL.alta, c => F(c, c => { c.moveTo(720, 1665); c.quadraticCurveTo(826, 1530, 935, 1665); c.quadraticCurveTo(826, 1640, 720, 1665); }));
    dual(r, d, '#00000f', '#8E2A1A', c => c.ellipse(830, 2010, 170, 26, 0, 0, 7));
  }, {
    '#000001': { maxR: 46, dir: -.12, jit: .35 }, '#000002': { maxR: 36, dir: .05, jit: .5 }, '#000003': { maxR: 16, minR: 5, dir: 0, jit: .2 },
    '#000004': { maxR: 20, dir: 0, jit: .15 }, '#000005': { maxR: 22, dir: 0, jit: .2 }, '#000006': { maxR: 30, dir: 0, jit: .1 },
    '#000007': { maxR: 14, minR: 5, dir: 0, jit: .05 }, '#000008': { maxR: 16, minR: 4, dir: -1.57, jit: .15 },
    '#000009': { maxR: 26, minR: 6, dir: (x, y) => Math.atan2(y - 900, x - 560) + 1.57, jit: .7 }, '#00000a': { maxR: 16, minR: 5, dir: (x, y) => Math.atan2(y - 900, x - 560) + 1.57, jit: .6 },
    '#00000b': { maxR: 8, minR: 3, dir: (x, y) => R() * 6.28, jit: 3, detail: true, solid: true },
    '#00000c': { maxR: 12, minR: 3, dir: .1, jit: .2, solid: true }, '#00000d': { maxR: 10, minR: 3, dir: -1.57, jit: .1, solid: true }, '#00000e': { maxR: 6, minR: 2, dir: -1.5, jit: .1, solid: true }, '#00000f': { maxR: 8, minR: 3, dir: 0, jit: .05 },
  }, 5);
  IA.blossoms = blossoms;
  // sweep order for the paint-over from the red pool: radial from the frame centre + noise
  for (const s of IA.strokes) s.sweep = Math.hypot(s.x - 675, (s.y - 1180) * .7) / 1300 + R() * .12;
  IA.strokes.sort((a, b) => a.sweep - b.sweep);

  // ---- plate B: one kadamba blossom, macro
  IB = plate((r, d) => {
    const bg = r.createRadialGradient(675, 1050, 200, 675, 1050, 1500); bg.addColorStop(0, '#4E5A2A'); bg.addColorStop(.5, '#2C3420'); bg.addColorStop(1, '#1B1A14');
    r.fillStyle = bg; d.fillStyle = '#000001'; r.fillRect(0, 0, PW, PH); d.fillRect(0, 0, PW, PH);
    for (const [x, y, a, l, w] of [[200, 600, -.7, 700, 260], [1150, 1500, 2.4, 760, 280], [300, 1750, -.2, 640, 230], [1100, 500, 2.9, 600, 220]])
      dual(r, d, '#000002', '#3E5228', c => { c.save(); c.translate(x, y); c.rotate(a); c.ellipse(l / 2, 0, l / 2, w / 2, 0, 0, 7); c.restore(); });
    dual(r, d, '#000003', '#E8962C', c => c.arc(675, 1050, 400, 0, 7));
    dual(r, d, '#000004', PAL.gold, c => c.arc(640, 1010, 290, 0, 7));
    dual(r, d, '#000005', '#FBE3A8', c => c.arc(600, 960, 120, 0, 7));
  }, {
    '#000001': { maxR: 50, dir: .6, jit: .9 }, '#000002': { maxR: 24, minR: 6, dir: (x, y) => .6, jit: .4 },
    '#000003': { maxR: 13, minR: 4, dir: (x, y) => Math.atan2(y - 1050, x - 675), jit: .25, detail: true },
    '#000004': { maxR: 11, minR: 4, dir: (x, y) => Math.atan2(y - 1050, x - 675), jit: .25, detail: true },
    '#000005': { maxR: 9, minR: 3, dir: (x, y) => Math.atan2(y - 1050, x - 675), jit: .3, detail: true },
  }, 9);
  // florets: radial cream-tipped spikes over the ball (part of the plate)
  { const x = IB.img.getContext('2d'); for (let k = 0; k < 520; k++) { const a = rr(0, 6.283), q = Math.sqrt(R()) * 400, px = 675 + Math.cos(a) * q, py = 1050 + Math.sin(a) * q; knife(x, { x: px, y: py, ang: a + rr(-.2, .2), len: rr(26, 46), wid: rr(5, 8), c: hx(q > 300 ? '#FFF1C8' : PAL.gold), c2: hx('#FFF6DC'), seed: k, solid: true }); }
    for (let k = 0; k < 60; k++) knife(x, { x: rr(100, 1250), y: rr(300, 2100), ang: rr(0, 6.28), len: rr(10, 18), wid: rr(8, 12), c: hx('#DDE6EE'), c2: hx('#FFFFFF'), seed: 900 + k, solid: true, alpha: .65 }); }

  // ---- plate C: the sun wheel in knife paint
  IC = plate((r, d) => {
    const bg = r.createRadialGradient(675, 1050, 100, 675, 1050, 1400); bg.addColorStop(0, '#FBD98C'); bg.addColorStop(.35, PAL.mari); bg.addColorStop(.7, PAL.alta); bg.addColorStop(1, '#5A1A14');
    r.fillStyle = bg; d.fillStyle = '#000001'; r.fillRect(0, 0, PW, PH); d.fillRect(0, 0, PW, PH);
    const cx = 675, cy = 1050, Rw = 470;
    dual(r, d, '#000002', '#4A2A20', c => { c.arc(cx, cy, Rw, 0, 6.2832); c.moveTo(cx + Rw * .8, cy); c.arc(cx, cy, Rw * .8, 6.2832, 0, true); });
    for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283, w = k % 2 ? 14 : 38; dual(r, d, '#000003', k % 2 ? '#5E3426' : '#53301F', c => { c.save(); c.translate(cx, cy); c.rotate(a); c.rect(70, -w / 2, Rw * .8 - 66, w); c.restore(); }); }
    dual(r, d, '#000004', '#6A3A26', c => c.arc(cx, cy, 82, 0, 7));
    dual(r, d, '#000005', PAL.gold, c => c.arc(cx, cy, 30, 0, 7));
    dual(r, d, '#000006', '#3A1E1C', c => c.rect(0, 1640, PW, 760));
    dual(r, d, '#000007', '#E8A24C', c => { for (let k = 0; k < 14; k++) { const y = 1680 + k * 34, w = 300 - k * 14; c.moveTo(675 + w, y); c.ellipse(675, y, w * (.6 + .4 * Math.sin(k * 2.1) ** 2), 5, 0, 0, 7); } });
  }, {
    '#000001': { maxR: 40, dir: (x, y) => Math.atan2(y - 1050, x - 675) + 1.57, jit: .5 },
    '#000002': { maxR: 16, minR: 5, dir: (x, y) => Math.atan2(y - 1050, x - 675) + 1.57, jit: .15, solid: true },
    '#000003': { maxR: 10, minR: 4, dir: (x, y) => Math.atan2(y - 1050, x - 675), jit: .08, solid: true },
    '#000004': { maxR: 14, minR: 4, dir: (x, y) => Math.atan2(y - 1050, x - 675) + 1.57, jit: .3 },
    '#000005': { maxR: 8, minR: 3, dir: 0, jit: 3, detail: true },
    '#000006': { maxR: 28, dir: 0, jit: .2 }, '#000007': { maxR: 6, minR: 3, dir: 0, jit: .05, solid: true },
  }, 13);
  // lit beads on the rim
  { const x = IC.img.getContext('2d'); for (let k = 0; k < 48; k++) { const a = k / 48 * 6.283; knife(x, { x: 675 + Math.cos(a) * 423, y: 1050 + Math.sin(a) * 423, ang: a + 1.57, len: 18, wid: 14, c: hx(PAL.gold), c2: hx('#FFE7B0'), seed: 3000 + k, solid: true }); } }
  for (const s of IC.strokes) s.sweep = Math.hypot(s.x - 675, s.y - 1050) / 1500 + R() * .08;
  IC.strokes.sort((a, b) => a.sweep - b.sweep);
}
// camera over a plate: centre (cx, cy) in plate px, scale s (kept inside the plate)
function plateCam(c, cx, cy, s) {
  const hw = W / 2 / s, hh = H / 2 / s; cx = clamp(cx, hw, PW - hw); cy = clamp(cy, hh, PH - hh);
  c.setTransform(s, 0, 0, s, W / 2 - cx * s, H / 2 - cy * s);
}
function rain(c, t, a) {
  if (a <= 0) return;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const R = mulberry(4242);
  for (let k = 0; k < 150; k++) {
    const x0 = R() * (W + 300) - 150, sp = 1700 + R() * 900, ph = R(), len = 40 + R() * 50;
    const y = ((ph * (H + 300) + t * sp) % (H + 300)) - 150, x = x0 - y * .12;
    knife(c, { x, y, ang: 1.69, len, wid: 3 + R() * 2.5, c: hx('#E8EEF4'), c2: hx('#FFFFFF'), seed: k, solid: true, alpha: (.28 + R() * .3) * a }, { ridge: .3 });
  }
  for (let k = 0; k < 26; k++) {   // splashes on the wet ground
    const x = R() * W, y = H * (.8 + R() * .18), per = .35 + R() * .4, u = ((t + R() * 5) % per) / per;
    if (u < .5) knife(c, { x, y, ang: 0, len: 16 + 30 * u, wid: 4, c: hx('#F6E2B8'), seed: 500 + k, solid: true, alpha: (1 - u * 2) * .6 * a });
  }
  c.restore();
}
function shot5and6(c, t) {
  const u5 = eio(seg(t, 15.88, 19.85)), u6 = eio(seg(t, 19.85, 23.85));
  const s = lerp(.82, .93, u5) + .05 * u6, cx = lerp(675, 600, u5) + 140 * u6, cy = lerp(1230, 1150, u5) + 40 * u6;
  c.save();
  const appear = seg(t, 15.88, 16.95);
  if (appear < 1) {   // paint-over: knife strokes laid over the red pool, from its centre outward
    c.fillStyle = PAL.alta; c.fillRect(0, 0, W, H);
    plateCam(c, cx, cy, s);
    const lim = appear * 1.25; for (const st of IA.strokes) { if (st.sweep > lim) break; knife(c, st); }
  } else { plateCam(c, cx, cy, s); c.drawImage(IA.img, 0, 0); }
  // gold blossoms catch the beat: a soft breathing glow on every downbeat of the chorus
  const pulse = DB.reduce((m, b) => Math.max(m, t >= b ? Math.exp(-(t - b) * 3) : 0), 0) * seg(t, 16.9, 17.2);
  if (pulse > .01) { c.globalCompositeOperation = 'lighter'; for (const [x, y, r] of IA.blossoms) { const g = c.createRadialGradient(x, y, 0, x, y, r * 3); g.addColorStop(0, `rgba(255,200,90,${.35 * pulse})`); g.addColorStop(1, 'rgba(255,160,60,0)'); c.fillStyle = g; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); } c.globalCompositeOperation = 'source-over'; }
  c.restore();
  // horizon light swells on "mana bega" (raking light on the ridges)
  const sw = ss(seg(t, 21.85, 22.6)) * (1 - ss(seg(t, 23.0, 23.85)));
  if (sw > 0) { c.save(); c.globalCompositeOperation = 'soft-light'; c.globalAlpha = .55 * sw; const g = c.createLinearGradient(W, H * .6, 0, 0); g.addColorStop(0, '#FFD27A'); g.addColorStop(1, '#3A2A40'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
  rain(c, t, ss(seg(t, 19.6, 20.2)));
}
function shot7(c, t) {
  const u = eio(seg(t, 23.85, 27.86)), s = lerp(.84, .98, u);
  c.save(); plateCam(c, 675 - 30 * u, 1050, s); c.drawImage(IB.img, 0, 0);
  // gold sparks on each beat
  const R = mulberry(31);
  BEATS.filter(b => b >= 23.85 && b < 27.86).forEach((b, i) => {
    const age = t - b; if (age < 0 || age > .55) return;
    for (let k = 0; k < 7; k++) { const a = R() * 6.28, q = 200 + R() * 220; knife(c, { x: 675 + Math.cos(a) * q, y: 1050 + Math.sin(a) * q, ang: a, len: 30 + 30 * eo(age / .55), wid: 9, c: hx('#FFE6A0'), c2: hx('#FFFFFF'), seed: i * 10 + k, solid: true, alpha: 1 - age / .55 }); }
  });
  c.restore();
  rain(c, t, .55 * (1 - seg(t, 26.5, 27.8)));
}
function shot8(c, t) {
  const u = eio(seg(t, 27.86, 31.76)), s = lerp(.98, .8, u);
  c.save();
  const appear = seg(t, 27.86, 28.95);
  if (appear < 1) { plateCam(c, 645, 1050, .98); c.drawImage(IB.img, 0, 0); plateCam(c, lerp(645, 675, u), 1050, s); const lim = appear * 1.12; for (const st of IC.strokes) { if (st.sweep > lim) break; knife(c, st); } }
  else { plateCam(c, lerp(645, 675, u), 1050, s); c.drawImage(IC.img, 0, 0); }
  c.restore();
  // the light sinks: ridges glow, then a warm dark
  const sink = ss(seg(t, 30.3, 32.1));
  if (sink > 0) {
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = mixc('#FFFFFF', '#2A1418', sink * .85); c.fillRect(0, 0, W, H); c.restore();
    const hs = s, hx0 = W / 2 + (675 - lerp(645, 675, u)) * hs, hy0 = H / 2;
    glow(c, hx0, hy0, 70, 'rgba(255,190,100,1)', .5 * sink * (1 - seg(t, 31.8, 32.2) * .6));
  }
}

// ======================= LYRICS =======================
const FONT_S = '"OdiaSerif"', FONT_B = '"OdiaBaloo"';
function lyricAt(t) { return LYR.find(l => t >= l.t0 - .05 && t < l.t1 + .3); }
function styleAt(t) { return t < 7.87 ? 'lightbox' : t < 15.88 ? 'watercolor' : 'impasto'; }
const LY = [1560, 1650];
function drawLyric(c, t) {
  const L = lyricAt(t); if (!L) return;
  const st = styleAt(L.t0 + .01), inn = seg(t, L.t0, L.t0 + .55), out = 1 - seg(t, L.t1 - .2, L.t1 + .25);
  if (out <= 0) return;
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
  const rows = [L.a, L.b].filter(Boolean);
  if (st === 'lightbox') {
    // paper strips growing from their left edge on the dark front band
    rows.forEach((s, i) => {
      c.font = `600 ${i ? 64 : 64}px ${FONT_S}`; const w = c.measureText(s).width + 70, y = LY[i] + 40;
      const g = eo(seg(t, L.t0 + i * .18, L.t0 + i * .18 + .5)), x0 = W / 2 - w / 2;
      c.save(); c.globalAlpha = out;
      c.beginPath(); c.rect(x0, y - 46, w * g, 92); c.clip();
      c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 14; c.shadowOffsetY = 6;
      c.fillStyle = '#2A100C'; c.fillRect(x0, y - 42, w, 84); c.shadowColor = 'transparent';
      c.fillStyle = 'rgba(255,190,120,.45)'; c.fillRect(x0, y - 42, w, 2.5);
      c.fillStyle = '#F7E6CC'; c.shadowColor = 'rgba(255,170,90,.35)'; c.shadowBlur = 10; c.fillText(s, W / 2, y + 2);
      c.restore();
    });
  } else if (st === 'watercolor') {
    rows.forEach((s, i) => {
      c.font = `600 66px ${FONT_S}`; const w = c.measureText(s).width, y = LY[i] + 20, x0 = W / 2 - w / 2 - 20;
      const g = seg(t, L.t0 + i * .3, L.t0 + i * .3 + .8);
      c.save(); c.globalAlpha = out;
      c.beginPath(); c.moveTo(x0, y - 60); const xe = x0 + (w + 40) * g; for (let k = 0; k <= 12; k++) c.lineTo(xe + 10 * Math.sin(k * 1.3 + t * 2), y - 60 + k * 10); c.lineTo(x0, y + 60); c.clip();
      c.lineJoin = 'round'; c.strokeStyle = rgba(PAL.cream, .9); c.lineWidth = 18; c.strokeText(s, W / 2, y);
      c.fillStyle = 'rgba(58,38,30,.9)'; c.fillText(s, W / 2, y);
      c.restore();
    });
  } else {
    // a calm dark knife plane, then crisp cream type
    const R = mulberry(Math.round(L.t0 * 100)), g = eo(seg(t, L.t0, L.t0 + .35));
    c.save(); c.globalAlpha = out;
    const yc = rows.length > 1 ? 1612 : 1566, hh = rows.length > 1 ? 200 : 110; for (let k = 0; k < 14; k++) { const row = k % 2, x = W / 2 - 360 + (k >> 1) * 120 + R() * 30; knife(c, { x, y: yc + (row - .5) * hh * .45 + R() * 14, ang: R() * .16 - .08, len: 200 + R() * 70, wid: hh * .62, c: hx('#2A1418'), c2: hx('#4A2420'), seed: k + 7, alpha: .5 * clamp(g * 14 - k) }, { ridge: .35 }); }
    rows.forEach((s, i) => {
      c.font = `600 70px ${FONT_B}`; const y = (rows.length > 1 ? LY[i] + 18 : LY[0] + 6);
      c.globalAlpha = out * seg(t, L.t0 + .2 + i * .15, L.t0 + .55 + i * .15);
      c.fillStyle = '#F6E3C2'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 8; c.fillText(s, W / 2, y);
    });
    c.restore();
  }
  c.restore();
}
window.TEXTS = t => {
  const L = lyricAt(t); if (!L || t < L.t0 + .6 || t > L.t1 - .2) return [];
  return [{ id: 'lyr' + L.t0, text: L.a + ' ' + L.b, x0: 120, y0: 1480, x1: 960, y1: 1720 }];
};

// ======================= RENDER =======================
window.DUR = DUR;
window.render = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  if (t < 3.87) shot1(ctx, t);
  else if (t < 4.45) {   // dissolve: one lamp to the next
    shot1(ctx, t); const a = ss(seg(t, 3.87, 4.45));
    const tmp = window.__tmp || (window.__tmp = cvs(W, H)); const x = tmp.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); shot2(x, t);
    ctx.globalAlpha = a; ctx.drawImage(tmp, 0, 0); ctx.globalAlpha = 1;
  }
  else if (t < 7.87) shot2(ctx, t);
  else if (t < 11.85) {
    shot3(ctx, t);
    const wo = 1 - ss(seg(t, 7.87, 8.35)); if (wo > 0) { ctx.save(); ctx.globalAlpha = wo; ctx.fillStyle = PAL.cream; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  else if (t < 15.88) {
    if (t < 12.3) {   // brush-edge wipe: the tree sheet slides in from the right over the feet
      shot3(ctx, t); const p = eio(seg(t, 11.85, 12.3)), tmp = window.__tmp || (window.__tmp = cvs(W, H)), x = tmp.getContext('2d');
      x.setTransform(1, 0, 0, 1, 0, 0); shot4(x, t);
      ctx.save(); ctx.beginPath(); const ex = W * (1 - p) - 40; ctx.moveTo(W + 10, 0); ctx.lineTo(ex, 0); for (let k = 0; k <= 24; k++) ctx.lineTo(ex + 40 * Math.sin(k * 1.1) * (1 - p * .5), k * H / 24); ctx.lineTo(W + 10, H); ctx.clip(); ctx.drawImage(tmp, 0, 0); ctx.restore();
    } else shot4(ctx, t);
  }
  else if (t < 23.85) shot5and6(ctx, t);
  else if (t < 27.86) shot7(ctx, t);
  else shot8(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // a gentle vignette everywhere (one lens for one film)
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(20,6,6,0)'); v.addColorStop(1, 'rgba(20,6,6,.32)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  drawLyric(ctx, t);
};
window.EV = SHOTS.map(s => ({ t: s.t0, type: 'shot', id: s.id, style: s.style }));

(async () => {
  const base = new URL('.', import.meta.url).href;
  const [paperImg, fibre, pulp] = await Promise.all([load(base + 'assets/paper.jpg'), load(base + 'assets/fibre.png'), load(base + 'assets/pulp.png')]);
  PAPER = paperImg;
  await Promise.all([document.fonts.load(`600 64px ${FONT_S}`, 'ଆଲୋ'), document.fonts.load(`600 70px ${FONT_B}`, 'ଆଲୋ')]);
  initLightbox(fibre, pulp);
  buildLightbox(); buildWatercolor(); buildImpasto();
  window.render(Number(Q.get('t') || 0));
  window.READY = true;
})();
