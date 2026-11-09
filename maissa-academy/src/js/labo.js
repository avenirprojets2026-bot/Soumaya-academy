// Le Laboratoire du corps humain (Sanctuaire) : 5 postes à manipuler, niveau P4.
// 1. reconstruire le squelette  2. replacer les organes  3. le microscope  4. le cœur en action  5. le voyage d'une pomme
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { playFile } from './papa.js';
import { burst, shuffle, qcm } from './workshop.js';

const IMG = {
  skull: 'assets/labo/b_skull.webp', ribs: 'assets/labo/b_ribs.webp', spine: 'assets/labo/b_spine.webp', pelvis: 'assets/labo/b_pelvis.webp', humerus: 'assets/labo/b_humerus.webp', avantbras: 'assets/labo/b_avantbras.webp', femur: 'assets/labo/b_femur.webp', tibia: 'assets/labo/b_tibia.webp',
  brain: 'assets/labo/o_brain.webp', heart: 'assets/labo/o_heart.webp', lungs: 'assets/labo/o_lungs.webp', liver: 'assets/labo/o_liver.webp', stomach: 'assets/labo/o_stomach.webp', intestines: 'assets/labo/o_intestines.webp', kidneys: 'assets/labo/o_kidneys.webp',
  body: 'assets/labo/body.webp', sang: 'assets/labo/m_sang.webp', oignon: 'assets/labo/m_oignon.webp', joue: 'assets/labo/m_joue.webp',
  soumaya: 'assets/sprites/soumaya/trois_quarts.webp', joie: 'assets/sprites/soumaya/joie.webp', marche: 'assets/sprites/soumaya/marche_2.webp', marche2: 'assets/sprites/soumaya/marche_6.webp',
};
const ST = () => { const b = S.get(); b.labo = b.labo || { done: {} }; b.labo.done = b.labo.done || {}; return b.labo; };
const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const finish = (k, host) => {
  const st = ST(), first = !st.done[k]; st.done[k] = true; S.save(); if (first) star(2);
  if (Object.keys(st.done).length >= 5 && !st.badge) { st.badge = true; S.save(); if (Sfx.soundOn()) playFile('assets/voice/labo_fin.mp3'); host && host.append(h('p', { class: 'lb-badge' }, '🩺 Badge « Petite docteure » gagné !')); }
};

