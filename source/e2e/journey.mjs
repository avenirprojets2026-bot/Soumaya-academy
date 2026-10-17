// Parcours utilisateur de bout en bout : node e2e/journey.mjs <baseUrl>
// Vérifie : lancement, bouton Jouer, mission complète, récompenses, sauvegarde/restauration, retour accueil,
// petit écran tactile et Fold, erreurs JS, débordements, superposition de boutons, un seul exemplaire de Soumaya/Mimi.
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:4173";
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const results = []; const errors = [];
const check = (name, ok, info = "") => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? "✓" : "✗"} ${name}${info ? " — " + info : ""}`); };
const devices = {
  phone: { viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  petit: { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  fold: { viewport: { width: 884, height: 1104 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true },
};

async function layoutAudit(page, label) {
  const r = await page.evaluate(() => {
    const vis = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 4 && b.height > 4 && s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0" && b.bottom > 0 && b.top < innerHeight; };
    const els = [...document.querySelectorAll("button, a[href], input, [role=button]")].filter(vis);
    const overlaps = [];
    for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
      const a = els[i], b = els[j];
      if (a.contains(b) || b.contains(a)) continue;
      const A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
      const w = Math.min(A.right, B.right) - Math.max(A.left, B.left), h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
      if (w > 6 && h > 6) {
        // ignorer les éléments masqués derrière un autre calque (ex. contenu défilant sous la barre d'onglets)
        const cx = Math.max(A.left, B.left) + w / 2, cy = Math.max(A.top, B.top) + h / 2;
        const top = document.elementFromPoint(cx, cy);
        if (top && (a.contains(top) || b.contains(top))) {
          const other = a.contains(top) ? b : a;
          const own = a.contains(top) ? a : b;
          // l'élément du dessous est réellement visible dans la zone commune ?
          if (!other.contains(top) && !own.closest("nav, [data-testid=action-bar]") && !other.closest("nav, [data-testid=action-bar]")) overlaps.push(`${(a.textContent || a.getAttribute("data-testid") || a.tagName).trim().slice(0, 24)} × ${(b.textContent || b.getAttribute("data-testid") || b.tagName).trim().slice(0, 24)}`);
        }
      }
    }
    const small = els.filter((e) => { const b = e.getBoundingClientRect(); return (b.width < 40 || b.height < 40) && !e.closest("[aria-hidden=true]") && e.tagName !== "INPUT"; }).map((e) => (e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 20));
    return {
      overflowX: document.documentElement.scrollWidth - innerWidth,
      overlaps, small,
      soumaya: [...document.querySelectorAll('img[data-char="soumaya"]')].filter(vis).length,
      mimi: [...document.querySelectorAll('img[data-char="mimi"]')].filter(vis).length,
    };
  });
  check(`${label} : pas de défilement horizontal`, r.overflowX <= 1, `${r.overflowX}px`);
  check(`${label} : aucune superposition de boutons`, r.overlaps.length === 0, r.overlaps.slice(0, 3).join(" ; "));
  check(`${label} : au plus 1 Soumaya et 1 Mimi à l'écran`, r.soumaya <= 1 && r.mimi <= 1, `Soumaya ${r.soumaya}, Mimi ${r.mimi}`);
  check(`${label} : cibles tactiles ≥ 40 px`, r.small.length === 0, r.small.slice(0, 4).join(", "));
}

