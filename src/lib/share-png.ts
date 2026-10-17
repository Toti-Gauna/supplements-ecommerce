"use client";

export type ShareResult = "shared" | "downloaded" | "cancelled";

/**
 * Comparte un PNG hecho en el navegador: la hoja de compartir del sistema si acepta archivos (WhatsApp, Instagram…);
 * si no la hay o falla, lo descarga. Nada sale a un servicio externo.
 */
export async function sharePng(blob: Blob, fileName: string, title: string): Promise<ShareResult> {
  const file = new File([blob], fileName, { type: "image/png" });
  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancelled";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: fileName });
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "downloaded";
}

/** Colores y tipografías de la marca para dibujar en un canvas (la placa noche, igual en los dos modos). */
export function canvasPalette() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const display = getComputedStyle(document.body).getPropertyValue("--font-box-display").trim();
  return {
    bg: v("--c-night", "black"), band: v("--c-night-2", "black"), ink: v("--brand-on-night", "white"), muted: v("--brand-night-muted", "gray"),
    volt: v("--brand-volt", "yellow"), plasma: v("--brand-plasma", "purple"), line: "rgb(255 255 255 / 0.14)",
    display: display ? `${display}, ${v("--brand-display", "sans-serif")}` : v("--brand-display", "sans-serif"),
    mono: v("--brand-mono", "monospace"),
  };
}

export const canvasToPng = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas"))), "image/png"));
