/** Lecture de PDF dans le navigateur avec pdf.js (chargé à la demande, jamais envoyé sur un serveur). */
type PdfLib = { getDocument: (o: unknown) => { promise: Promise<PdfDoc> }; GlobalWorkerOptions: { workerSrc: string } };
interface PdfDoc { numPages: number; getPage: (n: number) => Promise<PdfPage>; destroy: () => void }
interface PdfPage { getViewport: (o: { scale: number }) => { width: number; height: number }; render: (o: unknown) => { promise: Promise<void> }; getTextContent: () => Promise<{ items: { str?: string }[] }> }
declare global { interface Window { pdfjsLib?: PdfLib; __PDFJS_BASE__?: string } }
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
let lib: Promise<PdfLib> | null = null;
export function loadPdfjs(): Promise<PdfLib> {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!lib) {
    const base = window.__PDFJS_BASE__ ?? CDN;
    lib = new Promise<PdfLib>((res, rej) => {
      const s = document.createElement('script'); s.src = base + 'pdf.min.js';
      s.onload = () => { if (window.pdfjsLib) { window.pdfjsLib.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.js'; res(window.pdfjsLib); } else rej(new Error('pdf.js indisponible')); };
      s.onerror = () => rej(new Error('Impossible de charger le lecteur PDF (connexion nécessaire pour l’import)'));
      document.head.appendChild(s);
    });
    lib.catch(() => { lib = null; });
  }
  return lib;
}
export async function readPdf(file: File, onProgress: (done: number, total: number) => void, maxPages = 60): Promise<{ blob: Blob; text: string }[]> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  if (doc.numPages > maxPages) { doc.destroy(); throw new Error(`Ce PDF a ${doc.numPages} pages (maximum ${maxPages}). Découpe-le en plusieurs fichiers.`); }
  const out: { blob: Blob; text: string }[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    onProgress(n - 1, doc.numPages);
    const page = await doc.getPage(n); const vp0 = page.getViewport({ scale: 1 }); const scale = Math.min(2, 1100 / vp0.width); const vp = page.getViewport({ scale });
    const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    const g = c.getContext('2d'); if (!g) throw new Error('Dessin indisponible');
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: g, viewport: vp }).promise;
    const blob: Blob = await new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Image impossible'))), 'image/jpeg', 0.72));
    let text = ''; try { text = (await page.getTextContent()).items.map((i) => i.str ?? '').join(' ').replace(/\s+/g, ' ').trim(); } catch { /* page scannée : pas de texte */ }
    out.push({ blob, text }); c.width = c.height = 0;
  }
  onProgress(doc.numPages, doc.numPages); doc.destroy();
  return out;
}
