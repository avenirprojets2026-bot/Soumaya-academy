// La Papeterie Enchantée : le monde des fournitures scolaires, derrière le plumier doré de la Bibliothèque enchantée.
// Gommette, la petite gomme rose, guide Soumaya dans 6 lieux : la tour des crayons (couleurs), l'atelier de la règle
// et du compas (mesures, géométrie), le magasin (euros), la bibliothèque des cahiers (orthographe), l'atelier créatif
// (symétrie, pliage, fractions) et la trousse de rêve (fournitures à gagner avec ses pièces).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { asset } from './asset.js';
import { burst, shuffle } from './workshop.js';

const NAME = () => S.get().name || 'Soumaya';
const PP = () => { const b = S.get(); b.papeterie = b.papeterie || { trousse: [] }; b.papeterie.trousse = b.papeterie.trousse || []; return b.papeterie; };
const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const done = (k, score) => { const p = PP(); p[k] = Math.max(p[k] || 0, score || 1); S.save(); };
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const eur = (c) => (c / 100).toFixed(2).replace('.', ',') + ' €';

// voix enregistrées de Gommette
let gEl = null;
function gommette(id, txt, talk) {
  // voix enregistrée de Gommette (voix douce d'enfant) ; la question qui suit attend la fin de sa phrase
  if (talk) talk('🩷 ' + txt, false);
  if (!Sfx.soundOn()) return;
  try { if (gEl) Voice.fadeOutEl(gEl); gEl = Voice.playUrl(`assets/voice/papeterie/${id}.ogg`); } catch (e) { /* sans son */ }
}
const GM = (j) => h('img', { class: 'rb-cg pp-gm', src: asset('assets/papeterie/gommette_' + (j ? 'joie' : 'salut') + '.webp'), alt: 'Gommette' });
const head = (img, title) => h('div', { class: 'rb-head' }, h('img', { src: asset(`assets/papeterie/${img}.webp`), alt: '' }), h('b', null, title), GM());

function serie(zone, talk, Q, onEnd) {
  let n = 0, ok = 0;
  const next = () => {
    if (n >= Q.length) { onEnd(ok, Q.length); return; }
    const [q, choices, why] = Q[n++];
    talk(q);
    zone.replaceChildren(h('p', { class: 'tb-q rb-q' }, q), h('div', { class: 'actions wrap rb-ch' }, ...shuffle(choices.map((c, k) => [c, k])).map(([c, k]) => h('button', { class: 'btn', type: 'button', 'data-testid': k === 0 ? 'pp-ok' : 'pp-ko', onclick: () => {
      zone.querySelectorAll('.rb-ch button').forEach((b) => { b.disabled = true; });
      const good = k === 0; if (good) { ok++; Sfx.ok(); } else Sfx.ko();
      zone.append(h('div', { class: 'ea-step' }, h('p', null, (good ? '✔ Bravo ! ' : '💡 ') + why), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'pp-next', onclick: next }, 'Suivant ▶')));
      talk((good ? 'Bravo ! ' : '') + why);
    } }, c))));
  };
  next();
}
const fin = (body, zone, talk, k, ok, tot, again) => {
  const s = ok >= Math.ceil(tot * 0.7) ? 2 : 1; star(s); done(k, ok);
  if (s === 2) { Sfx.win(); burst(body); Voice.say('bravo'); } else Voice.say('courage');
  zone.replaceChildren(h('p', { class: 'tb-res' }, `✏️ ${ok}/${tot} — +${s} ⭐ et +${2 * s} pièces pour ta trousse de rêve !`), h('button', { class: 'btn primary', type: 'button', onclick: again }, '🔁 Rejouer'));
  talk(`${ok} sur ${tot} ! Tu gagnes ${2 * s} pièces pour ta trousse de rêve.`);
};

