// Le Grand Théâtre des Harmonies (éducation culturelle et artistique, évaluation P4 doc 11) :
// piano magique, familles d'instruments (vrais sons enregistrés), ostinato, vocabulaire de la scène,
// interactions corporelles de la danse et atelier d'art « la nuit » (symétrie / asymétrie).
// Échantillons d'instruments : tonejs-instruments (licence MIT).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { asset } from './asset.js';
import { SCENES } from './scenes.js';
import { burst, shuffle, ri, qcm } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const pick = (a) => a[ri(0, a.length - 1)];
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };

// ---------- les instruments ----------
export const INST = {
  piano: { file: 'piano', base: 60, n: 'le piano', ic: '🎹', fam: 'cordophone', sous: 'cordes frappées', why: 'Ses cordes sont frappées par de petits marteaux quand on appuie sur les touches.' },
  violon: { file: 'violin', base: 60, n: 'le violon', ic: '🎻', fam: 'cordophone', sous: 'cordes frottées', why: 'On frotte ses cordes avec un archet.' },
  violoncelle: { file: 'cello', base: 60, n: 'le violoncelle', ic: '🎻', fam: 'cordophone', sous: 'cordes frottées', why: 'Un grand violon qu’on tient entre les jambes : on frotte ses cordes avec un archet. Son son est grave.' },
  harpe: { file: 'harp', base: 69, n: 'la harpe', ic: '🪕', fam: 'cordophone', sous: 'cordes pincées', why: 'On pince ses cordes avec les doigts.' },
  guitare: { file: 'guitar-acoustic', base: 60, n: 'la guitare', ic: '🎸', fam: 'cordophone', sous: 'cordes pincées', why: 'On pince ou on gratte ses cordes.' },
  flute: { file: 'flute', base: 72, n: 'la flûte traversière', ic: '🪈', fam: 'aérophone', sous: 'les bois', why: 'On souffle dedans : c’est le souffle (l’air) qui fait le son.' },
  clarinette: { file: 'clarinet', base: 62, n: 'la clarinette', ic: '🎷', fam: 'aérophone', sous: 'les bois', why: 'On souffle dans une anche en roseau : c’est un instrument à vent de la famille des bois.' },
  saxophone: { file: 'saxophone', base: 60, n: 'le saxophone', ic: '🎷', fam: 'aérophone', sous: 'les bois', why: 'Même s’il est en métal, il a une anche comme la clarinette : il fait partie des bois !' },
  trompette: { file: 'trumpet', base: 67, n: 'la trompette', ic: '🎺', fam: 'aérophone', sous: 'les cuivres', why: 'On fait vibrer ses lèvres dans l’embouchure : c’est un cuivre.' },
  cor: { file: 'french-horn', base: 60, n: 'le cor', ic: '📯', fam: 'aérophone', sous: 'les cuivres', why: 'Un long tuyau de métal enroulé : on y souffle en faisant vibrer les lèvres. C’est un cuivre.' },
  tuba: { file: 'tuba', base: 62, n: 'le tuba', ic: '🎺', fam: 'aérophone', sous: 'les cuivres', why: 'Le plus grave des cuivres.' },
  xylophone: { file: 'xylophone', base: 79, n: 'le xylophone', ic: '🎼', fam: 'idiophone', sous: 'percussions', why: 'On frappe des lames de bois : c’est l’objet lui-même qui vibre.' },
  tambour: { synth: 'drum', n: 'le tambour', ic: '🥁', fam: 'membranophone', sous: 'percussions', why: 'On frappe une peau tendue (une membrane).' },
  triangle: { synth: 'triangle', n: 'le triangle', ic: '🔺', fam: 'idiophone', sous: 'percussions', why: 'On frappe une barre de métal : c’est l’instrument entier qui vibre.' },
};
const FAMS = { cordophone: 'Cordophones (cordes)', 'aérophone': 'Aérophones (on souffle)', membranophone: 'Membranophones (peau tendue)', idiophone: 'Idiophones (l’objet vibre)' };
let ctx = null; const bufs = {};
function ac() { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; } catch (e) { return null; } }
const soundOn = () => S.get().settings.sound !== false;
function load(f) { const a = ac(); if (!a) return Promise.resolve(null); if (!bufs[f]) bufs[f] = fetch(asset(`assets/sfx/inst/${f}.mp3`)).then((r) => r.arrayBuffer()).then((b) => new Promise((ok, ko) => a.decodeAudioData(b, ok, ko))).catch(() => null); return bufs[f]; }
export function preload(keys = Object.keys(INST)) { keys.forEach((k) => INST[k].file && load(INST[k].file)); }
// joue une note (midi) sur un instrument ; t = délai en secondes ; dur = durée
export function play(k, midi = 60, t = 0, dur = 0.9, vol = 0.8) {
  if (!soundOn()) return; const a = ac(); if (!a) return; const I = INST[k], t0 = a.currentTime + t;
  if (I.synth === 'drum') { const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(140, t0); o.frequency.exponentialRampToValueAtTime(55, t0 + 0.3); g.gain.setValueAtTime(0.9 * vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45); o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + 0.5); return; }
  if (I.synth === 'triangle') { [1, 2.76, 5.4].forEach((m, i) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 1320 * m; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.12 * vol / (i + 1), t0 + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6); o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + 1.7); }); return; }
  load(I.file).then((buf) => {
    if (!buf) return; const s = a.createBufferSource(), g = a.createGain(), st = Math.max(a.currentTime, t0);
    s.buffer = buf; s.playbackRate.value = Math.pow(2, (midi - I.base) / 12);
    g.gain.setValueAtTime(vol, st); g.gain.setValueAtTime(vol, st + dur); g.gain.exponentialRampToValueAtTime(0.001, st + dur + 0.25);
    s.connect(g); g.connect(a.destination); s.start(st); s.stop(st + dur + 0.3);
  });
}
const tune = (k) => { const m = { piano: [60, 64, 67, 72], violon: [67, 69, 71, 72], violoncelle: [48, 52, 55, 60], harpe: [69, 72, 76, 81], guitare: [52, 55, 59, 64], flute: [72, 74, 76, 79], clarinette: [62, 64, 66, 67], saxophone: [60, 62, 64, 67], trompette: [67, 72, 76, 79], cor: [55, 60, 64, 67], tuba: [38, 43, 46, 50], xylophone: [79, 83, 86, 91] }[k]; if (!m) { [0, 0.45, 0.9].forEach((t) => play(k, 60, t)); return; } m.forEach((n, i) => play(k, n, i * 0.42, 0.5)); };

// ---------- 1. le piano magique ----------
const KEYS = [['do', 60], ['ré', 62], ['mi', 64], ['fa', 65], ['sol', 67], ['la', 69], ['si', 71], ['do', 72]];
function piano(body, talk) {
  preload(['piano']);
  let seq = [], pos = 0, mode = 'libre', level = 0;
  const colors = ['#ff5a6a', '#ff9a3a', '#ffd84a', '#3ee08f', '#3fa9ff', '#7a6aff', '#c86bff', '#ff6fc8'];
  const keyEls = KEYS.map(([n, m], i) => h('button', { class: 'th-key', type: 'button', style: `--c:${colors[i]}`, 'data-testid': 'th-key', onpointerdown: (e) => { e.preventDefault(); hit(i); } }, h('span', null, n)));
  const glow = (i) => { keyEls[i].classList.add('on'); setTimeout(() => keyEls[i].classList.remove('on'), 280); };
  const info = h('p', { class: 'prompt' }, 'Joue librement sur le piano magique, ou lance le jeu « Répète la mélodie » !');
  function hit(i) {
    play('piano', KEYS[i][1], 0, 0.6); glow(i);
    if (mode !== 'jeu') return;
    if (i === seq[pos]) { pos++; if (pos === seq.length) { level++; star(); Sfx.coin(); info.textContent = `Bravo ! Mélodie de ${seq.length} notes réussie.`; talk(info.textContent, false); setTimeout(round, 1300); } }
    else { mode = 'libre'; Sfx.tap(); info.textContent = `Oups ! Tu as réussi ${level} mélodie${level > 1 ? 's' : ''}. Rejoue quand tu veux.`; talk(info.textContent, false); if (level >= 4) burst(body); }
  }
  function round() { seq.push(ri(0, 7)); pos = 0; mode = 'ecoute'; info.textContent = `Écoute bien… (${seq.length} note${seq.length > 1 ? 's' : ''})`; seq.forEach((k, j) => setTimeout(() => { play('piano', KEYS[k][1], 0, 0.5); glow(k); }, 700 + j * 600)); setTimeout(() => { mode = 'jeu'; info.textContent = 'À toi : rejoue la même mélodie !'; }, 700 + seq.length * 600); }
  const songs = [['Frère Jacques', [0, 1, 2, 0, 0, 1, 2, 0, 2, 3, 4, 2, 3, 4]], ['Au clair de la lune', [0, 0, 0, 1, 2, 1, 0, 2, 1, 1, 0]]];
  body.replaceChildren(info, h('div', { class: 'th-piano' }, ...keyEls), h('div', { class: 'actions wrap' },
    h('button', { class: 'btn primary', type: 'button', 'data-testid': 'th-simon', onclick: () => { seq = []; level = 0; round(); talk('Écoute la mélodie, puis rejoue-la. Elle s’allonge à chaque fois !', false); } }, '🎵 Répète la mélodie'),
    ...songs.map(([n, s]) => h('button', { class: 'btn small', type: 'button', onclick: () => { mode = 'libre'; s.forEach((k, j) => setTimeout(() => { play('piano', KEYS[k][1], 0, 0.45); glow(k); }, j * 480)); talk(`Écoute : ${n}. Regarde les touches qui s’allument et essaie de la rejouer !`, false); } }, `▶ ${n}`))));
  talk('Voici le piano magique ! Chaque touche a sa couleur et sa note : do, ré, mi, fa, sol, la, si, do.');
}


