// Le Jardin Botanique Enchanté (forêt vivante, éveil P4) : 6 fleurs sauvages à observer et comparer,
// la fleur en détail (racines, tige, feuilles, sépales, pétales, étamines, pistil), le défi des abeilles
// (découverte de la pollinisation), l'herbier magique et la mission « Sauver le jardin ».
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { playFile } from './papa.js';
import { burst, shuffle, qcm, log } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const J = () => { const b = S.get(); b.jardin = b.jardin || { herbier: {}, done: false }; b.jardin.herbier = b.jardin.herbier || {}; return b.jardin; };
const voice = (u) => { if (Sfx.soundOn()) playFile(u); };
// chemins écrits en entier : la version « fichier unique » les remplace par les images intégrées
const IMG = {
  paquerette: 'assets/jardin/paquerette.webp', pissenlit: 'assets/jardin/pissenlit.webp', coquelicot: 'assets/jardin/coquelicot.webp',
  violette: 'assets/jardin/violette.webp', boutondor: 'assets/jardin/boutondor.webp', trefle: 'assets/jardin/trefle.webp',
  abeille: 'assets/jardin/abeille.webp', jardin: 'assets/jardin/jardin.webp',
};
const FL = [
  { k: 'paquerette', n: 'La pâquerette', c: 'blanche et jaune', facts: ['On la trouve dans les pelouses, presque toute l’année.', 'Ses feuilles rondes forment une rosette au ras du sol.', 'Surprise : sa « fleur » est un bouquet de centaines de toutes petites fleurs serrées ! Les blanches tout autour, les jaunes au cœur.'],
    q: { q: 'Une pâquerette, c’est…', opts: ['un bouquet de centaines de petites fleurs serrées', 'une seule grande fleur', 'deux fleurs collées'], why: 'Ce qui ressemble à une fleur est en fait un capitule : plein de petites fleurs ensemble.' } },
  { k: 'pissenlit', n: 'Le pissenlit', c: 'jaune vif', facts: ['Il pousse partout : prairies, bords des chemins, jardins.', 'Ses feuilles sont découpées comme des dents : « dent-de-lion ».', 'Après la fleur jaune vient une boule de graines munies de petites aigrettes, comme des parachutes.'],
    q: { q: 'Comment voyagent les graines du pissenlit ?', opts: ['Le vent les emporte grâce à leurs petites aigrettes', 'Les fourmis les portent sur leur dos', 'Elles roulent jusqu’à la rivière'], why: 'Chaque graine a son petit parachute : le vent la transporte loin de la plante.' }, blow: true },
  { k: 'coquelicot', n: 'Le coquelicot', c: 'rouge', facts: ['Il fleurit au début de l’été, au bord des champs.', 'Il a 4 pétales rouges, fins comme du papier de soie.', 'Au centre : le pistil (vert), entouré de nombreuses étamines noires.'],
    q: { q: 'Combien de pétales a le coquelicot ?', opts: ['4', '5', '10'], why: 'Le coquelicot a 4 pétales rouges.' } },
  { k: 'violette', n: 'La violette', c: 'violette', facts: ['Elle se cache à l’ombre, sous les haies, au printemps.', 'Ses feuilles ont la forme d’un cœur.', 'Elle a 5 pétales qui n’ont pas tous la même forme : celui du bas est plus grand.'],
    q: { q: 'Que remarques-tu sur les 5 pétales de la violette ?', opts: ['Ils n’ont pas tous la même forme', 'Ils sont tous identiques', 'Elle n’a pas de pétales'], why: 'Les pétales de la violette sont différents : deux en haut, deux sur les côtés, un plus grand en bas.' } },
  { k: 'boutondor', n: 'Le bouton d’or', c: 'jaune brillant', facts: ['Il colore les prairies humides au printemps.', 'Ses 5 pétales brillent comme s’ils étaient vernis.', 'Attention : il est toxique ! On l’observe, on ne le met jamais en bouche.'],
    q: { q: 'Que fais-tu devant un bouton d’or ?', opts: ['Je l’observe sans le mettre en bouche : il est toxique', 'Je le goûte', 'Je l’arrache pour jouer'], why: 'Certaines plantes sont toxiques : on observe avec les yeux, et on se lave les mains.' } },
  { k: 'trefle', n: 'Le trèfle blanc', c: 'blanc', facts: ['Il pousse dans les pelouses et les prairies.', 'Ses feuilles ont 3 petites folioles (parfois 4 : ça porte bonheur !).', 'Sa tête ronde est faite de nombreuses petites fleurs que les abeilles adorent.'],
    q: { q: 'Pourquoi les abeilles aiment-elles le trèfle ?', opts: ['Elles y trouvent du nectar et du pollen', 'Elles y dorment la nuit', 'Elles s’y cachent de la pluie'], why: 'Les abeilles butinent : elles boivent le nectar et récoltent du pollen.' } },
];
const byK = Object.fromEntries(FL.map((f) => [f.k, f]));
const img = (k, cls = 'jb-img') => h('img', { class: cls, src: IMG[k], alt: '', draggable: 'false' });
const count = () => Object.keys(J().herbier).length;

