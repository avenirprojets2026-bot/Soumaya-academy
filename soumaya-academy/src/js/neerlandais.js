// La Maison du Néerlandais (P4, niveau pré-A1, surtout oral) : Soumaya dit chaque mot avec sa propre voix,
// l'enfant écoute, répète, puis joue à « Écoute et trouve » et au petit dialogue.
import * as UI from './ui.js';
import { ZX_LIPS, ZX_ENV } from './zx_lips.js';
const EXPV = (typeof window !== 'undefined' && window.__ASSETS) ? '' : '?v=20261101e';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { asset } from './asset.js';
import { playFile } from './papa.js';
import { burst, shuffle } from './workshop.js';
import * as VL from './vlaanderen.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.nl = b.nl || { heard: {}, quiz: 0, dial: false }; return b.nl; };
// mots dont l'enregistrement est mal prononcé : voix néerlandaise de l'appareil en attendant de les réenregistrer
const DEVICE = {};
function speakNL(text) {
  try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text);
    const v = speechSynthesis.getVoices().filter((x) => /^nl/i.test(x.lang)).sort((a, b) => (/BE/i.test(b.lang) ? 1 : 0) - (/BE/i.test(a.lang) ? 1 : 0))[0];
    u.lang = v ? v.lang : 'nl-BE'; if (v) u.voice = v; u.rate = 0.85; speechSynthesis.speak(u); } catch (e) { /* sans voix */ }
}
const say = (id) => { if (!Sfx.soundOn()) return; if (DEVICE[id]) speakNL(DEVICE[id]); else playFile(`assets/voice/nl/${id}.ogg`); };
const W = [["hallo", "Hallo!", "Bonjour ! / Salut !", "👋", "moi"], ["goedemorgen", "Goedemorgen!", "Bonjour ! (le matin)", "🌅", "moi"], ["ikheet", "Ik heet Soumaya.", "Je m’appelle Soumaya.", "🙋‍♀️", "moi"], ["ikben9", "Ik ben negen jaar.", "J’ai neuf ans.", "🎂", "moi"], ["ikwoon", "Ik woon in België.", "J’habite en Belgique.", "🇧🇪", "moi"], ["hoeheet", "Hoe heet jij?", "Comment t’appelles-tu ?", "❓", "moi"], ["hoegaat", "Hoe gaat het?", "Comment ça va ?", "🙂", "moi"], ["goed", "Goed, dank je!", "Bien, merci !", "👍", "moi"], ["alsjeblieft", "Alsjeblieft.", "S’il te plaît. / Voilà.", "🎁", "moi"], ["dankjewel", "Dank je wel!", "Merci beaucoup !", "🙏", "moi"], ["totziens", "Tot ziens!", "Au revoir !", "👋", "moi"], ["n1", "één", "un — 1", "1️⃣", "chiffres"], ["n2", "twee", "deux — 2", "2️⃣", "chiffres"], ["n3", "drie", "trois — 3", "3️⃣", "chiffres"], ["n4", "vier", "quatre — 4", "4️⃣", "chiffres"], ["n5", "vijf", "cinq — 5", "5️⃣", "chiffres"], ["n6", "zes", "six — 6", "6️⃣", "chiffres"], ["n7", "zeven", "sept — 7", "7️⃣", "chiffres"], ["n8", "acht", "huit — 8", "8️⃣", "chiffres"], ["n9", "negen", "neuf — 9", "9️⃣", "chiffres"], ["n10", "tien", "dix — 10", "🔟", "chiffres"], ["n11", "elf", "onze — 11", "11", "chiffres"], ["n12", "twaalf", "douze — 12", "12", "chiffres"], ["n13", "dertien", "treize — 13", "13", "chiffres"], ["n14", "veertien", "quatorze — 14", "14", "chiffres"], ["n15", "vijftien", "quinze — 15", "15", "chiffres"], ["n16", "zestien", "seize — 16", "16", "chiffres"], ["n17", "zeventien", "dix-sept — 17", "17", "chiffres"], ["n18", "achttien", "dix-huit — 18", "18", "chiffres"], ["n19", "negentien", "dix-neuf — 19", "19", "chiffres"], ["n20", "twintig", "vingt — 20", "20", "chiffres"], ["rood", "rood", "rouge", "🔴", "couleurs"], ["blauw", "blauw", "bleu", "🔵", "couleurs"], ["geel", "geel", "jaune", "🟡", "couleurs"], ["groen", "groen", "vert", "🟢", "couleurs"], ["oranje", "oranje", "orange", "🟠", "couleurs"], ["wit", "wit", "blanc", "⚪", "couleurs"], ["zwart", "zwart", "noir", "⚫", "couleurs"], ["roze", "roze", "rose", "🩷", "couleurs"], ["maandag", "maandag", "lundi", "1", "jours"], ["dinsdag", "dinsdag", "mardi", "2", "jours"], ["woensdag", "woensdag", "mercredi", "3", "jours"], ["donderdag", "donderdag", "jeudi", "4", "jours"], ["vrijdag", "vrijdag", "vendredi", "5", "jours"], ["zaterdag", "zaterdag", "samedi", "6", "jours"], ["zondag", "zondag", "dimanche", "7", "jours"], ["huis", "het huis", "la maison", "🏠", "maison"], ["keuken", "de keuken", "la cuisine", "🍳", "maison"], ["slaapkamer", "de slaapkamer", "la chambre", "🛏️", "maison"], ["badkamer", "de badkamer", "la salle de bain", "🛁", "maison"], ["tuin", "de tuin", "le jardin", "🌷", "maison"], ["tafel", "de tafel", "la table", "🍽️", "maison"], ["deur", "de deur", "la porte", "🚪", "maison"], ["raam", "het raam", "la fenêtre", "🪟", "maison"], ["appel", "de appel", "la pomme", "🍎", "manger"], ["brood", "het brood", "le pain", "🍞", "manger"], ["kaas", "de kaas", "le fromage", "🧀", "manger"], ["melk", "de melk", "le lait", "🥛", "manger"], ["water", "het water", "l’eau", "💧", "manger"], ["banaan", "de banaan", "la banane", "🍌", "manger"], ["honger", "Ik heb honger.", "J’ai faim.", "😋", "manger"], ["dorst", "Ik heb dorst.", "J’ai soif.", "🥤", "manger"], ["blij", "Ik ben blij.", "Je suis contente.", "😊", "gouts"], ["moe", "Ik ben moe.", "Je suis fatiguée.", "😴", "gouts"], ["boos", "Ik ben boos.", "Je suis fâchée.", "😠", "gouts"], ["lekker", "Dat is lekker!", "C’est bon !", "😋", "gouts"], ["houvan", "Ik hou van muziek.", "J’aime la musique.", "🎵", "gouts"], ["vindleuk", "Ik speel graag met mijn kat.", "J’aime jouer avec mon chat.", "🐱", "gouts"], ["ochtend", "de ochtend", "le matin", "🌅", "journee"], ["middag", "de middag", "l’après-midi", "☀️", "journee"], ["avond", "de avond", "le soir", "🌆", "journee"], ["nacht", "de nacht", "la nuit", "🌙", "journee"], ["school", "Ik ga naar school.", "Je vais à l’école.", "🏫", "journee"], ["slapen", "Ik ga slapen.", "Je vais dormir.", "😴", "journee"]];
const THEMES = [['moi', '👋 Me présenter'], ['chiffres', '🔢 Les chiffres'], ['couleurs', '🎨 Les couleurs'], ['jours', '📅 Les jours'], ['maison', '🏠 La maison'], ['manger', '🍎 Manger et boire'], ['gouts', '😊 Je ressens, j’aime'], ['journee', '🌙 Ma journée']];
const themeOf = (t) => W.filter((w) => w[4] === t);
const checkBadge = () => { const st = ST(); const all = THEMES.every(([t]) => themeOf(t).some((w) => st.heard[w[0]])); if (all && st.quiz >= 6 && st.dial) st.badge = true; S.save(); };

