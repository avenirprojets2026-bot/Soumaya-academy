import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speak, cancelSpeech, type Mood } from '../scene/voice';
import type { SeriesPlay } from './Series';
import { Ico } from './Icons';

/** Habillage « quête » des épreuves : décor, histoire de Mimi, sceaux à briser, final. Les pages et la correction restent celles de l'épreuve. */
export interface Quest { title: string; place: string; story: string; tips: string[]; color: string }

const GENERIC_TIPS = ['Lis toute la consigne, puis souligne les mots importants.', 'Si tu bloques, passe à la suite : tu reviendras ensuite.', 'Relis ta réponse avant de tourner la page.'];
const has = (s: string, re: RegExp) => re.test(s.toLowerCase());

export function questFor(play: SeriesPlay): Quest {
  const l = `${play.label} ${play.items[0]?.docTitre ?? ''}`;
  if (has(l, /histor|temps|fh/)) return { title: 'Le Sceau du Temps', place: 'Salle des Horloges anciennes', story: 'Les époques se sont mélangées dans la salle des horloges ! Remets l’histoire dans le bon ordre pour briser le sceau.', tips: ['Cherche les mots qui montrent le temps : avant, après, siècle, époque.', ...GENERIC_TIPS], color: '#f59e0b' };
  if (has(l, /science|investigation/)) return { title: 'Le Sceau de la Découverte', place: 'Laboratoire de la tour', story: 'Dans la tour des savants, une expérience a été interrompue. Observe, réfléchis, puis conclus comme une vraie exploratrice !', tips: ['Observe d’abord : que vois-tu ? que changes-tu ?', ...GENERIC_TIPS], color: '#22c55e' };
  if (has(l, /philo|citoyen/)) return { title: 'Le Sceau du Vivre-Ensemble', place: 'Grande salle du conseil', story: 'Le conseil du château discute. À toi de donner ton avis avec des mots justes et respectueux.', tips: ['Explique ton idée avec « parce que… ».', ...GENERIC_TIPS], color: '#ec4899' };
  if (has(l, /statist|donn|série.*statist/)) return { title: 'Le Sceau des Données', place: 'Bibliothèque des tableaux', story: 'Des tableaux et des graphiques se sont envolés. Lis-les bien pour les remettre en place !', tips: ['Regarde le titre et les légendes du tableau ou du graphique.', ...GENERIC_TIPS], color: '#3b82f6' };
  if (has(l, /écrire|parler|lire|français|mots/)) return { title: 'Le Sceau des Mots', place: 'Bibliothèque enchantée', story: 'Les mots du château sont en désordre. Lis, écris, et fais briller chaque phrase !', tips: ['Relis ta phrase à voix basse : sonne-t-elle bien ?', 'Vérifie les majuscules et les points.', ...GENERIC_TIPS], color: '#10b981' };
  if (has(l, /géom|forme/)) return { title: 'Le Sceau des Formes', place: 'Galerie des figures', story: 'Les figures de la galerie ont perdu leurs sommets. Aide-les à retrouver leur place !', tips: ['Prends ta règle et ton équerre si tu en as besoin.', ...GENERIC_TIPS], color: '#a855f7' };
  if (has(l, /grandeur|mesure/)) return { title: 'Le Sceau des Mesures', place: 'Salle des balances', story: 'La grande balance du château ne marque plus rien de juste. Mesure, compare et convertis !', tips: ['Écris toujours l’unité à côté du nombre.', ...GENERIC_TIPS], color: '#06b6d4' };
  return { title: 'Le Sceau du Calcul', place: 'Salle du Grand Calcul', story: 'Un sceau magique garde la porte du trésor. Chaque bonne réflexion le fait craquer un peu plus !', tips: ['Pose ton calcul sur le brouillon, étape par étape.', ...GENERIC_TIPS], color: '#f97316' };
}

const LINES: { m: Mood; t: string }[] = [
  { m: 'happy', t: 'Prends ton temps, {n}. Je suis là.' },
  { m: 'soft', t: 'Un sceau à la fois, c’est comme ça qu’on avance.' },
  { m: 'happy', t: 'Bien joué d’être arrivée jusqu’ici !' },
  { m: 'think', t: 'Relis doucement la consigne… et tu verras.' },
  { m: 'wow', t: 'Encore un sceau qui tremble !' },
];

export function useMimiSay(name: string) {
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; cancelSpeech(); }; }, []);
  return (text: string, mood: Mood = 'happy') => { if (alive.current) void speak(text.replace('{n}', name), mood); };
}

export function Mimi({ size = 56 }: { size?: number }) {
  return (<motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} aria-hidden style={{ width: size, height: size, filter: 'drop-shadow(0 0 10px #ffe27a)' }}>
    <svg viewBox="0 0 100 100"><polygon points="50,6 62,36 94,38 69,58 78,90 50,72 22,90 31,58 6,38 38,36" fill="#ffd23f" stroke="#f59e0b" strokeWidth="4" strokeLinejoin="round" /><circle cx="40" cy="48" r="4" fill="#5a3d00" /><circle cx="60" cy="48" r="4" fill="#5a3d00" /><path d="M41 60 Q50 68 59 60" stroke="#5a3d00" strokeWidth="4" fill="none" strokeLinecap="round" /></svg>
  </motion.div>);
}

