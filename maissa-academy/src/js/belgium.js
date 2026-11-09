// Grande carte de la Belgique : pays voisins en couleur, grandes villes à toucher, jeu « Trouve la ville ».
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { asset } from './asset.js';
import GEO from './belgique.json';

const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };

// projection identique à celle utilisée pour préparer belgique.json
const L0 = 2.3, B1 = 51.62, c = Math.cos(50.5 * Math.PI / 180), K = GEO.W / ((6.55 - L0) * c);
const P = (lon, lat) => [(lon - L0) * c * K, (B1 - lat) * K];

const COUNTRIES = [
  { id: 'FR', name: 'France', fill: '#f9c9cf', at: P(3.55, 49.62) },
  { id: 'NL', name: 'Pays-Bas', fill: '#ffd8a3', at: P(5.15, 51.5) },
  { id: 'DE', name: 'Allemagne', fill: '#c7e8b3', at: P(6.33, 50.75), rot: 90 },
  { id: 'LU', name: 'Luxembourg', fill: '#d8c6f3', at: P(6.13, 49.72) },
];

const CITIES = {
  Bruxelles: { fact: 'la capitale de la Belgique ! On y trouve l’Atomium et le Manneken-Pis.', cap: true, lab: [-112, -12] },
  Uccle: { fact: 'une commune de la Région de Bruxelles-Capitale, juste au sud du centre de Bruxelles.', lab: [-64, 12] },
  Waterloo: { fact: 'célèbre pour la bataille de 1815 contre Napoléon. Il y a la Butte du Lion.', lab: [-96, 22] },
  Nivelles: { fact: 'une ville du Brabant wallon, connue pour sa grande collégiale Sainte-Gertrude.', lab: [-86, 8] },
  Charleroi: { fact: 'une grande ville du Hainaut, au bord de la Sambre. Autrefois, on y extrayait beaucoup de charbon.', lab: [10, 16] },
  Namur: { fact: 'la capitale de la Wallonie, là où la Sambre rejoint la Meuse. Sa citadelle domine la ville.', lab: [10, 4] },
  Liège: { fact: 'une grande ville au bord de la Meuse. Son escalier de la Montagne de Bueren a 374 marches !', lab: [10, 4] },
  Mons: { fact: 'le chef-lieu du Hainaut. Chaque année, on y fête le Doudou.', lab: [-48, 16] },
  Tournai: { fact: 'une des plus anciennes villes de Belgique. Sa cathédrale a cinq clochers.', lab: [10, 4] },
  Anvers: { fact: 'une grande ville au bord de l’Escaut, avec un des plus grands ports d’Europe.', lab: [10, 4] },
  Gand: { fact: 'une ville de Flandre, avec le château des Comtes en plein centre.', lab: [10, 4] },
  Bruges: { fact: 'une ville aux mille canaux et à l’immense beffroi.', lab: [-24, 30] },
  Ostende: { fact: 'une ville au bord de la mer du Nord, avec une longue plage.', lab: [-40, -14] },
  Louvain: { fact: 'une ville du Brabant flamand où étudient beaucoup d’étudiants.', lab: [10, -6] },
  Hasselt: { fact: 'le chef-lieu de la province de Limbourg.', lab: [10, 4] },
  Wavre: { fact: 'le chef-lieu du Brabant wallon.', lab: [12, 10] },
  Bastogne: { fact: 'une ville de l’Ardenne, pays de grandes forêts.', lab: [10, 4] },
  Arlon: { fact: 'le chef-lieu de la province de Luxembourg, tout au sud de la Belgique.', lab: [-46, 16] },
};

