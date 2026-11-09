// English Academy — bloc 1 (leçons 1 à 13, Pré-A1), version premium intégrée au monde du jeu :
// la classe anglaise du Professor Owl, l'héroïne du jeu, une petite vidéo d'histoire par leçon, des bulles qui flottent,
// un train de mots, une vraie scène de dialogue et un tampon par leçon dans le passeport. Aucun micro : tout se fait au toucher.
import * as UI from './ui.js';
import { h } from './ui.js';
import * as S from './save.js';
import * as Sfx from './sfx.js';
import * as Voice from './voice.js';
import { asset } from './asset.js';
import { burst, shuffle } from './workshop.js';
import { LESSONS as BLOCK1 } from './english_lessons.js';

// ---- profil propre à chaque jeu (prénom, sprite, voix) ----
const NAME = () => (S.get().name || 'Soumaya');
const HERO = { idle: 'assets/sprites/soumaya/face.webp', wave: 'assets/sprites/soumaya/salut.webp', joy: 'assets/sprites/soumaya/joie.webp', think: 'assets/sprites/soumaya/reflexion.webp', talk: 'assets/sprites/soumaya/geste_1.webp' };
const INTRO = 'assets/cine/en_intro.webm';
const BG = 'assets/english/classe.webp';
// voix du Professor Owl (voix anglaise enregistrée) ; voix de l'héroïne enregistrée quand elle existe
const OWL = { welcome: 'assets/voice/en/o_welcome.ogg', listen: 'assets/voice/en/o_listen.ogg', hello: 'assets/voice/en/o_hello.ogg', thanks: 'assets/voice/en/o_thanks.ogg', bye: 'assets/voice/en/o_bye.ogg', name: 'assets/voice/en/o_name.ogg', how: 'assets/voice/en/o_how.ogg', nice: 'assets/voice/en/o_nice.ogg', great: 'assets/voice/en/o_great.ogg', again: 'assets/voice/en/o_again.ogg', bravo: 'assets/voice/en/o_bravo.ogg' };
const ME_NAME = 'assets/voice/en/me_name.ogg';
const HAS_ME_NAME = false; // pas encore d'enregistrement de Maissa : voix de l'appareil

// ---- progression (une entrée par leçon : l1 … l13) ----
const ENG = () => { const b = S.get(); b.eng = b.eng || {}; return b.eng; };
const ST = (n) => { const e = ENG(); e['l' + n] = e['l' + n] || { best: 0, done: false, plays: 0 }; return e['l' + n]; };
const isDone = (n) => !!(ENG()['l' + n] && ENG()['l' + n].done);
const unlocked = (n) => n === 1 || isDone(n - 1);

