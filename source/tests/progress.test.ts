import assert from "node:assert/strict";
import test from "node:test";
import { decodeProgressBackup, emptySave, encodeProgressBackup, migrateV1, sanitize, serializeProgressBackup, starsFor, passed, isUnlocked } from "../src/lib/progress";
import { WORLDS } from "../src/data/catalog";
import { starsOf, PASS, pctOf } from "../src/lib/engine";

test("étoiles : 60 → 1, 80 → 2, 95 → 3", () => {
  assert.deepEqual([0, 59, 60, 79, 80, 94, 95, 100].map(starsOf), [0, 0, 1, 1, 2, 2, 3, 3]);
  assert.equal(PASS, 60);
});

test("pourcentage de mission", () => {
  assert.equal(pctOf([{ score: 1, correct: true }, { score: 0.5, correct: false }]), 75);
  assert.equal(pctOf([]), 0);
});

test("déverrouillage : niveau suivant après 60 %, libre en mode parent", () => {
  const w = WORLDS[0];
  const s = emptySave();
  assert.equal(isUnlocked(s, w, 1), true);
  assert.equal(isUnlocked(s, w, 2), false);
  s.best[w.missions[0].id] = 60;
  assert.equal(passed(s, w.missions[0].id), true);
  assert.equal(isUnlocked(s, w, 2), true);
  assert.equal(starsFor(s, w.missions[0].id), 1);
  const free = { ...emptySave(), free: true };
  assert.equal(isUnlocked(free, w, 10), true);
});

test("sauvegarde : aller-retour par code et par fichier", () => {
  const s = emptySave();
  s.best[WORLDS[1].missions[2].id] = 87;
  s.exams["express-p4"] = { pts: 70, max: 100, plays: 2, at: "2026-10-01T10:00:00Z" };
  s.days = ["2026-10-15", "2026-10-16"];
  const viaCode = decodeProgressBackup(encodeProgressBackup(s));
  assert.equal(viaCode.best[WORLDS[1].missions[2].id], 87);
  assert.deepEqual(viaCode.exams["express-p4"].pts, 70);
  const viaJson = decodeProgressBackup(serializeProgressBackup(s, true));
  assert.deepEqual(viaJson.days, s.days);
});

test("sauvegarde invalide ou piégée refusée / nettoyée", () => {
  assert.throws(() => decodeProgressBackup(""));
  assert.throws(() => decodeProgressBackup("n'importe quoi"));
  assert.throws(() => decodeProgressBackup("SA2-@@@"));
  const dirty = sanitize({ best: { "ma-1": 9999, inconnu: 50, "ma-2": 80 }, days: ["x", "2026-01-01"], exams: { a: { pts: 9, max: 5 } } });
  assert.equal(dirty.best["ma-1"], undefined);
  assert.equal(dirty.best["inconnu"], undefined);
  assert.equal(dirty.best["ma-2"], 80);
  assert.deepEqual(dirty.days, ["2026-01-01"]);
  assert.deepEqual(dirty.exams, {});
});

test("migration v1 : scores sur 5 → pourcentages, missions classiques", () => {
  const m = migrateV1({ best: { "fr-1": 4, "fr-2": 5, zzz: 3 }, plays: { "fr-1": 3 } });
  assert.equal(m.best["cl-fr-1"], 80);
  assert.equal(m.best["cl-fr-2"], 100);
  assert.equal(m.plays["cl-fr-1"], 3);
  assert.equal(Object.keys(m.best).length, 2);
});

test("révision espacée : sauvegarde conservée, valeurs douteuses ignorées, questions dues triées", async () => {
  const { dueReviews, nextReviewDay } = await import("../src/lib/progress");
  const q = { k: "num", q: "Combien font 2 + 2 ?", ok: ["4"], e: "Deux et deux font quatre." };
  const s = emptySave();
  s.review = {
    a: { q: q as never, box: 2, due: "2026-10-10", w: "maths" },
    b: { q: q as never, box: 0, due: "2026-10-12", w: "maths" },
    c: { q: q as never, box: 1, due: "2099-01-01", w: "maths" },
  };
  const back = decodeProgressBackup(encodeProgressBackup(s));
  assert.equal(Object.keys(back.review ?? {}).length, 3);
  const due = dueReviews(back, "2026-10-17");
  assert.deepEqual(due.map((r) => r.box), [0, 2]);
  assert.equal(nextReviewDay(back), "2026-10-10");
  const dirty = sanitize({ review: { x: { q: { k: 3 }, box: 1, due: "2026-10-10" }, y: { q, box: 99, due: "2026-10-10" }, z: { q, box: 1, due: "demain" } } });
  assert.equal(dirty.review, undefined);
});

test("les résultats par épreuve d'un examen sont conservés après sauvegarde", () => {
  const s = emptySave();
  s.exams["express-p4"] = { pts: 62, max: 100, plays: 1, at: "2026-10-16T10:00:00Z", sections: { lireLire: { pts: 12, max: 20 }, maths: { pts: 12.5, max: 25 } } };
  const back = decodeProgressBackup(encodeProgressBackup(s));
  assert.deepEqual(back.exams["express-p4"].sections, s.exams["express-p4"].sections);
  assert.equal(sanitize({ exams: { a: { pts: 5, max: 10, sections: { x: { pts: 99, max: 10 } } } } }).exams.a.sections, undefined);
});
