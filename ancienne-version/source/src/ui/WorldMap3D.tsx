import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MapEngine } from '../scene/engine';
import { REALMS, realmById, type RealmId } from '../scene/realms';
import { speak, cancelSpeech, setVoiceEnabled, voiceEnabled, type Mood } from '../scene/voice';
import { playIntro, arrive } from '../scene/story';
import { WORLD_LEVELS } from '../engine/levels';
import { HEROES } from './Characters';
import { totalStars, useSave } from '../store/save';
import { sfx } from '../engine/sfx';
import { Ico } from './Icons';
import type { Nav } from './Screens';

const INTRO_KEY = 'soumaya-intro-v1';
const POS_KEY = 'soumaya-map-pos-v1';
const seenIntro = () => { try { return localStorage.getItem(INTRO_KEY) === '1'; } catch { return false; } };
const lastRealm = (): RealmId => { try { const v = Number(localStorage.getItem(POS_KEY)); return (v >= 1 && v <= 6 ? v : 1) as RealmId; } catch { return 1; } };
const hasWebGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } };

export default function WorldMap3D({ nav, fallback }: { nav: Nav; fallback: React.ReactNode }) {
  const save = useSave();
  const canvas = useRef<HTMLCanvasElement>(null);
  const eng = useRef<MapEngine | null>(null);
  const run = useRef(0); // identifiant de la séquence en cours : toute nouvelle séquence annule la précédente
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(() => !hasWebGL());
  const [sel, setSel] = useState<RealmId | null>(null);
  const [sub, setSub] = useState<{ text: string; mood: Mood } | null>(null);
  const [cine, setCine] = useState(false);
  const [vo, setVo] = useState(voiceEnabled());
  const name = (save.profile.name || 'toi').trim();
  const nameRef = useRef(name); nameRef.current = name;

  const say = useCallback(async (text: string, mood: Mood = 'happy') => { setSub({ text, mood }); await speak(text, mood); }, []);

  const progress = useCallback((): Record<number, string> => {
    const out: Record<number, string> = {};
    for (const w of [1, 2, 3, 4, 5] as const) { const lv = WORLD_LEVELS[w]; const got = lv.reduce((n, l) => n + (save.levels[l.id]?.stars ?? 0), 0); out[w] = `★ ${got} / ${lv.length * 3}`; }
    out[6] = save.seriesRuns.length ? `${save.seriesRuns.length} épreuve${save.seriesRuns.length > 1 ? 's' : ''} faite${save.seriesRuns.length > 1 ? 's' : ''}` : 'Séries et épreuves';
    return out;
  }, [save.levels, save.seriesRuns]);

  const stop = useCallback(() => { run.current++; cancelSpeech(); eng.current?.abort(); setCine(false); }, []);

  // création / destruction de la scène
  useEffect(() => {
    if (failed || !canvas.current) return;
    let dead = false; let engine: MapEngine | null = null;
    import('../scene/engine').then(({ MapEngine }) => {
      if (dead || !canvas.current) return;
      try {
        engine = new MapEngine({ canvas: canvas.current, reduceMotion: save.settings.reduceMotion, onSelect: (id) => select(id) });
      } catch { setFailed(true); return; }
      eng.current = engine; (window as unknown as { __soumayaMap?: MapEngine }).__soumayaMap = engine; const h = HEROES[save.profile.avatarId] ?? HEROES[0];
      engine.setHero({ skin: h.skin, hair: h.hair, style: h.style }, save.profile.outfit, save.profile.accessory); engine.setProgress(progress());
      engine.teleportHero(lastRealm()); engine.cutTo(engine.overviewShot()); engine.setOverviewMode(); setReady(true);
      const id = ++run.current;
      const cin = { engine, say: async (t: string, m?: Mood) => { if (run.current === id) await say(t, m); }, name: nameRef.current, live: () => run.current === id && !dead };
      if (!seenIntro()) {
        setCine(true);
        window.setTimeout(() => { if (!cin.live()) return; playIntro(cin).then(() => { try { localStorage.setItem(INTRO_KEY, '1'); } catch { /* ignore */ } if (cin.live()) { engine!.setMimiMode('follow'); engine!.setOverviewMode(); setSub(null); setCine(false); } }); }, 600);
      } else {
        window.setTimeout(() => { if (cin.live()) { engine!.mimiLook('happy'); void cin.say(`Content de te revoir, ${nameRef.current} ! Où va-t-on aujourd’hui ?`, 'happy').then(() => { if (cin.live()) setSub(null); }); } }, 700);
      }
    }).catch(() => setFailed(true));
    return () => { dead = true; run.current++; cancelSpeech(); engine?.dispose(); eng.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failed]);

  // mise à jour de l'héroïne et des étiquettes
  useEffect(() => { const h = HEROES[save.profile.avatarId] ?? HEROES[0]; eng.current?.setHero({ skin: h.skin, hair: h.hair, style: h.style }, save.profile.outfit, save.profile.accessory); }, [save.profile, ready]);
  useEffect(() => { eng.current?.setProgress(progress()); }, [progress, ready]);
  useEffect(() => { eng.current?.setReduce(save.settings.reduceMotion); }, [save.settings.reduceMotion]);

  const select = useCallback((id: RealmId | null) => {
    const e = eng.current; if (!e) return;
    const id2 = ++run.current; cancelSpeech(); e.abort(); setCine(false);
    if (id == null) { setSel(null); setSub(null); e.setMimiMode('follow'); void e.toOverview().then(() => { if (run.current === id2) e.setOverviewMode(); }); return; }
    sfx.click(); setSel(id); try { localStorage.setItem(POS_KEY, String(id)); } catch { /* ignore */ }
    const cin = { engine: e, say: async (t: string, m?: Mood) => { if (run.current === id2) await say(t, m); }, name: nameRef.current, live: () => run.current === id2 };
    void arrive(cin, id).then(() => { if (run.current === id2) setSub(null); });
  }, [say]);

  const replay = () => {
    const e = eng.current; if (!e) return; const id = ++run.current; cancelSpeech(); e.abort(); setSel(null); setCine(true);
    const cin = { engine: e, say: async (t: string, m?: Mood) => { if (run.current === id) await say(t, m); }, name: nameRef.current, live: () => run.current === id };
    void playIntro(cin).then(() => { if (cin.live()) { e.setMimiMode('follow'); e.setOverviewMode(); setSub(null); setCine(false); } });
  };
  const skip = () => { stop(); const e = eng.current; if (e) { e.setMimiMode('follow'); void e.toOverview(1).then(() => e.setOverviewMode()); } setSub(null); try { localStorage.setItem(INTRO_KEY, '1'); } catch { /* ignore */ } };
  const enter = (id: RealmId) => { sfx.click(); stop(); nav.go(realmById(id).screen); };

  if (failed) return <>{fallback}</>;
  const stars = totalStars(save); const r = sel ? realmById(sel) : null;
  const toggleVoice = () => { const v = !vo; setVo(v); setVoiceEnabled(v); };

  return (
    <div className="h-full relative overflow-hidden bg-[#1b1050] select-none">
      <canvas ref={canvas} className="absolute inset-0 w-full h-full touch-none" aria-label="Carte des mondes en 3D : touche un royaume pour y aller" role="img" />
      {!ready && <div className="absolute inset-0 flex items-center justify-center text-xl font-bold pointer-events-none">Mimi prépare les royaumes…</div>}
      {/* barre du haut */}
      <div className="absolute top-0 inset-x-0 p-2 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button className="btn btn-ghost !py-1 !text-base" onClick={() => { stop(); nav.go('welcome'); }}>← Accueil</button>
          <button className="btn btn-violet !py-1 !text-base" onClick={() => { stop(); sfx.click(); nav.go('avatar'); }}>Mon héros</button>
        </div>
        <div className="flex gap-2 pointer-events-auto items-center">
          <button className="btn btn-ghost !py-1 !px-3 !text-base" aria-pressed={vo} aria-label={vo ? 'Couper la voix de Mimi' : 'Activer la voix de Mimi'} onClick={toggleVoice}>{vo ? <Ico n="speaker" /> : '🔇'}</button>
          {!cine && <button className="btn btn-ghost !py-1 !px-3 !text-base" onClick={replay} aria-label="Revoir l’introduction">▶ Intro</button>}
          <div className="panel px-3 py-1 font-bold flex items-center gap-1"><Ico n="star" /> {stars}</div>
          <div className="panel px-3 py-1 font-bold flex items-center gap-1"><Ico n="coin" /> {save.coins}</div>
        </div>
      </div>
      {/* choix rapide au clavier / lecteur d'écran : mêmes destinations que les îles */}
      <ul className="sr-only">{REALMS.map((x) => <li key={x.id}><button onClick={() => select(x.id)}>{x.name}</button></li>)}</ul>
      {cine && <div className="absolute top-14 right-3 pointer-events-auto"><button className="btn btn-gold !py-1 !text-base" onClick={skip}>Passer ›</button></div>}
      {/* sous-titres de Mimi */}
      <AnimatePresence>
        {sub && (
          <motion.div key="sub" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-x-0 bottom-0 p-3 flex justify-center pointer-events-none" style={{ paddingBottom: r ? '9.5rem' : undefined }}>
            <div className="panel max-w-2xl w-full px-4 py-3 text-lg md:text-xl leading-snug relative ml-0 md:ml-24" aria-live="polite"><span className="font-extrabold text-amber-300">Mimi : </span>{sub.text}</div>
          </motion.div>)}
      </AnimatePresence>
      {/* carte du royaume */}
      <AnimatePresence>
        {r && (
          <motion.div key={r.id} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="absolute inset-x-0 bottom-0 p-2 flex justify-center pointer-events-none">
            <div className="panel max-w-2xl w-full p-3 pointer-events-auto" style={{ borderColor: r.color, borderWidth: 3 }}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0"><div className="text-xl md:text-2xl font-extrabold" style={{ color: r.color }}>{r.name}</div><div className="text-sm opacity-90">{r.learns}</div></div>
                <div className="flex gap-2 shrink-0">
                  <button className="btn btn-ghost !py-2 !text-base" onClick={() => select(null)}>↩ Carte</button>
                  <button className="btn btn-gold !py-2 !text-lg" onClick={() => enter(r.id)}>Entrer ▶</button>
                </div>
              </div>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </div>
  );
}
