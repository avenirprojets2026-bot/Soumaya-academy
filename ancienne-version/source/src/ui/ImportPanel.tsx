import { useCallback, useEffect, useState } from 'react';
import { deleteDoc, listDocs, pageUrls, putDoc, type ImportedDoc } from '../store/imports';
import { readPdf } from '../store/pdf';
import { Ico } from './Icons';

const fdate = (t: number) => new Date(t).toLocaleDateString('fr-BE');
export function ImportPanel() {
  const [docs, setDocs] = useState<ImportedDoc[] | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<'epreuve' | 'corrige'>('epreuve');
  const [linked, setLinked] = useState('');
  const [max, setMax] = useState('');
  const [view, setView] = useState<{ id: string; urls: string[] } | null>(null);
  const refresh = useCallback(() => { listDocs().then(setDocs).catch((e) => { setDocs([]); setErr(String(e.message ?? e)); }); }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => () => { view?.urls.forEach(URL.revokeObjectURL); }, [view]);
  const epreuves = (docs ?? []).filter((d) => d.kind === 'epreuve');

  const onFile = (f: File | null) => { setFile(f); setErr(''); if (f) { setTitle(f.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ')); setKind(/corrig/i.test(f.name) ? 'corrige' : 'epreuve'); } };
  const run = async () => {
    if (!file) return; setErr('');
    if (file.type && file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) { setErr('Ce fichier n’est pas un PDF.'); return; }
    if (file.size > 40 * 1024 * 1024) { setErr('Fichier trop lourd (40 Mo maximum).'); return; }
    if (kind === 'corrige' && !linked) { setErr('Choisis l’épreuve à laquelle ce corrigé correspond.'); return; }
    try {
      setBusy('Lecture du PDF…');
      const pages = await readPdf(file, (d, t) => setBusy(`Page ${Math.min(d + 1, t)} sur ${t}…`));
      const maxPoints = Number(max.replace(',', '.')); 
      const doc: ImportedDoc = { id: `imp-${Date.now().toString(36)}`, title: title.trim() || file.name, kind, linkedTo: kind === 'corrige' ? linked : undefined, fileName: file.name, importedAt: Date.now(), version: 1, status: 'a_valider', maxPoints: Number.isFinite(maxPoints) && maxPoints > 0 ? maxPoints : undefined, pages };
      await putDoc(doc); setFile(null); setTitle(''); setMax(''); setLinked(''); refresh();
    } catch (e) { setErr(String((e as Error).message ?? e)); } finally { setBusy(''); }
  };
  const validate = async (d: ImportedDoc, ok: boolean) => { await putDoc({ ...d, status: ok ? 'valide' : 'a_valider', validatedAt: ok ? Date.now() : undefined }); refresh(); };
  const remove = async (d: ImportedDoc) => { if (!confirm(`Supprimer « ${d.title} » de cet appareil ?`)) return; await deleteDoc(d.id); if (view?.id === d.id) setView(null); refresh(); };
  const toggleView = (d: ImportedDoc) => { if (view) view.urls.forEach(URL.revokeObjectURL); setView(view?.id === d.id ? null : { id: d.id, urls: pageUrls(d) }); };

  return (
    <section className="bg-white rounded-2xl p-4 shadow print:hidden"><h2 className="text-xl font-bold mb-1">Importer un document PDF</h2>
      <p className="text-slate-600 text-sm mb-3">Le PDF est lu sur cet appareil et reste ici : rien n’est envoyé. Chaque page devient une page à faire. Un document importé reste « à valider » : l’enfant ne le voit qu’après ta validation. Les corrigés ne sont jamais inventés : tu importes le corrigé officiel, ou tu corriges toi-même.</p>
      <div className="flex flex-col gap-2">
        <input id="pdf-file" type="file" accept="application/pdf,.pdf" aria-label="Choisir un fichier PDF" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="text-sm" />
        {file && <>
          <label className="flex flex-col text-sm">Titre<input id="pdf-title" value={title} onChange={(e) => setTitle(e.target.value)} className="border rounded px-2 py-1" /></label>
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-1"><input type="radio" name="k" checked={kind === 'epreuve'} onChange={() => setKind('epreuve')} /> Épreuve ou série à faire</label>
            <label className="flex items-center gap-1"><input type="radio" name="k" checked={kind === 'corrige'} onChange={() => setKind('corrige')} /> Corrigé (réservé à l’adulte)</label>
          </div>
          {kind === 'corrige' ? <label className="flex flex-col text-sm">Corrigé de quelle épreuve ?<select id="pdf-link" value={linked} onChange={(e) => setLinked(e.target.value)} className="border rounded px-2 py-1"><option value="">— choisir —</option>{epreuves.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}</select></label>
            : <label className="flex flex-col text-sm">Total des points de l’épreuve (facultatif)<input id="pdf-max" inputMode="decimal" value={max} onChange={(e) => setMax(e.target.value)} className="border rounded px-2 py-1 w-28" /></label>}
          <button id="pdf-go" className="btn btn-green !py-2 !text-base self-start" disabled={!!busy} onClick={run}><Ico n="upload" /> {busy || 'Importer'}</button>
        </>}
        {err && <p className="text-red-600 text-sm" role="alert">{err}</p>}
      </div>
      <h3 className="font-bold mt-4 mb-1">Documents importés</h3>
      {docs === null ? <p className="text-slate-500">Chargement…</p> : docs.length === 0 ? <p className="text-slate-500">Aucun pour l’instant.</p> :
        <ul className="flex flex-col gap-2">{docs.map((d) => (
          <li key={d.id} className="border rounded-xl p-2 text-sm" data-testid="imported">
            <div className="font-bold">{d.title} <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${d.status === 'valide' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{d.status === 'valide' ? 'validé' : 'à valider'}</span> <span className="text-xs text-slate-500">{d.kind === 'corrige' ? 'corrigé' : 'épreuve'}</span></div>
            <div className="text-slate-500">Source : {d.fileName} · importé le {fdate(d.importedAt)} · {d.pages.length} page(s) · version {d.version}{d.validatedAt ? ` · validé le ${fdate(d.validatedAt)}` : ''}{d.linkedTo ? ` · corrigé de « ${docs.find((x) => x.id === d.linkedTo)?.title ?? 'épreuve supprimée'} »` : ''}</div>
            <div className="flex flex-wrap gap-2 mt-1">
              <button className="btn !py-1 !text-sm bg-slate-200 text-slate-900" onClick={() => toggleView(d)}>{view?.id === d.id ? 'Masquer' : 'Relire les pages'}</button>
              {d.status === 'a_valider' ? <button className="btn !py-1 !text-sm bg-green-600 text-white" onClick={() => validate(d, true)}>Valider</button> : <button className="btn !py-1 !text-sm bg-slate-200 text-slate-900" onClick={() => validate(d, false)}>Retirer la validation</button>}
              <button className="btn !py-1 !text-sm bg-red-600 text-white" onClick={() => remove(d)}>Supprimer</button>
            </div>
            {view?.id === d.id && <div className="mt-2 flex flex-col gap-2 max-h-96 overflow-y-auto border rounded p-1">{view.urls.map((u, i) => <img key={u} src={u} alt={`${d.title}, page ${i + 1}`} className="w-full" loading="lazy" />)}</div>}
          </li>))}</ul>}
    </section>);
}
