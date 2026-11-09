// Sons du jeu, entièrement synthétisés (aucun fichier audio) : effets (réussite, erreur, pas, pièces, niveau)
// et petite musique d'ambiance douce (accords + clochettes pentatoniques). Réglages : settings.sound / settings.music.
import * as S from './save.js';

let ctx = null, noiseBuf = null, amb = null;
const on = () => S.get().settings.sound !== false;
const musicOn = () => S.get().settings.music !== false && on();
function audio() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch (e) { return null; }
}
function note(a, f, t0, dur, { type = 'sine', gain = 0.1, to = null, dest = null, att = 0.01 } = {}) {
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0); if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + att); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(dest || bus(a)); o.start(t0); o.stop(t0 + dur + 0.05);
}
// boucle sans « clic » : la fin du tampon est fondue dans son début (sinon saut de signal à chaque tour)
function seamless(buf) {
  const N = Math.floor(buf.sampleRate * 0.12);
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const d = buf.getChannelData(ch), L = d.length; if (L < 3 * N) continue;
    const head = d.slice(0, N), body = d.slice(N);
    for (let i = 0; i < N; i++) { const w = i / N, k = body.length - N + i; body[k] = body[k] * (1 - w) + head[i] * w; }
    d.set(body, 0); d.fill(0, body.length);
  }
  return (buf.length - N) / buf.sampleRate; // fin de boucle (en secondes)
}
// bus de sortie commun avec limiteur doux : quand plusieurs sons se superposent, plus de saturation (craquements)
let busNode = null;
function bus(a) {
  if (busNode && busNode.context === a) return busNode;
  try { const c = a.createDynamicsCompressor(); c.threshold.value = -12; c.knee.value = 8; c.ratio.value = 12; c.attack.value = 0.003; c.release.value = 0.25; const g = a.createGain(); g.gain.value = 0.9; c.connect(g); g.connect(a.destination); busNode = c; } catch (e) { busNode = a.destination; }
  return busNode;
}
const hz = (root, semis) => root * Math.pow(2, semis / 12);

export function ok() {
  if (!on()) return; const a = audio(); if (!a) return; const t = a.currentTime;
  note(a, 784, t, 0.35, { gain: 0.11 }); note(a, 1175, t + 0.11, 0.5, { gain: 0.1 }); note(a, 1568, t + 0.11, 0.4, { gain: 0.04 });
}
export function ko() {
  if (!on()) return; const a = audio(); if (!a) return; const t = a.currentTime;
  note(a, 330, t, 0.3, { type: 'triangle', gain: 0.1, to: 262 }); note(a, 247, t + 0.16, 0.4, { type: 'triangle', gain: 0.08, to: 220 });
}
export function win() {
  if (!on()) return; const a = audio(); if (!a) return; const t = a.currentTime;
  [523, 659, 784, 1047, 1319].forEach((f, i) => note(a, f, t + i * 0.1, 0.7, { gain: 0.1 - i * 0.008 }));
  note(a, 262, t, 1.2, { type: 'triangle', gain: 0.07 });
}
export function levelup() { win(); }
export function coin() {
  if (!on()) return; const a = audio(); if (!a) return; const t = a.currentTime;
  note(a, 1319, t, 0.18, { gain: 0.09 }); note(a, 1760, t + 0.07, 0.3, { gain: 0.09 });
}
export function tap() {
  if (!on()) return; const a = audio(); if (!a) return;
  note(a, 620, a.currentTime, 0.06, { gain: 0.05, to: 480 });
}
// pas de Maissa : petit bruit filtré
export function step() {
  if (!on()) return; const a = audio(); if (!a) return; const t = a.currentTime;
  // pas feutré : petit « toc » grave avec fondu (l'ancien bruit blanc sans fondu faisait des grésillements)
  const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
  o.type = 'sine'; o.frequency.setValueAtTime(150 + Math.random() * 30, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.09);
  f.type = 'lowpass'; f.frequency.value = 500;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.035, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
  o.connect(f); f.connect(g); g.connect(bus(a)); o.start(t); o.stop(t + 0.13);
}

