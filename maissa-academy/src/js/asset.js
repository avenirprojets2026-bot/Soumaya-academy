// Résout un chemin d'image. Dans la version « fichier unique », les images dynamiques (poses de Maissa et de Muezza)
// sont fournies par window.__ASSETS (data URI) ; sinon le chemin est utilisé tel quel.
export const asset = (p) => (typeof window !== 'undefined' && window.__ASSETS && window.__ASSETS[p]) || p;