// ---------- 1 bis. La partition magique (initiation à la lecture musicale, 4 niveaux) ----------
// Contenu (morceaux, motifs, rythmes) séparé de l'affichage (portée SVG, clavier) et de la logique (niveaux).
const PCOL = ['#ff5a6a', '#ff9a3a', '#ffd84a', '#3ee08f', '#3fa9ff', '#7a6aff', '#c86bff', '#ff6fc8'];
const SONGS = {
  lune: { n: 'Au clair de la lune', notes: [0, 0, 0, 1, 2, 1, 0, 2, 1, 1, 0], d: [1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2] },
  jacques: { n: 'Frère Jacques', notes: [0, 1, 2, 0, 0, 1, 2, 0, 2, 3, 4, 2, 3, 4], d: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2] },
};
const RHY = [['ta ta ta ta', [1, 1, 1, 1]], ['ta ti-ti ta ta', [1, 0.5, 0.5, 1, 1]], ['ti-ti ti-ti ta ta', [0.5, 0.5, 0.5, 0.5, 1, 1]], ['ta ta ti-ti ta', [1, 1, 0.5, 0.5, 1]], ['ti-ti ta ti-ti ta', [0.5, 0.5, 1, 0.5, 0.5, 1]]];
const NS2 = 'http://www.w3.org/2000/svg';
const sv2 = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS2, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };
// portée : do (0) sous la portée avec une ligne supplémentaire ; chaque note monte d'un demi-interligne
function staff(notes, { durs = null, labels = true } = {}) {
  const gap = 14, top = 30, W = Math.max(260, 70 + notes.length * 46), H = 150, yOf = (i) => top + 4 * gap - (i - 2) * (gap / 2);
  const s = sv2('svg', { viewBox: `0 0 ${W} ${H}`, class: 'th-staff' });
  for (let l = 0; l < 5; l++) s.append(sv2('line', { x1: 10, x2: W - 10, y1: top + l * gap, y2: top + l * gap, class: 'th-sl' }));
  s.append(sv2('text', { x: 14, y: top + 4 * gap + 6, class: 'th-clef' }, '𝄞'));
  const heads = notes.map((n, k) => {
    const x = 70 + k * 46, y = yOf(n), half = durs && durs[k] >= 2, g = sv2('g', { class: 'th-note', 'data-k': k });
    if (n === 0 || n === 7 && false) g.append(sv2('line', { x1: x - 13, x2: x + 13, y1: yOf(0), y2: yOf(0), class: 'th-sl' }));
    g.append(sv2('ellipse', { cx: x, cy: y, rx: 9, ry: 7, transform: `rotate(-20 ${x} ${y})`, fill: half ? '#fffdf5' : PCOL[n], stroke: PCOL[n], 'stroke-width': half ? 3 : 1.5 }));
    g.append(sv2('line', { x1: x + 8, x2: x + 8, y1: y, y2: y - 34, stroke: '#3b2a12', 'stroke-width': 2 }));
    if (labels) g.append(sv2('text', { x, y: H - 8, class: 'th-nl', fill: PCOL[n] }, KEYS[n][0]));
    s.append(g); return g;
  });
  return { svg: s, heads };
}
function rhythmSvg(r) {
  const W = 40 + r.length * 40, s = sv2('svg', { viewBox: `0 0 ${W} 70`, class: 'th-rhy' }); let x = 24;
  for (let i = 0; i < r.length; i++) {
    if (r[i] === 0.5 && r[i + 1] === 0.5) { [x, x + 30].forEach((xx) => { s.append(sv2('ellipse', { cx: xx, cy: 52, rx: 8, ry: 6, fill: '#3b2a12' })); s.append(sv2('line', { x1: xx + 7, x2: xx + 7, y1: 52, y2: 16, stroke: '#3b2a12', 'stroke-width': 2 })); }); s.append(sv2('line', { x1: x + 7, x2: x + 37, y1: 16, y2: 16, stroke: '#3b2a12', 'stroke-width': 6 })); x += 70; i++; }
    else { s.append(sv2('ellipse', { cx: x, cy: 52, rx: 8, ry: 6, fill: '#3b2a12' })); s.append(sv2('line', { x1: x + 7, x2: x + 7, y1: 52, y2: 16, stroke: '#3b2a12', 'stroke-width': 2 })); x += 40; }
  }
  s.setAttribute('viewBox', `0 0 ${x} 70`); return s;
}
const clap = (t) => play('tambour', 60, t, 0.2, 0.7);
function partition(body, talk, lvl) {
  preload(['piano']);
  const P = () => { const b = S.get(); b.partition = b.partition || { lvl: 1 }; return b.partition; };
  const unlocked = () => P().lvl;
  const up = (n) => { if (P().lvl < n) { P().lvl = n; S.save(); } };
  const levels = [[1, '👂 1. Écouter la partition'], [2, '🎹 2. Essayer moi-même'], [3, '🔁 3. Motif et rythme'], [4, '🎚️ 4. Grave ou aigu']];
  lvl = lvl || Math.min(unlocked(), 4);
  const lvBtns = h('div', { class: 'actions wrap th-levels' }, ...levels.map(([n, l]) => h('button', { class: 'btn small' + (n === lvl ? ' primary' : ''), type: 'button', 'data-testid': 'th-lv' + n, disabled: n > unlocked(), onclick: () => partition(body, talk, n) }, n > unlocked() ? '🔒 ' + l.slice(3) : l)));
  const sheet = h('div', { class: 'th-sheet' }), info = h('p', { class: 'prompt' }), zone = h('div');
  const keyEls = KEYS.map(([n], i) => h('button', { class: 'th-key', type: 'button', style: `--c:${PCOL[i]}`, 'data-testid': 'th-pkey', onpointerdown: (e) => { e.preventDefault(); onKey(i); } }, h('span', null, n)));
  const glow = (i, ms = 300) => { keyEls[i].classList.add('on'); setTimeout(() => keyEls[i].classList.remove('on'), ms); };
  const sparkle = () => { const n = h('span', { class: 'th-fly' }, ['♪', '♫', '♩', '✨'][ri(0, 3)]); n.style.left = ri(10, 90) + '%'; sheet.append(n); setTimeout(() => n.remove(), 1800); };
  let onKey = (i) => { play('piano', KEYS[i][1], 0, 0.6); glow(i); };
  const kb = h('div', { class: 'th-piano' }, ...keyEls);
  const playSeq = (notes, durs, heads, beat = 0.5, done) => { let t = 0; notes.forEach((n, k) => { const d = (durs ? durs[k] : 1) * beat; setTimeout(() => { play('piano', KEYS[n][1], 0, d * 0.95); glow(n, d * 900); heads && heads.forEach((hd, j) => hd.classList.toggle('cur', j === k)); sparkle(); }, t * 1000); t += d; }); setTimeout(() => { heads && heads.forEach((hd) => hd.classList.remove('cur')); done && done(); }, t * 1000 + 200); };
  body.replaceChildren(h('p', { class: 'muted' }, '🎼 La musique s’écrit sur une PORTÉE de 5 lignes. Plus une note est HAUTE sur la portée, plus son son est AIGU.'), lvBtns, info, sheet, kb, zone);

  if (lvl === 1) {
    let song = SONGS.lune; const draw = () => { const st = staff(song.notes, { durs: song.d }); sheet.replaceChildren(h('div', { class: 'th-title' }, `🎵 ${song.n}`), st.svg); return st; };
    let st = draw();
    info.textContent = 'Niveau 1 : écoute la partition et suis les notes qui s’allument. Les notes blanches durent plus longtemps.';
    zone.replaceChildren(h('div', { class: 'actions wrap' },
      h('button', { class: 'btn primary', type: 'button', 'data-testid': 'th-pplay', onclick: () => playSeq(song.notes, song.d, st.heads, 0.5, () => { up(2); star(); talk('Bravo, tu as suivi toute la partition ! Le niveau 2 est débloqué : à toi de jouer !'); lvBtns.replaceWith(partitionLevels()); }) }, '▶ Jouer la partition'),
      ...Object.values(SONGS).map((sg) => h('button', { class: 'btn small', type: 'button', onclick: () => { song = sg; st = draw(); } }, sg.n))));
    talk('Voici une partition. Touche « Jouer la partition » et suis les notes avec tes yeux.');
  } else if (lvl === 2) {
    let len = 2, seq = [], pos = 0, st, done = 0;
    const round = () => { seq = Array.from({ length: len }, () => ri(0, 7)); pos = 0; st = staff(seq); sheet.replaceChildren(h('div', { class: 'th-title' }, `🎯 Joue ces ${len} notes`), st.svg); info.textContent = `Niveau 2 : lis la partition et joue les ${len} notes sur le clavier. (${done + 1}/5)`; talk(`Lis les notes et joue-les : ${seq.map((n) => KEYS[n][0]).join(', ')}.`, false); };
    onKey = (i) => { play('piano', KEYS[i][1], 0, 0.6); glow(i); if (i === seq[pos]) { st.heads[pos].classList.add('ok'); pos++; sparkle(); if (pos === seq.length) { done++; star(); Sfx.coin(); if (done >= 5) { up(3); Sfx.win(); burst(body); info.textContent = 'Bravo ! Tu sais lire et jouer une petite partition. Niveau 3 débloqué !'; talk(info.textContent); return; } len = Math.min(4, 2 + Math.floor(done / 2)); setTimeout(round, 900); } } else { Sfx.tap(); st.heads[pos].classList.add('hint'); setTimeout(() => st.heads[pos] && st.heads[pos].classList.remove('hint'), 700); talk(`Regarde bien la note n°${pos + 1} : c’est ${KEYS[seq[pos]][0]}. Sa couleur t’aide !`, false); } };
    zone.replaceChildren(h('div', { class: 'actions' }, h('button', { class: 'btn small', type: 'button', onclick: () => playSeq(seq, null, st.heads, 0.55) }, '👂 Écouter le modèle')));
    round();
  } else if (lvl === 3) {
    let k = 0, ok = 0;
    const MOTIFS = [[[0, 1, 2, 0], [0, 1, 2, 0, 0, 1, 2, 0]], [[2, 3, 4], [2, 3, 4, 2, 3, 4]], [[4, 2, 4, 2], [4, 2, 4, 2, 4, 2, 4, 2]], [[0, 0, 4, 4], [0, 0, 4, 4, 0, 0, 4, 4]]];
    const step = () => {
      if (k >= 4) { if (ok >= 3) { up(4); Sfx.win(); burst(body); info.textContent = `Super ! ${ok}/4. Niveau 4 débloqué !`; } else info.textContent = `${ok}/4 : rejoue pour débloquer le niveau 4 (3 bonnes réponses).`; talk(info.textContent); zone.replaceChildren(h('button', { class: 'btn', type: 'button', onclick: () => partition(body, talk, 3) }, '↻ Rejouer')); return; }
      if (k % 2 === 0) {
        const [mot, full] = MOTIFS[ri(0, MOTIFS.length - 1)], st = staff(full);
        sheet.replaceChildren(h('div', { class: 'th-title' }, '🔁 Quel motif se répète ?'), st.svg);
        const fake = shuffle(MOTIFS.filter((m) => m[0] !== mot)).slice(0, 2).map((m) => m[0]);
        info.textContent = 'Niveau 3 : écoute la mélodie et trouve le petit MOTIF qui se répète.';
        zone.replaceChildren(h('div', { class: 'actions' }, h('button', { class: 'btn small', type: 'button', onclick: () => playSeq(full, null, st.heads, 0.45) }, '👂 Écouter')), h('div', { class: 'th-choices' }, ...shuffle([mot, ...fake]).map((m) => h('button', { class: 'choice', type: 'button', 'data-k': m === mot ? 0 : 1, onclick: () => { if (m === mot) { ok++; star(); Sfx.coin(); talk('Oui ! Ce motif se répète : on appelle ça un motif répétitif, comme un ostinato.', false); } else { Sfx.tap(); talk(`Non, le motif qui revient est : ${mot.map((n) => KEYS[n][0]).join(' ')}.`, false); } k++; setTimeout(step, 1800); } }, ...m.map((n) => h('b', { style: `color:${PCOL[n]}` }, KEYS[n][0] + ' '))))));
        playSeq(full, null, st.heads, 0.45);
      } else {
        const r = RHY[ri(0, RHY.length - 1)], fake = shuffle(RHY.filter((x) => x !== r)).slice(0, 2);
        sheet.replaceChildren(h('div', { class: 'th-title' }, '🥁 Quel rythme entends-tu ?'), h('p', { class: 'muted' }, '♩ = « ta » (un temps) · ♫ = « ti-ti » (deux notes rapides dans un temps)'));
        const listen = () => { let t = 0; r[1].forEach((d) => { clap(t); t += d * 0.5; }); };
        info.textContent = 'Niveau 3 : écoute le rythme frappé sur le tambour et choisis la bonne écriture.';
        zone.replaceChildren(h('div', { class: 'actions' }, h('button', { class: 'btn small', type: 'button', 'data-testid': 'th-rlisten', onclick: listen }, '👂 Écouter le rythme')), h('div', { class: 'th-choices' }, ...shuffle([r, ...fake]).map((x) => h('button', { class: 'choice th-rchoice', type: 'button', 'data-k': x === r ? 0 : 1, onclick: () => { if (x === r) { ok++; star(); Sfx.coin(); talk(`Oui ! C’était « ${r[0]} ».`, false); } else { Sfx.tap(); talk(`Non, c’était « ${r[0]} ».`, false); } k++; setTimeout(step, 1800); } }, rhythmSvg(x[1]), h('small', null, x[0])))));
        listen();
      }
    };
    step();
  } else {
    let k = 0, ok = 0;
    const pairs = () => { let a = ri(0, 7), b = ri(0, 7); while (Math.abs(a - b) < 3) b = ri(0, 7); return [a, b]; };
    const step = () => {
      if (k >= 4) return guided();
      const [a, b] = pairs(), st = staff([a, b], { labels: false });
      sheet.replaceChildren(h('div', { class: 'th-title' }, '🎚️ Grave ou aigu ?'), st.svg);
      info.textContent = `Niveau 4 : écoute les deux notes. La 2e est-elle plus AIGUË ou plus GRAVE que la 1re ? (${k + 1}/4)`;
      const ans = (hi) => { const good = (b > a) === hi; if (good) { ok++; star(); Sfx.coin(); } else Sfx.tap(); talk(good ? 'Oui ! Et regarde : sur la portée, la note aiguë est plus haute.' : `Non : la 2e note était plus ${b > a ? 'aiguë' : 'grave'}. Regarde sa place sur la portée !`, false); k++; setTimeout(step, 1700); };
      zone.replaceChildren(h('div', { class: 'actions' }, h('button', { class: 'btn small', type: 'button', onclick: () => playSeq([a, b], null, st.heads, 0.7) }, '👂 Réécouter')), h('div', { class: 'th-choices' }, h('button', { class: 'choice', type: 'button', 'data-k': b > a ? 0 : 1, onclick: () => ans(true) }, '⬆️ Plus aiguë'), h('button', { class: 'choice', type: 'button', 'data-k': b > a ? 1 : 0, onclick: () => ans(false) }, '⬇️ Plus grave')));
      playSeq([a, b], null, st.heads, 0.7);
    };
    const guided = () => {
      const sg = SONGS.jacques, st = staff(sg.notes, { durs: sg.d }); let pos = 0;
      sheet.replaceChildren(h('div', { class: 'th-title' }, `🎵 Rejoue « ${sg.n} » !`), st.svg);
      info.textContent = 'Dernière étape : joue la mélodie en suivant la note qui brille sur la partition et la touche qui s’allume.';
      const hint = () => { st.heads.forEach((hd, j) => hd.classList.toggle('cur', j === pos)); keyEls.forEach((e, i) => e.classList.toggle('next', i === sg.notes[pos])); };
      onKey = (i) => { play('piano', KEYS[i][1], 0, 0.6); glow(i); if (i !== sg.notes[pos]) { Sfx.tap(); return; } st.heads[pos].classList.add('ok'); pos++; sparkle(); if (pos >= sg.notes.length) { keyEls.forEach((e) => e.classList.remove('next')); st.heads.forEach((hd) => hd.classList.remove('cur')); up(5); star(3); Sfx.win(); burst(body); burst(body); info.textContent = 'Bravo, petite musicienne ! Tu as lu et joué toute la partition !'; talk('Bravo, petite musicienne ! Tu as lu et joué toute la partition !'); if (Sfx.soundOn()) playVoice('assets/voice/concert_fin.mp3'); return; } hint(); };
      zone.replaceChildren(); hint(); talk('Joue la mélodie de Frère Jacques en suivant la note qui brille.', false);
    };
    step();
  }
  function partitionLevels() { return h('div', { class: 'actions wrap th-levels' }, ...levels.map(([n, l]) => h('button', { class: 'btn small' + (n === lvl ? ' primary' : ''), type: 'button', 'data-testid': 'th-lv' + n, disabled: n > unlocked(), onclick: () => partition(body, talk, n) }, n > unlocked() ? '🔒 ' + l.slice(3) : l))); }
}
const playVoice = (u) => { try { const a = ac(); if (!a) return; fetch(asset(u)).then((r) => r.arrayBuffer()).then((b) => new Promise((ok, ko) => a.decodeAudioData(b, ok, ko))).then((buf) => { const s = a.createBufferSource(); s.buffer = buf; s.connect(a.destination); s.start(); }).catch(() => {}); } catch (e) { /* sans son */ } };

