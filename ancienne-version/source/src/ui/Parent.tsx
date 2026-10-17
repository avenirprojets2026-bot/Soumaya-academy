import { Ico } from './Icons';
import { ImportPanel } from './ImportPanel';
import { useState } from 'react';
import { exportJson, hashPin, resetAll, update, useSave } from '../store/save';
import { SKILLS } from '../engine/generators';
import { masteryEstimate, MIN_ATTEMPTS_FOR_MASTERY, dueSkills } from '../engine/mastery';
import type { SkillId } from '../engine/types';
import type { Nav } from './Screens';
import { fr } from '../engine/format';

export default function Parent({ nav }: { nav: Nav }) {
  const save = useSave();
  const [ok, setOk] = useState(false);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const first = save.pinHash === null;

  if (!ok) return (
    <div className="h-full flex items-center justify-center p-4" style={{ background: 'linear-gradient(#1c1250,#2b1b8a)' }}>
      <div className="panel p-6 max-w-sm w-full flex flex-col gap-3">
        <h1 className="text-2xl font-extrabold"><Ico n="lock" /> Espace parent</h1>
        <p>{first ? 'Choisis un code à 4 chiffres pour protéger cet espace (il reste sur cet appareil).' : 'Entre le code à 4 chiffres.'}</p>
        <input inputMode="numeric" maxLength={4} type="password" aria-label="Code parent" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} className="text-center text-3xl rounded-xl py-2 text-indigo-900 tracking-[.5em] focusable" />
        {err && <div className="text-amber-300">{err}</div>}
        <button className="btn btn-gold" disabled={pin.length !== 4} onClick={async () => {
          const h = await hashPin(pin);
          if (first) { update((s) => ({ ...s, pinHash: h })); setOk(true); } else if (h === save.pinHash) setOk(true); else setErr('Code incorrect.');
        }}>{first ? 'Enregistrer le code' : 'Entrer'}</button>
        <button className="btn btn-ghost" onClick={() => nav.go('welcome')}>← Retour</button>
      </div>
    </div>);

  const skills = Object.keys(SKILLS) as SkillId[];
  const rows = skills.map((k) => { const st = save.stats[k]; return { k, label: SKILLS[k].label, st, m: masteryEstimate(save.history, k), acc: st && st.attempts ? Math.round((st.correct / st.attempts) * 100) : null }; });
  const due = new Set(dueSkills(save.stats, Date.now()));
  const reco = rows.filter((r) => r.st && r.st.attempts >= 3 && ((r.acc ?? 100) < 70 || due.has(r.k)));
  const minutes = Math.round(save.history.reduce((n, h) => n + h.ms, 0) / 60000);
  const last = [...save.history].reverse().slice(0, 25);

  return (
    <div className="h-full overflow-y-auto bg-slate-50 text-slate-900 print:overflow-visible">
      <div className="max-w-4xl mx-auto p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
          <button className="btn btn-violet !py-2 !text-base" onClick={() => nav.go('welcome')}>← Quitter l’espace parent</button>
          <div className="flex gap-2"><button className="btn btn-gold !py-2 !text-base" onClick={() => window.print()}><Ico n="print" /> Imprimer / PDF</button>
            <button className="btn btn-green !py-2 !text-base" onClick={() => { const b = new Blob([exportJson()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'soumaya-academy-donnees.json'; a.click(); }}>⬇ Exporter les données</button></div>
        </div>
        <h1 className="text-3xl font-extrabold">Suivi de {save.profile.name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[['Réponses', save.history.length], ['Temps de jeu (approx.)', `${minutes} min`], ['Niveaux terminés', Object.keys(save.levels).length], ['Évaluations blanches', save.exams.length]].map(([l, v]) => <div key={String(l)} className="bg-white rounded-2xl p-3 shadow"><div className="text-sm text-slate-500">{l}</div><div className="text-2xl font-extrabold">{v}</div></div>)}
        </div>
        <section className="bg-white rounded-2xl p-4 shadow"><h2 className="text-xl font-bold mb-2">Compétences</h2>
          <p className="text-sm text-slate-500 mb-2">Le pourcentage de maîtrise n’est affiché qu’à partir de {MIN_ATTEMPTS_FOR_MASTERY} exercices d’entraînement : en dessous, l’estimation ne serait pas fiable.</p>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-1">Compétence</th><th>Essais</th><th>Réussite</th><th>Indices</th><th>Maîtrise estimée</th></tr></thead><tbody>
            {rows.map((r) => <tr key={r.k} className="border-b"><td className="py-1.5 pr-2">{r.label}</td><td>{r.st?.attempts ?? 0}</td><td>{r.acc === null ? '—' : <div className="flex items-center gap-2"><div className="w-20 h-2 bg-slate-200 rounded"><div className="h-2 rounded bg-indigo-500" style={{ width: `${r.acc}%` }} /></div>{r.acc}%</div>}</td><td>{r.st?.hintsUsed ?? 0}</td><td>{r.m === null ? <span className="text-slate-400">données insuffisantes</span> : `${r.m} %`}</td></tr>)}
          </tbody></table></div></section>
        <section className="bg-white rounded-2xl p-4 shadow"><h2 className="text-xl font-bold mb-2">Recommandations de révision</h2>
          {reco.length ? <ul className="list-disc pl-5">{reco.map((r) => <li key={r.k}>{r.label} — {due.has(r.k) ? 'à réviser aujourd’hui (répétition espacée)' : `réussite de ${r.acc} %`}</li>)}</ul> : <p className="text-slate-500">Rien à signaler pour l’instant (ou pas assez de données).</p>}</section>
        <section className="bg-white rounded-2xl p-4 shadow"><h2 className="text-xl font-bold mb-2">Évaluations blanches</h2>
          {save.exams.length ? <ul>{save.exams.map((e) => <li key={e.t}>{new Date(e.t).toLocaleDateString('fr-BE')} — {e.score}/{e.total}</li>)}</ul> : <p className="text-slate-500">Aucune pour l’instant.</p>}</section>
        <section className="bg-white rounded-2xl p-4 shadow"><h2 className="text-xl font-bold mb-2">Séries et épreuves officielles</h2>
          {save.seriesRuns.length ? <ul className="flex flex-col gap-1">{[...save.seriesRuns].reverse().map((r) => <li key={r.t}><b>{new Date(r.t).toLocaleDateString('fr-BE')}</b> — {r.label} : {String(r.score).replace('.', ',')} / {String(r.total).replace('.', ',')}{Object.keys(r.parts).length > 1 ? ' (' + Object.entries(r.parts).map(([k, [g, m]]) => `${k} ${String(g).replace('.', ',')}/${String(m).replace('.', ',')}`).join(' · ') + ')' : ''}</li>)}</ul> : <p className="text-slate-500">Aucune série terminée pour l’instant.</p>}</section>
        <section className="bg-white rounded-2xl p-4 shadow"><h2 className="text-xl font-bold mb-2">Dernières réponses</h2>
          <div className="overflow-x-auto"><table className="w-full text-sm"><tbody>{last.map((h, i) => <tr key={i} className="border-b"><td className="py-1">{h.correct ? <Ico n="check" className="text-green-600" label="juste" /> : <Ico n="cross" className="text-red-600" label="faux" />}</td><td>{h.prompt}</td><td className="pl-2 text-slate-500">réponse : {h.given || '—'}{h.correct ? '' : ` (attendu ${/^-?\d+(\.\d+)?$/.test(h.expected) ? fr(Number(h.expected)) : h.expected})`}</td><td className="text-slate-400">{h.mode === 'exam' ? 'examen' : `${h.hintsUsed} indice(s)`}</td></tr>)}</tbody></table></div></section>
        <ImportPanel />
        <section className="bg-white rounded-2xl p-4 shadow print:hidden"><h2 className="text-xl font-bold mb-2">Contenus importés & données</h2>
          <p className="text-slate-600 mb-2">Contenus intégrés : 5 séries (175 questions avec corrigé du guide parent) et 7 documents officiels de juin 2025 (39 pages, sans corrigé officiel). Extraction automatique, statut « à valider » : un adulte vérifie. Documents officiels intégrés à la demande de l’enseignant : ne partage pas le lien du jeu publiquement. Nouveaux PDF : section « Importer un document PDF » ci-dessus. Les données restent sur cet appareil (aucun envoi).</p>
          <button className="btn !py-2 !text-base bg-red-600 text-white" onClick={() => { if (confirm('Supprimer toutes les données de progression ?')) { resetAll(); nav.go('welcome'); } }}>Supprimer toutes les données</button></section>
      </div>
    </div>);
}
