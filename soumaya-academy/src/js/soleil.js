// Forêt des Mots : les points cardinaux. Panneaux N/S/E/O dans le décor, soleil qui se lève à l'Est, passe au Sud à midi
// et se couche à l'Ouest (lumière du décor qui change, ombre de Soumaya qui tourne), et le jeu « Où est l'Est ? ».
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, qcm } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const CYCLE = 70; // secondes pour une journée complète dans le décor

// panneaux de la forêt : comme sur une carte (Nord en haut, Sud en bas, Est à droite, Ouest à gauche) ;
// le soleil du décor se lève donc à droite (Est) et se couche à gauche (Ouest). La petite fenêtre « ciel » reste vue face au Sud.
// position du soleil pour u ∈ [0,1] (0 = lever à l'Est, à gauche ; 0.5 = midi au Sud, devant ; 1 = coucher à l'Ouest, à droite)
const sunAt = (u) => ({ x: 0.07 + 0.86 * u, y: 0.5 - 0.32 * Math.sin(Math.PI * u) });
const MOMENTS = [[0, 'Le lever du soleil, à l’Est'], [0.25, 'Le matin : le soleil monte'], [0.5, 'Midi : le soleil est au Sud, tout en haut'], [0.75, 'L’après-midi : il descend vers l’Ouest'], [1, 'Le coucher du soleil, à l’Ouest']];

export function mountForest(world, room) {
  const layer = document.createElement('div'); layer.className = 'so-fx'; layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<i class="so-tint"></i><i class="so-sun"><b></b></i>'
    + '<span class="so-board ouest">⬅ OUEST</span><span class="so-board est">EST ➡</span><span class="so-board nord">⬆ NORD</span><span class="so-board sud">⬇ SUD</span>'
    + '<span class="so-rose"><b class="n">N</b><b class="e">E</b><b class="s">S</b><b class="o">O</b><i></i></span>';
  world.append(layer);
  const sun = layer.querySelector('.so-sun'), tint = layer.querySelector('.so-tint');
  let raf = 0, t0 = performance.now() - CYCLE * 1000 * 0.3;
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    const u = ((now - t0) / 1000 / CYCLE) % 1.15; // un petit moment de nuit à la fin
    const night = u > 1, p0 = sunAt(Math.min(1, u)), p = { x: 1 - p0.x, y: p0.y }; // décor : Est à droite
    sun.style.left = p.x * 100 + '%'; sun.style.top = p.y * 100 + '%'; sun.style.opacity = night ? 0 : 1;
    const low = 1 - Math.sin(Math.PI * Math.min(1, u)); // 1 au lever/coucher
    sun.style.setProperty('--c', low > 0.6 ? '#ff9a4a' : '#fff2a0');
    tint.style.background = night ? '#0a1440' : u < 0.5 ? `rgba(255,140,60,${(low * 0.35).toFixed(2)})` : `rgba(255,90,120,${(low * 0.38).toFixed(2)})`;
    tint.style.opacity = night ? 0.55 : 1;
    // l'ombre de Soumaya part à l'opposé du soleil
    if (room.hshadow && !night) room.hshadow.style.transform = `skewX(${((p.x - room.pos.x) * -120).toFixed(0)}deg) scaleX(${(1 + low * 0.8).toFixed(2)})`;
    room.sunU = night ? null : u;
  };
  if (room.motion !== false) raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); layer.remove(); if (room.hshadow) room.hshadow.style.transform = ''; };
}

function miniSky(u) {
  const p = sunAt(u);
  return h('div', { class: 'so-mini' }, h('i', { class: 'so-mini-sun', style: `left:${p.x * 100}%;top:${p.y * 100}%` }),
    h('span', { class: 'so-h l' }, '?'), h('span', { class: 'so-h r' }, '?'), h('div', { class: 'so-ground' }));
}

