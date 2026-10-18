import { colX, rowY } from "../core/grid";
import type { Ratio } from "../core/types";
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { Laptop, Phone } from "./device-kit";
import { TR, splitChars } from "./kit";
import { Grid } from "./tpl";

/** Trazo completo del contorno (el kit lo normaliza a 1000). */
const PATH = 1000;
/** Centro del par (notebook + celular) en el 16:9: el eje sobre el que gira y se achica. */
export const PAIR_CENTER = { x: 1240, y: 540 } as const;
/** En 9:16 el par entra entero en el ancho (el re-encuadre fino es de T1.5). */
const FIT: Record<Ratio, { k: number; x: number; y: number }> = { "16x9": { k: 1, x: 0, y: 0 }, "9x16": { k: 0.5, x: 540 - PAIR_CENTER.x * 0.5, y: 1100 - PAIR_CENTER.y * 0.5 } };

/**
 * La notebook (centrada en 1290, 520) y el celular (adelante y a la izquierda, 860, 600) de "No es solo software", en un
 * bloque `[data-t="pair"]` con perspectiva que gira en Y. `ry` es el giro de entrada del par.
 */
export function DevicePair({ ratio, ry, front = "hoy-1440-dark", back = "home-carrusel-390-dark" }: { ratio: Ratio; ry: number; front?: string; back?: string }) {
  const fit = FIT[ratio];
  return (
    <div className="absolute left-0 top-0" style={{ width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.k})` }}>
      <div className="absolute inset-0" style={{ perspective: 1800, perspectiveOrigin: `${PAIR_CENTER.x}px ${PAIR_CENTER.y}px` }}>
        <div data-t="pair" className="absolute inset-0" style={{ transformStyle: "preserve-3d", transformOrigin: `${PAIR_CENTER.x}px ${PAIR_CENTER.y}px`, transform: `rotateY(${ry}deg)` }}>
          <Laptop id="nb" shot={front} cx={1290} cy={520} rx={6} />
          <Phone id="ph" shot={back} cx={860} cy={600} z={120} ry={26} />
        </div>
      </div>
    </div>
  );
}

/** Super de display en renglones (cada uno enmascarado por letra); el último va en volt. Columnas `col` a `col + n`. */
export function DisplayLines({ lines, ratio, col, row, size, tag = "line" }: { lines: string[]; ratio: Ratio; col: number; row: number; size: number; tag?: string }) {
  return (
    <p className="font-display absolute uppercase" style={{ left: colX(ratio, col), top: rowY(ratio, row), fontSize: size, color: TR.onNight, zIndex: 5 }}>
      {/* El renglón mide 1,15 em para que la máscara de las letras no corte las tildes; el margen negativo lo deja en el paso de 0,86 em. */}
      {lines.map((l, i) => <span key={i} data-t={tag} className="block" style={{ lineHeight: 1.15, marginBlock: "-0.145em", ...(i === lines.length - 1 ? { color: TR.volt } : {}) }}>{l}</span>)}
    </p>
  );
}

export interface DeviceProps { lines: string[] }

/**
 * 14 · "No es solo software" (56–60, DROP 2): sobre negro con la grilla se trazan los contornos de los dos equipos en ½
 * tiempo, se prenden las pantallas (el panel y el inicio de la tienda) y el par gira de −12° a −6° hasta el final.
 */
export const device = defineRecipe<DeviceProps>({
  id: "device",
  Component: ({ props, ratio }) => (
    <div className="absolute inset-0 overflow-hidden" style={{ background: TR.night }}>
      <Grid ratio={ratio} color={TR.volt} opacity={0.14} />
      <DevicePair ratio={ratio} ry={-6} />
      <DisplayLines lines={props.lines} ratio={ratio} col={1} row={2} size={130} />
    </div>
  ),
  build: ({ q, beat: B, reduced }) => {
    const tl = gsap.timeline();
    const one = (s: string) => q(`[data-t="${s}"]`);
    const lines = [...one("nb-line"), ...one("ph-line")], screens = [...one("nb-screen"), ...one("ph-screen")];
    if (reduced) { tl.fromTo(screens, { autoAlpha: 0 }, { autoAlpha: 1, duration: B / 4, ease: "none" }, 0); return tl; }
    const chars = splitChars(one("line"));
    tl.fromTo(chars, { yPercent: 110 }, { yPercent: 0, duration: B / 4, ease: "trl.expo", stagger: 0.012 }, 0);
    tl.fromTo(lines, { strokeDashoffset: PATH }, { strokeDashoffset: 0, duration: B / 2, ease: "trl.expo" }, 0);
    tl.fromTo(screens, { autoAlpha: 0 }, { autoAlpha: 1, duration: B / 8, ease: "none" }, B / 2);
    tl.fromTo(one("pair"), { rotateY: -12 }, { rotateY: -6, duration: 3.5 * B, ease: "sine.inOut" }, B / 2);
    return tl;
  },
});
