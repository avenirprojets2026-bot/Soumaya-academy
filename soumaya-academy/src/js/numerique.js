// La Tour des Secrets Numériques (FMTTN, évaluation P4 2025 : volet numérique).
// Moteur de recherche (barre, mots-clés, ET/OU/NON), lire une page web (source, URL, date, auteur, pays),
// ranger les fichiers selon leur extension, traitement de texte (clavier, majuscules, gras/italique/puces),
// insérer et rogner une image, et les règles d'or d'Internet avec le hibou.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri, qcm } from './workshop.js';
import * as AR from './armoire.js';
import { playFile } from './papa.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const pick = (a) => a[ri(0, a.length - 1)];
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };

// ---------- 1. le moteur de recherche « Hibou » ----------
const KW = [
  { q: 'Tu veux savoir ce que mange le hérisson.', opts: ['alimentation hérisson', 'je voudrais savoir s’il te plaît', 'animal'], why: 'Les bons mots-clés sont courts et précis : le sujet (hérisson) et ce qu’on cherche (alimentation).' },
  { q: 'Tu cherches la hauteur de l’Atomium à Bruxelles.', opts: ['hauteur Atomium', 'monument', 'Bruxelles ville belle'], why: 'On garde les mots importants : hauteur + Atomium.' },
  { q: 'Tu veux connaître la date de la bataille de Waterloo.', opts: ['date bataille Waterloo', 'bataille', 'Napoléon cheval blanc'], why: 'Date + bataille + Waterloo : la recherche est précise.' },
  { q: 'Tu cherches combien de temps vit une tortue.', opts: ['durée de vie tortue', 'tortue', 'animal lent vert'], why: '« durée de vie » + « tortue » : c’est exactement ce qu’on cherche.' },
];
const OPS = [
  { q: 'Tu veux des recettes de crêpes, mais SANS œufs (ton frère est allergique). Quelle recherche choisis-tu ?', opts: ['crêpes NON œufs', 'crêpes ET œufs', 'crêpes OU œufs'], why: 'NON enlève les pages qui parlent d’œufs.' },
  { q: 'Tu veux des pages qui parlent à la fois des chats ET des chiens.', opts: ['chats ET chiens', 'chats OU chiens', 'chats NON chiens'], why: 'ET : les deux mots doivent être dans la page. La recherche est plus précise.' },
  { q: 'Tu cherches des idées de goûter : une pomme ou une banane, peu importe.', opts: ['goûter pomme OU banane', 'goûter pomme ET banane', 'goûter NON banane'], why: 'OU : l’un ou l’autre, ça te va. On obtient plus de résultats.' },
  { q: 'Quels mots rendent une recherche plus précise ?', opts: ['ET, OU, NON', 'MAIS, DONC, CAR', 'LE, LA, LES'], why: 'Les opérateurs ET, OU et NON servent à affiner la recherche.' },
];
function hibouHome(onBar) {
  const page = h('div', { class: 'nu-browser' },
    h('div', { class: 'nu-tabs' }, h('span', null, '🦉 Hibou'), h('span', { class: 'nu-x' }, '✕')),
    h('div', { class: 'nu-addr', 'data-z': 'url' }, '🔒 https://www.hibou-recherche.be'),
    h('div', { class: 'nu-home' }, h('div', { class: 'nu-logo', 'data-z': 'logo' }, '🦉 Hibou'),
      h('div', { class: 'nu-bar', 'data-z': 'bar', 'data-testid': 'nu-bar' }, '🔍 ', h('span', { class: 'nu-ph' }, 'Que cherches-tu ?')),
      h('div', { class: 'nu-btns' }, h('span', { 'data-z': 'btn' }, 'Rechercher'), h('span', { 'data-z': 'img' }, 'Images'))));
  page.querySelectorAll('[data-z]').forEach((e) => e.addEventListener('click', (ev) => { ev.stopPropagation(); onBar(e.dataset.z, e); }));
  return page;
}
function recherche(body, talk) {
  const zone = h('div');
  body.replaceChildren(zone);
  // étape 1 : trouver la barre de recherche
  zone.replaceChildren(h('p', { class: 'prompt' }, 'Voici la page d’accueil du moteur de recherche Hibou. Touche la barre de recherche.'), hibouHome((z, e) => {
    if (z === 'bar') { star(); Sfx.coin(); e.classList.add('good'); talk('Oui ! C’est dans la barre de recherche qu’on tape ses mots-clés.', false); setTimeout(etape2, 1600); }
    else { Sfx.tap(); talk(z === 'url' ? 'Ça, c’est la barre d’adresse (l’URL du site). La barre de recherche est au milieu de la page.' : z === 'logo' ? 'Ça, c’est le logo du moteur de recherche.' : 'C’est un bouton. Cherche la longue barre où l’on écrit.', false); }
  }));
  talk('Touche la barre de recherche du moteur de recherche.');
  function etape2() {
    zone.replaceChildren(h('p', { class: 'prompt' }, 'Choisis les meilleurs mots-clés, puis les bons opérateurs.'));
    const list = [...shuffle(KW).slice(0, 2), ...shuffle(OPS).slice(0, 2)];
    qcm(zone, talk, list, (o) => zone.append(h('div', { class: 'actions' }, h('span', { class: 'muted' }, `${o}/${list.length}`), h('button', { class: 'btn primary', type: 'button', onclick: () => recherche(body, talk) }, '↻ Recommencer'))));
  }
}


