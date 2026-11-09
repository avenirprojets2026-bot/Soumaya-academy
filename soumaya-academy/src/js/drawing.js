// Atelier des merveilles : la table à dessin magique (géométrie de l'évaluation P4, doc 7).
// Perpendiculaires et parallèles, symétrie, coordonnées, reproduction sur quadrillage, programme de construction.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri, log } from './workshop.js';

const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };
const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const pick = (a) => a[ri(0, a.length - 1)];
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
function svgPt(svg, e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }

// ---------- moteur « relier des points du quadrillage » ----------
// Les segments sont découpés en petits morceaux élémentaires : une médiane tracée en une ou deux fois compte pareil.
function pieces(segs) {
  const out = new Set();
  for (const [[x1, y1], [x2, y2]] of segs) {
    const dx = x2 - x1, dy = y2 - y1, g = gcd(dx, dy) || 1, sx = dx / g, sy = dy / g;
    for (let i = 0; i < g; i++) { const a = [x1 + sx * i, y1 + sy * i], b = [x1 + sx * (i + 1), y1 + sy * (i + 1)]; out.add(a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]) ? `${a}|${b}` : `${b}|${a}`); }
  }
  return out;
}
const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
function board({ n = 8, cell = 34, fixed = [], marks = [], onChange } = {}) {
  const M = 22, W = n * cell + 2 * M;
  const svg = sv('svg', { viewBox: `0 0 ${W} ${W}`, class: 'dr-board' });
  const P = (x, y) => [M + x * cell, M + y * cell];
  for (let i = 0; i <= n; i++) { svg.append(sv('line', { x1: P(i, 0)[0], y1: P(i, 0)[1], x2: P(i, n)[0], y2: P(i, n)[1], class: 'dr-grid' }), sv('line', { x1: P(0, i)[0], y1: P(0, i)[1], x2: P(n, i)[0], y2: P(n, i)[1], class: 'dr-grid' })); }
  const gFixed = sv('g'), gUser = sv('g'), gDots = sv('g'), gMarks = sv('g');
  svg.append(gFixed, gUser, gMarks, gDots);
  fixed.forEach(([a, b]) => gFixed.append(sv('line', { x1: P(...a)[0], y1: P(...a)[1], x2: P(...b)[0], y2: P(...b)[1], class: 'dr-fixed' })));
  marks.forEach(([x, y, t]) => gMarks.append(sv('text', { x: P(x, y)[0] + 6, y: P(x, y)[1] - 6, class: 'dr-mark' }, t)));
  let sel = null; const segs = [];
  const redraw = () => {
    gUser.replaceChildren(...segs.map(([a, b]) => sv('line', { x1: P(...a)[0], y1: P(...a)[1], x2: P(...b)[0], y2: P(...b)[1], class: 'dr-user' })));
    gDots.querySelectorAll('circle').forEach((c) => c.classList.toggle('sel', !!sel && +c.dataset.x === sel[0] && +c.dataset.y === sel[1]));
  };
  for (let x = 0; x <= n; x++) for (let y = 0; y <= n; y++) {
    const c = sv('circle', { cx: P(x, y)[0], cy: P(x, y)[1], r: 5, class: 'dr-dot', 'data-x': x, 'data-y': y });
    c.addEventListener('click', () => {
      if (!sel) { sel = [x, y]; Sfx.tap(); }
      else if (sel[0] === x && sel[1] === y) sel = null;
      else { const k = segs.findIndex(([a, b]) => (a + '' === sel + '' && b + '' === [x, y] + '') || (b + '' === sel + '' && a + '' === [x, y] + '')); if (k >= 0) segs.splice(k, 1); else segs.push([sel, [x, y]]); sel = null; Sfx.bloop(); onChange && onChange(); }
      redraw();
    });
    // grande zone de toucher, invisible
    const hit = sv('circle', { cx: P(x, y)[0], cy: P(x, y)[1], r: cell * 0.42, fill: 'transparent' }); hit.addEventListener('click', () => c.dispatchEvent(new Event('click')));
    gDots.append(hit, c);
  }
  return { el: svg, segs, undo() { segs.pop(); sel = null; redraw(); }, clear() { segs.length = 0; sel = null; redraw(); }, show(list, cls = 'dr-sol') { list.forEach(([a, b]) => gMarks.append(sv('line', { x1: P(...a)[0], y1: P(...a)[1], x2: P(...b)[0], y2: P(...b)[1], class: cls }))); } };
}