/** Rangée de sceaux : un par page ; le sceau actuel brille, les précédents sont brisés. */
export function SealTrack({ count, at, color }: { count: number; at: number; color: string }) {
  return (<div className="flex flex-wrap gap-1.5 justify-center" role="img" aria-label={`Sceau ${at + 1} sur ${count}`}>
    {Array.from({ length: count }, (_, i) => (<motion.span key={i} animate={i === at ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={{ repeat: i === at ? Infinity : 0, duration: 1.6 }}
      className="inline-flex items-center justify-center rounded-full text-xs font-extrabold" style={{ width: 26, height: 26, background: i < at ? color : i === at ? '#fff' : 'rgba(255,255,255,.18)', color: i === at ? '#1b1050' : '#fff', border: `2px solid ${color}`, boxShadow: i === at ? `0 0 12px ${color}` : 'none' }}>{i < at ? '✓' : i + 1}</motion.span>))}
  </div>);
}

export function QuestIntro({ quest, name, onGo, onBack }: { quest: Quest; name: string; onGo: () => void; onBack: () => void }) {
  const say = useMimiSay(name);
  useEffect(() => { const t = window.setTimeout(() => say(`${quest.title}. ${quest.story}`, 'wow'), 400); return () => window.clearTimeout(t); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  return (
    <div className="h-full relative overflow-hidden flex items-center justify-center p-4" style={{ background: `radial-gradient(circle at 50% 30%, ${quest.color}55, #1b1050 70%)` }}>
      {Array.from({ length: 24 }, (_, i) => <motion.span key={i} className="absolute rounded-full bg-white" style={{ width: 3, height: 3, left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 2 + (i % 4), delay: (i % 5) * 0.3 }} />)}
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="panel max-w-xl w-full p-5 text-center relative" style={{ borderColor: quest.color, borderWidth: 3 }}>
        <div className="flex justify-center -mt-14 mb-1"><Mimi size={84} /></div>
        <div className="text-sm uppercase tracking-widest opacity-80">{quest.place}</div>
        <h1 className="text-3xl font-extrabold my-1" style={{ color: quest.color }}>{quest.title}</h1>
        <p className="text-lg my-3"><b className="text-amber-300">Mimi : </b>{quest.story}</p>
        <div className="flex gap-2 justify-center flex-wrap mt-3"><button className="btn btn-ghost" onClick={() => { cancelSpeech(); onBack(); }}>← Retour</button><button className="btn btn-gold !text-xl" onClick={() => { cancelSpeech(); onGo(); }}>Ouvrir le parchemin ▶</button></div>
      </motion.div>
    </div>);
}

/** Bulle de Mimi pendant l'épreuve : encouragement et méthode, jamais une réponse. */
export function MimiCoach({ quest, idx, name }: { quest: Quest; idx: number; name: string }) {
  const say = useMimiSay(name);
  const [tip, setTip] = useState<string | null>(null);
  useEffect(() => { setTip(null); }, [idx]);
  const line = LINES[idx % LINES.length];
  return (
    <div className="panel p-2 flex items-center gap-3" aria-live="polite">
      <Mimi size={44} />
      <div className="flex-1 min-w-0 text-base"><b className="text-amber-300">Mimi : </b>{tip ?? line.t.replace('{n}', name)}</div>
      <div className="flex gap-1 shrink-0">
        <button className="btn btn-ghost !py-1 !px-2 !text-sm" onClick={() => { const t = quest.tips[Math.floor(Math.random() * quest.tips.length)]; setTip(t); say(t, 'think'); }}>Conseil</button>
        <button className="btn btn-ghost !py-1 !px-2 !text-sm" aria-label="Écouter Mimi" onClick={() => say(tip ?? line.t, line.m)}><Ico n="speaker" /></button>
      </div>
    </div>);
}

export function QuestFinale({ quest, name, got, total, onDone }: { quest: Quest; name: string; got: number; total: number; onDone: () => void }) {
  const say = useMimiSay(name);
  const ratio = total > 0 ? got / total : 0;
  const msg = total === 0 ? `Quête terminée, ${name} ! Bravo pour ton travail.` : ratio >= 0.8 ? `Le sceau est brisé, ${name} ! Quelle exploratrice !` : ratio >= 0.5 ? `Beau travail, ${name} ! Le sceau est fissuré. On regardera ensemble ce qui reste.` : `Tu as été courageuse, ${name} ! On regarde ensemble les passages difficiles : c’est comme ça qu’on progresse.`;
  useEffect(() => { const t = window.setTimeout(() => say(msg, ratio >= 0.8 ? 'wow' : 'soft'), 500); return () => window.clearTimeout(t); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  return (
    <AnimatePresence>
      <div className="h-full flex items-center justify-center p-4" style={{ background: `radial-gradient(circle at 50% 35%, ${quest.color}66, #1b1050 70%)` }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="panel max-w-md w-full p-5 text-center" style={{ borderColor: quest.color, borderWidth: 3 }}>
          <motion.div initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="flex justify-center" aria-hidden><svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#ffd23f" strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2" fill="#f59e0b" /><path d="M8 11V7a4 4 0 0 1 7.5-2" /></svg></motion.div>
          <h1 className="text-3xl font-extrabold my-2" style={{ color: quest.color }}>{quest.title}</h1>
          <div className="flex justify-center"><Mimi size={70} /></div>
          <p className="text-lg my-2"><b className="text-amber-300">Mimi : </b>{msg}</p>
          {total > 0 && <p className="text-2xl font-extrabold">{String(got).replace('.', ',')} / {String(total).replace('.', ',')}</p>}
          <button className="btn btn-gold !text-xl mt-3" onClick={() => { cancelSpeech(); onDone(); }}>Retour au château ▶</button>
        </motion.div>
      </div>
    </AnimatePresence>);
}
