import type { CSSProperties } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { LOGO_M, LOGO_STROKE, LOGO_V, LOGO_VIEWBOX } from "@/components/atoms/Logo";
import { brand } from "@/config/brand";
import type { ArtKey } from "@/demo/types";
import { ThemeSplashScene } from "@/features/themes/ThemeSplashScene";

/** Piezas que orbitan el logo (ángulo en grados alrededor del centro). */
const PIECES: { art: ArtKey; angle: number; tint?: string }[] = [
  { art: "lamp-photo", angle: -90 },
  { art: "bowl-dog", angle: -18, tint: "#e88aa0" },
  { art: "nfc-plate", angle: 54 },
  { art: "candle-poodle", angle: 126 },
  { art: "collar", angle: 198 },
];

/** Polvo dorado: posición (%), retraso (ms) y tamaño (px), fijos para que el HTML sea siempre igual. */
const DUST: [number, number, number, number][] = Array.from({ length: 26 }, (_, i) => {
  const r = (k: number) => { const x = Math.sin((i + 1) * 12.9898 * k + 78.233) * 43758.5453; return x - Math.floor(x); };
  return [Math.round(r(1) * 100), Math.round(r(2) * 100), Math.round(400 + r(3) * 2600), Math.round(2 + r(4) * 3)];
});

/**
 * Pantalla de carga de marca en cada recarga (HTML + CSS; se ve aunque no haya JS). En 5 s: un aro dorado se abre y
 * una luz lo recorre, con polvo de oro y rayos; las dos mitades del logo encastran, "Volta" sube detrás de una
 * línea, las piezas del taller entran en órbita montadas sobre el aro y un telón la retira (sin barra de carga ni
 * botón "Saltar", pedido de Ignacio). Estilos y por qué todo es transform/opacity: app/splash.css. Durante una
 * temática cambia de colores y suma su escena (ThemeSplashScene). Con "reducir movimiento" no se muestra.
 *
 * Va en la capa superior del navegador (popover, abierto por el script de abajo apenas se lee la etiqueta, antes de
 * pintar): ahí no compite con ningún z-index. En Safari del iPad, al recargar a mitad de página, el contenido se
 * dibujaba por encima del splash (se veían las tarjetas sobre su fondo, con el logo y los corazones detrás).
 */
export function Splash() {
  return (
    <>
    <div id="volta-splash" role="presentation" popover="manual">
      <div aria-hidden="true" className="splash-center splash-glow" />
      <div aria-hidden="true" className="splash-center splash-rays" />
      <div aria-hidden="true" className="splash-center splash-halo"><span className="splash-sweep" /><span className="splash-comet" /></div>
      <div aria-hidden="true" className="splash-dust">
        {DUST.map((d, i) => <span key={i} style={{ left: `${d[0]}%`, top: `${d[1]}%`, "--d": `${d[2]}ms`, "--s": `${d[3]}px` } as CSSProperties} />)}
      </div>
      <div aria-hidden="true" className="splash-orbit">
        {PIECES.map((p, i) => (
          <span key={p.art} className="splash-piece" style={{ "--a": `${p.angle}deg`, "--i": i } as CSSProperties}>
            <span className="splash-card"><span className="splash-gloss" /><ProductArt art={p.art} tint={p.tint} label="" showBadge={false} className="h-full w-full [&>svg]:h-full" /></span>
          </span>
        ))}
      </div>
      <ThemeSplashScene />
      <div aria-hidden="true" className="splash-brand relative z-10 flex flex-col items-center">
        <span className="splash-mark h-14 w-14 text-brass sm:h-16 sm:w-16">
          <svg viewBox={LOGO_VIEWBOX} className="mark-m"><path d={LOGO_M} fill="none" stroke="currentColor" strokeWidth={LOGO_STROKE} /></svg>
          <svg viewBox={LOGO_VIEWBOX} className="mark-v"><path d={LOGO_V} fill="none" stroke="currentColor" strokeWidth={LOGO_STROKE} /></svg>
        </span>
        <span className="splash-word">
          <span className="word font-display block text-5xl text-[#f6f1e8] sm:text-7xl">{brand.name}</span>
        </span>
      </div>
      <p aria-hidden="true" className="splash-city eyebrow">Objetos con alma · {brand.city}</p>
    </div>
    <script dangerouslySetInnerHTML={{ __html: splashOpenScript }} />
    </>
  );
}

/** Abre el splash en la capa superior; sin soporte de popover (o con "reducir movimiento") queda como antes. */
const splashOpenScript = `(function(){var s=document.getElementById("volta-splash");if(!s||!s.showPopover||document.documentElement.classList.contains("splash-done"))return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;try{s.showPopover()}catch(e){}})();`;

/** Cierra la pantalla de carga con Escape (si no hay JS, igual se va sola a los 5 s). */
// Si la pantalla de carga está a la vista, el Escape que la cierra queda "usado" (preventDefault) y no cierra además lo
// que esté abierto debajo. Oculta (ya terminó o "reducir movimiento"), el Escape sigue de largo: listas y diálogos nativos.
export const splashScript = `(function(){var d=document.documentElement;function hide(){d.classList.add("splash-done");var s=document.getElementById("volta-splash");try{if(s&&s.matches(":popover-open"))s.hidePopover()}catch(e){}}document.addEventListener("keydown",function(e){if(e.key!=="Escape")return;var s=document.getElementById("volta-splash");if(s&&!d.classList.contains("splash-done")&&getComputedStyle(s).display!=="none")e.preventDefault();hide()});setTimeout(hide,5200)})();`;
