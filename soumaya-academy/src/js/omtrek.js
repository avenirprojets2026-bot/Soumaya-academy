// Atelier « Le périmètre — De omtrek » (Atelier des merveilles) : leçon bilingue + 8 entraînements
// inspirés des fiches de classe P4 (exercices recréés, nouveaux nombres) : calculer avec des mesures à virgule,
// entourer le bon périmètre, ranger, comparer, même périmètre, tracer sur quadrillage, ligne brisée, vrai/faux.
import { h } from './ui.js';
import * as Sfx from './sfx.js';
import * as WS from './workshop.js';
import { porte } from './quest.js';

const { shell, burst, star, shuffle, ri, log } = WS;
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };
const pick = (a) => a[ri(0, a.length - 1)];
let NL = false; // version néerlandaise (Maison du Néerlandais)
const tr = (fr, nl) => (NL ? nl : fr);
const f10 = (x) => String(x / 10).replace('.', ','); // dixièmes de cm → « 4,2 »
const cm = (x) => `${f10(x)} cm`;
const seg = (a, b) => Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]));
const kids = (...a) => a.filter((x) => x != null && x !== false);
const perim = (v) => v.reduce((t, p, i) => t + seg(p, v[(i + 1) % v.length]), 0);
const speakNL = (t) => { try { if (!('speechSynthesis' in window)) return; const u = new SpeechSynthesisUtterance(t); u.lang = 'nl-BE'; const vs = speechSynthesis.getVoices(); u.voice = vs.find((v) => /nl[-_]BE/i.test(v.lang)) || vs.find((v) => /^nl/i.test(v.lang)) || null; u.rate = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { /* voix absente */ } };

// ---------- figures sur quadrillage (côtés droits ou en biais 3-4-5 : longueurs entières) ----------
function gridFig() {
  const t = ri(0, 8);
  if (t === 0) { const w = ri(2, 6), hh = ri(1, 4); return { nom: 'rectangle', v: [[0, 0], [w, 0], [w, hh], [0, hh]] }; }
  if (t === 1) { const c = ri(2, 5); return { nom: 'carré', v: [[0, 0], [c, 0], [c, c], [0, c]] }; }
  if (t === 2) { const b = ri(2, 4); return { nom: 'parallélogramme', v: [[0, 4], [3, 0], [3 + b, 0], [b, 4]] }; }
  if (t === 3) { const b = ri(2, 4); return { nom: 'parallélogramme', v: [[0, 3], [4, 0], [4 + b, 0], [b, 3]] }; }
  if (t === 4) return pick([{ nom: 'triangle', v: [[0, 4], [3, 0], [6, 4]] }, { nom: 'triangle', v: [[0, 3], [4, 0], [8, 3]] }, { nom: 'triangle', v: [[0, 0], [0, 4], [3, 4]] }, { nom: 'triangle', v: [[0, 3], [4, 3], [4, 0]] }]);
  if (t === 5) { const b = ri(1, 3); return { nom: 'trapèze', v: [[0, 4], [3, 0], [3 + b, 0], [6 + b, 4]] }; }
  if (t === 6) { const b = ri(2, 4); return { nom: 'trapèze', v: [[0, 0], [b, 0], [b + 3, 4], [0, 4]] }; }
  if (t === 7) { const w = ri(2, 4); return { nom: 'pentagone', v: [[0, 0], [w, 0], [w + 4, 3], [w, 6], [0, 6]] }; }
  const a = ri(3, 5), b = ri(3, 4), c = ri(1, a - 1), d = ri(1, b - 1); return { nom: 'hexagone', v: [[0, 0], [c, 0], [c, d], [a, d], [a, b], [0, b]] };
}
function gridSvg(fig, { U = 22, pad = 1, cls = 'om-fig', letter = null, color = '#ffe36b' } = {}) {
  const W = Math.max(...fig.v.map((p) => p[0])) + 2 * pad, H = Math.max(...fig.v.map((p) => p[1])) + 2 * pad;
  const svg = sv('svg', { viewBox: `0 0 ${W * U} ${H * U}`, class: cls });
  for (let x = 0; x <= W; x++) svg.append(sv('line', { x1: x * U, x2: x * U, y1: 0, y2: H * U, class: 'om-grid' }));
  for (let y = 0; y <= H; y++) svg.append(sv('line', { y1: y * U, y2: y * U, x1: 0, x2: W * U, class: 'om-grid' }));
  svg.append(sv('polygon', { points: fig.v.map(([x, y]) => `${(x + pad) * U},${(y + pad) * U}`).join(' '), fill: color + '33', stroke: color, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
  if (letter) { const cx = fig.v.reduce((t, p) => t + p[0], 0) / fig.v.length, cy = fig.v.reduce((t, p) => t + p[1], 0) / fig.v.length; svg.append(sv('text', { x: (cx + pad) * U, y: (cy + pad) * U + 7, class: 'om-letter' }, letter)); }
  return svg;
}
// ---------- figures « pas à l'échelle » avec mesures écrites ----------
const SHAPES = {
  rect: [[20, 30], [200, 30], [200, 130], [20, 130]],
  carre: [[60, 20], [160, 20], [160, 120], [60, 120]],
  tri: [[30, 135], [85, 25], [195, 135]],
  triR: [[40, 20], [40, 135], [180, 135]],
  trap: [[70, 25], [150, 25], [195, 135], [25, 135]],
};
function labeled(kind, labels) { // labels[i] = texte du côté i (ou null)
  const pts = SHAPES[kind], cx = pts.reduce((t, p) => t + p[0], 0) / pts.length, cy = pts.reduce((t, p) => t + p[1], 0) / pts.length;
  const svg = sv('svg', { viewBox: '-30 -5 280 165', class: 'om-fig om-lab' }, sv('polygon', { points: pts.map((p) => p.join(',')).join(' '), class: 'om-shape' }));
  pts.forEach((a, i) => {
    const b = pts[(i + 1) % pts.length]; if (labels[i] == null) return;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
    svg.append(sv('text', { x: mx + (dx / d) * 24, y: my + (dy / d) * 20 + 6, class: 'om-lbl' }, labels[i]));
  });
  return svg;
}

// ---------- générateurs ----------
const dec = () => ri(2, 9) * 10 + pick([0, 0, 5, 2, 4, 6, 8]); // en dixièmes de cm
function qDeci() {
  const t = ri(0, 3);
  if (t === 0) { const L = dec(), l = Math.min(dec(), L - 5); const P = 2 * (L + l); return { pic: () => labeled('rect', [cm(L), cm(l), cm(L), cm(l)]), q: tr('Bereken de omtrek — Calcule le périmètre de ce rectangle.', 'Bereken de omtrek van deze rechthoek.'), opts: uq(P, [L + l, P + 10, P - 10, P + 5]).map(cm), why: `${f10(L)} + ${f10(l)} + ${f10(L)} + ${f10(l)} = ${f10(P)} cm.` }; }
  if (t === 1) { const a = dec(), b = dec(), c = Math.max(a, b) + ri(1, 3) * 10 + pick([0, 2, 5]); const P = a + b + c; return { pic: () => labeled('triR', [cm(a), cm(b), cm(c)]), q: tr('Bereken de omtrek — Calcule le périmètre de ce triangle.', 'Bereken de omtrek van deze driehoek.'), opts: uq(P, [a + b, P + 10, P - 10, P + 1]).map(cm), why: `${f10(a)} + ${f10(b)} + ${f10(c)} = ${f10(P)} cm.` }; }
  if (t === 2) { const p = ri(1, 3) * 10, g = p + ri(2, 4) * 10, s = ri(3, 5) * 10 + pick([0, 5]); const P = p + g + 2 * s; return { pic: () => labeled('trap', [cm(p), cm(s), cm(g), cm(s)]), q: tr('Bereken de omtrek — Calcule le périmètre de ce trapèze.', 'Bereken de omtrek van dit trapezium.'), opts: uq(P, [p + g + s, P + 10, P - 5, P + 5]).map(cm), why: `${f10(p)} + ${f10(s)} + ${f10(g)} + ${f10(s)} = ${f10(P)} cm.` }; }
  const c = dec(), P = 4 * c; return { pic: () => labeled('carre', [cm(c), cm(c), cm(c), cm(c)]), q: tr('Bereken de omtrek — Calcule le périmètre de ce carré.', 'Bereken de omtrek van dit vierkant.'), opts: uq(P, [2 * c, P + 10, c * 3, P - 10]).map(cm), why: `${f10(c)} + ${f10(c)} + ${f10(c)} + ${f10(c)} = ${f10(P)} cm (${tr('ou', 'of')} 4 × ${f10(c)}).` };
}
function uq(right, xs) { return [right, ...shuffle([...new Set(xs.filter((x) => x > 0 && x !== right))]).slice(0, 2)]; }
function qEntoure() {
  const t = ri(0, 2);
  if (t === 0) { const L = ri(4, 9), l = ri(2, L - 1), P = 2 * (L + l); return { pic: () => labeled('rect', [`${L} cm`, `${l} cm`, null, null]), q: tr('Entoure le bon périmètre de ce rectangle. (Omcirkel de juiste omtrek.)', 'Omcirkel de juiste omtrek van deze rechthoek.'), opts: uq(P, [L + l, L * l, P + 2]).map((x) => `${x} cm`), why: tr(`Les côtés cachés ont la même mesure : ${L} + ${l} + ${L} + ${l} = ${P} cm.`, `De overstaande zijden zijn even lang: ${L} + ${l} + ${L} + ${l} = ${P} cm.`) }; }
  if (t === 1) { const c = ri(3, 9), P = 4 * c; return { pic: () => labeled('carre', [null, null, `${c} cm`, null]), q: tr('Entoure le bon périmètre de ce carré. (Omcirkel de juiste omtrek.)', 'Omcirkel de juiste omtrek van dit vierkant.'), opts: uq(P, [2 * c, c * c, P + 4]).map((x) => `${x} cm`), why: tr(`Un carré a 4 côtés de ${c} cm : 4 × ${c} = ${P} cm.`, `Een vierkant heeft 4 zijden van ${c} cm: 4 × ${c} = ${P} cm.`) }; }
  const a = ri(2, 6), b = ri(2, 6), c = ri(Math.max(a, b), a + b - 1), P = a + b + c; return { pic: () => labeled('tri', [`${a} cm`, `${b} cm`, `${c} cm`]), q: tr('Entoure le bon périmètre de ce triangle. (Omcirkel de juiste omtrek.)', 'Omcirkel de juiste omtrek van deze driehoek.'), opts: uq(P, [P + 1, P - 1, a + b]).map((x) => `${x} cm`), why: `${a} + ${b} + ${c} = ${P} cm.` };
}
function qChemin() {
  if (ri(0, 1) === 0) { // ligne brisée sur quadrillage
    const steps = [[3, 0], [4, 0], [5, 0], [2, 0], [0, 2], [0, 3], [3, 4], [4, 3], [3, -4], [4, -3], [6, 0]];
    let v = [[0, 4]], P = 0; const n = ri(3, 4);
    for (let i = 0; i < n; i++) { let s; do { s = pick(steps); } while (v[v.length - 1][1] + s[1] < 0 || v[v.length - 1][1] + s[1] > 7 || (s[0] === 0 && i && v[v.length - 1][0] === v[v.length - 2][0])); const p = [v[v.length - 1][0] + s[0], v[v.length - 1][1] + s[1]]; P += seg(v[v.length - 1], p); v.push(p); }
    const U = 20, W = Math.max(...v.map((p) => p[0])) + 2, Hh = 9;
    const pic = () => { const s = sv('svg', { viewBox: `0 0 ${W * U} ${Hh * U}`, class: 'om-fig' }); for (let x = 0; x <= W; x++) s.append(sv('line', { x1: x * U, x2: x * U, y1: 0, y2: Hh * U, class: 'om-grid' })); for (let y = 0; y <= Hh; y++) s.append(sv('line', { y1: y * U, y2: y * U, x1: 0, x2: W * U, class: 'om-grid' })); s.append(sv('polyline', { points: v.map(([x, y]) => `${(x + 1) * U},${y * U + U}`).join(' '), fill: 'none', stroke: '#ffe36b', 'stroke-width': 3.5, 'stroke-linejoin': 'round' })); v.forEach(([x, y]) => s.append(sv('circle', { cx: (x + 1) * U, cy: y * U + U, r: 3.5, fill: '#fff' }))); return s; };
    const parts = v.slice(1).map((p, i) => seg(v[i], p));
    return { pic, q: tr('Mesure le chemin : chaque carreau mesure 1 cm. Quelle est sa longueur totale ? (Meet de weg.)', 'Meet de weg: elk hokje is 1 cm. Hoe lang is de weg in totaal?'), opts: uq(P, [P - parts[parts.length - 1], P + 2, P - 2, P + 1]).map((x) => `${x} cm`), why: tr(`On additionne chaque morceau : ${parts.join(' + ')} = ${P} cm. Les morceaux en biais mesurent 5 cm.`, `Tel alle stukjes op: ${parts.join(' + ')} = ${P} cm. De schuine stukjes zijn 5 cm.`) };
  }
  const parts = Array.from({ length: ri(2, 4) }, () => ri(2, 9) * 10 + pick([0, 5, 2, 7])), P = parts.reduce((t, x) => t + x, 0);
  return { pic: () => { const s = sv('svg', { viewBox: '0 0 300 120', class: 'om-fig' }); let x = 20, y = 40; const pts = [[x, y]]; parts.forEach((p, i) => { x += 260 / parts.length; y = i % 2 ? 40 : 95; pts.push([x, y]); }); s.append(sv('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: '#ffe36b', 'stroke-width': 3.5 })); pts.slice(1).forEach((p, i) => { const a = pts[i]; s.append(sv('text', { x: (a[0] + p[0]) / 2, y: (a[1] + p[1]) / 2 + (i % 2 ? 22 : -10), class: 'om-lbl' }, cm(parts[i]))); }); return s; }, q: tr('Quelle est la longueur totale de ce chemin ?', 'Hoe lang is deze weg in totaal?'), opts: uq(P, [P + 10, P - 10, P + 5]).map(cm), why: `${parts.map(f10).join(' + ')} = ${f10(P)} cm.` };
}
const VF = [
  ['la longueur d’une piste d’athlétisme (un tour)', 'de lengte van een atletiekpiste (één ronde)', 1], ['le contour d’un rectangle', 'de rand rond een rechthoek', 1], ['la clôture autour d’un jardin', 'de omheining rond een tuin', 1],
  ['le ruban autour d’un cadre photo', 'het lint rond een fotokader', 1], ['la bordure autour d’un tapis', 'de boord rond een tapijt', 1], ['le tour de la cour en courant', 'een rondje rond de speelplaats lopen', 1],
  ['la frise collée tout autour de la chambre', 'de sierrand rond de hele kamer', 1], ['le grillage autour d’un enclos', 'het hek rond een weide', 1], ['la dentelle cousue autour d’une nappe', 'het kant rond een tafelkleed', 1],
  ['le tour du terrain de basket', 'een ronde rond het basketbalveld', 1], ['la masse d’un enfant', 'het gewicht van een kind', 0], ['la surface d’un mur à peindre', 'de oppervlakte van een muur om te verven', 0],
  ['la taille d’une armoire', 'de hoogte van een kast', 0], ['la largeur d’une porte', 'de breedte van een deur', 0], ['la quantité d’eau dans une bouteille', 'hoeveel water er in een fles zit', 0],
  ['le carrelage pour couvrir le sol', 'de tegels om de vloer te bedekken', 0], ['la température de la classe', 'de temperatuur in de klas', 0], ['la durée de la récréation', 'hoe lang de speeltijd duurt', 0],
  ['le gazon pour couvrir tout le jardin', 'het gras voor de hele tuin', 0], ['la hauteur d’un arbre', 'de hoogte van een boom', 0],
];
function qVF(item) { const [fr, nl, v] = item; const Y = tr('Vrai', 'Juist'), N = tr('Faux', 'Fout'); return { q: tr(`Utilise-t-on le périmètre pour… ${fr} ?`, `Gebruik je de omtrek voor… ${nl}?`), opts: v ? [Y, N] : [N, Y], why: v ? tr('Vrai : on mesure tout le tour, c’est un périmètre.', 'Juist: je meet de hele rand rondom, dat is de omtrek.') : tr('Faux : on ne mesure pas le tour d’une figure (c’est une masse, une surface, une capacité, une hauteur…).', 'Fout: je meet niet de rand rondom (het is een gewicht, een oppervlakte, een inhoud, een hoogte…).') }; }
function qComparer() {
  let a = gridFig(), b; const want = ri(0, 2) === 0;
  for (let k = 0; k < 60; k++) { b = gridFig(); if ((perim(a.v) === perim(b.v)) === want && b.nom !== a.nom) break; }
  const pa = perim(a.v), pb = perim(b.v), r = pa > pb ? '>' : pa < pb ? '<' : '=';
  return { pic: () => h('div', { class: 'om-pair' }, h('div', null, gridSvg(a, { U: 18, letter: 'A' })), h('div', null, gridSvg(b, { U: 18, letter: 'B', color: '#7fd1ff' }))), q: tr('Compare le périmètre de A et de B : choisis <, > ou =. (Vergelijk de omtrek.)', 'Vergelijk de omtrek van A en B: kies <, > of =.'), opts: [r, ...['<', '>', '='].filter((x) => x !== r)], why: tr(`Périmètre de A = ${pa} cm, de B = ${pb} cm : A ${r} B. (Les côtés en biais mesurent 5 cm.)`, `Omtrek van A = ${pa} cm, van B = ${pb} cm: A ${r} B. (Schuine zijden zijn 5 cm.)`) };
}

// ---------- entraînements interactifs ----------
function series(box, talk, title, nl, N, make, back) { // N questions générées par make(host, done(ok))
  let n = 0, ok = 0;
  const run = () => {
    if (n >= N) { log('perimetre', ok >= N - 1 ? 1 : 0); if (ok >= N - 1) { Sfx.win(); burst(box); } box.replaceChildren(h('h3', null, title), h('p', { class: 'prompt' }, `${tr('Bravo', 'Goed zo')} ! ${ok} / ${N}`), h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: () => series(box, talk, title, nl, N, make, back) }, tr('↻ Rejouer', '↻ Opnieuw')), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'om-back', onclick: back }, '⬅️ Menu'))); talk(tr(`Bravo ! ${ok} sur ${N}.`, `Goed zo! ${ok} op ${N}.`)); return; }
    const host = h('div');
    box.replaceChildren(...kids(h('div', { class: 'om-head' }, h('button', { class: 'btn small', type: 'button', onclick: back }, '⬅️'), h('h3', null, `${title} — ${n + 1}/${N}`)), nl && !NL ? h('p', { class: 'om-nl' }, '🇳🇱 ', nl) : null, host));
    make(host, (good) => { if (good) { ok++; star(); } n++; host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'om-next', onclick: run }, n < N ? tr('➡️ Suivant', '➡️ Volgende') : tr('🏁 Terminer', '🏁 Klaar')))); });
  };
  run();
}
function ranger(host, talk, done) {
  let figs; for (let k = 0; k < 80; k++) { figs = [0, 1, 2, 3].map(gridFig); if (new Set(figs.map((f) => perim(f.v))).size === 4) break; }
  const L = ['a', 'b', 'c', 'd'], chosen = [], cards = [];
  const line = h('p', { class: 'om-order' }), msg = h('p', { class: 'cd-msg' });
  const show = () => { line.textContent = chosen.length ? chosen.map((i) => L[i]).join('  >  ') : '…  >  …  >  …  >  …'; };
  const wrap = h('div', { class: 'om-cards' }, ...figs.map((f, i) => { const b = h('button', { class: 'om-card', type: 'button', 'data-testid': 'om-f' + i, onclick: () => { if (chosen.includes(i) || chosen.length >= 4) return; chosen.push(i); b.classList.add('sel'); Sfx.tap(); show(); if (chosen.length === 4) check(); } }, gridSvg(f, { U: 14, letter: L[i] })); cards.push(b); return b; }));
  const check = () => {
    const P = figs.map((f) => perim(f.v)), right = [0, 1, 2, 3].sort((x, y) => P[y] - P[x]), good = chosen.every((x, i) => x === right[i]);
    cards.forEach((c) => { c.disabled = true; });
    const why = right.map((i) => `${L[i]} = ${P[i]} cm`).join(' > ');
    msg.textContent = (good ? tr('Bravo ! ', 'Goed zo! ') : tr('Pas tout à fait. Bon ordre : ', 'Niet helemaal. Juiste volgorde: ')) + why; talk(msg.textContent); good ? Sfx.win() : Sfx.tap(); done(good);
  };
  show();
  host.append(h('p', { class: 'prompt' }, tr('Calcule le périmètre de chaque figure (1 carreau = 1 cm, les côtés en biais mesurent 5 cm). Touche les figures du plus GRAND au plus PETIT périmètre.', 'Bepaal de omtrek van elke figuur (1 hokje = 1 cm, schuine zijden zijn 5 cm). Tik de figuren aan van de GROOTSTE naar de KLEINSTE omtrek.')), wrap, line,
    h('div', { class: 'actions' }, h('button', { class: 'btn small', type: 'button', onclick: () => { if (chosen.length >= 4) return; chosen.length = 0; cards.forEach((c) => c.classList.remove('sel')); show(); } }, tr('↺ Recommencer', '↺ Opnieuw'))), msg);
  talk(tr('Range les figures du plus grand au plus petit périmètre.', 'Zet de figuren in de juiste volgorde, van de grootste naar de kleinste omtrek.'));
}
function meme(host, talk, done) {
  let figs; for (let k = 0; k < 200; k++) { figs = [0, 1, 2, 3, 4].map(gridFig); const P = figs.map((f) => perim(f.v)); const cnt = {}; P.forEach((p) => { cnt[p] = (cnt[p] || 0) + 1; }); if (Object.values(cnt).filter((c) => c === 2).length === 1 && Object.values(cnt).every((c) => c <= 2)) break; }
  const P = figs.map((f) => perim(f.v)), sel = [], cards = [], msg = h('p', { class: 'cd-msg' }), L = ['a', 'b', 'c', 'd', 'e'];
  const wrap = h('div', { class: 'om-cards' }, ...figs.map((f, i) => { const b = h('button', { class: 'om-card', type: 'button', 'data-testid': 'om-f' + i, onclick: () => { if (sel.length >= 2 || sel.includes(i)) return; sel.push(i); b.classList.add('sel'); Sfx.tap(); if (sel.length === 2) check(); } }, gridSvg(f, { U: 14, letter: L[i] })); cards.push(b); return b; }));
  const check = () => {
    const good = P[sel[0]] === P[sel[1]]; cards.forEach((c, i) => { c.disabled = true; if (P.filter((p) => p === P[i]).length === 2) c.classList.add('ok'); });
    msg.textContent = (good ? tr('Bravo ! ', 'Goed zo! ') : tr('Pas tout à fait. ', 'Niet helemaal. ')) + figs.map((f, i) => `${L[i]} = ${P[i]} cm`).join(' · '); talk(good ? tr('Bravo ! Elles ont le même périmètre.', 'Goed zo! Ze hebben dezelfde omtrek.') : tr('Regarde les périmètres de chaque figure.', 'Kijk naar de omtrek van elke figuur.')); good ? Sfx.win() : Sfx.tap(); done(good);
  };
  host.append(h('p', { class: 'prompt' }, tr('Touche les 2 figures qui ont le même périmètre. (Welke figuren hebben dezelfde omtrek?) 1 carreau = 1 cm.', 'Tik de 2 figuren aan die dezelfde omtrek hebben. 1 hokje = 1 cm.')), wrap, msg);
  talk(tr('Trouve les deux figures qui ont le même périmètre.', 'Welke twee figuren hebben dezelfde omtrek?'));
}
function tracer(host, talk, done) {
  const t = ri(0, 2); let task;
  if (t === 0) { const c = ri(3, 9); task = { txt: tr(`Trace un carré qui a un périmètre de ${4 * c} cm.`, `Teken een vierkant met een omtrek van ${4 * c} cm.`), nl: `Teken een vierkant met een omtrek van ${4 * c} cm.`, ok: (w, hh) => w === hh && 2 * (w + hh) === 4 * c, why: tr(`Un carré de ${4 * c} cm de périmètre a des côtés de ${4 * c} : 4 = ${c} cm.`, `Een vierkant met een omtrek van ${4 * c} cm heeft zijden van ${4 * c} : 4 = ${c} cm.`) }; }
  else if (t === 1) { const P = 2 * ri(5, 11); task = { txt: tr(`Trace un rectangle (pas un carré) qui a un périmètre de ${P} cm.`, `Teken een rechthoek (geen vierkant) met een omtrek van ${P} cm.`), nl: `Teken een rechthoek met een omtrek van ${P} cm.`, ok: (w, hh) => w !== hh && 2 * (w + hh) === P, why: tr(`Il faut longueur + largeur = ${P / 2} cm, par exemple ${P / 2 - 1} et 1.`, `Lengte + breedte moet ${P / 2} cm zijn, bijvoorbeeld ${P / 2 - 1} en 1.`) }; }
  else { const c = ri(3, 6); task = { txt: tr(`Voici un carré de ${c} cm de côté. Trace un rectangle (pas un carré) qui a le même périmètre.`, `Hier is een vierkant met zijden van ${c} cm. Teken een rechthoek (geen vierkant) met dezelfde omtrek.`), nl: `Teken een rechthoek met dezelfde omtrek.`, ok: (w, hh) => w !== hh && w + hh === 2 * c, why: tr(`Le carré a un périmètre de ${4 * c} cm : il faut longueur + largeur = ${2 * c} cm (par exemple ${c + 1} et ${c - 1}).`, `Het vierkant heeft een omtrek van ${4 * c} cm: lengte + breedte = ${2 * c} cm (bijvoorbeeld ${c + 1} en ${c - 1}).`), carre: c }; }
  const U = 26, W = 13, H = 10, svg = sv('svg', { viewBox: `0 0 ${W * U} ${H * U}`, class: 'om-fig om-draw' });
  for (let x = 0; x <= W; x++) svg.append(sv('line', { x1: x * U, x2: x * U, y1: 0, y2: H * U, class: 'om-grid strong' }));
  for (let y = 0; y <= H; y++) svg.append(sv('line', { y1: y * U, y2: y * U, x1: 0, x2: W * U, class: 'om-grid strong' }));
  const rect = sv('rect', { class: 'om-rect', x: 0, y: 0, width: 0, height: 0 }), dot = sv('circle', { r: 7, class: 'om-dot', cx: -20, cy: -20 }); svg.append(rect, dot);
  const info = h('p', { class: 'om-info' }, tr('Touche un coin, puis le coin opposé.', 'Tik een hoek aan, en dan de overstaande hoek.')), msg = h('p', { class: 'cd-msg' });
  let A = null, B = null, locked = false;
  svg.addEventListener('click', (e) => {
    if (locked) return; const r = svg.getBoundingClientRect(), x = Math.round(((e.clientX - r.left) / r.width) * W), y = Math.round(((e.clientY - r.top) / r.height) * H);
    if (!A || B) { A = [x, y]; B = null; dot.setAttribute('cx', x * U); dot.setAttribute('cy', y * U); rect.setAttribute('width', 0); rect.setAttribute('height', 0); info.textContent = tr('Touche maintenant le coin opposé.', 'Tik nu de overstaande hoek aan.'); Sfx.tap(); return; }
    B = [x, y]; const w = Math.abs(B[0] - A[0]), hh = Math.abs(B[1] - A[1]); if (!w || !hh) { B = null; info.textContent = tr('Le coin opposé doit être en biais par rapport au premier.', 'De overstaande hoek ligt schuin tegenover de eerste.'); return; }
    rect.setAttribute('x', Math.min(A[0], B[0]) * U); rect.setAttribute('y', Math.min(A[1], B[1]) * U); rect.setAttribute('width', w * U); rect.setAttribute('height', hh * U);
    info.textContent = tr(`Ta figure : ${w} cm sur ${hh} cm (touche un nouveau coin pour recommencer).`, `Jouw figuur: ${w} cm op ${hh} cm (tik een nieuwe hoek aan om opnieuw te beginnen).`); Sfx.tap();
  });
  const act = h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'om-check', onclick: () => {
    if (!A || !B) { info.textContent = tr('Trace d’abord ta figure : touche deux coins.', 'Teken eerst je figuur: tik twee hoeken aan.'); talk(info.textContent); return; }
    const w = Math.abs(B[0] - A[0]), hh = Math.abs(B[1] - A[1]), good = task.ok(w, hh); locked = true; act.querySelector('button').disabled = true;
    rect.classList.add(good ? 'ok' : 'ko');
    msg.textContent = (good ? `${tr('Bravo', 'Goed zo')} ! ${w} + ${hh} + ${w} + ${hh} = ${2 * (w + hh)} cm. ` : tr(`Ta figure mesure ${w} + ${hh} + ${w} + ${hh} = ${2 * (w + hh)} cm. `, `Jouw figuur: ${w} + ${hh} + ${w} + ${hh} = ${2 * (w + hh)} cm. `)) + (good ? '' : task.why);
    talk(msg.textContent); good ? Sfx.win() : Sfx.tap(); done(good);
  } }, tr('✔️ Vérifier', '✔️ Controleer')));
  host.append(...kids(h('p', { class: 'prompt' }, task.txt), NL ? null : h('p', { class: 'om-nl' }, '🇳🇱 ', task.nl), task.carre ? h('div', { class: 'om-mini' }, gridSvg({ v: [[0, 0], [task.carre, 0], [task.carre, task.carre], [0, task.carre]] }, { U: 12, pad: 0.5 })) : null, h('div', { class: 'om-wrap' }, svg), info, act, msg));
  talk(task.txt);
}
// QCM (comme WS.qcm, mais la voix et les messages suivent la langue)
function quiz(host, talk, list, onEnd) {
  let i = 0, ok = 0;
  const pic = h('div', { class: 'ws-pic' }), q = h('p', { class: 'prompt' }), ans = h('div', { class: 'answers' }), sc = h('span', { class: 'be-score' });
  host.append(pic, q, ans, sc);
  const ask = () => {
    if (i >= list.length) { pic.replaceChildren(); q.textContent = `${ok} / ${list.length} !`; ans.replaceChildren(); sc.textContent = ''; onEnd && onEnd(ok); return; }
    const it = list[i]; pic.replaceChildren(...(it.pic ? [it.pic()] : [])); q.textContent = it.q; talk(it.q); sc.textContent = `${i + 1}/${list.length}`;
    ans.replaceChildren(...shuffle(it.opts.map((o, k) => [o, k])).map(([o, k]) => h('button', { class: 'choice', type: 'button', 'data-k': k, onclick: (e) => {
      ans.querySelectorAll('button').forEach((b) => { b.disabled = true; if (b.dataset.k === '0') b.classList.add('right'); }); e.currentTarget.classList.add(k === 0 ? 'right' : 'wrong');
      if (k === 0) { ok++; star(); Sfx.win(); burst(host); talk(tr('Bravo ! ', 'Goed zo! ') + it.why); } else { Sfx.tap(); talk(tr('Pas tout à fait. ', 'Niet helemaal. ') + it.why); }
      i++; setTimeout(ask, 3400);
    } }, String(o))));
  };
  ask();
}
const qcmSeries = (gen, N = 6) => (box, talk, back, title, nl) => {
  const host = h('div'); box.replaceChildren(...kids(h('div', { class: 'om-head' }, h('button', { class: 'btn small', type: 'button', onclick: back }, '⬅️'), h('h3', null, title)), nl && !NL ? h('p', { class: 'om-nl' }, '🇳🇱 ', nl) : null, host));
  const list = gen === 'vf' ? shuffle(VF).slice(0, N).map(qVF) : Array.from({ length: N }, gen);
  quiz(host, talk, list, (ok) => { log('perimetre', ok >= N - 1 ? 1 : 0); host.append(h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: () => qcmSeries(gen, N)(box, talk, back, title, nl) }, tr('↻ Rejouer', '↻ Opnieuw')), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'om-back', onclick: back }, '⬅️ Menu'))); });
};

