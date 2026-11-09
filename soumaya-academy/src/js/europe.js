// La Gare des Étoiles d'Europe : l'Union européenne (P4). Le drapeau et son sens, les 27 pays (capitale, langue, monument),
// le train des monuments au départ de Bruxelles, l'euro, et les défis.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, qcm } from './workshop.js';
import MAP from './europe_map.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.europe = b.europe || { vus: {}, ok: {} }; return b.europe; };

// [nom, drapeau, capitale, langue(s), monument, x, y (position sur la petite carte, en %)]
export const PAYS = [
  ['Belgique', '🇧🇪', 'Bruxelles', 'français, néerlandais, allemand', 'l’Atomium', 41, 52],
  ['France', '🇫🇷', 'Paris', 'français', 'la tour Eiffel', 33, 62],
  ['Pays-Bas', '🇳🇱', 'Amsterdam', 'néerlandais', 'les moulins de Kinderdijk', 43, 47],
  ['Luxembourg', '🇱🇺', 'Luxembourg', 'luxembourgeois, français, allemand', 'le palais grand-ducal', 43, 56],
  ['Allemagne', '🇩🇪', 'Berlin', 'allemand', 'la porte de Brandebourg', 51, 50],
  ['Italie', '🇮🇹', 'Rome', 'italien', 'le Colisée', 52, 72],
  ['Espagne', '🇪🇸', 'Madrid', 'espagnol', 'la Sagrada Família', 22, 74],
  ['Portugal', '🇵🇹', 'Lisbonne', 'portugais', 'la tour de Belém', 13, 74],
  ['Grèce', '🇬🇷', 'Athènes', 'grec', 'l’Acropole', 69, 82],
  ['Irlande', '🇮🇪', 'Dublin', 'irlandais, anglais', 'les falaises de Moher', 19, 44],
  ['Danemark', '🇩🇰', 'Copenhague', 'danois', 'la Petite Sirène', 51, 38],
  ['Suède', '🇸🇪', 'Stockholm', 'suédois', 'le palais royal de Stockholm', 59, 24],
  ['Finlande', '🇫🇮', 'Helsinki', 'finnois, suédois', 'la cathédrale d’Helsinki', 71, 18],
  ['Autriche', '🇦🇹', 'Vienne', 'allemand', 'le château de Schönbrunn', 57, 60],
  ['Pologne', '🇵🇱', 'Varsovie', 'polonais', 'le château royal de Varsovie', 64, 48],
  ['Tchéquie', '🇨🇿', 'Prague', 'tchèque', 'le pont Charles', 57, 54],
  ['Slovaquie', '🇸🇰', 'Bratislava', 'slovaque', 'le château de Bratislava', 63, 58],
  ['Hongrie', '🇭🇺', 'Budapest', 'hongrois', 'le Parlement de Budapest', 63, 63],
  ['Slovénie', '🇸🇮', 'Ljubljana', 'slovène', 'le lac de Bled', 56, 65],
  ['Croatie', '🇭🇷', 'Zagreb', 'croate', 'les remparts de Dubrovnik', 59, 68],
  ['Roumanie', '🇷🇴', 'Bucarest', 'roumain', 'le château de Bran', 73, 65],
  ['Bulgarie', '🇧🇬', 'Sofia', 'bulgare', 'le monastère de Rila', 73, 72],
  ['Estonie', '🇪🇪', 'Tallinn', 'estonien', 'la vieille ville de Tallinn', 72, 28],
  ['Lettonie', '🇱🇻', 'Riga', 'letton', 'la vieille ville de Riga', 72, 34],
  ['Lituanie', '🇱🇹', 'Vilnius', 'lituanien', 'le château de Trakai', 72, 40],
  ['Malte', '🇲🇹', 'La Valette', 'maltais, anglais', 'les remparts de La Valette', 56, 86],
  ['Chypre', '🇨🇾', 'Nicosie', 'grec, turc', 'les mosaïques de Paphos', 86, 86],
];
const P = (n) => PAYS.find((p) => p[0] === n);

