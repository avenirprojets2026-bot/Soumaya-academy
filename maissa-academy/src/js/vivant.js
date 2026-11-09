// La Forêt des Mystères Vivants (sciences, évaluation P4 doc 7) : régimes alimentaires, chaînes alimentaires
// (proie, prédateur, maillon), documentaire sur un animal nocturne, animaux de jour / de nuit, voyage de l'eau
// (états de l'eau et cycle : évaporation, condensation, précipitations, ruissellement).
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

// ---------- les animaux ----------
const AN = {
  lapin: { ic: '🐇', n: 'le lapin', r: 'herbivore', eats: ['🌿 herbe', '🥕 carotte', '🍃 feuilles'], nuit: false },
  renard: { ic: '🦊', n: 'le renard', r: 'omnivore', eats: ['🐭 souris', '🫐 baies', '🐛 insectes'], nuit: true },
  chouette: { ic: '🦉', n: 'la chouette', r: 'carnivore', eats: ['🐭 souris', '🐸 grenouille', '🐦 petits oiseaux'], nuit: true },
  herisson: { ic: '🦔', n: 'le hérisson', r: 'carnivore', eats: ['🐌 escargots', '🐛 vers de terre', '🪲 insectes'], nuit: true },
  ecureuil: { ic: '🐿️', n: 'l’écureuil', r: 'omnivore', eats: ['🌰 noisettes', '🍄 champignons', '🥚 œufs'], nuit: false },
  chevreuil: { ic: '🦌', n: 'le chevreuil', r: 'herbivore', eats: ['🍃 feuilles', '🌿 herbe', '🌱 jeunes pousses'], nuit: false, amb: true },
  chauvesouris: { ic: '🦇', n: 'la chauve-souris', r: 'carnivore', eats: ['🦟 moustiques', '🦋 papillons de nuit', '🪲 insectes'], nuit: true },
  sanglier: { ic: '🐗', n: 'le sanglier', r: 'omnivore', eats: ['🌰 glands', '🐛 vers', '🌾 racines'], nuit: true },
  papillon: { ic: '🦋', n: 'le papillon', r: 'herbivore', eats: ['🌸 nectar des fleurs'], nuit: false },
  grenouille: { ic: '🐸', n: 'la grenouille', r: 'carnivore', eats: ['🦟 moustiques', '🪰 mouches', '🐛 larves'], nuit: false, amb: true },
  abeille: { ic: '🐝', n: 'l’abeille', r: 'herbivore', eats: ['🌸 nectar', '🌼 pollen'], nuit: false },
};
const REG = { herbivore: 'herbivore : il ne mange que des végétaux (plantes)', carnivore: 'carnivore : il mange d’autres animaux', omnivore: 'omnivore : il mange des végétaux ET des animaux' };
function regimes(body, talk) {
  let round = 0, ok = 0; const N = 6, order = shuffle(Object.keys(AN));
  const head = h('p', { class: 'prompt' }), card = h('div', { class: 'vi-card' }), act = h('div', { class: 'answers' });
  body.replaceChildren(h('div', { class: 'vi-legend' }, ...Object.entries(REG).map(([k, d]) => h('span', null, h('b', null, k), d.slice(k.length)))), head, card, act);
  function setup() {
    if (round >= N) { head.textContent = `Bravo ! ${ok}/${N} régimes trouvés.`; talk(head.textContent); card.replaceChildren(); act.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => regimes(body, talk) }, '↻ Recommencer')); if (ok >= 5) { Sfx.win(); burst(body); } return; }
    const k = order[round % order.length], a = AN[k];
    card.replaceChildren(h('span', { class: 'vi-big' }, a.ic), h('b', null, a.n[0].toUpperCase() + a.n.slice(1)), h('div', { class: 'vi-eats' }, h('small', null, 'Il mange :'), ...a.eats.map((e) => h('span', null, e))));
    head.textContent = `Quel est le régime alimentaire de ${a.n} ? (${round + 1}/${N})`; talk(`${a.n} mange : ${a.eats.map((e) => e.split(' ').slice(1).join(' ')).join(', ')}. Quel est son régime alimentaire ?`);
    act.replaceChildren(...['herbivore', 'carnivore', 'omnivore'].map((r) => h('button', { class: 'choice', type: 'button', 'data-k': r === a.r ? 0 : 1, onclick: () => { if (r === a.r) { ok++; star(); Sfx.win(); talk(`Oui ! ${a.n[0].toUpperCase() + a.n.slice(1)} est ${REG[a.r]}.`, false); } else { Sfx.tap(); talk(`Non : ${a.n} est ${REG[a.r]}.`, false); } round++; setTimeout(setup, 2600); } }, r)));
  }
  setup();
}

