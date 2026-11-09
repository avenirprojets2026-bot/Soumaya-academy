// Le Laboratoire des Trois États : la matière et l'eau (P4). Thermomètre magique, changements d'état, particules,
// lire un thermomètre (°C, températures négatives), réversible / irréversible, cycle de l'eau, dissolution.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, qcm } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.etats = b.etats || { ok: {} }; return b.etats; };
const done = (k) => { const st = ST(); st.ok[k] = true; if (Object.keys(st.ok).length >= 5) st.badge = true; S.save(); };

// ---------- 1. le thermomètre magique : glace → eau → vapeur ----------
function thermo(body, talk) {
  let T = -10, prev = -10, raf = 0;
  const tube = h('div', { class: 'et-tube' }, h('i', { class: 'et-liq' })), scale = h('div', { class: 'et-scale' }, ...[100, 80, 60, 40, 20, 0, -20].map((v) => h('span', { style: `bottom:${(v + 20) / 130 * 100}%` }, v + ' °C')));
  const val = h('b', { class: 'et-val' }), etat = h('div', { class: 'et-etat' });
  const pot = h('div', { class: 'et-pot' }, h('i', { class: 'et-ice' }), h('i', { class: 'et-water' }), h('i', { class: 'et-steam' }), h('i', { class: 'et-steam b' }), h('div', { class: 'et-flame' }));
  const zoom = h('div', { class: 'et-zoom' }); const parts = Array.from({ length: 24 }, () => { const p = h('i'); zoom.append(p); return p; });
  const box = h('div', { class: 'ea-step' });
  const slider = h('input', { type: 'range', min: -20, max: 110, value: T, class: 'lb-knob', 'aria-label': 'Température', 'data-testid': 'et-temp' });
  const phase = (t) => (t < 0 ? 'solide' : t < 100 ? 'liquide' : 'gaz');
  const MSG = {
    'solide>liquide': ['🧊➡️💧 La fusion !', 'À 0 degré Celsius, la glace fond et devient de l’eau liquide : c’est la fusion !'],
    'liquide>gaz': ['💧➡️♨️ L’ébullition !', 'À 100 degrés, l’eau bout : elle se transforme en vapeur d’eau, un gaz invisible. C’est l’ébullition !'],
    'gaz>liquide': ['♨️➡️💧 La condensation !', 'Quand la vapeur refroidit, elle redevient des petites gouttes d’eau : c’est la condensation, comme la buée sur un miroir !'],
    'liquide>solide': ['💧➡️🧊 La solidification !', 'À 0 degré, l’eau gèle et redevient de la glace : c’est la solidification !'],
  };
  const seen = new Set();
  const draw = () => {
    tube.firstChild.style.height = `${(T + 20) / 130 * 100}%`; val.textContent = `${T} °C`;
    const ph = phase(T); pot.dataset.ph = ph; zoom.dataset.ph = ph;
    etat.textContent = ph === 'solide' ? '🧊 SOLIDE : de la glace' : ph === 'liquide' ? '💧 LIQUIDE : de l’eau' : '♨️ GAZ : de la vapeur d’eau';
    pot.querySelector('.et-flame').style.opacity = T > 20 ? Math.min(1, (T - 20) / 60) : 0;
    const p0 = phase(prev); if (p0 !== ph) { const k = `${p0}>${ph}`, m = MSG[k] || MSG[k.replace('solide>gaz', 'solide>liquide')]; if (m) { box.replaceChildren(h('b', null, m[0]), h('p', null, m[1])); talk(m[1]); Sfx.coin(); seen.add(k); if (seen.size >= 4) { done('thermo'); star(2); } } }
    prev = T;
  };
  const loop = (now) => { raf = requestAnimationFrame(loop); const ph = zoom.dataset.ph, sp = ph === 'solide' ? 0.6 : ph === 'liquide' ? 3 : 9;
    parts.forEach((p, i) => { const gx = (i % 6) * 15 + 12, gy = Math.floor(i / 6) * 15 + 30; let x, y;
      if (ph === 'solide') { x = gx + Math.sin(now / 90 + i) * sp; y = gy + Math.cos(now / 80 + i) * sp; }
      else if (ph === 'liquide') { x = gx + Math.sin(now / 600 + i * 1.7) * 10; y = gy + 18 + Math.cos(now / 500 + i * 2.3) * 8; }
      else { x = 50 + Math.sin(now / 400 * (1 + i % 3) + i * 7) * 42; y = 50 + Math.cos(now / 330 * (1 + i % 4) + i * 3) * 42; }
      p.style.left = x + '%'; p.style.top = y + '%'; }); };
  slider.addEventListener('input', () => { T = +slider.value; draw(); });
  body.replaceChildren(h('p', { class: 'prompt' }, 'Tourne la manivelle du thermomètre (fais glisser) : chauffe la glace, puis refroidis la vapeur !'),
    h('div', { class: 'et-lab' }, h('div', { class: 'et-thermo' }, scale, tube, val), h('div', { class: 'et-mid' }, pot, etat, slider), h('div', { class: 'et-right' }, h('p', { class: 'muted' }, '🔍 La loupe magique : les particules d’eau'), zoom, box)));
  box.replaceChildren(h('b', null, '🧪 Le laboratoire'), h('p', null, 'L’eau existe sous trois états : solide (la glace), liquide (l’eau) et gazeux (la vapeur). C’est la température qui décide !'));
  draw(); raf = requestAnimationFrame(loop);
  talk('L’eau existe sous trois états : solide, liquide et gazeux. C’est la température qui décide ! Fais monter le thermomètre.');
  return () => cancelAnimationFrame(raf);
}

