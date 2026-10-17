import type { CSSProperties } from "react";
import { LOGO_BOLT, LOGO_STROKE_PATH, LOGO_VIEWBOX } from "@/components/atoms/Logo";
import { brand } from "@/config/brand";

/** Doce placas de la barra que se cargan de a una (como los discos en la barra). */
const PLATES = Array.from({ length: 12 }, (_, i) => i);

/** La animación dura ~1,2 s con el telón (app/splash.css). Red de seguridad: si la animación no llega a terminar (pestaña en segundo plano, CSS bloqueado), se retira igual. */
export const SPLASH_FALLBACK_MS = 4000;

/**
 * Pantalla de carga del box (HTML + CSS; se ve aunque no haya JS), en cada carga completa de la página (L1: no solo la
 * primera vez de la sesión; al navegar dentro de la tienda no aparece). En ~1,2 s: el símbolo se enciende como un marcador, sube el nombre, la barra carga
 * sus placas y un telón la retira. Todo es transform/opacity (app/splash.css). Con una campaña puesta (R3a) sale su
 * variante, mecánica y de ~1,8 s: los discos de la barra en el color de la fecha y, debajo del logo (nunca encima), un
 * marcador con el nombre de la campaña y el descuento que cuenta hasta su número. Se retira cuando TERMINA la animación
 * del telón, nunca a mitad. Con "reducir movimiento" no se muestra.
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
          <span className="splash-bar">
            {PLATES.map((i) => <span key={i} style={{ "--i": i } as CSSProperties} />)}
          </span>
          {/* Variante de campaña (R3a): marcador con el nombre de la fecha y el descuento contando (CSS, ver seasonScript). */}
          <span className="splash-score"><span className="splash-score-name" /><span className="splash-score-off" /></span>
        </div>
        <p aria-hidden="true" className="splash-city eyebrow">{brand.descriptor} · {brand.city}</p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: splashOpenScript }} />
    </>
  );
}

/** Abre el splash en la capa superior apenas se lee la etiqueta (con "reducir movimiento" no se abre). */
const splashOpenScript = `(function(){var s=document.getElementById("volta-splash");if(!s||!s.showPopover||document.documentElement.classList.contains("splash-done"))return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;try{s.showPopover()}catch(e){}})();`;

/**
 * Cierra la pantalla de carga con Escape y la retira sola cuando termina la animación del telón (no a un tiempo fijo:
 * en un celular lento la animación arranca más tarde y no se corta). Si está a la vista, el Escape que la cierra queda
 * "usado" (preventDefault) y no cierra además lo que esté abierto debajo; oculta, el Escape sigue de largo.
 */
export const splashScript = `(function(){var d=document.documentElement;function hide(){d.classList.add("splash-done");var s=document.getElementById("volta-splash");try{if(s&&s.matches(":popover-open"))s.hidePopover()}catch(e){}}document.addEventListener("keydown",function(e){if(e.key!=="Escape")return;var s=document.getElementById("volta-splash");if(s&&!d.classList.contains("splash-done")&&getComputedStyle(s).display!=="none")e.preventDefault();hide()});document.addEventListener("animationend",function(e){if(e.animationName==="splash-curtain")hide()});setTimeout(hide,${SPLASH_FALLBACK_MS})})();`;
