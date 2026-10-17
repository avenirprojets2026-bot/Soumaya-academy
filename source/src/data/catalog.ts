// Catalogue du jeu : mondes, missions, épreuves. Seul point d'entrée des contenus pour le moteur et l'interface.
import type { BlancExam, ExamBlock, ExamSection, Mission, Question } from "./kit";
import { mcq } from "./kit";
import { MISSIONS as MA } from "./gen-maths";
import { MISSIONS as GR } from "./gen-grandeurs";
import * as FR from "./banks/francais";
import * as LE from "./banks/lecture";
import * as SC from "./banks/sciences";
import * as MO from "./banks/monde";
import * as AT from "./banks/atelier";
import { WORLDS as LEGACY } from "./worlds";

export type World = {
  id: string;
  prefix: string;
  name: string;
  subject: string;
  tagline: string;
  /** Nom du lieu et ambiance (carte et page du monde). */
  lore: string;
  hue: number;
  icon: "book" | "calc" | "clock" | "flask" | "scroll" | "globe" | "feather";
  scene: string;
  /** Position du lieu sur le panorama, en %. */
  map: { x: number; y: number };
  missions: Mission[];
};

export const LEVEL_BANDS = [
  { id: "p4", label: "P4 · les bases", from: 1, to: 4 },
  { id: "p4x", label: "P4 · niveau examen", from: 5, to: 6 },
  { id: "p5", label: "P5 · pour voir plus loin", from: 7, to: 10 },
] as const;
export const bandOf = (level: number) => LEVEL_BANDS.find((b) => level >= b.from && level <= b.to)!;

export const WORLDS: World[] = [
  {
    id: "francais", prefix: "fr", name: "La Bibliothèque des Mots", subject: "Français",
    tagline: "Grammaire, conjugaison, orthographe : les livres volants gardent les secrets de la langue.",
    lore: "Où les livres s'envolent comme des oiseaux.", hue: 345, icon: "book", scene: "francais.webp", map: { x: 9, y: 44 }, missions: FR.MISSIONS,
  },
  {
    id: "maths", prefix: "ma", name: "La Tour de Cristal", subject: "Mathématiques",
    tagline: "Nombres, tables, calculs et problèmes : chaque cristal cache un défi.",
    lore: "Un cristal qui chante les nombres.", hue: 262, icon: "calc", scene: "maths.webp", map: { x: 28.5, y: 24 }, missions: MA,
  },
  {
    id: "grandeurs", prefix: "gr", name: "Le Pont des Horloges", subject: "Grandeurs et géométrie",
    tagline: "Heures, argent, longueurs, périmètre, aires et figures : les engrenages mesurent tout.",
    lore: "Les engrenages veillent sur la cascade.", hue: 36, icon: "clock", scene: "grandeurs.webp", map: { x: 38.5, y: 60 }, missions: GR,
  },
  {
    id: "lecture", prefix: "le", name: "Le Village des Contes", subject: "Lecture",
    tagline: "Récits, poèmes, documentaires et actualité : dans chaque chaumière, un texte t'attend.",
    lore: "Le phare, le village et un petit dragon.", hue: 22, icon: "scroll", scene: "lecture.webp", map: { x: 85, y: 74 }, missions: LE.MISSIONS,
  },
  {
    id: "sciences", prefix: "sc", name: "Le Jardin des Étoiles", subject: "Sciences",
    tagline: "Vivant, matière, énergie, espace : observe, expérimente, comprends.",
    lore: "Forêt enchantée et télescope géant.", hue: 172, icon: "flask", scene: "sciences.webp", map: { x: 74, y: 40 }, missions: SC.MISSIONS,
  },
  {
    id: "monde", prefix: "mo", name: "Les Royaumes du Temps", subject: "Histoire et géographie",
    tagline: "Cartes, paysages, Belgique, Europe, frises du temps : voyage d'une époque à l'autre.",
    lore: "Une carte magique où chaque île est une époque.", hue: 205, icon: "globe", scene: "monde.webp", map: { x: 14, y: 84 }, missions: MO.MISSIONS,
  },
  {
    id: "atelier", prefix: "at", name: "L'Atelier des Merveilles", subject: "Expression écrite et orale",
    tagline: "Écris des histoires, raconte à voix haute, argumente : ta plume est magique.",
    lore: "Un village de conteurs au pied du château des savoirs.", hue: 320, icon: "feather", scene: "atelier.webp", map: { x: 52, y: 32 }, missions: AT.MISSIONS,
  },
];