// ---------- chaînes alimentaires ----------
const CHAINS = [
  [['🌿', 'l’herbe'], ['🐇', 'le lapin'], ['🦊', 'le renard']],
  [['🍃', 'la feuille'], ['🐛', 'la chenille'], ['🐦', 'la mésange'], ['🦉', 'la chouette']],
  [['🌱', 'l’algue'], ['🐟', 'le petit poisson'], ['🐠', 'le brochet'], ['🪶', 'le héron']],
  [['🌾', 'le grain de blé'], ['🐭', 'la souris'], ['🐍', 'le serpent'], ['🦅', 'l’aigle']],
  [['🍂', 'la feuille morte'], ['🐌', 'l’escargot'], ['🦔', 'le hérisson'], ['🦊', 'le renard']],
];
function chaine(body, talk) {
  let ci = 0, ok = 0;
  const run = () => {
    if (ci >= 3) return quiz();
    const ch = CHAINS[(ci + ri(0, 4)) % CHAINS.length], got = [];
    const slots = h('div', { class: 'vi-chain' }), pool = h('div', { class: 'vi-pool' });
    const draw = () => slots.replaceChildren(...ch.map((_, i) => [i ? h('span', { class: 'vi-arrow' }, '➜') : null, h('div', { class: 'vi-slot' + (got[i] ? ' full' : '') }, got[i] ? h('span', null, got[i][0], h('small', null, got[i][1])) : '?')]).flat().filter(Boolean));
    pool.replaceChildren(...shuffle(ch).map((x) => h('button', { class: 'vi-chip', type: 'button', 'data-testid': 'vi-chip', onclick: (e) => {
      if (x === ch[got.length]) { got.push(x); e.currentTarget.disabled = true; Sfx.bloop(); draw(); if (got.length === ch.length) { ok++; star(); Sfx.win(); burst(body); talk(`Bravo ! ${ch.map((c) => c[1]).join(', puis ')}. ${ch[0][1][0].toUpperCase() + ch[0][1].slice(1)} est une plante : chaque chaîne commence par un végétal.`); ci++; setTimeout(run, 3800); } }
      else { Sfx.tap(); talk(got.length ? `Non : qui mange ${got[got.length - 1][1]} ?` : 'Une chaîne alimentaire commence toujours par un végétal (une plante).', false); }
    } }, x[0], h('small', null, x[1]))));
    body.replaceChildren(h('p', { class: 'prompt' }, `Construis la chaîne alimentaire (${ci + 1}/3) : touche les êtres vivants dans l’ordre. La flèche veut dire « est mangé par ».`), slots, pool);
    talk('Construis la chaîne alimentaire. Commence par celui qui est mangé en premier, la plante.');
    draw();
  };
  const quiz = () => {
    const host = h('div'); body.replaceChildren(h('p', { class: 'prompt' }, `${ok} chaînes construites ! Maintenant, le vocabulaire :`), host);
    qcm(host, talk, shuffle([
      { q: 'Dans « herbe ➜ lapin ➜ renard », qui est la PROIE du renard ?', opts: ['le lapin', 'l’herbe', 'le renard'], why: 'La proie, c’est l’animal qui est mangé : le lapin est la proie du renard.' },
      { q: 'Dans « feuille ➜ chenille ➜ mésange ➜ chouette », qui est le PRÉDATEUR de la mésange ?', opts: ['la chouette', 'la chenille', 'la feuille'], why: 'Le prédateur chasse et mange la proie : la chouette mange la mésange.' },
      { q: 'Chaque élément d’une chaîne alimentaire s’appelle…', opts: ['un maillon', 'un nœud', 'une marche'], why: 'Comme une vraie chaîne, chaque élément est un maillon.' },
      { q: 'Par quoi commence toujours une chaîne alimentaire ?', opts: ['par un végétal', 'par un carnivore', 'par le plus gros animal'], why: 'Les plantes fabriquent leur nourriture avec la lumière du soleil : elles sont le premier maillon.' },
      { q: 'Que veut dire la flèche ➜ dans une chaîne alimentaire ?', opts: ['« est mangé par »', '« mange »', '« habite avec »'], why: 'herbe ➜ lapin : l’herbe est mangée par le lapin.' },
      { q: 'Le lapin est la proie du renard, mais pour l’herbe, le lapin est…', opts: ['un consommateur qui la mange', 'une proie', 'une plante'], why: 'Un même animal peut être proie (pour le renard) et mangeur (de l’herbe).' },
    ]).slice(0, 4), () => host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => chaine(body, talk) }, '↻ Recommencer'))));
  };
  run();
}

