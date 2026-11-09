// Examens blancs (Salle des Examens) : fiches d'évaluation d'éditeurs recréées en interactif, avec des nombres
// nouveaux à chaque partie. 1) Évaluation CM1 « Les nombres décimaux » ; 2) Évaluation CM2 « Fractions décimales
// et nombres décimaux » notée A / PA / NA par compétence ; 3) « Mes réussites » P1 → P4 (compétences à cocher).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const pick = (a) => a[ri(0, a.length - 1)];
export const fr = (x) => { const neg = x < 0; const [i, d] = String(Math.abs(+(+x).toFixed(4))).split('.'); return (neg ? '−' : '') + i.replace(/\B(?=(\d{3})+$)/g, ' ') + (d ? ',' + d : ''); };
export const norm = (s) => String(s).trim().replace(/\s/g, '').replace('.', ',').replace(/^,/, '0,').replace(/^0+(?=\d)/, '').replace(/(,\d*?)0+$/, '$1').replace(/,$/, '').toLowerCase();
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const uniq = (a) => [...new Set(a)];

// ---------- nombres en lettres (orthographe rectifiée : tout avec des traits d'union) ----------
const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const T = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante' };
const w100 = (n) => { if (n < 17) return U[n]; if (n < 20) return 'dix-' + U[n - 10]; const t = (n / 10) | 0, u = n % 10;
  if (t < 7) return u === 0 ? T[t] : u === 1 ? T[t] + '-et-un' : T[t] + '-' + U[u];
  if (t === 7) return u === 1 ? 'soixante-et-onze' : 'soixante-' + w100(10 + u);
  if (t === 8) return u === 0 ? 'quatre-vingts' : 'quatre-vingt-' + U[u];
  return 'quatre-vingt-' + w100(10 + u); };
const w1000 = (n) => { const c = (n / 100) | 0, r = n % 100; if (!c) return w100(r); const p = c === 1 ? 'cent' : U[c] + '-cent'; return r ? p + '-' + w100(r) : (c > 1 ? p + 's' : p); };
export const words = (n) => { const m = (n / 1000) | 0, r = n % 1000; if (!m) return w1000(r); const p = m === 1 ? 'mille' : w1000(m).replace(/(cent|vingt)s$/, '$1') + '-mille'; return r ? p + '-' + w1000(r) : p; };
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const DEN = { 1: 'dixième', 2: 'centième', 3: 'millième' };
// a unités et b dixièmes/centièmes/millièmes (k chiffres après la virgule)
const decWords = (a, b, k) => `${a === 1 ? 'une' : words(a)} unité${a > 1 ? 's' : ''} et ${words(b)} ${DEN[k]}${b > 1 ? 's' : ''}`;
const decVal = (a, b, k) => a + b / 10 ** k;

// ---------- petits dessins SVG ----------
const NLW = 340;
function nl({ lo, n, step, major = 10, label = 10, arrows = [] }) {
  const x = (i) => 14 + i * ((NLW - 28) / n);
  let s = `<svg viewBox="0 0 ${NLW} 76" class="xb-svg" role="img" aria-label="droite graduée"><line x1="10" y1="30" x2="${NLW - 6}" y2="30" stroke="currentColor" stroke-width="1.6"/>`;
  for (let i = 0; i <= n; i++) { const big = i % major === 0, mid = !big && major % 2 === 0 && i % (major / 2) === 0; s += `<line x1="${x(i)}" y1="${big ? 20 : mid ? 24 : 26}" x2="${x(i)}" y2="${big ? 36 : 32}" stroke="currentColor" stroke-width="${big ? 1.6 : 0.9}"/>`;
    if (i % label === 0) s += `<text x="${x(i)}" y="15" font-size="11" text-anchor="middle" fill="currentColor">${fr(+(lo + i * step).toFixed(3))}</text>`; }
  arrows.forEach(({ i, t }) => { s += `<path d="M${x(i)} 38 l-5 9 h10 z" fill="#e8792b"/><line x1="${x(i)}" y1="46" x2="${x(i)}" y2="58" stroke="#e8792b" stroke-width="2"/>${t ? `<text x="${x(i)}" y="72" font-size="12" font-weight="700" text-anchor="middle" fill="#e8792b">${t}</text>` : ''}`; });
  return s + '</svg>';
}
const seg = (cx, cy, a, L, off = 0) => { const r = (a * Math.PI) / 180, dx = Math.cos(r) * L / 2, dy = Math.sin(r) * L / 2, ox = -Math.sin(r) * off, oy = Math.cos(r) * off; return `<line x1="${(cx - dx + ox).toFixed(1)}" y1="${(cy - dy + oy).toFixed(1)}" x2="${(cx + dx + ox).toFixed(1)}" y2="${(cy + dy + oy).toFixed(1)}" stroke="currentColor" stroke-width="1.6"/>`; };
function figs(kind) { // 3 figures, une seule correcte
  const good = ri(0, 2); let s = `<svg viewBox="0 0 330 112" class="xb-svg" role="img" aria-label="trois figures">`;
  for (let k = 0; k < 3; k++) { const cx = 55 + k * 110, a = ri(-40, 40); s += `<rect x="${cx - 52}" y="2" width="104" height="94" fill="none" stroke="currentColor" stroke-opacity=".35"/><text x="${cx}" y="109" font-size="11" text-anchor="middle" fill="currentColor">figure ${k + 1}</text>`;
    if (kind === 'perp') s += seg(cx, 50, a, 80) + seg(cx, 50, a + (k === good ? 90 : pick([62, 70, 112, 120])), 70);
    else s += seg(cx, 50, a, 74, -18) + (k === good ? seg(cx, 50, a, 74, 18) : seg(cx, 50, a + pick([-13, 13]), 74, 18)); }
  return { svg: s + '</svg>', good };
}
function band(d, k) { const c = 18, W = Math.max(d, k) + 2; let s = `<svg viewBox="0 0 ${W * c + 8} ${3 * c + 8}" class="xb-svg" style="max-width:${Math.min(360, (W * c + 8) * 1.3)}px" role="img" aria-label="bande">`;
  for (let i = 0; i < W; i++) for (let j = 0; j < 3; j++) s += `<rect x="${4 + i * c}" y="${4 + j * c}" width="${c}" height="${c}" fill="none" stroke="currentColor" stroke-opacity=".25"/>`;
  s += `<rect x="${4 + c}" y="${4}" width="${d * c}" height="${c}" fill="none" stroke="currentColor" stroke-width="2.4"/><text x="${4 + c + d * c / 2}" y="${4 + c * 0.72}" font-size="12" text-anchor="middle" fill="currentColor">u</text>`;
  s += `<rect x="${4 + c}" y="${4 + 2 * c}" width="${k * c}" height="${c}" fill="#e8792b" fill-opacity=".8"/>`; return s + '</svg>'; }
function poly() { // forme connexe sur quadrillage 5×5
  const n = ri(6, 11), set = new Set(['2,2']); const k = (x, y) => x + ',' + y;
  while (set.size < n) { const [x, y] = pick([...set]).split(',').map(Number); const [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < 5 && ny < 5) set.add(k(nx, ny)); }
  let per = 0; set.forEach((p) => { const [x, y] = p.split(',').map(Number); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (!set.has(k(x + dx, y + dy))) per++; }); });
  const c = 26; let s = `<svg viewBox="0 0 ${5 * c + 8} ${5 * c + 8}" class="xb-svg" style="max-width:180px" role="img" aria-label="figure sur quadrillage">`;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) s += `<rect x="${4 + i * c}" y="${4 + j * c}" width="${c}" height="${c}" fill="${set.has(k(i, j)) ? '#7a5cc4' : 'none'}" stroke="currentColor" stroke-opacity=".35"/>`;
  return { svg: s + '</svg>', area: n, per };
}

