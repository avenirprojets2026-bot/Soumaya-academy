// Le Bouclier numérique (éducation numérique, P4) : mot de passe solide, vrai ou faux sur Internet,
// les bons réflexes en ligne et premiers pas de programmation (programmer le petit robot sur une grille).
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.bouclier = b.bouclier || { ok: {} }; return b.bouclier; };
const done = (k) => { const st = ST(); if (!st.ok[k]) { st.ok[k] = true; star(2); } if (Object.keys(st.ok).length >= 4) st.badge = true; S.save(); };

// ---------- 1. le mot de passe ----------
function motdepasse(body, talk) {
  const inp = h('input', { type: 'text', class: 'bc-pw', maxlength: 24, placeholder: 'Invente un mot de passe…', 'data-testid': 'bc-pw', autocomplete: 'off', spellcheck: 'false' });
  const bar = h('div', { class: 'bc-bar' }, h('i')), lab = h('b'), list = h('ul', { class: 'bc-rules' });
  const RULES = [[(s) => s.length >= 10, 'Au moins 10 caractères'], [(s) => /[a-z]/.test(s) && /[A-Z]/.test(s), 'Des minuscules ET des MAJUSCULES'], [(s) => /\d/.test(s), 'Au moins un chiffre'], [(s) => /[^A-Za-z0-9]/.test(s), 'Un symbole (! ? # @ …)'], [(s) => s && !/1234|azerty|password|motdepasse|soumaya|muezza/i.test(s), 'Pas un mot facile à deviner (ton prénom, 1234…)']];
  let won = false;
  const upd = () => { const s = inp.value; const n = RULES.filter(([f]) => f(s)).length;
    bar.firstChild.style.width = n * 20 + '%'; bar.dataset.n = n; lab.textContent = ['😱 Très faible', '😟 Faible', '😐 Moyen', '🙂 Bon', '😃 Solide', '🛡️ Super solide !'][n];
    list.replaceChildren(...RULES.map(([f, t]) => h('li', { class: f(s) ? 'ok' : '' }, (f(s) ? '✔ ' : '○ ') + t)));
    if (n === 5 && !won) { won = true; done('mdp'); Sfx.win(); burst(body); talk('Bravo, ton mot de passe est super solide ! Mais attention : on ne le dit à personne, sauf à papa et maman.'); } };
  inp.addEventListener('input', upd);
  const astuce = h('div', { class: 'ea-step' }, h('b', null, '💡 L’astuce de la phrase secrète'), h('p', null, 'Pense à une phrase que tu aimes : « Muezza mange 3 croquettes le soir ! » → prends les premières lettres : Mm3cls! — c’est solide et facile à retenir.'));
  body.replaceChildren(h('p', { class: 'prompt' }, '🔐 Un mot de passe, c’est la clé de ta maison numérique. Fabrique-en un très solide !'), inp, bar, lab, list, astuce,
    h('p', { class: 'muted' }, '⚠️ Ici c’est un jeu : n’écris pas ton vrai mot de passe ! Et on ne donne jamais son mot de passe à un ami.'));
  upd(); talk('Un mot de passe, c’est la clé de ta maison numérique. Fabrique-en un très solide !');
}

// ---------- 2. vrai ou faux sur Internet ----------
const INFOS = [
  ['🎁 « Bravo ! Tu as gagné une tablette ! Clique vite ici et donne ton adresse ! »', 'piege', 'C’est un piège ! Personne ne gagne un cadeau sans avoir joué. On ne clique pas et on ferme la page.'],
  ['📰 Un site de journal connu et une encyclopédie disent la même chose sur les dinosaures.', 'fiable', 'Quand plusieurs sources sérieuses disent la même chose, l’information est probablement vraie.'],
  ['🐱 Une vidéo montre un chat qui parle anglais.', 'piege', 'Les images et les voix peuvent être truquées, ou fabriquées par une intelligence artificielle. On garde l’esprit critique !'],
  ['🏛️ Le site officiel de la Région donne les dates des vacances scolaires.', 'fiable', 'Un site officiel est une source fiable pour ce genre d’information.'],
  ['📢 Un message dit : « Partage vite à 10 amis sinon il t’arrivera malheur ! »', 'piege', 'C’est une chaîne : elle fait peur pour qu’on la partage. Il ne t’arrivera rien ! On ne la transfère pas.'],
  ['💬 Un inconnu sur un jeu dit qu’il a 9 ans et veut ton adresse.', 'piege', 'On ne sait jamais vraiment qui est derrière l’écran. On ne donne jamais son adresse et on en parle à un adulte.'],
  ['📚 Ma maîtresse me conseille un site pour réviser les tables.', 'fiable', 'Un adulte de confiance peut t’aider à choisir de bons sites.'],
  ['🔤 Un article sans auteur, plein de fautes, dit que la Lune est en fromage.', 'piege', 'Pas d’auteur, des fautes et une info bizarre : c’est un indice que ce n’est pas fiable !'],
];
function vraifaux(body, talk) {
  let n = 0, ok = 0; const Q = shuffle(INFOS.slice()); const zone = h('div'), sc = h('p', { class: 'muted' });
  const next = () => {
    if (n >= Q.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `Bravo ! ${ok}/${Q.length}`), h('div', { class: 'ea-step' }, h('b', null, '🕵️ Les 3 questions du détective'), h('p', null, '1. Qui a écrit ça ? 2. D’autres sites sérieux disent-ils pareil ? 3. Est-ce que ça veut me faire peur ou me presser ?'))); if (ok >= 6) { done('vraifaux'); Sfx.win(); burst(body); } return; }
    const [t, a, why] = Q[n++];
    zone.replaceChildren(h('div', { class: 'bc-screen' }, t), h('div', { class: 'actions wrap' }, ...[['fiable', '✅ Je peux faire confiance'], ['piege', '🚩 Attention, piège !']].map(([k, l]) => h('button', { class: 'btn', type: 'button', 'data-testid': 'bc-vf-' + k, onclick: () => {
      const good = k === a; if (good) { ok++; Sfx.ok(); } else Sfx.ko(); talk(why); sc.textContent = `${n}/${Q.length} · ✔ ${ok}`; setTimeout(next, 2800);
    } }, l))));
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '🕵️ Sur Internet, tout n’est pas vrai ! Mène l’enquête.'), zone, sc);
  next();
}

