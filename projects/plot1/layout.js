// The neighbourhood, in real metres (x east, z south; the plate spans x −90…90, z −120…120). One plan feeds the model, the projector
// and the printed map, so the map always lies exactly on the model. The story: a public road (plot ୧୦୨୪, Odisha Sarkar) along the
// south; a lane north off it to our plot ୩୪୨ — the lane looks public but is its own plot ୩୪୧, recorded in the neighbour's name.
export const OD = n => String(n).replace(/\d/g, d => '୦୧୨୩୪୫୬୭୮୯'[d]);
const R = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
export const ROAD = [-90, 70, 90, 80];          // public road, plot 1024
export const LANE = [2, -10, 7, 70];            // the lane, plot 341
export const OURS = [-4, -34, 14, -10];         // our plot, 342
export const GATE = [2, 7, 63.5];               // the gate across the lane: x0, x1, z
export const NEIGH = [-40, -10, 2, 70];         // the neighbour's plot 340 (his house and compound)
export const POND = [-82, -102, -56, -72];
export const PLOTS = [
  { n: 1024, poly: R(...ROAD), kind: 'road' },
  { n: 341, poly: R(...LANE), kind: 'lane' },
  { n: 342, poly: R(...OURS), kind: 'ours', pegs: 1 },
  { n: 340, poly: R(...NEIGH), kind: 'neigh' },
  { n: 343, poly: R(7, 30, 32, 70) }, { n: 344, poly: R(7, -10, 32, 30) }, { n: 345, poly: R(32, 30, 60, 70) }, { n: 346, poly: R(32, -10, 60, 30) },
  { n: 347, poly: R(60, -10, 90, 70) },
  { n: 336, poly: R(-4, -60, 14, -34), pegs: 1 }, { n: 337, poly: R(14, -60, 40, -10) }, { n: 338, poly: R(40, -60, 90, -10) }, { n: 335, poly: R(-40, -60, -4, -10), pegs: 1 },
  { n: 301, poly: R(-90, -120, -40, -60) }, { n: 302, poly: R(-40, -120, 20, -60) }, { n: 303, poly: R(20, -120, 90, -60) },
  { n: 339, poly: R(-90, -60, -40, 20) }, { n: 333, poly: R(-90, 20, -40, 70) },
  { n: 1101, poly: R(-90, 80, -30, 120) }, { n: 1102, poly: R(-30, 80, 30, 120) }, { n: 1103, poly: R(30, 80, 90, 120) },
];
// houses: x0, z0, x1, z1, floors, door face
export const HOUSES = [
  [-32, 22, -12, 42, 2, 'e'],                               // the neighbour's house
  [12, 40, 28, 62, 2, 'w'], [12, 2, 26, 22, 1, 'w'], [38, 36, 56, 62, 3, 's'], [38, 0, 54, 24, 2, 's'], [66, 10, 84, 40, 2, 'w'], [66, 48, 84, 66, 1, 's'],
  [-80, -40, -56, -14, 2, 'e'], [-82, -2, -60, 14, 1, 'e'], [-80, 28, -56, 52, 2, 's'],
  [-80, 88, -60, 108, 2, 'n'], [-50, 88, -36, 106, 1, 'n'], [-20, 88, 0, 110, 3, 'n'], [6, 90, 22, 106, 2, 'n'], [38, 88, 58, 108, 2, 'n'], [66, 90, 84, 110, 2, 'n'],
  [20, -50, 34, -30, 1, 's'], [50, -52, 70, -26, 2, 's'],
];
export const HOME = 5;     // index of the house whose window glows at the end (66,10 → 84,40, two floors)
// palms: x, z, height, lean direction
export const PALMS = [[-60, -66, 13, .5], [-52, -70, 11, 2.2], [-86, -64, 12.5, 1], [-44, -104, 12, 4], [-30, -6, 12, .2], [-36, 58, 11, 3.5], [10, -2, 10.5, 5.5],
  [30, 66, 12, 1.2], [58, 68, 13, 2], [-64, 76, 11, .8], [16, -40, 12, 3], [-10, -56, 11.5, .6], [86, 2, 12, 4.4], [-88, 60, 12, 1.4], [44, -70, 11, 2.6], [76, -64, 12, 5], [-22, 67, 11.5, 2], [-52, 67, 12, 4.2], [40, 83, 12.5, 1], [64, 4, 11, 3.3], [-70, 22, 12, 5.1], [24, -26, 10.5, .4], [-24, 4, 12.5, 1.9]];
export const TREES = [[-20, 68, 3.2], [-50, 68, 3], [40, 82, 3.4], [-8, 82, 3], [64, 4, 3.2], [-70, 22, 3.4], [24, -26, 2.8], [-26, 4, 3.6], [86, 84, 3], [-86, 116, 3.2]];
// people (scale figures): x, z, rotation, pose. 0 = the buyer at our plot, 1 = the neighbour behind his gate
export const FIGS = [[4, -20, Math.PI, 0], [-3.2, 60.5, -Math.PI / 2.6, 1], [-40, 76, Math.PI / 2, 0], [-37, 77.5, Math.PI / 2, 0], [52, 74, -Math.PI / 2, 0], [36, 34, 0, 0], [-60, 18, .5, 0]];
