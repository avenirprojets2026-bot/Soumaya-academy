// Salle des nombres : le comptoir des décimaux, les calculs astucieux et l'escalier des problèmes (évaluation P4, doc 10).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri, qcm } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const pick = (a) => a[ri(0, a.length - 1)];
const dec = (c, places = 2) => { const s = (c / 100).toFixed(places); return s.replace('.', ','); }; // c = nombre de centièmes
const say1 = (c) => { const u = Math.floor(c / 100), d = Math.floor(c / 10) % 10, ce = c % 10; return `${u} unité${u > 1 ? 's' : ''}, ${d} dixième${d > 1 ? 's' : ''} et ${ce} centième${ce > 1 ? 's' : ''}`; };

// ---------- matériel en base 10 : plaque = 1 unité, barre = 1 dixième, petit cube = 1 centième ----------
function material(u, d, c, { onTap } = {}) {
  const box = h('div', { class: 'dc-mat' });
  const col = (k, n, label) => h('div', { class: 'dc-col' }, h('small', null, label), h('div', { class: 'dc-pile ' + k }, ...Array.from({ length: n }, (_, i) => h('span', { class: 'dc-' + k, onclick: onTap ? () => onTap(k, i) : null }))));
  box.append(col('u', u, 'Unités'), col('d', d, 'Dixièmes'), col('c', c, 'Centièmes'));
  return box;
}
function construire(body, talk) {
  let round = 0, ok = 0; const N = 5;
  const head = h('p', { class: 'prompt' }), host = h('div'), actions = h('div', { class: 'actions wrap' });
  body.replaceChildren(head, host, actions);
  function setup() {
    if (round >= N) { head.textContent = `Bravo ! ${ok} nombres construits sur ${N}.`; talk(head.textContent); host.replaceChildren(); actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => construire(body, talk) }, '↻ Recommencer')); Sfx.win(); burst(body); return; }
    const target = ri(1, 3) * 100 + ri(0, 9) * 10 + ri(0, 9); let u = 0, d = 0, c = 0;
    const draw = () => {
      host.replaceChildren(material(u, d, c, { onTap: (k) => { if (k === 'u') u--; if (k === 'd') d--; if (k === 'c') c--; Sfx.tap(); draw(); } }),
        h('div', { class: 'dc-adds' }, ...[['u', '+ 1 unité'], ['d', '+ 1 dixième'], ['c', '+ 1 centième']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'dc-add-' + k, onclick: () => { if (k === 'u' && u < 9) u++; if (k === 'd' && d < 9) d++; if (k === 'c' && c < 9) c++; Sfx.bloop(); draw(); } }, l))),
        h('div', { class: 'ws-big' }, `Ton nombre : ${dec(u * 100 + d * 10 + c)}`));
    };
    head.textContent = `Nombre ${round + 1}/${N} : construis ${dec(target)} avec le matériel. (Touche une pièce pour l’enlever.)`;
    talk(`Construis ${dec(target).replace(',', ' virgule ')}.`);
    draw();
    actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'dc-check', onclick: () => {
      const v = u * 100 + d * 10 + c;
      if (v === target) { ok++; star(); Sfx.win(); burst(body); talk(`Parfait : ${dec(target)}, c’est ${say1(target)}.`); round++; setTimeout(setup, 2600); }
      else talk(`Pas encore : tu as ${dec(v)}. Il faut ${say1(target)}.`, false);
    } }, '✓ Vérifier'), h('span', { class: 'muted ws-memo' }, '1 unité = 10 dixièmes = 100 centièmes'));
  }
  setup();
}
function lireComparer(body, talk) {
  const qs = [];
  for (let i = 0; i < 2; i++) { const n = ri(1, 3) * 100 + ri(0, 9) * 10 + ri(1, 9), u = Math.floor(n / 100), d = Math.floor(n / 10) % 10, c = n % 10; qs.push({ pic: () => material(u, d, c), q: 'Quel nombre le matériel représente-t-il ?', opts: [dec(n), dec(u * 100 + c * 10 + d), `${u}${d},${c}`], why: `${say1(n)} : ${dec(n)}.` }); }
  const t = ri(1, 8); qs.push({ q: `1, c’est 0,${t} et … ?`, opts: [`0,${10 - t}`, `0,${t}`, `1,${10 - t}`], why: `0,${t} + 0,${10 - t} = 1 (10 dixièmes).` });
  qs.push({ q: '1, c’est combien de fois 0,1 ?', opts: ['10 fois', '100 fois', '1 fois'], why: '1 unité = 10 dixièmes : 10 fois 0,1.' });
  qs.push({ q: '1, c’est combien de fois 0,01 ?', opts: ['100 fois', '10 fois', '1 000 fois'], why: '1 unité = 100 centièmes.' });
  const PAIRS = [[50, 45, '>'], [230, 230, '='], [108, 180, '<'], [99, 100, '<'], [305, 35, '>'], [70, 7, '>']];
  shuffle(PAIRS).slice(0, 3).forEach(([a, b, s]) => qs.push({ q: `Compare : ${dec(a, a % 10 ? 2 : 1)} … ${dec(b, b % 10 ? 2 : 1)}`, opts: [s, ...['<', '>', '='].filter((x) => x !== s)], why: `On compare d’abord les unités, puis les dixièmes, puis les centièmes. ${dec(a, a % 10 ? 2 : 1)} ${s} ${dec(b, b % 10 ? 2 : 1)}.` }));
  const n = ri(11, 49); qs.push({ q: `Quel nombre est entre ${dec(n * 10, 1)} et ${dec(n * 10 + 10, 1)} ?`, opts: [dec(n * 10 + ri(1, 9)), dec(n * 10 + 20 + ri(1, 9)), dec(n * 10 - ri(1, 9))], why: 'On regarde les dixièmes puis les centièmes.' });
  const host = h('div'); body.replaceChildren(host);
  qcm(host, talk, shuffle(qs).slice(0, 8), (o) => host.append(h('div', { class: 'actions' }, h('span', { class: 'muted' }, `${o} bonnes réponses`), h('button', { class: 'btn primary', type: 'button', onclick: () => lireComparer(body, talk) }, '↻ Encore'))));
}
// placer un décimal sur une droite graduée en dixièmes
function droite(body, talk) {
  let round = 0, ok = 0; const N = 5;
  const head = h('p', { class: 'prompt' }), host = h('div', { class: 'dr-wrap' });
  body.replaceChildren(head, host);
  function setup() {
    if (round >= N) { head.textContent = `Bravo ! ${ok} sur ${N}.`; talk(head.textContent); host.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => droite(body, talk) }, '↻ Recommencer')); Sfx.win(); burst(body); return; }
    const a = ri(0, 5), t = ri(1, 9), NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 460 120'); svg.setAttribute('class', 'dr-paper');
    const mk = (tag, at, txt) => { const e = document.createElementNS(NS, tag); Object.entries(at).forEach(([k, v]) => e.setAttribute(k, v)); if (txt != null) e.textContent = txt; svg.append(e); return e; };
    mk('line', { x1: 20, y1: 60, x2: 440, y2: 60, stroke: '#2b2440', 'stroke-width': 3 });
    for (let i = 0; i <= 10; i++) {
      const x = 30 + i * 40; mk('line', { x1: x, y1: i % 5 ? 50 : 42, x2: x, y2: i % 5 ? 70 : 78, stroke: '#2b2440', 'stroke-width': i % 5 ? 2 : 3 });
      if (i === 0 || i === 10) mk('text', { x, y: 100, class: 'dr-mark', style: 'text-anchor:middle' }, i ? String(a + 1) : String(a));
      const hit = mk('rect', { x: x - 18, y: 20, width: 36, height: 70, fill: 'transparent', style: 'cursor:pointer', 'data-testid': 'dc-tick' });
      hit.addEventListener('click', () => {
        mk('text', { x, y: 32, style: 'text-anchor:middle;font-size:22px' }, '📍');
        if (i === t) { ok++; star(); Sfx.win(); talk(`Oui ! ${a},${t} est à ${t} graduation${t > 1 ? 's' : ''} après ${a}.`, false); }
        else { Sfx.tap(); mk('text', { x: 30 + t * 40, y: 32, style: 'text-anchor:middle;font-size:22px' }, '✅'); talk(`Non, tu as montré ${a},${i}. ${a},${t} est ici, à ${t} dixième${t > 1 ? 's' : ''} après ${a}.`, false); }
        round++; setTimeout(setup, 2400);
      }, { once: true });
    }
    head.textContent = `Place ${a},${t} sur la droite graduée (chaque petit trait = 1 dixième).`; talk(`Place ${a} virgule ${t} sur la droite graduée.`);
    host.replaceChildren(svg);
  }
  setup();
}

