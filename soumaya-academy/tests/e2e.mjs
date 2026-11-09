// Tests de parcours (Playwright / Chromium). Usage : node tests/e2e.mjs [profil|all]
import { serve, chromium, VIEWPORTS } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';
const dist = path.resolve(import.meta.dirname, '../dist');
const profiles = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2]] : Object.keys(VIEWPORTS);
const { server, url } = await serve(dist);
const browser = await chromium.launch();
const results = []; let shots = 0;
const SHOT = path.resolve(import.meta.dirname, '../reports/shots'); fs.mkdirSync(SHOT, { recursive: true });

async function run(profile) {
  const ctx = await browser.newContext({ ...VIEWPORTS[profile], locale: 'fr-BE' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message + ' @ ' + String(e.stack).split('\n').slice(1, 3).join(' <- ')));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('requestfailed', (r) => { const f = r.failure(); if (f && /ERR_ABORTED|NS_BINDING_ABORTED/.test(f.errorText)) return; errors.push('requestfailed: ' + r.url() + (f ? ' ' + f.errorText : '')); });
  const T = (name, fn) => async () => {
    try { await fn(); results.push({ profile, name, ok: true }); }
    catch (e) { results.push({ profile, name, ok: false, err: String(e.message).split('\n')[0] }); await page.screenshot({ path: `${SHOT}/FAIL-${profile}-${name.replace(/\W+/g, '_')}.png` }).catch(() => {}); }
  };
  const tap = async (sel) => { const l = page.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 8000 }); VIEWPORTS[profile].hasTouch ? await l.tap({ timeout: 8000 }) : await l.click({ timeout: 8000 }); };
  const shot = async (n) => { await page.screenshot({ path: `${SHOT}/${profile}-${n}.png` }); shots++; };
  const sceneIs = async (id) => page.waitForFunction((i) => window.__game && window.__game.scene === i && !document.getElementById('app').classList.contains('fading'), id, { timeout: 8000 });
  const noOverlap = async () => {
    const info = await page.evaluate(() => ({ dialogs: document.querySelectorAll('.dialog').length, actors: document.querySelectorAll('.actor').length, sx: document.scrollingElement.scrollWidth - innerWidth, sy: document.scrollingElement.scrollHeight - innerHeight }));
    if (info.dialogs > 1) throw new Error('plusieurs panneaux superposés');
    if (info.actors > 1) throw new Error('personnage dupliqué');
    if (info.sx > 1 || info.sy > 1) throw new Error('défilement parasite de la page');
  };
  const clickHotspot = async (id) => {
    const sel = `.hotspot[data-id="${id}"]`;
    await page.locator(sel).waitFor({ state: 'attached' });
    const visible = await page.evaluate((s) => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2; return e.style.visibility !== 'hidden' && cx >= 20 && cx <= innerWidth - 20 && cy >= 50 && cy <= innerHeight - 20; }, sel);
    if (visible) await tap(sel);
    else await tap(`.edge[aria-label^="${await page.locator(sel).getAttribute('aria-label')}"]`);
  };
  async function playMission({ pass = true }) {
    await tap('[data-testid=start-mission]');
    let n = 0;
    while (await page.locator('[data-testid=prompt]').count()) {
      await page.locator('[data-testid=prompt]').waitFor();
      const q = await page.evaluate(() => window.__q); globalThis.__lastQ = q;
      if (q.type === 'saisie') {
        const ans = pass ? q.accepted[0] : 'zzz';
        await page.fill('[data-testid=answer-input]', ans); await tap('[data-testid=validate]');
      } else {
        const idx = pass ? q.answer : (q.answer + 1) % q.choices.length;
        await tap(`[data-testid=choice][data-index="${idx}"]`);
      }
      await page.locator('.feedback:not([hidden])').waitFor({ timeout: 4000 });
      n++;
      await tap('[data-testid=next]');
      await page.waitForTimeout(120);
      if (n > 12) throw new Error('mission sans fin');
    }
    return n;
  }

  await T('01 lancement sans erreur', async () => {
    await page.goto(url + (process.env.SOFTGL ? '?qa=1&h3=0' : '?qa=1')); await page.evaluate(() => localStorage.clear()); await page.reload();
    await page.locator('[data-testid=play]').waitFor();
    await shot('01-titre'); await noOverlap();
  })();
  await T('02 bouton Jouer -> histoire -> grande salle', async () => {
    await tap('[data-testid=play]');
    for (let k = 0; k < 6 && await page.locator('[data-testid=story-next]').count(); k++) { await tap('[data-testid=story-next]'); await page.waitForTimeout(350); }
    await page.waitForSelector('#app[data-screen=game]'); await sceneIs('hall'); await page.waitForTimeout(500); await shot('02-hall'); await noOverlap();
    if (await page.locator('.actor').count() !== 1) throw new Error('Mimi absente ou dupliquée');
  })();
  await T('03 carte des mondes et salles', async () => {
    await clickHotspot('gate'); await sceneIs('map'); await shot('03-carte'); await noOverlap();
    for (const [node, scene] of [['n-atelier', 'atelier'], ['n-biblio', 'biblio'], ['n-foret', 'foret'], ['n-nombres', 'nombres'], ['n-archives', 'archives'], ['n-obs', 'observatoire']]) {
      await clickHotspot(node); await sceneIs(scene); await page.waitForTimeout(250); await shot('04-' + scene); await noOverlap();
      await tap('#btn-home'); await sceneIs('map');
    }
  })();
  await T('04 interaction décor -> exercice -> réponses -> résultat', async () => {
    await clickHotspot('n-atelier'); await sceneIs('atelier');
    await clickHotspot('a-potions');
    await page.locator('[data-testid=start-mission]').waitFor({ timeout: 25000 }); await shot('05-intro-mission'); await noOverlap();
    const n = await playMission({ pass: true });
    if (n < 3) throw new Error('moins de 3 questions');
    await page.locator('[data-testid=result-stars]').waitFor();
    const score = await page.locator('[data-testid=result-score]').innerText();
    if (!/5 \/ 5|\d \/ \d/.test(score)) throw new Error('score illisible: ' + score);
    await shot('06-resultat'); await noOverlap();
    const st = await page.evaluate(() => window.__game.S.get());
    if (!(st.subjects.maths.stars[1] >= 1)) throw new Error('étoile non enregistrée');
    if (st.subjects.maths.unlocked < 2) throw new Error('niveau 2 non débloqué');
  })();
  await T('05 récompenses (badge, pièces, galerie)', async () => {
    const st = await page.evaluate(() => window.__game.S.get());
    if (!st.badges.first) throw new Error('badge Première étoile absent');
    if (st.coins <= 0) throw new Error('aucune pièce');
    await tap('[data-testid=back]'); await page.waitForTimeout(200);
    await tap('#btn-menu'); await page.locator('.dialog').waitFor(); await shot('07-passeport'); await noOverlap(); await page.keyboard.press('Escape');
  })();
  await T('06 niveau suivant puis échec (réponses fausses) sans blocage', async () => {
    await clickHotspot('a-potions'); await page.locator('[data-testid=start-mission]').waitFor();
    await page.locator('.chip[data-level="2"]').click(); // niveau 2 doit être débloqué
    await playMission({ pass: false });
    await page.locator('[data-testid=result-stars]').waitFor();
    const stars = await page.locator('.big-stars .star.on').count();
    if (stars !== 0) throw new Error('étoiles attribuées malgré 0 bonne réponse');
    await tap('[data-testid=back]'); await page.waitForTimeout(200); await noOverlap();
  })();
  await T('07 sauvegarde et restauration après rechargement', async () => {
    const before = await page.evaluate(() => JSON.stringify(window.__game.S.get().subjects));
    await page.reload(); await page.locator('[data-testid=play]').waitFor();
    const txt = await page.locator('[data-testid=play]').innerText();
    if (!/Continuer/.test(txt)) throw new Error('bouton Continuer absent après progression');
    const after = await page.evaluate(() => JSON.stringify(window.__game.S.get().subjects));
    if (before !== after) throw new Error('progression différente après rechargement');
    await tap('[data-testid=play]'); await sceneIs('hall');
  })();
  await T('08 retour à l’accueil depuis une salle', async () => {
    await tap('#btn-home'); await sceneIs('map'); await tap('#btn-home'); await sceneIs('hall'); await noOverlap();
  })();
  await T('09 examen blanc complet', async () => {
    await clickHotspot('gate'); await sceneIs('map'); await clickHotspot('n-defi');
    await page.locator('[data-testid=exam-mixte-0]').waitFor(); await shot('08-examens');
    await tap('[data-testid=exam-nombres-0]');
    let n = 0;
    while (await page.locator('[data-testid=prompt]').count()) {
      const q = await page.evaluate(() => window.__q);
      if (q.type === 'saisie') { await page.fill('[data-testid=answer-input]', q.accepted[0]); await tap('[data-testid=validate]'); }
      else await tap(`[data-testid=choice][data-index="${q.answer}"]`);
      await page.locator('[data-testid=next]:not([hidden])').waitFor(); await tap('[data-testid=next]'); n++; await page.waitForTimeout(100);
      if (n > 12) throw new Error('examen sans fin');
    }
    if (n !== 10) throw new Error('examen de ' + n + ' questions');
    await page.locator('[data-testid=exam-end]').waitFor(); await shot('09-examen-correction'); await tap('[data-testid=exam-end]');
    const ex = await page.evaluate(() => window.__game.S.get().exams.length); if (ex !== 1) throw new Error('examen non enregistré');
  })();
  await T('10 activité à saisie libre / atelier d’écriture', async () => {
    await tap('#btn-home'); await sceneIs('hall'); await clickHotspot('gate'); await sceneIs('map');
    await clickHotspot('n-foret'); await sceneIs('foret');
    await clickHotspot('f-quill'); await page.locator('[data-testid=open-text]').waitFor(); await page.fill('[data-testid=open-text]', 'Un matin, je trouve une clé.');
    await tap('[data-testid=open-done]'); await page.waitForTimeout(300); await noOverlap();
  })();
  await T('10b mission de lecture (texte + questions) en bibliothèque', async () => {
    await tap('#btn-home'); await sceneIs('map'); await clickHotspot('n-biblio'); await sceneIs('biblio');
    await clickHotspot('b-books'); await page.locator('[data-testid=start-mission]').waitFor({ timeout: 25000 });
    const n = await playMission({ pass: true });
    await page.locator('[data-testid=result-stars]').waitFor(); await shot('10-lecture-resultat');
    if (n < 2) throw new Error('lecture: ' + n + ' questions');
    await tap('[data-testid=back]'); await noOverlap();
  })();
  await T('10c missions français, éveil et maths dans chaque salle', async () => {
    const plan = [['foret', 'f-key', 'n-foret'], ['archives', 'r-orb', 'n-archives'], ['observatoire', 'o-dome', 'n-obs'], ['nombres', 'n-stairs', 'n-nombres']];
    for (const [scene, hs, node] of plan) {
     let st = 'home';
     try {
      await tap('#btn-home'); st = 'map'; await sceneIs('map'); st = 'node'; await clickHotspot(node); st = 'scene'; await sceneIs(scene); st = 'hotspot';
      await clickHotspot(hs); st = 'start'; await page.locator('[data-testid=start-mission]').waitFor({ timeout: 25000 }).catch(async (e) => { throw new Error('start-mission absent ; dialogue=' + (await page.evaluate(() => document.querySelector('.dialog')?.innerText?.slice(0, 120)))); });
      const n = await playMission({ pass: true }); if (n < 3) throw new Error(scene + ': ' + n + ' questions');
      await page.locator('[data-testid=result-stars]').waitFor().catch(async () => { throw new Error('result-stars absent après ' + n + ' questions ; écran=' + (await page.evaluate(() => document.querySelector('.dialog')?.innerText?.slice(0, 150)))); }); await tap('[data-testid=back]'); await noOverlap();
     } catch (e) { throw new Error(scene + '@' + st + ' : ' + String(e.message).split('\n')[0] + ' | q=' + JSON.stringify(globalThis.__lastQ).slice(0, 300)); }
    }
  })();
  await T('10d exploration complète (histoire, lexique, défi)', async () => {
    await tap('#btn-home'); await sceneIs('map'); await clickHotspot('n-obs'); await sceneIs('observatoire');
    await clickHotspot('o-explo'); await page.locator('[data-testid=exploration][data-id=lune]').waitFor(); await shot('11-explorations'); await noOverlap();
    await tap('[data-testid=exploration][data-id=lune]');
    for (let k = 0; k < 10 && await page.locator('[data-testid=story-more]').count(); k++) await tap('[data-testid=story-more]');
    await shot('12-exploration-histoire'); await tap('[data-testid=to-lexicon]'); await tap('[data-testid=to-challenge]');
    let n = 0;
    while (await page.locator('[data-testid=prompt]').count()) {
      const q = await page.evaluate(() => window.__q);
      await tap(`[data-testid=choice][data-index="${q.answer}"]`); await page.locator('[data-testid=next]:not([hidden])').waitFor(); await tap('[data-testid=next]'); n++; await page.waitForTimeout(100);
      if (n > 12) throw new Error('défi sans fin');
    }
    if (n < 3) throw new Error('défi de ' + n + ' questions');
    await page.waitForTimeout(300); await noOverlap();
    if (!(await page.evaluate(() => window.__game.S.get().explo.lune))) throw new Error('exploration non enregistrée');
  })();
  await T('10e bouton Quitter (mission et examen) : Non puis Oui, retour sans blocage', async () => {
    if (await page.locator('.dialog').count()) { await page.keyboard.press('Escape'); await page.locator('.dialog').waitFor({ state: 'detached', timeout: 4000 }); }
    await tap('#btn-home'); await sceneIs('map'); await clickHotspot('n-foret'); await sceneIs('foret');
    await clickHotspot('f-key'); await page.locator('[data-testid=start-mission]').waitFor({ timeout: 25000 }); await tap('[data-testid=start-mission]');
    await tap('[data-testid=quit]'); await tap('[data-testid=confirm-no]');
    await page.locator('[data-testid=prompt]').waitFor(); await tap('[data-testid=quit]'); await tap('[data-testid=confirm-yes]');
    await page.locator('.dialog').waitFor({ state: 'detached', timeout: 4000 }); await sceneIs('foret'); await noOverlap();
    await tap('#btn-home'); await sceneIs('map'); await clickHotspot('n-defi'); await tap('[data-testid=exam-nombres-0]');
    await tap('[data-testid=quit]'); await tap('[data-testid=confirm-yes]');
    await page.locator('.dialog').waitFor({ state: 'detached', timeout: 4000 }); await noOverlap(); await shot('13-quitter');
  })();
  await T('10f Mimi : câlin, sommeil, réveil, fiche (croquette, nœud, pelage), bulle après réponse', async () => {
    if (await page.locator('.dialog').count()) { await page.keyboard.press('Escape'); await page.locator('.dialog').waitFor({ state: 'detached', timeout: 4000 }); }
    await page.evaluate(() => window.__game.goScene('hall')); await sceneIs('hall');
    const bond0 = await page.evaluate(() => window.__game.S.get().mimi.bond);
    await page.evaluate(() => { window.__game.S.get().mimi.lastPet = 0; });
    await page.locator('.actor').first().evaluate((e) => e.click());
    await page.locator('.mimi-say').waitFor({ timeout: 3000 });
    const bond1 = await page.evaluate(() => window.__game.S.get().mimi.bond); if (bond1 !== bond0 + 1) throw new Error('lien non incrémenté ' + bond0 + '→' + bond1);
    await page.evaluate(() => window.__game.room.sleep());
    if (!(await page.locator('.actor.sleeping').count())) throw new Error('Mimi ne dort pas'); await shot('14-mimi-dort');
    await page.locator('.actor').first().evaluate((e) => e.click());
    await page.waitForFunction(() => !document.querySelector('.actor.sleeping'), null, { timeout: 3000 });
    await page.evaluate(() => { const st = window.__game.S.get(); st.coins = 100; st.mimi.bond = 35; st.mimi.lastFeed = 0; window.__game.S.save(); });
    await clickHotspot('mimi'); await page.locator('[data-testid=mimi-hug]').waitFor(); if (/null|undefined/.test(await page.locator('.dialog').innerText())) throw new Error('texte parasite dans la fiche'); await shot('15-fiche-mimi');
    await tap('[data-testid=mimi-treat]');
    const m = await page.evaluate(() => ({ c: window.__game.S.get().coins, f: window.__game.S.get().mimi.fed })); if (m.c !== 90 || m.f !== 1) throw new Error('croquette : ' + JSON.stringify(m));
    await tap('[data-bow=violet]');
    if ((await page.evaluate(() => window.__game.S.get().mimi.bow)) !== 'violet') throw new Error('nœud non appliqué');
    if (!(await page.locator('[data-bow=vert]').isDisabled())) throw new Error('nœud verrouillé accessible');
    await tap('[data-fur=blanc]'); await tap('[data-fur=noir]');
    if ((await page.evaluate(() => window.__game.S.get().mimi.fur)) !== 'noir') throw new Error('pelage');
    await page.keyboard.press('Escape'); await page.locator('.dialog').waitFor({ state: 'detached', timeout: 4000 }); await noOverlap();
    const src = await page.locator('.actor .sprite').getAttribute('src'); if (!/noir-violet/.test(src)) throw new Error('sprite non mis à jour : ' + src);
    // bulle de Mimi dans une mission
    await tap('#btn-home'); await sceneIs('map'); await clickHotspot('n-foret'); await sceneIs('foret'); await clickHotspot('f-key'); await page.locator('[data-testid=start-mission]').waitFor({ timeout: 25000 }); await tap('[data-testid=start-mission]');
    const q = await page.evaluate(() => window.__q);
    if (q.type === 'saisie') { await page.fill('[data-testid=answer-input]', q.accepted[0]); await tap('[data-testid=validate]'); }
    else await tap(`[data-testid=choice][data-index="${q.answer}"]`);
    await page.locator('.feedback .mimi-chip').waitFor({ timeout: 6000 });
    if (/null|undefined/.test(await page.locator('.dialog').innerText())) throw new Error('texte parasite (null/undefined) dans la mission'); await shot('16-retour-mimi');
  })();
  await T('10g réglages de la voix : liste des voix, vitesse, test sans erreur', async () => {
    if (await page.locator('[data-testid=quit]').count()) { await tap('[data-testid=quit]'); await tap('[data-testid=confirm-yes]'); }
    if (await page.locator('.dialog').count()) { await page.keyboard.press('Escape'); await page.locator('.dialog').waitFor({ state: 'detached', timeout: 4000 }); }
    await tap('#btn-menu'); await tap('[data-testid=open-mimi]').catch(() => {});
    await page.keyboard.press('Escape'); await page.locator('.dialog').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {});
    await tap('#btn-menu'); await page.getByText('Réglages et sauvegarde').first().click();
    await page.locator('[data-testid=voice-select]').waitFor(); await tap('[data-testid=voice-test]'); await page.waitForTimeout(300);
    await page.evaluate(() => speechSynthesis.cancel()); await shot('17-reglages-voix'); await noOverlap();
    await page.keyboard.press('Escape');
  })();
  await T('10h sons : interrupteurs sons/musique, ambiance démarre et s’arrête sans erreur', async () => {
    if (await page.locator('.dialog').count()) { await page.keyboard.press('Escape'); await page.locator('.dialog').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {}); }
    await page.evaluate(() => window.__game.goScene('hall')); await sceneIs('hall');
    await tap('#btn-menu'); await page.getByText('Réglages et sauvegarde').first().click();
    const music = page.locator('label.toggle', { hasText: 'Musique' }).locator('input'), snd = page.locator('label.toggle', { hasText: 'Sons (' }).locator('input');
    await music.waitFor(); await snd.waitFor();
    if (!(await music.isChecked()) || !(await snd.isChecked())) throw new Error('sons/musique désactivés par défaut');
    await music.uncheck(); await music.check(); await snd.uncheck(); await snd.check();
    const st = await page.evaluate(() => window.__game.S.get().settings); if (st.music !== true || st.sound !== true) throw new Error('réglages son non enregistrés');
    await page.keyboard.press('Escape'); await page.locator('.dialog').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {});
  })();
  await T('10z nouvelles salles : chaque décor et chaque panneau s’ouvre sans erreur', async () => {
    if (!['desktop', 'foldInner'].includes(profile)) return;
    if (await page.locator('.dialog').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(300); }
    for (const sc of ['theatre', 'tour', 'vivant', 'donnees', 'corps', 'village', 'vallee']) {
      await page.evaluate((i) => window.__game.goScene(i), sc); await sceneIs(sc);
      const panels = await page.evaluate(() => window.__game.room.def.hotspots.filter((x) => x.act && x.act.type === 'panel').map((x) => x.act.panel));
      if (!panels.length) throw new Error('aucun panneau dans ' + sc);
      for (const pn of panels) {
        await page.evaluate((x) => window.__game.openPanel(x), pn);
        await page.locator('.dialog').waitFor({ timeout: 4000 });
        const tabs = page.locator('.dialog .actions.wrap').first().locator('button');
        const n = Math.min(await tabs.count(), 7);
        for (let k = 0; k < n; k++) { await tabs.nth(k).click(); await page.waitForTimeout(120); }
        await page.keyboard.press('Escape'); await page.locator('.dialog').waitFor({ state: 'detached', timeout: 4000 });
      }
    }
    for (const pn of ['atlas', 'echelles', 'micro', 'dessin', 'decimaux', 'porte', 'potion']) {
      await page.evaluate((x) => window.__game.openPanel(x), pn); await page.locator('.dialog').waitFor({ timeout: 4000 });
      await page.keyboard.press('Escape'); await page.locator('.dialog').waitFor({ state: 'detached', timeout: 4000 });
    }
    await page.evaluate(() => window.__game.goScene('hall')); await sceneIs('hall');
  })();
  await T('11 aucune erreur JavaScript / réseau sur tout le parcours', async () => { if (errors.length) throw new Error(errors.slice(0, 3).join(' | ')); })();
  await T('12 performance (images/s en animation)', async () => {
    const fps = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = (t) => { n++; if (t - t0 < 2000) requestAnimationFrame(f); else res(n / ((t - t0) / 1000)); }; requestAnimationFrame(f); }));
    results.push({ profile, name: '12b fps mesurés (info)', ok: true, info: fps.toFixed(0) + ' i/s' });
    if (fps < 20) throw new Error('fps trop bas: ' + fps.toFixed(0));
  })();
  await ctx.close();
}
for (const p of profiles) await run(p);
await browser.close(); server.close();
const fails = results.filter((r) => !r.ok);
const lines = results.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  [${r.profile}] ${r.name}${r.err ? '  → ' + r.err : ''}${r.info ? '  (' + r.info + ')' : ''}`);
fs.writeFileSync(path.resolve(import.meta.dirname, '../reports/e2e-last.txt'), lines.join('\n'));
console.log(lines.join('\n')); console.log(`\n${results.length - fails.length}/${results.length} OK`);
process.exit(fails.length ? 1 : 0);
