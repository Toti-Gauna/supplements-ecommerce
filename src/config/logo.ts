import type { BrandConfig } from "./brands/types";

/**
 * Logo de la marca, armado con `brand`: un símbolo (rayo, o "V" con rayo si el nombre empieza con V) en una grilla de
 * 64 y el nombre al lado en Archivo expandida. Los colores salen de la paleta: el trazo va en el color del texto y el
 * rayo en el color firma. El favicon (`/brand-icon.svg`) y la imagen para compartir (`/og.png`) se generan en el build
 * con estas mismas piezas, así que no hay archivos de logo para rehacer a mano.
 */
export const LOGO_VIEWBOX = "0 0 64 64";

/** "V" de VOLTA: trazo izquierdo y rayo que baja más que el izquierdo. */
const V_STROKE = "M4 8h14l13 34-5 14z";
const V_BOLT = "M44 8h17L48 30h7L27 60l8.5-23H29z";
/** Rayo solo, centrado: sirve para cualquier nombre. */
const SOLO_BOLT = "M33 4h19L39 28h9L17 61l9-26h-8z";

export interface LogoPaths {
  /** Trazo en el color del texto (null si el logo es solo el rayo). */
  stroke: string | null;
  /** Rayo en el color firma. */
  bolt: string;
}

export function logoPaths(config: Pick<BrandConfig, "logo">): LogoPaths {
  return config.logo === "v-bolt" ? { stroke: V_STROKE, bolt: V_BOLT } : { stroke: null, bolt: SOLO_BOLT };
}

/** Ícono cuadrado (favicon) en SVG: fondo noche redondeado con el símbolo encima. */
export function logoIconSvg(config: BrandConfig): string {
  const { stroke, bolt } = logoPaths(config);
  const ink = config.signature.onNight;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO_VIEWBOX}">`,
    `<rect width="64" height="64" rx="16" fill="${config.colors.background}"/>`,
    `<g transform="translate(6 5) scale(.82)">`,
    stroke ? `<path d="${stroke}" fill="${ink}"/>` : "",
    `<path d="${bolt}" fill="${config.signature.volt}"/>`,
    `</g></svg>`,
  ].join("");
}
