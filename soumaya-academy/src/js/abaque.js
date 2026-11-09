// Salle des Nombres : « Mon abaque des nombres » (classe des millions → millièmes, un seul chiffre par colonne).
// 4 exercices : placer un nombre dicté, lire l'abaque, trouver la bonne colonne, décomposer.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.abaqueN = b.abaqueN || { done: 0 }; return b.abaqueN; };
const N = 6; // questions par série

// colonnes de gauche à droite ; p = puissance de 10
export const COLS = [
  { k: 'CMI', p: 8, n: 'centaines de millions', s: 'centaine de millions' },
  { k: 'DMI', p: 7, n: 'dizaines de millions', s: 'dizaine de millions' },
  { k: 'UMI', p: 6, n: 'unités de millions', s: 'unité de millions' },
  { k: 'CM', p: 5, n: 'centaines de mille', s: 'centaine de mille' },
  { k: 'DM', p: 4, n: 'dizaines de mille', s: 'dizaine de mille' },
  { k: 'UM', p: 3, n: 'unités de mille', s: 'unité de mille' },
  { k: 'C', p: 2, n: 'centaines', s: 'centaine' },
  { k: 'D', p: 1, n: 'dizaines', s: 'dizaine' },
  { k: 'U', p: 0, n: 'unités', s: 'unité' },
  { k: 'd', p: -1, n: 'dixièmes', s: 'dixième' },
  { k: 'c', p: -2, n: 'centièmes', s: 'centième' },
  { k: 'm', p: -3, n: 'millièmes', s: 'millième' },
];

// ---------- nombres en lettres (français de Belgique : septante, nonante) ----------
const UNI = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const DIZ = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'septante', 'quatre-vingt', 'nonante'];
function sous100(n) {
  if (n < 17) return UNI[n];
  if (n < 20) return 'dix-' + UNI[n - 10];
  const d = Math.floor(n / 10), u = n % 10;
  if (u === 0) return d === 8 ? 'quatre-vingts' : DIZ[d];
  if (u === 1 && d !== 8) return DIZ[d] + ' et un';
  return DIZ[d] + '-' + UNI[u];
}
function sous1000(n, fin = true) {
  const c = Math.floor(n / 100), r = n % 100;
  let s = c === 0 ? '' : c === 1 ? 'cent' : UNI[c] + (r === 0 && fin ? ' cents' : ' cent');
  if (r) s += (s ? ' ' : '') + (r === 80 && !fin ? 'quatre-vingt' : sous100(r));
  return s;
}
export function lettres(n) {
  if (n === 0) return 'zéro';
  const mi = Math.floor(n / 1e6), mil = Math.floor(n / 1000) % 1000, r = n % 1000, out = [];
  if (mi) out.push(mi === 1 ? 'un million' : sous1000(mi) + ' millions');
  if (mil) out.push(mil === 1 ? 'mille' : sous1000(mil, false) + ' mille');
  if (r) out.push(sous1000(r));
  return out.join(' ');
}
// un nombre = { i: partie entière, dd: chiffres décimaux (texte, ex. '85') }
const fmtI = (i) => String(i).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const ecrit = (x) => fmtI(x.i) + (x.dd ? ',' + x.dd : '');
const UNIT_DEC = ['', 'dixième', 'centième', 'millième'];
function enLettres(x) {
  const e = lettres(x.i);
  if (!x.dd) return e;
  const v = parseInt(x.dd, 10), u = UNIT_DEC[x.dd.length] + (v > 1 ? 's' : '');
  return `${e} unité${x.i > 1 ? 's' : ''} et ${lettres(v)} ${u}`;
}
const aVoix = (x) => fmtI(x.i).replace(/ /g, '') + (x.dd ? ' virgule ' + x.dd.split('').join(' ') : '');

// chiffre d'une colonne
function chiffre(x, p) {
  if (p >= 0) { const s = String(x.i); const k = s.length - 1 - p; return k >= 0 ? s[k] : ''; }
  return x.dd[-p - 1] || '';
}
function tirage(lvl) {
  const nbI = [5, 6, 7, 7][Math.min(lvl, 3)] - ri(0, 1), nbD = ri(0, Math.min(3, 1 + lvl));
  let i = ri(1, 9);
  for (let k = 1; k < nbI; k++) i = i * 10 + (Math.random() < 0.22 ? 0 : ri(0, 9)); // quelques zéros intercalés
  let dd = ''; for (let k = 0; k < nbD; k++) dd += String(k === nbD - 1 ? ri(1, 9) : ri(0, 9));
  return { i, dd };
}

