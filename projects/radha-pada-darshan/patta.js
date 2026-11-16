// Pattachitra kit: Raghurajpur painting on primed cloth, in code.
// The chitrakar's order is kept: the cloth is primed (chalk + tamarind gum), the border is drawn, then flat mineral colours
// (hingula red, haritala yellow, conch white, lamp black, indigo, leaf green) are laid, and last a fine black brush line goes round
// everything and adds the ornaments (white dots, petals, creepers). Every figure is drawn in its own local units (feet at y = 0).
export const PIG = {
  red: '#b8321f', redD: '#8e2416', yel: '#e2ad2c', yelD: '#c98f1e', ochre: '#c47a32', white: '#f2ead6', cream: '#ead9b4',
  black: '#1b1611', blue: '#2f5f9e', blueD: '#1f3f73', indigo: '#1d2a4d', green: '#4d7a3c', greenD: '#2f5428', skin: '#e8b98a', skinD: '#c99364',
  pink: '#d77d6a', grey: '#8a8170', night: '#151a2c',
};
let TEX = null, TEXP = null;
export function initPatta(tex) { TEX = tex; }
const rng = s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

// ---------- the cloth ----------
export function cloth(c, col, x = 0, y = 0, w = c.canvas.width, h = c.canvas.height) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = col; c.fillRect(x, y, w, h);
  if (TEX) { c.globalCompositeOperation = 'multiply'; c.globalAlpha = .85; c.drawImage(TEX, 0, 0, c.canvas.width, c.canvas.height); }
  c.restore();
}
export function texOver(c, a = .55) {   // the cloth texture over painted colour (after the paint is laid)
  if (!TEX) return; c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = a; c.drawImage(TEX, 0, 0, c.canvas.width, c.canvas.height); c.restore();
}

// ---------- paint and line ----------
// p: a function that builds a path on c (in the current transform). Fill flat, then the black outline.
export function paint(c, p, fill, o = {}) {
  c.beginPath(); p(c);
  if (fill) { c.fillStyle = fill; c.fill(o.rule || 'nonzero'); }
  if (o.line !== false) line(c, p, o.lw || 2.2, o.ink || PIG.black, o.closed);
}
export function line(c, p, lw = 2.2, ink = PIG.black) {
  const sc = Math.hypot(c.getTransform().a, c.getTransform().b) || 1;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = ink;
  c.lineWidth = lw / sc; c.beginPath(); p(c); c.stroke();
  c.globalAlpha = .35; c.lineWidth = lw * 1.6 / sc; c.beginPath(); p(c); c.stroke();      // the brush swells a little on curves
  c.restore();
}
export function dots(c, pts, r = 2.6, col = PIG.white) { c.save(); c.fillStyle = col; const sc = Math.hypot(c.getTransform().a, c.getTransform().b) || 1; for (const [x, y] of pts) { c.beginPath(); c.arc(x, y, r / sc, 0, 7); c.fill(); } c.restore(); }
export function along(p0, p1, n) { const a = []; for (let i = 0; i < n; i++) { const t = (i + .5) / n; a.push([p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t]); } return a; }
// sample a cubic bezier
export function bez(p0, p1, p2, p3, n) { const a = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; a.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return a; }
const poly = pts => c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); };