// ---------- documentaire : un animal de la nuit ----------
const DOCS = [
  { t: 'La chouette effraie, une chasseuse silencieuse', txt: 'La chouette effraie vit dans les granges, les clochers et les vieux arbres. Le jour, elle dort cachée. La nuit, elle part chasser. Ses plumes très douces lui permettent de voler sans faire de bruit. Grâce à son ouïe extraordinaire, elle entend une souris courir sous les feuilles. Elle mange surtout des souris et des mulots, mais aussi des musaraignes et parfois de petits oiseaux. Elle avale ses proies en entier, puis recrache des petites boules de poils et d’os : les pelotes de réjection.', eats: ['souris', 'mulots', 'musaraignes', 'petits oiseaux'], no: ['graines', 'fruits', 'herbe', 'nectar'], r: 'carnivore', who: 'la chouette effraie' },
  { t: 'Le hérisson, le jardinier de la nuit', txt: 'Le hérisson est couvert de piquants. Quand il a peur, il se roule en boule. Le jour, il dort sous un tas de feuilles ou de bois. Le soir, il se réveille et part chercher sa nourriture en reniflant le sol. Il dévore des limaces, des escargots, des vers de terre et des insectes : il aide les jardiniers ! En hiver, quand il fait froid et qu’il y a peu de nourriture, il hiberne : il dort pendant des mois.', eats: ['limaces', 'escargots', 'vers de terre', 'insectes'], no: ['carottes', 'herbe', 'noisettes', 'fleurs'], r: 'carnivore', who: 'le hérisson' },
];
function documentaire(body, talk) {
  const D = pick(DOCS); const chosen = new Set();
  const opts = shuffle([...D.eats.slice(0, 3), ...D.no.slice(0, 3)]);
  const doc = h('div', { class: 'vi-doc' }, h('h3', null, D.t), h('p', null, D.txt));
  const step2 = h('div');
  const chips = opts.map((o) => h('button', { class: 'vi-chip', type: 'button', 'data-testid': 'vi-food', onclick: (e) => { chosen.has(o) ? chosen.delete(o) : chosen.add(o); e.currentTarget.classList.toggle('on', chosen.has(o)); Sfx.tap(); } }, o));
  body.replaceChildren(h('div', { class: 'actions wrap' }, h('button', { class: 'btn small', type: 'button', onclick: () => Voice.speak(`${D.t}. ${D.txt}`) }, '🔊 Écouter le texte')), doc,
    h('p', { class: 'prompt' }, 'Relève dans le texte TROIS aliments que mange cet animal.'), h('div', { class: 'vi-pool' }, ...chips),
    h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'vi-check', onclick: () => {
      const good = [...chosen].filter((x) => D.eats.includes(x)).length, bad = [...chosen].filter((x) => !D.eats.includes(x)).length;
      if (good === 3 && !bad) { star(2); Sfx.win(); talk('Bravo, les trois aliments sont dans le texte !', false); questions(); }
      else talk(bad ? 'Attention : un des aliments choisis n’est pas dans le texte. Relis bien !' : `Il en faut trois : tu en as ${good}.`, false);
    } }, '✓ Vérifier')), step2);
  talk('Lis le documentaire, puis relève trois aliments que mange cet animal.');
  function questions() {
    step2.replaceChildren();
    qcm(step2, talk, [
      { q: `Quel est le régime alimentaire de ${D.who} ?`, opts: [D.r, 'herbivore', 'omnivore'].filter((x, i, a) => a.indexOf(x) === i), why: `Il mange des animaux : ${D.who} est ${D.r}.` },
      { q: `Pourquoi dit-on que ${D.who} est un animal nocturne ?`, opts: ['Parce qu’il est actif la nuit et dort le jour', 'Parce qu’il est noir', 'Parce qu’il vit dans une grotte'], why: 'Nocturne = actif la nuit. Le contraire : diurne (actif le jour).' },
      { q: 'Quelle est l’intention de ce texte ?', opts: ['Informer, apprendre des choses', 'Raconter une histoire inventée', 'Donner une recette'], why: 'C’est un texte documentaire : il informe.' },
    ], () => step2.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => documentaire(body, talk) }, '↻ Un autre documentaire'))));
  }
}