// ---------- le tableau ----------
function table({ x = null, edit = false, onCell = null, hi = null } = {}) {
  const inputs = [];
  const head = h('tr', null, h('th', { colspan: 9, class: 'ab-ent' }, 'Partie entière'), h('th', { colspan: 3, class: 'ab-dec' }, 'Partie décimale'));
  const cls = h('tr', null, ...['Classe des millions', 'Classe des mille', 'Classe des unités', 'Classe des millièmes'].map((t) => h('th', { colspan: 3, class: 'ab-cls' }, t)));
  const ks = h('tr', null, ...COLS.map((c) => h('th', { class: 'ab-k' + (c.p === 0 ? ' ab-comma' : '') }, c.k)));
  const row = h('tr', null, ...COLS.map((c, j) => {
    const td = h('td', { class: 'ab-cell' + (c.p === 0 ? ' ab-comma' : '') + (hi === j ? ' ab-hi' : ''), 'data-col': c.k });
    if (edit) {
      const inp = h('input', { type: 'text', inputmode: 'numeric', maxlength: 1, class: 'ab-in', 'aria-label': c.n, 'data-testid': 'ab-in-' + c.k });
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(-1); if (inp.value && inputs[j + 1]) inputs[j + 1].focus(); });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !inp.value && inputs[j - 1]) inputs[j - 1].focus(); });
      inputs.push(inp); td.append(inp);
    } else if (x) td.textContent = chiffre(x, c.p);
    if (onCell) { td.classList.add('ab-tap'); td.onclick = () => onCell(j, td); }
    return td;
  }));
  if (x && !edit) row.querySelector('.ab-comma')?.classList.toggle('ab-has', !!x.dd);
  const t = h('table', { class: 'ab-table' }, h('thead', null, head, cls, ks), h('tbody', null, row));
  return { el: h('div', { class: 'ab-wrap' }, t), inputs };
}

function serie(body, talk, title, ask) {
  let round = 0, ok = 0, lvl = Math.min(3, Math.floor((ST().done || 0) / 2));
  const head = h('p', { class: 'prompt' }), host = h('div'), actions = h('div', { class: 'actions wrap' });
  body.replaceChildren(h('p', { class: 'muted' }, title), head, host, actions);
  const next = () => {
    if (round >= N) {
      const st = ST(); if (ok >= 4) st.done = (st.done || 0) + 1; S.save();
      if (ok === N) { star(2); burst(body); }
      head.textContent = `Bravo ! ${ok} bonne${ok > 1 ? 's' : ''} réponse${ok > 1 ? 's' : ''} sur ${N}.`;
      talk(head.textContent + (ok === N ? ' Score parfait, deux étoiles de plus !' : ''));
      host.replaceChildren(); actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ab-again', onclick: () => serie(body, talk, title, ask) }, '↻ Une autre série'));
      return;
    }
    ask({ head, host, actions, lvl, n: round + 1, done: (good) => { if (good) { ok++; star(); Sfx.win(); } else Sfx.lose?.(); round++; setTimeout(next, good ? 1500 : 2600); } });
  };
  next();
}

// 1. Placer : le nombre est dicté (en chiffres ou en lettres), on l'écrit dans l'abaque
function placer(body, talk) {
  serie(body, talk, 'Écris le nombre dans l’abaque : un seul chiffre par colonne, la virgule est déjà tracée en rouge.', ({ head, host, actions, lvl, n, done }) => {
    const x = tirage(lvl), mots = n % 2 === 0;
    head.textContent = `Nombre ${n}/${N} : ` + (mots ? `« ${enLettres(x)} »` : ecrit(x));
    talk(mots ? enLettres(x) : 'Place ' + aVoix(x) + ' dans l’abaque.');
    const T = table({ edit: true }); host.replaceChildren(T.el);
    const check = () => {
      const v = T.inputs.map((i) => i.value);
      if (v.every((d) => d === '')) { talk('Écris d’abord les chiffres dans les cases.', false); return; }
      const want = COLS.map((c) => chiffre(x, c.p));
      const good = v.every((d, j) => d === want[j]);
      T.inputs.forEach((inp, j) => inp.classList.toggle('ab-bad', (inp.value || '') !== want[j]));
      if (good) { talk(`Parfait ! ${ecrit(x)} : le chiffre des unités est juste avant la virgule.`); done(true); }
      else {
        T.inputs.forEach((inp, j) => { inp.value = want[j]; inp.disabled = true; });
        const u = want[8];
        talk(`Regarde la correction : le chiffre des unités, ${u}, se place juste avant la virgule, puis on remplit vers la gauche.`, true); done(false);
      }
    };
    actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ab-check', onclick: check }, '✓ Vérifier'), h('button', { class: 'btn small', type: 'button', onclick: () => T.inputs.forEach((i) => { i.value = ''; i.classList.remove('ab-bad'); }) }, '🧽 Effacer'));
    setTimeout(() => T.inputs[8 - String(x.i).length + 1]?.focus(), 50);
  });
}

