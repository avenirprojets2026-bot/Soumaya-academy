// Atelier des merveilles = laboratoire de mathématiques : l'alchimiste des mesures (capacités),
// la balance enchantée (masses), l'architecte des solides (faces, arêtes, sommets, patrons), le chaudron des fractions.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';

const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };
const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const star = () => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + 1; b.coins += 2; S.save(); };
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
function burst(host) { for (let k = 0; k < 12; k++) { const s = h('span', { class: 'abq-spark', 'aria-hidden': 'true' }, k % 3 ? '✨' : '🌟'); s.style.cssText = `left:${50 + (Math.random() - 0.5) * 60}%;top:${40 + (Math.random() - 0.5) * 30}%;--dx:${(Math.random() - 0.5) * 220}px;--dy:${-60 - Math.random() * 120}px`; host.append(s); setTimeout(() => s.remove(), 1500); } }

export function log(key, ok = 1) { const b = S.get(); b.carnet = b.carnet || {}; const c = b.carnet[key] || (b.carnet[key] = { n: 0, ok: 0 }); c.n++; c.ok += ok; S.save(); }
const endBtn = (o, again) => o.onDone ? h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ws-next', onclick: () => o.onDone() }, '➡️ Continuer la mission') : h('button', { class: 'btn primary', type: 'button', onclick: again }, '↻ Recommencer');
function shell(title, label, build) {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const box = h('div', { class: 'ws-box' });
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel' }, UI.closeButton(), h('h2', null, title), box, say), { label, onClose: () => Voice.stop() });
  build(box, talk);
}
// petit enchaînement de questions à choix
function qcm(host, talk, list, onEnd) {
  let i = 0, ok = 0;
  const pic = h('div', { class: 'ws-pic' }), q = h('p', { class: 'prompt' }), ans = h('div', { class: 'answers' }), sc = h('span', { class: 'be-score' });
  host.append(pic, q, ans, sc);
  const ask = () => {
    if (i >= list.length) { pic.replaceChildren(); q.textContent = `${ok} / ${list.length} !`; ans.replaceChildren(); sc.textContent = ''; onEnd && onEnd(ok); return; }
    const it = list[i]; pic.replaceChildren(...(it.pic ? [it.pic()] : [])); q.textContent = it.q; Voice.speak(it.q); sc.textContent = list.length > 1 ? `${i + 1}/${list.length}` : '';
    ans.replaceChildren(...shuffle(it.opts.map((o, k) => [o, k])).map(([o, k]) => h('button', { class: 'choice', type: 'button', 'data-k': k, onclick: (e) => {
      ans.querySelectorAll('button').forEach((b) => { b.disabled = true; }); e.currentTarget.classList.add(k === 0 ? 'right' : 'wrong');
      if (k === 0) { ok++; star(); Sfx.win(); burst(host); talk('Bravo ! ' + it.why, false); } else { Sfx.tap(); talk('Pas tout à fait. ' + it.why, false); }
      i++; setTimeout(ask, 2600);
    } }, String(o))));
  };
  ask();
}

