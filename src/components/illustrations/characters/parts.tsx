import type { PupOutfit, PupPose } from "./types";

/** Piezas comunes a los dos personajes: patas, sombreros, corbata y pañuelo. */
export const INK = "#2a1a12";
export const OLIVE = "#3a4527";
export const BRASS = "#d2ad69";

/** Clase de cada pata según la pose: al caminar se alternan; al saludar, la delantera cercana se levanta. */
export function legClass(pose: PupPose, leg: "front-near" | "front-far" | "back-near" | "back-far"): string {
  if (pose === "walk") return leg === "front-near" || leg === "back-far" ? "pup-leg pup-step-a" : "pup-leg pup-step-b";
  if (pose === "wave" && leg === "front-near") return "pup-leg pup-wave";
  if (pose === "hop") return leg.startsWith("front") ? "pup-leg pup-reach" : "pup-leg pup-kick";
  return "pup-leg";
}

/** Pata: tubo redondeado con almohadilla; `fill` del pelo y `paw` de la mano. */
export function Leg({ x, y, h, w = 7, fill, paw, className }: { x: number; y: number; h: number; w?: number; fill: string; paw: string; className: string }) {
  return (
    <g className={className}>
      <rect x={x} y={y} width={w} height={h} rx={w / 2} fill={fill} />
      <ellipse cx={x + w / 2 + 1.2} cy={y + h - 1} rx={w / 2 + 1.6} ry={2.6} fill={paw} />
    </g>
  );
}

/** Sombrero y accesorios de cabeza, ubicados sobre (x, y) = coronilla. */
export function Hat({ kind, x, y, tilt = -8 }: { kind: NonNullable<PupOutfit["hat"]>; x: number; y: number; tilt?: number }) {
  if (kind === "party") {
    return (
      <g className="pup-hat"><g transform={`rotate(${tilt} ${x} ${y})`}>
        <path d={`M${x - 8} ${y}L${x} ${y - 20}L${x + 8} ${y}Z`} fill="#ef5b5b" /><path d={`M${x - 5} ${y - 7}l9 -2M${x - 3} ${y - 13}l6 -1.5`} stroke="#ffd34d" strokeWidth="2" />
        <circle cx={x} cy={y - 21} r="2.6" fill="#ffd34d" />
      </g></g>
    );
  }
  return (
    <g className="pup-hat"><g transform={`rotate(${tilt} ${x} ${y})`}>
      <ellipse cx={x} cy={y} rx="17" ry="4" fill="#26303c" />
      <path d={`M${x - 10} ${y - 1}C${x - 11} ${y - 12} ${x - 7} ${y - 15} ${x} ${y - 13}C${x + 7} ${y - 15} ${x + 11} ${y - 12} ${x + 10} ${y - 1}Z`} fill="#33404f" />
      <path d={`M${x - 3} ${y - 13}q3 3 6 0`} stroke="#1c242e" strokeWidth="1.2" fill="none" />
      <path d={`M${x - 10} ${y - 4}h20`} stroke={BRASS} strokeWidth="2.4" />
    </g></g>
  );
}

export function Tie({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <path d={`M${x - 2.6} ${y}h5.2l-1 3h-3.2z`} fill={color} />
      <path d={`M${x - 1.6} ${y + 3}h3.2l2.4 11-4 3.6-4-3.6z`} fill={color} /><path d={`M${x - 1} ${y + 7}l3 2`} stroke="#fff" strokeOpacity=".35" strokeWidth="1" />
    </g>
  );
}

export function Bandana({ x, y, color }: { x: number; y: number; color: string }) {
  return <path d={`M${x - 8} ${y - 2}Q${x} ${y + 2} ${x + 8} ${y - 2}L${x + 1} ${y + 11}Z`} fill={color} stroke="#000" strokeOpacity=".12" />;
}
