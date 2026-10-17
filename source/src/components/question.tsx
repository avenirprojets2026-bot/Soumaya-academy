// Affichage et saisie d'une question, pour tous les types. Aucune logique de score ici : voir lib/engine.ts.
import { useEffect, useRef, useState } from "react";
import { Check, Headphones, Mic, Pause, Play, Square, Volume2, X } from "lucide-react";
import { VisView } from "@/components/vis";
import type { Answer, Prepared, Verdict } from "@/lib/engine";
import { wordCount } from "@/lib/engine";
import { haptic, recorderSupported, sfx, speak, speechSupported, startRecording } from "@/lib/fx";

type Props = {
  p: Prepared;
  answer: Answer | undefined;
  onChange: (a: Answer | undefined) => void;
  /** Question verrouillée (après validation) : on montre la correction. */
  locked: boolean;
  verdict?: Verdict;
  onSubmit: () => void;
};

export function canSubmit(p: Prepared, a: Answer | undefined): boolean {
  if (!a) return false;
  switch (p.k) {
    case "mcq": return a.k === "mcq" && !!a.v;
    case "tf": return a.k === "tf";
    case "num": return a.k === "num" && a.v.trim().length > 0;
    case "ord": return a.k === "ord" && a.v.length === p.q.items.length;
    case "mat": return a.k === "mat" && Object.keys(a.v).length === p.q.pairs.length;
    case "gap": return a.k === "gap" && a.v.length === p.q.ok.length && a.v.every(Boolean);
    case "prod": return a.k === "prod" && (p.q.mode === "oral" || wordCount(a.v.text ?? "") >= Math.min(p.q.minMots ?? 5, 5));
  }
}

const choiceBase = "choice w-full min-h-[56px] rounded-2xl border-2 px-4 py-3 text-left text-[1.05rem] font-bold leading-snug transition-[transform,background,border-color,box-shadow] duration-150";
function stateClass(selected: boolean, locked: boolean, good?: boolean) {
  if (locked && good) return "border-[hsl(160_60%_36%)] bg-[hsl(160_70%_92%)] shadow-[0_0_0_3px_hsl(160_60%_70%/.5)]";
  if (locked && selected && !good) return "border-[hsl(356_70%_52%)] bg-[hsl(356_100%_95%)] anim-shake";
  if (selected) return "border-[hsl(186_72%_30%)] bg-[hsl(186_70%_94%)] shadow-[0_0_0_3px_hsl(186_72%_60%/.4)] -translate-y-0.5";
  return "border-[hsl(40_50%_80%)] bg-white/90 hover:-translate-y-0.5 hover:border-[hsl(186_50%_55%)]";
}

function Mcq({ p, answer, onChange, locked }: Props & { p: Extract<Prepared, { k: "mcq" }> }) {
  const sel = answer?.k === "mcq" ? answer.v : "";
  return (
    <div role="radiogroup" aria-label="Choisis une réponse" className="grid grid-cols-1 gap-2.5">
      {p.choices.map((c, i) => (
        <button
          key={c} type="button" role="radio" aria-checked={sel === c} disabled={locked}
          data-testid={`choice-${i}`}
          onClick={() => { sfx("tap"); haptic(8); onChange({ k: "mcq", v: c }); }}
          className={`${choiceBase} ${stateClass(sel === c, locked, c === p.q.ok)}`}
        >
          <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-[hsl(44_100%_80%)] text-sm font-black text-[hsl(30_70%_22%)]">{"ABCD"[i]}</span>
          {c}
          {locked && c === p.q.ok && <Check className="ml-2 inline h-5 w-5 text-[hsl(160_70%_28%)]" aria-label="bonne réponse" />}
        </button>
      ))}
    </div>
  );
}

