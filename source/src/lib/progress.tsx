// Progression locale (localStorage uniquement, aucune donnée envoyée). Version 2, avec migration depuis la version 1.
import { qKey } from "@/data/gen-core";
import type { Question } from "@/data/kit";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ALL_MISSIONS, CLASSICS, WORLDS, type World } from "@/data/catalog";
import { PASS, starsOf, type Stars } from "@/lib/engine";

export const KEY = "soumaya-academy:progression:v2";
export const KEY_V1 = "soumaya-academy:progression:v1";
const BACKUP_FORMAT = "soumaya-academy-progress";
const BACKUP_VERSION = 2;

export type ExamResult = { pts: number; max: number; plays: number; at: string; sections?: Record<string, { pts: number; max: number }> };
export type ReviewItem = { q: Question; box: number; due: string; w: string };
/** Jours avant la prochaine révision selon la boîte : une question réussie monte d'une boîte, ratée elle revient à 0. */
export const REVIEW_DAYS = [0, 1, 3, 7, 14, 30];
const MAX_REVIEW = 80;
export type Save = {
  v: 2;
  /** Meilleur score (pourcentage 0-100) de chaque mission. */
  best: Record<string, number>;
  plays: Record<string, number>;
  /** Résultats des épreuves (examens blancs, express, diagnostic). */
  exams: Record<string, ExamResult>;
  /** Réussites cumulées par monde, pour les statistiques par compétence. */
  stats: Record<string, { ok: number; n: number }>;
  /** Jours joués (AAAA-MM-JJ), 90 derniers jours. */
  days: string[];
  /** Mode parent : tous les niveaux sont accessibles. */
  free: boolean;
  /** Questions ratées à revoir, avec répétition espacée (boîte 0 à 5). */
  review?: Record<string, ReviewItem>;
  /** Dernière mission jouée, pour « Continuer ». */
  last?: string;
  updatedAt?: string;
};

export const emptySave = (): Save => ({ v: 2, best: {}, plays: {}, exams: {}, stats: {}, days: [], free: false });
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

/** Questions à revoir aujourd'hui, les plus fragiles d'abord. */
export function dueReviews(save: Save, day = today()): ReviewItem[] {
  return Object.values(save.review ?? {}).filter((r) => r.due <= day).sort((a, b) => a.box - b.box || a.due.localeCompare(b.due));
}
/** Date de la prochaine révision prévue (si aucune n'est due aujourd'hui). */
export function nextReviewDay(save: Save): string | undefined {
  const ds = Object.values(save.review ?? {}).map((r) => r.due).sort();
  return ds[0];
}

const missionIds = new Set(ALL_MISSIONS.map((m) => m.id));
const isRecord = (v: unknown): v is Record<string, any> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Nettoie une sauvegarde lue sur disque ou importée : toute valeur douteuse est ignorée. */
export function sanitize(raw: unknown): Save {
  const out = emptySave();
  if (!isRecord(raw)) return out;
  const num = (x: unknown, lo: number, hi: number) => (typeof x === "number" && Number.isFinite(x) && x >= lo && x <= hi ? Math.round(x) : undefined);
  if (isRecord(raw.best)) for (const [id, v] of Object.entries(raw.best)) { const n = num(v, 0, 100); if (missionIds.has(id) && n !== undefined) out.best[id] = n; }
  if (isRecord(raw.plays)) for (const [id, v] of Object.entries(raw.plays)) { const n = num(v, 0, 100000); if (missionIds.has(id) && n !== undefined) out.plays[id] = n; }
  if (isRecord(raw.exams)) for (const [id, v] of Object.entries(raw.exams)) {
    if (!isRecord(v) || id.length > 60) continue;
    const pts = num(v.pts, 0, 1000), max = num(v.max, 1, 1000), plays = num(v.plays, 0, 100000);
    if (pts === undefined || max === undefined || pts > max) continue;
    const sections: Record<string, { pts: number; max: number }> = {};
    if (isRecord(v.sections)) for (const [k, sv] of Object.entries(v.sections)) {
      if (k.length > 80 || !isRecord(sv) || Object.keys(sections).length >= 30) continue;
      const sp = typeof sv.pts === "number" && Number.isFinite(sv.pts) ? sv.pts : undefined, sm = typeof sv.max === "number" && Number.isFinite(sv.max) ? sv.max : undefined;
      if (sp !== undefined && sm !== undefined && sm > 0 && sm <= 1000 && sp >= 0 && sp <= sm) sections[k] = { pts: sp, max: sm };
    }
    out.exams[id] = { pts, max, plays: plays ?? 1, at: typeof v.at === "string" ? v.at.slice(0, 40) : "", ...(Object.keys(sections).length ? { sections } : {}) };
  }
  if (isRecord(raw.stats)) for (const [id, v] of Object.entries(raw.stats)) {
    if (!isRecord(v)) continue;
    const ok = num(v.ok, 0, 1e7), n = num(v.n, 0, 1e7);
    if (ok !== undefined && n !== undefined && ok <= n && (WORLDS.some((w) => w.id === id) || id === "classiques")) out.stats[id] = { ok, n };
  }
  if (Array.isArray(raw.days)) out.days = raw.days.filter((d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-90);
  if (isRecord(raw.review)) {
    const rev: Record<string, ReviewItem> = {};
    for (const [k, v] of Object.entries(raw.review)) {
      if (Object.keys(rev).length >= MAX_REVIEW) break;
      if (k.length > 400 || !isRecord(v) || !isRecord(v.q) || typeof v.q.k !== "string" || typeof v.q.e !== "string") continue;
      const box = num(v.box, 0, REVIEW_DAYS.length - 1);
      if (box === undefined || typeof v.due !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v.due)) continue;
      rev[k] = { q: v.q as Question, box, due: v.due, w: typeof v.w === "string" ? v.w.slice(0, 20) : "classiques" };
    }
    if (Object.keys(rev).length) out.review = rev;
  }
  out.free = raw.free === true;
  if (typeof raw.last === "string" && missionIds.has(raw.last)) out.last = raw.last;
  if (typeof raw.updatedAt === "string" && Number.isFinite(Date.parse(raw.updatedAt))) out.updatedAt = raw.updatedAt;
  return out;
}

