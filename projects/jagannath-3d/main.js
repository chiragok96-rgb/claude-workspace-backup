// Shree Jagannath temple, Puri, built in three.js (Kalinga architecture, stylised): the rekha deula (vimana) with its
// pancharatha plan and curving spire, amalaka, kalasha, Nilachakra and flag; the pidha deulas of the jagamohana, natamandapa
// and bhogamandapa; the inner and outer (Meghanada) walls; the Singhadwara with its lions; the Aruna Stambha. ?shot=1|2|3
import * as THREE from 'three';
const Q = new URLSearchParams(location.search), SHOT = Q.get('shot') || '1', LOOK = Q.get('look') || 'day';   // look: day | night | clay
const W = Number(Q.get('w') || 1080), H = Number(Q.get('h') || 1920);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

// ---------- light presets per shot ----------
const LIGHT = {
  1: { sun: [-80, 70, 110], sunCol: '#ffcf9a', sunI: 3.4, zen: '#6f9fd6', hor: '#f6d2a8', ground: '#c9a676', hemi: .55, exp: 1.0, fog: [180, 520] },     // golden morning
  2: { sun: [-110, 90, 140], sunCol: '#fff0d8', sunI: 3.6, zen: '#5a8fd0', hor: '#dfe8ee', ground: '#cdb08a', hemi: .65, exp: 1.0, fog: [200, 600] },   // bright morning, from the road
  3: { sun: [-70, 22, -160], sunCol: '#ffa060', sunI: 3.6, zen: '#3a4f8a', hor: '#ffad6e', ground: '#9a7458', hemi: .9, exp: 1.15, fog: [220, 700] },   // sunset behind the spire
  4: { sun: [-80, 70, 110], sunCol: '#ffcf9a', sunI: 3.4, zen: '#6f9fd6', hor: '#f6d2a8', ground: '#c9a676', hemi: .6, exp: 1.0, fog: [220, 640] },      // the detail view
}[SHOT] || { sun: [-80, 70, 110], sunCol: '#ffcf9a', sunI: 3.4, zen: '#6f9fd6', hor: '#f6d2a8', ground: '#c9a676', hemi: .6, exp: 1.0, fog: [220, 640] };
if (LOOK === 'night') Object.assign(LIGHT, { sun: [90, 120, 60], sunCol: '#7d8fc9', sunI: .35, zen: '#070b1e', hor: '#1d2142', ground: '#140d0a', hemi: .12, exp: 1.25, fog: [260, 900] });
if (LOOK === 'clay') Object.assign(LIGHT, { sun: [-90, 120, 100], sunCol: '#fff6ea', sunI: 2.4, zen: '#a8d0f0', hor: '#f2f6f4', ground: '#d6e3bc', hemi: 1.6, exp: 1.2, fog: [500, 1400] });

// ---------- sky ----------
{
  const g = new THREE.SphereGeometry(900, 48, 24);
  const sd = new THREE.Vector3(...LIGHT.sun).normalize();
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { zen: { value: new THREE.Color(LIGHT.zen) }, hor: { value: new THREE.Color(LIGHT.hor) }, sd: { value: sd }, sc: { value: new THREE.Color(LIGHT.sunCol) }, night: { value: LOOK === 'night' ? 1 : 0 } },
    vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `uniform vec3 zen, hor, sc, sd; uniform float night; varying vec3 vp;
      void main(){ float h = clamp(vp.y, 0., 1.); vec3 c = mix(hor, zen, smoothstep(0., .6, pow(h, .7)));
        float s = max(dot(vp, sd), 0.); c += sc * (pow(s, 600.) * 4. + pow(s, 12.) * .35 * smoothstep(.02, .25, vp.y));
        if (night > .5) { vec3 q = floor(vp * 260.); float r = fract(sin(dot(q, vec3(12.9898, 78.233, 37.719))) * 43758.5453); c += vec3(.9, .9, 1.) * step(.9965, r) * smoothstep(.05, .3, vp.y); }
        gl_FragColor = vec4(c, 1.);

        #include <colorspace_fragment>
      }` });
  const sky = new THREE.Mesh(g, m); sky.name = 'sky'; scene.add(sky);
}
scene.fog = new THREE.Fog(new THREE.Color(LIGHT.hor), LIGHT.fog[0], LIGHT.fog[1]);

