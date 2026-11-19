// Vlot lezen — Fluence en néerlandais : 14 textes originaux à lignes numérotées (thèmes du livret de classe),
// écoute ligne par ligne, « Lees mee » (surlignage au rythme choisi), chrono 1 minute (mots lus par minute, record),
// 3 questions de compréhension. Lien vers le livre audio de la classe (Book Creator) sans copier son contenu.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import * as WS from './workshop.js';
import { TEKSTEN } from './fluence_data.js';

const { shuffle, burst, star } = WS;
const BOOK = 'https://read.bookcreator.com/library/-P53Z14pBizX-QYVBe6A/book/YA8T5-hiSNm8oXb5gh7dTw';
const ST = () => { const b = S.get(); b.fluence = b.fluence || {}; return b.fluence; };
const words = (s) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
let voices = [];
const nlVoice = () => { if (!('speechSynthesis' in window)) return null; if (!voices.length) voices = speechSynthesis.getVoices(); return voices.find((v) => /nl[-_]BE/i.test(v.lang)) || voices.find((v) => /^nl/i.test(v.lang)) || null; };
function speak(text, { rate = 0.9, onend } = {}) {
  if (!('speechSynthesis' in window)) { onend && setTimeout(onend, 1500); return; }
  const u = new SpeechSynthesisUtterance(text); u.lang = 'nl-BE'; const v = nlVoice(); if (v) u.voice = v; u.rate = rate;
  if (onend) { u.onend = onend; u.onerror = onend; }
  speechSynthesis.speak(u);
}
const hush = () => { try { speechSynthesis.cancel(); } catch (e) { /* */ } };
// Livret de la classe (Leesrijk 4) : importé par Papa depuis un fichier privé, gardé seulement sur l'appareil (IndexedDB), jamais publié.
const DB = () => new Promise((res, rej) => { const r = indexedDB.open('sa-prive', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const dbGet = async (k) => { const d = await DB(); return new Promise((res) => { const q = d.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); }); };
const dbSet = async (k, v) => { const d = await DB(); return new Promise((res, rej) => { const tx = d.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); };
let PACK = null;
const rich = (line) => line.split(/(\*\*[^*]+\*\*)/).map((x) => (x.startsWith('**') ? h('b', null, x.slice(2, -2)) : x));
const fmtD = (d) => new Date(d).toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit' });

export function open() {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div', { class: 'fl-body' });
  let stop = () => {};
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel fl-panel' }, UI.closeButton(), h('h2', null, '⏱️ Vlot lezen — Fluence'), body, say),
    { label: 'Vlot lezen', onClose: () => { stop(); hush(); Voice.stop(); } });

  async function shelf() {
    stop(); hush();
    const st = ST();
    if (!PACK) { try { PACK = await dbGet('leesrijk'); } catch (e) { PACK = null; } }
    const file = h('input', { type: 'file', accept: '.json,application/json', hidden: true, 'data-testid': 'fl-file', onchange: async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { const j = JSON.parse(await f.text()); if (!j || !Array.isArray(j.texts)) throw new Error('format'); await dbSet('leesrijk', j); PACK = j; Sfx.win(); talk('Le livret de la classe est installé sur cet appareil !'); shelf(); }
      catch (err) { talk('Ce fichier n’est pas le livret Leesrijk.'); }
    } });
    const card = (t, i, pre) => { const rec = st[t.id]; return h('button', { class: 'fl-card', type: 'button', style: `--c:${t.c}`, 'data-testid': pre + i, onclick: () => text(t) },
      h('b', null, t.t), t.fr ? h('small', null, t.fr) : (t.audio ? h('small', null, '🎧 voix de la juf') : h('small', null, '🔊 voix du téléphone')),
      h('span', { class: 'fl-meta' }, `${t.l.length} lignes · ${words(t.l.join(' '))} mots`, rec && rec.best ? ` · 🏆 ${rec.best} mots/min` : '')); };
    body.replaceChildren(
      h('p', { class: 'fl-intro' }, 'Lis à voix haute, le plus ', h('b', null, 'juste'), ' et le plus ', h('b', null, 'fluide'), ' possible. Écoute d’abord le texte, lis avec la voix, puis lance le chrono d’une minute pour mesurer tes progrès.'),
      h('div', { class: 'fl-sec' }, h('h3', null, '📘 Leesrijk 4 — le livret de la classe'), h('button', { class: 'btn small', type: 'button', 'data-testid': 'fl-progress', onclick: progress }, '📈 Mes progrès')),
      PACK ? h('div', { class: 'fl-shelf' }, ...PACK.texts.map((t, i) => card(t, i, 'fl-p')))
        : h('div', { class: 'fl-import' }, h('p', null, 'Le livret de la classe s’installe avec le fichier envoyé par Papa. Il reste seulement sur cet appareil.'), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'fl-import', onclick: () => file.click() }, '📥 Installer le livret de la classe'), file),
      h('div', { class: 'fl-sec' }, h('h3', null, '✍️ Textes d’entraînement')),
      h('div', { class: 'fl-shelf' }, ...TEKSTEN.map((t, i) => card(t, i, 'fl-t'))),
      h('div', { class: 'fl-book' }, h('a', { class: 'btn', href: BOOK, target: '_blank', rel: 'noopener' }, '🎧 Le livre de la classe sur Book Creator'),
        h('small', null, 'S’ouvre dans un nouvel onglet.'), PACK ? h('button', { class: 'btn small', type: 'button', onclick: () => file.click() }, '🔄 Réinstaller le livret') : null, PACK ? file : null));
    talk('Choisis un texte à lire en néerlandais.');
  }

  function progress() {
    stop(); hush();
    const st = ST(), all = [...(PACK ? PACK.texts : []), ...TEKSTEN].filter((t) => st[t.id] && st[t.id].tries && st[t.id].tries.length);
    const spark = (tries) => { const W = 160, H = 36, max = Math.max(...tries.map((x) => x.wpm), 1); const pts = tries.map((x, i) => `${tries.length === 1 ? W / 2 : (i * W) / (tries.length - 1)},${H - (x.wpm / max) * (H - 4) - 2}`).join(' ');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', `-4 -2 ${W + 8} ${H + 4}`); svg.setAttribute('class', 'fl-spark'); svg.innerHTML = `<polyline points="${pts}" fill="none" stroke="#ffd84a" stroke-width="2.5"/>`; return svg; };
    body.replaceChildren(h('div', { class: 'fl-top' }, h('button', { class: 'btn small', type: 'button', onclick: shelf }, '⬅️'), h('h3', null, '📈 Mes progrès en lecture')),
      all.length ? h('div', { class: 'fl-prog' }, ...all.map((t) => { const r = st[t.id]; const last = r.tries[r.tries.length - 1];
        return h('div', { class: 'fl-pr' }, h('b', null, t.t), h('span', null, `🏆 ${r.best} mots/min · dernière fois : ${last.wpm} (${fmtD(last.d)}) · ${r.tries.length} essai${r.tries.length > 1 ? 's' : ''}`), spark(r.tries),
          h('small', null, r.tries.map((x) => `${fmtD(x.d)} : ${x.wpm}`).join(' · '))); }))
        : h('p', null, 'Pas encore de chrono. Choisis un texte et lance « ⏱️ Chrono 1 min » !'));
    talk('Voici tes progrès en lecture.');
  }

  function text(t) {
    stop(); hush();
    let mode = null, timer = null, left = 60, active = -1, speed = 70;
    const rows = t.l.map((line, i) => h('li', { class: 'fl-line' + (t.br && t.br.includes(i + 1) ? ' gap' : ''), 'data-i': i, onclick: () => onLine(i) }, h('span', { class: 'fl-n' }, `${i + 1}.`), h('span', { class: 'fl-tx' }, ...rich(line))));
    const plain = (x) => x.replace(/\*\*/g, '');
    const audio = t.audio ? new Audio(t.audio) : null; let segEnd = null;
    if (audio) audio.addEventListener('timeupdate', () => { const c = audio.currentTime; if (segEnd != null && c >= segEnd) { audio.pause(); segEnd = null; hl(-1); return; } if (mode === 'listen') { let k = 0; while (k + 1 < t.times.length && t.times[k + 1] <= c) k++; if (k !== active) hl(k); } });
    if (audio) audio.addEventListener('ended', () => { if (mode === 'listen') { mode = null; hl(-1); info.textContent = 'À toi ! Lis le texte à voix haute.'; } });
    const list = h('ol', { class: 'fl-text' }, ...rows);
    const info = h('p', { class: 'fl-info' }, 'Touche une ligne pour l’écouter.');
    const clock = h('span', { class: 'fl-clock' }, '1:00');
    const hl = (i) => { rows.forEach((r, k) => r.classList.toggle('on', k === i)); active = i; if (rows[i]) rows[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    const reset = () => { clearInterval(timer); clearTimeout(timer); timer = null; mode = null; hush(); if (audio) { audio.pause(); segEnd = null; } rows.forEach((r) => r.classList.remove('on', 'done', 'end')); clock.textContent = '1:00'; };
    stop = reset;
    function onLine(i) {
      if (mode === 'chrono-end') { finishChrono(i); return; }
      if (mode) return;
      hush(); hl(i);
      if (audio) { audio.pause(); audio.currentTime = Math.max(0, t.times[i] - 0.15); segEnd = i + 1 < t.times.length ? t.times[i + 1] : null; audio.play().catch(() => {}); return; }
      speak(plain(t.l[i]), { onend: () => rows[i] && rows[i].classList.remove('on') });
    }
    // 1) écouter tout le texte, ligne par ligne
    const listenAll = () => { reset(); mode = 'listen'; info.textContent = audio ? 'Écoute la juf et suis avec ton doigt.' : 'Écoute et suis avec ton doigt.'; if (audio) { segEnd = null; audio.currentTime = 0; audio.play().catch(() => {}); hl(0); return; } let i = 0; const next = () => { if (mode !== 'listen') return; if (i >= t.l.length) { hl(-1); mode = null; info.textContent = 'À toi ! Lis le texte à voix haute.'; return; } hl(i); speak(plain(t.l[i]), { onend: () => { i++; setTimeout(next, 250); } }); }; next(); };
    // 2) lire avec un guide qui avance au rythme choisi (mots par minute)
    const pace = () => { reset(); mode = 'pace'; info.textContent = `Lis la ligne en couleur à voix haute (${speed} mots/min).`; let i = 0; const next = () => { if (mode !== 'pace') return; if (i >= t.l.length) { hl(-1); mode = null; info.textContent = 'Bravo, tu as suivi tout le texte !'; Sfx.win(); return; } hl(i); timer = setTimeout(() => { rows[i].classList.add('done'); i++; next(); }, Math.max(1200, (words(t.l[i]) / speed) * 60000)); }; next(); };
    // 3) chrono d'une minute : à la fin, Soumaya touche la ligne où elle s'est arrêtée
    const chrono = () => {
      reset(); mode = 'chrono'; left = 60; info.textContent = 'Lis à voix haute, le chrono tourne ! Touche « Stop » si tu as fini avant.'; Sfx.tap && Sfx.tap();
      timer = setInterval(() => { left--; clock.textContent = `0:${String(Math.max(0, left)).padStart(2, '0')}`; if (left <= 0) endChrono(); }, 1000);
      stopBtn.hidden = false;
    };
    const endChrono = () => { clearInterval(timer); timer = null; mode = 'chrono-end'; stopBtn.hidden = true; Sfx.chime(); info.textContent = '⏰ Touche la dernière ligne que tu as lue en entier.'; talk('Touche la dernière ligne que tu as lue.'); };
    const finishChrono = (i) => {
      const used = Math.max(1, 60 - left), w = words(t.l.slice(0, i + 1).join(' ').replace(/\*\*/g, '').replace(/\([^)]*\)/g, '')), wpm = Math.round((w * 60) / used);
      rows.forEach((r, k) => r.classList.toggle('done', k <= i)); rows[i].classList.add('end'); mode = null;
      const st = ST(), rec = st[t.id] || (st[t.id] = { best: 0, tries: [] }); const better = wpm > rec.best; rec.best = Math.max(rec.best, wpm); rec.tries = [...(rec.tries || []), { d: Date.now(), wpm, w, s: used }].slice(-40); S.save();
      info.textContent = `${w} mots en ${used} secondes = ${wpm} mots par minute.${better ? ' 🏆 Nouveau record !' : ` (Record : ${rec.best})`}`;
      talk(`${wpm} mots par minute.${better ? ' Nouveau record, bravo !' : ''}`); if (better) { star(); burst(body); }
    };
    const stopBtn = h('button', { class: 'btn small', type: 'button', hidden: true, 'data-testid': 'fl-stop', onclick: () => { if (mode === 'chrono') endChrono(); } }, '⏹️ Stop');
    const speedSel = h('select', { class: 'fl-speed', 'aria-label': 'Vitesse du guide', onchange: (e) => { speed = +e.target.value; } }, ...[50, 70, 90, 110].map((v) => { const o = h('option', { value: v }, `${v} mots/min`); if (v === speed) o.selected = true; return o; }));
    body.replaceChildren(
      h('div', { class: 'fl-top' }, h('button', { class: 'btn small', type: 'button', onclick: shelf }, '⬅️'), h('h3', { style: `color:${t.c}` }, t.t), t.fr ? h('small', null, `(${t.fr})`) : (audio ? h('small', null, '🎧 voix de la juf') : null)),
      h('div', { class: 'fl-tools' },
        h('button', { class: 'btn small', type: 'button', 'data-testid': 'fl-listen', onclick: listenAll }, audio ? '👂 Écouter la juf' : '👂 Écouter tout'),
        h('button', { class: 'btn small', type: 'button', 'data-testid': 'fl-pace', onclick: pace }, '🐢 Lees mee'), speedSel,
        h('button', { class: 'btn small primary', type: 'button', 'data-testid': 'fl-chrono', onclick: chrono }, '⏱️ Chrono 1 min'), clock, stopBtn,
        t.q ? h('button', { class: 'btn small', type: 'button', 'data-testid': 'fl-quiz', onclick: () => quiz(t) }, '❓ Vragen') : null),
      info, list);
    talk(`${t.t}. Écoute d’abord, puis lis à voix haute.`, false); Voice.speak('Écoute d’abord, puis lis à voix haute.');
  }

  function quiz(t) {
    stop(); hush();
    let i = 0, ok = 0; const q = h('p', { class: 'prompt' }), ans = h('div', { class: 'answers' });
    body.replaceChildren(h('div', { class: 'fl-top' }, h('button', { class: 'btn small', type: 'button', onclick: () => text(t) }, '⬅️'), h('h3', null, `❓ ${t.t}`)), q, ans);
    const ask = () => {
      if (i >= t.q.length) { q.textContent = `Goed zo ! ${ok} / ${t.q.length}`; ans.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => text(t) }, '📖 Terug naar de tekst'), h('button', { class: 'btn', type: 'button', onclick: shelf }, '📚 Andere tekst')); if (ok === t.q.length) { Sfx.win(); burst(body); } WS.log('fluence', ok >= 2 ? 1 : 0); return; }
      const [vraag, ...opts] = t.q[i]; q.textContent = `${i + 1}. ${vraag}`; hush(); speak(vraag);
      ans.replaceChildren(...shuffle(opts.map((o, k) => [o, k])).map(([o, k]) => h('button', { class: 'choice', type: 'button', 'data-k': k, onclick: (e) => {
        ans.querySelectorAll('button').forEach((b) => { b.disabled = true; if (b.dataset.k === '0') b.classList.add('right'); }); e.currentTarget.classList.add(k === 0 ? 'right' : 'wrong');
        if (k === 0) { ok++; star(); Sfx.win(); } else Sfx.tap(); hush(); speak((k === 0 ? 'Goed zo! ' : 'Het juiste antwoord is: ') + opts[0]);
        i++; setTimeout(ask, 2600);
      } }, o)));
    };
    ask();
  }
  shelf();
}