// ---------- 1. perpendiculaires et parallèles ----------
function droites(body, talk) {
  let round = 0, ok = 0;
  const N = 6;
  const head = h('p', { class: 'prompt' }), host = h('div', { class: 'dr-wrap' }), actions = h('div', { class: 'actions wrap' });
  body.replaceChildren(head, host, actions);
  function setup() {
    if (round >= N) { log('geometrie', ok); head.textContent = `Bravo ! ${ok} tracés réussis sur ${N}.`; talk(head.textContent); host.replaceChildren(); actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => droites(body, talk) }, '↻ Recommencer')); Sfx.win(); burst(body); return; }
    if (round % 3 === 2) return recog();
    const kind = round % 2 ? 'parallele' : 'perp', W = 400, H = 300;
    const ang = (pick([0, 15, 30, 60, 90, 120, 150, 165]) + ri(-4, 4)) * Math.PI / 180, cx = 200, cy = 150;
    const ux = Math.cos(ang), uy = -Math.sin(ang);
    const A = kind === 'perp' ? [cx + ux * ri(-60, 60), cy + uy * ri(-60, 60)] : [cx - uy * 85 + ux * ri(-50, 50), cy + ux * 85 + uy * ri(-50, 50)];
    if (kind === 'perp') { A[0] = Math.max(60, Math.min(340, A[0])); A[1] = Math.max(60, Math.min(240, A[1])); }
    const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'dr-paper' });
    svg.append(sv('line', { x1: cx - ux * 500, y1: cy - uy * 500, x2: cx + ux * 500, y2: cy + uy * 500, class: 'dr-d' }), sv('text', { x: cx + ux * 150 + 8, y: cy + uy * 150 - 8, class: 'dr-mark' }, 'd'),
      sv('circle', { cx: A[0], cy: A[1], r: 6, class: 'dr-pt' }), sv('text', { x: A[0] + 10, y: A[1] - 10, class: 'dr-mark' }, 'A'));
    const user = sv('line', { class: 'dr-user', x1: A[0], y1: A[1], x2: A[0], y2: A[1] }); svg.append(user);
    const tool = sv('g', { class: 'dr-tool', opacity: 0 }); svg.append(tool);
    let drawing = false, done = false;
    svg.addEventListener('pointerdown', (e) => { if (done) return; drawing = true; svg.setPointerCapture(e.pointerId); move(e); });
    const move = (e) => { if (!drawing) return; const p = svgPt(svg, e); const dx = p.x - A[0], dy = p.y - A[1], L = Math.hypot(dx, dy) || 1; user.setAttribute('x1', A[0] - dx / L * 600); user.setAttribute('y1', A[1] - dy / L * 600); user.setAttribute('x2', A[0] + dx / L * 600); user.setAttribute('y2', A[1] + dy / L * 600); user.dataset.a = Math.atan2(-dy, dx); };
    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerup', () => { drawing = false; });
    const showTool = () => { // l'équerre posée contre la droite d, son coin sur A (ou glissée jusqu'à A pour la parallèle)
      const deg = -ang * 180 / Math.PI;
      tool.replaceChildren(sv('path', { d: 'M0,0 L130,0 L0,-130 Z M18,-18 L60,-18 L18,-60 Z', 'fill-rule': 'evenodd', fill: '#7fd0ff55', stroke: '#7fd0ff', 'stroke-width': 2 }), sv('path', { d: 'M0,0 L14,0 L14,-14 L0,-14', fill: 'none', stroke: '#ff9de2', 'stroke-width': 2 }));
      const base = kind === 'perp' ? A : [A[0] + uy * 85 * 0, A[1]];
      tool.setAttribute('transform', `translate(${base[0]} ${base[1]}) rotate(${deg})`); tool.setAttribute('opacity', 1);
      talk(kind === 'perp' ? 'Pose l’équerre : un côté du coin droit le long de la droite d, le coin sur le point A. Trace le long de l’autre côté.' : 'Pour une parallèle, la droite garde toujours le même écart avec d : elle ne la rencontre jamais. Trace dans la même direction que d.', false);
    };
    head.textContent = `Tracé ${round + 1}/${N} : trace la ${kind === 'perp' ? 'perpendiculaire' : 'parallèle'} à la droite d qui passe par le point A. Fais glisser ton doigt depuis A.`;
    talk(kind === 'perp' ? 'Trace la droite perpendiculaire à d qui passe par A : elle doit former un angle droit avec d.' : 'Trace la droite parallèle à d qui passe par A : elle ne doit jamais rencontrer d.');
    host.replaceChildren(svg);
    actions.replaceChildren(
      h('button', { class: 'btn primary', type: 'button', 'data-testid': 'dr-check', onclick: () => {
        if (done || user.dataset.a == null) { talk('Trace d’abord ta droite en glissant le doigt depuis A.', false); return; }
        let diff = Math.abs(((+user.dataset.a - ang) * 180 / Math.PI) % 180); if (diff > 90) diff = 180 - diff;
        const good = kind === 'perp' ? Math.abs(diff - 90) <= 7 : diff <= 7;
        if (good) { done = true; ok++; star(); Sfx.win(); burst(body); user.classList.add('good'); talk(kind === 'perp' ? 'Parfait, un bel angle droit !' : 'Parfait, les deux droites ne se rencontreront jamais !'); round++; setTimeout(setup, 2200); }
        else { Sfx.tap(); talk(`Pas encore : ta droite fait un angle de ${Math.round(diff)}° avec d. ${kind === 'perp' ? 'Il faut 90° (un angle droit).' : 'Il faut qu’elle soit dans la même direction que d.'} Essaie avec l’équerre !`, false); }
      } }, '✓ Vérifier'),
      h('button', { class: 'btn small', type: 'button', 'data-testid': 'dr-tool', onclick: showTool }, '📐 Utiliser l’équerre'));
  }
  function recog() {
    const types = shuffle(['perpendiculaires', 'parallèles', 'sécantes (mais pas perpendiculaires)']), k = types[0];
    const svg = sv('svg', { viewBox: '0 0 300 220', class: 'dr-paper small' }), a0 = ri(0, 170) * Math.PI / 180;
    const a1 = k === 'perpendiculaires' ? a0 + Math.PI / 2 : k === 'parallèles' ? a0 : a0 + (ri(25, 60) * Math.PI / 180);
    const line = (a, ox, oy) => sv('line', { x1: 150 + ox - Math.cos(a) * 300, y1: 110 + oy + Math.sin(a) * 300, x2: 150 + ox + Math.cos(a) * 300, y2: 110 + oy - Math.sin(a) * 300, class: 'dr-d' });
    svg.append(line(a0, 0, 0), k === 'parallèles' ? line(a1, -Math.sin(a0) * 60, -Math.cos(a0) * 60) : line(a1, 10, 5));
    head.textContent = `Tracé ${round + 1}/${N} : comment sont ces deux droites ?`; talk('Comment sont ces deux droites ?');
    host.replaceChildren(svg);
    actions.replaceChildren(...types.map((t) => h('button', { class: 'choice', type: 'button', onclick: () => {
      if (t === k) { ok++; star(); Sfx.win(); talk(`Oui, elles sont ${k}.`, false); } else { Sfx.tap(); talk(`Non, elles sont ${k}. Perpendiculaires = angle droit ; parallèles = jamais de rencontre ; sécantes = elles se coupent.`, false); }
      round++; setTimeout(setup, 2400);
    } }, t)));
  }
  setup();
}