// ---------- 1. le drapeau ----------
function drapeau(body, talk) {
  const flag = h('div', { class: 'eu-flag' }), box = h('div', { class: 'ea-step' });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; flag.append(h('span', { class: 'eu-star', style: `left:${50 + Math.cos(a) * 22}%;top:${50 + Math.sin(a) * 33}%;animation-delay:${i * 0.12}s` }, '★')); }
  const parts = [
    ['🔵 Le fond bleu', 'Le bleu représente le ciel au-dessus de l’Europe, et l’Occident.'],
    ['⭐ Les 12 étoiles dorées', 'Les étoiles représentent les peuples d’Europe. Il y en a 12, car c’est un symbole de perfection et d’unité. Attention, piège : ce n’est pas le nombre de pays ! Il y a 27 pays, mais toujours 12 étoiles.'],
    ['⭕ Le cercle', 'Les étoiles forment un cercle : c’est le signe de l’union, de l’amitié et de la solidarité entre les pays.'],
  ];
  body.replaceChildren(h('p', { class: 'prompt' }, 'Touche chaque partie du drapeau européen pour comprendre ce qu’elle veut dire.'),
    h('div', { class: 'ea-wrap' }, flag, h('div', { class: 'ea-side' }, h('div', { class: 'actions wrap' }, ...parts.map(([t, d], i) => h('button', { class: 'btn', type: 'button', 'data-testid': 'eu-part-' + i, onclick: () => { flag.dataset.on = i; box.replaceChildren(h('b', null, t), h('p', null, d)); talk(d); Sfx.bloop(); } }, t))), box)));
  box.replaceChildren(h('b', null, '🇪🇺 Le drapeau de l’Union européenne'), h('p', null, 'L’Union européenne réunit 27 pays qui ont décidé de travailler ensemble, en paix. La Belgique est l’un des six pays fondateurs, et Bruxelles est souvent appelée la capitale de l’Europe !'));
  talk('Voici le drapeau de l’Union européenne. Touche chaque partie pour savoir ce qu’elle veut dire.');
}

// ---------- 2. la carte des 27 pays ----------
function carte(body, talk) {
  const NS = 'http://www.w3.org/2000/svg', mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const svg = mk('svg', { viewBox: `0 0 ${MAP.w} ${MAP.h}`, class: 'eu-svg', preserveAspectRatio: 'none' });
  MAP.other.forEach((d) => svg.append(mk('path', { d, class: 'eu-o' })));
  const paths = {}; for (const [n, d] of Object.entries(MAP.eu)) { const pth = mk('path', { d, class: 'eu-c' + (ST().vus[n] ? ' vu' : '') + (n === 'Belgique' ? ' be' : '') }); paths[n] = pth; svg.append(pth); }
  const map = h('div', { class: 'eu-map' }), card = h('div', { class: 'ea-step' }), cnt = h('small', { class: 'muted' });
  map.append(svg);
  const upd = () => { cnt.textContent = `${Object.keys(ST().vus).length}/27 pays découverts`; };
  PAYS.forEach((p) => map.append(h('button', { class: 'eu-pin' + (ST().vus[p[0]] ? ' vu' : ''), type: 'button', style: `left:${MAP.cap[p[0]][0]}%;top:${MAP.cap[p[0]][1]}%`, 'aria-label': p[0], 'data-testid': 'eu-pin-' + p[0], onclick: (e) => {
    const st = ST(); st.vus[p[0]] = 1; S.save(); e.currentTarget.classList.add('vu'); Object.values(paths).forEach((x) => x.classList.remove('sel')); if (paths[p[0]]) paths[p[0]].classList.add('vu', 'sel'); upd(); Sfx.bloop();
    card.replaceChildren(h('div', { class: 'eu-big' }, p[1]), h('b', null, p[0]), h('p', null, `🏛️ Capitale : ${p[2]}`), h('p', null, `🗣️ Langue : ${p[3]}`), h('p', null, `📸 À voir : ${p[4]}`));
    talk(`${p[0]}. Sa capitale est ${p[2]}. On y parle ${p[3]}. À voir : ${p[4]}.`);
    if (Object.keys(st.vus).length === 27) { star(3); Sfx.win(); burst(body); }
  } }, p[1])));
  body.replaceChildren(h('p', { class: 'prompt' }, 'Touche un drapeau sur la carte pour découvrir le pays.'), cnt, h('div', { class: 'ea-wrap' }, map, card));
  card.replaceChildren(h('b', null, '🗺️ Les 27 pays de l’Union européenne'), h('p', null, 'La Belgique a quatre voisins : la France, les Pays-Bas, l’Allemagne et le Luxembourg. Trouve-les !'));
  upd(); talk('Voici les 27 pays de l’Union européenne. Commence par la Belgique et ses voisins !');
}

