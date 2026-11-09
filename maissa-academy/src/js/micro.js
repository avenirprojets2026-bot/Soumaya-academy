// Le Monde invisible : un vrai microscope à manipuler (lames, grossissements, mise au point),
// la mission « Que cache cette goutte d'eau ? » et l'expérience des mains propres.
// Les images sont des illustrations schématiques dessinées, pas des photos.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, qcm, shuffle } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const rnd = (a, b) => a + Math.random() * (b - a);
const ZOOMS = [40, 100, 400];
const ZF = { 40: 1, 100: 2.5, 400: 6 };

// ---------- les lames ----------
const SLIDES = {
  oignon: { n: 'Pelure d’oignon', ic: '🧅', bg: '#f6efe2', info: 'Une fine pelure d’oignon, colorée pour mieux voir. Chaque petite case est une cellule : la paroi l’entoure, le cytoplasme la remplit et le noyau la commande. Toutes les plantes et tous les animaux sont faits de cellules !' },
  eau: { n: 'Goutte d’eau de la mare', ic: '💧', bg: '#e9f6f1', info: 'Une simple goutte d’eau de mare est pleine de vie ! La paramécie nage grâce à des milliers de petits cils, l’euglène est verte et tire un long fouet, et les algues forment des chaînes vertes.' },
  levures: { n: 'Levures du boulanger', ic: '🍞', bg: '#f7f0e0', info: 'Les levures sont des champignons microscopiques. Dans la pâte, elles mangent le sucre et produisent un gaz : des bulles se forment et le pain gonfle ! On voit parfois une petite levure qui « bourgeonne » sur une grande.' },
  bacteries: { n: 'Bactéries (yaourt)', ic: '🦠', bg: '#f4eef8', info: 'Les bactéries sont minuscules : il faut le plus fort grossissement. Elles peuvent être rondes (coques), en bâtonnet (bacilles) ou en spirale (spirilles). Beaucoup sont utiles : celles du yaourt ou de notre intestin. D’autres peuvent rendre malade.' },
  sang: { n: 'Une goutte de sang', ic: '🩸', bg: '#fbeaea', info: 'Les globules rouges transportent l’oxygène. Le globule blanc, plus gros, est un défenseur : il poursuit les microbes et les avale pour protéger notre corps !' },
  virus: { n: 'Les virus', ic: '🧬', bg: '#eef2ee', info: 'Les virus sont beaucoup trop petits pour le microscope de l’école : même au ×400, on ne voit rien ! Les scientifiques utilisent un microscope électronique. Un virus ne peut pas vivre seul : il doit entrer dans une cellule pour se multiplier.' },
};

function makeWorld(k) {
  const o = [];
  if (k === 'oignon') {
    const W = 26, H = 10;
    for (let r = -22; r <= 22; r++) for (let c = -9; c <= 9; c++) {
      const x = c * W + (r % 2 ? W / 2 : 0) + rnd(-1, 1), y = r * H + rnd(-0.6, 0.6);
      o.push({ t: 'cell', x, y, w: W - 0.6, h: H - 0.6, nx: x + rnd(-W / 3.2, W / 3.2), ny: y + rnd(-H / 5, H / 5) });
    }
  }
  if (k === 'eau') {
    const near = [[-8, 5], [8, -7], [2, 10]];
    for (let i = 0; i < 12; i++) o.push({ t: 'para', x: i ? rnd(-70, 70) : near[0][0], y: i ? rnd(-70, 70) : near[0][1], a: rnd(0, 6.28), v: rnd(0.8, 1.8), L: 18 });
    for (let i = 0; i < 12; i++) o.push({ t: 'eugl', x: i ? rnd(-70, 70) : near[1][0], y: i ? rnd(-70, 70) : near[1][1], a: rnd(0, 6.28), v: rnd(0.6, 1.3), L: 11 });
    for (let i = 0; i < 10; i++) o.push({ t: 'algue', x: i ? rnd(-70, 70) : near[2][0], y: i ? rnd(-70, 70) : near[2][1], a: rnd(0, 6.28), n: Math.floor(rnd(3, 6)), L: 16 });
    for (let i = 0; i < 160; i++) o.push({ t: 'dot', x: rnd(-200, 200), y: rnd(-200, 200), r: rnd(0.3, 1.2) });
  }
  if (k === 'levures') for (let i = 0; i < 380; i++) o.push({ t: 'yeast', x: rnd(-160, 160), y: rnd(-160, 160), a: rnd(0, 6.28), bud: Math.random() < 0.25, s: rnd(0.8, 1.2) });
  if (k === 'bacteries') {
    for (let i = 0; i < 260; i++) o.push({ t: 'bacille', x: rnd(-120, 120), y: rnd(-120, 120), a: rnd(0, 6.28), L: rnd(2.2, 3.2) });
    for (let i = 0; i < 90; i++) { const x = rnd(-120, 120), y = rnd(-120, 120); for (let j = 0; j < 5; j++) o.push({ t: 'coque', x: x + rnd(-1.6, 1.6), y: y + rnd(-1.6, 1.6) }); }
    for (let i = 0; i < 70; i++) o.push({ t: 'spirille', x: rnd(-120, 120), y: rnd(-120, 120), a: rnd(0, 6.28) });
  }
  if (k === 'sang') {
    for (let i = 0; i < 900; i++) o.push({ t: 'rouge', x: rnd(-150, 150), y: rnd(-150, 150), s: rnd(0.9, 1.1) });
    [[-25, -10], [20, 15], [0, 30]].forEach(([x, y]) => o.push({ t: 'blanc', x, y, a: 0, v: 2.2 }));
    for (let i = 0; i < 70; i++) o.push({ t: 'microbe', x: rnd(-100, 100), y: rnd(-100, 100), a: rnd(0, 6.28) });
  }
  if (k === 'virus') for (let i = 0; i < 400; i++) o.push({ t: 'dot', x: rnd(-200, 200), y: rnd(-200, 200), r: rnd(0.2, 0.8) });
  return o;
}

