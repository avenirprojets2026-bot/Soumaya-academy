// La Salle des Mille Données (organisation des données et statistique, évaluation P4 docs 5 et 9) :
// trier selon un critère, questions fermées, sondage et diagramme à bandes, reconnaître les graphiques,
// tableau à double entrée, énigme logique avec un tableau.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri, qcm } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const pick = (a) => a[ri(0, a.length - 1)];
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };

// ---------- 1. trier une collection ----------
const COLORS = { rouge: '#e8455a', bleu: '#3a7ad8', jaune: '#f2c230' };
const SHAPES = ['rond', 'carré', 'triangle'];
const SIZES = ['petit', 'grand'];
function gem(o, size = 54) {
  const s = sv('svg', { viewBox: '-30 -30 60 60', width: size, height: size }), r = o.taille === 'grand' ? 24 : 14, st = { fill: COLORS[o.couleur], stroke: '#2b2440', 'stroke-width': 2 };
  if (o.forme === 'rond') s.append(sv('circle', { r, ...st }));
  if (o.forme === 'carré') s.append(sv('rect', { x: -r, y: -r, width: 2 * r, height: 2 * r, ...st }));
  if (o.forme === 'triangle') s.append(sv('polygon', { points: `0,${-r} ${r},${r * 0.85} ${-r},${r * 0.85}`, ...st }));
  return s;
}
function collection(n = 9) { const all = []; for (const couleur of Object.keys(COLORS)) for (const forme of SHAPES) for (const taille of SIZES) all.push({ couleur, forme, taille }); return shuffle(all).slice(0, n); }
const CRIT = { couleur: 'la couleur', forme: 'la forme', taille: 'la taille' };
function trier(body, talk) {
  const tabs = h('div', { class: 'actions wrap' }), zone = h('div');
  body.replaceChildren(tabs, zone);
  const go = (k) => { [...tabs.children].forEach((b) => b.classList.toggle('primary', b.dataset.k === k)); ({ critere, classer, fermee })[k](); };
  tabs.append(...[['critere', '🔎 Quel critère ?'], ['classer', '🗂️ À toi de classer'], ['fermee', '❓ La question fermée']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-k': k, 'data-testid': 'da-t-' + k, onclick: () => go(k) }, l)));
  function critere() {
    let round = 0, ok = 0; const N = 4;
    const step = () => {
      if (round >= N) { zone.replaceChildren(h('p', { class: 'prompt' }, `Bravo ! ${ok}/${N} critères trouvés.`), h('button', { class: 'btn primary', type: 'button', onclick: critere }, '↻ Recommencer')); if (ok >= 3) { Sfx.win(); burst(body); } return; }
      const c = pick(Object.keys(CRIT)), items = collection(9), groups = {};
      items.forEach((o) => { (groups[o[c]] = groups[o[c]] || []).push(o); });
      zone.replaceChildren(h('p', { class: 'prompt' }, `Ces objets ont été classés. Quel critère a été utilisé ? (${round + 1}/${N})`),
        h('div', { class: 'da-groups' }, ...Object.values(groups).map((g) => h('div', { class: 'da-group' }, ...g.map((o) => gem(o, 44))))),
        h('div', { class: 'answers' }, ...shuffle([...Object.keys(CRIT), 'le nombre de côtés pairs']).map((k) => h('button', { class: 'choice', type: 'button', 'data-k': k === c ? 0 : 1, onclick: () => { if (k === c) { ok++; star(); Sfx.win(); talk(`Oui ! Les objets sont rangés selon ${CRIT[c]}.`, false); } else { Sfx.tap(); talk(`Non : regarde bien chaque groupe, ils ont tous ${CRIT[c]} en commun.`, false); } round++; setTimeout(step, 2200); } }, CRIT[k] || k))));
      talk('Ces objets ont été classés. Quel critère a été utilisé ?');
    };
    step();
  }
  function classer() {
    const c = pick(['couleur', 'forme']), cats = c === 'couleur' ? Object.keys(COLORS) : SHAPES, items = collection(9); let i = 0, ok = 0;
    const cur = h('div', { class: 'da-cur' }), bins = cats.map((k) => h('button', { class: 'da-bin', type: 'button', 'data-testid': 'da-bin', onclick: () => {
      const o = items[i]; if (!o) return;
      if (o[c] === k) { ok++; Sfx.bloop(); } else { Sfx.tap(); talk(`Non, cet objet est ${o[c]} : je le range dans la bonne catégorie.`, false); }
      bins[cats.indexOf(o[c])].querySelector('.da-in').append(gem(o, 26));
      i++; show();
    } }, h('b', null, k), h('div', { class: 'da-in' })));
    const show = () => { if (i >= items.length) { cur.replaceChildren(h('b', null, `${ok}/${items.length} bien classés !`)); star(ok >= 8 ? 2 : 1); if (ok >= 8) { Sfx.win(); burst(body); } return; } cur.replaceChildren(gem(items[i], 80)); };
    zone.replaceChildren(h('p', { class: 'prompt' }, `Classe chaque objet selon ${CRIT[c]} : 3 catégories.`), cur, h('div', { class: 'da-bins' }, ...bins), h('button', { class: 'btn small', type: 'button', onclick: classer }, '↻ Autre critère'));
    talk(`Classe chaque objet selon ${CRIT[c]}.`);
    show();
  }
  function fermee() {
    const host = h('div'); zone.replaceChildren(h('p', { class: 'muted' }, 'Une question FERMÉE se répond par OUI ou par NON. Elle permet de trier une collection en deux groupes.'), host);
    qcm(host, talk, shuffle([
      { q: 'Quelle question est une question fermée ?', opts: ['Est-ce que l’objet est rouge ?', 'De quelle couleur est l’objet ?', 'Pourquoi l’objet est-il rouge ?'], why: 'On peut y répondre par oui ou par non.' },
      { q: 'Pour trier les objets en deux groupes « grands » et « petits », on pose la question…', opts: ['Est-ce que l’objet est grand ?', 'Quelle est la taille de l’objet ?', 'Combien d’objets y a-t-il ?'], why: 'Oui → groupe des grands ; non → groupe des petits.' },
      { q: 'Quelle question n’est PAS fermée ?', opts: ['Quelle forme a cet objet ?', 'Est-ce un triangle ?', 'Est-ce que l’objet a 4 côtés ?'], why: '« Quelle forme… ? » demande une réponse en mots : c’est une question ouverte.' },
      { q: 'Est-ce que l’animal a des plumes ? Cette question permet de trier…', opts: ['les oiseaux et les autres animaux', 'les animaux par couleur', 'les animaux par taille'], why: 'Oui : les oiseaux. Non : les autres.' },
    ]).slice(0, 3), () => host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: fermee }, '↻ Encore'))));
  }
  go('critere');
}