// ---------- 3. les bons réflexes ----------
const REFLEXES = [
  ['Quelqu’un t’envoie un message méchant sur un jeu.', ['Je ne réponds pas, je fais une capture et j’en parle à un adulte.', 'Je réponds encore plus méchamment.', 'Je garde ça pour moi.'], 'On ne reste jamais seul face au harcèlement : on en parle !'],
  ['Une copine veut publier une photo de toi en pyjama.', ['Je lui dis que je ne suis pas d’accord : on demande toujours avant de publier une photo de quelqu’un.', 'Pas grave, tout le monde la verra.', 'Je publie une photo d’elle pour me venger.'], 'Ton image t’appartient : on a le droit de dire non.'],
  ['Tu vois une image qui te fait peur ou te met mal à l’aise.', ['Je ferme la page et je préviens un adulte.', 'Je la montre à mon petit frère.', 'Je continue à regarder.'], 'Tu n’as rien fait de mal : un adulte peut t’aider.'],
  ['Un jeu te demande ton nom, ton école et ton adresse.', ['Je demande d’abord à papa ou maman.', 'Je remplis tout, c’est plus rapide.', 'Je donne l’adresse de mon amie.'], 'Les informations personnelles sont précieuses : on ne les donne pas sans un adulte.'],
  ['Tu joues sur la tablette depuis très longtemps et tu as mal aux yeux.', ['Je fais une pause, je bouge et je regarde au loin.', 'Je continue, je dois finir le niveau.', 'Je m’approche encore plus de l’écran.'], 'Les écrans, c’est mieux avec des pauses ! Ton corps et tes yeux te remercient.'],
];
function reflexes(body, talk) {
  let n = 0, ok = 0; const Q = shuffle(REFLEXES.slice()); const zone = h('div'), sc = h('p', { class: 'muted' });
  const next = () => {
    if (n >= Q.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `Bravo ! ${ok}/${Q.length}`)); if (ok >= 4) { done('reflexes'); Sfx.win(); burst(body); } return; }
    const [s, opts, why] = Q[n++];
    zone.replaceChildren(h('p', { class: 'tb-q', style: 'font-size:clamp(17px,2.6vw,22px)' }, '📱 ' + s), h('div', { class: 'bc-opts' }, ...shuffle(opts.map((o, i) => [o, i])).map(([o, i]) => h('button', { class: 'btn', type: 'button', 'data-testid': i === 0 ? 'bc-rf-ok' : 'bc-rf-ko', onclick: () => {
      if (i === 0) { ok++; Sfx.ok(); talk('Oui ! ' + why); } else { Sfx.ko(); talk('Non. La bonne idée : ' + opts[0] + ' ' + why); } sc.textContent = `${n}/${Q.length} · ✔ ${ok}`; setTimeout(next, 3200);
    } }, o))));
    talk(s);
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '🛡️ Que fais-tu ? Choisis le bon réflexe.'), zone, sc);
  next();
}