// ---------- glisser-déposer générique sur une planche (pièces -> emplacements) ----------
// slots : [{ k, kind, img, cx, top, w, mirror, z, name, info }] en unités de la planche (W x H)
function board({ W, H, bg, slots, tray, talk, onPlace, onDone, ghost = true }) {
  const pl = h('div', { class: 'lb-board', style: `aspect-ratio:${W}/${H}` });
  if (bg) pl.append(h('img', { class: 'lb-bg', src: bg, alt: '', draggable: 'false' }));
  const place = new Map();
  slots.forEach((s) => {
    const el = h('img', { class: 'lb-slot' + (ghost ? ' ghost' : ''), src: s.img, alt: '', draggable: 'false', 'data-k': s.k, style: `left:${(s.cx - s.w / 2) / W * 100}%;top:${s.top / H * 100}%;width:${s.w / W * 100}%;z-index:${s.z || 1};${s.mirror ? 'transform:scaleX(-1);' : ''}` });
    pl.append(el); place.set(s.k, { s, el, done: false });
  });
  const trayEl = h('div', { class: 'lb-tray' });
  let sel = null;
  const left = () => [...place.values()].filter((p) => !p.done).length;
  const items = shuffle(tray).map((t) => {
    const b = h('button', { class: 'lb-piece', type: 'button', 'data-kind': t.kind, 'data-testid': 'lb-piece', 'aria-label': t.label }, h('img', { src: t.img, alt: '', draggable: 'false' }), h('span', null, t.label));
    b.addEventListener('click', () => { if (b.disabled) return; sel = sel === b ? null : b; items.forEach((x) => x.classList.toggle('sel', x === sel)); if (sel) talk(`Où va ${t.label.toLowerCase()} ? Touche le bon endroit sur le corps.`, false); });
    // glisser
    let dg = null, ghostEl = null;
    b.addEventListener('pointerdown', (e) => { if (b.disabled) return; dg = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false }; });
    b.addEventListener('pointermove', (e) => {
      if (!dg || e.pointerId !== dg.id) return;
      if (!dg.moved && Math.hypot(e.clientX - dg.x, e.clientY - dg.y) > 8) { dg.moved = true; b.setPointerCapture(e.pointerId); ghostEl = h('img', { class: 'lb-drag', src: t.img, alt: '' }); document.body.append(ghostEl); }
      if (ghostEl) { ghostEl.style.left = e.clientX + 'px'; ghostEl.style.top = e.clientY + 'px'; }
    });
    const up = (e) => { if (!dg || e.pointerId !== dg.id) return; const moved = dg.moved; dg = null; if (ghostEl) { ghostEl.remove(); ghostEl = null; } if (moved) { drop(b, t, e.clientX, e.clientY); } };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', () => { dg = null; if (ghostEl) { ghostEl.remove(); ghostEl = null; } });
    return b;
  });
  trayEl.append(...items);
  // toucher un emplacement avec une pièce sélectionnée
  pl.addEventListener('click', (e) => { if (!sel) return; const r = pl.getBoundingClientRect(); const t = tray.find((x) => x.label === sel.getAttribute('aria-label') && x.kind === sel.dataset.kind); drop(sel, t, e.clientX, e.clientY, r); });
  function drop(btn, t, x, y) {
    const r = pl.getBoundingClientRect(); if (x < r.left || x > r.right || y < r.top || y > r.bottom) { talk('Pose-le sur le corps !', false); return; }
    const px = (x - r.left) / r.width * W, py = (y - r.top) / r.height * H;
    // emplacement libre du bon type le plus proche
    const cands = [...place.values()].filter((p) => !p.done && p.s.kind === t.kind);
    const near = [...place.values()].filter((p) => !p.done).map((p) => { const ch = p.el.naturalHeight && p.el.naturalWidth ? p.s.w * p.el.naturalHeight / p.el.naturalWidth : p.s.w; return { p, d: Math.hypot(px - p.s.cx, py - (p.s.top + ch / 2)) }; }).sort((a, b) => a.d - b.d)[0];
    const good = cands.map((p) => { const ch = p.el.naturalHeight && p.el.naturalWidth ? p.s.w * p.el.naturalHeight / p.el.naturalWidth : p.s.w; return { p, d: Math.hypot(px - p.s.cx, py - (p.s.top + ch / 2)) }; }).sort((a, b) => a.d - b.d)[0];
    if (good && ((near && near.p === good.p) || good.d < W * 0.22)) {
      const P = good.p; P.done = true; P.el.classList.remove('ghost'); P.el.classList.add('on', 'pop', 'anim-' + P.s.kind);
      btn.disabled = true; btn.classList.add('used'); btn.classList.remove('sel'); sel = null;
      Sfx.ok(); star(); talk(`${P.s.name} ! ${P.s.info}`); onPlace && onPlace(P.s);
      if (!left()) { setTimeout(() => { Sfx.win(); burst(pl); onDone && onDone(); }, 600); }
    } else {
      Sfx.ko(); btn.classList.add('nope'); setTimeout(() => btn.classList.remove('nope'), 450);
      const where = near ? near.p.s.name.toLowerCase() : 'cet endroit';
      talk(near && near.p.s.kind !== t.kind ? `Pas tout à fait : à cet endroit, c’est la place de ${where}. Essaie ailleurs !` : 'Presque ! Rapproche-le du bon endroit.');
    }
  }
  return { el: h('div', { class: 'lb-work' }, pl, trayEl), pl };
}

