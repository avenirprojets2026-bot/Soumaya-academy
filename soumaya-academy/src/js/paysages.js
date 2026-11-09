// La Vallée des Paysages de Belgique (formation géographique, évaluation P4 doc 11) : les grands paysages
// (Ardenne, sillon Sambre-et-Meuse, plateaux limoneux, littoral) et Basse / Moyenne / Haute Belgique,
// la rivière (amont, aval, rive droite, rive gauche, lit, confluent, méandre), le bloc-diagramme (versant)
// et le croquis du paysage avec sa légende.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { asset } from './asset.js';
import { SCENES } from './scenes.js';
import { burst, shuffle, ri, qcm } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const pick = (a) => a[ri(0, a.length - 1)];
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };

// ---------- 1. les grands paysages, sur le panorama ----------
const ZONES = [
  { k: 'ardenne', n: 'l’Ardenne', r: [0, 0.08, 0.28, 0.6], d: 'Des collines boisées (beaucoup de conifères), des vallées profondes et peu de villes. C’est la Haute Belgique : plus de 200 m d’altitude, jusqu’à 694 m au signal de Botrange.', b: 'Haute Belgique' },
  { k: 'sillon', n: 'le sillon Sambre-et-Meuse', r: [0.28, 0.17, 0.6, 0.63], d: 'La vallée où coulent la Sambre et la Meuse, avec de grandes villes comme Charleroi, Namur et Liège. À Namur, la Sambre se jette dans la Meuse : c’est un confluent.', b: 'entre la Moyenne et la Haute Belgique' },
  { k: 'plateaux', n: 'les plateaux limoneux', r: [0.6, 0.15, 0.8, 0.5], d: 'De grandes plaines aux sols très fertiles (le limon), avec de vastes champs de céréales et de betteraves, et des fermes. C’est la Moyenne Belgique (100 à 200 m).', b: 'Moyenne Belgique' },
  { k: 'littoral', n: 'le littoral', r: [0.8, 0.12, 1, 0.55], d: 'La côte de la mer du Nord : plages de sable, dunes et digues. Derrière, les polders : des terres plates gagnées sur la mer. C’est la Basse Belgique (moins de 100 m).', b: 'Basse Belgique' },
];
function panorama(body, talk) {
  let mode = 'decouvrir', target = null, round = 0, ok = 0; const N = 4;
  const svg = sv('svg', { viewBox: '0 0 1000 565', class: 'th-stage' });
  svg.append(sv('image', { href: asset(SCENES.vallee.img), x: 0, y: 0, width: 1000, height: 565 }));
  const head = h('p', { class: 'prompt' }, 'Touche une partie du paysage pour découvrir son nom.');
  ZONES.forEach((z) => { const [x0, y0, x1, y1] = z.r; const r = sv('rect', { x: x0 * 1000, y: y0 * 565, width: (x1 - x0) * 1000, height: (y1 - y0) * 565, class: 'th-zone', 'data-testid': 'pa-zone' }); r.addEventListener('click', () => tap(z, r)); svg.append(r); });
  const flash = (r, c) => { svg.querySelectorAll('.th-zone').forEach((x) => x.classList.remove('show', 'good')); r.classList.add(c); };
  function tap(z, r) {
    if (mode === 'decouvrir') { flash(r, 'show'); head.textContent = `${z.n[0].toUpperCase() + z.n.slice(1)} (${z.b}) : ${z.d}`; talk(`${z.n} : ${z.d}`); return; }
    if (!target) return;
    if (z === target) { ok++; star(); Sfx.coin(); flash(r, 'good'); talk(`Oui, c’est ${z.n} !`, false); } else { Sfx.tap(); talk(`Non, ça c’est ${z.n}.`, false); }
    target = null; round++; setTimeout(ask, 1800);
  }
  const ask = () => { if (round >= N) { mode = 'decouvrir'; head.textContent = `Bravo ! ${ok}/${N}.`; talk(head.textContent); quiz(); return; } target = ZONES[round]; head.textContent = `Touche ${target.n}.`; talk(head.textContent); };
  const host = h('div');
  const quiz = () => qcm(host, talk, shuffle([
    { q: 'Sur une photo, on voit des dunes et une longue plage. C’est…', opts: ['le littoral', 'l’Ardenne', 'les plateaux limoneux'], why: 'Les dunes et la plage : c’est le littoral, en Basse Belgique.' },
    { q: 'Sur une photo, on voit des collines couvertes de sapins et une rivière au fond d’une vallée profonde. C’est…', opts: ['l’Ardenne', 'le littoral', 'les polders'], why: 'Les forêts de conifères et les vallées encaissées : c’est l’Ardenne.' },
    { q: 'L’Ardenne se trouve en…', opts: ['Haute Belgique', 'Basse Belgique', 'Moyenne Belgique'], why: 'Plus de 200 m d’altitude : Haute Belgique.' },
    { q: 'Bruxelles se trouve…', opts: ['au centre du pays', 'au bord de la mer', 'en Ardenne'], why: 'Bruxelles, la capitale, est au centre de la Belgique.' },
    { q: 'Où se rejoignent la Sambre et la Meuse ?', opts: ['à Namur', 'à Ostende', 'à Arlon'], why: 'À Namur, la Sambre se jette dans la Meuse : c’est un confluent.' },
  ]).slice(0, 3), () => {});
  body.replaceChildren(head, h('div', { class: 'dr-wrap' }, svg), h('div', { class: 'actions wrap' }, h('button', { class: 'btn small primary', type: 'button', onclick: () => { mode = 'decouvrir'; } }, '🔎 Découvrir'), h('button', { class: 'btn small', type: 'button', 'data-testid': 'pa-defi', onclick: () => { mode = 'defi'; round = 0; ok = 0; ZONES.sort(() => Math.random() - 0.5); ask(); } }, '🎯 Défi')), host);
  talk('Voici la Belgique, de l’Ardenne jusqu’à la mer. Touche chaque paysage pour le découvrir.');
}

