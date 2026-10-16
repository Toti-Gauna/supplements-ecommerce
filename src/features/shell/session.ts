import { STORAGE_PREFIX } from "@/stores/storage";

/** Lo que la tienda recuerda solo por esta sesión (pestaña): la cinta de avisos oculta. */
export const TICKER_KEY = `${STORAGE_PREFIX}ticker-off`;

/**
 * Script del <head>, antes de pintar: si la cinta se ocultó en esta sesión la esconde (`data-ticker="off"`). La pantalla
 * de carga ya no se recuerda: sale en cada carga completa de la página (pedido de Ignacio, L1).
 */
export const sessionScript = `(function(){try{var d=document.documentElement,s=window.sessionStorage;
if(s.getItem(${JSON.stringify(TICKER_KEY)}))d.setAttribute("data-ticker","off");
}catch(e){}})();`;

/** Oculta la cinta de avisos por el resto de la sesión. */
export function hideTicker(): void {
  document.documentElement.setAttribute("data-ticker", "off");
  try { window.sessionStorage.setItem(TICKER_KEY, "1"); } catch { /* sin almacenamiento: queda oculta hasta recargar */ }
}