// ---------- 2. lire un thermomètre ----------
function lire(body, talk) {
  let n = 0, ok = 0; const zone = h('div');
  const SIT = [['Il neige dehors', -5], ['Un bon bain', 37], ['Une journée de printemps', 15], ['Le congélateur', -18], ['L’eau qui bout', 100], ['Une glace qui fond', 0], ['Une journée de canicule', 35], ['Le frigo', 4]];
  const pool = shuffle(SIT).slice(0, 6);
  const ask = () => {
    if (n >= pool.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `${ok}/${pool.length}`)); if (ok >= 5) { done('lire'); star(2); Sfx.win(); burst(body); } return; }
    const [t, v] = pool[n++]; const opts = shuffle([v, ...shuffle([v + 10, v - 10, -v || 20, v + 25].filter((x) => x !== v && x >= -30 && x <= 110)).slice(0, 2)]);
    const th = h('div', { class: 'et-mini' }, h('i', { style: `height:${(v + 30) / 140 * 100}%` }), ...[100, 50, 0, -20].map((g) => h('span', { style: `bottom:${(g + 30) / 140 * 100}%` }, g)));
    zone.replaceChildren(h('div', { class: 'et-lire' }, th, h('div', null, h('p', { class: 'prompt' }, `${t} : quelle température indique le thermomètre ?`), h('div', { class: 'actions wrap' }, ...opts.map((o) => h('button', { class: 'btn', type: 'button', onclick: () => {
      if (o === v) { ok++; Sfx.ok(); talk(`Oui, ${v} degrés Celsius${v < 0 ? ', c’est en dessous de zéro : on dit moins ' + -v : ''}.`); } else { Sfx.ko(); talk(`Non : ${v} degrés. ${v < 0 ? 'Sous le zéro, on lit « moins » : moins ' + -v + ' degrés.' : ''}`); }
      setTimeout(ask, 1800);
    } }, `${o} °C`))))));
  };
  body.replaceChildren(h('p', { class: 'muted' }, 'Le degré Celsius (°C) mesure la température. 0 °C : l’eau gèle. 100 °C : l’eau bout. Sous zéro, on écrit un signe moins : −5 °C se lit « moins cinq degrés ».'), zone); ask();
  talk('Le degré Celsius mesure la température. À zéro, l’eau gèle ; à cent, elle bout.');
}

