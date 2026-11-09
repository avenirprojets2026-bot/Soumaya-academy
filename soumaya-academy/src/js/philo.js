// Le Jardin des Philosophes (philosophie et citoyenneté, P4) : grandes questions, météo des émotions,
// juste ou pas juste (égalité / équité), les droits de l'enfant.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { burst, shuffle } from './workshop.js';

const star = (n = 1) => { const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); };
const ST = () => { const b = S.get(); b.philo = b.philo || { ok: {} }; return b.philo; };
const done = (k) => { const st = ST(); if (!st.ok[k]) { st.ok[k] = true; star(2); } if (Object.keys(st.ok).length >= 4) st.badge = true; S.save(); };

// ---------- 1. les grandes questions ----------
const QUESTIONS = [
  ['Un ami doit-il toujours être d’accord avec moi ?', ['Non : on peut ne pas être d’accord et rester amis. Un vrai ami me dit aussi quand je me trompe.', 'Oui, sinon on se dispute… mais se disputer gentiment, ça aide parfois à mieux se comprendre !']],
  ['Est-ce qu’on a le droit de mentir pour faire plaisir ?', ['Un petit mensonge peut éviter de faire de la peine (« J’adore ton dessin ! »).', 'Mais si on ment souvent, les autres ne nous croient plus. On peut dire la vérité avec douceur.']],
  ['Est-ce que les animaux pensent ?', ['Muezza sait où est sa gamelle et reconnaît sa famille : elle se souvient et elle choisit.', 'Mais elle ne peut pas écrire un livre ou se demander pourquoi le ciel existe… Penser, c’est peut-être plusieurs choses.']],
  ['Être grand, est-ce que ça veut dire être libre ?', ['Les grands décident plus de choses : leur heure de coucher, leur repas…', 'Mais ils ont aussi des devoirs : travailler, s’occuper des enfants, respecter les lois. Être libre, ce n’est pas faire tout ce qu’on veut.']],
  ['Faut-il toujours obéir ?', ['Les règles protègent : on obéit au feu rouge pour ne pas être renversé.', 'Mais si un adulte demande quelque chose de mal ou de dangereux, on a le droit de dire non et d’en parler à un adulte de confiance.']],
  ['Qu’est-ce qu’un vrai ami ?', ['Quelqu’un qui m’écoute, qui m’aide et avec qui je m’amuse.', 'Quelqu’un qui m’aime comme je suis, même quand je suis triste ou que je rate quelque chose.']],
  ['Est-ce qu’on peut être heureux sans jouets ?', ['On peut rire avec sa famille, jouer dehors, inventer des histoires…', 'Les jouets amusent, mais le bonheur vient souvent des gens qu’on aime et de ce qu’on partage.']],
  ['Pourquoi est-on tous différents ?', ['Chacun a son corps, sa famille, sa langue, ses goûts…', 'Les différences rendent le monde plus riche : on apprend des autres ! Mais on a tous les mêmes droits.']],
];
// Laisse finir l'explication (voix + temps de lecture) avant de passer à la suite ; bouton « Suivant » pour ne pas attendre.
function explainThen(zone, talk, s, fn) {
  let fired = false; const t0 = Date.now(), minT = Math.max(2600, s.length * 60);
  const go = () => { if (fired || !zone.isConnected) return; fired = true; fn(); };
  const btn = h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ph-suite', onclick: () => { Voice.stop(); go(); } }, 'Suivant ▶');
  zone.append(h('div', { class: 'actions' }, btn));
  talk(s, true, () => setTimeout(go, Math.max(1500, minT - (Date.now() - t0))));
  setTimeout(go, s.length * 110 + 6000);
}

