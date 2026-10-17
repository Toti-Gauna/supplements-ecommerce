import { expect, type Page } from "@playwright/test";

/** Un momento fijo de la demo (sábado 17/10/2026, 15:42:10 en Buenos Aires): las cuentas regresivas dan siempre lo mismo. */
export const FIXED_NOW = new Date("2026-10-17T15:42:10-03:00");

/** Las 17 fechas en orden de calendario (de octubre a septiembre), como las recorre la vitrina. */
export const CALENDAR = [
  "dia-de-la-madre", "halloween", "cyber-monday", "black-friday", "navidad", "ano-nuevo", "san-valentin", "crossfit-open",
  "vuelta-al-gym", "dia-actividad-fisica", "hot-sale", "dia-del-running", "dia-del-padre", "dia-del-futbolista",
  "dia-del-amigo", "dia-del-boxeador", "operacion-verano",
] as const;

/** Modo de temáticas del panel (como lo deja el dueño). Sin vista previa: manda el panel. */
export async function setThemeMode(page: Page, mode: "auto" | "fixed" | "off") {
  await page.addInitScript(() => localStorage.removeItem("volta-demo:theme-preview"));
  await page.goto("admin-demo/tematicas/");
  await page.getByLabel("Modo", { exact: true }).selectOption(mode);
  await expect(page.getByLabel("Modo", { exact: true })).toHaveValue(mode);
}

/** Color pintado de un elemento (fondo y texto) y de los SVG del marcador adentro. */
export async function paintOf(page: Page, selector: string) {
  const el = page.locator(selector).first();
  await expect(el).toBeVisible();
  return el.evaluate((node) => {
    const css = getComputedStyle(node);
    const led = node.querySelector("svg");
    return { bg: css.backgroundColor, color: css.color, border: css.borderColor, led: led ? getComputedStyle(led).color : null };
  });
}

/** Resuelve un color CSS (variable incluida) al rgb que pinta el navegador. */
export async function resolveColor(page: Page, value: string) {
  return page.evaluate((c) => { const i = document.createElement("i"); i.style.color = c; document.body.append(i); const v = getComputedStyle(i).color; i.remove(); return v; }, value);
}