// ---------- générateurs : nombres décimaux ----------
const toMil = (s) => Math.round(parseFloat(String(s).replace(/\s/g, '').replace(',', '.')) * 1000);
const PL = { 2: 'centaines', 1: 'dizaines', 0: 'unités', '-1': 'dixièmes', '-2': 'centièmes', '-3': 'millièmes' };
const D = {
  lettre2chiffre: (kmax = 2) => { const k = ri(1, kmax), a = ri(2, 25), b = ri(1, 10 ** k - 1); return { q: `Écris en chiffres : ${cap(decWords(a, b, k))}.`, s: fr(decVal(a, b, k)), why: `${a} unités → ${a}, ${DEN[k]}s → ${k} chiffre${k > 1 ? 's' : ''} après la virgule : ${fr(decVal(a, b, k))}.` }; },
  chiffre2lettre: (kmax = 2) => { const k = ri(1, kmax), a = ri(2, 25), b = ri(1, 10 ** k - 1), v = fr(decVal(a, b, k)); const o = uniq([decWords(a, b, k), decWords(a, b, k === 1 ? 2 : 1), decWords(b || 1, a, k), `${words(a)} unités et ${words(b)} ${DEN[k === 3 ? 2 : 3]}s`]); return { q: `Comment s’écrit ${v} en lettres ?`, o, r: o[0], why: `${v} : ${k} chiffre${k > 1 ? 's' : ''} après la virgule → des ${DEN[k]}s.` }; },
  frac2dec: (dens = [10, 100]) => { const d = pick(dens), n = d === 10 ? ri(2, 499) : d === 100 ? pick([ri(1, 9), ri(11, 99), ri(101, 999)]) : pick([ri(1, 99), ri(1001, 9999)]); if (n % 10 === 0) return D.frac2dec(dens); return { q: `${n}/${d} = … (écris le nombre décimal)`, s: fr(n / d), why: `Diviser par ${d} : la virgule recule de ${String(d).length - 1} rang${d > 10 ? 's' : ''} → ${fr(n / d)}.` }; },
  decompose: () => { const n = ri(101, 999); const u = (n / 100) | 0, t = ((n / 10) | 0) % 10, c = n % 10; if (!t || !c) return D.decompose(); return { q: `${n}/100 = ${u * 100}/100 + ${t * 10}/100 + ${c}/100 = ${u} + …/10 + ${c}/100. Quel nombre manque ?`, s: String(t), why: `${t * 10}/100 = ${t}/10, donc ${n}/100 = ${u} + ${t}/10 + ${c}/100 = ${fr(n / 100)}.` }; },
  dec2frac: () => { const d = pick([10, 100]), n = d === 10 ? ri(11, 199) : ri(101, 1999); if (n % 10 === 0) return D.dec2frac(); return { q: `${fr(n / d)} = …/${d}`, s: String(n), why: `${fr(n / d)} = ${n} ${d === 10 ? 'dixièmes' : 'centièmes'} = ${n}/${d}.` }; },
  motsUnites: () => { const t = pick(['d', 'c', 'uc', 'ud']); if (t === 'd') { const n = ri(11, 99); if (n % 10 === 0) return D.motsUnites(); return { q: `Écris le nombre : ${cap(words(n))} dixièmes.`, s: fr(n / 10), why: `${n} dixièmes = ${n}/10 = ${fr(n / 10)}.` }; }
    if (t === 'c') { const n = ri(101, 499); return { q: `Écris le nombre : ${cap(words(n))} centièmes.`, s: fr(n / 100), why: `${n} centièmes = ${n}/100 = ${fr(n / 100)}.` }; }
    if (t === 'uc') { const a = ri(2, 30), c = ri(1, 9); return { q: `Écris le nombre : ${cap(words(a))} unités et ${words(c)} centième${c > 1 ? 's' : ''}.`, s: fr(a + c / 100), why: `Pas de dixièmes : on écrit 0 → ${fr(a + c / 100)}.` }; }
    const a = ri(11, 40), d = ri(1, 9); return { q: `Écris le nombre : ${cap(words(a))} unités et ${words(d)} dixième${d > 1 ? 's' : ''}.`, s: fr(a + d / 10), why: `→ ${fr(a + d / 10)}.` }; },
  valeurChiffre: () => { const ni = ri(1, 3), nd = ri(1, 3), dg = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]); let I = dg.slice(0, ni).join(''); const Dd = dg.slice(ni, ni + nd).join(''); if (ni === 1 && Math.random() < 0.3) I = '0';
    const pos = []; for (let i = 0; i < I.length; i++) if (I[i] !== '0') pos.push([I[i], I.length - 1 - i]); for (let i = 0; i < Dd.length; i++) pos.push([Dd[i], -1 - i]);
    const [c, e] = pick(pos), o = uniq([PL[e], ...shuffle(Object.keys(PL).filter((k) => +k !== e).map((k) => PL[k])).slice(0, 3)]);
    return { q: `Dans ${I},${Dd}, que représente le chiffre ${c} ?`, o, r: PL[e], why: `${c} est au rang des ${PL[e]}.` }; },
  lettres: (mode) => { // lettres A–D sur une droite graduée
    const cfg = mode === 'cent' ? { lo: 0, n: 100, step: 0.01, major: 10, label: 50 } : { lo: mode === 'frac' ? 1 : 0, n: 20, step: 0.1, major: 10, label: 10 };
    const idx = shuffle(Array.from({ length: cfg.n - 1 }, (_, i) => i + 1).filter((i) => i % 5 !== 0 || mode !== 'cent')).slice(0, 4).sort((a, b) => a - b);
    const L = ['A', 'B', 'C', 'D'], w = ri(0, 3), v = +(cfg.lo + idx[w] * cfg.step).toFixed(3);
    const lab = mode === 'frac' ? `${Math.round(v * 10)}/10` : fr(v);
    return { q: `Quelle lettre est placée sur ${lab} ?`, svg: nl({ ...cfg, arrows: idx.map((i, k) => ({ i, t: L[k] })) }), o: L, r: L[w], why: `Chaque petit trait vaut ${fr(cfg.step)}. ${lab} = ${fr(v)} → lettre ${L[w]}.` }; },
  nlRead: (mode) => { if (mode === 'cent') { const a = ri(0, 8), k = ri(1, 99); if (k % 10 === 0) return D.nlRead(mode); return { q: 'Quel nombre décimal la flèche montre-t-elle ?', svg: nl({ lo: a, n: 100, step: 0.01, major: 10, label: 100, arrows: [{ i: k }] }), s: fr(a + k / 100), why: `Entre ${a} et ${a + 1}, 100 petits traits : chacun vaut 0,01 → ${fr(a + k / 100)}.` }; }
    const k = ri(1, 29); if (k % 10 === 0) return D.nlRead(mode); return { q: 'Quel nombre décimal la flèche montre-t-elle ?', svg: nl({ lo: 0, n: 30, step: 0.1, major: 10, label: 10, arrows: [{ i: k }] }), s: fr(k / 10), why: `Chaque petit trait vaut 0,1 → ${fr(k / 10)}.` }; },
  compare: () => { const i = ri(2, 60); const P = pick([() => { const x = `${i},${ri(1, 9)}`; return [x, x + '0']; }, () => { const d = ri(1, 9); return [`${i},${d}`, `${i},0${d}`]; }, () => { const a = ri(11, 98); return [`${i},${a}`, `${i},${a - 1}${ri(1, 9)}`]; }, () => { const a = ri(2, 8); return [`${i},${a}${ri(1, 9)}`, `${i},${a + 1}`]; }, () => [`${i},${ri(1, 99)}`, `${i + ri(1, 3)},${ri(1, 9)}`]])();
    const [x, y] = Math.random() < 0.5 ? P : [P[1], P[0]]; const r = toMil(x) < toMil(y) ? '<' : toMil(x) > toMil(y) ? '>' : '=';
    return { q: `${x} … ${y}`, o: ['<', '>', '='], r, why: r === '=' ? 'Un zéro à la fin de la partie décimale ne change rien.' : 'Compare d’abord la partie entière, puis les dixièmes, puis les centièmes.' }; },
  ranger: () => { for (;;) { const i = ri(3, 14), L = uniq(shuffle([`${i},${ri(1, 9)}`, `${i},${ri(10, 99)}`, `${i},0${ri(1, 9)}`, `${i},${ri(100, 999)}`, `${i + 1},${ri(1, 9)}`])).filter((s) => !/0$/.test(s)); if (L.length < 4) continue;
    const ok = L.slice().sort((a, b) => toMil(a) - toMil(b)), trap = L.slice().sort((a, b) => { const [ia, da] = a.split(','), [ib, db] = b.split(','); return ia - ib || +da - +db; });
    if (trap.join() === ok.join()) continue; const o = [ok.join(' < '), trap.join(' < '), ok.slice().reverse().join(' < ')];
    return { q: 'Quel rangement est dans l’ordre croissant ?', o, r: o[0], why: `On compare chiffre par chiffre : ${ok.join(' < ')}.` }; } },
  encadrer: () => { const i = ri(2, 130), x = fr(i + ri(1, 999) / 1000); if (!x.includes(',')) return D.encadrer(); const o = [`${i} et ${i + 1}`, `${i - 1} et ${i}`, `${i + 1} et ${i + 2}`, `${i} et ${fr(i + 0.1)}`]; return { q: `… < ${x} < … : entre quels entiers qui se suivent ?`, o, r: o[0], why: `La partie entière de ${x} est ${i} : ${i} < ${x} < ${i + 1}.` }; },
  intercaler: () => { const lo = ri(1000, 9000), g = pick([3, 30, 300]), inside = lo + ri(1, g - 1); if (inside % 10 === 0 && g === 3) return D.intercaler(); const o = uniq([fr(inside / 1000), fr((lo + g + ri(1, 9) * (g / 3)) / 1000), fr((lo - ri(1, 9) * (g / 3)) / 1000), fr(Math.floor(lo / 100) / 10 + 1)]); if (o.length < 4) return D.intercaler();
    return { q: `Quel nombre peut-on placer : ${fr(lo / 1000)} < … < ${fr((lo + g) / 1000)} ?`, o, r: o[0], why: `${o[0]} est plus grand que ${fr(lo / 1000)} et plus petit que ${fr((lo + g) / 1000)}.` }; },
  addDec: () => { const a = ri(10000, 99999), b = ri(1000, 9999); return { q: `${fr(a / 100)} + ${fr(b / 1000)} =`, s: fr(a / 100 + b / 1000), why: 'Aligne les virgules, complète par des zéros, puis calcule.' }; },
  add3: () => { const a = ri(1000, 4000), b = ri(100, 999), c = ri(100000, 999999); return { q: `${fr(a)} + ${fr(b / 10)} + ${fr(c / 100)} =`, s: fr((a * 100 + b * 10 + c) / 100), why: 'Pose en colonnes : virgule sous virgule, unités sous unités.' }; },
  subDec: () => { const a = ri(100000, 299999), b = ri(500000, a * 10 - 1000); return { q: `${fr(a / 100)} − ${fr(b / 1000)} =`, s: fr((a * 10 - b) / 1000), why: 'Complète par des zéros pour avoir autant de chiffres après la virgule.' }; },
};

// ---------- générateurs : « Mes réussites » ----------
const PLN = ['unités', 'dizaines', 'centaines', 'milliers', 'dizaines de milliers', 'centaines de milliers', 'millions', 'dizaines de millions', 'centaines de millions'];
const decompPlaces = (maxP, mustP) => { const ps = shuffle(uniq([mustP, ...shuffle([...Array(maxP).keys()]).slice(0, 3)])).slice(0, 3); let v = 0; const txt = ps.map((p, j) => { const c = j === 0 && p >= 3 && Math.random() < 0.3 ? ri(10, 19) : ri(1, 9); v += c * 10 ** p; return `${c} ${PLN[p]}`; });
  return { q: `Écris en chiffres : ${txt.slice(0, -1).join(', ')} et ${txt[txt.length - 1]}.`, s: fr(v), why: `Place chaque nombre dans sa colonne, mets des 0 ailleurs → ${fr(v)}.` }; };
