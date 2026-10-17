import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { checkMissions, checkExam, report } from "./validate-content";
// Chaque banque exporte : MISSIONS (Mission[]) et EXAM_P4 / EXAM_P5 (ExamBlock[]) quand prévu.
for (const f of process.argv.slice(2)) {
  const mod = await import(pathToFileURL(resolve(f)).href);
  if (mod.MISSIONS) checkMissions(f, mod.MISSIONS, { qs: mod.QS_RANGE });
  for (const k of ["EXAM_P4", "EXAM_P5"]) if (mod[k]) checkExam(`${f}:${k}`, mod[k]);
  console.log(f, "→", mod.MISSIONS?.length ?? 0, "missions,", (mod.MISSIONS ?? []).reduce((s: number, m: any) => s + m.qs.length, 0), "questions");
}
report();
