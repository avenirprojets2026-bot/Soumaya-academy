// Sauvegarde et restauration de la progression (localStorage + export/import JSON).
export const SAVE_KEY = 'maissa-academy-v1';
export const SUBJECTS = ['francais', 'maths', 'eveil'];
export const LEVELS = 10;

const emptySubject = () => ({ unlocked: 1, stars: {}, best: {} });

export function freshState() {
  return {
    version: 2,
    created: Date.now(),
    name: 'Maissa',
    coins: 0,
    stars: 0,
    subjects: { francais: emptySubject(), maths: emptySubject(), eveil: emptySubject() },
    seen: {},          // id question -> {ok, ko}
    badges: {},        // id badge -> date
    rooms: {},         // id salle -> visites
    exams: [],         // historique des examens blancs
    stats: { answered: 0, correct: 0, missions: 0 },
    settings: { voice: true, motion: true, sound: true, music: true, voiceName: '', voiceRate: 0.92, voicePitch: 1.05 },
    mimi: { fur: 'noir', bow: 'rose', bond: 0, fed: 0, pets: 0, lastPet: 0, lastFeed: 0 },
  };
}

let state = freshState();
const listeners = new Set();

function storage() {
  try { return window.localStorage; } catch (e) { return null; }
}

export function load() {
  const ls = storage();
  let raw = null;
  try { raw = ls && ls.getItem(SAVE_KEY); } catch (e) { raw = null; }
  if (raw) {
    try { state = migrate(JSON.parse(raw)); return state; } catch (e) { /* sauvegarde corrompue : on garde une copie */
      try { ls.setItem(SAVE_KEY + '-corrompue', raw); } catch (e2) { /* ignoré */ }
    }
  }
  // Migration depuis l'ancienne version (v1) : on ne perd ni pièces ni étoiles.
  try {
    const old = ls && ls.getItem('soumaya-academy-v1');
    if (old) {
      const o = JSON.parse(old);
      state = freshState();
      state.coins = +o.coins || 0;
      state.stars = +o.stars || 0;
      state.stats.answered = +o.attempts || 0;
      state.stats.correct = +o.correct || 0;
    }
  } catch (e) { /* ignoré */ }
  return state;
}

function migrate(s) {
  const f = freshState();
  const out = { ...f, ...s };
  out.subjects = { ...f.subjects, ...(s.subjects || {}) };
  for (const k of SUBJECTS) out.subjects[k] = { ...emptySubject(), ...out.subjects[k] };
  out.settings = { ...f.settings, ...(s.settings || {}) };
  out.stats = { ...f.stats, ...(s.stats || {}) };
  out.mimi = { ...f.mimi, ...(s.mimi || {}) };
  return out;
}

export function get() { return state; }

export function save() {
  const ls = storage();
  try { ls && ls.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* quota / mode privé */ }
  listeners.forEach((fn) => fn(state));
}

export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function reset() { state = freshState(); save(); }

export function exportJSON() { return JSON.stringify(state, null, 2); }

export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !parsed.subjects) throw new Error('Fichier de sauvegarde invalide');
  state = migrate(parsed);
  save();
  return state;
}

// ---------- progression ----------
export function levelStars(subject, level) { return state.subjects[subject].stars[level] || 0; }

export function currentLevel(subject) { return Math.min(LEVELS, state.subjects[subject].unlocked); }

export function totalStars() {
  let n = 0;
  for (const s of SUBJECTS) for (const v of Object.values(state.subjects[s].stars)) n += v;
  return n;
}

export function completedLevels() {
  let n = 0;
  for (const s of SUBJECTS) n += Object.values(state.subjects[s].stars).filter((v) => v > 0).length;
  return n;
}

/** Enregistre le résultat d'une mission ; renvoie {stars, newBest, unlockedNext, finishedAll}. */
export function recordMission(subject, level, correct, total) {
  const sub = state.subjects[subject];
  const ratio = total ? correct / total : 0;
  const stars = ratio >= 1 ? 3 : ratio >= 0.8 ? 2 : ratio >= 0.6 ? 1 : 0;
  const prev = sub.stars[level] || 0;
  const gained = Math.max(0, stars - prev);
  if (stars > prev) sub.stars[level] = stars;
  state.stars = totalStars();
  state.coins += correct * 5 + (stars ? 10 * stars : 0);
  state.stats.missions += 1;
  let unlockedNext = false;
  if (stars >= 1 && level === sub.unlocked && level < LEVELS) { sub.unlocked = level + 1; unlockedNext = true; }
  const finishedAll = SUBJECTS.every((s) => (state.subjects[s].stars[LEVELS] || 0) > 0);
  save();
  return { stars, gained, newBest: stars > prev, unlockedNext, finishedAll };
}

export function recordAnswer(id, ok) {
  const e = state.seen[id] || (state.seen[id] = { ok: 0, ko: 0 });
  if (ok) e.ok++; else e.ko++;
  state.stats.answered++;
  if (ok) state.stats.correct++;
}

export function awardBadge(id) {
  if (state.badges[id]) return false;
  state.badges[id] = Date.now();
  save();
  return true;
}

export function visitRoom(id) { state.rooms[id] = (state.rooms[id] || 0) + 1; save(); }
