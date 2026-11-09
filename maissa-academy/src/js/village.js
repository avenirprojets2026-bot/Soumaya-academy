// Le Village des Petits Citoyens : la monnaie au marché, l'horloge et les horaires, peindre la maison (aires,
// évaluation P4 doc 11), le Conseil des sages (citoyenneté, doc 4) et la fête du village (budget, proportionnalité).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri, qcm } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const pick = (a) => a[ri(0, a.length - 1)];
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };
const eur = (c) => { const e = Math.floor(c / 100), r = c % 100; return r ? `${e},${String(r).padStart(2, '0')} €` : `${e} €`; };
const uniqOpts = (right, xs) => [right, ...[...new Set(xs.filter((x) => x !== right))]].slice(0, 3);

// ---------- 1. le marché : la monnaie ----------
const ITEMS = [['🥖', 'une baguette', 240], ['🥐', 'un croissant', 120], ['🍎', 'un kilo de pommes', 315], ['🧀', 'un morceau de fromage', 480], ['🥚', 'six œufs', 275], ['🍓', 'une barquette de fraises', 390], ['🥛', 'une bouteille de lait', 135], ['🍫', 'une tablette de chocolat', 210]];
const MONEY = [[2000, '20 €', 'note'], [1000, '10 €', 'note'], [500, '5 €', 'note'], [200, '2 €', 'coin'], [100, '1 €', 'coin'], [50, '50 c', 'coin'], [20, '20 c', 'coin'], [10, '10 c', 'coin'], [5, '5 c', 'coin'], [2, '2 c', 'coin'], [1, '1 c', 'coin']];
function marche(body, talk) {
  let round = 0, ok = 0; const N = 4;
  const head = h('p', { class: 'prompt' }), zone = h('div');
  body.replaceChildren(h('div', { class: 'vl-stall' }, ...ITEMS.map(([ic, n, p]) => h('div', { class: 'vl-item' }, h('span', null, ic), h('small', null, n), h('b', null, eur(p))))), head, zone);
  function setup() {
    if (round >= N) { head.textContent = `Bravo ! ${ok} achats réussis sur ${N}.`; talk(head.textContent); zone.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => marche(body, talk) }, '↻ Recommencer')); if (ok >= 3) { Sfx.win(); burst(body); } return; }
    const basket = shuffle(ITEMS).slice(0, round < 2 ? 1 : 2), tot = basket.reduce((a, b) => a + b[2], 0);
    if (round % 2 === 0) { // payer exactement
      let paid = [];
      const sum = () => paid.reduce((a, b) => a + b, 0);
      const purse = h('div', { class: 'vl-purse' }), shown = h('div', { class: 'ws-big' });
      const draw = () => { purse.replaceChildren(...paid.map((v, i) => { const m = MONEY.find((x) => x[0] === v); return h('button', { class: 'vl-money ' + m[2], type: 'button', onclick: () => { paid.splice(i, 1); draw(); } }, m[1]); })); shown.textContent = `Tu donnes : ${eur(sum())}`; };
      head.textContent = `Achat ${round + 1}/${N} : ${basket.map((b) => b[0] + ' ' + b[1]).join(' et ')}. Ça coûte ${eur(tot)}. Donne la somme EXACTE.`;
      talk(`Tu achètes ${basket.map((b) => b[1]).join(' et ')}. Ça coûte ${eur(tot).replace(',', ' euros ').replace(' €', '')}. Donne la somme exacte.`);
      zone.replaceChildren(h('div', { class: 'vl-wallet' }, ...MONEY.filter((m) => m[0] <= 1000).map(([v, l, k]) => h('button', { class: 'vl-money ' + k, type: 'button', 'data-testid': 'vl-money', onclick: () => { paid.push(v); Sfx.coin(); draw(); } }, l))), shown, purse,
        h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'vl-pay', onclick: () => {
          if (sum() === tot) { ok++; star(); Sfx.win(); talk('Parfait, le compte est juste !', false); round++; setTimeout(setup, 1800); }
          else talk(sum() < tot ? `Il manque encore ${eur(tot - sum())}.` : `C’est trop : tu donnes ${eur(sum() - tot)} de plus. Touche une pièce pour la reprendre.`, false);
        } }, '✓ Payer')));
      draw();
    } else { // rendre la monnaie
      const note = tot <= 500 ? 500 : tot <= 1000 ? 1000 : 2000, rendu = note - tot;
      head.textContent = `Achat ${round + 1}/${N} : ${basket.map((b) => b[0] + ' ' + b[1]).join(' et ')} pour ${eur(tot)}. Tu paies avec un billet de ${eur(note)}.`;
      zone.replaceChildren();
      qcm(zone, talk, [{ q: 'Combien le marchand doit-il te rendre ?', opts: uniqOpts(eur(rendu), [eur(rendu + 100), eur(Math.max(5, rendu - 10)), eur(rendu + 10)]), why: `${eur(note)} − ${eur(tot)} = ${eur(rendu)}. Astuce : on complète de ${eur(tot)} jusqu’à ${eur(note)}.` }], (o) => { ok += o; round++; setTimeout(setup, 600); });
    }
  }
  setup();
}

