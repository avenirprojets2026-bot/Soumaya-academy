// Boulier magique (Salle des Nombres) : abaque M C D U, on déplace les boules du doigt.
// Exercices : placer un nombre, lire le boulier, décomposer, calculer. Chaque bonne réponse : lumière + étoile.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';

const RODS = [
  { k: 'M', name: 'milliers', one: 'millier', col: '#c86bff', glow: '#e3b4ff' },
  { k: 'C', name: 'centaines', one: 'centaine', col: '#3fa9ff', glow: '#a9dbff' },
  { k: 'D', name: 'dizaines', one: 'dizaine', col: '#38c972', glow: '#a8f0c4' },
  { k: 'U', name: 'unités', one: 'unité', col: '#ffb02e', glow: '#ffe0a3' },
];
const LEVELS = [
  { id: 0, icon: '🌱', name: 'Découverte', desc: 'Centaines, dizaines, unités (jusqu’à 999)', rods: 3 },
  { id: 1, icon: '🌿', name: 'Exploratrice', desc: 'Milliers, centaines, dizaines, unités (jusqu’à 9 999)', rods: 4 },
  { id: 2, icon: '🌳', name: 'Experte', desc: 'Calculs avec échanges (10 unités = 1 dizaine…)', rods: 4 },
];

// ---------- nombres en lettres (Belgique : septante, nonante) ----------
const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const T = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante', 7: 'septante', 8: 'quatre-vingt', 9: 'nonante' };
function below100(n) {
  if (n <= 16) return U[n];
  if (n < 20) return 'dix-' + U[n - 10];
  const t = Math.floor(n / 10), u = n % 10;
  if (u === 0) return t === 8 ? 'quatre-vingts' : T[t];
  if (u === 1 && t !== 8) return T[t] + '-et-un';
  return T[t] + '-' + U[u];
}
export function words(n) {
  if (n === 0) return 'zéro';
  const m = Math.floor(n / 1000), c = Math.floor((n % 1000) / 100), r = n % 100, parts = [];
  if (m) parts.push(m === 1 ? 'mille' : below100(m) + '-mille');
  if (c) parts.push(c === 1 ? 'cent' : U[c] + '-cent' + (r === 0 ? 's' : ''));
  if (r) parts.push(below100(r));
  return parts.join('-');
}
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const digits = (n) => [Math.floor(n / 1000) % 10, Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

// ---------- génération des exercices ----------
function makeSet(lv) {
  const max = lv === 0 ? 999 : 9999, min = lv === 0 ? 11 : 1001;
  const num = () => { const n = ri(min, max); if (lv > 0 && Math.random() < 0.3) { const d = digits(n); d[ri(1, 3)] = 0; return d[0] * 1000 + d[1] * 100 + d[2] * 10 + d[3]; } return n; };
  const list = [];
  const place = () => { const n = num(); return { kind: 'place', n, ask: `Place le nombre ${fmt(n)} sur le boulier.`, say: `Place le nombre ${words(n)}.` }; };
  const placeWords = () => { const n = num(); return { kind: 'place', n, ask: `Place sur le boulier : « ${words(n)} ».`, say: `Place ${words(n)}.`, hide: true }; };
  const read = () => {
    const n = num(), d = digits(n), opts = new Set([n]);
    const sw = (a, b) => { const x = d.slice(); [x[a], x[b]] = [x[b], x[a]]; return x[0] * 1000 + x[1] * 100 + x[2] * 10 + x[3]; };
    const cands = lv === 0 ? [sw(1, 3), sw(2, 3), sw(1, 2), n + 10, n - 1] : [sw(0, 3), sw(1, 2), sw(2, 3), sw(0, 1), n + 100];
    for (const c of [...shuffle(cands), n + 1, n - 10, n + 100, n - 1]) if (opts.size < 4 && c !== n && c >= 0 && c <= (lv === 0 ? 999 : 9999)) opts.add(c);
    return { kind: 'read', n, ask: 'Quel nombre est montré sur le boulier ?', say: 'Quel nombre vois-tu sur le boulier ?', opts: shuffle([...opts]) };
  };
  const decomp = () => {
    let n = num(); const d = digits(n); if (lv > 0 && Math.random() < 0.6) { const z = ri(1, 2); d[z] = 0; n = d[0] * 1000 + d[1] * 100 + d[2] * 10 + d[3]; }
    const pieces = RODS.map((r, i) => (d[i] ? `${d[i]} ${d[i] > 1 ? r.name : r.one}` : null)).filter(Boolean);
    return { kind: 'place', n, ask: `Montre sur le boulier : ${pieces.join(' + ')}.`, say: `Montre ${pieces.join(', ')}.`, hide: true };
  };
  const which = () => {
    const n = num(), d = digits(n), pos = lv === 0 ? ri(1, 3) : ri(0, 3), r = RODS[pos];
    const opts = shuffle([...new Set([d[pos], ...d.slice(lv === 0 ? 1 : 0), (d[pos] + 1) % 10, (d[pos] + 3) % 10])].slice(0, 4));
    if (!opts.includes(d[pos])) opts[0] = d[pos];
    return { kind: 'read', n, ask: `Combien de ${r.name} vois-tu dans ${fmt(n)} ? (le chiffre des ${r.name})`, say: `Quel est le chiffre des ${r.name} dans ${words(n)} ?`, opts: shuffle([...new Set(opts)]), key: d[pos], show: true };
  };
  const calc = (exch) => {
    let a, b, op;
    for (let g = 0; g < 200; g++) {
      op = Math.random() < 0.55 ? '+' : '−';
      const unit = [1, 10, 100, lv === 0 ? 10 : 1000][ri(0, lv === 0 ? 2 : 3)];
      a = lv === 0 ? ri(20, 880) : ri(1100, 8800); b = ri(1, 9) * unit + (exch ? ri(1, 9) : 0);
      const r = op === '+' ? a + b : a - b; if (r < 0 || r > (lv === 0 ? 999 : 9999)) continue;
      const da = digits(a), db = digits(b), carry = da.some((x, i) => (op === '+' ? x + db[i] > 9 : x < db[i]));
      if (carry === !!exch) break;
    }
    const r = op === '+' ? a + b : a - b;
    return { kind: 'calc', n: r, start: a, ask: `${fmt(a)} ${op} ${fmt(b)} = ? Le nombre ${fmt(a)} est déjà sur le boulier : ${op === '+' ? 'ajoute' : 'enlève'} ${fmt(b)} en déplaçant les boules.`, say: `${words(a)} ${op === '+' ? 'plus' : 'moins'} ${words(b)}.`, exch, op, b };
  };
  if (lv === 0) list.push(place(), read(), which(), placeWords(), decomp(), calc(false), read(), calc(false));
  if (lv === 1) list.push(place(), read(), decomp(), which(), placeWords(), calc(false), decomp(), calc(false));
  if (lv === 2) list.push(decomp(), calc(false), calc(true), read(), calc(true), placeWords(), calc(true), calc(true));
  return list;
}

// ---------- interface ----------
export function open() {
  const lvBtns = LEVELS.map((l) => h('button', { class: 'card-btn', type: 'button', 'data-testid': 'abq-lv' + l.id, onclick: () => run(l) }, h('span', { class: 'ci' }, l.icon), h('strong', null, l.name), h('small', null, l.desc)));
  const best = S.get().abaque || {};
  UI.openDialog(h('div', { class: 'panel abq-panel' }, UI.closeButton(),
    h('h2', null, '🧮 Le boulier magique'),
    h('p', null, 'Chaque tige est une colonne de l’abaque : les boules en haut comptent. 10 boules d’une tige = 1 boule de la tige à sa gauche !'),
    h('div', { class: 'abq-legend' }, ...RODS.map((r) => h('span', null, h('i', { style: `background:${r.col}` }), `${r.k} = ${r.name}`))),
    h('div', { class: 'cards' }, ...lvBtns),
    h('div', { class: 'actions wrap' }, h('button', { class: 'btn small', type: 'button', onclick: () => free() }, '✋ Jouer librement'),
      h('span', { class: 'muted' }, `🌟 Étoiles du boulier : ${S.get().bonusStars || 0}${best.done ? ` · séries réussies : ${best.done}` : ''}`))), { label: 'Boulier magique' });
}

function board(rodsN, { locked = false, onChange } = {}) {
  const rods = RODS.slice(4 - rodsN);
  const val = rods.map(() => 0);
  const wrap = h('div', { class: 'abq-board' + (locked ? ' locked' : '') });
  const frame = h('div', { class: 'abq-frame' });
  const cols = rods.map((r, i) => {
    const beads = Array.from({ length: 9 }, (_, b) => h('button', { class: 'abq-bead', type: 'button', 'aria-label': `${r.name} : boule ${b + 1}`, style: `--c:${r.col};--g:${r.glow}`, onclick: () => { if (wrap.classList.contains('locked')) return; set(i, b < val[i] ? b : b + 1); Sfx.tap(); } }));
    const rod = h('div', { class: 'abq-rod', style: `--c:${r.col}` }, ...beads);
    let y0 = null;
    rod.addEventListener('pointerdown', (e) => { y0 = e.clientY; });
    rod.addEventListener('pointerup', (e) => { if (y0 == null || wrap.classList.contains('locked')) return; const dy = e.clientY - y0; y0 = null; if (Math.abs(dy) > 30) { set(i, Math.max(0, Math.min(9, val[i] + (dy < 0 ? Math.round(-dy / 30) : -Math.round(dy / 30))))); Sfx.tap(); } });
    const cnt = h('div', { class: 'abq-cnt', style: `color:${r.col}` }, '0');
    const col = h('div', { class: 'abq-col' }, h('div', { class: 'abq-k', style: `background:${r.col}` }, r.k), rod, cnt);
    return { col, beads, cnt };
  });
  cols.forEach((c) => frame.append(c.col));
  wrap.append(frame);
  function render() { cols.forEach((c, i) => { c.beads.forEach((b, k) => { const up = k < val[i]; b.classList.toggle('up', up); b.style.top = (up ? k * 9.5 : 100 - (9 - k) * 9.5) + '%'; }); c.cnt.textContent = val[i]; }); }
  function set(i, v) { val[i] = v; render(); onChange && onChange(value()); }
  function value() { return val.reduce((a, v, i) => a * 10 + v, 0); }
  function setValue(n) { const d = digits(n).slice(4 - rodsN); d.forEach((v, i) => { val[i] = v; }); render(); }
  render();
  return { el: wrap, value, setValue, lock: (b) => wrap.classList.toggle('locked', b), glow: () => { wrap.classList.remove('win'); void wrap.offsetWidth; wrap.classList.add('win'); }, shake: () => { wrap.classList.remove('ko'); void wrap.offsetWidth; wrap.classList.add('ko'); } };
}

function free() {
  const out = h('div', { class: 'abq-read' });
  const b = board(4, { onChange: (n) => { out.innerHTML = ''; out.append(h('strong', null, fmt(n)), h('span', null, words(n))); } });
  b.setValue(0); out.append(h('strong', null, '0'), h('span', null, 'zéro'));
  UI.openDialog(h('div', { class: 'panel abq-panel' }, UI.closeButton(), h('h2', null, '✋ Boulier libre'),
    h('p', { class: 'muted' }, 'Touche une boule pour la monter ou la descendre : le nombre s’écrit tout seul, en chiffres et en lettres.'),
    b.el, out, h('div', { class: 'actions' }, h('button', { class: 'btn small', type: 'button', onclick: () => b.setValue(0) || out.replaceChildren(h('strong', null, '0'), h('span', null, 'zéro')) }, '↺ Remettre à zéro'), h('button', { class: 'btn small', type: 'button', onclick: open }, '← Retour'))), { label: 'Boulier libre' });
}

function run(lv) {
  const set = makeSet(lv.id); let i = 0, ok = 0;
  const step = () => {
    if (i >= set.length) return finish();
    const ex = set[i];
    const fb = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
    const live = h('div', { class: 'abq-live' });
    const b = board(lv.rods, { onChange: (n) => { if (!ex.hide && ex.kind !== 'read') live.textContent = `Sur le boulier : ${fmt(n)}`; } });
    const prog = h('div', { class: 'progress' }, set.map((_, k) => h('span', { class: `dot${k < i ? ' done' : ''}${k === i ? ' cur' : ''}` })));
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, 'data-testid': 'abq-next', onclick: () => { i++; step(); } }, i + 1 >= set.length ? 'Voir mon résultat' : 'Exercice suivant →');
    const answers = h('div', { class: 'answers' });
    let done = false;
    const settle = (good, expl) => {
      if (done) return; done = true; b.lock(true);
      if (good) { ok++; b.glow(); Sfx.win(); S.get().bonusStars = (S.get().bonusStars || 0) + 1; S.get().coins += 2; S.save(); burst(b.el); }
      else { b.shake(); Sfx.tap(); }
      fb.hidden = false; fb.className = 'feedback ' + (good ? 'ok' : 'ko');
      fb.replaceChildren(h('strong', null, good ? '🌟 Bravo ! +1 étoile' : '💜 Pas tout à fait…'), h('p', null, expl));
      next.hidden = false; next.focus();
    };
    const explain = (n) => { const d = digits(n).slice(4 - lv.rods), rods = RODS.slice(4 - lv.rods); return `${fmt(n)} = ` + rods.map((r, k) => `${d[k]} ${d[k] > 1 ? r.name : r.one}`).join(' + ') + ` (« ${words(n)} »).`; };
    if (ex.kind === 'read') {
      b.setValue(ex.n); b.lock(true); if (ex.show) live.textContent = '';
      const key = ex.key != null ? ex.key : ex.n;
      ex.opts.forEach((o) => answers.append(h('button', { class: 'choice', type: 'button', 'data-testid': 'abq-choice', onclick: () => settle(o === key, ex.key != null ? `Dans ${fmt(ex.n)}, ${explain(ex.n).split(' = ')[1]}` : `Le boulier montre ${explain(ex.n)}`) }, ex.key != null ? String(o) : fmt(o))));
    } else {
      if (ex.kind === 'calc') b.setValue(ex.start);
      answers.append(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'abq-ok', onclick: () => {
        const v = b.value();
        if (v === ex.n) settle(true, ex.kind === 'calc' ? `${ex.op === '+' ? 'Bien ajouté' : 'Bien enlevé'} ! Le résultat est ${explain(ex.n)}` : `Exactement : ${explain(ex.n)}`);
        else { settle(false, `Tu as placé ${fmt(v)}. La bonne réponse est ${explain(ex.n)}${ex.exch ? ' Astuce : quand une tige dépasse 9, échange 10 boules contre 1 boule sur la tige de gauche.' : ''}`); setTimeout(() => b.setValue(ex.n), 900); }
      } }, '✓ Vérifier'), h('button', { class: 'btn small ghost', type: 'button', onclick: () => b.setValue(ex.kind === 'calc' ? ex.start : 0) }, '↺ Recommencer'));
    }
    UI.openDialog(h('div', { class: 'panel abq-panel' },
      h('div', { class: 'quiz-head' }, h('strong', null, `🧮 ${lv.icon} ${lv.name}`), h('button', { class: 'btn small ghost', type: 'button', onclick: open }, 'Quitter')),
      prog, h('p', { class: 'prompt' }, ex.ask), h('button', { class: 'btn ghost small', type: 'button', onclick: () => Voice.speak(ex.say) }, '🔊 Écouter'),
      b.el, live, answers, fb, h('div', { class: 'actions' }, next)), { label: 'Boulier magique', closable: false });
  };
  const finish = () => {
    const st = S.get().abaque || (S.get().abaque = {}); if (ok >= 6) st.done = (st.done || 0) + 1; S.save();
    const msg = ok === set.length ? 'Parfait ! Tu es une vraie magicienne du boulier !' : ok >= 6 ? 'Bravo, tu maîtrises l’abaque !' : 'Bien essayé ! Recommence pour gagner encore plus d’étoiles.';
    Voice.speak(msg); if (ok >= 6) Sfx.win();
    UI.openDialog(h('div', { class: 'panel' }, UI.closeButton(), h('h2', null, `🧮 ${ok} / ${set.length}`), UI.bubble(msg),
      h('p', null, `+${ok} 🌟 étoiles · +${ok * 2} 🪙`),
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', onclick: () => run(lv) }, '↻ Une autre série'), lv.id < 2 ? h('button', { class: 'btn', type: 'button', onclick: () => run(LEVELS[lv.id + 1]) }, 'Niveau suivant →') : null, h('button', { class: 'btn ghost', type: 'button', onclick: open }, 'Menu du boulier'))), { label: 'Résultat' });
  };
  step();
}

function burst(host) {
  for (let k = 0; k < 14; k++) {
    const s = h('span', { class: 'abq-spark', 'aria-hidden': 'true' }, k % 3 ? '✨' : '🌟');
    s.style.cssText = `left:${50 + (Math.random() - 0.5) * 60}%;top:${50 + (Math.random() - 0.5) * 40}%;--dx:${(Math.random() - 0.5) * 220}px;--dy:${-60 - Math.random() * 140}px;animation-delay:${k * 0.03}s`;
    host.append(s); setTimeout(() => s.remove(), 1500);
  }
}