// ---------- 1. le squelette ----------
const BONES = [
  { k: 'skull', kind: 'skull', img: IMG.skull, cx: 150, top: 0, w: 80, z: 4, name: 'Le crâne', info: 'Il protège le cerveau, comme un casque.' },
  { k: 'ribs', kind: 'ribs', img: IMG.ribs, cx: 150, top: 100, w: 122, z: 3, name: 'La cage thoracique', info: 'Les côtes forment une cage qui protège le cœur et les poumons.' },
  { k: 'spine', kind: 'spine', img: IMG.spine, cx: 150, top: 112, w: 30, z: 1, name: 'La colonne vertébrale', info: 'Une pile de petits os, les vertèbres : elle nous tient droits.' },
  { k: 'pelvis', kind: 'pelvis', img: IMG.pelvis, cx: 150, top: 248, w: 112, z: 2, name: 'Le bassin', info: 'Il relie la colonne vertébrale aux jambes.' },
  { k: 'humL', kind: 'humerus', img: IMG.humerus, cx: 80, top: 106, w: 44, z: 2, name: 'Le bras', info: 'Le bras va de l’épaule au coude. Son os s’appelle l’humérus.' },
  { k: 'humR', kind: 'humerus', img: IMG.humerus, cx: 220, top: 106, w: 44, z: 2, mirror: true, name: 'Le bras', info: 'L’humérus : le seul os du bras, entre l’épaule et le coude.' },
  { k: 'avbL', kind: 'avantbras', img: IMG.avantbras, cx: 80, top: 199, w: 44, z: 2, name: 'L’avant-bras', info: 'L’avant-bras va du coude au poignet : deux os, le radius et le cubitus. Puis la main et ses 27 petits os !' },
  { k: 'avbR', kind: 'avantbras', img: IMG.avantbras, cx: 220, top: 199, w: 44, z: 2, mirror: true, name: 'L’avant-bras', info: 'Le radius et le cubitus tournent l’un autour de l’autre quand tu tournes ta main.' },
  { k: 'femL', kind: 'femur', img: IMG.femur, cx: 122, top: 305, w: 64, z: 1, name: 'La cuisse', info: 'Dans la cuisse, le fémur : l’os le plus long du corps !' },
  { k: 'femR', kind: 'femur', img: IMG.femur, cx: 178, top: 305, w: 64, z: 1, mirror: true, name: 'La cuisse', info: 'Le fémur va de la hanche au genou.' },
  { k: 'tibL', kind: 'tibia', img: IMG.tibia, cx: 122, top: 424, w: 64, z: 1, name: 'La jambe', info: 'Sous le genou, la jambe : le tibia et le péroné, puis le pied.' },
  { k: 'tibR', kind: 'tibia', img: IMG.tibia, cx: 178, top: 424, w: 64, z: 1, mirror: true, name: 'La jambe', info: 'Le tibia, c’est l’os qu’on sent sur le devant de la jambe.' },
];
function squelette(body, talk) {
  const tray = [['skull', 'Crâne'], ['ribs', 'Cage thoracique'], ['spine', 'Colonne'], ['pelvis', 'Bassin'], ['humerus', 'Bras'], ['humerus', 'Bras'], ['avantbras', 'Avant-bras'], ['avantbras', 'Avant-bras'], ['femur', 'Cuisse'], ['femur', 'Cuisse'], ['tibia', 'Jambe'], ['tibia', 'Jambe']].map(([kind, label]) => ({ kind, label, img: IMG[kind] }));
  const out = h('div');
  const bd = board({ W: 300, H: 620, slots: BONES, tray, talk, onDone: () => {
    talk('Bravo ! Le squelette est complet. Un adulte a 206 os… et un bébé en a encore plus, environ 300, qui se soudent en grandissant !');
    const q = h('div'); out.append(q);
    qcm(q, talk, [
      { q: 'Quel os protège le cerveau ?', opts: ['Le crâne', 'Le bassin', 'Le fémur'], why: 'Le crâne est une boîte d’os très solide autour du cerveau.' },
      { q: 'Quel est l’os le plus long du corps ?', opts: ['Le fémur', 'L’humérus', 'Une côte'], why: 'Le fémur, l’os de la cuisse.' },
      { q: 'Où est l’avant-bras ?', opts: ['Entre le coude et le poignet', 'Entre l’épaule et le coude', 'Dans la jambe'], why: 'Le bras va de l’épaule au coude (humérus) ; l’avant-bras va du coude au poignet (radius et cubitus).' },
      { q: 'À quoi servent les côtes ?', opts: ['À protéger le cœur et les poumons', 'À digérer', 'À voir'], why: 'Elles forment une cage protectrice.' },
    ], () => finish('squelette', out));
  } });
  out.append(h('p', { class: 'prompt' }, 'Reconstruis le squelette : glisse chaque os à sa place (ou touche un os puis l’endroit).'), bd.el);
  body.replaceChildren(out);
  talk('Le squelette s’est démonté ! Remets chaque os à sa place.');
}