// ---------- les 6 fleurs ----------
function fleurs(body, talk) {
  const grid = h('div', { class: 'jb-grid' });
  const draw = () => grid.replaceChildren(...FL.map((f) => h('button', { class: 'jb-card' + (J().herbier[f.k] ? ' got' : ''), type: 'button', 'data-testid': 'jb-fleur', onclick: () => fiche(f) }, img(f.k), h('b', null, f.n), J().herbier[f.k] ? h('small', null, '✅ dans l’herbier') : h('small', null, '🔍 à découvrir'))));
  const fiche = (f) => {
    const host = h('div');
    const pic = h('div', { class: 'jb-fpic' }, img(f.k, 'jb-big'));
    if (f.blow) {
      const b = h('button', { class: 'btn small', type: 'button', onclick: () => { Sfx.bloop(); for (let i = 0; i < 14; i++) { const s = h('i', { class: 'jb-seed' }); s.style.setProperty('--dx', (40 + Math.random() * 160) + 'px'); s.style.setProperty('--dy', (-30 - Math.random() * 140) + 'px'); s.style.animationDelay = (i * 0.06) + 's'; pic.append(s); setTimeout(() => s.remove(), 3200); } talk('Pfff ! Les graines s’envolent avec le vent, comme des petits parachutes !'); } }, '💨 Souffler sur les graines');
      pic.append(b);
    }
    body.replaceChildren(h('div', { class: 'jb-fiche' }, pic, h('div', { class: 'jb-txt' }, h('h3', null, f.n), h('p', null, h('b', null, 'Couleur : '), f.c), h('ul', null, ...f.facts.map((t) => h('li', null, t))), h('p', { class: 'prompt' }, '🎯 Le défi :'), host)),
      h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: () => fleurs(body, talk) }, '← Toutes les fleurs')));
    talk(`${f.n}. ${f.facts[0]} ${f.facts[2]}`);
    qcm(host, talk, [f.q], () => {
      if (!J().herbier[f.k]) { J().herbier[f.k] = Date.now(); star(1); S.save(); Sfx.win(); burst(body); log('jardin', 1); talk(`Bravo ! ${f.n} rejoint ton herbier magique : ${count()} fleur${count() > 1 ? 's' : ''} sur 6 !`); }
      host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => fleurs(body, talk) }, '🌼 Une autre fleur')));
    });
  };
  body.replaceChildren(h('p', { class: 'muted' }, '🧺 Mon herbier magique : ', h('b', null, `${count()}/6`), ' fleurs découvertes. Touche une fleur pour l’observer.'), grid);
  draw(); talk('Touche une fleur pour l’observer de près.', false);
}

