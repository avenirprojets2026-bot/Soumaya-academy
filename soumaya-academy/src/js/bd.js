// Les BD « Sciences Comics » de Papa : affichage, agrandissement et lecture à voix haute bulle par bulle.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as Voice from './voice.js';
import { asset } from './asset.js';

export function show(body, talk, { img, title, alt, lines, after, question, note }) {
  const src = asset(img);
  let id = 0;
  const lire = async () => { const me = ++id; for (const t of lines) { if (me !== id || !body.isConnected) return; talk(t, false); await new Promise((ok) => { let d = 0; const f = () => { if (!d) { d = 1; setTimeout(ok, 500); } }; const sp = Voice.speak(t, { onEnd: f }); setTimeout(f, sp ? 3500 + t.length * 95 : 1500 + t.length * 45); }); } };
  const rep = question ? h('div', { class: 'bd-q' }, h('p', null, h('b', null, '🐱 Muezza te pose une question : '), question[0]), h('details', null, h('summary', null, 'Voir des réponses possibles'), h('p', null, question[1]))) : null;
  body.replaceChildren(
    h('p', { class: 'prompt' }, '📖 ' + title),
    h('a', { href: src, target: '_blank', rel: 'noopener', class: 'co-bd-link', title: 'Agrandir' }, h('img', { src, alt, class: 'co-bd', 'data-testid': 'bd-img', loading: 'lazy' })),
    h('div', { class: 'actions wrap' },
      h('button', { class: 'btn primary', type: 'button', 'data-testid': 'bd-lire', onclick: lire }, '🔊 Lis-moi la BD'),
      h('button', { class: 'btn', type: 'button', onclick: () => { id++; Voice.stop(); talk('', false); } }, '⏹️ Stop'),
      h('a', { class: 'btn', href: src, target: '_blank', rel: 'noopener' }, '🔍 Agrandir')),
    note ? h('div', { class: 'bd-note' }, h('b', null, '⚠️ Attention, piège ! '), note) : null,
    rep, after ? h('p', { class: 'muted' }, after) : null);
  talk('Lis la BD, ou appuie sur « Lis-moi la BD ».', false);
}

// ouvre une fenêtre avec une ou plusieurs BD (onglets)
export function openSet(title, items, start = 0) {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (t, v = true) => { say.textContent = t; if (v) Voice.speak(t); };
  const body = h('div');
  const tabs = items.map((it, i) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'bdset-' + i, onclick: () => go(i) }, '📖 ' + it.tab));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel' }, UI.closeButton(), h('h2', null, title), items.length > 1 ? h('div', { class: 'actions wrap' }, ...tabs) : null, body, say), { label: title, onClose: () => Voice.stop() });
  function go(i) { tabs.forEach((t, k) => t.classList.toggle('primary', k === i)); Voice.stop(); show(body, talk, items[i]); }
  go(start);
}
