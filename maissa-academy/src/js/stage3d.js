// Salles en vraie 3D : géométrie réelle (marches, colonnes, arches…) + Maissa animée dans la même scène WebGL.
// La caméra est fixe pour chaque salle (cadrage proche de l'illustration d'origine) ; la salle 2D déplace la « caméra de jeu » en CSS.
import * as THREE from 'three';
import { Rig, loadGltf } from './rig.js';
import { URL as MODEL } from './hero3d.js';

// ---------- Muezza en 3D (modèle texturé, animation procédurale) ----------
const MIMI_URL = 'assets/models/mimi.glb';
let mimiP = null;
const BOWHUE = { rose: 330, bleu: 200, violet: 275, dore: 45, vert: 130 };
function bowTexture(tex, bow) {
  if (!tex || !tex.image || bow === 'rose' || !BOWHUE[bow]) return tex;
  try {
    const im = tex.image, c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height), a = d.data, H = BOWHUE[bow] / 360;
    for (let i = 0; i < a.length; i += 4) {
      const r = a[i] / 255, g = a[i + 1] / 255, b = a[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, dd = mx - mn;
      if (dd < 0.18 || mx < 0.25) continue; const sat = dd / (1 - Math.abs(2 * l - 1));
      let h = mx === r ? ((g - b) / dd) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; h = (h * 60 + 360) % 360;
      if (!(h > 290 || h < 15) || sat < 0.3) continue; // rose/magenta = le nœud
      const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat, p = 2 * l - q, f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
      a[i] = f(H + 1 / 3) * 255; a[i + 1] = f(H) * 255; a[i + 2] = f(H - 1 / 3) * 255;
    }
    x.putImageData(d, 0, 0); const t2 = new THREE.CanvasTexture(c); t2.flipY = tex.flipY; t2.colorSpace = tex.colorSpace; return t2;
  } catch (e) { return tex; }
}
class Kitty {
  constructor(g, heroH, bow) {
    this.holder = new THREE.Group(); this.inner = new THREE.Group(); this.holder.add(this.inner);
    const m = g.scene.clone(true), sc = 0.36 * (heroH / 1.4) / 1.4; m.scale.setScalar(sc); m.position.y = 0.7 * sc; this.inner.add(m);
    m.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.renderOrder = 2; o.material = o.material.clone(); o.material.metalness = 0; o.material.roughness = 0.9; this.mat = o.material; this.tex0 = this.tex0 || o.material.map; } });
    this.setBow(bow); this.pos = new THREE.Vector3(); this.target = new THREE.Vector3(); this.yaw = 0.6; this.yawT = 0.6; this.t = 0; this.first = true; this.state = {};
  }
  setBow(bow) { if (this.mat && this.tex0) { this.mat.map = bowTexture(this.tex0, bow); this.mat.needsUpdate = true; } }
  update(dt) {
    const s = this.state; this.t += dt;
    if (this.first) { this.pos.copy(this.target); this.first = false; }
    const prev = this.pos.clone(); this.pos.lerp(this.target, Math.min(1, dt * (s.fast ? 10 : 7)));
    const mv = prev.distanceTo(this.pos) / Math.max(dt, 1e-3), moving = mv > 0.08;
    if (moving) { const dx = this.pos.x - prev.x, dz = this.pos.z - prev.z; if (Math.hypot(dx, dz) > 1e-4) this.yawT = Math.atan2(dx, dz); } else if (s.yaw != null) this.yawT = s.yaw;
    let d = this.yawT - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); this.yaw += d * Math.min(1, dt * 8);
    let hop = 0, sy = 1, sz = 1, pitch = 0, roll = 0; const p = s.pose || '';
    if (moving) { this.wt = (this.wt || 0) + dt; hop = Math.abs(Math.sin(this.wt * 13)) * 0.035; pitch = Math.sin(this.wt * 13) * 0.05; }
    if (p === 'bond' || p === 'joie') hop = Math.max(hop, Math.abs(Math.sin(this.t * 7)) * 0.12);
    if (p === 'assis') { sy = 0.93; pitch = -0.18; }
    if (p === 'dort' || s.sleeping) { sy = 0.62; sz = 1.08; pitch = 0.05; }
    if (p === 'toilette') { roll = Math.sin(this.t * 6) * 0.12; pitch = 0.12; }
    const br = 1 + Math.sin(this.t * 2.2) * 0.015;
    this.holder.position.copy(this.pos); this.holder.position.y += hop;
    this.inner.rotation.set(pitch, this.yaw, roll, 'YXZ'); this.inner.scale.set(1, sy * br, sz);
  }
}