// ---------- light ----------
const hemi = new THREE.HemisphereLight(LIGHT.zen, LIGHT.ground, LIGHT.hemi); scene.add(hemi);
const sun = new THREE.DirectionalLight(LIGHT.sunCol, LIGHT.sunI); sun.position.set(...LIGHT.sun); sun.target.position.set(0, 10, 20);
sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); const sc = sun.shadow.camera; sc.left = -130; sc.right = 130; sc.top = 130; sc.bottom = -130; sc.near = 10; sc.far = 500;
sun.shadow.bias = -.0004; sun.shadow.normalBias = .04; sun.shadow.radius = 3;
scene.add(sun, sun.target);
renderer.toneMappingExposure = LIGHT.exp;
if (SHOT === '3') { const fillL = new THREE.DirectionalLight('#8fa6d8', .9); fillL.position.set(80, 60, 140); scene.add(fillL); }

// ---------- materials: stone with grain ----------
function stoneTex(base, seed) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const k = c.getContext('2d');
  k.fillStyle = base; k.fillRect(0, 0, 256, 256); let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 2600; i++) { const v = r(); k.fillStyle = `rgba(${v > .5 ? '255,250,240' : '60,40,25'},${.04 + r() * .06})`; k.fillRect(r() * 256, r() * 256, 1 + r() * 4, 1 + r() * 2); }
  for (let i = 0; i < 40; i++) { k.fillStyle = `rgba(70,50,30,${.03 + r() * .05})`; k.beginPath(); k.ellipse(r() * 256, r() * 256, 10 + r() * 40, 6 + r() * 20, r() * 3, 0, 7); k.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(.15, .15); return t;
}
const MAT = {
  stone: new THREE.MeshStandardMaterial({ map: stoneTex('#d8c7a6', 3), roughness: .88 }),
  stoneD: new THREE.MeshStandardMaterial({ map: stoneTex('#bfae8e', 5), roughness: .9 }),
  wall: new THREE.MeshStandardMaterial({ map: stoneTex('#c9b089', 9), roughness: .92 }),
  white: new THREE.MeshStandardMaterial({ map: stoneTex('#ece6d8', 11), roughness: .8 }),
  ground: new THREE.MeshStandardMaterial({ map: stoneTex('#c8ad84', 13), roughness: 1 }),
  road: new THREE.MeshStandardMaterial({ map: stoneTex('#b9a283', 17), roughness: 1 }),
  metal: new THREE.MeshStandardMaterial({ color: '#b9b4a8', metalness: .85, roughness: .32 }),
  gold: new THREE.MeshStandardMaterial({ color: '#d9a83c', metalness: .9, roughness: .3 }),
  red: new THREE.MeshStandardMaterial({ color: '#c2261c', roughness: .7, side: THREE.DoubleSide }),
  yel: new THREE.MeshStandardMaterial({ color: '#efb52a', roughness: .7, side: THREE.DoubleSide }),
  leaf: new THREE.MeshStandardMaterial({ color: '#4d7a3a', roughness: .95, flatShading: true }),
  leafD: new THREE.MeshStandardMaterial({ color: '#3a6230', roughness: .95, flatShading: true }),
  bark: new THREE.MeshStandardMaterial({ color: '#6b5240', roughness: 1 }),
};
if (LOOK === 'clay') {
  const clay = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 1, metalness: 0 });
  Object.assign(MAT, { stone: clay('#f3cfa6'), stoneD: clay('#e7b48a'), wall: clay('#f8e2c2'), white: clay('#fbf3e6'), ground: clay('#d6e8b4'), road: clay('#f1e6cc'),
    metal: clay('#8fa0b8'), gold: clay('#f2c14e'), leaf: new THREE.MeshStandardMaterial({ color: '#7fb85a', roughness: 1, flatShading: true }), leafD: new THREE.MeshStandardMaterial({ color: '#5f9a45', roughness: 1, flatShading: true }), bark: clay('#9a6b4c') });
}
if (LOOK === 'night') { for (const k of ['stone', 'stoneD', 'wall', 'white']) MAT[k].color = new THREE.Color('#d6c4a8'); }
const add = (geo, mat, x = 0, y = 0, z = 0, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast !== false; m.receiveShadow = true; if (o.ry) m.rotation.y = o.ry; (o.parent || scene).add(m); return m; };

