// La Cité sous l'Océan : le monde secret derrière la bibliothèque.
// Six ateliers premium : les zones de l'océan (plongée en profondeur), la chaîne alimentaire, ça flotte ou ça coule,
// sauver la cité (pollution plastique), les animaux marins et leurs adaptations, et la mer du Nord belge.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { qcm, burst, shuffle, ri } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };

const NAME = () => S.get().name || 'Soumaya';
const done = (k) => { const b = S.get(); b.ocean = b.ocean || {}; b.ocean[k] = true; S.save(); };

// ---------- 1. plongée : les zones de l'océan ----------
const ZONES = [
  { m: 0, n: 'La zone ensoleillée', d: '0 à 200 m', c1: '#4fd3ff', c2: '#0b6fb8', a: ['🐬', '🐢', '🐠', '🪸'], t: 'La lumière du soleil arrive jusqu’ici : les algues et le plancton poussent, et presque tous les animaux vivent dans cette zone.' },
  { m: 200, n: 'La zone crépusculaire', d: '200 à 1 000 m', c1: '#1f6fb0', c2: '#0a2a5c', a: ['🦑', '🐟', '🪼'], t: 'La lumière devient très faible, comme au coucher du soleil. Les plantes ne peuvent plus pousser.' },
  { m: 1000, n: 'La zone de minuit', d: '1 000 à 4 000 m', c1: '#0b2a5a', c2: '#020a1f', a: ['🐡', '✨', '🪼'], t: 'Il fait noir complet et très froid. Certains poissons fabriquent leur propre lumière : c’est la bioluminescence !' },
  { m: 4000, n: 'Les abysses', d: 'plus de 4 000 m', c1: '#03122e', c2: '#000', a: ['🦐', '🐙', '🦀'], t: 'Tout au fond, l’eau est glacée et l’eau au-dessus pèse énormément. Des animaux étranges vivent pourtant ici !' },
];
function plongee(body, talk) {
  const deep = h('div', { class: 'oc-deep' }), meter = h('div', { class: 'oc-meter' }), card = h('div', { class: 'oc-card' }), zoo = h('div', { class: 'oc-zoo' });
  deep.append(h('div', { class: 'oc-rays' }), zoo, h('div', { class: 'oc-sub' }, '🤿'), meter);
  const range = h('input', { type: 'range', min: 0, max: 5000, step: 50, value: 0, class: 'oc-range', 'aria-label': 'Profondeur de la plongée', 'data-testid': 'oc-depth' });
  let last = -1; const seen = new Set();
  const upd = () => {
    const m = +range.value, k = ZONES.filter((z) => m >= z.m).length - 1, z = ZONES[k];
    const f = Math.min(1, m / 5000);
    deep.style.setProperty('--oc1', z.c1); deep.style.setProperty('--oc2', z.c2); deep.style.setProperty('--sub', `${8 + f * 74}%`); deep.style.setProperty('--ray', String(Math.max(0, 1 - m / 600)));
    meter.textContent = `${m.toLocaleString('fr-BE')} m`;
    if (k !== last) {
      last = k; seen.add(k); Sfx.bloop();
      zoo.replaceChildren(...z.a.map((e, i) => h('span', { class: 'oc-ani' + (k >= 2 && e !== '✨' ? ' glow' : ''), style: `--i:${i};left:${12 + i * 26}%;top:${22 + ((i * 37) % 50)}%` }, e)));
      card.replaceChildren(h('b', null, `${z.n} (${z.d})`), h('p', null, z.t));
      talk(`${z.n}, ${z.d.replace('m', 'mètres')}. ${z.t}`);
      if (seen.size === ZONES.length) { star(2); Sfx.win(); burst(body); done('plongee'); setTimeout(() => talk(`Bravo ${NAME()} ! Tu as plongé jusqu’aux abysses. Le point le plus profond de l’océan dépasse 10 000 mètres !`), 4500); }
    }
  };
  range.addEventListener('input', upd);
  body.replaceChildren(h('p', { class: 'prompt' }, '🤿 Fais descendre le sous-marin et découvre les zones de l’océan.'), h('div', { class: 'oc-dive' }, deep, h('div', { class: 'oc-ctrl' }, h('span', null, '⬆ surface'), range, h('span', null, '⬇ fond'))), card);
  upd();
}

