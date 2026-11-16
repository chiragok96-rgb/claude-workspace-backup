// BALI JATRA — the rap film. One timeline, five worlds, cut on the song's bar grid (bar = 2.09 s, one lyric line per bar).
// neon street (sleep → awake) · low-poly fair island (sand → stalls → laughter → Ramdoli → river of light) · glass studio
// (dahibara ⇄ thali → eaten → empty wallet → phone) · fair (friends meet, fireworks) · watercolour (dawn boats → night, the boita)
// · 3D map (the voyage to Bali, Asia's biggest fair) · neon again (the chant, Odisha's soul) → loops to the sleeping sign.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, seg, ss, eio, eo, ei, back, hash, TAU } from '/core/lib.js';
import { makePost as makeLP } from './lp_post.js';
import { makeSea } from './lp_sea.js';
import { buildFair } from './fair.js';
import { makePost } from '/core/three/post.js';
import { makeStudio } from './studio.js';
import { dahibara, thali, phone } from './food.js';
import { buildMap } from './map.js';
import { makeNeon } from './neon.js';
import { initDawn, drawDawn } from './dawn.js';
import { drawLyrics } from './lyr2.js';

const W = 1080, H = 1920, B = 2.09, BEAT = B / 4, QS = new URLSearchParams(location.search);
const FROM = +(QS.get('from') ?? 0), TO = +(QS.get('to') ?? 33.9);
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const OUT = mk(); document.getElementById('stage').appendChild(OUT); const O = OUT.getContext('2d');
const BUF = mk(), BX = BUF.getContext('2d');
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const DEG = Math.PI / 180;

// ———————————————————————————— shared three.js renderer ————————————————————————————
const R = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
R.setPixelRatio(1); R.setSize(W, H); R.toneMapping = THREE.NeutralToneMapping; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();

