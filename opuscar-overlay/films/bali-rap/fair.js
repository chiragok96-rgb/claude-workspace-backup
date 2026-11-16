// The fair on the Mahanadi's riverbed, as a low-poly isometric island at night (grammar of styles/lowpoly-island):
// flat-shaded hex tiles, stalls with striped canopies that pop in on the beat, the Ramdoli, a merry-go-round, Killa Maidan's
// fort gate, little people, festoons of bulbs; the far bank is Cuttack with lit windows.
import * as THREE from 'three';
import { clamp, seg, ss, eo, back, lerp, hash, TAU } from '/core/lib.js';

const SQ3 = Math.sqrt(3);
export const hex2w = (q, r) => [SQ3 * (q + r / 2) * .5, 1.5 * r * .5];   // tiles of radius .5
const MC = new Map();
export function mat(hex, o = {}) { const k = hex + JSON.stringify(o); if (!MC.has(k)) MC.set(k, new THREE.MeshStandardMaterial({ color: hex, flatShading: true, roughness: .85, metalness: 0, ...o })); return MC.get(k); }
const glow = (hex, i = 2.2) => new THREE.MeshStandardMaterial({ color: '#000', emissive: hex, emissiveIntensity: i, flatShading: true });
const M = (g, m, cast = true) => { const x = new THREE.Mesh(g, m); x.castShadow = cast; x.receiveShadow = true; return x; };
export const PAL = {
  sandTop: '#e8cf98', sandSide: '#cdb07a', grass: '#7fae5e', grass2: '#6fa152', earth: '#a8825a', stone: '#c9bfae', stoneD: '#a89d8c',
  canopy: ['#e0413a', '#f2b632', '#2f74c8', '#e45d9b', '#33a46a', '#f07a2c', '#7a4fc0', '#17a5a8'],
  walls: ['#fbf3e6', '#f5c2b0', '#b5dccb', '#a9cbe8', '#f7df8f', '#e9c9e6'], roofs: ['#c9504a', '#4f7fb8', '#e0874f', '#3f8f86'],
  skin: ['#8a5a3c', '#a06a46', '#6e4630', '#b5815c'], cloth: ['#e0413a', '#f2b632', '#2f74c8', '#e45d9b', '#33a46a', '#fbf3e6', '#7a4fc0', '#f07a2c', '#17a5a8', '#333a48'],
};
const BULB = ['#ffd27a', '#ff6a5a', '#6ad0ff', '#fff2c8', '#9dff7a', '#ff8ad0'];

