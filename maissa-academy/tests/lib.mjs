import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(process.env.PW_MODULES ? process.env.PW_MODULES + '/' : import.meta.url);
export const { chromium, devices } = require('playwright');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.pdf': 'application/pdf' };
export function serve(dir, port = 0) {
  return new Promise((res) => {
    const s = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(dir, p);
      if (!f.startsWith(dir) || !fs.existsSync(f)) { r.writeHead(404); r.end('404'); return; }
      r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
    }).listen(port, '127.0.0.1', () => res({ server: s, url: `http://127.0.0.1:${s.address().port}/` }));
  });
}
export const VIEWPORTS = {
  phonePortrait: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 },
  phoneLandscape: { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 },
  foldInner: { viewport: { width: 720, height: 840 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 },
  tablet: { viewport: { width: 1024, height: 768 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 },
  desktop: { viewport: { width: 1280, height: 720 }, hasTouch: false, isMobile: false, deviceScaleFactor: 1 },
};