// ---------- 1 bis. les vrais moteurs de recherche (captures d'écran des pages d'accueil, octobre 2026) ----------
// Chemins écrits en entier pour la version « fichier unique ». bar = zone de la barre de recherche (fractions de l'image).
const MOT = [
  { k: 'qwantjunior', n: 'Qwant Junior', img: 'assets/moteurs/qwantjunior.webp', url: 'www.qwantjunior.com', type: '🧒 Pour les enfants', bar: [0.23, 0.42, 0.77, 0.5], info: 'Moteur de recherche français conçu pour les 6-12 ans : les résultats sont filtrés et adaptés aux enfants.', tip: 'Mon premier choix pour chercher seule, accompagnée.' },
  { k: 'kiddle', n: 'Kiddle', img: 'assets/moteurs/kiddle.webp', url: 'www.kiddle.co', type: '🧒 Pour les enfants', bar: [0.25, 0.57, 0.75, 0.65], info: 'Moteur visuel pour les enfants, avec un petit robot rouge. Les résultats sont vérifiés, mais surtout en anglais.', tip: 'Idéal pour les images ; il faut parfois de l’aide pour l’anglais.' },
  { k: 'google', n: 'Google', img: 'assets/moteurs/google.webp', url: 'www.google.be', type: '🌍 Moteur général', bar: [0.23, 0.4, 0.78, 0.48], info: 'Le moteur le plus utilisé au monde. Les résultats viennent de très nombreux sites : il faut vérifier les sources.', tip: 'Avec un adulte, et le filtre SafeSearch activé.' },
  { k: 'bing', n: 'Bing', img: 'assets/moteurs/bing.webp', url: 'www.bing.com', type: '🌍 Moteur général', bar: [0.12, 0.19, 0.76, 0.27], info: 'Le moteur de Microsoft. Sa page d’accueil montre chaque jour une grande photo.', tip: 'Avec un adulte, et le filtre SafeSearch réglé sur « strict ».' },
  { k: 'ecosia', n: 'Ecosia', img: 'assets/moteurs/ecosia.webp', url: 'www.ecosia.org', type: '🌳 Environnement', bar: [0.2, 0.54, 0.8, 0.68], info: 'Ce moteur utilise ses bénéfices pour planter des arbres et soutenir des projets pour la planète.', tip: 'Chercher tout en aidant la nature.' },
  { k: 'qwant', n: 'Qwant', img: 'assets/moteurs/qwant.webp', url: 'www.qwant.com', type: '🔒 Vie privée', bar: [0.23, 0.42, 0.77, 0.5], info: 'Moteur français qui ne garde pas tes recherches et ne vend pas tes données. C’est le « grand frère » de Qwant Junior.', tip: 'Il protège la vie privée.' },
  { k: 'duckduckgo', n: 'DuckDuckGo', img: 'assets/moteurs/duckduckgo.webp', url: 'duckduckgo.com', type: '🔒 Vie privée', bar: [0.24, 0.035, 0.68, 0.105], info: 'Son logo est un canard. Il met en avant la protection de la vie privée.', tip: 'Ici, la barre de recherche est tout en haut !' },
];
function shot(m, onTap) {
  const img = h('img', { class: 'mo-img', src: m.img, alt: 'Page d’accueil de ' + m.n, draggable: 'false' });
  const box = h('div', { class: 'nu-browser mo-br' }, h('div', { class: 'nu-tabs' }, h('span', null, '🌐 Nouvel onglet')), h('div', { class: 'nu-addr', 'data-z': 'url' }, '🔒 https://' + m.url), h('div', { class: 'mo-wrap' }, img));
  if (onTap) {
    box.querySelector('.nu-addr').addEventListener('click', (e) => { e.stopPropagation(); onTap('url', e); });
    img.addEventListener('click', (e) => { const r = img.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height, [x0, y0, x1, y1] = m.bar, pad = 0.025; onTap(x >= x0 - pad && x <= x1 + pad && y >= y0 - pad && y <= y1 + pad ? 'bar' : 'autre', e, x, y); });
  }
  return box;
}
function moteurs(body, talk) {
  const zone = h('div'), sub = h('div', { class: 'actions wrap' });
  const SUB = [['reco', '👀 Reconnaître', reco], ['barre', '🎯 Trouver la barre', barre], ['mots', '🔑 Les mots-clés', mots], ['tri', '🗂️ Moteur ou pas ?', tri], ['reflexes', '🦉 Les bons réflexes', reflexes]];
  sub.append(...SUB.map(([k, l, f]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'mo-' + k, onclick: (e) => { [...sub.children].forEach((b) => b.classList.toggle('primary', b === e.currentTarget)); Voice.stop(); f(); } }, l)));
  body.replaceChildren(h('p', { class: 'muted' }, '🔎 Voici les pages d’accueil de vrais moteurs de recherche (captures d’octobre 2026 : leur apparence peut changer).'), sub, zone);
  function reco() {
    const list = shuffle(MOT); let i = 0, ok = 0;
    const step = () => {
      if (i >= list.length) { if (ok >= 5) { Sfx.win(); burst(body); } zone.replaceChildren(h('p', { class: 'prompt' }, `Bravo : ${ok}/${list.length} moteurs reconnus !`), h('button', { class: 'btn primary', type: 'button', onclick: reco }, '↻ Rejouer')); talk(`Tu as reconnu ${ok} moteurs sur ${list.length} !`, false); return; }
      const m = list[i], host = h('div'), fiche = h('div');
      zone.replaceChildren(h('p', { class: 'prompt' }, `Quel est ce moteur de recherche ? (${i + 1}/${list.length})`), shot(m), host, fiche);
      qcm(host, talk, [{ q: 'Regarde le logo et la page : c’est…', opts: [m.n, ...shuffle(MOT.filter((x) => x !== m)).slice(0, 2).map((x) => x.n)], why: `C’est ${m.n} — ${m.type}.` }], (o) => {
        ok += o; i++;
        fiche.replaceChildren(h('div', { class: 'mo-fiche' }, h('b', null, `${m.n} · ${m.type}`), h('p', null, '📌 ' + m.info), h('p', null, '💡 ' + m.tip)), h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'mo-next', onclick: step }, 'Suivant →')));
      });
    };
    step(); talk('Regarde bien chaque page d’accueil. Reconnais-tu le moteur de recherche ?');
  }
  function barre() {
    const list = shuffle(MOT).slice(0, 5); let i = 0, ok = 0, miss = 0;
    const step = () => {
      if (i >= list.length) { star(2); Sfx.win(); burst(body); zone.replaceChildren(h('p', { class: 'prompt' }, `Bravo ! Tu trouves la barre de recherche partout (${ok} du premier coup sur ${list.length}).`), h('button', { class: 'btn primary', type: 'button', onclick: barre }, '↻ Rejouer')); return; }
      const m = list[i]; miss = 0;
      zone.replaceChildren(h('p', { class: 'prompt' }, `🎯 ${m.n} : touche la BARRE DE RECHERCHE, là où on écrit ses mots-clés. (${i + 1}/${list.length})`), shot(m, (z, e) => {
        if (z === 'bar') { if (!miss) ok++; star(); Sfx.coin(); talk('Oui ! C’est là qu’on tape ses mots-clés.', false); i++; setTimeout(step, 1000); return; }
        miss++; Sfx.ko(); talk(z === 'url' ? 'Piège ! Ça, c’est la barre d’ADRESSE du navigateur : elle sert à aller sur un site précis. La barre de recherche est dans la page.' : m.k === 'duckduckgo' ? 'Ce n’est pas ça. Sur DuckDuckGo, regarde tout en haut de la page !' : 'Ce n’est pas la barre de recherche. Cherche le long rectangle où l’on peut écrire.', false);
      }));
      talk(`Sur ${m.n}, touche la barre de recherche.`, false);
    };
    step();
  }
  function mots() {
    const host = h('div'), eco = MOT.find((m) => m.k === 'ecosia');
    zone.replaceChildren(h('p', { class: 'ac-intro' }, '« Papa ! Regarde, je reconnais Ecosia ! Maintenant, je vais chercher ce que mange une chouette. Mais quels mots dois-je écrire pour obtenir les bons résultats ? »'), shot(eco), host);
    if (Sfx.soundOn()) playFile('assets/voice/moteurs_ecosia.mp3');
    qcm(host, talk, [
      { q: 'Tu veux savoir ce que mange une chouette. Que tapes-tu ?', opts: ['chouette alimentation', 'je voudrais savoir ce que mange une chouette s’il te plaît', 'animal'], why: 'Des mots-clés courts et précis : le sujet (chouette) + ce qu’on cherche (alimentation).' },
      { q: 'Tu cherches des chouettes, mais PAS des peluches. Quelle recherche ?', opts: ['chouette NON peluche', 'chouette ET peluche', 'peluche'], why: 'NON retire les pages qui parlent de peluches.' },
      { q: 'Tu as trouvé une réponse sur un site. Que fais-tu ensuite ?', opts: ['Je regarde qui a écrit la page et je compare avec un autre site', 'Je crois la première réponse sans vérifier', 'Je ferme tout'], why: 'On vérifie la source (auteur, date, site) et on compare plusieurs sites.' },
    ], () => { star(2); host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: mots }, '↻ Rejouer'))); });
  }
  function tri() {
    const ITEMS = shuffle([['Qwant Junior', 'm'], ['Google', 'm'], ['Ecosia', 'm'], ['DuckDuckGo', 'm'], ['Kiddle', 'm'], ['Vikidia', 'e'], ['Wikipédia', 'e'], ['YouTube', 'a'], ['Le site de mon école', 'a']]);
    let i = 0, ok = 0; const cur = h('div', { class: 'ac-item' }), msg = h('p', { class: 'muted' });
    const vik = h('div', { class: 'nu-browser mo-br' }, h('div', { class: 'nu-addr' }, '🔒 https://fr.vikidia.org'), h('div', { class: 'mo-wrap' }, h('img', { class: 'mo-img', src: 'assets/moteurs/vikidia.webp', alt: 'Vikidia' })));
    const nxt = () => { if (i >= ITEMS.length) { cur.textContent = `${ok}/${ITEMS.length} bien classés !`; if (ok >= 7) { star(2); Sfx.win(); burst(body); } return; } cur.textContent = ITEMS[i][0]; };
    const pick = (k) => { if (i >= ITEMS.length) return; const [n, g] = ITEMS[i]; if (g === k) { ok++; Sfx.ok(); } else Sfx.ko(); const W = { m: 'un moteur de recherche : il cherche des pages sur tout Internet.', e: 'une encyclopédie : elle contient des articles écrits et vérifiés par des rédacteurs.', a: 'un site avec son propre contenu (vidéos, informations…).' }; msg.textContent = `${n}, c’est ${W[g]}`; talk(msg.textContent, false); i++; setTimeout(nxt, 900); };
    zone.replaceChildren(h('p', { class: 'prompt' }, 'Moteur de recherche, encyclopédie ou autre site ? Vikidia est une encyclopédie pour les jeunes (8-13 ans) : on y lit des articles, ce n’est pas un moteur de recherche.'), vik, cur,
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn', type: 'button', 'data-testid': 'mo-t-m', onclick: () => pick('m') }, '🔎 Moteur de recherche'), h('button', { class: 'btn', type: 'button', 'data-testid': 'mo-t-e', onclick: () => pick('e') }, '📚 Encyclopédie'), h('button', { class: 'btn', type: 'button', 'data-testid': 'mo-t-a', onclick: () => pick('a') }, '🌐 Autre site')), msg);
    nxt();
  }
  function reflexes() {
    const host = h('div'); zone.replaceChildren(host);
    qcm(host, talk, shuffle([
      { q: 'Quel moteur est conçu spécialement pour les enfants de ton âge ?', opts: ['Qwant Junior', 'Bing', 'DuckDuckGo'], why: 'Qwant Junior est fait pour les 6-12 ans (Kiddle aussi, mais surtout en anglais).' },
      { q: 'Tu veux utiliser Google ou Bing. Que demande-t-on à un adulte ?', opts: ['D’activer le filtre SafeSearch, le plus strict', 'De désactiver tous les filtres', 'Rien du tout'], why: 'Le filtre SafeSearch cache les contenus qui ne sont pas pour les enfants.' },
      { q: 'Quel moteur plante des arbres grâce à ses bénéfices ?', opts: ['Ecosia', 'Google', 'Kiddle'], why: 'Ecosia soutient la plantation d’arbres.' },
      { q: 'Qwant et DuckDuckGo mettent en avant…', opts: ['la protection de la vie privée', 'les jeux vidéo', 'les recettes de cuisine'], why: 'Ils ne gardent pas l’historique de tes recherches pour te connaître.' },
      { q: 'La barre en haut du navigateur (avec https://…), c’est…', opts: ['la barre d’adresse : pour aller sur un site précis', 'la barre de recherche du moteur', 'une publicité'], why: 'La barre d’adresse contient l’URL du site. La barre de recherche, elle, est dans la page du moteur.' },
    ]).slice(0, 4), () => { star(2); host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: reflexes }, '↻ Rejouer'))); });
  }
  sub.firstChild.click();
}

