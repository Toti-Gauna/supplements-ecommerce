"use client";
import { forwardRef, useEffect, useState, type ReactNode } from "react";
import { fitStage, type Fit } from "../core/fit";
import { STAGE, type Ratio } from "../core/types";

/** Grano de película fijo (no cambia con el tiempo: el mismo cuadro siempre da los mismos píxeles). */
const GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='7' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>\")";

/**
 * Escenario fijo de 1920×1080 (o 1080×1920) escalado y centrado en la ventana. Capas: fondo, cámara (las escenas),
 * destello y grano. Los prefijos responsivos de Tailwind no sirven adentro: responden a la ventana, no al escenario.
 */
export const Stage = forwardRef<HTMLDivElement, { ratio: Ratio; children: ReactNode }>(function Stage({ ratio, children }, ref) {
  const size = STAGE[ratio];
  const [fit, setFit] = useState<Fit>({ scale: 0, x: 0, y: 0 });
  useEffect(() => {
    const update = () => setFit(fitStage(size, window.innerWidth, window.innerHeight));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [size]);
  return (
    <div className="fixed inset-0 z-[70] overflow-hidden bg-black" data-trailer-viewport>
      <div ref={ref} data-trailer-stage={ratio} className="absolute left-0 top-0 overflow-hidden bg-night text-on-night"
        style={{ width: size.w, height: size.h, transformOrigin: "0 0", transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})` }}>
        <div data-layer="camara" className="absolute inset-0">{children}</div>
        <div data-layer="flash" aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white" style={{ opacity: 0 }} />
        <div data-layer="grano" aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ backgroundImage: GRAIN, opacity: 0.18 }} />
      </div>
    </div>
  );
});
