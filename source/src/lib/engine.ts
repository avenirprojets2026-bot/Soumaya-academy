// Moteur pédagogique : préparation des questions, correction, score. Sans dépendance à l'interface.
import type { Question } from "@/data/kit";
import { isNumAnswer, normalizeAnswer } from "@/data/kit";

/** Réponse de l'élève selon le type de question. */
export type Answer =
  | { k: "mcq"; v: string }
  | { k: "tf"; v: boolean }
  | { k: "num"; v: string }
  | { k: "ord"; v: string[] }
  | { k: "mat"; v: Record<string, string> }
  | { k: "gap"; v: string[] }
  | { k: "prod"; v: { text?: string; ticked: number[] } };

export type Verdict = { score: number; correct: boolean; detail?: string };

export function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function shuffleSeeded<T>(arr: readonly T[], seed: string): T[] {
  const r = mulberry32(hash(seed));
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Version d'une question prête à afficher : choix et éléments mélangés de façon stable pour une tentative donnée. */
export type Prepared =
  | { k: "mcq"; q: Question & { k: "mcq" }; choices: string[] }
  | { k: "tf"; q: Question & { k: "tf" } }
  | { k: "num"; q: Question & { k: "num" } }
  | { k: "ord"; q: Question & { k: "ord" }; shuffled: string[] }
  | { k: "mat"; q: Question & { k: "mat" }; lefts: string[]; rights: string[] }
  | { k: "gap"; q: Question & { k: "gap" }; bank: string[] }
  | { k: "prod"; q: Question & { k: "prod" } };

export function prepare(q: Question, seed: string): Prepared {
  const s = `${seed}|${"q" in q ? q.q : ""}`;
  switch (q.k) {
    case "mcq": return { k: "mcq", q, choices: shuffleSeeded([q.ok, ...q.ko], s) };
    case "tf": return { k: "tf", q };
    case "num": return { k: "num", q };
    case "ord": {
      let sh = shuffleSeeded(q.items, s);
      // Ne jamais présenter l'ordre déjà correct
      if (sh.every((x, i) => x === q.items[i])) sh = [...sh.slice(1), sh[0]];
      return { k: "ord", q, shuffled: sh };
    }
    case "mat": return { k: "mat", q, lefts: q.pairs.map((p) => p[0]), rights: shuffleSeeded(q.pairs.map((p) => p[1]), s) };
    case "gap": return { k: "gap", q, bank: shuffleSeeded(q.bank, s) };
    case "prod": return { k: "prod", q };
  }
}

export function judge(q: Question, a: Answer | undefined): Verdict {
  if (!a || a.k !== q.k) return { score: 0, correct: false };
  switch (q.k) {
    case "mcq": { const ok = (a as Extract<Answer, { k: "mcq" }>).v === q.ok; return { score: ok ? 1 : 0, correct: ok }; }
    case "tf": { const ok = (a as Extract<Answer, { k: "tf" }>).v === q.a; return { score: ok ? 1 : 0, correct: ok }; }
    case "num": { const ok = isNumAnswer(q, (a as Extract<Answer, { k: "num" }>).v); return { score: ok ? 1 : 0, correct: ok }; }
    case "ord": {
      const v = (a as Extract<Answer, { k: "ord" }>).v;
      const ok = v.length === q.items.length && v.every((x, i) => x === q.items[i]);
      return { score: ok ? 1 : 0, correct: ok };
    }
    case "mat": {
      const v = (a as Extract<Answer, { k: "mat" }>).v;
      const good = q.pairs.filter(([l, r]) => v[l] === r).length;
      return { score: good / q.pairs.length, correct: good === q.pairs.length, detail: `${good}/${q.pairs.length}` };
    }
    case "gap": {
      const v = (a as Extract<Answer, { k: "gap" }>).v;
      const good = q.ok.filter((x, i) => normalizeAnswer(v[i] ?? "") === normalizeAnswer(x)).length;
      return { score: good / q.ok.length, correct: good === q.ok.length, detail: `${good}/${q.ok.length}` };
    }
    case "prod": {
      const v = (a as Extract<Answer, { k: "prod" }>).v;
      const n = new Set(v.ticked).size;
      const s = n / q.crit.length;
      return { score: s, correct: s >= 0.75, detail: `${n}/${q.crit.length}` };
    }
  }
}

/** Réponse attendue en texte (pour la correction). */
export function expected(q: Question): string {
  switch (q.k) {
    case "mcq": return q.ok;
    case "tf": return q.a ? "Vrai" : "Faux";
    case "num": return q.ok[0] + (q.unit ? ` ${q.unit}` : "");
    case "ord": return q.items.join(" → ");
    case "mat": return q.pairs.map(([l, r]) => `${l} = ${r}`).join(" ; ");
    case "gap": return q.ok.join(" · ");
    case "prod": return q.modele ?? "";
  }
}

export const questionText = (q: Question) => ("q" in q ? q.q : "");

export function wordCount(s: string) {
  return (s.trim().match(/[\p{L}\p{N}’'-]+/gu) ?? []).length;
}

export type Stars = 0 | 1 | 2 | 3;
export const PASS = 60;
export const starsOf = (pct: number): Stars => (pct >= 95 ? 3 : pct >= 80 ? 2 : pct >= PASS ? 1 : 0);
export const pctOf = (verdicts: Verdict[]) => (verdicts.length ? Math.round((verdicts.reduce((s, v) => s + v.score, 0) / verdicts.length) * 100) : 0);

export const MOODS = {
  win: ["Bravo, Soumaya !", "Exact ! Tu as l'esprit vif.", "Magnifique, continue !", "Parfait, Mimi applaudit !"],
  almost: ["Presque ! Relis l'explication.", "Bonne piste, regarde la correction.", "Pas tout à fait, mais tu progresses."],
  lose: ["Pas grave : on apprend en essayant.", "Courage, c'est en se trompant qu'on retient.", "Regarde la correction, tu l'auras la prochaine fois."],
};
export const pickMsg = (list: string[], n: number) => list[Math.abs(n) % list.length];
