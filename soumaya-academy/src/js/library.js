// Bibliothèque enchantée : la plume des mots enchantés (corriger les fautes), l'escalier du temps des verbes,
// la lecture sur le canapé (karaoké : chaque mot s'allume pendant la lecture).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import * as Papa from './papa.js';
import * as C from './content.js';

const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const star = () => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + 1; b.coins += 2; S.save(); };
function burst(host) { for (let k = 0; k < 12; k++) { const s = h('span', { class: 'abq-spark', 'aria-hidden': 'true' }, k % 3 ? '✨' : '🌟'); s.style.cssText = `left:${50 + (Math.random() - 0.5) * 60}%;top:${40 + (Math.random() - 0.5) * 30}%;--dx:${(Math.random() - 0.5) * 220}px;--dy:${-60 - Math.random() * 120}px`; host.append(s); setTimeout(() => s.remove(), 1500); } }

// ---------- 1. la plume des mots enchantés ----------
// [mot affiché, mot correct, autres choix, explication] pour les mots fautifs ; chaîne simple pour les mots justes
const PHRASES = [
  ['Les', ['petite', 'petites', ['petits'], '« petites » s’accorde avec « filles » : féminin pluriel.'], ['fille', 'filles', ['fils'], 'Après « les », le nom est au pluriel : filles.'], ['joue', 'jouent', ['joues'], 'Le sujet « les petites filles » est au pluriel : ils jouent → elles jouent.'], 'dans', 'le', 'jardin.'],
  ['Mon', 'frère', 'et', 'ma', 'sœur', ['mange', 'mangent', ['manges'], 'Deux sujets (mon frère et ma sœur) = ils : ils mangent.'], 'des', 'pommes.'],
  ['Il', 'a', 'mis', 'ses', ['chaussure', 'chaussures', ['chaussur'], 'Après « ses », le nom est au pluriel.'], ['rouge', 'rouges', ['rougent'], 'L’adjectif s’accorde avec « chaussures » : pluriel.']],
  ['Nous', 'allons', ['a', 'à', ['as'], '« à » indique le lieu ; on ne peut pas dire « avait » à sa place.'], 'la', 'piscine.'],
  ['Le', 'chat', 'et', 'le', 'chien', ['son', 'sont', ['sons'], '« sont » est le verbe être (ils sont) ; on peut dire « étaient ».'], 'dans', 'le', 'salon.'],
  ['Elle', 'a', 'les', 'yeux', ['bleu', 'bleus', ['bleues'], '« yeux » est masculin pluriel : bleus.'], 'et', 'les', 'cheveux', ['brun', 'bruns', ['brunes'], '« cheveux » est masculin pluriel : bruns.']],
  ['Les', 'oiseaux', ['chante', 'chantent', ['chantes'], 'Les oiseaux = ils : ils chantent.'], 'dans', 'les', ['grand', 'grands', ['grandes'], '« arbres » est masculin pluriel : grands.'], 'arbres.'],
  ['Mamie', 'a', 'préparé', 'une', 'tarte', ['au', 'aux', ['o'], 'Avec un nom pluriel, on écrit « aux ».'], ['pomme', 'pommes', ['pomes'], 'Une tarte aux pommes : il y a plusieurs pommes.']],
  ['Demain,', 'nous', 'irons', ['a', 'à', ['as'], '« à » indique le lieu : on ne peut pas dire « avait ».'], 'l’école.'],
  ['Le', 'soleil', 'brille', 'et', 'les', 'fleurs', ['s’ouvre', 's’ouvrent', ['s’ouvres'], 'Les fleurs = elles : elles s’ouvrent.'], 'lentement.'],
  ['Ma', 'cousine', 'est', ['arrivé', 'arrivée', ['arriver'], 'Avec « être », le participe s’accorde avec le sujet : ma cousine est arrivée.'], 'hier', 'soir.'],
  ['Les', 'élèves', ['écoute', 'écoutent', ['écoutes'], 'Les élèves = ils : ils écoutent.'], 'leur', 'institutrice.'],
  ['Il', 'y', 'a', 'trois', ['chat', 'chats', ['chates'], 'Trois chats : pluriel.'], ['noir', 'noirs', ['noires'], '« chats » est masculin pluriel : noirs.'], 'sur', 'le', 'mur.'],
  ['Tu', ['est', 'es', ['et'], 'Avec « tu », le verbe être s’écrit « es » : tu es.'], 'mon', 'meilleur', 'ami.'],
  ['Nos', 'voisins', ['on', 'ont', ['onts'], '« ont » est le verbe avoir (ils ont) ; on peut dire « avaient ».'], 'un', 'grand', 'jardin.'],
  ['Papa', ['et', 'est', ['ai'], '« est » est le verbe être : on peut dire « était ».'], 'content', 'de', 'son', 'travail.'],
];

