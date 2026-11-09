// Laboratoire du ciel (Observatoire) : 1) le globe et les heures, 2) les phases de la Lune,
// 3) relier les étoiles (Grande Ourse, étoile Polaire), 4) étoile ou planète ?
// Chaque atelier : découvrir → manipuler → petit défi (étoiles à gagner).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import * as SOL from './solar.js';

const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };
const rad = (d) => d * Math.PI / 180;
const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const star = () => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + 1; b.coins += 2; S.save(); };
const hh = (x) => { const m = ((x % 24) + 24) % 24, H = Math.floor(m), M = Math.round((m - H) * 60) % 60; return `${String(H).padStart(2, '0')} h ${String(M).padStart(2, '0')}`; };
function burst(host) { for (let k = 0; k < 12; k++) { const s = h('span', { class: 'abq-spark', 'aria-hidden': 'true' }, k % 3 ? '✨' : '🌟'); s.style.cssText = `left:${50 + (Math.random() - 0.5) * 50}%;top:${50 + (Math.random() - 0.5) * 40}%;--dx:${(Math.random() - 0.5) * 220}px;--dy:${-60 - Math.random() * 140}px`; host.append(s); setTimeout(() => s.remove(), 1500); } }

const TABS = [['globe', '🌍 Le globe et les heures'], ['lune', '🌙 Les phases de la Lune'], ['etoiles', '✨ Relier les étoiles'], ['tri', '⭐ Étoile ou planète ?'], ['sol', '🪐 La Terre et les planètes']];