/** v1 : scores sur 5 par mission (anciens identifiants fr-1…). Ils deviennent des « classiques » (cl-fr-1…). */
export function migrateV1(raw: unknown): Save {
  const out = emptySave();
  if (!isRecord(raw)) return out;
  const classicIds = new Set(CLASSICS.map((c) => c.id));
  const conv = (x: unknown) => (typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= 5 ? Math.round((x / 5) * 100) : undefined);
  if (isRecord(raw.best)) for (const [id, v] of Object.entries(raw.best)) { const p = conv(v); if (classicIds.has(`cl-${id}`) && p !== undefined) out.best[`cl-${id}`] = p; }
  if (isRecord(raw.plays)) for (const [id, v] of Object.entries(raw.plays)) if (classicIds.has(`cl-${id}`) && typeof v === "number" && v >= 0 && v < 1e5) out.plays[`cl-${id}`] = Math.round(v);
  if (typeof raw.updatedAt === "string" && Number.isFinite(Date.parse(raw.updatedAt))) out.updatedAt = raw.updatedAt;
  return out;
}

// ---------- Sauvegarde exportable ----------
export function serializeProgressBackup(save: Save, pretty = false): string {
  return JSON.stringify({ format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), save }, null, pretty ? 2 : undefined);
}
export function encodeProgressBackup(save: Save): string {
  const bytes = new TextEncoder().encode(serializeProgressBackup(save));
  let binary = "";
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return `SA2-${btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")}`;
}
export function decodeProgressBackup(input: string): Save {
  const text = input.trim();
  if (!text) throw new Error("Choisis un fichier ou colle le code de sauvegarde.");
  let raw: string;
  if (text.startsWith("{")) raw = text;
  else {
    const code = text.replace(/\s/g, "");
    if (!/^SA[12]-/.test(code)) throw new Error("Ce code ne ressemble pas à une sauvegarde de Soumaya Academy.");
    const encoded = code.slice(4).replace(/-/g, "+").replace(/_/g, "/");
    if (!encoded || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) throw new Error("Le code de sauvegarde est incomplet ou invalide.");
    try { raw = new TextDecoder().decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))); }
    catch { throw new Error("Le code de sauvegarde est incomplet ou invalide."); }
  }
  let backup: unknown;
  try { backup = JSON.parse(raw); } catch { throw new Error("Le fichier ou le code ne contient pas de sauvegarde lisible."); }
  if (!isRecord(backup) || backup.format !== BACKUP_FORMAT || !isRecord(backup.save)) throw new Error("Cette sauvegarde n’est pas compatible avec cette version du jeu.");
  if (backup.version === 1) return migrateV1(backup.save);
  if (backup.version !== BACKUP_VERSION) throw new Error("Cette sauvegarde n’est pas compatible avec cette version du jeu.");
  const s = backup.save;
  if (!isRecord(s.best) || !isRecord(s.plays)) throw new Error("La sauvegarde ne contient pas une progression valide.");
  for (const v of Object.values(s.best)) if (typeof v !== "number" || v < 0 || v > 100) throw new Error("La sauvegarde contient un score invalide.");
  return sanitize(s);
}