// ———————————————————————————— FAIR (low-poly island, night) ————————————————————————————
const fs = new THREE.Scene(), fc = new THREE.OrthographicCamera(-5, 5, 9, -9, 1, 1600);
const fp = makeLP(R, fs, fc, W, H, { ssaa: 1, aoRadius: .35, aoScale: 1.2, aoThickness: .6 });
const sea = makeSea(fs); const F = buildFair(fs); sea.drawShallow(F.blobs.map(b => [b[0], b[1], 1.0, .9])); F.bank.visible = false;
fs.add(new THREE.HemisphereLight('#5a6f8c', '#2c2620', .55));
{ const moon = new THREE.DirectionalLight('#b4c4dc', .9); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 80 }); moon.shadow.bias = -.0006; moon.position.set(-20, 30, 14); fs.add(moon, moon.target); }
function fcam(s) {
  const { tg, az, el, fh } = s, D = 300, ce = Math.cos(el * DEG);
  fc.position.set(tg[0] + D * ce * Math.sin(az * DEG), tg[1] + D * Math.sin(el * DEG), tg[2] + D * ce * Math.cos(az * DEG));
  fc.up.set(0, 1, 0); fc.lookAt(...tg); const fw = fh * W / H; Object.assign(fc, { left: -fw / 2, right: fw / 2, top: fh / 2, bottom: -fh / 2, near: 1, far: D + 900 }); fc.updateProjectionMatrix();
  const cot = 1 / Math.tan(el * DEG); fp.comp.camDist.value = D; fp.comp.hz0.value = .05 * fh * cot; fp.comp.hz1.value = .45 * fh * cot;
  const f = new THREE.Vector3(); fc.getWorldDirection(f); const fl = Math.hypot(f.x, f.z) || 1; sea.U.uFwd.value.set(f.x / fl, f.z / fl); sea.U.uTgt.value.set(tg[0], tg[2]); sea.U.uSpanF.value = fh / Math.tan(el * DEG) * .5;
}
const mixS = (a, b, u) => ({ tg: a.tg.map((v, i) => lerp(v, b.tg[i], u)), az: lerp(a.az, b.az, u), el: lerp(a.el, b.el, u), fh: lerp(a.fh, b.fh, u) });
// laughter rings (L4): gold ripples on the ground from the crowd, on the 8ths
const RINGS = [], ringG = new THREE.RingGeometry(.84, 1, 64); ringG.rotateX(-Math.PI / 2);
for (let k = 0; k < 28; k++) { const m = new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.2, .9), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; fs.add(m); RINGS.push(m); }
const RINGEV = [];
for (let k = 0; k < 16; k++) for (let j = 0; j < 2; j++) { const p = F.people[Math.floor(hash(k * 7.3 + j * 3.1) * F.people.length)]; RINGEV.push({ t: 3 * B + k * BEAT / 2 + j * .06, x: p.x, z: p.z, y: p.y + .02, s: 1.6 + hash(k + j) * 1.4 }); }
// river of light (L6): glowing walkers streaming down the lanes
const NR = 900, rPos = new Float32Array(NR * 3), rCol = new Float32Array(NR * 3);
const riverG = new THREE.BufferGeometry(); riverG.setAttribute('position', new THREE.BufferAttribute(rPos, 3)); riverG.setAttribute('color', new THREE.BufferAttribute(rCol, 3));
const riverM = new THREE.PointsMaterial({ size: 7, sizeAttenuation: false, map: dotTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const river = new THREE.Points(riverG, riverM); river.frustumCulled = false; fs.add(river);
const RCOL = [[1, .78, .42], [1, .62, .3], [1, .9, .6], [.7, .85, 1]];
// fireworks
const NB = 10, NP = 110, TR = 4, fwPos = new Float32Array(NB * NP * TR * 3), fwCol = new Float32Array(NB * NP * TR * 3);
const fwG = new THREE.BufferGeometry(); fwG.setAttribute('position', new THREE.BufferAttribute(fwPos, 3)); fwG.setAttribute('color', new THREE.BufferAttribute(fwCol, 3));
const fw = new THREE.Points(fwG, new THREE.PointsMaterial({ size: 6, sizeAttenuation: false, map: dotTex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); fw.material.size = 10; fw.frustumCulled = false; fs.add(fw);
const FWC = [[1, .45, .7], [1, .8, .35], [.45, .85, 1], [.6, 1, .55], [1, .5, .3], [.85, .6, 1]];
const FWEV = [];
[19.85, 20.11, 20.37, 20.63, 20.89, 28.2, 28.46, 28.72, 28.98, 29.24].forEach((t0, k) => FWEV.push({ t0, c: [(hash(k * 3.1) - .5) * 6, 3.2 + hash(k * 5.7) * 2.2, (hash(k * 9.2) - .5) * 3 - .5], col: FWC[k % 6], r: 1.9 + hash(k) * 1.1 }));
const DIRS = []; for (let i = 0; i < NP; i++) { const z = 1 - 2 * (i + .5) / NP, a = i * 2.39996, r = Math.sqrt(1 - z * z); DIRS.push([r * Math.cos(a), z, r * Math.sin(a)]); }
// the two friends (L10): glowing figures who walk the lanes and meet
const friend = col => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CapsuleGeometry(.05, .13, 4, 10), new THREE.MeshStandardMaterial({ color: '#000', emissive: col, emissiveIntensity: 5 })); b.position.y = .12; g.add(b);
  const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: new THREE.Color(col).multiplyScalar(2.2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); h.scale.setScalar(.75); h.position.y = .14; g.add(h);
  const l = new THREE.PointLight(col, 1.6, 1.6, 1.5); l.position.y = .3; g.add(l); g.visible = false; fs.add(g); return g; };
const FA = friend('#6ad0ff'), FB = friend('#ffc860');
const MEET = [.25, .53];

function fairAt(t) {
  const sA = { tg: [0, .2, .5], az: 0, el: 82, fh: 18.5 }, sB = { tg: [0, .3, 1.0], az: 28, el: 33, fh: 12.5 };
  const sC = { tg: [-.8, .5, -1.5], az: 18, el: 22, fh: 6.6 }, sD = { tg: [-.3, .5, -1.7], az: 34, el: 19, fh: 6.0 };
  const sE = { tg: [.9, .7, -3.0], az: 12, el: 6, fh: 3.1 }, sF = { tg: [.9, 3.9, -3.0], az: 16, el: 9, fh: 2.8 };
  const sG = { tg: [.1, .3, .4], az: 22, el: 74, fh: 10.5 };
  const stl = F.stalls.find(s => s.row === 1 && s.k === 4) || F.stalls[12], sI = { tg: [stl.x, .45, stl.z + .1], az: 40, el: 32, fh: 1.0 };
  const sJ = { tg: [0, .3, .5], az: 0, el: 84, fh: 16 }, sK = { tg: [0, 1.7, .3], az: 18, el: 21, fh: 12.5 };
  const sL = { tg: [0, .7, .8], az: 44, el: 29, fh: 12.5 }, sL2 = { tg: [0, .7, .6], az: 20, el: 31, fh: 11.5 }, sM = { tg: [0, .3, .5], az: 10, el: 62, fh: 34 };
  let s;
  if (t < 6.2) s = mixS(sA, sB, eio(seg(t, 4.0, 6.3)));
  else if (t < 8.2) s = mixS(mixS(sA, sB, 1), mixS(sC, sD, seg(t, 6.27, 8.36)), eio(seg(t, 6.1, 6.55)));
  else if (t < 9.4) s = mixS(mixS(sC, sD, 1), mixS(sE, sF, ss(seg(t, 8.45, 9.4))), eio(seg(t, 8.15, 8.55)));
  else if (t < 12.0) { const g = { ...sG, az: lerp(22, 52, seg(t, 9.4, 12.6)) }; s = mixS(sF, g, eio(seg(t, 9.4, 10.3))); }
  else if (t < 16) { const g = { ...sG, az: lerp(22, 52, seg(t, 9.4, 12.6)) }; s = mixS(g, sI, ei(seg(t, 12.0, 12.6))); }
  else if (t < 24) s = mixS(sJ, sK, eio(seg(t, 19.6, 20.4)));
  else { const l = mixS(sL, sL2, seg(t, 27.17, 29.1)); s = mixS(l, sM, ei(seg(t, 29.0, 29.6))); }
  fcam(s);
  sea.U.uTime.value = t; sea.U.uDeep.value.set('#0f1d2a'); sea.U.uShal.value.set('#24394a'); sea.U.uNight.value = 1; sea.U.uFoam.value.set('#a8bccc');
  fp.comp.zen.value.set('#070d16'); fp.comp.hor.value.set('#4a3426'); fp.comp.stars.value = 1; fp.comp.time.value = t;
  const gd = fp.grade; gd.sat.value = 1.14; gd.contrast.value = .12; gd.lift.value.setRGB(.014, .016, .024); gd.vig.value = .32;
  fp.bloom.strength = .75; fp.bloom.threshold = .8; fp.bloom.radius = .5;
  fp.tilt.fy.value = .5; fp.tilt.band.value = s.el > 60 ? .26 : .2;
  F.update(t, { popT0: 5.17, popDt: .03 });
  // the island dresses up (L14): a colour wave runs along the festoons, then they chase
  if (t > 26.5) { for (const b of F.bulbs) { const w = ss(seg(t, 27.25 + (b.k / 39) * .7, 27.45 + (b.k / 39) * .7)); const hue = (b.k / 39 + b.row * .2 + t * .35) % 1;
    b.m.material.emissive.setHSL(hue, .9, .55); b.m.material.emissiveIntensity = lerp(.4, 4.5 + 2 * Math.sin(t * 9 - b.k * .6), w); } }
  // rings
  RINGS.forEach(m => m.visible = false); let ri = 0;
  for (const e of RINGEV) { const a = t - e.t; if (a < 0 || a > 1.1 || ri >= RINGS.length) continue; const m = RINGS[ri++]; m.visible = true; m.position.set(e.x, e.y, e.z); m.scale.setScalar(.05 + eo(a / 1.1) * e.s); m.material.opacity = Math.pow(1 - a / 1.1, 1.4); }
  // meeting burst ring
  if (t > 19.55 && t < 20.6 && ri < RINGS.length) { const a = t - 19.6, m = RINGS[ri++]; if (a > 0) { m.visible = true; m.position.set(MEET[0], .2, MEET[1]); m.scale.setScalar(.05 + eo(a) * 3.2); m.material.opacity = Math.pow(1 - a, 1.4); } }
  // river of light
  const rv = ss(seg(t, 10.2, 10.9)) * (1 - ss(seg(t, 12.3, 12.6)));
  river.visible = rv > 0;
  if (rv > 0) for (let i = 0; i < NR; i++) {
    const lane = i % 4, sp = .55 + hash(i * 1.3) * .5, dir = lane === 1 ? -1 : 1, x = -4.4 + ((hash(i * 2.7) * 8.8 + dir * t * sp) % 8.8 + 8.8) % 8.8;
    let z = lane < 3 ? -.62 + lane * 1.15 : -2.55; z += Math.sin(x * 1.4 + i) * .1 + (hash(i * 5.1) - .5) * .22;
    const inIsland = (x / 5.0) ** 2 + (z / 3.9) ** 2 < .88; const c = RCOL[i % 4], k = inIsland ? rv * (1.4 + .6 * Math.sin(t * 5 + i)) : 0;
    rPos.set([x, lane < 3 ? .26 : .45, z], i * 3); rCol.set([c[0] * k, c[1] * k, c[2] * k], i * 3); }
  riverG.attributes.position.needsUpdate = riverG.attributes.color.needsUpdate = true;
  // fireworks
  fwCol.fill(0); let fi = 0;
  for (const e of FWEV) { const a = t - e.t0; if (a < -.35 || a > 1.8 || fi >= NB) continue; const base = fi++ * NP * TR;
    if (a < 0) { const u = 1 + a / .35; for (let tr = 0; tr < TR; tr++) { const j = (base + tr) * 3; fwPos.set([e.c[0], e.c[1] - (1 - u) * 3 - tr * .12, e.c[2]], j); fwCol.set([1.6 * u, 1.2 * u, .7 * u], j); } continue; }
    for (let i = 0; i < NP; i++) for (let tr = 0; tr < TR; tr++) { const aa = Math.max(0, a - tr * .045), d = e.r * (1 - Math.exp(-aa * 3.2)), g = .55 * aa * aa, D = DIRS[i];
      const j = (base + i * TR + tr) * 3, f = Math.pow(clamp(1 - a / 1.8), 1.5) * (1 - tr / TR) * (a < .08 ? 2.2 : 1.35) * (.75 + .25 * Math.sin(a * 30 + i));
      fwPos.set([e.c[0] + D[0] * d, e.c[1] + D[1] * d - g, e.c[2] + D[2] * d], j); fwCol.set([e.col[0] * f, e.col[1] * f, e.col[2] * f], j); } }
  fwG.attributes.position.needsUpdate = fwG.attributes.color.needsUpdate = true;
  // friends
  const fv = t > 18.6 && t < 21.3; FA.visible = FB.visible = fv;
  if (fv) { const u = eio(seg(t, 18.85, 19.6));
    const pa = u < .6 ? [lerp(-3.2, MEET[0] - .15, u / .6), 1.68] : [MEET[0] - .15, lerp(1.68, MEET[1], (u - .6) / .4)];
    const pb = u < .6 ? [lerp(3.4, MEET[0] + .15, u / .6), -.62] : [MEET[0] + .15, lerp(-.62, MEET[1], (u - .6) / .4)];
    const hop = k => Math.abs(Math.sin(t * 11 + k)) * .03 * (u < 1 ? 1 : 0) + (t > 19.6 ? Math.max(0, Math.sin((t - 19.6) * 12)) * .08 * Math.exp(-(t - 19.6) * 3) : 0);
    FA.position.set(pa[0], .17 + hop(0), pa[1]); FB.position.set(pb[0], .17 + hop(1), pb[1]); }
  R.toneMappingExposure = 1; R.shadowMap.enabled = true;
  fp.composer.render(); return R.domElement;
}

// ———————————————————————————— STUDIO (glass hero shots) ————————————————————————————
const ss_ = new THREE.Scene(), sc = new THREE.PerspectiveCamera(30, W / H, 1, 3000);
const sp = makePost(R, ss_, sc, W, H, { ssaa: 1, ao: false }); sp.bloom.strength = .2; sp.bloom.threshold = 1.05; sp.bloom.radius = .4;
const studio = makeStudio(R, ss_);
const key = new THREE.SpotLight('#ffd6a0', 9000, 0, .5, .8, 2); key.position.set(30, 90, 40); ss_.add(key, key.target);
const rim = new THREE.PointLight('#ffb070', 1800, 0, 2); rim.position.set(-40, 25, -50); ss_.add(rim);
const D = dahibara(), TH = thali(), PH = phone(); [D, TH, PH].forEach(o => ss_.add(o));
const KIDS = TH.children.slice();
const EAT = [[18], [17], [14, 15, 16], [2], [5, 6, 7, 8, 9, 10, 11, 12, 13], [4]];   // lemon, chilli, onions, the torn piece, paneer, gravy; then the puri deflates
function wallet() {
  const G = new THREE.Group(), leather = new THREE.MeshPhysicalMaterial({ color: '#5b2e1a', roughness: .48, clearcoat: .45, clearcoatRoughness: .3, sheen: .5, sheenColor: new THREE.Color('#b0703e') });
  const inner = new THREE.MeshPhysicalMaterial({ color: '#86532f', roughness: .8 }), stitch = new THREE.MeshStandardMaterial({ color: '#d8b98a', roughness: .7 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(12, 1.0, 8.6, 4, .38), leather); base.position.y = .5; G.add(base);
  const pk = new THREE.Mesh(new THREE.BoxGeometry(11, .06, 7.6), inner); pk.position.y = 1.0; G.add(pk);
  const hinge = new THREE.Group(); hinge.position.set(0, 1.0, -4.3); G.add(hinge);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(12, .9, 8.6, 4, .38), leather); lid.position.set(0, .45, 4.3); hinge.add(lid);
  const lin = new THREE.Mesh(new THREE.BoxGeometry(11, .06, 7.6), inner); lin.position.set(0, -.01, 4.3); hinge.add(lin);
  for (let k = 0; k < 3; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(10.4, .08, 2.2), leather); s.position.set(0, -.06, 1.6 + k * 1.7); hinge.add(s); }
  for (let k = 0; k < 40; k++) { const d = new THREE.Mesh(new THREE.BoxGeometry(.35, .05, .1), stitch); const u = k / 40, x = -5.5 + u * 11; d.position.set(x, 1.47, 4.3 + 3.95); d.rotation.x = 0; hinge.add(d); }
  G.userData.hinge = hinge; return G;
}
function moth() {
  const tc = document.createElement('canvas'); tc.width = tc.height = 256; { const g = tc.getContext('2d'); g.fillStyle = '#b9ab90'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 260; i++) { g.fillStyle = ['#8f7f66', '#cfc2a8', '#a8977a', '#6e604c'][i % 4]; g.globalAlpha = .35; g.beginPath(); g.ellipse(hash(i * 1.3) * 256, hash(i * 2.9) * 256, 3 + hash(i) * 14, 2 + hash(i * 5) * 6, hash(i * 7) * 3, 0, 7); g.fill(); }
    g.globalAlpha = .8; g.strokeStyle = '#5e5240'; g.lineWidth = 3; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(0, 128); g.quadraticCurveTo(128, 60 + k * 30, 256, 40 + k * 45); g.stroke(); } }
  const wt = new THREE.CanvasTexture(tc); wt.colorSpace = THREE.SRGBColorSpace; wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(.38, .38);
  const G = new THREE.Group(), wm = new THREE.MeshStandardMaterial({ map: wt, roughness: .95, side: THREE.DoubleSide }), bm = new THREE.MeshStandardMaterial({ color: '#6e604c', roughness: .9 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.11, .9, 4, 8), bm); G.add(body);
  const sh = new THREE.Shape(); sh.moveTo(0, .3); sh.bezierCurveTo(1.2, 1.3, 2.7, 1.1, 2.5, .1); sh.bezierCurveTo(2.2, -1.1, .9, -1.0, 0, -.35); const wg = new THREE.ShapeGeometry(sh, 16);
  const wl = new THREE.Group(), wr = new THREE.Group(); const a = new THREE.Mesh(wg, wm), b = new THREE.Mesh(wg, wm); b.scale.x = -1; wl.add(a); wr.add(b); G.add(wl, wr);
  G.userData = { wl, wr }; return G;
}
const WAL = wallet(), MOTH = moth(); ss_.add(WAL, MOTH);
const hop = t => { const u = ((t - 12.54) % BEAT + BEAT) % BEAT / .26; return u < 1 ? 4 * u * (1 - u) * 1.1 : 0; };
// the phone's screen: the fair from above; my dot (blue), my friend's dot (gold) drifting off into the crowd and lost; then the call
const pX = (x) => 270 + x * 46, pY = (z) => 600 + z * 46;
function screen(t) {
  const { sc: cv, st } = PH.userData, x = cv.getContext('2d'), w = 540, h = 1140;
  x.globalAlpha = 1; x.fillStyle = '#0b1030'; x.fillRect(0, 0, w, h); x.fillStyle = '#16245a'; x.fillRect(0, 300, w, 600);
  x.fillStyle = '#c9b48a'; x.beginPath(); x.ellipse(270, 600, 252, 196, 0, 0, 7); x.fill(); x.fillStyle = '#5e8a4a'; x.beginPath(); x.ellipse(160, 480, 120, 46, 0, 0, 7); x.fill();
  const SC = ['#e0413a', '#f2b632', '#2f74c8', '#e45d9b', '#33a46a', '#f07a2c'];
  for (const s of F.stalls) { x.fillStyle = SC[s.i % 6]; x.globalAlpha = .85; x.fillRect(pX(s.x) - 13, pY(s.z) - 11, 26, 22); } x.globalAlpha = 1;
  x.fillStyle = 'rgba(255,255,255,.55)'; x.font = '600 22px "Inter Tight"'; x.textAlign = 'center'; x.fillText('Bali Jatra · Cuttack', 270, 290);
  const dot = (px, py, col, a, ph) => { for (let k = 0; k < 2; k++) { const u = ((t * .9 + ph + k * .5) % 1); x.strokeStyle = col; x.globalAlpha = (1 - u) * a; x.lineWidth = 4; x.beginPath(); x.arc(px, py, 16 + u * 56, 0, 7); x.stroke(); }
    x.globalAlpha = a; x.fillStyle = '#fff'; x.beginPath(); x.arc(px, py, 19, 0, 7); x.fill(); x.fillStyle = col; x.beginPath(); x.arc(px, py, 15, 0, 7); x.fill(); x.globalAlpha = 1; };
  dot(pX(-3.2), pY(1.68), '#4ab8ff', 1, 0);
  // the friend: starts beside me, gets swept along the lanes, fades out ("lost")
  const u = eio(seg(t, 16.75, 17.5)); const fx = u < .5 ? lerp(-2.6, 0, u / .5) : lerp(0, 3.4, (u - .5) / .5), fz = u < .5 ? lerp(1.68, .53, u / .5) : lerp(.53, -.62, (u - .5) / .5);
  const fa = 1 - ss(seg(t, 17.3, 17.62)); dot(pX(fx), pY(fz), '#ffc24a', fa, .3);
  if (t > 17.5 && t < 17.95) { x.globalAlpha = Math.sin(seg(t, 17.5, 17.95) * Math.PI); x.fillStyle = '#ffc24a'; x.font = '700 60px "Inter Tight"'; x.fillText('?', pX(3.4), pY(-.62) + 20); x.globalAlpha = 1; }
  const cIn = eo(seg(t, 17.77, 18.0));
  if (cIn > 0) { x.save(); x.translate(0, (1 - cIn) * -260); x.fillStyle = 'rgba(14,16,28,.94)'; x.beginPath(); x.roundRect(24, 60, w - 48, 200, 38); x.fill();
    const r = 52 + 8 * Math.max(0, Math.sin(t * 18)); x.fillStyle = '#2fae6a'; x.beginPath(); x.arc(112, 160, r, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.font = '700 60px "Anek Odia"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ସ', 112, 166);
    x.textAlign = 'left'; x.font = '700 60px "Anek Odia"'; x.fillText('ସାଙ୍ଗ', 194, 136); x.font = '500 28px "Inter Tight"'; x.fillStyle = 'rgba(255,255,255,.72)'; x.fillText('incoming call…', 196, 204);
    x.restore(); x.textBaseline = 'alphabetic'; }
  st.needsUpdate = true;
}
function studioAt(t) {
  const fy = studio.FLOOR.y; let pos, look, focus, aper = 220, keyI = .8;
  D.visible = t < 13.59; TH.visible = t >= 13.59 && t < 16.72; PH.visible = t >= 16.72; WAL.visible = t >= 15.6 && t < 16.72; MOTH.visible = t >= 15.98 && t < 17.0;
  if (t < 13.59) {
    D.position.set(0, fy + 2.6 + hop(t), 0); D.rotation.y = .35 * t + 9 * ei(seg(t, 13.25, 13.59));
    const u = eo(seg(t, 12.35, 13.5)); pos = V(0, lerp(31, 23, u), lerp(56, 38, u)); look = V(0, fy - 1.2, 4); focus = V(0, fy + 4, 2);
  } else if (t < 16.72) {
    TH.position.set(0, fy + (t < 14.63 ? hop(t) * .8 : 0), 0); TH.rotation.y = .3 * t - 6 * (1 - eo(seg(t, 13.59, 14.1)));
    KIDS.forEach(k => k.scale.setScalar(1));
    EAT.forEach((grp, i) => { const te = 14.66 + i * BEAT / 4; const k = 1 - ei(seg(t, te, te + .13)); grp.forEach(j => KIDS[j] && KIDS[j].scale.setScalar(Math.max(1e-3, k * (1 + .12 * Math.sin(seg(t, te - .1, te) * Math.PI))))); });
    { const te = 14.66 + 6 * BEAT / 4, pu = KIDS[1]; const k = ei(seg(t, te, te + .3)); pu.scale.set(1 + k * .25, Math.max(.02, 1 - k * .97), 1 + k * .25); }
    const u = eo(seg(t, 13.59, 14.4)), u2 = eio(seg(t, 15.5, 16.2));
    pos = V(0, lerp(lerp(52, 44, u), 40, u2), lerp(lerp(76, 66, u), 54, u2)); look = V(0, fy - lerp(7, 4, u2), lerp(6, 2, u2)); focus = V(0, fy + 4, 0); aper = 200;
    // the wallet: drops onto the empty plate, bounces, falls open — nothing inside but a moth
    const dt = t - 15.66, yy = dt < 0 ? 60 : dt < .22 ? lerp(60, 0, (dt / .22) ** 2) : Math.abs(Math.sin((dt - .22) * 16)) * 2.2 * Math.exp(-(dt - .22) * 9);
    WAL.position.set(0, fy + 1.2 + yy, 1); WAL.rotation.set(0, -.25, 0); WAL.userData.hinge.rotation.x = -2.15 * back(seg(t, 15.92, 16.16), 1.4);
    const mp0 = V(0, fy + 3, 1), cp = pos.clone(), dir = look.clone().sub(cp).normalize(), mp1 = cp.clone().add(dir.multiplyScalar(3.2));
    const mu = eio(seg(t, 16.0, 16.7)); const mp = mp0.clone().lerp(mp1, mu); mp.x += Math.sin(t * 7) * 2.5 * (1 - mu); mp.y += Math.sin(t * 5) * 1.2 * (1 - mu) + mu * (1 - mu) * 6;
    MOTH.position.copy(mp); MOTH.lookAt(cp); const fl = Math.sin(t * 46) * .9; MOTH.userData.wl.rotation.y = fl; MOTH.userData.wr.rotation.y = -fl; MOTH.scale.setScalar(1.3);
  } else {
    screen(t);
    const buzz = t > 17.77 && t < 18.5 && (t - 17.77) % .5 < .32 ? 1 : 0, pu = eio(seg(t, 18.4, 18.98));
    PH.position.set(Math.sin(t * 90) * .12 * buzz, 5, 0); PH.rotation.set(lerp(-.15, 0, pu), lerp(.35 - .12 * seg(t, 16.72, 18.4), 0, pu) + Math.sin(t * 77) * .035 * buzz, lerp(.08, 0, pu) + Math.sin(t * 63) * .03 * buzz);
    pos = V(0, lerp(6, 5, pu), lerp(lerp(62, 55, seg(t, 16.72, 18.4)), 19, pu)); look = V(0, lerp(1.2, 5, pu), 0); focus = V(0, 3, 0); aper = lerp(160, 40, pu); keyI = .2;
    // the moth flies off past the lens as the phone is revealed
    const mu = eo(seg(t, 16.72, 17.0)), md = look.clone().sub(pos).normalize(); MOTH.position.copy(pos).add(md.multiplyScalar(3.2)).add(V(lerp(0, 9, mu), lerp(0, 5, mu), -mu * 3)); MOTH.lookAt(pos); const fl = Math.sin(t * 46) * .9; MOTH.userData.wl.rotation.y = fl; MOTH.userData.wr.rotation.y = -fl;
  }
  sc.position.copy(pos); sc.lookAt(look); sc.updateProjectionMatrix();
  ss_.backgroundIntensity = .55; studio.U.uBgI.value = .55;
  studio.updateEnv({ left: 1.1, right: 1.1, top: 1.2, front: .5, back: 1.2, key: keyI, sweep: { I: 2.2, x: Math.sin(t * .8) * .8, az: 0 } });
  studio.reflect(sc, t >= 16.72 ? [MOTH, PH] : [MOTH]);
  sp.dof.focus = sc.position.distanceTo(focus); sp.dof.aper = aper; sp.dof.maxCoc = 14;
  R.toneMappingExposure = 1.1; R.shadowMap.enabled = false;
  sp.composer.render(); return R.domElement;
}

