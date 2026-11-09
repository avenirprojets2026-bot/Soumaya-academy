// Fusionne les sources de contenu en content/content.json (dédoublonnage, contrôle de schéma).
import fs from 'node:fs';
import path from 'node:path';
const C = path.resolve(import.meta.dirname, '../content-src'); // sources partagées
const OUT = path.resolve(import.meta.dirname, '../content'); // contenu embarqué dans l'application
const rd = (f) => { try { return JSON.parse(fs.readFileSync(path.join(C, f), 'utf8')); } catch (e) { return null; } };
const OV = { unflag: ['h0222', 'h0223', 'h0228', 'h0592'], patch: {
  h0223: { prompt: 'Pendant la mission Artemis II, les astronautes ont-ils marché sur la Lune ?' },
  h0592: { prompt: 'Quelle période de l’histoire vient juste avant le Moyen Âge ?', choices: ['L’Antiquité', 'L’Époque contemporaine', 'Les Temps modernes'], answer: 0 },
} };
// Mimi est un petit chat (cohérence avec la bible du personnage)
const MIMI = [[/la petite chouette aux lunettes étoilées/g, 'le petit chat aux lunettes étoilées'], [/la chouette exploratrice/g, 'le chat explorateur'], [/La chouette éclate/g, 'Le chat éclate']];
const fixMimi = (t) => (typeof t === 'string' ? MIMI.reduce((a, [r, b]) => a.replace(r, b), t) : t);
const srcs = [['harvest.json', 'v162'], ['generated-maths.json', 'gen'], ['authored/authored-francais.json', 'auth'], ['authored/authored-eveil.json', 'auth']];
// exercices inspirés des évaluations interdiocésaines de juin 2025
for (const f of (fs.existsSync(path.join(C, 'i2025')) ? fs.readdirSync(path.join(C, 'i2025')) : []).filter((x) => x.endsWith('.json')).sort()) srcs.push(['i2025/' + f, 'i25']);
const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const out = { questions: [], passages: [], openTasks: [], explorations: [], stories: [], exams: [] };
const seen = new Set(); const report = { dropped: [], used: {} };
for (const [f, tag] of srcs) {
  const d = rd(f); if (!d) { report.used[f] = 'absent'; continue; }
  report.used[f] = { questions: (d.questions || []).length, passages: (d.passages || []).length };
  for (const k of ['passages', 'openTasks', 'explorations', 'stories']) for (const x of d[k] || []) out[k].push(JSON.parse(JSON.stringify(x), (key, v) => fixMimi(v)));
  for (const q of d.questions || []) {
    if (OV.unflag.includes(q.id)) delete q.flag;
    if (OV.patch[q.id]) Object.assign(q, OV.patch[q.id]);
    const why = validate(q);
    if (why) { report.dropped.push({ id: q.id, f, why }); continue; }
    const key = norm(q.prompt) + '|' + (q.passage || '') + '|' + (q.type === 'qcm' ? [...q.choices].map(norm).sort().join(',') : '');
    if (seen.has(key)) { report.dropped.push({ id: q.id, f, why: 'doublon' }); continue; }
    seen.add(key); out.questions.push(q);
  }
}
function validate(q) {
  if (!q || !q.id || !q.prompt || !q.explanation) return 'champ manquant';
  if (!['francais', 'maths', 'eveil'].includes(q.subject)) return 'matière';
  if (!(q.level >= 1 && q.level <= 10)) return 'niveau';
  if (q.flag) return 'signalée à vérifier';
  if (q.type === 'saisie') return Array.isArray(q.accepted) && q.accepted.length ? null : 'accepted';
  if (q.type !== 'qcm') return 'type';
  if (!Array.isArray(q.choices) || q.choices.length < 2 || new Set(q.choices.map(norm)).size !== q.choices.length) return 'choix';
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length) return 'answer';
  return null;
}
// ids de passages uniques et références valides
const pids = new Set(out.passages.map((p) => p.id));
out.questions = out.questions.filter((q) => { if (q.passage && !pids.has(q.passage)) { report.dropped.push({ id: q.id, why: 'passage absent' }); return false; } return true; });
// explorations : on garde les 12 explorations, les 2 mondes et les 12 défis ; les « actualités » datées sont écartées
const qById = new Map(out.questions.map((q) => [q.id, q]));
out.explorations = out.explorations.filter((e) => e.kind !== 'actualite' && !String(e.id).startsWith('actu-')).map((e) => {
  const ids = e.questions || (e.levels ? e.levels.flatMap((l) => l.questions) : []);
  const qs = ids.map((i) => qById.get(i)).filter(Boolean);
  const stages = e.levels ? e.levels.map((l) => ({ name: l.name, qs: l.questions.map((i) => qById.get(i)).filter(Boolean) })).filter((l) => l.qs.length) : null;
  return { ...e, questions: undefined, qids: ids, qs: stages ? undefined : qs, stages };
}).filter((e) => (e.qs && e.qs.length) || (e.stages && e.stages.length));
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'content.json'), JSON.stringify(out));
fs.writeFileSync(path.join(OUT, 'merge-report.json'), JSON.stringify(report, null, 1));
const cov = {};
for (const q of out.questions) { const k = q.subject; cov[k] = cov[k] || Array(11).fill(0); cov[k][q.level]++; }
console.log('questions', out.questions.length, 'passages', out.passages.length, 'ouvertes', out.openTasks.length, 'explorations', out.explorations.length, 'écartées', report.dropped.length);
for (const [s, a] of Object.entries(cov)) console.log(s.padEnd(8), a.slice(1).join(' '));
