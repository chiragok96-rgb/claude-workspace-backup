// The sand: one table of sand, two lightings. Thickness lives in two canvases (a fine window under the footprint / Bali, and the
// whole voyage map); the same thickness is the relief when lit from above (the fair at night) and the transmission when lit from
// below (the lightbox). Changing the light, not the picture, is how the film changes worlds.
import * as THREE from 'three';
export const SEA = .62, LAND = .2;
let C, D1, D1c, D2, D2c, T1, T2, MAT, MESH, FINE;
export const WIN = { x: 3.085, z: 3.16, s: .9 }; const WIN0 = { x: 3.085, z: 3.16 };        // the fine window, in table metres
const D2X = 7, N1 = 1536, N2 = 2560;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;
export const P = (lon, lat) => [(lon - 100) * 111.32 * Math.cos(7 * Math.PI / 180) / 540, -(lat - 7) * 110.57 / 540];

function resample(pts, n) {   // closed ring -> n points evenly spaced by arclength
  const L = [0]; for (let i = 1; i <= pts.length; i++) { const a = pts[i - 1], b = pts[i % pts.length]; L.push(L[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const tot = L[L.length - 1], out = []; let j = 0;
  for (let k = 0; k < n; k++) { const d = tot * k / n; while (L[j + 1] < d) j++; const f = (d - L[j]) / (L[j + 1] - L[j] || 1), a = pts[j], b = pts[(j + 1) % pts.length]; out.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]); }
  return out;
}
const area = p => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
function startAt(p, ang) {   // rotate the ring to start at the vertex nearest direction `ang` from its centroid
  const cx = p.reduce((s, q) => s + q[0], 0) / p.length, cz = p.reduce((s, q) => s + q[1], 0) / p.length;
  let k = 0, best = -1e9; p.forEach((q, i) => { const d = (q[0] - cx) * Math.cos(ang) + (q[1] - cz) * Math.sin(ang); if (d > best) { best = d; k = i; } });
  return p.slice(k).concat(p.slice(0, k));
}
// a right footprint, in metres: u along the foot (heel -> toes), v across (outer edge +)
const SOLE = [[-.128, 0], [-.122, .024], [-.1, .036], [-.06, .037], [-.02, .039], [.02, .043], [.055, .047], [.078, .045], [.09, .034], [.094, .015], [.096, -.01], [.092, -.032], [.08, -.046], [.058, -.05], [.03, -.044], [0, -.03], [-.025, -.02], [-.05, -.024], [-.085, -.031], [-.112, -.027], [-.126, -.014]];
const TOES = [[.122, -.031, .019, .015], [.117, -.004, .012, .0105], [.111, .014, .0105, .0095], [.103, .029, .0095, .0085], [.092, .041, .0085, .0075]];
function smoothRing(p, n = 6) { const o = []; for (let i = 0; i < p.length; i++) { const a = p[(i - 1 + p.length) % p.length], b = p[i], c = p[(i + 1) % p.length], d = p[(i + 2) % p.length]; for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; o.push([0, 1].map(j => .5 * (2 * b[j] + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t3))); } } return o; }

