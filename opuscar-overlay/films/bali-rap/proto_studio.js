import * as THREE from 'three';
import { makePost } from '/core/three/post.js';
import { makeStudio } from './studio.js';
import { dahibara, thali, phone } from './food.js';
const W = 1080, H = 1920, QS = new URLSearchParams(location.search);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.1;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, W / H, 1, 3000);
const post = makePost(renderer, scene, camera, W, H, { ssaa: +(QS.get('ssaa') ?? 1), ao: false });
post.bloom.strength = .18; post.bloom.threshold = 1.1; post.bloom.radius = .4;
const studio = makeStudio(renderer, scene);
// warm practical: the stall's bulb above the food (so food reads as food, not as glass)
const key = new THREE.SpotLight('#ffd6a0', 9000, 0, .5, .8, 2); key.position.set(30, 90, 40); scene.add(key, key.target);
const rim = new THREE.PointLight('#ffb070', 1800, 0, 2); rim.position.set(-40, 25, -50); scene.add(rim);
const D = dahibara(), TH = thali(), PH = phone(); [D, TH, PH].forEach(o => scene.add(o));
const shot = QS.get('shot') || 'dahibara';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
window.render = (t) => {
  D.visible = shot === 'dahibara'; TH.visible = shot === 'thali'; PH.visible = shot === 'phone';
  let pos, look, focus, aper = 260;
  const fy = studio.FLOOR.y; [D, TH].forEach(o => o.position.y = fy + 2.6);
  if (shot === 'dahibara') { D.rotation.y = t * .35; pos = V(0, 24, 40); look = V(0, fy - 1.2, 4); focus = V(0, fy + 4, 2); aper = 220; }
  if (shot === 'thali') { TH.position.y = fy; TH.rotation.y = t * .3; pos = V(0, 32, 50); look = V(0, fy - 6, 8); focus = V(0, fy + 4, 0); aper = 200; }
  if (shot === 'phone') { PH.position.set(0, 2, 0); PH.rotation.set(-.15, .35 + Math.sin(t * 40) * .02 * (QS.get('buzz') ? 1 : 0), .08); PH.userData.draw(t, { call: true }); PH.position.set(0, 5, 0); pos = V(0, 4, 54); look = V(0, -1.5, 0); focus = V(0, 2, 0); aper = 160; }
  camera.position.copy(pos); camera.lookAt(look); camera.updateProjectionMatrix();
  scene.backgroundIntensity = .55; studio.U.uBgI.value = .55;
  studio.updateEnv({ left: 1.1, right: 1.1, top: 1.2, front: .5, back: 1.2, key: shot === 'phone' ? .2 : .8, sweep: { I: 2.2, x: Math.sin(t * .8) * .8, az: 0 } });
  studio.reflect(camera);
  post.dof.focus = camera.position.distanceTo(focus); post.dof.aper = aper; post.dof.maxCoc = 14;
  post.composer.render();
};
window.DUR = 1; await document.fonts.load('700 40px "Anek Odia"'); await document.fonts.load('400 30px "Inter Tight"'); window.render(+(QS.get('t') ?? 1)); window.READY = true;
