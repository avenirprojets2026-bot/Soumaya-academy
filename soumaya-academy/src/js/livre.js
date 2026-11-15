// Le Livre-Monde (nov. 2026) : trois découvertes scientifiques récentes, racontées comme une aventure.
// 1. Les satellites GRACE-FO mesurent l'eau stockée sur Terre (NASA Earth Observatory, 20 oct. 2026)
// 2. La Semaine mondiale de l'éducation aux médias et à l'information (UNESCO, 24-31 oct. 2026)
// 3. Le grand retour des mangroves (NASA, 13 nov. 2026)
// Reprise possible : l'étape et les chapitres réussis sont gardés dans S.get().livre.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import * as Mimi from './mimi.js';
import { asset } from './asset.js';
import { qcm, burst } from './workshop.js';
import { checkBadges } from './rewards.js';

const bg = (n) => asset(`assets/scenes/${n}.webp`);
const st = () => { const b = S.get(); if (!b.livre) b.livre = { stage: 'intro', done: {} }; return b.livre; };
const bonus = (n) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };

const CH = [
  { id: 1, ic: '🛰️', t: 'L’eau vue du ciel', date: '20 octobre 2026', src: 'NASA Earth Observatory', bg: 'observatoire' },
  { id: 2, ic: '🔎', t: 'Chercher, comprendre, vérifier', date: '24-31 octobre 2026', src: 'UNESCO', bg: 'archives' },
  { id: 3, ic: '🌿', t: 'Le retour des mangroves', date: '13 novembre 2026', src: 'NASA', bg: 'foret_vivante' },
];