// ---------- 1. l'alchimiste des mesures (capacités) ----------
const CAP = [['1 L', 1000], ['1 dL', 100], ['1 cL', 10], ['1 mL', 1]];
const capTxt = (ml, unit) => unit === 'L' ? `${String(ml / 1000).replace('.', ',')} L` : unit === 'dL' ? `${ml / 100} dL` : unit === 'cL' ? `${ml / 10} cL` : `${ml} mL`;
export function alchimiste(o = {}) {
  const N = o.rounds || 5;
  shell('⚗️ L’alchimiste des mesures', 'Alchimiste', (box, talk) => {
    let round = 0, ok = 0, flasks = [], target = 0, cur = 0, used = [];
    const MAX = 1500;
    const jar = sv('svg', { viewBox: '-30 0 250 360', class: 'ws-jar' });
    const liquid = sv('rect', { x: 52, width: 116, y: 330, height: 0, rx: 6, fill: 'url(#wsLiq)', class: 'ws-liq' });
    const tgtLine = sv('line', { x1: 40, x2: 180, stroke: '#ffd84a', 'stroke-width': 3, 'stroke-dasharray': '8 5' });
    const tgtTxt = sv('text', { x: 186, class: 'ws-small', style: 'text-anchor:start' });
    jar.append(sv('defs', {}, sv('linearGradient', { id: 'wsLiq', x1: 0, x2: 0, y1: 0, y2: 1 }, sv('stop', { offset: 0, 'stop-color': '#c86bff' }), sv('stop', { offset: 1, 'stop-color': '#5b2ad6' }))),
      sv('path', { d: 'M50,20 L50,330 Q50,345 65,345 L155,345 Q170,345 170,330 L170,20', fill: '#ffffff12', stroke: '#e8f6ff', 'stroke-width': 4 }), liquid);
    for (let v = 0; v <= MAX; v += 100) { const y = 330 - v / MAX * 300; jar.append(sv('line', { x1: 50, x2: v % 500 ? 64 : 78, y1: y, y2: y, stroke: '#e8f6ff', 'stroke-width': v % 500 ? 1.5 : 3 })); if (v % 500 === 0) jar.append(sv('text', { x: 44, y: y + 5, class: 'ws-small', style: 'text-anchor:end' }, v === 0 ? '0' : v === 1000 ? '1 L' : `${v} mL`)); }
    jar.append(tgtLine, tgtTxt);
    const curTxt = h('div', { class: 'ws-big' });
    const shelf = h('div', { class: 'ws-flasks' });
    const head = h('p', { class: 'prompt' });
    const actions = h('div', { class: 'actions wrap' });
    box.append(head, h('div', { class: 'ws-lab' }, jar, h('div', { class: 'ws-side' }, curTxt, shelf)), actions);
    function draw() {
      const y = 330 - Math.min(cur, MAX) / MAX * 300; liquid.setAttribute('y', y); liquid.setAttribute('height', 330 - y);
      const ty = 330 - target / MAX * 300; tgtLine.setAttribute('y1', ty); tgtLine.setAttribute('y2', ty); tgtTxt.setAttribute('y', ty + 5); tgtTxt.textContent = '🎯';
      curTxt.textContent = `Dans le chaudron : ${fmt(cur)} mL`;
    }
    function setup() {
      if (round >= N) { log('mesures', ok); head.textContent = N > 1 ? `Bravo ! ${ok} potions réussies sur ${N} !` : 'Bravo, la potion est parfaite !'; talk(head.textContent); shelf.replaceChildren(); actions.replaceChildren(endBtn(o, () => alchimiste())); Sfx.win(); burst(box); return; }
      const lv = round < 2 ? 0 : 1, units = lv ? ['mL', 'cL', 'dL', 'L'] : ['mL'];
      for (;;) {
        flasks = Array.from({ length: 4 }, () => ri(1, 12) * 50).map((ml) => ({ ml, u: units[ri(0, units.length - 1)] }));
        flasks.forEach((f) => { if (f.u === 'L' && f.ml % 100) f.u = 'cL'; if (f.u === 'dL' && f.ml % 100) f.u = 'cL'; });
        const pick = shuffle([0, 1, 2, 3]).slice(0, ri(2, 3)); target = pick.reduce((a, k) => a + flasks[k].ml, 0);
        if (target <= MAX && target >= 300 && !flasks.some((f) => f.ml === target)) break;
      }
      const tTxt = round === 0 || round === 3 ? capTxt(target, target % 1000 ? 'mL' : 'L') : target % 100 === 0 && Math.random() < 0.5 ? capTxt(target, target % 1000 ? 'dL' : 'L') : capTxt(target, target % 10 ? 'mL' : 'cL');
      cur = 0; used = [];
      head.textContent = `Potion ${round + 1}/${N} : prépare exactement ${tTxt} de potion. Chaque flacon ne peut être versé qu’une fois.`;
      talk(`Prépare exactement ${tTxt} de potion. Choisis les bons flacons et verse-les dans le chaudron.`);
      shelf.replaceChildren(...flasks.map((f, k) => h('button', { class: 'ws-flask', type: 'button', 'data-testid': 'ws-flask', style: `--c:hsl(${k * 80 + 280},80%,60%)`, onclick: (e) => {
        if (used.includes(k)) return; used.push(k); e.currentTarget.classList.add('empty'); cur += f.ml; Sfx.bloop(); draw();
        if (cur > target) talk(`Oups, ${fmt(cur)} mL, c’est trop ! Vide le chaudron et recommence.`, false);
      } }, h('span', { class: 'ws-bottle' }), h('b', null, capTxt(f.ml, f.u)), h('small', null, f.u === 'mL' ? '' : `= ${f.ml} mL`))));
      actions.replaceChildren(
        h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ws-check', onclick: () => {
          if (cur === target) { ok++; star(); Sfx.win(); burst(box); talk(`Parfait ! ${fmt(cur)} mL, c’est exactement ${tTxt}. La potion brille !`); round++; setTimeout(setup, 2600); }
          else talk(cur < target ? `Il manque encore ${fmt(target - cur)} mL.` : `Il y a ${fmt(cur - target)} mL de trop.`, false);
        } }, '✓ Vérifier la potion'),
        h('button', { class: 'btn small ghost', type: 'button', onclick: () => { cur = 0; used = []; shelf.querySelectorAll('.ws-flask').forEach((b) => b.classList.remove('empty')); draw(); } }, '↺ Vider le chaudron'),
        h('span', { class: 'muted ws-memo' }, '1 L = 10 dL = 100 cL = 1 000 mL'));
      draw();
    }
    setup();
  });
}

