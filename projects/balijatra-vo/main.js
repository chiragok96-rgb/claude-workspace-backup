// Bali Jatra (voiceover): storyboard frames (?frame=1..13). Voice-locked times from the recording (audio/vo.mp3, 62.1 s).
import { W, H, load, caption } from './common.js';
import { initWC, wcShore, wcStrata, wcPots } from './sc_wc.js';
import { initLeaf, poemVerse, poemKing, poemChart } from './sc_poem.js';
import { shPot, shSadhaba, shVoyage, shMemory } from './sc_shadow.js';
import { initLightbox, lampMemory, lampGate, lampFair } from './sc_lamp.js';
const Q = new URLSearchParams(location.search), cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const CAP = {
  1: [['On Kalinga’s shore…', 'the scent of cloves from distant isles!'], 'ink'],
  2: [['So Kalidasa describes it', 'in his Raghuvamsha.'], 'leaf'],
  3: [['There he calls the king of Kalinga “Mahodadhipati”:', 'emperor of the sea.'], 'leaf'],
  4: [['But what has that island', 'to do with our Bali Jatra?'], 'leaf'],
  5: [['The answer isn’t only in poetry…', 'it lies under the earth, too.'], 'earth'],
  6: [['Pots matching the ancient ware of Bali and Java', 'have been found at Manikapatna, Odisha.'], 'earth'],
  7: [['A pot couldn’t have swum', 'across the sea by itself!'], 'screen'],
  8: [['So who carried it?', 'Our Sadhabas.'], 'screen'],
  9: [['Sails open on their boitas, they sailed', 'to Bali, Java and Sumatra.'], 'screen'],
  10: [['Those voyages ended…', 'but never left Odia memory.'], 'screen'],
  11: [['That memory is', 'Bali Jatra.'], 'night'],
  12: [['And this year? Indonesia, home of Bali,', 'is Cuttack Bali Jatra’s partner country.'], 'night'],
  13: [['Kalidasa kept it in poetry…', 'we keep it in a fair!'], 'night'],
};
const FR = {
  1: c => wcShore(c, 3.6, { p: .97 }), 2: c => poemVerse(c, 9.9), 3: c => poemKing(c, 14.6), 4: c => poemChart(c, 19.4, { k: 1 }),
  5: c => wcStrata(c, 22.6, { p: .62 }), 6: c => wcPots(c, 29.5, { k: 1 }), 7: c => shPot(c, 33.0), 8: c => shSadhaba(c, 36.9),
  9: c => shVoyage(c, 41.5), 10: c => shMemory(c, 46.2), 11: c => lampMemory(c, 49.6), 12: c => lampGate(c, 55.5), 13: c => lampFair(c, 61.0, { k: 1 }),
};
window.DUR = 1;
window.render = () => { const n = +(Q.get('frame') || 1); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  try { FR[n](ctx); if (Q.get('cap') !== '0') caption(ctx, CAP[n][0], CAP[n][1]); } catch (e) { console.error('RENDER ' + e.stack); throw e; } };
(async () => {
  for (const f of ['600 64px "Cinzel"', 'italic 500 46px "CormorantG"', '700 40px "OdiaSerif"', '600 26px "OdiaSerif"']) await document.fonts.load(f, f.includes('Odia') ? 'ବାଲିଯାତ୍ରାକଳିଙ୍ଗ' : 'Aa');
  const base = new URL('.', import.meta.url).href;
  const [fibre, pulp, shore, strata, pots] = await Promise.all(['assets/fibre.png', 'assets/pulp.png', 'plates/shore.png', 'plates/strata.png', 'plates/pots.png'].map(p => load(base + p)));
  initWC({ shore, strata, pots }); initLeaf(); initLightbox(fibre, pulp);
  window.render(); window.READY = true;
})();
