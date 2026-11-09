// L'Atelier des Tables (Salle des Nombres) : apprendre et mémoriser les tables de multiplication de 1 à 10.
// 1. Comprendre (rectangles d'étoiles, commutativité)  2. Les astuces (×1 ×2 ×10 ×5 ×9 avec les doigts ×4 ×3 ×6 ×7 ×8)
// 3. La grande grille 10×10 (chaque case réussie s'allume)  4. La comptine  5. Les jeux (étoiles filantes, mémory)
// 6. La révision intelligente (répétition espacée : on revoit plus souvent ce qui est difficile)  7. Vitraux + badge.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri } from './workshop.js';

const ST = () => { const b = S.get(); b.tables = b.tables || { box: {} }; b.tables.box = b.tables.box || {}; return b.tables; };
const key = (a, b) => `${Math.min(a, b)}x${Math.max(a, b)}`;
const box = (a, b) => ST().box[key(a, b)] || 0;               // 0 = jamais vu … 5 = parfaitement su
const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const NOMS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];
export const maitrise = (t) => { for (let i = 1; i <= 10; i++) if (box(t, i) < 3) return false; return true; };
function record(a, b, ok) {
  const st = ST(), k = key(a, b), before = st.box[k] || 0;
  st.box[k] = ok ? Math.min(5, before + 1) : Math.max(0, Math.min(1, before - 2));
  st.seen = (st.seen || 0) + 1; S.save();
  const won = [];
  for (let t = 1; t <= 10; t++) { const was = (st.won || []).includes(t); if (!was && maitrise(t)) { st.won = [...(st.won || []), t]; won.push(t); } }
  if ((st.won || []).length >= 10 && !st.badge) { st.badge = true; S.save(); }
  S.save(); return won;
}
// choix pondéré : les multiplications peu sues reviennent plus souvent
function pickFact(only) {
  const pool = [];
  for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) { if (only && a !== only && b !== only) continue; const w = [8, 6, 4, 2, 1, 0.5][box(a, b)]; pool.push([a, b, w]); }
  let r = Math.random() * pool.reduce((s, p) => s + p[2], 0);
  for (const p of pool) { r -= p[2]; if (r <= 0) return [p[0], p[1]]; }
  return [pool[0][0], pool[0][1]];
}
const distract = (a, b) => { const r = a * b, s = new Set([r]); const c = [r + a, r - a, r + b, r - b, (a + 1) * b, a * (b - 1), r + 10, r - 10, a + b, r + 1, r - 1]; for (const x of shuffle(c)) { if (x > 0 && !s.has(x)) s.add(x); if (s.size >= 4) break; } return shuffle([...s]); };

// ---------- 1. comprendre ----------
function comprendre(body, talk) {
  let a = 3, b = 4, flip = false;
  const grid = h('div', { class: 'tb-arr' }), eq = h('div', { class: 'tb-eq' }), frame = h('div', { class: 'tb-frame' }, grid);
  let spinning = false;
  const sel = (lab, get, set) => h('div', { class: 'tb-sel' }, h('span', null, lab), h('button', { class: 'btn small', type: 'button', onclick: () => { set(Math.max(1, get() - 1)); draw(); } }, '−'), h('b', null, ''), h('button', { class: 'btn small', type: 'button', onclick: () => { set(Math.min(10, get() + 1)); draw(); } }, '+'));
  const sa = sel('Rangées', () => a, (v) => { a = v; }), sb = sel('Étoiles par rangée', () => b, (v) => { b = v; });
  const draw = () => {
    sa.children[2].textContent = a; sb.children[2].textContent = b;
    const R = flip ? b : a, C = flip ? a : b;
    grid.style.gridTemplateColumns = `repeat(${C}, 1fr)`; grid.classList.toggle('flip', flip);
    grid.replaceChildren(...Array.from({ length: R * C }, (_, i) => h('span', { style: `animation-delay:${i * 0.02}s` }, '⭐')));
    eq.replaceChildren(h('b', null, `${R} rangées de ${C} étoiles`), h('span', null, ` = ${R} × ${C} = `), h('b', { class: 'tb-res' }, String(a * b)));
    talk(`${NOMS[R]} rangées de ${NOMS[C]} étoiles : ${NOMS[R]} fois ${NOMS[C]}, ça fait ${a * b}.`, false);
  };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Une multiplication, c’est des rangées toutes pareilles. Compose ton rectangle d’étoiles !'), h('div', { class: 'actions wrap' }, sa, sb,
    h('button', { class: 'btn primary', type: 'button', 'data-testid': 'tb-flip', onclick: () => {
      // le rectangle d'étoiles tourne vraiment d'un quart de tour, puis les rangées se réorganisent
      if (spinning) return; spinning = true; Sfx.bloop(); frame.classList.add('spin');
      setTimeout(() => { flip = !flip; frame.classList.add('nospin'); frame.classList.remove('spin'); draw(); void frame.offsetWidth; frame.classList.remove('nospin'); frame.classList.add('landed'); spinning = false; setTimeout(() => frame.classList.remove('landed'), 700);
        talk(`Tu as tourné le rectangle : ${flip ? b : a} rangées de ${flip ? a : b}. ${b} fois ${a}, c’est la même chose que ${a} fois ${b} ! Il y a toujours ${a * b} étoiles.`); }, 950);
    } }, '🔄 Tourner le rectangle')), frame, eq,
    h('p', { class: 'muted' }, '💡 3 × 4 = 4 × 3 : quand tu connais l’une, tu connais l’autre. Ça fait deux fois moins à apprendre !'));
  draw(); talk('Une multiplication, ce sont des rangées toutes pareilles. Compose ton rectangle !');
}