const RW = 1280, RH = 724;
let failed = false, gltfP = null;
// 3D désactivée par défaut : Maissa et Muezza restent dessinées (activable avec ?h3=1)
export function stageSupported(id) { return !failed && !!BUILD[id] && /[?&]h3=1/.test(location.search); }

const V = (x, y, z) => new THREE.Vector3(x, y, z);

function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function blobTex() { return canvasTex(128, 128, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); }

// ---------- décor peint projeté ----------
// L'illustration est projetée depuis la caméra de repos sur une géométrie 3D simplifiée (sol, marches, murs) :
// au repos, l'image est identique à l'illustration ; quand la caméra bouge légèrement, la profondeur apparaît ;
// Maissa vit dans le même espace (elle marche sur le vrai sol, monte les vraies marches).
function paintTexture(img) {
  const nw = img.naturalWidth, nh = img.naturalHeight, sc = Math.min(1, 1600 / nw);
  const c = document.createElement('canvas'); c.width = Math.round(nw * sc); c.height = Math.round(nh * sc); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; return t;
}
function paintMaterial(tex, uRef) {
  const m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uRef = uRef;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform mat4 uRef;\nvarying vec3 vPUv;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n vec4 rc = uRef * modelMatrix * vec4(transformed, 1.0); vPUv = rc.xyw;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vPUv;')
      .replace('#include <map_fragment>', 'diffuseColor *= texture2D(map, vPUv.xy / vPUv.z * 0.5 + 0.5);');
  };
  return m;
}
const mkCam = ({ pos, pitch, fov }) => { const c = new THREE.PerspectiveCamera(fov, RW / RH, 0.1, 200); c.position.copy(pos); c.rotation.set(-THREE.MathUtils.degToRad(pitch), 0, 0); c.updateMatrixWorld(true); return c; };
// point du sol (y = 0) vu à la position écran (u, v)
function floorPt(cam, u, v) {
  const r = new THREE.Raycaster(); r.setFromCamera({ x: u * 2 - 1, y: 1 - v * 2 }, cam); const o = r.ray.origin, d = r.ray.direction; return o.clone().addScaledVector(d, -o.y / d.y);
}
// point vu en (u, v) à une profondeur donnée (le long de l'axe de la caméra)
function atDepth(cam, u, v, depth) {
  const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)); const p = new THREE.Vector3((u * 2 - 1) * t * cam.aspect * depth, (1 - v * 2) * t * depth, -depth); return p.applyMatrix4(cam.matrixWorld);
}
const camDepth = (cam, p) => -p.clone().applyMatrix4(cam.matrixWorldInverse).z;

