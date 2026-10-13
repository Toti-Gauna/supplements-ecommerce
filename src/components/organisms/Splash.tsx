import type { CSSProperties } from "react";
import { LOGO_BOLT, LOGO_STROKE_PATH, LOGO_VIEWBOX } from "@/components/atoms/Logo";
import { brand } from "@/config/brand";

/** Doce placas de la barra que se cargan de a una (como los discos en la barra). */
const PLATES = Array.from({ length: 12 }, (_, i) => i);

/** Lo que dura la pantalla de carga, con el telón (ms). Si la animación no corre, el script la retira a este tiempo. */
export const SPLASH_MS = 1200;

/**
 * Pantalla de carga del box (HTML + CSS; se ve aunque no haya JS), solo la primera vez de la sesión
 * (`features/shell/session.ts`). En ~1,2 s: el símbolo se enciende como un marcador, sube el nombre, la barra carga
 * sus placas y un telón la retira. Todo es transform/opacity (app/splash.css). Con temática, solo el filo de la barra
 * toma el acento de temporada. Con "reducir movimiento" no se muestra.
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
        </div>
        <p aria-hidden="true" className="splash-city eyebrow">{brand.descriptor} · {brand.city}</p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: splashOpenScript }} />
    </>
  );
}

/** Abre el splash en la capa superior; si ya salió en esta sesión (o con "reducir movimiento") no se abre. */
const splashOpenScript = `(function(){var s=document.getElementById("volta-splash");if(!s||!s.showPopover||document.documentElement.classList.contains("splash-done"))return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;try{s.showPopover()}catch(e){}})();`;

/**
 * Cierra la pantalla de carga con Escape y la retira sola al terminar. Si está a la vista, el Escape que la cierra queda
 * "usado" (preventDefault) y no cierra además lo que esté abierto debajo; oculta, el Escape sigue de largo.
 */
export const splashScript = `(function(){var d=document.documentElement;function hide(){d.classList.add("splash-done");var s=document.getElementById("volta-splash");try{if(s&&s.matches(":popover-open"))s.hidePopover()}catch(e){}}document.addEventListener("keydown",function(e){if(e.key!=="Escape")return;var s=document.getElementById("volta-splash");if(s&&!d.classList.contains("splash-done")&&getComputedStyle(s).display!=="none")e.preventDefault();hide()});setTimeout(hide,${SPLASH_MS + 150})})();`;
