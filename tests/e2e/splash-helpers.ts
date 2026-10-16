import type { Page } from "@playwright/test";

/** Vista previa de una temática antes de cargar (como "Probar temáticas"). */
export const previewTheme = (page: Page, id: string) =>
  page.addInitScript((v) => localStorage.setItem("volta-demo:theme-preview", JSON.stringify({ state: { previewId: v }, version: 0 })), id);

/** El telón no cae solo (ni por la red de seguridad del script ni al terminar su animación): se mide la pantalla de carga quieta. */
export const holdSplash = (page: Page) => page.addInitScript(() => {
  const st = window.setTimeout;
  window.setTimeout = ((fn: TimerHandler, ms?: number, ...a: unknown[]) => (ms === 4000 ? 0 : st(fn, ms, ...a))) as typeof window.setTimeout;
  document.addEventListener("DOMContentLoaded", () => document.getAnimations().forEach((a) => { if ((a as CSSAnimation).animationName === "splash-curtain") a.pause(); }));
});