const BUILD = {};
// ---------- GRAND HALL ----------
BUILD.hall = ({ scene, img, cam, add }) => {
  const bL = floorPt(cam, 0.415, 0.685), bR = floorPt(cam, 0.58, 0.685), W = bR.x - bL.x, zB = bL.z, dB = camDepth(cam, bL);
  const tL = atDepth(cam, 0.465, 0.455, dB * (0.165 / 0.07)), tR = atDepth(cam, 0.535, 0.455, dB * (0.165 / 0.07));
  const hT = (tL.y + tR.y) / 2, zT = (tL.z + tR.z) / 2, N = 14, sd = (zB - zT) / N;
  // sol
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), null); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, 0); add(fl);
  // marches pleines
  for (let i = 0; i < N; i++) { const h = ((i + 1) / N) * hT; const m = new THREE.Mesh(new THREE.BoxGeometry(W * 1.02, h, sd * 1.001), null); m.position.set(0, h / 2, zB - (i + 0.5) * sd); add(m); }
  // palier + mur du fond + murs latéraux
  const land = new THREE.Mesh(new THREE.BoxGeometry(W * 6, hT, 1.6), null); land.position.set(0, hT / 2, zT - 0.8); add(land);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(200, 120), null); back.position.set(0, 20, zT - 1.7); add(back);
  const sideW = W * 3.6; [-1, 1].forEach((sg) => { const w = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(zT) + 30, 60), null); w.rotation.y = -sg * Math.PI / 2; w.position.set(sg * sideW, 10, (zT - 1.7 + 6) / 2); add(w); });
  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x6a5a98, 1.1)); const key = new THREE.DirectionalLight(0xfff0d6, 1.5); key.position.set(-3, 8, 6); scene.add(key);
  const up = hT / N * 0.5, path = [V(0, up, zB + W * 0.12), V(0, hT + up, zT - 0.05), V(0, hT + up, zT - W * 0.35)];
  const hAt = (z) => (z > zB ? 0 : z < zT ? hT : ((zB - z) / (zB - zT)) * hT);
  void hAt;
  // rampes dorées de chaque côté du tapis (les mains de Maissa s'y accrochent)
  const grip = { Ls: 0.2, lat: 0.21, up: 0.5, ahead: 0.08, lift: 0.2, lean: 0.06, noHands: true }, gold = new THREE.MeshStandardMaterial({ color: 0xe0b040, metalness: 0.55, roughness: 0.32 });
  const rail = (sg) => {
    const a = path[0].clone().add(V(sg * grip.lat, grip.up, 0.25)), b = path[1].clone().add(V(sg * grip.lat, grip.up, -0.1)), d = b.clone().sub(a), len = d.length();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, len, 10), gold); t.position.copy(a).addScaledVector(d, 0.5); t.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); scene.add(t);
    for (let i = 0; i <= 7; i++) { const u = i / 7, p = a.clone().lerp(b, u), h = p.y - (path[0].y + (path[1].y - path[0].y) * u) + 0.02; const po = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, h, 8), gold); po.position.set(p.x, p.y - h / 2, p.z); scene.add(po); }
    [a, b].forEach((e) => { const k = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), gold); k.position.copy(e); scene.add(k); });
  };
  void rail; // rampes retirées : le grand escalier n'en a pas sur la peinture
  return { paths: { grand: { pts: path, grip } }, hero: 1.25, W };
};