// ---------- 2. l'horloge et les horaires ----------
function clock(hh, mm) {
  const s = sv('svg', { viewBox: '-60 -60 120 120', class: 'vl-clock' });
  s.append(sv('circle', { r: 56, fill: '#fff8e6', stroke: '#7a5a2a', 'stroke-width': 4 }));
  for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; s.append(sv('text', { x: Math.sin(a) * 44, y: -Math.cos(a) * 44 + 5, style: 'text-anchor:middle;font-size:12px;font-weight:800;fill:#2b2440' }, String(i))); }
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, r1 = i % 5 ? 52 : 49; s.append(sv('line', { x1: Math.sin(a) * r1, y1: -Math.cos(a) * r1, x2: Math.sin(a) * 55, y2: -Math.cos(a) * 55, stroke: '#7a5a2a', 'stroke-width': i % 5 ? 1 : 2 })); }
  const ah = ((hh % 12) + mm / 60) / 12 * Math.PI * 2, am = mm / 60 * Math.PI * 2;
  s.append(sv('line', { x1: 0, y1: 0, x2: Math.sin(ah) * 28, y2: -Math.cos(ah) * 28, stroke: '#2b2440', 'stroke-width': 5, 'stroke-linecap': 'round' }), sv('line', { x1: 0, y1: 0, x2: Math.sin(am) * 44, y2: -Math.cos(am) * 44, stroke: '#3a7ad8', 'stroke-width': 3, 'stroke-linecap': 'round' }), sv('circle', { r: 4, fill: '#2b2440' }));
  return s;
}
const hm = (t) => `${Math.floor(t / 60) % 24} h ${String(t % 60).padStart(2, '0')}`;
function horloge(body, talk) {
  const qs = [];
  for (let i = 0; i < 3; i++) { const hh = ri(1, 12), mm = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]); const t = hh * 60 + mm; qs.push({ pic: () => clock(hh, mm), q: 'Quelle heure indique l’horloge du beffroi (le matin) ?', opts: uniqOpts(hm(t), [hm((mm / 5) * 60 + hh * 5 % 60), hm(t + 60), hm(t - 5 > 0 ? t - 5 : t + 5)]), why: `La petite aiguille (les heures) est vers ${hh}, la grande (les minutes) montre ${mm} minutes : ${hm(t)}.` }); }
  const dep = ri(7, 16) * 60 + pick([0, 15, 30, 45, 10, 20]), dur = pick([25, 35, 40, 50, 75, 90]);
  qs.push({ q: `Le bus part à ${hm(dep)}. Le trajet dure ${dur} minutes. À quelle heure arrive-t-il ?`, opts: uniqOpts(hm(dep + dur), [hm(dep + dur + 10), hm(dep + dur - 60 > 0 ? dep + dur - 60 : dep + 30), hm(dep + 100)]), why: `${hm(dep)} + ${dur} min = ${hm(dep + dur)}.` });
  const a = ri(8, 10) * 60 + pick([0, 30, 15]), b = a + pick([45, 90, 105, 120, 150]);
  qs.push({ q: `L’école commence à ${hm(a)} et la récré sonne à ${hm(b)}. Combien de temps s’est-il écoulé ?`, opts: uniqOpts(`${Math.floor((b - a) / 60) ? Math.floor((b - a) / 60) + ' h ' : ''}${(b - a) % 60 ? (b - a) % 60 + ' min' : ''}`.trim(), ['1 h 15 min', '2 h', '45 min', '1 h 30 min']), why: `De ${hm(a)} à ${hm(b)} : ${b - a} minutes.` });
  qs.push(pick([{ q: 'Combien de minutes y a-t-il dans 1 h 15 ?', opts: ['75', '115', '65'], why: '1 h = 60 min, + 15 = 75 min.' }, { q: 'Combien de secondes dans une minute ?', opts: ['60', '100', '30'], why: '1 min = 60 s.' }, { q: 'Un quart d’heure, c’est…', opts: ['15 minutes', '25 minutes', '4 minutes'], why: '60 : 4 = 15 minutes.' }]));
  const host = h('div'); body.replaceChildren(host);
  qcm(host, talk, qs, () => host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => horloge(body, talk) }, '↻ Encore'))));
}

