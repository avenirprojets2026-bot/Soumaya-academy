// Outils de génération déterministe : chaque mission de calcul est reproductible (graine) et ses corrigés sont CALCULÉS.
import { mcq, tf, num, ord, mat, gap, normalizeAnswer, type Question } from "./kit";

export type Rng = () => number;
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
export const ri = (r: Rng, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
export const pick = <T,>(r: Rng, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)];
export function shuffled<T>(r: Rng, xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const fmt = (n: number) => (Math.abs(n) >= 10000 ? n.toLocaleString("fr-BE").replace(/ | /g, " ") : String(n));
export const euro = (n: number) => `${String(Number.isInteger(n) ? n : n.toFixed(2).replace(".", ","))} €`;

const U = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize"];
const T: Record<number, string> = { 20: "vingt", 30: "trente", 40: "quarante", 50: "cinquante", 60: "soixante" };
/** Nombres en lettres, orthographe belge (septante, nonante), traits d'union partout. */
export function words(n: number, final = true): string {
  if (n < 17) return U[n];
  if (n < 20) return `dix-${U[n - 10]}`;
  if (n < 100) {
    const t = Math.floor(n / 10) * 10, u = n % 10;
    if (t === 70 || t === 90) {
      const base = t === 70 ? "septante" : "nonante";
      return u === 0 ? base : u === 1 ? `${base}-et-un` : `${base}-${U[u]}`;
    }
    if (t === 80) return u === 0 ? (final ? "quatre-vingts" : "quatre-vingt") : `quatre-vingt-${U[u]}`;
    const base = T[t];
    return u === 0 ? base : u === 1 ? `${base}-et-un` : `${base}-${U[u]}`;
  }
  if (n < 1000) {
    const h = Math.floor(n / 100), rest = n % 100;
    const head = h === 1 ? "cent" : `${U[h]}-cent${rest === 0 && final ? "s" : ""}`;
    return rest === 0 ? head : `${head}-${words(rest, final)}`;
  }
  if (n < 1000000) {
    const k = Math.floor(n / 1000), rest = n % 1000;
    const head = k === 1 ? "mille" : `${words(k, false)}-mille`;
    return rest === 0 ? head : `${head}-${words(rest, final)}`;
  }
  return String(n);
}

/** Registre global anti-doublons : renvoie vrai si l'énoncé est nouveau. */
const SEEN = new Set<string>();
/** Clé d'unicité d'une question : énoncé + support visuel. */
export const qKey = (q: Question) => normalizeAnswer(("q" in q ? q.q : "") + (q.vis ? JSON.stringify(q.vis) : ""));
export const isFresh = (q: Question) => {
  const k = qKey(q);
  if (SEEN.has(k)) return false;
  SEEN.add(k);
  return true;
};
/** Appelle une fabrique jusqu'à obtenir un énoncé inédit (max 40 essais). */
let strict = true;
/** Au chargement, tout doublon est une erreur ; ensuite (examens générés à la demande) on tolère un doublon plutôt que de planter. */
export const setStrict = (v: boolean) => { strict = v; };
export function fresh(make: () => Question): Question {
  let last = make();
  for (let i = 0; i < 40; i++) {
    if (last.k === "prod" || isFresh(last)) return last;
    last = make();
  }
  if (!strict) return last;
  throw new Error("Impossible de générer un énoncé inédit : " + qKey(last));
}

/** Trois distracteurs numériques plausibles, tous distincts de la bonne réponse. */
export function numDistractors(r: Rng, ok: number, near: number[] = []): string[] {
  const set = new Set<number>();
  const cand = [...near, ok + 1, ok - 1, ok + 10, ok - 10, ok + 2, ok * 2, ok + 100, ok - 100, ok + 5];
  for (const c of shuffled(r, cand)) if (c !== ok && c >= 0 && !set.has(c)) set.add(c);
  return [...set].slice(0, 3).map(fmt);
}
export { mcq, tf, num, ord, mat, gap };