function hexPrism(r, h, top, side, y0 = -1.2) {
  const g = new THREE.Group();
  const body = M(new THREE.CylinderGeometry(r * .985, r * .985, h - .06 - y0, 6, 1), mat(side)); body.position.y = (h - .06 + y0) / 2; g.add(body);
  const cap = M(new THREE.CylinderGeometry(r, r, .1, 6, 1), mat(top)); cap.position.y = h - .05; g.add(cap);
  return g;
}
function gable(w, d, h, over = .04) {
  const W = w / 2 + over, D = d / 2 + over, g = new THREE.BufferGeometry();
  const v = [-W, 0, -D, W, h, 0, W, 0, -D, -W, 0, -D, -W, h, 0, W, h, 0, -W, 0, D, W, h, 0, -W, h, 0, -W, 0, D, W, 0, D, W, h, 0, -W, 0, -D, W, 0, D, -W, 0, D, -W, 0, -D, W, 0, -D, W, 0, D];
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
}
// a striped canopy: alternating colour / white panels as thin prisms
function canopy(w, d, col) {
  const g = new THREE.Group(), n = 6;
  for (let i = 0; i < n; i++) { const p = M(new THREE.BoxGeometry(w / n + .002, .035, d), mat(i % 2 ? '#fbf3e6' : col)); p.position.x = -w / 2 + (i + .5) * w / n; g.add(p); }
  // scalloped valance
  for (let i = 0; i < n; i++) { const v = M(new THREE.ConeGeometry(w / n / 2, .08, 3), mat(i % 2 ? '#fbf3e6' : col)); v.rotation.x = Math.PI; v.position.set(-w / 2 + (i + .5) * w / n, -.05, d / 2); g.add(v); }
  g.rotation.x = .22; return g;
}
function stall(i) {
  const g = new THREE.Group(), col = PAL.canopy[i % 8], w = .62, d = .46;
  const body = M(new THREE.BoxGeometry(w, .34, d), mat('#3a2a22')); body.position.y = .17; g.add(body);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(w * .86, .2), glow(['#ffc676', '#ffe0a8', '#ffb060'][i % 3], 1.6 + hash(i) * .8)); win.position.set(0, .2, d / 2 + .003); g.add(win);
  const ct = M(new THREE.BoxGeometry(w * .95, .05, .12), mat('#7d5436')); ct.position.set(0, .14, d / 2 + .05); g.add(ct);
  const c = canopy(w + .06, d + .14, col); c.position.set(0, .42, .04); g.add(c);
  for (const s of [-1, 1]) { const pole = M(new THREE.CylinderGeometry(.012, .012, .42, 4), mat('#2a2a30')); pole.position.set(s * w / 2, .21, d / 2 + .1); g.add(pole); }
  // goods on the counter: little coloured lumps
  for (let k = 0; k < 4; k++) { const b = M(new THREE.IcosahedronGeometry(.035, 0), mat(PAL.canopy[(i + k * 3) % 8])); b.position.set(-.2 + k * .13, .19, d / 2 + .06); g.add(b); }
  return g;
}
function person(i) {
  const g = new THREE.Group(), cl = PAL.cloth[Math.floor(hash(i * 3.1) * PAL.cloth.length)], sk = PAL.skin[i % 4];
  const body = M(new THREE.CylinderGeometry(.03, .045, .13, 6), mat(cl)); body.position.y = .095; g.add(body);
  const legs = M(new THREE.CylinderGeometry(.028, .025, .05, 5), mat(hash(i * 7) > .5 ? '#2a2f3a' : cl)); legs.position.y = .025; g.add(legs);
  const head = M(new THREE.IcosahedronGeometry(.032, 0), mat(sk)); head.position.y = .19; g.add(head);
  const hair = M(new THREE.IcosahedronGeometry(.028, 0), mat('#1a1410')); hair.position.set(0, .205, -.008); g.add(hair);
  return g;
}
// the Ramdoli (giant wheel): a faceted ring, spokes, gondolas that hang level, bulbs that chase
function ramdoli(R = 1.6) {
  const G = new THREE.Group(), wheel = new THREE.Group(); G.add(wheel);
  const steel = mat('#d8dbe3', { roughness: .35, metalness: .6 });
  for (const z of [-.14, .14]) { const rim = M(new THREE.TorusGeometry(R, .03, 4, 24), steel); rim.position.z = z; wheel.add(rim); const rim2 = M(new THREE.TorusGeometry(R * .32, .025, 4, 12), steel); rim2.position.z = z; wheel.add(rim2);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, sp = M(new THREE.BoxGeometry(.018, R, .018), steel); sp.position.set(Math.cos(a) * R / 2, Math.sin(a) * R / 2, z); sp.rotation.z = a - Math.PI / 2; wheel.add(sp); } }
  const hub = M(new THREE.CylinderGeometry(.09, .09, .4, 8), steel); hub.rotation.x = Math.PI / 2; wheel.add(hub);
  const bulbs = []; const bg = new THREE.IcosahedronGeometry(.028, 0);
  for (let k = 0; k < 48; k++) { const a = k / 48 * TAU; for (const z of [-.14, .14]) { const m = new THREE.Mesh(bg, glow(BULB[k % 6], 3)); m.position.set(Math.cos(a) * R, Math.sin(a) * R, z); wheel.add(m); bulbs.push({ m, k }); } }
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; for (let r = 1; r < 6; r++) { const m = new THREE.Mesh(bg, glow(BULB[(k + 2) % 6], 2.4)); m.position.set(Math.cos(a) * R * r / 6, Math.sin(a) * R * r / 6, .16); wheel.add(m); bulbs.push({ m, k: k * 4 + r }); } }
  const cars = [];
  for (let k = 0; k < 12; k++) { const car = new THREE.Group(); const bx = M(new THREE.BoxGeometry(.2, .16, .2), mat(PAL.canopy[k % 8])); bx.position.y = -.12; car.add(bx);
    const rf = M(new THREE.ConeGeometry(.15, .08, 4), mat('#fbf3e6')); rf.rotation.y = Math.PI / 4; rf.position.y = -.0; car.add(rf); car.userData.a = k / 12 * TAU; wheel.add(car); cars.push(car); }
  for (const s of [-1, 1]) for (const z of [-.24, .24]) { const leg = M(new THREE.BoxGeometry(.05, R * 1.25, .05), steel); leg.position.set(s * R * .3, -R * .55, z); leg.rotation.z = s * .45; G.add(leg); }
  G.userData = { wheel, cars, bulbs, R };
  return G;
}
function carousel() {
  const G = new THREE.Group(), top = new THREE.Group(); G.add(top);
  const base = M(new THREE.CylinderGeometry(.5, .52, .08, 12), mat('#f2b632')); base.position.y = .04; G.add(base);
  const pole = M(new THREE.CylinderGeometry(.04, .04, .6, 6), mat('#e8d2a0')); pole.position.y = .34; G.add(pole);
  for (let k = 0; k < 12; k++) { const r = M(new THREE.ConeGeometry(.55, .28, 12, 1, true, k / 12 * TAU, TAU / 12), mat(k % 2 ? '#e0413a' : '#fbf3e6', { side: THREE.DoubleSide })); r.position.y = .76; top.add(r); }
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, h = M(new THREE.BoxGeometry(.12, .1, .05), mat(['#fbf3e6', '#a9cbe8', '#f5c2b0'][k % 3])); h.position.set(Math.cos(a) * .38, .3, Math.sin(a) * .38); h.rotation.y = -a; top.add(h);
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.022, 0), glow(BULB[k % 6], 3)); b.position.set(Math.cos(a) * .55, .62, Math.sin(a) * .55); top.add(b); }
  G.userData = { top }; return G;
}
// Killa Maidan's gate: a crenellated wall with an arch (Barabati's spirit, not a copy)
function fortGate() {
  const g = new THREE.Group(), st = mat(PAL.stone), sd = mat(PAL.stoneD);
  for (const s of [-1, 1]) { const w = M(new THREE.BoxGeometry(1.1, .55, .26), st); w.position.set(s * .85, .275, 0); g.add(w);
    for (let k = 0; k < 4; k++) { const m = M(new THREE.BoxGeometry(.12, .1, .26), st); m.position.set(s * .85 - .45 + k * .3, .6, 0); g.add(m); }
    const tw = M(new THREE.CylinderGeometry(.2, .22, .8, 8), sd); tw.position.set(s * .32, .4, 0); g.add(tw); const cap = M(new THREE.ConeGeometry(.24, .2, 8), mat('#b5503a')); cap.position.set(s * .32, .9, 0); g.add(cap); }
  const arch = M(new THREE.BoxGeometry(.44, .2, .26), st); arch.position.set(0, .6, 0); g.add(arch);
  return g;
}