// ---------- 3. le train des monuments ----------
const TRAIN = ['Belgique', 'France', 'Espagne', 'Italie', 'Grèce', 'Allemagne', 'Pays-Bas'];
const IMG = { Belgique: 'atomium', France: 'eiffel', Espagne: 'sagrada', Italie: 'colisee', 'Grèce': 'acropole', Allemagne: 'brandebourg', 'Pays-Bas': 'kinderdijk' };
const monImg = (n, cls = 'eu-mon') => IMG[n] ? h('img', { class: cls, src: `assets/europe/${IMG[n]}.webp`, alt: P(n)[4], loading: 'lazy' }) : null;
const INFOS = {
  Belgique: 'Départ de Bruxelles ! L’Atomium représente un cristal de fer agrandi 165 milliards de fois. Et à Bruxelles siège le Parlement européen.',
  France: 'Paris ! La tour Eiffel mesure 330 mètres. On l’a construite pour l’Exposition universelle de 1889.',
  Espagne: 'Barcelone ! La Sagrada Família est une immense basilique imaginée par l’architecte Gaudí. On la construit depuis plus de 140 ans !',
  Italie: 'Rome ! Le Colisée est un amphithéâtre de près de 2000 ans, où les Romains assistaient aux spectacles.',
  Grèce: 'Athènes ! L’Acropole est une colline avec le Parthénon, un temple de l’Antiquité grecque vieux de 2500 ans.',
  Allemagne: 'Berlin ! La porte de Brandebourg est le symbole de la réunification de l’Allemagne.',
  'Pays-Bas': 'Kinderdijk ! Ses 19 moulins pompaient l’eau pour protéger les terres sous le niveau de la mer. Terminus, retour en Belgique !',
};
function train(body, talk) {
  let i = -1; const track = h('div', { class: 'eu-track' }), card = h('div', { class: 'ea-step' }), loco = h('span', { class: 'eu-loco' }, '🚂');
  TRAIN.forEach((n, k) => track.append(h('span', { class: 'eu-gare', style: `left:${6 + k * 88 / (TRAIN.length - 1)}%` }, P(n)[1])));
  track.append(loco);
  const next = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'eu-next', onclick: () => {
    i++; if (i >= TRAIN.length) { next.remove(); defi(); return; }
    const p = P(TRAIN[i]); loco.style.left = `${6 + i * 88 / (TRAIN.length - 1)}%`; Sfx.coin();
    card.replaceChildren(monImg(p[0]), h('b', null, `${p[1]} ${p[0]} — ${p[4]}`), h('p', null, INFOS[p[0]])); talk(INFOS[p[0]]);
    next.textContent = i === TRAIN.length - 1 ? 'Le quiz des monuments ▶' : 'Gare suivante ▶';
  } }, 'En voiture ! ▶');
  const q = h('div');
  const defi = () => qcm(q, talk, shuffle(TRAIN).slice(0, 5).map((n) => { const p = P(n), others = shuffle(TRAIN.filter((x) => x !== n)).slice(0, 2); return { pic: () => monImg(n, 'eu-mon q'), q: `Dans quel pays se trouve ${p[4]} ?`, opts: [p[0], ...others], why: `${p[4]} se trouve en ${p[0] === 'Pays-Bas' ? 'aux Pays-Bas' : p[0]}.` }; }), (ok) => { if (ok >= 4) { const st = ST(); st.ok.train = 1; S.save(); star(2); Sfx.win(); burst(q); } });
  body.replaceChildren(h('p', { class: 'prompt' }, 'Monte dans le train doré : il fait le tour des monuments d’Europe au départ de Bruxelles !'), track, h('div', { class: 'ea-wrap' }, card, h('div', { class: 'ea-side' }, next)), q);
  card.replaceChildren(h('b', null, '🚉 Gare des Étoiles d’Europe'), h('p', null, 'Prête ? Le train part de Bruxelles.')); talk('En voiture ! Le train part de Bruxelles.');
}

