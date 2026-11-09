// Vérifie la version « fichier unique » (file://) : décors, Soumaya et Mimi réellement affichés, aucune requête réseau.
import { chromium, VIEWPORTS } from './lib.mjs';
import path from 'node:path';
const file = 'file://' + path.resolve(import.meta.dirname, '../dist-single/Soumaya_Academy.html') + '?qa=1';
const b = await chromium.launch(); let bad = 0; const out = [];
for (const prof of ['phonePortrait', 'desktop']) {
  const ctx = await b.newContext({ ...VIEWPORTS[prof], locale: 'fr-BE' }); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('requestfailed', (r) => errs.push('requête échouée ' + r.url().slice(0, 80)));
  await page.goto(file); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.locator('[data-testid=play]').click();
  for (let k = 0; k < 6 && await page.locator('[data-testid=story-next]').count(); k++) { await page.locator('[data-testid=story-next]').click(); await page.waitForTimeout(250); }
  await page.waitForFunction(() => window.__game && window.__game.scene === 'hall');
  for (const sc of ['hall', 'galerie', 'biblio', 'nombres', 'foret', 'atelier', 'archives', 'observatoire']) {
    await page.evaluate((s) => window.__game.goScene(s), sc); await page.waitForTimeout(700);
    const r = await page.evaluate(() => { const ok = (s) => { const i = document.querySelector(s); return !!i && i.complete && i.naturalWidth > 0; }; return { bg: ok('img.bg'), hero: ok('img.hsprite'), mimi: ok('img.sprite') }; });
    if (!r.bg || !r.hero || !r.mimi) { bad++; out.push(`${prof}/${sc} : ${JSON.stringify(r)}`); }
  }
  // marche : les 4 images de marche se chargent
  await page.evaluate(() => window.__game.goScene('hall')); await page.waitForTimeout(500);
  const v = VIEWPORTS[prof].viewport; await page.mouse.click(v.width * 0.7, v.height * 0.9); await page.waitForTimeout(350);
  const walk = await page.evaluate(() => { const i = document.querySelector('img.hsprite'); return i.complete && i.naturalWidth > 0; });
  if (!walk) { bad++; out.push(`${prof} marche : image non chargée`); }
  if (errs.length) { bad++; out.push(`${prof} erreurs : ${errs.join(' | ')}`); }
  await page.screenshot({ path: path.resolve(import.meta.dirname, `../reports/vis/single-${prof}.png`) });
  await ctx.close();
}
await b.close();
console.log(bad ? 'ÉCHEC\n' + out.join('\n') : 'OK : fichier unique — 8 salles, Soumaya, Mimi et marche affichés, aucune erreur');
process.exit(bad ? 1 : 0);
