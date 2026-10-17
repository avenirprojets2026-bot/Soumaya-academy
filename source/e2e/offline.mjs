// Mode hors ligne : node e2e/offline.mjs (serveur sur :4173). Visite en ligne puis recharge sans réseau.
import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const c = await b.newContext({ viewport: { width: 360, height: 780 } });
const p = await c.newPage();
await p.goto("http://localhost:4173/", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
await p.goto("http://localhost:4173/epreuves", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
await p.goto("http://localhost:4173/mission/ma-1", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
await p.goto("http://localhost:4173/", { waitUntil: "networkidle" }); await p.waitForTimeout(500);
await c.setOffline(true);
await p.reload({ waitUntil: "load" }); await p.waitForTimeout(800);
console.log("accueil hors ligne :", await p.locator('[data-testid="button-play"]').isVisible());
await p.locator('[data-testid="button-play"]').click(); await p.waitForTimeout(600);
console.log("mission hors ligne :", await p.locator('[data-testid="question"]').first().isVisible().catch(() => false));
await b.close();
