// La Machine des Idées (Tour des Secrets Numériques, culture numérique P4) : découvrir ce qu'est une IA qui écrit.
// Déroulé : 7 chapitres vidéo courts (voix de Soumaya, sous-titres), 4 défis (apprendre par les exemples,
// prédire la suite, améliorer une consigne, vérifier une réponse), questions de sécurité, carnet de découvertes et badge.
// Contenu éditorial (CH, DEFIS…) séparé de l'affichage et de la logique. Aucune connexion à une vraie IA, aucune donnée envoyée.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, qcm, log } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.ia = b.ia || { ch: 0, seen: {}, done: false }; b.ia.seen = b.ia.seen || {}; return b.ia; };

// ---------- contenu : les 7 chapitres (chemins écrits en entier pour la version « fichier unique ») ----------
const CH = [
  { t: 'La porte de l’IA', vid: 'assets/cine/ia1.webm', sub: '« Papa, viens ! Je vais te montrer comment une machine apprend à jouer avec les mots ! »', leg: 'Bienvenue dans la Machine des Idées', learn: 'Une machine peut apprendre à jouer avec les mots.' },
  { t: 'Qu’est-ce qu’une IA ?', vid: 'assets/cine/ia2.webm', sub: '« L’intelligence artificielle, c’est une technologie qui peut reconnaître des informations et créer des réponses. Mais ce n’est pas une personne ! »', leg: 'Certaines IA savent produire du texte', learn: 'Une IA est une technologie, pas une personne. Certaines IA écrivent du texte, d’autres reconnaissent des images…' },
  { t: 'Apprendre grâce aux exemples', vid: 'assets/cine/ia3.webm', sub: '« Un modèle de langage a été entraîné avec énormément d’exemples de textes. Il y a découvert quels mots vont souvent ensemble. »', leg: 'L’entraînement se fait AVANT qu’on l’utilise', learn: 'Un modèle de langage a été entraîné avec beaucoup de textes, avant qu’on l’utilise.' },
  { t: 'La suite de la phrase', vid: 'assets/cine/ia4.webm', sub: '« Regarde ! La machine imagine ce qui pourrait venir ensuite. Elle choisit des petits morceaux de texte, qu’on appelle des jetons. »', leg: 'Plusieurs suites sont possibles', learn: 'Elle écrit petit morceau par petit morceau (des jetons), en choisissant une suite probable… pas forcément vraie.' },
  { t: 'La puissance des consignes', vid: 'assets/cine/ia5.webm', sub: '« Plus ma demande est claire, mieux la machine peut m’aider. Cette demande, ça s’appelle un prompt ! »', leg: 'Une consigne claire = une meilleure aide', learn: 'Une consigne (un prompt) claire et précise donne une réponse plus utile.' },
  { t: 'L’esprit critique', vid: 'assets/cine/ia6.webm', sub: '« Oh là là ! Une IA peut inventer quelque chose qui a l’air vrai. Alors on vérifie avec des sources fiables ! »', leg: 'Plausible ne veut pas dire vrai', learn: 'Une IA peut se tromper ou inventer : on vérifie dans une source fiable.' },
  { t: 'C’est moi qui décide', vid: 'assets/cine/ia7.webm', sub: '« Et je ne donne jamais mon adresse ou mes mots de passe à une IA. C’est moi qui réfléchis et qui choisis ! Papa, on fait les défis ensemble ? »', leg: 'Mes secrets restent secrets', learn: 'Je ne donne jamais d’informations personnelles. C’est moi qui réfléchis et qui décide.' },
];