// ---------- the pancharatha plan: a square whose faces step out in five planes (kanika, anuratha, raha) ----------
function rathaShape(s, d1 = .07, d2 = .14) {
  const prof = u => { const a = Math.abs(u); return a < .36 ? d2 : a < .74 ? d1 : 0; };
  const pts = [], seg = [[1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1], [-1, -1, 1, -1]];   // right, top, left, bottom (CCW)
  const brk = [-1, -.74, -.36, .36, .74, 1];
  for (const [x0, y0, x1, y1] of seg) {
    const nx = Math.sign(x0 + x1) * (x0 === x1 ? 1 : 0), ny = Math.sign(y0 + y1) * (y0 === y1 ? 1 : 0);
    for (let i = 0; i < brk.length - 1; i++) {
      const ua = brk[i], ub = brk[i + 1], off = prof((ua + ub) / 2) * s;
      for (const u of [ua, ub]) { const px = x0 + (x1 - x0) * (u + 1) / 2, py = y0 + (y1 - y0) * (u + 1) / 2; pts.push(new THREE.Vector2(px * s + nx * off, py * s + ny * off)); }
    }
  }
  return new THREE.Shape(pts);
}
function slab(s, h, mat, y, x, z, o = {}) {   // a horizontal course with the ratha plan, extruded upward
  const g = new THREE.ExtrudeGeometry(rathaShape(s, o.d1, o.d2), { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
  return add(g, mat, x, y, z, o);
}
function lathe(prof, mat, x, y, z, seg = 40, o = {}) { return add(new THREE.LatheGeometry(prof.map(([r, h]) => new THREE.Vector2(r, h)), seg), mat, x, y, z, o); }
function amalaka(r, x, y, z, mat = MAT.stone) {   // the ribbed crowning disc
  const g = new THREE.CylinderGeometry(r, r, r * .55, 64, 6); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i), a = Math.atan2(vz, vx), bulge = Math.cos(vy / (r * .55) * Math.PI) * .5 + .5, rib = 1 + .07 * Math.cos(a * 24);
    const k = (.72 + .28 * bulge) * rib; p.setX(i, vx * k); p.setZ(i, vz * k); }
  g.computeVertexNormals(); return add(g, mat, x, y, z);
}

