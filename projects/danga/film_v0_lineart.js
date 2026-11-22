// "Aa Ka Ma Bai" — Boita Bandana. Voice-locked to audio/vo.mp3 (52.6 s; the song 0–3.7 s). Loops.
// Counting is the spine: four syllables → four months → a voyage's tally → a mother's fingers → festivals → a waiting list → kilometres home.
import { W, H, clamp, lerp, seg, ss, eo, eio, hh, mk, load } from './common.js';
import { initRiver, river, dangas, danga, sailSylPos, FOUR, HZ } from './sc_river.js';
import { dial, DIAL, onRing, FOUR_IDX, MONTHS, lineBoita, oneLine, thumb, SEGS, jointLabels, FESTS } from './sc_count.js';
import { initModern, ticket, calPage, pageTurn, phone, foldTicket, paperBoat } from './sc_modern.js';
import { initIndia, india } from './sc_india.js';
const Q = new URLSearchParams(location.search), cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const DUR = 53.6; window.DUR = DUR;
const tl = t => (t < 26 ? t : t - DUR);   // the clock for things seen at both ends of the loop
const BG = '#120b09';
const SYL = ['ଆ', 'କା', 'ମା', 'ବୈ'], NAME_T = [9.41, 10.35, 11.34, 12.25];
const FROM_KARTIKA = [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5].map(i => MONTHS[i]);
// ———————————————— captions ————————————————
const CAPS = [
  [3.85, 5.15, ['We’ve sung it since childhood…'], 'dark'],
  [5.3, 9.0, ['but these four letters are', 'the names of four *months*.'], 'dark'],
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
// ———————————————— scenes ————————————————
function riverScene(c, t, o = {}) {   // the dawn river; the four dangas light their syllables as the song sings them
  const tt = tl(t); river(c, tt, { push: clamp(tt / 9) });
  dangas(c, tt, { sylA: o.sylA ?? 1, litK: 1 });
}
function liftAndDial(c, t) {   // the syllables rise off the sails into the year-dial; each unfolds into its month on the word
  const up = ss(seg(t, 5.3, 8.6)), dark = ss(seg(t, 5.6, 8.4));
  c.save(); c.translate(0, up * 380); riverScene(c, t, { sylA: 1 - ss(seg(t, 5.3, 5.6)) }); c.restore();
  c.fillStyle = `rgba(18,11,9,${dark})`; c.fillRect(0, 0, W, H);
  dial(c, t, { ring: eio(seg(t, 6.6, 8.6)), names: NAME_T.map(a => ss(seg(t, a - .05, a + .4))), others: ss(seg(t, 12.6, 13.6)) * .9, voyage: seg(t, 13.6, 16.6), tally: seg(t, 14.3, 16.8), a: 1 - ss(seg(t, 18.4, 19.4)) });
  SYL.forEach((s, k) => {   // the flying syllables
    const f = ss(seg(t, 5.3 + k * .12, 7.4 + k * .12)), gone = ss(seg(t, NAME_T[k] - .05, NAME_T[k] + .35)); if (gone >= 1) return;
    const [sx, sy, sz] = sailSylPos(k, tl(t)), [rx, ry] = onRing(FOUR_IDX[k], DIAL.r + 66), x = lerp(sx, rx, eio(f)), y = lerp(sy + up * 380, ry, eio(f)) - Math.sin(f * Math.PI) * 140, size = lerp(sz, 64, eio(f));
    c.save(); c.globalAlpha = 1 - gone; c.font = `700 ${size}px "OdiaSerif"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = 'rgba(255,190,90,1)'; c.shadowBlur = 26; c.fillStyle = '#ffe0a0'; c.fillText(s, x, y); c.restore(); });
}
function lineScene(c, t) {   // one gold line: the mother at the ghat → her counting hand
  c.fillStyle = BG; c.fillRect(0, 0, W, H);
  const enter = ss(seg(t, 18.9, 19.5)), m = eio(seg(t, 21.3, 22.3)), m2 = 1 - eio(seg(t, 24.55, 25.0));
  if (t < 30) {
    oneLine(c, t, eio(seg(t, 19.2, 21.0)), m, enter * (1 - ss(seg(t, 24.45, 24.95))));
    if (t < 21.4) { lineBoita(c, lerp(860, 960, seg(t, 19.3, 21.4)), 972 - 34, lerp(.55, .4, seg(t, 19.3, 21.4)), 0, ss(seg(t, 19.6, 20.2))); }
    const cnt = seg(t, 22.4, 24.3), idx = Math.min(11, Math.floor(cnt * 6)), hop = (cnt * 6) % 1;   // the thumb hops joint to joint
    if (t > 22.2 && t < 24.6) { const tg = SEGS[idx]; thumb(c, tg, ss(seg(t, 22.2, 22.5)) * (1 - ss(seg(t, 24.3, 24.6))), Math.sin(hop * Math.PI)); jointLabels(c, t, [FROM_KARTIKA, FROM_KARTIKA], 0, idx, ss(seg(t, 22.3, 22.6)) * (1 - ss(seg(t, 24.3, 24.6)))); }
    const er = seg(t, 24.8, 25.8); if (t > 24.6 && t < 26.1) lineBoita(c, 540, 860, 1.3, 0, (1 - er) * ss(seg(t, 24.6, 24.9)));   // "today, there is no boita": it fades from the line
  } else {   // 30.9–35: the hand again — the joints flip from months to festivals
    oneLine(c, t, 1, 1, ss(seg(t, 30.4, 30.9)) * (1 - ss(seg(t, 34.9, 35.4))));
    const cnt = seg(t, 34.4, 35.0), idx = t < 34.35 ? Math.min(11, Math.floor(seg(t, 31.0, 33.0) * 8)) : 0;
    thumb(c, SEGS[idx], ss(seg(t, 30.6, 31.0)) * (1 - ss(seg(t, 34.9, 35.3))), .6);
    jointLabels(c, t, [FROM_KARTIKA, FESTS.slice(0)], ss(seg(t, 33.15, 34.4)), idx, ss(seg(t, 30.6, 31.0)) * (1 - ss(seg(t, 34.9, 35.3))));
  }
}
function ticketScene(c, t) {
  c.fillStyle = BG; c.fillRect(0, 0, W, H);
  const inn = eo(seg(t, 25.75, 26.5)), out = ss(seg(t, 30.3, 30.9));
  ticket(c, t, 540, lerp(1500, 860, inn), 1.12, { stamp: seg(t, 26.75, 27.15), flapT: [28.0, 28.88, 29.55], a: 1 - out });
}
function calendarScene(c, t) {
  c.fillStyle = BG; c.fillRect(0, 0, W, H); const s = .82, x = 540, y = 850;
  const marks = { oct: { 20: { type: 'x', p: seg(t, 35.7, 36.5) } }, nov: { 8: { type: 'x', p: seg(t, 37.9, 38.7) } }, jun: { 14: { type: 'o', p: seg(t, 42.1, 43.0) }, 15: { type: 'o', p: seg(t, 42.35, 43.2) } } };
  const inn = eo(seg(t, 34.9, 35.5));
  c.save(); c.globalAlpha = inn; c.translate(0, (1 - inn) * 80);
  if (t < 37.0) calPage(c, t, 'oct', x, y, s, marks.oct);
  else if (t < 37.65) pageTurn(c, t, 'oct', 'nov', seg(t, 37.0, 37.65), x, y, s, marks.oct, marks.nov);
  else if (t < 41.3) calPage(c, t, 'nov', x, y, s, marks.nov);
  else if (t < 41.95) pageTurn(c, t, 'nov', 'jun', seg(t, 41.3, 41.95), x, y, s, marks.nov, marks.jun);
  else calPage(c, t, 'jun', x, y, s, marks.jun);
  c.restore();
  const ph = ss(seg(t, 39.45, 39.9)) * (1 - ss(seg(t, 43.2, 43.6))), shrink = eio(seg(t, 41.2, 41.9));
  if (ph > 0) { c.fillStyle = `rgba(10,6,5,${.55 * ph * (1 - shrink)})`; c.fillRect(0, 0, W, H); phone(c, t, lerp(540, 860, shrink), lerp(860, 420, shrink), lerp(.82, .34, shrink), t - 39.4 + 187, ph, t > 41.2 && t < 43.3 ? 1 : .2); }
}
function foldScene(c, t) {   // the waiting-list ticket becomes a paper boat
  c.fillStyle = BG; c.fillRect(0, 0, W, H);
  const inn = eo(seg(t, 43.5, 44.0)); foldTicket(c, t, 540, lerp(1300, 860, inn), lerp(.9, .8, seg(t, 44.0, 45.6)), seg(t, 44.05, 45.55), inn);
}
function homeRiver(c, t) {   // the paper boat with its diya on the dawn river, among the dangas
  river(c, tl(t), { push: .5 });
  dangas(c, tl(t), { sylA: 0, litK: 1 });
  paperBoat(c, t, lerp(540, 520, seg(t, 45.6, 49)), lerp(1200, 1150, seg(t, 45.6, 49)), .34, ss(seg(t, 45.9, 46.4)));
}
// ———————————————— the frame ————————————————
window.render = t => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  try {
    if (t < 5.3 || t >= 52.9) riverScene(ctx, t);
    else if (t < 19.4) liftAndDial(ctx, t);
    if (t >= 18.6 && t < 25.9) { ctx.save(); ctx.globalAlpha = ss(seg(t, 18.6, 19.4)); lineScene(ctx, t); ctx.restore(); }
    if (t >= 25.6 && t < 31.0) ticketScene(ctx, t);
    if (t >= 30.4 && t < 35.4) lineScene(ctx, t);
    if (t >= 34.9 && t < 43.6) calendarScene(ctx, t);
    if (t >= 43.5 && t < 45.9) foldScene(ctx, t);
    if (t >= 45.6 && t < 49.6) { ctx.save(); ctx.globalAlpha = ss(seg(t, 45.6, 46.1)); homeRiver(ctx, t); ctx.restore(); }
    if (t >= 49.0 && t < 53.6) { ctx.save(); ctx.globalAlpha = ss(seg(t, 49.0, 49.7)) * (1 - ss(seg(t, 52.9, 53.6))); india(ctx, t, { threads: seg(t, 49.4, 51.6), labels: ss(seg(t, 50.2, 50.8)), odisha: 1, z: lerp(1, 1.15, seg(t, 49.0, 53.6)) }); ctx.restore(); }
    captions(ctx, t);
  } catch (e) { console.error('RENDER ' + e.stack); throw e; }
};
(async () => {
  for (const f of ['600 26px "Cinzel"', 'italic 600 56px "CormorantG"', '600 50px "CormorantG"', '700 52px "OdiaSerif"', '600 24px "OdiaSerif"', '700 46px "InterT"']) await document.fonts.load(f, f.includes('Odia') ? 'ଆକାମାବୈଆଷାଢ଼କାର୍ତ୍ତିକ' : 'Aa');
  const base = new URL('.', import.meta.url).href;
  initRiver(); initModern(); initIndia(await (await fetch(base + 'geo/india_states.json')).json());
  if (Q.get('t')) window.render(+Q.get('t'));
  window.READY = true;
})();