// ---------- 4. l'euro ----------
// Billets stylisés (couleurs officielles de chaque valeur, style d'architecture), non confondables avec de vrais billets.
const BILLETS = [
  [50000, 500, '#8b5aa8', '#e6d4f0', 'moderne (20e siècle)', 'violet'],
  [20000, 200, '#c9962e', '#f6e6bd', 'art nouveau, fer et verre', 'jaune-brun'],
  [10000, 100, '#3f9a5a', '#d3efda', 'baroque et rococo', 'vert'],
  [5000, 50, '#e07f26', '#fbe0c4', 'Renaissance', 'orange'],
  [2000, 20, '#3a6db5', '#d6e3f6', 'gothique', 'bleu'],
  [1000, 10, '#c8434a', '#f6d6d7', 'roman', 'rouge'],
  [500, 5, '#8c9590', '#e6e9e7', 'classique (Antiquité)', 'gris'],
];
const PIECES = [[200, '2', '€', 'bi2'], [100, '1', '€', 'bi1'], [50, '50', 'cent', 'or'], [20, '20', 'cent', 'or'], [10, '10', 'cent', 'or'], [5, '5', 'cent', 'cu'], [2, '2', 'cent', 'cu'], [1, '1', 'cent', 'cu']];
const ARCH = {
  'classique (Antiquité)': '<path d="M6 30h28M8 30V14m6 16V14m6 16V14m6 16V14m6 16V14M5 14h30L20 5z"/>',
  roman: '<path d="M8 30V16a12 12 0 0 1 24 0v14M14 30V18a6 6 0 0 1 12 0v12"/>',
  gothique: '<path d="M10 30V16Q10 8 20 3q10 5 10 13v14M15 30V18q0-5 5-9 5 4 5 9v12"/>',
  Renaissance: '<path d="M7 30V16h26v14M7 16a13 10 0 0 1 26 0M13 30V20a7 6 0 0 1 14 0v10"/>',
  'baroque et rococo': '<path d="M6 30V17q2-8 14-12 12 4 14 12v13M12 30V20q0-6 8-8 8 2 8 8v10M17 9q3-4 6 0"/>',
  'art nouveau, fer et verre': '<path d="M6 30V12q14-12 28 0v18M6 12h28M13 30V8m7 22V3m7 27V8"/>',
  'moderne (20e siècle)': '<path d="M6 30V6h28v24M6 14h28M6 22h28M15 6v24M25 6v24"/>',
};
function billet(v, opts = {}) {
  const B = BILLETS.find((x) => x[1] === v); const el = h('button', { class: 'eu-note', type: 'button', style: `--c:${B[2]};--l:${B[3]}`, 'aria-label': `billet de ${v} euros`, ...opts });
  el.innerHTML = `<span class="n-v">${v}</span><svg class="n-arch" viewBox="0 0 40 34" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">${ARCH[B[4]]}</svg><span class="n-eu">EURO</span><span class="n-stars">${'★'.repeat(5)}</span><span class="n-v2">${v}</span>`;
  return el;
}
function piece(P, opts = {}) { return h('button', { class: 'eu-piece ' + P[3], type: 'button', 'aria-label': `${P[1]} ${P[2]}`, ...opts }, h('b', null, P[1]), h('small', null, P[2] === '€' ? 'EURO' : 'CENT')); }
function euro(body, talk) {
  const fmt = (c) => (c / 100).toFixed(2).replace('.', ',') + ' €';
  // galerie
  const info = h('p', { class: 'eu-ninfo' }, 'Touche un billet pour le découvrir.');
  const gal = h('div', { class: 'eu-gal' }, ...BILLETS.slice().reverse().map((B) => billet(B[1], { onclick: () => { Sfx.tap(); const t = `Le billet de ${B[1]} euros est ${B[5]}. On y voit des portes et des fenêtres de style ${B[4]}.${B[1] === 500 ? ' On ne l’imprime plus depuis 2019, mais il est toujours valable !' : ''}`; info.textContent = t; talk(t); } })));
  // jeu
  const PRIX = [[135, 270, 455, 380, 725, 650, 1240, 1895], [2350, 3470, 4820, 6715, 8990], [12500, 17840, 26350, 38720, 64500]];
  let n = 0, ok = 0; const zone = h('div');
  const ask = () => {
    if (n >= 6) { zone.replaceChildren(h('p', { class: 'tb-res' }, `${ok}/6 !`)); if (ok >= 5) { const st = ST(); st.ok.euro = 1; S.save(); star(2); Sfx.win(); burst(body); } return; }
    const lvl = n < 2 ? 0 : n < 4 ? 1 : 2; n++; const L = PRIX[lvl], prix = L[Math.floor(Math.random() * L.length)];
    const given = []; const tot = () => given.reduce((a, x) => a + x, 0);
    const paid = h('b', null, fmt(0)), hand = h('div', { class: 'eu-hand' });
    const redraw = () => { paid.textContent = fmt(tot()); hand.replaceChildren(...given.map((v, k) => { const B = BILLETS.find((x) => x[0] === v); const P = PIECES.find((x) => x[0] === v); const el = B ? billet(B[1], { class: 'eu-note mini' }) : piece(P, { class: 'eu-piece mini ' + P[3] }); el.onclick = () => { given.splice(k, 1); Sfx.tap(); redraw(); }; return el; })); };
    const add = (v) => { given.push(v); Sfx.tap(); redraw(); const t = tot(); if (t === prix) { ok++; Sfx.ok(); talk('Bravo, le compte est bon !'); setTimeout(ask, 1300); } else if (t > prix) { Sfx.ko(); talk(`Trop ! Tu as donné ${fmt(t)}. Touche un billet ou une pièce dans ta main pour le reprendre.`, false); } };
    zone.replaceChildren(h('p', { class: 'tb-q', style: 'font-size:clamp(20px,3.4vw,28px)' }, `Paie exactement ${fmt(prix)}`), h('p', null, 'Dans ta main : ', paid, h('small', { class: 'muted' }, '  (touche un billet de ta main pour le reprendre)')), hand,
      h('div', { class: 'eu-money notes' }, ...BILLETS.slice().reverse().map((B) => billet(B[1], { onclick: () => add(B[0]) }))),
      h('div', { class: 'eu-money' }, ...PIECES.map((P) => piece(P, { onclick: () => add(P[0]) }))),
      h('button', { class: 'btn small', type: 'button', onclick: () => { given.length = 0; redraw(); } }, '↺ Reprendre tout'));
  };
  body.replaceChildren(h('p', { class: 'muted' }, 'L’euro (€) est la monnaie de 21 pays de l’Union, dont la Belgique, depuis 2002. 1 euro = 100 cents. Il y a 7 billets (5, 10, 20, 50, 100, 200 et 500 €), chacun avec sa couleur, et 8 pièces. Chaque pays décore une face de ses pièces : la Belgique y met son roi !'),
    h('h4', { class: 'eu-h' }, '💶 Les 7 billets'), gal, info, h('h4', { class: 'eu-h' }, '🛒 Paie le bon prix'), zone); ask();
  talk('L’euro est notre monnaie, partagée par vingt et un pays. Un euro vaut cent cents. Découvre les billets, puis paie le bon prix !');
}

