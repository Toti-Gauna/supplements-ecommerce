import { LOGO_BOLT, LOGO_STROKE_PATH, LOGO_VIEWBOX } from "@/components/atoms/Logo";
import { brand } from "@/config/brand";
import { SplashBarbell } from "./splash/SplashBarbell";
import { SplashStage } from "./splash/SplashStage";

/** La animación más larga (escena por fecha) dura ~1,85 s con el telón. Red de seguridad: si la animación no llega a terminar (pestaña en segundo plano, CSS bloqueado), se retira igual. */
export const SPLASH_FALLBACK_MS = 4000;

/**
 * Pantalla de carga del box (HTML + CSS; se ve aunque no haya JS de React), en cada carga completa de la página (L1;
 * al navegar dentro de la tienda no aparece). Una por fecha (R3c, `src/demo/engine/splash-scenes.ts`):
 * - **original** (~1,4 s): el símbolo se enciende como un marcador, sube el nombre y se carga una barra olímpica;
 * - **escena de la fecha** (~1,85 s): el logo arriba (nunca tapado) y debajo el escenario con su mecánica (la persiana
 *   de Black Friday, la barra al rojo del Hot Sale…) y el marcador con el descuento;
 * - **variante de campaña** (R3a, ~1,8 s) para las fechas cuya escena llega en la fase 2.
 * Se retira cuando TERMINA la animación del telón, nunca a mitad; Escape la cierra; con "reducir movimiento" no sale.
 *
 * Va en la capa superior del navegador (popover, abierto por el script de abajo apenas se lee la etiqueta, antes de
 * pintar): ahí no compite con ningún z-index.
 */
export function Splash() {
  return (
    <>
      <div id="volta-splash" role="presentation" popover="manual">
        <div aria-hidden="true" className="splash-brand">
          <span className="splash-mark">
            {LOGO_STROKE_PATH && <svg viewBox={LOGO_VIEWBOX} className="mark-m"><path d={LOGO_STROKE_PATH} fill={brand.signature.onNight} /></svg>}
            <svg viewBox={LOGO_VIEWBOX} className="mark-v"><path d={LOGO_BOLT} fill={brand.signature.volt} /></svg>
          </span>
          <span className="splash-word"><span className="word font-display">{brand.name}</span></span>
          <SplashBarbell />
          <SplashStage />
        </div>
        <p aria-hidden="true" className="splash-city eyebrow">{brand.descriptor} · {brand.city}</p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: splashOpenScript }} />
    </>
  );
}

/**
 * Pasa la fecha del <html> (la marcó el script de temática del <head>) al escenario y abre el splash en la capa
 * superior apenas se lee la etiqueta (con "reducir movimiento" no se abre).
 */
const splashOpenScript = `(function(){var d=document.documentElement,s=document.getElementById("volta-splash");if(!s)return;var g=s.querySelector(".splash-stage"),a=d.getAttribute("data-splash-scene"),n=d.getAttribute("data-splash-dn");if(g&&a)g.setAttribute("data-scene",a);if(g&&n)g.setAttribute("data-dn",n);if(!s.showPopover||d.classList.contains("splash-done"))return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;try{s.showPopover()}catch(e){}})();`;

/**
 * En el trailer (`/trailer/…`) no sale: el trailer tiene su propia apertura.
 * Cierra la pantalla de carga con Escape y la retira sola cuando termina la animación del telón (no a un tiempo fijo:
 * en un celular lento la animación arranca más tarde y no se corta). Si está a la vista, el Escape que la cierra queda
 * "usado" (preventDefault) y no cierra además lo que esté abierto debajo; oculta, el Escape sigue de largo.
 */
export const splashScript = `(function(){var d=document.documentElement;if(location.pathname.indexOf("/trailer/")>-1){d.classList.add("splash-done");return}function hide(){d.classList.add("splash-done");var s=document.getElementById("volta-splash");try{if(s&&s.matches(":popover-open"))s.hidePopover()}catch(e){}}document.addEventListener("keydown",function(e){if(e.key!=="Escape")return;var s=document.getElementById("volta-splash");if(s&&!d.classList.contains("splash-done")&&getComputedStyle(s).display!=="none")e.preventDefault();hide()});document.addEventListener("animationend",function(e){if(e.animationName==="splash-curtain")hide()});setTimeout(hide,${SPLASH_FALLBACK_MS})})();`;
