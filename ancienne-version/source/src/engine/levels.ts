import type { SkillId } from './types';

export type GameKind = 'course' | 'chateau' | 'bataille' | 'pont' | 'boss';
export interface LevelDef {
  id: string; n: number; title: string; story: string; game: GameKind;
  plan: { skill: SkillId; difficulty: number }[]; count: number;
}
const p = (skill: SkillId, difficulty: number) => ({ skill, difficulty });

export const WORLD1: LevelDef[] = [
  { id: 'n1', n: 1, title: 'Les pas du coureur', game: 'course', count: 6, story: 'Le Royaume des Nombres organise sa grande course. Trouve le nombre qui manque pour avancer !', plan: [p('suites', 1)] },
  { id: 'n2', n: 2, title: 'La piste des écarts', game: 'course', count: 7, story: 'Les pas sont plus grands, et les nombres aussi.', plan: [p('suites', 2), p('abaque', 1)] },
  { id: 'n3', n: 3, title: 'L’abaque enchanté', game: 'chateau', count: 7, story: 'Chaque chiffre a sa colonne. Remets les tours du château en ordre.', plan: [p('abaque', 2), p('abaque', 1)] },
  { id: 'n4', n: 4, title: 'La bataille des décimaux', game: 'bataille', count: 8, story: 'Deux armées de nombres s’affrontent. Quel camp est le plus grand ?', plan: [p('comparer', 1), p('comparer', 2)] },
  { id: 'n5', n: 5, title: 'Décomposer pour mieux régner', game: 'chateau', count: 7, story: 'Les nombres se cassent en morceaux. Reconstruis-les !', plan: [p('decomposer', 1), p('decomposer', 2)] },
  { id: 'n6', n: 6, title: 'Le pont des additions', game: 'pont', count: 6, story: 'Pour traverser la rivière, additionne en alignant les virgules.', plan: [p('addition', 1), p('addition', 2)] },
  { id: 'n7', n: 7, title: 'Les échanges du château', game: 'chateau', count: 6, story: 'Quand le chiffre du haut est trop petit, on échange avec son voisin.', plan: [p('soustraction', 1), p('soustraction', 2)] },
  { id: 'n8', n: 8, title: 'Les raccourcis magiques', game: 'course', count: 8, story: '×9, ×11, ×4 : des astuces pour courir plus vite sans se fatiguer.', plan: [p('tables', 1), p('tables', 2), p('tables', 3)] },
  { id: 'n9', n: 9, title: 'Le labyrinthe des problèmes', game: 'pont', count: 8, story: 'Choisis la bonne opération, puis résous le problème étape par étape.', plan: [p('choix-operation', 1), p('division', 2), p('probleme', 1), p('probleme', 2)] },
  { id: 'n10', n: 10, title: 'Le Dragon des Nombres', game: 'boss', count: 12, story: 'Le dragon garde la clé du royaume. Utilise tout ce que tu as appris !', plan: [p('suites', 2), p('abaque', 3), p('comparer', 2), p('addition', 2), p('soustraction', 2), p('tables', 2), p('division', 2), p('probleme', 2), p('decomposer', 2), p('choix-operation', 1)] },
];
export const WORLD3: LevelDef[] = [
  { id: 'g1', n: 1, title: 'Les règles du village', game: 'course', count: 6, story: 'Mètres, centimètres, kilomètres : apprends à passer de l’un à l’autre.', plan: [p('conversion', 1)] },
  { id: 'g2', n: 2, title: 'Balances et récipients', game: 'chateau', count: 7, story: 'Kilogrammes, grammes, litres, centilitres : remplis les récipients du marché.', plan: [p('conversion', 2)] },
  { id: 'g3', n: 3, title: 'L’horloge magique', game: 'pont', count: 7, story: 'Lis l’heure sur l’horloge de la tour.', plan: [p('heure', 1), p('heure', 2)] },
  { id: 'g4', n: 4, title: 'Combien de temps ?', game: 'pont', count: 6, story: 'Calcule l’heure de fin des spectacles.', plan: [p('duree', 1), p('duree', 2)] },
  { id: 'g5', n: 5, title: 'Le marché des fractions', game: 'bataille', count: 8, story: 'Parts, moitiés, quarts et dixièmes : partage équitablement.', plan: [p('fractions', 1), p('fractions', 2), p('fractions', 3)] },
  { id: 'g6', n: 6, title: 'Jardins en rectangles', game: 'chateau', count: 7, story: 'Aire des jardins et longueur des clôtures.', plan: [p('aire', 1), p('aire', 2), p('aire', 3)] },
  { id: 'g7', n: 7, title: 'La boutique du village', game: 'course', count: 7, story: 'Prix, tableaux de proportionnalité et monnaie rendue.', plan: [p('monnaie', 1), p('monnaie', 2)] },
  { id: 'g8', n: 8, title: 'Le Gardien des Grandeurs', game: 'boss', count: 12, story: 'Le gardien de la vallée te lance tous ses défis de mesure.', plan: [p('conversion', 2), p('heure', 2), p('duree', 2), p('fractions', 2), p('aire', 2), p('monnaie', 2)] },
];
export const WORLD2: LevelDef[] = [
  { id: 'm1', n: 1, title: 'Le chemin des petits mots', game: 'course', count: 8, story: 'Dans la Forêt des Mots, a/à et et/est se ressemblent. Apprends à les distinguer !', plan: [p('homophones', 1)] },
  { id: 'm2', n: 2, title: 'Les mots jumeaux', game: 'bataille', count: 8, story: 'on/ont, son/sont : teste-les avec un autre mot pour ne plus te tromper.', plan: [p('homophones', 2)] },
  { id: 'm3', n: 3, title: 'La rivière des pluriels', game: 'pont', count: 8, story: 'Un cheval, des chevaux… Traverse la rivière en écrivant le bon pluriel.', plan: [p('pluriel', 1), p('pluriel', 2)] },
  { id: 'm4', n: 4, title: 'Les arbres qui s’accordent', game: 'chateau', count: 8, story: 'Le verbe et l’adjectif doivent s’accorder avec leur nom.', plan: [p('accord', 1), p('accord', 2)] },
  { id: 'm5', n: 5, title: 'Le sentier des verbes', game: 'course', count: 8, story: 'Être, avoir et les verbes en -er : conjugue-les au présent.', plan: [p('conjugaison', 1)] },
  { id: 'm6', n: 6, title: 'Les verbes rebelles', game: 'bataille', count: 8, story: 'Aller, faire, dire… ces verbes n’en font qu’à leur tête !', plan: [p('conjugaison', 2), p('conjugaison', 3)] },
  { id: 'm7', n: 7, title: 'La clairière des classes', game: 'chateau', count: 8, story: 'Nom, verbe, adjectif, déterminant : range chaque mot dans sa famille.', plan: [p('nature', 1), p('nature', 2)] },
  { id: 'm8', n: 8, title: 'Synonymes et contraires', game: 'pont', count: 8, story: 'Trouve les mots qui veulent dire la même chose, ou le contraire.', plan: [p('vocabulaire', 1), p('vocabulaire', 2)] },
  { id: 'm9', n: 9, title: 'Le Gardien des Mots', game: 'boss', count: 12, story: 'Le gardien de la forêt te lance tous ses défis de français.', plan: [p('homophones', 2), p('pluriel', 2), p('accord', 2), p('conjugaison', 2), p('nature', 2), p('vocabulaire', 2)] },
];
export const WORLD4: LevelDef[] = [
  { id: 'f1', n: 1, title: 'Les figures du temple', game: 'course', count: 7, story: 'Au Temple des Formes, chaque porte porte le nom d’un polygone. Compte les côtés !', plan: [p('polygones', 1)] },
  { id: 'f2', n: 2, title: 'Les angles du couloir', game: 'chateau', count: 7, story: 'Droit, aigu, obtus : reconnais les angles des murs.', plan: [p('angles', 1)] },
  { id: 'f3', n: 3, title: 'Angles et grandes figures', game: 'pont', count: 8, story: 'Les angles plats et les polygones à 8 côtés se cachent dans la salle suivante.', plan: [p('angles', 2), p('polygones', 2)] },
  { id: 'f4', n: 4, title: 'Parallèles et perpendiculaires', game: 'bataille', count: 8, story: 'Rails parallèles, croisements en angle droit : retrouve les quadrilatères.', plan: [p('quadrilateres', 1), p('quadrilateres', 2)] },
  { id: 'f5', n: 5, title: 'Le tour des salles', game: 'course', count: 8, story: 'Mesure le tour de chaque salle : c’est le périmètre.', plan: [p('perimetre', 1), p('perimetre', 2), p('perimetre', 3)] },
  { id: 'f6', n: 6, title: 'La salle des solides', game: 'chateau', count: 7, story: 'Cubes, pyramides, prismes : compte faces, arêtes et sommets.', plan: [p('solides', 1), p('solides', 2), p('solides', 3)] },
  { id: 'f7', n: 7, title: 'Le miroir du temple', game: 'pont', count: 7, story: 'Plie les figures en deux : combien d’axes de symétrie ?', plan: [p('symetrie', 1), p('symetrie', 2), p('symetrie', 3)] },
  { id: 'f8', n: 8, title: 'Le Gardien des Formes', game: 'boss', count: 12, story: 'Le gardien du temple te pose toutes ses énigmes de géométrie.', plan: [p('polygones', 2), p('angles', 2), p('quadrilateres', 2), p('perimetre', 2), p('solides', 2), p('symetrie', 2)] },
];
export const WORLD5: LevelDef[] = [
  { id: 'd1', n: 1, title: 'La frise du temps', game: 'course', count: 7, story: 'Sur la Planète des Découvertes, le voyage dans le temps commence : remets les grandes périodes dans l’ordre.', plan: [p('frise', 1), p('frise', 2)] },
  { id: 'd2', n: 2, title: 'Siècles et millénaires', game: 'pont', count: 8, story: 'Combien d’années dans un siècle ? Dans quel siècle vit-on ?', plan: [p('siecles', 1), p('siecles', 2)] },
  { id: 'd3', n: 3, title: 'La Terre qui tourne', game: 'chateau', count: 8, story: 'La Terre tourne sur elle-même et autour du Soleil. Rotation ou révolution ?', plan: [p('terre', 1), p('terre', 2)] },
  { id: 'd4', n: 4, title: 'Bruxelles et Québec', game: 'bataille', count: 7, story: 'Quand Soumaya appelle son cousin à Québec, quelle heure est-il là-bas ?', plan: [p('decalage', 1), p('decalage', 2)] },
  { id: 'd5', n: 5, title: 'Règles de vie et lois', game: 'pont', count: 8, story: 'Pour bien vivre ensemble : qui décide quoi ?', plan: [p('epc', 1)] },
  { id: 'd6', n: 6, title: 'Le grand sondage', game: 'course', count: 8, story: 'La classe a répondu à un sondage. Lis le diagramme à bandes.', plan: [p('statistiques', 1), p('statistiques', 2)] },
  { id: 'd7', n: 7, title: 'Le Gardien des Découvertes', game: 'boss', count: 12, story: 'Histoire, sciences, citoyenneté et statistique : le gardien de la planète te teste sur tout.', plan: [p('frise', 2), p('siecles', 2), p('terre', 2), p('decalage', 2), p('epc', 1), p('statistiques', 2)] },
];
export const WORLD_LEVELS: Record<number, LevelDef[]> = { 1: WORLD1, 2: WORLD2, 3: WORLD3, 4: WORLD4, 5: WORLD5 };
export const EXAM_NOMBRES: LevelDef = {
  id: 'exam-nombres', n: 0, title: 'Évaluation blanche — Nombres', game: 'boss', count: 14,
  story: 'Mode examen : aucune aide. La correction arrive après la remise.',
  plan: [p('suites', 2), p('abaque', 2), p('comparer', 2), p('decomposer', 2), p('addition', 2), p('soustraction', 2), p('tables', 2), p('division', 2), p('choix-operation', 1), p('probleme', 2)],
};
export const WORLDS = [
  { id: 1, name: 'Le Royaume des Nombres', color: '#ffb300', ready: true },
  { id: 2, name: 'La Forêt des Mots', color: '#4cc46a', ready: true },
  { id: 3, name: 'La Vallée des Grandeurs', color: '#35b6ff', ready: true },
  { id: 4, name: 'Le Temple des Formes', color: '#c46cff', ready: true },
  { id: 5, name: 'La Planète des Découvertes', color: '#ff6b8b', ready: true },
  { id: 6, name: 'Le Château des Examens', color: '#ff8a3d', ready: true },
];
