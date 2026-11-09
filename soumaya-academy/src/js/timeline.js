// La machine à remonter le temps (Archives) : frise chronologique des 5 grandes périodes,
// placer des événements, siècles et millénaires, calcul de durées, défi.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';

export const PERIODS = [
  { k: 'pre', name: 'Préhistoire', col: '#a77b4f', from: null, to: -3000, w: 14, txt: 'La Préhistoire : les humains vivent de la chasse, de la cueillette puis de l’agriculture. Elle se termine vers 3000 avant Jésus-Christ, avec l’invention de l’écriture.' },
  { k: 'ant', name: 'Antiquité', col: '#d9a441', from: -3000, to: 476, w: 22, txt: 'L’Antiquité : l’époque des pyramides d’Égypte, des Grecs et des Romains. Elle commence avec l’écriture et se termine en 476, à la fin de l’Empire romain d’Occident.' },
  { k: 'ma', name: 'Moyen Âge', col: '#6b9b3a', from: 476, to: 1492, w: 22, txt: 'Le Moyen Âge : l’époque des châteaux forts, des seigneurs et des chevaliers. Il va de 476 à 1492, quand Christophe Colomb arrive en Amérique.' },
  { k: 'tm', name: 'Temps modernes', col: '#3f86c9', from: 1492, to: 1789, w: 18, txt: 'Les Temps modernes : l’époque des grands voyages, de l’imprimerie qui se répand et des grandes découvertes. Ils vont de 1492 à 1789, la Révolution française.' },
  { k: 'ec', name: 'Époque contemporaine', col: '#b04fc0', from: 1789, to: 2026, w: 24, txt: 'L’Époque contemporaine : de 1789 à aujourd’hui. C’est l’époque de l’indépendance de la Belgique, des trains, des voitures, des avions… et c’est la nôtre !' },
];
const EVENTS = [
  { t: 'Les peintures dans la grotte de Lascaux', y: null, p: 'pre', ic: '🦬', why: 'Elles ont été peintes il y a environ 20 000 ans, bien avant l’écriture : c’est la Préhistoire.' },
  { t: 'L’invention de l’agriculture', y: null, p: 'pre', ic: '🌾', why: 'Les humains commencent à cultiver vers 10 000 ans avant aujourd’hui : c’est encore la Préhistoire.' },
  { t: 'La construction des grandes pyramides d’Égypte', y: -2560, p: 'ant', ic: '🔺', why: 'Vers 2560 avant Jésus-Christ : c’est l’Antiquité.' },
  { t: 'Jules César conquiert la Gaule et le pays des Belges', y: -57, p: 'ant', ic: '🏛️', why: 'En 57 avant Jésus-Christ : c’est l’Antiquité, l’époque des Romains.' },
  { t: 'Charlemagne devient empereur', y: 800, p: 'ma', ic: '👑', why: 'En l’an 800 : c’est le Moyen Âge.' },
  { t: 'Les seigneurs construisent des châteaux forts', y: 1100, p: 'ma', ic: '🏰', why: 'Vers l’an 1100 : c’est le Moyen Âge.' },
  { t: 'Gutenberg invente l’imprimerie', y: 1450, p: 'ma', ic: '📜', why: 'Vers 1450, juste avant 1492 : c’est encore la fin du Moyen Âge.' },
  { t: 'Charles Quint naît à Gand', y: 1500, p: 'tm', ic: '🤴', why: 'En 1500 : c’est le début des Temps modernes.' },
  { t: 'La Révolution française', y: 1789, p: 'ec', ic: '🇫🇷', why: 'En 1789 : elle marque le début de l’Époque contemporaine.' },
  { t: 'L’indépendance de la Belgique', y: 1830, p: 'ec', ic: '🇧🇪', why: 'En 1830 : c’est l’Époque contemporaine.' },
  { t: 'L’école devient obligatoire en Belgique', y: 1914, p: 'ec', ic: '🏫', why: 'Par la loi du 19 mai 1914 : c’est l’Époque contemporaine.' },
  { t: 'Le premier homme marche sur la Lune', y: 1969, p: 'ec', ic: '🚀', why: 'En 1969 : c’est l’Époque contemporaine.' },
  { t: 'La Convention des droits de l’enfant', y: 1989, p: 'ec', ic: '🧒', why: 'Le 20 novembre 1989 : c’est l’Époque contemporaine.' },
];
const ROM = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export const roman = (n) => ROM.reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, '');
export const siecle = (y) => Math.ceil(y / 100);
const sName = (n) => `${roman(n)}${n === 1 ? 'er' : 'e'} siècle`;
const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const star = () => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + 1; b.coins += 2; S.save(); };
function burst(host) { for (let k = 0; k < 12; k++) { const s = h('span', { class: 'abq-spark', 'aria-hidden': 'true' }, k % 3 ? '✨' : '🌟'); s.style.cssText = `left:${50 + (Math.random() - 0.5) * 60}%;top:${40 + (Math.random() - 0.5) * 30}%;--dx:${(Math.random() - 0.5) * 220}px;--dy:${-60 - Math.random() * 120}px`; host.append(s); setTimeout(() => s.remove(), 1500); } }