// petit rire de Maissa : quatre gazouillis qui montent
export function laugh() {
  if (!on()) return; const a = audio(); if (!a) return; const t = a.currentTime;
  [0, 0.11, 0.22, 0.33].forEach((d, i) => { const f = 560 + i * 20 + Math.random() * 40; note(a, f, t + d, 0.09, { gain: 0.06, to: f * 1.3 }); note(a, f * 1.5, t + d + 0.02, 0.07, { gain: 0.025, to: f * 1.9 }); });
}

// bulles du chaudron
export function bloop() {
  if (!on()) return; const a = audio(); if (!a) return; const t = a.currentTime, f = 300 + Math.random() * 300;
  note(a, f, t, 0.14, { gain: 0.07, to: f * 1.8 }); note(a, f * 1.5, t + 0.09, 0.12, { gain: 0.04, to: f * 2.4 });
}

// ---------- musique d'ambiance ----------
const CHORDS = [[0, 4, 7, 11], [-3, 0, 4, 7], [-7, -3, 0, 4], [-5, -1, 2, 4]]; // Do maj7, La m7, Fa maj7, Sol 6
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
export function ambient(shift = 0) {
  if (!musicOn()) { stopAmbient(); return; }
  const a = audio(); if (!a) return;
  if (amb) { amb.root = 130.81 * Math.pow(2, shift / 12); return; }
  const master = a.createGain(), lp = a.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 1500; master.gain.setValueAtTime(0.0001, a.currentTime); master.gain.linearRampToValueAtTime(0.5, a.currentTime + 3);
  lp.connect(master); master.connect(bus(a));
  amb = { master, lp, root: 130.81 * Math.pow(2, shift / 12), chord: 0, timers: [] };
  const pad = () => {
    if (!amb) return; const t = a.currentTime, c = CHORDS[amb.chord++ % CHORDS.length];
    c.forEach((n) => [0, 5].forEach((cents) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'triangle'; o.frequency.value = hz(amb.root * 2, n); o.detune.value = cents;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.016, t + 2.2); g.gain.linearRampToValueAtTime(0.0001, t + 7.5);
      o.connect(g); g.connect(lp); o.start(t); o.stop(t + 7.6);
    }));
    amb.timers.push(setTimeout(pad, 6800));
  };
  const bell = () => {
    if (!amb) return; const t = a.currentTime;
    const n = PENTA[Math.floor(Math.random() * PENTA.length)];
    note(a, hz(amb.root * 4, n), t, 1.8, { gain: 0.035, dest: lp }); note(a, hz(amb.root * 8, n), t, 0.9, { gain: 0.008, dest: lp });
    amb.timers.push(setTimeout(bell, 1800 + Math.random() * 2600));
  };
  pad(); amb.timers.push(setTimeout(bell, 2500));
}
export function stopAmbient() {
  if (!amb) return; const a = ctx, m = amb; amb = null; m.timers.forEach(clearTimeout);
  try { const gg = m.master.gain, t = a.currentTime; gg.cancelScheduledValues(t); gg.setValueAtTime(gg.value, t); gg.linearRampToValueAtTime(0.0001, t + 0.6); setTimeout(() => m.master.disconnect(), 800); } catch (e) { /* ignoré */ }
}
// Les navigateurs exigent un geste avant tout son : on démarre à la première interaction, et on coupe en arrière-plan.
let armed = false;
export function arm(getShift) {
  if (armed) return; armed = true;
  const go = () => { ambient(getShift()); };
  window.addEventListener('pointerdown', go, { once: true, capture: true });
  window.addEventListener('keydown', go, { once: true, capture: true });
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (amb) ctx.resume(); });
}

export function soundOn() { return on(); }