export function plume() {
  const list = shuffle(PHRASES).slice(0, 6); let i = 0, ok = 0, tries = 0;
  const box = h('div', { class: 'lb-box' }), say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' }), sc = h('span', { class: 'be-score' });
  const talk = (s, v = false) => { say.textContent = s; if (v) Voice.speak(s); };
  const next = h('button', { class: 'btn primary', type: 'button', hidden: true, 'data-testid': 'lb-next', onclick: () => { i++; ask(); } }, 'Phrase suivante →');
  function ask() {
    next.hidden = true; box.classList.remove('done');
    if (i >= list.length) { box.replaceChildren(h('p', { class: 'prompt' }, `Bravo ! ${ok} phrase${ok > 1 ? 's' : ''} réparée${ok > 1 ? 's' : ''} du premier coup sur ${list.length}.`)); talk('Bravo ! Tu as réparé toutes les phrases de la plume enchantée.', true); sc.textContent = ''; Sfx.win(); burst(box); box.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: plume }, '↻ D’autres phrases'))); return; }
    const toks = list[i]; tries = 0; let left = toks.filter((t) => Array.isArray(t)).length;
    sc.textContent = `${i + 1}/${list.length} · ${left} faute${left > 1 ? 's' : ''} à trouver`;
    const line = h('p', { class: 'lb-sentence' });
    const pick = h('div', { class: 'lb-pick' });
    toks.forEach((t) => {
      const bad = Array.isArray(t), w = h('button', { class: 'lb-word', type: 'button', 'data-testid': bad ? 'lb-bad' : 'lb-good' }, bad ? t[0] : t);
      w.onclick = () => {
        if (w.classList.contains('fixed')) return;
        pick.replaceChildren();
        if (!bad) { tries++; w.classList.add('nope'); setTimeout(() => w.classList.remove('nope'), 600); Sfx.tap(); talk(`« ${t} » est bien écrit. Cherche encore !`); return; }
        talk(`Comment écrire « ${t[0]} » ?`);
        shuffle([t[0], t[1], ...t[2]]).forEach((o) => pick.append(h('button', { class: 'choice', type: 'button', 'data-testid': 'lb-opt', onclick: () => {
          pick.replaceChildren();
          if (o === t[1]) {
            w.textContent = t[1]; w.classList.add('fixed'); Sfx.coin(); left--; talk('Bien vu ! ' + t[3]);
            sc.textContent = `${i + 1}/${list.length} · ${left} faute${left > 1 ? 's' : ''} à trouver`;
            if (!left) { box.classList.add('done'); if (tries === 0) { ok++; star(); } Sfx.win(); burst(box); talk(`La phrase s’illumine ! ${tries === 0 ? '+1 étoile 🌟' : ''}`); Voice.speak(line.textContent); next.hidden = false; }
          } else { tries++; Sfx.tap(); talk('Pas encore… ' + t[3]); }
        } }, o)));
      };
      line.append(w, ' ');
    });
    box.replaceChildren(h('p', { class: 'muted' }, 'La plume a laissé des fautes ! Touche les mots mal écrits, puis choisis la bonne orthographe.'), line, pick);
    talk('Trouve les fautes dans cette phrase.');
  }
  UI.openDialog(h('div', { class: 'panel lb-panel' }, UI.closeButton(), h('h2', null, '🪶 La plume des mots enchantés'), box, say, h('div', { class: 'actions wrap' }, next, sc)), { label: 'Plume enchantée' });
  ask();
}

