import type { CSSProperties } from "react";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { cn } from "@/lib/cn";
import type { AmbientLayer } from "./ambient";

/** Pseudoaleatorio determinístico: el mismo HTML en servidor y navegador. */
export function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Partículas animadas en CSS (transform/opacity, sin JS por cuadro). Se mueven en unidades del contenedor
 * (cqw/cqh), así sirven igual para el fondo de la página, el banner o el splash. `density` escala la cantidad.
 */
export function AmbientField({ layers, density = 1, className }: { layers: AmbientLayer[]; density?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("amb-field pointer-events-none overflow-hidden", className)}>
      {layers.flatMap((layer, li) =>
        Array.from({ length: Math.round(layer.count * density) }, (_, i) => {
          const r = (k: number) => rand(li * 997 + i * 31 + k);
          const size = layer.size[0] + r(1) * (layer.size[1] - layer.size[0]);
          const dur = layer.duration[0] + r(2) * (layer.duration[1] - layer.duration[0]);
          const particle = layer.particles[i % layer.particles.length]!;
          const style = {
            "--x": `${r(3) * 100}%`, "--y": `${r(4) * 100}%`, "--s": `${size}px`, "--o": layer.opacity * (0.6 + r(5) * 0.4),
            "--dx": `${(r(6) - 0.5) * 18}cqw`, "--rot": `${(r(7) - 0.5) * 720}deg`,
            animationDuration: `${dur}s`, animationDelay: `${-r(8) * dur}s`,
          } as CSSProperties;
          return (
            <span key={`${li}-${i}`} className={`amb amb-${layer.motion}`} style={style}>
              {"decor" in particle ? <Decor kind={particle.decor} className="h-full w-full" />
                : "dot" in particle ? <span className="amb-dot" style={{ background: particle.dot, color: particle.dot }} />
                : <span className="amb-paper" style={{ background: particle.paper }} />}
            </span>
          );
        }),
      )}
    </div>
  );
}
