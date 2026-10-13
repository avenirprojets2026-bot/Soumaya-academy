import * as THREE from 'three';
import { REALMS, type RealmId } from './realms';
import type { MapEngine, Shot } from './engine';
import type { Mood } from './voice';

export type Say = (text: string, mood?: Mood) => Promise<void>;
export interface Cinema { engine: MapEngine; say: Say; name: string; live: () => boolean }

const pause = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const shotAround = (e: MapEngine, id: RealmId, side: number): Shot => e.closeShot(id, side);

/** Cinématique d'ouverture : Mimi présente les six royaumes en survolant la carte. */
export async function playIntro({ engine: e, say, name, live }: Cinema) {
  e.setMimiMode('show'); e.mimiLook('happy');
  e.cutTo(e.farShot());
  const ok = () => live();
  await Promise.all([e.flyTo(e.overviewShot(), 5.5), say(`Bonjour ${name} ! Moi, c’est Mimi, la petite étoile. Regarde… là, au-dessus de la mer, des royaumes flottent dans le ciel !`, 'wow')]);
  if (!ok()) return;
  await say('Chacun garde un trésor de savoirs. Et c’est toi, l’exploratrice, qui vas les découvrir !', 'happy');
  let side = -1;
  for (const r of REALMS) {
    if (!ok()) return;
    e.mimiLook(r.id === 6 ? 'think' : 'happy');
    await Promise.all([e.flyTo(shotAround(e, r.id, side), 3.2), say(r.tour, r.id === 6 ? 'soft' : 'happy')]);
    side = -side;
    if (!ok()) return;
    await pause(180);
  }
  if (!ok()) return;
  e.mimiLook('wow');
  await Promise.all([e.toOverview(3.2), say('Voilà ! À toi de choisir par où commencer. Touche un royaume, et je te guide !', 'wow')]);
}

/** Arrivée dans un royaume : la caméra se rapproche et Mimi commente. */
export async function arrive({ engine: e, say, name, live }: Cinema, id: RealmId) {
  const r = REALMS.find((x) => x.id === id)!;
  e.setMimiMode('follow'); e.mimiLook('happy');
  await e.walkTo(id);
  if (!live()) return;
  e.heroMood('cheer'); window.setTimeout(() => e.heroMood('idle'), 1500);
  const look = e.closeShot(id, 0);
  await Promise.all([e.flyTo(look, 1.8), say(r.arrival[0].replace('{n}', name), 'wow')]);
  if (!live()) return;
  for (const l of r.arrival.slice(1)) { if (!live()) return; await say(l.replace('{n}', name), 'happy'); }
}

export const tmpVec = () => new THREE.Vector3();
