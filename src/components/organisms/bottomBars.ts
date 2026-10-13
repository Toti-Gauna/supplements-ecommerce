/**
 * Qué barra fija inferior lleva cada ruta de la tienda en el celular (una sola por pantalla). La vista previa del panel
 * (8.3.21) lleva solo su franja "Volver al editor", en todos los tamaños.
 */
export type BottomBar = "nav" | "product" | "cart" | "preview" | "none";

export function bottomBarFor(pathname: string): BottomBar {
  if (pathname.startsWith("/vista-previa")) return "preview";
  if (pathname.startsWith("/p/")) return "product";
  if (pathname.startsWith("/carrito")) return "cart";
  if (pathname.startsWith("/checkout")) return "none";
  return "nav";
}

/**
 * Placa fija de abajo (dock y barras de compra): recta, de acero, apenas separada del borde. Safari 26 de iPhone no
 * dibuja nada fijo por detrás de su barra de direcciones, así que no se intenta llegar al borde.
 */
export const DOCK =
  "fixed inset-x-2 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] mx-auto max-w-md rounded-sm border border-line bg-surface shadow-[inset_0_2px_0_var(--season-accent),var(--shadow-lift)]";

/** Barra de compra del celular (ficha y carrito): la misma placa que el dock, con sus botones. */
export const FLOATING_BAR = `${DOCK} flex items-center gap-2 p-2`;

/**
 * Lugar real que el contenido le deja a la placa de abajo en el celular: alto de la placa (4 rem), su separación del
 * borde y un respiro. Lo usa el pie, así nada del final de la página queda tapado.
 */
export const DOCK_SPACE = "pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0";
