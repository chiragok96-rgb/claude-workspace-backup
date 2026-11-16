// Hero objects for the dark studio (1 unit ≈ 1 cm): dahibara-aludum in a sal-leaf khali, the thunka puri thali,
// a phone (fictional), a wallet. Surfaces are painted procedurally into canvas textures; gloss comes from the studio's strip lights.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { hash, TAU, clamp } from '/core/lib.js';

function tex(n, draw, rep = 1) { const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'); draw(x, n); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8; return t; }
const R = (i) => hash(i * 12.9898 + 4.1414);
function speckle(x, n, cols, count, rmin, rmax, seed = 0) { for (let i = 0; i < count; i++) { x.fillStyle = cols[i % cols.length]; x.globalAlpha = .35 + R(i + seed) * .65; x.beginPath(); x.ellipse(R(i * 3 + seed) * n, R(i * 7 + seed) * n, rmin + R(i * 5 + seed) * (rmax - rmin), rmin + R(i * 11 + seed) * (rmax - rmin), R(i) * 6, 0, 7); x.fill(); } x.globalAlpha = 1; }
function bumpy(geo, amp, f, seed = 0) { const p = geo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * f + seed) * Math.sin(v.y * f * 1.31 + seed * 2) * Math.sin(v.z * f * .87 + seed * 3) + .5 * Math.sin((v.x + v.z) * f * 2.3 + seed); v.multiplyScalar(1 + amp * n); p.setXYZ(i, v.x, v.y, v.z); } geo.computeVertexNormals(); return geo; }
const PM = (o) => new THREE.MeshPhysicalMaterial({ roughness: .5, ...o });

// —— textures ——
const T = {
  curd: tex(512, (x, n) => { x.fillStyle = '#efe2c0'; x.fillRect(0, 0, n, n); const g = x.createRadialGradient(n / 2, n / 2, 20, n / 2, n / 2, n / 2); g.addColorStop(0, 'rgba(255,248,225,.6)'); g.addColorStop(1, 'rgba(214,190,140,.5)'); x.fillStyle = g; x.fillRect(0, 0, n, n);
    speckle(x, n, ['#c9a24a', '#e0b85a'], 160, 2, 7, 1);                    // turmeric/oil swirls
    speckle(x, n, ['#2a1a10', '#3a2614'], 120, 1.6, 3, 2);                  // mustard seeds
    speckle(x, n, ['#2f5a1e', '#3d6e26'], 26, 3, 7, 3);                     // curry leaf bits
    speckle(x, n, ['#b8361e', '#c9502a'], 220, .8, 2.2, 4); }),             // chilli dust
  vada: tex(256, (x, n) => { x.fillStyle = '#b97a34'; x.fillRect(0, 0, n, n); speckle(x, n, ['#8a5220', '#6e3e16', '#d39a4c', '#e2b064'], 900, 1, 5, 5); }),
  gravy: tex(256, (x, n) => { x.fillStyle = '#7a2a10'; x.fillRect(0, 0, n, n); speckle(x, n, ['#a8401a', '#5e1c0a', '#c8641e'], 500, 2, 9, 6); speckle(x, n, ['#e8a030'], 60, 2, 6, 7); }),
  potato: tex(128, (x, n) => { x.fillStyle = '#d29a3a'; x.fillRect(0, 0, n, n); speckle(x, n, ['#b06a22', '#e8b85a', '#8a3a14'], 200, 1, 6, 8); }),
  leaf: tex(512, (x, n) => { x.fillStyle = '#5f6e2a'; x.fillRect(0, 0, n, n);
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; x.save(); x.translate(n / 2, n / 2); x.rotate(a); x.fillStyle = ['#6e7d34', '#58682a', '#7a8640', '#646f2e'][i % 4]; x.beginPath(); x.ellipse(n * .26, 0, n * .27, n * .12, 0, 0, 7); x.fill();
      x.strokeStyle = 'rgba(215,220,160,.55)'; x.lineWidth = 2; x.beginPath(); x.moveTo(n * .02, 0); x.lineTo(n * .52, 0); x.stroke(); for (let k = 1; k < 7; k++) { x.lineWidth = 1; x.beginPath(); x.moveTo(n * .06 * k, 0); x.lineTo(n * .06 * k + 18, 22); x.moveTo(n * .06 * k, 0); x.lineTo(n * .06 * k + 18, -22); x.stroke(); } x.restore(); }
    speckle(x, n, ['#8a7a3a', '#4a5420'], 300, 1, 4, 9); }),
  puri: tex(512, (x, n) => { x.fillStyle = '#d8962e'; x.fillRect(0, 0, n, n); speckle(x, n, ['#efc066', '#f6d48a'], 140, 10, 34, 10); speckle(x, n, ['#a8641c', '#8a4c12'], 260, 2, 10, 11); speckle(x, n, ['#fff0c0'], 40, 3, 8, 12); }),
  chhena: tex(256, (x, n) => { x.fillStyle = '#d8902a'; x.fillRect(0, 0, n, n); speckle(x, n, ['#c06a1a', '#e8a840', '#b8501a'], 400, 2, 9, 13); speckle(x, n, ['#2f5a1e'], 20, 2, 5, 14); }),
  paneer: tex(64, (x, n) => { x.fillStyle = '#f4ead2'; x.fillRect(0, 0, n, n); speckle(x, n, ['#e2b060', '#d0902e'], 60, 1, 5, 15); }),
};

