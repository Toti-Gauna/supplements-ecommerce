import { STORAGE_PREFIX } from "@/stores/storage";

/** Lo que la tienda recuerda solo por esta sesión (pestaña): la cinta de avisos oculta y la pantalla de carga vista. */
export const TICKER_KEY = `${STORAGE_PREFIX}ticker-off`;
export const SPLASH_KEY = `${STORAGE_PREFIX}splash-seen`;

/**
 * Script del <head>, antes de pintar: si la cinta se ocultó en esta sesión la esconde (`data-ticker="off"`) y si la
 * pantalla de carga ya salió, la da por terminada (`splash-done`): solo se ve la primera vez de la sesión.
 */
export const sessionScript = `(function(){try{var d=document.documentElement,s=window.sessionStorage;
if(s.getItem(${JSON.stringify(TICKER_KEY)}))d.setAttribute("data-ticker","off");
if(s.getItem(${JSON.stringify(SPLASH_KEY)}))d.classList.add("splash-done");else s.setItem(${JSON.stringify(SPLASH_KEY)},"1");
}catch(e){}})();`;

/** Oculta la cinta de avisos por el resto de la sesión. */
export function hideTicker(): void {
  document.documentElement.setAttribute("data-ticker", "off");
  try { window.sessionStorage.setItem(TICKER_KEY, "1"); } catch { /* sin almacenamiento: queda oculta hasta recargar */ }
}
