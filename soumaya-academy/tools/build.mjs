// Construit dist/ (dossier jouable hors ligne) et dist-single/ (fichier unique autonome).
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
await build({ entryPoints: [path.join(root, 'src/js/main.js')], bundle: true, minify: !process.env.NOMIN, format: 'iife', target: ['es2020', 'chrome87', 'safari15'], outfile: path.join(dist, 'app.js'), loader: { '.json': 'json' }, legalComments: 'none', define: { __BUILD__: JSON.stringify(new Date().toLocaleString('fr-BE', { timeZone: 'Europe/Brussels', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })) } });
fs.copyFileSync(path.join(root, 'src/css/app.css'), path.join(dist, 'app.css'));
fs.copyFileSync(path.join(root, 'src/index.html'), path.join(dist, 'index.html'));
fs.cpSync(path.join(root, 'public'), dist, { recursive: true });
// service worker : liste des fichiers à mettre en cache
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : files.push(path.relative(dist, p)); } })(dist);
const version = Date.now().toString(36);
const list = files.filter((f) => f !== 'sw.js' && !f.endsWith('.pdf')).map((f) => './' + f.split(path.sep).join('/'));
fs.writeFileSync(path.join(dist, 'sw.js'), `const V='soumaya-${version}';const FILES=${JSON.stringify(['./', ...list])};
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(['./','./app.js','./app.css','./index.html','./manifest.webmanifest'])).catch(()=>{}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x.startsWith('soumaya-')).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;if(e.request.headers.get('range')){return}const u=new URL(e.request.url),fresh=u.origin===location.origin&&/(\\/|\\.(js|css|html|webmanifest))$/.test(u.pathname);e.respondWith(fetch(fresh?new Request(e.request,{cache:'no-cache'}):e.request).then(r=>{if(r&&r.ok&&r.status===200){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c)).catch(()=>{})}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});
`);
// version fichier unique (images en data URI) pour un partage simple
const mime = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', ogg: 'audio/ogg', glb: 'model/gltf-binary', mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg' };
let js = fs.readFileSync(path.join(dist, 'app.js'), 'utf8');
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(dist, 'app.css'), 'utf8');
const assets = files.filter((f) => f.startsWith('assets' + path.sep) && /\.(webp|png|jpg|ogg|mp3)$/.test(f));
for (const a of assets) {
  const rel = a.split(path.sep).join('/');
  const uri = `data:${mime[path.extname(a).slice(1)]};base64,` + fs.readFileSync(path.join(dist, a)).toString('base64');
  js = js.split(rel).join(uri);
}
// vidéos des montées (escaliers, échelle, arbre, pont) en version légère : sinon la version dessinée monte de profil
const liteDir = path.join(root, 'tools/lite-cine');
if (fs.existsSync(liteDir)) for (const f of fs.readdirSync(liteDir).filter((x) => x.endsWith('.webm'))) {
  js = js.split('assets/cine/' + f).join('data:video/webm;base64,' + fs.readFileSync(path.join(liteDir, f)).toString('base64'));
}
// images à chemin composé (sprites) : table de correspondance lue par src/js/asset.js
const map = {};
for (const a of assets) { const rel = a.split(path.sep).join('/'); if ((rel.startsWith('assets/sprites/') || rel.startsWith('assets/voice/') || rel.startsWith('assets/sfx/'))) map[rel] = `data:${mime[path.extname(a).slice(1)]};base64,` + fs.readFileSync(path.join(dist, a)).toString('base64'); }
js = `window.__ASSETS=${JSON.stringify(map)};` + js;
html = html.replace('<link rel="stylesheet" href="app.css">', `<style>${css}</style>`).replace('<link rel="manifest" href="manifest.webmanifest">', '').replace('<script src="app.js"></script>', () => `<script>${js}</script>`);
fs.mkdirSync(path.join(root, 'dist-single'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist-single/Soumaya_Academy.html'), html);
console.log('dist OK —', files.length, 'fichiers ; single', (html.length / 1e6).toFixed(1), 'Mo');