export function open() {
  const { W, H } = GEO;
  const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'be-map', role: 'img', 'aria-label': 'Carte de la Belgique et de ses pays voisins' });
  svg.append(sv('rect', { x: -40, y: -40, width: W + 80, height: H + 80, fill: '#8fcaf0' }));
  for (const k of COUNTRIES) svg.append(sv('path', { d: GEO.paths[k.id], fill: k.fill, stroke: '#fff', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
  svg.append(sv('path', { d: GEO.paths.BE, fill: '#fff3b8', stroke: '#c8102e', 'stroke-width': 4.5, 'stroke-linejoin': 'round', class: 'be-land' }));
  const sea = P(2.85, 51.5); svg.append(sv('text', { x: sea[0], y: sea[1], class: 'be-sea' }, 'Mer du Nord 🌊'));
  for (const k of COUNTRIES) {
    const t = sv('text', { x: k.at[0], y: k.at[1], class: 'be-country', transform: k.rot ? `rotate(${k.rot} ${k.at[0]} ${k.at[1]})` : '' }, k.name);
    svg.append(t);
  }
  const bel = P(4.65, 50.25); svg.append(sv('text', { x: bel[0], y: bel[1], class: 'be-name' }, 'BELGIQUE'));
  // provinces et régions (cachées tant qu'on n'est pas dans ce mode)
  const REG = { F: ['Région flamande (Flandre)', '#ffe08a'], W: ['Région wallonne (Wallonie)', '#ffb8a8'], B: ['Région de Bruxelles-Capitale', '#a9c4ff'] };
  const provG = sv('g', { class: 'be-prov' }), provL = sv('g', { class: 'be-provlbl' });
  const provEls = {};
  for (const pr of GEO.prov) {
    const el = sv('path', { d: pr.d, 'fill-rule': 'evenodd', fill: REG[pr.reg][1], stroke: '#7a5a3a', 'stroke-width': 1.6, 'stroke-linejoin': 'round', 'data-prov': pr.name, tabindex: 0, role: 'button', 'aria-label': pr.name });
    provG.append(el); provEls[pr.name] = el;
    if (pr.reg !== 'B') provL.append(sv('text', { x: pr.c[0], y: pr.c[1], class: 'pl' }, pr.name));
  }
  // fleuves et rivières
  const rivG = sv('g', { class: 'be-riv' }), rivEls = {};
  for (const [n, d] of Object.entries(GEO.rivers)) { const g = sv('g', { 'data-riv': n }, sv('path', { d, class: 'rv' }), sv('path', { d, class: 'rv-hit' })); rivG.append(g); rivEls[n] = g; }
  const rivLbl = sv('g', { class: 'be-rivlbl' });
  for (const [n, lo, la] of [['Meuse', 5.55, 50.95], ['Escaut', 3.55, 50.82], ['Sambre', 4.12, 50.36]]) { const [x, y] = P(lo, la); rivLbl.append(sv('text', { x, y, class: 'rl' }, n)); }
  svg.append(provG, rivG, provL, rivLbl);
  // flèche de direction (boussole)
  const arrow = sv('line', { class: 'be-arrow', 'marker-end': 'url(#beArr)' });
  svg.append(sv('defs', {}, sv('marker', { id: 'beArr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' }, sv('path', { d: 'M0,0 L10,5 L0,10 Z', fill: '#c8102e' }))), arrow);
  const dots = {};
  for (const [name, info] of Object.entries(CITIES)) {
    const [x, y] = GEO.cities[name];
    const g = sv('g', { class: 'be-city' + (info.cap ? ' cap' : ''), tabindex: 0, role: 'button', 'aria-label': name, 'data-city': name });
    g.append(sv('circle', { cx: x, cy: y, r: 22, class: 'hit' }));
    g.append(info.cap ? sv('path', { d: star(x, y, 15, 6.5), class: 'dot' }) : sv('circle', { cx: x, cy: y, r: 8, class: 'dot' }));
    g.append(sv('text', { x: x + info.lab[0], y: y + info.lab[1], class: 'lbl' }, name));
    svg.append(g); dots[name] = g;
  }
  const pen = sv('g', { class: 'be-pen' }, sv('path', { d: 'M0,0 L-14,-46 L-6,-50 L8,-6 Z', fill: '#2a3f8f', stroke: '#fff', 'stroke-width': 2 }), sv('path', { d: 'M0,0 L-5,-14 L4,-10 Z', fill: '#ffd84a' }), sv('circle', { cx: -10, cy: -48, r: 5, fill: '#ffd84a' }));
  const ring = sv('circle', { r: 10, class: 'be-ring' });
  svg.append(ring, pen);

  const say = h('div', { class: 'be-say', 'aria-live': 'polite' });
  const soum = h('img', { class: 'be-soumaya', src: asset('assets/sprites/soumaya/salut.webp'), alt: '' });
  const talk = (txt, voice = true) => { say.textContent = txt; if (voice) Voice.speak(txt); };
  const point = (name, ok = true) => {
    const [x, y] = GEO.cities[name];
    pen.style.transform = `translate(${x}px, ${y}px)`; ring.setAttribute('cx', x); ring.setAttribute('cy', y);
    ring.classList.remove('go', 'ko'); void ring.getBBox(); ring.classList.add(ok ? 'go' : 'ko');
  };
  const sel = (name) => { Object.values(dots).forEach((d) => d.classList.toggle('on', d.dataset.city === name)); };

  let game = null, mode = 'villes';
  const score = h('span', { class: 'be-score' });
  const compass = h('div', { class: 'be-compass', hidden: true });
  const DIRS = ['est', 'nord-est', 'nord', 'nord-ouest', 'ouest', 'sud-ouest', 'sud', 'sud-est'];
  const dirOf = (a, b) => { const ang = Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180 / Math.PI; return { d: DIRS[Math.round(((ang + 360) % 360) / 45) % 8], off: Math.abs(((((ang + 360) % 45) + 22.5) % 45) - 22.5) }; };
  const setMode = (m) => {
    mode = m; game = null; score.textContent = ''; compass.hidden = true; arrow.classList.remove('on');
    svg.dataset.mode = m; modeBtns.forEach((b) => b.classList.toggle('primary', b.dataset.m === m));
    svg.classList.remove('quiz');
    if (m === 'villes') talk('Touche une ville pour la découvrir !');
    if (m === 'prov') talk('La Belgique a 3 régions : la Flandre au nord, la Wallonie au sud, et Bruxelles-Capitale au milieu. Elle compte aussi 10 provinces. Touche une province !');
    if (m === 'riv') talk('Deux grands fleuves traversent la Belgique : l’Escaut, à l’ouest, et la Meuse, à l’est. La Sambre rejoint la Meuse à Namur. Touche une rivière !');
    if (m === 'boussole') boussole();
  };
  const modeBtns = [['villes', '🏙️ Villes'], ['prov', '🗺️ Régions et provinces'], ['riv', '🌊 Fleuves'], ['boussole', '🧭 Boussole']].map(([m, l]) => h('button', { class: 'btn small', type: 'button', 'data-m': m, 'data-testid': 'be-' + m, onclick: () => setMode(m) }, l));
  const gameV = h('button', { class: 'btn primary small', type: 'button', 'data-testid': 'be-game', onclick: () => { setMode('villes'); game = { kind: 'ville', left: shuffle(Object.keys(CITIES)).slice(0, 6), ok: 0, n: 6 }; svg.classList.add('quiz'); ask(); } }, '🎯 Trouve la ville');
  const gameP = h('button', { class: 'btn primary small', type: 'button', 'data-testid': 'be-gamep', onclick: () => { setMode('prov'); game = { kind: 'prov', left: shuffle(GEO.prov.map((p) => p.name)).slice(0, 6), ok: 0, n: 6 }; svg.classList.add('quiz'); ask(); } }, '🎯 Trouve la province');
  function end(word) { const msg = `Bravo ! ${game.ok} sur ${game.n} !`; talk(msg); S.get().bonusStars = (S.get().bonusStars || 0) + game.ok; S.get().coins += game.ok * 2; S.save(); UI.toast(`${game.ok}/${game.n} · +${game.ok} 🌟 · +${game.ok * 2} 🪙`); if (game.ok >= game.n - 1) Sfx.win(); game = null; score.textContent = ''; svg.classList.remove('quiz'); void word; }
  function ask() {
    if (!game.left.length) return end();
    game.q = game.left.shift(); score.textContent = `${game.n - game.left.length}/${game.n}`;
    if (game.kind === 'ville') { talk(`Où est ${game.q} ?`); sel(null); }
    if (game.kind === 'prov') { talk(`Où est la province ${game.q === 'Bruxelles-Capitale' ? 'de Bruxelles-Capitale (c’est une région)' : (/^[AEIOUH]/.test(game.q) ? 'd’' : 'de ') + game.q} ?`); Object.values(provEls).forEach((e) => e.classList.remove('on', 'ko')); }
  }
  // boussole : directions entre villes et pays voisins
  function boussole() {
    compass.hidden = false; svg.classList.remove('quiz');
    const names = Object.keys(CITIES), qs = [];
    for (let t = 0; t < 400 && qs.length < 4; t++) { const a = names[Math.floor(Math.random() * names.length)], b = names[Math.floor(Math.random() * names.length)]; if (a === b) continue; const A = GEO.cities[a], B = GEO.cities[b]; if (Math.hypot(A[0] - B[0], A[1] - B[1]) < 120) continue; const r = dirOf(A, B); if (r.off > 14) continue; if (qs.some((q) => q.a === a || q.b === b)) continue; qs.push({ a, b, ok: [r.d], A, B, txt: `Si tu es à ${a}, dans quelle direction se trouve ${b} ?` }); }
    const C = [['la France', ['sud', 'sud-ouest'], 'FR'], ['les Pays-Bas', ['nord', 'nord-est'], 'NL'], ['l’Allemagne', ['est'], 'DE'], ['le Luxembourg', ['sud-est'], 'LU'], ['la mer du Nord', ['nord-ouest'], 'SEA']];
    const pc = shuffle(C).slice(0, 2).map(([n, ok, id]) => ({ ok, id, txt: `Par rapport à la Belgique, dans quelle direction se trouve ${n} ?` }));
    game = { kind: 'dir', list: shuffle([...qs, ...pc]), i: 0, ok: 0, n: qs.length + pc.length };
    nextDir();
  }
  function nextDir() {
    arrow.classList.remove('on');
    if (game.i >= game.list.length) { game.left = []; return end(); }
    const q = game.list[game.i]; score.textContent = `${game.i + 1}/${game.n}`; talk(q.txt);
    if (q.a) { point(q.a); sel(q.a); } else { sel(null); }
  }
  compass.append(...['nord-ouest', 'nord', 'nord-est', 'ouest', null, 'est', 'sud-ouest', 'sud', 'sud-est'].map((d) => d ? h('button', { class: 'btn small be-dir', type: 'button', 'data-dir': d, onclick: () => {
    if (!game || game.kind !== 'dir' || game.lock) return; const q = game.list[game.i]; game.lock = true;
    const good = q.ok.includes(d); if (good) { game.ok++; Sfx.coin(); } else Sfx.tap();
    if (q.a) { arrow.setAttribute('x1', q.A[0]); arrow.setAttribute('y1', q.A[1]); arrow.setAttribute('x2', q.B[0]); arrow.setAttribute('y2', q.B[1]); arrow.classList.add('on'); sel(q.b); }
    const art = (x) => (x[0] === 'o' ? 'l’' : 'le ') + x, right = q.ok.map(art).join(' ou ');
    talk(good ? `Bravo ! C’est vers ${right}.` : `Non : c’est vers ${right}.${q.a ? ' Regarde la flèche rouge.' : ''}`, false);
    setTimeout(() => { if (!game) return; game.lock = false; game.i++; nextDir(); }, 2600);
  } }, d) : h('span', { class: 'be-rose' }, '🧭')));

  const tap = (name) => {
    if (game && game.kind === 'ville' && game.q) {
      if (name === game.q) { game.ok++; Sfx.coin(); point(name); sel(name); talk(`Oui ! C’est ${name}.`, false); setTimeout(ask, 1300); }
      else { Sfx.tap(); point(game.q, false); sel(game.q); talk(`Non, ça c’est ${name}. ${game.q} est ici !`, false); setTimeout(ask, 2200); }
      game.q = null; return;
    }
    if (game) return;
    Sfx.tap(); point(name); sel(name); talk(`${name}, c’est ${CITIES[name].fact}`);
  };
  Object.entries(dots).forEach(([n, g]) => { g.addEventListener('click', () => tap(n)); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(n); } }); });
  const PINFO = { 'Flandre-Occidentale': 'Bruges', 'Flandre-Orientale': 'Gand', Anvers: 'Anvers', Limbourg: 'Hasselt', 'Brabant flamand': 'Louvain', 'Brabant wallon': 'Wavre', Hainaut: 'Mons', Namur: 'Namur', Liège: 'Liège', Luxembourg: 'Arlon' };
  Object.entries(provEls).forEach(([n, el]) => el.addEventListener('click', () => {
    if (mode !== 'prov') return;
    const pr = GEO.prov.find((p) => p.name === n);
    if (game && game.kind === 'prov' && game.q) {
      const good = n === game.q; const tgt = provEls[game.q]; tgt.classList.add('on'); if (!good) el.classList.add('ko');
      if (good) { game.ok++; Sfx.coin(); talk(`Oui ! C’est ${n}.`, false); } else { Sfx.tap(); talk(`Non, ça c’est ${n}. ${game.q} est en vert !`, false); }
      game.q = null; setTimeout(ask, good ? 1300 : 2400); return;
    }
    if (game) return;
    Object.values(provEls).forEach((e) => e.classList.remove('on')); el.classList.add('on'); Sfx.tap();
    talk(pr.reg === 'B' ? 'Bruxelles-Capitale : c’est une région à part, au milieu du Brabant flamand. Bruxelles est la capitale de la Belgique.' : `${n} : une province de la ${REG[pr.reg][0].replace('Région ', 'région ')}. Son chef-lieu est ${PINFO[n]}.`);
  }));
  Object.entries(rivEls).forEach(([n, g]) => g.addEventListener('click', () => {
    if (mode !== 'riv') return; Object.values(rivEls).forEach((e) => e.classList.remove('on')); g.classList.add('on'); Sfx.tap();
    talk({ Meuse: 'La Meuse vient de France, traverse Namur et Liège, puis continue vers les Pays-Bas.', Escaut: 'L’Escaut vient de France, passe à Tournai, Gand et Anvers, puis se jette dans la mer du Nord.', Sambre: 'La Sambre vient de France, passe à Charleroi et se jette dans la Meuse à Namur.' }[n]);
  }));

  UI.openDialog(h('div', { class: 'panel be-panel' }, UI.closeButton(),
    h('h2', null, '🇧🇪 La carte de la Belgique'),
    h('div', { class: 'actions wrap be-modes' }, ...modeBtns),
    h('div', { class: 'be-wrap' }, svg, soum, say),
    compass,
    h('div', { class: 'be-legend' }, ...COUNTRIES.map((k) => h('span', null, h('i', { style: `background:${k.fill}` }), k.name)), h('span', null, h('i', { style: 'background:#8fcaf0' }), 'Mer du Nord'), h('span', { class: 'be-regleg' }, ...Object.values(REG).map(([n, c]) => h('span', null, h('i', { style: `background:${c}` }), n)))),
    h('p', { class: 'muted' }, 'La Belgique a 4 pays voisins : la France, les Pays-Bas, l’Allemagne et le Luxembourg. Au nord-ouest, elle touche la mer du Nord.'),
    h('div', { class: 'actions wrap' }, gameV, gameP, score)), { label: 'Carte de la Belgique' });
  svg.dataset.mode = 'villes'; modeBtns[0].classList.add('primary');

  // Maissa montre Bruxelles avec son stylet
  pen.style.transform = `translate(${W - 60}px, ${H - 40}px)`;
  setTimeout(() => { point('Bruxelles'); sel('Bruxelles'); talk('Regarde : ici, c’est Bruxelles, la capitale de la Belgique !'); }, 500);
}

function star(x, y, R, r) { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; d += (i ? 'L' : 'M') + (x + q * Math.cos(a)).toFixed(1) + ',' + (y + q * Math.sin(a)).toFixed(1); } return d + 'Z'; }
function shuffle(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
