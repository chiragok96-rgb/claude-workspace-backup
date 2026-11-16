// Panchuka: storyboard frames (?frame=1..9) and, later, the film. Voiceover-locked; see VOICEOVER_MAP.md.
import { initInk, inkS1, inkS2, inkS9 } from './sc_ink.js';
import { initLeaf, leafS3, leafS4, leafS6 } from './sc_leaf.js';
import { initGold, goldS5, goldS7 } from './sc_gold.js';
import { initLamp, lampS8 } from './sc_lamp.js';
const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
const W = 1080, H = 1920, Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const FR = { 1: [2.8, c => inkS1(c, 2.8)], 2: [8.2, c => inkS2(c, 8.2)], 3: [13.5, c => leafS3(c, 13.5)], 4: [18.6, c => leafS4(c, 18.6)], 5: [29.6, c => goldS5(c, 29.6)], 6: [36.5, c => leafS6(c, 36.5)], 7: [41.6, c => goldS7(c, 41.6)], 8: [47.7, c => lampS8(c, 47.7)], 9: [53.8, c => inkS9(c, 53.8)] };
window.DUR = 1;
window.render = () => { const f = FR[Q.get('frame') || '1']; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); try { f[1](ctx); } catch (e) { console.error('RENDER ' + e.stack); throw e; } };
(async () => {
  for (const f of ['600 64px "Cinzel"', 'italic 500 52px "CormorantG"', '400 40px "Marcellus"', '700 40px "OdiaSerif"', '600 26px "OdiaSerif"']) await document.fonts.load(f, f.includes('Odia') ? 'ପଞ୍ଚୁକ୪୫କାର୍ତ୍ତିକ' : 'Aa');
  const base = new URL('.', import.meta.url).href, [fibre, pulp] = await Promise.all([load(base + 'assets/fibre.png'), load(base + 'assets/pulp.png')]);
  initInk(); initLeaf(); initGold(); initLamp(fibre, pulp); window.render(0); window.READY = true;
})();
