// Atelier des merveilles : les énigmes de la porte magique (périmètre, aire, angles, quadrilatères),
// la mission « Le Secret de la Potion des Étoiles » et le carnet des expériences.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import * as WS from './workshop.js';
import * as Papa from './papa.js';

const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };
const { shuffle, ri } = WS;
const pick = (a) => a[ri(0, a.length - 1)];
const uniq = (right, xs) => [...new Set(xs.filter((x) => x !== right && !(typeof x === 'number' && x <= 0)))];
const opts3 = (right, xs, unit = '') => [right, ...shuffle(uniq(right, xs)).slice(0, 2)].map((x) => (typeof x === 'number' ? `${x}${unit}` : x));

// ---------- dessins ----------
const U = 24;
function gridShape(cells) {
  const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1]);
  const W = Math.max(...xs) + 3, H = Math.max(...ys) + 3;
  const svg = sv('svg', { viewBox: `0 0 ${W * U} ${H * U}`, class: 'q-fig' });
  for (let x = 0; x <= W; x++) svg.append(sv('line', { x1: x * U, x2: x * U, y1: 0, y2: H * U, class: 'q-grid' }));
  for (let y = 0; y <= H; y++) svg.append(sv('line', { y1: y * U, y2: y * U, x1: 0, x2: W * U, class: 'q-grid' }));
  const set = new Set(cells.map(([x, y]) => `${x},${y}`));
  cells.forEach(([x, y]) => svg.append(sv('rect', { x: (x + 1) * U, y: (y + 1) * U, width: U, height: U, class: 'q-cell' })));
  cells.forEach(([x, y]) => {
    const X = (x + 1) * U, Y = (y + 1) * U;
    if (!set.has(`${x},${y - 1}`)) svg.append(sv('line', { x1: X, x2: X + U, y1: Y, y2: Y, class: 'q-edge' }));
    if (!set.has(`${x},${y + 1}`)) svg.append(sv('line', { x1: X, x2: X + U, y1: Y + U, y2: Y + U, class: 'q-edge' }));
    if (!set.has(`${x - 1},${y}`)) svg.append(sv('line', { x1: X, x2: X, y1: Y, y2: Y + U, class: 'q-edge' }));
    if (!set.has(`${x + 1},${y}`)) svg.append(sv('line', { x1: X + U, x2: X + U, y1: Y, y2: Y + U, class: 'q-edge' }));
  });
  return svg;
}
function perim(cells) { const set = new Set(cells.map(([x, y]) => `${x},${y}`)); let p = 0; cells.forEach(([x, y]) => { [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (!set.has(`${x + dx},${y + dy}`)) p++; }); }); return p; }
function randShape() {
  const w = ri(3, 6), hh = ri(2, 4), cells = [];
  for (let x = 0; x < w; x++) for (let y = 0; y < hh; y++) cells.push([x, y]);
  if (Math.random() < 0.6) { // on enlève un coin pour faire une forme en L
    const cw = ri(1, w - 2), chh = ri(1, hh - 1), right = Math.random() < 0.5, top = Math.random() < 0.5;
    return cells.filter(([x, y]) => !((right ? x >= w - cw : x < cw) && (top ? y < chh : y >= hh - chh)));
  }
  return cells;
}
function rectLabeled(L, l) {
  const s = Math.min(150 / L, 90 / l), w = L * s, hh = l * s, x0 = (220 - w) / 2, y0 = (150 - hh) / 2 + 6;
  return sv('svg', { viewBox: '0 0 220 160', class: 'q-fig' }, sv('rect', { x: x0, y: y0, width: w, height: hh, class: 'q-shape' }),
    sv('text', { x: 110, y: y0 - 8, class: 'q-lbl', style: 'text-anchor:middle' }, `${L} cm`), sv('text', { x: x0 + w + 8, y: y0 + hh / 2 + 5, class: 'q-lbl', style: 'text-anchor:start' }, `${l} cm`));
}
function angleFig(m) {
  const vx = 50, vy = 125, r = 150, a = -m * Math.PI / 180, rot = ri(-14, 0);
  const g = sv('g', { transform: `rotate(${rot} ${vx} ${vy})` },
    sv('line', { x1: vx, y1: vy, x2: vx + r, y2: vy, class: 'q-ray' }), sv('line', { x1: vx, y1: vy, x2: vx + r * Math.cos(a), y2: vy + r * Math.sin(a), class: 'q-ray' }),
    m === 90 ? sv('path', { d: `M${vx + 22},${vy} L${vx + 22},${vy - 22} L${vx},${vy - 22}`, class: 'q-arc' }) : sv('path', { d: `M${vx + 34},${vy} A34,34 0 0 0 ${vx + 34 * Math.cos(a)},${vy + 34 * Math.sin(a)}`, class: 'q-arc' }),
    sv('circle', { cx: vx, cy: vy, r: 4, fill: '#ffe9a8' }));
  return sv('svg', { viewBox: '0 -40 240 190', class: 'q-fig' }, g);
}
const QUADS = {
  carre: { n: 'un carré', p: [[60, 25], [160, 25], [160, 125], [60, 125]], ticks: [1, 1, 1, 1], right: true },
  rectangle: { n: 'un rectangle', p: [[25, 40], [175, 40], [175, 115], [25, 115]], ticks: [1, 2, 1, 2], right: true },
  losange: { n: 'un losange', p: [[100, 8], [150, 75], [100, 142], [50, 75]], ticks: [1, 1, 1, 1] },
  parallelogramme: { n: 'un parallélogramme', p: [[60, 35], [185, 35], [140, 115], [15, 115]], ticks: [1, 2, 1, 2] },
  trapeze: { n: 'un trapèze', p: [[65, 30], [135, 30], [180, 120], [20, 120]], ticks: [0, 0, 0, 0] },
};
function quadFig(k) {
  const q = QUADS[k], svg = sv('svg', { viewBox: '0 0 200 150', class: 'q-fig' });
  svg.append(sv('polygon', { points: q.p.map((p) => p.join(',')).join(' '), class: 'q-shape' }));
  q.p.forEach((a, i) => {
    const b = q.p[(i + 1) % 4], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, tx = dx / L, ty = dy / L;
    for (let t = 0; t < q.ticks[i]; t++) { const o = (t - (q.ticks[i] - 1) / 2) * 6; svg.append(sv('line', { x1: mx + tx * o - nx * 7, y1: my + ty * o - ny * 7, x2: mx + tx * o + nx * 7, y2: my + ty * o + ny * 7, class: 'q-tick' })); }
    if (q.right) { const c = q.p[(i + 3) % 4], ux = (b[0] - a[0]) / Math.hypot(b[0] - a[0], b[1] - a[1]), uy = (b[1] - a[1]) / Math.hypot(b[0] - a[0], b[1] - a[1]), wx = (c[0] - a[0]) / Math.hypot(c[0] - a[0], c[1] - a[1]), wy = (c[1] - a[1]) / Math.hypot(c[0] - a[0], c[1] - a[1]), s = 11; svg.append(sv('path', { d: `M${a[0] + ux * s},${a[1] + uy * s} L${a[0] + ux * s + wx * s},${a[1] + uy * s + wy * s} L${a[0] + wx * s},${a[1] + wy * s}`, class: 'q-arc' })); }
  });
  return svg;
}

