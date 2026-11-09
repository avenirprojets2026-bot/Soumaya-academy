// Conjugaison : l'infinitif du verbe et ses trois groupes (astuces + 4 exercices).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const pick = (a) => a[ri(0, a.length - 1)];
const N = 6;

// verbe : [infinitif, groupe, formes conjuguées]
const V = [
  ['manger', 1, ['mangent', 'mangeons', 'mange', 'mangeais']], ['jouer', 1, ['joue', 'jouons', 'jouaient', 'jouera']], ['marcher', 1, ['marche', 'marchez', 'marchait', 'marcheront']],
  ['jeter', 1, ['jette', 'jetons', 'jetait', 'jetteront']], ['danser', 1, ['dansent', 'dansons', 'dansais', 'dansera']], ['chanter', 1, ['chante', 'chantez', 'chantait', 'chanteront']],
  ['déménager', 1, ['déménage', 'déménageons', 'déménageait', 'déménagera']], ['écouter', 1, ['écoutent', 'écoutons', 'écoutais', 'écoutera']], ['regarder', 1, ['regarde', 'regardez', 'regardaient', 'regardera']],
  ['finir', 2, ['finit', 'finissons', 'finissait', 'finira']], ['choisir', 2, ['choisis', 'choisissons', 'choisissent', 'choisira']], ['bondir', 2, ['bondit', 'bondissons', 'bondissaient', 'bondira']],
  ['jaunir', 2, ['jaunit', 'jaunissons', 'jaunissent', 'jaunira']], ['bâtir', 2, ['bâtit', 'bâtissons', 'bâtissent', 'bâtira']], ['réagir', 2, ['réagit', 'réagissons', 'réagissent', 'réagira']],
  ['grandir', 2, ['grandit', 'grandissons', 'grandissent', 'grandira']], ['remplir', 2, ['remplit', 'remplissons', 'remplissent', 'remplira']],
  ['partir', 3, ['part', 'partons', 'partent', 'partira']], ['voir', 3, ['vois', 'voyons', 'voient', 'verra']], ['prendre', 3, ['prend', 'prenons', 'prennent', 'prendra']],
  ['faire', 3, ['fait', 'faisons', 'font', 'fera']], ['aller', 3, ['va', 'allons', 'vont', 'ira']], ['courir', 3, ['court', 'courons', 'courent', 'courra']],
  ['sortir', 3, ['sort', 'sortons', 'sortent', 'sortira']], ['dormir', 3, ['dort', 'dormons', 'dorment', 'dormira']], ['rire', 3, ['rit', 'rions', 'rient', 'rira']],
  ['cuire', 3, ['cuit', 'cuisons', 'cuisent', 'cuira']], ['promettre', 3, ['promet', 'promettons', 'promettent', 'promettra']], ['venir', 3, ['vient', 'venons', 'viennent', 'viendra']],
  ['quitter', 1, ['quitte', 'quittons', 'quittent', 'quittera']], ['pouvoir', 3, ['peut', 'pouvons', 'peuvent', 'pourra']], ['lire', 3, ['lit', 'lisons', 'lisent', 'lira']],
];
const GR = ['', '1er groupe', '2e groupe', '3e groupe'];
const PHR = [
  ['Il', 'déménage', 'pendant les vacances.', 'déménager'], ['Les randonneurs', 'font', 'un feu.', 'faire'], ['L’escargot ne', 'va', 'pas très vite.', 'aller'],
  ['Les pompiers', 'réagissent', 'vite à chaque sirène.', 'réagir'], ['Les navires', 'quittent', 'le port aujourd’hui.', 'quitter'], ['Soumaya', 'lit', 'un livre de meester Bart.', 'lire'],
  ['Zakaria', 'court', 'derrière le ballon.', 'courir'], ['Nous', 'choisissons', 'un dessert.', 'choisir'], ['Les feuilles', 'jaunissent', 'en automne.', 'jaunir'],
  ['Papa', 'prend', 'le train.', 'prendre'], ['Vous', 'voyez', 'la mer.', 'voir'], ['Hajar', 'chante', 'une chanson.', 'chanter'], ['Le chat', 'dort', 'sur le canapé.', 'dormir'],
  ['Les enfants', 'bâtissent', 'un château de sable.', 'bâtir'], ['Tu', 'viens', 'avec nous ?', 'venir'],
];
const TXT = [
  { t: 'À l’époque, les ordinateurs n’existaient pas. Aujourd’hui, les élèves peuvent écouter de la musique ou regarder une vidéo. Ils utilisent aussi un ordinateur pour faire des exercices.', inf: ['écouter', 'regarder', 'faire'] },
  { t: 'Le dimanche, Soumaya aime lire au lit. Ensuite, elle va jouer au parc avec Zakaria. Ils veulent courir et sauter dans les feuilles.', inf: ['lire', 'jouer', 'courir', 'sauter'] },
  { t: 'Pour faire un gâteau, il faut d’abord mélanger la farine et le sucre. Puis on doit cuire la pâte au four. Hajar adore goûter le chocolat.', inf: ['faire', 'mélanger', 'cuire', 'goûter'] },
  { t: 'Les oiseaux commencent à partir vers le sud. Ils savent voler très loin. Les écureuils préfèrent rester ici et dormir tout l’hiver.', inf: ['partir', 'voler', 'rester', 'dormir'] },
];

