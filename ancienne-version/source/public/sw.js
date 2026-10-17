/* Soumaya Academy — mode hors connexion.
   - /assets/* (fichiers à nom unique) : cache d'abord.
   - le reste (page, banque de séries, images) : réseau d'abord (4 s), sinon cache.
   Tout est mis en cache au fil de la navigation ; le bouton « Préparer le hors connexion » des Réglages précharge les séries. */
const V = 'soumaya-v2';
const SHELL = ['./', 'manifest.webmanifest', 'icon.svg', 'bank/bank.json', 'bank/official.json'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
const timeout = (ms) => new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms));
async function networkFirst(req) {
  const c = await caches.open(V);
  try { const res = await Promise.race([fetch(req), timeout(4000)]); if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }
  catch (err) { const hit = await c.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await c.match('./') : null); if (hit) return hit; throw err; }
}
async function cacheFirst(req) {
  const c = await caches.open(V); const hit = await c.match(req); if (hit) return hit;
  const res = await fetch(req); if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res;
}
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
  const sameOrigin = u.origin === self.location.origin;
  if (sameOrigin && u.pathname.includes('/assets/')) { e.respondWith(cacheFirst(req)); return; }
  if (sameOrigin || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') e.respondWith(networkFirst(req));
});