// ---------- la fleur en détail ----------
const PARTS = [
  ['racines', 'Les racines', 'Elles fixent la plante dans le sol et puisent l’eau et les sels minéraux.'],
  ['tige', 'La tige', 'Elle soutient la plante et transporte l’eau jusqu’aux feuilles et aux fleurs.'],
  ['feuilles', 'Les feuilles', 'Grâce à la lumière du soleil, elles fabriquent la nourriture de la plante.'],
  ['sepales', 'Les sépales', 'Petites feuilles vertes sous la fleur : elles protègent le bouton avant qu’il s’ouvre.'],
  ['petales', 'Les pétales', 'Colorés et parfumés, ils attirent les insectes pollinisateurs.'],
  ['etamines', 'Les étamines', 'Elles produisent le pollen, une fine poudre jaune.'],
  ['pistil', 'Le pistil', 'Au centre de la fleur : il reçoit le pollen et contient les futures graines.'],
];
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };
function flowerSvg(onPart) {
  const g = (id, ...k) => { const e = sv('g', { class: 'jb-part', 'data-part': id }, ...k); e.addEventListener('click', () => onPart(id, e)); return e; };
  const s = sv('svg', { viewBox: '0 0 300 420', class: 'jb-svg' },
    sv('rect', { x: 0, y: 300, width: 300, height: 120, fill: '#8a5a33', rx: 10 }),
    g('racines', ...[[-40, 60], [-15, 85], [10, 90], [35, 70], [55, 50]].map(([dx, dy]) => sv('path', { d: `M150 305 Q ${150 + dx / 2} ${305 + dy / 2} ${150 + dx} ${305 + dy}`, stroke: '#f1e3c2', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }))),
    g('tige', sv('path', { d: 'M150 305 C 145 250 158 200 150 150', stroke: '#3f9a3a', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' })),
    g('feuilles', sv('path', { d: 'M150 250 C 110 230 80 250 70 270 C 100 275 130 270 150 250Z', fill: '#5cc04f' }), sv('path', { d: 'M150 215 C 190 195 220 210 232 232 C 200 238 172 232 150 215Z', fill: '#5cc04f' })),
    g('sepales', sv('path', { d: 'M150 150 L 118 132 L 140 140 Z M150 150 L 182 132 L 160 140 Z M150 152 L 150 128 L 156 142 Z', fill: '#2f7d2b' })),
    g('petales', ...[0, 72, 144, 216, 288].map((a) => sv('ellipse', { cx: 150, cy: 95, rx: 26, ry: 42, fill: '#ff6f91', stroke: '#e04a72', 'stroke-width': 2, transform: `rotate(${a} 150 112)` }))),
    g('etamines', ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = (a * Math.PI) / 180, x = 150 + Math.cos(r) * 22, y = 112 + Math.sin(r) * 22; return sv('g', {}, sv('line', { x1: 150, y1: 112, x2: x, y2: y, stroke: '#f3e27a', 'stroke-width': 3 }), sv('circle', { cx: x, cy: y, r: 5, fill: '#f5b800' })); })),
    g('pistil', sv('rect', { x: 144, y: 96, width: 12, height: 24, rx: 6, fill: '#8bd36e' }), sv('circle', { cx: 150, cy: 96, r: 8, fill: '#5fae46' })));
  return s;
}
function coupe(body, talk) {
  const info = h('div', { class: 'jb-info' }, 'Touche une partie de la fleur.');
  let mode = 'voir', want = null, order = [], score = 0;
  const svg = flowerSvg((id, e) => {
    const P = PARTS.find((p) => p[0] === id);
    svg.querySelectorAll('.jb-part').forEach((x) => x.classList.toggle('on', x === e));
    if (mode === 'voir') { info.replaceChildren(h('b', null, P[1] + ' : '), P[2]); talk(`${P[1]} : ${P[2]}`); Sfx.tap(); return; }
    if (id === want) { score++; Sfx.ok(); e.classList.add('ok'); next(); } else { Sfx.ko(); talk(`Non, ça, ce sont ${P[1].toLowerCase()}. Cherche encore : ${PARTS.find((p) => p[0] === want)[1].toLowerCase()}.`, false); info.textContent = `Ça, c’est : ${P[1].toLowerCase()}. Cherche : ${PARTS.find((p) => p[0] === want)[1].toLowerCase()}.`; }
  });
  const next = () => {
    if (!order.length) { mode = 'voir'; star(2); Sfx.win(); burst(body); log('jardin', 1); info.textContent = `Bravo ! Tu as retrouvé les ${PARTS.length} parties de la plante.`; talk('Bravo ! Tu connais toutes les parties de la plante !'); return; }
    want = order.shift(); const P = PARTS.find((p) => p[0] === want); info.replaceChildren('🎯 Touche : ', h('b', null, P[1].toLowerCase())); talk('Touche : ' + P[1].toLowerCase(), false);
  };
  const quiz = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'jb-quiz', onclick: () => { mode = 'quiz'; score = 0; order = shuffle(PARTS.map((p) => p[0])); svg.querySelectorAll('.jb-part').forEach((x) => x.classList.remove('on', 'ok')); next(); } }, '🎯 Reconstituer la fleur');
  body.replaceChildren(h('p', { class: 'muted' }, '🌺 La fleur s’ouvre devant toi ! Touche chaque partie pour découvrir son rôle, puis relève le défi.'), h('div', { class: 'jb-coupe' }, h('div', { class: 'jb-bloom' }, svg), h('div', null, info, h('ul', { class: 'jb-legend' }, ...PARTS.map((p) => h('li', null, p[1]))), quiz)));
  talk('La fleur s’ouvre devant toi ! Touche chaque partie pour découvrir son rôle.');
}