// ---------- 2. les organes ----------
const ORG = [
  { k: 'brain', kind: 'brain', img: IMG.brain, cx: 150, top: 30, w: 74, z: 1, name: 'Le cerveau', info: 'Il commande tout le corps : penser, bouger, voir, se souvenir.' },
  { k: 'lungs', kind: 'lungs', img: IMG.lungs, cx: 150, top: 170, w: 118, z: 1, name: 'Les poumons', info: 'Ils font entrer l’air et donnent l’oxygène au sang.' },
  { k: 'heart', kind: 'heart', img: IMG.heart, cx: 158, top: 200, w: 46, z: 3, name: 'Le cœur', info: 'Un muscle qui pompe le sang dans tout le corps, sans jamais s’arrêter.' },
  { k: 'liver', kind: 'liver', img: IMG.liver, cx: 136, top: 262, w: 84, z: 2, name: 'Le foie', info: 'Il nettoie le sang et aide à digérer.' },
  { k: 'stomach', kind: 'stomach', img: IMG.stomach, cx: 170, top: 262, w: 56, z: 3, name: 'L’estomac', info: 'Il brasse et écrase les aliments avec des sucs.' },
  { k: 'kidneys', kind: 'kidneys', img: IMG.kidneys, cx: 150, top: 284, w: 104, z: 1, name: 'Les reins', info: 'Ils filtrent le sang et fabriquent l’urine.' },
  { k: 'intestines', kind: 'intestines', img: IMG.intestines, cx: 150, top: 322, w: 96, z: 2, name: 'Les intestins', info: 'Les nutriments des aliments y passent dans le sang.' },
];
function organes(body, talk) {
  const tray = ORG.map((o) => ({ kind: o.kind, label: o.name.replace(/^(Le |La |Les |L’)/, '').replace(/^./, (c) => c.toUpperCase()), img: o.img }));
  const out = h('div');
  const bd = board({ W: 300, H: 672, bg: IMG.body, slots: ORG, tray, talk, onDone: () => {
    talk('Bravo ! Tous les organes sont à leur place… et ils se mettent à travailler ensemble !');
    const q = h('div'); out.append(q);
    qcm(q, talk, [
      { q: 'Quel organe pompe le sang ?', opts: ['Le cœur', 'L’estomac', 'Le cerveau'], why: 'Le cœur est une pompe musclée.' },
      { q: 'Quel organe donne l’oxygène au sang ?', opts: ['Les poumons', 'Les reins', 'Le foie'], why: 'Dans les poumons, l’oxygène de l’air passe dans le sang.' },
      { q: 'Qui commande tout le corps ?', opts: ['Le cerveau', 'Les intestins', 'Le cœur'], why: 'Le cerveau envoie des messages par les nerfs.' },
    ], () => finish('organes', out));
  } });
  out.append(h('p', { class: 'prompt' }, 'Replace chaque organe dans le mannequin transparent.'), bd.el);
  body.replaceChildren(out);
  talk('Les organes se sont échappés du mannequin ! Remets-les à leur place.');
}