// ---------- 2. lire une page web ----------
const SITES = [
  { src: 'Nature Junior', url: 'https://www.naturejunior.be/le-herisson', date: '12 mars 2025', who: 'Lucie Martin', title: 'Le hérisson, un petit chasseur de la nuit', pays: ['.be', 'la Belgique'] },
  { src: 'Le Petit Savant', url: 'https://www.petitsavant.fr/volcans', date: '3 juin 2024', who: 'Hugo Bernard', title: 'Comment naît un volcan ?', pays: ['.fr', 'la France'] },
  { src: 'Les Explorateurs', url: 'https://www.explorateurs.ch/glaciers', date: '28 janvier 2025', who: 'Nina Weber', title: 'Les glaciers fondent-ils ?', pays: ['.ch', 'la Suisse'] },
  { src: 'Science Ado', url: 'https://www.scienceado.ca/abeilles', date: '9 septembre 2024', who: 'Léa Tremblay', title: 'Pourquoi les abeilles sont-elles importantes ?', pays: ['.ca', 'le Canada'] },
];
const PAYS = [['.be', 'la Belgique'], ['.fr', 'la France'], ['.ch', 'la Suisse'], ['.ca', 'le Canada'], ['.lu', 'le Luxembourg'], ['.nl', 'les Pays-Bas']];
function pageWeb(body, talk) {
  const s = pick(SITES), host = s.url.replace('https://', '').split('/')[0];
  const page = h('div', { class: 'nu-browser' },
    h('div', { class: 'nu-tabs' }, h('span', null, `📄 ${s.src}`)),
    h('div', { class: 'nu-addr', 'data-z': 'url' }, `🔒 ${s.url}`),
    h('div', { class: 'nu-page' },
      h('div', { class: 'nu-site', 'data-z': 'src' }, `🌿 ${s.src}`),
      h('h3', { 'data-z': 'title' }, s.title),
      h('div', { class: 'nu-meta' }, h('span', { class: 'nu-av', 'data-z': 'photo' }, '👩‍🔬'), h('span', { 'data-z': 'who' }, `Par ${s.who}`), h('span', { 'data-z': 'date' }, `Publié le ${s.date}`)),
      h('p', { class: 'nu-lorem', 'data-z': 'text' }, 'Ce texte explique le sujet avec des mots simples, des photos et des schémas…')));
  const TASKS = shuffle([['src', 'le nom de la SOURCE (le site)'], ['url', 'l’ADRESSE du site (l’URL)'], ['date', 'la DATE de publication'], ['photo', 'la PHOTO de l’auteur']]);
  const NAMES = { src: 'le nom de la source', url: 'l’adresse (URL)', date: 'la date de publication', photo: 'la photo de l’auteur', who: 'le nom de l’auteur', title: 'le titre de l’article', text: 'le texte de l’article' };
  let i = 0, ok = 0; const head = h('p', { class: 'prompt' }), after = h('div');
  page.querySelectorAll('[data-z]').forEach((e) => e.addEventListener('click', () => {
    const t = TASKS[i]; if (!t) return;
    if (e.dataset.z === t[0]) { ok++; star(); Sfx.coin(); e.classList.add('good'); talk('Oui !', false); i++; setTimeout(next, 900); } else { Sfx.tap(); talk(`Ça, c’est ${NAMES[e.dataset.z]}. Cherche encore !`, false); }
  }));
  function next() {
    if (i < TASKS.length) { head.textContent = `Touche ${TASKS[i][1]}. (${i + 1}/${TASKS.length + 1})`; talk(`Touche ${TASKS[i][1]}.`); return; }
    head.textContent = `Dernière question : de quel pays vient ce site ? Regarde la fin de son adresse : ${host}`;
    qcm(after, talk, [{ q: `L’adresse se termine par « ${s.pays[0]} ». De quel pays vient ce site ?`, opts: [s.pays[1], ...shuffle(PAYS.filter((p) => p[0] !== s.pays[0])).slice(0, 2).map((p) => p[1])], why: `${s.pays[0]} = ${s.pays[1]}. Autres extensions : .be Belgique, .fr France, .ch Suisse, .lu Luxembourg, .ca Canada.` }],
      () => after.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => pageWeb(body, talk) }, '↻ Une autre page'))));
  }
  body.replaceChildren(head, page, after);
  next();
}