// ---------- le défi des abeilles ----------
function abeille(body, talk) {
  let round = 0, carry = null;
  const field = h('div', { class: 'jb-field' }), bee = h('img', { class: 'jb-bee', src: IMG.abeille, alt: '' });
  const info = h('p', { class: 'prompt' });
  const setup = () => {
    const kinds = shuffle(['coquelicot', 'boutondor', 'violette', 'paquerette', 'trefle']).slice(0, 3), cells = shuffle([...kinds, ...kinds]);
    carry = null; bee.classList.remove('pollen');
    field.replaceChildren(bee, ...cells.map((k, i) => { const b = h('button', { class: 'jb-flower', type: 'button', 'data-k': k, 'data-testid': 'jb-flower', style: `left:${8 + (i % 3) * 32}%;top:${i < 3 ? 12 : 56}%` }, img(k)); b.onclick = () => tapF(b, k); return b; }));
    bee.style.left = '44%'; bee.style.top = '38%';
    info.textContent = `Manche ${round + 1}/3 : choisis une fleur pour que l’abeille y récolte du pollen.`;
  };
  const fly = (b) => { bee.style.left = `calc(${b.style.left} + 4%)`; bee.style.top = `calc(${b.style.top} - 6%)`; };
  const tapF = (b, k) => {
    fly(b);
    if (!carry) { if (b.classList.contains('done')) return; carry = { k, b }; b.classList.add('from'); bee.classList.add('pollen'); Sfx.bloop(); info.textContent = `L’abeille a du pollen de ${byK[k].n.toLowerCase()} sur ses pattes. Emmène-le vers une fleur de la même espèce !`; talk(info.textContent, false); return; }
    if (b === carry.b) return;
    if (k === carry.k) {
      Sfx.ok(); b.classList.add('done'); carry.b.classList.add('done'); carry.b.classList.remove('from'); bee.classList.remove('pollen'); carry = null; round++;
      talk('Bravo ! Le pollen est arrivé sur une fleur de la même espèce : c’est la pollinisation. Cette fleur pourra maintenant donner des graines !');
      if (round >= 3) { star(2); Sfx.win(); burst(body); log('jardin', 1); info.textContent = '🐝 Super ! Tu as aidé l’abeille trois fois. Sans les abeilles, beaucoup de fleurs ne pourraient pas faire de graines ni de fruits.'; field.querySelectorAll('.jb-flower').forEach((x) => { x.disabled = true; }); }
      else setTimeout(setup, 1800);
    } else { Sfx.ko(); info.textContent = 'Oups ! Ce n’est pas la même fleur. Le pollen doit aller sur une fleur de la même espèce.'; talk(info.textContent, false); }
  };
  body.replaceChildren(h('p', { class: 'muted' }, '🐝 L’abeille boit le nectar des fleurs. Sans le savoir, elle transporte du pollen d’une fleur à l’autre : c’est la pollinisation !'), info, field);
  setup(); talk('Aide l’abeille ! Choisis une fleur où récolter du pollen, puis emmène-le vers une fleur de la même espèce.');
}

