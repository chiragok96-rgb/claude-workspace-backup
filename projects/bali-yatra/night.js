// Kartika night: the full moon over the sea, a boita under sail, banana-bark boats of light on the river, and the fair at Cuttack.
import * as THREE from 'three';
const hh = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
export const NS = new THREE.Scene();
export const MOON_DIR = new THREE.Vector3(0, .2, -1).normalize();
const U = { time: { value: 0 }, moonDir: { value: MOON_DIR }, calm: { value: 0 }, lampGlow: { value: 0 } };

// ---------- textures ----------
function radial(stops, n = 128) { const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'), gr = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(([o, col]) => gr.addColorStop(o, col)); x.fillStyle = gr; x.fillRect(0, 0, n, n); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const GLOW = radial([[0, 'rgba(255,255,255,1)'], [.15, 'rgba(255,255,255,.55)'], [.45, 'rgba(255,255,255,.12)'], [1, 'rgba(255,255,255,0)']]);
const DOT = radial([[0, 'rgba(255,255,255,1)'], [.35, 'rgba(255,255,255,.8)'], [1, 'rgba(255,255,255,0)']], 64);
const FLAME = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 92, 2, 32, 80, 50); gr.addColorStop(0, 'rgba(255,250,225,1)'); gr.addColorStop(.25, 'rgba(255,200,90,.95)'); gr.addColorStop(.6, 'rgba(255,120,30,.5)'); gr.addColorStop(1, 'rgba(255,80,10,0)'); x.fillStyle = gr; x.beginPath(); x.moveTo(32, 6); x.bezierCurveTo(52, 60, 56, 92, 32, 120); x.bezierCurveTo(8, 92, 12, 60, 32, 6); x.fill(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
function moonTex() { const n = 512, c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d');
  const gr = x.createRadialGradient(n * .45, n * .42, n * .05, n / 2, n / 2, n * .5); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(.85, '#f3ead8'); gr.addColorStop(1, '#e5d9c0'); x.fillStyle = gr; x.beginPath(); x.arc(n / 2, n / 2, n / 2 - 1, 0, 7); x.fill();
  // maria: soft grey seas
  x.globalCompositeOperation = 'multiply'; for (const [px, py, r, a] of [[.36, .34, .14, .5], [.55, .3, .1, .45], [.6, .5, .13, .4], [.42, .55, .09, .35], [.3, .62, .07, .3], [.68, .66, .06, .3], [.5, .78, .05, .25]]) { const g2 = x.createRadialGradient(px * n, py * n, 0, px * n, py * n, r * n); g2.addColorStop(0, `rgba(170,165,160,${a})`); g2.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g2; x.fillRect(0, 0, n, n); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

// ---------- sky ----------
const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { ...U, starA: { value: 1 } },
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*p; }`,
  fragmentShader: `uniform vec3 moonDir; uniform float starA; varying vec3 vD;
  float h(vec3 p){ p = fract(p*.3183+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  void main(){ vec3 d = normalize(vD); float y = max(d.y, 0.);
    vec3 c = mix(vec3(.03,.045,.09), vec3(.004,.007,.022), pow(y, .5));
    float m = max(dot(d, moonDir), 0.); c += vec3(.6,.56,.48) * pow(m, 1400.) * .9 + vec3(.12,.15,.28) * pow(m, 160.) * .12 + vec3(.04,.06,.12) * pow(m, 18.) * .1;
    vec3 qq = d*420.; vec3 q = floor(qq); float s = h(q); vec3 fq = fract(qq) - .5 - (vec3(h(q+1.),h(q+2.),h(q+5.))-.5)*.6; float fw = max(length(fwidth(qq)), 1e-4);
    c += vec3(.9,.92,1.) * step(.9965, s) * smoothstep(.05,.35,y) * (.5+.5*h(q+3.)) * smoothstep(1.6*fw, .4*fw, length(fq)) * starA;
    gl_FragColor = vec4(c, 1.); }` }));
sky.renderOrder = -10; NS.add(sky);
export function setStars(fov) { sky.material.uniforms.starA.value = Math.min(1, Math.max(0, (fov - 12) / 14)); }
export const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex(), color: new THREE.Color(1.7, 1.62, 1.5), depthWrite: false, fog: false }));
const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: new THREE.Color(.5, .46, .4), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .1 }));
export function placeMoon(cam, size = 34, dist = 700) { const p = MOON_DIR.clone().multiplyScalar(dist).add(cam.position); moon.position.copy(p); halo.position.copy(p); moon.scale.setScalar(size); halo.scale.setScalar(size * 5); }
NS.add(halo, moon);

// ---------- water ----------
const waterMat = new THREE.ShaderMaterial({ uniforms: { ...U, camP: { value: new THREE.Vector3() } }, fog: false,
  vertexShader: `uniform float time, calm; varying vec3 vW;
  float wv(vec2 p){ float a = (1.-calm);
    return a*(.35*sin(dot(p,vec2(.12,.05))+time*.9) + .22*sin(dot(p,vec2(-.07,.16))+time*1.3) + .12*sin(dot(p,vec2(.25,.21))+time*1.9)); }
  void main(){ vec4 w = modelMatrix*vec4(position,1.); w.y += wv(w.xz); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
  fragmentShader: `uniform float time, calm, lampGlow; uniform vec3 moonDir, camP; varying vec3 vW;
  float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
  float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
  void main(){ vec2 p = vW.xz; float a = mix(1., .35, calm);
    vec2 g = vec2(vn(p*.9+vec2(time*.6,0))-.5, vn(p*.9+vec2(0,time*.5)+9.)-.5)*.5 + vec2(vn(p*3.1+time)-.5, vn(p*3.3-time+4.)-.5)*.35 + vec2(vn(p*.18+time*.1)-.5, vn(p*.2+3.)-.5)*.6;
    vec3 n = normalize(vec3(g.x*a, 1., g.y*a));
    vec3 V = normalize(camP - vW); vec3 R = reflect(-V, n);
    float fr = .02 + .98*pow(1.-max(dot(n,V),0.), 5.);
    vec3 skyc = mix(vec3(.05,.07,.13), vec3(.01,.015,.04), pow(max(R.y,0.),.55));
    vec3 c = vec3(.004,.008,.016) + skyc*fr*1.4;
    float m = max(dot(R, moonDir), 0.); c += vec3(1.,.93,.8) * (pow(m, 400.)*3.2 + pow(m, 60.)*.07) * mix(1., .5, calm);
    float d = length(camP - vW); c = mix(c, vec3(.03,.04,.08), 1.-exp(-d*.0025));
    gl_FragColor = vec4(c, 1.); }` });
export const water = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000, 300, 300), waterMat); water.rotation.x = -Math.PI / 2; NS.add(water);
export function setWater(cam, t, calm) { U.time.value = t; U.calm.value = calm; waterMat.uniforms.camP.value.copy(cam.position); water.position.x = Math.round(cam.position.x / 10) * 10; water.position.z = Math.round(cam.position.z / 10) * 10; }

// ---------- the boita ----------
function hullGeo(L = 24, B = 6.2, D = 3.2) {   // sections along the length; the sheer rises to a high stern and a raised prow
  const nu = 40, nv = 18, pos = [], idx = [];
  for (let i = 0; i <= nu; i++) { const u = i / nu, x = (u - .5) * L, s = Math.sin(Math.PI * Math.pow(u, .9)), half = B / 2 * Math.pow(s, .55), sheer = D * (.75 + .9 * Math.pow(Math.abs(u - .48) * 2, 2.4) + (u < .2 ? .5 * (1 - u / .2) : 0));
    for (let j = 0; j <= nv; j++) { const v = j / nv * Math.PI, y = -Math.sin(v) * D * .9 * Math.pow(s, .3) + sheer - D * .75, z = Math.cos(v) * half; pos.push(x, y, z); } }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
export function makeBoita() {
  const B = new THREE.Group(), wood = new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: .8 }), dark = new THREE.MeshStandardMaterial({ color: 0x1c120b, roughness: .9 });
  const hull = new THREE.Mesh(hullGeo(), wood); B.add(hull);
  // a painted band along the gunwale (red ochre and white, as on Odisha's boats)
  const band = new THREE.Mesh(new THREE.TorusGeometry(1, .06, 6, 64), new THREE.MeshStandardMaterial({ color: 0x8a2a14, roughness: .7 })); band.scale.set(11.6, 1, 3); band.rotation.x = Math.PI / 2; band.position.y = .55; B.add(band);
  // the peacock prow: a curving neck and head (Mayurapankhi), at +x
  const neck = new THREE.CatmullRomCurve3([new THREE.Vector3(10.5, .4, 0), new THREE.Vector3(12.6, 1.6, 0), new THREE.Vector3(13.4, 3.6, 0), new THREE.Vector3(13.0, 5.3, 0), new THREE.Vector3(13.6, 6.0, 0)]);
  B.add(new THREE.Mesh(new THREE.TubeGeometry(neck, 30, .32, 8), wood));
  const head = new THREE.Mesh(new THREE.SphereGeometry(.42, 12, 8), wood); head.scale.set(1.3, .9, .8); head.position.set(13.8, 6.05, 0); B.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(.16, .7, 6), dark); beak.rotation.z = -Math.PI / 2; beak.position.set(14.45, 5.98, 0); B.add(beak);
  for (let k = 0; k < 3; k++) { const cr = new THREE.Mesh(new THREE.CylinderGeometry(.02, .03, .7, 4), dark); cr.position.set(13.6 - k * .12, 6.55, 0); cr.rotation.z = .3 - k * .15; B.add(cr); const tip = new THREE.Mesh(new THREE.SphereGeometry(.07, 6, 4), dark); tip.position.set(13.5 - k * .23, 6.9, 0); B.add(tip); }
  // the stern: a raised fan, the peacock's tail
  for (let k = 0; k < 7; k++) { const a = -.6 + k * .2, f = new THREE.Mesh(new THREE.BoxGeometry(.18, 3.2, .12), wood); f.position.set(-12.2 - Math.sin(a) * .2, 3.6, Math.sin(a) * 1.6); f.rotation.x = a * .9; f.rotation.z = .35; B.add(f); }
  // deck house with a lamp
  const house = new THREE.Mesh(new THREE.BoxGeometry(5, 1.8, 3.4), dark); house.position.set(-6, 1.4, 0); B.add(house);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 5.4, 12, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x5a3a1c, roughness: 1 })); roof.rotation.z = Math.PI / 2; roof.scale.set(1, 1, .5); roof.position.set(-6, 2.3, 0); B.add(roof);
  const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: new THREE.Color(1, .62, .25), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .9 })); lamp.scale.setScalar(3.2); lamp.position.set(-3.4, 2.0, 1.75); B.add(lamp);
  const lampL = new THREE.PointLight(0xffa050, 18, 14, 1.6); lampL.position.set(-3.2, 2.2, 2.4); B.add(lampL);
  // masts and sails
  const sails = [];
  for (const [mx, H, Wd] of [[1.5, 15, 9.5], [7.2, 10, 6.2]]) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(.16, .22, H, 8), dark); m.position.set(mx, H / 2, 0); B.add(m);
    const yard = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, Wd + 1.2, 6), dark); yard.rotation.x = Math.PI / 2; yard.position.set(mx, H - .3, 0); B.add(yard);
    const g = new THREE.PlaneGeometry(Wd, H * .62, 24, 24); const sail = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xd9bf8c, roughness: .95, side: THREE.DoubleSide, emissive: 0x3a2a14, emissiveIntensity: .2 }));
    sail.rotation.y = Math.PI / 2; sail.position.set(mx, H - .3 - H * .31, 0); sail.userData = { base: g.attributes.position.array.slice(), H: H * .62, Wd }; B.add(sail); sails.push(sail);
    for (const s of [-1, 1]) { const r = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(mx, H - .3, s * (Wd / 2 + .5)), new THREE.Vector3(mx + s * 0 - 3, .6, s * 2.6)]); B.add(new THREE.Line(r, new THREE.LineBasicMaterial({ color: 0x120a05 }))); }
  }
  const fore = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(1.5, 14.7, 0), new THREE.Vector3(12.8, 4.4, 0)]); B.add(new THREE.Line(fore, new THREE.LineBasicMaterial({ color: 0x120a05 })));
  B.userData = { sails, lamp };
  return B;
}
export function billow(B, f, t) {   // f: 0 slack (hanging, faint ripples), 1 full (bellied toward +x)
  for (const s of B.userData.sails) { const { base, H, Wd } = s.userData, a = s.geometry.attributes.position;
    for (let i = 0; i < a.count; i++) { const x = base[i * 3], y = base[i * 3 + 1], u = x / Wd + .5, v = y / H + .5;
      const belly = Math.sin(Math.PI * u) * Math.sin(Math.PI * (.15 + .85 * v)) * 1.9 * f;
      const slack = (1 - f) * (.25 * Math.sin(u * 9 + t * 1.1) * (1 - v) + .5 * (1 - v) * (1 - v));
      a.array[i * 3 + 2] = belly + slack + .06 * Math.sin(u * 13 + t * 4) * f; a.array[i * 3 + 1] = y - (1 - f) * .35 * (1 - v) * Math.sin(Math.PI * u); }
    a.needsUpdate = true; s.geometry.computeVertexNormals(); }
}

