// Le Sanctuaire du Corps Humain : squelette à toucher et à reconstruire, os et muscles en mouvement,
// mannequin transparent (organes, squelette, muscles), trajet des aliments dans le tube digestif (évaluation P4 doc 7),
// et la galerie des cinq sens.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle, ri, qcm } from './workshop.js';
import { play as playNote, preload } from './theatre.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const pick = (a) => a[ri(0, a.length - 1)];
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); kids.forEach((c) => c != null && e.append(c)); return e; };
const cap = (x1, y1, x2, y2, w) => sv('line', { x1, y1, x2, y2, 'stroke-width': w, 'stroke-linecap': 'round' });

// ---------- le squelette ----------
const BONES = {
  crane: ['le crâne', 'Il protège le cerveau, comme un casque.'],
  machoire: ['la mâchoire', 'Le seul os de la tête qui bouge : il sert à mâcher et à parler.'],
  clavicule: ['la clavicule', 'Elle relie l’épaule au milieu de la poitrine.'],
  cotes: ['les côtes', 'Elles forment une cage qui protège le cœur et les poumons.'],
  colonne: ['la colonne vertébrale', 'Une pile de petits os, les vertèbres : elle nous tient droits et protège la moelle épinière.'],
  bassin: ['le bassin', 'Il relie la colonne vertébrale aux jambes.'],
  humerus: ['l’humérus', 'L’os du bras, entre l’épaule et le coude.'],
  avantbras: ['le radius et le cubitus', 'Les deux os de l’avant-bras, entre le coude et le poignet.'],
  phalanges: ['les phalanges', 'Les petits os des doigts et des orteils.'],
  femur: ['le fémur', 'L’os de la cuisse : c’est le plus long os du corps !'],
  rotule: ['la rotule', 'Un petit os rond devant le genou.'],
  tibia: ['le tibia et le péroné', 'Les deux os de la jambe, entre le genou et la cheville.'],
};
function skeleton({ onTap, hide = [] } = {}) {
  const svg = sv('svg', { viewBox: '0 0 200 450', class: 'co-skel' });
  const g = (id, ...els) => { const grp = sv('g', { class: 'co-bone' + (hide.includes(id) ? ' slot' : ''), 'data-b': id, 'data-testid': 'co-bone' }, ...els); grp.addEventListener('click', (e) => { e.stopPropagation(); onTap && onTap(id, grp); }); svg.append(grp); return grp; };
  g('colonne', ...Array.from({ length: 15 }, (_, i) => sv('rect', { x: 94, y: 72 + i * 11, width: 12, height: 9, rx: 3 })));
  g('cotes', ...[0, 1, 2, 3, 4, 5].map((i) => sv('path', { d: `M100,${100 + i * 13} C${62 - i},${96 + i * 13} ${60 - i},${118 + i * 13} 80,${124 + i * 12} M100,${100 + i * 13} C${138 + i},${96 + i * 13} ${140 + i},${118 + i * 13} 120,${124 + i * 12}`, fill: 'none', 'stroke-width': 5 })));
  g('crane', sv('ellipse', { cx: 100, cy: 36, rx: 25, ry: 28 }), sv('circle', { cx: 91, cy: 38, r: 6, class: 'hole' }), sv('circle', { cx: 109, cy: 38, r: 6, class: 'hole' }));
  g('machoire', sv('path', { d: 'M83,54 Q100,80 117,54 L112,58 Q100,70 88,58 Z' }));
  g('clavicule', cap(70, 92, 96, 88, 6), cap(104, 88, 130, 92, 6));
  g('bassin', sv('path', { d: 'M74,238 Q100,226 126,238 L130,262 Q112,272 100,262 Q88,272 70,262 Z' }));
  g('humerus', cap(66, 98, 58, 168, 9), cap(134, 98, 142, 168, 9));
  g('avantbras', cap(57, 176, 50, 236, 6), cap(63, 176, 58, 238, 5), cap(143, 176, 150, 236, 6), cap(137, 176, 142, 238, 5));
  g('phalanges', ...[44, 49, 54, 59].map((x) => cap(x, 246, x - 2, 266, 3.5)), ...[141, 146, 151, 156].map((x) => cap(x, 246, x + 2, 266, 3.5)), ...[78, 84, 116, 122].map((x) => cap(x, 432, x + (x < 100 ? -6 : 6), 440, 4)));
  g('femur', cap(86, 266, 82, 340, 11), cap(114, 266, 118, 340, 11));
  g('rotule', sv('circle', { cx: 81, cy: 348, r: 6 }), sv('circle', { cx: 119, cy: 348, r: 6 }));
  g('tibia', cap(80, 358, 79, 425, 8), cap(88, 360, 87, 424, 4), cap(120, 358, 121, 425, 8), cap(112, 360, 113, 424, 4));
  return svg;
}
function squelette(body, talk) {
  const tabs = h('div', { class: 'actions wrap' }), zone = h('div');
  body.replaceChildren(tabs, zone);
  const go = (k) => { [...tabs.children].forEach((b) => b.classList.toggle('primary', b.dataset.k === k)); ({ decouvrir, defi, puzzle, mouvement })[k](); };
  tabs.append(...[['decouvrir', '🔎 Découvrir'], ['defi', '🎯 Touche l’os'], ['puzzle', '🧩 Remets les os'], ['mouvement', '💪 Os et muscles']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-k': k, 'data-testid': 'co-s-' + k, onclick: () => go(k) }, l)));
  const flash = (grp, cls = 'on') => { grp.parentNode.querySelectorAll('.co-bone').forEach((b) => b.classList.remove('on', 'good', 'bad')); grp.classList.add(cls); };
  function decouvrir() {
    const info = h('div', { class: 'co-info' }, h('p', null, 'Touche un os pour découvrir son nom.'), h('p', { class: 'muted' }, 'Notre squelette compte 206 os chez l’adulte !'));
    zone.replaceChildren(h('div', { class: 'mi-lab' }, skeleton({ onTap: (id, grp) => { flash(grp); const [n, d] = BONES[id]; info.replaceChildren(h('h3', null, n[0].toUpperCase() + n.slice(1)), h('p', null, d)); talk(`${n} : ${d}`); } }), info));
    talk('Voici le squelette. Touche un os pour découvrir son nom.');
  }
  function defi() {
    let round = 0, ok = 0, target; const N = 8, order = shuffle(Object.keys(BONES));
    const head = h('p', { class: 'prompt' });
    const ask = () => { if (round >= N) { head.textContent = `Bravo ! ${ok}/${N} os trouvés.`; talk(head.textContent); if (ok >= 6) { Sfx.win(); burst(body); } return; } target = order[round]; head.textContent = `Touche ${BONES[target][0]}. (${round + 1}/${N})`; talk(`Touche ${BONES[target][0]}.`); };
    zone.replaceChildren(head, h('div', { class: 'dr-wrap' }, skeleton({ onTap: (id, grp) => {
      if (round >= N) return;
      if (id === target) { ok++; star(); Sfx.coin(); flash(grp, 'good'); talk(`Oui ! ${BONES[id][1]}`, false); } else { Sfx.tap(); flash(grp, 'bad'); talk(`Non, ça c’est ${BONES[id][0]}.`, false); }
      round++; setTimeout(ask, 1800);
    } })));
    ask();
  }
  function puzzle() {
    const miss = shuffle(['crane', 'femur', 'humerus', 'bassin', 'cotes', 'tibia', 'clavicule']).slice(0, 4); let sel = null, done = 0;
    const svg = skeleton({ hide: miss, onTap: (id, grp) => {
      if (!grp.classList.contains('slot')) return;
      if (!sel) { talk('Choisis d’abord un os dans la boîte, puis touche sa place.', false); return; }
      if (sel.dataset.b === id) { grp.classList.remove('slot'); grp.classList.add('good'); sel.remove(); sel = null; done++; Sfx.bloop(); star(); talk(`Bien placé : ${BONES[id][0]} !`, false); if (done === miss.length) { Sfx.win(); burst(body); talk('Bravo ! Le squelette est complet !'); } }
      else { Sfx.tap(); talk('Ce n’est pas sa place. Regarde bien la forme en pointillés !', false); }
    } });
    const tray = h('div', { class: 'co-tray' }, ...shuffle(miss).map((id) => h('button', { class: 'vi-chip', type: 'button', 'data-b': id, 'data-testid': 'co-tray', onclick: (e) => { tray.querySelectorAll('.vi-chip').forEach((b) => b.classList.remove('on')); sel = e.currentTarget; sel.classList.add('on'); Sfx.tap(); } }, '🦴 ' + BONES[id][0])));
    zone.replaceChildren(h('p', { class: 'prompt' }, 'Oh non ! Des os se sont envolés. Choisis un os dans la boîte, puis touche sa place (en pointillés).'), h('div', { class: 'mi-lab' }, svg, tray));
    talk('Des os se sont envolés ! Remets chaque os à sa place.');
  }
  function mouvement() {
    const svg = sv('svg', { viewBox: '0 0 300 220', class: 'co-arm' });
    const fore = sv('g'), biceps = sv('ellipse', { cx: 110, cy: 92, rx: 46, ry: 14, fill: '#e86a6a', opacity: 0.85 });
    svg.append(cap(40, 100, 160, 100, 14), biceps, sv('circle', { cx: 160, cy: 100, r: 10, fill: '#ffd84a' }), fore);
    fore.append(cap(160, 100, 270, 100, 11), sv('circle', { cx: 278, cy: 100, r: 12, fill: '#f2d0b0' }));
    svg.querySelectorAll('line').forEach((l) => { l.setAttribute('stroke', '#f3ecd8'); });
    let ang = 0;
    const set = (a) => { ang = a; fore.setAttribute('transform', `rotate(${-a} 160 100)`); biceps.setAttribute('rx', 46 - a * 0.12); biceps.setAttribute('ry', 14 + a * 0.12); };
    const anim = (to) => { const from = ang, t0 = performance.now(); const st = (now) => { const p = Math.min(1, (now - t0) / 700); set(from + (to - from) * p); if (p < 1) requestAnimationFrame(st); }; requestAnimationFrame(st); };
    const host = h('div');
    zone.replaceChildren(h('p', { class: 'prompt' }, 'Les os ne bougent pas tout seuls : ce sont les MUSCLES qui les tirent, et les ARTICULATIONS qui leur permettent de plier.'), h('div', { class: 'dr-wrap' }, svg),
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'co-plier', onclick: () => { anim(110); talk('Le biceps se contracte : il devient plus court et plus gros, et il tire l’avant-bras. Le bras se plie au niveau du coude, une articulation.', false); } }, '💪 Plier le bras'), h('button', { class: 'btn', type: 'button', onclick: () => { anim(0); talk('Le biceps se relâche : le bras se tend.', false); } }, '↘ Tendre le bras')), host);
    qcm(host, talk, [
      { q: 'Comment s’appelle l’endroit où deux os se rejoignent et peuvent bouger ?', opts: ['une articulation', 'un muscle', 'une vertèbre'], why: 'Le coude, le genou, l’épaule sont des articulations.' },
      { q: 'Qui fait bouger les os ?', opts: ['les muscles', 'la peau', 'le sang'], why: 'Les muscles se contractent et tirent sur les os.' },
      { q: 'Quel est le plus long os du corps ?', opts: ['le fémur', 'le crâne', 'la rotule'], why: 'Le fémur, l’os de la cuisse.' },
    ], () => {});
  }
  go('decouvrir');
}