// ---------- lecteur de chapitre (vidéo + sous-titres + légende) ----------
function player(i, onEnd) {
  const c = CH[i], v = h('video', { class: 'ia-vid', src: c.vid, playsinline: '', preload: 'auto' });
  v.playsInline = true; v.muted = !Sfx.soundOn();
  const sub = h('div', { class: 'ia-sub' }), leg = h('div', { class: 'ia-leg' }, '✨ ' + c.leg);
  const pp = h('button', { class: 'btn small', type: 'button', onclick: () => (v.paused ? v.play() : v.pause()) }, '⏯ Pause');
  let ended = false; const fin = () => { if (ended) return; ended = true; leg.classList.add('on'); sub.textContent = c.sub; onEnd(); };
  v.addEventListener('timeupdate', () => { if (v.currentTime > 0.4) sub.textContent = c.sub; if (v.duration && v.currentTime > v.duration - 3) leg.classList.add('on'); });
  v.addEventListener('ended', fin); v.addEventListener('error', fin);
  const wrap = h('div', { class: 'ia-stage' }, v, sub, leg);
  setTimeout(() => { const p = v.play(); if (p && p.catch) p.catch(() => { v.muted = true; v.play().catch(fin); }); }, 50);
  return { el: h('div', null, wrap, h('div', { class: 'actions wrap' }, pp, h('button', { class: 'btn small', type: 'button', onclick: () => { v.currentTime = 0; v.play(); ended = false; leg.classList.remove('on'); } }, '↻ Revoir'), h('button', { class: 'btn small ghost', type: 'button', 'data-testid': 'ia-skip', onclick: () => { v.pause(); fin(); } }, '⏭ Passer'))), stop: () => { try { v.pause(); } catch (e) { /* rien */ } } };
}

// ---------- défi A : apprendre par les exemples ----------
const EX = [['Le chat dort sur le coussin.', 'coussin'], ['Le chat boit du lait.', null], ['Le chat dort sur le canapé.', 'canapé'], ['Le chien dort sur le tapis.', 'tapis'], ['Muezza dort sur le coussin du salon.', 'coussin'], ['La lune brille la nuit.', null], ['Le bébé dort sur le coussin moelleux.', 'coussin']];
function defiA(zone, talk, next) {
  const tally = { coussin: 0, canapé: 0, tapis: 0 }; let n = 0;
  const bars = h('div', { class: 'ia-bars' }), cards = h('div', { class: 'ia-cards' });
  const drawBars = () => { const mx = Math.max(1, ...Object.values(tally)); bars.replaceChildren(h('b', null, '🤖 Après « dort sur le », la machine a vu :'), ...Object.entries(tally).map(([w, c]) => h('div', { class: 'ia-bar' }, h('span', null, w), h('i', { style: `width:${(c / mx) * 100}%` }), h('b', null, String(c))))); };
  cards.append(...EX.map(([s, w]) => h('button', { class: 'ia-card', type: 'button', 'data-testid': 'ia-ex', onclick: (e) => {
    const b = e.currentTarget; if (b.classList.contains('read')) return; b.classList.add('read'); b.textContent = s; n++; Sfx.bloop(); if (w) { tally[w]++; drawBars(); }
    if (n === EX.length) ask();
  } }, '📜 Exemple à lire')));
  const host = h('div');
  const ask = () => qcm(host, talk, [{ q: 'D’après ces exemples, quel mot la machine a-t-elle vu le plus souvent après « dort sur le » ?', opts: ['coussin', 'tapis', 'lune'], why: '« coussin » est venu 3 fois : la machine a repéré une régularité. (C’est une simplification : un vrai modèle a lu des milliards de mots !)' }, { q: 'Quand la machine apprend-elle avec ces exemples ?', opts: ['Pendant son entraînement, avant qu’on l’utilise', 'Chaque fois que je lui parle, en direct', 'Jamais'], why: 'L’entraînement se fait avant. Discuter avec une IA ne l’entraîne pas automatiquement.' }], () => { star(2); next(); });
  zone.replaceChildren(h('p', { class: 'prompt' }, '🧩 Défi 1 — Apprendre par les exemples : touche chaque parchemin pour que la machine le lise.'), cards, bars, host);
  drawBars(); talk('Défi 1 ! Fais lire les exemples à la machine et regarde ce qu’elle remarque.', false);
}

