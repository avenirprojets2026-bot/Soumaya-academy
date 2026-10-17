// Lecteur d'exercices : une question à la fois, une seule barre d'action en bas, retour d'information immédiat (missions) ou différé (épreuves).
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, BookOpen, Check, Clock, Volume2, VolumeX, X } from "lucide-react";
import { Mimi, type Mood } from "@/components/characters";
import { Feedback, QuestionView, canSubmit, resetListens } from "@/components/question";
import { judge, expected, pickMsg, prepare, MOODS, type Answer, type Verdict } from "@/lib/engine";
import { haptic, isMuted, setMuted, sfx, speak, speechSupported } from "@/lib/fx";
import type { Question } from "@/data/kit";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type PlayItem = { q: Question; tag?: string };
export type PlayResult = { items: PlayItem[]; answers: (Answer | undefined)[]; verdicts: Verdict[]; seconds: number };

type Props = {
  items: PlayItem[];
  seed: string;
  /** mission : correction après chaque question. exam : correction à la fin. */
  mode: "mission" | "exam";
  title: string;
  text?: { title: string; body: string[]; source?: string };
  /** Compte à rebours par question, en secondes (mode Éclair). */
  secondsPerQuestion?: number;
  onExit: () => void;
  onFinish: (r: PlayResult) => void;
  accent?: number;
};