// ---------- 2. sondage et diagramme à bandes ----------
const SURVEYS = [
  { q: 'Que préfères-tu faire le mercredi après-midi ?', cats: [['📚 Lire', 4], ['🎵 Écouter de la musique', 3], ['📺 Regarder la télévision', 10], ['🎮 Jouer aux jeux vidéo', 7]] },
  { q: 'Quel est ton fruit préféré ?', cats: [['🍎 Pomme', 6], ['🍌 Banane', 4], ['🍓 Fraise', 9], ['🍊 Orange', 3]] },
  { q: 'Comment viens-tu à l’école ?', cats: [['🚶 À pied', 8], ['🚗 En voiture', 6], ['🚌 En bus', 5], ['🚲 À vélo', 2]] },
];
const tally = (n) => '|||| '.repeat(Math.floor(n / 5)).replace(/\|\|\|\| /g, '卌 ') + '|'.repeat(n % 5);
function sondage(body, talk) {
  const sv0 = pick(SURVEYS), vals = sv0.cats.map(() => 0), MAX = 12;
  const head = h('p', { class: 'prompt' }, `Sondage auprès des enfants du château : « ${sv0.q} »`);
  const table = h('table', { class: 'da-table' }, h('tr', null, h('th', null, 'Réponse'), h('th', null, 'Comptage'), h('th', null, 'Nombre')), ...sv0.cats.map(([l, n]) => h('tr', null, h('td', null, l), h('td', { class: 'da-tally' }, tally(n)), h('td', null, String(n)))));
  const chart = h('div', { class: 'da-chart' });
  const draw = () => chart.replaceChildren(...sv0.cats.map(([l], i) => h('div', { class: 'da-row' }, h('span', { class: 'da-lab' }, l), h('div', { class: 'da-track' }, h('div', { class: 'da-barh', style: `width:${vals[i] / MAX * 100}%` }), ...Array.from({ length: MAX + 1 }, (_, k) => h('i', { style: `left:${k / MAX * 100}%` }))), h('button', { class: 'nu-k', type: 'button', 'data-testid': 'da-minus', onclick: () => { vals[i] = Math.max(0, vals[i] - 1); draw(); } }, '−'), h('b', null, String(vals[i])), h('button', { class: 'nu-k', type: 'button', 'data-testid': 'da-plus', onclick: () => { vals[i] = Math.min(MAX, vals[i] + 1); Sfx.tap(); draw(); } }, '+'))),
    h('div', { class: 'da-axis' }, ...Array.from({ length: MAX / 2 + 1 }, (_, k) => h('span', null, String(k * 2)))));
  const after = h('div');
  body.replaceChildren(head, h('div', { class: 'mi-lab' }, table, h('div', { class: 'mi-side' }, h('b', null, 'Complète le diagramme à bandes horizontales :'), chart)),
    h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'da-check', onclick: () => {
      const bad = sv0.cats.findIndex(([, n], i) => vals[i] !== n);
      if (bad < 0) { star(2); Sfx.win(); burst(body); talk('Bravo, ton diagramme est juste !'); lire(); } else talk(`Regarde la bande « ${sv0.cats[bad][0].slice(3)} » : il faut ${sv0.cats[bad][1]}.`, false);
    } }, '✓ Vérifier le diagramme')), after);
  talk('Voici les résultats du sondage. Complète le diagramme à bandes en faisant grandir chaque bande.');
  draw();
  function lire() {
    const tot = sv0.cats.reduce((a, c) => a + c[1], 0), mx = sv0.cats.reduce((a, c) => (c[1] > a[1] ? c : a)), mn = sv0.cats.reduce((a, c) => (c[1] < a[1] ? c : a));
    const [a, b] = shuffle(sv0.cats).slice(0, 2);
    qcm(after, talk, [
      { q: 'Quelle réponse a été la plus choisie ?', opts: [mx[0], ...shuffle(sv0.cats.filter((c) => c !== mx)).slice(0, 2).map((c) => c[0])], why: `C’est la bande la plus longue : ${mx[1]}.` },
      { q: 'Combien d’enfants ont répondu au sondage ?', opts: [String(tot), String(tot - 3), String(sv0.cats.length)], why: `On additionne : ${sv0.cats.map((c) => c[1]).join(' + ')} = ${tot}.` },
      { q: `Combien d’enfants de plus ont choisi « ${(a[1] >= b[1] ? a : b)[0].slice(3)} » que « ${(a[1] >= b[1] ? b : a)[0].slice(3)} » ?`, opts: [String(Math.abs(a[1] - b[1])), String(a[1] + b[1]), String(Math.abs(a[1] - b[1]) + 2)].filter((x, i, arr) => arr.indexOf(x) === i), why: `${Math.max(a[1], b[1])} − ${Math.min(a[1], b[1])} = ${Math.abs(a[1] - b[1])}.` },
      { q: 'Quelle réponse a été la moins choisie ?', opts: [mn[0], ...shuffle(sv0.cats.filter((c) => c !== mn)).slice(0, 2).map((c) => c[0])], why: `C’est la bande la plus courte : ${mn[1]}.` },
    ], () => after.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => sondage(body, talk) }, '↻ Un autre sondage'))));
  }
}

