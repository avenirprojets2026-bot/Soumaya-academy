// Les actualités du monde (« Les Explorateurs de l'Actualité ») : de petites découvertes cachées dans les décors.
// Chaque actualité = une fiche de données (ACTUS) ; le moteur ci-dessous l'affiche en 6 temps :
// 1. question de découverte · 2. explication illustrée (+ courte vidéo facultative) · 3. compréhension ·
// 4. activité interactive adaptée au décor · 5. réflexion · 6. correction expliquée et bilan.
// AJOUTER UNE ACTUALITÉ : copier une fiche, changer id/date/source/scene/spot, le texte et les étapes. Aucun autre fichier à modifier.
// Règle : uniquement des faits vérifiés, avec la source ; les plus récentes s'affichent dans le décor, les plus anciennes restent consultables.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { playFile } from './papa.js';
import { burst, shuffle, qcm, log } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.actus = b.actus || {}; return b.actus; };
const voice = (u) => { if (u && Sfx.soundOn()) playFile(u); };

// ---------- les fiches (chemins écrits en entier pour la version « fichier unique ») ----------
export const ACTUS = [
  {
    id: 'adenot-2026-10', date: '8 octobre 2026', scene: 'observatoire',
    spot: { x: 0.43, y: 0.05, icon: '🌟', label: 'Une étoile scintille…', stand: { x: 0.38, y: 0.86 } },
    titre: 'Sophie Adenot revient sur Terre après 235 jours dans l’espace',
    sources: [['CNES — Retour sur Terre de Sophie Adenot', 'https://cnes.fr/evenements/retour-terre-de-sophie-adenot'], ['Euronews, 8 octobre 2026', 'https://fr.euronews.com/2026/10/08/lastronaute-sophie-adenot-de-retour-sur-terre-apres-un-sejour-spatial-record']],
    notions: ['Éveil scientifique : la Terre dans l’espace, la pesanteur', 'Le corps humain : muscles et os', 'Mathématiques : les durées (jours, semaines, mois)'],
    resume: 'L’astronaute française Sophie Adenot a passé 235 jours (presque 8 mois) dans la Station spatiale internationale (ISS), qui tourne autour de la Terre. Elle y a réalisé plus de 200 expériences scientifiques et trois sorties dans l’espace. Le 8 octobre 2026, sa capsule est revenue sur Terre en se posant dans l’océan Pacifique, freinée par de grands parachutes. C’est le plus long séjour dans l’espace d’un astronaute européen.',
    intro: { say: 'Papaaa ! Regarde ! Tu savais que les astronautes pouvaient vivre plusieurs mois dans l’espace ? Mais comment ils font pour dormir sans tomber ? Viens, on va découvrir ça !', voice: 'assets/voice/actu_adenot_intro.mp3' },
    fin: { say: 'Papa ! Moi aussi, j’aimerais voir la Terre depuis l’espace ! Ça doit être magnifique !', voice: 'assets/voice/actu_adenot_fin.mp3' },
    video: 'assets/cine/actu_iss.webm',
    decouverte: { q: 'À ton avis, combien de temps Sophie est-elle restée dans l’espace ?', opts: ['Presque 8 mois (235 jours)', '3 jours', '3 semaines'], why: '235 jours, c’est presque 8 mois ! C’est le plus long séjour dans l’espace pour un astronaute européen.' },
    cartes: [['🛰️', 'L’ISS', 'Une grande station qui tourne autour de la Terre à environ 400 km d’altitude. Elle fait le tour de la Terre en 1 h 30 environ.'], ['📅', '235 jours', 'Presque 8 mois loin de la Terre, avec 3 autres astronautes.'], ['🧪', 'Plus de 200 expériences', 'Des expériences scientifiques impossibles à faire sur Terre.'], ['👩‍🚀', '3 sorties dans l’espace', 'En scaphandre, pour entretenir la station.'], ['🪂', 'Retour en capsule', 'Freinée par de grands parachutes, la capsule s’est posée dans l’océan Pacifique.']],
    comprehension: [
      { q: 'Pourquoi les astronautes semblent-ils flotter dans la station ?', opts: ['Parce que la station et eux « tombent » ensemble autour de la Terre, à toute vitesse', 'Parce qu’il n’y a plus du tout de pesanteur dans l’espace', 'Parce qu’ils sont plus légers que l’air'], why: 'La Terre les attire encore ! Mais la station et les astronautes tombent ensemble en faisant le tour de la Terre : ils flottent les uns par rapport aux autres. On parle d’apesanteur ou de microgravité.' },
      { q: 'Pourquoi les astronautes font-ils du sport tous les jours dans l’espace ?', opts: ['Sans poids à porter, leurs muscles et leurs os s’affaiblissent', 'Pour ne pas s’ennuyer', 'Pour se réchauffer'], why: 'Sur Terre, nos muscles et nos os travaillent sans arrêt pour nous porter. Dans l’espace, ils ne travaillent presque plus : il faut faire environ 2 heures de sport par jour, attaché au tapis de course ou au vélo.' },
      { q: 'Comment les astronautes dorment-ils dans la station ?', opts: ['Dans un sac de couchage accroché au mur, pour ne pas flotter partout', 'Dans un lit normal avec un oreiller', 'Ils ne dorment jamais'], why: 'Pas de haut ni de bas : ils s’attachent dans un sac de couchage fixé au mur, comme une petite cabine !' },
    ],
    activite: 'microgravite',
    reflexion: [
      { q: '235 jours, c’est environ combien de semaines ? (une semaine = 7 jours)', opts: ['Environ 33 semaines', 'Environ 23 semaines', 'Environ 100 semaines'], why: '235 ÷ 7 ≈ 33 (car 33 × 7 = 231). Presque 33 semaines et demie !' },
      { q: 'Et toi, qu’est-ce qui te manquerait le plus, 8 mois dans l’espace ?', opts: ['Ma famille', 'Mes amis et Muezza', 'Les balades dehors', 'La bonne cuisine'], free: true, why: 'Il n’y a pas de mauvaise réponse ! Les astronautes parlent souvent à leur famille par vidéo, et regardent la Terre par le hublot.' },
    ],
  },
];