// ---------- générateurs d'énigmes ----------
const GEN = {
  per() {
    const t = ri(0, 2);
    if (t === 0) { const c = randShape(), p = perim(c); return { pic: () => gridShape(c), q: 'Chaque carreau mesure 1 cm de côté. Quel est le périmètre de la figure ?', opts: opts3(p, [c.length, p + 2, p - 2, p + 4], ' cm'), why: `On fait le tour de la figure en comptant les côtés des carreaux : ${p} cm.` }; }
    if (t === 1) { const L = ri(4, 12), l = ri(2, L - 1), p = 2 * (L + l); return { pic: () => rectLabeled(L, l), q: `Ce rectangle mesure ${L} cm de long et ${l} cm de large. Quel est son périmètre ?`, opts: opts3(p, [L * l, L + l, 2 * L + l, p + 2], ' cm'), why: `Périmètre = ${L} + ${l} + ${L} + ${l} = ${p} cm.` }; }
    const c = ri(3, 12), p = 4 * c; return { pic: () => rectLabeled(c, c), q: `Un carré a des côtés de ${c} cm. Quel est son périmètre ?`, opts: opts3(p, [c * c, 2 * c, c + 4, p + 4], ' cm'), why: `Un carré a 4 côtés égaux : 4 × ${c} = ${p} cm.` };
  },
  air() {
    const t = ri(0, 1);
    if (t === 0) { const c = randShape(), a = c.length; return { pic: () => gridShape(c), q: 'Chaque carreau est un carré de 1 cm². Quelle est l’aire de la figure ?', opts: opts3(a, [perim(c), a + 1, a - 1, a + 2], ' cm²'), why: `On compte les carreaux à l’intérieur : ${a} carreaux, donc ${a} cm².` }; }
    const L = ri(2, 6), l = ri(2, 4), cells = []; for (let x = 0; x < L; x++) for (let y = 0; y < l; y++) cells.push([x, y]); const a = L * l;
    return { pic: () => gridShape(cells), q: `Ce rectangle a ${l} rangées de ${L} carreaux de 1 cm². Quelle est son aire ?`, opts: opts3(a, [2 * (L + l), L + l, a + L, a - l], ' cm²'), why: `${l} rangées de ${L} carreaux : ${l} × ${L} = ${a} cm².` };
  },
  ang() {
    const t = ri(0, 3);
    if (t < 3) { const m = pick([30, 45, 60, 90, 90, 115, 135, 150]), k = m < 90 ? 'aigu' : m === 90 ? 'droit' : 'obtus'; return { pic: () => angleFig(m), q: 'Cet angle est-il aigu, droit ou obtus ?', opts: [k, ...['aigu', 'droit', 'obtus'].filter((x) => x !== k)], why: k === 'droit' ? 'Il est droit : il a la forme du coin de l’équerre.' : k === 'aigu' ? 'Il est aigu : plus petit qu’un angle droit (plus fermé que le coin de l’équerre).' : 'Il est obtus : plus grand qu’un angle droit (plus ouvert que le coin de l’équerre).' }; }
    return pick([
      { q: 'Combien d’angles droits a un rectangle ?', opts: ['4', '2', '0'], why: 'Un rectangle a 4 angles droits.' },
      { q: 'Quel outil utilise-t-on pour vérifier un angle droit ?', opts: ['l’équerre', 'le compas', 'la balance'], why: 'L’équerre a un coin qui forme un angle droit.' },
      { q: 'Un angle plus ouvert qu’un angle droit s’appelle…', opts: ['un angle obtus', 'un angle aigu', 'un angle plat'], why: 'Plus ouvert qu’un angle droit : obtus. Plus fermé : aigu.' },
    ]);
  },
  quad() {
    const t = ri(0, 2), keys = Object.keys(QUADS);
    if (t < 2) { const k = pick(keys), n = QUADS[k].n; return { pic: () => quadFig(k), q: 'Quel est ce quadrilatère ? (les petits traits montrent les côtés de même longueur)', opts: [n, ...shuffle(keys.filter((x) => x !== k).map((x) => QUADS[x].n)).slice(0, 2)], why: { carre: 'Un carré : 4 côtés égaux et 4 angles droits.', rectangle: 'Un rectangle : 4 angles droits et les côtés opposés égaux.', losange: 'Un losange : 4 côtés égaux, mais pas d’angle droit.', parallelogramme: 'Un parallélogramme : les côtés opposés sont parallèles et de même longueur.', trapeze: 'Un trapèze : seulement 2 côtés parallèles.' }[k] }; }
    return pick([
      { q: 'J’ai 4 côtés de même longueur et 4 angles droits. Qui suis-je ?', opts: ['un carré', 'un losange', 'un rectangle'], why: 'C’est le carré.' },
      { q: 'J’ai 4 côtés de même longueur mais aucun angle droit. Qui suis-je ?', opts: ['un losange', 'un carré', 'un trapèze'], why: 'C’est le losange.' },
      { q: 'J’ai seulement 2 côtés parallèles. Qui suis-je ?', opts: ['un trapèze', 'un rectangle', 'un carré'], why: 'C’est le trapèze.' },
      { q: 'Un carré est-il aussi un rectangle ?', opts: ['Oui, il a 4 angles droits', 'Non, jamais', 'Seulement s’il est grand'], why: 'Le carré a 4 angles droits : c’est un rectangle spécial, avec 4 côtés égaux.' },
    ]);
  },
};
const FAM = [
  ['per', '☀️', 'Le soleil du périmètre', '#ffd84a'],
  ['ang', '🔺', 'Le triangle des angles', '#3fa9ff'],
  ['air', '🟩', 'Le carré des aires', '#3ee08f'],
  ['quad', '⭐', 'L’étoile des quadrilatères', '#ff6fc8'],
];

