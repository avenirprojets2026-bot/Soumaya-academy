// Écran de résultat : étoiles, message d'encouragement, récompenses et revue des corrections.
import { useEffect, useMemo, type ReactNode } from "react";
import { Check, Star, X } from "lucide-react";
import { Mimi, Soumaya } from "@/components/characters";
import { SceneArt } from "@/components/stage";
import { expected, questionText, type Stars, type Verdict } from "@/lib/engine";
import { hash, mulberry32 } from "@/lib/engine";
import type { PlayItem } from "@/components/player";
import type { Badge } from "@/lib/progress";
import { sfx } from "@/lib/fx";

export function Confetti({ seed = "c", count = 46 }: { seed?: string; count?: number }) {
  const bits = useMemo(() => {
    const r = mulberry32(hash(seed));
    const colors = [44, 8, 186, 300, 150, 24];
    return Array.from({ length: count }, () => ({ left: r() * 100, dur: 2.4 + r() * 2.4, delay: r() * 0.8, dx: (r() - 0.5) * 160, hue: colors[Math.floor(r() * colors.length)], w: 7 + r() * 7 }));
  }, [seed, count]);
  return (
    <div aria-hidden data-testid="confetti">
      {bits.map((b, i) => (
        <span key={i} className="confetti" style={{ left: `${b.left}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, background: `hsl(${b.hue} 90% 58%)`, width: b.w, ["--dx" as string]: `${b.dx}px` }} />
      ))}
    </div>
  );
}

export function StarRow({ n, size = 56 }: { n: Stars; size?: number }) {
  return (
    <div className="flex justify-center gap-2" role="img" aria-label={`${n} étoile${n > 1 ? "s" : ""} sur 3`} data-testid="result-stars" data-stars={n}>
      {[1, 2, 3].map((k) => (
        <Star key={k} aria-hidden style={{ width: size, height: size, animationDelay: `${k * 0.25}s` }} className={`anim-pop ${k <= n ? "fill-[hsl(44_100%_58%)] text-[hsl(36_90%_42%)] drop-shadow-[0_4px_8px_hsl(40_90%_40%/.6)]" : "fill-[hsl(40_30%_88%)] text-[hsl(40_20%_70%)]"} ${k === 2 ? "-mt-3" : ""}`} />
      ))}
    </div>
  );
}

export function Summary({
  scene, hue, pct, stars, headline, sub, items, verdicts, badges = [], actions, extra, celebrate,
}: {
  scene: string; hue: number; pct: number; stars?: Stars; headline: string; sub?: string;
  items: PlayItem[]; verdicts: Verdict[]; badges?: Badge[]; actions: ReactNode; extra?: ReactNode; celebrate?: boolean;
}) {
  const good = pct >= 60;
  useEffect(() => { sfx(good ? "win" : "star"); }, [good]);
  return (
    <div className="mx-auto max-w-2xl px-3 pb-10 pt-3" data-testid="summary">
      {celebrate && <Confetti seed={headline + pct} />}
      <SceneArt image={scene} hue={hue} className="h-[19rem] sm:h-[22rem]" strength={0.8}>
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 text-center text-white">
          <p className="font-display text-5xl font-black hero-title" data-testid="result-pct">{pct}<span className="text-2xl">%</span></p>
          <p className="font-display text-xl font-black hero-title">{headline}</p>
        </div>
        <div className="absolute left-3 top-3 z-10"><Mimi mood={good ? "joy" : "think"} size={74} /></div>
        <div className="absolute right-2 top-1 z-10 hidden sm:block"><Soumaya mood={good ? "joy" : "idle"} size={180} /></div>
      </SceneArt>
      <div className="parchment -mt-6 rounded-[1.75rem] p-5 text-center">
        {stars !== undefined && <StarRow n={stars} />}
        {sub && <p className="mt-3 text-lg font-bold leading-snug" data-testid="result-sub">{sub}</p>}
        {badges.length > 0 && (
          <ul className="mt-4 grid gap-2" aria-label="Nouvelles récompenses">
            {badges.map((b) => (
              <li key={b.id} className="anim-pop flex items-center gap-3 rounded-2xl bg-[hsl(44_100%_90%)] px-4 py-3 text-left" data-testid="new-badge">
                <span className="text-3xl" aria-hidden>{b.icon}</span>
                <span><strong className="block">Récompense : {b.name}</strong><span className="text-sm text-muted-foreground">{b.hint}</span></span>
              </li>
            ))}
          </ul>
        )}
        {extra}
        <div className="mt-5 grid gap-2.5">{actions}</div>
      </div>

      <section className="mt-6" aria-labelledby="review-title">
        <h2 id="review-title" className="font-display text-xl font-black">Mes corrections</h2>
        <ul className="mt-3 grid gap-2.5">
          {items.map((it, i) => {
            const v = verdicts[i];
            return (
              <li key={i}>
                <details className="parchment rounded-2xl" data-testid={`review-${i}`}>
                  <summary className="flex min-h-[56px] cursor-pointer items-center gap-3 px-3.5 py-2.5">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ${v?.correct ? "bg-[hsl(160_62%_34%)]" : v?.score ? "bg-[hsl(36_90%_46%)]" : "bg-[hsl(356_70%_50%)]"}`}>
                      {v?.correct ? <Check className="h-5 w-5" aria-label="juste" /> : <X className="h-5 w-5" aria-label="à revoir" />}
                    </span>
                    <span className="line-clamp-2 font-bold leading-snug">{questionText(it.q) || "Production"}</span>
                  </summary>
                  <div className="border-t border-[hsl(40_50%_86%)] px-4 py-3 text-[.98rem] leading-relaxed">
                    {!v?.correct && expected(it.q) && it.q.k !== "prod" && <p className="font-bold">Réponse attendue : <span className="rounded-lg bg-[hsl(44_100%_90%)] px-2 py-0.5">{expected(it.q)}</span></p>}
                    {it.q.k === "prod" && expected(it.q) && <p className="mb-1"><strong>Un exemple de réponse :</strong> {expected(it.q)}</p>}
                    <p className="mt-1">{it.q.e}</p>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