const mixed = (k, d) => { const w = (k / d) | 0, r = k % d, g = gcd(r, d); const f = r ? `${r / g}/${d / g}` : ''; return (w ? (f ? `${w} + ${f}` : `${w}`) : f) + ' u'; };
const R = {
  ecrit9999: () => { const n = ri(1001, 9999), s = String(n).split(''); const v = uniq([[s[0], s[2], s[1], s[3]], [s[0], s[1], s[3], s[2]], [s[0], '0', s[2], s[3]], [s[0], s[2], '0', s[3]]].map((a) => +a.join('')).filter((x) => x !== n && x > 999)); if (v.length < 2) return R.ecrit9999();
    const o = [fr(n), ...v.slice(0, 3).map(fr)]; return { q: `Quelle est l’écriture en chiffres de ${words(n)} ?`, o, r: o[0], why: `${words(n)} = ${fr(n)}.` }; },
  places4: () => decompPlaces(4, 3), places6: () => decompPlaces(6, ri(3, 5)), millions: () => decompPlaces(9, ri(6, 8)),
  centaines: () => { const c = ri(20, 99), u = ri(1, 9); return { q: `${c} centaines et ${u} unités s’écrit…`, s: String(c * 100 + u), why: `${c} centaines = ${fr(c * 100)} ; + ${u} = ${fr(c * 100 + u)}.` }; },
  ajout: () => { const n = ri(1000, 8000), a = pick([1001, 1010, 1100, 101]); return { q: `Quel nombre obtient-on en ajoutant ${fr(a)} à ${fr(n)} ?`, s: fr(n + a), why: `${fr(n)} + ${fr(a)} = ${fr(n + a)}.` }; },
  ajoutGrand: () => { const n = ri(100000, 880000), a = pick([1000, 10000, 100000]); return { q: `Quel nombre obtient-on en ajoutant ${fr(a)} à ${fr(n)} ?`, s: fr(n + a), why: `On ajoute 1 au rang des ${a === 1000 ? 'milliers' : a === 10000 ? 'dizaines de milliers' : 'centaines de milliers'}.` }; },
  egalProduit: () => { const a = ri(12, 98), u = ri(1, 9), d1 = (a / 10) | 0, d2 = a % 10; if (!d2 || d1 === d2) return R.egalProduit(); const n = a * 100 + u;
    const ok = [`(${a} × 100) + ${u}`, `(${a * 10} × 10) + ${u}`, `(${d2} × 100) + (${d1} × 1 000) + ${u}`], ko = [`(${a} × 10) + ${u}`, `(${d1} × 100) + (${d2} × 1 000) + ${u}`, `(${a} × 1 000) + ${u}`];
    const m = shuffle(ok).slice(0, 2); return { q: `${fr(n)} est égal à… (plusieurs réponses possibles)`, o: [...m, ...shuffle(ko).slice(0, 2)], m, why: `Calcule chaque écriture : ${m.join(' et ')} donnent ${fr(n)}.` }; },
  milliers: () => { const k = ri(100, 999); return { q: `${k} milliers s’écrit…`, s: fr(k * 1000), why: `${k} × 1 000 = ${fr(k * 1000)}.` }; },
  compris: () => { const lo = ri(100000, 800000), hi = lo + ri(8000, 40000); const ins = [lo + ri(1, (hi - lo) / 2 | 0), hi - ri(1, (hi - lo) / 2 | 0)]; const out = [hi + ri(1000, 9000), Math.floor(lo / 10) + ri(1, 999)];
    return { q: `Quels nombres sont compris entre ${fr(lo)} et ${fr(hi)} ? (plusieurs réponses possibles)`, o: [...ins, ...out].map(fr), m: uniq(ins).map(fr), why: 'Compare d’abord le nombre de chiffres, puis chiffre par chiffre depuis la gauche.' }; },
  decompProd6: () => { const a = ri(1, 9), b = ri(1, 9), c = ri(1, 9), d = ri(1, 9); const v = a * 1000 + b * 100 + c * 100000 + d; return { q: `(${a} × 1 000) + (${b} × 100) + (${c} × 100 000) + ${d} est la décomposition de…`, s: fr(v), why: `${c} centaines de milliers, ${a} milliers, ${b} centaines, ${d} unités → ${fr(v)}.` }; },
  perp: () => { const f = figs('perp'); return { q: 'Dans quelle figure les droites sont-elles perpendiculaires ? (vérifie avec ton équerre)', svg: f.svg, o: ['figure 1', 'figure 2', 'figure 3'], r: `figure ${f.good + 1}`, why: 'Perpendiculaires = elles se coupent en formant un angle droit.' }; },
  para: () => { const f = figs('para'); return { q: 'Dans quelle figure les droites sont-elles parallèles ?', svg: f.svg, o: ['figure 1', 'figure 2', 'figure 3'], r: `figure ${f.good + 1}`, why: 'Parallèles = toujours le même écart entre elles : elles ne se coupent jamais.' }; },
  bande: () => { const d = pick([4, 6, 8]), ks = shuffle(Array.from({ length: 2 * d - 1 }, (_, i) => i + 1).filter((k) => k !== d)); const k = ks[0]; const o = uniq([mixed(k, d), ...ks.slice(1).map((x) => mixed(x, d))]).slice(0, 4);
    return { q: 'Quelle est la longueur de la bande orange, avec l’unité u ?', svg: band(d, k), o, r: o[0], why: `u = ${d} carreaux ; la bande en a ${k} → ${o[0]}.` }; },
  vraiFaux: () => { const S2 = pick([() => { const [d, nm] = pick([[2, 'un demi'], [3, 'un tiers'], [4, 'un quart']]); const ok = Math.random() < 0.5; return [`${cap(nm)} s’écrit 1/${ok ? d : pick([2, 3, 4].filter((x) => x !== d))}.`, ok]; },
    () => { const d = ri(3, 8), ok = Math.random() < 0.5; return [`${d} × 1/${d} = ${ok ? 1 : d}`, ok]; }, () => { const d = ri(2, 9), ok = Math.random() < 0.5; return [`1 + 1/${d} = ${ok ? d + 1 : 2}/${d}`, ok]; },
    () => { const d = ri(2, 6), ok = Math.random() < 0.5; return [`1/${d} + 1/${d} + 1/${d} = 3/${ok ? d : 3 * d}`, ok]; }])();
    return { q: `Vrai ou faux ? ${S2[0]}`, o: ['Vrai', 'Faux'], r: S2[1] ? 'Vrai' : 'Faux', why: S2[1] ? 'C’est juste.' : 'C’est faux : relis la fraction attentivement.' }; },
  probAdd: () => Math.random() < 0.5 ? (() => { const a = ri(40, 99), b = ri(40, 99), c = ri(40, 99); return { q: `Dans une école, il y a ${a} élèves en P1-P2, ${b} en P3-P4 et ${c} en P5-P6. Combien d’élèves en tout ?`, s: String(a + b + c), why: `${a} + ${b} + ${c} = ${a + b + c}.` }; })()
    : (() => { const a = ri(10, 25), b = ri(10, 25), x = ri(8, 30); return { q: `Dans un bassin, il y a ${a} carpes, ${b} poissons rouges et des goujons. En tout, ${a + b + x} poissons. Combien de goujons ?`, s: String(x), why: `${a + b + x} − ${a} − ${b} = ${x}.` }; })(),
  probMul: () => Math.random() < 0.5 ? (() => { const a = ri(4, 9), b = ri(8, 15), x = ri(5, 20), t = a * 12 + b * 10 + x * 6; return { q: `Une fermière a vendu ${a} boîtes de 12 œufs, ${b} boîtes de 10 œufs et des boîtes de 6 œufs. En tout, ${t} œufs. Combien de boîtes de 6 œufs ?`, s: String(x), why: `${a} × 12 = ${a * 12} ; ${b} × 10 = ${b * 10} ; ${t} − ${a * 12 + b * 10} = ${x * 6} ; ${x * 6} : 6 = ${x}.` }; })()
    : (() => { const e = ri(18, 28), r = ri(1, 3), t = e * 4 + r; return { q: `La maîtresse a commandé ${t} cahiers. Chaque enfant en reçoit 4 et il en reste ${r}. Combien d’enfants ?`, s: String(e), why: `${t} − ${r} = ${t - r} ; ${t - r} : 4 = ${e}.` }; })(),
  demiDroite: () => { if (Math.random() < 0.5) { const d = pick([3, 4, 5, 6, 8]), k = ri(1, d - 1); const o = uniq([`${k}/${d}`, `${d}/${k}`, `${k}`, `${k}/${d + 1}`]); return { q: 'Quelle fraction la flèche repère-t-elle ?', svg: nl({ lo: 0, n: d, step: 1 / d, major: d, label: d, arrows: [{ i: k }] }), o, r: o[0], why: `L’unité est partagée en ${d} : la flèche est au ${k}e trait → ${k}/${d}.` }; }
    const k = ri(1, 9); if (k === 5) return R.demiDroite(); const w = 3 + ((k / 5) | 0), r = k % 5; const ok = [`${15 + k}/5`, r ? `${w} + ${r}/5` : `${w}`]; return { q: 'Quel nombre la flèche repère-t-elle ? (plusieurs réponses possibles)', svg: nl({ lo: 3, n: 10, step: 0.2, major: 5, label: 5, arrows: [{ i: k }] }), o: [...ok, `${10 + k}/5`, `${k}/5`], m: ok, why: `Chaque trait vaut 1/5 ; 3 = 15/5 → ${15 + k}/5.` }; },
  compFrac: () => { const d = ri(3, 9), S3 = [() => { const k = ri(2, 4), ok = Math.random() < 0.5; return [`${k} = ${k * d + (ok ? 0 : 1)}/${d}`, ok]; }, () => { const a = ri(2, 15), b = ri(2, 15); return a === b ? [`${a}/${d} = ${b}/${d}`, true] : [`${a}/${d} > ${b}/${d}`, a > b]; }, () => [`1/${d} < 1`, true], () => [`${d + 1}/${d} < 1`, false]];
    const L = shuffle(S3).slice(0, 3).map((f) => f()); if (!L.some((x) => x[1])) return R.compFrac(); return { q: 'Il est vrai que… (coche toutes les bonnes réponses)', o: L.map((x) => x[0]), m: L.filter((x) => x[1]).map((x) => x[0]), why: 'Même dénominateur : compare les numérateurs. Une fraction est < 1 si le numérateur est plus petit.' }; },
  encFrac: () => { const d = ri(2, 6), n = ri(d + 1, 3 * d - 1); if (n % d === 0) return R.encFrac(); const w = (n / d) | 0; const o = [`${w} et ${w + 1}`, `${w - 1} et ${w}`, `${w + 1} et ${w + 2}`]; return { q: `La fraction ${n}/${d} est comprise entre…`, o, r: o[0], why: `${w * d}/${d} = ${w} et ${(w + 1) * d}/${d} = ${w + 1}.` }; },
  decompFrac: () => { const d = ri(2, 9), q = ri(1, 5), r = ri(1, d - 1); if (Math.random() < 0.5) { const o = uniq([`${q} + ${r}/${d}`, `${r} + ${q}/${d}`, `${q + 1} + ${r}/${d}`, `${q} + ${r + 1}/${d}`]); return { q: `${q * d + r}/${d} est égal à…`, o, r: o[0], why: `${q * d}/${d} = ${q}, il reste ${r}/${d}.` }; }
    const o = uniq([`${q * d + r}/${d}`, `${q + r}/${d}`, `${q * r}/${d}`, `${q * d}/${d}`]); return { q: `${q} + ${r}/${d} est égal à…`, o, r: o[0], why: `${q} = ${q * d}/${d} ; ${q * d} + ${r} = ${q * d + r}.` }; },
  probFrac: () => { if (Math.random() < 0.5) { const d = pick([4, 5, 6]), T2 = d * ri(5, 9), a = 1, b = ri(1, d - 2); const rest = T2 - (T2 / d) * (a + b); return { q: `Lilou a ${T2} bonbons. Elle en donne ${a}/${d} à son frère et ${b}/${d} à sa sœur. Combien lui en reste-t-il ?`, s: String(rest), why: `1/${d} de ${T2} = ${T2 / d}. Elle donne ${(T2 / d) * (a + b)} bonbons → reste ${rest}.` }; }
    const d = pick([4, 5, 10]), D2 = d * ri(20, 80), p = ri(1, d - 1); return { q: `Sam doit parcourir ${D2} km. Il a déjà fait les ${p}/${d} du trajet. Combien de km lui reste-t-il ?`, s: String(D2 - (D2 / d) * p), why: `1/${d} = ${D2 / d} km ; fait : ${(D2 / d) * p} km ; reste ${D2 - (D2 / d) * p} km.` }; },
  ecritures: () => { const n = ri(101, 999), u = (n / 100) | 0, t = ((n / 10) | 0) % 10, c = n % 10; if (!t || !c) return R.ecritures();
    const ok = shuffle([`${u} + ${t}/10 + ${c}/100`, `${n}/100`, `${n} centièmes`, `${u} unités et ${t * 10 + c} centièmes`, `${u} + ${t * 10 + c}/100`, `${u * 10 + t}/10 + ${c}/100`]).slice(0, 3), ko = shuffle([`${u} + ${t * 10}/10 + ${c}/100`, `${n}/10`, `${u} + ${c}/10 + ${t}/100`]).slice(0, 2);
    return { q: `Quelles écritures sont égales à ${fr(n / 100)} ? (plusieurs réponses possibles)`, o: [...ok, ...ko], m: ok, why: `${fr(n / 100)} = ${u} unités, ${t} dixièmes, ${c} centièmes = ${n} centièmes.` }; },
  recomp: () => { const n = ri(101, 999), u = (n / 100) | 0, t = ((n / 10) | 0) % 10, c = n % 10; if (!t || !c) return R.recomp(); return Math.random() < 0.5 ? { q: `${n}/100 = ${u} + …/100`, s: String(t * 10 + c), why: `${n}/100 = ${u * 100}/100 + ${t * 10 + c}/100 = ${u} + ${t * 10 + c}/100.` } : { q: `${n}/100 = ${u} unités + … dixièmes + ${c} centièmes`, s: String(t), why: `${fr(n / 100)} : le chiffre des dixièmes est ${t}.` }; },
  motsVirgule: () => pick([() => { const a = ri(2, 30), b = ri(1, 9); return { q: `${a} unités et ${b} dixièmes =`, s: fr(a + b / 10), why: `→ ${fr(a + b / 10)}.` }; }, () => { const n = ri(11, 99); return n % 10 ? { q: `${n} dixièmes =`, s: fr(n / 10), why: `${n}/10 = ${fr(n / 10)}.` } : R.motsVirgule(); },
    () => { const a = ri(11, 40), c = ri(1, 9), d = ri(1, 9); return { q: `${a} unités et ${c} centièmes et ${d} dixièmes =`, s: fr(a + d / 10 + c / 100), why: `Attention à l’ordre : dixièmes ${d}, centièmes ${c} → ${fr(a + d / 10 + c / 100)}.` }; },
    () => { const n = pick([ri(1, 9), ri(101, 399)]); return { q: `${n} centièmes =`, s: fr(n / 100), why: `${n}/100 = ${fr(n / 100)}.` }; }, () => { const D3 = ri(1, 9), u = ri(1, 9), c = ri(1, 9); return { q: `${D3} dizaines, ${u} unités et ${c} centièmes =`, s: fr(D3 * 10 + u + c / 100), why: `→ ${fr(D3 * 10 + u + c / 100)}.` }; }])(),
  probComp: () => { const a = ri(6, 12), b = ri(40, 70), moins = Math.random() < 0.6; const v = moins ? a + b : a + b + ri(5, 10); return moins ? { q: `Lily a ${a} ans. C’est ${b} ans de moins que sa grand-mère. Quel âge a sa grand-mère ?`, s: String(a + b), why: `La grand-mère a ${b} ans de PLUS que Lily : ${a} + ${b} = ${a + b}.` }
    : { q: `Le grand-père de Lily a ${v} ans. C’est ${v - a} ans de plus que Lily. Quel âge a Lily ?`, s: String(a), why: `Lily a ${v - a} ans de MOINS : ${v} − ${v - a} = ${a}.` }; },
  addDec2: () => { const a = ri(1000, 9999), b = ri(100, 999); return { q: `${fr(a / 100)} + ${fr(b / 100)} =`, s: fr((a + b) / 100), why: 'Virgule sous virgule, puis on additionne comme des entiers.' }; },
  subDec2: () => { const a = ri(5000, 99999), b = ri(1000, a - 100); return Math.random() < 0.5 ? { q: `${fr(a / 100)} − ${fr(b / 100)} =`, s: fr((a - b) / 100), why: 'Virgule sous virgule, on soustrait comme des entiers.' } : { q: `${fr(a / 10)} − ${fr(b / 100)} =`, s: fr((a * 10 - b) / 100), why: `Complète : ${fr(a / 10)} = ${(a / 10).toFixed(2).replace('.', ',')}.` }; },
  decompDec: () => pick([() => { const u = ri(2, 9), a = ri(1, 9), b = ri(1, 9); const o = uniq([fr(u + a / 10 + b / 100), fr(u * 10 + a + b / 100), fr(u * 10 + a + b / 10)]); return { q: `${u} + ${a}/10 + ${b}/100 est égal à…`, o, r: o[0], why: `${u} unités, ${a} dixièmes, ${b} centièmes → ${o[0]}.` }; },
    () => { const u = ri(11, 99), b = ri(1, 9); const o = uniq([fr(u + b / 100), fr(u + b / 10), fr(u / 10 + b / 100)]); return { q: `${u} + ${b}/100 est égal à…`, o, r: o[0], why: 'Pas de dixièmes : on met un 0 → ' + o[0] + '.' }; },
    () => { const n = ri(11, 99); if (n % 10 === 0) return R.decompDec(); const o = [fr(n / 10), fr(n * 10), fr(n / 100)]; return { q: `Il y a ${n} dixièmes dans le nombre…`, o, r: o[0], why: `${n} dixièmes = ${n}/10 = ${o[0]}.` }; },
    () => { const x = ri(100, 999), v = fr(x / 10); if (new Set(String(x)).size < 3) return R.decompDec(); return { q: `Le chiffre des dizaines dans ${v} est…`, o: uniq([String((x / 100) | 0), String(((x / 10) | 0) % 10), String(x % 10)]), r: String((x / 100) | 0), why: `${v} : dizaines ${(x / 100) | 0}, unités ${((x / 10) | 0) % 10}, dixièmes ${x % 10}.` }; },
    () => { const x = ri(101, 999); if (x % 10 === 0) return R.decompDec(); const o = uniq([String(x), String(x % 100), String(x % 10)]); return { q: `Le nombre de centièmes dans ${fr(x / 100)} est…`, o, r: String(x), why: `${fr(x / 100)} = ${x} centièmes (le CHIFFRE des centièmes est ${x % 10}).` }; }])(),
  nlCent: () => D.nlRead('cent'),
  mulCol: () => { const [a, b] = pick([[ri(120, 999), ri(3, 9)], [ri(12, 49), ri(12, 49)], [ri(120, 699), ri(120, 699)]]); return { q: `Pose et calcule : ${a} × ${b} =`, s: fr(a * b), why: `${a} × ${b} = ${fr(a * b)}.` }; },
  encMult: () => { const m = pick([6, 7, 8, 9]), n = ri(m + 1, 9 * m); if (n % m === 0) return R.encMult(); const lo = Math.floor(n / m) * m; const o = [`${lo} et ${lo + m}`, `${lo - m} et ${lo}`, `${lo + m} et ${lo + 2 * m}`, `${n - 1} et ${n + 1}`]; return { q: `Encadre ${n} par deux multiples de ${m} qui se suivent.`, o, r: o[0], why: `${lo} = ${lo / m} × ${m} et ${lo + m} = ${lo / m + 1} × ${m}.` }; },
  diviseurs: () => { const N = pick([12, 18, 20, 24, 30, 36]), all = [...Array(N).keys()].map((i) => i + 1).filter((d) => N % d === 0); const ok = shuffle(all).slice(0, 4), ko = shuffle([5, 7, 9, 11, 14, 16, 48, N * 2].filter((x) => N % x)).slice(0, 4);
    return { q: `Coche tous les diviseurs de ${N}.`, o: [...ok, ...ko].sort((a, b) => a - b).map(String), m: ok.map(String), why: `Diviseurs de ${N} : ${all.join(', ')}.` }; },
  convLong: () => { const UN = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], i = ri(0, 4), v = pick([ri(2, 9), ri(11, 60) / 10, ri(101, 999) / 100]); const cands = UN.map((u, j) => [u, j]).filter(([, j]) => j !== i && Math.abs(j - i) <= 3);
    let bad = false; const sh = shuffle(cands), mk = ([u, j], f = 1) => { const x = v * 10 ** (j - i) * f; if (Math.abs(x * 1e4 - Math.round(x * 1e4)) > 1e-6 || x > 1e6) bad = true; return `${fr(x)} ${u}`; }; const ok = [mk(sh[0]), mk(sh[1])], ko = [mk(sh[2] || sh[0], 10), mk(sh[1], 0.1)];
    if (bad || uniq([...ok, ...ko]).length < 4) return R.convLong(); return { q: `${fr(v)} ${UN[i]} est égal à… (plusieurs réponses possibles)`, o: [...ok, ...ko], m: ok, why: 'Utilise ton abaque : chaque colonne vaut 10 fois la suivante.' }; },
  probDiv: () => { if (Math.random() < 0.5) { const L = ri(2, 5), c = pick([25, 30, 35, 40, 45]), n = Math.floor(L * 100 / c), r = L * 100 - n * c; return Math.random() < 0.5 || !r ? { q: `Combien de morceaux de ${c} cm peut-on découper dans ${L} m de ruban ?`, s: String(n), why: `${L} m = ${L * 100} cm ; ${L * 100} : ${c} = ${n} reste ${r}.` } : { q: `On découpe des morceaux de ${c} cm dans ${L} m de ruban. Quelle longueur reste-t-il (en cm) ?`, s: String(r), why: `${L * 100} = ${n} × ${c} + ${r}.` }; }
    const k = ri(2, 4), x = ri(15, 45) * 10, n = ri(2, 5), p = ri(9, 15) * 10, P = Math.ceil((k * x + n * p) / 500) * 500 + 500, rend = P - k * x - n * p;
    return { q: `Léo achète ${k} pâtés et ${n} croissants à ${fr(p / 100)} € l’un. Il paie ${fr(P / 100)} € et on lui rend ${fr(rend / 100)} €. Combien coûte un pâté (en €) ?`, s: fr(x / 100), why: `Dépensé : ${fr((P - rend) / 100)} € ; croissants : ${fr(n * p / 100)} € ; pâtés : ${fr(k * x / 100)} € ; : ${k} = ${fr(x / 100)} €.` }; },
  divCol: () => { const b = pick([ri(3, 9), ri(12, 29)]), a = ri(b * 100, 49999); const q = Math.floor(a / b), r = a % b; return Math.random() < 0.6 ? { q: `${fr(a)} : ${b} = ? (le quotient)`, s: String(q), why: `${fr(a)} = ${b} × ${fr(q)} + ${r}.` } : { q: `${fr(a)} : ${b} : quel est le reste ?`, s: String(r), why: `${fr(a)} = ${b} × ${fr(q)} + ${r}.` }; },
  prop: () => { if (Math.random() < 0.5) { const C = ri(150, 400) * 2, k = pick([2, 6, 8, 12]); return { q: `4 stylos coûtent ${fr(C / 100)} €. Combien coûtent ${k} stylos (en €) ?`, s: fr(C * k / 4 / 100), why: `${k} stylos = ${k / 4} × le prix de 4 stylos : ${fr(C * k / 4 / 100)} €.` }; }
    const F = ri(3, 8) * 100, N = 20, M = pick([10, 30, 40, 50]); return { q: `Il faut ${F} g de farine pour ${N} crêpes. Combien pour ${M} crêpes (en g) ?`, s: String(F * M / N), why: `Pour 10 crêpes : ${F / 2} g ; pour ${M} : ${F * M / N} g.` }; },
  probMul2: () => { if (Math.random() < 0.5) { const b = ri(10, 25), x = ri(5, 20), t = b * 5 + x * 3; return { q: `Un fleuriste reçoit ${t} roses. Il fait ${b} bouquets de 5 roses, puis des bouquets de 3 avec le reste. Combien de bouquets de 3 ?`, s: String(x), why: `${b} × 5 = ${b * 5} ; ${t} − ${b * 5} = ${x * 3} ; ${x * 3} : 3 = ${x}.` }; }
    const L = ri(8, 15), T2 = ri(12, 20), d = ri(3, T2 - 2); return { q: `Un circuit mesure ${L} km. Il faut faire ${T2} tours. Samir en a fait ${d}. Combien de km lui reste-t-il ?`, s: String(L * (T2 - d)), why: `Reste ${T2 - d} tours × ${L} km = ${L * (T2 - d)} km.` }; },
  compMulti: () => { const L = shuffle([() => { const a = ri(3, 9), b = ri(10, 99); return [`${a},${ri(1, 9)} < ${a},${b}`, null]; }, () => { const a = ri(2, 9), d = ri(1, 9); return [`${a},${d}0 = ${a},${d}`, true]; }, () => { const a = ri(5, 15), d = ri(2, 9); return [`${a},${d} > ${a},${d - 1}${ri(1, 9)}`, true]; }, () => { const a = ri(2, 9); return [`${a},05 > ${a},5`, false]; }]).slice(0, 3).map((f) => f())
    .map(([s, t]) => { if (t !== null) return [s, t]; const [x, y] = s.split(' < '); return [s, toMil(x) < toMil(y)]; }); if (!L.some((x) => x[1])) return R.compMulti();
    return { q: 'Il est exact que… (coche toutes les bonnes réponses)', o: L.map((x) => x[0]), m: L.filter((x) => x[1]).map((x) => x[0]), why: 'Compare chiffre par chiffre ; un 0 final ne change rien.' }; },
  ordre3: () => { const a = ri(2, 20), d = ri(1, 7), x = [`${a},${d}`, `${a},${d}${ri(1, 4)}`, `${a},${d}${ri(5, 9)}`]; const o = [x.join(' < '), [x[0], x[2], x[1]].join(' < '), x.slice().reverse().join(' < ')]; return { q: 'Quel est le bon ordre ?', o, r: o[0], why: `${x[0]} = ${x[0]}0, le plus petit.` }; },
  compMult: () => pick([() => { const a = ri(12, 60), k = ri(3, 8); return { q: `Clément a ${a} images. Il en a ${k} fois moins que son ami. Combien d’images a son ami ?`, s: String(a * k), why: `${k} fois moins que l’ami → l’ami en a ${k} fois plus : ${a} × ${k} = ${a * k}.` }; },
    () => { const j = ri(8, 25), k = ri(2, 5); return { q: `Lison a ${2 * j} billes. Elle en a deux fois plus que Jérémy. Jérémy a ${k} fois moins de billes que Maé. Combien Maé a-t-elle de billes ?`, s: String(j * k), why: `Jérémy : ${2 * j} : 2 = ${j} ; Maé : ${j} × ${k} = ${j * k}.` }; }])(),
  peri: () => { const p = poly(); return { q: 'Chaque carreau mesure 1 cm de côté. Quel est le périmètre de la figure violette (en cm) ?', svg: p.svg, s: String(p.per), why: `Compte les côtés de carreaux sur le bord : ${p.per} cm.` }; },
  aire: () => { const p = poly(); return { q: 'Un carreau = 1 u. Quelle est l’aire de la figure violette (en u) ?', svg: p.svg, s: String(p.area), why: `Compte les carreaux : ${p.area} u.` }; },
  periPoly: () => { const n = ri(4, 5), L = Array.from({ length: n }, () => ri(25, 75)); const t = L.reduce((a, b) => a + b, 0); return { q: `Un ${n === 4 ? 'quadrilatère' : 'pentagone'} a des côtés de ${L.map((x) => fr(x / 10) + ' cm').join(', ')}. Quel est son périmètre (en cm) ?`, s: fr(t / 10), why: `On additionne tous les côtés : ${fr(t / 10)} cm.` }; },
  cercle: () => pick([() => { const r = pick([1.5, 2, 2.5, 3, 3.5, 4]); return { q: `Un cercle a un rayon de ${fr(r)} cm. Son diamètre mesure…`, o: [`${fr(2 * r)} cm`, `${fr(r / 2)} cm`, `${fr(r)} cm`], r: `${fr(2 * r)} cm`, why: 'Diamètre = 2 × rayon.' }; },
    () => { const d = pick([4, 5, 6, 7, 9]); return { q: `Un cercle a un diamètre de ${d} cm. Son rayon mesure…`, o: [`${fr(d / 2)} cm`, `${2 * d} cm`, `${d} cm`], r: `${fr(d / 2)} cm`, why: 'Rayon = diamètre : 2.' }; },
    () => ({ q: 'Le segment qui relie le centre à un point du cercle s’appelle…', o: ['le rayon', 'le diamètre', 'la corde'], r: 'le rayon', why: 'Rayon : du centre jusqu’au cercle.' }),
    () => ({ q: 'Le segment qui passe par le centre et relie deux points du cercle s’appelle…', o: ['le diamètre', 'le rayon', 'le compas'], r: 'le diamètre', why: 'Diamètre : il traverse le cercle en passant par le centre.' })])(),
};

