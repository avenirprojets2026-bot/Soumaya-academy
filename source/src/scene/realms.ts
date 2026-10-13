export type RealmId = 1 | 2 | 3 | 4 | 5 | 6;
export type WorldScreen = 'world1' | 'world2' | 'world3' | 'world4' | 'world5' | 'castle';

export interface Realm {
  id: RealmId; name: string; short: string; color: string; screen: WorldScreen;
  /** centre de l'île (x, z) et altitude */
  pos: [number, number]; y: number; R: number;
  /** ce que Soumaya y apprend (affiché sur la carte) */
  learns: string;
  /** répliques de Mimi à l'arrivée ({n} = prénom) */
  arrival: string[];
  tour: string;
}

export const REALMS: Realm[] = [
  { id: 1, name: 'Royaume des Nombres', short: 'Nombres', color: '#ffb300', screen: 'world1', pos: [-22, 8], y: 0, R: 6.2,
    learns: 'Calcul, suites, nombres décimaux, problèmes',
    tour: 'Voici le Royaume des Nombres, où un dragon doré garde tous les secrets du calcul.',
    arrival: ['Bienvenue au Royaume des Nombres, {n} !', 'Ici, on compte, on calcule et on devine les suites.', 'Le dragon doré t’attend en haut de la pyramide. Prête ?'] },
  { id: 2, name: 'Forêt des Mots', short: 'Mots', color: '#4cc46a', screen: 'world2', pos: [-11, -5], y: 1.2, R: 6.2,
    learns: 'Orthographe, conjugaison, grammaire, vocabulaire',
    tour: 'Ici, la Forêt des Mots. Les arbres murmurent des histoires, et chaque lettre brille comme une luciole.',
    arrival: ['Chut… écoute la forêt, {n}. Elle chuchote des mots.', 'Chaque phrase bien écrite fait briller une luciole de plus.', 'On va apprendre à écrire sans fautes !'] },
  { id: 3, name: 'Vallée des Grandeurs', short: 'Grandeurs', color: '#35b6ff', screen: 'world3', pos: [1, 8], y: -0.4, R: 6.2,
    learns: 'Longueurs, masses, durées, aires, fractions',
    tour: 'La Vallée des Grandeurs : on y mesure le temps, les longueurs, les poids et les surfaces.',
    arrival: ['Voici la Vallée des Grandeurs, {n} !', 'Regarde la grande horloge et la balance : tout se mesure ici.', 'Sors ta règle d’exploratrice, on y va !'] },
  { id: 4, name: 'Temple des Formes', short: 'Formes', color: '#c46cff', screen: 'world4', pos: [13, -5], y: 1.4, R: 6.2,
    learns: 'Polygones, angles, périmètre, solides, symétrie',
    tour: 'Le Temple des Formes. Triangles, carrés, cercles… tout y tourne en rythme.',
    arrival: ['Le Temple des Formes, {n} !', 'Tu vois ces formes qui tournent ? Il faut les reconnaître toutes.', 'Angles, côtés, symétries : on s’amuse à les observer.'] },
  { id: 5, name: 'Planète des Découvertes', short: 'Découvertes', color: '#ff6b8b', screen: 'world5', pos: [24, 8], y: 0.2, R: 6.2,
    learns: 'Histoire, sciences, citoyenneté, statistique',
    tour: 'Et la Planète des Découvertes, pour regarder les étoiles, l’histoire et le monde.',
    arrival: ['Bienvenue sur la Planète des Découvertes, {n} !', 'Ici, on voyage dans le temps, on observe le ciel et on comprend le monde.', 'Le télescope est prêt. Regardons ensemble !'] },
  { id: 6, name: 'Château des Examens', short: 'Examens', color: '#ff8a3d', screen: 'castle', pos: [2, -24], y: 3.5, R: 8.5,
    learns: 'Évaluations blanches, séries et épreuves de juin 2025',
    tour: 'Tout au bout du chemin lumineux, le Château des Examens. N’aie pas peur : c’est juste le grand jeu final, où tu montres tout ce que tu sais.',
    arrival: ['Voici le Château des Examens, {n} !', 'On s’entraîne ici, tranquillement, sans pression.', 'Tu peux faire une épreuve entière, ou une seule partie. À ton rythme !'] },
];

export const realmById = (id: number): Realm => REALMS.find((r) => r.id === id)!;

/** Point d'accueil d'une île : le bord avant, face à la caméra. */
export const dockOf = (r: Realm): [number, number, number] => [r.pos[0], r.y + 0.15, r.pos[1] + r.R * 0.62];