// ---------- 2. les familles d'instruments ----------
function familles(body, talk) {
  preload();
  const keys = Object.keys(INST);
  const tabs = h('div', { class: 'actions wrap' }), zone = h('div');
  const go = (k) => { [...tabs.children].forEach((b) => b.classList.toggle('primary', b.dataset.k === k)); ({ decouvrir, ecoute, trier })[k](); };
  tabs.append(...[['decouvrir', '👂 Découvrir'], ['ecoute', '🎧 Quel instrument ?'], ['trier', '🗂️ Trier par famille']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-k': k, 'data-testid': 'th-f-' + k, onclick: () => go(k) }, l)));
  body.replaceChildren(tabs, zone);
  function decouvrir() {
    zone.replaceChildren(h('p', { class: 'muted' }, 'Touche un instrument pour l’écouter et découvrir sa famille.'),
      ...Object.entries(FAMS).map(([f, fn]) => h('div', { class: 'th-fam' }, h('h4', null, fn), h('div', { class: 'th-cards' }, ...keys.filter((k) => INST[k].fam === f).map((k) => h('button', { class: 'th-card', type: 'button', 'data-testid': 'th-card', onclick: () => { tune(k); const I = INST[k]; talk(`${I.n[0].toUpperCase() + I.n.slice(1)} : ${f}, ${I.sous}. ${I.why}`); } }, h('span', null, INST[k].ic), INST[k].n.replace(/^(le |la |l’)/, '')))))));
    talk('Les instruments sont rangés en quatre grandes familles, selon ce qui vibre : une corde, l’air, une peau tendue, ou l’objet lui-même.');
  }
  function ecoute() {
    const list = shuffle(keys).slice(0, 6).map((k) => {
      const others = shuffle(keys.filter((x) => x !== k && INST[x].fam !== INST[k].fam)).slice(0, 2);
      return Math.random() < 0.5
        ? { q: '🎧 Écoute (bouton ▶). Quel instrument joue ?', k, opts: [INST[k].n, ...others.map((x) => INST[x].n)], why: `C’était ${INST[k].n} (${INST[k].sous}).` }
        : { q: '🎧 Écoute (bouton ▶). À quelle famille appartient cet instrument ?', k, opts: [FAMS[INST[k].fam], ...shuffle(Object.keys(FAMS).filter((f) => f !== INST[k].fam)).slice(0, 2).map((f) => FAMS[f])], why: `C’était ${INST[k].n} : ${INST[k].fam}. ${INST[k].why}` };
    });
    list.forEach((it) => { it.pic = () => { setTimeout(() => tune(it.k), 300); return h('button', { class: 'btn primary th-play', type: 'button', 'data-testid': 'th-play', onclick: () => tune(it.k) }, '▶ Réécouter'); }; });
    zone.replaceChildren(); qcm(zone, talk, list, (o) => zone.append(h('div', { class: 'actions' }, h('span', { class: 'muted' }, `${o}/${list.length}`), h('button', { class: 'btn primary', type: 'button', onclick: ecoute }, '↻ Encore'))));
  }
  function trier() {
    const pool = shuffle(keys).slice(0, 8); let i = 0, ok = 0;
    const card = h('div', { class: 'th-sort-card' }), res = h('p', { class: 'muted' });
    const bins = Object.entries(FAMS).map(([f, fn]) => h('button', { class: 'th-bin', type: 'button', 'data-testid': 'th-bin', onclick: () => {
      const k = pool[i]; if (!k) return;
      if (INST[k].fam === f) { ok++; star(); Sfx.coin(); talk(`Oui ! ${INST[k].why}`, false); } else { Sfx.tap(); talk(`Non : ${INST[k].n} est un ${INST[k].fam}. ${INST[k].why}`, false); }
      i++; setTimeout(show, 1800);
    } }, fn));
    const show = () => {
      if (i >= pool.length) { card.replaceChildren(h('b', null, `${ok}/${pool.length} bien rangés !`)); if (ok >= 6) { Sfx.win(); burst(body); } return; }
      const k = pool[i]; card.replaceChildren(h('span', { class: 'th-big' }, INST[k].ic), h('b', null, INST[k].n), h('button', { class: 'btn small', type: 'button', onclick: () => tune(k) }, '▶ Écouter')); tune(k);
    };
    zone.replaceChildren(h('p', { class: 'prompt' }, 'Range chaque instrument dans sa famille.'), card, h('div', { class: 'th-bins' }, ...bins), res);
    show();
  }
  go('decouvrir');
}

// ---------- 3. l'ostinato ----------
function ostinato(body, talk) {
  preload(['piano', 'flute', 'xylophone', 'violoncelle', 'violon', 'clarinette']);
  const pent = [60, 62, 64, 67, 69, 72, 74, 76];
  const melody = (n) => Array.from({ length: n }, () => pick(pent));
  function extrait(kind) { // renvoie une fonction qui joue l'extrait (8 temps)
    const mel = melody(16), beat = 0.32, instM = pick(['flute', 'violon', 'clarinette']), bassI = pick(['violoncelle', 'piano']);
    const motif = [pick([48, 50, 53, 55]), pick([55, 57, 60]), pick([48, 53, 55]), pick([55, 60])];
    return () => {
      mel.forEach((n, i) => play(instM, n, i * beat, beat * 0.9, 0.55));
      if (kind === 'ostinato') for (let r = 0; r < 4; r++) motif.forEach((n, j) => play(bassI, n, (r * 4 + j) * beat, beat * 0.9, 0.75));
      if (kind === 'libre') melody(16).forEach((n, i) => play(bassI, n - 12, i * beat, beat * 0.9, 0.6));
      return 16 * beat;
    };
  }
  let round = 0, ok = 0; const N = 4;
  const head = h('p', { class: 'prompt' }), zone = h('div');
  const demo = () => { const m = [55, 60, 57, 60]; for (let r = 0; r < 4; r++) m.forEach((n, j) => play('xylophone', n + 24, (r * 4 + j) * 0.32, 0.28, 0.6)); talk('Écoute : le même petit motif se répète, encore et encore, sans s’arrêter. C’est un ostinato !', false); };
  body.replaceChildren(h('div', { class: 'th-def' }, h('b', null, 'Un ostinato'), ' : un petit motif musical (rythme ou mélodie) qui se répète sans arrêt pendant le morceau.', h('button', { class: 'btn small', type: 'button', onclick: demo }, '▶ Exemple')), head, zone);
  function setup() {
    if (round >= N) { head.textContent = `Bravo ! ${ok} ostinatos trouvés sur ${N}.`; talk(head.textContent); zone.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => ostinato(body, talk) }, '↻ Recommencer')); if (ok >= 3) { Sfx.win(); burst(body); } return; }
    const kinds = shuffle(['ostinato', 'libre', 'seul']), ex = kinds.map((k) => extrait(k)), heard = new Set();
    head.textContent = `Écoute les 3 extraits. Dans lequel entends-tu un ostinato ? (${round + 1}/${N})`;
    talk('Écoute les trois extraits. Dans lequel entends-tu un ostinato, un motif qui se répète ?');
    zone.replaceChildren(h('div', { class: 'th-extraits' }, ...ex.map((f, i) => h('div', { class: 'th-ex' },
      h('button', { class: 'btn', type: 'button', 'data-testid': 'th-ex-play', onclick: (e) => { heard.add(i); const b = e.currentTarget; b.classList.add('playing'); const d = f(); setTimeout(() => b.classList.remove('playing'), d * 1000); } }, `▶ Extrait ${i + 1}`),
      h('button', { class: 'choice', type: 'button', 'data-k': kinds[i] === 'ostinato' ? 0 : 1, onclick: () => {
        if (heard.size < 3) { talk('Écoute d’abord les trois extraits !', false); return; }
        if (kinds[i] === 'ostinato') { ok++; star(); Sfx.win(); talk(`Oui ! Dans l’extrait ${i + 1}, le même motif revient sans arrêt.`, false); } else { Sfx.tap(); talk(`Non, c’était l’extrait ${kinds.indexOf('ostinato') + 1}.`, false); }
        round++; setTimeout(setup, 2400);
      } }, 'C’est celui-ci !')))));
  }
  setup();
}

