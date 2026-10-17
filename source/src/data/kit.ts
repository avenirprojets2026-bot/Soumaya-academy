// Kit de contenu : types de questions et fabriques. Toutes les banques d'exercices utilisent ces fabriques.
// Règle d'or : la bonne réponse d'un QCM est toujours écrite EN PREMIER (`ok`) ; l'ordre est mélangé à l'affichage.

/** Support visuel dessiné par le jeu au-dessus de l'énoncé. */
export type Vis =
  | { t: "clock"; h: number; m: number }
  | { t: "poly"; shape: "triangle" | "rect-tri" | "iso" | "equi" | "square" | "rect" | "rhombus" | "pentagon" | "hexagon" | "quad" }
  | { t: "plan"; cols: number; rows: number; items: { c: number; r: number; label: string }[]; title?: string }
  | { t: "numline"; min: number; max: number; marks: { v: number; label?: string }[] };

type Base = {
  vis?: Vis;
  /** Explication / corrigé pédagogique, affiché après la réponse (1 à 3 phrases, ton positif). */
  e: string;
  /** Contexte (texte à relire) affiché au-dessus de la question, utile pour les examens blancs. */
  ctx?: { title: string; body: string[] };
  /** Points attribués dans un examen blanc (barème d'entraînement). */
  pts?: number;
  /** Texte lu à voix haute (épreuve « Écouter ») : jamais affiché avant la fin, lisible 2 fois. */
  audio?: { title: string; text: string };
};

export type MCQ = Base & { k: "mcq"; q: string; ok: string; ko: string[] };
export type TF = Base & { k: "tf"; q: string; a: boolean };
/** Réponse libre courte (nombre ou mot). `ok` = toutes les écritures acceptées. */
export type NUM = Base & { k: "num"; q: string; ok: string[]; unit?: string };
/** Remettre dans l'ordre : `items` est donné dans le BON ordre, mélangé à l'affichage. */
export type ORD = Base & { k: "ord"; q: string; items: string[] };
/** Relier : `pairs` = [gauche, droite]. */
export type MAT = Base & { k: "mat"; q: string; pairs: [string, string][] };
/** Texte à trous : `q` contient autant de « ___ » que d'éléments dans `ok`. `bank` contient `ok` + des intrus. */
export type GAP = Base & { k: "gap"; q: string; ok: string[]; bank: string[] };
/** Production : expression écrite ou orale, auto-évaluée avec une grille de critères. */
export type PROD = Base & {
  k: "prod";
  mode: "ecrit" | "oral";
  q: string;
  aide: string[];
  crit: string[];
  modele?: string;
  minMots?: number;
};

export type Question = MCQ | TF | NUM | ORD | MAT | GAP | PROD;

export type Mission = {
  id: string;
  title: string;
  intro: string;
  /** Niveau de difficulté 1 à 10 : 1-4 = P4, 5-6 = P4 avancé / examen, 7-10 = P5. */
  level: number;
  text?: { title: string; body: string[]; source?: string };
  qs: Question[];
};

/** Épreuve complète « interdiocésaine » : sections notées, total /100. */
export type ExamSectionId = "lire" | "langue" | "ecrire" | "maths" | "eveil" | "ecouter" | "parler";
export type ExamSection = { id: ExamSectionId; title: string; max: number; ctx?: { title: string; body: string[] }; qs: Question[] };
export type BlancExam = { id: string; title: string; theme: string; level: "P4" | "P5"; sections: ExamSection[] };

export type ExamBlock = { title: string; ctx?: { title: string; body: string[] }; qs: Question[] };

export const mcq = (q: string, ok: string, ko: string[], e: string): MCQ => ({ k: "mcq", q, ok, ko, e });
export const tf = (q: string, a: boolean, e: string): TF => ({ k: "tf", q, a, e });
export const num = (q: string, ok: string | string[], e: string, unit?: string): NUM => ({
  k: "num",
  q,
  ok: Array.isArray(ok) ? ok : [ok],
  e,
  ...(unit ? { unit } : {}),
});
export const ord = (q: string, items: string[], e: string): ORD => ({ k: "ord", q, items, e });
export const mat = (q: string, pairs: [string, string][], e: string): MAT => ({ k: "mat", q, pairs, e });
export const gap = (q: string, ok: string[], bank: string[], e: string): GAP => ({ k: "gap", q, ok, bank, e });
export const ecrit = (q: string, aide: string[], crit: string[], modele: string, e: string, minMots = 20): PROD => ({
  k: "prod", mode: "ecrit", q, aide, crit, modele, e, minMots,
});
export const oral = (q: string, aide: string[], crit: string[], e: string, modele?: string): PROD => ({
  k: "prod", mode: "oral", q, aide, crit, e, ...(modele ? { modele } : {}),
});

/** Normalise une saisie libre pour la comparer aux réponses acceptées. */
export function normalizeAnswer(s: string): string {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/(\d)[\s  .](?=\d{3}(\D|$))/g, "$1") // séparateur de milliers
    .replace(/(\d),(\d)/g, "$1.$2") // virgule décimale
    .replace(/\s+/g, " ")
    .replace(/[.!\s]+$/g, "")
    .trim();
}

export function isNumAnswer(question: NUM, input: string): boolean {
  const n = normalizeAnswer(input);
  if (!n) return false;
  return question.ok.some((a) => normalizeAnswer(a) === n || (question.unit && normalizeAnswer(`${a} ${question.unit}`) === n));
}