// ---------- 2 bis. les pièges de la page web (deux photos, plusieurs dates, plusieurs noms, plusieurs adresses) ----------
const PIEGES = [
  { src: 'Nature Junior', url: 'https://www.naturejunior.be/herisson', title: 'Le hérisson, un petit chasseur de la nuit', who: 'Lucie Martin', av: '👩‍🔬', pub: '12 mars 2025', maj: '2 avril 2025', pic: '🦔', cred: 'Marc Dupont', tdate: 'Depuis 1998', text: ', le hérisson est une espèce protégée en Belgique. Il mange des insectes, des vers et des limaces.', expert: 'Selon Paul Leroy, vétérinaire', ex: '« Il ne faut jamais lui donner de lait ! »', link: 'www.refuge-herissons.be', com: 'Tom, 9 ans', comd: '3 mai 2025', comt: 'J’en ai vu un dans mon jardin !', ad: 'Super Jouets', adurl: 'www.superjouets.com' },
  { src: 'Le Petit Savant', url: 'https://www.petitsavant.fr/volcans', title: 'Comment naît un volcan ?', who: 'Hugo Bernard', av: '👨‍🏫', pub: '3 juin 2024', maj: '15 janvier 2025', pic: '🌋', cred: 'Sofia Rossi', tdate: 'Le 24 août de l’an 79', text: ', le Vésuve a recouvert de cendres la ville de Pompéi. La lave vient du magma, sous la croûte terrestre.', expert: 'Selon Anne Moreau, volcanologue', ex: '« Un volcan peut dormir des siècles. »', link: 'www.musee-volcans.fr', com: 'Inès, 10 ans', comd: '8 février 2025', comt: 'Trop bien expliqué !', ad: 'Glaces Polaires', adurl: 'www.glaces-polaires.com' },
  { src: 'Science Ado', url: 'https://www.scienceado.ca/abeilles', title: 'Pourquoi les abeilles sont-elles importantes ?', who: 'Léa Tremblay', av: '👩‍💻', pub: '9 septembre 2024', maj: '20 mars 2025', pic: '🐝', cred: 'Jean Gagnon', tdate: 'Le 20 mai', text: ', c’est la Journée mondiale des abeilles. En butinant, elles transportent le pollen de fleur en fleur.', expert: 'Selon Marc Dubois, apiculteur', ex: '« Une ruche peut abriter 50 000 abeilles. »', link: 'www.ruche-ecole.ca', com: 'Sami, 8 ans', comd: '2 avril 2025', comt: 'Mon papy a des ruches !', ad: 'Bonbons Arc-en-ciel', adurl: 'www.bonbons-arcenciel.com' },
];
const PTASKS = [
  { z: 'pub', ask: 'la date de PUBLICATION de l’article', traps: { maj: 'Piège ! C’est la date de MISE À JOUR : l’article a été modifié ce jour-là, mais il a été publié avant.', tdate: 'Piège ! Cette date est dans le texte : elle parle d’un événement, pas du jour où l’article a été publié.', comd: 'Piège ! C’est la date d’un commentaire écrit par un lecteur.' } },
  { z: 'maj', ask: 'la date de la dernière MISE À JOUR', traps: { pub: 'Ça, c’est la date de publication (la première fois que l’article a été mis en ligne). Cherche la date de mise à jour.', tdate: 'Cette date fait partie du texte de l’article.', comd: 'C’est la date d’un commentaire.' } },
  { z: 'av', ask: 'la PHOTO DE L’AUTEUR', traps: { pic: 'Piège ! Ça, c’est la photo qui illustre l’article. La photo de l’auteur est petite, à côté de son nom.' } },
  { z: 'pic', ask: 'la photo qui ILLUSTRE l’article', traps: { av: 'Ça, c’est la petite photo de l’auteur. Cherche la grande photo qui montre le sujet de l’article.' } },
  { z: 'who', ask: 'le nom de l’AUTEUR (celui qui a écrit l’article)', traps: { cred: 'Piège ! C’est le PHOTOGRAPHE : il a pris la photo, mais il n’a pas écrit l’article.', expert: 'Piège ! C’est un spécialiste CITÉ dans l’article : on rapporte ses paroles, mais ce n’est pas l’auteur.', com: 'Piège ! C’est un lecteur qui a laissé un commentaire.' } },
  { z: 'url', ask: 'l’ADRESSE (URL) du site que tu es en train de lire', traps: { adurl: 'Piège ! C’est l’adresse de la PUBLICITÉ : c’est un autre site.', link: 'Piège ! C’est un LIEN vers un autre site, en bas de la page.' } },
  { z: 'src', ask: 'le NOM DU SITE (la source)', traps: { ad: 'Piège ! C’est le nom de la marque de la PUBLICITÉ, pas le site que tu lis.' } },
  { z: ['ad', 'adurl'], ask: 'la PUBLICITÉ', traps: {} },
];
const PNAMES = { url: 'l’adresse du site', src: 'le nom du site', title: 'le titre', who: 'le nom de l’auteur', av: 'la photo de l’auteur', pub: 'la date de publication', maj: 'la date de mise à jour', pic: 'la photo de l’article', cred: 'le nom du photographe', tdate: 'une date dans le texte', expert: 'un spécialiste cité', link: 'un lien vers un autre site', com: 'le nom d’un lecteur', comd: 'la date d’un commentaire', ad: 'une publicité', adurl: 'l’adresse de la publicité', text: 'le texte' };
function pieges(body, talk) {
  const s = pick(PIEGES), z = (k, tag, attrs, ...kids) => h(tag, { ...(attrs || {}), 'data-z': k }, ...kids);
  const page = h('div', { class: 'nu-browser' },
    h('div', { class: 'nu-tabs' }, h('span', null, `📄 ${s.src}`)),
    z('url', 'div', { class: 'nu-addr' }, `🔒 ${s.url}`),
    h('div', { class: 'nu-page' },
      h('div', { class: 'nu-ad' }, h('small', null, 'PUBLICITÉ'), z('ad', 'b', null, `🎁 ${s.ad}`), z('adurl', 'span', { class: 'nu-adurl' }, s.adurl)),
      z('src', 'div', { class: 'nu-site' }, `🌿 ${s.src}`),
      z('title', 'h3', null, s.title),
      h('div', { class: 'nu-meta' }, z('av', 'span', { class: 'nu-av' }, s.av), z('who', 'span', null, `Par ${s.who}`), z('pub', 'span', null, `Publié le ${s.pub}`), z('maj', 'span', null, `Mis à jour le ${s.maj}`)),
      h('figure', { class: 'nu-fig' }, z('pic', 'div', { class: 'nu-bigpic' }, s.pic), h('figcaption', null, 'Photo : ', z('cred', 'span', null, s.cred))),
      h('p', { class: 'nu-art' }, z('tdate', 'span', null, s.tdate), s.text, ' ', z('expert', 'span', null, s.expert), ' : ', h('i', null, s.ex)),
      h('p', { class: 'nu-art' }, 'En savoir plus : ', z('link', 'span', { class: 'nu-link' }, s.link)),
      h('div', { class: 'nu-com' }, h('small', null, '💬 Commentaires'), h('div', null, z('com', 'b', null, s.com), ' — ', z('comd', 'span', null, s.comd), ' : ', s.comt))));
  const tasks = shuffle(PTASKS).slice(0, 5); let i = 0, ok = 0, miss = 0; const head = h('p', { class: 'prompt' }), after = h('div');
  page.querySelectorAll('[data-z]').forEach((e) => e.addEventListener('click', (ev) => {
    ev.stopPropagation(); const t = tasks[i]; if (!t) return; const k = e.dataset.z;
    if ([].concat(t.z).includes(k)) { ok++; star(); Sfx.coin(); e.classList.add('good'); talk(miss ? 'Oui, cette fois c’est la bonne !' : 'Oui ! Tu ne t’es pas fait piéger !', false); i++; miss = 0; setTimeout(next, 1000); }
    else { miss++; Sfx.ko(); e.classList.add('trap'); setTimeout(() => e.classList.remove('trap'), 900); talk(t.traps[k] || `Ça, c’est ${PNAMES[k] || 'autre chose'}. Cherche ${t.ask}.`); }
  }));
  function next() {
    if (i < tasks.length) { head.textContent = `🕵️ Attention aux pièges ! Touche ${tasks[i].ask}. (${i + 1}/${tasks.length})`; talk(`Touche ${tasks[i].ask}.`); return; }
    head.textContent = '🕵️ Dernières questions de détective :';
    qcm(after, talk, shuffle([
      { q: `Qui a écrit cet article ?`, opts: [s.who, s.cred, s.expert.replace('Selon ', '').split(',')[0]], why: `L’auteur est ${s.who} (« Par ${s.who} »). ${s.cred} a pris la photo, et le spécialiste est seulement cité.` },
      { q: `L’article est publié le ${s.pub} et mis à jour le ${s.maj}. Quelle date montre que l’information a été revue le plus récemment ?`, opts: [s.maj, s.pub, s.comd], why: 'La date de mise à jour indique la dernière fois que l’auteur a modifié son article.' },
      { q: `Tu cliques sur « ${s.adurl} ». Où vas-tu ?`, opts: ['Sur un autre site : celui de la publicité', `Sur une autre page de ${s.src}`, 'Nulle part, ce n’est pas un lien'], why: 'Une publicité mène vers le site d’une marque : ce n’est plus la source que tu lisais.' },
    ]).slice(0, 2), () => after.append(h('div', { class: 'actions' }, h('span', { class: 'muted' }, `${ok}/${tasks.length} pièges évités`), h('button', { class: 'btn primary', type: 'button', onclick: () => pieges(body, talk) }, '↻ Une autre page piégée'))));
    if (ok >= 4) { Sfx.win(); burst(body); }
  }
  body.replaceChildren(head, page, after);
  next();
}

