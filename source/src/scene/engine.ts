import * as THREE from 'three';
import { REALMS, dockOf, realmById, type Realm, type RealmId } from './realms';
import { makeSky, makeSea, makeClouds, makeFireflies, makePath, makeMimi, makeHero, type Animated, type HeroLook, type HeroRig } from './models';
import { buildIsland } from './islands';
import { labelTex } from './tex';

export interface EngineOpts { canvas: HTMLCanvasElement; reduceMotion: boolean; onSelect: (id: RealmId | null) => void }
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export interface Shot { pos: THREE.Vector3; look: THREE.Vector3 }

interface Tween { fp: THREE.Vector3; fl: THREE.Vector3; tp: THREE.Vector3; tl: THREE.Vector3; t0: number; dur: number; res: () => void }
type Mode = 'tween' | 'overview' | 'follow' | 'hold';

export class MapEngine {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(42, 1, 0.5, 900);
  private items: Animated[] = [];
  private islands = new Map<RealmId, { realm: Realm; label: THREE.Sprite; hit: THREE.Mesh; sub: string }>();
  private hero: HeroRig;
  private mimi: ReturnType<typeof makeMimi>;
  private marker!: THREE.Mesh;
  private curve: THREE.CatmullRomCurve3;
  private u = new Map<RealmId, number>();
  private heroU = 0;
  heroAt: RealmId = 1;
  private walking: { from: number; to: number; t: number; dur: number; res: () => void } | null = null;
  private mode: Mode = 'overview';
  private camPos = new THREE.Vector3(); private camLook = new THREE.Vector3();
  private tw: Tween | null = null;
  private pan = 0; private panTarget = 0;
  private mimiMode: 'follow' | 'show' = 'follow';
  private raf = 0; private last = 0; private time = 0;
  private slow = 0; private frames = 0; private dpr: number;
  private ray = new THREE.Raycaster(); private ptr = new THREE.Vector2();
  private down: { x: number; y: number; t: number } | null = null;
  private panStart = 0;
  private disposed = false;
  private ro: ResizeObserver;
  private cleanup: Array<() => void> = [];

