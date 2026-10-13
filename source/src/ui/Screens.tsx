import { loadBank } from '../store/bank';
import { Ico, WorldIcon, BadgeIcon } from './Icons';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, HEROES, OUTFITS, Mimi, MimiBubble } from './Characters';
import { Castle, Hills, Logo, Sky } from './Scenery';
import { ACCESSORIES, totalStars, update, useSave } from '../store/save';
import { WORLD_LEVELS, WORLDS, type LevelDef } from '../engine/levels';
import { BADGES, type Summary } from '../store/progress';
import { sfx, setMusic } from '../engine/sfx';
import { fr } from '../engine/format';
import { dueSkills } from '../engine/mastery';
import type { SkillId } from '../engine/types';

export type Screen = 'welcome' | 'avatar' | 'map' | 'world1' | 'world2' | 'world3' | 'world4' | 'world5' | 'castle' | 'settings' | 'parent';
export interface Nav { go: (s: Screen) => void; play: (l: LevelDef, mode: 'training' | 'exam', review?: boolean) => void; series: (p: import('./Series').SeriesPlay) => void; exam: () => void }

export function Welcome({ nav }: { nav: Nav }) {
  const save = useSave();
  const [px, setPx] = useState(0);
  const hero = HEROES[save.profile.avatarId];
  return (
    <div className="h-full" onPointerMove={(e) => setPx((e.clientX / window.innerWidth - 0.5) * 2)}>
      <Sky reduce={save.settings.reduceMotion}>
        <motion.div className="absolute left-1/2 bottom-[14%] w-[min(88vw,640px)]" style={{ x: '-50%' }} animate={{ translateX: px * -10 }}><Castle className="w-full drop-shadow-2xl" /></motion.div>
        <Hills />
        <motion.div className="absolute left-[6%] bottom-[8%]" animate={{ translateX: px * 16 }}><Avatar hero={hero} outfit={save.profile.outfit} accessory={save.profile.accessory} size={150} mood="happy" /></motion.div>
        <motion.div className="absolute right-[8%] bottom-[22%]" animate={{ translateX: px * 22 }}><Mimi size={110} /></motion.div>
        <div className="absolute top-[5%] left-0 right-0"><Logo /></div>
        <div className="absolute bottom-[4%] left-0 right-0 flex flex-col items-center gap-3 px-4">
          <div className="flex flex-wrap justify-center gap-3">
            <button className="btn btn-gold !text-2xl" onClick={() => { sfx.click(); nav.go(save.created ? 'map' : 'avatar'); if (!save.created) return; }}>{save.created ? '▶ Continuer ma partie' : '✦ Commencer l’aventure'}</button>
            {save.created && <button className="btn btn-violet" onClick={() => { sfx.click(); nav.go('avatar'); }}>Changer de personnage</button>}
          </div>
          <div className="flex gap-3">
            <button className="btn btn-ghost !text-base" onClick={() => { sfx.click(); nav.go('settings'); }}><Ico n="gear" /> Réglages</button>
            <button className="btn btn-ghost !text-base" onClick={() => { sfx.click(); nav.go('parent'); }}><Ico n="lock" /> Espace parent</button>
          </div>
        </div>
      </Sky>
    </div>
  );
}

