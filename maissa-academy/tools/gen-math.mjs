// Générateur d'exercices de mathématiques P4, niveaux 1 à 10. Toutes les réponses sont CALCULÉES (jamais écrites à la main)
// et revérifiées par tests/content.test.mjs. Sortie : content/generated-maths.json
import fs from 'node:fs';
import path from 'node:path';

let seed = 20261017;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = (a) => a[Math.floor(rnd() * a.length)];
const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = ri(0, i); [r[i], r[j]] = [r[j], r[i]]; } return r; };

const fmtInt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fmt = (n) => {
  if (Number.isInteger(n)) return fmtInt(n);
  const s = String(Math.round(n * 1e6) / 1e6).replace('.', ',');
  const [i, d] = s.split(',');
  return fmtInt(+i) + ',' + d;
};
const names = ['Maissa', 'Mimi', 'Lina', 'Adam', 'Inès', 'Zoé', 'Nora', 'Yanis', 'Maya', 'Soumaya', 'Mohamed', 'Noé'];
const out = [];
const seenPrompt = new Set();
let counter = 0;

function add(level, domain, prompt, answer, explanation, { calc, kind = 'auto', unit = '', hint = '', distract } = {}) {
  if (seenPrompt.has(prompt)) return false;
  seenPrompt.add(prompt);
  const num = typeof answer === 'number';
  const type = kind === 'auto' ? (num && level >= 5 && rnd() < 0.35 ? 'saisie' : 'qcm') : kind;
  const q = { id: `g-ma-${String(++counter).padStart(4, '0')}`, subject: 'maths', domain, level, type, prompt, explanation, hint, passage: null, source: 'generateur', calc: calc || null };
  if (type === 'saisie') {
    const a = fmt(answer);
    q.accepted = [a, a + (unit ? ' ' + unit : ''), String(answer).replace('.', ','), String(answer)];
    q.prompt = prompt + (unit ? ` (réponse en ${unit})` : '');
  } else {
    const ds = new Set();
    const cands = distract ? distract(answer) : numDistractors(answer);
    for (const c of cands) { if (c !== answer && !(typeof c === 'number' && (c < 0 || !isFinite(c)))) ds.add(c); if (ds.size >= 3) break; }
    let k = 1;
    while (ds.size < 3 && typeof answer === 'number') { const c = answer + k * (k % 2 ? 1 : -1) * (Number.isInteger(answer) ? 1 : 0.1); if (c > 0 && c !== answer) ds.add(Math.round(c * 1e6) / 1e6); k++; }
    const all = shuffle([answer, ...ds]);
    q.choices = all.map((v) => (typeof v === 'number' ? fmt(v) + (unit ? ' ' + unit : '') : v));
    q.answer = all.indexOf(answer);
  }
  out.push(q);
  return true;
}
function numDistractors(a) {
  if (!Number.isInteger(a)) return [a + 0.1, a - 0.1, a * 10, a / 10, a + 1, a + 0.5].map((x) => Math.round(x * 1e6) / 1e6);
  const mag = a >= 1000 ? 100 : a >= 100 ? 10 : 1;
  return shuffle([a + 10, a - 10, a + mag, a - mag, a + 100, a - 100, a + 1, a - 1, a * 10, Math.round(a / 2)]).filter((x) => x > 0);
}

function repeat(n, fn) { let t = 0; while (n > 0 && t++ < n * 40) { if (fn() !== false) n--; } }

