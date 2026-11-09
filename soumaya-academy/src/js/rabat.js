// Le monde de l'école El Hikma (« La Sagesse »), installée au Maroc : derrière le gros cadenas du Bouclier numérique.
// Bellarej, la cigogne de Chellah, guide Soumaya dans 4 lieux : l'atelier du zellige (symétrie, formes),
// le souk des nombres (dirhams, monnaie), la Kasbah des Oudayas (énigmes de français) et le stade (penalties avec Zakaria).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { asset } from './asset.js';
import { burst, shuffle } from './workshop.js';

const NAME = () => S.get().name || 'Soumaya';
const RB = () => { const b = S.get(); b.rabat = b.rabat || {}; return b.rabat; };
const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const done = (k, score) => { const r = RB(); r[k] = Math.max(r[k] || 0, score || 1); S.save(); };
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

// voix enregistrées de Bellarej la cigogne (repli : voix de l'appareil)
let cgEl = null;
export function cigogne(id, txt, talk) {
  // voix enregistrée de Bellarej (Luna) ; la question qui suit attend la fin de sa phrase
  if (talk) talk('🪶 ' + txt, false);
  if (!Sfx.soundOn()) return;
  try { if (cgEl) Voice.fadeOutEl(cgEl); cgEl = Voice.playUrl(`assets/voice/rabat/${id}.ogg`); } catch (e) { /* sans son */ }
}
const CG = (k) => h('img', { class: 'rb-cg' + (k ? ' ' + k : ''), src: asset('assets/rabat/cigogne_' + (k === 'joie' ? 'joie' : 'salut') + '.webp'), alt: 'Bellarej la cigogne' });
const head = (img, title) => h('div', { class: 'rb-head' }, h('img', { src: asset(`assets/rabat/${img}.webp`), alt: '' }), h('b', null, title), CG());

// petite série de questions à choix (réponse juste = index 0, mélangée à l'affichage)
function serie(zone, talk, Q, onEnd, opts = {}) {
  let n = 0, ok = 0;
  const next = () => {
    if (n >= Q.length) { onEnd(ok, Q.length); return; }
    const [q, choices, why] = Q[n++];
    talk(q);
    zone.replaceChildren(h('p', { class: 'tb-q rb-q' }, q), h('div', { class: 'actions wrap rb-ch' }, ...shuffle(choices.map((c, k) => [c, k])).map(([c, k]) => h('button', { class: 'btn', type: 'button', 'data-testid': k === 0 ? 'rb-ok' : 'rb-ko', onclick: () => {
      zone.querySelectorAll('.rb-ch button').forEach((b) => { b.disabled = true; });
      const good = k === 0; if (good) { ok++; Sfx.ok(); } else Sfx.ko();
      if (opts.onAnswer) opts.onAnswer(good);
      zone.append(h('div', { class: 'ea-step' }, h('p', null, (good ? '✔ Bravo ! ' : '💡 ') + why), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'rb-next', onclick: next }, 'Suivant ▶')));
      talk((good ? 'Bravo ! ' : '') + why);
    } }, c))));
  };
  next();
}
const fin = (body, talk, k, ok, tot, msg) => {
  const s = ok >= Math.ceil(tot * 0.7) ? 2 : 1; star(s); done(k, ok);
  if (s === 2) { Sfx.win(); burst(body); Voice.say('bravo'); } else Voice.say('courage');
  talk(`${msg} ${ok}/${tot} !`);
};