// ---------- 3. peindre la maison : les aires ----------
function peinture(body, talk) {
  const dims = shuffle([[3, 4], [4, 5], [5, 6], [2, 6], [3, 5], [4, 4]]).slice(0, 3), rooms = ['🛏️ la chambre', '🍳 la cuisine', '🛋️ le salon'];
  const R = dims.map((d, i) => ({ n: rooms[i], w: d[0], h: d[1], a: d[0] * d[1] }));
  if (new Set(R.map((r) => r.a)).size < 3) return peinture(body, talk);
  const pots = shuffle(R.map((r) => r.a)); let sel = null, done = 0;
  const U = 22, plan = sv('svg', { viewBox: `0 0 ${(R.reduce((a, r) => a + r.w, 0) + 4) * U} ${(Math.max(...R.map((r) => r.h)) + 2) * U}`, class: 'vl-plan' });
  let x = 1;
  R.forEach((r) => {
    const g = sv('g', { class: 'vl-room', 'data-testid': 'vl-room' });
    for (let i = 0; i <= r.w; i++) g.append(sv('line', { x1: (x + i) * U, y1: U, x2: (x + i) * U, y2: (1 + r.h) * U, class: 'vl-grid' }));
    for (let j = 0; j <= r.h; j++) g.append(sv('line', { x1: x * U, y1: (1 + j) * U, x2: (x + r.w) * U, y2: (1 + j) * U, class: 'vl-grid' }));
    const rect = sv('rect', { x: x * U, y: U, width: r.w * U, height: r.h * U, class: 'vl-wall' });
    g.prepend(rect); g.append(sv('text', { x: (x + r.w / 2) * U, y: U - 6, style: 'text-anchor:middle', class: 'vl-lab' }, r.n.slice(3)), sv('text', { x: (x + r.w / 2) * U, y: (1 + r.h) * U + 16, style: 'text-anchor:middle', class: 'vl-dim' }, `${r.w} m × ${r.h} m`));
    g.addEventListener('click', () => {
      if (!sel || g.dataset.done) { talk('Choisis d’abord un pot de peinture.', false); return; }
      if (+sel.dataset.a === r.a) { g.dataset.done = 1; rect.style.fill = sel.dataset.c; sel.remove(); sel = null; done++; star(); Sfx.bloop(); talk(`Oui ! ${r.n.slice(3)} : ${r.w} × ${r.h} = ${r.a} m².`, false); if (done === 3) { Sfx.win(); burst(body); talk('Bravo ! Chaque pièce a reçu le bon pot de peinture.'); } }
      else { Sfx.tap(); talk(`Non : ${r.n.slice(3)} mesure ${r.w} m sur ${r.h} m. Calcule son aire : longueur × largeur.`, false); }
    });
    plan.append(g); x += r.w + 1;
  });
  const colors = ['#ff9ab8', '#9ad8ff', '#b8f09a'];
  const potEls = pots.map((a, i) => h('button', { class: 'vl-pot', type: 'button', 'data-a': a, 'data-c': colors[i], 'data-testid': 'vl-pot', style: `--c:${colors[i]}`, onclick: (e) => { potEls.forEach((p) => p.classList.remove('on')); sel = e.currentTarget; sel.classList.add('on'); Sfx.tap(); } }, h('span', null, '🪣'), `couvre ${a} m²`));
  body.replaceChildren(h('p', { class: 'prompt' }, 'Chaque pot de peinture couvre une surface précise. Calcule l’aire de chaque pièce, puis donne-lui le bon pot. (Choisis un pot, puis touche la pièce.)'), h('div', { class: 'dr-wrap' }, plan), h('div', { class: 'vl-pots' }, ...potEls), h('p', { class: 'muted ws-memo' }, 'Aire d’un rectangle = longueur × largeur. Chaque carreau = 1 m².'), h('button', { class: 'btn small', type: 'button', onclick: () => peinture(body, talk) }, '↻ Une autre maison'));
  talk('Calcule l’aire de chaque pièce et donne-lui le bon pot de peinture.');
}