// ---------- injection discrète dans les décors : la plus récente de chaque salle ----------
export function injectSpots(SCENES) {
  const byScene = {};
  ACTUS.forEach((a) => { (byScene[a.scene] = byScene[a.scene] || []).push(a); });
  Object.entries(byScene).forEach(([sc, list]) => {
    const def = SCENES[sc]; if (!def) return; const a = list[0];
    if (def.hotspots.some((x) => x.id === 'actu-' + a.id)) return;
    def.hotspots.push({ id: 'actu-' + a.id, cls: 'hs-actu', label: a.spot.label, icon: a.spot.icon, x: a.spot.x, y: a.spot.y, stand: a.spot.stand, act: { type: 'panel', panel: 'actu-' + a.id } });
  });
}

// ---------- activités interactives réutilisables ----------
const ACT = {
  // objets qui tombent sur Terre / flottent dans la station + classement
  microgravite(zone, talk, done) {
    const W = 600, H = 300, cv = h('canvas', { class: 'ac-cv', width: W, height: H, 'data-testid': 'ac-cv' }), c = cv.getContext('2d');
    let mode = 'terre', raf = 0; const OB = [['✏️', 120], ['🍎', 240], ['💧', 360], ['🧸', 480]];
    let objs = []; const reset = () => { objs = OB.map(([e, x], i) => ({ e, x, y: 70 + (i % 2) * 30, vx: 0, vy: 0, r: 22, a: 0, va: 0 })); };
    reset();
    const step = () => {
      c.clearRect(0, 0, W, H);
      const g = c.createLinearGradient(0, 0, 0, H); if (mode === 'terre') { g.addColorStop(0, '#bfe3ff'); g.addColorStop(1, '#f6ecd2'); } else { g.addColorStop(0, '#0d1a3a'); g.addColorStop(1, '#22305e'); }
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      if (mode === 'terre') { c.fillStyle = '#8a6a42'; c.fillRect(0, H - 26, W, 26); } else { c.fillStyle = '#ffffff22'; for (let i = 0; i < 40; i++) c.fillRect((i * 97) % W, (i * 53) % H, 2, 2); c.strokeStyle = '#9fb3e055'; c.lineWidth = 6; c.strokeRect(6, 6, W - 12, H - 12); }
      objs.forEach((o) => {
        if (mode === 'terre') { o.vy += 0.5; o.vx *= 0.98; } else { o.vx *= 0.999; o.vy *= 0.999; }
        o.x += o.vx; o.y += o.vy; o.a += o.va;
        const floor = mode === 'terre' ? H - 26 - o.r : H - 10 - o.r;
        if (o.y > floor) { o.y = floor; o.vy *= mode === 'terre' ? -0.3 : -0.8; o.vx *= mode === 'terre' ? 0.8 : 1; o.va *= 0.8; }
        if (o.y < 10 + o.r) { o.y = 10 + o.r; o.vy *= -0.8; }
        if (o.x < 10 + o.r || o.x > W - 10 - o.r) { o.x = Math.max(10 + o.r, Math.min(W - 10 - o.r, o.x)); o.vx *= -0.8; }
        c.save(); c.translate(o.x, o.y); c.rotate(o.a); c.font = '40px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        if (o.e === '💧' && mode === 'iss') { c.fillStyle = '#7fd0ffcc'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill(); c.fillStyle = '#ffffffaa'; c.beginPath(); c.arc(-6, -6, 5, 0, 7); c.fill(); } else c.fillText(o.e, 0, 0);
        c.restore();
      });
      raf = requestAnimationFrame(step);
    };
    cv.addEventListener('pointerdown', (e) => { const r = cv.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W, py = (e.clientY - r.top) / r.height * H; objs.forEach((o) => { const d = Math.hypot(o.x - px, o.y - py); if (d < 80) { o.vx += (o.x - px) / (d + 1) * 6; o.vy += (o.y - py) / (d + 1) * 6 - (mode === 'terre' ? 4 : 0); o.va += (Math.random() - 0.5) * 0.15; } }); Sfx.tap(); });
    const mb = (m, l) => h('button', { class: 'btn small' + (m === mode ? ' primary' : ''), type: 'button', 'data-testid': 'ac-mode-' + m, onclick: (e) => { mode = m; reset(); [...e.currentTarget.parentNode.children].forEach((b) => b.classList.toggle('primary', b === e.currentTarget)); talk(m === 'terre' ? 'Sur Terre, tout retombe vers le sol.' : 'Dans la station, les objets flottent ! Pousse-les : ils continuent tout droit jusqu’à toucher une paroi. Et la goutte d’eau devient une boule !', false); } }, l);
    const sort = h('div');
    const ITEMS = [['La goutte d’eau tombe dans le verre.', 'T'], ['La goutte d’eau forme une boule qui flotte.', 'S'], ['On dort dans un lit, la tête sur l’oreiller.', 'T'], ['On dort dans un sac de couchage accroché au mur.', 'S'], ['Un crayon lâché tombe par terre.', 'T'], ['Un crayon lâché reste en l’air et dérive.', 'S']];
    const cls = () => { const pool = shuffle(ITEMS); let i = 0, ok = 0; const cur = h('div', { class: 'ac-item' }); const nxt = () => { if (i >= pool.length) { cur.textContent = `${ok}/${pool.length} bien classés !`; if (ok >= 5) { Sfx.win(); star(2); } done(); return; } cur.textContent = pool[i][0]; };
      const pick = (k) => { if (i >= pool.length) return; if (pool[i][1] === k) { ok++; Sfx.ok(); talk('Oui !', false); } else { Sfx.ko(); talk(pool[i][1] === 'S' ? 'Non : ça se passe dans la station spatiale.' : 'Non : ça se passe sur Terre.', false); } i++; setTimeout(nxt, 700); };
      sort.replaceChildren(h('p', { class: 'prompt' }, 'Classe : sur Terre ou dans la station ?'), cur, h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', 'data-testid': 'ac-T', onclick: () => pick('T') }, '🌍 Sur Terre'), h('button', { class: 'btn', type: 'button', 'data-testid': 'ac-S', onclick: () => pick('S') }, '🛰️ Dans la station'))); nxt(); };
    zone.replaceChildren(h('p', { class: 'prompt' }, '🧪 Expérience virtuelle : touche près des objets pour les pousser, sur Terre puis dans la station.'), h('div', { class: 'actions' }, mb('terre', '🌍 Sur Terre'), mb('iss', '🛰️ Dans la station')), cv, h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ac-sort', onclick: cls }, 'J’ai compris → Classer')), sort);
    step(); talk('Expérience virtuelle ! Pousse les objets sur Terre, puis dans la station spatiale.', false);
    return () => cancelAnimationFrame(raf);
  },
};

// ---------- le parcours en 6 temps ----------
export function open(id) {
  const a = ACTUS.find((x) => x.id === id) || ACTUS[0];
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const steps = h('div', { class: 'ac-steps' }), zone = h('div', { class: 'ac-zone' });
  const NAMES = ['🔎 Découvrir', '📖 Comprendre', '❓ Questions', '🧪 Expérience', '💭 Réflexion', '🏅 Bilan'];
  let stop = null;
  const mark = (k) => steps.replaceChildren(...NAMES.map((n, i) => h('span', { class: i < k ? 'done' : i === k ? 'on' : '' }, n)));
  const nextBtn = (f, l = 'Continuer →') => h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ac-next', onclick: f }, l));
  const s1 = () => { mark(0); const host = h('div'); zone.replaceChildren(h('p', { class: 'muted' }, `📰 ${a.date}`), h('h3', { class: 'ac-t' }, a.titre), h('p', { class: 'ac-intro' }, '« ' + a.intro.say + ' »'), host); voice(a.intro.voice); qcm(host, talk, [a.decouverte], () => host.append(nextBtn(s2))); };
  const s2 = () => {
    mark(1); const vid = a.video ? h('video', { class: 'ac-vid', src: a.video, playsinline: '', controls: '', preload: 'auto' }) : null;
    if (vid) { vid.playsInline = true; vid.muted = !Sfx.soundOn(); vid.addEventListener('error', () => vid.remove()); setTimeout(() => vid.play().catch(() => {}), 80); }
    zone.replaceChildren(...[h('p', { class: 'ac-res' }, a.resume), vid, h('div', { class: 'ac-cards' }, ...a.cartes.map(([ic, t, d]) => h('div', { class: 'ac-card' }, h('span', null, ic), h('b', null, t), h('small', null, d)))), nextBtn(() => { if (vid) vid.pause(); s3(); })].filter(Boolean));
    talk(a.resume, false);
  };
  const s3 = () => { mark(2); const host = h('div'); zone.replaceChildren(host); qcm(host, talk, a.comprehension, () => { star(1); host.append(nextBtn(s4)); }); };
  const s4 = () => { mark(3); const box = h('div'); zone.replaceChildren(box); stop = ACT[a.activite](box, talk, () => box.append(nextBtn(() => { if (stop) stop(); stop = null; s5(); }))); };
  const s5 = () => {
    mark(4); const host = h('div'); zone.replaceChildren(host);
    const list = a.reflexion.map((q) => (q.free ? { ...q, opts: q.opts } : q));
    // une question « libre » : toutes les réponses sont bonnes
    let k = 0; const ask = () => { if (k >= list.length) return host.append(nextBtn(s6, '🏅 Voir mon bilan')); const q = list[k++]; if (!q.free) { const sub = h('div'); host.append(sub); qcm(sub, talk, [q], ask); return; }
      const sub = h('div', { class: 'ac-free' }, h('p', { class: 'prompt' }, q.q), h('div', { class: 'th-choices' }, ...q.opts.map((o) => h('button', { class: 'choice', type: 'button', 'data-k': 0, onclick: (e) => { e.currentTarget.parentNode.querySelectorAll('button').forEach((b) => { b.disabled = true; }); e.currentTarget.classList.add('ok'); Sfx.ok(); sub.append(h('p', { class: 'muted' }, '💙 ' + q.why)); talk(q.why, false); ask(); } }, o)))); host.append(sub); };
    ask();
  };
  const s6 = () => {
    mark(5); const st = ST(), first = !st[a.id]; st[a.id] = Date.now(); S.save(); if (first) star(2); log('actus', 1);
    zone.replaceChildren(...[h('div', { class: 'ac-bilan' }, h('h3', null, '🏅 Bravo, petite exploratrice de l’actualité !'), h('p', { class: 'ac-intro' }, '« ' + a.fin.say + ' »'), h('p', null, h('b', null, 'Ce que tu as appris : ')), h('ul', null, ...a.notions.map((n) => h('li', null, n))),
      h('details', { class: 'ac-src' }, h('summary', null, '📚 Pour les parents : les sources'), h('ul', null, ...a.sources.map(([n, u]) => h('li', null, h('a', { href: u, target: '_blank', rel: 'noopener' }, n)))))),
    others()].filter(Boolean));
    burst(zone); Sfx.win(); voice(a.fin.voice); talk(a.fin.say, false);
  };
  const others = () => { const list = ACTUS.filter((x) => x.scene === a.scene && x.id !== a.id); return list.length ? h('div', { class: 'ac-older' }, h('b', null, '🗞️ Autres découvertes de cette salle :'), ...list.map((x) => h('button', { class: 'btn small', type: 'button', onclick: () => { UI.closeDialog(); setTimeout(() => open(x.id), 200); } }, `${x.date} — ${x.titre}`))) : null; };
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ac-panel' }, UI.closeButton(), h('h2', null, '🌍 Les Explorateurs de l’Actualité'), steps, zone, say), { label: 'Actualité', onClose: () => { if (stop) stop(); Voice.stop(); } });
  s1();
}