// ---------- 2. la chaîne alimentaire ----------
const CHAINS = [
  [['🌿', 'le plancton végétal'], ['🦐', 'la crevette'], ['🐟', 'le hareng'], ['🦭', 'le phoque']],
  [['🌿', 'les algues'], ['🐌', 'le bigorneau'], ['🦀', 'le crabe'], ['🐙', 'la pieuvre']],
  [['🌿', 'le plancton végétal'], ['🦐', 'le krill'], ['🐋', 'la baleine bleue']],
];
function chaine(body, talk) {
  const ch = CHAINS[ri(0, CHAINS.length - 1)]; const got = [];
  const row = h('div', { class: 'oc-chain' }), pool = h('div', { class: 'oc-pool' });
  const draw = () => {
    row.replaceChildren(...ch.flatMap((x, i) => [i ? h('span', { class: 'oc-arrow' + (got[i] ? ' on' : '') }, '➜') : '', h('div', { class: 'oc-link' + (got[i] ? ' on' : '') }, got[i] ? h('span', { class: 'oc-big' }, got[i][0]) : '?', got[i] ? h('small', null, got[i][1]) : '')]));
    pool.replaceChildren(...shuffle(ch.filter((x) => !got.includes(x))).map((x) => h('button', { class: 'oc-chip', type: 'button', 'data-testid': 'oc-chain-chip', onclick: (e) => {
      if (x === ch[got.length]) { got.push(x); Sfx.ok(); draw(); if (got.length === ch.length) { star(2); Sfx.win(); burst(body); done('chaine'); talk(`Bravo ! ${ch.map((c) => c[1]).join(', est mangé par ')}. Tout commence par les plantes, qui fabriquent leur nourriture grâce au soleil !`); body.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => chaine(body, talk) }, '↻ Une autre chaîne'))); } }
      else { const bt = e.currentTarget; bt.classList.add('ko'); Sfx.tap(); setTimeout(() => bt.classList.remove('ko'), 500); talk(got.length ? `Non : qui mange ${got[got.length - 1][1]} ?` : 'Une chaîne alimentaire commence toujours par un être vivant qui fabrique sa nourriture : une plante !', false); }
    } }, h('span', { class: 'oc-big' }, x[0]), h('small', null, x[1]))));
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '🦈 Remets la chaîne alimentaire dans l’ordre : qui est mangé par qui ?'), row, pool);
  talk('Qui est mangé par qui ? Commence par le début de la chaîne.'); draw();
}

// ---------- 3. ça flotte ou ça coule ? ----------
const OBJ = [['🍾', 'un bouchon de liège', 1], ['🔩', 'une vis en fer', 0], ['🍎', 'une pomme', 1], ['🔑', 'une clé', 0], ['🏓', 'une balle de ping-pong', 1], ['🪨', 'un caillou', 0], ['🪵', 'un morceau de bois', 1], ['🪙', 'une pièce de monnaie', 0], ['🧽', 'une éponge sèche', 1], ['⚓', 'une ancre', 0]];
function flotte(body, talk) {
  const list = shuffle(OBJ).slice(0, 6); let i = 0, ok = 0;
  const tank = h('div', { class: 'oc-tank' }, h('div', { class: 'oc-water' })), item = h('div', { class: 'oc-item' }), q = h('p', { class: 'prompt' }), btns = h('div', { class: 'actions' });
  tank.append(item);
  const next = () => {
    if (i >= list.length) { q.textContent = `${ok} / ${list.length} bonnes prédictions !`; btns.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => flotte(body, talk) }, '↻ Rejouer')); if (ok >= 4) { star(2); done('flotte'); } talk('Un objet flotte quand il est léger pour sa taille, comme le bois ou le liège. Un objet lourd pour sa taille, comme le fer ou la pierre, coule.'); return; }
    const o = list[i]; item.className = 'oc-item'; item.textContent = o[0]; q.textContent = `${o[1][0].toUpperCase() + o[1].slice(1)} : ça flotte ou ça coule ?`; talk(q.textContent);
    btns.replaceChildren(...[['🛟 Ça flotte', 1], ['⬇ Ça coule', 0]].map(([l, v]) => h('button', { class: 'btn', type: 'button', 'data-testid': 'oc-float-' + v, onclick: () => {
      btns.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      item.classList.add(o[2] ? 'float' : 'sink'); Sfx.bloop();
      const good = v === o[2]; if (good) { ok++; star(); } setTimeout(() => { good ? Sfx.win() : Sfx.tap(); talk(`${good ? 'Bravo !' : 'Eh non !'} ${o[1]} ${o[2] ? 'flotte' : 'coule'}.`, false); }, 900);
      i++; setTimeout(next, 3200);
    } }, l)));
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '🛟 Prédis : l’objet va-t-il flotter ou couler ?'), tank, q, btns); next();
}

