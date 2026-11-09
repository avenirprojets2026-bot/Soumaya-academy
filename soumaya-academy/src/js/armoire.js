// L'armoire magique de la Tour des Secrets Numériques : Soumaya range les fichiers volants dans les quatre tiroirs
// colorés du décor selon leur extension (Documents, Images, Sons, Vidéos). 4 niveaux : icône + extension,
// extension seule, noms piégés (c'est l'extension qui décide), grand rangement (sous-dossiers + corbeille des copies).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { playFile } from './papa.js';
import { burst, shuffle } from './workshop.js';

const IMG = 'assets/scenes/armoire.webp';
// tiroirs : position dans l'illustration (fractions), couleur, nom
export const DR = [
  { k: 'doc', name: 'Documents', icon: '📄', c: '#3d6fe0', ex: '.docx .pdf .txt .odt', r: { x: 0.284, y: 0.215, w: 0.256, h: 0.3 } },
  { k: 'img', name: 'Images', icon: '🖼️', c: '#2fae6a', ex: '.jpg .jpeg .png .gif', r: { x: 0.573, y: 0.258, w: 0.211, h: 0.276 } },
  { k: 'mus', name: 'Sons & musique', icon: '🎵', c: '#e0aa22', ex: '.mp3 .wav .ogg', r: { x: 0.276, y: 0.547, w: 0.26, h: 0.271 } },
  { k: 'vid', name: 'Vidéos', icon: '🎬', c: '#e0507e', ex: '.mp4 .mov .avi', r: { x: 0.57, y: 0.557, w: 0.211, h: 0.243 } },
];
const UN = { doc: 'un document', img: 'une image', mus: 'un son', vid: 'une vidéo' };
const ICON = { doc: '📄', img: '🖼️', mus: '🎵', vid: '🎬', trash: '🗑️' };
const KIND = (n) => { const e = n.slice(n.lastIndexOf('.')).toLowerCase(); return ['.docx', '.pdf', '.txt', '.odt'].includes(e) ? 'doc' : ['.jpg', '.jpeg', '.png', '.gif'].includes(e) ? 'img' : ['.mp3', '.wav', '.ogg'].includes(e) ? 'mus' : 'vid'; };
const EASY = ['muezza-dort.jpg', 'expose-volcans.docx', 'berceuse.mp3', 'spectacle-ecole.mp4', 'dessin-chateau.png', 'liste-courses.txt', 'anniversaire-hajar.mov', 'piano-soumaya.wav', 'carte-belgique.pdf', 'zakaria-rigole.gif', 'chanson-pluie.ogg', 'poeme-maman.odt', 'match-foot.avi', 'arc-en-ciel.jpeg'];
const TRAPS = ['photo-chat.mp3', 'chanson-noel.docx', 'video-danse.jpg', 'musique-cirque.mp4', 'image-lune.wav', 'film-pirates.pdf', 'dessin-anime.ogg', 'son-tambour.png', 'photo-classe.mov', 'texte-poesie.gif'];
// niveau 4 : les images vont dans un sous-dossier, les copies à la corbeille
const BIG = [['vacances-plage.jpg', 'img', 'Vacances'], ['vacances-montagne.png', 'img', 'Vacances'], ['dessin-licorne.png', 'img', 'Dessins'], ['dessin-fusee.gif', 'img', 'Dessins'], ['berceuse (copie).mp3', 'trash'], ['expose-volcans (copie).docx', 'trash'], ['recette-crepes.pdf', 'doc'], ['danse-hajar.mp4', 'vid'], ['flute.wav', 'mus'], ['vacances-bateau.jpeg', 'img', 'Vacances']];
const NIV = [
  { n: 1, t: 'Icône + extension', d: 'Regarde l’icône et l’extension.' },
  { n: 2, t: 'Extension seule', d: 'Plus d’icône : seules les lettres après le point comptent !' },
  { n: 3, t: 'Les noms piégés', d: 'Attention : le nom peut mentir. C’est l’extension qui décide !' },
  { n: 4, t: 'Le grand rangement', d: 'Les images vont dans le bon sous-dossier, les copies à la corbeille.' },
];
const ST = () => { const b = S.get(); b.armoire = b.armoire || { lvl: 1 }; return b.armoire; };
const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const split = (n) => { const d = n.lastIndexOf('.'); return [n.slice(0, d), n.slice(d)]; };

