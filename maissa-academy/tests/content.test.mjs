// Tests de contenu et du moteur pédagogique (sans navigateur).
import fs from 'node:fs';
import path from 'node:path';
globalThis.window = globalThis; globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; } };
const root = path.resolve(import.meta.dirname, '..');
const C = await import(path.join(root, 'src/js/content.js'));
const S = await import(path.join(root, 'src/js/save.js'));
const data = JSON.parse(fs.readFileSync(path.join(root, 'content/content.json'), 'utf8'));
C.init(data); S.load();
const res = []; const ok = (name, cond, info = '') => res.push({ name, ok: !!cond, info });
const Q = data.questions;

ok('ids uniques', new Set(Q.map((q) => q.id)).size === Q.length, Q.length + ' questions');
ok('niveaux 1–10 valides', Q.every((q) => q.level >= 1 && q.level <= 10));
ok('QCM : réponse dans les choix', Q.filter((q) => q.type === 'qcm').every((q) => Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length));
ok('QCM : choix tous distincts', Q.filter((q) => q.type === 'qcm').every((q) => new Set(q.choices.map((c) => c.trim().toLowerCase())).size === q.choices.length));
ok('QCM : 2 à 5 choix', Q.filter((q) => q.type === 'qcm').every((q) => q.choices.length >= 2 && q.choices.length <= 5));
ok('saisie : réponses acceptées', Q.filter((q) => q.type === 'saisie').every((q) => q.accepted && q.accepted.length));
ok('explication présente partout', Q.every((q) => q.explanation && q.explanation.length > 3));
ok('passages référencés existent', Q.filter((q) => q.passage).every((q) => C.passage(q.passage)));
ok('aucune question flaggée dans le jeu', Q.every((q) => !q.flag));
// vérification arithmétique indépendante des questions générées
let bad = 0, checked = 0;
for (const q of Q) {
  if (!q.calc) continue;
  const v = Function('Math', 'return ' + q.calc)(Math); checked++;
  const ans = (q.type === 'saisie' ? q.accepted[0] : q.choices[q.answer]).replace(/[^0-9,.\-]/g, '').replace(',', '.');
  if (Math.abs(parseFloat(ans) - v) > 1e-9) { bad++; }
}
ok('maths générées : réponse = calcul indépendant', bad === 0, `${checked} vérifiées, ${bad} écarts`);
// moteur
let shuffleOk = true;
for (const q of Q.filter((x) => x.type === 'qcm').slice(0, 400)) { const p = C.prepare(q); if (p.choices[p.answer] !== q.choices[q.answer]) shuffleOk = false; }
ok('mélange des choix conserve la bonne réponse', shuffleOk);
const q0 = Q.find((q) => q.type === 'saisie' && q.accepted[0]);
ok('checkAnswer saisie (formats FR)', q0 && C.checkAnswer(q0, q0.accepted[0]) && !C.checkAnswer(q0, '___'));
ok('checkAnswer ignore casse/accents/espaces', C.checkAnswer({ type: 'saisie', accepted: ['Écrire'] }, ' ecrire ') && C.checkAnswer({ type: 'saisie', accepted: ['1 250'] }, '1250'));
// couverture par matière × niveau : au moins 5 questions autonomes pour pouvoir jouer chaque mission
const cov = {}; let gaps = [];
for (const s of S.SUBJECTS) for (let l = 1; l <= 10; l++) { const n = Q.filter((q) => q.subject === s && q.level === l && !q.passage).length; cov[`${s}${l}`] = n; if (n < 5) gaps.push(`${s}/N${l}=${n}`); }
ok('couverture : ≥ 5 questions par matière et niveau', gaps.length === 0, gaps.join(' '));
ok('couverture : ≥ 15 questions par matière et niveau (variété)', Object.values(cov).every((n) => n >= 15), Object.entries(cov).filter(([, n]) => n < 15).map(([k, n]) => `${k}=${n}`).join(' '));
// missions réellement constructibles
let missionFail = [];
for (const s of S.SUBJECTS) for (let l = 1; l <= 10; l++) { const m = C.buildMission(s, l, {}); if (m.questions.length < 5) missionFail.push(`${s}${l}:${m.questions.length}`); }
ok('mission de 5 questions constructible partout', missionFail.length === 0, missionFail.join(' '));
const pm = [1, 3, 5, 8].map((l) => C.buildPassageMission(l, { domain: 'lecture' }));
ok('missions de lecture constructibles', pm.every((m) => m && m.passage && m.questions.length >= 2));
const em = ['nombres', 'grandeurs', 'francais', 'mixte'].every((id) => [0, 1, 2].every((b) => C.buildExam(id, b).questions.length === 10));
ok('examens blancs : 10 questions pour 4 sessions × 3 niveaux', em);
// progression
S.reset();
const r1 = S.recordMission('maths', 1, 5, 5);
ok('progression : 5/5 = 3 étoiles et niveau 2 débloqué', r1.stars === 3 && S.get().subjects.maths.unlocked === 2);
const r2 = S.recordMission('maths', 2, 2, 5);
ok('progression : 2/5 = 0 étoile, pas de déblocage', r2.stars === 0 && S.get().subjects.maths.unlocked === 2);
for (let l = 2; l <= 10; l++) S.recordMission('maths', l, 4, 5);
ok('progression : niveau 10 atteignable et plafonné', S.get().subjects.maths.unlocked === 10 && (S.get().subjects.maths.stars[10] || 0) > 0);
const exp = S.exportJSON(); S.reset(); S.importJSON(exp);
ok('export / import JSON restitue la progression', S.get().subjects.maths.unlocked === 10);

const fails = res.filter((r) => !r.ok);
const lines = res.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info ? '  — ' + r.info : ''}`);
// préparation du texte pour la voix de synthèse
const V = await import('../src/js/voice.js');
ok('voix : symboles lus en toutes lettres', V.prepare('3 × 4 = 12 € 🐱 50 %') === '3 fois 4 égale 12 euros 50 pour cent', V.prepare('3 × 4 = 12 € 🐱 50 %'));
ok('voix : guillemets et unités', V.prepare('« Il mesure 5 cm » et 2 kg') === 'Il mesure 5 centimètres et 2 kilos', V.prepare('« Il mesure 5 cm » et 2 kg'));
fs.mkdirSync(new URL('../reports', import.meta.url).pathname, { recursive: true });
fs.writeFileSync(new URL('../reports/content-last.txt', import.meta.url).pathname, lines.join('\n'));
console.log(lines.join('\n')); console.log(`\n${res.length - fails.length}/${res.length} OK`);
process.exit(fails.length ? 1 : 0);
