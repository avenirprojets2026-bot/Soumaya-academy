import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Award, Ear, Gauge, Mic, Timer, Zap } from "lucide-react";
import { SceneArt } from "@/components/stage";
import { Soumaya } from "@/components/characters";
import { PageTitle } from "@/components/shell";
import { COURT, DISTINCTIONS, SECTION_DURATION, SECTION_LABEL, distinctionOf, loadBlancs } from "@/data/catalog";
import type { BlancExam } from "@/data/kit";
import { useProgress } from "@/lib/progress";

export function DistinctionChip({ pct }: { pct: number }) {
  const d = distinctionOf(pct);
  const hue = d.min >= 90 ? 44 : d.min >= 80 ? 38 : d.min >= 70 ? 160 : d.min >= 50 ? 205 : 8;
  return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black" style={{ background: `hsl(${hue} 85% 88%)`, color: `hsl(${hue} 70% 22%)` }}><Award className="h-3.5 w-3.5" aria-hidden />{d.name}</span>;
}

export default function EpreuvesPage() {
  const { save } = useProgress();
  const [blancs, setBlancs] = useState<BlancExam[] | null>(null);
  useEffect(() => { void loadBlancs().then(setBlancs); }, []);
  const res = (id: string) => save.exams[id];
  return (
    <div className="mx-auto max-w-5xl pb-6">
      <SceneArt image={COURT.scene} hue={44} className="mx-3 mt-3 h-52 sm:mx-4 sm:h-64" strength={0.8}>
        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-4 text-white">
          <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[hsl(44_100%_82%)] hero-title">Préparation à l'interdiocésain</p>
          <h1 className="font-display text-3xl font-black leading-tight hero-title sm:text-4xl">{COURT.name}</h1>
        </div>
        <div className="absolute bottom-0 right-2 z-10 hidden sm:block"><Soumaya mood="idle" size={190} /></div>
      </SceneArt>

      <div className="px-3 sm:px-4">
        <section className="parchment relative z-10 -mt-5 rounded-[1.5rem] p-4" aria-labelledby="how">
          <h2 id="how" className="font-display text-lg font-black">Comment se passe l'épreuve ?</h2>
          <p className="mt-1 text-[.98rem] leading-snug">Chaque examen blanc suit les épreuves : <strong>Lire</strong> /20, <strong>Langue</strong> /15, <strong>Écrire</strong> /15, <strong>Maths</strong> /25, <strong>Éveil</strong> /15, <strong>Écouter</strong> /5 et <strong>Parler</strong> /5, soit 100 points. Plus de 80 % : grande distinction.</p>
          <ul className="mt-2 flex flex-wrap gap-1.5 text-xs font-bold">
            {DISTINCTIONS.slice(0, 4).map((d) => <li key={d.name} className="rounded-full bg-[hsl(44_100%_90%)] px-2.5 py-1">{d.name} ≥ {d.min} %</li>)}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">Barème d'entraînement indicatif, non officiel. Pour « Écouter » et « Parler », prévois un adulte à côté.</p>
        </section>

        <h2 className="mb-2 mt-6 font-display text-xl font-black">Entraînements rapides</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="quick-exams">
          <Quick href="/epreuve/express-p4" icon={<Gauge />} title="Examen express P4" blurb="Lire, langue, maths, éveil : ≈ 45 questions, nombres nouveaux à chaque essai." id="express-p4" res={res("express-p4")} hue={186} />
          <Quick href="/epreuve/express-p5" icon={<Gauge />} title="Examen express P5" blurb="La même séance, version P5, pour viser plus haut." id="express-p5" res={res("express-p5")} hue={262} />
          <Quick href="/epreuve/eclair" icon={<Zap />} title="Mode Éclair" blurb="12 questions, 20 secondes chacune. Vite et juste !" id="eclair" res={res("eclair")} hue={14} />
          <Quick href="/epreuve/diagnostic" icon={<Timer />} title="Test de diagnostic" blurb="Trouve ton niveau de départ en maths, français et géométrie." id="diagnostic" res={res("diagnostic")} hue={160} />
        </ul>

        <h2 className="mb-2 mt-7 font-display text-xl font-black">Examens blancs complets</h2>
        {!blancs ? (
          <p className="parchment rounded-2xl p-4 font-bold" role="status">Chargement des examens…</p>
        ) : blancs.length === 0 ? (
          <p className="parchment rounded-2xl p-4 font-bold">Les examens blancs ne sont pas disponibles pour le moment.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="blancs">
            {blancs.map((b, i) => {
              const r = res(b.id);
              const secs = b.sections.map((s) => s.id);
              const total = b.sections.reduce((a, s) => a + s.max, 0);
              return (
                <li key={b.id}>
                  <Link href={`/epreuve/${b.id}`} className="parchment anim-enter block rounded-[1.5rem] p-4 transition-transform hover:-translate-y-0.5" data-testid={`exam-${b.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Examen blanc n° {i + 1} · {b.level}</p>
                        <h3 className="font-display text-lg font-black leading-tight">{b.title}</h3>
                        <p className="text-sm text-muted-foreground">{b.theme}</p>
                      </div>
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[hsl(44_100%_82%)] font-display text-lg font-black">{total}</span>
                    </div>
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-[hsl(186_60%_26%)]">
                      {secs.map((s) => <span key={s} className="rounded-full bg-[hsl(186_70%_92%)] px-2 py-0.5">{s === "ecouter" && <Ear className="mr-0.5 inline h-3 w-3" aria-hidden />}{s === "parler" && <Mic className="mr-0.5 inline h-3 w-3" aria-hidden />}{SECTION_LABEL[s]}</span>)}
                    </p>
                    <p className="mt-2 text-sm font-bold">{r ? <>Meilleur : {r.pts}/{r.max} · <DistinctionChip pct={(r.pts / r.max) * 100} /></> : `≈ ${b.sections.reduce((a, s) => a + SECTION_DURATION[s.id], 0)} minutes · pas encore essayé`}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Quick({ href, icon, title, blurb, res, hue }: { href: string; icon: React.ReactNode; title: string; blurb: string; id: string; res?: { pts: number; max: number }; hue: number }) {
  return (
    <li>
      <Link href={href} className="parchment anim-enter flex items-center gap-3 rounded-[1.5rem] p-4 transition-transform hover:-translate-y-0.5" data-testid={`quick-${href.split("/").pop()}`}>
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white [&_svg]:h-7 [&_svg]:w-7" style={{ background: `linear-gradient(160deg, hsl(${hue} 70% 54%), hsl(${hue} 70% 30%))` }}>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-black leading-tight">{title}</span>
          <span className="block text-sm leading-snug text-muted-foreground">{blurb}</span>
          {res && <span className="mt-1 block text-sm font-bold">Meilleur : {res.pts}/{res.max} <DistinctionChip pct={(res.pts / res.max) * 100} /></span>}
        </span>
      </Link>
    </li>
  );
}
