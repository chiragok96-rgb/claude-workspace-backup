// "Aa Ka Ma Bai" — Boita Bandana. Voice-locked to audio/vo.mp3 (52.6 s; the song 0–3.7 s). Loops.
// Counting is the spine: four syllables → four months → a voyage's tally → a mother's fingers → festivals → a waiting list → kilometres home.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk, load } from './common.js';
import { initRiver, river, dangas, danga, sailSylPos, FOUR, HZ } from './sc_river.js';
import { FOUR_IDX, MONTHS } from './sc_count.js';
import { initModern } from './sc_modern.js';
import { initMoon, moon, skySea, moonPath, boita, ghat, mother, handVsMoon, MOON_X, MOON_Y } from './sc_moon.js';
import { train, windowWL } from './sc_train.js';
import { room, kneelingMother, child } from './sc_home.js';
import { initIndia, india } from './sc_india.js';
import { motherStanding, motherKneeling, girlKneeling } from './sc_people.js';
import { dawnGhat } from './sc_dawn.js';
const Q = new URLSearchParams(location.search), cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const DUR = 53.6; window.DUR = DUR;
const tl = t => (t < 26 ? t : t - DUR);   // the clock for things seen at both ends of the loop
const BG = '#120b09';
const SYL = ['ଆ', 'କା', 'ମା', 'ବୈ'], NAME_T = [9.41, 10.35, 11.34, 12.25];
// ———————————————— captions ————————————————
const CAPS = [
  [3.85, 5.15, ['We’ve sung it since childhood…'], 'dark'],
  [5.5, 9.0, ['but these four letters are', 'the names of four *months*.'], 'dark'],
  [9.3, 13.3, ['Ashadha, Kartika, Magha, *Baisakha*.'], 'dark'],
  [13.45, 16.95, ['Many believe it was the *tally*', 'of the Sadhabas’ voyages.'], 'dark'],
  [17.0, 19.35, ['Do you know who kept this tally?'], 'dark'],
  [19.6, 21.4, ['A *mother*, standing at the ghat…'], 'dark'],
  [21.5, 24.45, ['after the boita left,', 'counting the months on her *fingers*.'], 'dark'],
  [24.7, 26.05, ['Today, there is no boita.'], 'dark'],
  [26.15, 30.6, ['There’s a *waiting-list* ticket—', 'Bengaluru, Pune, Hyderabad.'], 'dark'],
  [30.9, 34.95, ['But Maa still counts—', 'not months, but *festivals*.'], 'dark'],
  [35.3, 39.0, ['“Couldn’t make it for Dussehra…', 'not for Diwali either…”'], 'dark'],
  [39.5, 43.45, ['On the phone, Maa said—', '“It’s okay, you’ll come for *Raja*, won’t you?”'], 'dark'],
  [43.9, 47.25, ['The boat we float…', 'isn’t a game.'], 'dark'],
  [47.4, 48.95, ['It’s a *prayer* to come home.'], 'dark'],
  [49.1, 52.9, ['And you?', 'How far from *home* are you today?'], 'dark'],
];
function capLine(c, ln, y, sz = 1) {
  const parts = ln.split('*'), fnt = j => j % 2 ? `italic 600 ${Math.round(56 * sz)}px "CormorantG"` : `600 ${Math.round(50 * sz)}px "CormorantG"`;
  c.letterSpacing = '0.5px'; const ws = parts.map((p, j) => { c.font = fnt(j); return c.measureText(p).width; }); let x = 540 - ws.reduce((a, b) => a + b, 0) / 2;
  parts.forEach((p, j) => { if (!p) return; c.font = fnt(j); c.fillStyle = j % 2 ? '#f0c672' : '#f6ecdc'; c.shadowColor = 'rgba(8,3,2,.85)'; c.shadowBlur = 10; c.shadowOffsetY = 1.5; c.fillText(p, x, y); c.shadowBlur = 3; c.shadowOffsetY = 0; c.fillText(p, x, y); c.shadowBlur = 0; c.fillText(p, x, y); x += ws[j]; });
}
function captions(c, t) {
  if (Q.get('cap') === '0') return;
  for (const [a, b, lines] of CAPS) { const k = ss(seg(t, a - .05, a + .3)) * (1 - ss(seg(t, b - .28, b + .02))); if (k <= 0) continue;
    c.save(); c.globalAlpha = k; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; const dy = (1 - eo(seg(t, a - .05, a + .5))) * 10;
    lines.forEach((ln, i) => capLine(c, ln, 1452 - (lines.length - 1 - i) * 62 + dy, ln.length > 38 ? .92 : 1)); c.restore(); }
}
// ———————————————— scenes (one world: the river, the sky, the sea, the ghat, a train, a home, the river again) ————————————————
const FLAME = [753, 1129];   // the front danga's diya: the first frame is this flame, close
function zoomAt(c, cx, cy, z) { c.translate(cx, cy); c.scale(z, z); c.translate(-cx, -cy); }
const hookCam = tt => { const k = eio(clamp((tt + .8) / 6.2)), m = ss(seg(tt, 2.4, 5.4)); return [lerp(540, 420, m), lerp(1000, 830, m), 1 + .3 * k]; };   // a slow low glide over the water toward the far ghat
function riverScene(c, t, o = {}) {
  const tt = tl(t), [cx, cy, z] = hookCam(tt); c.save(); zoomAt(c, cx, cy, z); river(c, tt); dangas(c, tt, { sylA: o.sylA ?? 1, litK: 1 }); c.restore(); bokehFG(c, tt, o.fg ?? 1);
}
const camPt = (tt, [x, y, sz]) => { const [cx, cy, z] = hookCam(tt); return [cx + (x - cx) * z, cy + (y - cy) * z, sz * z]; };
const FG = Array.from({ length: 12 }, (_, i) => ({ t0: -1.9 + i * .58 + hh(i * 3) * .3, dur: 2.4 + hh(i * 5) * 1.2, an: (hh(i * 7) - .5) * 2.6, r0: 26 + hh(i * 9) * 26, warm: hh(i * 11) }));
function bokehFG(c, tt, a = 1) {   // lamps floating past the lens, out of focus: we are gliding low over the water
  if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter';
  for (const f of FG) { const p = (tt - f.t0) / f.dur; if (p <= 0 || p >= 1) continue; const q = p * p, d = lerp(140, 1300, q), x = 540 + Math.sin(f.an) * d, y = 880 + Math.cos(f.an) * d * .85, r = lerp(f.r0, f.r0 * 4, q), al = a * Math.sin(Math.PI * p) * .6;
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,${170 + 40 * f.warm},${90 + 30 * f.warm},${.42 * al})`); g.addColorStop(.75, `rgba(255,${160 + 40 * f.warm},80,${.36 * al})`); g.addColorStop(.92, `rgba(255,200,130,${.3 * al})`); g.addColorStop(1, 'rgba(255,190,110,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
  c.restore();
}
function moonsAndSea(c, t) {   // 5.3–19.4: the syllables become four moons; the sea below; the boita sails under them; the shore slides in
  const up = ss(seg(t, 5.3, 8.4)), down = eio(seg(t, 13.4, 15.2)), pan = eio(seg(t, 16.9, 19.3));
  const hz = lerp(1650, 1180, down);
  skySea(c, t, { hz, warm: lerp(.55, 0, up) });
  const rv = ss(seg(t, 5.3, 6.1)); if (rv < 1) { c.save(); c.globalAlpha = 1 - rv; c.translate(0, up * 900);   // the river falls away fast, clear of the caption
    riverScene(c, t, { sylA: 1 - ss(seg(t, 5.3, 5.6)) }); c.restore(); }   // the river sinks away as we look up
  const my = MOON_Y.map(y => y - down * 140), phaseT = seg(t, 14.0, 17.4);
  MOON_X.forEach((mx, k) => {   // each syllable flies up and becomes a moon; on its word it names its month
    const f = eio(seg(t, 5.35 + k * .4, 7.4 + k * .4)), [sx, sy, sz] = camPt(tl(t), sailSylPos(k, tl(t))), x = lerp(sx, mx, f) - pan * 900, y = lerp(Math.min(sy + up * 900, 1180), my[k], f) - Math.sin(f * Math.PI) * (k ? 120 : 300);
    const disc = ss(seg(t, 6.9 + k * .4, 7.9 + k * .4)), r = lerp(10, 62, disc);
    moon(c, x, y, r, disc, 1, 1);
    if (disc < 1) { c.save(); c.globalAlpha = 1 - disc; c.font = `700 ${lerp(sz, 70, f)}px "OdiaSerif"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = 'rgba(255,180,80,1)'; c.shadowBlur = 28; c.fillStyle = '#ffd890'; c.fillText(SYL[k], x, y); c.restore(); }
    const nm = ss(seg(t, NAME_T[k] - .05, NAME_T[k] + .4)) * (1 - ss(seg(t, 16.6, 17.4))); if (nm > 0) { c.save(); c.globalAlpha = nm; c.font = '700 42px "OdiaSerif"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = 'rgba(0,0,0,.9)'; c.shadowBlur = 14; c.fillStyle = '#ffe2a6'; c.fillText(MONTHS[FOUR_IDX[k]], x, y + 112 + (1 - eo(nm)) * 10); c.restore(); }
  });
  if (down > 0) { moonPath(c, t, 540 - pan * 900, hz, 62, down * .8);
    const bx = lerp(-380, 600, eio(seg(t, 13.6, 17.0))) + pan * 500, bs = lerp(.85, .32, pan); boita(c, bx, hz + 90 - pan * 60, bs, t, down);   // the boita sails beneath the moons
    for (let k = 0; k < 8; k++) { const tk = 14.0 + k * .4; const m = seg(t, tk, tk + 1.6); if (m <= 0 || m >= 1) continue; const an = Math.PI * (1 - m); moon(c, 540 + Math.cos(an) * 560 - pan * 900, hz - Math.sin(an) * 520, 26, Math.sin(m * Math.PI) * .7 * down, 1, .4); }   // moons rising and setting: months passing
    if (pan > 0) { ghat(c, t, lerp(-1200, -60, pan), hz, 1); motherStanding(c, lerp(-1200, -60, pan) + 430, hz + 42, .92, { a: ss(seg(t, 18.2, 19.0)), t, wind: 1, rimCol: '255,236,206', shade: .7 }); } }   // the shore, and a mother on its steps
}
function handScene(c, t) {   // 21.4–26: her hand against the moon; fingers fold as the moon wanes and waxes — a month each
  skySea(c, t, { hz: 1500, warm: 0 });
  const cyc = seg(t, 21.9, 24.3) * 4, ph = .5 + .5 * Math.cos((cyc % 1) * Math.PI * 2), sink = eio(seg(t, 24.8, 26.0));
  const my = lerp(760, 1300, sink), r = lerp(300, 120, sink);
  moon(c, 540, my, r, 1, t < 24.4 ? ph : 1, 1);
  handVsMoon(c, t, 540, 760 + eio(seg(t, 24.5, 25.2)) * 900, 300, clamp(cyc), 1 - ss(seg(t, 24.6, 25.1)));
  const gl = Math.exp(-Math.pow((t - 26.05) / .25, 2)); if (gl > .01) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(540, my, 0, 540, my, 1000); g.addColorStop(0, `rgba(255,248,226,${gl})`); g.addColorStop(.3, `rgba(255,220,170,${.5 * gl})`); g.addColorStop(1, 'rgba(255,200,140,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }   // the moon becomes a headlight
}
const COACH_L = 1120, P0 = 3 * COACH_L + COACH_L / 2 - 540;   // each coach wider than the frame: one whole board at a time
const trainPan = t => t < 28.0 ? P0 - 360 * (1 - eo(seg(t, 27.2, 28.0))) : t < 28.88 ? lerp(P0, P0 + COACH_L, eio(seg(t, 28.45, 28.88))) : lerp(P0 + COACH_L, P0 + 2 * COACH_L, eio(seg(t, 29.15, 29.55)));
function trainScene(c, t) {
  const wl = 1 - ss(seg(t, 27.4, 27.95));
  train(c, t, { pan: trainPan(t), plates: [['ବେଙ୍ଗାଲୁରୁ', 'BENGALURU'], ['ପୁଣେ', 'PUNE'], ['ହାଇଦ୍ରାବାଦ', 'HYDERABAD']], glare: Math.exp(-Math.pow((t - 26.1) / .3, 2)) * .9 });
  if (wl > 0) windowWL(c, t, wl, lerp(1, 2.2, ss(seg(t, 27.4, 27.95))) * lerp(1.06, 1, seg(t, 26.1, 27.4)));
  const into = eio(seg(t, 30.0, 30.9)); if (into > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,200,120,${into * .6})`; c.fillRect(0, 0, W, H); c.restore(); }
}
const MK = { oct: { 2: { type: 'x', p: 0 } } };
function homeScene(c, t) {
  let view = { name: 'night' }; if (t > 35.3) view = { name: 'dussehra' }; if (t > 37.4) view = { name: 'diwali' }; if (t > 39.7) view = { name: 'rain' }; if (t > 43.4) view = { name: 'dawn' };
  const marks = { oct: { 20: { type: 'x', p: seg(t, 36.0, 36.8) } }, nov: { 8: { type: 'x', p: seg(t, 38.0, 38.8) } }, jun: { 14: { type: 'o', p: seg(t, 42.1, 43.0) }, 15: { type: 'o', p: seg(t, 42.3, 43.1) } } };
  let cal = { page: 'oct', marks: marks.oct };
  if (t > 37.0) cal = t < 37.6 ? { from: 'oct', to: 'nov', turn: seg(t, 37.0, 37.6), mFrom: marks.oct, mTo: marks.nov } : { page: 'nov', marks: marks.nov };
  if (t > 41.2) cal = t < 41.8 ? { from: 'nov', to: 'jun', turn: seg(t, 41.2, 41.8), mFrom: marks.nov, mTo: marks.jun } : { page: 'jun', marks: marks.jun };
  const zc = ss(seg(t, 35.7, 36.2)) * (1 - ss(seg(t, 38.9, 39.4))) + ss(seg(t, 41.1, 41.5)) * (1 - ss(seg(t, 43.1, 43.5)));   // lean toward the calendar for each mark
  const thru = eio(seg(t, 43.6, 44.6));   // at dawn, through the window to the ghat
  c.save(); zoomAt(c, lerp(lerp(660, 190, zc), 876.6, thru), lerp(lerp(640, 1030, zc), 785.7, thru), lerp(1, 1.9, zc) * lerp(1, 2.45, thru));   // through the window: its temple lands exactly where the dawn shot's temple stands
  room(c, t, { view, cal, phoneGlow: ss(seg(t, 39.6, 40.0)) * (1 - ss(seg(t, 43.0, 43.5))), fig: 1 - ss(seg(t, 43.4, 43.9)) });   // she steps away from the window as dawn comes
  c.restore();
}
function ghatDawnScene(c, t) {   // 44–49.8: dawn at the water's edge; she and her daughter; the danga goes onto the water and drifts toward the sun
  const push = lerp(1.0, 1.07, seg(t, 44.0, 49.8)); c.save(); zoomAt(c, 640, 1000, push);
  dawnGhat(c, t, { place: seg(t, 46.0, 47.3), release: seg(t, 46.9, 47.6), drift: seg(t, 47.3, 50.6) }); c.restore();
}
function homeMap(c, t) {   // 49–53.6: we rise from the river into the night; the river becomes the map
  india(c, t, { threads: seg(t, 49.5, 51.6), labels: ss(seg(t, 50.3, 50.9)), odisha: 1, z: lerp(1, 1.12, seg(t, 49.2, 52.9)) });
}
let GRAIN; function grain(c, t) {   // a fine film grain over everything, so every style sits on the same stock
  if (!GRAIN) { GRAIN = mk(512, 512); const g = GRAIN.getContext('2d'), d = g.createImageData(512, 512); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
  const f = Math.floor(t * 30), ox = (f * 197) % 512, oy = (f * 311) % 512; c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .07; c.fillStyle = c.createPattern(GRAIN, 'repeat'); c.translate(-ox, -oy); c.fillRect(ox, oy, W, H); c.restore();
}
// ———————————————— the frame ————————————————
window.render = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  if (Q.get('lab') === 'dawn') { ghatDawnScene(ctx, t); captions(ctx, t); return; }
  if (Q.get('lab') === 'macro') { riverScene(ctx, t); return; }
  if (Q.get('lab') === 'people') { ctx.fillStyle = '#3a2a2a'; ctx.fillRect(0, 0, W, H); motherStanding(ctx, 300, 900, 1.3, { t, rim: 1 }); motherKneeling(ctx, 260, 1800, 1.3, { t, lean: t % 2 }); girlKneeling(ctx, 700, 1800, 1.3, { t }); return; }
  try {
    if (t < 5.4) riverScene(ctx, t);
    if (t >= 5.3 && t < 21.6) moonsAndSea(ctx, t);
    if (t >= 20.9 && t < 26.5) { ctx.save(); ctx.globalAlpha = ss(seg(t, 20.9, 21.7)); handScene(ctx, t); ctx.restore(); }
    if (t >= 25.9 && t < 31.0) { ctx.save(); ctx.globalAlpha = ss(seg(t, 25.9, 26.2)); trainScene(ctx, t); ctx.restore(); }
    if (t >= 30.4 && t < 44.8) { ctx.save(); ctx.globalAlpha = ss(seg(t, 30.4, 31.1)); homeScene(ctx, t); ctx.restore(); }
    if (t >= 44.2 && t < 49.8) { ctx.save(); ctx.globalAlpha = ss(seg(t, 44.2, 44.8)); ghatDawnScene(ctx, t); ctx.restore(); }
    if (t >= 49.0 && t < 53.6) { ctx.save(); ctx.globalAlpha = ss(seg(t, 49.0, 49.8)); homeMap(ctx, t); ctx.restore(); }
    if (t >= 52.8) { ctx.save(); ctx.globalAlpha = ss(seg(t, 52.8, 53.6)); riverScene(ctx, t); ctx.restore(); }   // Cuttack's light falls back into the river
    grain(ctx, t);
    captions(ctx, t);
  } catch (e) { console.error('RENDER ' + e.stack); throw e; }
};
(async () => {
  for (const f of ['600 26px "Cinzel"', 'italic 600 56px "CormorantG"', '600 50px "CormorantG"', '700 52px "OdiaSerif"', '600 24px "OdiaSerif"', '700 46px "InterT"']) await document.fonts.load(f, f.includes('Odia') ? 'ଆକାମାବୈଆଷାଢ଼କାର୍ତ୍ତିକ' : 'Aa');
  const base = new URL('.', import.meta.url).href;
  initRiver(); initModern(); initMoon(); initIndia(await (await fetch(base + 'geo/india_states.json')).json());
  if (Q.get('t')) window.render(+Q.get('t'));
  window.READY = true;
})();
