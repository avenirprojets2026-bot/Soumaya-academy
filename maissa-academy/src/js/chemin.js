// « Le Chemin des Mondes » : chaque salle mène à la suivante par un passage dessiné dans le décor
// (miroir, porte secrète, vitrail, portail…). Le passage s'ouvre après une activité réussie dans la salle,
// puis Maissa le traverse quand on le touche. Les anciens ronds « Retour à… » sont remplacés par le bouton ↩ Retour.
import { SCENES } from './scenes.js';

// [salle, salle suivante, x, y, type de passage, nom du passage]
const CHAIN = [
  ['hall', 'biblio', 0.5, 0.2, 'light', 'le grand vitrail'],
  ['biblio', 'miroirs', 0.2, 0.3, 'door', 'la bibliothèque secrète'],
  ['miroirs', 'foret', 0.5, 0.4, 'mirror', 'le grand miroir'],
  ['foret', 'poemes', 0.42, 0.72, 'light', 'le sentier des lettres'],
  ['poemes', 'nombres', 0.2, 0.3, 'light', 'le château au loin'],
  ['nombres', 'atelier', 0.82, 0.25, 'mirror', 'la fenêtre des chiffres'],
  ['atelier', 'etats', 0.93, 0.3, 'mirror', 'la fenêtre de la lune'],
  ['etats', 'corps', 0.92, 0.5, 'light', 'l’étagère magique'],
  ['corps', 'vivant', 0.62, 0.2, 'light', 'le vitrail des poumons'],
  ['vivant', 'vallee', 0.67, 0.34, 'mirror', 'derrière la cascade'],
  ['vallee', 'neerlandais', 0.88, 0.56, 'light', 'le chemin de Londres'],
  ['neerlandais', 'gare', 0.22, 0.36, 'mirror', 'la fenêtre sur Big Ben'],
  ['gare', 'archives', 0.6, 0.66, 'light', 'le train magique'],
  ['archives', 'observatoire', 0.5, 0.64, 'portal', 'le portail des époques'],
  ['observatoire', 'donnees', 0.33, 0.28, 'portal', 'le dôme des galaxies'],
  ['donnees', 'tour', 0.33, 0.3, 'light', 'les grandes fenêtres'],
  ['tour', 'bouclier', 0.68, 0.3, 'light', 'le vitrail magique'],
  ['bouclier', 'village', 0.86, 0.28, 'mirror', 'la fenêtre du château'],
  ['village', 'philo', 0.62, 0.42, 'light', 'l’arche fleurie'],
  ['philo', 'theatre', 0.93, 0.32, 'door', 'la porte du château'],
  ['theatre', 'galerie', 0.36, 0.22, 'light', 'les grandes orgues'],
  ['galerie', 'hall', 0.64, 0.45, 'light', 'le couloir des trophées'],
];
// anciens ronds de retour ou d'entrée devenus inutiles (remplacés par le passage ou par ↩ Retour)
const REMOVE = new Set(['m-biblio', 'e-atelier', 'ph-village', 'bc-tour', 'po-foret', 'g-back', 'a-etats', 'tn-bouclier', 'vg-philo', 'p-nl', 'b-miroirs', 'f-poemes']);
const ICON = { mirror: '🪞', door: '🚪', light: '✨', portal: '🌀' };
export const NEXT = Object.fromEntries(CHAIN.map((c) => [c[0], c]));

export function sceneIcon(id) {
  const n = SCENES.map.hotspots.find((h) => h.act && h.act.scene === id);
  return n ? n.icon : '🏰';
}
export function short(id) {
  const n = SCENES.map.hotspots.find((h) => h.act && h.act.scene === id);
  return n ? n.label : (SCENES[id] ? SCENES[id].title : id);
}

// définition de salle enrichie : passage ajouté, ronds de retour retirés
export function withChain(def) {
  const c = NEXT[def.id];
  const hs = def.hotspots.filter((h) => !REMOVE.has(h.id));
  if (!c) return { ...def, hotspots: hs };
  const [, to, x, y, kind, name] = c;
  const w = def.walk || { y0: 0.8 };
  const stand = { x: Math.min(0.86, Math.max(0.14, x)), y: Math.min(0.92, (w.y0 || 0.8) + 0.05) };
  const pass = { id: def.id + '-passage', label: `${short(to)}`, icon: ICON[kind] || '✨', x, y, stand, cls: 'hs-passage', act: { type: 'passage', scene: to, kind, name } };
  return { ...def, hotspots: [...hs, pass], passage: pass };
}