// ---------- NUMÉRATION ----------
for (let level = 1; level <= 10; level++) {
  const N = level <= 2 ? 6 : 5;
  const maxN = [100, 1000, 1000, 10000, 100000, 100000, 1000000, 1000000, 1000000, 10000000][level - 1];
  repeat(N, () => { // valeur d'un chiffre
    const digits = String(ri(maxN / 10, maxN - 1)).length;
    const n = ri(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
    const s = String(n); const pos = ri(0, s.length - 1); const d = +s[pos];
    if (d === 0) return false;
    const val = d * Math.pow(10, s.length - 1 - pos);
    const rang = ['unités', 'dizaines', 'centaines', 'unités de mille', 'dizaines de mille', 'centaines de mille', 'unités de million'][s.length - 1 - pos];
    return add(level, 'numeration', `Dans le nombre ${fmt(n)}, quelle est la valeur du chiffre ${d} ?`, val, `Le chiffre ${d} est au rang des ${rang} : il vaut ${fmt(val)}.`, { calc: `${d}*${Math.pow(10, s.length - 1 - pos)}`, distract: (a) => [a * 10, a / 10, d, a * 100, a / 100].filter((x) => x >= 1 && Number.isInteger(x) && x !== a) });
  });
  repeat(2, () => { // plus grand / précédent
    const base = ri(maxN / 10, maxN - 20); const a = base + ri(1, 9) * (level > 3 ? 10 : 1);
    return add(level, 'numeration', `Quel est le nombre qui vient juste après ${fmt(a)} ?`, a + 1, `On ajoute 1 : ${fmt(a)} + 1 = ${fmt(a + 1)}.`, { calc: `${a}+1`, distract: (x) => [x - 2, x + 1, x - 1 + 10, x + 10, x - 1].filter((v) => v !== x) });
  });
  if (level >= 3) repeat(2, () => { // décomposition
    const th = ri(1, 9) * 1000, h = ri(1, 9) * 100, t = ri(0, 9) * 10, u = ri(0, 9); const n = th + h + t + u;
    return add(level, 'numeration', `Quel nombre vaut ${th / 1000} milliers + ${h / 100} centaines + ${t / 10} dizaines + ${u} unités ?`, n, `${fmt(th)} + ${fmt(h)} + ${fmt(t)} + ${u} = ${fmt(n)}.`, { calc: `${th}+${h}+${t}+${u}` });
  });
}

// ---------- OPÉRATIONS ----------
for (let level = 1; level <= 10; level++) {
  const lim = [[10, 60], [30, 400], [100, 900], [200, 2500], [500, 9000], [1000, 25000], [3000, 90000], [5000, 400000], [20000, 900000], [50000, 900000]][level - 1];
  repeat(level <= 2 ? 4 : 3, () => { const a = ri(lim[0], lim[1]), b = ri(lim[0], lim[1]); return add(level, 'operations', `Combien font ${fmt(a)} + ${fmt(b)} ?`, a + b, `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`, { calc: `${a}+${b}`, hint: 'Additionne les unités, puis les dizaines, puis les centaines.' }); });
  repeat(3, () => { const a = ri(lim[0] * 2, lim[1] * 2), b = ri(lim[0], Math.min(a - 1, lim[1])); return add(level, 'operations', `Combien font ${fmt(a)} − ${fmt(b)} ?`, a - b, `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.`, { calc: `${a}-${b}`, hint: 'Pense à vérifier avec une addition.' }); });
  // multiplications
  const mult = [[[2, 5], [2, 9]], [[2, 4], [2, 9]], [[2, 9], [2, 10]], [[3, 9], [11, 30]], [[3, 9], [12, 99]], [[4, 9], [20, 120]], [[11, 25], [12, 40]], [[12, 40], [25, 99]], [[100, 450], [6, 12]], [[120, 480], [12, 35]]][level - 1];
  repeat(3, () => { const a = ri(mult[0][0], mult[0][1]), b = ri(mult[1][0], mult[1][1]); return add(level, 'operations', `Combien font ${fmt(a)} × ${fmt(b)} ?`, a * b, `${fmt(a)} × ${fmt(b)} = ${fmt(a * b)}.`, { calc: `${a}*${b}`, hint: 'Décompose : par exemple 24 × 6 = 20 × 6 + 4 × 6.' }); });
  // divisions exactes
  const dv = [[2, 5, 5], [2, 9, 9], [2, 9, 10], [3, 9, 20], [3, 9, 80], [4, 12, 100], [6, 12, 150], [7, 15, 200], [8, 25, 300], [11, 35, 400]][level - 1];
  repeat(3, () => { const d = ri(dv[0], dv[1]), q = ri(2, dv[2]); const n = d * q; return add(level, 'operations', `Combien font ${fmt(n)} ÷ ${d} ?`, q, `${d} × ${q} = ${fmt(n)}, donc ${fmt(n)} ÷ ${d} = ${q}.`, { calc: `${n}/${d}`, hint: `Cherche le nombre qui, multiplié par ${d}, donne ${fmt(n)}.` }); });
  if (level >= 2) repeat(1, () => { const a = ri(2, 9); const b = ri(2, 9); return add(level, 'operations', `Complète : ${a} × … = ${a * b}`, b, `${a} × ${b} = ${a * b}.`, { calc: `${a * b}/${a}` }); });
  if (level >= 4) repeat(2, () => { const n = ri(lim[0], lim[1]); return add(level, 'operations', `Quel est le double de ${fmt(n)} ?`, n * 2, `${fmt(n)} + ${fmt(n)} = ${fmt(n * 2)}.`, { calc: `${n}*2` }); });
  if (level >= 4) repeat(2, () => { const n = ri(lim[0], lim[1]) * 2; return add(level, 'operations', `Quelle est la moitié de ${fmt(n)} ?`, n / 2, `${fmt(n)} ÷ 2 = ${fmt(n / 2)}.`, { calc: `${n}/2` }); });
}

// ---------- FRACTIONS ET DÉCIMAUX ----------
for (let level = 3; level <= 10; level++) {
  repeat(2, () => { // fraction d'une quantité
    const d = pick(level < 5 ? [2, 4] : level < 8 ? [2, 3, 4, 5, 10] : [3, 4, 5, 6, 8, 10]); const q = ri(2, level < 6 ? 12 : 30); const n = d * q;
    const t = level < 6 ? 1 : ri(1, Math.min(3, d - 1));
    const name = { 2: 'la moitié', 3: 'le tiers', 4: 'le quart', 5: 'le cinquième', 6: 'le sixième', 8: 'le huitième', 10: 'le dixième' }[d];
    if (t === 1) return add(level, 'fractions', `Quel est ${name} de ${fmt(n)} ?`, q, `On divise par ${d} : ${fmt(n)} ÷ ${d} = ${q}.`, { calc: `${n}/${d}` });
    return add(level, 'fractions', `Calcule ${t}/${d} de ${fmt(n)}.`, q * t, `1/${d} de ${fmt(n)} = ${q}, donc ${t}/${d} = ${q} × ${t} = ${q * t}.`, { calc: `${n}/${d}*${t}` });
  });
  if (level >= 4) repeat(1, () => { const d = pick([4, 5, 6, 8, 10]); const t = ri(1, d - 1); return add(level, 'fractions', `Un gâteau est partagé en ${d} parts égales. Maissa en mange ${t}. Quelle fraction du gâteau a-t-elle mangée ?`, `${t}/${d}`, `${t} parts sur ${d} parts égales : ${t}/${d}.`, { distract: () => [`${d}/${t}`, `${t}/${d + 1}`, `${d - t}/${t}`, `${t + 1}/${d}`, `${t}/${d - 1}`].filter((x) => x !== `${t}/${d}`) }); });
  if (level >= 6) repeat(2, () => { // décimaux : addition
    const a = ri(10, 990) / 10, b = ri(10, 990) / 10; const s = Math.round((a + b) * 10) / 10;
    return add(level, 'fractions', `Combien font ${fmt(a)} + ${fmt(b)} ?`, s, `On aligne les virgules : ${fmt(a)} + ${fmt(b)} = ${fmt(s)}.`, { calc: `${a}+${b}`, hint: 'Aligne bien les virgules avant de calculer.' });
  });
  if (level >= 6) repeat(1, () => { const a = ri(100, 999) / 100, b = ri(100, 999) / 100; if (a === b) return false; const bigger = Math.max(a, b); return add(level, 'fractions', `Quel nombre est le plus grand : ${fmt(a)} ou ${fmt(b)} ?`, fmt(bigger), `On compare d’abord les unités, puis les dixièmes, puis les centièmes : ${fmt(bigger)} est le plus grand.`, { distract: () => [fmt(a === bigger ? b : a)], kind: 'qcm' }); });
  if (level >= 7) repeat(1, () => { const x = ri(1, 9), y = ri(2, 9); const val = x / 10; return add(level, 'fractions', `Écris ${x}/10 sous forme décimale.`, val, `${x} dixièmes s’écrivent ${fmt(val)}.`, { calc: `${x}/10`, kind: 'qcm', distract: () => [x / 100, x * 10, Math.round(x * 10 + 1) / 10, x / 1000] }); });
}

// ---------- GRANDEURS ----------
const conv = [
  ['m', 'cm', 100], ['km', 'm', 1000], ['kg', 'g', 1000], ['L', 'mL', 1000], ['h', 'min', 60], ['L', 'cL', 100], ['cm', 'mm', 10], ['m', 'dm', 10],
];
for (let level = 1; level <= 10; level++) {
  repeat(3, () => {
    const c = pick(level < 3 ? conv.slice(0, 5) : conv); const v = ri(1, level < 4 ? 5 : level < 7 ? 12 : 40); const ans = v * c[2];
    return add(level, 'grandeurs', `Combien de ${c[1]} y a-t-il dans ${v} ${c[0]} ?`, ans, `1 ${c[0]} = ${fmt(c[2])} ${c[1]}, donc ${v} ${c[0]} = ${v} × ${fmt(c[2])} = ${fmt(ans)} ${c[1]}.`, { calc: `${v}*${c[2]}`, unit: c[1], hint: `Rappelle-toi : 1 ${c[0]} = ${fmt(c[2])} ${c[1]}.` });
  });
  if (level >= 3) repeat(2, () => { // heures
    const h = ri(6, 17), m = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]); const dh = ri(0, level < 6 ? 1 : 3), dm = pick([10, 15, 20, 25, 30, 40, 45]);
    let tm = h * 60 + m + dh * 60 + dm; const eh = Math.floor(tm / 60), em = tm % 60;
    const pad = (n) => String(n).padStart(2, '0');
    const dur = dh ? `${dh} h ${dm} min` : `${dm} min`;
    const ans = `${eh} h ${pad(em)}`; const wrong = [`${eh} h ${pad((em + 10) % 60)}`, `${eh + 1} h ${pad(em)}`, `${eh} h ${pad(Math.abs(em - 10) % 60)}`, `${eh - 1} h ${pad(em)}`];
    return add(level, 'grandeurs', `Un film commence à ${h} h ${pad(m)} et dure ${dur}. À quelle heure se termine-t-il ?`, ans, `${h} h ${pad(m)} + ${dur} = ${eh} h ${pad(em)}.`, { distract: () => wrong.filter((x) => x !== ans), kind: 'qcm' });
  });
  repeat(2, () => { // périmètre
    const a = ri(2, 6 + level * 3), b = ri(2, 6 + level * 3);
    if (rnd() < 0.5) return add(level, 'grandeurs', `Quel est le périmètre d’un carré de ${a} cm de côté ?`, 4 * a, `Un carré a 4 côtés égaux : 4 × ${a} = ${4 * a} cm.`, { calc: `4*${a}`, unit: 'cm' });
    if (a === b) return false;
    return add(level, 'grandeurs', `Un rectangle mesure ${a} cm de longueur et ${b} cm de largeur. Quel est son périmètre ?`, 2 * (a + b), `2 × (${a} + ${b}) = 2 × ${a + b} = ${2 * (a + b)} cm.`, { calc: `2*(${a}+${b})`, unit: 'cm' });
  });
  if (level >= 4) repeat(1, () => { const kg = ri(1, 5), g = ri(1, 9) * 50; return add(level, 'grandeurs', `Combien de grammes y a-t-il dans ${kg} kg ${g} g ?`, kg * 1000 + g, `${kg} kg = ${fmt(kg * 1000)} g ; ${fmt(kg * 1000)} + ${g} = ${fmt(kg * 1000 + g)} g.`, { calc: `${kg}*1000+${g}`, unit: 'g' }); });
  if (level >= 6) repeat(1, () => { const a = ri(3, 12), b = ri(3, 12); return add(level, 'grandeurs', `Un rectangle mesure ${a} cm sur ${b} cm. Quelle est son aire ?`, a * b, `Aire = longueur × largeur = ${a} × ${b} = ${a * b} cm².`, { calc: `${a}*${b}`, unit: 'cm²' }); });
}

