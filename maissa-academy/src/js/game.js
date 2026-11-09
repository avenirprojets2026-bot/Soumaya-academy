// Flux du jeu : navigation entre salles, missions, examens, récompenses.
import * as RB from './rabat.js';
import { asset } from './asset.js';
import * as OC from './ocean.js';
import * as Sfx from './sfx.js';
import * as S from './save.js';
import * as C from './content.js';
import * as UI from './ui.js';
import { h } from './ui.js';
import { Room } from './world.js';
import { SCENES, ROOM_SUBJECT } from './scenes.js';
import { checkBadges, pagesRestored } from './rewards.js';
import * as Mimi from './mimi.js';
import * as Voice from './voice.js';
import * as BE from './belgium.js';
import * as SOL from './solar.js';
import * as ABQ from './abacus.js';
import * as CC from './circle.js';
import * as SKY from './sky.js';
import * as TL from './timeline.js';
import * as LIB from './library.js';
import * as WS from './workshop.js';
import * as QS from './quest.js';
import * as MI from './micro.js';
import * as DR from './drawing.js';
import * as DC from './decimals.js';
import * as TH from './theatre.js';
import * as NU from './numerique.js';
import * as VI from './vivant.js';
import * as DA from './donnees.js';
import * as Papa from './papa.js';
import * as CO from './corps.js';
import * as VG from './village.js';
import * as PA from './paysages.js';
import * as AT from './atlas.js';
import * as EC from './echelles.js';
import * as JB from './jardin.js';
import * as IA from './ia.js';
import * as AC from './actus.js';
import * as HO from './horloge.js';
import * as AR from './armoire.js';
import * as LB from './labo.js';
import * as CONC from './concert.js';
import * as TBL from './tables.js';
import * as EAU from './eau.js';
import * as SOLEIL from './soleil.js';
import * as PLUR from './pluriels.js';
import * as ETATS from './etats.js';
import * as EUR from './europe.js';
import * as NL from './neerlandais.js';
import * as PHILO from './philo.js';
import * as BOUC from './bouclier.js';
import * as POEM from './poemes.js';
import * as ORDI from './ordi.js';
import * as CH from './chemin.js';
AC.injectSpots(SCENES); // actualités : points de découverte discrets dans les décors

let room = null;
let sceneId = null;
let hintTimer = null;
const stage = () => document.getElementById('stage');

function gl3d() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
export function boot() {
  S.load();
  Sfx.arm(() => SHIFT[sceneId] || 0);
  document.addEventListener('settings:changed', () => { Sfx.ambient(SHIFT[sceneId] || 0); Sfx.oceanFx(sceneId === 'ocean'); });
  S.onChange(updateHud);
  updateHud();
  try { if (!sessionStorage.getItem('sa-welcome')) document.addEventListener('pointerdown', () => { try { sessionStorage.setItem('sa-welcome', '1'); } catch (e) {} setTimeout(() => Voice.say('bienvenue'), 400); }, { once: true }); } catch (e) { /* ignoré */ }
  document.getElementById('btn-home').addEventListener('click', () => { UI.closeDialog(); goScene(sceneId === 'map' ? 'hall' : 'map'); });
  document.getElementById('btn-menu').addEventListener('click', () => UI.passport());
  // Muezza réagit aux réponses et au lien d'amitié
  document.addEventListener('quiz:answered', (e) => { e.detail.ok ? Sfx.ok() : Sfx.ko(); if (!e.detail.exam) { streak = e.detail.ok ? streak + 1 : 0; if (e.detail.ok && [3, 5, 8, 12].includes(streak)) Voice.say('streak', { delay: 300 }); else Voice.say(e.detail.ok ? 'ok' : 'ko', { chance: e.detail.ok ? 0.45 : 0.65, delay: 300 }); } if (!e.detail.exam) room && room.mimiReact(e.detail.ok ? 'ok' : 'ko'); });
  document.addEventListener('mimi:petted', () => Voice.say('calin', { chance: 0.4, delay: 500 }));
  armIdle(); document.addEventListener('pointerdown', () => armIdle(), true);
  document.addEventListener('mimi:levelup', (e) => { Sfx.levelup(); Voice.say('mimi_up', { delay: 900 });
    const b = e.detail.bow;
    UI.toast(`💗 Amitié avec Muezza : ${e.detail.name} !${b ? ' Nouveau nœud : ' + b.name + ' 🎀' : ''}`);
    room && room.hearts(6); checkBadges();
  });
  // scène de fond pour l'écran-titre
  enterScene('hall', { quiet: true });
  titleScreen();
  window.__game = { openPanel: (p) => handleAct({ type: 'panel', panel: p }),  goScene, get scene() { return sceneId; }, get room() { return room; }, S, C };
}

function updateHud() {
  const s = S.get();
  document.getElementById('hud-stars').textContent = `⭐ ${S.totalStars() + (s.bonusStars || 0)}`;
  document.getElementById('hud-coins').textContent = `🪙 ${s.coins}`;
}

