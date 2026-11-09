// Lecture à voix haute : choix de la meilleure voix française disponible sur l'appareil, texte préparé pour
// la parole, découpage en phrases (évite les coupures de Chrome/Android sur les longs textes).
import * as S from './save.js';
import { asset } from './asset.js';

let voices = [];
const supported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
export const available = supported;

function refresh() { try { voices = speechSynthesis.getVoices() || []; } catch (e) { voices = []; } return voices; }
if (supported()) {
  refresh();
  try { speechSynthesis.addEventListener('voiceschanged', refresh); } catch (e) { speechSynthesis.onvoiceschanged = refresh; }
}

export function frenchVoices() {
  refresh();
  return voices.filter((v) => /^fr/i.test(v.lang.replace('_', '-'))).sort((a, b) => score(b) - score(a));
}

// Plus le score est élevé, plus la voix est naturelle / adaptée à un enfant
function score(v) {
  const n = (v.name || '').toLowerCase(), l = v.lang.replace('_', '-').toLowerCase();
  let s = 0;
  if (l === 'fr-be') s += 30; else if (l === 'fr-fr') s += 24; else if (l === 'fr-ca') s += 14; else if (l.startsWith('fr')) s += 8;
  if (/natural|neural|online|premium|enhanced|améliorée|wavenet|studio/.test(n)) s += 40;
  if (/google/.test(n)) s += 22;
  if (/samsung/.test(n)) s += 8;
  if (/denise|eloise|éloïse|vivienne|brigitte|amélie|amelie|audrey|aurelie|aurélie|julie|hortense|marie|céline|celine|female|femme/.test(n)) s += 14;
  if (/henri|claude|paul|thomas|male|homme|jean|antoine|remy|rémy/.test(n)) s -= 4;
  if (/compact|espeak|robot|festival|pico/.test(n)) s -= 40;
  if (!v.localService && typeof navigator !== 'undefined' && navigator.onLine === false) s -= 100; // hors ligne : voix locale seulement
  return s;
}

export function pickVoice() {
  const want = S.get().settings.voiceName;
  const fr = frenchVoices();
  if (want) { const v = fr.find((x) => x.name === want); if (v) return v; }
  return fr[0] || null;
}