function storageAvailable(): boolean {
  try { const k = "__soumaya_test__"; window.localStorage.setItem(k, "1"); window.localStorage.removeItem(k); return true; } catch { return false; }
}
function load(): Save {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return sanitize(JSON.parse(raw));
    const old = window.localStorage.getItem(KEY_V1);
    if (old) {
      const migrated = migrateV1(JSON.parse(old));
      try { window.localStorage.setItem(KEY, JSON.stringify(migrated)); } catch { /* on garde la v1 intacte */ }
      return migrated;
    }
  } catch { /* données illisibles : on repart de zéro sans rien effacer */ }
  return emptySave();
}

// ---------- Règles de progression ----------
export const starsFor = (save: Save, id: string): Stars => starsOf(save.best[id] ?? 0);
export const passed = (save: Save, id: string) => (save.best[id] ?? 0) >= PASS;
/** Un niveau est ouvert si le précédent est réussi (60 %), ou en mode parent. Le niveau 1 est toujours ouvert. */
export function isUnlocked(save: Save, world: World, level: number): boolean {
  if (save.free || level <= 1) return true;
  const prev = world.missions.find((m) => m.level === level - 1);
  return !prev || passed(save, prev.id);
}
export const worldStars = (save: Save, w: World) => w.missions.reduce((s, m) => s + starsFor(save, m.id), 0);
export const MAX_STARS = WORLDS.reduce((s, w) => s + w.missions.length * 3, 0);
export const totalStars = (save: Save) => WORLDS.reduce((s, w) => s + worldStars(save, w), 0);
export const streak = (save: Save, now = new Date()): number => {
  const set = new Set(save.days);
  let n = 0;
  const d = new Date(now);
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
  return n;
};

export const RANKS = [
  { min: 0, name: "Apprentie du château" },
  { min: 12, name: "Exploratrice des îles" },
  { min: 40, name: "Chevalière des portails" },
  { min: 90, name: "Gardienne des étoiles" },
  { min: 150, name: "Magicienne des savoirs" },
  { min: 200, name: "Reine de Soumaya Academy" },
];
export const rankOf = (stars: number) => [...RANKS].reverse().find((r) => stars >= r.min)!;

export type Badge = { id: string; name: string; hint: string; icon: string; earned: boolean };
export function badgesOf(save: Save): Badge[] {
  const played = Object.keys(save.best).length;
  const worldsDone = (id: string, n: number) => (WORLDS.find((w) => w.id === id)?.missions.filter((m) => passed(save, m.id)).length ?? 0) >= n;
  const examPct = Object.values(save.exams).map((e) => (e.pts / e.max) * 100);
  return [
    { id: "first", name: "Premier pas", hint: "Termine ta première mission", icon: "👣", earned: played >= 1 },
    { id: "perfect", name: "Sans faute", hint: "Obtiens 100 % à une mission", icon: "💯", earned: Object.values(save.best).some((v) => v >= 100) },
    { id: "calc", name: "Maîtresse des nombres", hint: "Réussis 4 niveaux de la Tour de Cristal", icon: "🔮", earned: worldsDone("maths", 4) },
    { id: "words", name: "Reine des mots", hint: "Réussis 4 niveaux de la Bibliothèque", icon: "📖", earned: worldsDone("francais", 4) },
    { id: "explorer", name: "Exploratrice", hint: "Joue dans les 7 mondes", icon: "🧭", earned: WORLDS.every((w) => w.missions.some((m) => save.best[m.id] !== undefined)) },
    { id: "p5", name: "Pionnière P5", hint: "Réussis un niveau P5 (7 à 10)", icon: "🚀", earned: WORLDS.some((w) => w.missions.some((m) => m.level >= 7 && passed(save, m.id))) },
    { id: "streak3", name: "Trois jours de suite", hint: "Joue 3 jours d'affilée", icon: "🔥", earned: streak(save) >= 3 || save.days.length >= 7 },
    { id: "gd", name: "Grande distinction", hint: "Obtiens 80 % à un examen blanc", icon: "🏅", earned: examPct.some((p) => p >= 80) },
    { id: "pgd", name: "Plus grande distinction", hint: "Obtiens 90 % à un examen blanc", icon: "👑", earned: examPct.some((p) => p >= 90) },
    { id: "author", name: "Plume d'or", hint: "Réussis 3 niveaux de l'Atelier", icon: "🪶", earned: worldsDone("atelier", 3) },
  ];
}

