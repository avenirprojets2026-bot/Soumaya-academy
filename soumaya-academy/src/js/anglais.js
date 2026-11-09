// La Maison de l'Anglais (niveaux Pré-A1 et A1, surtout oral) : chaque mot est dit par la voix anglaise de l'appareil,
// l'enfant écoute, répète, puis joue à « Listen and find », au petit dialogue, à « My school day » et « At the riding school ».
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { playFile } from './papa.js';
import { burst, shuffle } from './workshop.js';
import * as English from './english.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.en = b.en || { heard: {}, quiz: 0, dial: false }; return b.en; };
// voix anglaise de l'appareil (britannique de préférence), un peu plus lente pour un enfant
function speakEN(text, pitch = 1.1) {
  try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text);
    const v = speechSynthesis.getVoices().filter((x) => /^en/i.test(x.lang)).sort((a, b) => (/GB/i.test(b.lang) ? 1 : 0) - (/GB/i.test(a.lang) ? 1 : 0))[0];
    u.lang = v ? v.lang : 'en-GB'; if (v) u.voice = v; u.rate = 0.82; u.pitch = pitch; speechSynthesis.speak(u); } catch (e) { /* sans voix */ }
}
const speakNL = speakEN;
const W = [["hello", "Hello!", "Bonjour ! / Salut !", "👋", "moi"], ["goodmorning", "Good morning!", "Bonjour ! (le matin)", "🌅", "moi"], ["myname", "My name is Soumaya.", "Je m’appelle Soumaya.", "🙋‍♀️", "moi"], ["whatname", "What’s your name?", "Comment t’appelles-tu ?", "❓", "moi"], ["howareyou", "How are you?", "Comment ça va ?", "🙂", "moi"], ["fine", "I’m fine, thank you!", "Je vais bien, merci !", "👍", "moi"], ["please", "Please.", "S’il te plaît.", "🎁", "moi"], ["thankyou", "Thank you!", "Merci !", "🙏", "moi"], ["ilivein", "I live in Belgium.", "J’habite en Belgique.", "🇧🇪", "moi"], ["goodbye", "Goodbye!", "Au revoir !", "👋", "moi"], ["n1", "one", "un — 1", "1️⃣", "chiffres"], ["n2", "two", "deux — 2", "2️⃣", "chiffres"], ["n3", "three", "trois — 3", "3️⃣", "chiffres"], ["n4", "four", "quatre — 4", "4️⃣", "chiffres"], ["n5", "five", "cinq — 5", "5️⃣", "chiffres"], ["n6", "six", "six — 6", "6️⃣", "chiffres"], ["n7", "seven", "sept — 7", "7️⃣", "chiffres"], ["n8", "eight", "huit — 8", "8️⃣", "chiffres"], ["n9", "nine", "neuf — 9", "9️⃣", "chiffres"], ["n10", "ten", "dix — 10", "🔟", "chiffres"], ["n11", "eleven", "onze — 11", "11", "chiffres"], ["n12", "twelve", "douze — 12", "12", "chiffres"], ["n13", "thirteen", "treize — 13", "13", "chiffres"], ["n14", "fourteen", "quatorze — 14", "14", "chiffres"], ["n15", "fifteen", "quinze — 15", "15", "chiffres"], ["n16", "sixteen", "seize — 16", "16", "chiffres"], ["n17", "seventeen", "dix-sept — 17", "17", "chiffres"], ["n18", "eighteen", "dix-huit — 18", "18", "chiffres"], ["n19", "nineteen", "dix-neuf — 19", "19", "chiffres"], ["n20", "twenty", "vingt — 20", "20", "chiffres"], ["red", "red", "rouge", "🔴", "couleurs"], ["blue", "blue", "bleu", "🔵", "couleurs"], ["yellow", "yellow", "jaune", "🟡", "couleurs"], ["green", "green", "vert", "🟢", "couleurs"], ["orange", "orange", "orange", "🟠", "couleurs"], ["white", "white", "blanc", "⚪", "couleurs"], ["black", "black", "noir", "⚫", "couleurs"], ["pink", "pink", "rose", "🩷", "couleurs"], ["purple", "purple", "violet", "🟣", "couleurs"], ["brown", "brown", "marron", "🟤", "couleurs"], ["monday", "Monday", "lundi", "1", "jours"], ["tuesday", "Tuesday", "mardi", "2", "jours"], ["wednesday", "Wednesday", "mercredi", "3", "jours"], ["thursday", "Thursday", "jeudi", "4", "jours"], ["friday", "Friday", "vendredi", "5", "jours"], ["saturday", "Saturday", "samedi", "6", "jours"], ["sunday", "Sunday", "dimanche", "7", "jours"], ["house", "a house", "une maison", "🏠", "maison"], ["kitchen", "the kitchen", "la cuisine", "🍳", "maison"], ["bedroom", "the bedroom", "la chambre", "🛏️", "maison"], ["bathroom", "the bathroom", "la salle de bain", "🛁", "maison"], ["garden", "the garden", "le jardin", "🌷", "maison"], ["table", "a table", "une table", "🍽️", "maison"], ["door", "a door", "une porte", "🚪", "maison"], ["window", "a window", "une fenêtre", "🪟", "maison"], ["apple", "an apple", "une pomme", "🍎", "manger"], ["bread", "bread", "du pain", "🍞", "manger"], ["cheese", "cheese", "du fromage", "🧀", "manger"], ["milk", "milk", "du lait", "🥛", "manger"], ["water", "water", "de l’eau", "💧", "manger"], ["banana", "a banana", "une banane", "🍌", "manger"], ["hungry", "I’m hungry.", "J’ai faim.", "😋", "manger"], ["thirsty", "I’m thirsty.", "J’ai soif.", "🥤", "manger"], ["happy", "I’m happy.", "Je suis contente.", "😊", "gouts"], ["tired", "I’m tired.", "Je suis fatiguée.", "😴", "gouts"], ["sad", "I’m sad.", "Je suis triste.", "😢", "gouts"], ["yummy", "It’s yummy!", "C’est délicieux !", "😋", "gouts"], ["ilikemusic", "I like music.", "J’aime la musique.", "🎵", "gouts"], ["idontlike", "I don’t like spiders.", "Je n’aime pas les araignées.", "🕷️", "gouts"], ["morning", "the morning", "le matin", "🌅", "journee"], ["afternoon", "the afternoon", "l’après-midi", "☀️", "journee"], ["evening", "the evening", "le soir", "🌆", "journee"], ["night", "the night", "la nuit", "🌙", "journee"], ["getup", "I get up.", "Je me lève.", "⏰", "journee"], ["goschool", "I go to school.", "Je vais à l’école.", "🏫", "journee"], ["gobed", "I go to bed.", "Je vais me coucher.", "😴", "journee"], ["teacher", "the teacher", "la maîtresse / le professeur", "👩‍🏫", "ecole"], ["pencil", "a pencil", "un crayon", "✏️", "ecole"], ["book", "a book", "un livre", "📕", "ecole"], ["schoolbag", "a schoolbag", "un cartable", "🎒", "ecole"], ["classroom", "the classroom", "la classe", "🏫", "ecole"], ["playground", "the playground", "la cour de récré", "🛝", "ecole"], ["openbook", "Open your book, please.", "Ouvre ton livre, s’il te plaît.", "📖", "ecole"], ["understand", "I don’t understand.", "Je ne comprends pas.", "🤔", "ecole"], ["canirepeat", "Can you repeat, please?", "Tu peux répéter, s’il te plaît ?", "🔁", "ecole"], ["mother", "my mother", "ma maman", "👩", "famille"], ["father", "my father", "mon papa", "👨", "famille"], ["brother", "my brother", "mon frère", "👦", "famille"], ["sister", "my sister", "ma sœur", "👧", "famille"], ["grandma", "my grandmother", "ma grand-mère", "👵", "famille"], ["grandpa", "my grandfather", "mon grand-père", "👴", "famille"], ["ihavebrother", "I have a sister, Hajar, and a little brother, Zakaria.", "J’ai une sœur, Hajar, et un petit frère, Zakaria.", "👦", "famille"], ["cat", "a cat", "un chat", "🐱", "animaux"], ["dog", "a dog", "un chien", "🐶", "animaux"], ["horse", "a horse", "un cheval", "🐴", "animaux"], ["bird", "a bird", "un oiseau", "🐦", "animaux"], ["fish", "a fish", "un poisson", "🐟", "animaux"], ["rabbit", "a rabbit", "un lapin", "🐰", "animaux"], ["mycat", "My cat is grey.", "Mon chat est gris.", "🐈", "animaux"], ["tshirt", "a T-shirt", "un t-shirt", "👕", "vetements"], ["trousers", "trousers", "un pantalon", "👖", "vetements"], ["dress", "a dress", "une robe", "👗", "vetements"], ["shoes", "shoes", "des chaussures", "👟", "vetements"], ["hat", "a hat", "un chapeau", "👒", "vetements"], ["coat", "a coat", "un manteau", "🧥", "vetements"], ["iwear", "I’m wearing a blue dress.", "Je porte une robe bleue.", "💙", "vetements"], ["sunny", "It’s sunny.", "Il fait beau / il y a du soleil.", "☀️", "meteo"], ["rainy", "It’s raining.", "Il pleut.", "🌧️", "meteo"], ["cold", "It’s cold.", "Il fait froid.", "🥶", "meteo"], ["hot", "It’s hot.", "Il fait chaud.", "🥵", "meteo"], ["windy", "It’s windy.", "Il y a du vent.", "💨", "meteo"], ["weather", "What’s the weather like?", "Quel temps fait-il ?", "🌤️", "meteo"], ["football", "I play football.", "Je joue au foot.", "⚽", "loisirs"], ["harp", "I play the harp.", "Je joue de la harpe.", "🎼", "loisirs"], ["swim", "I can swim.", "Je sais nager.", "🏊", "loisirs"], ["read", "I like reading.", "J’aime lire.", "📚", "loisirs"], ["draw", "I like drawing.", "J’aime dessiner.", "🎨", "loisirs"], ["canyou", "Can you play with me?", "Tu peux jouer avec moi ?", "🤝", "loisirs"], ["favourite", "I love my cat Muezza.", "J’adore mon chat Muezza.", "🐱", "loisirs"]];
const say = (id) => { if (!Sfx.soundOn()) return; if (id === 'bravo') { speakEN('Well done!'); return; } const w = W.find((x) => x[0] === id); if (w) speakEN(w[1]); };
const THEMES = [["moi", "👋 Me présenter", "pre"], ["chiffres", "🔢 Les nombres", "pre"], ["couleurs", "🎨 Les couleurs", "pre"], ["jours", "📅 Les jours", "pre"], ["maison", "🏠 La maison", "pre"], ["manger", "🍎 Manger et boire", "pre"], ["gouts", "😊 Je ressens, j’aime", "pre"], ["journee", "🌙 Ma journée", "pre"], ["ecole", "🏫 À l’école", "a1"], ["famille", "👨‍👩‍👧‍👦 La famille", "a1"], ["animaux", "🐾 Les animaux", "a1"], ["vetements", "👕 Les vêtements", "a1"], ["meteo", "🌦️ La météo", "a1"], ["loisirs", "⚽ Mes loisirs", "a1"]];
const themeOf = (t) => W.filter((w) => w[4] === t);
const checkBadge = () => { const st = ST(); const all = THEMES.filter((t) => t[2] === 'pre').every(([t]) => themeOf(t).some((w) => st.heard[w[0]])); if (all && st.quiz >= 6 && st.dial) st.badge = true; S.save(); };