export function Player({ items, seed, mode, title, text, secondsPerQuestion, onExit, onFinish, accent = 186 }: Props) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(Answer | undefined)[]>(() => items.map(() => undefined));
  const [verdicts, setVerdicts] = useState<(Verdict | undefined)[]>(() => items.map(() => undefined));
  const [locked, setLocked] = useState(false);
  const [mood, setMood] = useState<Mood>("idle");
  const [confirmExit, setConfirmExit] = useState(false);
  const [reading, setReading] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [left, setLeft] = useState(secondsPerQuestion ?? 0);
  const started = useRef(Date.now());
  const nextRef = useRef<HTMLButtonElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const stopSpeech = useRef<() => void>(() => undefined);
  const [speaking, setSpeaking] = useState(false);

  const item = items[i];
  const prepared = useMemo(() => prepare(item.q, `${seed}-${i}`), [item, seed, i]);
  const answer = answers[i];
  const verdict = verdicts[i];
  const isLast = i === items.length - 1;
  const instant = mode === "mission";

  const finish = useCallback((vs: (Verdict | undefined)[], as: (Answer | undefined)[]) => {
    onFinish({ items, answers: as, verdicts: vs.map((v) => v ?? { score: 0, correct: false }), seconds: Math.round((Date.now() - started.current) / 1000) });
  }, [items, onFinish]);

  const validate = useCallback((forced = false) => {
    if (locked) return;
    if (!forced && !canSubmit(prepared, answer)) return;
    const v = judge(item.q, answer);
    const vs = verdicts.slice(); vs[i] = v; setVerdicts(vs);
    if (instant) {
      setLocked(true);
      if (v.correct) { sfx("good"); haptic([10, 30, 10]); setMood("joy"); }
      else if (v.score > 0) { sfx("star"); setMood("surprise"); }
      else { sfx("bad"); haptic(40); setMood("sad"); }
      window.setTimeout(() => nextRef.current?.focus({ preventScroll: false }), 80);
    } else {
      // Épreuve : pas de correction immédiate, on enchaîne.
      sfx("page");
      if (isLast) finish(vs, answers); else { setI(i + 1); setMood("think"); }
    }
  }, [locked, prepared, answer, item.q, verdicts, i, instant, isLast, finish, answers]);

  const next = useCallback(() => {
    sfx("page");
    stopSpeech.current(); setSpeaking(false);
    if (isLast) { finish(verdicts, answers); return; }
    setI(i + 1); setLocked(false); setMood("think");
    if (secondsPerQuestion) setLeft(secondsPerQuestion);
  }, [isLast, i, verdicts, answers, finish, secondsPerQuestion]);

  // Retour en haut à chaque question
  useEffect(() => { topRef.current?.scrollIntoView({ block: "start" }); window.scrollTo({ top: 0 }); }, [i]);
  useEffect(() => { if (!locked && mode === "exam") setMood("think"); }, [i, locked, mode]);

  // Mode Éclair : compte à rebours
  useEffect(() => {
    if (!secondsPerQuestion || locked) return;
    if (left <= 0) { validate(true); return; }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left, locked, secondsPerQuestion, validate, instant]);
  useEffect(() => { if (secondsPerQuestion) setLeft(secondsPerQuestion); }, [i, secondsPerQuestion]);

  useEffect(() => { resetListens(); return () => stopSpeech.current(); }, []);

  const setAnswer = (a: Answer | undefined) => { const as = answers.slice(); as[i] = a; setAnswers(as); };

  const readText = () => {
    if (speaking) { stopSpeech.current(); setSpeaking(false); return; }
    if (!text) return;
    setSpeaking(true);
    stopSpeech.current = speak(`${text.title}. ${text.body.join(" ")}`, { onEnd: () => setSpeaking(false) });
  };

  const pct = ((i + (locked ? 1 : 0)) / items.length) * 100;
  const msg = verdict ? (verdict.correct ? pickMsg(MOODS.win, i) : verdict.score > 0 ? pickMsg(MOODS.almost, i) : pickMsg(MOODS.lose, i)) : "";

  return (
    <div className="player" style={{ ["--accent" as string]: accent }}>
      <header className="sticky top-0 z-30 px-3 pb-2 pt-[max(.5rem,env(safe-area-inset-top))]">
        <div className="glass mx-auto flex max-w-2xl items-center gap-2 rounded-full py-1.5 pl-1.5 pr-2">
          <button type="button" onClick={() => setConfirmExit(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/80 text-foreground" aria-label="Quitter l'exercice" data-testid="button-exit">
            <X className="h-5 w-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[.78rem] font-extrabold uppercase tracking-wider text-muted-foreground">{item.tag ?? title}</p>
            <div className="flex items-center gap-2">
              <div className="progress-track flex-1" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={i + (locked ? 1 : 0)} aria-label="Avancement">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-sm font-black tabular-nums" data-testid="counter">{i + 1}/{items.length}</span>
            </div>
          </div>
          {secondsPerQuestion ? (
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-black tabular-nums ${left <= 5 ? "bg-[hsl(356_100%_92%)] text-[hsl(356_70%_40%)]" : "bg-[hsl(44_100%_88%)]"}`} data-testid="timer"><Clock className="h-4 w-4" aria-hidden />{left}s</span>
          ) : null}
          {text && (
            <button type="button" onClick={() => setReading(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[hsl(186_70%_92%)] text-[hsl(186_72%_24%)]" aria-label="Relire le texte" data-testid="button-reread">
              <BookOpen className="h-5 w-5" aria-hidden />
            </button>
          )}
          <button type="button" onClick={() => { setMuted(!muted); setMutedState(!muted); }} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/80" aria-label={muted ? "Activer le son" : "Couper le son"} aria-pressed={muted} data-testid="button-sound">
            {muted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </header>

      <div ref={topRef} />
      <main className="player-body mx-auto w-full max-w-2xl px-4 pt-2" id="contenu">
        <div className="mb-3 flex items-end gap-2">
          <Mimi mood={mood} size={64} />
          {locked && verdict && <p className="bubble anim-pop mb-2" data-testid="bubble">{msg}</p>}
          {!locked && mode === "mission" && i === 0 && <p className="bubble anim-pop mb-2">Je t'accompagne, Soumaya !</p>}
        </div>
        <section className="parchment anim-enter rounded-[1.75rem] p-4 sm:p-6" key={i}>
          <QuestionView p={prepared} answer={answer} onChange={setAnswer} locked={locked} verdict={verdict} onSubmit={() => validate()} />
        </section>
        {locked && verdict && (
          <div className="mt-4">
            <Feedback verdict={verdict} kind={item.q.k} expectedText={expected(item.q)} explanation={item.q.e} />
          </div>
        )}
      </main>

      <div className="actionbar" data-testid="action-bar">
        <div className="actionbar-inner">
          {!locked ? (
            <>
              {mode === "exam" && !isLast && (
                <button type="button" className="btn-ghost" onClick={() => validate(true)} data-testid="button-skip">Je passe</button>
              )}
              <button type="button" className="btn-royal btn-teal" disabled={!canSubmit(prepared, answer)} onClick={() => validate()} data-testid="button-validate">
                <Check className="h-5 w-5" aria-hidden /> {mode === "exam" ? (isLast ? "Terminer" : "Valider") : "Valider"}
              </button>
            </>
          ) : (
            <button ref={nextRef} type="button" className="btn-royal" onClick={next} data-testid="button-next">
              {isLast ? "Voir mon résultat" : "Question suivante"} <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <Dialog open={confirmExit} onOpenChange={setConfirmExit}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-black">Quitter l'exercice ?</DialogTitle>
            <DialogDescription>Ta progression sur cet exercice ne sera pas gardée. Les étoiles déjà gagnées restent à toi.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2">
            <button type="button" className="btn-royal btn-teal" onClick={() => setConfirmExit(false)} data-testid="button-stay">Continuer à jouer</button>
            <button type="button" className="btn-ghost" onClick={onExit} data-testid="button-confirm-exit">Quitter</button>
          </div>
        </DialogContent>
      </Dialog>

      {text && (
        <Dialog open={reading} onOpenChange={setReading}>
          <DialogContent className="max-h-[85dvh] max-w-lg overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-black">{text.title}</DialogTitle>
              <DialogDescription>{text.source ?? "Relis le texte, puis reviens à la question."}</DialogDescription>
            </DialogHeader>
            <TextBody text={text} onRead={readText} speaking={speaking} />
            <button type="button" className="btn-royal btn-teal mt-2" onClick={() => setReading(false)} data-testid="button-close-text">J'ai relu, je reviens</button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function TextBody({ text, onRead, speaking }: { text: { title: string; body: string[] }; onRead?: () => void; speaking?: boolean }): ReactNode {
  return (
    <div>
      {onRead && speechSupported() && (
        <button type="button" onClick={onRead} className="btn-ghost mb-3" data-testid="button-read-aloud">
          <Volume2 className="h-5 w-5" aria-hidden /> {speaking ? "Arrêter la lecture" : "Écouter le texte"}
        </button>
      )}
      <div className="space-y-3 text-[1.05rem] leading-relaxed">
        {text.body.map((b, k) => <p key={k} className="whitespace-pre-line">{b}</p>)}
      </div>
    </div>
  );
}