// ---------- 4. la scène ----------
const ZONES = [
  { k: 'avant', n: 'l’avant-scène', d: 'la partie de la scène la plus proche du public, devant le rideau', r: [0.12, 0.66, 0.88, 0.76] },
  { k: 'jardin', n: 'le côté jardin', d: 'le côté GAUCHE de la scène quand on la regarde depuis la salle', r: [0.13, 0.42, 0.36, 0.66] },
  { k: 'cour', n: 'le côté cour', d: 'le côté DROIT de la scène quand on la regarde depuis la salle', r: [0.64, 0.42, 0.87, 0.66] },
  { k: 'fond', n: 'le fond de scène (le lointain)', d: 'la partie de la scène la plus éloignée du public', r: [0.38, 0.3, 0.62, 0.62] },
  { k: 'coulisses', n: 'les coulisses', d: 'derrière les rideaux, sur les côtés : le public ne les voit pas', r: [0, 0.05, 0.12, 0.72], r2: [0.88, 0.05, 1, 0.72] },
  { k: 'salle', n: 'la salle (le public)', d: 'l’endroit où s’assoient les spectateurs', r: [0, 0.8, 1, 1] },
];
function scene(body, talk) {
  let mode = 'decouvrir', target = null, round = 0, ok = 0; const N = 6;
  const svg = sv('svg', { viewBox: '0 0 1000 565', class: 'th-stage' });
  svg.append(sv('image', { href: asset(SCENES.theatre.img), x: 0, y: 0, width: 1000, height: 565 }));
  const gz = sv('g'); svg.append(gz);
  const head = h('p', { class: 'prompt' }), act = h('div', { class: 'actions wrap' });
  ZONES.forEach((z) => [z.r, z.r2].filter(Boolean).forEach(([x0, y0, x1, y1]) => {
    const r = sv('rect', { x: x0 * 1000, y: y0 * 565, width: (x1 - x0) * 1000, height: (y1 - y0) * 565, class: 'th-zone', 'data-z': z.k, 'data-testid': 'th-zone' });
    r.addEventListener('click', () => tap(z, r)); gz.append(r);
  }));
  const flash = (k, cls) => gz.querySelectorAll(`[data-z="${k}"]`).forEach((r) => { r.classList.add(cls); setTimeout(() => r.classList.remove(cls), 1500); });
  function tap(z) {
    if (mode === 'decouvrir') { flash(z.k, 'show'); talk(`Ici, c’est ${z.n} : ${z.d}.`); return; }
    if (!target) return;
    if (z.k === target.k) { ok++; star(); Sfx.coin(); flash(z.k, 'good'); talk(`Oui, c’est ${z.n} !`, false); } else { Sfx.tap(); flash(target.k, 'show'); talk(`Non, ça c’est ${z.n}. ${target.n[0].toUpperCase() + target.n.slice(1)}, c’est ${target.d}.`, false); }
    target = null; round++; setTimeout(ask, 2200);
  }
  function ask() {
    if (round >= N) { head.textContent = `Bravo ! ${ok}/${N} : tu connais la scène comme une actrice !`; talk(head.textContent); mode = 'decouvrir'; if (ok >= 5) { Sfx.win(); burst(body); } return; }
    target = pick(ZONES); head.textContent = `Touche ${target.n}. (${round + 1}/${N})`; talk(`Touche ${target.n}.`);
  }
  act.append(h('button', { class: 'btn small primary', type: 'button', onclick: () => { mode = 'decouvrir'; head.textContent = 'Touche une partie du théâtre pour découvrir son nom.'; } }, '🔎 Découvrir'),
    h('button', { class: 'btn small', type: 'button', 'data-testid': 'th-scene-defi', onclick: () => { mode = 'defi'; round = 0; ok = 0; ask(); } }, '🎯 Défi'),
    h('span', { class: 'muted ws-memo' }, 'Astuce : vu de la salle, J (jardin) est à gauche et C (cour) à droite, comme les initiales J.C.'));
  head.textContent = 'Touche une partie du théâtre pour découvrir son nom.';
  body.replaceChildren(head, h('div', { class: 'dr-wrap' }, svg), act);
  talk('Bienvenue sur la scène ! Touche les différentes parties du théâtre pour apprendre leur nom.');
}