// ---------- les cartes qui parlent ----------
function cartes(body, talk, theme) {
  const st = ST(), list = themeOf(theme);
  const count = h('small', { class: 'muted' });
  const upd = () => { count.textContent = `${list.filter((w) => st.heard[w[0]]).length}/${list.length} mots écoutés`; };
  const grid = h('div', { class: 'nl-grid' }, ...list.map(([id, nl, fr, emo]) => {
    const c = h('button', { class: 'nl-card' + (st.heard[id] ? ' seen' : ''), type: 'button', 'data-testid': 'en-' + id, onclick: () => {
      Voice.stop(); say(id); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop', 'seen');
      talk(`« ${nl} » veut dire « ${fr} ». À toi : répète à voix haute !`, false);
      if (!st.heard[id]) { st.heard[id] = true; S.save(); upd(); if (list.every((w) => st.heard[w[0]])) { star(1); Sfx.win(); burst(body); talk('Bravo ! Tu as écouté tous les mots de ce thème. Well done!', false); } checkBadge(); }
    } }, h('span', { class: 'nl-emo' }, theme === 'jours' ? '📅' : emo), h('b', null, nl), h('small', null, fr), h('i', { class: 'nl-play' }, '🔊'));
    return c;
  }));
  const TIPS = { jours: 'En anglais, les jours prennent toujours une majuscule et finissent tous par « day » (jour) !', chiffres: 'De 13 à 19, on ajoute « -teen » : thirteen, fourteen… Attention : « fifteen » et non « fiveteen » !', maison: '« a » = un/une, « the » = le/la. Devant une voyelle, « a » devient « an » : an apple !', manger: '« a » = un/une, « the » = le/la. Devant une voyelle, « a » devient « an » : an apple !', couleurs: 'En anglais, la couleur se met AVANT le mot : a pink dress (une robe rose).', ecole: 'Niveau A1 : des petites phrases utiles en classe. Dis-les à voix haute !', famille: 'Niveau A1 : « my » = mon/ma/mes. My father, my mother…', meteo: 'Niveau A1 : pour la météo, on commence par « It’s… » : It’s sunny!', loisirs: 'Niveau A1 : « I like… » = j’aime… ; « I can… » = je sais…', vetements: 'Niveau A1 : « I’m wearing… » = je porte…', animaux: 'Niveau A1 : la couleur avant l’animal : a grey cat.' };
  const tip = TIPS[theme] || 'Touche une carte : écoute le mot en anglais. Puis répète à voix haute !';
  const tel = theme === 'chiffres' ? h('button', { class: 'btn nl-tel', type: 'button', 'data-testid': 'en-tel20', onclick: async () => { Voice.stop(); talk('Compte de 1 à 20 en anglais !', false); for (let k = 1; k <= 20 && Sfx.soundOn(); k++) { speakEN(W.find((w) => w[0] === 'n' + k)[1]); await wait(900); } } }, '▶️ Compter de 1 à 20') : null;
  body.replaceChildren(h('p', { class: 'prompt' }, 'Touche une carte et écoute. Répète à voix haute ! 🗣️'), h('p', { class: 'muted' }, '💡 ' + tip), ...(tel ? [tel] : []), grid, count);
  upd();
}

