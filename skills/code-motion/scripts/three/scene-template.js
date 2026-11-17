/**
 * Three.js scene template with the lighting/atmosphere discipline from SKILL.md:
 * warm key + cool sky fill + warm bounce, fog matched to the horizon colour,
 * and a gradient sky dome. Copy this and replace buildContent().
 */
import * as THREE from 'three';

const SUN_AZ = 200 * Math.PI / 180;   // radians, 0 = +Z, swept toward +X
const SUN_EL =   8 * Math.PI / 180;

export function sunDirection() {
  return new THREE.Vector3(
    Math.sin(SUN_AZ) * Math.cos(SUN_EL),
    Math.sin(SUN_EL),
    Math.cos(SUN_AZ) * Math.cos(SUN_EL)
  ).normalize();
}

const SKY_TOP     = new THREE.Color(0x2e5f96);
const SKY_HORIZON = new THREE.Color(0xf2b574);
const SUN_COLOR   = new THREE.Color(0xffd9a0);

function skyDome(THREE) {
  const g = new THREE.SphereGeometry(2200, 48, 32);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      top: { value: SKY_TOP }, horizon: { value: SKY_HORIZON },
      sunCol: { value: SUN_COLOR }, sunDir: { value: sunDirection() }
    },
    vertexShader: `varying vec3 vW;
      void main(){ vW = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `varying vec3 vW; uniform vec3 top,horizon,sunCol,sunDir;
      void main(){
        vec3 d = normalize(vW);
        float h = clamp(d.y, 0.0, 1.0);
        vec3 c = mix(horizon, top, pow(h, 0.52));
        float s = max(dot(d, normalize(sunDir)), 0.0);
        c += sunCol * pow(s, 320.0) * 7.0;    // disc
        c += sunCol * pow(s,   7.0) * 0.42;   // glow
        gl_FragColor = vec4(c, 1.0);
      }`
  });
  return new THREE.Mesh(g, m);
}

function buildContent(THREE, scene) {
  // ---- replace everything in here -------------------------------------
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.MeshStandardMaterial({ color: 0x8a7351, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);

  const mat = new THREE.MeshStandardMaterial({ color: 0xc8a040, roughness: 0.45, metalness: 0.2 });
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.6, 6 + i * 0.7, 24), mat);
    m.position.set((i - 4) * 4.5, (6 + i * 0.7) / 2, -i * 3);
    m.castShadow = true; m.receiveShadow = true;
    scene.add(m);
  }
  // ---------------------------------------------------------------------
}

export function setup({ THREE: T, scene, camera, renderer, width, height }) {
  scene.add(skyDome(THREE));
  // aerial perspective: fog colour MUST match the horizon or planes won't blend
  scene.fog = new THREE.FogExp2(SKY_HORIZON.getHex(), 0.0016);

  const d = sunDirection();
  const key = new THREE.DirectionalLight(0xffb070, 3.4);
  key.position.copy(d).multiplyScalar(300);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const S = 90;
  Object.assign(key.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 1, far: 900 });
  key.shadow.bias = -0.0008;
  scene.add(key);

  // cool sky fill + warm ground bounce
  scene.add(new THREE.HemisphereLight(0x7fa8df, 0xb98a55, 0.55));
  const bounce = new THREE.DirectionalLight(0xffb98a, 0.35);
  bounce.position.set(-d.x * 120, -40, -d.z * 120);
  scene.add(bounce);

  camera.position.set(22, 9, 46);
  camera.lookAt(0, 8, 0);

  buildContent(THREE, scene);
}

export function update(t, frame) {
  // animate here; called once per frame before render
}