// ---------- Contexte ----------
export type MissionOutcome = { previous: number; isNewBest: boolean; stars: Stars; previousStars: Stars; newBadges: Badge[] };
type Ctx = {
  save: Save;
  available: boolean;
  lastWriteOk: boolean;
  record: (missionId: string, pct: number, worldId: string, ok: number, n: number) => MissionOutcome;
  recordExam: (examId: string, pts: number, max: number, sections?: ExamResult["sections"]) => void;
  touch: (missionId: string) => void;
  noteResults: (items: { q: Question }[], verdicts: { score: number }[], worldId: string) => void;
  setFree: (v: boolean) => void;
  replace: (next: Save) => boolean;
  reset: () => void;
};
const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [available] = useState(storageAvailable);
  const [save, setSave] = useState<Save>(() => (storageAvailable() ? load() : emptySave()));
  const [lastWriteOk, setLastWriteOk] = useState(true);

  const persist = useCallback((s: Save) => {
    if (!available) return false;
    try { window.localStorage.setItem(KEY, JSON.stringify(s)); setLastWriteOk(true); return true; } catch { setLastWriteOk(false); return false; }
  }, [available]);

  const commit = useCallback((next: Save) => { setSave(next); persist(next); }, [persist]);
  const withDay = (s: Save): Save => {
    const t = today();
    return s.days.includes(t) ? s : { ...s, days: [...s.days, t].slice(-90) };
  };

  const record: Ctx["record"] = useCallback((missionId, pct, worldId, ok, n) => {
    const previous = save.best[missionId] ?? 0;
    const isNewBest = pct > previous;
    const stats = { ...save.stats, [worldId]: { ok: (save.stats[worldId]?.ok ?? 0) + ok, n: (save.stats[worldId]?.n ?? 0) + n } };
    const next = withDay({
      ...save,
      best: { ...save.best, [missionId]: Math.max(previous, Math.round(pct)) },
      plays: { ...save.plays, [missionId]: (save.plays[missionId] ?? 0) + 1 },
      stats, last: missionId, updatedAt: new Date().toISOString(),
    });
    const before = new Set(badgesOf(save).filter((b) => b.earned).map((b) => b.id));
    commit(next);
    return { previous, isNewBest, stars: starsOf(Math.max(previous, pct)), previousStars: starsOf(previous), newBadges: badgesOf(next).filter((b) => b.earned && !before.has(b.id)) };
  }, [save, commit]);

  const recordExam: Ctx["recordExam"] = useCallback((examId, pts, max, sections) => {
    const prev = save.exams[examId];
    const better = !prev || pts / max > prev.pts / prev.max;
    commit(withDay({
      ...save,
      exams: { ...save.exams, [examId]: better ? { pts, max, plays: (prev?.plays ?? 0) + 1, at: new Date().toISOString(), sections } : { ...prev, plays: prev.plays + 1 } },
      updatedAt: new Date().toISOString(),
    }));
  }, [save, commit]);

  const noteResults: Ctx["noteResults"] = useCallback((items, verdicts, worldId) => {
    setSave((prev) => {
      const review = { ...(prev.review ?? {}) };
      const t = today();
      items.forEach(({ q }, i) => {
        const v = verdicts[i];
        if (!v || q.k === "prod") return;
        const key = qKey(q);
        const cur = review[key];
        if (v.score < 1) review[key] = { q, box: 0, due: t, w: worldId };
        else if (cur) {
          const box = cur.box + 1;
          if (box >= REVIEW_DAYS.length) delete review[key];
          else review[key] = { ...cur, box, due: addDays(t, REVIEW_DAYS[box]) };
        }
      });
      const kept = Object.entries(review).sort((a, b) => a[1].due.localeCompare(b[1].due)).slice(0, MAX_REVIEW);
      const next: Save = { ...prev, review: Object.fromEntries(kept), updatedAt: new Date().toISOString() };
      persist(next);
      return next;
    });
  }, [persist]);

  const touch = useCallback((missionId: string) => { if (save.last !== missionId) commit({ ...save, last: missionId }); }, [save, commit]);
  const setFree = useCallback((v: boolean) => commit({ ...save, free: v, updatedAt: new Date().toISOString() }), [save, commit]);
  const replace = useCallback((next: Save) => { if (!persist(next)) return false; setSave(next); return true; }, [persist]);
  const reset = useCallback(() => {
    setSave(emptySave());
    if (available) { try { window.localStorage.removeItem(KEY); setLastWriteOk(true); } catch { setLastWriteOk(false); } }
  }, [available]);

  const value = useMemo(() => ({ save, available, lastWriteOk, record, recordExam, noteResults, touch, setFree, replace, reset }), [save, available, lastWriteOk, record, recordExam, noteResults, touch, setFree, replace, reset]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const c = useContext(ProgressContext);
  if (!c) throw new Error("useProgress hors du ProgressProvider");
  return c;
}
