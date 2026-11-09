// Les petites phrases secrètes de Maissa pour son papa.
// À chaque endroit, la première fois la phrase arrive à coup sûr ; ensuite environ une fois sur trois,
// jamais la même deux fois de suite, et seulement quand rien d'autre ne se passe (pas de fenêtre ouverte, pas d'animation).
import * as S from './save.js';
import * as UI from './ui.js';
import * as Voice from './voice.js';
import { asset } from './asset.js';

export const PHRASES = {
  spirale: 'Papa… tu sais quoi ? Même quand je monte tout là-haut, je sais que tu seras toujours là pour m’encourager. 💙',
  telescope: 'Papaaa ! Viens voir ! J’ai trouvé une étoile magnifique ! On pourrait lui donner ton nom ?',
  microscope: 'Papa ! Tout est minuscule ici… mais mes questions, elles, sont géantes !',
  canape: 'Papa, viens t’asseoir près de moi ! Je te raconte une histoire… et toi, tu fais les voix rigolotes !',
  potion: 'Papa ! J’ai inventé une potion magique : trois gouttes de courage, une pincée de folie… et mille bisous pour toi !',
  boulier: 'Papa, je sais compter jusqu’à un million ! Mais tes câlins, je n’arriverai jamais à les compter.',
  sablier: 'Dis papa… si je pouvais arrêter le temps, je garderais encore un petit moment avec toi.',
  globe: 'Papa ! Le monde est tellement grand… Un jour, j’aimerais bien le découvrir avec toi.',
  estrade: 'Papa ! Tu veux connaître mon calcul préféré ? Toi plus moi, ça fait une équipe de champions !',
  enigme: 'Papa, j’ai une énigme pour toi ! Qu’est-ce qui est rond, qui roule et qui ne sait pas s’arrêter ? Moi, quand je rigole !',
  plume: 'Papa, regarde ! J’ai appris un mot magique : B-R-A-V-O ! Et aujourd’hui, il est pour toi !',
  constellation: 'Papa, quand je serai grande, je découvrirai peut-être une nouvelle étoile… et je te la dédierai !',
  theatre: 'Papa ! Regarde ! C’est moi la cheffe d’orchestre ! Attention… le concert commence !',
  foret: 'Papa, chut ! Ne fais pas de bruit… Je crois qu’un petit animal se cache derrière cet arbre !',
  reussi: 'Papaaa ! J’ai réussi ! Tu as vu ? Je suis trop fière de moi ! Tu me fais un check ?',
  retour: 'Papa ! Je suis rentrée ! J’ai découvert plein de choses aujourd’hui… et maintenant, j’ai envie de te faire un gros câlin !',
  etoile: 'Tu sais papa… parmi toutes les étoiles du ciel, ma préférée, c’est celle qui me fait penser à toi. 💙',
  livre: 'Papa, tu sais pourquoi j’aime apprendre plein de choses ? Parce qu’après, je peux tout te raconter !',
  robot: 'Papa, quand je serai grande, j’inventerai un robot qui te prépare ton café tous les matins !',
  sondage: 'Papa, j’ai fait un sondage : 100 % des Maissa trouvent que tu es le meilleur papa du monde !',
  coeur: 'Papa, tu sais quel est le muscle qui ne s’arrête jamais ? C’est le cœur… et le mien bat très fort pour toi ! 💓',
  loi: 'Papa, si j’étais la cheffe du village, ma première loi serait : un câlin obligatoire chaque matin !',
  paysage: 'Papa, regarde toute la Belgique ! Où qu’on aille, le plus beau paysage, c’est quand on est ensemble.',
  maroc: 'Papa, le Maroc ! Il y a le désert, la mer et les montagnes… On y va bientôt ensemble ?',
};
// endroit du jeu (zone interactive) → phrase
const SPOTS = {
  'b-spiral': 'spirale', 'o-sky': 'telescope', 'o-micro': 'microscope', 'o-dome': 'microscope', 'b-sofa': 'canape',
  'a-cauldron': 'potion', 'a-fractions': 'potion', 'n-abaque': 'boulier', 'r-glass': 'sablier', 'o-globe': 'globe',
  'n-podium': 'estrade', 'a-dessin': 'enigme', 'a-enigmes': 'enigme', 'b-plume': 'plume', 't-piano': 'theatre', 't-instruments': 'theatre',
  'v-renard': 'foret', 'v-lapin': 'foret', 'v-herisson': 'foret',
  'tn-hibou': 'robot', 'tn-texte': 'robot', 'd-colonnes': 'sondage', 'd-trier': 'sondage', 'c-mannequin': 'coeur', 'c-squelette': 'coeur',
  'vg-conseil': 'loi', 'vg-horloge': 'loi', 'p-longuevue': 'paysage', 'p-riviere': 'paysage',
};
// phrases plus rares, ajoutées une fois sur quatre à certains endroits
const RARE = { 'o-sky': 'etoile', 'o-globe': 'constellation' };