// ---------- the rekha deula (vimana) ----------
function rekhaDeula(x, z, S, o = {}) {   // S = half-width of the base; total height ≈ 6.3 S
  const mat = o.mat || MAT.stone;
  // pitha and bada (the walled base): plinth mouldings, the jangha, the baranda band
  slab(S * 1.12, S * .12, MAT.stoneD, 0, x, z); slab(S * 1.06, S * .1, mat, S * .12, x, z); slab(S * 1.02, S * .08, MAT.stoneD, S * .22, x, z);
  slab(S, S * .62, mat, S * .3, x, z);
  for (let k = 0; k < 3; k++) slab(S * (1.05 - k * .015), S * .045, MAT.stoneD, S * (.92 + k * .07), x, z);
  if (S > 6) for (let f = 0; f < 4; f++) {   // the parshva-devata niches: a frame, a dark recess, a small pidha crown
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = f * Math.PI / 2; scene.add(g);
    const d = S * 1.14, nw = S * .3, nh = S * .42, ny = S * .52;
    add(new THREE.BoxGeometry(nw * 1.35, nh * 1.25, S * .06), MAT.stoneD, 0, ny, d + S * .03, { parent: g });
    add(new THREE.BoxGeometry(nw, nh, S * .05), new THREE.MeshStandardMaterial({ color: '#3a2a1e', roughness: 1 }), 0, ny - nh * .04, d + S * .06, { parent: g });
    for (let k = 0; k < 3; k++) add(new THREE.BoxGeometry(nw * (1.5 - k * .25), S * .04, S * .1), MAT.stone, 0, ny + nh * .66 + k * S * .05, d + S * .05, { parent: g });
    add(new THREE.SphereGeometry(S * .05, 12, 8), MAT.stone, 0, ny + nh * .66 + S * .19, d + S * .05, { parent: g });
    for (const sx of [-1, 1]) add(new THREE.BoxGeometry(S * .05, nh * 1.3, S * .08), MAT.stone, sx * nw * .72, ny, d + S * .07, { parent: g });   // pilasters
  }
  slab(S * .99, S * .16, mat, S * 1.13, x, z);
  // the gandi: the curving spire of stacked courses (bhumis), each a thick course and a recessed thin one
  const y0 = S * 1.29, Hs = S * 4.2, n = o.courses || 26;
  for (let i = 0; i < n; i++) {
    const u = i / n, s = S * (.99 - .6 * Math.pow(u, 2.1)), y = y0 + u * Hs, h = Hs / n;
    slab(s, h * .78, mat, y, x, z); slab(s * .955, h * .22, MAT.stoneD, y + h * .78, x, z);
    if (S > 6 && i % 5 === 4) for (const [cx, cz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) amalaka(s * .12, x + cx * s * .9, y + h * .5, z + cz * s * .9, MAT.stoneD);   // bhumi-amalas on the corners
    if (S > 6 && i % 5 === 2) for (let f = 0; f < 4; f++) { const a = f * Math.PI / 2, rx = Math.sin(a), rz = Math.cos(a), dd = s * 1.16; const m = add(new THREE.BoxGeometry(s * .26, h * 1.6, s * .06), MAT.stoneD, x + rx * dd, y + h * .2, z + rz * dd); m.rotation.y = a; }   // chaitya medallions on the raha
  }
  // bhumi-amalas on the corners every few courses
  const yt = y0 + Hs, st = S * .4;
  // the mastaka: beki, amalaka, khapuri, kalasha
  lathe([[0, 0], [st * .78, 0], [st * .72, S * .18], [0, S * .18]], mat, x, yt, z);
  amalaka(st * 1.08, x, yt + S * .32, z, mat);
  lathe([[0, 0], [st * .9, 0], [st * .8, S * .1], [st * .55, S * .2], [st * .2, S * .27], [0, S * .28]], mat, x, yt + S * .48, z);
  lathe([[0, 0], [st * .25, 0], [st * .38, S * .1], [st * .4, S * .2], [st * .28, S * .3], [st * .16, S * .34], [st * .24, S * .4], [0, S * .44]], MAT.gold, x, yt + S * .74, z);
  if (o.chakra) {   // the Nilachakra: an eight-spoked wheel of ashtadhatu, and the flags above it
    const cy = yt + S * 1.32, R = S * .2;
    const ring = add(new THREE.TorusGeometry(R, R * .07, 12, 64), MAT.metal, x, cy, z); ring.rotation.y = Math.PI / 2 * 0;
    for (let k = 0; k < 8; k++) { const sp = add(new THREE.CylinderGeometry(R * .03, R * .03, R * 2, 8), MAT.metal, x, cy, z); sp.rotation.z = k * Math.PI / 8; }
    add(new THREE.SphereGeometry(R * .12, 16, 12), MAT.metal, x, cy, z);
    add(new THREE.CylinderGeometry(S * .015, S * .02, S * 1.5, 8), MAT.bark, x, cy + S * .55, z);   // the flagstaff
    flag(x, cy + S * 1.25, z, S * 1.2, S * .48, LOOK === 'clay' ? MAT.red : flagTex('#c41f1a', '#f2b322', true));
    flag(x, cy + S * .9, z, S * .8, S * .32, LOOK === 'clay' ? MAT.yel : flagTex('#f2a51c', '#c41f1a', false));
  }
  return yt;
}
function flagTex(main, edge, sym) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const k = c.getContext('2d');
  k.fillStyle = edge; k.fillRect(0, 0, 512, 256); k.fillStyle = main; k.fillRect(0, 22, 512, 212);
  if (sym) { k.fillStyle = '#fff8e6'; k.beginPath(); k.arc(130, 128, 46, 0, 7); k.fill(); k.fillStyle = main; k.beginPath(); k.arc(150, 116, 42, 0, 7); k.fill();   // crescent moon
    k.fillStyle = '#fff1b0'; k.beginPath(); k.arc(250, 128, 26, 0, 7); k.fill(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; k.fillRect(250 + Math.cos(a) * 34 - 3, 128 + Math.sin(a) * 34 - 3, 6, 6); } }   // sun
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.MeshStandardMaterial({ map: t, roughness: .75, side: THREE.DoubleSide });
}
function flag(x, y, z, L, Hh, mat) {   // a long triangular pennant streaming in the sea wind
  const g = new THREE.PlaneGeometry(L, Hh, 24, 4), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = (p.getX(i) + L / 2) / L, v = p.getY(i) / Hh; p.setY(i, p.getY(i) * (1 - u * .85) - u * u * Hh * .5); p.setZ(i, Math.sin(u * 7) * Hh * .18 * u + Math.sin(u * 3 + v) * Hh * .1); }
  g.computeVertexNormals(); g.translate(L / 2, 0, 0); const m = add(g, mat, x, y, z); m.rotation.y = -Math.PI * .62; return m;
}
// ---------- the pidha deula: tiers of horizontal slabs in groups, a bell (ghanta), amalaka and kalasha ----------
function pidhaDeula(x, z, S, o = {}) {
  const mat = o.mat || MAT.stone, bh = o.bada || S * .95;
  slab(S * 1.1, S * .12, MAT.stoneD, 0, x, z); slab(S * 1.04, S * .1, mat, S * .12, x, z);
  slab(S, bh, mat, S * .22, x, z, { d1: .05, d2: .1 });
  for (let k = 0; k < 2; k++) slab(S * (1.04 - k * .02), S * .05, MAT.stoneD, S * .22 + bh + k * S * .06, x, z, { d1: .05, d2: .1 });
  let y = S * .34 + bh; const groups = o.groups || 3, per = o.per || 4;
  for (let g = 0; g < groups; g++) {
    for (let k = 0; k < per; k++) { const u = (g * per + k) / (groups * per), s = S * (1.12 - .8 * u); slab(s, S * .085, mat, y, x, z, { d1: .04, d2: .08 }); slab(s * .9, S * .04, MAT.stoneD, y + S * .085, x, z, { d1: .04, d2: .08 }); y += S * .125; }
    if (g < groups - 1) { slab(S * (1.0 - .8 * (g + 1) / groups), S * .12, MAT.stoneD, y, x, z, { d1: .03, d2: .06 }); y += S * .12; }
  }
  const sb = S * .34;
  lathe([[0, 0], [sb * 1.2, 0], [sb * 1.25, S * .1], [sb * 1.0, S * .3], [sb * .55, S * .46], [0, S * .5]], mat, x, y, z);   // the ghanta (bell)
  amalaka(sb * .75, x, y + S * .58, z, mat);
  lathe([[0, 0], [sb * .2, 0], [sb * .32, S * .07], [sb * .34, S * .14], [sb * .22, S * .21], [sb * .12, S * .24], [sb * .2, S * .28], [0, S * .31]], MAT.gold, x, y + S * .72, z);
  return y;
}

