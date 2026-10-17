// Validation des banques de contenu : node --import tsx tools/validate-content.ts <fichier> ...
// Usage agent : pnpm exec tsx tools/validate-content.ts src/data/banks/francais.ts
import type { Mission, Question, ExamBlock } from "../src/data/kit";
import { normalizeAnswer } from "../src/data/kit";

const seen = new Map<string, string>();
let errors = 0;
const err = (where: string, msg: string) => { errors++; console.error(`✗ ${where}: ${msg}`); };

export function checkQuestion(where: string, q: Question) {
  if (!q.e || q.e.trim().length < 12) err(where, "explication trop courte");
  if (q.k !== "prod" && q.q.length > 400) err(where, "énoncé trop long");
  const key = normalizeAnswer(q.q);
  if (seen.has(key)) err(where, `doublon de l'énoncé avec ${seen.get(key)}`); else seen.set(key, where);
  switch (q.k) {
    case "mcq": {
      if (q.ko.length < 2 || q.ko.length > 4) err(where, "mcq : 2 à 4 distracteurs");
      const all = [q.ok, ...q.ko].map(normalizeAnswer);
      if (new Set(all).size !== all.length) err(where, "mcq : choix en double ou bonne réponse dans les distracteurs");
      if (all.some((x) => !x)) err(where, "mcq : choix vide");
      break;
    }
    case "tf": if (typeof q.a !== "boolean") err(where, "tf : a doit être boolean"); break;
    case "num": if (!q.ok.length || q.ok.some((x) => !x.trim())) err(where, "num : ok vide"); break;
    case "ord": {
      if (q.items.length < 3 || q.items.length > 6) err(where, "ord : 3 à 6 éléments");
      if (new Set(q.items.map(normalizeAnswer)).size !== q.items.length) err(where, "ord : éléments en double");
      break;
    }
    case "mat": {
      if (q.pairs.length < 3 || q.pairs.length > 5) err(where, "mat : 3 à 5 paires");
      const l = q.pairs.map((p) => normalizeAnswer(p[0])), r = q.pairs.map((p) => normalizeAnswer(p[1]));
      if (new Set(l).size !== l.length || new Set(r).size !== r.length) err(where, "mat : éléments en double");
      break;
    }
    case "gap": {
      const n = (q.q.match(/___/g) ?? []).length;
      if (n < 1 || n !== q.ok.length) err(where, `gap : ${n} trou(s) pour ${q.ok.length} réponse(s)`);
      for (const o of q.ok) if (!q.bank.includes(o)) err(where, `gap : « ${o} » absent de la banque`);
      if (new Set(q.bank.map(normalizeAnswer)).size !== q.bank.length) err(where, "gap : banque avec doublons");
      break;
    }
    case "prod": {
      if (q.crit.length < 3 || q.crit.length > 6) err(where, "prod : 3 à 6 critères");
      if (q.aide.length < 2) err(where, "prod : au moins 2 aides");
      break;
    }
    default: err(where, "type inconnu");
  }
}

export function checkMissions(file: string, ms: Mission[], opts: { count?: number; qs?: number[] } = {}) {
  const count = opts.count ?? 10;
  if (ms.length !== count) err(file, `${ms.length} missions au lieu de ${count}`);
  const ids = new Set<string>();
  ms.forEach((m, i) => {
    const w = `${file}:${m.id}`;
    if (ids.has(m.id)) err(w, "id en double"); ids.add(m.id);
    if (m.level !== i + 1) err(w, `level ${m.level} attendu ${i + 1}`);
    if (!m.id.endsWith(`-${m.level}`)) err(w, "l'id doit finir par -<level>");
    if (!m.title || !m.intro) err(w, "titre/intro manquant");
    const [lo, hi] = opts.qs ?? [4, 8];
    if (m.qs.length < lo || m.qs.length > hi) err(w, `${m.qs.length} questions (attendu ${lo}-${hi})`);
    const kinds = new Set(m.qs.map((q) => q.k));
    if (m.qs.length >= 5 && kinds.size < 2) err(w, "au moins 2 types de questions différents");
    m.qs.forEach((q, j) => checkQuestion(`${w}#${j + 1}`, q));
  });
}

export function checkExam(file: string, blocks: ExamBlock[]) {
  blocks.forEach((b, i) => b.qs.forEach((q, j) => checkQuestion(`${file}:exam${i + 1}#${j + 1}`, q)));
}

export const report = () => { if (errors) { console.error(`\n${errors} erreur(s)`); process.exit(1); } else console.log("✓ contenu valide"); };