// ---------- calculs astucieux ----------
const STRATS = [
  () => { const a = ri(12, 49); return { q: `${a} × 9 = ?`, hint: `Astuce : ${a} × 9 = ${a} × 10 − ${a}`, r: a * 9, why: `${a} × 10 = ${a * 10}, puis ${a * 10} − ${a} = ${a * 9}.` }; },
  () => { const a = ri(12, 45); return { q: `${a} × 11 = ?`, hint: `Astuce : ${a} × 11 = ${a} × 10 + ${a}`, r: a * 11, why: `${a * 10} + ${a} = ${a * 11}.` }; },
  () => { const a = ri(3, 19) * 10; return { q: `${a} : 5 = ?`, hint: `Astuce : diviser par 5, c’est diviser par 10 puis multiplier par 2`, r: a / 5, why: `${a} : 10 = ${a / 10}, puis × 2 = ${a / 5}.` }; },
  () => { const a = ri(12, 48); return { q: `${a} × 5 = ?`, hint: `Astuce : × 5, c’est × 10 puis : 2`, r: a * 5, why: `${a} × 10 = ${a * 10}, puis : 2 = ${a * 5}.` }; },
  () => { const a = ri(11, 39); return { q: `25 × ${a} × 4 = ?`, hint: 'Astuce : on peut changer l’ordre (commutativité) : 25 × 4 = 100 !', r: 100 * a, why: `25 × 4 = 100, puis 100 × ${a} = ${100 * a}.` }; },
  () => { const a = ri(21, 79), s = ri(13, 58), t = 100 - s; return { q: `${a} + ${s} + ${t} = ?`, hint: `Astuce : associe ${s} + ${t} = 100 d’abord (associativité)`, r: a + 100, why: `${s} + ${t} = 100, puis ${a} + 100 = ${a + 100}.` }; },
];
function astuces(body, talk) {
  let i = 0, ok = 0; const N = 6, list = shuffle(STRATS).map((f) => f());
  const head = h('p', { class: 'prompt' }), hint = h('p', { class: 'muted' }), inp = h('input', { type: 'text', inputmode: 'numeric', class: 'dc-in', 'data-testid': 'dc-in', 'aria-label': 'Ta réponse' }), actions = h('div', { class: 'actions wrap' });
  body.replaceChildren(head, hint, h('div', { class: 'dr-wrap' }, inp), actions);
  const ask = () => {
    if (i >= N) { head.textContent = `Bravo ! ${ok} calculs astucieux sur ${N}.`; talk(head.textContent); hint.textContent = ''; inp.remove(); actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => astuces(body, talk) }, '↻ Recommencer')); Sfx.win(); burst(body); return; }
    const it = list[i]; head.textContent = `Calcul ${i + 1}/${N} : ${it.q}`; hint.textContent = ''; inp.value = ''; inp.focus({ preventScroll: true });
    talk(`Calcule de tête : ${it.q.replace('= ?', '').replace('×', 'fois').replace(':', 'divisé par')}`);
    actions.replaceChildren(
      h('button', { class: 'btn primary', type: 'button', 'data-testid': 'dc-ok', onclick: () => {
        const v = parseInt(inp.value.replace(/\s/g, ''), 10);
        if (v === it.r) { ok++; star(); Sfx.win(); talk(`Bravo ! ${it.why}`, false); } else { Sfx.tap(); talk(`La réponse était ${it.r}. ${it.why}`, false); }
        i++; setTimeout(ask, 2600);
      } }, '✓ Valider'),
      h('button', { class: 'btn small', type: 'button', onclick: () => { hint.textContent = '💡 ' + it.hint; talk(it.hint, true); } }, '💡 L’astuce'));
  };
  ask();
}