// ---------- 3. ranger les fichiers ----------
const FILES = [
  ['chat.jpg', 'img'], ['vacances.png', 'img'], ['dessin.gif', 'img'], ['carte.jpeg', 'img'],
  ['expose.docx', 'doc'], ['devoirs.pdf', 'doc'], ['poeme.odt', 'doc'], ['liste.txt', 'doc'],
  ['anniversaire.mp4', 'vid'], ['spectacle.avi', 'vid'], ['film.mov', 'vid'],
  ['chanson.mp3', 'mus'], ['piano.wav', 'mus'], ['comptine.ogg', 'mus'],
];
const DRAWERS = [['img', '🖼️ Images', '#3a6ad8'], ['doc', '📄 Documents', '#2fa36a'], ['vid', '🎬 Vidéos', '#d8a82a'], ['mus', '🎵 Musiques', '#d84a7a']];
function fichiers(body, talk) {
  // le rangement se fait maintenant dans l'armoire magique du décor
  if (!fichiers.legacy) { body.replaceChildren(h('p', { class: 'prompt' }, 'Les fichiers se rangent maintenant dans l’armoire magique aux quatre tiroirs colorés de la Tour !'), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'nu-armoire', onclick: () => AR.open() }, '🗄️ Ouvrir l’armoire magique')); talk('Viens ranger les fichiers dans l’armoire magique !', false); return; }
  const pool = shuffle(FILES).slice(0, 8); let i = 0, ok = 0;
  const cur = h('div', { class: 'nu-file' }), msg = h('p', { class: 'muted' });
  const show = () => {
    if (i >= pool.length) { cur.replaceChildren(h('b', null, `${ok}/${pool.length} fichiers bien rangés !`)); talk(`Bravo, ${ok} fichiers bien rangés sur ${pool.length} !`); if (ok >= 6) { Sfx.win(); burst(body); } msg.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => fichiers(body, talk) }, '↻ Recommencer')); return; }
    const [n] = pool[i], dot = n.lastIndexOf('.');
    cur.replaceChildren(h('span', { class: 'nu-ficon' }, '📁'), h('b', null, n.slice(0, dot)), h('b', { class: 'nu-ext' }, n.slice(dot)));
  };
  const drawers = DRAWERS.map(([k, l, c]) => h('button', { class: 'nu-drawer', type: 'button', style: `--c:${c}`, 'data-testid': 'nu-drawer', onclick: () => {
    const f = pool[i]; if (!f) return;
    if (f[1] === k) { ok++; star(); Sfx.bloop(); talk(`Oui : l’extension ${f[0].slice(f[0].lastIndexOf('.'))} va dans ${l.slice(3)}.`, false); } else { Sfx.tap(); talk(`Non : l’extension ${f[0].slice(f[0].lastIndexOf('.'))}, c’est un fichier de type ${DRAWERS.find((d) => d[0] === f[1])[1].slice(3)}.`, false); }
    i++; setTimeout(show, 1500);
  } }, l));
  body.replaceChildren(h('p', { class: 'prompt' }, 'Regarde l’extension du fichier (les lettres après le point) et range-le dans le bon tiroir.'), cur, h('div', { class: 'nu-drawers' }, ...drawers), msg,
    h('p', { class: 'muted ws-memo' }, 'Images : .jpg .jpeg .png .gif · Documents : .docx .odt .pdf .txt · Vidéos : .mp4 .avi .mov · Musiques : .mp3 .wav .ogg'));
  talk('Range chaque fichier dans le bon tiroir. Regarde bien son extension, les lettres après le point.');
  show();
}