// ---------- 2. l'escalier du temps des verbes ----------
const SUBJ = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
const AV = ['ai', 'as', 'a', 'avons', 'avez', 'ont'];
const ET = ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'];
const V = {
  jouer: { c: 'au ballon', pr: ['joue', 'joues', 'joue', 'jouons', 'jouez', 'jouent'], im: ['jouais', 'jouais', 'jouait', 'jouions', 'jouiez', 'jouaient'], pp: 'joué', fu: ['jouerai', 'joueras', 'jouera', 'jouerons', 'jouerez', 'joueront'] },
  manger: { c: 'une pomme', pr: ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent'], im: ['mangeais', 'mangeais', 'mangeait', 'mangions', 'mangiez', 'mangeaient'], pp: 'mangé', fu: ['mangerai', 'mangeras', 'mangera', 'mangerons', 'mangerez', 'mangeront'] },
  finir: { c: 'le puzzle', pr: ['finis', 'finis', 'finit', 'finissons', 'finissez', 'finissent'], im: ['finissais', 'finissais', 'finissait', 'finissions', 'finissiez', 'finissaient'], pp: 'fini', fu: ['finirai', 'finiras', 'finira', 'finirons', 'finirez', 'finiront'] },
  être: { c: 'à la maison', pr: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], im: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'], pp: 'été', fu: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'] },
  avoir: { c: 'un chat', pr: ['ai', 'as', 'a', 'avons', 'avez', 'ont'], im: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'], pp: 'eu', fu: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'] },
  aller: { c: 'à la mer', pr: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], im: ['allais', 'allais', 'allait', 'allions', 'alliez', 'allaient'], pp: 'allé', etre: true, fu: ['irai', 'iras', 'ira', 'irons', 'irez', 'iront'] },
  faire: { c: 'un gâteau', pr: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'], im: ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient'], pp: 'fait', fu: ['ferai', 'feras', 'fera', 'ferons', 'ferez', 'feront'] },
  prendre: { c: 'le train', pr: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'], im: ['prenais', 'prenais', 'prenait', 'prenions', 'preniez', 'prenaient'], pp: 'pris', fu: ['prendrai', 'prendras', 'prendra', 'prendrons', 'prendrez', 'prendront'] },
};
const TENSES = { pr: ['Aujourd’hui', 'présent', 1], im: ['Hier', 'imparfait', 0], pc: ['Hier', 'passé composé', 0], fu: ['Demain', 'futur simple', 2] };
export function form(v, t, p) {
  const d = V[v];
  if (t === 'pc') { if (d.etre) return `${ET[p]} ${d.pp}${p >= 3 ? 's' : ''}`; return `${AV[p]} ${d.pp}`; }
  return d[t][p];
}
export const withSubj = (p, f) => (p === 0 && /^[aeéiouhâêè]/i.test(f) ? `j’${f}` : `${SUBJ[p]} ${f}`);
const au = (t) => (t === 'imparfait' ? 'à l’imparfait' : 'au ' + t);
const persons = (v, t) => (t === 'pc' && V[v].etre ? [2, 3, 5] : [0, 1, 2, 3, 4, 5]);

