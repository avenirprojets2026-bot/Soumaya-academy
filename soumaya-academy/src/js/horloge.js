// La grande horloge des Archives du Temps : horloge monumentale animée dans le décor (heure réelle, tic-tac discret,
// petit carillon aux heures pleines) et module pour apprendre à lire l'heure (P4) :
// découverte guidée, manipulation des aiguilles (lien avec l'affichage digital), 6 niveaux de questions.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { playFile } from './papa.js';
import { burst, shuffle, ri } from './workshop.js';

const FACE = 'assets/scenes/horloge_cadran.webp';
const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.horloge = b.horloge || { lvl: 1 }; return b.horloge; };
const NS = 'http://www.w3.org/2000/svg';
// ---------- chasse au trésor : le grimoire caché des épreuves ----------
const GR = () => { const b = S.get(); b.grimoire = b.grimoire || {}; return b.grimoire; };
export const grimoireAwake = () => !!GR().awake;
function grimoireCheck(H, M, talk) {
  const g = GR(); if (!g.read || g.awake || H % 12 !== 9 || M !== 0) return;
  g.awake = true; S.save(); Sfx.chime(); setTimeout(() => Sfx.chime(), 900);
  talk('Ding… dong… Neuf heures ! Quelque chose s’est réveillé près des livres bleus, à côté du grand sablier…');
  document.dispatchEvent(new CustomEvent('grimoire:awake'));
}
export function openEnigme() {
  const g = GR(), again = g.read && !g.awake; g.read = true; S.save();
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (t) => { say.textContent = t; Voice.speak(t); };
  const txt = g.awake ? 'Le grimoire est réveillé ! Il t’attend près des livres bleus, à côté du grand sablier.' : 'Là où dorment les livres bleus, près du grand sablier, un grimoire attend celle qui sait lire l’heure. Mets les aiguilles de la Grande Horloge sur ton âge… et il se réveillera.';
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel en-panel' }, UI.closeButton(), h('h2', null, '📜 Le parchemin mystérieux'),
    h('div', { class: 'en-parch' }, h('p', null, txt), again ? h('p', { class: 'en-hint' }, '💡 Petit indice : quel âge as-tu, Soumaya ? Alors… quelle heure pile ?') : null),
    g.awake ? null : h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'en-go', onclick: () => open('manipuler') }, '🕰️ Aller à la Grande Horloge')), say), { label: 'Le parchemin mystérieux', onClose: () => Voice.stop() });
  say.textContent = g.awake ? txt : 'Un parchemin mystérieux… Écoute bien l’énigme !'; Voice.speak(g.awake ? txt : 'Un parchemin mystérieux ! Écoute bien l’énigme. ' + txt + (again ? ' Petit indice : quel âge as-tu, Soumaya ?' : ''));
}

const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };
const pad = (n) => String(n).padStart(2, '0');
const dig = (hh, mm) => `${pad(hh)}:${pad(mm)}`;
const NOMBRES = ['zéro', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'midi'];
// l'heure dite « à l'ancienne » (heure du cadran, 1-12)
function enMots(hh, mm) {
  const h12 = ((hh + 11) % 12) + 1, nx = (h12 % 12) + 1;
  const nom = (n) => (n === 12 ? 'douze heures' : `${NOMBRES[n]} heure${n > 1 ? 's' : ''}`);
  if (mm === 0) return nom(h12) + ' pile';
  if (mm === 15) return nom(h12) + ' et quart';
  if (mm === 30) return nom(h12) + ' et demie';
  if (mm === 45) return nom(nx) + ' moins le quart';
  if (mm > 30 && mm % 5 === 0) return `${nom(nx)} moins ${60 - mm}`;
  return `${nom(h12)} ${mm}`;
}