// questions générées : siècles, millénaires, durées, ordre des périodes
export function genQuestions(n = 8) {
  const out = [];
  const mk = { siecle() { const y = ri(1, 20) * 100 - ri(0, 99), s = siecle(y), wrong = Math.floor(y / 100); const opts = [...new Set([s, wrong === s ? s + 1 : wrong, s - 1 || s + 2])].slice(0, 3); return { q: `En quel siècle se trouve l’année ${y} ?`, opts: opts.map(sName), a: sName(s), why: `${y} est dans le ${sName(s)} (de ${(s - 1) * 100 + 1} à ${s * 100}). Astuce : on ajoute 1 au nombre de centaines… sauf pour les années « rondes » comme ${s * 100}.` }; },
    rond() { const s = ri(10, 20), y = s * 100; return { q: `L’année ${y} appartient à quel siècle ?`, opts: [sName(s), sName(s + 1)], a: sName(s), why: `Le ${sName(s)} va de ${y - 99} à ${y} : ${y} est sa dernière année.` }; },
    duree() { const a = ri(1100, 1950), b = a + ri(15, 75); return { q: `Combien d’années se sont écoulées entre ${a} et ${b} ?`, opts: [b - a, b - a + 10, b - a - 1], a: b - a, why: `${b} − ${a} = ${b - a} ans.`, fmt: (x) => `${x} ans` }; },
    evdur() { const pairs = [[1830, 1914, 'l’indépendance de la Belgique', 'l’école obligatoire'], [1914, 1989, 'l’école obligatoire', 'la Convention des droits de l’enfant'], [1830, 1969, 'l’indépendance de la Belgique', 'le premier pas sur la Lune'], [1492, 1789, 'l’arrivée de Colomb en Amérique', 'la Révolution française']]; const [a, b, ea, eb] = pairs[ri(0, pairs.length - 1)]; return { q: `Combien d’années entre ${ea} (${a}) et ${eb} (${b}) ?`, opts: [b - a, b - a + 100, b - a - 10], a: b - a, why: `${b} − ${a} = ${b - a} ans.`, fmt: (x) => `${x} ans` }; },
    unites() { const k = ri(0, 3); return [
      { q: 'Combien d’années dans un siècle ?', opts: [100, 10, 1000], a: 100, why: 'Un siècle = 100 ans.', fmt: (x) => `${x} ans` },
      { q: 'Combien d’années dans un millénaire ?', opts: [1000, 100, 10000], a: 1000, why: 'Un millénaire = 1 000 ans = 10 siècles.', fmt: (x) => `${x} ans` },
      { q: 'Combien de siècles dans un millénaire ?', opts: [10, 100, 1000], a: 10, why: '1 000 ans ÷ 100 ans = 10 siècles.', fmt: (x) => `${x} siècles` },
      { q: 'Une décennie, c’est combien d’années ?', opts: [10, 100, 12], a: 10, why: 'Une décennie = 10 ans.', fmt: (x) => `${x} ans` },
    ][k]; },
    ordre() { const i = ri(1, 4), P = PERIODS, A = { 'Préhistoire': 'la ', 'Antiquité': 'l’', 'Moyen Âge': 'le ', 'Temps modernes': 'les ', 'Époque contemporaine': 'l’' }, nm = (p) => A[p.name] + p.name; const others = shuffle(P.filter((_, k) => k !== i && k !== i - 1).map((p) => p.name)).slice(0, 2); return Math.random() < 0.5 ? { q: `Quelle période vient juste avant ${nm(P[i])} ?`, opts: others.concat(P[i - 1].name), a: P[i - 1].name, why: `Avant ${nm(P[i])}, il y a ${nm(P[i - 1])}.` } : { q: `Quelle période vient juste après ${nm(P[i - 1])} ?`, opts: others.concat(P[i].name), a: P[i].name, why: `Après ${nm(P[i - 1])} vient ${nm(P[i])}.` }; },
    periode() { const e = EVENTS.filter((x) => x.y)[ri(0, 10)]; const P = PERIODS.find((p) => p.k === e.p); return { q: `${e.t} (${e.y < 0 ? -e.y + ' avant J.-C.' : e.y}) : quelle période ?`, opts: shuffle(PERIODS.filter((p) => p.k !== e.p).map((p) => p.name)).slice(0, 2).concat(P.name), a: P.name, why: e.why }; },
  };
  const order = ['siecle', 'rond', 'duree', 'unites', 'ordre', 'periode', 'evdur', 'siecle', 'periode', 'duree'];
  for (const k of shuffle(order).slice(0, n)) { const q = mk[k](); q.opts = shuffle([...new Set(q.opts.map(String))]); out.push(q); }
  return out;
}