// ---------- 5. la danse : interactions entre danseurs (éveil artistique P4) ----------
// Deux danseuses articulées (Maissa en rose, Soumaya en bleu) montrent 9 façons de danser ensemble ;
// puis « À toi de danser » propose de vrais défis à faire à deux, avec un compte à rebours en musique.
const MOVES = [
  { k: 'unisson', n: 'l’unisson', d: 'Les deux danseuses font exactement le même geste, en même temps, du même côté.', defi: 'Avec Soumaya (ou Papa), faites tous les deux les mêmes gestes en même temps. Choisissez qui donne le départ !' },
  { k: 'miroir', n: 'le miroir', d: 'Face à face, l’une fait le reflet de l’autre : si l’une lève le bras droit, l’autre lève le bras gauche.', defi: 'Mettez-vous face à face : l’une invente des gestes lents, l’autre est son reflet dans le miroir.' },
  { k: 'canon', n: 'le canon', d: 'Elles font le même mouvement, mais l’une commence un peu après l’autre, comme dans une chanson en canon.', defi: 'L’une fait un geste, l’autre le refait juste après, comme un écho. Puis on enchaîne 4 gestes !' },
  { k: 'question', n: 'la question-réponse', d: 'Une danseuse bouge pendant que l’autre est immobile, puis elle s’arrête et l’autre lui « répond » en dansant.', defi: 'Chacune son tour : l’une danse 4 temps (question), puis se fige ; l’autre répond 4 temps.' },
  { k: 'meneur', n: 'la meneuse et la suiveuse', d: 'La meneuse se déplace et invente le chemin ; la suiveuse la suit partout en copiant ses gestes.', defi: 'L’une marche en dansant dans la pièce, l’autre la suit comme son ombre. Puis on échange !' },
  { k: 'rencontre', n: 'la rencontre', d: 'Les danseuses partent de loin et se rapprochent jusqu’à se retrouver au centre.', defi: 'Partez chacune d’un coin de la pièce et avancez en dansant jusqu’à vous retrouver au milieu.' },
  { k: 'separation', n: 'la séparation', d: 'Elles partent ensemble du centre et s’éloignent l’une de l’autre.', defi: 'Partez dos à dos au centre, puis éloignez-vous lentement en dansant, chacune de son côté.' },
  { k: 'contact', n: 'le contact', d: 'Les danseuses dansent en se touchant : paume contre paume, dos contre dos ou épaule contre épaule.', defi: 'Posez vos paumes l’une contre l’autre et bougez ensemble sans jamais vous lâcher.' },
  { k: 'contraste', n: 'le contraste', d: 'Les deux danseuses font des mouvements opposés : l’une en haut et rapide, l’autre en bas et lente.', defi: 'L’une danse en haut, sur la pointe des pieds et vite ; l’autre danse en bas, accroupie et très lentement.' },
];
function dancer(color, dress) {
  const g = sv('g'), L = (cls, w) => sv('line', { class: cls, stroke: color, 'stroke-width': w, 'stroke-linecap': 'round' });
  const parts = { body: L('db', 11), ua: L('ua', 8), la: L('la', 7), ub: L('ub', 8), lb: L('lb', 7), ul: L('ul', 9), ll: L('ll', 8), um: L('um', 9), lm: L('lm', 8),
    head: sv('circle', { r: 15, fill: '#f4c9a8', stroke: color, 'stroke-width': 3 }), hair: sv('path', { fill: '#5a3420' }), skirt: sv('path', { fill: dress, opacity: 0.95 }) };
  g.append(parts.ul, parts.ll, parts.um, parts.lm, parts.skirt, parts.body, parts.ua, parts.la, parts.ub, parts.lb, parts.hair, parts.head);
  g._p = parts; return g;
}
// pose : x, y (sol), lean (inclinaison), crouch (0..1), a1/a2 = bras gauche (épaule, coude), b1/b2 = bras droit, l/r = jambes
function pose(g, P, face) {
  const p = g._p, f = face, cy = P.y - 20 + P.crouch * 22, hipX = P.x, hipY = cy, sh = { x: hipX + P.lean * 10, y: hipY - 56 + P.crouch * 6 };
  const seg = (el, a, b) => { el.setAttribute('x1', a.x); el.setAttribute('y1', a.y); el.setAttribute('x2', b.x); el.setAttribute('y2', b.y); };
  const pol = (o, len, ang) => ({ x: o.x + Math.cos(ang) * len * f, y: o.y + Math.sin(ang) * len });
  seg(p.body, { x: hipX, y: hipY }, sh);
  const e1 = pol(sh, 24, P.a1), h1 = pol(e1, 22, P.a1 + P.a2); seg(p.ua, sh, e1); seg(p.la, e1, h1);
  const e2 = pol(sh, 24, Math.PI - P.b1), h2 = pol(e2, 22, Math.PI - P.b1 - P.b2); seg(p.ub, sh, e2); seg(p.lb, e2, h2);
  const kn = 26 - P.crouch * 8;
  const k1 = { x: hipX - 8 * f + P.l * 14 * f, y: hipY + kn }, k2 = { x: hipX + 8 * f + P.r * 14 * f, y: hipY + kn };
  seg(p.ul, { x: hipX - 4 * f, y: hipY }, k1); seg(p.ll, k1, { x: k1.x - P.crouch * 10 * f, y: P.y });
  seg(p.um, { x: hipX + 4 * f, y: hipY }, k2); seg(p.lm, k2, { x: k2.x + P.crouch * 10 * f, y: P.y });
  p.head.setAttribute('cx', sh.x + P.lean * 4); p.head.setAttribute('cy', sh.y - 18);
  p.hair.setAttribute('d', `M${sh.x - 16} ${sh.y - 18} q${16} -24 ${32} 0 q2 18 -4 28 q-12 -14 -24 0 q-6 -10 -4 -28z`);
  p.skirt.setAttribute('d', `M${hipX - 9} ${hipY - 14} L${hipX + 9} ${hipY - 14} L${hipX + 20} ${hipY + 12} L${hipX - 20} ${hipY + 12} Z`);
}
const BASE = { x: 0, y: 165, lean: 0, crouch: 0, a1: 0.9, a2: 0.4, b1: 0.9, b2: 0.4, l: 0, r: 0 };
// une phrase de danse (4 temps) : u ∈ [0,1[
const phrase = (u) => { const s = Math.sin(u * Math.PI * 2), c = Math.cos(u * Math.PI * 2);
  return { a1: -0.9 + s * 1.1, a2: 0.3 + c * 0.4, b1: 0.6 - s * 0.9, b2: 0.2, lean: s * 0.5, l: Math.max(0, s) * 0.8, r: Math.max(0, -s) * 0.8, crouch: (1 - c) * 0.15 }; };
