// Panchuka — the film. ?from=&to= renders a part; still.mjs <t> renders a frame.
import { initFilm, film, DUR } from './film.js';
const W = 1080, H = 1920, Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
const FROM = Number(Q.get('from') || 0), TO = Number(Q.get('to') || DUR);
window.DUR = TO - FROM; window.NOCAP = Q.has('nocap');
window.render = t => { try { film(ctx, t + FROM); } catch (e) { console.error('RENDER ' + e.stack); throw e; } };
(async () => {
  for (const f of ['600 64px "Cinzel"', 'italic 500 52px "CormorantG"', '400 40px "Marcellus"', '700 40px "OdiaSerif"', '600 26px "OdiaSerif"']) await document.fonts.load(f, f.includes('Odia') ? 'ପଞ୍ଚୁକ୪୫କାର୍ତ୍ତିକ' : 'Aa');
  const base = new URL('.', import.meta.url).href, [fibre, pulp] = await Promise.all([load(base + 'assets/fibre.png'), load(base + 'assets/pulp.png')]);
  initFilm(fibre, pulp); window.render(Number(Q.get('t') || 0) - FROM); window.READY = true;
})();
