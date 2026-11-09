// Le grand concert de Maissa (Théâtre des Harmonies) : elle joue de chaque instrument du décor, 10 s, comme une vraie artiste.
// Après chaque morceau : la famille de l'instrument (lien avec « Les familles d'instruments »).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';

export const INSTR = [
  { k: 'harpe', ic: '🎶', n: 'La harpe', src: 'assets/cine/harpe.webm', fam: 'cordes pincées', t: 'Les cordes sont pincées avec les doigts. Soumaya et Mohamed sont montés au balcon pour l’écouter !' },
  { k: 'piano', ic: '🎹', n: 'Le piano', src: 'assets/cine/c_piano.webm', fam: 'cordes frappées', t: 'Quand on appuie sur une touche, un petit marteau frappe une corde à l’intérieur du piano.' },
  { k: 'violon', ic: '🎻', n: 'Le violon', src: 'assets/cine/c_violon.webm', fam: 'cordes frottées', t: 'L’archet frotte les cordes : plus la corde est courte, plus le son est aigu.' },
  { k: 'batterie', ic: '🥁', n: 'La batterie', src: 'assets/cine/c_batterie.webm', fam: 'percussions', t: 'On frappe les tambours et les cymbales : c’est elle qui donne le rythme à tout l’orchestre.' },
  { k: 'trompette', ic: '🎺', n: 'La trompette', src: 'assets/cine/c_trompette.webm', fam: 'cuivres (vents)', t: 'On souffle en faisant vibrer les lèvres, et les pistons changent la note.' },
  { k: 'orgue', ic: '🎛️', n: 'Les grandes orgues', src: 'assets/cine/c_orgue.webm', fam: 'vents (tuyaux)', t: 'L’air passe dans des centaines de tuyaux : les grands font des sons graves, les petits des sons aigus.' },
];
const ST = () => { const b = S.get(); b.concert = b.concert || {}; return b.concert; };

export function open(room) {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s) => { say.textContent = s; Voice.speak(s); };
  const grid = h('div', { class: 'co-grid' });
  const draw = () => grid.replaceChildren(...INSTR.map((I) => h('button', { class: 'co-card' + (ST()[I.k] ? ' seen' : ''), type: 'button', 'data-testid': 'co-' + I.k, onclick: () => play(I) },
    h('span', { class: 'co-ic' }, I.ic), h('b', null, I.n), h('small', null, ST()[I.k] ? '✓ ' + I.fam : 'Écouter Maissa'))));
  const play = (I) => {
    UI.closeDialog(); Voice.stop();
    const after = () => { const st = ST(), first = !st[I.k]; st[I.k] = 1; if (first) { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + 1; b.coins += 2; } S.save(); open(room); talk(`${I.n} : famille des ${I.fam}. ${I.t}`); if (Object.keys(ST()).length >= INSTR.length) Sfx.win(); };
    if (room && room.cine) room.cine(I.src, after); else after();
  };
  draw();
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel co-panel' }, UI.closeButton(), h('h2', null, '🎼 Le grand concert de Maissa'),
    h('p', { class: 'prompt' }, 'Choisis un instrument : Maissa en joue pour toi, comme une vraie artiste !'), grid, say), { label: 'Le grand concert', onClose: () => Voice.stop() });
}