// ---- sons ----
let cur = null;
function stopAll() { try { cur && cur.pause(); } catch (e) { /* */ } cur = null; try { speechSynthesis.cancel(); } catch (e) { /* */ } }
function tts(text, kid = false) {
  text = String(text).replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{20E3}]/gu, '').trim();
  return new Promise((ok) => {
    if (!text || !Sfx.soundOn() || !('speechSynthesis' in window)) { setTimeout(ok, 500 + text.length * 40); return; }
    try {
      speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text);
      const v = speechSynthesis.getVoices().filter((x) => /^en/i.test(x.lang)).sort((a, b) => (/GB/i.test(b.lang) ? 1 : 0) - (/GB/i.test(a.lang) ? 1 : 0))[0];
      u.lang = v ? v.lang : 'en-GB'; if (v) u.voice = v; u.rate = 0.85; u.pitch = kid ? 1.35 : 1;
      let d = false; const fin = () => { if (!d) { d = true; ok(); } }; u.onend = fin; u.onerror = fin; speechSynthesis.speak(u); setTimeout(fin, 2500 + text.length * 90);
    } catch (e) { ok(); }
  });
}
function play(url, fallback) {
  return new Promise((ok) => {
    if (!Sfx.soundOn()) { setTimeout(ok, 700); return; }
    stopAll(); let d = false; const fin = () => { if (!d) { d = true; ok(); } };
    try { const a = new Audio(asset(url)); cur = a; a.onended = fin; a.onerror = () => { if (fallback) tts(fallback).then(fin); else fin(); }; a.play().catch(() => { if (fallback) tts(fallback).then(fin); else fin(); }); setTimeout(fin, 8000); } catch (e) { fin(); }
  });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- leçon 1 (« Hello, I'm … ! »), au même format que le bloc 1 ----
function lesson1(n) {
  return {
    n: 1, title: 'Hello!', sub: 'Se présenter', emo: '👋', video: INTRO,
    welcome: { en: 'Hello there! Welcome to my English class!', fr: 'Bonjour ! Bienvenue dans mon cours d’anglais !', au: OWL.welcome },
    listen: [
      { en: 'Hello!', fr: 'Bonjour', emo: '👋', au: OWL.hello, opts: [['👋', 'Bonjour'], ['🚪', 'Au revoir'], ['🙏', 'Merci']] },
      { en: 'Thank you!', fr: 'Merci', emo: '🙏', au: OWL.thanks, opts: [['🙏', 'Merci'], ['👋', 'Bonjour'], ['🌙', 'Bonne nuit']] },
      { en: 'Goodbye!', fr: 'Au revoir', emo: '🚪', au: OWL.bye, opts: [['🎂', 'Joyeux anniversaire'], ['🚪', 'Au revoir'], ['🙏', 'Merci']] },
    ],
    ident: { q: 'What’s your name?', fr: 'Comment tu t’appelles ?', ok: `My name is ${n}.`, opts: [`My name is ${n}.`, 'I am happy.', 'Goodbye!'], au: OWL.name },
    build: { words: ['My', 'name', 'is', n + '.'], fr: `Je m’appelle ${n}.` },
    dial: [
      { q: 'What’s your name?', fr: 'Comment tu t’appelles ?', ok: `My name is ${n}.`, opts: [`My name is ${n}.`, 'I am happy.', 'Goodbye!'], au: OWL.name },
      { q: 'How are you?', fr: 'Comment vas-tu ?', ok: 'I’m fine, thank you.', opts: [`My name is ${n}.`, 'I’m fine, thank you.', 'Good night!'], au: OWL.how },
      { q: 'Nice to meet you!', fr: 'Enchanté de te rencontrer !', ok: 'Nice to meet you too!', opts: ['I am eight.', `My name is ${n}.`, 'Nice to meet you too!'], au: OWL.nice },
    ],
    done: 'Tu sais dire bonjour, merci et au revoir, te présenter et répondre au Professor Owl.',
  };
}
const allLessons = (n) => [lesson1(n), ...BLOCK1];

export function open(startAt) {
  Voice.stop(); stopAll();
  const n = NAME(); const LS = allLessons(n);
  let stars = 0, run = 0, L = null;
  const scene = h('div', { class: 'lx-scene' });
  const bg = h('img', { class: 'lx-bg', src: asset(BG), alt: 'La classe d’anglais du Professor Owl, à Londres' });
  const board = h('div', { class: 'lx-board' });
  const owlSay = h('div', { class: 'lx-say owl', hidden: true });
  const hero = h('img', { class: 'lx-hero', src: asset(HERO.idle), alt: n });
  const heroSay = h('div', { class: 'lx-say me', hidden: true });
  const starsEl = h('div', { class: 'lx-stars', 'aria-label': 'étoiles gagnées' });
  const owlBtn = h('button', { class: 'lx-owl', type: 'button', 'aria-label': 'Réécouter le Professor Owl' });
  scene.append(bg, board, owlBtn, owlSay, hero, heroSay, starsEl);
  const zone = h('div', { class: 'lx-zone', 'aria-live': 'polite' });
  const tip = h('p', { class: 'lx-tip' });
  const panel = h('div', { class: 'panel lx-panel' }, UI.closeButton(), scene, h('div', { class: 'lx-floor' }, tip, zone));
  UI.openDialog(panel, { label: 'English Academy', onClose: () => { run++; stopAll(); } });

  const drawStars = () => { starsEl.hidden = !L; starsEl.replaceChildren(...[0, 1, 2, 3].map((i) => h('span', { class: 'lx-st' + (i < stars ? ' on' : '') }, '★'))); };
  const pose = (k, ms) => { hero.src = asset(HERO[k] || HERO.idle); if (ms) setTimeout(() => { if (hero.isConnected) hero.src = asset(HERO.idle); }, ms); };
  const sayOwl = (txt, fr) => { owlSay.hidden = false; owlSay.replaceChildren(h('b', null, txt), fr ? h('small', null, fr) : ''); owlSay.classList.remove('pop'); void owlSay.offsetWidth; owlSay.classList.add('pop'); };
  const sayHero = (txt) => { heroSay.hidden = false; heroSay.textContent = txt; heroSay.classList.remove('pop'); void heroSay.offsetWidth; heroSay.classList.add('pop'); };
  const chalk = (t, s) => board.replaceChildren(h('b', null, t), s ? h('small', null, s) : '');
  const win = () => { stars++; drawStars(); Sfx.win(); burst(scene); };
  let lastOwl = null; owlBtn.onclick = () => { if (lastOwl) lastOwl(); };
  const meSay = (t) => ((HAS_ME_NAME && L && L.n === 1 && t.startsWith('My name is')) ? play(ME_NAME, t) : tts(t, true));
  const tryAgain = (b) => { b.classList.add('ko'); Sfx.ko(); play(OWL.again, 'Almost! Try again.'); setTimeout(() => b.classList.remove('ko'), 700); };

  // ---- la carte des leçons (passeport) ----
  function map() {
    run++; L = null; stars = 0; drawStars(); stopAll();
    const doneCount = LS.filter((x) => isDone(x.n)).length;
    chalk('English Academy', `${doneCount} / ${LS.length} leçons réussies`);
    owlSay.hidden = true; heroSay.hidden = true; pose('wave', 2000);
    sayOwl('Choose a lesson!', 'Choisis une leçon !'); lastOwl = () => tts('Choose a lesson!');
    tip.textContent = `🗺️ Le passeport d’anglais de ${n} : chaque leçon réussie ouvre la suivante et donne un tampon.`;
    zone.replaceChildren(h('div', { class: 'lx-map' }, ...LS.map((x) => {
      const ok = isDone(x.n), open = unlocked(x.n), st = ENG()['l' + x.n];
      return h('button', { class: 'lx-card' + (ok ? ' done' : '') + (open ? '' : ' locked'), type: 'button', disabled: !open, 'data-testid': 'lx-lesson', 'data-n': String(x.n), 'aria-label': `Leçon ${x.n} : ${x.title}${open ? '' : ' (verrouillée)'}`, onclick: () => start(x.n) },
        h('span', { class: 'lx-cn' }, String(x.n)), h('span', { class: 'lx-ce' }, open ? x.emo : '🔒'), h('b', null, x.title), h('small', null, x.sub),
        ok ? h('span', { class: 'lx-cs' }, '★'.repeat(st.best || 0)) : '');
    })));
  }

  function start(num) {
    L = LS.find((x) => x.n === num) || LS[0]; stars = 0; drawStars(); intro();
  }

  // ---- 0. histoire d'ouverture (vidéo), puis accueil ----
  async function intro() {
    const me = ++run;
    chalk('Lesson ' + L.n, L.n === 1 ? 'Hello, I’m ' + n + '!' : L.title);
    owlSay.hidden = true; heroSay.hidden = true;
    tip.textContent = '🎬 L’histoire commence…'; zone.replaceChildren();
    const v = h('video', { class: 'lx-cine', src: asset(L.video), playsinline: true, muted: !Sfx.soundOn(), preload: 'auto' });
    v.setAttribute('playsinline', '');
    const skip = h('button', { class: 'lx-skip', type: 'button' }, 'Passer ⏭');
    scene.append(v, skip);
    await new Promise((ok) => { let d = false; const fin = () => { if (!d) { d = true; v.remove(); skip.remove(); ok(); } }; v.onended = fin; v.onerror = fin; skip.onclick = fin; v.play().catch(fin); setTimeout(fin, 15000); });
    if (me !== run) return;
    pose('wave', 2500); sayOwl(L.welcome.en, L.welcome.fr);
    lastOwl = () => play(L.welcome.au, L.welcome.en);
    zone.replaceChildren(h('div', { class: 'lx-mission' }, h('b', null, `${L.emo} Leçon ${L.n} · ${L.title} — ${L.sub}`), h('span', null, `Mission de ${n} : gagner 4 étoiles d’anglais ⭐`), h('span', null, 'Écouter · Comprendre · Construire · Parler')),
      h('button', { class: 'btn primary lx-go', type: 'button', 'data-testid': 'lx-start', onclick: () => listen(0) }, '🚀 Let’s go !'));
    tip.textContent = 'Touche le hibou quand tu veux réécouter.';
    await play(L.welcome.au, L.welcome.en);
  }

  // ---- 1. écoute : les bulles qui flottent ----
  async function listen(round = 0) {
    const me = ++run; const it = L.listen[round];
    chalk(`Listen! ${round + 1}/3`, 'Écoute et attrape la bonne bulle');
    tip.textContent = '🎧 Écoute le Professor Owl, puis touche la bulle qui veut dire la même chose.';
    sayOwl('🔊 …', 'Touche-moi pour réécouter'); lastOwl = () => play(it.au, it.en);
    zone.replaceChildren(h('div', { class: 'lx-bubbles' }, ...shuffle(it.opts.slice()).map(([e, fr], i) => h('button', { class: 'lx-bub', style: `--d:${i * 0.4}s`, type: 'button', 'data-testid': 'lx-bub', 'data-ok': fr === it.fr ? '1' : '0', onclick: async (ev) => {
      const b = ev.currentTarget; if (me !== run) return;
      if (fr !== it.fr) { tryAgain(b); return; }
      run++; b.classList.add('ok'); Sfx.ok(); sayOwl(it.en, '= ' + it.fr); pose('joy', 1500); await play(OWL.great, 'Excellent!');
      if (round < 2) listen(round + 1); else { win(); await wait(600); identify(); }
    } }, h('span', null, e), h('small', null, fr)))));
    await wait(300); if (me === run) { await play(OWL.listen, 'Listen carefully!'); if (me === run) play(it.au, it.en); }
  }

  // ---- 2. comprendre ----
  async function identify() {
    const me = ++run; const q = L.ident;
    chalk(L.n === 1 ? 'Who are you?' : 'Think!', L.n === 1 ? 'Comment te présenter ?' : 'Trouve la bonne réponse');
    sayOwl(q.q, q.fr); lastOwl = () => play(q.au, q.q);
    tip.textContent = '💬 Le Professor Owl te pose une question. Choisis la bonne réponse.';
    pose('think');
    zone.replaceChildren(h('div', { class: 'lx-answers' }, ...shuffle(q.opts.slice()).map((t) => h('button', { class: 'lx-ans', type: 'button', 'data-testid': 'lx-ans', 'data-ok': t === q.ok ? '1' : '0', onclick: async (ev) => {
      if (me !== run) return; const b = ev.currentTarget;
      if (t !== q.ok) { tryAgain(b); return; }
      run++; b.classList.add('ok'); Sfx.ok(); pose('talk'); sayHero(t); await meSay(t); win(); await play(OWL.great, 'Excellent!'); build();
    } }, t))));
    await play(q.au, q.q);
  }

  // ---- 3. construire : le train des mots ----
  function build() {
    const me = ++run; const words = L.build.words; const sentence = words.join(' '); let got = 0;
    chalk('Build it!', 'Accroche les wagons dans l’ordre');
    sayOwl('Build the sentence! 🚂', L.build.fr); lastOwl = () => tts(sentence); heroSay.hidden = true;
    tip.textContent = `🚂 Touche les wagons dans le bon ordre pour écrire « ${L.build.fr} »`;
    pose('idle');
    const train = h('div', { class: 'lx-train', 'data-s': sentence }); const yard = h('div', { class: 'lx-yard' });
    const pool = words.map((w, i) => ({ w, i }));
    const draw = () => {
      train.replaceChildren(h('span', { class: 'lx-loco' }, '🚂'), ...words.slice(0, got).map((w) => h('span', { class: 'lx-wag on' }, w)), ...words.slice(got).map(() => h('span', { class: 'lx-wag' }, '·')));
      yard.replaceChildren(...shuffle(pool.filter((p) => p.i >= got)).map((p) => h('button', { class: 'lx-wag pick', type: 'button', 'data-testid': 'lx-wag', 'data-w': p.w, onclick: async () => {
        if (me !== run) return;
        if (p.w !== words[got]) { Sfx.ko(); tip.textContent = `Presque ! Le mot suivant n’est pas « ${p.w} »… regarde l’ordre.`; return; }
        got++; Sfx.ok(); draw();
        if (got === words.length) { run++; train.classList.add('go'); sayHero(sentence); pose('joy'); await meSay(sentence); win(); await play(OWL.great, 'Excellent!'); dialogue(0, []); }
      } }, p.w)));
    };
    draw(); zone.replaceChildren(train, yard);
  }

  // ---- 4. parler : la scène de dialogue ----
  async function dialogue(i, log) {
    const me = ++run; const d = L.dial[i];
    chalk(`Let’s talk! ${i + 1}/3`, 'Réponds au Professor Owl');
    sayOwl(d.q, d.fr); lastOwl = () => play(d.au, d.q); heroSay.hidden = true; pose('idle');
    tip.textContent = '🎭 Choisis ta réplique, puis dis-la à voix haute avec ' + n + ' !';
    const chat = h('div', { class: 'lx-chat' }, ...log.flatMap(([q, a]) => [h('p', { class: 'lx-l owl' }, '🦉 ' + q), h('p', { class: 'lx-l me' }, a + ' 💬')]), h('p', { class: 'lx-l owl' }, '🦉 ' + d.q));
    zone.replaceChildren(chat, h('div', { class: 'lx-answers' }, ...shuffle(d.opts.slice()).map((t) => h('button', { class: 'lx-ans', type: 'button', 'data-testid': 'lx-ans', 'data-ok': t === d.ok ? '1' : '0', onclick: async (ev) => {
      if (me !== run) return; const b = ev.currentTarget;
      if (t !== d.ok) { tryAgain(b); return; }
      run++; b.classList.add('ok'); Sfx.ok(); pose('talk'); sayHero(t); await meSay(t);
      if (i < 2) dialogue(i + 1, [...log, [d.q, t]]); else { win(); await play(OWL.great, 'Excellent!'); finish(); }
    } }, t))));
    chat.scrollTop = 1e6;
    await play(d.au, d.q);
  }

  // ---- 5. le tampon du passeport ----
  async function finish() {
    run++; const st = ST(L.n); const first = !st.done;
    st.best = Math.max(st.best || 0, stars); st.done = true; st.plays = (st.plays || 0) + 1;
    S.get().bonusStars = (S.get().bonusStars || 0) + (first ? 2 : 1); S.save();
    const next = LS.find((x) => x.n === L.n + 1);
    chalk('Well done!', `Leçon ${L.n} réussie ⭐`);
    pose('joy'); heroSay.hidden = true; sayOwl('Fantastic! Well done! See you soon!', 'Fantastique ! Bravo ! À bientôt !'); lastOwl = () => play(OWL.bravo, 'Fantastic! Well done! See you soon!');
    tip.textContent = '';
    zone.replaceChildren(h('div', { class: 'lx-pass' }, h('div', { class: 'lx-stamp' }, h('span', null, L.emo), h('b', null, 'LESSON ' + L.n), h('small', null, L.title)),
      h('div', null, h('h3', null, `Fantastic, ${n}!`), h('p', null, L.done), h('p', { class: 'lx-score' }, `⭐ ${stars} / 4 étoiles · meilleur : ${st.best} / 4`))),
      h('div', { class: 'actions wrap' },
        next ? h('button', { class: 'btn primary', type: 'button', 'data-testid': 'lx-next', onclick: () => start(next.n) }, `▶ Leçon ${next.n} : ${next.title}`) : '',
        h('button', { class: 'btn', type: 'button', 'data-testid': 'lx-replay', onclick: () => { stars = 0; drawStars(); listen(0); } }, '🔁 Rejouer'),
        h('button', { class: 'btn', type: 'button', 'data-testid': 'lx-map', onclick: map }, '🗺️ Toutes les leçons')));
    Sfx.win(); burst(scene); setTimeout(() => burst(scene), 700);
    await play(OWL.bravo, 'Fantastic! Well done! See you soon!');
  }

  if (typeof startAt === 'number' && unlocked(startAt)) start(startAt); else map();
}