// bruit de chute d'eau (cascade) : bruit filtré en boucle, très doux ; renvoie une fonction d'arrêt
export function water(vol = 0.09, big = false) {
  if (!on()) return () => {};
  const a = audio(); if (!a) return () => {};
  const len = a.sampleRate * 3, buf = a.createBuffer(2, len, a.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.06 * w) / 1.06; d[i] = last * 3.2 + w * 0.18; } }
  const loopEnd = seamless(buf);
  const src = a.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = 0; src.loopEnd = loopEnd;
  const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 180;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
  const g = a.createGain(); g.gain.setValueAtTime(0.0001, a.currentTime); g.gain.linearRampToValueAtTime(vol, a.currentTime + 2.5);
  const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 0.13; lg.gain.value = vol * 0.25; lfo.connect(lg); lg.connect(g.gain);
  src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(bus(a)); src.start(); lfo.start();
  let src2 = null;
  if (big) {
    // grande chute : grondement grave + éclaboussures aiguës, décalés pour un son plus vivant
    src2 = a.createBufferSource(); src2.buffer = buf; src2.loop = true; src2.loopStart = 0; src2.loopEnd = loopEnd; src2.playbackRate.value = 0.55;
    const bp = a.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 420;
    const g2 = a.createGain(); g2.gain.value = 1.4; src2.connect(bp); bp.connect(g2); g2.connect(g);
    const hi = a.createBiquadFilter(); hi.type = 'bandpass'; hi.frequency.value = 5200; hi.Q.value = 0.7;
    const g3 = a.createGain(); g3.gain.value = 0.35; src.connect(hi); hi.connect(g3); g3.connect(g);
    src2.start(a.currentTime, 1.3);
  }
  let stopped = false;
  return () => { if (stopped) return; stopped = true; try { g.gain.cancelScheduledValues(a.currentTime); g.gain.setValueAtTime(g.gain.value, a.currentTime); g.gain.linearRampToValueAtTime(0.0001, a.currentTime + 0.8); setTimeout(() => { try { src.stop(); lfo.stop(); if (src2) src2.stop(); g.disconnect(); } catch (e) { /* ignoré */ } }, 900); } catch (e) { /* ignoré */ } };
}

// tic-tac très discret de la grande horloge (alterné tic / tac)
export function tick(alt = 0) {
  if (!on()) return; const a = audio(); if (!a) return; const t = a.currentTime;
  const len = Math.floor(a.sampleRate * 0.03), b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = alt ? 2400 : 3200; f.Q.value = 6; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.03, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  s.connect(f); f.connect(g); g.connect(bus(a)); s.start(t);
}
// petit carillon discret (4 notes) aux heures pleines
export function chime() {
  if (!on()) return; const a = audio(); if (!a) return; const t = a.currentTime;
  [[659.3, 0], [523.3, 0.55], [587.3, 1.1], [392, 1.65]].forEach(([f, d]) => { note(a, f, t + d, 2.2, { gain: 0.05 }); note(a, f * 2.01, t + d, 1.2, { gain: 0.012 }); });
}