// ---------- le mannequin transparent ----------
const ORG = {
  cerveau: ['le cerveau', '🧠', 'Le chef du corps : il pense, se souvient, et envoie des messages partout grâce aux nerfs.'],
  poumons: ['les poumons', '🫁', 'Ils font entrer l’air quand on inspire et prennent l’oxygène dont le corps a besoin.'],
  coeur: ['le cœur', '❤️', 'Un muscle qui pompe le sang sans jamais s’arrêter, environ 80 fois par minute chez un enfant.'],
  foie: ['le foie', '🟤', 'Il aide à digérer et nettoie le sang.'],
  estomac: ['l’estomac', '🫃', 'Il malaxe les aliments et les transforme en bouillie.'],
  intestin: ['l’intestin grêle', '〰️', 'Un long tuyau (environ 6 mètres !) où les bons éléments des aliments passent dans le sang.'],
  grosint: ['le gros intestin', '🌀', 'Il récupère l’eau ; ce qui reste devient les selles (les fèces).'],
  reins: ['les reins', '🫘', 'Ils filtrent le sang et fabriquent l’urine.'],
};
function mannequin(body, talk) {
  const svg = sv('svg', { viewBox: '0 0 200 450', class: 'co-man' });
  svg.append(sv('path', { class: 'co-skin', d: 'M100,6 C126,6 132,30 128,52 C126,66 116,72 112,76 L114,86 C140,90 154,96 158,120 L170,230 C172,244 160,246 158,232 L146,140 L142,236 C144,300 140,340 136,430 L112,430 L104,280 L96,280 L88,430 L64,430 C60,340 56,300 58,236 L54,140 L42,232 C40,246 28,244 30,230 L42,120 C46,96 60,90 86,86 L88,76 C84,72 74,66 72,52 C68,30 74,6 100,6 Z' }));
  const skel = skeleton(); skel.classList.add('co-ghost'); const sk = sv('g', { class: 'co-layer-s', opacity: 0 }); [...skel.childNodes].forEach((n) => sk.append(n)); svg.append(sk);
  const mus = sv('g', { class: 'co-layer-m', opacity: 0 }, ...[[62, 100, 50, 230], [138, 100, 150, 230], [80, 250, 80, 420], [120, 250, 120, 420]].map(([a, b, c, d]) => cap(a, b, c, d, 18)), sv('ellipse', { cx: 100, cy: 140, rx: 38, ry: 30 }));
  svg.append(mus);
  const org = sv('g', { class: 'co-layer-o' });
  const add = (id, el) => { const gg = sv('g', { class: 'co-org co-' + id, 'data-o': id, 'data-testid': 'co-org' }, el); gg.addEventListener('click', () => tap(id, gg)); org.append(gg); };
  add('cerveau', sv('ellipse', { cx: 100, cy: 30, rx: 20, ry: 16, fill: '#f6b8d0' }));
  add('poumons', sv('g', {}, sv('ellipse', { cx: 82, cy: 128, rx: 15, ry: 28, fill: '#8fd0ff' }), sv('ellipse', { cx: 118, cy: 128, rx: 15, ry: 28, fill: '#8fd0ff' })));
  add('coeur', sv('path', { d: 'M104,128 c-4,-8 -16,-6 -14,4 c1,6 10,12 14,16 c4,-4 13,-10 14,-16 c2,-10 -10,-12 -14,-4 z', fill: '#e8455a' }));
  add('foie', sv('path', { d: 'M72,162 Q100,152 112,166 Q100,180 72,176 Z', fill: '#9a5a3a' }));
  add('estomac', sv('path', { d: 'M110,166 Q132,160 130,182 Q126,198 108,192 Q118,182 110,166 Z', fill: '#f2a24a' }));
  add('reins', sv('g', {}, sv('ellipse', { cx: 80, cy: 200, rx: 6, ry: 10, fill: '#c0507a' }), sv('ellipse', { cx: 120, cy: 200, rx: 6, ry: 10, fill: '#c0507a' })));
  add('grosint', sv('path', { d: 'M72,250 L72,206 Q100,198 128,206 L128,252', fill: 'none', stroke: '#c88a4a', 'stroke-width': 9 }));
  add('intestin', sv('path', { d: 'M82,214 q8,8 16,0 q8,-8 16,0 q-8,8 -16,8 q-10,0 -14,8 q8,8 16,0 q8,-8 14,2 q-6,10 -18,6 q-10,-2 -14,8', fill: 'none', stroke: '#f2c27a', 'stroke-width': 6, 'stroke-linecap': 'round' }));
  svg.append(org);
  const info = h('div', { class: 'co-info' }, h('p', null, 'Touche un organe pour le découvrir.'));
  function tap(id, gg) { org.querySelectorAll('.co-org').forEach((x) => x.classList.remove('on')); gg.classList.add('on'); const [n, ic, d] = ORG[id]; info.replaceChildren(h('h3', null, `${ic} ${n[0].toUpperCase() + n.slice(1)}`), h('p', null, d)); talk(`${n} : ${d}`); Sfx.tap(); }
  const layer = (k, on) => { svg.querySelector('.co-layer-' + k).setAttribute('opacity', on ? (k === 'o' ? 1 : 0.7) : 0); };
  const toggles = [['o', '🫀 Organes', true], ['s', '🦴 Squelette', false], ['m', '💪 Muscles', false]].map(([k, l, on]) => { const b = h('button', { class: 'btn small' + (on ? ' primary' : ''), type: 'button', 'data-testid': 'co-layer-' + k, onclick: () => { const v = !b.classList.contains('primary'); b.classList.toggle('primary', v); layer(k, v); } }, l); return b; });
  const host = h('div');
  body.replaceChildren(h('div', { class: 'actions wrap' }, ...toggles), h('div', { class: 'mi-lab' }, svg, h('div', { class: 'mi-side' }, info, h('button', { class: 'btn small primary', type: 'button', 'data-testid': 'co-quiz', onclick: () => quiz() }, '🎯 Le défi des organes'), host)));
  talk('Voici le mannequin transparent. Allume ou éteins les organes, le squelette et les muscles, et touche chaque organe.');
  function quiz() { host.replaceChildren(); const keys = shuffle(Object.keys(ORG)).slice(0, 5); qcm(host, talk, keys.map((k) => ({ q: `À quel organe correspond cette description : « ${ORG[k][2]} » ?`, opts: [ORG[k][0], ...shuffle(Object.keys(ORG).filter((x) => x !== k)).slice(0, 2).map((x) => ORG[x][0])], why: `C’est ${ORG[k][0]}.` })), () => {}); }
}

