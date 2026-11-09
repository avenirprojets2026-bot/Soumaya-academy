// Moteur pédagogique : sélection des questions, mélange, vérification des réponses.
import * as S from './save.js';

let DB = { questions: [], passages: [], openTasks: [], explorations: [], stories: [], exams: [] };
let byId = new Map();
let passageById = new Map();

export function init(data) {
  DB = { questions: [], passages: [], openTasks: [], explorations: [], stories: [], exams: [], ...data };
  byId = new Map(DB.questions.map((q) => [q.id, q]));
  passageById = new Map(DB.passages.map((p) => [p.id, p]));
}
export const db = () => DB;
export const passage = (id) => passageById.get(id);

/** PRNG déterministe optionnel (tests). */
let rnd = Math.random;
export function seed(n) {
  let s = n >>> 0;
  rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
export function shuffle(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

export const norm = (s) => String(s == null ? '' : s).trim().toLocaleLowerCase('fr')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'")
  .replace(/\s+/g, ' ').replace(/(\d)\s+(?=\d{3}\b)/g, '$1').replace(/(\d)\.(\d)/g, '$1,$2')
  .replace(/[.!?]+$/, '').trim();

export function checkAnswer(q, given) {
  if (q.type === 'saisie') {
    const g = norm(given);
    if (!g) return false;
    return (q.accepted || []).some((a) => norm(a) === g || norm(a).replace(/\s?(cm|m|g|kg|l|ml|cl|km|min|minutes?|€|euros?)$/, '') === g);
  }
  return given === q.answer;
}

/** Prépare une question pour l'affichage (choix mélangés, index de la bonne réponse recalculé). */
export function prepare(q) {
  if (q.type === 'saisie') return { ...q };
  const idx = q.choices.map((c, i) => i);
  const order = shuffle(idx);
  return { ...q, choices: order.map((i) => q.choices[i]), answer: order.indexOf(q.answer), _order: order };
}

const MISSION_SIZE = 5;

function pool(subject, level, filter) {
  return DB.questions.filter((q) => q.subject === subject && q.level === level && !q.flag && q.domain !== 'religion' && (!filter || filter(q)));
}

/** Construit une mission de 5 questions pour (matière, niveau) avec filtre de domaines facultatif. */
export function buildMission(subject, level, opts = {}) {
  const { domains, size = MISSION_SIZE } = opts;
  const filter = domains ? (q) => domains.includes(q.domain) : null;
  const st = S.get().seen;
  const score = (q) => (st[q.id] ? st[q.id].ok * 2 - st[q.id].ko : -1) + rnd() * 0.9; // nouvelles & ratées d'abord
  let cands = [];
  for (const d of [0, -1, 1, -2, 2, -3, 3]) {
    const l = level + d;
    if (l < 1 || l > S.LEVELS) continue;
    // questions autonomes uniquement (les questions liées à un texte se jouent avec leur texte)
    const p = pool(subject, l, filter).filter((q) => !q.passage);
    cands = cands.concat(p.sort((a, b) => score(a) - score(b)));
    if (cands.length >= size * 2) break;
  }
  // variété de domaines : on pioche en alternant
  const picked = [];
  const used = new Set();
  const byDomain = new Map();
  for (const q of cands) { if (!byDomain.has(q.domain)) byDomain.set(q.domain, []); byDomain.get(q.domain).push(q); }
  const doms = shuffle([...byDomain.keys()]);
  while (picked.length < size && doms.length) {
    for (const d of doms) {
      const arr = byDomain.get(d);
      const q = arr && arr.shift();
      if (q && !used.has(q.id)) { picked.push(q); used.add(q.id); }
      if (picked.length >= size) break;
    }
    if ([...byDomain.values()].every((a) => !a.length)) break;
  }
  return { kind: 'quiz', subject, level, questions: shuffle(picked).map(prepare) };
}

/** Mission « lecture / écoute » : un texte et ses questions. */
export function buildPassageMission(level, opts = {}) {
  const { domain, subject = 'francais' } = opts;
  const groups = new Map();
  for (const q of DB.questions) {
    if (!q.passage || q.flag || q.exam2025) continue;
    const p = passageById.get(q.passage);
    if (!p || (domain && p.domain !== domain) || (subject && p.subject && p.subject !== subject)) continue;
    if (!groups.has(p.id)) groups.set(p.id, { p, qs: [] });
    groups.get(p.id).qs.push(q);
  }
  const list = [...groups.values()].filter((g) => g.qs.length >= 2)
    .sort((a, b) => Math.abs(a.p.level - level) - Math.abs(b.p.level - level) + (rnd() - 0.5));
  if (!list.length) return null;
  const st = S.get().seen;
  const fresh = list.filter((g) => !g.qs.every((q) => st[q.id]));
  const g = (fresh.length ? fresh : list)[0];
  return { kind: 'quiz', subject, level, passage: g.p, questions: g.qs.slice(0, 6).map(prepare) };
}

/** Examen blanc : 10 questions mixtes. */
export function buildExam(sessionId, levelBand) {
  const subj = { nombres: ['maths'], grandeurs: ['maths'], francais: ['francais'], mixte: S.SUBJECTS }[sessionId] || S.SUBJECTS;
  const lo = levelBand === 0 ? 1 : levelBand === 1 ? 4 : 7;
  const hi = lo + 3;
  let cands = DB.questions.filter((q) => subj.includes(q.subject) && q.level >= lo && q.level <= hi && !q.flag && !q.passage && q.domain !== 'religion');
  if (sessionId === 'grandeurs') cands = cands.filter((q) => ['grandeurs', 'geometrie', 'problemes'].includes(q.domain));
  if (sessionId === 'nombres') cands = cands.filter((q) => ['numeration', 'operations', 'fractions', 'problemes'].includes(q.domain));
  if (cands.length < 10) cands = DB.questions.filter((q) => subj.includes(q.subject) && !q.flag && !q.passage && q.domain !== 'religion');
  const picked = [];
  if (sessionId === 'mixte') {
    for (const s of S.SUBJECTS) picked.push(...shuffle(cands.filter((q) => q.subject === s)).slice(0, s === 'maths' ? 4 : 3));
  }
  const rest = shuffle(cands.filter((q) => !picked.includes(q)));
  while (picked.length < 10 && rest.length) picked.push(rest.shift());
  return { kind: 'exam', subject: sessionId, level: levelBand, questions: shuffle(picked).map(prepare) };
}

export function coverage() {
  const m = {};
  for (const q of DB.questions) {
    const k = `${q.subject}:${q.level}`;
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}
