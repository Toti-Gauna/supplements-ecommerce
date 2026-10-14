import { webkit, devices, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";
const check = expect.configure({ timeout: 15000 });
const photo = fileURLToPath(new URL("../docs/img/rediseno/carrusel/despues-inicio-1440-claro.png", import.meta.url));
const browser = await webkit.launch({ executablePath: process.env.PLAYWRIGHT_WEBKIT_PATH || undefined });
const url = process.env.CAROUSEL_URL || "http://localhost:4173/supplements-ecommerce/";
try {
 for (const mode of ["dark", "light"]) {
  const context = await browser.newContext({ ...devices["iPhone 13"], locale: "es-AR", reducedMotion: "reduce" });
  await context.addInitScript(mode => {
   localStorage.setItem("volta-theme", mode);
   localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: "original" }, version: 0 }));
   sessionStorage.setItem("volta-demo:splash-seen", "1");
  }, mode);
  const page = await context.newPage();
  await page.goto(url);
  const hero = page.locator("section[aria-roledescription='carrusel']");
  const marks = hero.locator("[aria-label='Destacados'] button");
  await check(marks.first()).toHaveAttribute("aria-current", "true");
  await check(hero.getByRole("button", { name: "Reproducir carrusel" })).toBeDisabled();
  await page.evaluate(() => document.fonts.ready);
  const height = (await hero.boundingBox()).height;
  await hero.getByRole("button", { name: "Diapositiva siguiente" }).tap();
  await check(marks.nth(1)).toHaveAttribute("aria-current", "true");
  check((await hero.boundingBox()).height).toBeCloseTo(height, 0);
  check(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  await page.goto(url + "admin-demo/contenido/carrusel/");
  await page.getByLabel("Subir imagen propia", { exact: true }).setInputFiles(photo);
  await page.getByRole("textbox", { name: "Texto alternativo", exact: true }).fill("Escena del rack para prueba de WebKit");
  await page.getByRole("slider", { name: "Acercar", exact: true }).press("ArrowRight");
  await page.getByRole("button", { name: "Guardar carrusel" }).tap();
  await check(page.getByRole("status").filter({ hasText: "Carrusel guardado" })).toBeVisible();
  await page.goto(url);
  await check(page.getByRole("img", { name: "Escena del rack para prueba de WebKit" })).toBeVisible();
  await page.goto(url + "cuenta/");
  await page.getByRole("button", { name: "Entrar a la cuenta demo" }).tap();
  await check(page.getByText("Hola, Sofía")).toBeVisible();
  await page.evaluate(() => scrollTo({ top: 380, behavior: "instant" }));
  const dock = page.locator("[data-shop-bottomnav]");
  await dock.getByRole("link", { name: "Tienda", exact: true }).tap();
  await check(page).toHaveURL(/categorias\/$/);
  await dock.getByRole("button", { name: "Buscar", exact: true }).tap();
  await check(page.getByRole("dialog", { name: "Buscar", exact: true })).toBeVisible();
  console.log(JSON.stringify({ browser: "WebKit " + browser.version(), viewport: "390×844 iPhone 13", mode, carousel: "passed", localImage: "passed", navigation: "passed", search: "passed" }));
  await context.close();
 }
} finally { await browser.close(); }
