import { useEffect, useMemo, useState } from 'react';
import { loadBank, maxPoints, PARTS, DOC_TITLES, type Bank, type BankItem } from '../store/bank';
import { update, type SeriesRun } from '../store/save';
import { listDocs, type ImportedDoc } from '../store/imports';
import { sfx } from '../engine/sfx';
import type { Nav } from './Screens';

export interface SeriesPlay { ref: string; label: string; kind: 'serie' | 'officiel'; items: BankItem[]; mode: 'exam' | 'training'; corrigeImages?: string[]; maxPoints?: number }

const steps = (max: number) => Array.from({ length: Math.round(max * 2) + 1 }, (_, i) => i / 2);
const fmt = (n: number) => String(n).replace('.', ',');

export function SeriesHub({ nav }: { nav: Nav }) {
  const [bank, setBank] = useState<Bank | null>(null);
  const [err, setErr] = useState(false);
  const [serie, setSerie] = useState<number | null>(null);
  const [mode, setMode] = useState<'exam' | 'training'>('exam');
  const [mine, setMine] = useState<ImportedDoc[]>([]);
  useEffect(() => { loadBank().then(setBank).catch(() => setErr(true)); listDocs().then(setMine).catch(() => setMine([])); }, []);
  const startMine = (d: ImportedDoc) => {
    const items: BankItem[] = d.pages.map((p, i) => ({ id: `${d.id}-p${i + 1}`, page: i + 1, image: URL.createObjectURL(p.blob), texte: p.text, corrige: '', source: `Import « ${d.fileName} » du ${new Date(d.importedAt).toLocaleDateString('fr-BE')}`, validation: 'valide', label: `Page ${i + 1}` }));
    const corr = mine.filter((c) => c.kind === 'corrige' && c.linkedTo === d.id && c.status === 'valide').flatMap((c) => c.pages.map((p) => URL.createObjectURL(p.blob)));
    sfx.click(); nav.series({ ref: d.id, label: d.title, kind: 'officiel', items, mode, corrigeImages: corr.length ? corr : undefined, maxPoints: d.maxPoints });
  };

  const series = useMemo(() => (bank ? [...new Set(bank.series.map((i) => i.serie!))].sort() : []), [bank]);
  const docs = useMemo(() => (bank ? [...new Set(bank.official.map((i) => i.doc!))].sort((a, b) => a - b) : []), [bank]);
  const start = (p: Omit<SeriesPlay, 'mode'>) => { sfx.click(); nav.series({ ...p, mode }); };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'linear-gradient(#2a1a5e,#ff8a3d)' }}>
      <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2"><button className="btn btn-ghost !py-2 !text-base" onClick={() => nav.go('map')}>← Carte</button><h1 className="text-3xl font-extrabold text-center">Le Château des Examens</h1><span className="w-20" /></div>

        <div className="panel p-3 flex flex-wrap items-center gap-2" role="group" aria-label="Mode">
          <span className="font-bold">Mode :</span>
          <button className={`btn !py-1 !text-base ${mode === 'exam' ? 'btn-gold' : 'btn-ghost'}`} aria-pressed={mode === 'exam'} onClick={() => setMode('exam')}>Examen (corrigé à la fin)</button>
          <button className={`btn !py-1 !text-base ${mode === 'training' ? 'btn-gold' : 'btn-ghost'}`} aria-pressed={mode === 'training'} onClick={() => setMode('training')}>Entraînement (corrigé question par question)</button>
        </div>

        <div className="panel p-4">
          <h2 className="text-2xl font-bold">Évaluation blanche — Nombres</h2>
          <p className="opacity-90 my-2">14 questions générées par le jeu, corrigées automatiquement, sans aide. Ce n’est pas une épreuve officielle.</p>
          <button className="btn btn-gold" onClick={() => { sfx.click(); nav.exam(); }}>Commencer l’évaluation</button>
        </div>

        <div className="panel p-4">
          <h2 className="text-2xl font-bold">Tes 5 séries d’entraînement</h2>
          <p className="opacity-90 my-2">Les vraies pages de tes séries (Arithmétique, Grandeurs, Géométrie, Statistiques et logique) avec leur corrigé. Une série ou une partie à la fois.</p>
          {err && <p className="text-amber-300">Les séries n’ont pas pu être chargées. Vérifie la connexion puis rouvre cet écran.</p>}
          {!bank && !err && <p>Chargement…</p>}
          <div className="flex flex-wrap gap-2 my-2">{series.map((n) => <button key={n} className={`btn !py-2 !text-lg ${serie === n ? 'btn-gold' : 'btn-violet'}`} aria-pressed={serie === n} onClick={() => { sfx.click(); setSerie(n); }}>Série {n}</button>)}</div>
          {bank && serie && (() => {
            const its = bank.series.filter((i) => i.serie === serie);
            return (<div className="flex flex-col gap-2 mt-2"><div className="opacity-90">{its[0]?.serieTitre ? `« ${its[0].serieTitre} »` : ''}</div>
              {PARTS.map((pt) => { const pi = its.filter((i) => i.partie === pt.id); return pi.length ? <button key={pt.id} className="btn btn-green text-left !py-2 !text-lg" onClick={() => start({ ref: `s${serie}-${pt.id}`, label: `Série ${serie} — ${pt.label}`, kind: 'serie', items: pi })}>{pt.label} · {pi.length} questions · /{fmt(maxPoints(pi))}</button> : null; })}
              <button className="btn btn-gold !py-2 !text-lg" onClick={() => start({ ref: `s${serie}-maths`, label: `Série ${serie} — mathématiques complètes`, kind: 'serie', items: PARTS.flatMap((pt) => its.filter((i) => i.partie === pt.id)) })}>Toutes les mathématiques de la série {serie} · /{fmt(maxPoints(its))}</button>
            </div>);
          })()}
        </div>

        {mine.some((d) => d.kind === 'epreuve' && d.status === 'valide') && (
          <div className="panel p-4">
            <h2 className="text-2xl font-bold">Mes documents importés</h2>
            <p className="opacity-90 my-2">Documents ajoutés et validés par un adulte. La correction se fait avec un adulte.</p>
            <div className="grid gap-2">{mine.filter((d) => d.kind === 'epreuve' && d.status === 'valide').map((d) => <button key={d.id} className="btn btn-violet text-left !py-2 !text-lg" onClick={() => startMine(d)}>{d.title} · {d.pages.length} p.</button>)}</div>
          </div>)}

        <div className="panel p-4">
          <h2 className="text-2xl font-bold">Épreuves officielles — juin 2025</h2>
          <p className="opacity-90 my-2">Les documents officiels fournis, page par page. Aucun corrigé officiel n’a été fourni : les corrigés affichés sont des propositions rédigées par Claude, à valider par l’enseignant (⚠ = à vérifier, ✎ = réponse libre). Un adulte garde le dernier mot pour les points.</p>
          <div className="grid gap-2">{bank && docs.map((d) => { const pi = bank.official.filter((i) => i.doc === d); return <button key={d} className="btn btn-violet text-left !py-2 !text-lg" onClick={() => start({ ref: `off25-d${d}`, label: `Officiel juin 2025 — Doc ${d} : ${DOC_TITLES[d] ?? pi[0].docTitre}`, kind: 'officiel', items: pi })}>Doc {d} · {DOC_TITLES[d] ?? pi[0].docTitre} · {pi.length} p.</button>; })}</div>
          {bank && docs.length === 0 && <p className="mt-2">Les documents officiels ne sont pas inclus dans cette version du jeu (droits d’auteur). Un adulte peut importer ses propres PDF dans l’Espace parent : ils apparaîtront ici dans « Mes documents importés ».</p>}
          <p className="text-sm opacity-75 mt-3">Les parties qui demandent un enregistrement audio ou une vidéo (écoute, dessin animé) ont besoin d’un adulte pour les lire ou les montrer : ces fichiers n’ont pas été fournis.</p>
        </div>
      </div>
    </div>
  );
}