const ACT = [ // [clé, icône, titre fr, titre nl, fonction]
  ['deci', '🧮', 'Calcule avec des virgules', 'Bereken de omtrek', qcmSeries(qDeci)],
  ['entoure', '⭕', 'Entoure le bon périmètre', 'Omcirkel de juiste omtrek', qcmSeries(qEntoure)],
  ['ranger', '🔢', 'Range les figures', 'Zet de figuren in de juiste volgorde', (b, t, back, ti, nl) => series(b, t, ti, nl, 4, (host, done) => ranger(host, t, done), back)],
  ['comparer', '⚖️', 'Compare : <, > ou =', 'Vergelijk de omtrek', qcmSeries(qComparer)],
  ['meme', '🎨', 'Le même périmètre', 'Dezelfde omtrek', (b, t, back, ti, nl) => series(b, t, ti, nl, 4, (host, done) => meme(host, t, done), back)],
  ['tracer', '✏️', 'Trace la figure', 'Teken de figuur', (b, t, back, ti, nl) => series(b, t, ti, nl, 4, (host, done) => tracer(host, t, done), back)],
  ['chemin', '〰️', 'Mesure le chemin', 'Meet de weg', qcmSeries(qChemin)],
  ['vf', '✅', 'Vrai ou faux : périmètre ?', 'Juist of fout: omtrek?', qcmSeries('vf')],
];
const VOC = [['de omtrek', 'le périmètre'], ['de zijde', 'le côté'], ['het vierkant', 'le carré'], ['de rechthoek', 'le rectangle'], ['de driehoek', 'le triangle'], ['het trapezium', 'le trapèze'], ['bereken', 'calcule'], ['meet', 'mesure']];

