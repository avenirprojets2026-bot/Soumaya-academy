// Atelier du cercle (Salle des Nombres) : centre, rayon, diamètre, circonférence, corde, arc, tangente, sécante, secteur, segment.
// Onglets : Découvrir · Montre-moi · Construis · Vrai ou faux · Défi.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import * as Mimi from './mimi.js';

const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };
const CX = 300, CY = 300, R = 200, rad = (d) => d * Math.PI / 180;
const P = (deg, r = R) => [CX + r * Math.cos(rad(deg)), CY + r * Math.sin(rad(deg))];
const arcPath = (a, b, r = R) => { const [x1, y1] = P(a, r), [x2, y2] = P(b, r); return `M${x1},${y1} A${r},${r} 0 ${((b - a + 360) % 360) > 180 ? 1 : 0} 1 ${x2},${y2}`; };
const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export const NOTIONS = [
  { k: 'centre', name: 'le centre', col: '#ffd84a', say: 'Le centre, c’est le point exact au milieu du cercle. Ici, c’est le soleil magique.', simple: 'le milieu' },
  { k: 'rayon', name: 'un rayon', col: '#ff8a3d', say: 'Le rayon, c’est un segment qui part du centre et rejoint le bord du cercle.', simple: 'du milieu jusqu’au bord' },
  { k: 'diametre', name: 'un diamètre', col: '#ff4f8b', say: 'Le diamètre, c’est un segment qui va d’un bord à l’autre en passant par le centre. Il mesure deux rayons.', simple: 'd’un bord à l’autre en passant par le milieu' },
  { k: 'circonf', name: 'la circonférence', col: '#7ad7ff', say: 'La circonférence, c’est tout le tour du cercle. C’est son contour.', simple: 'le tour du cercle' },
  { k: 'corde', name: 'une corde', col: '#b77bff', say: 'Une corde, c’est un segment qui relie deux points du cercle. Si elle passe par le centre, elle devient un diamètre !', simple: 'une ligne entre deux points du cercle' },
  { k: 'arc', name: 'un arc', col: '#3ee08f', say: 'Un arc, c’est une partie de la circonférence : seulement un morceau du bord.', simple: 'un morceau du bord' },
  { k: 'tangente', name: 'une tangente', col: '#ffe14d', say: 'La tangente touche le cercle en un seul point, sans le traverser.', simple: 'une droite qui touche le cercle en un seul point' },
  { k: 'secante', name: 'une sécante', col: '#ff6b6b', say: 'La sécante coupe le cercle en deux points.', simple: 'une droite qui coupe le cercle en deux points' },
  { k: 'secteur', name: 'un secteur', col: '#ffa94d', say: 'Un secteur, c’est comme une part de tarte : deux rayons et un arc.', simple: 'une part de tarte' },
  { k: 'segment', name: 'un segment de cercle', col: '#5ad1c9', say: 'Un segment de cercle, c’est la partie comprise entre une corde et un arc.', simple: 'entre une corde et un arc' },
];
const N = Object.fromEntries(NOTIONS.map((n) => [n.k, n]));