// ---------- les cartes qui parlent ----------
function cartes(body, talk, theme) {
  const st = ST(), list = themeOf(theme);
  const count = h('small', { class: 'muted' });
  const upd = () => { count.textContent = `${list.filter((w) => st.heard[w[0]]).length}/${list.length} mots écoutés`; };
  const grid = h('div', { class: 'nl-grid' }, ...list.map(([id, nl, fr, emo]) => {
    const c = h('button', { class: 'nl-card' + (st.heard[id] ? ' seen' : ''), type: 'button', 'data-testid': 'nl-' + id, onclick: () => {
      Voice.stop(); say(id); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop', 'seen');
      talk(`« ${nl} » veut dire « ${fr} ». À toi : répète avec Soumaya !`, false);
      if (!st.heard[id]) { st.heard[id] = true; S.save(); upd(); if (list.every((w) => st.heard[w[0]])) { star(1); Sfx.win(); burst(body); talk('Bravo ! Tu as écouté tous les mots de ce thème. Goed zo !', false); } checkBadge(); }
    } }, h('span', { class: 'nl-emo' }, theme === 'jours' ? '📅' : emo), h('b', null, nl), h('small', null, fr), h('i', { class: 'nl-play' }, '🔊'));
    return c;
  }));
  const tip = theme === 'jours' ? 'En néerlandais, les jours s’écrivent sans majuscule et finissent tous par « dag » (jour) !' : theme === 'maison' || theme === 'manger' ? '« de » et « het » veulent dire « le » ou « la ». Apprends le mot avec son petit mot devant !' : theme === 'chiffres' ? 'De 13 à 19, on ajoute « tien » (dix) : dertien, veertien… Et « negen » (9), c’est l’âge de Soumaya : negen jaar !' : 'Touche une carte : Soumaya la dit en néerlandais. Puis répète à voix haute !';
  const tel = theme === 'chiffres' ? h('button', { class: 'btn nl-tel', type: 'button', 'data-testid': 'nl-tel20', onclick: () => { Voice.stop(); if (Sfx.soundOn()) playFile('assets/voice/nl/tel20.ogg'); talk('Soumaya compte de 1 à 20 en néerlandais. Compte avec elle !', false); } }, '▶️ Compter de 1 à 20 avec Soumaya') : null;
  body.replaceChildren(h('p', { class: 'prompt' }, 'Touche une carte et écoute Soumaya. Répète après elle à voix haute ! 🗣️'), h('p', { class: 'muted' }, '💡 ' + tip), ...(tel ? [tel] : []), grid, count);
  upd();
}

// ---------- Écoute et trouve ----------
function quiz(body, talk) {
  const st = ST(); let n = 0, ok = 0; const Q = shuffle(W.filter((w) => w[4] !== 'jours').slice()).slice(0, 8);
  const zone = h('div'), sc = h('p', { class: 'muted' });
  const next = () => {
    if (n >= Q.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `Goed zo ! ${ok}/${Q.length}`)); if (ok > st.quiz) st.quiz = ok; S.save(); checkBadge(); star(ok >= 6 ? 2 : 1); if (ok >= 6) { Sfx.win(); burst(body); say('bravo'); } return; }
    const q = Q[n++]; const opts = shuffle([q, ...shuffle(W.filter((w) => w[0] !== q[0] && w[4] !== 'jours')).slice(0, 3)]);
    const replay = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'nl-replay', onclick: () => say(q[0]) }, '🔊 Réécouter Soumaya');
    zone.replaceChildren(h('p', { class: 'tb-q' }, 'Qu’est-ce que Soumaya a dit ?'), replay, h('div', { class: 'nl-grid quiz' }, ...opts.map((o) => h('button', { class: 'nl-card', type: 'button', 'data-testid': 'nl-q-' + o[0], onclick: () => {
      if (o[0] === q[0]) { ok++; Sfx.ok(); talk(`Oui ! « ${q[1]} » = « ${q[2]} ».`, false); } else { Sfx.ko(); talk(`Non : « ${q[1]} » veut dire « ${q[2]} ».`, false); }
      sc.textContent = `${n}/${Q.length} · ✔ ${ok}`; setTimeout(next, 1700);
    } }, h('span', { class: 'nl-emo' }, o[3]), h('small', null, o[2]))))); 
    setTimeout(() => say(q[0]), 300);
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '🎧 Écoute Soumaya et trouve la bonne image.'), zone, sc);
  next();
}