// ---------- 3. reconnaître les graphiques ----------
function miniChart(k) {
  const s = sv('svg', { viewBox: '0 0 160 110', class: 'da-mini' }); s.append(sv('rect', { width: 160, height: 110, fill: '#fff', rx: 8 }));
  if (k === 'bandes') [30, 70, 50, 90].forEach((v, i) => s.append(sv('rect', { x: 20 + i * 32, y: 100 - v, width: 22, height: v, fill: ['#e8455a', '#3a7ad8', '#f2c230', '#2fa36a'][i] })));
  if (k === 'ligne') { s.append(sv('polyline', { points: '15,90 45,60 75,70 105,30 140,45', fill: 'none', stroke: '#3a7ad8', 'stroke-width': 4 })); [[15, 90], [45, 60], [75, 70], [105, 30], [140, 45]].forEach(([x, y]) => s.append(sv('circle', { cx: x, cy: y, r: 4, fill: '#e8455a' }))); }
  if (k === 'circulaire') { s.append(sv('circle', { cx: 80, cy: 55, r: 42, fill: '#3a7ad8' }), sv('path', { d: 'M80,55 L80,13 A42,42 0 0 1 120,67 Z', fill: '#f2c230' }), sv('path', { d: 'M80,55 L120,67 A42,42 0 0 1 60,92 Z', fill: '#e8455a' })); }
  if (k === 'arbre') { const L = (x1, y1, x2, y2) => s.append(sv('line', { x1, y1, x2, y2, stroke: '#2b2440', 'stroke-width': 3 })); L(80, 15, 40, 55); L(80, 15, 120, 55); L(40, 55, 20, 95); L(40, 55, 60, 95); L(120, 55, 100, 95); L(120, 55, 140, 95); [[80, 15], [40, 55], [120, 55], [20, 95], [60, 95], [100, 95], [140, 95]].forEach(([x, y]) => s.append(sv('circle', { cx: x, cy: y, r: 7, fill: '#2fa36a' }))); }
  if (k === 'tableau') { for (let i = 0; i <= 4; i++) s.append(sv('line', { x1: 10, y1: 10 + i * 22, x2: 150, y2: 10 + i * 22, stroke: '#2b2440' })); for (let j = 0; j <= 4; j++) s.append(sv('line', { x1: 10 + j * 35, y1: 10, x2: 10 + j * 35, y2: 98, stroke: '#2b2440' })); s.append(sv('rect', { x: 10, y: 10, width: 35, height: 88, fill: '#3a7ad833' }), sv('rect', { x: 10, y: 10, width: 140, height: 22, fill: '#f2c23044' })); }
  return s;
}
const NAMES = { bandes: 'un diagramme à bandes', ligne: 'une ligne brisée', circulaire: 'un diagramme circulaire', arbre: 'un arbre', tableau: 'un tableau à double entrée' };
function graphiques(body, talk) {
  const keys = Object.keys(NAMES), host = h('div');
  body.replaceChildren(h('div', { class: 'da-gal' }, ...keys.map((k) => h('div', { class: 'da-gcard' }, miniChart(k), h('small', null, NAMES[k])))), host);
  qcm(host, talk, shuffle(keys).map((k) => ({ pic: () => miniChart(k), q: 'Comment s’appelle cette représentation ?', opts: [NAMES[k], ...shuffle(keys.filter((x) => x !== k)).slice(0, 2).map((x) => NAMES[x])], why: `C’est ${NAMES[k]}.` })), () => host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => graphiques(body, talk) }, '↻ Encore'))));
  talk('Voici les principales façons de représenter des données. Observe-les, puis reconnais-les.');
}