// ---------- écran-titre et histoire ----------
function titleScreen() {
  document.getElementById('app').dataset.screen = 'title';
  document.getElementById('hud').hidden = true;
  const has = S.get().stats.missions > 0 || S.get().introSeen;
  UI.openDialog(h('div', { class: 'title-card' },
    h('div', { class: 'logo' }, h('span', { class: 'logo-a' }, 'Maissa'), h('span', { class: 'logo-b' }, 'Academy')),
    h('p', { class: 'tagline' }, 'Le château des savoirs · P4'),
    h('img', { class: 'title-avatar', src: 'assets/portraits/soumaya.webp', alt: 'Maissa, l’héroïne' }),
    h('div', { class: 'actions col' },
      h('button', { class: 'btn primary big', type: 'button', 'data-testid': 'play', 'data-autofocus': true, onclick: () => { UI.closeDialog(); has ? begin() : story(0); } }, has ? '▶ Continuer l’aventure' : '▶ Jouer'),
      h('button', { class: 'btn ghost', type: 'button', onclick: () => UI.settings() }, '⚙️ Réglages et sauvegarde')),
    h('p', { class: 'build-tag' }, 'Version du ' + (typeof __BUILD__ !== 'undefined' ? __BUILD__ : '?') + ' · 3D : ' + (gl3d() ? 'active' : 'non disponible'))),
  { kind: 'title', closable: false, label: 'Maissa Academy' });
}

const STORY = [
  ['Un matin, le Grimoire des Savoirs s’est éteint. Ses dix pages se sont envolées dans le château !', 'soumaya'],
  ['Je m’appelle Maissa, et voici Muezza, mon petit chat tigré. Avec toi, je vais retrouver chaque page.', 'soumaya'],
  ['Explore les salles, touche les objets qui brillent et relève les défis. Chaque réussite rallume une page !', 'soumaya'],
];
function story(k) {
  const last = k >= STORY.length - 1;
  UI.openDialog(h('div', { class: 'panel story' },
    h('img', { class: 'story-portrait', src: 'assets/portraits/soumaya.webp', alt: '' }),
    UI.bubble(STORY[k][0]),
    h('div', { class: 'actions' },
      h('button', { class: 'btn primary', type: 'button', 'data-testid': 'story-next', 'data-autofocus': true, onclick: () => { UI.closeDialog(); last ? begin() : story(k + 1); } }, last ? 'C’est parti !' : 'Suivant →'),
      h('button', { class: 'btn ghost', type: 'button', onclick: () => { UI.closeDialog(); begin(); } }, 'Passer'))),
  { kind: 'story', closable: false, label: 'Histoire' });
}

function begin() {
  S.get().introSeen = true; S.save();
  document.getElementById('app').dataset.screen = 'game';
  document.getElementById('hud').hidden = false;
  Papa.init(() => room);
  document.addEventListener('muezza:jump', () => { if (room && room.mimiReact) room.mimiReact('win'); });
  goScene('hall');
}

// ---------- scènes ----------
let backStack = [], arriveVia = null, actPending = false;
export function goScene(id, { via = null, back = false } = {}) {
  // « Salle surprise » : une salle du château tirée au hasard (jamais la carte ni la salle actuelle)
  if (id === 'random') { const cur = window.__game && window.__game.room && window.__game.room.def && window.__game.room.def.id; const L = Object.keys(SCENES).filter((k) => k !== 'map' && k !== cur && SCENES[k].hotspots && SCENES[k].img); id = L[Math.floor(Math.random() * L.length)] || 'hall'; }
  const fade = document.getElementById('app');
  fade.classList.add('fading');
  // pile des salles visitées pour le bouton ↩ Retour (sans la carte ni le hasard)
  if (back) backStack.pop(); else if (sceneId && sceneId !== 'map' && sceneId !== id) { backStack.push(sceneId); if (backStack.length > 30) backStack.shift(); }
  arriveVia = via;
  fade.classList.toggle('pass-fade', !!via);
  setTimeout(() => { enterScene(id); setTimeout(() => fade.classList.remove('fading', 'pass-fade'), via ? 200 : 60); }, via ? 420 : 280);
}

const SHIFT = { ocean: -3, hall: 0, galerie: 2, map: 0, biblio: -2, foret: 4, atelier: 5, nombres: 7, archives: -5, observatoire: 9 }; // tonalité légère par salle
function enterScene(id, { quiet = false } = {}) {
  clearTimeout(hintTimer);
  window.__sceneAt = Date.now();
  Voice.hush(); // la voix du monde précédent s'éteint en fondu (plus de coupure sèche ni de chevauchement)
  if (room) room.destroy();
  Sfx.ambient(SHIFT[id] || 0);
  Sfx.oceanFx(id === 'ocean');
  if (!quiet && SCENES[id] && id !== 'ocean') Voice.say('room_' + id, { once: true, delay: arriveVia ? 2200 : 1800 });
  if (id === 'ocean') oceanWonder();
  const def = SCENES[id];
  const prevScene = sceneId;
  sceneId = id;
  const ch = S.get().chemin || {};
  const prevId = backStack[backStack.length - 1];
  const back = prevId && SCENES[prevId] && id !== 'map' ? { scene: prevId, icon: '↩️' } : null;
  actPending = false;
  room = new Room(stage(), CH.withChain(def), { motion: S.get().settings.motion, onAct: handleAct, onSpot: (h) => Papa.spot(h.id), back, arrive: arriveVia, passOpen: id === 'hall' || !!ch[id], onActivity: () => activityDone() });
  arriveVia = null;
  if (id === 'hall' && prevScene && prevScene !== 'hall' && !quiet) Papa.event('retour');
  document.getElementById('hud-title').textContent = def.title;
  document.getElementById('btn-home').textContent = id === 'map' ? '🏰' : '🗺️';
  document.getElementById('btn-home').setAttribute('aria-label', id === 'map' ? 'Aller à la grande salle' : 'Aller à la carte des mondes');
  if (!quiet) S.visitRoom(id);
  decorate();
  if (!quiet) scheduleHint();
  if (!quiet) { const w = checkBadges(); if (w.length) UI.toast(`🎖️ Nouveau badge : ${w[0].name}`); }
}