// ---------- Wat eten de dieren? (régimes alimentaires en néerlandais) ----------
const DG = [ // grote groepen
  { nl: 'de planteneter', sci: 'herbivoor', fr: 'herbivore', eet: 'planten', ex: [['🐄', 'de koe'], ['🐴', 'het paard'], ['🐇', 'het konijn'], ['🦒', 'de giraf']] },
  { nl: 'de vleeseter', sci: 'carnivoor', fr: 'carnivore', eet: 'vlees (andere dieren)', ex: [['🦁', 'de leeuw'], ['🐺', 'de wolf'], ['🦅', 'de arend'], ['🐈', 'de kat']] },
  { nl: 'de alleseter', sci: 'omnivoor', fr: 'omnivore', eet: 'planten én vlees', ex: [['🐻', 'de bruine beer'], ['🐖', 'het varken'], ['🐔', 'de kip'], ['🧒', 'de mens']] },
];
const DP = [ // precieze namen : [nl, wetenschappelijk, fr, eet (nl), eet (fr), groep]
  ['de zadeneter', 'granivoor', 'granivore', 'zaden', 'des graines', 'planteneter'],
  ['de fruiteter', 'frugivoor', 'frugivore', 'fruit', 'des fruits', 'planteneter'],
  ['de nectardrinker', 'nectarivoor', 'nectarivore', 'nectar van bloemen', 'le nectar des fleurs', 'planteneter'],
  ['de bladeter', 'folivoor', 'folivore', 'bladeren', 'des feuilles', 'planteneter'],
  ['de insecteneter', 'insectivoor', 'insectivore', 'insecten', 'des insectes', 'vleeseter'],
  ['de viseter', 'piscivoor', 'piscivore', 'vissen', 'des poissons', 'vleeseter'],
];
const DA = [ // [emoji, dier, fr, type (index DP)]
  ['🐦', 'de distelvink', 'le chardonneret', 0], ['🐦', 'de mus', 'le moineau', 0], ['🐹', 'de hamster', 'le hamster', 0],
  ['🦇', 'de vleerhond', 'la roussette', 1], ['🦜', 'de ara', 'l’ara', 1], ['🦧', 'de orang-oetan', 'l’orang-outan', 1],
  ['🐦', 'de kolibrie', 'le colibri', 2], ['🦋', 'de vlinder', 'le papillon', 2],
  ['🐨', 'de koala', 'le koala', 3], ['🦥', 'de luiaard', 'le paresseux', 3],
  ['🐜', 'de miereneter', 'le tamanoir', 4], ['🦔', 'de egel', 'le hérisson', 4], ['🐦', 'de zwaluw', 'l’hirondelle', 4],
  ['🦦', 'de otter', 'la loutre', 5], ['🦭', 'de zeehond', 'le phoque', 5], ['🐦', 'de ijsvogel', 'le martin-pêcheur', 5],
];
const cap = (t) => t[0].toUpperCase() + t.slice(1);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const hear = (t) => h('button', { class: 'btn small', type: 'button', 'aria-label': 'Écouter ' + t, onclick: () => speakNL(t) }, '🔊');
function dieren(body, talk) {
  const les = () => {
    const t1 = h('table', { class: 'xb-tab' }, h('tr', null, h('th', null, 'Nederlands'), h('th', null, 'Hij/zij eet…'), h('th', null, 'Voorbeelden'), h('th', null, 'Français')),
      ...DG.map((g) => h('tr', null, h('td', null, hear(g.nl), ' ', h('b', null, g.nl), h('br'), h('small', null, g.sci)), h('td', null, g.eet), h('td', null, g.ex.map((e) => e.join(' ')).join(', ')), h('td', null, g.fr))));
    const t2 = h('table', { class: 'xb-tab' }, h('tr', null, h('th', null, 'Nederlands'), h('th', null, 'Hij eet vooral…'), h('th', null, 'Voorbeelden'), h('th', null, 'Français')),
      ...DP.map((d, i) => h('tr', null, h('td', null, hear(d[0]), ' ', h('b', null, d[0]), h('br'), h('small', null, d[1])), h('td', null, d[3]), h('td', null, DA.filter((a) => a[3] === i).map((a) => a[0] + ' ' + a[1]).join(', ')), h('td', null, d[2] + ' : ' + d[4]))));
    body.replaceChildren(h('h3', null, '🦊 Wat eten de dieren? — Que mangent les animaux ?'),
      h('p', null, 'Er zijn ', h('b', null, 'drie grote groepen'), ' : de planteneters, de vleeseters en de alleseters. ', h('small', { class: 'muted' }, '(Il y a trois grands groupes.)')), t1,
      h('p', null, 'Sommige dieren eten ', h('b', null, 'vooral één soort voedsel'), '. ', h('small', { class: 'muted' }, '(Certains animaux mangent surtout une sorte de nourriture.)')), t2,
      h('p', { class: 'vi-memo' }, '💡 Truc : ', h('b', null, 'plant + eter'), ' = planteneter · ', h('b', null, 'vlees + eter'), ' = vleeseter · ', h('b', null, 'alles + eter'), ' = alleseter. « eter » = celui qui mange.'),
      h('p', { class: 'muted' }, '🗣️ Zeg het : « De koala eet bladeren. Hij is een bladeter. » — Le koala mange des feuilles. C’est un folivore.'),
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'nl-dier-go', onclick: oef }, '✏️ Oefenen ! (10 vragen)')));
    talk('Wat eten de dieren ? Il y a trois grands groupes : de planteneters, de vleeseters en de alleseters.');
  };
  const GEN = [
    () => { const a = pick(DA), d = DP[a[3]]; return { ic: a[0], t: cap(a[1]), sub: `${cap(a[1])} eet vooral ${d[3]}.`, q: `Wat is ${a[1]}?`, o: shuffle([d[0], ...shuffle(DP.filter((x) => x !== d)).slice(0, 2).map((x) => x[0])]), r: d[0], nl: `${cap(a[1])} eet ${d[3]}. Hij is ${d[0].replace('de ', 'een ')}.`, fr: `${cap(a[2])} mange ${d[4]} : c’est un ${d[2]}.` }; },
    () => { const d = pick(DP); return { ic: '📖', t: d[0], q: `Wat betekent « ${d[0]} » ? (Que veut dire…)`, o: shuffle([d[2], ...shuffle(DP.filter((x) => x !== d)).slice(0, 2).map((x) => x[2])]), r: d[2], nl: `${cap(d[0])} eet vooral ${d[3]}.`, fr: `« ${d[0]} » = ${d[2]} : il mange surtout ${d[4]}.` }; },
    () => { const g = pick(DG), e = pick(g.ex); return { ic: e[0], t: cap(e[1]), q: `Is ${e[1]} een planteneter, een vleeseter of een alleseter?`, o: DG.map((x) => x.nl.replace('de ', 'een ')), r: g.nl.replace('de ', 'een '), nl: `${cap(e[1])} is ${g.nl.replace('de ', 'een ')}: dit dier eet ${g.eet}.`, fr: `C’est un ${g.fr}.` }; },
    () => { const a = pick(DA), d = DP[a[3]]; return { ic: a[0], t: cap(a[1]), q: `${cap(a[1])} eet ___ .`, o: shuffle([d[3], ...shuffle(DP.filter((x) => x !== d)).slice(0, 2).map((x) => x[3])]), r: d[3], nl: `${cap(a[1])} eet ${d[3]}.`, fr: `${cap(a[2])} mange ${d[4]}.`, say: true }; },
    () => { const a = pick(DA), d = DP[a[3]], ok = Math.random() < 0.5, d2 = ok ? d : pick(DP.filter((x) => x !== d)); return { ic: a[0], t: cap(a[1]), q: `Waar of niet waar? « ${cap(a[1])} is ${d2[0].replace('de ', 'een ')}. »`, o: ['waar', 'niet waar'], r: ok ? 'waar' : 'niet waar', nl: `${cap(a[1])} is ${d[0].replace('de ', 'een ')}.`, fr: `${ok ? 'Vrai' : 'Faux'} : ${a[2]} est ${d[2]}.` }; },
    () => { const i = Math.floor(Math.random() * DP.length), d = DP[i], ins = shuffle(DA.filter((a) => a[3] === i)).slice(0, 2), x = pick(DA.filter((a) => a[3] !== i)); return { ic: '🔎', t: 'Wie hoort er niet bij?', q: `Welk dier is GEEN ${d[0].replace('de ', '')}? (Lequel n’est PAS ${d[2]} ?)`, o: shuffle([...ins, x]).map((a) => a[0] + ' ' + a[1]), r: x[0] + ' ' + x[1], nl: `${cap(x[1])} is ${DP[x[3]][0].replace('de ', 'een ')}.`, fr: `${cap(x[2])} est ${DP[x[3]][2]}, pas ${d[2]}.` }; },
  ];
  const oef = () => {
    let n = 0, ok = 0; const N = 10; const head = h('p', { class: 'prompt' }), card = h('div', { class: 'vi-card' }), act = h('div', { class: 'answers' });
    body.replaceChildren(h('div', { class: 'actions wrap' }, h('button', { class: 'btn small', type: 'button', onclick: les }, '📖 De les (la leçon)')), head, card, act);
    const next = () => {
      if (n >= N) { head.textContent = `Goed zo ! ${ok}/${N}`; talk(`Goed zo ! ${ok} sur ${N}.`); card.replaceChildren(); act.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: oef }, '↻ Nieuwe vragen'), h('button', { class: 'btn', type: 'button', onclick: les }, '📖 De les')); star(ok >= 8 ? 2 : 1); if (ok >= 8) { Sfx.win(); burst(body); } return; }
      const Q = GEN[n % GEN.length]();
      card.replaceChildren(h('span', { class: 'vi-big' }, Q.ic), h('b', null, Q.t), ...(Q.sub ? [h('small', null, Q.sub)] : []), hear(Q.sub || Q.q.replace(/\(.*\)/, '').replace('___', '…')));
      head.textContent = `${Q.q} (${n + 1}/${N})`; speakNL(Q.sub || Q.q.replace(/\(.*\)/, '').replace('___', ''));
      act.replaceChildren(...Q.o.map((o) => h('button', { class: 'choice', type: 'button', 'data-k': o === Q.r ? 0 : 1, onclick: (e) => { act.querySelectorAll('button').forEach((b) => { b.disabled = true; if (b.textContent === Q.r) b.classList.add('ok'); });
        if (o === Q.r) { ok++; Sfx.ok(); talk(`Goed zo ! ${Q.nl} — ${Q.fr}`, false); } else { e.currentTarget.classList.add('ko'); Sfx.ko(); talk(`Nee. ${Q.nl} — ${Q.fr}`, false); }
        speakNL(Q.nl); n++; setTimeout(next, 3600); } }, o)));
    };
    next();
  };
  les();
}

