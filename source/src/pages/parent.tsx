import { Link } from "wouter";
import { PageTitle } from "@/components/shell";
import { WorldIcon, pinGradient } from "@/components/world-icon";
import { SECTION_LABEL, WORLDS, distinctionOf, type World } from "@/data/catalog";
import type { ExamSection } from "@/data/kit";
import { dueReviews, passed, streak, totalStars, MAX_STARS, rankOf, useProgress, type Save } from "@/lib/progress";
import { openMission } from "@/lib/suggest";

const SECTION_IDS: ExamSection["id"][] = ["lire", "langue", "ecrire", "maths", "eveil", "ecouter", "parler"];
const TRAIN: Record<ExamSection["id"], { href: string; label: string }> = {
  lire: { href: "/monde/lecture", label: "Village des Contes" },
  langue: { href: "/monde/francais", label: "Bibliothèque des Mots" },
  ecrire: { href: "/monde/atelier", label: "Atelier des Merveilles" },
  maths: { href: "/monde/maths", label: "Tour de Cristal" },
  eveil: { href: "/monde/sciences", label: "Jardin des Étoiles" },
  ecouter: { href: "/monde/atelier", label: "Atelier des Merveilles" },
  parler: { href: "/monde/atelier", label: "Atelier des Merveilles" },
};
const MIN_N = 10;

const tint = (v: number | undefined) => v === undefined ? "hsl(40 20% 90%)" : v >= 80 ? "hsl(150 55% 66%)" : v >= 60 ? "hsl(95 55% 70%)" : v >= 40 ? "hsl(44 90% 70%)" : "hsl(10 80% 74%)";

function sectionStats(save: Save) {
  const acc: Record<string, { pts: number; max: number }> = {};
  for (const r of Object.values(save.exams)) for (const [k, v] of Object.entries(r.sections ?? {})) {
    const id = SECTION_IDS.find((s) => k.startsWith(s));
    if (!id) continue;
    acc[id] = { pts: (acc[id]?.pts ?? 0) + v.pts, max: (acc[id]?.max ?? 0) + v.max };
  }
  return SECTION_IDS.filter((id) => acc[id]?.max).map((id) => ({ id, pct: Math.round((acc[id].pts / acc[id].max) * 100) })).sort((a, b) => a.pct - b.pct);
}

function weakestMission(save: Save, w: World) {
  const played = w.missions.filter((m) => save.best[m.id] !== undefined && (save.best[m.id] ?? 0) < 80).sort((a, b) => (save.best[a.id] ?? 0) - (save.best[b.id] ?? 0));
  return played[0] ?? openMission(save, w);
}

type Reco = { text: string; href: string; cta: string };

