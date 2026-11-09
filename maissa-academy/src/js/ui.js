// Interface : un seul panneau à la fois (jamais de superposition de menus), accessible et tactile.
import * as English from './english.js';
import * as S from './save.js';
import * as C from './content.js';
import { BADGES, pagesRestored, pageLine, PAGES } from './rewards.js';
import * as Mimi from './mimi.js';
import * as Voice from './voice.js';

export function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
  return e;
}

const layer = () => document.getElementById('dialog-layer');
let current = null;

export function isOpen() { return !!current; }
// Confirmation intégrée (les confirm() natifs sont bloqués ou ignorés dans les PWA et sur Samsung Internet)
export function confirmInline(btn, text, onYes) {
  const box = h('span', { class: 'confirm-inline', role: 'alertdialog', 'aria-label': text },
    h('span', { class: 'ci-text' }, text),
    h('button', { class: 'btn small danger', type: 'button', 'data-testid': 'confirm-yes', onclick: (e) => { e.stopPropagation(); onYes(); } }, 'Oui'),
    h('button', { class: 'btn small', type: 'button', 'data-testid': 'confirm-no', onclick: (e) => { e.stopPropagation(); box.replaceWith(btn); } }, 'Non'));
  btn.replaceWith(box);
  box.querySelector('[data-testid=confirm-no]').focus();
}

export function closeDialog() {
  if (!current) return;
  const { onClose, prevFocus } = current;
  current = null;
  layer().innerHTML = '';
  document.getElementById('app').dataset.dialog = '';
  Voice.stop();
  try { prevFocus && prevFocus.focus && prevFocus.focus(); } catch (e) { /* ignoré */ }
  onClose && onClose();
  document.dispatchEvent(new CustomEvent('dlg:closed'));
}