// ---------- 2. symétrie ----------
const FIGS = [
  { n: 'le carré', pts: [[-1, -1], [1, -1], [1, 1], [-1, 1]], axes: [0, 45, 90, 135] },
  { n: 'le rectangle', pts: [[-1.5, -0.8], [1.5, -0.8], [1.5, 0.8], [-1.5, 0.8]], axes: [0, 90] },
  { n: 'le losange', pts: [[0, -1.4], [0.9, 0], [0, 1.4], [-0.9, 0]], axes: [0, 90] },
  { n: 'le triangle isocèle', pts: [[0, -1.3], [1, 1], [-1, 1]], axes: [90] },
  { n: 'le triangle équilatéral', pts: [[0, -1.25], [1.08, 0.62], [-1.08, 0.62]], axes: [90, 30, 150] },
  { n: 'le parallélogramme', pts: [[-1.4, -0.7], [0.8, -0.7], [1.4, 0.7], [-0.8, 0.7]], axes: [] },
  { n: 'le trapèze isocèle', pts: [[-0.7, -0.8], [0.7, -0.8], [1.4, 0.8], [-1.4, 0.8]], axes: [90] },
];
function symetrie(body, talk) {
  let round = 0, ok = 0; const N = 5;
  const head = h('p', { class: 'prompt' }), host = h('div', { class: 'dr-wrap' }), actions = h('div', { class: 'actions wrap' });
  body.replaceChildren(head, host, actions);
  const order = shuffle(FIGS);
  function setup() {
    if (round >= N) { log('geometrie', ok); head.textContent = `Bravo ! ${ok} figures réussies sur ${N}.`; talk(head.textContent); host.replaceChildren(); actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => symetrie(body, talk) }, '↻ Recommencer'), h('button', { class: 'btn', type: 'button', onclick: () => miroir(body, talk) }, '🪞 Compléter le symétrique')); Sfx.win(); burst(body); return; }
    const f = order[round % order.length], svg = sv('svg', { viewBox: '-160 -130 320 260', class: 'dr-paper' }), on = new Set();
    svg.append(sv('polygon', { points: f.pts.map(([x, y]) => `${x * 70},${y * 70}`).join(' '), class: 'dr-fig' }));
    const cand = [0, 30, 45, 90, 135, 150];
    const lines = cand.map((a) => { const r = a * Math.PI / 180, co = { x1: -Math.cos(r) * 140, y1: Math.sin(r) * 140, x2: Math.cos(r) * 140, y2: -Math.sin(r) * 140 }, l = sv('line', { ...co, class: 'dr-axe' }), hit = sv('line', { ...co, class: 'dr-hit', 'data-testid': 'dr-axe' }); hit.addEventListener('click', () => { on.has(a) ? on.delete(a) : on.add(a); l.classList.toggle('on', on.has(a)); Sfx.tap(); }); svg.append(l, hit); return l; });
    void lines;
    head.textContent = `Figure ${round + 1}/${N} : ${f.n}. Touche toutes les lignes pointillées qui sont des axes de symétrie (ou aucune s’il n’y en a pas), puis vérifie.`;
    talk(`Voici ${f.n}. Quelles lignes sont des axes de symétrie ? Si on plie la figure sur un axe, les deux moitiés se superposent exactement.`);
    host.replaceChildren(svg);
    actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'dr-check', onclick: () => {
      const want = new Set(f.axes), good = want.size === on.size && [...want].every((a) => on.has(a));
      const nb = f.axes.length, phr = nb ? `${f.n} a ${nb} axe${nb > 1 ? 's' : ''} de symétrie` : `${f.n} n’a aucun axe de symétrie`;
      if (good) { ok++; star(); Sfx.win(); burst(body); talk(`Exact ! ${phr[0].toUpperCase() + phr.slice(1)}.`); }
      else { Sfx.tap(); talk(`Pas tout à fait : ${phr}.${nb ? ' Regarde les lignes en vert.' : ''}`, false); }
      svg.querySelectorAll('.dr-axe').forEach((l, i) => l.classList.add(f.axes.includes(cand[i]) ? 'right' : 'no'));
      round++; setTimeout(setup, 3200);
    } }, '✓ Vérifier'), h('span', { class: 'muted ws-memo' }, f.n === 'le losange' ? 'Astuce : les axes du losange sont ses diagonales.' : ''));
  }
  setup();
}
// compléter le symétrique d'une figure sur quadrillage (cases à colorier)
function miroir(body, talk) {
  const C = 10, R = 8, half = 5, cell = 32;
  const shapes = [
    [[4, 1], [4, 2], [3, 2], [3, 3], [2, 3], [4, 3], [4, 4], [4, 5], [3, 5], [4, 6]],
    [[4, 0], [3, 1], [4, 1], [2, 2], [3, 2], [4, 2], [4, 3], [4, 4], [3, 5], [4, 5], [2, 6], [4, 6]],
    [[1, 1], [2, 1], [3, 2], [4, 2], [4, 3], [3, 4], [4, 4], [2, 5], [1, 6], [4, 6]],
  ];
  const model = new Set(pick(shapes).map(([x, y]) => `${x},${y}`)), want = new Set([...model].map((k) => { const [x, y] = k.split(',').map(Number); return `${C - 1 - x},${y}`; })), got = new Set();
  const svg = sv('svg', { viewBox: `0 0 ${C * cell} ${R * cell}`, class: 'dr-paper' });
  for (let x = 0; x < C; x++) for (let y = 0; y < R; y++) {
    const k = `${x},${y}`, r = sv('rect', { x: x * cell, y: y * cell, width: cell, height: cell, class: 'dr-sq' + (model.has(k) ? ' model' : '') });
    if (x >= half) r.addEventListener('click', () => { got.has(k) ? got.delete(k) : got.add(k); r.classList.toggle('mine', got.has(k)); Sfx.tap(); });
    svg.append(r);
  }
  svg.append(sv('line', { x1: half * cell, y1: -4, x2: half * cell, y2: R * cell + 4, class: 'dr-axe right', style: 'pointer-events:none' }));
  const head = h('p', { class: 'prompt' }, 'Complète la figure : colorie les cases de droite pour qu’elle soit symétrique par rapport à l’axe rouge, comme dans un miroir.');
  talk('Colorie les cases de droite pour que la figure soit symétrique par rapport à l’axe, comme dans un miroir.');
  body.replaceChildren(head, h('div', { class: 'dr-wrap' }, svg), h('div', { class: 'actions wrap' },
    h('button', { class: 'btn primary', type: 'button', 'data-testid': 'dr-check', onclick: () => {
      const missing = [...want].filter((k) => !got.has(k)).length, extra = [...got].filter((k) => !want.has(k)).length;
      if (!missing && !extra) { star(2); log('geometrie', 1); Sfx.win(); burst(body); talk('Magnifique, la figure est parfaitement symétrique !'); }
      else talk(`Presque : ${missing ? `il manque ${missing} case${missing > 1 ? 's' : ''}` : ''}${missing && extra ? ' et ' : ''}${extra ? `${extra} case${extra > 1 ? 's sont' : ' est'} en trop` : ''}. Compte les cases depuis l’axe : même distance de chaque côté !`, false);
    } }, '✓ Vérifier'),
    h('button', { class: 'btn small', type: 'button', onclick: () => miroir(body, talk) }, '↻ Autre figure'),
    h('button', { class: 'btn small', type: 'button', onclick: () => symetrie(body, talk) }, '⬅ Axes de symétrie')));
}