export function SeriesPlayer({ play, onExit, onSaved }: { play: SeriesPlay; onExit: () => void; onSaved: () => void }) {
  const { items, mode, kind } = play;
  const [idx, setIdx] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<'work' | 'mark'>('work');
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const cur = items[idx];
  const [offTotal, setOffTotal] = useState<string>(() => (play.maxPoints ? String(play.maxPoints) : ''));
  const totalMax = kind === 'serie' ? maxPoints(items) : Number(offTotal.replace(',', '.')) || 0;
  const got = Object.values(marks).reduce((a, b) => a + b, 0);
  useEffect(() => { window.scrollTo?.(0, 0); }, [idx, phase]);

  const save = () => {
    const parts: Record<string, [number, number]> = {};
    if (kind === 'serie') for (const it of items) { const k = it.partie ?? 'autre'; const [g, m] = parts[k] ?? [0, 0]; parts[k] = [g + (marks[it.id] ?? 0), m + (it.points ?? 0)]; }
    const run: SeriesRun = { t: Date.now(), ref: play.ref, label: play.label, kind, score: got, total: totalMax, parts, marks: items.map((it) => ({ id: it.id, got: marks[it.id] ?? 0, max: it.points ?? null })) };
    update((s) => ({ ...s, seriesRuns: [...s.seriesRuns, run] })); sfx.win(); onSaved();
  };

  const Img = ({ it }: { it: BankItem }) => (<div className="overflow-x-auto rounded-2xl bg-white"><img src={it.image} alt={`${it.label ?? `Page ${it.page}`} — ${play.label}`} className="block w-full min-w-[640px] max-w-[980px] mx-auto" loading="lazy" /></div>);
  const Corr = ({ it }: { it: BankItem }) => {
    if (!it.corrige) return <div className="panel p-3 !border-orange-400">Pas de corrigé fourni pour cette page : un adulte corrige avec les documents officiels.</div>;
    const prop = it.id.startsWith('off25');
    return (
      <div className={`panel p-3 ${prop ? '!border-amber-400' : '!border-green-400'}`}>
        <div className="font-bold mb-1">{prop ? 'Corrigé proposé (à valider par l’enseignant)' : 'Corrigé (guide parent)'}</div>
        {prop && <p className="text-sm opacity-80 mb-2">Ce n’est pas le corrigé officiel : il a été rédigé par Claude à partir des pages. ⚠ = à vérifier, ✎ = réponse libre.</p>}
        <p style={{ whiteSpace: 'pre-line' }}>{it.corrige}</p>
      </div>
    );
  };

  if (phase === 'work') return (
    <div className="h-full overflow-y-auto" style={{ background: 'linear-gradient(#2b1b8a,#4a2fb0 60%,#6a3df0)' }}>
      <div className="max-w-4xl mx-auto p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2"><button className="btn btn-ghost !py-2 !text-base" onClick={onExit}>← Quitter</button><div className="text-center"><div className="font-extrabold">{play.label}</div><div className="text-sm opacity-80">{cur.label ?? `Page ${cur.page}`} · {idx + 1} / {items.length}{cur.points ? ` · /${fmt(cur.points)}` : ''} · {mode === 'exam' ? 'examen' : 'entraînement'}</div></div><span className="w-20" /></div>
        <div className="h-3 rounded-full bg-black/30 overflow-hidden" role="progressbar" aria-valuenow={idx + 1} aria-valuemin={1} aria-valuemax={items.length}><div className="h-full bg-gradient-to-r from-amber-300 to-pink-400" style={{ width: `${((idx + 1) / items.length) * 100}%` }} /></div>
        <Img it={cur} />
        <label className="panel p-3 flex flex-col gap-1"><span className="font-bold">Ma réponse ou mes notes (facultatif — tu peux aussi écrire sur papier)</span>
          <textarea id={`n-${cur.id}`} rows={3} value={notes[cur.id] ?? ''} onChange={(e) => setNotes({ ...notes, [cur.id]: e.target.value })} className="rounded-xl p-2 text-indigo-900 text-lg focusable" /></label>
        {mode === 'training' && <div><button className="btn btn-gold !py-2 !text-base" onClick={() => setOpen({ ...open, [cur.id]: !open[cur.id] })}>{open[cur.id] ? 'Cacher le corrigé' : 'Voir le corrigé'}</button>{open[cur.id] && <div className="mt-2"><Corr it={cur} /></div>}</div>}
        <div className="flex justify-between gap-2 pb-6">
          <button className="btn btn-ghost" disabled={idx === 0} onClick={() => { sfx.click(); setIdx(idx - 1); }}>← Précédent</button>
          {idx + 1 < items.length ? <button className="btn btn-green" onClick={() => { sfx.click(); setIdx(idx + 1); }}>Suivant →</button> : <button className="btn btn-gold" onClick={() => { sfx.click(); setPhase('mark'); }}>Remettre et corriger ✓</button>}
        </div>
      </div>
    </div>);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto p-3 flex flex-col gap-4">
        <div className="sticky top-0 z-10 bg-slate-50/95 py-2 flex flex-wrap items-center justify-between gap-2 border-b">
          <div><div className="font-extrabold text-xl">Correction — {play.label}</div><div className="text-sm text-slate-600">{kind === 'serie' ? 'Compare avec le corrigé puis choisis les points obtenus.' : 'Un adulte corrige et saisit les points.'}</div></div>
          <div className="text-2xl font-extrabold">{fmt(got)} / {fmt(totalMax)}</div>
        </div>
        {play.corrigeImages && <section className="bg-white rounded-2xl shadow p-3 flex flex-col gap-2"><div className="font-bold">Corrigé importé (pour l’adulte)</div><div className="max-h-[60vh] overflow-y-auto flex flex-col gap-2">{play.corrigeImages.map((u, i) => <img key={u} src={u} alt={`Corrigé, page ${i + 1}`} className="w-full" />)}</div></section>}
        {kind === 'officiel' && <label className="flex items-center gap-2">Total du document (points) : <input id="off-total" inputMode="decimal" value={offTotal} onChange={(e) => setOffTotal(e.target.value)} className="border rounded px-2 py-1 w-24" /></label>}
        {items.map((it) => (
          <section key={it.id} className="bg-white rounded-2xl shadow p-3 flex flex-col gap-2">
            <div className="font-bold">{it.label ?? `Page ${it.page}`}{it.points ? ` — /${fmt(it.points)}` : ''}</div>
            <Img it={it} />
            {notes[it.id] && <p className="bg-indigo-50 rounded-lg p-2"><b>Réponse de Soumaya :</b> {notes[it.id]}</p>}
            <div className="text-slate-900"><div className="[&_.panel]:bg-green-50 [&_.panel]:text-slate-900 [&_.panel]:backdrop-blur-none"><Corr it={it} /></div></div>
            {it.points ? <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Points pour ${it.label}`}>{steps(it.points).map((v) => <button key={v} className={`min-w-11 px-2 py-2 rounded-lg border font-bold ${marks[it.id] === v ? 'bg-indigo-600 text-white' : 'bg-white'}`} onClick={() => setMarks({ ...marks, [it.id]: v })}>{fmt(v)}</button>)}</div>
              : <label className="flex items-center gap-2">Points obtenus : <input id={`m-${it.id}`} inputMode="decimal" className="border rounded px-2 py-1 w-24" value={marks[it.id] ?? ''} onChange={(e) => { const v = Number(e.target.value.replace(',', '.')); setMarks({ ...marks, [it.id]: Number.isFinite(v) ? v : 0 }); }} /></label>}
          </section>))}
        <div className="flex justify-between pb-8"><button className="btn bg-slate-200 text-slate-900" onClick={() => setPhase('work')}>← Revoir les questions</button><button className="btn btn-green" onClick={save}>Enregistrer le résultat</button></div>
      </div>
    </div>);
}