// ---------- la digestion ----------
const DIG = [['👄', 'la bouche', 'Les dents coupent et broient, la salive mouille les aliments.'], ['🟠', 'l’œsophage', 'Un tuyau qui descend de la bouche jusqu’à l’estomac.'], ['🫃', 'l’estomac', 'Il malaxe les aliments et les transforme en bouillie.'], ['〰️', 'l’intestin grêle', 'Les bons éléments passent dans le sang.'], ['🌀', 'le gros intestin', 'L’eau est récupérée ; les déchets forment les excréments. Le mot du docteur : on les appelle les selles, ou les fèces. Elles sortent par l’anus.']];
function digestion(body, talk) {
  const svg = sv('svg', { viewBox: '0 0 200 300', class: 'co-dig' });
  svg.append(sv('path', { class: 'co-skin', d: 'M100,6 C124,6 130,28 126,48 C122,60 114,64 112,68 L114,78 C140,82 156,92 160,116 L160,290 L40,290 L40,116 C44,92 60,82 86,78 L88,68 C86,64 78,60 74,48 C70,28 76,6 100,6 Z' }));
  const tube = 'M100,46 L100,70 L100,120 Q102,130 112,134 Q132,140 128,156 Q122,170 104,166 Q88,172 86,186 q10,10 22,0 q12,-10 22,2 q-8,14 -26,10 q-14,-2 -18,10 q10,10 24,2 L130,214 Q132,250 128,262 L72,262 Q66,240 70,206 L100,198';
  const path = sv('path', { d: tube, fill: 'none', stroke: '#f2c27a', 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.85 });
  const bol = sv('circle', { r: 7, fill: '#7a4a2a', stroke: '#fff', 'stroke-width': 2, cx: 100, cy: 46 });
  svg.append(path, bol);
  const stops = [0, 0.14, 0.33, 0.55, 0.85];
  const label = h('p', { class: 'prompt' }, 'Appuie sur « Avaler » et suis le voyage d’une bouchée de pain !');
  // le voyage avance étape par étape : la bouchée glisse jusqu'à l'organe, puis s'arrête le temps de l'explication
  // (la voix finit sa phrase avant que la bouchée reparte), pour que l'animation et la voix restent synchrones.
  let runId = 0;
  const glide = (from, to, ms, id) => new Promise((ok) => {
    const L = path.getTotalLength(), t0 = performance.now();
    const st = (now) => { if (id !== runId || !svg.isConnected) return ok(); const q = Math.min(1, (now - t0) / ms), e = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2, pt = path.getPointAtLength((from + (to - from) * e) * L); bol.setAttribute('cx', pt.x); bol.setAttribute('cy', pt.y); if (q < 1) requestAnimationFrame(st); else ok(); };
    requestAnimationFrame(st);
  });
  const speakWait = (txt, id) => new Promise((ok) => {
    let done = false; const fin = () => { if (!done) { done = true; setTimeout(ok, 700); } };
    talk(txt, false);
    const spoke = Voice.speak(txt, { onEnd: fin });
    setTimeout(fin, spoke ? 4000 + txt.length * 110 : 1800 + txt.length * 45); // filet de sécurité si la voix ne signale pas la fin
    if (id !== runId) fin();
  });
  const run = async () => {
    const id = ++runId; avaler.disabled = true; let prev = 0;
    for (let k = 0; k < DIG.length; k++) {
      await glide(prev, stops[k], k === 0 ? 300 : 2600, id); if (id !== runId) return; prev = stops[k];
      label.textContent = `${DIG[k][0]} ${DIG[k][1][0].toUpperCase() + DIG[k][1].slice(1)} : ${DIG[k][2]}`;
      await speakWait(`${DIG[k][1]} : ${DIG[k][2]}`, id); if (id !== runId) return;
    }
    await glide(prev, 1, 2200, id); avaler.disabled = false;
  };
  const game = h('div');
  const avaler = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'co-avaler', onclick: run }, '😋 Avaler');
  body.replaceChildren(label, h('div', { class: 'mi-lab' }, svg, h('div', { class: 'mi-side' }, avaler, h('button', { class: 'btn', type: 'button', 'data-testid': 'co-ordre', onclick: ordre }, '🎯 Remets le trajet dans l’ordre'), game)));
  talk('Le tube digestif : suis le voyage des aliments !');
  function ordre() {
    const got = []; const slots = h('div', { class: 'co-order' });
    const draw = () => slots.replaceChildren(...DIG.map((d, i) => h('div', { class: 'co-oslot' + (got[i] ? ' full' : '') }, `${i + 1}. ${got[i] ? got[i][0] + ' ' + got[i][1] : '…'}`)));
    game.replaceChildren(h('p', { class: 'muted' }, 'Touche les organes dans l’ordre du trajet des aliments.'), slots, h('div', { class: 'vi-pool' }, ...shuffle(DIG).map((d) => h('button', { class: 'vi-chip', type: 'button', 'data-testid': 'co-dig-chip', onclick: (e) => {
      if (d === DIG[got.length]) { got.push(d); e.currentTarget.disabled = true; Sfx.bloop(); draw(); if (got.length === DIG.length) { star(3); Sfx.win(); burst(body); talk('Bravo ! Bouche, œsophage, estomac, intestin grêle, gros intestin : tu connais tout le trajet !'); } }
      else { Sfx.tap(); talk(got.length ? `Non : après ${got[got.length - 1][1]}, où vont les aliments ?` : 'Tout commence dans la bouche !', false); }
    } }, d[0] + ' ' + d[1]))));
    draw();
  }
}