// —— dahibara-aludum in a khali ——
export function dahibara() {
  const G = new THREE.Group();
  const prof = []; for (let i = 0; i <= 14; i++) { const u = i / 14; prof.push(new THREE.Vector2(.5 + 7.2 * Math.sin(u * Math.PI / 2) ** .8, -2.6 + 3.2 * u ** 1.6)); }
  const khali = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), PM({ map: T.leaf, roughness: .7, side: THREE.DoubleSide, sheen: .5, sheenColor: new THREE.Color('#d8e0a0') })); G.add(khali);
  const curd = new THREE.Mesh(new THREE.CircleGeometry(6.5, 64), PM({ map: T.curd, roughness: .18, clearcoat: .7, clearcoatRoughness: .2 })); curd.rotation.x = -Math.PI / 2; curd.position.y = -.4; G.add(curd);
  for (let i = 0; i < 4; i++) { const g = bumpy(new THREE.SphereGeometry(2.3, 32, 18), .06, 3.2, i); g.scale(1, .42, 1); const v = new THREE.Mesh(g, PM({ map: T.vada, roughness: .62, sheen: .4, sheenColor: new THREE.Color('#ffd28a') }));
    const a = i / 4 * TAU + .4, r = i < 3 ? 3.4 : 0; v.rotation.x = (R(i) - .5) * .3; v.rotation.z = (R(i + 2) - .5) * .3; v.position.set(Math.cos(a) * r, -.1, Math.sin(a) * r); G.add(v); }
  // aloo dum: a glossy pool of gravy with potato pieces, on top
  const pool = bumpy(new THREE.SphereGeometry(2.8, 32, 16), .05, 2.5, 3); pool.scale(1, .26, 1);
  const gm = new THREE.Mesh(pool, PM({ map: T.gravy, roughness: .2, clearcoat: 1, clearcoatRoughness: .08 })); gm.position.set(.4, .25, .2); G.add(gm);
  for (let i = 0; i < 7; i++) { const g = new RoundedBoxGeometry(1.05 + R(i) * .4, .8 + R(i + 1) * .3, .95, 3, .32); const p = new THREE.Mesh(g, PM({ map: T.potato, roughness: .45, clearcoat: .6 }));
    const a = i / 7 * TAU, r = .6 + R(i + 3) * 1.4; p.position.set(.4 + Math.cos(a) * r, .7 + R(i + 5) * .2, .2 + Math.sin(a) * r); p.rotation.set(R(i) * 2, R(i + 7) * 3, R(i + 9)); G.add(p); }
  // garnish: onion, coriander, sev
  for (let i = 0; i < 26; i++) { const o = new THREE.Mesh(new THREE.BoxGeometry(.32, .14, .28), PM({ color: '#f0d6e0', roughness: .25, transmission: .3, thickness: .2 })); const a = R(i * 3) * TAU, r = R(i * 5) * 5.4; o.position.set(Math.cos(a) * r, .2 + R(i) * .9 * (r < 2.8 ? 1 : .2), Math.sin(a) * r); o.rotation.set(R(i) * 3, R(i + 1) * 3, 0); G.add(o); }
  for (let i = 0; i < 30; i++) { const c = new THREE.Mesh(new THREE.CircleGeometry(.22, 5), PM({ color: '#3f8a2a', roughness: .5, side: THREE.DoubleSide })); const a = R(i * 13) * TAU, r = R(i * 17) * 5.6; c.position.set(Math.cos(a) * r, .25 + R(i + 4) * .9 * (r < 2.8 ? 1 : .15), Math.sin(a) * r); c.rotation.set(-1.3 + R(i) * .6, R(i) * 6, 0); G.add(c); }
  const sevG = new THREE.CylinderGeometry(.06, .06, 1, 5); sevG.rotateZ(Math.PI / 2);
  for (let i = 0; i < 90; i++) { const s = new THREE.Mesh(sevG, PM({ color: R(i) > .5 ? '#e8a830' : '#d88a1e', roughness: .55 })); const a = R(i * 19) * TAU, r = R(i * 23) * 5.8; s.scale.x = .6 + R(i) * 1.2; s.position.set(Math.cos(a) * r, .3 + R(i + 6) * .8 * (r < 3 ? 1 : .15), Math.sin(a) * r); s.rotation.set(R(i) * .6, R(i * 2) * 6, R(i * 3) * .4); G.add(s); }
  return G;
}

