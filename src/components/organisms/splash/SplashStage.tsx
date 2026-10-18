import type { CSSProperties } from "react";
import { SPLASH_MAX_LAYERS } from "@/demo/engine/splash-scenes";

const SLOTS = Array.from({ length: SPLASH_MAX_LAYERS }, (_, i) => i + 1);
const WHEELS = [0, 1, 2];

interface SplashStageProps {
  /** La escena (`data-scene`). En la pantalla de carga real la pone el script de apertura según la fecha. */
  scene?: string;
  /** Ruedas del descuento a la vista (`data-dn`); sin esto no hay descuento. */
  digits?: number;
  /** Variables de la escena (capas `--sl1…`, nombre, ruedas) cuando no las da el <html> (vista previa del panel). */
  style?: CSSProperties;
  className?: string;
}

/**
 * Escenario de la pantalla de carga por fecha (R3c): HTML mínimo y compartido por las 17 fechas. Los huecos `.sl`
 * reciben el arte de la fecha (`--slN`, SVG de `public/splash/<id>/`) y el CSS de la escena (`app/splash-scenes/`)
 * los mueve; el marcador muestra el nombre de la campaña y el descuento en un cuentakilómetros de tres ruedas
 * (`--sd0…2`) que gira solo con transform. Sin `data-scene` queda oculto, salvo el marcador de la variante de campaña.
 */
export function SplashStage({ scene, digits, style, className }: SplashStageProps) {
  return (
    <span className={className ? `splash-stage ${className}` : "splash-stage"} data-scene={scene} data-dn={digits} style={style} suppressHydrationWarning>
      <span className="splash-art">
        {SLOTS.map((i) => <i key={i} className={`sl s${i}`} />)}
        <span className="splash-score">
          <span className="splash-score-name" />
          <span className="splash-score-off"><span className="splash-odo">{WHEELS.map((i) => <b key={i}>0123456789</b>)}</span></span>
        </span>
      </span>
      {/* Con escena, el nombre va como rótulo al pie del escenario (en la caja de LED solo entra el número). */}
      <span className="splash-caption" />
    </span>
  );
}