// ---------- the complex ----------
// ground and road (Bada Danda, the grand road, runs east from the Singhadwara)
add(new THREE.PlaneGeometry(5000, 5000).rotateX(-Math.PI / 2), MAT.ground, 0, 0, 0, { cast: false });
add(new THREE.BoxGeometry(70, .1, 600), MAT.road, 0, .05, 380, { cast: false });
// the platforms
add(new THREE.BoxGeometry(46, 1.6, 120), MAT.stoneD, 0, .8, 22);
const VS = 10;   // the vimana's half-width
rekhaDeula(0, 0, VS, { chakra: true, courses: 30 });
pidhaDeula(0, 25, 10, { groups: 3, per: 3, bada: 8.5 });            // jagamohana
pidhaDeula(0, 44, 8.2, { groups: 2, per: 4, bada: 6.5 });  // natamandapa
pidhaDeula(0, 61, 7.4, { groups: 2, per: 3, bada: 6 });    // bhogamandapa
// a ring of small shrines inside the compound
for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + .2, r = 64 + (i % 3) * 7, x = Math.cos(a) * r, z = Math.sin(a) * r * .95 + 22; if (Math.abs(x) < 26 && z > 60) continue; (i % 2 ? rekhaDeula : pidhaDeula)(x, z, 2.2 + rnd() * 1.4, { courses: 10, groups: 2, per: 3 }); }
// walls: the inner (Kurma) and the outer (Meghanada pacheri), with gates on the four sides
function wall(half, h, t, gateW) {
  for (const [x, z, w, d] of [[0, -half, half * 2, t], [-half, 0, t, half * 2], [half, 0, t, half * 2]]) add(new THREE.BoxGeometry(w, h, d), MAT.wall, x, h / 2, z + 22);
  const seg = (half * 2 - gateW) / 2; for (const sx of [-1, 1]) add(new THREE.BoxGeometry(seg, h, t), MAT.wall, sx * (gateW / 2 + seg / 2), h / 2, half + 22);
  for (let k = -half; k <= half; k += 6) for (const [x, z] of [[k, -half], [k, half], [-half, k], [half, k]]) { if (z === half && Math.abs(x) < gateW / 2) continue; add(new THREE.BoxGeometry(2.2, .9, t + .3), MAT.wall, x, h + .45, z + 22); }   // merlons
}
wall(84, 6, 2.2, 22); wall(118, 9, 3, 30);
// the Singhadwara: a pidha-roofed gate in the east wall, a lion on either side
pidhaDeula(0, 140, 7, { groups: 2, per: 3, bada: 8 });
add(new THREE.BoxGeometry(5, 7, 16), MAT.wall, 0, 0, 0).visible = false;
function lion(x, z, s) {   // a seated lion, stylised
  const g = new THREE.Group(); g.position.set(x, 1.6, z); scene.add(g);
  add(new THREE.BoxGeometry(2.6 * s, 1.2 * s, 3 * s), MAT.stoneD, 0, .6 * s, 0, { parent: g });
  add(new THREE.CylinderGeometry(.9 * s, 1.2 * s, 2.6 * s, 12), MAT.white, 0, 2.2 * s, .6 * s, { parent: g });
  add(new THREE.SphereGeometry(1.0 * s, 16, 12), MAT.white, 0, 3.8 * s, 1.1 * s, { parent: g });
  add(new THREE.TorusGeometry(.9 * s, .35 * s, 8, 20), MAT.white, 0, 3.8 * s, .9 * s, { parent: g });
  for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(.3 * s, .35 * s, 2 * s, 8), MAT.white, sx * .6 * s, 1.6 * s, 1.6 * s, { parent: g });
}

