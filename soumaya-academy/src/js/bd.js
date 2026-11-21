// Les BD « Sciences Comics » de Papa : affichage, agrandissement et lecture à voix haute bulle par bulle.
import { h } from './ui.js';
import * as Voice from './voice.js';
import { asset } from './asset.js';

export function show(body, talk, { img, title, alt, lines, after, question }) {
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
    rep, after ? h('p', { class: 'muted' }, after) : null);
  talk('Lis la BD, ou appuie sur « Lis-moi la BD ».', false);
}
