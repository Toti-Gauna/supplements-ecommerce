import { expect, type Page } from "@playwright/test";

/** Vista previa de una temática antes de cargar (como "Probar temáticas"). */
export const previewTheme = (page: Page, id: string) =>
  page.addInitScript((v) => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: v }, version: 0 })), id);

/** El telón no cae solo (ni por la red de seguridad del script ni al terminar su animación): se mide la pantalla de carga quieta. */
export const holdSplash = (page: Page) => page.addInitScript(() => {
  const st = window.setTimeout;
  window.setTimeout = ((fn: TimerHandler, ms?: number, ...a: unknown[]) => (ms === 4000 ? 0 : st(fn, ms, ...a))) as typeof window.setTimeout;
  document.addEventListener("DOMContentLoaded", () => document.getAnimations().forEach((a) => { if ((a as CSSAnimation).animationName === "splash-curtain") a.pause(); }));
  // Con la máquina cargada el primer cuadro puede llegar tarde: el telón queda en pausa desde que existe el <head>.
  new MutationObserver((_, o) => {
    if (!document.head) return;
    o.disconnect();
    const s = document.createElement("style");
    s.textContent = "#volta-splash { animation-play-state: paused !important; }";
    document.head.append(s);
  }).observe(document, { childList: true, subtree: true });
  // Y si igual arrancó, se frena apenas empieza.
  document.addEventListener("animationstart", (e) => {
    if (e.animationName !== "splash-curtain") return;
    (e.target as Element).getAnimations().forEach((a) => { if ((a as CSSAnimation).animationName === "splash-curtain") { a.pause(); a.currentTime = Number(a.effect?.getTiming().delay ?? 0); } });
  }, true);
});

/** Anota qué animaciones terminan y cuándo, y cuándo se retira el splash. */
export const recordEnds = (page: Page) => page.addInitScript(() => {
  const w = window as unknown as { ends: [string, number][]; splashDone?: number };
  w.ends = [];
  document.addEventListener("animationend", (e) => w.ends.push([e.animationName, performance.now()]), true);
  new MutationObserver(() => { if (document.documentElement?.classList.contains("splash-done")) w.splashDone ??= performance.now(); })
    .observe(document, { attributes: true, attributeFilter: ["class"], subtree: true });
});

/** El logo (símbolo y nombre) queda entero arriba del escenario: nada de la escena lo tapa. */
export async function logoClear(page: Page) {
  const splash = page.locator("#volta-splash");
  const mark = (await splash.locator(".splash-mark").boundingBox())!;
  const word = (await splash.locator(".splash-word").boundingBox())!;
  const stage = (await splash.locator(".splash-art").boundingBox())!;
  const view = page.viewportSize()!;
  expect(mark.y).toBeGreaterThanOrEqual(0);
  expect(stage.y).toBeGreaterThanOrEqual(word.y + word.height - 1);
  expect(stage.y).toBeGreaterThan(mark.y + mark.height);
  expect(stage.x).toBeGreaterThanOrEqual(0);
  expect(stage.x + stage.width).toBeLessThanOrEqual(view.width);
  expect(stage.y + stage.height).toBeLessThanOrEqual(view.height);
}
