import type { ReactNode } from "react";
import { withBase } from "@/lib/base-path";
import { STAGE, type Ratio } from "../core/types";

/** Caja medida sobre la placa, en px del escenario del formato (la deja `scripts/trailer-plates.mjs`). */
export interface Box { x: number; y: number; width: number; height: number }
export const center = (b: Box) => [b.x + b.width / 2, b.y + b.height / 2] as const;

/**
 * Las placas de cada formato: en 16:9 son pantallas de escritorio de 1920 × 1080 y en 9:16, capturas de celular de 1080 × 1920.
 * La pieza da la base (16:9) y, en `tall`, lo que cambia en vertical (qué placas y sus cajas); acá se elige según el formato.
 */
export type WithTall<P> = P & { tall?: Partial<P> };
export const forRatio = <P extends object>(props: WithTall<P>, ratio: Ratio): P => (ratio === "9x16" && props.tall ? { ...props, ...props.tall } : props);

/** Placa: una pantalla real de la app (`public/trailer/shots/t1/`) a todo el escenario. */
export function PlateImg({ id, tag, ratio, hidden = false }: { id: string; tag: string; ratio: Ratio; hidden?: boolean }) {
  const { w, h } = STAGE[ratio];
  // eslint-disable-next-line @next/next/no-img-element -- placa del trailer (export estático, se decodifica antes de grabar)
  return <img data-t={tag} src={withBase(`/trailer/shots/t1/${id}.jpg`)} alt="" aria-hidden="true" width={w} height={h}
    className="absolute left-0 top-0 max-w-none" style={{ width: w, height: h, ...(hidden ? { visibility: "hidden", opacity: 0 } : {}) }} />;
}

/** Marco del tamaño del escenario donde viven la placa y lo que se dibuja encima con sus coordenadas. */
export function PlateFrame({ ratio, children, tag = "plate" }: { ratio: Ratio; children: ReactNode; tag?: string }) {
  const { w, h } = STAGE[ratio];
  return <div data-t={tag} className="absolute left-0 top-0 overflow-hidden" style={{ width: w, height: h }}>{children}</div>;
}

/** Trazo de 1 px (2 en el escenario) alrededor de una caja, listo para dibujarse con `strokeDashoffset`. */
export function TraceRect({ box, tag, ratio, pad = 8, color }: { box: Box; tag: string; ratio: Ratio; pad?: number; color: string }) {
  const { w: sw, h: sh } = STAGE[ratio];
  const w = box.width + pad * 2, h = box.height + pad * 2;
  return (
    <svg aria-hidden="true" className="absolute left-0 top-0 overflow-visible" width={sw} height={sh}>
      <rect data-t={tag} x={box.x - pad} y={box.y - pad} width={w} height={h} rx={6} fill="none" stroke={color} strokeWidth={2}
        strokeDasharray={2 * (w + h)} strokeDashoffset={0} pathLength={2 * (w + h)} />
    </svg>
  );
}
