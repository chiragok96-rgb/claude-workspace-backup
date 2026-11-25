// The room: a warm-white architectural model (1:150) of an Odisha neighbourhood on a dark walnut plinth, a projector straight
// above it that paints the data as light (added to the lit surface, scaled by how squarely a face looks up), a key light that can
// run like the sun, house windows that can glow, and a light table beside the plinth where the records lie.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makePost } from '/core/three/post.js';
import { PLOTS, HOUSES, PALMS, TREES, FIGS, POND, LANE, ROAD, OURS, GATE } from './layout.js';

export const S = 1 / 150;                     // real metres → scene units
export const PW = 1.2, PD = 1.6;              // the plate (180 m × 240 m)
export const TABLE = { x: 1.52, z: 0, w: 1.02, d: 1.44 };   // the light table, beside the plinth (east)

export function makeWorld(W, H, projCanvas, tableCanvas) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H);
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = .84;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, W / H, .004, 30);
  const post = makePost(renderer, scene, camera, W, H, { ssaa: 1, ao: true, aoRadius: .012, aoScale: 1.3, aoThickness: .02, aoAmt: .8 });
  post.bloom.strength = .28; post.bloom.radius = .5; post.bloom.threshold = .82;
  post.vig.uniforms.amt.value = .5; post.vig.uniforms.contrast.value = .14; post.vig.uniforms.warm.value = .04;
  { const c = document.createElement('canvas'); c.width = 270; c.height = 480; const g = c.getContext('2d'), gr = g.createRadialGradient(135, 250, 10, 135, 250, 330);
    gr.addColorStop(0, '#2a221b'); gr.addColorStop(.5, '#110d0a'); gr.addColorStop(1, '#050403'); g.fillStyle = gr; g.fillRect(0, 0, 270, 480);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; scene.background = tex; }
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .03).texture; scene.environmentIntensity = .55;

  // —— projection: one top-down texture over the plate; colour × (0.42 + 0.58·N·up) × albedo, added to the lit surface ——
  const projTex = new THREE.CanvasTexture(projCanvas); projTex.flipY = false; projTex.colorSpace = THREE.SRGBColorSpace; projTex.anisotropy = 8;
  const U = { uProj: { value: projTex }, uProjOn: { value: 1 }, uPlate: { value: new THREE.Vector2(PW, PD) }, uWin: { value: 0 } };
  function projMat(opts, glowWin = false) {
    const m = new THREE.MeshStandardMaterial(opts);
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
        .replace('#include <fog_vertex>', '#include <fog_vertex>\n vWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        uniform sampler2D uProj; uniform float uProjOn, uWin; uniform vec2 uPlate; varying vec3 vWP; varying vec3 vWN;
        vec3 projLight(){ vec2 uv = vec2(vWP.x / uPlate.x + .5, vWP.z / uPlate.y + .5);
          if (any(lessThan(uv, vec2(0.))) || any(greaterThan(uv, vec2(1.)))) return vec3(0.);
          float k = .42 + .58 * max(normalize(vWN).y, 0.); return texture2D(uProj, uv).rgb * k * uProjOn; }`)
        .replace('#include <opaque_fragment>', `outgoingLight += projLight() * mix(diffuseColor.rgb, vec3(1.), .12) * 1.45;
          ${glowWin ? 'outgoingLight += vec3(1., .62, .28) * uWin * 2.2;' : ''}
          #include <opaque_fragment>`);
    };
    m.customProgramCacheKey = () => 'proj' + (glowWin ? 'w' : '');
    return m;
  }
  const WHITE = '#f1ede6';
  const mWhite = projMat({ color: WHITE, roughness: .9 }), mRoad = projMat({ color: '#d6d0c6', roughness: .95 }), mLane = projMat({ color: '#ddd5c7', roughness: .97 });
  const mWin = projMat({ color: '#3a332c', roughness: .6 }, true), mPond = projMat({ color: '#2e2b27', roughness: .22, metalness: .1 });
  const mGate = projMat({ color: '#ece7df', roughness: .7, metalness: .05 });

  // —— geometry helpers (real metres in, scene units out) ——
  const box = (x0, z0, x1, z1, y0, y1) => { const g = new THREE.BoxGeometry((x1 - x0) * S, (y1 - y0) * S, (z1 - z0) * S); g.translate((x0 + x1) / 2 * S, (y0 + y1) / 2 * S, (z0 + z1) / 2 * S); return g; };
  const cyl = (x, z, r, y0, y1, n = 10) => { const g = new THREE.CylinderGeometry(r * S, r * S, (y1 - y0) * S, n); g.translate(x * S, (y0 + y1) / 2 * S, z * S); return g; };
  const white = [], roads = [], lanes = [], wins = [];
  // the plate (with the roads recessed a hair)
  { const g = new THREE.BoxGeometry(PW, .012, PD); g.translate(0, -.006, 0); white.push(g); }
  roads.push(box(ROAD[0], ROAD[1], ROAD[2], ROAD[3], -.25, .02));
  for (let x = -86; x < 90; x += 9) white.push(box(x, 74.75, x + 4, 75.25, .02, .06));      // centre dashes
  lanes.push(box(LANE[0], LANE[1], LANE[2], LANE[3], -.2, .03));
  // houses: Odisha flat roofs with parapets, a stair head-room, a water tank, recessed windows and a door
  const FL = 3.2;
  for (const [x0, z0, x1, z1, fl, face] of HOUSES) {
    const h = fl * FL; white.push(box(x0, z0, x1, z1, 0, h));
    const p = .25; white.push(box(x0, z0, x1, z0 + p, h, h + 1), box(x0, z1 - p, x1, z1, h, h + 1), box(x0, z0, x0 + p, z1, h, h + 1), box(x1 - p, z0, x1, z1, h, h + 1));
    if (fl >= 2) { white.push(box(x0 + 1.5, z0 + 1.5, x0 + 5, z0 + 5.5, h, h + 2.6)); white.push(cyl(x1 - 2.6, z0 + 2.6, 1, h + .1, h + 2.2, 14)); }
    for (let f = 0; f < fl; f++) {        // windows on the two long faces + the face toward the street
      const y0 = f * FL + 1.1, y1 = y0 + 1.25;
      for (let x = x0 + 2.2; x < x1 - 2.4; x += 3.6) { wins.push(box(x, z1 - .02, x + 1.4, z1 + .12, y0, y1), box(x, z0 - .12, x + 1.4, z0 + .02, y0, y1)); }
      for (let z = z0 + 2.2; z < z1 - 2.4; z += 3.6) { wins.push(box(x1 - .02, z, x1 + .12, z + 1.4, y0, y1), box(x0 - .12, z, x0 + .02, z + 1.4, y0, y1)); }
    }
    if (face === 's') wins.push(box((x0 + x1) / 2 - .6, z1 - .02, (x0 + x1) / 2 + .6, z1 + .1, 0, 2.2));
    if (face === 'e') wins.push(box(x1 - .02, (z0 + z1) / 2 - .6, x1 + .1, (z0 + z1) / 2 + .6, 0, 2.2));
    if (face === 'w') wins.push(box(x0 - .1, (z0 + z1) / 2 - .6, x0 + .02, (z0 + z1) / 2 + .6, 0, 2.2));
  }
  // the neighbour's compound wall (stops short of the lane: the lane looks public)
  white.push(box(-40, -10, -39.7, 66, 0, 1.6), box(-40, -10, -.3, -9.7, 0, 1.6), box(-.6, -10, -.3, 60, 0, 1.6), box(-40, 65.7, -10, 66, 0, 1.6));
  // field bunds (north) and the pond's rim
  for (let z = -116; z < -62; z += 13) white.push(box(-38, z, 88, z + .8, 0, .45));
  for (let x = -30; x < 88; x += 21) white.push(box(x, -118, x + .8, -62, 0, .45));
  for (let z = -116; z < -62; z += 11) white.push(box(-88, z, -42, z + .8, 0, .45));
  // survey pegs at the corners of our plot and the empty plots
  const pegs = [];
  for (const p of PLOTS) if (p.pegs) for (const [x, z] of p.poly) pegs.push(cyl(x, z, .18, 0, 1.1, 8));
  // trees: palms (a leaning trunk, a crown of drooping fronds) and round model trees
  const trees = [];
  for (const [x, z, h, lean] of PALMS) {
    const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push(new THREE.Vector3((x + Math.sin(lean) * u * u * 2.2) * S, u * h * S, (z + Math.cos(lean) * u * u * 2.2) * S)); }
    trees.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, .16 * S, 6));
    const top = pts[8];
    for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2 + x, L = 3.8 + .6 * Math.sin(k * 1.7), f = new THREE.BoxGeometry(L * S, .06 * S, .62 * S, 12, 1, 1);
      const pa = f.attributes.position; for (let i = 0; i < pa.count; i++) { const u = pa.getX(i) / (L * S) + .5; pa.setZ(i, pa.getZ(i) * (1 - u * .82) * (.55 + .9 * Math.sin(Math.min(1, u * 1.6) * Math.PI / 2))); pa.setY(i, pa.getY(i) - (2.0 + .6 * (k % 3)) * u * u * S + (k % 2 ? 0 : .25 * S) * (1 - u)); }
      f.translate(L * S / 2 - .15 * S, 0, 0); f.computeVertexNormals(); f.rotateZ(.55 + .2 * (k % 3) - (k % 5 === 0 ? .5 : 0)); f.rotateY(a); f.translate(top.x, top.y, top.z); trees.push(f); }
  }
  if (false) for (const [x, z, r] of TREES) { trees.push(cyl(x, z, .2, 0, r * 1.2, 6)); for (let k = 0; k < 4; k++) { const rr = r * (.62 + .25 * Math.sin(k * 2.1 + x)), a = k * 2.1 + z, d = k ? r * .45 : 0; const g = new THREE.IcosahedronGeometry(rr * S, 2); g.translate((x + Math.cos(a) * d) * S, (r * 1.75 + (k ? -.2 + .5 * Math.sin(k * 3.3) : .5) * r) * S, (z + Math.sin(a) * d) * S); trees.push(g); } }
  // people: architectural scale figures (1.7 m), white, correctly proportioned
  const figs = [];
  function figure(x, z, rot, pose = 0) {
    const parts = [], cap = (r, l, px, py, pz, rx = 0, rz = 0) => { const g = new THREE.CapsuleGeometry(r, l, 3, 8); g.rotateX(rx); g.rotateZ(rz); g.translate(px, py, pz); parts.push(g); };
    cap(.075, .72, -.1, .45, 0); cap(.075, .72, .1, .45, 0);                 // legs
    cap(.17, .42, 0, 1.12, 0); const hd = new THREE.SphereGeometry(.115, 12, 10); hd.translate(0, 1.6, 0); parts.push(hd);
    cap(.055, .55, -.25, 1.12, 0, 0, .08); cap(.055, .55, .25, 1.12 + pose * .2, pose * -.18, -pose * .9, -.08);   // arms (pose: right forearm raised a little)
    const g = mergeGeometries(parts.map(p => p.toNonIndexed ? p.toNonIndexed() : p)); g.scale(S, S, S); g.rotateY(rot); g.translate(x * S, 0, z * S); return g;
  }
  for (const [x, z, rot, pose] of FIGS) figs.push(figure(x, z, rot, pose));

  const mesh = (gs, m, cast = true) => { const g = mergeGeometries(gs.map(x => x.index ? x.toNonIndexed() : x)); const o = new THREE.Mesh(g, m); o.castShadow = cast; o.receiveShadow = true; scene.add(o); return o; };
  mesh(white, mWhite); mesh(roads, mRoad, false); mesh(lanes, mLane, false); const winMesh = mesh(wins, mWin, false);
  mesh(pegs, mWhite); mesh(trees, mWhite); mesh(figs, mWhite);
  { const s = new THREE.Shape(); const [x0, z0, x1, z1] = POND, r = 6; s.moveTo(x0 + r, z0); s.lineTo(x1 - r, z0); s.quadraticCurveTo(x1, z0, x1, z0 + r); s.lineTo(x1, z1 - r); s.quadraticCurveTo(x1, z1, x1 - r, z1); s.lineTo(x0 + r, z1); s.quadraticCurveTo(x0, z1, x0, z1 - r); s.lineTo(x0, z0 + r); s.quadraticCurveTo(x0, z0, x0 + r, z0);
    const g = new THREE.ShapeGeometry(s, 12); g.rotateX(Math.PI / 2); g.scale(S, 1, S); g.translate(0, .0004, 0); const o = new THREE.Mesh(g, mPond); o.receiveShadow = true; scene.add(o); }

  // —— the gate: two pillars rise, two barred leaves swing shut across the lane ——
  const gate = new THREE.Group(); scene.add(gate);
  const [gx0, gx1, gz] = GATE, leafW = (gx1 - gx0) / 2 - .35;
  const pil = mergeGeometries([box(gx0 - .55, gz - .3, gx0 - .05, gz + .3, 0, 2.3), box(gx1 + .05, gz - .3, gx1 + .55, gz + .3, 0, 2.3), box(gx0 - .62, gz - .37, gx0 + .02, gz + .37, 2.3, 2.45), box(gx1 - .02, gz - .37, gx1 + .62, gz + .37, 2.3, 2.45)].map(g => g.toNonIndexed()));
  const pillars = new THREE.Mesh(pil, mGate); pillars.castShadow = true; gate.add(pillars);
  function leafGeo() { const p = [box(0, -.04, leafW, .04, .15, .25), box(0, -.04, leafW, .04, 1.75, 1.85), box(0, -.04, .08, .04, .15, 1.85), box(leafW - .08, -.04, leafW, .04, .15, 1.85)];
    for (let x = .35; x < leafW - .2; x += .3) p.push(box(x, -.025, x + .045, .025, .25, 1.75)); return mergeGeometries(p.map(g => g.toNonIndexed())); }
  const lg = leafGeo(), leafL = new THREE.Mesh(lg, mGate), leafR = new THREE.Mesh(lg.clone(), mGate);
  leafL.position.set((gx0 + .1) * S, 0, gz * S); leafR.position.set((gx1 - .1) * S, 0, gz * S); leafR.scale.x = -1; leafL.castShadow = leafR.castShadow = true; gate.add(leafL, leafR);
  function setGate(rise, shut) {   // rise 0..1 (pillars up), shut 0..1 (open = leaves swung back toward the plot, 1 = closed across the lane)
    gate.visible = rise > .001; pillars.scale.y = Math.max(.001, rise); const a = (1 - shut) * 1.45;
    leafL.rotation.y = a; leafR.rotation.y = -a; leafL.scale.y = leafR.scale.y = Math.max(.001, rise);
  }

  // —— plinth, floor and the light table ——
  { const m = new THREE.MeshStandardMaterial({ color: '#1e1813', roughness: .42, metalness: .05 });
    const g = new THREE.BoxGeometry(PW + .16, .86, PD + .16); g.translate(0, -.012 - .43, 0); const o = new THREE.Mesh(g, m); o.receiveShadow = true; scene.add(o);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(14, 14).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#0d0b09', roughness: .8 })); f.position.y = -.875; f.receiveShadow = true; scene.add(f); }
  const tableTex = new THREE.CanvasTexture(tableCanvas); tableTex.colorSpace = THREE.SRGBColorSpace; tableTex.anisotropy = 8;
  const tableMat = new THREE.MeshBasicMaterial({ map: tableTex, toneMapped: false });
  const table = new THREE.Mesh(new THREE.PlaneGeometry(TABLE.w, TABLE.d).rotateX(-Math.PI / 2), tableMat); table.position.set(TABLE.x, -.002, TABLE.z); scene.add(table);
  { const m = new THREE.MeshStandardMaterial({ color: '#8c877f', roughness: .35, metalness: .8 }), fr = [];
    const b = (x0, z0, x1, z1) => { const g = new THREE.BoxGeometry(x1 - x0, .03, z1 - z0); g.translate((x0 + x1) / 2, -.017, (z0 + z1) / 2); fr.push(g.toNonIndexed()); };
    const { x, z, w, d } = TABLE, e = .03; b(x - w / 2 - e, z - d / 2 - e, x + w / 2 + e, z - d / 2); b(x - w / 2 - e, z + d / 2, x + w / 2 + e, z + d / 2 + e); b(x - w / 2 - e, z - d / 2, x - w / 2, z + d / 2); b(x + w / 2, z - d / 2, x + w / 2 + e, z + d / 2);
    scene.add(new THREE.Mesh(mergeGeometries(fr), m));
    const body = new THREE.Mesh(new THREE.BoxGeometry(w + .06, .84, d + .06), new THREE.MeshStandardMaterial({ color: '#1a1612', roughness: .5 })); body.position.set(x, -.032 - .42, z); scene.add(body); }
  const tableGlow = new THREE.PointLight('#fff1dc', 0, 2.2, 1.6); tableGlow.position.set(TABLE.x, .25, TABLE.z); scene.add(tableGlow);

  // —— lights: the key (it can run like the sun), a warm fill from the room ——
  const key = new THREE.DirectionalLight('#ffe8cf', 2.4); key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -1.05, right: 1.05, top: 1.05, bottom: -1.05, near: 2, far: 6.5 });
  key.shadow.mapSize.set(4096, 4096); key.shadow.radius = 3; key.shadow.bias = -.0006; key.shadow.normalBias = .0025; scene.add(key, key.target);
  const hemi = new THREE.HemisphereLight('#fff3e2', '#2a2016', .28); scene.add(hemi);
  function setKey(az, el, I) { const r = 4; key.position.set(r * Math.cos(el) * Math.sin(az), r * Math.sin(el), r * Math.cos(el) * Math.cos(az)); key.target.position.set(0, 0, 0); key.intensity = I; }

  return { renderer, scene, camera, post, U, projTex, tableTex, tableMat, tableGlow, setGate, setKey, hemi, key, winMesh };
}
