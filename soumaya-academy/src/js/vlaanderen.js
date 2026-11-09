// Néerlandais de Belgique : missions en Flandre, mots belges avec répétition espacée, étoiles/badges et bilan pour Papa.
// Les voix sont des enregistrements (Soumaya, vendeuse/guide, serveur/entraîneur, Papa) : aucune analyse de la prononciation n'est faite.
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { asset } from './asset.js';
import { burst, shuffle } from './workshop.js';
import { VB, MISSIONS } from './vlaanderen_data.js';

const DAY = 86400000;
const today = () => Math.floor(Date.now() / DAY);
const BOX_GAP = [0, 1, 2, 4, 8, 16]; // jours avant de revoir un mot, selon sa boîte (répétition espacée)
const WORDS = Object.entries(VB).flatMap(([t, [, list]]) => list.map(([id, nl, fr, emo]) => ({ id, nl, fr, emo, t })));
const byId = Object.fromEntries(WORDS.map((w) => [w.id, w]));

export const NV = () => { const b = S.get(); b.nlv = b.nlv || { stars: 0, badges: [], miss: {}, srs: {}, log: [] }; return b.nlv; };
function addStars(n, why) { const v = NV(); v.stars += n; const b = S.get(); b.bonusStars = (b.bonusStars || 0) + n; b.coins += 2 * n; S.save(); return why; }
function logSession(type, data) { const v = NV(); v.log.push({ d: Date.now(), type, ...data }); if (v.log.length > 60) v.log.splice(0, v.log.length - 60); S.save(); }
function badge(id, label) { const v = NV(); if (v.badges.some((b) => b.id === id)) return false; v.badges.push({ id, label, d: Date.now() }); S.save(); return true; }
// toutes les 10 étoiles : un badge « Petite Flamande » de plus
function starBadges() { const v = NV(); const n = Math.floor(v.stars / 10); let got = null; for (let k = 1; k <= n; k++) { if (badge('stars' + k, `⭐ ${k * 10} étoiles`)) got = `⭐ ${k * 10} étoiles`; } return got; }

let cur = null;
function stopAudio() { if (cur) { try { cur.pause(); } catch (e) { /* */ } cur = null; } Voice.stop(); }
function play(path) {
  return new Promise((ok) => {
    let done = false; const fin = () => { if (!done) { done = true; ok(); } };
    if (!Sfx.soundOn()) { setTimeout(fin, 900); return; }
    stopAudio(); const a = new Audio(asset(path)); cur = a; a.onended = fin; a.onerror = fin; const p = a.play(); if (p && p.catch) p.catch(fin); setTimeout(fin, 12000);
  });
}
const wordAudio = (id) => `assets/voice/nl/v/${id}.ogg`;
const lineAudio = (m, i) => `assets/voice/nl/m/${m}_${i}.ogg`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const WHO = { V: (m) => m.who, S: () => 'Soumaya' };
const ICON = { V: (m) => (m.voice === 'papa' ? '👨' : m.voice === 'bram' ? '🧑' : '👩'), S: () => '🧒' };

// ---------------------------------------------------------------- missions en Flandre
export function missions(body, talk) {
  stopAudio(); const v = NV();
  const card = (m) => { const st = v.miss[m.id]; return h('button', { class: 'vl-mcard' + (st && st.done ? ' done' : ''), type: 'button', 'data-testid': 'vl-m-' + m.id, onclick: () => mission(body, talk, m) },
    h('img', { src: asset(`assets/nl/m_${m.id}.webp`), alt: '', loading: 'lazy' }), h('b', null, m.title), h('small', null, st && st.done ? `✔ réussie${st.best === 3 ? ' — ⭐⭐⭐' : ''}` : m.city)); };
  body.replaceChildren(h('p', { class: 'prompt' }, '🗺️ Voyage en Flandre ! Choisis une mission. Écoute, répète, réponds… et gagne des étoiles.'), h('div', { class: 'vl-mgrid' }, ...MISSIONS.map(card)));
  talk('Choisis une mission en Flandre : Gand, Anvers, Bruges, Louvain… ou à la maison avec Papa !', false);
}

