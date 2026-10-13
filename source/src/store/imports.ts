/** Documents PDF importés par un adulte, stockés uniquement sur l'appareil (IndexedDB). */
export interface ImportedPage { blob: Blob; text: string }
export interface ImportedDoc {
  id: string; title: string; kind: 'epreuve' | 'corrige'; linkedTo?: string; fileName: string; importedAt: number;
  version: number; status: 'a_valider' | 'valide'; validatedAt?: number; maxPoints?: number; pages: ImportedPage[];
}
const DB = 'soumaya-imports', STORE = 'docs';
function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    if (typeof indexedDB === 'undefined') { rej(new Error('Stockage indisponible sur cet appareil')); return; }
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => { r.result.createObjectStore(STORE, { keyPath: 'id' }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error ?? new Error('Stockage indisponible'));
  });
}
const tx = async <T,>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await open();
  return new Promise((res, rej) => { const t = db.transaction(STORE, mode); const rq = fn(t.objectStore(STORE)); t.oncomplete = () => { res(rq.result); db.close(); }; t.onerror = t.onabort = () => { rej(t.error ?? new Error('Échec du stockage')); db.close(); }; });
};
export const listDocs = async (): Promise<ImportedDoc[]> => ((await tx('readonly', (s) => s.getAll())) as ImportedDoc[]).sort((a, b) => b.importedAt - a.importedAt);
export const putDoc = (d: ImportedDoc) => tx('readwrite', (s) => s.put(d));
export const deleteDoc = (id: string) => tx('readwrite', (s) => s.delete(id));
export const pageUrls = (d: ImportedDoc) => d.pages.map((p) => URL.createObjectURL(p.blob));