let pending = null, timer = 0, getRoom = () => null, audio = null;
const st = () => { const b = S.get(); return b.papa || (b.papa = { seen: {}, last: '' }); };
export function init(roomGetter) {
  getRoom = roomGetter;
  clearInterval(timer);
  timer = setInterval(tick, 400);
}
function want(key, spot) {
  const p = st();
  if (!PHRASES[key]) return false;
  if (!p.seen[spot]) return true;
  if (p.last === key) return false;
  return Math.random() < 0.34;
}
// appelé quand Maissa utilise une zone interactive
export function spot(id) {
  let key = SPOTS[id]; if (!key) return;
  if (RARE[id] && st().seen[id] && Math.random() < 0.25) key = RARE[id];
  if (!want(key, id)) { st().seen[id] = (st().seen[id] || 0) + 1; S.save(); return; }
  pending = { key, id, at: Date.now() };
}
// événements spéciaux (mission réussie, retour au château, livre terminé)
export function event(key, { force = false } = {}) {
  const p = st(), id = 'ev-' + key;
  if (!force && p.seen[id] && (p.last === key || Math.random() > 0.5)) return;
  pending = { key, id, at: Date.now() + 3000 }; // jamais tout de suite après un changement de salle
}
function busy() {
  const r = getRoom();
  return UI.isOpen() || !r || r.anim || Voice.isTalking() || Date.now() - (window.__sceneAt || 0) < 9000 || document.querySelector('.cine-wrap, .cine, video.cine-v') || document.getElementById('app').classList.contains('fading');
}
function tick() {
  if (!pending || Date.now() - pending.at < 1200) return;
  if (Date.now() - pending.at > 120000) { pending = null; return; }
  if (busy()) return;
  const { key, id } = pending; pending = null;
  const p = st(); p.seen[id] = (p.seen[id] || 0) + 1; p.last = key; S.save();
  play(key);
}
export function play(key) {
  const r = getRoom(); const text = PHRASES[key]; if (!text) return;
  Voice.stop();
  const voiced = !(S.get().settings.voice === false && S.get().settings.sound === false);
  // quand Maissa parle à voix haute, pas de bulle écrite (elle masquait le décor)
  if (r && !voiced) { r.hsay(text, Math.max(3500, text.length * 75)); }
  if (r) { const b = r.hero && r.hero.querySelector('.hero-say'); if (b) b.classList.add('long'); r.heroPose && r.heroPose('joie', 2200); if (r.pos) { r.puff(r.pos.x, r.pos.y - 0.32, '💙', 3); r.puff(r.pos.x + 0.02, r.pos.y - 0.34, '💖', 2); } }
  if (S.get().settings.voice === false && S.get().settings.sound === false) return;
  playFile(`assets/voice/papa/${key}.mp3`);
}
// arrêt en fondu (≈80 ms) : plus de « clic » quand une nouvelle phrase coupe la précédente
function stopSoft(src) { try { const t = ctx.currentTime, g = src._g; if (g) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0.0001, t + 0.08); src.stop(t + 0.1); } else src.stop(); } catch (e) { /* déjà fini */ } }
if (typeof window !== 'undefined') window.__hushPapa = () => { pending = null; if (audio && ctx) { stopSoft(audio); audio = null; } if (window.__vf) window.__vf.end = 0; };
// lecture via Web Audio (fichier entièrement téléchargé puis décodé : pas de requête interrompue)
let ctx = null; const bufs = {};
export function playFile(url) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume();
    if (audio) { stopSoft(audio); audio = null; }
    if (window.__vf) window.__vf.end = 0;
    if (!bufs[url]) bufs[url] = fetch(asset(url)).then((r) => r.arrayBuffer()).then((b) => new Promise((ok, ko) => ctx.decodeAudioData(b, ok, ko))).catch(() => null);
    // la voix enregistrée a priorité : la voix de synthèse attend qu'elle ait fini (sinon les deux se croisent)
    const vf = window.__vf = { pending: true, end: 0, t0: performance.now() };
    bufs[url].then((buf) => { vf.pending = false; if (!buf) return; const src = ctx.createBufferSource(), g = ctx.createGain(), t = ctx.currentTime; src.buffer = buf; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(1, t + 0.012); src.connect(g); g.connect(ctx.destination); src.start(); src._g = g; audio = src; vf.end = performance.now() + buf.duration * 1000; src.onended = () => { vf.end = 0; }; });
  } catch (e) { /* sans son */ }
}