// ---------- 2. la balance enchantée (masses) ----------
const OBJ = [['🎃', 'la citrouille'], ['🍉', 'la pastèque'], ['🧀', 'le fromage'], ['📚', 'les livres'], ['🍍', 'l’ananas'], ['🥥', 'la noix de coco'], ['🐈', 'le petit chat en peluche']];
export function balance(o = {}) {
  const N = o.rounds || 4;
  shell('⚖️ La balance enchantée', 'Balance', (box, talk) => {
    const W = [[1000, '1 kg'], [500, '500 g'], [200, '200 g'], [100, '100 g'], [50, '50 g'], [20, '20 g'], [10, '10 g']];
    let round = 0, ok = 0, mass = 0, obj, onPan = [], solved = false;
    const svg = sv('svg', { viewBox: '0 0 520 300', class: 'ws-bal' });
    const beam = sv('g', { class: 'ws-beam' });
    const left = sv('g'), right = sv('g');
    svg.append(sv('rect', { x: 230, y: 250, width: 60, height: 14, rx: 4, fill: '#8a5a2c' }), sv('path', { d: 'M260,250 L250,90 L270,90 Z', fill: '#d9b06a' }), beam);
    beam.append(sv('rect', { x: 70, y: 84, width: 380, height: 10, rx: 5, fill: '#e7c56a' }), sv('circle', { cx: 260, cy: 89, r: 9, fill: '#fff3c4' }));
    svg.append(left, right);
    const needle = sv('text', { x: 260, y: 40, class: 'ws-small' });
    svg.append(needle);
    const head = h('p', { class: 'prompt' }), weights = h('div', { class: 'ws-weights' }), actions = h('div', { class: 'actions wrap' }), qbox = h('div');
    box.append(head, svg, weights, actions, qbox);
    const sum = () => onPan.reduce((a, b) => a + b, 0);
    function draw() {
      const d = sum() - mass, ang = Math.max(-14, Math.min(14, -d / 40));
      beam.setAttribute('transform', `rotate(${-ang} 260 89)`);
      const dy = 170 * Math.sin(-ang * Math.PI / 180);
      left.setAttribute('transform', `translate(0 ${-dy})`); right.setAttribute('transform', `translate(0 ${dy})`);
      const str = (x) => [sv('line', { x1: x, y1: 89, x2: x - 45, y2: 160, stroke: '#e7c56a', 'stroke-width': 1.5 }), sv('line', { x1: x, y1: 89, x2: x + 45, y2: 160, stroke: '#e7c56a', 'stroke-width': 1.5 })];
      left.replaceChildren(...str(90), sv('path', { d: 'M40,160 Q90,190 140,160 Z', fill: '#c9a24a' }), sv('text', { x: 90, y: 156, class: 'ws-obj' }, obj[0]));
      right.replaceChildren(...str(430), sv('path', { d: 'M380,160 Q430,190 480,160 Z', fill: '#c9a24a' }));
      const counts = {}; onPan.forEach((m) => { counts[m] = (counts[m] || 0) + 1; });
      let k = 0; for (const [m, n] of Object.entries(counts).sort((a, b) => b[0] - a[0])) { const t = sv('text', { x: 400 + (k % 2) * 60, y: 154 - Math.floor(k / 2) * 20, class: 'ws-wt', 'data-m': m }, (n > 1 ? `${n}×` : '') + (m >= 1000 ? '1 kg' : `${m} g`)); t.addEventListener('click', () => { if (solved) return; onPan.splice(onPan.indexOf(+m), 1); Sfx.tap(); draw(); }); right.append(t); k++; }
      needle.textContent = d === 0 ? '⚖️ Équilibre !' : d < 0 ? '⬅️ L’objet est plus lourd' : '➡️ Les masses sont plus lourdes';
    }
    function setup() {
      qbox.replaceChildren(); solved = false;
      if (round >= N) { log('masses', ok); head.textContent = N > 1 ? `Bravo ! ${ok} pesées réussies sur ${N} !` : 'Bravo, pesée réussie !'; talk(head.textContent); weights.replaceChildren(); actions.replaceChildren(endBtn(o, () => balance())); Sfx.win(); burst(box); return; }
      obj = OBJ[ri(0, OBJ.length - 1)]; mass = round < 2 ? ri(3, 19) * 50 : ri(11, 29) * 50 + (Math.random() < 0.5 ? ri(1, 4) * 10 : 0); onPan = [];
      head.textContent = `Pesée ${round + 1}/${N} : combien pèse ${obj[1]} ? Mets des masses sur le plateau de droite jusqu’à l’équilibre.`;
      talk(`Combien pèse ${obj[1]} ? Ajoute des masses jusqu’à ce que la balance soit en équilibre.`);
      weights.replaceChildren(...W.map(([m, l]) => h('button', { class: 'ws-weight', type: 'button', 'data-testid': 'ws-w', onclick: () => { if (solved) return; onPan.push(m); Sfx.tap(); draw(); if (sum() === mass) found(); } }, l)));
      actions.replaceChildren(h('button', { class: 'btn small ghost', type: 'button', onclick: () => { if (solved) return; onPan = []; draw(); } }, '↺ Retirer toutes les masses'), h('span', { class: 'muted ws-memo' }, '1 kg = 1 000 g · Touche une masse sur le plateau pour la retirer'));
      draw();
    }
    function found() {
      solved = true; Sfx.coin(); talk(`Équilibre ! ${obj[1]} pèse autant que tes masses. Combien pèse-t-${obj[1].startsWith('les') ? 'ils' : 'il'} ?`, true);
      const kg = Math.floor(mass / 1000), g = mass % 1000, right = mass >= 1000 ? `${kg} kg ${g ? g + ' g' : ''}`.trim() : `${mass} g`;
      const wrongs = shuffle([mass + 100, mass - 50, mass + 10, mass * 10].filter((x) => x > 0 && x !== mass)).slice(0, 2).map((x) => (x >= 1000 ? `${Math.floor(x / 1000)} kg ${x % 1000 ? x % 1000 + ' g' : ''}`.trim() : `${x} g`));
      qcm(qbox, talk, [{ q: `${obj[0]} Combien pèse ${obj[1]} ?`, opts: [right, ...wrongs], why: `Les masses font ${fmt(mass)} g${mass >= 1000 ? ` = ${right}` : ''}.` }], (o) => { ok += o; round++; setTimeout(setup, 900); });
    }
    setup();
  });
}