export const FOOT = { ang: -.42, s: 1.0 };   // the hero footprint's pose over Bali (set so its long axis lies along the island)
let BALI, PENIDA, SOLE_W, BIGTOE_W;
export function initSand(coast) {
  C = coast;
  D1 = document.createElement('canvas'); D1.width = D1.height = N1; D1c = D1.getContext('2d', { willReadFrequently: false });
  D2 = document.createElement('canvas'); D2.width = D2.height = N2; D2c = D2.getContext('2d');
  T1 = new THREE.CanvasTexture(D1); T2 = new THREE.CanvasTexture(D2);
  for (const T of [T1, T2]) { T.colorSpace = THREE.NoColorSpace; T.minFilter = THREE.LinearMipmapLinearFilter; T.magFilter = THREE.LinearFilter; T.anisotropy = 8; T.wrapS = T.wrapT = THREE.ClampToEdgeWrapping; T.flipY = false; }
  // the island rings, largest = Bali, the one south-east of it = Nusa Penida
  const hi = coast.hi.slice().sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));
  BALI = hi[0]; PENIDA = hi.find(r => { const cx = r.reduce((s, q) => s + q[0], 0) / r.length; return cx > 3.15 && cx < 3.3; }) || hi[2];
  const ccw = r => area(r) < 0 ? r.slice().reverse() : r;
  BALI = ccw(BALI); PENIDA = ccw(PENIDA);
  // the footprint in table metres, laid over Bali
  const ca = Math.cos(FOOT.ang), sa = Math.sin(FOOT.ang), fx = WIN.x + .005, fz = WIN.z + .004, sc = 1.02;
  const W = ([u, v]) => [fx + (u * ca - v * sa) * sc, fz + (u * sa + v * ca) * sc];
  SOLE_W = ccw(smoothRing(SOLE).map(W));
  BIGTOE_W = TOES.map(([u, v, a, b]) => ({ c: W([u, v]), a: a * sc, b: b * sc }));
  const N = 240;
  FOOT.sole = startAt(resample(SOLE_W, N), 0); FOOT.bali = startAt(resample(BALI, N), 0);
  FOOT.toes = BIGTOE_W; FOOT.penida = PENIDA;
  return { T1, T2 };
}