export function buildFair(scene) {
  const F = { pops: [], people: [], bulbs: [], lights: [] };
  const S = new THREE.Group(); scene.add(S); F.root = S;
  // the riverbed island: an elongated blob of hex tiles (sand), Killa Maidan (grass, higher) at its north end
  const tiles = [];
  for (let q = -14; q <= 14; q++) for (let r = -12; r <= 12; r++) {
    const [x, z] = hex2w(q, r); const e = (x / 5.4) ** 2 + (z / 4.2) ** 2 + .12 * Math.sin(x * 1.3 + z) ; if (e > 1) continue;
    const maidan = z < -2.1 && x < 2.5; tiles.push({ x, z, maidan, h: maidan ? .32 + hash(q * 3 + r) * .03 : .12 + hash(q * 5 + r * 7) * .03 });
  }
  for (const t of tiles) { const p = hexPrism(.5, t.h, t.maidan ? (hash(t.x * 9 + t.z) > .5 ? PAL.grass : PAL.grass2) : (hash(t.x * 3 + t.z * 7) > .5 ? PAL.sandTop : '#e2c88f'), t.maidan ? PAL.earth : PAL.sandSide); p.position.set(t.x, 0, t.z); S.add(p); }
  F.tiles = tiles; F.blobs = tiles.map(t => [t.x, t.z, 1.1, 1]);
  // stalls: four rows along x on the riverbed, each pops in on its own beat
  let i = 0; F.stalls = [];
  for (let row = 0; row < 4; row++) for (let k = 0; k < 9; k++) {
    const x = -3.6 + k * .78 + (row % 2) * .25, z = -1.2 + row * 1.15; if ((x / 5.0) ** 2 + (z / 3.8) ** 2 > .86) continue;
    const s = stall(i); s.position.set(x, .17, z); S.add(s); F.stalls.push({ obj: s, i, row, k, x, z }); i++;
  }
  // festoons of bulbs over the lanes (between stall rows)
  const bg = new THREE.IcosahedronGeometry(.02, 0);
  for (let row = 0; row < 3; row++) { const z = -.62 + row * 1.15; for (let k = 0; k < 40; k++) { const u = k / 39, x = -3.7 + u * 7.4, y = .78 - Math.abs(Math.sin(u * TAU * 3)) * .14;
    if ((x / 5.0) ** 2 + (z / 3.8) ** 2 > .9) continue; const m = new THREE.Mesh(bg, glow(BULB[(k + row) % 6], 3)); m.position.set(x, y, z); S.add(m); F.bulbs.push({ m, k, row }); } }
  // lamp posts with real light
  for (const [x, z] of [[-2.6, -.6], [0, -.6], [2.6, -.6], [-1.3, 1.7], [1.3, 1.7]]) {
    const p = M(new THREE.CylinderGeometry(.015, .02, .7, 4), mat('#2a2a30')); p.position.set(x, .47, z); S.add(p);
    const l = new THREE.Mesh(new THREE.IcosahedronGeometry(.045, 0), glow('#ffd9a0', 3)); l.position.set(x, .84, z); S.add(l);
    const pl = new THREE.PointLight('#ffb870', 2.2, 3.2, 1.6); pl.position.set(x, .9, z); S.add(pl); F.lights.push(pl);
  }
  // Killa Maidan: the gate, the Ramdoli and a merry-go-round
  const gate = fortGate(); gate.position.set(-2.2, .32, -3.05); S.add(gate);
  const rd = ramdoli(1.55); rd.position.set(.9, .32 + 1.95, -3.0); S.add(rd); F.ramdoli = rd;
  const car = carousel(); car.position.set(-3.1, .32, -2.1); S.add(car); F.carousel = car;
  const trees = [[-4.2, -1.6], [3.2, -3.0], [2.6, -2.2], [-4.4, -.6]];
  for (const [x, z] of trees) { const tr = M(new THREE.CylinderGeometry(.04, .05, .25, 5), mat('#7a5236')); tr.position.set(x, .45, z); S.add(tr); const c = M(new THREE.IcosahedronGeometry(.26, 0), mat('#4f8f4a')); c.position.set(x, .72, z); c.rotation.set(x, z, 0); S.add(c); }
  // people: in the lanes and on the maidan
  for (let n = 0; n < 150; n++) {
    const lane = n % 4, x = -3.6 + hash(n * 1.7) * 7.2, z = lane < 3 ? -.62 + lane * 1.15 + (hash(n * 2.3) - .5) * .32 : -2.6 + hash(n * 4.1) * 1.2;
    if ((x / 5.0) ** 2 + (z / 3.9) ** 2 > .88) continue;
    const p = person(n); p.position.set(x, lane < 3 ? .17 : .37, z); p.rotation.y = hash(n * 9) * TAU; S.add(p); F.people.push({ obj: p, x, z, n, lane, y: p.position.y });
  }
  // the far bank: Cuttack, houses with lit windows
  const bank = new THREE.Group(); S.add(bank);
  for (let k = 0; k < 26; k++) { const x = -9 + k * .72, z = -7.6 - hash(k) * 1.2, fl = 1 + Math.floor(hash(k * 3) * 3);
    const h = M(new THREE.BoxGeometry(.6, .34 * fl, .6), mat(PAL.walls[k % 6])); h.position.set(x, .17 * fl + .2, z); bank.add(h);
    const rf = M(gable(.6, .6, .26), mat(PAL.roofs[k % 4])); rf.position.set(x, .34 * fl + .2, z); bank.add(rf);
    for (let f = 0; f < fl; f++) if (hash(k * 7 + f) > .35) { const w = new THREE.Mesh(new THREE.PlaneGeometry(.12, .12), glow('#ffcf8a', 1.8)); w.position.set(x + (hash(k + f) - .5) * .3, .2 + .34 * f + .17, z + .302); bank.add(w); } }
  const bankLand = M(new THREE.BoxGeometry(24, .4, 4), mat('#5e6a4a')); bankLand.position.set(0, 0, -8.4); bank.add(bankLand);
  F.bank = bank;
  // ghat: steps down to the water with diyas along them (dawn shot)
  F.update = (t, o = {}) => {
    const pop = o.pop ?? 1;
    // stalls pop in on the 8ths from popT0, one by one along the rows
    for (const s of F.stalls) { const t0 = (o.popT0 ?? -99) + (s.row * 9 + s.k) * (o.popDt ?? .065); const u = clamp((t - t0) / .28); const k = pop >= 1 && o.popT0 === undefined ? 1 : back(u, 2.6);
      s.obj.scale.set(k || 1e-3, k || 1e-3, k || 1e-3); s.obj.visible = k > .001; }
    const rot = t * .35; const { wheel, cars, bulbs } = rd.userData; wheel.rotation.z = rot; for (const c of cars) { const a = c.userData.a; c.position.set(Math.cos(a) * 1.55, Math.sin(a) * 1.55, 0); c.rotation.z = -rot; }
    for (const b of bulbs) b.m.material.emissiveIntensity = 1.4 + 2.2 * (.5 + .5 * Math.sin(t * 6 - b.k * .5));
    car.userData.top.rotation.y = t * .9;
    for (const b of F.bulbs) b.m.material.emissiveIntensity = 1.8 + 1.4 * (.5 + .5 * Math.sin(t * 4 - b.k * .7 + b.row));
    for (const p of F.people) { p.obj.position.y = p.y + Math.abs(Math.sin(t * 7 + p.n)) * .012; }
  };
  return F;
}