const PERIODES = [
  { id: 'P1', c: [['p1a', 'Je sais utiliser et représenter les nombres jusqu’à 9 999.', [R.ecrit9999, R.places4, R.centaines, R.ajout, R.egalProduit]], ['p1b', 'Je sais utiliser et représenter les nombres jusqu’à 999 999.', [R.milliers, R.places6, R.compris, R.ajoutGrand, R.decompProd6]],
    ['p1c', 'Je sais reconnaître des droites perpendiculaires.', [R.perp]], ['p1d', 'Je sais utiliser des fractions simples.', [R.bande, R.vraiFaux]], ['p1e', 'Je sais résoudre des problèmes additifs.', [R.probAdd]], ['p1f', 'Je sais résoudre des problèmes multiplicatifs.', [R.probMul]]] },
  { id: 'P2', c: [['p2a', 'Je sais placer une fraction sur une demi-droite graduée.', [R.demiDroite]], ['p2b', 'Je sais comparer et encadrer des fractions.', [R.compFrac, R.encFrac]], ['p2c', 'Je sais décomposer des fractions.', [R.decompFrac]], ['p2d', 'Je sais résoudre des problèmes avec des fractions.', [R.probFrac]],
    ['p2e', 'Je sais utiliser des fractions décimales pour représenter les nombres.', [R.ecritures]], ['p2f', 'Je sais décomposer et recomposer des fractions décimales.', [R.recomp]], ['p2g', 'Je sais lire et écrire des nombres décimaux.', [() => D.frac2dec([10, 100]), R.motsVirgule]],
    ['p2h', 'Je sais résoudre des problèmes additifs de comparaison.', [R.probComp]], ['p2i', 'Je sais additionner et soustraire des nombres décimaux.', [R.addDec2, R.subDec2]], ['p2j', 'Je sais reconnaître des droites parallèles.', [R.para]]] },
  { id: 'P3', c: [['p3a', 'Je sais décomposer un nombre décimal.', [R.decompDec]], ['p3b', 'Je sais repérer un nombre décimal sur une demi-droite graduée.', [R.nlCent, () => D.lettres('cent')]], ['p3c', 'Je sais poser et effectuer une multiplication.', [R.mulCol]], ['p3d', 'Je reconnais les multiples et les diviseurs.', [R.encMult, R.diviseurs]],
    ['p3e', 'Je sais comparer et convertir des longueurs.', [R.convLong]], ['p3f', 'Je sais résoudre des problèmes de division.', [R.probDiv]], ['p3g', 'Je sais poser et effectuer une division.', [R.divCol]], ['p3h', 'Je sais résoudre des problèmes de proportionnalité.', [R.prop]], ['p3i', 'Je sais résoudre des problèmes multiplicatifs à plusieurs étapes.', [R.probMul2]]] },
  { id: 'P4', c: [['p4a', 'Je sais comparer, ranger, encadrer et intercaler des nombres décimaux.', [R.compMulti, R.ordre3, D.encadrer, D.intercaler]], ['p4b', 'Je sais résoudre des problèmes de comparaison multiplicative.', [R.compMult]], ['p4c', 'Je sais calculer des périmètres.', [R.peri, R.periPoly]],
    ['p4d', 'Je sais utiliser les grands nombres (millions).', [R.millions]], ['p4e', 'Je connais le vocabulaire du cercle.', [R.cercle]], ['p4f', 'Je sais mesurer des aires sur un quadrillage.', [R.aire]]] },
];

