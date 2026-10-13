import * as THREE from 'three';
import { M, std, glowMat, jitter, mulberry, type Animated } from './models';
import { cubeFaceTex, symbolTex, pageTex, clockTex, rulerTex, glowSprite } from './tex';
import type { Realm } from './realms';

type Island = Animated & { top: THREE.Object3D };

/** Socle commun : roche flottante, dessus herbeux, stalactites, petits rochers en orbite. */
function base(R: number, grass: string, rock: string, seed: number) {
  const g = new THREE.Group(); const r = mulberry(seed);
  const under = M(jitter(new THREE.CylinderGeometry(R * 0.98, R * 0.1, R * 1.7, 10, 4), R * 0.2), std(rock), 0, -R * 0.85 - 0.45, 0);
  const lip = M(jitter(new THREE.CylinderGeometry(R * 1.0, R * 0.97, 0.55, 10, 1), R * 0.06, 0.04), std(new THREE.Color(rock).lerp(new THREE.Color('#ffffff'), 0.18)), 0, -0.55, 0);
  const top = M(jitter(new THREE.CylinderGeometry(R * 0.93, R, 0.9, 10, 1), R * 0.05, 0), std(grass), 0, -0.45, 0);
  g.add(under, lip, top);
  for (let i = 0; i < 4; i++) { const a = r() * 6.28, d = R * (0.2 + r() * 0.35); const c = M(jitter(new THREE.ConeGeometry(0.6 + r() * 0.6, 2 + r() * 2.2, 6), 0.2), std(rock), Math.cos(a) * d, -R * 1.7 - 0.2 + r() * 0.8, Math.sin(a) * d); c.rotation.x = Math.PI; g.add(c); }
  const rocks: { m: THREE.Mesh; a: number; d: number; y: number; s: number }[] = [];
  for (let i = 0; i < 4; i++) { const m = M(jitter(new THREE.DodecahedronGeometry(0.5 + r() * 0.6, 0), 0.1), std(rock)); g.add(m); rocks.push({ m, a: r() * 6.28, d: R * (1.15 + r() * 0.25), y: -1 - r() * 3.5, s: 0.15 + r() * 0.2 }); }
  return { g, r, tick: (t: number) => { for (const k of rocks) { const a = k.a + t * k.s * 0.3; k.m.position.set(Math.cos(a) * k.d, k.y + Math.sin(t + k.a) * 0.4, Math.sin(a) * k.d); k.m.rotation.y = t * 0.4 + k.a; } } };
}

const scl = (m: THREE.Mesh, x: number, y: number, z: number) => { m.scale.set(x, y, z); return m; };
const tree = (r: () => number, c1: string, c2: string, s = 1) => {
  const g = new THREE.Group(); g.add(M(new THREE.CylinderGeometry(0.2, 0.3, 1.2, 6), std('#6b4423'), 0, 0.6, 0));
  for (let i = 0; i < 3; i++) g.add(M(jitter(new THREE.ConeGeometry(1.5 - i * 0.35, 1.9, 7), 0.15), std(i % 2 ? c1 : c2), 0, 1.6 + i * 1.0, 0));
  g.scale.setScalar(s * (0.8 + r() * 0.5)); g.rotation.y = r() * 6; return g;
};
const plaza = (R: number, color: string) => { const p = M(new THREE.CylinderGeometry(1.7, 1.8, 0.12, 24), glowMat(color, 0.35), 0, 0.05, R * 0.62); const ring = M(new THREE.TorusGeometry(1.7, 0.07, 6, 28), glowMat(color, 0.9), 0, 0.12, R * 0.62); ring.rotation.x = Math.PI / 2; return [p, ring]; };
const place = (r: () => number, R: number, minR: number, maxR: number, avoidFront = true) => {
  for (let i = 0; i < 20; i++) { const a = r() * 6.28, d = R * (minR + r() * (maxR - minR)); const x = Math.cos(a) * d, z = Math.sin(a) * d; if (!avoidFront || z < R * 0.28) return [x, z] as const; }
  return [-R * 0.6, -R * 0.2] as const;
};

