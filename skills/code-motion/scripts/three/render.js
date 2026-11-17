#!/usr/bin/env node
/**
 * Headless Three.js renderer - stills or frame sequences, no GPU required.
 *
 * WebGL2 works in headless Chromium through ANGLE/SwiftShader (software
 * Vulkan). Launch flags matter: without them getContext('webgl2') returns null.
 *
 *   node render.js --scene ./scene.js --out out.png --w 1080 --h 1920
 *   node render.js --scene ./scene.js --out frames/f%05d.png --frames 150 --fps 30
 *
 * The scene module must export:
 *   setup({THREE, scene, camera, renderer, width, height}) -> void
 *   update(t, frame)  (optional) -> advance animation to time t seconds
 */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');

function arg(k, d) {
  const i = process.argv.indexOf('--' + k);
  return i > -1 ? process.argv[i + 1] : d;
}
const SCENE  = path.resolve(arg('scene', './scene.js'));
const OUT    = arg('out', 'out.png');
const W      = parseInt(arg('w', 1080)), H = parseInt(arg('h', 1920));
const FRAMES = parseInt(arg('frames', 1)), FPS = parseFloat(arg('fps', 30));
const SS     = parseFloat(arg('ss', 1));       // supersample factor
const THREE_DIR = arg('three', path.resolve(__dirname, '../../node_modules/three'));

const ROOT = path.dirname(SCENE);
const PORT = 8731 + (process.pid % 500);

// static server: scene dir at /, three at /vendor
const types = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  let u = decodeURI(req.url.split('?')[0]);
  let p = u.startsWith('/vendor/')
    ? path.join(THREE_DIR, u.replace('/vendor/', ''))
    : path.join(ROOT, u);
  if (u === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(`<!doctype html><html><head><meta charset=utf8>
<style>html,body{margin:0;overflow:hidden;background:#000}canvas{display:block}</style>
<script type="importmap">{"imports":{
 "three":"/vendor/build/three.module.js",
 "three/addons/":"/vendor/examples/jsm/"}}</script></head>
<body><script type="module">
import * as THREE from 'three';
const mod = await import('/${path.basename(SCENE)}');
const W=${Math.round(W*SS)}, H=${Math.round(H*SS)};
const renderer = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer:true});
renderer.setSize(W,H,false);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W/H, 0.1, 5000);
await mod.setup({THREE, scene, camera, renderer, width:W, height:H});
window.__step = (t, f) => { if (mod.update) mod.update(t, f); renderer.render(scene, camera); };
window.__step(0,0);
window.__ready = true;
</script></body></html>`);
  }
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); return res.end('nf'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
    res.end(d);
  });
});

(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--enable-unsafe-swiftshader',
           '--use-gl=angle', '--use-angle=swiftshader',
           '--disable-dev-shm-usage']
  });
  const page = await browser.newPage({
    viewport: { width: Math.round(W*SS), height: Math.round(H*SS) }
  });
  page.on('pageerror', e => console.error('PAGE ERROR:', e.message));
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', { timeout: 180000 });

  const canvas = await page.$('canvas');
  const multi = OUT.includes('%');
  if (multi) fs.mkdirSync(path.dirname(OUT), { recursive: true });

  for (let f = 0; f < FRAMES; f++) {
    const t = f / FPS;
    await page.evaluate(([t, f]) => window.__step(t, f), [t, f]);
    const file = multi
      ? OUT.replace(/%0(\d+)d/, (_, n) => String(f).padStart(+n, '0'))
      : OUT;
    await canvas.screenshot({ path: file });
    if (f % 10 === 0 || f === FRAMES - 1) console.log(`frame ${f + 1}/${FRAMES} -> ${file}`);
  }
  await browser.close(); srv.close();
  console.log('done. If --ss > 1, downsample with:  convert in.png -resize ' + W + 'x out.png');
})();