// Évaluation CM1 « Les nombres décimaux » (13 exercices, nombres nouveaux à chaque partie)
const CM1 = () => [D.lettres('frac'), D.lettres('dec'), D.lettres('cent'), D.frac2dec([10, 100]), D.decompose(), D.dec2frac(), D.motsUnites(), D.chiffre2lettre(2), D.valeurChiffre(), D.compare(), D.ranger(), D.encadrer(), D.intercaler()];
// Évaluation CM2 notée par compétence
const CM2C = ['Lire et écrire les nombres décimaux', 'Passer d’une fraction décimale à un nombre décimal', 'Valeur de chaque chiffre selon sa position', 'Repérer et placer sur une droite graduée', 'Comparer, ranger et encadrer', 'Additionner et soustraire des nombres décimaux'];
const CM2 = () => [[0, D.lettre2chiffre(3)], [0, D.lettre2chiffre(3)], [0, D.chiffre2lettre(3)], [0, D.chiffre2lettre(2)], [1, D.decompose()], [1, D.frac2dec([100])], [1, D.frac2dec([1000])], [2, D.valeurChiffre()], [2, D.valeurChiffre()],
  [3, D.nlRead('dix')], [3, D.lettres('cent')], [4, D.compare()], [4, D.compare()], [4, D.ranger()], [4, D.encadrer()], [5, D.addDec()], [5, D.add3()], [5, D.subDec()]].map(([c, it]) => ({ ...it, c }));
