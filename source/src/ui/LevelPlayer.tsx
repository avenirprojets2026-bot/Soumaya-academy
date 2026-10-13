import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Exercise } from '../engine/types';
import type { LevelDef } from '../engine/levels';
import { Ico } from './Icons';
import { generate, FRENCH_SKILLS, GEO_SKILLS, DISC_SKILLS } from '../engine/generators';
import { makeRng } from '../engine/rng';
import { isCorrect } from '../engine/grading';
import { recordAttempt, update, useSave } from '../store/save';
import { finishLevel, type Item, type Summary } from '../store/progress';
import { sfx, speak, stopSpeaking } from '../engine/sfx';
import { MimiBubble } from './Characters';
import { Stage, type Ev } from './Stages';

function Visual({ ex }: { ex: Exercise }) {
  const v = ex.visual; if (!v) return null;
  if (v.type === 'sequence') return (
    <div className="flex flex-wrap justify-center gap-2 my-3" aria-label="Suite de nombres">
      {v.items.map((it, i) => <div key={i} className={`min-w-[4.5rem] px-3 py-3 rounded-2xl text-2xl font-extrabold text-center ${it === null ? 'bg-amber-300 text-amber-900 animate-pulse' : 'bg-white/90 text-indigo-900'}`}>{it ?? '?'}</div>)}
    </div>);
  if (v.type === 'abacus') {
    const cols = ['CM', 'DM', 'UM', 'C', 'D', 'U'];
    return (<table className="mx-auto my-3 text-center text-xl bg-white/90 text-indigo-900 rounded-2xl overflow-hidden" aria-label="Abaque vide : colonnes des centaines de mille aux unités"><thead><tr>{cols.map((c) => <th key={c} className="px-3 py-1 bg-indigo-200">{c}</th>)}{v.digits.d && <th className="px-3 py-1 bg-pink-200">d</th>}</tr></thead>
      <tbody><tr>{cols.map((c) => <td key={c} className="px-3 py-4 border border-indigo-100">&nbsp;</td>)}{v.digits.d && <td className="px-3 py-4 border border-pink-100">&nbsp;</td>}</tr></tbody></table>);
  }
  if (v.type === 'bars') {
    const max = Math.max(12, ...v.items.map((i) => i[1])), H = 100, W = 200, bw = 30, gap = (W - 30 - bw * v.items.length) / (v.items.length + 1);
    return (<svg viewBox="0 0 220 135" className="mx-auto my-2 w-full max-w-md" role="img" aria-label={`Diagramme à bandes : ${v.items.map((i) => `${i[0]} ${i[1]}`).join(', ')}`}>
      {[0, 2, 4, 6, 8, 10, 12].filter((t) => t <= max).map((t) => { const y = 5 + H - (t / max) * H; return <g key={t}><line x1="22" y1={y} x2="215" y2={y} stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.6" /><text x="18" y={y + 3} textAnchor="end" fontSize="7" fill="#fff">{t}</text></g>; })}
      {v.items.map(([l, n], i) => { const x = 30 + gap * (i + 1) + bw * i, h = (n / max) * H; return <g key={l}><rect x={x} y={5 + H - h} width={bw} height={h} rx="2" fill={['#ffd166', '#5ec9a0', '#ff8fb1', '#7aa7ff'][i % 4]} /><text x={x + bw / 2} y={126} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">{l}</text></g>; })}
    </svg>);
  }
  if (v.type === 'polygon') {
    const n = v.sides; const pts = Array.from({ length: n }, (_, i) => { const a = (-90 + (360 / n) * i + (n === 4 ? 45 : 0)) * Math.PI / 180; return `${60 + 46 * Math.cos(a)},${60 + 46 * Math.sin(a)}`; }).join(' ');
    return (<svg viewBox="0 0 120 120" className="mx-auto my-2 w-40 h-40" role="img" aria-label={`Figure à ${n} côtés`}><polygon points={pts} fill="#ffd166" stroke="#4a2fb0" strokeWidth="4" strokeLinejoin="round" /></svg>);
  }
  if (v.type === 'angle') {
    const a = (v.deg * Math.PI) / 180, L = 52, xmin = Math.min(0, L * Math.cos(a)), cx = (120 - (L - xmin)) / 2 - xmin, cy = 50 + (L * Math.sin(a)) / 2;
    const ex = cx + L * Math.cos(-a), ey = cy + L * Math.sin(-a);
    return (<svg viewBox="0 0 120 100" className="mx-auto my-2 w-48 h-40" role="img" aria-label="Un angle dessiné"><line x1={cx} y1={cy} x2={cx + L} y2={cy} stroke="#fff" strokeWidth="4" strokeLinecap="round" /><line x1={cx} y1={cy} x2={ex} y2={ey} stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <path d={`M ${cx + 16} ${cy} A 16 16 0 ${v.deg > 180 ? 1 : 0} 0 ${cx + 16 * Math.cos(-a)} ${cy + 16 * Math.sin(-a)}`} fill="none" stroke="#ffd166" strokeWidth="3" />{v.deg === 90 && <rect x={cx} y={cy - 12} width="12" height="12" fill="none" stroke="#ffd166" strokeWidth="2" />}</svg>);
  }
  if (v.type === 'clock') {
    const ma = v.m * 6, ha = (v.h % 12) * 30 + v.m * 0.5;
    const pt = (deg: number, len: number) => [60 + len * Math.sin((deg * Math.PI) / 180), 60 - len * Math.cos((deg * Math.PI) / 180)];
    const [hx, hy] = pt(ha, 28), [mx, my] = pt(ma, 42);
    return (<svg viewBox="0 0 120 120" className="mx-auto my-2 w-44 h-44" role="img" aria-label="Horloge à aiguilles">
      <circle cx="60" cy="60" r="56" fill="#fff" stroke="#4a2fb0" strokeWidth="4" />
      {Array.from({ length: 60 }).map((_, i) => { const [x1, y1] = pt(i * 6, i % 5 ? 52 : 48), [x2, y2] = pt(i * 6, 54); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4a2fb0" strokeWidth={i % 5 ? 0.8 : 2} />; })}
      {Array.from({ length: 12 }).map((_, i) => { const [x, y] = pt((i + 1) * 30, 38); return <text key={i} x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#2b1b8a">{i + 1}</text>; })}
      <line x1="60" y1="60" x2={hx} y2={hy} stroke="#2b1b8a" strokeWidth="5" strokeLinecap="round" />
      <line x1="60" y1="60" x2={mx} y2={my} stroke="#e84a5f" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="60" r="3.5" fill="#2b1b8a" />
    </svg>);
  }
  return (<div className="mx-auto my-3 w-fit font-mono text-3xl bg-white/90 text-indigo-900 rounded-2xl px-6 py-3 text-right leading-tight">
    <div>{v.a}</div><div>{v.op} {v.b}</div><div className="border-t-4 border-indigo-900 mt-1">&nbsp;</div></div>);
}

function Keypad({ value, onChange, onSubmit, disabled }: { value: string; onChange: (s: string) => void; onSubmit: () => void; disabled: boolean }) {
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', ',', '0', '⌫'];
  return (<div className="grid grid-cols-3 gap-2 w-60 mx-auto" role="group" aria-label="Clavier numérique">
    {keys.map((k) => <button key={k} disabled={disabled} className="btn btn-ghost !py-2 !text-2xl" onClick={() => { sfx.click(); onChange(k === '⌫' ? value.slice(0, -1) : value.length < 12 ? value + k : value); }}>{k}</button>)}
    <button disabled={disabled || !value} className="btn btn-green col-span-3" onClick={onSubmit}>Valider ✓</button></div>);
}

type Phase = 'ask' | 'right' | 'retry' | 'reveal';
export interface PlayProps { level: LevelDef; mode: 'training' | 'exam'; review?: boolean; extraSkills?: LevelDef['plan']; onExit: () => void; onDone: (s: Summary) => void }

export default function LevelPlayer({ level, mode, review, onExit, onDone }: PlayProps) {
  const save = useSave();
  const rng = useMemo(() => makeRng(Date.now() & 0xffffff), []);
  const [queue, setQueue] = useState<{ ex: Exercise; base: boolean }[]>(() => Array.from({ length: level.count }, (_, i) => { const pl = level.plan[i % level.plan.length]; return { ex: generate(pl.skill, rng, pl.difficulty), base: true }; }));
  const [idx, setIdx] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [input, setInput] = useState('');
  const [tries, setTries] = useState(0);
  const [hints, setHints] = useState(0);
  const [phase, setPhase] = useState<Phase>('ask');
  const [ev, setEv] = useState<Ev>('idle');
  const [extras, setExtras] = useState(0);
  const t0 = useRef(Date.now());
  const exam = mode === 'exam';
  const cur = queue[idx];
  const done = items.filter((i) => i.correct).length;
  const progress = exam ? idx / queue.length : Math.min(1, done / level.count);

  useEffect(() => { t0.current = Date.now(); setInput(''); setTries(0); setHints(0); setPhase('ask'); setEv('idle'); if (cur) speak(cur.ex.prompt); return stopSpeaking; }, [idx]); // eslint-disable-line

  const finish = (all: Item[]) => onDone(finishLevel(level, mode, all, review));
  const advance = (all: Item[]) => { if (idx + 1 >= queue.length) finish(all); else setIdx(idx + 1); };

  const commit = (correct: boolean, firstTry: boolean, given: string, usedHints: number) => {
    const item: Item = { ex: cur.ex, correct, firstTry, given, hints: usedHints, base: cur.base };
    recordAttempt({ t: Date.now(), skill: cur.ex.skill, correct, hintsUsed: usedHints, ms: Date.now() - t0.current, levelId: level.id, mode, prompt: cur.ex.prompt, given, expected: cur.ex.answers[0] });
    const all = [...items, item]; setItems(all); return all;
  };

  const submit = (given: string) => {
    if (phase !== 'ask' && phase !== 'retry') return;
    const ok = isCorrect(cur.ex, given);
    if (exam) { advance(commit(ok, ok, given, 0)); return; }
    if (ok) { sfx.good(); setEv('good'); setPhase('right'); commit(true, tries === 0 && hints === 0, given, hints); return; }
    sfx.oops(); setEv('bad'); setInput('');
    if (tries === 0) { setTries(1); setPhase('retry'); setHints((h) => Math.max(h, 1)); }
    else {
      setPhase('reveal'); const all = commit(false, false, given, hints); void all;
      if (extras < 4) { const pl = level.plan.find((p) => p.skill === cur.ex.skill) ?? level.plan[0]; setQueue((q) => [...q, { ex: generate(pl.skill, rng, pl.difficulty), base: false }]); setExtras((e) => e + 1); }
    }
  };
  const next = () => { sfx.click(); advance(items); };

  if (!cur) return null;
  const shownHints = cur.ex.hints.slice(0, hints);
  const isChoice = cur.ex.kind === 'choice';
  const mimiMood = phase === 'right' ? 'win' : phase === 'reveal' || phase === 'retry' ? 'think' : 'happy';

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'linear-gradient(#2b1b8a,#4a2fb0 60%,#6a3df0)' }}>
      <div className="max-w-3xl mx-auto p-3 md:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <button className="btn btn-ghost !py-2 !text-base" onClick={() => { sfx.click(); onExit(); }}>← Quitter</button>
          <div className="text-center"><div className="font-extrabold text-xl">{level.title}</div><div className="text-sm opacity-80">{exam ? 'MODE EXAMEN — aucune aide' : `Question ${Math.min(idx + 1, queue.length)} sur ${queue.length}`}</div></div>
          <button className="btn btn-ghost !py-2 !text-base" aria-label="Lire la consigne à voix haute" title="Lire la consigne" onClick={() => { if (!save.settings.voice) update((s) => ({ ...s, settings: { ...s.settings, voice: true } })); setTimeout(() => speak(cur.ex.prompt), 50); }}><Ico n="speaker" s="1.2em" /></button>
        </div>
        <div className="h-3 rounded-full bg-black/30 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}><motion.div className="h-full bg-gradient-to-r from-amber-300 to-pink-400" animate={{ width: `${progress * 100}%` }} /></div>
        {!exam && <Stage w={level.id[0]} foe={({ g: 'Gobelin des mesures', m: 'Lutin des mots', f: 'Gobelin des formes', d: 'Robot curieux' } as Record<string, string>)[level.id[0]]} kind={level.game} progress={progress} ev={ev} save={save} boss={level.id.startsWith('g') ? 'Gardien des Grandeurs' : level.id.startsWith('m') ? 'Gardien des Mots' : level.id.startsWith('f') ? 'Gardien des Formes' : level.id.startsWith('d') ? 'Gardien des Découvertes' : undefined} />}

        {/* pas d'animation de sortie : l'ancienne carte ne doit jamais rester cliquable pendant que la question change */}
        <motion.div key={cur.ex.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="panel p-4 md:p-6">
            <p className="text-2xl md:text-3xl font-bold text-center leading-snug">{cur.ex.prompt}</p>
            <Visual ex={cur.ex} />
            {isChoice ? (
              <div className="flex flex-wrap justify-center gap-3 mt-3">
                {cur.ex.choices!.map((c) => <button key={c} disabled={phase === 'right' || phase === 'reveal'} className={`btn btn-violet min-w-[5rem] ${(FRENCH_SKILLS.includes(cur.ex.skill) || GEO_SKILLS.includes(cur.ex.skill) || DISC_SKILLS.includes(cur.ex.skill)) ? '!text-2xl' : '!text-3xl'}`} onClick={() => { sfx.click(); submit(c); }}>{GEO_SKILLS.includes(cur.ex.skill) || DISC_SKILLS.includes(cur.ex.skill) ? c : FRENCH_SKILLS.includes(cur.ex.skill) ? c.replace(/\|/g, ' · ') : /^[a-zé]+$/.test(c) ? c[0].toUpperCase() + c.slice(1) : c}</button>)}
              </div>
            ) : (
              <div className="mt-3">
                <input aria-label="Ta réponse" inputMode="decimal" autoComplete="off" disabled={phase === 'right' || phase === 'reveal'} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && input) submit(input); }}
                  className="block mx-auto w-60 text-center text-4xl font-extrabold rounded-2xl py-2 mb-3 bg-white text-indigo-900 focusable" placeholder="?" />
                <Keypad value={input} onChange={setInput} onSubmit={() => submit(input)} disabled={phase === 'right' || phase === 'reveal'} />
              </div>
            )}
        </motion.div>

        {!exam && (
          <div className="flex flex-col gap-2">
            {shownHints.map((h, i) => <MimiBubble key={i} mood="think"><Ico n="bulb" /> {h}</MimiBubble>)}
            {phase === 'right' && <MimiBubble mood="win"><b>Bravo Soumaya !</b> {hints === 0 && tries === 0 ? 'Sans aucune aide, impressionnant.' : 'Tu as réussi en cherchant : c’est comme ça qu’on progresse.'}</MimiBubble>}
            {phase === 'retry' && <MimiBubble mood="think">Pas tout à fait, ce n’est pas grave ! Lis mon indice et essaie encore.</MimiBubble>}
            {phase === 'reveal' && <MimiBubble mood="think"><b>Voyons ensemble.</b> {cur.ex.explanation} <span className="opacity-80">Je t’en redonnerai un semblable pour t’entraîner.</span></MimiBubble>}
            <div className="flex justify-center gap-3 mt-1">
              {(phase === 'ask' || phase === 'retry') && <button className="btn btn-gold" disabled={hints >= cur.ex.hints.length} onClick={() => { sfx.click(); setHints((h) => h + 1); }}><Ico n="bulb" /> Un indice de Mimi {hints >= cur.ex.hints.length ? '(plus d’indice)' : ''}</button>}
              {(phase === 'right' || phase === 'reveal') && <button className="btn btn-green" onClick={next} autoFocus>{idx + 1 >= queue.length ? 'Terminer ✓' : 'Suite →'}</button>}
            </div>
          </div>
        )}
        {exam && <p className="text-center opacity-80">Réponds du mieux que tu peux. Tu verras la correction à la fin.</p>}
      </div>
    </div>
  );
}