// ---------- 4. tableau à double entrée ----------
function doubleEntree(body, talk) {
  const rows = ['Lina', 'Tom', 'Zoé'], cols = ['🍎 pommes', '🍐 poires', '🍌 bananes'];
  const data = rows.map(() => cols.map(() => ri(0, 9)));
  const tbl = h('table', { class: 'da-table big' }, h('tr', null, h('th', null, ''), ...cols.map((c) => h('th', null, c))), ...rows.map((r, i) => h('tr', null, h('th', null, r), ...cols.map((_, j) => h('td', null, String(data[i][j]))))));
  const host = h('div'); body.replaceChildren(h('p', { class: 'prompt' }, 'Voici un tableau à double entrée : les fruits cueillis par chaque enfant. On lit la ligne ET la colonne.'), tbl, host);
  const qs = [];
  for (let n = 0; n < 3; n++) { const i = ri(0, 2), j = ri(0, 2), v = data[i][j]; qs.push({ q: `Combien de ${cols[j].slice(3)} ${rows[i]} a-t-${['elle', 'il', 'elle'][i]} cueillies ?`, opts: [String(v), String(data[(i + 1) % 3][j]), String(data[i][(j + 1) % 3])].filter((x, k, a) => a.indexOf(x) === k).concat(String(v + 10)).slice(0, 3), why: `Ligne ${rows[i]}, colonne ${cols[j].slice(3)} : ${v}.` }); }
  const tot = data[0].reduce((a, b) => a + b, 0); qs.push({ q: `Combien de fruits Lina a-t-elle cueillis en tout ?`, opts: [String(tot), String(tot + 2), String(data[0][0])].filter((x, k, a) => a.indexOf(x) === k), why: `${data[0].join(' + ')} = ${tot}.` });
  qcm(host, talk, qs, () => host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => doubleEntree(body, talk) }, '↻ Un autre tableau'))));
}