export function open(tab = 'frise') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  // la frise
  const frise = h('div', { class: 'tl-frise' });
  const segs = {};
  PERIODS.forEach((p) => { const seg = h('button', { class: 'tl-seg', type: 'button', 'data-p': p.k, style: `flex:${p.w};--c:${p.col}` }, h('span', null, p.name)); frise.append(seg); segs[p.k] = seg; });
  const ticks = h('div', { class: 'tl-ticks' });
  let acc = 0; for (let i = 0; i < PERIODS.length; i++) { acc += PERIODS[i].w; if (i < PERIODS.length - 1) ticks.append(h('span', { style: `left:${acc}%` }, PERIODS[i].to < 0 ? `${-PERIODS[i].to} av. J.-C.` : String(PERIODS[i].to))); }
  ticks.append(h('span', { class: 'end', style: 'left:100%' }, 'aujourd’hui'), h('span', { class: 'jc', style: `left:${PERIODS[0].w + PERIODS[1].w * (3000 / 3476)}%` }, '0 (naissance de J.-C.)'));
  const pins = h('div', { class: 'tl-pins' });
  const posOf = (y, pk) => { let left = 0; for (const p of PERIODS) { if (p.k === pk) { if (y == null || p.from == null) return left + p.w * 0.5; return left + p.w * Math.min(0.97, Math.max(0.03, (y - p.from) / (p.to - p.from))); } left += p.w; } return 0; };
  const pin = (e, ok = true) => { const d = h('div', { class: 'tl-pin' + (ok ? '' : ' ko'), style: `left:${posOf(e.y, e.p)}%` }, h('b', null, e.ic), h('small', null, e.y == null ? '' : e.y < 0 ? `${-e.y} av. J.-C.` : e.y)); pins.append(d); return d; };
  const wrapF = h('div', { class: 'tl-wrap' }, pins, frise, ticks);
  const body = h('div', { class: 'cc-body' });
  let gen = 0;
  const later = (fn, ms) => { const g = gen; setTimeout(() => { if (g === gen && wrapF.isConnected) fn(); }, ms); };
  const tabs = [['frise', '📜 Découvrir la frise'], ['placer', '📍 Placer les événements'], ['siecles', '🔢 Siècles et durées'], ['defi', '🏆 Défi']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-tab': k, 'data-testid': 'tl-' + k, onclick: () => go(k) }, l));
  function go(k) {
    gen++; Voice.stop(); say.textContent = ''; body.replaceChildren(); pins.replaceChildren(); wrapF.classList.remove('pick');
    Object.values(segs).forEach((s) => { s.classList.remove('on', 'ko'); s.onclick = null; });
    tabs.forEach((b) => b.classList.toggle('primary', b.dataset.tab === k));
    ({ frise: decouvrir, placer, siecles: () => quiz(genQuestions(8)), defi })[k]();
  }
  function decouvrir() {
    talk('Bienvenue dans la machine à remonter le temps ! Les historiens découpent le passé en 5 grandes périodes. Touche une période pour la découvrir.');
    EVENTS.filter((e) => e.y && [-2560, 476, 1100, 1500, 1830, 1969].includes(e.y)).forEach((e) => pin(e));
    PERIODS.forEach((p) => { segs[p.k].onclick = () => { Object.values(segs).forEach((s) => s.classList.remove('on')); segs[p.k].classList.add('on'); Sfx.tap(); talk(p.txt); }; });
    body.append(h('p', { class: 'muted' }, 'Attention : les périodes n’ont pas la même longueur ! L’Antiquité dure plus de 3 000 ans, les Temps modernes moins de 300 ans. Sur cette frise, on les a dessinées plus semblables pour bien les voir.'));
  }
  function placer() {
    const list = shuffle(EVENTS).slice(0, 7); let i = 0, ok = 0;
    const card = h('div', { class: 'tl-card' }), sc = h('span', { class: 'be-score' });
    body.append(card, sc); wrapF.classList.add('pick');
    function ask() {
      if (i >= list.length) { card.replaceChildren(h('strong', null, `${ok} / ${list.length} bien placés !`)); talk(`Bravo ! ${ok} événements sur ${list.length} bien placés !`); sc.textContent = ''; if (ok >= list.length - 1) { Sfx.win(); burst(wrapF); } body.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => go('placer') }, '↻ Rejouer'))); wrapF.classList.remove('pick'); return; }
      const e = list[i]; sc.textContent = `${i + 1}/${list.length}`;
      card.replaceChildren(h('span', { class: 'ci' }, e.ic), h('strong', null, e.t), e.y != null ? h('small', null, e.y < 0 ? `${-e.y} avant Jésus-Christ` : `en ${e.y}`) : h('small', null, 'il y a très, très longtemps'));
      talk(`${e.t}${e.y != null ? (e.y < 0 ? `, en ${-e.y} avant Jésus-Christ` : `, en ${e.y}`) : ''}. Dans quelle période ? Touche-la sur la frise.`);
      let lock = false;
      PERIODS.forEach((p) => { segs[p.k].onclick = () => {
        if (lock) return; lock = true; const good = p.k === e.p;
        if (good) { ok++; star(); Sfx.win(); burst(wrapF); segs[p.k].classList.add('on'); talk('Bravo ! ' + e.why, false); }
        else { Sfx.tap(); segs[p.k].classList.add('ko'); segs[e.p].classList.add('on'); talk('Pas tout à fait. ' + e.why, false); }
        pin(e, good); i++; later(() => { Object.values(segs).forEach((s) => s.classList.remove('on', 'ko')); ask(); }, 2600);
      }; });
    }
    ask();
  }
  function quiz(list, onDone) {
    let i = 0, ok = 0;
    const q = h('p', { class: 'prompt' }), ans = h('div', { class: 'answers' }), sc = h('span', { class: 'be-score' });
    body.append(q, ans, sc);
    function ask() {
      if (i >= list.length) { q.textContent = `${ok} / ${list.length} bonnes réponses !`; talk(q.textContent); ans.replaceChildren(); sc.textContent = ''; if (onDone) onDone(ok, list.length); else ans.append(h('button', { class: 'btn primary', type: 'button', onclick: () => go('siecles') }, '↻ D’autres questions')); return; }
      const it = list[i]; q.textContent = it.q; Voice.speak(it.q); sc.textContent = `${i + 1}/${list.length}`;
      ans.replaceChildren(...it.opts.map((o) => h('button', { class: 'choice', type: 'button', 'data-testid': 'tl-choice', onclick: () => {
        const good = String(o) === String(it.a);
        if (good) { ok++; star(); Sfx.win(); burst(wrapF); talk('Bravo ! ' + it.why, false); } else { Sfx.tap(); talk('Pas tout à fait. ' + it.why, false); }
        ans.querySelectorAll('button').forEach((b) => { b.disabled = true; b.classList.toggle('right', b.dataset.v === String(it.a)); }); i++; later(ask, 2800);
      }, 'data-v': String(o) }, it.fmt ? it.fmt(o) : String(o))));
    }
    ask();
  }
  function defi() {
    body.append(h('p', { class: 'muted' }, 'Le grand défi du temps : 10 questions mélangées. À 8 bonnes réponses, tu deviens Gardienne du temps ! ⏳'));
    quiz(genQuestions(10), (ok, n) => { const d = S.get().temps || (S.get().temps = {}); d.best = Math.max(d.best || 0, ok); if (ok >= 8) d.master = true; S.save(); const m = ok >= 8 ? `Bravo ! ${ok} sur ${n} : tu es Gardienne du temps ! ⏳👑` : `${ok} sur ${n} ! Encore un petit effort pour devenir Gardienne du temps.`; talk(m); if (ok >= 8) { Sfx.win(); burst(wrapF); burst(wrapF); } });
  }
  UI.openDialog(h('div', { class: 'panel be-panel tl-panel' }, UI.closeButton(),
    h('h2', null, '⏳ La machine à remonter le temps', (S.get().temps || {}).master ? ' 👑' : ''),
    h('div', { class: 'actions wrap cc-tabs' }, ...tabs), wrapF, say, body), { label: 'Frise du temps', onClose: () => { gen++; Voice.stop(); } });
  go(tab);
}