// ---------- 3. coordonnées ----------
const COLS = 'ABCDEFGH';
function coord(body, talk) {
  let round = 0, ok = 0; const N = 6, cell = 40, Rn = 6, Cn = 8, M = 34;
  const head = h('p', { class: 'prompt' }), host = h('div', { class: 'dr-wrap' }), actions = h('div', { class: 'actions wrap' });
  body.replaceChildren(head, host, actions);
  const ICONS = ['⭐', '🐈', '🏰', '🌳', '🔑', '💎'];
  function grid(onCell) {
    const svg = sv('svg', { viewBox: `0 0 ${Cn * cell + M} ${Rn * cell + M}`, class: 'dr-paper' });
    for (let c = 0; c < Cn; c++) svg.append(sv('text', { x: M + c * cell + cell / 2, y: 24, class: 'dr-mark', style: 'text-anchor:middle' }, COLS[c]));
    for (let r = 0; r < Rn; r++) svg.append(sv('text', { x: 16, y: M + r * cell + cell / 2 + 6, class: 'dr-mark', style: 'text-anchor:middle' }, String(r + 1)));
    for (let c = 0; c < Cn; c++) for (let r = 0; r < Rn; r++) { const q = sv('rect', { x: M + c * cell, y: M + r * cell, width: cell, height: cell, class: 'dr-sq' }); q.addEventListener('click', () => onCell(c, r, q)); svg.append(q); }
    return svg;
  }
  function setup() {
    if (round >= N) { log('geometrie', ok); head.textContent = `Bravo ! ${ok} réponses justes sur ${N}.`; talk(head.textContent); host.replaceChildren(); actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => coord(body, talk) }, '↻ Recommencer')); Sfx.win(); burst(body); return; }
    const c = ri(0, Cn - 1), r = ri(0, Rn - 1), name = `${COLS[c]}${r + 1}`;
    if (round % 2 === 0) {
      let done = false;
      const svg = grid((cc, rr, q) => {
        if (done) return; done = true;
        const mark = sv('text', { x: M + cc * cell + cell / 2, y: M + rr * cell + cell / 2 + 9, class: 'dr-x', style: 'text-anchor:middle' }, '✕'); svg.append(mark);
        if (cc === c && rr === r) { ok++; star(); Sfx.win(); q.classList.add('mine'); talk(`Oui ! La croix est bien en ${name}.`, false); }
        else { Sfx.tap(); q.classList.add('bad'); talk(`Non, tu as touché ${COLS[cc]}${rr + 1}. ${name} : d’abord la colonne ${COLS[c]}, puis la ligne ${r + 1}.`, false); }
        round++; setTimeout(setup, 2400);
      });
      head.textContent = `Question ${round + 1}/${N} : place une croix dans la case ${name}.`; talk(`Place une croix dans la case ${name}.`);
      host.replaceChildren(svg); actions.replaceChildren(h('span', { class: 'muted ws-memo' }, 'On lit d’abord la lettre (colonne), puis le chiffre (ligne).'));
    } else {
      const ic = pick(ICONS), svg = grid(() => {});
      svg.append(sv('text', { x: M + c * cell + cell / 2, y: M + r * cell + cell / 2 + 10, style: 'text-anchor:middle;font-size:26px' }, ic));
      const wrong = shuffle([`${COLS[r % Cn]}${(c % Rn) + 1}`, `${COLS[(c + 1) % Cn]}${r + 1}`, `${COLS[c]}${((r + 1) % Rn) + 1}`, `${r + 1}${COLS[c]}`].filter((x) => x !== name)).slice(0, 2);
      head.textContent = `Question ${round + 1}/${N} : dans quelle case se trouve ${ic} ?`; talk('Dans quelle case se trouve le dessin ?');
      host.replaceChildren(svg);
      actions.replaceChildren(...shuffle([name, ...wrong]).map((o) => h('button', { class: 'choice', type: 'button', onclick: () => { if (o === name) { ok++; star(); Sfx.win(); talk(`Oui, en ${name} !`, false); } else { Sfx.tap(); talk(`Non, c’est ${name} : colonne ${COLS[c]}, ligne ${r + 1}.`, false); } round++; setTimeout(setup, 2200); } }, o)));
    }
  }
  setup();
}

