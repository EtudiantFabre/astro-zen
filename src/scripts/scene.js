/* ==========================================================================
   Scène WebGL — un seul nuage de particules qui se métamorphose
   au fil des sections : sphère → onde → ADN → nœud → </>
   ========================================================================== */
import * as THREE from 'three';
import gsap from 'gsap';

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERT = /* glsl */ `
uniform float uTime;
uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform float uIntro;
uniform float uSize;
uniform float uPixelRatio;
uniform float uMouseStrength;
uniform float uTurb;
uniform float uWave;
uniform vec3 uMouse;

attribute vec3 aS1;
attribute vec3 aS2;
attribute vec3 aS3;
attribute vec3 aS4;
attribute vec4 aRand;

varying float vMix;
varying float vAlpha;

${NOISE}

vec3 shapeAt(float i){
  if (i < 0.5) return position;
  if (i < 1.5) return aS1;
  if (i < 2.5) return aS2;
  if (i < 3.5) return aS3;
  return aS4;
}

void main(){
  // morph décalé par particule → effet de "vol" organique
  float t = clamp((uMix - aRand.x * 0.4) / 0.6, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 a = shapeAt(uFrom);
  vec3 b = shapeAt(uTo);
  vec3 p = mix(a, b, t);

  // tourbillon pendant la transition
  float burst = sin(t * 3.14159);
  vec3 swirl = vec3(
    snoise(a * 0.35 + 1.3),
    snoise(a * 0.35 + 7.1),
    snoise(a * 0.35 + 4.7)
  );
  p += swirl * burst * 1.8;

  // ondulation (disque du manifeste)
  float r = length(p.xz);
  p.y += sin(r * 2.1 - uTime * 1.5) * 0.24 * uWave;

  // respiration permanente + turbulence liée à la vitesse de scroll
  float n = snoise(p * 0.55 + vec3(0.0, uTime * 0.16, uTime * 0.05));
  vec3 nd = vec3(snoise(p * 0.3 + 11.0), snoise(p * 0.3 + 23.0), snoise(p * 0.3 + 37.0));
  p += nd * (0.08 + uTurb * 0.9) + normalize(p + 0.0001) * n * 0.08;

  // intro : les particules arrivent de l'infini
  vec3 scatter = (aRand.yzw - 0.5) * 34.0;
  float ti = clamp((uIntro - aRand.x * 0.35) / 0.65, 0.0, 1.0);
  ti = 1.0 - pow(1.0 - ti, 3.0);
  p = mix(scatter, p, ti);

  vec4 world = modelMatrix * vec4(p, 1.0);

  // répulsion autour du curseur
  vec3 d = world.xyz - uMouse;
  float dist = length(d.xy);
  float f = smoothstep(1.7, 0.0, dist) * uMouseStrength;
  world.xy += normalize(d.xy + 0.0001) * f * 0.95;
  world.z += f * 0.6;

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float size = uSize * (0.3 + aRand.y * aRand.y * 1.2);
  gl_PointSize = size * uPixelRatio / -mv.z;

  vMix = clamp(n * 0.5 + 0.5 + p.y * 0.1, 0.0, 1.0);
  vAlpha = (0.25 + aRand.z * 0.75) * ti + f * 0.8;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uOpacity;
varying float vMix;
varying float vAlpha;

void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  a = pow(a, 1.7);
  vec3 col = mix(uColorB, uColorA, smoothstep(0.2, 0.75, vMix));
  col = mix(col, uColorC, smoothstep(0.85, 1.0, vMix));
  gl_FragColor = vec4(col, a * vAlpha * uOpacity);
}
`;

/* ---------- Générateurs de formes ---------- */
const rnd = (a = 1) => (Math.random() - 0.5) * a;

function sphere(N) {
  const a = new Float32Array(N * 3);
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = g * i;
    const R = Math.random() < 0.82 ? 2.15 + rnd(0.06) : 2.15 - Math.random() * 1.4;
    a[i * 3] = Math.cos(th) * r * R;
    a[i * 3 + 1] = y * R;
    a[i * 3 + 2] = Math.sin(th) * r * R;
  }
  return a;
}

function disc(N) {
  const a = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    let r = Math.sqrt(Math.random()) * 7;
    r = Math.round(r * 3.5) / 3.5 + rnd(0.035);
    const th = Math.random() * Math.PI * 2;
    a[i * 3] = Math.cos(th) * r;
    a[i * 3 + 1] = rnd(0.04);
    a[i * 3 + 2] = Math.sin(th) * r;
  }
  return a;
}

