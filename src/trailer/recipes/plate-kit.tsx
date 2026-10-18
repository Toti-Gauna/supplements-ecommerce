import type { ReactNode } from "react";
import { withBase } from "@/lib/base-path";
import type { Ratio } from "../core/types";

/** Caja medida sobre la placa, en px del escenario de 16:9 (la deja `scripts/trailer-plates.mjs`). */
export interface Box { x: number; y: number; width: number; height: number }
export const center = (b: Box) => [b.x + b.width / 2, b.y + b.height / 2] as const;

/** Placa: una pantalla real de la app capturada a 1600 × 900 y 2× (`public/trailer/shots/t1/`), a todo el escenario. */
export function PlateImg({ id, tag, hidden = false }: { id: string; tag: string; hidden?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element -- placa del trailer (export estático, se decodifica antes de grabar)
  return <img data-t={tag} src={withBase(`/trailer/shots/t1/${id}.jpg`)} alt="" aria-hidden="true" width={1920} height={1080}
    className="absolute left-0 top-0 max-w-none" style={{ width: 1920, height: 1080, ...(hidden ? { visibility: "hidden", opacity: 0 } : {}) }} />;
}

/**
 * Marco de 1920 × 1080 donde viven la placa y lo que se dibuja encima con sus coordenadas. En 9:16 se achica al ancho y se
 * centra (primer paso: el re-encuadre con las capturas de celular es de T1.5).
 */
export function PlateFrame({ ratio, children, tag = "plate" }: { ratio: Ratio; children: ReactNode; tag?: string }) {
  const k = ratio === "9x16" ? 1080 / 1920 : 1;
  return (
    <div data-t={tag} className="absolute left-0 overflow-hidden" style={{ top: ratio === "9x16" ? (1920 - 1080 * k) / 2 : 0, width: 1920, height: 1080, transform: `scale(${k})`, transformOrigin: "0 0" }}>
      {children}
    </div>
  );
}

/** Trazo de 1 px (2 en el escenario) alrededor de una caja, listo para dibujarse con `strokeDashoffset`. */
export function TraceRect({ box, tag, pad = 8, color }: { box: Box; tag: string; pad?: number; color: string }) {
  const w = box.width + pad * 2, h = box.height + pad * 2;
  return (
    <svg aria-hidden="true" className="absolute left-0 top-0 overflow-visible" width={1920} height={1080}>
      <rect data-t={tag} x={box.x - pad} y={box.y - pad} width={w} height={h} rx={6} fill="none" stroke={color} strokeWidth={2}
        strokeDasharray={2 * (w + h)} strokeDashoffset={0} pathLength={2 * (w + h)} />
    </svg>
  );
}
