// Effets sonores synthétisés (aucun fichier audio), vibrations, synthèse vocale et enregistrement.
// Tout est optionnel : si le navigateur ne sait pas faire, le jeu fonctionne sans.

const SOUND_KEY = "soumaya-academy:sound";
let ctx: AudioContext | null = null;
let muted = (() => { try { return window.localStorage.getItem(SOUND_KEY) === "off"; } catch { return false; } })();

export const isMuted = () => muted;
export function setMuted(v: boolean) {
  muted = v;
  try { window.localStorage.setItem(SOUND_KEY, v ? "off" : "on"); } catch { /* ignoré */ }
}

function audio(): AudioContext | null {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch { return null; }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.12) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq;
  const t0 = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0); o.stop(t0 + dur + 0.05);
}

export type Sfx = "tap" | "good" | "bad" | "star" | "win" | "page";
export function sfx(kind: Sfx) {
  if (muted) return;
  try {
    switch (kind) {
      case "tap": tone(660, 0, 0.07, "triangle", 0.05); break;
      case "page": tone(440, 0, 0.09, "sine", 0.05); tone(587, 0.06, 0.09, "sine", 0.05); break;
      case "good": tone(660, 0, 0.14, "sine"); tone(880, 0.1, 0.2, "sine"); tone(1320, 0.2, 0.28, "triangle", 0.07); break;
      case "bad": tone(300, 0, 0.18, "sine", 0.09); tone(240, 0.12, 0.26, "sine", 0.08); break;
      case "star": tone(988, 0, 0.12, "triangle"); tone(1319, 0.1, 0.2, "triangle"); break;
      case "win": [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.11, 0.3, "triangle", 0.1)); break;
    }
  } catch { /* le son ne doit jamais bloquer le jeu */ }
}

export function haptic(ms: number | number[] = 12) {
  try { if (!muted) navigator.vibrate?.(ms); } catch { /* ignoré */ }
}

// ---------- Synthèse vocale (lecture à voix haute) ----------
export const speechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

function frenchVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === "fr-BE") ?? voices.find((v) => v.lang.toLowerCase().startsWith("fr-fr")) ?? voices.find((v) => v.lang.toLowerCase().startsWith("fr"));
}

/** Lit un texte à voix haute. Renvoie une fonction d'arrêt. `onEnd` est appelé à la fin ou à l'arrêt. */
export function speak(text: string, opts: { rate?: number; onEnd?: () => void } = {}): () => void {
  if (!speechSupported()) { opts.onEnd?.(); return () => undefined; }
  const synth = window.speechSynthesis;
  synth.cancel();
  const parts = text.replace(/\s+/g, " ").match(/[^.!?…]+[.!?…]*/g) ?? [text];
  let stopped = false;
  let i = 0;
  const next = () => {
    if (stopped || i >= parts.length) { if (!stopped) opts.onEnd?.(); return; }
    const u = new SpeechSynthesisUtterance(parts[i++].trim());
    u.lang = "fr-BE"; u.rate = opts.rate ?? 0.92; u.pitch = 1.02;
    const v = frenchVoice();
    if (v) u.voice = v;
    u.onend = next;
    u.onerror = () => { if (!stopped) { stopped = true; opts.onEnd?.(); } };
    synth.speak(u);
  };
  next();
  return () => { stopped = true; try { synth.cancel(); } catch { /* ignoré */ } opts.onEnd?.(); };
}

// ---------- Enregistrement vocal (expression orale) ----------
export const recorderSupported = () => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";

export async function startRecording(): Promise<{ stop: () => Promise<string> }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  rec.start();
  return {
    stop: () => new Promise<string>((resolve) => {
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        resolve(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || "audio/webm" })));
      };
      rec.stop();
    }),
  };
}