function drawObj(c, ob, sc, time) {
  const X = ob.x * sc, Y = ob.y * sc;
  c.save(); c.translate(X, Y);
  switch (ob.t) {
    case 'cell': {
      c.fillStyle = '#f2cfd9'; c.strokeStyle = '#b8667f'; c.lineWidth = Math.max(1, sc * 0.5);
      c.fillRect(-ob.w * sc / 2, -ob.h * sc / 2, ob.w * sc, ob.h * sc); c.strokeRect(-ob.w * sc / 2, -ob.h * sc / 2, ob.w * sc, ob.h * sc);
      c.fillStyle = '#8a3a6a'; c.beginPath(); c.arc((ob.nx - ob.x) * sc, (ob.ny - ob.y) * sc, Math.max(0.8, 1.7 * sc), 0, 7); c.fill();
      if (sc > 6) { c.fillStyle = '#c86b9a'; c.beginPath(); c.arc((ob.nx - ob.x) * sc + 0.4 * sc, (ob.ny - ob.y) * sc - 0.3 * sc, 0.45 * sc, 0, 7); c.fill(); }
      break;
    }
    case 'para': {
      c.rotate(ob.a); const L = ob.L * sc, W = L * 0.36;
      c.fillStyle = '#d9e8c8cc'; c.strokeStyle = '#6b8a4a'; c.lineWidth = Math.max(1, sc * 0.25);
      c.beginPath(); c.ellipse(0, 0, L / 2, W / 2, 0, 0, 7); c.fill(); c.stroke();
      if (sc > 2) { c.strokeStyle = '#6b8a4a88'; c.lineWidth = 1; for (let i = 0; i < 40; i++) { const t = i / 40 * 6.283, px = Math.cos(t) * L / 2, py = Math.sin(t) * W / 2, w = Math.sin(time * 12 + i) * 0.6 * sc; c.beginPath(); c.moveTo(px, py); c.lineTo(px * 1.08 + w, py * 1.18); c.stroke(); } }
      c.fillStyle = '#9fb88a'; c.beginPath(); c.ellipse(-L * 0.05, 0, L * 0.12, W * 0.22, 0, 0, 7); c.fill();
      c.strokeStyle = '#6b8a4a'; c.beginPath(); c.moveTo(L * 0.05, W * 0.45); c.quadraticCurveTo(L * 0.1, 0, L * 0.02, -W * 0.1); c.stroke();
      break;
    }
    case 'eugl': {
      c.rotate(ob.a); const L = ob.L * sc;
      c.fillStyle = '#4fae5a'; c.beginPath(); c.moveTo(L / 2, 0); c.quadraticCurveTo(0, L * 0.22, -L / 2, 0); c.quadraticCurveTo(0, -L * 0.22, L / 2, 0); c.fill();
      c.fillStyle = '#e04a3a'; c.beginPath(); c.arc(L * 0.32, -L * 0.04, Math.max(0.6, L * 0.04), 0, 7); c.fill();
      c.strokeStyle = '#4fae5a'; c.lineWidth = Math.max(1, sc * 0.2); c.beginPath(); c.moveTo(L / 2, 0); for (let i = 1; i <= 10; i++) c.lineTo(L / 2 + i * L * 0.08, Math.sin(time * 9 + i) * L * 0.06); c.stroke();
      break;
    }
    case 'algue': {
      c.rotate(ob.a); const s = 3.2 * sc;
      for (let i = 0; i < ob.n; i++) { c.fillStyle = '#3f9a52'; c.strokeStyle = '#2a6a38'; c.lineWidth = Math.max(1, sc * 0.2); c.fillRect(i * s - ob.n * s / 2, -s * 0.45, s * 0.94, s * 0.9); c.strokeRect(i * s - ob.n * s / 2, -s * 0.45, s * 0.94, s * 0.9); if (sc > 2) { c.fillStyle = '#9ad86a'; c.beginPath(); c.arc(i * s - ob.n * s / 2 + s * 0.47, 0, s * 0.2, 0, 7); c.fill(); } }
      break;
    }
    case 'dot': c.fillStyle = '#7a7a6a66'; c.beginPath(); c.arc(0, 0, Math.max(0.5, ob.r * sc), 0, 7); c.fill(); break;
    case 'yeast': {
      c.rotate(ob.a); const r = 2.6 * sc * ob.s;
      c.fillStyle = '#f3e3b8'; c.strokeStyle = '#a8864a'; c.lineWidth = Math.max(0.8, sc * 0.2);
      c.beginPath(); c.ellipse(0, 0, r, r * 0.8, 0, 0, 7); c.fill(); c.stroke();
      if (ob.bud) { c.beginPath(); c.ellipse(r * 1.15, 0, r * 0.45, r * 0.38, 0, 0, 7); c.fill(); c.stroke(); }
      if (sc > 4) { c.fillStyle = '#d8c08a'; c.beginPath(); c.arc(-r * 0.2, r * 0.1, r * 0.25, 0, 7); c.fill(); }
      break;
    }
    case 'bacille': c.rotate(ob.a); c.strokeStyle = '#7a3aa8'; c.lineCap = 'round'; c.lineWidth = Math.max(1, 0.8 * sc); c.beginPath(); c.moveTo(-ob.L * sc / 2, 0); c.lineTo(ob.L * sc / 2, 0); c.stroke(); break;
    case 'coque': c.fillStyle = '#5a2a88'; c.beginPath(); c.arc(0, 0, Math.max(0.6, 0.55 * sc), 0, 7); c.fill(); break;
    case 'spirille': { c.rotate(ob.a); c.strokeStyle = '#9a3a7a'; c.lineWidth = Math.max(1, 0.4 * sc); c.beginPath(); for (let i = 0; i <= 20; i++) { const x = (i / 20 - 0.5) * 5 * sc, y = Math.sin(i / 20 * 12) * 0.6 * sc; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); break; }
    case 'rouge': { const r = 3.6 * sc * ob.s, g = c.createRadialGradient(0, 0, r * 0.1, 0, 0, r); g.addColorStop(0, '#f2a0a0'); g.addColorStop(0.6, '#e05858'); g.addColorStop(1, '#c03a3a'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, Math.max(0.8, r), 0, 7); c.fill(); break; }
    case 'blanc': {
      const r = 6.5 * sc; c.fillStyle = '#eee8f6'; c.strokeStyle = '#9a8ac0'; c.lineWidth = Math.max(1, 0.3 * sc);
      c.beginPath(); for (let i = 0; i <= 24; i++) { const t = i / 24 * 6.283, rr = r * (1 + 0.06 * Math.sin(t * 5 + time * 3)); i ? c.lineTo(Math.cos(t) * rr, Math.sin(t) * rr) : c.moveTo(Math.cos(t) * rr, Math.sin(t) * rr); } c.fill(); c.stroke();
      c.fillStyle = '#6a3aa8'; [[-0.3, -0.2], [0.15, -0.3], [0.25, 0.15], [-0.15, 0.25]].forEach(([a, b]) => { c.beginPath(); c.arc(a * r, b * r, r * 0.22, 0, 7); c.fill(); });
      break;
    }
    case 'microbe': c.rotate(ob.a); c.strokeStyle = '#2a8a3a'; c.lineCap = 'round'; c.lineWidth = Math.max(1, 0.9 * sc); c.beginPath(); c.moveTo(-1.4 * sc, 0); c.lineTo(1.4 * sc, 0); c.stroke(); break;
    default: break;
  }
  c.restore();
}
function drawVirusEM(c, R, time) {
  c.fillStyle = '#1b2420'; c.fillRect(-R, -R, 2 * R, 2 * R);
  c.save(); c.globalAlpha = 0.5; c.fillStyle = '#4a5a50'; c.beginPath(); c.ellipse(-R * 0.15, R * 0.55, R * 0.9, R * 0.3, 0.2, 0, 7); c.fill(); c.restore();
  c.fillStyle = '#9ab8a8'; c.font = `bold ${R * 0.07}px sans-serif`; c.textAlign = 'center'; c.fillText('un morceau de bactérie (géante à côté !)', -R * 0.15, R * 0.58);
  const pos = [[-0.4, -0.35], [0.1, -0.45], [0.45, -0.1], [-0.05, 0.05], [0.35, 0.3], [-0.5, 0.15]];
  pos.forEach(([a, b], i) => {
    const x = a * R, y = b * R + Math.sin(time + i) * 2, r = R * 0.09;
    c.strokeStyle = '#d8f0e0'; c.lineWidth = 2;
    for (let k = 0; k < 14; k++) { const t = k / 14 * 6.283 + i; c.beginPath(); c.moveTo(x + Math.cos(t) * r, y + Math.sin(t) * r); c.lineTo(x + Math.cos(t) * r * 1.45, y + Math.sin(t) * r * 1.45); c.stroke(); c.fillStyle = '#e8ffe8'; c.beginPath(); c.arc(x + Math.cos(t) * r * 1.5, y + Math.sin(t) * r * 1.5, 2.2, 0, 7); c.fill(); }
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r); g.addColorStop(0, '#d8f0e0'); g.addColorStop(1, '#5a8a6a'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  });
  c.fillStyle = '#d8f0e0'; c.font = `bold ${R * 0.075}px sans-serif`; c.fillText('Microscope électronique ×50 000 — illustration', 0, -R * 0.78);
}