// ---------- Écoute et trouve ----------
function quiz(body, talk) {
  const st = ST(); let n = 0, ok = 0; const Q = shuffle(W.filter((w) => w[4] !== 'jours').slice()).slice(0, 8);
  const zone = h('div'), sc = h('p', { class: 'muted' });
  const next = () => {
    if (n >= Q.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `Well done! ${ok}/${Q.length}`)); if (ok > st.quiz) st.quiz = ok; S.save(); checkBadge(); star(ok >= 6 ? 2 : 1); if (ok >= 6) { Sfx.win(); burst(body); say('bravo'); } return; }
    const q = Q[n++]; const opts = shuffle([q, ...shuffle(W.filter((w) => w[0] !== q[0] && w[4] !== 'jours')).slice(0, 3)]);
    const replay = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'en-replay', onclick: () => say(q[0]) }, '🔊 Réécouter');
    zone.replaceChildren(h('p', { class: 'tb-q' }, 'What did you hear? Qu’as-tu entendu ?'), replay, h('div', { class: 'nl-grid quiz' }, ...opts.map((o) => h('button', { class: 'nl-card', type: 'button', 'data-testid': 'en-q-' + o[0], onclick: () => {
      if (o[0] === q[0]) { ok++; Sfx.ok(); talk(`Oui ! « ${q[1]} » = « ${q[2]} ».`, false); } else { Sfx.ko(); talk(`Non : « ${q[1]} » veut dire « ${q[2]} ».`, false); }
      sc.textContent = `${n}/${Q.length} · ✔ ${ok}`; setTimeout(next, 1700);
    } }, h('span', { class: 'nl-emo' }, o[3]), h('small', null, o[2]))))); 
    setTimeout(() => say(q[0]), 300);
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '🎧 Listen and find : écoute et trouve la bonne image.'), zone, sc);
  next();
}

