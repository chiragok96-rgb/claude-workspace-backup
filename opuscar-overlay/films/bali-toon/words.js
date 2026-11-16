// Living lyrics: Odia words as physical cartoon objects — Baloo Bhaina 2 ExtraBold, a thick ink outline (the toon line),
// a coloured fill, an offset ink "sticker" shadow. Words squash, bounce, shatter, echo, float, beat.
import { g, INK } from './toon.js';
import { clamp, hash, lerp } from '/core/lib.js';
export const FONT = s => `800 ${s}px "Bhaina"`;
// draw one word at (x, y) centred; o: {fill, rot, sx, sy, alpha, shadow, outline, clip}
export function word(str, x, y, size, o = {}) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.rotate(o.rot || 0); g.scale(o.sx ?? 1, o.sy ?? 1); g.globalAlpha = o.alpha ?? 1;
  g.font = FONT(size); g.textAlign = o.align || 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  if (o.shadow !== false) { g.lineWidth = size * .2; g.strokeStyle = o.shadowCol || INK; g.fillStyle = o.shadowCol || INK; g.strokeText(str, size * .06, size * .08); g.fillText(str, size * .06, size * .08); }
  g.lineWidth = size * .2; g.strokeStyle = o.outline || INK; g.strokeText(str, 0, 0);
  g.fillStyle = o.fill || '#fff'; g.fillText(str, 0, 0);
  if (o.shine !== false) { g.save(); g.globalCompositeOperation = 'source-atop'; g.restore(); }
  g.restore();
}
export function width(str, size) { g.save(); g.font = FONT(size); const w = g.measureText(str).width; g.restore(); return w; }
// a pop-in: overshoot scale for a word that lands on a beat; u = seconds since its beat
export const popS = u => u < 0 ? 0 : u < .09 ? lerp(.2, 1.25, u / .09) : u < .2 ? lerp(1.25, .94, (u - .09) / .11) : u < .3 ? lerp(.94, 1, (u - .2) / .1) : 1;
// a line laid out as words with per-word transforms; ws: [{s, fill, dy, rot, sx, sy, alpha}]
export function line(strs, cx, y, size, per = () => ({})) {
  const gap = size * .28, W = strs.reduce((a, s) => a + width(s, size), 0) + gap * (strs.length - 1);
  let x = cx - W / 2;
  strs.forEach((s, i) => { const w = width(s, size), o = per(i, s) || {}; word(s, x + w / 2 + (o.dx || 0), y + (o.dy || 0), size * (o.k ?? 1), o); x += w + gap; });
  return W;
}
// the glass-shatter of a word (ନିଦ breaks): k = 0 whole .. 1 scattered. The word is drawn once offscreen, then cut into shards.
const SH = {};
export function shatter(str, x, y, size, k, fill = '#fff') {
  const key = str + size + fill;
  if (!SH[key]) { const w = Math.ceil(width(str, size) + size), h = Math.ceil(size * 1.8), c = document.createElement('canvas'); c.width = w; c.height = h;
    const keep = g.canvas; const ctx = c.getContext('2d'); ctx.font = FONT(size); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.lineWidth = size * .2; ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.strokeText(str, w / 2 + size * .06, h * .7 + size * .08); ctx.fillText(str, w / 2 + size * .06, h * .7 + size * .08);
    ctx.strokeText(str, w / 2, h * .7); ctx.fillStyle = fill; ctx.fillText(str, w / 2, h * .7); SH[key] = { c, w, h }; }
  const { c, w, h } = SH[key], cols = 4, rows = 3;
  for (let i = 0; i < cols * rows; i++) {
    const cx = (i % cols + .5) * w / cols, cy = (Math.floor(i / cols) + .5) * h / rows, ang = Math.atan2(cy - h * .5, cx - w / 2) + (hash(i) - .5), d = k * (80 + hash(i * 7.1) * 300), gy = k * k * 500;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - k * .5;
    g.translate(x - w / 2 + cx + Math.cos(ang) * d, y - h * .7 + cy + Math.sin(ang) * d + gy); g.rotate(k * (hash(i + 5) - .5) * 5);
    g.beginPath(); const jx = (hash(i + 9) - .5) * 14, jy = (hash(i + 11) - .5) * 14;
    g.moveTo(-w / cols / 2 + jx, -h / rows / 2); g.lineTo(w / cols / 2, -h / rows / 2 + jy); g.lineTo(w / cols / 2 - jx, h / rows / 2); g.lineTo(-w / cols / 2, h / rows / 2 - jy); g.closePath(); g.clip();
    g.drawImage(c, -cx, -cy); g.restore();
  }
}
