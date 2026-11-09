// Le Kiosque à poèmes (poésie, P4) : les rimes, le vers et la strophe, fabriquer son poème, réciter (mémoriser).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle } from './workshop.js';
import { POEMES } from './anthologie_data.js';
import { playFile } from './papa.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.poemes = b.poemes || { ok: {} }; return b.poemes; };
const done = (k) => { const st = ST(); if (!st.ok[k]) { st.ok[k] = true; star(2); } if (Object.keys(st.ok).length >= 4) st.badge = true; S.save(); };

// ---------- 1. la chasse aux rimes ----------
const RIMES = [
  ['chat', 'rat', ['chien', 'lune']], ['bateau', 'château', ['mer', 'voile']], ['fleur', 'couleur', ['jardin', 'rose']], ['soleil', 'abeille', ['ciel', 'chaud']],
  ['étoile', 'voile', ['nuit', 'lune']], ['maison', 'poisson', ['porte', 'toit']], ['jardin', 'lapin', ['arbre', 'herbe']], ['souris', 'tapis', ['fromage', 'chat']],
  ['nuage', 'plage', ['pluie', 'vent']], ['hibou', 'genou', ['nuit', 'plume']],
];
function rimes(body, talk) {
  let n = 0, ok = 0; const Q = shuffle(RIMES.slice()).slice(0, 8); const zone = h('div'), sc = h('p', { class: 'muted' });
  const next = () => {
    if (n >= Q.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `Bravo ! ${ok}/${Q.length}`)); if (ok >= 6) { done('rimes'); Sfx.win(); burst(body); } return; }
    const [w, r, bad] = Q[n++];
    zone.replaceChildren(h('p', { class: 'tb-q' }, `Quel mot rime avec « ${w} » ?`), h('div', { class: 'actions wrap' }, ...shuffle([r, ...bad]).map((o) => h('button', { class: 'btn', type: 'button', 'data-testid': o === r ? 'po-ok' : 'po-ko', onclick: () => {
      if (o === r) { ok++; Sfx.ok(); talk(`Oui ! ${w}, ${r} : on entend le même son à la fin !`); } else { Sfx.ko(); talk(`Non, écoute la fin des mots : ${w}… ${r} !`); } sc.textContent = `${n}/${Q.length} · ✔ ${ok}`; setTimeout(next, 1800);
    } }, o))));
    talk(`Quel mot rime avec ${w} ?`);
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '🎵 Deux mots riment quand ils se terminent par le même son.'), zone, sc);
  next();
}

// ---------- 2. le vers et la strophe ----------
const POEME = [
  ['Muezza dort au bord du toit,', 'Le vent lui chante une chanson,', 'Elle rêve d’un bol de lait froid', 'Et d’un ciel rempli de poissons.'],
  ['La lune allume sa lanterne,', 'Les étoiles sortent sans bruit,', 'Et Maissa, près de la citerne,', 'Compte les rêves de la nuit.'],
];
function vers(body, talk) {
  const box = h('div', { class: 'po-poem' }, ...POEME.map((st, i) => h('div', { class: 'po-strophe', 'data-i': i }, ...st.map((v) => h('p', { class: 'po-vers' }, v)))));
  const res = h('div', { class: 'ea-step' }); let step = 0;
  const QS = [
    ['Combien de vers dans ce poème ?', ['8', '2', '4'], '8', 'Un vers, c’est une ligne du poème. Il y en a 8 !', () => box.querySelectorAll('.po-vers').forEach((v) => v.classList.add('hl'))],
    ['Combien de strophes ?', ['2', '8', '1'], '2', 'Une strophe, c’est un paquet de vers, séparé par un espace. Ici : 2 strophes de 4 vers.', () => box.querySelectorAll('.po-strophe').forEach((v) => v.classList.add('hl'))],
    ['Avec quel mot rime « toit » ?', ['froid', 'chanson', 'poissons'], 'froid', 'toit / froid : même son « oi » à la fin. Les rimes sont croisées : A B A B !', () => {}],
  ];
  const ask = () => {
    if (step >= QS.length) { res.replaceChildren(h('b', null, '📏 À retenir'), h('p', null, 'Un VERS = une ligne. Une STROPHE = un groupe de vers. Une RIME = le même son à la fin des vers.')); done('vers'); Sfx.win(); return; }
    const [q, opts, a, why, fx] = QS[step];
    res.replaceChildren(h('b', null, q), h('div', { class: 'actions wrap' }, ...opts.map((o) => h('button', { class: 'btn', type: 'button', 'data-testid': o === a ? 'po-v-ok' : 'po-v-ko', onclick: () => {
      if (o === a) { Sfx.ok(); fx(); talk(why); step++; setTimeout(ask, 2200); } else { Sfx.ko(); talk('Essaie encore ! Regarde bien le poème.'); }
    } }, o))));
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '📏 Observe le poème « La nuit de Muezza ».'), h('div', { class: 'ea-wrap' }, box, h('div', { class: 'ea-side' }, res, h('button', { class: 'btn', type: 'button', onclick: () => talk(POEME.map((s) => s.join(' ')).join(' ')) }, '🔊 Écouter le poème'))));
  ask();
}

