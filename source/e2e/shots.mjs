// Captures d'écran de contrôle (aperçu visuel) : node e2e/shots.mjs <baseUrl> <outDir>
import { chromium } from "playwright";
import fs from "node:fs";
const base = process.argv[2] ?? "http://localhost:4173";
const out = process.argv[3] ?? "/tmp/shots";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const devices = { phone: { viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, fold: { viewport: { width: 884, height: 1104 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true } };
const errors = [];
for (const [name, opts] of Object.entries(devices)) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${name} pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${name} console: ${m.text()}`); });
  const shot = async (p, file, full = false) => { await page.goto(base + p, { waitUntil: "networkidle" }); await page.waitForTimeout(700); await page.screenshot({ path: `${out}/${name}-${file}.png`, fullPage: full }); };
  await shot("/", "home");
  await shot("/aventure", "map");
  await shot("/monde/maths", "world", true);
  await shot("/entrainement", "train");
  await shot("/epreuves", "exams", true);
  await shot("/carnet", "book", true);
  await page.goto(base + "/mission/ma-1", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${name}-quiz.png` });
  await ctx.close();
}
await browser.close();
console.log(errors.length ? errors.join("\n") : "aucune erreur JS");