// ---------- 2. les astuces ----------
const ASTUCES = [
  [1, '×1 : le nombre ne change pas', '1 fois 7 = 7. Facile !'],
  [10, '×10 : on ajoute un zéro', '10 × 6 = 60 : le 6 recule d’un rang, et le 0 prend sa place.'],
  [2, '×2 : le double', '2 × 8 = 8 + 8 = 16.'],
  [5, '×5 : la moitié de ×10', '5 × 8 = la moitié de 80 = 40. Les résultats finissent toujours par 0 ou 5.'],
  [9, '×9 : l’astuce des doigts', 'Plie le doigt du nombre : les doigts à gauche font les dizaines, ceux à droite les unités !'],
  [4, '×4 : le double du double', '4 × 7 : double de 7 = 14, double de 14 = 28.'],
  [3, '×3 : le double + une fois', '3 × 6 = 12 + 6 = 18.'],
  [6, '×6 : ×5 + une fois', '6 × 7 = 35 + 7 = 42.'],
  [8, '×8 : double, double, double', '8 × 6 : 12, 24, 48.'],
  [7, '×7 : les derniers à apprendre', 'Tu connais déjà presque tout ! Il reste 7×7 = 49, 7×8 = 56 (5, 6, 7, 8 !) et 7×9 = 63.'],
];
function astuces(body, talk) {
  const zone = h('div');
  const show = (t, titre, txt) => {
    const kids = [h('h3', null, titre), h('p', null, txt)];
    if (t === 9) {
      const hands = h('div', { class: 'tb-hands' }), out = h('p', { class: 'tb-res' }, 'Touche un doigt !');
      for (let i = 1; i <= 10; i++) hands.append(h('button', { class: 'tb-finger', type: 'button', 'data-i': i, onclick: (e) => {
        [...hands.children].forEach((f) => f.classList.toggle('bent', f === e.currentTarget)); const g = i - 1, d = 10 - i;
        out.textContent = `9 × ${i} : ${g} doigt${g > 1 ? 's' : ''} à gauche, ${d} à droite → ${9 * i}`; talk(`Neuf fois ${NOMS[i]} : ${g} à gauche, ${d} à droite. ${9 * i} !`); Sfx.bloop();
      } }, String(i)));
      kids.push(hands, out);
    } else {
      kids.push(h('div', { class: 'tb-line' }, ...Array.from({ length: 10 }, (_, i) => h('span', null, `${t} × ${i + 1} = `, h('b', null, String(t * (i + 1)))))));
    }
    zone.replaceChildren(...kids); talk(`${titre}. ${txt}`);
  };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Commence par les tables faciles : avec ces astuces, il ne reste presque rien à apprendre par cœur !'),
    h('div', { class: 'actions wrap' }, ...ASTUCES.map(([t, ti, tx]) => h('button', { class: 'btn small' + (maitrise(t) ? ' done' : ''), type: 'button', 'data-testid': 'tb-ast-' + t, onclick: () => show(t, ti, tx) }, (maitrise(t) ? '✅ ' : '') + `×${t}`))), zone);
  show(...ASTUCES[0]);
}

