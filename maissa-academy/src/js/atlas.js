// L'Atlas des voyages de Maissa : carte du monde interactive (pays, continents, océans, capitales, drapeaux,
// curiosités), défis, et la scène du Japon après le globe de l'atelier.
// Carte : Natural Earth 1:110m (domaine public), projection de Miller.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri, qcm } from './workshop.js';
import { playFile } from './papa.js';
import M from './monde.json';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };

const CONT = { europe: ['l’Europe', '#6a8cff'], asie: ['l’Asie', '#ffb84a'], afrique: ['l’Afrique', '#e8735a'], amerique: ['l’Amérique', '#4ac88a'], oceanie: ['l’Océanie', '#c86bff'] };
// pays « à découvrir » : continent, capitale, drapeau, curiosité
export const PAYS = {
  BEL: { c: 'europe', cap: 'Bruxelles', fl: '🇧🇪', cur: 'C’est notre pays ! Célèbre pour ses frites, ses gaufres, son chocolat et l’Atomium.' },
  FRA: { c: 'europe', cap: 'Paris', fl: '🇫🇷', cur: 'La tour Eiffel mesure 330 mètres. On y parle français, comme en Wallonie et à Bruxelles.' },
  NLD: { c: 'europe', cap: 'Amsterdam', fl: '🇳🇱', cur: 'Le pays des tulipes, des moulins et des vélos. Une grande partie du pays est sous le niveau de la mer.' },
  DEU: { c: 'europe', cap: 'Berlin', fl: '🇩🇪', cur: 'Notre voisin à l’est. On y parle allemand, comme dans l’est de la Belgique.' },
  GBR: { c: 'europe', cap: 'Londres', fl: '🇬🇧', cur: 'Une île ! On y roule à gauche, et Big Ben sonne à Londres.' },
  ITA: { c: 'europe', cap: 'Rome', fl: '🇮🇹', cur: 'Il a la forme d’une botte. C’est le pays de la pizza et des pâtes.' },
  ESP: { c: 'europe', cap: 'Madrid', fl: '🇪🇸', cur: 'Le pays du flamenco et de la paella, avec beaucoup de soleil.' },
  GRC: { c: 'europe', cap: 'Athènes', fl: '🇬🇷', cur: 'Les premiers Jeux olympiques sont nés en Grèce, il y a très longtemps.' },
  MAR: { c: 'afrique', cap: 'Rabat', fl: '🇲🇦', cur: 'Ses villes colorées, le désert du Sahara, les montagnes de l’Atlas… et le délicieux thé à la menthe !', papa: 'Papa, le Maroc ! Il y a le désert, la mer et les montagnes… On y va bientôt ensemble ?' },
  EGY: { c: 'afrique', cap: 'Le Caire', fl: '🇪🇬', cur: 'Les pyramides et le grand fleuve Nil, le plus long d’Afrique.' },
  SEN: { c: 'afrique', cap: 'Dakar', fl: '🇸🇳', cur: 'On y trouve d’immenses baobabs et le lac Rose, qui est vraiment rose !' },
  KEN: { c: 'afrique', cap: 'Nairobi', fl: '🇰🇪', cur: 'Le pays des safaris : lions, girafes, zèbres et éléphants.' },
  ZAF: { c: 'afrique', cap: 'Pretoria', fl: '🇿🇦', cur: 'Tout au sud de l’Afrique, là où l’océan Atlantique rencontre l’océan Indien.' },
  JPN: { c: 'asie', cap: 'Tokyo', fl: '🇯🇵', cur: 'Le mont Fuji, les cerisiers en fleurs au printemps, les trains super rapides et les sushis !' },
  CHN: { c: 'asie', cap: 'Pékin', fl: '🇨🇳', cur: 'La Grande Muraille est si longue qu’il faudrait des mois pour la parcourir à pied. Et les pandas vivent ici !', name: 'Chine' },
  IND: { c: 'asie', cap: 'New Delhi', fl: '🇮🇳', cur: 'Le Taj Mahal, les épices colorées et les éléphants.' },
  SAU: { c: 'asie', cap: 'Riyad', fl: '🇸🇦', cur: 'Un immense désert. C’est là que se trouvent La Mecque et Médine.' },
  TUR: { c: 'asie', cap: 'Ankara', fl: '🇹🇷', cur: 'À cheval entre l’Europe et l’Asie, avec la grande ville d’Istanbul.' },
  USA: { c: 'amerique', cap: 'Washington', fl: '🇺🇸', cur: 'La statue de la Liberté à New York, et les grands parcs avec des bisons.' },
  CAN: { c: 'amerique', cap: 'Ottawa', fl: '🇨🇦', cur: 'Le 2e plus grand pays du monde. On parle français au Québec, et il y a des ours et des élans.' },
  MEX: { c: 'amerique', cap: 'Mexico', fl: '🇲🇽', cur: 'Des pyramides mayas, des cactus et des sombreros.' },
  BRA: { c: 'amerique', cap: 'Brasília', fl: '🇧🇷', cur: 'La forêt amazonienne, la plus grande forêt tropicale du monde, et le carnaval de Rio.' },
  PER: { c: 'amerique', cap: 'Lima', fl: '🇵🇪', cur: 'Le Machu Picchu, une ancienne cité inca perchée dans les montagnes, et les lamas.' },
  ARG: { c: 'amerique', cap: 'Buenos Aires', fl: '🇦🇷', cur: 'Le tango, et des glaciers géants tout au sud.' },
  AUS: { c: 'oceanie', cap: 'Canberra', fl: '🇦🇺', cur: 'Les kangourous et les koalas ! C’est à la fois un pays et presque un continent.' },
  NZL: { c: 'oceanie', cap: 'Wellington', fl: '🇳🇿', cur: 'Deux grandes îles, des volcans, et un oiseau qui ne vole pas : le kiwi.' },
  RUS: { c: 'europe', cap: 'Moscou', fl: '🇷🇺', cur: 'Le plus grand pays du monde : il est à la fois en Europe et en Asie !' },
};
const nameOf = (f) => (PAYS[f.a3] && PAYS[f.a3].name) || f.name;

