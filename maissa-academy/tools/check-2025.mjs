// Vérifie un fichier de questions « inspirées des évaluations interdiocésaines 2025 ».
// Usage : node tools/check-2025.mjs content-src/i2025/<fichier>.json
import fs from 'node:fs';
const f = process.argv[2]; const d = JSON.parse(fs.readFileSync(f, 'utf8'));
const DOM = { francais: ['conjugaison', 'ecoute', 'expression', 'grammaire', 'lecture', 'orthographe', 'vocabulaire'], maths: ['fractions', 'geometrie', 'grandeurs', 'logique', 'numeration', 'operations', 'problemes', 'statistique'], eveil: ['citoyennete', 'geographie', 'histoire', 'sciences', 'religion', 'numerique', 'artistique', 'economie'] };
const DOCS = ['doc01', 'doc02', 'doc03', 'doc04', 'doc05', 'doc06', 'doc07', 'doc08', 'doc09', 'doc10', 'doc11', 'fmttn', 'religion'];
const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const err = []; const ids = new Set();
const pids = new Set((d.passages || []).map((p) => p.id));
for (const p of d.passages || []) { if (!/^i25-/.test(p.id) || !p.title || !p.text || !DOM[p.subject] || !DOM[p.subject].includes(p.domain) || !(p.level >= 1 && p.level <= 10) || !DOCS.includes(p.exam2025)) err.push('passage ' + p.id); }
for (const q of d.questions || []) {
  const e = (m) => err.push(`${q.id}: ${m}`);
  if (!/^i25-/.test(q.id || '')) e('id doit commencer par i25-'); if (ids.has(q.id)) e('id en double'); ids.add(q.id);
  if (!DOM[q.subject]) e('subject'); else if (!DOM[q.subject].includes(q.domain)) e('domain ' + q.domain);
  if (!(Number.isInteger(q.level) && q.level >= 1 && q.level <= 10)) e('level');
  if (!q.prompt || !q.explanation) e('prompt/explanation');
  if (!DOCS.includes(q.exam2025)) e('exam2025');
  if (q.source !== 'inspire_2025') e('source');
  if (q.passage && !pids.has(q.passage)) e('passage inconnu');
  if (q.type === 'qcm') {
    if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 5) e('choices');
    else if (new Set(q.choices.map(norm)).size !== q.choices.length) e('choix en double');
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.choices || []).length) e('answer');
  } else if (q.type === 'saisie') { if (!Array.isArray(q.accepted) || !q.accepted.length) e('accepted'); }
  else e('type');
}
for (const t of d.openTasks || []) if (!/^i25-/.test(t.id) || !t.prompt || !Array.isArray(t.rubric) || !DOCS.includes(t.exam2025) || !DOM[t.subject]) err.push('openTask ' + t.id);
const by = {}; for (const q of d.questions || []) by[q.exam2025] = (by[q.exam2025] || 0) + 1;
console.log(err.length ? 'ERREURS :\n' + err.join('\n') : 'OK', '| questions', (d.questions || []).length, '| textes', (d.passages || []).length, '| productions', (d.openTasks || []).length, '|', JSON.stringify(by));
process.exit(err.length ? 1 : 0);
