import type { CollarMaterial, CollarPattern } from "@/demo/fixtures/collar";
import { tone } from "./geometry";

interface Props {
  /** Trazo del cordón (la caída del collar o una recta en las muestras de patrón). */
  d: string;
  material: CollarMaterial;
  pattern: CollarPattern;
  cord: string;
  accent: string;
}

/**
 * El cordón dibujado con trazos sobre un mismo camino: contorno, color, patrón (segundo color) y la textura del
 * material encima (trenza del paracord, brillo del biothane, costuras del nylon). Lo usan la vista previa y las
 * muestras de patrón, así lo que se elige se ve igual en los dos lados.
 */
export function Cord({ d, material, pattern, cord, accent }: Props) {
  const w = material === "nylon" ? 17 : 15;
  const dark = tone(cord, -0.35);
  const light = tone(cord, 0.35);
  const stroke = (color: string, width: number, extra: Record<string, string | number> = {}) => (
    <path d={d} fill="none" stroke={color} strokeWidth={width} {...extra} />
  );
  return (
    <>
      {stroke(dark, w + 3, { strokeLinecap: "round" })}
      {pattern === "edge" ? (
        <>{stroke(accent, w, { strokeLinecap: "round" })}{stroke(cord, w - 6, { strokeLinecap: "round" })}</>
      ) : stroke(cord, w, { strokeLinecap: "round" })}
      {pattern === "twist" && (
        <>
          {stroke(accent, w / 2, { strokeDasharray: "6 6", transform: "translate(0 -3.6)" })}
          {stroke(accent, w / 2, { strokeDasharray: "6 6", strokeDashoffset: 3, transform: "translate(0 3.6)" })}
        </>
      )}
      {pattern === "stripes" && stroke(accent, w, { strokeDasharray: "2.4 7.6" })}
      {pattern === "dots" && stroke(accent, 6.5, { strokeDasharray: "0.1 9.9", strokeLinecap: "round" })}
      {material === "paracord" && (
        <>
          {stroke(dark, w - 2, { strokeOpacity: 0.45, strokeDasharray: "3.2 4.2" })}
          {stroke(light, 5, { strokeOpacity: 0.5, strokeDasharray: "3.2 4.2", strokeDashoffset: 3.6, transform: "translate(0 -3)" })}
        </>
      )}
      {material === "biothane" && stroke("#fff", 3, { strokeOpacity: 0.38, transform: "translate(0 -4)" })}
      {material === "nylon" && (
        <>
          {stroke("#fff", 1.2, { strokeOpacity: 0.55, strokeDasharray: "4 3", transform: "translate(0 -6)" })}
          {stroke("#fff", 1.2, { strokeOpacity: 0.55, strokeDasharray: "4 3", transform: "translate(0 6)" })}
        </>
      )}
    </>
  );
}

/** Muestra de un patrón para los botones de elección: un tramo recto del cordón. */
export function CordSwatch({ material, pattern, cord, accent, className }: Omit<Props, "d"> & { className?: string }) {
  return (
    <svg viewBox="0 0 64 24" aria-hidden="true" className={className}>
      <Cord d="M8 12H56" material={material} pattern={pattern} cord={cord} accent={accent} />
    </svg>
  );
}