// ---------------------------------------------------------------- 1. la tour des crayons : les couleurs
function crayons(body, talk) {
  const zone = h('div');
  const Q = [
    ['🔴 rouge + 🟡 jaune = ?', ['🟠 orange', '🟢 vert', '🟣 violet'], 'Rouge et jaune mélangés donnent l’orange.'],
    ['🔵 bleu + 🟡 jaune = ?', ['🟢 vert', '🟠 orange', '🟤 brun'], 'Bleu et jaune mélangés donnent le vert.'],
    ['🔴 rouge + 🔵 bleu = ?', ['🟣 violet', '🟢 vert', '🟠 orange'], 'Rouge et bleu mélangés donnent le violet.'],
    ['Quelles sont les 3 couleurs primaires ?', ['rouge, jaune, bleu', 'vert, orange, violet', 'noir, blanc, gris'], 'Les couleurs primaires sont le rouge, le jaune et le bleu : on ne peut pas les fabriquer en mélangeant.'],
    ['Laquelle est une couleur chaude ?', ['l’orange', 'le bleu', 'le vert'], 'Les couleurs chaudes rappellent le soleil et le feu : rouge, orange, jaune.'],
    ['Laquelle est une couleur froide ?', ['le bleu', 'le rouge', 'le jaune'], 'Les couleurs froides rappellent l’eau et la glace : bleu, vert, violet.'],
    ['⚪ blanc + 🔴 rouge = ?', ['🩷 rose', '🟤 brun', '🟠 orange'], 'Le blanc éclaircit le rouge : on obtient du rose.'],
    ['Combien de couleurs a un arc-en-ciel ?', ['7', '5', '10'], 'L’arc-en-ciel a 7 couleurs : rouge, orange, jaune, vert, bleu, indigo, violet.'],
  ];
  const go = () => serie(zone, talk, shuffle(Q).slice(0, 6), (ok, t) => fin(body, zone, talk, 'crayons', ok, t, () => crayons(body, talk)));
  body.replaceChildren(head('crayons', '🖍️ La tour des crayons'), zone);
  gommette('gm_crayons', 'Bienvenue dans la tour des crayons ! Mélange les couleurs comme un vrai peintre !', talk); go();
}

// ---------------------------------------------------------------- 2. l'atelier de la règle et du compas
function regle(body, talk) {
  const zone = h('div'); let n = 0, ok = 0; const R = 6;
  const mesure = () => { // mesurer un trait sur une règle dessinée
    const mm = ri(25, 115), cm = Math.floor(mm / 10), r = mm % 10;
    const good = r ? `${cm} cm ${r} mm` : `${cm} cm`;
    const alt = shuffle([r ? `${cm + 1} cm ${r} mm` : `${cm + 1} cm`, r ? `${cm} cm ${10 - r} mm` : `${cm - 1} cm`, `${mm} cm`]).slice(0, 2);
    const ticks = Array.from({ length: 121 }, (_, i) => h('i', { class: 'pp-tick' + (i % 10 === 0 ? ' cm' : i % 5 === 0 ? ' half' : ''), style: `left:${i / 1.2}%` }, i % 10 === 0 ? h('span', null, String(i / 10)) : ''));
    return [`Mesure le trait rose avec la règle. Combien mesure-t-il ?`, [good, ...alt], `Le trait commence à 0 et s’arrête à ${cm} cm et ${r} mm : il mesure ${mm} mm, c’est-à-dire ${good}.`,
      h('div', { class: 'pp-ruler' }, h('div', { class: 'pp-seg', style: `width:${mm / 1.2}%` }), ...ticks)];
  };
  const L = ri(4, 9), l = ri(2, L - 1), rr = ri(2, 6);
  const POOL = [
    () => mesure(), () => mesure(),
    () => [`1 cm = combien de mm ?`, ['10 mm', '100 mm', '1 mm'], '1 centimètre = 10 millimètres.'],
    () => [`Un rectangle mesure ${L} cm de long et ${l} cm de large. Quel est son périmètre ?`, [`${2 * (L + l)} cm`, `${L * l} cm`, `${L + l} cm`], `Périmètre = longueur + largeur + longueur + largeur = ${L} + ${l} + ${L} + ${l} = ${2 * (L + l)} cm.`],
    () => [`Avec le compas, je trace un cercle de rayon ${rr} cm. Quel est son diamètre ?`, [`${2 * rr} cm`, `${rr} cm`, `${rr + 2} cm`], `Le diamètre est le double du rayon : ${rr} × 2 = ${2 * rr} cm.`],
    () => ['Avec quel outil vérifie-t-on un angle droit ?', ['l’équerre', 'le compas', 'la gomme'], 'L’équerre sert à tracer et vérifier les angles droits.'],
    () => ['Combien d’angles droits a un rectangle ?', ['4', '2', '0'], 'Un rectangle a 4 angles droits.'],
    () => ['1 m = combien de cm ?', ['100 cm', '10 cm', '1 000 cm'], '1 mètre = 100 centimètres.'],
  ];
  const Q = shuffle(POOL).slice(0, R).map((f) => f());
  const next = () => {
    if (n >= Q.length) { fin(body, zone, talk, 'regle', ok, R, () => regle(body, talk)); return; }
    const [q, ch, why, extra] = Q[n++]; talk(q);
    zone.replaceChildren(h('p', { class: 'tb-q rb-q' }, q), ...(extra ? [extra] : []), h('div', { class: 'actions wrap rb-ch' }, ...shuffle(ch.map((c, k) => [c, k])).map(([c, k]) => h('button', { class: 'btn', type: 'button', 'data-testid': k === 0 ? 'pp-ok' : 'pp-ko', onclick: () => {
      zone.querySelectorAll('.rb-ch button').forEach((b) => { b.disabled = true; }); if (k === 0) { ok++; Sfx.ok(); } else Sfx.ko();
      zone.append(h('div', { class: 'ea-step' }, h('p', null, (k === 0 ? '✔ Bravo ! ' : '💡 ') + why), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'pp-next', onclick: next }, 'Suivant ▶')));
      talk((k === 0 ? 'Bravo ! ' : '') + why);
    } }, c))));
  };
  body.replaceChildren(head('regle', '📏 L’atelier de la règle et du compas'), zone);
  gommette('gm_regle', 'Voici l’atelier de la règle et du compas ! Mesure bien, trace bien, et vérifie avec l’équerre !', talk); next();
}

