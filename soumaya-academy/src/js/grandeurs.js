// Atelier : « Mon abaque des grandeurs » — tableaux de conversion (longueurs, masses, capacités).
// 7 exercices : placer, convertir avec l'abaque, convertir de tête, comparer, ranger, la bonne unité, problèmes.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.abaqueG = b.abaqueG || { done: 0 }; return b.abaqueG; };
const N = 6;
const pick = (a) => a[ri(0, a.length - 1)];

// unités de la plus grande à la plus petite ; la valeur est stockée en plus petite unité (mm, mg, ml)
const G = {
  longueur: { nom: 'Longueurs', icon: '📏', u: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], ref: 'm', mots: ['kilomètre', 'hectomètre', 'décamètre', 'mètre', 'décimètre', 'centimètre', 'millimètre'] },
  masse: { nom: 'Masses', icon: '⚖️', u: ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'], ref: 'g', mots: ['kilogramme', 'hectogramme', 'décagramme', 'gramme', 'décigramme', 'centigramme', 'milligramme'] },
  capacite: { nom: 'Capacités', icon: '🧴', u: ['hl', 'dal', 'l', 'dl', 'cl', 'ml'], ref: 'l', mots: ['hectolitre', 'décalitre', 'litre', 'décilitre', 'centilitre', 'millilitre'] },
};
const KINDS = Object.keys(G);
const pw = (g, unit) => g.u.length - 1 - g.u.indexOf(unit); // puissance de 10 de l'unité par rapport à la plus petite
// écrit v (en plus petite unité) dans l'unité donnée : « 3,45 »
function fmt(g, v, unit) {
  const p = pw(g, unit); let s = String(v);
  if (p > 0) { s = s.padStart(p + 1, '0'); s = s.slice(0, -p) + ',' + s.slice(-p); s = s.replace(/,?0+$/, ''); }
  const [i, d] = s.split(','); return i.replace(/\B(?=(\d{3})+$)/g, ' ') + (d ? ',' + d : '');
}
const lire = (txt) => {
  let t = String(txt).trim().replace(/\s/g, '').replace('.', ',');
  if (!/^\d*(,\d*)?$/.test(t) || !/\d/.test(t)) return null;
  let [a, b = ''] = t.split(','); a = a.replace(/^0+(?=\d)/, '') || '0'; b = b.replace(/0+$/, '');
  return b ? a + ',' + b : a;
};
const same = (a, b) => { const x = lire(a), y = lire(b); return x != null && x === y; };
// une mesure au hasard : chiffres significatifs dans une plage d'unités raisonnable
function mesure(g, lvl) {
  const big = g.u.indexOf(g.ref) - (lvl >= 2 ? 3 : 2), lo = Math.max(0, big);
  const unit = g.u[ri(lo, g.u.indexOf(g.ref) + 1)];
  const nd = ri(2, 3 + Math.min(lvl, 1)); let v = ri(1, 9);
  for (let k = 1; k < nd; k++) v = v * 10 + (Math.random() < 0.2 ? 0 : ri(0, 9));
  const shift = ri(0, Math.min(pw(g, unit), 2)); // quelques décimales
  return { v: v * Math.pow(10, Math.max(0, pw(g, unit) - shift)), unit };
}

// ---------- le tableau ----------
function table(g, { v = null, unit = null, edit = false, comma = null } = {}) {
  const inputs = [], cu = comma || unit;
  let digits = null;
  if (v != null) { const s = String(v), n = g.u.length; digits = g.u.map((_, j) => { const k = s.length - (n - j); return k >= 0 ? s[k] : ''; }); }
  const heads = h('tr', null, ...g.u.map((u) => h('th', { class: 'ab-k' + (u === cu ? ' ab-comma' : '') + (u === g.ref ? ' ag-ref' : '') }, u)));
  const row = h('tr', null, ...g.u.map((u, j) => {
    const td = h('td', { class: 'ab-cell' + (u === cu ? ' ab-comma ab-has' : '') });
    if (edit) {
      const inp = h('input', { type: 'text', inputmode: 'numeric', maxlength: 1, class: 'ab-in', 'aria-label': u, 'data-testid': 'ag-in-' + u });
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(-1); if (inp.value && inputs[j + 1]) inputs[j + 1].focus(); });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !inp.value && inputs[j - 1]) inputs[j - 1].focus(); });
      inputs.push(inp); td.append(inp);
    } else if (digits) td.textContent = digits[j];
    return td;
  }));
  return { el: h('div', { class: 'ab-wrap' }, h('table', { class: 'ab-table ag-table' }, h('thead', null, h('tr', null, h('th', { colspan: g.u.length, class: 'ab-ent' }, `${g.icon} ${g.nom}`)), heads), h('tbody', null, row))), inputs, digits };
}