export function escalier() {
  const box = h('div', { class: 'lb-box' }), say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' }), sc = h('span', { class: 'be-score' });
  const talk = (s, v = false) => { say.textContent = s; if (v) Voice.speak(s); };
  const stairs = h('div', { class: 'lb-stairs' });
  const steps = [['Hier', '⬅️ passé', 0], ['Aujourd’hui', '⏺ présent', 1], ['Demain', '➡️ futur', 2]].map(([n, d, k]) => { const b = h('button', { class: 'lb-step s' + k, type: 'button', 'data-step': n }, h('strong', null, n), h('small', null, d), h('div', { class: 'lb-slot' })); stairs.append(b); return b; });
  let mode = 'marche', i = 0, ok = 0, list = [];
  const modes = [['marche', '🪜 Sur quelle marche ?'], ['conj', '✏️ Conjugue le verbe']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'lb-' + k, onclick: () => start(k) }, l));
  function start(k) {
    mode = k; i = 0; ok = 0; modes.forEach((b) => b.classList.toggle('primary', b.dataset.testid === 'lb-' + k));
    list = Array.from({ length: 8 }, () => { const v = shuffle(Object.keys(V))[0], t = shuffle(Object.keys(TENSES))[0], p = shuffle(persons(v, t))[0]; return { v, t, p }; });
    ask();
  }
  function ask() {
    steps.forEach((s) => { s.classList.remove('on', 'ko'); s.querySelector('.lb-slot').replaceChildren(); s.onclick = null; });
    if (i >= list.length) { box.replaceChildren(h('p', { class: 'prompt' }, `${ok} / ${list.length} ! ${ok >= 7 ? 'Tu maîtrises l’escalier du temps !' : 'Bien joué !'}`)); talk(`${ok} sur ${list.length} !`, true); if (ok >= 7) { Sfx.win(); burst(box); } sc.textContent = ''; box.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => start(mode) }, '↻ Rejouer'))); return; }
    const { v, t, p } = list[i], f = withSubj(p, form(v, t, p)), [when, tname, k] = TENSES[t];
    sc.textContent = `${i + 1}/${list.length}`;
    if (mode === 'marche') {
      const card = h('div', { class: 'lb-card' }, `${f[0].toUpperCase()}${f.slice(1)} ${V[v].c}.`);
      box.replaceChildren(h('p', { class: 'prompt' }, 'Sur quelle marche du temps va cette phrase ?'), card);
      talk(`${f} ${V[v].c}. Hier, aujourd’hui ou demain ?`, true);
      let lock = false;
      steps.forEach((s, j) => { s.onclick = () => {
        if (lock) return; lock = true; const good = j === k;
        steps[k].classList.add('on'); steps[k].querySelector('.lb-slot').append(card); if (!good) s.classList.add('ko');
        if (good) { ok++; star(); Sfx.win(); burst(box); talk(`Bravo ! « ${f} » est ${au(tname)} : c’est ${when.toLowerCase()}.`); } else { Sfx.tap(); talk(`Non : « ${f} » est ${au(tname)}, donc ${when.toLowerCase()}.`); }
        i++; setTimeout(ask, 2600);
      }; });
    } else {
      const right = form(v, t, p), wrongs = shuffle(Object.keys(TENSES).filter((x) => x !== t && !(t === 'pc' && x === 'im') && !(t === 'im' && x === 'pc')).map((x) => form(v, x, p)).concat(t === 'pr' ? [] : [form(v, 'pr', p)])).filter((x) => x !== right);
      const opts = shuffle([...new Set([right, ...wrongs])].slice(0, 3));
      const subj = SUBJ[p] + ' ';
      steps[k].classList.add('on');
      box.replaceChildren(h('p', { class: 'prompt' }, `${when}, ${subj}… (${v}) ${V[v].c}.`), h('p', { class: 'muted' }, `Temps : ${tname}`), h('div', { class: 'answers' }, ...opts.map((o) => h('button', { class: 'choice', type: 'button', 'data-testid': 'lb-opt', onclick: (e) => {
        box.querySelectorAll('.choice').forEach((b) => { b.disabled = true; b.classList.toggle('right', b.textContent === right); });
        if (o === right) { ok++; star(); Sfx.win(); burst(box); talk(`Bravo ! ${when}, ${withSubj(p, right)} ${V[v].c}.`, true); } else { e.currentTarget.classList.add('wrong'); Sfx.tap(); talk(`${au(tname)[0].toUpperCase()}${au(tname).slice(1)}, on dit : ${withSubj(p, right)}.`, true); }
        i++; setTimeout(ask, 2800);
      } }, o))));
      talk(`${when}, conjugue le verbe ${v} ${au(tname)}.`);
    }
  }
  UI.openDialog(h('div', { class: 'panel lb-panel' }, UI.closeButton(), h('h2', null, '🪜 L’escalier du temps des verbes'),
    h('div', { class: 'actions wrap' }, ...modes), stairs, box, say, h('div', { class: 'actions' }, sc)), { label: 'Escalier des verbes' });
  start('marche');
}