// ---------------------------------------------------------------- 3. le magasin de fournitures (euros)
const ART = [['✏️', 'un crayon', 80], ['🖊️', 'un stylo', 150], ['📒', 'un cahier', 250], ['🧽', 'une gomme', 60], ['📏', 'une latte', 120], ['🖍️', 'des crayons de couleur', 450], ['✂️', 'des ciseaux', 300], ['🧴', 'un bâton de colle', 190], ['🎒', 'un cartable', 1500], ['🖌️', 'des feutres', 390]];
function magasin(body, talk) {
  const zone = h('div'); let n = 0, ok = 0; const R = 6;
  const next = () => {
    if (n >= R) { fin(body, zone, talk, 'magasin', ok, R, () => magasin(body, talk)); return; }
    n++;
    const [a, b] = shuffle(ART.filter((x) => x[2] < 1000)).slice(0, 2), tot = a[2] + b[2];
    const mode = n % 3;
    let q, good, opts, why;
    if (mode === 1) { q = `${a[0]} ${a[1]} (${eur(a[2])}) + ${b[0]} ${b[1]} (${eur(b[2])}) : combien je paie ?`; good = tot; opts = [tot, tot + 100, tot - 10]; why = `${eur(a[2])} + ${eur(b[2])} = ${eur(tot)}.`; }
    else if (mode === 2) { const give = tot <= 500 ? 500 : tot <= 1000 ? 1000 : 2000; q = `J’achète ${a[1]} et ${b[1]} pour ${eur(tot)}. Je donne ${eur(give)}. Combien me rend-on ?`; good = give - tot; opts = [good, good + 100, good + 10]; why = `${eur(give)} − ${eur(tot)} = ${eur(good)}.`; }
    else { const k = ri(2, 4); const a = shuffle(ART.filter((x) => /^une? /.test(x[1]) && x[2] < 1000))[0]; q = `${k} ${a[1].replace(/^une? /, '')}${a[1].endsWith('s') ? '' : 's'} à ${eur(a[2])} chacun : combien ça coûte ?`; good = k * a[2]; opts = [good, good + a[2], good - 10]; why = `${k} × ${eur(a[2])} = ${eur(good)}.`; }
    opts = [...new Set(opts.filter((v) => v > 0))];
    talk(q);
    zone.replaceChildren(h('p', { class: 'tb-q rb-q' }, q), h('div', { class: 'actions wrap rb-ch' }, ...shuffle(opts).map((v) => h('button', { class: 'btn', type: 'button', 'data-testid': v === good ? 'pp-ok' : 'pp-ko', onclick: () => {
      zone.querySelectorAll('.rb-ch button').forEach((x) => { x.disabled = true; }); if (v === good) { ok++; Sfx.coin(); } else Sfx.ko();
      zone.append(h('div', { class: 'ea-step' }, h('p', null, (v === good ? '✔ Bravo ! ' : '💡 ') + why), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'pp-next', onclick: next }, 'Suivant ▶')));
      talk((v === good ? 'Bravo ! ' : '') + why);
    } }, eur(v)))));
  };
  body.replaceChildren(head('magasin', '🛒 Le magasin de fournitures'), h('p', { class: 'muted' }, '💡 1 euro = 100 cents. 2,50 € = 2 euros et 50 cents.'), zone);
  gommette('gm_magasin', 'Bienvenue au magasin ! Prépare ton cartable et compte bien tes euros !', talk); next();
}