// 2. Lire : l'abaque est rempli, on choisit la bonne écriture
function lire(body, talk) {
  serie(body, talk, 'Lis le nombre écrit dans l’abaque et choisis la bonne écriture.', ({ head, host, actions, lvl, n, done }) => {
    let x = tirage(lvl); if (!x.dd) x = { ...x, dd: String(ri(1, 9)) };
    const shift = { i: Math.floor(x.i / 10), dd: String(x.i % 10) + x.dd }; // virgule mal placée
    const sansZero = { i: parseInt(String(x.i).replace(/0/g, '') || '1', 10), dd: x.dd };
    const autre = { i: x.i, dd: x.dd.split('').reverse().join('') };
    const opts = [x, shift, sansZero.i !== x.i ? sansZero : { i: x.i * 10 + ri(1, 9), dd: x.dd }, autre.dd !== x.dd ? autre : { i: x.i + 1000, dd: x.dd }];
    const uniq = []; opts.forEach((o) => { if (!uniq.some((u) => ecrit(u) === ecrit(o))) uniq.push(o); });
    head.textContent = `Abaque ${n}/${N} : quel nombre est écrit ?`;
    talk('Quel nombre est écrit dans l’abaque ?');
    host.replaceChildren(table({ x }).el);
    actions.replaceChildren(...shuffle(uniq).map((o) => h('button', { class: 'btn', type: 'button', 'data-testid': ecrit(o) === ecrit(x) ? 'ab-ok' : 'ab-ko', onclick: (e) => {
      actions.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      const good = ecrit(o) === ecrit(x); e.currentTarget.classList.add(good ? 'ok' : 'ko');
      talk(good ? `Oui ! ${ecrit(x)}, c’est ${enLettres(x)}.` : `Non, regarde bien la virgule et les zéros : c’est ${ecrit(x)}.`); done(good);
    } }, ecrit(o))));
  });
}

// 3. La bonne colonne : on touche la case du rang demandé, ou on donne le chiffre d'un rang
function colonne(body, talk) {
  serie(body, talk, 'Touche la bonne case de l’abaque.', ({ head, host, actions, lvl, n, done }) => {
    const x = tirage(lvl), used = COLS.map((c, j) => [c, j]).filter(([c]) => chiffre(x, c.p) !== '');
    const [c, j] = used[ri(0, used.length - 1)];
    head.textContent = `Question ${n}/${N} : dans ${ecrit(x)}, touche le chiffre des ${c.n}.`;
    talk(`Dans ${aVoix(x)}, touche le chiffre des ${c.n}.`);
    let fini = false;
    const T = table({ x, onCell: (k, td) => {
      if (fini) return; fini = true;
      const good = k === j; td.classList.add(good ? 'ab-ok' : 'ab-ko');
      if (!good) T.el.querySelectorAll('.ab-cell')[j].classList.add('ab-ok');
      talk(good ? `Oui ! Le chiffre des ${c.n} est ${chiffre(x, c.p)}.` : `Non, c’est la colonne ${c.k} : le chiffre des ${c.n} est ${chiffre(x, c.p)}.`); done(good);
    } });
    host.replaceChildren(T.el); actions.replaceChildren();
  });
}