function mission(body, talk, m) {
  stopAudio(); let run = 0, fr = true, score = 0;
  const chat = h('div', { class: 'hk-chat vl-chat' }), zone = h('div', { class: 'vl-zone' });
  const bubble = (i) => { const [w, nl, f] = m.lines[i]; return h('div', { class: 'hk-b ' + (w === 'S' ? 's' : 'p') }, h('span', { class: 'hk-who' }, `${ICON[w](m)} ${WHO[w](m)}`), h('b', { class: 'hk-nl' }, nl), h('small', { class: 'hk-fr' }, f), h('button', { class: 'hk-play', type: 'button', 'aria-label': 'écouter', onclick: () => play(lineAudio(m.id, i)) }, '🔊')); };
  const tFr = h('button', { class: 'btn small', type: 'button', onclick: () => { fr = !fr; chat.classList.toggle('nofr', !fr); tFr.textContent = fr ? '🇫🇷 Cacher la traduction' : '🇫🇷 Montrer la traduction'; } }, '🇫🇷 Cacher la traduction');
  const back = h('button', { class: 'btn small', type: 'button', onclick: () => { run++; missions(body, talk); } }, '◀ Toutes les missions');
  body.replaceChildren(h('div', { class: 'vl-scene' }, h('img', { src: asset(`assets/nl/m_${m.id}.webp`), alt: m.city }), h('b', null, m.title)), h('div', { class: 'actions wrap' }, back, tFr), chat, zone);

  // 1) le dialogue
  const dialog = async () => {
    const me = ++run; chat.replaceChildren(); zone.replaceChildren(h('p', { class: 'muted' }, '🎧 Écoute le dialogue…'));
    for (let i = 0; i < m.lines.length; i++) { if (me !== run || !chat.isConnected) return; const b = bubble(i); chat.append(b); b.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); await play(lineAudio(m.id, i)); await wait(350); }
    if (me === run) step2();
  };
  // 2) le défi oral : répéter la réplique de Soumaya (aucune note de prononciation : on ne l'entend pas)
  const step2 = () => {
    const i = m.say, [, nl, f] = m.lines[i];
    zone.replaceChildren(h('div', { class: 'ea-step' }, h('p', null, h('b', null, '🎤 Défi oral'), ' — Écoute Soumaya, puis dis la phrase à voix haute, comme elle :'), h('p', { class: 'vl-big' }, nl), h('p', { class: 'muted' }, f)),
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn', type: 'button', onclick: () => play(lineAudio(m.id, i)) }, '🔊 Écouter Soumaya'),
        h('button', { class: 'btn primary', type: 'button', 'data-testid': 'vl-said', onclick: () => { score++; Sfx.ok(); step3(); } }, '✔ Je l’ai dit à voix haute')));
    talk('Défi oral ! Écoute Soumaya, puis répète la phrase à voix haute.', false); play(lineAudio(m.id, i));
  };
  // 3) compréhension
  const step3 = () => {
    const [q, opts] = m.q;
    zone.replaceChildren(h('p', { class: 'tb-q' }, '❓ ' + q), h('div', { class: 'actions wrap' }, ...shuffle(opts.map((o, k) => [o, k])).map(([o, k]) => h('button', { class: 'btn', type: 'button', 'data-testid': k === 0 ? 'vl-q-ok' : 'vl-q-ko', onclick: () => {
      zone.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      if (k === 0) { score++; Sfx.ok(); talk('Juist ! Goed zo !', false); } else { Sfx.ko(); talk(`Non, c’était : ${opts[0]}.`, false); }
      setTimeout(step4, 1300);
    } }, o))));
  };
  // 4) les 5 mots de la mission, puis le bilan de la mission
  const step4 = () => {
    const ws = m.words.map((id) => byId[id]); let heard = 0;
    const grid = h('div', { class: 'nl-grid' }, ...ws.map((w) => { const c = h('button', { class: 'nl-card', type: 'button', 'data-testid': 'vl-w-' + w.id, onclick: () => { play(wordAudio(w.id)); if (!c.classList.contains('seen')) { c.classList.add('seen'); heard++; seen(w.id); if (heard === ws.length) fin(); } } }, h('span', { class: 'nl-emo' }, w.emo), h('b', null, w.nl), h('small', null, w.fr), h('i', { class: 'nl-play' }, '🔊')); return c; }));
    zone.replaceChildren(h('p', { class: 'prompt' }, '📚 Les mots de la mission : touche chaque carte et répète.'), grid);
  };
  const fin = () => {
    score++; const v = NV(), st = v.miss[m.id] || { done: false, best: 0, n: 0 }; const first = !st.done; st.done = true; st.n++; st.best = Math.max(st.best, score); v.miss[m.id] = st; S.save();
    addStars(score); const gotCity = badge('city_' + m.id, `${m.emoji} Badge ${m.city}`); const gotStars = starBadges();
    if (MISSIONS.every((x) => v.miss[x.id] && v.miss[x.id].done)) badge('flandre', '🦁 Exploratrice de Flandre');
    logSession('mission', { id: m.id, score, words: m.words });
    Sfx.win(); burst(body);
    zone.append(h('div', { class: 'ea-step vl-end' }, h('p', null, h('b', null, `🎉 Mission réussie ! +${score} ⭐`)), gotCity ? h('p', null, `Nouveau badge : ${m.emoji} Badge ${m.city} !`) : null, gotStars ? h('p', null, `Nouveau badge : ${gotStars} !`) : null,
      h('div', { class: 'actions wrap' }, h('button', { class: 'btn', type: 'button', onclick: () => mission(body, talk, m) }, '🔁 Rejouer'), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'vl-next', onclick: () => missions(body, talk) }, '🗺️ Mission suivante'))));
    const endEl = zone.querySelector('.vl-end'); if (endEl) setTimeout(() => endEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    talk(first ? `Bravo ! Tu as réussi la mission ${m.city} ! Goed zo !` : 'Encore bravo ! Goed zo !', false);
  };
  dialog();
}