function serie(body, talk, title, ask) {
  let round = 0, ok = 0; const lvl = Math.min(2, Math.floor((ST().done || 0) / 2));
  const head = h('p', { class: 'prompt' }), host = h('div'), actions = h('div', { class: 'actions wrap' });
  body.replaceChildren(h('p', { class: 'muted' }, title), head, host, actions);
  const next = () => {
    if (round >= N) {
      const st = ST(); if (ok >= 4) st.done = (st.done || 0) + 1; S.save();
      if (ok === N) { star(2); burst(body); }
      head.textContent = `Bravo ! ${ok} bonne${ok > 1 ? 's' : ''} réponse${ok > 1 ? 's' : ''} sur ${N}.`;
      talk(head.textContent + (ok === N ? ' Score parfait, deux étoiles de plus !' : ''));
      host.replaceChildren(); actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ag-again', onclick: () => serie(body, talk, title, ask) }, '↻ Une autre série'));
      return;
    }
    const g = G[KINDS[round % KINDS.length]];
    ask({ g, head, host, actions, lvl, n: round + 1, done: (good) => { if (good) { ok++; star(); Sfx.win(); } round++; setTimeout(next, good ? 1500 : 2800); } });
  };
  next();
}
// réponse tapée
function saisie(actions, rep, unitTxt, talk, done, explain) {
  const inp = h('input', { type: 'text', inputmode: 'decimal', class: 'dc-in', 'data-testid': 'ag-rep', 'aria-label': 'Réponse' });
  const go = () => {
    if (!inp.value.trim()) return; inp.disabled = true;
    const good = same(inp.value, rep); inp.classList.add(good ? 'ab-okin' : 'ab-bad');
    talk(good ? 'Exact !' : `La bonne réponse est ${rep} ${unitTxt}. ${explain || ''}`); done(good);
  };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  actions.replaceChildren(inp, h('span', null, unitTxt), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ag-check', onclick: go }, '✓ Vérifier'));
  setTimeout(() => inp.focus(), 50);
}
function choix(actions, opts, right, talk, done, why) {
  actions.replaceChildren(...shuffle(opts).map((o) => h('button', { class: 'btn', type: 'button', 'data-testid': o === right ? 'ag-ok' : 'ag-ko', onclick: (e) => {
    actions.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    const good = o === right; e.currentTarget.classList.add(good ? 'ok' : 'ko');
    if (!good) actions.querySelector('[data-testid=ag-ok]').classList.add('ok');
    talk(good ? 'Oui ! ' + (why || '') : 'Non. ' + (why || '')); done(good);
  } }, o)));
}

// 1. Placer une mesure dans l'abaque (le chiffre des unités dans la colonne de l'unité)
function placer(body, talk) {
  serie(body, talk, 'Écris la mesure dans l’abaque : un seul chiffre par colonne. Le chiffre des unités va dans la colonne de l’unité (le trait rouge).', ({ g, head, host, actions, lvl, n, done }) => {
    const m = mesure(g, lvl);
    head.textContent = `Mesure ${n}/${N} : ${fmt(g, m.v, m.unit)} ${m.unit}`;
    talk(`Place ${fmt(g, m.v, m.unit).replace(',', ' virgule ')} ${g.mots[g.u.indexOf(m.unit)]}s dans l’abaque.`);
    const T = table(g, { edit: true, unit: m.unit }); host.replaceChildren(T.el);
    const want = table(g, { v: m.v }).digits;
    // zéros de tête et de fin : on accepte la case vide ou 0 en dehors du nombre
    const p = pw(g, m.unit), uIdx = g.u.length - 1 - p;
    const check = () => {
      const got = T.inputs.map((i) => i.value);
      if (got.every((d) => d === '')) { talk('Écris d’abord les chiffres dans les cases.', false); return; }
      const first = want.findIndex((d) => d !== '' && d !== '0');
      let lastSig = want.length - 1; while (lastSig > uIdx && want[lastSig] === '0') lastSig--;
      const good = want.every((d, j) => (j < first || j > lastSig) ? (got[j] === '' || got[j] === '0') : got[j] === d);
      T.inputs.forEach((inp, j) => { const bad = (j < first || j > lastSig) ? !(inp.value === '' || inp.value === '0') : inp.value !== want[j]; inp.classList.toggle('ab-bad', bad); });
      if (good) { talk(`Parfait ! Le chiffre des unités est dans la colonne ${m.unit}.`); done(true); }
      else { T.inputs.forEach((inp, j) => { inp.value = (j < first || j > lastSig) ? '' : want[j]; inp.disabled = true; }); talk(`Regarde la correction : le dernier chiffre avant la virgule va dans la colonne ${m.unit}.`); done(false); }
    };
    actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ag-check', onclick: check }, '✓ Vérifier'), h('button', { class: 'btn small', type: 'button', onclick: () => T.inputs.forEach((i) => { i.value = ''; i.classList.remove('ab-bad'); }) }, '🧽 Effacer'));
  });
}

// 2. Convertir avec l'abaque rempli
function convertirAbaque(body, talk) {
  serie(body, talk, 'L’abaque est rempli. Déplace la virgule dans ta tête et convertis !', ({ g, head, host, actions, lvl, n, done }) => {
    const m = mesure(g, lvl); let to = pick(g.u.filter((u) => u !== m.unit && Math.abs(pw(g, u) - pw(g, m.unit)) <= 3));
    if (pw(g, to) > pw(g, m.unit) && m.v % Math.pow(10, pw(g, to)) !== 0 && lvl === 0) to = g.u[g.u.length - 1];
    head.textContent = `Question ${n}/${N} : ${fmt(g, m.v, m.unit)} ${m.unit} = ? ${to}`;
    talk(`Combien de ${g.mots[g.u.indexOf(to)]}s ?`);
    host.replaceChildren(table(g, { v: m.v, unit: m.unit }).el);
    saisie(actions, fmt(g, m.v, to), to, talk, done, `Mets le chiffre des unités dans la colonne ${to}.`);
  });
}

// 3. Convertir sans abaque
function convertir(body, talk) {
  serie(body, talk, 'Convertis de tête. Astuce : × 10, × 100, × 1 000 quand on va vers une plus petite unité.', ({ g, head, host, actions, lvl, n, done }) => {
    const m = mesure(g, lvl); const to = pick(g.u.filter((u) => u !== m.unit && Math.abs(pw(g, u) - pw(g, m.unit)) <= 3));
    head.textContent = `Question ${n}/${N} : ${fmt(g, m.v, m.unit)} ${m.unit} = ? ${to}`;
    talk(`Convertis en ${g.mots[g.u.indexOf(to)]}s.`);
    host.replaceChildren(h('p', { class: 'muted ag-memo' }, g.u.join(' → ')));
    saisie(actions, fmt(g, m.v, to), to, talk, done);
  });
}

// 4. Comparer deux mesures
function comparer(body, talk) {
  serie(body, talk, 'Compare les deux mesures : <, > ou = ?', ({ g, head, host, actions, lvl, n, done }) => {
    const a = mesure(g, lvl); let b;
    if (Math.random() < 0.3) b = { v: a.v, unit: pick(g.u.filter((u) => Math.abs(pw(g, u) - pw(g, a.unit)) <= 3)) };
    else { b = mesure(g, lvl); if (Math.random() < 0.5) b = { v: a.v * pick([10, 1]) + pick([0, Math.pow(10, pw(g, a.unit))]), unit: pick(g.u.filter((u) => Math.abs(pw(g, u) - pw(g, a.unit)) <= 2)) }; }
    const right = a.v < b.v ? '<' : a.v > b.v ? '>' : '=';
    head.textContent = `Question ${n}/${N} : ${fmt(g, a.v, a.unit)} ${a.unit}  …  ${fmt(g, b.v, b.unit)} ${b.unit}`;
    talk('Quelle mesure est la plus grande ?');
    host.replaceChildren();
    const cu = pw(g, a.unit) < pw(g, b.unit) ? a.unit : b.unit;
    choix(actions, ['<', '=', '>'], right, talk, done, `En ${cu} : ${fmt(g, a.v, cu)} ${cu} ${right} ${fmt(g, b.v, cu)} ${cu}. Convertis dans la même unité pour comparer.`);
  });
}

// 5. Ranger : trouver la plus grande / la plus petite
function ranger(body, talk) {
  serie(body, talk, 'Trouve la mesure demandée parmi les trois.', ({ g, head, host, actions, lvl, n, done }) => {
    const ms = []; while (ms.length < 3) { const m = mesure(g, lvl); if (!ms.some((x) => x.v === m.v)) ms.push(m); }
    const big = Math.random() < 0.5, tgt = ms.reduce((x, y) => ((big ? y.v > x.v : y.v < x.v) ? y : x));
    const lab = (m) => `${fmt(g, m.v, m.unit)} ${m.unit}`;
    head.textContent = `Question ${n}/${N} : quelle est la ${big ? 'plus grande' : 'plus petite'} mesure ?`;
    talk(head.textContent.replace(/^Question \d+\/\d+ : /, ''));
    host.replaceChildren();
    const cu = ms.reduce((x, m) => (pw(g, m.unit) < pw(g, x) ? m.unit : x), ms[0].unit);
    choix(actions, ms.map(lab), lab(tgt), talk, done, `En ${cu} : ${ms.map((m) => fmt(g, m.v, cu) + ' ' + cu).join(' ; ')}.`);
  });
}

// 6. La bonne unité
const OBJ = [
  ['la longueur d’un crayon', '15', 'cm', 'longueur'], ['la hauteur d’une porte', '2', 'm', 'longueur'], ['la distance Bruxelles – Charleroi', '60', 'km', 'longueur'],
  ['l’épaisseur d’un euro', '2', 'mm', 'longueur'], ['la longueur d’une classe', '9', 'm', 'longueur'], ['la longueur d’une fourmi', '5', 'mm', 'longueur'],
  ['la masse d’un sac de pommes de terre', '5', 'kg', 'masse'], ['la masse d’une pomme', '150', 'g', 'masse'], ['la masse d’un comprimé', '500', 'mg', 'masse'],
  ['la masse d’un enfant de 9 ans', '30', 'kg', 'masse'], ['la masse d’une tablette de chocolat', '200', 'g', 'masse'],
  ['une bouteille d’eau', '1,5', 'l', 'capacite'], ['une cuillère à café', '5', 'ml', 'capacite'], ['un verre', '20', 'cl', 'capacite'],
  ['une baignoire', '2', 'hl', 'capacite'], ['une canette', '33', 'cl', 'capacite'], ['un seau', '1', 'dal', 'capacite'],
];
function unite(body, talk) {
  const pool = shuffle(OBJ);
  serie(body, talk, 'Choisis l’unité qui convient.', ({ head, host, actions, n, done }) => {
    const [obj, nb, u, k] = pool[(n - 1) % pool.length], g = G[k];
    const verbe = k === 'masse' ? 'pèse' : k === 'capacite' ? 'contient' : 'mesure';
    head.textContent = `Question ${n}/${N} : ${obj} ${verbe} environ ${nb} …`;
    talk(`${obj} ${verbe} environ ${nb}… quelle unité ?`);
    host.replaceChildren();
    choix(actions, shuffle(g.u.filter((x) => x !== u)).slice(0, 2).concat(u), u, talk, done, `${obj} : environ ${nb} ${u}.`);
  });
}

// 7. Petits problèmes
function probleme(body, talk) {
  const P = [
    () => { const a = ri(1, 3) * 1000 + pick([0, 500, 250]), b = pick([250, 500, 750, 300]); return { q: `Maman achète ${fmt(G.masse, a * 1000, 'kg')} kg de pommes et ${b} g de poires. Combien de grammes de fruits en tout ?`, r: String(a + b), u: 'g' }; },
    () => { const l = pick([1, 1.5, 2]), v = pick([20, 25, 33]); const n2 = Math.round(l * 100 / v); return { q: `Une bouteille contient ${String(l).replace('.', ',')} l. Combien de verres de ${v} cl peut-on remplir complètement ?`, r: String(Math.floor(l * 100 / v)), u: 'verres', _: n2 }; },
    () => { const a = ri(2, 8) * 100 + pick([0, 50]), t = pick([2, 3, 4]); return { q: `De la maison à l’école, Soumaya marche ${a} m. Aujourd’hui, elle fait ce trajet ${t} fois. Combien de mètres marche-t-elle en tout ?`, r: String(a * t), u: 'm' }; },
    () => { const r = pick([3, 4, 5]), c = pick([25, 40, 50, 75]); return { q: `Un ruban mesure ${r} m. On coupe un morceau de ${c} cm. Combien de centimètres reste-t-il ?`, r: String(r * 100 - c), u: 'cm' }; },
    () => { const k = pick([1, 2]), p = pick([125, 250, 200]); return { q: `Pour un gâteau, il faut ${p} g de farine. Le paquet contient ${k} kg. Combien de gâteaux peut-on faire ?`, r: String(Math.floor(k * 1000 / p)), u: 'gâteaux' }; },
    () => { const s = pick([2, 3, 5]), m = pick([350, 450, 600]); return { q: `Papa a ${s} l de soupe. Il en sert ${m} ml. Combien de millilitres reste-t-il ?`, r: String(s * 1000 - m), u: 'ml' }; },
    () => { const t = pick([12, 15, 18]), n2 = pick([4, 5, 6]); return { q: `Zakaria aligne ${n2} règles de ${t} cm. Quelle longueur obtient-il, en centimètres ?`, r: String(t * n2), u: 'cm' }; },
  ];
  const order = shuffle(P);
  serie(body, talk, 'Lis bien le problème, convertis si besoin, puis calcule.', ({ head, host, actions, n, done }) => {
    const p = order[(n - 1) % order.length]();
    head.textContent = `Problème ${n}/${N} : ${p.q}`;
    talk(p.q); host.replaceChildren();
    saisie(actions, p.r, p.u, talk, done);
  });
}


// ---------- Contenances : pichet gradué, unité manquante, additions, relier ----------
const C = G.capacite; // hl dal l dl cl ml ; valeurs en ml
const cap = (ml, u) => `${fmt(C, ml, u)} ${u}`;
const unitsFor = (ml) => C.u.filter((u) => { const p = pw(C, u); const d = fmt(C, ml, u).split(',')[1] || ''; return d.length <= 3 && !(p > 3 && ml < 1000) ; });
function pichetQ(host, actions, talk, done) {
  const ml = ri(5, 50) * 10, u = pick(unitsFor(ml).filter((x) => x !== 'ml').concat('cl')), H = 220, top = 20, bot = 200, max = 500;
  const y = (v) => bot - (v / max) * (bot - top);
  let lvl = null;
  const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 ' + H); svg.setAttribute('class', 'ag-pichet'); svg.setAttribute('data-testid', 'ag-pichet');
  const mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); svg.append(e); return e; };
  mk('path', { d: `M50 10 L150 10 L145 ${bot + 5} Q145 ${bot + 15} 135 ${bot + 15} L65 ${bot + 15} Q55 ${bot + 15} 55 ${bot + 5} Z`, fill: '#eef6ff', stroke: '#7a8aa0', 'stroke-width': 3 });
  const water = mk('rect', { x: 57, y: bot, width: 86, height: 0, fill: '#7cc4ff', opacity: 0.8 });
  for (let v = 50; v <= max; v += 50) { const big = v % 100 === 0; mk('line', { x1: 110, x2: big ? 140 : 128, y1: y(v), y2: y(v), stroke: '#333', 'stroke-width': big ? 2 : 1.2 }); if (big) { const t = mk('text', { x: 152, y: y(v) + 4, 'font-size': 12, fill: '#fff' }); t.textContent = v; } }
  const ml_ = mk('text', { x: 62, y: 30, 'font-size': 12, fill: '#333' }); ml_.textContent = 'ml';
  const line = mk('line', { x1: 52, x2: 148, y1: bot, y2: bot, stroke: '#e53950', 'stroke-width': 3, opacity: 0 });
  const set = (v) => { lvl = Math.max(10, Math.min(max, Math.round(v / 10) * 10)); water.setAttribute('y', y(lvl)); water.setAttribute('height', bot - y(lvl)); line.setAttribute('y1', y(lvl)); line.setAttribute('y2', y(lvl)); line.setAttribute('opacity', 1); info.textContent = `Ton trait : ${lvl} ml`; };
  const pos = (e) => { const r = svg.getBoundingClientRect(), py = (e.clientY - r.top) * (H / r.height); return ((bot - py) / (bot - top)) * max; };
  let down = false;
  svg.addEventListener('pointerdown', (e) => { down = true; set(pos(e)); }); svg.addEventListener('pointermove', (e) => { if (down) set(pos(e)); }); window.addEventListener('pointerup', () => { down = false; }, { once: false });
  const info = h('p', { class: 'muted' }, 'Touche le pichet pour tracer ton trait (tu peux le glisser).');
  host.replaceChildren(h('div', { class: 'ag-pichet-wrap' }, svg), info);
  actions.replaceChildren(h('button', { class: 'btn small', type: 'button', onclick: () => set((lvl || 0) - 10) }, '− 10 ml'), h('button', { class: 'btn small', type: 'button', onclick: () => set((lvl || 0) + 10) }, '+ 10 ml'),
    h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ag-check', onclick: () => { if (lvl == null) return; actions.querySelectorAll('button').forEach((b) => { b.disabled = true; }); const good = lvl === ml; if (!good) set(ml); talk(good ? `Parfait : ${cap(ml, u)} = ${ml} ml.` : `${cap(ml, u)} = ${ml} ml. Regarde le bon trait.`); done(good); } }, '✓ Vérifier'));
  svg.__set = set; svg.__ml = ml;
  return `Remplis le pichet jusqu’à ${cap(ml, u)}.`;
}
function pichet(body, talk) {
  serie(body, talk, 'Trace le trait au bon endroit. Attention à l’unité : convertis d’abord en millilitres !', ({ head, host, actions, n, done }) => {
    const q = pichetQ(host, actions, talk, done); head.textContent = `Pichet ${n}/${N} : ${q}`; talk(q.replace(/(\d),(\d)/g, '$1 virgule $2'));
  });
}
function uniteManquanteQ() {
  const g = G[pick(KINDS)], m = mesure(g, 1); let to; do { to = pick(g.u); } while (to === m.unit || Math.abs(pw(g, to) - pw(g, m.unit)) > 3);
  return { g, q: `${fmt(g, m.v, m.unit)} ${m.unit} = ${fmt(g, m.v, to)} …`, right: to, opts: shuffle(g.u.filter((x) => x !== to && x !== m.unit)).slice(0, 3).concat(to) };
}
function uniteManquante(body, talk) {
  serie(body, talk, 'Complète avec la bonne unité.', ({ head, host, actions, n, done }) => {
    const Q = uniteManquanteQ(); head.textContent = `Question ${n}/${N} : ${Q.q}`; talk('Quelle unité manque ?'); host.replaceChildren();
    choix(actions, Q.opts, Q.right, talk, done, `${Q.q.replace('…', Q.right)}.`);
  });
}
function additionQ() {
  const to = pick(['cl', 'dl', 'ml']), n2 = ri(3, 4), parts = [];
  const pool = to === 'ml' ? ['ml', 'cl', 'dl', 'l'] : ['ml', 'cl', 'dl', 'l', 'dal'];
  while (parts.length < n2) { const u = pick(pool); const step = Math.pow(10, Math.max(pw(C, to), 0)); let v = ri(1, 9) * Math.pow(10, pw(C, u)) * pick([1, 1, 5, 10]) / pick([1, 1, 2]); v = Math.round(v / step) * step; if (v > 0 && v <= 30000) parts.push({ v, u }); }
  const tot = parts.reduce((a, p) => a + p.v, 0);
  return { q: parts.map((p) => cap(p.v, p.u)).join(' + ') + ` = ? ${to}`, r: fmt(C, tot, to), to, detail: parts.map((p) => fmt(C, p.v, to)).join(' + ') };
}
function addition(body, talk) {
  serie(body, talk, 'Additionne les contenances. Convertis d’abord toutes les mesures dans l’unité demandée !', ({ head, host, actions, n, done }) => {
    const Q = additionQ(); head.textContent = `Calcul ${n}/${N} : ${Q.q}`; talk('Convertis chaque mesure, puis additionne.');
    host.replaceChildren(h('p', { class: 'muted ag-memo' }, C.u.join(' → ')));
    saisie(actions, Q.r, Q.to, talk, done, `Détail : ${Q.detail}.`);
  });
}
function relier(body, talk) {
  serie(body, talk, 'Relie les mesures équivalentes : touche une carte, puis sa jumelle.', ({ head, host, actions, n, done }) => {
    const g = G[pick(KINDS)], pairs = [];
    while (pairs.length < 3) { const m = mesure(g, 1); let u2; do { u2 = pick(g.u); } while (u2 === m.unit || Math.abs(pw(g, u2) - pw(g, m.unit)) > 3); if (!pairs.some((p) => p.v === m.v)) pairs.push({ v: m.v, a: `${fmt(g, m.v, m.unit)} ${m.unit}`, b: `${fmt(g, m.v, u2)} ${u2}` }); }
    const cards = shuffle(pairs.flatMap((p, i) => [{ t: p.a, i }, { t: p.b, i }]));
    let sel = null, found = 0, errs = 0;
    head.textContent = `Série ${n}/${N} : ${g.icon} ${g.nom.toLowerCase()} — trouve les 3 paires.`; talk('Relie les mesures équivalentes.');
    const box = h('div', { class: 'ag-cards' }, ...cards.map((c) => h('button', { class: 'btn ag-card', type: 'button', 'data-pair': c.i, onclick: (e) => {
      const el = e.currentTarget; if (el.classList.contains('ok')) return;
      if (!sel) { sel = el; el.classList.add('primary'); return; }
      if (sel === el) { el.classList.remove('primary'); sel = null; return; }
      if (sel.dataset.pair === el.dataset.pair) { sel.classList.remove('primary'); sel.classList.add('ok'); el.classList.add('ok'); found++; Sfx.tap(); }
      else { errs++; sel.classList.remove('primary'); el.classList.add('ko'); setTimeout(() => el.classList.remove('ko'), 600); }
      sel = null;
      if (found === 3) { const good = errs <= 1; talk(good ? 'Bravo, toutes les paires sont trouvées !' : `Trouvé, avec ${errs} erreurs. Convertis dans la même unité pour comparer.`); done(good); }
    } }, c.t)));
    host.replaceChildren(box); actions.replaceChildren();
  });
}
// Évaluation (comme une interro) : 8 questions variées, résultat A / EA / NA
function evaluation(body, talk) {
  const kinds = shuffle(['pichet', 'unite', 'unite', 'addition', 'addition', 'conv', 'conv', 'comparer']);
  let i = 0, ok = 0;
  const head = h('p', { class: 'prompt' }), host = h('div'), actions = h('div', { class: 'actions wrap' });
  body.replaceChildren(h('p', { class: 'muted' }, '📝 Évaluation : 8 questions comme en classe. A = acquis, EA = en voie d’acquisition, NA = non acquis.'), head, host, actions);
  const next = () => {
    if (i >= kinds.length) {
      const note = ok >= 7 ? ['A', 'Acquis', '🏆'] : ok >= 5 ? ['EA', 'En voie d’acquisition', '💪'] : ['NA', 'Non acquis', '📚'];
      if (note[0] === 'A') { star(3); burst(body); }
      const st = ST(); st.evals = (st.evals || []).concat({ d: Date.now(), ok, n: kinds.length }).slice(-20); S.save();
      head.textContent = `${note[2]} ${ok} / ${kinds.length} — ${note[0]} : ${note[1]}`; talk(`Tu as ${ok} sur ${kinds.length}. ${note[1]}.`);
      host.replaceChildren(h('p', { class: 'muted' }, note[0] === 'A' ? 'Bravo ! Trois étoiles bonus.' : 'Relis les astuces, puis entraîne-toi dans les autres onglets.'));
      actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ag-again', onclick: () => evaluation(body, talk) }, '↻ Nouvelle évaluation'));
      return;
    }
    const k = kinds[i], done = (good) => { if (good) { ok++; Sfx.win(); } i++; setTimeout(next, good ? 1300 : 2600); };
    const pre = `Question ${i + 1}/${kinds.length} : `;
    if (k === 'pichet') { head.textContent = pre + pichetQ(host, actions, talk, done); }
    else if (k === 'unite') { const Q = uniteManquanteQ(); head.textContent = pre + 'complète avec la bonne unité : ' + Q.q; host.replaceChildren(); choix(actions, Q.opts, Q.right, talk, done, `${Q.q.replace('…', Q.right)}.`); }
    else if (k === 'addition') { const Q = additionQ(); head.textContent = pre + Q.q; host.replaceChildren(); saisie(actions, Q.r, Q.to, talk, done, `Détail : ${Q.detail}.`); }
    else if (k === 'conv') { const g = G[pick(KINDS)], m = mesure(g, 1); let to; do { to = pick(g.u); } while (to === m.unit || Math.abs(pw(g, to) - pw(g, m.unit)) > 3); head.textContent = pre + `${fmt(g, m.v, m.unit)} ${m.unit} = ? ${to}`; host.replaceChildren(); saisie(actions, fmt(g, m.v, to), to, talk, done); }
    else { const g = G[pick(KINDS)], a = mesure(g, 1), b = { v: a.v * pick([1, 10]) + pick([0, 0, Math.pow(10, pw(g, a.unit))]), unit: pick(g.u.filter((u) => Math.abs(pw(g, u) - pw(g, a.unit)) <= 2)) }; const r = a.v < b.v ? '<' : a.v > b.v ? '>' : '='; head.textContent = pre + `${fmt(g, a.v, a.unit)} ${a.unit} … ${fmt(g, b.v, b.unit)} ${b.unit}`; host.replaceChildren(); choix(actions, ['<', '=', '>'], r, talk, done, 'Convertis dans la même unité pour comparer.'); }
    talk('Question ' + (i + 1));
  };
  next();
}