function decorate() {
  if (!room) return;
  const st = S.get();
  room.decorate((hs) => {
    const a = hs.act;
    if (sceneId === 'map' && hs.subject) {
      const subj = hs.subject;
      return { text: `Niv. ${S.currentLevel(subj)}`, done: false };
    }
    if (a.type === 'mission') return { text: `Niv. ${S.currentLevel(a.subject)}` };
    return null;
  });
  if (sceneId === 'map') {
    // suggestion : la matière la moins avancée
    const low = S.SUBJECTS.slice().sort((a, b) => S.currentLevel(a) - S.currentLevel(b))[0];
    const node = SCENES.map.hotspots.find((x) => x.subject === low);
    room.suggest(node && node.id);
  }
}

function scheduleHint() {
  hintTimer = setTimeout(() => {
    if (!room || UI.isOpen() || sceneId === 'map') return;
    const cand = SCENES[sceneId].hotspots.find((x) => x.act.type === 'mission');
    cand && room.suggest(cand.id);
  }, 9000);
}

// ---------- actions ----------
// une activité terminée dans la salle ouvre le passage vers la salle suivante (une fois pour toutes)
function activityDone() {
  if (!room || !sceneId || sceneId === 'map') return;
  const b = S.get(); b.chemin = b.chemin || {}; const first = !b.chemin[sceneId]; b.chemin[sceneId] = true; S.save();
  if (first || (room.passEl && room.passEl.classList.contains('locked'))) setTimeout(() => room && room.unlockPassage(true), 700);
}
document.addEventListener('dlg:closed', () => { if (actPending) { actPending = false; activityDone(); } });
function handleAct(act) {
  switch (act.type) {
    case 'go': goScene(act.scene, { via: act.via || null, back: !!act.back }); break;
    case 'panel': actPending = true; openPanel(act.panel); break;
    case 'mission': actPending = true; startMission(act); break;
    case 'open': openTask(act); break;
    default: break;
  }
}

function openPanel(p) {
  if (p === 'passport') UI.passport();
  else if (p === 'gallery') UI.gallery();
  else if (p === 'mimi') UI.mimiPanel();
  else if (p === 'exams') examHub();
  else if (p === 'explorations') explorations();
  else if (p === 'doc2025') doc2025();
  else if (p === 'belgique') BE.open();
  else if (p === 'solaire') SOL.open();
  else if (p === 'boulier') ABQ.open();
  else if (p === 'cercle') CC.open();
  else if (p === 'ciel') SKY.open();
  else if (p === 'frise') TL.open();
  else if (p === 'plume') LIB.plume();
  else if (p === 'verbes') LIB.escalier();
  else if (p === 'lecture') LIB.lecture();
  else if (p === 'alchimiste') WS.alchimiste();
  else if (p === 'balance') WS.balance();
  else if (p === 'solides') WS.solides();
  else if (p === 'fractions') WS.chaudron();
  else if (p === 'porte') QS.porte();
  else if (p === 'potion') QS.mission();
  else if (p === 'micro') MI.open();
  else if (p === 'dessin') DR.open();
  else if (p === 'decimaux') DC.open();
  else if (p === 'probleme') DC.open('probleme');
  else if (p.startsWith('theatre-')) TH.open(p.slice(8));
  else if (p.startsWith('num-')) NU.open(p.slice(4));
  else if (p.startsWith('vivant-')) VI.open(p.slice(7));
  else if (p.startsWith('donnees-')) DA.open(p.slice(8));
  else if (p.startsWith('corps-')) CO.open(p.slice(6));
  else if (p.startsWith('ocean-')) OC.open(p.slice(6));
  else if (p.startsWith('rabat-')) RB.open(p.slice(6));
  else if (p.startsWith('village-')) VG.open(p.slice(8));
  else if (p.startsWith('vallee-')) PA.open(p.slice(7));
  else if (p === 'atlas') AT.open();
  else if (p === 'echelles') EC.open();
  else if (p === 'jardin') JB.open();
  else if (p === 'ia') IA.open();
  else if (p === 'grande-horloge') HO.open();
  else if (p === 'armoire') AR.open();
  else if (p === 'enigme') HO.openEnigme();
  else if (p === 'labo') LB.open();
  else if (p === 'stetho') LB.stetho();
  else if (p === 'tables') TBL.open();
  else if (p === 'eau-riviere') EAU.open('riviere');
  else if (p === 'soleil') SOLEIL.open();
  else if (p.startsWith('pluriels-')) PLUR.open(p.slice(9));
  else if (p.startsWith('etats-')) ETATS.open(p.slice(6));
  else if (p.startsWith('europe-')) EUR.open(p.slice(7));
  else if (p.startsWith('nl-')) NL.open(p.slice(3));
  else if (p.startsWith('philo-')) PHILO.open(p.slice(6));
  else if (p.startsWith('bouclier-')) BOUC.open(p.slice(9));
  else if (p.startsWith('poemes-')) POEM.open(p.slice(7));
  else if (p === 'ordi') ORDI.open();
  else if (p === 'eau-littoral') EAU.open('littoral');
  else if (p === 'concert') CONC.open(window.__game && window.__game.room);
  else if (p.startsWith('actu-')) AC.open(p.slice(5));
  else if (p === 'atlas-japon') AT.japon();
  else if (p === 'ciel-globe') SKY.open('globe');
}