/* ---------------- 1. Royaume des Nombres ---------------- */
function nombres(R: number): Island {
  const b = base(R, '#e9c46a', '#8a5a2b', 11); const g = b.g; const r = b.r;
  g.add(...plaza(R, '#ffd23f'));
  const pyr = M(jitter(new THREE.ConeGeometry(3.6, 5, 4), 0.05), std('#f2a900'), -0.6, 2.5, -1.8); pyr.rotation.y = Math.PI / 4; g.add(pyr);
  const stripe = M(new THREE.ConeGeometry(2.0, 2.8, 4), std('#ffd23f'), -0.6, 3.85, -1.8); stripe.rotation.y = Math.PI / 4; stripe.scale.set(1.01, 1.0, 1.01); g.add(stripe);
  const cap = M(new THREE.OctahedronGeometry(0.55, 0), glowMat('#fff3a0', 1.2), -0.6, 5.5, -1.8); g.add(cap); const capGlow = glowSprite('#ffe27a', 4); capGlow.position.copy(cap.position); g.add(capGlow);
  // dragon doré, assis à droite de la pyramide
  const dr = new THREE.Group(); dr.position.set(3.0, 0, -0.8); dr.rotation.y = -0.7; g.add(dr);
  const gold = std('#ffb300', { roughness: 0.55 }), gold2 = std('#ffd54a');
  const bodyM = M(new THREE.SphereGeometry(1.0, 14, 10), gold, 0, 1.25, 0); bodyM.scale.set(1.4, 1.0, 1.0); dr.add(bodyM);
  dr.add(scl(M(new THREE.SphereGeometry(0.75, 12, 8), gold2, 0.1, 1.05, 0.42), 1.2, 0.9, 0.55));
  const neck = M(new THREE.CylinderGeometry(0.34, 0.55, 1.3, 8), gold, 1.0, 2.0, 0); neck.rotation.z = -0.5; dr.add(neck);
  const head = new THREE.Group(); head.position.set(1.55, 2.75, 0); dr.add(head);
  head.add(M(new THREE.SphereGeometry(0.6, 12, 10), gold, 0, 0, 0)); head.add(M(new THREE.BoxGeometry(0.7, 0.36, 0.5), gold2, 0.55, -0.12, 0));
  for (const s of [-1, 1]) { head.add(M(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshBasicMaterial({ color: '#2a1500' }), 0.25, 0.18, s * 0.36)); const h = M(new THREE.ConeGeometry(0.12, 0.55, 5), std('#fff0c0'), -0.15, 0.62, s * 0.3); h.rotation.z = 0.5; head.add(h); }
  for (const s of [-1, 1]) { const leg = M(new THREE.CylinderGeometry(0.2, 0.26, 0.9, 6), gold, 0.6, 0.42, s * 0.55); dr.add(leg); const leg2 = M(new THREE.CylinderGeometry(0.2, 0.26, 0.9, 6), gold, -0.7, 0.42, s * 0.55); dr.add(leg2); }
  const tail: THREE.Mesh[] = []; for (let i = 0; i < 6; i++) { const t = M(new THREE.SphereGeometry(0.62 - i * 0.08, 8, 6), i % 2 ? gold : gold2, -1.3 - i * 0.62, 0.6 + Math.sin(i * 0.7) * 0.2, 0); dr.add(t); tail.push(t); }
  dr.add(M(new THREE.ConeGeometry(0.28, 0.6, 4), glowMat('#ff6b3d', 0.6), -1.3 - 6 * 0.62, 0.6, 0).rotateZ(Math.PI / 2));
  const wingShape = new THREE.Shape(); wingShape.moveTo(0, 0); wingShape.lineTo(-0.6, 2.2); wingShape.lineTo(0.5, 1.5); wingShape.lineTo(1.3, 2.4); wingShape.lineTo(1.6, 0.8); wingShape.lineTo(0.9, 0);
  const wings: THREE.Mesh[] = [];
  for (const s of [-1, 1]) { const w = M(new THREE.ShapeGeometry(wingShape), new THREE.MeshStandardMaterial({ color: '#ff9a1f', side: THREE.DoubleSide, flatShading: true, roughness: 0.7 }), -0.1, 1.9, s * 0.5); w.rotation.y = s * Math.PI / 2; dr.add(w); wings.push(w); }
  // cubes de nombres en orbite
  const faces = ['7', '×', '12', '÷', '+', '3', '100', '0,5', '=', '−', '9', '25'];
  const mats = faces.map((f, i) => new THREE.MeshStandardMaterial({ map: cubeFaceTex(f, ['#fff3c4', '#ffe0a3', '#ffd0a0'][i % 3], ['#c2410c', '#9a3412', '#b45309'][i % 3]), roughness: 0.5 }));
  const cubes: { m: THREE.Mesh; a: number; y: number; sp: number }[] = [];
  for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.15, 1.15), [0, 1, 2, 3, 4, 5].map((k) => mats[(i * 2 + k * 5) % mats.length])); g.add(m); cubes.push({ m, a: (i / 8) * 6.28, y: 3.2 + (i % 3) * 1.1, sp: 0.18 + (i % 2) * 0.06 }); }
  for (let i = 0; i < 5; i++) { const [x, z] = place(r, R, 0.55, 0.9); const c = M(new THREE.OctahedronGeometry(0.5 + r() * 0.5, 0), glowMat(['#ffd23f', '#ffb347', '#fff1a8'][i % 3], 0.7), x, 0.7, z); c.scale.y = 1.6; g.add(c); }
  for (let i = 0; i < 4; i++) { const [x, z] = place(r, R, 0.6, 0.9); const k = new THREE.Group(); k.add(M(new THREE.CylinderGeometry(0.22, 0.26, 1.5, 6), std('#4a9e5c'), 0, 0.75, 0)); const arm = M(new THREE.CylinderGeometry(0.14, 0.16, 0.7, 6), std('#4a9e5c'), 0.4, 0.95, 0); k.add(arm); k.position.set(x, 0, z); g.add(k); }
  return { group: g, top: g, update: (t) => {
    b.tick(t); cap.rotation.y = t; cap.position.y = 5.5 + Math.sin(t * 2) * 0.15; capGlow.position.y = cap.position.y;
    for (const c of cubes) { const a = c.a + t * c.sp; c.m.position.set(-0.6 + Math.cos(a) * 5.0, c.y + Math.sin(t * 1.3 + c.a) * 0.35, -1.8 + Math.sin(a) * 4.3); c.m.rotation.x = t * 0.4 + c.a; c.m.rotation.y = t * 0.5; }
    wings.forEach((w, i) => { w.rotation.z = Math.sin(t * 2.6) * 0.35 * (i ? -1 : 1) - 0.1; }); head.rotation.z = Math.sin(t * 1.4) * 0.08; tail.forEach((m, i) => { m.position.y = 0.6 + Math.sin(t * 2 - i * 0.6) * 0.18; m.position.z = Math.sin(t * 1.6 - i * 0.5) * 0.28; });
  } };
}