function helix(N) {
  const a = new Float32Array(N * 3);
  const L = 15, turns = 5.5, R = 1.2;
  for (let i = 0; i < N; i++) {
    let t = Math.random();
    let x, y, z;
    if (Math.random() < 0.76) {
      const s = Math.random() < 0.5 ? 0 : Math.PI;
      const ang = t * Math.PI * 2 * turns + s;
      const rr = R + rnd(0.1);
      x = (t - 0.5) * L;
      y = Math.cos(ang) * rr;
      z = Math.sin(ang) * rr;
    } else {
      t = Math.round(t * 70) / 70;
      const ang = t * Math.PI * 2 * turns;
      const k = Math.random() * 2 - 1;
      x = (t - 0.5) * L + rnd(0.03);
      y = Math.cos(ang) * R * k;
      z = Math.sin(ang) * R * k;
    }
    a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
  }
  return a;
}

function knot(N) {
  const a = new Float32Array(N * 3);
  const p = 2, q = 3, s = 0.78;
  for (let i = 0; i < N; i++) {
    const u = Math.random() * Math.PI * 2;
    const r = Math.cos(q * u) + 2;
    let x = r * Math.cos(p * u), y = r * Math.sin(p * u), z = -Math.sin(q * u);
    // décalage aléatoire sur une sphère → tube
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    const tr = 0.34 * (0.8 + Math.random() * 0.2);
    x += Math.sin(ph) * Math.cos(th) * tr;
    y += Math.sin(ph) * Math.sin(th) * tr;
    z += Math.cos(ph) * tr;
    a[i * 3] = x * s; a[i * 3 + 1] = y * s; a[i * 3 + 2] = z * s;
  }
  return a;
}

function glyph(N, text) {
  const a = new Float32Array(N * 3);
  const W = 1200, H = 520;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.font = '800 400px Syne, "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H / 2 + 20);
  const data = ctx.getImageData(0, 0, W, H).data;
  const pts = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    if (data[(y * W + x) * 4 + 3] > 128) pts.push(x, y);
  }
  const S = 8 / W;
  for (let i = 0; i < N; i++) {
    const k = Math.floor(Math.random() * (pts.length / 2)) * 2;
    a[i * 3] = (pts[k] - W / 2) * S + rnd(0.02);
    a[i * 3 + 1] = -(pts[k + 1] - H / 2) * S + rnd(0.02);
    a[i * 3 + 2] = rnd(0.6);
  }
  return a;
}

/* ---------- Palettes ---------- */
const PALETTES = {
  signal: ['#ffc53d', '#ff4d2e', '#fff3d6'],
  togo:   ['#ffce00', '#00a86b', '#e8112d'],
};