// ---------- 4. programmer le robot ----------
const LEVELS = [
  { start: [0, 4], goal: [3, 4], walls: [] },
  { start: [0, 4], goal: [2, 1], walls: [[1, 3], [1, 2]] },
  { start: [0, 0], goal: [4, 4], walls: [[1, 0], [1, 1], [3, 3], [3, 4], [2, 3]] },
  { start: [2, 4], goal: [2, 0], walls: [[2, 2], [1, 2], [3, 2]] },
];
const DIR = { '⬆️': [0, -1], '➡️': [1, 0], '⬇️': [0, 1], '⬅️': [-1, 0] };
function robot(body, talk) {
  let lv = 0, prog = [], busy = false; const grid = h('div', { class: 'bc-grid' }), line = h('div', { class: 'bc-prog' }), info = h('p', { class: 'muted' });
  const draw = (pos) => { const L = LEVELS[lv]; grid.replaceChildren(...Array.from({ length: 25 }, (_, i) => { const x = i % 5, y = Math.floor(i / 5);
    const wall = L.walls.some(([a, b]) => a === x && b === y), goal = L.goal[0] === x && L.goal[1] === y, me = pos[0] === x && pos[1] === y;
    return h('span', { class: 'bc-cell' + (wall ? ' wall' : '') }, me ? '🤖' : goal ? '⭐' : wall ? '🧱' : ''); })); };
  const showProg = () => line.replaceChildren(...(prog.length ? prog.map((p) => h('span', null, p)) : [h('small', { class: 'muted' }, 'Ton programme est vide…')]));
  const reset = () => { prog = []; showProg(); draw(LEVELS[lv].start); info.textContent = `Niveau ${lv + 1}/${LEVELS.length} : amène le robot jusqu’à l’étoile en évitant les murs.`; };
  const run = () => { if (busy || !prog.length) return; busy = true; const L = LEVELS[lv]; let p = L.start.slice(), i = 0;
    const tick = () => { if (i >= prog.length) { busy = false; if (p[0] === L.goal[0] && p[1] === L.goal[1]) { Sfx.win(); talk('Bravo ! Ton programme marche !'); if (lv === LEVELS.length - 1) { done('robot'); burst(body); info.textContent = '🏆 Tu es une vraie programmeuse !'; } else { lv++; setTimeout(reset, 1400); } } else { Sfx.ko(); talk('Le robot n’est pas arrivé à l’étoile. Cherche le bug et corrige ton programme !'); setTimeout(() => draw(L.start), 900); } return; }
      const d = DIR[prog[i]]; const q = [p[0] + d[0], p[1] + d[1]]; [...line.children].forEach((c, k) => c.classList.toggle('on', k === i)); i++;
      if (q[0] < 0 || q[0] > 4 || q[1] < 0 || q[1] > 4 || L.walls.some(([a, b]) => a === q[0] && b === q[1])) { busy = false; Sfx.ko(); talk('Boum ! Le robot a cogné un mur. C’est un bug : corrige ton programme !'); setTimeout(() => draw(L.start), 900); return; }
      p = q; draw(p); Sfx.coin(); setTimeout(tick, 450); };
    tick(); };
  body.replaceChildren(h('p', { class: 'prompt' }, '🤖 Programmer, c’est donner des instructions dans le bon ordre. Écris le programme, puis appuie sur ▶ !'), info, h('div', { class: 'ea-wrap' }, grid, h('div', { class: 'ea-side' },
    h('div', { class: 'actions wrap' }, ...Object.keys(DIR).map((k) => h('button', { class: 'btn', type: 'button', 'data-testid': 'bc-cmd', onclick: () => { if (!busy && prog.length < 14) { prog.push(k); showProg(); } } }, k))), line,
    h('div', { class: 'actions wrap' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'bc-run', onclick: run }, '▶ Lancer'), h('button', { class: 'btn', type: 'button', onclick: () => { if (!busy) { prog.pop(); showProg(); } } }, '⌫ Effacer'), h('button', { class: 'btn', type: 'button', onclick: () => { if (!busy) reset(); } }, '↺')))));
  reset(); talk('Programmer, c’est donner des instructions dans le bon ordre. Amène le robot jusqu’à l’étoile !');
}

export function open(tab = 'mdp') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true) => { say.textContent = s; if (v) Voice.speak(s); };
  const body = h('div'), head = h('div');
  const T = [['mdp', '🔐 Le mot de passe', motdepasse], ['vraifaux', '🕵️ Vrai ou piège ?', vraifaux], ['reflexes', '🛡️ Les bons réflexes', reflexes], ['robot', '🤖 Programme le robot', robot]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'bc-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ea-panel' }, UI.closeButton(), h('h2', null, '🛡️ Le Bouclier numérique'), head, h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Le Bouclier numérique', onClose: () => Voice.stop() });
  function go(k) { Voice.stop(); const st = ST(); head.replaceChildren(st.badge ? h('b', { class: 'tb-badge' }, '🛡️ Gardienne du numérique !') : h('small', { class: 'muted' }, `${Object.keys(st.ok).length}/4 missions réussies`)); tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
