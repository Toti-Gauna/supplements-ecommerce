import type { CSSProperties } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { LOGO_BOLT, LOGO_STROKE_PATH, LOGO_VIEWBOX } from "@/components/atoms/Logo";
import { brand } from "@/config/brand";
import type { ArtKey } from "@/demo/types";
import { ThemeSplashScene } from "@/features/themes/ThemeSplashScene";

/** Envases que orbitan el logo (ángulo en grados alrededor del centro). */
const PIECES: { art: ArtKey; angle: number; tint: string }[] = [
  { art: "tub", angle: -90, tint: "#5a3220" },
  { art: "jar", angle: -18, tint: "#e8e4d8" },
  { art: "shaker", angle: 54, tint: "#8b72ff" },
  { art: "caps", angle: 126, tint: "#ffd23f" },
  { art: "pouch", angle: 198, tint: "#c8ff2e" },
];

/** Chispas: posición (%), retraso (ms) y tamaño (px), fijos para que el HTML sea siempre igual. */
const SPARKS: [number, number, number, number][] = Array.from({ length: 26 }, (_, i) => {
  const r = (k: number) => { const x = Math.sin((i + 1) * 12.9898 * k + 78.233) * 43758.5453; return x - Math.floor(x); };
  return [Math.round(r(1) * 100), Math.round(r(2) * 100), Math.round(400 + r(3) * 2600), Math.round(2 + r(4) * 3)];
});

/** Diez celdas de la batería que se cargan una por una. */
const CELLS = Array.from({ length: 10 }, (_, i) => i);

/**
 * Pantalla de carga "Cargando energía" en cada recarga (HTML + CSS; se ve aunque no haya JS). En 5 s: una línea de
 * pulso cruza la pantalla, el trazo de la "V" sube y el rayo cae con un fogonazo, la batería se carga de 0 a 100,
 * los envases entran en órbita sobre un aro eléctrico y un telón la retira. Todo es transform/opacity (app/splash.css).
 * Durante una temática cambia de colores y suma su escena (ThemeSplashScene). Con "reducir movimiento" no se muestra.
 *
 * Va en la capa superior del navegador (popover, abierto por el script de abajo apenas se lee la etiqueta, antes de
 * pintar): ahí no compite con ningún z-index.
 */
export function Splash() {
  return (
    <>
    <div id="volta-splash" role="presentation" popover="manual">
      <div aria-hidden="true" className="splash-grid" />
      <div aria-hidden="true" className="splash-center splash-glow" />
      <div aria-hidden="true" className="splash-pulse">
        <span className="pulse-track">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0 60H540l14-30 18 66 22-92 20 80 14-24H1200" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg>
        </span>
      </div>
      <div aria-hidden="true" className="splash-center splash-halo"><span className="splash-sweep" /><span className="splash-comet" /></div>
      <div aria-hidden="true" className="splash-sparks">
        {SPARKS.map((d, i) => <span key={i} style={{ left: `${d[0]}%`, top: `${d[1]}%`, "--d": `${d[2]}ms`, "--s": `${d[3]}px` } as CSSProperties} />)}
      </div>
      <div aria-hidden="true" className="splash-orbit">
        {PIECES.map((p, i) => (
          <span key={p.art} className="splash-piece" style={{ "--a": `${p.angle}deg`, "--i": i } as CSSProperties}>
            <span className="splash-card"><span className="splash-gloss" /><ProductArt art={p.art} tint={p.tint} label="" showBadge={false} className="h-full w-full [&>svg]:h-full" /></span>
          </span>
        ))}
      </div>
      <div aria-hidden="true" className="splash-flash" />
      <ThemeSplashScene />
      <div aria-hidden="true" className="splash-brand relative z-10 flex flex-col items-center">
        <span className="splash-mark h-16 w-16 sm:h-20 sm:w-20">
          <svg viewBox={LOGO_VIEWBOX} className="mark-m"><path d={LOGO_STROKE_PATH} fill="#eef1f5" /></svg>
          <svg viewBox={LOGO_VIEWBOX} className="mark-v"><path d={LOGO_BOLT} fill="#c8ff2e" /></svg>
        </span>
        <span className="splash-word">
          <span className="word font-display font-wide block text-5xl uppercase tracking-[0.08em] text-on-night sm:text-7xl">{brand.name}</span>
        </span>
        <span className="splash-battery" aria-hidden="true">
          <span className="battery-cells">{CELLS.map((i) => <span key={i} style={{ "--i": i } as CSSProperties} />)}</span>
          <span className="battery-count font-lab"><span className="count-strip">{CELLS.concat(10).map((i) => <span key={i}>{i * 10}%</span>)}</span></span>
        </span>
      </div>
      <p aria-hidden="true" className="splash-city eyebrow">{brand.descriptor} · {brand.city}</p>
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
