import * as THREE from 'three';
import { clamp, seg, ss, lerp } from '/core/lib.js';
import { makePost } from './lp_post.js';
import { makeSea } from './lp_sea.js';
import { buildFair } from './fair.js';
const W = 1080, H = 1920, QS = new URLSearchParams(location.search), SSAA = +(QS.get('ssaa') ?? 1);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.toneMapping = THREE.NeutralToneMapping; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-5, 5, 9, -9, 1, 1600);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SSAA, aoRadius: .35, aoScale: 1.2, aoThickness: .6 });
const sea = makeSea(scene); const F = buildFair(scene); sea.drawShallow(F.blobs.map(b => [b[0], b[1], 1.0, .9]));
const hemi = new THREE.HemisphereLight('#5c5ea8', '#2a2640', .55); scene.add(hemi);
const moon = new THREE.DirectionalLight('#a9b0e8', .9); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 80 }); moon.shadow.bias = -.0006;
moon.position.set(-20, 30, 14); scene.add(moon, moon.target);
const DEG = Math.PI / 180;
function cam(tg, az, el, fh) {
  const D = 300, ce = Math.cos(el * DEG); camera.position.set(tg[0] + D * ce * Math.sin(az * DEG), tg[1] + D * Math.sin(el * DEG), tg[2] + D * ce * Math.cos(az * DEG));
  camera.up.set(0, 1, 0); camera.lookAt(...tg); const fw = fh * W / H; Object.assign(camera, { left: -fw / 2, right: fw / 2, top: fh / 2, bottom: -fh / 2, near: 1, far: D + 900 }); camera.updateProjectionMatrix();
  const cot = 1 / Math.tan(el * DEG); post.comp.camDist.value = D; post.comp.hz0.value = .05 * fh * cot; post.comp.hz1.value = .45 * fh * cot;
  const f = new THREE.Vector3(); camera.getWorldDirection(f); const fl = Math.hypot(f.x, f.z) || 1; sea.U.uFwd.value.set(f.x / fl, f.z / fl); sea.U.uTgt.value.set(tg[0], tg[2]); sea.U.uSpanF.value = fh / Math.tan(el * DEG) * .5;
}
const SHOTS = {
  wide: { tg: [0, .3, 3.4], az: 32, el: 30, fh: 13.5, popT0: 0 },
  maidan: { tg: [.2, 2.6, -3.0], az: 18, el: 16, fh: 7.0 },
  river: { tg: [0, .2, 4.3], az: 10, el: 62, fh: 12 },
};
window.render = (t) => {
  const s = SHOTS[QS.get('shot') || 'wide'];
  cam(s.tg, s.az, s.el, s.fh);
  sea.U.uTime.value = t; sea.U.uDeep.value.set('#1d2148'); sea.U.uShal.value.set('#33376a'); sea.U.uNight.value = 1; sea.U.uFoam.value.set('#9fb0e0');
  post.comp.zen.value.set('#0e1233'); post.comp.hor.value.set('#3c3870'); post.comp.stars.value = 1; post.comp.time.value = t;
  const gd = post.grade; gd.sat.value = 1.12; gd.contrast.value = .12; gd.lift.value.setRGB(.012, .016, .045); gd.vig.value = .32;
  post.bloom.strength = .7; post.bloom.threshold = .82; post.bloom.radius = .5;
  post.tilt.fy.value = .5; post.tilt.band.value = .2;
  F.update(t, s.popT0 !== undefined && QS.get('pop') ? { popT0: +QS.get('pop') } : {});
  post.composer.render();
};
window.DUR = 1; await document.fonts.ready; window.render(+(QS.get('t') ?? 1)); window.READY = true;