// —— thunka puri thali: steel plate, the giant puffed puri, chhena tarkari in a katori ——
export function thali() {
  const G = new THREE.Group(), steel = PM({ color: '#e8ebef', metalness: 1, roughness: .22, clearcoat: .3 });
  const tp = [new THREE.Vector2(0, 0), new THREE.Vector2(13, 0), new THREE.Vector2(14.2, .5), new THREE.Vector2(14.6, 1.3), new THREE.Vector2(14.4, 1.4), new THREE.Vector2(13.6, .7), new THREE.Vector2(0, .5)];
  G.add(new THREE.Mesh(new THREE.LatheGeometry(tp, 72), steel));
  // the puri: big, puffed like a balloon, blistered, glossy with oil
  const pg = bumpy(new THREE.SphereGeometry(7.6, 64, 40), .025, 1.6, 4); pg.scale(1, .5, 1);
  const puri = new THREE.Mesh(pg, PM({ map: T.puri, roughness: .32, clearcoat: 1, clearcoatRoughness: .12, sheen: .6, sheenColor: new THREE.Color('#ffd890') })); puri.position.set(-2.6, 3.6, -1.2); puri.rotation.z = .06; G.add(puri);
  // a torn piece showing it is hollow
  const pc = bumpy(new THREE.SphereGeometry(2.4, 24, 16, 0, TAU, 0, 1.1), .05, 3, 8); const piece = new THREE.Mesh(pc, PM({ map: T.puri, roughness: .35, clearcoat: .8, side: THREE.DoubleSide })); piece.position.set(7.2, 1.0, 5.4); piece.rotation.set(.9, .4, .3); G.add(piece);
  // katori with chhena tarkari
  const kp = []; for (let i = 0; i <= 10; i++) { const u = i / 10; kp.push(new THREE.Vector2(2.2 + 2.6 * Math.sin(u * Math.PI / 2), 3.6 * u)); } kp.push(new THREE.Vector2(4.75, 3.62));
  const kat = new THREE.Mesh(new THREE.LatheGeometry(kp, 64), PM({ color: '#e8ebef', metalness: 1, roughness: .2, side: THREE.DoubleSide })); kat.position.set(6.4, .5, -4.2); G.add(kat);
  const gr = new THREE.Mesh(new THREE.CircleGeometry(4.5, 48), PM({ map: T.chhena, roughness: .18, clearcoat: 1, clearcoatRoughness: .1 })); gr.rotation.x = -Math.PI / 2; gr.position.set(6.4, 3.4, -4.2); G.add(gr);
  for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new RoundedBoxGeometry(1.1, .8, 1.1, 2, .25), PM({ map: T.paneer, roughness: .55 })); const a = i / 9 * TAU, r = .8 + R(i) * 2.2; c.position.set(6.4 + Math.cos(a) * r, 3.55, -4.2 + Math.sin(a) * r); c.rotation.y = R(i) * 3; G.add(c); }
  // onion rings, a green chilli, a lemon wedge
  for (let i = 0; i < 3; i++) { const o = new THREE.Mesh(new THREE.TorusGeometry(1.2 - i * .25, .12, 8, 28), PM({ color: '#f2dbe6', roughness: .25, transmission: .25, thickness: .3 })); o.rotation.x = -Math.PI / 2 + .1; o.position.set(-8.5 + i * .3, .75 + i * .05, 7.0); G.add(o); }
  const ch = new THREE.Mesh(new THREE.CapsuleGeometry(.32, 4.2, 6, 12), PM({ color: '#3f8a2a', roughness: .3, clearcoat: .8 })); ch.rotation.set(Math.PI / 2, 0, .9); ch.position.set(-4.5, .85, 9.0); G.add(ch);
  const lw = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 12, 0, Math.PI), PM({ color: '#f2d84a', roughness: .35, clearcoat: .6, side: THREE.DoubleSide })); lw.rotation.set(-Math.PI / 2, 0, .4); lw.position.set(-9.8, .9, 4.0); G.add(lw);
  return G;
}

