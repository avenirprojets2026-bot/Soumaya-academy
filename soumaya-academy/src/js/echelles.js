// De l'infiniment grand à l'infiniment petit : un zoom qui relie le télescope au microscope,
// avec les unités de longueur (km, m, cm, mm) et des comparaisons de tailles.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, qcm } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const NIV = [
  { ic: '🌌', n: 'Notre galaxie, la Voie lactée', t: 'si grande que la lumière met 100 000 ans à la traverser !', bg: 'radial-gradient(circle,#4a2a8a,#0a0620)' },
  { ic: '☀️', n: 'Le système solaire', t: 'le Soleil et ses 8 planètes. Neptune est à 4 milliards et demi de kilomètres du Soleil.', bg: 'radial-gradient(circle,#3a2a10,#05030a)' },
  { ic: '🌍', n: 'La Terre', t: 'environ 40 000 km pour en faire le tour.', bg: 'radial-gradient(circle,#1a3a7a,#020410)' },
  { ic: '🇧🇪', n: 'La Belgique', t: 'environ 300 km d’Ostende à Arlon.', bg: 'linear-gradient(#7ac0ff,#4a9a5a)' },
  { ic: '🏰', n: 'Le château', t: 'environ 100 mètres de long.', bg: 'linear-gradient(#9ad0ff,#7ac06a)' },
  { ic: '👧', n: 'Soumaya', t: 'environ 1 mètre 35 (135 cm).', bg: 'linear-gradient(#fff3c4,#f2d07a)' },
  { ic: '✋', n: 'Une main', t: 'environ 15 cm.', bg: 'linear-gradient(#ffe0d0,#f2b8a0)' },
  { ic: '🐜', n: 'Une fourmi', t: 'environ 5 mm : on la voit encore à l’œil nu.', bg: 'linear-gradient(#f2e0b0,#c8a86a)' },
  { ic: '🔬', n: 'Une cellule', t: 'environ 0,1 mm : il faut un microscope pour la voir !', bg: 'radial-gradient(circle,#f6efe2,#d8b8c8)' },
  { ic: '🦠', n: 'Une bactérie', t: '1 000 fois plus petite qu’un millimètre (1 micromètre).', bg: 'radial-gradient(circle,#f4eef8,#b8a8d8)' },
  { ic: '🧬', n: 'Un virus', t: 'encore 10 à 100 fois plus petit : il faut un microscope électronique.', bg: 'radial-gradient(circle,#d8f0e0,#4a6a5a)' },
];
function zoom(body, talk) {
  let i = 0;
  const scene = h('div', { class: 'ec-scene' }), lab = h('div', { class: 'ec-lab' }), bar = h('div', { class: 'ec-bar' }, ...NIV.map((n, k) => h('button', { class: 'ec-dot', type: 'button', title: n.n, onclick: () => go(k) }, n.ic)));
  const go = (k) => {
    const dir = k > i ? 'in' : 'out'; i = Math.max(0, Math.min(NIV.length - 1, k)); const n = NIV[i];
    scene.style.background = n.bg; scene.replaceChildren(h('span', { class: 'ec-ic ' + dir }, n.ic));
    lab.replaceChildren(h('b', null, n.n), ' : ', n.t);
    bar.querySelectorAll('.ec-dot').forEach((b, j) => b.classList.toggle('on', j === i));
    talk(`${n.n} : ${n.t}`); Sfx.tap();
  };
  body.replaceChildren(h('p', { class: 'muted' }, '🔭 Du télescope au microscope : zoome de la plus grande chose de l’univers jusqu’à la plus petite.'), scene, lab, bar,
    h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', 'data-testid': 'ec-out', onclick: () => go(i - 1) }, '🔭 Dézoomer'), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ec-in', onclick: () => go(i + 1) }, '🔬 Zoomer')));
  go(0);
}
const SORT = [['🐜 une fourmi', 5], ['🐘 un éléphant', 3000], ['🏰 un château', 100000], ['✋ une main', 150], ['👧 Soumaya', 1350], ['🦠 une bactérie', 0.001], ['🍎 une pomme', 80], ['🚌 un bus', 12000]];
function ranger(body, talk) {
  const pick = shuffle(SORT).slice(0, 5), want = [...pick].sort((a, b) => a[1] - b[1]), got = [];
  const slots = h('div', { class: 'co-order' }), pool = h('div', { class: 'vi-pool' });
  const draw = () => slots.replaceChildren(...want.map((_, k) => h('div', { class: 'co-oslot' + (got[k] ? ' full' : '') }, `${k + 1}. ${got[k] ? got[k][0] : '…'}`)));
  pool.replaceChildren(...shuffle(pick).map((it) => h('button', { class: 'vi-chip', type: 'button', 'data-testid': 'ec-chip', onclick: (e) => {
    if (it === want[got.length]) { got.push(it); e.currentTarget.disabled = true; Sfx.bloop(); draw(); if (got.length === want.length) { star(2); Sfx.win(); burst(body); talk('Bravo ! Du plus petit au plus grand !'); } }
    else { Sfx.tap(); talk('Non : cherche le plus petit de ceux qui restent.', false); }
  } }, it[0])));
  body.replaceChildren(h('p', { class: 'prompt' }, 'Range du plus PETIT au plus GRAND.'), slots, pool, h('button', { class: 'btn small', type: 'button', onclick: () => ranger(body, talk) }, '↻ Autres objets'));
  draw(); talk('Range ces objets du plus petit au plus grand.');
}
function unites(body, talk) {
  const host = h('div'); body.replaceChildren(h('div', { class: 'vi-doc' }, h('b', null, 'Les unités de longueur : '), '1 km = 1 000 m · 1 m = 100 cm · 1 cm = 10 mm'), host);
  qcm(host, talk, shuffle([
    { q: 'Quelle unité choisis-tu pour mesurer la distance entre Bruxelles et Namur ?', opts: ['le kilomètre (km)', 'le centimètre (cm)', 'le millimètre (mm)'], why: 'Pour les grandes distances : le kilomètre.' },
    { q: 'Quelle unité choisis-tu pour mesurer une fourmi ?', opts: ['le millimètre (mm)', 'le kilomètre (km)', 'le mètre (m)'], why: 'Pour les toutes petites choses : le millimètre.' },
    { q: 'Quelle unité pour mesurer la taille de Soumaya ?', opts: ['le centimètre (cm) ou le mètre (m)', 'le kilomètre (km)', 'le millimètre (mm)'], why: 'Elle mesure environ 135 cm, soit 1,35 m.' },
    { q: '1 mètre, c’est combien de centimètres ?', opts: ['100 cm', '10 cm', '1 000 cm'], why: '1 m = 100 cm.' },
    { q: '1 kilomètre, c’est combien de mètres ?', opts: ['1 000 m', '100 m', '10 m'], why: '1 km = 1 000 m.' },
    { q: '3 cm, c’est combien de millimètres ?', opts: ['30 mm', '3 mm', '300 mm'], why: '1 cm = 10 mm, donc 3 cm = 30 mm.' },
    { q: 'Pour voir une cellule, on utilise…', opts: ['un microscope', 'un télescope', 'des jumelles'], why: 'Le microscope grossit les choses minuscules ; le télescope rapproche les choses lointaines.' },
  ]).slice(0, 5), () => host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => unites(body, talk) }, '↻ Encore'))));
}
export function open(tab = 'zoom') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['zoom', '🔭🔬 Le grand zoom', zoom], ['ranger', '📏 Du plus petit au plus grand', ranger], ['unites', '📐 Les unités de longueur', unites]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'ec-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel' }, UI.closeButton(), h('h2', null, '🔭 De l’infiniment grand à l’infiniment petit 🔬'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Infiniment grand et petit', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
