// Muezza, le petit chat tigré (blanc et gris-brun) : identité, lien d'amitié, humeur, voix (synthèse WebAudio) et phrases.
// Aucune dépendance au rendu : world.js (animation) et ui.js (fiche) s'appuient sur ce module.
import * as S from './save.js';
import { asset } from './asset.js';

export const FURS = [{ id: 'noir', name: 'Tigré' }, { id: 'blanc', name: 'Blanc' }];
// Nœuds : se débloquent avec le lien d'amitié (niveau ≥ lvl)
export const BOWS = [
  { id: 'rose', name: 'Rose', lvl: 0 }, { id: 'bleu', name: 'Bleu ciel', lvl: 1 }, { id: 'violet', name: 'Violet magique', lvl: 2 },
  { id: 'dore', name: 'Doré', lvl: 3 }, { id: 'vert', name: 'Vert forêt', lvl: 4 },
];
export const BOND_LEVELS = [
  { min: 0, name: 'Timide' }, { min: 10, name: 'Curieuse' }, { min: 30, name: 'Complice' },
  { min: 60, name: 'Fidèle' }, { min: 100, name: 'Inséparable' }, { min: 160, name: 'Gardienne du château' },
];
export const TREAT_COST = 10;
const PET_COOLDOWN = 20000, TREAT_COOLDOWN = 30000;

export const state = () => S.get().mimi;

const NOIR_ONLY = { dort: 'repos', assis: 'repos', toilette: 'repos' };
export function spriteUrl(pose) {
  const m = state();
  if (m.fur === 'blanc' && NOIR_ONLY[pose]) pose = NOIR_ONLY[pose];
  const dir = m.fur === 'blanc' ? 'blanc' : `noir-${BOWS.some((b) => b.id === m.bow) ? m.bow : 'rose'}`;
  return asset(`assets/sprites/mimi/${dir}/${pose}.webp`);
}
export const furLabel = () => (state().fur === 'blanc' ? 'petite chatte blanche' : 'petit chat tigré');

export function level(bond = state().bond) {
  let l = 0;
  BOND_LEVELS.forEach((b, i) => { if (bond >= b.min) l = i; });
  return l;
}
export function progress() {
  const b = state().bond, l = level(b), cur = BOND_LEVELS[l], nxt = BOND_LEVELS[l + 1];
  return { bond: b, level: l, name: cur.name, next: nxt ? nxt.min : null, ratio: nxt ? (b - cur.min) / (nxt.min - cur.min) : 1 };
}

// Ajoute du lien d'amitié ; renvoie le nouveau niveau si on vient d'en franchir un.
export function addBond(n) {
  const m = state(), before = level();
  m.bond = Math.max(0, m.bond + n);
  S.save();
  const after = level();
  if (after > before) {
    const bow = BOWS.find((b) => b.lvl === after);
    document.dispatchEvent(new CustomEvent('mimi:levelup', { detail: { level: after, name: BOND_LEVELS[after].name, bow } }));
    return after;
  }
  return 0;
}

export function canPet(now = Date.now()) { return now - (state().lastPet || 0) >= PET_COOLDOWN; }
export function pet(now = Date.now()) {
  const m = state(); let gained = false;
  if (canPet(now)) { m.lastPet = now; m.pets = (m.pets || 0) + 1; gained = true; addBond(1); }
  S.save();
  return gained;
}

export function treatWait(now = Date.now()) { return Math.max(0, TREAT_COOLDOWN - (now - (state().lastFeed || 0))); }
export function feed(now = Date.now()) {
  const st = S.get(), m = st.mimi;
  if (st.coins < TREAT_COST) return { ok: false, why: 'coins' };
  if (treatWait(now) > 0) return { ok: false, why: 'wait' };
  st.coins -= TREAT_COST; m.fed = (m.fed || 0) + 1; m.lastFeed = now;
  addBond(4); S.save();
  return { ok: true };
}

export function setBow(id) {
  const b = BOWS.find((x) => x.id === id); if (!b || b.lvl > level()) return false;
  state().bow = id; S.save(); return true;
}
export function setFur(id) { if (!FURS.some((f) => f.id === id)) return; state().fur = id; S.save(); }

export function mood() {
  const m = state(), hours = (Date.now() - (m.lastFeed || 0)) / 36e5;
  if (m.fed && hours > 48) return { icon: '🥺', text: 'Muezza a un peu faim…' };
  const l = level();
  if (l >= 4) return { icon: '😻', text: 'Muezza est aux anges !' };
  if (l >= 2) return { icon: '😺', text: 'Muezza est de bonne humeur.' };
  return { icon: '🐱', text: 'Muezza te regarde avec curiosité.' };
}