function danceAt(kind, t) {
  const u = (t / 3) % 1, beat = Math.floor(t / 1.5) % 2, F = phrase(u);
  let A = { ...BASE, ...F, x: 140 }, B = { ...BASE, ...F, x: 260 }, fa = 1, fb = 1;
  if (kind === 'miroir') { fb = -1; B = { ...BASE, ...F, x: 260, lean: -F.lean }; }
  if (kind === 'canon') { B = { ...BASE, ...phrase(((t - 0.75) / 3) % 1), x: 260 }; }
  if (kind === 'question') { const fig = (x) => ({ ...BASE, x, a1: -0.2, a2: -0.6, b1: -0.2, b2: -0.6 }); if (beat === 0) B = fig(260); else A = fig(140); fb = -1; }
  if (kind === 'meneur') { const px = 200 + Math.sin(t * 0.9) * 120, py = 165; A = { ...BASE, ...F, x: px, y: py }; B = { ...BASE, ...phrase(((t - 0.6) / 3) % 1), x: 200 + Math.sin((t - 0.7) * 0.9) * 120 - 50 * Math.sign(Math.cos(t * 0.9) || 1), y: py }; fa = Math.cos(t * 0.9) >= 0 ? 1 : -1; fb = fa; }
  if (kind === 'rencontre') { const p = Math.min(1, (t % 5) / 3.5); A.x = 50 + p * 115; B.x = 350 - p * 115; fb = -1; if (p >= 1) { A = { ...A, a1: -0.6, a2: 0 }; B = { ...B, a1: -0.6, a2: 0 }; } }
  if (kind === 'separation') { const p = Math.min(1, (t % 5) / 3.5); A.x = 180 - p * 125; B.x = 220 + p * 125; fa = -1; }
  if (kind === 'contact') { A = { ...BASE, x: 178, lean: Math.sin(t * 2) * 0.3, a1: -0.1 + Math.sin(t * 2) * 0.25, a2: 0, crouch: 0.15 + Math.sin(t * 2) * 0.12 }; B = { ...A, x: 222 }; fb = -1; }
  if (kind === 'contraste') { const fast = phrase((t / 0.9) % 1); A = { ...BASE, ...fast, x: 140, a1: -1.3 + Math.sin(t * 7) * 0.5, b1: -1.2, y: 158, crouch: 0 }; B = { ...BASE, ...phrase((t / 7) % 1), x: 260, crouch: 0.9, a1: 0.6, b1: 0.6 }; }
  return { A, B, fa, fb };
}
function stage() {
  const svg = sv('svg', { viewBox: '0 0 400 210', class: 'th-dance' });
  const defs = sv('defs'); const gr = sv('radialGradient', { id: 'spot', cx: '50%', cy: '0%', r: '90%' }); gr.append(sv('stop', { offset: '0', 'stop-color': '#fff6c8', 'stop-opacity': '0.55' }), sv('stop', { offset: '1', 'stop-color': '#fff6c8', 'stop-opacity': '0' })); defs.append(gr);
  svg.append(defs, sv('rect', { x: 0, y: 0, width: 400, height: 210, fill: 'url(#spot)' }), sv('path', { d: 'M0 0 Q40 90 18 210 L0 210Z M400 0 Q360 90 382 210 L400 210Z', fill: '#9a1030' }), sv('rect', { x: 0, y: 168, width: 400, height: 42, fill: '#6a3a2a' }), sv('ellipse', { cx: 200, cy: 170, rx: 170, ry: 8, fill: '#ffffff18' }));
  const A = dancer('#c2186b', '#ff6fc8'), B = dancer('#1565c0', '#7cc8ff'); svg.append(A, B);
  const ta = sv('text', { x: 10, y: 22, fill: '#ff9fd6', 'font-size': 13, 'font-weight': 700 }); ta.textContent = '● Maissa'; const tb = sv('text', { x: 10, y: 40, fill: '#9fd3ff', 'font-size': 13, 'font-weight': 700 }); tb.textContent = '● Soumaya'; svg.append(ta, tb);
  let raf = 0, kind = 'unisson';
  const run = (k) => { kind = k; cancelAnimationFrame(raf); const t0 = performance.now(); const step = (now) => { if (!svg.isConnected && now - t0 > 500) return; const { A: pa, B: pb, fa, fb } = danceAt(kind, (now - t0) / 1000); pose(A, pa, fa); pose(B, pb, fb); raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); };
  return { svg, run, stop: () => cancelAnimationFrame(raf) };
}
function danse(body, talk) {
  let stg = null;
  const tabs = h('div', { class: 'actions wrap' }), zone = h('div');
  const T = [['voir', '👀 Découvrir', voir], ['quiz', '🔎 Reconnais', quiz], ['defi', '🕺 À toi de danser', defi]];
  const go = (k) => { if (stg) stg.stop(); Voice.stop(); [...tabs.children].forEach((b, i) => b.classList.toggle('primary', T[i][0] === k)); T.find((x) => x[0] === k)[2](); };
  tabs.append(...T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'da-' + k, onclick: () => go(k) }, l)));
  body.replaceChildren(h('p', { class: 'prompt' }, '💃 Danser à deux, c’est inventer des façons de bouger ensemble : on les appelle des interactions.'), tabs, zone);
  function voir() {
    stg = stage(); const info = h('div', { class: 'ea-step' });
    const show = (m) => { stg.run(m.k); info.replaceChildren(h('b', null, '✨ ' + m.n[0].toUpperCase() + m.n.slice(1)), h('p', null, m.d)); talk(`${m.n}. ${m.d}`); };
    zone.replaceChildren(h('div', { class: 'dr-wrap' }, stg.svg), h('div', { class: 'actions wrap' }, ...MOVES.map((m) => h('button', { class: 'btn small', type: 'button', onclick: () => show(m) }, m.n))), info);
    show(MOVES[0]);
  }
  function quiz() {
    stg = stage(); let round = 0, ok = 0; const N = 6, Q = shuffle(MOVES.slice()).slice(0, N);
    const head = h('p', { class: 'tb-q', style: 'font-size:clamp(16px,2.4vw,20px)' }), act = h('div', { class: 'answers' });
    zone.replaceChildren(head, h('div', { class: 'dr-wrap' }, stg.svg), act);
    const setup = () => {
      if (round >= N) { stg.stop(); head.textContent = `Bravo ! ${ok}/${N} interactions reconnues.`; talk(head.textContent); act.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: quiz }, '↻ Recommencer')); if (ok >= 5) { Sfx.win(); burst(body); star(2); } return; }
      const m = Q[round]; stg.run(m.k);
      head.textContent = `Regarde Maissa et Soumaya. Quelle interaction font-elles ? (${round + 1}/${N})`; talk('Regarde bien. Quelle interaction font-elles ?');
      const opts = shuffle([m, ...shuffle(MOVES.filter((x) => x !== m)).slice(0, 3)]);
      act.replaceChildren(...opts.map((x) => h('button', { class: 'choice', type: 'button', 'data-k': x === m ? 0 : 1, onclick: () => { if (x === m) { ok++; star(); Sfx.win(); talk(`Oui, c’est ${m.n} ! ${m.d}`, false); } else { Sfx.tap(); talk(`Non, c’est ${m.n} : ${m.d}`, false); } round++; setTimeout(setup, 2800); } }, x.n)));
    };
    setup();
  }
  function defi() {
    const m = pick(MOVES); stg = stage(); stg.run(m.k);
    const cnt = h('b', { class: 'da-count' }, '20'); let tm = 0;
    const startBtn = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'da-go', onclick: () => {
      clearInterval(tm); let n = 20; cnt.textContent = n; talk('Prêtes ? C’est parti !');
      tm = setInterval(() => { if (!zone.isConnected) { clearInterval(tm); return; } n--; cnt.textContent = n; Sfx.tap(); if (n <= 0) { clearInterval(tm); Sfx.win(); burst(body); star(1); talk('Bravo les danseuses ! Saluez votre public !'); } }, 1000);
    } }, '▶ Lancer 20 secondes');
    zone.replaceChildren(h('div', { class: 'ea-step' }, h('b', null, `🕺 Défi : ${m.n}`), h('p', null, m.defi), h('p', { class: 'muted' }, '👀 Regarde l’exemple, puis levez-vous et dansez pour de vrai !')),
      h('div', { class: 'dr-wrap' }, stg.svg), h('div', { class: 'actions wrap' }, startBtn, cnt, h('button', { class: 'btn', type: 'button', onclick: defi }, '🎲 Un autre défi')));
    talk(`Défi : ${m.n}. ${m.defi}`);
  }
  go('voir');
}

