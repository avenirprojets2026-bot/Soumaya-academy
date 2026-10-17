import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowRight, Ear, Mic, RotateCcw } from "lucide-react";
import { Player, type PlayResult } from "@/components/player";
import { Summary } from "@/components/summary";
import { SceneArt } from "@/components/stage";
import { Soumaya } from "@/components/characters";
import { DistinctionChip } from "@/pages/epreuves";
import { COURT, SECTION_DURATION, SECTION_LABEL, distinctionOf, loadBlancs, type ExamDef } from "@/data/catalog";
import { diagnosticExam, eclairExam, expressExam, flattenExam, scoreExam } from "@/lib/exams";
import { useProgress } from "@/lib/progress";
import NotFound from "@/pages/not-found";
import type { ExamSection } from "@/data/kit";

const TRAIN: Record<ExamSection["id"], { href: string; label: string }> = {
  lire: { href: "/monde/lecture", label: "Village des Contes" },
  langue: { href: "/monde/francais", label: "Bibliothèque des Mots" },
  ecrire: { href: "/monde/atelier", label: "Atelier des Merveilles" },
  maths: { href: "/monde/maths", label: "Tour de Cristal" },
  eveil: { href: "/monde/sciences", label: "Jardin des Étoiles" },
  ecouter: { href: "/monde/atelier", label: "Atelier des Merveilles" },
  parler: { href: "/monde/atelier", label: "Atelier des Merveilles" },
};

async function resolve(id: string, nonce: string): Promise<ExamDef | undefined> {
  if (id === "express-p4") return expressExam("P4", nonce);
  if (id === "express-p5") return expressExam("P5", nonce);
  if (id === "eclair") return eclairExam(6, nonce);
  if (id === "diagnostic") return diagnosticExam(nonce);
  const b = (await loadBlancs()).find((x) => x.id === id);
  return b ? { id: b.id, kind: "blanc", level: b.level, title: b.title, blurb: b.theme, sections: b.sections } : undefined;
}

