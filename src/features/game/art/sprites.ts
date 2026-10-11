import type { GameItemKind } from "@/demo/fixtures/game";

/**
 * Arte de Shaker Rush: cada objeto es una lista de capas (trazo SVG + color) en un lienzo de radio 20 centrado en
 * (0, 0). La misma receta se dibuja en el canvas con Path2D y en SVG para la leyenda y la tarjeta, así el juego y sus
 * instrucciones se ven idénticos. Lenguaje de la librería de envases: scoop colmado, cápsula bicolor, el rayo del logo.
 */
export interface Layer {
  d: string;
  fill?: string;
  stroke?: string;
  width?: number;
  alpha?: number;
  evenodd?: boolean;
}

export const ART = {
  volt: "#c8ff2e", voltSoft: "#e3ff8f", plasma: "#8b72ff", ion: "#2ee6d6", ink: "#eef1f5", night: "#0a0c10",
  cream: "#f1e7d0", gold: "#ffc93c", goldDeep: "#d98e0b", goldLight: "#fff3c4", ember: "#ff6b4a",
};

const SCOOP_BOWL = "M-18 0h26v11q0 9-9 9h-8q-9 0-9-9z";
const SCOOP_HANDLE = "M6 3h14a3 3 0 0 1 0 6H6z";
const SCOOP_HEAP = "M-21 2q1-16 16-18q15 2 16 18z";
const SCOOP_SHADE = "M1 0h7v11q0 9-9 9q3-5 2-20z";
const SPECKS = "M-12-6h.1M-4-11h.1M3-5h.1M-9-2h.1";
const SPARKLE = "M15-21l1.8 4.6 4.6 1.8-4.6 1.8-1.8 4.6-1.8-4.6-4.6-1.8 4.6-1.8z";

const scoop = (body: string, deep: string, heap: string): Layer[] => [
  { d: SCOOP_HANDLE, fill: deep },
  { d: SCOOP_BOWL, fill: body },
  { d: SCOOP_SHADE, fill: "#000", alpha: 0.22 },
  { d: "M-15 5v9", stroke: "#fff", width: 2.4, alpha: 0.4 },
  { d: SCOOP_HEAP, fill: heap },
  { d: "M-21 2q1-16 16-18q-9 6-10 18z", fill: "#fff", alpha: 0.35 },
  { d: "M-21 2h32", stroke: deep, width: 1.6, alpha: 0.55 },
  { d: SPECKS, stroke: deep, width: 2.4, alpha: 0.7 },
];

const CAPSULE = "M-12-8h24a8 8 0 0 1 0 16h-24a8 8 0 0 1 0-16z";
const BOLT = "M0-18.2H11.9L2.8-2.8H7.7L-11.9 18.2L-5.95 2.1H-10.5Z";
const DONUT = "M18 0a18 18 0 1 1-36 0a18 18 0 1 1 36 0zM5.5 0a5.5 5.5 0 1 0-11 0a5.5 5.5 0 1 0 11 0z";
const ICING = "M14-4q3 5-1 9q1 5-5 6q-3 4-8 2q-5 2-8-2q-5-1-5-6q-3-4 0-9q-1-5 4-7q3-4 8-2q5-2 8 2q5 1 7 7zM7 0a7 7 0 1 0-14 0a7 7 0 1 0 14 0z";