// ---------------------------------------------------------------- 1. l'atelier du zellige
function zellige(body, talk) {
  const zone = h('div');
  // a) la symétrie : compléter la mosaïque en miroir (axe vertical)
  const N = 6, half = N / 2, model = Array.from({ length: N }, () => Array.from({ length: half }, () => Math.random() < 0.45));
  const COL = ['#1f5fbf', '#0f8a5f', '#d98b1a'];
  const col = Array.from({ length: N }, () => Array.from({ length: half }, () => COL[ri(0, 2)]));
  const mine = Array.from({ length: N }, () => Array(half).fill(false));
  const grid = h('div', { class: 'rb-grid' });
  const draw = () => {
    grid.replaceChildren(...Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
      if (c < half) return h('div', { class: 'rb-cell fixed' + (model[r][c] ? ' on' : ''), style: model[r][c] ? `--c:${col[r][c]}` : '' });
      const mc = N - 1 - c; // case miroir
      return h('button', { class: 'rb-cell' + (mine[r][mc] ? ' on' : ''), type: 'button', style: mine[r][mc] ? `--c:${col[r][mc]}` : '', 'data-testid': `rb-z-${r}-${c}`, onclick: () => { mine[r][mc] = !mine[r][mc]; Sfx.tap(); draw(); } });
    })).flat(), h('div', { class: 'rb-axis' }));
  };
  const check = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'rb-z-check', onclick: () => {
    const wrong = model.reduce((a, row, r) => a + row.filter((v, c) => v !== mine[r][c]).length, 0);
    if (!wrong) { Sfx.win(); star(1); talk('Parfait ! Ta mosaïque est symétrique, comme un vrai zellige !'); cigogne('cg_zellige_ok', 'Magnifique ! Les artisans de Fès seraient fiers de toi !'); setTimeout(partB, 1800); }
    else { Sfx.ko(); talk(`Presque : ${wrong} case${wrong > 1 ? 's' : ''} à corriger. Regarde bien le miroir au milieu !`); }
  } }, '✔ Vérifier ma symétrie');
  // b) formes, angles, fractions dans le zellige
  const Q = [
    ['Le zellige utilise souvent une étoile à 8 branches. Combien de côtés a un octogone ?', ['8', '6', '10'], 'Un octogone a 8 côtés (octo = 8).'],
    ['Un hexagone a combien de côtés ?', ['6', '5', '8'], 'Un hexagone a 6 côtés, comme les alvéoles des abeilles.'],
    ['Un carré de zellige est coupé en 4 parts égales. 1 part, c’est…', ['un quart', 'un demi', 'un tiers'], '1 part sur 4 = 1/4, un quart.'],
    ['Combien d’angles droits a un carré ?', ['4', '2', '0'], 'Un carré a 4 angles droits.'],
    ['Si on plie un carré en deux par le milieu, chaque moitié est…', ['un demi', 'un quart', 'un tiers'], 'Deux parts égales : chacune vaut 1/2.'],
    ['Un triangle a combien de sommets ?', ['3', '4', '2'], 'Un triangle a 3 côtés et 3 sommets.'],
  ];
  const partB = () => { zone.replaceChildren(); serie(zone, talk, shuffle(Q).slice(0, 5), (ok, t) => fin(body, talk, 'zellige', ok, t, 'Atelier du zellige terminé :')); };
  body.replaceChildren(head('zellige', '🎨 L’atelier du zellige'), h('p', { class: 'prompt' }, '🪞 Complète la mosaïque à droite pour qu’elle soit le reflet exact de la gauche (symétrie).'), h('div', { class: 'rb-mosaic' }, grid), h('div', { class: 'actions' }, check), zone);
  draw(); cigogne('cg_zellige', 'Bienvenue dans l’atelier du zellige ! Ici, chaque mosaïque est symétrique. Complète le côté droit comme dans un miroir.', talk);
}