/** Ouvre un panneau (remplace l'éventuel panneau existant). */
export function openDialog(content, { kind = 'sheet', closable = true, onClose, label = 'Panneau' } = {}) {
  if (current) { const c = current; current = null; layer().innerHTML = ''; c.onClose && c.onClose(); }
  const prevFocus = document.activeElement;
  const back = h('div', { class: 'backdrop', onclick: () => closable && closeDialog() });
  const box = h('div', { class: `dialog ${kind}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': label }, content);
  box.addEventListener('click', (e) => e.stopPropagation());
  const wrap = h('div', { class: 'dlg-wrap' }, back, box);
  layer().append(wrap);
  current = { onClose, prevFocus, closable };
  document.getElementById('app').dataset.dialog = kind;
  const f = box.querySelector('[data-autofocus]') || box.querySelector('button, input');
  f && setTimeout(() => { try { f.focus({ preventScroll: true }); } catch (e) { /* ignoré */ } }, 30);
  return box;
}

export function closeButton(label = 'Fermer') {
  return h('button', { class: 'btn ghost close-x', type: 'button', 'aria-label': label, onclick: closeDialog }, '✕');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && current && current.closable) closeDialog();
});

let toastT;
export function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

export const stars = (n, max = 3) => '★'.repeat(n) + '☆'.repeat(max - n);
export const SUBJECT_LABEL = { francais: 'Français', maths: 'Mathématiques', eveil: 'Éveil' };
export const SUBJECT_ICON = { francais: '📚', maths: '🔢', eveil: '🔭' };

const CHEERS = ['Bravo !', 'Excellent !', 'Super, Maissa !', 'Quelle exploratrice !', 'Magnifique !', 'Muezza est fière de toi !'];
const TRYAGAIN = ['Presque ! Regarde l’explication.', 'Ce n’est pas grave, on apprend !', 'Courage, la prochaine sera la bonne.', 'Muezza croit en toi !'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function bubble(text, who = 'soumaya') {
  return h('div', { class: 'bubble-row' },
    h('img', { class: 'avatar', src: 'assets/portraits/soumaya_avatar.webp', alt: 'Maissa' }),
    h('div', { class: 'bubble', 'aria-live': 'polite' }, text));
}

// ---------- Introduction de mission ----------
export function missionIntro({ title, subject, mode, domains, domain, onStart, onCancel }) {
  const level0 = S.currentLevel(subject);
  let level = level0;
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Choisis ton niveau' });
  const info = h('p', { class: 'muted level-info' });
  const startBtn = h('button', { class: 'btn primary big', type: 'button', 'data-autofocus': true, 'data-testid': 'start-mission', onclick: () => { closeDialog(); onStart(level); } }, 'Commencer');
  const paint = () => {
    chips.innerHTML = '';
    for (let l = 1; l <= S.LEVELS; l++) {
      const locked = l > S.get().subjects[subject].unlocked;
      const st = S.levelStars(subject, l);
      chips.append(h('button', {
        class: `chip${l === level ? ' sel' : ''}${locked ? ' locked' : ''}`, type: 'button', disabled: locked, 'data-level': l,
        'aria-label': `Niveau ${l}${locked ? ' verrouillé' : ''}${st ? `, ${st} étoile(s)` : ''}`,
        onclick: () => { level = l; paint(); },
      }, locked ? '🔒' : String(l), h('small', null, locked ? '' : stars(st))));
    }
    info.textContent = `Niveau ${level} sur ${S.LEVELS} · ${SUBJECT_LABEL[subject]}. Réussis 3 questions sur 5 pour débloquer la suite.`;
  };
  paint();
  openDialog(h('div', { class: 'panel' },
    closeButton(),
    h('h2', null, `${SUBJECT_ICON[subject]} ${title}`),
    bubble(mode === 'passage' ? 'Lis (ou écoute) le texte avec attention, puis réponds aux questions !' : 'Cinq questions t’attendent. Prends ton temps, Muezza est là !'),
    chips, info,
    h('div', { class: 'actions' }, startBtn),
  ), { label: title, onClose: onCancel });
}

// ---------- Questions ----------
export function runQuiz(mission, { title, onDone, onQuit, examMode = false }) {
  let i = 0, correct = 0, locked = false;
  const answers = [];
  const qs = mission.questions;
  const speak = (text) => Voice.speak(text);

  function render() {
    locked = false;
    const q = qs[i];
    if (location.search.indexOf('qa=1') >= 0) window.__q = q; // outil de test uniquement
    const prog = h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': qs.length, 'aria-valuenow': i },
      qs.map((_, k) => h('span', { class: `dot${k < i ? ' done' : ''}${k === i ? ' cur' : ''}` })));
    const feedback = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, 'data-testid': 'next', onclick: () => { i++; i >= qs.length ? finish() : render(); } }, i + 1 >= qs.length ? 'Voir mon résultat' : 'Question suivante →');

    const answerArea = h('div', { class: 'answers' });
    const settle = (ok, given) => {
      if (locked) return; locked = true;
      if (ok) correct++;
      answers.push({ id: q.id, ok, given });
      S.recordAnswer(q.id, ok);
      feedback.hidden = false;
      feedback.className = `feedback ${ok ? 'ok' : 'ko'}`;
      if (!examMode && ok) Mimi.addBond(1);
      feedback.replaceChildren(...[
        examMode ? null : h('div', { class: 'mimi-chip' }, h('img', { src: Mimi.spriteUrl(ok ? 'joie' : 'repos'), alt: '' }), h('span', null, Mimi.line(ok ? 'ok' : 'ko'))),
        h('strong', null, examMode ? (ok ? 'Réponse enregistrée ✓' : 'Réponse enregistrée') : (ok ? '🌟 ' + pick(CHEERS) : '💜 ' + pick(TRYAGAIN))),
        examMode ? null : h('p', null, q.explanation || ''),
        !ok && !examMode && q.type === 'saisie' ? h('p', { class: 'muted' }, `Réponse attendue : ${q.accepted[0]}`) : null].filter(Boolean));
      if (examMode) { feedback.hidden = true; }
      next.hidden = false; next.focus && next.focus();
      document.dispatchEvent(new CustomEvent('quiz:answered', { detail: { ok, id: q.id, exam: examMode } }));
    };

    if (q.type === 'saisie') {
      const input = h('input', { class: 'field', type: 'text', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false', enterkeyhint: 'done', 'aria-label': 'Ta réponse', placeholder: 'Écris ta réponse ici', 'data-autofocus': true, 'data-testid': 'answer-input' });
      const ok = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'validate', onclick: () => {
        if (locked || !input.value.trim()) { input.focus(); return; }
        input.disabled = true; ok.disabled = true;
        settle(C.checkAnswer(q, input.value), input.value);
      } }, 'Valider');
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok.click(); });
      answerArea.append(h('div', { class: 'row' }, input, ok));
    } else {
      q.choices.forEach((c, k) => {
        const b = h('button', { class: 'choice', type: 'button', 'data-testid': 'choice', 'data-index': k, onclick: () => {
          if (locked) return;
          const isOk = k === q.answer;
          answerArea.querySelectorAll('.choice').forEach((x, j) => { x.disabled = true; if (j === q.answer && !examMode) x.classList.add('right'); });
          b.classList.add(examMode ? 'picked' : isOk ? 'right' : 'wrong');
          settle(isOk, k);
        } }, h('span', { class: 'letter' }, String.fromCharCode(65 + k)), h('span', { class: 'txt' }, c));
        answerArea.append(b);
      });
    }
    const hint = q.hint && !examMode ? h('button', { class: 'btn ghost small', type: 'button', onclick: (e) => { e.currentTarget.replaceWith(h('p', { class: 'hint' }, '🐾 ' + Mimi.line('hint') + ' : ' + q.hint)); Mimi.meow(1.1); } }, '🐾 Un indice de Muezza') : null;

    const kids = [
      h('div', { class: 'quiz-top' }, h('span', { class: 'title' }, title || ''), h('button', { class: 'btn ghost small', type: 'button', 'data-testid': 'quit', onclick: (e) => confirmInline(e.currentTarget, 'Quitter ? Cette mission ne sera pas comptée.', () => { closeDialog(); onQuit && onQuit(); }) }, 'Quitter')),
      prog,
    ];
    if (mission.passage) {
      const p = mission.passage;
      kids.push(h('details', { class: 'passage', open: i === 0 }, h('summary', null, `📖 ${p.title}`),
        h('div', { class: 'passage-text' }, p.text),
        Voice.available() ? h('button', { class: 'btn ghost small', type: 'button', 'data-testid': 'listen', onclick: () => speak(p.text) }, '🔊 Écouter') : null));
    }
    kids.push(h('p', { class: 'prompt', 'data-testid': 'prompt' }, q.prompt), answerArea, hint, feedback, h('div', { class: 'actions' }, next));
    openDialog(h('div', { class: 'panel quiz' }, ...kids), { closable: false, label: 'Question' });
  }

  function finish() {
    closeDialog();
    onDone({ correct, total: qs.length, answers });
  }
  render();
}

// ---------- Résultat ----------
export function resultView({ subject, level, correct, total, res, badges, pageNow, onReplay, onNext, onBack }) {
  const starsEl = h('div', { class: 'big-stars', 'aria-label': `${res.stars} étoile(s) sur 3`, 'data-testid': 'result-stars' },
    [0, 1, 2].map((k) => h('span', { class: `star${k < res.stars ? ' on' : ''}`, style: `animation-delay:${0.25 * k}s` }, '★')));
  const passed = res.stars > 0;
  const msg = res.stars === 3 ? 'Parfait, sans aucune faute !' : passed ? 'Mission réussie !' : 'Pas encore… mais tu y es presque. Relis les explications et retente !';
  const body = [
    closeButton(),
    h('h2', null, passed ? '🎉 Bravo !' : '💪 Continue !'),
    starsEl,
    h('p', { class: 'score', 'data-testid': 'result-score' }, `${correct} / ${total} bonnes réponses`),
    bubble(msg),
    h('p', { class: 'muted' }, `+${correct * 5 + res.stars * 10} 🪙`),
  ];
  if (res.unlockedNext) body.push(h('p', { class: 'unlock' }, `🔓 Niveau ${level + 1} débloqué en ${SUBJECT_LABEL[subject]} !`));
  for (const b of badges) body.push(h('div', { class: 'badge-win' }, h('span', { class: 'bi' }, b.icon), h('div', null, h('strong', null, 'Nouveau badge : ' + b.name), h('small', null, b.desc))));
  if (pageNow) body.push(h('div', { class: 'page-win' }, h('img', { src: 'assets/items/grimoire.webp', alt: '' }), h('div', null, h('strong', null, `Page ${pageNow} du Grimoire restaurée !`), h('small', null, pageLine(pageNow)))));
  if (res.finishedAll) body.push(h('p', { class: 'unlock' }, '🏆 Tu as réussi le niveau 10 dans toutes les matières. Tu es une légende de l’Académie !'));
  body.push(h('div', { class: 'actions' },
    h('button', { class: 'btn', type: 'button', 'data-testid': 'replay', onclick: () => { closeDialog(); onReplay(); } }, '↻ Rejouer'),
    res.unlockedNext || (passed && level < S.LEVELS) ? h('button', { class: 'btn primary', type: 'button', 'data-testid': 'next-level', onclick: () => { closeDialog(); onNext(); } }, 'Niveau suivant →') : null,
    h('button', { class: 'btn', type: 'button', 'data-testid': 'back', 'data-autofocus': true, onclick: () => { closeDialog(); onBack(); } }, '← Retour à la salle')));
  openDialog(h('div', { class: 'panel result' }, ...body), { label: 'Résultat', onClose: onBack });
}

// ---------- Passeport ----------
export function passport() {
  const st = S.get();
  const rows = S.SUBJECTS.map((s) => h('div', { class: 'pp-row' },
    h('strong', null, `${SUBJECT_ICON[s]} ${SUBJECT_LABEL[s]}`),
    h('div', { class: 'pp-levels' }, Array.from({ length: S.LEVELS }, (_, k) => {
      const l = k + 1, n = S.levelStars(s, l), locked = l > st.subjects[s].unlocked;
      return h('span', { class: `pp-lvl${n ? ' ok' : ''}${locked ? ' lock' : ''}`, title: `Niveau ${l}` }, locked ? '·' : n ? '★'.repeat(n) : String(l));
    }))));
  const acc = st.stats.answered ? Math.round(100 * st.stats.correct / st.stats.answered) : 0;
  openDialog(h('div', { class: 'panel' }, closeButton(),
    h('div', { class: 'pp-head' }, h('img', { class: 'avatar big', src: 'assets/portraits/soumaya_avatar.webp', alt: '' }),
      h('div', null, h('h2', null, `Passeport de ${st.name}`), h('p', { class: 'muted' }, 'Exploratrice de l’Académie'))),
    h('div', { class: 'pp-stats' },
      h('div', null, h('b', null, String(S.totalStars())), h('small', null, 'étoiles / 90')),
      h('div', null, h('b', null, String(st.coins)), h('small', null, 'pièces')),
      h('div', null, h('b', null, `${acc}%`), h('small', null, 'réussite')),
      h('div', null, h('b', null, `${pagesRestored()}/${PAGES}`), h('small', null, 'pages du Grimoire'))),
    ...rows,
    h('div', { class: 'actions' },
      h('button', { class: 'btn', type: 'button', 'data-testid': 'open-mimi', onclick: mimiPanel }, '🐾 Muezza'),
      h('button', { class: 'btn primary', type: 'button', 'data-testid': 'open-english', onclick: () => English.open() }, '🇬🇧 English Academy'),
      h('button', { class: 'btn', type: 'button', onclick: settings }, '⚙️ Réglages et sauvegarde'))), { label: 'Passeport' });
}

// ---------- Fiche de Muezza ----------
export function mimiPanel() {
  const box = h('div', { class: 'panel mimi-panel' });
  const render = () => {
    const st = S.get(), m = st.mimi, pr = Mimi.progress(), md = Mimi.mood(), wait = Mimi.treatWait();
    const note = h('p', { class: 'muted mimi-note', 'aria-live': 'polite' }, md.icon + ' ' + md.text);
    const say = (t) => { note.textContent = t; };
    const hug = h('button', { class: 'btn', type: 'button', 'data-testid': 'mimi-hug', onclick: () => {
      const gained = Mimi.pet(); Mimi.purr(); Mimi.buzz([25, 40, 25]);
      document.dispatchEvent(new CustomEvent('mimi:changed')); render();
      box.querySelector('.mimi-note').textContent = '💗 ' + Mimi.line('pet') + (gained ? ' (+1 amitié)' : '');
    } }, '🤗 Faire un câlin');
    const treat = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'mimi-treat', disabled: st.coins < Mimi.TREAT_COST || wait > 0, onclick: () => {
      const r = Mimi.feed(); if (!r.ok) return; Mimi.meow(1.1);
      document.dispatchEvent(new CustomEvent('save:coins')); render();
      box.querySelector('.mimi-note').textContent = '🐟 ' + Mimi.line('treat') + ' (+4 amitié)';
    } }, `🐟 Croquette magique · ${Mimi.TREAT_COST} 🪙`);
    const bows = h('div', { class: 'bows', role: 'group', 'aria-label': 'Nœud de Muezza' }, Mimi.BOWS.map((b) => {
      const locked = b.lvl > pr.level;
      return h('button', { class: `chip bow bow-${b.id}${m.bow === b.id && m.fur !== 'blanc' ? ' sel' : ''}${locked ? ' locked' : ''}`, type: 'button', disabled: locked || m.fur === 'blanc', 'data-bow': b.id,
        'aria-label': `Nœud ${b.name}${locked ? ', verrouillé (amitié : ' + Mimi.BOND_LEVELS[b.lvl].name + ')' : ''}`,
        onclick: () => { if (Mimi.setBow(b.id)) { document.dispatchEvent(new CustomEvent('mimi:changed')); render(); } } },
      locked ? '🔒' : '🎀', h('small', null, b.name));
    }));
    const furs = h('div', { class: 'row furs', role: 'group', 'aria-label': 'Pelage' }, Mimi.FURS.map((f) => h('button', { class: `chip${m.fur === f.id ? ' sel' : ''}`, type: 'button', 'data-fur': f.id,
      onclick: () => { Mimi.setFur(f.id); document.dispatchEvent(new CustomEvent('mimi:changed')); render(); } }, f.name)));
    box.replaceChildren(...[closeButton(),
      h('div', { class: 'mimi-head' },
        h('img', { class: 'mimi-big', src: Mimi.spriteUrl('repos'), alt: 'Muezza, ' + Mimi.furLabel() }),
        h('div', null, h('h2', null, 'Muezza'), h('p', { class: 'muted' }, 'Ton ' + Mimi.furLabel() + ' du château'), note)),
      h('div', { class: 'mimi-bond' },
        h('div', { class: 'row between' }, h('strong', null, `💗 Amitié : ${pr.name}`), h('small', { class: 'muted' }, pr.next ? `${pr.bond} / ${pr.next}` : `${pr.bond} (maximum)`)),
        h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(pr.ratio * 100) }, h('span', { style: `width:${Math.round(pr.ratio * 100)}%` }))),
      h('p', { class: 'mimi-story' }, 'Muezza est née dans la bibliothèque du château. Elle adore dormir sur les grimoires, chasser les lettres qui s’échappent des livres et croquer des croquettes magiques. Quand tu réussis une mission, elle ronronne !'),
      h('div', { class: 'actions wrap' }, hug, treat),
      wait > 0 ? h('small', { class: 'muted' }, 'Muezza digère… une prochaine croquette dans un instant.') : null,
      h('h3', null, 'Son nœud'), bows,
      h('small', { class: 'muted' }, 'Chaque niveau d’amitié débloque un nouveau nœud.'),
      h('h3', null, 'Son pelage'), furs].filter(Boolean));
  };
  render();
  openDialog(box, { label: 'Muezza' });
}

// ---------- Galerie royale ----------
export function gallery() {
  const st = S.get();
  const n = pagesRestored();
  const book = h('div', { class: 'book' }, h('img', { src: 'assets/items/livre_magique.webp', alt: 'Le Grimoire des Savoirs' }),
    h('div', { class: 'book-pages' }, Array.from({ length: PAGES }, (_, k) => h('span', { class: k < n ? 'on' : '' }))));
  openDialog(h('div', { class: 'panel' }, closeButton(),
    h('h2', null, '🏆 Galerie royale'),
    h('p', { class: 'muted' }, 'Le Grimoire des Savoirs a perdu ses 10 pages. Chaque trois niveaux réussis en restaure une.'),
    book,
    h('h3', null, 'Badges'),
    h('div', { class: 'badges' }, BADGES.map((b) => h('div', { class: `badge${st.badges[b.id] ? ' got' : ''}`, title: b.desc },
      h('span', { class: 'bi' }, st.badges[b.id] ? b.icon : '🔒'), h('strong', null, b.name), h('small', null, b.desc))))), { label: 'Galerie royale' });
}

// ---------- Réglages ----------
function voiceBlock() {
  if (!Voice.available()) return h('p', { class: 'muted' }, 'Ton navigateur ne propose pas la lecture à voix haute.');
  const st = S.get().settings;
  const sel = h('select', { class: 'field', 'aria-label': 'Voix', 'data-testid': 'voice-select', onchange: (e) => { st.voiceName = e.target.value; S.save(); } });
  const fill = () => {
    const fr = Voice.frenchVoices(); sel.innerHTML = '';
    sel.append(h('option', { value: '' }, fr.length ? 'Automatique (meilleure voix)' : 'Aucune voix française trouvée'));
    fr.forEach((v) => sel.append(h('option', { value: v.name, selected: st.voiceName === v.name }, `${v.name} (${v.lang})`)));
  };
  fill(); setTimeout(fill, 600);
  const rate = h('select', { class: 'field', 'aria-label': 'Vitesse', onchange: (e) => { st.voiceRate = +e.target.value; S.save(); } },
    [['0.75', 'Lente'], ['0.92', 'Normale'], ['1.08', 'Rapide']].map(([v, l]) => h('option', { value: v, selected: Math.abs((+st.voiceRate || 0.92) - +v) < 0.05 }, l)));
  return h('div', { class: 'voice-block' },
    h('label', { class: 'muted' }, 'Voix', sel), h('label', { class: 'muted' }, 'Vitesse', rate),
    h('button', { class: 'btn small', type: 'button', 'data-testid': 'voice-test', onclick: () => Voice.speak('Bonjour Maissa ! Je suis la voix du château. Prête pour une nouvelle aventure ?', { force: true }) }, '🔊 Tester la voix'),
    h('p', { class: 'muted small' }, 'Si la voix sonne comme un robot : sur Android, ouvre Réglages › Gestion générale › Synthèse vocale, choisis « Google » et télécharge une voix française de meilleure qualité, puis reviens ici et choisis-la dans la liste.'));
}

export function settings() {
  const st = S.get();
  const tog = (key, label) => h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: st.settings[key], onchange: (e) => { st.settings[key] = e.target.checked; S.save(); document.dispatchEvent(new CustomEvent('settings:changed', { detail: key })); } }), label);
  const file = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { S.importJSON(await f.text()); toast('Progression restaurée ✓'); closeDialog(); } catch (err) { toast('Fichier invalide'); }
  } });
  openDialog(h('div', { class: 'panel' }, closeButton(), h('h2', null, '⚙️ Réglages'),
    tog('voice', 'Lecture à voix haute des textes'), voiceBlock(), tog('sound', 'Sons (bonne réponse, pas, pièces, Muezza)'), tog('music', 'Musique d’ambiance douce'), tog('motion', 'Animations et particules (relance la salle au prochain changement)'),
    h('p', { class: 'muted' }, 'La progression est enregistrée automatiquement sur cet appareil. Tu peux aussi la sauvegarder dans un fichier.'),
    h('div', { class: 'actions wrap' },
      h('button', { class: 'btn', type: 'button', onclick: () => {
        const blob = new Blob([S.exportJSON()], { type: 'application/json' });
        const a = h('a', { href: URL.createObjectURL(blob), download: 'soumaya-academy-sauvegarde.json' });
        document.body.append(a); a.click(); a.remove(); toast('Sauvegarde téléchargée');
      } }, '💾 Exporter'),
      h('button', { class: 'btn', type: 'button', onclick: () => file.click() }, '📂 Importer'), file,
      h('button', { class: 'btn danger', type: 'button', 'data-testid': 'reset', onclick: (e) => confirmInline(e.currentTarget, 'Tout effacer, définitivement ?', () => { S.reset(); location.reload(); }) }, '🗑️ Tout effacer'))),
  { label: 'Réglages' });
}

export const speakText = (t) => Voice.speak(t);