function buildFor(act, level) {
  let m = null;
  if (act.mode === 'passage') m = C.buildPassageMission(level, { domain: act.domain, subject: act.subject });
  if (!m) m = C.buildMission(act.subject, level, { domains: act.domains || (act.domain ? [act.domain] : null) });
  if (m.questions.length < 3) m = C.buildMission(act.subject, level, {}); // repli : toute la matière
  return m;
}

function startMission(act) {
  UI.missionIntro({
    title: act.title, subject: act.subject, mode: act.mode, domains: act.domains,
    onStart: (level) => runMission(act, level),
  });
}

let streak = 0, idleN = 0, idleT = null;
function armIdle() {
  clearTimeout(idleT);
  idleT = setTimeout(() => { if (idleN < 2 && !document.hidden && !UI.isOpen()) { idleN++; Voice.say('idle'); } armIdle(); }, 90000);
}

function runMission(act, level) {
  streak = 0;
  const mission = buildFor(act, level);
  if (mission.questions.length < 1) { UI.toast('Les exercices de ce niveau arrivent bientôt !'); return; }
  Voice.say('mission_' + act.subject, { once: true, delay: 500 }) || Voice.say('debut', { chance: 0.7, delay: 500 });
  UI.runQuiz(mission, {
    title: `${UI.SUBJECT_ICON[act.subject]} ${act.title} · Niv. ${level}`,
    onQuit: () => { Voice.say('quit', { chance: 0.6 }); },
    onDone: ({ correct, total }) => {
      const pagesBefore = pagesRestored();
      const res = S.recordMission(act.subject, level, correct, total);
      const badges = checkBadges();
      const pageNow = pagesRestored() > pagesBefore ? pagesRestored() : 0;
      decorate();
      if (res.stars > 0) { Sfx.win(); room && room.mimiReact('win'); Mimi.addBond(3); if (badges && badges.length) Voice.say('badge', { delay: 900 }); else Voice.say('bravo', { delay: 900 }); if (res.stars === 3) Papa.event('reussi'); } else Voice.say('courage', { delay: 900 }); checkBadges();
      UI.resultView({
        subject: act.subject, level, correct, total, res, badges, pageNow,
        onReplay: () => runMission(act, level),
        onNext: () => runMission(act, Math.min(S.LEVELS, level + 1)),
        onBack: () => {},
      });
    },
  });
}

// ---------- productions libres ----------
const OPEN_DEFAULT = {
  expression: [
    { id: 'o-def-1', prompt: 'Imagine que tu découvres une clé magique dans le jardin. Écris entre 5 et 8 phrases : où es-tu, que découvres-tu, que fais-tu et comment finit ton histoire ?', rubric: ['Mon histoire a un début, un événement et une fin.', 'J’ai écrit entre 5 et 8 phrases.', 'Chaque phrase commence par une majuscule et finit par un point.', 'J’ai relu les accords des verbes et des noms.'] },
    { id: 'o-def-2', prompt: 'Décris ton animal préféré en 5 phrases : son aspect, ce qu’il mange, où il vit et pourquoi tu l’aimes.', rubric: ['J’ai utilisé au moins deux adjectifs.', 'J’ai écrit 5 phrases complètes.', 'J’ai relu ma ponctuation.'] },
  ],
  creatif: [
    { id: 'o-def-3', prompt: 'Invente un problème de mathématiques avec des prix (en euros) et donne sa solution. Un adulte pourra le vérifier avec toi.', rubric: ['Mon problème a une question claire.', 'Les nombres sont cohérents.', 'J’ai écrit le calcul et la réponse avec l’unité.'] },
    { id: 'o-def-4', prompt: 'Dessine sur une feuille un pont de 12 mètres divisé en 4 parties égales. Écris la longueur d’une partie.', rubric: ['J’ai fait le dessin.', 'J’ai écrit le calcul 12 ÷ 4.', 'Ma réponse est avec l’unité : mètres.'] },
  ],
};

function openTask(act) {
  const fromDb = C.db().openTasks.filter((t) => t.subject === act.subject && (!act.domain || t.domain === act.domain));
  const list = fromDb.length ? fromDb : OPEN_DEFAULT[act.domain] || OPEN_DEFAULT.expression;
  const done = S.get().openDone || (S.get().openDone = {});
  const t = list.find((x) => !done[x.id]) || list[Math.floor(Math.random() * list.length)];
  const ta = h('textarea', { class: 'field area', rows: 6, maxlength: 3000, placeholder: 'Écris ici…', 'aria-label': 'Ta production', 'data-autofocus': true, 'data-testid': 'open-text' });
  const checks = (t.rubric || []).map((r) => h('label', { class: 'check' }, h('input', { type: 'checkbox' }), r));
  UI.openDialog(h('div', { class: 'panel' }, UI.closeButton(),
    h('h2', null, act.domain === 'creatif' ? '🎨 Atelier créatif' : '🪶 Atelier d’écriture'),
    h('p', { class: 'prompt' }, t.prompt), ta,
    h('h3', null, 'Ma grille de relecture'), ...checks,
    h('p', { class: 'muted' }, 'Ces productions ne sont pas corrigées par l’ordinateur : relis-les avec un adulte.'),
    h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-testid': 'open-done', onclick: () => {
      const first = !done[t.id]; done[t.id] = Date.now();
      if (first) { S.get().coins += 15; }
      S.save(); UI.closeDialog(); UI.toast(first ? 'Atelier terminé : +15 🪙' : 'Atelier terminé !'); room && room.celebrate();
    } }, 'J’ai terminé'))), { label: 'Atelier' });
}