/* ---------------- 2. Forêt des Mots ---------------- */
function mots(R: number): Island {
  const b = base(R, '#4fbf6a', '#5a3d2a', 22); const g = b.g; const r = b.r;
  g.add(...plaza(R, '#8cff9e'));
  for (let i = 0; i < 12; i++) { const [x, z] = place(r, R, 0.5, 0.92); const t = tree(r, '#2f9e5a', '#45b86e', 1.0); t.position.set(x, 0, z); g.add(t); if (i % 3 === 0) { const f = M(new THREE.SphereGeometry(0.2, 8, 6), glowMat('#ffe27a', 1), x + 0.6, 2.2, z + 0.4); g.add(f); } }
  // livre géant ouvert
  const book = new THREE.Group(); book.position.set(0, 1.0, -1.6); g.add(book);
  const pg = pageTex();
  for (const s of [-1, 1]) { const p = M(new THREE.BoxGeometry(3.2, 0.18, 2.4), [std('#fff6df'), std('#fff6df'), new THREE.MeshStandardMaterial({ map: pg, roughness: 0.9 }), std('#e6d3a8'), std('#fff6df'), std('#fff6df')], s * 1.65, 0.1, 0); p.rotation.z = s * -0.14; p.rotation.x = 0; book.add(p); const cover = M(new THREE.BoxGeometry(3.4, 0.14, 2.6), std('#b4402a'), s * 1.7, -0.06, 0); cover.rotation.z = s * -0.14; book.add(cover); }
  book.add(M(new THREE.CylinderGeometry(0.16, 0.16, 2.5, 8), std('#8a2d1a'), 0, 0.0, 0).rotateX(Math.PI / 2));
  const bg = glowSprite('#9cffb0', 7, 0.45); bg.position.set(0, 2.6, -1.6); g.add(bg);
  // lettres-lucioles
  const letters = 'ABCDEFGHJLMOPRS'.split('').concat(['é', 'è', 'ç', 'ô']);
  const lets: { s: THREE.Sprite; ph: number; x: number; z: number }[] = [];
  const cols = ['#ff8aa0', '#ffd23f', '#7be0ff', '#b69cff', '#9cffb0'];
  letters.forEach((l, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: symbolTex(l, cols[i % cols.length]), transparent: true, depthWrite: false })); s.scale.set(1.5, 1.5, 1); g.add(s); lets.push({ s, ph: i / letters.length, x: (r() - 0.5) * 4, z: -1.6 + (r() - 0.5) * 2.4 }); });
  for (let i = 0; i < 6; i++) { const [x, z] = place(r, R, 0.5, 0.9); const m = new THREE.Group(); m.add(M(new THREE.CylinderGeometry(0.12, 0.16, 0.5, 6), std('#fff'), 0, 0.25, 0)); m.add(M(new THREE.SphereGeometry(0.42, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), std('#e63946'), 0, 0.5, 0)); m.position.set(x, 0, z); g.add(m); }
  return { group: g, top: g, update: (t) => { b.tick(t); for (const l of lets) { const k = (t * 0.12 + l.ph) % 1; l.s.position.set(l.x + Math.sin(t + l.ph * 20) * 0.5, 1.8 + k * 6.5, l.z); (l.s.material as THREE.SpriteMaterial).opacity = Math.sin(k * Math.PI); } bg.material.opacity = 0.4 + Math.sin(t * 1.5) * 0.08; } };
}

