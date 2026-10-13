import type { Exercise } from '../engine/types';
import type { LevelDef } from '../engine/levels';
import { update, getSave, type ExamResult } from './save';
import type { SkillId } from '../engine/types';

export interface Item { ex: Exercise; correct: boolean; firstTry: boolean; given: string; hints: number; base: boolean }
export interface Summary { level: LevelDef; mode: 'training' | 'exam'; items: Item[]; stars: number; coins: number; correctBase: number; totalBase: number; newBadges: string[]; prevStars: number }

export const BADGES: Record<string, { label: string; icon?: string }> = {
  'premiers-pas': { label: 'Premiers pas : un niveau terminé' },
  'etoile-doree': { label: 'Étoile dorée : 3 étoiles sur un niveau' },
  'perseverance': { label: 'Persévérance : tu as continué malgré les erreurs' },
  'sans-indice': { label: 'Autonome : 3 étoiles sans aucun indice' },
  'gardien-mots': { label: 'Gardienne de la forêt : le Gardien des Mots est vaincu' },
  'gardien-formes': { label: 'Maîtresse du temple : le Gardien des Formes est vaincu' },
  'gardien-decouvertes': { label: 'Exploratrice : le Gardien des Découvertes est vaincu' },
  'dragon': { label: 'Dompteuse de dragon : le Dragon des Nombres est vaincu' },
  'examen': { label: 'Courage d’examen : une évaluation blanche terminée' },
};

export function finishLevel(level: LevelDef, mode: 'training' | 'exam', items: Item[], review = false): Summary {
  const base = items.filter((i) => i.base);
  const correctBase = base.filter((i) => i.firstTry).length;
  const ratio = base.length ? correctBase / base.length : 0;
  const stars = mode === 'exam' ? 0 : ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1;
  const coins = mode === 'exam' ? 0 : stars * 10 + correctBase * 2;
  const anyHint = items.some((i) => i.hints > 0);
  const prev = getSave().levels[level.id];
  const prevStars = prev?.stars ?? 0;
  const newBadges: string[] = [];
  update((s) => {
    const have = new Set(s.badges);
    const add = (b: string) => { if (!have.has(b)) { have.add(b); newBadges.push(b); } };
    let levels = s.levels; let exams = s.exams;
    if (mode === 'exam') {
      add('examen');
      const perSkill: ExamResult['perSkill'] = {};
      for (const it of items) { const k = it.ex.skill as SkillId; const [c, t] = perSkill[k] ?? [0, 0]; perSkill[k] = [c + (it.correct ? 1 : 0), t + 1]; }
      exams = [...exams, { t: Date.now(), levelId: level.id, score: items.filter((i) => i.correct).length, total: items.length, perSkill }];
    } else if (!review) {
      levels = { ...levels, [level.id]: { stars: Math.max(prevStars, stars), best: Math.max(prev?.best ?? 0, Math.round(ratio * 100)), plays: (prev?.plays ?? 0) + 1 } };
      add('premiers-pas');
      if (stars === 3) add('etoile-doree');
      if (stars === 3 && !anyHint) add('sans-indice');
      if (items.some((i) => !i.firstTry)) add('perseverance');
      if (level.id === 'n10') add('dragon');
      if (level.id === 'm9') add('gardien-mots');
      if (level.id === 'f8') add('gardien-formes');
      if (level.id === 'd7') add('gardien-decouvertes');
    }
    return { ...s, levels, exams, badges: [...have], coins: s.coins + coins };
  });
  return { level, mode, items, stars, coins, correctBase, totalBase: base.length, newBadges, prevStars };
}