// ---------- défi B : prédire la suite ----------
const SUITE = [['le coussin', 52], ['le canapé', 26], ['le tapis', 14], ['une chaussette', 5], ['la lune', 3]];
function defiB(zone, talk, next) {
  const out = h('div', { class: 'ia-outs' }), host = h('div');
  const pick = () => { let r = Math.random() * 100; for (const [w, p] of SUITE) { if ((r -= p) < 0) return w; } return SUITE[0][0]; };
  let tries = 0;
  const go = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ia-gen', onclick: () => { tries++; Sfx.bloop(); out.prepend(h('div', { class: 'ia-out' }, '🤖 Le chat dort sur ', h('b', null, pick()), '.')); if (tries === 4) ask(); } }, '🎲 Faire écrire la machine');
  const ask = () => qcm(host, talk, [{ q: 'La machine choisit-elle toujours la même suite ?', opts: ['Non : plusieurs suites sont possibles, elle n’écrit pas toujours la même chose', 'Oui, toujours exactement la même', 'Elle choisit au hasard, sans rien avoir appris'], why: 'Elle choisit parmi les suites probables : souvent « le coussin », mais pas toujours !' }, { q: 'Si la machine écrit une suite très probable, est-ce forcément VRAI ?', opts: ['Non : probable ne veut pas dire vrai', 'Oui, toujours'], why: 'La machine calcule ce qui « sonne bien », pas ce qui est vrai. On garde son esprit critique.' }], () => { star(2); next(); });
  zone.replaceChildren(h('p', { class: 'prompt' }, '🧩 Défi 2 — Prédire la suite : « Le chat dort sur… »'),
    h('div', { class: 'ia-bars' }, h('b', null, '🔮 Les suites que la machine trouve probables :'), ...SUITE.map(([w, p]) => h('div', { class: 'ia-bar' }, h('span', null, w), h('i', { style: `width:${p}%` }), h('b', null, p + ' %')))),
    h('p', { class: 'muted' }, 'La machine écrit morceau par morceau (des « jetons »). Fais-la écrire plusieurs fois : écrit-elle toujours la même chose ?'), go, out, host);
  talk('Défi 2 ! Fais écrire la machine plusieurs fois. Écrit-elle toujours la même chose ?', false);
}

// ---------- défi C : améliorer une consigne ----------
const CHIPS = [['quoi', '📖 Raconte une histoire'], ['avec', '🐈 avec Muezza'], ['pour', '👧 pour une enfant de 9 ans'], ['long', '📏 courte (5 lignes)'], ['ton', '😄 drôle et gentille']];
const REP = [
  '🤖 « Je ne sais pas ce que tu veux… Un dessin ? Un calcul ? Une recette ? »',
  '🤖 « Il était une fois un dragon, un roi et 47 chevaliers dans un très, très long royaume… » (trop long, et pas pour toi)',
  '🤖 « Il était une fois un chat nommé Muezza… » (mais l’histoire est longue et compliquée)',
  '🤖 « Il était une fois Muezza, un petit chat tigré qui rêvait de voler… » (c’est mieux, mais combien de lignes ?)',
  '🤖 « Muezza voulait attraper la lune. Il grimpa sur la plus haute tour du château… » (5 lignes, adaptée à 9 ans !)',
  '🤖 « Muezza voulait attraper la lune. Il grimpa sur la tour… et tomba dans un bol de crème ! Miam, la lune était délicieuse ! » 😄 Parfait !',
];
function defiC(zone, talk, next) {
  const on = new Set(), prompt = h('div', { class: 'ia-prompt' }), rep = h('div', { class: 'ia-rep' }), host = h('div');
  const draw = () => { const parts = CHIPS.filter(([k]) => on.has(k)).map(([, l]) => l.slice(3)); prompt.textContent = '✍️ ' + (parts.length ? parts.join(' ') + '.' : 'Fais un truc.'); rep.textContent = REP[on.size]; };
  const chips = h('div', { class: 'vi-pool' }, ...CHIPS.map(([k, l]) => h('button', { class: 'vi-chip', type: 'button', 'data-testid': 'ia-chip', onclick: (e) => { on.has(k) ? on.delete(k) : on.add(k); e.currentTarget.classList.toggle('on'); Sfx.tap(); draw(); if (on.size === CHIPS.length && !host.childNodes.length) ask(); } }, l)));
  const ask = () => qcm(host, talk, [{ q: 'Quelle consigne est la plus claire ?', opts: ['« Raconte une histoire courte et drôle avec Muezza pour une enfant de 9 ans. »', '« Fais un truc. »', '« Histoire. »'], why: 'Une bonne consigne dit QUOI, POUR QUI, AVEC QUOI, et COMMENT (longueur, ton).' }], () => { star(2); next(); });
  zone.replaceChildren(h('p', { class: 'prompt' }, '🧩 Défi 3 — Améliorer la consigne : ajoute des précisions et regarde la réponse de la machine changer.'), prompt, rep, chips, host);
  draw(); talk('Défi 3 ! « Fais un truc », ce n’est pas clair. Ajoute des précisions à la consigne.', false);
}

