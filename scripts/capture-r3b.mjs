// Capturas de R3b (regalos, parte A) para docs/img/rediseno/r3b/: taquilla, "Regalá energía" con la vista previa,
// Mis regalos y el panel de gift cards, en 1440 y 390, oscuro y claro.
// Uso: export estático servido (node tests/e2e/static-server.mjs) y `node scripts/capture-r3b.mjs [url]`.
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../docs/img/rediseno/r3b");
const url = process.argv[2] || "http://localhost:4331/supplements-ecommerce/";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
fs.mkdirSync(dir, { recursive: true });

// Regalos que "hizo" la cuenta demo, con estados distintos en el panel (fixtures/gift-cards.ts).
const SENT = [
  { code: "REGALO-CH0C-01TT", from: "Sofía", to: "Juli", message: "Para tus mañanas.", occasion: "volta", createdAt: "2026-09-28T13:00:00.000Z", item: { slug: "ionic-whey", name: "Ionic Whey 100%", variant: "2 lb (907 g) · sabor a elección", variantId: "iw-chocolate-2lb" }, openChoice: { flavor: true }, cardDesign: "ring" },
  { code: "REGALO-T4M4-N0X2", from: "Sofía", to: "Juanma", message: "¡A crecer!", occasion: "volta", createdAt: "2026-10-01T18:00:00.000Z", item: { slug: "ionic-whey", name: "Ionic Whey 100%", variant: "Sabor y tamaño a elección", variantId: "iw-vainilla-5lb" }, openChoice: { flavor: true, size: true }, opening: "locker", lockerCode: "0110" },
  { code: "REGALO-GC0S-0F1D", from: "Sofía", to: "Agus", message: "Armate el stack.", occasion: "volta", createdAt: "2026-10-03T12:00:00.000Z", kind: "gift-card", item: { slug: "gift-card", name: "Gift card de $ 60.000", variant: "Vence el 03/10/2027" }, giftCard: { amount: 60000, code: "GIFT-EQV1-P0ZR", expires: "2027-10-03", balance: 60000 }, cardDesign: "podio" },
];

async function shot(page, name, fullPage = false) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage });
}

const browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
for (const [width, height] of [[1440, 900], [390, 844]]) {
  for (const [mode, label] of [["dark", "oscuro"], ["light", "claro"]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", deviceScaleFactor: 1, locale: "es-AR" });
    await context.addInitScript(([m, sent]) => {
      localStorage.setItem("volta-theme", m);
      localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: "original" }, version: 0 }));
      localStorage.setItem("volta-quiz-invite", "seen");
      sessionStorage.setItem("volta-demo:splash-seen", "1");
      if (!localStorage.getItem("volta-demo:gifts")) localStorage.setItem("volta-demo:gifts", JSON.stringify({ state: { sent, saved: [], opened: [] }, version: 0 }));
      localStorage.setItem("volta-demo:account", JSON.stringify({ state: { user: { name: "Sofía Demo", email: "sofia.demo@ejemplo.com" }, wheelPrize: { code: "DEMO", label: "Premio", at: "2026-10-05T12:00:00.000Z" } }, version: 0 }));
    }, [mode, SENT]);
    const page = await context.newPage();
    const tag = `${width}-${label}`;
    await page.goto(`${url}regalo/`);
    await page.getByLabel("Código del regalo").waitFor();
    await shot(page, `taquilla-${tag}`);

    await page.goto(`${url}p/ionic-whey/`);
    const open = page.getByRole("button", { name: "Regalar ahora" }).first();
    const dialog = page.getByRole("dialog", { name: "Regalá energía" });
    for (let i = 0; i < 20 && !(await dialog.isVisible()); i++) { await open.click().catch(() => {}); await page.waitForTimeout(300); }
    await dialog.getByLabel("Para", { exact: true }).fill("Juli");
    await dialog.getByLabel("De parte de").fill("Caro");
    await dialog.getByLabel("Mensaje").fill("Para que arranques el lunes con todo. Elegí el sabor que más te guste.");
    await dialog.getByText("Que elija el sabor").click();
    await dialog.getByText("Ring", { exact: true }).click();
    await dialog.getByRole("heading", { name: /Qué regalás/ }).evaluate((el) => el.closest(".overflow-y-auto")?.scrollTo(0, 0));
    await shot(page, `armador-${tag}`);
    await dialog.getByText("Locker con combinación", { exact: true }).click();
    await dialog.locator("#regalo-apertura").scrollIntoViewIfNeeded();
    await shot(page, `armador-locker-${tag}`);
    await page.keyboard.press("Escape");

    await page.goto(`${url}regalar/`);
    await page.getByRole("heading", { name: "Regalá energía" }).waitFor();
    await shot(page, `regalar-${tag}`);

    await page.goto(`${url}cuenta/#regalos`);
    await page.getByRole("heading", { name: "Mis regalos" }).waitFor();
    if (width < 800) await page.locator("#cuenta-seccion").scrollIntoViewIfNeeded();
    await page.getByRole("heading", { name: "Regalos que hice" }).waitFor();
    await shot(page, `mis-regalos-${tag}`);
    await page.getByRole("heading", { name: "Regalos que hice" }).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120));
    await shot(page, `mis-regalos-enviados-${tag}`);

    await page.goto(`${url}admin-demo/regalos/`);
    await page.getByRole("heading", { name: "Regalos y gift cards" }).waitFor();
    await shot(page, `panel-gift-cards-${tag}`);
    await page.goto(`${url}admin-demo/regalos/?ver=regalos`);
    await shot(page, `panel-regalos-${tag}`);
    await context.close();
  }
}
await browser.close();
console.log(`Capturas en ${dir}`);
