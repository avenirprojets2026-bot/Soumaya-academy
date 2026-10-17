// Assemblage des épreuves : express (P4, P5), éclair, diagnostic. Les examens blancs complets viennent de banks/blancs.ts.
import type { ExamBlock, ExamSection, Question } from "@/data/kit";
import { WORLDS, blocksToSections, type ExamDef } from "@/data/catalog";
import * as FR from "@/data/banks/francais";
import * as LE from "@/data/banks/lecture";
import * as SC from "@/data/banks/sciences";
import * as MO from "@/data/banks/monde";
import { mathExam } from "@/data/gen-maths";
import { grExam } from "@/data/gen-grandeurs";
import { hash, mulberry32, shuffleSeeded } from "@/lib/engine";
import { setStrict } from "@/data/gen-core";

const withPts = (qs: Question[], max: number): Question[] => qs.map((q) => ({ ...q, pts: max / qs.length }));

function section(id: ExamSection["id"], title: string, max: number, qs: Question[]): ExamSection {
  return { id, title, max, qs: withPts(qs, max) };
}

export function expressExam(level: "P4" | "P5", nonce: string): ExamDef {
  setStrict(false);
  const p4 = level === "P4";
  const pick = <T extends { EXAM_P4: ExamBlock[]; EXAM_P5: ExamBlock[] }>(m: T) => (p4 ? m.EXAM_P4 : m.EXAM_P5);
  const flat = (blocks: ExamBlock[]) => blocks.flatMap((b) => b.qs.map((q) => ({ ...q, ...(b.ctx ? { ctx: b.ctx } : {}) }) as Question));
  const levels = p4 ? [4, 5, 6] : [7, 8, 9];
  const maths = [...mathExam(levels, `exp-${level}-${nonce}`, 3), ...grExam(p4 ? [4, 5, 6] : [8, 9, 10], `expg-${level}-${nonce}`, 1)];
  const eveil = shuffleSeeded([...flat(pick(SC)), ...flat(pick(MO))], nonce).slice(0, 12);
  const sections = [
    section("lire", "Lire et comprendre", 20, flat(pick(LE))),
    section("langue", "Langue", 15, flat(pick(FR))),
    section("maths", "Mathématiques", 25, maths),
    section("eveil", "Éveil : sciences, histoire, géographie", 15, eveil),
  ];
  return {
    id: `express-${level.toLowerCase()}`, kind: "express", level,
    title: `Examen express ${level}`, blurb: "Lire, langue, maths et éveil en une séance. Les nombres changent à chaque fois.",
    sections, durationMin: 60,
  };
}

const SIMPLE = (q: Question) => (q.k === "mcq" || q.k === "tf" || q.k === "num") && !q.ctx && !q.audio;

/** Questions autonomes (sans texte à relire) d'une mission. */
const standalone = (m: { qs: Question[]; text?: unknown }) => (m.text ? [] : m.qs.filter(SIMPLE));

export function eclairExam(maxLevel: number, nonce: string): ExamDef {
  const pool = WORLDS.filter((w) => w.id !== "atelier").flatMap((w) => w.missions.filter((m) => m.level <= maxLevel).flatMap(standalone));
  const qs = shuffleSeeded(pool, `eclair-${nonce}`).slice(0, 12);
  return { id: "eclair", kind: "eclair", level: maxLevel >= 7 ? "P5" : "P4", title: "Mode Éclair", blurb: "12 questions, 20 secondes chacune. Vite et juste !", sections: [section("maths", "Éclair", 12, qs)] };
}

export function diagnosticExam(nonce: string): ExamDef {
  const r = mulberry32(hash(`diag-${nonce}`));
  const take = (worldId: string, levels: number[]) => {
    const w = WORLDS.find((x) => x.id === worldId)!;
    const out: Question[] = [];
    for (const lv of levels) {
      const m = w.missions.find((x) => x.level === lv)!;
      const cands = shuffleSeeded(standalone(m), `${nonce}-${worldId}-${lv}`);
      for (const q of cands.slice(0, 2)) out.push({ ...q, vis: q.vis });
    }
    void r;
    return out;
  };
  const maths = take("maths", [2, 4, 6, 8, 10]);
  const langue = take("francais", [2, 4, 6, 8, 10]);
  const grand = take("grandeurs", [2, 4, 6, 8]);
  return {
    id: "diagnostic", kind: "diag", level: "P4", title: "Test de diagnostic",
    blurb: "Des questions de plus en plus difficiles pour trouver ton niveau de départ.",
    sections: [section("maths", "Mathématiques", maths.length, maths), section("langue", "Français", langue.length, langue), section("maths", "Grandeurs et géométrie", grand.length, grand)],
  };
}

export const flattenExam = (def: ExamDef) =>
  def.sections.flatMap((s) => s.qs.map((q) => ({ q, tag: s.title, sectionId: s.id, sectionTitle: s.title })));

/** Points gagnés et points possibles, par section, à partir des scores par question. */
export function scoreExam(def: ExamDef, scores: number[]) {
  let idx = 0;
  const sections = def.sections.map((s) => {
    let pts = 0, max = 0;
    for (const q of s.qs) { const p = q.pts ?? s.max / s.qs.length; pts += p * (scores[idx++] ?? 0); max += p; }
    return { id: s.id, title: s.title, pts: Math.round(pts * 2) / 2, max: Math.round(max * 2) / 2 };
  });
  const pts = sections.reduce((a, s) => a + s.pts, 0), max = sections.reduce((a, s) => a + s.max, 0);
  return { sections, pts, max, pct: max ? Math.round((pts / max) * 100) : 0 };
}

export { blocksToSections };