// ---------- 3. fabrique ton poème ----------
const FAB = [
  { l: 'Dans mon jardin, il y a un…', o: [['lapin', 'in'], ['papillon', 'on'], ['oiseau', 'o']] },
  { l: 'qui…', o: [['danse sous la pluie', 'ui'], ['chante tout le jour', 'our'], ['mange une fleur', 'eur']] },
  { l: 'Et dans le ciel, il y a…', o: [['un nuage tout gris', 'i'], ['une étoile en velours', 'our'], ['un soleil rieur', 'eur']] },
  { l: 'qui…', o: [['me fait un grand sourire', 'ire'], ['joue avec la nuit', 'ui'], ['me donne du bonheur', 'eur']] },
];
function fabrique(body, talk) {
  const pick = []; const poem = h('div', { class: 'po-poem mine' }); const zone = h('div');
  const end = (s) => s.replace(/[^a-zàâéèêëîïôûùç]+$/i, '');
  const show = () => {
    poem.replaceChildren(...pick.map((p, i) => h('p', { class: 'po-vers' }, (i % 2 ? '' : '') + FAB[i].l.replace('…', ' ') + p[0] + (i % 2 ? '.' : ','))));
    const i = pick.length;
    if (i >= FAB.length) { const rime = pick[1][1] === pick[3][1]; zone.replaceChildren(h('div', { class: 'ea-step' }, h('b', null, rime ? '🎉 Tes vers 2 et 4 riment ! Quel beau poème !' : '✨ Joli poème ! Pour qu’il rime, choisis des fins de vers qui sonnent pareil (vers 2 et 4).')), h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', onclick: () => talk(pick.map((p, k) => FAB[k].l.replace('…', ' ') + p[0]).join('. ')) }, '🔊 Écouter mon poème'), h('button', { class: 'btn', type: 'button', onclick: () => { pick.length = 0; show(); } }, '↺ Un autre')));
      if (rime) { done('fabrique'); Sfx.win(); burst(body); } talk(rime ? 'Bravo, tes vers riment !' : 'Joli poème ! Essaie de faire rimer les vers 2 et 4.'); return; }
    zone.replaceChildren(h('p', { class: 'tb-q' }, `Vers ${i + 1} : ${FAB[i].l}`), h('div', { class: 'actions wrap' }, ...FAB[i].o.map((o) => h('button', { class: 'btn', type: 'button', 'data-testid': 'po-fab', onclick: () => { pick.push(o); Sfx.coin(); show(); } }, o[0]))));
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '✍️ Choisis la suite de chaque vers et fabrique ton poème. Astuce : fais rimer le vers 2 avec le vers 4 !'), poem, zone);
  void end; show();
}

// ---------- 4. réciter ----------
function reciter(body, talk) {
  let hide = 0; const box = h('div', { class: 'po-poem' }); const words = POEME[0].map((v) => v.split(' '));
  const draw = () => { box.replaceChildren(...words.map((ws, i) => h('p', { class: 'po-vers' }, ...ws.map((w, j) => { const hid = hide > 0 && (j + i) % 4 < hide; return h('span', { class: hid ? 'po-hid' : '' }, hid ? '_'.repeat(Math.max(2, w.length)) + ' ' : w + ' '); })))); };
  const lvl = h('small', { class: 'muted' });
  const upd = () => { lvl.textContent = ['Lis le poème.', 'Niveau 1 : quelques mots sont cachés.', 'Niveau 2 : la moitié des mots est cachée !', 'Niveau 3 : presque tout est caché. Tu le connais par cœur ?', 'Niveau 4 : tout est caché ! Récite-le à voix haute !'][hide]; draw(); };
  body.replaceChildren(h('p', { class: 'prompt' }, '🎤 Apprends la première strophe par cœur : à chaque niveau, des mots se cachent !'), box, lvl,
    h('div', { class: 'actions wrap' }, h('button', { class: 'btn', type: 'button', onclick: () => talk(POEME[0].join(' ')) }, '🔊 Écouter'), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'po-hide', onclick: () => { if (hide < 4) { hide++; upd(); Sfx.coin(); if (hide === 4) { done('reciter'); burst(body); talk('Bravo ! Maintenant récite le poème à papa et maman, avec le ton !'); } } } }, '🙈 Cacher plus de mots'), h('button', { class: 'btn', type: 'button', onclick: () => { hide = 0; upd(); } }, '↺')),
    h('div', { class: 'ea-step' }, h('b', null, '🌟 Les secrets d’une belle récitation'), h('p', null, '1. Je me tiens bien droite et je regarde mon public. 2. Je parle fort et lentement. 3. Je respire aux virgules et aux points. 4. Je mets le ton : doux pour la nuit, joyeux pour le rêve !')));
  upd(); talk('Apprends la strophe par cœur : à chaque niveau, des mots se cachent !');
}