export const _gen = { D, R, PERIODES, CM1, CM2 }; // pour les tests

// ---------- Fractions simples (lire, écrire, représenter, mesurer, partager) ----------
const ORD = (d) => { if (d === 2) return 'demi'; if (d === 3) return 'tiers'; if (d === 4) return 'quart'; const w = words(d);
  if (/cinq$/.test(w)) return w + 'uième'; if (/neuf$/.test(w)) return w.replace(/f$/, 'vième'); if (/[e]$/.test(w)) return w.slice(0, -1) + 'ième'; return w.replace(/s$/, '') + 'ième'; };
export const fracName = (n, d) => { const o = ORD(d); return `${words(n)} ${o}${n > 1 && d !== 3 ? 's' : ''}`; };
const COL = '#e8792b';
const fsvg = (inner, w = 110, hh = 100) => `<svg viewBox="0 0 ${w} ${hh}" class="xb-svg" style="max-width:${Math.round(w * 1.7)}px" role="img" aria-label="figure">${inner}</svg>`;
const pt = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)].map((v) => v.toFixed(1)).join(' ');
function circleFig(angles, shaded, cx = 55, cy = 50, r = 42) { // angles : bornes cumulées en tours (0..1)
  let s = ''; for (let i = 0; i < angles.length - 1; i++) { const a0 = angles[i] * 2 * Math.PI - Math.PI / 2, a1 = angles[i + 1] * 2 * Math.PI - Math.PI / 2;
    s += `<path d="M${cx} ${cy} L${pt(cx, cy, r, a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${pt(cx, cy, r, a1)} Z" fill="${shaded.has(i) ? COL : 'none'}" stroke="currentColor" stroke-width="1.4"/>`; }
  return s; }
function polyFig(d, shaded, cx = 55, cy = 50, r = 44) { let s = ''; const off = d === 4 ? -Math.PI / 4 : -Math.PI / 2;
  for (let i = 0; i < d; i++) { const a0 = off + (i * 2 * Math.PI) / d, a1 = off + ((i + 1) * 2 * Math.PI) / d; s += `<path d="M${cx} ${cy} L${pt(cx, cy, r, a0)} L${pt(cx, cy, r, a1)} Z" fill="${shaded.has(i) ? COL : 'none'}" stroke="currentColor" stroke-width="1.4"/>`; }
  return s; }
function barFig(widths, shaded, x0 = 4, y = 30, W = 200, H = 36) { let s = '', x = x0; widths.forEach((w, i) => { const ww = w * W; s += `<rect x="${x.toFixed(1)}" y="${y}" width="${ww.toFixed(1)}" height="${H}" fill="${shaded.has(i) ? COL : 'none'}" stroke="currentColor" stroke-width="1.4"/>`; x += ww; }); return s; }
function gridFig(rows, cols, shaded) { const c = 26; let s = ''; for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) s += `<rect x="${4 + j * c}" y="${4 + i * c}" width="${c}" height="${c}" fill="${shaded.has(i * cols + j) ? COL : 'none'}" stroke="currentColor" stroke-width="1.4"/>`; return { s, w: cols * c + 8, h: rows * c + 8 }; }
const pickSet = (d, k, contiguous) => { if (contiguous) { const s0 = ri(0, d - 1); return new Set(Array.from({ length: k }, (_, i) => (s0 + i) % d)); } return new Set(shuffle([...Array(d).keys()]).slice(0, k)); };
function shapeFor(d, k) { const kind = pick(d === 4 || d === 6 || d === 8 || d === 3 ? ['circle', 'poly', 'bar', 'grid'] : ['circle', 'bar', 'grid']);
  if (kind === 'circle') return fsvg(circleFig(Array.from({ length: d + 1 }, (_, i) => i / d), pickSet(d, k, true)));
  if (kind === 'poly') return fsvg(polyFig(d, pickSet(d, k, true)));
  if (kind === 'bar') return fsvg(barFig(Array(d).fill(1 / d), pickSet(d, k, Math.random() < 0.6)), 208, 96);
  const divs = [...Array(d).keys()].map((i) => i + 1).filter((r) => d % r === 0 && r > 1 && r < d); if (!divs.length) return fsvg(barFig(Array(d).fill(1 / d), pickSet(d, k, true)), 208, 96);
  const r = pick(divs), g = gridFig(r, d / r, pickSet(d, k, false)); return fsvg(g.s, g.w, g.h); }