/* ---------------- 3. Vallée des Grandeurs ---------------- */
function grandeurs(R: number): Island {
  const b = base(R, '#62cf96', '#46586a', 33); const g = b.g; const r = b.r;
  g.add(...plaza(R, '#7fe0ff'));
  const hill = M(new THREE.SphereGeometry(R * 0.62, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), std('#4fb98a'), 0, 0, -R * 0.38); hill.scale.set(1.1, 0.55, 0.8); g.add(hill);
  // tour de l'horloge
  const tw = new THREE.Group(); tw.position.set(-2.8, 0, -2.0); g.add(tw);
  tw.add(M(new THREE.BoxGeometry(2.4, 6.2, 2.4), std('#e6dccb'), 0, 3.1, 0)); tw.add(M(new THREE.ConeGeometry(2.0, 2.3, 4), std('#2b6cb0'), 0, 7.35, 0).rotateY(Math.PI / 4));
  const face = M(new THREE.CircleGeometry(0.98, 28), new THREE.MeshBasicMaterial({ map: clockTex() }), 0, 4.9, 1.22); tw.add(face);
  const hourH = M(new THREE.BoxGeometry(0.1, 0.5, 0.05), new THREE.MeshBasicMaterial({ color: '#1e3a5f' }), 0, 0.25, 0); const minH = M(new THREE.BoxGeometry(0.07, 0.75, 0.05), new THREE.MeshBasicMaterial({ color: '#c0392b' }), 0, 0.37, 0);
  const hp = new THREE.Group(), mp = new THREE.Group(); hp.position.set(0, 4.9, 1.27); mp.position.set(0, 4.9, 1.29); hp.add(hourH); mp.add(minH); tw.add(hp, mp);
  tw.add(M(new THREE.BoxGeometry(0.9, 1.5, 0.1), std('#5a3d2a'), 0, 0.75, 1.22));
  // portique de règles
  const rt = rulerTex(); const gate = new THREE.Group(); gate.position.set(3.1, 0, -2.6); g.add(gate);
  for (const s of [-1, 1]) { const post = M(new THREE.BoxGeometry(0.7, 5.2, 0.5), [std('#ffd23f'), std('#ffd23f'), std('#ffd23f'), std('#ffd23f'), new THREE.MeshStandardMaterial({ map: rt, roughness: 0.6 }), std('#ffd23f')], s * 2.1, 2.6, 0); gate.add(post); }
  const beam = M(new THREE.BoxGeometry(5.6, 0.7, 0.5), [std('#ffd23f'), std('#ffd23f'), std('#ffd23f'), std('#ffd23f'), new THREE.MeshStandardMaterial({ map: rt, roughness: 0.6 }), std('#ffd23f')], 0, 5.45, 0); gate.add(beam);
  gate.add(M(new THREE.OctahedronGeometry(0.4, 0), glowMat('#7fe0ff', 1), 0, 6.3, 0));
  // balance
  const sc = new THREE.Group(); sc.position.set(0.9, 0, 0.4); g.add(sc); sc.add(M(new THREE.CylinderGeometry(0.1, 0.16, 2.3, 6), std('#8a6a3a'), 0, 1.15, 0)); sc.add(M(new THREE.CylinderGeometry(0.5, 0.6, 0.15, 8), std('#8a6a3a'), 0, 0.07, 0));
  const arm = new THREE.Group(); arm.position.y = 2.3; sc.add(arm); arm.add(M(new THREE.BoxGeometry(2.8, 0.1, 0.1), std('#d8b04a')));
  const pans: THREE.Group[] = [];
  for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(s * 1.4, -0.9, 0); p.add(M(new THREE.CylinderGeometry(0.55, 0.4, 0.14, 12), std('#d8b04a'), 0, -0.35, 0)); p.add(M(new THREE.SphereGeometry(s > 0 ? 0.28 : 0.4, 8, 6), std(s > 0 ? '#e63946' : '#35b6ff'), 0, -0.1, 0)); for (const a of [-0.3, 0.3]) p.add(M(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 3), std('#8a6a3a'), a, 0.1, 0)); arm.add(p); pans.push(p); }
  // lac et pins
  g.add(scl(M(new THREE.CylinderGeometry(1.9, 1.9, 0.06, 20), glowMat('#4aa8ff', 0.35, { transparent: true, opacity: 0.9 }), -1.6, 0.04, 2.2), 1.2, 1, 0.8));
  for (let i = 0; i < 5; i++) { const [x, z] = place(r, R, 0.65, 0.92); if (Math.hypot(x + 2.8, z + 2) < 2.8 || Math.hypot(x - 3.1, z + 2.6) < 3.2) continue; const t = tree(r, '#1f8a5a', '#2fa36f', 0.8); t.position.set(x, 0, z); g.add(t); }
  return { group: g, top: g, update: (t) => { b.tick(t); mp.rotation.z = -t * 0.9; hp.rotation.z = -t * 0.075; arm.rotation.z = Math.sin(t * 1.1) * 0.12; pans.forEach((p) => { p.rotation.z = -arm.rotation.z; }); } };
}