// ---------- 4. reproduire une figure ----------
const MODELS = [
  [[[1, 1], [5, 1]], [[5, 1], [5, 4]], [[5, 4], [1, 4]], [[1, 4], [1, 1]], [[1, 1], [5, 4]]],
  [[[3, 0], [6, 3]], [[6, 3], [3, 6]], [[3, 6], [0, 3]], [[0, 3], [3, 0]]],
  [[[1, 5], [3, 1]], [[3, 1], [5, 5]], [[5, 5], [1, 5]], [[3, 1], [3, 5]]],
  [[[0, 2], [2, 0]], [[2, 0], [5, 0]], [[5, 0], [5, 3]], [[5, 3], [3, 5]], [[3, 5], [0, 5]], [[0, 5], [0, 2]]],
  [[[1, 0], [4, 0]], [[4, 0], [4, 2]], [[4, 2], [6, 2]], [[6, 2], [6, 5]], [[6, 5], [1, 5]], [[1, 5], [1, 0]]],
];
function reproduire(body, talk) {
  const m = pick(MODELS), want = pieces(m);
  const model = board({ n: 6, cell: 30, fixed: m }); model.el.classList.add('model');
  model.el.style.pointerEvents = 'none';
  const b = board({ n: 6, cell: 22 });
  b.el.classList.add('reduit');
  talk('Reproduis la figure dans le petit quadrillage : touche un point, puis un autre point, pour tracer chaque côté.');
  body.replaceChildren(h('p', { class: 'prompt' }, 'Reproduis le modèle dans le quadrillage réduit. Touche un point puis un autre pour tracer un segment (touche-le encore pour l’effacer).'),
    h('div', { class: 'dr-two' }, h('div', null, h('small', { class: 'muted' }, 'Modèle'), model.el), h('div', null, h('small', { class: 'muted' }, 'À toi !'), b.el)),
    h('div', { class: 'actions wrap' },
      h('button', { class: 'btn primary', type: 'button', 'data-testid': 'dr-check', onclick: () => {
        const got = pieces(b.segs);
        if (sameSet(got, want)) { star(2); log('geometrie', 1); Sfx.win(); burst(body); talk('Parfait, ta figure est identique au modèle, en plus petit !'); }
        else { const miss = [...want].filter((x) => !got.has(x)).length, extra = [...got].filter((x) => !want.has(x)).length; talk(`Pas encore : ${miss ? `il manque des traits` : ''}${miss && extra ? ' et ' : ''}${extra ? 'il y a des traits en trop' : ''}. Compte les carreaux de chaque côté !`, false); }
      } }, '✓ Vérifier'),
      h('button', { class: 'btn small', type: 'button', onclick: () => b.undo() }, '↶ Annuler'),
      h('button', { class: 'btn small', type: 'button', onclick: () => reproduire(body, talk) }, '↻ Autre modèle')));
}

