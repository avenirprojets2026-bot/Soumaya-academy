import { useCallback, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Player, type PlayResult } from "@/components/player";
import { Summary } from "@/components/summary";
import { Mimi } from "@/components/characters";
import { PageTitle } from "@/components/shell";
import { dueReviews, nextReviewDay, useProgress } from "@/lib/progress";
import { pctOf } from "@/lib/engine";

const SESSION = 10;
const fmt = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });

/** Accueil de la révision : les questions ratées reviennent à des dates espacées (demain, 3 jours, 1 semaine…). */
export default function RevisionPage() {
  const { save } = useProgress();
  const due = dueReviews(save);
  const all = Object.keys(save.review ?? {}).length;
  const next = nextReviewDay(save);
  return (
    <div className="mx-auto max-w-2xl pb-6">
      <PageTitle sub="Les questions ratées reviennent au bon moment, jusqu'à ce qu'elles soient bien sues.">Révision intelligente</PageTitle>
      <div className="px-3 sm:px-4">
        <section className="parchment relative flex items-center gap-4 rounded-[1.75rem] p-5" data-testid="review-card">
          <Mimi mood={due.length ? "think" : "joy"} size={96} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl font-black leading-tight" data-testid="review-count">
              {due.length > 0 ? `${due.length} question${due.length > 1 ? "s" : ""} à revoir` : "Rien à revoir aujourd'hui"}
            </p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {due.length > 0 ? `Une séance de ${Math.min(SESSION, due.length)} questions suffit.` : all === 0 ? "Joue quelques missions : les questions ratées apparaîtront ici." : next ? `Prochaine révision : ${fmt(next)}.` : "Tout est bien su."}
            </p>
          </div>
        </section>
        {due.length > 0 && <Link href="/revision/jouer" className="btn-royal mt-4 w-full" data-testid="button-start-review">Réviser maintenant <ArrowRight className="h-5 w-5" aria-hidden /></Link>}
        <p className="mt-4 rounded-2xl bg-white/70 p-4 text-sm font-semibold leading-snug">
          Comment ça marche : une question ratée revient le jour même. Réussie, elle revient 1 jour, 3 jours, 1 semaine, 2 semaines puis 1 mois plus tard, avant de disparaître. Raté, elle repart au début.
        </p>
        <Link href="/" className="btn-ghost mt-3 w-full" data-testid="link-home">Accueil</Link>
      </div>
    </div>
  );
}

export function RevisionPlay() {
  const { save, noteResults } = useProgress();
  const [, go] = useLocation();
  const [attempt] = useState(1);
  const items = useMemo(() => dueReviews(save).slice(0, SESSION).map((r) => ({ q: r.q, tag: "Révision" })), []); // figé au démarrage
  const [result, setResult] = useState<(PlayResult & { pct: number }) | null>(null);
  const done = useRef(false);

  const onFinish = useCallback((r: PlayResult) => {
    if (!done.current) { done.current = true; noteResults(r.items, r.verdicts, "revision"); }
    setResult({ ...r, pct: pctOf(r.verdicts) });
  }, [noteResults]);

  if (items.length === 0) { go("/revision"); return null; }

  if (result) {
    const ok = result.verdicts.filter((v) => v.score >= 1).length;
    return (
      <Summary
        scene="defis.webp" hue={270} pct={result.pct} headline={result.pct >= 80 ? "Mémoire de championne !" : result.pct >= 50 ? "Ça s'installe" : "On y revient bientôt"}
        sub={`${ok} réussie${ok > 1 ? "s" : ""} sur ${result.items.length}. Les réussies reviennent plus tard, les ratées demain.`} celebrate={result.pct >= 80}
        items={result.items} verdicts={result.verdicts}
        actions={<>
          <Link href="/revision" className="btn-royal" data-testid="button-back-review"><RotateCcw className="h-5 w-5" aria-hidden /> Retour à la révision</Link>
          <Link href="/" className="btn-ghost" data-testid="button-home">Accueil</Link>
        </>}
      />
    );
  }
  return <Player key={attempt} items={items} seed={`rev-${attempt}`} mode="mission" title="Révision intelligente" accent={270} onExit={() => go("/revision")} onFinish={onFinish} />;
}

