// Suggestions de jeu : « Continuer » et défi du jour.
import { ALL_MISSIONS, WORLDS, findMission, nextMission, worldOfMission, type World } from "@/data/catalog";
import { isUnlocked, passed, type Save } from "@/lib/progress";
import type { Mission } from "@/data/kit";

export type Pick = { mission: Mission; world: World };

const toPick = (m: Mission | undefined): Pick | undefined => {
  if (!m) return undefined;
  const world = worldOfMission(m.id);
  return world ? { mission: m, world } : undefined;
};

/** Première mission ouverte et non réussie d'un monde (ou la dernière si tout est réussi). */
export function openMission(save: Save, w: World): Mission {
  return w.missions.find((m) => isUnlocked(save, w, m.level) && !passed(save, m.id)) ?? w.missions[w.missions.length - 1];
}

export function suggestContinue(save: Save): Pick {
  if (save.last) {
    const last = findMission(save.last);
    const w = last ? worldOfMission(last.id) : undefined;
    if (last && w) {
      if (!passed(save, last.id)) return toPick(last)!;
      const nx = nextMission(last.id);
      if (nx && isUnlocked(save, w, nx.level)) return toPick(nx)!;
    }
  }
  const w = WORLDS.find((x) => !x.missions.some((m) => save.best[m.id] !== undefined)) ?? WORLDS[1];
  return toPick(openMission(save, w))!;
}

/** Défi du jour : un monde différent chaque jour, au premier niveau non maîtrisé (< 80 %). */
export function dailyChallenge(save: Save, now = new Date()): Pick {
  const day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
  for (let k = 0; k < WORLDS.length; k++) {
    const w = WORLDS[(day + k) % WORLDS.length];
    const m = w.missions.find((x) => isUnlocked(save, w, x.level) && (save.best[x.id] ?? 0) < 80);
    if (m) return toPick(m)!;
  }
  return toPick(ALL_MISSIONS[0])!;
}