// ---------- examens blancs ----------
const SESSIONS = [
  { id: 'nombres', icon: '🔢', title: 'La Tour des Nombres', desc: 'Opérations, fractions, numération, problèmes' },
  { id: 'grandeurs', icon: '📏', title: 'Le Laboratoire des Grandeurs', desc: 'Longueurs, masses, durées, périmètres' },
  { id: 'francais', icon: '📚', title: 'La Bibliothèque Enchantée', desc: 'Orthographe, grammaire, conjugaison, vocabulaire' },
  { id: 'mixte', icon: '🏰', title: 'Le Grand Défi', desc: 'Français, mathématiques et éveil' },
];
const BANDS = ['Explorateur', 'Aventurier', 'Expert'];

function examHub() {
  const hist = S.get().exams.slice(-4).reverse();
  UI.openDialog(h('div', { class: 'panel' }, UI.closeButton(),
    h('h2', null, '🏰 Grand Défi P4 — examens blancs'),
    h('p', { class: 'muted' }, 'Dix questions, sans explications pendant l’épreuve : la correction détaillée arrive à la fin. Exercices originaux d’entraînement, inspirés des compétences de P4.'),
    h('div', { class: 'sessions' }, SESSIONS.map((s) => h('div', { class: 'session' },
      h('div', { class: 'sname' }, `${s.icon} ${s.title}`), h('small', null, s.desc),
      h('div', { class: 'actions wrap' }, BANDS.map((b, k) => h('button', { class: 'btn small', type: 'button', 'data-testid': `exam-${s.id}-${k}`, onclick: () => runExam(s, k) }, b)))))),
    hist.length ? h('div', null, h('h3', null, 'Derniers résultats'), ...hist.map((e) => h('p', { class: 'muted' }, `${e.title} · ${BANDS[e.band]} : ${e.score}/${e.total}`))) : null),
  { label: 'Examens blancs' });
}

function runExam(session, band) {
  const mission = C.buildExam(session.id, band);
  if (mission.questions.length < 5) { UI.toast('Cette épreuve sera bientôt disponible.'); return; }
  Voice.say('exam_start', { delay: 400 });
  UI.runQuiz(mission, {
    title: `${session.icon} ${session.title} · ${BANDS[band]}`, examMode: true,
    onQuit: () => {},
    onDone: ({ correct, total, answers }) => {
      S.get().exams.push({ title: session.title, band, score: correct, total, date: Date.now() });
      S.get().coins += correct * 3; S.save();
      const badges = checkBadges();
      Voice.say(correct / Math.max(1, total) >= 0.6 ? 'exam_fin_bon' : 'exam_fin_moyen', { delay: 700 });
      examReview(session, band, mission, answers, correct, total, badges);
    },
  });
}