// ---------- 2. la rivière ----------
const RIV = [
  ['amont', 'l’amont', 'Le côté d’où vient l’eau : vers la source.'],
  ['aval', 'l’aval', 'Le côté où va l’eau : vers l’embouchure (la mer).'],
  ['droite', 'la rive droite', 'Quand on regarde vers l’aval (dans le sens du courant), c’est la rive à droite.'],
  ['gauche', 'la rive gauche', 'Quand on regarde vers l’aval (dans le sens du courant), c’est la rive à gauche.'],
  ['lit', 'le lit', 'Le creux où coule la rivière.'],
  ['confluent', 'le confluent', 'L’endroit où deux cours d’eau se rejoignent.'],
];
function riviere(body, talk) {
  const flipped = Math.random() < 0.5; // la rivière coule vers la droite ou vers la gauche
  const svg = sv('svg', { viewBox: '0 0 500 300', class: 'pa-river' });
  const g = sv('g', { transform: flipped ? 'translate(500 0) scale(-1 1)' : '' }); svg.append(sv('rect', { width: 500, height: 300, fill: '#8fcf6a' }), g);
  const zones = {
    gauche: sv('path', { d: 'M0,0 L500,0 L500,120 Q380,95 250,135 Q120,170 0,110 Z', fill: '#7abf5a' }),
    droite: sv('path', { d: 'M0,175 Q120,235 250,200 Q380,165 500,185 L500,300 L0,300 Z', fill: '#6aaf4a' }),
    lit: sv('path', { d: 'M0,110 Q120,170 250,135 Q380,95 500,120 L500,185 Q380,165 250,200 Q120,235 0,175 Z', fill: '#4a9ae0' }),
    affluent: sv('path', { d: 'M300,0 Q290,60 320,122 L345,116 Q315,60 330,0 Z', fill: '#4a9ae0' }),
  };
  Object.values(zones).forEach((z) => g.append(z));
  g.append(sv('circle', { cx: 330, cy: 118, r: 18, fill: 'transparent', 'data-z': 'confluent', class: 'pa-hit' }), sv('rect', { x: 0, y: 105, width: 70, height: 80, fill: 'transparent', 'data-z': 'amont', class: 'pa-hit' }), sv('rect', { x: 430, y: 105, width: 70, height: 85, fill: 'transparent', 'data-z': 'aval', class: 'pa-hit' }));
  zones.gauche.dataset.z = flipped ? 'droite' : 'gauche'; zones.droite.dataset.z = flipped ? 'gauche' : 'droite'; // un miroir inverse la gauche et la droite zones.lit.dataset.z = 'lit'; zones.affluent.dataset.z = 'lit';
  for (let i = 0; i < 4; i++) g.append(sv('path', { d: `M${70 + i * 100},${150 - (i % 2) * 10} l26,0 l-8,-7 M${96 + i * 100},${150 - (i % 2) * 10} l-8,7`, stroke: '#fff', 'stroke-width': 3, fill: 'none', class: 'pa-flow' }));
  svg.append(sv('text', { x: flipped ? 470 : 30, y: 30, style: `font-size:14px;font-weight:800;fill:#1d3a1d;text-anchor:${flipped ? 'end' : 'start'}` }, '⛰️ vers la source'), sv('text', { x: flipped ? 30 : 470, y: 30, style: `font-size:14px;font-weight:800;fill:#1d3a1d;text-anchor:${flipped ? 'start' : 'end'}` }, '🌊 vers la mer'));
  let order = shuffle(RIV), i = 0, ok = 0;
  const head = h('p', { class: 'prompt' });
  const ask = () => { if (i >= order.length) { head.textContent = `Bravo ! ${ok}/${order.length}.`; talk(head.textContent); if (ok >= 5) { Sfx.win(); burst(body); } return; } head.textContent = `Touche ${order[i][1]}. (${i + 1}/${order.length})`; talk(`Touche ${order[i][1]}.`); };
  svg.addEventListener('click', (e) => {
    const z = e.target.closest('[data-z]'); if (!z || i >= order.length) return;
    const want = order[i][0];
    if (z.dataset.z === want) { ok++; star(); Sfx.coin(); talk(`Oui ! ${order[i][2]}`, false); } else { Sfx.tap(); talk(`Non. ${order[i][1][0].toUpperCase() + order[i][1].slice(1)} : ${order[i][2]}`, false); }
    i++; setTimeout(ask, 2400);
  });
  body.replaceChildren(h('p', { class: 'muted' }, 'Les flèches blanches montrent le sens du courant. Pour trouver la rive droite et la rive gauche, imagine que tu es dans un bateau qui descend la rivière vers la mer.'), head, h('div', { class: 'dr-wrap' }, svg));
  ask();
}

