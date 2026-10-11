import type { CSSProperties, ReactNode } from "react";

/** Herramientas comunes de las escenas de regalo. Lienzo de 300 × 300; el objeto vive alrededor de (150, 165). */

/** Pseudoaleatorio determinístico (mismas posiciones en cada visita y en el servidor). */
export function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** CSS propio de una escena: se carga con ella (React lo sube al <head> una vez) y no pesa en el resto de la tienda. */
export function SceneStyle({ id, css }: { id: string; css: string }) {
  return <style href={`gift-scene-${id}`} precedence="default">{css}</style>;
}

/** Marco de la escena: SVG cuadrado que llena la caja, con capas HTML por encima (partículas). */
export function SceneFrame({ children, overlay, label }: { children: ReactNode; overlay?: ReactNode; label?: string }) {
  return (
    <div className="gift-scene relative h-full w-full select-none">
      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full overflow-visible" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
        {children}
      </svg>
      {overlay && <div aria-hidden="true" className="pointer-events-none absolute inset-0">{overlay}</div>}
    </div>
  );
}

/** Luz detrás del objeto que crece con cada golpe y estalla al abrir. */
export function Glow({ color, hits, total, opened }: { color: string; hits: number; total: number; opened: boolean }) {
  const p = opened ? 1 : hits / total;
  return (
    <g aria-hidden="true">
      <defs>
        <radialGradient id={`gk-glow-${color.replace("#", "")}`}>
          <stop offset="0" stopColor={color} stopOpacity=".9" /><stop offset=".45" stopColor={color} stopOpacity=".28" /><stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="160" r={70 + p * 60 + (opened ? 40 : 0)} fill={`url(#gk-glow-${color.replace("#", "")})`}
        opacity={0.25 + p * 0.55} style={{ transition: "r 600ms cubic-bezier(.16,1,.3,1), opacity 600ms" }} />
    </g>
  );
}

type Shape = "dot" | "petal" | "star" | "heart" | "shard" | "flake" | "ribbon" | "square";

const SHAPE: Record<Shape, string> = {
  dot: "50%",
  petal: "50% 0 50% 0",
  star: "0",
  heart: "0",
  shard: "0",
  flake: "0",
  ribbon: "1px",
  square: "2px",
};
const CLIP: Partial<Record<Shape, string>> = {
  star: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
  heart: "path('M5 9C1 6 0 4 0 2.6 0 1 1.2 0 2.6 0 3.6 0 4.4.6 5 1.5 5.6.6 6.4 0 7.4 0 8.8 0 10 1 10 2.6 10 4 9 6 5 9Z')",
  shard: "polygon(0 0,100% 30%,40% 100%)",
  flake: "polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%)",
};

/**
 * Piezas que salen volando desde un punto (en % de la escena). Se dispara al montar: para repetirla en cada golpe
 * se le da `key={hits}`. Con "reducir movimiento" no se muestra.
 */
export function Debris({ seed, colors, shape = "dot", count = 10, x = 50, y = 55, spread = 1, size = 8, duration = 900 }: {
  seed: number; colors: string[]; shape?: Shape; count?: number; x?: number; y?: number; spread?: number; size?: number; duration?: number;
}) {
  return (
    <div className="gk-debris absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + rand(seed * 31 + i) * 0.9;
        const r = (60 + rand(seed * 17 + i) * 70) * spread;
        const s = size * (0.6 + rand(seed + i * 7) * 0.8);
        const style = {
          width: s, height: shape === "ribbon" ? s * 2.4 : s, background: colors[i % colors.length], borderRadius: SHAPE[shape], clipPath: CLIP[shape],
          "--dx": `${Math.cos(a) * r}px`, "--dy": `${Math.sin(a) * r * 0.8 - 30}px`, "--rot": `${(rand(seed + i) - 0.5) * 540}deg`,
          animationDuration: `${duration * (0.8 + rand(i + seed * 3) * 0.4)}ms`,
        } as CSSProperties;
        return <span key={i} className="gk-piece absolute -translate-x-1/2 -translate-y-1/2" style={style} />;
      })}
    </div>
  );
}

/** Ráfaga grande de la apertura: anillo de luz más piezas de la temática. */
export function RevealBurst({ colors, shapes = ["star", "dot"], x = 50, y = 50 }: { colors: string[]; shapes?: Shape[]; x?: number; y?: number }) {
  return (
    <>
      <span className="gk-ring absolute rounded-full" style={{ left: `${x}%`, top: `${y}%`, borderColor: colors[0] }} />
      {shapes.map((shape, i) => <Debris key={shape} seed={90 + i * 13} colors={colors} shape={shape} count={16} x={x} y={y} spread={1.9} size={10} duration={1400} />)}
    </>
  );
}

/** Estilos del kit (piezas y anillo). Se incluyen una vez desde el escenario. */
export const KIT_CSS = `
.gk-piece { opacity: 0; animation: gk-fly 900ms cubic-bezier(.16,1,.3,1) both; }
@keyframes gk-fly {
  0% { opacity: 1; transform: translate(-50%,-50%) scale(.4) rotate(0); }
  70% { opacity: 1; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) + 40px)) scale(1) rotate(var(--rot)); }
}
.gk-ring { width: 20px; height: 20px; margin: -10px 0 0 -10px; border: 3px solid; opacity: 0; animation: gk-ring 900ms cubic-bezier(.16,1,.3,1) both; }
@keyframes gk-ring { 0% { opacity: .9; transform: scale(.2); } 100% { opacity: 0; transform: scale(16); } }
@media (prefers-reduced-motion: reduce) { .gk-debris, .gk-ring { display: none; } }
`;