// ---------- 3. la lecture sur le canapé (karaoké) ----------
export function lecture() {
  const ps = C.db().passages.filter((p) => p.subject === 'francais' && p.domain === 'lecture' && !p.exam2025 && p.text && p.text.length < 1600);
  const lvl = S.currentLevel('francais');
  const pick = shuffle(ps).sort((a, b) => Math.abs(a.level - lvl) - Math.abs(b.level - lvl)).slice(0, 4);
  UI.openDialog(h('div', { class: 'panel lb-panel' }, UI.closeButton(), h('h2', null, '🛋️ Une histoire sur le canapé'),
    h('p', null, 'Choisis une histoire. Tu peux la lire toute seule, ou te la faire raconter : chaque mot s’allume pendant la lecture.'),
    h('div', { class: 'cards' }, ...pick.map((p) => h('button', { class: 'card-btn', type: 'button', 'data-testid': 'lb-story', onclick: () => read(p) }, h('span', { class: 'ci' }, '📖'), h('strong', null, p.title), h('small', null, `${p.text.split(/\s+/).length} mots`))))), { label: 'Lecture' });
}
function read(p) {
  const sents = (p.text.match(/[^.!?…]+[.!?…]+["»”]?\s*|[^.!?…]+$/g) || [p.text]).map((s) => s.trim()).filter(Boolean);
  const textEl = h('div', { class: 'lb-text' });
  const words = [];
  sents.forEach((s, si) => { s.split(/\s+/).forEach((w) => { const sp = h('span', { class: 'lb-w', 'data-s': si }, w); words.push(sp); textEl.append(sp, ' '); }); });
  let token = 0;
  const stopRead = () => { token++; Voice.stop(); words.forEach((w) => w.classList.remove('cur')); };
  const raconte = h('button', { class: 'btn primary small', type: 'button', 'data-testid': 'lb-raconte', onclick: () => {
    stopRead(); const my = token; let si = 0;
    const one = () => {
      if (my !== token) return;
      if (si >= sents.length) { words.forEach((w) => w.classList.remove('cur')); return; }
      const ws = words.filter((w) => +w.dataset.s === si), s = sents[si], rate = Math.min(1.2, Math.max(0.6, +S.get().settings.voiceRate || 0.92));
      const dur = Math.max(1.2, s.length / (13.5 * rate)) * 1000, t0 = performance.now();
      const tick = () => { if (my !== token) return; const u = Math.min(0.999, (performance.now() - t0) / dur); let acc = 0; const tot = ws.reduce((a, w) => a + w.textContent.length + 1, 0); let k = 0; for (; k < ws.length; k++) { acc += ws[k].textContent.length + 1; if (acc / tot > u) break; } words.forEach((w) => w.classList.remove('cur')); (ws[Math.min(k, ws.length - 1)] || ws[0]).classList.add('cur'); words.forEach((w) => { if (+w.dataset.s < si || (+w.dataset.s === si && ws.indexOf(w) < k)) w.classList.add('read'); }); if (u < 0.999) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      si++;
      const spoke = Voice.speak(s, { onEnd: () => setTimeout(one, 150) });
      if (!spoke) setTimeout(one, dur + 150);
    };
    words.forEach((w) => w.classList.remove('read')); one();
  } }, '🔊 On me raconte');
  const seule = h('button', { class: 'btn small', type: 'button', onclick: () => { stopRead(); words.forEach((w) => w.classList.remove('read')); UI.toast('À toi de lire ! Touche un mot difficile pour l’entendre.'); } }, '👀 Je lis toute seule');
  textEl.addEventListener('click', (e) => { const w = e.target.closest('.lb-w'); if (!w) return; Voice.speak(w.textContent.replace(/[.,;:!?…«»"“”()]/g, '')); w.classList.add('heard'); });
  const qs = C.db().questions.filter((q) => q.passage === p.id);
  const questions = h('button', { class: 'btn small', type: 'button', disabled: !qs.length, 'data-testid': 'lb-questions', onclick: () => { stopRead(); UI.runQuiz({ kind: 'quiz', subject: 'francais', level: p.level, passage: p, questions: qs.slice(0, 6).map(C.prepare) }, { title: `📖 ${p.title}`, onQuit: () => {}, onDone: ({ correct, total }) => { S.get().bonusStars = (S.get().bonusStars || 0) + correct; S.get().coins += correct * 2; S.save(); UI.toast(`${correct}/${total} · +${correct} 🌟`); if (correct === total) Sfx.win(); if (correct >= total - 1) Papa.event('livre'); } }); } }, `❓ Répondre aux questions${qs.length ? ` (${Math.min(6, qs.length)})` : ''}`);
  UI.openDialog(h('div', { class: 'panel lb-panel' }, UI.closeButton(), h('h2', null, `📖 ${p.title}`),
    h('div', { class: 'actions wrap' }, raconte, seule, questions), textEl,
    h('p', { class: 'muted' }, 'Astuce : touche un mot pour l’entendre.'),
    h('div', { class: 'actions' }, h('button', { class: 'btn ghost small', type: 'button', onclick: () => { stopRead(); lecture(); } }, '← Autres histoires'))), { label: 'Lecture', onClose: stopRead });
}