add(new THREE.BoxGeometry(12, 1.6, 10), MAT.stoneD, 0, .8, 146);   // the gate's steps
// the Aruna Stambha: a sixteen-sided monolith with Aruna kneeling on top
{ const z = 160; add(new THREE.BoxGeometry(5, 2.4, 5), MAT.stoneD, 0, 1.2, z); add(new THREE.CylinderGeometry(.85, 1.05, 18, 16), MAT.stoneD, 0, 11.4, z);
  lathe([[0, 0], [1.6, 0], [1.4, .8], [1.8, 1.4], [0, 1.4]], MAT.stoneD, 0, 20.4, z);
  add(new THREE.CylinderGeometry(.5, .7, 1.4, 10), MAT.stoneD, 0, 22.5, z); add(new THREE.SphereGeometry(.45, 12, 10), MAT.stoneD, 0, 23.6, z); }
// trees outside the walls and along the road
function tree(x, z, s) { add(new THREE.CylinderGeometry(.35 * s, .5 * s, 4 * s, 7), MAT.bark, x, 2 * s, z); for (let k = 0; k < 3; k++) add(new THREE.IcosahedronGeometry((2.6 - k * .5) * s, 0), k % 2 ? MAT.leafD : MAT.leaf, x + (rnd() - .5) * 1.6 * s, (4.6 + k * 1.3) * s, z + (rnd() - .5) * 1.6 * s); }
for (let i = 0; i < 60; i++) { const a = rnd() * Math.PI * 2, r = 135 + rnd() * 160, x = Math.cos(a) * r, z = Math.sin(a) * r + 22; if (Math.abs(x) < 45 && z > 100) continue; tree(x, z, 1.4 + rnd() * 1.4); }
for (let k = 0; k < 10; k++) for (const sx of [-1, 1]) tree(sx * (40 + rnd() * 8), 190 + k * 26, 1.6 + rnd());
// low houses along the grand road
for (let k = 0; k < 14; k++) for (const sx of [-1, 1]) { const w = 8 + rnd() * 6, h = 4 + rnd() * 5, hx = sx * (56 + rnd() * 4), hz = 185 + k * 15; add(new THREE.BoxGeometry(12, h, w), k % 3 ? MAT.white : MAT.wall, hx, h / 2, hz); add(new THREE.BoxGeometry(12.6, .5, w + .6), MAT.stoneD, hx, h + .25, hz); }