// ---------- ambiance sous-marine (Cité sous l'Océan) : houle étouffée, bulles et chant lointain de baleine ----------
let sea = null;
export function oceanFx(on) {
  if (!on || !musicOn()) { if (sea) { const s = sea; sea = null; s.timers.forEach(clearTimeout); try { const gg = s.master.gain, t = s.a.currentTime; gg.cancelScheduledValues(t); gg.setValueAtTime(gg.value, t); gg.linearRampToValueAtTime(0.0001, t + 1.2); setTimeout(() => { try { s.src.stop(); } catch (e) { /* */ } }, 1400); } catch (e) { /* */ } } return; }
  const a = audio(); if (!a || sea) return;
  const master = a.createGain(); master.gain.setValueAtTime(0.0001, a.currentTime); master.gain.linearRampToValueAtTime(0.9, a.currentTime + 3); master.connect(bus(a));
  // houle : bruit brun filtré, qui respire lentement
  const len = a.sampleRate * 4, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0); let last = 0;
  for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
  const loopEnd = seamless(buf);
  const src = a.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = 0; src.loopEnd = loopEnd;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.7;
  const swell = a.createGain(); swell.gain.value = 0.10;
  const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 0.09; lg.gain.value = 0.06; lfo.connect(lg); lg.connect(swell.gain); lfo.start();
  src.connect(lp); lp.connect(swell); swell.connect(master); src.start();
  sea = { a, master, src, timers: [] };
  const bubble = () => {
    if (!sea) return; const t = a.currentTime, n = 1 + Math.floor(Math.random() * 4);
    for (let k = 0; k < n; k++) {
      const o = a.createOscillator(), g = a.createGain(), t0 = t + k * (0.06 + Math.random() * 0.1), f = 380 + Math.random() * 700;
      o.type = 'sine'; o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 2.4, t0 + 0.09);
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.035, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
      o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 0.13);
    }
    sea.timers.push(setTimeout(bubble, 900 + Math.random() * 2600));
  };
  const whale = () => {
    if (!sea) return; const t = a.currentTime, base = 140 + Math.random() * 60, dur = 3.5 + Math.random() * 2;
    const g = a.createGain(), f2 = a.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.8); g.gain.linearRampToValueAtTime(0.03, t + dur - 1); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    [1, 2.01, 3.02].forEach((m, i) => {
      const o = a.createOscillator(), og = a.createGain(), vib = a.createOscillator(), vg = a.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(base * m, t); o.frequency.linearRampToValueAtTime(base * m * 1.9, t + dur * 0.55); o.frequency.linearRampToValueAtTime(base * m * 1.25, t + dur);
      vib.frequency.value = 5.5; vg.gain.value = 3 * m; vib.connect(vg); vg.connect(o.frequency); vib.start(t); vib.stop(t + dur);
      og.gain.value = [1, 0.35, 0.12][i]; o.connect(og); og.connect(f2); o.start(t); o.stop(t + dur + 0.05);
    });
    // écho lointain
    const dl = a.createDelay(2); dl.delayTime.value = 0.65; const fb = a.createGain(); fb.gain.value = 0.38;
    f2.connect(g); f2.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(g); g.connect(master);
    sea.timers.push(setTimeout(whale, 16000 + Math.random() * 14000));
  };
  sea.timers.push(setTimeout(bubble, 1200), setTimeout(whale, 5000));
}

// un chant de baleine isolé (après la cinématique de la baleine), même quand la musique est coupée mais pas le son
export function whaleCall() {
  if (!on()) return; const a = audio(); if (!a) return;
  const out = a.createGain(); out.gain.value = 0.9; out.connect(bus(a));
  [[0, 150, 4.2], [3.6, 185, 3.6]].forEach(([d, base, dur]) => {
    const t = a.currentTime + d, g = a.createGain(), f2 = a.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 950;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.09, t + 0.7); g.gain.linearRampToValueAtTime(0.05, t + dur - 0.9); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    [1, 2.01, 3.02].forEach((m, i) => {
      const o = a.createOscillator(), og = a.createGain(), vib = a.createOscillator(), vg = a.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(base * m, t); o.frequency.linearRampToValueAtTime(base * m * 1.9, t + dur * 0.55); o.frequency.linearRampToValueAtTime(base * m * 1.25, t + dur);
      vib.frequency.value = 5.5; vg.gain.value = 3 * m; vib.connect(vg); vg.connect(o.frequency); vib.start(t); vib.stop(t + dur);
      og.gain.value = [1, 0.35, 0.12][i]; o.connect(og); og.connect(f2); o.start(t); o.stop(t + dur + 0.05);
    });
    const dl = a.createDelay(2); dl.delayTime.value = 0.6; const fb = a.createGain(); fb.gain.value = 0.35;
    f2.connect(g); f2.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(g); g.connect(out);
  });
}
