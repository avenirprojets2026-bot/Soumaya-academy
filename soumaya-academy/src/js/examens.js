// La Salle des Examens : le dernier monde. Professeur (cahier d'exercices), surveillante (conseils), tableau (évaluations), amis de classe.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { shuffle } from './workshop.js';

const NAME = () => (S.get().name || 'Soumaya');
const AMIS = [['Ihsane', 'f'], ['Sayaline', 'f'], ['Sakaïna', 'f'], ['Zayd', 'm'], ['Ismaël', 'm'], ['Souhaib', 'm'], ['Souhayb', 'm'], ['Naïla', 'f'], ['Kamilia', 'f'], ['Assia', 'f'], ['Aya', 'f'], ['Layan', 'f'], ['Bilal', 'm'], ['Maïssa', 'f']];
const MOTS = [
  (n) => `Courage, ${n} ! Tu vas y arriver !`, (n) => `On a bien révisé, ${n}. Respire, tout va bien se passer.`, () => 'Lis bien chaque consigne jusqu’au bout !',
  () => 'Si tu bloques, passe à la question suivante et reviens après.', (n) => `Je crois en toi, ${n} !`, () => 'Après l’examen, on fête ça ensemble !',
  () => 'N’oublie pas de relire tes réponses à la fin.', () => 'Pense à l’abaque pour les conversions !', (n) => `${n}, tu es la meilleure en lecture !`,
  () => 'Écris lisiblement, et souligne les mots importants.', () => 'Moi aussi j’ai un peu peur… mais on est prêts !', () => 'Un, deux, trois… on y va !',
];
const go = (p) => { UI.closeDialog(); setTimeout(() => window.__game && window.__game.openPanel(p), 80); };
const say = () => h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });

export function amis() {
  const sb = say(), talk = (t) => { sb.textContent = t; Voice.speak(t); };
  const pool = shuffle(MOTS.slice());
  let k = 0;
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ab-panel' }, UI.closeButton(), h('h2', null, '👫 Mes amis de classe'),
    h('p', { class: 'muted' }, 'Touche un ami : il a un mot d’encouragement pour toi avant l’examen.'),
    h('div', { class: 'ex-amis' }, ...AMIS.map(([n, g], i) => h('button', { class: 'ex-ami', type: 'button', 'data-testid': 'ex-ami-' + i, style: `--h:${(i * 47) % 360}`, onclick: (e) => {
      const el = e.currentTarget; Sfx.tap(); const m = pool[k++ % pool.length](NAME()); talk(`${n} : ${m}`);
      el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    } }, h('span', { class: 'ex-av' }, g === 'f' ? '👧' : '👦'), h('b', null, n)))), sb), { label: 'Mes amis de classe', onClose: () => Voice.stop() });
  talk(`Tes amis sont là, ${NAME()} ! Touche-les pour un mot d’encouragement.`);
}

export function surveillante() {
  const sb = say(), talk = (t) => { sb.textContent = t; Voice.speak(t); };
  const C = ['📖 Lis toute la consigne avant de répondre. Souligne les mots importants.', '⏱️ Regarde l’horloge : ne reste pas bloquée trop longtemps sur une question.', '✏️ Écris lisiblement, avec une majuscule et un point à chaque phrase.',
    '🧮 En maths, écris tes calculs et l’unité de la réponse (cm, g, l…).', '🔁 À la fin, relis tout calmement. Corrige les petites fautes.', '😌 Si tu stresses : ferme les yeux, inspire par le nez, souffle doucement. Tu as tout appris !'];
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ab-panel' }, UI.closeButton(), h('h2', null, '🧑‍🏫 Les conseils de la surveillante'),
    h('ol', { class: 'ex-conseils' }, ...C.map((c) => h('li', null, c))),
    h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ex-prete', onclick: () => { Sfx.win(); talk(`Très bien, ${NAME()}. Installe-toi, l’examen peut commencer. Bonne chance !`); } }, '✋ Je suis prête !')), sb),
  { label: 'Conseils', onClose: () => Voice.stop() });
  talk('Silence, s’il vous plaît. Voici mes conseils avant l’examen.');
}

export function tableau() {
  const E = [['abaque-grandeurs-eval', '🧪', 'Évaluation : les contenances', '8 questions · A / EA / NA'], ['abaque-grandeurs-evall', '📏', 'Évaluation progressive : les longueurs', 'Mesurer, tracer, convertir · 3 étoiles'],
    ['abaque-grandeurs-masses', '⚖️', 'Contrôle : les masses', 'Tonne, quintal, kg, g, mg'], ['infinitif', '🔤', 'Contrôle : l’infinitif et les 3 groupes', 'Conjugaison'], ['abaque-nombres', '📊', 'Contrôle : les grands nombres', 'Placer, lire, décomposer'], ['leesbos', '🌳', 'Leesbos : lecture en néerlandais', 'Compréhension de lecture'], ['interdio', '📅', 'Interdiocésaines 2022 et 2024', 'Épreuves officielles + entraînement'], ['examblanc', '📝', 'Examens blancs', 'Décimaux CM1 / CM2 · Mes réussites P1 → P4']];
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ab-panel' }, UI.closeButton(), h('h2', null, '📝 Le tableau des évaluations'),
    h('p', { class: 'muted' }, 'Choisis une évaluation, comme en classe.'),
    h('div', { class: 'lb-shelf' }, ...E.map(([p, ic, t, d]) => h('button', { class: 'lb-book', type: 'button', style: '--c:#7a5cc4', 'data-testid': 'ex-' + p, onclick: () => go(p) }, h('span', { class: 'lb-ico' }, ic), h('b', null, t), h('small', null, d))))), { label: 'Évaluations', onClose: () => Voice.stop() });
  Voice.speak('Voici les évaluations. Choisis-en une.');
}
