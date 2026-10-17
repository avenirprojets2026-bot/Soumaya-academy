import { Link, useRoute } from "wouter";
import { ArrowLeft, Lock, Play } from "lucide-react";
import { Mimi } from "@/components/characters";
import { SceneArt } from "@/components/stage";
import { StarCount, Stars3 } from "@/components/shell";
import { LEVEL_BANDS, findWorld } from "@/data/catalog";
import { isUnlocked, passed, starsFor, useProgress, worldStars } from "@/lib/progress";
import { openMission } from "@/lib/suggest";
import NotFound from "@/pages/not-found";

export default function WorldPage() {
  const [, params] = useRoute("/monde/:id");
  const { save } = useProgress();
  const w = params ? findWorld(params.id) : undefined;
  if (!w) return <NotFound />;
  const next = openMission(save, w);
  const stars = worldStars(save, w);
  const hasText = (m: (typeof w.missions)[number]) => !!m.text;
  return (
    <div className="mx-auto max-w-5xl pb-6">
      <SceneArt image={w.scene} hue={w.hue} className="mx-3 mt-3 h-[17rem] sm:mx-4 sm:h-[21rem]" strength={0.9}>
        <Link href="/aventure" className="glass absolute left-3 top-3 z-10 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 font-extrabold" data-testid="link-back-map">
          <ArrowLeft className="h-5 w-5" aria-hidden /> Carte
        </Link>
        <div className="absolute right-3 top-3 z-10"><Mimi mood="idle" size={78} /></div>
        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-4 text-white">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[hsl(44_100%_82%)] hero-title">{w.subject}</p>
          <h1 className="font-display text-3xl font-black leading-tight hero-title sm:text-4xl" data-testid="world-title">{w.name}</h1>
        </div>
      </SceneArt>

      <div className="px-3 sm:px-4">
        <div className="parchment relative z-10 -mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] p-4">
          <p className="min-w-[12rem] flex-1 font-semibold leading-snug">{w.tagline}</p>
          <div className="flex items-center gap-3">
            <StarCount n={stars} max={w.missions.length * 3} />
            <Link href={`/mission/${next.id}`} className="btn-royal !min-h-[48px]" data-testid="button-play-next"><Play className="h-5 w-5" aria-hidden /> Jouer</Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {LEVEL_BANDS.map((band) => {
            const ms = w.missions.filter((m) => m.level >= band.from && m.level <= band.to);
            return (
              <section key={band.id} aria-labelledby={`band-${band.id}`} className={band.id === "p5" ? "lg:col-span-2" : ""}>
                <h2 id={`band-${band.id}`} className="mb-2 font-display text-lg font-black text-[hsl(var(--deep))]">{band.label}</h2>
                <ol className="trail" data-testid={`trail-${band.id}`}>
                  {ms.map((m) => {
                    const open = isUnlocked(save, w, m.level);
                    const st = starsFor(save, m.id);
                    const best = save.best[m.id];
                    const ok = passed(save, m.id);
                    return (
                      <li key={m.id}>
                        {open ? (
                          <Link href={`/mission/${m.id}`} className="node parchment" data-testid={`level-${m.level}`} data-state={ok ? "done" : "open"}>
                            <Badge level={m.level} hue={w.hue} done={ok} />
                            <NodeText title={m.title} intro={m.intro} meta={`${m.qs.length} questions${hasText(m) ? " · avec un texte" : ""}${best !== undefined ? ` · meilleur : ${best} %` : ""}`} />
                            <Stars3 value={st} />
                          </Link>
                        ) : (
                          <button type="button" disabled className="node parchment" data-testid={`level-${m.level}`} data-state="locked" aria-label={`Niveau ${m.level} verrouillé : réussis le niveau ${m.level - 1} avec au moins 60 %`}>
                            <span className="node-badge bg-[hsl(200_20%_60%)]"><Lock className="h-5 w-5" aria-hidden /></span>
                            <NodeText title={m.title} intro={`Réussis le niveau ${m.level - 1} (60 %) pour l'ouvrir.`} />
                            <span />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Badge({ level, hue, done }: { level: number; hue: number; done: boolean }) {
  return (
    <span className="node-badge" style={{ background: done ? "linear-gradient(160deg, hsl(160 62% 42%), hsl(166 70% 26%))" : `linear-gradient(160deg, hsl(${hue} 70% 56%), hsl(${hue} 70% 32%))` }}>{level}</span>
  );
}
function NodeText({ title, intro, meta }: { title: string; intro: string; meta?: string }) {
  return (
    <span className="min-w-0">
      <span className="block font-display text-[1.08rem] font-black leading-tight">{title}</span>
      <span className="line-clamp-2 block text-[.9rem] leading-snug text-muted-foreground">{intro}</span>
      {meta && <span className="mt-0.5 block text-xs font-extrabold text-[hsl(186_60%_26%)]">{meta}</span>}
    </span>
  );
}
