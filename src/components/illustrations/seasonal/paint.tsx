import { useId } from "react";
import { brand } from "@/config/brand";

/** Props comunes de las decoraciones de temática (SVG propios, 64 × 64, sin imágenes externas). */
export interface DecorProps { className?: string }

/** Colores de la marca para el arte (hex dentro del SVG: el Estudio de contenido lo pasa a imagen). */
const S = brand.signature;
export const INK = { volt: S.volt, voltSoft: S.voltSoft, plasma: S.plasma, ion: S.ion, night: "#0b0e13", graphite: "#1a1f27" } as const;

/** Tipografías de la marca dentro del SVG (con respaldo si la fuente todavía no cargó). */
export const DISPLAY = { fontFamily: "'Archivo Variable','Arial Black',sans-serif", fontWeight: 850 } as const;
export const MONO = { fontFamily: "'JetBrains Mono Variable',ui-monospace,monospace", fontWeight: 800 } as const;

/** Acero cepillado (de arriba abajo) y goma negra. */
export const STEEL = ["#f4f6f8", "#b4bcc6", "#6b7480"];
export const RUBBER = ["#3b424e", "#1a1f27", "#0b0e13"];

/**
 * Ids únicos por instancia (una decoración se dibuja muchas veces en la misma página): `id("a")` para el
 * degradé y `fill("a")` para usarlo.
 */
export function useArt() {
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (k: string) => `d${base}${k}`;
  return { id, fill: (k: string) => `url(#${id(k)})` };
}

/** Degradé lineal con paradas parejas; por defecto vertical. */
export function Lin({ id, c, x2 = 0, y2 = 1 }: { id: string; c: readonly string[]; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      {c.map((s, i) => <stop key={i} offset={c.length > 1 ? i / (c.length - 1) : 0} stopColor={s} />)}
    </linearGradient>
  );
}

/** Degradé radial con luz arriba a la izquierda (volumen de esfera o de disco). */
export function Rad({ id, c, cx = 0.36, cy = 0.32, r = 0.75 }: { id: string; c: readonly string[]; cx?: number; cy?: number; r?: number }) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r={r}>
      {c.map((s, i) => <stop key={i} offset={c.length > 1 ? i / (c.length - 1) : 0} stopColor={s} />)}
    </radialGradient>
  );
}

/** El rayo del logo de VOLTA, en una caja de 34 × 52 con el origen arriba a la izquierda. */
export const BOLT = "M17 0h17L21 22h7L0 52l8.5-23H2z";

/** Corazón centrado en (32, 34), de 46 de ancho. */
export const HEART = "M32 56C16 45 9 35 9 25.5 9 17.5 15 12 22 12c4.4 0 8 2.3 10 5.8C34 14.3 37.6 12 42 12c7 0 13 5.5 13 13.5C55 35 48 45 32 56z";
