// Maissa (modèle riggé) : charge le glTF et expose un « rig » avec animations, orientation et louche.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CLIP } from './hero3d.js';

export function loadGltf(url) {
  return new Promise((resolve, reject) => {
    // en file:// les blobs d'ImageBitmap sont refusés : chargeur de textures classique
    const cib = self.createImageBitmap; try { self.createImageBitmap = undefined; } catch (e) { /* rien */ }
    const back = () => { try { self.createImageBitmap = cib; } catch (e) { /* rien */ } };
    new GLTFLoader().load(url, (g) => { back(); resolve(g); }, undefined, (e) => { back(); reject(e); });
  });
}

export class Rig {
  constructor(g, height = 1.25) {
    const model = g.scene; this.model = model; this.holder = new THREE.Group(); this.inner = new THREE.Group(); this.inner.add(model); this.holder.add(this.inner);
    this.inner.scale.setScalar(height / 1.62); this.inner.position.y = 0.04 * (height / 1.62); // le modèle mesure ~1,62 u (pieds à y ≈ -0,04)
    model.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.renderOrder = 2; if (o.material) { o.material.side = THREE.FrontSide; o.material.metalness = 0; o.material.roughness = 0.78; } } });
    this.mixer = new THREE.AnimationMixer(model); this.actions = {};
    g.animations.forEach((c) => { this.actions[c.name] = this.mixer.clipAction(c); });
    this.cur = null; this.curName = ''; this.yaw = 0.3; this.yawT = 0.3; this.t = 0;
    const hand = model.getObjectByName('RightHand');
    if (hand) {
      const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.8 });
      const ladle = new THREE.Group();
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.8, 8), wood); stick.position.y = 0.3;
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), wood); bowl.position.y = 0.72; bowl.rotation.x = Math.PI;
      ladle.add(stick, bowl); stick.renderOrder = 2; bowl.renderOrder = 2; ladle.scale.setScalar(100); ladle.visible = false; hand.add(ladle);
      this.ladle = ladle; this.hand = hand;
    }
    this.target = new THREE.Vector3(0, 0, 0);
    // os pilotés à la main (IK) : jambes, bras, colonne
    const bn = (n) => model.getObjectByName(n);
    this.B = { hips: bn('Hips'), sp: bn('Spine'),
      leg: [[bn('LeftUpLeg'), bn('LeftLeg'), bn('LeftFoot'), bn('LeftToeBase')], [bn('RightUpLeg'), bn('RightLeg'), bn('RightFoot'), bn('RightToeBase')]],
      arm: [[bn('LeftArm'), bn('LeftForeArm'), bn('LeftHand')], [bn('RightArm'), bn('RightForeArm'), bn('RightHand')]] };
    this.ik = null; this.ikW = 0; this.baseY = this.inner.position.y;
  }
  // état IK : { feet:[V|null,V|null], hands:[V|null,V|null], fwd:V, lean, bob, toes } ; null = désactivé (fondu de sortie)
  setIK(s) { this.ik = s || this.ik; this.ikOn = !!s; }
  // vie du repos : respiration, regard curieux qui se tourne doucement, légère inclinaison de tête
  _life(dt) {
    this.lt = (this.lt || 0) + dt; this.lk = (this.lk || 0) - dt;
    if (this.lk <= 0) { this.lk = 2 + Math.random() * 3; this.lyT = (Math.random() - 0.5) * 0.7; this.lpT = -0.22 - Math.random() * 0.08; }
    this.ly = (this.ly || 0) + (this.lyT - (this.ly || 0)) * Math.min(1, dt * 2.2); this.lp = (this.lp || 0) + ((this.lpT || 0) - (this.lp || 0)) * Math.min(1, dt * 2.2);
    const B = this.B, n = this.nk || (this.nk = this.model.getObjectByName('neck')), h = this.hd || (this.hd = this.model.getObjectByName('Head'));
    if (B.sp) B.sp.rotateX(Math.sin(this.lt * 1.8) * 0.012);
    if (n) { n.rotateY(this.ly * 0.45); n.rotateX(this.lp * 0.5); }
    if (h) { h.rotateY(this.ly * 0.55); h.rotateX(this.lp * 0.5); }
  }
  _aim(bone, child, target) {
    const a = new THREE.Vector3(), b = new THREE.Vector3(); bone.getWorldPosition(a); child.getWorldPosition(b);
    const cur = b.sub(a).normalize(), des = target.clone().sub(a).normalize(); if (cur.lengthSq() < 1e-9 || des.lengthSq() < 1e-9) return;
    const dq = new THREE.Quaternion().setFromUnitVectors(cur, des), wq = bone.getWorldQuaternion(new THREE.Quaternion()), pq = bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
    bone.quaternion.copy(pq.multiply(dq.multiply(wq))); bone.updateMatrixWorld(true);
  }
  _two(chain, target, pole) {
    const [r, m, e] = chain, R = new THREE.Vector3(), M = new THREE.Vector3(), E = new THREE.Vector3();
    r.getWorldPosition(R); m.getWorldPosition(M); e.getWorldPosition(E);
    const l1 = R.distanceTo(M), l2 = M.distanceTo(E), v = target.clone().sub(R); let d = v.length(); const a = v.clone().normalize();
    d = Math.min(Math.max(d, Math.abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3);
    const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d), y = Math.sqrt(Math.max(0, l1 * l1 - x * x));
    const pn = pole.clone().addScaledVector(a, -pole.dot(a)).normalize();
    const knee = R.clone().addScaledVector(a, x).addScaledVector(pn, y), end = R.clone().addScaledVector(a, d);
    this._aim(r, m, knee); this._aim(m, e, end);
  }
  _solve() {
    const s = this.ik, f = s.fwd, up = new THREE.Vector3(0, 1, 0), right = new THREE.Vector3().crossVectors(f, up).normalize();
    const saved = []; const keep = (b) => saved.push([b, b.quaternion.clone()]);
    this.holder.updateMatrixWorld(true);
    if (this.B.sp) { keep(this.B.sp); this.B.sp.rotateX(0); }
    s.feet && [0, 1].forEach((j) => {
      const t = s.feet[j]; if (!t) return; const c = this.B.leg[j]; c.forEach(keep);
      this._two(c.slice(0, 3), t, f.clone().addScaledVector(up, 0.15));
      if (c[3]) { const fp = t.clone(); this._aim(c[2], c[3], fp.addScaledVector(f, 0.12).addScaledVector(up, s.toeUp || 0)); }
    });
    s.hands && [0, 1].forEach((j) => {
      const t = s.hands[j]; if (!t) return; const c = this.B.arm[j]; c.forEach(keep);
      const side = j === 0 ? -1 : 1;
      this._two(c, t, right.clone().multiplyScalar(side * 0.8).addScaledVector(up, -0.6).addScaledVector(f, s.elbowF == null ? -0.3 : s.elbowF));
    });
    return saved;
  }
  play(name, { speed = 1, once = false, fade = 0.22 } = {}) {
    const a = this.actions[name]; if (!a) return;
    if (this.curName === name && !once) { this.cur.timeScale = name === 'idle' ? 0 : speed; return; }
    a.reset(); a.enabled = true; a.timeScale = speed; if (name === 'idle') { a.timeScale = 0; a.time = 3.0; } // repos : posture droite figée (le cycle d'origine la fait tourner et chercher par terre)
    a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity); a.clampWhenFinished = once;
    if (this.cur && this.cur !== a) a.crossFadeFrom(this.cur, fade, false);
    a.play(); this.cur = a; this.curName = name;
  }
  playPose(p) { const c = CLIP[p]; if (c) this.play(c[0], { speed: c[1] || 1, once: !!c[2] }); }
  setYaw(y, snap) { this.yawT = y; if (snap) this.yaw = y; }
  prop(v) { if (this.ladle) this.ladle.visible = !!v; }
  update(dt) {
    // repos figé : on fait osciller très légèrement le temps pour que le mélangeur réécrive les os à chaque image (sinon nos retouches s'accumulent)
    if (this.curName === 'idle' && this.cur) this.cur.time = 3.0 + Math.sin((this.lt || 0) * 1.7) * 0.03;
    this.mixer.update(dt);
    if (this.curName === 'idle' && !this.ik) this._life(dt);
    let d = this.yawT - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    this.yaw += d * Math.min(1, dt * 11); this.inner.rotation.order = 'YXZ'; this.yo = (this.yo || 0) + ((this.curName === 'idle' ? (this.idleOff ?? 0.75) : 0) - (this.yo || 0)) * Math.min(1, dt * 6); this.inner.rotation.y = this.yaw + this.yo;
    this.ikW += ((this.ikOn ? 1 : 0) - this.ikW) * Math.min(1, dt * 9); if (!this.ikOn && this.ikW < 0.02) { this.ikW = 0; this.ik = null; }
    if (this.ik) {
      const s = this.ik; this.inner.rotation.x = (s.lean || 0) * this.ikW;
      this.inner.position.y = this.baseY + (s.bob || 0) * this.ikW; this.holder.updateMatrixWorld(true);
      const pre = [], all = [...this.B.leg.flat(), ...this.B.arm.flat()].filter(Boolean); all.forEach((b) => pre.push(b.quaternion.clone()));
      this._solve();
      if (this.ikW < 0.999) all.forEach((b, i) => b.quaternion.slerpQuaternions(pre[i], b.quaternion.clone(), this.ikW));
      this.holder.updateMatrixWorld(true);
    } else { this.inner.rotation.x = 0; this.inner.position.y = this.baseY; }
    if (this.ladle && this.ladle.visible) {
      this.t += dt; this.holder.updateMatrixWorld(true);
      const qh = this.hand.getWorldQuaternion(new THREE.Quaternion()).invert();
      let dir = new THREE.Vector3(0.42 + Math.sin(this.t * 7) * 0.12, 0.9, Math.cos(this.t * 7) * 0.18).normalize();
      if (this.ik && this.ik.tip) { // la louche plonge jusqu'au point visé dans le chaudron
        const hp = this.hand.getWorldPosition(new THREE.Vector3()), v = this.ik.tip.clone().sub(hp), ws = this.hand.getWorldScale(new THREE.Vector3()).x;
        dir = v.clone().normalize(); this.ladle.scale.setScalar(Math.max(0.2, v.length() / (0.78 * ws)));
        this.ladle.quaternion.copy(qh).multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
      } else { this.ladle.scale.setScalar(100); this.ladle.quaternion.copy(qh).multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)); }
    }
  }
}