// ---------- the boats of light (banana stem, a betel leaf, a diya) ----------
function diyaBoatGeo() { const g = hullGeo(.42, .13, .05); return g; }
export function makeDiyaBoat(seed = 0) {
  const G = new THREE.Group(), bark = new THREE.MeshStandardMaterial({ color: 0x8a8a3c, roughness: .8, emissive: 0x2a1a08, emissiveIntensity: .3 });
  G.add(new THREE.Mesh(diyaBoatGeo(), bark));
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 6), new THREE.MeshStandardMaterial({ color: 0x2f6a24, roughness: .6 })); leaf.scale.set(1.3, .12, .8); leaf.position.set(.03, .04, 0); G.add(leaf);
  const diya = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x9a4a22, roughness: .9 })); diya.rotation.x = Math.PI; diya.position.set(-.04, .075, 0); G.add(diya);
  for (let k = 0; k < 4; k++) { const fl = new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 4), new THREE.MeshStandardMaterial({ color: k % 2 ? 0xf0a020 : 0xe8661a, roughness: .7 })); fl.position.set(.09 + k * .02, .06, (k - 1.5) * .025); G.add(fl); }
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: FLAME, color: new THREE.Color(4, 3.4, 2.6), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); flame.scale.set(.05, .1, 1); flame.position.set(-.04, .13, 0); G.add(flame);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: new THREE.Color(1.4, .7, .25), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .8 })); glow.scale.setScalar(.7); glow.position.set(-.04, .12, 0); G.add(glow);
  // its reflection: a long wobbling streak on the water
  const refl = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: new THREE.Color(1.6, .75, .25), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .55 })); refl.scale.set(.12, .9, 1); refl.position.set(-.04, -.3, 0); G.add(refl);
  G.userData = { flame, glow, refl, seed };
  return G;
}
export function flicker(G, t, a = 1) { const s = G.userData.seed, f = .85 + .1 * Math.sin(t * 13 + s * 7) + .05 * Math.sin(t * 29 + s); G.userData.flame.scale.set(.05 * f, .1 * (f + .1 * Math.sin(t * 9 + s)), 1); G.userData.flame.material.opacity = a; G.userData.glow.material.opacity = .8 * f * a; G.userData.refl.material.opacity = .5 * f * a; }