// ---------- les cinq sens ----------
const SAVEURS = [['🍯 le miel', 'sucré'], ['🍓 la fraise', 'sucré'], ['🍬 le bonbon', 'sucré'], ['🍋 le citron', 'acide'], ['🥒 le cornichon', 'acide'], ['🍏 la pomme verte', 'acide'], ['🥨 le bretzel', 'salé'], ['🍟 les frites', 'salé'], ['🧀 le fromage', 'salé'], ['☕ le café', 'amer'], ['🥬 le chicon', 'amer'], ['🍫 le chocolat très noir', 'amer']];
const TEXT = [['🧸 la peluche', 'doux'], ['🪶 la plume', 'doux'], ['🌵 le cactus', 'piquant'], ['🦔 le hérisson', 'piquant'], ['🪨 la pierre', 'rugueux'], ['🌳 l’écorce d’arbre', 'rugueux'], ['🧊 le glaçon', 'froid'], ['❄️ la neige', 'froid'], ['☕ le chocolat chaud', 'chaud'], ['🔥 le radiateur', 'chaud']];
function trieur(body, talk, items, cats, titre) {
  const pool = shuffle(items).slice(0, 8); let i = 0, ok = 0;
  const card = h('div', { class: 'vi-card' }), bins = cats.map((c) => h('button', { class: 'th-bin', type: 'button', 'data-testid': 'co-bin', onclick: () => {
    const it = pool[i]; if (!it) return;
    if (it[1] === c) { ok++; star(); Sfx.coin(); talk(`Oui, ${it[0].slice(3)} : ${c} !`, false); } else { Sfx.tap(); talk(`Non, ${it[0].slice(3)}, c’est ${it[1]}.`, false); }
    i++; setTimeout(show, 1500);
  } }, c));
  const show = () => { if (i >= pool.length) { card.replaceChildren(h('b', null, `${ok}/${pool.length} bien classés !`)); if (ok >= 6) { Sfx.win(); burst(body); } return; } card.replaceChildren(h('span', { class: 'vi-big' }, pool[i][0].split(' ')[0]), h('b', null, pool[i][0].slice(3))); };
  return [h('p', { class: 'prompt' }, titre), card, h('div', { class: 'th-bins' }, ...bins), show];
}
function sens(body, talk) {
  const tabs = h('div', { class: 'actions wrap' }), zone = h('div');
  body.replaceChildren(tabs, zone);
  const T = [['organes', '👁️ Les 5 sens'], ['vue', '👀 La vue'], ['ouie', '👂 L’ouïe'], ['gout', '👅 Le goût'], ['toucher', '✋ Le toucher']];
  const go = (k) => { [...tabs.children].forEach((b) => b.classList.toggle('primary', b.dataset.k === k)); ({ organes, vue, ouie, gout, toucher })[k](); };
  tabs.append(...T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-k': k, 'data-testid': 'co-sens-' + k, onclick: () => go(k) }, l)));
  function organes() {
    const host = h('div');
    zone.replaceChildren(h('div', { class: 'co-senses' }, ...[['👁️', 'la vue', 'les yeux'], ['👂', 'l’ouïe', 'les oreilles'], ['👃', 'l’odorat', 'le nez'], ['👅', 'le goût', 'la langue'], ['✋', 'le toucher', 'la peau']].map(([ic, s, o]) => h('div', { class: 'co-sense' }, h('span', null, ic), h('b', null, s), h('small', null, o)))), host);
    qcm(host, talk, shuffle([
      { q: 'Avec quel organe sent-on les odeurs ?', opts: ['le nez', 'la langue', 'les oreilles'], why: 'Le nez : c’est l’odorat.' },
      { q: 'Quel est l’organe du toucher ?', opts: ['la peau', 'les yeux', 'le nez'], why: 'La peau couvre tout le corps : on sent partout le chaud, le froid, le doux…' },
      { q: 'Quand on a un gros rhume, la nourriture semble avoir moins de goût. Pourquoi ?', opts: ['Parce que le nez bouché ne sent plus les odeurs', 'Parce que la langue est malade', 'Parce que les yeux pleurent'], why: 'Le goût et l’odorat travaillent ensemble !' },
      { q: 'Quel sens utilise-t-on pour écouter une histoire ?', opts: ['l’ouïe', 'la vue', 'le toucher'], why: 'L’ouïe, grâce aux oreilles.' },
    ]).slice(0, 3), () => {});
    talk('Nous avons cinq sens : la vue, l’ouïe, l’odorat, le goût et le toucher.');
  }
  function vue() {
    const eye = sv('svg', { viewBox: '0 0 200 120', class: 'co-eye' }); const pup = sv('circle', { cx: 100, cy: 60, r: 20, fill: '#111' });
    eye.append(sv('ellipse', { cx: 100, cy: 60, rx: 90, ry: 50, fill: '#fff', stroke: '#2b2440', 'stroke-width': 3 }), sv('circle', { cx: 100, cy: 60, r: 38, fill: '#5a9ad8' }), pup, sv('circle', { cx: 88, cy: 48, r: 6, fill: '#fff' }));
    const lab = h('p', { class: 'muted' });
    const knob = h('input', { type: 'range', min: 0, max: 100, value: 50, class: 'mi-knob', 'data-testid': 'co-light', oninput: (e) => setL(+e.target.value) });
    const setL = (v) => { pup.setAttribute('r', 30 - v * 0.24); eye.style.filter = `brightness(${0.5 + v / 100})`; lab.textContent = v > 70 ? '☀️ Beaucoup de lumière : la pupille devient toute petite pour protéger l’œil.' : v < 30 ? '🌙 Peu de lumière : la pupille s’agrandit pour faire entrer plus de lumière.' : 'Fais varier la lumière et regarde la pupille (le rond noir).'; };
    const ill = sv('svg', { viewBox: '0 0 260 130', class: 'co-ill' });
    const arrow = (y, out) => { const g = sv('g', { stroke: '#2b2440', 'stroke-width': 4, fill: 'none' }); g.append(sv('line', { x1: 60, y1: y, x2: 200, y2: y })); const d = out ? -18 : 18; g.append(sv('path', { d: `M${60 + d},${y - 16} L60,${y} L${60 + d},${y + 16} M${200 - d},${y - 16} L200,${y} L${200 - d},${y + 16}` })); return g; };
    ill.append(sv('rect', { width: 260, height: 130, fill: '#fff', rx: 10 }), arrow(40, true), arrow(95, false));
    const host = h('div');
    zone.replaceChildren(h('div', { class: 'mi-lab' }, h('div', { class: 'mi-left' }, eye, knob, lab), h('div', { class: 'mi-side' }, h('b', null, '🌀 Illusion d’optique'), ill, host)));
    setL(50);
    qcm(host, talk, [{ q: 'Quel trait horizontal est le plus long ?', opts: ['Ils ont la même longueur !', 'Celui du haut', 'Celui du bas'], why: 'Mesure avec une règle : ils sont identiques ! Les flèches trompent notre cerveau : c’est une illusion d’optique.' }], () => {});
    talk('La vue : fais varier la lumière et observe la pupille. Puis essaie l’illusion d’optique !');
  }
  function ouie() {
    preload(['piano', 'tuba', 'flute']);
    const Q = shuffle([
      { kind: 'haut', a: () => { playNote('flute', 84, 0, 1); }, q: 'Ce son est-il aigu ou grave ?', opts: ['aigu', 'grave'], why: 'Un son aigu est « haut », comme le chant d’un oiseau.' },
      { kind: 'bas', a: () => { playNote('tuba', 38, 0, 1.2); }, q: 'Ce son est-il aigu ou grave ?', opts: ['grave', 'aigu'], why: 'Un son grave est « bas », comme la voix d’un ours.' },
      { kind: 'fort', a: () => { playNote('piano', 60, 0, 1, 1); }, q: 'Ce son est-il fort ou faible ?', opts: ['fort', 'faible'], why: 'Fort : beaucoup de volume.' },
      { kind: 'faible', a: () => { playNote('piano', 60, 0, 1, 0.08); }, q: 'Ce son est-il fort ou faible ?', opts: ['faible', 'fort'], why: 'Faible : on l’entend à peine.' },
      { kind: 'haut2', a: () => { playNote('piano', 88, 0, 0.8); }, q: 'Ce son est-il aigu ou grave ?', opts: ['aigu', 'grave'], why: 'Une note tout à droite du piano : aiguë.' },
      { kind: 'bas2', a: () => { playNote('piano', 36, 0, 1); }, q: 'Ce son est-il aigu ou grave ?', opts: ['grave', 'aigu'], why: 'Une note tout à gauche du piano : grave.' },
    ]).slice(0, 5);
    Q.forEach((it) => { it.pic = () => { setTimeout(it.a, 300); return h('button', { class: 'btn primary th-play', type: 'button', onclick: it.a }, '▶ Réécouter'); }; });
    const host = h('div'); zone.replaceChildren(h('p', { class: 'muted' }, '👂 Les oreilles captent les sons. Écoute bien chaque son.'), host);
    qcm(host, talk, Q, () => host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: ouie }, '↻ Encore'))));
  }
  function gout() { const [a, b, c, show] = trieur(body, talk, SAVEURS, ['sucré', 'salé', 'acide', 'amer'], '👅 La langue reconnaît les saveurs. Classe chaque aliment selon sa saveur.'); zone.replaceChildren(a, b, c); show(); talk('Le goût : classe chaque aliment. Sucré, salé, acide ou amer ?'); }
  function toucher() { const [a, b, c, show] = trieur(body, talk, TEXT, ['doux', 'piquant', 'rugueux', 'froid', 'chaud'], '✋ La peau sent le doux, le piquant, le rugueux, le froid et le chaud. Classe chaque objet.'); zone.replaceChildren(a, b, c); show(); talk('Le toucher : comment est chaque objet quand on le touche ?'); }
  go('organes');
}