function decouvrir(body, talk) {
  let k = 0;
  const sky = h('div'), txt = h('div', { class: 'ea-step' }), nav = h('div', { class: 'actions' });
  const show = () => {
    const [u, l] = MOMENTS[k], p = sunAt(u);
    sky.replaceChildren(h('div', { class: 'so-mini' }, h('i', { class: 'so-mini-sun', style: `left:${p.x * 100}%;top:${p.y * 100}%` }), h('span', { class: 'so-h l' }, 'EST'), h('span', { class: 'so-h r' }, 'OUEST'), h('span', { class: 'so-h c' }, 'SUD (devant moi)'), h('div', { class: 'so-ground' })));
    const d = ['Chaque matin, le soleil se lève du côté de l’Est.', 'Il monte dans le ciel en se déplaçant vers le Sud.', 'À midi, il est au plus haut, du côté du Sud. Mon ombre est alors la plus courte… et elle montre le Nord !', 'L’après-midi, il redescend vers l’Ouest. Mon ombre s’allonge.', 'Le soir, il se couche à l’Ouest, sur l’horizon.'][k];
    txt.replaceChildren(h('b', null, l), h('p', null, d)); talk(d);
    nav.replaceChildren(h('button', { class: 'btn', type: 'button', disabled: k === 0, onclick: () => { k--; show(); } }, '◀'), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'so-next', onclick: () => { if (k < 4) { k++; show(); } else astuce(); } }, k < 4 ? 'Avancer la journée ▶' : 'L’astuce des bras ▶'));
  };
  const astuce = () => {
    txt.replaceChildren(h('b', null, '🙆 L’astuce des bras'), h('p', null, 'Tends ton bras droit vers le lever du soleil : c’est l’Est. Ton bras gauche montre l’Ouest. Devant toi, c’est le Nord ; derrière toi, le Sud. Et dans l’ordre des aiguilles d’une montre : N, E, S, O !'));
    talk('Tends ton bras droit vers le lever du soleil : c’est l’Est. Ton bras gauche montre l’Ouest. Devant toi, le Nord, derrière toi, le Sud.');
    sky.replaceChildren(h('div', { class: 'so-arms' }, h('span', { class: 'n' }, '⬆ NORD (devant)'), h('span', { class: 'o' }, '⬅ OUEST (bras gauche)'), h('span', { class: 'e' }, 'EST (bras droit) ➡'), h('span', { class: 's' }, '⬇ SUD (derrière)'), h('span', { class: 'kid' }, '🧍‍♀️')));
    nav.replaceChildren(h('button', { class: 'btn', type: 'button', onclick: () => { k = 0; show(); } }, '↺ Revoir la journée'));
  };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Regarde le voyage du soleil dans le ciel pendant une journée.'), h('p', { class: 'muted' }, '🧭 Sur les panneaux de la forêt, c’est comme sur une carte : le Nord en haut, le Sud en bas, l’Est à droite, l’Ouest à gauche. Ici, dans le ciel, je regarde vers le Sud : l’Est est donc à ma gauche et l’Ouest à ma droite.'), h('div', { class: 'ea-wrap' }, sky, h('div', { class: 'ea-side' }, txt, nav)));
  show();
}

function jeu(body, talk) {
  let n = 0, ok = 0;
  const zone = h('div'), sc = h('p', { class: 'muted' });
  const Q = shuffle([
    { u: 0, q: 'Le soleil se lève. De quel côté est-il ?', a: 'Est' },
    { u: 1, q: 'Le soleil se couche. De quel côté est-il ?', a: 'Ouest' },
    { u: 0.5, q: 'Il est midi, le soleil est tout en haut. De quel côté est-il ?', a: 'Sud' },
    { u: 0.5, q: 'À midi, mon ombre montre…', a: 'Nord' },
    { u: 0.02, q: 'Je regarde le lever du soleil. Derrière moi, c’est…', a: 'Ouest' },
    { u: 0.98, q: 'Je regarde le coucher du soleil. À ma droite, c’est…', a: 'Nord' },
    { u: 0.02, q: 'Je regarde le lever du soleil. À ma gauche, c’est…', a: 'Nord' },
    { u: 0.5, q: 'Je regarde le soleil à midi. Derrière moi, c’est…', a: 'Nord' },
  ]).slice(0, 6);
  const next = () => {
    if (n >= Q.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `Bravo ! ${ok}/${Q.length}`)); star(ok >= 5 ? 2 : 1); if (ok >= 5) { Sfx.win(); burst(body); } return; }
    const E = Q[n++];
    zone.replaceChildren(miniSky(E.u), h('p', { class: 'tb-q', style: 'font-size:clamp(18px,3vw,24px)' }, E.q), h('div', { class: 'actions wrap' }, ...['Nord', 'Est', 'Sud', 'Ouest'].map((d) => h('button', { class: 'btn', type: 'button', 'data-testid': 'so-' + d, onclick: () => {
      if (d === E.a) { ok++; Sfx.ok(); talk(`Oui, ${E.a} !`, false); } else { Sfx.ko(); talk(`Non, c’est l’${E.a === 'Nord' ? 'e Nord' : E.a === 'Sud' ? 'e Sud' : E.a}. Pense à l’astuce des bras !`.replace('l’e ', 'le '), true); }
      sc.textContent = `${n}/${Q.length} · ✔ ${ok}`; setTimeout(next, 1300);
    } }, d))));
    talk(E.q);
  };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Où est l’Est ? Regarde le soleil et trouve la bonne direction.'), zone, sc);
  next();
}

export function open(tab = 'decouvrir') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['decouvrir', '☀️ Le voyage du soleil', decouvrir], ['jeu', '🧭 Où est l’Est ?', jeu]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'so-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ea-panel' }, UI.closeButton(), h('h2', null, '🧭 Le soleil et les points cardinaux'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Le soleil et les points cardinaux', onClose: () => Voice.stop() });
  function go(k) { Voice.stop(); tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