// ---------- 5. énigme logique ----------
const ENIG = [
  { who: ['Lina', 'Tom', 'Zoé'], what: ['🐇 lapin', '🐴 poney', '🐐 chèvre'], sol: [1, 2, 0], clues: ['Lina n’a pas peur des grands animaux : elle soigne le poney.', 'Tom ne soigne pas le lapin.', 'Le lapin n’est pas soigné par Lina.'], why: ['Indice 1 : Lina soigne le poney.', 'Indice 2 : Tom ne soigne pas le lapin, et le poney est déjà pris : Tom soigne la chèvre.', 'Il reste le lapin pour Zoé.', 'L’indice 3 était inutile : on savait déjà que Lina soigne le poney.'] },
  { who: ['Omar', 'Rita', 'Nina'], what: ['🎻 violon', '🥁 tambour', '🎹 piano'], sol: [2, 0, 1], clues: ['Rita joue d’un instrument à cordes frottées.', 'Omar ne joue pas du tambour.', 'Nina ne joue ni du violon ni du piano.'], why: ['Indice 1 : on frotte les cordes du violon avec un archet, donc Rita joue du violon.', 'Indice 3 : Nina ne joue ni du violon ni du piano, donc Nina joue du tambour.', 'Il reste le piano pour Omar (l’indice 2 le confirme).'] },
  { who: ['Sam', 'Léa', 'Yanis'], what: ['🔴 rouge', '🔵 bleu', '🟢 vert'], sol: [1, 2, 0], clues: ['Yanis aime la couleur des tomates.', 'Sam n’aime pas le vert.', 'Un indice inutile : les trois enfants aiment dessiner.'], why: ['Indice 1 : les tomates sont rouges, donc Yanis aime le rouge.', 'Indice 2 : Sam n’aime pas le vert, et le rouge est pris : Sam aime le bleu.', 'Il reste le vert pour Léa.', 'L’indice 3 ne servait à rien pour trouver la réponse.'] },
];
function enigme(body, talk) {
  const E = pick(ENIG), n = 3, grid = Array.from({ length: n }, () => Array(n).fill(0)); // 0 vide, 1 oui, 2 non
  const tbl = h('table', { class: 'da-table big logic' }); let fails = 0;
  const solBox = h('div', { class: 'da-sol', hidden: true });
  const showSol = (won) => {
    solBox.hidden = false; solBtn.hidden = true;
    solBox.replaceChildren(h('h4', null, won ? '🏆 Bravo ! Voici la solution expliquée' : '💡 La solution'),
      h('table', { class: 'da-table logic sol' }, h('tr', null, h('th', null, ''), ...E.what.map((w) => h('th', null, w))), ...E.who.map((p, i) => h('tr', null, h('th', null, p), ...E.what.map((_, j) => h('td', { class: j === E.sol[i] ? 'ok' : '' }, j === E.sol[i] ? '✅' : '❌'))))),
      h('p', { class: 'da-sol-ans' }, E.who.map((p, i) => `${p} → ${E.what[E.sol[i]]}`).join(' · ')),
      h('ol', null, ...E.why.map((w) => h('li', null, w))));
    solBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  const solBtn = h('button', { class: 'btn small', type: 'button', 'data-testid': 'da-sol', onclick: () => { showSol(false); talk('Voici la solution. Lis bien le raisonnement, puis essaie une autre énigme !', false); } }, '💡 Voir la solution');
  const draw = () => tbl.replaceChildren(h('tr', null, h('th', null, ''), ...E.what.map((w) => h('th', null, w))), ...E.who.map((p, i) => h('tr', null, h('th', null, p), ...E.what.map((_, j) => h('td', { class: 'da-cell', 'data-testid': 'da-cell', onclick: () => { grid[i][j] = (grid[i][j] + 1) % 3; Sfx.tap(); draw(); } }, ['', '✔️', '❌'][grid[i][j]])))));
  body.replaceChildren(h('p', { class: 'prompt' }, 'Énigme : retrouve qui a quoi. Touche une case : ✔️ = oui, ❌ = non. Attention, un indice peut être inutile !'), h('ul', { class: 'da-clues' }, ...E.clues.map((c) => h('li', null, c))), tbl,
    h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'da-check', onclick: () => {
      const good = E.who.every((_, i) => grid[i][E.sol[i]] === 1 && grid[i].filter((v) => v === 1).length === 1);
      if (good) { star(3); Sfx.win(); burst(body); talk(`Bravo, détective ! ${E.who.map((p, i) => `${p} : ${E.what[E.sol[i]].slice(3)}`).join(', ')}.`); showSol(true); }
      else { fails++; talk(fails >= 2 ? 'Pas encore. Tu peux toucher « 💡 Voir la solution » pour découvrir la réponse et le raisonnement.' : 'Pas encore : chaque enfant doit avoir exactement un ✔️, et chaque colonne aussi. Relis les indices un par un.', false); }
    } }, '✓ Vérifier'), h('button', { class: 'btn small', type: 'button', onclick: () => enigme(body, talk) }, '↻ Une autre énigme'), solBtn), solBox);
  talk('Lis les indices et remplis le tableau pour retrouver qui a quoi.');
  draw();
}

export function open(tab = 'trier') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['trier', '🗂️ Trier et classer', trier], ['sondage', '📊 Sondage et diagramme', sondage], ['graphiques', '📈 Les graphiques', graphiques], ['tableau', '🔢 Tableau à double entrée', doubleEntree], ['enigme', '🕵️ L’énigme logique', enigme]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'da-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel da-panel' }, UI.closeButton(), h('h2', null, '📊 La Salle des Mille Données'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Salle des données', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