function serie(body, talk, title, ask, n = N) {
  let round = 0, ok = 0;
  const head = h('p', { class: 'prompt' }), host = h('div'), actions = h('div', { class: 'actions wrap' });
  body.replaceChildren(h('p', { class: 'muted' }, title), head, host, actions);
  const next = () => {
    if (round >= n) {
      if (ok === n) { star(2); burst(body); }
      head.textContent = `Bravo ! ${ok} / ${n}`; talk(head.textContent + (ok === n ? ' Score parfait !' : ''));
      host.replaceChildren(); actions.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'if-again', onclick: () => serie(body, talk, title, ask, n) }, '↻ Recommencer'));
      return;
    }
    ask({ head, host, actions, i: round, done: (good) => { if (good) { ok++; star(); Sfx.win(); } else Sfx.tap(); round++; setTimeout(next, good ? 1300 : 2600); } });
  };
  next();
}
function choix(actions, opts, right, talk, done, why) {
  actions.replaceChildren(...shuffle(opts).map((o) => h('button', { class: 'btn', type: 'button', 'data-testid': o === right ? 'if-ok' : 'if-ko', onclick: (e) => {
    actions.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    const good = o === right; e.currentTarget.classList.add(good ? 'ok' : 'ko'); if (!good) actions.querySelector('[data-testid=if-ok]').classList.add('ok');
    talk((good ? 'Oui ! ' : 'Non. ') + (why || '')); done(good);
  } }, o)));
}