// ---------- 3. le microscope ----------
const LAMES = [
  { k: 'sang', t: '🩸 Une goutte de sang', img: IMG.sang, q: 'Que vois-tu sur cette lame ?', opts: ['Des globules rouges et des globules blancs', 'Des cellules d’oignon', 'Du sable'], why: 'Les globules rouges (disques rouges) transportent l’oxygène ; les gros globules blancs violets nous défendent contre les microbes.' },
  { k: 'oignon', t: '🧅 La peau d’un oignon', img: IMG.oignon, q: 'Comment sont rangées les cellules de l’oignon ?', opts: ['Comme des briques, bien alignées', 'En boules qui flottent', 'Il n’y a pas de cellules'], why: 'Les cellules végétales ont une paroi solide : elles s’emboîtent comme des briques. Le petit point est le noyau.' },
  { k: 'joue', t: '😮 L’intérieur de la joue', img: IMG.joue, q: 'Qu’est-ce que le petit point foncé dans chaque cellule ?', opts: ['Le noyau', 'Une bulle d’air', 'Un microbe'], why: 'Le noyau est le « chef » de la cellule. Notre corps est fait de milliards de cellules !' },
];
function microscope(body, talk) {
  let seen = 0;
  const pick = h('div', { class: 'actions wrap' }), zone = h('div');
  const done = new Set();
  const open = (L) => {
    const target = 30 + Math.floor(Math.random() * 40);
    const view = h('div', { class: 'lb-scope' }, h('img', { src: L.img, alt: L.t, draggable: 'false' }));
    const img = view.firstChild; let zoom = 1;
    const knob = h('input', { type: 'range', min: 0, max: 100, value: target > 50 ? 0 : 100, class: 'lb-knob', 'aria-label': 'Molette de mise au point', 'data-testid': 'lb-focus' });
    const set = () => { const d = Math.abs(knob.value - target); img.style.filter = `blur(${Math.min(14, d / 3.2).toFixed(1)}px)`; img.style.transform = `scale(${zoom})`; if (d < 5 && !view.classList.contains('net')) { view.classList.add('net'); Sfx.coin(); talk('C’est net ! Regarde bien…', false); ask(); } };
    knob.addEventListener('input', set);
    const zb = [1, 1.6, 2.4].map((z, i) => h('button', { class: 'btn small' + (i === 0 ? ' primary' : ''), type: 'button', onclick: (e) => { zoom = z; [...e.currentTarget.parentNode.children].forEach((b) => b.classList.toggle('primary', b === e.currentTarget)); set(); } }, ['×40', '×100', '×400'][i]));
    const q = h('div');
    let asked = false;
    const ask = () => { if (asked) return; asked = true; qcm(q, talk, [{ q: L.q, opts: L.opts, why: L.why }], () => { if (!done.has(L.k)) { done.add(L.k); seen++; } if (seen >= 3) finish('microscope', zone); }); };
    zone.replaceChildren(h('h3', null, L.t), h('div', { class: 'lb-scope-wrap' }, view, h('div', { class: 'lb-ctrl' }, h('p', null, '🔧 Tourne la molette pour faire la mise au point :'), knob, h('div', { class: 'actions' }, ...zb))), q);
    set(); talk('Tourne la molette jusqu’à ce que l’image soit nette.');
  };
  LAMES.forEach((L) => pick.append(h('button', { class: 'btn', type: 'button', 'data-testid': 'lb-lame-' + L.k, onclick: () => open(L) }, L.t)));
  body.replaceChildren(h('p', { class: 'prompt' }, 'Choisis une lame et observe-la au microscope. Regarde les trois !'), pick, zone);
  open(LAMES[0]);
}

// ---------- 4. le cœur en action ----------
const ACTS = [['repos', '😴 Se reposer', 72, IMG.soumaya], ['marche', '🚶 Marcher', 95, IMG.marche], ['course', '🏃 Courir', 135, IMG.marche2], ['saut', '🤸 Sauter', 155, IMG.joie]];
function coeur(body, talk) {
  let bpm = 72, goal = 72, t0 = performance.now(), raf = 0, lastBeat = 0;
  const cv = h('canvas', { class: 'lb-ecg', width: 560, height: 120 }), ctx = cv.getContext('2d');
  const heart = h('img', { class: 'lb-heart', src: IMG.heart, alt: 'cœur' }), kid = h('img', { class: 'lb-kid', src: IMG.soumaya, alt: 'Maissa' });
  const num = h('b', { class: 'lb-bpm' }, '72'), tried = new Set();
  const pts = [];
  const loop = (now) => {
    if (!cv.isConnected) return; raf = requestAnimationFrame(loop);
    bpm += (goal - bpm) * 0.02; num.textContent = Math.round(bpm);
    const per = 60000 / bpm; if (now - lastBeat > per) { lastBeat = now; heart.classList.remove('beat'); void heart.offsetWidth; heart.classList.add('beat'); if (Sfx.soundOn()) Sfx.tick && Sfx.tick(); }
    const ph = (now - lastBeat) / per; const y = ph < 0.06 ? -Math.sin(ph / 0.06 * Math.PI) * 45 : ph < 0.12 ? Math.sin((ph - 0.06) / 0.06 * Math.PI) * 14 : ph > 0.35 && ph < 0.5 ? -Math.sin((ph - 0.35) / 0.15 * Math.PI) * 8 : 0;
    pts.push(y); if (pts.length > 280) pts.shift();
    ctx.clearRect(0, 0, 560, 120); ctx.strokeStyle = '#ff5a7a'; ctx.lineWidth = 3; ctx.beginPath(); pts.forEach((v, i) => { const x = i * 2; i ? ctx.lineTo(x, 60 + v) : ctx.moveTo(x, 60 + v); }); ctx.stroke();
  };
  const btns = ACTS.map(([k, l, b, img]) => h('button', { class: 'btn', type: 'button', 'data-testid': 'lb-act-' + k, onclick: (e) => {
    goal = b; kid.src = img; kid.className = 'lb-kid ' + k; tried.add(k); [...e.currentTarget.parentNode.children].forEach((x) => x.classList.toggle('primary', x === e.currentTarget));
    talk(k === 'repos' ? 'Au repos, le cœur bat calmement : environ 70 battements par minute.' : k === 'marche' ? 'En marchant, les muscles travaillent un peu plus : le cœur accélère.' : 'Quand on court ou qu’on saute, les muscles ont besoin de beaucoup d’oxygène : le cœur bat très vite pour leur en envoyer !');
    if (tried.size >= 4 && !q.childElementCount) qcm(q, talk, [
      { q: 'Pourquoi le cœur bat-il plus vite quand on court ?', opts: ['Les muscles ont besoin de plus d’oxygène', 'Parce qu’on a peur', 'Il ne bat pas plus vite'], why: 'Le sang apporte l’oxygène aux muscles : plus ils travaillent, plus le cœur pompe vite.' },
      { q: 'Où peut-on sentir son pouls ?', opts: ['Au poignet ou au cou', 'Dans les cheveux', 'Sur les ongles'], why: 'Pose deux doigts sur ton poignet : chaque petit coup, c’est un battement du cœur !' },
    ], () => finish('coeur', q));
  } }, l));
  const q = h('div');
  body.replaceChildren(h('p', { class: 'prompt' }, 'Fais bouger Maissa et regarde son cœur : essaie les quatre activités !'), h('div', { class: 'lb-cardio' }, kid, h('div', { class: 'lb-hz' }, heart, h('div', null, num, h('small', null, ' battements / minute')))), cv, h('div', { class: 'actions wrap' }, ...btns),
    h('p', { class: 'muted' }, '💡 Expérience : pose deux doigts sur ton poignet, compte les battements pendant 15 secondes, puis multiplie par 4 !'), q);
  raf = requestAnimationFrame(loop); talk('Voici le cœur de Maissa. Fais-la bouger et observe !');
  return () => cancelAnimationFrame(raf);
}