function questions(body, talk) {
  let k = 0; const seen = new Set(); const zone = h('div');
  const show = () => {
    const [q, avis] = QUESTIONS[k]; let chosen = null;
    const res = h('div', { class: 'ea-step' });
    const pick = (lab) => { chosen = lab; seen.add(k); res.replaceChildren(h('b', null, `Tu as répondu : ${lab}`), h('p', null, 'Ce que pensent d’autres enfants philosophes :'), ...avis.map((a) => h('p', { class: 'ph-avis' }, '💬 ' + a)), h('p', { class: 'ph-start' }, '🗣️ À toi ! Explique ton idée à voix haute en commençant par : « Je pense que… parce que… »'));
      talk(avis.join(' ') + ' Et toi, explique : je pense que… parce que…'); Sfx.coin(); if (seen.size >= 5) done('questions'); };
    zone.replaceChildren(h('div', { class: 'ph-q' }, h('small', null, `Question ${k + 1}/${QUESTIONS.length}`), h('b', null, '🤔 ' + q)),
      h('div', { class: 'actions wrap' }, ...['Oui', 'Non', 'Ça dépend…'].map((l) => h('button', { class: 'btn', type: 'button', 'data-testid': 'ph-rep', onclick: () => pick(l) }, l))), res,
      h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: () => { k = (k + QUESTIONS.length - 1) % QUESTIONS.length; show(); } }, '◀'), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ph-next', onclick: () => { k = (k + 1) % QUESTIONS.length; show(); } }, 'Question suivante ▶')));
    talk(q);
  };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Il n’y a pas de mauvaise réponse ! Un philosophe réfléchit, donne ses raisons et écoute les autres.'), h('p', { class: 'muted' }, '🌳 Les règles du cercle : je lève la main, j’écoute, je ne me moque pas, je donne une raison.'), zone);
  show();
}

// ---------- 2. la météo des émotions ----------
const EMO = [['😊', 'la joie'], ['😢', 'la tristesse'], ['😠', 'la colère'], ['😨', 'la peur'], ['😲', 'la surprise'], ['🤢', 'le dégoût']];
const SITU = [
  ['Hajar a cassé mon château de Lego sans faire exprès.', 'la colère', 'Je respire profondément (gonfle le ventre… souffle doucement), puis je dis : « Je suis fâchée parce que… ». Hajar peut m’aider à le reconstruire !'],
  ['Mon amie déménage dans une autre ville.', 'la tristesse', 'Je peux en parler à quelqu’un que j’aime, pleurer si j’en ai besoin, et lui écrire une lettre ou l’appeler.'],
  ['Papa m’offre un cadeau alors que ce n’est pas mon anniversaire.', 'la surprise', 'Je peux dire merci et montrer ma joie !'],
  ['J’entends un grand bruit dans le noir.', 'la peur', 'J’allume la lumière, je respire calmement et je vais voir un adulte. La peur nous protège, mais on peut la calmer.'],
  ['J’ai réussi mon contrôle de tables !', 'la joie', 'Je peux partager ma joie et être fière de mes efforts.'],
  ['On me sert un plat qui sent très mauvais.', 'le dégoût', 'Je peux dire poliment « non merci » ou goûter un tout petit peu, sans me moquer de celui qui l’a préparé.'],
  ['Zakaria a peur de l’orage et pleure.', 'la peur', 'Je peux le rassurer, lui tenir la main et lui expliquer que la maison le protège.'],
  ['Un enfant se moque de mon dessin.', 'la tristesse', 'Je peux lui dire « ça me fait de la peine », m’éloigner et en parler à un adulte. Mon dessin reste beau !'],
];
function emotions(body, talk) {
  let n = 0, ok = 0; const Q = shuffle(SITU.slice()); const zone = h('div'), sc = h('p', { class: 'muted' });
  const next = () => {
    if (n >= Q.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `Bravo ! ${ok}/${Q.length}`), h('p', null, 'Toutes les émotions sont normales. Ce qui compte, c’est ce qu’on en fait !')); if (ok >= 6) { done('emotions'); Sfx.win(); burst(body); } return; }
    const [s, e, conseil] = Q[n++];
    zone.replaceChildren(h('p', { class: 'tb-q', style: 'font-size:clamp(17px,2.6vw,22px)' }, '📖 ' + s), h('p', { class: 'muted' }, 'Quelle émotion ressens-tu ?'), h('div', { class: 'actions wrap' }, ...EMO.map(([i, l]) => h('button', { class: 'btn', type: 'button', 'data-testid': 'ph-emo', onclick: () => {
      const good = l === e; if (good) { ok++; Sfx.ok(); } else Sfx.ko();
      zone.append(h('div', { class: 'ea-step' }, h('b', null, (good ? '✔ Oui, ' : '💡 Plutôt ') + e + ' !'), h('p', null, '🧰 Que faire ? ' + conseil)));
      talk((good ? 'Oui, ' : 'Plutôt ') + e + '. ' + conseil); sc.textContent = `${n}/${Q.length} · ✔ ${ok}`;
      zone.querySelectorAll('[data-testid="ph-emo"]').forEach((b) => { b.disabled = true; });
      zone.append(h('button', { class: 'btn primary', type: 'button', 'data-testid': 'ph-emo-next', onclick: next }, 'Suivant ▶'));
    } }, i + ' ' + l))));
    talk(s);
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '🌦️ La météo des émotions : quelle émotion dans chaque situation ? Et que peut-on faire ?'), zone, sc);
  next();
}