// ---------- Longueurs à la règle : mesurer, tracer, égalités ----------
const PX = 34; // 1 cm à l'écran
function regle(len, { draw = false, onSet = null } = {}) {
  const NS = 'http://www.w3.org/2000/svg', W = 15 * PX + 40, svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} 120`); svg.setAttribute('class', 'ag-regle'); svg.setAttribute('data-testid', 'ag-regle');
  const mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); svg.append(e); return e; };
  const x0 = 20, y0 = 60;
  mk('rect', { x: 10, y: y0, width: 15 * PX + 20, height: 50, rx: 6, fill: '#fff3b0', stroke: '#b08900' });
  for (let mm = 0; mm <= 150; mm++) { const x = x0 + mm * PX / 10, cm = mm % 10 === 0, half = mm % 5 === 0; mk('line', { x1: x, x2: x, y1: y0, y2: y0 + (cm ? 18 : half ? 12 : 7), stroke: '#5d4300', 'stroke-width': cm ? 1.6 : 0.8 }); if (cm) { const t = mk('text', { x, y: y0 + 32, 'font-size': 12, 'text-anchor': 'middle', fill: '#5d4300' }); t.textContent = mm / 10; } }
  const seg = mk('line', { x1: x0, x2: x0 + len * PX / 10, y1: 40, y2: 40, stroke: '#e53950', 'stroke-width': 5, 'stroke-linecap': 'round' });
  mk('circle', { cx: x0, cy: 40, r: 4, fill: '#e53950' }); const end = mk('circle', { cx: x0 + len * PX / 10, cy: 40, r: draw ? 9 : 4, fill: draw ? '#2f8fd1' : '#e53950' });
  if (draw) {
    let down = false; let cur = len;
    const set = (e) => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * (W / r.width); cur = Math.max(5, Math.min(150, Math.round((x - x0) / (PX / 10)))); seg.setAttribute('x2', x0 + cur * PX / 10); end.setAttribute('cx', x0 + cur * PX / 10); onSet && onSet(cur); };
    svg.addEventListener('pointerdown', (e) => { down = true; set(e); }); svg.addEventListener('pointermove', (e) => { if (down) set(e); }); svg.addEventListener('pointerup', () => { down = false; });
    svg.__set = (mm) => { cur = mm; seg.setAttribute('x2', x0 + mm * PX / 10); end.setAttribute('cx', x0 + mm * PX / 10); onSet && onSet(mm); };
  }
  return svg;
}
const cmmm = (mm) => `${Math.floor(mm / 10)} cm${mm % 10 ? ' ' + (mm % 10) + ' mm' : ''}`;
function mesurerQ(host, actions, talk, done) {
  const mm = ri(15, 140), asMm = Math.random() < 0.5;
  host.replaceChildren(h('div', { class: 'ag-regle-wrap' }, regle(mm)));
  saisie(actions, asMm ? String(mm) : fmt(G.longueur, mm, 'cm'), asMm ? 'mm' : 'cm', talk, done, `Le segment mesure ${cmmm(mm)}, soit ${mm} mm = ${fmt(G.longueur, mm, 'cm')} cm.`);
  return `Mesure le segment rouge. Réponds en ${asMm ? 'millimètres' : 'centimètres (avec une virgule si besoin)'}.`;
}
function tracerQ(host, actions, talk, done) {
  const mm = ri(20, 140); let cur = 10;
  const info = h('p', { class: 'muted' }, 'Glisse le point bleu.');
  const svg = regle(10, { draw: true, onSet: (v) => { cur = v; info.textContent = `Ton segment : ${cmmm(v)}`; } });
  host.replaceChildren(h('div', { class: 'ag-regle-wrap' }, svg), info);
  actions.replaceChildren(h('button', { class: 'btn small', type: 'button', onclick: () => svg.__set(Math.max(5, cur - 1)) }, '− 1 mm'), h('button', { class: 'btn small', type: 'button', onclick: () => svg.__set(Math.min(150, cur + 1)) }, '+ 1 mm'),
    h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ag-check', onclick: () => { actions.querySelectorAll('button').forEach((b) => { b.disabled = true; }); const good = cur === mm; if (!good) svg.__set(mm); talk(good ? 'Parfait, le segment a la bonne longueur !' : `Il fallait ${cmmm(mm)}. Regarde le bon segment.`); done(good); } }, '✓ Vérifier'));
  svg.__mm = mm;
  return Math.random() < 0.5 ? `Trace un segment de ${cmmm(mm)}.` : `Trace un segment de ${fmt(G.longueur, mm, 'cm')} cm.`;
}
const EGAL = [
  () => { const a = ri(1, 9); return { q: `${a} … + ${10 - a} … = 1 cm`, r: 'mm' }; },
  () => { const a = ri(11, 89); return { q: `${a} … + ${100 - a} … = 1 m`, r: 'cm' }; },
  () => { const a = ri(1, 9); return { q: `${a} dm + ${10 - a} dm = 1 …`, r: 'm' }; },
  () => { const a = ri(1, 9) * 100 + pick([0, 20, 50]); return { q: `${a} m + ${1000 - a} m = 1 …`, r: 'km' }; },
  () => { const a = ri(1, 9); return { q: `${a} … + ${10 - a} … = 1 dm`, r: 'cm' }; },
  () => { const a = ri(1, 9) * 100; return { q: `${a} … + ${1000 - a} … = 1 m`, r: 'mm' }; },
  () => { const a = ri(1, 9) * 100 + pick([0, 50]); return { q: `${a} g + ${1000 - a} g = 1 …`, r: 'kg' }; },
  () => { const a = ri(11, 89); return { q: `${a} cl + ${100 - a} cl = 1 …`, r: 'l' }; },
];
function egaliteQ(actions, talk, done) {
  const E = pick(EGAL)(), all = ['mm', 'cm', 'dm', 'm', 'km', 'g', 'kg', 'cl', 'l'];
  const fam = ['g', 'kg'].includes(E.r) ? ['mg', 'g', 'kg', 'dag'] : ['cl', 'l'].includes(E.r) ? ['ml', 'cl', 'dl', 'l'] : ['mm', 'cm', 'dm', 'm', 'km'];
  choix(actions, shuffle(fam.filter((x) => x !== E.r)).slice(0, 3).concat(E.r), E.r, talk, done, `${E.q.replace(/…/g, E.r)}.`);
  return 'Complète l’égalité : ' + E.q;
}
function mesurer(body, talk) { serie(body, talk, 'Lis la règle : chaque petit trait = 1 mm, chaque nombre = 1 cm.', ({ head, host, actions, n, done }) => { head.textContent = `Segment ${n}/${N} : ` + mesurerQ(host, actions, talk, done); talk('Mesure le segment rouge.'); }); }
function tracer(body, talk) { serie(body, talk, 'Trace le segment demandé en glissant le point bleu le long de la règle.', ({ head, host, actions, n, done }) => { head.textContent = `Tracé ${n}/${N} : ` + tracerQ(host, actions, talk, done); talk(head.textContent.replace(/^Tracé \d+\/\d+ : /, '')); }); }
function egalites(body, talk) { serie(body, talk, 'Quelle unité complète l’égalité ?', ({ head, host, actions, n, done }) => { host.replaceChildren(); head.textContent = `Égalité ${n}/${N} : ` + egaliteQ(actions, talk, done); talk('Quelle unité manque ?'); }); }
// Évaluation progressive « longueurs » : 3 étapes, une étoile par étape réussie
function evalLongueurs(body, talk) {
  const etapes = [['Mesurer', 'mesurer'], ['Tracer', 'tracer'], ['Convertir et compléter', 'conv']];
  let e = 0, q = 0, okE = 0, stars = 0;
  const head = h('p', { class: 'prompt' }), host = h('div'), actions = h('div', { class: 'actions wrap' }), bar = h('div', { class: 'ag-stars' });
  body.replaceChildren(h('p', { class: 'muted' }, '📝 Évaluation progressive : 3 étapes de 3 questions. Réussis 2 questions sur 3 pour gagner l’étoile de l’étape.'), bar, head, host, actions);
  const drawBar = () => bar.replaceChildren(...etapes.map(([t], i) => h('span', { class: 'ag-star' + (i < e ? (i < stars + (e - stars) && bar.dataset['s' + i] === '1' ? ' on' : ' off') : i === e ? ' cur' : '') }, (bar.dataset['s' + i] === '1' ? '⭐ ' : '☆ ') + t)));
  const next = () => {
    if (q === 3) { const won = okE >= 2; bar.dataset['s' + e] = won ? '1' : '0'; if (won) { stars++; star(); } talk(won ? 'Bravo, tu as réussi cette étape !' : 'Ou revois la leçon : relis les astuces.'); e++; q = 0; okE = 0; }
    drawBar();
    if (e >= etapes.length) { head.textContent = `Résultat : ${stars} étoile${stars > 1 ? 's' : ''} sur 3 ${stars === 3 ? '🏆' : ''}`; host.replaceChildren(); if (stars === 3) burst(body); actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ag-again', onclick: () => evalLongueurs(body, talk) }, '↻ Recommencer')); talk(head.textContent); return; }
    const done = (good) => { if (good) { okE++; Sfx.win(); } q++; setTimeout(next, good ? 1200 : 2400); };
    const pre = `Étape ${e + 1} · ${etapes[e][0]} (${q + 1}/3) : `, k = etapes[e][1];
    if (k === 'mesurer') head.textContent = pre + mesurerQ(host, actions, talk, done);
    else if (k === 'tracer') head.textContent = pre + tracerQ(host, actions, talk, done);
    else if (q % 2 === 0) { host.replaceChildren(); const g = G.longueur, m = { v: pick([5, 70, 3, 28, 4, 15]) * pick([100, 1, 1000, 10]), unit: 'mm' }; const u = pick(['dm', 'mm', 'm']); const v = m.v; head.textContent = pre + `${fmt(g, v, u)} ${u} = ? cm`; saisie(actions, fmt(g, v, 'cm'), 'cm', talk, done); }
    else { host.replaceChildren(); head.textContent = pre + egaliteQ(actions, talk, done); }
  };
  next();
}

// ---------- Les masses (avec tonne et quintal) ----------
const MU = { t: 1e9, q: 1e8, kg: 1e6, hg: 1e5, dag: 1e4, g: 1e3, dg: 100, cg: 10, mg: 1 };
const MCOLS = ['t', 'q', '', 'kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'];
const mfmt = (mg, u) => { const k = Math.round(Math.log10(MU[u])); let s = String(mg); if (k > 0) { s = s.padStart(k + 1, '0'); s = s.slice(0, -k) + ',' + s.slice(-k); s = s.replace(/,?0+$/, ''); } const [i, d] = s.split(','); return i.replace(/\B(?=(\d{3})+$)/g, ' ') + (d ? ',' + d : ''); };
const MOBJ = [['un paquebot de croisière', 't'], ['un rhinocéros', 't'], ['un camion', 't'], ['un éléphant', 't'], ['une baguette de pain', 'g'], ['une tablette de chocolat', 'g'], ['une pomme', 'g'], ['un humain', 'kg'], ['un sac de pommes de terre', 'kg'], ['un chien', 'kg'], ['une fourmi', 'mg'], ['un grain de sel', 'mg'], ['un comprimé', 'mg'], ['un sac de farine de 100 kg', 'q']];
const MNOMS = { t: 'tonnes', q: 'quintaux', kg: 'kilogrammes', g: 'grammes', mg: 'milligrammes' };
function massesConv() {
  const pairs = [['hg', 'dg'], ['t', 'kg'], ['g', 'mg'], ['q', 'dag'], ['g', 'mg'], ['mg', 'g'], ['kg', 'g'], ['q', 'kg'], ['t', 'q'], ['dag', 'cg'], ['g', 'kg'], ['cg', 'g']];
  const [a, b] = pick(pairs); const big = MU[a] >= MU[b];
  let v = big ? ri(1, 40) * MU[a] / pick([1, 1, 10]) : ri(1, 999) * MU[a];
  if (!big && Math.random() < 0.5) v = ri(1, 9) * 100 * MU[a];
  v = Math.round(v); if (MU[a] >= 10 && v % 1) v = Math.round(v);
  return { q: `${mfmt(v, a)} ${a} = ? ${b}`, r: mfmt(v, b), u: b };
}
function masses(body, talk) {
  const kinds = ['unite', 'bandeau', 'conv', 'conv', 'comp', 'unite', 'bandeau', 'conv', 'comp', 'conv'];
  serie(body, talk, '⚖️ Les masses : la tonne (t) = 1 000 kg, le quintal (q) = 100 kg. Le gramme (g) est l’unité de base.', ({ head, host, actions, n, done }) => {
    const k = kinds[(n - 1) % kinds.length]; host.replaceChildren();
    if (k === 'unite') { const [o, u] = pick(MOBJ); head.textContent = `Question ${n}/${N} : quelle unité pour peser ${o} ?`; talk(head.textContent.replace(/^Question \d+\/\d+ : /, '')); choix(actions, ['tonnes', 'kilogrammes', 'grammes', 'milligrammes'].concat(u === 'q' ? ['quintaux'] : []), MNOMS[u], talk, done, `On pèse ${o} en ${MNOMS[u]}.`); }
    else if (k === 'bandeau') {
      const j = pick([0, 1, 3, 4, 5, 7, 8, 9]);
      head.textContent = `Question ${n}/${N} : quelle unité va dans la case « ? » du tableau des masses ?`;
      host.replaceChildren(h('div', { class: 'ab-wrap' }, h('table', { class: 'ab-table ag-table' }, h('thead', null,
        h('tr', null, h('th', { colspan: 6, class: 'ab-cls' }, 'Multiples du gramme'), h('th', { class: 'ag-red' }, ''), h('th', { colspan: 3, class: 'ab-cls' }, 'Sous-multiples du gramme')),
        h('tr', null, ...MCOLS.map((u, i) => h('th', { class: 'ab-k' + (u === 'g' ? ' ag-red' : '') + (i === j ? ' ab-hi' : '') }, i === j ? '?' : u)))))));
      talk('Quelle unité manque dans le tableau ?');
      const right = MCOLS[j]; choix(actions, shuffle(MCOLS.filter((u) => u && u !== right)).slice(0, 3).concat(right), right, talk, done, `De gauche à droite : t, q, (une case vide), kg, hg, dag, g, dg, cg, mg.`);
    }
    else if (k === 'conv') { const Q = massesConv(); head.textContent = `Conversion ${n}/${N} : ${Q.q}`; talk('Convertis.'); saisie(actions, Q.r, Q.u, talk, done); }
    else { const A = pick([[1800, 'g', 18, 'kg'], [1530, 'g', 1.53, 'kg'], [2, 't', 2000, 'kg'], [3, 'q', 30, 'kg'], [450, 'mg', 0.45, 'g'], [5, 'kg', 4800, 'g'], [700, 'g', 0.7, 'kg'], [1, 't', 10, 'q'], [25, 'dag', 250, 'g'], [3.5, 'kg', 350, 'dag']]);
      const va = Math.round(A[0] * MU[A[1]]), vb = Math.round(A[2] * MU[A[3]]), r = va < vb ? '<' : va > vb ? '>' : '=';
      head.textContent = `Question ${n}/${N} : ${String(A[0]).replace('.', ',')} ${A[1]} … ${String(A[2]).replace('.', ',')} ${A[3]}`; talk('Compare avec plus petit, plus grand ou égal.');
      choix(actions, ['<', '=', '>'], r, talk, done, `${mfmt(va, 'g')} g ${r} ${mfmt(vb, 'g')} g.`); }
  });
}

// 0. Astuces : la leçon en 3 étapes (inspirée de la fiche « Conversion de mesures »)
function astuces(body, talk) {
  const L = G.longueur;
  const tab = (cells, marks = {}) => h('table', { class: 'ab-table ag-table ag-mini' },
    h('thead', null, h('tr', null, ...L.u.map((u) => h('th', { class: u === 'm' ? 'ag-red' : '' }, u)))),
    h('tbody', null, h('tr', null, ...L.u.map((u) => h('td', { class: 'ab-cell' + (marks[u] ? ' ag-add' : '') }, cells[u] || '')))));
  const step = (titre, txt, ex) => h('div', { class: 'ag-step' }, h('h3', null, titre), h('p', null, txt), ex);
  const memo = h('table', { class: 'ab-table ag-memo-t' },
    h('thead', null, h('tr', null, h('th', null, ''), ...['kilo', 'hecto', 'déca', '', 'déci', 'centi', 'milli'].map((x) => h('th', null, x)))),
    h('tbody', null,
      h('tr', null, h('th', null, 'Longueurs'), ...['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'].map((u) => h('td', { class: u === 'm' ? 'ag-red' : '' }, u))),
      h('tr', null, h('th', null, 'Capacités'), ...['', 'hl', 'dal', 'l', 'dl', 'cl', 'ml'].map((u) => h('td', { class: u === 'l' ? 'ag-red' : '' }, u))),
      h('tr', null, h('th', null, 'Masses'), ...['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'].map((u) => h('td', { class: u === 'g' ? 'ag-red' : '' }, u)))));
  body.replaceChildren(h('div', { class: 'ag-lecon' },
    h('p', null, 'Un ', h('b', null, 'tableau de conversion'), ' sert à changer d’unité : des kilomètres en mètres, des litres en centilitres, des grammes en kilogrammes… On écrit ', h('b', null, 'un seul chiffre par colonne'), '.'),
    h('h3', null, '🧭 Un seul abaque pour tout'), memo,
    h('p', { class: 'muted' }, 'kilo = 1 000 · hecto = 100 · déca = 10 · déci = 1 dixième · centi = 1 centième · milli = 1 millième. Chaque colonne vaut 10 fois celle de droite.'),
    step('Étape 1 · Placer', 'Le chiffre des unités va dans la colonne de l’unité donnée. On n’écrit pas la virgule. Exemple : 73,8 m → le 3 va dans la colonne m.', tab({ dam: '7', m: '3', dm: '8' })),
    step('Étape 2a · Vers une unité plus grande', 'Mets la virgule après le chiffre de la colonne de la nouvelle unité. 73,8 m en dam :', h('div', null, tab({ dam: '7,', m: '3', dm: '8' }), h('p', { class: 'ag-res' }, '73,8 m = 7,38 dam'))),
    step('Étape 2b · Vers une unité plus petite', 'Ajoute des zéros à droite jusqu’à la colonne de la nouvelle unité. 73,8 m en mm :', h('div', null, tab({ dam: '7', m: '3', dm: '8', cm: '0', mm: '0' }, { cm: 1, mm: 1 }), h('p', { class: 'ag-res' }, '73,8 m = 73 800 mm'))),
    step('Étape 2c · Beaucoup plus grand', 'Ajoute des zéros à gauche jusqu’à la colonne de la nouvelle unité, puis « 0, ». 73,8 m en km :', h('div', null, tab({ km: '0,', hm: '0', dam: '7', m: '3', dm: '8' }, { km: 1, hm: 1 }), h('p', { class: 'ag-res' }, '73,8 m = 0,0738 km'))),
    h('p', { class: 'ag-tip' }, '💡 Astuce : vers une unité plus petite, le nombre devient plus grand (× 10, × 100, × 1 000). Vers une unité plus grande, il devient plus petit.')));
  talk('Voici les astuces : un seul chiffre par colonne, le chiffre des unités dans la colonne de l’unité, puis on déplace la virgule ou on ajoute des zéros.');
}

export function open(tab = 'astuces') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['astuces', '💡 Astuces', astuces], ['placer', '✍️ Placer', placer], ['abaque', '📊 Convertir avec l’abaque', convertirAbaque], ['tete', '🧠 Convertir de tête', convertir], ['comparer', '⚖️ Comparer', comparer],
    ['ranger', '🔢 Le plus grand ?', ranger], ['unite', '🎯 La bonne unité', unite], ['probleme', '🧩 Problèmes', probleme],
    ['pichet', '🧪 Le pichet gradué', pichet], ['unitem', '❓ L’unité qui manque', uniteManquante], ['addition', '➕ Additionner', addition], ['relier', '🔗 Relier', relier], ['eval', '📝 Évaluation', evaluation],
    ['mesurer', '📏 Mesurer à la règle', mesurer], ['tracer', '✏️ Tracer', tracer], ['egal', '🟰 Compléter les égalités', egalites], ['evall', '⭐ Évaluation longueurs', evalLongueurs], ['masses', '⚖️ Les masses (t, q, kg…)', masses]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'ag-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ab-panel' }, UI.closeButton(), h('h2', null, '📐 Mon abaque des grandeurs'),
    h('p', { class: 'ab-rule' }, '❗ Le chiffre des unités va dans la colonne de l’unité.'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Mon abaque des grandeurs', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
