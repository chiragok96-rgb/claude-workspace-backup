import * as THREE from 'three';
import { initSand, sandMesh, WIN } from './sand.js';
import * as N from './night.js';
import { makeFoodRow } from './food.js';
import { initPost, renderPost, renderBlend } from './post.js';
import { initFilm, frame, DUR } from './film.js';
const W = 1080, H = 1920;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.outputColorSpace = THREE.SRGBColorSpace; document.body.appendChild(renderer.domElement);
const cap = document.createElement('canvas'); cap.width = W; cap.height = H; document.body.appendChild(cap);
const coast = await (await fetch('data/coast.json')).json();
for (const f of ['60px "CormorantG"', 'italic 60px "CormorantG"', '60px "Cinzel"', '60px "OdiaSerif"']) await document.fonts.load(f, 'Aaଵ');
initSand(coast); initFilm(coast); initPost(renderer, W, H);
const hh = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };

// ---- the sand table and the fair's bokeh behind it ----
const sandScene = new THREE.Scene(); sandScene.background = new THREE.Color(0);
const { mesh, mat } = sandMesh(); sandScene.add(mesh); const U = mat.uniforms;
const cam = new THREE.PerspectiveCamera(40, W / H, .005, 3000);
function disc() { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.7, 'rgba(255,255,255,.8)'); gr.addColorStop(.86, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const DT = disc(), BK = [];
for (let i = 0; i < 110; i++) { const a = -2.75 + hh(i) * 2.2, r = 7 + hh(i + 5) * 10; BK.push({ o: [Math.cos(a) * r, .3 + hh(i + 9) * 2.4, Math.sin(a) * r], c: [[1, .62, .25], [1, .78, .45], [1, .45, .2], [.95, .85, .7], [1, .35, .5]][i % 5], s: .5 + hh(i + 2) * .6 }); }
for (let i = 0; i < 32; i++) BK.push({ wheel: i / 32 * Math.PI * 2, o: [-6.5, 4.6, -11], R: 3.6, c: [[1, .3, .35], [.35, .8, 1], [1, .85, .3], [.5, 1, .55]][i % 4], s: .55 });
for (const b of BK) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: DT, color: new THREE.Color(...b.c), transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false })); m.scale.set(b.s, b.s, 1); b.m = m; sandScene.add(m); }
function placeBokeh(t, a) { for (const b of BK) { b.m.visible = a > .01; if (!b.m.visible) continue; const o = b.o; if (b.wheel !== undefined) { const an = b.wheel + t * .16; b.m.position.set(WIN.x + o[0] + Math.cos(an) * b.R * .6, o[1] + Math.sin(an) * b.R, WIN.z + o[2] + Math.cos(an) * b.R * .5); } else b.m.position.set(WIN.x + o[0], o[1], WIN.z + o[2]); b.m.material.opacity = .5 * a * (.85 + .15 * Math.sin(t * 3 + b.s * 40)); } }
function fairLights(a) {
  const L = [[-2.2, .9, -3.2, 1.0, .58, .28, 1.1], [2.6, .7, -2.2, 1.0, .42, .2, .45], [-3.5, 1.4, 1.2, .9, .62, .4, .2], [.4, 3, 4, .45, .55, .85, .08], [-.9, .25, -1.4, 1, .55, .3, .18]];
  L.forEach((l, i) => { U.lp.value[i].set(WIN.x + l[0], l[1], WIN.z + l[2]); U.lc.value[i].setRGB(l[3] * l[6] * a, l[4] * l[6] * a, l[5] * l[6] * a); });
}

// ---- the Kartika night ----
const NS = N.NS; NS.environment = N.fairEnv(renderer); NS.environmentIntensity = .35;
NS.add(new THREE.HemisphereLight(0x22304a, 0x05070c, .4)); const moonL = new THREE.DirectionalLight(0xc8d0e8, .5); moonL.position.copy(N.MOON_DIR).multiplyScalar(100); NS.add(moonL);
const boita = N.makeBoita(); NS.add(boita); boita.traverse(o => { if (o.material) o.userData.op = o.material.opacity ?? 1; });
const dboats = Array.from({ length: 220 }, (_, i) => { const b = N.makeDiyaBoat(i); const z0 = i === 0 ? 5 : 2 - Math.pow(hh(i + 7), .8) * 150, sp = 6 + (2 - z0) * .35; b.position.set((hh(i) - .5) * 2 * sp, 0, z0); b.rotation.y = hh(i + 3) * 6; b.userData.z0 = z0; b.userData.r = clamp01((2 - z0) / 150); NS.add(b); return b; });
function clamp01(x) { return Math.max(0, Math.min(1, x)); }
const fair = new THREE.Group(); NS.add(fair);
const FX = 170, FZ = -40;
const bank = new THREE.Mesh(new THREE.BoxGeometry(260, 2, 320), new THREE.MeshStandardMaterial({ color: 0x1a140e, roughness: 1 })); bank.position.set(FX + 10, -1, FZ); NS.add(bank);
bank.add(fair); fair.position.set(-FX - 10, 1, -FZ);
const ramdoli = N.makeRamdoli(14); ramdoli.position.set(FX + 18, 18.5, FZ - 30); fair.add(ramdoli);
for (let r = 0; r < 4; r++) { const s = N.makeStalls(22, r * 5); s.position.set(FX - 60, 0, FZ + 20 - r * 12); fair.add(s); fair.add(N.festoons(FX - 62, FX + 42, FZ + 26 - r * 12, 9, r)); }
const lanes = [0, 1, 2, 3].map(r => ({ a: [FX - 62, FZ + 26 - r * 12], b: [FX + 42, FZ + 26 - r * 12], w: 4.5 }));
const crowd = N.makeCrowd(9000, lanes); fair.add(crowd);
const food = makeFoodRow(); food.position.set(FX - 26, 0, FZ + 34); fair.add(food);
// the ghat: a line of diyas along the bank's edge
{ const pts = [], cols = []; for (let i = 0; i < 400; i++) { pts.push([62 - FX - 10 + FX + 10 - 2 + hh(i) * .6, .15, -150 + i * .75]); cols.push([3, 1.8, .7]); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(cols.flat(), 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ size: .35, map: N.DOT, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); p.position.set(-FX - 10, 1, -FZ); bank.add(p); }

const G = { renderer, sandScene, nightScene: NS, cam, U, cap, post: renderPost, blend: renderBlend, fairLights, placeBokeh, W_: { boita, dboats, ramdoli, crowd, food, fair, bank } };
const QS = new URLSearchParams(location.search), FROM = +(QS.get('from') || 0), TO = +(QS.get('to') || DUR);
window.DUR = TO - FROM;
window.render = (t = 0) => frame(t + FROM, G);
window.render(0); window.READY = true;