function astuces(body, talk) {
  body.replaceChildren(h('div', { class: 'ag-lecon' },
    h('h3', null, '1 · L’infinitif'), h('p', null, 'L’', h('b', null, 'infinitif'), ' est le nom du verbe, quand il n’est pas conjugué : ', h('b', null, 'manger, finir, prendre'), '. C’est le mot qu’on cherche dans le dictionnaire.'),
    h('p', null, '🔎 Astuce : pour trouver l’infinitif, dis « ', h('b', null, 'il faut'), ' … » ou « ', h('b', null, 'je vais'), ' … » devant le verbe. Ils mangent → il faut ', h('b', null, 'manger'), '. Elle bondit → il faut ', h('b', null, 'bondir'), '.'),
    h('h3', null, '2 · Les trois groupes'),
    h('table', { class: 'ab-table if-gr' }, h('thead', null, h('tr', null, h('th', null, '1er groupe'), h('th', null, '2e groupe'), h('th', null, '3e groupe'))),
      h('tbody', null, h('tr', null, h('td', null, 'infinitif en -er'), h('td', null, 'infinitif en -ir', h('br'), 'et « nous …issons »'), h('td', null, 'tous les autres')),
        h('tr', null, h('td', null, 'manger, jouer, jeter'), h('td', null, 'finir → nous finissons', h('br'), 'choisir, bondir, jaunir'), h('td', null, 'prendre, voir, faire, courir, partir… et aller !')))),
    h('p', { class: 'ag-tip' }, '💡 Piège : « partir » finit en -ir mais on dit « nous partons » (pas « partissons ») → 3e groupe. Et « aller » finit en -er mais c’est un verbe du 3e groupe !')));
  talk('Voici les astuces : l’infinitif, c’est le nom du verbe. Dis il faut devant le verbe pour le trouver.');
}
// 1. Entoure l'infinitif dans la liste
function entoure(body, talk) {
  const vs = shuffle(V);
  serie(body, talk, 'Dans chaque liste, touche le verbe à l’infinitif.', ({ head, actions, host, i, done }) => {
    const [inf, , f] = vs[i]; head.textContent = `Liste ${i + 1}/${N}`; host.replaceChildren(); talk('Quel est l’infinitif ?');
    choix(actions, shuffle(f).slice(0, 3).concat(inf), inf, talk, done, `« ${inf} » est l’infinitif.`);
  });
}
// 2. Écris l'infinitif du verbe conjugué
function ecris(body, talk) {
  const ps = shuffle(PHR);
  serie(body, talk, 'Écris l’infinitif du verbe souligné. Astuce : « il faut … ».', ({ head, host, actions, i, done }) => {
    const [a, v, b, inf] = ps[i];
    head.replaceChildren(`Phrase ${i + 1}/${N} : ${a} `, h('u', { class: 'if-u' }, v), ` ${b}`); talk(`${a} ${v} ${b} Quel est l’infinitif de ${v} ?`);
    host.replaceChildren();
    const inp = h('input', { type: 'text', class: 'dc-in if-in', autocapitalize: 'off', autocomplete: 'off', 'data-testid': 'if-rep', 'aria-label': 'Infinitif' });
    const norm = (x) => x.trim().toLowerCase().replace(/’/g, '\'');
    const go = () => { if (!inp.value.trim()) return; inp.disabled = true; const good = norm(inp.value) === norm(inf); inp.classList.add(good ? 'ab-okin' : 'ab-bad'); talk(good ? `Oui : il faut ${inf}.` : `C’est « ${inf} » : il faut ${inf}.`); done(good); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    actions.replaceChildren(inp, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'if-check', onclick: go }, '✓ Vérifier'));
    setTimeout(() => inp.focus(), 50);
  });
}
// 3. Classe les verbes par groupe
function classe(body, talk) {
  const vs = shuffle(V).slice(0, 10);
  serie(body, talk, 'À quel groupe appartient ce verbe ? (Pense à « nous …issons » pour le 2e groupe.)', ({ head, host, actions, i, done }) => {
    const [inf, g, f] = vs[i]; head.textContent = `Verbe ${i + 1}/10 : ${inf}`; talk(`${inf} : quel groupe ?`);
    host.replaceChildren(h('p', { class: 'muted' }, `Aide : nous ${f[1]}`));
    choix(actions, [GR[1], GR[2], GR[3]], GR[g], talk, done, g === 2 ? `On dit « nous ${f[1]} » : 2e groupe.` : g === 1 ? 'Infinitif en -er : 1er groupe.' : inf === 'aller' ? '« Aller » est un piège : 3e groupe !' : `« ${inf} » : 3e groupe.`);
  }, 10);
}
// 4. Dans le texte, touche les infinitifs
function texte(body, talk) {
  let k = 0, ok = 0; const order = shuffle(TXT);
  const run = () => {
    if (k >= order.length) { body.replaceChildren(h('p', { class: 'prompt' }, `Bravo ! ${ok} / ${order.length} textes réussis.`), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'if-again', onclick: () => texte(body, talk) }, '↻ Recommencer')); if (ok === order.length) { star(2); burst(body); } return; }
    const T = order[k], found = new Set(); let errs = 0;
    const words = T.t.split(/(\s+)/);
    const p = h('p', { class: 'if-txt' }, ...words.map((w) => {
      if (/^\s+$/.test(w)) return w;
      const bare = w.replace(/[.,;:!?]/g, '').replace(/^[a-z]’/i, '').toLowerCase();
      return h('span', { class: 'if-w', 'data-inf': T.inf.includes(bare) ? bare : '', onclick: (e) => {
        const el = e.currentTarget; if (el.classList.contains('ok')) return;
        if (el.dataset.inf) { el.classList.add('ok'); found.add(el.dataset.inf); Sfx.tap(); if (found.size === T.inf.length) { const good = errs <= 1; if (good) { ok++; star(); Sfx.win(); } talk(good ? 'Bravo, tu as trouvé tous les infinitifs !' : `Trouvés ! Mais attention, ${errs} erreurs : ${T.inf.join(', ')}.`); k++; setTimeout(run, 2200); } }
        else { errs++; el.classList.add('ko'); setTimeout(() => el.classList.remove('ko'), 700); talk('Ce mot n’est pas un verbe à l’infinitif.', false); }
      } }, w);
    }));
    body.replaceChildren(h('p', { class: 'muted' }, `Texte ${k + 1}/${order.length} : touche les ${T.inf.length} verbes à l’infinitif.`), p);
    talk(`Touche les ${T.inf.length} verbes à l’infinitif.`);
  };
  run();
}

export function open(tab = 'astuces') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['astuces', '💡 Astuces', astuces], ['entoure', '⭕ Trouve l’infinitif', entoure], ['ecris', '✍️ Écris l’infinitif', ecris], ['classe', '🗂️ Les 3 groupes', classe], ['texte', '📖 Dans le texte', texte]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'if-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ab-panel' }, UI.closeButton(), h('h2', null, '🔤 L’infinitif et les 3 groupes'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'L’infinitif et les 3 groupes', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
