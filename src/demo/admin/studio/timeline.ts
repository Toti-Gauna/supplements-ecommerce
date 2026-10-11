/** Tiempos de las piezas animadas del estudio (segundos). Puros: los usa el dibujo en canvas y se prueban aparte. */
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - 2 ** (-10 * clamp01(x)));
/** Con rebote leve al final (sellos de oferta). */
export const easeOutBack = (x: number) => { const c = 1.6, k = clamp01(x) - 1; return 1 + (c + 1) * k ** 3 + c * k ** 2; };
/** Avance 0–1 de un tramo que empieza en `start` y dura `dur`. */
export const span = (t: number, start: number, dur: number) => clamp01((t - start) / dur);

export const MIN_VIDEO_S = 6;
export const MAX_VIDEO_S = 15;
export const clampDuration = (s: number) => Math.round(Math.min(MAX_VIDEO_S, Math.max(MIN_VIDEO_S, Number.isFinite(s) ? s : MIN_VIDEO_S)));

/** Entrada de cada elemento: fondo, titular, producto, oferta y cierre (CTA y logo) al final. */
export function beats(duration: number) {
  const d = clampDuration(duration);
  return { eyebrow: 0.2, title: 0.45, product: 0.9, offer: 1.9, cta: Math.max(2.6, d - 2.2), end: d };
}

/**
 * Los productos pasan uno por uno entre la entrada y el cierre; en el cierre vuelve el principal (el primero), que
 * es también el del cuadro final que se exporta como imagen. Devuelve el índice visible y el avance de su entrada.
 */
export function productSlot(t: number, duration: number, count: number): { index: number; enter: number } {
  if (count <= 1) return { index: 0, enter: span(t, beats(duration).product, 0.9) };
  const { product, cta } = beats(duration);
  if (t >= cta) return { index: 0, enter: span(t, cta, 0.8) };
  const each = Math.max(1.2, (cta - product) / count);
  const i = Math.min(count - 1, Math.max(0, Math.floor((t - product) / each)));
  return { index: i, enter: span(t, product + i * each, 0.8) };
}