// ---------- le petit dialogue ----------
const DIAL = [
  { they: 'hallo', you: ['hallo', 'totziens'] },
  { they: 'hoeheet', you: ['ikheet', 'ikben9'] },
  { they: 'hoegaat', you: ['goed', 'dorst'] },
  { they: 'alsjeblieft', you: ['dankjewel', 'boos'] },
  { they: 'totziens', you: ['totziens', 'goedemorgen'] },
];
function dialogue(body, talk) {
  const st = ST(); let k = 0, ok = 0; const log = h('div', { class: 'nl-chat' }), zone = h('div', { class: 'actions wrap' });
  const word = (id) => W.find((w) => w[0] === id);
  const step = () => {
    if (k >= DIAL.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, ok >= 4 ? 'Super conversation ! Goed zo ! 🎉' : 'Bien joué ! Recommence pour t’entraîner.'), h('button', { class: 'btn', type: 'button', onclick: () => dialogue(body, talk) }, '↺ Recommencer')); if (ok >= 4) { st.dial = true; S.save(); checkBadge(); star(2); Sfx.win(); burst(body); say('bravo'); } return; }
    const d = DIAL[k], w = word(d.they);
    log.append(h('p', { class: 'nl-b them' }, h('b', null, '🧒 Soumaya : '), w[1], h('small', null, ' (' + w[2] + ')'))); log.scrollTop = 1e6; say(d.they);
    zone.replaceChildren(...shuffle(d.you.slice()).map((id) => { const r = word(id); return h('button', { class: 'btn', type: 'button', 'data-testid': 'nl-d-' + id, onclick: () => {
      const good = id === d.you[0]; if (good) { ok++; Sfx.ok(); } else Sfx.ko();
      log.append(h('p', { class: 'nl-b me' + (good ? '' : ' ko') }, h('b', null, '🙂 Moi : '), r[1], h('small', null, good ? ' ✔' : ' ✘ — il fallait : ' + word(d.you[0])[1])));
      log.scrollTop = 1e6; zone.replaceChildren(); k++; setTimeout(step, 1600);
    } }, r[1] + ' — ' + r[2]); }));
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '💬 Soumaya te parle en néerlandais. Choisis la bonne réponse, puis dis-la à voix haute !'), log, zone);
  step(); talk('Choisis la bonne réponse, puis dis-la à voix haute !', false);
}