export function open(start, lang = 'fr') {
  NL = lang === 'nl';
  shell(NL ? '🧵 De omtrek' : '🧵 Le périmètre — De omtrek', NL ? 'Omtrek' : 'Périmètre', (box, talk0) => {
    const talk = NL ? (s2, v = true) => { talk0(s2, false); if (v) speakNL(s2); } : talk0;
    const title = (fr, nl) => (NL ? nl : fr);
    const menu = () => {
      box.replaceChildren(
        h('div', { class: 'om-lesson' },
          NL ? h('p', null, h('b', null, 'De omtrek'), ' is de lengte van de ', h('b', null, 'rand rondom'), ' een figuur. Je ', h('b', null, 'telt alle zijden op'), '. ', h('small', { class: 'muted' }, '(Le périmètre = la longueur du tour : on additionne tous les côtés.)'))
            : h('p', null, h('b', null, 'Le périmètre'), ' (de omtrek), c’est la longueur du ', h('b', null, 'tour'), ' d’une figure. On ', h('b', null, 'additionne tous les côtés'), '.'),
          h('p', null, NL ? '⬜ Vierkant: 4 × zijde   ·   ▭ Rechthoek: lengte + breedte + lengte + breedte' : '⬜ Carré : 4 × côté   ·   ▭ Rectangle : longueur + largeur + longueur + largeur'),
          h('p', { class: 'om-tip' }, NL ? '💡 Schrijf eerst de lengte van elke zijde op, en bereken dan de omtrek!' : '💡 Avant de calculer, note la mesure de chaque côté ! Les côtés d’un carré sont égaux ; dans un rectangle, les côtés opposés sont égaux.'),
          h('div', { class: 'om-voc' }, ...VOC.map(([nl, fr]) => h('button', { class: 'om-w', type: 'button', onclick: () => speakNL(nl) }, '🔊 ', h('b', null, nl), ` = ${fr}`)))),
        h('div', { class: 'om-menu' }, ...ACT.map(([k, ic, fr, nl, fn]) => h('button', { class: 'om-act', type: 'button', 'data-testid': 'om-' + k, onclick: () => fn(box, talk, menu, `${ic} ${title(fr, nl)}`, nl) }, h('span', { class: 'om-ic' }, ic), h('span', null, h('b', null, title(fr, nl)), h('small', null, NL ? fr : nl)))),
          NL ? null : h('button', { class: 'om-act', type: 'button', 'data-testid': 'om-contour', onclick: () => porte({ contour: true }) }, h('span', { class: 'om-ic' }, '📏'), h('span', null, h('b', null, 'Le contour déplié'), h('small', null, 'comme l’interdiocésaine 2026')))));
      talk(NL ? 'De omtrek is de rand rondom een figuur. Kies een oefening!' : 'Le périmètre, c’est le tour d’une figure. Choisis un entraînement !');
    };
    const a = start && ACT.find((x) => x[0] === start);
    if (a) a[4](box, talk, menu, `${a[1]} ${title(a[2], a[3])}`, a[3]); else menu();
  });
}
export const _gen = { qDeci, qEntoure, qChemin, qComparer, gridFig, perim, setNL: (v) => { NL = v; } };