// ---------- le voyage miniaturisé dans le corps ----------
const ETAPES = [
  { k: 'bouche', ic: '👄', bg: '#f7b8c0', t: 'Bouche : la capsule entre avec une bouchée de pain. Les dents broient, la salive mouille.', q: { q: 'À quoi servent les dents ?', opts: ['À couper et broyer les aliments', 'À respirer', 'À entendre'], why: 'Les dents coupent (incisives) et broient (molaires).' } },
  { k: 'estomac', ic: '🫃', bg: '#f2c27a', t: 'Estomac : ça remue ! Les aliments sont malaxés et transformés en bouillie.', q: { q: 'Que se passe-t-il dans l’estomac ?', opts: ['Les aliments sont malaxés en bouillie', 'On fabrique de l’air', 'On pense'], why: 'L’estomac malaxe les aliments.' } },
  { k: 'intestin', ic: '〰️', bg: '#f6d8a0', t: 'Intestin grêle : un long tunnel de 6 mètres ! Les bons éléments des aliments passent dans le sang.', q: { q: 'Où les bons éléments des aliments passent-ils dans le sang ?', opts: ['Dans l’intestin grêle', 'Dans la bouche', 'Dans les os'], why: 'Dans l’intestin grêle.' } },
  { k: 'sang', ic: '🩸', bg: '#e8606a', t: 'Dans le sang : la capsule navigue parmi les globules rouges, qui transportent l’oxygène partout dans le corps.', q: { q: 'Que transportent les globules rouges ?', opts: ['L’oxygène', 'Les pensées', 'Les sons'], why: 'Les globules rouges transportent l’oxygène.' } },
  { k: 'coeur', ic: '❤️', bg: '#d8404a', t: 'Cœur : boum-boum ! Ce muscle pompe le sang dans tout le corps, sans jamais s’arrêter.', q: { q: 'Quel est le rôle du cœur ?', opts: ['Pomper le sang', 'Digérer', 'Voir'], why: 'Le cœur est une pompe à sang.' } },
  { k: 'poumons', ic: '🫁', bg: '#9ad0ff', t: 'Poumons : ils se gonflent quand on inspire l’air, et le sang y récupère l’oxygène.', q: { q: 'Quand on inspire, l’air va dans…', opts: ['les poumons', 'l’estomac', 'le cœur'], why: 'L’air entre dans les poumons.' } },
  { k: 'cerveau', ic: '🧠', bg: '#f0b8e0', t: 'Cerveau : le chef ! Des milliers de petits messages électriques passent par les nerfs.', q: { q: 'Comment le cerveau envoie-t-il ses messages au corps ?', opts: ['Par les nerfs', 'Par les cheveux', 'Par les ongles'], why: 'Les nerfs transportent les messages.' } },
];
function voyage(body, talk) {
  let i = 0, ok = 0;
  const view = sv('svg', { viewBox: '0 0 400 220', class: 'co-trip' });
  const head = h('p', { class: 'prompt' }), host = h('div');
  body.replaceChildren(h('div', { class: 'mi-step' }, '🔬 La capsule magique rétrécit… Maissa et Muezza sont plus petits qu’une fourmi ! Le voyage commence.'), h('div', { class: 'dr-wrap' }, view), head, host);
  function draw(e) {
    view.replaceChildren(sv('rect', { width: 400, height: 220, fill: e.bg, rx: 14 }));
    for (let n = 0; n < 14; n++) {
      const x = (n * 53) % 400, y = 30 + (n * 37) % 160;
      if (e.k === 'sang') view.append(sv('ellipse', { cx: x, cy: y, rx: 16, ry: 10, fill: '#b02a3a', class: 'co-float', style: `animation-delay:${n * 0.2}s` }));
      else if (e.k === 'cerveau') view.append(sv('path', { d: `M${x},${y} l12,-8 l-4,10 l14,-6`, stroke: '#ffe36b', 'stroke-width': 3, fill: 'none', class: 'co-zap', style: `animation-delay:${n * 0.15}s` }));
      else if (e.k === 'poumons') view.append(sv('circle', { cx: x, cy: y, r: 10, fill: '#ffffff88', class: 'co-float', style: `animation-delay:${n * 0.2}s` }));
      else view.append(sv('circle', { cx: x, cy: y, r: 6 + (n % 3) * 3, fill: '#ffffff44', class: 'co-float', style: `animation-delay:${n * 0.2}s` }));
    }
    if (e.k === 'coeur') view.append(sv('text', { x: 200, y: 130, style: 'text-anchor:middle;font-size:90px', class: 'co-beat2' }, '❤️'));
    const cap = sv('g', { class: 'co-capsule' }, sv('ellipse', { cx: 0, cy: 0, rx: 34, ry: 18, fill: '#ffffffcc', stroke: '#7ab8ff', 'stroke-width': 3 }), sv('text', { x: -14, y: 7, style: 'font-size:18px' }, '👧'), sv('text', { x: 6, y: 7, style: 'font-size:16px' }, '🐈'));
    view.append(cap);
  }
  const step = () => {
    if (i >= ETAPES.length) { head.textContent = `Bienvenue de retour, exploratrice ! ${ok}/${ETAPES.length} bonnes réponses pendant le voyage.`; talk(head.textContent); host.replaceChildren(h('button', { class: 'btn primary', type: 'button', onclick: () => voyage(body, talk) }, '↻ Refaire le voyage')); if (ok >= 5) { Sfx.win(); burst(body); } return; }
    const e = ETAPES[i]; draw(e); head.textContent = `${e.ic} Étape ${i + 1}/${ETAPES.length} — ${e.t}`; talk(e.t); host.replaceChildren();
    setTimeout(() => qcm(host, talk, [e.q], (o) => { ok += o; i++; setTimeout(step, 600); }), 900);
  };
  step();
}