let greeted = false;
export function open() {
  const st = ST();
  const say = h('div', { class: 'ar-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div', { class: 'ar-body' });
  UI.openDialog(h('div', { class: 'panel ar-panel' }, UI.closeButton(), h('h2', null, '🗄️ L’armoire magique des fichiers'), body,
    h('div', { class: 'ar-guide' }, h('img', { src: 'assets/sprites/soumaya/face.webp', alt: '', draggable: 'false' }), say)), { label: 'L’armoire magique', onClose: () => Voice.stop() });
  const menu = () => {
    const s = ST();
    body.replaceChildren(h('p', { class: 'prompt' }, 'Choisis un niveau. Chaque fichier a une extension (les lettres après le point) qui dit dans quel tiroir il va.'),
      h('div', { class: 'ar-levels' }, ...NIV.map((L) => h('button', { class: 'btn ar-lvl' + (L.n <= s.lvl ? '' : ' locked'), type: 'button', 'data-testid': 'ar-lvl-' + L.n, disabled: L.n > s.lvl, onclick: () => play(L.n) },
        h('b', null, `Niveau ${L.n}`), h('span', null, L.t), h('small', null, L.n > s.lvl ? '🔒 Réussis le niveau précédent' : (s['ok' + L.n] ? '⭐ ' + s['ok' + L.n] + '/8' : L.d))))),
      h('div', { class: 'ar-memo' }, ...DR.map((d) => h('span', { style: `--c:${d.c}` }, `${d.icon} ${d.name} : ${d.ex}`))));
  };
  function play(n) {
    const pool = n === 4 ? shuffle(BIG).slice(0, 8).map(([f, k, sub]) => ({ f, k, sub })) : (n === 3 ? [...shuffle(TRAPS).slice(0, 5), ...shuffle(EASY).slice(0, 3)] : shuffle(EASY).slice(0, 8)).map((f) => ({ f, k: KIND(f) }));
    const files = n === 3 ? shuffle(pool) : pool;
    let i = 0, ok = 0, busy = false;
    const stage = h('div', { class: 'ar-stage' }), img = h('img', { class: 'ar-img', src: IMG, alt: 'L’armoire aux quatre tiroirs colorés', draggable: 'false' });
    const drawers = DR.map((d) => {
      const lab = h('span', { class: 'ar-lab' }, `${d.icon} ${d.name}`);
      const b = h('button', { class: 'ar-dr', type: 'button', 'data-k': d.k, 'data-testid': 'ar-dr-' + d.k, 'aria-label': 'Tiroir ' + d.name, style: `left:${d.r.x * 100}%;top:${d.r.y * 100}%;width:${d.r.w * 100}%;height:${d.r.h * 100}%;--c:${d.c};background-image:url(${IMG});background-size:${100 / d.r.w}% ${100 / d.r.h}%;background-position:${d.r.x / (1 - d.r.w) * 100}% ${d.r.y / (1 - d.r.h) * 100}%`, onclick: () => drop(d.k) }, h('i', { class: 'ar-in' }), lab);
      return b;
    });
    const trash = n === 4 ? h('button', { class: 'ar-trash', type: 'button', 'data-k': 'trash', 'data-testid': 'ar-dr-trash', 'aria-label': 'Corbeille', onclick: () => drop('trash') }, '🗑️', h('small', null, 'Corbeille')) : null;
    const holes = DR.map((d) => h('i', { class: 'ar-hole', style: `left:${d.r.x * 100}%;top:${d.r.y * 100}%;width:${d.r.w * 100}%;height:${d.r.h * 100}%;--c:${d.c}` }));
    stage.append(img, ...holes, ...drawers); if (trash) stage.append(trash);
    const card = h('div', { class: 'ar-card', 'data-testid': 'ar-card' }), count = h('div', { class: 'ar-count' }), sub = h('div', { class: 'ar-sub' });
    const fly = h('div', { class: 'ar-fly' }, card, count);
    body.replaceChildren(h('div', { class: 'ar-top' }, h('button', { class: 'btn small', type: 'button', onclick: menu }, '← Niveaux'), h('b', null, `Niveau ${n} · ${NIV[n - 1].t}`)), h('div', { class: 'ar-wrap' }, stage, fly, sub));
    talk(NIV[n - 1].d + (n === 4 ? ' Les fichiers « copie » sont des doublons.' : ''));
    const show = () => {
      if (i >= files.length) return finish();
      const F = files[i], [base, ext] = split(F.f);
      card.className = 'ar-card in'; card.replaceChildren(n === 1 ? h('span', { class: 'ar-ic' }, ICON[F.k === 'trash' ? KIND(F.f) : F.k]) : h('span', { class: 'ar-ic' }, '📁'), h('b', { class: 'ar-nm' }, base), h('b', { class: 'ar-ext' }, ext));
      count.textContent = `Fichier ${i + 1} / ${files.length} · ✔ ${ok}`; busy = false;
    };
    // glisser la carte sur un tiroir (ou toucher le tiroir)
    let dg = null;
    card.addEventListener('pointerdown', (e) => { if (busy) return; dg = { x: e.clientX, y: e.clientY, id: e.pointerId }; card.setPointerCapture(e.pointerId); card.classList.add('drag'); });
    card.addEventListener('pointermove', (e) => { if (!dg || e.pointerId !== dg.id) return; card.style.translate = `${e.clientX - dg.x}px ${e.clientY - dg.y}px`; const t = hit(e.clientX, e.clientY); [...drawers, trash].forEach((b) => b && b.classList.toggle('hover', b === t)); });
    const up = (e) => { if (!dg || e.pointerId !== dg.id) return; dg = null; card.classList.remove('drag'); const t = hit(e.clientX, e.clientY); [...drawers, trash].forEach((b) => b && b.classList.remove('hover')); if (t) drop(t.dataset.k, true); else card.style.translate = ''; };
    card.addEventListener('pointerup', up); card.addEventListener('pointercancel', up);
    const hit = (x, y) => [...drawers, trash].find((b) => { if (!b) return false; const r = b.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; });
    function drop(k, dragged) {
      if (busy || i >= files.length) return; const F = files[i], b = k === 'trash' ? trash : drawers.find((x) => x.dataset.k === k);
      const ext = split(F.f)[1], good = F.k;
      if (k === good) {
        busy = true;
        if (F.sub) return chooseSub(F, b);
        accept(b, k === 'trash' ? 'Une copie en double : hop, à la corbeille !' : `Oui ! ${ext}, c’est ${UN[k]} : tiroir ${DR.find((d) => d.k === k).name} !`);
      } else {
        Sfx.tap(); b && b.classList.add('nope'); setTimeout(() => b && b.classList.remove('nope'), 500);
        card.classList.add('shake'); setTimeout(() => { card.classList.remove('shake'); card.style.translate = ''; }, 450);
        const why = good === 'trash' ? 'C’est une copie : regarde le mot « copie » dans le nom. Les doublons vont à la corbeille.' : `Regarde l’extension : ${ext}, c’est ${UN[good]}${n === 3 ? ', même si le nom dit autre chose !' : '.'} Il va dans le tiroir ${DR.find((d) => d.k === good).name}.`;
        talk(why); F.miss = true;
      }
    }
    function chooseSub(F, b) {
      talk('Bien ! C’est une image. Dans quel sous-dossier la ranger ?', false);
      sub.replaceChildren(h('p', null, `📂 Images › ? « ${F.f} »`), ...['Vacances', 'Dessins'].map((s) => h('button', { class: 'btn', type: 'button', 'data-testid': 'ar-sub-' + s, onclick: () => {
        if (s === F.sub) { sub.replaceChildren(); accept(b, `Rangé dans Images › ${s} !`); } else { Sfx.tap(); F.miss = true; talk(`Regarde le début du nom : « ${F.f.split('-')[0]} ». Il va dans ${F.sub}.`); }
      } }, '📁 ' + s)));
    }
    function accept(b, msg) {
      if (!F0().miss) { ok++; star(); }
      Sfx.bloop(); talk(msg, false); b.classList.add('open');
      const cr = card.getBoundingClientRect(), br = b.getBoundingClientRect(), [tx, ty] = (card.style.translate || '0px 0px').split(' ').map((v) => parseFloat(v) || 0);
      card.style.translate = `${tx + br.left + br.width / 2 - (cr.left + cr.width / 2)}px ${ty + br.top + br.height / 2 - (cr.top + cr.height / 2)}px`;
      card.classList.add('into');
      setTimeout(() => { b.classList.remove('open'); card.className = 'ar-card'; card.style.translate = ''; i++; show(); }, 900);
    }
    const F0 = () => files[i];
    function finish() {
      const s = ST(); s['ok' + n] = Math.max(s['ok' + n] || 0, ok);
      const pass = ok >= 6; if (pass && n === s.lvl && n < 4) s.lvl = n + 1; if (pass && n === 4) s.done = true; S.save();
      fly.replaceChildren(h('div', { class: 'ar-end' }, h('b', null, pass ? `Bravo ! ${ok}/8 fichiers bien rangés du premier coup ⭐` : `${ok}/8 du premier coup. Encore un essai ?`),
        h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: () => play(n) }, '↻ Recommencer'), pass && n < 4 ? h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ar-next', onclick: () => play(n + 1) }, `Niveau ${n + 1} →`) : h('button', { class: 'btn primary', type: 'button', onclick: menu }, 'Niveaux'))));
      if (pass) { Sfx.win(); burst(body); drawers.forEach((d, k) => setTimeout(() => d.classList.add('glow'), k * 150)); }
      if (pass && n === 4 && Sfx.soundOn()) playFile('assets/voice/armoire_fin.mp3'); else talk(pass ? 'Super ! Tout est bien rangé.' : 'Regarde bien l’extension, les lettres après le point. Tu vas y arriver !');
    }
    show();
  }
  menu();
  if (!greeted && Sfx.soundOn()) { greeted = true; playFile('assets/voice/armoire_intro.mp3'); }
  say.textContent = 'Papa, regarde ! Les fichiers s’envolent partout ! Aide-moi à les ranger : c’est l’extension qui dit où ils vont.';
  return st;
}
