// Lyrics, romanised Odia: a clean sans (Inter Tight) with one key word per line in gold Cormorant italic.
// Each half-line arrives word by word on its half-bar; words rise 20 px out of a soft blur. Never above y 250, never below y 1470.
export const B = 2.09;
export const LINES = [
  ['Kie kahe *Cuttack*', 'raatire shue?'],
  ['*Balijatra* asile', 'nida kahaku hue!'],
  ['*Mahanadi* patha', 'rangina dokana'],
  ['Cuttackia *hasa*', 'gunje maidana'],
  ['*Ramdoli* chadhi', 'talaku chahen'],
  ['*Aluara* nadi', 'padiare bahe'],
  ['*Dahibara* aludum', 'thunkapuri thali'],
  ['Khai khai bhuligalu', 'pocket hela *khali!*'],
  ['Sangata *hajila*', 'phone ta bajila'],
  ['Puni *miligala*', 'melata jamila!'],
  ['Donga bhasa bhora', '*Taapoi* ra gita'],
  ['Balijatra raati', 'jianta *atita*'],
  ['Dine *boita* gala', 'dura Bali desha'],
  ['Aji Cuttack sajichhi', '*rangina* nua besha!'],
  ['Asiara *bada mela*', 'Cuttack ra shaan'],
  ['Balijatra! Balijatra!', 'Odisha ra *praan!*'],
];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eo = x => 1 - Math.pow(1 - clamp(x), 3);
const SANS = s => `600 ${s}px "Inter Tight"`, SERIF = s => `italic 600 ${s}px "CormorantG"`;
// tokens of a half-line: [{w, acc}] where *…* marks the accent (may hold spaces)
function toks(str) { const out = []; const re = /\*([^*]+)\*|(\S+)/g; let m; while ((m = re.exec(str))) out.push(m[1] ? { w: m[1], acc: true } : { w: m[2], acc: false }); return out; }
function layout(g, str, size) {
  const T = toks(str), sp = size * .3; let x = 0;
  for (const k of T) { g.font = k.acc ? SERIF(size * 1.32) : SANS(size); g.letterSpacing = k.acc ? '0px' : `${-size * .012}px`; k.wd = g.measureText(k.w).width; k.x = x; x += k.wd + sp; }
  return { T, w: x - sp };
}
// look: { y: baseline of the first half-line, ink, acc, shadow, size }
export function drawLyrics(g, t, look) {
  const i = Math.floor(t / B); if (i < 0 || i > 15) return;
  const u = t - i * B, last = i === 15, end = last ? 33.55 - i * B : B;
  const out = 1 - clamp((u - end + .16) / .16);
  if (out <= 0) return;
  const size = look.size ?? 64, gap = size * 1.36;
  g.save(); g.textBaseline = 'alphabetic';
  LINES[i].forEach((str, h) => {
    let L = layout(g, str, size), s = size;
    while (L.w > 940 && s > 36) { s -= 2; L = layout(g, str, s); }
    const x0 = 540 - L.w / 2, y = look.y + h * gap, hs = h * B / 2 - .04;
    L.T.forEach((k, j) => {
      const tw = hs + j * Math.min(.17, .62 / L.T.length), e = eo((u - tw) / .2); if (e <= 0) return;
      g.font = k.acc ? SERIF(s * 1.32) : SANS(s); g.letterSpacing = k.acc ? '0px' : `${-s * .012}px`;
      const dy = (1 - e) * 22 - (1 - out) * 10, a = e * out;
      g.filter = e < .98 ? `blur(${((1 - e) * 7).toFixed(2)}px)` : 'none';
      g.shadowColor = look.shadow; g.shadowBlur = 34; g.globalAlpha = a * .9; g.fillStyle = look.shadow; g.fillText(k.w, x0 + k.x, y + dy);   // soft halo for legibility
      g.shadowBlur = 0; g.globalAlpha = a; g.fillStyle = k.acc ? look.acc : look.ink; g.fillText(k.w, x0 + k.x, y + dy);
    });
  });
  g.restore();
}