export function AvatarPick({ nav }: { nav: Nav }) {
  const save = useSave();
  const stars = totalStars(save);
  const hero = HEROES[save.profile.avatarId];
  return (
    <div className="h-full overflow-y-auto" style={{ background: 'linear-gradient(#2b1b8a,#6a3df0)' }}>
      <div className="max-w-4xl mx-auto p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center"><button className="btn btn-ghost !py-2 !text-base" onClick={() => nav.go('welcome')}>← Accueil</button><h1 className="text-3xl font-extrabold">Choisis ton héros</h1><span /></div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {HEROES.map((h) => (
            <button key={h.id} aria-pressed={h.id === save.profile.avatarId} className={`panel p-2 flex flex-col items-center focusable ${h.id === save.profile.avatarId ? '!border-amber-300 !border-4' : ''}`} onClick={() => { sfx.click(); update((s) => ({ ...s, profile: { ...s.profile, avatarId: h.id } })); }}>
              <Avatar hero={h} outfit={save.profile.outfit} size={84} /><b>{h.name} · {h.age} ans</b><span className="text-xs opacity-80">{h.blurb}</span>
            </button>))}
        </div>
        <div className="panel p-4 flex flex-col md:flex-row gap-4 items-center">
          <Avatar hero={hero} outfit={save.profile.outfit} accessory={save.profile.accessory} size={170} mood="win" />
          <div className="flex-1 w-full">
            <label className="block font-bold mb-1" htmlFor="nm">Ton prénom dans le jeu</label>
            <input id="nm" maxLength={14} value={save.profile.name} onChange={(e) => update((s) => ({ ...s, profile: { ...s.profile, name: e.target.value } }))} className="w-full rounded-xl px-3 py-2 text-xl text-indigo-900 mb-3 focusable" />
            <div className="font-bold mb-1">Couleur de la tenue</div>
            <div className="flex gap-2 mb-3">{OUTFITS.map((c) => <button key={c} aria-label={`Couleur ${c}`} className={`w-11 h-11 rounded-full border-4 ${c === save.profile.outfit ? 'border-white' : 'border-transparent'}`} style={{ background: c }} onClick={() => { sfx.click(); update((s) => ({ ...s, profile: { ...s.profile, outfit: c } })); }} />)}</div>
            <div className="font-bold mb-1">Accessoires <span className="font-normal opacity-80">(débloqués avec tes étoiles : {stars} ★)</span></div>
            <div className="flex flex-wrap gap-2">{ACCESSORIES.map((a) => { const ok = stars >= a.stars; return <button key={a.id} disabled={!ok} aria-pressed={save.profile.accessory === a.id} className={`btn !py-1 !text-base ${save.profile.accessory === a.id ? 'btn-gold' : 'btn-ghost'} disabled:opacity-40`} onClick={() => { sfx.click(); update((s) => ({ ...s, profile: { ...s.profile, accessory: a.id } })); }}>{ok ? a.label : <><Ico n="lock" /> {a.stars} <Ico n="star" /></>}</button>; })}</div>
          </div>
        </div>
        <MimiBubble>Salut {save.profile.name || 'toi'} ! Moi, c’est Mimi. Je serai ta compagne : je te donne des indices, mais c’est toi qui trouves les réponses !</MimiBubble>
        <button className="btn btn-gold self-center !text-2xl" onClick={() => { sfx.click(); update((s) => ({ ...s, created: true })); nav.go('map'); }}>C’est parti ! →</button>
      </div>
    </div>
  );
}