// ———————————————————————————— MAP (night relief, the voyage) ————————————————————————————
const ms = new THREE.Scene(); ms.background = new THREE.Color('#03040a'); ms.fog = new THREE.FogExp2('#05070f', .011);
const mc = new THREE.PerspectiveCamera(36, W / H, .1, 2000);
const mp = makePost(R, ms, mc, W, H, { ssaa: 1, ao: false }); mp.bloom.strength = .6; mp.bloom.threshold = .7; mp.bloom.radius = .5;
ms.add(new THREE.HemisphereLight('#4a5a8a', '#1a1410', .6)); { const m = new THREE.DirectionalLight('#c8d0f0', 1.2); m.position.set(-30, 40, -20); ms.add(m); }
const M = await buildMap(ms);
const smT = u => { const a = M.curve.getTangentAt(clamp(u - .03, 0, 1)), b = M.curve.getTangentAt(clamp(u + .03, 0, 1)); return a.add(b).normalize(); };
let cutPx = [W / 2, H / 2];
function mapAt(t) {
  if (t < 28.5) {
    const u = eio(seg(t, 25.0, 27.0)), bu = .002 + .99 * u; M.update(t, { prog: Math.min(1, bu + .3), boat: bu, boatS: 1.15 });
    const p = M.curve.getPointAt(bu), tg = smT(bu), up = ss(seg(t, 26.5, 27.17)), back_ = 7 + 3 * Math.sin(u * Math.PI);
    mc.position.set(p.x - tg.x * back_ - tg.z * 4, lerp(10, 20, up), p.z - tg.z * back_ + tg.x * 4); mc.lookAt(p.x + tg.x * lerp(1.5, 6, up), lerp(-5.2, -8, up), p.z + tg.z * lerp(1.5, 6, up));
    mp.dof.focus = mc.position.distanceTo(p); mp.dof.aper = 22;
  } else {
    const fl = ss(seg(t, 31.0, 31.4)); M.update(t, { prog: 1, boat: 1, boatS: 1, pillar: eo(seg(t, 29.3, 30.1)) * (1 + 1.6 * fl) });
    const c = M.cities.cuttack.position, u = eio(seg(t, 29.1, 31.1));
    mc.position.set(c.x + lerp(3, 16, u), lerp(8, 44, u) + fl * 4, c.z + lerp(15, 104, u)); mc.lookAt(c.x + lerp(0, 7, u), lerp(0, -6, u) + fl * 8, c.z + lerp(2, 36, u)); mp.dof.focus = 60; mp.dof.aper = 0;
    mc.updateMatrixWorld(); const v = c.clone().project(mc); cutPx = [(v.x * .5 + .5) * W, (-v.y * .5 + .5) * H];
  }
  mp.dof.maxCoc = 10; mc.updateProjectionMatrix(); R.toneMappingExposure = 1.0; R.shadowMap.enabled = false;
  mp.composer.render(); return R.domElement;
}

