// Grande salle : « Mon cahier d'exercices » — toutes les fiches d'entraînement rangées par catégorie.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as Voice from './voice.js';

const CATS = [
  { t: '🔢 Mathématiques', c: '#2f8fd1', items: [
    ['abaque-nombres', '📊', 'Mon abaque des nombres', 'Placer, lire, décomposer les grands nombres'],
    ['abaque-grandeurs', '📐', 'Mon abaque des grandeurs', 'Longueurs, masses, capacités : convertir'],
    ['abaque-grandeurs-masses', '⚖️', 'Les masses', 'Tonne, quintal, kg, g, mg : unités et conversions'],
    ['fractions-simples', '🍰', 'Les fractions simples', 'Lire, écrire, représenter, mesurer, partager'],
    ['decimaux', '🪙', 'Le comptoir des décimaux', 'Dixièmes, centièmes, droite graduée'],
  ] },
  { t: '✏️ Français', c: '#d6336c', items: [
    ['infinitif', '🔤', 'L’infinitif et les 3 groupes', 'Trouver l’infinitif, classer les verbes'],
  ] },
  { t: '🇳🇱 Néerlandais', c: '#e8792b', items: [
    ['leesbos', '🌳', 'Het Leesbos van meester Bart', 'Lire et comprendre 5 livres Zonnekind'],
  ] },
  { t: '📝 Évaluations', c: '#7a5cc4', items: [
    ['abaque-grandeurs-eval', '🧪', 'Évaluation : les contenances', '8 questions, résultat A / EA / NA'],
    ['abaque-grandeurs-evall', '📏', 'Évaluation progressive : les longueurs', 'Mesurer, tracer, convertir — 3 étoiles à gagner'],
    ['examblanc', '📝', 'Examens blancs', 'Décimaux CM1 / CM2 · Mes réussites P1 → P4'],
  ] },
];

export function open() {
  const go = (p) => { UI.closeDialog(); setTimeout(() => window.__game && window.__game.openPanel(p), 80); };
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ab-panel' }, UI.closeButton(), h('h2', null, '📒 Mon cahier d’exercices'),
    h('p', { class: 'muted' }, 'Toutes les fiches d’entraînement, rangées par matière.'),
    ...CATS.map((cat) => h('section', { class: 'ch-cat' }, h('h3', { style: `color:${cat.c}` }, cat.t),
      h('div', { class: 'lb-shelf' }, ...cat.items.map(([p, ic, ti, de]) => h('button', { class: 'lb-book', type: 'button', style: `--c:${cat.c}`, 'data-testid': 'ch-' + p, onclick: () => go(p) },
        h('span', { class: 'lb-ico' }, ic), h('b', null, ti), h('small', null, de))))))), { label: 'Mon cahier d’exercices', onClose: () => Voice.stop() });
  Voice.speak('Voici ton cahier d’exercices. Choisis une fiche.');
}