// ---------- Ma journée à El Hikma (dialogue Papa / Soumaya, 30 répliques) ----------
const HK = [
  ['P', 'Dag Soumaya! Hoe was je dag op school?', 'Bonjour Soumaya ! Comment était ta journée à l’école ?'],
  ['S', 'Hallo papa! Mijn dag was super!', 'Salut papa ! Ma journée était super !'],
  ['P', 'Vertel eens. Hoe heet jouw school ook alweer?', 'Raconte. Comment s’appelle ton école déjà ?'],
  ['S', 'Mijn school heet El Hikma. Ik zit in het vierde leerjaar.', 'Mon école s’appelle El Hikma. Je suis en 4e primaire.'],
  ['P', 'Hoe is de dag begonnen?', 'Comment la journée a-t-elle commencé ?'],
  ['S', 'Om half negen ging de bel. We gingen in de rij staan.', 'À 8 h 30, la sonnerie a retenti. On s’est mis en rang.'],
  ['S', 'De juf zei: "Goedemorgen, kinderen!"', 'La maîtresse a dit : « Bonjour les enfants ! »'],
  ['P', 'En wat hebben jullie eerst gedaan?', 'Et qu’avez-vous fait en premier ?'],
  ['S', 'Eerst wiskunde. We hebben de grootheden geleerd.', 'D’abord les maths. On a appris les grandeurs.'],
  ['P', 'De grootheden? Wat is dat?', 'Les grandeurs ? C’est quoi ?'],
  ['S', 'De lengte in meter, het gewicht in kilogram en de inhoud in liter.', 'La longueur en mètres, la masse en kilos et la contenance en litres.'],
  ['P', 'Knap! Hoeveel centimeter is een meter?', 'Bravo ! Combien de centimètres dans un mètre ?'],
  ['S', 'Honderd centimeter, papa! Dat is makkelijk!', 'Cent centimètres, papa ! C’est facile !'],
  ['P', 'En tijdens de speeltijd?', 'Et pendant la récréation ?'],
  ['S', 'Ik zei tegen een nieuw meisje: "Hallo, ik heet Soumaya. Ik ben negen jaar."', 'J’ai dit à une nouvelle fille : « Bonjour, je m’appelle Soumaya. J’ai neuf ans. »'],
  ['S', 'Zij heet Amira. Nu is ze mijn beste vriendin!', 'Elle s’appelle Amira. Maintenant, c’est ma meilleure amie !'],
  ['P', 'Wat leuk! Wat hebben jullie samen gedaan?', 'Super ! Qu’avez-vous fait ensemble ?'],
  ['S', 'We hebben touwtje gesprongen en veel gelachen.', 'On a sauté à la corde et beaucoup ri.'],
  ['P', 'En in de namiddag?', 'Et l’après-midi ?'],
  ['S', 'We hebben over artificiële intelligentie gepraat.', 'On a parlé d’intelligence artificielle.'],
  ['P', 'Over AI? Wat heb je geleerd?', 'De l’IA ? Qu’as-tu appris ?'],
  ['S', 'Een computer kan leren, maar hij denkt niet zoals wij.', 'Un ordinateur peut apprendre, mais il ne pense pas comme nous.'],
  ['S', 'We moeten altijd controleren wat de computer zegt.', 'On doit toujours vérifier ce que dit l’ordinateur.'],
  ['P', 'Heel verstandig! En daarna?', 'Très sage ! Et après ?'],
  ['S', 'Daarna gingen we naar buiten, in de natuur.', 'Ensuite, on est sortis dans la nature.'],
  ['S', 'We zagen bladeren, bloemen en zelfs een egel!', 'On a vu des feuilles, des fleurs et même un hérisson !'],
  ['P', 'Een egel? Moeten we de natuur beschermen?', 'Un hérisson ? Doit-on protéger la nature ?'],
  ['S', 'Ja! We gooien geen afval op de grond.', 'Oui ! On ne jette pas de déchets par terre.'],
  ['P', 'Ik ben trots op jou, Soumaya.', 'Je suis fier de toi, Soumaya.'],
  ['S', 'Dank je wel, papa! Morgen vertel ik je meer!', 'Merci papa ! Demain, je t’en raconte plus !'],
];
// répliques déjà enregistrées (voix de Soumaya / voix clonée de Papa) : assets/voice/nl/hk/hkNN.ogg
const HK_REC = new Set(Array.from({ length: 30 }, (_, i) => i));
const HK_Q = [
  ['Hoe heet de school van Soumaya?', ['El Hikma', 'De Zon', 'Amira'], 'Son école s’appelle El Hikma.'],
  ['Hoe heet haar beste vriendin?', ['Amira', 'Hajar', 'de juf'], 'Sa meilleure amie s’appelle Amira.'],
  ['Hoeveel centimeter is een meter?', ['honderd', 'tien', 'duizend'], 'Un mètre = 100 centimètres (honderd).'],
  ['Wat hebben ze in de namiddag besproken?', ['artificiële intelligentie', 'de zee', 'muziek'], 'L’après-midi : l’intelligence artificielle.'],
  ['Welk dier hebben ze in de natuur gezien?', ['een egel', 'een olifant', 'een haai'], 'Ils ont vu un hérisson (een egel).'],
  ['Om hoe laat ging de bel?', ['om half negen', 'om twaalf uur', 'om drie uur'], 'La sonnerie : à 8 h 30 (half negen).'],
];
function hkPlay(i) {
  return new Promise((ok) => {
    let done = false; const fin = () => { if (!done) { done = true; ok(); } };
    if (!Sfx.soundOn()) { setTimeout(fin, 1200 + HK[i][1].length * 45); return; }
    if (HK_REC.has(i)) { const a = new Audio(`assets/voice/nl/hk/hk${String(i + 1).padStart(2, '0')}.ogg`); a.onended = fin; a.onerror = fin; a.play().catch(fin); setTimeout(fin, 15000); return; }
    try {
      if (!('speechSynthesis' in window)) { setTimeout(fin, 1500 + HK[i][1].length * 50); return; }
      speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(HK[i][1].replace(/"/g, ''));
      const vs = speechSynthesis.getVoices().filter((x) => /^nl/i.test(x.lang)).sort((a, b) => (/BE/i.test(b.lang) ? 1 : 0) - (/BE/i.test(a.lang) ? 1 : 0));
      const v = vs.length > 1 && HK[i][0] === 'P' ? vs[1] : vs[0];
      u.lang = v ? v.lang : 'nl-BE'; if (v) u.voice = v; u.rate = 0.85; u.pitch = HK[i][0] === 'S' ? 1.25 : 0.85;
      u.onend = fin; u.onerror = fin; speechSynthesis.speak(u); setTimeout(fin, 3000 + HK[i][1].length * 110);
    } catch (e) { fin(); }
  });
}
function hikma(body, talk) {
  let fr = true, role = false, run = 0;
  const chat = h('div', { class: 'hk-chat' });
  const bubble = (i, hide) => { const [w, nl, f] = HK[i]; const b = h('div', { class: 'hk-b ' + (w === 'S' ? 's' : 'p') + (hide ? ' me' : '') },
    h('span', { class: 'hk-who' }, w === 'S' ? '🧒 Soumaya' : '👨 Papa'), h('b', { class: 'hk-nl' }, hide ? '🎤 À toi ! Dis la réplique de Soumaya…' : nl), h('small', { class: 'hk-fr' }, f),
    h('button', { class: 'hk-play', type: 'button', 'aria-label': 'écouter', onclick: () => { if (hide) { b.classList.remove('me'); b.querySelector('.hk-nl').textContent = nl; } hkPlay(i); } }, '🔊'));
    return b; };
  const stop = () => { run++; try { speechSynthesis.cancel(); } catch (e) { /* */ } Voice.stop(); };
  const all = () => { stop(); chat.replaceChildren(...HK.map((_, i) => bubble(i, false))); };
  const play = async () => {
    stop(); const me = run; chat.replaceChildren();
    for (let i = 0; i < HK.length; i++) {
      if (me !== run || !chat.isConnected) return;
      const hide = role && HK[i][0] === 'S'; const b = bubble(i, hide); chat.append(b); b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (hide) { await new Promise((ok) => { const nx = h('button', { class: 'btn small primary hk-next', type: 'button', onclick: () => { nx.remove(); b.classList.remove('me'); b.querySelector('.hk-nl').textContent = HK[i][1]; hkPlay(i).then(ok); } }, '✔ J’ai dit ma réplique — écouter'); b.append(nx); }); await wait(400); }
      else { await hkPlay(i); await wait(450); }
    }
    if (me === run) { star(2); Sfx.win(); burst(body); talk('Goed zo ! Tu as suivi toute la journée de Soumaya à El Hikma !', false); }
  };
  const tFr = h('button', { class: 'btn small', type: 'button', onclick: () => { fr = !fr; chat.classList.toggle('nofr', !fr); tFr.textContent = fr ? '🇫🇷 Cacher la traduction' : '🇫🇷 Montrer la traduction'; } }, '🇫🇷 Cacher la traduction');
  const q = h('div');
  const quizHK = () => { stop(); let n = 0, ok = 0; const Q = shuffle(HK_Q.slice());
    const nx = () => { if (n >= Q.length) { q.replaceChildren(h('p', { class: 'tb-res' }, `Goed zo ! ${ok}/${Q.length}`)); if (ok >= 5) { star(2); Sfx.win(); burst(body); } return; }
      const [qq, opts, why] = Q[n++]; q.replaceChildren(h('p', { class: 'tb-q', style: 'font-size:clamp(17px,2.6vw,22px)' }, '❓ ' + qq), h('div', { class: 'actions wrap' }, ...shuffle(opts.map((o, k) => [o, k])).map(([o, k]) => h('button', { class: 'btn', type: 'button', 'data-testid': k === 0 ? 'hk-q-ok' : 'hk-q-ko', onclick: () => {
        q.querySelectorAll('button').forEach((b) => { b.disabled = true; }); if (k === 0) { ok++; Sfx.ok(); } else Sfx.ko();
        q.append(h('div', { class: 'ea-step' }, h('p', null, (k === 0 ? '✔ Juist! ' : '💡 ') + why)), h('button', { class: 'btn primary', type: 'button', onclick: nx }, 'Volgende ▶'));
      } }, o)))); };
    nx(); q.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  body.replaceChildren(
    h('img', { class: 'hk-img', src: 'assets/scenes/nl_hikma.webp', alt: 'Soumaya raconte sa journée à Papa' }),
    h('p', { class: 'prompt' }, '🏫 Ma journée à El Hikma : Soumaya raconte sa journée d’école à Papa, en néerlandais.'),
    h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'hk-play', onclick: () => { role = false; play(); } }, '▶️ Écouter le dialogue'), h('button', { class: 'btn', type: 'button', 'data-testid': 'hk-role', onclick: () => { role = true; play(); } }, '🎤 Je joue Soumaya'), h('button', { class: 'btn small', type: 'button', onclick: all }, '📜 Tout le texte'), tFr, h('button', { class: 'btn small', type: 'button', 'data-testid': 'hk-quiz', onclick: quizHK }, '❓ Questions')),
    chat, q);
  all();
}