// ---------- 6. l'atelier d'art « la nuit » ----------
function art(body, talk) {
  const W = 360, cv = h('canvas', { class: 'th-art', width: W * 2, height: W * 2, 'data-testid': 'th-art' }), c = cv.getContext('2d');
  c.fillStyle = '#10163a'; c.fillRect(0, 0, 2 * W, 2 * W);
  let tool = 'sym', col = '#ffe36b', sticker = '⭐', last = null;
  const axis = h('div', { class: 'th-axis' });
  const pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 2 * W, (e.clientY - r.top) / r.height * 2 * W]; };
  cv.addEventListener('pointerdown', (e) => {
    const p = pt(e); cv.setPointerCapture(e.pointerId);
    if (tool === 'stk') { c.font = `${ri(50, 90)}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sticker, p[0], p[1]); Sfx.bloop(); return; }
    last = p;
  });
  cv.addEventListener('pointermove', (e) => {
    if (!last || tool !== 'sym') return; const p = pt(e);
    c.strokeStyle = col; c.lineWidth = 14; c.lineCap = 'round';
    [[last, p], [[2 * W - last[0], last[1]], [2 * W - p[0], p[1]]]].forEach(([a, b]) => { c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke(); });
    last = p;
  });
  cv.addEventListener('pointerup', () => { last = null; });
  const toolBtns = [['sym', '✂️ Forme symétrique'], ['stk', '✨ Coller des éléments']].map(([k, l]) => h('button', { class: 'btn small' + (k === tool ? ' primary' : ''), type: 'button', 'data-testid': 'th-tool-' + k, onclick: () => { tool = k; toolBtns.forEach((b) => b.classList.toggle('primary', b === toolBtns[k === 'sym' ? 0 : 1])); axis.style.opacity = k === 'sym' ? 1 : 0; talk(k === 'sym' ? 'Dessine d’un côté de l’axe : la forme apparaît en miroir de l’autre côté. C’est une forme symétrique, comme quand on découpe un papier plié !' : 'Maintenant, colle la lune, les étoiles et la chouette où tu veux : les deux côtés ne sont plus pareils, c’est asymétrique.', false); } }, l));
  const cols = ['#ffe36b', '#c86bff', '#3fa9ff', '#ffffff', '#ff9a3a'].map((cc) => h('button', { class: 'mi-col', type: 'button', style: `background:${cc}`, 'aria-label': 'couleur', onclick: () => { col = cc; } }));
  const stks = ['⭐', '🌙', '🦉', '✨', '🌟', '☁️'].map((s) => h('button', { class: 'btn small ghost', type: 'button', onclick: () => { sticker = s; tool = 'stk'; toolBtns[1].click(); } }, s));
  const done = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'th-art-done', onclick: () => {
    let url = ''; try { const sm = document.createElement('canvas'); sm.width = sm.height = 240; sm.getContext('2d').drawImage(cv, 0, 0, 240, 240); url = sm.toDataURL('image/jpeg', 0.7); } catch (e) { url = ''; }
    const b = S.get(); b.art = b.art || []; if (url) { b.art.unshift({ url, at: Date.now() }); b.art = b.art.slice(0, 6); } S.save(); star(2); Sfx.win(); burst(body);
    talk('Magnifique œuvre ! Ta forme est symétrique, et les éléments collés sont disposés de façon asymétrique. Elle est rangée dans ta galerie d’art.');
    gal();
  } }, '🖼️ J’ai fini mon œuvre');
  const galBox = h('div', { class: 'th-gal' });
  const gal = () => galBox.replaceChildren(...(S.get().art || []).map((a) => h('img', { src: a.url, alt: 'Œuvre', class: 'th-thumb' })));
  body.replaceChildren(h('p', { class: 'prompt' }, 'Crée une œuvre sur le thème de la nuit : une forme symétrique, puis des éléments collés de façon asymétrique.'),
    h('div', { class: 'mi-lab' }, h('div', { class: 'th-artw' }, cv, axis), h('div', { class: 'mi-side' }, h('div', { class: 'actions wrap' }, ...toolBtns), h('div', { class: 'actions wrap' }, ...cols), h('div', { class: 'actions wrap' }, ...stks), h('div', { class: 'actions wrap' }, done, h('button', { class: 'btn small', type: 'button', onclick: () => art(body, talk) }, '↺ Nouvelle feuille')), h('button', { class: 'btn', type: 'button', 'data-testid': 'th-moitie', onclick: () => moitie(body, talk) }, '🪞 Défi : dessine toi-même l’autre moitié'), galBox)));
  gal();
  talk('Atelier d’art : dessine une forme symétrique de chaque côté de l’axe, puis colle des éléments de la nuit.');
}


// ---------- 6 bis. la moitié magique : compléter une figure par symétrie (quadrillage) ----------
const MOITIE = [
  ['Le papillon', ['............', '.pp......pp.', 'pppp....pppp', 'pyyp.bb.pyyp', 'pyyppbbppyyp', '.pppbbbbppp.', '..pp.bb.pp..', '.ppp.bb.ppp.', '.pp..bb..pp.', '............']],
  ['La maison', ['.....rr.....', '....rrrr....', '...rrrrrr...', '..rrrrrrrr..', '.rrrrrrrrrr.', '..wwwwwwww..', '..wbwwwwbw..', '..wbwoowbw..', '..wwwoowww..', '..wwwoowww..']],
  ['Le sapin de la nuit', ['.....yy.....', '....gggg....', '...gggggg...', '....gggg....', '...gggggg...', '..gggggggg..', '...gggggg...', '..gggggggg..', '.gggggggggg.', '.....oo.....', '.....oo.....']],
  ['La fusée', ['.....rr.....', '....rwwr....', '....wwww....', '....wbbw....', '....wbbw....', '....wwww....', '...rwwwwr...', '..rr.oo.rr..', '.....yy.....', '....y..y....']],
  ['La chouette', ['..o......o..', '..oo....oo..', '..oooooooo..', '.owwoooowwo.', '.owyooooywo.', '.owwoooowwo.', '..oooyyooo..', '..owwwwwwo..', '..owwwwwwo..', '...oo..oo...', '..yy....yy..']],
  ['Le château', ['b.b.b..b.b.b', 'bbbbb..bbbbb', 'bbbbbbbbbbbb', 'bbybbbbbbybb', 'bbbbbbbbbbbb', 'bbbbbyybbbbb', 'bbbbyyyybbbb', 'bbbbyyyybbbb']],
];
const MCOL = { p: ['#c86bff', 'violet'], y: ['#ffe36b', 'jaune'], b: ['#3f7bff', 'bleu'], r: ['#ff5a5a', 'rouge'], w: ['#ffffff', 'blanc'], o: ['#ff9a3a', 'orange'], g: ['#3fc46a', 'vert'] };
function moitie(body, talk, n = 0) {
  const [name, rows] = MOITIE[n % MOITIE.length], R = rows.length, C = 12, half = C / 2;
  const used = [...new Set(rows.join('').replace(/\./g, ''))];
  let col = used[0], painting = false;
  const cells = [], cur = rows.map((r) => r.split('').map((ch, x) => (x < half ? ch : '.')));
  const grid = h('div', { class: 'th-mgrid', style: `--c:${C};--r:${R}`, 'data-testid': 'th-mgrid' });
  const paint = (x, y) => { if (x < half) return; cur[y][x] = col; draw(x, y); Sfx.tap(); };
  const draw = (x, y) => { const e = cells[y][x], ch = cur[y][x]; e.style.background = ch === '.' ? '' : MCOL[ch][0]; e.classList.remove('bad', 'miss'); };
  rows.forEach((r, y) => { cells[y] = []; r.split('').forEach((_, x) => {
    const e = h('div', { class: 'th-mc' + (x < half ? ' model' : ' free') + (x === half - 1 ? ' ax' : ''), 'data-x': x, 'data-y': y });
    if (x >= half) {
      e.addEventListener('pointerdown', (ev) => { ev.preventDefault(); painting = true; paint(x, y); });
      e.addEventListener('pointerenter', () => { if (painting) paint(x, y); });
    }
    cells[y][x] = e; grid.append(e); draw(x, y);
  }); });
  const stop = () => { painting = false; }; window.addEventListener('pointerup', stop, { once: false });
  grid.addEventListener('pointermove', (ev) => { if (!painting) return; const t = document.elementFromPoint(ev.clientX, ev.clientY); if (t && t.classList.contains('free')) { const x = +t.dataset.x, y = +t.dataset.y; if (cur[y][x] !== col) paint(x, y); } });
  const pal = h('div', { class: 'actions wrap' }, ...[...used, '.'].map((k) => h('button', { class: 'th-mcol' + (k === col ? ' on' : ''), type: 'button', 'data-k': k, style: k === '.' ? '' : `background:${MCOL[k][0]}`, 'aria-label': k === '.' ? 'gomme' : MCOL[k][1], onclick: (e) => { col = k; pal.querySelectorAll('.th-mcol').forEach((b) => b.classList.toggle('on', b === e.currentTarget)); } }, k === '.' ? '🧽' : '')));
  const msg = h('p', { class: 'muted' });
  let tries = 0;
  const check = () => {
    let bad = 0, miss = 0; tries++;
    rows.forEach((r, y) => r.split('').forEach((ch, x) => { if (x < half) return; const got = cur[y][x]; if (got === ch) return; if (ch === '.' || (got !== '.' && got !== ch)) { cells[y][x].classList.add('bad'); bad++; } else { if (tries >= 2) cells[y][x].classList.add('miss'); miss++; } }));
    if (!bad && !miss) { star(2); Sfx.win(); burst(body); msg.textContent = 'Parfait ! Ta moitié est exactement le reflet de l’autre : la figure est symétrique.'; talk(`Bravo ! ${name} est parfaitement symétrique !`); next.hidden = false; return; }
    Sfx.ko(); msg.textContent = `Presque ! ${miss ? `${miss} case${miss > 1 ? 's' : ''} manquante${miss > 1 ? 's' : ''}${tries >= 2 ? ' (pointillés)' : ''}` : ''}${miss && bad ? ' et ' : ''}${bad ? `${bad} case${bad > 1 ? 's' : ''} en trop ou de la mauvaise couleur (croix)` : ''}. Astuce : compte les cases depuis l’axe, de chaque côté.`;
    talk('Presque ! Compte les cases à partir de l’axe : de chaque côté, la même distance.', false);
  };
  const next = h('button', { class: 'btn primary', type: 'button', hidden: true, 'data-testid': 'th-mnext', onclick: () => moitie(body, talk, n + 1) }, 'Figure suivante →');
  body.replaceChildren(h('p', { class: 'prompt' }, `🪞 ${name} : dessine toi-même l’autre moitié par symétrie (${(n % MOITIE.length) + 1}/${MOITIE.length}).`),
    h('div', { class: 'mi-lab' }, h('div', { class: 'th-mwrap' }, grid), h('div', { class: 'mi-side' },
      h('p', { class: 'muted' }, 'La moitié de gauche est dessinée. L’axe de symétrie est la ligne pointillée. Choisis une couleur et touche les cases de droite (tu peux glisser le doigt). Chaque case doit être à la même distance de l’axe que sa jumelle !'),
      pal, h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'th-mcheck', onclick: check }, '✔️ Vérifier'), next, h('button', { class: 'btn small', type: 'button', onclick: () => moitie(body, talk, n) }, '↺ Effacer'), h('button', { class: 'btn small ghost', type: 'button', onclick: () => art(body, talk) }, '🎨 Atelier libre')), msg)));
  talk(`${name} : la moitié de gauche est dessinée. À toi de dessiner l’autre moitié par symétrie !`);
}

export function open(tab = 'piano') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['piano', '🎹 Piano magique', piano], ['partition', '🎼 La partition magique', partition], ['familles', '🎺 Les familles d’instruments', familles], ['ostinato', '🔁 L’ostinato', ostinato], ['scene', '🎭 La scène', scene], ['danse', '💃 La danse', danse], ['art', '🎨 Atelier d’art', art], ['moitie', '🪞 La moitié magique', moitie]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'th-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel th-panel' }, UI.closeButton(), h('h2', null, '🎭 Le Grand Théâtre des Harmonies'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Théâtre', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