// ---------- 4. traitement de texte ----------
const ROWS = ['azertyuiop', 'qsdfghjklm', 'wxcvbn', 'éèàçù\'.,!?'];
function texte(body, talk) {
  const tabs = h('div', { class: 'actions wrap' }), zone = h('div');
  body.replaceChildren(tabs, zone);
  const go = (k) => { [...tabs.children].forEach((b) => b.classList.toggle('primary', b.dataset.k === k)); (k === 'clavier' ? clavier : mise)(); };
  tabs.append(...[['clavier', '⌨️ Taper au clavier'], ['mise', '🅱️ Gras, italique, puces']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-k': k, 'data-testid': 'nu-t-' + k, onclick: () => go(k) }, l)));
  function clavier() {
    const PH = ['Élise aime l’été.', 'À Liège, il pleut.', 'Écoute bien Papa !', 'Le chat de Soumaya dort.'];
    const target = pick(PH).replace('’', '\''); let txt = '', shift = false, caps = false;
    const out = h('div', { class: 'nu-doc', 'data-testid': 'nu-doc' }), keyEls = [];
    const draw = () => { out.textContent = txt; out.append(h('span', { class: 'nu-caret' }, '|')); keyEls.forEach((b) => { if (b.dataset.ch) b.textContent = (shift || caps) ? b.dataset.ch.toUpperCase() : b.dataset.ch; }); sh.classList.toggle('primary', shift); cp.classList.toggle('primary', caps); };
    const type = (ch) => { txt += (shift || caps) ? ch.toUpperCase() : ch; shift = false; Sfx.tap(); draw(); };
    const rows = ROWS.map((r) => h('div', { class: 'nu-row' }, ...[...r].map((ch) => { const b = h('button', { class: 'nu-k', type: 'button', 'data-ch': ch, onclick: () => type(ch) }, ch); keyEls.push(b); return b; })));
    const sh = h('button', { class: 'nu-k wide', type: 'button', 'data-testid': 'nu-shift', onclick: () => { shift = !shift; draw(); } }, '⇧ Maj');
    const cp = h('button', { class: 'nu-k wide', type: 'button', onclick: () => { caps = !caps; draw(); } }, '⇪ Verr. Maj');
    const bottom = h('div', { class: 'nu-row' }, cp, sh, h('button', { class: 'nu-k space', type: 'button', 'data-testid': 'nu-space', onclick: () => { txt += ' '; draw(); } }, 'espace'), h('button', { class: 'nu-k wide', type: 'button', onclick: () => { txt = txt.slice(0, -1); draw(); } }, '⌫'));
    zone.replaceChildren(h('p', { class: 'prompt' }, `Recopie exactement cette phrase : « ${target} »`), out, h('div', { class: 'nu-kb' }, ...rows, bottom),
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'nu-check', onclick: () => {
        if (txt === target) { star(2); Sfx.win(); burst(body); talk('Parfait ! Majuscules, accents et ponctuation : tout est juste !'); }
        else { const k = [...target].findIndex((c, j) => txt[j] !== c); talk(`Pas encore : regarde le caractère n°${k + 1}${target[k] === target[k].toUpperCase() && target[k] !== target[k].toLowerCase() ? ' (c’est une majuscule : appuie sur ⇧ Maj avant la lettre)' : ''}.`, false); }
      } }, '✓ Vérifier'), h('span', { class: 'muted ws-memo' }, 'Majuscule (même accentuée comme É ou À) : appuie sur ⇧ Maj, puis sur la lettre.')));
    talk('Recopie la phrase. Pour une majuscule, appuie d’abord sur la touche Majuscule.');
    draw();
  }
  function mise() {
    const words = 'La nuit , le hérisson part chercher des escargots dans le jardin .'.split(' ');
    const list = ['des escargots', 'des vers de terre', 'des insectes'];
    const st = words.map(() => ({ b: false, i: false })); let sel = new Set(), bullets = false, listSel = false;
    const TASKS = shuffle([{ k: 'b', w: 'hérisson', t: 'Mets le mot « hérisson » en GRAS.' }, { k: 'i', w: 'nuit', t: 'Mets le mot « nuit » en ITALIQUE.' }]).concat([{ k: 'p', t: 'Transforme la liste de ce qu’il mange en LISTE À PUCES (touche la liste puis le bouton •).' }]);
    let ti = 0;
    const doc = h('div', { class: 'nu-doc rich' }), head = h('p', { class: 'prompt' });
    const draw = () => {
      doc.replaceChildren(h('p', null, ...words.map((w, j) => { const s = h('span', { class: 'nu-w' + (sel.has(j) ? ' sel' : ''), style: `${st[j].b ? 'font-weight:900;' : ''}${st[j].i ? 'font-style:italic;' : ''}`, onclick: () => { sel = new Set([j]); listSel = false; draw(); } }, w); return [s, ' ']; }).flat()),
        h('p', null, 'Il mange :'), bullets ? h('ul', { class: 'nu-list' }, ...list.map((l) => h('li', null, l))) : h('div', { class: 'nu-list' + (listSel ? ' sel' : ''), 'data-testid': 'nu-list', onclick: () => { listSel = true; sel = new Set(); draw(); } }, ...list.map((l) => h('div', null, l))));
    };
    const ask = () => { if (ti >= TASKS.length) { head.textContent = '🌟 Ton document est parfaitement mis en forme !'; talk(head.textContent); Sfx.win(); burst(body); return; } head.textContent = TASKS[ti].t; talk(TASKS[ti].t); };
    const apply = (k) => {
      const T = TASKS[ti]; if (!T) return;
      if (k === 'p') { if (!listSel) { talk('Touche d’abord la liste pour la sélectionner.', false); return; } if (T.k === 'p') { bullets = true; star(); Sfx.coin(); ti++; draw(); ask(); } else talk('Ce n’est pas ce qu’on te demande.', false); return; }
      if (!sel.size) { talk('Touche d’abord un mot pour le sélectionner.', false); return; }
      const j = [...sel][0]; st[j][k] = !st[j][k]; draw();
      if (T.k === k && words[j] === T.w && st[j][k]) { star(); Sfx.coin(); ti++; sel = new Set(); draw(); setTimeout(ask, 600); }
      else talk(T.k !== k ? `Attention : ${k === 'b' ? 'G, c’est le gras' : 'I, c’est l’italique'}. Relis la consigne.` : 'Ce n’est pas le bon mot. Relis la consigne.', false);
    };
    const bar = h('div', { class: 'nu-toolbar' }, h('button', { class: 'nu-tool', type: 'button', 'data-testid': 'nu-bold', onclick: () => apply('b') }, h('b', null, 'G')), h('button', { class: 'nu-tool', type: 'button', 'data-testid': 'nu-ital', onclick: () => apply('i') }, h('i', null, 'I')), h('button', { class: 'nu-tool', type: 'button', 'data-testid': 'nu-bul', onclick: () => apply('p') }, '• ≡'));
    zone.replaceChildren(head, bar, doc, h('p', { class: 'muted ws-memo' }, 'G = gras · I = italique · • = liste à puces. On sélectionne d’abord, puis on clique sur le bouton.'));
    draw(); ask();
  }
  go('clavier');
}