// ---------- the fair at Cuttack, on the Mahanadi's bank ----------
function bulbs(points, cols, size) {   // instanced glow sprites as Points
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(cols.flat(), 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ size, map: DOT, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, sizeAttenuation: true, toneMapped: false }));
}
const BULB = [[1, .32, .3], [.35, .75, 1], [1, .82, .3], [.45, 1, .5], [1, .5, .9], [1, .95, .8]];
export function makeRamdoli(R = 14) {
  const G = new THREE.Group(), steel = new THREE.MeshStandardMaterial({ color: 0xd8d8e0, roughness: .22, metalness: 1 });
  const wheel = new THREE.Group(); G.add(wheel);
  for (const z of [-1.4, 1.4]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(R, .12, 6, 96), steel); rim.position.z = z; wheel.add(rim); const rim2 = new THREE.Mesh(new THREE.TorusGeometry(R * .55, .08, 6, 64), steel); rim2.position.z = z; wheel.add(rim2);
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, sp = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, R, 4), steel); sp.position.set(Math.cos(a) * R / 2, Math.sin(a) * R / 2, z); sp.rotation.z = a - Math.PI / 2; wheel.add(sp); } }
  const pts = [], cols = [];
  for (let k = 0; k < 16 * 9; k++) { const a = k / 144 * Math.PI * 2; for (const z of [-1.4, 1.4]) { pts.push([Math.cos(a) * R, Math.sin(a) * R, z]); cols.push(BULB[Math.floor(k / 9) % BULB.length].map(v => v * 3.2)); } }
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; for (let r = 1; r < 9; r++) { pts.push([Math.cos(a) * R * r / 9, Math.sin(a) * R * r / 9, 1.45]); cols.push(BULB[(k + 2) % BULB.length].map(v => v * 2.4)); } }
  wheel.add(bulbs(pts, cols, .5));
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 3.4, 20), steel); hub.rotation.x = Math.PI / 2; wheel.add(hub);
  const cars = [];
  for (let k = 0; k < 16; k++) { const car = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 2.2), new THREE.MeshPhysicalMaterial({ color: [0xc8302a, 0x2a6ad8, 0xe8b02a, 0x2aa84a][k % 4], roughness: .25, clearcoat: 1, clearcoatRoughness: .1, emissive: [0x3a0a08, 0x08183a, 0x3a2808, 0x082a10][k % 4], emissiveIntensity: 1 })); b.position.y = -1.1; car.add(b); car.userData.a = k / 16 * Math.PI * 2; wheel.add(car); cars.push(car); }
  for (const s of [-1, 1]) for (const z of [-2.4, 2.4]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(.2, .3, R * 1.25, 6), steel); leg.position.set(s * R * .32, -R * .55, z); leg.rotation.z = s * .5; G.add(leg); }
  G.userData = { wheel, cars, R };
  return G;
}
export function spinRamdoli(G, t) { const { wheel, cars, R } = G.userData, rot = t * .16; wheel.rotation.z = rot; for (const c of cars) { const a = c.userData.a; c.position.set(Math.cos(a) * R, Math.sin(a) * R, 0); c.rotation.z = -rot; } }