// ---------------------------------------------------------------- mots belges (répétition espacée)
function seen(id) { const v = NV(); if (!v.srs[id]) { v.srs[id] = { box: 0, due: today(), ok: 0, ko: 0 }; S.save(); } }
function grade(id, good) {
  const v = NV(), s = v.srs[id] || { box: 0, due: today(), ok: 0, ko: 0 };
  if (good) { s.ok++; s.box = Math.min(5, s.box + 1); } else { s.ko++; s.box = 0; }
  s.due = today() + BOX_GAP[s.box]; s.last = Date.now(); v.srs[id] = s; S.save();
}
// séance : d'abord les mots à revoir aujourd'hui (les moins sûrs d'abord), puis 3 nouveaux mots au maximum
function pickSession(n = 8) {
  const v = NV(), t = today();
  const due = WORDS.filter((w) => v.srs[w.id] && v.srs[w.id].due <= t).sort((a, b) => v.srs[a.id].box - v.srs[b.id].box);
  const fresh = WORDS.filter((w) => !v.srs[w.id]).slice(0, Math.max(3, n - due.length));
  return [...due.slice(0, n - Math.min(3, fresh.length)), ...fresh].slice(0, n);
}
export function mots(body, talk) {
  stopAudio(); const v = NV();
  const known = WORDS.filter((w) => v.srs[w.id] && v.srs[w.id].box >= 2).length, toDo = WORDS.filter((w) => v.srs[w.id] && v.srs[w.id].due <= today()).length;
  const themes = h('div', { class: 'actions wrap' }, ...Object.entries(VB).map(([k, [label]]) => h('button', { class: 'btn small', type: 'button', onclick: () => theme(body, talk, k) }, label)));
  body.replaceChildren(h('p', { class: 'prompt' }, '🧠 Les mots de Belgique. Les mots que tu rates reviennent plus souvent ; ceux que tu connais reviennent plus tard.'),
    h('p', { class: 'muted' }, `✔ ${known}/${WORDS.length} mots bien connus · 🔁 ${toDo} à revoir aujourd’hui`),
    h('button', { class: 'btn primary', type: 'button', 'data-testid': 'vl-srs', onclick: () => session(body, talk) }, '▶️ Ma séance de mots (8 mots)'), h('p', { class: 'muted' }, 'Ou écoute un thème :'), themes);
  talk('Clique sur Ma séance de mots ! Les mots ratés reviendront plus souvent.', false);
}
function theme(body, talk, k) {
  const [label, list] = VB[k];
  body.replaceChildren(h('div', { class: 'actions wrap' }, h('button', { class: 'btn small', type: 'button', onclick: () => mots(body, talk) }, '◀ Retour'), h('b', null, label)),
    h('p', { class: 'muted' }, '💡 « de » et « het » veulent dire « le / la ». Apprends le mot avec son petit mot devant !'),
    h('div', { class: 'nl-grid' }, ...list.map(([id, nl, fr, emo]) => { const c = h('button', { class: 'nl-card', type: 'button', onclick: () => { play(wordAudio(id)); c.classList.add('seen'); seen(id); } }, h('span', { class: 'nl-emo' }, emo), h('b', null, nl), h('small', null, fr), h('i', { class: 'nl-play' }, '🔊')); return c; })));
}
function session(body, talk) {
  const L = pickSession(); let n = 0, ok = 0; const miss = [];
  const zone = h('div'), sc = h('p', { class: 'muted' });
  const next = () => {
    if (n >= L.length) {
      addStars(ok >= 6 ? 2 : 1); const gs = starBadges(); logSession('mots', { score: ok, total: L.length, words: L.map((w) => w.id), miss });
      if (ok >= 6) { Sfx.win(); burst(body); }
      zone.replaceChildren(h('p', { class: 'tb-res' }, `Goed zo ! ${ok}/${L.length}`), gs ? h('p', null, `Nouveau badge : ${gs} !`) : null, miss.length ? h('p', { class: 'muted' }, '🔁 Ces mots reviendront bientôt : ' + miss.map((id) => byId[id].nl).join(', ')) : h('p', { class: 'muted' }, 'Aucune erreur, bravo !'),
        h('button', { class: 'btn primary', type: 'button', onclick: () => mots(body, talk) }, 'Terminer'));
      return;
    }
    const w = L[n++], isNew = !NV().srs[w.id]; seen(w.id);
    const opts = shuffle([w, ...shuffle(WORDS.filter((x) => x.id !== w.id)).slice(0, 2)]);
    const quiz = () => { zone.replaceChildren(h('p', { class: 'tb-q' }, '🎧 Que veut dire ce mot ?'), h('button', { class: 'btn', type: 'button', onclick: () => play(wordAudio(w.id)) }, '🔊 Réécouter'),
      h('div', { class: 'nl-grid quiz' }, ...opts.map((o) => h('button', { class: 'nl-card', type: 'button', 'data-testid': o.id === w.id ? 'vl-s-ok' : 'vl-s-ko', onclick: () => {
        zone.querySelectorAll('.nl-card').forEach((b) => { b.disabled = true; }); const good = o.id === w.id; grade(w.id, good);
        if (good) { ok++; Sfx.ok(); talk(`Oui ! « ${w.nl} » = « ${w.fr} ».`, false); } else { miss.push(w.id); Sfx.ko(); talk(`Non : « ${w.nl} » veut dire « ${w.fr} ».`, false); }
        sc.textContent = `${n}/${L.length} · ✔ ${ok}`; setTimeout(next, 1500);
      } }, h('span', { class: 'nl-emo' }, o.emo), h('small', null, o.fr))))); play(wordAudio(w.id)); };
    if (isNew) { // nouveau mot : on le présente d'abord
      zone.replaceChildren(h('p', { class: 'tb-q' }, '✨ Nouveau mot'), h('div', { class: 'nl-card vl-new' }, h('span', { class: 'nl-emo' }, w.emo), h('b', null, w.nl), h('small', null, w.fr)),
        h('div', { class: 'actions wrap' }, h('button', { class: 'btn', type: 'button', onclick: () => play(wordAudio(w.id)) }, '🔊 Écouter'), h('button', { class: 'btn primary', type: 'button', 'data-testid': 'vl-new-ok', onclick: quiz }, '✔ Je l’ai répété')));
      play(wordAudio(w.id)); talk(`Nouveau mot : ${w.nl}, ça veut dire ${w.fr}. Répète-le à voix haute !`, false);
    } else quiz();
  };
  body.replaceChildren(h('p', { class: 'prompt' }, '🧠 Écoute Soumaya et trouve le sens du mot.'), zone, sc);
  next();
}