// ---------- 3. la grande grille ----------
function grille(body, talk) {
  const g = h('div', { class: 'tb-grid' }), q = h('div', { class: 'tb-ask' });
  const col = (n) => ['#2a2050', '#4a3a8a', '#6a5ac0', '#c99a2e', '#e8b84a', '#ffd96a'][n];
  const draw = () => g.replaceChildren(h('span', { class: 'tb-h' }, '×'), ...Array.from({ length: 10 }, (_, i) => h('span', { class: 'tb-h' }, String(i + 1))),
    ...Array.from({ length: 10 }, (_, r) => [h('span', { class: 'tb-h' }, String(r + 1)), ...Array.from({ length: 10 }, (_, c) => { const a = r + 1, b = c + 1, n = box(a, b);
      return h('button', { class: 'tb-cell' + (n >= 3 ? ' lit' : ''), type: 'button', style: `--c:${col(n)}`, 'data-testid': `tb-c-${a}-${b}`, onclick: () => ask(a, b) }, n >= 3 ? String(a * b) : '');
    })]).flat());
  const ask = (a, b) => {
    const opts = distract(a, b);
    q.replaceChildren(h('p', { class: 'tb-q' }, `${a} × ${b} = ?`), h('div', { class: 'actions wrap' }, ...opts.map((o) => h('button', { class: 'btn', type: 'button', onclick: () => {
      const ok = o === a * b; const won = record(a, b, ok);
      if (ok) { Sfx.ok(); star(); talk(`Oui ! ${a} fois ${b}, ${a * b}.`, false); } else { Sfx.ko(); talk(`Non : ${a} × ${b} = ${a * b}. Regarde : c’est aussi ${b} × ${a}.`); }
      if (won.length) { Sfx.win(); burst(body); talk(`Bravo ! Tu maîtrises la table de ${won.join(' et ')} : un vitrail s’allume !`); }
      draw(); q.replaceChildren();
    } }, String(o)))));
    talk(`${NOMS[a]} fois ${NOMS[b]} ?`);
  };
  draw();
  body.replaceChildren(h('p', { class: 'prompt' }, 'Touche une case : si tu trouves le résultat trois fois, la case s’allume pour toujours. Remarque : 3 × 7 et 7 × 3 s’allument ensemble !'), h('div', { class: 'tb-gwrap' }, g, q));
}

// ---------- 4. la comptine ----------
function comptine(body, talk) {
  let stop = false;
  const out = h('div', { class: 'tb-song' });
  const sing = (t) => {
    stop = false; out.replaceChildren(...Array.from({ length: 10 }, (_, i) => h('div', { class: 'tb-verse', 'data-i': i }, `${t} × ${i + 1} = ${t * (i + 1)}`)));
    let i = 0;
    const next = () => { if (stop || i >= 10 || !out.isConnected) { if (i >= 10) { Sfx.win(); talk('Bravo ! Maintenant, chante-la sans regarder !', false); } return; }
      [...out.children].forEach((v, k) => v.classList.toggle('on', k === i)); Sfx.tick && Sfx.tick(i % 2);
      Voice.speak(`${NOMS[t]} fois ${NOMS[i + 1]}… ${t * (i + 1)} !`, { onEnd: () => setTimeout(next, 250), force: true }); i++; };
    next();
  };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Chante la table avec moi, en rythme ! Puis cache l’écran et chante-la toute seule.'),
    h('div', { class: 'actions wrap' }, ...Array.from({ length: 10 }, (_, i) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'tb-song-' + (i + 1), onclick: () => { stop = true; Voice.stop(); setTimeout(() => sing(i + 1), 120); } }, `🎵 ×${i + 1}`)),
      h('button', { class: 'btn small', type: 'button', onclick: () => { stop = true; Voice.stop(); } }, '⏹')), out);
  talk('Choisis une table et chante avec moi !', false);
  return () => { stop = true; Voice.stop(); };
}

