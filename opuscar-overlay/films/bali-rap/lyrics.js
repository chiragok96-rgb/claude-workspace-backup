// The lyrics: the Odia line in two halves (the "—" is the break), the second half arriving on its half-bar; a small English line beneath.
// Lyric zone y 1150–1450 (above the platform UI), centred, auto-fit to 900 px so nothing ever truncates.
export const LYR = [
  ['କିଏ କହେ କଟକ', 'ରାତିରେ ଶୁଏ?', 'Who says Cuttack sleeps at night?'],
  ['ବାଲିଯାତ୍ରା ଆସିଲେ', 'ନିଦ କାହାକୁ ହୁଏ!', 'When Bali Jatra comes — who can sleep!'],
  ['ମହାନଦୀ ପଠା', 'ରଙ୍ଗିନ ଦୋକାନ', "The Mahanadi's sands — a riot of coloured stalls"],
  ['କଟକିଆ ହସ', 'ଗୁଞ୍ଜେ ମଇଦାନ', "Cuttack's laughter rings across the maidan"],
  ['ରାମଦୋଳି ଚଢ଼ି', 'ତଳକୁ ଚାହେଁ', 'Up on the Ramdoli, looking down —'],
  ['ଆଲୁଅର ନଦୀ', 'ପଡ଼ିଆରେ ବହେ', 'a river of light flows across the ground'],
  ['ଦହିବରା ଆଳୁଦମ', 'ଠୁଙ୍କାପୁରୀ ଥାଳି', 'Dahibara-aludum — a thali of thunka puri'],
  ['ଖାଇଖାଇ ଭୁଲିଗଲୁ', 'ପକେଟ୍ ହେଲା ଖାଲି!', 'Ate and ate, and forgot — the pocket went empty!'],
  ['ସାଙ୍ଗଟା ହଜିଲା', 'ଫୋନ୍‌ଟା ବାଜିଲା', 'Lost my friend — then the phone rang'],
  ['ପୁଣି ମିଳିଗଲା', 'ମେଳାଟା ଜମିଲା!', 'Found again — and the fair came alive!'],
  ['ଡଙ୍ଗା ଭସା ଭୋର', 'ତଅପୋଇର ଗୀତ', "A dawn of floating boats — Taapoi's song"],
  ['ବାଲିଯାତ୍ରା ରାତି', 'ଜୀଅନ୍ତା ଅତୀତ!', 'Bali Jatra night — the past, alive'],
  ['ଦିନେ ବୋଇତ ଗଲା', 'ଦୂର ବାଲି ଦେଶ', 'Once the boitas sailed — to faraway Bali'],
  ['ଆଜି କଟକ ସାଜିଛି', 'ରଙ୍ଗିନ ନୂଆ ବେଶ!', 'Today Cuttack wears bright new colours'],
  ['ଏସିଆର ବଡ଼ ମେଳା', 'କଟକର ଶାନ୍', "Asia's biggest fair — Cuttack's pride"],
  ['ବାଲିଯାତ୍ରା! ବାଲିଯାତ୍ରା!', 'ଓଡ଼ିଶାର ପ୍ରାଣ!', "Bali Jatra! Bali Jatra! — Odisha's soul"],
];
export const BAR = 2.09;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
// i: line index; u: time within the bar (0..BAR); look: 'dark' text for light backgrounds (watercolour), else light
export function drawLyric(g, i, u, look = 'light', zone = 'low') {
  const [a, b, en] = LYR[i]; if (!a) return;
  const ink = look === 'dark' ? '#2b2520' : '#fffaf2', sh = look === 'dark' ? 'rgba(255,248,236,.85)' : 'rgba(0,0,0,.75)';
  const fit = (txt, font, max, size) => { let s = size; g.font = font.replace('#', s + 'px'); while (g.measureText(txt).width > max && s > 30) { s -= 2; g.font = font.replace('#', s + 'px'); } return s; };
  const f1 = '700 # "Anek Odia"', size = Math.min(fit(a, f1, 880, 74), fit(b, f1, 880, 74)), Y = zone === 'high' ? 360 : 1215;
  const inA = clamp(u / .18), inB = clamp((u - BAR / 2 + .05) / .18), out = 1 - clamp((u - BAR + .16) / .16);
  g.save(); g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.shadowColor = sh; g.shadowBlur = 24; g.fillStyle = ink;
  g.font = f1.replace('#', size + 'px');
  g.globalAlpha = inA * out; g.fillText(a, 540, Y + (1 - inA) * 16);
  g.globalAlpha = inB * out; g.fillText(b, 540, Y + size * 1.1 + (1 - inB) * 16);
  g.font = '300 30px "Inter Tight"'; g.letterSpacing = '2px'; g.shadowBlur = 14; g.globalAlpha = .82 * clamp(u / .3) * out;
  g.fillText(en, 540, Y + size * 1.1 + 64);
  g.restore();
}
