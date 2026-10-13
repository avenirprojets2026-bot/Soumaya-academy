import { getSave } from '../store/save';

let ctx: AudioContext | null = null;
function ac() { if (!ctx) { try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; } } if (ctx.state === 'suspended') void ctx.resume(); return ctx; }
function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12) {
  try { toneUnsafe(freq, start, dur, type, vol); } catch { /* audio indisponible : le jeu continue sans son */ }
}
function toneUnsafe(freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  const c = ac(); if (!c) return; const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination); o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
}
export const sfx = {
  click() { if (getSave().settings.sound) tone(660, 0, 0.08, 'triangle', 0.08); },
  good() { if (getSave().settings.sound) [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.2, 'triangle')); },
  oops() { if (getSave().settings.sound) { tone(300, 0, 0.18, 'sine', 0.09); tone(250, 0.12, 0.25, 'sine', 0.07); } },
  win() { if (getSave().settings.sound) [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.13)); },
  star() { if (getSave().settings.sound) tone(1175, 0, 0.35, 'sine', 0.1); },
};
let musicTimer: number | undefined;
export function setMusic(on: boolean) {
  window.clearInterval(musicTimer); musicTimer = undefined;
  if (!on) return;
  const scale = [262, 294, 330, 392, 440, 523]; let i = 0;
  musicTimer = window.setInterval(() => { if (!getSave().settings.music) return; i = (i + [1, 2, -1, 3, -2][Math.floor(Math.random() * 5)] + scale.length) % scale.length; tone(scale[i], 0, 1.6, 'sine', 0.035); if (i % 3 === 0) tone(scale[i] / 2, 0, 2.2, 'sine', 0.03); }, 900);
}
export function speak(text: string) {
  if (!getSave().settings.voice || !('speechSynthesis' in window)) return;
  try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'fr-FR'; u.rate = 0.92; u.pitch = 1.1; window.speechSynthesis.speak(u); } catch { /* voix indisponible : le texte reste affiché */ }
}
export function stopSpeaking() { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } }
