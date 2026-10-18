import type { CSSProperties } from "react";
import { EC } from "./tokens";

/**
 * El eclipse de Eclipse, en capas (misma construcción que `.loader-eclipse` y `.trl-eclipse` de eclipse-web):
 * brillo, corona con rayos, sol, luna y el destello "anillo de diamante". Cada capa lleva `data-t` para animarla.
 */
const layer = (s: CSSProperties): CSSProperties => ({ position: "absolute", borderRadius: "50%", ...s });

const GLOW = layer({ inset: "-30%", background: "radial-gradient(closest-side, rgb(245 185 66 / .36) 30%, rgb(245 185 66 / .12) 55%, transparent 100%)" });
const CORONA = layer({
  inset: "4%",
  background: "radial-gradient(closest-side, transparent 52%, rgb(255 248 230 / 1) 56%, rgb(255 232 176 / .85) 60%, rgb(245 185 66 / .35) 72%, transparent 100%), repeating-conic-gradient(from 0deg, rgb(255 232 176 / 0) 0deg 5deg, rgb(255 232 176 / .3) 8deg, rgb(255 232 176 / 0) 11deg 17deg)",
  WebkitMaskImage: "radial-gradient(closest-side, #000 60%, rgb(0 0 0 / .5) 80%, transparent 100%)",
  maskImage: "radial-gradient(closest-side, #000 60%, rgb(0 0 0 / .5) 80%, transparent 100%)",
});
const SUN = layer({ inset: "25%", background: `radial-gradient(circle, #fffaf0 0%, ${EC.flare} 55%, ${EC.corona} 100%)`, boxShadow: "0 0 60px 12px rgb(255 232 176 / .45)" });
const MOON = layer({ inset: "24.5%", background: "radial-gradient(circle at 38% 34%, #0d0d16 0%, #050509 60%, #020204 100%)" });
const GLINT: CSSProperties = {
  position: "absolute", left: "68%", top: "32%", width: "30%", height: "30%", margin: "-15% 0 0 -15%",
  background: "radial-gradient(circle, #fff 0 5%, rgb(255 250 235 / .95) 9%, rgb(255 236 190 / .45) 20%, transparent 46%)",
};
const RAY = (rotate: number): CSSProperties => ({ position: "absolute", left: "-25%", right: "-25%", top: "50%", height: 3, marginTop: -1.5, transform: `rotate(${rotate}deg)`, background: "linear-gradient(90deg, transparent, rgb(255 250 238 / .95) 50%, transparent)" });

export function EclipseMark({ size }: { size: number }) {
  return (
    <div data-t="eclipse" className="relative shrink-0" style={{ width: size, height: size }}>
      <span data-t="glow" style={GLOW} />
      <span data-t="corona" style={CORONA} />
      <span data-t="sun" style={SUN} />
      <span data-t="moon" style={MOON} />
      <span data-t="glint" style={GLINT}><span style={RAY(0)} /><span style={RAY(90)} /></span>
    </div>
  );
}

/** Cielo con estrellas fijas (posiciones calculadas, sin azar): el mismo cuadro siempre da los mismos píxeles. */
export function Starfield({ count = 140, w, h }: { count?: number; w: number; h: number }) {
  const stars = Array.from({ length: count }, (_, i) => {
    const x = ((i * 7919) % 1000) / 1000, y = ((i * 104729) % 997) / 997, s = 1 + ((i * 31) % 3);
    return <span key={i} style={{ position: "absolute", left: x * w, top: y * h, width: s, height: s, borderRadius: 9, background: EC.dawn, opacity: 0.25 + ((i * 13) % 50) / 100 }} />;
  });
  return <div data-t="stars" aria-hidden="true" className="absolute inset-0">{stars}</div>;
}