// ---------- 3. le bloc-diagramme ----------
function bloc(body, talk) {
  const svg = sv('svg', { viewBox: '0 0 420 300', class: 'pa-bloc' });
  svg.append(sv('rect', { width: 420, height: 300, fill: '#cfe8ff' }),
    sv('path', { d: 'M20,120 L120,60 L210,170 L300,60 L400,120 L400,250 L20,250 Z', fill: '#8a6a4a' }),
    sv('path', { d: 'M20,120 L120,60 L210,170 L300,60 L400,120 L380,110 L300,52 L210,158 L120,52 L40,110 Z', fill: '#6aaf4a' }),
    sv('path', { d: 'M190,166 Q210,180 230,166 L222,160 Q210,170 198,160 Z', fill: '#4a9ae0' }));
  const Z = [['sommet', 'le sommet', 'le point le plus haut', 'M100,50 L140,50 L140,75 L100,75 Z'], ['versant', 'un versant', 'la pente entre le sommet et le fond de la vallée', 'M130,70 L195,150 L170,160 L120,90 Z'], ['fond', 'le fond de la vallée', 'la partie la plus basse, où coule souvent la rivière', 'M180,150 L240,150 L240,185 L180,185 Z'], ['plateau', 'le plateau', 'une étendue haute et plate', 'M330,70 L400,105 L400,125 L330,90 Z']];
  Z.forEach(([k, , , d]) => svg.append(sv('path', { d, fill: 'transparent', 'data-z': k, class: 'pa-hit', 'data-testid': 'pa-bloc' })));
  let order = shuffle(Z), i = 0, ok = 0; const head = h('p', { class: 'prompt' });
  const ask = () => { if (i >= order.length) { head.textContent = `Bravo ! ${ok}/${order.length}.`; talk(head.textContent); return; } head.textContent = `Sur ce bloc-diagramme, touche ${order[i][1]}.`; talk(head.textContent); };
  svg.addEventListener('click', (e) => { const z = e.target.closest('[data-z]'); if (!z || i >= order.length) return; if (z.dataset.z === order[i][0]) { ok++; star(); Sfx.coin(); talk(`Oui : ${order[i][1]}, c’est ${order[i][2]}.`, false); } else { Sfx.tap(); talk(`Non : ${order[i][1]}, c’est ${order[i][2]}.`, false); } i++; setTimeout(ask, 2200); });
  body.replaceChildren(h('p', { class: 'muted' }, 'Un bloc-diagramme montre un paysage en relief, comme un morceau de gâteau découpé.'), head, h('div', { class: 'dr-wrap' }, svg));
  ask();
}