// ---------------------------------------------------------------- 4. la bibliothèque des cahiers : orthographe
function cahiers(body, talk) {
  const zone = h('div');
  const Q = [
    ['Choisis le bon mot : « Soumaya … une nouvelle trousse. »', ['a', 'à', 'as'], '« a » est le verbe avoir (elle a). On peut dire « elle avait ».'],
    ['Choisis le bon mot : « Je vais … l’école. »', ['à', 'a', 'as'], '« à » est une petite préposition : on ne peut pas dire « avait ».'],
    ['Choisis le bon mot : « La gomme … rose. »', ['est', 'et', 'ai'], '« est » est le verbe être : on peut dire « était ».'],
    ['Choisis le bon mot : « Un crayon … un stylo. »', ['et', 'est', 'es'], '« et » veut dire « et puis » : il relie deux mots.'],
    ['Choisis le bon mot : « Mes cahiers … rangés. »', ['sont', 'son', 'sons'], '« sont » est le verbe être (ils sont).'],
    ['Choisis le bon mot : « Elle range … crayons. »', ['ses', 'ces', 'c’est'], '« ses » = les siens (ses crayons à elle).'],
    ['Quel mot est bien écrit ?', ['des crayons', 'des crayon', 'des crayonx'], 'Au pluriel, on ajoute un s : des crayons.'],
    ['Quel mot est bien écrit ?', ['des ciseaux', 'des ciseau', 'des ciseaus'], 'Les mots en -eau prennent un x au pluriel : des ciseaux.'],
    ['Accorde : « une trousse … »', ['bleue', 'bleu', 'bleus'], 'Trousse est féminin : on ajoute un e, une trousse bleue.'],
    ['Quel est le verbe dans « Soumaya taille son crayon » ?', ['taille', 'Soumaya', 'crayon'], 'Le verbe dit l’action : taille.'],
  ];
  const go = () => serie(zone, talk, shuffle(Q).slice(0, 6), (ok, t) => fin(body, zone, talk, 'cahiers', ok, t, () => cahiers(body, talk)));
  body.replaceChildren(head('cahiers', '📒 La bibliothèque des cahiers'), zone);
  gommette('gm_cahiers', 'Dans la bibliothèque des cahiers, on écrit sans faute ! Et si tu te trompes, je suis là pour effacer !', talk); go();
}

// ---------------------------------------------------------------- 5. l'atelier créatif : symétrie, pliage, fractions
function atelier(body, talk) {
  const zone = h('div');
  const Q = [
    ['Combien d’axes de symétrie a un carré ?', ['4', '2', '1'], 'Un carré a 4 axes de symétrie : 2 droits et 2 en diagonale.'],
    ['Combien d’axes de symétrie a un rectangle (pas carré) ?', ['2', '4', '0'], 'Un rectangle a 2 axes de symétrie.'],
    ['Je plie une feuille en 2, puis encore en 2. En combien de parts est-elle pliée ?', ['4', '3', '2'], '2 × 2 = 4 parts égales : chaque part est un quart.'],
    ['Je découpe une feuille en 4 parts égales. J’en colorie 3. Quelle fraction ai-je coloriée ?', ['3/4', '1/4', '4/3'], '3 parts sur 4 : trois quarts, 3/4.'],
    ['Un papillon en papier est symétrique. Si l’aile gauche a 3 points, l’aile droite en a…', ['3', '6', '1'], 'Avec la symétrie, chaque côté est le reflet de l’autre : 3 points aussi.'],
    ['Quelle lettre est symétrique (axe vertical) ?', ['A', 'F', 'G'], 'Le A est pareil à gauche et à droite.'],
    ['La moitié d’une feuille de 20 cm, c’est…', ['10 cm', '5 cm', '40 cm'], '20 ÷ 2 = 10 cm.'],
    ['Un ruban de 60 cm est coupé en 3 morceaux égaux. Chaque morceau mesure…', ['20 cm', '30 cm', '15 cm'], '60 ÷ 3 = 20 cm.'],
  ];
  const go = () => serie(zone, talk, shuffle(Q).slice(0, 6), (ok, t) => fin(body, zone, talk, 'atelier', ok, t, () => atelier(body, talk)));
  body.replaceChildren(head('atelier', '✂️ L’atelier créatif'), zone);
  gommette('gm_atelier', 'Ciseaux, colle et papier ! Dans l’atelier créatif, on plie, on découpe, et on cherche la symétrie !', talk); go();
}