// ———————————————————————————— NEON (the street, the signs) ————————————————————————————
const nCv = mk(); const N = await makeNeon(nCv, W, H);
const NC = { kat: [0, 5.45, 470, 1.4], bj: [7, 4.99, 460, 1.4], wide: [3.6, 5.2, 205, 1.4], street: [5.5, .5, 175, .6], od: [13.25, 5.0, 425, 1.4] };
const mixC = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
function neonAt(t) {
  let c, on, lights, beat = 0, ex = 1;
  if (t < 20) {
    if (t < 2.0) c = mixC(NC.kat, [0, 5.45, 520, 1.4], ss(t / 2.0));
    else if (t < 3.13) c = mixC([0, 5.45, 520, 1.4], mixC(NC.bj, [7, 4.99, 490, 1.4], seg(t, 2.3, 3.13)), eio(seg(t, 2.0, 2.32)));
    else if (t < 3.75) c = mixC([7, 4.99, 490, 1.4], NC.wide, eio(seg(t, 3.13, 3.5)));
    else c = mixC(NC.wide, NC.street, eio(seg(t, 3.75, 4.4)));
    on = { bj: [2.12], bjf: [2.28], od: [99], heart: [99], zzz: [-1, 3.3], moon: [-1, 3.45], rd0: [99], rd1: [99], rdLeg: [99] };
    lights = ss(seg(t, 3.3, 3.65));
  } else {
    const punch = [31.35, 31.87].reduce((a, b) => a + (t > b ? Math.exp(-(t - b) * 7) : 0), 0);
    if (t < 32.35) { c = mixC([7, 4.99, 300, 1.4], [7, 4.99, 425, 1.4], eo(seg(t, 31.1, 31.6))); c[2] += 45 * punch; ex = 1 + .4 * punch; }
    else if (t < 32.75) c = mixC([7, 4.99, 425, 1.4], NC.od, eio(seg(t, 32.35, 32.72)));
    else if (t < 33.45) c = mixC(NC.od, [13.25, 5.0, 445, 1.4], seg(t, 32.75, 33.45));
    else c = mixC([13.25, 5.0, 445, 1.4], NC.kat, eio(seg(t, 33.45, 33.9)));
    on = { bj: [31.15, 33.62], bjf: [31.25, 33.62], od: [32.48, 33.64], heart: [32.56, 33.64], zzz: [33.66], moon: [33.7], rd0: [99], rd1: [99], rdLeg: [99] };
    lights = 1 - ss(seg(t, 33.5, 33.72)); beat = 32.6;
  }
  N.render(t, N.cam(...c), { on, lights, beat, exposure: ex }); return nCv;
}

