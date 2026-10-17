export type SkillId =
  | 'suites' | 'abaque' | 'comparer' | 'decomposer' | 'addition' | 'soustraction'
  | 'tables' | 'division' | 'choix-operation' | 'probleme'
  | 'conversion' | 'heure' | 'duree' | 'fractions' | 'aire' | 'monnaie'
  | 'frise' | 'siecles' | 'terre' | 'decalage' | 'epc' | 'statistiques'
  | 'polygones' | 'angles' | 'quadrilateres' | 'perimetre' | 'solides' | 'symetrie'
  | 'homophones' | 'pluriel' | 'accord' | 'conjugaison' | 'nature' | 'vocabulaire';

export interface Skill { id: SkillId; label: string; source: string }

export type AnswerKind = 'number' | 'choice' | 'text';

export interface Exercise {
  id: string;
  skill: SkillId;
  prompt: string;
  kind: AnswerKind;
  /** Réponses acceptées (normalisées au moment de la correction) */
  answers: string[];
  choices?: string[];
  /** Indices progressifs : jamais la réponse brute */
  hints: string[];
  /** Explication montrée après erreur répétée ou en correction d'examen */
  explanation: string;
  /** Aide visuelle optionnelle */
  visual?: { type: 'clock'; h: number; m: number } | { type: 'polygon'; sides: number } | { type: 'angle'; deg: number } | { type: 'bars'; items: [string, number][] } | { type: 'sequence'; items: (string | null)[] } | { type: 'abacus'; digits: Record<string, string> } | { type: 'column'; a: string; b: string; op: '+' | '−' | '×' };
  /** Trace de l'origine pour la traçabilité */
  origin: 'generated';
}

export interface Attempt {
  t: number; skill: SkillId; correct: boolean; hintsUsed: number; ms: number; levelId: string; mode: 'training' | 'exam';
  prompt: string; given: string; expected: string;
}
