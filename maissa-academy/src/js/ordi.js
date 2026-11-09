// L'ordinateur de Maissa (Tour numérique) : elle a sorti son portable du tiroir, l'a posé sur la grande coiffeuse
// et explique à Papa, écran à l'appui : navigateur, barre d'adresse, moteur de recherche, résultats et annonces,
// onglets / retour / favoris, historique. On voit l'écran « par-dessus son épaule » (curseur et frappe animés).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { playFile } from './papa.js';
import { burst, shuffle } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const voice = (k) => { if (Sfx.soundOn()) playFile(`assets/voice/${k}.ogg`); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const STEPS = [
  { k: 'ordi_1', t: 'Le navigateur', s: 'J’allume l’ordinateur et j’ouvre le navigateur : c’est le programme qui me permet d’aller sur Internet. Il y en a plusieurs : Chrome, Firefox, Edge ou Safari.', p: 'Ah d’accord ! Et le navigateur, ce n’est pas Internet lui-même ?', p2: 'Non papa : Internet, c’est le grand réseau. Le navigateur, c’est la fenêtre pour le regarder !', d: 14000 },
  { k: 'ordi_2', t: 'La barre d’adresse', s: 'En haut, il y a la barre d’adresse. J’écris l’adresse du site. Le petit cadenas veut dire que la connexion est sécurisée, et « .be » veut dire que c’est un site belge !', p: 'Et si c’était « .fr » ?', p2: 'Ce serait un site français ! Et « .com », c’est souvent une entreprise.', d: 15000 },
  { k: 'ordi_3', t: 'Le moteur de recherche', s: 'Pour chercher une information, j’utilise un moteur de recherche, comme Google, Bing, Qwant ou Ecosia. J’écris des mots-clés, pas une longue phrase : « capitale Belgique ». Et j’appuie sur Entrée.', p: 'Pourquoi pas une phrase entière ?', p2: 'Parce que le moteur cherche les mots importants. Avec des mots-clés, c’est plus rapide !', d: 14500 },
  { k: 'ordi_4', t: 'Les résultats', s: 'Voilà les résultats ! Attention papa : ceux qui sont marqués « Annonce » sont des publicités. Je choisis plutôt un site fiable, comme une encyclopédie.', p: 'Très bien vu, ma chérie ! On ne clique pas sur le premier venu.', d: 12000 },
  { k: 'ordi_5', t: 'Onglets, retour, favoris', s: 'Je peux ouvrir plusieurs onglets, revenir en arrière avec la flèche, et ajouter le site à mes favoris avec la petite étoile.', p: 'Génial, comme ça tu retrouves tes sites préférés !', d: 9300 },
  { k: 'ordi_6', t: 'L’historique', s: 'L’historique garde la liste des sites que j’ai visités. Et quand j’ai fini, je ferme le navigateur. Tu vois papa, c’est facile !', p: 'Je suis fier de toi, Maissa ! Tu m’as tout appris. 💙', d: 11700 },
];

function screenFx(scr) {
  const cur = h('i', { class: 'oc-cursor' }); let typing = 0;
  const point = async (el, click = true) => { if (!el || !scr.isConnected) return; const a = scr.getBoundingClientRect(), b = el.getBoundingClientRect(); cur.style.left = (b.left - a.left + b.width / 2) + 'px'; cur.style.top = (b.top - a.top + b.height / 2) + 'px'; await wait(750); if (click) { cur.classList.remove('clk'); void cur.offsetWidth; cur.classList.add('clk'); el.classList.add('oc-press'); Sfx.coin(); await wait(350); el.classList.remove('oc-press'); } };
  const type = (el, txt, speed = 85) => new Promise((ok) => { clearInterval(typing); let i = 0; el.textContent = ''; typing = setInterval(() => { if (!scr.isConnected) { clearInterval(typing); return ok(); } el.textContent = txt.slice(0, ++i); if (i >= txt.length) { clearInterval(typing); ok(); } }, speed); });
  return { cur, point, type, stop: () => clearInterval(typing) };
}

// fenêtre de navigateur générique
function browser(url, ...content) {
  const addr = h('span', { class: 'oc-url' }, url);
  const tabs = h('div', { class: 'oc-tabs' }, h('span', { class: 'oc-tab on' }, '🌐 Nouvel onglet'), h('span', { class: 'oc-tabplus', 'data-oc': 'plus' }, '+'));
  const bar = h('div', { class: 'oc-bar' }, h('span', { class: 'oc-nav', 'data-oc': 'back' }, '←'), h('span', { class: 'oc-nav' }, '→'), h('span', { class: 'oc-nav' }, '⟳'), h('span', { class: 'oc-addr', 'data-oc': 'addr' }, h('span', { class: 'oc-lock' }, '🔒'), addr), h('span', { class: 'oc-star', 'data-oc': 'star' }, '☆'), h('span', { class: 'oc-nav', 'data-oc': 'menu' }, '⋮'));
  const page = h('div', { class: 'oc-page' }, ...content);
  const win = h('div', { class: 'oc-win' }, tabs, bar, page);
  return { win, addr, tabs, page, bar };
}

const SCENES = [
  async (scr, fx) => {
    const icons = [['🌐', 'Chrome'], ['🦊', 'Firefox'], ['🌀', 'Edge'], ['🧭', 'Safari']].map(([i, n]) => h('div', { class: 'oc-icon' }, h('b', null, i), h('small', null, n)));
    scr.replaceChildren(h('div', { class: 'oc-desk' }, h('div', { class: 'oc-icons' }, ...icons), h('div', { class: 'oc-callout c1' }, '4 navigateurs différents'), h('div', { class: 'oc-taskbar' }, '🪟  ', h('span', null, '10:24'))), fx.cur);
    await wait(1800); await fx.point(icons[1]); await wait(250);
    const b = browser('', h('div', { class: 'oc-newtab' }, h('b', null, '🦊'), h('p', null, 'Bienvenue ! Où veux-tu aller ?')));
    b.win.classList.add('pop'); scr.querySelector('.oc-desk').append(b.win);
  },
  async (scr, fx) => {
    const b = browser(''); scr.replaceChildren(h('div', { class: 'oc-desk' }, b.win), fx.cur);
    await wait(500); await fx.point(b.bar.querySelector('[data-oc=addr]')); await fx.type(b.addr, 'https://www.ecole-des-etoiles.be');
    b.page.replaceChildren(h('div', { class: 'oc-site' }, h('h3', null, '⭐ École des Étoiles'), h('p', null, 'Bienvenue sur le site de notre école ! Agenda · Photos · Menu de la cantine')));
    b.bar.querySelector('.oc-addr').classList.add('oc-hl');
    b.page.append(h('div', { class: 'oc-legend' }, h('span', null, '🔒 = connexion sécurisée'), h('span', null, 'https:// = protocole'), h('span', null, 'ecole-des-etoiles = nom du site'), h('span', null, '.be = Belgique 🇧🇪')));
  },
  async (scr, fx) => {
    const box = h('span', { class: 'oc-q' }), btn = h('span', { class: 'oc-btn' }, 'Rechercher');
    const b = browser('https://www.trouvetout.be', h('div', { class: 'oc-engine' }, h('h3', null, '🔎 TrouveTout'), h('div', { class: 'oc-search' }, '🔍 ', box), btn, h('small', { class: 'muted' }, '(un moteur de recherche imaginaire)')));
    scr.replaceChildren(h('div', { class: 'oc-desk' }, b.win), fx.cur);
    await wait(2500); await fx.point(box.parentNode); await fx.type(box, 'capitale Belgique', 120); await wait(400); await fx.point(btn);
  },
  async (scr, fx) => {
    const R = [['Annonce', 'Week-end à Bruxelles à petit prix !', 'www.reservez-vite.com', 'ad'], ['', 'Bruxelles — Vikidia, l’encyclopédie des 8-13 ans', 'fr.vikidia.org', 'good'], ['', 'Belgique — Wikipédia', 'fr.wikipedia.org', ''], ['', 'tout savoir trop bien lol !!!', 'jesaistout-blog.net', '']];
    const items = R.map(([ad, t, u, c]) => h('div', { class: 'oc-res ' + c }, ad ? h('span', { class: 'oc-ad' }, ad) : '', h('b', null, t), h('small', null, u)));
    const b = browser('https://www.trouvetout.be/?q=capitale+Belgique', h('p', { class: 'oc-count' }, 'Environ 2 530 000 résultats'), ...items);
    scr.replaceChildren(h('div', { class: 'oc-desk' }, b.win), fx.cur);
    await wait(3500); items[0].classList.add('oc-warn'); await wait(3000); await fx.point(items[1]);
    b.addr.textContent = 'https://fr.vikidia.org/wiki/Bruxelles';
    b.page.replaceChildren(h('div', { class: 'oc-site' }, h('h3', null, 'Bruxelles'), h('p', null, 'Bruxelles est la capitale de la Belgique. C’est aussi là que se trouvent de nombreuses institutions de l’Union européenne…')));
  },
  async (scr, fx) => {
    const b = browser('https://fr.vikidia.org/wiki/Bruxelles', h('div', { class: 'oc-site' }, h('h3', null, 'Bruxelles'), h('p', null, 'Bruxelles est la capitale de la Belgique…')));
    scr.replaceChildren(h('div', { class: 'oc-desk' }, b.win), fx.cur);
    await wait(1200); await fx.point(b.tabs.querySelector('[data-oc=plus]'));
    b.tabs.querySelector('.oc-tab').textContent = '📘 Bruxelles'; b.tabs.querySelector('.oc-tab').classList.remove('on'); b.tabs.insertBefore(h('span', { class: 'oc-tab on' }, '🌐 Nouvel onglet'), b.tabs.lastChild);
    await wait(1500); await fx.point(b.bar.querySelector('[data-oc=back]'));
    await wait(900); const st = b.bar.querySelector('[data-oc=star]'); await fx.point(st); st.textContent = '★'; st.classList.add('gold');
    b.page.append(h('div', { class: 'oc-toast' }, '★ Ajouté aux favoris'));
  },
  async (scr, fx) => {
    const b = browser('https://fr.vikidia.org/wiki/Bruxelles'); scr.replaceChildren(h('div', { class: 'oc-desk' }, b.win), fx.cur);
    await wait(800); await fx.point(b.bar.querySelector('[data-oc=menu]'));
    b.page.replaceChildren(h('div', { class: 'oc-hist' }, h('h4', null, '🕘 Historique — aujourd’hui'), ...[['10:31', 'Bruxelles — Vikidia'], ['10:29', 'capitale Belgique — TrouveTout'], ['10:27', 'École des Étoiles']].map(([t, n]) => h('p', null, h('small', null, t), ' ', n))));
    await wait(4500); const x = h('span', { class: 'oc-close' }, '✕'); b.tabs.append(x); await fx.point(x);
    b.win.classList.add('bye'); await wait(600); b.win.remove(); scr.querySelector('.oc-desk').append(h('div', { class: 'oc-callout c2' }, '👋 Navigateur fermé'));
  },
];


// ---------- Leçon 2 : URL, moteur de recherche, source, auteur ----------
const STEPS2 = [
  { t: 'L’URL, c’est l’adresse', s: 'Papa, une URL, c’est l’adresse d’une page sur Internet, comme l’adresse de notre maison ! On la voit tout en haut, dans la barre d’adresse. Pour la reconnaître : elle commence souvent par https, il n’y a pas d’espace, et il y a des points et des barres obliques.', p: 'Comme notre adresse : la rue, le numéro… et la ville !', p2: 'Oui ! Le nom du site, c’est comme la rue, et la fin, c’est la page précise.' },
  { t: 'Navigateur ou moteur de recherche ?', s: 'Attention, ce n’est pas pareil ! Le navigateur, c’est le programme, l’icône sur l’écran : Firefox, Chrome ou Safari. Le moteur de recherche, c’est un site où on cherche des informations : Google, Bing, Ecosia ou Qwant Junior. On le reconnaît à sa grande case de recherche et au bouton Rechercher.', p: 'Donc j’ouvre d’abord le navigateur, et dedans je vais sur le moteur de recherche ?', p2: 'Exactement papa ! Le navigateur, c’est la voiture. Le moteur de recherche, c’est le GPS !' },
  { t: 'Lire un résultat', s: 'J’écris des mots-clés : Atomium hauteur. Chaque résultat a trois parties : un titre bleu sur lequel on clique, l’URL du site en vert, et un petit extrait du texte. Et je ne clique pas sur ce qui est marqué Annonce : c’est de la publicité.', p: 'Malin ! L’URL te dit chez qui tu vas avant même de cliquer.' },
  { t: 'La source', s: 'La source, c’est l’endroit d’où vient l’information : un site, une encyclopédie, un journal ou un livre. On la reconnaît au nom ou au logo du site tout en haut, ou à la phrase Source, en bas de la page. Une bonne source, c’est une encyclopédie, un journal, un musée ou un site officiel.', p: 'Et un blog sans nom, plein de publicités ?', p2: 'Là, je me méfie, et je vérifie ailleurs !' },
  { t: 'L’auteur', s: 'L’auteur, c’est la personne qui a écrit le texte. On le trouve souvent sous le titre, après le mot Par, avec la date de publication. Par exemple : Par Marie Dubois, journaliste, publié le douze mars. S’il n’y a pas d’auteur, je fais encore plus attention.', p: 'Et la date, pourquoi c’est important ?', p2: 'Parce qu’une information trop vieille n’est peut-être plus vraie !' },
  { t: 'Je suis détective du web', s: 'Avant de croire une information, je pose trois questions. Qui l’a écrite ? C’est l’auteur. D’où vient-elle ? C’est la source. Quand a-t-elle été écrite ? C’est la date. Et je compare avec une deuxième source. Si elles disent la même chose, c’est sûrement vrai !', p: 'Bravo ma détective ! Tu m’as appris à bien chercher sur Internet. Je suis fier de toi ! 💙' },
];
const SCENES2 = [
  async (scr, fx) => {
    const b = browser(''); scr.replaceChildren(h('div', { class: 'oc-desk' }, b.win), fx.cur);
    await wait(900); await fx.point(b.bar.querySelector('[data-oc=addr]')); await fx.type(b.addr, 'https://fr.vikidia.org/wiki/Atomium', 80);
    b.bar.querySelector('.oc-addr').classList.add('oc-hl');
    const parts = [['https://', 'protocole sécurisé 🔒', 'u1'], ['fr.vikidia.org', 'nom du site (domaine)', 'u2'], ['/wiki/Atomium', 'la page précise', 'u3']];
    const strip = h('div', { class: 'oc-parts' }); b.page.replaceChildren(h('p', { class: 'oc-cap' }, '🔍 Une URL, à la loupe :'), strip);
    for (const [t, l, c] of parts) { await wait(1300); strip.append(h('span', { class: 'oc-part ' + c }, h('b', null, t), h('small', null, l))); }
    await wait(1200); b.page.append(h('div', { class: 'oc-legend' }, h('span', null, '✔ en haut, dans la barre'), h('span', null, '✔ commence par https://'), h('span', null, '✔ pas d’espace'), h('span', null, '✔ des . et des /')));
  },
  async (scr, fx) => {
    const box = h('span', { class: 'oc-q' }), btn = h('span', { class: 'oc-btn' }, 'Rechercher');
    const left = h('div', { class: 'oc-vsbox' }, h('b', null, '🦊 🌐 🧭'), h('h4', null, 'Navigateur'), h('small', null, 'le PROGRAMME (l’icône sur l’écran)'), h('small', null, 'Firefox · Chrome · Edge · Safari'));
    const b = browser('https://www.trouvetout.be', h('div', { class: 'oc-engine' }, h('h3', null, '🔎 TrouveTout'), h('div', { class: 'oc-search' }, '🔍 ', box), btn));
    const right = h('div', { class: 'oc-vsbox eng' }, h('h4', null, 'Moteur de recherche'), h('small', null, 'un SITE avec une grande case de recherche'), h('small', null, 'Google · Bing · Ecosia · Qwant Junior'));
    scr.replaceChildren(h('div', { class: 'oc-desk vs' }, left, h('div', { class: 'oc-vsmid' }, b.win, right)), fx.cur);
    await wait(2500); left.classList.add('oc-hl'); await wait(4500); left.classList.remove('oc-hl'); right.classList.add('oc-hl'); b.win.classList.add('oc-hl');
    await wait(2500); await fx.point(box.parentNode); await fx.type(box, 'Atomium hauteur', 110); await wait(300); await fx.point(btn);
  },
  async (scr, fx) => {
    const R = [['Annonce', 'Visitez Bruxelles en bus — réservez !', 'www.bus-promo.com', 'Offre spéciale : -50 % ce week-end…', 'ad'], ['', 'Atomium — Vikidia, l’encyclopédie des 8-13 ans', 'fr.vikidia.org › wiki › Atomium', 'L’Atomium mesure 102 mètres de haut. Il a été construit pour l’Exposition universelle de 1958…', 'good'], ['', 'Atomium — Site officiel', 'www.atomium.be', 'Bienvenue à l’Atomium, le monument emblématique de Bruxelles…', '']];
    const items = R.map(([ad, t, u, x, c]) => h('div', { class: 'oc-res ' + c }, ad ? h('span', { class: 'oc-ad' }, ad) : '', h('b', null, t), h('small', null, u), h('p', { class: 'oc-ext' }, x)));
    const b = browser('https://www.trouvetout.be/?q=Atomium+hauteur', h('p', { class: 'oc-count' }, 'Environ 812 000 résultats'), ...items);
    scr.replaceChildren(h('div', { class: 'oc-desk' }, b.win), fx.cur);
    const r = items[1]; await wait(3200);
    for (const [sel, lab] of [['b', '① le titre (on clique ici)'], ['small', '② l’URL du site'], ['.oc-ext', '③ un extrait du texte']]) { const el = r.querySelector(sel); el.classList.add('oc-hl'); r.append(h('span', { class: 'oc-tag' }, lab)); await wait(2200); }
    await wait(1200); items[0].classList.add('oc-warn');
  },
  async (scr, fx) => {
    const logo = h('div', { class: 'oc-srcbar' }, '📘 ', h('b', null, 'Vikidia'), h('small', null, ' — l’encyclopédie des 8-13 ans'));
    const foot = h('p', { class: 'oc-foot' }, 'Source : Vikidia, encyclopédie libre · page vérifiée');
    const b = browser('https://fr.vikidia.org/wiki/Atomium', logo, h('div', { class: 'oc-site' }, h('h3', null, 'Atomium'), h('p', null, 'L’Atomium est un monument de Bruxelles. Il mesure 102 mètres et représente un cristal de fer agrandi 165 milliards de fois.')), foot);
    scr.replaceChildren(h('div', { class: 'oc-desk' }, b.win), fx.cur);
    await wait(4200); await fx.point(logo, false); logo.classList.add('oc-hl'); await wait(3500); await fx.point(foot, false); foot.classList.add('oc-hl');
    await wait(3000); b.page.append(h('div', { class: 'oc-legend' }, h('span', { class: 'ok' }, '✅ encyclopédie'), h('span', { class: 'ok' }, '✅ journal'), h('span', { class: 'ok' }, '✅ musée, site officiel'), h('span', { class: 'ko' }, '⚠️ blog sans nom'), h('span', { class: 'ko' }, '⚠️ publicité')));
  },
  async (scr, fx) => {
    const by = h('p', { class: 'oc-byline' }, '✍️ Par ', h('b', null, 'Marie Dubois'), ', journaliste · publié le 12 mars 2026');
    const b = browser('https://www.petit-journal-des-etoiles.be/atomium', h('div', { class: 'oc-srcbar np' }, '📰 ', h('b', null, 'Le Petit Journal des Étoiles')), h('div', { class: 'oc-site' }, h('h3', null, 'L’Atomium fête ses boules brillantes !'), by, h('p', null, 'Ce week-end, les neuf boules de l’Atomium ont été nettoyées. Les visiteurs ont pu admirer Bruxelles depuis la boule du sommet…')));
    scr.replaceChildren(h('div', { class: 'oc-desk' }, b.win), fx.cur);
    await wait(3500); await fx.point(by, false); by.classList.add('oc-hl');
    by.after(h('div', { class: 'oc-legend' }, h('span', null, '👤 l’auteur : Marie Dubois'), h('span', null, '📅 la date : 12 mars 2026')));
  },
  async (scr) => {
    const Q = [['👤', 'QUI l’a écrit ?', 'l’auteur'], ['🏛️', 'D’OÙ ça vient ?', 'la source'], ['📅', 'QUAND ?', 'la date'], ['🔁', 'Je COMPARE', 'avec une 2e source']];
    const cards = Q.map(([i, q, a]) => h('div', { class: 'oc-det' }, h('b', null, i), h('h4', null, q), h('small', null, a)));
    scr.replaceChildren(h('div', { class: 'oc-desk det' }, h('h3', { class: 'oc-dettitle' }, '🕵️‍♀️ Le détective du web'), h('div', { class: 'oc-dets' }, ...cards)));
    for (const c of cards) { await wait(2600); c.classList.add('on'); Sfx.tap(); }
    await wait(1500); scr.querySelector('.oc-desk').append(h('div', { class: 'oc-callout c2' }, '✔ Information vérifiée !'));
  },
];
const RECO = [
  ['https://www.atomium.be/visite', 'url'], ['🔎 [ case de recherche ]  Rechercher', 'moteur'], ['Par Lucas Martin · publié le 3 mai 2026', 'auteur'], ['Source : encyclopédie Vikidia', 'source'],
  ['www.rtbf.be/info/sciences', 'url'], ['Google · Bing · Ecosia · Qwant Junior', 'moteur'], ['📰 Le Petit Journal des Étoiles (le nom du journal en haut)', 'source'], ['Rédigé par Dr Anne Lambert, médecin', 'auteur'],
  ['https://fr.vikidia.org/wiki/Bruxelles', 'url'], ['Article écrit par Tom, élève de 6e, le 2 juin', 'auteur'], ['D’après le site officiel du musée des Sciences naturelles', 'source'], ['Une page avec une grande case vide et le bouton « Rechercher »', 'moteur'],
];
const RECO_L = { url: '🔗 Une URL', moteur: '🔎 Un moteur de recherche', source: '🏛️ Une source', auteur: '✍️ Un auteur' };
const RECO_W = { url: 'C’est une URL, une adresse : un nom de site avec des points et des /, souvent avec https:// ou www, et jamais d’espace.', moteur: 'C’est un moteur de recherche : un site avec une grande case pour chercher.', source: 'C’est une source : d’où vient l’information (site, journal, encyclopédie…).', auteur: 'C’est l’auteur : la personne qui a écrit, souvent après « Par ».' };

const QUIZ = [
  ['Le programme qui permet d’aller sur Internet s’appelle…', ['un navigateur', 'un moteur de recherche', 'un clavier'], 0],
  ['Pour chercher une information, j’écris…', ['des mots-clés', 'une très longue phrase', 'mon adresse'], 0],
  ['Un résultat marqué « Annonce », c’est…', ['une publicité', 'le meilleur site', 'un virus'], 0],
  ['Le petit cadenas 🔒 dans la barre d’adresse veut dire…', ['connexion sécurisée', 'site fermé', 'site belge'], 0],
  ['« .be » à la fin d’une adresse, c’est un site…', ['belge', 'bizarre', 'en anglais'], 0],
  ['Pour retrouver un site plus tard, je clique sur…', ['l’étoile des favoris ★', 'la flèche retour ←', 'la croix ✕'], 0],
  ['Une URL, c’est…', ['l’adresse d’une page Internet', 'un moteur de recherche', 'le nom de l’auteur'], 0],
  ['Google, Bing et Qwant Junior sont des…', ['moteurs de recherche', 'navigateurs', 'auteurs'], 0],
  ['La source d’une information, c’est…', ['l’endroit d’où elle vient', 'la personne qui l’a lue', 'la couleur du site'], 0],
  ['Le mot « Par » sous un titre m’indique souvent…', ['l’auteur', 'la publicité', 'l’URL'], 0],
  ['Pour vérifier une information, je…', ['la compare avec une 2e source', 'la crois tout de suite', 'clique sur l’annonce'], 0],
];

export function open(tab = 'demo') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const body = h('div');
  const TABS = [['demo', '💻 Le navigateur'], ['web', '🔗 URL, moteur, source, auteur'], ['reco', '🕵️ Reconnais-les !'], ['quiz', '❓ Petit quiz']];
  const tabs = TABS.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'oc-tab-' + k, onclick: () => go(k) }, l));
  let alive = true, fxNow = null;
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ea-panel oc-panel' }, UI.closeButton(), h('h2', null, '💻 L’ordinateur de Maissa'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'L’ordinateur de Maissa', onClose: () => { alive = false; Voice.stop(); if (fxNow) fxNow.stop(); } });
  function go(k) { if (fxNow) fxNow.stop(); Voice.stop(); tabs.forEach((t, i) => t.classList.toggle('primary', TABS[i][0] === k)); if (k === 'demo') demo(STEPS, SCENES, 'web'); else if (k === 'web') demo(STEPS2, SCENES2, 'reco', true); else if (k === 'reco') reco(); else quiz(); }
  // voix de l'appareil (en attendant un enregistrement de Maissa) : promesse résolue à la fin de la phrase
  const speakP = (txt) => new Promise((ok) => { let d = false; const fin = () => { if (!d) { d = true; ok(); } }; if (!Sfx.soundOn() || !Voice.speak(txt.replace(/https/g, 'h t t p s'), { onEnd: fin })) setTimeout(fin, Math.max(3000, txt.length * 55)); setTimeout(fin, txt.length * 95 + 5000); });
  function demo(STEPS, SCENES, nextTab, tts = false) {
    let i = 0; const scr = h('div', { class: 'oc-screen' }); const fx = fxNow = screenFx(scr);
    const lap = h('div', { class: 'oc-laptop' }, scr, h('div', { class: 'oc-base' }));
    const title = h('b', { class: 'oc-title' }), sb = h('p', { class: 'oc-say s' }), pb = h('p', { class: 'oc-say p' }), pb2 = h('p', { class: 'oc-say s' });
    const prev = h('button', { class: 'btn', type: 'button', onclick: () => { if (i > 0) { i--; show(); } } }, '◀'), next = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'oc-next', onclick: () => { if (i < STEPS.length - 1) { i++; show(); } else { star(2); Sfx.win(); burst(body); go(nextTab); } } });
    const photo = h('img', { class: 'oc-photo', src: 'assets/scenes/ordi_papa.webp', alt: 'Maissa explique à Papa' });
    body.replaceChildren(h('div', { class: 'oc-wrap' }, lap, h('div', { class: 'oc-side' }, photo, title, sb, pb, pb2, h('div', { class: 'actions' }, prev, next))));
    const show = async () => {
      const S0 = STEPS[i]; const me = {}; show.cur = me;
      title.textContent = `Étape ${i + 1}/${STEPS.length} · ${S0.t}`; sb.textContent = '🧒 Maissa : ' + S0.s; pb.textContent = ''; pb2.textContent = ''; pb.hidden = pb2.hidden = true;
      next.textContent = i < STEPS.length - 1 ? 'Suivant ▶' : (nextTab === 'web' ? 'Leçon suivante ▶' : nextTab === 'reco' ? 'À toi de reconnaître ! ▶' : 'Au quiz ! ▶'); prev.disabled = i === 0;
      Voice.stop(); say.textContent = '';
      SCENES[i](scr, fx).catch(() => {});
      if (tts) { await speakP(S0.s); await wait(500); } else { voice(S0.k); await wait(S0.d); }
      if (!alive || show.cur !== me) return;
      pb.hidden = false; pb.textContent = '👨 Papa : ' + S0.p; Sfx.coin();
      if (S0.p2) { await wait(2600); if (!alive || show.cur !== me) return; pb2.hidden = false; pb2.textContent = '🧒 Maissa : ' + S0.p2; if (tts) speakP(S0.p2); }
    };
    show();
  }
  function reco() {
    let n = 0, ok = 0; const Q = shuffle(RECO.slice()).slice(0, 8); const zone = h('div'), sc = h('p', { class: 'muted' });
    const next = () => {
      if (!zone.isConnected && n) return;
      if (n >= Q.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `Détective : ${ok}/${Q.length} !`)); if (ok >= 6) { star(2); Sfx.win(); burst(body); say.textContent = 'Bravo, tu reconnais tout comme Maissa !'; } return; }
      const [txt, a] = Q[n++];
      zone.replaceChildren(h('p', { class: 'muted' }, 'Qu’est-ce que c’est ?'), h('div', { class: 'oc-reco' }, txt), h('div', { class: 'actions wrap' }, ...Object.entries(RECO_L).map(([k, l]) => h('button', { class: 'btn', type: 'button', 'data-testid': k === a ? 'oc-reco-ok' : 'oc-reco-ko', onclick: () => {
        zone.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        const good = k === a; if (good) { ok++; Sfx.ok(); } else Sfx.ko();
        const ex = (good ? 'Oui ! ' : 'Non… ') + RECO_W[a]; say.textContent = ''; zone.querySelector('[data-testid=oc-reco-ok]').classList.add('right'); zone.append(h('div', { class: 'ea-step' }, h('p', null, ex)), h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'oc-reco-next', onclick: next }, 'Suivant ▶')));
        sc.textContent = `${n}/${Q.length} · ✔ ${ok}`;
      } }, l))));
    };
    body.replaceChildren(h('p', { class: 'prompt' }, '🕵️ URL, moteur de recherche, source ou auteur ? Reconnais-les comme Maissa !'), zone, sc); next();
  }
  function quiz() {
    if (fxNow) fxNow.stop(); Voice.stop();
    let n = 0, ok = 0; const Q = shuffle(QUIZ.slice()); const zone = h('div'), sc = h('p', { class: 'muted' });
    const next = () => {
      if (n >= Q.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `Bravo ! ${ok}/${Q.length}`)); if (ok >= 5) { star(2); Sfx.win(); burst(body); } return; }
      const [q, opts, a] = Q[n++];
      zone.replaceChildren(h('p', { class: 'tb-q', style: 'font-size:clamp(17px,2.6vw,22px)' }, q), h('div', { class: 'actions wrap' }, ...shuffle(opts.map((o, i) => [o, i])).map(([o, i]) => h('button', { class: 'btn', type: 'button', 'data-testid': i === a ? 'oc-ok' : 'oc-ko', onclick: () => {
        if (i === a) { ok++; Sfx.ok(); say.textContent = 'Oui ! ' + opts[a]; } else { Sfx.ko(); say.textContent = 'Non, c’est : ' + opts[a]; } sc.textContent = `${n}/${Q.length} · ✔ ${ok}`; setTimeout(next, 1500);
      } }, o))));
    };
    body.replaceChildren(h('p', { class: 'prompt' }, 'As-tu bien écouté Maissa ?'), zone, sc); next();
  }
  go(tab);
}