// dessine une notion ; a = angle de base du quart de cercle qui lui est attribué
function shape(k, a, col, { anim = false, hit = false } = {}) {
  const g = sv('g', { class: 'cc-el' + (anim ? ' anim' : ''), 'data-k': k });
  const line = (x1, y1, x2, y2) => sv('line', { x1, y1, x2, y2, stroke: col, 'stroke-width': 7, 'stroke-linecap': 'round', pathLength: 100 });
  const hitLine = (x1, y1, x2, y2) => sv('line', { x1, y1, x2, y2, class: 'cc-hit', 'stroke-width': 40 });
  const dot = (x, y) => sv('circle', { cx: x, cy: y, r: 8, fill: col, stroke: '#fff', 'stroke-width': 2.5 });
  if (k === 'centre') { g.append(sv('circle', { cx: CX, cy: CY, r: 22, fill: 'url(#ccSun)', class: 'cc-sun' }), dot(CX, CY)); if (hit) g.append(sv('circle', { cx: CX, cy: CY, r: 34, class: 'cc-hit' })); }
  if (k === 'rayon') { const [x, y] = P(a + 45); g.append(line(CX, CY, x, y), dot(x, y)); if (hit) g.append(hitLine(CX + (x - CX) * 0.25, CY + (y - CY) * 0.25, x, y)); }
  if (k === 'diametre') { const [x1, y1] = P(a + 45), [x2, y2] = P(a + 225); g.append(line(x1, y1, x2, y2), dot(x1, y1), dot(x2, y2)); if (hit) g.append(hitLine(x1, y1, CX + (x1 - CX) * 0.2, CY + (y1 - CY) * 0.2), hitLine(x2, y2, CX + (x2 - CX) * 0.2, CY + (y2 - CY) * 0.2)); }
  if (k === 'circonf') { g.append(sv('circle', { cx: CX, cy: CY, r: R, fill: 'none', stroke: col, 'stroke-width': 9, pathLength: 100 })); if (hit) g.append(sv('circle', { cx: CX, cy: CY, r: R, fill: 'none', class: 'cc-hit', 'stroke-width': 40 })); }
  if (k === 'corde') { const [x1, y1] = P(a + 12), [x2, y2] = P(a + 78); g.append(line(x1, y1, x2, y2), dot(x1, y1), dot(x2, y2)); if (hit) g.append(hitLine(x1, y1, x2, y2)); }
  if (k === 'arc') { g.append(sv('path', { d: arcPath(a + 15, a + 75), fill: 'none', stroke: col, 'stroke-width': 16, 'stroke-linecap': 'round', pathLength: 100 })); if (hit) g.append(sv('path', { d: arcPath(a + 15, a + 75), fill: 'none', class: 'cc-hit', 'stroke-width': 46 })); }
  if (k === 'tangente') { const [x, y] = P(a + 45), dx = -Math.sin(rad(a + 45)), dy = Math.cos(rad(a + 45)), L = 125; g.append(line(x - dx * L, y - dy * L, x + dx * L, y + dy * L), dot(x, y)); if (hit) g.append(hitLine(x - dx * L, y - dy * L, x + dx * L, y + dy * L)); }
  if (k === 'secante') { const [x1, y1] = P(a + 20), [x2, y2] = P(a + 160), ux = (x2 - x1) / 280, uy = (y2 - y1) / 280; const e1 = [x1 - ux * 60, y1 - uy * 60], e2 = [x2 + ux * 60, y2 + uy * 60]; g.append(line(...e1, ...e2), dot(x1, y1), dot(x2, y2)); if (hit) g.append(hitLine(...e1, ...e2)); }
  if (k === 'secteur') { const [x1, y1] = P(a + 18), [x2, y2] = P(a + 72); const d = `M${CX},${CY} L${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} Z`; g.append(sv('path', { d, fill: col, 'fill-opacity': 0.55, stroke: col, 'stroke-width': 5, 'stroke-linejoin': 'round' })); if (hit) g.append(sv('path', { d, class: 'cc-hit fill' })); }
  if (k === 'segment') { const [x1, y1] = P(a + 8), [x2, y2] = P(a + 82); const d = `M${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} Z`; g.append(sv('path', { d, fill: col, 'fill-opacity': 0.6, stroke: col, 'stroke-width': 5 })); if (hit) g.append(sv('path', { d, class: 'cc-hit fill' })); }
  return g;
}