// ---------- 3. juste ou pas juste ? ----------
const JUSTE = [
  ['La maîtresse donne le même gâteau à chacun.', 'juste', 'C’est l’égalité : tout le monde reçoit la même chose.'],
  ['Pour voir le match par-dessus la barrière, on donne une caisse plus haute au plus petit.', 'juste', 'C’est l’équité : chacun reçoit ce dont il a besoin pour avoir les mêmes chances.'],
  ['Seuls les enfants qui ont un vélo rouge peuvent jouer dans la cour.', 'injuste', 'C’est une discrimination : on exclut quelqu’un pour une raison qui n’a rien à voir.'],
  ['Un élève qui a mal au bras a plus de temps pour écrire sa dictée.', 'juste', 'C’est l’équité : il a besoin d’une aide pour réussir comme les autres.'],
  ['Le plus fort de la classe prend toujours le ballon.', 'injuste', 'La force ne donne pas tous les droits : on partage et on respecte les règles du jeu.'],
  ['On vote pour choisir la sortie de classe, et la majorité gagne.', 'juste', 'C’est la démocratie : chacun donne son avis et on respecte le choix du plus grand nombre.'],
  ['On punit toute la classe parce qu’un élève a crié.', 'injuste', 'Ce n’est pas juste de punir ceux qui n’ont rien fait.'],
  ['Une fille ne peut pas jouer au foot « parce que c’est un jeu de garçons ».', 'injuste', 'Les filles et les garçons ont les mêmes droits : chacun peut jouer à ce qu’il aime.'],
];
function juste(body, talk) {
  let n = 0, ok = 0; const Q = shuffle(JUSTE.slice()); const zone = h('div'), sc = h('p', { class: 'muted' });
  const next = () => {
    if (n >= Q.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `Bravo ! ${ok}/${Q.length}`), h('div', { class: 'ea-step' }, h('b', null, '⚖️ À retenir'), h('p', null, 'Égalité : tout le monde reçoit la même chose. Équité : chacun reçoit ce dont il a besoin. Les deux servent la justice !'))); if (ok >= 6) { done('juste'); Sfx.win(); burst(body); } return; }
    const [s, a, why] = Q[n++];
    zone.replaceChildren(h('p', { class: 'tb-q', style: 'font-size:clamp(17px,2.6vw,22px)' }, s), h('div', { class: 'actions wrap' }, ...[['juste', '⚖️ Juste'], ['injuste', '🚫 Pas juste']].map(([k, l]) => h('button', { class: 'btn', type: 'button', 'data-testid': 'ph-j-' + k, onclick: () => {
      const good = k === a; if (good) { ok++; Sfx.ok(); } else Sfx.ko(); zone.querySelectorAll('button').forEach((b) => { b.disabled = true; }); zone.append(h('div', { class: 'ea-step' }, h('b', null, good ? '✔ Oui !' : '💡 Hmm…'), h('p', null, why))); sc.textContent = `${n}/${Q.length} · ✔ ${ok}`; explainThen(zone, talk, (good ? 'Oui ! ' : 'Hmm… ') + why, next);
    } }, l))));
    talk(s);
  };
  body.replaceChildren(h('p', { class: 'prompt' }, 'Juste ou pas juste ? Réfléchis comme un juge !'), zone, sc);
  next();
}

