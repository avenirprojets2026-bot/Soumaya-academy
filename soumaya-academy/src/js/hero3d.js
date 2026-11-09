// Soumaya en vraie 3D : modèle texturé avec squelette (glTF), animations réelles (marche, escalier, assise, geste magique…),
// rendu par un seul contexte WebGL partagé, placé dans la case de Soumaya de chaque salle. Repli automatique sur les illustrations si WebGL échoue.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const W = 390, H = 480;                 // même format que les illustrations
export const URL = 'assets/models/soumaya.glb';
let st = null, failed = false, loading = null;

// pose illustrée -> animation 3D (et vitesse, boucle)
export const CLIP = {
  face: ['idle'], trois_quarts: ['idle'], profil_droite: ['idle'], lecture: ['idle'], ecoute: ['idle'], ecrit: ['idle'], coffre: ['idle'],
  marche_1: ['walk', 2.1], marche_2: ['walk', 2.1], marche_3: ['walk', 2.1], marche_4: ['walk', 2.1], marche_5: ['walk', 2.1], marche_6: ['walk', 2.1], marche_7: ['walk', 2.1], marche_8: ['walk', 2.1],
  joie: ['cheer', 1.25, 1], bravo: ['cheer', 1.0, 1], salut: ['wave', 1.2, 1], oups: ['confused', 1.3, 1], reflexion: ['confused', 1.0, 1],
  assise: ['sit_idle'], remue_1: ['spell', 1.0], remue_2: ['spell', 1.0], geste_1: ['wave', 1.2, 1], geste_2: ['wave', 1.0, 1], monte_1: ['climb', 1.0], monte_2: ['climb', 1.0],
  saut_ouvert: ['cheer', 1.4, 1], saut_joint: ['idle'],
};

export function ok() { return !!st && !failed; }
export function isFailed() { return failed; }

export function load() {
  if (!/[?&]h3=1/.test(location.search)) failed = true; // essais automatiques sans carte graphique : poses dessinées
  if (st || failed) return Promise.resolve(ok());
  if (loading) return loading;
  loading = new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.className = 'hero3d'; canvas.setAttribute('aria-hidden', 'true');
      const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
      r.setPixelRatio(1); r.setSize(W, H, false); r.setClearColor(0x000000, 0);
      r.outputColorSpace = THREE.SRGBColorSpace;
      r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
      const scene = new THREE.Scene();
      const hemi = new THREE.HemisphereLight(0xfff2e0, 0x6a5a8a, 1.5); scene.add(hemi);
      const key = new THREE.DirectionalLight(0xfff0d8, 2.4); key.position.set(1.6, 3.2, 3.4); scene.add(key);
      const rim = new THREE.DirectionalLight(0xffd27a, 1.6); rim.position.set(-2.5, 2.0, -2.5); scene.add(rim);
      const fov = 22, aspect = W / H, vis = 1.66, dist = (vis / 2) / Math.tan(THREE.MathUtils.degToRad(fov / 2));
      const cam = new THREE.PerspectiveCamera(fov, aspect, 0.1, 30);
      cam.position.set(0, 0.79, dist); cam.lookAt(0, 0.79, 0);
      // en file:// les blobs d'ImageBitmap sont refusés : on force le chargeur de textures classique (balise <img>)
      const cib = self.createImageBitmap; try { self.createImageBitmap = undefined; } catch (e) { /* rien */ }
      const restore = () => { try { self.createImageBitmap = cib; } catch (e) { /* rien */ } };
      new GLTFLoader().load(URL, (g) => {
        restore();
        try {
          const model = g.scene; const holder = new THREE.Group(); holder.add(model); scene.add(holder);
          model.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; if (o.material) { o.material.side = THREE.FrontSide; o.material.metalness = 0; o.material.roughness = 0.78; } } });
          const mixer = new THREE.AnimationMixer(model);
          const actions = {}; g.animations.forEach((c) => { actions[c.name] = mixer.clipAction(c); });
          // louche en bois tenue dans la main droite (visible seulement quand elle remue)
          let ladle = null; const hand = model.getObjectByName('RightHand');
          if (hand) {
            const ws = new THREE.Vector3(); hand.getWorldScale(ws);
            ladle = new THREE.Group(); const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.8 });
            const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.1, 8), wood); stick.position.y = 0.45;
            const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), wood); bowl.position.y = 1.0; bowl.rotation.x = Math.PI;
            ladle.add(stick, bowl); ladle.scale.setScalar(100); ladle.visible = false; hand.add(ladle);
            ladle.userData.hand = hand;
          }
          st = { ladle, r, scene, cam, holder, mixer, actions, rim, key, hemi, cur: null, curName: '', yaw: 0.3, yawT: 0.3, visible: true, acc: 0 };
          resolve(true);
        } catch (e) { failed = true; resolve(false); }
      }, undefined, () => { restore(); failed = true; resolve(false); });
    } catch (e) { failed = true; resolve(false); }
  });
  return loading;
}

export function canvas() { return st ? st.r.domElement : null; }
export function tint(hex) { if (!st || !hex) return; st.rim.color.set(hex); st.hemi.color.set(new THREE.Color(hex).lerp(new THREE.Color(0xffffff), 0.7)); }

// joue une animation par nom (fondu enchaîné), avec vitesse et option « une seule fois »
export function play(name, { speed = 1, once = false, fade = 0.22 } = {}) {
  if (!st || !st.actions[name]) return;
  if (st.curName === name && !once) { st.cur.timeScale = speed; return; }
  const a = st.actions[name];
  a.reset(); a.enabled = true; a.timeScale = speed;
  a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity); a.clampWhenFinished = once;
  if (st.cur && st.cur !== a) { a.crossFadeFrom(st.cur, fade, false); }
  a.play(); st.cur = a; st.curName = name;
}
export function playPose(p) {
  const c = CLIP[p]; if (!c) return;
  play(c[0], { speed: c[1] || 1, once: !!c[2] });
}
export function current() { return st ? st.curName : ''; }
export function setYaw(y, snap) { if (!st) return; st.yawT = y; if (snap) st.yaw = y; }
export function setVisible(v) { if (st) st.visible = v; }

// avance l'animation et dessine (appelé à chaque image par la salle)
export function frame(dt) {
  if (!st || !st.visible) return;
  st.mixer.update(dt);
  st.acc += dt; if (st.acc < 1 / 32 && !st.once) return; st.acc = 0;
  let d = st.yawT - st.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
  st.yaw += d * Math.min(1, dt * 11);
  st.holder.rotation.y = st.yaw;
  if (st.ladle && st.ladle.visible) {
    // la louche pointe toujours vers le haut/devant (dans la marmite) et ballotte en rythme
    st.t = (st.t || 0) + dt; const h = st.ladle.userData.hand;
    st.holder.updateMatrixWorld(true);
    const qh = h.getWorldQuaternion(new THREE.Quaternion()).invert();
    const d = new THREE.Vector3(0.42 + Math.sin(st.t * 7) * 0.12, 0.9, Math.cos(st.t * 7) * 0.18).normalize();
    st.ladle.quaternion.copy(qh).multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d));
  }
  st.r.render(st.scene, st.cam);
}

export function prop(v) { if (st && st.ladle) st.ladle.visible = !!v; }
