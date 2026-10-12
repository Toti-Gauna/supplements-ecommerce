import type { Page } from "@playwright/test";

/** Vista previa de una temática antes de cargar (como "Probar temáticas"). */
export const previewTheme = (page: Page, id: string) =>
  page.addInitScript((v) => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: v }, version: 0 })), id);

/** El telón no cae solo (ni a los 5,2 s ni al terminar su animación): con la máquina cargada, la escena se mide entera. */
export const holdSplash = (page: Page) => page.addInitScript(() => {
  const st = window.setTimeout;
  window.setTimeout = ((fn: TimerHandler, ms?: number, ...a: unknown[]) => (ms === 5200 ? 0 : st(fn, ms, ...a))) as typeof window.setTimeout;
  document.addEventListener("DOMContentLoaded", () => document.getAnimations().forEach((a) => { if ((a as CSSAnimation).animationName === "splash-curtain") a.pause(); }));
});

/**
 * Lleva la escena a su cuadro final con el telón quieto: las animaciones con fin saltan un poco más allá de su último
 * cuadro (con finish() el redondeo deja los saltos de un paso en el anterior) y se mide todo en ese mismo estado.
 */
export const settleSplash = (page: Page) => page.evaluate(() => document.getAnimations().forEach((a) => {
  if (!(a instanceof CSSAnimation)) return;
  if (a.animationName === "splash-curtain") { a.pause(); return; }
  const end = Number(a.effect?.getComputedTiming().endTime);
  if (Number.isFinite(end)) { a.pause(); a.currentTime = end + 20; }
}));

/** Piezas de la escena que pisan la caja del logo (cada escena marca con data-sc lo que tiene que esquivarlo). */
export const sceneOverlaps = (page: Page) => page.locator("#volta-splash").evaluate((splash) => {
  const b = splash.querySelector(".splash-brand")!.getBoundingClientRect();
  return [...splash.querySelectorAll<HTMLElement>(".season-scene [data-sc]")].filter((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || getComputedStyle(el).display === "none") return false;
    return r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top;
  }).map((el) => el.className);
});