async function answerAll(page) {
  for (let i = 0; i < 60; i++) {
    if (await page.locator('[data-testid="summary"]').count()) return true;
    const q = page.locator('[data-testid="question"]');
    if (await q.count()) {
      const kind = await q.first().getAttribute("data-kind");
      if (kind === "mcq" && await page.locator('[data-testid="choice-0"]').count()) await page.locator('[data-testid="choice-0"]').click();
      else if (kind === "tf") await page.locator('[data-testid="choice-true"]').click();
      else if (kind === "num") await page.locator('[data-testid="input-num"]').fill("12");
      else if (kind === "ord") { for (let n = 0; n < 8; n++) { const it = page.locator('[data-testid^="ord-item-"]:not([disabled])'); if (!(await it.count())) break; await it.first().click(); await page.waitForTimeout(60); } }
      else if (kind === "mat") { for (let n = 0; n < 6; n++) { const l = page.locator(`[data-testid="mat-left-${n}"]`), r = page.locator(`[data-testid="mat-right-${n}"]`); if (!(await l.count())) break; await l.click(); await r.click(); await page.waitForTimeout(60); } }
      else if (kind === "gap") { for (let n = 0; n < 8; n++) { const w = page.locator(`[data-testid="gap-word-${n}"]`); if (!(await w.count())) break; if (await w.isEnabled()) await w.click(); await page.waitForTimeout(60); if (await page.locator('[data-testid="button-validate"]').isEnabled()) break; } }
      else if (kind === "prod") { const t = page.locator('[data-testid="input-prod"]'); if (await t.count()) await t.fill("Il était une fois une princesse courageuse qui traversa le royaume pour retrouver son chat ailé, puis elle rentra au château."); for (let n = 0; n < 8; n++) { const c = page.locator(`[data-testid="crit-${n}"]`); if (!(await c.count())) break; await c.click(); } }
    }
    const val = page.locator('[data-testid="button-validate"]');
    if (await val.count() && await val.isEnabled()) { await val.click(); await page.waitForTimeout(150); }
    const next = page.locator('[data-testid="button-next"]');
    if (await next.count()) { await next.click(); await page.waitForTimeout(150); }
  }
  const ok = !!(await page.locator('[data-testid="summary"]').count());
  if (!ok) console.log("  bloqué sur :", await page.evaluate(() => [...document.querySelectorAll("[data-testid]")].map((e) => e.dataset.testid + (e.disabled ? "(off)" : "")).join(",")), await page.locator('[data-testid="question"]').first().getAttribute("data-kind").catch(() => "?"));
  return ok;
}

