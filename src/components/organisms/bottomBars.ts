/**
 * Qué barra fija inferior lleva cada ruta de la tienda en el celular (una sola por pantalla). La vista previa del panel
 * (8.3.21) lleva solo su franja "Volver al editor", en todos los tamaños, sin WhatsApp ni "Probar temáticas".
 */
export type BottomBar = "nav" | "product" | "cart" | "preview" | "none";

export function bottomBarFor(pathname: string): BottomBar {
  if (pathname.startsWith("/vista-previa")) return "preview";
  if (pathname.startsWith("/p/") || /^\/crear\/[^/]+/.test(pathname)) return "product";
  if (pathname.startsWith("/carrito")) return "cart";
  if (pathname.startsWith("/checkout")) return "none";
  return "nav";
}

/**
 * Barra de compra del celular: cápsula flotante de vidrio, igual que la navegación inferior. Safari 26 de iPhone no
 * dibuja nada fijo por detrás de su barra de direcciones (una barra pegada al borde deja ver la página debajo), así
 * que la barra flota con aire alrededor en lugar de intentar llegar al borde.
 */
export const FLOATING_BAR =
  "fixed inset-x-3 bottom-[calc(0.625rem+env(safe-area-inset-bottom))] mx-auto flex max-w-md items-center gap-2 rounded-[1.75rem] border border-white/25 bg-surface/92 p-2 shadow-[0_18px_40px_-14px_rgb(28_32_22/0.45),inset_0_1px_0_rgb(255_255_255/0.45)] ring-1 ring-ink/[0.06] backdrop-blur-xl backdrop-saturate-150";