// ---------- 4. le Conseil des sages ----------
const REGLES = [['Ne pas courir dans les couloirs de l’école.', 'vie'], ['Lever la main avant de parler en classe.', 'vie'], ['Ranger son matériel après le bricolage.', 'vie'], ['Les enfants doivent aller à l’école jusqu’à 18 ans.', 'loi'], ['On roule à droite sur la route.', 'loi'], ['Il est interdit de voler.', 'loi'], ['Dire bonjour en arrivant au club de sport.', 'vie'], ['À vélo, on s’arrête au feu rouge.', 'loi']];
function conseil(body, talk) {
  const tabs = h('div', { class: 'actions wrap' }), zone = h('div');
  body.replaceChildren(tabs, zone);
  const go = (k) => { [...tabs.children].forEach((b) => b.classList.toggle('primary', b.dataset.k === k)); ({ regles, vote, vivre })[k](); };
  tabs.append(...[['regles', '📜 Règle de vie ou loi ?'], ['vote', '🗳️ Le vote'], ['vivre', '🤝 Vivre ensemble']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-k': k, 'data-testid': 'vl-c-' + k, onclick: () => go(k) }, l)));
  function regles() {
    const pool = shuffle(REGLES).slice(0, 6); let i = 0, ok = 0;
    const card = h('div', { class: 'vi-card' });
    const bins = [['vie', '🏫 Règle de vie (pour un groupe, une école, un club)'], ['loi', '⚖️ Loi (pour tout le pays, votée par le Parlement)']].map(([k, l]) => h('button', { class: 'th-bin', type: 'button', 'data-testid': 'vl-bin', onclick: () => { const r = pool[i]; if (!r) return; if (r[1] === k) { ok++; star(); Sfx.coin(); talk('Oui !', false); } else { Sfx.tap(); talk(r[1] === 'loi' ? 'Non, c’est une loi : elle vaut pour tout le monde dans le pays, et celui qui ne la respecte pas peut être puni par la justice.' : 'Non, c’est une règle de vie : elle vaut pour un groupe, comme ta classe ou ton club.', false); } i++; setTimeout(show, 1800); } }, l));
    const show = () => { if (i >= pool.length) { card.replaceChildren(h('b', null, `${ok}/${pool.length} bien classées !`)); if (ok >= 5) { Sfx.win(); burst(body); } return; } card.replaceChildren(h('b', null, pool[i][0])); };
    zone.replaceChildren(h('p', { class: 'prompt' }, 'Au Conseil des sages : est-ce une règle de vie ou une loi ?'), card, h('div', { class: 'th-bins' }, ...bins));
    talk('Est-ce une règle de vie ou une loi ?'); show();
  }
  function vote() {
    const opts = shuffle([['🏞️ Une sortie au parc', ri(5, 9)], ['🎳 Un bowling', ri(3, 8)], ['🎬 Un film en classe', ri(2, 7)]]);
    if (new Set(opts.map((o) => o[1])).size < 3) return vote();
    const win = opts.reduce((a, b) => (b[1] > a[1] ? b : a)), tot = opts.reduce((a, b) => a + b[1], 0);
    const host = h('div');
    zone.replaceChildren(h('p', { class: 'prompt' }, 'La classe vote pour choisir l’activité de fin d’année. Voici le dépouillement :'), h('table', { class: 'da-table big' }, h('tr', null, h('th', null, 'Activité'), h('th', null, 'Voix')), ...opts.map(([n, v]) => h('tr', null, h('td', null, n), h('td', null, '✋'.repeat(v) + ` ${v}`)))), host);
    qcm(host, talk, [
      { q: 'Quelle activité a gagné le vote ?', opts: [win[0], ...opts.filter((o) => o !== win).map((o) => o[0])], why: `Elle a le plus de voix : ${win[1]}. C’est la majorité qui décide.` },
      { q: 'Combien d’élèves ont voté ?', opts: uniqOpts(String(tot), [String(tot + 2), String(win[1]), String(tot - 1)]), why: `${opts.map((o) => o[1]).join(' + ')} = ${tot}.` },
      { q: 'Pourquoi voter est-il une pratique démocratique ?', opts: ['Chacun donne son avis et la majorité décide', 'Le plus fort décide', 'Le professeur décide tout seul'], why: 'En démocratie, chaque voix compte de la même façon.' },
      { q: 'À l’école, qui décide des règles de la classe ?', opts: ['L’enseignant avec les élèves, souvent ensemble', 'Le boulanger du village', 'Personne'], why: 'Les règles de classe sont souvent construites ensemble, avec l’enseignant.' },
    ], () => {});
  }
  function vivre() {
    const host = h('div'); zone.replaceChildren(host);
    qcm(host, talk, shuffle([
      { q: 'Théo serre les poings, il devient tout rouge et il crie. Quelle émotion ressent-il ?', opts: ['la colère', 'la joie', 'la surprise'], why: 'Poings serrés, visage rouge, cris : ce sont des signes de colère.' },
      { q: 'Un élève veut faire mal à un autre dans la cour. Que fais-tu ?', opts: ['Je dis stop et je vais chercher un adulte', 'Je regarde sans rien dire', 'Je l’encourage'], why: 'On protège la personne et on prévient un adulte : tout le monde se sent plus en sécurité.' },
      { q: 'Lina n’arrive pas à porter tous ses livres. Quelle action d’entraide peux-tu faire ?', opts: ['Je l’aide à en porter une partie', 'Je me moque d’elle', 'Je passe devant elle'], why: 'L’entraide rend la vie plus agréable pour tout le monde.' },
      { q: 'Quel est un avantage de l’entraide dans un exposé de groupe ?', opts: ['Chacun apporte ses idées et on va plus loin ensemble', 'On travaille moins bien', 'Une seule personne fait tout'], why: 'Ensemble, on apprend les uns des autres.' },
      { q: 'Tu n’es pas d’accord avec l’avis de ton ami. Que fais-tu ?', opts: ['Je l’écoute, puis j’explique mon avis avec un argument', 'Je crie plus fort que lui', 'Je ne lui parle plus'], why: 'On peut ne pas être d’accord et en discuter calmement, avec des arguments.' },
    ]).slice(0, 4), () => host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: vivre }, '↻ Encore'))));
  }
  go('regles');
}