// —— the phone (fictional): a dark glass slab; its screen is a live canvas (the fair seen from above, a friend's dot, the call banner) ——
export function phone() {
  const G = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(7.4, 15.6, .8, 6, .9), PM({ color: '#1b1d22', metalness: .7, roughness: .28, clearcoat: 1 })); G.add(body);
  const sc = document.createElement('canvas'); sc.width = 540; sc.height = 1140; const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.9, 14.6), new THREE.MeshPhysicalMaterial({ color: '#000', emissive: '#ffffff', emissiveMap: st, emissiveIntensity: 1.1, roughness: .05, clearcoat: 1, clearcoatRoughness: .02 }));
  screen.position.z = .41; G.add(screen);
  const cam = new THREE.Mesh(new THREE.CircleGeometry(.22, 16), new THREE.MeshBasicMaterial({ color: '#05060a' })); cam.position.set(0, 6.8, .42); G.add(cam);
  G.userData = { sc, st, draw(t, o = {}) { const x = sc.getContext('2d'), w = 540, h = 1140;
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#141a3a'); g.addColorStop(1, '#0a0d1e'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    // the fair from above, as a map: lanes, stall blocks, the river
    x.fillStyle = '#1d2a5a'; x.fillRect(0, 0, w, 210); x.fillRect(0, 930, w, 210);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) { x.fillStyle = ['#e0413a', '#f2b632', '#2f74c8', '#e45d9b', '#33a46a', '#f07a2c'][(r + k) % 6]; x.globalAlpha = .75; x.fillRect(46 + k * 76, 300 + r * 150, 60, 74); } x.globalAlpha = 1;
    // my dot and the friend's dot, pulsing
    const pulse = (px, py, col, ph) => { for (let k = 0; k < 2; k++) { const u = ((t * .9 + ph + k * .5) % 1); x.strokeStyle = col; x.globalAlpha = 1 - u; x.lineWidth = 4; x.beginPath(); x.arc(px, py, 14 + u * 60, 0, 7); x.stroke(); } x.globalAlpha = 1; x.fillStyle = col; x.beginPath(); x.arc(px, py, 14, 0, 7); x.fill(); };
    pulse(120, 860, '#6ad0ff', 0); pulse(420, 360, '#ffd27a', .3);
    if (o.call) { x.fillStyle = 'rgba(12,14,24,.92)'; x.beginPath(); x.roundRect(28, 50, w - 56, 190, 36); x.fill();
      x.fillStyle = '#33a46a'; x.beginPath(); x.arc(110, 145, 52, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = '700 64px "Anek Odia"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ସ', 110, 150);
      x.textAlign = 'left'; x.font = '700 58px "Anek Odia"'; x.fillText('ସାଙ୍ଗ', 190, 120); x.font = '400 30px "Inter Tight"'; x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText('calling…', 192, 182); }
    st.needsUpdate = true; } };
  return G;
}