function carte({ onTap, mode = 'pays' } = {}) {
  const svg = sv('svg', { viewBox: `0 0 ${M.W} ${M.H}`, class: 'at-map' });
  svg.append(sv('rect', { width: M.W, height: M.H, class: 'at-sea' }));
  const g = sv('g'); svg.append(g);
  M.oceans.forEach((o) => svg.append(sv('text', { x: o.x, y: o.y, class: 'at-ocean', style: 'text-anchor:middle' }, o.n)));
  const els = {};
  M.f.forEach((f) => {
    const known = !!PAYS[f.a3], cont = (PAYS[f.a3] && PAYS[f.a3].c) || f.cont;
    const p = sv('path', { d: f.d, class: 'at-land' + (known ? ' known' : ''), 'data-a3': f.a3, 'data-c': cont, 'data-testid': known ? 'at-pays' : null, style: mode === 'cont' && CONT[cont] ? `fill:${CONT[cont][1]}` : '' });
    p.addEventListener('click', () => onTap && onTap(f, p));
    g.append(p); els[f.a3] = p;
  });
  // repère pour les petits pays (Belgique, Pays-Bas…)
  ['BEL', 'NLD'].forEach((a) => { const f = M.f.find((x) => x.a3 === a); if (!f) return; const c = sv('circle', { cx: f.lx, cy: f.ly, r: 5, class: 'at-dot', 'data-a3': a }); c.addEventListener('click', () => onTap && onTap(f, els[a])); svg.append(c); });
  return { svg, els };
}
function fiche(f) {
  const P = PAYS[f.a3]; if (!P) return h('div', { class: 'at-card' }, h('b', null, nameOf(f)), h('p', { class: 'muted' }, `Continent : ${CONT[f.cont] ? CONT[f.cont][0] : '—'}`));
  return h('div', { class: 'at-card' }, h('div', { class: 'at-flag' }, P.fl), h('h3', null, nameOf(f)), h('p', null, `🌍 Continent : ${CONT[P.c][0]}`), h('p', null, `🏛️ Capitale : ${P.cap}`), h('p', null, `✨ ${P.cur}`));
}
function explorer(body, talk, focus) {
  const side = h('div', { class: 'at-side' }, h('p', { class: 'muted' }, 'Touche un pays qui brille pour découvrir son continent, sa capitale, son drapeau et une curiosité.'));
  const seen = () => { const b = S.get(); return b.atlas || (b.atlas = {}); };
  const { svg, els } = carte({ onTap: (f, p) => {
    Object.values(els).forEach((e) => e.classList.remove('on')); p.classList.add('on');
    side.replaceChildren(fiche(f)); Sfx.tap();
    const P = PAYS[f.a3];
    if (P && P.papa && !seen()['papa-' + f.a3]) { seen()['papa-' + f.a3] = 1; talk(P.papa, false); playFile('assets/voice/papa/maroc.mp3'); }
    else if (P) { talk(`${nameOf(f)} ! C’est en ${CONT[P.c][0].replace('l’', '')}. Sa capitale est ${P.cap}. ${P.cur}`); }
    if (P && !seen()[f.a3]) { seen()[f.a3] = 1; star(); } S.save();
    if (!P) talk(`${nameOf(f)}.`);
    side.append(h('small', { class: 'muted' }, `📒 Pays découverts : ${Object.keys(seen()).filter((k) => !k.includes('-')).length} / ${Object.keys(PAYS).length}`));
  } });
  body.replaceChildren(h('div', { class: 'at-lab' }, h('div', { class: 'at-mapw' }, svg), side));
  if (focus && els[focus]) { const f = M.f.find((x) => x.a3 === focus); els[focus].dispatchEvent(new Event('click')); void f; }
  else talk('Voici l’atlas des voyages ! Touche un pays qui brille.');
  return { svg, els };
}
function continents(body, talk) {
  const info = h('p', { class: 'prompt' }, 'Il y a 5 continents habités et 5 océans. Touche un continent !');
  const { svg } = carte({ mode: 'cont', onTap: (f) => { const c = (PAYS[f.a3] && PAYS[f.a3].c) || f.cont; if (CONT[c]) { info.textContent = `Tu as touché ${CONT[c][0]} (${nameOf(f)}).`; talk(`C’est ${CONT[c][0]}.`, true); Sfx.tap(); } } });
  const host = h('div');
  body.replaceChildren(info, h('div', { class: 'at-legend' }, ...Object.values(CONT).map(([n, col]) => h('span', null, h('i', { style: `background:${col}` }), n))), h('div', { class: 'at-mapw' }, svg), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'at-cquiz', onclick: () => { host.replaceChildren(); qcm(host, talk, shuffle([
    { q: 'Sur quel continent se trouve la Belgique ?', opts: ['l’Europe', 'l’Afrique', 'l’Asie'], why: 'La Belgique est en Europe.' },
    { q: 'Sur quel continent se trouve le Japon ?', opts: ['l’Asie', 'l’Europe', 'l’Océanie'], why: 'Le Japon est en Asie, à l’est.' },
    { q: 'Sur quel continent se trouve le Maroc ?', opts: ['l’Afrique', 'l’Europe', 'l’Amérique'], why: 'Le Maroc est en Afrique, tout au nord.' },
    { q: 'Quel océan se trouve entre l’Europe et l’Amérique ?', opts: ['l’océan Atlantique', 'l’océan Pacifique', 'l’océan Indien'], why: 'L’Atlantique sépare l’Europe et l’Afrique de l’Amérique.' },
    { q: 'Quel est le plus grand océan ?', opts: ['l’océan Pacifique', 'l’océan Atlantique', 'l’océan Arctique'], why: 'Le Pacifique est le plus grand océan du monde.' },
    { q: 'Où vivent les kangourous ?', opts: ['en Océanie (Australie)', 'en Europe', 'en Amérique'], why: 'En Australie, en Océanie.' },
    { q: 'Combien y a-t-il de continents habités ?', opts: ['5', '3', '10'], why: 'Europe, Asie, Afrique, Amérique, Océanie.' },
  ]).slice(0, 5), () => {}); } }, '🎯 Le quiz des continents'), host);
  talk('Voici les continents. Chaque couleur est un continent.');
}
function defi(body, talk) {
  const keys = shuffle(Object.keys(PAYS)).slice(0, 6); let i = 0, ok = 0;
  const head = h('p', { class: 'prompt' });
  const kind = () => (i % 3 === 0 ? 'cap' : i % 3 === 1 ? 'cur' : 'fl');
  const ask = () => {
    if (i >= keys.length) { head.textContent = `Bravo, grande voyageuse ! ${ok}/${keys.length}.`; talk(head.textContent); if (ok >= 5) { Sfx.win(); burst(body); } return; }
    const P = PAYS[keys[i]], k = kind();
    head.textContent = k === 'cap' ? `Touche le pays dont la capitale est ${P.cap}.` : k === 'fl' ? `Touche le pays de ce drapeau : ${P.fl}` : `Touche ce pays : « ${P.cur} »`;
    talk(head.textContent.replace(P.fl, ''));
  };
  const { svg, els } = carte({ onTap: (f, p) => {
    if (i >= keys.length) return;
    const want = keys[i];
    if (f.a3 === want) { ok++; star(); Sfx.coin(); p.classList.add('good'); talk(`Oui ! C’est ${nameOf(f)} ${PAYS[want].fl}`, false); }
    else { Sfx.tap(); els[want].classList.add('show'); talk(`Non, ça c’est ${nameOf(f)}. Le bon pays était ${nameOf(M.f.find((x) => x.a3 === want))}, qui brille maintenant.`, false); }
    i++; setTimeout(() => { Object.values(els).forEach((e) => e.classList.remove('good', 'show')); ask(); }, 2400);
  } });
  body.replaceChildren(head, h('div', { class: 'at-mapw' }, svg));
  ask();
}

