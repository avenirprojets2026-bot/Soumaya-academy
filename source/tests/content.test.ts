import assert from "node:assert/strict";
import test from "node:test";
import { ALL_MISSIONS, CLASSICS, WORLDS, loadBlancs } from "../src/data/catalog";
import { flattenExam, expressExam, eclairExam, diagnosticExam, scoreExam } from "../src/lib/exams";
import { judge, expected, prepare, type Answer } from "../src/lib/engine";
import { normalizeAnswer, type Question } from "../src/data/kit";
import { qKey } from "../src/data/gen-core";

/** Fabrique la bonne réponse d'une question (sauf production libre). */
function perfect(q: Question): Answer | undefined {
  switch (q.k) {
    case "mcq": return { k: "mcq", v: q.ok };
    case "tf": return { k: "tf", v: q.a };
    case "num": return { k: "num", v: q.ok[0] };
    case "ord": return { k: "ord", v: [...q.items] };
    case "mat": return { k: "mat", v: Object.fromEntries(q.pairs) };
    case "gap": return { k: "gap", v: [...q.ok] };
    case "prod": return { k: "prod", v: { text: "ok", ticked: q.crit.map((_, i) => i) } };
  }
}

test("7 mondes × 10 niveaux, au moins 5 questions par mission (3 pour l’Atelier, tâches longues)", () => {
  assert.equal(WORLDS.length, 7);
  for (const w of WORLDS) {
    assert.deepEqual(w.missions.map((m) => m.level), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], w.id);
    for (const m of w.missions) assert.ok(m.qs.length >= (w.id === "atelier" ? 3 : 5), `${m.id} : ${m.qs.length} questions`);
  }
});

test("identifiants de missions uniques", () => {
  const ids = ALL_MISSIONS.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("chaque question a une explication et une bonne réponse jugée correcte", () => {
  for (const m of ALL_MISSIONS) for (const [i, q] of m.qs.entries()) {
    assert.ok(q.e && q.e.trim().length >= 8, `${m.id}#${i} : correction manquante`);
    const a = perfect(q);
    const v = judge(q, a);
    assert.equal(v.score, 1, `${m.id}#${i} (${q.k}) : la bonne réponse n'est pas acceptée`);
    assert.ok(expected(q).length > 0 || q.k === "prod", `${m.id}#${i} : réponse attendue vide`);
    assert.equal(judge(q, undefined).score, 0);
  }
});

test("QCM : choix distincts et réponse dans les choix mélangés", () => {
  for (const m of ALL_MISSIONS) for (const [i, q] of m.qs.entries()) if (q.k === "mcq") {
    const all = [q.ok, ...q.ko].map(normalizeAnswer);
    assert.equal(new Set(all).size, all.length, `${m.id}#${i} : choix en double`);
    const p = prepare(q, "s") as { choices?: string[] };
    if (p.choices) assert.ok(p.choices.includes(q.ok));
  }
});

test("la bonne réponse QCM n'est pas toujours au même rang (pas de biais de position)", () => {
  const pos = [0, 0, 0, 0];
  for (const m of ALL_MISSIONS.slice(0, 30)) for (const q of m.qs) if (q.k === "mcq") {
    const p = prepare(q, `${m.id}`) as { choices?: string[] };
    if (p.choices) pos[Math.min(3, p.choices.indexOf(q.ok))]++;
  }
  const total = pos.reduce((a, b) => a + b, 0);
  assert.ok(total > 20);
  for (const n of pos) assert.ok(n / total < 0.6, `biais de position : ${pos}`);
});

test("aucun doublon d'énoncé dans les mondes (hors classiques)", () => {
  const seen = new Map<string, string>();
  const dups: string[] = [];
  for (const m of ALL_MISSIONS.filter((x) => !x.id.startsWith("cl-"))) for (const q of m.qs) {
    const k = qKey(q);
    if (seen.has(k)) dups.push(`${m.id} = ${seen.get(k)} : ${("q" in q ? q.q : "").slice(0, 50)}`);
    seen.set(k, m.id);
  }
  assert.deepEqual(dups, []);
});

test("examens blancs : 100 points, 7 épreuves, sans doublon interne", async () => {
  const blancs = await loadBlancs();
  assert.ok(blancs.length >= 8);
  for (const b of blancs) {
    const total = b.sections.reduce((a, s) => a + s.max, 0);
    assert.equal(Math.round(total), 100, `${b.id} : ${total} points`);
    assert.deepEqual(new Set(b.sections.map((s) => s.id)).size, 7, `${b.id} : épreuves`);
    const keys = b.sections.flatMap((s) => s.qs.map(qKey));
    assert.equal(new Set(keys).size, keys.length, `${b.id} : doublon interne`);
    for (const s of b.sections) for (const q of s.qs) assert.ok(q.e, `${b.id} : correction manquante`);
  }
});

test("épreuves express, éclair, diagnostic : scores cohérents", () => {
  for (const def of [expressExam("P4", "t"), expressExam("P5", "t"), eclairExam(6, "t"), diagnosticExam("t")]) {
    const flat = flattenExam(def);
    assert.ok(flat.length >= 10, def.id);
    const perfectScores = flat.map(() => 1);
    const r = scoreExam(def, perfectScores);
    assert.equal(r.pct, 100, def.id);
    assert.equal(scoreExam(def, flat.map(() => 0)).pct, 0);
  }
});

test("générateurs : nombres nouveaux à chaque essai", () => {
  const a = expressExam("P4", "un"), b = expressExam("P4", "deux");
  const ma = a.sections.find((s) => s.id === "maths")!.qs.map(qKey).join("|");
  const mb = b.sections.find((s) => s.id === "maths")!.qs.map(qKey).join("|");
  assert.notEqual(ma, mb);
});

test("classiques conservés", () => assert.ok(CLASSICS.length >= 18));
