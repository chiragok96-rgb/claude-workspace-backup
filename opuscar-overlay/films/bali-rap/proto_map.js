import * as THREE from 'three';
import { makePost } from '/core/three/post.js';
import { buildMap } from './map.js';
const W = 1080, H = 1920, QS = new URLSearchParams(location.search);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#03040a'); scene.fog = new THREE.FogExp2('#05070f', .011);
const camera = new THREE.PerspectiveCamera(36, W / H, .1, 2000);
const post = makePost(renderer, scene, camera, W, H, { ssaa: 1, ao: false }); post.bloom.strength = .55; post.bloom.threshold = .7; post.bloom.radius = .5;
scene.add(new THREE.HemisphereLight('#4a5a8a', '#1a1410', .6)); const moon = new THREE.DirectionalLight('#c8d0f0', 1.2); moon.position.set(-30, 40, -20); scene.add(moon);
const M = await buildMap(scene);
const shot = QS.get('shot') || 'voyage';
window.render = (t) => {
  if (shot === 'voyage') { const u = .42; M.update(t, { prog: u + .22, boat: u, boatS: 1.1 }); const p = M.curve.getPointAt(u), tg = M.curve.getTangentAt(u);
    camera.position.set(p.x - tg.x * 7 - tg.z * 4, 10, p.z - tg.z * 7 + tg.x * 4); camera.lookAt(p.x + tg.x * 1.5, -5.2, p.z + tg.z * 1.5); post.dof.focus = camera.position.distanceTo(p); post.dof.aper = 22; }
  if (shot === 'asia') { M.update(t, { prog: 1, boat: 1, boatS: 1, pillar: 1 }); const c = M.cities.cuttack.position; camera.position.set(c.x + 10, 26, c.z + 62); camera.lookAt(c.x + 4, -4, c.z + 20); post.dof.focus = 60; post.dof.aper = 0; }
  post.dof.maxCoc = 10; camera.updateProjectionMatrix(); post.composer.render();
};
window.DUR = 1; window.render(+(QS.get('t') ?? 1)); window.READY = true;