function door(state) {
  const svg = sv('svg', { viewBox: '0 0 300 360', class: 'q-door' + (FAM.every(([k]) => state[k]) ? ' open' : '') });
  svg.append(sv('path', { d: 'M30,350 L30,140 A120,120 0 0 1 270,140 L270,350 Z', fill: '#4a2c6e', stroke: '#c9a24a', 'stroke-width': 8 }),
    sv('line', { x1: 150, y1: 22, x2: 150, y2: 350, stroke: '#c9a24a', 'stroke-width': 3, opacity: 0.6 }),
    sv('circle', { cx: 150, cy: 190, r: 92, fill: 'none', stroke: '#c9a24a', 'stroke-width': 4 }),
    sv('circle', { cx: 150, cy: 190, r: 26, fill: FAM.every(([k]) => state[k]) ? '#c86bff' : '#2b1a40', stroke: '#c9a24a', 'stroke-width': 3, class: 'q-core' }));
  return svg;
}
export function porte(o = {}) {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div', { class: 'q-body' });
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel' }, UI.closeButton(), h('h2', null, '🚪 Les énigmes de la porte magique'), body, say), { label: 'Porte magique', onClose: () => Voice.stop() });
  const st = () => { const b = S.get(); return b.porte || (b.porte = {}); };
  function home() {
    const state = st(), dw = h('div', { class: 'q-doorwrap' }, door(state));
    const pos = [[150, 98], [242, 190], [150, 282], [58, 190]];
    FAM.forEach(([k, ic, name, col], i) => dw.append(h('button', { class: 'q-sym' + (state[k] ? ' lit' : ''), type: 'button', 'data-testid': 'q-' + k, style: `left:${pos[i][0] / 3}%;top:${pos[i][1] / 3.6}%;--c:${col}`, 'aria-label': name, onclick: () => fam(k) }, ic)));
    const n = FAM.filter(([k]) => state[k]).length;
    body.replaceChildren(h('div', { class: 'ws-lab' }, dw, h('div', { class: 'ws-side' },
      h('p', { class: 'prompt' }, n === 4 ? 'La porte magique est ouverte ! Tu as résolu toutes les énigmes. Tu peux rejouer chaque symbole.' : `La porte est fermée par 4 symboles magiques. Touche un symbole et résous ses énigmes pour l’allumer (${n}/4).`),
      ...FAM.map(([k, ic, name]) => h('button', { class: 'btn small' + (state[k] ? ' primary' : ''), type: 'button', onclick: () => fam(k) }, `${ic} ${name}${state[k] ? ' ✓' : ''}`)))));
    talk(n === 4 ? 'La porte magique est ouverte !' : 'Touche un symbole de la porte pour résoudre ses énigmes.');
  }
  function fam(k) {
    const f = FAM.find((x) => x[0] === k), host = h('div'); talk('', false);
    body.replaceChildren(h('h3', null, `${f[1]} ${f[2]}`), host);
    WS.qcm(host, talk, Array.from({ length: 4 }, () => GEN[k]()), (ok) => {
      WS.log('enigmes', ok >= 3 ? 1 : 0);
      if (ok >= 3) {
        const state = st(), was = FAM.every(([x]) => state[x]); state[k] = true; S.save();
        const all = FAM.every(([x]) => state[x]);
        if (all && !was) { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + 3; S.save(); Sfx.win(); talk('Les 4 symboles brillent… La porte magique s’ouvre ! Trois étoiles en cadeau !'); WS.burst(body); }
        else talk(`Le symbole ${f[2].toLowerCase()} s’allume !`);
      } else talk('Il faut au moins 3 bonnes réponses pour allumer le symbole. Essaie encore !');
      host.append(h('div', { class: 'actions' }, o.onDone ? null : h('button', { class: 'btn small', type: 'button', onclick: () => fam(k) }, '↻ Rejouer'), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'q-back', onclick: () => (o.onDone ? o.onDone() : home()) }, o.onDone ? '➡️ Continuer la mission' : '🚪 Retour à la porte')));
    });
  }
  if (o.mix) { // version mission : une énigme de chaque famille
    const host = h('div'); body.replaceChildren(h('p', { class: 'prompt' }, 'Dernière épreuve : résous une énigme de chaque symbole pour ouvrir la porte !'), host);
    WS.qcm(host, talk, FAM.map(([k]) => GEN[k]()), (ok) => {
      WS.log('enigmes', ok >= 3 ? 1 : 0);
      if (ok >= 3) host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ws-next', onclick: () => o.onDone() }, '➡️ Ouvrir la porte')));
      else { talk('Il faut au moins 3 bonnes réponses. On réessaie !'); host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => porte(o) }, '↻ Réessayer'))); }
    });
    return;
  }
  home();
}

