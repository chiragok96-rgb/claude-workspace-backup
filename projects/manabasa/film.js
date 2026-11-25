// Manabasa Gurubara — the Lakshmi Purana in 55 seconds. Voice-locked to audio/vo.mp3 (55.7 s). Loops.
// Rice is the thread: 56 bowls → empty bowls → a lamp that becomes the sun → a lane of shut doors → a grain → the rice-paste jhoti →
// Lakshmi's footsteps → the temple's shut door → twelve lamps out → a fistful of nothing → the one lit door → a meal that glows →
// the door opens → one ring of leaves, every hand → the palm-leaf book → the lamp again.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk } from './common.js';
import { wall } from './sc_lane.js';
import { initJhoti, floor, foot, THRESH } from './sc_jhoti.js';
import { dark, glow, lamp, templeDoor, idol, raisedHand, riceFall, twelveLamps } from './sc_temple.js';
import { sanctum, templeNight, hearth, devotees, kudua, shriyaDoor } from './sc_new.js';
import { shadowPlay } from './sc_final.js';
import { pitchView, tiltAt, rosaghara, hut, HUT, inEye, lakshmiGold, feast, palmLeafOne } from './sc_flow.js';
import { motherStanding, setLook } from './sc_people.js';
const Q = new URLSearchParams(location.search), cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const DUR = 55.8; const FROM = +(Q.get('from') || 0); window.DUR = (+(Q.get('to') || DUR)) - FROM;
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
// ———————————————— scenes: one continuous camera ————————————————
// 0 the kitchen's 56 pots → their steam rises to him → his face goes dark against a sunrise and becomes his shadow on a lane wall →
// the shadows walk, doors shut → the camera cranes down to the doorstep (a grain falls: "why?") → the jhoti floor, Lakshmi's steps →
// the camera tilts up to Shriya at her door → pans along the lane into night, to the temple door → Lakshmi becomes her own shadow
// puppet: the curse → the rice blows away as dust and the dust is the dusk lane → into the one lit door → the hut: her pot's aroma
// crosses the room to him → into his eye: she is there, crowned → the temple doors open behind her → through the light: one pot,
// many people, the lines wash away → up into the sky over Ananda Bazar → the rows of people become the lines of a palm leaf →
// the leaf's lamp → its flame is the first hearth's fire.
const WC = mk(W, H), GC = mk(2 * W, H), DC = mk(W, H), wx = WC.getContext('2d'), gx = GC.getContext('2d'), dx = DC.getContext('2d');
function off(x, w = W) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.clearRect(0, 0, w, H); }
// —— 0–3.45: the hook ——
function sHook(c, t) {   // on "Jagannath" his face; the 56 pots land tier by tier as we pull back; their steam rises to him; on "door to door" the fires die, and a sunrise sweeps across: his face becomes his shadow on a lane wall
  const tt = t > 50 ? t - DUR : t, zIn = lerp(1.5, 1, eio(seg(tt, .3, 1.75))), Z2 = Math.exp(Math.log(1.675) * eio(seg(tt, 2.7, 3.45)));
  c.save(); zoomAt(c, 540, 175, Z2); zoomAt(c, 540, 600, zIn);
  rosaghara(c, tt, { face: ss(seg(tt, .17, .34)), rise: ss(seg(tt, 1.9, 2.5)) * (1 - ss(seg(tt, 2.75, 3.05))), faceSil: ss(seg(tt, 2.72, 2.98)), count: ss(seg(tt, .75, 1.05)) * (1 - ss(seg(tt, 2.5, 2.8))), fire: 1 - ss(seg(tt, 2.7, 3.0)), potsA: 1 - ss(seg(tt, 2.85, 3.1)) });
  glow(c, 540, 600, 520, .75 * Math.exp(-Math.pow((tt - .3) / .22, 2)), '255,200,120');   // the lamplight catches his face
  c.restore();
  const w = seg(tt, 2.84, 3.42); if (w <= 0 || t > 50) return;
  off(dx); laneWall(dx, t); const ex = lerp(-420, 1560, eio(w)), edge = (y, o2) => ex + o2 + 40 * Math.sin(y * .003 + 1.1);
  for (const [o2, al] of [[-240, 1], [-210, .2], [-180, .2], [-150, .2], [-120, .2], [-90, .2], [-60, .2], [-30, .2], [0, .2], [30, .15]]) { c.save(); c.globalAlpha *= al; c.beginPath(); c.moveTo(-10, -10); for (let y = 0; y <= H; y += 40) c.lineTo(edge(y, o2), y); c.lineTo(-10, H + 10); c.closePath(); c.clip(); c.drawImage(DC, 0, 0); c.restore(); }
  c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(ex - 420, 0, ex + 180, 0); g.addColorStop(0, 'rgba(255,236,200,0)'); g.addColorStop(.65, `rgba(255,232,190,${.3 * (1 - seg(w, .85, 1))})`); g.addColorStop(1, 'rgba(255,220,170,0)'); c.fillStyle = g; c.fillRect(ex - 420, 0, 600, H); c.restore();   // the edge of the sunrise
}
// —— 3.1–6.5: the lane; their shadows; the doors shut; the crane down to the doorstep ——
const SHADOW_X = t => lerp(425, 1400, seg(t, 3.3, 5.55));
const DOORX = (i, pan) => i * 620 - pan + 160 + 150;
const lanePan = t => lerp(0, 520, eio(seg(t, 3.25, 5.6)));
function laneWall(c, t) { const pan = lanePan(t), xs = SHADOW_X(t);
  wall(c, t, { pan, shut: i => ss(clamp((xs - DOORX(i, pan) + 140) / 120)), shadows: [{ x: xs - 300, who: 'B', bob: 5 * Math.abs(Math.sin(t * 4.2)) }, { x: xs, who: 'J', bob: 5 * Math.abs(Math.sin(t * 4.2 + 1.2)) }] }); }