// ---------- l'herbier ----------
function herbier(body, talk) {
  const H = J().herbier;
  body.replaceChildren(h('div', { class: 'jb-herbier' }, h('div', { class: 'jb-hhead' }, h('h3', null, '📗 Mon herbier enchanté'), h('div', { class: 'jb-bar' }, h('i', { style: `width:${(count() / 6) * 100}%` })), h('b', null, `${count()}/6 fleurs observées`)),
    h('div', { class: 'jb-hgrid' }, ...FL.map((f) => h('div', { class: 'jb-hcard' + (H[f.k] ? ' got' : '') }, H[f.k] ? img(f.k) : h('span', { class: 'jb-lock' }, '🔒'), h('b', null, f.n), h('small', null, H[f.k] ? 'Découverte ✅' : 'À découvrir'))))),
  h('p', { class: 'muted' }, '🌿 Dans ce jeu, Maissa collectionne les fleurs en les observant : dans la vraie nature, on photographie ou on dessine, sans arracher les fleurs sauvages.'));
  talk(count() === 6 ? 'Ton herbier est complet ! Tu es une vraie exploratrice botanique.' : `Ton herbier contient ${count()} fleur${count() > 1 ? 's' : ''} sur 6.`);
}

// ---------- mission : sauver le jardin ----------
function mission(body, talk) {
  let step = 0;
  const pic = h('div', { class: 'jb-garden' }, h('img', { src: IMG.jardin, alt: 'Le jardin botanique' }));
  const host = h('div'), bar = h('div', { class: 'jb-steps' });
  const color = () => { pic.style.setProperty('--g', String(1 - step / 5)); bar.replaceChildren(...[1, 2, 3, 4, 5].map((n) => h('span', { class: n <= step ? 'on' : '' }, n <= step ? '🌸' : '⚪'))); };
  const nextStep = () => { step++; color(); Sfx.win(); if (step >= 5) return finish(); setTimeout(run, 700); };
  const run = () => {
    host.replaceChildren();
    if (step === 0) {
      const asks = shuffle([['rouge', 'coquelicot'], ['violette', 'violette'], ['blanche et jaune', 'paquerette'], ['blanche en forme de pompon', 'trefle']]).slice(0, 3); let i = 0;
      const ask = () => {
        if (i >= asks.length) return nextStep();
        const [c, k] = asks[i];
        host.replaceChildren(h('p', { class: 'prompt' }, `1. Retrouve la fleur ${c} (${i + 1}/3)`), h('div', { class: 'jb-pick' }, ...shuffle(FL.map((f) => f.k)).map((kk) => h('button', { class: 'jb-card mini', type: 'button', 'data-k': kk === k ? 0 : 1, onclick: (e) => { if (kk === k) { Sfx.ok(); i++; ask(); } else { Sfx.ko(); e.currentTarget.classList.add('no'); talk('Ce n’est pas celle-là. Regarde bien la couleur.', false); } } }, img(kk), h('small', null, byK[kk].n)))));
        talk(`Retrouve la fleur ${c}.`, false);
      };
      ask();
    } else if (step === 1) qcm(host, talk, [{ q: '2. Quelle partie de la plante puise l’eau dans le sol ?', opts: ['Les racines', 'Les pétales', 'Les étamines'], why: 'Les racines puisent l’eau et les sels minéraux.' }, { q: 'Et quelle partie transporte l’eau jusqu’aux fleurs ?', opts: ['La tige', 'Le pistil', 'Les sépales'], why: 'La tige soutient la plante et transporte l’eau.' }], nextStep);
    else if (step === 2) qcm(host, talk, [{ q: '3. De quoi une plante a-t-elle besoin pour bien grandir ?', opts: ['De lumière, d’eau, d’air et d’un sol nourrissant', 'De rester dans le noir', 'Uniquement de sucre'], why: 'Lumière, eau, air et sels minéraux du sol : voilà ce qu’il faut à une plante.' }], nextStep);
    else if (step === 3) qcm(host, talk, [{ q: '4. Que transporte l’abeille d’une fleur à l’autre ?', opts: ['Du pollen', 'Du sable', 'Des graines de pissenlit'], why: 'En butinant, l’abeille transporte le pollen : c’est la pollinisation.' }], nextStep);
    else if (step === 4) {
      const ORD = ['⛏️ Creuser un petit trou', '🌰 Déposer la graine', '🟫 Recouvrir de terre', '💧 Arroser doucement'], got = [];
      const list = h('ol', { class: 'jb-order' }), pool = h('div', { class: 'vi-pool' });
      const draw = () => list.replaceChildren(...ORD.map((_, i) => h('li', { class: got[i] ? 'full' : '' }, got[i] || '…')));
      pool.replaceChildren(...shuffle(ORD).map((o) => h('button', { class: 'vi-chip', type: 'button', 'data-testid': 'jb-plant', onclick: (e) => { if (o === ORD[got.length]) { got.push(o); e.currentTarget.disabled = true; Sfx.bloop(); draw(); if (got.length === ORD.length) nextStep(); } else { Sfx.ko(); talk('Pas encore ! Que fait-on d’abord ?', false); } } }, o)));
      host.replaceChildren(h('p', { class: 'prompt' }, '5. Plante une nouvelle fleur : remets les étapes dans l’ordre.'), list, pool); draw();
    }
  };
  const finish = () => {
    const j = J(); const first = !j.done; j.done = true; S.save(); if (first) star(3); burst(body); burst(body); log('jardin', 1);
    host.replaceChildren(h('div', { class: 'jb-win' }, h('h3', null, '🌈 Le jardin a retrouvé ses couleurs !'), h('p', null, 'Les papillons reviennent, les abeilles butinent… Tu es la gardienne du Jardin Botanique de Maissa Academy ! 🌷'), first ? h('p', { class: 'muted' }, '🏅 Nouveau badge : Gardienne du jardin') : null));
    talk('Papa ! Tu as vu ? J’ai redonné toutes ses couleurs à notre forêt !', false); voice('assets/voice/jardin_fin.mp3');
  };
  body.replaceChildren(h('p', { class: 'muted' }, '🥀 Une partie de la forêt a perdu ses couleurs ! Réussis les 5 épreuves pour sauver le Jardin des Fleurs.'), pic, bar, host);
  color(); run(); talk('Une partie de la forêt a perdu ses couleurs ! Réussis les cinq épreuves pour sauver le jardin.');
}

let greeted = false;
export function open(tab = 'fleurs') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['fleurs', '🌼 Les 6 fleurs', fleurs], ['coupe', '🌺 La fleur en détail', coupe], ['abeille', '🐝 Le défi des abeilles', abeille], ['herbier', '📗 Mon herbier', herbier], ['mission', '🌈 Sauver le jardin', mission]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'jb-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel jb-panel' }, UI.closeButton(), h('h2', null, '🌷 La quête du Jardin Botanique Enchanté'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Jardin botanique', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
  if (!greeted) { greeted = true; voice('assets/voice/jardin_intro.mp3'); }
}