// ---------------------------------------------------------------- 2. le souk des nombres
const ITEMS = [['🍊', 'un kilo d’oranges', 8], ['🫖', 'une théière', 45], ['🥿', 'des babouches', 60], ['🧆', 'des msemen', 6], ['🍵', 'un verre de thé à la menthe', 5], ['🏮', 'une lanterne', 35], ['🫒', 'des olives', 12], ['🧣', 'un foulard', 25], ['🍯', 'du miel', 30], ['🌶️', 'des épices', 15]];
const MONEY = [100, 50, 20, 10, 5, 2, 1];
function souk(body, talk) {
  const zone = h('div'); let round = 0, ok = 0; const R = 6;
  const next = () => {
    if (round >= R) { fin(body, talk, 'souk', ok, R, 'Souk terminé, tu as bien compté :'); zone.replaceChildren(h('p', { class: 'tb-res' }, `🛍️ ${ok}/${R} bons achats !`), h('button', { class: 'btn primary', type: 'button', onclick: () => souk(body, talk) }, '🔁 Rejouer')); return; }
    round++;
    if (round % 2) { // payer le prix exact avec les pièces et billets
      const a = shuffle(ITEMS)[0], b = shuffle(ITEMS.filter((x) => x !== a))[0], two = a[2] + b[2] <= 100 && Math.random() < 0.5, total = two ? a[2] + b[2] : a[2];
      let paid = 0; const paidEl = h('b', null, '0 dh'), purse = [];
      const upd = () => { paidEl.textContent = `${paid} dh`; };
      zone.replaceChildren(h('p', { class: 'tb-q rb-q' }, `${a[0]} ${a[1]} (${a[2]} dh)` + (two ? ` + ${b[0]} ${b[1]} (${b[2]} dh)` : '') + ' : paie le prix exact !'),
        h('p', null, 'Tu as donné : ', paidEl), h('div', { class: 'rb-money' }, ...MONEY.map((m) => h('button', { class: 'rb-coin' + (m >= 20 ? ' bill' : ''), type: 'button', 'data-testid': 'rb-m-' + m, onclick: () => { paid += m; purse.push(m); Sfx.coin(); upd(); } }, `${m} dh`))),
        h('div', { class: 'actions wrap' }, h('button', { class: 'btn', type: 'button', onclick: () => { if (purse.length) { paid -= purse.pop(); upd(); } } }, '↩ Reprendre'),
          h('button', { class: 'btn primary', type: 'button', 'data-testid': 'rb-pay', onclick: () => {
            if (paid === total) { ok++; Sfx.ok(); talk(`Bravo ! ${total} dirhams tout juste. Choukran, merci !`); setTimeout(next, 1500); }
            else { Sfx.ko(); talk(paid > total ? `Tu as donné ${paid} dh, c’est trop : il fallait ${total} dh.` : `Il manque ${total - paid} dh.`); if (paid > total) setTimeout(next, 2200); }
          } }, '💰 Payer')));
      talk(two ? `Combien coûtent ${a[1]} et ${b[1]} ensemble ? Paie le prix exact.` : `Paie ${a[1]} avec le prix exact.`);
    } else { // rendre la monnaie
      const a = shuffle(ITEMS)[0], give = a[2] < 20 ? 20 : a[2] < 50 ? 50 : 100, rest = give - a[2];
      const opts = shuffle([rest, rest + 10, Math.max(1, rest - 5), rest + 1].filter((v, i, t) => t.indexOf(v) === i)).slice(0, 3); if (!opts.includes(rest)) opts[0] = rest;
      talk(`${a[1]} coûte ${a[2]} dirhams. Tu donnes un billet de ${give} dirhams. Combien le marchand te rend-il ?`);
      zone.replaceChildren(h('p', { class: 'tb-q rb-q' }, `${a[0]} ${a[1]} coûte ${a[2]} dh. Tu donnes un billet de ${give} dh. Combien le marchand te rend-il ?`),
        h('div', { class: 'actions wrap rb-ch' }, ...shuffle(opts).map((v) => h('button', { class: 'btn', type: 'button', 'data-testid': v === rest ? 'rb-ok' : 'rb-ko', onclick: () => {
          zone.querySelectorAll('.rb-ch button').forEach((x) => { x.disabled = true; });
          if (v === rest) { ok++; Sfx.ok(); talk(`Oui ! ${give} − ${a[2]} = ${rest} dh.`); } else { Sfx.ko(); talk(`Non : ${give} − ${a[2]} = ${rest} dh. Astuce : compte de ${a[2]} jusqu’à ${give}.`); }
          setTimeout(next, 2000);
        } }, `${v} dh`))));
    }
  };
  body.replaceChildren(head('souk', '🛍️ Le souk des nombres'), h('p', { class: 'muted' }, '💡 Au Maroc, on paie en dirhams (dh). 1 dirham = 100 centimes.'), zone);
  cigogne('cg_souk', 'Bienvenue au souk ! Ici on paie en dirhams. Fais tes achats et compte bien ta monnaie !', talk);
  next();
}