// ---------- défi D : vérifier une réponse ----------
const FAUX = [
  { ia: 'La capitale de la Belgique est Anvers.', src: '🗺️ Mon atlas', page: 'Atlas : la capitale de la Belgique est Bruxelles.', fix: 'La capitale de la Belgique est Bruxelles.' },
  { ia: 'L’araignée est un insecte qui a 6 pattes.', src: '📕 Mon livre de sciences', page: 'Livre de sciences : l’araignée a 8 pattes ; ce n’est pas un insecte, c’est une arachnide.', fix: 'L’araignée a 8 pattes : ce n’est pas un insecte.' },
  { ia: 'L’eau bout à 50 degrés.', src: '📕 Mon livre de sciences', page: 'Livre de sciences : au niveau de la mer, l’eau bout à 100 °C.', fix: 'L’eau bout à 100 °C.' },
  { ia: 'Les dragons habitent sur Saturne.', src: '🔭 Mon livre d’astronomie', page: 'Astronomie : Saturne est une planète géante faite surtout de gaz ; on n’y a jamais trouvé de vie, et les dragons n’existent que dans les contes.', fix: 'Les dragons n’existent pas, et on n’a jamais trouvé de vie sur Saturne.' },
];
function defiD(zone, talk, next) {
  const list = shuffle(FAUX).slice(0, 2); let i = 0;
  const round = () => {
    if (i >= list.length) { star(2); return next(); }
    const f = list[i], host = h('div'), book = h('div');
    zone.replaceChildren(h('p', { class: 'prompt' }, `🧩 Défi 4 — Vérifier (${i + 1}/${list.length}) : la machine a écrit…`), h('div', { class: 'ia-rep sure' }, `🤖 « ${f.ia} »`, h('small', null, ' (elle a l’air très sûre d’elle !)')), book, host);
    qcm(host, talk, [{ q: 'Comment vérifier cette information ?', opts: [`Je cherche dans une source fiable : ${f.src.slice(3)}`, 'Je demande à la même machine si elle est sûre', 'Je la crois : elle a l’air sûre d’elle'], why: 'On vérifie dans une source fiable (livre, atlas, site reconnu, un adulte qui sait).' }], () => {
      book.replaceChildren(h('div', { class: 'ia-book' }, h('b', null, f.src), h('p', null, f.page)));
      const h2 = h('div'); zone.append(h2);
      qcm(h2, talk, [{ q: `Alors, la phrase de la machine est…`, opts: ['Fausse', 'Vraie'], why: f.fix + ' La machine a écrit une phrase qui avait l’air vraie… mais elle s’était trompée !' }], () => { i++; h2.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: round }, 'Continuer →'))); });
    });
    talk(`La machine a écrit : ${f.ia} Est-ce vrai ? Vérifions !`, false);
  };
  round();
}

// ---------- questions des chapitres 2 et 7 ----------
const Q2 = [{ q: 'Une intelligence artificielle, c’est…', opts: ['une technologie qui traite des informations et crée des réponses', 'une personne cachée dans l’ordinateur', 'un robot qui a des sentiments'], why: 'C’est une technologie, un programme. Elle ne pense pas et ne ressent rien comme nous.' }, { q: 'Toutes les IA écrivent-elles du texte ?', opts: ['Non : certaines reconnaissent des images ou des voix, d’autres calculent un trajet…', 'Oui, toutes'], why: 'Ici, on découvre les IA qui écrivent du texte : les « modèles de langage ».' }];
const Q7 = [{ q: 'Une IA te demande ton adresse et le nom de ton école « pour mieux t’aider ». Que fais-tu ?', opts: ['Je ne donne pas ces informations et j’en parle à un adulte', 'Je les donne, elle veut m’aider', 'Je donne seulement le nom de mon école'], why: 'Adresse, école, mots de passe, informations de la famille : ça ne se donne jamais.' }, { q: 'À la fin, qui décide ?', opts: ['Moi : je réfléchis, je vérifie et je choisis', 'La machine', 'Personne'], why: 'L’IA peut aider, mais c’est toi qui réfléchis et qui décides.' }];