// ---------- the shots ----------
const cam = new THREE.PerspectiveCamera(32, W / H, .5, 2000);
const SHOTS = {
  1: { pos: [118, 92, 205], at: [0, 30, 30], fov: 34 },     // aerial, three-quarter, golden morning
  2: { pos: [26, 2.2, 275], at: [0, 33, 50], fov: 26 },      // from the grand road: Aruna Stambha, Singhadwara, the spire
  3: { pos: [-70, 30, 120], at: [0, 46, 0], fov: 27 },        // the spire's crown against the sunset
  4: { pos: [66, 16, 92], at: [0, 33, 0], fov: 44 },           // the detail view: niches, corner amalakas, the flag
  5: { pos: [92, 34, 205], at: [0, 26, 34], fov: 32 },          // night of diyas
  6: { pos: [128, 92, 225], at: [0, 26, 28], fov: 28 },        // the clay miniature, from above
};
const sh = SHOTS[SHOT]; cam.fov = sh.fov; cam.position.set(...sh.pos); scene.getObjectByName('sky').position.copy(cam.position); cam.lookAt(...sh.at); cam.updateProjectionMatrix();
if (LOOK === 'night') {
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const k = c.getContext('2d'); const g = k.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,220,150,1)'); g.addColorStop(.25, 'rgba(255,170,80,.55)'); g.addColorStop(1, 'rgba(255,120,40,0)'); k.fillStyle = g; k.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const flameM = new THREE.MeshBasicMaterial({ color: '#ffd27a', fog: false }), glowM = new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const diya = (x, y, z, s = 1) => { add(new THREE.SphereGeometry(.16 * s, 6, 4), flameM, x, y + .2 * s, z, { cast: false }); const g = new THREE.Sprite(glowM); g.position.set(x, y + .3 * s, z); g.scale.set(2.6 * s, 2.6 * s, 1); scene.add(g); };
  for (let k = -84; k <= 84; k += 3) for (const [x, z] of [[k, -84], [-84, k], [84, k]]) diya(x, 6.9, z + 22);              // along the inner wall
  for (let k = -84; k <= 84; k += 3) if (Math.abs(k) > 11) diya(k, 6.9, 106);
  for (let k = -118; k <= 118; k += 4) for (const [x, z] of [[k, -118], [-118, k], [118, k]]) diya(x, 9.9, z + 22, 1.2);  // along the outer wall
  for (let k = -118; k <= 118; k += 4) if (Math.abs(k) > 15) diya(k, 9.9, 140, 1.2);
  for (let k = 0; k < 40; k++) { diya(-22, 1.7, -36 + k * 3); diya(22, 1.7, -36 + k * 3); }                           // the platform's edges
  for (let k = 0; k < 30; k++) for (const sx of [-1, 1]) diya(sx * 30, .2, 150 + k * 6, 1.4);                         // the grand road
  // floodlights washing the spire and the jagamohana from below, as Puri is lit at night
  for (const [x, z, tx, ty, tz, I] of [[34, 40, 0, 40, 0, 2600], [-34, 40, 0, 40, 0, 2200], [30, 70, 0, 22, 25, 1300], [-30, 70, 0, 22, 25, 1100]]) {
    const L = new THREE.SpotLight('#ffbf7a', I, 220, .42, .7, 1.6); L.position.set(x, 2, z); L.target.position.set(tx, ty, tz); scene.add(L, L.target); }
  const p1 = new THREE.PointLight('#ff9a4a', 300, 120, 1.6); p1.position.set(0, 4, 100); scene.add(p1);
}
let post = null;
if (LOOK === 'clay') {   // tilt-shift: render to a target, blur by distance from a horizontal focus band, lift saturation a touch
  const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
  const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: { t: { value: rt.texture }, res: { value: new THREE.Vector2(W, H) } },
    vertexShader: 'varying vec2 u; void main(){ u = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `uniform sampler2D t; uniform vec2 res; varying vec2 u;
      void main(){ float b = smoothstep(.1, .42, abs(u.y - .47)) * 9.; vec4 acc = vec4(0.); float n = 0.;
        for (int i = 0; i < 24; i++) { float a = float(i) * 2.39996; float r = sqrt(float(i) / 24.) * b; vec2 o = vec2(cos(a), sin(a)) * r / res; acc += texture2D(t, u + o); n += 1.; }
        vec3 c = acc.rgb / n; float l = dot(c, vec3(.299, .587, .114)); c = mix(vec3(l), c, 1.18); gl_FragColor = vec4(c, 1.); }` }));
  const ps = new THREE.Scene(); ps.add(q); const pc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  post = () => { renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(null); renderer.render(ps, pc); };
  sun.shadow.radius = 6;
}
window.DUR = 1;
window.render = () => post ? post() : renderer.render(scene, cam);
window.render(); window.READY = true;