// ---------------------------------------------------------------- 3. la Kasbah des Oudayas : 5 portes, 5 énigmes, un mot secret
const DOORS = [
  ['R', 'Quel est le pluriel de « un cheval » ?', ['des chevaux', 'des chevals', 'des chevaus'], 'Les mots en -al font souvent leur pluriel en -aux : des chevaux.'],
  ['A', 'Complète : « Nous … au souk. »', ['allons', 'allez', 'vont'], 'Avec « nous », le verbe aller fait « nous allons ».'],
  ['B', 'Quel mot est le contraire de « grand » ?', ['petit', 'large', 'haut'], 'Le contraire de grand, c’est petit.'],
  ['A', 'Lequel est un nom commun ?', ['la cigogne', 'Rabat', 'Soumaya'], 'Rabat et Soumaya sont des noms propres (majuscule). La cigogne est un nom commun.'],
  ['T', 'Complète : « Les portes … bleues. »', ['sont', 'son', 'sons'], '« sont » est le verbe être (elles sont). « son » veut dire « le sien ».'],
];
const DOORS2 = [
  ['R', 'Quel mot est un verbe ?', ['courir', 'rapide', 'maison'], 'Courir est une action : c’est un verbe.'],
  ['A', 'Quel mot s’écrit correctement ?', ['beaucoup', 'boucoup', 'beaucou'], 'On écrit « beaucoup ».'],
  ['B', 'Un synonyme de « joli », c’est…', ['beau', 'triste', 'lourd'], 'Joli et beau veulent dire presque la même chose : ce sont des synonymes.'],
  ['A', '« Hier, je … au stade. »', ['suis allée', 'vais', 'irai'], 'Hier = passé : je suis allée.'],
  ['T', 'Quel est le féminin de « un chat » ?', ['une chatte', 'une chate', 'une chatesse'], 'Le féminin de chat est chatte.'],
];
function kasbah(body, talk) {
  const set = Math.random() < 0.5 ? DOORS : DOORS2; let k = 0, ok = 0;
  const word = h('div', { class: 'rb-word' }), zone = h('div');
  const drawWord = () => word.replaceChildren(...set.map((d, i) => h('span', { class: 'rb-letter' + (i < k ? ' on' : '') }, i < k ? d[0] : '?')));
  const doors = h('div', { class: 'rb-doors' });
  const drawDoors = () => doors.replaceChildren(...set.map((d, i) => h('div', { class: 'rb-door' + (i < k ? ' open' : i === k ? ' cur' : '') }, i < k ? '🔓' : '🚪')));
  const step = () => {
    drawWord(); drawDoors();
    if (k >= set.length) { fin(body, talk, 'kasbah', ok, set.length, 'Le mot secret est RABAT ! Énigmes réussies :'); cigogne('cg_kasbah_fin', 'Tu as trouvé le mot secret : RABAT, la capitale du Maroc ! Bravo !'); zone.replaceChildren(h('p', { class: 'tb-res' }, '🗝️ Mot secret : RABAT !'), h('button', { class: 'btn primary', type: 'button', onclick: () => kasbah(body, talk) }, '🔁 D’autres portes')); return; }
    const [, q, choices, why] = set[k];
    talk(`Porte ${k + 1}. ${q}`);
    zone.replaceChildren(h('p', { class: 'tb-q rb-q' }, `🚪 Porte ${k + 1} : ${q}`), h('div', { class: 'actions wrap rb-ch' }, ...shuffle(choices.map((c, j) => [c, j])).map(([c, j]) => h('button', { class: 'btn', type: 'button', 'data-testid': j === 0 ? 'rb-ok' : 'rb-ko', onclick: () => {
      zone.querySelectorAll('.rb-ch button').forEach((b) => { b.disabled = true; });
      if (j === 0) { ok++; Sfx.ok(); } else Sfx.ko();
      zone.append(h('div', { class: 'ea-step' }, h('p', null, (j === 0 ? '✔ La porte s’ouvre ! ' : '💡 La porte s’ouvre quand même, retiens bien : ') + why), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'rb-next', onclick: () => { k++; step(); } }, 'Porte suivante ▶')));
    } }, c))));
  };
  body.replaceChildren(head('kasbah', '💙 La Kasbah des Oudayas'), h('p', { class: 'prompt' }, 'Ouvre les 5 portes bleues : chaque porte cache une lettre du mot secret !'), doors, word, zone);
  cigogne('cg_kasbah', 'Les ruelles bleues des Oudayas cachent un mot secret. Réponds aux énigmes pour ouvrir les portes !', talk);
  step();
}