// ---------- la scène du Japon ----------
export function japon() {
  open('explorer', 'JPN', true);
}
export function open(tab = 'explorer', focus = null, scene = false) {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['explorer', '🗺️ Explorer', (b, t) => explorer(b, t, focus)], ['continents', '🌍 Continents et océans', continents], ['defi', '🎯 Le défi du voyageur', defi]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'at-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel at-panel' }, UI.closeButton(), h('h2', null, '✈️ L’Atlas des voyages de Maissa'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Atlas des voyages', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); return T.find((x) => x[0] === k)[2](body, talk); }
  const r = go(tab);
  if (scene && r) {
    // le Japon s'illumine en doré, pétales de cerisier, puis Maissa parle à papa et Muezza
    const jp = r.els.JPN; if (jp) jp.classList.add('gold');
    const wrap = body.querySelector('.at-mapw');
    for (let k = 0; k < 18; k++) { const p = h('span', { class: 'at-petal', 'aria-hidden': 'true' }, '🌸'); p.style.cssText = `left:${78 + Math.random() * 16}%;top:${10 + Math.random() * 30}%;animation-delay:${Math.random() * 2}s`; wrap.append(p); setTimeout(() => p.remove(), 6000); }
    wrap.append(h('div', { class: 'at-fuji', 'aria-hidden': 'true' }, '🗻'));
    say.textContent = 'Papaaa ! Regarde où j’ai mis mon doigt ! C’est le Japon, en Asie ! C’est là qu’on part pour notre prochain grand voyage ! 💙';
    Voice.stop(); playFile('assets/voice/papa/japon.mp3');
    setTimeout(() => { if (!say.isConnected) return; say.textContent = '🐈‍⬛ Muezza saute sur la table… « Mais oui, Muezza ! Bien sûr que tu viens avec nous ! Hihihi ! »'; playFile('assets/voice/papa/muezza.mp3'); document.dispatchEvent(new CustomEvent('muezza:jump')); }, 8500);
  }
}
