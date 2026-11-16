// The fair's food counters, each under a hand-painted board: dahibara-aludum, thunka puri, gupchup, kulfi, and a toy stall.
import * as THREE from 'three';
const hh = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
function board(odia, en, bg, fg) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 300; const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, 1024, 300); x.strokeStyle = fg; x.lineWidth = 10; x.strokeRect(14, 14, 996, 272);
  x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '700 112px "OdiaSerif"'; x.fillText(odia, 512, 128); x.font = '600 52px "Cinzel"'; x.fillText(en, 512, 240);
  // a little wear: paint thinning, a few specks
  x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 900; i++) { x.globalAlpha = hh(i) * .25; x.fillRect(hh(i + 1) * 1024, hh(i + 2) * 300, 2 + hh(i + 3) * 5, 1 + hh(i + 4) * 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const M = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: o.r ?? .6, metalness: o.m ?? 0, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1, clearcoat: o.cc ?? 0, clearcoatRoughness: .15, sheen: o.sh ?? 0, sheenColor: new THREE.Color(1, .8, .5) });
// colour that varies over a surface (browning, speckles): per-vertex
function speckle(geo, a, b, f = 30, seed = 0) { const p = geo.attributes.position, c = [], A = new THREE.Color(a), B = new THREE.Color(b), v = new THREE.Vector3(), o = new THREE.Color();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = .5 + .25 * Math.sin(v.x * f + seed) * Math.sin(v.y * f * 1.7 + seed) + .25 * Math.sin(v.z * f * 2.3 + v.x * f * 1.1 + seed * 3); const k = Math.pow(Math.max(0, Math.min(1, n)), 1.6); o.copy(A).lerp(B, k); c.push(o.r, o.g, o.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return geo; }
const MV = (o = {}) => { const m = M(0xffffff, o); m.vertexColors = true; return m; };
const STEAM = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
export const steams = [];
function steam(G, x, y, z, n = 7) { for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: STEAM, color: 0xfff4e6, transparent: true, opacity: .0, depthWrite: false })); s.userData = { x, y, z, ph: i / n, seed: i * 1.7 + x }; G.add(s); steams.push(s); } }
export function animateFood(t) { for (const s of steams) { const u = ((t * .35 + s.userData.ph) % 1); s.position.set(s.userData.x + Math.sin(t * 1.3 + s.userData.seed) * .06 * u, s.userData.y + u * .7, s.userData.z); s.scale.setScalar(.12 + u * .35); s.material.opacity = .22 * Math.sin(Math.PI * u); } }
// fried things are never smooth: blister a sphere with value noise
function bumpy(geo, amp, f = 9, seed = 0) { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * f + seed) * Math.sin(v.y * f * 1.3 + seed * 2) * Math.sin(v.z * f * .9 + seed * 3) + .5 * Math.sin(v.x * f * 2.7 + v.z * f * 2.1 + seed); v.multiplyScalar(1 + amp * n); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; }
function stallFrame(G, tex, tarp) {
  const counter = new THREE.Mesh(new THREE.BoxGeometry(3.2, .9, 1.1), M(0x3a2414, { r: .9 })); counter.position.set(0, .45, 0); G.add(counter);
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(3.22, .2, 1.12), M(new THREE.Color(tarp).multiplyScalar(.35).getHex(), { r: .9, sh: .4 })); cloth.position.set(0, .82, 0); G.add(cloth);
  const awn = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.5, 8, 1), M(tarp, { r: 1, e: tarp, ei: .25 })); awn.rotation.x = -1.1; awn.position.set(0, 2.85, .2); G.add(awn);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(2.6, .76), new THREE.MeshStandardMaterial({ map: tex, roughness: .8, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: .35 })); b.position.set(0, 2.42, .82); b.rotation.x = -.12; b.visible = false; G.add(b);
  const bulb = new THREE.PointLight(0xffb060, 9, 6, 1.4); bulb.position.set(0, 2.1, .7); G.add(bulb);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff0c0, toneMapped: false })); glow.position.set(0, 2.15, .6); G.add(glow);
}
function dahibara(G) {
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(.55, .4, .28, 48, 1, true), M(0xc89a48, { m: 1, r: .22 })); bowl.position.set(-.55, 1.06, .05); G.add(bowl);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.55, .025, 8, 64), M(0xd8b060, { m: 1, r: .18 })); rim.rotation.x = Math.PI / 2; rim.position.set(-.55, 1.2, .05); G.add(rim);
  const curd = new THREE.Mesh(new THREE.CircleGeometry(.53, 48), M(0xf3ead2, { r: .3, cc: .6 })); curd.rotation.x = -Math.PI / 2; curd.position.set(-.55, 1.17, .05); G.add(curd);
  for (let i = 0; i < 9; i++) { const vg = bumpy(new THREE.TorusGeometry(.075, .042, 14, 28), .06, 40, i); speckle(vg, 0xd09048, 0x8a5420, 60, i); const v = new THREE.Mesh(vg, MV({ r: .5, sh: .6 })); v.rotation.x = -Math.PI / 2 + (hh(i) - .5) * .4; const a = i * 2.4, r = .1 + hh(i + 4) * .32; v.position.set(-.55 + Math.cos(a) * r, 1.19, .05 + Math.sin(a) * r); G.add(v); }
  const pot = new THREE.Mesh(new THREE.SphereGeometry(.3, 32, 16, 0, Math.PI * 2, 0, Math.PI * .62), M(0x9a9aa0, { m: 1, r: .3 })); pot.position.set(.45, 1.12, .0); G.add(pot);
  const dum = new THREE.Mesh(new THREE.CircleGeometry(.27, 32), M(0x8a3412, { r: .25, cc: .8 })); dum.rotation.x = -Math.PI / 2; dum.position.set(.45, 1.2, 0); G.add(dum);
  for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(bumpy(new THREE.SphereGeometry(.05, 12, 8), .12, 60, i), M(0xd0901e, { r: .35, cc: .7 })); const a = i * 2.2, r = hh(i + 9) * .18; p.position.set(.45 + Math.cos(a) * r, 1.22, Math.sin(a) * r); G.add(p); }
  for (let i = 0; i < 6; i++) { const leaf = new THREE.Mesh(new THREE.CylinderGeometry(.14, .08, .05, 14, 1, true), M(0x6a7a2a, { r: .8 })); leaf.position.set(1.15, .96 + i * .03, .25); G.add(leaf); }
  const served = new THREE.Mesh(new THREE.CylinderGeometry(.15, .09, .06, 16), M(0x6a7a2a)); served.position.set(.95, .98, .4); G.add(served);
  const top = new THREE.Mesh(new THREE.CircleGeometry(.13, 16), M(0xe8d7b0)); top.rotation.x = -Math.PI / 2; top.position.set(.95, 1.015, .4); G.add(top);
  steam(G, .45, 1.25, 0, 6);
  for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(.03, .01, .006), M(i % 3 ? 0xe0a030 : 0x3a8a2a)); s.position.set(.95 + (hh(i) - .5) * .18, 1.02, .4 + (hh(i + 3) - .5) * .18); s.rotation.y = hh(i + 5) * 3; G.add(s); }
}
function thunka(G) {
  const bas = new THREE.Mesh(new THREE.CylinderGeometry(.78, .58, .26, 40, 1, true), M(0x7a5a30, { r: .95 })); bas.position.set(-.2, 1.04, 0); G.add(bas);
  const weave = new THREE.Mesh(new THREE.TorusGeometry(.78, .03, 6, 60), M(0x8a6a3a, { r: .9 })); weave.rotation.x = Math.PI / 2; weave.position.set(-.2, 1.17, 0); G.add(weave);
  for (let i = 0; i < 12; i++) { const g = bumpy(new THREE.SphereGeometry(.2, 40, 24), .03, 22, i); g.scale(1, .62, 1); speckle(g, 0xe8b058, 0x9a5418, 26, i);
    const p = new THREE.Mesh(g, MV({ r: .32, cc: 1, sh: .5 })); const a = i * 2.4, r = i < 7 ? .42 : .17; p.position.set(-.2 + Math.cos(a) * r, 1.2 + (i < 7 ? 0 : .16) + hh(i) * .03, Math.sin(a) * r * .8); p.rotation.set((hh(i) - .5) * .7, hh(i + 1) * 3, (hh(i + 2) - .5) * .7); G.add(p); }
  const wok = new THREE.Mesh(new THREE.SphereGeometry(.42, 32, 12, 0, Math.PI * 2, Math.PI * .6, Math.PI * .4), M(0x1a1a1a, { m: .8, r: .35 })); wok.position.set(1.0, 1.36, -.15); G.add(wok);
  const oil = new THREE.Mesh(new THREE.CircleGeometry(.33, 32), M(0x6a3a08, { r: .05, m: .3, cc: 1, e: 0x2a1400, ei: .6 })); oil.rotation.x = -Math.PI / 2; oil.position.set(1.0, 1.07, -.15); G.add(oil);
  const og = bumpy(new THREE.SphereGeometry(.17, 32, 20), .04, 24, 7); og.scale(1, .7, 1); speckle(og, 0xf0c070, 0xb06a20, 20, 3); const one = new THREE.Mesh(og, MV({ r: .25, cc: 1 })); one.position.set(1.0, 1.12, -.15); G.add(one);
  steam(G, 1.0, 1.25, -.15, 8);
  const curry = new THREE.Mesh(new THREE.CylinderGeometry(.22, .18, .2, 32), M(0xa8a8b0, { m: 1, r: .28 })); curry.position.set(.95, 1.0, .38); G.add(curry);
  const ch = new THREE.Mesh(new THREE.CircleGeometry(.2, 24), M(0xc8901e, { r: .3, cc: .8 })); ch.rotation.x = -Math.PI / 2; ch.position.set(.95, 1.101, .38); G.add(ch);
}
function gupchup(G) {
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, .55, .6), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: .9, roughness: .1, thickness: .02, transparent: true, opacity: .35 })); box.position.set(-.6, 1.18, 0); G.add(box);
  for (let i = 0; i < 70; i++) { const gg = bumpy(new THREE.SphereGeometry(.04, 16, 12), .07, 70, i); gg.scale(1, .82, 1); speckle(gg, 0xf0c27a, 0xa8641c, 90, i); const s = new THREE.Mesh(gg, MV({ r: .35, cc: .6 })); s.position.set(-.6 + (hh(i) - .5) * .95, .95 + Math.floor(i / 18) * .08 + hh(i + 1) * .03, (hh(i + 2) - .5) * .48); G.add(s); }
  const matka = new THREE.Mesh(new THREE.SphereGeometry(.28, 32, 24), M(0xa04e2a, { r: .55, cc: .3 })); matka.scale.set(1, .9, 1); matka.position.set(.6, 1.16, .05); G.add(matka);
  const mouth = new THREE.Mesh(new THREE.CylinderGeometry(.13, .15, .1, 16), M(0x8a3e20, { r: .9 })); mouth.position.set(.6, 1.42, .05); G.add(mouth);
  const pani = new THREE.Mesh(new THREE.CircleGeometry(.12, 16), M(0x4a5a1a, { r: .1 })); pani.rotation.x = -Math.PI / 2; pani.position.set(.6, 1.47, .05); G.add(pani);
  for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.09, .06, .04, 12), M(0x6a7a2a)); p.position.set(1.15, .93 + i * .045, .3); G.add(p); }
}
function kulfi(G) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(.38, 32, 24), M(0x8a3420, { r: .5, cc: .4 })); m.scale.set(1, 1.05, 1); m.position.set(-.3, 1.25, 0); G.add(m);
  const cloth = new THREE.Mesh(new THREE.TorusGeometry(.26, .08, 8, 20), M(0xb8282a, { r: 1 })); cloth.rotation.x = Math.PI / 2; cloth.position.set(-.3, 1.62, 0); G.add(cloth);
  for (let i = 0; i < 7; i++) { const k = new THREE.Mesh(new THREE.ConeGeometry(.045, .2, 10), M(i % 2 ? 0xf2e2b8 : 0xe9cf9a, { r: .5 })); k.rotation.x = Math.PI; const a = i / 7 * 6.28; k.position.set(.55 + Math.cos(a) * .2, 1.12, Math.sin(a) * .2); G.add(k); const st = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .2, 4), M(0xd8c090)); st.position.set(.55 + Math.cos(a) * .2, 1.26, Math.sin(a) * .2); G.add(st); }
}
function toys(G) {
  for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.22, 14, 10), M([0xd8302a, 0x2a6ad8, 0xe8c02a, 0x3aa84a, 0xd84aa8][i % 5], { r: .35, e: [0x400808, 0x081840, 0x403008, 0x083010, 0x400830][i % 5], ei: .4 })); b.scale.y = 1.15; b.position.set(-1.1 + (i % 5) * .5, 2.0 + Math.floor(i / 5) * .45 + hh(i) * .1, .55); G.add(b); }
  for (let i = 0; i < 5; i++) { const bt = new THREE.Mesh(new THREE.BoxGeometry(.4, .12, .14), M(0xb88a4a, { r: .8 })); bt.position.set(-1 + i * .5, .98, .1); G.add(bt); const sl = new THREE.Mesh(new THREE.PlaneGeometry(.18, .2), M(0xf0e6d0, { r: 1 })); sl.position.set(-1 + i * .5, 1.12, .1); G.add(sl); }
}
export const FOODS = [
  { k: 'dahibara', odia: 'ଦହିବରା ଆଳୁଦମ', en: 'DAHIBARA ALUDUM', bg: '#1f4f8a', fg: '#ffe9b0', tarp: 0x2e6fb0, f: dahibara },
  { k: 'thunka', odia: 'ଥୁଙ୍କା ପୁରି', en: 'THUNKA PURI', bg: '#8a1f16', fg: '#fff1c8', tarp: 0xc23b22, f: thunka },
  { k: 'gupchup', odia: 'ଗୁପଚୁପ', en: 'GUPCHUP', bg: '#1e6a3a', fg: '#fff3c0', tarp: 0x3a9a5a, f: gupchup },
  { k: 'kulfi', odia: 'କୁଲଫି', en: 'KULFI', bg: '#7a1f5a', fg: '#ffe8f0', tarp: 0xd65f9a, f: kulfi },
  { k: 'toys', odia: 'ଖେଳଣା', en: 'TOYS', bg: '#8a5a10', fg: '#fff3d0', tarp: 0xe0a82e, f: toys }];
export function makeFoodRow() {
  const R = new THREE.Group();
  FOODS.forEach((F, i) => { const G = new THREE.Group(); stallFrame(G, board(F.odia, F.en, F.bg, F.fg), F.tarp); F.f(G); G.position.x = i * 3.9; R.add(G); F.x = i * 3.9; });
  return R;
}