// ---------------------------------------------------------------- 4. le stade : penalties avec Zakaria
function questionMix() {
  const a = ri(12, 89), b = ri(5, 9), c = ri(2, 9), d = ri(2, 9);
  return shuffle([
    [`${a} + ${b} = ?`, [`${a + b}`, `${a + b + 1}`, `${a + b - 10}`], `${a} + ${b} = ${a + b}.`],
    [`${c} × ${d} = ?`, [`${c * d}`, `${c * d + c}`, `${c + d}`], `${c} × ${d} = ${c * d}.`],
    [`${a + 20} − 10 = ?`, [`${a + 10}`, `${a}`, `${a + 20}`], `${a + 20} − 10 = ${a + 10}.`],
    ['Quelle est la capitale du Maroc ?', ['Rabat', 'Casablanca', 'Marrakech'], 'La capitale du Maroc, c’est Rabat. Casablanca est la plus grande ville.'],
    ['Quelle est la capitale de la Belgique ?', ['Bruxelles', 'Anvers', 'Liège'], 'La capitale de la Belgique, c’est Bruxelles.'],
    ['Combien de minutes dans une heure ?', ['60', '100', '30'], 'Une heure = 60 minutes.'],
    ['Quel animal est l’emblème des toits de Rabat ?', ['la cigogne', 'le flamant', 'le pingouin'], 'Les cigognes nichent sur les remparts et les tours de Rabat.'],
    ['Quel est le pluriel de « un ballon » ?', ['des ballons', 'des ballon', 'des ballonx'], 'On ajoute un s : des ballons.'],
    ['Combien de joueurs dans une équipe de foot sur le terrain ?', ['11', '9', '7'], 'Une équipe de football a 11 joueurs sur le terrain.'],
    ['Quel mot est un adjectif ?', ['rapide', 'courir', 'stade'], 'Rapide décrit quelque chose : c’est un adjectif.'],
    ['La moitié de 50, c’est…', ['25', '20', '30'], '50 ÷ 2 = 25.'],
    ['Le double de 35, c’est…', ['70', '65', '75'], '35 × 2 = 70.'],
  ]).slice(0, 5);
}
function stade(body, talk) {
  const field = h('div', { class: 'rb-pitch' }, h('img', { class: 'rb-keeper', src: asset('assets/sprites/zakaria/face.webp'), alt: 'Zakaria' }), h('div', { class: 'rb-ball' }, '⚽'));
  const score = h('b', { class: 'rb-score' }, '0 – 0'); const zone = h('div'); let goals = 0, saves = 0;
  const shoot = (good) => {
    field.classList.remove('goal', 'save'); void field.offsetWidth; field.classList.add(good ? 'goal' : 'save');
    if (good) { goals++; Sfx.coin(); } else saves++;
    score.textContent = `${goals} – ${saves}`;
  };
  body.replaceChildren(head('stade', '⚽ Le stade de Rabat'), h('p', { class: 'prompt' }, 'Réponds juste et tire ton penalty ! Zakaria est dans les buts. 🧤'), h('div', { class: 'rb-sc' }, '🙋‍♀️ Soumaya ', score, ' Zakaria 🧤'), field, zone);
  cigogne('cg_stade', 'Bienvenue au stade ! Zakaria est dans les buts. Chaque bonne réponse, c’est un but !', talk);
  serie(zone, talk, questionMix(), (ok, t) => {
    fin(body, talk, 'stade', ok, t, goals > saves ? 'Victoire ! Score :' : 'Bien joué ! Score :');
    zone.replaceChildren(h('p', { class: 'tb-res' }, goals > saves ? `🏆 Tu gagnes ${goals} à ${saves} !` : `Zakaria gagne ${saves} à ${goals}… revanche ?`), h('button', { class: 'btn primary', type: 'button', onclick: () => stade(body, talk) }, '🔁 Revanche'));
  }, { onAnswer: shoot });
}

// ---------------------------------------------------------------- Bellarej la cigogne (accueil)
function accueil(body, talk) {
  const r = RB(), n = ['zellige', 'souk', 'kasbah', 'stade'].filter((k) => r[k]).length;
  body.replaceChildren(h('div', { class: 'rb-hello' }, h('img', { class: 'rb-cg big', src: asset('assets/rabat/cigogne_joie.webp'), alt: 'Bellarej la cigogne' }),
    h('div', null, h('p', { class: 'vl-big' }, `Salam ${NAME()} ! Je suis Bellarej, la cigogne de Chellah.`),
      h('p', null, 'Bienvenue à El Hikma, l’école de la Sagesse, version magique, au cœur du Maroc ! Choisis un lieu : l’atelier du zellige, le souk, la Kasbah des Oudayas ou le stade.'),
      h('p', { class: 'muted' }, `🌟 Lieux réussis : ${n}/4`),
      h('p', { class: 'muted' }, '🇧🇪🤝🇲🇦 Le savais-tu ? Les cigognes passent l’été en Europe… et l’hiver au Maroc. Comme toi, elles connaissent la Belgique et le Maroc !'))));
  cigogne('cg_accueil', `Salam ${NAME()} ! Je suis Bellarej, la cigogne de Chellah. Bienvenue à El Hikma, l’école de la Sagesse, version magique, au cœur du Maroc ! Choisis un lieu et amuse-toi bien !`, talk);
}

export function open(tab = 'accueil') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div', { class: 'rb-body' });
  const T = [['accueil', '🪶 Bellarej', accueil], ['zellige', '🎨 Zellige', zellige], ['souk', '🛍️ Souk', souk], ['kasbah', '💙 Kasbah', kasbah], ['stade', '⚽ Stade', stade]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'rb-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel rb-panel' }, UI.closeButton(), h('h2', null, '🇲🇦 El Hikma, l’école de la Sagesse'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'El Hikma, l’école de la Sagesse', onClose: () => { Voice.stop(); if (cgEl) Voice.fadeOutEl(cgEl); } });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); if (cgEl) Voice.fadeOutEl(cgEl); T.find((x) => x[0] === k)[2](body, talk); }
  go(T.some((x) => x[0] === tab) ? tab : 'accueil');
}