// ---------- le microscope ----------
function scope(onChange) {
  const SZ = 340;
  const cv = h('canvas', { class: 'mi-eye', width: SZ * 2, height: SZ * 2, 'data-testid': 'mi-eye' });
  const c = cv.getContext('2d');
  const st = { slide: null, world: [], zoom: 40, focus: 15, target: 60, panX: 0, panY: 0, em: false, raf: 0, last: performance.now(), time: 0, tap: null, chase: null };
  const blurPx = () => Math.min(12, Math.abs(st.focus - st.target) * 0.28);
  const api = {
    el: cv, st,
    sharp: () => Math.abs(st.focus - st.target) < 7,
    setSlide(k) { st.slide = k; st.world = k ? makeWorld(k) : []; st.panX = st.panY = 0; st.em = false; st.zoom = 40; st.target = Math.max(5, Math.min(95, st.focus + rnd(25, 45) * (st.focus > 50 ? -1 : 1))); onChange && onChange('slide'); },
    setZoom(z) { st.zoom = z; const d = rnd(18, 35) * (st.focus > 50 ? -1 : 1); st.target = Math.max(5, Math.min(95, st.focus + d)); onChange && onChange('zoom'); },
    setFocus(f) { const was = api.sharp(); st.focus = f; if (!was && api.sharp()) { Sfx.tap(); onChange && onChange('sharp'); } },
    hit(ex, ey) {
      const r = cv.getBoundingClientRect(), sc = (SZ / 160) * ZF[st.zoom] * 2;
      const wx = ((ex - r.left) / r.width * SZ * 2 - SZ) / sc + st.panX, wy = ((ey - r.top) / r.height * SZ * 2 - SZ) / sc + st.panY;
      let best = null, bd = 1e9;
      for (const o of st.world) {
        if (o.t === 'dot' || o.t === 'rouge') continue;
        if (o.t === 'cell') { if (Math.abs(wx - o.x) <= o.w / 2 && Math.abs(wy - o.y) <= o.h / 2) { const dn = Math.hypot(wx - o.nx, wy - o.ny), dw = Math.min(o.w / 2 - Math.abs(wx - o.x), o.h / 2 - Math.abs(wy - o.y)); return { t: dn < 2.6 ? 'noyau' : dw < 1.3 ? 'paroi' : 'cytoplasme', o }; } continue; }
        const d = Math.hypot(wx - o.x, wy - o.y), lim = { para: 12, eugl: 8, algue: 13, yeast: 3.5, bacille: 2.2, coque: 1.4, spirille: 3, blanc: 7, microbe: 2 }[o.t] || 2;
        if (d < lim && d < bd) { bd = d; best = o; }
      }
      return best ? { t: best.t, o: best } : null;
    },
    stop() { cancelAnimationFrame(st.raf); },
  };
  // déplacer la lame avec le doigt
  let drag = null, moved = 0;
  cv.addEventListener('pointerdown', (e) => { drag = [e.clientX, e.clientY]; moved = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', (e) => { if (!drag) return; const r = cv.getBoundingClientRect(), sc = (SZ / 160) * ZF[st.zoom] * (r.width / SZ); const dx = e.clientX - drag[0], dy = e.clientY - drag[1]; moved += Math.abs(dx) + Math.abs(dy); st.panX = Math.max(-120, Math.min(120, st.panX - dx / sc)); st.panY = Math.max(-120, Math.min(120, st.panY - dy / sc)); drag = [e.clientX, e.clientY]; });
  cv.addEventListener('pointerup', (e) => { if (drag && moved < 8 && st.tap) st.tap(api.hit(e.clientX, e.clientY), e); drag = null; });
  const frame = (now) => {
    if (!cv.isConnected && st.time > 0.5) return;
    const dt = Math.min(0.05, (now - st.last) / 1000); st.last = now; st.time += dt;
    // déplacements
    for (const o of st.world) {
      if (o.v && o.t !== 'blanc') { o.a += Math.sin(st.time * 0.7 + o.x) * 0.01; o.x += Math.cos(o.a) * o.v * dt; o.y += Math.sin(o.a) * o.v * dt; if (Math.abs(o.x) > 80 || Math.abs(o.y) > 80) { o.a += Math.PI; o.x = Math.max(-80, Math.min(80, o.x)); o.y = Math.max(-80, Math.min(80, o.y)); } }
      if (o.t === 'blanc') {
        let tgt = null, bd = 1e9; for (const m of st.world) if (m.t === 'microbe' && !m.gone) { const d = Math.hypot(m.x - o.x, m.y - o.y); if (d < bd) { bd = d; tgt = m; } }
        if (tgt) { const a = Math.atan2(tgt.y - o.y, tgt.x - o.x); o.x += Math.cos(a) * o.v * dt; o.y += Math.sin(a) * o.v * dt; if (bd < 5) { tgt.gone = true; st.eaten = (st.eaten || 0) + 1; } }
      }
    }
    if (st.slide === 'sang' && st.world.filter((m) => m.t === 'microbe' && !m.gone).length < 30) st.world.push({ t: 'microbe', x: rnd(-100, 100), y: rnd(-100, 100), a: rnd(0, 6.28) });
    st.world = st.world.filter((m) => !m.gone);
    const R = SZ;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 2 * R, 2 * R);
    c.save(); c.beginPath(); c.arc(R, R, R - 4, 0, 7); c.clip(); c.translate(R, R);
    if (!st.slide) { c.fillStyle = '#fff8e8'; c.fillRect(-R, -R, 2 * R, 2 * R); }
    else if (st.em) drawVirusEM(c, R, st.time);
    else {
      c.fillStyle = SLIDES[st.slide].bg; c.fillRect(-R, -R, 2 * R, 2 * R);
      const b = blurPx(); c.filter = b > 0.3 ? `blur(${b}px)` : 'none';
      const sc = (SZ / 160) * ZF[st.zoom] * 2;
      c.save(); c.translate(-st.panX * sc, -st.panY * sc);
      const view = R / sc + 15;
      for (const o of st.world) if (Math.abs(o.x - st.panX) < view && Math.abs(o.y - st.panY) < view) drawObj(c, o, sc, st.time);
      c.restore(); c.filter = 'none';
    }
    const g = c.createRadialGradient(0, 0, R * 0.55, 0, 0, R); g.addColorStop(0, '#0000'); g.addColorStop(1, '#000a'); c.fillStyle = g; c.fillRect(-R, -R, 2 * R, 2 * R);
    c.restore();
    c.strokeStyle = '#2b2440'; c.lineWidth = 10; c.beginPath(); c.arc(R, R, R - 5, 0, 7); c.stroke();
    st.raf = requestAnimationFrame(frame);
  };
  st.raf = requestAnimationFrame(frame);
  return api;
}
function controls(sc, talk, { lockSlide = false } = {}) {
  const zb = ZOOMS.map((z) => h('button', { class: 'btn small mi-z', type: 'button', 'data-testid': 'mi-z' + z, onclick: () => { sc.setZoom(z); zb.forEach((b, i) => b.classList.toggle('primary', ZOOMS[i] === z)); talk(`Objectif ×${z}. Tourne la molette pour refaire la mise au point.`, false); Sfx.tap(); } }, `×${z}`));
  zb[0].classList.add('primary');
  const knob = h('input', { type: 'range', min: 0, max: 100, value: sc.st.focus, class: 'mi-knob', 'data-testid': 'mi-focus', 'aria-label': 'Molette de mise au point', oninput: (e) => sc.setFocus(+e.target.value) });
  const reset = () => { zb.forEach((b, i) => b.classList.toggle('primary', i === 0)); knob.value = sc.st.focus; };
  return { el: h('div', { class: 'mi-ctrl' }, h('div', { class: 'mi-zooms' }, h('span', { class: 'muted' }, 'Objectif :'), ...zb), h('label', { class: 'mi-knobw' }, h('span', null, '🎛️ Mise au point'), knob)), reset, lockSlide };
}

// ---------- défis par lame ----------
const DEFIS = {
  oignon: { min: 100, list: [['noyau', 'Touche le noyau d’une cellule.'], ['paroi', 'Touche la paroi d’une cellule (son bord).'], ['cytoplasme', 'Touche le cytoplasme (l’intérieur de la cellule, à côté du noyau).']] },
  eau: { min: 100, list: [['para', 'Trouve une paramécie : elle a la forme d’une pantoufle et nage avec des cils.'], ['eugl', 'Trouve une euglène : elle est verte, avec un point rouge et un long fouet.'], ['algue', 'Trouve une algue : une chaîne de petites cases vertes.']] },
  bacteries: { min: 400, list: [['coque', 'Touche une bactérie ronde : une coque.'], ['bacille', 'Touche une bactérie en bâtonnet : un bacille.'], ['spirille', 'Touche une bactérie en spirale : une spirille.']] },
  levures: { min: 100, list: [['yeast', 'Touche une levure.']] },
  sang: { min: 100, list: [['blanc', 'Touche le globule blanc, le défenseur du corps.']] },
};
const NAMES = { para: 'une paramécie', eugl: 'une euglène', algue: 'une algue', coque: 'une coque', bacille: 'un bacille', spirille: 'une spirille', yeast: 'une levure', blanc: 'le globule blanc', microbe: 'un microbe', noyau: 'le noyau', paroi: 'la paroi', cytoplasme: 'le cytoplasme' };

function labo(body, talk) {
  let defi = null;
  const info = h('div', { class: 'mi-info' }), act = h('div', { class: 'actions wrap' });
  const sc = scope((ev) => { if (ev === 'sharp') talk('C’est net !', false); });
  const ctl = controls(sc, talk);
  const pickRow = h('div', { class: 'mi-slides' }, ...Object.entries(SLIDES).map(([k, s]) => h('button', { class: 'mi-slide', type: 'button', 'data-testid': 'mi-s-' + k, onclick: (e) => choose(k, e.currentTarget) }, h('span', null, s.ic), s.n)));
  function choose(k, btn) {
    pickRow.querySelectorAll('.mi-slide').forEach((b) => b.classList.toggle('on', b === btn)); defi = null;
    sc.setSlide(k); ctl.reset(); Sfx.bloop();
    info.replaceChildren(h('strong', null, `${SLIDES[k].ic} ${SLIDES[k].n}`), h('p', null, SLIDES[k].info));
    act.replaceChildren();
    if (DEFIS[k]) act.append(h('button', { class: 'btn small primary', type: 'button', 'data-testid': 'mi-defi', onclick: () => startDefi(k) }, '🎯 Défi d’observation'));
    if (k === 'levures') act.append(h('button', { class: 'btn small', type: 'button', onclick: () => pain(info) }, '🍞 Fais lever la pâte'));
    if (k === 'virus') act.append(h('button', { class: 'btn small primary', type: 'button', 'data-testid': 'mi-em', onclick: () => { sc.st.em = !sc.st.em; talk(sc.st.em ? 'Voici le microscope électronique : il grossit des dizaines de milliers de fois ! Les petites boules à pointes sont des virus. Regarde comme la bactérie est géante à côté !' : 'Retour au microscope de l’école : on ne voit plus les virus.'); } }, '⚡ Microscope électronique'));
    talk(`Lame : ${SLIDES[k].n}. Tourne la molette pour faire la mise au point.${k === 'bacteries' ? ' Les bactéries sont minuscules : passe au ×400 !' : ''}`);
  }
  function startDefi(k) {
    const D = DEFIS[k], list = shuffle(D.list); let i = 0, ok = 0;
    const ask = () => { if (i >= list.length) { defi = null; talk(`Bravo, défi réussi ! ${ok} étoile${ok > 1 ? 's' : ''} !`); Sfx.win(); burst(body); return; } defi = list[i]; talk(defi[1] + (sc.st.zoom < D.min ? ` Conseil : passe au ×${D.min}.` : '')); };
    sc.st.tap = (hit) => {
      if (!defi) return;
      if (!sc.sharp()) { talk('L’image est floue : tourne la molette d’abord !', false); return; }
      if (hit && hit.t === defi[0]) { ok++; star(); Sfx.coin(); talk(`Oui ! C’est ${NAMES[hit.t]} !`, false); i++; setTimeout(ask, 1400); }
      else { Sfx.tap(); talk(hit ? `Ça, c’est ${NAMES[hit.t] || 'autre chose'}. Cherche encore !` : 'Il n’y a rien ici. Cherche encore !', false); }
    };
    ask();
  }
  body.replaceChildren(h('p', { class: 'muted' }, 'Choisis une lame, tourne la molette pour que l’image soit nette, change d’objectif et déplace la lame avec ton doigt.'), pickRow,
    h('div', { class: 'mi-lab' }, h('div', { class: 'mi-left' }, sc.el, ctl.el), h('div', { class: 'mi-side' }, info, act)));
  info.replaceChildren(h('p', null, 'Pose une lame sous le microscope pour commencer.'));
}
function pain(info) {
  const dough = h('div', { class: 'mi-dough' }, ...Array.from({ length: 12 }, (_, i) => h('i', { style: `left:${10 + (i * 37) % 80}%;top:${15 + (i * 53) % 65}%;animation-delay:${i * 0.25}s` })));
  info.append(h('div', { class: 'mi-bread' }, dough, h('small', null, 'Les levures mangent le sucre et font des bulles de gaz : la pâte gonfle !')));
  requestAnimationFrame(() => dough.classList.add('up'));
}

// ---------- mission : que cache cette goutte d'eau ? ----------
const CLUES = {
  para: ['Il n’est pas vert.', 'Il est assez grand et nage vite.', 'Son corps a la forme d’une pantoufle couverte de cils.'],
  eugl: ['Il est vert.', 'Il a un petit point rouge, comme un œil.', 'Il tire un long fouet pour avancer.'],
  algue: ['Il est vert.', 'Il ne nage presque pas.', 'Il ressemble à une petite chaîne de cases.'],
};
function goutte(body, talk) {
  let step = 0, target = shuffle(Object.keys(CLUES))[0], clue = 0;
  const banner = h('div', { class: 'mi-step' }), side = h('div', { class: 'mi-side' }), stepsUl = h('ol', { class: 'q-steps' });
  const STEPS = ['Placer la lame', 'Mise au point au ×40', 'Mise au point au ×400', 'Identifier l’organisme', 'Dessiner l’observation'];
  const sc = scope((ev) => check(ev));
  const ctl = controls(sc, talk);
  const placeBtn = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'mi-place', onclick: () => { sc.setSlide('eau'); ctl.reset(); Sfx.bloop(); next(); } }, '💧 Placer la lame sous le microscope');
  function render() {
    stepsUl.replaceChildren(...STEPS.map((s, i) => h('li', { class: i < step ? 'done' : i === step ? 'now' : '' }, s + (i < step ? ' ✓' : ''))));
    const txt = [
      'Maissa prélève une goutte d’eau de la mare. Pose la lame sous le microscope !',
      'Commence avec le plus petit objectif, ×40. Tourne la molette jusqu’à ce que l’image soit bien nette.',
      'Bravo ! Passe maintenant à l’objectif ×400 et refais la mise au point.',
      `Un organisme mystère se cache dans la goutte. Indice ${clue + 1} : ${CLUES[target][clue]} Touche-le !`,
      'Dernière étape : dessine ce que tu as observé, comme une vraie scientifique !',
    ][step];
    banner.textContent = txt; talk(txt);
    side.replaceChildren(stepsUl, step === 0 ? placeBtn : '', step === 3 && clue < 2 ? h('button', { class: 'btn small', type: 'button', onclick: () => { clue++; render(); } }, '💡 Un autre indice') : '');
  }
  function next() { step++; render(); if (step === 4) dessin(); }
  function check(ev) {
    if (step === 1 && sc.st.zoom === 40 && sc.sharp() && ev !== 'zoom') next();
    else if (step === 2 && sc.st.zoom === 400 && sc.sharp() && ev !== 'zoom') next();
  }
  sc.st.tap = (hit) => {
    if (step !== 3) return;
    if (!sc.sharp()) { talk('L’image est floue : tourne la molette !', false); return; }
    if (hit && hit.t === target) { star(2); Sfx.win(); burst(body); talk(`Trouvé ! C’était ${NAMES[target]} !`, false); setTimeout(next, 1500); }
    else if (hit && CLUES[hit.t]) { Sfx.tap(); if (clue < 2) clue++; talk(`Non, ça c’est ${NAMES[hit.t]}. Nouvel indice : ${CLUES[target][clue]}`, true); render(); }
  };
  function dessin() {
    const D = 280, cv = h('canvas', { class: 'mi-draw', width: D * 2, height: D * 2, 'data-testid': 'mi-draw' }), c = cv.getContext('2d');
    c.fillStyle = '#fffdf6'; c.beginPath(); c.arc(D, D, D - 4, 0, 7); c.fill(); c.strokeStyle = '#2b2440'; c.lineWidth = 8; c.stroke();
    let col = '#3a6a3a', last = null;
    const pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 2 * D, (e.clientY - r.top) / r.height * 2 * D]; };
    cv.addEventListener('pointerdown', (e) => { last = pt(e); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', (e) => { if (!last) return; const p = pt(e); if (Math.hypot(p[0] - D, p[1] - D) > D - 10) { last = p; return; } c.strokeStyle = col; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(...last); c.lineTo(...p); c.stroke(); last = p; });
    cv.addEventListener('pointerup', () => { last = null; });
    const cols = ['#3a6a3a', '#4fae5a', '#e04a3a', '#3a5aa8', '#2b2440'].map((cc) => h('button', { class: 'mi-col', type: 'button', style: `background:${cc}`, 'aria-label': 'couleur', onclick: () => { col = cc; } }));
    const done = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'mi-done', onclick: () => {
      c.fillStyle = '#2b2440'; c.font = 'bold 30px sans-serif'; c.textAlign = 'center'; c.fillText(`${NAMES[target]} · ×400`, D, D * 2 - 40);
      let url = ''; try { const sm = document.createElement('canvas'); sm.width = sm.height = 220; sm.getContext('2d').drawImage(cv, 0, 0, 220, 220); url = sm.toDataURL('image/jpeg', 0.7); } catch (e) { url = ''; }
      const b = S.get(); b.micro = b.micro || { drawings: [] }; if (url) { b.micro.drawings.unshift({ url, name: NAMES[target], at: Date.now() }); b.micro.drawings = b.micro.drawings.slice(0, 6); }
      const first = !b.micro.badge; b.micro.badge = true; b.micro.missions = (b.micro.missions || 0) + 1; S.save(); if (first) star(3);
      Sfx.win(); burst(body);
      body.replaceChildren(h('div', { class: 'mi-badge' }, h('div', { class: 'mi-medal' }, '🔬'), h('h3', null, 'Badge de jeune scientifique !'), h('p', null, `Tu as observé une goutte d’eau, fait la mise au point comme une pro, reconnu ${NAMES[target]} et dessiné ton observation.`), url ? h('img', { src: url, alt: 'Ton dessin', class: 'mi-thumb' }) : '', h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => goutte(body, talk) }, '↻ Nouvelle goutte d’eau'))));
      talk('Félicitations ! Tu as gagné le badge de jeune scientifique !');
    } }, '✓ J’ai fini mon dessin');
    side.replaceChildren(stepsUl, h('div', { class: 'mi-draww' }, cv, h('div', { class: 'actions' }, ...cols)), done);
  }
  body.replaceChildren(banner, h('div', { class: 'mi-lab' }, h('div', { class: 'mi-left' }, sc.el, ctl.el), side));
  render();
}