// ---------- 3. réversible ou pas ? ----------
function reversible(body, talk) {
  const IT = [['🍫 Le chocolat qui fond', 'r', 'Le chocolat fondu redurcit en refroidissant.'], ['🧈 Le beurre dans la poêle', 'r', 'Il redevient solide au frigo.'], ['🕯️ La cire de bougie', 'r', 'La cire fondue refige.'], ['🧊 Le glaçon', 'r', 'L’eau peut regeler.'], ['🍳 L’œuf qui cuit', 'i', 'Un œuf cuit ne redevient jamais cru !'], ['🍞 Le pain grillé', 'i', 'On ne peut pas « dégriller » le pain.'], ['🔥 Le bois qui brûle', 'i', 'La cendre ne redevient pas du bois.'], ['🍪 La pâte à gâteau cuite', 'i', 'Le gâteau cuit ne redevient pas de la pâte.'], ['⚙️ Le fer fondu dans la forge', 'r', 'Le fer refroidi redevient solide.']];
  const pool = shuffle(IT).slice(0, 7); let i = 0, ok = 0; const zone = h('div');
  const ask = () => {
    if (i >= pool.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `${ok}/${pool.length}`)); if (ok >= 6) { done('rev'); star(2); Sfx.win(); burst(body); } return; }
    const [t, k, why] = pool[i++];
    zone.replaceChildren(h('p', { class: 'tb-q', style: 'font-size:clamp(20px,3.4vw,28px)' }, t), h('div', { class: 'actions wrap' },
      h('button', { class: 'btn', type: 'button', onclick: () => ans('r') }, '🔄 Ça peut redevenir comme avant'), h('button', { class: 'btn', type: 'button', onclick: () => ans('i') }, '🚫 Plus jamais comme avant')));
    const ans = (a) => { if (a === k) { ok++; Sfx.ok(); } else Sfx.ko(); talk(`${a === k ? 'Oui ! ' : 'Non. '}${why} ${k === 'r' ? 'C’est réversible.' : 'C’est irréversible.'}`); setTimeout(ask, 2200); };
  };
  body.replaceChildren(h('p', { class: 'muted' }, 'Une transformation est réversible quand on peut revenir en arrière (fondre puis durcir). Elle est irréversible quand c’est impossible (cuire, brûler).'), zone); ask();
}

// ---------- 4. le cycle de l'eau ----------
function cycle(body, talk) {
  const ET = [['☀️ Évaporation', 'Le soleil chauffe la mer : l’eau s’évapore en vapeur invisible qui monte dans le ciel.'], ['☁️ Condensation', 'En altitude, il fait froid : la vapeur se condense en minuscules gouttes qui forment les nuages.'], ['🌧️ Précipitations', 'Les gouttes grossissent et tombent : c’est la pluie, ou la neige s’il fait très froid.'], ['🏞️ Ruissellement', 'L’eau coule dans les ruisseaux et les rivières, s’infiltre dans le sol… et retourne à la mer. Et ça recommence !']];
  const sky = h('div', { class: 'et-cycle' }, h('i', { class: 'c-sun' }), h('i', { class: 'c-sea' }), h('i', { class: 'c-cloud' }), h('i', { class: 'c-mont' }), h('i', { class: 'c-rain' }), h('i', { class: 'c-riv' }), h('i', { class: 'c-vap' }));
  const box = h('div', { class: 'ea-step' }); let k = -1; const q = h('div');
  const next = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'et-next', onclick: () => { k++; if (k >= ET.length) { next.remove(); order(); return; } sky.dataset.k = k; box.replaceChildren(h('b', null, ET[k][0]), h('p', null, ET[k][1])); talk(ET[k][1]); Sfx.bloop(); if (k === 3) next.textContent = 'Remettre dans l’ordre ▶'; } }, 'Commencer le voyage de la goutte ▶');
  const order = () => { const o = h('div', { class: 'lb-order' }); let n = 0;
    shuffle(ET).forEach(([t]) => o.append(h('button', { class: 'btn', type: 'button', onclick: (e) => { const b = e.currentTarget; if (b.disabled) return; if (t === ET[n][0]) { b.disabled = true; b.classList.add('ok'); b.textContent = `${n + 1}. ${t}`; n++; Sfx.ok(); if (n === 4) { done('cycle'); star(2); Sfx.win(); burst(q); talk('Bravo ! Le cycle de l’eau tourne sans fin.'); } } else { Sfx.ko(); talk('Pas encore ! Commence par le soleil qui chauffe la mer.'); } } }, t)));
    q.replaceChildren(h('p', { class: 'prompt' }, 'Remets les étapes dans l’ordre :'), o); };
  body.replaceChildren(h('div', { class: 'ea-wrap' }, sky, h('div', { class: 'ea-side' }, box, next)), q);
  box.replaceChildren(h('b', null, '💧 Le voyage d’une goutte'), h('p', null, 'L’eau de la Terre voyage sans cesse : de la mer au ciel, du ciel à la terre, et retour !')); talk('Suis le voyage d’une goutte d’eau !');
}