// ---------- 5. la fête du village : budget et proportionnalité ----------
const SHOP = [['🎈', 'paquet de ballons', 350], ['🧃', 'jus de fruits', 220], ['🍪', 'biscuits', 275], ['🎉', 'guirlande', 480], ['🍕', 'pizza', 650], ['🥤', 'limonade', 190], ['🎂', 'gâteau', 1250], ['🍬', 'bonbons', 300]];
function fete(body, talk) {
  const tabs = h('div', { class: 'actions wrap' }), zone = h('div');
  body.replaceChildren(tabs, zone);
  const go = (k) => { [...tabs.children].forEach((b) => b.classList.toggle('primary', b.dataset.k === k)); (k === 'budget' ? budget : recette)(); };
  tabs.append(...[['budget', '💶 Le budget'], ['recette', '🧁 La recette']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-k': k, 'data-testid': 'vl-f-' + k, onclick: () => go(k) }, l)));
  function budget() {
    const B = pick([2000, 2500, 3000]); const cart = new Set();
    const tot = () => [...cart].reduce((a, i) => a + SHOP[i][2], 0);
    const info = h('div', { class: 'ws-big' });
    const items = SHOP.map(([ic, n, p], i) => h('button', { class: 'vl-shop', type: 'button', 'data-testid': 'vl-shop', onclick: (e) => { cart.has(i) ? cart.delete(i) : cart.add(i); e.currentTarget.classList.toggle('on', cart.has(i)); Sfx.tap(); upd(); } }, h('span', null, ic), h('small', null, n), h('b', null, eur(p))));
    const upd = () => { const t = tot(); info.textContent = `Panier : ${eur(t)} / budget ${eur(B)}`; info.classList.toggle('over', t > B); };
    zone.replaceChildren(h('p', { class: 'prompt' }, `Tu as ${eur(B)} pour la fête. Choisis au moins 4 choses, sans dépasser le budget !`), h('div', { class: 'vl-stall' }, ...items), info, h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'vl-check', onclick: () => {
      const t = tot();
      if (cart.size < 4) talk('Il faut au moins 4 choses pour la fête !', false);
      else if (t > B) talk(`Tu dépasses le budget de ${eur(t - B)}. Retire quelque chose.`, false);
      else { star(2); Sfx.win(); burst(body); talk(`Super fête ! Tu as dépensé ${eur(t)} et il te reste ${eur(B - t)}.`); }
    } }, '✓ Valider mes achats')));
    upd(); talk(`Tu as ${eur(B).replace(' €', ' euros')} pour organiser la fête. Ne dépasse pas le budget !`);
  }
  function recette() {
    const base = { farine: 200, sucre: 100, oeufs: 2, lait: 250 }, k = pick([2, 3]), from = 4, to = from * k;
    const host = h('div');
    zone.replaceChildren(h('div', { class: 'vi-doc' }, h('h3', null, `🧁 Crêpes pour ${from} personnes`), h('p', null, `${base.farine} g de farine · ${base.sucre} g de sucre · ${base.oeufs} œufs · ${base.lait} mL de lait`)), host);
    qcm(host, talk, [
      { q: `Pour ${to} personnes, combien faut-il de farine ?`, opts: uniqOpts(`${base.farine * k} g`, [`${base.farine + to} g`, `${base.farine * k + 100} g`, `${base.farine} g`]), why: `${to} personnes, c’est ${k} fois plus que ${from} : ${base.farine} × ${k} = ${base.farine * k} g.` },
      { q: `Pour ${to} personnes, combien d’œufs ?`, opts: uniqOpts(String(base.oeufs * k), [String(base.oeufs + k), String(base.oeufs + to), String(base.oeufs)]), why: `${base.oeufs} × ${k} = ${base.oeufs * k} œufs.` },
      { q: 'Pour 2 personnes seulement, combien de lait ?', opts: uniqOpts(`${base.lait / 2} mL`, [`${base.lait - 2} mL`, `${base.lait * 2} mL`, `${base.lait} mL`]), why: `2 personnes, c’est la moitié de 4 : ${base.lait} : 2 = ${base.lait / 2} mL.` },
    ], () => host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: recette }, '↻ Une autre recette'))));
  }
  go('budget');
}

export function open(tab = 'marche') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['marche', '🧺 Le marché', marche], ['horloge', '🕰️ L’horloge et les horaires', horloge], ['peinture', '🖌️ Peindre la maison', peinture], ['conseil', '🏛️ Le Conseil des sages', conseil], ['fete', '🎉 La fête du village', fete]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'vl-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel vl-panel' }, UI.closeButton(), h('h2', null, '🏘️ Le Village des Petits Citoyens'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Village', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