export default function EpreuvePage() {
  const [, params] = useRoute("/epreuve/:id");
  const [, go] = useLocation();
  const { recordExam, noteResults } = useProgress();
  const id = params?.id ?? "";
  const [attempt, setAttempt] = useState(1);
  const nonce = useMemo(() => `${id}-${attempt}-${Date.now()}`, [id, attempt]);
  const [def, setDef] = useState<ExamDef | null | undefined>(undefined);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [result, setResult] = useState<{ r: PlayResult; score: ReturnType<typeof scoreExam> } | null>(null);
  const saved = useRef("");

  useEffect(() => {
    let live = true;
    setDef(undefined);
    void resolve(id, nonce).then((d) => { if (live) setDef(d ?? null); });
    return () => { live = false; };
  }, [id, nonce]);

  const flat = useMemo(() => (def ? flattenExam(def) : []), [def]);

  const onFinish = useCallback((r: PlayResult) => {
    if (!def) return;
    const score = scoreExam(def, r.verdicts.map((v) => v.score));
    const key = `${def.id}#${attempt}`;
    if (saved.current !== key) { saved.current = key; recordExam(def.id, score.pts, score.max, Object.fromEntries(score.sections.map((s) => [s.id + s.title, { pts: s.pts, max: s.max }])));  noteResults(r.items, r.verdicts, "exam");}
    setResult({ r, score });
    setPhase("done");
  }, [def, attempt, recordExam, noteResults]);

  if (def === null) return <NotFound />;
  if (def === undefined) return <p className="p-6 text-center font-bold" role="status">Préparation de l'épreuve…</p>;

  const timed = def.kind === "eclair";

  if (phase === "intro") {
    const minutes = def.durationMin ?? def.sections.reduce((a, s) => a + SECTION_DURATION[s.id], 0);
    return (
      <div className="mx-auto max-w-2xl px-3 pb-10 pt-3" id="contenu">
        <SceneArt image={COURT.scene} hue={44} className="h-52 sm:h-64" strength={0.8}>
          <div className="absolute right-2 top-2 z-10"><Soumaya mood="think" size={170} /></div>
          <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-4 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[hsl(44_100%_82%)] hero-title">{def.kind === "blanc" ? "Examen blanc" : def.kind === "eclair" ? "Mode Éclair" : def.kind === "diag" ? "Diagnostic" : "Entraînement"} · {def.level}</p>
            <h1 className="font-display text-3xl font-black leading-tight hero-title" data-testid="exam-title">{def.title}</h1>
          </div>
        </SceneArt>
        <div className="parchment -mt-5 rounded-[1.75rem] p-5">
          <p className="font-semibold leading-snug">{def.blurb}</p>
          <ul className="mt-3 grid gap-1.5" data-testid="exam-sections">
            {def.sections.map((s, i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-[hsl(44_100%_94%)] px-3 py-2">
                <span className="flex items-center gap-2 font-bold">{s.id === "ecouter" && <Ear className="h-4 w-4" aria-hidden />}{s.id === "parler" && <Mic className="h-4 w-4" aria-hidden />}{s.title || SECTION_LABEL[s.id]}</span>
                <span className="text-sm font-extrabold text-muted-foreground">{s.qs.length} question{s.qs.length > 1 ? "s" : ""} · /{Math.round(s.max * 2) / 2}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            {timed ? "Chaque question a 20 secondes. Pas de correction avant la fin d'une question." : `Durée indicative : environ ${minutes} minutes. La correction s'affiche à la fin, comme à l'examen.`}
            {def.sections.some((s) => s.id === "ecouter") && " Pour « Écouter », le texte est lu deux fois et reste caché."}
            {def.sections.some((s) => s.id === "parler") && " Pour « Parler », un adulte écoute et coche la grille avec toi."}
          </p>
          <div className="mt-4 grid gap-2.5">
            <button type="button" className="btn-royal" onClick={() => setPhase("play")} data-testid="button-start-exam">Commencer <ArrowRight className="h-5 w-5" aria-hidden /></button>
            <Link href="/epreuves" className="btn-ghost" data-testid="link-back">Retour aux épreuves</Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    const { score } = result;
    const d = distinctionOf(score.pct);
    const weak = [...score.sections].filter((s) => s.max > 0).sort((a, b) => a.pts / a.max - b.pts / b.max).filter((s) => s.pts / s.max < 0.8).slice(0, 2);
    const headline = def.kind === "diag" ? "Voici ton point de départ" : d.name;
    const sub = def.kind === "diag"
      ? "Commence par les niveaux conseillés ci-dessous : ils sont à ta portée, puis tu monteras."
      : score.pct >= 80 ? "Tu es au niveau de la grande distinction. Garde ce rythme !" : score.pct >= 50 ? "Tu as la base. Travaille les points ci-dessous pour monter d'un palier." : "Pas de panique : reprends les mondes conseillés puis refais l'épreuve.";
    return (
      <Summary
        scene={COURT.scene} hue={44} pct={score.pct} headline={headline} sub={sub} celebrate={score.pct >= 80}
        items={result.r.items} verdicts={result.r.verdicts}
        extra={
          <div className="mt-4 text-left" data-testid="exam-report">
            <p className="text-center font-display text-lg font-black">{score.pts} / {score.max} points <DistinctionChip pct={score.pct} /></p>
            <ul className="mt-3 grid gap-2.5" aria-label="Résultats par épreuve">
              {score.sections.map((s, i) => {
                const p = s.max ? Math.round((s.pts / s.max) * 100) : 0;
                return (
                  <li key={i} data-testid={`section-score-${s.id}`}>
                    <div className="flex items-baseline justify-between text-sm font-bold"><span>{s.title}</span><span className="tabular-nums">{s.pts}/{s.max}</span></div>
                    <div className="progress-track mt-1" aria-hidden><div className="progress-fill" style={{ width: `${p}%`, background: p >= 80 ? "linear-gradient(90deg,hsl(160 62% 38%),hsl(150 70% 52%))" : p >= 50 ? undefined : "linear-gradient(90deg,hsl(8 80% 50%),hsl(30 90% 56%))" }} /></div>
                  </li>
                );
              })}
            </ul>
            {weak.length > 0 && (
              <div className="mt-4 rounded-2xl bg-[hsl(44_100%_92%)] p-3">
                <p className="font-black">À retravailler en priorité</p>
                <ul className="mt-1 grid gap-1">
                  {weak.map((s, i) => <li key={i}><Link href={TRAIN[s.id].href} className="font-bold text-[hsl(186_72%_24%)] underline underline-offset-4">{s.title} : {TRAIN[s.id].label}</Link></li>)}
                </ul>
              </div>
            )}
          </div>
        }
        actions={
          <>
            <button type="button" className="btn-royal" onClick={() => { setAttempt((a) => a + 1); setResult(null); setPhase("intro"); }} data-testid="button-retry-exam"><RotateCcw className="h-5 w-5" aria-hidden /> {def.kind === "blanc" ? "Refaire cet examen" : "Nouvel essai"}</button>
            <Link href="/epreuves" className="btn-ghost" data-testid="button-back-exams">Retour aux épreuves</Link>
            <Link href="/" className="btn-ghost" data-testid="button-home">Accueil</Link>
          </>
        }
      />
    );
  }

  return (
    <Player
      key={`${def.id}-${attempt}`} items={flat} seed={nonce} mode={timed ? "mission" : "exam"} title={def.title}
      secondsPerQuestion={timed ? 20 : undefined} accent={44} onExit={() => go("/epreuves")} onFinish={onFinish}
    />
  );
}
