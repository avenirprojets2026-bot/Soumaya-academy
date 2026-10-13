import type { Exercise } from './types';
import { parseNum } from './format';

export function normalizeText(s: string) {
  return s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
}

export function isCorrect(ex: Exercise, given: string): boolean {
  if (ex.kind === 'number') {
    const g = parseNum(given);
    if (g === null) return false;
    return ex.answers.some((a) => { const n = parseNum(a); return n !== null && Math.abs(n - g) < 1e-9; });
  }
  return ex.answers.some((a) => normalizeText(a) === normalizeText(given));
}
