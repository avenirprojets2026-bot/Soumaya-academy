// Récompenses : badges, pages du Grimoire, jalons d'histoire.
import * as S from './save.js';
import * as Mimi from './mimi.js';

export const BADGES = [
  { id: 'first', icon: '🌟', name: 'Première étoile', desc: 'Termine ta première mission.', test: () => S.get().stats.missions >= 1 },
  { id: 'perfect', icon: '💎', name: 'Sans faute', desc: 'Obtiens 3 étoiles à une mission.', test: () => S.totalStars() >= 3 && Object.values(S.get().subjects).some((s) => Object.values(s.stars).includes(3)) },
  { id: 'stars10', icon: '✨', name: '10 étoiles', desc: 'Collectionne 10 étoiles.', test: () => S.totalStars() >= 10 },
  { id: 'stars30', icon: '🌠', name: '30 étoiles', desc: 'Collectionne 30 étoiles.', test: () => S.totalStars() >= 30 },
  { id: 'stars60', icon: '👑', name: '60 étoiles', desc: 'Collectionne 60 étoiles.', test: () => S.totalStars() >= 60 },
  { id: 'fr5', icon: '📚', name: 'Gardienne des mots', desc: 'Réussis le niveau 5 en français.', test: () => (S.get().subjects.francais.stars[5] || 0) > 0 },
  { id: 'ma5', icon: '🧮', name: 'Reine du calcul', desc: 'Réussis le niveau 5 en mathématiques.', test: () => (S.get().subjects.maths.stars[5] || 0) > 0 },
  { id: 'ev5', icon: '🔭', name: 'Exploratrice', desc: 'Réussis le niveau 5 en éveil.', test: () => (S.get().subjects.eveil.stars[5] || 0) > 0 },
  { id: 'fr10', icon: '🪶', name: 'Maîtresse des mots', desc: 'Réussis le niveau 10 en français.', test: () => (S.get().subjects.francais.stars[10] || 0) > 0 },
  { id: 'ma10', icon: '🏰', name: 'Maîtresse des nombres', desc: 'Réussis le niveau 10 en mathématiques.', test: () => (S.get().subjects.maths.stars[10] || 0) > 0 },
  { id: 'ev10', icon: '🌍', name: 'Grande exploratrice', desc: 'Réussis le niveau 10 en éveil.', test: () => (S.get().subjects.eveil.stars[10] || 0) > 0 },
  { id: 'rooms', icon: '🗝️', name: 'Visiteuse du château', desc: 'Visite les 6 salles du château.', test: () => ['biblio', 'foret', 'atelier', 'nombres', 'archives', 'observatoire'].every((r) => S.get().rooms[r]) },
  { id: 'exam', icon: '🎓', name: 'Examen blanc', desc: 'Termine un examen blanc P4.', test: () => S.get().exams.length >= 1 },
  { id: 'exam8', icon: '🏅', name: 'Championne P4', desc: 'Obtiens au moins 8/10 à un examen blanc.', test: () => S.get().exams.some((e) => e.score >= 8) },
  { id: 'mimi-complice', icon: '🐾', name: 'Complice de Muezza', desc: 'Deviens complice avec Mimi.', test: () => Mimi.level() >= 2 },
  { id: 'mimi-gourmande', icon: '🐟', name: 'Chef des croquettes', desc: 'Donne 5 croquettes magiques à Muezza.', test: () => (S.get().mimi.fed || 0) >= 5 },
  { id: 'mimi-inseparables', icon: '😻', name: 'Inséparables', desc: 'Atteins le niveau « Inséparable » avec Mimi.', test: () => Mimi.level() >= 4 },
  { id: 'scientifique', icon: '🔬', name: 'Jeune scientifique', desc: 'Réussis la mission « Que cache cette goutte d’eau ? ».', test: () => !!(S.get().micro && S.get().micro.badge) },
  { id: 'potion', icon: '🧪', name: 'Maîtresse des potions', desc: 'Retrouve le secret de la Potion des Étoiles.', test: () => !!(S.get().potion && S.get().potion.done) },
  { id: 'jardin', icon: '🌷', name: 'Gardienne du jardin', desc: 'Redonne ses couleurs au Jardin Botanique Enchanté.', test: () => !!(S.get().jardin && S.get().jardin.done) },
  { id: 'archiviste', icon: '🗄️', name: 'Archiviste numérique', desc: 'Réussis le grand rangement de l’armoire magique (niveau 4).', test: () => !!(S.get().armoire && S.get().armoire.done) },
  { id: 'docteure', icon: '🩺', name: 'Petite docteure', desc: 'Réussis les 5 postes du laboratoire du corps humain.', test: () => !!(S.get().labo && S.get().labo.badge) },
  { id: 'tables', icon: '👑', name: 'Maîtresse des tables', desc: 'Maîtrise les 10 tables de multiplication dans l’Atelier des Tables.', test: () => !!(S.get().tables && S.get().tables.badge) },
  { id: 'pluriels', icon: '🪞', name: 'Reine des pluriels', desc: 'Illumine les 6 miroirs du Palais des Miroirs Jumeaux.', test: () => !!(S.get().pluriels && S.get().pluriels.badge) },
  { id: 'alchimiste', icon: '⚗️', name: 'Petite alchimiste', desc: 'Réussis les 5 expériences du Laboratoire des Trois États.', test: () => !!(S.get().etats && S.get().etats.badge) },
  { id: 'europe', icon: '🇪🇺', name: 'Petite Européenne', desc: 'Réussis le grand défi de la Gare des Étoiles d’Europe.', test: () => !!(S.get().europe && S.get().europe.badge) },
  { id: 'neerlandais', icon: '🇬🇧', name: 'Little English speaker', desc: 'Écoute tous les thèmes Pré-A1, réussis « Listen and find » (6/8) et le petit dialogue de la Maison de l’Anglais.', test: () => !!(S.get().en && S.get().en.badge) },
  { id: 'philosophe', icon: '🦉', name: 'Petite philosophe', desc: 'Réussis les 4 ateliers du Jardin des Philosophes.', test: () => !!(S.get().philo && S.get().philo.badge) },
  { id: 'bouclier', icon: '🛡️', name: 'Gardienne du numérique', desc: 'Réussis les 4 missions du Bouclier numérique.', test: () => !!(S.get().bouclier && S.get().bouclier.badge) },
  { id: 'poetesse', icon: '🪶', name: 'Petite poétesse', desc: 'Réussis les 4 ateliers du Kiosque à poèmes.', test: () => !!(S.get().poemes && S.get().poemes.badge) },
  { id: 'ia', icon: '🤖', name: 'Petite exploratrice de l’IA', desc: 'Termine « La Machine des Idées ».', test: () => !!(S.get().ia && S.get().ia.done) },
  { id: 'all', icon: '🏆', name: 'Légende de l’Académie', desc: 'Réussis le niveau 10 dans les trois matières.', test: () => ['francais', 'maths', 'eveil'].every((k) => (S.get().subjects[k].stars[10] || 0) > 0) },
];

export function checkBadges() {
  const won = [];
  for (const b of BADGES) if (!S.get().badges[b.id] && b.test()) { S.awardBadge(b.id); won.push(b); }
  return won;
}

export const PAGES = 10;
export function pagesRestored() { return Math.min(PAGES, Math.floor(S.completedLevels() / 3)); }

const PAGE_LINES = [
  'La première page se rallume : le Grimoire se souvient de l’alphabet des étoiles.',
  'Deuxième page ! Les mots de la forêt murmurent de nouveau.',
  'Troisième page : un pont de nombres se dessine au-dessus des nuages.',
  'Quatrième page ! Muezza ronronne : le château s’illumine.',
  'Cinquième page : les archives du temps s’ouvrent grand.',
  'Sixième page ! La lune du grimoire retrouve son éclat.',
  'Septième page : l’observatoire révèle une nouvelle constellation.',
  'Huitième page ! Les portes de la salle royale tremblent de joie.',
  'Neuvième page : il n’en reste plus qu’une, Maissa !',
  'Dixième page ! Le Grimoire des Savoirs est enfin complet. Bravo, grande exploratrice !',
];
export const pageLine = (n) => PAGE_LINES[Math.max(0, Math.min(PAGES, n) - 1)];