function floorOpts(t) {
  const camY = t < 9.2 ? 0 : lerp(0, THRESH + 320, eio(seg(t, 9.2, 12.4)));
  const z = t < 9.2 ? lerp(1.05, .95, seg(t, 6.45, 9.2)) : lerp(.95, .8, eio(seg(t, 9.2, 11)));
  return { cam: [0, camY], z, mandala: seg(t, 6.55, 8.9), ripple: seg(t, 6.45, 7.6), manaA: ss(seg(t, 6.6, 7.3)), lakshmi: seg(t, 9.3, 12.6), others: seg(t, 10.9, 12.9) };
}
function floorWide(t) { const o = floorOpts(t); off(gx, 2 * W);
  for (const sd of [0, 1]) { gx.save(); gx.translate(sd * W, 0); gx.beginPath(); gx.rect(0, 0, W, H); gx.clip(); floor(gx, t, { ...o, cam: [o.cam[0] + (sd ? 540 : -540) / o.z, o.cam[1]] }); gx.restore(); } }
function grainFall(c, t) { const u = seg(t, 5.55, 6.45); if (u <= 0 || u >= 1) return; const gy = lerp(-60, 960, Math.pow(u, 1.6)); c.save(); c.translate(540, gy); c.rotate(t * 3); c.fillStyle = '#fffdf6'; c.beginPath(); c.ellipse(0, 0, 9 + 5 * u, 3.6 + 2 * u, 0, 0, 7); c.fill(); c.restore(); glow(c, 540, gy, 70, .7, '255,240,210'); }
function sLane(c, t) {
  const k = seg(t, 5.45, 6.5);
  if (k <= 0) laneWall(c, t);
  else if (k < 1) { off(wx); laneWall(wx, t); floorWide(t); pitchView(c, WC, GC, { ...tiltAt(k, H, 1200), gW: W, bg: '#5a2c1c' }); }
  else sFloor(c, t);
  grainFall(c, t);
}
// —— 6.5–13.3: the jhoti floor, from above ——
function sFloor(c, t) {
  floor(c, t, floorOpts(t));
  const tl = ss(seg(t, 7.0, 7.5)) * (1 - ss(seg(t, 9.0, 9.4)));   // the day's name, in gold
  if (tl > 0) { c.save(); c.globalAlpha *= tl; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = 'rgba(40,8,0,.9)'; c.shadowBlur = 18;
    c.font = '600 34px "OdiaSerif"'; c.fillStyle = '#f4dca0'; c.fillText('ମାର୍ଗଶିର', 540, 330 + (1 - eo(tl)) * 12); c.font = '700 82px "OdiaSerif"'; const g = c.createLinearGradient(0, 360, 0, 460); g.addColorStop(0, '#fff0c0'); g.addColorStop(1, '#e0a840'); c.fillStyle = g; c.fillText('ମାଣବସା ଗୁରୁବାର', 540, 410 + (1 - eo(tl)) * 12); c.restore(); }
}
// —— 13.3–16.2: the camera tilts up from her doorstep to Shriya herself ——
const SHZ = t => 1 + .32 * eio(seg(t, 14.2, 15.4));   // we lean in to watch her draw
function sShriya(c, t) { c.save(); zoomAt(c, 640, 1290, SHZ(t)); shriyaDoor(c, t, { clean: seg(t, 13.6, 14.45), draw: seg(t, 14.4, 15.25), gold: seg(t, 15.15, 15.95) }); c.restore(); }
function sUp(c, t) {
  const k = 1 - seg(t, 13.25, 14.15);
  if (k >= 1) sFloor(c, t);
  else if (k > 0) { off(wx); sShriya(wx, t); floorWide(Math.min(t, 13.25)); pitchView(c, WC, GC, { ...tiltAt(k, H, 1344), gW: W, bg: '#3a2416' }); }
  else sShriya(c, t);
}
// —— 16.2–21.4: along the lane into the night, to the temple; Balabhadra; the doors slam ——
function sTemple(c, t, o = {}) { templeNight(c, t, { shut: eio(seg(t, 20.15, 20.55)), bala: ss(seg(t, 16.94, 17.3)), stern: ss(seg(t, 17.5, 17.85)), lakshmiA: 1, ...o }); }
const G0 = [640 + 120 * 1.32, 1290 - 290 * 1.32], G1 = [330, 860];   // her light in the doorway (in the zoomed view) → Lakshmi at the temple
function sAlong(c, t) {   // the camera goes into the gold of her light at Shriya's door, and comes out of it into the night, where the light is Lakshmi, at the temple door
  const k = seg(t, 15.85, 16.62), e = eio(k), Z = Math.exp(Math.log(4.2) * e), tA = ss(seg(t, 16.34, 16.66));
  if (tA < 1) { c.save(); c.translate(lerp(G0[0], G1[0], e), lerp(G0[1], G1[1], e)); c.scale(Z, Z); c.translate(-G0[0], -G0[1]); sShriya(c, t); c.restore(); }
  if (tA > 0) { c.save(); c.globalAlpha *= tA; sTemple(c, t); c.restore(); }
  const b = Math.exp(-Math.pow((t - 16.48) / .2, 2)); if (b > .01) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(G1[0], G1[1], 10, G1[0], G1[1], 1300); g.addColorStop(0, `rgba(255,226,160,${.95 * b})`); g.addColorStop(.4, `rgba(255,196,110,${.55 * b})`); g.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
  flash(c, t, 20.56, .08, .35, '255,220,180');
}
// —— 20.3–24.6: she becomes her own shadow puppet; the curse; twelve lamps ——
function sCurse(c, t) {
  const m = eio(seg(t, 20.75, 21.6)), lx = lerp(300, 470, m), ls = lerp(1.42, 1.55, m), Z = 1 + .05 * eio(seg(t, 20.7, 21.6));
  const sp = { press: 1, pupX: lx, pupS: ls, raise: seg(t, 21.9, 22.6), fire: ss(seg(t, 22.2, 22.9)) * (1 - ss(seg(t, 23.3, 24.0))), out: seg(t, 23.4, 24.55), frameA: m };
  c.save(); zoomAt(c, 540, 1000, Z);
  if (m < 1) templeNight(c, t, { shut: 1, bala: 1 - ss(seg(t, 20.8, 21.3)), stern: 1, lakshmiA: 0, doorA: 1 - ss(seg(t, 20.8, 21.5)), steps: 1 - m });
  if (m > 0) shadowPlay(c, t, { ...sp, a: m });
  if (m < 1) { setLook({ saree: '#b01e16', sareeD: '#7c1410', border: '#e8b850', crown: true }); motherStanding(c, lx, 1330, ls, { t, a: Math.pow(1 - m, 1.4), rimCol: '255,214,140', rimW: 6, glow: .6, glowCol: '255,190,100', shade: .45 }); }
  c.restore();
}
// —— 24.5–27: the fistful of rice runs out; the wind takes it as dust, and the dust opens on the lane at dusk ——
function sDust(c, t) {
  sCurse(c, t); if (t > 24.5) { c.save(); c.globalAlpha *= ss(seg(t, 24.5, 24.9)); dark(c, t, { warm: .35 }); c.restore(); }
  riceFall(c, t, 540, 420, seg(t, 24.75, 26.6), { wind: ss(seg(t, 25.5, 26.6)) * 1.4, s: 1.15, a: ss(seg(t, 24.6, 24.85)) });
  const w = seg(t, 25.75, 26.95); if (w <= 0) return;
  off(dx); sDusk(dx, t);
  const ex = lerp(-260, 1340, eio(w));   // the edge of the blowing dust, left to right
  for (const [o2, al] of [[-90, 1], [-45, .5], [0, .5], [45, .5]]) { c.save(); c.globalAlpha *= al; c.beginPath(); c.moveTo(-10, -10); for (let y = 0; y <= H; y += 40) c.lineTo(ex + o2 + 70 * Math.sin(y * .006 + t * 3) + 40 * Math.sin(y * .021 + 1.3), y); c.lineTo(-10, H + 10); c.closePath(); c.clip(); c.drawImage(DC, 0, 0); c.restore(); }   // a soft, dusty edge
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 260; i++) { const y = hh(i * 1.3) * H, x = ex + 90 * Math.sin(y * .006 + t * 3) + 50 * Math.sin(y * .021 + 1.3) + (hh(i * 2.7) - .3) * 220; c.fillStyle = `rgba(255,226,180,${.25 * hh(i * 5) * (1 - w * .5)})`; c.beginPath(); c.arc(x, y, 1 + 2.5 * hh(i * 7), 0, 7); c.fill(); } c.restore();
}
// —— 26.6–32.9: the lane at dusk; one door lit; we go in ——
function sDusk(c, t) {   // the same lane at dusk; one door lit; inside it, the hut; we go in through it
  const pan = lerp(1300, 2250, eio(seg(t, 26.6, 31.2))), xs = lerp(-240, 470, seg(t, 26.7, 31.6)), into = eio(seg(t, 31.6, 32.95));
  const door = 4, dcx = DOORX(door, pan), dcy = 1388 - 310, Z = Math.exp(Math.log(3.6) * into);
  c.save(); c.translate(lerp(dcx, 540, into), lerp(dcy, 960, into)); c.scale(Z, Z); c.translate(-dcx, -dcy);
  wall(c, t, { pan, dusk: 1, shut: i => i === door ? 0 : 1, openDoor: door, lit: ss(seg(t, 28.2, 29.4)), shadows: [{ x: xs - 280, who: 'B', bob: 3 * Math.abs(Math.sin(t * 3)) }, { x: xs, who: 'J', bob: 3 * Math.abs(Math.sin(t * 3 + 1.2)) }] });
  const lit = ss(seg(t, 28.2, 29.4)); if (lit > 0) { off(dx); hut(dx, t, { camX: 0, aroma: 0, wide: 0 }); c.save(); c.beginPath(); c.rect(dcx - 150, dcy - 310, 300, 620); c.clip(); c.fillStyle = '#1a0c06'; c.fillRect(dcx - 150, dcy - 310, 300, 620); c.globalAlpha *= lit; c.drawImage(DC, dcx - 150, dcy - 960 * 300 / 1080, 300, 1920 * 300 / 1080);
    c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, dcy - 310, 0, dcy + 310); g.addColorStop(0, `rgba(255,170,80,${.35 * (1 - into)})`); g.addColorStop(1, `rgba(255,200,110,${.55 * (1 - into)})`); c.fillStyle = g; c.fillRect(dcx - 150, dcy - 310, 300, 620); c.restore(); }
  c.restore();
}
// —— 32.8–37.9: the hut; the aroma of her cooking crosses the room to him; his eyes widen; into his eye — she is there ——
const PUPIL_END = 30 * HUT.sJ * 110;
const PUP = () => [HUT.J[0] + (68 - 6.4) * HUT.sJ, HUT.J[1] - 104 * HUT.sJ];
function sHut(c, t) {
  const pan = eio(seg(t, 33.35, 34.4)), camX = lerp(0, HUT.J[0] - 540, pan), wide = eo(seg(t, 34.45, 34.8)), aroma = eo(seg(t, 33.15, 34.45)) + seg(t, 34.45, 35.4) * .8;
  const zp = seg(t, 34.95, 37.05), Zpre = 1 + .45 * eio(seg(t, 34.0, 34.85)), Z = Zpre * Math.exp(Math.log(110 / 1.45) * Math.pow(eio(zp), 1.25));
  const [px, py] = PUP(), sx = px - camX, sy = py, R = (24 + 6 * wide) * HUT.sJ;
  const mv = ss(seg(zp, 0, .55)), cx = lerp(sx, 540, mv), cy = lerp(sy, 900, mv);
  if (R * Z < 1300) { c.save(); c.translate(cx, cy); c.scale(Z, Z); c.translate(-sx, -sy); hut(c, t, { camX, aroma, wide }); c.restore(); }
  inEye(c, t, cx, cy, R * Z, ss(seg(Z, 2.5, 7)));
}
// —— 37.6–40.4: in the dark of his eye the temple doors open behind her; she has returned; we go through, into the light ——
function retFrame(c, t) {
  const op = eio(seg(t, 37.9, 38.8)), m = eio(seg(t, 37.6, 38.6));
  dark(c, t); templeDoor(c, t, { shut: 1 - op, x: 600, y: 1360, s: .95, inner: 1.4 }); lamp(c, t, 250, 1380, 1.1); lamp(c, t, 950, 1380, 1.1, 1, 2);
  for (let k = 0; k < 6; k++) foot(c, 600 + (k % 2 ? 30 : -30), 1720 - k * 70, -Math.PI / 2, 1.0 - k * .08, k % 2 === 0, ss(seg(t, 38.5 + k * .18, 38.9 + k * .18)), '255,214,130', .55);
  const pd = 1 - ss(seg(t, 37.55, 38.3)); if (pd > 0) inEye(c, t, 540, 900, PUPIL_END, pd, false);   // the dark of his pupil lifts
  lakshmiGold(c, t, lerp(540, 360, m), lerp(900 + 470, 1380, m), lerp(1.5, 1.05, m), 1);
}
function feastWide(t) { off(gx, 2 * W); gx.save(); gx.translate(540, 0); sFeast(gx, t, 1150); gx.restore(); }
function sReturn(c, t) {   // in the dark of his eye the temple doors open behind her; her steps go in; the camera tilts down to the floor beyond — the feast
  const k = seg(t, 39.5, 40.45);
  if (k <= 0) { retFrame(c, t); return; }
  off(wx); retFrame(wx, t); feastWide(t); pitchView(c, WC, GC, { ...tiltAt(k, H, 1200), gW: W, bg: '#3a2414' });
}
// —— 40.3–49.4: one pot, many people; the lines wash away; up into the sky over Ananda Bazar ——
function feastZ(t) { return t < 43.1 ? lerp(.86, .76, seg(t, 40.3, 43.1)) : Math.exp(lerp(Math.log(.76), Math.log(54 / 700), eio(seg(t, 43.1, 49.3)))); }
function sFeast(c, t, vw = 560) { feast(c, t, { vw, z: feastZ(t), wash: seg(t, 41.95, 42.95), even: ss(seg(t, 42.25, 43.05)), linesA: 1, reach: ss(seg(t, 42.95, 43.35)) * (1 - ss(seg(t, 43.85, 44.3))), steps: seg(t, 39.2, 41.0), shadowA: ss(seg(t, 44.5, 46.5)), light: 1 }); }
// —— 49.3–55.8: the rows become the lines of the Lakshmi Purana; the leaf; its lamp; into the flame ——
function sLeaf(c, t) {
  const sw = seg(t, 49.3, 50.6);
  if (t < 51.6) sFeast(c, Math.min(t, 49.3));
  const lz = lerp(1, .84, eio(seg(t, 50.4, 54.6))), end = seg(t, 54.75, 55.8), Zf = Math.exp(Math.log(9) * Math.pow(end, 2.2));
  const draw = cc => {
    cc.save(); zoomAt(cc, 540, 1080, Zf); zoomAt(cc, 540, 960, lz);
    for (let k = 4; k >= 1; k--) { cc.save(); cc.globalAlpha *= ss(seg(t, 50.3 + k * .15, 51.2 + k * .15)); palmLeafOne(cc, t, 540 + k * 3, 960 + k * 16, 1000 - k * 6, 300, { write: 0, holes: 1 }); cc.restore(); }   // the bundle beneath
    palmLeafOne(cc, t, 540, 960, 1000, 300, { write: 1, gold: ss(seg(t, 51.9, 52.9)) });
    cc.strokeStyle = '#8a1e12'; cc.lineWidth = 4; for (const hx of [540 - 440, 540 + 440]) { cc.globalAlpha = ss(seg(t, 50.6, 51.4)); cc.beginPath(); cc.moveTo(hx, 960); cc.bezierCurveTo(hx + 30, 1040, hx - 20, 1120, hx + 10, 1180); cc.stroke(); } cc.globalAlpha = 1;
    lamp(cc, t, 540, 1260, .9, ss(seg(t, 50.5, 51.3)));
    cc.restore(); };
  if (sw <= 0) return;
  // the courtyard darkens around the leaf; the leaf's lines are written over the rows, left to right
  if (t < 51.6) { c.save(); c.globalAlpha *= ss(sw * 1.4); const g = c.createRadialGradient(540, 960, 300, 540, 960, 1100); g.addColorStop(0, 'rgba(14,8,4,.5)'); g.addColorStop(1, 'rgba(8,4,2,1)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
  if (sw < 1) { const ex = lerp(-80, 1160, eio(sw)); c.save(); c.beginPath(); c.rect(0, 0, ex, H); c.clip(); draw(c); c.restore();
    c.save(); c.globalCompositeOperation = 'lighter'; const gg = c.createLinearGradient(ex - 60, 0, ex + 20, 0); gg.addColorStop(0, 'rgba(255,200,120,0)'); gg.addColorStop(1, 'rgba(255,200,120,.35)'); c.fillStyle = gg; c.fillRect(ex - 60, 800, 80, 320); c.restore(); }
  else { c.fillStyle = `rgba(8,4,2,${ss(seg(t, 50.6, 51.6))})`; c.fillRect(0, 0, W, H); draw(c); }
}
let GRAIN; function grain(c, t) {   // a fine film grain over everything, so every style sits on the same stock
  if (!GRAIN) { GRAIN = mk(512, 512); const g = GRAIN.getContext('2d'), d = g.createImageData(512, 512); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (hh(i * .25 + .5) - .5) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
  const f = Math.floor(t * 30), ox = (f * 197) % 512, oy = (f * 311) % 512; c.save(); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .07; c.fillStyle = c.createPattern(GRAIN, 'repeat'); c.translate(-ox, -oy); c.fillRect(ox, oy, W, H); c.restore();
}
// ———————————————— the frame ————————————————
window.render = t0 => {
  const t = t0 + FROM;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  try {
    const L = (a, b, fa, fb, fn) => { if (t < a || t >= b) return; ctx.save(); ctx.globalAlpha = fa < fb ? ss(seg(t, fa, fb)) : 1; fn(ctx, t); ctx.restore(); };
    if (t < 3.45) sHook(ctx, t);
    L(3.45, 6.5, 0, 0, sLane);
    L(6.5, 13.25, 0, 0, sFloor);
    L(13.25, 15.85, 0, 0, sUp);
    L(15.85, 20.75, 0, 0, sAlong);
    L(20.75, 24.5, 0, 0, sCurse);
    L(24.5, 26.95, 0, 0, sDust);
    L(26.95, 32.95, 0, 0, sDusk);
    L(32.95, 37.6, 0, 0, sHut);
    L(37.55, 40.45, 0, 0, sReturn);
    L(40.45, 49.3, 0, 0, sFeast);
    L(49.3, 55.81, 0, 0, sLeaf);
    if (t >= 55.4) { ctx.save(); ctx.globalAlpha = ss(seg(t, 55.4, 55.8)); sHook(ctx, t); ctx.restore(); }
    const tw = t > 50 ? t - DUR : t; flash(ctx, tw, -.02, .22, .95, '255,196,120', 540, 1150, 1100);   // out of the lamp's flame, into the hearth's fire (the loop)
    grain(ctx, t);
    captions(ctx, t);
  } catch (e) { console.error('RENDER ' + e.stack); throw e; }
};
(async () => {
  for (const f of ['600 26px "Cinzel"', 'italic 600 56px "CormorantG"', '600 50px "CormorantG"', '700 52px "OdiaSerif"', '700 46px "InterT"', '600 30px "InterT"']) await document.fonts.load(f, f.includes('Odia') ? 'ମାଣବସା ଗୁରୁବାର ଲକ୍ଷ୍ମୀ ପୁରାଣ ଜାତିଭେଦ ୫୬ ପଙ୍କ୍ତିରେ ଶ୍ରିୟା' : 'Aa');
  initJhoti();
  if (Q.get('t')) window.render(+Q.get('t'));
  window.READY = true;
})();
