// The loom: cloth that hides and cloth that reveals.
// ikat(): a Sambalpuri border woven row by row. Ikat threads are tie-dyed before weaving, so every weft row sits a few pixels off
// the last and the motifs' edges feather: that is drawn literally, one weft row at a time, sliced from a motif mask.
// ghagra(): the north-Indian skirt cloth (bandhani dots in clusters, mirror-work, a gota edge) that unravels into loose threads.
let WEAVE, MASK, MC;
export function initLoom(weave) {
  WEAVE = weave; MASK = document.createElement('canvas'); MASK.width = 1080; MASK.height = 1920; MC = MASK.getContext('2d');
}
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
function weaveOver(c, x, y, w, h, a = .55, scale = 1) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = a;
  for (let yy = y - (y % (512 * scale)); yy < y + h; yy += 512 * scale) for (let xx = 0; xx < 1080; xx += 512 * scale) c.drawImage(WEAVE, xx, yy, 512 * scale, 512 * scale);
  c.restore();
}
// motifs of the border, drawn into the mask (white = dyed thread colour)
function conch(k, x, y, s) { k.beginPath(); k.moveTo(x - 30 * s, y + 18 * s); k.bezierCurveTo(x - 36 * s, y - 20 * s, x + 6 * s, y - 34 * s, x + 30 * s, y - 10 * s); k.bezierCurveTo(x + 40 * s, y + 2 * s, x + 20 * s, y + 22 * s, x + 4 * s, y + 14 * s); k.bezierCurveTo(x - 6 * s, y + 10 * s, x - 6 * s, y, x + 6 * s, y - 2 * s); k.bezierCurveTo(x - 10 * s, y - 14 * s, x - 22 * s, y + 4 * s, x - 14 * s, y + 18 * s); k.closePath(); k.fill(); }
function phula(k, x, y, s) { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; k.beginPath(); k.ellipse(x + Math.cos(a) * 14 * s, y + Math.sin(a) * 14 * s, 9 * s, 5 * s, a, 0, 7); k.fill(); } k.beginPath(); k.arc(x, y, 6 * s, 0, 7); k.fill(); }
function diamond(k, x, y, s) { k.beginPath(); k.moveTo(x, y - 24 * s); k.lineTo(x + 18 * s, y); k.lineTo(x, y + 24 * s); k.lineTo(x - 18 * s, y); k.closePath(); k.fill(); k.clearRect(x - 5 * s, y - 5 * s, 10 * s, 10 * s); }
// the saree: body colour, then the border band with its motif rows; woven only down to row `upto` (y), the rest is bare warp
const CACHE = {};
export function saree(c, x0, x1, y0, y1, o = {}) {
  const key = 's' + [x0, x1, y1, o.bandTop, o.s].join(','); if (!CACHE[key]) { const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920; sareeRaw(cv.getContext('2d'), x0, x1, -60, y1, { ...o, upto: y1 }); CACHE[key] = cv; }
  const upto = o.upto ?? y1; c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, Math.max(0, Math.min(upto, y1) - y0)); c.clip(); c.drawImage(CACHE[key], 0, 0); c.restore();
}
function sareeRaw(c, x0, x1, y0, y1, o = {}) {
  const body = o.body || '#9e1f1a', band = o.band || '#1d1611', thread = o.thread || '#f2e7cf', alt = o.alt || '#c8321e', upto = o.upto ?? y1;
  const bt = o.bandTop ?? (y1 - 190), RH = 5;
  // mask of motifs
  const k = MC; k.setTransform(1, 0, 0, 1, 0, 0); k.clearRect(0, 0, 1080, 1920); k.fillStyle = '#fff';
  const mid = bt + (y1 - bt) / 2, s = o.s || 1.25;
  for (let x = x0 + 50, i = 0; x < x1 - 20; x += 92 * s, i++) { (i % 3 === 0 ? conch : i % 3 === 1 ? phula : diamond)(k, x, mid, s); }
  k.fillRect(x0, bt + 10, x1 - x0, 4); k.fillRect(x0, y1 - 14, x1 - x0, 4);
  for (let x = x0 + 10; x < x1; x += 22) { k.beginPath(); k.moveTo(x, bt + 22); k.lineTo(x + 8, bt + 30); k.lineTo(x, bt + 38); k.lineTo(x - 8, bt + 30); k.closePath(); k.fill(); }
  c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, Math.max(0, upto - y0)); c.clip();
  c.fillStyle = body; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  c.fillStyle = band; c.fillRect(x0, bt, x1 - x0, y1 - bt);
  // the dyed weft: slice the mask row by row with each row's own offset (the feathered ikat edge)
  const T = document.createElement('canvas'); T.width = 1080; T.height = 1920; const tk = T.getContext('2d');
  for (let y = bt; y < y1; y += RH) { const j = (hash(y * .37) - .5) * 7; tk.drawImage(MASK, 0, y, 1080, RH, j, y, 1080, RH); }
  tk.globalCompositeOperation = 'source-in'; tk.fillStyle = thread; tk.fillRect(0, 0, 1080, 1920);
  c.drawImage(T, 0, 0);
  // a red heart in the flowers: a second dyed colour, same feathering
  tk.globalCompositeOperation = 'source-over'; tk.clearRect(0, 0, 1080, 1920);
  for (let y = bt; y < y1; y += RH) { const j = (hash(y * .91) - .5) * 6; tk.save(); tk.beginPath(); tk.rect(0, y, 1080, RH); tk.clip(); for (let x = x0 + 50, i = 0; x < x1 - 20; x += 92 * s, i++) if (i % 3 === 1) { tk.fillStyle = alt; tk.beginPath(); tk.arc(x + j, mid, 7 * s, 0, 7); tk.fill(); } tk.restore(); }
  c.drawImage(T, 0, 0);
  // pleat shading
  for (let x = x0 + 30; x < x1; x += 70) { const g = c.createLinearGradient(x - 30, 0, x + 30, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, 'rgba(30,5,3,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - 30, y0, 60, y1 - y0); }
  c.restore();
  weaveOver(c, x0, y0, x1 - x0, Math.max(0, upto - y0), .5, .5);
  // the fell (the woven edge) and the bare warp below it, the shuttle's line
  if (upto < y1) {
    c.save(); c.strokeStyle = 'rgba(242,231,207,.85)'; c.lineWidth = 1.2;
    for (let x = x0 + 2; x < x1; x += 5) { c.beginPath(); c.moveTo(x, upto); c.lineTo(x + (hash(x) - .5) * 2, y1 + 120); c.stroke(); }
    c.fillStyle = 'rgba(20,8,4,.35)'; c.fillRect(x0, upto, x1 - x0, 3);
    c.restore();
  }
}
// the ghagra cloth: red-orange bandhani (dots tied in clusters of four), a mirror-work band and a gold gota hem;
// below `fray` its weft is pulled out: loose threads hang and drift downward
export function ghagra(c, x0, x1, y0, y1, o = {}) {
  const fray = o.fray ?? y1, drift = o.drift || 0, key = 'g' + [x0, x1, y0, y1].join(',');
  if (!CACHE[key]) { const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920; ghagraBody(cv.getContext('2d'), x0, x1, y0, y1); CACHE[key] = cv; }
  c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, fray - y0); c.clip(); c.drawImage(CACHE[key], 0, 0); c.restore();
  ghagraThreads(c, x0, x1, y1, fray, drift);
}
function ghagraBody(c, x0, x1, y0, y1) {
  const fray = y1;
  c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, fray - y0); c.clip();
  const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#b33a1a'); g.addColorStop(1, '#8e2412'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let y = y0 + 18, r = 0; y < y1 - 120; y += 34, r++) for (let x = x0 + 14 + (r % 2) * 17; x < x1; x += 34) {
    c.fillStyle = '#f0c24a'; for (const [dx, dy] of [[0, -4], [4, 0], [0, 4], [-4, 0]]) { c.beginPath(); c.arc(x + dx, y + dy, 2.2, 0, 7); c.fill(); }
  }
  // mirror band + gota
  c.fillStyle = '#3d0d08'; c.fillRect(x0, y1 - 120, x1 - x0, 70);
  for (let x = x0 + 26; x < x1; x += 52) { const gr = c.createRadialGradient(x - 3, y1 - 89, 1, x, y1 - 85, 13); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(.5, '#b8b4ae'); gr.addColorStop(1, '#5f5a55'); c.fillStyle = gr; c.beginPath(); c.arc(x, y1 - 85, 12, 0, 7); c.fill(); c.strokeStyle = '#d9a83a'; c.lineWidth = 3; c.stroke(); }
  const gg = c.createLinearGradient(0, y1 - 50, 0, y1); gg.addColorStop(0, '#f3d27a'); gg.addColorStop(.5, '#c99432'); gg.addColorStop(1, '#8a5f1a'); c.fillStyle = gg; c.fillRect(x0, y1 - 50, x1 - x0, 50);
  for (let x = x0; x < x1; x += 10) { c.fillStyle = 'rgba(90,55,10,.4)'; c.fillRect(x, y1 - 50, 2, 50); }
  for (let x = x0 + 30; x < x1; x += 66) { const gs = c.createLinearGradient(x - 33, 0, x + 33, 0); gs.addColorStop(0, 'rgba(0,0,0,0)'); gs.addColorStop(.5, 'rgba(40,5,0,.25)'); gs.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gs; c.fillRect(x - 33, y0, 66, y1 - y0); }
  c.restore();
  weaveOver(c, x0, y0, x1 - x0, fray - y0, .45, .5);
}
function ghagraThreads(c, x0, x1, y1, fray, drift) {
  if (fray < y1) {   // loose threads from the frayed edge, coloured as the cloth was
    c.save(); c.lineWidth = 1.6;
    for (let x = x0 + 2, i = 0; x < x1; x += 4.5, i++) {
      const col = ['#b33a1a', '#f0c24a', '#9e2a14', '#c99432'][i % 4], L = 30 + hash(i) * 60 + Math.max(0, 1240 - fray) * .12, sw = (hash(i * 3.1) - .5) * 60 + drift;
      c.strokeStyle = col; c.globalAlpha = .9; c.beginPath(); c.moveTo(x, fray); c.bezierCurveTo(x, fray + L * .4, x + sw * .6, fray + L * .7, x + sw, fray + L); c.stroke();
    }
    c.restore();
  }
}