// 4. Décomposer : compléter une décomposition, ou « combien de … en tout ? »
function decomposer(body, talk) {
  serie(body, talk, 'Complète la décomposition, puis trouve combien il y a de centaines, de dizaines… en tout.', ({ head, host, actions, lvl, n, done }) => {
    const x = tirage(Math.min(lvl, 2));
    const T = table({ x });
    let q, rep;
    if (n % 3 === 0) { // combien de centaines / dizaines de mille en tout
      const cands = COLS.filter((c) => c.p >= 1 && c.p <= 4 && Math.pow(10, c.p) <= x.i);
      const c = cands[ri(0, cands.length - 1)]; rep = String(Math.floor(x.i / Math.pow(10, c.p)));
      q = `Dans ${ecrit(x)}, combien y a-t-il de ${c.n} en tout ?`;
      talk(q.replace(ecrit(x), aVoix(x)) + ' Attention, en tout, pas seulement le chiffre !');
    } else {
      const parts = COLS.map((c) => [c, chiffre(x, c.p)]).filter(([, d]) => d && d !== '0');
      const [cq] = parts[ri(0, parts.length - 1)]; rep = chiffre(x, cq.p);
      const val = (p) => p >= 0 ? fmtI(Math.pow(10, p)) : '0,' + '0'.repeat(-p - 1) + '1';
      q = `${ecrit(x)} = ` + parts.map(([c, d]) => `${c === cq ? '?' : d} × ${val(c.p)}`).join(' + ');
      talk(`Complète la décomposition : combien de ${cq.n} ?`);
    }
    head.textContent = `Question ${n}/${N} : ${q}`;
    const inp = h('input', { type: 'text', inputmode: 'numeric', class: 'dc-in', 'data-testid': 'ab-rep', 'aria-label': 'Réponse' });
    const go = () => {
      const v = inp.value.replace(/\s/g, ''); if (!v) return;
      const good = v === rep; inp.disabled = true; inp.classList.add(good ? 'ab-okin' : 'ab-bad');
      talk(good ? 'Exact !' : `La bonne réponse est ${rep}.`); done(good);
    };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    host.replaceChildren(...(n % 3 === 0 ? [T.el] : [])); // l'abaque aide pour « en tout » ; la décomposition se fait de tête
    actions.replaceChildren(inp, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ab-check', onclick: go }, '✓ Vérifier'));
    setTimeout(() => inp.focus(), 50);
  });
}


// 0. Astuces : la leçon (lire et écrire les grands nombres)
function astuces(body, talk) {
  const ex = { i: 4875, dd: '' };
  body.replaceChildren(h('div', { class: 'ag-lecon' },
    h('h3', null, '1 · Les classes'), h('p', null, 'Dans chaque classe, il y a ', h('b', null, '3 colonnes'), ' : centaines (C), dizaines (D), unités (U). Dans chaque colonne, on place ', h('b', null, 'un seul chiffre'), '.'),
    table({ x: { i: 3402658, dd: '75' } }).el,
    h('p', { class: 'muted' }, 'Sans tableau, on groupe les chiffres par 3 à partir de la droite, avec un espace : 725 · 34 659 · 3 402 658,75'),
    h('h3', null, '2 · Chiffre ou nombre ?'),
    h('p', null, 'Dans 4 875, ', h('b', null, '8'), ' est le ', h('b', null, 'chiffre des centaines'), ' (sa place dans le nombre).'),
    h('p', null, 'Dans 4 875, ', h('b', null, '48'), ' est le ', h('b', null, 'nombre de centaines'), ' (combien de centaines en tout).'),
    table({ x: ex, hi: 6 }).el,
    h('h3', null, '3 · La virgule'), h('p', null, 'La virgule se place toujours juste après le chiffre des ', h('b', null, 'unités'), '. Après elle : dixièmes, centièmes, millièmes.'),
    h('h3', null, '4 · Écrire en lettres'),
    h('ul', null, h('li', null, h('b', null, 'Mille'), ' est invariable : trois mille.'), h('li', null, h('b', null, 'Cent'), ' et ', h('b', null, 'vingt'), ' prennent un « s » seulement s’ils terminent le nombre : trois cents, mais trois cent un ; quatre-vingts, mais quatre-vingt-quatre.'),
      h('li', null, 'En Belgique : septante (70), nonante (90).'), h('li', null, 'Exemple : 257 352 → deux cent cinquante-sept mille trois cent cinquante-deux.'))));
  talk('Voici les astuces : trois colonnes par classe, un seul chiffre par colonne, et la virgule juste après les unités.');
}

export function open(tab = 'astuces') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['astuces', '💡 Astuces', astuces], ['placer', '✍️ Placer', placer], ['lire', '🔍 Lire', lire], ['colonne', '👆 La bonne colonne', colonne], ['decomposer', '🧩 Décomposer', decomposer]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'ab-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ab-panel' }, UI.closeButton(), h('h2', null, '📊 Mon abaque des nombres'),
    h('p', { class: 'ab-rule' }, '❗ J’écris un seul chiffre par colonne.'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Mon abaque des nombres', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
