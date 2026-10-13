import { useSyncExternalStore } from 'react';
import type { Attempt, SkillId } from '../engine/types';
import { emptyStats, updateStats, type SkillStats } from '../engine/mastery';

export interface Profile { name: string; avatarId: number; outfit: string; accessory: string }
export interface LevelProgress { stars: number; best: number; plays: number }
export interface ExamResult { t: number; levelId: string; score: number; total: number; perSkill: Partial<Record<SkillId, [number, number]>> }
export interface SeriesRun { t: number; ref: string; label: string; kind: 'serie' | 'officiel'; score: number; total: number; parts: Record<string, [number, number]>; marks: { id: string; got: number; max: number | null }[] }
export interface Settings { freeLevels: boolean; sound: boolean; music: boolean; voice: boolean; reduceMotion: boolean; sessionMin: 10 | 15 | 20; bigText: boolean }
export interface SaveData {
  version: 1; created: boolean; profile: Profile; levels: Record<string, LevelProgress>; coins: number; badges: string[];
  history: Attempt[]; stats: Partial<Record<SkillId, SkillStats>>; exams: ExamResult[]; seriesRuns: SeriesRun[]; settings: Settings; pinHash: string | null; playMs: number;
}

const KEY = 'soumaya-academy-save-v1';
export const defaultSave = (): SaveData => ({
  version: 1, created: false, profile: { name: 'Soumaya', avatarId: 0, outfit: '#7b4dff', accessory: 'aucun' },
  levels: {}, coins: 0, badges: [], history: [], stats: {}, exams: [], seriesRuns: [],
  settings: { freeLevels: true, sound: true, music: false, voice: false, reduceMotion: false, sessionMin: 15, bigText: false }, pinHash: null, playMs: 0,
});

function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const d = JSON.parse(raw);
    if (d?.version !== 1) return defaultSave();
    const base = defaultSave();
    return { ...base, ...d, profile: { ...base.profile, ...d.profile }, settings: { ...base.settings, ...d.settings } };
  } catch { return defaultSave(); }
}

let state: SaveData = load();
const listeners = new Set<() => void>();
let timer: number | undefined;
function persist() {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota ou mode privé : on continue en mémoire */ } }, 150);
}
function set(next: SaveData) { state = next; listeners.forEach((l) => l()); persist(); }
export function update(fn: (s: SaveData) => SaveData) { set(fn(state)); }
export function getSave() { return state; }
export function useSave(): SaveData { return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => state); }

export function recordAttempt(a: Attempt) {
  update((s) => ({ ...s, history: [...s.history, a].slice(-3000), stats: { ...s.stats, [a.skill]: updateStats(s.stats[a.skill] ?? emptyStats(), a) } }));
}
export function resetAll() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } set(defaultSave()); }
export function exportJson() { return JSON.stringify(state, null, 2); }

export async function hashPin(pin: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('soumaya:' + pin));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch { let h = 5381; for (const c of 'soumaya:' + pin) h = ((h << 5) + h + c.charCodeAt(0)) | 0; return 'x' + h; }
}

export const ACCESSORIES = [
  { id: 'aucun', label: 'Aucun', stars: 0 },
  { id: 'lunettes', label: 'Lunettes d’explorateur', stars: 3 },
  { id: 'couronne', label: 'Couronne étoilée', stars: 8 },
  { id: 'cape', label: 'Cape magique', stars: 14 },
  { id: 'casque', label: 'Casque de chevalier', stars: 20 },
];
export const totalStars = (s: SaveData) => Object.values(s.levels).reduce((n, l) => n + l.stars, 0);