function examReview(session, band, mission, answers, correct, total, badges) {
  const items = mission.questions.map((q, i) => {
    const a = answers[i]; const ok = a && a.ok;
    const given = q.type === 'saisie' ? a.given : q.choices[a.given];
    const right = q.type === 'saisie' ? q.accepted[0] : q.choices[q.answer];
    return h('div', { class: `rev ${ok ? 'ok' : 'ko'}` }, h('p', { class: 'prompt' }, `${i + 1}. ${q.prompt}`),
      h('p', null, ok ? `✓ ${given}` : `✗ Ta réponse : ${given} · Attendu : ${right}`), h('small', null, q.explanation));
  });
  UI.openDialog(h('div', { class: 'panel' }, UI.closeButton(),
    h('h2', null, `🎓 ${correct} / ${total}`), h('p', { class: 'muted' }, `${session.title} · ${BANDS[band]}`),
    UI.bubble(correct >= 8 ? 'Quelle championne ! Continue comme ça.' : correct >= 5 ? 'Bon travail ! Relis les corrections pour progresser.' : 'Courage ! Chaque épreuve t’aide à progresser.'),
    ...badges.map((b) => h('div', { class: 'badge-win' }, h('span', { class: 'bi' }, b.icon), h('div', null, h('strong', null, 'Nouveau badge : ' + b.name)))),
    h('div', { class: 'review' }, items),
    h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-autofocus': true, 'data-testid': 'exam-end', onclick: UI.closeDialog }, 'Terminer'))), { label: 'Correction' });
}

// ---------- explorations ----------
const explo = () => S.get().explo || (S.get().explo = {});
function explorations() {
  const list = C.db().explorations || [];
  const done = explo();
  const body = list.map((e) => h('button', { class: `card-btn${done[e.id] ? ' done' : ''}`, type: 'button', 'data-testid': 'exploration', 'data-id': e.id, onclick: () => openExploration(e) },
    h('span', { class: 'ci' }, e.emoji || (e.stages ? '🌐' : '🌍')), h('strong', null, e.title), h('small', null, e.theme || ''),
    done[e.id] ? h('small', { class: 'ok' }, `✓ ${done[e.id].best}/${done[e.id].total}`) : null));
  const n = Object.keys(done).length;
  UI.openDialog(h('div', { class: 'panel' }, UI.closeButton(), h('h2', null, '🌍 Explorations'),
    h('p', { class: 'muted' }, `Une histoire, des mots nouveaux, un défi : ${n} / ${list.length} terminées.`), h('div', { class: 'cards' }, body)), { label: 'Explorations' });
}

function openExploration(e) {
  if (e.stages) return openWorld(e);
  const pages = e.story && e.story.length ? e.story : [];
  const say = (t) => UI.speakText(t);
  let k = 0;
  const draw = () => {
    const lastPage = k >= pages.length - 1;
    UI.openDialog(h('div', { class: 'panel' }, UI.closeButton(), h('h2', null, `${e.emoji || '🌍'} ${e.title}`),
      e.fact ? h('p', { class: 'muted' }, e.fact) : null,
      pages.length ? h('div', { class: 'story-page', 'data-testid': 'story-page' }, h('p', { class: 'passage-text' }, pages[k]),
        h('div', { class: 'row' }, Voice.available() ? h('button', { class: 'btn ghost small', type: 'button', onclick: () => say(pages[k]) }, '🔊 Écouter') : null, h('span', { class: 'muted' }, `${k + 1} / ${pages.length}`))) : null,
      h('div', { class: 'actions' },
        k > 0 ? h('button', { class: 'btn', type: 'button', onclick: () => { k--; draw(); } }, '← Avant') : null,
        !lastPage ? h('button', { class: 'btn primary', type: 'button', 'data-autofocus': true, 'data-testid': 'story-more', onclick: () => { k++; draw(); } }, 'Suite →')
          : h('button', { class: 'btn primary', type: 'button', 'data-autofocus': true, 'data-testid': 'to-lexicon', onclick: () => lexicon(e) }, 'Les mots de l’exploration →'))),
    { label: e.title });
  };
  pages.length ? draw() : lexicon(e);
}

function lexicon(e) {
  const lex = Object.entries(e.lexicon || {});
  UI.openDialog(h('div', { class: 'panel' }, UI.closeButton(), h('h2', null, '📖 Les mots à retenir'),
    h('dl', { class: 'lex' }, lex.map(([w, d]) => [h('dt', null, w), h('dd', null, d)])),
    h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-autofocus': true, 'data-testid': 'to-challenge', onclick: () => exploChallenge(e) }, 'Relever le défi →'))), { label: 'Lexique' });
}

function exploChallenge(e, stage) {
  const qs = (stage ? stage.qs : e.qs).map((q) => C.prepare(q));
  UI.runQuiz({ kind: 'quiz', subject: 'eveil', level: 4, questions: qs, passage: e.passage ? null : null }, {
    title: stage ? stage.name : e.title, onQuit: () => {},
    onDone: ({ correct, total }) => {
      const rec = explo()[e.id] || { best: 0, total: 0 };
      if (!stage) { explo()[e.id] = { best: Math.max(rec.best, correct), total }; }
      else { const st = rec.stages || {}; st[stage.name] = Math.max(st[stage.name] || 0, correct); const sum = Object.values(st).reduce((a, b) => a + b, 0); explo()[e.id] = { best: sum, total: e.stages.reduce((a, x) => a + x.qs.length, 0), stages: st }; }
      S.get().coins += correct * 4; S.save();
      const ok = (e.activities && !stage) ? () => exploActivities(e, correct, total) : () => UI.toast(`${correct}/${total} — bien joué !`);
      ok(); room && room.celebrate();
    },
  });
}

function exploActivities(e, correct, total) {
  UI.openDialog(h('div', { class: 'panel' }, UI.closeButton(), h('h2', null, `🌟 ${correct} / ${total}`),
    UI.bubble('Bravo, exploratrice ! Voici trois petits défis à faire à l’oral ou sur ton carnet.'),
    ...(e.activities || []).map((a, i) => h('details', { class: 'passage' }, h('summary', null, `${i + 1}. ${a.titre}`), h('p', null, a.consigne), h('details', null, h('summary', null, 'Voir la réponse'), h('p', null, a.corrige)))),
    h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', 'data-autofocus': true, onclick: () => { UI.closeDialog(); explorations(); } }, 'Autres explorations'))), { label: 'Défis' });
}

function openWorld(e) {
  const rec = explo()[e.id] || { stages: {} };
  UI.openDialog(h('div', { class: 'panel' }, UI.closeButton(), h('h2', null, e.title), h('p', { class: 'muted' }, e.intro || ''),
    h('div', { class: 'sessions' }, e.stages.map((st) => h('div', { class: 'session' }, h('div', { class: 'sname' }, st.name),
      h('small', null, `${(rec.stages || {})[st.name] != null ? 'Meilleur : ' + rec.stages[st.name] + ' / ' + st.qs.length : st.qs.length + ' questions'}`),
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn small', type: 'button', onclick: () => exploChallenge(e, st) }, 'Jouer')))))), { label: e.title });
}

function practice2025(key, title, ps) {
  let mission;
  if (ps) {
    const seen = S.get().seen; const groups = ps.map((p) => ({ p, qs: C.db().questions.filter((q) => q.passage === p.id) })).filter((g) => g.qs.length);
    if (!groups.length) { UI.toast('Bientôt disponible.'); return; }
    const g = C.shuffle(groups).sort((a, b) => a.qs.filter((q) => seen[q.id]).length - b.qs.filter((q) => seen[q.id]).length)[0];
    mission = { kind: 'quiz', subject: g.p.subject, level: g.p.level, passage: g.p, questions: g.qs.map(C.prepare) };
  } else {
    const qs = C.shuffle(C.db().questions.filter((q) => q.exam2025 === key && !q.passage)).slice(0, 10);
    mission = { kind: 'quiz', subject: qs[0].subject, level: qs[0].level, questions: qs.map(C.prepare) };
  }
  UI.closeDialog();
  UI.runQuiz(mission, {
    title: '📄 ' + title,
    onQuit: () => {},
    onDone: ({ correct, total }) => {
      const b = S.get().i25 || (S.get().i25 = {}); const sc = `${correct}/${total}`;
      if (!b[key] || correct / total >= +b[key].split('/')[0] / +b[key].split('/')[1]) b[key] = sc;
      S.get().coins += correct * 2; S.save(); decorate();
      if (correct / Math.max(1, total) >= 0.6) { Sfx.win(); Voice.say('bravo', { delay: 500 }); } else Voice.say('courage', { delay: 500 });
      UI.toast(`${sc} · +${correct * 2} 🪙`); setTimeout(doc2025, 400);
    },
  });
}
function openTask2025(tasks) {
  const t = tasks[Math.floor(Math.random() * tasks.length)];
  const ta = h('textarea', { class: 'field area', rows: 6, maxlength: 3000, placeholder: 'Écris ici…', 'aria-label': 'Ta production', 'data-autofocus': true });
  UI.openDialog(h('div', { class: 'panel' }, UI.closeButton(), h('h2', null, '🪶 Atelier · examens 2025'), h('p', { class: 'prompt' }, t.prompt), ta,
    h('h3', null, 'Ma grille de relecture'), ...(t.rubric || []).map((r) => h('label', { class: 'check' }, h('input', { type: 'checkbox' }), r)),
    h('p', { class: 'muted' }, 'Ces productions ne sont pas corrigées par l’ordinateur : relis-les avec un adulte.'),
    h('div', { class: 'actions' }, h('button', { class: 'btn primary', type: 'button', onclick: () => { UI.closeDialog(); UI.toast('Atelier terminé !'); setTimeout(doc2025, 300); } }, 'J’ai terminé'))), { label: 'Atelier' });
}
const DOCS2025 = [
  ['doc01_formation_historique', 'Document 1 · Formation historique'],
  ['doc02_sciences', 'Document 2 · Sciences'],
  ['doc03_ecouter', 'Document 3 · Écouter'],
  ['doc04_epc', 'Document 4 · Éducation à la philosophie et à la citoyenneté'],
  ['doc05_statistique', 'Document 5 · De l’organisation des données à la statistique'],
  ['doc06_ecrire_parler', 'Document 6 · Écrire et parler'],
  ['doc07_geometrie_sciences', 'Document 7 · Géométrie et sciences'],
  ['doc08_lire_grandeurs', 'Document 8 · Lire et grandeurs'],
  ['doc09_ecrire_stat_fes', 'Document 9 · Écrire, statistique, formation économique et sociale'],
  ['doc10_arithmetique_algebre', 'Document 10 · De l’arithmétique à l’algèbre'],
  ['doc11_eca_fg_grandeurs', 'Document 11 · Éducation culturelle et artistique, formation géographique, grandeurs'],
  ['fmttn', 'Formation manuelle, technique, technologique et numérique'],
  ['religion', 'Religion'],
];
function doc2025() {
  const single = typeof window !== 'undefined' && window.__ASSETS;
  const online = 'https://avenirprojets2026-bot.github.io/Maissa-academy/premium/';
  const url = (k) => (single ? online : '') + `assets/docs/p4_2025_${k}.pdf`;
  const link = (k, t, cls) => h('a', { class: 'doc-link' + (cls ? ' ' + cls : ''), href: url(k), target: '_blank', rel: 'noopener' }, h('span', { 'aria-hidden': 'true' }, '📄'), h('span', null, t));
  const best = S.get().i25 || {};
  const row = (k, t) => {
    const key = /^doc\d\d/.test(k) ? k.slice(0, 5) : k;
    const qs = C.db().questions.filter((q) => q.exam2025 === key && !q.passage);
    const ps = C.db().passages.filter((p) => p.exam2025 === key);
    const tasks = C.db().openTasks.filter((o) => o.exam2025 === key);
    return h('div', { class: 'doc-row' }, link(k, t),
      h('div', { class: 'actions wrap' },
        qs.length ? h('button', { class: 'btn small', type: 'button', 'data-testid': 'i25-' + key, onclick: () => practice2025(key, t, null) }, `🏆 Je relève le défi (${qs.length})${best[key] ? ' · ✓ ' + best[key] : ''}`) : null,
        ps.length ? h('button', { class: 'btn small', type: 'button', onclick: () => practice2025(key, t, ps) }, ps[0].domain === 'ecoute' ? '🎧 Écouter un texte' : '📖 Lire un texte') : null,
        tasks.length ? h('button', { class: 'btn small', type: 'button', onclick: () => { UI.closeDialog(); openTask2025(tasks); } }, '🪶 Écrire / dire') : null));
  };
  // « Les Défis des Grands Explorateurs » : le grimoire caché des Archives (4 chapitres à feuilleter, sans chronomètre ni note)
  const CH = [
    ['📖', 'Les secrets des mots', 'Lire, écouter, écrire et parler.', ['doc03', 'doc06', 'doc08']],
    ['🔢', 'Les mystères des nombres', 'Calculs, fractions, grandeurs, géométrie et statistiques.', ['doc05', 'doc07', 'doc10']],
    ['🔬', 'Les découvertes scientifiques', 'Terre, animaux, corps humain, expériences… et le monde qui nous entoure.', ['doc02', 'doc04', 'doc09', 'fmttn', 'religion']],
    ['🧭', 'Les voyages dans le temps', 'Histoire, géographie, cartes et chronologie.', ['doc01', 'doc11']],
  ];
  const docsOf = (keys) => DOCS2025.filter(([k]) => keys.some((x) => k.startsWith(x)));
  const pageEl = h('div', { class: 'gb-page' }), nav = h('div', { class: 'gb-nav' });
  let pg = 0;
  const show = (d = 0) => {
    const [ic, t, sub, keys] = CH[pg];
    pageEl.classList.remove('flip-l', 'flip-r'); void pageEl.offsetWidth; if (d) pageEl.classList.add(d > 0 ? 'flip-r' : 'flip-l');
    pageEl.replaceChildren(h('div', { class: 'gb-head' }, h('span', { class: 'gb-ic' }, ic), h('h3', null, t), h('p', { class: 'muted' }, sub)), h('div', { class: 'doc-list' }, ...docsOf(keys).map(([k, tt]) => row(k, tt.replace(/^Document \d+ · /, '')))));
    nav.replaceChildren(h('button', { class: 'btn small', type: 'button', disabled: pg === 0, 'aria-label': 'Page précédente', onclick: () => { pg--; Sfx.tap(); show(-1); } }, '‹'), h('span', null, `Page ${pg + 1} / ${CH.length}`), h('button', { class: 'btn small', type: 'button', disabled: pg === CH.length - 1, 'aria-label': 'Page suivante', onclick: () => { pg++; Sfx.tap(); show(1); } }, '›'));
  };
  UI.openDialog(h('div', { class: 'panel gb-panel' }, UI.closeButton(), h('h2', null, '📘 Les Défis des Grands Explorateurs'),
    h('p', { class: 'gb-intro' }, 'Une collection secrète d’anciens défis, cachée dans les Archives du Temps. Choisis un chapitre et relève les défis à ton rythme : pas de chronomètre, pas de note !'),
    pageEl, nav,
    h('details', { class: 'ac-src gb-papa' }, h('summary', null, '📚 Pour Papa : les documents officiels'),
      h('p', { class: 'muted' }, 'Évaluations interdiocésaines P4 · juin 2025 — les 13 documents officiels, joints tels quels (à ouvrir ou imprimer).'),
      h('div', { class: 'doc-list' }, ...DOCS2025.map(([k, t]) => link(k, t))),
      h('div', { class: 'doc-list' }, link('fmttn_correctif', 'Correctif · Formation manuelle, technique, technologique et numérique', 'parent')),
      single ? h('p', { class: 'muted' }, 'Dans le fichier unique, les PDF s’ouvrent depuis la version en ligne (connexion Internet nécessaire).') : null)), { label: 'Les Défis des Grands Explorateurs' });
  show();
}

// Cité sous l'Océan : à l'arrivée, l'héroïne s'émerveille (une phrase au hasard, avec sa voix)
const WONDER = [
  ['assets/voice/oc_wonder1.ogg', 'Waouh… on dirait qu’on nage dans un rêve !'],
  ['assets/voice/oc_wonder2.ogg', 'Regarde, une baleine géante ! Elle est plus grande que notre maison !'],
  ['assets/voice/oc_wonder4.ogg', 'C’est magique ! Des méduses qui brillent comme des lanternes !'],
  ['assets/voice/oc_wonder7.ogg', 'Je n’ai jamais rien vu d’aussi beau de toute ma vie !'],
  ['assets/voice/oc_wonder8.ogg', 'Soumaya, viens voir ! La baleine nous fait un clin d’œil !'],
];
let lastWonder = -1;
function oceanWonder() {
  let k; do { k = Math.floor(Math.random() * WONDER.length); } while (k === lastWonder && WONDER.length > 1); lastWonder = k;
  const [src, txt] = WONDER[k];
  Voice.later(() => {
    if (sceneId !== 'ocean' || !room) return;
    try { room.heroPose && room.heroPose('joie', 2000); room.hsay && room.hsay(txt, 4200); } catch (e) { /* */ }
    // d'abord l'émerveillement, puis (quand il est fini) la présentation de la Cité : jamais deux voix en même temps
    const thenRoom = () => Voice.later(() => { if (sceneId === 'ocean') Voice.say('room_ocean', { once: true }); }, 700);
    if (Sfx.soundOn() && S.get().settings.voice !== false) { const el = Voice.playUrl(src); if (el) { el.addEventListener('ended', thenRoom, { once: true }); el.addEventListener('error', thenRoom, { once: true }); } else thenRoom(); } else thenRoom();
  }, 1400);
}