// ---------- PROBLÈMES ----------
const stuff = [['billes', 'sachet'], ['autocollants', 'pochette'], ['crayons', 'boîte'], ['fleurs', 'bouquet'], ['biscuits', 'paquet'], ['cartes', 'paquet']];
for (let level = 1; level <= 10; level++) {
  repeat(3, () => {
    const who = pick(names); const [obj, cont] = pick(stuff);
    const t = ri(1, 4);
    if (t === 1) { const a = ri(5 * level, 12 * level + 10), b = ri(3 * level, 9 * level + 5); return add(level, 'problemes', `${who} a ${fmt(a)} ${obj}. Elle en reçoit ${fmt(b)} de plus. Combien en a-t-elle maintenant ?`, a + b, `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`, { calc: `${a}+${b}` }); }
    if (t === 2) { const a = ri(20 * level, 40 * level + 30), b = ri(5, a - 5 > 5 ? Math.min(a - 5, 20 * level + 10) : 6); if (b >= a) return false; return add(level, 'problemes', `${who} possède ${fmt(a)} ${obj} et en donne ${fmt(b)}. Combien lui en reste-t-il ?`, a - b, `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.`, { calc: `${a}-${b}` }); }
    if (t === 3) { const n = ri(2, level < 4 ? 6 : 9), p = ri(3, 8 + level * 3); return add(level, 'problemes', `Une ${cont} contient ${p} ${obj}. ${who} achète ${n} ${cont}s. Combien de ${obj} cela fait-il ?`, n * p, `${n} × ${p} = ${n * p}.`, { calc: `${n}*${p}` }); }
    const n = ri(2, 6), p = ri(2, 9 + level); return add(level, 'problemes', `${who} répartit ${fmt(n * p)} ${obj} dans ${n} ${cont}s identiques. Combien de ${obj} met-elle dans chaque ${cont} ?`, p, `${fmt(n * p)} ÷ ${n} = ${p}.`, { calc: `${n * p}/${n}` });
  });
  if (level >= 3) repeat(2, () => { // deux étapes : prix
    const who = pick(names); const n1 = ri(2, 5), p1 = ri(2, 4 + level), n2 = ri(2, 4), p2 = ri(1, 3 + level);
    const total = n1 * p1 + n2 * p2; const pay = Math.ceil((total + 1) / 10) * 10 + (level > 6 ? 10 : 0); if (level < 5) return add(level, 'problemes', `${who} achète ${n1} livres à ${p1} € et ${n2} cahiers à ${p2} €. Combien paie-t-elle en tout ?`, total, `${n1} × ${p1} + ${n2} × ${p2} = ${n1 * p1} + ${n2 * p2} = ${total} €.`, { calc: `${n1}*${p1}+${n2}*${p2}`, unit: '€' });
    return add(level, 'problemes', `${who} achète ${n1} livres à ${p1} € et ${n2} cahiers à ${p2} €. Elle paie avec un billet de ${pay} €. Combien la caissière lui rend-elle ?`, pay - total, `Total : ${n1 * p1} + ${n2 * p2} = ${total} €. Monnaie : ${pay} − ${total} = ${pay - total} €.`, { calc: `${pay}-(${n1}*${p1}+${n2}*${p2})`, unit: '€', hint: 'Calcule d’abord le total des achats.' });
  });
  if (level >= 5) repeat(2, () => { // classe / équipes avec reste
    const n = ri(20, 40 + level * 4), d = ri(3, 8); const q = Math.floor(n / d), r = n % d; if (!r) return false;
    return add(level, 'problemes', `Un car peut transporter ${d} élèves par voyage. Combien de voyages faut-il pour transporter ${n} élèves ?`, q + 1, `${n} ÷ ${d} = ${q} reste ${r}. Il faut un voyage de plus pour les ${r} élèves restants : ${q + 1} voyages.`, { calc: `Math.ceil(${n}/${d})`, hint: 'Que fais-tu des élèves qui restent ?' });
  });
}