// salle « type pièce » : sol + mur du fond (profondeur lue sur la ligne sol/mur de l'illustration) + murs latéraux
function room({ cam, add, vWall, depthMul = 1 }) {
  const wall = floorPt(cam, 0.5, vWall), zW = wall.z, dW = camDepth(cam, wall) * depthMul;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), null); fl.rotation.x = -Math.PI / 2; add(fl);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(240, 120), null); back.position.set(0, 25, zW - 4); add(back);
  const half = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect * dW * 1.35;
  [-1, 1].forEach((sg) => { const w = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(zW) + 20, 60), null); w.rotation.y = -sg * Math.PI / 2; w.position.set(sg * half, 12, (zW + 6) / 2); add(w); });
  return { zW, dW };
}
const warm = (scene) => { scene.add(new THREE.HemisphereLight(0xfff1dc, 0x6a5a98, 1.1)); const k = new THREE.DirectionalLight(0xfff0d6, 1.5); k.position.set(-3, 8, 6); scene.add(k); };
BUILD.biblio = ({ scene, cam, add }) => {
  const { dW } = room({ cam, add, vWall: 0.665 });
  warm(scene);
  const pt = (u, v, k) => atDepth(cam, u, v, dW * k);
  const floor = (u, v) => floorPt(cam, u, v);
  const spiral = [floor(0.63, 0.645), pt(0.6, 0.58, 0.97), pt(0.565, 0.5, 0.985), pt(0.545, 0.43, 1.0), pt(0.58, 0.36, 1.03), pt(0.645, 0.3, 1.05), pt(0.685, 0.22, 1.05), pt(0.655, 0.13, 1.03)];
  const ladder = [floor(0.2, 0.655), pt(0.185, 0.55, 0.985), pt(0.168, 0.44, 0.985), pt(0.152, 0.32, 0.985)];
  return { paths: { spiral: { pts: spiral, grip: { Ls: 0.17, lat: 0.17, up: 0.46, ahead: 0.08, lift: 0.17 } }, ladder: { pts: ladder, grip: { Ls: 0.15, lat: 0.1, up: 0.55, ahead: 0.3, lift: 0.1, lean: 0.04, face: Math.PI, fw: 0.07 } } }, hero: 1.4 };
};
BUILD.atelier = ({ scene, cam, add }) => {
  room({ cam, add, vWall: 0.58 });
  warm(scene);
  // chaudron (bord supérieur au centre) et globe (centre) : repères 3D lus sur la peinture, à la profondeur du sol sous eux
  const cd = camDepth(cam, floorPt(cam, 0.915, 0.575)), rim = atDepth(cam, 0.915, 0.435, cd), gd = camDepth(cam, floorPt(cam, 0.375, 0.56)), globe = atDepth(cam, 0.375, 0.38, gd);
  // petit marchepied en bois : Maissa y monte pour atteindre le globe
  const step = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.4), new THREE.MeshStandardMaterial({ color: 0x7a4f2a, roughness: 0.75 })); step.visible = false; step.position.copy(floorPt(cam, 0.43, 0.625)).add(V(0, 0.14, 0)); scene.add(step);
  // chaudron : paroi invisible qui cache ce qui plonge sous le bord, et escabeau en bois juste à côté
  const R = 0.7, occ = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.45, 1.0, 40), new THREE.MeshBasicMaterial({ colorWrite: false })); occ.position.set(rim.x, rim.y - 0.5, rim.z); occ.renderOrder = 1; scene.add(occ);
  const dir = new THREE.Vector3(-0.94, 0, 0.35).normalize(), spot = new THREE.Vector3(rim.x, 0, rim.z).addScaledVector(dir, 0.92), stepH = 0.46;
  const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a30, roughness: 0.72 }), esc = new THREE.Group();
  const bx = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wood); m.position.set(x, y, z); esc.add(m); };
  bx(0.5, 0.05, 0.42, 0, stepH - 0.025, 0); bx(0.5, 0.04, 0.2, 0, stepH * 0.5, 0.26); // plateau + marche basse
  [[-0.22, -0.18], [0.22, -0.18], [-0.22, 0.18], [0.22, 0.18]].forEach(([x, z]) => bx(0.04, stepH, 0.04, x, stepH / 2, z));
  [[-0.22, 0.36], [0.22, 0.36]].forEach(([x, z]) => bx(0.04, stepH * 0.52, 0.04, x, stepH * 0.26, z));
  esc.position.copy(spot); esc.rotation.y = Math.atan2(-dir.x, -dir.z) + Math.PI; scene.add(esc);
  return { paths: {}, hero: 1.4, props: { rim, globe, step, spot, stepH, R } };
};
BUILD.nombres = ({ scene, cam, add }) => {
  const { dW } = room({ cam, add, vWall: 0.68 }); warm(scene);
  const podium = [floorPt(cam, 0.5, 0.745), atDepth(cam, 0.5, 0.675, dW * 0.97), atDepth(cam, 0.5, 0.615, dW * 0.96)];
  return { paths: { podium: { pts: podium } }, hero: 1.4 };
};
BUILD.observatoire = ({ scene, cam, add }) => {
  const { dW } = room({ cam, add, vWall: 0.675 }); warm(scene);
  const pt = (u, v, k) => atDepth(cam, u, v, dW * k);
  const stairs = [floorPt(cam, 0.31, 0.665), pt(0.3, 0.6, 0.96), pt(0.26, 0.555, 0.94), pt(0.2, 0.5, 0.92), pt(0.14, 0.46, 0.9), pt(0.09, 0.43, 0.9)];
  return { paths: { stairs: { pts: stairs } }, hero: 1.4 };
};
BUILD.archives = ({ scene, cam, add }) => { room({ cam, add, vWall: 0.7 }); warm(scene); return { paths: {}, hero: 1.4 }; };
BUILD.foret = ({ scene, cam, add }) => {
  room({ cam, add, vWall: 0.6 }); warm(scene);
  // champignon violet (chapeau) et clé suspendue à la branche : repères lus sur la peinture
  const dm = camDepth(cam, floorPt(cam, 0.95, 0.74)), cap = atDepth(cam, 0.95, 0.6, dm); const base = floorPt(cam, 0.88, 0.8);
  const kd = camDepth(cam, floorPt(cam, 0.84, 0.7)), key = atDepth(cam, 0.84, 0.21, kd);
  return { paths: {}, hero: 1.4, props: { cap, base, key } };
};
BUILD.galerie = ({ scene, cam, add }) => { room({ cam, add, vWall: 0.5 }); warm(scene); return { paths: {}, hero: 1.47 }; };
const C0 = { pos: V(0, 2.0, 0), pitch: 10, fov: 50 };
const CAMS = { hall: C0, biblio: C0, atelier: C0, nombres: C0, observatoire: C0, archives: C0, foret: C0, galerie: C0 };

