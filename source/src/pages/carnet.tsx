import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { AlertCircle, Check, Copy, Crown, Download, Flame, Trash2, Upload } from "lucide-react";
import { Soumaya } from "@/components/characters";
import { SceneArt } from "@/components/stage";
import { StorageNotice, StarCount } from "@/components/shell";
import { DistinctionChip } from "@/pages/epreuves";
import { WorldIcon, pinGradient } from "@/components/world-icon";
import { WORLDS, loadBlancs } from "@/data/catalog";
import {
  MAX_STARS, RANKS, badgesOf, decodeProgressBackup, encodeProgressBackup, rankOf, serializeProgressBackup, streak, totalStars, useProgress, worldStars, type Save,
} from "@/lib/progress";

export default function CarnetPage() {
  const { save, reset, replace, setFree } = useProgress();
  const total = totalStars(save);
  const rank = rankOf(total);
  const nextRank = RANKS.find((r) => r.min > total);
  const badges = badgesOf(save);
  const days = streak(save);
  const [titles, setTitles] = useState<Record<string, string>>({ "express-p4": "Examen express P4", "express-p5": "Examen express P5", eclair: "Mode Éclair", diagnostic: "Test de diagnostic" });
  useEffect(() => { void loadBlancs().then((b) => setTitles((t) => ({ ...t, ...Object.fromEntries(b.map((x) => [x.id, x.title])) }))); }, []);

  const [confirm, setConfirm] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [importText, setImportText] = useState("");
  const [candidate, setCandidate] = useState<Save | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [confirmImport, setConfirmImport] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const hasProgress = Object.keys(save.best).length > 0 || Object.keys(save.exams).length > 0;
  const candidateStars = candidate ? WORLDS.reduce((s, w) => s + worldStars(candidate, w), 0) : 0;

  const clearImport = () => { setCandidate(null); setConfirmImport(false); setMsg(""); setErr(""); };
  const download = () => {
    const url = URL.createObjectURL(new Blob([serializeProgressBackup(save, true)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "soumaya-academy-progression.json"; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg("Fichier de sauvegarde téléchargé sur cet appareil."); setErr("");
  };
  const createCode = () => { try { setBackupCode(encodeProgressBackup(save)); setMsg("Code prêt à copier et à envoyer à l'autre parent."); setErr(""); } catch { setErr("Impossible de créer le code de sauvegarde sur cet appareil."); setMsg(""); } };
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(backupCode); setCopied(true); setMsg("Code copié."); window.setTimeout(() => setCopied(false), 2500); }
    catch { setMsg(""); setErr("Copie impossible : sélectionne le code et copie-le manuellement."); }
  };
  const verify = () => {
    try { setCandidate(decodeProgressBackup(importText)); setConfirmImport(false); setErr(""); setMsg("Sauvegarde valide. Vérifie les étoiles avant de l'importer."); }
    catch (e) { setCandidate(null); setConfirmImport(false); setMsg(""); setErr(e instanceof Error ? e.message : "Cette sauvegarde est invalide."); }
  };
  const importNow = () => {
    if (!candidate) return;
    if (!replace(candidate)) { setErr("Import impossible : le navigateur ne peut pas enregistrer la progression."); setMsg(""); setConfirmImport(false); return; }
    setImportText(""); setCandidate(null); setConfirmImport(false); setErr(""); setMsg("Progression importée et enregistrée sur cet appareil.");
  };
  const onFile = async (f?: File) => {
    if (!f) return;
    clearImport();
    try { setImportText(await f.text()); } catch { setErr("Impossible de lire ce fichier."); }
    if (fileInput.current) fileInput.current.value = "";
  };

  const examRows = Object.entries(save.exams).sort((a, b) => (b[1].at || "").localeCompare(a[1].at || ""));

  return (
    <div className="mx-auto max-w-3xl pb-8">
      <SceneArt image="defis.webp" hue={44} className="mx-3 mt-3 h-60 sm:mx-4" strength={0.7}>
        <div className="absolute bottom-0 right-2 z-10"><Soumaya mood="joy" size={200} /></div>
        <div className="absolute inset-x-0 bottom-0 z-10 max-w-[65%] px-5 pb-4 text-white">
          <Crown className="h-8 w-8 text-[hsl(44_100%_72%)]" aria-hidden />
          <h1 className="font-display text-3xl font-black leading-tight hero-title">Mon carnet</h1>
          <p className="font-bold hero-title" data-testid="text-rank">{rank.name}</p>
        </div>
      </SceneArt>

      <div className="px-3 sm:px-4">
        <section className="parchment relative z-10 -mt-5 rounded-[1.5rem] p-4" aria-label="Résumé">
          <div className="flex items-end justify-between">
            <p className="font-display text-4xl font-black" data-testid="text-total">{total}<span className="text-xl opacity-60"> / {MAX_STARS}</span></p>
            <p className="text-right text-sm font-semibold">{nextRank ? `Encore ${nextRank.min - total} étoile${nextRank.min - total > 1 ? "s" : ""} pour « ${nextRank.name} »` : "Toutes les étoiles !"}</p>
          </div>
          <div className="progress-track mt-2" role="progressbar" aria-valuemin={0} aria-valuemax={MAX_STARS} aria-valuenow={total} aria-label="Étoiles gagnées"><div className="progress-fill" style={{ width: `${(total / MAX_STARS) * 100}%` }} /></div>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-[hsl(14_80%_44%)]"><Flame className="h-4 w-4" aria-hidden />{days > 0 ? `${days} jour${days > 1 ? "s" : ""} d'affilée` : "Joue aujourd'hui pour lancer ta série"}</p>
        </section>

        <h2 className="mb-2 mt-6 font-display text-xl font-black">Mes matières</h2>
        <ul className="grid grid-cols-1 gap-2.5" data-testid="subjects">
          {WORLDS.map((w) => {
            const st = save.stats[w.id];
            const acc = st && st.n ? Math.round((st.ok / st.n) * 100) : null;
            return (
              <li key={w.id} className="parchment rounded-2xl p-3" data-testid={`progress-world-${w.id}`}>
                <Link href={`/monde/${w.id}`} className="flex min-h-[48px] items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white" style={{ background: pinGradient(w.hue) }}><WorldIcon icon={w.icon} className="h-6 w-6" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display font-black leading-tight">{w.subject}</span>
                    <span className="block text-xs font-semibold text-muted-foreground">{acc === null ? "Pas encore joué" : `${acc} % de réussite sur ${st.n} questions`}</span>
                  </span>
                  <StarCount n={worldStars(save, w)} max={w.missions.length * 3} />
                </Link>
                {acc !== null && <div className="progress-track mt-2" aria-hidden><div className="progress-fill" style={{ width: `${acc}%`, background: acc >= 80 ? "linear-gradient(90deg,hsl(160 62% 38%),hsl(150 70% 52%))" : acc >= 60 ? undefined : "linear-gradient(90deg,hsl(8 80% 50%),hsl(30 90% 56%))" }} /></div>}
              </li>
            );
          })}
        </ul>

        <h2 className="mb-2 mt-7 font-display text-xl font-black">Mes récompenses</h2>
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" data-testid="badges">
          {badges.map((b) => (
            <li key={b.id} className={`rounded-2xl border-2 p-3 text-center ${b.earned ? "border-[hsl(44_90%_66%)] bg-[hsl(44_100%_92%)]" : "border-dashed border-[hsl(40_30%_78%)] bg-white/40 opacity-70"}`} data-earned={b.earned}>
              <span className={`text-3xl ${b.earned ? "" : "grayscale"}`} aria-hidden>{b.icon}</span>
              <p className="mt-1 font-black leading-tight">{b.name}</p>
              <p className="text-xs font-semibold text-muted-foreground">{b.hint}</p>
            </li>
          ))}
        </ul>

        <h2 className="mb-2 mt-7 font-display text-xl font-black">Mes épreuves</h2>
        {examRows.length === 0 ? (
          <p className="parchment rounded-2xl p-4 font-semibold">Aucune épreuve passée. <Link href="/epreuves" className="font-extrabold text-[hsl(186_72%_24%)] underline underline-offset-4">Essaie un examen blanc</Link>.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-2" data-testid="exam-history">
            {examRows.map(([id, r]) => (
              <li key={id} className="parchment flex items-center justify-between gap-3 rounded-2xl p-3">
                <span className="min-w-0"><span className="block truncate font-bold">{titles[id] ?? id}</span><span className="text-xs text-muted-foreground">{r.plays} essai{r.plays > 1 ? "s" : ""}</span></span>
                <span className="text-right"><span className="block font-black tabular-nums">{r.pts}/{r.max}</span><DistinctionChip pct={(r.pts / r.max) * 100} /></span>
              </li>
            ))}
          </ul>
        )}

        <Link href="/parent" className="btn-ghost mt-6 w-full" data-testid="link-parent">Espace parent : suivi et plan de la semaine</Link>
        <Link href="/revision" className="btn-ghost mt-2 w-full" data-testid="link-review">Révision intelligente</Link>

        <div className="mt-7"><StorageNotice /></div>

        <section className="mt-6 rounded-3xl border-2 border-[hsl(200_30%_80%)] bg-white/70 p-5" aria-labelledby="parent-title">
          <h2 id="parent-title" className="font-display text-xl font-black">Espace parent</h2>
          <label className="mt-3 flex min-h-[52px] cursor-pointer items-start gap-3 rounded-2xl border-2 border-[hsl(40_50%_80%)] bg-white/90 p-3">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[hsl(186_72%_30%)]" checked={save.free} onChange={(e) => setFree(e.target.checked)} data-testid="toggle-free" />
            <span><strong>Ouvrir tous les niveaux</strong><span className="block text-sm text-muted-foreground">Sans ce réglage, un niveau s'ouvre quand le précédent est réussi à 60 %. Le réglage n'efface rien.</span></span>
          </label>
        </section>

        <section className="mt-5 rounded-3xl border-2 border-[hsl(268_60%_88%)] bg-[hsl(268_100%_98%)] p-5" aria-labelledby="transfer-title">
          <h2 id="transfer-title" className="font-display text-xl font-black">Transférer ma progression</h2>
          <p className="mt-1 text-sm text-muted-foreground">Envoie une copie à l'autre parent, puis importe-la sur son téléphone. Rien n'est envoyé ni synchronisé automatiquement.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={download} className="btn-royal" data-testid="button-export-file"><Download className="h-5 w-5" aria-hidden /> Télécharger le fichier</button>
            <button type="button" onClick={createCode} className="btn-ghost" data-testid="button-create-backup-code"><Copy className="h-5 w-5" aria-hidden /> Créer un code à partager</button>
          </div>
          {backupCode && (
            <div className="mt-4">
              <label htmlFor="backup-code" className="block text-sm font-bold">Code de sauvegarde</label>
              <textarea id="backup-code" readOnly value={backupCode} rows={3} className="mt-2 w-full rounded-2xl border border-border bg-white p-3 font-mono text-xs" data-testid="text-backup-code" />
              <button type="button" onClick={copyCode} className="btn-ghost mt-2" data-testid="button-copy-backup-code">{copied ? <Check className="h-5 w-5" aria-hidden /> : <Copy className="h-5 w-5" aria-hidden />}{copied ? "Code copié" : "Copier le code"}</button>
            </div>
          )}
          <div className="my-5 border-t border-[hsl(268_40%_86%)]" />
          <h3 className="font-display text-lg font-black">Importer une sauvegarde</h3>
          <input ref={fileInput} type="file" accept=".json,application/json,text/plain" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} data-testid="input-backup-file" aria-label="Choisir un fichier de sauvegarde" />
          <button type="button" onClick={() => fileInput.current?.click()} className="btn-ghost mt-3" data-testid="button-select-backup-file"><Upload className="h-5 w-5" aria-hidden /> Choisir un fichier</button>
          <label htmlFor="backup-import" className="mt-4 block text-sm font-bold">Code ou contenu du fichier</label>
          <textarea id="backup-import" value={importText} onChange={(e) => { setImportText(e.target.value); clearImport(); }} rows={4} placeholder="Colle ici le code reçu ou le contenu du fichier JSON" className="mt-2 w-full rounded-2xl border border-border bg-white p-3 text-sm" data-testid="input-backup-code" />
          <button type="button" onClick={verify} disabled={!importText.trim()} className="btn-royal mt-3" data-testid="button-verify-backup">Vérifier la sauvegarde</button>
          {candidate && (
            <div className="mt-4 rounded-2xl border border-[hsl(268_40%_86%)] bg-white p-4" data-testid="status-backup-preview">
              <p className="font-bold">Sauvegarde vérifiée : {candidateStars} étoile{candidateStars > 1 ? "s" : ""} au total.</p>
              {confirmImport ? (
                <div className="mt-3" role="alert">
                  <p className="font-semibold">Cette action remplacera la progression enregistrée sur cet appareil. Continuer ?</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button type="button" onClick={importNow} className="btn-royal" data-testid="button-confirm-import">Oui, remplacer ma progression</button>
                    <button type="button" onClick={() => setConfirmImport(false)} className="btn-ghost" data-testid="button-cancel-import">Annuler</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => (hasProgress ? setConfirmImport(true) : importNow())} className="btn-royal mt-3" data-testid="button-import-backup">Importer cette progression</button>
              )}
            </div>
          )}
          {(msg || err) && (
            <p className={`mt-3 flex items-start gap-2 text-sm font-semibold ${err ? "text-destructive" : "text-[hsl(var(--secondary))]"}`} role={err ? "alert" : "status"} data-testid={err ? "status-transfer-error" : "status-transfer"}>
              {err && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}{err || msg}
            </p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Le code et le fichier contiennent uniquement les scores, les résultats d'épreuves et les jours joués. Garde-les privés. Les anciennes sauvegardes (version 1) sont acceptées et converties.</p>
        </section>

        <section className="mt-5 rounded-3xl border-2 border-dashed border-[hsl(8_60%_80%)] p-5">
          <h2 className="font-display text-lg font-black">Recommencer l'aventure</h2>
          <p className="mt-1 text-sm text-muted-foreground">Efface toutes les étoiles et résultats enregistrés sur cet appareil.</p>
          {!confirm ? (
            <button type="button" onClick={() => setConfirm(true)} className="btn-ghost mt-3 !text-destructive" data-testid="button-reset"><Trash2 className="h-5 w-5" aria-hidden /> Effacer ma progression</button>
          ) : (
            <div className="mt-3 flex flex-wrap gap-3" role="alert">
              <p className="w-full font-semibold">Es-tu sûre ? Cette action est définitive.</p>
              <button type="button" onClick={() => { reset(); setConfirm(false); }} className="btn-royal" style={{ background: "hsl(8 78% 46%)" }} data-testid="button-confirm-reset">Oui, tout effacer</button>
              <button type="button" onClick={() => setConfirm(false)} className="btn-ghost" data-testid="button-cancel-reset">Non, garder mes étoiles</button>
            </div>
          )}
        </section>

        <p className="mt-8 text-center text-sm font-bold text-muted-foreground" data-testid="app-version">Soumaya Academy v3.0 · Édition Interdiocésain</p>
      </div>
    </div>
  );
}