function Tf({ p, answer, onChange, locked }: Props & { p: Extract<Prepared, { k: "tf" }> }) {
  const sel = answer?.k === "tf" ? answer.v : undefined;
  return (
    <div role="radiogroup" aria-label="Vrai ou faux" className="grid grid-cols-2 gap-3">
      {([true, false] as const).map((v) => (
        <button
          key={String(v)} type="button" role="radio" aria-checked={sel === v} disabled={locked}
          data-testid={v ? "choice-true" : "choice-false"}
          onClick={() => { sfx("tap"); haptic(8); onChange({ k: "tf", v }); }}
          className={`${choiceBase} text-center text-lg ${stateClass(sel === v, locked, v === p.q.a)}`}
        >
          {v ? "Vrai" : "Faux"}
        </button>
      ))}
    </div>
  );
}

function NumInput({ p, answer, onChange, locked, verdict, onSubmit }: Props & { p: Extract<Prepared, { k: "num" }> }) {
  const val = answer?.k === "num" ? answer.v : "";
  const numeric = p.q.ok.every((x) => /^[\d\s.,]+$/.test(x));
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!locked) ref.current?.focus({ preventScroll: true }); }, [locked, p.q.q]);
  return (
    <div>
      <label htmlFor="num-input" className="mb-1.5 block text-sm font-extrabold text-muted-foreground">Ta réponse</label>
      <div className="flex items-center gap-2">
        <input
          ref={ref} id="num-input" data-testid="input-num" type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          inputMode={numeric ? "decimal" : "text"} enterKeyHint="done" value={val} disabled={locked}
          onChange={(e) => onChange({ k: "num", v: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter" && val.trim() && !locked) onSubmit(); }}
          placeholder={numeric ? "Écris un nombre" : "Écris ta réponse"}
          className={`h-14 min-w-0 flex-1 rounded-2xl border-2 bg-white px-4 text-xl font-black tracking-wide outline-none focus:border-[hsl(186_72%_30%)] focus:shadow-[0_0_0_4px_hsl(186_72%_60%/.4)] ${locked ? (verdict?.correct ? "border-[hsl(160_60%_36%)] bg-[hsl(160_70%_94%)]" : "border-[hsl(356_70%_52%)] bg-[hsl(356_100%_96%)]") : "border-[hsl(40_50%_72%)]"}`}
        />
        {p.q.unit && <span className="rounded-xl bg-[hsl(44_100%_88%)] px-3 py-3 text-lg font-black">{p.q.unit}</span>}
      </div>
    </div>
  );
}

function Ord({ p, answer, onChange, locked }: Props & { p: Extract<Prepared, { k: "ord" }> }) {
  const placed = answer?.k === "ord" ? answer.v : [];
  const left = p.shuffled.filter((x) => !placed.includes(x));
  const toggle = (x: string, add: boolean) => {
    if (locked) return;
    sfx("tap"); haptic(8);
    const next = add ? [...placed, x] : placed.filter((y) => y !== x);
    onChange(next.length ? { k: "ord", v: next } : undefined);
  };
  return (
    <div>
      <p className="mb-2 text-sm font-extrabold text-muted-foreground">Touche les morceaux dans le bon ordre. Touche un morceau placé pour le retirer.</p>
      <ol className="grid grid-cols-1 gap-2" aria-label="Ma réponse" data-testid="ord-answer">
        {p.q.items.map((_, i) => {
          const x = placed[i];
          const good = locked && x === p.q.items[i];
          return (
            <li key={i}>
              <button
                type="button" disabled={locked || !x} onClick={() => x && toggle(x, false)}
                data-testid={`ord-slot-${i}`}
                className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left font-bold ${x ? (locked ? (good ? "border-[hsl(160_60%_36%)] bg-[hsl(160_70%_92%)]" : "border-[hsl(356_70%_52%)] bg-[hsl(356_100%_95%)]") : "border-[hsl(186_72%_30%)] bg-[hsl(186_70%_94%)]") : "border-dashed border-[hsl(40_40%_70%)] bg-white/50 text-muted-foreground"}`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[hsl(44_100%_80%)] text-sm font-black text-[hsl(30_70%_22%)]">{i + 1}</span>
                <span>{x ?? "…"}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {left.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Morceaux à placer">
          {left.map((x, i) => (
            <button key={x} type="button" data-testid={`ord-item-${i}`} onClick={() => toggle(x, true)} className="min-h-[48px] rounded-2xl border-2 border-[hsl(44_70%_70%)] bg-[hsl(44_100%_92%)] px-4 py-2 text-left font-bold shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95">{x}</button>
          ))}
        </div>
      )}
    </div>
  );
}

const MATCH_HUES = [186, 8, 44, 268, 150];
function Mat({ p, answer, onChange, locked }: Props & { p: Extract<Prepared, { k: "mat" }> }) {
  const links = answer?.k === "mat" ? answer.v : {};
  const [pick, setPick] = useState<string | null>(null);
  const colorOf = (l: string) => MATCH_HUES[p.lefts.indexOf(l) % MATCH_HUES.length];
  const rightOwner = (r: string) => Object.entries(links).find(([, v]) => v === r)?.[0];
  const setLinks = (v: Record<string, string>) => onChange(Object.keys(v).length ? { k: "mat", v } : undefined);
  const tapLeft = (l: string) => {
    if (locked) return;
    sfx("tap"); haptic(8);
    if (links[l]) { const { [l]: _, ...rest } = links; setLinks(rest); setPick(l); return; }
    setPick(pick === l ? null : l);
  };
  const tapRight = (r: string) => {
    if (locked) return;
    sfx("tap"); haptic(8);
    const owner = rightOwner(r);
    if (owner && !pick) { const { [owner]: _, ...rest } = links; setLinks(rest); return; }
    if (!pick) return;
    const next = { ...links };
    if (owner) delete next[owner];
    next[pick] = r;
    setLinks(next);
    setPick(null);
  };
  return (
    <div>
      <p className="mb-2 text-sm font-extrabold text-muted-foreground">Touche un élément à gauche, puis son partenaire à droite.</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid grid-cols-1 gap-2">
          {p.lefts.map((l, i) => {
            const linked = links[l];
            const good = locked && p.q.pairs.find((x) => x[0] === l)?.[1] === linked;
            return (
              <button key={l} type="button" data-testid={`mat-left-${i}`} aria-pressed={pick === l} disabled={locked} onClick={() => tapLeft(l)}
                style={linked || pick === l ? { borderColor: `hsl(${colorOf(l)} 60% 40%)`, background: `hsl(${colorOf(l)} 80% 94%)` } : undefined}
                className={`min-h-[52px] rounded-2xl border-2 px-3 py-2 text-left font-bold ${pick === l ? "ring-4 ring-[hsl(44_100%_70%)]" : ""} ${locked ? (good ? "!border-[hsl(160_60%_36%)]" : "!border-[hsl(356_70%_52%)]") : "border-[hsl(40_50%_80%)] bg-white/90"}`}>
                {l}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 gap-2">
          {p.rights.map((r, i) => {
            const owner = rightOwner(r);
            return (
              <button key={r} type="button" data-testid={`mat-right-${i}`} disabled={locked} onClick={() => tapRight(r)}
                style={owner ? { borderColor: `hsl(${colorOf(owner)} 60% 40%)`, background: `hsl(${colorOf(owner)} 80% 94%)` } : undefined}
                className="min-h-[52px] rounded-2xl border-2 border-[hsl(40_50%_80%)] bg-white/90 px-3 py-2 text-left font-bold">
                {r}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Gap({ p, answer, onChange, locked }: Props & { p: Extract<Prepared, { k: "gap" }> }) {
  const n = p.q.ok.length;
  const vals = answer?.k === "gap" ? answer.v : Array<string>(n).fill("");
  const parts = p.q.q.split("___");
  const used = [...vals];
  const set = (v: string[]) => onChange(v.some(Boolean) ? { k: "gap", v } : undefined);
  const fill = (w: string) => {
    if (locked) return;
    const i = vals.findIndex((x) => !x);
    if (i < 0) return;
    sfx("tap"); haptic(8);
    const v = [...vals]; v[i] = w; set(v);
  };
  const clear = (i: number) => { if (locked || !vals[i]) return; const v = [...vals]; v[i] = ""; set(v); };
  const bank = p.bank.map((w) => ({ w, taken: (() => { const k = used.indexOf(w); if (k >= 0) { used[k] = "\u0000"; return true; } return false; })() }));
  return (
    <div>
      <p className="text-lg font-semibold leading-[2.4]" data-testid="gap-text">
        {parts.map((t, i) => (
          <span key={i}>
            {t}
            {i < n && (
              <button type="button" data-testid={`gap-slot-${i}`} onClick={() => clear(i)} disabled={locked}
                className={`mx-1 inline-flex min-h-[40px] min-w-[84px] items-center justify-center rounded-xl border-2 border-dashed px-3 align-middle font-black ${vals[i] ? (locked ? (vals[i].toLowerCase() === p.q.ok[i].toLowerCase() ? "border-solid border-[hsl(160_60%_36%)] bg-[hsl(160_70%_92%)]" : "border-solid border-[hsl(356_70%_52%)] bg-[hsl(356_100%_95%)]") : "border-solid border-[hsl(186_72%_30%)] bg-[hsl(186_70%_94%)]") : "border-[hsl(40_40%_65%)] bg-white/60"}`}>
                {vals[i] || "…"}
              </button>
            )}
          </span>
        ))}
      </p>
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Banque de mots">
        {bank.map(({ w, taken }, i) => (
          <button key={`${w}-${i}`} type="button" data-testid={`gap-word-${i}`} disabled={locked || taken} onClick={() => fill(w)}
            className="min-h-[46px] rounded-2xl border-2 border-[hsl(44_70%_70%)] bg-[hsl(44_100%_92%)] px-4 py-2 font-bold shadow-sm transition-transform enabled:hover:-translate-y-0.5 enabled:active:scale-95 disabled:opacity-35">
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

function Prod({ p, answer, onChange, locked }: Props & { p: Extract<Prepared, { k: "prod" }> }) {
  const q = p.q;
  const v = answer?.k === "prod" ? answer.v : { text: "", ticked: [] as number[] };
  const words = wordCount(v.text ?? "");
  const [rec, setRec] = useState<{ stop: () => Promise<string> } | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const set = (next: Partial<typeof v>) => onChange({ k: "prod", v: { ...v, ...next } });
  const toggle = (i: number) => { if (!locked) set({ ticked: v.ticked.includes(i) ? v.ticked.filter((x) => x !== i) : [...v.ticked, i] }); };
  const start = async () => {
    setErr("");
    try { setRec(await startRecording()); } catch { setErr("Le micro n'est pas disponible. Tu peux parler sans t'enregistrer, un adulte t'écoute."); }
  };
  const stop = async () => { if (rec) { setUrl(await rec.stop()); setRec(null); } };
  return (
    <div className="grid grid-cols-1 gap-4">
      <details className="rounded-2xl border-2 border-[hsl(44_70%_78%)] bg-[hsl(44_100%_95%)] p-3" open>
        <summary className="cursor-pointer font-black">{q.mode === "oral" ? "Pour t'aider à parler" : "Pour t'aider à écrire"}</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.98rem]">{q.aide.map((a) => <li key={a}>{a}</li>)}</ul>
      </details>
      {q.mode === "ecrit" ? (
        <div>
          <label htmlFor="prod-text" className="mb-1.5 block text-sm font-extrabold text-muted-foreground">Ton texte</label>
          <textarea id="prod-text" data-testid="input-prod" rows={7} value={v.text ?? ""} disabled={locked} onChange={(e) => set({ text: e.target.value })}
            placeholder="Écris ici…" className="w-full rounded-2xl border-2 border-[hsl(40_50%_72%)] bg-white p-4 text-lg leading-relaxed outline-none focus:border-[hsl(186_72%_30%)] focus:shadow-[0_0_0_4px_hsl(186_72%_60%/.4)]" />
          <p className={`mt-1 text-sm font-bold ${q.minMots && words >= q.minMots ? "text-[hsl(160_70%_28%)]" : "text-muted-foreground"}`} data-testid="word-count">
            {words} mot{words > 1 ? "s" : ""}{q.minMots ? ` · objectif : au moins ${q.minMots}` : ""}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-[hsl(268_50%_84%)] bg-[hsl(268_100%_98%)] p-4">
          <p className="font-bold">Parle à voix haute, comme si tu présentais à la classe.</p>
          {recorderSupported() ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {!rec ? (
                <button type="button" className="btn-royal" onClick={start} data-testid="button-record"><Mic className="h-5 w-5" aria-hidden /> {url ? "Réenregistrer" : "M'enregistrer"}</button>
              ) : (
                <button type="button" className="btn-royal" onClick={stop} data-testid="button-stop-record"><Square className="h-5 w-5" aria-hidden /> Terminer</button>
              )}
              {rec && <span className="flex items-center gap-2 text-sm font-bold text-[hsl(356_70%_46%)]"><span className="h-3 w-3 animate-pulse rounded-full bg-[hsl(356_70%_52%)]" /> Enregistrement…</span>}
              {url && !rec && <audio controls src={url} className="h-10 max-w-full" aria-label="Réécouter mon enregistrement" />}
            </div>
          ) : <p className="mt-2 text-sm text-muted-foreground">Ton navigateur ne peut pas t'enregistrer : parle devant un adulte, il t'écoute.</p>}
          {err && <p role="alert" className="mt-2 text-sm font-semibold text-destructive">{err}</p>}
        </div>
      )}
      <fieldset>
        <legend className="mb-2 font-black">Ma grille : je coche ce que j'ai réussi</legend>
        <div className="grid grid-cols-1 gap-2">
          {q.crit.map((c, i) => (
            <label key={c} className={`flex min-h-[52px] cursor-pointer items-start gap-3 rounded-2xl border-2 px-3 py-2.5 ${v.ticked.includes(i) ? "border-[hsl(160_60%_36%)] bg-[hsl(160_70%_94%)]" : "border-[hsl(40_50%_80%)] bg-white/90"}`}>
              <input type="checkbox" className="mt-1 h-5 w-5 accent-[hsl(160_60%_32%)]" checked={v.ticked.includes(i)} disabled={locked} onChange={() => toggle(i)} data-testid={`crit-${i}`} />
              <span className="font-semibold">{c}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/** Lecteur de l'épreuve « Écouter » : le texte est lu par la synthèse vocale, deux écoutes maximum, texte caché. */
const LISTENS = new Map<string, number>();
/** Remet à zéro le nombre d'écoutes (au début de chaque épreuve). */
export const resetListens = () => LISTENS.clear();

export function ListenPlayer({ audio, reveal }: { audio: { title: string; text: string }; reveal: boolean }) {
  const [plays, setPlaysState] = useState(() => LISTENS.get(audio.text) ?? 0);
  const setPlays = (f: (n: number) => number) => setPlaysState((n) => { const v = f(n); LISTENS.set(audio.text, v); return v; });
  const [on, setOn] = useState(false);
  const stopRef = useRef<() => void>(() => undefined);
  const [show, setShow] = useState(false);
  useEffect(() => () => stopRef.current(), []);
  const supported = speechSupported();
  const toggle = () => {
    if (on) { stopRef.current(); setOn(false); return; }
    if (plays >= 2) return;
    setPlays((n) => n + 1); setOn(true);
    stopRef.current = speak(audio.text, { onEnd: () => setOn(false) });
  };
  return (
    <div className="rounded-3xl border-2 border-[hsl(268_50%_80%)] bg-[linear-gradient(135deg,hsl(268_100%_97%),hsl(44_100%_95%))] p-4" data-testid="listen-player">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[hsl(268_60%_92%)] text-[hsl(268_50%_34%)]"><Headphones className="h-6 w-6" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className="font-black leading-tight">Écouter : « {audio.title} »</p>
          <p className="text-sm text-muted-foreground">{supported ? `Écoute n° ${Math.min(plays + (on ? 0 : 1), 2)} sur 2. Le texte reste caché.` : "La voix n'est pas disponible : un adulte lit le texte deux fois."}</p>
        </div>
        {supported && (
          <button type="button" onClick={toggle} disabled={!on && plays >= 2} data-testid="button-listen" aria-label={on ? "Arrêter la lecture" : "Écouter le texte"} className="btn-royal !min-h-[52px] !px-4">
            {on ? <Pause className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5" aria-hidden />}
            <span className="max-[380px]:hidden">{on ? "Pause" : plays === 0 ? "Écouter" : plays < 2 ? "Réécouter" : "Terminé"}</span>
          </button>
        )}
      </div>
      {(!supported || reveal) && (
        <div className="mt-3">
          {!reveal && <button type="button" className="btn-ghost" onClick={() => setShow((s) => !s)} data-testid="button-parent-read"><Volume2 className="h-5 w-5" aria-hidden /> {show ? "Cacher le texte" : "Texte pour l'adulte"}</button>}
          {(show || reveal) && <p className="mt-3 rounded-2xl bg-white/80 p-3 text-[0.98rem] leading-relaxed" data-testid="listen-text">{audio.text}</p>}
        </div>
      )}
    </div>
  );
}

export function QuestionView(props: Props) {
  const { p } = props;
  const q = p.q;
  return (
    <div className="grid grid-cols-1 gap-4" data-testid="question" data-kind={p.k}>
      {q.audio && <ListenPlayer audio={q.audio} reveal={props.locked} />}
      {q.ctx && (
        <article className="rounded-3xl border-2 border-[hsl(44_70%_78%)] bg-[hsl(44_100%_96%)] p-4">
          <h3 className="font-display text-lg font-black">{q.ctx.title}</h3>
          <div className="mt-2 space-y-2 text-[1.02rem] leading-relaxed">{q.ctx.body.map((b, i) => <p key={i} className="whitespace-pre-line">{b}</p>)}</div>
        </article>
      )}
      <h2 className="font-display text-[1.35rem] font-black leading-snug" data-testid="question-text">{"q" in q ? q.q.replace(/___/g, p.k === "gap" ? "___" : "___") : ""}</h2>
      {q.vis && <VisView vis={q.vis} />}
      {p.k === "mcq" && <Mcq {...props} p={p} />}
      {p.k === "tf" && <Tf {...props} p={p} />}
      {p.k === "num" && <NumInput {...props} p={p} />}
      {p.k === "ord" && <Ord {...props} p={p} />}
      {p.k === "mat" && <Mat {...props} p={p} />}
      {p.k === "gap" && <Gap {...props} p={p} />}
      {p.k === "prod" && <Prod {...props} p={p} />}
    </div>
  );
}

export function Feedback({ verdict, expectedText, explanation, kind }: { verdict: Verdict; expectedText: string; explanation: string; kind: string }) {
  const good = verdict.correct;
  const part = !good && verdict.score > 0;
  return (
    <section
      role="status" aria-live="polite" data-testid="feedback" data-correct={good}
      className={`anim-pop rounded-3xl border-2 p-4 ${good ? "border-[hsl(160_60%_40%)] bg-[hsl(160_70%_94%)]" : part ? "border-[hsl(40_80%_55%)] bg-[hsl(44_100%_93%)]" : "border-[hsl(356_70%_60%)] bg-[hsl(356_100%_96%)]"}`}
    >
      <p className="flex items-center gap-2 font-display text-lg font-black">
        {good ? <Check className="h-6 w-6 text-[hsl(160_70%_28%)]" aria-hidden /> : <X className="h-6 w-6 text-[hsl(356_70%_46%)]" aria-hidden />}
        {good ? "Bravo, c'est juste !" : part ? `Presque ! ${verdict.detail ?? ""}` : kind === "prod" ? "Continue, tu y es presque" : "Pas tout à fait"}
      </p>
      {!good && expectedText && kind !== "prod" && <p className="mt-1.5 font-bold">Réponse attendue : <span className="rounded-lg bg-white/80 px-2 py-0.5">{expectedText}</span></p>}
      {kind === "prod" && expectedText && <p className="mt-1.5 rounded-xl bg-white/80 p-3 text-sm leading-relaxed"><strong>Un exemple de réponse :</strong> {expectedText}</p>}
      <p className="mt-2 leading-relaxed">{explanation}</p>
    </section>
  );
}