// ---------- le petit médecin ----------
function medecin(body, talk) {
  const tabs = h('div', { class: 'actions wrap' }), zone = h('div');
  body.replaceChildren(tabs, zone);
  const go = (k) => { [...tabs.children].forEach((b) => b.classList.toggle('primary', b.dataset.k === k)); ({ stetho, thermo, sante })[k](); };
  tabs.append(...[['stetho', '🩺 Le stéthoscope'], ['thermo', '🌡️ Le thermomètre'], ['sante', '🥦 Rester en bonne santé']].map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-k': k, 'data-testid': 'co-m-' + k, onclick: () => go(k) }, l)));
  let actx = null;
  const beat = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); if (S.get().settings.sound === false) return; const t = actx.currentTime; [0, 0.18].forEach((d, k) => { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.setValueAtTime(k ? 55 : 65, t + d); g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(k ? 0.5 : 0.8, t + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.16); o.connect(g); g.connect(actx.destination); o.start(t + d); o.stop(t + d + 0.2); }); } catch (e) { /* sans son */ } };
  function stetho() {
    let bpm = 80, timer = 0, counting = false, count = 0, t0 = 0;
    const heart = h('div', { class: 'co-bigheart' }, '❤️'), info = h('p', { class: 'prompt' }), cnt = h('div', { class: 'ws-big' });
    const loop = () => { clearTimeout(timer); if (!heart.isConnected && t0) return; heart.classList.remove('pulse'); void heart.offsetWidth; heart.classList.add('pulse'); beat(); if (counting) { count++; cnt.textContent = `Battements comptés : ${count}`; } t0 = 1; timer = setTimeout(loop, 60000 / bpm); };
    const host = h('div');
    zone.replaceChildren(h('p', { class: 'muted' }, 'Pose le stéthoscope sur le cœur de Maissa et écoute. Le cœur bat plus vite quand on fait du sport !'), h('div', { class: 'mi-lab' }, h('div', { class: 'co-patient' }, h('span', null, '👧'), heart), h('div', { class: 'mi-side' }, info, cnt,
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'co-ecoute', onclick: () => { bpm = 80; info.textContent = '😌 Au repos : environ 80 battements par minute.'; talk('Écoute : boum boum. Au repos, le cœur d’un enfant bat environ 80 fois par minute.', false); loop(); } }, '🩺 Écouter au repos'),
        h('button', { class: 'btn', type: 'button', 'data-testid': 'co-courir', onclick: () => { bpm = 140; info.textContent = '🏃‍♀️ Après avoir couru : environ 140 battements par minute !'; talk('Après une course, le cœur bat beaucoup plus vite : les muscles ont besoin de plus d’oxygène !', false); loop(); } }, '🏃‍♀️ Courir 1 minute'),
        h('button', { class: 'btn small', type: 'button', onclick: () => { count = 0; counting = true; cnt.textContent = 'Compte pendant 15 secondes…'; setTimeout(() => { counting = false; cnt.textContent = `${count} battements en 15 s → environ ${count * 4} par minute (15 s × 4 = 1 minute).`; star(); }, 15000); } }, '⏱️ Compter 15 s')), host)));
    qcm(host, talk, [{ q: 'Pourquoi le cœur bat-il plus vite quand on court ?', opts: ['Les muscles ont besoin de plus d’oxygène', 'Parce qu’il a peur', 'Il ne bat pas plus vite'], why: 'Le cœur envoie plus de sang (et donc d’oxygène) aux muscles qui travaillent.' }], () => {});
  }
  function thermo() {
    const host = h('div');
    const T = ri(0, 1) ? 36.8 : 38.6;
    zone.replaceChildren(h('div', { class: 'co-thermo' }, h('span', null, '🌡️'), h('b', null, `${String(T).replace('.', ',')} °C`)), host);
    qcm(host, talk, [
      { q: `Le thermomètre affiche ${String(T).replace('.', ',')} °C. Maissa a-t-elle de la fièvre ?`, opts: T > 38 ? ['Oui, elle a de la fièvre', 'Non, c’est normal'] : ['Non, c’est normal', 'Oui, elle a de la fièvre'], why: 'La température normale du corps est d’environ 37 °C. Au-dessus de 38 °C, on a de la fièvre.' },
      { q: 'Quelle est la température normale du corps humain ?', opts: ['environ 37 °C', 'environ 20 °C', 'environ 50 °C'], why: 'Environ 37 °C.' },
      { q: 'Quand on a de la fièvre, que faut-il faire ?', opts: ['Se reposer, boire et prévenir un adulte', 'Courir dehors', 'Manger beaucoup de bonbons'], why: 'On se repose, on boit et un adulte décide s’il faut voir le médecin.' },
    ], () => host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: thermo }, '↻ Un autre patient'))));
  }
  function sante() {
    const host = h('div'); zone.replaceChildren(host);
    qcm(host, talk, shuffle([
      { q: 'Combien d’heures un enfant de ton âge devrait-il dormir chaque nuit ?', opts: ['Environ 10 heures', 'Environ 4 heures', 'Environ 16 heures'], why: 'Entre 9 et 11 heures : le sommeil aide à grandir et à apprendre.' },
      { q: 'Combien de fois par jour se brosse-t-on les dents ?', opts: ['Au moins 2 fois', '1 fois par semaine', 'Jamais'], why: 'Matin et soir, pendant 2 minutes.' },
      { q: 'Quelle boisson est la meilleure pour le corps ?', opts: ['L’eau', 'Le soda', 'Le sirop'], why: 'L’eau ! Les sodas contiennent beaucoup de sucre.' },
      { q: 'Quel goûter est le plus équilibré ?', opts: ['Un fruit et un yaourt', 'Des chips et un soda', 'Trois bonbons'], why: 'Fruits et produits laitiers donnent de l’énergie et des vitamines.' },
      { q: 'Pourquoi faire du sport ?', opts: ['Pour garder un cœur et des muscles en forme', 'Pour être fatigué', 'Ça ne sert à rien'], why: 'Le sport renforce le cœur, les muscles et les os.' },
    ]).slice(0, 4), () => host.append(h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: sante }, '↻ Encore'))));
  }
  go('stetho');
}

export function open(tab = 'squelette') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div');
  const T = [['squelette', '🦴 Le squelette', squelette], ['mannequin', '🫀 Le mannequin transparent', mannequin], ['digestion', '🍎 La digestion', digestion], ['sens', '👁️ Les cinq sens', sens], ['voyage', '🚀 Le voyage miniature', voyage], ['medecin', '🩺 Le petit médecin', medecin]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'co-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel co-panel' }, UI.closeButton(), h('h2', null, '🫀 Le Sanctuaire du Corps Humain'), h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Sanctuaire du corps', onClose: () => Voice.stop() });
  function go(k) { tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); talk('', false); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