// ---------- 3. l'architecte des solides ----------
function solidMesh(k) {
  const V = [], F = [];
  const box = (w, hh, d) => { const p = [[-w, -hh, -d], [w, -hh, -d], [w, hh, -d], [-w, hh, -d], [-w, -hh, d], [w, -hh, d], [w, hh, d], [-w, hh, d]]; V.push(...p); F.push([0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [4, 5, 1, 0], [3, 2, 6, 7]); };
  if (k === 'cube') box(1, 1, 1);
  if (k === 'pave') box(1.5, 0.8, 0.9);
  if (k === 'pyramide') { V.push([-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1], [0, -1.3, 0]); F.push([3, 2, 1, 0], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]); }
  if (k === 'prisme') { V.push([-1.2, 0.9, -0.8], [1.2, 0.9, -0.8], [0, -0.9, -0.8], [-1.2, 0.9, 0.8], [1.2, 0.9, 0.8], [0, -0.9, 0.8]); F.push([0, 1, 2], [5, 4, 3], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]); }
  const N = 28;
  if (k === 'cylindre' || k === 'cone') {
    for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; V.push([Math.cos(a), 1, Math.sin(a)]); }
    if (k === 'cylindre') { for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; V.push([Math.cos(a), -1, Math.sin(a)]); } for (let i = 0; i < N; i++) F.push({ q: [i, (i + 1) % N, N + (i + 1) % N, N + i], curve: true }); F.push([...Array(N).keys()].reverse(), [...Array(N).keys()].map((i) => N + i)); }
    else { V.push([0, -1.3, 0]); for (let i = 0; i < N; i++) F.push({ q: [i, (i + 1) % N, N], curve: true }); F.push([...Array(N).keys()].reverse()); }
  }
  if (k === 'sphere') { const R = 10, C = 20; for (let r = 0; r <= R; r++) for (let c = 0; c < C; c++) { const t = r / R * Math.PI, p = c / C * Math.PI * 2; V.push([Math.sin(t) * Math.cos(p) * 1.15, Math.cos(t) * 1.15, Math.sin(t) * Math.sin(p) * 1.15]); } for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) F.push({ q: [r * C + c, r * C + (c + 1) % C, (r + 1) * C + (c + 1) % C, (r + 1) * C + c], curve: true }); }
  return { V, F: F.map((f) => (Array.isArray(f) ? { q: f, curve: false } : f)) };
}
const SOLIDS = {
  cube: { n: 'le cube', f: 6, a: 12, s: 8, d: '6 faces carrées identiques.' },
  pave: { n: 'le pavé droit', f: 6, a: 12, s: 8, d: '6 faces rectangulaires.' },
  pyramide: { n: 'la pyramide à base carrée', f: 5, a: 8, s: 5, d: 'une base carrée et 4 faces triangulaires.' },
  prisme: { n: 'le prisme à base triangulaire', f: 5, a: 9, s: 6, d: '2 bases triangulaires et 3 faces rectangulaires.' },
  cylindre: { n: 'le cylindre', curve: true, d: '2 disques et une surface courbe : il roule !' },
  cone: { n: 'le cône', curve: true, d: 'un disque, une surface courbe et une pointe : il roule en rond.' },
  sphere: { n: 'la boule (sphère)', curve: true, d: 'une seule surface courbe : elle roule dans tous les sens.' },
};
function viewer(k) {
  const svg = sv('svg', { viewBox: '-160 -140 320 280', class: 'ws-solid' }), g = sv('g'); svg.append(g);
  const { V, F } = solidMesh(k); let ry = 0.6, rx = -0.45, raf = 0, auto = true;
  const draw = () => {
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    const P = V.map(([x, y, z]) => { const X = x * cy - z * sy, Z1 = x * sy + z * cy, Y = y * cx - Z1 * sx, Z = y * sx + Z1 * cx; return [X * 80, Y * 80, Z]; });
    const polys = F.map((f) => { const pts = f.q.map((i) => P[i]); const [a, b, c] = pts; const nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); return { f, pts, nz, z: pts.reduce((s, p) => s + p[2], 0) / pts.length }; }).filter((p) => p.nz < 0).sort((a, b) => b.z - a.z);
    g.replaceChildren(...polys.map(({ f, pts, nz }) => { const area = Math.abs(nz), l = Math.min(1, 0.45 + 0.55 * Math.min(1, area / 20000)); const sh = Math.round(160 + 70 * l); return sv('polygon', { points: pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' '), fill: `rgb(${sh - 60},${sh - 20},255)`, stroke: f.curve ? `rgb(${sh - 60},${sh - 20},255)` : '#1d1650', 'stroke-width': f.curve ? 0.8 : 2.5, 'stroke-linejoin': 'round' }); }));
  };
  const loop = () => { if (!svg.isConnected && raf) return; if (auto) ry += 0.012; draw(); raf = requestAnimationFrame(loop); };
  let px = null, py = null;
  svg.addEventListener('pointerdown', (e) => { auto = false; px = e.clientX; py = e.clientY; svg.setPointerCapture(e.pointerId); });
  svg.addEventListener('pointermove', (e) => { if (px == null) return; ry += (e.clientX - px) * 0.012; rx += (e.clientY - py) * 0.012; px = e.clientX; py = e.clientY; });
  svg.addEventListener('pointerup', () => { px = null; });
  raf = requestAnimationFrame(loop);
  return svg;
}
// patrons (vus à plat)
function net(k) {
  const svg = sv('svg', { viewBox: '0 0 200 160', class: 'ws-net' }), st = { fill: '#cfe0ff', stroke: '#1d1650', 'stroke-width': 1.5 };
  const sq = (x, y, w, hh) => svg.append(sv('rect', { x, y, width: w, height: hh, ...st }));
  const tri = (pts) => svg.append(sv('polygon', { points: pts, ...st }));
  if (k === 'cube') { sq(30, 55, 35, 35); sq(65, 55, 35, 35); sq(100, 55, 35, 35); sq(135, 55, 35, 35); sq(65, 20, 35, 35); sq(65, 90, 35, 35); }
  if (k === 'pave') { sq(20, 60, 25, 40); sq(45, 60, 55, 40); sq(100, 60, 25, 40); sq(125, 60, 55, 40); sq(45, 35, 55, 25); sq(45, 100, 55, 25); }
  if (k === 'pyramide') { sq(75, 55, 50, 50); tri('75,55 125,55 100,15'); tri('75,105 125,105 100,145'); tri('75,55 75,105 35,80'); tri('125,55 125,105 165,80'); }
  if (k === 'prisme') { sq(30, 55, 45, 50); sq(75, 55, 45, 50); sq(120, 55, 45, 50); tri('75,55 120,55 97.5,16'); tri('75,105 120,105 97.5,144'); }
  if (k === 'cylindre') { sq(40, 50, 120, 60); svg.append(sv('circle', { cx: 80, cy: 31, r: 19, ...st }), sv('circle', { cx: 80, cy: 129, r: 19, ...st })); }
  if (k === 'cone') { svg.append(sv('path', { d: 'M100,20 L40,110 A72,72 0 0 0 160,110 Z', ...st }), sv('circle', { cx: 100, cy: 135, r: 22, ...st })); }
  return svg;
}
export { SOLIDS, viewer, net, qcm, shell, burst, star, shuffle, ri };
export function solides() {
  shell('🧊 L’architecte des solides', 'Solides', (box, talk) => {
    const keys = Object.keys(SOLIDS);
    const tabs = [['decouvrir', '🔎 Découvrir'], ['compter', '🔢 Compter'], ['patrons', '📄 Les patrons']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'ws-' + k, onclick: () => go(k) }, l));
    const body = h('div');
    box.append(h('div', { class: 'actions wrap' }, ...tabs), body);
    function go(k) {
      tabs.forEach((b) => b.classList.toggle('primary', b.dataset.testid === 'ws-' + k)); body.replaceChildren(); Voice.stop(); talk('', false);
      if (k === 'decouvrir') {
        let cur = 'cube'; const view = h('div', { class: 'ws-view' }), info = h('div', { class: 'ws-info' });
        const show = (s) => { cur = s; view.replaceChildren(viewer(s)); const o = SOLIDS[s]; info.replaceChildren(h('strong', null, o.n[0].toUpperCase() + o.n.slice(1)), h('p', null, o.d), o.curve ? h('p', { class: 'muted' }, 'Ce solide a une surface courbe : ce n’est pas un polyèdre.') : h('p', null, `${o.f} faces · ${o.a} arêtes · ${o.s} sommets`)); talk(`${o.n} : ${o.d}${o.curve ? '' : ` Ce solide a ${o.f} faces, ${o.a} arêtes et ${o.s} sommets.`}`); chips.forEach((c) => c.classList.toggle('primary', c.dataset.s === s)); };
        const chips = keys.map((s) => h('button', { class: 'btn small', type: 'button', 'data-s': s, onclick: () => show(s) }, SOLIDS[s].n.replace(/^(le |la |l’)/, '').replace(' (sphère)', '')));
        body.append(h('div', { class: 'actions wrap' }, ...chips), h('div', { class: 'ws-lab' }, view, info), h('p', { class: 'muted' }, 'Fais tourner le solide avec ton doigt. Face = surface plate · arête = ligne où deux faces se rencontrent · sommet = pointe où se rejoignent les arêtes.'));
        show(cur);
      }
      if (k === 'compter') {
        const poly = keys.filter((s) => !SOLIDS[s].curve), list = shuffle(poly.flatMap((s) => [['f', 'faces'], ['a', 'arêtes'], ['s', 'sommets']].map(([c, n]) => ({ s, c, n })))).slice(0, 6);
        const view = h('div', { class: 'ws-view' }), qhost = h('div');
        body.append(h('div', { class: 'ws-lab' }, view, qhost));
        let idx = 0;
        const step = () => {
          if (idx >= list.length) { view.replaceChildren(); log('solides'); return; }
          const it = list[idx], o = SOLIDS[it.s], right = o[it.c];
          view.replaceChildren(viewer(it.s)); qhost.replaceChildren();
          qcm(qhost, talk, [{ q: `Combien de ${it.n} a ${o.n} ? (fais-le tourner pour compter)`, opts: [right, ...shuffle([right + 1, right - 1, right + 2, right + 4].filter((x) => x > 0 && x !== right)).slice(0, 2)], why: `${o.n[0].toUpperCase() + o.n.slice(1)} a ${o.f} faces, ${o.a} arêtes et ${o.s} sommets.` }], () => { idx++; setTimeout(step, 400); });
        };
        step();
      }
      if (k === 'patrons') {
        const list = shuffle(['cube', 'pave', 'pyramide', 'prisme', 'cylindre', 'cone']).slice(0, 5);
        const view = h('div', { class: 'ws-view net' }), qhost = h('div');
        body.append(h('p', { class: 'muted' }, 'Un patron, c’est le solide « déplié » à plat. Si on le plie, on obtient quel solide ?'), h('div', { class: 'ws-lab' }, view, qhost));
        let idx = 0;
        const step = () => {
          if (idx >= list.length) { view.replaceChildren(); log('solides'); return; }
          const s = list[idx]; view.replaceChildren(net(s)); qhost.replaceChildren();
          qcm(qhost, talk, [{ q: 'Quel solide obtient-on en pliant ce patron ?', opts: [SOLIDS[s].n, ...shuffle(keys.filter((x) => x !== s && x !== 'sphere').map((x) => SOLIDS[x].n)).slice(0, 2)], why: `C’est le patron ${s === 'pave' || s === 'prisme' || s === 'cube' || s === 'cylindre' || s === 'cone' ? 'du ' + SOLIDS[s].n.replace(/^le /, '') : 'de ' + SOLIDS[s].n} : ${SOLIDS[s].d}` }], () => { idx++; setTimeout(step, 400); });
        };
        step();
      }
    }
    go('decouvrir');
  });
}

