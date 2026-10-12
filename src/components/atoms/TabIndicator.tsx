import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TabIndicatorProps {
  /** Pestaña activa (0…count-1); con -1 no hay ninguna y la marca se apaga. */
  index: number;
  /** Cantidad de pestañas, todas del mismo ancho. */
  count: number;
  /** Clases del carril (`absolute` sobre la barra que contiene la lista): su inset horizontal es el padding de la lista. */
  className?: string;
  /** La marca dentro de una pestaña (fondo, filete…), con su posición relativa a la pestaña. */
  children: ReactNode;
}

/**
 * Marca de la pestaña activa que se desliza entre pestañas de igual ancho (Fase 8). Reemplaza al `layoutId` de motion:
 * sin medir el layout al hidratar (en el panel forzaba un reflow de medio segundo en un celular de gama media), solo
 * `transform`. Va antes de la lista (no adentro: una lista solo lleva <li>) y las pestañas, posicionadas, quedan encima.
 */
export function TabIndicator({ index, count, className, children }: TabIndicatorProps) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-y-0", className)}>
      <span className={cn("absolute inset-y-0 left-0 transition-[transform,opacity] duration-[380ms] ease-[cubic-bezier(0.34,1.3,0.64,1)]", index < 0 && "opacity-0")}
        style={{ width: `${100 / count}%`, transform: `translateX(${Math.max(0, index) * 100}%)` }}>
        {children}
      </span>
    </span>
  );
}
