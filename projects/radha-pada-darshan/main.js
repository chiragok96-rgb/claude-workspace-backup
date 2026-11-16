// Radha Pada Darshan — the film. ?from=&to= renders a part; still.mjs <t> renders a frame; ?nocap=1 hides captions.
import { initFilm, film, DUR } from './film.js';
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
const W = 1080, H = 1920, Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const FROM = Number(Q.get('from') || 0), TO = Number(Q.get('to') || DUR);
window.DUR = TO - FROM; window.NOCAP = Q.has('nocap');
window.render = t => { try { film(ctx, t + FROM); } catch (e) { console.error('RENDER ' + e.stack); throw e; } };
(async () => {
  for (const f of ['600 64px "Cinzel"', 'italic 500 52px "CormorantG"', '600 40px "OdiaSerif"', '700 40px "OdiaSerif"']) await document.fonts.load(f, f.includes('Odia') ? 'ରାଧାପାଦଦର୍ଶନ୩୬୪ଦିନଢାଙ୍କାଅଁଳାନବମୀବୁଧବାର୧୮ଭେମ୍ସାକ୍ଷୀଗୋପାଳ' : 'Aa0123456789,+');
  const base = new URL('.', import.meta.url).href, A = {}, PL = {};
  for (const n of ['weave', 'wcpaper', 'floor', 'floor_big']) A[n] = await load(base + 'assets/' + n + '.png');
  for (const n of ['hook_bg', 'hook_feet', 'hook_hem', 'amla_bg', 'amla_w1', 'amla_w2', 'queue_bg', 'queue_people', 'besha_bg', 'besha_gopi', 'besha_rfeet', 'besha_saree']) PL[n] = await load(base + 'plates/' + n + '.png');
  const Qd = await (await fetch(base + 'plates/queue.json')).json();
  initFilm(A, PL, Qd); window.render(Number(Q.get('t') || 0) - FROM); window.READY = true;
})();