// ---------- 5. les jeux ----------
function etoiles(body, talk, table) {
  let score = 0, n = 0, raf = 0, items = [], cur = null, last = 0, boost = 1; // chaque bonne réponse accélère la chute
  const sky = h('div', { class: 'tb-sky' }), q = h('div', { class: 'tb-q' }), sc = h('div', { class: 'tb-score' });
  const newQ = () => { if (n >= 10) return end(); cur = pickFact(table); n++; q.textContent = `${cur[0]} × ${cur[1]} = ?`; sc.textContent = `${n}/10 · ⭐ ${score} · ⚡ vitesse ×${boost.toFixed(1)}`; spawn(); };
  const spawn = () => { items.forEach((it) => it.e.remove()); items = distract(...cur).map((v, i) => { const e = h('button', { class: 'tb-fall', type: 'button', 'data-v': v }, String(v)); const it = { v, e, x: 10 + i * 22 + Math.random() * 6, y: -10 - Math.random() * 25, sp: 9 + Math.random() * 5 }; e.onclick = () => hit(it); sky.append(e); return it; }); };
  const hit = (it) => { const ok = it.v === cur[0] * cur[1]; record(cur[0], cur[1], ok); if (ok) { score++; star(); Sfx.ok(); it.e.classList.add('good'); boost = Math.min(2.6, boost * 1.15); sky.classList.remove('faster'); void sky.offsetWidth; sky.classList.add('faster'); } else { Sfx.ko(); it.e.classList.add('bad'); talk(`${cur[0]} × ${cur[1]} = ${cur[0] * cur[1]}`, false); } setTimeout(newQ, 450); cur = null; };
  const loop = (t) => { if (!sky.isConnected) return; raf = requestAnimationFrame(loop); const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    for (const it of items) { it.y += it.sp * boost * dt; it.e.style.left = it.x + '%'; it.e.style.top = it.y + '%'; }
    if (cur && items.length && items.every((it) => it.y > 100)) { record(cur[0], cur[1], false); Sfx.ko(); talk(`Trop tard ! ${cur[0]} × ${cur[1]} = ${cur[0] * cur[1]}`, false); cur = null; setTimeout(newQ, 400); } };
  const end = () => { cancelAnimationFrame(raf); items.forEach((it) => it.e.remove()); q.textContent = `Bravo ! ${score}/10 étoiles attrapées`; if (score >= 8) { Sfx.win(); burst(body); } const r = ST(); if (score > (r.best || 0)) { r.best = score; S.save(); talk('Nouveau record !'); } };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Attrape la bonne réponse avant qu’elle ne tombe !'), q, sky, sc);
  newQ(); raf = requestAnimationFrame(loop); talk('Attrape la bonne étoile !', false);
  return () => cancelAnimationFrame(raf);
}
function memory(body, talk, table) {
  const facts = []; const used = new Set();
  while (facts.length < 6) { const [a, b] = pickFact(table); const r = a * b; if (used.has(r)) continue; used.add(r); facts.push([a, b]); }
  const cards = shuffle(facts.flatMap(([a, b]) => [{ id: `${a}x${b}`, t: `${a} × ${b}` }, { id: `${a}x${b}`, t: String(a * b) }]));
  let open = [], found = 0, tries = 0;
  const g = h('div', { class: 'tb-mem' });
  cards.forEach((c) => { const e = h('button', { class: 'tb-card', type: 'button' }, h('span', null, c.t)); e.onclick = () => {
    if (e.classList.contains('up') || open.length >= 2) return; e.classList.add('up'); open.push([c, e]); Sfx.tap();
    if (open.length === 2) { tries++; const [[c1, e1], [c2, e2]] = open; setTimeout(() => {
      const [a, b] = c1.id.split('x').map(Number);
      if (c1.id === c2.id) { found++; e1.classList.add('ok'); e2.classList.add('ok'); record(a, b, true); Sfx.ok(); if (found === 6) { Sfx.win(); burst(body); star(2); talk(`Bravo ! Toutes les paires en ${tries} essais.`); } }
      else { e1.classList.remove('up'); e2.classList.remove('up'); }
      open = []; }, 700); }
  }; g.append(e); });
  body.replaceChildren(h('p', { class: 'prompt' }, 'Retrouve les paires : une multiplication et son résultat.'), g);
  talk('Retrouve les paires !', false);
}
function jeux(body, talk) {
  const zone = h('div'); let stop = null; let table = 0;
  const go = (f) => { if (stop) stop(); stop = f(zone, talk, table || null) || null; };
  const tsel = h('select', { class: 'tb-tsel', 'aria-label': 'Table', onchange: (e) => { table = +e.target.value; } }, h('option', { value: 0 }, 'Toutes les tables'), ...Array.from({ length: 10 }, (_, i) => h('option', { value: i + 1 }, `Table de ${i + 1}`)));
  body.replaceChildren(h('div', { class: 'actions wrap' }, tsel, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'tb-etoiles', onclick: () => go(etoiles) }, '🌠 Les étoiles filantes'), h('button', { class: 'btn', type: 'button', 'data-testid': 'tb-memory', onclick: () => go(memory) }, '🃏 Le mémory des tables')), zone);
  go(etoiles);
  return () => stop && stop();
}