// ---------- scène ----------
export async function load(id, img) {
  if (!BUILD[id] || failed) return null;
  try {
    const canvas = document.createElement('canvas'); canvas.className = 'stage3d'; canvas.setAttribute('aria-hidden', 'true');
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
    r.setPixelRatio(1); r.setSize(RW, RH, false); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
    const scene = new THREE.Scene(); const cam = mkCam(CAMS[id]);
    const uRef = { value: new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse) };
    const tex = paintTexture(img), mat = paintMaterial(tex, uRef), meshes = [];
    const add = (m) => { m.material = mat; scene.add(m); meshes.push(m); };
    const cfg = BUILD[id]({ scene, img, cam, add }); cfg.cam = { pos: cam.position.clone(), look: V(0, 0, 0) }; cfg.meshes = meshes; cfg.uRef = uRef; cfg.mat = mat;
    gltfP = gltfP || loadGltf(MODEL); const g = await gltfP;
    const rig = new Rig(g, cfg.hero || 1.25); scene.add(rig.holder);
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false })); blob.rotation.x = -Math.PI / 2; scene.add(blob);
    const S = new Stage(r, scene, cam, rig, blob, cfg); S.rig.play('idle');
    try { mimiP = mimiP || loadGltf(MIMI_URL); const mg = await mimiP; S.kitty = new Kitty(mg, cfg.hero || 1.25, 'rose'); scene.add(S.kitty.holder);
      const kb = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.32), blob.material); kb.rotation.x = -Math.PI / 2; scene.add(kb); S.kblob = kb; } catch (e) { S.kitty = null; }
    return S;
  } catch (e) { failed = true; return null; }
}

