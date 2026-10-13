/** Voix de Mimi : voix française du téléphone, mise en scène (rythme, hauteur, pauses) selon l'humeur et la ponctuation. */
export type Mood = 'happy' | 'wow' | 'soft' | 'think';

const LS = 'soumaya-voice-v1';
let on = (() => { try { return localStorage.getItem(LS) !== 'off'; } catch { return true; } })();
export const voiceEnabled = () => on;
export function setVoiceEnabled(v: boolean) { on = v; try { localStorage.setItem(LS, v ? 'on' : 'off'); } catch { /* mode privé */ } if (!v) cancelSpeech(); }

const synth = (): SpeechSynthesis | null => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null);
let chosen: SpeechSynthesisVoice | null | undefined;
const FEMALE = /(am[eé]lie|audrey|marie|julie|ther[eè]se|hortense|denise|eloise|vivienne|female|femme|fr-fr-x-(fra|frc|vlf)|google fran)/i;
export function pickVoice(): SpeechSynthesisVoice | null {
  const s = synth(); if (!s) return null;
  if (chosen) return chosen;
  const all = s.getVoices().filter((v) => /^fr/i.test(v.lang));
  if (!all.length) return null;
  const score = (v: SpeechSynthesisVoice) => (FEMALE.test(v.name) ? 4 : 0) + (/fr[-_]fr/i.test(v.lang) ? 2 : /fr[-_]be/i.test(v.lang) ? 1.5 : 0) + (v.localService ? 1 : 0) + (/natural|neural|online/i.test(v.name) ? 3 : 0);
  chosen = all.sort((a, b) => score(b) - score(a))[0]; return chosen;
}
if (synth()) { try { synth()!.onvoiceschanged = () => { chosen = undefined; }; } catch { /* ignore */ } }

let timers: number[] = []; let release: (() => void) | null = null; let token = 0;
export function cancelSpeech() {
  token++; timers.forEach((t) => window.clearTimeout(t)); timers = [];
  try { synth()?.cancel(); } catch { /* ignore */ }
  const r = release; release = null; r?.();
}

const PROFILE: Record<Mood, { rate: number; pitch: number }> = { happy: { rate: 0.98, pitch: 1.28 }, wow: { rate: 1.05, pitch: 1.45 }, soft: { rate: 0.9, pitch: 1.16 }, think: { rate: 0.92, pitch: 1.1 } };
const chunks = (text: string) => text.match(/[^.!?…,;:]+[.!?…,;:]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
const readingMs = (s: string) => 500 + s.length * 58;

/** Prononce un texte ; la promesse se termine à la fin de la phrase (ou tout de suite si on annule). */
export function speak(text: string, mood: Mood = 'happy'): Promise<void> {
  cancelSpeech();
  const my = token; const s = synth(); const v = pickVoice();
  return new Promise<void>((resolve) => {
    const done = () => { if (release === done) release = null; resolve(); };
    release = done;
    if (!on || !s || !v) { timers.push(window.setTimeout(done, readingMs(text))); return; }
    const parts = chunks(text); let i = 0;
    const next = () => {
      if (my !== token) return;
      if (i >= parts.length) { timers.push(window.setTimeout(done, 280)); return; }
      const part = parts[i++]; const u = new SpeechSynthesisUtterance(part); const base = PROFILE[mood];
      const q = /\?$/.test(part), ex = /!$/.test(part), soft = /…$/.test(part);
      u.voice = v; u.lang = v.lang; u.volume = 1;
      u.rate = base.rate * (ex ? 1.04 : soft ? 0.92 : 1) * (0.98 + Math.random() * 0.05);
      u.pitch = Math.min(2, base.pitch + (q ? 0.14 : 0) + (ex ? 0.1 : 0) - (soft ? 0.08 : 0) + (Math.random() - 0.5) * 0.06);
      let fired = false; const go = () => { if (fired) return; fired = true; const pause = /[.!?]$/.test(part) ? 380 : /…$/.test(part) ? 520 : /[,;:]$/.test(part) ? 170 : 60; timers.push(window.setTimeout(next, pause)); };
      u.onend = go; u.onerror = go;
      timers.push(window.setTimeout(go, part.length * 120 + 3500)); // filet de sécurité : certains navigateurs n'envoient pas « end »
      try { s.speak(u); } catch { go(); }
    };
    next();
  });
}