/* ---------------- 4. Temple des Formes ---------------- */
function formes(R: number): Island {
  const b = base(R, '#d9ccff', '#3d2d73', 44); const g = b.g;
  g.add(...plaza(R, '#e0a8ff'));
  const floor = M(jitter(new THREE.CylinderGeometry(4.3, 4.5, 0.5, 6), 0.02, 0), std('#f4edff'), 0, 0.25, -1.3); g.add(floor);
  const tri = glowMat('#c46cff', 0.35);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const t = M(new THREE.CircleGeometry(1.0, 3), tri, Math.cos(a) * 2.0, 0.52, -1.3 + Math.sin(a) * 2.0); t.rotation.x = -Math.PI / 2; t.rotation.z = a; g.add(t); }
  const cols: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + Math.PI / 6; const c = M(new THREE.CylinderGeometry(0.34, 0.4, 4.0, 8), std('#efe6ff'), Math.cos(a) * 3.7, 2.5, -1.3 + Math.sin(a) * 3.7); g.add(c); cols.push(c); g.add(M(new THREE.BoxGeometry(1.0, 0.3, 1.0), std('#d9ccff'), Math.cos(a) * 3.7, 0.65, -1.3 + Math.sin(a) * 3.7)); g.add(M(new THREE.BoxGeometry(1.0, 0.3, 1.0), std('#d9ccff'), Math.cos(a) * 3.7, 4.6, -1.3 + Math.sin(a) * 3.7)); }
  const roof = M(new THREE.CylinderGeometry(0.2, 4.7, 1.6, 6), std('#b266ff'), 0, 5.65, -1.3); g.add(roof);
  const roof2 = M(new THREE.CylinderGeometry(0.0, 0.5, 0.9, 6), glowMat('#ffe27a', 0.9), 0, 6.9, -1.3); g.add(roof2);
  const shapes: { m: THREE.Mesh; a: number; r: number; y: number; sp: number }[] = [];
  const defs: [THREE.BufferGeometry, string][] = [[new THREE.TetrahedronGeometry(0.75), '#ff6b9a'], [new THREE.OctahedronGeometry(0.75), '#35d6ff'], [new THREE.BoxGeometry(1, 1, 1), '#ffd23f'], [new THREE.DodecahedronGeometry(0.75), '#6bff9c'], [new THREE.TorusGeometry(0.6, 0.22, 8, 16), '#ff9f43'], [new THREE.IcosahedronGeometry(0.75), '#b69cff'], [new THREE.ConeGeometry(0.7, 1.3, 3), '#ff7a7a']];
  defs.forEach(([geo, c], i) => { const m = M(geo, glowMat(c, 0.45)); g.add(m); shapes.push({ m, a: (i / defs.length) * 6.28, r: 2.3, y: 2.3 + (i % 2) * 0.9, sp: 0.35 }); });
  const core = glowSprite('#e8b0ff', 5, 0.5); core.position.set(0, 2.8, -1.3); g.add(core);
  return { group: g, top: g, update: (t) => { b.tick(t); for (const s of shapes) { const a = s.a + t * s.sp; s.m.position.set(Math.cos(a) * s.r, s.y + Math.sin(t * 1.5 + s.a) * 0.3, -1.3 + Math.sin(a) * s.r); s.m.rotation.x = t * 0.8 + s.a; s.m.rotation.y = t * 0.6; } roof2.rotation.y = t; (tri as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.15; core.material.opacity = 0.45 + Math.sin(t * 2.2) * 0.1; } };
}

/* ---------------- 5. Planète des Découvertes ---------------- */
function decouvertes(R: number): Island {
  const b = base(R, '#e8a0c8', '#4b3a7a', 55); const g = b.g; const r = b.r;
  g.add(...plaza(R, '#ff9ec0'));
  // observatoire
  const ob = new THREE.Group(); ob.position.set(-2.6, 0, -2.0); g.add(ob);
  ob.add(M(new THREE.CylinderGeometry(2.0, 2.2, 2.6, 12), std('#efe9ff'), 0, 1.3, 0));
  const dome = new THREE.Group(); dome.position.y = 2.6; ob.add(dome);
  dome.add(M(new THREE.SphereGeometry(2.0, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), std('#8f7bff', { metalness: 0.2 })));
  dome.add(M(new THREE.BoxGeometry(0.7, 2.2, 2.2), new THREE.MeshBasicMaterial({ color: '#16093a' }), 0, 1.0, 1.2).rotateX(-0.5));
  const tel = new THREE.Group(); tel.position.set(3.4, 0, 0.4); g.add(tel);
  tel.add(M(new THREE.CylinderGeometry(0.06, 0.1, 1.6, 4), std('#6b5a8a'), 0, 0.8, 0));
  const tube = M(new THREE.CylinderGeometry(0.28, 0.36, 2.2, 10), std('#ffcf5a'), 0, 1.9, 0); tube.rotation.z = -0.9; tel.add(tube); tel.add(M(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 10), glowMat('#9cf', 0.8), -0.85, 2.7, 0).rotateZ(-0.9));
  // fusée
  const ro = new THREE.Group(); ro.position.set(3.2, 0, -3.0); g.add(ro);
  ro.add(M(new THREE.CylinderGeometry(0.5, 0.6, 2.4, 10), std('#ffffff'), 0, 1.5, 0)); ro.add(M(new THREE.ConeGeometry(0.5, 1.0, 10), std('#ff5c7a'), 0, 3.2, 0));
  for (let i = 0; i < 3; i++) { const f = M(new THREE.BoxGeometry(0.08, 0.9, 0.7), std('#ff5c7a'), Math.cos(i * 2.09) * 0.62, 0.7, Math.sin(i * 2.09) * 0.62); f.rotation.y = -i * 2.09; ro.add(f); }
  ro.add(M(new THREE.SphereGeometry(0.2, 8, 6), glowMat('#7fe0ff', 0.9), 0, 1.9, 0.5));
  const flame = glowSprite('#ffae42', 1.6, 0.8); flame.position.set(0, 0.2, 0); ro.add(flame);
  // planète à anneaux + lune
  const pl = new THREE.Group(); pl.position.set(0.5, 8.4, -2); g.add(pl);
  pl.add(M(new THREE.SphereGeometry(1.5, 18, 12), std('#ff7aa8', { emissive: '#7a1d46', emissiveIntensity: 0.25 })));
  const ring = M(new THREE.TorusGeometry(2.5, 0.2, 3, 40), std('#ffd7e6', { emissive: '#ffb0cc', emissiveIntensity: 0.3 }), 0, 0, 0); ring.rotation.x = 1.15; ring.scale.z = 0.25; pl.add(ring);
  const moon = M(new THREE.SphereGeometry(0.45, 10, 8), std('#e8e0ff')); g.add(moon);
  const sparks: { s: THREE.Sprite; ph: number }[] = [];
  for (let i = 0; i < 14; i++) { const s = glowSprite(i % 2 ? '#fff2a8' : '#ffd0e8', 0.9 + r(), 0.9); s.position.set((r() - 0.5) * 11, 3 + r() * 8, (r() - 0.5) * 10 - 1); g.add(s); sparks.push({ s, ph: r() * 6 }); }
  for (let i = 0; i < 5; i++) { const [x, z] = place(r, R, 0.6, 0.92); const rc = M(jitter(new THREE.DodecahedronGeometry(0.4 + r() * 0.4, 0), 0.08), std('#7a6aa8'), x, 0.3, z); g.add(rc); }
  return { group: g, top: g, update: (t) => { b.tick(t); pl.rotation.y = t * 0.25; pl.position.y = 8.4 + Math.sin(t) * 0.25; moon.position.set(0.5 + Math.cos(t * 0.9) * 3.4, pl.position.y + Math.sin(t * 0.9) * 0.9, -2 + Math.sin(t * 0.9) * 3.4); dome.rotation.y = t * 0.3; flame.scale.setScalar(1.4 + Math.sin(t * 20) * 0.25); sparks.forEach((k) => { (k.s.material as THREE.SpriteMaterial).opacity = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.6 + k.ph)); }); } };
}