const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const LINES = {
  pet: ['Prrr…', 'Prrrrr 💗', 'Miaou !', 'Mrrrp ?', 'Encore, encore !'],
  ok: ['Prrr ! Bravo !', 'Miaou ! Bien joué !', 'Tu es trop forte !', 'Muezza saute de joie !'],
  ko: ['Miaou… regarde bien.', 'Pas grave, on réessaie !', 'Muezza est là !', 'Courage, Soumaya.'],
  win: ['Miaaaou ! Victoire !', 'Quelle exploratrice !', 'Muezza ronronne de fierté !'],
  sleep: ['Zzz…'], wake: ['Mmh ? Miaou !', 'Oh, tu es là !'],
  treat: ['Miam ! Merci !', 'Croc croc… délicieux !', 'Prrrr ! Mes préférées !'],
  idle: ['Miaou ?', '👀', '✨', '🐾'],
  hint: ['Muezza souffle', 'Muezza te glisse à l’oreille', 'Muezza a remarqué'],
};
export const line = (k) => pick(LINES[k] || LINES.idle);

// ---------- voix : miaulement et ronronnement synthétisés (aucun fichier audio) ----------
let ctx = null;
function audio() {
  if (!S.get().settings.sound) return null;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch (e) { return null; }
}
// vrais miaulements enregistrés (fichiers), le son synthétisé ne sert que de secours
const REAL = { m: ['assets/sfx/miaou_d.mp3'], p: ['assets/sfx/ronron.mp3'] }, bufs = {};
function loadBuf(a, u) {
  if (!bufs[u]) bufs[u] = fetch(asset(u)).then((r) => r.arrayBuffer()).then((b) => new Promise((ok, ko) => a.decodeAudioData(b, ok, ko))).catch(() => null);
  return bufs[u];
}
function playReal(kind, rate, vol, synth) {
  const a = audio(); if (!a) return;
  const list = REAL[kind], u = list[Math.floor(Math.random() * list.length)];
  loadBuf(a, u).then((buf) => {
    if (!buf) { synth(); return; }
    const src = a.createBufferSource(), g = a.createGain(); src.buffer = buf; src.playbackRate.value = rate; g.gain.value = vol;
    src.connect(g); g.connect(a.destination); src.start();
  });
}
export function preloadVoice() { if (SILENT) return; const a = audio(); if (a) [...REAL.m, ...REAL.p].forEach((u) => loadBuf(a, u)); }
// Muezza ne fait plus aucun son (choix de papa) : miaulements et ronrons désactivés, les bulles et la vibration restent
const SILENT = true;
export function meow(high = 1) { if (SILENT) return; playReal('m', Math.max(0.95, Math.min(1.1, high)) * (0.98 + Math.random() * 0.04), 0.85, () => meowSynth(high)); }
function meowSynth(high = 1) {
  const a = audio(); if (!a) return;
  const t = a.currentTime, o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(520 * high, t); o.frequency.linearRampToValueAtTime(880 * high, t + 0.12); o.frequency.exponentialRampToValueAtTime(560 * high, t + 0.42);
  f.type = 'bandpass'; f.Q.value = 3; f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(1800, t + 0.15); f.frequency.linearRampToValueAtTime(1000, t + 0.42);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  o.connect(f); f.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 0.5);
}
export function purr(sec = 1.1) { if (SILENT) return; playReal('p', 1, 0.8, () => purrSynth(sec)); }
function purrSynth(sec = 1.1) {
  const a = audio(); if (!a) return;
  const t = a.currentTime, o = a.createOscillator(), lfo = a.createOscillator(), g = a.createGain(), lg = a.createGain();
  o.type = 'sawtooth'; o.frequency.value = 55; lfo.type = 'sine'; lfo.frequency.value = 24; lg.gain.value = 0.05;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.07, t + 0.15); g.gain.linearRampToValueAtTime(0.0001, t + sec);
  lfo.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(a.destination);
  o.start(t); lfo.start(t); o.stop(t + sec + 0.05); lfo.stop(t + sec + 0.05);
}
export function buzz(p) { try { if (S.get().settings.sound && navigator.vibrate) navigator.vibrate(p); } catch (e) { /* ignoré */ } }
