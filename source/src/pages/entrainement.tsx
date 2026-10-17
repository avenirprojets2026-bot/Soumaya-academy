import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search } from "lucide-react";
import { PageTitle, Stars3 } from "@/components/shell";
import { WorldIcon, pinGradient } from "@/components/world-icon";
import { CLASSICS, WORLDS, bandOf } from "@/data/catalog";
import { starsFor, useProgress } from "@/lib/progress";
import { normalizeAnswer } from "@/data/kit";

const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function EntrainementPage() {
  const { save } = useProgress();
  const [world, setWorld] = useState<string>("all");
  const [level, setLevel] = useState<number | 0>(0);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = normalizeAnswer(q);
    const all = [
      ...WORLDS.flatMap((w) => w.missions.map((m) => ({ m, w, classic: false }))),
      ...CLASSICS.map((m) => ({ m, w: undefined, classic: true })),
    ];
    return all.filter(({ m, w, classic }) =>
      (world === "all" || (world === "classiques" ? classic : w?.id === world)) &&
      (level === 0 || m.level === level) &&
      (!needle || normalizeAnswer(`${m.title} ${m.intro} ${w?.subject ?? "classiques"}`).includes(needle)),
    );
  }, [world, level, q]);

  const chip = (active: boolean) => `btn-ghost !min-h-[44px] !px-3.5 whitespace-nowrap ${active ? "!border-[hsl(186_72%_30%)] !bg-[hsl(186_72%_30%)] !text-white" : ""}`;

  return (
    <div className="mx-auto max-w-5xl pb-6">
      <PageTitle sub="Choisis librement une matière, un niveau de 1 à 10, ou cherche un mot-clé.">S'entraîner</PageTitle>
      <div className="px-4">
        <label className="relative block">
          <span className="sr-only">Rechercher un exercice</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher : fractions, horloge, texte…" data-testid="input-search"
            className="h-14 w-full rounded-full border-2 border-[hsl(40_50%_72%)] bg-white/90 pl-12 pr-4 text-lg font-semibold outline-none focus:border-[hsl(186_72%_30%)] focus:shadow-[0_0_0_4px_hsl(186_72%_60%/.4)]" />
        </label>

        <p className="mb-1.5 mt-4 text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Matière</p>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 map-scroller" role="group" aria-label="Filtrer par matière">
          <button type="button" className={chip(world === "all")} aria-pressed={world === "all"} onClick={() => setWorld("all")} data-testid="filter-world-all">Toutes</button>
          {WORLDS.map((w) => <button key={w.id} type="button" className={chip(world === w.id)} aria-pressed={world === w.id} onClick={() => setWorld(w.id)} data-testid={`filter-world-${w.id}`}>{w.subject}</button>)}
          <button type="button" className={chip(world === "classiques")} aria-pressed={world === "classiques"} onClick={() => setWorld("classiques")} data-testid="filter-world-classiques">Classiques</button>
        </div>

        <p className="mb-1.5 mt-3 text-sm font-extrabold uppercase tracking-wider text-muted-foreground">Niveau</p>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 map-scroller" role="group" aria-label="Filtrer par niveau">
          <button type="button" className={chip(level === 0)} aria-pressed={level === 0} onClick={() => setLevel(0)} data-testid="filter-level-all">Tous</button>
          {LEVELS.map((l) => <button key={l} type="button" className={chip(level === l)} aria-pressed={level === l} onClick={() => setLevel(l)} data-testid={`filter-level-${l}`}>{l}{l >= 7 ? " · P5" : ""}</button>)}
        </div>
      </div>

      <p className="px-4 pb-2 pt-4 text-sm font-bold text-muted-foreground" role="status" data-testid="result-count">{rows.length} exercice{rows.length > 1 ? "s" : ""}</p>
      <ul className="grid grid-cols-1 gap-3 px-3 sm:grid-cols-2 sm:px-4 lg:grid-cols-3" data-testid="training-list">
        {rows.map(({ m, w }) => (
          <li key={m.id}>
            <Link href={`/mission/${m.id}`} className="parchment anim-enter flex items-center gap-3 rounded-[1.4rem] p-3.5 transition-transform hover:-translate-y-0.5" data-testid={`train-${m.id}`}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white" style={{ background: pinGradient(w?.hue ?? 200) }}>{w ? <WorldIcon icon={w.icon} className="h-6 w-6" /> : <span className="font-black">★</span>}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[.7rem] font-extrabold uppercase tracking-wider text-muted-foreground">{w?.subject ?? "Classique"} · niveau {m.level} · {bandOf(m.level).id === "p5" ? "P5" : "P4"}</span>
                <span className="block truncate font-display text-[1.05rem] font-black leading-tight">{m.title}</span>
                <span className="block text-xs font-semibold text-muted-foreground">{m.qs.length} questions{save.best[m.id] !== undefined ? ` · meilleur ${save.best[m.id]} %` : ""}</span>
              </span>
              <Stars3 value={starsFor(save, m.id)} size="h-4 w-4" />
            </Link>
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="mx-4 mt-2 rounded-2xl bg-white/70 p-4 font-bold" data-testid="no-result">Aucun exercice ne correspond. Essaie un autre mot ou retire un filtre.</p>}
    </div>
  );
}