/* ---------------- 6. Château des Examens ---------------- */
function chateau(R: number): Island {
  const b = base(R, '#7b8ad0', '#3a2a4a', 66); const g = b.g; const r = b.r;
  g.add(...plaza(R, '#ffb36b'));
  const stone = std('#cbbcf0'), stone2 = std('#b8a8e6'), roofM = std('#ff7a2e', { emissive: '#7a2a00', emissiveIntensity: 0.2 });
  const castle = new THREE.Group(); castle.position.z = -1.8; g.add(castle);
  castle.add(M(new THREE.BoxGeometry(7.4, 4.6, 3.6), stone, 0, 2.3, 0));
  for (let i = -3; i <= 3; i++) castle.add(M(new THREE.BoxGeometry(0.7, 0.6, 0.7), stone2, i * 1.0, 4.9, 1.6));
  castle.add(M(new THREE.BoxGeometry(3.6, 7.0, 3.2), stone2, 0, 5.5, -0.4)); castle.add(M(new THREE.ConeGeometry(2.6, 3.0, 4), roofM, 0, 10.5, -0.4).rotateY(Math.PI / 4));
  const towers: THREE.Group[] = [];
  for (const [x, z] of [[-4.2, 1.3], [4.2, 1.3], [-4.2, -2.2], [4.2, -2.2]] as const) { const t = new THREE.Group(); t.position.set(x, 0, z); t.add(M(new THREE.CylinderGeometry(1.15, 1.3, 7.2, 10), stone, 0, 3.6, 0)); t.add(M(new THREE.ConeGeometry(1.6, 2.8, 10), roofM, 0, 8.6, 0)); castle.add(t); towers.push(t); }
  const gate = M(new THREE.BoxGeometry(2.0, 2.6, 0.3), new THREE.MeshBasicMaterial({ color: '#22103e' }), 0, 1.3, 1.85); castle.add(gate);
  castle.add(M(new THREE.CylinderGeometry(1.0, 1.0, 0.3, 14, 1, false, 0, Math.PI), new THREE.MeshBasicMaterial({ color: '#22103e' }), 0, 2.6, 1.85).rotateX(Math.PI / 2));
  const win = glowMat('#ffe27a', 1.2); for (const [x, y, z] of [[-2.4, 3.0, 1.82], [2.4, 3.0, 1.82], [0, 7.0, 1.2], [-1.0, 6.0, 1.2], [1.0, 6.0, 1.2]] as const) castle.add(M(new THREE.BoxGeometry(0.5, 0.9, 0.12), win, x, y, z));
  for (const t of towers) t.add(M(new THREE.BoxGeometry(0.35, 0.8, 0.1), win, 0, 5.2, 1.1));
  // marches
  for (let i = 0; i < 4; i++) g.add(M(new THREE.BoxGeometry(3.4 - i * 0.2, 0.2, 0.6), std('#e3d9ff'), 0, 0.1 + i * 0.2, R * 0.36 - i * 0.55 - 0.2).translateZ(0));
  // drapeaux
  const flags: THREE.Mesh[] = [];
  for (const t of [towers[0], towers[3]]) { t.add(M(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 4), std('#444'), 0, 11.0, 0)); const f = M(new THREE.PlaneGeometry(1.4, 0.8, 8, 1), new THREE.MeshStandardMaterial({ color: '#e63946', side: THREE.DoubleSide, flatShading: true }), 0.75, 11.5, 0); t.add(f); flags.push(f); }
  // sceau étoilé et feuilles d'examen en orbite
  const seal = M(new THREE.OctahedronGeometry(0.7, 0), glowMat('#ffe27a', 1.4), 0, 11.8, -0.4); castle.add(seal); const sg = glowSprite('#ffd23f', 9, 0.65); sg.position.set(0, 11.8, -0.4); castle.add(sg);
  const beam = M(new THREE.CylinderGeometry(0.6, 2.4, 40, 14, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.09, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 0, 30, -0.4); castle.add(beam);
  const sheets: { m: THREE.Mesh; a: number; y: number }[] = [];
  for (let i = 0; i < 7; i++) { const m = M(new THREE.BoxGeometry(0.9, 1.25, 0.04), new THREE.MeshStandardMaterial({ color: '#fffaf0', emissive: '#fff0c0', emissiveIntensity: 0.25 })); for (let l = 0; l < 4; l++) m.add(M(new THREE.BoxGeometry(0.6, 0.04, 0.01), new THREE.MeshBasicMaterial({ color: '#8a7a5a' }), 0, 0.3 - l * 0.2, 0.03)); g.add(m); sheets.push({ m, a: (i / 7) * 6.28, y: 6 + (i % 3) }); }
  const torches: THREE.Sprite[] = [];
  for (const x of [-1.8, 1.8]) { const s = glowSprite('#ffae42', 1.8, 0.9); s.position.set(x, 3.0, -1.8 + 1.95); g.add(s); torches.push(s); g.add(M(new THREE.CylinderGeometry(0.06, 0.08, 1.3, 5), std('#5a3d2a'), x, 2.35, -1.8 + 1.95)); }
  for (let i = 0; i < 6; i++) { const [x, z] = place(r, R, 0.72, 0.92); const t = tree(r, '#3a6a8a', '#4a82a8', 0.75); t.position.set(x, 0, z); g.add(t); }
  return { group: g, top: g, update: (t) => { b.tick(t); seal.rotation.y = t * 1.2; seal.position.y = 11.8 + Math.sin(t * 2) * 0.2; sg.scale.setScalar(8 + Math.sin(t * 2.4)); (beam.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(t * 1.2) * 0.025; flags.forEach((f, i) => { const p = f.geometry.attributes.position as THREE.BufferAttribute; for (let k = 0; k < p.count; k++) { const x = p.getX(k); p.setZ(k, Math.sin(t * 5 + x * 3 + i) * 0.14 * (x + 0.7)); } p.needsUpdate = true; }); sheets.forEach((s) => { const a = s.a + t * 0.22; s.m.position.set(Math.cos(a) * 7.3, s.y + Math.sin(t * 1.2 + s.a) * 0.4, -1.8 + Math.sin(a) * 6.2); s.m.rotation.y = -a + Math.PI / 2; s.m.rotation.z = Math.sin(t + s.a) * 0.2; }); torches.forEach((s, i) => s.scale.setScalar(1.6 + Math.sin(t * 14 + i * 3) * 0.25)); } };
}

export function buildIsland(realm: Realm): Island {
  const f = { 1: nombres, 2: mots, 3: grandeurs, 4: formes, 5: decouvertes, 6: chateau }[realm.id];
  return f(realm.R);
}
