// Le Palais des Miroirs Jumeaux : le pluriel des noms (P4). Chaque miroir = une règle, avec ses exceptions et une astuce pour les retenir.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.pluriels = b.pluriels || { ok: {} }; b.pluriels.ok = b.pluriels.ok || {}; return b.pluriels; };

export const MIROIRS = [
  { k: 's', ic: '🪞', n: 'Le grand miroir des -s', c: '#c9d4e8', regle: 'En général, on ajoute un -s : un chat → des chats, une fleur → des fleurs.', bonus: 'Les mots qui finissent déjà par -s, -x ou -z ne changent pas : une souris → des souris, une voix → des voix, un nez → des nez.',
    mots: [['chat', 'chats'], ['fleur', 'fleurs'], ['livre', 'livres'], ['souris', 'souris'], ['voix', 'voix'], ['nez', 'nez'], ['bras', 'bras'], ['prix', 'prix'], ['ami', 'amis'], ['étoile', 'étoiles']] },
  { k: 'ou', ic: '💎', n: 'Le miroir des bijoux (-ou)', c: '#7ad8e0', regle: 'Les mots en -ou prennent un -s : un clou → des clous, un trou → des trous.', exc: 'Sauf 7 mots qui prennent un -x : bijou, caillou, chou, genou, hibou, joujou, pou.',
    astuce: 'Viens mon chou, mon bijou, mon joujou, sur mes genoux, et jette des cailloux à ce hibou plein de poux !',
    mots: [['clou', 'clous'], ['trou', 'trous'], ['kangourou', 'kangourous'], ['bijou', 'bijoux'], ['caillou', 'cailloux'], ['chou', 'choux'], ['genou', 'genoux'], ['hibou', 'hiboux'], ['joujou', 'joujoux'], ['pou', 'poux'], ['fou', 'fous'], ['sou', 'sous']] },
  { k: 'al', ic: '🐴', n: 'Le miroir des chevaux (-al)', c: '#e8b84a', regle: 'Les mots en -al font leur pluriel en -aux : un cheval → des chevaux, un journal → des journaux.', exc: 'Sauf : bal, carnaval, chacal, festival, récital, régal, qui prennent un -s.',
    astuce: 'Au bal du carnaval, le chacal fait un récital au festival : quel régal !',
    mots: [['cheval', 'chevaux'], ['journal', 'journaux'], ['animal', 'animaux'], ['hôpital', 'hôpitaux'], ['bocal', 'bocaux'], ['bal', 'bals'], ['carnaval', 'carnavals'], ['chacal', 'chacals'], ['festival', 'festivals'], ['récital', 'récitals'], ['régal', 'régals']] },
  { k: 'eau', ic: '🏰', n: 'Le miroir des châteaux (-eau, -au, -eu)', c: '#ffd96a', regle: 'Les mots en -eau, -au et -eu prennent un -x : un château → des châteaux, un tuyau → des tuyaux, un cheveu → des cheveux.', exc: 'Sauf : pneu, bleu, landau, sarrau, qui prennent un -s.',
    astuce: 'Un landau bleu aux pneus crevés.',
    mots: [['château', 'châteaux'], ['bateau', 'bateaux'], ['oiseau', 'oiseaux'], ['tuyau', 'tuyaux'], ['noyau', 'noyaux'], ['cheveu', 'cheveux'], ['jeu', 'jeux'], ['feu', 'feux'], ['pneu', 'pneus'], ['bleu', 'bleus'], ['landau', 'landaus']] },
  { k: 'ail', ic: '🪟', n: 'Le miroir des vitraux (-ail)', c: '#c27aff', regle: 'Les mots en -ail prennent un -s : un rail → des rails, un éventail → des éventails.', exc: 'Sauf 7 mots en -aux : bail, corail, émail, soupirail, travail, vantail, vitrail.',
    astuce: 'Au travail, le vitrail et le corail brillent comme de l’émail.',
    mots: [['rail', 'rails'], ['éventail', 'éventails'], ['détail', 'détails'], ['portail', 'portails'], ['travail', 'travaux'], ['vitrail', 'vitraux'], ['corail', 'coraux'], ['émail', 'émaux']] },
  { k: 'rare', ic: '✨', n: 'Le miroir des mots rebelles', c: '#ff8ab8', regle: 'Quelques mots changent complètement au pluriel ! Il faut les apprendre par cœur.', exc: 'un œil → des yeux, un ciel → des cieux, monsieur → messieurs, madame → mesdames, mademoiselle → mesdemoiselles.',
    mots: [['œil', 'yeux'], ['ciel', 'cieux'], ['monsieur', 'messieurs'], ['madame', 'mesdames'], ['mademoiselle', 'mesdemoiselles']] },
];
const ALL = MIROIRS.flatMap((M) => M.mots.map(([s, p]) => ({ s, p, m: M.k })));
const fauxPluriel = (s, p) => { const c = new Set(); if (p.endsWith('x')) c.add(s + 's'); else if (/(ou|eau|au|eu)$/.test(s)) c.add(s + 'x'); if (/al$/.test(s)) c.add(p === s + 's' ? s.slice(0, -2) + 'aux' : s + 's'); if (/ail$/.test(s)) c.add(p.endsWith('aux') ? s + 's' : s.slice(0, -3) + 'aux'); if (p === s) c.add(s + 's'); if (!c.size) c.add(s + 'x'); c.delete(p); return [...c]; };

