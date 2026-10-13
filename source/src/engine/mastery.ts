import type { Attempt, SkillId } from './types';

export interface SkillStats { attempts: number; correct: number; hintsUsed: number; lastSeen: number | null; box: number; due: number | null; totalMs: number }
export const emptyStats = (): SkillStats => ({ attempts: 0, correct: 0, hintsUsed: 0, lastSeen: null, box: 1, due: null, totalMs: 0 });

const DAY = 86400000;
const INTERVAL_DAYS = [0, 0, 1, 2, 4, 8, 16];
/** Nombre minimum de tentatives avant d'afficher une estimation de maîtrise. */
export const MIN_ATTEMPTS_FOR_MASTERY = 6;

export function updateStats(prev: SkillStats, a: Attempt): SkillStats {
  const good = a.correct && a.hintsUsed === 0;
  const box = good ? Math.min(6, prev.box + 1) : a.correct ? prev.box : 1;
  return {
    attempts: prev.attempts + 1, correct: prev.correct + (a.correct ? 1 : 0), hintsUsed: prev.hintsUsed + a.hintsUsed,
    lastSeen: a.t, box, due: a.t + INTERVAL_DAYS[box] * DAY, totalMs: prev.totalMs + a.ms,
  };
}

/** Maîtrise estimée (0–100) sur les dernières tentatives ; null si données insuffisantes. */
export function masteryEstimate(history: Attempt[], skill: SkillId): number | null {
  const recent = history.filter((h) => h.skill === skill && h.mode === 'training').slice(-12);
  if (recent.length < MIN_ATTEMPTS_FOR_MASTERY) return null;
  const score = recent.reduce((s, h) => s + (h.correct ? (h.hintsUsed === 0 ? 1 : 0.6) : 0), 0);
  return Math.round((score / recent.length) * 100);
}

export function dueSkills(stats: Partial<Record<SkillId, SkillStats>>, now: number): SkillId[] {
  return (Object.keys(stats) as SkillId[]).filter((k) => { const s = stats[k]; return s && s.due !== null && s.due <= now && (s.box <= 3 || s.correct / s.attempts < 0.8); });
}