// ———————————————————————————— WATERCOLOUR ————————————————————————————
const wCv = mk(), WX = wCv.getContext('2d'); await initDawn();
function dawnAt(t) { drawDawn(WX, t, { paint: ss(seg(t, 20.4, 22.5)), night: ss(seg(t, 22.95, 24.0)), boita: eo(seg(t, 23.9, 24.95)) }); return wCv; }
// a wet-edge mask (ink bleeding across the frame) for the fair → paper transition
const MK = document.createElement('canvas'); MK.width = 135; MK.height = 240; const MKX = MK.getContext('2d'), MKD = MKX.createImageData(135, 240);
const NZ = new Float32Array(135 * 240); for (let y = 0; y < 240; y++) for (let x = 0; x < 135; x++) { let n = 0, a = 1, f = 1 / 40; for (let o = 0; o < 4; o++) { n += a * (Math.sin(x * f * 6.1 + o * 1.7 + Math.sin(y * f * 3.3 + o)) * .5 + Math.sin(y * f * 5.3 - o * 2.3 + Math.sin(x * f * 4.1)) * .5); a *= .5; f *= 2.1; } NZ[y * 135 + x] = n * .22 + .5 + (y / 240 - .5) * 1.1; }
const W2 = mk(), W2X = W2.getContext('2d');
function wetMask(k) { for (let i = 0; i < NZ.length; i++) { const v = clamp((k * 2.1 - .55 - NZ[i]) / .14 + .5); MKD.data[i * 4 + 3] = v * 255; } MKX.putImageData(MKD, 0, 0); return MK; }

