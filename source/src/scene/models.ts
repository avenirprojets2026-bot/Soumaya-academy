import * as THREE from 'three';
import { glowSprite, glowTex } from './tex';

export interface Animated { group: THREE.Object3D; update: (t: number, dt: number) => void }

export const std = (color: THREE.ColorRepresentation, o: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0, ...o });
export const glowMat = (color: THREE.ColorRepresentation, k = 0.9, o: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k, flatShading: true, roughness: 0.5, ...o });
export const M = (geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };

export function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash3 = (x: number, y: number, z: number) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
/** Déforme légèrement une géométrie pour un aspect taillé à la main (les sommets jumeaux restent soudés). */
export function jitter(geo: THREE.BufferGeometry, amp: number, yAmp = amp) {
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    p.setXYZ(i, x + (hash3(x, y, z) - 0.5) * amp, y + (hash3(y, z, x) - 0.5) * yAmp, z + (hash3(z, x, y) - 0.5) * amp);
  }
  geo.computeVertexNormals();
  return geo;
}

/* ---------- ciel, mer, nuages, particules ---------- */

export function makeSky(): Animated {
  const g = new THREE.Group();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 20), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#0d0838') }, mid: { value: new THREE.Color('#4a2c9e') }, low: { value: new THREE.Color('#ff7fa6') }, glow: { value: new THREE.Color('#ffd6a0') } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 low; uniform vec3 glow; varying vec3 vP; void main(){ float h = clamp(vP.y,-0.2,1.0); vec3 c = mix(low, mid, smoothstep(-0.05,0.35,h)); c = mix(c, top, smoothstep(0.3,0.95,h)); c += glow * pow(max(0.0,1.0-abs(vP.y-0.02)*5.0),3.0) * 0.45; gl_FragColor = vec4(c,1.0); }',
  }));
  g.add(sky);
  // étoiles
  const r = mulberry(7); const n = 700; const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, e = 0.12 + r() * 1.35; pos[i * 3] = Math.cos(a) * Math.cos(e) * 380; pos[i * 3 + 1] = Math.sin(e) * 380; pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 380; }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const sm = new THREE.PointsMaterial({ color: '#ffffff', size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false, fog: false });
  const stars = new THREE.Points(sg, sm); g.add(stars);
  const sm2 = new THREE.PointsMaterial({ color: '#ffe9a8', size: 3.4, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false, fog: false });
  const pos2 = new Float32Array(90 * 3);
  for (let i = 0; i < 90; i++) { const a = r() * Math.PI * 2, e = 0.2 + r() * 1.2; pos2[i * 3] = Math.cos(a) * Math.cos(e) * 375; pos2[i * 3 + 1] = Math.sin(e) * 375; pos2[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 375; }
  const sg2 = new THREE.BufferGeometry(); sg2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
  g.add(new THREE.Points(sg2, sm2));
  // lune
  const moon = new THREE.Mesh(new THREE.SphereGeometry(16, 24, 16), new THREE.MeshBasicMaterial({ color: '#fff4d6', fog: false }));
  moon.position.set(-150, 150, -300); g.add(moon);
  const mg = glowSprite('#ffe9b0', 120, 0.7); mg.position.copy(moon.position); (mg.material as THREE.SpriteMaterial).fog = false; g.add(mg);
  return { group: g, update: (t) => { sm.opacity = 0.75 + Math.sin(t * 1.7) * 0.15; sm2.opacity = 0.6 + Math.sin(t * 2.9 + 1) * 0.3; } };
}

export function makeSea(): Animated {
  const geo = new THREE.PlaneGeometry(420, 420, 70, 70); geo.rotateX(-Math.PI / 2);
  const base = Float32Array.from(geo.attributes.position.array);
  const col = new Float32Array(geo.attributes.position.count * 3);
  const c1 = new THREE.Color('#2a5cc0'), c2 = new THREE.Color('#58b4f0'), c = new THREE.Color();
  for (let i = 0; i < geo.attributes.position.count; i++) { c.copy(c1).lerp(c2, hash3(base[i * 3], 0, base[i * 3 + 2]) * 0.6); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.4, metalness: 0.1, emissive: '#1a3f8a', emissiveIntensity: 0.55, transparent: true, opacity: 0.96 }));
  mesh.position.y = -11;
  const p = geo.attributes.position as THREE.BufferAttribute;
  let acc = 0;
  return {
    group: mesh,
    update: (t, dt) => {
      acc += dt; if (acc < 1 / 24) return; acc = 0; // 24 Hz suffit pour des vagues douces
      for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; p.setY(i, Math.sin(x * 0.11 + t * 0.8) * 0.45 + Math.cos(z * 0.13 + t * 0.65) * 0.4 + Math.sin((x + z) * 0.07 + t * 0.4) * 0.5); }
      p.needsUpdate = true;
    },
  };
}