// ---------- 4. le croquis et sa légende ----------
function croquis(body, talk) {
  const LEG = [['foret', 'forêt', '#2f7a3a'], ['champs', 'champs', '#f2d06a'], ['riviere', 'rivière', '#3a7ad8'], ['village', 'village', '#d8604a']];
  const svg = sv('svg', { viewBox: '0 0 400 260', class: 'pa-croquis' });
  const REG = [['foret', 'M0,0 L160,0 L140,90 L0,120 Z', '🌲'], ['champs', 'M160,0 L400,0 L400,110 L250,120 L140,90 Z', '🌾'], ['riviere', 'M0,120 L140,90 L250,120 L400,110 L400,140 L250,150 L140,122 L0,150 Z', '〰️'], ['village', 'M220,160 L320,160 L320,240 L220,240 Z', '🏠'], ['champs', 'M0,150 L140,122 L250,150 L400,140 L400,260 L0,260 Z', '']];
  const filled = new Set(); let col = null;
  REG.forEach(([k, d, ic], idx) => { const p = sv('path', { d, fill: '#fff', stroke: '#2b2440', 'stroke-width': 2, 'data-k': k, 'data-testid': 'pa-reg' }); p.addEventListener('click', () => { if (!col) { talk('Choisis d’abord une couleur dans la légende.', false); return; } p.setAttribute('fill', col[2]); if (col[0] === k) { filled.add(idx); Sfx.bloop(); } else { filled.delete(idx); Sfx.tap(); talk(`Hum… cette zone n’est pas ${col[1] === 'champs' ? 'un champ' : col[1] === 'forêt' ? 'une forêt' : col[1] === 'rivière' ? 'la rivière' : 'le village'}. Regarde le petit dessin.`, false); } if (filled.size === REG.length) { star(2); Sfx.win(); burst(body); talk('Magnifique croquis ! Chaque zone a la couleur de sa légende.'); } }); svg.append(p); if (ic) { const bb = d.match(/[\d.]+/g).map(Number); const xs = bb.filter((_, j) => j % 2 === 0), ys = bb.filter((_, j) => j % 2 === 1); svg.append(sv('text', { x: xs.reduce((a, b) => a + b, 0) / xs.length, y: ys.reduce((a, b) => a + b, 0) / ys.length + 6, style: 'text-anchor:middle;font-size:20px;pointer-events:none' }, ic)); } });
  const legend = LEG.map((l) => h('button', { class: 'pa-leg', type: 'button', 'data-testid': 'pa-leg', onclick: (e) => { col = l; legend.forEach((b) => b.classList.remove('on')); e.currentTarget.classList.add('on'); } }, h('span', { style: `background:${l[2]}` }), l[1]));
  body.replaceChildren(h('p', { class: 'prompt' }, 'Colorie le croquis simplifié du paysage en suivant la légende : choisis une couleur, puis touche la zone.'), h('div', { class: 'mi-lab' }, svg, h('div', { class: 'pa-legend' }, h('b', null, 'Légende'), ...legend)));
  talk('Colorie le croquis du paysage avec les couleurs de la légende.');
}

export function open(tab = 'panorama') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['panorama', '🇧🇪 Les paysages', panorama], ['riviere', '🌊 La rivière', riviere], ['bloc', '⛰️ Le bloc-diagramme', bloc], ['croquis', '🖍️ Le croquis', croquis]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'pa-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel pa-panel' }, UI.closeButton(), h('h2', null, '🇧🇪 La Vallée des Paysages de Belgique'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Vallée de Belgique', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