// ---------- jour ou nuit ----------
function nuit(body, talk) {
  const pool = shuffle(Object.keys(AN).filter((k) => !AN[k].amb)).slice(0, 8); let i = 0, ok = 0;
  const card = h('div', { class: 'vi-card' });
  const bins = [['jour', '☀️ Diurne (actif le jour)'], ['nuit', '🌙 Nocturne (actif la nuit)']].map(([k, l]) => h('button', { class: 'th-bin', type: 'button', 'data-testid': 'vi-bin', onclick: () => {
    const a = AN[pool[i]]; if (!a) return; const good = (k === 'nuit') === a.nuit;
    if (good) { ok++; star(); Sfx.coin(); talk(`Oui, ${a.n} est ${a.nuit ? 'nocturne' : 'diurne'}.`, false); } else { Sfx.tap(); talk(`Non, ${a.n} est ${a.nuit ? 'nocturne : il est surtout actif la nuit' : 'diurne : il est actif le jour'}.`, false); }
    i++; setTimeout(show, 1600);
  } }, l));
  const show = () => { if (i >= pool.length) { card.replaceChildren(h('b', null, `${ok}/${pool.length} bien classés !`)); if (ok >= 6) { Sfx.win(); burst(body); } return; } const a = AN[pool[i]]; card.replaceChildren(h('span', { class: 'vi-big' }, a.ic), h('b', null, a.n)); };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Ces animaux sont-ils actifs le jour (diurnes) ou la nuit (nocturnes) ?'), card, h('div', { class: 'th-bins' }, ...bins));
  talk('Range les animaux : actifs le jour ou actifs la nuit ?');
  show();
}

