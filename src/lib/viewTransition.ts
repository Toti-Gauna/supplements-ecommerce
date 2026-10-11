/** Último toque en una tarjeta: la galería de la ficha nueva toma el nombre de la transición solo si llega de ahí. */
let heroAt = 0;

/**
 * ¿La ficha que se está abriendo viene de tocar una tarjeta? Solo entonces la galería lleva `view-transition-name`
 * (y por un momento): con el nombre puesto siempre, la galería fija entraba en cada transición entre páginas como
 * una captura aparte y Safari podía dejarla corrida y borrosa encima de la ficha.
 */
export function heroArrivedRecently(): boolean {
  return Date.now() - heroAt < 2500;
}

/**
 * La imagen de la tarjeta tocada "vuela" hasta la galería de la ficha (View Transitions). El nombre se pone solo
 * en esa tarjeta y en el momento del toque: un producto repetido en dos rieles no duplica el nombre (si se
 * duplicara, el navegador cancela la transición). La galería de la ficha actual se desmarca para lo mismo.
 */
export function markProductHero(card: Element | null | undefined, e?: { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean }): void {
  if (typeof document === "undefined" || !("startViewTransition" in document)) return;
  // Abrir en otra pestaña (cmd/ctrl/shift o botón del medio) no navega acá: no se marca nada.
  if (e && (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
  const visual = card?.querySelector<HTMLElement>("[data-card-visual]");
  if (!visual) return;
  // Un solo nombre a la vez: desmarca la galería actual y cualquier tarjeta marcada antes (doble toque).
  document.querySelectorAll<HTMLElement>("[data-vt-hero]").forEach((el) => { el.style.viewTransitionName = "none"; });
  document.querySelectorAll<HTMLElement>("[data-card-visual]").forEach((el) => { el.style.viewTransitionName = ""; });
  visual.style.viewTransitionName = "product-hero";
  heroAt = Date.now();
  window.setTimeout(() => { visual.style.viewTransitionName = ""; }, 4000);
}