// ---------- ornament ----------
export function petal(c, x, y, len, wid, ang, fill, o = {}) {
  c.save(); c.translate(x, y); c.rotate(ang);
  paint(c, k => { k.moveTo(0, 0); k.bezierCurveTo(wid, -len * .25, wid * .7, -len * .8, 0, -len); k.bezierCurveTo(-wid * .7, -len * .8, -wid, -len * .25, 0, 0); }, fill, o);
  c.restore();
}
export function rosette(c, x, y, r, n, fill, centre = PIG.yel, o = {}) {   // the pattachitra flower: petals round a dotted centre
  for (let i = 0; i < n; i++) petal(c, x, y, r, r * .42, i / n * Math.PI * 2, fill, o);
  paint(c, k => k.arc(x, y, r * .32, 0, 7), centre, o);
}
// a creeper (latā) along a straight band: a waving stem with leaves and little flowers, the border's classic filling
export function creeper(c, x0, x1, y, amp, col = PIG.white, leaf = PIG.white, step = 46) {
  c.save(); c.strokeStyle = col; const sc = Math.hypot(c.getTransform().a, c.getTransform().b) || 1; c.lineWidth = 2.4 / sc; c.lineCap = 'round';
  c.beginPath(); for (let x = x0; x <= x1; x += 3) { const yy = y + Math.sin((x - x0) / step * Math.PI) * amp; x === x0 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke();
  c.fillStyle = leaf;
  for (let x = x0 + step / 2, k = 0; x < x1; x += step, k++) {
    const s = k % 2 ? 1 : -1, yy = y + Math.sin((x - x0) / step * Math.PI) * amp;
    c.save(); c.translate(x, yy); c.rotate(s * .9);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(amp * .55, -amp * .45 * s, amp * 1.1, 0); c.quadraticCurveTo(amp * .55, amp * .45 * s, 0, 0); c.fill(); c.restore();
    c.beginPath(); c.arc(x, yy - s * amp * .95, amp * .22, 0, 7); c.fill();
  }
  c.restore();
}
// the painted border: black outer band with a white creeper, a red band with white dots, a yellow band of petals, thin rules.
export function border(c, x, y, w, h, o = {}) {
  const B = o.b || 54, R = o.r || 18, P = o.p || 26;
  c.save();
  c.fillStyle = PIG.black; c.beginPath(); c.rect(x, y, w, h); c.rect(x + B, y + B, w - 2 * B, h - 2 * B); c.fill('evenodd');
  creeper(c, x + 20, x + w - 20, y + B / 2, 9); creeper(c, x + 20, x + w - 20, y + h - B / 2, 9);
  c.save(); c.translate(x + B / 2, y + 20); c.rotate(Math.PI / 2); creeper(c, 0, h - 40, 0, 9); c.restore();
  c.save(); c.translate(x + w - B / 2, y + 20); c.rotate(Math.PI / 2); creeper(c, 0, h - 40, 0, 9); c.restore();
  const x1 = x + B, y1 = y + B, w1 = w - 2 * B, h1 = h - 2 * B;
  c.fillStyle = PIG.red; c.beginPath(); c.rect(x1, y1, w1, h1); c.rect(x1 + R, y1 + R, w1 - 2 * R, h1 - 2 * R); c.fill('evenodd');
  const dd = []; for (let t = 0; t < w1; t += 15) { dd.push([x1 + t + 7, y1 + R / 2], [x1 + t + 7, y1 + h1 - R / 2]); } for (let t = 0; t < h1; t += 15) { dd.push([x1 + R / 2, y1 + t + 7], [x1 + w1 - R / 2, y1 + t + 7]); }
  dots(c, dd, 2.4);
  const x2 = x1 + R, y2 = y1 + R, w2 = w1 - 2 * R, h2 = h1 - 2 * R;
  c.fillStyle = PIG.yel; c.beginPath(); c.rect(x2, y2, w2, h2); c.rect(x2 + P, y2 + P, w2 - 2 * P, h2 - 2 * P); c.fill('evenodd');
  const pe = (px, py, a) => petal(c, px, py, P * .82, P * .36, a, PIG.red, { lw: 1.4 });
  for (let t = P; t < w2 - P / 2; t += P * .9) { pe(x2 + t, y2 + P * .92, 0); pe(x2 + t, y2 + h2 - P * .92, Math.PI); }
  for (let t = P; t < h2 - P / 2; t += P * .9) { pe(x2 + P * .92, y2 + t, -Math.PI / 2 + Math.PI); pe(x2 + w2 - P * .92, y2 + t, -Math.PI / 2); }
  c.strokeStyle = PIG.black; c.lineWidth = 2; for (const [a, b, ww, hh] of [[x1, y1, w1, h1], [x2, y2, w2, h2], [x2 + P, y2 + P, w2 - 2 * P, h2 - 2 * P]]) c.strokeRect(a, b, ww, hh);
  c.restore();
  return [x2 + P, y2 + P, w2 - 2 * P, h2 - 2 * P];   // the inner picture field
}

// ---------- faces ----------
// The profile head, facing right, of pattachitra: forehead and nose one long line, the long almond eye drawn almost to the ear,
// arched brow, small mouth, round chin. Local units: the eye corner at (0,0), head about 110 tall.
export function face(c, o = {}) {
  const skin = o.skin || PIG.skin;
  const P = k => { k.moveTo(-58, -78); k.bezierCurveTo(-10, -96, 30, -80, 36, -52); k.lineTo(52, 2); k.quadraticCurveTo(56, 12, 44, 14);   // forehead → nose tip
    k.quadraticCurveTo(40, 22, 44, 26); k.quadraticCurveTo(46, 33, 38, 34); k.quadraticCurveTo(42, 40, 36, 46); k.quadraticCurveTo(26, 62, 2, 58);   // lips, chin
    k.bezierCurveTo(-30, 56, -52, 38, -60, 14); k.lineTo(-62, -40); k.closePath(); };
  paint(c, P, skin, { lw: 2 });
  // eye: a long almond with the iris near the front
  paint(c, k => { k.moveTo(30, -6); k.bezierCurveTo(14, -24, -26, -22, -44, -4); k.bezierCurveTo(-24, 6, 10, 8, 30, -6); }, PIG.white, { lw: 1.8 });
  paint(c, k => k.arc(14, -7, 6.5, 0, 7), PIG.black, { line: false });
  line(c, k => { k.moveTo(32, -24); k.bezierCurveTo(14, -40, -22, -38, -44, -20); }, 2.4);          // brow
  line(c, k => { k.moveTo(-44, -4); k.lineTo(-58, 2); }, 1.6);                                          // the eye's long tail
  paint(c, k => { k.moveTo(44, 26); k.quadraticCurveTo(36, 22, 32, 28); k.quadraticCurveTo(38, 34, 44, 26); }, PIG.red, { lw: 1.2 });
  if (o.tilak) paint(c, k => { k.moveTo(28, -62); k.lineTo(33, -44); k.lineTo(23, -44); k.closePath(); }, o.tilak, { lw: 1 });
  if (o.ear !== false) { paint(c, k => k.ellipse(-36, 6, 9, 15, 0, 0, 7), skin, { lw: 1.6 }); }
}

// ---------- Gopinath ----------
// Krishna as Gopala playing the flute, in tribhanga, facing right. Feet at (0,0), crown top near y = -1000.
export function gopinath(c, x, y, s, o = {}) {
  const B = o.skin || PIG.blue, BD = PIG.blueD;
  c.save(); c.translate(x, y); c.scale(s, s);
  // the far leg (straight, carries the weight) and the near leg crossed in front, toes down
  paint(c, k => { k.moveTo(-34, -300); k.bezierCurveTo(-40, -200, -30, -90, -36, -22); k.quadraticCurveTo(-40, 0, -18, 2); k.lineTo(26, 2); k.quadraticCurveTo(30, -10, 2, -24); k.bezierCurveTo(6, -110, 18, -210, 14, -300); k.closePath(); }, BD);
  paint(c, k => { k.moveTo(10, -300); k.bezierCurveTo(30, -210, 70, -130, 48, -40); k.quadraticCurveTo(40, -6, 22, 6); k.quadraticCurveTo(12, 14, 6, 4); k.quadraticCurveTo(16, -20, 18, -44); k.bezierCurveTo(26, -120, -10, -200, -30, -300); k.closePath(); }, B);
  dots(c, [[-28, -30], [-20, -34], [-10, -34], [0, -30]], 2.2, PIG.yel); dots(c, [[26, -36], [34, -32], [40, -24]], 2.2, PIG.yel);   // anklets
  // the yellow dhoti, flared, with the front pleat fan and a red border
  const dh = k => { k.moveTo(-96, -520); k.bezierCurveTo(-110, -420, -120, -330, -96, -250); k.quadraticCurveTo(-30, -268, 40, -250); k.quadraticCurveTo(96, -238, 112, -262); k.bezierCurveTo(108, -360, 92, -460, 86, -520); k.closePath(); };
  paint(c, dh, PIG.yel);
  for (let i = 0; i < 6; i++) line(c, k => { k.moveTo(-40 + i * 22, -505); k.bezierCurveTo(-46 + i * 24, -420, -52 + i * 26, -330, -50 + i * 27, -258); }, 1.4);
  paint(c, k => { k.moveTo(-96, -262); k.quadraticCurveTo(-30, -280, 40, -262); k.quadraticCurveTo(96, -250, 112, -274); k.lineTo(112, -262); k.quadraticCurveTo(96, -238, 40, -250); k.quadraticCurveTo(-30, -268, -96, -250); k.closePath(); }, PIG.red, { lw: 1.4 });
  paint(c, k => { k.moveTo(10, -470); k.bezierCurveTo(36, -400, 22, -300, 40, -200); k.lineTo(10, -196); k.bezierCurveTo(4, -300, -12, -400, -6, -470); k.closePath(); }, PIG.yelD, { lw: 1.6 });   // the pleat fan
  dots(c, along([-90, -500], [80, -500], 12), 2.2, PIG.red);
  // torso, swaying the other way (tribhanga), a red sash at the waist
  paint(c, k => { k.moveTo(-82, -520); k.bezierCurveTo(-96, -600, -88, -680, -76, -730); k.quadraticCurveTo(-20, -770, 40, -742); k.bezierCurveTo(70, -690, 84, -600, 84, -520); k.closePath(); }, B);
  paint(c, k => { k.moveTo(-90, -540); k.quadraticCurveTo(0, -560, 90, -540); k.lineTo(92, -510); k.quadraticCurveTo(0, -530, -92, -510); k.closePath(); }, PIG.red, { lw: 1.6 });
  paint(c, k => { k.moveTo(86, -528); k.quadraticCurveTo(128, -470, 116, -380); k.lineTo(100, -384); k.quadraticCurveTo(108, -460, 74, -510); k.closePath(); }, PIG.red, { lw: 1.4 });   // the sash end
  // the garland (vanamala) to the knees, and the necklaces
  line(c, k => { k.moveTo(-70, -730); k.bezierCurveTo(-110, -560, -60, -330, 8, -250); k.bezierCurveTo(40, -320, 76, -560, 30, -742); }, 2);
  for (let t = 0; t <= 1; t += .055) { const p = bez([-70, -730], [-110, -560], [-60, -330], [8, -250], 1)[0]; }
  const g1 = bez([-70, -730], [-110, -560], [-60, -330], [8, -250], 18), g2 = bez([8, -250], [40, -320], [76, -560], [30, -742], 18);
  for (const [px, py] of [...g1, ...g2]) rosette(c, px, py, 9, 5, PIG.red, PIG.yel, { lw: 1 });
  line(c, k => { k.moveTo(-60, -736); k.quadraticCurveTo(-14, -680, 26, -738); }, 1.8); dots(c, bez([-60, -736], [-38, -704], [4, -700], [26, -738], 9), 2.6, PIG.yel);
  // the arms: both raised to the flute, which runs out to the right at the mouth
  paint(c, k => { k.moveTo(-70, -728); k.bezierCurveTo(-110, -680, -60, -640, 4, -660); k.quadraticCurveTo(40, -672, 64, -700); k.lineTo(52, -720); k.quadraticCurveTo(22, -690, -10, -690); k.bezierCurveTo(-50, -690, -54, -712, -40, -738); k.closePath(); }, B);
  paint(c, k => { k.moveTo(30, -740); k.bezierCurveTo(70, -720, 120, -690, 176, -720); k.lineTo(170, -742); k.bezierCurveTo(124, -716, 84, -742, 44, -760); k.closePath(); }, B);
  // the flute
  paint(c, k => { k.moveTo(36, -778); k.lineTo(330, -742); k.lineTo(328, -730); k.lineTo(34, -766); k.closePath(); }, PIG.yel, { lw: 1.6 });
  dots(c, along([120, -763], [300, -741], 6), 2.2, PIG.black);
  // hands on the flute
  paint(c, k => k.ellipse(66, -712, 18, 12, -.3, 0, 7), B, { lw: 1.6 }); paint(c, k => k.ellipse(176, -734, 18, 12, -.1, 0, 7), B, { lw: 1.6 });
  dots(c, [[-44, -700], [-36, -696], [-28, -694], [130, -716], [140, -712], [150, -712]], 2.4, PIG.yel);   // armlets
  // neck and head (profile to the right, lips to the flute)
  paint(c, k => { k.moveTo(-26, -748); k.lineTo(-24, -800); k.lineTo(16, -800); k.lineTo(20, -748); k.closePath(); }, B);
  c.save(); c.translate(6, -842); c.scale(.92, .92); face(c, { skin: B, tilak: PIG.white }); c.restore();
  // ear ornament
  paint(c, k => k.arc(-34, -820, 9, 0, 7), PIG.yel, { lw: 1.4 });
  // the crown (mukuta): banded, tapering, a lotus finial, the peacock feather sweeping back
  paint(c, k => { k.moveTo(-58, -914); k.bezierCurveTo(-60, -950, -40, -1000, -14, -1040); k.lineTo(4, -1040); k.bezierCurveTo(30, -1000, 40, -950, 38, -914); k.closePath(); }, PIG.yel);
  for (const yy of [-934, -962, -990]) line(c, k => { k.moveTo(-58 + (yy + 934) * -.1, yy); k.quadraticCurveTo(-10, yy - 8, 38 - (yy + 934) * .25, yy); }, 1.6);
  dots(c, along([-52, -948], [32, -948], 6), 2.6, PIG.red); dots(c, along([-40, -976], [24, -976], 5), 2.6, PIG.white);
  paint(c, k => { k.moveTo(-60, -912); k.quadraticCurveTo(-10, -930, 40, -912); k.lineTo(44, -896); k.quadraticCurveTo(-10, -914, -66, -896); k.closePath(); }, PIG.red, { lw: 1.6 });
  // peacock feather: a long curved shaft back over the head, a green-blue eye at its end
  line(c, k => { k.moveTo(-24, -1020); k.bezierCurveTo(-80, -1100, -170, -1090, -210, -1010); }, 2.4);
  for (let i = 0; i < 14; i++) { const p = bez([-24, -1020], [-80, -1100], [-170, -1090], [-210, -1010], 14)[i]; line(c, k => { k.moveTo(p[0], p[1]); k.lineTo(p[0] - 10, p[1] - 22); }, 1.2, PIG.greenD); line(c, k => { k.moveTo(p[0], p[1]); k.lineTo(p[0] + 8, p[1] + 20); }, 1.2, PIG.greenD); }
  paint(c, k => k.ellipse(-214, -1000, 26, 18, -.9, 0, 7), PIG.green, { lw: 1.6 }); paint(c, k => k.ellipse(-214, -1000, 15, 10, -.9, 0, 7), PIG.blue, { lw: 1.2 }); paint(c, k => k.ellipse(-214, -1000, 6, 4, -.9, 0, 7), PIG.yel, { lw: 1 });
  // hair falling behind the shoulders
  paint(c, k => { k.moveTo(-60, -880); k.bezierCurveTo(-90, -840, -94, -780, -80, -732); k.lineTo(-62, -746); k.bezierCurveTo(-72, -790, -62, -840, -40, -870); k.closePath(); }, PIG.black, { lw: 1.4 });
  c.restore();
}

// ---------- feet ----------
// A foot seen from the front, as on an idol at darshan: the dorsum narrowing to the ankle, five toes along the ground, the big toe
// on the inner side. Local units: the ground at y = 0, toes about 110 wide, ankle at y ≈ -130. m = -1 mirrors it (the other foot).
// o: skin, alta (red rim on the toes and sole edge, a dotted circle on the dorsum), anklet, toering, tiptoe (0..1, rises onto the toes).
export function foot(c, x, y, s, m = 1, o = {}) {
  const skin = o.skin || PIG.skin, tip = o.tiptoe || 0;
  c.save(); c.translate(x, y); c.scale(s * m, s);
  if (tip) { c.translate(0, 0); c.scale(1 - tip * .28, 1 + tip * .18); }
  const leg = o.leg == null ? 230 : o.leg;
  // leg and dorsum as one shape
  paint(c, k => { k.moveTo(-30, -leg); k.bezierCurveTo(-34, -190, -40, -150, -44, -122); k.quadraticCurveTo(-52, -104, -46, -90);
    k.bezierCurveTo(-58, -60, -62, -36, -58, -16); k.lineTo(58, -18); k.bezierCurveTo(60, -50, 46, -80, 34, -112); k.quadraticCurveTo(38, -128, 30, -140);
    k.bezierCurveTo(28, -170, 30, -200, 28, -leg); k.closePath(); }, skin, { lw: 2 });
  line(c, k => { k.moveTo(-8, -112); k.quadraticCurveTo(10, -70, 24, -40); }, 1.1, 'rgba(27,22,17,.45)');     // the tendon to the big toe
  // toes, outer to inner (painted in that order so the big toe overlaps)
  const T = [[-48, -9, 8, 10], [-32, -11, 9.5, 12], [-14, -12, 10.5, 13], [6, -13, 12, 15], [33, -16, 18, 19]];
  for (const [tx, ty, rx, ry] of T) {
    paint(c, k => k.ellipse(tx, ty, rx, ry, 0, 0, 7), skin, { lw: 1.6 });
    if (o.alta) { c.save(); c.beginPath(); c.ellipse(tx, ty, rx, ry, 0, 0, 7); c.clip(); c.fillStyle = PIG.red; c.fillRect(tx - rx - 2, ty + ry * .25, rx * 2 + 4, ry); c.restore(); line(c, k => k.ellipse(tx, ty, rx, ry, 0, 0, 7), 1.6); }
    paint(c, k => k.ellipse(tx, ty - ry * .38, rx * .5, ry * .3, 0, 0, 7), 'rgba(255,240,225,.85)', { lw: .9 });   // nail
  }
  if (o.alta) {
    paint(c, k => { k.moveTo(-60, -14); k.lineTo(60, -16); k.lineTo(60, -6); k.quadraticCurveTo(0, 4, -60, -4); k.closePath(); }, PIG.red, { lw: 1.4 });
    paint(c, k => k.arc(0, -66, 13, 0, 7), PIG.red, { lw: 1.4 }); dots(c, [[0, -66]], 3.4, skin);
    const ring = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; ring.push([Math.cos(a) * 22, -66 + Math.sin(a) * 22]); } dots(c, ring, 2.2, PIG.red);
  }
  if (o.toering) paint(c, k => k.rect(-1, -26, 14, 6), '#d9d4c4', { lw: 1.1 });
  if (o.anklet) {   // nupura: a band, a row of bells under it
    paint(c, k => { k.moveTo(-48, -128); k.quadraticCurveTo(-8, -118, 36, -132); k.lineTo(36, -118); k.quadraticCurveTo(-8, -104, -50, -114); k.closePath(); }, o.anklet, { lw: 1.4 });
    for (let i = 0; i < 8; i++) { const px = -42 + i * 10.5, py = -108 + Math.sin(i / 7 * Math.PI) * 4; paint(c, k => k.arc(px, py + 7, 4.4, 0, 7), o.anklet, { lw: 1 }); }
  }
  c.restore();
}
// Krishna's crossed feet (tribhanga): the right foot planted, the left crossed in front, up on its toes.
export function crossedFeet(c, x, y, s, o = {}) {
  const sk = o.skin || PIG.blue;
  foot(c, x - 34 * s, y, s, 1, { skin: sk, anklet: PIG.yel, leg: 300 });
  c.save(); c.translate(x + 30 * s, y); c.rotate(-.16);
  foot(c, 0, 0, s, -1, { skin: sk, anklet: PIG.yel, tiptoe: .7, leg: 330 });
  c.restore();
}
// A footprint seen from above, as alta (or rice paste) leaves it: the sole and five toe dots. Facing up (toes at -y).
export function footprint(c, x, y, s, ang = 0, col = PIG.red, m = 1, a = 1) {
  c.save(); c.translate(x, y); c.rotate(ang); c.scale(s * m, s); c.globalAlpha *= a; c.fillStyle = col;
  c.beginPath(); c.moveTo(0, 60); c.bezierCurveTo(-24, 58, -26, 30, -20, 6); c.bezierCurveTo(-16, -14, -28, -30, -22, -46); c.bezierCurveTo(-16, -62, 16, -62, 22, -44);
  c.bezierCurveTo(26, -26, 18, -8, 20, 14); c.bezierCurveTo(22, 40, 22, 60, 0, 60); c.fill();
  for (const [tx, ty, r] of [[16, -76, 9], [-1, -80, 7], [-14, -76, 6], [-24, -68, 5], [-31, -57, 4.4]]) { c.beginPath(); c.arc(tx, ty, r, 0, 7); c.fill(); }
  c.restore();
}
// the stone pedestal (ratna-vedi): stepped mouldings, a lotus-petal course, a dotted band
export function pedestal(c, x, y, w, o = {}) {
  const col = o.col || PIG.ochre;
  c.save(); c.translate(x, y);
  paint(c, k => k.rect(-w / 2, 0, w, 26), col); paint(c, k => k.rect(-w / 2 - 14, 26, w + 28, 22), PIG.yelD); paint(c, k => k.rect(-w / 2 - 28, 48, w + 56, 30), col);
  for (let px = -w / 2 + 16; px < w / 2 - 8; px += 30) petal(c, px, 26, 22, 10, Math.PI, PIG.red, { lw: 1.1 });
  dots(c, along([-w / 2 - 20, 63], [w / 2 + 20, 63], Math.round(w / 14)), 2.4, PIG.white);
  c.restore();
}