// ---------- 6. la révision intelligente ----------
function revision(body, talk) {
  let n = 0, ok = 0;
  const q = h('div'), info = h('p', { class: 'muted' });
  const next = () => {
    if (n >= 12) { q.replaceChildren(h('p', { class: 'tb-res' }, `${ok}/12 ! Reviens demain : les multiplications difficiles reviendront plus souvent.`)); if (ok >= 10) { Sfx.win(); burst(body); } return; }
    const [a, b] = Math.random() < 0.5 ? pickFact() : pickFact().reverse(); n++;
    const inp = h('input', { class: 'tb-in', inputmode: 'numeric', 'aria-label': 'Ta réponse', 'data-testid': 'tb-in' });
    const check = () => { const v = parseInt(inp.value, 10); if (Number.isNaN(v)) return; const good = v === a * b; record(a, b, good);
      if (good) { ok++; Sfx.ok(); star(); talk('Oui !', false); } else { Sfx.ko(); talk(`${a} × ${b} = ${a * b}. Tu la reverras bientôt !`); }
      setTimeout(next, good ? 500 : 1800); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    q.replaceChildren(h('p', { class: 'tb-q' }, `${a} × ${b} = `), inp, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'tb-ok', onclick: check }, 'Valider'), h('p', { class: 'muted' }, `${n}/12`));
    setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) { /* rien */ } }, 50);
  };
  const st = ST(), su = Object.values(st.box).filter((v) => v >= 3).length;
  info.textContent = `Tu connais déjà ${su} multiplications sur 55 (3 × 7 et 7 × 3 comptent pour une). Ici, je te pose surtout celles que tu ne connais pas encore.`;
  body.replaceChildren(h('p', { class: 'prompt' }, 'La révision malicieuse : 12 questions, tape la réponse.'), info, q);
  next();
}

// ---------- les vitraux (progression) ----------
function vitraux() {
  const st = ST();
  return h('div', { class: 'tb-vitraux', 'aria-label': 'Tables maîtrisées' }, ...Array.from({ length: 10 }, (_, i) => h('span', { class: 'tb-vit' + (maitrise(i + 1) ? ' on' : ''), title: `Table de ${i + 1}` }, `×${i + 1}`)), st.badge ? h('b', { class: 'tb-badge' }, '👑 Maîtresse des tables') : null);
}

export function open(tab = 'comprendre') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div'), vit = h('div'); let stop = null;
  const T = [['comprendre', '⭐ Comprendre', comprendre], ['astuces', '💡 Les astuces', astuces], ['grille', '🔲 La grande grille', grille], ['comptine', '🎵 La comptine', comptine], ['jeux', '🎮 Les jeux', jeux], ['revision', '🧠 La révision', revision]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'tb-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel tb-panel' }, UI.closeButton(), h('h2', null, '✖️ L’Atelier des Tables'), vit, h('div', { class: 'actions wrap' }, ...tabs), body, say),
    { label: 'L’Atelier des Tables', onClose: () => { Voice.stop(); if (stop) stop(); } });
  function go(k) { if (stop) { stop(); stop = null; } Voice.stop(); tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); vit.replaceChildren(vitraux()); stop = T.find((x) => x[0] === k)[2](body, talk) || null; }
  go(tab);
}