export function makeClouds(): Animated {
  const g = new THREE.Group(); const r = mulberry(21);
  const clouds: { m: THREE.Group; sp: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const c = new THREE.Group(); const k = 3 + Math.floor(r() * 3);
    const mat = std(i % 3 === 0 ? '#ffd7ec' : i % 3 === 1 ? '#d9ccff' : '#fff1f6', { emissive: '#7a4a9a', emissiveIntensity: 0.3 });
    for (let j = 0; j < k; j++) { const s = 1.8 + r() * 2.0; const b = M(new THREE.IcosahedronGeometry(s, 1), mat, j * 2.4 - k, (r() - 0.5) * 1.0, (r() - 0.5) * 1.6); b.scale.y = 0.55; c.add(b); }
    const far = i % 2 === 0; // moitié derrière les îles, moitié sous elles : jamais devant
    c.position.set(-120 + r() * 240, far ? 2 + r() * 14 : -8 + r() * 4, far ? -55 - r() * 40 : -6 + r() * 40);
    c.scale.setScalar(far ? 1.3 + r() * 1.2 : 0.9 + r() * 0.9);
    g.add(c); clouds.push({ m: c, sp: 0.3 + r() * 0.45 });
  }
  return { group: g, update: (_t, dt) => { for (const c of clouds) { c.m.position.x += c.sp * dt; if (c.m.position.x > 130) c.m.position.x = -130; } } };
}

export function makeFireflies(count = 160): Animated {
  const r = mulberry(99); const base = new Float32Array(count * 3); const pos = new Float32Array(count * 3); const ph = new Float32Array(count);
  for (let i = 0; i < count; i++) { base[i * 3] = (r() - 0.5) * 80; base[i * 3 + 1] = -2 + r() * 14; base[i * 3 + 2] = (r() - 0.5) * 70 - 4; ph[i] = r() * 6.28; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ map: glowTex('#ffe27a'), size: 0.9, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 });
  const pts = new THREE.Points(geo, mat);
  return { group: pts, update: (t) => { for (let i = 0; i < count; i++) { pos[i * 3] = base[i * 3] + Math.sin(t * 0.5 + ph[i]) * 1.8; pos[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.7 + ph[i] * 2) * 1.2; pos[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.45 + ph[i]) * 1.8; } (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true; } };
}

/* ---------- chemin lumineux ---------- */

