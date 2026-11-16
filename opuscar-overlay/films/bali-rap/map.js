// The voyage on a night relief map (grammar of styles/map-explainer: real elevation and bathymetry, relief stood up by a low
// light, the sea shaded by its depth, one glowing data layer): the lane from Odisha to Bali, a low-poly boita on it, city lights.
import * as THREE from 'three';
import { clamp, lerp, TAU, hash } from '/core/lib.js';

export const MW = 100;   // world width of the map (units); height follows the heightmap's aspect
export async function buildMap(scene) {
  const meta = await (await fetch('data/height.json')).json();
  const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data/height.png'; });
  // read 16-bit PNG via a canvas is 8-bit only; decode the high byte + low byte from a second pass is not possible, so re-encode: use the PNG as is (8-bit precision is enough for relief at this scale)
  const cv = document.createElement('canvas'); cv.width = meta.w; cv.height = meta.h; const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
  const px = cx.getImageData(0, 0, meta.w, meta.h).data;
  const elev = new Float32Array(meta.w * meta.h); for (let i = 0; i < elev.length; i++) elev[i] = (px[i * 4] * 256 + px[i * 4 + 1]) / 65535 * meta.zrange + meta.zmin;
  { const tmp = elev.slice(), w = meta.w, h = meta.h; for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { let s = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) s += tmp[(y + j) * w + x + i]; elev[y * w + x] = s / 9; } }
  const MH = MW * meta.h / meta.w;
  const hTex = new THREE.DataTexture(elev, meta.w, meta.h, THREE.RedFormat, THREE.FloatType); hTex.minFilter = hTex.magFilter = THREE.LinearFilter; hTex.needsUpdate = true;
  const merc = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
  const my0 = merc(meta.lat1), my1 = merc(meta.lat0);
  const ll2w = (lon, lat) => [((lon - meta.lon0) / (meta.lon1 - meta.lon0) - .5) * MW, ((merc(lat) - my0) / (my1 - my0) - .5) * MH];
  const EX = 1 / 2600, SEA = 1 / 14000;   // vertical exaggeration: land ~x30 at this scale, the sea floor gently
  const U = { hTex: { value: hTex }, light: { value: new THREE.Vector3(-.5, .45, -.4).normalize() }, px: { value: new THREE.Vector2(1 / meta.w, 1 / meta.h) }, size: { value: new THREE.Vector2(MW, MH) }, EX: { value: EX }, SEA: { value: SEA }, glow: { value: 1 } };
  const geo = new THREE.PlaneGeometry(MW, MH, 1000, Math.round(1000 * MH / MW)); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({ uniforms: U,
    vertexShader: `uniform sampler2D hTex; uniform vec2 size; uniform float EX, SEA; varying vec2 vUv; varying float vH; varying vec3 vW;
      void main(){ vUv = vec2(position.x / size.x + .5, position.z / size.y + .5); float h = texture2D(hTex, vUv).r; vH = h;
        vec3 p = position; p.y = h > 0. ? h * EX : h * SEA; vec4 w = modelMatrix * vec4(p, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D hTex; uniform vec3 light; uniform vec2 px, size; uniform float EX, SEA, glow; varying vec2 vUv; varying float vH; varying vec3 vW;
      float H(vec2 uv){ float h = texture2D(hTex, uv).r; return h > 0. ? h * EX : h * SEA; }
      void main(){
        vec2 d = px * 1.5; float hx = H(vUv + vec2(d.x, 0.)) - H(vUv - vec2(d.x, 0.)), hz = H(vUv + vec2(0., d.y)) - H(vUv - vec2(0., d.y));
        vec3 n = normalize(vec3(-hx / (2. * d.x * size.x), 1., -hz / (2. * d.y * size.y)));
        float lam = max(dot(n, light), 0.);
        vec3 col;
        if (vH > 0.) {
          vec3 low = vec3(.085, .095, .085), mid = vec3(.16, .15, .13), hi = vec3(.36, .37, .40);
          col = mix(low, mid, smoothstep(0., 600., vH)); col = mix(col, hi, smoothstep(1200., 3000., vH));
          col *= .18 + 1.25 * lam; col *= vec3(.82, .9, 1.12);
          col += vec3(.9, .7, .45) * .05 * exp(-vH / 25.);      // the coast catches warm light
        } else {
          float dep = -vH; col = mix(vec3(.035, .09, .14), vec3(.012, .028, .07), smoothstep(0., 160., dep)); col = mix(col, vec3(.004, .009, .028), smoothstep(1500., 5500., dep));
          col *= .7 + .5 * lam;
          col += vec3(.35, .75, .9) * .22 * exp(-dep / 10.) * glow;   // the coastline glows (surf)
        }
        gl_FragColor = vec4(col, 1.);
        #include <colorspace_fragment>
      }` });
  const terrain = new THREE.Mesh(geo, mat); scene.add(terrain);
  const hAt = (x, z) => { const u = clamp(x / MW + .5, 0, 1), v = clamp(z / MH + .5, 0, 1); const h = elev[Math.floor(v * (meta.h - 1)) * meta.w + Math.floor(u * (meta.w - 1))]; return h > 0 ? h * EX : h * SEA; };

  // the lane (Paradip → Bay of Bengal → Malacca → Java Sea → Bali), glowing; drawn progressively
  const LL = [[86.7, 20.15], [87.4, 18.6], [89.2, 15.2], [91.8, 11.4], [94.6, 7.4], [97.0, 5.6], [99.2, 4.2], [100.5, 3.0], [102.3, 1.9], [103.9, 1.15], [105.3, -.4], [106.6, -2.0], [107.2, -3.3], [108.6, -5.0], [111.2, -5.8], [113.6, -6.45], [114.9, -7.55], [115.15, -8.0]];
  const pts = LL.map(([a, b]) => { const [x, z] = ll2w(a, b); return new THREE.Vector3(x, .15, z); });
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const laneMat = new THREE.ShaderMaterial({ uniforms: { prog: { value: 1 }, time: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float prog, time; varying vec2 vUv; void main(){ if (vUv.x > prog) discard; float head = exp(-pow((prog - vUv.x) * 60., 2.)); float dash = .65 + .35 * step(.5, fract(vUv.x * 90. - time * 1.5));
      vec3 c = vec3(1., .72, .32) * (.9 * dash + 3. * head); gl_FragColor = vec4(c, 1.); }` });
  const lane = new THREE.Mesh(new THREE.TubeGeometry(curve, 600, .045, 6, false), laneMat); scene.add(lane);
  const laneGlow = new THREE.Mesh(new THREE.TubeGeometry(curve, 600, .16, 6, false), new THREE.ShaderMaterial({ uniforms: laneMat.uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: laneMat.vertexShader, fragmentShader: `uniform float prog; varying vec2 vUv; void main(){ if (vUv.x > prog) discard; gl_FragColor = vec4(vec3(1., .6, .25) * .07, 1.); }` })); scene.add(laneGlow);

  // the boita (low-poly, the fair's language): hull, peacock prow, two square sails, a lamp
  const B = new THREE.Group(), fm = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .8, ...o });
  const hg = new THREE.BoxGeometry(2.2, .42, .74, 4, 1, 1), hp = hg.attributes.position;
  for (let i = 0; i < hp.count; i++) { const x = hp.getX(i), y = hp.getY(i); const k = Math.abs(x) / 1.1; hp.setZ(i, hp.getZ(i) * (1 - .8 * k * k) * (y < 0 ? .65 : 1)); if (y > 0) hp.setY(i, y + .25 * k * k); }
  hg.computeVertexNormals(); const hull = new THREE.Mesh(hg, fm('#7a3a22')); hull.position.y = .2; B.add(hull);
  const band = new THREE.Mesh(new THREE.BoxGeometry(1.7, .06, .76), fm('#e8c070')); band.position.y = .38; B.add(band);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.06, .1, .7, 5), fm('#2a6ab0')); neck.position.set(1.18, .72, 0); neck.rotation.z = -.35; B.add(neck);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(.12, 0), fm('#2a6ab0')); head.position.set(1.3, 1.05, 0); B.add(head);
  const crest = new THREE.Mesh(new THREE.ConeGeometry(.04, .16, 4), fm('#33a46a')); crest.position.set(1.28, 1.2, 0); B.add(crest);
  for (let k = 0; k < 5; k++) { const f = new THREE.Mesh(new THREE.ConeGeometry(.07, .5, 3), fm(['#2a6ab0', '#33a46a', '#e8c070'][k % 3])); f.position.set(-1.15, .75, (k - 2) * .1); f.rotation.set((k - 2) * .25, 0, .5); B.add(f); }
  for (const [x, h, w] of [[.15, 1.6, .95], [.75, 1.15, .62]]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.025, .03, h, 5), fm('#3a2414')); m.position.set(x, .4 + h / 2, 0); B.add(m);
    const sg = new THREE.PlaneGeometry(w, h * .58, 3, 3), sp = sg.attributes.position; for (let i = 0; i < sp.count; i++) sp.setZ(i, .16 * Math.cos(sp.getX(i) / w * Math.PI) * Math.cos(sp.getY(i) / (h * .58) * Math.PI)); sg.computeVertexNormals();
    const s = new THREE.Mesh(sg, fm('#f3e2b8', { side: THREE.DoubleSide, emissive: '#3a2a14', emissiveIntensity: .4 })); s.rotation.y = Math.PI / 2; s.position.set(x + .05, .4 + h * .62, 0); B.add(s); }
  const lamp = new THREE.Mesh(new THREE.IcosahedronGeometry(.07, 0), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#ffcf7a', emissiveIntensity: 4 })); lamp.position.set(-.7, .65, .2); B.add(lamp);
  const pl = new THREE.PointLight('#ffb060', 6, 4, 1.5); pl.position.set(-.7, .9, .3); B.add(pl);
  scene.add(B);

  // city lights (glow sprites) and labels' anchors
  const CITIES = { cuttack: [85.88, 20.46, 1.2], bbsr: [85.82, 20.27, .8], kolkata: [88.36, 22.57, 1.0], chennai: [80.27, 13.08, .9], singapore: [103.82, 1.35, 1.0], jakarta: [106.85, -6.2, 1.0], denpasar: [115.2, -8.65, .8], kl: [101.69, 3.14, .8], yangon: [96.16, 16.8, .7], bangkok: [100.5, 13.75, .9] };
  const dot = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(.25, 'rgba(255,190,110,.6)'); g.addColorStop(1, 'rgba(255,150,60,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const cities = {};
  for (const [k, [lon, lat, s]] of Object.entries(CITIES)) { const [x, z] = ll2w(lon, lat); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); sp.position.set(x, hAt(x, z) + .3, z); sp.scale.setScalar(1.6 * s); scene.add(sp); cities[k] = sp; }
  // a pillar of light (Cuttack, "Asia's biggest fair")
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(.3, .55, 14, 16, 1, true), new THREE.ShaderMaterial({ uniforms: { amt: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform float amt; varying vec2 vUv; void main(){ float a = amt * pow(1. - vUv.y, 1.4) * (.6 + .4 * sin(vUv.x * 6.283 * 3.)); gl_FragColor = vec4(vec3(1., .78, .4) * a * 1.6, 1.); }` }));
  { const [x, z] = ll2w(85.88, 20.46); pillar.position.set(x, 7, z); } scene.add(pillar);

  const M = { terrain, lane, laneMat, boita: B, curve, ll2w, hAt, MH, cities, pillar, U };
  M.update = (t, o = {}) => {
    laneMat.uniforms.time.value = t; laneMat.uniforms.prog.value = o.prog ?? 1;
    const u = clamp(o.boat ?? 0, 0, 1), p = curve.getPointAt(u), tg = curve.getTangentAt(u);
    B.position.set(p.x, .05 + Math.sin(t * 2.2) * .03, p.z); B.rotation.y = Math.atan2(-tg.z, tg.x); B.rotation.z = Math.sin(t * 1.7) * .04; B.scale.setScalar(o.boatS ?? 1);
    pillar.material.uniforms.amt.value = o.pillar ?? 0; pillar.scale.y = Math.max(.001, o.pillar ?? 0); pillar.position.y = 7 * (o.pillar ?? 0);
  };
  return M;
}
