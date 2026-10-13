import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

/**
 * Marcador LED de 7 segmentos (SVG propio): la firma del sistema BOX para precios por servicio, contadores y el panel.
 * Dibuja dígitos, punto de miles y guion; lo demás se ignora. Los segmentos apagados quedan visibles muy tenues, como
 * en un marcador de box. El color sale de tokens (`--led-*`, app/box.css): de noche brilla; de día es un display de
 * laboratorio con segmentos de tinta. La lectura completa va en `label` (lectores de pantalla).
 */
export type LedTone = "volt" | "chalk" | "amber" | "red";
export type LedMotion = "power" | "flip" | "none";

export interface LedProps {
  /** Lo que se dibuja: "1.830", "54.900", "18", "-". */
  value: string;
  /** Lectura completa para lectores de pantalla ("$ 1.830 por servicio"). */
  label: string;
  tone?: LedTone;
  motion?: LedMotion;
  className?: string;
}

const T = 6;
const h = (cy: number) => `4,${cy} ${4 + T / 2},${cy - T / 2} ${28 - T / 2},${cy - T / 2} 28,${cy} ${28 - T / 2},${cy + T / 2} ${4 + T / 2},${cy + T / 2}`;
const v = (cx: number, y1: number, y2: number) =>
  `${cx},${y1} ${cx + T / 2},${y1 + T / 2} ${cx + T / 2},${y2 - T / 2} ${cx},${y2} ${cx - T / 2},${y2 - T / 2} ${cx - T / 2},${y1 + T / 2}`;

/** Segmentos a·b·c·d·e·f·g. */
const SEGMENTS = [h(3), v(29, 4, 28), v(29, 30, 54), h(55), v(3, 30, 54), v(3, 4, 28), h(29)];
const DIGITS: Record<string, string> = {
  "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg", "5": "acdfg",
  "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg", "-": "g",
};
/** Contorno de varios segmentos como un solo trazo. */
const toPath = (keys: string) => SEGMENTS.filter((_, k) => keys.includes("abcdefg"[k]!)).map((pts) => `M${pts}Z`).join("");
const ALL = toPath("abcdefg");
const LIT: Record<string, string> = Object.fromEntries(Object.entries(DIGITS).map(([d, keys]) => [d, toPath(keys)]));
const lit = (c: string) => LIT[c]!;
const DIGIT_W = 40;
const DOT_W = 12;
const HEIGHT = 58;
const ANIM: Record<LedMotion, string | undefined> = { power: "led-power", flip: "led-flip", none: undefined };

/** Pesos enteros como los dibuja el marcador: "1.830" (el signo $ va aparte, en la display). */
export const ledMoney = (amount: number) => formatARS(amount).replace(/[^\d.]/g, "");

function layout(value: string) {
  let x = 0;
  const cells = [...value].filter((c) => c in DIGITS || c === "." || c === ",").map((c, i) => {
    const at = x;
    x += c in DIGITS ? DIGIT_W : DOT_W;
    return { c, at, i };
  });
  return { cells, width: x };
}

export function Led({ value, label, tone = "volt", motion = "power", className }: LedProps) {
  const { cells, width } = layout(value);
  const color = `var(--led-${tone})`;
  const anim = ANIM[motion];
  const glow = { filter: `drop-shadow(0 0 var(--led-glow) color-mix(in srgb, ${color} 55%, transparent))` };
  return (
    <svg role="img" aria-label={label} viewBox={`-2 -2 ${width + 10} ${HEIGHT + 4}`} className={cn("block h-10 w-auto overflow-visible", className)} style={{ color }}>
      <g transform="translate(8 0) skewX(-7)">
        {cells.map(({ c, at, i }) =>
          c in DIGITS ? (
            // Un trazo para los 7 segmentos apagados y otro para los prendidos: pocos nodos (va en cada tarjeta).
            <g key={i} transform={`translate(${at} 0)`}>
              <path d={ALL} fill="currentColor" style={{ opacity: "var(--led-off)" }} />
              <path d={lit(c)} fill="currentColor" className={anim} style={{ "--i": i, ...glow } as CSSProperties} />
            </g>
          ) : (
            <rect key={i} x={at + 1} y={HEIGHT - 6} width={6} height={6} fill="currentColor" className={anim} style={{ "--i": i } as CSSProperties} />
          ),
        )}
      </g>
    </svg>
  );
}

const SIGN: Record<LedTone, string> = { volt: "text-(--led-volt)", chalk: "text-(--led-chalk)", amber: "text-(--led-amber)", red: "text-(--led-red)" };

export interface LedPriceProps {
  amount: number;
  /** Se suma a la lectura: " por servicio". */
  suffix?: string;
  tone?: LedTone;
  motion?: LedMotion;
  className?: string;
  signClassName?: string;
}

/** Monto en el marcador: el signo $ en la display y los pesos en 7 segmentos. */
export function LedPrice({ amount, suffix = "", tone = "volt", motion, className, signClassName }: LedPriceProps) {
  return (
    <span className="flex items-end gap-1.5">
      <span aria-hidden="true" className={cn("font-display pb-[0.08em] text-2xl leading-none", SIGN[tone], signClassName)}>$</span>
      <Led value={ledMoney(amount)} label={`${formatARS(amount)}${suffix}`} tone={tone} motion={motion} className={className} />
    </span>
  );
}