export function makePath(points: THREE.Vector3[]): { curve: THREE.CatmullRomCurve3; anim: Animated } {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
  const g = new THREE.Group(); const len = curve.getLength(); const n = Math.floor(len / 1.9);
  const stones: THREE.Mesh[] = [];
  const geo = new THREE.CylinderGeometry(0.55, 0.62, 0.16, 6);
  for (let i = 0; i <= n; i++) {
    const p = curve.getPointAt(i / n); const m = M(geo, glowMat('#ffd966', 0.7), p.x, p.y - 0.1, p.z);
    m.rotation.y = i * 0.7; m.scale.setScalar(0.85 + (i % 3) * 0.12); g.add(m); stones.push(m);
  }
  const halo = glowSprite('#ffd966', 3.2, 0.25);
  return {
    curve,
    anim: { group: g, update: (t) => { stones.forEach((m, i) => { const w = 0.5 + 0.5 * Math.sin(t * 2 - i * 0.55); (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.25 + w * 0.9; m.position.y += Math.sin(t * 1.4 + i) * 0.0012; }); void halo; } },
  };
}

/* ---------- Mimi, la petite étoile ---------- */

export function makeMimi(): Animated & { setMood: (m: 'happy' | 'wow' | 'think') => void } {
  const g = new THREE.Group();
  const sh = new THREE.Shape(); const n = 5, ro = 1, ri = 0.52;
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2 + Math.PI / 2; const rr = i % 2 === 0 ? ro : ri; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (i === 0) sh.moveTo(x, y); else sh.lineTo(x, y); }
  sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.32, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.14, bevelSegments: 3 }); geo.translate(0, 0, -0.16);
  const body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#ffd23f', emissive: '#ffb300', emissiveIntensity: 0.65, roughness: 0.4 }));
  const face = new THREE.Group(); face.position.z = 0.34;
  const eyeM = new THREE.MeshBasicMaterial({ color: '#3a1d00' });
  const eyeL = M(new THREE.SphereGeometry(0.085, 10, 8), eyeM, -0.2, 0.08, 0), eyeR = M(new THREE.SphereGeometry(0.085, 10, 8), eyeM, 0.2, 0.08, 0);
  eyeL.scale.set(1, 1.3, 0.5); eyeR.scale.set(1, 1.3, 0.5);
  const smile = M(new THREE.TorusGeometry(0.15, 0.028, 6, 14, Math.PI), eyeM, 0, -0.1, 0); smile.rotation.z = Math.PI;
  const cheeks = [M(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff7a9a' }), -0.34, -0.06, 0), M(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff7a9a' }), 0.34, -0.06, 0)];
  cheeks.forEach((c) => c.scale.set(1, 0.7, 0.4));
  face.add(eyeL, eyeR, smile, ...cheeks);
  const halo = glowSprite('#ffe27a', 3.4, 0.5); halo.position.z = -0.2;
  const light = new THREE.PointLight('#ffd23f', 6, 12, 2);
  g.add(body, face, halo, light);
  const trail = new THREE.Group(); const dots: THREE.Sprite[] = [];
  for (let i = 0; i < 8; i++) { const s = glowSprite('#ffe27a', 0.9 - i * 0.08, 0.7 - i * 0.07); trail.add(s); dots.push(s); }
  const hist: THREE.Vector3[] = [];
  let mood: 'happy' | 'wow' | 'think' = 'happy';
  const root = new THREE.Group(); root.add(g);
  return {
    group: root,
    setMood: (m) => { mood = m; },
    update: (t) => {
      g.rotation.y = Math.sin(t * 1.3) * 0.35; g.rotation.z = Math.sin(t * 1.9) * 0.12 + (mood === 'think' ? Math.sin(t * 3) * 0.2 : 0);
      const wow = mood === 'wow' ? 1.18 + Math.sin(t * 8) * 0.05 : 1; g.scale.setScalar(wow);
      eyeL.scale.y = eyeR.scale.y = Math.sin(t * 0.8 + 1) > 0.97 ? 0.15 : 1.3;
      halo.scale.setScalar(3.3 + Math.sin(t * 2.4) * 0.35);
      hist.unshift(root.getWorldPosition(new THREE.Vector3())); if (hist.length > 40) hist.pop();
      dots.forEach((d, i) => { const h = hist[Math.min(hist.length - 1, (i + 1) * 4)]; if (h) { trail.worldToLocal(d.position.copy(h)); } });
    },
  };
}

/* ---------- Soumaya, l'héroïne ---------- */

export interface HeroLook { skin: string; hair: string; style: string }
export interface HeroRig extends Animated { moving: boolean; restyle: (look: HeroLook, outfit: string, accessory: string) => void; setMood: (m: 'idle' | 'cheer') => void }

