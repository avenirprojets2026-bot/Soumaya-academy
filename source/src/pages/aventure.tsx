import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Crown, List, Map as MapIcon } from "lucide-react";
import { WorldIcon, pinGradient } from "@/components/world-icon";
import { PageTitle, Stars3, StarCount } from "@/components/shell";
import { COURT, WORLDS, type World } from "@/data/catalog";
import { PANORAMA, adventureAsset } from "@/data/adventure-assets";
import { passed, useProgress, worldStars } from "@/lib/progress";
import { suggestContinue } from "@/lib/suggest";
import { Motes } from "@/components/stage";
import { sfx } from "@/lib/fx";

type Sel = { kind: "world"; w: World } | { kind: "court" };

export default function AventurePage() {
  const { save } = useProgress();
  const [, go] = useLocation();
  const [view, setView] = useState<"map" | "list">("map");
  const [sel, setSel] = useState<Sel>(() => ({ kind: "world", w: suggestContinue(save).world }));
  const scroller = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Centre la carte sur le lieu choisi
  useEffect(() => {
    if (view !== "map") return;
    const key = sel.kind === "world" ? sel.w.id : "court";
    const el = pinRefs.current[key], sc = scroller.current;
    if (el && sc) sc.scrollTo({ left: el.offsetLeft - sc.clientWidth / 2, behavior: "smooth" });
  }, [sel, view]);

  const pick = (s: Sel) => { sfx("tap"); setSel(s); };
  const done = (w: World) => w.missions.filter((m) => passed(save, m.id)).length;

  return (
    <div className="mx-auto max-w-5xl pb-6">
      <PageTitle sub="Touche un lieu de la carte pour y entrer.">La carte des mondes</PageTitle>
      <div className="mb-3 flex gap-2 px-4" role="tablist" aria-label="Affichage">
        <button role="tab" aria-selected={view === "map"} onClick={() => setView("map")} className={`btn-ghost ${view === "map" ? "!bg-[hsl(44_100%_80%)]" : ""}`} data-testid="view-map"><MapIcon className="h-5 w-5" aria-hidden /> Carte</button>
        <button role="tab" aria-selected={view === "list"} onClick={() => setView("list")} className={`btn-ghost ${view === "list" ? "!bg-[hsl(44_100%_80%)]" : ""}`} data-testid="view-list"><List className="h-5 w-5" aria-hidden /> Liste</button>
      </div>

      {view === "map" ? (
        <>
          <div ref={scroller} className="map-scroller mx-3 rounded-[2rem] border-[3px] border-[hsl(44_90%_70%)] shadow-xl sm:mx-4" data-testid="map-scroller" tabIndex={-1}>
            <div className="relative" style={{ height: "min(62dvh, 560px)", aspectRatio: `${PANORAMA.width} / ${PANORAMA.height}` }}>
              <img src={adventureAsset(PANORAMA.file)} alt="Un archipel d'îles flottantes autour d'un grand château" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" />
              <Motes count={22} seed="map" className="opacity-80" />
              {WORLDS.map((w) => (
                <button
                  key={w.id} ref={(el) => { pinRefs.current[w.id] = el; }}
                  type="button" className="pin" aria-pressed={sel.kind === "world" && sel.w.id === w.id} aria-label={`${w.name}, ${w.subject}`}
                  data-testid={`pin-${w.id}`} style={{ left: `${w.map.x}%`, top: `${w.map.y}%`, background: pinGradient(w.hue) }}
                  onClick={() => { sfx("tap"); go(`/monde/${w.id}`); }}
                >
                  <WorldIcon icon={w.icon} />
                  {done(w) > 0 && <span className="pin-star">{done(w)}</span>}
                </button>
              ))}
              <button
                ref={(el) => { pinRefs.current.court = el; }} type="button" className="pin" aria-pressed={sel.kind === "court"} aria-label="Le Château d'Or, les épreuves"
                data-testid="pin-court" style={{ left: `${COURT.map.x}%`, top: `${COURT.map.y}%`, background: pinGradient(44) }} onClick={() => { sfx("tap"); go("/epreuves"); }}
              >
                <Crown />
              </button>
            </div>
          </div>

          <div className="mx-3 mt-3 sm:mx-4" aria-live="polite">
            {sel.kind === "world" ? <WorldCard w={sel.w} stars={worldStars(save, sel.w)} done={done(sel.w)} onEnter={() => go(`/monde/${sel.w.id}`)} /> : <CourtCard onEnter={() => go("/epreuves")} />}
          </div>
        </>
      ) : (
        <ul className="grid grid-cols-1 gap-3 px-3 sm:grid-cols-2 sm:px-4" data-testid="world-list">
          {WORLDS.map((w) => (
            <li key={w.id}><WorldCard w={w} stars={worldStars(save, w)} done={done(w)} onEnter={() => go(`/monde/${w.id}`)} /></li>
          ))}
          <li><CourtCard onEnter={() => go("/epreuves")} /></li>
        </ul>
      )}
    </div>
  );
}

function WorldCard({ w, stars, done, onEnter }: { w: World; stars: number; done: number; onEnter: () => void }) {
  return (
    <article className="parchment anim-enter cursor-pointer rounded-[1.75rem] p-4" data-testid="world-card" data-world={w.id} onClick={onEnter}>
      <div className="flex items-start gap-3">
        <img src={adventureAsset(w.scene)} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-md" loading="lazy" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: `hsl(${w.hue} 60% 34%)` }}>{w.subject}</p>
          <h2 className="font-display text-xl font-black leading-tight">{w.name}</h2>
          <p className="mt-1 text-[.95rem] leading-snug text-muted-foreground">{w.tagline}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm font-bold">
          <StarCount n={stars} max={w.missions.length * 3} />
          <span className="text-muted-foreground">{done}/{w.missions.length} niveaux</span>
        </div>
        <button type="button" className="btn-royal !min-h-[48px]" data-testid="button-enter-world">Entrer <ArrowRight className="h-5 w-5" aria-hidden /></button>
      </div>
    </article>
  );
}

function CourtCard({ onEnter }: { onEnter: () => void }) {
  return (
    <article className="parchment anim-enter cursor-pointer rounded-[1.75rem] p-4" data-testid="court-card" onClick={onEnter}>
      <div className="flex items-start gap-3">
        <img src={adventureAsset(COURT.scene)} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-md" loading="lazy" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[hsl(36_80%_32%)]">Épreuves</p>
          <h2 className="font-display text-xl font-black leading-tight">{COURT.name}</h2>
          <p className="mt-1 text-[.95rem] leading-snug text-muted-foreground">Examens blancs sur 100 points, mode Éclair et test de diagnostic : prépare l'interdiocésain.</p>
        </div>
      </div>
      <div className="mt-3 flex justify-end"><button type="button" className="btn-royal btn-gold !min-h-[48px]" data-testid="button-enter-court">Entrer <ArrowRight className="h-5 w-5" aria-hidden /></button></div>
    </article>
  );
}

export { Link, Stars3 };