// Prépare le texte pour qu'il soit bien prononcé (symboles, émojis, abréviations)
const NUMW = 'zéro|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante|cent|mille';
export function prepare(text) {
  return String(text)
    .replace(/\s*[\u2190-\u21FF\u27A1\u279C\u2794]\uFE0F?\s*/g, ', ') // jamais « flèche droite » à voix haute : une petite pause
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ' ')
    .replace(/(\d)\s*[×x]\s*(\d)/g, '$1 fois $2')
    // « plus » de l'addition : on entend le s (« 3 plus 4 » → plusse), pas « plu »
    .replace(/(\d)\s*\+\s*(?=\d)/g, '$1 plusse ')
    .replace(new RegExp(`(\\d|\\b(?:${NUMW}))\\s+plus\\s+(?=\\d|(?:${NUMW})\\b)`, 'gi'), (m, a) => a + ' plusse ')
    .replace(/\s×\s/g, ' fois ').replace(/÷/g, ' divisé par ').replace(/\s\+\s/g, ' plusse ').replace(/\s[−–-]\s(?=\d)/g, ' moins ')
    .replace(/\s=\s/g, ' égale ').replace(/(\d)\s*%/g, '$1 pour cent').replace(/(\d)\s*€/g, '$1 euros')
    .replace(/(\d)\s*km²/g, '$1 kilomètres carrés').replace(/(\d)\s*m²/g, '$1 mètres carrés')
    .replace(/(\d)\s*cm\b/g, '$1 centimètres').replace(/(\d)\s*kg\b/g, '$1 kilos').replace(/(\d)\s*km\b/g, '$1 kilomètres')
    .replace(/(\d)\s*dl\b/g, '$1 décilitres').replace(/(\d)\s*cl\b/g, '$1 centilitres').replace(/(\d)\s*ml\b/g, '$1 millilitres')
    .replace(/\bP4\b/g, 'P quatre').replace(/\b1er\b/g, 'premier').replace(/\b(\d+)e\b/g, '$1ième')
    .replace(/[«»"“”]/g, ' ').replace(/[_*#]/g, ' ').replace(/\s+/g, ' ').trim();
}

function chunks(t) {
  const parts = t.match(/[^.!?…;:\n]+[.!?…;:]?/g) || [t];
  const out = []; let cur = '';
  for (const p of parts) {
    if ((cur + p).length > 180 && cur) { out.push(cur.trim()); cur = p; } else cur += p;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

let token = 0;
export function stop() { token++; if (supported()) try { speechSynthesis.cancel(); } catch (e) { /* ignoré */ } }

export function speak(text, { onEnd, force = false } = {}) {
  if (!supported() || (!force && !S.get().settings.voice)) { onEnd && onEnd(); return false; }
  // une voix enregistrée (Soumaya/Maissa, Papa, vidéo) parle encore : la question s'affiche tout de suite, mais sa lecture attend la fin
  if (isTalking() || videoTalking()) { stop(); const t1 = token, until = Date.now() + 15000; const wait = () => { if (token !== t1) return; if ((isTalking() || videoTalking()) && Date.now() < until) { setTimeout(wait, 250); return; } speak(text, { onEnd, force }); }; setTimeout(wait, 250); return true; }
  const vf = window.__vf, now = performance.now();
  if (vf && ((vf.pending && now - vf.t0 < 5000) || vf.end > now)) { stop(); const t0 = token; setTimeout(() => { if (token === t0) speak(text, { onEnd, force }); }, 200); return true; }
  stop();
  const my = token, st = S.get().settings, v = pickVoice();
  const list = chunks(prepare(text));
  let i = 0;
  const next = () => {
    if (my !== token) return;
    if (i >= list.length) { onEnd && onEnd(); return; }
    const u = new SpeechSynthesisUtterance(list[i++]);
    u.lang = v ? v.lang : 'fr-FR'; if (v) u.voice = v;
    u.rate = Math.min(1.2, Math.max(0.6, +st.voiceRate || 0.92)); u.pitch = Math.min(1.5, Math.max(0.7, +st.voicePitch || 1.05));
    u.onend = () => setTimeout(next, 120);
    u.onerror = () => { if (my === token) setTimeout(next, 60); };
    try { speechSynthesis.speak(u); } catch (e) { /* ignoré */ }
  };
  // petit délai : certains moteurs Android ignorent un speak() juste après cancel()
  setTimeout(next, 60);
  return true;
}

// Phrases enregistrées (voix clonée du papa) : bienvenue, bravo, courage. Repli silencieux si le fichier ne se lit pas.
let clipEl = null, clipAt = 0;
// Copie Maissa : phrases réenregistrées avec la voix clonée du papa de Maissa (et « Maissa »). Les autres restent muettes.
const PAPA_OK = new Set(["room_archives_c", "room_hall_b", "room_galerie_b", "room_map_b", "room_ocean_b", "room_biblio_b", "room_foret_b", "room_atelier_b", "room_nombres_b", "room_archives_b", "room_observatoire_b", "room_theatre_b", "room_tour_b", "room_vivant_b", "room_donnees_b", "room_corps_b", "room_vallee_b", "room_village_b", "badge", "badge2", "badge3", "bienvenue", "bienvenue2", "bienvenue3", "bienvenue4", "bravo", "bravo10", "bravo11", "bravo12", "bravo2", "bravo3", "bravo4", "bravo5", "bravo6", "bravo7", "bravo8", "bravo9", "calin1", "calin2", "calin3", "courage", "courage10", "courage11", "courage2", "courage3", "courage4", "courage5", "courage6", "courage7", "courage8", "courage9", "debut1", "debut2", "debut3", "debut4", "debut5", "exam_fin_bon", "exam_fin_bon2", "exam_fin_bon3", "exam_fin_moyen", "exam_fin_moyen2", "exam_fin_moyen3", "exam_start", "idle1", "idle2", "idle3", "idle4", "ko1", "ko2", "ko3", "ko4", "ko5", "ko6", "ko7", "ko8", "mimi_up", "mimi_up2", "mimi_up3", "mission_eveil", "mission_eveil2", "mission_francais", "mission_francais2", "mission_maths", "mission_maths2", "ok1", "ok10", "ok11", "ok12", "ok2", "ok3", "ok4", "ok5", "ok6", "ok7", "ok8", "ok9", "quit1", "quit2", "quit3", "room_archives", "room_atelier", "room_biblio", "room_corps", "room_donnees", "room_foret", "room_galerie", "room_hall", "room_map", "room_nombres", "room_observatoire", "room_ocean", "room_theatre", "room_tour", "room_vallee", "room_village", "room_vivant", "streak1", "streak2", "streak3", "streak4"]);
export function clip(name) {
  if (!PAPA_OK.has(name)) return false;
  try {
    const st = S.get().settings;
    if (!st.voice || typeof Audio === 'undefined') return false;
    const now = Date.now(); if (now - clipAt < 2500) return false; clipAt = now;
    stop(); if (clipEl) fadeOutEl(clipEl);
    clipEl = playUrl(`assets/voice/${name}.ogg`);
    return true;
  } catch (e) { return false; }
}

// Groupes de phrases enregistrées : une variante au hasard (évite la répétition) ; `once` = une seule fois par session.
const seq = (base, n, first = base) => [first, ...Array.from({ length: n - 1 }, (_, i) => base + (i + 2))];
const num = (base, n) => Array.from({ length: n }, (_, i) => base + (i + 1));
const GROUPS = {
  ok: num('ok', 12), ko: num('ko', 8), bravo: seq('bravo', 12), courage: seq('courage', 11),
  streak: num('streak', 4), debut: num('debut', 5), idle: num('idle', 4), quit: num('quit', 3), calin: num('calin', 3),
  bienvenue: seq('bienvenue', 4), exam_fin_bon: seq('exam_fin_bon', 3), exam_fin_moyen: seq('exam_fin_moyen', 3),
  mimi_up: seq('mimi_up', 3), badge: seq('badge', 3),
  // annonces des salles : « Bienvenue dans …, Maissa ! », parfois avec un petit mot tendre (mon ange, ma chérie…)
  room_hall: ['room_hall', 'room_hall_b'],
  room_galerie: ['room_galerie', 'room_galerie_b'],
  room_map: ['room_map', 'room_map_b'],
  room_ocean: ['room_ocean', 'room_ocean_b'],
  room_biblio: ['room_biblio', 'room_biblio_b'],
  room_foret: ['room_foret', 'room_foret_b'],
  room_atelier: ['room_atelier', 'room_atelier_b'],
  room_nombres: ['room_nombres', 'room_nombres_b'],
  room_archives: ['room_archives', 'room_archives_b', 'room_archives_c'],
  room_observatoire: ['room_observatoire', 'room_observatoire_b'],
  room_theatre: ['room_theatre', 'room_theatre_b'],
  room_tour: ['room_tour', 'room_tour_b'],
  room_vivant: ['room_vivant', 'room_vivant_b'],
  room_donnees: ['room_donnees', 'room_donnees_b'],
  room_corps: ['room_corps', 'room_corps_b'],
  room_vallee: ['room_vallee', 'room_vallee_b'],
  room_village: ['room_village', 'room_village_b'],
  mission_francais: seq('mission_francais', 2), mission_maths: seq('mission_maths', 2), mission_eveil: seq('mission_eveil', 2),
};
const heard = new Set(); let lastVar = {};
export function say(group, { chance = 1, once = false, delay = 0 } = {}) {
  try {
    if (once) { if (heard.has(group)) return false; heard.add(group); }
    if (Math.random() > chance) return false;
    let name = group;
    const list = GROUPS[group];
    if (list) { do { name = list[Math.floor(Math.random() * list.length)]; } while (list.length > 1 && name === lastVar[group]); lastVar[group] = name; }
    if (delay) { later(() => clip(name), delay); return true; }
    return clip(name);
  } catch (e) { return false; }
}

// ---------- lecture des fichiers de voix sans « clic » ni chevauchement ----------
// Une seule voix enregistrée à la fois : la précédente s'éteint en fondu (≈120 ms) au lieu d'être coupée net,
// et tout ce qui est en attente est annulé quand on change de monde.
const live = new Set(); const timers = new Set();
export function fadeOutEl(el, ms = 120) {
  if (!el) return; live.delete(el);
  try {
    const v0 = el.volume, n = 6; let k = 0;
    const tm = setInterval(() => { k++; try { el.volume = Math.max(0, v0 * (1 - k / n)); } catch (e) { /* */ } if (k >= n) { clearInterval(tm); try { el.pause(); } catch (e) { /* */ } } }, ms / n);
  } catch (e) { try { el.pause(); } catch (e2) { /* */ } }
}
export function playUrl(url, { volume = 1, solo = true, keep = false } = {}) {
  try {
    if (solo) [...live].forEach((e) => fadeOutEl(e));
    const el = new Audio(asset(url)); el.volume = volume; el.preload = 'auto'; el._keep = keep;
    live.add(el); el.addEventListener('ended', () => live.delete(el), { once: true });
    // Papa est en train de parler (voix enregistrée Web Audio) : on attend la fin de sa phrase au lieu de parler par-dessus
    const vf = window.__vf, wait = vf && vf.end > performance.now() ? vf.end - performance.now() + 350 : (vf && vf.pending && performance.now() - vf.t0 < 5000 ? 1200 : 0);
    const go = () => { if (!live.has(el)) return; const pr = el.play(); if (pr && pr.catch) pr.catch(() => live.delete(el)); };
    // la voix de synthèse lit encore une question : on attend qu'elle ait fini (8 s maximum)
    const ttsBusy = () => { try { return supported() && speechSynthesis.speaking; } catch (e) { return false; } };
    const t0 = Date.now();
    const go2 = () => { if (ttsBusy() && Date.now() - t0 < 8000) { later(go2, 250); return; } go(); };
    if (wait > 0) later(() => { const v2 = window.__vf; if (v2 && v2.end > performance.now()) later(go2, v2.end - performance.now() + 350); else go2(); }, wait); else go2();
    return el;
  } catch (e) { return null; }
}
export function later(fn, ms) { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; }
// changement de monde : on coupe proprement tout ce qui parle encore ou allait parler
export function hush() {
  timers.forEach(clearTimeout); timers.clear();
  [...live].forEach((e) => { if (!e._keep) fadeOutEl(e, 160); });
  if (clipEl) { fadeOutEl(clipEl, 160); clipEl = null; }
  stop();
  try { if (window.__hushPapa) window.__hushPapa(); } catch (e) { /* */ }
}

// une voix enregistrée est-elle en train de parler ? (sert à Papa pour attendre son tour)
export function isTalking() {
  for (const e of live) { if (!e.paused && !e.ended) return true; }
  return !!(clipEl && !clipEl.paused && !clipEl.ended);
}

function videoTalking() {
  try { for (const vd of document.querySelectorAll('video')) { if (!vd.paused && !vd.ended && !vd.muted && vd.volume > 0.05 && vd.isConnected) return true; } } catch (e) { /* */ }
  return false;
}