// a row of stalls: dark frames, canopies glowing from the lamps inside, festoons of bulbs looping between them
export function makeStalls(n, seed, opts = {}) {
  const G = new THREE.Group(), cols = [0xd8422a, 0xf0b034, 0x3a7fd0, 0xe06aa8, 0x40b06a, 0xf07a26], pts = [], pc = [];
  for (let i = 0; i < n; i++) { const w = 3.4 + hh(seed + i) * 1.0, x = i * 4.6, col = cols[(i * 7 + seed) % cols.length];
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, 2.3, 2.4), new THREE.MeshStandardMaterial({ color: 0x0c0806, roughness: .9 })); body.position.set(x, 1.15, -.3); G.add(body);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(w * .86, 1.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.9, .9).multiplyScalar(.25 + hh(i * 3 + seed) * .4) })); win.position.set(x, 1.45, .91); G.add(win);
    const cnt = new THREE.Mesh(new THREE.BoxGeometry(w * .9, .25, .5), new THREE.MeshStandardMaterial({ color: 0x3a2414, roughness: .5 })); cnt.position.set(x, .95, 1.05); G.add(cnt);
    const tarp = new THREE.Mesh(new THREE.PlaneGeometry(w + .5, 1.8, 6, 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(.5), side: THREE.DoubleSide })); tarp.rotation.x = -1.0; tarp.position.set(x, 2.75, .6); G.add(tarp);
    for (let k = 0; k < 12; k++) { const u = k / 11; pts.push([x - 2.3 + u * 4.6, 3.55 - Math.sin(Math.PI * u) * .45, 1.5]); pc.push([3.2, 2.2, 1.1]); } }
  G.add(bulbs(pts, pc, .22));
  return G;
}
// festoons across a lane: strings of bulbs swagging between poles
export function festoons(x0, x1, z, n, seed) {
  const pts = [], pc = []; for (let i = 0; i < n; i++) { const xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n;
    for (let k = 0; k <= 30; k++) { const u = k / 30; pts.push([xa + (xb - xa) * u, 6.2 - Math.sin(Math.PI * u) * 1.1, z + (hh(i + k) - .5) * .1]); const c = BULB[(k + i + seed) % BULB.length]; pc.push(c.map(v => v * 2.6)); } }
  return bulbs(pts, pc, .26);
}
// the crowd as points of warm light (people with phones, lamps, glints), flowing along the lanes
export function makeCrowd(N, lanes, seed = 1) {
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), D = [];
  for (let i = 0; i < N; i++) { const L = lanes[i % lanes.length], u = hh(i * 1.7 + seed), off = (hh(i * 3.1 + seed) - .5) * L.w, sp = (hh(i * 5.3) - .5) * 1.4;
    D.push({ L, u, off, sp, y: 1.0 + hh(i * 2.2) * .7 }); const c = hh(i * 7.7) < .15 ? [.7, .8, 1] : [1, .72 + hh(i) * .2, .42]; col.set(c.map(v => v * (.5 + hh(i * 9.1) * 1.0)), i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const P = new THREE.Points(g, new THREE.PointsMaterial({ size: .16, map: DOT, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }));
  P.userData = { D, N };
  return P;
}
export function moveCrowd(P, t, k = 1) {   // k: how many of the points are lit (the count rising)
  const { D, N } = P.userData, a = P.geometry.attributes.position.array, n = Math.floor(N * k);
  for (let i = 0; i < N; i++) { if (i >= n) { a[i * 3 + 1] = -100; continue; } const d = D[i], L = d.L, u = ((d.u + t * d.sp * .02) % 1 + 1) % 1;
    const x = lerp(L.a[0], L.b[0], u), z = lerp(L.a[1], L.b[1], u), nx = -(L.b[1] - L.a[1]), nz = L.b[0] - L.a[0], nl = Math.hypot(nx, nz);
    a[i * 3] = x + nx / nl * d.off; a[i * 3 + 1] = d.y; a[i * 3 + 2] = z + nz / nl * d.off; }
  P.geometry.attributes.position.needsUpdate = true;
}
export function fairEnv(renderer) {
  const es = new THREE.Scene(); es.background = new THREE.Color(.004, .006, .014);
  const geo = new THREE.SphereGeometry(1, 8, 6);
  for (let i = 0; i < 140; i++) { const c = BULB[i % BULB.length], k = 6 + hh(i) * 10, m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(c[0] * k, c[1] * k, c[2] * k) }));
    const a = hh(i * 3) * Math.PI * 2, el = -.15 + hh(i * 7) * .6, r = 30; m.position.set(Math.cos(a) * Math.cos(el) * r, Math.sin(el) * r, Math.sin(a) * Math.cos(el) * r); m.scale.setScalar(.4 + hh(i + 1) * .8); es.add(m); }
  const warm = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.6, .6) })); warm.position.set(0, 8, -28); es.add(warm);
  const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromScene(es, .02).texture; pm.dispose(); return env;
}
export { GLOW, DOT, FLAME, U as NU, BULB };