export default function ParentPage() {
  const { save } = useProgress();
  const stars = totalStars(save), rank = rankOf(stars), days = streak(save);
  const due = dueReviews(save).length;
  const last7 = save.days.filter((d) => (Date.now() - new Date(`${d}T12:00:00`).getTime()) / 864e5 < 7).length;
  const played = Object.keys(save.best).length;
  const subjects = WORLDS.map((w) => { const st = save.stats[w.id]; return { w, n: st?.n ?? 0, pct: st && st.n ? Math.round((st.ok / st.n) * 100) : undefined }; });
  const known = subjects.filter((s) => s.pct !== undefined && s.n >= MIN_N).sort((a, b) => a.pct! - b.pct!);
  const sections = sectionStats(save);
  const examList = Object.entries(save.exams).filter(([id]) => !["eclair", "diagnostic"].includes(id));
  const bestExam = examList.length ? Math.max(...examList.map(([, r]) => (r.pts / r.max) * 100)) : undefined;

  const recos: Reco[] = [];
  if (due > 0) recos.push({ text: `${due} question${due > 1 ? "s" : ""} ratée${due > 1 ? "s" : ""} à revoir : 10 minutes suffisent.`, href: "/revision", cta: "Réviser" });
  if (played === 0 && examList.length === 0) recos.push({ text: "Commencer par le test de diagnostic pour situer le niveau.", href: "/epreuve/diagnostic", cta: "Faire le diagnostic" });
  for (const s of known.filter((x) => x.pct! < 75).slice(0, 2)) {
    const m = weakestMission(save, s.w);
    recos.push({ text: `${s.w.subject} : ${s.pct} % de réussite. Rejouer « ${m.title} » (niveau ${m.level}).`, href: `/mission/${m.id}`, cta: "Rejouer" });
  }
  if (sections[0] && sections[0].pct < 75) recos.push({ text: `En examen blanc, « ${SECTION_LABEL[sections[0].id]} » est la plus fragile (${sections[0].pct} %).`, href: TRAIN[sections[0].id].href, cta: TRAIN[sections[0].id].label });
  if (examList.length === 0 && played > 0) recos.push({ text: "Passer un premier examen blanc complet pour voir où elle en est.", href: "/epreuves", cta: "Voir les examens" });
  else if (bestExam !== undefined && bestExam < 80) recos.push({ text: `Meilleur examen blanc : ${Math.round(bestExam)} %. Viser 80 % pour la grande distinction : refaire un examen blanc.`, href: "/epreuves", cta: "Examens blancs" });
  if (recos.length === 0) recos.push({ text: "Tout est en ordre. Continuer l'aventure et refaire un examen blanc cette semaine.", href: "/aventure", cta: "Aventure" });

  const plan = recos.slice(0, 5);
  while (plan.length < 5) plan.push(plan.length % 2 ? { text: "Une mission au choix dans un monde préféré (plaisir et régularité).", href: "/aventure", cta: "Aventure" } : { text: "Mode Éclair : 12 questions rapides pour la vitesse.", href: "/epreuve/eclair", cta: "Éclair" });

  return (
    <div className="mx-auto max-w-3xl pb-8" data-testid="parent-page">
      <PageTitle sub="Pour Karim : où en est Soumaya, ce qu'il faut travailler, et un plan simple pour la semaine.">Espace parent</PageTitle>
      <div className="grid grid-cols-1 gap-3 px-3 sm:px-4">
        <section className="parchment rounded-[1.5rem] p-4" aria-label="Résumé">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Rang" value={rank.name} small />
            <Stat label="Étoiles" value={`${stars}/${MAX_STARS}`} />
            <Stat label="Jours joués (7 j)" value={`${last7}/7`} sub={days > 0 ? `${days} de suite` : undefined} />
            <Stat label="Missions jouées" value={String(played)} />
          </dl>
          {bestExam !== undefined && <p className="mt-3 text-sm font-bold" data-testid="best-exam">Meilleur examen blanc : {Math.round(bestExam)} % · {distinctionOf(bestExam).name} (barème indicatif)</p>}
        </section>

        <section aria-labelledby="reco">
          <h2 id="reco" className="mb-2 font-display text-xl font-black">À faire en priorité</h2>
          <ul className="grid grid-cols-1 gap-2" data-testid="recos">
            {recos.slice(0, 4).map((r, i) => (
              <li key={i} className="parchment flex items-center gap-3 rounded-2xl p-3">
                <p className="min-w-0 flex-1 font-semibold leading-snug">{r.text}</p>
                <Link href={r.href} className="btn-ghost !min-h-[44px] shrink-0 !px-3.5 text-sm">{r.cta}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="subj">
          <h2 id="subj" className="mb-2 font-display text-xl font-black">Réussite par matière et par niveau</h2>
          <p className="mb-2 text-sm text-muted-foreground">Les cases montrent le meilleur score de chaque niveau (1 à 10). Gris : pas encore joué. Un pourcentage s'affiche à partir de {MIN_N} questions jouées.</p>
          <ul className="grid grid-cols-1 gap-2" data-testid="subject-grid">
            {subjects.map(({ w, n, pct }) => (
              <li key={w.id} className="parchment rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: pinGradient(w.hue) }}><WorldIcon icon={w.icon} className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-black leading-tight">{w.subject}</span>
                    <span className="text-xs font-semibold text-muted-foreground">{n >= MIN_N ? `${pct} % sur ${n} questions` : n > 0 ? `${n} question${n > 1 ? "s" : ""} jouée${n > 1 ? "s" : ""} (trop peu pour conclure)` : "Pas encore joué"}</span></span>
                </div>
                <ol className="mt-2 grid grid-cols-10 gap-1" aria-label={`Niveaux de ${w.subject}`}>
                  {w.missions.map((m) => {
                    const b = save.best[m.id];
                    return <li key={m.id} className="grid h-7 place-items-center rounded-md text-[.7rem] font-extrabold" style={{ background: tint(b), color: "hsl(200 40% 18%)" }} title={`Niveau ${m.level} : ${b === undefined ? "pas joué" : b + " %"}${passed(save, m.id) ? " (réussi)" : ""}`}>{m.level}</li>;
                  })}
                </ol>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sec">
          <h2 id="sec" className="mb-2 font-display text-xl font-black">Par épreuve d'examen</h2>
          {sections.length === 0 ? <p className="parchment rounded-2xl p-4 font-semibold">Pas encore d'examen blanc. Les résultats par épreuve (Lire, Langue, Maths…) s'afficheront ici.</p> : (
            <ul className="grid grid-cols-1 gap-2" data-testid="section-stats">
              {sections.map((s) => (
                <li key={s.id} className="parchment rounded-2xl p-3">
                  <div className="flex items-baseline justify-between text-sm font-bold"><span>{SECTION_LABEL[s.id]}</span><span className="tabular-nums">{s.pct} %</span></div>
                  <div className="progress-track mt-1" aria-hidden><div className="progress-fill" style={{ width: `${s.pct}%`, background: s.pct >= 80 ? "linear-gradient(90deg,hsl(160 62% 38%),hsl(150 70% 52%))" : s.pct >= 60 ? undefined : "linear-gradient(90deg,hsl(8 80% 50%),hsl(30 90% 56%))" }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="plan">
          <h2 id="plan" className="mb-2 font-display text-xl font-black">Plan de la semaine (15 min par jour)</h2>
          <ol className="grid grid-cols-1 gap-2" data-testid="week-plan">
            {plan.map((r, i) => (
              <li key={i} className="parchment flex items-center gap-3 rounded-2xl p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[hsl(44_100%_82%)] font-display font-black">{i + 1}</span>
                <p className="min-w-0 flex-1 font-semibold leading-snug">{r.text}</p>
                <Link href={r.href} className="btn-ghost !min-h-[44px] shrink-0 !px-3.5 text-sm">Ouvrir</Link>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">Un jour de repos par semaine : le sommeil aide à retenir.</p>
        </section>

        <Link href="/carnet" className="btn-ghost" data-testid="link-carnet">Sauvegarde et mode parent : Carnet</Link>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, small }: { label: string; value: string; sub?: string; small?: boolean }) {
  return (
    <div className="rounded-2xl bg-[hsl(44_100%_94%)] p-3">
      <dt className="text-[.7rem] font-extrabold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={`font-display font-black leading-tight ${small ? "text-base" : "text-2xl"}`}>{value}</dd>
      {sub && <dd className="text-xs font-bold text-muted-foreground">{sub}</dd>}
    </div>
  );
}