function stage() {
  const svg = sv('svg', { viewBox: '0 0 600 600', class: 'cc-svg', role: 'img', 'aria-label': 'Le cercle magique' });
  const defs = sv('defs', {}, sv('radialGradient', { id: 'ccSun' }, sv('stop', { offset: '0', 'stop-color': '#fff7c0' }), sv('stop', { offset: '.6', 'stop-color': '#ffcf3a' }), sv('stop', { offset: '1', 'stop-color': '#ff9a1f' })));
  svg.append(defs);
  // décor : anneaux d'orbite en perspective, petites planètes, étoiles
  const deco = sv('g', { class: 'cc-deco' });
  for (let i = 0; i < 40; i++) deco.append(sv('circle', { cx: Math.random() * 600, cy: Math.random() * 600, r: Math.random() * 1.6 + 0.4, fill: '#fff', opacity: 0.5 }));
  deco.append(sv('ellipse', { cx: CX, cy: CY, rx: 270, ry: 70, fill: 'none', stroke: '#e7c56a55', 'stroke-width': 3, transform: `rotate(-18 ${CX} ${CY})` }), sv('ellipse', { cx: CX, cy: CY, rx: 255, ry: 95, fill: 'none', stroke: '#e7c56a33', 'stroke-width': 2, transform: `rotate(24 ${CX} ${CY})` }));
  deco.append(sv('circle', { cx: CX, cy: CY, r: R, fill: '#1a1650', stroke: '#e7c56a', 'stroke-width': 4 }));
  svg.append(deco);
  const layer = sv('g'); svg.append(layer);
  const top = sv('g'); svg.append(top);
  const sun = sv('circle', { cx: CX, cy: CY, r: 20, fill: 'url(#ccSun)', class: 'cc-sun' }); top.append(sun);
  return { svg, layer, top, clear: () => layer.replaceChildren() };
}

const star = () => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + 1; b.coins += 2; S.save(); };
function burst(host) { for (let k = 0; k < 12; k++) { const s = h('span', { class: 'abq-spark', 'aria-hidden': 'true' }, k % 3 ? '✨' : '🌟'); s.style.cssText = `left:${50 + (Math.random() - 0.5) * 50}%;top:${50 + (Math.random() - 0.5) * 40}%;--dx:${(Math.random() - 0.5) * 220}px;--dy:${-60 - Math.random() * 140}px`; host.append(s); setTimeout(() => s.remove(), 1500); } }