// ---- drawing thickness ----
const g = v => { const k = Math.round(clamp(v) * 255); return `rgb(${k},${k},${k})`; };
const toPx1 = ([x, z]) => [(x - WIN.x + WIN.s / 2) / WIN.s * N1, (z - WIN.z + WIN.s / 2) / WIN.s * N1];
const toPx2 = ([x, z]) => [(x + D2X) / (2 * D2X) * N2, (z + D2X) / (2 * D2X) * N2];
const k1 = N1 / WIN.s, k2 = N2 / (2 * D2X);
function poly(c, pts, map) { c.beginPath(); pts.forEach((p, i) => { const [x, y] = map(p); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); }
function line(c, pts, map) { c.beginPath(); pts.forEach((p, i) => { const [x, y] = map(p); i ? c.lineTo(x, y) : c.moveTo(x, y); }); }

// The footprint (pressed, with its rim of pushed sand), morphing into Bali by m (0..1); a = how much of it is there (pressing / settling)
function footprint(c, m, a, extra) {
  const N = FOOT.sole.length, ring = FOOT.sole.map((p, i) => [lerp(p[0], FOOT.bali[i][0], m), lerp(p[1], FOOT.bali[i][1], m)]);
  const floor = lerp(.3, LAND, m), rim = lerp(.78, SEA, m);
  c.save();
  // rim: sand pushed up round the print
  c.filter = `blur(${lerp(11, 2, m)}px)`; c.globalAlpha = a; c.strokeStyle = g(rim); c.lineWidth = lerp(.014, .002, m) * k1; poly(c, ring, toPx1); c.stroke();
  for (const [i, t] of FOOT.toes.entries()) { const s = i === 0 ? 1 : 1 - m; if (s <= 0) continue; const [x, y] = toPx1(t.c); c.beginPath(); c.ellipse(x, y, (t.a + .006) * k1 * s, (t.b + .006) * k1 * s, FOOT.ang, 0, 7); c.stroke(); }
  // the floor of the print
  c.filter = `blur(${lerp(5, 1.2, m)}px)`; c.fillStyle = g(floor); poly(c, ring, toPx1); c.fill();
  // heel and ball pressed deeper (only while it is a foot)
  if (m < 1) { c.globalAlpha = a * (1 - m);
    for (const [u, v, r] of [[-.095, .006, .03], [.055, -.012, .034]]) { const ca = Math.cos(FOOT.ang), sa = Math.sin(FOOT.ang), p = [WIN.x + .005 + (u * ca - v * sa) * 1.02, WIN.z + .004 + (u * sa + v * ca) * 1.02], [x, y] = toPx1(p);
      const gr = c.createRadialGradient(x, y, 0, x, y, r * k1); gr.addColorStop(0, g(.2)); gr.addColorStop(1, g(.2) .replace('rgb', 'rgba').replace(')', ',0)')); c.fillStyle = gr; c.fillRect(x - r * k1, y - r * k1, 2 * r * k1, 2 * r * k1); } }
  c.globalAlpha = a;
  // toes: little toes fold into the coast; the big toe drifts out to sea and becomes Nusa Penida
  FOOT.toes.forEach((t, i) => {
    if (i === 0) { const pen = FOOT.penida, pc = [pen.reduce((s, q) => s + q[0], 0) / pen.length, pen.reduce((s, q) => s + q[1], 0) / pen.length];
      if (m > 0) { const pr = resample(pen, 60), tr = Array.from({ length: 60 }, (_, k) => { const an = k / 60 * Math.PI * 2; return [t.c[0] + Math.cos(an) * t.a * Math.cos(FOOT.ang) - Math.sin(an) * t.b * Math.sin(FOOT.ang), t.c[1] + Math.cos(an) * t.a * Math.sin(FOOT.ang) + Math.sin(an) * t.b * Math.cos(FOOT.ang)]; });
        const st = startAt(pr, 0), tt = startAt(tr, 0); c.fillStyle = g(floor); poly(c, tt.map((p, k) => [lerp(p[0], st[k][0], m), lerp(p[1], st[k][1], m)]), toPx1); c.fill(); return; } }
    const s = i === 0 ? 1 : 1 - m; if (s <= 0) return; const [x, y] = toPx1(t.c);
    c.fillStyle = g(lerp(.26, floor, m)); c.beginPath(); c.ellipse(x, y, t.a * k1 * s, t.b * k1 * s, FOOT.ang, 0, 7); c.fill();
  });
  c.restore();
  if (extra) extra(c);
}
// other people's footprints on the fair ground (window 1 only), all fading together as the wind smooths the sand
const OTHERS = [[-.21, -.26, .6, 1], [-.09, -.33, .55, 0], [.24, .2, 2.2, 1], [.3, .05, 2.3, 0], [-.28, .22, -1.2, 1], [.05, .36, 1.4, 0], [-.33, -.05, -.9, 0]];
let OL, ML, HL;
const layer = n => { const v = document.createElement('canvas'); v.width = v.height = n; return v; };
function othersLayer() { if (!OL) { OL = layer(N1); const c = OL.getContext('2d'); otherPrints(c, 1, true); } return OL; }
function hiLayer() { if (!HL) { HL = layer(N1); const c = HL.getContext('2d'); c.filter = 'blur(1.4px)'; c.fillStyle = g(LAND); c.beginPath(); for (const r of C.hi) { if (r === BALI || r === FOOT.penida) continue; r.forEach((p, i) => { const [x, y] = toPx1(p); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); } c.fill(); } return HL; }
function mapLayer() { if (!ML) { ML = layer(N2); const d = ML.getContext('2d'); const path = () => { d.beginPath(); for (const r of C.polys) { r.forEach((p, i) => { const [x, y] = toPx2(p); i ? d.lineTo(x, y) : d.moveTo(x, y); }); d.closePath(); } };
  d.filter = 'blur(3px)'; d.strokeStyle = g(.8); d.lineWidth = 7; path(); d.stroke(); d.filter = 'blur(1px)'; d.fillStyle = g(LAND); path(); d.fill(); } return ML; }
// the other prints are drawn as departures from the sea level: a layer with alpha, painted over the base
function otherPrints(c, a) {
  if (a <= 0) return;
  for (const [dx, dz, ang, left] of OTHERS) {
    const ca = Math.cos(ang), sa = Math.sin(ang), fl = left ? -1 : 1, W = ([u, v]) => [WIN.x + dx + (u * ca - v * fl * sa) * .97, WIN.z + dz + (u * sa + v * fl * ca) * .97];
    c.save(); c.globalAlpha = a; c.filter = 'blur(16px)'; c.strokeStyle = g(.74); c.lineWidth = .014 * k1; poly(c, smoothRing(SOLE).map(W), toPx1); c.stroke();
    c.filter = 'blur(9px)'; c.fillStyle = g(.38); poly(c, smoothRing(SOLE).map(W), toPx1); c.fill();
    for (const [u, v, ra, rb] of TOES) { const [x, y] = toPx1(W([u, v])); c.beginPath(); c.ellipse(x, y, ra * k1, rb * k1, ang, 0, 7); c.fill(); }
    c.restore();
  }
}

// S: the state of the sand at time t (from the film)
//  hero: footprint presence; morph: foot->Bali; others: other prints; map: 0..1 the coastlines in window 2; route: [pts, progress];
//  marks: extra drawings in window 2 (cb); w1: extra drawings in window 1 (cb)
export function paintSand(S) {
  // window 1
  const c = D1c; c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; c.globalAlpha = 1; c.fillStyle = g(SEA); c.fillRect(0, 0, N1, N1);
  const ox = (WIN.x - WIN0.x) * k1, oz = (WIN.z - WIN0.z) * k1, moved = Math.abs(ox) + Math.abs(oz) > .5;
  if (S.map > 0 && !moved) { c.save(); c.globalAlpha = S.map; c.drawImage(hiLayer(), 0, 0); c.restore(); }
  c.save(); c.translate(ox, oz);
  if (S.others > 0) { c.save(); c.globalAlpha = S.others; c.drawImage(othersLayer(), 0, 0); c.restore(); }
  if (S.hero > 0) footprint(c, S.morph || 0, S.hero);
  c.restore();
  if (S.w1) S.w1(c, toPx1, k1, g);
  T1.needsUpdate = true;
  // window 2: the voyage map
  const d = D2c; d.setTransform(1, 0, 0, 1, 0, 0); d.filter = 'none'; d.globalAlpha = 1; d.fillStyle = g(SEA); d.fillRect(0, 0, N2, N2);
  if (S.map > 0) { d.save(); d.globalAlpha = S.map; d.drawImage(mapLayer(), 0, 0); d.restore(); }
  if (S.marks) S.marks(d, toPx2, k2, g);
  T2.needsUpdate = true;
}
export function syncWin() { FINE.position.set(WIN.x, 0, WIN.z); FINE.updateMatrixWorld(); MAT.uniforms.W1.value.set(WIN.x, WIN.z, WIN.s, 0); }
export const drawHelpers = { poly, line, g, resample };

// ---- the material ----
const VS = `
uniform sampler2D D1; uniform vec4 W1; uniform float relief;
varying vec3 vW; varying vec2 vUV1;
void main(){ vec4 w = modelMatrix * vec4(position,1.); vec2 uv1 = (w.xz - W1.xy + W1.zz*.5)/W1.zz; vUV1 = uv1;
  float inW = step(0.,uv1.x)*step(uv1.x,1.)*step(0.,uv1.y)*step(uv1.y,1.);
  float h = inW>0. ? texture2D(D1, uv1).r : ${SEA.toFixed(3)};
  w.y += (h - ${SEA.toFixed(3)}) * relief; vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const FS = `
precision highp float;
uniform sampler2D D1, D2; uniform vec4 W1; uniform float D2X, relief, topW, backW, backR, backF, time, grainK, ripple, exposure;
uniform vec3 backC, lp[5], lc[5], camP; uniform vec2 backO;
varying vec3 vW; varying vec2 vUV1;
float h21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float thick(vec2 xz){
  vec2 uv1 = (xz - W1.xy + W1.zz*.5)/W1.zz; vec2 uv2 = (xz + D2X)/(2.*D2X);
  float h2 = texture2D(D2, uv2).r;
  vec2 e = min(uv1, 1.-uv1); float f = smoothstep(0., .04, min(e.x, e.y));
  float h1 = texture2D(D1, clamp(uv1, 0., 1.)).r;
  return mix(h2, h1, f);
}
void main(){
  vec2 xz = vW.xz; vec2 lq = xz - W1.xy;
#ifdef HOLE
  if (all(greaterThan(vUV1, vec2(.0005))) && all(lessThan(vUV1, vec2(.9995)))) discard;
#endif
  float h = thick(xz);
  // micro relief: wind ripples (fair ground) and grains
  float ph = dot(lq, vec2(.62,.78))*95. + vn(lq*4.)*9. + vn(lq*13.)*2.;
  float ramp = ripple * smoothstep(.25,.8, vn(lq*2.3+11.));
  float rip = ramp * (sin(ph) * .5 + .5) * .03;
  float gr = vn(lq*2600.) * .6 + vn(lq*900.) * .4;
  float hr = h + rip + (gr-.5)*.02;
  // normal from thickness
  vec3 col = vec3(0.);
  if (topW > 0.) {
  float e = .0016;
  float hx = thick(xz+vec2(e,0)) - thick(xz-vec2(e,0)), hz = thick(xz+vec2(0,e)) - thick(xz-vec2(0,e));
  float rx = ramp*.03*cos(ph)*95.*.5;
  vec3 n = normalize(vec3(-(hx/(2.*e))*relief - rx*.62*relief - (vn(lq*2600.+3.)-.5)*.35, 1., -(hz/(2.*e))*relief - rx*.78*relief - (vn(lq*2600.+7.)-.5)*.35));
    vec3 alb = vec3(.74,.6,.44) * (.82 + .3*gr);
    vec3 V = normalize(camP - vW);
    for (int i=0;i<5;i++){ vec3 L = lp[i]-vW; float d = length(L); L/=d; float ndl = max(dot(n,L),0.);
      float att = 1./(1.+d*d*.05);
      vec3 H = normalize(L+V); float sp = pow(max(dot(n,H),0.), 60.) * .25;
      float glint = step(.993, h21(floor(lq*1400.))) * pow(max(dot(n,H),0.), 24.) * 3.;
      col += lc[i] * att * (alb*ndl + sp + glint); }
    col *= topW * exp(-max(length(vW - camP) - .5, 0.) * 1.1);
  }
  if (backW > 0.) {
    // light through sand: thin sand glows amber, thick sand goes to umber-black; grains speckle the half-tones
    float hb = h * (.78 + .44*gr) + (step(.72, h21(floor(lq*1700.))) * .09) * smoothstep(.02,.25,h);
    vec3 tr = exp(-hb * grainK * vec3(.52, 1., 1.9));
    float spread = smoothstep(backR + backF, backR - backF, length(xz - backO));
    col += backC * tr * backW * spread;
  }
  col *= exposure;
  col = 1. - exp(-col);
  gl_FragColor = vec4(pow(col, vec3(1./2.2)), 1.);
}`;
export function sandMesh() {
  MAT = new THREE.ShaderMaterial({
    uniforms: { D1: { value: T1 }, D2: { value: T2 }, W1: { value: new THREE.Vector4(WIN.x, WIN.z, WIN.s, 0) }, D2X: { value: D2X }, relief: { value: .03 },
      topW: { value: 1 }, backW: { value: 0 }, backR: { value: 50 }, backF: { value: 1 }, backO: { value: new THREE.Vector2(WIN.x, WIN.z) }, backC: { value: new THREE.Color(3.2, 2.7, 2.0) },
      time: { value: 0 }, grainK: { value: 14 }, ripple: { value: 1 }, exposure: { value: 1 },
      lp: { value: Array.from({ length: 5 }, () => new THREE.Vector3()) }, lc: { value: Array.from({ length: 5 }, () => new THREE.Color(0, 0, 0)) }, camP: { value: new THREE.Vector3() } },
    vertexShader: VS, fragmentShader: FS });
  const grp = new THREE.Group();
  const fine = new THREE.Mesh(new THREE.PlaneGeometry(WIN.s, WIN.s, 600, 600), MAT); fine.rotation.x = -Math.PI / 2; fine.position.set(WIN.x, 0, WIN.z); FINE = fine;
  const holed = new THREE.ShaderMaterial({ uniforms: MAT.uniforms, vertexShader: VS, fragmentShader: FS, defines: { HOLE: 1 } });
  const big = new THREE.Mesh(new THREE.PlaneGeometry(2 * D2X, 2 * D2X, 8, 8), holed); big.rotation.x = -Math.PI / 2;
  grp.add(big, fine); MESH = grp; return { mesh: grp, mat: MAT };
}