// ---------- 5. l'Anthologie P4 : 10 poésies françaises + 10 comptines et poèmes anglais ----------
// strophes lues par la voix enregistrée de Maissa quand elle existe, sinon par la voix de l'appareil (FR ou NL)
const AUDIO = new Set(['lafontaine-corbeau-renard_0', 'lafontaine-lion-rat_0', '_aucun_']);
function speakNL(text) {
  try {
    if (!('speechSynthesis' in window)) return; speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); const v = speechSynthesis.getVoices().filter((x) => /^en/i.test(x.lang)).sort((a, b) => (/GB/i.test(b.lang) ? 1 : 0) - (/GB/i.test(a.lang) ? 1 : 0))[0];
    u.lang = v ? v.lang : 'en-GB'; if (v) u.voice = v; u.rate = 0.85; speechSynthesis.speak(u);
  } catch (e) { /* sans voix */ }
}
function readStanza(P, i, talk) {
  const k = `${P.id}_${i}`;
  Voice.stop();
  if (AUDIO.has(k) && Sfx.soundOn()) { playFile(`assets/voice/antho/${k}.ogg`); return; }
  const t = P.stanzas[i].join(' ');
  if (P.lang === 'en') speakNL(t); else talk(t);
}
function anthologie(body, talk) {
  const st = () => { const b = S.get(); b.antho = b.antho || {}; return b.antho; };
  let filtre = 'fr';
  const liste = () => {
    const L = POEMES.filter((p) => p.lang === filtre), n = POEMES.filter((p) => st()[p.id]).length;
    body.replaceChildren(h('p', { class: 'prompt' }, '📚 L’Anthologie P4 : 20 grands poèmes à découvrir, écouter et réciter.'),
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn small' + (filtre === 'fr' ? ' primary' : ''), type: 'button', 'data-testid': 'an-fr', onclick: () => { filtre = 'fr'; liste(); } }, '🇫🇷 10 poèmes'), h('button', { class: 'btn small' + (filtre === 'en' ? ' primary' : ''), type: 'button', 'data-testid': 'an-nl', onclick: () => { filtre = 'en'; liste(); } }, '🇬🇧 10 poems'), h('small', { class: 'muted' }, `  ✅ ${n}/20 récités`)),
      h('div', { class: 'an-grid' }, ...L.map((p, i) => h('button', { class: 'an-card' + (st()[p.id] ? ' done' : ''), type: 'button', 'data-testid': 'an-' + p.id, onclick: () => fiche(p) },
        h('span', { class: 'an-num' }, String(i + 1)), h('span', { class: 'an-emo' }, p.emo || '📜'), h('b', null, p.title), h('small', null, p.author), h('i', { class: 'an-niv n-' + (p.niveau || 'Moyen').toLowerCase().replace('é', 'e') }, p.niveau || ''), p.pd ? null : h('i', { class: 'an-livre' }, '📖 dans ton livre')))));
  };
  const fiche = (P) => {
    Voice.stop();
    const back = h('button', { class: 'btn small', type: 'button', onclick: () => { Voice.stop(); liste(); } }, '◀ Tous les poèmes');
    const done = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'an-done', onclick: () => { if (!st()[P.id]) { st()[P.id] = true; S.save(); const b = S.get(); b.bonusStars = (b.bonusStars || 0) + 2; b.coins += 4; S.save(); } Sfx.win(); burst(body); talk(`Bravo ! Tu as récité « ${P.title} ». Il rejoint ta collection !`); done.textContent = '✅ Récité !'; } }, st()[P.id] ? '✅ Récité !' : '🎤 Je l’ai récité !');
    const head = h('div', { class: 'an-head' }, h('span', { class: 'an-emo big' }, P.emo || '📜'), h('div', null, h('h3', null, P.title), h('small', null, `${P.author}${P.year ? ' · ' + P.year : ''} · ${P.lang === 'en' ? 'poem in English' : 'poème français'}`)));
    if (!P.pd) {
      body.replaceChildren(back, head, h('div', { class: 'ea-step' }, h('b', null, '📖 Ce poème est dans ton livre de poésie'), h('p', null, 'Il est encore protégé par les droits de son auteur : je ne peux pas l’écrire ici. Lis-le dans ton livre ou demande à papa de te l’imprimer. Ensuite, réponds aux questions et récite-le !')),
        h('p', null, h('b', null, 'De quoi parle-t-il ? '), P.theme), h('p', { class: 'muted' }, '🎯 ' + P.comp),
        h('div', { class: 'an-q' }, h('b', null, '💬 Questions pour en parler'), ...P.q.map((q, i) => h('p', null, `${i + 1}. ${q}`))), h('div', { class: 'actions' }, done));
      talk(`${P.title}, de ${P.author}. ${P.theme}`);
      return;
    }
    let hide = 0, trad = false;
    const text = h('div', { class: 'po-poem an-text' });
    const draw = () => {
      text.replaceChildren(...P.stanzas.map((sv, i) => h('div', { class: 'po-strophe' },
        h('button', { class: 'an-play', type: 'button', 'aria-label': 'Écouter la strophe', onclick: () => readStanza(P, i, talk) }, '🔊'),
        ...sv.map((v, j) => h('p', { class: 'po-vers' }, ...v.split(' ').map((w, k) => { const hid = hide > 0 && (k + j + i) % 4 < hide; return h('span', { class: hid ? 'po-hid' : '' }, (hid ? '_'.repeat(Math.max(2, w.length)) : w) + ' '); }))),
        trad && P.fr && P.fr[i] ? h('div', { class: 'an-fr' }, ...P.fr[i].map((v) => h('p', null, v))) : null)));
    };
    const lvl = h('small', { class: 'muted' });
    const upd = () => { lvl.textContent = hide ? `Par cœur : niveau ${hide}/4` : ''; draw(); };
    const tools = h('div', { class: 'actions wrap' },
      h('button', { class: 'btn', type: 'button', 'data-testid': 'an-ecoute', onclick: () => readStanza(P, 0, talk) }, '🔊 Écouter le début'),
      P.lang === 'en' ? h('button', { class: 'btn', type: 'button', 'data-testid': 'an-trad', onclick: () => { trad = !trad; draw(); } }, '🇫🇷 Traduction') : null,
      h('button', { class: 'btn', type: 'button', 'data-testid': 'an-hide', onclick: () => { hide = (hide + 1) % 5; upd(); Sfx.coin(); } }, '🙈 Par cœur'), lvl);
    const lex = P.lexique ? h('div', { class: 'an-lex' }, h('b', null, P.lang === 'en' ? '📘 Words' : '📘 Les mots difficiles'), ...P.lexique.map((x) => h('p', null, h('b', null, x.mot || x.nl), ' : ', x.definition || x.fr))) : null;
    const mor = P.morale ? h('div', { class: 'ea-step' }, h('b', null, '🦉 La morale'), h('p', null, P.morale)) : null;
    body.replaceChildren(back, head, tools, text, lex, mor, h('div', { class: 'actions' }, done));
    upd(); talk(`${P.title}, de ${P.author}. Touche le haut-parleur pour écouter chaque strophe.`, false);
  };
  liste();
}

export function open(tab = 'rimes') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div'), head = h('div');
  const T = [['rimes', '🎵 La chasse aux rimes', rimes], ['vers', '📏 Vers et strophes', vers], ['fabrique', '✍️ Fabrique ton poème', fabrique], ['reciter', '🎤 Réciter par cœur', reciter], ['antho', '📚 Anthologie', anthologie]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'po-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ea-panel' }, UI.closeButton(), h('h2', null, '🪶 Le Kiosque à poèmes'), head, h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Le Kiosque à poèmes', onClose: () => Voice.stop() });
  function go(k) { Voice.stop(); const st = ST(); head.replaceChildren(st.badge ? h('b', { class: 'tb-badge' }, '🪶 Petite poétesse !') : h('small', { class: 'muted' }, `${Object.keys(st.ok).length}/4 ateliers réussis`)); tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