export const SPRITES: Record<GameItemKind, Layer[]> = {
  scoop: scoop(ART.volt, "#6f9900", ART.cream),
  golden: [
    { d: "M0-23a23 23 0 1 1 0 46a23 23 0 1 1 0-46z", fill: ART.gold, alpha: 0.1 },
    { d: "M0-23a23 23 0 1 1 0 46a23 23 0 1 1 0-46z", stroke: ART.gold, width: 1.6, alpha: 0.75 },
    ...scoop(ART.gold, ART.goldDeep, ART.goldLight),
    { d: SPARKLE, fill: "#fff" },
  ],
  capsule: [
    { d: CAPSULE, fill: "#f2f4f1" },
    { d: "M0-8h12a8 8 0 0 1 0 16H0z", fill: ART.plasma },
    { d: "M-19.75 2H19.75A8 8 0 0 1 12 8H-12A8 8 0 0 1-19.75 2z", fill: "#000", alpha: 0.18 },
    { d: "M-13-3.5h18", stroke: "#fff", width: 2.6, alpha: 0.6 },
  ],
  bolt: [
    { d: "M0-21a21 21 0 1 1 0 42a21 21 0 1 1 0-42z", fill: ART.plasma, alpha: 0.32 },
    { d: "M0-21a21 21 0 1 1 0 42a21 21 0 1 1 0-42z", stroke: ART.volt, width: 1.6, alpha: 0.7 },
    { d: BOLT, fill: ART.volt },
    { d: "M0-18.2H5L-4 2.1H-10.5Z", fill: "#fff", alpha: 0.45 },
  ],
  burger: [
    { d: "M-18 11h36q0 8-7 8h-22q-7 0-7-8z", fill: "#d48c3e" },
    { d: "M-19 3h38q2 0 2 3v2q0 3-2 3h-38q-2 0-2-3v-2q0-3 2-3z", fill: "#6b3b2a" },
    { d: "M-18 0h36l-6 7-5-4-7 6-6-5-6 5-6-5z", fill: "#ffcf4a" },
    { d: "M-20-3h40l-3 5-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3z", fill: "#5fae4f" },
    { d: "M-18-3q0-16 18-16t18 16z", fill: "#e3a456" },
    { d: "M-18-3q0-16 18-16q-12 4-12 16z", fill: "#fff", alpha: 0.18 },
    { d: "M-8-11h.1M0-14h.1M8-10h.1M-2-8h.1M5-15h.1", stroke: "#fff6e0", width: 2.2 },
  ],
  soda: [
    { d: "M1-13l5-9h3.5l-5 9z", fill: "#f2f4f1" },
    { d: "M-12-9h24l-3 26q-.4 3-3 3h-12q-2.6 0-3-3z", fill: "#ff4d5e" },
    { d: "M-11.3-1q5.6-4 11.3 0t11.3 0l-.8 8q-5.3-3.5-10.5 0t-10.5 0z", fill: "#fff" },
    { d: "M4-9h8l-3 26q-.4 3-3 3h-3q3-2 3-6z", fill: "#000", alpha: 0.2 },
    { d: "M-14-13h28q2 0 2 2v2h-32v-2q0-2 2-2z", fill: "#e6e8e4" },
  ],
  donut: [
    { d: DONUT, fill: "#d9a066", evenodd: true },
    { d: ICING, fill: "#ff7ab6", evenodd: true },
    { d: "M-9-7l2 2M-2-12l3-1M8-9l1 3M11 2l-2 2M4 10l3-1M-7 9l2 1M-12 1l1-3", stroke: "#fff", width: 1.8 },
    { d: "M-4-8l2 1M10-3l1 2M-11-4l2-1M0 11l2 0", stroke: ART.ion, width: 1.8 },
  ],
};

/** Shaker del jugador. Origen arriba al centro de la boca: 72 de ancho por 80 de alto. */
export const SHAKER_ART = {
  cup: "M-34 0H34L29 72Q28 80 20 80H-20Q-28 80-29 72Z",
  ring: "M-37-7h74q2 0 2 2v6q0 2-2 2h-74q-2 0-2-2v-6q0-2 2-2z",
  shine: "M-26 9L-22.5 68",
  rim: "M30.5 6L27 70",
  ticks: "M-30 22h8M-29 38h12M-28 54h8",
  mark: "M0-9.1H6L1.4-1.4H3.9L-6 9.1L-3 1H-5.3Z",
};

/** Batido dentro del vaso hasta `level` (0 a 1), sin recorte: el SVG no necesita un clipPath con id. */
export function liquidPath(level: number): string {
  const y = Math.min(72, 80 - Math.min(1, Math.max(0, level)) * 74);
  const hw = 34 - (5 * y) / 72;
  return `M${-hw} ${y}H${hw}L29 72Q28 80 20 80H-20Q-28 80-29 72Z`;
}