// ---------- le voyage de l'eau ----------
function eau(body, talk) {
  const tabs = h('div', { class: 'actions wrap' }), zone = h('div');
  body.replaceChildren(tabs, zone);
  const go = (k) => { [...tabs.children].forEach((b) => b.classList.toggle('primary', b.dataset.k === k)); (k === 'etats' ? etats : cycle)(); };
  tabs.append(...[['etats', '🧊 Les états de l’eau'], ['cycle', '🔄 Le cycle de l’eau']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-k': k, 'data-testid': 'vi-e-' + k, onclick: () => go(k) }, l)));
  function etats() {
    const svg = sv('svg', { viewBox: '0 0 300 220', class: 'vi-pot' });
    const water = sv('g'); svg.append(sv('rect', { x: 90, y: 90, width: 120, height: 100, rx: 10, fill: '#ffffff18', stroke: '#e8f6ff', 'stroke-width': 3 }), water);
    const therm = h('div', { class: 'ws-big' }), lab = h('p', { class: 'prompt' });
    const knob = h('input', { type: 'range', min: -20, max: 110, value: -10, class: 'mi-knob', 'data-testid': 'vi-temp', oninput: (e) => draw(+e.target.value) });
    let last = null;
    function draw(t) {
      const st = t <= 0 ? 'solide' : t < 100 ? 'liquide' : 'gaz';
      therm.textContent = `🌡️ ${t} °C`;
      water.replaceChildren();
      if (st === 'solide') for (let i = 0; i < 6; i++) water.append(sv('rect', { x: 100 + (i % 3) * 36, y: 120 + Math.floor(i / 3) * 34, width: 30, height: 30, rx: 4, fill: '#cfefff', stroke: '#fff', 'stroke-width': 2 }));
      if (st === 'liquide') water.append(sv('rect', { x: 92, y: 120, width: 116, height: 68, rx: 8, fill: '#3fa9ff' }));
      if (st === 'gaz') { water.append(sv('rect', { x: 92, y: 165, width: 116, height: 23, rx: 6, fill: '#3fa9ff' })); for (let i = 0; i < 8; i++) water.append(sv('circle', { cx: 110 + (i * 37) % 90, cy: 40 + (i * 23) % 60, r: 9, fill: '#ffffff55', class: 'vi-steam' })); }
      lab.textContent = st === 'solide' ? 'L’eau est SOLIDE : c’est de la glace (à 0 °C ou moins).' : st === 'liquide' ? 'L’eau est LIQUIDE (entre 0 °C et 100 °C).' : 'L’eau BOUT et devient GAZ : de la vapeur d’eau (100 °C).';
      if (last && last !== st) { const m = { 'solide>liquide': 'la fusion : la glace fond', 'liquide>solide': 'la solidification : l’eau gèle', 'liquide>gaz': 'l’ébullition (vaporisation) : l’eau devient vapeur', 'gaz>liquide': 'la condensation : la vapeur redevient liquide' }[`${last}>${st}`]; if (m) { talk(`C’est ${m} !`, true); Sfx.bloop(); } }
      last = st;
    }
    zone.replaceChildren(h('p', { class: 'muted' }, 'Fais monter ou descendre la température avec le curseur, et observe l’eau changer d’état.'), h('div', { class: 'mi-lab' }, svg, h('div', { class: 'mi-side' }, therm, knob, lab)));
    draw(-10);
  }
  function cycle() {
    const STEPS = [['☀️', 'Le soleil chauffe l’eau de l’étang et de la mer.', 'evap', 'L’ÉVAPORATION : l’eau devient vapeur et monte dans l’air.'], ['☁️', 'En altitude, il fait froid : la vapeur se refroidit.', 'cond', 'La CONDENSATION : la vapeur forme de minuscules gouttes, les nuages.'], ['🌧️', 'Les gouttes grossissent et deviennent lourdes.', 'prec', 'Les PRÉCIPITATIONS : il pleut (ou il neige).'], ['🏞️', 'L’eau de pluie coule sur le sol vers les ruisseaux et les rivières.', 'ruis', 'Le RUISSELLEMENT : l’eau retourne vers l’étang, la rivière et la mer.']];
    let i = 0;
    const svg = sv('svg', { viewBox: '0 0 400 240', class: 'vi-cycle' });
    svg.append(sv('rect', { width: 400, height: 240, fill: '#bfe6ff' }), sv('path', { d: 'M0,190 Q80,170 160,185 L260,200 L400,170 L400,240 L0,240 Z', fill: '#5aa86a' }), sv('ellipse', { cx: 300, cy: 212, rx: 90, ry: 18, fill: '#3fa9ff' }), sv('path', { d: 'M40,190 L90,120 L140,190 Z', fill: '#8a9aa8' }));
    const layer = sv('g'); svg.append(layer);
    const txt = h('p', { class: 'prompt' }), btn = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'vi-next' }, '▶ Étape suivante');
    const show = () => {
      layer.replaceChildren();
      if (i >= 1) layer.append(sv('circle', { cx: 340, cy: 40, r: 26, fill: '#ffd84a' }));
      if (i >= 1) for (let k = 0; k < 4; k++) layer.append(sv('path', { d: `M${270 + k * 18},195 q6,-20 0,-40 q-6,-20 0,-40`, stroke: '#ffffffaa', 'stroke-width': 3, fill: 'none', class: 'vi-steam' }));
      if (i >= 2) layer.append(sv('ellipse', { cx: 190, cy: 50, rx: 70, ry: 24, fill: '#fff' }), sv('ellipse', { cx: 150, cy: 60, rx: 40, ry: 20, fill: '#fff' }));
      if (i >= 3) for (let k = 0; k < 10; k++) layer.append(sv('line', { x1: 140 + k * 12, y1: 80 + (k % 3) * 10, x2: 136 + k * 12, y2: 96 + (k % 3) * 10, stroke: '#3a7ad8', 'stroke-width': 3, class: 'vi-rain' }));
      if (i >= 4) layer.append(sv('path', { d: 'M150,192 Q200,200 230,206', stroke: '#3a7ad8', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }));
      if (i === 0) { txt.textContent = 'Observe le voyage de l’eau, étape par étape.'; btn.textContent = '▶ Commencer'; }
      else { const s = STEPS[i - 1]; txt.textContent = `${s[0]} ${s[1]} → ${s[3]}`; talk(`${s[1]} ${s[3]}`); btn.textContent = i < 4 ? '▶ Étape suivante' : '🎯 Le défi'; }
    };
    btn.onclick = () => { if (i < 4) { i++; show(); } else defi(); };
    zone.replaceChildren(txt, h('div', { class: 'dr-wrap' }, svg), h('div', { class: 'actions' }, btn));
    show();
    const defi = () => { const host = h('div'); zone.replaceChildren(host); qcm(host, talk, shuffle([
      { q: 'Quand le soleil chauffe l’eau de l’étang, elle devient vapeur. Comment s’appelle ce phénomène ?', opts: ['l’évaporation', 'la condensation', 'le ruissellement'], why: 'Évaporation : l’eau liquide devient vapeur.' },
      { q: 'Les nuages se forment grâce à…', opts: ['la condensation', 'l’évaporation', 'la fusion'], why: 'La vapeur refroidit et se condense en minuscules gouttes.' },
      { q: 'Le matin, des gouttes d’eau apparaissent sur la vitre froide de la voiture. C’est…', opts: ['la condensation', 'l’évaporation', 'la solidification'], why: 'La vapeur de l’air touche la vitre froide et redevient liquide.' },
      { q: 'À quelle température l’eau gèle-t-elle ?', opts: ['0 °C', '100 °C', '37 °C'], why: 'L’eau gèle à 0 °C et bout à 100 °C.' },
      { q: 'La pluie et la neige, ce sont des…', opts: ['précipitations', 'évaporations', 'condensations'], why: 'Tout ce qui tombe du ciel : les précipitations.' },
    ]).slice(0, 4), () => host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: cycle }, '↻ Revoir le cycle')))); };
  }
  go('etats');
}

export function open(tab = 'regimes') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['regimes', '🥕 Les régimes alimentaires', regimes], ['chaine', '🔗 Les chaînes alimentaires', chaine], ['doc', '📖 Le documentaire', documentaire], ['nuit', '🌙 Jour ou nuit ?', nuit], ['eau', '💧 Le voyage de l’eau', eau]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'vi-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel vi-panel' }, UI.closeButton(), h('h2', null, '🌿 La Forêt des Mystères Vivants'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Forêt vivante', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