export function makeHero(look: HeroLook, outfit: string, accessory: string): HeroRig {
  const root = new THREE.Group(); let inner = new THREE.Group(); root.add(inner);
  const shadow = M(new THREE.CircleGeometry(1.1, 16), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.28, depthWrite: false }), 0, 0.04, 0); shadow.rotation.x = -Math.PI / 2; root.add(shadow);
  let legL!: THREE.Group, legR!: THREE.Group, armL!: THREE.Group, armR!: THREE.Group, body!: THREE.Group, cape: THREE.Mesh | null = null;
  let mood: 'idle' | 'cheer' = 'idle';
  const rig: HeroRig = { group: root, moving: false, restyle: () => undefined, setMood: (m) => { mood = m; }, update: () => undefined };

  function build(lk: HeroLook, out: string, acc: string) {
    root.remove(inner); inner = new THREE.Group(); root.add(inner); cape = null;
    const skin = std(lk.skin, { roughness: 0.7 }), hair = std(lk.hair, { roughness: 0.6 }), cloth = std(out), pants = std('#2f2a66');
    body = new THREE.Group(); inner.add(body);
    // jambes
    const mkLeg = (x: number) => { const l = new THREE.Group(); l.position.set(x, 1.05, 0); l.add(M(new THREE.CapsuleGeometry(0.2, 0.5, 4, 8), pants, 0, -0.35, 0)); l.add(M(new THREE.SphereGeometry(0.27, 10, 8), std('#ffe0e8'), 0, -0.82, 0.08)); l.children[1].scale.set(1, 0.6, 1.3); return l; };
    legL = mkLeg(-0.27); legR = mkLeg(0.27); body.add(legL, legR);
    // robe / tunique
    body.add(M(new THREE.CylinderGeometry(0.46, 0.78, 1.25, 12), cloth, 0, 1.7, 0));
    body.add(M(new THREE.TorusGeometry(0.62, 0.07, 6, 18), std('#ffffff'), 0, 1.12, 0)).rotation.x = Math.PI / 2;
    const belt = M(new THREE.TorusGeometry(0.52, 0.06, 6, 16), std('#ffd23f'), 0, 1.78, 0); belt.rotation.x = Math.PI / 2; body.add(belt);
    // bras
    const mkArm = (x: number) => { const a = new THREE.Group(); a.position.set(x, 2.15, 0); a.add(M(new THREE.CapsuleGeometry(0.15, 0.55, 4, 8), cloth, 0, -0.32, 0)); a.add(M(new THREE.SphereGeometry(0.16, 8, 6), skin, 0, -0.74, 0)); return a; };
    armL = mkArm(-0.62); armR = mkArm(0.62); body.add(armL, armR);
    // tête
    const head = new THREE.Group(); head.position.y = 3.05; body.add(head);
    const face = M(new THREE.SphereGeometry(0.86, 20, 16), skin); face.scale.set(1, 0.95, 0.94); head.add(face);
    const eye = new THREE.MeshBasicMaterial({ color: '#1a0f2e' }), white = new THREE.MeshBasicMaterial({ color: '#fff' });
    for (const s of [-1, 1]) {
      const e = M(new THREE.SphereGeometry(0.12, 10, 8), eye, s * 0.31, 0.02, 0.77); e.scale.set(0.9, 1.25, 0.6); head.add(e);
      head.add(M(new THREE.SphereGeometry(0.04, 6, 6), white, s * 0.31 + 0.04, 0.09, 0.84));
      const ch = M(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff8aa0', transparent: true, opacity: 0.7 }), s * 0.5, -0.2, 0.66); ch.scale.set(1.2, 0.7, 0.4); head.add(ch);
      const br = M(new THREE.BoxGeometry(0.22, 0.04, 0.04), hair, s * 0.31, 0.26, 0.78); br.rotation.z = s * -0.12; head.add(br);
    }
    const mouth = M(new THREE.TorusGeometry(0.13, 0.026, 6, 14, Math.PI), eye, 0, -0.2, 0.8); mouth.rotation.z = Math.PI; head.add(mouth);
    // coiffure
    const capHair = (r = 0.93, ext = 0.56) => M(new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI * ext), hair, 0, 0.02, -0.03);
    switch (lk.style) {
      case 'long': { head.add(capHair()); const back = M(new THREE.SphereGeometry(0.9, 14, 10), hair, 0, -0.45, -0.28); back.scale.set(1, 1.5, 0.7); head.add(back); break; }
      case 'hijab': { const wrap = M(new THREE.SphereGeometry(0.98, 20, 14), hair, 0, 0.03, -0.1); wrap.scale.set(1, 1.04, 0.95); head.add(wrap); face.position.z = 0.1; face.scale.set(0.92, 0.9, 0.9); const drape = M(new THREE.ConeGeometry(1.05, 1.3, 14), hair, 0, -0.95, -0.05); head.add(drape); break; }
      case 'puffs': { head.add(capHair(0.9, 0.5)); for (const s of [-1, 1]) head.add(M(new THREE.SphereGeometry(0.42, 12, 10), hair, s * 0.8, 0.62, -0.05)); break; }
      case 'braids': { head.add(capHair()); for (const s of [-1, 1]) { head.add(M(new THREE.CapsuleGeometry(0.15, 1.0, 4, 8), hair, s * 0.78, -0.6, -0.1)); head.add(M(new THREE.SphereGeometry(0.2, 8, 6), std('#ff5c8a'), s * 0.78, -1.3, -0.1)); } break; }
      case 'cap': { head.add(capHair(0.9, 0.5)); const cp = M(new THREE.SphereGeometry(0.96, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), std(out), 0, 0.12, 0); head.add(cp); const brim = M(new THREE.CylinderGeometry(0.62, 0.62, 0.07, 14, 1, false, -Math.PI / 2, Math.PI), std(out), 0, 0.2, 0.78); brim.rotation.x = 0.05; head.add(brim); break; }
      default: head.add(capHair(0.95, 0.52)); break;
    }
    // accessoires
    if (acc === 'lunettes') { for (const s of [-1, 1]) { const l = M(new THREE.TorusGeometry(0.2, 0.035, 6, 14), std('#ffd23f', { metalness: 0.5 }), s * 0.31, 0.02, 0.82); head.add(l); } head.add(M(new THREE.BoxGeometry(0.16, 0.03, 0.03), std('#ffd23f'), 0, 0.04, 0.84)); }
    if (acc === 'couronne') { const c = M(new THREE.CylinderGeometry(0.62, 0.7, 0.3, 5, 1, true), glowMat('#ffd23f', 0.5, { side: THREE.DoubleSide }), 0, 0.95, 0); head.add(c); for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; head.add(M(new THREE.ConeGeometry(0.1, 0.3, 4), glowMat('#ffd23f', 0.6), Math.cos(a) * 0.66, 1.2, Math.sin(a) * 0.66)); } }
    if (acc === 'casque') { head.add(M(new THREE.SphereGeometry(0.97, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), std('#aab4c8', { metalness: 0.6, roughness: 0.35 }), 0, 0.08, 0)); head.add(M(new THREE.ConeGeometry(0.1, 0.55, 5), std('#ff5c8a'), 0, 1.12, 0)); }
    if (acc === 'cape') { cape = M(new THREE.ConeGeometry(0.95, 2.3, 4, 1, true), std('#ff5c8a', { side: THREE.DoubleSide }), 0, 1.65, -0.5); cape.rotation.x = 0.28; cape.rotation.y = Math.PI / 4; body.add(cape); }
    // petite étoile sur la poitrine
    body.add(M(new THREE.OctahedronGeometry(0.13, 0), glowMat('#ffe27a', 0.8), 0, 2.25, 0.5));
  }
  build(look, outfit, accessory);
  rig.restyle = (lk, out, acc) => build(lk, out, acc);
  let wt = 0;
  rig.update = (t, dt) => {
    if (rig.moving) {
      wt += dt * 9;
      legL.rotation.x = Math.sin(wt) * 0.7; legR.rotation.x = -Math.sin(wt) * 0.7; armL.rotation.x = -Math.sin(wt) * 0.6; armR.rotation.x = Math.sin(wt) * 0.6;
      body.position.y = Math.abs(Math.sin(wt)) * 0.14; body.rotation.z = Math.sin(wt) * 0.05;
    } else {
      legL.rotation.x *= 0.85; legR.rotation.x *= 0.85;
      body.position.y = Math.sin(t * 2.1) * 0.03; body.rotation.z *= 0.85;
      if (mood === 'cheer') { armL.rotation.x = Math.PI - 0.5 + Math.sin(t * 9) * 0.4; armR.rotation.x = Math.PI - 0.5 - Math.sin(t * 9) * 0.4; body.position.y = Math.abs(Math.sin(t * 6)) * 0.45; }
      else { armL.rotation.x = Math.sin(t * 1.7) * 0.06; armR.rotation.x = -Math.sin(t * 1.7) * 0.06; }
    }
    if (cape) cape.rotation.x = 0.28 + (rig.moving ? 0.25 + Math.sin(wt * 1.3) * 0.08 : Math.sin(t * 2) * 0.03);
  };
  root.scale.setScalar(0.82);
  return rig;
}