// ———————————————————————————— compositing ————————————————————————————
function put(src, o = {}) {
  const a = o.a ?? 1; if (a <= 0) return;
  O.save(); O.globalAlpha = a; O.globalCompositeOperation = o.op || 'source-over'; if (o.blur > .3) O.filter = `blur(${o.blur.toFixed(1)}px)`;
  const s = o.s ?? 1, cx = o.cx ?? W / 2, cy = o.cy ?? H / 2, tx = o.tx ?? cx, ty = o.ty ?? cy;
  O.translate(tx, ty); O.scale(s, s); O.drawImage(src, -cx, -cy, W, H); O.restore();
}
function smear(src, dx, dy, n = 6) { for (let k = 0; k < n; k++) { const f = k / (n - 1) - .5; put(src, { a: 1 / (k + 1), tx: W / 2 + dx * f, ty: H / 2 + dy * f }); } }
function flash(a, col = '255,244,225') { if (a <= 0) return; O.save(); O.globalCompositeOperation = 'lighter'; O.fillStyle = `rgba(${col},${clamp(a)})`; O.fillRect(0, 0, W, H); O.restore(); }
function snap(src) { BX.clearRect(0, 0, W, H); BX.drawImage(src, 0, 0); return BUF; }
// grain
const GR = document.createElement('canvas'); GR.width = GR.height = 256; { const g = GR.getContext('2d'), d = g.createImageData(256, 256); for (let i = 0; i < 256 * 256; i++) { const v = 128 + (hash(i * .713) - .5) * 90; d.data.set([v, v, v, 255], i * 4); } g.putImageData(d, 0, 0); }
const GRP = O.createPattern(GR, 'repeat');
// lyric look per line: y of the first half-line baseline, ink, accent, halo
const DARK = { ink: '#fbf7ef', acc: '#f4c56c', shadow: 'rgba(0,0,0,.55)' };
const LOOK = i => ({ ...DARK, y: 1300, ...(i === 10 ? { y: 360, ink: '#2b2420', acc: '#b4402a', shadow: 'rgba(255,250,240,.7)' } : i === 11 ? { y: 360 } : {}) });