// ---------- 5. le voyage d'une pomme ----------
const ETAPES = [
  { k: 'bouche', n: '👄 La bouche', x: 150, y: 128, t: 'Les dents coupent et écrasent la pomme. La salive la mouille pour qu’elle glisse.' },
  { k: 'oesophage', n: '🛝 L’œsophage', x: 150, y: 205, t: 'Un tuyau qui descend jusqu’à l’estomac. Les muscles poussent la bouchée, même la tête en bas !' },
  { k: 'estomac', n: '🫙 L’estomac', x: 172, y: 285, t: 'Il brasse la pomme avec des sucs : elle devient une bouillie.' },
  { k: 'grele', n: '🌀 L’intestin grêle', x: 150, y: 360, t: 'Un tube de plusieurs mètres ! Les nutriments passent à travers sa paroi, dans le sang.' },
  { k: 'gros', n: '🔁 Le gros intestin', x: 112, y: 345, t: 'Il récupère l’eau. Ce qui reste, ce sont les selles (les médecins disent aussi les fèces), qui sortent aux toilettes.' },
];
function pomme(body, talk) {
  const W = 300, H = 672;
  const pl = h('div', { class: 'lb-board lb-dig', style: `aspect-ratio:${W}/${H}` }, h('img', { class: 'lb-bg', src: IMG.body, alt: '', draggable: 'false' }),
    ...[['stomach', 170, 262, 56], ['liver', 136, 262, 84], ['intestines', 150, 322, 96]].map(([k, cx, top, w]) => h('img', { class: 'lb-slot on', src: IMG[k], alt: '', style: `left:${(cx - w / 2) / W * 100}%;top:${top / H * 100}%;width:${w / W * 100}%;opacity:.85` })));
  const tube = `<svg class="lb-tube" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="M150 128 L150 150 Q150 200 152 240 Q160 270 172 285 Q160 320 150 360 Q130 372 112 345" fill="none" stroke="#ffd36b" stroke-width="5" stroke-dasharray="6 8" opacity=".8"/></svg>`;
  pl.insertAdjacentHTML('beforeend', tube);
  const apple = h('span', { class: 'lb-apple' }, '🍎'); pl.append(apple);
  const info = h('div', { class: 'lb-step' }), next = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'lb-next' }, 'Avancer ▶'), q = h('div');
  let i = -1;
  const go = () => {
    i++; if (i >= ETAPES.length) { next.remove(); ordre(); return; }
    const E = ETAPES[i]; apple.style.left = E.x / W * 100 + '%'; apple.style.top = E.y / H * 100 + '%'; apple.style.transform = `translate(-50%,-50%) scale(${1 - i * 0.14})`;
    info.replaceChildren(h('b', null, `${i + 1}. ${E.n}`), h('p', null, E.t)); talk(E.t); Sfx.bloop();
    if (i === ETAPES.length - 1) next.textContent = 'Terminer ✓';
  };
  next.onclick = go;
  const ordre = () => {
    talk('Remets les étapes du voyage dans l’ordre : touche-les de la première à la dernière.');
    const order = h('div', { class: 'lb-order' }); let k = 0, err = 0;
    shuffle(ETAPES).forEach((E) => order.append(h('button', { class: 'btn', type: 'button', 'data-k': E.k, onclick: (e) => {
      const b = e.currentTarget; if (b.disabled) return;
      if (E.k === ETAPES[k].k) { b.disabled = true; b.textContent = `${k + 1}. ${E.n}`; b.classList.add('ok'); k++; Sfx.ok(); if (k === ETAPES.length) { Sfx.win(); burst(q); star(err ? 1 : 2); talk('Bravo ! Bouche, œsophage, estomac, intestin grêle, gros intestin : le grand voyage de la pomme !'); finish('pomme', q); } }
      else { err++; Sfx.ko(); b.classList.add('nope'); setTimeout(() => b.classList.remove('nope'), 400); talk('Pas encore ! Pense au chemin de la pomme, depuis la bouche.'); }
    } }, E.n)));
    q.replaceChildren(h('p', { class: 'prompt' }, 'Dans quel ordre la pomme voyage-t-elle ?'), order);
  };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Suis le voyage d’une pomme dans le corps !'), h('div', { class: 'lb-work' }, pl, h('div', { class: 'lb-side' }, info, next)), q);
  talk('Croque ! La pomme commence son grand voyage…'); go();
}