// ---------- le petit dialogue ----------
const DIAL = [
  { they: 'hello', you: ['hello', 'goodbye'] },
  { they: 'whatname', you: ['myname', 'thirsty'] },
  { they: 'howareyou', you: ['fine', 'hungry'] },
  { they: 'please', you: ['thankyou', 'sad'] },
  { they: 'weather', you: ['sunny', 'harp'] },
  { they: 'goodbye', you: ['goodbye', 'goodmorning'] },
];
function dialogue(body, talk) {
  const st = ST(); let k = 0, ok = 0; const log = h('div', { class: 'nl-chat' }), zone = h('div', { class: 'actions wrap' });
  const word = (id) => W.find((w) => w[0] === id);
  const step = () => {
    if (k >= DIAL.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, ok >= 4 ? 'Super conversation ! Well done! 🎉' : 'Bien joué ! Recommence pour t’entraîner.'), h('button', { class: 'btn', type: 'button', onclick: () => dialogue(body, talk) }, '↺ Recommencer')); if (ok >= 4) { st.dial = true; S.save(); checkBadge(); star(2); Sfx.win(); burst(body); say('bravo'); } return; }
    const d = DIAL[k], w = word(d.they);
    log.append(h('p', { class: 'nl-b them' }, h('b', null, '🧒 Soumaya : '), w[1], h('small', null, ' (' + w[2] + ')'))); log.scrollTop = 1e6; say(d.they);
    zone.replaceChildren(...shuffle(d.you.slice()).map((id) => { const r = word(id); return h('button', { class: 'btn', type: 'button', 'data-testid': 'en-d-' + id, onclick: () => {
      const good = id === d.you[0]; if (good) { ok++; Sfx.ok(); } else Sfx.ko();
      log.append(h('p', { class: 'nl-b me' + (good ? '' : ' ko') }, h('b', null, '🙂 Moi : '), r[1], h('small', null, good ? ' ✔' : ' ✘ — il fallait : ' + word(d.you[0])[1])));
      log.scrollTop = 1e6; zone.replaceChildren(); k++; setTimeout(step, 1600);
    } }, r[1] + ' — ' + r[2]); }));
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '💬 Soumaya te parle en anglais. Choisis la bonne réponse, puis dis-la à voix haute !'), log, zone);
  step(); talk('Choisis la bonne réponse, puis dis-la à voix haute !', false);
}