export function open(tab = 'decouvrir') {
  const st = stage();
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const mimi = h('img', { class: 'cc-mimi', src: Mimi.spriteUrl('repos'), alt: '', hidden: true });
  const wrap = h('div', { class: 'cc-wrap' }, st.svg, mimi);
  const body = h('div', { class: 'cc-body' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const tabs = [['decouvrir', '✨ Découvrir'], ['montre', '👆 Montre-moi'], ['construis', '✏️ Construis'], ['vf', '✔️ Vrai ou faux'], ['defi', '🏆 Défi']]
    .map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-tab': k, 'data-testid': 'cc-' + k, onclick: () => go(k) }, l));
  let cleanup = () => {}, gen = 0;
  const later = (fn, ms) => { const g = gen; setTimeout(() => { if (g === gen && wrap.isConnected) fn(); }, ms); };
  function go(k) {
    gen++; cleanup(); say.textContent = ''; cleanup = () => {}; Voice.stop(); tabs.forEach((b) => b.classList.toggle('primary', b.dataset.tab === k));
    st.clear(); body.replaceChildren(); mimi.hidden = true; st.svg.onclick = null; st.svg.classList.remove('build');
    ({ decouvrir, montre, construis, vf, defi })[k]();
  }

  // ---------- Découvrir ----------
  function decouvrir() {
    let i = -1;
    const ang = { rayon: 270, diametre: 180, corde: 0, arc: 90, tangente: 270, secante: 180, secteur: 0, segment: 90, centre: 0, circonf: 0 };
    const next = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'cc-next', onclick: () => step(1) }, 'Commencer ▶');
    const prev = h('button', { class: 'btn small ghost', type: 'button', onclick: () => step(-1) }, '◀');
    const list = h('div', { class: 'cc-recap' });
    function step(d) {
      i = Math.max(0, Math.min(NOTIONS.length, i + d)); st.clear();
      if (i === NOTIONS.length) {
        NOTIONS.forEach((n) => { if (!['secteur', 'segment', 'secante'].includes(n.k)) st.layer.append(shape(n.k, ang[n.k], n.col)); });
        talk('Bravo ! Tu connais maintenant tout le vocabulaire du cercle. Va dans « Montre-moi » pour jouer !');
        list.replaceChildren(...NOTIONS.map((n) => h('span', null, h('i', { style: `background:${n.col}` }), h('b', null, n.name.replace(/^(le |la |un |une )/, '')), ' = ', n.simple)));
        next.textContent = '↻ Revoir'; next.onclick = () => { i = -1; list.replaceChildren(); next.textContent = 'Suivant ▶'; next.onclick = () => step(1); step(1); }; return;
      }
      const n = NOTIONS[i];
      if (n.k !== 'centre' && n.k !== 'circonf') st.layer.append(shape('centre', 0, N.centre.col));
      if (['corde', 'arc'].includes(n.k)) st.layer.append(shape('rayon', 270, '#ffffff55'));
      if (n.k === 'secteur') st.layer.append(shape('arc', 0, '#ffffff00'));
      st.layer.append(shape(n.k, ang[n.k], n.col, { anim: true }));
      talk(`${i + 1}. ${n.say}`); next.textContent = i + 1 < NOTIONS.length ? 'Suivant ▶' : 'Résumé ▶';
    }
    body.append(h('div', { class: 'actions' }, prev, next), list);
    talk('Bienvenue dans l’atelier du cercle ! Regarde bien : chaque anneau cache un secret de géométrie.');
  }

  // ---------- Montre-moi ----------
  function placeSet(target) {
    const span = { diametre: 2, secante: 2 }, ks = [target];
    const others = shuffle(NOTIONS.map((n) => n.k).filter((k) => k !== target && k !== 'centre'));
    for (const k of others) { if (ks.length >= 4) break; if (k === 'circonf' && ks.includes('arc')) continue; if (k === 'arc' && ks.includes('circonf')) continue; if ((k === 'diametre' && ks.includes('secante')) || (k === 'secante' && ks.includes('diametre'))) continue; ks.push(k); }
    const quads = [0, 90, 180, 270], used = new Set(), out = [];
    for (const k of shuffle(ks.filter((k) => span[k])).concat(ks.filter((k) => !span[k] && k !== 'circonf' && k !== 'centre'))) {
      const q = quads.find((a) => !used.has(a) && (!span[k] || (k === 'diametre' ? !used.has((a + 180) % 360) : !used.has((a + 90) % 360))));
      if (q == null) continue; used.add(q); if (k === 'diametre') used.add((q + 180) % 360); if (k === 'secante') used.add((q + 90) % 360); out.push([k, q]);
    }
    if (ks.includes('circonf')) out.unshift(['circonf', 0]);
    if (target !== 'centre' && !out.some(([k]) => k === target)) return placeSet(target);
    return out;
  }
  function montre({ onDone, count = 6 } = {}) {
    let n = 0, ok = 0;
    const targets = shuffle(NOTIONS.map((x) => x.k)).slice(0, count);
    const score = h('span', { class: 'be-score' });
    body.append(h('div', { class: 'actions wrap' }, score));
    function ask() {
      if (n >= targets.length) { talk(`Bravo ! ${ok} sur ${targets.length} !`); score.textContent = ''; onDone ? onDone(ok, targets.length) : body.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => go('montre') }, '↻ Rejouer'))); return; }
      const t = targets[n]; st.clear();
      const set = placeSet(t);
      st.layer.append(shape('centre', 0, '#ffd84a', { hit: true }));
      for (const [k, q] of set) st.layer.append(shape(k, q, '#e8e2ff', { hit: true }));
      const useMimi = Math.random() < 0.35; mimi.hidden = !useMimi;
      talk(useMimi ? `Muezza a besoin de toi : aide-la à retrouver ${N[t].name} !` : `Montre-moi ${N[t].name}.`);
      score.textContent = `${n + 1}/${targets.length}`;
      let locked = false;
      st.layer.querySelectorAll('.cc-el').forEach((g) => g.addEventListener('click', (e) => {
        e.stopPropagation(); if (locked) return; locked = true; const k = g.dataset.k;
        const right = st.layer.querySelector(`.cc-el[data-k="${t}"]`); right.classList.add('good');
        right.querySelectorAll('line,path,circle:not(.cc-hit)').forEach((el) => { if (!el.classList.contains('cc-hit')) { el.setAttribute('stroke', N[t].col); if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none' && !el.classList.contains('cc-sun')) el.setAttribute('fill', N[t].col); } });
        if (k === t) { ok++; star(); Sfx.win(); burst(wrap); talk(`Bravo ! C’est bien ${N[t].name} : ${N[t].simple}.`, false); }
        else { g.classList.add('bad'); Sfx.tap(); talk(`Non, ça c’est ${N[k].name}. ${N[t].name.charAt(0).toUpperCase() + N[t].name.slice(1)}, c’est ${N[t].simple}.`, false); }
        n++; later(ask, k === t ? 1600 : 2800);
      }));
    }
    ask();
  }

  // ---------- Construis ----------
  function construis() {
    const tasks = [
      { t: 'Trace un rayon : touche le centre, puis un point du cercle.', check: (a, b) => (a.c && b.on) || (b.c && a.on), why: 'Un rayon va du centre jusqu’au bord.' },
      { t: 'Trace un diamètre : touche un point du cercle, puis le point juste en face (la ligne doit passer par le centre).', check: (a, b) => a.on && b.on && Math.abs(((a.ang - b.ang + 540) % 360) - 180) < 14, why: 'Un diamètre relie deux points du cercle en passant par le centre.' },
      { t: 'Trace une corde qui n’est PAS un diamètre : touche deux points du cercle.', check: (a, b) => a.on && b.on && Math.abs(((a.ang - b.ang + 540) % 360) - 180) >= 14 && Math.abs(((a.ang - b.ang + 540) % 360) - 180) < 170, why: 'Une corde relie deux points du cercle ; si elle ne passe pas par le centre, ce n’est pas un diamètre.' },
      { t: 'Trace un deuxième rayon, dans une autre direction.', check: (a, b) => (a.c && b.on) || (b.c && a.on), why: 'On peut tracer autant de rayons qu’on veut : ils ont tous la même longueur !' },
    ];
    let i = 0, pts = [];
    const info = h('p', { class: 'prompt' });
    const marks = sv('g'); st.top.append(marks); cleanup = () => marks.remove();
    st.svg.classList.add('build');
    function ask() { pts = []; marks.replaceChildren(); st.clear(); if (i >= tasks.length) { info.textContent = 'Super, tu sais construire dans un cercle !'; talk('Super, tu sais construire dans un cercle !'); body.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => go('construis') }, '↻ Recommencer'))); st.svg.onclick = null; return; } info.textContent = `${i + 1}/${tasks.length} · ${tasks[i].t}`; talk(tasks[i].t); }
    st.svg.onclick = (e) => {
      if (i >= tasks.length) return;
      const r = st.svg.getBoundingClientRect(); let x = (e.clientX - r.left) * 600 / r.width, y = (e.clientY - r.top) * 600 / r.height;
      const d = Math.hypot(x - CX, y - CY), p = { c: d < 32, on: Math.abs(d - R) < 34, ang: (Math.atan2(y - CY, x - CX) * 180 / Math.PI + 360) % 360 };
      if (p.c) { x = CX; y = CY; } else if (p.on) { [x, y] = P(p.ang); } else { talk('Touche le centre ou le bord du cercle.', false); return; }
      pts.push({ ...p, x, y }); marks.append(sv('circle', { cx: x, cy: y, r: 10, fill: '#fff', stroke: '#ff4f8b', 'stroke-width': 4 })); Sfx.tap();
      if (pts.length === 2) {
        const [a, b] = pts, good = tasks[i].check(a, b);
        marks.append(sv('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: good ? '#3ee08f' : '#ff6b6b', 'stroke-width': 7, 'stroke-linecap': 'round', class: 'cc-draw', pathLength: 100 }));
        if (good) { star(); Sfx.win(); burst(wrap); talk('Bravo ! ' + tasks[i].why, false); i++; } else { talk('Presque ! ' + tasks[i].why + ' Essaie encore.', false); }
        later(ask, 2200);
      }
    };
    body.append(info); ask();
  }

  // ---------- Vrai ou faux ----------
  const VF = [
    ['Toutes les cordes sont des diamètres.', false, 'Seules les cordes qui passent par le centre sont des diamètres.'],
    ['Le diamètre passe par le centre.', true, 'Oui, il va d’un bord à l’autre en passant par le centre.'],
    ['Le rayon relie deux points du cercle.', false, 'Non : le rayon relie le centre à un point du cercle.'],
    ['La tangente touche le cercle en un seul point.', true, 'Oui, elle le frôle sans le traverser.'],
    ['Le diamètre mesure deux rayons.', true, 'Oui : diamètre = 2 × rayon.'],
    ['Tous les diamètres sont des cordes.', true, 'Oui : un diamètre relie deux points du cercle, c’est donc une corde.'],
    ['La sécante touche le cercle en un seul point.', false, 'Non : la sécante coupe le cercle en deux points.'],
    ['Un arc est un morceau de la circonférence.', true, 'Oui, c’est une partie du bord.'],
    ['La circonférence, c’est le milieu du cercle.', false, 'Non : c’est le tour du cercle. Le milieu, c’est le centre.'],
    ['Tous les rayons d’un cercle ont la même longueur.', true, 'Oui, c’est même ce qui définit un cercle !'],
    ['Un secteur est formé de deux rayons et d’un arc.', true, 'Oui, comme une part de tarte.'],
    ['Si le rayon mesure 4 cm, le diamètre mesure 6 cm.', false, 'Non : 2 × 4 cm = 8 cm.'],
  ];
  function vf({ onDone, count = 8 } = {}) {
    const qs = shuffle(VF).slice(0, count); let i = 0, ok = 0;
    st.layer.append(shape('circonf', 0, '#7ad7ff55'), shape('rayon', 300, N.rayon.col), shape('diametre', 160, N.diametre.col), shape('corde', 0, N.corde.col));
    const q = h('p', { class: 'prompt' }), btns = h('div', { class: 'answers cc-vf' }), score = h('span', { class: 'be-score' });
    body.append(q, btns, score);
    function ask() {
      if (i >= qs.length) { q.textContent = `${ok} / ${qs.length} bonnes réponses !`; talk(q.textContent); btns.replaceChildren(); score.textContent = ''; if (onDone) onDone(ok, qs.length); else btns.append(h('button', { class: 'btn primary', type: 'button', onclick: () => go('vf') }, '↻ Rejouer')); return; }
      const [s, v, why] = qs[i]; q.textContent = `« ${s} »`; Voice.speak(s); score.textContent = `${i + 1}/${qs.length}`;
      btns.replaceChildren(...[[true, '✔️ Vrai'], [false, '✖️ Faux']].map(([val, l]) => h('button', { class: 'choice', type: 'button', 'data-testid': 'cc-vf', onclick: () => {
        if (val === v) { ok++; star(); Sfx.win(); burst(wrap); talk('Bravo ! ' + why, false); } else { Sfx.tap(); talk('Eh non ! ' + why, false); }
        btns.querySelectorAll('button').forEach((b) => { b.disabled = true; }); i++; later(ask, 2300);
      } }, l)));
    }
    ask();
  }

  // ---------- Défi ----------
  function defi() {
    body.append(h('p', { class: 'muted' }, 'Le grand défi : 5 « Montre-moi » puis 5 « Vrai ou faux ». À 8 bonnes réponses, tu gagnes le titre de Maîtresse du cercle !'));
    montre({ count: 5, onDone: (a, na) => { st.clear(); body.replaceChildren(); vf({ count: 5, onDone: (b, nb) => {
      const tot = a + b, all = na + nb, d = S.get().cercle || (S.get().cercle = {}); d.best = Math.max(d.best || 0, tot); if (tot >= 8) d.master = true; S.save();
      const msg = tot >= 8 ? `Bravo ! ${tot} sur ${all} : tu es Maîtresse du cercle ! 👑` : `${tot} sur ${all} ! Encore un petit effort pour devenir Maîtresse du cercle.`;
      talk(msg); if (tot >= 8) { Sfx.win(); burst(wrap); burst(wrap); }
      body.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => go('defi') }, '↻ Rejouer le défi')));
    } }); } });
  }

  UI.openDialog(h('div', { class: 'panel be-panel cc-panel' }, UI.closeButton(),
    h('h2', null, '⭕ L’atelier du cercle', (S.get().cercle || {}).master ? h('span', { class: 'cc-crown' }, ' 👑') : null),
    h('div', { class: 'actions wrap cc-tabs' }, ...tabs), wrap, say, body), { label: 'Atelier du cercle', onClose: () => { cleanup(); Voice.stop(); } });
  go(tab);
}