function miroir(body, talk, M) {
  const glass = h('div', { class: 'pl-glass', style: `--c:${M.c}` }), q = h('div');
  const show = (s, p) => { glass.replaceChildren(h('span', { class: 'pl-sing' }, 'un ' + s), h('span', { class: 'pl-arrow' }, '🪞'), h('span', { class: 'pl-plur' }, 'des ' + p)); glass.classList.remove('flash'); void glass.offsetWidth; glass.classList.add('flash'); Sfx.bloop(); talk(`Un ${s}, des ${p}.`); };
  const chips = h('div', { class: 'pl-chips' }, ...M.mots.map(([s, p]) => h('button', { class: 'btn small', type: 'button', onclick: () => show(s, p) }, s)));
  const kids = [h('div', { class: 'pl-rule', style: `--c:${M.c}` }, h('h3', null, `${M.ic} ${M.n}`), h('p', null, M.regle), M.exc ? h('p', null, h('b', null, '⚠️ Exceptions : '), M.exc) : null, M.bonus ? h('p', null, M.bonus) : null,
    M.astuce ? h('p', { class: 'pl-astuce' }, h('b', null, '🎵 Pour s’en souvenir : '), '« ' + M.astuce + ' »', h('button', { class: 'btn small', type: 'button', 'data-testid': 'pl-chante', onclick: () => talk(M.astuce) }, '🔊')) : null),
    h('p', { class: 'muted' }, 'Touche un mot : le miroir te montre son pluriel.'), chips, glass, q];
  body.replaceChildren(...kids);
  const test = () => {
    const pool = shuffle(M.mots).slice(0, 5); let i = 0, ok = 0;
    const ask = () => {
      if (i >= pool.length) { q.replaceChildren(h('p', { class: 'tb-res' }, `${ok}/${pool.length}`)); if (ok >= 4) { const st = ST(); st.ok[M.k] = true; S.save(); star(2); Sfx.win(); burst(body); talk('Bravo ! Ce miroir s’illumine pour toujours.'); } return; }
      const [s, p] = pool[i++]; const opts = shuffle([p, ...fauxPluriel(s, p).slice(0, 2)]);
      q.replaceChildren(h('p', { class: 'tb-q', style: 'font-size:clamp(20px,3.4vw,28px)' }, `un ${s} → des … ?`), h('div', { class: 'actions wrap' }, ...opts.map((o) => h('button', { class: 'btn', type: 'button', onclick: () => {
        if (o === p) { ok++; Sfx.ok(); talk(`Oui ! des ${p}.`, false); } else { Sfx.ko(); talk(`Non : des ${p}.`); }
        setTimeout(ask, 1100);
      } }, o))));
    };
    ask();
  };
  q.replaceChildren(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'pl-test', onclick: test }, '🎯 Je teste ce miroir'));
  talk(M.regle + (M.exc ? ' Attention aux exceptions !' : ''));
}