// ---------- l'escalier des problèmes (démarche en 5 étapes) ----------
const PROBS = [
  () => { const a = ri(3, 6), p = ri(3, 8), s = ri(8, 15), age = ri(8, 10); const r = a * p + s; return { txt: [`Lina a ${age} ans.`, ` Elle achète ${a} cahiers à ${p} € chacun`, ` et un sac à ${s} €.`, ` Combien paie-t-elle en tout ?`], useful: [1, 2], calc: [`${a} × ${p} + ${s}`, `${a} + ${p} + ${s}`, `${a} × ${p} × ${s}`], est: [Math.round(r / 10) * 10, r * 3, Math.max(5, Math.round(r / 30) * 10)], r, unit: '€', rep: [`Lina paie ${r} € en tout.`, `Lina a ${r} ans.`, `Lina achète ${r} cahiers.`] }; },
  () => { const a = ri(40, 80), b = ri(40, 80), c = ri(3, 6), d = ri(4, 6); const r = a + b - c * d; return { txt: [`À la fête de l’école, il y a ${a} élèves le matin`, ` et ${b} élèves l’après-midi.`, ` ${c} groupes de ${d} élèves partent avant le goûter.`, ` La fête dure 6 heures.`, ` Combien d’élèves restent pour le goûter ?`], useful: [0, 1, 2], calc: [`${a} + ${b} − ${c} × ${d}`, `${a} + ${b} − ${c} − ${d}`, `(${a} + ${b} − ${c}) × ${d}`], est: [Math.round(r / 10) * 10, Math.round((a + b) * 2 / 10) * 10, 10], r, unit: 'élèves', rep: [`${r} élèves restent pour le goûter.`, `La fête dure ${r} heures.`, `${r} groupes partent.`] }; },
  () => { const n = ri(4, 8), p = ri(6, 12), m = n * p; return { txt: [`Le boulanger range ${m} croissants`, ` dans des boîtes de ${p} croissants.`, ` Il a ouvert sa boulangerie en 2015.`, ` Combien de boîtes remplit-il ?`], useful: [0, 1], calc: [`${m} : ${p}`, `${m} × ${p}`, `${m} − ${p}`], est: [n, m * p, m - p], r: n, unit: 'boîtes', rep: [`Il remplit ${n} boîtes.`, `Il range ${n} croissants.`, `Il a ouvert en ${n}.`] }; },
  () => { const t = ri(3, 9) * 100, k = ri(2, 3), d = ri(1, Math.max(1, Math.floor((t - 100) / k / 50))) * 50; const r = t - d * k; return { txt: [`Pour sa potion, Soumaya a une bouteille de ${t} mL.`, ` Elle verse ${k} fois ${d} mL dans le chaudron.`, ` Son chat Muezza la regarde.`, ` Combien reste-t-il dans la bouteille ?`], useful: [0, 1], calc: [`${t} − ${k} × ${d}`, `${t} − ${k} − ${d}`, `${t} + ${k} × ${d}`], est: [Math.round(r / 100) * 100 || 50, t + d, k * d * 10], r, unit: 'mL', rep: [`Il reste ${r} mL dans la bouteille.`, `Muezza boit ${r} mL.`, `Elle verse ${r} mL.`] }; },
];
const STEPS = ['🔎 Les infos utiles', '✏️ Le bon calcul', '🤔 L’estimation', '🧮 Le calcul', '💬 La réponse'];
function probleme(body, talk) {
  const P = pick(PROBS)(); let step = 0, sel = new Set();
  const stairs = h('div', { class: 'dc-stairs' }), zone = h('div', { class: 'dc-zone' }), text = h('p', { class: 'dc-prob' });
  body.replaceChildren(stairs, text, zone);
  const draw = () => {
    stairs.replaceChildren(...STEPS.map((s, i) => h('span', { class: 'dc-step' + (i < step ? ' done' : i === step ? ' now' : ''), style: `margin-top:${(4 - i) * 10}px` }, s)));
    text.replaceChildren(...P.txt.map((t, i) => h('span', { class: 'dc-tok' + (sel.has(i) ? ' on' : '') + (step > 0 && P.useful.includes(i) ? ' useful' : ''), 'data-testid': 'dc-tok', onclick: step === 0 && i < P.txt.length - 1 ? () => { sel.has(i) ? sel.delete(i) : sel.add(i); Sfx.tap(); draw(); } : null }, t)));
  };
  const next = () => { step++; star(); Sfx.coin(); draw(); run(); };
  const choose = (prompt, opts0, right, why) => { const opts = opts0.filter((o, k) => k === 0 || (String(o) !== String(opts0[0]) && opts0.findIndex((x) => String(x) === String(o)) === k)); zone.replaceChildren(h('p', { class: 'prompt' }, prompt), h('div', { class: 'answers' }, ...shuffle(opts.map((o, k) => [o, k])).map(([o, k]) => h('button', { class: 'choice', type: 'button', 'data-k': k, onclick: (e) => { if (k === right) { talk(why, false); next(); } else { e.currentTarget.classList.add('wrong'); Sfx.tap(); talk('Ce n’est pas ça. Relis bien l’énoncé.', false); } } }, String(o))))); talk(prompt); };
  function run() {
    if (step === 0) {
      zone.replaceChildren(h('p', { class: 'prompt' }, 'Marche 1 : touche les morceaux de l’énoncé qui sont UTILES pour répondre (attention, il y a un piège !).'), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'dc-check', onclick: () => {
        const good = P.useful.length === sel.size && P.useful.every((i) => sel.has(i));
        if (good) { talk('Bravo, tu as trouvé les informations utiles, et tu n’es pas tombée dans le piège !', false); next(); } else talk('Pas encore : une information ne sert à rien pour répondre, ou il en manque une.', false);
      } }, '✓ Vérifier'));
      talk('Lis le problème. Touche les informations utiles pour répondre à la question.');
    }
    if (step === 1) choose('Marche 2 : quel calcul permet de répondre ?', P.calc, 0, `Oui : ${P.calc[0]}.`);
    if (step === 2) choose('Marche 3 : avant de calculer, estime. La réponse sera environ…', P.est.map(String), 0, `Bonne estimation : environ ${P.est[0]}.`);
    if (step === 3) {
      const inp = h('input', { type: 'text', inputmode: 'numeric', class: 'dc-in', 'data-testid': 'dc-in', 'aria-label': 'Résultat' });
      zone.replaceChildren(h('p', { class: 'prompt' }, `Marche 4 : calcule ${P.calc[0]} = ? (n’oublie pas : × et : avant + et −)`), h('div', { class: 'actions' }, inp, h('span', null, P.unit), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'dc-ok', onclick: () => { if (parseInt(inp.value.replace(/\s/g, ''), 10) === P.r) { talk(`Exact : ${P.calc[0]} = ${P.r}.`, false); next(); } else { Sfx.tap(); talk('Recompte : fais d’abord la multiplication ou la division, puis le reste.', false); } } }, '✓')));
      talk('Calcule. Attention, on fait la multiplication avant l’addition et la soustraction.');
    }
    if (step === 4) choose('Marche 5 : quelle phrase répond à la question ?', P.rep, 0, 'Bravo, la réponse est complète, avec l’unité !');
    if (step === 5) { star(2); Sfx.win(); burst(body); zone.replaceChildren(h('p', { class: 'prompt' }, '🏆 Tu as gravi les 5 marches du problème !'), h('button', { class: 'btn primary', type: 'button', onclick: () => probleme(body, talk) }, '↻ Un autre problème')); talk('Bravo ! Tu as gravi les cinq marches du problème !'); }
  }
  draw(); run();
}

export function open(tab = 'construire') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['construire', '🧱 Construire', construire], ['lire', '🔍 Lire et comparer', lireComparer], ['droite', '📏 Droite graduée', droite], ['astuces', '⚡ Calculs astucieux', astuces], ['probleme', '🪜 L’escalier des problèmes', probleme]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'dc-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel' }, UI.closeButton(), h('h2', null, '🪙 Le comptoir des décimaux'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Comptoir des décimaux', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