// ---------- composant : cadran + aiguilles (réutilisable) ----------
export function clock({ size = 260, hh = 3, mm = 0, drag = false, onChange } = {}) {
  const hand = (cls, len, w) => sv('g', { class: cls }, sv('path', { d: `M100 ${100 + len * 0.18} L${100 - w} 100 L100 ${100 - len} L${100 + w} 100 Z`, fill: 'url(#hg)', stroke: '#3b2405', 'stroke-width': 1.4 }), sv('circle', { cx: 100, cy: 100 - len * 0.62, r: w * 0.9, fill: '#ffe9a0', stroke: '#3b2405', 'stroke-width': 1 }));
  const hH = hand('ho-h', 34, 5.5), hM = hand('ho-m', 54, 3.8);
  const svg = sv('svg', { viewBox: '0 0 200 200', class: 'ho-hands' }, sv('defs', null, sv('linearGradient', { id: 'hg', x1: 0, x2: 1 }, sv('stop', { offset: 0, 'stop-color': '#b8860b' }), sv('stop', { offset: 0.5, 'stop-color': '#ffe08a' }), sv('stop', { offset: 1, 'stop-color': '#a8740a' }))), hH, hM, sv('circle', { cx: 100, cy: 100, r: 6, fill: '#ffe08a', stroke: '#3b2405' }));
  const el = h('div', { class: 'ho-clock' + (drag ? ' drag' : ''), style: `width:${size}px;max-width:80vw` }, h('img', { src: FACE, alt: '', draggable: 'false' }), svg);
  let t = hh * 60 + mm; // minutes depuis 0 h
  const draw = () => { const m = ((t % 60) + 60) % 60, hr = ((t / 60) % 12 + 12) % 12; hM.setAttribute('transform', `rotate(${m * 6} 100 100)`); hH.setAttribute('transform', `rotate(${hr * 30} 100 100)`); };
  const api = { el, set(H, M) { t = H * 60 + M; draw(); }, setT(x) { t = x; draw(); }, get() { const x = ((Math.round(t) % 1440) + 1440) % 1440; return [Math.floor(x / 60), x % 60]; }, add(d) { t += d; draw(); onChange && onChange(api.get()); } };
  if (drag) {
    let on = false, last = null;
    const ang = (e) => { const r = el.getBoundingClientRect(); return (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI; };
    el.addEventListener('pointerdown', (e) => { on = true; last = ang(e); el.setPointerCapture(e.pointerId); e.preventDefault(); });
    el.addEventListener('pointermove', (e) => { if (!on) return; const a = ang(e); let d = a - last; if (d > 180) d -= 360; if (d < -180) d += 360; last = a; t += d / 6; draw(); const [H, M] = api.get(); onChange && onChange([H, M], true); });
    el.addEventListener('pointerup', () => { if (!on) return; on = false; t = Math.round(t); draw(); Sfx.tap(); onChange && onChange(api.get()); });
  }
  draw(); return api;
}

// ---------- horloge animée dans le décor ----------
export function mountRoom(world, def, room) {
  const c = def.bigClock; const host = h('div', { class: 'ho-room', 'aria-hidden': 'true', style: `left:${c.x * 100}%;top:${c.y * 100}%;width:${c.w * 100}%` });
  const ck = clock({ size: 10 }); ck.el.style.width = '100%'; ck.el.style.maxWidth = 'none'; host.append(ck.el, h('div', { class: 'ho-glow' })); world.append(host);
  let lastS = -1, lastH = -1;
  const tick = () => {
    if (room.destroyed) return clearInterval(iv);
    const d = new Date(); ck.setT(d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60);
    if (d.getSeconds() !== lastS) { lastS = d.getSeconds(); if (room.motion !== false && !document.hidden) Sfx.tick(lastS % 2); }
    if (d.getMinutes() === 0 && d.getHours() !== lastH) { lastH = d.getHours(); Sfx.chime(); }
    if (d.getMinutes() !== 0) lastH = -1;
  };
  const iv = setInterval(tick, 250); tick(); return () => clearInterval(iv);
}

// ---------- 1. découverte guidée ----------
function decouverte(body, talk) {
  let k = 0, anim = null; const dg = h('div', { class: 'ho-dig' }), mots = h('div', { class: 'ho-mots' });
  const ck = clock({ size: 280, hh: 3, mm: 0, onChange: ([H, M]) => show(H, M) });
  const show = (H, M) => { dg.textContent = dig(H, M); mots.textContent = enMots(H, M); };
  const ETAPES = [
    ['Le cadran', 'Voici le cadran : les nombres de 1 à 12 font le tour, dans le sens des aiguilles d’une montre.', () => ck.set(12, 0)],
    ['La petite aiguille', 'La PETITE aiguille montre les HEURES. Ici, elle est sur le 3 : il est 3 heures.', () => ck.set(3, 0)],
    ['La grande aiguille', 'La GRANDE aiguille montre les MINUTES. Quand elle est sur le 12, c’est une heure pile.', () => ck.set(3, 0)],
    ['Un tour = 60 minutes', 'Quand la grande aiguille fait un tour complet, 60 minutes passent : la petite aiguille avance d’un nombre.', () => { ck.set(3, 0); let n = 0; anim = setInterval(() => { ck.add(2); show(...ck.get()); if (++n >= 30) clearInterval(anim); }, 60); }],
    ['De 5 en 5', 'Entre deux nombres, il y a 5 minutes. Grande aiguille sur le 1 : 5 minutes ; sur le 2 : 10 minutes ; sur le 6 : 30 minutes.', () => ck.set(4, 10)],
    ['Et demie', 'Grande aiguille sur le 6 : la moitié du tour, 30 minutes. 4 h 30, c’est « quatre heures et demie ». La petite aiguille est entre le 4 et le 5 !', () => ck.set(4, 30)],
    ['Et quart', 'Grande aiguille sur le 3 : un quart de tour, 15 minutes. 4 h 15, c’est « quatre heures et quart ».', () => ck.set(4, 15)],
    ['Moins le quart', 'Grande aiguille sur le 9 : 45 minutes. Il manque un quart d’heure pour arriver à 5 h : « cinq heures moins le quart ».', () => ck.set(4, 45)],
    ['Le matin et l’après-midi', 'Le cadran n’a que 12 heures : il fait deux tours par jour. 3 heures de l’après-midi s’écrit 15:00 sur une horloge digitale (3 + 12).', () => ck.set(15, 0)],
  ];
  const title = h('h3', { class: 'ho-t' }), txt = h('p', { class: 'ho-txt' });
  const go = (i) => { clearInterval(anim); k = Math.max(0, Math.min(ETAPES.length - 1, i)); const [t, x, f] = ETAPES[k]; title.textContent = `${k + 1}/${ETAPES.length} — ${t}`; txt.textContent = x; f(); setTimeout(() => show(...ck.get()), 50); talk(x); };
  body.replaceChildren(h('div', { class: 'ho-lab' }, h('div', { class: 'ho-col' }, ck.el, h('div', { class: 'ho-digbox' }, h('small', null, 'Affichage digital'), dg), mots), h('div', { class: 'ho-col' }, title, txt,
    h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: () => go(k - 1) }, '← Précédent'), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ho-next', onclick: () => go(k + 1) }, 'Suivant →')),
    h('div', { class: 'actions wrap' }, h('button', { class: 'btn small', type: 'button', onclick: () => { ck.add(5); show(...ck.get()); Sfx.tap(); } }, '+5 min'), h('button', { class: 'btn small', type: 'button', onclick: () => { ck.add(60); show(...ck.get()); Sfx.tap(); } }, '+1 heure')))));
  go(0);
}

