// Serveur statique minimal (sans dépendance) pour Replit ou un usage local : `node server.js` puis ouvrir le port affiché.
const http = require('http'), fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'dist'), port = process.env.PORT || 3000;
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.pdf': 'application/pdf' };
http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(dir, p);
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('Introuvable'); }
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache' }); fs.createReadStream(f).pipe(r);
}).listen(port, '0.0.0.0', () => console.log('Soumaya Academy : http://localhost:' + port));
