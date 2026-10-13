import { Flag, Foe, Guardian, type FoeKind, type GuardKind } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, HEROES } from './Characters';
import type { GameKind } from '../engine/levels';
import type { SaveData } from '../store/save';

export type Ev = 'idle' | 'good' | 'bad';
interface P { progress: number; ev: Ev; save: SaveData; boss?: string; foe?: string; w?: string }

const mood = (ev: Ev) => (ev === 'good' ? 'win' : ev === 'bad' ? 'surprise' : 'think') as 'win' | 'surprise' | 'think';
const hero = (s: SaveData) => HEROES[s.profile.avatarId] ?? HEROES[0];

function Course({ progress, ev, save }: P) {
  return (
    <div className="relative h-36 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(#7fd0ff,#d8f3ff 70%)' }} aria-label="Piste de course">
      <div className="absolute bottom-0 left-0 right-0 h-10" style={{ background: 'repeating-linear-gradient(90deg,#d8884a 0 40px,#c9783b 40px 80px)' }} />
      <div className="absolute bottom-9 right-3" aria-hidden><Flag size={52} /></div>
      {[0.25, 0.5, 0.75].map((m) => <div key={m} className="absolute bottom-10 w-1 h-6 bg-white/70" style={{ left: `${m * 85 + 5}%` }} />)}
      <motion.div className="absolute bottom-4" animate={{ left: `${progress * 80 + 2}%`, y: ev === 'good' ? [0, -18, 0] : 0, rotate: ev === 'bad' ? [0, -10, 10, 0] : 0 }} transition={{ type: 'spring', stiffness: 80, damping: 14 }}>
        <Avatar hero={hero(save)} outfit={save.profile.outfit} accessory={save.profile.accessory} mood={mood(ev)} size={70} />
      </motion.div>
    </div>
  );
}
function Chateau({ progress, ev }: P) {
  const floors = Math.round(progress * 8);
  return (
    <div className="relative h-36 rounded-3xl overflow-hidden flex items-end justify-center" style={{ background: 'linear-gradient(#a9c8ff,#f2e9ff)' }} aria-label="Tour en construction">
      <svg viewBox="0 0 200 130" className="h-full">
        <rect x="0" y="118" width="200" height="12" fill="#58b368" />
        <AnimatePresence>{Array.from({ length: floors }).map((_, i) => (
          <motion.g key={i} initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 14 }}>
            <rect x={60 - (i % 2) * 2} y={106 - i * 13} width="80" height="12" rx="2" fill={i % 2 ? '#b79cff' : '#9378f0'} stroke="#5a3fc0" />
            <rect x={96} y={108 - i * 13} width="8" height="8" rx="4" fill="#ffe27a" />
          </motion.g>))}
        </AnimatePresence>
        {floors >= 8 && <path d="M56 22l44-20 44 20z" fill="#ff5c8a" />}
        <motion.g animate={{ opacity: ev === 'good' ? [0, 1, 0] : 0 }} transition={{ duration: 1 }}><path d="M100 6l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill="#fff3a0" stroke="#ffc933" /></motion.g>
      </svg>
    </div>
  );
}
const FOE_BY_W: Record<string, FoeKind> = { n: 'chiffres', g: 'mesures', m: 'mots', f: 'formes', d: 'robot' };
const GUARD_BY_W: Record<string, GuardKind> = { n: 'dragon', g: 'golem', m: 'treant', f: 'crystal', d: 'robot' };
function Bataille({ progress, ev, save, foe = 'Gobelin des chiffres', w = 'n' }: P) {
  const hp = Math.max(0, 1 - progress);
  return (
    <div className="relative h-36 rounded-3xl overflow-hidden flex items-end justify-between px-6" style={{ background: 'linear-gradient(#ffd6a5,#fff1d6)' }} aria-label="Combat">
      <Avatar hero={hero(save)} outfit={save.profile.outfit} accessory="casque" mood={mood(ev)} size={74} />
      <div className="flex flex-col items-center pb-2">
        <div className="w-40 h-4 rounded-full bg-black/25 overflow-hidden"><motion.div className="h-full bg-red-500" animate={{ width: `${hp * 100}%` }} /></div>
        <motion.div animate={{ x: ev === 'good' ? [0, 14, -14, 0] : 0, rotate: ev === 'good' ? [0, 10, -10, 0] : 0, scale: progress >= 1 ? 0.2 : 1 }} aria-hidden><Foe v={FOE_BY_W[w] ?? 'chiffres'} size={72} /></motion.div>
        <div className="text-sm text-amber-900 font-bold">{foe}</div>
      </div>
    </div>
  );
}
function Pont({ progress, ev, save }: P) {
  const planks = Math.round(progress * 8);
  return (
    <div className="relative h-36 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(#bfe9ff,#e9fbff 55%,#3aa0d8 55%)' }} aria-label="Pont à construire">
      <div className="absolute bottom-10 left-0 w-10 h-14 bg-emerald-600 rounded-r-2xl" /><div className="absolute bottom-10 right-0 w-10 h-14 bg-emerald-600 rounded-l-2xl" />
      <div className="absolute bottom-14 left-12 right-12 flex">{Array.from({ length: 8 }).map((_, i) => <motion.div key={i} className="flex-1 h-4 mx-0.5 rounded bg-amber-700 border border-amber-900" animate={{ opacity: i < planks ? 1 : 0.15, y: i < planks ? 0 : 10 }} />)}</div>
      <motion.div className="absolute bottom-[4.5rem]" animate={{ left: `${10 + progress * 70}%` }} transition={{ type: 'spring', stiffness: 60 }}><Avatar hero={hero(save)} outfit={save.profile.outfit} accessory={save.profile.accessory} mood={mood(ev)} size={56} /></motion.div>
    </div>
  );
}
function Boss({ progress, ev, save, boss = 'Dragon des Nombres', w = 'n' }: P) {
  const hp = Math.max(0, 1 - progress);
  return (
    <div className="relative h-40 rounded-3xl overflow-hidden flex items-end justify-between px-6" style={{ background: 'linear-gradient(#2a0f4a,#7a2a6a 80%,#d95a4a)' }} aria-label={`Combat contre ${boss}`}>
      <Avatar hero={hero(save)} outfit={save.profile.outfit} accessory={save.profile.accessory} mood={mood(ev)} size={78} />
      <div className="flex flex-col items-center pb-2 flex-1 max-w-[16rem]">
        <div className="text-xs font-bold text-white/90">{boss}</div>
        <div className="w-full h-4 rounded-full bg-black/40 overflow-hidden mb-1"><motion.div className="h-full" style={{ background: 'linear-gradient(90deg,#ff6a3d,#ffd23f)' }} animate={{ width: `${hp * 100}%` }} /></div>
        <motion.div animate={{ x: ev === 'good' ? [0, 16, -16, 0] : ev === 'bad' ? [0, -8, 0] : 0, scale: progress >= 1 ? 0.3 : 1, rotate: progress >= 1 ? 90 : 0 }} aria-hidden><Guardian v={GUARD_BY_W[w] ?? 'dragon'} size={92} /></motion.div>
      </div>
    </div>
  );
}
export function Stage({ kind, ...p }: P & { kind: GameKind }) {
  return kind === 'course' ? <Course {...p} /> : kind === 'chateau' ? <Chateau {...p} /> : kind === 'bataille' ? <Bataille {...p} /> : kind === 'pont' ? <Pont {...p} /> : <Boss {...p} />;
}