// ---------- 4. les droits de l'enfant ----------
const DROITS = [
  ['Aller à l’école', 'droit', '📚'], ['Être soigné quand on est malade', 'droit', '🩺'], ['Jouer et se reposer', 'droit', '🪁'], ['Avoir un nom et une nationalité', 'droit', '🪪'], ['Donner son avis', 'droit', '🗣️'], ['Être protégé de la violence', 'droit', '🛡️'], ['Avoir une maison et manger', 'droit', '🏠'],
  ['Avoir un téléphone dernier cri', 'envie', '📱'], ['Manger des bonbons tous les jours', 'envie', '🍬'], ['Se coucher à minuit', 'envie', '🌙'], ['Avoir une console de jeux', 'envie', '🎮'],
];
function droits(body, talk) {
  const Q = shuffle(DROITS.slice()); let n = 0, ok = 0; const zone = h('div'), sc = h('p', { class: 'muted' });
  const next = () => {
    if (n >= Q.length) { zone.replaceChildren(h('p', { class: 'tb-res' }, `Bravo ! ${ok}/${Q.length}`), h('p', null, 'En 1989, presque tous les pays du monde ont signé la Convention internationale des droits de l’enfant. Les adultes doivent protéger ces droits… et les enfants respectent ceux des autres !')); if (ok >= 9) { done('droits'); Sfx.win(); burst(body); } return; }
    const [t, a, i] = Q[n++];
    zone.replaceChildren(h('div', { class: 'ph-q' }, h('b', null, i + ' ' + t)), h('div', { class: 'actions wrap' }, ...[['droit', '✅ C’est un droit'], ['envie', '💭 C’est une envie']].map(([k, l]) => h('button', { class: 'btn', type: 'button', 'data-testid': 'ph-d-' + k, onclick: () => {
      const good = k === a; if (good) { ok++; Sfx.ok(); } else Sfx.ko();
      const ex = a === 'droit' ? `${t} : c’est un droit de tous les enfants du monde !` : `${t} : c’est une envie, pas un besoin. C’est chouette, mais on peut vivre sans.`; zone.querySelectorAll('button').forEach((b) => { b.disabled = true; }); zone.append(h('div', { class: 'ea-step' }, h('p', null, (good ? '✔ ' : '💡 ') + ex))); sc.textContent = `${n}/${Q.length} · ✔ ${ok}`; explainThen(zone, talk, ex, next);
    } }, l))));
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '🧸 Droit ou envie ? Tous les enfants du monde ont des droits.'), zone, sc);
  next();
}

export function open(tab = 'questions') {
  const say = h('div', { class: 'be-say cc-say', 'aria-live': 'polite' });
  const talk = (s, v = true, onEnd) => { say.textContent = s; if (v) Voice.speak(s, { onEnd }); else if (onEnd) onEnd(); };
  const body = h('div'), head = h('div');
  const T = [['questions', '🤔 Les grandes questions', questions], ['emotions', '🌦️ Météo des émotions', emotions], ['juste', '⚖️ Juste ou pas ?', juste], ['droits', '🧸 Les droits de l’enfant', droits]];
  const tabs = T.map(([k, l]) => h('button', { class: 'btn small', type: 'button', 'data-testid': 'ph-tab-' + k, onclick: () => go(k) }, l));
  UI.openDialog(h('div', { class: 'panel be-panel ws-panel ea-panel' }, UI.closeButton(), h('h2', null, '🌳 Le Jardin des Philosophes'), head, h('div', { class: 'actions wrap' }, ...tabs), body, say), { label: 'Le Jardin des Philosophes', onClose: () => Voice.stop() });
  function go(k) { Voice.stop(); const st = ST(); head.replaceChildren(st.badge ? h('b', { class: 'tb-badge' }, '🦉 Petite philosophe !') : h('small', { class: 'muted' }, `${Object.keys(st.ok).length}/4 ateliers réussis`)); tabs.forEach((t, i) => t.classList.toggle('primary', T[i][0] === k)); T.find((x) => x[0] === k)[2](body, talk); }
  go(tab);
}