async function frame(t) {
  O.setTransform(1, 0, 0, 1, 0, 0); O.globalAlpha = 1; O.globalCompositeOperation = 'source-over'; O.filter = 'none'; O.fillStyle = '#000'; O.fillRect(0, 0, W, H);
  // A · neon street → into the puddle
  if (t < 4.45) { const k = seg(t, 3.95, 4.45); const src = neonAt(t);
    if (t > 2.0 && t < 2.32) smear(src, 260 * Math.sin(seg(t, 2.0, 2.32) * Math.PI), 0); else put(src, { s: 1 + .14 * ei(k), blur: 12 * k, cy: H * .75 }); }
  // B · the fair: sand → stalls → laughter → Ramdoli → river of light → dive into a stall
  if (t >= 3.95 && t < 12.65) { const a = ss(seg(t, 3.95, 4.42)); put(fairAt(t), { a, s: lerp(.9, 1, eo(seg(t, 3.95, 4.5))), blur: 10 * (1 - a) }); }
  // C · studio
  if (t >= 12.35 && t < 19.0) { const a = ss(seg(t, 12.42, 12.66)); const src = studioAt(t);
    if (t > 13.45 && t < 13.75) { O.globalAlpha = 1; smear(src, 300 * Math.sin(seg(t, 13.45, 13.75) * Math.PI), 0, 7); } else put(src, { a, s: lerp(1.12, 1, eo(seg(t, 12.42, 12.9))) }); }
  flash(.35 * Math.sin(seg(t, 12.3, 12.7) * Math.PI), '255,200,140');
  if (t > 16.6 && t < 16.85) flash(0);
  // D · the fair again: friends meet, the fair erupts
  if (t >= 18.75 && t < 21.3) { const a = ss(seg(t, 18.78, 19.02)); const src = fairAt(t);
    if (t < 20.62) put(src, { a, s: lerp(.82, 1, eo(seg(t, 18.78, 19.15))) });
    else { put(src); const k = seg(t, 20.62, 21.25), wc = dawnAt(t); W2X.globalCompositeOperation = 'source-over'; W2X.clearRect(0, 0, W, H); W2X.drawImage(wc, 0, 0);
      W2X.globalCompositeOperation = 'destination-in'; W2X.imageSmoothingEnabled = true; W2X.drawImage(wetMask(ss(k)), 0, 0, W, H); W2X.globalCompositeOperation = 'source-over'; put(W2); } }
  // E · watercolour: dawn boats, Taapoi → night wash, the boita rises
  if (t >= 21.25 && t < 25.35) { const k = ei(seg(t, 24.9, 25.35)); put(dawnAt(t), { s: 1 + 1.1 * k, cx: 540, cy: 1110, a: 1 }); }
  // F · map: the voyage
  if (t >= 24.95 && t < 27.17) { const a = ss(seg(t, 24.98, 25.32)); const src = mapAt(t); put(src, { a, s: lerp(.7, 1, eo(seg(t, 24.95, 25.5))) });
    if (t > 25.35 && t < 26.9) speed(eio(seg(t, 25.0, 27.0))); }
  // G · the fair dressed in new colours
  if (t >= 27.17 && t < 29.62) { const src = fairAt(t); if (t < 29.05) put(src); else { const f = snap(src); const m = mapAt(t); put(m, { a: ss(seg(t, 29.05, 29.3)) }); const k = ei(seg(t, 29.05, 29.62));
    put(f, { a: (1 - ss(seg(t, 29.05, 29.3))) * (1 - ss(seg(t, 29.3, 29.62))), s: lerp(1, .04, k), tx: lerp(W / 2, cutPx[0], k), ty: lerp(H / 2, cutPx[1], k) });
    BX.save(); BX.globalCompositeOperation = 'destination-in'; const rg = BX.createRadialGradient(W / 2, H / 2, lerp(150, 60, k), W / 2, H / 2, lerp(530, 330, k)); rg.addColorStop(0, '#000'); rg.addColorStop(1, 'rgba(0,0,0,0)'); BX.fillStyle = rg; BX.fillRect(0, 0, W, H); BX.restore();
    put(f, { a: 1 - ss(seg(t, 29.3, 29.62)), s: lerp(1, .04, k), tx: lerp(W / 2, cutPx[0], k), ty: lerp(H / 2, cutPx[1], k) }); } }
  // H · Asia: the pillar of light
  if (t >= 29.62 && t < 31.45) put(mapAt(t));
  // I · neon: the chant, Odisha's soul — and back to the sleeping sign (loop)
  if (t >= 31.3) { const src = neonAt(t); if (t > 33.45) smear(src, -420 * Math.sin(seg(t, 33.45, 33.9) * Math.PI), 0, 8); else put(src); }
  flash(.9 * Math.exp(-Math.abs(t - 27.17) * 9) * (t > 27.05 ? 1 : 0) * (1 - ss(seg(t, 27.3, 27.47))));
  flash(.95 * ss(seg(t, 31.05, 31.32)) * (1 - ss(seg(t, 31.32, 31.62))), '255,240,250');
  // lyrics + grain
  { const li = Math.floor(t / B), lk = LOOK(li); if (li !== 10 && t < 33.6) { const y0 = lk.y - 190, y1 = lk.y + 210, g = O.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(4,4,12,0)'); g.addColorStop(.45, 'rgba(4,4,12,.42)'); g.addColorStop(.6, 'rgba(4,4,12,.42)'); g.addColorStop(1, 'rgba(4,4,12,0)'); O.fillStyle = g; O.fillRect(0, y0, W, y1 - y0); }
    drawLyrics(O, t, lk); }
  O.save(); O.globalCompositeOperation = 'overlay'; O.globalAlpha = .07; const gx = Math.floor(hash(Math.floor(t * 30) * 1.7) * 256), gy = Math.floor(hash(Math.floor(t * 30) * 3.1) * 256);
  O.translate(-gx, -gy); O.fillStyle = GRP; O.fillRect(0, 0, W + 256, H + 256); O.restore();
}
// anime speed lines (the voyage)
function speed(u) {
  const k = Math.sin(clamp((u - .05) / .9) * Math.PI); if (k <= 0) return;
  O.save(); O.globalCompositeOperation = 'lighter'; const cx = 540, cy = 1000;
  for (let i = 0; i < 70; i++) { const a = hash(i * 3.7) * TAU, r0 = 380 + hash(i * 5.1 + Math.floor(u * 40)) * 500, len = 200 + hash(i * 2.3) * 500;
    O.strokeStyle = `rgba(220,235,255,${.18 * k * (.4 + hash(i))})`; O.lineWidth = 1.5 + hash(i * 9) * 3; O.beginPath(); O.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); O.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len)); O.stroke(); }
  O.restore();
}

await document.fonts.load('600 40px "Inter Tight"'); await document.fonts.load('italic 600 40px "CormorantG"'); await document.fonts.load('700 40px "Anek Odia"'); await document.fonts.ready;
window.DUR = TO - FROM;
window.render = t => frame(t + FROM);
await frame(+(QS.get('t') ?? FROM)); window.READY = true;