// ---------------------------------------------------------------- bilan pour Papa (en français, court)
export function bilan(body, talk) {
  stopAudio(); const v = NV();
  const srs = Object.entries(v.srs), known = srs.filter(([, s]) => s.box >= 2).map(([id]) => byId[id]).filter(Boolean);
  const weak = srs.filter(([, s]) => s.ko > 0 && s.box < 2).sort((a, b) => b[1].ko - a[1].ko).slice(0, 6).map(([id]) => byId[id]).filter(Boolean);
  const done = MISSIONS.filter((m) => v.miss[m.id] && v.miss[m.id].done);
  const last = v.log.slice(-1)[0];
  const lvl = known.length >= 40 && done.length >= 4 ? 'A1 (repère, pas une certification)' : known.length >= 12 || done.length >= 2 ? 'entre pré-A1 et A1 (repère)' : 'pré-A1 (débutante, repère)';
  const nextMission = MISSIONS.find((m) => !(v.miss[m.id] && v.miss[m.id].done));
  const conseil = weak.length >= 3 ? 'une séance de mots (les mots ratés vont revenir)' : nextMission ? `la mission « ${nextMission.title} »` : 'une séance de mots pour garder les acquis';
  const row = (k, val) => h('p', null, h('b', null, k + ' : '), val);
  body.replaceChildren(h('div', { class: 'ea-step vl-bilan' },
    h('p', null, h('b', null, '📋 Bilan pour Papa')),
    row('Dernière séance', last ? `${new Date(last.d).toLocaleDateString('fr-BE')} — ${last.type === 'mission' ? 'mission ' + (MISSIONS.find((m) => m.id === last.id) || {}).city : 'séance de mots'} (${last.score}${last.total ? '/' + last.total : ' ⭐'})` : 'aucune pour l’instant'),
    row('Mots bien connus', known.length ? `${known.length}/${WORDS.length} — ${known.slice(-6).map((w) => w.nl).join(', ')}` : 'pas encore'),
    row('Missions réussies', done.length ? `${done.length}/${MISSIONS.length} — ${done.map((m) => m.city).join(', ')}` : 'aucune'),
    row('Erreurs qui reviennent', weak.length ? weak.map((w) => `${w.nl} (${w.fr})`).join(', ') : 'aucune pour l’instant'),
    row('Prochaine séance conseillée', conseil),
    row('Niveau approximatif', lvl),
    row('Étoiles et badges', `${v.stars} ⭐ · ${v.badges.length ? v.badges.map((b) => b.label).join(' · ') : 'pas encore de badge'}`),
    h('p', { class: 'muted' }, 'La prononciation n’est pas évaluée par le jeu : écoutez Soumaya répéter à voix haute.')));
  talk('Voici le bilan pour Papa.', false);
}