// ---------- l'épreuve du cristal (solides) ----------
function cristal(o) {
  WS.shell('💎 Le cristal parfait', 'Cristal', (box, talk) => {
    const k = pick(['cube', 'pave', 'pyramide', 'prisme']), sol = WS.SOLIDS[k], host = h('div');
    box.append(h('p', { class: 'prompt' }, 'Le cristal magique a la forme d’un solide. Fais-le tourner et réponds pour le récupérer !'), h('div', { class: 'ws-lab' }, h('div', { class: 'ws-view' }, WS.viewer(k)), host));
    const others = Object.keys(WS.SOLIDS).filter((x) => x !== k);
    WS.qcm(host, talk, [
      { q: 'Comment s’appelle ce solide ?', opts: [sol.n, ...shuffle(others).slice(0, 2).map((x) => WS.SOLIDS[x].n)], why: `C’est ${sol.n} : ${sol.d}` },
      { q: `Combien de faces a ${sol.n} ?`, opts: opts3(sol.f, [sol.f + 1, sol.f - 1, sol.f + 2]), why: `${sol.f} faces.` },
      { q: `Combien de sommets a ${sol.n} ?`, opts: opts3(sol.s, [sol.s + 1, sol.s - 1, sol.s + 2]), why: `${sol.s} sommets.` },
    ], (ok) => { WS.log('solides', ok >= 2 ? 1 : 0); host.append(h('div', { class: 'actions' }, ok >= 2 ? h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ws-next', onclick: () => o.onDone() }, '➡️ Continuer la mission') : h('button', { class: 'btn primary', type: 'button', onclick: () => cristal(o) }, '↻ Réessayer'))); });
  });
}

// ---------- la mission « Le Secret de la Potion des Étoiles » ----------
const STEPS = [
  ['💧', 'L’eau de lune', 'Prépare la bonne quantité d’eau de lune dans l’éprouvette.', (d) => WS.alchimiste({ rounds: 1, onDone: d })],
  ['🪨', 'La poudre de météorite', 'Pèse la poudre de météorite sur la balance enchantée.', (d) => WS.balance({ rounds: 1, onDone: d })],
  ['💎', 'Le cristal parfait', 'Reconnais le solide du cristal magique.', (d) => cristal({ onDone: d })],
  ['🌈', 'Les couleurs du chaudron', 'Verse les bonnes fractions de couleurs dans le chaudron.', (d) => WS.chaudron({ rounds: 1, onDone: d })],
  ['🚪', 'La porte magique', 'Résous les énigmes pour ouvrir la porte du laboratoire secret.', (d) => porte({ mix: true, onDone: d })],
];
export function mission() {
  const b = S.get(); b.potion = b.potion || { step: 0, done: 0 };
  const P = b.potion;
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s) => { say.textContent = s; Voice.speak(s); };
  const tabs = [['m', '🌟 La mission'], ['c', '📒 Carnet des expériences']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'q-tab-' + k, onclick: () => show(k) }, l));
  const body = h('div');
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel' }, UI.closeButton(), h('h2', null, '🌟 Le Secret de la Potion des Étoiles'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Mission potion', onClose: () => Voice.stop() });
  function show(k) {
    tabs.forEach((t) => t.classList.toggle('primary', t.dataset.testid === 'q-tab-' + k));
    if (k === 'c') return carnet(body);
    const fin = P.step >= STEPS.length;
    const flask = h('div', { class: 'q-potion' + (fin ? ' full' : '') }, h('span', { style: `height:${P.step / STEPS.length * 100}%` }));
    body.replaceChildren(
      h('p', { class: 'prompt' }, fin ? `Tu as retrouvé le secret de la Potion des Étoiles ! (réussie ${P.done} fois)` : 'Le grand alchimiste a perdu la recette de la Potion des Étoiles. Rassemble les 5 ingrédients magiques pour la retrouver !'),
      h('div', { class: 'ws-lab' }, flask, h('ol', { class: 'q-steps' }, ...STEPS.map(([ic, n, d], i) => h('li', { class: i < P.step ? 'done' : i === P.step ? 'now' : '' }, h('b', null, `${ic} ${n}`), h('small', null, i < P.step ? ' ✓ trouvé' : ` — ${d}`))))),
      h('div', { class: 'actions wrap' }, fin
        ? h('button', { class: 'btn primary', type: 'button', onclick: () => { P.step = 0; S.save(); show('m'); } }, '↻ Refaire la mission')
        : h('button', { class: 'btn primary', type: 'button', 'data-testid': 'q-go', onclick: () => STEPS[P.step][3](next) }, P.step ? `➡️ Continuer : ${STEPS[P.step][1]}` : '🚀 Commencer la mission')));
    talk(fin ? 'Bravo ! La Potion des Étoiles brille de mille feux !' : P.step ? `Prochain ingrédient : ${STEPS[P.step][1]}.` : 'Le grand alchimiste a perdu la recette de la Potion des Étoiles. Rassemble les cinq ingrédients magiques !');
  }
  function next() {
    P.step++;
    if (P.step >= STEPS.length) { P.done++; const bb = S.get(); bb.bonusStars = (bb.bonusStars || 0) + 5; bb.coins += 10; S.save(); mission(); Sfx.win(); setTimeout(() => { const d = document.querySelector('.ws-panel'); if (d) WS.burst(d); }, 300); UI.toast('🌟 Potion des Étoiles : +5 étoiles, +10 pièces !'); Papa.event('reussi', { force: true }); return; }
    S.save(); mission();
  }
  show('m');
}
const CARNET = [['mesures', '🧪', 'Alchimiste des mesures', 'séries'], ['masses', '⚖️', 'Balance enchantée', 'séries'], ['solides', '🧊', 'Architecte des solides', 'séries'], ['fractions', '🍰', 'Chaudron des fractions', 'séries'], ['enigmes', '🚪', 'Énigmes de la porte', 'symboles allumés']];
function carnet(body) {
  const c = S.get().carnet || {}, P = S.get().potion || { done: 0 }, porteSt = S.get().porte || {};
  body.replaceChildren(h('p', { class: 'muted' }, 'Le carnet garde la trace de toutes tes expériences dans l’atelier.'),
    h('div', { class: 'q-carnet' }, ...CARNET.map(([k, ic, n, u]) => { const e = c[k] || { n: 0, ok: 0 }; return h('div', { class: 'q-page' + (e.n ? '' : ' empty') }, h('span', { class: 'q-ic' }, ic), h('b', null, n), h('small', null, e.n ? `${e.n} expérience${e.n > 1 ? 's' : ''} · ${e.ok} ${k === 'enigmes' ? 'réussie' + (e.ok > 1 ? 's' : '') : 'réussite' + (e.ok > 1 ? 's' : '')}` : 'pas encore essayé')); }),
      h('div', { class: 'q-page' }, h('span', { class: 'q-ic' }, '🌟'), h('b', null, 'Potion des Étoiles'), h('small', null, P.done ? `réussie ${P.done} fois` : 'mission à accomplir')),
      h('div', { class: 'q-page' }, h('span', { class: 'q-ic' }, '🔮'), h('b', null, 'Porte magique'), h('small', null, `${FAM.filter(([k]) => porteSt[k]).length}/4 symboles allumés`))));
}