export function open() {
  const L = st();
  const scene = h('div', { class: 'lv-scene' });
  const say = h('p', { class: 'lv-say', 'aria-live': 'polite' });
  const body = h('div', { class: 'lv-body' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const setBg = (n) => { scene.style.backgroundImage = `url(${bg(n)})`; };
  const cat = h('img', { class: 'lv-cat', src: Mimi.spriteUrl('assis'), alt: 'Muezza', draggable: 'false' });
  const nav = h('div', { class: 'lv-nav' });
  const panel = h('div', { class: 'panel be-panel ws-panel lv-panel' }, UI.closeButton(), h('h2', null, '📖 Le Livre-Monde'),
    h('div', { class: 'lv-stage' }, scene, cat), say, body, nav);
  UI.openDialog(panel, { label: 'Le Livre-Monde', onClose: () => Voice.stop() });

  const btn = (txt, fn, cls = 'btn primary') => h('button', { class: cls, type: 'button', onclick: fn }, txt);
  const go = (stage) => { L.stage = stage; S.save(); render(); };
  const menu = () => nav.replaceChildren(btn('🏰 Retour au château', () => UI.closeDialog(), 'btn ghost'));
  const sources = (c) => h('small', { class: 'lv-src' }, `📅 ${c.date} · Source : ${c.src}`);

  function render() {
    Voice.stop(); menu();
    const s = L.stage;
    if (s === 'intro') return intro();
    if (s === 'final') return final();
    if (s === 'map') return map();
    return chapter(Number(s.slice(2)));
  }

  function intro() {
    setBg('archives'); cat.className = 'lv-cat';
    talk('Un vieux livre s’ouvre tout seul aux Archives du Temps. Ses pages brillent : trois découvertes de 2026 t’attendent !');
    body.replaceChildren(btn('📖 Ouvrir le Livre-Monde', () => { Sfx.chime(); go('map'); }));
  }

  function map() {
    setBg('archives');
    const n = Object.keys(L.done).length;
    talk(n ? `Tu as déjà trouvé ${n} page${n > 1 ? 's' : ''} sur 3. Choisis la suite !` : 'Choisis une page du livre pour commencer.', n === 0);
    body.replaceChildren(h('div', { class: 'lv-pages' }, ...CH.map((c) => h('button', { class: 'lv-page' + (L.done[c.id] ? ' done' : ''), type: 'button', onclick: () => go('ch' + c.id) },
      h('span', { class: 'lv-pic' }, L.done[c.id] ? '⭐' : c.ic), h('b', null, c.t), h('small', null, c.date)))),
    n === 3 ? btn('🚪 Ouvrir le portail final', () => go('final')) : null);
  }

  function finish(c) {
    if (!L.done[c.id]) { L.done[c.id] = true; bonus(2); S.save(); }
    burst(body); Sfx.levelup();
    body.append(btn(Object.keys(L.done).length === 3 ? '🚪 Le portail final' : '📖 Retour au livre', () => go(Object.keys(L.done).length === 3 ? 'final' : 'map')));
  }

  function chapter(i) {
    const c = CH[i - 1]; setBg(c.bg); cat.className = 'lv-cat';
    ({ 1: ch1, 2: ch2, 3: ch3 })[i](c);
  }

  // ---- 1. GRACE-FO ----
  function ch1(c) {
    talk('Deux satellites jumeaux, GRACE-FO, volent l’un derrière l’autre autour de la Terre. Quand ils passent au-dessus de beaucoup d’eau, la gravité tire un tout petit peu plus fort. Appuie sur « Mesurer » !');
    const globe = h('div', { class: 'lv-globe', style: `background-image:url(${bg('globe_map')})` });
    const sat = h('div', { class: 'lv-orbit' }, h('span', { class: 'lv-sat s1' }, '🛰️'), h('span', { class: 'lv-sat s2' }, '🛰️'));
    const gauge = h('div', { class: 'lv-gauge' }, h('i'));
    const out = h('p', { class: 'lv-note' }, 'Observation réelle : ce sont des mesures faites par des satellites, pas un dessin d’imagination.');
    const pas = [['💧 Plus d’eau stockée', 82, 'Là, l’eau a augmenté : sols, rivières ou nappes plus pleins.'], ['🏜️ Moins d’eau stockée', 28, 'Là, l’eau a baissé : sols et nappes plus vides.']];
    let k = 0;
    const mes = btn('📡 Mesurer', () => {
      const [t, v, d] = pas[k++ % 2]; gauge.firstChild.style.width = v + '%'; Sfx.water(); talk(`${t}. ${d}`);
    });
    body.replaceChildren(h('div', { class: 'lv-sky' }, globe, sat), gauge, mes, out, sources(c), h('div', { class: 'lv-q' }));
    const q = body.querySelector('.lv-q');
    setTimeout(() => qcm(q, talk, [
      { q: 'Que mesurent les satellites GRACE-FO ?', opts: ['Les changements d’eau stockée sur Terre', 'La couleur des nuages', 'Le bruit des vagues'], why: 'Ils suivent l’eau des sols, des nappes et des glaces.' },
      { q: 'Combien de satellites volent ensemble ?', opts: ['Deux, l’un derrière l’autre', 'Un seul', 'Cent'], why: 'Ce sont des jumeaux : leur distance change avec la gravité.' },
      { q: 'Une mesure de satellite est…', opts: ['Une observation', 'Une histoire inventée', 'Une simulation de jeu'], why: 'Observer, c’est mesurer le monde réel.' },
    ], (ok) => { if (ok >= 2) finish(c); else body.append(btn('↻ Réessayer', () => ch1(c))); }), 2500);
  }

  // ---- 2. Éducation aux médias ----
  function ch2(c) {
    talk('Du 24 au 31 octobre 2026, l’UNESCO a organisé la Semaine mondiale de l’éducation aux médias et à l’information : chercher, comprendre et vérifier avant de croire.');
    const steps = [['🔎 Chercher', 'Je trouve plusieurs sources.'], ['🧠 Comprendre', 'Je lis jusqu’au bout et je me demande qui parle.'], ['✅ Vérifier', 'Je compare avec une source sérieuse et je regarde la date.']];
    const row = h('div', { class: 'lv-steps' }, ...steps.map(([t, d]) => h('div', { class: 'lv-step' }, h('b', null, t), h('small', null, d))));
    const q = h('div', { class: 'lv-q' });
    body.replaceChildren(row, sources(c), q);
    setTimeout(() => qcm(q, talk, [
      { q: 'Tu vois une info surprenante sur un écran. Que fais-tu d’abord ?', opts: ['Je cherche qui l’a écrite et quand', 'Je la partage tout de suite', 'Je la crois car elle est jolie'], why: 'Qui, quand, avec quelle preuve : trois bons réflexes.' },
      { q: 'Quelle source est la plus fiable pour une découverte scientifique ?', opts: ['Le site de l’agence qui a fait la recherche', 'Une vidéo sans auteur', 'Un message d’un inconnu'], why: 'Une source qui explique d’où viennent ses mesures est plus sûre.' },
      { q: 'Deux sites disent le contraire. Tu…', opts: ['Compare avec une troisième source sérieuse', 'Choisis le plus rigolo', 'Arrêtes de chercher'], why: 'Comparer plusieurs sources, c’est vérifier.' },
    ], (ok) => { if (ok >= 2) finish(c); else body.append(btn('↻ Réessayer', () => ch2(c))); }), 1800);
  }

  // ---- 3. Mangroves ----
  function ch3(c) {
    talk('Sur la côte du Myanmar, des satellites de la NASA ont comparé 2010 et 2026. Bonne nouvelle : par endroits, les mangroves repoussent. Ailleurs, elles reculent encore. Glisse pour comparer !');
    const sl = h('input', { type: 'range', min: 0, max: 100, value: 50, 'aria-label': 'Comparer 2010 et 2026', class: 'lv-range' });
    const A = h('div', { class: 'lv-mg a' }, h('span', null, '2010'));
    const B = h('div', { class: 'lv-mg b' }, h('span', null, '2026'));
    const upd = () => { B.style.clipPath = `inset(0 0 0 ${sl.value}%)`; };
    sl.addEventListener('input', upd); upd();
    const q = h('div', { class: 'lv-q' });
    body.replaceChildren(h('div', { class: 'lv-cmp' }, A, B), sl,
      h('p', { class: 'lv-note' }, 'Attention : ce dessin est une simulation pour comprendre, pas une photo de satellite. Les vraies images sont sur le site de la NASA.'),
      h('div', { class: 'lv-legend' }, h('span', null, '🌱 repousse par endroits'), h('span', null, '🍂 recul ailleurs')), sources(c), q);
    setTimeout(() => qcm(q, talk, [
      { q: 'Que raconte la découverte sur les mangroves ?', opts: ['Certaines repoussent, d’autres reculent encore', 'Elles ont toutes disparu', 'Elles ont toutes grandi'], why: 'La nature change de façon différente selon les endroits.' },
      { q: 'À quoi servent les mangroves ?', opts: ['Elles protègent la côte et abritent des animaux', 'Elles font du vent', 'Elles rendent la mer salée'], why: 'Leurs racines freinent les vagues et cachent poissons et crabes.' },
      { q: 'Notre dessin 2010/2026 est…', opts: ['Une simulation pour comprendre', 'Une photo prise de l’espace', 'Une mesure officielle'], why: 'Bien distinguer observation et simulation : c’est de la science !' },
    ], (ok) => { if (ok >= 2) finish(c); else body.append(btn('↻ Réessayer', () => ch3(c))); }), 2200);
  }

  // ---- Portail final ----
  function final() {
    setBg('porte'); cat.className = 'lv-cat walk';
    const first = !L.badge;
    talk('Les trois pages brillent : l’eau vue du ciel, l’information vérifiée, les mangroves qui repoussent. Le portail s’ouvre. Muezza passe la première, sans un bruit !');
    if (first) { L.badge = true; S.save(); bonus(3); checkBadges(); Sfx.win(); }
    body.replaceChildren(h('div', { class: 'lv-final' }, h('span', null, '🛰️ Observer'), h('span', null, '🔎 Vérifier'), h('span', null, '🌿 Protéger')),
      btn('📖 Relire le livre', () => go('map'), 'btn ghost'));
    burst(body);
  }

  render();
}