export function open(tab = 'globe') {
  const box = h('div', { class: 'sky-box' });
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const body = h('div', { class: 'cc-body' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  let gen = 0, cleanup = () => {};
  const later = (fn, ms) => { const g = gen; setTimeout(() => { if (g === gen && box.isConnected) fn(); }, ms); };
  const tabs = TABS.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-tab': k, 'data-testid': 'sky-' + k, onclick: () => (k === 'sol' ? (gen++, cleanup(), SOL.open()) : go(k)) }, l));
  function go(k) {
    gen++; cleanup(); cleanup = () => {}; Voice.stop(); say.textContent = ''; box.replaceChildren(); body.replaceChildren();
    tabs.forEach((b) => b.classList.toggle('primary', b.dataset.tab === k));
    ({ globe, lune, etoiles, tri })[k]();
  }
  // petit défi : questions à choix et tâches à vérifier sur le modèle
  function defi(list, title = '🏆 Défi') {
    let i = 0, ok = 0;
    const q = h('p', { class: 'prompt' }), ans = h('div', { class: 'answers cc-vf' }), sc = h('span', { class: 'be-score' });
    const start = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'sky-defi', onclick: () => { start.remove(); ask(); } }, title + ` (${list.length} questions)`);
    body.append(h('div', { class: 'actions' }, start), q, ans, sc);
    function ask() {
      if (i >= list.length) { q.textContent = `${ok} / ${list.length} ! ${ok === list.length ? 'Parfait, petite astronome !' : 'Bien joué !'}`; talk(q.textContent); ans.replaceChildren(h('button', { class: 'btn', type: 'button', onclick: () => { i = 0; ok = 0; ask(); } }, '↻ Rejouer le défi')); sc.textContent = ''; if (ok === list.length) { Sfx.win(); burst(box); } return; }
      const it = list[i]; q.textContent = it.q; Voice.speak(it.q); sc.textContent = `${i + 1}/${list.length}`;
      const done = (good) => { if (good) { ok++; star(); Sfx.win(); burst(box); talk('Bravo ! ' + it.why, false); } else { Sfx.tap(); talk('Pas tout à fait. ' + it.why, false); } ans.querySelectorAll('button').forEach((b) => { b.disabled = true; }); i++; later(ask, 2600); };
      if (it.check) ans.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'sky-check', onclick: () => done(it.check()) }, '✓ Vérifier sur le modèle'));
      else ans.replaceChildren(...shuffle(it.opts.map((o, k) => [o, k])).map(([o, k]) => h('button', { class: 'choice', type: 'button', onclick: () => done(k === 0) }, o)));
    }
  }

  // ---------- 1. le globe et les heures ----------
  function globe() {
    const CX = 330, CY = 250, R = 150;
    const CITIES = [['Bruxelles', 0, '#ffd84a'], ['New York', -6, '#ff8a8a'], ['Tokyo', 8, '#8affc1'], ['Sydney', 10, '#9fc7ff'], ['Rio', -4, '#ffb86b']];
    let hB = 9;
    const svg = sv('svg', { viewBox: '0 0 600 500', class: 'sky-svg', role: 'img', 'aria-label': 'La Terre vue du pôle Nord, éclairée par le Soleil' });
    const sunG = sv('g', {}, sv('circle', { cx: -10, cy: CY, r: 70, fill: '#ffcf3a', class: 'sky-sun' }), sv('text', { x: 40, y: CY + 100, class: 'sky-lbl' }, 'Soleil'));
    for (let k = -2; k <= 2; k++) sunG.append(sv('line', { x1: 70, y1: CY + k * 55, x2: CX - R - 10, y2: CY + k * 55, stroke: '#ffd84a55', 'stroke-width': 5, 'stroke-dasharray': '10 10' }));
    const earth = sv('g', { class: 'sky-earth' });
    const night = sv('path', { d: `M${CX},${CY - R} A${R},${R} 0 0 1 ${CX},${CY + R} Z`, fill: '#000a' });
    const top = sv('g');
    svg.append(sunG, sv('circle', { cx: CX, cy: CY, r: R, fill: '#2f76d6', stroke: '#9fd0ff', 'stroke-width': 3 }), earth, night, top,
      sv('text', { x: CX - R / 2, y: CY - R - 14, class: 'sky-lbl' }, '☀️ jour'), sv('text', { x: CX + R / 2, y: CY - R - 14, class: 'sky-lbl' }, '🌙 nuit'),
      sv('circle', { cx: CX, cy: CY, r: 7, fill: '#fff' }), sv('text', { x: CX, y: CY + 26, class: 'sky-lbl small' }, 'pôle Nord'));
    // continents stylisés (vus du pôle) : simples taches qui tournent avec la Terre
    const blobs = [[20, 110, 34], [60, 95, 28], [140, 105, 40], [-75, 105, 34], [-100, 70, 22], [150, 60, 18], [-45, 120, 24]];
    const tbl = h('div', { class: 'sky-hours' });
    const slider = h('input', { type: 'range', min: 0, max: 23.75, step: 0.25, value: hB, class: 'sky-range', 'aria-label': 'Heure à Bruxelles' });
    function draw() {
      earth.replaceChildren(); top.replaceChildren();
      const beta = (H) => rad(180 + (H - 12) * 15);
      for (const [dl, rr, s] of blobs) { const b = beta(hB + dl / 15); earth.append(sv('circle', { cx: CX + rr * Math.cos(b), cy: CY - rr * Math.sin(b), r: s, fill: '#5fbf5a', opacity: 0.9 })); }
      tbl.replaceChildren();
      for (const [n, off, col] of CITIES) {
        const H = hB + off, b = beta(H), x = CX + (R - 18) * Math.cos(b), y = CY - (R - 18) * Math.sin(b), hn = ((H % 24) + 24) % 24, day = hn >= 6 && hn < 18;
        top.append(sv('circle', { cx: x, cy: y, r: 9, fill: col, stroke: '#000', 'stroke-width': 2 }), sv('text', { x: x + (Math.cos(b) > 0 ? 16 : -16), y: y + 5, class: 'sky-city', 'text-anchor': Math.cos(b) > 0 ? 'start' : 'end' }, n));
        tbl.append(h('span', { style: `border-color:${col}` }, `${day ? '☀️' : '🌙'} ${n} : ${hh(H)}`));
      }
    }
    let drag = null;
    svg.addEventListener('pointerdown', (e) => { const r = svg.getBoundingClientRect(); drag = Math.atan2(-((e.clientY - r.top) * 500 / r.height - CY), (e.clientX - r.left) * 600 / r.width - CX); svg.setPointerCapture(e.pointerId); });
    svg.addEventListener('pointermove', (e) => { if (drag == null) return; const r = svg.getBoundingClientRect(); const a = Math.atan2(-((e.clientY - r.top) * 500 / r.height - CY), (e.clientX - r.left) * 600 / r.width - CX); let d = a - drag; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; drag = a; hB = (((hB + d * 12 / Math.PI) % 24) + 24) % 24; slider.value = hB; draw(); });
    svg.addEventListener('pointerup', () => { drag = null; });
    slider.addEventListener('input', () => { hB = +slider.value; draw(); });
    let raf = 0; const play = h('button', { class: 'btn small', type: 'button', onclick: () => { if (raf) { cancelAnimationFrame(raf); raf = 0; play.textContent = '▶️ Faire tourner'; return; } play.textContent = '⏸ Stop'; let t0 = performance.now(); const loop = (t) => { hB = (hB + (t - t0) / 1000 * 2) % 24; t0 = t; slider.value = hB; draw(); raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop); } }, '▶️ Faire tourner');
    cleanup = () => cancelAnimationFrame(raf);
    box.append(svg, h('div', { class: 'sky-ctrl' }, h('label', null, '🕘 Heure à Bruxelles ', slider), play), tbl);
    draw();
    talk('Voici la Terre vue d’en haut, au-dessus du pôle Nord. Le Soleil n’éclaire qu’une moitié : là, c’est le jour ; de l’autre côté, c’est la nuit. Fais tourner la Terre avec ton doigt et regarde l’heure changer dans les villes !');
    body.append(h('p', { class: 'muted' }, 'Heures d’hiver. La Terre fait un tour sur elle-même en 24 heures : chaque ville passe à son tour du jour à la nuit.'));
    defi([
      { q: 'Fais tourner la Terre pour qu’il soit midi à Bruxelles (le Soleil en face), puis vérifie.', check: () => Math.abs(hB - 12) <= 0.75, why: 'À midi, Bruxelles est juste en face du Soleil.' },
      { q: 'Quand il est 15 h à Bruxelles, quelle heure est-il à New York ?', opts: ['9 h', '21 h', '15 h'], why: 'New York a 6 heures de retard : 15 h − 6 h = 9 h.' },
      { q: 'Quand il est midi à Bruxelles, où fait-il nuit ?', opts: ['À Tokyo et à Sydney', 'À New York', 'Partout sur la Terre'], why: 'Tokyo (20 h) et Sydney (22 h) sont du côté qui ne voit pas le Soleil.' },
      { q: 'Pourquoi y a-t-il le jour et la nuit ?', opts: ['Parce que la Terre tourne sur elle-même', 'Parce que le Soleil s’éteint la nuit', 'Parce que la Lune cache le Soleil'], why: 'La Terre tourne sur elle-même en 24 heures : chaque endroit passe du côté éclairé au côté sombre.' },
      { q: 'Fais tourner la Terre pour qu’il fasse nuit à Bruxelles, puis vérifie.', check: () => hB < 6 || hB >= 18, why: 'La nuit, Bruxelles est du côté de la Terre qui tourne le dos au Soleil.' },
    ]);
  }

  // ---------- 2. les phases de la Lune ----------
  function lune() {
    const CX = 250, CY = 230, OR = 150;
    let th = 40; // angle de la Lune (0 = entre la Terre et le Soleil), sens inverse des aiguilles d'une montre vu du pôle Nord
    const svg = sv('svg', { viewBox: '0 0 760 460', class: 'sky-svg', role: 'img', 'aria-label': 'La Lune autour de la Terre et ce qu’on voit depuis la Terre' });
    for (let k = -3; k <= 3; k++) svg.append(sv('line', { x1: 0, y1: CY + k * 55, x2: 40, y2: CY + k * 55, stroke: '#ffd84a88', 'stroke-width': 5 }));
    svg.append(sv('text', { x: 6, y: 30, class: 'sky-lbl', style: 'text-anchor:start' }, '☀️ lumière du Soleil →'));
    svg.append(sv('circle', { cx: CX, cy: CY, r: OR, fill: 'none', stroke: '#ffffff33', 'stroke-width': 2, 'stroke-dasharray': '6 8' }));
    svg.append(sv('circle', { cx: CX, cy: CY, r: 34, fill: '#2f76d6' }), sv('path', { d: `M${CX},${CY - 34} A34,34 0 0 1 ${CX},${CY + 34} Z`, fill: '#000a' }), sv('text', { x: CX, y: CY + 56, class: 'sky-lbl small' }, 'Terre'));
    const moon = sv('g', { class: 'sky-moon' });
    const view = sv('g');
    const name = sv('text', { x: 620, y: 360, class: 'sky-lbl' });
    svg.append(moon, sv('rect', { x: 500, y: 60, width: 240, height: 330, rx: 18, fill: '#0b0a26', stroke: '#f6dc92', 'stroke-width': 2 }), sv('text', { x: 620, y: 92, class: 'sky-lbl small' }, 'Ce que Soumaya voit'), sv('text', { x: 620, y: 112, class: 'sky-lbl small' }, 'depuis la Terre :'), view, name);
    const NAMES = [[22.5, 'Nouvelle Lune'], [67.5, 'Premier croissant'], [112.5, 'Premier quartier'], [157.5, 'Lune gibbeuse croissante'], [202.5, 'Pleine Lune'], [247.5, 'Lune gibbeuse décroissante'], [292.5, 'Dernier quartier'], [337.5, 'Dernier croissant'], [361, 'Nouvelle Lune']];
    const phaseName = (t) => NAMES.find(([a]) => t < a)[1];
    function phasePath(cx, cy, r, t) {
      const c = Math.cos(rad(t)), wax = Math.sin(rad(t)) > 0, rx = Math.abs(c) * r, cres = c > 0;
      const outer = wax ? 1 : 0, inner = wax ? (cres ? 0 : 1) : (cres ? 1 : 0);
      return `M${cx},${cy - r} A${r},${r} 0 0 ${outer} ${cx},${cy + r} A${rx},${r} 0 0 ${inner} ${cx},${cy - r} Z`;
    }
    function draw() {
      const b = rad(180 + th), mx = CX + OR * Math.cos(b), my = CY - OR * Math.sin(b);
      moon.replaceChildren(sv('circle', { cx: mx, cy: my, r: 22, fill: '#3a3a4a' }), sv('path', { d: `M${mx},${my - 22} A22,22 0 0 0 ${mx},${my + 22} Z`, fill: '#f2f0e0' }), sv('circle', { cx: mx, cy: my, r: 34, fill: 'transparent', class: 'sky-grab' }));
      view.replaceChildren(sv('circle', { cx: 620, cy: 230, r: 80, fill: '#2a2a36' }), sv('path', { d: phasePath(620, 230, 80, th), fill: '#f2f0e0' }));
      name.textContent = phaseName(((th % 360) + 360) % 360);
    }
    let drag = false;
    const ang = (e) => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * 760 / r.width - CX, y = -((e.clientY - r.top) * 460 / r.height - CY); return (((Math.atan2(y, x) * 180 / Math.PI) - 180) % 360 + 360) % 360; };
    svg.addEventListener('pointerdown', (e) => { const r = svg.getBoundingClientRect(); if ((e.clientX - r.left) * 760 / r.width > 470) return; drag = true; svg.setPointerCapture(e.pointerId); th = ang(e); draw(); });
    svg.addEventListener('pointermove', (e) => { if (!drag) return; th = ang(e); draw(); });
    svg.addEventListener('pointerup', () => { drag = false; });
    box.append(svg); draw();
    talk('La Lune tourne autour de la Terre. Une moitié de la Lune est toujours éclairée par le Soleil, mais depuis la Terre, on n’en voit qu’une partie. Déplace la Lune avec ton doigt et regarde sa forme changer !');
    body.append(h('p', { class: 'muted' }, 'Un tour complet de la Lune autour de la Terre dure environ 29 jours et demi : à peu près un mois.'));
    const near = (a, tol = 22.5) => { const d = Math.abs((((th - a) % 360) + 540) % 360 - 180); return d <= tol; };
    defi([
      { q: 'Place la Lune pour voir la pleine Lune, puis vérifie.', check: () => near(180), why: 'Pleine Lune : la Lune est de l’autre côté de la Terre par rapport au Soleil, on voit toute sa face éclairée.' },
      { q: 'Place la Lune pour qu’on ne la voie presque pas (nouvelle Lune).', check: () => near(0), why: 'Nouvelle Lune : la Lune est entre la Terre et le Soleil, sa face éclairée est tournée de l’autre côté.' },
      { q: 'Place la Lune au premier quartier (une moitié éclairée, à droite).', check: () => near(90), why: 'Premier quartier : on voit la moitié droite éclairée.' },
      { q: 'Pourquoi la Lune semble-t-elle changer de forme ?', opts: ['Parce qu’on voit une partie plus ou moins grande de sa face éclairée', 'Parce que l’ombre de la Terre la couvre chaque soir', 'Parce que la Lune grossit et rétrécit'], why: 'La Lune tourne autour de la Terre : selon sa place, on voit plus ou moins sa moitié éclairée par le Soleil.' },
      { q: 'Combien de temps faut-il pour passer d’une pleine Lune à la suivante ?', opts: ['Environ un mois', 'Un jour', 'Un an'], why: 'Environ 29 jours et demi, à peu près un mois.' },
    ]);
  }

  // ---------- 3. relier les étoiles ----------
  function etoiles() {
    const ST = { alkaid: [150, 120], mizar: [215, 150], alioth: [265, 175], megrez: [320, 205], phecda: [335, 280], merak: [430, 290], dubhe: [440, 200], polaire: [458, 40] };
    const EDGES = [['alkaid', 'mizar'], ['mizar', 'alioth'], ['alioth', 'megrez'], ['megrez', 'phecda'], ['phecda', 'merak'], ['merak', 'dubhe'], ['dubhe', 'megrez']];
    const key = (a, b) => [a, b].sort().join('-');
    const want = new Set(EDGES.map(([a, b]) => key(a, b)));
    const extra = Array.from({ length: 34 }, () => [Math.random() * 600, Math.random() * 420]).filter(([x, y]) => Object.values(ST).every(([a, b]) => Math.hypot(a - x, b - y) > 40));
    const svg = sv('svg', { viewBox: '0 0 600 420', class: 'sky-svg sky-night', role: 'img', 'aria-label': 'Ciel étoilé' });
    const lines = sv('g'), guide = sv('g'), stars = sv('g');
    svg.append(sv('rect', { width: 600, height: 420, fill: '#070720' }), lines, guide, stars);
    for (const [x, y] of extra) stars.append(sv('circle', { cx: x, cy: y, r: Math.random() * 1.8 + 0.6, fill: '#fff', opacity: 0.6 }));
    const drawn = new Set(); let sel = null, phase = 'ourse';
    const els = {};
    for (const [n, [x, y]] of Object.entries(ST)) {
      const g = sv('g', { class: 'sky-star', 'data-s': n, tabindex: 0 }, sv('circle', { cx: x, cy: y, r: 26, fill: 'transparent' }), sv('circle', { cx: x, cy: y, r: n === 'polaire' ? 6 : 5.5, fill: '#fff', class: 'core' }));
      g.addEventListener('click', () => tap(n)); stars.append(g); els[n] = g;
    }
    function tap(n) {
      if (phase === 'polaire') { if (n === 'polaire') { phase = 'fini'; els.polaire.classList.add('found'); star(); Sfx.win(); burst(box); guide.append(sv('text', { x: 458, y: 22, class: 'sky-lbl' }, '⬆ NORD'), sv('text', { x: 470, y: 68, class: 'sky-lbl small', style: 'text-anchor:start' }, 'étoile Polaire')); talk('Bravo ! Voici l’étoile Polaire. Elle est toujours au-dessus du nord : si tu la regardes, le nord est devant toi !'); } else { Sfx.tap(); talk('Ce n’est pas elle. Suis la flèche : prolonge le bord de la casserole vers le haut.', false); } return; }
      if (phase !== 'ourse') return;
      if (!sel) { sel = n; els[n].classList.add('sel'); Sfx.tap(); return; }
      if (sel === n) { els[n].classList.remove('sel'); sel = null; return; }
      const k = key(sel, n), [x1, y1] = ST[sel], [x2, y2] = ST[n];
      els[sel].classList.remove('sel');
      if (want.has(k) && !drawn.has(k)) { drawn.add(k); lines.append(sv('line', { x1, y1, x2, y2, stroke: '#9fd0ff', 'stroke-width': 3, class: 'cc-draw', pathLength: 100 })); Sfx.coin(); }
      else if (!want.has(k)) { Sfx.tap(); talk('Ces deux étoiles ne sont pas voisines dans la casserole. Essaie une autre !', false); }
      sel = n; els[n].classList.add('sel');
      if (drawn.size === want.size) {
        els[n].classList.remove('sel'); sel = null; phase = 'polaire'; star(); Sfx.win(); burst(box);
        stars.querySelectorAll('.sky-star').forEach((g) => { if (g.dataset.s !== 'polaire') g.classList.add('found'); });
        lines.append(sv('text', { x: 300, y: 330, class: 'sky-lbl' }, 'la Grande Ourse (la « casserole »)'));
        const [mx, my] = ST.merak, [dx, dy] = ST.dubhe;
        guide.append(sv('line', { x1: mx, y1: my, x2: dx + (dx - mx) * 1.8, y2: dy + (dy - my) * 1.75, stroke: '#ffd84a', 'stroke-width': 2.5, 'stroke-dasharray': '8 8', class: 'cc-draw', pathLength: 100 }));
        talk('Génial, tu as dessiné la Grande Ourse ! Maintenant, prolonge le bord de la casserole vers le haut, environ cinq fois sa longueur… et touche l’étoile que tu trouves.');
      }
    }
    box.append(svg);
    talk('Voici le ciel du soir, vers le nord. Les anciens ont imaginé des dessins en reliant des étoiles : ce sont les constellations. Relie les 7 étoiles brillantes pour dessiner la Grande Ourse, qui ressemble à une casserole !');
    body.append(h('p', { class: 'muted' }, 'Touche une étoile, puis sa voisine, pour tracer un trait. La casserole a un manche de 3 traits et un bac de 4 côtés.'));
    defi([
      { q: 'Qu’est-ce qu’une constellation ?', opts: ['Un dessin imaginé en reliant des étoiles', 'Un groupe d’étoiles qui se touchent', 'Une planète très brillante'], why: 'Ce sont des dessins inventés par les humains : les étoiles sont en réalité très loin les unes des autres.' },
      { q: 'Quelle direction l’étoile Polaire indique-t-elle ?', opts: ['Le nord', 'Le sud', 'L’est'], why: 'L’étoile Polaire est toujours au-dessus du nord.' },
      { q: 'Pourquoi les étoiles semblent-elles tourner dans le ciel pendant la nuit ?', opts: ['Parce que la Terre tourne sur elle-même', 'Parce que les étoiles se déplacent très vite', 'Parce que le vent les pousse'], why: 'C’est la Terre qui tourne ; les étoiles nous semblent bouger.' },
    ]);
  }

  // ---------- 4. étoile ou planète ? ----------
  function tri() {
    const ITEMS = [
      ['Le Soleil', 'etoile', '☀️', 'Le Soleil est une étoile : il produit sa propre lumière et sa chaleur.'],
      ['Sirius', 'etoile', '✨', 'Sirius est une étoile, la plus brillante du ciel la nuit.'],
      ['L’étoile Polaire', 'etoile', '⭐', 'L’étoile Polaire est une étoile, elle brille par elle-même.'],
      ['Vénus', 'planete', '🟡', 'Vénus est une planète : elle brille parce qu’elle renvoie la lumière du Soleil.'],
      ['Mars', 'planete', '🔴', 'Mars est une planète, elle renvoie la lumière du Soleil.'],
      ['Jupiter', 'planete', '🟠', 'Jupiter est une planète géante, elle ne produit pas de lumière.'],
      ['La Terre', 'planete', '🌍', 'La Terre est une planète : notre planète !'],
      ['La Lune', 'satellite', '🌙', 'La Lune n’est ni une étoile ni une planète : c’est un satellite qui tourne autour de la Terre. Elle renvoie la lumière du Soleil.'],
    ];
    const BINS = [['etoile', '⭐ Étoile', 'produit sa propre lumière'], ['planete', '🪐 Planète', 'tourne autour du Soleil, renvoie sa lumière'], ['satellite', '🌙 Satellite', 'tourne autour d’une planète']];
    let picked = null, ok = 0, n = 0;
    const cards = h('div', { class: 'sky-cards' }), bins = h('div', { class: 'sky-bins' });
    const items = shuffle(ITEMS);
    for (const [nm, k, ic, why] of items) {
      const c = h('button', { class: 'sky-card', type: 'button', 'data-testid': 'sky-card', onclick: () => { cards.querySelectorAll('.sky-card').forEach((x) => x.classList.remove('sel')); c.classList.add('sel'); picked = { c, nm, k, why }; Sfx.tap(); talk(`${nm} : dans quelle boîte ?`, false); } }, h('span', { class: 'ci' }, ic), nm);
      cards.append(c);
    }
    for (const [k, t, d] of BINS) {
      const b = h('button', { class: 'sky-bin', type: 'button', 'data-bin': k, onclick: () => {
        if (!picked) { talk('Choisis d’abord une carte, puis touche sa boîte.', false); return; }
        const p = picked; picked = null; n++;
        if (p.k === k) { ok++; star(); Sfx.win(); burst(box); talk('Bravo ! ' + p.why); b.querySelector('.sky-in').append(h('span', null, p.nm)); p.c.remove(); }
        else { Sfx.tap(); p.c.classList.remove('sel'); talk('Eh non ! ' + p.why); }
        if (!cards.children.length) { talk(`Tout est rangé ! ${ok} bonnes réponses du premier coup sur ${n} essais.`); cards.append(h('button', { class: 'btn', type: 'button', onclick: () => go('tri') }, '↻ Rejouer')); }
      } }, h('strong', null, t), h('small', null, d), h('div', { class: 'sky-in' }));
      bins.append(b);
    }
    box.append(h('div', { class: 'sky-tri' }, cards, bins));
    talk('Une étoile produit sa propre lumière, comme le Soleil. Une planète, elle, ne fait que renvoyer la lumière de son étoile. Range chaque carte dans la bonne boîte : touche une carte, puis une boîte.');
  }

  UI.openDialog(h('div', { class: 'panel be-panel cc-panel' }, UI.closeButton(),
    h('h2', null, '🔭 Le laboratoire du ciel'),
    h('div', { class: 'actions wrap cc-tabs' }, ...tabs), box, say, body), { label: 'Laboratoire du ciel', onClose: () => { gen++; cleanup(); Voice.stop(); } });
  go(tab);
}