function tri(body, talk) {
  const pool = shuffle(ALL).slice(0, 10); let i = 0, ok = 0;
  const zone = h('div');
  const ask = () => {
    if (i >= pool.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `${ok}/10 bien rangés !`)); if (ok >= 8) { Sfx.win(); burst(body); star(2); } return; }
    const W = pool[i++];
    zone.replaceChildren(h('p', { class: 'tb-q' }, `un ${W.s}`), h('p', { class: 'muted' }, 'Dans quel miroir va ce mot ?'), h('div', { class: 'pl-mgrid' }, ...MIROIRS.map((M) => h('button', { class: 'pl-mbtn', type: 'button', style: `--c:${M.c}`, onclick: () => {
      if (M.k === W.m) { ok++; Sfx.ok(); talk(`Oui ! des ${W.p}.`, false); } else { Sfx.ko(); talk(`Non, il va dans ${MIROIRS.find((x) => x.k === W.m).n.toLowerCase()} : des ${W.p}.`); }
      setTimeout(ask, 1300);
    } }, h('span', null, M.ic), h('small', null, M.n.replace(/^Le (grand )?miroir (des )?/, ''))))));
  };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Range chaque mot devant le bon miroir.'), zone); ask();
}

function piege(body, talk) {
  const pool = shuffle(ALL).slice(0, 8); let i = 0, ok = 0;
  const zone = h('div');
  const ask = () => {
    if (i >= pool.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `${ok}/8 !`)); if (ok >= 6) { Sfx.win(); burst(body); star(2); } return; }
    const W = pool[i++], vrai = Math.random() < 0.5, montre = vrai ? W.p : (fauxPluriel(W.s, W.p)[0] || W.p + 's');
    zone.replaceChildren(h('p', { class: 'tb-q', style: 'font-size:clamp(20px,3.4vw,28px)' }, `un ${W.s} → des ${montre}`), h('div', { class: 'actions' }, ...[['✅ Vrai', true], ['❌ Faux', false]].map(([l, v]) => h('button', { class: 'btn', type: 'button', onclick: () => {
      const good = v === (montre === W.p); if (good) { ok++; Sfx.ok(); } else Sfx.ko();
      talk(good ? `Bien vu ! On écrit des ${W.p}.` : `Attention ! On écrit des ${W.p}.`, !good); setTimeout(ask, 1300);
    } }, l))));
  };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Le miroir piégé : ce pluriel est-il bien écrit ?'), zone); ask();
}

function badge() { const st = ST(); const n = MIROIRS.filter((M) => st.ok[M.k]).length; if (n >= MIROIRS.length && !st.badge) { st.badge = true; S.save(); } return n; }

export function open(tab = 's') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  // à l'oral, « un bijou → des bijoux » se dit « un bijou donne des bijoux »
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(String(s).replace(/\s*→\s*/g, ' donne ')); };
  const body = h('div'), head = h('div', { class: 'pl-head' });
  const T = [...MIROIRS.map((M) => [M.k, M.ic + ' ' + M.n.replace(/^Le (grand )?miroir (des )?/, ''), (b, t) => miroir(b, t, M)]), ['tri', '🗂️ Le grand tri', tri], ['piege', '🕵️ Le miroir piégé', piege]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'pl-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ea-panel' }, UI.closeButton(), h('h2', null, '🪞 Le Palais des Miroirs Jumeaux'), head, h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Le Palais des Miroirs', onClose: () => Voice.stop() });
  function go(k) { Voice.stop(); const n = badge(); head.replaceChildren(h('div', { class: 'tb-vitraux' }, ...MIROIRS.map((M) => h('span', { class: 'tb-vit' + (ST().ok[M.k] ? ' on' : '') }, M.ic)), h('small', null, ` ${n}/6 miroirs illuminés`), ST().badge ? h('b', { class: 'tb-badge' }, '👑 Reine des pluriels') : null));
    tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
