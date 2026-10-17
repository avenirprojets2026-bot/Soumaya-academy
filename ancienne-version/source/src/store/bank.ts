export interface BankItem {
  id: string; page: number; image: string; texte: string; corrige: string; source: string; validation: string;
  serie?: number; serieTitre?: string; partie?: string; label?: string; points?: number | null;
  doc?: number; docTitre?: string; intro?: string[]; pages?: number;
}
export interface Bank { series: BankItem[]; official: BankItem[] }
export const PARTS: { id: string; label: string }[] = [
  { id: 'arithmetique', label: 'Arithmétique' }, { id: 'grandeurs', label: 'Grandeurs' },
  { id: 'geometrie', label: 'Géométrie' }, { id: 'statistiques', label: 'Statistiques et logique' },
];
export const DOC_TITLES: Record<number, string> = {
  1: 'Formation historique', 2: 'Sciences — démarche d’investigation', 4: 'Éducation à la philosophie et à la citoyenneté',
  5: 'Organisation des données et statistique', 6: 'Écrire et parler', 8: 'Lire et grandeurs', 10: 'De l’arithmétique à l’algèbre',
};
let cache: Promise<Bank> | null = null;
export function loadBank(): Promise<Bank> {
  if (!cache) {
    cache = (async () => {
      const a = await fetch('bank/bank.json'); if (!a.ok) throw new Error('Banque introuvable');
      // Les documents officiels sont facultatifs : absents d'un site public (droits), ils s'importent via l'Espace parent.
      let official: BankItem[] = [];
      try { const b = await fetch('bank/official.json'); if (b.ok) official = (await b.json()).items as BankItem[]; } catch { /* absent */ }
      return { series: (await a.json()).items as BankItem[], official };
    })();
    cache.catch(() => { cache = null; });
  }
  return cache;
}
export const maxPoints = (items: BankItem[]) => items.reduce((n, i) => n + (i.points ?? 0), 0);