// ---------- 2. manipuler les aiguilles ----------
function manipuler(body, talk) {
  const dg = h('div', { class: 'ho-dig' }), mots = h('div', { class: 'ho-mots' }), msg = h('p', { class: 'prompt' });
  let target = null, pm = false, snap = 5, n = 0;
  const ck = clock({ size: 300, hh: GR().read && !GR().awake ? 3 : 9, mm: 0, drag: true, onChange: ([H, M], moving) => { const HH = pm ? (H % 12) + 12 : H % 12; dg.textContent = dig(HH, M); mots.textContent = enMots(H, M); if (!moving && target) check(H, M); if (!moving) grimoireCheck(H, M, talk); } });
  const check = (H, M) => { if ((H % 12) === (target[0] % 12) && M === target[1]) { star(); Sfx.ok(); n++; msg.textContent = `✅ Bravo ! ${n}/5`; talk('Bravo ! C’est exactement ça !', false); if (n >= 5) { Sfx.win(); burst(body); msg.textContent = '🏅 Bravo, tu sais placer les aiguilles !'; target = null; return; } setTimeout(nouveau, 1200); } };
  const nouveau = () => { const mm = n < 2 ? [0, 30][ri(0, 1)] : n < 4 ? [15, 45, 30][ri(0, 2)] : ri(1, 11) * 5; target = [ri(1, 12), mm]; msg.textContent = `🎯 Place les aiguilles sur : ${enMots(target[0], target[1])} (${dig(target[0], target[1])})`; talk('Place les aiguilles sur ' + enMots(target[0], target[1]), false); };
  ck.add(0);
  body.replaceChildren(h('div', { class: 'ho-lab' }, h('div', { class: 'ho-col' }, ck.el, h('p', { class: 'muted' }, '👆 Fais tourner les aiguilles avec ton doigt : la petite aiguille suit toute seule !')),
    h('div', { class: 'ho-col' }, h('div', { class: 'ho-digbox' }, h('small', null, 'Affichage digital'), dg), mots,
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn small', type: 'button', onclick: () => ck.add(-60) }, '−1 h'), h('button', { class: 'btn small', type: 'button', onclick: () => ck.add(-5) }, '−5 min'), h('button', { class: 'btn small', type: 'button', onclick: () => ck.add(5) }, '+5 min'), h('button', { class: 'btn small', type: 'button', onclick: () => ck.add(60) }, '+1 h')),
      h('label', { class: 'ho-pm' }, h('input', { type: 'checkbox', onchange: (e) => { pm = e.target.checked; ck.add(0); } }), ' 🌇 C’est l’après-midi (affichage de 13 h à 23 h)'),
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ho-defi', onclick: () => { n = 0; nouveau(); } }, '🎯 Défi : place les aiguilles')), msg)));
  void snap; talk('Fais tourner les aiguilles et regarde l’affichage digital changer.');
}

// ---------- 3. les questions par niveaux ----------
const NIV = [[1, '🕐 Heures piles', [0]], [2, '🕧 Et demie', [0, 30]], [3, '🕒 Et quart', [0, 15, 30]], [4, '🕘 Moins le quart', [15, 30, 45]], [5, '🖐️ De 5 en 5', null], [6, '🔍 À la minute près', 'min']];
function quiz(body, talk, lvl) {
  const st = ST(); lvl = lvl || Math.min(st.lvl, 6);
  const mins = NIV[lvl - 1][2];
  const pickT = () => { const H = ri(1, 12); const M = mins === null ? ri(1, 11) * 5 : mins === 'min' ? ri(1, 59) : mins[ri(0, mins.length - 1)]; return [H, M]; };
  const bar = h('div', { class: 'actions wrap' }, ...NIV.map(([n, l]) => h('button', { class: 'btn small' + (n === lvl ? ' primary' : ''), type: 'button', 'data-testid': 'ho-lv' + n, disabled: n > st.lvl, onclick: () => quiz(body, talk, n) }, n > st.lvl ? '🔒 ' + l.slice(3) : l)));
  const zone = h('div'); let q = 0, ok = 0;
  const same = (a, b) => a[0] % 12 === b[0] % 12 && a[1] === b[1];
  const distract = (t) => { const out = []; const cands = [[t[0] % 12 + 1, t[1]], [t[0], (t[1] + 30) % 60], [((t[1] / 5) || 12), (t[0] % 12) * 5], [t[0] === 1 ? 12 : t[0] - 1, t[1]], [t[0], (t[1] + 15) % 60]]; for (const c of shuffle(cands)) { if (c[0] < 1 || c[0] > 12) continue; if (Array.isArray(mins) && !mins.includes(c[1])) continue; if (!same(c, t) && !out.some((o) => same(o, c))) out.push(c); if (out.length === 2) break; } let k2 = 2; while (out.length < 2) { const c = [((t[0] + k2 - 1) % 12) + 1, t[1]]; if (!out.some((o) => same(o, c))) out.push(c); k2 += 3; } return out; };
  const step = () => {
    if (q >= 6) { const pass = ok >= 5; if (pass && lvl === st.lvl && lvl < 6) { st.lvl = lvl + 1; S.save(); } if (pass) { star(2); Sfx.win(); burst(body); if (lvl >= 4 && Sfx.soundOn()) playFile('assets/voice/horloge_fin.mp3'); }
      zone.replaceChildren(h('p', { class: 'prompt' }, `${ok}/6 ${pass ? (lvl < 6 ? '— niveau suivant débloqué ! 🎉' : '— tu es la maîtresse du temps ! 👑') : '— il faut 5 bonnes réponses pour débloquer la suite.'}`), h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: () => quiz(body, talk, lvl) }, '↻ Rejouer'), pass && lvl < 6 ? h('button', { class: 'btn primary', type: 'button', onclick: () => quiz(body, talk, lvl + 1) }, 'Niveau suivant →') : null)); talk(zone.textContent, false); return; }
    const t = pickT(), type = q % 3; q++;
    const answer = (good, why, btn) => { if (good) { ok++; Sfx.ok(); btn.classList.add('ok'); } else { Sfx.ko(); btn.classList.add('ko'); } zone.querySelectorAll('.ho-opt').forEach((b) => { b.disabled = true; }); const p = h('p', { class: 'muted' }, (good ? '✅ ' : '❌ ') + why); zone.append(p, h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ho-qnext', onclick: step }, 'Suivant →'))); talk(why, false); };
    const why = `C’est ${enMots(t[0], t[1])} : ${dig(t[0], t[1])}. La petite aiguille montre l’heure, la grande les minutes.`;
    if (type === 0) {
      const ck = clock({ size: 220, hh: t[0], mm: t[1] }); const opts = shuffle([t, ...distract(t)]);
      zone.replaceChildren(h('p', { class: 'prompt' }, `Quelle heure indique l’horloge ? (${q}/6)`), ck.el, h('div', { class: 'th-choices' }, ...opts.map((o) => h('button', { class: 'choice ho-opt', type: 'button', 'data-k': same(o, t) ? 0 : 1, onclick: (e) => answer(same(o, t), why, e.currentTarget) }, `${dig(o[0], o[1])} — ${enMots(o[0], o[1])}`))));
    } else if (type === 1) {
      const opts = shuffle([t, ...distract(t)]);
      zone.replaceChildren(h('p', { class: 'prompt' }, `Quelle horloge indique ${dig(t[0], t[1])} (${enMots(t[0], t[1])}) ? (${q}/6)`), h('div', { class: 'ho-mini' }, ...opts.map((o) => { const c = clock({ size: 140, hh: o[0], mm: o[1] }); return h('button', { class: 'ho-opt ho-mcard', type: 'button', 'data-k': same(o, t) ? 0 : 1, onclick: (e) => answer(same(o, t), why, e.currentTarget) }, c.el); })));
    } else {
      const pm = Math.random() < 0.5, H24 = pm ? (t[0] % 12) + 12 : t[0];
      const opts = shuffle([[t[0], t[1]], ...distract(t)]);
      zone.replaceChildren(h('p', { class: 'prompt' }, `L’horloge digitale affiche ${dig(H24, t[1])}. Comment dit-on cette heure ? (${q}/6)`), h('div', { class: 'ho-digbox big' }, h('small', null, pm ? '🌇 après-midi' : '🌅 matin'), h('div', { class: 'ho-dig' }, dig(H24, t[1]))),
        h('div', { class: 'th-choices' }, ...opts.map((o) => h('button', { class: 'choice ho-opt', type: 'button', 'data-k': same(o, t) ? 0 : 1, onclick: (e) => answer(same(o, t), `${dig(H24, t[1])}, c’est ${enMots(t[0], t[1])}${pm ? ' de l’après-midi (on enlève 12 : ' + H24 + ' − 12 = ' + (H24 - 12) + ')' : ' du matin'}.`, e.currentTarget) }, enMots(o[0], o[1])))));
    }
  };
  body.replaceChildren(bar, zone); step();
  talk(`Niveau ${lvl} : ${NIV[lvl - 1][1].slice(3)}.`, false);
}

let greeted = false;
export function open(tab = 'decouverte') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['decouverte', '🔭 Découvrir l’horloge', decouverte], ['manipuler', '👆 Manipuler les aiguilles', manipuler], ['quiz', '🎯 Lire l’heure (6 niveaux)', quiz]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'ho-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ho-panel' }, UI.closeButton(), h('h2', null, '🕰️ La Grande Horloge du Temps'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'La Grande Horloge', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  if (!greeted && Sfx.soundOn()) { greeted = true; playFile('assets/voice/horloge_intro.mp3'); setTimeout(() => go(tab), 10); } else go(tab);
}