// ---------- 5. mélanges et dissolution ----------
function dissoudre(body, talk) {
  const glass = h('div', { class: 'et-glass' }, h('i', { class: 'et-gw' })); const box = h('div', { class: 'ea-step' }); const tried = new Set();
  const ING = [['🧂 Sel', 'diss', 'Le sel disparaît… mais il est toujours là : l’eau est salée ! Il s’est dissous.'], ['🍬 Sucre', 'diss', 'Le sucre se dissout : on ne le voit plus, mais on le goûte !'], ['🏖️ Sable', 'fond', 'Le sable ne se dissout pas : il tombe au fond. On peut le récupérer en filtrant.'], ['🫒 Huile', 'flot', 'L’huile ne se mélange pas à l’eau : elle flotte au-dessus !']];
  body.replaceChildren(h('p', { class: 'prompt' }, 'Verse un ingrédient dans le verre d’eau et remue.'), h('div', { class: 'actions wrap' }, ...ING.map(([t, k, d]) => h('button', { class: 'btn', type: 'button', onclick: () => {
    glass.dataset.k = k; glass.classList.remove('stir'); void glass.offsetWidth; glass.classList.add('stir'); box.replaceChildren(h('b', null, t), h('p', null, d)); talk(d); Sfx.bloop(); tried.add(t);
    if (tried.size === 4) { done('diss'); star(2); Sfx.win(); }
  } }, t))), h('div', { class: 'ea-wrap' }, glass, box));
  talk('Que se passe-t-il quand on verse quelque chose dans l’eau ?');
}

export function open(tab = 'thermo') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div'); let stop = null;
  const T = [['thermo', '🌡️ Le thermomètre magique', thermo], ['lire', '🔢 Lire la température', lire], ['rev', '🍫 Réversible ou pas ?', reversible], ['cycle', '🌦️ Le cycle de l’eau', cycle], ['diss', '🧂 Mélanges', dissoudre]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'et-tab-' + k, onclick: () => go(k) }, l));
  const head = h('div');
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ea-panel' }, UI.closeButton(), h('h2', null, '⚗️ Le Laboratoire des Trois États'), head, h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Le Laboratoire des Trois États', onClose: () => { Voice.stop(); if (stop) stop(); } });
  function go(k) { if (stop) { stop(); stop = null; } Voice.stop(); const st = ST(); head.replaceChildren(st.badge ? h('b', { class: 'tb-badge' }, '⚗️ Petite alchimiste !') : h('small', { class: 'muted' }, `${Object.keys(st.ok).length}/5 expériences réussies`));
    tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); stop = T.find((x) => x[0] === k)[2](body, talk) || null; }
  go(tab);
}
