import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AvatarPick, ResultScreen, Settings, Welcome, WorldLevels, WorldMap, type Nav, type Screen } from './ui/Screens';
import LevelPlayer from './ui/LevelPlayer';
import WorldMap3D from './ui/WorldMap3D';
import Parent from './ui/Parent';
import { SeriesHub, SeriesPlayer, type SeriesPlay } from './ui/Series';
import { EXAM_NOMBRES, type LevelDef } from './engine/levels';
import type { Summary } from './store/progress';
import { useSave } from './store/save';
import { setMusic, sfx } from './engine/sfx';

interface Play { level: LevelDef; mode: 'training' | 'exam'; review?: boolean; key: number }

export default function App() {
  const save = useSave();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [play, setPlay] = useState<Play | null>(null);
  const [sp, setSp] = useState<SeriesPlay | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [startedAt] = useState(Date.now());
  const [breakShown, setBreakShown] = useState(false);

  useEffect(() => { document.documentElement.style.fontSize = save.settings.bigText ? '18px' : '16px'; }, [save.settings.bigText]);
  useEffect(() => { const h = () => { if (save.settings.music) setMusic(true); window.removeEventListener('pointerdown', h); }; window.addEventListener('pointerdown', h); return () => window.removeEventListener('pointerdown', h); }, [save.settings.music]);
  useEffect(() => { setMusic(save.settings.music); }, [save.settings.music]);

  const nav: Nav = {
    go: (s) => { setSp(null); setPlay(null); setSummary(null); setScreen(s); },
    play: (level, mode, review) => { setSummary(null); setPlay({ level, mode, review, key: Date.now() }); },
    series: (p) => { setSummary(null); setPlay(null); setSp(p); },
    exam: () => { setSummary(null); setPlay({ level: EXAM_NOMBRES, mode: 'exam', key: Date.now() }); },
  };
  const overTime = Date.now() - startedAt > save.settings.sessionMin * 60000;

  let view: React.ReactNode;
  if (sp) view = <SeriesPlayer key={sp.ref} play={sp} onExit={() => setSp(null)} onSaved={() => { setSp(null); setScreen('castle'); }} />;
  else if (summary) view = (
    <>
      <ResultScreen s={summary} nav={nav} onAgain={() => { const s = summary; setSummary(null); setPlay({ level: s.level, mode: s.mode, key: Date.now() }); }} />
      {overTime && !breakShown && (<div className="fixed inset-x-0 bottom-0 p-3 flex justify-center"><div className="panel px-4 py-3 text-lg">⏸ Tu joues depuis plus de {save.settings.sessionMin} minutes : une petite pause te fera du bien ! <button className="btn btn-gold !py-1 !text-base ml-2" onClick={() => setBreakShown(true)}>OK</button></div></div>)}
    </>);
  else if (play) view = <LevelPlayer key={play.key} level={play.level} mode={play.mode} review={play.review} onExit={() => setPlay(null)} onDone={(s) => { if (s.stars > s.prevStars || s.mode === 'exam') sfx.win(); setSummary(s); setPlay(null); }} />;
  else view = ({ welcome: <Welcome nav={nav} />, avatar: <AvatarPick nav={nav} />, map: <WorldMap3D nav={nav} fallback={<WorldMap nav={nav} />} />, world1: <WorldLevels nav={nav} worldId={1} />, world2: <WorldLevels nav={nav} worldId={2} />, world3: <WorldLevels nav={nav} worldId={3} />, world4: <WorldLevels nav={nav} worldId={4} />, world5: <WorldLevels nav={nav} worldId={5} />, castle: <SeriesHub nav={nav} />, settings: <Settings nav={nav} />, parent: <Parent nav={nav} /> } as Record<Screen, React.ReactNode>)[screen];

  const k = sp ? 'sp' + sp.ref : summary ? 'sum' : play ? 'play' + play.key : screen;
  return <AnimatePresence mode="wait"><motion.div key={k} className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>{view}</motion.div></AnimatePresence>;
}