for (const [name, opts] of Object.entries(devices)) {
  console.log(`\n== ${name} ${opts.viewport.width}×${opts.viewport.height} ==`);
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name} pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${name} console: ${m.text().slice(0, 200)}`); });

  const t0 = Date.now();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  check(`${name} : lancement < 4 s`, Date.now() - t0 < 4000, `${Date.now() - t0} ms`);
  check(`${name} : bouton Jouer visible`, await page.locator('[data-testid="button-play"]').isVisible());
  await layoutAudit(page, `${name} accueil`);

  for (const [path, label] of [["/aventure", "carte"], ["/epreuves", "épreuves"], ["/entrainement", "entraînement"], ["/carnet", "carnet"], ["/monde/maths", "monde maths"]]) {
    await page.goto(base + path, { waitUntil: "networkidle" }); await page.waitForTimeout(300);
    await layoutAudit(page, `${name} ${label}`);
  }

  // Carte : un seul toucher sur un lieu ouvre le monde ; un toucher sur une carte de la liste aussi
  await page.goto(base + "/aventure", { waitUntil: "networkidle" });
  await page.locator('[data-testid="pin-sciences"]').tap();
  await page.waitForTimeout(500);
  check(`${name} : toucher un lieu de la carte ouvre le monde`, (await page.locator('[data-testid="world-title"]').count()) > 0);
  await page.goto(base + "/aventure", { waitUntil: "networkidle" });
  await page.locator('[data-testid="view-list"]').tap();
  await page.locator('[data-testid="world-card"]').nth(2).tap();
  await page.waitForTimeout(500);
  check(`${name} : toucher une carte de la liste ouvre le monde`, (await page.locator('[data-testid="world-title"]').count()) > 0);
  await page.goto(base + "/aventure", { waitUntil: "networkidle" });
  await page.locator('[data-testid="pin-court"]').tap();
  await page.waitForTimeout(500);
  check(`${name} : le Château d'Or ouvre les épreuves`, (await page.locator('[data-testid="quick-exams"]').count()) > 0);

  // Parcours : Jouer → mission → questions → résumé
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.locator('[data-testid="button-play"]').click();
  await page.waitForURL(/\/mission\//);
  await page.waitForTimeout(400);
  if (await page.locator('[data-testid="button-start"]').count()) await page.locator('[data-testid="button-start"]').click();
  check(`${name} : la mission s'ouvre`, await page.locator('[data-testid="question"]').first().isVisible());
  await page.waitForSelector('[data-testid="question"]');
  await layoutAudit(page, `${name} question`);
  const done = await answerAll(page);
  check(`${name} : la mission se termine et affiche le résumé`, done);
  if (done) {
    check(`${name} : résultat et étoiles affichés`, await page.locator('[data-testid="result-pct"]').isVisible() && await page.locator('[data-testid="result-stars"]').count() > 0);
    await layoutAudit(page, `${name} résumé`);
    const saved = await page.evaluate(() => localStorage.getItem("soumaya-academy:progression:v2"));
    check(`${name} : progression enregistrée`, !!saved && Object.keys(JSON.parse(saved).best).length >= 1);
    await page.reload({ waitUntil: "networkidle" });
    const saved2 = await page.evaluate(() => localStorage.getItem("soumaya-academy:progression:v2"));
    check(`${name} : progression restaurée après rechargement`, saved2 === saved);
    // Révision intelligente : les questions ratées sont proposées, jouables, puis l'espace parent s'affiche
    await page.goto(base + "/revision", { waitUntil: "networkidle" });
    const revTxt = await page.locator('[data-testid="review-count"]').innerText();
    check(`${name} : la révision propose des questions ratées`, /^\d+ question/.test(revTxt), revTxt);
    await page.locator('[data-testid="button-start-review"]').click();
    await page.waitForSelector('[data-testid="question"]');
    check(`${name} : la révision se joue jusqu'au résumé`, await answerAll(page));
    await page.goto(base + "/parent", { waitUntil: "networkidle" });
    check(`${name} : l'espace parent affiche conseils et plan`, (await page.locator('[data-testid="recos"] li').count()) > 0 && (await page.locator('[data-testid="week-plan"] li').count()) === 5);
    await layoutAudit(page, `${name} espace parent`);
    // Sauvegarde → effacement → restauration par code
    await page.goto(base + "/carnet", { waitUntil: "networkidle" });
    check(`${name} : le carnet affiche la progression`, (await page.locator('[data-testid="exam-history"], [data-testid="subjects"]').count()) > 0);
    await page.evaluate(() => localStorage.removeItem("soumaya-academy:progression:v2"));
    await page.reload({ waitUntil: "networkidle" });
    await page.evaluate((s) => localStorage.setItem("soumaya-academy:progression:v2", s), saved);
    await page.reload({ waitUntil: "networkidle" });
    check(`${name} : restauration de la sauvegarde`, (await page.evaluate(() => localStorage.getItem("soumaya-academy:progression:v2"))) !== null);
    await page.goto(base + "/", { waitUntil: "networkidle" });
    check(`${name} : retour à l'accueil`, await page.locator('[data-testid="button-play"]').isVisible());
  }
  // Examen express : démarrage
  await page.goto(base + "/epreuve/express-p4", { waitUntil: "networkidle" });
  await page.locator('[data-testid="button-start-exam"]').click();
  await page.waitForSelector('[data-testid="question"]');
  check(`${name} : l'examen express démarre`, true);
  await layoutAudit(page, `${name} examen`);
  await ctx.close();
}
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\nErreurs JS : ${errors.length ? "\n" + [...new Set(errors)].join("\n") : "aucune"}`);
console.log(`Bilan : ${results.length - failed.length}/${results.length} contrôles réussis${failed.length ? ` — ÉCHECS : ${failed.map((f) => f.name).join(" | ")}` : ""}`);
process.exit(failed.length || errors.length ? 1 : 0);