// ---------- 5. les défis ----------
function defis(body, talk) {
  const q = h('div');
  const pool = shuffle(PAYS).slice(0, 5);
  const list = [
    { q: 'Combien de pays font partie de l’Union européenne ?', opts: ['27', '12', '50'], why: '27 pays. Les 12 étoiles du drapeau ne comptent pas les pays !' },
    { q: 'Que représentent les 12 étoiles du drapeau ?', opts: ['L’unité et la perfection', 'Les 12 pays', 'Les 12 mois'], why: '12 est un symbole de perfection et d’unité.' },
    { q: 'Quels pays sont voisins de la Belgique ?', opts: ['France, Pays-Bas, Allemagne, Luxembourg', 'Espagne, Italie, Grèce, Portugal', 'Suède, Finlande, Estonie, Lettonie'], why: 'La Belgique a 4 voisins.' },
    ...pool.map((p) => ({ q: `Quel est le drapeau de ${p[0] === 'Pays-Bas' ? 'des Pays-Bas' : p[0]} ?`, opts: [p[1], ...shuffle(PAYS.filter((x) => x !== p)).slice(0, 2).map((x) => x[1])], why: `${p[1]} : ${p[0]}, capitale ${p[2]}.` })),
  ];
  qcm(q, talk, shuffle(list).slice(0, 7), (ok) => { if (ok >= 6) { const st = ST(); st.ok.defis = 1; st.badge = true; S.save(); star(3); Sfx.win(); burst(q); talk('Bravo, petite Européenne !'); } });
  body.replaceChildren(h('p', { class: 'prompt' }, 'Le grand défi européen !'), q);
}

export function open(tab = 'drapeau') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div'), head = h('div');
  const T = [['drapeau', '🇪🇺 Le drapeau', drapeau], ['carte', '🗺️ Les 27 pays', carte], ['train', '🚂 Le train des monuments', train], ['euro', '💶 L’euro', euro], ['defis', '🏆 Les défis', defis]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'eu-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ea-panel' }, UI.closeButton(), h('h2', null, '🚉 La Gare des Étoiles d’Europe'), head, h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'La Gare des Étoiles d’Europe', onClose: () => Voice.stop() });
  function go(k) { Voice.stop(); head.replaceChildren(...(ST().badge ? [h('b', { class: 'tb-badge' }, '🇪🇺 Petite Européenne !')] : [])); tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