let greeted = false;
export function open(tab = 'squelette') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div'); let stop = null;
  const T = [['squelette', '🦴 Le squelette', squelette], ['organes', '🫀 Les organes', organes], ['microscope', '🔬 Le microscope', microscope], ['coeur', '💓 Le cœur en action', coeur], ['pomme', '🍎 Le voyage d’une pomme', pomme]];
  const st = ST();
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'lb-tab-' + k, onclick: () => go(k) }, (st.done[k] ? '✅ ' : '') + l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel lb-panel' }, UI.closeButton(), h('h2', null, '🥼 Le laboratoire du corps humain'), h('div', { class: 'actions wrap' }, ...tabs), body, say),
    { label: 'Le laboratoire du corps humain', onClose: () => { Voice.stop(); if (stop) stop(); } });
  function go(k) { if (stop) { stop(); stop = null; } tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); Voice.stop(); stop = T.find((x) => x[0] === k)[2](body, talk) || null; }
  if (!greeted && Sfx.soundOn()) { greeted = true; playFile('assets/voice/labo_intro.mp3'); }
  go(tab);
}

// ---------- le stéthoscope de Papa : écouter le cœur, les poumons, le ventre ----------
let actx = null;
const ac = () => { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx; };
function thump(t, f = 55, g = 0.9) { const c = ac(), o = c.createOscillator(), v = c.createGain(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.12); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + 0.015); v.gain.exponentialRampToValueAtTime(0.001, t + 0.16); o.connect(v).connect(c.destination); o.start(t); o.stop(t + 0.2); }
function noise(t, dur, f, g, q = 0.7) { const c = ac(), n = c.createBufferSource(), b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; n.buffer = b; const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q; const v = c.createGain(); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + dur * 0.4); v.gain.linearRampToValueAtTime(0, t + dur); n.connect(fl).connect(v).connect(c.destination); n.start(t); n.stop(t + dur); }
const SONS = {
  coeur: (n = 6, bpm = 80) => { const t0 = ac().currentTime + 0.05, p = 60 / bpm; for (let i = 0; i < n; i++) { thump(t0 + i * p, 60, 0.9); thump(t0 + i * p + 0.28, 75, 0.6); } return n * p; },
  poumon: () => { const t0 = ac().currentTime + 0.05; for (let i = 0; i < 2; i++) { noise(t0 + i * 3.6, 1.6, 900, 0.35); noise(t0 + i * 3.6 + 1.7, 1.8, 600, 0.25); } return 7.2; },
  ventre: () => { const c = ac(), t0 = c.currentTime + 0.05; for (let i = 0; i < 5; i++) { const t = t0 + i * 0.6 + Math.random() * 0.3, o = c.createOscillator(), v = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(180 + Math.random() * 120, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.35); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(0.25, t + 0.05); v.gain.exponentialRampToValueAtTime(0.001, t + 0.4); o.connect(v).connect(c.destination); o.start(t); o.stop(t + 0.45); noise(t, 0.3, 300, 0.12, 2); } return 3.4; },
};
const POINTS = [
  { k: 'coeur', n: '💓 Le cœur', x: 0.54, y: 0.345, s: 'coeur', t: 'Boum-boum, boum-boum ! Ce sont les valves du cœur qui se ferment : deux bruits à chaque battement.', q: 'Combien de bruits entends-tu à chaque battement ?', o: ['Deux : boum-boum', 'Un seul', 'Aucun'] },
  { k: 'pg', n: '🫁 Le poumon gauche', x: 0.39, y: 0.37, s: 'poumon', t: 'Chhh… quand on inspire, l’air entre ; quand on expire, il ressort. Le docteur écoute si l’air passe bien.', q: 'Que fait l’air quand on inspire ?', o: ['Il entre dans les poumons', 'Il sort des poumons', 'Il va dans l’estomac'] },
  { k: 'pd', n: '🫁 Le poumon droit', x: 0.62, y: 0.37, s: 'poumon', t: 'On écoute aussi l’autre poumon : on a deux poumons, un à gauche, un à droite.', q: 'Combien avons-nous de poumons ?', o: ['Deux', 'Un', 'Quatre'] },
  { k: 'ventre', n: '🍽️ Le ventre', x: 0.5, y: 0.56, s: 'ventre', t: 'Glouglou… ce sont les intestins qui font avancer les aliments. C’est normal, même sans avoir faim !', q: 'D’où viennent les gargouillis du ventre ?', o: ['Des intestins qui travaillent', 'Du cœur', 'Des os'] },
];
export function stetho() {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s) => { say.textContent = s; };
  const done = new Set(), board = h('div', { class: 'lb-board st-board', style: 'aspect-ratio:300/672' }, h('img', { class: 'lb-bg', src: IMG.body, alt: '' }),
    ...ORG.map((o) => h('img', { class: 'lb-slot on', src: o.img, alt: '', style: `left:${(o.cx - o.w / 2) / 300 * 100}%;top:${o.top / 672 * 100}%;width:${o.w / 300 * 100}%;z-index:${o.z};opacity:.8` })));
  const head = h('span', { class: 'st-head' }, '🩺');
  const q = h('div');
  const spots = POINTS.map((P) => { const b = h('button', { class: 'st-spot', type: 'button', 'data-testid': 'st-' + P.k, 'aria-label': P.n, style: `left:${P.x * 100}%;top:${P.y * 100}%` }); b.onclick = () => listen(P, b); return b; });
  board.append(...spots, head);
  const listen = (P, b) => {
    head.style.left = P.x * 100 + '%'; head.style.top = P.y * 100 + '%'; head.classList.add('on');
    board.classList.toggle('beat', P.s === 'coeur'); board.classList.toggle('breath', P.s === 'poumon');
    let dur = 2; try { dur = Sfx.soundOn() ? SONS[P.s]() : 2; } catch (e) { /* sans son */ }
    talk(`${P.n} : ${P.t}`); b.classList.add('done');
    setTimeout(() => { board.classList.remove('beat', 'breath'); if (done.has(P.k)) return; done.add(P.k);
      qcm(q, (s) => talk(s), [{ q: P.q, opts: P.o, why: P.t }], () => { star(); if (done.size >= POINTS.length) { Sfx.win(); burst(q); talk('Bravo, docteure Maissa ! Tu as tout écouté. Merci Papa pour le stéthoscope !'); const st = ST(); st.stetho = true; S.save(); } });
    }, Math.min(4000, dur * 1000));
  };
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel lb-panel' }, UI.closeButton(), h('h2', null, '🩺 Le stéthoscope de Papa'),
    h('p', { class: 'prompt' }, 'Touche un point lumineux pour poser le stéthoscope et écouter. Écoute les quatre !'), h('div', { class: 'lb-work' }, board, q), say), { label: 'Le stéthoscope de Papa' });
  talk('Papa, j’emprunte ton stéthoscope ! On écoute le cœur, les poumons… et le ventre !');
}