  constructor(private o: EngineOpts) {
    this.renderer = new THREE.WebGLRenderer({ canvas: o.canvas, antialias: true, powerPreference: 'high-performance', alpha: false });
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.scene.fog = new THREE.Fog('#6a45b0', 110, 360);
    this.scene.background = new THREE.Color('#2a1a6a');
    // lumières : ciel violet, soleil couchant doré, contre-jour rose
    this.scene.add(new THREE.HemisphereLight('#d6c8ff', '#5a3f9a', 1.5));
    const sun = new THREE.DirectionalLight('#ffd9a0', 2.1); sun.position.set(40, 55, 35); this.scene.add(sun);
    const rim = new THREE.DirectionalLight('#ff7fb0', 0.9); rim.position.set(-45, 25, -40); this.scene.add(rim);

    const sky = makeSky(); this.add(sky); this.add(makeSea()); this.add(makeClouds()); this.add(makeFireflies());
    // îles
    for (const r of REALMS) {
      const isl = buildIsland(r); isl.group.position.set(r.pos[0], r.y, r.pos[1]); this.add(isl);
      const baseY = r.y; const phase = r.id * 1.7;
      const prev = isl.update; isl.update = (t, dt) => { isl.group.position.y = baseY + Math.sin(t * 0.7 + phase) * 0.28; prev(t, dt); };
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex(r.name, '', r.color), transparent: true, depthTest: false, depthWrite: false, fog: false }));
      label.renderOrder = 20; label.position.set(r.pos[0], r.y - r.R * 0.55 - 1.5, r.pos[1] + r.R * 0.95); this.scene.add(label);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(r.R * 1.15, 10, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(r.pos[0], r.y + 2.5, r.pos[1]); hit.userData.realm = r.id; this.scene.add(hit);
      this.islands.set(r.id, { realm: r, label, hit, sub: '' });
    }
    // chemin lumineux passant par l'« accueil » de chaque île
    const docks = REALMS.map((r) => new THREE.Vector3(...dockOf(r)));
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < docks.length; i++) {
      pts.push(docks[i]);
      if (i < 4) { const a = docks[i], b = docks[i + 1]; const m = a.clone().add(b).multiplyScalar(0.5); m.y += 1.3; m.z += i % 2 ? -2.5 : 3; pts.push(m); }
      else if (i === 4) { pts.push(new THREE.Vector3(31.5, 2.5, 2), new THREE.Vector3(29.5, 4.2, -11), new THREE.Vector3(16, 5, -20.5)); }
    }
    const p = makePath(pts); this.curve = p.curve; this.add(p.anim);
    const N = 900; const samples = this.curve.getSpacedPoints(N);
    for (const r of REALMS) { const d = docks[r.id - 1]; let bi = 0, bd = 1e9; samples.forEach((s, i) => { const dd = s.distanceToSquared(d); if (dd < bd) { bd = dd; bi = i; } }); this.u.set(r.id, bi / N); }
    // héroïne et Mimi
    this.hero = makeHero({ skin: '#f2c6a0', hair: '#3b2418', style: 'long' }, '#7b4dff', 'aucun'); this.add(this.hero);
    this.mimi = makeMimi(); this.add(this.mimi);
    this.marker = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.35, 28), new THREE.MeshBasicMaterial({ color: '#ffe27a', transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false })); this.marker.rotation.x = -Math.PI / 2; this.scene.add(this.marker);
    this.placeHero(1);
    // caméra
    const s = this.overviewShot(); this.camPos.copy(s.pos); this.camLook.copy(s.look);
    this.resize();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(o.canvas.parentElement ?? o.canvas);
    this.bindPointer();
    const lost = (e: Event) => e.preventDefault(); o.canvas.addEventListener('webglcontextlost', lost); this.cleanup.push(() => o.canvas.removeEventListener('webglcontextlost', lost));
    this.last = performance.now(); this.loop = this.loop.bind(this); this.raf = requestAnimationFrame(this.loop);
  }

  private add(a: Animated) { this.scene.add(a.group); this.items.push(a); }

  /* ----- configuration ----- */
  setHero(look: HeroLook, outfit: string, acc: string) { this.hero.restyle(look, outfit, acc); }
  setProgress(sub: Record<number, string>) {
    for (const [id, isl] of this.islands) { const s = sub[id] ?? ''; if (s === isl.sub) continue; isl.sub = s; const old = (isl.label.material as THREE.SpriteMaterial).map; (isl.label.material as THREE.SpriteMaterial).map = labelTex(isl.realm.name, s, isl.realm.color); (isl.label.material as THREE.SpriteMaterial).needsUpdate = true; old?.dispose(); }
  }
  setReduce(v: boolean) { this.o.reduceMotion = v; }
  heroMood(m: 'idle' | 'cheer') { this.hero.setMood(m); }
  mimiLook(m: 'happy' | 'wow' | 'think') { this.mimi.setMood(m); }
  setMimiMode(m: 'follow' | 'show') { this.mimiMode = m; }

  /* ----- cadrages ----- */
  private get aspect() { return this.camera.aspect; }
  overviewShot(): Shot {
    const a = this.aspect; const halfW = a >= 1.05 ? 37 : clamp(37 * a, 17, 37);
    const t = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const d = Math.max(halfW / (t * a), 33 / t);
    const look = new THREE.Vector3(2 + this.pan, 4, -6);
    const dir = new THREE.Vector3(0, Math.sin(0.62), Math.cos(0.62));
    return { pos: look.clone().add(dir.multiplyScalar(d)), look };
  }
  /** Cadrage rapproché d'une île (le centre est remonté pour laisser la place à la carte d'information). */
  closeShot(id: RealmId, side = 0): Shot {
    const r = realmById(id); const k = clamp(1 / Math.sqrt(Math.min(1.1, this.aspect)), 0.95, 1.7);
    const c = new THREE.Vector3(r.pos[0], r.y, r.pos[1]);
    const look = c.clone().add(new THREE.Vector3(0, r.id === 6 ? 2.6 : 1.6, r.R * 0.5));
    const d = (r.R * 3.0 + 9) * k; const pitch = 0.5;
    return { pos: look.clone().add(new THREE.Vector3(side * 6 * k, Math.sin(pitch) * d, Math.cos(pitch) * d)), look };
  }
  heroShot(): Shot {
    const h = this.hero.group.position; const k = clamp(1 / Math.sqrt(Math.min(1.1, this.aspect)), 0.95, 1.5);
    return { pos: h.clone().add(new THREE.Vector3(2, 8, 17).multiplyScalar(k)), look: h.clone().add(new THREE.Vector3(0, 2.2, 0)) };
  }
  farShot(): Shot { return { pos: new THREE.Vector3(-30, 60, 120), look: new THREE.Vector3(0, 6, -10) }; }

  /* ----- caméra : mouvements ----- */
  private finishTween() { const t = this.tw; if (!t) return; this.tw = null; t.res(); }
  flyTo(s: Shot, dur: number): Promise<void> {
    this.finishTween();
    if (this.o.reduceMotion) dur = Math.min(dur, 0.25);
    return new Promise((res) => { this.tw = { fp: this.camPos.clone(), fl: this.camLook.clone(), tp: s.pos.clone(), tl: s.look.clone(), t0: this.time, dur, res }; this.mode = 'tween'; });
  }
  cutTo(s: Shot) { this.finishTween(); this.camPos.copy(s.pos); this.camLook.copy(s.look); this.mode = 'hold'; }
  async toOverview(dur = 1.6) { this.pan = 0; this.panTarget = 0; await this.flyTo(this.overviewShot(), dur); if (this.mode === 'hold') this.mode = 'overview'; }
  setOverviewMode() { this.mode = 'overview'; }
  /** Termine tout de suite les mouvements en cours (bouton « Passer »). */
  abort() { this.finishTween(); if (this.walking) { const w = this.walking; this.walking = null; this.placeHero(this.heroAt); this.hero.moving = false; w.res(); } }

  /* ----- héroïne ----- */
  private placeHero(id: RealmId) {
    this.heroAt = id; this.heroU = this.u.get(id)!; const p = this.curve.getPointAt(this.heroU); this.hero.group.position.copy(p); this.hero.group.position.y += 0.02;
    this.hero.group.rotation.y = 0.35; this.hero.moving = false;
  }
  teleportHero(id: RealmId) { this.placeHero(id); }
  walkTo(id: RealmId): Promise<void> {
    if (id === this.heroAt && !this.walking) return Promise.resolve();
    const to = this.u.get(id)!; if (this.o.reduceMotion) { this.placeHero(id); return Promise.resolve(); }
    const len = this.curve.getLength(); const from = this.heroU; const dur = clamp((Math.abs(to - from) * len) / 11, 0.6, 8);
    this.heroAt = id; this.hero.moving = true; this.hero.setMood('idle'); this.mode = 'follow';
    return new Promise((res) => { this.walking = { from, to, t: 0, dur, res }; });
  }

  /* ----- saisie ----- */
  private bindPointer() {
    const c = this.o.canvas;
    const dn = (e: PointerEvent) => { this.down = { x: e.clientX, y: e.clientY, t: performance.now() }; this.panStart = this.panTarget; c.setPointerCapture?.(e.pointerId); };
    const mv = (e: PointerEvent) => {
      if (!this.down || this.mode !== 'overview') return; const dx = e.clientX - this.down.x;
      if (Math.abs(dx) > 8 && this.aspect < 1.05) { const w = c.clientWidth || 1; this.panTarget = clamp(this.panStart - (dx / w) * 40, -16, 16); }
    };
    const up = (e: PointerEvent) => {
      const d = this.down; this.down = null; if (!d) return;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 || performance.now() - d.t > 600) return;
      const r = c.getBoundingClientRect(); this.ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this.ray.setFromCamera(this.ptr, this.camera);
      const hits = this.ray.intersectObjects([...this.islands.values()].map((i) => i.hit), false);
      this.o.onSelect(hits.length ? (hits[0].object.userData.realm as RealmId) : null);
    };
    c.addEventListener('pointerdown', dn); c.addEventListener('pointermove', mv); c.addEventListener('pointerup', up);
    this.cleanup.push(() => { c.removeEventListener('pointerdown', dn); c.removeEventListener('pointermove', mv); c.removeEventListener('pointerup', up); });
  }

  /* ----- boucle ----- */
  private resize() {
    const el = this.o.canvas.parentElement ?? this.o.canvas; const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }
  private loop(now: number) {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; this.time += dt;
    // qualité adaptative : si l'appareil peine, on baisse la définition
    if (++this.frames > 40) { if (dt > 0.034) this.slow++; else this.slow = Math.max(0, this.slow - 1); if (this.slow > 30 && this.dpr > 1) { this.dpr = Math.max(1, this.dpr - 0.5); this.renderer.setPixelRatio(this.dpr); this.resize(); this.slow = 0; } }
    const t = this.time;
    for (const it of this.items) it.update(t, dt);
    // marche
    if (this.walking) {
      const w = this.walking; w.t += dt; const k = clamp(w.t / w.dur, 0, 1); const e = easeInOut(k); this.heroU = w.from + (w.to - w.from) * e;
      const p = this.curve.getPointAt(clamp(this.heroU, 0, 1)); const q = this.curve.getPointAt(clamp(this.heroU + Math.sign(w.to - w.from) * 0.004, 0, 1));
      this.hero.group.position.copy(p); this.hero.group.position.y += 0.02;
      const yaw = Math.atan2(q.x - p.x, q.z - p.z); let dy = yaw - this.hero.group.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.hero.group.rotation.y += dy * Math.min(1, dt * 8);
      if (k >= 1) { this.walking = null; this.hero.moving = false; w.res(); }
    } else if (!this.hero.moving) { let dy = 0.3 - this.hero.group.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.hero.group.rotation.y += dy * Math.min(1, dt * 4); }
    // Mimi
    const mp = this.mimi.group.position;
    if (this.mimiMode === 'show') {
      const fwd = new THREE.Vector3(); this.camera.getWorldDirection(fwd); const right = new THREE.Vector3().crossVectors(fwd, this.camera.up).normalize(); const up = new THREE.Vector3().crossVectors(right, fwd).normalize();
      const d = 11; const hx = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * d;
      const tgt = this.camera.position.clone().add(fwd.multiplyScalar(d)).add(right.multiplyScalar(-hx * Math.min(1.4, this.aspect) * 0.62)).add(up.multiplyScalar(-hx * 0.36 + Math.sin(t * 1.6) * 0.25));
      mp.lerp(tgt, 1 - Math.exp(-dt * 5)); this.mimi.group.scale.setScalar(1.55);
    } else {
      const hp = this.hero.group.position; const tgt = new THREE.Vector3(hp.x + Math.cos(t * 0.8) * 1.9, hp.y + 3.6 + Math.sin(t * 1.5) * 0.35, hp.z + Math.sin(t * 0.8) * 1.2 + 0.6);
      mp.lerp(tgt, 1 - Math.exp(-dt * 3.5)); this.mimi.group.scale.setScalar(THREE.MathUtils.lerp(this.mimi.group.scale.x, 0.85, dt * 4));
    }
    this.mimi.group.lookAt(this.camera.position);
    this.marker.position.set(this.hero.group.position.x, this.hero.group.position.y + 0.12, this.hero.group.position.z); this.marker.scale.setScalar(1 + (Math.sin(t * 3) * 0.5 + 0.5) * 0.35); (this.marker.material as THREE.MeshBasicMaterial).opacity = this.hero.moving ? 0.2 : 0.55 + Math.sin(t * 3) * 0.25;
    // caméra
    if (this.mode === 'tween' && this.tw) {
      const w = this.tw; const k = clamp((t - w.t0) / w.dur, 0, 1); const e = easeInOut(k);
      this.camPos.lerpVectors(w.fp, w.tp, e); this.camLook.lerpVectors(w.fl, w.tl, e);
      if (k >= 1) { this.tw = null; this.mode = 'hold'; w.res(); }
    } else if (this.mode === 'follow') {
      const s = this.heroShot(); const f = 1 - Math.exp(-dt * 3.2); this.camPos.lerp(s.pos, f); this.camLook.lerp(s.look, f);
    } else if (this.mode === 'overview') {
      this.pan += (this.panTarget - this.pan) * (1 - Math.exp(-dt * 6)); const s = this.overviewShot(); const f = 1 - Math.exp(-dt * 4); this.camPos.lerp(s.pos, f); this.camLook.lerp(s.look, f);
    }
    const sway = this.o.reduceMotion ? 0 : 1;
    this.camera.position.set(this.camPos.x + Math.sin(t * 0.21) * 0.5 * sway, this.camPos.y + Math.sin(t * 0.17) * 0.35 * sway, this.camPos.z);
    this.camera.lookAt(this.camLook);
    // étiquettes : taille constante à l'écran
    for (const i of this.islands.values()) { const d = this.camera.position.distanceTo(i.label.position); const w = clamp(d * 0.17, 6, 15); i.label.scale.set(w, w * (160 / 512), 1); (i.label.material as THREE.SpriteMaterial).opacity = clamp((d - 42) / 22, 0, 1); i.label.visible = d > 42; }
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true; cancelAnimationFrame(this.raf); this.ro.disconnect(); this.cleanup.forEach((f) => f());
    this.finishTween(); if (this.walking) { this.walking.res(); this.walking = null; }
    this.scene.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); const mat = (m as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined; if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((x) => { (x as THREE.MeshStandardMaterial).map?.dispose(); x.dispose(); }); });
    this.renderer.dispose(); this.renderer.forceContextLoss();
  }
}