// ---------- 5. insérer et rogner une image ----------
function image(body, talk) {
  const W = 360, H = 240;
  const pic = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'nu-pic', 'data-testid': 'nu-pic' });
  pic.append(sv('rect', { width: W, height: H, fill: '#1b2a5a' }), sv('circle', { cx: 300, cy: 50, r: 28, fill: '#ffe9a8' }),
    sv('rect', { x: 40, y: 120, width: 26, height: 120, fill: '#5a3a22' }), sv('circle', { cx: 53, cy: 110, r: 46, fill: '#2f7a3a' }),
    sv('text', { x: 190, y: 160, style: 'font-size:70px;text-anchor:middle' }, '🦉'), sv('text', { x: 120, y: 60, style: 'font-size:24px' }, '⭐'), sv('text', { x: 230, y: 220, style: 'font-size:22px' }, '🍄'));
  const T = [150, 95, 230, 175]; // zone de la chouette
  let rc = null, start = null;
  const box = sv('rect', { class: 'nu-crop', x: 0, y: 0, width: 0, height: 0 }); pic.append(box);
  const pt = (e) => { const p = pic.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(pic.getScreenCTM().inverse()); };
  pic.addEventListener('pointerdown', (e) => { start = pt(e); pic.setPointerCapture(e.pointerId); });
  pic.addEventListener('pointermove', (e) => { if (!start) return; const p = pt(e); rc = [Math.min(start.x, p.x), Math.min(start.y, p.y), Math.max(start.x, p.x), Math.max(start.y, p.y)]; box.setAttribute('x', rc[0]); box.setAttribute('y', rc[1]); box.setAttribute('width', rc[2] - rc[0]); box.setAttribute('height', rc[3] - rc[1]); });
  pic.addEventListener('pointerup', () => { start = null; });
  const doc = h('div', { class: 'nu-doc page' }, h('h4', null, 'La chouette, reine de la nuit'), h('div', { class: 'nu-slot', 'data-testid': 'nu-slot' }, 'Ton image ici'), h('p', null, 'La chouette chasse la nuit. Ses grands yeux voient dans le noir.'));
  const check = () => {
    if (!rc) { talk('Fais glisser ton doigt sur l’image pour dessiner le cadre.', false); return; }
    const ix = Math.max(0, Math.min(rc[2], T[2]) - Math.max(rc[0], T[0])), iy = Math.max(0, Math.min(rc[3], T[3]) - Math.max(rc[1], T[1])), inter = ix * iy, uni = (rc[2] - rc[0]) * (rc[3] - rc[1]) + (T[2] - T[0]) * (T[3] - T[1]) - inter, iou = inter / uni;
    if (iou > 0.45) {
      star(2); Sfx.win(); burst(body);
      const crop = sv('svg', { viewBox: `${rc[0]} ${rc[1]} ${rc[2] - rc[0]} ${rc[3] - rc[1]}`, class: 'nu-cropped' }); [...pic.children].filter((c) => c !== box).forEach((c) => crop.append(c.cloneNode(true)));
      doc.querySelector('.nu-slot').replaceChildren(crop); talk('Bravo ! Tu as rogné l’image pour ne garder que la chouette, et tu l’as insérée dans le document.');
    } else talk(inter / ((T[2] - T[0]) * (T[3] - T[1])) < 0.6 ? 'Ton cadre coupe la chouette : elle doit être entière dans le cadre.' : 'Ton cadre est trop grand : rogne plus près de la chouette.', false);
  };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Rogne l’image pour ne garder que la chouette (dessine un cadre autour d’elle), puis insère-la dans le document.'),
    h('div', { class: 'mi-lab' }, h('div', { class: 'mi-left' }, pic, h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'nu-insert', onclick: check }, '✂️ Rogner et insérer'), h('button', { class: 'btn small', type: 'button', onclick: () => image(body, talk) }, '↺'))), doc));
  talk('Rogner une image, c’est couper les bords pour garder seulement la partie qui nous intéresse. Dessine un cadre autour de la chouette.');
}

