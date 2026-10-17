import { Link } from "wouter";
import { ArrowRight, Flame, Sparkles, Star, Trophy } from "lucide-react";
import { Duo } from "@/components/characters";
import { SceneArt } from "@/components/stage";
import { WorldIcon, pinGradient } from "@/components/world-icon";
import { MAX_STARS, dueReviews, rankOf, streak, totalStars, useProgress } from "@/lib/progress";
import { dailyChallenge, suggestContinue } from "@/lib/suggest";
import { starsOf } from "@/lib/engine";
import { Stars3 } from "@/components/shell";
import { PANORAMA } from "@/data/adventure-assets";

function greeting(h: number) {
  if (h < 5) return "Déjà debout ? Mimi bâille avec toi.";
  if (h < 12) return "Bonjour Soumaya ! Prête pour une aventure ?";
  if (h < 18) return "Bon après-midi, Soumaya ! On y va ?";
  return "Bonsoir Soumaya ! Une dernière mission ?";
}

export default function HomePage() {
  const { save } = useProgress();
  const stars = totalStars(save);
  const rank = rankOf(stars);
  const cont = suggestContinue(save);
  const daily = dailyChallenge(save);
  const first = Object.keys(save.best).length === 0;
  const days = streak(save);
  const due = dueReviews(save).length;
  return (
    <div className="mx-auto max-w-5xl pb-6">
      <SceneArt image={PANORAMA.file} hue={44} focus="50% 40%" className="mx-3 mt-3 h-[62dvh] min-h-[460px] max-h-[620px] sm:mx-4" strength={1.1}>
        <div className="absolute inset-x-0 top-0 z-10 px-5 pt-5 text-center text-white">
          <p className="text-sm font-extrabold uppercase tracking-[.22em] text-[hsl(44_100%_82%)] hero-title">Le château des savoirs · v3.0</p>
          <h1 className="font-display text-[2.6rem] font-black leading-none hero-title sm:text-6xl">Soumaya<span className="block text-[hsl(44_100%_72%)]">Academy</span></h1>
        </div>
        <Duo mood="idle" size={290} speech={first ? "Bienvenue ! Choisis ton aventure." : greeting(new Date().getHours())} />
      </SceneArt>

      <div className="relative z-10 -mt-7 grid grid-cols-1 gap-3 px-3 sm:px-4 md:grid-cols-2">
        <Link href={`/mission/${cont.mission.id}`} className="parchment anim-enter group flex items-center gap-4 rounded-[1.75rem] p-4 md:col-span-2" data-testid="card-continue">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-white shadow-lg" style={{ background: pinGradient(cont.world.hue) }}>
            <WorldIcon icon={cont.world.icon} className="h-8 w-8" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">{first ? "Pour commencer" : "Continuer l'aventure"}</span>
            <span className="block font-display text-xl font-black leading-tight">{cont.mission.title}</span>
            <span className="block text-sm font-semibold text-muted-foreground">{cont.world.name} · niveau {cont.mission.level}</span>
          </span>
          <span className="btn-royal !min-h-[52px] !px-4 shrink-0" data-testid="button-play"><span className="max-[400px]:sr-only">Jouer</span> <ArrowRight className="h-5 w-5" aria-hidden /></span>
        </Link>

        <Link href={`/mission/${daily.mission.id}`} className="parchment anim-enter flex items-center gap-3 rounded-[1.5rem] p-4" data-testid="card-daily">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[hsl(44_100%_80%)]"><Sparkles className="h-6 w-6 text-[hsl(30_70%_28%)]" aria-hidden /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Défi du jour</span>
            <span className="block truncate font-bold leading-tight">{daily.mission.title}</span>
            <span className="block text-sm text-muted-foreground">{daily.world.subject}</span>
          </span>
          <Stars3 value={starsOf(save.best[daily.mission.id] ?? 0)} size="h-4 w-4" />
        </Link>

        {due > 0 && (
          <Link href="/revision" className="parchment anim-enter flex items-center gap-3 rounded-[1.5rem] p-4 md:col-span-2" data-testid="card-review">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[hsl(270_80%_90%)]"><Sparkles className="h-6 w-6 text-[hsl(270_60%_34%)]" aria-hidden /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Révision intelligente</span>
              <span className="block font-bold leading-tight">{due} question{due > 1 ? "s" : ""} à revoir aujourd'hui</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
          </Link>
        )}

        <Link href="/carnet" className="parchment anim-enter flex items-center gap-3 rounded-[1.5rem] p-4" data-testid="card-rank">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[hsl(186_70%_88%)]"><Trophy className="h-6 w-6 text-[hsl(186_72%_24%)]" aria-hidden /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Mon rang</span>
            <span className="block truncate font-bold leading-tight" data-testid="text-rank">{rank.name}</span>
            <span className="flex items-center gap-3 text-sm font-bold">
              <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-[hsl(var(--gold))] text-[hsl(40_90%_42%)]" aria-hidden />{stars}/{MAX_STARS}</span>
              {days > 0 && <span className="inline-flex items-center gap-1 text-[hsl(14_80%_44%)]"><Flame className="h-4 w-4" aria-hidden />{days} jour{days > 1 ? "s" : ""}</span>}
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