export const WORLD_BY_ID = new Map(WORLDS.map((w) => [w.id, w]));
export const COURT = { scene: "defis.webp", name: "Le Château d'Or", map: { x: 91, y: 20 } };

// ---------- Classiques de la version précédente (conservés) ----------
export const CLASSICS: Mission[] = LEGACY.flatMap((w, wi) =>
  w.missions.map((m, i): Mission => ({
    id: `cl-${m.id}`,
    title: m.title,
    intro: m.intro,
    level: Math.min(10, i + 1 + (wi % 2)),
    ...(m.text ? { text: { title: m.text.title, body: m.text.body } } : {}),
    qs: m.questions.map((q): Question => mcq(q.q, q.choices[q.a], q.choices.filter((_, k) => k !== q.a), q.e)),
  })),
);
export const CLASSIC_GROUPS = LEGACY.map((w) => ({ id: w.id, name: w.name, subject: w.subject, hue: w.hue, missions: CLASSICS.filter((c) => c.id.startsWith(`cl-${w.missions[0].id.split("-")[0]}-`)) }));

export const ALL_MISSIONS: (Mission & { worldId: string })[] = [
  ...WORLDS.flatMap((w) => w.missions.map((m) => ({ ...m, worldId: w.id }))),
  ...CLASSICS.map((m) => ({ ...m, worldId: "classiques" })),
];
const MISSION_BY_ID = new Map(ALL_MISSIONS.map((m) => [m.id, m]));
export const findMission = (id: string) => MISSION_BY_ID.get(id);
export const findWorld = (id: string) => WORLD_BY_ID.get(id);
export const worldOfMission = (id: string) => WORLD_BY_ID.get(MISSION_BY_ID.get(id)?.worldId ?? "");
export const nextMission = (id: string) => {
  const w = worldOfMission(id);
  if (!w) return undefined;
  const i = w.missions.findIndex((m) => m.id === id);
  return w.missions[i + 1];
};

/** Nombre de questions auto-évaluées + productions, utile aux statistiques. */
export const COUNTS = {
  missions: ALL_MISSIONS.length,
  worlds: WORLDS.length,
  questions: ALL_MISSIONS.reduce((s, m) => s + m.qs.length, 0),
};

// ---------- Épreuves ----------
export type ExamKind = "blanc" | "express" | "eclair" | "diag";
export type ExamDef = { id: string; kind: ExamKind; title: string; blurb: string; level: "P4" | "P5"; sections: ExamSection[]; durationMin?: number };

export const SECTION_LABEL: Record<ExamSection["id"], string> = {
  lire: "Lire", langue: "Langue", ecrire: "Écrire", maths: "Maths", eveil: "Éveil", ecouter: "Écouter", parler: "Parler",
};
export const SECTION_DURATION: Record<ExamSection["id"], number> = { lire: 20, langue: 15, ecrire: 20, maths: 35, eveil: 20, ecouter: 10, parler: 5 };

/** Distinctions indicatives (les seuils réels dépendent de l'établissement). */
export const DISTINCTIONS = [
  { min: 90, name: "Plus grande distinction", short: "PGD" },
  { min: 80, name: "Grande distinction", short: "GD" },
  { min: 70, name: "Distinction", short: "D" },
  { min: 50, name: "Satisfaction", short: "S" },
  { min: 0, name: "À retravailler", short: "R" },
];
export const distinctionOf = (pct: number) => DISTINCTIONS.find((d) => pct >= d.min)!;

export function blocksToSections(blocks: ExamBlock[], id: ExamSection["id"], title: string, ptsEach: number): ExamSection {
  const qs = blocks.flatMap((b) => b.qs.map((q, i) => ({ ...q, ...(i === 0 && b.ctx ? { ctx: b.ctx } : b.ctx ? { ctx: b.ctx } : {}), pts: ptsEach }) as Question));
  return { id, title, max: qs.length * ptsEach, qs };
}

let blancsCache: BlancExam[] | null | undefined;
export async function loadBlancs(): Promise<BlancExam[]> {
  if (blancsCache) return blancsCache;
  try {
    // Chargé à la demande : le fichier est volumineux et n'est utile qu'à la salle des épreuves.
    const mod = (await import("./banks/blancs")) as { BLANCS: BlancExam[] };
    blancsCache = mod.BLANCS;
  } catch {
    blancsCache = [];
  }
  return blancsCache;
}