const fracEq = (typed, [n, d]) => { const t = String(typed).replace(/\s/g, ''); let m = t.match(/^(\d+)\/(\d+)$/); if (m) return +m[2] > 0 && +m[1] * d === n * +m[2]; m = t.match(/^(\d+)$/); return !!m && n % d === 0 && +m[1] === n / d; };
const ICONS = ['🍬', '🌷', '🚗', '⭐', '🍎', '🎈', '🐟', '🧁'];
const F = {
  lire: () => { const d = ri(2, 12), n = ri(1, Math.min(d + 3, 14)); const o = uniq([fracName(n, d), fracName(d, n), fracName(n, d + 1 > 12 ? d - 1 : d + 1), fracName(n + 1, d)]); return { q: `Comment se lit la fraction ${n}/${d} ?`, o, r: o[0], why: `On lit le numérateur (${words(n)}) puis le dénominateur avec -ième : ${fracName(n, d)}.` }; },
  lireGrand: () => { const d = pick([13, 14, 15, 20, 50, 100, 1000]), n = ri(1, d === 1000 ? 9 : Math.min(19, d - 1)); return { q: `Comment se lit ${n}/${d} ?`, o: uniq([fracName(n, d), fracName(d, n), `${words(n)} ${words(d)}`]), r: fracName(n, d), why: `${n}/${d} = ${fracName(n, d)}.` }; },
  ecrire: () => { const d = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 20, 50, 100]), n = ri(1, Math.min(d + 4, 20)); return { q: `Écris en chiffres : ${fracName(n, d)}`, s: `${n}/${d}`, why: `${words(n)} → ${n} (numérateur), ${ORD(d)} → ${d} (dénominateur) : ${n}/${d}.`, exact: true }; },
  figure: () => { const d = pick([2, 3, 4, 5, 6, 8, 9, 10, 12]), k = ri(1, d - 1); return { q: 'Quelle fraction de la figure est coloriée ? (écris par exemple 3/4)', svg: shapeFor(d, k), s: `${k}/${d}`, frac: [k, d], why: `La figure a ${d} parts égales, ${k} sont coloriées : ${k}/${d}.` }; },
  figureQcm: () => { const d = pick([3, 4, 5, 6, 8, 10]), k = ri(1, d - 1); const o = uniq([`${k}/${d}`, `${d - k}/${d}`, `${k}/${d - k}`, `${d}/${k}`]).filter((x, i) => i === 0 || x !== `${k}/${d}`); return { q: 'Quelle fraction correspond à la partie coloriée ?', svg: shapeFor(d, k), o, r: o[0], why: `${k} parts coloriées sur ${d} parts égales.` }; },
  nomFigure: () => { const d = pick([2, 3, 4, 5, 6, 8, 10]), k = ri(1, d - 1); const o = uniq([fracName(k, d), fracName(d - k, d), fracName(k, d + 1), fracName(d, k)]); return { q: 'Quel est le nom de la partie coloriée ?', svg: shapeFor(d, k), o, r: o[0], why: `${k}/${d} se lit ${fracName(k, d)}.` }; },
  collection: () => { const n = ri(5, 12), k = ri(1, n - 1), ic = pick(ICONS), on = new Set(shuffle([...Array(n).keys()]).slice(0, k));
    const svg = `<div class="xb-coll">${[...Array(n).keys()].map((i) => `<span class="${on.has(i) ? 'on' : ''}">${ic}</span>`).join('')}</div>`;
    return { q: 'Quelle fraction de la collection est entourée de jaune ?', svg, s: `${k}/${n}`, frac: [k, n], why: `${k} objets sur ${n} : ${k}/${n}.` }; },
  equitable: () => { const good = ri(0, 2); const figs2 = [0, 1, 2].map((i) => { const d = ri(3, 6); if (i === good) return Math.random() < 0.5 ? fsvg(circleFig(Array.from({ length: d + 1 }, (_, j) => j / d), new Set())) : fsvg(barFig(Array(d).fill(1 / d), new Set()), 208, 96);
      const w = Array.from({ length: d }, () => ri(5, 20)), t = w.reduce((a, b) => a + b, 0); const c = w.reduce((acc, x) => [...acc, acc[acc.length - 1] + x / t], [0]);
      return Math.random() < 0.5 ? fsvg(circleFig(c, new Set())) : fsvg(barFig(w.map((x) => x / t), new Set()), 208, 96); });
    return { q: 'Quel partage est équitable (toutes les parts sont égales) ?', svg: `<div class="xb-figs">${figs2.map((s, i) => `<div><b>figure ${i + 1}</b>${s}</div>`).join('')}</div>`, o: ['figure 1', 'figure 2', 'figure 3'], r: `figure ${good + 1}`, why: 'Une fraction n’existe que si l’unité est partagée en parts ÉGALES.' }; },
  quantite: () => pick([() => { const d = pick([2, 3, 4, 6]), n = d * ri(2, 6); const k = ri(1, d - 1); return { q: `Une tablette a ${n} carreaux. Marc en mange ${k > 1 ? 'les ' : ''}${k}/${d}. Combien de carreaux mange-t-il ?`, s: String(n / d * k), why: `1/${d} de ${n} = ${n} : ${d} = ${n / d} ; × ${k} = ${n / d * k} carreaux.` }; },
    () => { const L = pick([6, 8, 10, 12]), d = pick([2, 3, 4, 5, 6].filter((x) => L % x === 0)), k = ri(1, d - 1); return { q: `Un segment mesure ${L} cm. Tu colories en bleu ${k > 1 ? 'les ' : ''}${k}/${d} du segment. Quelle longueur est bleue (en cm) ?`, s: String(L / d * k), why: `${L} : ${d} = ${L / d} cm ; × ${k} = ${L / d * k} cm.` }; },
    () => { const n = pick([12, 18, 24, 30]), k = ri(2, n / 2); return { q: `Une tablette de ${n} carreaux : ${k} carreaux sont déballés. Quelle fraction de la tablette est encore dans l’emballage ?`, s: `${n - k}/${n}`, frac: [n - k, n], why: `${n} − ${k} = ${n - k} carreaux sur ${n} : ${n - k}/${n}.` }; },
    () => { const p = pick([2, 3, 4, 8]); return { q: `Une pizza est partagée pour ${p} personnes. Quelle fraction reçoit chacun ?`, s: `1/${p}`, frac: [1, p], why: `${p} parts égales : chacun reçoit 1/${p}.` }; }])(),
  complement: () => { const D = pick([10, 12]), parts = D === 10 ? [[1, 2, 5], [2, 10, 2], [3, 10, 3], [1, 5, 2]] : [[1, 2, 6], [1, 4, 3], [1, 3, 4], [1, 6, 2], [1, 12, 1]]; const ch = shuffle(parts).slice(0, 2); const used = ch.reduce((a, [, , e]) => a + e, 0) * (ch[0][0] === 3 ? 1 : 1);
    const u = ch.reduce((a, [n, d]) => a + n * D / d, 0); if (u >= D) return F.complement(); return { q: `Pour 1 litre de cocktail : ${ch.map(([n, d]) => `${n}/${d} L`).join(' + ')} + le reste en sirop. Quelle fraction de litre de sirop ?`, s: `${D - u}/${D}`, frac: [D - u, D], why: `En ${D}es : ${ch.map(([n, d]) => `${n}/${d} = ${n * D / d}/${D}`).join(' ; ')} → il reste ${D - u}/${D}.` }; },
  droite: () => { const d = pick([3, 4, 5, 6]), max = d <= 4 ? 4 : 2, n = d * max, k = ri(1, n - 1); if (k % d === 0) return F.droite();
    const L = ['A', 'B', 'C', 'D'], idx = shuffle([...Array(n - 1).keys()].map((i) => i + 1).filter((i) => i % d)).slice(0, 4).sort((a, b) => a - b); const w = idx.indexOf(k) >= 0 ? idx.indexOf(k) : (idx[0] = k, idx.sort((a, b) => a - b), idx.indexOf(k));
    return Math.random() < 0.5 ? { q: `Quelle fraction est placée sur la lettre ${L[w]} ? (écris par exemple 7/${d})`, svg: nl({ lo: 0, n, step: 1 / d, major: d, label: d, arrows: idx.map((i, j) => ({ i, t: L[j] })) }), s: `${k}/${d}`, frac: [k, d], why: `L’unité est partagée en ${d} : chaque trait vaut 1/${d}. ${L[w]} est au ${k}e trait → ${k}/${d}.` }
      : { q: `Sur quelle lettre se trouve la fraction ${k}/${d} ?`, svg: nl({ lo: 0, n, step: 1 / d, major: d, label: d, arrows: idx.map((i, j) => ({ i, t: L[j] })) }), o: L, r: L[w], why: `Compte ${k} petits traits de 1/${d} à partir de 0.` }; },
  bandeVF: () => { const d = pick([3, 4, 5, 6]), k = ri(1, d - 1), ok = Math.random() < 0.5, kk = ok ? k : pick([k + 1, k - 1, d - k].filter((x) => x > 0 && x < d && x !== k)) || k + 1;
    const x = (i) => 10 + i * (180 / d); let s = `<line x1="10" y1="22" x2="190" y2="22" stroke="currentColor" stroke-width="1.6"/>`; for (let i = 0; i <= d; i++) s += `<line x1="${x(i)}" y1="16" x2="${x(i)}" y2="28" stroke="currentColor"/>`;
    s += `<text x="10" y="12" font-size="10" fill="currentColor" text-anchor="middle">0</text><text x="190" y="12" font-size="10" fill="currentColor" text-anchor="middle">1</text><rect x="10" y="36" width="${(k * 180) / d}" height="14" fill="#9aa0a6" stroke="currentColor"/>`;
    return { q: `Vrai ou faux ? La bande grise représente ${kk}/${d} de l’unité.`, svg: fsvg(s, 200, 56), o: ['Vrai', 'Faux'], r: kk === k ? 'Vrai' : 'Faux', why: `La bande couvre ${k} parts sur ${d} : ${k}/${d}.` }; },
};
const FRC = [['Lire et nommer des fractions', [F.lire, F.lireGrand, F.nomFigure]], ['Écrire des fractions', [F.ecrire, F.figure, F.collection]], ['Représenter des fractions', [F.figureQcm, F.bandeVF, F.droite]], ['Utiliser des fractions pour mesurer', [F.quantite, F.droite, F.bandeVF]], ['Utiliser des fractions pour partager', [F.equitable, F.quantite, F.complement]]];
const FRTEST = () => FRC.flatMap(([, g], c) => [0, 1, 2].map((j) => ({ ...g[j % g.length](), c })));
export const _frac = { F, FRC, FRTEST, fracEq };

// ---------- moteur de questions (choix unique, choix multiples, réponse écrite, dessin) ----------
function quiz(body, talk, items, title, onEnd) {
  let i = 0; const res = [];
  const top = h('p', { class: 'muted' }), head = h('p', { class: 'prompt xb-q' }), fig = h('div', { class: 'xb-fig' }), actions = h('div', { class: 'actions wrap' }), help = h('p', { class: 'muted' });
  body.replaceChildren(top, head, fig, actions, help);
  const next = () => {
    if (i >= items.length) { onEnd(res); return; }
    const it = items[i]; top.textContent = `${title} · ${i + 1}/${items.length}`; head.textContent = it.q; help.textContent = ''; fig.innerHTML = it.svg || '';
    const done = (good) => { res.push({ c: it.c, good }); if (good) { star(); Sfx.win(); } else Sfx.tap(); help.textContent = (good ? '✓ ' : `✗ Attendu : ${it.m ? it.m.join(' · ') : it.r || it.s}. `) + it.why; talk(good ? 'Juste !' : 'Regarde la correction.'); i++;
      actions.append(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'xb-next', onclick: next }, i >= items.length ? 'Voir mon résultat →' : 'Question suivante →')); };
    if (it.m) { const sel = new Set(); const btns = shuffle(uniq(it.o)).map((o) => h('button', { class: 'btn xb-opt', type: 'button', 'data-testid': it.m.includes(o) ? 'xb-ok' : 'xb-ko', 'aria-pressed': 'false', onclick: (e) => { const b = e.currentTarget; if (sel.has(o)) sel.delete(o); else sel.add(o); b.classList.toggle('sel', sel.has(o)); b.setAttribute('aria-pressed', String(sel.has(o))); } }, o));
      actions.replaceChildren(...btns, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'xb-check', onclick: (e) => { if (!sel.size) return; btns.forEach((b) => { b.disabled = true; const o = b.textContent; if (it.m.includes(o)) b.classList.add('ok'); else if (sel.has(o)) b.classList.add('ko'); }); e.currentTarget.remove(); done(it.m.length === sel.size && it.m.every((o) => sel.has(o))); } }, '✓ Vérifier')); }
    else if (it.o) { const opts = shuffle(uniq(it.o)); actions.replaceChildren(...opts.map((o) => h('button', { class: 'btn xb-opt', type: 'button', 'data-testid': o === it.r ? 'xb-ok' : 'xb-ko', onclick: (e) => { actions.querySelectorAll('button').forEach((b) => { b.disabled = true; if (b.textContent === it.r) b.classList.add('ok'); }); if (o !== it.r) e.currentTarget.classList.add('ko'); done(o === it.r); } }, o))); }
    else { const inp = h('input', { type: 'text', inputmode: 'decimal', class: 'dc-in', 'data-testid': 'xb-rep', 'aria-label': 'Réponse' }); const go = (e) => { if (!inp.value.trim()) return; inp.disabled = true; e && e.currentTarget && e.currentTarget.remove && e.currentTarget.tagName === 'BUTTON' && e.currentTarget.remove(); done(it.frac ? fracEq(inp.value, it.frac) : it.exact ? inp.value.replace(/\s/g, '') === it.s : norm(inp.value) === norm(it.s)); };
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !inp.disabled) { actions.querySelector('[data-testid=xb-check]')?.remove(); go(); } }); actions.replaceChildren(inp, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'xb-check', onclick: go }, '✓ Vérifier')); setTimeout(() => inp.focus(), 50); }
    talk(it.q);
  };
  next();
}