const POS_WIDE = [[12, 74], [28, 38], [46, 70], [62, 30], [78, 66], [88, 26]];
const POS_NARROW = [[24, 80], [70, 68], [28, 54], [72, 40], [28, 26], [66, 12]];
export function WorldMap({ nav }: { nav: Nav }) {
  const save = useSave();
  const [info, setInfo] = useState<string | null>(null);
  const hero = HEROES[save.profile.avatarId];
  const stars = totalStars(save);
  const narrow = typeof window !== 'undefined' && window.innerWidth < 700;
  const POS = narrow ? POS_NARROW : POS_WIDE;
  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'linear-gradient(#150b4d,#3b2a9a 45%,#ff8fb1 100%)' }}>
      {/* barre du haut : jamais superposée aux mondes, pour que chaque toucher atteigne le bon bouton */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 p-2 z-20 relative">
        <button className="btn btn-ghost !py-1 !text-base" onClick={() => nav.go('welcome')}>← Accueil</button>
        <button className="btn btn-violet !py-1 !text-base flex items-center gap-2" onClick={() => { sfx.click(); nav.go('avatar'); }}><Avatar hero={hero} outfit={save.profile.outfit} accessory={save.profile.accessory} size={26} />Mon héros</button>
        <div className="flex gap-2"><div className="panel px-3 py-1 font-bold flex items-center gap-1"><Ico n="star" /> {stars}</div><div className="panel px-3 py-1 font-bold flex items-center gap-1"><Ico n="coin" /> {save.coins}</div></div>
      </div>
      <div className="relative flex-1 min-h-0">
        <Sky reduce={save.settings.reduceMotion}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            <path d="M-5 80C20 62 30 92 50 80S80 72 105 84V105H-5z" fill="#2a8f6a" opacity=".9" />
            <polyline points={POS.map((p) => p.join(',')).join(' ')} fill="none" stroke="#ffe27a" strokeDasharray="1.5 1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 4 }} opacity=".7" />
          </svg>
          {WORLDS.map((w, i) => (
            <motion.button key={w.id} className="absolute -translate-x-1/2 -translate-y-1/2 focusable rounded-3xl flex flex-col items-center z-10" style={{ left: `${POS[i][0]}%`, top: `${POS[i][1]}%` }} whileTap={{ scale: 0.95 }}
              onClick={() => { sfx.click(); if (w.id === 1) nav.go('world1'); else if (w.id === 2) nav.go('world2'); else if (w.id === 3) nav.go('world3'); else if (w.id === 4) nav.go('world4'); else if (w.id === 5) nav.go('world5'); else if (w.id === 6) nav.go('castle'); else setInfo(`${w.name} : monde en construction. Il n’est pas encore jouable dans cette version.`); }} aria-label={`${w.name}${w.ready ? '' : ' (bientôt)'}`}>
              <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl md:text-5xl border-4 border-white shadow-xl ${w.ready ? '' : 'grayscale opacity-70'}`} style={{ background: w.color }}><WorldIcon id={w.id} size="62%" /></div>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-black/60 text-xs md:text-sm font-bold text-center max-w-[9rem] md:max-w-none md:whitespace-nowrap">{w.name.replace(/^(Le |La )/, '')}{!w.ready && ' · bientôt'}</div>
            </motion.button>))}
          {info && <div className="absolute bottom-2 left-2 right-2 z-20 flex justify-center"><MimiBubble>{info} <button className="underline ml-2" onClick={() => setInfo(null)}>OK</button></MimiBubble></div>}
        </Sky>
      </div>
    </div>
  );
}

export function WorldLevels({ nav, worldId }: { nav: Nav; worldId: 1 | 2 | 3 | 4 | 5 }) {
  const save = useSave();
  const LEVELS = WORLD_LEVELS[worldId];
  const world = WORLDS.find((w) => w.id === worldId)!;
  const unlocked = (i: number) => i === 0 || save.settings.freeLevels || (save.levels[LEVELS[i - 1].id]?.stars ?? 0) > 0;
  return (
    <div className="h-full overflow-y-auto" style={{ background: worldId === 3 ? 'linear-gradient(#1b4fa8,#5ec9a0)' : worldId === 2 ? 'linear-gradient(#1f5a3a,#8fd16a)' : worldId === 4 ? 'linear-gradient(#4a1f8a,#c46cff)' : worldId === 5 ? 'linear-gradient(#3a1a6a,#ff6b8b)' : 'linear-gradient(#3a1f9a,#e8a23a)' }}>
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex items-center justify-between mb-3"><button className="btn btn-ghost !py-2 !text-base" onClick={() => nav.go('map')}>← Carte</button><h1 className="text-3xl font-extrabold text-center">{world.name}</h1><span className="w-20" /></div>
        {(() => {
          const stats = save.stats; const due = dueSkills(stats, Date.now());
          const weak = (Object.keys(stats) as SkillId[]).filter((k) => { const st = stats[k]; return st && st.attempts >= 3 && st.correct / st.attempts < 0.75; });
          const skills = [...new Set([...due, ...weak])].slice(0, 4);
          if (!skills.length) return <div className="panel p-3 mb-3 text-sm opacity-90"><Ico n="review" /> Révision du jour : rien à réviser pour l’instant. Joue quelques niveaux, Mimi te proposera de revoir ce qui est fragile.</div>;
          const rev: LevelDef = { id: 'revision', n: 0, title: 'Révision du jour', story: '', game: 'course', count: 8, plan: skills.map((k) => ({ skill: k, difficulty: 2 })) };
          return <button className="btn btn-green w-full mb-3" onClick={() => { sfx.click(); nav.play(rev, 'training', true); }}><Ico n="review" /> Révision du jour : {skills.length} compétence(s) à revoir</button>;
        })()}
        <div className="grid gap-3">
          {LEVELS.map((l, i) => { const p = save.levels[l.id]; const ok = unlocked(i); return (
            <motion.button key={l.id} disabled={!ok} whileHover={ok ? { scale: 1.02 } : {}} className={`panel p-3 flex items-center gap-3 text-left focusable ${ok ? '' : 'opacity-50'}`} onClick={() => { sfx.click(); nav.play(l, 'training'); }}>
              <div className="w-14 h-14 rounded-full bg-amber-300 text-amber-900 font-extrabold text-2xl flex items-center justify-center shrink-0">{ok ? l.n : <Ico n="lock" s="1em" />}</div>
              <div className="flex-1"><div className="font-extrabold text-xl">{l.title}</div><div className="text-sm opacity-85">{l.story}</div></div>
              <div className="text-2xl tracking-tight shrink-0" aria-label={`${p?.stars ?? 0} étoiles sur 3`}>{[1, 2, 3].map((n) => <span key={n} style={{ opacity: (p?.stars ?? 0) >= n ? 1 : 0.25 }}>★</span>)}</div>
            </motion.button>); })}
        </div>
      </div>
    </div>
  );
}

const showAns = (a: string) => (/^-?\d+(\.\d+)?$/.test(a) ? fr(Number(a)) : a);
export function ResultScreen({ s, nav, onAgain }: { s: Summary; nav: Nav; onAgain: () => void }) {
  const exam = s.mode === 'exam';
  const score = s.items.filter((i) => i.correct).length;
  return (
    <div className="h-full overflow-y-auto" style={{ background: 'linear-gradient(#2b1b8a,#6a3df0)' }}>
      <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4 items-center">
        <motion.h1 initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-4xl font-extrabold text-amber-300">{exam ? 'Évaluation remise !' : 'Niveau terminé !'}</motion.h1>
        {!exam && <div className="text-6xl" aria-label={`${s.stars} étoiles`}>{[1, 2, 3].map((n) => <motion.span key={n} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 * n, type: 'spring' }} style={{ opacity: s.stars >= n ? 1 : 0.2 }}>★</motion.span>)}</div>}
        <p className="text-xl">{exam ? `${score} bonnes réponses sur ${s.items.length}` : `${s.correctBase} réussites du premier coup sur ${s.totalBase} — +${s.coins} pièces`}</p>
        {s.newBadges.map((b) => <div key={b} className="panel px-4 py-2 text-lg"><BadgeIcon id={b} size="1.4em" /> <b>Nouveau badge :</b> {BADGES[b].label}</div>)}
        <MimiBubble mood="win">{exam ? 'Voyons la correction ensemble : une erreur est une information, pas un échec.' : s.stars === 3 ? 'Magnifique ! Tu maîtrises ce niveau.' : 'Bien joué ! Rejoue pour décrocher plus d’étoiles : tu peux toujours progresser.'}</MimiBubble>
        {exam && <div className="w-full grid gap-2">{s.items.map((it, i) => (
          <div key={i} className={`panel p-3 ${it.correct ? '!border-green-400' : '!border-orange-400'}`}><div className="font-bold">{i + 1}. {it.ex.prompt}</div>
            <div>Ta réponse : <b>{it.given || '—'}</b> {it.correct ? '✓' : `✗ — attendu : ${showAns(it.ex.answers[0])}`}</div>{!it.correct && <div className="text-sm opacity-90">{it.ex.explanation}</div>}</div>))}</div>}
        <div className="flex flex-wrap gap-3 justify-center"><button className="btn btn-gold" onClick={onAgain}>↻ Rejouer</button><button className="btn btn-green" onClick={() => nav.go(exam ? 'castle' : s.level.id.startsWith('g') ? 'world3' : s.level.id.startsWith('m') ? 'world2' : s.level.id.startsWith('f') ? 'world4' : s.level.id.startsWith('d') ? 'world5' : 'world1')}>Continuer →</button></div>
      </div>
    </div>
  );
}

export function OfflinePanel() {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle'); const [done, setDone] = useState(0); const [total, setTotal] = useState(0);
  const supported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
  const prepare = async () => {
    setState('busy');
    try {
      const bank = await loadBank(); const urls = [...bank.series, ...bank.official].map((i) => i.image); setTotal(urls.length); let n = 0;
      for (let i = 0; i < urls.length; i += 6) { await Promise.all(urls.slice(i, i + 6).map((u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u); }))); n = Math.min(urls.length, i + 6); setDone(n); }
      setState('done');
    } catch { setState('error'); }
  };
  return (<div className="panel px-4 py-3"><div className="text-xl mb-1 flex items-center gap-2"><Ico n="cloud" /> Utiliser sans connexion</div>
    <p className="text-sm opacity-90 mb-2">{supported ? 'Le jeu est enregistré sur cet appareil : il se rouvre sans internet. Précharge aussi les pages des séries et des épreuves pour les ouvrir hors connexion.' : 'Le mode hors connexion s’active après le premier chargement, quand le jeu est ouvert depuis son propre site (pas depuis un aperçu intégré). Recharge la page puis reviens ici.'}</p>
    <button className="btn btn-gold !py-2 !text-base" disabled={!supported || state === 'busy'} onClick={prepare}>{state === 'busy' ? `Préparation… ${done}/${total}` : state === 'done' ? `Prêt : ${total} pages enregistrées` : 'Préparer le hors connexion'}</button>
    {state === 'error' && <p className="text-amber-300 text-sm mt-2">Impossible de tout enregistrer (connexion coupée ?). Réessaie avec le réseau.</p>}</div>);
}
export function Settings({ nav }: { nav: Nav }) {
  const save = useSave(); const s = save.settings;
  const set = (patch: Partial<typeof s>) => update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  const Row = ({ label, on, k }: { label: string; on: boolean; k: 'freeLevels' | 'sound' | 'music' | 'voice' | 'reduceMotion' | 'bigText' }) => (
    <label className="flex items-center justify-between panel px-4 py-3 text-xl"><span>{label}</span><input type="checkbox" className="w-7 h-7" checked={on} onChange={(e) => { set({ [k]: e.target.checked } as any); if (k === 'music') setMusic(e.target.checked); }} /></label>);
  return (
    <div className="h-full overflow-y-auto" style={{ background: 'linear-gradient(#2b1b8a,#4a2fb0)' }}><div className="max-w-xl mx-auto p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between"><button className="btn btn-ghost !py-2 !text-base" onClick={() => nav.go('welcome')}>← Accueil</button><h1 className="text-3xl font-extrabold">Réglages</h1><span className="w-20" /></div>
      <Row label="Niveaux libres (tous ouverts, sans ordre imposé)" on={s.freeLevels} k="freeLevels" /><Row label="Effets sonores" on={s.sound} k="sound" /><Row label="Musique douce" on={s.music} k="music" /><Row label="Lecture vocale des consignes (voix du navigateur)" on={s.voice} k="voice" /><Row label="Réduire les animations" on={s.reduceMotion} k="reduceMotion" />
      <OfflinePanel />
      <div className="panel px-4 py-3"><div className="text-xl mb-2">Durée conseillée d’une séance</div><div className="flex gap-2">{([10, 15, 20] as const).map((m) => <button key={m} className={`btn !py-2 ${s.sessionMin === m ? 'btn-gold' : 'btn-ghost'}`} onClick={() => set({ sessionMin: m })}>{m} min</button>)}</div></div>
    </div></div>);
}