// ---------- l'exposé de Soumaya sur Zidane, présenté en néerlandais à ses camarades d'El Hikma ----------
const ZX = [
  ['Hallo allemaal! Vandaag vertel ik over Zinédine Zidane, een echte voetballegende!', 'Bonjour à tous ! Aujourd’hui, je vous parle de Zinédine Zidane, une vraie légende du football !'],
  ['Hij heet Zinédine Zidane. Zijn bijnaam is Zizou. Hij is geboren op 23 juni 1972 in Marseille, in Frankrijk.', 'Il s’appelle Zinédine Zidane. Son surnom : Zizou. Il est né le 23 juin 1972 à Marseille, en France.'],
  ['Zijn ouders komen uit Algerije. Zijn vrouw heet Véronique. Hij heeft vier zonen, en ze spelen allemaal voetbal!', 'Ses parents viennent d’Algérie. Sa femme s’appelle Véronique. Il a quatre fils, tous footballeurs !'],
  ['Als kind voetbalt hij met zijn vriendjes in zijn wijk. Op 9 jaar gaat hij naar zijn eerste club, en op 15 jaar vertrekt hij naar Cannes.', 'Enfant, il joue au foot avec ses copains dans son quartier. À 9 ans, il entre dans son premier club, et à 15 ans il part à Cannes.'],
  ['In 1998 wint hij de Wereldbeker, met twee kopgoals in de finale! Daarna wint hij ook het EK en de Champions League.', 'En 1998, il gagne la Coupe du monde avec 2 buts de la tête en finale ! Puis il gagne aussi l’Euro et la Ligue des champions.'],
  ['Hij speelde in vier grote clubs: Cannes, Bordeaux, Juventus en Real Madrid. En hij speelde 108 keer voor Frankrijk!', 'Il a joué dans 4 grands clubs : Cannes, Bordeaux, la Juventus et le Real Madrid. Et 108 fois pour l’équipe de France !'],
  ['Waarom was hij zo goed? Hij had een techniek als een tovenaar. Zijn bekende truc is de roulette: voet op de bal, ik draai, en ik vertrek weer!', 'Pourquoi était-il si fort ? Une technique de magicien ! Son geste célèbre : la roulette — pied sur le ballon, je tourne, je repars !'],
  ['Nu is Zizou trainer. Hij leert ons drie dingen: trainen, samenspelen en leren van je fouten.', 'Aujourd’hui, Zizou est entraîneur. Il nous apprend 3 choses : s’entraîner, jouer en équipe et apprendre de ses erreurs.'],
  ['Kleine quiz! Wat is de bijnaam van Zidane? Zizou natuurlijk! Dank je wel voor het luisteren. Hebben jullie vragen?', 'Petit quiz ! Quel est le surnom de Zidane ? Zizou, bien sûr ! Merci de m’avoir écoutée. Avez-vous des questions ?'],
];
const ZX_END = ['Dank jullie wel, lieve klasgenoten! Ik heb een verrassing voor jullie: een taart in de vorm van een Gouden Bal! Smakelijk!', 'Merci, mes chers camarades ! Je vous ai préparé une surprise : un gâteau en forme de Ballon d’or ! Bonne dégustation !'];
// version française (rubrique expression orale) : texte dit + petit conseil d'orateur à chaque diapo
const ZF = [
  ['Bonjour à tous ! Aujourd’hui, je vais vous présenter Zinédine Zidane, une vraie légende du football !', 'Souris et regarde toute la classe avant de commencer.'],
  ['Alors, qui est-il ? Il s’appelle Zinédine Zidane, et son surnom, c’est Zizou ! Il est né le 23 juin 1972, à Marseille, en France.', 'Parle fort et articule bien les noms et les dates.'],
  ['Zizou a aussi une famille. Ses parents, Smaïl et Malika, sont venus d’Algérie en France. Sa femme s’appelle Véronique. Et ils ont quatre fils… tous footballeurs !', 'Fais une petite pause avant la surprise : « tous footballeurs ! »'],
  ['Quand il était petit, Zizou jouait au foot avec ses copains dans son quartier, comme vous dans la cour de récréation ! À 9 ans, il entre dans son premier club. Et à 15 ans, il part à Cannes pour devenir footballeur.', 'Fais un lien avec ton public : « comme vous dans la cour ! »'],
  ['Zizou a gagné des choses très importantes. En 1998, la Coupe du monde, avec deux buts de la tête en finale ! En 2000, il devient champion d’Europe. Et en 2002, il marque un but de volée magique en Ligue des champions !', 'Mets de l’enthousiasme dans ta voix pour raconter les exploits.'],
  ['Zizou a joué dans quatre grands clubs : Cannes et Bordeaux en France, la Juventus en Italie, et le Real Madrid en Espagne. Et il a joué 108 fois avec l’équipe de France !', 'Montre chaque club sur l’écran avec ta main.'],
  ['Pourquoi était-il si fort ? Il avait une technique de magicien, des passes très précises, et le ballon collé au pied. Regardez sa roulette : pied sur le ballon, je tourne… et je repars ! Attention, la roulette, ça ne se mange pas !', 'Laisse la vidéo tourner, puis explique les 3 étapes de la roulette.'],
  ['Quand il a arrêté de jouer, Zizou est devenu entraîneur. Avec le Real Madrid, il a gagné trois Ligues des champions de suite ! Et depuis 2026, il entraîne l’équipe de France. Zizou nous apprend trois choses : s’entraîner, jouer en équipe, et apprendre de ses erreurs.', 'Ralentis pour la leçon de Zizou : c’est ton message important.'],
  ['C’est l’heure du quiz ! Levez la main pour répondre. Quel est le surnom de Zidane ? Dans quelle ville est-il né ? Et combien de buts a-t-il marqués en finale en 1998 ? Merci de m’avoir écoutée ! Avez-vous des questions ?', 'Attends que tes camarades lèvent la main et félicite les bonnes réponses.'],
];
const ZF_END = ['Merci, mes chers camarades ! Je vous ai préparé une surprise : un gâteau en forme de Ballon d’or ! Bonne dégustation à tous !', 'Remercie ton public en le regardant : bravo, ton exposé est terminé !'];
// diapo 7 : la vidéo de la roulette tourne à l'emplacement prévu dans le PowerPoint (sans le son, pour ne pas couvrir la voix)
const ROULETTE = { i: 6, x: 51.88, y: 18.52, w: 20.73, h: 51.85 };
function expose(body, lang = 'nl') {
  const FR = lang === 'fr', N = FR ? ZF.length : ZX.length;
  let k = 0, auto = true, el = null, tm = 0, lipIdx = 0;
  const shot = h('img', { class: 'zx-slide', alt: '', src: asset(`assets/expose/zidane_${lang}_1.webp`) });
  const vid = h('video', { class: 'zx-vid', muted: true, loop: true, playsinline: true, preload: 'auto', 'data-testid': 'zx-roulette', src: asset('assets/expose/roulette.webm') });
  vid.muted = true; vid.style.cssText = `left:${ROULETTE.x}%;top:${ROULETTE.y}%;width:${ROULETTE.w}%;height:${ROULETTE.h}%`;
  const sl = h('div', { class: 'zx-sl' }, shot, vid);
  const tv = h('div', { class: 'zx-tv' }, h('div', { class: 'zx-screen' }, sl), h('i', { class: 'zx-neck' }), h('i', { class: 'zx-foot' }));
  const kid = h('img', { class: 'zx-kid', alt: 'Soumaya en maillot du Real Madrid', src: asset('assets/sprites/soumaya/rm_parle.webp') });
  const nl = h('p', { class: 'zx-nl' }), fr = h('p', { class: FR ? 'zx-fr zx-tip' : 'zx-fr' }), num = h('span', { class: 'zx-num' });
  const stage = h('div', { class: 'zx-stage' }, tv, kid);
  const prev = h('button', { class: 'btn', type: 'button', onclick: () => show(Math.max(0, k - 1)) }, '◀');
  const pp = h('button', { class: 'btn', type: 'button', 'data-testid': 'zx-auto', onclick: () => { auto = !auto; pp.textContent = auto ? '⏸ Pause' : '▶️ Lecture auto'; if (auto && el && el.ended) next(); } }, '⏸ Pause');
  const nxt = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'zx-next', onclick: () => next() }, 'Suivant ▶');
  const roul = (on) => { vid.classList.toggle('on', on); try { if (on) { vid.currentTime = 0; const p = vid.play(); if (p && p.catch) p.catch(() => {}); } else vid.pause(); } catch (e) { /* lecture vidéo indisponible */ } };
  // Soumaya présente comme une vraie oratrice : elle se déplace de quelques pas, regarde ses camarades,
  // se tourne vers l'écran et le montre du doigt quand la diapo le demande (changement doux toutes les ~3 s)
  const PL = [
    ['classe', 'montre', 'classe', 'classe'],
    ['classe', 'montre', 'classe', 'classe'],
    ['classe', 'coeur', 'montre', 'coeur'],
    ['classe', 'montre', 'classe', 'classe'],
    ['montre', 'joie', 'classe', 'joie'],
    ['montre', 'classe', 'classe', 'montre'],
    ['pointe', 'classe', 'trois', 'montre'],
    ['classe', 'montre', 'trois', 'classe'],
    ['main', 'classe', 'main', 'classe'],
  ];
  // pointeur laser rouge : cibles (en % de la diapo) pour chaque diapo
  const LASER = [[[30, 32], [42, 62]], [[38, 30], [55, 55]], [[30, 30], [50, 62]], [[28, 40], [70, 55]], [[22, 45], [52, 45]], [[25, 50], [75, 50]], [[62, 45], [62, 60]], [[35, 30], [45, 70]], [[30, 35], [30, 60]]];
  const laser = h('i', { class: 'zx-laser', 'aria-hidden': 'true' }); sl.append(laser);
  let lz = 0;
  const laserOn = (on) => { laser.classList.toggle('on', on); if (on) { const L = LASER[k] || [[50, 50]]; const [x, y] = L[lz++ % L.length]; laser.style.left = x + '%'; laser.style.top = y + '%'; } };
  const FILE = { classe: 'rm_parle', pointe: 'rm_ecran', montre: 'rm_montre', joie: 'rm_joie', trois: 'rm_trois', main: 'rm_main', coeur: 'rm_coeur' };
  // position horizontale (en % de sa largeur) : vers l'écran quand elle le montre, au centre face à la classe
  const POSX = { classe: [0, 6, -4], pointe: [-30, -24], montre: [-16, -10], joie: [0], trois: [2, -3], main: [0, 4], coeur: [-2, 3] };
  let pt = 0, step = 0;
  const setPose = (k) => {
    const xs = POSX[k] || [0]; const x = xs[step++ % xs.length];
    kid.style.translate = `${Math.max(-6, Math.min(6, x / 4))}% 0`;
    laserOn(k === 'montre' || k === 'pointe');
    const src = asset(`assets/sprites/soumaya/${FILE[k]}.webp`); if (kid.getAttribute('src') === src) return;
    kid.classList.add('zx-fade'); setTimeout(() => { kid.src = src; kid.classList.remove('zx-fade'); }, 180);
  };
  // ---- Soumaya synchronisée sur sa voix : une vidéo 3D détourée par phrase (lèvres calées sur l'audio),
  // elle reste à sa place à droite de l'écran et le montre du doigt de loin (laser rouge pendant le geste) ----
  const LIPS = ZX_LIPS;
  const LIP = (LIPS[lang] || {});
  const canVid = (() => { try { const v = document.createElement('video'); return !!v.canPlayType('video/webm; codecs="vp9"') && !/iPhone|iPad|Macintosh.*Safari(?!.*Chrome)/.test(navigator.userAgent); } catch (e) { return false; } })();
  const pv = [0, 1].map(() => { const v = h('video', { class: 'zx-pres', muted: true, playsinline: true, preload: 'auto', 'aria-hidden': 'true' }); v.muted = true; return v; });
  let cur = 0, vidOk = canVid && Object.keys(LIP).length > 0, raf = 0, segNow = -1, slideSegs = null, lzT = 0;
  const vSrc = (f) => asset(`assets/expose/lips/${f}.webm`) + EXPV;
  function showV(v) { pv.forEach((x) => x.classList.toggle('on', x === v)); cur = pv.indexOf(v); }
  function loadSeg(j) { const sg = slideSegs && slideSegs[j]; if (!sg) return null; const v = pv[cur ^ 1]; v.src = vSrc(sg.f); v.load(); return v; }
  function laserAt(t) { const sg = slideSegs && slideSegs[segNow]; const on = !!(sg && sg.lz && sg.lz.some(([x, y]) => t - sg.off >= x && t - sg.off <= y)); if (on !== laser.classList.contains('on')) laserOn(on); }
  function startSeg(j, t0) {
    const sg = slideSegs[j]; if (!sg) return; segNow = j;
    let v = pv[cur ^ 1]; if (!v.src.includes(sg.f + '.webm')) { v.src = vSrc(sg.f); }
    try { v.currentTime = Math.max(0, t0 || 0); } catch (e) { /* pas encore chargé */ }
    const p = v.play(); const go = () => { showV(v); pv[cur ^ 1].pause(); if (slideSegs[j + 1]) loadSeg(j + 1); };
    if (p && p.then) p.then(go).catch((e) => { if (e && e.name === 'NotSupportedError') { if ((v._try = (v._try || 0) + 1) <= 2) { setTimeout(() => { v.src = vSrc(sg.f) + '&r=' + Date.now(); startSeg(j, t0); }, 400); } else useSprites(); } }); else go();
  }
  // suit l'horloge de la voix : change de morceau à la bonne seconde et corrige toute dérive
  // Soumaya vivante : rebonds sur les mots forts, balancement d'un pied sur l'autre, petite penchée quand elle insiste
  // (elle ne se déplace que vers la droite, jamais devant l'écran)
  const ENV = (ZX_ENV[lang] || {});
  let sm = 0, hop = 0, prevE = 0, lastT = 0;
  function move(t, talking) {
    const ev = ENV[lipIdx + 1] || ''; const e = talking ? (+ev[Math.floor(t * 10)] || 0) / 9 : 0;
    sm += (e - sm) * 0.18; if (talking && e - prevE > 0.45) hop = 1; prevE = e;
    const now = performance.now() / 1000, dt = Math.min(0.1, now - (lastT || now)); lastT = now; hop = Math.max(0, hop - dt * 3.2);
    // pas de sautillement : elle se penche vers sa classe sur les mots forts et se balance doucement
    const x = 1.8 + 1.8 * Math.sin(now * 0.6), r = Math.sin(now * 0.5) * 0.6 - sm * 1.2, sc = 1 + sm * 0.035;
    const tf = `translateX(${x.toFixed(2)}%) rotate(${r.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    pv.forEach((v) => { v.style.transform = tf; });
  }
  function follow(el) {
    cancelAnimationFrame(raf);
    const tick = () => {
      if (!slideSegs) return;
      const t = el ? el.currentTime : (performance.now() - follow.t0) / 1000;
      if (el && el.paused && el.currentTime === 0) { const v0 = pv[cur]; if (v0 && !v0.paused) { v0.pause(); try { v0.currentTime = 0; } catch (e) { /* rien */ } } raf = requestAnimationFrame(tick); return; }
      if (el && !el.paused && pv[cur] && pv[cur].paused && segNow >= 0) { const pp = pv[cur].play(); if (pp && pp.catch) pp.catch(() => {}); }
      let j = 0; slideSegs.forEach((sg, n) => { if (t >= sg.off) j = n; });
      if (j !== segNow) startSeg(j, t - slideSegs[j].off);
      else { const v = pv[cur], want = t - slideSegs[j].off; if (v && !v.paused && Math.abs(v.currentTime - want) > 0.2 && want < (v.duration || 99)) { try { v.currentTime = want; } catch (e) { /* rien */ } } }
      laserAt(t);
      move(t, el && !el.paused);
      if (el && el.ended) { pv[cur].pause(); laserOn(false); return; }
      if (el && el.paused && el.currentTime > 0.3) { if (!pv[cur].paused) pv[cur].pause(); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  function lipStart(i, el) {
    if (!vidOk) return;
    slideSegs = LIP[i + 1] || null; segNow = -1; if (!slideSegs) return;
    follow.t0 = performance.now(); startSeg(0, 0); follow(el);
  }
  function useSprites() { vidOk = false; cancelAnimationFrame(raf); pv.forEach((v) => { v.pause(); v.classList.remove('on'); }); kid.style.display = ''; stage.classList.remove('zx-vidmode'); poseLoop(k); }
  if (vidOk) { kid.style.display = 'none'; stage.classList.add('zx-vidmode'); stage.append(...pv); }
  function presFor(i) { if (!vidOk) poseLoop(i); else { slideSegs = LIP[i + 1] || null; segNow = -1; laserOn(false); if (slideSegs) { const v = pv[cur ^ 1]; v.src = vSrc(slideSegs[0].f); v.load(); } } }
  function presJoie() { if (!vidOk) { clearInterval(pt); setPose('joie'); } }
  function presStop() { clearTimeout(lzT); cancelAnimationFrame(raf); pv.forEach((v) => { try { v.pause(); } catch (e) { /* rien */ } }); }
  function poseLoop(i) { clearInterval(pt); const L = PL[i] || ['classe']; let j = 0; setPose(L[0]); pt = setInterval(() => { j = (j + 1) % L.length; setPose(L[j]); }, 3100); }
  const stop = () => { clearTimeout(tm); clearInterval(pt); laser.classList.remove('on'); if (typeof presStop === 'function') presStop(); roul(false); if (el) Voice.fadeOutEl(el); el = null; };
  const voice = (src, after) => { clearTimeout(tm); if (el) Voice.fadeOutEl(el); el = null; if (!Sfx.soundOn()) { lipStart(lipIdx, null); tm = setTimeout(after, 6500); return; } el = Voice.playUrl(src); lipStart(lipIdx, el); if (el) { const mine = el; el.addEventListener('pause', () => { if (el !== mine || mine.ended) return; let n = 0; const rt = setInterval(() => { n++; if (el !== mine || mine.ended || n > 80) { clearInterval(rt); return; } if (mine.paused && !Voice.isTalking()) { clearInterval(rt); try { mine.volume = 1; const pr = mine.play(); if (pr && pr.catch) pr.catch(() => {}); } catch (e) { /* rien */ } } }, 300); }); el.addEventListener('ended', () => { tm = setTimeout(after, FR ? 700 : 700); }, { once: true }); el.addEventListener('error', () => { tm = setTimeout(after, 6000); }, { once: true }); } else tm = setTimeout(after, 6000); };
  // préchargement de la diapo suivante (voix + vidéos) pendant que Soumaya parle : elle commence à parler dès que la diapo s'affiche
  const pre = new Set(), preA = [];
  function prefetch(j) {
    if (j > N) return;
    const urls = [asset(`assets/voice/expose/${FR ? 'zf' : 'z'}${j + 1}.ogg`) + EXPV, asset(`assets/expose/zidane_${lang}_${Math.min(j + 1, N)}.webp`)];
    if (vidOk) (LIP[j + 1] || []).forEach((sg) => urls.push(vSrc(sg.f)));
    urls.forEach((u) => { if (pre.has(u)) return; pre.add(u); try { fetch(u).catch(() => {}); } catch (e) { /* rien */ } if (/\.ogg/.test(u)) { try { const a = new Audio(u); a.preload = 'auto'; preA.push(a); } catch (e) { /* rien */ } } });
  }
  function next() { if (k < N - 1) show(k + 1); else finale(); }
  function show(i) {
    k = i; const sSrc = asset(`assets/expose/zidane_${lang}_${i + 1}.webp`); let shown = false; const reveal = () => { if (shown || k !== i) return; shown = true; shot.src = sSrc; num.textContent = `${i + 1} / ${N}`; };
    if (FR) { nl.textContent = '🎤 ' + ZF[i][0]; fr.textContent = '💡 Conseil d’oratrice : ' + ZF[i][1]; }
    else { nl.textContent = '🇳🇱 ' + ZX[i][0]; fr.textContent = '🇫🇷 ' + ZX[i][1]; }
    presFor(i); lipIdx = i; prefetch(i + 1); if (i === 0) prefetch(N);
    stage.classList.remove('zx-end'); prev.disabled = i === 0; roul(i === ROULETTE.i);
    voice(`assets/voice/expose/${FR ? 'zf' : 'z'}${i + 1}.ogg${EXPV}`, () => { if (auto) next(); });
    // la dia apparaît au moment où Soumaya commence à parler (plus de décalage entre l'image et la voix)
    if (el) { el.addEventListener('playing', reveal, { once: true }); setTimeout(reveal, 1500); } else reveal();
  }
  function finale() {
    stop(); stage.classList.add('zx-end'); shot.src = asset('assets/expose/gateau_ballon_or.webp'); num.textContent = '🎂';
    presJoie(); lipIdx = 9; if (vidOk) presFor(9);
    if (FR) { nl.textContent = '🎤 ' + ZF_END[0]; fr.textContent = '💡 ' + ZF_END[1]; } else { nl.textContent = '🇳🇱 ' + ZX_END[0]; fr.textContent = '🇫🇷 ' + ZX_END[1]; }
    burst(body); Sfx.win(); voice(`assets/voice/expose/${FR ? 'zf' : 'z'}10.ogg${EXPV}`, () => {});
  }
  body.replaceChildren(h('div', { class: 'zx-wrap' + (FR ? ' zx-fr-mode' : '') }, stage, h('div', { class: 'zx-side' }, h('div', { class: 'zx-cap' }, num, nl, fr), h('div', { class: 'actions wrap' }, prev, pp, nxt))));
  show(0);
  return stop;
}

let zxStop = null;
// l'exposé s'ouvre dans sa propre fenêtre, en grand, pour voir toute la présentation
export function openExpose(lang = 'nl') {
  const body = h('div'); let stop = null;
  const title = lang === 'fr' ? '🎤 Expression orale : l’exposé de Soumaya sur Zinédine Zidane 🇫🇷' : '⚽ L’exposé de Soumaya : Zinédine Zidane 🇳🇱';
  // pendant l'exposé : pas de musique d'ambiance ni de petites phrases de Papa par-dessus Soumaya
  try { Sfx.stopAmbient(); if (window.__hushPapa) window.__hushPapa(); window.__zxOpen = true; } catch (e) { /* rien */ }
  UI.openDialog(h('div', { class: 'panel zx-panel' }, UI.closeButton(), h('h2', null, title), body), { label: 'L’exposé de Soumaya sur Zidane', onClose: () => { window.__zxOpen = false; Voice.stop(); if (stop) stop(); } });
  stop = expose(body, lang);
}
export function open(tab = 'moi') {
  if (tab === 'zidane') { openExpose(); return; }
  const sayEl = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { sayEl.textContent = s; if (v) Voice.speak(s); };
  const body = h('div'), head = h('div');
  const T = [...THEMES.map(([k, l]) => [k, l, (b, t) => cartes(b, t, k)]), ['quiz', '🎧 Écoute et trouve', quiz], ['dialogue', '💬 Petit dialogue', dialogue], ['dieren', '🦊 Wat eten de dieren?', dieren], ['hikma', '🏫 Ma journée à El Hikma', hikma], ['flandre', '🗺️ Missions en Flandre', VL.missions], ['motsbe', '🧠 Mots de Belgique', VL.mots], ['bilan', '📋 Bilan pour Papa', VL.bilan], ['zidane', '⚽ Mon exposé : Zidane', () => { setTimeout(() => openExpose('nl'), 50); }]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'nl-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ea-panel' }, UI.closeButton(), h('h2', null, '🌷 La Maison du Néerlandais'), head, h('div', { class: 'actions wrap' }, ...tabs), body, sayEl), { label: 'La Maison du Néerlandais', onClose: () => { Voice.stop(); if (zxStop) { zxStop(); zxStop = null; } } });
  function go(k) { Voice.stop(); if (zxStop) { zxStop(); zxStop = null; } const st = ST(); head.replaceChildren(st.badge ? h('b', { class: 'tb-badge' }, '🌷 Petite néerlandophone !') : h('small', { class: 'muted' }, `${Object.keys(st.heard).length}/${W.length} mots écoutés`), h('small', { class: 'muted vl-head' }, ` · ${VL.NV().stars} ⭐ · ${VL.NV().badges.length} badge(s)`)); tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
