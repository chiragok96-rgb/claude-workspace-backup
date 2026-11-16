// A lens for the night world: depth of field (bokeh gather), bloom on the bulbs, then grade, vignette and grain.
import * as THREE from 'three';
let R, W, H, rtA, rtB, rtQ, rtQ2, quad, qs, qc, M = {};
const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
export function initPost(renderer, w, h) {
  R = renderer; W = w; H = h;
  const o = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
  rtA = new THREE.WebGLRenderTarget(W, H, { ...o, depthTexture: new THREE.DepthTexture(W, H, THREE.UnsignedIntType), samples: 0 });
  rtB = new THREE.WebGLRenderTarget(W, H, o);
  rtQ = new THREE.WebGLRenderTarget(W >> 2, H >> 2, o); rtQ2 = new THREE.WebGLRenderTarget(W >> 2, H >> 2, o);
  qs = new THREE.Scene(); qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); qs.add(quad);
  M.dof = new THREE.ShaderMaterial({ uniforms: { tC: { value: null }, tD: { value: null }, near: { value: .1 }, far: { value: 2000 }, focus: { value: 10 }, ap: { value: 0 }, maxR: { value: 26 }, px: { value: new THREE.Vector2(1 / W, 1 / H) } }, vertexShader: VS,
    fragmentShader: `uniform sampler2D tC, tD; uniform float near, far, focus, ap, maxR; uniform vec2 px; varying vec2 vUv;
    float lin(float z){ float n = z*2.-1.; return 2.*near*far/(far+near-n*(far-near)); }
    float coc(vec2 uv){ float d = lin(texture2D(tD, uv).r); return clamp(ap * abs(d - focus) / d, 0., maxR); }
    void main(){ vec3 c0 = texture2D(tC, vUv).rgb; float r0 = coc(vUv);
      if (ap <= 0.) { gl_FragColor = vec4(c0, 1.); return; }
      vec3 acc = c0; float wsum = 1.;
      for (int i = 1; i < 48; i++) { float fi = float(i); float r = sqrt(fi/48.) * maxR; float a = fi * 2.39996;
        vec2 uv = vUv + vec2(cos(a), sin(a)) * r * px; float rs = coc(uv);
        float w = smoothstep(r - 1.5, r + .5, rs) ; w = max(w, smoothstep(r-1.5, r+.5, r0) * step(rs, r0+.001) * .0 + (rs >= r ? 0. : 0.));
        w = (rs >= r) ? 1. : ((r0 >= r) ? .35 : 0.);
        acc += texture2D(tC, uv).rgb * w; wsum += w; }
      gl_FragColor = vec4(acc / wsum, 1.); }` });
  M.pre = new THREE.ShaderMaterial({ uniforms: { tC: { value: null }, th: { value: 1. }, px: { value: new THREE.Vector2(1 / W, 1 / H) } }, vertexShader: VS,
    fragmentShader: `uniform sampler2D tC; uniform float th; uniform vec2 px; varying vec2 vUv;
    void main(){ vec3 c = vec3(0.); for (int i=0;i<4;i++) for (int j=0;j<4;j++) c += texture2D(tC, vUv + (vec2(i,j)-1.5)*px).rgb; c /= 16.; float l = max(max(c.r,c.g),c.b); gl_FragColor = vec4(c * max(l - th, 0.) / max(l, 1e-4), 1.); }` });
  M.blur = new THREE.ShaderMaterial({ uniforms: { tC: { value: null }, dir: { value: new THREE.Vector2() } }, vertexShader: VS,
    fragmentShader: `uniform sampler2D tC; uniform vec2 dir; varying vec2 vUv;
    void main(){ vec3 c = vec3(0.); float ws = 0.; for (int i=-12;i<=12;i++){ float w = exp(-float(i*i)/50.); c += texture2D(tC, vUv + dir*float(i)).rgb*w; ws += w; } gl_FragColor = vec4(c/ws, 1.); }` });
  M.fin = new THREE.ShaderMaterial({ uniforms: { tC: { value: null }, tB: { value: null }, bloom: { value: .9 }, expo: { value: 1 }, vig: { value: .35 }, grain: { value: .025 }, time: { value: 0 }, lift: { value: new THREE.Vector3(0, 0, 0) }, white: { value: 0 }, whiteC: { value: new THREE.Color(1, .96, .88) } }, vertexShader: VS,
    fragmentShader: `uniform sampler2D tC, tB; uniform float bloom, expo, vig, grain, time, white; uniform vec3 lift, whiteC; varying vec2 vUv;
    vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14), 0., 1.); }
    float h(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
    void main(){ vec3 c = texture2D(tC, vUv).rgb + texture2D(tB, vUv).rgb * bloom; c *= expo;
      vec2 q = vUv - .5; q.x *= .56; c *= 1. - vig * smoothstep(.15, .75, length(q)*1.4);
      c = aces(c) + lift; c = pow(c, vec3(1./2.2));
      c += (h(gl_FragCoord.xy + fract(time)*731.) - .5) * grain;
      c = mix(c, whiteC, white);
      gl_FragColor = vec4(c, 1.); }` });
}
function pass(mat, target) { quad.material = mat; R.setRenderTarget(target); R.render(qs, qc); }
// o: { focus, ap (aperture in px*m), bloom, th, expo, vig, white }
let rtX, rtY, MB;
export function renderPost(scene, cam, o = {}, out = null) {
  R.setRenderTarget(rtA); R.render(scene, cam);
  const d = M.dof.uniforms; d.tC.value = rtA.texture; d.tD.value = rtA.depthTexture; d.near.value = cam.near; d.far.value = cam.far; d.focus.value = o.focus ?? 10; d.ap.value = o.ap ?? 0; d.maxR.value = o.maxR ?? 26;
  pass(M.dof, rtB);
  M.pre.uniforms.tC.value = rtB.texture; M.pre.uniforms.th.value = o.th ?? 1; pass(M.pre, rtQ);
  for (let k = 0; k < 2; k++) { M.blur.uniforms.tC.value = rtQ.texture; M.blur.uniforms.dir.value.set(1.6 * (k + 1) / (W >> 2), 0); pass(M.blur, rtQ2); M.blur.uniforms.tC.value = rtQ2.texture; M.blur.uniforms.dir.value.set(0, 1.6 * (k + 1) / (H >> 2)); pass(M.blur, rtQ); }
  const f = M.fin.uniforms; f.tC.value = rtB.texture; f.tB.value = rtQ.texture; f.bloom.value = o.bloom ?? .9; f.expo.value = o.expo ?? 1; f.vig.value = o.vig ?? .35; f.white.value = o.white ?? 0; f.time.value = o.time ?? 0;
  pass(M.fin, out);
}
// two finished shots, cross-dissolved
export function renderBlend(scene, camA, oA, camB, oB, k) {
  if (!rtX) { rtX = new THREE.WebGLRenderTarget(W, H); rtY = new THREE.WebGLRenderTarget(W, H); MB = new THREE.ShaderMaterial({ uniforms: { a: { value: null }, b: { value: null }, k: { value: 0 } }, vertexShader: VS, fragmentShader: `uniform sampler2D a, b; uniform float k; varying vec2 vUv; void main(){ gl_FragColor = vec4(mix(texture2D(a, vUv).rgb, texture2D(b, vUv).rgb, k), 1.); }` }); }
  renderPost(scene, camA, oA, rtX); renderPost(scene, camB, oB, rtY);
  MB.uniforms.a.value = rtX.texture; MB.uniforms.b.value = rtY.texture; MB.uniforms.k.value = k; pass(MB, null);
}
