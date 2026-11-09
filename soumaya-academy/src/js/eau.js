// Vallée de Belgique : « Le voyage de la rivière » (de la source à la mer, en barque) et « Le littoral belge » (horizon, plage, dunes,
// digue, épis, phare, port, marées). Notions de P4 en géographie, avec animations SVG et petits défis.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, qcm } from './workshop.js';

const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(typeof c === 'string' ? document.createTextNode(c) : c)); return e; };
const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.eau = b.eau || {}; return b.eau; };

// ---------- la rivière : vue de dessus, la barque descend de la source à la mer ----------
const RIVER = 'M60,40 C90,70 70,110 110,140 C150,170 230,150 260,190 C290,230 210,260 250,300 C290,340 400,320 440,350 C480,380 520,420 600,430 L760,440';
const TRIB = 'M330,40 C320,110 360,170 300,215';
const ETAPES = [
  { k: 'source', t: 0.0, n: '⛰️ La source', d: 'C’est là que la rivière naît, en général dans les montagnes ou les collines : l’eau sort de la terre.' },
  { k: 'amont', t: 0.12, n: '⬆️ L’amont', d: 'L’amont, c’est le côté de la source, d’où vient l’eau. Ici, la pente est forte et le courant rapide.' },
  { k: 'courant', t: 0.2, n: '➡️ Le courant', d: 'L’eau coule toujours de l’amont vers l’aval, en descendant. C’est le courant qui pousse notre barque !' },
  { k: 'lit', t: 0.28, n: '🛏️ Le lit', d: 'Le lit, c’est le creux dans lequel coule la rivière, entre ses deux rives.' },
  { k: 'rives', t: 0.36, n: '↔️ Rive gauche, rive droite', d: 'On regarde toujours vers l’aval, dans le sens du courant : la rive gauche est à notre gauche, la rive droite à notre droite. Si on remonte la rivière, elles ne changent pas de nom !' },
  { k: 'versants', t: 0.44, n: '⛰️ Les versants', d: 'Les versants sont les pentes des collines de chaque côté de la vallée. Le fond de la vallée, c’est là où coule la rivière.' },
  { k: 'confluent', t: 0.5, n: '🤝 Affluent et confluent', d: 'Un affluent est une rivière qui se jette dans une autre. L’endroit où elles se rejoignent s’appelle le confluent. À Namur, la Sambre se jette dans la Meuse !' },
  { k: 'meandre', t: 0.62, n: '〰️ Le méandre', d: 'En plaine, la pente est faible : la rivière ralentit et dessine de grandes boucles, les méandres.' },
  { k: 'ecluse', t: 0.78, n: '🚪 L’écluse', d: 'L’écluse est un « ascenseur à bateaux » : on ferme les portes, on fait monter ou descendre l’eau, et le bateau passe d’un niveau à l’autre.' },
  { k: 'aval', t: 0.88, n: '⬇️ L’aval', d: 'L’aval, c’est le côté où va l’eau, vers la mer.' },
  { k: 'embouchure', t: 1.0, n: '🌊 L’embouchure', d: 'L’embouchure, c’est l’endroit où la rivière se jette dans la mer. Son voyage est terminé !' },
];
function riviere(body, talk) {
  const svg = sv('svg', { viewBox: '0 0 800 470', class: 'ea-svg' });
  const defs = sv('defs', null, sv('linearGradient', { id: 'ea-hill', x1: 0, y1: 0, x2: 0, y2: 1 }, sv('stop', { offset: 0, 'stop-color': '#7a9a5a' }), sv('stop', { offset: 1, 'stop-color': '#a8d07a' })));
  svg.append(defs, sv('rect', { width: 800, height: 470, fill: '#b8e08a' }),
    sv('path', { d: 'M0,0 L200,0 C160,60 120,40 90,100 C60,150 20,120 0,170 Z', fill: '#8a7a5a' }), sv('path', { d: 'M0,0 L160,0 C130,40 100,30 70,70 L0,110 Z', fill: '#a89a7a' }),
    sv('path', { d: 'M700,440 C720,380 760,360 800,350 L800,470 L640,470 Z', fill: '#f5dd9a' }), sv('path', { d: 'M740,440 C760,400 780,390 800,385 L800,470 L720,470 Z', fill: '#3a8ad0' }),
    sv('path', { d: RIVER, fill: 'none', stroke: '#2a6ab0', 'stroke-width': 30, 'stroke-linecap': 'round' }),
    sv('path', { d: TRIB, fill: 'none', stroke: '#2a6ab0', 'stroke-width': 16, 'stroke-linecap': 'round' }),
    sv('path', { d: RIVER, fill: 'none', stroke: '#5ab0f0', 'stroke-width': 22, 'stroke-linecap': 'round' }),
    sv('path', { d: TRIB, fill: 'none', stroke: '#5ab0f0', 'stroke-width': 10, 'stroke-linecap': 'round' }),
    sv('path', { d: RIVER, fill: 'none', stroke: '#e6f6ff', 'stroke-width': 3, 'stroke-dasharray': '14 22', class: 'ea-flow' }),
    sv('path', { d: TRIB, fill: 'none', stroke: '#e6f6ff', 'stroke-width': 2, 'stroke-dasharray': '10 18', class: 'ea-flow' }),
    sv('text', { x: 18, y: 28, class: 'ea-lbl' }, 'Montagne'), sv('text', { x: 690, y: 465, class: 'ea-lbl' }, 'Mer du Nord'), sv('text', { x: 340, y: 30, class: 'ea-lbl' }, 'affluent'));
  // l'écluse : deux portes sur la rivière
  const path = svg.querySelector('path[d="' + RIVER + '"]');
  const lockG = sv('g', { class: 'ea-lock' }); svg.append(lockG);
  const boat = sv('g', { class: 'ea-boat' }, sv('path', { d: 'M-16,0 Q0,12 16,0 L12,-4 L-12,-4 Z', fill: '#8a4a1a', stroke: '#4a2a0a' }), sv('circle', { cx: 0, cy: -10, r: 6, fill: '#f0c090' }), sv('path', { d: 'M-5,-6 L5,-6 L4,4 L-4,4 Z', fill: '#2a4ac0' }));
  const pin = sv('g', { class: 'ea-pin' }); svg.append(pin, boat);
  const box = h('div', { class: 'ea-step' }), next = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ea-next' }, 'Descendre la rivière ▶'), q = h('div');
  let i = -1, anim = 0;
  const L = path.getTotalLength();
  const at = (t) => { const p = path.getPointAtLength(L * t), p2 = path.getPointAtLength(Math.min(L, L * t + 2)); return { x: p.x, y: p.y, a: Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI }; };
  const place = (t) => { const p = at(t); boat.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${p.a}) scale(2)`); };
  const lockAt = at(0.78); lockG.append(sv('g', { transform: `translate(${lockAt.x} ${lockAt.y}) rotate(${lockAt.a})` }, sv('rect', { x: -22, y: -18, width: 6, height: 36, fill: '#6a4a2a', class: 'ea-gate a' }), sv('rect', { x: 16, y: -18, width: 6, height: 36, fill: '#6a4a2a', class: 'ea-gate b' }), sv('rect', { x: -16, y: -14, width: 32, height: 28, fill: '#5ab0f0', class: 'ea-lockwater' })));
  const go = () => {
    i++; if (i >= ETAPES.length) { next.remove(); defi(); return; }
    const E = ETAPES[i], t0 = i ? ETAPES[i - 1].t : 0, t1 = E.t, start = performance.now(), dur = 1400;
    cancelAnimationFrame(anim);
    const step = (now) => { const u = Math.min(1, (now - start) / dur); place(t0 + (t1 - t0) * u); if (u < 1) anim = requestAnimationFrame(step); else arrive(E); };
    anim = requestAnimationFrame(step); next.disabled = true;
  };
  const arrive = (E) => {
    const p = at(E.t); pin.replaceChildren(sv('circle', { cx: p.x, cy: p.y, r: 30, class: 'ea-ping' }));
    if (E.k === 'rives') { const a = (p.a - 90) * Math.PI / 180; pin.append(sv('text', { x: p.x + Math.cos(a) * 62, y: p.y + Math.sin(a) * 62, class: 'ea-tag' }, 'rive gauche'), sv('text', { x: p.x - Math.cos(a) * 62, y: p.y - Math.sin(a) * 62 + 10, class: 'ea-tag' }, 'rive droite')); }
    if (E.k === 'ecluse') { svg.classList.add('lock-on'); setTimeout(() => svg.classList.remove('lock-on'), 3500); }
    box.replaceChildren(h('b', null, E.n), h('p', null, E.d)); talk(E.d); Sfx.bloop(); next.disabled = false;
    if (i === ETAPES.length - 1) next.textContent = 'Le défi des rives ▶';
  };
  next.onclick = go;
  const defi = () => {
    talk('Le défi : réponds aux questions de la rivière !');
    qcm(q, talk, shuffle([
      { q: 'D’où vient l’eau d’une rivière ?', opts: ['De la source', 'De l’embouchure', 'De l’écluse'], why: 'La rivière naît à la source, puis descend vers l’aval.' },
      { q: 'Dans quel sens coule le courant ?', opts: ['De l’amont vers l’aval', 'De l’aval vers l’amont', 'Il change chaque jour'], why: 'L’eau descend toujours : de l’amont (la source) vers l’aval (la mer).' },
      { q: 'Pour trouver la rive gauche, je regarde…', opts: ['Vers l’aval, dans le sens du courant', 'Vers la source', 'Vers le nord'], why: 'On se place toujours dans le sens du courant.' },
      { q: 'Comment s’appelle une rivière qui se jette dans une autre ?', opts: ['Un affluent', 'Un confluent', 'Un méandre'], why: 'L’affluent se jette dans la rivière ; l’endroit de la rencontre est le confluent.' },
      { q: 'À quoi sert une écluse ?', opts: ['À faire monter ou descendre les bateaux', 'À arrêter les poissons', 'À fabriquer de l’électricité'], why: 'C’est un ascenseur à bateaux.' },
      { q: 'Où la rivière se jette-t-elle dans la mer ?', opts: ['À l’embouchure', 'À la source', 'Au versant'], why: 'L’embouchure, c’est la fin du voyage.' },
    ]).slice(0, 5), (ok) => { star(ok >= 4 ? 2 : 1); const st = ST(); st.riviere = true; S.save(); if (ok >= 4) { Sfx.win(); burst(q); } });
  };
  place(0);
  body.replaceChildren(h('p', { class: 'prompt' }, 'Monte dans la barque et descends la rivière, de la source jusqu’à la mer !'), h('div', { class: 'ea-wrap' }, svg, h('div', { class: 'ea-side' }, box, next)), q);
  box.replaceChildren(h('b', null, '🚣 Prête ?'), h('p', null, 'Nous partons de la source, tout en haut dans la montagne.'));
  talk('Monte dans la barque ! Nous allons descendre la rivière, de la source jusqu’à la mer.');
  return () => cancelAnimationFrame(anim);
}

// ---------- le littoral : à toucher dans un paysage de bord de mer ----------
const LIT = [
  { k: 'horizon', n: '➖ L’horizon', d: 'La ligne où le ciel semble toucher la mer. On ne peut jamais l’atteindre : plus on avance, plus elle recule !', z: { x: 0, y: 118, w: 800, h: 20 } },
  { k: 'mer', n: '🌊 La mer du Nord', d: 'La Belgique a une seule mer : la mer du Nord. Sa côte mesure seulement 67 kilomètres.', z: { x: 0, y: 140, w: 800, h: 80 } },
  { k: 'phare', n: '🗼 Le phare', d: 'Une tour avec une lumière très puissante qui tourne. La nuit, elle guide les bateaux et les prévient du danger, pour qu’ils ne s’échouent pas sur la côte.', z: { x: 620, y: 40, w: 50, h: 170 } },
  { k: 'plage', n: '🏖️ La plage', d: 'Une bande de sable au bord de la mer. La partie que la mer recouvre à marée haute et découvre à marée basse s’appelle l’estran.', z: { x: 0, y: 220, w: 800, h: 60 } },
  { k: 'epi', n: '🪵 Les épis (brise-lames)', d: 'Des rangées de pieux ou de pierres plantées dans la mer : elles cassent les vagues et empêchent la mer d’emporter le sable.', z: { x: 140, y: 200, w: 60, h: 70 } },
  { k: 'digue', n: '🧱 La digue', d: 'Un grand mur le long de la côte : il protège les maisons des vagues et des tempêtes. On s’y promène à pied ou à vélo.', z: { x: 0, y: 280, w: 800, h: 40 } },
  { k: 'dunes', n: '⛰️ Les dunes', d: 'Des collines de sable poussées par le vent, couvertes d’oyats (de grandes herbes) qui les retiennent. Elles protègent la côte : on ne marche pas dessus !', z: { x: 470, y: 240, w: 140, h: 50 } },
  { k: 'port', n: '⚓ Le port', d: 'Un abri pour les bateaux : on y charge et décharge les marchandises, et les pêcheurs y ramènent leurs poissons. Zeebruges et Ostende sont des ports belges.', z: { x: 680, y: 160, w: 120, h: 80 } },
];
function littoral(body, talk) {
  let haute = true;
  const svg = sv('svg', { viewBox: '0 0 800 330', class: 'ea-svg ea-lit' });
  const sea = sv('g', { class: 'ea-sea' }, sv('rect', { x: 0, y: 128, width: 800, height: 120, fill: '#3a8ad0' }), sv('path', { d: 'M0,150 Q20,145 40,150 T80,150 T120,150 T160,150 T200,150 T240,150 T280,150 T320,150 T360,150 T400,150 T440,150 T480,150 T520,150 T560,150 T600,150 T640,150 T680,150 T720,150 T760,150 T800,150 T840,150', stroke: '#bfe6ff', fill: 'none', 'stroke-width': 2, class: 'ea-wave' }), sv('path', { d: 'M0,190 Q25,184 50,190 T100,190 T150,190 T200,190 T250,190 T300,190 T350,190 T400,190 T450,190 T500,190 T550,190 T600,190 T650,190 T700,190 T750,190 T800,190 T850,190', stroke: '#e6f6ff', fill: 'none', 'stroke-width': 2, class: 'ea-wave b' }));
  const beam = sv('path', { d: 'M645,62 L800,30 L800,95 Z', fill: '#fff6b0', opacity: 0.55, class: 'ea-beam' });
  svg.append(sv('defs', null, sv('linearGradient', { id: 'ea-sky', x1: 0, y1: 0, x2: 0, y2: 1 }, sv('stop', { offset: 0, 'stop-color': '#8ac8ff' }), sv('stop', { offset: 1, 'stop-color': '#ffe2b8' }))),
    sv('rect', { width: 800, height: 130, fill: 'url(#ea-sky)' }), sv('circle', { cx: 110, cy: 70, r: 26, fill: '#fff2a0' }),
    sea, sv('line', { x1: 0, y1: 128, x2: 800, y2: 128, stroke: '#1a4a8a', 'stroke-width': 2, class: 'ea-hz' }),
    sv('path', { d: 'M520,118 l20,0 l-6,6 l-10,0 Z M528,118 l0,-14 l8,10 Z', fill: '#fff' }),
    sv('rect', { x: 0, y: 225, width: 800, height: 60, fill: '#f3d896', class: 'ea-sand' }), sv('rect', { x: 0, y: 230, width: 800, height: 22, fill: '#d9bc78', opacity: 0.6, class: 'ea-estran' }),
    ...[150, 170, 190].map((x) => sv('rect', { x, y: 200, width: 6, height: 62, fill: '#6a4a2a', class: 'ea-epi' })),
    sv('path', { d: 'M460,286 Q490,215 535,238 Q575,205 620,286 Z', fill: '#d9b46a', stroke: '#b8924a', 'stroke-width': 2 }), ...[490, 520, 545, 575].map((x) => sv('path', { d: `M${x},258 l-6,-16 M${x},258 l0,-18 M${x},258 l6,-15`, stroke: '#7a9a3a', 'stroke-width': 2 })),
    sv('rect', { x: 0, y: 285, width: 800, height: 45, fill: '#b9a68a' }), sv('rect', { x: 0, y: 283, width: 800, height: 6, fill: '#8a7a6a' }),
    ...[30, 110, 250, 330, 420].map((x, k) => sv('g', null, sv('rect', { x, y: 290 - 26 - (k % 2) * 8, width: 60, height: 26 + (k % 2) * 8, fill: ['#e8d0b0', '#d8b8a0', '#f0e0c0'][k % 3] }), sv('path', { d: `M${x - 4},${290 - 26 - (k % 2) * 8} l34,-16 l34,16 Z`, fill: '#a0482a' }))),
    sv('rect', { x: 690, y: 175, width: 110, height: 55, fill: '#7a7a8a' }), sv('path', { d: 'M705,175 l0,-30 M705,145 l25,28 M745,175 l0,-24', stroke: '#444', 'stroke-width': 3 }), sv('path', { d: 'M700,205 l40,0 l-8,10 l-24,0 Z', fill: '#c04a2a' }),
    sv('rect', { x: 632, y: 70, width: 26, height: 150, fill: '#fff' }), ...[0, 1, 2].map((k) => sv('rect', { x: 632, y: 90 + k * 44, width: 26, height: 20, fill: '#d02a2a' })), sv('rect', { x: 628, y: 56, width: 34, height: 16, fill: '#ffe680', class: 'ea-lamp' }), sv('path', { d: 'M626,56 l19,-14 l19,14 Z', fill: '#333' }),
    beam);
  const hits = LIT.map((L) => sv('rect', { x: L.z.x, y: L.z.y, width: L.z.w, height: L.z.h, class: 'ea-hit', 'data-k': L.k }));
  hits.sort((a, b) => b.getAttribute('width') * b.getAttribute('height') - a.getAttribute('width') * a.getAttribute('height')).forEach((r) => svg.append(r));
  const box = h('div', { class: 'ea-step' }), seen = new Set(), q = h('div');
  const tide = h('button', { class: 'btn', type: 'button', 'data-testid': 'ea-tide', onclick: () => { haute = !haute; svg.classList.toggle('basse', !haute); tide.textContent = haute ? '🌊 Marée basse' : '🌊 Marée haute'; talk(haute ? 'Marée haute : la mer monte et recouvre l’estran.' : 'Marée basse : la mer s’est retirée, on voit l’estran. Deux fois par jour, la mer monte et descend : ce sont les marées.'); Sfx.bloop(); } }, '🌊 Marée basse');
  const night = h('button', { class: 'btn', type: 'button', 'data-testid': 'ea-night', onclick: () => { svg.classList.toggle('nuit'); talk(svg.classList.contains('nuit') ? 'La nuit tombe : regarde le phare ! Sa lumière tourne pour guider les bateaux.' : 'Le jour revient.'); } }, '🌙 Jour / nuit');
  svg.addEventListener('click', (e) => {
    const r = e.target.closest('.ea-hit'); if (!r) return; const L = LIT.find((x) => x.k === r.dataset.k);
    box.replaceChildren(h('b', null, L.n), h('p', null, L.d)); talk(L.d); Sfx.bloop(); seen.add(L.k); r.classList.add('seen');
    if (seen.size === LIT.length && !q.childElementCount) defi();
  });
  const defi = () => qcm(q, talk, shuffle([
    { q: 'À quoi sert un phare ?', opts: ['À guider les bateaux la nuit', 'À éclairer la plage pour les promeneurs', 'À chauffer la mer'], why: 'Sa lumière tournante prévient les bateaux du danger et les aide à se repérer.' },
    { q: 'Qu’est-ce que l’horizon ?', opts: ['La ligne où le ciel semble toucher la mer', 'Le bord de la plage', 'Le mur de la digue'], why: 'On ne peut jamais l’atteindre : il recule quand on avance.' },
    { q: 'Que protègent les dunes ?', opts: ['La côte et les terres derrière elles', 'Les bateaux', 'Les poissons'], why: 'Elles arrêtent le vent et la mer ; les oyats retiennent le sable.' },
    { q: 'Comment s’appelle la mer de la Belgique ?', opts: ['La mer du Nord', 'La mer Méditerranée', 'L’océan Atlantique'], why: 'La côte belge borde la mer du Nord.' },
    { q: 'Que voit-on à marée basse ?', opts: ['L’estran, la partie de plage découverte', 'Plus de sable du tout', 'L’horizon qui descend'], why: 'La mer se retire et découvre l’estran.' },
  ]).slice(0, 4), (ok) => { star(ok >= 3 ? 2 : 1); const st = ST(); st.littoral = true; S.save(); if (ok >= 3) { Sfx.win(); burst(q); } });
  body.replaceChildren(h('p', { class: 'prompt' }, 'Touche chaque partie du paysage pour la découvrir. Essaie aussi la marée et la nuit !'), h('div', { class: 'actions wrap' }, tide, night), h('div', { class: 'ea-wrap' }, svg, box), q);
  box.replaceChildren(h('b', null, '🏖️ Le littoral belge'), h('p', null, 'Le littoral, c’est la zone où la terre rencontre la mer. Touche le phare, l’horizon, la plage…'));
  talk('Bienvenue au bord de la mer ! Le littoral, c’est là où la terre rencontre la mer. Touche chaque partie du paysage.');
}

export function open(tab = 'riviere') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div'); let stop = null;
  const T = [['riviere', '🚣 Le voyage de la rivière', riviere], ['littoral', '🗼 Le littoral et le phare', littoral]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'ea-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ea-panel' }, UI.closeButton(), h('h2', null, tab === 'littoral' ? '🗼 Au bord de la mer' : '🚣 De la source à la mer'), h('div', { class: 'actions wrap' }, ...tabs), body, say),
    { label: 'La rivière et la mer', onClose: () => { Voice.stop(); if (stop) stop(); } });
  function go(k) { if (stop) { stop(); stop = null; } Voice.stop(); tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); stop = T.find((x) => x[0] === k)[2](body, talk) || null; }
  go(tab);
}

// ---------- dans le décor : reflets qui suivent le courant, petite barque, faisceau du phare ----------
export function mountValley(world, room) {
  const RIV = [[30, 35], [30.2, 40.5], [31, 44.5], [33.9, 47], [37.9, 48.7], [42.9, 51], [47.8, 51], [50.8, 49.2], [54.8, 47], [56.8, 44.5], [58.7, 40.5], [59.2, 37], [58.2, 34.3]];
  const LOW = [[48.6, 52.6], [51.6, 56.1], [55.6, 59.6], [60.5, 61.4], [64.5, 58.8]];
  const layer = document.createElement('div'); layer.className = 'va-fx'; layer.setAttribute('aria-hidden', 'true'); world.append(layer);
  const mk = (cls) => { const e = document.createElement('i'); e.className = cls; layer.append(e); return e; };
  const glints = [];
  for (const [line, n] of [[RIV, 14], [LOW, 6]]) for (let i = 0; i < n; i++) glints.push({ e: mk('va-glint'), line, t: i / n, sp: 0.035 + Math.random() * 0.02 });
  const boat = mk('va-boat'); boat.textContent = '🛶';
  const beam = mk('va-beam'), lamp = mk('va-lamp');
  let raf = 0, last = 0, bt = 0;
  const pos = (line, t) => { const n = line.length - 1, f = Math.max(0, Math.min(0.9999, t)) * n, i = Math.floor(f), u = f - i; return [line[i][0] + (line[i + 1][0] - line[i][0]) * u, line[i][1] + (line[i + 1][1] - line[i][1]) * u, Math.atan2(line[i + 1][1] - line[i][1], line[i + 1][0] - line[i][0])]; };
  const loop = (now) => {
    raf = requestAnimationFrame(loop); const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    for (const g of glints) { g.t = (g.t + g.sp * dt) % 1; const [x, y] = pos(g.line, g.t); const a = Math.sin(g.t * Math.PI); g.e.style.left = x + '%'; g.e.style.top = y + '%'; g.e.style.opacity = (0.25 + 0.75 * a * (0.6 + 0.4 * Math.sin(now / 180 + g.t * 40))).toFixed(2); }
    bt = (bt + dt * 0.012) % 1; const [bx, by, ba] = pos(RIV, bt); boat.style.left = bx + '%'; boat.style.top = by + '%'; boat.style.transform = `translate(-50%,-70%) scaleX(${Math.cos(ba) >= 0 ? -1 : 1})`;
    beam.style.transform = `translateY(-50%) rotate(${Math.sin(now / 1400) * 70}deg)`;
  };
  if (room.motion !== false) raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); layer.remove(); };
}