// ---------- 4. sauver la cité : la pollution plastique ----------
const TRASH = ['🧴', '🥤', '🛍️', '🥫', '🎈', '🪣'], FISH = ['🐠', '🐟', '🐡', '🐢', '🦀', '🪼', '🐬'];
function plastique(body, talk) {
  const sea = h('div', { class: 'oc-sea' }), info = h('div', { class: 'oc-hud' });
  let caught = 0, oops = 0, left = 30, alive = true; const goal = 12;
  const spawn = () => {
    if (!alive || !sea.isConnected) return;
    const bad = Math.random() < 0.55, e = h('button', { class: 'oc-swim', type: 'button', 'data-bad': bad ? '1' : '0', style: `top:${8 + Math.random() * 78}%;animation-duration:${6 + Math.random() * 5}s` }, bad ? TRASH[ri(0, TRASH.length - 1)] : FISH[ri(0, FISH.length - 1)]);
    if (Math.random() < 0.5) e.classList.add('rtl');
    e.onclick = () => {
      if (!alive) return;
      if (bad) { caught++; Sfx.bloop(); e.classList.add('got'); setTimeout(() => e.remove(), 300); }
      else { oops++; Sfx.tap(); e.classList.add('oops'); talk('Oups ! Celui-là est un animal, laisse-le nager.', false); }
      hud();
    };
    e.addEventListener('animationend', () => e.remove()); sea.append(e);
  };
  const hud = () => info.replaceChildren(h('span', null, `♻️ ${caught} / ${goal} déchets`), h('span', null, `⏱️ ${left} s`), h('span', null, `🐟 ${oops} oups`));
  const iv = setInterval(spawn, 750), tv = setInterval(() => {
    if (!sea.isConnected) { clearInterval(iv); clearInterval(tv); return; }
    left--; hud();
    if (left <= 0 || caught >= goal) {
      alive = false; clearInterval(iv); clearInterval(tv); sea.querySelectorAll('.oc-swim').forEach((x) => x.remove());
      const win = caught >= goal; if (win) { star(3); Sfx.win(); burst(body); done('plastique'); }
      sea.append(h('div', { class: 'oc-end' }, h('b', null, win ? '🌊 La cité est sauvée !' : '⏱️ Le temps est écoulé'), h('p', null, 'Chaque année, des millions de tonnes de plastique arrivent dans la mer. Une bouteille met environ 450 ans à disparaître ! Pour aider : jeter ses déchets à la poubelle, trier et utiliser une gourde.'), h('button', { class: 'btn primary', type: 'button', onclick: () => plastique(body, talk) }, '↻ Rejouer')));
      talk(win ? `Bravo ${NAME()} ! Tu as sauvé la cité. Une bouteille en plastique met environ 450 ans à disparaître dans la mer.` : 'Le temps est écoulé ! Recommence pour sauver la cité.');
    }
  }, 1000);
  hud();
  body.replaceChildren(h('p', { class: 'prompt' }, `♻️ Ramasse ${goal} déchets en plastique en 30 secondes… mais ne touche pas les animaux !`), info, sea);
  talk('Vite ! Touche les déchets en plastique pour nettoyer la cité, mais laisse les animaux tranquilles.');
}