// ---------- 4. le chaudron des fractions ----------
const COL = { bleu: '#3fa9ff', rouge: '#ff5a6a', jaune: '#ffd84a', vert: '#3ee08f' };
export function chaudron(o = {}) {
  const N = o.rounds || 4;
  shell('🧪 Le chaudron des fractions', 'Chaudron', (box, talk) => {
    const RECIPES = [
      { bleu: [1, 2], rouge: [1, 4], jaune: [1, 4] },
      { vert: [1, 2], bleu: [1, 2] },
      { rouge: [3, 4], jaune: [1, 4] },
      { bleu: [1, 4], rouge: [1, 4], vert: [1, 2] },
      { jaune: [1, 2], rouge: [1, 4], bleu: [1, 8], vert: [1, 8] },
      { vert: [3, 8], bleu: [5, 8] },
    ];
    const L = 8; // tout est compté en huitièmes
    let round = 0, ok = 0, rec, mix = []; const order = [0, ...shuffle([1, 2, 3, 4, 5])];
    const head = h('p', { class: 'prompt' }), bar = h('div', { class: 'ws-bar' }), btns = h('div', { class: 'ws-doses' }), actions = h('div', { class: 'actions wrap' }), qhost = h('div');
    const pot = sv('svg', { viewBox: '0 0 200 160', class: 'ws-pot' }), potLiq = sv('ellipse', { cx: 100, cy: 70, rx: 70, ry: 16, fill: '#444' });
    pot.append(sv('path', { d: 'M25,65 Q25,150 100,150 Q175,150 175,65 Z', fill: '#2b2440', stroke: '#8a7aa8', 'stroke-width': 4 }), potLiq, sv('ellipse', { cx: 100, cy: 65, rx: 76, ry: 14, fill: 'none', stroke: '#8a7aa8', 'stroke-width': 5 }));
    box.append(head, h('div', { class: 'ws-lab' }, pot, h('div', { class: 'ws-side' }, bar, btns)), actions, qhost);
    const frac = ([n, d]) => `${n}/${d}`;
    const eighths = ([n, d]) => n * (L / d);
    function draw() {
      bar.replaceChildren(...Array.from({ length: L }, (_, i) => h('span', { style: mix[i] ? `background:${COL[mix[i]]}` : '' })));
      const counts = {}; mix.forEach((c) => { counts[c] = (counts[c] || 0) + 1; });
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      potLiq.setAttribute('fill', mix.length ? COL[top[0]] : '#444'); potLiq.setAttribute('opacity', mix.length ? 0.4 + 0.6 * mix.length / L : 1);
    }
    function setup() {
      qhost.replaceChildren();
      if (round >= N) { log('fractions', ok); if (o.onDone) { head.textContent = 'La potion de fractions est prête !'; btns.replaceChildren(); actions.replaceChildren(endBtn(o)); return; } return finale(); }
      rec = RECIPES[order[round]]; mix = [];
      const parts = Object.entries(rec).map(([c, f]) => `${frac(f)} de ${c}`);
      head.textContent = `Recette ${round + 1}/${N} : verse ${parts.join(', ')}. Le chaudron doit être plein : 1 entier.`;
      talk(`Voici la recette : ${parts.join(', ')}.`);
      btns.replaceChildren(...Object.keys(COL).flatMap((c) => [[1, 2], [1, 4], [1, 8]].map((f) => h('button', { class: 'ws-dose', type: 'button', 'data-testid': 'ws-dose', style: `--c:${COL[c]}`, onclick: () => { const n = eighths(f); if (mix.length + n > L) { talk('Attention, ça déborde ! Le chaudron ne contient qu’une dose entière.', false); Sfx.tap(); return; } for (let i = 0; i < n; i++) mix.push(c); Sfx.bloop(); draw(); } }, `+${frac(f)} ${c}`))));
      actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ws-mix', onclick: check }, '🥄 Mélanger'), h('button', { class: 'btn small ghost', type: 'button', onclick: () => { mix = []; draw(); } }, '↺ Vider'), h('span', { class: 'muted ws-memo' }, '1 = 2/2 = 4/4 = 8/8 · 1/2 = 2/4 = 4/8 · 1/4 = 2/8'));
      draw();
    }
    function check() {
      const got = {}; mix.forEach((c) => { got[c] = (got[c] || 0) + 1; });
      const good = Object.keys(COL).every((c) => (got[c] || 0) === (rec[c] ? eighths(rec[c]) : 0));
      if (good) { ok++; star(); Sfx.win(); burst(box); pot.classList.add('glow'); setTimeout(() => pot.classList.remove('glow'), 1600); talk('La potion brille ! Toutes les fractions sont justes et le chaudron est plein : 1 entier.'); round++; setTimeout(setup, 2600); }
      else { Sfx.tap(); const fill = mix.length; talk(fill < L ? `Le chaudron n’est pas plein : il manque ${L - fill}/8.` : 'Le chaudron est plein, mais les couleurs ne suivent pas la recette. Vide-le et recommence !', false); }
    }
    function finale() {
      head.textContent = `Bravo ! ${ok} potions réussies. Maintenant, un petit défi sur les fractions :`; btns.replaceChildren(); actions.replaceChildren(); bar.replaceChildren();
      qcm(qhost, talk, shuffle([
        { q: 'Combien de quarts faut-il pour faire un entier ?', opts: ['4', '2', '8'], why: '4/4 = 1 entier.' },
        { q: 'Quelle fraction est égale à 1/2 ?', opts: ['2/4', '1/4', '2/3'], why: '1/2 = 2/4 = 4/8.' },
        { q: 'Qu’est-ce qui est le plus grand ?', opts: ['1/2', '1/4', '1/8'], why: 'Plus on partage en beaucoup de parts, plus chaque part est petite : 1/2 > 1/4 > 1/8.' },
        { q: '1/4 + 1/4 = ?', opts: ['1/2', '2/8', '1/8'], why: 'Deux quarts font une moitié : 1/4 + 1/4 = 2/4 = 1/2.' },
        { q: 'Combien de huitièmes dans 3/4 ?', opts: ['6', '3', '4'], why: '1/4 = 2/8, donc 3/4 = 6/8.' },
      ]).slice(0, 4), () => box.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => chaudron() }, '↻ Recommencer'))));
    }
    setup();
  });
}
