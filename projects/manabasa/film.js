// Manabasa Gurubara — the Lakshmi Purana in 55 seconds. Voice-locked to audio/vo.mp3 (55.7 s). Loops.
// Rice is the thread: 56 bowls → empty bowls → a lamp that becomes the sun → a lane of shut doors → a grain → the rice-paste jhoti →
// Lakshmi's footsteps → the temple's shut door → twelve lamps out → a fistful of nothing → the one lit door → a meal that glows →
// the door opens → one ring of leaves, every hand → the palm-leaf book → the lamp again.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
import { initBhoga, bhoga } from './sc_bhoga.js';
import { wall } from './sc_lane.js';
import { initJhoti, floor, foot, THRESH } from './sc_jhoti.js';
import { dark, glow, lamp, templeDoor, idol, raisedHand, riceFall, twelveLamps } from './sc_temple.js';
import { leafMeal, anandaBazar, sharedMeal, palmLeaf } from './sc_end.js';
import { sanctum, templeNight, hearth, devotees, kudua, shriyaDoor } from './sc_new.js';
import { fiftySix, shadowPlay, anandaRow, BLOW } from './sc_final.js';
const Q = new URLSearchParams(location.search), cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const DUR = 55.8; window.DUR = DUR;
function zoomAt(c, cx, cy, z) { c.translate(cx, cy); c.scale(z, z); c.translate(-cx, -cy); }
const flash = (c, t, t0, w, a = .9, col = '255,226,170', x = 540, y = 960, r = 1400) => { const f = Math.exp(-Math.pow((t - t0) / w, 2)) * a; if (f < .01) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${f})`); g.addColorStop(1, `rgba(${col},${f * .25})`); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); };
// ———————————————— captions ————————————————
const CAPS = [
  [0.1, 2.75, ['The Jagannath we offer', '*fifty-six* bhogas…'], 'dark'],
  [3.0, 5.45, ['once wandered door to door,', '*hungry*.'], 'dark'],
  [5.75, 6.6, ['*Why?*'], 'dark'],
  [6.9, 9.0, ['Margashira. Manabasa *Gurubara*.'], 'dark'],
  [9.2, 10.95, ['Lakshmi went to *Shriya’s* home—'], 'dark'],
  [11.2, 13.25, ['a woman society called', '*untouchable*.'], 'dark'],
  [13.45, 15.8, ['She swept her home clean', 'and *invited* Lakshmi in.'], 'dark'],
  [16.2, 18.15, ['On her way back,', '*Balabhadra* stopped her—'], 'dark'],
  [18.3, 19.5, ['“You come from *that* house?”'], 'dark'],
  [19.65, 21.3, ['“You shall not enter the *temple*.”'], 'dark'],
  [21.5, 23.3, ['Humiliated, Lakshmi *spoke*—'], 'dark'],
  [23.45, 26.55, ['“For twelve years, not even', 'a *fistful* of rice.”'], 'dark'],
  [26.75, 30.2, ['At last, the two brothers were fed', 'by such a *house*…'], 'dark'],
  [30.45, 32.5, ['where no one would *set foot*.'], 'dark'],
  [32.85, 35.35, ['From the first *morsel*,', 'Jagannath knew—'], 'dark'],
  [35.55, 37.45, ['this cooking was *Lakshmi’s*.'], 'dark'],
  [37.75, 40.1, ['Lakshmi returned,', 'on one *condition*—'], 'dark'],
  [40.3, 43.1, ['at Mahaprasad, there will be', 'no *caste*.'], 'dark'],
  [43.3, 45.8, ['Even today, at Srimandir’s', '*Ananda Bazar*,'], 'dark'],
  [45.85, 48.8, ['devotees of every caste', 'eat abadha *together*.'], 'dark'],
  [49.05, 51.65, ['The lesson our society', 'still *needs*…'], 'dark'],
  [51.85, 55.5, ['our Lakshmi Purana gave', '*centuries* ago.'], 'dark'],
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
// ———————————————— scenes ————————————————
function sBhoga(c, t) {   // 0–3.3: Jagannath in the dark; fifty-six diyas ignite in a golden spiral round him; one gust blows them all out
  const tt = t > 50 ? t - DUR : t; fiftySix(c, tt, { zoom: lerp(1.12, 1, eio(seg(tt, -.6, 2.6))) });
}
const SHADOW_X = t => lerp(-260, 1100, seg(t, 3.0, 5.45));
const DOORX = (i, pan) => i * 620 - pan + 160 + 150;
function sWall(c, t) {   // 3.1–6.5: the lamp becomes the sun on a wall of doors; the brothers' shadows glide; each door shuts; a grain falls; we tilt down
  const pan = lerp(0, 520, eio(seg(t, 3.0, 5.6))), tilt = eio(seg(t, 5.55, 6.45)), xs = SHADOW_X(t);
  c.save(); c.translate(0, -560 * tilt);
  wall(c, t, { pan, shut: i => ss(clamp((xs - DOORX(i, pan) + 140) / 120)), shadows: [{ x: xs - 300, who: 'B', bob: 5 * Math.abs(Math.sin(t * 4.2)) }, { x: xs, who: 'J', bob: 5 * Math.abs(Math.sin(t * 4.2 + 1.2)) }] });
  c.restore();
  const gy = lerp(-60, 960, Math.pow(seg(t, 5.55, 6.45), 1.6)); if (t > 5.55 && t < 6.5) { c.save(); c.translate(540, gy); c.rotate(t * 3); c.fillStyle = '#fffdf6'; c.beginPath(); c.ellipse(0, 0, 9, 3.6, 0, 0, 7); c.fill(); c.restore(); glow(c, 540, gy, 60, .6, '255,240,210'); }   // one grain of rice, slow
}
function sShriya(c, t) { shriyaDoor(c, t, { draw: seg(t, 13.7, 15.0), gold: seg(t, 15.0, 15.9) }); }
function sJhoti(c, t) {   // 6.45–16.9: the grain's ripple opens the jhoti floor; the mandala and the Mana; Lakshmi's steps to Shriya's door; her broom, her hand, her lamp
  const camY = t < 9.2 ? 0 : t < 13.2 ? lerp(0, THRESH + 320, eio(seg(t, 9.2, 12.4))) : lerp(THRESH + 320, THRESH - 60, eio(seg(t, 13.2, 14.4))) + lerp(0, 600, eio(seg(t, 15.9, 16.9)));
  const z = t < 9.2 ? lerp(1.05, .95, seg(t, 6.45, 9.2)) : t < 13.2 ? lerp(.95, .8, eio(seg(t, 9.2, 11))) : lerp(.8, 1.02, eio(seg(t, 13.2, 14.4)));
  floor(c, t, { cam: [0, camY], z, mandala: seg(t, 6.55, 8.9), ripple: seg(t, 6.45, 7.6), manaA: ss(seg(t, 6.6, 7.3)), lakshmi: seg(t, 9.3, 12.6), others: seg(t, 10.9, 12.9), sweep: seg(t, 13.45, 14.25), draw: seg(t, 14.15, 15.55), gold: seg(t, 15.0, 15.9), back: seg(t, 16.0, 16.9) });
  const tl = ss(seg(t, 7.0, 7.5)) * (1 - ss(seg(t, 9.0, 9.4)));   // the day's name, in gold
  if (tl > 0) { c.save(); c.globalAlpha *= tl; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = 'rgba(40,8,0,.9)'; c.shadowBlur = 18;
    c.font = '600 34px "OdiaSerif"'; c.fillStyle = '#f4dca0'; c.fillText('ମାର୍ଗଶିର', 540, 330 + (1 - eo(tl)) * 12); c.font = '700 82px "OdiaSerif"'; const g = c.createLinearGradient(0, 360, 0, 460); g.addColorStop(0, '#fff0c0'); g.addColorStop(1, '#e0a840'); c.fillStyle = g; c.fillText('ମାଣବସା ଗୁରୁବାର', 540, 410 + (1 - eo(tl)) * 12); c.restore(); }
}
function sTemple(c, t) {   // 16.5–21.3: night; Lakshmi at the temple door, Balabhadra's face above it; "that house?"; the doors slam
  templeNight(c, t, { shut: eio(seg(t, 19.7, 20.15)), bala: ss(seg(t, 16.8, 17.6)), stern: ss(seg(t, 18.2, 18.8)), lakshmiA: ss(seg(t, 16.6, 17.1)) });
  flash(c, t, 20.16, .08, .35, '255,220,180');
}
function sCurse(c, t) {   // 21.3–26.8: the curse as a shadow play — Lakshmi a carved puppet on a glowing cloth; she lifts her hand; the twelve lamps behind go out; a fistful of rice runs away
  const a = ss(seg(t, 21.35, 21.6)) * (1 - ss(seg(t, 24.5, 24.9)));
  if (t < 21.6) templeNight(c, t, { shut: 1, bala: 1 - ss(seg(t, 21.3, 21.6)) });
  shadowPlay(c, t, { a, press: seg(t, 21.4, 21.9), raise: seg(t, 21.9, 22.6), fire: ss(seg(t, 22.2, 22.9)) * (1 - ss(seg(t, 23.3, 24.0))), out: seg(t, 23.4, 24.55) });
  if (t > 24.5) { c.save(); c.globalAlpha *= ss(seg(t, 24.5, 24.9)); dark(c, t, { warm: .35 }); c.restore(); }
  riceFall(c, t, 540, 420, seg(t, 24.75, 26.6), { wind: ss(seg(t, 25.6, 26.6)) * 1.4, s: 1.15, a: ss(seg(t, 24.6, 24.85)) });
}
function sDusk(c, t) {   // 26.6–32.9: the same lane at dusk, every door shut; their shadows, slower now; one door lit at the end; we go in
  const pan = lerp(1300, 2250, eio(seg(t, 26.6, 31.2))), xs = lerp(-240, 470, seg(t, 26.7, 31.6)), into = eio(seg(t, 31.7, 32.9));
  const door = 4, dx = DOORX(door, pan);
  c.save(); zoomAt(c, dx, 1100, Math.exp(Math.log(5) * into));
  wall(c, t, { pan, dusk: 1, shut: i => i === door ? 0 : 1, openDoor: door, lit: ss(seg(t, 28.2, 29.4)), shadows: [{ x: xs - 280, who: 'B', bob: 3 * Math.abs(Math.sin(t * 3)) }, { x: xs, who: 'J', bob: 3 * Math.abs(Math.sin(t * 3 + 1.2)) }] });
  c.restore(); flash(c, t, 32.85, .25, .8, '255,200,130');
}
function sMeal(c, t) {   // 32.7–37.6: inside the lit house: Lakshmi in a plain sari at a clay hearth; Jagannath's eyes widen; the steam turns gold and her steps rise from it
  const face = ss(seg(t, 33.9, 34.25)) * (1 - ss(seg(t, 35.35, 35.7)));
  hearth(c, t, { gold: seg(t, 35.6, 37.2) });
  if (face > 0) { c.save(); c.globalAlpha *= face; dark(c, t, { warm: 1.1 }); idol(c, t, 540, 860, 1.55, 'J', { wide: ss(seg(t, 34.4, 34.95)) }); glow(c, 540, 1500, 700, .6); c.restore(); }
}
function sReturn(c, t) {   // 37.5–40.4: the temple door opens on light; her golden steps go in
  dark(c, t); const op = eio(seg(t, 37.8, 38.7)); templeDoor(c, t, { shut: 1 - op, x: 540, y: 1360, s: .95, inner: 1.3 });
  lamp(c, t, 190, 1380, 1.1); lamp(c, t, 890, 1380, 1.1, 1, 2);
  for (let k = 0; k < 6; k++) foot(c, 540 + (k % 2 ? 30 : -30), 1720 - k * 80, -Math.PI / 2, 1.05 - k * .08, k % 2 === 0, ss(seg(t, 38.4 + k * .2, 38.8 + k * .2)), '255,214,130', .55);
  flash(c, t, 40.35, .3, .7, '255,214,150');
}
function sShare(c, t) {   // 40.2–49.2: "no caste": the lines that divide the floor dissolve and every footprint gathers round one pot — then Ananda Bazar today, a row of every kind of devotee
  const bazar = ss(seg(t, 43.1, 43.6));
  if (bazar < 1) { dark(c, t, { warm: .9 }); const g = ss(seg(t, 41.0, 42.8));
    c.save(); c.translate(540, 900); kudua(c, 0, 20, 110, 1.1); c.restore();
    for (let k = 0; k < 24; k++) { const grp = k % 3, a0 = grp * 2.094 + (Math.floor(k / 3) - 3.5) * .16 - Math.PI / 2, a1 = k / 24 * 6.283 - Math.PI / 2, a = lerp(a0, a1, g), r = lerp(420 + (Math.floor(k / 3) % 2) * 70, 300, g);
      foot(c, 540 + Math.cos(a) * r, 900 + Math.sin(a) * r, a + Math.PI, .7 + .25 * hh(k), k % 2 === 0, 1, k % 3 === 0 ? '246,240,226' : k % 3 === 1 ? '230,200,150' : '210,190,170', .3); }
    c.save(); c.globalAlpha *= 1 - ss(seg(t, 41.0, 42.0)); c.strokeStyle = '#c4201a'; c.lineWidth = 8; c.setLineDash([3, 14]); c.lineCap = 'round'; for (let k = 0; k < 3; k++) { const a = k * 2.094 + 1.047 - Math.PI / 2; c.beginPath(); c.moveTo(540 + Math.cos(a) * 160, 900 + Math.sin(a) * 160); c.lineTo(540 + Math.cos(a) * 640, 900 + Math.sin(a) * 640); c.stroke(); } c.restore();   // the lines that divided them
    for (let k = 0; k < 5; k++) foot(c, 540 + (k % 2 ? 24 : -24), 1600 - k * 110, -Math.PI / 2, .9, k % 2 === 0, ss(seg(t, 40.3 + k * .15, 40.7 + k * .15)), '255,214,130', .55); }   // her steps
  if (bazar > 0) { c.save(); c.globalAlpha *= bazar; anandaRow(c, t, { pan: lerp(-60, 520, seg(t, 43.2, 49.2)) }); c.restore(); }
}
function sPalm(c, t) {   // 49.0–55.8: the palm-leaf book; the line is engraved; the lamp; we return to the first lamp
  const end = eio(seg(t, 54.7, 55.8)); c.save(); c.translate(17 * end, -536 * end);   // the book's lamp rises to where the first of the fifty-six diyas will be lit
  palmLeaf(c, t, { write: seg(t, 49.6, 53.5), z: lerp(1.08, 1, seg(t, 49, 54)) }); c.restore();
}
let GRAIN; function grain(c, t) {   // a fine film grain over everything, so every style sits on the same stock
  if (!GRAIN) { GRAIN = mk(512, 512); const g = GRAIN.getContext('2d'), d = g.createImageData(512, 512); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (hh(i * .25 + .5) - .5) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
  const f = Math.floor(t * 30), ox = (f * 197) % 512, oy = (f * 311) % 512; c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .07; c.fillStyle = c.createPattern(GRAIN, 'repeat'); c.translate(-ox, -oy); c.fillRect(ox, oy, W, H); c.restore();
}
// ———————————————— the frame ————————————————
window.render = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  try {
    const L = (a, b, fa, fb, fn) => { if (t < a || t >= b) return; ctx.save(); ctx.globalAlpha = fa < fb ? ss(seg(t, fa, fb)) : 1; fn(ctx, t); ctx.restore(); };
    if (t < 3.45) sBhoga(ctx, t);
    L(3.12, 6.55, 3.12, 3.45, sWall);
    L(6.45, 13.8, 6.45, 6.46, (c, t) => { c.save(); if (t < 7.6) { const r = 1500 * eo(seg(t, 6.45, 7.5)); c.beginPath(); c.arc(540, 960, Math.max(1, r), 0, 7); c.clip(); } sJhoti(c, t); c.restore(); });
    L(13.35, 16.75, 13.35, 13.7, sShriya);
    L(16.2, 21.4, 16.2, 16.7, sTemple);
    L(21.3, 26.9, 21.3, 21.6, sCurse);
    L(26.6, 32.95, 26.6, 27.0, sDusk);
    L(32.8, 37.7, 32.8, 33.0, sMeal);
    L(37.5, 40.5, 37.5, 37.85, sReturn);
    L(40.3, 49.3, 40.3, 40.5, sShare);
    L(49.0, 55.81, 49.0, 49.6, sPalm);
    if (t >= 55.2) { ctx.save(); ctx.globalAlpha = ss(seg(t, 55.2, 55.8)); sBhoga(ctx, t); ctx.restore(); }   // the lamp by the book becomes the aarti in his eye
    flash(ctx, t, 3.28, .2, .75, '255,236,200', 540, 700);   // after the dark, the sun
    grain(ctx, t);
    captions(ctx, t);
  } catch (e) { console.error('RENDER ' + e.stack); throw e; }
};
(async () => {
  for (const f of ['600 26px "Cinzel"', 'italic 600 56px "CormorantG"', '600 50px "CormorantG"', '700 52px "OdiaSerif"', '700 46px "InterT"']) await document.fonts.load(f, f.includes('Odia') ? 'ମାଣବସା ଗୁରୁବାର ଲକ୍ଷ୍ମୀ ପୁରାଣ ଜାତିଭେଦ' : 'Aa');
  initBhoga(); initJhoti();
  if (Q.get('t')) window.render(+Q.get('t'));
  window.READY = true;
})();
