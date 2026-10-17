// Hors ligne : met en cache les fichiers de l'application au fil de leur utilisation (cache d'abord, réseau en secours).
const CACHE = "soumaya-academy-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    const net = fetch(req).then((r) => { if (r.ok) cache.put(req, r.clone()); return r; }).catch(() => undefined);
    if (hit) { void net; return hit; }
    const r = await net;
    if (r) return r;
    if (req.mode === "navigate") return (await cache.match("./index.html")) || (await cache.match("/")) || Response.error();
    return Response.error();
  })());
});
