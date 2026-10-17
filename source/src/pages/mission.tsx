import { useCallback, useMemo, useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import { Mimi } from "@/components/characters";
import { Player, TextBody, type PlayResult } from "@/components/player";
import { Summary } from "@/components/summary";
import { SceneArt } from "@/components/stage";
import { CLASSIC_GROUPS, findMission, nextMission, worldOfMission } from "@/data/catalog";
import { isUnlocked, useProgress, type MissionOutcome } from "@/lib/progress";
import { pctOf, starsOf } from "@/lib/engine";
import { speak } from "@/lib/fx";
import NotFound from "@/pages/not-found";

type Phase = "intro" | "play" | "done";

export default function MissionPage() {
  const [, params] = useRoute("/mission/:id");
  const [, go] = useLocation();
  const { save, record, noteResults } = useProgress();
  const mission = params ? findMission(params.id) : undefined;
  const world = mission ? worldOfMission(mission.id) : undefined;
  const classic = mission && !world ? CLASSIC_GROUPS.find((g) => g.missions.some((m) => m.id === mission.id)) : undefined;
  const [phase, setPhase] = useState<Phase>(mission?.text ? "intro" : "play");
  const [attempt, setAttempt] = useState(1);
  const [result, setResult] = useState<(PlayResult & { pct: number; outcome: MissionOutcome }) | null>(null);
  const recorded = useRef<string>("");
  const stop = useRef<() => void>(() => undefined);
  const [reading, setReading] = useState(false);

  const items = useMemo(() => (mission ? mission.qs.map((q) => ({ q, tag: mission.title })) : []), [mission]);
  const accent = world?.hue ?? classic?.hue ?? 186;
  const scene = world?.scene ?? "defis.webp";

  const onFinish = useCallback((r: PlayResult) => {
    if (!mission) return;
    const pct = pctOf(r.verdicts);
    const key = `${mission.id}#${attempt}`;
    const ok = r.verdicts.reduce((s, v) => s + v.score, 0);
    // Une seule inscription par partie, même si le composant se rend deux fois
    const first = recorded.current !== key;
    const outcome = recorded.current === key ? ({ previous: 0, isNewBest: false, stars: starsOf(pct), previousStars: 0, newBadges: [] } as MissionOutcome) : record(mission.id, pct, world?.id ?? "classiques", ok, r.verdicts.length);
    recorded.current = key;
    if (first) noteResults(r.items, r.verdicts, world?.id ?? "classiques");
    setResult({ ...r, pct, outcome });
    setPhase("done");
  }, [mission, attempt, record, noteResults, world]);

  if (!mission) return <NotFound />;

  const exit = () => { stop.current(); go(world ? `/monde/${world.id}` : "/entrainement"); };
  const nx = world ? nextMission(mission.id) : undefined;
  const nxOpen = nx && world ? (isUnlocked({ ...save }, world, nx.level) || (result?.pct ?? 0) >= 60) : false;

  if (phase === "intro" && mission.text) {
    return (
      <div className="mx-auto max-w-2xl px-3 pb-10 pt-3" id="contenu">
        <SceneArt image={scene} hue={accent} className="h-48 sm:h-60" strength={0.8}>
          <div className="absolute right-3 top-3 z-10"><Mimi mood="think" size={84} /></div>
          <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-4 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[hsl(44_100%_82%)] hero-title">Niveau {mission.level} · {world?.subject ?? classic?.subject}</p>
            <h1 className="font-display text-3xl font-black leading-tight hero-title" data-testid="mission-title">{mission.title}</h1>
          </div>
        </SceneArt>
        <div className="parchment -mt-5 rounded-[1.75rem] p-5">
          <p className="font-bold leading-snug">{mission.intro}</p>
          <h2 className="mt-4 flex items-center gap-2 font-display text-xl font-black"><BookOpen className="h-5 w-5" aria-hidden /> {mission.text.title}</h2>
          <div className="mt-2">
            <TextBody text={mission.text} speaking={reading} onRead={() => {
              if (reading) { stop.current(); setReading(false); return; }
              setReading(true);
              stop.current = speak(`${mission.text!.title}. ${mission.text!.body.join(" ")}`, { onEnd: () => setReading(false) });
            }} />
          </div>
          {mission.text.source && <p className="mt-3 text-xs text-muted-foreground">{mission.text.source}</p>}
          <p className="mt-4 text-sm font-semibold text-muted-foreground">Tu pourras relire le texte pendant les questions avec le bouton « livre ».</p>
          <div className="mt-4 grid gap-2.5">
            <button type="button" className="btn-royal" onClick={() => { stop.current(); setReading(false); setPhase("play"); }} data-testid="button-start">J'ai lu, je commence <ArrowRight className="h-5 w-5" aria-hidden /></button>
            <Link href={world ? `/monde/${world.id}` : "/entrainement"} className="btn-ghost" data-testid="link-back">Retour</Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    const { pct, outcome } = result;
    const headline = pct >= 95 ? "Parfait, sans faute !" : pct >= 80 ? "Superbe travail !" : pct >= 60 ? "Bravo, niveau réussi !" : "Courage, on recommence ?";
    const sub = pct >= 60
      ? outcome.isNewBest && outcome.stars > outcome.previousStars ? `Tu gagnes ${outcome.stars - outcome.previousStars} étoile${outcome.stars - outcome.previousStars > 1 ? "s" : ""} !` : "Ton meilleur score est gardé."
      : "Relis les corrections ci-dessous, puis rejoue : chaque essai te rend plus forte.";
    return (
      <Summary
        scene={scene} hue={accent} pct={pct} stars={starsOf(pct)} headline={headline} sub={sub} celebrate={pct >= 80}
        items={result.items} verdicts={result.verdicts} badges={outcome.newBadges}
        actions={
          <>
            {pct >= 60 && nx && nxOpen && <Link href={`/mission/${nx.id}`} className="btn-royal" data-testid="button-next-level">Niveau suivant <ArrowRight className="h-5 w-5" aria-hidden /></Link>}
            <button type="button" className={pct >= 60 && nx ? "btn-ghost" : "btn-royal"} data-testid="button-replay" onClick={() => { setAttempt((a) => a + 1); setResult(null); setPhase("play"); }}><RotateCcw className="h-5 w-5" aria-hidden /> Rejouer ce niveau</button>
            <Link href={world ? `/monde/${world.id}` : "/entrainement"} className="btn-ghost" data-testid="button-back-world">{world ? "Retour au monde" : "Retour à l'entraînement"}</Link>
            <Link href="/" className="btn-ghost" data-testid="button-home">Accueil</Link>
          </>
        }
      />
    );
  }

  return (
    <Player
      key={`${mission.id}-${attempt}`} items={items} seed={`${mission.id}-${attempt}`} mode="mission" title={mission.title}
      text={mission.text} accent={accent} onExit={exit} onFinish={onFinish}
    />
  );
}