// ---------- My school day : la journée de Soumaya à El Hikma (dialogue Papa / Soumaya, 30 répliques) ----------
const HK = [
  ['P', 'Hi Soumaya! How was your day at school?', 'Coucou Soumaya ! Comment était ta journée à l’école ?'],
  ['S', 'Hi Dad! My day was great!', 'Salut papa ! Ma journée était super !'],
  ['P', 'Tell me. What’s the name of your school again?', 'Raconte. Comment s’appelle ton école déjà ?'],
  ['S', 'My school is called El Hikma. I’m in Year Four.', 'Mon école s’appelle El Hikma. Je suis en 4e primaire.'],
  ['P', 'How did the day start?', 'Comment la journée a-t-elle commencé ?'],
  ['S', 'At half past eight, the bell rang. We stood in a line.', 'À 8 h 30, la sonnerie a retenti. On s’est mis en rang.'],
  ['S', 'The teacher said: "Good morning, children!"', 'La maîtresse a dit : « Bonjour les enfants ! »'],
  ['P', 'And what did you do first?', 'Et qu’avez-vous fait en premier ?'],
  ['S', 'First, maths. We learned about measures.', 'D’abord les maths. On a appris les grandeurs.'],
  ['P', 'Measures? What are they?', 'Les grandeurs ? C’est quoi ?'],
  ['S', 'Length in metres, weight in kilos and volume in litres.', 'La longueur en mètres, la masse en kilos et la contenance en litres.'],
  ['P', 'Well done! How many centimetres are in a metre?', 'Bravo ! Combien de centimètres dans un mètre ?'],
  ['S', 'One hundred centimetres, Dad! That’s easy!', 'Cent centimètres, papa ! C’est facile !'],
  ['P', 'And at playtime?', 'Et pendant la récréation ?'],
  ['S', 'I said to a new girl: "Hello, my name is Soumaya. I’m nine."', 'J’ai dit à une nouvelle fille : « Bonjour, je m’appelle Soumaya. J’ai neuf ans. »'],
  ['S', 'Her name is Amira. Now she’s my best friend!', 'Elle s’appelle Amira. Maintenant, c’est ma meilleure amie !'],
  ['P', 'How lovely! What did you do together?', 'Super ! Qu’avez-vous fait ensemble ?'],
  ['S', 'We skipped with a rope and laughed a lot.', 'On a sauté à la corde et beaucoup ri.'],
  ['P', 'And in the afternoon?', 'Et l’après-midi ?'],
  ['S', 'We talked about artificial intelligence.', 'On a parlé d’intelligence artificielle.'],
  ['P', 'About AI? What did you learn?', 'De l’IA ? Qu’as-tu appris ?'],
  ['S', 'A computer can learn, but it doesn’t think like us.', 'Un ordinateur peut apprendre, mais il ne pense pas comme nous.'],
  ['S', 'We must always check what the computer says.', 'On doit toujours vérifier ce que dit l’ordinateur.'],
  ['P', 'Very wise! And after that?', 'Très sage ! Et après ?'],
  ['S', 'Then we went outside, into nature.', 'Ensuite, on est sortis dans la nature.'],
  ['S', 'We saw leaves, flowers and even a hedgehog!', 'On a vu des feuilles, des fleurs et même un hérisson !'],
  ['P', 'A hedgehog? Must we protect nature?', 'Un hérisson ? Doit-on protéger la nature ?'],
  ['S', 'Yes! We don’t throw rubbish on the ground.', 'Oui ! On ne jette pas de déchets par terre.'],
  ['P', 'I’m proud of you, Soumaya.', 'Je suis fier de toi, Soumaya.'],
  ['S', 'Thank you, Dad! Tomorrow I’ll tell you more!', 'Merci papa ! Demain, je t’en raconte plus !'],
];
const HK_REC = new Set([]);
const HK_Q = [
  ['What’s the name of Soumaya’s school?', ['El Hikma', 'the Sun School', 'Amira'], 'Son école s’appelle El Hikma.'],
  ['What’s her best friend’s name?', ['Amira', 'Hajar', 'the teacher'], 'Sa meilleure amie s’appelle Amira.'],
  ['How many centimetres are in a metre?', ['one hundred', 'ten', 'one thousand'], 'Un mètre = 100 centimètres (one hundred).'],
  ['What did they talk about in the afternoon?', ['artificial intelligence', 'the sea', 'music'], 'L’après-midi : l’intelligence artificielle.'],
  ['Which animal did they see in nature?', ['a hedgehog', 'an elephant', 'a shark'], 'Ils ont vu un hérisson (a hedgehog).'],
  ['What time did the bell ring?', ['at half past eight', 'at twelve o’clock', 'at three o’clock'], 'La sonnerie : à 8 h 30 (half past eight).'],
];
function hkPlay(i) {
  return new Promise((ok) => {
    let done = false; const fin = () => { if (!done) { done = true; ok(); } };
    if (!Sfx.soundOn()) { setTimeout(fin, 1200 + HK[i][1].length * 45); return; }
    try {
      if (!('speechSynthesis' in window)) { setTimeout(fin, 1500 + HK[i][1].length * 50); return; }
      speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(HK[i][1].replace(/"/g, ''));
      const vs = speechSynthesis.getVoices().filter((x) => /^en/i.test(x.lang)).sort((a, b) => (/GB/i.test(b.lang) ? 1 : 0) - (/GB/i.test(a.lang) ? 1 : 0));
      const v = vs.length > 1 && HK[i][0] === 'P' ? vs[1] : vs[0];
      u.lang = v ? v.lang : 'en-GB'; if (v) u.voice = v; u.rate = 0.85; u.pitch = HK[i][0] === 'S' ? 1.25 : 0.85;
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
    if (me === run) { star(2); Sfx.win(); burst(body); talk('Well done! Tu as suivi toute la journée de Soumaya à El Hikma !', false); }
  };
  const tFr = h('button', { class: 'btn small', type: 'button', onclick: () => { fr = !fr; chat.classList.toggle('nofr', !fr); tFr.textContent = fr ? '🇫🇷 Cacher la traduction' : '🇫🇷 Montrer la traduction'; } }, '🇫🇷 Cacher la traduction');
  const q = h('div');
  const quizHK = () => { stop(); let n = 0, ok = 0; const Q = shuffle(HK_Q.slice());
    const nx = () => { if (n >= Q.length) { q.replaceChildren(h('p', { class: 'tb-res' }, `Well done! ${ok}/${Q.length}`)); if (ok >= Q.length - 1) { star(2); Sfx.win(); burst(body); } return; }
      const [qq, opts, why] = Q[n++]; q.replaceChildren(h('p', { class: 'tb-q', style: 'font-size:clamp(17px,2.6vw,22px)' }, '❓ ' + qq), h('div', { class: 'actions wrap' }, ...shuffle(opts.map((o, k) => [o, k])).map(([o, k]) => h('button', { class: 'btn', type: 'button', 'data-testid': k === 0 ? 'hk-q-ok' : 'hk-q-ko', onclick: () => {
        q.querySelectorAll('button').forEach((b) => { b.disabled = true; }); if (k === 0) { ok++; Sfx.ok(); } else Sfx.ko();
        q.append(h('div', { class: 'ea-step' }, h('p', null, (k === 0 ? '✔ Correct! ' : '💡 ') + why)), h('button', { class: 'btn primary', type: 'button', onclick: nx }, 'Next ▶'));
      } }, o)))); };
    nx(); q.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  body.replaceChildren(
    h('img', { class: 'hk-img', src: 'assets/scenes/nl_hikma.webp', alt: 'Soumaya raconte sa journée à Papa' }),
    h('p', { class: 'prompt' }, '🏫 My school day : Soumaya raconte sa journée à El Hikma à Papa, en anglais.'),
    h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'hk-play', onclick: () => { role = false; play(); } }, '▶️ Écouter le dialogue'), h('button', { class: 'btn', type: 'button', 'data-testid': 'hk-role', onclick: () => { role = true; play(); } }, '🎤 Je joue Soumaya'), h('button', { class: 'btn small', type: 'button', onclick: all }, '📜 Tout le texte'), tFr, h('button', { class: 'btn small', type: 'button', 'data-testid': 'hk-quiz', onclick: quizHK }, '❓ Questions')),
    chat, q);
  all();
}


export function open(tab = 'moi') {
  const sayEl = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { sayEl.textContent = s; if (v) Voice.speak(s); };
  const body = h('div'), head = h('div');
  const T = [...THEMES.map(([k, l, lv]) => [k, (lv === 'a1' ? 'A1 · ' : '') + l, (b, t) => cartes(b, t, k)]), ['quiz', '🎧 Listen and find', quiz], ['dialogue', '💬 Petit dialogue', dialogue], ['hikma', '🏫 My school day (A1)', hikma], ['academy', '🎓 English Academy · 13 leçons', (b) => { b.replaceChildren(h('p', { class: 'prompt' }, '🎓 English Academy : la grande aventure en anglais avec le Professor Owl — 13 leçons Pré-A1, avec une petite histoire en vidéo pour chacune.'), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'open-english-lesson', onclick: () => English.open() }, '🚀 Ouvrir l’English Academy')); }]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'en-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ea-panel' }, UI.closeButton(), h('h2', null, '🇬🇧 La Maison de l’Anglais'), head, h('div', { class: 'actions wrap' }, ...tabs), body, sayEl), { label: 'La Maison de l’Anglais', onClose: () => Voice.stop() });
  function go(k) { Voice.stop(); const st = ST(); head.replaceChildren(st.badge ? h('b', { class: 'tb-badge' }, '🇬🇧 Little English speaker!') : h('small', { class: 'muted' }, `Pré-A1 et A1 · ${Object.keys(st.heard).length}/${W.length} mots écoutés`)); tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
