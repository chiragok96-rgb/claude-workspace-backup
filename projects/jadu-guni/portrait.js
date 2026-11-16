// Her portrait as ONE continuous line, designed backwards from the final picture (paper units, y down, she faces left).
// Chapters = verse lines:  spell (spiral → eye → kajal flick → brow)  ·  lips (nose, lips, chin, jaw, jhumka, neck)
//                          ·  mango blossom (head, hairline, hair flowing into a blossoming mango branch)  ·  night (scent curls → crescent moon)
function cr(pts) {   // Catmull-Rom through pts → SVG path
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}
// a spiral charm around (cx,cy), opening outward, ending at angle a1
function spiral(cx, cy, r0, r1, turns, a0) {
  const pts = [], n = Math.round(turns * 28);
  for (let i = 0; i <= n; i++) { const u = i / n, a = a0 + u * turns * Math.PI * 2, r = r0 + (r1 - r0) * Math.pow(u, .85); pts.push([+(cx + Math.cos(a) * r).toFixed(1), +(cy + Math.sin(a) * r * .82).toFixed(1)]); }
  return pts;
}
export const EYE = { x: -96, y: -96 };
// the eye, almond: front corner (left, toward the nose) → upper lid → outer corner → lower lid back
const EYE_UP = [[-128, -94], [-112, -108], [-92, -114], [-72, -108], [-60, -98]];
const EYE_LO = [[-60, -98], [-74, -88], [-94, -84], [-114, -87], [-127, -93]];
// mango blossom panicle: a short spine with a zigzag of buds (amba baula)
function panicle(x, y, ang, len) {
  const pts = [[x, y]], n = 7, c = Math.cos(ang), s = Math.sin(ang);
  for (let i = 1; i <= n; i++) { const u = i / n, w = 13 * (1 - u * .7) * (i % 2 ? 1 : -1); pts.push([+(x + c * len * u - s * w).toFixed(1), +(y + s * len * u + c * w).toFixed(1)]); }
  pts.push([+(x + c * len * 1.12).toFixed(1), +(y + s * len * 1.12).toFixed(1)]);
  return pts;
}
const back = pts => pts.slice().reverse();

export const SEGS = [
  { id: 'spell', style: 'adult', t: [0.07, 4.50], slowK: 2.0,
    parts: [
      { d: cr(spiral(EYE.x, EYE.y, 2, 34, 2.4, 0).concat([[-140, -84]])) },                       // the charm
      { d: cr([[-128, -94], ...EYE_UP.slice(1)]) },                                                   // upper lid
      { d: cr([[-60, -98], [-48, -106], [-32, -122]]) },                                              // kajal flick
      { d: cr([[-34, -118], ...EYE_LO.slice(1)]) },                                                   // lower lid back to the front corner
      { d: cr([[-150, -138], [-128, -150], [-96, -156], [-62, -150], [-44, -140]]) },                 // brow
    ],
    marks: [{ f: .02, t: .2 }, { f: .62, t: 2.85 }] },
  { id: 'lips', style: 'adult', t: [4.50, 8.96], slowK: 2.4,
    parts: [
      { d: cr([[-160, -150], [-166, -128], [-176, -100], [-194, -70], [-214, -42], [-206, -30], [-186, -24]]) },   // nose
      { d: cr([[-186, -24], [-190, -8], [-196, 4], [-184, 10], [-172, 16], [-186, 22], [-190, 32], [-180, 44]]) },   // lips
      { d: cr([[-180, 44], [-172, 64], [-166, 86], [-140, 112], [-100, 130], [-56, 128], [-18, 96], [6, 54]]) },   // chin, jaw
      { d: cr([[6, 54], [10, 64], [6, 74], [-12, 92], [8, 86], [28, 92], [10, 74]]) },                           // jhumka dome
      { d: cr([[10, 96], [-6, 106], [2, 116], [10, 106], [18, 116], [26, 106], [10, 96]]) },                       // bead drops
      { d: cr([[40, 86], [62, 150], [70, 220], [76, 290]]) },                                                     // back of the neck
      { d: cr([[76, 290], [20, 300], [-40, 296], [-52, 270], [-62, 200], [-76, 150]]) },                           // neckline, front of the neck
    ],
    marks: [{ at: [-172, 16], t: 6.9 }] },
  { id: 'mango', style: 'adult', t: [8.96, 13.40], slowK: 1.8,
    parts: [
      { d: cr([[-76, 150], [-62, 200], [-52, 270], [-40, 296], [20, 300], [76, 290], [70, 220], [62, 150], [40, 86]]) },  // (retrace: invisible)
      { d: cr([[40, 86], [96, 20], [142, -70], [150, -170], [126, -260], [60, -322], [-30, -334], [-104, -300], [-146, -236], [-160, -160]]) }, // head, hairline
      { d: cr([[-160, -160], [-146, -236], [-104, -300], [-30, -334], [60, -322]]) },                               // (retrace up)
      { d: cr([[60, -322], [160, -300], [250, -330], [330, -380], [400, -440], [470, -520]]) },                    // hair becomes a branch
      { d: cr(panicle(330, -380, -2.2, 90)) }, { d: cr(panicle(400, -440, -.6, 100)) }, { d: cr(panicle(470, -520, -1.4, 110)) },
    ],
    marks: [{ at: [60, -322], n: 2, t: 11.25 }] },
  { id: 'night', style: 'adult', t: [13.40, 16.20], slowK: 1.6,
    parts: [
      { d: cr([[478, -634], [430, -660], [380, -630], [330, -660], [270, -628], [210, -660], [150, -630], [96, -640]]) },   // scent curl drifting
      { d: cr([[96, -640], [40, -690], [-30, -700], [-82, -660], [-96, -600], [-70, -548], [-10, -530], [30, -548], [-14, -556], [-48, -590], [-48, -640], [-14, -680], [40, -690]]) }, // crescent moon
    ] },
];
