import type { Locator, Page } from "@playwright/test";

const LABELS = ["5% OFF", "Envío gratis", "Muestra de regalo", "10% OFF", "$3.000 OFF", "Shaker VOLTA de regalo", "15% OFF", "Envío gratis"];
export const DISC = "Ruleta: tocala o arrastrala para girar";

/** Gajo bajo el puntero: verifica que la rotación visible coincida con el premio. */
export const underPointer = (deg: number) => {
  const m = (a: number) => ((a % 360) + 360) % 360;
  return LABELS[Math.floor(m(360 - m(deg)) / 45) % 8]!;
};
export const rotation = async (stage: Locator) => {
  const style = (await stage.getByRole("button", { name: /^Ruleta/ }).getAttribute("style")) ?? "";
  return Number(/rotate\((-?[\d.]+)deg\)/.exec(style)?.[1] ?? 0);
};

/** Mide el giro en el navegador, sin sumar la espera del clic ni el sondeo de Playwright. */
export async function recordSpinDuration(button: Locator) {
  await button.evaluate((el) => {
    el.addEventListener("click", () => {
      const stage = el.closest<HTMLElement>('[role="dialog"]')!;
      const started = performance.now();
      const observer = new MutationObserver(() => {
        if (!stage.textContent?.includes("¡Ganaste!")) return;
        stage.dataset.spinElapsedMs = String(performance.now() - started);
        observer.disconnect();
      });
      observer.observe(stage, { childList: true, subtree: true });
    }, { capture: true, once: true });
  });
}

export const spinDuration = (stage: Locator) =>
  stage.evaluate((el) => Number((el as HTMLElement).dataset.spinElapsedMs));

/** Empujón rápido: los movimientos llegan juntos, sin pausas de automatización entre muestras. */
export async function flickLeft(page: Page, disc: Locator) {
  const box = (await disc.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.1);
  await page.mouse.down();
  await disc.evaluate((el) => {
    const r = el.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2;
    for (const [clientX, clientY] of [[x - r.width * 0.3, y - r.height * 0.3], [x - r.width * 0.4, y]]) {
      el.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, pointerType: "mouse", buttons: 1, clientX, clientY }));
    }
  });
  await page.mouse.up();
}