// ---------- GÉOMÉTRIE ET LOGIQUE (rédigées à la main, réponses de cours) ----------
const geo = [
  [1, 'geometrie', 'Quelle figure a 3 côtés ?', ['Le triangle', 'Le carré', 'Le cercle', 'Le rectangle'], 0, 'Un triangle a trois côtés et trois sommets.'],
  [1, 'geometrie', 'Combien de côtés a un carré ?', ['3', '4', '5', '6'], 1, 'Un carré a quatre côtés égaux.'],
  [2, 'geometrie', 'Quelle figure a 4 côtés égaux et 4 angles droits ?', ['Le carré', 'Le triangle', 'Le cercle', 'Le losange quelconque'], 0, 'Seul le carré a ces deux propriétés à la fois.'],
  [2, 'geometrie', 'Un rectangle possède toujours…', ['quatre angles droits', 'quatre côtés égaux', 'trois sommets', 'aucun angle droit'], 0, 'Les quatre angles d’un rectangle sont droits.'],
  [3, 'geometrie', 'Combien de côtés a un hexagone ?', ['5', '6', '7', '8'], 1, 'Hexa signifie six : un hexagone a six côtés.'],
  [3, 'geometrie', 'Combien de côtés a un pentagone ?', ['4', '5', '6', '8'], 1, 'Penta signifie cinq.'],
  [3, 'geometrie', 'Quelle figure a quatre côtés égaux sans forcément avoir d’angles droits ?', ['Le losange', 'Le rectangle', 'Le triangle', 'Le cercle'], 0, 'Le losange a quatre côtés de même longueur.'],
  [4, 'geometrie', 'Combien d’axes de symétrie a un carré ?', ['1', '2', '4', '8'], 2, 'Un carré a 4 axes de symétrie : 2 médianes et 2 diagonales.'],
  [4, 'geometrie', 'Un angle droit mesure…', ['45°', '90°', '120°', '180°'], 1, 'Un angle droit mesure 90°.'],
  [4, 'geometrie', 'Comment appelle-t-on un triangle qui a trois côtés égaux ?', ['équilatéral', 'isocèle', 'rectangle', 'scalène'], 0, 'Un triangle équilatéral a trois côtés de même longueur.'],
  [5, 'geometrie', 'Un triangle qui a deux côtés égaux s’appelle un triangle…', ['isocèle', 'équilatéral', 'rectangle', 'carré'], 0, 'Isocèle : deux côtés de même longueur.'],
  [5, 'geometrie', 'Combien de sommets a un cube ?', ['6', '8', '10', '12'], 1, 'Un cube a 8 sommets, 12 arêtes et 6 faces.'],
  [5, 'geometrie', 'Combien de faces a un cube ?', ['4', '6', '8', '12'], 1, 'Les 6 faces d’un cube sont des carrés.'],
  [6, 'geometrie', 'Combien d’arêtes a un cube ?', ['6', '8', '12', '16'], 2, 'Un cube a 12 arêtes.'],
  [6, 'geometrie', 'Deux droites qui ne se croisent jamais, même prolongées, sont…', ['parallèles', 'perpendiculaires', 'sécantes', 'obliques'], 0, 'Des droites parallèles gardent toujours le même écart.'],
  [7, 'geometrie', 'Deux droites qui se coupent en formant un angle droit sont…', ['perpendiculaires', 'parallèles', 'confondues', 'obliques'], 0, 'Perpendiculaires : elles forment un angle droit.'],
  [7, 'geometrie', 'Combien de côtés a un octogone ?', ['6', '7', '8', '10'], 2, 'Octo signifie huit.'],
  [8, 'geometrie', 'Le segment qui relie deux sommets non consécutifs d’un polygone s’appelle…', ['une diagonale', 'un rayon', 'un axe', 'une médiane'], 0, 'C’est une diagonale.'],
  [8, 'geometrie', 'Combien de faces rectangulaires a un pavé droit ?', ['4', '6', '8', '12'], 1, 'Un pavé droit a 6 faces rectangulaires (opposées deux à deux égales).'],
  [9, 'geometrie', 'La somme des angles d’un triangle vaut…', ['90°', '180°', '270°', '360°'], 1, 'Dans tout triangle, la somme des angles vaut 180°.'],
  [10, 'geometrie', 'Un rayon d’un cercle mesure 5 cm. Quel est son diamètre ?', ['2,5 cm', '5 cm', '10 cm', '25 cm'], 2, 'Le diamètre vaut deux rayons : 2 × 5 = 10 cm.'],
  [3, 'logique', 'Quel nombre continue la suite : 2, 4, 6, 8, … ?', ['9', '10', '12', '14'], 1, 'On ajoute 2 à chaque fois : 8 + 2 = 10.'],
  [4, 'logique', 'Quel nombre continue la suite : 5, 10, 15, 20, … ?', ['22', '25', '30', '35'], 1, 'On ajoute 5 à chaque fois.'],
  [5, 'logique', 'Quel nombre continue la suite : 3, 6, 12, 24, … ?', ['30', '36', '48', '54'], 2, 'On double chaque nombre : 24 × 2 = 48.'],
  [6, 'logique', 'Quel nombre continue la suite : 100, 90, 80, 70, … ?', ['50', '60', '65', '75'], 1, 'On enlève 10 à chaque fois.'],
  [7, 'logique', 'Quel nombre continue la suite : 1, 4, 9, 16, … ?', ['20', '24', '25', '36'], 2, 'Ce sont les carrés : 1×1, 2×2, 3×3, 4×4, donc 5×5 = 25.'],
  [8, 'logique', 'Quel nombre continue la suite : 2, 3, 5, 8, 12, … ?', ['15', '16', '17', '18'], 2, 'On ajoute 1, puis 2, puis 3, puis 4, puis 5 : 12 + 5 = 17.'],
  [9, 'logique', 'Lina a 3 jupes et 4 hauts différents. Combien de tenues différentes peut-elle composer ?', ['7', '12', '14', '1'], 1, '3 × 4 = 12 combinaisons possibles.'],
  [10, 'logique', 'Dans une classe, 3 élèves sur 5 sont des filles. Il y a 25 élèves. Combien y a-t-il de filles ?', ['10', '12', '15', '20'], 2, '25 ÷ 5 = 5 ; 3 × 5 = 15 filles.'],
];
for (const [level, domain, prompt, choices, answer, explanation] of geo) {
  out.push({ id: `g-ma-${String(++counter).padStart(4, '0')}`, subject: 'maths', domain, level, type: 'qcm', prompt, choices, answer, explanation, hint: '', passage: null, source: 'redige', calc: null });
}

const outPath = path.resolve(import.meta.dirname, '../../content/generated-maths.json');
fs.writeFileSync(outPath, JSON.stringify({ questions: out }, null, 1));
const byLvl = {}; for (const q of out) byLvl[q.level] = (byLvl[q.level] || 0) + 1;
console.log('maths générées :', out.length, byLvl);
