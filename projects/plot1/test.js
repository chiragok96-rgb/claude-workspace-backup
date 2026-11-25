import * as THREE from 'three';
import { makeWorld, S, PW, PD, TABLE } from './world.js';
const W = 1080, H = 1920, Q = new URLSearchParams(location.search), cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const P = document.createElement('canvas'); P.width = 1536; P.height = 2048; const T = document.createElement('canvas'); T.width = 2048; T.height = 2890;
const pg = P.getContext('2d'); pg.fillStyle = '#000'; pg.fillRect(0, 0, 1536, 2048);
const px = (x, z) => [(x * S / PW + .5) * 1536, (z * S / PD + .5) * 2048];
pg.fillStyle = 'rgba(240,190,90,.9)'; { const [a, b] = px(-4, -34), [c, d] = px(14, -10); pg.fillRect(a, b, c - a, d - b); }
const tg = T.getContext('2d'); tg.fillStyle = '#f6f1e8'; tg.fillRect(0, 0, 2048, 2890);
const Wd = makeWorld(W, H, P, T); Wd.projTex.needsUpdate = true; Wd.tableTex.needsUpdate = true;
const cam = Wd.camera;
function look(tg, az, el, D) { const r = Math.PI / 180; az *= r; el *= r; const p = new THREE.Vector3(tg[0] + D * Math.cos(el) * Math.sin(az), tg[1] + D * Math.sin(el), tg[2] + D * Math.cos(el) * Math.cos(az));
  cam.position.copy(p); const fh = new THREE.Vector3(-Math.sin(az), 0, -Math.cos(az)); cam.up.set(0, 1, 0).multiplyScalar(Math.cos(el)).addScaledVector(fh, Math.sin(el)).normalize(); cam.lookAt(...tg); cam.updateProjectionMatrix(); Wd.post.dof.focus = D; }
const SH = [[[0.03, 0, -0.12], 8, 9, .5], [[0.02, 0, 0.3], -20, 22, .35], [[0, 0, 0], 20, 42, 3.6], [[0.6, 0, 0], 0, 90, 4.2]];
window.render = t => { const s = SH[Math.round(t) % SH.length]; look(...s); Wd.setKey(-.9, .55, 2.4); Wd.setGate(1, t >= 1 ? 1 : 0); Wd.post.dof.aper = 6; Wd.post.composer.render(); ctx.drawImage(Wd.renderer.domElement, 0, 0); };
window.DUR = 4; window.READY = true;