// ---------- les mains propres ----------
function mains(body, talk) {
  const W = 340, cv = h('canvas', { class: 'mi-hand', width: W * 2, height: W * 2, 'data-testid': 'mi-hand' }), c = cv.getContext('2d');
  const handPath = new Path2D();
  handPath.ellipse(W, W * 1.25, W * 0.42, W * 0.5, 0, 0, 7);
  [[-0.36, -0.15, -0.35], [-0.16, -0.38, -0.1], [0.06, -0.42, 0], [0.26, -0.36, 0.12], [0.5, 0.15, 0.7]].forEach(([dx, dy, rot]) => { const p = new Path2D(); const m = new DOMMatrix().translate(W + dx * W, W + dy * W).rotate(rot * 57.3); p.roundRect(-W * 0.09, -W * 0.36, W * 0.18, W * 0.62, W * 0.09); handPath.addPath(p, m); });
  let microbes = [], mode = null, rubbed = 0, timer = 0, t0 = 0, lastMode = { eau: null };
  const seed = () => { microbes = []; while (microbes.length < 140) { const x = rnd(0, 2 * W), y = rnd(0, 2 * W); if (c.isPointInPath(handPath, x, y)) microbes.push({ x, y, a: rnd(0, 6.28) }); } };
  const stat = h('div', { class: 'ws-big' }), bar = h('div', { class: 'mi-timer' }, h('span'));
  const btnEau = h('button', { class: 'btn', type: 'button', 'data-testid': 'mi-eau', onclick: () => start('eau') }, '🚿 Eau seule');
  const btnSavon = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'mi-savon', onclick: () => start('savon') }, '🧼 Eau + savon');
  const res = h('div');
  function start(m) { seed(); mode = m; rubbed = 0; t0 = performance.now(); timer = 20; talk(m === 'eau' ? 'Frotte tes mains sous l’eau, sans savon, pendant 20 secondes.' : 'Avec du savon cette fois ! Frotte bien partout, entre les doigts aussi, pendant 20 secondes. Tu peux chanter « Joyeux anniversaire » deux fois !'); }
  let last = null;
  const pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 2 * W, (e.clientY - r.top) / r.height * 2 * W]; };
  cv.addEventListener('pointerdown', (e) => { last = pt(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointerup', () => { last = null; });
  cv.addEventListener('pointermove', (e) => {
    if (!last || !mode || timer <= 0) return; const p = pt(e); rubbed += Math.hypot(p[0] - last[0], p[1] - last[1]); last = p;
    const prob = mode === 'savon' ? 0.35 : 0.04, cap = mode === 'savon' ? 1 : 0.3, start0 = 140;
    microbes = microbes.filter((m) => { if (Math.hypot(m.x - p[0], m.y - p[1]) < 55 && Math.random() < prob && (start0 - microbes.length) / start0 < cap) return false; return true; });
    if (mode === 'savon') bubbles.push({ x: p[0] + rnd(-20, 20), y: p[1] + rnd(-20, 20), r: rnd(6, 16), life: 1 });
  });
  const bubbles = [];
  const born = performance.now();
  const frame = (now) => {
    if (!cv.isConnected && now - born > 800) return;
    c.clearRect(0, 0, 2 * W, 2 * W); c.fillStyle = mode ? '#d8eef8' : '#f0ecf8'; c.fillRect(0, 0, 2 * W, 2 * W);
    if (mode) { c.strokeStyle = '#8ac8f066'; c.lineWidth = 4; for (let i = 0; i < 14; i++) { const x = (i * 53 + now / 8) % (2 * W); c.beginPath(); c.moveTo(x, 0); c.lineTo(x - 30, 2 * W); c.stroke(); } }
    c.fillStyle = '#f5c9a0'; c.fill(handPath); c.strokeStyle = '#c8906a'; c.lineWidth = 4; c.stroke(handPath);
    microbes.forEach((m) => { m.a += 0.03; c.save(); c.translate(m.x, m.y); c.rotate(m.a); c.fillStyle = '#3ab84a'; c.beginPath(); c.ellipse(0, 0, 9, 5, 0, 0, 7); c.fill(); c.fillStyle = '#1a5a2a'; c.beginPath(); c.arc(-3, -1, 1.6, 0, 7); c.arc(3, -1, 1.6, 0, 7); c.fill(); c.restore(); });
    bubbles.forEach((b) => { b.life -= 0.012; c.strokeStyle = `rgba(255,255,255,${b.life})`; c.lineWidth = 3; c.beginPath(); c.arc(b.x, b.y, b.r, 0, 7); c.stroke(); });
    while (bubbles.length && bubbles[0].life <= 0) bubbles.shift();
    if (mode && timer > 0) {
      timer = Math.max(0, 20 - (now - t0) / 1000); bar.firstChild.style.width = `${(1 - timer / 20) * 100}%`;
      if (timer === 0) {
        const left = microbes.length, pc = Math.round((140 - left) / 140 * 100); lastMode[mode] = pc;
        talk(mode === 'eau' ? `Avec de l’eau seule, seulement ${pc} % des microbes sont partis. Essaie maintenant avec du savon !` : `Avec du savon, ${pc} % des microbes sont partis ! Le savon décolle les microbes et l’eau les emporte.`);
        if (mode === 'savon' && pc >= 60) { star(2); Sfx.win(); burst(body); conclusion(); }
        mode = null;
      }
    }
    stat.textContent = mode || microbes.length ? `🦠 Microbes sur la main : ${microbes.length}${mode ? ` · ⏱️ ${Math.ceil(timer)} s` : ''}` : '';
    requestAnimationFrame(frame);
  };
  function conclusion() {
    res.replaceChildren(h('p', { class: 'prompt' }, `Conclusion : eau seule ${lastMode.eau ?? '?'} % · eau + savon ${lastMode.savon} %. Le savon est le meilleur ami de tes mains !`));
    qcm(res, talk, shuffle([
      { q: 'Quand faut-il se laver les mains ?', opts: ['Avant de manger et après les toilettes', 'Seulement le dimanche', 'Seulement si elles sont sales à voir'], why: 'Les microbes sont invisibles : on se lave les mains avant de manger, après les toilettes, en rentrant à la maison.' },
      { q: 'Combien de temps faut-il frotter avec du savon ?', opts: ['Au moins 20 secondes', '2 secondes', '1 heure'], why: '20 secondes, le temps de chanter deux fois « Joyeux anniversaire ».' },
      { q: 'Quand on éternue, on se protège…', opts: ['dans le pli du coude', 'dans les mains', 'on ne se protège pas'], why: 'Dans le coude : ainsi on ne met pas de microbes sur les mains.' },
      { q: 'Pourquoi le savon est-il efficace ?', opts: ['Il décolle les microbes que l’eau emporte', 'Il a une jolie couleur', 'Il réchauffe les mains'], why: 'Le savon décroche les microbes et les saletés de la peau, puis l’eau les rince.' },
    ]).slice(0, 3));
  }
  body.replaceChildren(h('p', { class: 'muted' }, 'Les microbes sont invisibles à l’œil nu : ici, on les a colorés en vert pour l’expérience (illustration). Choisis, puis frotte la main avec ton doigt pendant 20 secondes.'),
    h('div', { class: 'mi-lab' }, h('div', { class: 'mi-left' }, cv, bar), h('div', { class: 'mi-side' }, stat, h('div', { class: 'actions wrap' }, btnEau, btnSavon), res)));
  seed(); requestAnimationFrame(frame);
  talk('Expérience : est-ce que l’eau seule suffit pour enlever les microbes ? Commence avec l’eau seule, puis avec du savon.');
}

export function open(tab = 'labo') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const tabs = [['labo', '🔬 Le microscope'], ['goutte', '💧 Mission goutte d’eau'], ['mains', '🧼 Les mains propres']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'mi-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel mi-panel' }, UI.closeButton(), h('h2', null, '🔬 Le Monde invisible'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Le Monde invisible', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t) => t.classList.toggle('primary', t.dataset.testid === 'mi-tab-' + k)); Voice.stop(); talk('', false); (k === 'labo' ? labo : k === 'goutte' ? goutte : mains)(body, talk); }
  go(tab);
}