// ---------- 5. programme de construction : l'étoile ----------
function programme(body, talk) {
  // carré ABCD de (2,2) à (6,6) sur un quadrillage 8×8 ; milieux (4,2) (6,4) (4,6) (2,4) ; pointes (4,0) (8,4) (4,8) (0,4)
  const sq = [[[2, 2], [6, 2]], [[6, 2], [6, 6]], [[6, 6], [2, 6]], [[2, 6], [2, 2]]];
  const STEPS = [
    { t: '1. Trace le carré ABCD : relie A à B, B à C, C à D et D à A.', want: sq, fixed: [] },
    { t: '2. Trace les deux médianes du carré : elles relient les milieux des côtés opposés.', want: [[[4, 2], [4, 6]], [[2, 4], [6, 4]]], fixed: sq },
    { t: '3. Relie les milieux des côtés, l’un après l’autre : tu obtiens un losange (un carré posé sur sa pointe !).', want: [[[4, 2], [6, 4]], [[6, 4], [4, 6]], [[4, 6], [2, 4]], [[2, 4], [4, 2]]], fixed: [...sq, [[4, 2], [4, 6]], [[2, 4], [6, 4]]] },
    { t: '4. Sur chaque côté du carré, construis un triangle isocèle vers l’extérieur : relie les deux coins du côté à la pointe ★.', want: [[[2, 2], [4, 0]], [[4, 0], [6, 2]], [[6, 2], [8, 4]], [[8, 4], [6, 6]], [[6, 6], [4, 8]], [[4, 8], [2, 6]], [[2, 6], [0, 4]], [[0, 4], [2, 2]]], fixed: [...sq, [[4, 2], [4, 6]], [[2, 4], [6, 4]], [[4, 2], [6, 4]], [[6, 4], [4, 6]], [[4, 6], [2, 4]], [[2, 4], [4, 2]]] },
  ];
  let i = 0;
  const go = () => {
    if (i >= STEPS.length) { star(3); log('geometrie', 1); Sfx.win(); burst(body); talk('Bravo ! Tu as suivi tout le programme : voici une magnifique étoile !'); const all = board({ n: 8, cell: 34, fixed: [...STEPS[3].fixed, ...STEPS[3].want] }); all.el.classList.add('star-done'); body.replaceChildren(h('p', { class: 'prompt' }, '🌟 Programme réussi : l’étoile magique !'), h('div', { class: 'dr-wrap' }, all.el), h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => programme(body, talk) }, '↻ Recommencer'))); return; }
    const s = STEPS[i], marks = [[2, 2, 'A'], [6, 2, 'B'], [6, 6, 'C'], [2, 6, 'D']];
    if (i >= 1) marks.push([4, 2, '•'], [6, 4, '•'], [4, 6, '•'], [2, 4, '•']);
    if (i === 3) marks.push([4, 0, '★'], [8, 4, '★'], [4, 8, '★'], [0, 4, '★']);
    const b = board({ n: 8, cell: 34, fixed: s.fixed, marks });
    talk(s.t);
    body.replaceChildren(h('p', { class: 'prompt' }, `Programme de construction · étape ${i + 1}/4`), h('div', { class: 'mi-step' }, s.t), h('div', { class: 'dr-wrap' }, b.el),
      h('div', { class: 'actions wrap' },
        h('button', { class: 'btn primary', type: 'button', 'data-testid': 'dr-check', onclick: () => { if (sameSet(pieces(b.segs), pieces(s.want))) { Sfx.coin(); star(); i++; talk('Étape réussie !', false); setTimeout(go, 1200); } else talk('Pas encore. Relis bien la consigne et regarde les points repères.', false); } }, '✓ Vérifier l’étape'),
        h('button', { class: 'btn small', type: 'button', onclick: () => b.undo() }, '↶ Annuler'),
        h('button', { class: 'btn small ghost', type: 'button', onclick: () => { b.show(s.want); talk('Regarde les traits en pointillés : ce sont eux qu’il faut tracer.', false); } }, '💡 Indice')));
  };
  go();
}

export function open(tab = 'droites') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['droites', '📐 Perpendiculaires et parallèles', droites], ['symetrie', '🦋 Symétrie', symetrie], ['coord', '🗺️ Coordonnées', coord], ['repro', '✏️ Reproduire', reproduire], ['prog', '🌟 Programme de construction', programme]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'dr-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel dr-panel' }, UI.closeButton(), h('h2', null, '📏 La table à dessin magique'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Table à dessin', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