export function open(tab) {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' }), talk = (s) => { say.textContent = s; Voice.speak(s); };
  const body = h('div');
  const result = (res, back, extra) => { const ok = res.filter((r) => r.good).length, pc = Math.round(100 * ok / res.length); if (pc >= 80) { star(3); burst(body); }
    body.replaceChildren(h('p', { class: 'prompt' }, `${pc >= 80 ? '🏆' : pc >= 50 ? '💪' : '📚'} ${ok} / ${res.length}`), ...(extra ? [extra] : []), h('p', { class: 'muted' }, pc >= 80 ? 'Excellent ! 3 étoiles bonus.' : 'Relis les corrections et recommence : nouveaux nombres à chaque fois !'),
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'xb-again', onclick: back }, '↻ Recommencer'), h('button', { class: 'btn', type: 'button', 'data-testid': 'xb-home', onclick: home }, '← Les examens blancs')));
    talk(`${ok} sur ${res.length}.`); };
  const runCM1 = () => quiz(body, talk, CM1(), 'Évaluation CM1 · les nombres décimaux', (r) => result(r, runCM1));
  const runCM2 = () => quiz(body, talk, CM2(), 'Évaluation CM2 · décimaux', (r) => { const tab = h('table', { class: 'xb-tab' }, h('tr', null, h('th', null, 'Compétence'), h('th', null, 'Résultat')),
    ...CM2C.map((t, c) => { const L = r.filter((x) => x.c === c), p = L.filter((x) => x.good).length / L.length, v = p >= 0.75 ? 'A' : p >= 0.4 ? 'PA' : 'NA'; return h('tr', null, h('td', null, t), h('td', { class: 'xb-' + v }, v)); }));
    result(r, runCM2, h('div', null, tab, h('p', { class: 'muted' }, 'A = Atteint · PA = Partiellement atteint · NA = Non atteint'))); });
  const periode = (P) => { const b = S.get(); b.reussites = b.reussites || {};
    const runComp = ([k, t, gens]) => { const run = () => quiz(body, talk, Array.from({ length: 4 }, (_, j) => gens[j % gens.length]()), t, (r) => { const ok = r.filter((x) => x.good).length; if (ok >= 3) { const s = S.get(); s.reussites = s.reussites || {}; s.reussites[k] = true; S.save(); }
      result(r, run, h('p', { class: 'prompt' }, ok >= 3 ? '✅ Compétence réussie : elle est cochée dans « Mes réussites » !' : '◯ Il faut 3 bonnes réponses sur 4 pour cocher cette compétence.')); }); run(); };
    const bilan = () => quiz(body, talk, shuffle(P.c.map(([, , g]) => pick(g)())), `Bilan ${P.id}`, (r) => result(r, bilan));
    body.replaceChildren(h('h3', null, `🏅 ${P.id} · Mes réussites`), h('p', { class: 'muted' }, 'Touche une compétence : 4 questions. 3 bonnes réponses = la pastille se coche.'),
      h('div', { class: 'xb-comps' }, ...P.c.map((c) => h('button', { class: 'xb-comp' + (b.reussites[c[0]] ? ' done' : ''), type: 'button', 'data-testid': 'xb-c-' + c[0], onclick: () => runComp(c) }, h('span', { class: 'xb-dot' }, b.reussites[c[0]] ? '✅' : '◯'), c[1]))),
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'xb-bilan', onclick: bilan }, `📝 Examen blanc ${P.id} (une question par compétence)`), h('button', { class: 'btn', type: 'button', onclick: home }, '← Retour')));
    talk(`Période ${P.id.slice(1)} : choisis une compétence.`); };
  const lecon = () => { const ex = [2, 3, 4, 5, 6, 10].map((d) => `<div><svg viewBox="0 0 110 100" class="xb-svg" style="max-width:80px">${circleFig(Array.from({ length: d + 1 }, (_, i) => i / d), new Set([0]))}</svg><b>1/${d}</b><small>${fracName(1, d)}</small></div>`).join('');
    const box = h('div', { class: 'xb-lecon' }); box.innerHTML = `<p>Une <b>fraction</b> représente le <b>partage d’une unité en parts égales</b>.</p><p><b>3/4</b> : <b>3</b> = le <b>numérateur</b> (les parts que je prends), <b>4</b> = le <b>dénominateur</b> (les parts égales que j’ai faites).</p><p>On lit le numérateur puis le dénominateur + <i>-ième</i>, sauf : un demi, un tiers, un quart.</p><div class="xb-figs">${ex}</div><p>L’unité peut être un disque, un carré, une bande, une droite… du moment que <b>les parts sont égales</b>. Et 1/2 = 2/4 = 4/8 = 5/10.</p>`;
    body.replaceChildren(h('h3', null, '📖 Leçon : les fractions simples'), box, h('div', { class: 'actions wrap' }, h('button', { class: 'btn', type: 'button', onclick: fractions }, '← Retour'))); talk('Une fraction, c’est le partage d’une unité en parts égales.'); };
  const fractions = () => { const runT = () => quiz(body, talk, FRTEST(), 'Je me teste · fractions simples', (r) => { const tab = h('table', { class: 'xb-tab' }, h('tr', null, h('th', null, 'Compétence'), h('th', null, 'Résultat')),
      ...FRC.map(([t], c) => { const L = r.filter((x) => x.c === c), p = L.filter((x) => x.good).length / L.length, v = p >= 0.75 ? 'A' : p >= 0.4 ? 'PA' : 'NA'; return h('tr', null, h('td', null, t), h('td', { class: 'xb-' + v }, v)); }));
      result(r, runT, h('div', null, tab, h('p', { class: 'muted' }, 'A = Atteint · PA = Partiellement atteint · NA = Non atteint'))); });
    body.replaceChildren(h('h3', null, '🍰 Les fractions simples'), h('p', { class: 'muted' }, 'Lire, écrire, représenter, mesurer et partager — nouvelles figures à chaque partie.'),
      h('div', { class: 'xb-comps' }, h('button', { class: 'xb-comp', type: 'button', 'data-testid': 'xf-lecon', onclick: lecon }, h('span', { class: 'xb-dot' }, '📖'), 'La leçon (à relire avant)'),
        ...FRC.map(([t, g], c) => h('button', { class: 'xb-comp', type: 'button', 'data-testid': 'xf-' + c, onclick: () => { const run = () => quiz(body, talk, Array.from({ length: 6 }, (_, j) => g[j % g.length]()), t, (r) => result(r, run)); run(); } }, h('span', { class: 'xb-dot' }, '✏️'), `Je m’entraîne : ${t.toLowerCase()}`))),
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'xf-test', onclick: runT }, '📝 Je me teste (15 questions · A / PA / NA)'), h('button', { class: 'btn', type: 'button', onclick: home }, '← Les examens blancs')));
    talk('Les fractions simples : choisis un entraînement ou teste-toi.'); };
  const home = () => { const b = S.get(), done = (P) => P.c.filter((c) => (b.reussites || {})[c[0]]).length;
    body.replaceChildren(
      h('div', { class: 'ch-cat' }, h('h3', null, '🔢 Évaluations « Les nombres décimaux »'), h('div', { class: 'lb-shelf' },
        h('button', { class: 'lb-book', type: 'button', style: '--c:#e8792b', 'data-testid': 'xb-cm1', onclick: runCM1 }, h('span', { class: 'lb-ico' }, '🟠'), h('b', null, 'Évaluation CM1 · Les nombres décimaux'), h('small', null, '13 exercices · droite graduée, fractions, comparer')),
        h('button', { class: 'lb-book', type: 'button', style: '--c:#2f8fd1', 'data-testid': 'xb-cm2', onclick: runCM2 }, h('span', { class: 'lb-ico' }, '🔵'), h('b', null, 'Évaluation CM2 · Fractions décimales et décimaux'), h('small', null, '18 questions · résultat A / PA / NA par compétence')))),
      h('div', { class: 'ch-cat' }, h('h3', null, '🍰 Les fractions simples'), h('div', { class: 'lb-shelf' }, h('button', { class: 'lb-book', type: 'button', style: '--c:#d6336c', 'data-testid': 'xb-frac', onclick: fractions }, h('span', { class: 'lb-ico' }, '🍰'), h('b', null, 'Lire, écrire et représenter des fractions'), h('small', null, 'Leçon · 5 entraînements · Je me teste (A / PA / NA)')))),
      h('div', { class: 'ch-cat' }, h('h3', null, '🏅 Mes réussites · période par période'), h('div', { class: 'lb-shelf' }, ...PERIODES.map((P) => h('button', { class: 'lb-book', type: 'button', style: '--c:#2e9e5b', 'data-testid': 'xb-' + P.id, onclick: () => periode(P) }, h('span', { class: 'lb-ico' }, P.id), h('b', null, `Période ${P.id.slice(1)}`), h('small', null, `${done(P)} / ${P.c.length} compétences cochées`))))),
      h('p', { class: 'muted' }, 'Les nombres changent à chaque partie : on peut recommencer autant de fois qu’on veut.'));
  };
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ab-panel' }, UI.closeButton(), h('h2', null, '📝 Examens blancs'), body, say), { label: 'Examens blancs', onClose: () => Voice.stop() });
  if (tab === 'fractions') fractions(); else { home(); talk('Voici les examens blancs. Choisis une évaluation, ou tes réussites de la période.'); }
}