// ---------- carnet / bilan ----------
function carnet(zone, talk) {
  const st = ST(), first = !st.done; st.done = true; S.save(); if (first) star(3);
  const hd = zone.parentElement && zone.parentElement.querySelector('.ia-h'); if (hd) hd.textContent = '📓 Bilan — Mon carnet de découvertes';
  zone.replaceChildren(h('div', { class: 'ia-carnet' }, h('h3', null, '📓 Mon carnet de découvertes'), h('ol', null, ...CH.map((c) => h('li', null, h('b', null, c.t + ' : '), c.learn))), first ? h('p', { class: 'ia-badge' }, '🏅 Nouveau badge : Petite exploratrice de l’IA') : null),
    h('div', { class: 'actions wrap' }, h('button', { class: 'btn', type: 'button', onclick: () => open(0) }, '↻ Revoir depuis le début')));
  burst(zone); Sfx.win(); log('ia', 1);
  talk('Bravo ! Maintenant, je sais expliquer comment fonctionne une IA qui écrit. Et surtout : je garde toujours mon esprit critique !', false);
  const a = new Audio(); try { if (Sfx.soundOn()) { a.src = 'assets/voice/ia_fin.mp3'; a.play().catch(() => {}); } } catch (e) { /* sans son */ }
}

// ---------- déroulé ----------
const ACT = [null, (z, t, n) => qcm(z, t, Q2, () => { star(); n(); }), defiA, defiB, defiC, defiD, (z, t, n) => qcm(z, t, Q7, () => { star(); n(); })];
let cur = null;
export function open(start) {
  const st = ST(); let i = start != null ? start : (st.done ? 0 : Math.min(st.ch || 0, CH.length - 1));
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const rail = h('div', { class: 'ia-rail' }), head = h('h3', { class: 'ia-h' }), zone = h('div', { class: 'ia-zone' });
  const drawRail = () => rail.replaceChildren(...CH.map((c, k) => h('button', { class: 'ia-dot' + (k === i ? ' on' : '') + (ST().seen[k] ? ' seen' : ''), type: 'button', title: c.t, disabled: !ST().seen[k] && k > (ST().ch || 0), onclick: () => chap(k) }, String(k + 1))), h('button', { class: 'ia-dot' + (ST().done ? ' seen' : ''), type: 'button', title: 'Carnet', disabled: !ST().done, onclick: () => { stopV(); carnet(zone, talk); } }, '📓'));
  const stopV = () => { if (cur) cur.stop(); cur = null; };
  const after = (k) => { ST().seen[k] = true; ST().ch = Math.max(ST().ch || 0, k + 1); S.save(); drawRail();
    const nx = () => (k + 1 < CH.length ? chap(k + 1) : carnet(zone, talk));
    if (ACT[k]) { const box = h('div', { class: 'ia-act' }); zone.append(box); ACT[k](box, talk, () => box.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ia-next', onclick: nx }, k + 1 < CH.length ? 'Chapitre suivant →' : '📓 Mon carnet')))); box.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else zone.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ia-next', onclick: nx }, 'Chapitre suivant →')));
  };
  const chap = (k) => { stopV(); i = k; drawRail(); head.textContent = `Chapitre ${k + 1}/7 — ${CH[k].t}`; cur = player(k, () => after(k)); zone.replaceChildren(cur.el); talk('', false); };
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ia-panel' }, UI.closeButton(), h('h2', null, '🤖 La Machine des Idées'), h('p', { class: 'muted' }, 'Découvre comment une intelligence artificielle qui écrit apprend, propose des mots… et pourquoi il faut garder son esprit critique.'), rail, head, zone, say), { label: 'La Machine des Idées', onClose: () => { stopV(); Voice.stop(); } });
  chap(i);
}