// ---------- 6. les règles d'or d'Internet ----------
function regles(body, talk) {
  const host = h('div'); body.replaceChildren(h('p', { class: 'prompt' }, '🦉 Le hibou gardien t’explique les règles d’or d’Internet.'), host);
  qcm(host, talk, shuffle([
    { q: 'Un inconnu te demande ton adresse dans un jeu en ligne. Que fais-tu ?', opts: ['Je ne la donne pas et j’en parle à un adulte', 'Je la donne, il a l’air gentil', 'Je lui donne seulement ma rue'], why: 'On ne donne jamais ses informations personnelles (adresse, téléphone, école) sur Internet.' },
    { q: 'Ton mot de passe, tu peux le donner…', opts: ['seulement à tes parents', 'à ta meilleure amie', 'à tout le monde'], why: 'Un mot de passe est secret : seulement tes parents peuvent le connaître.' },
    { q: 'Une information trouvée sur Internet est-elle toujours vraie ?', opts: ['Non, il faut vérifier la source', 'Oui, toujours', 'Oui, si la page est jolie'], why: 'N’importe qui peut écrire sur Internet : on vérifie la source et on compare plusieurs sites.' },
    { q: 'Tu vois une image qui te met mal à l’aise. Que fais-tu ?', opts: ['Je ferme la page et j’en parle à un adulte', 'Je la montre à mes copains', 'Je ne dis rien à personne'], why: 'On en parle toujours à un adulte de confiance.' },
    { q: 'Avant de publier la photo d’un copain, il faut…', opts: ['lui demander son accord', 'rien du tout', 'la retoucher'], why: 'On demande toujours l’accord de la personne avant de publier sa photo.' },
  ]).slice(0, 4), (o) => host.append(h('div', { class: 'actions' }, h('span', { class: 'muted' }, `${o}/4`), h('button', { class: 'btn primary', type: 'button', onclick: () => regles(body, talk) }, '↻ Rejouer'))));
}

export function open(tab = 'recherche') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['recherche', '🔍 Le moteur de recherche', recherche], ['moteurs', '🔎 Les vrais moteurs', moteurs], ['page', '📄 Lire une page web', pageWeb], ['pieges', '🕵️ Les pièges de la page', pieges], ['fichiers', '🗂️ Ranger les fichiers', fichiers], ['texte', '⌨️ Traitement de texte', texte], ['image', '✂️ Rogner une image', image], ['regles', '🦉 Les règles d’or', regles]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'nu-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel nu-panel' }, UI.closeButton(), h('h2', null, '💻 La Tour des Secrets Numériques'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Tour numérique', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