// ---------- 5. les animaux marins ----------
function animaux(body, talk) {
  const host = h('div'); body.replaceChildren(h('p', { class: 'prompt' }, '🐢 Les animaux marins et leurs super-pouvoirs'), host);
  qcm(host, talk, shuffle([
    { q: 'Avec quoi le poisson respire-t-il sous l’eau ?', opts: ['Avec ses branchies', 'Avec des poumons', 'Avec ses nageoires'], why: 'Les branchies prennent l’oxygène dissous dans l’eau.' },
    { q: 'Le dauphin est…', opts: ['un mammifère : il remonte respirer de l’air', 'un poisson', 'un reptile'], why: 'Le dauphin respire avec des poumons et allaite son petit, comme la baleine.' },
    { q: 'Quel est le plus grand animal du monde ?', opts: ['La baleine bleue', 'Le requin blanc', 'La pieuvre'], why: 'La baleine bleue peut dépasser 25 mètres : plus grande qu’un dinosaure !' },
    { q: 'La tortue de mer est…', opts: ['un reptile', 'un poisson', 'un mammifère'], why: 'Comme le lézard, elle a des écailles et pond des œufs… sur la plage !' },
    { q: 'À quoi sert la carapace du crabe ?', opts: ['À le protéger', 'À voler', 'À respirer'], why: 'C’est une armure qui le protège des prédateurs.' },
    { q: 'Comment la pieuvre se cache-t-elle ?', opts: ['Elle change de couleur', 'Elle creuse un terrier', 'Elle grimpe aux arbres'], why: 'Elle prend la couleur des rochers et peut aussi lancer un nuage d’encre.' },
    { q: 'Pourquoi certains poissons des grandes profondeurs brillent-ils ?', opts: ['Pour attirer leurs proies dans le noir', 'Parce qu’ils ont chaud', 'Pour bronzer'], why: 'C’est la bioluminescence : une lumière fabriquée par leur corps.' },
  ]).slice(0, 5), (n) => { if (n >= 4) done('animaux'); host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => animaux(body, talk) }, '↻ Encore'))); });
}

// ---------- 6. la mer du Nord, notre mer ----------
function merdunord(body, talk) {
  const host = h('div');
  const map = h('div', { class: 'oc-bemap' },
    h('div', { class: 'oc-sea-n' }, 'Mer du Nord'),
    h('div', { class: 'oc-coast' }, ...['La Panne', 'Oostduinkerke', 'Ostende', 'Blankenberge', 'Zeebruges', 'Knokke'].map((v, i) => h('span', { class: 'oc-town', style: `left:${4 + i * 18}%` }, '📍 ' + v))),
    h('div', { class: 'oc-land' }, '🇧🇪 Belgique — 67 km de côte'));
  body.replaceChildren(h('p', { class: 'prompt' }, '🇧🇪 La mer du Nord, la mer de la Belgique'), map, host);
  talk('La Belgique a 67 kilomètres de côte, au bord de la mer du Nord, de La Panne à Knokke.');
  setTimeout(() => qcm(host, talk, shuffle([
    { q: 'Au bord de quelle mer se trouve la côte belge ?', opts: ['La mer du Nord', 'La mer Méditerranée', 'La mer Rouge'], why: 'La côte belge borde la mer du Nord.' },
    { q: 'Combien de fois par jour la mer monte-t-elle (marée haute) ?', opts: ['Environ 2 fois', '1 fois par semaine', '10 fois'], why: 'Il y a environ deux marées hautes et deux marées basses chaque jour, à cause de la Lune.' },
    { q: 'À Oostduinkerke, comment pêche-t-on les crevettes grises de façon traditionnelle ?', opts: ['À cheval, dans les vagues', 'En hélicoptère', 'Avec une canne à pêche'], why: 'La pêche aux crevettes à cheval est inscrite au patrimoine de l’UNESCO !' },
    { q: 'Quel grand port belge se trouve sur la côte ?', opts: ['Zeebruges', 'Namur', 'Liège'], why: 'Zeebruges et Ostende sont des ports de la côte belge.' },
    { q: 'Quel mammifère marin peut-on parfois voir sur les plages belges ?', opts: ['Le phoque', 'L’ours polaire', 'Le pingouin'], why: 'Des phoques se reposent parfois sur les plages, il faut les laisser tranquilles et garder ses distances.' },
  ]).slice(0, 4), (n) => { if (n >= 3) done('merdunord'); host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => merdunord(body, talk) }, '↻ Encore'))); }), 3500);
}

export function open(tab = 'plongee') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div', { class: 'oc-body' });
  const T = [['plongee', '🤿 La grande plongée', plongee], ['chaine', '🦈 La chaîne alimentaire', chaine], ['flotte', '🛟 Ça flotte ou ça coule ?', flotte], ['plastique', '♻️ Sauver la cité', plastique], ['animaux', '🐢 Les animaux marins', animaux], ['merdunord', '🇧🇪 La mer du Nord', merdunord]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'oc-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel oc-panel' }, UI.closeButton(), h('h2', null, '🌊 La Cité sous l’Océan'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Cité sous l’Océan', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(T.some((x) => x[0] === tab) ? tab : 'plongee');
}