// ---------------------------------------------------------------- 6. la trousse de rêve (collection)
const SHOP = [['🖊️', 'Stylo à paillettes', 6], ['🦄', 'Gomme licorne', 8], ['🌈', 'Crayons arc-en-ciel', 10], ['⭐', 'Taille-crayon étoile', 6], ['🍓', 'Feutres parfumés', 12], ['🖍️', 'Surligneurs pastel', 10], ['📏', 'Latte magique', 8], ['💖', 'Trousse en velours rose', 20], ['📒', 'Carnet secret', 14], ['🦋', 'Stickers papillons', 6], ['✒️', 'Stylo plume doré', 16], ['🎀', 'Marque-page à ruban', 5]];
function trousse(body, talk) {
  const p = PP(), b = S.get();
  const mine = h('div', { class: 'pp-mine' }, ...(p.trousse.length ? p.trousse.map((n) => { const it = SHOP.find((x) => x[1] === n); return h('span', { class: 'pp-item own', title: n }, it ? it[0] : '✨'); }) : [h('small', { class: 'muted' }, 'Ta trousse est encore vide : gagne des pièces dans les ateliers !')]));
  const shop = h('div', { class: 'pp-shop' }, ...SHOP.map(([e, n, prix]) => { const has = p.trousse.includes(n); return h('button', { class: 'pp-item' + (has ? ' own' : ''), type: 'button', disabled: has, 'data-testid': 'pp-buy', onclick: () => {
    if (b.coins < prix) { Sfx.ko(); talk(`Il te faut ${prix} pièces : tu en as ${b.coins}. Continue les ateliers !`); return; }
    b.coins -= prix; p.trousse.push(n); S.save(); Sfx.win(); burst(body); gommette('gm_trousse', 'Waouh, quelle belle trouvaille ! Elle va briller dans ta trousse !'); talk(`${n} rejoint ta trousse de rêve !`, false); setTimeout(() => trousse(body, talk), 900);
  } }, h('span', { class: 'pp-big' }, e), h('small', null, n), h('b', null, has ? '✔' : `🪙 ${prix}`)); }));
  body.replaceChildren(head('trousse', '💖 Ma trousse de rêve'), h('p', { class: 'prompt' }, `🪙 Tu as ${b.coins} pièces. Choisis tes fournitures préférées !`), h('p', null, h('b', null, `🎒 Ma trousse (${p.trousse.length}/${SHOP.length}) :`)), mine, shop);
}

// ---------------------------------------------------------------- Gommette (accueil)
function accueil(body, talk) {
  const p = PP(), n = ['crayons', 'regle', 'magasin', 'cahiers', 'atelier'].filter((k) => p[k]).length;
  body.replaceChildren(h('div', { class: 'rb-hello' }, h('img', { class: 'rb-cg big', src: asset('assets/papeterie/gommette_joie.webp'), alt: 'Gommette' }),
    h('div', null, h('p', { class: 'vl-big' }, `Coucou ${NAME()} ! Je suis Gommette, la petite gomme magique.`),
      h('p', null, 'Bienvenue dans la Papeterie Enchantée, la ville des fournitures scolaires ! Chaque atelier réussi te donne des pièces pour remplir ta trousse de rêve.'),
      h('p', { class: 'muted' }, `🌟 Ateliers réussis : ${n}/5 · 💖 Trousse : ${p.trousse.length}/${SHOP.length}`))));
  gommette('gm_accueil', `Coucou ${NAME()} ! Je suis Gommette, la petite gomme magique. Bienvenue dans la Papeterie Enchantée ! Gagne des pièces dans les ateliers pour remplir ta trousse de rêve !`, talk);
}

export function open(tab = 'accueil') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div', { class: 'rb-body' });
  const T = [['accueil', '🩷 Gommette', accueil], ['crayons', '🖍️ Crayons', crayons], ['regle', '📏 Règle et compas', regle], ['magasin', '🛒 Magasin', magasin], ['cahiers', '📒 Cahiers', cahiers], ['atelier', '✂️ Atelier', atelier], ['trousse', '💖 Ma trousse', trousse]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'pp-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel rb-panel' }, UI.closeButton(), h('h2', null, '✏️ La Papeterie Enchantée'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'La Papeterie Enchantée', onClose: () => { Voice.stop(); if (gEl) Voice.fadeOutEl(gEl); } });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); if (gEl) Voice.fadeOutEl(gEl); T.find((x) => x[0] === k)[2](body, talk); }
  go(T.some((x) => x[0] === tab) ? tab : 'accueil');
}