const ray = new THREE.Raycaster(), tmp = new THREE.Vector3();
export class Stage {
  constructor(r, scene, cam, rig, blob, cfg) { Object.assign(this, { r, scene, cam, rig, blob, cfg }); this.acc = 0; this.visible = true; this.pos = V(0, 0, -3); this.rest = cam.clone(); this.look = new THREE.Vector3(0, 0, -8).applyMatrix4(cam.matrixWorld); this.sway = 0; this.canvas = r.domElement; this.pathK = null; }
  // pixel de la salle (fractions de l'image) -> point du sol
  floorAt(fx, fy) {
    ray.setFromCamera({ x: fx * 2 - 1, y: 1 - fy * 2 }, this.rest); const o = ray.ray.origin, d = ray.ray.direction;
    if (Math.abs(d.y) < 1e-5) return V(0, 0, 0); const t = -o.y / d.y; return tmp.copy(o).addScaledVector(d, t).clone();
  }
  project(p) { const v = p.clone().project(this.rest); return { x: (v.x + 1) / 2, y: (1 - v.y) / 2 }; }
  setFloor(fx, fy) { this.pos.copy(this.floorAt(fx, fy)); this.pathK = null; }
  pathLen(name) { const P = this.cfg.paths[name].pts; let L = 0; for (let i = 1; i < P.length; i++) L += P[i].distanceTo(P[i - 1]); return L; }
  // position le long d'un trajet (0..1) ; renvoie la position écran
  setPath(name, k) {
    const P = this.cfg.paths[name].pts; let d = k * this.pathLen(name), p = P[P.length - 1].clone();
    for (let i = 1; i < P.length; i++) { const seg = P[i].distanceTo(P[i - 1]); if (d <= seg || i === P.length - 1) { p = P[i - 1].clone().lerp(P[i], Math.min(1, d / Math.max(seg, 1e-6))); break; } d -= seg; }
    this.prev = this.pos.clone(); this.pos.copy(p); this.pathK = k; return this.project(p);
  }
  pointAt(name, d) {
    const P = this.cfg.paths[name].pts; for (let i = 1; i < P.length; i++) { const seg = P[i].distanceTo(P[i - 1]); if (d <= seg || i === P.length - 1) return P[i - 1].clone().lerp(P[i], Math.max(0, Math.min(1, d / Math.max(seg, 1e-6)))); d -= seg; }
    return P[P.length - 1].clone();
  }
  // montée « os par os » : pieds posés marche après marche (genoux pliés), mains qui glissent sur la rampe
  // k : avancement 0..1 le long du trajet ; sign : +1 on monte, -1 on descend
  climbIK(name, k, sign = 1) {
    const P = this.cfg.paths[name], g = P.grip || {}, sc = (this.cfg.hero || 1.25) / 1.25, L = this.pathLen(name);
    const Ls = (g.Ls || 0.2) * sc, s = (sign > 0 ? k : 1 - k) * L, th = s / Ls;
    const at = (x) => this.pointAt(name, sign > 0 ? x : L - x);
    const a = at(Math.max(0, s - 0.05)), b = at(Math.min(L, s + 0.05)); const tan = b.sub(a);
    const hl = Math.hypot(tan.x, tan.z); let yaw = g.face != null ? g.face : (hl > 0.25 * tan.length() ? Math.atan2(tan.x, tan.z) : (this.ikYaw || 0)); this.ikYaw = yaw;
    if (sign < 0 && g.face == null) yaw = yaw; // en descendant on regarde dans le sens de la marche (vers le bas)
    const f = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), right = new THREE.Vector3(-f.z, 0, f.x);
    const smooth = (u) => u * u * (3 - 2 * u);
    const feet = [0, 1].map((j) => {
      const t = th + j, m = Math.floor(t / 2), r = t - 2 * m; let pu, lift = 0;
      if (r < 1) { const e = smooth(r); pu = (2 * m - 0.5) + 2 * e; lift = Math.sin(Math.PI * r) * (g.lift || 0.2) * sc; } else pu = 2 * m + 1.5;
      const p = at(Math.max(0, (pu - j) * Ls)); return p.addScaledVector(right, (j ? 1 : -1) * (g.fw || 0.13) * sc).add(new THREE.Vector3(0, lift, 0));
    });
    const hands = [0, 1].map((j) => {
      const p = at(s + (g.ahead != null ? g.ahead : 0.1) * sc + Math.sin(Math.PI * (th + j)) * 0.07 * sc);
      return p.addScaledVector(right, (j ? 1 : -1) * (g.lat || 0.2) * sc).add(new THREE.Vector3(0, (g.up || 0.48) * sc, 0)).addScaledVector(f, g.hf || 0);
    });
    this.rig.setIK({ feet, hands: g.noHands ? null : hands, fwd: f, lean: g.lean != null ? g.lean : 0.1, bob: -0.02 * sc - Math.abs(Math.cos(Math.PI * th / 1)) * 0.012 * sc, elbowF: g.elbowF });
    this.rig.setYaw(yaw); this.ikFeet = feet; this.ikHands = hands;
  }
  // Muezza 3D : au sol (fractions de l'image) ou le long d'un trajet (escaliers)
  mimiFloor(fx, fy) { if (this.kitty) this.kitty.target.copy(this.floorAt(fx, fy)); }
  mimiPath(name, k) { if (this.kitty) this.kitty.target.copy(this.pointAt(name, Math.max(0, Math.min(1, k)) * this.pathLen(name))); }
  mimiState(st) { if (this.kitty) Object.assign(this.kitty.state, st); }
  mimiScreen() { return this.kitty ? this.project(this.kitty.pos) : null; }
  mimiVisible(v) { if (this.kitty) { this.kitty.holder.visible = v; this.kblob.visible = v; } }
  ikOff() { this.rig.setIK(null); const st = this.cfg.props && this.cfg.props.step; if (st) st.visible = false; }
  // point 3D vu en (u, v) à la profondeur de Maissa (+ off) : les mains visent la peinture « à l'écran »
  reach(u, v, off = 0) { return atDepth(this.rest, u, v, camDepth(this.rest, this.pos) + off); }
  faceTo(p) { const dx = p.x - this.pos.x, dz = p.z - this.pos.z, y = Math.atan2(dx, dz); this.rig.setYaw(y); return new THREE.Vector3(Math.sin(y), 0, Math.cos(y)); }
  // touiller : la louche plonge dans le chaudron et décrit des cercles, les deux mains tiennent le manche
  stirIK(t, a) {
    const P = this.cfg.props, c = P.rim, w = t * 4.2, r = 0.25;
    const tip = new THREE.Vector3(c.x + Math.cos(w) * r, c.y - 0.2, c.z + Math.sin(w) * r);
    const toC = new THREE.Vector3(c.x - this.pos.x, 0, c.z - this.pos.z).normalize();
    const edge = new THREE.Vector3(c.x, c.y, c.z).addScaledVector(toC, -P.R * 0.92);
    const hR = edge.clone().add(new THREE.Vector3(Math.cos(w) * 0.05, 0.16 + Math.sin(w * 2) * 0.015, Math.sin(w) * 0.05)).addScaledVector(toC, -0.06);
    const hL = hR.clone().lerp(tip, 0.18).add(new THREE.Vector3(0, -0.03, 0));
    const f = this.faceTo(c); this.rig.setIK({ hands: [hL, hR], fwd: f, lean: 0.2, tip, elbowF: 0.25, bob: Math.sin(w) * 0.008 });
  }
  // faire tourner le globe : mains à plat sur le globe, balayage de la main
  globeIK(t, a) {
    const R = a.reach, sw = R.sw || 0.016, s = Math.sin(t * 3.1);
    const hL = this.reach(R.hands[0][0] + s * sw, R.hands[0][1] + Math.cos(t * 3.1) * 0.003, 0), hR = this.reach(R.hands[1][0] + s * sw, R.hands[1][1] + Math.cos(t * 3.1) * 0.003, 0);
    const e = Math.min(1, t * 2.5), st = this.cfg.props && this.cfg.props.step; this.yOff = 0.28 * e; if (st) { st.visible = true; st.scale.setScalar(Math.max(0.01, e)); st.position.set(this.pos.x, 0.14 * e, this.pos.z); } const f = this.faceTo(this.reach(R.hands[1][0], R.hands[1][1], 0.5)); this.rig.setIK({ hands: [hL, hR], fwd: f, lean: -0.05, elbowF: 0.0 });
  }
  dir() { return this.prev ? Math.atan2(this.pos.x - this.prev.x, this.pos.z - this.prev.z) : 0; }
  play(n, o) { this.rig.play(n, o); }
  playPose(p) { this.rig.playPose(p); }
  setYaw(y, snap) { this.rig.setYaw(y, snap); }
  prop(v) { this.rig.prop(v); }
  tint() {}
  setVisible(v) { this.visible = v; }
  frame(dt) {
    if (!this.visible) return;
    this.rig.holder.position.copy(this.pos); this.rig.holder.position.y += (this.yOff || 0) + (this.jump || 0); this.blob.position.set(this.pos.x, this.pos.y + 0.02, this.pos.z);
    this.sway += dt; this.swayK = (this.swayK == null ? 1 : this.swayK) + ((this.swayOn === false ? 0 : 1) - (this.swayK == null ? 1 : this.swayK)) * Math.min(1, dt * 4); const k = this.swayK;
    this.cam.position.set(this.rest.position.x + Math.sin(this.sway * 0.45) * 0.12 * k, this.rest.position.y + Math.sin(this.sway * 0.33) * 0.05 * k, this.rest.position.z); this.cam.lookAt(this.look); this.cam.updateMatrixWorld();
    this.rig.update(dt);
    if (this.kitty && this.kitty.holder.visible) { this.kitty.update(dt); this.kblob.position.set(this.kitty.pos.x, this.kitty.pos.y + 0.021, this.kitty.pos.z); }
    this.acc += dt; if (this.acc < 1 / 32) return; this.acc = 0;
    this.r.render(this.scene, this.cam);
  }
  render() { this.r.render(this.scene, this.cam); }
  dispose() { try { this.visible = false; this.cfg.mat && this.cfg.mat.map && this.cfg.mat.map.dispose(); this.r.dispose(); this.r.forceContextLoss(); } catch (e) { /* rien */ } }
}