/* ---------- Scène ---------- */
export function createScene(canvas, { mobile = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('WebGL indisponible');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

  const N = mobile ? 9000 : 22000;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(sphere(N), 3));
  geo.setAttribute('aS1', new THREE.BufferAttribute(disc(N), 3));
  geo.setAttribute('aS2', new THREE.BufferAttribute(helix(N), 3));
  geo.setAttribute('aS3', new THREE.BufferAttribute(knot(N), 3));
  geo.setAttribute('aS4', new THREE.BufferAttribute(glyph(N, '</>'), 3));
  const rand = new Float32Array(N * 4);
  for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));

  const pal = PALETTES.signal;
  const uniforms = {
    uTime: { value: 0 },
    uFrom: { value: 0 },
    uTo: { value: 0 },
    uMix: { value: 1 },
    uIntro: { value: 0 },
    uSize: { value: mobile ? 34 : 30 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uMouseStrength: { value: 0 },
    uTurb: { value: 0 },
    uWave: { value: 0 },
    uOpacity: { value: 1 },
    uColorA: { value: new THREE.Color(pal[0]) },
    uColorB: { value: new THREE.Color(pal[1]) },
    uColorC: { value: new THREE.Color(pal[2]) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;

  // hiérarchie : outer (position / échelle / inclinaison) → spinner (rotation continue)
  const outer = new THREE.Group();
  const spinner = new THREE.Group();
  spinner.add(points);
  outer.add(spinner);
  scene.add(outer);

  // poussière d'étoiles en arrière-plan
  const dustN = mobile ? 300 : 700;
  const dustPos = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    dustPos[i * 3] = rnd(40); dustPos[i * 3 + 1] = rnd(26); dustPos[i * 3 + 2] = -Math.random() * 20;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xfff3d6, size: 0.035, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(dust);

  /* état piloté par GSAP */
  const state = { x: 0, y: 0, scale: 1, tilt: 0, offsetX: 0 };
  const spin = { y: 0.06, x: 0 };
  let current = 0;
  let aspect = 1;

  /* souris */
  const ndc = new THREE.Vector2(9, 9);
  const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  let lastMove = 0;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
    ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
    parallax.tx = ndc.x; parallax.ty = ndc.y;
    lastMove = performance.now();
  });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    aspect = w / h;
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    camera.position.z = Math.max(8, 2.9 / (Math.tan((camera.fov / 2) * Math.PI / 180) * aspect));
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let velocity = 0;
  const kick = { v: 0 };
  let turb = 0;
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    uniforms.uTime.value = t;

    // turbulence liée au scroll
    const turbTarget = Math.min(Math.abs(velocity) * 0.012, 0.6);
    turb += (turbTarget - turb) * 0.06;
    uniforms.uTurb.value = turb + kick.v;

    // souris
    const idle = performance.now() - lastMove > 1800;
    uniforms.uMouseStrength.value += ((idle ? 0 : 1) - uniforms.uMouseStrength.value) * 0.05;
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) uniforms.uMouse.value.lerp(hit, 0.15);

    parallax.x += (parallax.tx - parallax.x) * 0.04;
    parallax.y += (parallax.ty - parallax.y) * 0.04;

    spinner.rotation.y += spin.y * dt;
    spinner.rotation.x += spin.x * dt;

    const wide = aspect > 1.1 ? 1 : 0;
    outer.position.set(state.x * wide + state.offsetX, state.y, 0);
    outer.scale.setScalar(state.scale * (wide ? 1 : 0.95));
    outer.rotation.x = state.tilt - parallax.y * 0.18;
    outer.rotation.y = parallax.x * 0.28;

    dust.rotation.y = t * 0.01 + parallax.x * 0.05;
    dust.position.y = parallax.y * 0.3;

    renderer.render(scene, camera);
  });

  const align = (angle, period) => Math.round(angle / period) * period;

  return {
    intro(duration = 3) {
      gsap.to(uniforms.uIntro, { value: 1, duration, ease: 'power2.out' });
    },
    /* aller vers l'état d'une section */
    go(s) {
      if (s.shape !== current) {
        const from = uniforms.uMix.value > 0.5 ? uniforms.uTo.value : uniforms.uFrom.value;
        uniforms.uFrom.value = from;
        uniforms.uTo.value = s.shape;
        uniforms.uMix.value = 0;
        gsap.to(uniforms.uMix, { value: 1, duration: 2.2, ease: 'power2.inOut', overwrite: true });
        current = s.shape;
      }
      const d = { duration: 2, ease: 'power3.inOut', overwrite: true };
      gsap.to(state, { x: s.x ?? 0, y: s.y ?? 0, scale: s.scale ?? 1, tilt: s.tilt ?? 0, ...d });
      gsap.to(uniforms.uOpacity, { value: s.opacity ?? 1, ...d });
      gsap.to(uniforms.uWave, { value: s.wave ?? 0, ...d });
      gsap.to(spin, { y: s.spinY ?? 0, x: s.spinX ?? 0, duration: 1, overwrite: true });
      // les formes orientées (ADN, texte, disque) se réalignent proprement
      if (s.alignY) gsap.to(spinner.rotation, { y: align(spinner.rotation.y, s.alignY), duration: 2, ease: 'power3.inOut', overwrite: 'auto' });
      if (s.alignX) gsap.to(spinner.rotation, { x: align(spinner.rotation.x, s.alignX), duration: 2, ease: 'power3.inOut', overwrite: 'auto' });
    },
    setOffset(x) { state.offsetX = x; },
    setVelocity(v) { velocity = v; },
    setPalette(name) {
      const p = PALETTES[name] || PALETTES.signal;
      ['uColorA', 'uColorB', 'uColorC'].forEach((k, i) => {
        const c = new THREE.Color(p[i]);
        gsap.to(uniforms[k].value, { r: c.r, g: c.g, b: c.b, duration: 1.4, ease: 'power2.inOut' });
      });
      // petite explosion pour célébrer
      gsap.fromTo(kick, { v: 1.2 }, { v: 0, duration: 2.2, ease: 'power3.out' });
    },
    palettes: Object.keys(PALETTES),
  };
}
